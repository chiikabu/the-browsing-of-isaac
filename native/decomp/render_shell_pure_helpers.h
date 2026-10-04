#pragma once

#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

/* Pure subsets recovered from frame shell FUN_0080ea80 (VA 0x0080ea80 /
   RVA 0x40ea80) and residual body pure islands of FUN_00817830
   (VA 0x00817830). Freestanding translations of pure gates / islands after
   always-host prefixes only. Not a full Game::Render / frame-shell slice ABI
   and not wired into the Update frame path.

   Binary: tools/isaac-ng.unpacked.exe
   SHA-256: 5129DF723E645DAAEA59514394195F3EA1DCE1671BB0433D724648A845017200

   PE evidence (Capstone):
     output/decomp/5129df723e64/section-notes/render-advance-2/
     output/decomp/5129df723e64/section-notes/render-advance-3/
     output/decomp/5129df723e64/section-notes/render-advance-4/
     output/decomp/5129df723e64/section-notes/render-advance-5/
     output/decomp/5129df723e64/section-notes/render-advance-6/
     output/decomp/5129df723e64/section-notes/render-advance-7/
     output/decomp/5129df723e64/section-notes/render-advance-8/
     output/decomp/5129df723e64/section-notes/render-advance-9/
     output/decomp/5129df723e64/section-notes/render-advance-10/
     output/decomp/5129df723e64/section-notes/render-advance-11/
     output/decomp/5129df723e64/section-notes/render-alloc-v11/
     output/decomp/5129df723e64/section-notes/render-v12/
     output/decomp/5129df723e64/section-notes/render-v13/
     output/decomp/5129df723e64/section-notes/render-v14/
     output/decomp/5129df723e64/section-notes/render-v15/
     output/decomp/5129df723e64/section-notes/render-v16/
     output/decomp/5129df723e64/section-notes/render-v17/
     output/decomp/5129df723e64/section-notes/render-v18/
     output/decomp/5129df723e64/section-notes/render-v19/
     output/decomp/5129df723e64/section-notes/render-v20/
     output/decomp/5129df723e64/section-notes/render-v21-color/
     output/decomp/5129df723e64/section-notes/render-v21-quad/
     output/decomp/5129df723e64/section-notes/render-40c6f0/
     output/decomp/5129df723e64/section-notes/render-v23-dest/
     output/decomp/5129df723e64/section-notes/render-v24/

   Always-host prolog ends at the option gate (VA 0x0080eb1c). Common epilog
   join is LAB / VA 0x0080f1ce. Entity root Game::Render is VA 0x00806c20
   (exact ZHL); shell itself has no exact ZHL match.

   ABI v2 peels pure islands from the non-39 fade block
   VA 0x0080ecfb … 0x0080ee81 (before tree Erase). Host residuals remain:
   6f9400 / 6f95a0 (input poll), 74efd0 / 827bc0 (boost probe when mode not
   pure-open), and FUN_009956e0 color bind.

   ABI v3 peels the G8 aux nested path VA 0x0080f13a … 0x0080f176 (pure
   decision for FUN_00817830 after reusing G1/P4a/P4b) and the RT-pop depth
   pure fragment VA 0x0080f1b5 … 0x0080f1c9. Host residuals remain: nested
   6f9400/6f95a0 when poll needed, FUN_00817830 body, and RT bind/pop calls.

   ABI v4 peels FUN_00817830 entry pure islands after always-host
   Game::GetStageID @ 0x00738470 through special fade-blend t before host
   residual open 0x00817adc. Stack arg (caller push 1) is PE-unused (ret 4).

   ABI v5 peels residual open pure islands at VA 0x00817adc … pre-call
   0x00817b2f (manager frame→shader scales) and post-call pure gates
   G21–G23 before L-room / type-9 draw hosts.

   ABI v6 peels pure islands inside residual host body opaque_call_00a14050
   (VA 0x00a14050, callsite 0x00817b2f) plus post-return L-room init loop
   structure and type-9 float cell packs. Host residuals remain nested
   a159d0 / 416440 / a14270, GetLRoomAreaDesc, and a10690/a0f550/a10c00.

   ABI v7 peels complete freestanding body of opaque_call_00a159d0
   (VA 0x00a159d0, callsite 0x00a1405c inside a14050 / shell 0x00817b2f):
   case-fold path-sep string hash → shader_id. Host residuals remain
   416440 / a14270, GetLRoomAreaDesc @ 0x0081f8b0, and draw helpers.

   ABI v8 peels complete freestanding body of opaque_call_00416440
   (MSVC map lower_bound, VA 0x00416440, zero nested calls) plus pure
   islands inside residual a14270 found-path / size gate and complete pure
   islands of Room::GetLRoomAreaDesc @ 0x0081f8b0 (fallback AABB pack,
   grid index/idiv, cell floats). Host residuals remain a14270 insert/
   alloc/erase chain and any table-row load from live Room* when not
   sparsified.

   ABI v9 peels a14270 insert-path residual plan + post-alloc node init +
   insert_link (size++/parent link/empty install; pre-rebalance) plus
   GetLRoomAreaDesc table-row address and complete freestanding bodies of
   draw helpers opaque_call_00a10690 / 00a0f550 / 00a10c00 (zero nested
   calls). Host residuals remain alloc 0xa0f4c0, rebalance/rotate
   0x415bd0@0x415c1a + 0x415f80/0x415fe0 when parent color red, and
   size-throw 0x4170d0.

   ABI v10 peels complete freestanding bodies of MSVC tree rotate
   0x415f80 (right) / 0x415fe0 (left) and pure-complete rebalance residual
   of 0x415bd0 from VA 0x00415c1a through root blacken + ret (no nested
   host). Host residuals remain alloc 0xa0f4c0 (→0xa648b0) and size-throw
   0x4170d0.

   ABI v11 peels pure CF islands around residual host alloc 0xa0f4c0
   (thin wrapper → 0xa648b0) and size-throw 0x4170d0 on the a14270 insert
   path: size imm, pre-alloc map_head load, a0f4c0→a648b0 arg pack
   (cl=0 ALLOC, edx size_hi=0, stack arg1=0), a648b0 malloc-size formula
   for the request, and throw message VA ("map/set too long"). Host
   residuals remain the a648b0 malloc IAT body and 0x4170d0 IAT+int3.
   a14270 has no post-alloc null gate (uses EAX as node unconditionally).

   ABI v12 peels pure islands on the stage-overlay residual after G7 dual
   open (VA 0x0080ef1c…0x0080f12c): post-74ea50 AL gate, overlay scale,
   pre-floor X/Y float packs, post-floor /scale + camera add, Game+0x6edc/
   0x6ee0 stores, white color init at Game+0x6ee8, draw flag/order gates,
   clamp-arg VA, and AnimationState::Render dual-order plan. Host residuals
   remain 0x0074ea50, 0x00812d00, floor 0x00af0917, and 0x0040a030 draws.

   ABI v13 peels pure CF of exact ZHL Game::GetStageID @ 0x00738470 (mode
   0x2c / dim==2 / else plan) plus complete freestanding body of exact ZHL
   RoomConfig::GetStageID @ 0x0082d030 (zero nested calls) and pure islands
   of stage-overlay residual host 0x0074ea50 (difficulty/flag early-false,
   post-poll mode adjust + type gate before host 0x004217a0). Host residuals
   remain FUN_0074f690 (mode-44 type), 74ea50 nested 6f9400/6f95a0 + 4217a0,
   812d00, floor, AnimationState::Render.

   ABI v14 peels pure CF of mode-44 stage-type helper opaque_call_0074f690
   (VA 0x0074f690): early type/const-4 returns, optional host
   Game::GetRoomByIdx @ 0x00740bc0 when flag Game+0x183a0 clear, room-idx
   clamp from RoomDescriptor, stage<=6 / stage∈{7,8} float-table paths with
   PE 5×5 tables at 0xb6a878 / 0xb6a8e0, and stage 7/8 grid-distance near
   return 4. Host residual: GetRoomByIdx body only when entry plan GETROOM.

   ABI v15 peels pure CF islands of exact ZHL Game/Level::GetRoomByIdx @
   0x00740bc0: dimension default/range, special idx -100/-101 plans, idx
   range [-20,168], negative-slot and grid-slot Game-relative offsets, empty
   RoomDescriptor VA, walk-match predicates, once-init needed gate. Full
   body remains host for once-init TLS construct chain, recursive special
   paths, and unsparsified walk/list. Host residual: full GetRoomByIdx body
   when plan is RECURSE/WALK or once-init, else pure with sparse slot.

   ABI v16 peels complete freestanding pure bodies of residual hosts
   opaque_call_00812d00 (overlay Vector* producer; zero nested calls) and
   opaque_call_004217a0 (challenge bitset probe; zero nested calls). Host
   residuals remain 74ea50 nested polls (6f9400/6f95a0), floor, AnimationState
   ::Render, GetRoomByIdx once-init/recurse/walk, a14270 heap.

   ABI v17 peels address-stable pure islands of residual poll hosts
   FUN_006f9400 / FUN_006f95a0 as consumed inside opaque_call_0074ea50
   (and fade/aux poll sites): map-node present, gate39, mask assembly, and
   complete pure AL for 74ea50 given sparse presence + bitset. Semantics
   match ProcessInput pure peels (isaac_input_mask_*); freestanding re-
   reason for render path, not a mechanical copy. Host residual for polls:
   map lower_bound 0x004288a0 per action id when presence not sparsified.
   With sparse presence + bitset, 74ea50 is pure-complete (4217a0 pure v16).
   Other residuals: floor, AnimationState::Render, GetRoom once-init/
   recurse/walk, a14270 heap.

   ABI v18 peels pure CF of exact ZHL AnimationState::Render @ 0x0040a030
   (anim null / layer-count gates, layer this + frame-index pack, loop step).
   Nested residual per layer: opaque_call_00409120 (RenderFrame-shaped; no
   exact ZHL on this hash — stack frame imm differs from catalog pattern).
   When anim null or layer_count==0, Render is pure-complete. Other residuals:
   floor, GetRoom once-init/recurse/walk, a14270 heap, map lower_bound.

   ABI v19 peels pure CF islands of residual opaque_call_00409120
   (VA 0x00409120, AnimationLayer::RenderFrame-shaped nested layer body):
   entry visibility / frame-range / frame-visible / layer-state-visible
   gates, frame ptr (×0x6c) + LayerState ptr (×0xa0) packs, flags OR,
   flag-bit4 early-out with sparse DAT_00c7977e, post-sprite continue,
   color residual path plan. When entry plan SKIP, pure-complete (no host).
   Host residual opens at 0x00408590 (sprite sheet) then color/quad/draw
   chain (0x4071c0/0x4072e0/0x4098a0 GetSourceQuad / 0x409cb0 / …).

   ABI v20 peels pure CF islands of residual opaque_call_00408590
   (VA 0x00408590, sprite SharedPtr / cache residual of 409120):
   sprite present, pair-A/B cache equal + update-needed, residual plan
   (PURE_NULL / COPY / VT44 / VT48 / VT_BOTH), pure pair cache stores,
   nested 0x40c550 SharedPtr zero + null-control pure island. When plan
   PURE_NULL, pure-complete (zero out). Host residuals: vtable +0x44/+0x48
   on cache miss; 0x40c550 when SharedPtr control non-null.

   ABI v21 peels complete freestanding pure bodies of color residual
   opaque_call_004071c0 (0x2c byte ColorMod copy; zero nested calls) and
   opaque_call_004072e0 (stack Color × other via nested pure
   opaque_call_006831c0 mul-blend then copy to dest). Nested 0x6831c0 is
   pure-complete (tint mul + offset SKIP/COPY/AVERAGE + tail add).

   ABI v22 peels exact ZHL AnimationLayer::GetSourceQuad @ 0x004098a0
   (complete pure body + residual RNG plan when flags&2) and pure CF
   islands of dest-quad residual opaque_call_00409cb0 (GetDestQuad-
   shaped; no exact ZHL — stack-frame imm differs). Host residual:
   GetSourceQuad RNG assert log 0xa112c0 when seed zero; dest-quad body
   hosts a0f550/a10d00/a10950/a10760.

   ABI v23 peels complete freestanding pure body of color-ring residual
   opaque_call_0040c6f0 (DAT_c78db4..c78dc0 ring index + table load;
   zero nested calls). COLOR_HOST path is pure-complete when ring state
   is sparsified. Other residuals: dest-quad body hosts, GetSourceQuad
   assert, draw/floor/GetRoom/heap.

   ABI v24 peels complete freestanding pure bodies of dest-quad nested
   residuals opaque_call_00a10d00 (AABB quad + 4× color pack; zero nested
   calls), opaque_call_00a10950 (scale-about-offset; zero nested calls),
   and opaque_call_00a10760 (rotate-about-pivot via CRT cos/sin wrappers
   0x41d540/0x41d520). Whole 409cb0 glue body not yet a single pure
   compute export. Other residuals: GetSourceQuad a112c0 when seed 0,
   409cb0 entry position packs as monolithic residual, draw/floor/
   GetRoom/heap.

   ABI v25 closes opaque_call_00409cb0 (VA 0x00409cb0…0x0040a021, ret 0x1c)
   as a single pure-complete compute. Every call on its root path is now a
   translated pure body: 0xa0f550 (v9), 0xa10d00 / 0xa10950 ×2 / 0xa10760 ×2
   (v24). New islands: camera-base select from DAT_c71678/DAT_c33910 with
   DAT_c7b640/44 fallback, the bit8 four-scale pack + four sign flips, the
   two-stage span fold under the strict-negative scale tests, rotation
   parity (negX ^ negY), pivot pair, clamp corner pack, DAT_00baa088
   degree→radian, and the whole-body writer. Plan flips HOST_BODY → PURE.
   Residual hosts elsewhere in the render shell are unchanged.

   ABI v26 closes three residuals left by v20/v12.

   (a) opaque_call_0040c550 (VA 0x0040c550…0x0040c5aa, ret 4) — SharedPtr
   copy/AddRef. v20 had only the entry zero, the src-control null gate and
   the final assign. v26 adds the full continuation chain: src control
   vtable slot +0x04 (AddRef-shaped bool), the post-call abort gate
   (`test al,al` → dest stays zeroed and no assign happens), the dest
   control vtable slot +0x0c, the DAT_00c7163c cdecl hook gate, and an
   apply that reproduces every memory effect from three sampled indirect
   results. The PE zeroes [dest+4] at entry, but [dest+4] is re-read AFTER
   the +0x04 call, so the model recaptures it instead of folding it to 0.
   Indirect targets are NOT named — the two vtable slots and the hook DAT
   stay address-stable host actions.

   (b) opaque_call_00408590 (VA 0x00408590…0x0040862f, ret 4) — v20 chose
   pair-A and pair-B from one pre-call snapshot. The PE reloads the sprite
   pointer from [this+0x98] at VA 0x004085de, after the +0x44 call, so
   pair-B is a post-call decision. v26 splits the plan into an entry phase
   and a post-A phase keyed on the recaptured sprite, and records that the
   pair-A cache store targets the PRE-call sprite ([ebp-8]) while the
   pair-B store targets the recaptured one. The duplicated compare at
   VA 0x004085c2/0x004085fc is provably always false on the fall-through
   path; it is exported so the test can pin that rather than assume it.

   (c) 0x00af0917 is an IAT thunk `jmp [0x00b18840]`, resolved from the PE
   import directory to `floor` in api-ms-win-crt-math-l1-1-0.dll — a leaf
   IEEE rounding primitive, not an OS call. The stage-overlay call site
   widens float32→double exactly (fld dword / fstp qword), calls floor,
   then narrows with fstp dword. floor of a float32 is always exactly
   representable in float32, so the narrowing rounding mode cannot matter
   and (float)floor((double)v) == round-toward-negative-infinity of v.
   Translated exactly, including -0.0 and NaN. The stage-overlay draw
   position becomes pure-complete (no sampled floor results).

   ABI v27 closes the mode-44 / GetRoomByIdx cluster, the last non-allocator
   host group in this section.

   (a) opaque_call_0074f690 (VA 0x0074f690…0x0074f813): v14 resolved the whole
   helper from one `stage_0` snapshot, but [this+0] is read twice — at
   VA 0x0074f6ad for the -10 gate (before any call) and again at
   VA 0x0074f6f0 for the stage dispatch (after the GetRoomByIdx call on the
   same `this`). The float tables at +0x183b0 / +0x18654 and the slot field
   at +0x18314/+0x14 are likewise post-call reads indexed by the post-call
   clamped room index. v27 adds a resolve that takes the entry and post-call
   stage separately and indexes the arrays in-model. v14's resolve is kept
   unchanged so downstream does not break.

   (b) Game/Level::GetRoomByIdx @ 0x00740bc0 (exact ZHL) once-init: the guard
   epoch DAT_00c8108c is compared to the TLS block at VA 0x00740bf3, and then
   RE-READ at VA 0x00740d50 after the guard-header call and compared against
   -1. A racing thread that finished the init first makes the second read
   differ from the first, so construct-or-skip is a post-call decision. v27
   models it as plan + resume. `RoomDescriptor::constructor` @ 0x006ef590 is
   an exact ZHL match; the guard header/footer and the atexit registrar have
   no ZHL and stay address-stable.

   (c) The -101 walk at VA 0x00740c94 loads a POINTER from the slot
   (`mov edx,[eax]`) and tests +8 / +0x10 through it. v15's walk_match took
   the two fields directly, leaving the indirection to the caller. v27 adds a
   memory-driven walk that performs the two-level read, and pins the pointer
   offset. Recursion (-100 / -101) re-enters the whole function including the
   once-init gate, so it is driven as a bounded continuation with per-entry
   recaptured inputs rather than inlined.

   The a14270 allocator chain 0xa0f4c0 -> 0xa648b0 and the size-throw
   0x4170d0 remain host by standing decision: raw allocation is a platform
   primitive, not untranslated game logic.

   ABI v28 recovers RoomDescriptor::constructor @ 0x006ef590 (exact ZHL),
   the once-init side effect from v27 and the last non-vtable, non-allocator,
   non-CRT body reachable from this section.

   Layout proof. Every field below is proven from the store width and offset
   arithmetic in the body; the object size 0xb8 is confirmed independently by
   the descriptor stride already recovered in Game::GetRoomByIdx (v15
   SLOT_STRIDE / v27 WALK_STRIDE = 0xb8) and by all three of that function's
   return forms resolving to `game + 0x14 + slot*0xb8`.

     +0x00/+0x04/+0x08  dword  = -1     +0x0c              dword = 0
     +0x10              dword  = 0      +0x14/+0x18        dword = 0
     +0x1c..+0x38 (8)   dword  = -1     +0x3c/+0x40/+0x44  dword = 0
     +0x48..+0x64 (8)   dword  = 0      +0x68/+0x6c/+0x70  aligned grid array
     +0x74/+0x78/+0x7c  std::vector<EntitySaveState>
     +0x80/+0x84        tree head node + size
     +0x88/+0x8c/+0x90  std::vector<EntitySaveState>
     +0x94..+0xa3       movups 16 zero bytes
     +0xa4..+0xab       NEVER WRITTEN by the constructor (8-byte hole)
     +0xac/+0xae        word  = 0xffff  +0xb0 dword = 0   +0xb4 dword = -1

   Readers proving the meaningful fields, all inside this section:
     +0x00  opaque_call_0074f690 @ 0x0074f6da clamps it into [0,0xa8] and
            uses it as a room index; the ctor's -1 is the "none" value.
     +0x0c  GetRoomByIdx walk @ 0x00740c94 requires it to be 0.
     +0x10  opaque_call_0074f690 @ 0x0074f6d4 gates on it being non-zero, and
            the walk @ 0x00740c9a loads it AS A POINTER and dereferences +8 /
            +0x10 through it. The ctor stores a plain 0, which is exactly why
            the static empty descriptor fails both tests. This independently
            confirms the v27 two-level-dereference finding.

   The vector element type is not a guess: the destroy loops call
   0x004d6ee0 = EntitySaveState::destructor (exact ZHL) and the capacity
   arithmetic divides by 0x78, so both vectors are vector<EntitySaveState>
   with sizeof == 0x78.

   Still host inside the ctor: allocator 0xa0f4c0 (standing decision), vector
   grow 0x00708eb0 and tree clear 0x00424540 (no ZHL, address-stable),
   EntitySaveState::destructor 0x004d6ee0, and the allocation-failure IAT
   0x00b18894 -> _invalid_parameter_noinfo_noreturn.

   Post-call discipline: [this+0x74]/[this+0x78] and [this+0x88]/[this+0x8c]
   are re-read at VA 0x006ef71e / 0x006ef776 AFTER the allocator and grow
   calls, so the destroy-loop trip counts are recaptured, never folded to the
   zeroes written moments earlier.

   ABI v29 is a correctness fix, not a new boundary. The stale-state audit
   flagged G4 (VA 0x0080eead-0x0080eed1) as SUSPECTED; the instruction stream
   CONFIRMS it, and shows a second re-read the audit did not flag:

     0x0080eea0  xor esi, esi                    ; i = 0
     0x0080eead  cmp [Game+0x1264], esi          ; entry gate, UNSIGNED jbe
     0x0080eebc  mov eax, [Game+0x125c]          ; array base RE-READ per iter
     0x0080eec2  push [eax + esi*4]              ; entity[i]
     0x0080eec5  call 0x00806c20                 ; HOST Game::Render
     0x0080eeca  inc esi
     0x0080eecb  cmp esi, [Game+0x1264]          ; count RE-READ, UNSIGNED jb

   Both the count AND the array base are re-derived after every host call, so
   Game::Render growing or shrinking the entity list changes the trip count
   and can move the array. The v1 doc comment said "for i in [0, count)",
   which is the folded-bound reading; a consumer implementing from it would
   snapshot the bound once. The boolean export itself was correct as an entry
   gate and is retained unchanged.

   v29 adds entity_loop_step / entity_loop_arg / entity_loop_run so the
   recapture is expressible, and corrects the comment. Not Update-wired.

   ABI v29 also peels the pure islands of 0x00708eb0, the vector grow left host

   by v28 inside RoomDescriptor::constructor. No exact ZHL. Its arithmetic is

   fully translatable: the current size uses the SAME signed /0x78 magic

   sequence already recovered at v28, the max-size gate is

   `cmp want, 0x2222222; ja throw` (0x2222222 * 0x78 = 0xfffffff0, i.e. the

   largest byte count that does not overflow 32 bits), and the byte size is

   `((want << 4) - want) << 3` = want * 0x78. Allocation 0x0040cf00, per

   element copy 0x004d3130 and the install 0x004d7340 stay host.

   ABI v30 sparsifies the live DAT_00c35b80 row load of Room::GetLRoomAreaDesc
   (VA 0x0081f8b0): the row-window read that was the last host piece of the
   success path becomes an explicit plan + read + resume group.
   The PE reads the row in one burst (VA 0x0081f8dc...0x0081f903) from
   row = (type << 5) + DAT_00c35b80 after the unsigned type-range gate
   (VA 0x0081f8c7: lea [type-9]; cmp 3; ja fallback). Per the recapture
   discipline of game_render_slice.h, every value consumed AFTER the row-load
   boundary is a parameter: the 8 row dwords are never folded from a pre-
   boundary snapshot. The new group exposes:
   - row_needed(type): the PE gate, 1 iff type - 9 unsigned <= 3
     (same immediates as G21 at VA 0x00817b3d; the wrap-identical signed
     reading is noted in the test, not silently assumed);
   - load_plan(type, table_sparsified): FALLBACK (pure AABB, no row) /
     PURE (row window supplied as a runtime input at the P38 address) /
     LIVE (the DAT read stays host; after it the 8 recaptured row dwords are
     the lroom_pack parameters);
   - row_read(row_addr, out8): the explicit sparsified row-window read --
     out8[i] = int32_le(row_addr + 4i), i in [0,8), exactly the PE's eight
     dword loads (offsets 0x00..0x1c), including the PE's signed use of the
     dwords as grid coordinates (fixed cases pin 0x80000000-family values
     on the bounds path);
   - lroom_from_row(row_addr, width, height, out8): the resume entry --
     row_read then lroom_pack; 1 when a row was read, 0 on a null window
     (the PE would fault; the pure model no-ops instead).
   Existing helpers P30-P35/P38 are unchanged. Not Update-wired; not a
   render slice ABI.

   ABI v31 peels the pure decision surface of the opaque_call_00a14050 chain
   (VA 0x00a14050, 37 call sites incl. the frame-shell site at VA 0x00817b2f
   under FUN_0080ea80 -> FUN_00817830). The body is: a159d0 string hash
   (v7 pure) -> 416440 lower_bound (v8 pure) -> G24 gates -> a14270
   value slot (v8-v11 pure found path; INSERT/THROW host) -> G25 bind.
   With the map sparsified the a14270 inner 416440 re-walk provably returns
   the SAME bound as walk #1 (no writes between VA 0x00a14073 and the inner
   walk at VA 0x00a142a2), so on the G24-passing path the inner miss branch
   is impossible: a14050 NEVER reaches the a14270 size-throw (0x4170d0) or
   alloc (0xa0f4c0 -> 0xa648b0) edges. The chain plan is consequently a
   two-code decision (FAIL / FOUND); the typed continuation is the resume
   entry which consumes the RECAPTURED map-value-slot dword (bound+0x14)
   and the flag byte (slot value +4), never a pre-call snapshot. The
   alloc/throw edges stay host (raw alloc = platform primitive per standing
   policy) for the a14270 family's other four call sites.

   ABI v32 pins GetSourceQuad zero-seed assert count (2) on 0x4098a0.
   ABI v33 narrows FUN_00827bc0 probe-B. ABI v34 peels FUN_00a140c0
   ring-matrix bind. ABI v35 peels FUN_00a14200 shader-stack pop +
   684fc0 peek. ABI v36 peels FUN_00a14250 thin +0x14 wrap. ABI v37
   peels FUN_00a14330 map operator[]. ABI v38 peels FUN_00a143f0 map
   find-or-insert (pair<node, inserted>). Alloc 0xa0f4c0 + throw
   0x4170d0 stay host. ABI v39 peels FUN_00a145e0 scalar deleting dtor
   (typed plan): unconditional vftable store 0xb81bac, three-call
   subobject dtor sequence a149a0(this) / 4149d0(+0x40) / a15310(+0x34),
   low-byte delete gate, sized free (0x4c via aef15c) when flag bit 0.
   NEXT_VA 0x00a14620. ABI v48 peels FUN_00a15550 (float clamp01:
   maxss [0xba9fe4]=0.0f / minss [0xbaa454]=1.0f / ret; second-operand
   NaN + both-zero semantics; single caller 0x7734e6). */

enum { ISAAC_RENDER_SHELL_PURE_HELPERS_ABI_VERSION = 74 };

/* Stage id compared at VA 0x0080ecb6 (imm 0x39). */
enum { ISAAC_RENDER_SHELL_STAGE_SPECIAL_39 = 0x39 };

/* Nested stage-overlay room type imm at VA 0x0080ef18 (0x59). */
enum { ISAAC_RENDER_SHELL_OVERLAY_ROOM_TYPE_59 = 0x59 };

/* Game+8 value that opens the stage-overlay triple gate (VA 0x0080ef08). */
enum { ISAAC_RENDER_SHELL_OVERLAY_GAME_MODE_5 = 5 };

/* Non-39 fade boost modes (VA 0x0080ed58 / 0x0080ed5d). */
enum {
  ISAAC_RENDER_SHELL_FADE_BOOST_MODE_8 = 8,
  ISAAC_RENDER_SHELL_FADE_BOOST_MODE_1D = 0x1d
};

/* Force-full gate (VA 0x0080edb5 / 0x0080edbc): Manager dword0 / dword1. */
enum {
  ISAAC_RENDER_SHELL_FADE_FORCE_MGR0 = 0x0d,
  ISAAC_RENDER_SHELL_FADE_FORCE_MGR1 = 1
};

/* DAT_00baa454 / DAT_00baa304 bit patterns (hash-bound). */
enum {
  ISAAC_RENDER_SHELL_F32_ONE_BITS = 0x3f800000u,      /* 1.0f */
  ISAAC_RENDER_SHELL_F32_BOOST_ADD_BITS = 0x3f19999au /* ~0.6f */
};

/* FUN_00817830 body pure (hash-bound PE). */
enum {
  /* Stage config row stride: imul [Game+0x1d18], 0x13c @ VA 0x0081785f. */
  ISAAC_RENDER_SHELL_817830_STAGE_STRIDE = 0x13c,
  /* Stage id that forces color pack DAT_00bac350 @ VA 0x00817a73. */
  ISAAC_RENDER_SHELL_817830_STAGE_2C = 0x2c,
  /* GetStageID special membership (VA 0x00817877…0x0081788b). */
  ISAAC_RENDER_SHELL_817830_STAGE_ID_4 = 4,
  ISAAC_RENDER_SHELL_817830_STAGE_ID_5 = 5,
  ISAAC_RENDER_SHELL_817830_STAGE_ID_6 = 6,
  ISAAC_RENDER_SHELL_817830_STAGE_ID_1B = 0x1b,
  ISAAC_RENDER_SHELL_817830_STAGE_ID_1C = 0x1c,
  /* L-room type range base (VA 0x00817b3d: add -9 / cmp 3). */
  ISAAC_RENDER_SHELL_817830_LROOM_TYPE_BASE = 9,
  /* Inclusive span: type ∈ [9, 9+3] = [9,12]. */
  ISAAC_RENDER_SHELL_817830_LROOM_TYPE_SPAN = 3,
  /* Type-9 exclusive branch (VA 0x00817bdf). */
  ISAAC_RENDER_SHELL_817830_ROOM_TYPE_9 = 9,
  /* Post-GetLRoomAreaDesc init: 12× a10690 unit quads (VA 0x00817b5f). */
  ISAAC_RENDER_SHELL_817830_LROOM_QUAD_COUNT = 0x0c,
  /* Per-quad object stride after a10690 (VA 0x00817b8e). */
  ISAAC_RENDER_SHELL_817830_LROOM_QUAD_STRIDE = 0x24,
  /* Flag byte cleared after each quad ctor (VA 0x00817b8a: [edi+0x20]←0). */
  ISAAC_RENDER_SHELL_817830_LROOM_QUAD_FLAG_OFF = 0x20,
  /* Second init: 6× (a0f550 + a10c00) pairs (VA 0x00817b9c). */
  ISAAC_RENDER_SHELL_817830_LROOM_PAIR_COUNT = 6,
  /* Pair object stride (VA 0x00817bbd). */
  ISAAC_RENDER_SHELL_817830_LROOM_PAIR_STRIDE = 0x70,
  /* a0f550 stack arg imm (VA 0x00817ba0: push -1). */
  ISAAC_RENDER_SHELL_817830_LROOM_A0F550_ARG = -1,
  /* DAT_00baa2d0 / DAT_00baa8d0 / DAT_00bac350 / residual scales. */
  ISAAC_RENDER_SHELL_F32_HALF_BITS = 0x3f000000u,       /* 0.5f */
  ISAAC_RENDER_SHELL_F32_THIRTY_BITS = 0x41f00000u,     /* 30.0f */
  ISAAC_RENDER_SHELL_F32_HUNDREDTH_BITS = 0x3c23d70au,  /* 0.01f DAT_00baa06c */
  ISAAC_RENDER_SHELL_F32_TENTH_BITS = 0x3dcccccdu,      /* 0.1f  DAT_00baa120 */
  ISAAC_RENDER_SHELL_F32_COLOR_R_2C_BITS = 0x3f800000u, /* 1.0f */
  ISAAC_RENDER_SHELL_F32_COLOR_G_2C_BITS = 0x3e99999au, /* ~0.3f */
  ISAAC_RENDER_SHELL_F32_COLOR_B_2C_BITS = 0x3e99999au, /* ~0.3f */
  ISAAC_RENDER_SHELL_F32_COLOR_A_2C_BITS = 0x3f800000u, /* 1.0f */
  /* opaque_call_00a159d0 (VA 0x00a159d0) string hash. */
  ISAAC_RENDER_SHELL_A159D0_SEED = 0x1505,
  /* Path separator normalize: '\\' → '/' (imm edi=0x2f). */
  ISAAC_RENDER_SHELL_A159D0_PATH_SEP_FROM = 0x5c,
  ISAAC_RENDER_SHELL_A159D0_PATH_SEP_TO = 0x2f,
  /* Hash-bound PE hash of "KAGE_ColorTextureShader" @ 0xb1a5b0. */
  ISAAC_RENDER_SHELL_A159D0_KAGE_SHADER_HASH = 0xb3d14323u,
  /* MSVC map/tree node layout (opaque_call_00416440 / a14270). */
  ISAAC_RENDER_SHELL_MAP_LEFT_OFF = 0,
  ISAAC_RENDER_SHELL_MAP_PARENT_OFF = 4,
  ISAAC_RENDER_SHELL_MAP_RIGHT_OFF = 8,
  ISAAC_RENDER_SHELL_MAP_COLOR_OFF = 0xc,
  ISAAC_RENDER_SHELL_MAP_ISNIL_OFF = 0xd,
  ISAAC_RENDER_SHELL_MAP_KEY_OFF = 0x10,
  ISAAC_RENDER_SHELL_MAP_VALUE_OFF = 0x14,
  /* a14270 size guard imm (VA 0x00a142b7). */
  ISAAC_RENDER_SHELL_A14270_SIZE_FULL = 0x0aaaaaaau,
  /* a14270 host alloc push imm (VA 0x00a142cc). */
  ISAAC_RENDER_SHELL_A14270_ALLOC_SIZE = 0x18,
  /* a14270 residual plan codes (ABI v9). */
  ISAAC_RENDER_SHELL_A14270_PLAN_FOUND = 0,
  ISAAC_RENDER_SHELL_A14270_PLAN_THROW = 1,
  ISAAC_RENDER_SHELL_A14270_PLAN_INSERT = 2,
  /* MSVC _Tree color bytes (ABI v10): 0 = red, 1 = black. */
  ISAAC_RENDER_SHELL_MAP_COLOR_RED = 0,
  ISAAC_RENDER_SHELL_MAP_COLOR_BLACK = 1,
  /* ABI v11: residual host VAs on a14270 insert / throw path. */
  ISAAC_RENDER_SHELL_HOST_ALLOC_VA = 0x00a0f4c0u,   /* thin → a648b0 */
  ISAAC_RENDER_SHELL_HOST_HEAP_VA = 0x00a648b0u,    /* tracked malloc body */
  ISAAC_RENDER_SHELL_HOST_THROW_VA = 0x004170d0u,   /* map/set too long */
  /* a0f4c0 → a648b0 pure args (VA 0x00a0f4c6…0x00a0f4cf). */
  ISAAC_RENDER_SHELL_A0F4C0_A648B0_CL = 0,          /* MODE_ALLOC */
  ISAAC_RENDER_SHELL_A0F4C0_A648B0_ARG1 = 0,        /* push 0 before size */
  ISAAC_RENDER_SHELL_A0F4C0_A648B0_SIZE_HI = 0,     /* xor edx,edx */
  /* a648b0 header over-alloc (PE: malloc_size = size_lo + 4). */
  ISAAC_RENDER_SHELL_A648B0_HEADER_SIZE = 4,
  /* 0x4170d0 push imm: .rdata "map/set too long" (hash-bound). */
  ISAAC_RENDER_SHELL_A14270_THROW_MSG_VA = 0x00b1b160u,
  /* ABI v12: stage-overlay residual after G7 dual (hash-bound PE). */
  ISAAC_RENDER_SHELL_HOST_74EA50_VA = 0x0074ea50u,  /* overlay predicate */
  ISAAC_RENDER_SHELL_HOST_812D00_VA = 0x00812d00u,  /* pure-complete v16 */
  ISAAC_RENDER_SHELL_HOST_FLOOR_VA = 0x00af0917u,   /* floor() */
  ISAAC_RENDER_SHELL_HOST_ANIM_RENDER_VA = 0x0040a030u, /* AnimationState::Render */
  ISAAC_RENDER_SHELL_OVERLAY_CLAMP_VA = 0x00c7b640u,    /* topLeft/bottomRight */
  /* Game field offsets used by stage-overlay residual. */
  ISAAC_RENDER_SHELL_OVERLAY_SCALE_X_OFF = 0x6edc,
  ISAAC_RENDER_SHELL_OVERLAY_SCALE_Y_OFF = 0x6ee0,
  ISAAC_RENDER_SHELL_OVERLAY_COLOR_OFF = 0x6ee8,
  ISAAC_RENDER_SHELL_OVERLAY_COLOR_SIZE = 0x2c,
  ISAAC_RENDER_SHELL_OVERLAY_DRAW_FLAG_OFF = 0x6f49,
  ISAAC_RENDER_SHELL_OVERLAY_SWAP_FLAG_OFF = 0x6eb0,
  ISAAC_RENDER_SHELL_OVERLAY_ANIM_A_OFF = 0x6e70, /* draw order when swap=0 */
  ISAAC_RENDER_SHELL_OVERLAY_ANIM_B_OFF = 0x6e90, /* first when swap!=0 */
  /* Draw residual plan codes (ABI v12). */
  ISAAC_RENDER_SHELL_OVERLAY_PLAN_SKIP = 0,
  ISAAC_RENDER_SHELL_OVERLAY_PLAN_ORDER_A = 1, /* A then B (swap clear) */
  ISAAC_RENDER_SHELL_OVERLAY_PLAN_ORDER_B = 2, /* B then A (swap set) */
  /* ABI v13: Game::GetStageID @ 0x00738470 plan codes. */
  ISAAC_RENDER_SHELL_GET_STAGE_ID_PLAN_PURE_DIM2 = 0, /* return 0x23 pure */
  ISAAC_RENDER_SHELL_GET_STAGE_ID_PLAN_MODE44 = 1,    /* host 74f690 + 82d030 */
  ISAAC_RENDER_SHELL_GET_STAGE_ID_PLAN_RC = 2,        /* pure RoomConfig path */
  /* Mode-44 gate imm (Manager/Game+0x26584). */
  ISAAC_RENDER_SHELL_GET_STAGE_ID_MODE_44 = 0x2c,
  /* Dim==2 pure result (VA 0x007384a7). */
  ISAAC_RENDER_SHELL_GET_STAGE_ID_DIM2_RESULT = 0x23,
  /* Dimension that short-circuits GetStageID (Game+0x1830c). */
  ISAAC_RENDER_SHELL_GET_STAGE_ID_DIM_2 = 2,
  /* RoomConfig::GetStageID stack Mode autos (VA 0x0082d036 / 0x0082d060). */
  ISAAC_RENDER_SHELL_82D030_MODE_AUTO = -1,
  ISAAC_RENDER_SHELL_82D030_MODE_GREED_FORCE = 1,
  /* Difficulty values that select greed path when Mode==-1 (0x269c8). */
  ISAAC_RENDER_SHELL_82D030_DIFF_GREED_A = 2,
  ISAAC_RENDER_SHELL_82D030_DIFF_GREED_B = 3,
  /* Host residuals on GetStageID / 74ea50 paths (ABI v13). */
  ISAAC_RENDER_SHELL_HOST_GET_STAGE_ID_VA = 0x00738470u,
  ISAAC_RENDER_SHELL_HOST_74F690_VA = 0x0074f690u,
  ISAAC_RENDER_SHELL_HOST_82D030_VA = 0x0082d030u, /* pure-complete body */
  ISAAC_RENDER_SHELL_HOST_4217A0_VA = 0x004217a0u, /* pure-complete v16 */
  /* 74ea50 pure residual plan codes. */
  ISAAC_RENDER_SHELL_74EA50_PLAN_FALSE = 0, /* pure AL=0 */
  ISAAC_RENDER_SHELL_74EA50_PLAN_POLL = 1,  /* need sparse presence / lower_bound then pure masks */
  ISAAC_RENDER_SHELL_74EA50_PLAN_PROBE = 2, /* post-poll pure open → pure 4217a0 */
  /* 74ea50 flag bit and type gate imms. */
  ISAAC_RENDER_SHELL_74EA50_FLAG_BIT = 0x10000u,
  ISAAC_RENDER_SHELL_74EA50_MODE_TARGET = 6,
  ISAAC_RENDER_SHELL_74EA50_TYPE_4 = 4,
  ISAAC_RENDER_SHELL_74EA50_TYPE_5 = 5,
  ISAAC_RENDER_SHELL_74EA50_PROBE_ARG = 0x2f,
  /* ABI v17: residual poll hosts + map lower_bound (no exact ZHL). */
  ISAAC_RENDER_SHELL_HOST_6F9400_VA = 0x006f9400u, /* pure mask; LB host */
  ISAAC_RENDER_SHELL_HOST_6F95A0_VA = 0x006f95a0u, /* pure mask; LB host */
  ISAAC_RENDER_SHELL_HOST_4288A0_VA = 0x004288a0u, /* map lower_bound residual */
  /* Action ids looked up by 6f9400 (mask A). */
  ISAAC_RENDER_SHELL_POLL_A_ID_38 = 0x38,
  ISAAC_RENDER_SHELL_POLL_A_ID_39 = 0x39,
  ISAAC_RENDER_SHELL_POLL_A_ID_3A = 0x3a,
  ISAAC_RENDER_SHELL_POLL_A_ID_3B = 0x3b,
  ISAAC_RENDER_SHELL_POLL_A_ID_3C = 0x3c,
  ISAAC_RENDER_SHELL_POLL_A_ID_3D = 0x3d,
  ISAAC_RENDER_SHELL_POLL_A_ID_3E = 0x3e,
  /* Action ids looked up by 6f95a0 (mask B). */
  ISAAC_RENDER_SHELL_POLL_B_ID_3F = 0x3f,
  ISAAC_RENDER_SHELL_POLL_B_ID_40 = 0x40,
  ISAAC_RENDER_SHELL_POLL_B_ID_41 = 0x41,
  ISAAC_RENDER_SHELL_POLL_B_ID_42 = 0x42,
  ISAAC_RENDER_SHELL_POLL_B_ID_43 = 0x43,
  ISAAC_RENDER_SHELL_POLL_B_ID_44 = 0x44,
  ISAAC_RENDER_SHELL_POLL_B_ID_46 = 0x46,
  ISAAC_RENDER_SHELL_POLL_B_ID_4F = 0x4f,
  /* Bit layout of poll masks (address-stable; same as ProcessInput). */
  ISAAC_RENDER_SHELL_POLL_BIT0 = 0x01,
  ISAAC_RENDER_SHELL_POLL_BIT1 = 0x02, /* 74ea50 test al,2 */
  ISAAC_RENDER_SHELL_POLL_BIT2 = 0x04,
  ISAAC_RENDER_SHELL_POLL_BIT3 = 0x08,
  ISAAC_RENDER_SHELL_POLL_BIT4 = 0x10,
  ISAAC_RENDER_SHELL_POLL_BIT5 = 0x20,
  ISAAC_RENDER_SHELL_POLL_BIT6 = 0x40,
  ISAAC_RENDER_SHELL_POLL_B_ID_46_FORCE = 0x7f,
  /* Mode excluded from 6f9400 bit1 (action 0x39) — Game+0x26584 == 0x2c. */
  ISAAC_RENDER_SHELL_POLL_GATE39_MODE_EXCLUDE = 0x2c,
  /* Stage upper bound exclusive for gate39 — cmp edx, 8 / jge skip. */
  ISAAC_RENDER_SHELL_POLL_GATE39_STAGE_MAX = 8,
  /* ABI v18: AnimationState::Render 0x0040a030 pure CF + nested host. */
  ISAAC_RENDER_SHELL_HOST_409120_VA = 0x00409120u, /* per-layer draw residual */
  /* Residual plan codes for 40a030. */
  ISAAC_RENDER_SHELL_40A030_PLAN_SKIP = 0,       /* pure-complete (no host) */
  ISAAC_RENDER_SHELL_40A030_PLAN_HOST_LAYERS = 1, /* host 409120 × layer_count */
  /* AnimationState / AnimationData offsets used by 40a030 (hash-bound PE). */
  ISAAC_RENDER_SHELL_40A030_STATE_ANM2_OFF = 0,
  ISAAC_RENDER_SHELL_40A030_STATE_ANIM_OFF = 4,
  ISAAC_RENDER_SHELL_40A030_STATE_LAYER_FRAMES_OFF = 8,
  ISAAC_RENDER_SHELL_40A030_ANIM_LAYERS_OFF = 0x18,
  ISAAC_RENDER_SHELL_40A030_ANIM_LAYER_COUNT_OFF = 0x1c,
  /* AnimationLayer row stride (ebx += 0x10 each iteration). */
  ISAAC_RENDER_SHELL_40A030_LAYER_STRIDE = 0x10,
  /* ABI v19: opaque_call_00409120 pure entry CF + residual plan. */
  ISAAC_RENDER_SHELL_409120_PLAN_SKIP = 0,      /* pure-complete early out */
  ISAAC_RENDER_SHELL_409120_PLAN_HOST_BODY = 1, /* host from 0x408590 */
  /* AnimationFrame row stride (imul frame, 0x6c). */
  ISAAC_RENDER_SHELL_409120_FRAME_STRIDE = 0x6c,
  /* LayerState row stride (layer_id * 0xa0). */
  ISAAC_RENDER_SHELL_409120_LAYER_STATE_STRIDE = 0xa0,
  /* Offsets (hash-bound PE / ZHL AnimationLayer / AnimationFrame / LayerState). */
  ISAAC_RENDER_SHELL_409120_LAYER_ID_OFF = 0,
  ISAAC_RENDER_SHELL_409120_FRAMES_OFF = 4,
  ISAAC_RENDER_SHELL_409120_NUM_FRAMES_OFF = 8,
  ISAAC_RENDER_SHELL_409120_LAYER_VIS_OFF = 0xc,
  ISAAC_RENDER_SHELL_409120_FRAME_VIS_OFF = 0x2c,
  ISAAC_RENDER_SHELL_409120_LAYER_STATE_VIS_OFF = 0x74,
  ISAAC_RENDER_SHELL_409120_LAYER_FLAGS_OFF = 0x8c,
  ISAAC_RENDER_SHELL_409120_ANM2_LAYERS_OFF = 0x7c,
  ISAAC_RENDER_SHELL_409120_ANM2_FLAGS_OFF = 0x110,
  /* Flag bits on (anm2+0x110 | layer+0x8c). */
  ISAAC_RENDER_SHELL_409120_FLAG_BIT1 = 0x01, /* color from layer path */
  ISAAC_RENDER_SHELL_409120_FLAG_BIT4 = 0x04, /* early-out if DAT_c7977e==0 */
  /* Color residual path plan after pure entry + sprite host. */
  ISAAC_RENDER_SHELL_409120_COLOR_LAYER = 0, /* flags&1 → layer/frame blend */
  ISAAC_RENDER_SHELL_409120_COLOR_ANM2 = 1,   /* DAT_c78dc0==0 → anm2 color */
  ISAAC_RENDER_SHELL_409120_COLOR_HOST = 2,   /* else pure 0x40c6f0 ring (v23) */
  /* Nested residual host VAs inside 409120 body (address-stable). */
  ISAAC_RENDER_SHELL_HOST_408590_VA = 0x00408590u, /* sprite sheet residual */
  ISAAC_RENDER_SHELL_HOST_40C440_VA = 0x0040c440u, /* smart-ptr cleanup */
  ISAAC_RENDER_SHELL_HOST_4071C0_VA = 0x004071c0u, /* pure-complete v21 color copy */
  ISAAC_RENDER_SHELL_HOST_4072E0_VA = 0x004072e0u, /* pure-complete v21 color blend */
  ISAAC_RENDER_SHELL_HOST_4098A0_VA = 0x004098a0u, /* GetSourceQuad exact */
  ISAAC_RENDER_SHELL_HOST_409CB0_VA = 0x00409cb0u, /* dest quad residual */
  ISAAC_RENDER_SHELL_HOST_40C6F0_VA = 0x0040c6f0u, /* pure-complete v23 color ring */
  /* ABI v21: ColorMod layout + nested pure mul-blend 0x6831c0. */
  ISAAC_RENDER_SHELL_COLOR_SIZE = 0x2c,            /* 11× float32 / dwords */
  ISAAC_RENDER_SHELL_COLOR_FLOATS = 11,
  ISAAC_RENDER_SHELL_COLOR_TINT_COUNT = 4,         /* [0..0xc] mul channels */
  ISAAC_RENDER_SHELL_COLOR_OFF_R = 0x10,           /* float index 4 */
  ISAAC_RENDER_SHELL_COLOR_OFF_G = 0x14,           /* float index 5 */
  ISAAC_RENDER_SHELL_COLOR_OFF_B = 0x18,           /* float index 6 */
  ISAAC_RENDER_SHELL_COLOR_OFF_A = 0x1c,           /* float index 7 */
  ISAAC_RENDER_SHELL_COLOR_ADD0 = 0x20,            /* float index 8 */
  ISAAC_RENDER_SHELL_COLOR_ADD1 = 0x24,            /* float index 9 */
  ISAAC_RENDER_SHELL_COLOR_ADD2 = 0x28,            /* float index 10 */
  /* 6831c0 offset residual plan after tint mul. */
  ISAAC_RENDER_SHELL_6831C0_OFF_SKIP = 0,          /* other sum == 0 ordered */
  ISAAC_RENDER_SHELL_6831C0_OFF_COPY = 1,          /* this sum == 0 → copy other */
  ISAAC_RENDER_SHELL_6831C0_OFF_AVERAGE = 2,       /* both nonzero → *0.5 sum */
  ISAAC_RENDER_SHELL_HOST_6831C0_VA = 0x006831c0u, /* pure-complete nested blend */
  /* ABI v22: GetSourceQuad 0x4098a0 + dest-quad 0x409cb0 pure. */
  /* SourceQuad layout (inherits DestinationQuad 0x20 + space byte). */
  ISAAC_RENDER_SHELL_SOURCE_QUAD_SIZE = 0x24,
  ISAAC_RENDER_SHELL_SOURCE_QUAD_TL_OFF = 0,
  ISAAC_RENDER_SHELL_SOURCE_QUAD_TR_OFF = 8,
  ISAAC_RENDER_SHELL_SOURCE_QUAD_BL_OFF = 0x10,
  ISAAC_RENDER_SHELL_SOURCE_QUAD_BR_OFF = 0x18,
  ISAAC_RENDER_SHELL_SOURCE_QUAD_SPACE_OFF = 0x20,
  ISAAC_RENDER_SHELL_SOURCE_QUAD_SPACE_UV = 1, /* PE always stores 1 */
  /* Flag bit that opens RNG jitter residual (VA 0x00409a6f: test al, 2). */
  ISAAC_RENDER_SHELL_4098A0_FLAG_BIT2 = 0x02,
  /* Residual plan for GetSourceQuad. */
  ISAAC_RENDER_SHELL_4098A0_PLAN_PURE = 0,        /* !(flags&2) pure-complete */
  ISAAC_RENDER_SHELL_4098A0_PLAN_RNG = 1,         /* bit2 + seed≠0 pure RNG */
  ISAAC_RENDER_SHELL_4098A0_PLAN_HOST_ASSERT = 2, /* bit2 + seed==0 → a112c0 */
  /* DAT_00bacb70 sign-bit mask; DAT_00ba9ff0 unit scale; half for unit offset. */
  ISAAC_RENDER_SHELL_F32_SIGN_BITS = 0x80000000u,
  ISAAC_RENDER_SHELL_F32_RNG_UNIT_BITS = 0x2f7ffffeu, /* ~1/2^32 */
  /* RNG assert log host (string "RNG Seed is zero" @ 0xb6bf54). */
  ISAAC_RENDER_SHELL_HOST_A112C0_VA = 0x00a112c0u,
  ISAAC_RENDER_SHELL_4098A0_RNG_MSG_VA = 0x00b6bf54u,
  ISAAC_RENDER_SHELL_4098A0_RNG_MSG_ARG = 0x10,
  /* Dest-quad residual hosts (no exact ZHL). */
  ISAAC_RENDER_SHELL_HOST_A0F550_VA = 0x00a0f550u, /* pure-complete body v9 */
  ISAAC_RENDER_SHELL_HOST_A10D00_VA = 0x00a10d00u, /* pure-complete body v24 */
  ISAAC_RENDER_SHELL_HOST_A10950_VA = 0x00a10950u, /* pure-complete body v24 */
  ISAAC_RENDER_SHELL_HOST_A10760_VA = 0x00a10760u, /* pure-complete body v24 */
  /* Dest-quad flag bit8 (VA 0x00409d9d: test dl, 8). */
  ISAAC_RENDER_SHELL_409CB0_FLAG_BIT8 = 0x08,
  /* Dest-quad residual plan. v25: whole glue is a pure compute (PURE);
     HOST_BODY retained as the pre-v25 code so callers can diff plans. */
  ISAAC_RENDER_SHELL_409CB0_PLAN_PURE = 0,
  ISAAC_RENDER_SHELL_409CB0_PLAN_HOST_BODY = 1,
  /* ABI v25: 409cb0 whole-body pure compute. */
  /* push imm at VA 0x00409f18 → a0f550 packed color arg (opaque white). */
  ISAAC_RENDER_SHELL_409CB0_COLOR_ARG = -1,
  /* Camera-base globals (VA 0x00409ee3…0x00409f15). */
  ISAAC_RENDER_SHELL_409CB0_DAT_C71678_VA = 0x00c71678u, /* manager ptr */
  ISAAC_RENDER_SHELL_409CB0_DAT_C33910_VA = 0x00c33910u, /* byte gate */
  ISAAC_RENDER_SHELL_409CB0_DAT_C7B640_VA = 0x00c7b640u, /* fallback x */
  ISAAC_RENDER_SHELL_409CB0_DAT_C7B644_VA = 0x00c7b644u, /* fallback y */
  ISAAC_RENDER_SHELL_409CB0_CAM_X_OFF = 0x2650c,
  ISAAC_RENDER_SHELL_409CB0_CAM_Y_OFF = 0x26510,
  /* Effective-flipY global (VA 0x00409ccc: cmp byte [0xc7977d], 0). */
  ISAAC_RENDER_SHELL_409CB0_DAT_C7977D_VA = 0x00c7977du,
  /* DAT_00baa088 = 0.01745329238474369f (degrees → radians). */
  ISAAC_RENDER_SHELL_F32_DEG2RAD_BITS = 0x3c8efa35u,
  ISAAC_RENDER_SHELL_409CB0_DEG2RAD_VA = 0x00baa088u,
  /* anm2 / layer / frame field offsets used by the whole-body compute. */
  ISAAC_RENDER_SHELL_409CB0_ANM2_FLAGS_OFF = 0x110,
  ISAAC_RENDER_SHELL_409CB0_ANM2_FLIP_X_OFF = 0x100,
  ISAAC_RENDER_SHELL_409CB0_ANM2_FLIP_Y_OFF = 0x101,
  ISAAC_RENDER_SHELL_409CB0_ANM2_OFF_X_OFF = 0x94,
  ISAAC_RENDER_SHELL_409CB0_ANM2_OFF_Y_OFF = 0x98,
  ISAAC_RENDER_SHELL_409CB0_ANM2_SCALE_X_OFF = 0x9c,
  ISAAC_RENDER_SHELL_409CB0_ANM2_SCALE_Y_OFF = 0xa0,
  ISAAC_RENDER_SHELL_409CB0_ANM2_ROT_OFF = 0xa4,
  ISAAC_RENDER_SHELL_409CB0_LAYER_FLAGS_OFF = 0x8c,
  ISAAC_RENDER_SHELL_409CB0_LAYER_FLIP_X_OFF = 0x32,
  ISAAC_RENDER_SHELL_409CB0_LAYER_FLIP_Y_OFF = 0x33,
  ISAAC_RENDER_SHELL_409CB0_LAYER_SIZE_X_OFF = 0x34,
  ISAAC_RENDER_SHELL_409CB0_LAYER_SIZE_Y_OFF = 0x38,
  ISAAC_RENDER_SHELL_409CB0_LAYER_ROT_OFF = 0x3c,
  ISAAC_RENDER_SHELL_409CB0_LAYER_POS_X_OFF = 0x40,
  ISAAC_RENDER_SHELL_409CB0_LAYER_POS_Y_OFF = 0x44,
  ISAAC_RENDER_SHELL_409CB0_FRAME_REF_X_OFF = 0x08,
  ISAAC_RENDER_SHELL_409CB0_FRAME_REF_Y_OFF = 0x0c,
  ISAAC_RENDER_SHELL_409CB0_FRAME_POS_X_OFF = 0x10,
  ISAAC_RENDER_SHELL_409CB0_FRAME_POS_Y_OFF = 0x14,
  ISAAC_RENDER_SHELL_409CB0_FRAME_SCALE_X_OFF = 0x18,
  ISAAC_RENDER_SHELL_409CB0_FRAME_SCALE_Y_OFF = 0x1c,
  ISAAC_RENDER_SHELL_409CB0_FRAME_PIVOT_X_OFF = 0x20,
  ISAAC_RENDER_SHELL_409CB0_FRAME_PIVOT_Y_OFF = 0x24,
  ISAAC_RENDER_SHELL_409CB0_FRAME_ROT_OFF = 0x5c,
  /* ABI v24: a10d00 / a10950 / a10760 layout + nested cos/sin wrappers. */
  ISAAC_RENDER_SHELL_DEST_QUAD_SIZE = 0x20,       /* 4 corners × 2 floats */
  ISAAC_RENDER_SHELL_A10D00_OBJ_SIZE = 0x70,      /* quad + 4×5 dwords */
  ISAAC_RENDER_SHELL_A10D00_COLOR_OFF = 0x20,
  ISAAC_RENDER_SHELL_A10D00_COLOR_DWORDS = 5,     /* a0f550 packed color size */
  ISAAC_RENDER_SHELL_A10D00_COLOR_COPIES = 4,
  /* a10760 nested CRT float wrappers (cvtss2sd → cos/sin → cvtsd2ss). */
  ISAAC_RENDER_SHELL_HOST_41D540_VA = 0x0041d540u, /* cosf wrapper */
  ISAAC_RENDER_SHELL_HOST_41D520_VA = 0x0041d520u, /* sinf wrapper */
  /* a10950 / a10760 residual plans (early pure skip vs apply). */
  ISAAC_RENDER_SHELL_A10950_PLAN_SKIP = 0,  /* scale ordered-eq (1,1) */
  ISAAC_RENDER_SHELL_A10950_PLAN_APPLY = 1,
  ISAAC_RENDER_SHELL_A10760_PLAN_SKIP = 0,  /* angle ordered-eq 0 */
  ISAAC_RENDER_SHELL_A10760_PLAN_APPLY = 1,
  /* DAT_00ba9fe4 = 0.0f (a10760 angle early-out). */
  ISAAC_RENDER_SHELL_F32_ZERO_BITS = 0x00000000u,
  /* ABI v23: opaque_call_0040c6f0 color-ring pure-complete.
     DAT VAs (hash-bound globals; not PE-image, BSS). */
  ISAAC_RENDER_SHELL_40C6F0_DAT_C78DB4_VA = 0x00c78db4u, /* Color** table base */
  ISAAC_RENDER_SHELL_40C6F0_DAT_C78DB8_VA = 0x00c78db8u, /* cursor dword */
  ISAAC_RENDER_SHELL_40C6F0_DAT_C78DBC_VA = 0x00c78dbcu, /* base/count addend */
  ISAAC_RENDER_SHELL_40C6F0_DAT_C78DC0_VA = 0x00c78dc0u, /* count / open gate */
  /* Residual plan: always pure (zero nested calls). */
  ISAAC_RENDER_SHELL_40C6F0_PLAN_PURE = 0,
  /* ABI v20: opaque_call_00408590 pure CF + nested 0x40c550. */
  ISAAC_RENDER_SHELL_HOST_40C550_VA = 0x0040c550u, /* SharedPtr copy residual */
  /* Residual plan codes for 408590. */
  ISAAC_RENDER_SHELL_408590_PLAN_PURE_NULL = 0, /* pure-complete zero out */
  ISAAC_RENDER_SHELL_408590_PLAN_COPY = 1,      /* host 40c550 only */
  ISAAC_RENDER_SHELL_408590_PLAN_VT44 = 2,      /* vt+0x44 + stores + copy */
  ISAAC_RENDER_SHELL_408590_PLAN_VT48 = 3,      /* vt+0x48 + stores + copy */
  ISAAC_RENDER_SHELL_408590_PLAN_VT_BOTH = 4,  /* both vtables + copy */
  /* LayerState / sprite object field offsets (hash-bound PE). */
  ISAAC_RENDER_SHELL_408590_LAYER_SPRITE_OFF = 0x98, /* SharedPtr.object */
  ISAAC_RENDER_SHELL_408590_LAYER_CTRL_OFF = 0x9c,   /* SharedPtr.control */
  ISAAC_RENDER_SHELL_408590_LAYER_A0_OFF = 0x20,
  ISAAC_RENDER_SHELL_408590_LAYER_A1_OFF = 0x24,
  ISAAC_RENDER_SHELL_408590_LAYER_B0_OFF = 0x28,
  ISAAC_RENDER_SHELL_408590_LAYER_B1_OFF = 0x2c,
  ISAAC_RENDER_SHELL_408590_SPRITE_A0_OFF = 0x30,
  ISAAC_RENDER_SHELL_408590_SPRITE_A1_OFF = 0x34,
  ISAAC_RENDER_SHELL_408590_SPRITE_B0_OFF = 0x38,
  ISAAC_RENDER_SHELL_408590_SPRITE_B1_OFF = 0x3c,
  /* Vtable method offsets on sprite object. */
  ISAAC_RENDER_SHELL_408590_VT_PAIR_A_OFF = 0x44,
  ISAAC_RENDER_SHELL_408590_VT_PAIR_B_OFF = 0x48,
  /* SharedPtr layout for 40c550. */
  ISAAC_RENDER_SHELL_40C550_OBJ_OFF = 0,
  ISAAC_RENDER_SHELL_40C550_CTRL_OFF = 4,
  /* ABI v26: 40c550 continuation chain + 408590 recapture + af0917 floor. */
  /* Indirect slot on the SOURCE control block (VA 0x0040c575: [eax+4]). */
  ISAAC_RENDER_SHELL_40C550_SRC_VT_ADDREF_OFF = 0x04,
  /* Indirect slot on the DEST control block (VA 0x0040c587: [eax+0xc]). */
  ISAAC_RENDER_SHELL_40C550_DEST_VT_RELEASE_OFF = 0x0c,
  /* cdecl hook pointer read at VA 0x0040c590; called with dest, add esp,4. */
  ISAAC_RENDER_SHELL_40C550_HOOK_DAT_VA = 0x00c7163cu,
  /* 40c550 entry plan. */
  ISAAC_RENDER_SHELL_40C550_PLAN_ZERO_ONLY = 0, /* src ctrl null: pure-complete */
  ISAAC_RENDER_SHELL_40C550_PLAN_ADDREF = 1,    /* host src vt+0x04 then resume */
  /* 40c550 resume plan after the src vt+0x04 sample. */
  ISAAC_RENDER_SHELL_40C550_RESUME_ABORT = 0,   /* al==0: dest stays zeroed */
  ISAAC_RENDER_SHELL_40C550_RESUME_RELEASE = 1, /* dest ctrl != 0: host vt+0xc */
  ISAAC_RENDER_SHELL_40C550_RESUME_ASSIGN = 2,  /* dest ctrl == 0: assign now */
  /* 40c550 post-release plan after the dest vt+0xc sample. */
  ISAAC_RENDER_SHELL_40C550_POST_NO_HOOK = 0,
  ISAAC_RENDER_SHELL_40C550_POST_HOOK = 1,
  /* 408590 entry plan (phase 1) and post-A plan (phase 2, recaptured). */
  ISAAC_RENDER_SHELL_408590_ENTRY_TAIL_COPY = 0, /* sprite null → 40c550 only */
  ISAAC_RENDER_SHELL_408590_ENTRY_PAIR_A = 1,    /* host sprite vt+0x44 */
  ISAAC_RENDER_SHELL_408590_ENTRY_CHECK_B = 2,   /* pair A already cached */
  ISAAC_RENDER_SHELL_408590_POST_A_TAIL_COPY = 0,
  ISAAC_RENDER_SHELL_408590_POST_A_PAIR_B = 1,   /* host sprite vt+0x48 */
  /* 0x00af0917 is `jmp [0x00b18840]`; IAT slot resolves to CRT floor. */
  ISAAC_RENDER_SHELL_AF0917_IAT_VA = 0x00b18840u,
  /* AddRef-shaped vtable slot on control (VA 0x40c575: [eax+4]). */
  ISAAC_RENDER_SHELL_40C550_VT_ADDREF_OFF = 4,
  /* ABI v14: opaque_call_0074f690 mode-44 stage-type helper. */
  /* Entry residual plan codes. */
  ISAAC_RENDER_SHELL_74F690_PLAN_TYPE4 = 0,   /* pure return Game+4 */
  ISAAC_RENDER_SHELL_74F690_PLAN_CONST4 = 1,  /* pure return 4 (stage7 && idx==-10) */
  ISAAC_RENDER_SHELL_74F690_PLAN_GETROOM = 2, /* host GetRoomByIdx then stage */
  ISAAC_RENDER_SHELL_74F690_PLAN_STAGE = 3,   /* stage dispatch with room_idx */
  /* Stage residual plan after room_idx final. */
  ISAAC_RENDER_SHELL_74F690_STAGE_TABLE_LO = 0, /* stage<=6 → table 0xb6a878 */
  ISAAC_RENDER_SHELL_74F690_STAGE_WOMB = 1,     /* stage 7/8 → dist / table hi */
  ISAAC_RENDER_SHELL_74F690_STAGE_TYPE4 = 2,    /* else pure Game+4 */
  /* Immediates / offsets (hash-bound PE). */
  ISAAC_RENDER_SHELL_74F690_ROOM_IDX_SPECIAL = -10, /* cmp esi, -0xa */
  ISAAC_RENDER_SHELL_74F690_ROOM_IDX_CLAMP_MAX = 0xa8,
  ISAAC_RENDER_SHELL_74F690_STAGE_WOMB_A = 7,
  ISAAC_RENDER_SHELL_74F690_STAGE_WOMB_B = 8,
  ISAAC_RENDER_SHELL_74F690_CONST_TYPE4 = 4,
  ISAAC_RENDER_SHELL_74F690_GRID = 0x0d,
  ISAAC_RENDER_SHELL_74F690_DIST_NEAR = 3,
  ISAAC_RENDER_SHELL_74F690_SLOT_STRIDE = 0xb8,
  ISAAC_RENDER_SHELL_74F690_SLOT_FIELD_OFF = 0x14,
  ISAAC_RENDER_SHELL_74F690_FLOAT_A_OFF = 0x183b0,
  ISAAC_RENDER_SHELL_74F690_FLOAT_B_OFF = 0x18654,
  ISAAC_RENDER_SHELL_74F690_FLAG_OFF = 0x183a0,
  ISAAC_RENDER_SHELL_74F690_ROOM_SLOT_OFF = 0x18314,
  ISAAC_RENDER_SHELL_74F690_TABLE_DIM = 5,
  ISAAC_RENDER_SHELL_74F690_TABLE_SIZE = 25,
  /* DAT_00baa784 = 5.0f; DAT_00baa780 ≈ 4.999f */
  ISAAC_RENDER_SHELL_F32_5_BITS = 0x40a00000u,
  ISAAC_RENDER_SHELL_F32_4_999_BITS = 0x409ff7cfu,
  /* MSVC signed /13 magic (imul 0x4ec4ec4f; sar edx,2; +sign). */
  ISAAC_RENDER_SHELL_74F690_SDIV13_MAGIC = 0x4ec4ec4fu,
  /* Nested host GetRoomByIdx (exact ZHL Game/Level). */
  ISAAC_RENDER_SHELL_HOST_740BC0_VA = 0x00740bc0u,
  /* PE static table bases (embedded as pure constants in helpers). */
  ISAAC_RENDER_SHELL_74F690_TABLE_LO_VA = 0x00b6a878u,
  ISAAC_RENDER_SHELL_74F690_TABLE_HI_VA = 0x00b6a8e0u,
  /* GetRoomByIdx dimension stack imm (push -1). */
  ISAAC_RENDER_SHELL_74F690_GETROOM_DIM = -1,
  /* ABI v15: Game::GetRoomByIdx @ 0x00740bc0 pure CF. */
  /* Entry residual plan codes (after dim effective + range). */
  ISAAC_RENDER_SHELL_740BC0_PLAN_EMPTY = 0,           /* &DAT_00c81090 */
  ISAAC_RENDER_SHELL_740BC0_PLAN_NEGATIVE = 1,        /* pure neg slot off */
  ISAAC_RENDER_SHELL_740BC0_PLAN_GRID = 2,            /* pure grid slot off */
  ISAAC_RENDER_SHELL_740BC0_PLAN_RECURSE_CURRENT = 3, /* host recurse -100 */
  ISAAC_RENDER_SHELL_740BC0_PLAN_RECURSE_SPECIAL = 4,/* host recurse -101/dim0 */
  ISAAC_RENDER_SHELL_740BC0_PLAN_WALK = 5,            /* host walk -101/dim!=0 */
  /* Resolve result kinds (hybrid pure path). */
  ISAAC_RENDER_SHELL_740BC0_KIND_EMPTY = 0,
  ISAAC_RENDER_SHELL_740BC0_KIND_GAME_OFF = 1,
  ISAAC_RENDER_SHELL_740BC0_KIND_HOST = 2,
  /* Special indices / range (hash-bound PE). */
  ISAAC_RENDER_SHELL_740BC0_IDX_CURRENT = -100, /* -0x64 */
  ISAAC_RENDER_SHELL_740BC0_IDX_SPECIAL = -101, /* -0x65 */
  ISAAC_RENDER_SHELL_740BC0_IDX_RANGE_ADD = 0x14,
  ISAAC_RENDER_SHELL_740BC0_IDX_RANGE_LIM = 0xbcu, /* ja after +0x14 */
  ISAAC_RENDER_SHELL_740BC0_DIM_COUNT = 3,
  ISAAC_RENDER_SHELL_740BC0_GRID_STRIDE = 0xa9, /* 169 */
  ISAAC_RENDER_SHELL_740BC0_MAP_BASE_OFF = 0x17adc,
  ISAAC_RENDER_SHELL_740BC0_SLOT_MAX = 0x20e, /* valid when slot_u <= 0x20e */
  ISAAC_RENDER_SHELL_740BC0_SLOT_STRIDE = 0xb8,
  ISAAC_RENDER_SHELL_740BC0_DESC_BASE_OFF = 0x14,
  ISAAC_RENDER_SHELL_740BC0_NEG_BASE_OFF = 0x16bc4,
  ISAAC_RENDER_SHELL_740BC0_EMPTY_VA = 0x00c81090u,
  ISAAC_RENDER_SHELL_740BC0_ONCE_GUARD_VA = 0x00c8108cu,
  ISAAC_RENDER_SHELL_740BC0_CUR_IDX_OFF = 0x18304,
  ISAAC_RENDER_SHELL_740BC0_DIM_OFF = 0x1830c,
  ISAAC_RENDER_SHELL_740BC0_ROOM_COUNT_OFF = 0x182cc,
  ISAAC_RENDER_SHELL_740BC0_WALK_START_OFF = 0x24,
  ISAAC_RENDER_SHELL_740BC0_WALK_STRIDE = 0xb8,
  ISAAC_RENDER_SHELL_740BC0_WALK_RESULT_DELTA = -0x10,
  ISAAC_RENDER_SHELL_740BC0_WALK_MATCH_TYPE = 1,
  ISAAC_RENDER_SHELL_740BC0_WALK_MATCH_VAR = 10,
  ISAAC_RENDER_SHELL_740BC0_SPECIAL_RECURSE_IDX = 0xa2,
  ISAAC_RENDER_SHELL_740BC0_SPECIAL_RECURSE_DIM = 1,
  /* Once-init residual host VAs (TLS construct empty RoomDescriptor). */
  ISAAC_RENDER_SHELL_HOST_AEF29D_VA = 0x00aef29du, /* lock guard */
  ISAAC_RENDER_SHELL_HOST_6EF590_VA = 0x006ef590u, /* construct empty */
  ISAAC_RENDER_SHELL_HOST_ATEXIT_VA = 0x00aef5afu,
  ISAAC_RENDER_SHELL_HOST_AEF253_VA = 0x00aef253u, /* unlock guard */
  ISAAC_RENDER_SHELL_740BC0_ATEXIT_CB_VA = 0x00b15b30u,
  /* ABI v27: once-init plan/resume, walk indirection, recursion driver. */
  /* Entry gate VA 0x00740bf3 (signed jg on the TLS epoch). */
  ISAAC_RENDER_SHELL_740BC0_ONCE_PLAN_SKIP = 0,   /* guard <= tls epoch */
  ISAAC_RENDER_SHELL_740BC0_ONCE_PLAN_HEADER = 1, /* host 0xaef29d then resume */
  /* Resume gate VA 0x00740d50: cmp [0xc8108c], -1; jne body. */
  ISAAC_RENDER_SHELL_740BC0_ONCE_RESUME_SKIP = 0,      /* another thread won */
  ISAAC_RENDER_SHELL_740BC0_ONCE_RESUME_CONSTRUCT = 1, /* ctor + atexit + footer */
  /* The recaptured guard value that means "not yet initialised". */
  ISAAC_RENDER_SHELL_740BC0_ONCE_GUARD_UNINIT = -1,
  /* VA 0x00740c9a: mov edx,[eax] — the slot holds a POINTER at +0. */
  ISAAC_RENDER_SHELL_740BC0_WALK_ENTRY_PTR_OFF = 0,
  /* VA 0x00740c94: cmp [eax-4], 0 — kind word sits 4 bytes below the ptr. */
  ISAAC_RENDER_SHELL_740BC0_WALK_KIND_OFF = -4,
  /* Fields tested through the loaded pointer. */
  ISAAC_RENDER_SHELL_740BC0_WALK_PTR_TYPE_OFF = 8,
  ISAAC_RENDER_SHELL_740BC0_WALK_PTR_VAR_OFF = 0x10,
  /* Walk sentinel for "no match" (0 is not a reachable Game-relative off). */
  ISAAC_RENDER_SHELL_740BC0_WALK_NO_MATCH = 0,
  /* Bounded recursion driver: -100 → -101 → 0xa2 is the deepest PE chain. */
  ISAAC_RENDER_SHELL_740BC0_MAX_RECURSE_DEPTH = 4,
  /* 74f690: stage id is re-read at VA 0x0074f6f0 after the host call. */
  ISAAC_RENDER_SHELL_74F690_STAGE_RELOAD_VA = 0x0074f6f0u,
  /* ABI v29: vector<EntitySaveState> grow 0x00708eb0 (no ZHL). */
  ISAAC_RENDER_SHELL_708EB0_MAX_LEN = 0x2222222,   /* cmp eax,0x2222222; ja */
  ISAAC_RENDER_SHELL_708EB0_SHL_A = 4,             /* shl ecx,4 */
  ISAAC_RENDER_SHELL_708EB0_SHL_B = 3,             /* shl ecx,3 */
  ISAAC_RENDER_SHELL_HOST_40CF00_VA = 0x0040cf00u, /* allocate */
  ISAAC_RENDER_SHELL_HOST_4D3130_VA = 0x004d3130u, /* per-element copy */
  ISAAC_RENDER_SHELL_HOST_4D7340_VA = 0x004d7340u, /* install/commit */
  /* ABI v29: entity-list loop re-derived bound (VA 0x0080eead-0x0080eed1). */
  ISAAC_RENDER_SHELL_ENTITY_COUNT_OFF = 0x1264,
  ISAAC_RENDER_SHELL_ENTITY_ARRAY_OFF = 0x125c,
  ISAAC_RENDER_SHELL_ENTITY_ELEM = 4,
  ISAAC_RENDER_SHELL_ENTITY_RENDER_VA = 0x00806c20u, /* Game::Render exact */
  /* ABI v28: RoomDescriptor::constructor @ 0x006ef590 (exact ZHL). */
  ISAAC_RENDER_SHELL_6EF590_VA = 0x006ef590u,
  /* Object size; equals the descriptor stride recovered in GetRoomByIdx. */
  ISAAC_RENDER_SHELL_6EF590_DESC_SIZE = 0xb8,
  /* Scalar init blocks (offset, count) — see the header comment table. */
  ISAAC_RENDER_SHELL_6EF590_NEG_HEAD_OFF = 0x00,   /* 3 dwords = -1 */
  ISAAC_RENDER_SHELL_6EF590_NEG_HEAD_COUNT = 3,
  ISAAC_RENDER_SHELL_6EF590_ZERO_A_OFF = 0x0c,     /* 4 dwords = 0 */
  ISAAC_RENDER_SHELL_6EF590_ZERO_A_COUNT = 4,
  ISAAC_RENDER_SHELL_6EF590_NEG_LATE_OFF = 0x1c,   /* 8 dwords = -1, late */
  ISAAC_RENDER_SHELL_6EF590_NEG_LATE_COUNT = 8,
  ISAAC_RENDER_SHELL_6EF590_ZERO_B_OFF = 0x3c,     /* 3 dwords = 0 */
  ISAAC_RENDER_SHELL_6EF590_ZERO_B_COUNT = 3,
  ISAAC_RENDER_SHELL_6EF590_ZERO_C_OFF = 0x48,     /* 8 dwords = 0 */
  ISAAC_RENDER_SHELL_6EF590_ZERO_C_COUNT = 8,
  /* Aligned grid array: begin / end / capacity-end. */
  ISAAC_RENDER_SHELL_6EF590_GRID_BEGIN_OFF = 0x68,
  ISAAC_RENDER_SHELL_6EF590_GRID_END_OFF = 0x6c,
  ISAAC_RENDER_SHELL_6EF590_GRID_CAP_OFF = 0x70,
  ISAAC_RENDER_SHELL_6EF590_GRID_ALLOC_REQ = 0x3823, /* push 0x3823 */
  ISAAC_RENDER_SHELL_6EF590_GRID_ALIGN = 0x20,       /* and eax,0xffffffe0 */
  ISAAC_RENDER_SHELL_6EF590_GRID_ALIGN_BIAS = 0x23,  /* lea eax,[ecx+0x23] */
  ISAAC_RENDER_SHELL_6EF590_GRID_BYTES = 0x3800,
  ISAAC_RENDER_SHELL_6EF590_GRID_COUNT = 0x1c0,      /* mov ecx,0x1c0 */
  ISAAC_RENDER_SHELL_6EF590_GRID_ELEM = 0x20,
  ISAAC_RENDER_SHELL_6EF590_GRID_MAGIC = 0x16a9de81u, /* elem +0x10 and +0x1c */
  /* vector<EntitySaveState> pairs; element size proven by /0x78 and by the
     destructor ZHL at 0x004d6ee0. */
  ISAAC_RENDER_SHELL_6EF590_ENTITY_SAVE_SIZE = 0x78,
  ISAAC_RENDER_SHELL_6EF590_VEC_A_OFF = 0x74,
  ISAAC_RENDER_SHELL_6EF590_VEC_B_OFF = 0x88,
  ISAAC_RENDER_SHELL_6EF590_VEC_A_RESERVE = 0x10,
  ISAAC_RENDER_SHELL_6EF590_VEC_B_RESERVE = 0x20,
  ISAAC_RENDER_SHELL_6EF590_VEC_DIV_MAGIC = 0x88888889u,
  ISAAC_RENDER_SHELL_6EF590_VEC_DIV_SHIFT = 6,
  /* Tree head pointer + size. */
  ISAAC_RENDER_SHELL_6EF590_MAP_OFF = 0x80,
  ISAAC_RENDER_SHELL_6EF590_MAP_SIZE_OFF = 0x84,
  ISAAC_RENDER_SHELL_6EF590_NODE_ALLOC_REQ = 0x14,
  ISAAC_RENDER_SHELL_6EF590_NODE_FLAGS_WORD = 0x0101, /* color=1, isnil=1 */
  /* movups 16 zero bytes, then the never-written hole. */
  ISAAC_RENDER_SHELL_6EF590_TAIL_ZERO_OFF = 0x94,
  ISAAC_RENDER_SHELL_6EF590_TAIL_ZERO_LEN = 0x10,
  ISAAC_RENDER_SHELL_6EF590_HOLE_OFF = 0xa4,
  ISAAC_RENDER_SHELL_6EF590_HOLE_LEN = 8,
  /* Word / dword tail. */
  ISAAC_RENDER_SHELL_6EF590_WORD_A_OFF = 0xac,
  ISAAC_RENDER_SHELL_6EF590_WORD_B_OFF = 0xae,
  ISAAC_RENDER_SHELL_6EF590_TAIL_ZERO_DWORD_OFF = 0xb0,
  ISAAC_RENDER_SHELL_6EF590_TAIL_NEG_DWORD_OFF = 0xb4,
  /* Host residuals inside the ctor (no ZHL unless noted). */
  ISAAC_RENDER_SHELL_HOST_4D6EE0_VA = 0x004d6ee0u, /* EntitySaveState::dtor */
  ISAAC_RENDER_SHELL_HOST_708EB0_VA = 0x00708eb0u, /* vector grow */
  ISAAC_RENDER_SHELL_HOST_424540_VA = 0x00424540u, /* tree clear */
  ISAAC_RENDER_SHELL_6EF590_FAIL_IAT_VA = 0x00b18894u,
  /* ABI v16: opaque_call_00812d00 plan codes (AABB center vs L-room grid). */
  ISAAC_RENDER_SHELL_812D00_PLAN_AABB = 0,
  ISAAC_RENDER_SHELL_812D00_PLAN_LROOM = 1,
  /* L-room type gate: same base/span as 817830 (type ∈ [9,12]). */
  ISAAC_RENDER_SHELL_812D00_LROOM_TYPE_BASE = 9,
  ISAAC_RENDER_SHELL_812D00_LROOM_TYPE_SPAN = 3,
  /* Jump-table dividends by (type-9): cases 0..3 → 0x148/0x13b/0x84/0x77. */
  ISAAC_RENDER_SHELL_812D00_DIV_TYPE9 = 0x148,
  ISAAC_RENDER_SHELL_812D00_DIV_TYPE10 = 0x13b,
  ISAAC_RENDER_SHELL_812D00_DIV_TYPE11 = 0x84,
  ISAAC_RENDER_SHELL_812D00_DIV_TYPE12 = 0x77,
  /* Room field offsets used by 812d00 (Manager+0x18300 → Room*). */
  ISAAC_RENDER_SHELL_812D00_ROOM_WIDTH_OFF = 0x0c,
  ISAAC_RENDER_SHELL_812D00_ROOM_LEFT_OFF = 0x14,
  ISAAC_RENDER_SHELL_812D00_ROOM_TOP_OFF = 0x18,
  ISAAC_RENDER_SHELL_812D00_ROOM_RIGHT_OFF = 0x1c,
  ISAAC_RENDER_SHELL_812D00_ROOM_BOTTOM_OFF = 0x20,
  ISAAC_RENDER_SHELL_812D00_ROOM_DESC_OFF = 4,
  ISAAC_RENDER_SHELL_812D00_DESC_NEST_OFF = 0x10,
  ISAAC_RENDER_SHELL_812D00_TYPE_OFF = 0x48,
  /* Manager current-room pointer off (DAT_00c71678+0x18300). */
  ISAAC_RENDER_SHELL_812D00_MGR_ROOM_OFF = 0x18300,
  /* ABI v16: opaque_call_004217a0 challenge bitset (Game+0x26548). */
  ISAAC_RENDER_SHELL_4217A0_BITSET_OFF = 0x26548,
  ISAAC_RENDER_SHELL_4217A0_CLAMP_MAX = 0x34,
  ISAAC_RENDER_SHELL_4217A0_PROBE_ARG = 0x2f, /* 74ea50 push imm */
  /* Input map root offset on Manager (DAT_00c71678 + 0x1bbd8). */
  ISAAC_RENDER_SHELL_POLL_MAP_OFF = 0x1bbd8,
  /* Stage-overlay float constants (DAT_00bf941c * DAT_00bf93e8 = 2.0). */
  ISAAC_RENDER_SHELL_F32_TWO_BITS = 0x40000000u,      /* 2.0f */
  ISAAC_RENDER_SHELL_F32_60_BITS = 0x42700000u,       /* 60.0f  DAT_00baa950 */
  ISAAC_RENDER_SHELL_F32_140_BITS = 0x430c0000u,      /* 140.0f DAT_00baaa30 */
  ISAAC_RENDER_SHELL_F32_182_BITS = 0x43360000u,      /* 182.0f DAT_00baaa7c */
  ISAAC_RENDER_SHELL_F32_338_BITS = 0x43a90000u,      /* 338.0f DAT_00baab20 */
  ISAAC_RENDER_SHELL_F32_0_65_BITS = 0x3f266666u,     /* ~0.65f DAT_00baa324 */
  /* GetLRoomAreaDesc DAT_00baa904 / DAT_00baa87c / DAT_00baaa00. */
  ISAAC_RENDER_SHELL_F32_FORTY_BITS = 0x42200000u,   /* 40.0f */
  ISAAC_RENDER_SHELL_F32_TWENTY_BITS = 0x41a00000u,  /* 20.0f */
  ISAAC_RENDER_SHELL_F32_HUNDRED_TWENTY_BITS = 0x42f00000u, /* 120.0f */
  /* L-room table row stride (type * 0x20 + DAT_00c35b80). */
  ISAAC_RENDER_SHELL_81F8B0_ROW_STRIDE = 0x20,
  /* Fallback AABB float count written to out buffer. */
  ISAAC_RENDER_SHELL_81F8B0_AABB_FLOATS = 8,
  /* Hash-bound DAT_00c35b80 VA (GetLRoomAreaDesc table base). */
  ISAAC_RENDER_SHELL_81F8B0_TABLE_BASE = 0x00c35b80u,
  /* ABI v30: live-row sparsify plan codes (row_needed / load_plan). */
  ISAAC_RENDER_SHELL_81F8B0_PLAN_FALLBACK = 0, /* pure AABB, no row */
  ISAAC_RENDER_SHELL_81F8B0_PLAN_PURE = 1,     /* row window is a runtime input */
  ISAAC_RENDER_SHELL_81F8B0_PLAN_LIVE = 2,     /* DAT read stays host; resume */
  /* Row window: 8 signed dwords (VA 0x0081f8dc...0x0081f903). */
  ISAAC_RENDER_SHELL_81F8B0_ROW_DWORDS = 8,
  /* a0f550 DAT_00baaae4 = 255.0f. */
  ISAAC_RENDER_SHELL_F32_255_BITS = 0x437f0000u,
  /* a10c00 DAT_00c7b640 / DAT_00c7b644 (hash-bound PE floats). */
  ISAAC_RENDER_SHELL_F32_A10C00_DAT0_BITS = 0x3760371cu,
  ISAAC_RENDER_SHELL_F32_A10C00_DAT1_BITS = 0x37873770u,
  /* a10c00 color-source dword count (5 dwords × 4 copies). */
  ISAAC_RENDER_SHELL_A10C00_SRC_DWORDS = 5,
  ISAAC_RENDER_SHELL_A10C00_COPY_COUNT = 4
};

/* ---------------------------------------------------------------------------
 * G0 — main option gate (VA 0x0080eb1c)
 *   mov eax, [DAT_00c7169c]
 *   cmp byte ptr [eax + 0x2a3c3], 0
 *   je  0x0080f1ce          ; skip main body + RT pop → common epilog
 *
 * Returns 1 when the main render body residual must run (option != 0).
 * Returns 0 when control jumps straight to the common epilog after prolog.
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_main_body_needed(uint32_t option_2a3c3);

/* ---------------------------------------------------------------------------
 * G1 — manager fade poll gate (VA 0x0080eb2e / also nested at 0x0080f13a)
 *   movss xmm0, [manager + 0x26518]   ; DAT_00c71678[0x9946]
 *   xorps xmm1, xmm1
 *   comiss xmm0, xmm1
 *   ja  skip_calls                    ; strictly greater → skip
 *   call FUN_006f9400 / FUN_006f95a0
 *
 * Returns 1 when the 6f9400/6f95a0 host residual is required
 * (NOT strictly greater than 0.0f under comiss/ja — includes NaN).
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_manager_fade_poll_needed(float manager_fade_26518);

/* ---------------------------------------------------------------------------
 * G2 — room flags bit 9 (VA 0x0080ebf7–0x0080ec02)
 *   eax = *(*(Game+4) + 0x44); shr eax, 9; test al, 1
 * True → pure local color override from DAT_00babf20 (still before host
 * color bind). Returns 1 when bit 9 is set.
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_room_flags_bit9(uint32_t room_flags_at_44);

/* ---------------------------------------------------------------------------
 * P0 — camera offset build (VA 0x0080ecbd–0x0080ece3)
 *   out_x = float32(Game+0x1204) + float32(Manager+0x2650c)
 *   out_y = float32(Game+0x1208) + float32(Manager+0x26510)
 * Manager offsets 0x2650c / 0x26510 == index 0x9943 / 0x9944 of uint32 words.
 * Writes float32 results; no host.
 * --------------------------------------------------------------------------- */
void isaac_render_shell_camera_offset(float game_1204,
                                      float game_1208,
                                      float manager_2650c,
                                      float manager_26510,
                                      float* out_x,
                                      float* out_y);

/* ---------------------------------------------------------------------------
 * G3 — stage-id special (VA 0x0080ecb6)
 *   cmp dword [Game+0x1d18], 0x39
 *   je  call FUN_0083a1b0
 * Returns 1 when host FUN_0083a1b0 is required.
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_stage39_host_needed(int32_t stage_1d18);

/* ---------------------------------------------------------------------------
 * G10 — non-39 fade block entry (VA 0x0080ecfb–0x0080ed06)
 *   Reached only when G3 is false (stage != 0x39).
 *   room flags bit 9 set → jne 0x0080ee81 (skip entire fade math + 9956e0).
 * Returns 1 when the fade residual block must run (bit 9 clear).
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_non39_fade_block_needed(uint32_t room_flags_at_44);

/* ---------------------------------------------------------------------------
 * P4a — manager word OR before input-poll hosts (VA 0x0080ed0c–0x0080ed12)
 *   esi = [Manager+0x26550] | [Manager+0xc]
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_fade_mgr_words_or(uint32_t manager_26550,
                                             uint32_t manager_word_0c);

/* ---------------------------------------------------------------------------
 * P4b — poll combine bit0 (VA 0x0080ed1a–0x0080ed2d)
 *   After host 6f9400 → poll_a, host 6f95a0 → poll_b:
 *     ((~poll_b) & (poll_a | mgr_or)) & 1
 * Returns 1 when that low bit is set → select DAT_00baa454 (1.0f) as base.
 * Returns 0 → mul Manager+0x2651c * Manager+0x26518.
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_fade_poll_selects_one(uint32_t mgr_or,
                                                uint32_t poll_6f9400,
                                                uint32_t poll_6f95a0);

/* ---------------------------------------------------------------------------
 * P4c — fade base select/mul (VA 0x0080ed2f–0x0080ed4b)
 *   if selects_one: 1.0f else float32(mgr_2651c) * float32(mgr_26518)
 * --------------------------------------------------------------------------- */
float isaac_render_shell_fade_base(int32_t selects_one,
                                   float manager_2651c,
                                   float manager_26518);

/* ---------------------------------------------------------------------------
 * G11 — pure boost-mode open (VA 0x0080ed55–0x0080ed60)
 *   Game+8 == 8 || Game+8 == 0x1d → boost path without 74efd0/827bc0.
 * When false, host residual still evaluates those callees (+ Manager+0x1830c).
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_fade_boost_mode_open(int32_t game_field_8);

/* ---------------------------------------------------------------------------
 * G11b — combine boost after optional hosts (VA 0x0080ed55–0x0080ed89)
 *   boost = mode_open
 *        || (host_74efd0_true && manager_1830c == 1)
 *        || host_827bc0_true
 * Caller supplies already-evaluated host booleans (0 when pure mode short-
 * circuits before those calls).
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_fade_boost_needed(int32_t mode_open,
                                            int32_t host_74efd0_true,
                                            int32_t manager_1830c_eq_1,
                                            int32_t host_827bc0_true);

/* ---------------------------------------------------------------------------
 * P5 — apply boost (VA 0x0080ed8b–0x0080edb1)
 *   if boost: minss(fade + DAT_00baa304, DAT_00baa454)  ; +0.6f clamp 1.0f
 *   else: fade unchanged
 * minss matches PE (NaN → second operand = 1.0f).
 * --------------------------------------------------------------------------- */
float isaac_render_shell_fade_apply_boost(float fade, int32_t boost);

/* ---------------------------------------------------------------------------
 * G12 — force full white (VA 0x0080edb5–0x0080edd0)
 *   Manager dword0 == 0xd && dword1 == 1 && room flags bit 2 clear
 *   → movaps xmm2, xmm0 (force 1.0f).
 * Returns 1 when force applies.
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_fade_force_full_needed(int32_t manager_dword0,
                                                 int32_t manager_dword1,
                                                 uint32_t room_flags_at_44);

/* ---------------------------------------------------------------------------
 * P6 — fade t after Manager subtract (VA 0x0080edd3–0x0080edf8)
 *   t = maxss(fade - Manager+0x67734, 0)
 * maxss matches PE (NaN → second operand = 0).
 * --------------------------------------------------------------------------- */
float isaac_render_shell_fade_t(float fade, float manager_67734);

/* ---------------------------------------------------------------------------
 * P7 — per-channel color lerp (VA 0x0080ee10–0x0080ee56)
 *   out = (src - base) * t + base   (float32)
 * Applied to three channels; Game+0x1b7c is stored without lerp; alpha ← 0.
 * --------------------------------------------------------------------------- */
float isaac_render_shell_fade_lerp_channel(float src, float base, float t);

/* ---------------------------------------------------------------------------
 * P8 — optional DAT_00c379b8 update (VA 0x0080ee5c–0x0080ee6c)
 *   if (ptr != 0 && (byte_at_ptr_plus_4 & 1)) next = ptr; else next = current
 * PE: test ecx; je skip; test [ecx+4],1; mov eax,[global]; cmovne eax,ecx
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_c379b8_next(uint32_t ptr,
                                       uint32_t byte_at_ptr_plus_4,
                                       uint32_t current_c379b8);

/* ---------------------------------------------------------------------------
 * P1 — ordered tree count clear after Erase_tree host (VA 0x0080eea2)
 *   mov dword [Game+0x730c], 0
 * (Head self-links at the sentinel node are applied via the companion helper.)
 * --------------------------------------------------------------------------- */
void isaac_render_shell_tree_count_clear(int32_t* tree_count_730c);

/* ---------------------------------------------------------------------------
 * P1b — empty-tree sentinel re-link after Erase_tree (VA 0x0080ee98–0x0080ee9d)
 *   head node H: [H+0]=H, [H+4]=H, [H+8]=H
 * Caller supplies the head node address as a word; writes three link words.
 * --------------------------------------------------------------------------- */
void isaac_render_shell_tree_head_self_links(uint32_t head_node,
                                            uint32_t* link0,
                                            uint32_t* link4,
                                            uint32_t* link8);

/* ---------------------------------------------------------------------------
 * G4 — entity list loop ENTRY gate only (VA 0x0080eead: cmp [Game+0x1264], esi
 *   with esi==0; jbe skip). Unsigned: enter iff count != 0.
 *
 * NOTE (ABI v29): this is the entry gate and nothing more. The loop bound is
 * NOT [0, count) with a folded count — VA 0x0080eecb re-reads [Game+0x1264]
 * after every Game::Render call, and VA 0x0080eebc re-reads the array base
 * [Game+0x125c] at the top of every iteration. Use entity_loop_step and
 * entity_loop_arg for the per-iteration decisions. Kept unchanged so existing
 * callers of the entry gate keep working.
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_entity_loop_needed(uint32_t entity_count_1264);

/* ---------------------------------------------------------------------------
 * P199 — per-iteration continue (VA 0x0080eeca–0x0080eed1)
 *   inc esi; cmp esi, [Game+0x1264]; jb loop  — UNSIGNED, strict.
 *   count_after is the value RE-READ after the Game::Render call, not the
 *   value the entry gate saw. Returns 1 to run another iteration.
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_entity_loop_step(uint32_t index,
                                            uint32_t count_after);

/* P200 — next index (index + 1, 32-bit wrap as `inc esi`) */
uint32_t isaac_render_shell_entity_loop_next_index(uint32_t index);

/* ---------------------------------------------------------------------------
 * P201 — entity slot address (VA 0x0080eebc–0x0080eec2)
 *   mov eax,[Game+0x125c]; push [eax + esi*4]
 *   base_after is re-read at the TOP of each iteration, i.e. after the
 *   previous iteration's host call. Returns the address holding the Entity*.
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_entity_loop_arg(uint32_t base_after,
                                            uint32_t index);

/* G172 — is the array base re-read per iteration? Always 1 (VA 0x0080eebc
 *   sits inside the loop body, after the previous call). */
int32_t isaac_render_shell_entity_loop_base_reload_needed(void);

/* ---------------------------------------------------------------------------
 * P202 — bounded driver. count_seq / base_seq hold the values recaptured
 *   before each iteration's slot load and after each host call; entry_count
 *   is the value the entry gate at VA 0x0080eead saw. Writes the sequence of
 *   Entity* slot addresses actually pushed into out_slots (up to seq_len) and
 *   returns the number of Game::Render calls executed. Running out of samples
 *   stops the driver rather than reusing the last one.
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_entity_loop_run(uint32_t entry_count,
                                           const uint32_t* base_seq,
                                           const uint32_t* count_seq,
                                           int32_t seq_len,
                                           uint32_t* out_slots);

/* ===========================================================================
 * ABI v29 — vector<EntitySaveState> grow 0x00708eb0 pure islands
 *
 * __thiscall vec=ECX, stack `uint32_t want`, ret 4. No exact ZHL.
 *   size  = (end - begin) / 0x78            ; VA 0x00708ee0-0x00708ef6
 *   if (want > 0x2222222) throw             ; VA 0x00708efe  UNSIGNED ja
 *   bytes = ((want << 4) - want) << 3       ; VA 0x00708f05-0x00708f0c
 *   host 0x0040cf00(bytes) -> new storage
 *   for each of `size` elements: host 0x004d3130 (src, dst step 0x78)
 *   host 0x004d7340(newBegin, size, want)
 * =========================================================================== */

/* P204 — element count before the grow; same signed /0x78 sequence as v28 */
int32_t isaac_render_shell_708eb0_size_before(uint32_t begin, uint32_t end);

/* G173 — max-length gate (VA 0x00708efe): unsigned want > 0x2222222 */
int32_t isaac_render_shell_708eb0_len_overflow(uint32_t want);

/* P205 — allocation byte size: ((want<<4) - want) << 3, 32-bit wrap */
uint32_t isaac_render_shell_708eb0_alloc_bytes(uint32_t want);

/* P206 — number of per-element copy calls (VA 0x00708f37 loop) */
int32_t isaac_render_shell_708eb0_copy_count(uint32_t begin, uint32_t end);

/* P207 — host VAs inside the grow (all address-stable, no ZHL) */
uint32_t isaac_render_shell_708eb0_alloc_host_va(void);
uint32_t isaac_render_shell_708eb0_copy_host_va(void);
uint32_t isaac_render_shell_708eb0_install_host_va(void);

/* P203 — hash-bound offsets / host VA for the entity loop */
uint32_t isaac_render_shell_entity_count_off(void);
uint32_t isaac_render_shell_entity_array_off(void);
uint32_t isaac_render_shell_entity_render_va(void);

/* ---------------------------------------------------------------------------
 * P2 — grid cell product (VA 0x0080eed3–0x0080eeda)
 *   eax = imul([Game+0x10], [Game+0xc])   ; signed 32-bit wrap
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_grid_cell_count(int32_t grid_w_0c, int32_t grid_h_10);

/* ---------------------------------------------------------------------------
 * G5 — grid loop open (VA 0x0080eede–0x0080eee0)
 *   test eax, eax; jle skip
 * Returns 1 when cell_count > 0 (signed).
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_grid_loop_needed(int32_t cell_count);

/* ---------------------------------------------------------------------------
 * G6 — per-slot grid render (VA 0x0080eee5–0x0080eee9)
 *   mov ecx, [slot]; test ecx, ecx; je skip
 * Returns 1 when slot pointer is non-null (host FUN_0080c810).
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_grid_slot_needs_render(uint32_t slot_ptr);

/* ---------------------------------------------------------------------------
 * G7 — stage-overlay dual open (VA 0x0080ef08–0x0080ef1c) pure prefix
 *   [Game+8] == 5 && [*(* (Game+4) + 0x10) + 0x10] == 0x59
 * When both true, host still evaluates FUN_0074ea50 before the draw path.
 * Returns 1 when the pure dual gate is open (FUN_0074ea50 still residual).
 * ABI v12 peels pure residual after dual + host AL (see stage_overlay_*).
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_stage_overlay_dual_open(int32_t game_field_8,
                                                  int32_t nested_room_type_10);

/* ---------------------------------------------------------------------------
 * G8 — aux option gate (VA 0x0080f12c)
 *   cmp byte [ManagerOpts + 0x2a3c5], 0
 *   je  LAB_0080f17b          ; skip FUN_00817830 cluster
 * Returns 1 when the outer aux path is entered (nested fade/poll still apply).
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_option_aux_open(uint32_t option_2a3c5);

/* ---------------------------------------------------------------------------
 * G13 — aux nested FUN_00817830 decision after G8 is open (VA 0x0080f13a…)
 *
 * PE:
 *   comiss Manager+0x26518, 0; ja 0x0080f172   ; fade > 0 → call direct
 *   else: P4a mgr OR → host 6f9400/6f95a0 → P4b bit → je skip / fall call
 *
 * fade_poll_needed: result of isaac_render_shell_manager_fade_poll_needed
 *   (1 = NOT strictly > 0 → poll hosts must run first).
 * poll_selects_one: result of isaac_render_shell_fade_poll_selects_one after
 *   those hosts (ignored when fade_poll_needed == 0; pass 0).
 *
 * Returns 1 when host FUN_00817830(this=Game*, arg=1) is required.
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_aux_817830_needed(int32_t fade_poll_needed,
                                            int32_t poll_selects_one);

/* ---------------------------------------------------------------------------
 * G8+G13 composite — option outer + nested 817830 decision.
 *   option_2a3c5 == 0 → 0 (skip entire aux cluster to RT pop).
 *   else → isaac_render_shell_aux_817830_needed(...).
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_option_aux_817830_needed(uint32_t option_2a3c5,
                                                   int32_t fade_poll_needed,
                                                   int32_t poll_selects_one);

/* ---------------------------------------------------------------------------
 * P9 — RT stack depth after option-ON pop (VA 0x0080f1b5–0x0080f1c9)
 *   After host a19180 / optional empty log / 684f30 / a18300:
 *     sub  dword [DAT_00c79790], 1     ; unsigned 32-bit wrap
 *     cmove [DAT_00c7978c], 0         ; clear stack base when depth hit 0
 *
 * Writes *depth_after = depth_before - 1 (uint32 wrap).
 * Returns 1 when the stack-base pointer must be cleared (depth_after == 0).
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_rt_pop_depth_step(uint32_t depth_before,
                                            uint32_t* depth_after);

/* ---------------------------------------------------------------------------
 * G9 / P3 — common-epilog one-shot (VA 0x0080f1d5–0x0080f1e7)
 *   cmp byte [Game+0x11f6], 1
 *   jne skip
 *   mov byte [Game+0x11f6], 0
 *   call FUN_00826ae0
 *
 * If flag == 1: clear to 0 and return 1 (host FUN_00826ae0 required).
 * Otherwise leave flag unchanged and return 0.
 * Safe pure mutation: host is only the address-stable callee after clear.
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_flag11f6_oneshot(uint8_t* flag_11f6);

/* ===========================================================================
 * FUN_00817830 body pure islands (VA 0x00817830, this=Game*, stack arg unused)
 *
 * Always-host entry (before any pure body gate):
 *   ECX = DAT_00c71678; push 0; call Game::GetStageID @ 0x00738470
 *   (exact ZHL; PE this = global at DAT_00c71678)
 *
 * Early exit join: VA 0x0081def9 (cookie / ret 4).
 * ABI v4 pure ends at special fade-blend t (VA 0x00817ad8).
 * ABI v5 peels residual open 0x00817adc pure prefix + post-a14050 gates.
 * ABI v6 peels pure inside opaque_call_00a14050 + L-room/type-9 packs.
 * ABI v7 peels complete opaque_call_00a159d0 (shader string hash).
 * ABI v8 peels complete opaque_call_00416440 + a14270 found pure +
 * GetLRoomAreaDesc pure islands (a14050 callsite still 0x00817b2f).
 * ABI v9 peels a14270 insert residual plan/node_init/insert_link +
 * 81f8b0 table row addr + complete a10690/a0f550/a10c00 draw bodies.
 * ABI v10 peels 415f80/415fe0 rotates + 415c1a rebalance pure-complete.
 * =========================================================================== */

/* ---------------------------------------------------------------------------
 * P10 — stage config row offset (VA 0x0081785f)
 *   ecx = imul([Game+0x1d18], 0x13c)   ; signed 32-bit wrap
 * Slot dword lives at Game + 0x1d80 + offset (caller loads).
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_817830_stage_slot_offset(int32_t stage_1d18);

/* ---------------------------------------------------------------------------
 * G14 — stage slot open (VA 0x00817869)
 *   cmp dword [Game + stage*0x13c + 0x1d80], 0; je early_exit
 * Returns 1 when slot dword is non-zero (body may continue past exit).
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_817830_stage_slot_open(uint32_t stage_slot_1d80);

/* ---------------------------------------------------------------------------
 * G15 — GetStageID result special membership (VA 0x00817877…0x0081788e)
 *   eax ∈ {4, 5, 6, 0x1b, 0x1c}
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_817830_stage_id_special(uint32_t stage_id);

/* ---------------------------------------------------------------------------
 * G16 — room special ok when stage_id special (VA 0x00817890…0x008178a1)
 *   [Room+0x54] >= 0 (signed) && (([Room+0x44] >> 5) & 1) != 0
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_817830_room_special_ok(int32_t room_field_54,
                                                 uint32_t room_flags_44);

/* ---------------------------------------------------------------------------
 * G17 — special flag byte (VA 0x008178a3 / 0x008178a7)
 *   special = stage_id_special && room_special_ok  → 1 else 0
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_817830_special_flag(int32_t stage_id_special,
                                              int32_t room_special_ok);

/* ---------------------------------------------------------------------------
 * G18 — body continue after stage slot open (VA 0x008178a9…0x008178c2)
 *   comiss Game+0x7240, 0; ja continue
 *   else test special_flag; je early_exit
 * Returns 1 when fade_7240 strictly > 0 OR special_flag != 0.
 * NaN fade does not take ja → requires special_flag (matches comiss/ja).
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_817830_body_continue_needed(float fade_7240,
                                                      int32_t special_flag);

/* ---------------------------------------------------------------------------
 * G19 — composite body needed after host GetStageID
 *   stage_slot_open && body_continue_needed(...)
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_817830_body_needed(uint32_t stage_slot_1d80,
                                             uint32_t stage_id,
                                             int32_t room_field_54,
                                             uint32_t room_flags_44,
                                             float fade_7240);

/* ---------------------------------------------------------------------------
 * P11 — view span sum 2*(w+h) (VA 0x008178d0…0x00817964)
 *   w = float32(Game+0x1c) - float32(Game+0x14)
 *   h = float32(Game+0x20) - float32(Game+0x18)
 *   return float32(w+w+h+h)   ; PE addss chain
 * --------------------------------------------------------------------------- */
float isaac_render_shell_817830_view_span_sum(float game_14,
                                              float game_18,
                                              float game_1c,
                                              float game_20);

/* ---------------------------------------------------------------------------
 * P12 — MSVC uint32→float32 via signed double + 2^32 bias (VA 0x00817968…)
 *   Matches movd/cvtdq2pd / shr 31 / addsd DAT_00bacb00 table / cvtpd2ps.
 * --------------------------------------------------------------------------- */
float isaac_render_shell_817830_u32_to_f32(uint32_t value);

/* ---------------------------------------------------------------------------
 * P13 — scale input before host floor (VA 0x00817986…0x0081799b)
 *   span_sum / dim_f + 0.5f   (DAT_00baa2d0)
 * dim_f from P12 on *[DAT_00c797c4 + 0x10].
 * --------------------------------------------------------------------------- */
float isaac_render_shell_817830_scale_pre_floor(float span_sum, float dim_f);

/* ---------------------------------------------------------------------------
 * G20 — stage 0x2c color override (VA 0x00817a73)
 *   cmp [Game+0x1d18], 0x2c; jne skip movups DAT_00bac350
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_817830_stage_2c_color_needed(int32_t stage_1d18);

/* ---------------------------------------------------------------------------
 * P16 — DAT_00bac350 RGBA words (hash-bound) written as float32×4.
 * --------------------------------------------------------------------------- */
void isaac_render_shell_817830_stage_2c_color(float* out_rgba);

/* ---------------------------------------------------------------------------
 * P14 — special base t (VA 0x00817a8b…0x00817abd)
 *   if !special_flag: 0
 *   else minss(maxss(cvtdq2ps(room_54) / 30.0f, 0), 1.0f)
 * --------------------------------------------------------------------------- */
float isaac_render_shell_817830_special_base_t(int32_t special_flag,
                                              int32_t room_field_54);

/* ---------------------------------------------------------------------------
 * P15 — fade blend t (VA 0x00817ac0…0x00817ad8)
 *   if fade_7240 strictly > 0:
 *     t = base_t + (1.0f - base_t) * fade_7240
 *   else: t = base_t
 * comiss/jbe: NaN skips blend (same as !(fade > 0)).
 * --------------------------------------------------------------------------- */
float isaac_render_shell_817830_fade_blend_t(float base_t, float fade_7240);

/* ===========================================================================
 * FUN_00817830 residual open pure (from VA 0x00817adc) — ABI v5
 *
 * Pre-host a14050 (always when body continue path reached):
 *   store blend t; this=0xc379b0; push "KAGE_ColorTextureShader";
 *   frame_f = cvtdq2ps(Manager+0x264f8);
 *   mul_01  = frame_f * 0.01f;   mul_05 = frame_f * 0.5f;
 *   mul_005 = mul_05 * 0.1f;     call opaque_call_00a14050
 *
 * Post-call pure gates before draw hosts:
 *   G21: (Room+0x10)+0x48 type in [9,12] → GetLRoomAreaDesc residual
 *   G22: Room* and nested desc non-null
 *   G23: type == 9 → exclusive float-path residual
 * =========================================================================== */

/* ---------------------------------------------------------------------------
 * P17 — Manager frame counter → float32 (VA 0x00817af4…0x00817afc)
 *   movd xmm1, [Manager+0x264f8]; cvtdq2ps xmm1, xmm1
 * Signed int32 → float32 (SSE cvtdq2ps).
 * --------------------------------------------------------------------------- */
float isaac_render_shell_817830_frame_to_f32(int32_t manager_264f8);

/* ---------------------------------------------------------------------------
 * P18 — shader time scales before host a14050 (VA 0x00817b02…0x00817b26)
 *   out_mul_01  = frame_f * DAT_00baa06c (0.01f)
 *   out_mul_05  = frame_f * DAT_00baa2d0 (0.5f)
 *   out_mul_005 = out_mul_05 * DAT_00baa120 (0.1f)  ; = frame_f * 0.05f
 * Null out pointers are skipped.
 * --------------------------------------------------------------------------- */
void isaac_render_shell_817830_shader_scales(float frame_f,
                                             float* out_mul_01,
                                             float* out_mul_05,
                                             float* out_mul_005);

/* ---------------------------------------------------------------------------
 * G21 — L-room type range (VA 0x00817b3d…0x00817b43)
 *   eax = room_type_48 - 9; cmp eax, 3; ja skip
 * Unsigned: type ∈ [9, 12] → 1 (host Room::GetLRoomAreaDesc @ 0x0081f8b0).
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_817830_lroom_type_range(int32_t room_type_48);

/* ---------------------------------------------------------------------------
 * G22 — room + nested descriptor open (VA 0x00817bc9…0x00817bd9)
 *   Room* = [Game+4]; nested = [Room+0x10]; both non-null.
 * Returns 1 when both pointers non-zero (else jump 0x0081a975 residual).
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_817830_room_desc_open(uint32_t room_ptr,
                                                uint32_t nested_desc_ptr);

/* ---------------------------------------------------------------------------
 * G23 — room type == 9 branch (VA 0x00817bdf…0x00817be3)
 *   cmp [nested+0x48], 9; jne 0x00819394
 * Returns 1 when type is exactly 9 (type-9 draw residual).
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_817830_room_type_eq_9(int32_t room_type_48);

/* ===========================================================================
 * opaque_call_00a14050 pure islands (VA 0x00a14050) — ABI v6
 *
 * Callsite in FUN_00817830: VA 0x00817b2f. Caller ECX=0xc379b0 and stack
 * push "KAGE_ColorTextureShader" @ 0xb1a5b0 are PE-unused by the callee;
 * body hardcodes the same string imm and map this=0xc379bc. ret 4.
 * 817830 discards AL; side effect is optional DAT_00c379b8 store.
 *
 * Host chain (no exact ZHL):
 *   opaque_call_00a159d0 (this=string) → shader_id in ESI  [ABI v7 pure]
 *   opaque_call_00416440 (this=0xc379bc, out iterator/node)
 *   [G24 pure] else fail AL=0
 *   opaque_call_00a14270 (this=0xc379bc, &id) → ptr
 *   [G25 pure + P19 store] else fail AL=0
 * =========================================================================== */

/* ---------------------------------------------------------------------------
 * G24 — post-lookup continue (VA 0x00a1407b…0x00a1408c)
 *   [node+0xd] == 0
 *   && shader_id >= [node+0x10]   (unsigned jb)
 *   && node_ptr != DAT_00c379bc   (map root / sentinel)
 * Returns 1 when host a14270 must run (else return AL=0).
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_a14050_lookup_continue(uint32_t node_byte_0d,
                                                 uint32_t shader_id,
                                                 uint32_t node_field_10,
                                                 uint32_t node_ptr,
                                                 uint32_t map_root_c379bc);

/* ---------------------------------------------------------------------------
 * G25 — post-a14270 bind ok (VA 0x00a1409c…0x00a140a6)
 *   ptr != 0 && ([ptr+4] & 1) != 0
 * Returns 1 when DAT_00c379b8 ← ptr and AL=1 (else AL=0, no store).
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_a14050_bind_ok(uint32_t ptr,
                                         uint32_t byte_at_ptr_plus_4);

/* ---------------------------------------------------------------------------
 * P19 — apply bind when G25 (VA 0x00a140a8…0x00a140ad)
 *   if bind_ok: *c379b8 = ptr; return 1
 *   else: leave *c379b8 unchanged; return 0
 * Same predicate as isaac_render_shell_c379b8_next with mutate-on-success.
 * Null c379b8 skips the store but still returns the success boolean.
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_a14050_try_bind(uint32_t ptr,
                                          uint32_t byte_at_ptr_plus_4,
                                          uint32_t* c379b8);

/* ---------------------------------------------------------------------------
 * Chain plan codes (ABI v31). INSERT/THROW are NOT emitted: the a14270 miss
 * path is unreachable from a14050 because G24 (bound != 0xd-flag and id >=
 * key) already proves the inner 416440 re-walk hits (no map write between
 * VA 0x00a14073 and the inner walk at VA 0x00a142a2). Keep code values distinct
 * from the a14270 plan codes so a driver cannot confuse the two contracts.
 * --------------------------------------------------------------------------- */
enum {
  ISAAC_RENDER_SHELL_A14050_CHAIN_PLAN_FAIL = 0,
  ISAAC_RENDER_SHELL_A14050_CHAIN_PLAN_FOUND = 1,
};

/* ---------------------------------------------------------------------------
 * G31 — a14050 chain plan (whole body decision surface, VA 0x00a14050)
 *   FAIL  (0): any G24 gate fails -> body exits AL=0 without touching
 *              DAT_00c379b8 and without running a14270.
 *   FOUND (1): G24 passed; a14270's re-walk hits the same bound, so its
 *              value slot (bound + 0x14) is read next. INSERT/THROW edges of
 *              a14270 are unreachable here (see family header block).
 * Params are the post-416440 RECAPTURED bound fields — never a pre-walk
 * snapshot; map_root is the first dword of the map object ([0xc379bc]).
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_a14050_chain_plan(uint32_t shader_id,
                                            uint32_t bound_isnil,
                                            uint32_t bound_key,
                                            uint32_t bound_ptr,
                                            uint32_t map_root_c379bc);

/* ---------------------------------------------------------------------------
 * G35 — chain resume (typed continuation at the map-value-slot edge)
 *   value_at_ptr   the RECAPTURED dword at the map value slot (bound+0x14)
 *                  after the a14270 sub-step — never a pre-call snapshot.
 *   byte_at_ptr_plus_4 the RECAPTURED byte at value_at_ptr + 4 (wide byte gate,
 *                  low byte tested exactly like `test byte ptr [eax+4], 1`).
 *   On bind-ok: *c379b8 = value_at_ptr; return 1. Else no store, return 0.
 * Identical predicate to G25/P19; exports the chain boundary entry so the
 * host driver has one named continuation per host edge.
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_a14050_chain_resume(uint32_t value_at_ptr,
                                              uint32_t byte_at_ptr_plus_4,
                                              uint32_t* c379b8);

/* ===========================================================================
 * opaque_call_00a159d0 pure body (VA 0x00a159d0) — ABI v7
 *
 * Callsite in a14050: VA 0x00a1405c (ecx = "KAGE_ColorTextureShader").
 * No nested calls; complete freestanding thiscall over NUL-terminated bytes.
 * No exact ZHL → address-stable opaque_call_00a159d0.
 *
 * PE:
 *   if this == null: return 0
 *   hash = 0x1505
 *   if *this == 0: return hash
 *   for each byte until NUL:
 *     c = lower(A-Z) ; if c == '\\' then c = '/'
 *     hash = hash * 33 + c   ; (hash<<5)+hash+c, uint32 wrap
 *   return hash
 * =========================================================================== */

/* ---------------------------------------------------------------------------
 * P24 — per-char normalize (VA 0x00a159f0…0x00a15a11)
 *   if 'A'..'Z': c += 0x20; if c == '\\': c = '/'
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_a159d0_norm_char(uint32_t ch);

/* ---------------------------------------------------------------------------
 * P25 — hash accumulate one normalized char (VA 0x00a15a14…0x00a15a1c)
 *   return (hash * 33 + norm_char) as uint32 wrap
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_a159d0_hash_step(uint32_t hash, uint32_t ch);

/* ---------------------------------------------------------------------------
 * P26 — full string hash (VA 0x00a159d0…0x00a15a28)
 *   bytes == null → 0; empty string → seed 0x1505; else fold until NUL.
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_a159d0_hash(const uint8_t* bytes);

/* ===========================================================================
 * opaque_call_00416440 complete pure body (VA 0x00416440) — ABI v8
 *
 * Callsite in a14050: VA 0x00a14073 (this=0xc379bc map, key=&shader_id,
 * out=_Tree_find_result on stack). ret 8. Zero nested calls.
 * No exact ZHL → address-stable opaque_call_00416440 (MSVC lower_bound).
 *
 * PE out struct (12 bytes) written by callee; a14050 reads bound at out+8:
 *   out[0] = last walk node
 *   out[1] = side (1 = last step left, 0 = right)
 *   out[2] = bound node (insert parent / lower_bound)
 *
 * Node layout: left@0 parent@4 right@8 isnil@0xd key@0x10 value@0x14.
 * Freestanding linear-memory model: node addresses are absolute u32
 * offsets (same pattern as exit tree iterator++).
 * =========================================================================== */

/* ---------------------------------------------------------------------------
 * P27 — one lower_bound walk step (sparse fields, no memory)
 *   if node_key >= search_key (unsigned): side=1; *bound=node; next=left
 *   else: side=0; next=right
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_416440_walk_step(uint32_t node,
                                            uint32_t node_key,
                                            uint32_t node_left,
                                            uint32_t node_right,
                                            uint32_t search_key,
                                            uint32_t* out_side,
                                            uint32_t* inout_bound);

/* ---------------------------------------------------------------------------
 * P28 — complete find_lower_bound (VA 0x00416440…0x00416488)
 *   map_head: [map this] head/sentinel address
 *   root loaded from [map_head + parent_off]; empty when isnil(root)
 *   Writes out_node / out_side / out_bound (null outs skipped).
 * --------------------------------------------------------------------------- */
void isaac_render_shell_416440_find_lower_bound(uint32_t map_head,
                                                uint32_t search_key,
                                                uint32_t* out_node,
                                                uint32_t* out_side,
                                                uint32_t* out_bound);

/* ===========================================================================
 * opaque_call_00a14270 pure islands (VA 0x00a14270) — ABI v8
 *
 * Full body is host (alloc 0xa0f4c0, insert 0x415bd0, size throw 0x4170d0).
 * When post-416440 G24 already proves a match, the found path is pure:
 *   return &node->value  (node + 0x14).
 * =========================================================================== */

/* ---------------------------------------------------------------------------
 * G27 — lookup hit (VA 0x00a142aa…0x00a142b5)
 *   !isnil && search_key >= node_key (unsigned jae) → found path.
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_a14270_lookup_hit(uint32_t node_isnil,
                                             uint32_t search_key,
                                             uint32_t node_key);

/* ---------------------------------------------------------------------------
 * P29 — found value address (VA 0x00a14309: lea eax, [edx+0x14])
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_a14270_value_ptr(uint32_t node_ptr);

/* ---------------------------------------------------------------------------
 * G28 — map size full (VA 0x00a142b7): size == 0x0aaaaaaa → host throw.
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_a14270_map_size_full(uint32_t map_size);

/* ===========================================================================
 * opaque_call_00a14270 insert residual pure (ABI v9 + v10 rebalance)
 *
 * After G27 miss and G28 not-full:
 *   host alloc 0xa0f4c0(0x18) → pure node_init → pure insert_link
 *   (size++/parent link/empty install) → pure rebalance when parent red
 *   (VA 0x00415c1a loop + pure rotates 0x415f80/0x415fe0) else pure-complete
 *   (black parent still pure-blackens root at 0x415cc9 when residual runs).
 * Size-full path: host throw 0x4170d0.
 * =========================================================================== */

/* ---------------------------------------------------------------------------
 * G29 — residual plan after lower_bound bound fields (VA 0x00a142aa…)
 *   FOUND  (0): lookup hit → return value_ptr (no alloc)
 *   THROW  (1): size full → host 0x4170d0
 *   INSERT (2): host alloc then pure node_init + insert_link
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_a14270_residual_plan(uint32_t node_isnil,
                                                uint32_t search_key,
                                                uint32_t node_key,
                                                uint32_t map_size);

/* ---------------------------------------------------------------------------
 * P36 — post-alloc node field init (VA 0x00a142df…0x00a142fa)
 *   [node+0x10]=key; [node+0x14]=0;
 *   left=parent=right=map_head; word color/isnil @+0xc = 0
 * Linear-memory stores (same model as 416440).
 * --------------------------------------------------------------------------- */
void isaac_render_shell_a14270_node_init(uint32_t node_ptr,
                                         uint32_t map_head,
                                         uint32_t key);

/* ---------------------------------------------------------------------------
 * P37 — insert_link pure prefix of 0x415bd0 (VA 0x00415bd4…0x00415c1a)
 *   map_this: [0]=head, [4]=size. Inc size; new_node->parent=parent;
 *   empty (parent==head): head L/P/R = new_node; color=1; return 0
 *   else side==0: parent->right (+ head rightmost); else parent->left
 *     (+ head leftmost). Returns 1 when parent color==0 (rebalance pure).
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_a14270_insert_link(uint32_t map_this,
                                              uint32_t parent,
                                              uint32_t side,
                                              uint32_t new_node);

/* ===========================================================================
 * 0x415bd0 rebalance residual pure-complete (ABI v10)
 *
 * Rotates 0x415f80 / 0x415fe0 are zero-call pointer rewires. Rebalance loop
 * VA 0x00415c1a…0x00415cd7 only calls those pure rotates, then blackens root.
 * =========================================================================== */

/* ---------------------------------------------------------------------------
 * P42 — rotate right (VA 0x00415f80)
 *   thiscall map_this; stack node X. L = X->left; X->left = L->right;
 *   reparent L->right if not nil; L->parent = X->parent; splice L into
 *   parent/root; L->right = X; X->parent = L.
 * --------------------------------------------------------------------------- */
void isaac_render_shell_a14270_rotate_right(uint32_t map_this, uint32_t node);

/* ---------------------------------------------------------------------------
 * P43 — rotate left (VA 0x00415fe0)
 *   Mirror of P42 on right child.
 * --------------------------------------------------------------------------- */
void isaac_render_shell_a14270_rotate_left(uint32_t map_this, uint32_t node);

/* ---------------------------------------------------------------------------
 * P44 — rebalance residual pure-complete (VA 0x00415c1a…0x00415cd7)
 *   After non-empty insert_link: while parent color red, uncle cases
 *   (color-flip or rotate L/R via P42/P43); always blacken head->parent.
 *   Empty-map path (parent==head) is pure-complete in insert_link alone.
 * --------------------------------------------------------------------------- */
void isaac_render_shell_a14270_rebalance(uint32_t map_this, uint32_t new_node);

/* ---------------------------------------------------------------------------
 * P45 — full 0x415bd0 body after node fields ready (link + residual)
 *   insert_link then, when non-empty (parent != head), rebalance residual.
 * --------------------------------------------------------------------------- */
void isaac_render_shell_a14270_insert_fix(uint32_t map_this,
                                           uint32_t parent,
                                           uint32_t side,
                                           uint32_t new_node);

/* ===========================================================================
 * a14270 host alloc / throw pure CF (ABI v11)
 *
 * INSERT path around residual 0xa0f4c0 (VA 0x00a142c0…0x00a142df):
 *   esi = [map_this]          ; P47 map_head
 *   push 0x18                 ; P46 alloc_size
 *   call 0xa0f4c0             ; HOST thin → a648b0
 *   node_init(eax, esi, key)  ; P36 (already pure)
 * a0f4c0 body pure args only (VA 0x00a0f4c0…0xa0f4cf): always MODE_ALLOC
 * cl=0, edx size_hi=0, stack arg1=0, then host a648b0. No post-alloc null
 * test in a14270 (EAX used as node unconditionally).
 *
 * THROW path (VA 0x00a142b7 / 0x00a14320): G28 size-full → host 0x4170d0
 * which pushes msg VA 0xb1b160 ("map/set too long") and IAT-calls.
 * =========================================================================== */

/* ---------------------------------------------------------------------------
 * P46 — a14270 alloc size imm (VA 0x00a142cc: push 0x18)
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_a14270_alloc_size(void);

/* ---------------------------------------------------------------------------
 * P47 — pre-alloc map head load (VA 0x00a142c0: mov esi, [edi])
 *   Linear-memory load of [map_this]. Used as node_init map_head.
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_a14270_map_head(uint32_t map_this);

/* ---------------------------------------------------------------------------
 * P48 — a0f4c0 → a648b0 pure arg pack (VA 0x00a0f4c6…0x00a0f4cf)
 *   cl = 0 (MODE_ALLOC), push 0 (arg1), xor edx (size_hi), size on stack.
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_a0f4c0_a648b0_cl(void);
uint32_t isaac_render_shell_a0f4c0_a648b0_arg1(void);
uint32_t isaac_render_shell_a0f4c0_a648b0_size_hi(void);

/* ---------------------------------------------------------------------------
 * P49 — a648b0 alloc malloc IAT size for an a0f4c0 request
 *   PE @ 0x00a6490f…: if size_hi != 0 treat size_lo as 0; then +4 header
 *   (32-bit wrap). a0f4c0 always passes size_hi=0 (edx). Host owns malloc.
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_a0f4c0_malloc_size(uint32_t request_size);

/* ---------------------------------------------------------------------------
 * P50 — a14270 fixed malloc size: a0f4c0_malloc_size(ALLOC_SIZE) → 0x1c
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_a14270_malloc_size(void);

/* ---------------------------------------------------------------------------
 * P51 — throw message VA (VA 0x004170d0: push 0xb1b160)
 *   .rdata "map/set too long". Host owns IAT call + int3.
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_a14270_throw_msg_va(void);

/* ---------------------------------------------------------------------------
 * G30 — throw needed (alias of G28 map_size_full; VA 0x00a142b7)
 *   size == 0x0aaaaaaa → residual host 0x4170d0. Predicate is pure; body host.
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_a14270_throw_needed(uint32_t map_size);

/* ---------------------------------------------------------------------------
 * P52 — INSERT-path alloc prep (pure CF before host 0xa0f4c0)
 *   Writes map_head / alloc_size / malloc_size when out pointers non-null.
 * --------------------------------------------------------------------------- */
void isaac_render_shell_a14270_insert_alloc_prep(uint32_t map_this,
                                                 uint32_t* out_map_head,
                                                 uint32_t* out_alloc_size,
                                                 uint32_t* out_malloc_size);

/* ===========================================================================
 * Room::GetLRoomAreaDesc pure islands (VA 0x0081f8b0) — ABI v8 + v9 row addr
 *
 * Exact ZHL. Type-range gate reuses G21 (type ∈ [9,12]).
 * Fail path (type out of range): pure AABB field copy from Room+0x14…0x20.
 * Success path: table row (sparse inputs) → 4× grid index/idiv → float cells.
 * Host residual: live load of row from DAT_00c35b80 when not sparsified;
 * idiv width==0 is PE-undefined (caller must pass non-zero width).
 * =========================================================================== */

/* ---------------------------------------------------------------------------
 * P38 — table row address (VA 0x0081f8d3…0x0081f8d6)
 *   return (type << 5) + table_base   ; type*0x20 + DAT_00c35b80
 * Signed type matches PE mov ecx,[nested+0x48]; shl ecx,5.
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_81f8b0_table_row_addr(int32_t room_type_48,
                                                  uint32_t table_base);

/* ---------------------------------------------------------------------------
 * P30 — non-L fallback AABB pack (VA 0x0081faa0…0x0081fad9)
 *   out[0..3] = room 0x14,0x18,0x1c,0x20
 *   out[4..7] = same four again
 * Null out skipped per-slot only when entire out is null.
 * --------------------------------------------------------------------------- */
void isaac_render_shell_81f8b0_fallback_aabb(float room_14,
                                             float room_18,
                                             float room_1c,
                                             float room_20,
                                             float* out8);

/* ---------------------------------------------------------------------------
 * P31 — grid in-bounds linear index (VA 0x0081f907…0x0081f927 family)
 *   if x∈[0,w) && y∈[0,h) (signed): return w*y + x; else -1
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_81f8b0_grid_index(int32_t x,
                                            int32_t y,
                                            int32_t width,
                                            int32_t height);

/* ---------------------------------------------------------------------------
 * P32 — signed idiv of index by width (VA 0x0081f92a: cdq; idiv)
 *   width must be non-zero. Writes quot/rem (x86 toward-zero).
 * --------------------------------------------------------------------------- */
void isaac_render_shell_81f8b0_grid_div(int32_t index,
                                       int32_t width,
                                       int32_t* out_quot,
                                       int32_t* out_rem);

/* ---------------------------------------------------------------------------
 * P33 — grid float coord (VA 0x0081f92d… scales)
 *   is_x:  rem*40 + 40 ± 20
 *   !is_x: quot*40 + 120 ± 20
 *   plus_edge: 1 → +20, 0 → -20
 * --------------------------------------------------------------------------- */
float isaac_render_shell_81f8b0_grid_coord(int32_t index_part,
                                           int32_t is_x,
                                           int32_t plus_edge);

/* ---------------------------------------------------------------------------
 * P34 — one cell (x,y) → (xf,yf) with grid index+idiv+coord (width≠0)
 * --------------------------------------------------------------------------- */
void isaac_render_shell_81f8b0_cell_xy(int32_t gx,
                                      int32_t gy,
                                      int32_t width,
                                      int32_t height,
                                      int32_t plus_edge,
                                      float* out_x,
                                      float* out_y);

/* ---------------------------------------------------------------------------
 * P35 — full L-room 8-float pack from sparse table row (VA success path)
 *   row: 8 signed ints at offsets 0,4,…,0x1c (type*0x20 table)
 *   Pair order written to out:
 *     (row0,row1) minus → out0,out1
 *     (row2,row3) plus  → out2,out3
 *     (row4,row5) minus → out4,out5
 *     (row6,row7) plus  → out6,out7
 * --------------------------------------------------------------------------- */
void isaac_render_shell_81f8b0_lroom_pack(const int32_t* row8,
                                          int32_t width,
                                          int32_t height,
                                          float* out8);

/* ---------------------------------------------------------------------------
 * ABI v30 — live DAT_00c35b80 row sparsify (plan + read + resume).
 *
 * These four exports make the last host piece of the 81f8b0 success path an
 * explicit contract. The PE row burst (VA 0x0081f8dc…0x0081f903) reads eight
 * dwords at row = (type<<5) + DAT_00c35b80 with NO internal boundary; the
 * boundary this group names is the DAT read itself as seen by a host caller
 * (e.g. the a14050 host event in the render slice). Per the recapture
 * discipline, the row dwords consumed by lroom_pack are the values read
 * AFTER that boundary — load_plan(…, LIVE) means the host must supply them
 * as resume parameters; load_plan(…, PURE) means the row window is a runtime
 * input at the P38 row address (row_read / lroom_from_row).
 * --------------------------------------------------------------------------- */

/* ---------------------------------------------------------------------------
 * G-bis — L-room row needed (VA 0x0081f8c7…0x0081f8cd)
 *   lea eax,[type-9]; cmp eax,3; ja fallback   (unsigned)
 * 1 iff type - 9 unsigned <= 3, i.e. type ∈ [9,12]. Same immediates as G21.
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_81f8b0_row_needed(int32_t room_type_48);

/* ---------------------------------------------------------------------------
 * G-bis2 — row load plan (entry, BEFORE any row-load boundary)
 *   FALLBACK: row_needed == 0 → pure AABB fallback (P30); no row, no host.
 *   PURE:     row needed AND table_sparsified != 0 → the row window is a
 *             runtime input located at table_row_addr(type, table_base);
 *             pure row_read + lroom_pack complete the path.
 *   LIVE:     row needed AND table NOT sparsified → the DAT_00c35b80 read
 *             stays host; after the boundary the 8 RECAPTURED row dwords are
 *             the parameters of isaac_render_shell_81f8b0_lroom_pack. A
 *             pre-boundary snapshot of the table is the fold this contract
 *             forbids (game_render_slice.h recapture discipline).
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_81f8b0_load_plan(int32_t room_type_48,
                                            int32_t table_sparsified);

/* ---------------------------------------------------------------------------
 * P-bis — sparsified row-window read (VA 0x0081f8dc…0x0081f903)
 *   out8[i] = int32 little-endian at row_addr + 4*i, i in [0, 8).
 * The PE loads these dwords and uses them as SIGNED grid coordinates
 * (test esi,esi / js at 0x0081f907…), so the model sign-extends.
 * row_addr == 0 → writes 8 zero dwords (safe no-op; the PE would fault).
 * --------------------------------------------------------------------------- */
void isaac_render_shell_81f8b0_row_read(uint32_t row_addr, int32_t* out8);

/* ---------------------------------------------------------------------------
 * P-bis2 — resume: full success path from the recaptured row window
 *   row_read(row_addr) → isaac_render_shell_81f8b0_lroom_pack(row8, …).
 * Returns 1 when a row was read (row_addr != 0); 0 on a null window, in
 * which case out8 is zero-filled. Width/height must be non-zero (PE idiv).
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_81f8b0_lroom_from_row(uint32_t row_addr,
                                                 int32_t width,
                                                 int32_t height,
                                                 float* out8);

/* ===========================================================================
 * Draw helpers pure complete bodies (ABI v9)
 *
 * opaque_call_00a10690 / 00a0f550 / 00a10c00 — zero nested calls, no exact ZHL.
 * Called from FUN_00817830 L-room init / type-9 path after GetLRoomAreaDesc.
 * =========================================================================== */

/* ---------------------------------------------------------------------------
 * P39 — a10690 unit-quad field init (VA 0x00a10690…0x00a106d7)
 *   PE: thiscall obj; stack float w; xmm1=x, xmm2=y, xmm3=z.
 *   Writes 8 floats at obj+0..0x1c (paired corners).
 * --------------------------------------------------------------------------- */
void isaac_render_shell_a10690_init(uint32_t obj_ptr,
                                    float x,
                                    float y,
                                    float z,
                                    float w);

/* ---------------------------------------------------------------------------
 * P40 — a0f550 packed-color → float RGBA (VA 0x00a0f550…0x00a0f601)
 *   channel = float32(byte) / 255.0f  (movzx path; DAT_00baaae4)
 *   [0]=R(arg>>16), [4]=G(arg>>8), [8]=B(arg), [0xc]=A(arg>>24); [0x10]=0
 * --------------------------------------------------------------------------- */
void isaac_render_shell_a0f550_init(uint32_t obj_ptr, uint32_t packed_arg);

/* ---------------------------------------------------------------------------
 * P41 — a10c00 pair-object fill (VA 0x00a10c00…0x00a10cf2)
 *   Corners from DAT_00c7b640/c7b644; 4× copy of 5 dwords from src_ptr
 *   into obj+0x20..0x6c. Returns void; PE returns this in EAX.
 * --------------------------------------------------------------------------- */
void isaac_render_shell_a10c00_init(uint32_t obj_ptr, uint32_t src_ptr);

/* ===========================================================================
 * Post-a14050 L-room init + type-9 pure (FUN_00817830 after return)
 * =========================================================================== */

/* ---------------------------------------------------------------------------
 * P20 — L-room quad post-ctor (VA 0x00817b8a…0x00817b8e)
 *   [obj+0x20] ← 0; return obj + 0x24 (uint32 wrap)
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_817830_lroom_quad_post(uint32_t obj_ptr,
                                                  uint8_t* flag_at_20);

/* ---------------------------------------------------------------------------
 * P20b — L-room pair advance (VA 0x00817bbd)
 *   return obj + 0x70 (uint32 wrap)
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_817830_lroom_pair_advance(uint32_t obj_ptr);

/* ---------------------------------------------------------------------------
 * G26 — L-room pre-dec loop continue (VA 0x00817b6c / 0x00817bc0)
 *   count_after = count_before - 1 (uint32 wrap)
 *   Returns 1 when more iterations remain after this body
 *   (PE: test count; jne — continue while post-dec count != 0).
 *   Initial count 12 (quads) or 6 (pairs) yields that many bodies.
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_817830_lroom_loop_step(uint32_t count_before,
                                                 uint32_t* count_after);

/* ---------------------------------------------------------------------------
 * P21 — type-9 half scale (VA 0x00817bf2 / 0x00817c8f)
 *   x * DAT_00baa2d0 (0.5f)
 * --------------------------------------------------------------------------- */
float isaac_render_shell_817830_type9_half(float scale);

/* ---------------------------------------------------------------------------
 * P22 — type-9 first cell float pack (VA 0x00817be9…0x00817c37)
 *   half_a = scale_a8 * 0.5f
 *   out_x  = mul_005 + offset_c     ; stack arg / [esp+0x60]
 *   out_y  = half_a + mul_05       ; xmm3 / [esp+0x10]
 * Null out pointers are skipped.
 * --------------------------------------------------------------------------- */
void isaac_render_shell_817830_type9_cell0(float scale_a8,
                                           float mul_005,
                                           float mul_05,
                                           float offset_c,
                                           float* out_half_a,
                                           float* out_x,
                                           float* out_y);

/* ---------------------------------------------------------------------------
 * P23 — type-9 second cell float pack (VA 0x00817c89…0x00817cc0)
 *   half_b = scale_70 * 0.5f
 *   out_sum = half_b + half_a      ; [esp+0x9c]
 *   out_y2  = out_sum + mul_05     ; xmm3 for next a10690
 * --------------------------------------------------------------------------- */
void isaac_render_shell_817830_type9_cell1(float scale_70,
                                           float half_a,
                                           float mul_05,
                                           float* out_half_b,
                                           float* out_sum,
                                           float* out_y2);

/* ===========================================================================
 * Stage-overlay residual pure (VA 0x0080ef1c…0x0080f12c) — ABI v12
 *
 * After G7 dual open (Game+8==5 && nested type==0x59):
 *   host 0x0074ea50 → AL; G31 if AL; host 0x00812d00 → Vector*;
 *   pure scale/pre-floor; host floor×2; pure /scale + camera add;
 *   pure Game+0x6edc/0x6ee0 + color@0x6ee8; G32 draw flag; G33 order;
 *   host AnimationState::Render @ 0x0040a030 ×2 with clamp DAT_00c7b640.
 * =========================================================================== */

/* ---------------------------------------------------------------------------
 * G31 — post-74ea50 open (VA 0x0080ef2d: test al,al; je skip)
 *   Returns 1 when host predicate AL is non-zero.
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_stage_overlay_host_open(uint32_t host_74ea50_al);

/* ---------------------------------------------------------------------------
 * G7 triple — dual + host AL (composite open to 812d00 residual)
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_stage_overlay_triple_open(int32_t game_field_8,
                                                    int32_t nested_room_type_10,
                                                    uint32_t host_74ea50_al);

/* ---------------------------------------------------------------------------
 * P53 — overlay scale (VA 0x0080ef53…0x0080ef5e)
 *   DAT_00bf941c * DAT_00bf93e8 = 1.0f * 2.0f = 2.0f
 * --------------------------------------------------------------------------- */
float isaac_render_shell_stage_overlay_scale(void);

/* ---------------------------------------------------------------------------
 * P54 — pre-floor X (VA 0x0080ef41…0x0080ef90)
 *   ((scroll_x - 338)*0.5 + (pos_x - 60)*0.65) * scale + 0.5
 * scroll_x = DAT_00c78dc4 (runtime); pos_x = *[esi] from host 812d00.
 * --------------------------------------------------------------------------- */
float isaac_render_shell_stage_overlay_pre_floor_x(float scroll_x_c78dc4,
                                                   float pos_x,
                                                   float scale);

/* ---------------------------------------------------------------------------
 * P55 — pre-floor Y (VA 0x0080efc2…0x0080efff)
 *   ((pos_y - 140)*0.65 + (scroll_y - 182)*0.5) * scale + 0.5
 * --------------------------------------------------------------------------- */
float isaac_render_shell_stage_overlay_pre_floor_y(float scroll_y_c78edc,
                                                   float pos_y,
                                                   float scale);

/* ---------------------------------------------------------------------------
 * P56 — post-floor divide by scale (VA 0x0080efbc / 0x0080f083)
 *   floor_val / scale  (float32)
 * --------------------------------------------------------------------------- */
float isaac_render_shell_stage_overlay_div_scale(float floor_val, float scale);

/* ---------------------------------------------------------------------------
 * P57 — camera + divided floor (VA 0x0080f0b3…0x0080f0cf)
 *   out = camera + div   (draw position component)
 * --------------------------------------------------------------------------- */
float isaac_render_shell_stage_overlay_pos_add(float camera, float div);

/* ---------------------------------------------------------------------------
 * P58 — Game+0x6edc / +0x6ee0 stores (VA 0x0080f033 / 0x0080f049)
 *   *out_6edc = src_c3793c; *out_6ee0 = src_c37940
 * --------------------------------------------------------------------------- */
void isaac_render_shell_stage_overlay_store_scales(float src_c3793c,
                                                   float src_c37940,
                                                   float* out_6edc,
                                                   float* out_6ee0);

/* ---------------------------------------------------------------------------
 * P59 — color object init at Game+0x6ee8 (VA 0x0080f051…0x0080f0a9)
 *   When dst_ptr != self_skip_ptr (MSVC copy self-check): write white
 *   RGBA (1,1,1,1), zero 0x10..0x1f, zero qword@0x20, dword@0x28=0.
 *   Returns 1 when writes applied, 0 when self-skip.
 * Linear-memory model (same as map nodes).
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_stage_overlay_color_init(uint32_t dst_ptr,
                                                    uint32_t self_skip_ptr);

/* ---------------------------------------------------------------------------
 * G32 — draw path open (VA 0x0080f0ac: cmp byte [Game+0x6f49], 0; je skip)
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_stage_overlay_draw_needed(uint32_t flag_6f49);

/* ---------------------------------------------------------------------------
 * G33 — draw order swap (VA 0x0080f0d7: cmp byte [Game+0x6eb0], 0)
 *   Returns 1 when flag != 0 → Render B (0x6e90) first then A (0x6e70).
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_stage_overlay_draw_swap(uint32_t flag_6eb0);

/* ---------------------------------------------------------------------------
 * P60 — clamp arg VA pushed twice per Render (VA 0x0080f0de… / 0x0080f118)
 *   DAT_00c7b640
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_stage_overlay_clamp_va(void);

/* ---------------------------------------------------------------------------
 * P61 — AnimationState this offsets for dual Render residual
 *   Writes first/second Game-relative offsets when out non-null.
 *   plan SKIP → zeros; ORDER_A → 0x6e70 then 0x6e90; ORDER_B reverse.
 * --------------------------------------------------------------------------- */
void isaac_render_shell_stage_overlay_anim_offsets(int32_t plan,
                                                   uint32_t* out_first_off,
                                                   uint32_t* out_second_off);

/* ---------------------------------------------------------------------------
 * G34 — draw residual plan (G32 + G33 combine)
 *   SKIP / ORDER_A / ORDER_B
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_stage_overlay_draw_plan(uint32_t flag_6f49,
                                                   uint32_t flag_6eb0);

/* ---------------------------------------------------------------------------
 * P62 — full post-floor position pack (div + camera add both axes)
 * --------------------------------------------------------------------------- */
void isaac_render_shell_stage_overlay_draw_pos(float camera_x,
                                               float camera_y,
                                               float floor_x,
                                               float floor_y,
                                               float scale,
                                               float* out_x,
                                               float* out_y);

/* ===========================================================================
 * Game::GetStageID pure CF (VA 0x00738470) — ABI v13
 *
 * Exact ZHL: __thiscall unsigned int Game::GetStageID(bool unused);
 * Stack bool is PE-unused (ret 4). this = Game* (817830 passes DAT_00c71678).
 *
 * PE:
 *   if [this_or_mgr + 0x26584 via DAT_00c71678] == 0x2c:
 *     type' = host FUN_0074f690(this, [this+0x18304])
 *     return RoomConfig::GetStageID([this+0], type', -1)
 *   if [this+0x1830c] == 2: return 0x23          ; pure-complete
 *   return RoomConfig::GetStageID([this+0], [this+4], -1)
 * =========================================================================== */

/* ---------------------------------------------------------------------------
 * G35 — mode-44 open (VA 0x00738478)
 *   Manager/Game+0x26584 == 0x2c → host 74f690 path.
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_get_stage_id_mode44(int32_t mode_26584);

/* ---------------------------------------------------------------------------
 * G36 — dim==2 pure-complete (VA 0x0073849e…0x007384ad)
 *   Reached only when mode != 0x2c. Returns 1 when dim_1830c == 2.
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_get_stage_id_dim2(int32_t dim_1830c);

/* ---------------------------------------------------------------------------
 * G37 — residual plan after sparse mode/dim (VA 0x00738470 entry CF)
 *   PURE_DIM2 (0): mode!=0x2c && dim==2 → pure return 0x23
 *   MODE44 (1):    mode==0x2c → host 74f690 then pure/host 82d030
 *   RC (2):        else → pure RoomConfig::GetStageID with stage/type
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_get_stage_id_plan(int32_t mode_26584,
                                            int32_t dim_1830c);

/* ---------------------------------------------------------------------------
 * P63 — dim2 pure result imm (VA 0x007384a7: mov eax, 0x23)
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_get_stage_id_dim2_result(void);

/* ===========================================================================
 * RoomConfig::GetStageID complete pure body (VA 0x0082d030) — ABI v13
 *
 * Exact ZHL: static unsigned int RoomConfig::GetStageID(
 *   unsigned int LevelStage (ecx), unsigned int StageType (edx),
 *   unsigned int Mode (stack)).
 * Zero nested calls; freestanding of stage/type/mode + optional difficulty
 * when Mode == -1 (auto greed from Manager+0x269c8 in {2,3}).
 * =========================================================================== */

/* ---------------------------------------------------------------------------
 * G38 — greed path select (VA 0x0082d036…0x0082d065)
 *   Mode == 1 → greed
 *   Mode == -1 && manager_nonnull && difficulty ∈ {2,3} → greed
 *   else → normal (including Mode==-1 with null manager)
 * manager_nonnull: 1 when DAT_00c71678 != 0 (sparse).
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_82d030_greed_path(int32_t mode_arg,
                                            int32_t manager_nonnull,
                                            int32_t difficulty_269c8);

/* ---------------------------------------------------------------------------
 * P64 — complete RoomConfig::GetStageID (VA 0x0082d030…0x0082d0fd)
 *   Pure map stage/type → stage_id. See section-notes/render-v13.
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_82d030_get_stage_id(uint32_t level_stage,
                                               uint32_t stage_type,
                                               int32_t mode_arg,
                                               int32_t manager_nonnull,
                                               int32_t difficulty_269c8);

/* ---------------------------------------------------------------------------
 * P65 — Game::GetStageID hybrid pure resolve (after optional host type)
 *   plan PURE_DIM2 → 0x23
 *   plan MODE44 → 82d030(stage, host_type_from_74f690, -1, …)
 *   plan RC → 82d030(stage, stage_type, -1, …)
 * host_type_from_74f690 ignored unless plan is MODE44.
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_get_stage_id_resolve(int32_t mode_26584,
                                                int32_t dim_1830c,
                                                uint32_t level_stage,
                                                uint32_t stage_type,
                                                uint32_t host_type_74f690,
                                                int32_t manager_nonnull,
                                                int32_t difficulty_269c8);

/* ===========================================================================
 * opaque_call_0074ea50 pure islands (VA 0x0074ea50) — ABI v13 + v17 polls
 *
 * Stage-overlay residual predicate (this = overlay object; Manager global).
 * Early pure false: difficulty ∈ {2,3} OR ((this0-1) u<=5 && flags bit16).
 * Else pure 6f9400/6f95a0 masks from sparse presence (host residual:
 * map lower_bound 0x4288a0 per action id); pure post-poll mode adjust +
 * type∈{4,5}; pure FUN_004217a0(Manager, 0x2f) → AL (v16).
 * With sparse presence + bitset, 74ea50 is pure-complete (v17).
 * =========================================================================== */

/* ---------------------------------------------------------------------------
 * G39 — difficulty early false (VA 0x0074ea62…0x0074ea70)
 *   difficulty_269c8 ∈ {2,3} → pure AL=0 (skip poll).
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_74ea50_diff_early_false(int32_t difficulty_269c8);

/* ---------------------------------------------------------------------------
 * G40 — flag early false (VA 0x0074ea72…0x0074ea8d)
 *   (this0 - 1) unsigned <= 5 && (flags_2654c & 0x10000) != 0 → pure AL=0.
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_74ea50_flag_early_false(uint32_t this0,
                                                  uint32_t flags_2654c);

/* ---------------------------------------------------------------------------
 * G41 — any pure early false (G39 || G40)
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_74ea50_early_false(int32_t difficulty_269c8,
                                             uint32_t this0,
                                             uint32_t flags_2654c);

/* ---------------------------------------------------------------------------
 * P66 — mgr OR before poll (VA 0x0074ea90…0x0074ea96)
 *   [Manager+0x26550] | [this+0xc]
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_74ea50_mgr_words_or(uint32_t manager_26550,
                                               uint32_t this_word_0c);

/* ---------------------------------------------------------------------------
 * P67 — post-poll mode adjust (VA 0x0074ea9a…0x0074eab5)
 *   bit2 = ((~poll_b) & (poll_a | mgr_or)) & 2
 *   return bit2 ? this0 + 1 : this0
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_74ea50_mode_adjust(uint32_t this0,
                                              uint32_t mgr_or,
                                              uint32_t poll_6f9400,
                                              uint32_t poll_6f95a0);

/* ---------------------------------------------------------------------------
 * G42 — post-poll continue to type/probe (VA 0x0074eab9…0x0074eacc)
 *   mode_adj == 6 && this4 ∈ {4,5} → host 4217a0 needed.
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_74ea50_probe_needed(uint32_t mode_adj,
                                              uint32_t this4);

/* ---------------------------------------------------------------------------
 * G43 — residual plan before any host (difficulty/flag pure)
 *   FALSE (0): early false → AL=0 pure-complete
 *   POLL (1):  need sparse presence (host 0x4288a0) then pure masks + P67/G42
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_74ea50_entry_plan(int32_t difficulty_269c8,
                                            uint32_t this0,
                                            uint32_t flags_2654c);

/* ---------------------------------------------------------------------------
 * G44 — post-poll plan (after pure poll masks when entry was POLL)
 *   FALSE (0): mode/type gate fails → AL=0
 *   PROBE (2): pure 4217a0(Manager, 0x2f)
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_74ea50_post_poll_plan(uint32_t this0,
                                                uint32_t this4,
                                                uint32_t mgr_or,
                                                uint32_t poll_6f9400,
                                                uint32_t poll_6f95a0);

/* ---------------------------------------------------------------------------
 * P68 — 4217a0 stack arg imm (VA 0x0074eace: push 0x2f)
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_74ea50_probe_arg(void);

/* ===========================================================================
 * FUN_006f9400 / FUN_006f95a0 pure islands — ABI v17
 *
 * Address-stable pure after host map lower_bound 0x004288a0 results.
 * Coordinate with ProcessInput isaac_input_mask_* (same PE VAs / bit layout);
 * freestanding render re-reason, not shared object linkage.
 * 74ea50 only tests bit1 (value 2) of (~poll_b)&(poll_a|mgr_or); full masks
 * retained for fade/aux consumers and PE fidelity.
 * =========================================================================== */

/* ---------------------------------------------------------------------------
 * P103 — map node present after lower_bound (shared by both masks)
 *   !isnil_0d && key_10 <= action_id
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_map_node_present(uint32_t isnil_0d, int32_t key_10,
                                           int32_t action_id);

/* ---------------------------------------------------------------------------
 * P104 — 6f9400 gate for action 0x39 bit (VA 0x006f947d…0x006f94b6)
 *   mode_26584 == 0x2c → false
 *   else PE signed (stage % 2) == 1
 *   else stage >= 8 → false
 *   else difficulty_269c8 ∈ {2,3} → false
 *   else true
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_6f9400_gate39(int32_t mode_26584, int32_t stage,
                                        int32_t difficulty_269c8);

/* ---------------------------------------------------------------------------
 * P105 — 6f9400 pure mask assembly from sparse presence flags
 *   bit1 OR only when present_39 && gate39
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_6f9400_mask(uint32_t present_38, uint32_t present_39,
                                       uint32_t present_3a, uint32_t present_3b,
                                       uint32_t present_3c, uint32_t present_3d,
                                       uint32_t present_3e, int32_t gate39);

/* Convenience: gate39 from mode/stage/difficulty then assemble. */
uint32_t isaac_render_shell_6f9400_mask_full(
    uint32_t present_38, uint32_t present_39, uint32_t present_3a,
    uint32_t present_3b, uint32_t present_3c, uint32_t present_3d,
    uint32_t present_3e, int32_t mode_26584, int32_t stage,
    int32_t difficulty_269c8);

/* ---------------------------------------------------------------------------
 * P106 — 6f95a0 pure mask assembly from sparse presence flags
 *   present_46 → replace mask with 0x7f; present_4f may still OR bit6
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_6f95a0_mask(uint32_t present_3f, uint32_t present_40,
                                       uint32_t present_41, uint32_t present_42,
                                       uint32_t present_43, uint32_t present_44,
                                       uint32_t present_46, uint32_t present_4f);

/* ---------------------------------------------------------------------------
 * P107 — full combine dword: (~poll_b) & (poll_a | mgr_or)
 *   Same PE op as mode_adjust / fade_poll_selects_one input.
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_poll_combine(uint32_t poll_6f9400,
                                        uint32_t poll_6f95a0,
                                        uint32_t mgr_or);

/* ---------------------------------------------------------------------------
 * P108 — complete pure AL of opaque_call_0074ea50 given sparse polls + bitset
 *   early_false → 0
 *   else mode_adjust + probe_needed → 0 or pure 4217a0_test(bitset, 0x2f)
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_74ea50_eval_al(int32_t difficulty_269c8,
                                         uint32_t this0, uint32_t this4,
                                         uint32_t flags_2654c, uint32_t mgr_or,
                                         uint32_t poll_6f9400,
                                         uint32_t poll_6f95a0,
                                         uint64_t bitset_word0);

/* ---------------------------------------------------------------------------
 * P109 — complete pure AL from sparse presence (builds poll masks then eval)
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_74ea50_eval_al_from_presence(
    int32_t difficulty_269c8, uint32_t this0, uint32_t this4,
    uint32_t flags_2654c, uint32_t mgr_or, uint32_t present_38,
    uint32_t present_39, uint32_t present_3a, uint32_t present_3b,
    uint32_t present_3c, uint32_t present_3d, uint32_t present_3e,
    int32_t mode_26584, int32_t stage, uint32_t present_3f, uint32_t present_40,
    uint32_t present_41, uint32_t present_42, uint32_t present_43,
    uint32_t present_44, uint32_t present_46, uint32_t present_4f,
    uint64_t bitset_word0);

/* ---------------------------------------------------------------------------
 * P110 — host VAs (pure mask bodies; residual lower_bound 0x4288a0)
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_6f9400_host_va(void);
uint32_t isaac_render_shell_6f95a0_host_va(void);
uint32_t isaac_render_shell_4288a0_host_va(void);
uint32_t isaac_render_shell_74ea50_host_va(void);

/* ===========================================================================
 * AnimationState::Render pure CF (VA 0x0040a030) — ABI v18
 *
 * Exact ZHL: void AnimationState::Render(const Vector& position,
 *   const Vector& topLeftClamp, const Vector& bottomRightClamp);
 * __thiscall this=AnimationState*; ret 0xc.
 *
 * PE (Capstone, full body → ret):
 *   anim = [this+4]
 *   if anim == 0: ret
 *   if [anim+0x1c] == 0: ret            ; unsigned jbe
 *   for i = 0 .. [anim+0x1c):
 *     thiscall 0x409120(
 *       ecx = [anim+0x18] + i*0x10,     ; AnimationLayer*
 *       position, [ [this+8]+i*4 ],     ; frame index
 *       topLeftClamp, bottomRightClamp,
 *       [this+0])                       ; ANM2*
 *     re-read anim = [this+4]
 * Nested 0x409120 is address-stable residual (RenderFrame-shaped; no exact
 * ZHL on this hash). Pure-complete when plan SKIP (null anim / zero layers).
 * =========================================================================== */

/* ---------------------------------------------------------------------------
 * G111 — anim non-null (VA 0x0040a03c…0x0040a041: test edx,edx; je skip)
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_40a030_anim_open(uint32_t anim_ptr);

/* ---------------------------------------------------------------------------
 * G112 — layer loop needed (VA 0x0040a045…0x0040a048: cmp [anim+0x1c],0; jbe)
 *   unsigned layer_count != 0
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_40a030_layer_loop_needed(uint32_t layer_count);

/* ---------------------------------------------------------------------------
 * G113 — residual plan (composite entry CF)
 *   SKIP (0): anim null or layer_count==0 → pure-complete (no host)
 *   HOST_LAYERS (1): host 0x409120 once per layer index
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_40a030_plan(uint32_t anim_ptr, uint32_t layer_count);

/* ---------------------------------------------------------------------------
 * P111 — AnimationLayer row stride imm (VA 0x0040a06f: add ebx, 0x10)
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_40a030_layer_stride(void);

/* ---------------------------------------------------------------------------
 * P112 — layer this pointer (VA 0x0040a058…0x0040a05e)
 *   layers_base + index * 0x10
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_40a030_layer_this(uint32_t layers_base,
                                             uint32_t index);

/* ---------------------------------------------------------------------------
 * P113 — layer frame-index slot address (VA 0x0040a060: [eax+esi*4])
 *   layer_frames_ptr + index * 4
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_40a030_layer_frame_slot(uint32_t layer_frames_ptr,
                                                   uint32_t index);

/* ---------------------------------------------------------------------------
 * P114 — loop continue after index (VA 0x0040a072…0x0040a075: cmp/jb)
 *   unsigned index < layer_count
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_40a030_loop_continue(uint32_t index,
                                               uint32_t layer_count);

/* ---------------------------------------------------------------------------
 * P115 — loop step (inc then continue test)
 *   *index_after = index_before + 1 (uint32 wrap); return continue flag
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_40a030_loop_step(uint32_t index_before,
                                           uint32_t layer_count,
                                           uint32_t* index_after);

/* ---------------------------------------------------------------------------
 * P116 — pack one host 0x409120 call site from sparse fields
 *   Writes non-null outs: layer_this, frame_index (echo), position,
 *   top_left, bottom_right, anm2. Null outs skipped.
 * --------------------------------------------------------------------------- */
void isaac_render_shell_40a030_host_args(uint32_t anm2_ptr,
                                         uint32_t layers_base,
                                         uint32_t index,
                                         int32_t frame_index,
                                         uint32_t position_ptr,
                                         uint32_t top_left_ptr,
                                         uint32_t bottom_right_ptr,
                                         uint32_t* out_layer_this,
                                         int32_t* out_frame_index,
                                         uint32_t* out_position,
                                         uint32_t* out_top_left,
                                         uint32_t* out_bottom_right,
                                         uint32_t* out_anm2);

/* ---------------------------------------------------------------------------
 * P117 — pure-complete when plan SKIP
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_40a030_pure_complete(uint32_t anim_ptr,
                                               uint32_t layer_count);

/* ---------------------------------------------------------------------------
 * P118 — host VAs
 *   40a030: exact AnimationState::Render (pure CF peeled)
 *   409120: nested per-layer residual (address-stable; entry pure v19)
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_40a030_host_va(void);
uint32_t isaac_render_shell_409120_host_va(void);

/* ===========================================================================
 * opaque_call_00409120 pure CF islands (VA 0x00409120) — ABI v19
 *
 * Nested per-layer body of AnimationState::Render. No exact ZHL (catalog
 * AnimationLayer::RenderFrame stack-frame imm 0x198 vs PE 0x1e8). Address-
 * stable residual name retained.
 *
 * __thiscall this=AnimationLayer*; stack position, frameIndex, topLeft,
 * bottomRight, ANM2*; ret 0x14.
 *
 * Entry pure (pre-host 0x408590):
 *   if [layer+0xc]==0: ret                    ; layer not visible
 *   if frameIndex < 0: ret                    ; signed js
 *   if frameIndex >= [layer+8]: ret           ; signed jge
 *   frame = [layer+4] + frameIndex*0x6c
 *   if [frame+0x2c]==0: ret                   ; frame not visible
 *   layerState = [anm2+0x7c] + [layer+0]*0xa0
 *   if [layerState+0x74]==0: ret              ; layer state not visible
 *   host 0x408590(layerState) → sprite*
 *   if sprite==0: ret
 *   flags = [anm2+0x110] | [layerState+0x8c]
 *   if (flags&4) && DAT_00c7977e==0: ret
 *   color path plan (flags&1 / DAT_c78dc0 / host 40c6f0) then draw hosts
 * =========================================================================== */

/* ---------------------------------------------------------------------------
 * G119 — layer visible (VA 0x00409161…0x0040917a: cmp [ecx+0xc],0; je out)
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_409120_layer_visible(uint32_t visible_0c);

/* ---------------------------------------------------------------------------
 * G120 — frame index in range (VA 0x00409180…0x0040918b)
 *   signed: frame_index >= 0 && frame_index < num_frames
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_409120_frame_in_range(int32_t frame_index,
                                                int32_t num_frames);

/* ---------------------------------------------------------------------------
 * P119 — AnimationFrame stride imm 0x6c (VA 0x00409191: imul eax,eax,0x6c)
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_409120_frame_stride(void);

/* ---------------------------------------------------------------------------
 * P120 — frame data pointer (VA 0x00409191…0x00409194)
 *   frames_base + frame_index * 0x6c  (uint32 wrap)
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_409120_frame_ptr(uint32_t frames_base,
                                            int32_t frame_index);

/* ---------------------------------------------------------------------------
 * G121 — frame visible (VA 0x0040919d…0x004091a1: cmp [frame+0x2c],0; je)
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_409120_frame_visible(uint32_t visible_2c);

/* ---------------------------------------------------------------------------
 * P121 — LayerState stride imm 0xa0 (lea*5; shl 5)
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_409120_layer_state_stride(void);

/* ---------------------------------------------------------------------------
 * P122 — LayerState pointer (VA 0x004091a7…0x004091af)
 *   layer_states_base + layer_id * 0xa0
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_409120_layer_state_ptr(uint32_t layer_states_base,
                                                  int32_t layer_id);

/* ---------------------------------------------------------------------------
 * G122 — layer-state visible (VA 0x004091b8…0x004091bc: cmp [edi+0x74],0)
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_409120_layer_state_visible(uint32_t visible_74);

/* ---------------------------------------------------------------------------
 * G123 — entry open (all pure gates before first host 0x408590)
 *   layer_vis && frame_in_range && frame_vis && layer_state_vis
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_409120_entry_open(uint32_t layer_vis_0c,
                                            int32_t frame_index,
                                            int32_t num_frames,
                                            uint32_t frame_vis_2c,
                                            uint32_t layer_state_vis_74);

/* ---------------------------------------------------------------------------
 * G124 — residual plan for 409120 body
 *   SKIP (0): entry closed → pure-complete (no host)
 *   HOST_BODY (1): host opens at 0x408590 then color/quad/draw chain
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_409120_plan(uint32_t layer_vis_0c,
                                      int32_t frame_index,
                                      int32_t num_frames,
                                      uint32_t frame_vis_2c,
                                      uint32_t layer_state_vis_74);

/* ---------------------------------------------------------------------------
 * P123 — pure-complete when plan SKIP
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_409120_pure_complete(uint32_t layer_vis_0c,
                                               int32_t frame_index,
                                               int32_t num_frames,
                                               uint32_t frame_vis_2c,
                                               uint32_t layer_state_vis_74);

/* ---------------------------------------------------------------------------
 * P124 — flags OR (VA 0x004091eb…0x004091f7)
 *   [anm2+0x110] | [layerState+0x8c]
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_409120_flags_or(uint32_t anm2_flags_110,
                                            uint32_t layer_flags_8c);

/* ---------------------------------------------------------------------------
 * G125 — sprite non-null after host 0x408590 (VA 0x004091dd…0x004091df)
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_409120_sprite_open(int32_t sprite_nz);

/* ---------------------------------------------------------------------------
 * G126 — flag bit4 early-out (VA 0x004091fd…0x00409209)
 *   Returns 1 when (flags & 4) != 0 && dat_c7977e == 0 → early ret.
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_409120_flag4_early_out(uint32_t flags,
                                                 uint32_t dat_c7977e);

/* ---------------------------------------------------------------------------
 * G127 — post-sprite continue (sprite open && !flag4 early-out)
 *   Reached after host 0x408590 when sparse sprite + flags supplied.
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_409120_post_sprite_continue(int32_t sprite_nz,
                                                      uint32_t flags,
                                                      uint32_t dat_c7977e);

/* ---------------------------------------------------------------------------
 * G128 — color residual path plan (VA 0x0040926c…0x0040929c)
 *   COLOR_LAYER (0): flags & 1 → layer+0x48 / frame+0x30 blend (pure v21)
 *   COLOR_ANM2  (1): DAT_00c78dc0==0 → anm2+0xa8 / layer+0x48 blend (pure v21)
 *   COLOR_HOST  (2): else pure 0x40c6f0 ring (v23) then 4071c0 copy
 * dat_c78dc0_nz: 1 when dword DAT_00c78dc0 != 0.
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_409120_color_plan(uint32_t flags,
                                            int32_t dat_c78dc0_nz);

/* ---------------------------------------------------------------------------
 * P125 — nested residual host VAs inside 409120
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_408590_host_va(void);
uint32_t isaac_render_shell_40c440_host_va(void);
uint32_t isaac_render_shell_4071c0_host_va(void);
uint32_t isaac_render_shell_4072e0_host_va(void);
uint32_t isaac_render_shell_4098a0_host_va(void);
uint32_t isaac_render_shell_409cb0_host_va(void);
uint32_t isaac_render_shell_40c6f0_host_va(void);

/* ===========================================================================
 * opaque_call_00408590 pure CF islands (VA 0x00408590) — ABI v20
 *
 * Sprite SharedPtr / cache residual of opaque_call_00409120 after entry pure
 * gates. No exact ZHL. Address-stable residual name retained.
 *
 * __thiscall this=LayerState*; stack SharedPtr* out; ret 4. Returns out.
 *
 *   sprite = [this+0x98]
 *   if sprite:
 *     if [sprite+0x30]!=[this+0x20] || [sprite+0x34]!=[this+0x24]:
 *       host vt[+0x44](sprite, this+0x20, this+0x24)
 *       pure store sprite+0x30/0x34; reload sprite
 *     if [sprite+0x38]!=[this+0x28] || [sprite+0x3c]!=[this+0x2c]:
 *       host vt[+0x48](sprite, this+0x28, this+0x2c)
 *       pure store sprite+0x38/0x3c
 *   host 0x40c550(out, &this+0x98) unless PURE_NULL pure-complete
 * =========================================================================== */

/* ---------------------------------------------------------------------------
 * G129 — sprite object present (VA 0x0040859a…0x004085a2)
 *   [layer+0x98] != 0
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_408590_sprite_present(uint32_t sprite_obj);

/* ---------------------------------------------------------------------------
 * G130 — pair-A cache equal (VA 0x004085a4…0x004085b5)
 *   sprite+0x30 == layer+0x20 && sprite+0x34 == layer+0x24
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_408590_pair_a_equal(uint32_t sprite_a0,
                                              uint32_t sprite_a1,
                                              uint32_t layer_a0,
                                              uint32_t layer_a1);

/* ---------------------------------------------------------------------------
 * G131 — pair-A update needed (sprite present && !pair_a_equal)
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_408590_pair_a_update_needed(uint32_t sprite_obj,
                                                      uint32_t sprite_a0,
                                                      uint32_t sprite_a1,
                                                      uint32_t layer_a0,
                                                      uint32_t layer_a1);

/* ---------------------------------------------------------------------------
 * G132 — pair-B cache equal (VA 0x004085e4…0x004085f4)
 *   sprite+0x38 == layer+0x28 && sprite+0x3c == layer+0x2c
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_408590_pair_b_equal(uint32_t sprite_b0,
                                              uint32_t sprite_b1,
                                              uint32_t layer_b0,
                                              uint32_t layer_b1);

/* ---------------------------------------------------------------------------
 * G133 — pair-B update needed (sprite present && !pair_b_equal)
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_408590_pair_b_update_needed(uint32_t sprite_obj,
                                                      uint32_t sprite_b0,
                                                      uint32_t sprite_b1,
                                                      uint32_t layer_b0,
                                                      uint32_t layer_b1);

/* ---------------------------------------------------------------------------
 * G134 — residual plan for 408590 body
 *   PURE_NULL (0): sprite_obj==0 && control==0 → pure-complete zero out
 *   COPY (1): no vtable; host 0x40c550 only
 *   VT44 (2) / VT48 (3) / VT_BOTH (4): host vtable(s) + pure stores + copy
 * sprite_ctrl: SharedPtr.control at layer+0x9c (sparse).
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_408590_plan(uint32_t sprite_obj,
                                      uint32_t sprite_ctrl,
                                      uint32_t sprite_a0,
                                      uint32_t sprite_a1,
                                      uint32_t layer_a0,
                                      uint32_t layer_a1,
                                      uint32_t sprite_b0,
                                      uint32_t sprite_b1,
                                      uint32_t layer_b0,
                                      uint32_t layer_b1);

/* ---------------------------------------------------------------------------
 * P131 — pure-complete when plan PURE_NULL
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_408590_pure_complete(uint32_t sprite_obj,
                                               uint32_t sprite_ctrl,
                                               uint32_t sprite_a0,
                                               uint32_t sprite_a1,
                                               uint32_t layer_a0,
                                               uint32_t layer_a1,
                                               uint32_t sprite_b0,
                                               uint32_t sprite_b1,
                                               uint32_t layer_b0,
                                               uint32_t layer_b1);

/* ---------------------------------------------------------------------------
 * P126 — apply pair-A cache stores (VA 0x004085d8…0x004085db)
 *   [sprite+0x30]=layer_a0; [sprite+0x34]=layer_a1  (linear-memory model)
 * --------------------------------------------------------------------------- */
void isaac_render_shell_408590_apply_pair_a_cache(uint32_t sprite_obj,
                                                  uint32_t layer_a0,
                                                  uint32_t layer_a1);

/* ---------------------------------------------------------------------------
 * P127 — apply pair-B cache stores (VA 0x00408611…0x00408614)
 *   [sprite+0x38]=layer_b0; [sprite+0x3c]=layer_b1
 * --------------------------------------------------------------------------- */
void isaac_render_shell_408590_apply_pair_b_cache(uint32_t sprite_obj,
                                                  uint32_t layer_b0,
                                                  uint32_t layer_b1);

/* ---------------------------------------------------------------------------
 * P128 — field / vtable offset constants
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_408590_layer_sprite_off(void);
uint32_t isaac_render_shell_408590_layer_ctrl_off(void);
uint32_t isaac_render_shell_408590_vt_pair_a_off(void);
uint32_t isaac_render_shell_408590_vt_pair_b_off(void);

/* ---------------------------------------------------------------------------
 * G135 — 40c550 src control null (VA 0x0040c56d…0x0040c56f)
 *   [src+4] == 0 → leave dest zeroed; pure-complete copy path
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_40c550_src_control_null(uint32_t src_ctrl);

/* ---------------------------------------------------------------------------
 * G136 — 40c550 needs host AddRef path
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_40c550_need_addref(uint32_t src_ctrl);

/* ---------------------------------------------------------------------------
 * P129 — zero SharedPtr dest (VA 0x0040c55b…0x0040c568)
 *   [dest+0]=0; [dest+4]=0  (linear-memory model; no-op if dest_ptr==0)
 * --------------------------------------------------------------------------- */
void isaac_render_shell_40c550_zero_dest(uint32_t dest_ptr);

/* ---------------------------------------------------------------------------
 * P130 — assign SharedPtr after successful AddRef (VA 0x0040c59f…0x0040c5a2)
 *   [dest+0]=obj; [dest+4]=ctrl
 * --------------------------------------------------------------------------- */
void isaac_render_shell_40c550_assign(uint32_t dest_ptr,
                                     uint32_t src_obj,
                                     uint32_t src_ctrl);

/* ---------------------------------------------------------------------------
 * P132 — nested residual host VAs for 408590 body
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_40c550_host_va(void);

/* ===========================================================================
 * Color residual pure bodies (ABI v21) — after 408590 / color_plan
 *
 * opaque_call_004071c0 (VA 0x004071c0): __thiscall dest=ecx; stack Color*;
 *   ret 4. Copies 0x2c bytes (movups×2 + movq + mov dword). Zero nested
 *   calls. Pure-complete. Returns dest.
 *
 * opaque_call_006831c0 (VA 0x006831c0): __thiscall inout=ecx; stack Color*;
 *   ret 4. Nested by 4072e0. Tint mul [0..0xc], offset plan on sum of
 *   [0x10]+[0x14]+[0x18] (ucomiss/lahf ordered-eq 0), then always add
 *   [0x20..0x28]. DAT_00baa2d0 = 0.5f. Zero nested calls. Pure-complete.
 *
 * opaque_call_004072e0 (VA 0x004072e0): __thiscall dest=ecx; edx=other*;
 *   stack by-value Color (lhs, 0x2c). Calls 6831c0(&lhs, other) then copies
 *   lhs → dest (same pack as 4071c0). Pure-complete when 6831c0 pure.
 *
 * Color-ring 0x40c6f0 pure-complete under ABI v23 (sparse DAT_c78db4..c78dc0).
 * =========================================================================== */

/* ---------------------------------------------------------------------------
 * P133 — ColorMod size imm 0x2c / float count 11
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_color_size(void);
uint32_t isaac_render_shell_color_floats(void);

/* ---------------------------------------------------------------------------
 * P134 — opaque_call_004071c0 complete pure body (VA 0x004071c0…0x004071e7)
 *   Copy 11 float32 / 0x2c bytes from src → dest. Null dest or src is no-op.
 * --------------------------------------------------------------------------- */
void isaac_render_shell_4071c0_copy(float* dest, const float* src);

/* ---------------------------------------------------------------------------
 * P135 — offset RGB sum (VA 0x00683202…0x00683214 / 0x00683221…0x00683237)
 *   float32(r) + float32(g) + float32(b)  (PE addss chain)
 * --------------------------------------------------------------------------- */
float isaac_render_shell_6831c0_offset_sum(float off_r, float off_g, float off_b);

/* ---------------------------------------------------------------------------
 * G137 — offset residual plan (VA 0x00683214…0x0068325b)
 *   SKIP (0): other_sum ordered-equal 0 → leave this offsets
 *   COPY (1): other nonzero/NaN && this_sum ordered-equal 0 → copy other
 *   AVERAGE (2): both nonzero/NaN → (this+other)*0.5
 * Matches PE ucomiss/lahf/test ah,0x44 jnp/jp (C == for ordered-eq).
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_6831c0_offset_plan(float this_sum, float other_sum);

/* ---------------------------------------------------------------------------
 * P136 — opaque_call_006831c0 complete pure body (VA 0x006831c0…0x006832d1)
 *   In-place Color mul-blend: inout *= other (tint / offset / add).
 *   Null inout or other is no-op.
 * --------------------------------------------------------------------------- */
void isaac_render_shell_6831c0_mul_blend(float* inout, const float* other);

/* ---------------------------------------------------------------------------
 * P137 — opaque_call_004072e0 complete pure body (VA 0x004072e0…0x00407312)
 *   dest = lhs; then mul_blend(dest, other). Pure-complete composition.
 *   Null dest is no-op; null lhs/other treated as no-op for that source.
 * --------------------------------------------------------------------------- */
void isaac_render_shell_4072e0_blend(float* dest,
                                    const float* lhs,
                                    const float* other);

/* ---------------------------------------------------------------------------
 * P138 — address-stable VAs (4071c0/4072e0/6831c0 pure-complete v21;
 *   40c6f0 pure-complete v23)
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_6831c0_host_va(void);

/* ===========================================================================
 * opaque_call_0074f690 pure CF (VA 0x0074f690) — ABI v14
 *
 * Mode-44 stage-type helper (no exact ZHL). __thiscall Game* this, stack
 * room_idx (often Game+0x18304). Returns stage type in EAX.
 *
 * PE summary:
 *   if mode_26584 != 0x2c: return [this+4]
 *   if room_idx == -10:
 *     if [this]==7: return 4 else return [this+4]
 *   if room_idx < 0: return [this+4]
 *   if [this+0x183a0]==0:
 *     room = host Game::GetRoomByIdx(room_idx, -1)   ; exact ZHL 0x00740bc0
 *     if [room+0x10]!=0: room_idx = clamp([room], 0..0xa8)
 *   if stage<=6: float table @ 0xb6a878
 *   elif stage∈{7,8}:
 *     dist from grid /13 vs slot field; if dist<=3 return 4
 *     else float table @ 0xb6a8e0
 *   else return [this+4]
 * =========================================================================== */

/* ---------------------------------------------------------------------------
 * G45 — entry residual plan (VA 0x0074f69c…0x0074f6ca)
 *   TYPE4 / CONST4 / GETROOM / STAGE from mode, room_idx, stage, flag_183a0.
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_74f690_entry_plan(int32_t mode_26584,
                                            int32_t room_idx,
                                            int32_t stage_0,
                                            uint32_t flag_183a0);

/* ---------------------------------------------------------------------------
 * P69 — special room_idx imm -10 (VA 0x0074f6a8: cmp esi, -0xa)
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_74f690_room_idx_special(void);

/* ---------------------------------------------------------------------------
 * P70 — GetRoomByIdx dimension stack imm -1 (VA 0x0074f6cc: push -1)
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_74f690_getroom_dim(void);

/* ---------------------------------------------------------------------------
 * P71 — nested host VA Game::GetRoomByIdx (exact ZHL 0x00740bc0)
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_74f690_getroom_va(void);

/* ---------------------------------------------------------------------------
 * P72 — clamp room idx from RoomDescriptor after host GetRoomByIdx
 *   if field10_nz==0: return room_idx_in unchanged
 *   else v=[room+0]; if v<=0 v=0; if v<0xa8 return v else 0xa8
 *   (VA 0x0074f6d4…0x0074f6ed)
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_74f690_clamp_room_idx(int32_t room_idx_in,
                                                int32_t room_desc_dword0,
                                                int32_t room_desc_field10_nz);

/* ---------------------------------------------------------------------------
 * P73 — apply optional GetRoomByIdx clamp (flag==0 path post-host)
 *   flag_183a0!=0 → room_idx_in; else clamp_room_idx(...)
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_74f690_final_room_idx(int32_t room_idx_in,
                                                uint32_t flag_183a0,
                                                int32_t room_desc_dword0,
                                                int32_t room_desc_field10_nz);

/* ---------------------------------------------------------------------------
 * G46 — stage residual plan after room_idx final (VA 0x0074f6f0…0x0074f756)
 *   TABLE_LO (0): stage signed <= 6
 *   WOMB (1):     stage == 7 or 8
 *   TYPE4 (2):    else
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_74f690_stage_plan(int32_t stage_0);

/* ---------------------------------------------------------------------------
 * P74 — MSVC signed divide by 13 (magic 0x4ec4ec4f; sar 2; +sign)
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_74f690_sdiv13(int32_t value);

/* ---------------------------------------------------------------------------
 * P75 — stage 7/8 grid distance (VA 0x0074f75c…0x0074f7a9)
 *   field14 = [Game + 0x14 + [Game+0x18314]*0xb8] (sparse)
 *   dist = abs((room/13-field/13)*13 - room + field) + abs(field/13 - room/13)
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_74f690_womb_distance(int32_t room_idx,
                                               int32_t field14);

/* ---------------------------------------------------------------------------
 * G47 — womb near (VA 0x0074f7ac: cmp ecx, 3; jg table)
 *   dist <= 3 → pure return 4
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_74f690_womb_near(int32_t distance);

/* ---------------------------------------------------------------------------
 * P76 — float axis: *5.0f, maxss 0, minss ~4.999, cvttss2si
 *   (VA 0x0074f6f7…0x0074f717 and twin)
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_74f690_scale_axis(float value);

/* ---------------------------------------------------------------------------
 * P77 — table index = row*5 + col (lea eax,[eax+eax*4]; add eax,ecx)
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_74f690_table_index(int32_t row, int32_t col);

/* ---------------------------------------------------------------------------
 * P78 — PE table LO lookup (stage<=6) at 0xb6a878, index 0..24
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_74f690_table_lo(int32_t index);

/* ---------------------------------------------------------------------------
 * P79 — PE table HI lookup (stage 7/8 far) at 0xb6a8e0, index 0..24
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_74f690_table_hi(int32_t index);

/* ---------------------------------------------------------------------------
 * P80 — float-table stage type from two sparse Game floats
 *   use_hi_table=0 → LO table; non-zero → HI table.
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_74f690_float_table_type(float f_183b0,
                                                   float f_18654,
                                                   int32_t use_hi_table);

/* ---------------------------------------------------------------------------
 * P81 — slot field address formula offset (not a load):
 *   0x14 + room_slot_18314 * 0xb8  (relative to Game*)
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_74f690_slot_field_off(int32_t room_slot_18314);

/* ---------------------------------------------------------------------------
 * P82 — hybrid pure resolve of 74f690 given sparse + optional host GetRoom
 *   host_getroom_done: 1 when GETROOM host already ran (or flag skipped path
 *   supplies field10_nz=0 so clamp is no-op). When entry is TYPE4/CONST4,
 *   host/float/field args ignored.
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_74f690_resolve(int32_t mode_26584,
                                          int32_t room_idx,
                                          int32_t stage_0,
                                          uint32_t stage_type_4,
                                          uint32_t flag_183a0,
                                          int32_t room_desc_dword0,
                                          int32_t room_desc_field10_nz,
                                          float f_183b0,
                                          float f_18654,
                                          int32_t field14);

/* ===========================================================================
 * Game::GetRoomByIdx pure CF (VA 0x00740bc0) — ABI v15
 *
 * Exact ZHL: RoomDescriptor* Game::GetRoomByIdx(int idx, int dimension)
 * (also Level::GetRoomByIdx same pattern). __thiscall Game* this.
 *
 * PE summary (body after SEH / once-init residual):
 *   dim = dim_signed < 0 ? [this+0x1830c] : dim
 *   if dim_u >= 3: return &DAT_00c81090
 *   if idx == -100:
 *     if [this+0x18304] < 0: empty
 *     else host recurse(current_idx, dim==0 ? 1 : 0)
 *   if idx == -101:
 *     if current < 0: empty
 *     if dim == 0: host recurse(0xa2, 1)
 *     else walk room list (match kind0/type1/var10) → desc or empty
 *   if (idx+0x14)_u > 0xbc: empty
 *   if idx < 0: return this - idx*0xb8 + 0x16bc4
 *   slot = [this + (dim*0xa9+idx)*4 + 0x17adc]
 *   if slot_u > 0x20e: empty
 *   return this + slot*0xb8 + 0x14
 *
 * Once-init residual host (TLS guard DAT_00c8108c): aef29d / 6ef590 /
 * atexit / aef253 when guard_signed > tls[0xc]. Full body remains host for
 * RECURSE/WALK/once-init; GRID/NEGATIVE/EMPTY pure with sparse slot.
 * =========================================================================== */

/* ---------------------------------------------------------------------------
 * P83 — effective dimension (VA 0x00740bff…0x00740c0c)
 *   dim_signed < 0 → game_dim_1830c; else dim_signed
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_740bc0_dim_effective(int32_t dim, int32_t game_dim);

/* ---------------------------------------------------------------------------
 * G48 — dimension in range (VA 0x00740c0c: cmp ecx,3; jae empty)
 *   unsigned dim < 3
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_740bc0_dim_in_range(int32_t dim_eff);

/* ---------------------------------------------------------------------------
 * G49 — idx in grid/neg range (VA 0x00740ce0: lea +0x14; cmp 0xbc; ja)
 *   (idx + 0x14) unsigned <= 0xbc  → idx ∈ [-20, 168]
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_740bc0_idx_in_range(int32_t idx);

/* ---------------------------------------------------------------------------
 * G50 — entry residual plan (VA 0x00740c0c…0x00740d0f)
 *   EMPTY / NEGATIVE / GRID / RECURSE_CURRENT / RECURSE_SPECIAL / WALK
 *   dim_eff already effective; current_idx = Game+0x18304 sparse.
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_740bc0_entry_plan(int32_t dim_eff,
                                            int32_t idx,
                                            int32_t current_idx);

/* ---------------------------------------------------------------------------
 * P84 — current-room recurse dimension (VA 0x00740c2b…0x00740c34: sete)
 *   dim_eff == 0 → 1 else 0
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_740bc0_current_recurse_dim(int32_t dim_eff);

/* ---------------------------------------------------------------------------
 * P85 — special recurse idx/dim imms for -101 && dim==0
 *   push 0xa2 / push 1 (VA 0x00740c64…0x00740c66)
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_740bc0_special_recurse_idx(void);
int32_t isaac_render_shell_740bc0_special_recurse_dim(void);

/* ---------------------------------------------------------------------------
 * P86 — negative-idx Game-relative RoomDescriptor offset
 *   0x16bc4 - idx*0xb8  (VA 0x00740cee…0x00740cf6)
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_740bc0_neg_desc_off(int32_t idx);

/* ---------------------------------------------------------------------------
 * P87 — grid map element Game-relative offset of slot dword
 *   (dim*0xa9 + idx)*4 + 0x17adc  (VA 0x00740d0f…0x00740d17)
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_740bc0_map_elem_off(int32_t dim_eff, int32_t idx);

/* ---------------------------------------------------------------------------
 * G51 — slot valid (VA 0x00740d1e: cmp eax,0x20e; ja empty)
 *   slot unsigned <= 0x20e
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_740bc0_slot_valid(uint32_t slot);

/* ---------------------------------------------------------------------------
 * P88 — grid slot → RoomDescriptor Game-relative offset
 *   slot*0xb8 + 0x14  (VA 0x00740d25…0x00740d2e)
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_740bc0_slot_desc_off(uint32_t slot);

/* ---------------------------------------------------------------------------
 * P89 — empty RoomDescriptor absolute VA DAT_00c81090
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_740bc0_empty_va(void);

/* ---------------------------------------------------------------------------
 * P90 — once-init guard VA DAT_00c8108c
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_740bc0_once_guard_va(void);

/* ---------------------------------------------------------------------------
 * G52 — once-init needed (VA 0x00740bf3: cmp guard, tls+0xc; jg host)
 *   signed guard > tls_c
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_740bc0_once_init_needed(int32_t guard_val,
                                                  int32_t tls_c);

/* ---------------------------------------------------------------------------
 * G53 — walk match predicate (VA 0x00740c94…0x00740ca6)
 *   kind_m4==0 && type_at8==1 && field_at10==10
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_740bc0_walk_match(int32_t kind_m4,
                                            int32_t type_at8,
                                            int32_t field_at10);

/* ---------------------------------------------------------------------------
 * P91 — walk cursor start / stride / result delta
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_740bc0_walk_start_off(void);
uint32_t isaac_render_shell_740bc0_walk_stride(void);
int32_t isaac_render_shell_740bc0_walk_result_delta(void);

/* ---------------------------------------------------------------------------
 * P92 — host GetRoomByIdx VA (exact ZHL 0x00740bc0)
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_740bc0_host_va(void);

/* ---------------------------------------------------------------------------
 * G54 — hybrid resolve kind EMPTY / GAME_OFF / HOST
 *   slot used only when plan is GRID (sparse map dword).
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_740bc0_resolve_kind(int32_t dim_eff,
                                              int32_t idx,
                                              int32_t current_idx,
                                              uint32_t slot);

/* ---------------------------------------------------------------------------
 * P93 — hybrid resolve Game-relative offset when kind==GAME_OFF; else 0
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_740bc0_resolve_game_off(int32_t dim_eff,
                                                   int32_t idx,
                                                   int32_t current_idx,
                                                   uint32_t slot);

/* ===========================================================================
 * opaque_call_00812d00 complete pure body (VA 0x00812d00) — ABI v16
 *
 * Zero nested calls. PE loads Room* from Manager (DAT_00c71678+0x18300);
 * Game* this is PE-unused. Writes Vector {x,y} to stack out and returns out.
 *
 *   desc = [Room+4]; nest = desc ? [desc+0x10] : 0
 *   if nest:
 *     t = [nest+0x48]; if (t-9)_u <= 3:
 *       div = JT[t-9] ∈ {0x148,0x13b,0x84,0x77}
 *       (quot,rem) = idiv(div, [Room+0xc])   ; width != 0 on L path
 *       out_x = float(rem)*40 + 40
 *       out_y = float(quot)*40 + 120
 *       ret
 *   out_x = ([Room+0x1c]-[Room+0x14])*0.5 + [Room+0x14]
 *   out_y = ([Room+0x20]-[Room+0x18])*0.5 + [Room+0x18]
 * =========================================================================== */

/* ---------------------------------------------------------------------------
 * G55 — type chain open (VA 0x00812d0e…0x00812d1a)
 *   field4_nz && nested10_nz
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_812d00_type_chain_open(int32_t field4_nz,
                                                 int32_t nested10_nz);

/* ---------------------------------------------------------------------------
 * G56 — L-room type range (VA 0x00812d1f…0x00812d25: sub 9; cmp 3; ja)
 *   (type - 9) unsigned <= 3  → type ∈ [9,12]
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_812d00_lroom_type_open(int32_t room_type_48);

/* ---------------------------------------------------------------------------
 * G57 — residual plan AABB (0) vs LROOM (1)
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_812d00_plan(int32_t field4_nz,
                                      int32_t nested10_nz,
                                      int32_t room_type_48);

/* ---------------------------------------------------------------------------
 * P94 — L-room dividend from jump table (VA 0x00812d27…cases)
 *   type must be in [9,12]; undefined otherwise (caller gates).
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_812d00_lroom_dividend(int32_t room_type_48);

/* ---------------------------------------------------------------------------
 * P95 — L-room grid Vector from dividend / width (VA 0x00812d33…0x00812d6a)
 *   width must be non-zero (PE idiv). Writes float32 x/y.
 * --------------------------------------------------------------------------- */
void isaac_render_shell_812d00_lroom_xy(int32_t dividend,
                                       int32_t room_width_c,
                                       float* out_x,
                                       float* out_y);

/* ---------------------------------------------------------------------------
 * P96 — AABB center Vector (VA 0x00812d88…0x00812dbd)
 *   x = (right-left)*0.5 + left; y = (bottom-top)*0.5 + top
 * --------------------------------------------------------------------------- */
void isaac_render_shell_812d00_aabb_center(float room_14,
                                          float room_18,
                                          float room_1c,
                                          float room_20,
                                          float* out_x,
                                          float* out_y);

/* ---------------------------------------------------------------------------
 * P97 — complete pure body of opaque_call_00812d00
 *   Sparse Room fields; plan selects LROOM vs AABB path.
 * --------------------------------------------------------------------------- */
void isaac_render_shell_812d00_compute(int32_t field4_nz,
                                      int32_t nested10_nz,
                                      int32_t room_type_48,
                                      int32_t room_width_c,
                                      float room_14,
                                      float room_18,
                                      float room_1c,
                                      float room_20,
                                      float* out_x,
                                      float* out_y);

/* ---------------------------------------------------------------------------
 * P98 — host VA of opaque_call_00812d00 (now pure-complete)
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_812d00_host_va(void);

/* ===========================================================================
 * opaque_call_004217a0 complete pure body (VA 0x004217a0) — ABI v16
 *
 * Zero nested calls. __thiscall Manager/Game* this; stack challenge_id.
 *   id = clamp(challenge_id, 0, 0x34)
 *   bit = id & 0x3f; word = id >> 6
 *   test bit in [this+0x26548 + word*8] 64-bit limb
 *   AL = 1 if set else 0; ret 4
 * Clamp max 0x34 ⇒ word always 0; sparse low 64-bit limb is sufficient.
 * =========================================================================== */

/* ---------------------------------------------------------------------------
 * v109 dedupe: the 0x004217a0 clamp law is OWNED by the frame-opaque family
 * (isaac_frame_opaque_4217a0_clamp_id + the full bitset band, ABI v39).
 * isaac_render_shell_4217a0_clamp_id was REMOVED from this header/cpp; its
 * body remains as a file-local helper used ONLY by isaac_render_shell_
 * 4217a0_test (the consumer 64-bit limb probe for the 74ea50 path). NO
 * duplicate law export. Host-VA constants stay:
 * ISAAC_RENDER_SHELL_HOST_4217A0_VA / ISAAC_RENDER_SHELL_4217A0_PROBE_ARG.
 * See section-notes/update-v109-dupva-dedupe/.
 * --------------------------------------------------------------------------- */

/* ---------------------------------------------------------------------------
 * P100 — complete pure bit test on sparse low 64-bit limb
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_4217a0_test(uint64_t bitset_word0,
                                      int32_t challenge_id);

/* ---------------------------------------------------------------------------
 * P101 — host VA of opaque_call_004217a0 (now pure-complete)
 * --------------------------------------------------------------------------- */
uint32_t isaac_render_shell_4217a0_host_va(void);

/* ---------------------------------------------------------------------------
 * P102 — 74ea50 probe arg imm (push 0x2f) — same as G44 / PROBE residual
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_4217a0_probe_arg(void);

/* ===========================================================================
 * AnimationLayer::GetSourceQuad pure body (VA 0x004098a0) — ABI v22
 *
 * Exact ZHL static __stdcall SourceQuad* GetSourceQuad(SourceQuad* ret,
 *   void* unused, const AnimationFrame& frame, const LayerState& layer,
 *   const Vector& topLeftClamp, const Vector& BottomRightClamp,
 *   const ANM2& animation); ret 0x1c.
 *
 * Pure: crop clamp rect, flip-X/Y corner swaps from scale sign mismatch,
 * flag-bit2 RNG plan, xorshift unit jitter (sparse seed/shifts), cropOffset
 * translate. Host residual only: a112c0 when (flags&2) && seed==0.
 * =========================================================================== */

/* G138 — effective flipY (VA 0x004098a9…0x004098d1)
 *   if DAT_c7977d==0: anm2_flip_y else !anm2_flip_y  (sete) */
uint32_t isaac_render_shell_4098a0_effective_flip_y(uint32_t anm2_flip_y,
                                                  uint32_t dat_c7977d);

/* P139 — scale_x = frame.scale.x * layer.size.x (VA 0x004098e3…0x004098e8) */
float isaac_render_shell_4098a0_scale_x(float frame_scale_x, float layer_size_x);

/* P140 — scale_y = frame.scale.y * layer.size.y (VA 0x00409904…0x00409909) */
float isaac_render_shell_4098a0_scale_y(float frame_scale_y, float layer_size_y);

/* P141 — clamp-adjusted crop rect (left/top/right/bottom) before flips */
void isaac_render_shell_4098a0_crop_rect(float frame_crop_x, float frame_crop_y,
                                         float frame_w, float frame_h,
                                         float scale_x, float scale_y,
                                         float clamp_tl_x, float clamp_tl_y,
                                         float clamp_br_x, float clamp_br_y,
                                         float* out_l, float* out_t, float* out_r,
                                         float* out_b);

/* G139 — f32 strictly negative via comiss seta (0 > x) */
int32_t isaac_render_shell_4098a0_f32_strict_neg(float x);

/* P142 — xorps sign-bit negate (DAT_00bacb70 = -0.0) */
float isaac_render_shell_4098a0_f32_neg(float x);

/* G140 — FlipX needed: sign(eff_anm2_sx) != sign(eff_scale_x) */
int32_t isaac_render_shell_4098a0_flip_x_needed(float scale_x, float anm2_scale_x,
                                                uint32_t layer_flip_x,
                                                uint32_t anm2_flip_x);

/* G141 — FlipY needed: sign(eff_scale_y) != sign(eff_anm2_sy) */
int32_t isaac_render_shell_4098a0_flip_y_needed(float scale_y, float anm2_scale_y,
                                                uint32_t layer_flip_y,
                                                uint32_t eff_anm2_flip_y);

/* G142 — flags & 2 open (VA 0x00409a6f) */
int32_t isaac_render_shell_4098a0_rng_flag_open(uint32_t flags_or);

/* G143 — residual plan PURE / RNG / HOST_ASSERT */
int32_t isaac_render_shell_4098a0_plan(uint32_t flags_or, uint32_t rng_seed);

/* P143 — pure-complete when plan != HOST_ASSERT */
int32_t isaac_render_shell_4098a0_pure_complete(uint32_t flags_or,
                                               uint32_t rng_seed);

/* P144 — xorshift step (VA 0x00409aba…0x00409aee / 0x00409b56…0x00409b78)
 *   seed' = ((seed>>shr1)^seed); seed' = ((seed'<<shl)^seed'); seed' = ((seed'>>shr2)^seed')
 *   Shift counts use low 5 bits (x86 32-bit variable shift). */
uint32_t isaac_render_shell_4098a0_rng_step(uint32_t seed, uint32_t shr1,
                                            uint32_t shl, uint32_t shr2);

/* P145 — unit jitter in ≈[-0.5,0.5): u32_to_f32(seed)*RNG_UNIT - 0.5 */
float isaac_render_shell_4098a0_rng_unit(uint32_t seed);

/* P146 — complete pure GetSourceQuad write into linear-memory SourceQuad*
 *   out_ptr: Wasm linear address of SourceQuad (0x24). Returns final RNG seed
 *   (unchanged when !(flags&2)). When plan HOST_ASSERT, still writes non-RNG
 *   body then stops before jitter (caller must host-assert). */
uint32_t isaac_render_shell_4098a0_compute(
    uint32_t out_ptr, float frame_crop_x, float frame_crop_y, float frame_w,
    float frame_h, float frame_scale_x, float frame_scale_y, float layer_size_x,
    float layer_size_y, uint32_t layer_flip_x, uint32_t layer_flip_y,
    float layer_crop_x, float layer_crop_y, float clamp_tl_x, float clamp_tl_y,
    float clamp_br_x, float clamp_br_y, float anm2_scale_x, float anm2_scale_y,
    uint32_t anm2_flip_x, uint32_t anm2_flip_y, uint32_t dat_c7977d,
    uint32_t flags_or, uint32_t rng_seed, uint32_t rng_shr1, uint32_t rng_shl,
    uint32_t rng_shr2);

/* P147 — nested residual host VAs for GetSourceQuad RNG assert */
uint32_t isaac_render_shell_a112c0_host_va(void);
uint32_t isaac_render_shell_4098a0_rng_msg_va(void);
int32_t isaac_render_shell_4098a0_rng_msg_arg(void);

/* ===========================================================================
 * opaque_call_00409cb0 dest-quad pure CF islands (VA 0x00409cb0) — ABI v22/v24
 *
 * GetDestQuad-shaped (ZHL DestinationQuad* GetDestQuad pattern no exact match
 * on this hash: stack imm 0x4c vs catalog 0x44). Address-stable residual name.
 * __stdcall ret 0x1c (7 stack args + hidden return slot).
 *
 * Pure (v22): flags OR, effective flipY, flag-bit8 open, scale packs.
 * Pure (v24): nested a10d00 / a10950 / a10760 complete freestanding bodies
 * (a0f550 pure since v9). Whole 409cb0 position-glue body still not a single
 * pure compute export (plan remains HOST_BODY).
 * =========================================================================== */

/* G144 — flags OR (anm2+0x110 | layer+0x8c) at entry */
uint32_t isaac_render_shell_409cb0_flags_or(uint32_t anm2_flags_110,
                                            uint32_t layer_flags_8c);

/* G145 — flag bit8 open (VA 0x00409d9d: test dl, 8) */
int32_t isaac_render_shell_409cb0_flag8_open(uint32_t flags_or);

/* P148 — scale_x/y packs (frame.scale * layer.size) shared with source */
float isaac_render_shell_409cb0_scale_x(float frame_scale_x, float layer_size_x);
float isaac_render_shell_409cb0_scale_y(float frame_scale_y, float layer_size_y);

/* G146 — residual plan: PURE since ABI v25 (every callee translated) */
int32_t isaac_render_shell_409cb0_plan(void);

/* P149 — pure-complete? 1 since ABI v25 (whole body is a pure compute) */
int32_t isaac_render_shell_409cb0_pure_complete(void);

/* P150 — nested residual host VAs inside dest-quad body (now pure freestanding) */
uint32_t isaac_render_shell_a0f550_host_va(void);
uint32_t isaac_render_shell_a10d00_host_va(void);
uint32_t isaac_render_shell_a10950_host_va(void);
uint32_t isaac_render_shell_a10760_host_va(void);

/* ===========================================================================
 * Dest-quad nested pure bodies (ABI v24)
 *
 * opaque_call_00a10d00 / 00a10950 / 00a10760 — no exact ZHL.
 * Called from opaque_call_00409cb0 after pure a0f550 color pack.
 * =========================================================================== */

/* ---------------------------------------------------------------------------
 * P158 — a10d00 AABB dest-quad + 4× color pack (VA 0x00a10d00…0x00a10dc0)
 *   PE: thiscall dest=ecx; stack float bottom, color* (5 dwords);
 *   xmm1=left, xmm2=top, xmm3=right; ret 8; returns this.
 *   Writes DestinationQuad corners then 4 copies of color into +0x20..+0x6c.
 * --------------------------------------------------------------------------- */
void isaac_render_shell_a10d00_init(uint32_t obj_ptr, float left, float top,
                                   float right, float bottom,
                                   uint32_t color_ptr);

/* G148 — a10d00 pure-complete? always 1 (zero nested calls) */
int32_t isaac_render_shell_a10d00_pure_complete(void);

/* ---------------------------------------------------------------------------
 * G149 — a10950 scale identity (VA 0x00a10971…0x00a1098a)
 *   ordered-eq scale.x==1.0 && scale.y==1.0 → SKIP (no-op return)
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_a10950_scale_identity(float scale_x, float scale_y);

/* G150 — residual plan SKIP / APPLY */
int32_t isaac_render_shell_a10950_plan(float scale_x, float scale_y);

/* P159 — a10950 scale-about-offset in-place (VA 0x00a10950…0x00a10aa6)
 *   PE: thiscall quad=ecx; stack Vector* offset, Vector* scale; ret 8.
 *   When plan SKIP: no store. Else for each corner:
 *     p' = (p + (-offset)) * scale + offset
 *   (xorps -0.0 for negate). Returns void; PE returns this in EAX.
 * --------------------------------------------------------------------------- */
void isaac_render_shell_a10950_apply(uint32_t obj_ptr, float offset_x,
                                    float offset_y, float scale_x,
                                    float scale_y);

/* G151 — a10950 pure-complete? always 1 */
int32_t isaac_render_shell_a10950_pure_complete(void);

/* ---------------------------------------------------------------------------
 * G152 — a10760 angle ordered-eq 0.0 (VA 0x00a1076c…0x00a10780)
 * --------------------------------------------------------------------------- */
int32_t isaac_render_shell_a10760_angle_zero(float angle_rad);

/* G153 — residual plan SKIP / APPLY */
int32_t isaac_render_shell_a10760_plan(float angle_rad);

/* P160 — a10760 rotate body with sparse cos/sin (VA 0x00a1079c…0x00a1093c)
 *   PE: thiscall quad=ecx; stack Vector* pivot; xmm2=angle; ret 4.
 *   For each corner: p' = R(p - pivot) + pivot with
 *     x' = x*cos - y*sin; y' = x*sin + y*cos
 * --------------------------------------------------------------------------- */
void isaac_render_shell_a10760_apply_cs(uint32_t obj_ptr, float pivot_x,
                                       float pivot_y, float cos_a, float sin_a);

/* P161 — a10760 complete pure body: CRT cos/sin wrappers 0x41d540/0x41d520
 *   (float)cos((double)angle) / (float)sin((double)angle). When plan SKIP
 *   (angle ordered-eq 0): no-op. */
void isaac_render_shell_a10760_apply(uint32_t obj_ptr, float pivot_x,
                                    float pivot_y, float angle_rad);

/* G154 — a10760 pure-complete? always 1 (cos/sin via soft-float, zero imports) */
int32_t isaac_render_shell_a10760_pure_complete(void);

/* P162 — nested cos/sin wrapper host VAs (thin pure wrappers in PE) */
uint32_t isaac_render_shell_41d540_host_va(void);
uint32_t isaac_render_shell_41d520_host_va(void);

/* ===========================================================================
 * opaque_call_00409cb0 whole-body pure compute (VA 0x00409cb0) — ABI v25
 *
 * PE: __stdcall, ret 0x1c, 7 stack args
 *   [ebp+0x08] out DestinationQuad* (0x70; returned in EAX)
 *   [ebp+0x0c] Vector* world position
 *   [ebp+0x10] frame*   (ESI at entry)
 *   [ebp+0x14] layer*   (EAX at entry)
 *   [ebp+0x18] Vector* clampTL   [ebp+0x1c] Vector* clampBR
 *   [ebp+0x20] anm2*    (ECX at entry)
 *
 * Every call on the root path is a translated pure body:
 *   0x00409f69 a0f550(color, -1)                   [v9]
 *   0x00409fc4 a10d00(out, l, t, r, b, color)      [v24]
 *   0x00409fd5 a10950(out, pivot1, (|sxF|,|syF|))  [v24]
 *   0x00409fe4 a10950(out, pivot2, (|sxA|,|syA|))  [v24]
 *   0x00409ffc a10760(out, pivot1, rotA*deg2rad)   [v24]
 *   0x0040a016 a10760(out, pivot2, rotB*deg2rad)   [v24]
 * → residual plan PURE, pure-complete 1.
 * =========================================================================== */

/* G155 — camera-base open (VA 0x00409ef8…0x00409f03)
 *   DAT_c71678 != 0 && DAT_c33910 != 0 → manager camera fields. */
int32_t isaac_render_shell_409cb0_camera_open(uint32_t dat_c71678,
                                              uint32_t dat_c33910);

/* P163 — camera base select (VA 0x00409ee3…0x00409f15)
 *   open → [DAT_c71678+0x2650c] / [+0x26510]; else DAT_c7b640 / DAT_c7b644.
 *   Manager pointer is a linear-memory address in the pure model. */
void isaac_render_shell_409cb0_camera_base(uint32_t dat_c71678,
                                           uint32_t dat_c33910,
                                           float dat_c7b640,
                                           float dat_c7b644, float* out_x,
                                           float* out_y);

/* P164 — four-scale pack incl. flag-bit8 override and the four sign flips
 *   (VA 0x00409cf9…0x00409e83, minus the strict-negative folds).
 *   Entry:      sxF = frame.sx*layer.sizeX, syF = frame.sy*layer.sizeY,
 *               sxA = anm2.sx,              syA = anm2.sy
 *   flags & 8:  sxA = layer.sizeX*anm2.sx,  syA = layer.sizeY*anm2.sy,
 *               sxF = frame.sx,             syF = frame.sy
 *   then xorps -0.0 by layer.flipX / anm2.flipX / layer.flipY / effFlipY. */
void isaac_render_shell_409cb0_scale_pack(
    uint32_t flags_or, float frame_scale_x, float frame_scale_y,
    float layer_size_x, float layer_size_y, float anm2_scale_x,
    float anm2_scale_y, uint32_t layer_flip_x, uint32_t layer_flip_y,
    uint32_t anm2_flip_x, uint32_t eff_flip_y, float* out_sx_frame,
    float* out_sy_frame, float* out_sx_anm2, float* out_sy_anm2);

/* P165 — span fold shared by both axes
 *   (X: VA 0x00409e2f/0x00409e4a; Y: VA 0x00409e88/0x00409ecf)
 *     s1 = neg_anm2  ? (ref - pivot) : pivot
 *     s2 = neg_frame ? (ref - s1)    : s1                                  */
float isaac_render_shell_409cb0_span(float ref, float pivot, int32_t neg_anm2,
                                     int32_t neg_frame);

/* G156 — rotation parity: negX ^ negY (both folds xorps rotA and rotB) */
int32_t isaac_render_shell_409cb0_rot_negated(int32_t neg_x, int32_t neg_y);

/* P166 — DAT_00baa088 degree→radian (VA 0x00409ff3 / 0x0040a00b) */
float isaac_render_shell_409cb0_deg_to_rad(float degrees);

/* P167 — pivot pair (VA 0x00409f1a…0x00409f5f)
 *   base = cam + pos; pivot1 = base + folded frame/layer/anm2 position,
 *   pivot2 = base + anm2 offset. */
void isaac_render_shell_409cb0_pivots(float cam_x, float cam_y, float pos_x,
                                      float pos_y, float pos_base_x,
                                      float pos_base_y, float anm2_off_x,
                                      float anm2_off_y, float* out_p1x,
                                      float* out_p1y, float* out_p2x,
                                      float* out_p2y);

/* P168 — clamp corner pack (VA 0x00409f70…0x00409fc0)
 *   left   = clampTL.x / sxF + x0        top    = clampTL.y / syF + y0
 *   right  = (x0 + ref.x) - clampBR.x/sxF
 *   bottom = (y0 + ref.y) - clampBR.y/syF                                  */
void isaac_render_shell_409cb0_corners(float x0, float y0, float frame_ref_x,
                                       float frame_ref_y, float clamp_tl_x,
                                       float clamp_tl_y, float clamp_br_x,
                                       float clamp_br_y, float sx_frame,
                                       float sy_frame, float* out_l,
                                       float* out_t, float* out_r,
                                       float* out_b);

/* P169 — a0f550 packed color arg pushed at VA 0x00409f18 (imm -1) */
uint32_t isaac_render_shell_409cb0_color_arg(void);

/* P170 — complete pure body (VA 0x00409cb0…0x0040a021).
 *   out_ptr:   linear address of the 0x70 DestinationQuad object
 *   color_ptr: linear scratch for the 0x14 a0f550 color (PE stack slot)
 *   cam_x/cam_y: resolved by P163 from sparse globals.
 *   Returns out_ptr (PE returns the object pointer in EAX). */
uint32_t isaac_render_shell_409cb0_compute(
    uint32_t out_ptr, uint32_t color_ptr, float pos_x, float pos_y,
    float frame_ref_x, float frame_ref_y, float frame_pos_x, float frame_pos_y,
    float frame_scale_x, float frame_scale_y, float frame_pivot_x,
    float frame_pivot_y, float frame_rot, float layer_size_x,
    float layer_size_y, float layer_rot, float layer_pos_x, float layer_pos_y,
    uint32_t layer_flip_x, uint32_t layer_flip_y, uint32_t layer_flags_8c,
    float anm2_off_x, float anm2_off_y, float anm2_scale_x, float anm2_scale_y,
    float anm2_rot, uint32_t anm2_flip_x, uint32_t anm2_flip_y,
    uint32_t anm2_flags_110, float clamp_tl_x, float clamp_tl_y,
    float clamp_br_x, float clamp_br_y, uint32_t dat_c7977d, float cam_x,
    float cam_y);

/* ===========================================================================
 * opaque_call_0040c550 continuation chain (VA 0x0040c550) — ABI v26
 *
 * PE __thiscall dest=ECX, stack `SharedPtr* src`, ret 4, returns dest.
 *
 *   [dest+0] = 0 ; [dest+4] = 0                       ; 0x40c55b/0x40c561
 *   edi = src[4] (control) ; ebx = src[0] (object)
 *   if (edi == 0) return dest                          ; 0x40c56d  ZERO_ONLY
 *   al = (*(void**)(*(void**)edi + 0x04))(edi)         ; 0x40c578  HOST
 *   if (!al) return dest                               ; 0x40c57c  ABORT
 *   ecx = [dest+4]            <-- re-read AFTER the call, recapture
 *   if (ecx != 0) {
 *     al2 = (*(void**)(*(void**)ecx + 0x0c))(ecx)      ; 0x40c58a  HOST
 *     if (al2) { hook = DAT_00c7163c;
 *                if (hook) hook(dest); }               ; 0x40c59a  HOST cdecl
 *   }
 *   [dest+4] = edi ; [dest+0] = ebx                    ; 0x40c59f/0x40c5a2
 *
 * The two vtable slots and the hook pointer have no exact ZHL and are not
 * named. Given the three sampled results the body is pure.
 * =========================================================================== */

/* G157 — entry plan: ZERO_ONLY when src control is null, else ADDREF */
int32_t isaac_render_shell_40c550_entry_plan(uint32_t src_ctrl);

/* G158 — resume plan after the src vt+0x04 sample (dest_ctrl recaptured)
 *   addref_result low byte 0 → ABORT; dest_ctrl != 0 → RELEASE; else ASSIGN */
int32_t isaac_render_shell_40c550_resume_plan(uint32_t addref_result,
                                              uint32_t dest_ctrl_after);

/* G159 — hook needed after the dest vt+0x0c sample (VA 0x0040c58c…0x0040c597)
 *   release_result low byte != 0 && DAT_00c7163c != 0 */
int32_t isaac_render_shell_40c550_hook_needed(uint32_t release_result,
                                              uint32_t hook_ptr);

/* P174 — cdecl hook argument pushed at VA 0x0040c599 (the dest SharedPtr) */
uint32_t isaac_render_shell_40c550_hook_arg(uint32_t dest_ptr);

/* P175 — complete memory effects given the sampled indirect results.
 *   Returns the resume plan actually reached. dest_ctrl_after is the value
 *   re-read from [dest+4] after the AddRef call (recapture, not assumed 0). */
int32_t isaac_render_shell_40c550_apply(uint32_t dest_ptr, uint32_t src_obj,
                                        uint32_t src_ctrl,
                                        uint32_t addref_result,
                                        uint32_t dest_ctrl_after,
                                        uint32_t release_result,
                                        uint32_t hook_ptr);

/* G160 — pure-complete only on the ZERO_ONLY path (no indirect call at all) */
int32_t isaac_render_shell_40c550_pure_complete(uint32_t src_ctrl);

/* P176 — hash-bound slot offsets / hook DAT VA (indirect targets stay host) */
uint32_t isaac_render_shell_40c550_src_vt_addref_off(void);
uint32_t isaac_render_shell_40c550_dest_vt_release_off(void);
uint32_t isaac_render_shell_40c550_hook_dat_va(void);

/* ===========================================================================
 * opaque_call_00408590 recapture-correct two-phase plan — ABI v26
 *
 * v20 chose both pairs from one pre-call snapshot. VA 0x004085de reloads
 * `esi = [this+0x98]` after the +0x44 call, so pair B is a post-call
 * decision and must use the recaptured sprite pointer.
 * =========================================================================== */

/* G161 — entry plan (phase 1, VA 0x0040859a…0x004085b5)
 *   sprite null → TAIL_COPY; pair-A cache stale → PAIR_A; else CHECK_B */
int32_t isaac_render_shell_408590_entry_plan(uint32_t sprite_obj,
                                             uint32_t sprite_a0,
                                             uint32_t sprite_a1,
                                             uint32_t layer_a0,
                                             uint32_t layer_a1);

/* G162 — post-A plan (phase 2, VA 0x004085e4…0x004085f4) on the RECAPTURED
 *   sprite pointer read at VA 0x004085de. sprite_after==0 → TAIL_COPY. */
int32_t isaac_render_shell_408590_post_a_plan(uint32_t sprite_after,
                                              uint32_t sprite_b0,
                                              uint32_t sprite_b1,
                                              uint32_t layer_b0,
                                              uint32_t layer_b1);

/* G163 — the duplicated compare at VA 0x004085c2…0x004085c9. Nothing writes
 *   the operands between the two gates, so this is always 0 whenever the
 *   first gate fell through. Exported so the property is pinned, not assumed. */
int32_t isaac_render_shell_408590_pair_a_recheck(uint32_t sprite_a0,
                                                 uint32_t sprite_a1,
                                                 uint32_t layer_a0,
                                                 uint32_t layer_a1);

/* G164 — same redundant gate for pair B (VA 0x004085fc…0x00408603) */
int32_t isaac_render_shell_408590_pair_b_recheck(uint32_t sprite_b0,
                                                 uint32_t sprite_b1,
                                                 uint32_t layer_b0,
                                                 uint32_t layer_b1);

/* P177 — complete memory effects of the 408590 body given the recapture and
 *   the 40c550 samples. sprite_pre is the pointer the pair-A cache store
 *   targets ([ebp-8], VA 0x004085d5); sprite_after is the reload at
 *   VA 0x004085de and is what pair B reads and writes.
 *   Returns out_ptr (PE returns [ebp+8] in EAX). */
uint32_t isaac_render_shell_408590_apply(
    uint32_t layer_ptr, uint32_t out_ptr, uint32_t sprite_pre,
    uint32_t sprite_after, uint32_t layer_a0, uint32_t layer_a1,
    uint32_t layer_b0, uint32_t layer_b1, uint32_t sprite_a0,
    uint32_t sprite_a1, uint32_t sprite_b0, uint32_t sprite_b1,
    uint32_t src_obj, uint32_t src_ctrl, uint32_t addref_result,
    uint32_t dest_ctrl_after, uint32_t release_result, uint32_t hook_ptr);

/* ===========================================================================
 * 0x00af0917 → CRT floor (ABI v26)
 *
 * VA 0x00af0917 is `jmp dword ptr [0x00b18840]`. The PE import directory
 * resolves 0x00b18840 to `floor` in api-ms-win-crt-math-l1-1-0.dll — a leaf
 * IEEE-754 rounding primitive with no state and no OS dependency.
 *
 * Call site VA 0x0080f00d…0x0080f02b:
 *   fld dword [esp+0x10]   ; float32 → x87, exact widening
 *   fstp qword [esp]       ; double stack arg, exact
 *   call 0xaf0917          ; double floor(double)
 *   fstp dword [esp+0x10]  ; narrow back to float32
 *
 * floor of a float32 is always exactly representable in float32 (|v|<2^24 →
 * integral result below 2^24; |v|>=2^24 → v is already integral), so the
 * narrowing cannot round and the x87 rounding mode is irrelevant. Result is
 * exactly round-toward-negative-infinity of the float32 input, with
 * floor(-0.0) = -0.0, floor(±Inf) = ±Inf and NaN preserved.
 * =========================================================================== */

/* P178 — (float)floor((double)v) */
float isaac_render_shell_af0917_floor(float value);

/* G165 — pure-complete? always 1 (leaf CRT rounding primitive) */
int32_t isaac_render_shell_af0917_pure_complete(void);

/* P179 — hash-bound IAT slot VA behind the 0x00af0917 thunk */
uint32_t isaac_render_shell_af0917_iat_va(void);

/* P180 — stage-overlay draw position without sampled floor results
 *   (VA 0x0080ef41…0x0080f0cf): pre-floor packs → pure floor → /scale →
 *   + camera. Supersedes the sampled-floor P58 variant, which is retained. */
void isaac_render_shell_stage_overlay_draw_pos_pure(
    float scroll_x_c78dc4, float scroll_y_c78edc, float pos_x, float pos_y,
    float scale, float camera_x, float camera_y, float* out_x, float* out_y);

/* ===========================================================================
 * ABI v27 — mode-44 / GetRoomByIdx cluster
 *
 * (a) opaque_call_0074f690 post-call-correct resolve.
 *     [this+0] (stage) is read at VA 0x0074f6ad for the -10 gate and AGAIN at
 *     VA 0x0074f6f0 for the dispatch, with the host GetRoomByIdx call at
 *     VA 0x0074f6cf in between on the SAME `this`. v14 used one snapshot.
 * =========================================================================== */

/* G166 — is the stage id re-read after the host call for this entry plan?
 *   Only GETROOM crosses the call; STAGE reaches 0x0074f6f0 without one. */
int32_t isaac_render_shell_74f690_stage_reload_needed(int32_t entry_plan);

/* P181 — hash-bound VA of the stage reload */
uint32_t isaac_render_shell_74f690_stage_reload_va(void);

/* P182 — resolve using separate pre-call and post-call stage snapshots and
 *   indexing the +0x183b0 / +0x18654 float arrays in-model with the resolved
 *   room index (both are post-call reads at VA 0x0074f6f7 / 0x0074f71b).
 *   game_ptr is the linear-memory base of the `this` object; when it is 0 the
 *   float reads fall back to the explicit f_183b0 / f_18654 arguments so the
 *   helper stays usable without a materialised object.
 *   v14's isaac_render_shell_74f690_resolve is retained unchanged. */
uint32_t isaac_render_shell_74f690_resolve_post(
    uint32_t game_ptr, int32_t mode_26584, int32_t room_idx,
    int32_t stage_entry, int32_t stage_after, uint32_t stage_type_4,
    uint32_t flag_183a0, int32_t room_desc_dword0,
    int32_t room_desc_field10_nz, float f_183b0, float f_18654,
    int32_t field14);

/* ===========================================================================
 * (b) Game/Level::GetRoomByIdx @ 0x00740bc0 — once-init as plan + resume
 * =========================================================================== */

/* G167 — entry gate (VA 0x00740bf3): signed `guard > tls_epoch` → HEADER */
int32_t isaac_render_shell_740bc0_once_init_plan(int32_t guard_val,
                                                 int32_t tls_epoch);

/* G168 — resume gate (VA 0x00740d50) on the guard value RE-READ after the
 *   host header call: == -1 → CONSTRUCT, anything else → SKIP (a racing
 *   thread already finished). Passing the entry snapshot here is exactly the
 *   bug this split exists to prevent. */
int32_t isaac_render_shell_740bc0_once_init_resume(int32_t guard_after);

/* P183 — hash-bound VAs of the once-init chain. No ZHL for the guard
 *   header/footer or the atexit registrar, so they stay address-stable;
 *   0x006ef590 IS an exact ZHL match (RoomDescriptor::constructor). */
uint32_t isaac_render_shell_740bc0_init_header_va(void);
uint32_t isaac_render_shell_740bc0_init_footer_va(void);
uint32_t isaac_render_shell_740bc0_ctor_va(void);
uint32_t isaac_render_shell_740bc0_atexit_va(void);

/* ===========================================================================
 * (c) -101 walk with the real two-level dereference, and the recursion driver
 * =========================================================================== */

/* P184 — slot pointer offset (VA 0x00740c9a: mov edx,[eax]) */
uint32_t isaac_render_shell_740bc0_walk_entry_ptr_off(void);

/* P185 — memory-driven walk (VA 0x00740c91…0x00740cb0).
 *   entry = game_ptr + 0x24 + n*0xb8
 *   match when [entry-4]==0 AND p=[entry], p[8]==1, p[0x10]==0xa
 *   Returns the Game-relative offset of the match (entry - 0x10 - game_ptr)
 *   or WALK_NO_MATCH. A null slot pointer cannot match; the PE would fault
 *   dereferencing it, so the model stops at that entry instead. */
uint32_t isaac_render_shell_740bc0_walk_find(uint32_t game_ptr,
                                             int32_t room_count);

/* P186 — -100 recursion idx argument (VA 0x00740c35: push edx = current idx) */
int32_t isaac_render_shell_740bc0_current_recurse_idx(int32_t current_idx);

/* P187 — bounded recursion driver. Each entry re-executes the whole function
 *   including the once-init gate, so per-entry inputs are supplied by the
 *   caller as recaptured samples rather than reused from the outer frame.
 *   `dim_eff_seq` / `current_idx_seq` / `slot_seq` are read at [step].
 *   Returns the resolve kind; *out_off receives the Game-relative offset when
 *   the kind is GAME_OFF, and *out_steps the number of entries executed. */
int32_t isaac_render_shell_740bc0_resolve_chain(
    uint32_t game_ptr, int32_t idx, const int32_t* dim_eff_seq,
    const int32_t* current_idx_seq, const uint32_t* slot_seq,
    int32_t seq_len, int32_t room_count, uint32_t* out_off,
    int32_t* out_steps);

/* ===========================================================================
 * ABI v28 — RoomDescriptor::constructor @ 0x006ef590 (exact ZHL)
 *
 * __thiscall, no stack args, `ret`, returns `this` in EAX.
 * Host residuals: allocator 0xa0f4c0 (x2), vector grow 0x00708eb0 (x2),
 * tree clear 0x00424540, EntitySaveState::destructor 0x004d6ee0, and the
 * allocation-failure IAT 0x00b18894.
 * =========================================================================== */

/* P188 — early scalar block (VA 0x006ef5be…0x006ef626): the -1 head, the
 *   zero runs at +0x0c and +0x3c, and the +0x48..+0x64 clear. Does NOT write
 *   +0x1c..+0x38 (those come later, at VA 0x006ef805). */
void isaac_render_shell_6ef590_init_scalars(uint32_t obj_ptr);

/* P189 — aligned grid base (VA 0x006ef63b…0x006ef641)
 *   base = (raw + 0x23) & ~0x1f, then [base-4] = raw (the free-back pointer).
 *   raw == 0 is the failure path (VA 0x006ef635 -> IAT 0x00b18894). */
uint32_t isaac_render_shell_6ef590_align_grid(uint32_t raw_ptr);

/* P190 — one 0x20-byte grid element (VA 0x006ef660…0x006ef694)
 *   dwords at +0x00/+0x04/+0x08/+0x0c/+0x14 = 0, byte at +0x18 = 0,
 *   dwords at +0x10 and +0x1c = 0x16a9de81. +0x19..+0x1b are NOT written. */
void isaac_render_shell_6ef590_grid_elem_init(uint32_t elem_ptr);

/* P191 — all 0x1c0 elements */
void isaac_render_shell_6ef590_grid_fill(uint32_t base_ptr);

/* P192 — tree sentinel node (VA 0x006ef6c7…0x006ef6cf)
 *   node->left/parent/right = node; word at +0xc = 0x0101 (color 1, isnil 1).
 *   Cross-checks the MAP_* offsets already recovered at ABI v8. */
void isaac_render_shell_6ef590_map_node_init(uint32_t node_ptr);

/* P193 — vector<EntitySaveState> capacity (VA 0x006ef74f…0x006ef765)
 *   exact MSVC signed divide-by-0x78: imul 0x88888889; add; sar 6; +sign */
int32_t isaac_render_shell_6ef590_vec_capacity(uint32_t begin, uint32_t end);

/* G169 — grow needed (VA 0x006ef767 / 0x006ef7c8: cmp eax,N; jae skip)
 *   unsigned compare against the wanted element count */
int32_t isaac_render_shell_6ef590_reserve_needed(uint32_t begin, uint32_t end,
                                                 int32_t want);

/* G170 — destroy-loop trip count (VA 0x006ef71e / 0x006ef776).
 *   begin/end are RECAPTURED after the allocator and grow calls; the PE
 *   re-reads them rather than reusing the zeroes stored moments earlier. */
int32_t isaac_render_shell_6ef590_clear_loop_count(uint32_t begin,
                                                   uint32_t end);

/* P194 — late -1 fill of +0x1c..+0x38 (VA 0x006ef805…0x006ef836) */
void isaac_render_shell_6ef590_late_neg_fill(uint32_t obj_ptr);

/* P195 — second grid pass (VA 0x006ef840…0x006ef853): zero the first dword
 *   of every 0x20-byte block. The PE reloads [this+0x68] each iteration. */
void isaac_render_shell_6ef590_grid_second_pass(uint32_t obj_ptr);

/* P196 — tail: movups 16 zero bytes at +0x94 (VA 0x006ef85a). Leaves the
 *   +0xa4..+0xab hole untouched, exactly as the PE does. */
void isaac_render_shell_6ef590_tail_zero(uint32_t obj_ptr);

/* P197 — whole body given the sampled host results.
 *   grid_raw / node_raw are the two allocator returns.
 *   vec_*_end_after are the ranges recaptured at VA 0x006ef71e / 0x006ef776
 *   that decide the destroy-loop trip counts. vec_*_begin_after are the
 *   begins read at the store site (VA 0x006ef741 / 0x006ef749 and
 *   0x006ef7a1 / 0x006ef7ad) — i.e. AFTER any destructor calls, because the
 *   PE re-reads [this+0x74] / [this+0x88] there rather than reusing the
 *   value it tested with. Supplying the pre-loop value would be the same
 *   stale-state mistake this ABI keeps correcting.
 *   Returns obj_ptr (the PE returns `this` in EAX); *out_dtor_calls receives
 *   the total EntitySaveState::destructor call count the host must run. */
uint32_t isaac_render_shell_6ef590_apply(
    uint32_t obj_ptr, uint32_t grid_raw, uint32_t node_raw,
    uint32_t vec_a_begin_after, uint32_t vec_a_end_after,
    uint32_t vec_b_begin_after, uint32_t vec_b_end_after,
    int32_t* out_dtor_calls);

/* G171 — pure-complete? always 0: allocator, grow and tree-clear stay host */
int32_t isaac_render_shell_6ef590_pure_complete(void);

/* P198 — hash-bound VAs and the recovered object size */
uint32_t isaac_render_shell_6ef590_host_va(void);
uint32_t isaac_render_shell_6ef590_desc_size(void);
uint32_t isaac_render_shell_6ef590_dtor_host_va(void);
uint32_t isaac_render_shell_6ef590_grow_host_va(void);
uint32_t isaac_render_shell_6ef590_tree_clear_host_va(void);
uint32_t isaac_render_shell_6ef590_fail_iat_va(void);
uint32_t isaac_render_shell_6ef590_hole_off(void);
uint32_t isaac_render_shell_6ef590_hole_len(void);

/* P171 — hash-bound DAT VAs for the camera-base / deg2rad globals */
uint32_t isaac_render_shell_409cb0_dat_c71678_va(void);
uint32_t isaac_render_shell_409cb0_dat_c33910_va(void);
uint32_t isaac_render_shell_409cb0_dat_c7b640_va(void);
uint32_t isaac_render_shell_409cb0_dat_c7b644_va(void);
uint32_t isaac_render_shell_409cb0_deg2rad_va(void);
uint32_t isaac_render_shell_409cb0_cam_x_off(void);
uint32_t isaac_render_shell_409cb0_cam_y_off(void);

/* ===========================================================================
 * opaque_call_0040c6f0 color-ring pure body (VA 0x0040c6f0) — ABI v23
 *
 * No exact ZHL. Address-stable residual name retained. cdecl, zero args,
 * returns Color* (float*) in EAX. Zero nested calls. Pure-complete when
 * DAT_c78db4..c78dc0 are sparsified (table base as linear-memory address).
 *
 * PE (0x0040c6f0…0x0040c71a ret):
 *   ecx = DAT_c78dc0 + DAT_c78dbc
 *   edx = DAT_c78db8
 *   dec ecx; dec edx
 *   index = edx & ecx                    // ring mask
 *   return *(uint32_t*)(DAT_c78db4 + index*4)
 *
 * 32-bit wrap on add/dec/and. COLOR_HOST path of 409120 uses this then
 * pure 4071c0 copy of the returned Color*.
 * =========================================================================== */

/* P151 — ring mask (VA 0x0040c6f6…0x0040c70b): (count + base_add) - 1 */
uint32_t isaac_render_shell_40c6f0_ring_mask(uint32_t dat_c78dc0,
                                            uint32_t dat_c78dbc);

/* P152 — cursor-1 (VA 0x0040c705…0x0040c711): DAT_c78db8 - 1 */
uint32_t isaac_render_shell_40c6f0_cursor_dec(uint32_t dat_c78db8);

/* P153 — ring index (VA 0x0040c711…0x0040c714): (cursor-1) & mask */
uint32_t isaac_render_shell_40c6f0_index(uint32_t dat_c78dc0,
                                        uint32_t dat_c78dbc,
                                        uint32_t dat_c78db8);

/* P154 — table slot load (VA 0x0040c714): [table_base + index*4]
 *   table_base==0 → return 0 (safe no-op for pure model; PE would fault). */
uint32_t isaac_render_shell_40c6f0_lookup(uint32_t table_base, uint32_t index);

/* P155 — complete pure body: sparse globals → Color* (guest/linear ptr) */
uint32_t isaac_render_shell_40c6f0_compute(uint32_t dat_c78db4,
                                          uint32_t dat_c78db8,
                                          uint32_t dat_c78dbc,
                                          uint32_t dat_c78dc0);

/* G147 — residual plan: always PURE (zero nested calls) */
int32_t isaac_render_shell_40c6f0_plan(void);

/* P156 — pure-complete? always 1 */
int32_t isaac_render_shell_40c6f0_pure_complete(void);

/* P157 — DAT VAs for ring globals (hash-bound BSS) */
uint32_t isaac_render_shell_40c6f0_dat_c78db4_va(void);
uint32_t isaac_render_shell_40c6f0_dat_c78db8_va(void);
uint32_t isaac_render_shell_40c6f0_dat_c78dbc_va(void);
uint32_t isaac_render_shell_40c6f0_dat_c78dc0_va(void);


/* ===========================================================================
 * ABI v32-v38 additions (restored with v38 peel of 0x00a143f0)
 * =========================================================================== */

enum { ISAAC_RENDER_SHELL_4098A0_ZERO_SEED_ASSERT_COUNT = 2 };

enum { ISAAC_RENDER_SHELL_827BC0_PLAN_FALSE = 0 };
enum { ISAAC_RENDER_SHELL_827BC0_PLAN_HOST = 1 };
enum { ISAAC_RENDER_SHELL_827BC0_FIELD8_TARGET = 5 };
enum { ISAAC_RENDER_SHELL_827BC0_NEST_TYPE_TARGET = 0x59 };
enum { ISAAC_RENDER_SHELL_HOST_827BC0_VA = 0x00827bc0u };

int32_t isaac_render_shell_827bc0_pre_gate(int32_t receiver_field_8,
                                           int32_t nested_room_type_10);
int32_t isaac_render_shell_827bc0_entry_plan(int32_t receiver_field_8,
                                             int32_t nested_room_type_10);
int32_t isaac_render_shell_827bc0_resume_al(uint32_t host_74ea50_al);
int32_t isaac_render_shell_827bc0_eval_al(int32_t receiver_field_8,
                                          int32_t nested_room_type_10,
                                          uint32_t host_74ea50_al);
uint32_t isaac_render_shell_827bc0_host_va(void);

enum {
  ISAAC_RENDER_SHELL_A140C0_PLAN_FALSE = 0,
  ISAAC_RENDER_SHELL_A140C0_PLAN_GROW = 1,
  ISAAC_RENDER_SHELL_A140C0_PLAN_ALLOC = 2,
  ISAAC_RENDER_SHELL_A140C0_PLAN_PURE = 3
};
enum { ISAAC_RENDER_SHELL_HOST_A140C0_VA = 0x00a140c0u };
enum { ISAAC_RENDER_SHELL_HOST_44BE50_VA = 0x0044be50u };
enum { ISAAC_RENDER_SHELL_A140C0_ALLOC_SIZE = 0x10 };
enum { ISAAC_RENDER_SHELL_A140C0_ALIGN_MASK = 3 };
enum { ISAAC_RENDER_SHELL_A140C0_PAGE_SLOTS = 4 };
enum { ISAAC_RENDER_SHELL_A140C0_RING_THIS_VA = 0x00c379ccu };
enum { ISAAC_RENDER_SHELL_A140C0_PAGE_TABLE_VA = 0x00c379d0u };
enum { ISAAC_RENDER_SHELL_A140C0_CAP_VA = 0x00c379d4u };
enum { ISAAC_RENDER_SHELL_A140C0_WRITE_IDX_VA = 0x00c379d8u };
enum { ISAAC_RENDER_SHELL_A140C0_CURSOR_VA = 0x00c379dcu };
enum { ISAAC_RENDER_SHELL_A140C0_NAME_COLOR_VA = 0x00b81e50u };
enum { ISAAC_RENDER_SHELL_A140C0_NAME_COLOR_TEX_VA = 0x00b1a5b0u };
enum { ISAAC_RENDER_SHELL_A140C0_NAME_INDEXED_VA = 0x00b81940u };

int32_t isaac_render_shell_a140c0_pre_gate(uint32_t shader_id,
                                           uint32_t bound_isnil,
                                           uint32_t bound_key,
                                           uint32_t bound_ptr,
                                           uint32_t map_root_c379bc);
int32_t isaac_render_shell_a140c0_bind_ok(uint32_t value_at_ptr,
                                          uint32_t byte_at_ptr_plus_4);
int32_t isaac_render_shell_a140c0_grow_needed(uint32_t cursor,
                                              uint32_t write_idx,
                                              uint32_t capacity);
uint32_t isaac_render_shell_a140c0_write_mask(uint32_t capacity);
uint32_t isaac_render_shell_a140c0_write_index(uint32_t write_idx,
                                               uint32_t capacity);
uint32_t isaac_render_shell_a140c0_slot(uint32_t cursor, uint32_t write_idx,
                                        uint32_t capacity);
uint32_t isaac_render_shell_a140c0_page_off(uint32_t cursor, uint32_t write_idx,
                                            uint32_t capacity);
uint32_t isaac_render_shell_a140c0_slot_in_page(uint32_t cursor,
                                                uint32_t write_idx,
                                                uint32_t capacity);
int32_t isaac_render_shell_a140c0_page_present(uint32_t page_ptr);
int32_t isaac_render_shell_a140c0_entry_plan(
    uint32_t shader_id, uint32_t bound_isnil, uint32_t bound_key,
    uint32_t bound_ptr, uint32_t map_root_c379bc, uint32_t value_at_ptr,
    uint32_t byte_at_ptr_plus_4, uint32_t cursor, uint32_t write_idx,
    uint32_t capacity, uint32_t page_ptr);
int32_t isaac_render_shell_a140c0_grow_resume_plan(uint32_t page_ptr_after);
int32_t isaac_render_shell_a140c0_ring_apply(uint32_t page_base,
                                             uint32_t slot_in_page,
                                             uint32_t old_c379b8,
                                             uint32_t new_value,
                                             uint32_t cursor,
                                             uint32_t* out_c379b8,
                                             uint32_t* out_cursor);
int32_t isaac_render_shell_a140c0_eval_al(int32_t entry_plan);
uint32_t isaac_render_shell_a140c0_host_va(void);
uint32_t isaac_render_shell_a140c0_grow_host_va(void);
uint32_t isaac_render_shell_a140c0_alloc_host_va(void);
uint32_t isaac_render_shell_a140c0_alloc_size(void);
uint32_t isaac_render_shell_a140c0_ring_this_va(void);
uint32_t isaac_render_shell_a140c0_page_table_va(void);
uint32_t isaac_render_shell_a140c0_cap_va(void);
uint32_t isaac_render_shell_a140c0_write_idx_va(void);
uint32_t isaac_render_shell_a140c0_cursor_va(void);
uint32_t isaac_render_shell_a140c0_name_color_va(void);
uint32_t isaac_render_shell_a140c0_name_color_tex_va(void);
uint32_t isaac_render_shell_a140c0_name_indexed_va(void);

enum { ISAAC_RENDER_SHELL_A14200_PLAN_EMPTY_LOG = 0 };
enum { ISAAC_RENDER_SHELL_A14200_PLAN_PURE = 1 };
enum { ISAAC_RENDER_SHELL_HOST_A14200_VA = 0x00a14200u };
enum { ISAAC_RENDER_SHELL_HOST_684FC0_VA = 0x00684fc0u };
enum { ISAAC_RENDER_SHELL_A14200_EMPTY_MSG_VA = 0x00b81ac4u };
enum { ISAAC_RENDER_SHELL_A14200_EMPTY_MSG_LEVEL = 0x10 };
enum { ISAAC_RENDER_SHELL_A14200_C379B8_VA = 0x00c379b8u };
enum { ISAAC_RENDER_SHELL_684FC0_PAGE_TABLE_OFF = 0x04 };
enum { ISAAC_RENDER_SHELL_684FC0_CAP_OFF = 0x08 };
enum { ISAAC_RENDER_SHELL_684FC0_WRITE_IDX_OFF = 0x0c };
enum { ISAAC_RENDER_SHELL_684FC0_CURSOR_OFF = 0x10 };

int32_t isaac_render_shell_a14200_empty_needed(uint32_t cursor);
int32_t isaac_render_shell_a14200_entry_plan(uint32_t cursor);
uint32_t isaac_render_shell_684fc0_slot(uint32_t cursor, uint32_t write_idx);
uint32_t isaac_render_shell_684fc0_page_idx(uint32_t cursor, uint32_t write_idx,
                                            uint32_t capacity);
uint32_t isaac_render_shell_684fc0_slot_in_page(uint32_t cursor,
                                                uint32_t write_idx);
uint32_t isaac_render_shell_684fc0_page_off(uint32_t cursor, uint32_t write_idx,
                                            uint32_t capacity);
uint32_t isaac_render_shell_684fc0_slot_addr(uint32_t page_base, uint32_t cursor,
                                             uint32_t write_idx,
                                             uint32_t capacity);
uint32_t isaac_render_shell_684fc0_peek(uint32_t page_base, uint32_t cursor,
                                        uint32_t write_idx, uint32_t capacity);
int32_t isaac_render_shell_a14200_pop_apply(uint32_t cursor, uint32_t write_idx,
                                            uint32_t peeked,
                                            uint32_t* out_c379b8,
                                            uint32_t* out_cursor,
                                            uint32_t* out_write_idx);
uint32_t isaac_render_shell_a14200_host_va(void);
uint32_t isaac_render_shell_684fc0_host_va(void);
uint32_t isaac_render_shell_a14200_empty_log_va(void);
uint32_t isaac_render_shell_a14200_empty_msg_va(void);
uint32_t isaac_render_shell_a14200_empty_msg_level(void);
uint32_t isaac_render_shell_a14200_c379b8_va(void);
uint32_t isaac_render_shell_684fc0_page_table_off(void);
uint32_t isaac_render_shell_684fc0_cap_off(void);
uint32_t isaac_render_shell_684fc0_write_idx_off(void);
uint32_t isaac_render_shell_684fc0_cursor_off(void);

enum { ISAAC_RENDER_SHELL_A14250_PLAN_HOST = 0 };
enum { ISAAC_RENDER_SHELL_HOST_A14250_VA = 0x00a14250u };
enum { ISAAC_RENDER_SHELL_HOST_A143F0_VA = 0x00a143f0u };
enum { ISAAC_RENDER_SHELL_A14250_MAP_THIS_VA = 0x00c379c4u };
enum { ISAAC_RENDER_SHELL_A14250_VALUE_OFF = 0x14 };

int32_t isaac_render_shell_a14250_entry_plan(void);
uint32_t isaac_render_shell_a14250_resume(uint32_t pair_node);
uint32_t isaac_render_shell_a14250_host_va(void);
uint32_t isaac_render_shell_a143f0_host_va(void);
uint32_t isaac_render_shell_a14250_map_this_va(void);
uint32_t isaac_render_shell_a14250_value_off(void);

enum {
  ISAAC_RENDER_SHELL_A14330_PLAN_FOUND = 0,
  ISAAC_RENDER_SHELL_A14330_PLAN_THROW = 1,
  ISAAC_RENDER_SHELL_A14330_PLAN_INSERT = 2
};
enum { ISAAC_RENDER_SHELL_HOST_A14330_VA = 0x00a14330u };
enum { ISAAC_RENDER_SHELL_A14330_NEXT_VA = 0x00a143f0u };
enum { ISAAC_RENDER_SHELL_A14330_SIZE_FULL = 0x0aaaaaaau };
enum { ISAAC_RENDER_SHELL_A14330_ALLOC_SIZE = 0x18 };

int32_t isaac_render_shell_a14330_lookup_hit(uint32_t node_isnil,
                                             uint32_t search_key,
                                             uint32_t node_key);
uint32_t isaac_render_shell_a14330_value_ptr(uint32_t node_ptr);
int32_t isaac_render_shell_a14330_map_size_full(uint32_t map_size);
int32_t isaac_render_shell_a14330_residual_plan(uint32_t node_isnil,
                                                uint32_t search_key,
                                                uint32_t node_key,
                                                uint32_t map_size);
void isaac_render_shell_a14330_node_init(uint32_t node_ptr, uint32_t map_head,
                                         uint32_t key);
uint32_t isaac_render_shell_a14330_host_va(void);
uint32_t isaac_render_shell_a14330_next_va(void);
uint32_t isaac_render_shell_a14330_alloc_size(void);

uint32_t isaac_render_shell_4098a0_zero_seed_assert_count(void);

/* ===========================================================================
 * FUN_00a143f0 map find-or-insert — ABI v38
 *
 * Nested from a14250 (VA 0x00a14260; 1 E8 site whole .text). No exact ZHL.
 * first_ret 0x00a1447b (FOUND), insert ret 0x00a145d1; ret 8.
 * Body E8: a0f4c0 / 415fe0 / 415f80 / 4170d0 (insert/throw only).
 *
 * Inlined 416440 walk (v8) then a14270-shaped FOUND/THROW/INSERT.
 * FOUND: pair.node=bound; BYTE pair.inserted=0.
 * THROW: size==0x0aaaaaaa → host 4170d0.
 * INSERT: host a0f4c0(0x18) → BYTE node_init (mov byte [ebx+0x14],0)
 *   → inlined insert_link + rebalance → pair {node, inserted=1}.
 * Alloc/throw stay host. Rotates already pure-complete (v10).
 * NEXT_VA 0x00a145e0.
 * =========================================================================== */

enum {
  ISAAC_RENDER_SHELL_A143F0_PLAN_FOUND = 0,
  ISAAC_RENDER_SHELL_A143F0_PLAN_THROW = 1,
  ISAAC_RENDER_SHELL_A143F0_PLAN_INSERT = 2
};
enum { ISAAC_RENDER_SHELL_A143F0_NEXT_VA = 0x00a145e0u };
enum { ISAAC_RENDER_SHELL_A143F0_END_VA = 0x00a145d1u };
enum { ISAAC_RENDER_SHELL_A143F0_SIZE_FULL = 0x0aaaaaaau };
enum { ISAAC_RENDER_SHELL_A143F0_ALLOC_SIZE = 0x18 };
enum { ISAAC_RENDER_SHELL_A143F0_PAIR_INSERTED_OFF = 4 };
enum { ISAAC_RENDER_SHELL_A143F0_INSERTED_FOUND = 0 };
enum { ISAAC_RENDER_SHELL_A143F0_INSERTED_INSERT = 1 };

int32_t isaac_render_shell_a143f0_lookup_hit(uint32_t node_isnil,
                                             uint32_t search_key,
                                             uint32_t node_key);
int32_t isaac_render_shell_a143f0_map_size_full(uint32_t map_size);
int32_t isaac_render_shell_a143f0_residual_plan(uint32_t node_isnil,
                                                uint32_t search_key,
                                                uint32_t node_key,
                                                uint32_t map_size);
void isaac_render_shell_a143f0_node_init(uint32_t node_ptr, uint32_t map_head,
                                         uint32_t key);
void isaac_render_shell_a143f0_found_pair(uint32_t pair_ptr, uint32_t node);
void isaac_render_shell_a143f0_insert_pair(uint32_t pair_ptr, uint32_t node);
uint32_t isaac_render_shell_a143f0_next_va(void);
uint32_t isaac_render_shell_a143f0_alloc_size(void);
uint32_t isaac_render_shell_a143f0_pair_inserted_off(void);

/* ===========================================================================
 * FUN_00a145e0 scalar deleting dtor — ABI v39
 *
 * Vtable 0xb81bac slot +0x00 (slot +0x04 = a149a0 virtual dtor body).
 * Zero direct E8 sites whole .text (only vtable-indirect). No exact ZHL.
 * first_ret 0x00a14616; ret 4 (stack arg = delete flag). Body:
 *   [esi] = 0xb81bac                        ; unconditional vftable store
 *   call a149a0(esi)                        ; virtual dtor body (no ZHL)
 *   lea ecx,[esi+0x40]; call 0x4149d0       ; std::vector destroy (no ZHL)
 *   lea ecx,[esi+0x34]; call 0xa15310       ; vector-of-0x18 destroy (no ZHL)
 *   test byte [ebp+8], 1 ; je skip          ; LOW-BYTE bit 0 (Grp3 Eb,Ib)
 *     push 0x4c; push esi; call 0xaef15c    ; sized operator delete (platform)
 *   skip: eax = esi; ret 4
 * All three nested dtors + the sized free stay host (address-stable).
 * 0x4149d0 is the shared MSVC vector destroy (playerhud v25 uses the same
 * VA); a15310 is a vector of 0x18-byte objects with a nested 4149d0 per
 * element; aef15c -> a0f500 -> free chain is a platform primitive.
 * Object layout (this unit): vtable@+0; pointer array +0xc/+0x10 (freed by
 * the a149a0 body); std::vector @+0x34 (a15310); std::vector @+0x40
 * (4149d0, 12 bytes) — the +0x40 block ends exactly at the 0x4c sized-free
 * imm, pinning the object size.
 * NEXT_VA 0x00a14620 (SEH string-init/dup body; nests 0xa648b0/0xa0f4e0).
 * =========================================================================== */

enum { ISAAC_RENDER_SHELL_A145E0_HOST_VA = 0x00a145e0u };
enum { ISAAC_RENDER_SHELL_A145E0_END_VA = 0x00a14616u };
enum { ISAAC_RENDER_SHELL_A145E0_NEXT_VA = 0x00a14620u };
enum { ISAAC_RENDER_SHELL_A145E0_VTABLE_VA = 0x00b81bacu };
enum { ISAAC_RENDER_SHELL_A145E0_FREE_SIZE = 0x4c };
enum { ISAAC_RENDER_SHELL_A145E0_FREE_VA = 0x00aef15cu };
enum { ISAAC_RENDER_SHELL_A145E0_CALL_COUNT = 3 };
enum { ISAAC_RENDER_SHELL_A145E0_CALL_THIS_OFF_0 = 0x00 };
enum { ISAAC_RENDER_SHELL_A145E0_CALL_THIS_OFF_1 = 0x40 };
enum { ISAAC_RENDER_SHELL_A145E0_CALL_THIS_OFF_2 = 0x34 };
/* Tail bytes of the +0x40 vector block (3 dwords = 0xc). */
enum { ISAAC_RENDER_SHELL_A145E0_CALL_THIS_OFF_1_TAIL = 0x0c };
enum { ISAAC_RENDER_SHELL_A145E0_CALL_HOST_VA_0 = 0x00a149a0u };
enum { ISAAC_RENDER_SHELL_A145E0_CALL_HOST_VA_1 = 0x004149d0u };
enum { ISAAC_RENDER_SHELL_A145E0_CALL_HOST_VA_2 = 0x00a15310u };

int32_t isaac_render_shell_a145e0_delete_needed(uint32_t delete_flag);
void isaac_render_shell_a145e0_vftable_store(uint32_t this_ptr);
uint32_t isaac_render_shell_a145e0_call_count(void);
uint32_t isaac_render_shell_a145e0_call_this_off(uint32_t index);
uint32_t isaac_render_shell_a145e0_call_host_va(uint32_t index);
uint32_t isaac_render_shell_a145e0_vtable_va(void);
uint32_t isaac_render_shell_a145e0_free_size(void);
uint32_t isaac_render_shell_a145e0_free_va(void);
uint32_t isaac_render_shell_a145e0_host_va(void);
uint32_t isaac_render_shell_a145e0_next_va(void);

/* ===========================================================================
 * FUN_00a14620 string/pair-table object init — ABI v40
 *
 * Body VA 0x00a14620..0x00a147cb, ret 0xc (two exit arms), SEH+GS-cookie
 * prologue; no exact ZHL. this = ecx; args: [ebp+8] = src C-string,
 * [ebp+0xc] = pair table (stride 8: {ptr, flag} dwords), [ebp+0x10] = arg2.
 * Body (PE order):
 *   1. free-old gate: if [this+8] != 0 -> host FREE a648b0(cl=1, edx=old)
 *      then [this+8] = 0            (VA 0xa1464a test edx,edx / je 0xa14674;
 *      the store 0 at 0xa1466d is on the gate-open path only)
 *   2. arg0 dup: if [ebp+8] != 0 -> strlen+1 via a0f4e0 (operator-new
 *      wrapper -> a648b0 ALLOC cl=0), then SECOND strlen re-derived for the
 *      IAT memcpy [0xb1893c] count (VA 0xa14695..0xa146a9 — re-derived, not
 *      reused); edi = dup or 0; [this+8] = edi (unconditional store)
 *   3. pair scan: [this+0x10] = 0; if pair0.flag ([ebp+0xc]+4) == 0 -> skip;
 *      loop: ++count, [this+0x10]=count, continue while flag at
 *      [table + count*8 + 4] != 0 — count = leading nonzero-flag run length
 *      (VA 0xa146c5 cmp [ebx+4],eax / je 0xa146db; 0xa146d0..0xa146d9)
 *   4. alloc: size = count*8 as 64-bit (mul edx,8); seto cl; neg ecx;
 *      or ecx,eax -> saturated 0xffffffff on overflow, else count*8;
 *      host ALLOC a648b0(cl=0) -> [this+0xc] (VA 0xa146db..0xa146f7)
 *   5. fill loop i in [0,count): pair.ptr = [table+i*8]; if 0 -> slot dup
 *      null else strlen+1 dup via a0f4e0 + second strlen for IAT memcpy
 *      count; [array+i*8] = dup; [array+i*8+4] = [table+i*8+4] (flag verbatim)
 *      (VA 0xa14710..0xa1477f, jb unsigned loop-back)
 *   6. vtable tail: eax=[this]; push arg2; call [eax+8] -> al; al==0 ->
 *      call [this-vtbl+4] and return 0; al!=0 -> push [ebp+8], or
 *      [this+4],1, call [vtbl+0x28], return 1 (VA 0xa14781..0xa147cb)
 * Host leaves: a648b0 FREE/ALLOC (cl=1/0), a0f4e0 operator-new wrapper,
 * IAT memcpy [0xb1893c], 3 vtable slots (+8/+4/+0x28). The pure laws here
 * are the ones the host must reproduce exactly; none reads host memory.
 * NARROWED not removed: the object lives outside the Game buffer, so the
 * plan is a typed host contract, not an in-module store sequence.
 * NEXT_VA 0x00a147e0 (SEH sibling; calls 0xa14620 at 0xa148f6).
 * =========================================================================== */

enum { ISAAC_RENDER_SHELL_A14620_HOST_VA = 0x00a14620u };
enum { ISAAC_RENDER_SHELL_A14620_END_VA = 0x00a147cbu };
enum { ISAAC_RENDER_SHELL_A14620_NEXT_VA = 0x00a147e0u };
enum { ISAAC_RENDER_SHELL_A14620_STR_OFF = 0x08 };     /* [this+8] dup string */
enum { ISAAC_RENDER_SHELL_A14620_ARRAY_OFF = 0x0c };   /* [this+0xc] pair array */
enum { ISAAC_RENDER_SHELL_A14620_COUNT_OFF = 0x10 };   /* [this+0x10] count */
enum { ISAAC_RENDER_SHELL_A14620_FLAGS_OFF = 0x04 };   /* [this+4] flags */
enum { ISAAC_RENDER_SHELL_A14620_PAIR_STRIDE = 0x08 }; /* {ptr, flag} */
enum { ISAAC_RENDER_SHELL_A14620_PAIR_FLAG_OFF = 0x04 };
enum { ISAAC_RENDER_SHELL_A14620_PAIR_PTR_OFF = 0x00 };
enum { ISAAC_RENDER_SHELL_A14620_VTABLE_GATE_SLOT = 0x08 };
enum { ISAAC_RENDER_SHELL_A14620_VTABLE_FALSE_SLOT = 0x04 };
enum { ISAAC_RENDER_SHELL_A14620_VTABLE_TRUE_SLOT = 0x28 };
enum { ISAAC_RENDER_SHELL_A14620_FREE_CL = 0x01 };     /* a648b0 mode */
enum { ISAAC_RENDER_SHELL_A14620_ALLOC_CL = 0x00 };    /* a648b0 mode */
enum { ISAAC_RENDER_SHELL_A14620_FLAG_BIT0 = 0x01 };   /* or [this+4],1 */
enum { ISAAC_RENDER_SHELL_A14620_OP_NEW_VA = 0x00a0f4e0u };
enum { ISAAC_RENDER_SHELL_A14620_MEMCPY_IAT_VA = 0x00b1893cu };
enum { ISAAC_RENDER_SHELL_A14620_HEAP_VA = 0x00a648b0u };
enum { ISAAC_RENDER_SHELL_A14620_TAIL_RET_FALSE = 0x00 };
enum { ISAAC_RENDER_SHELL_A14620_TAIL_RET_TRUE = 0x01 };

int32_t isaac_render_shell_a14620_free_old_needed(uint32_t old_ptr);
int32_t isaac_render_shell_a14620_dup_needed(uint32_t str_ptr);
uint32_t isaac_render_shell_a14620_dup_size(uint32_t str_len);
uint32_t isaac_render_shell_a14620_dup_memcpy_count(uint32_t str_len);
int32_t isaac_render_shell_a14620_pair_count_entry(uint32_t pair0_flag);
int32_t isaac_render_shell_a14620_pair_count_step(uint32_t flag);
uint32_t isaac_render_shell_a14620_alloc_size(uint32_t count);
int32_t isaac_render_shell_a14620_fill_loop_continue(uint32_t index,
                                                     uint32_t count);
int32_t isaac_render_shell_a14620_pair_ptr_needs_dup(uint32_t ptr);
uint32_t isaac_render_shell_a14620_flags_set(uint32_t flags);
int32_t isaac_render_shell_a14620_tail_result(uint32_t al);
uint32_t isaac_render_shell_a14620_vtable_slot_off(uint32_t slot_kind);
uint32_t isaac_render_shell_a14620_host_va(void);
uint32_t isaac_render_shell_a14620_next_va(void);
uint32_t isaac_render_shell_a14620_str_off(void);
uint32_t isaac_render_shell_a14620_array_off(void);
uint32_t isaac_render_shell_a14620_count_off(void);
uint32_t isaac_render_shell_a14620_flags_off(void);
uint32_t isaac_render_shell_a14620_pair_stride(void);
uint32_t isaac_render_shell_a14620_pair_flag_off(void);
uint32_t isaac_render_shell_a14620_free_cl(void);
uint32_t isaac_render_shell_a14620_alloc_cl(void);
uint32_t isaac_render_shell_a14620_op_new_va(void);
uint32_t isaac_render_shell_a14620_memcpy_va(void);
uint32_t isaac_render_shell_a14620_heap_va(void);
uint32_t isaac_render_shell_a14620_tail_ret_false(void);
uint32_t isaac_render_shell_a14620_tail_ret_true(void);

/* ===========================================================================
 * FUN_00a147e0 vertex/pixel shader string wrapper — ABI v41
 *
 * Body VA 0x00a147e0..0x00a1498f, ret 0x10 (two arms), SEH+GS-cookie
 * prologue; no exact ZHL. this = ecx; [ebp+8] / [ebp+0xc] forwarded to the
 * nested 0xa14620 init; [ebp+0x10] = vertex shader name; [ebp+0x14] = pixel
 * shader name. 20 direct E8 callers image-wide (0x6802f6..0x6821cc, the
 * 0x680000 resource-loader band); zero address-taken.
 * Body (PE order):
 *   1. vertex: edi = 0xa178d0(obj=0xc37a10, [ebp+0x10]); if edi==0 ->
 *      log(8, 0xb81b18 "Failed to load vertex shader '%s'") + return 0
 *      (VA 0xa14816..0xa1481f / 0xa1496c)
 *   2. per-object fill (BOTH objects, identical shape — one template):
 *      [vtbl+0xc](obj, 0, 0)                ; init (VA 0xa14830 / 0xa14896)
 *      esi = [vtbl+4](obj)                  ; length getter (VA 0xa14836 / 0xa1489c)
 *      buf = host a0f4e0(esi+1)             ; alloc (VA 0xa1483e / 0xa148a4)
 *      flag = [vtbl+0x14](obj, buf, esi, 1) ; fill (VA 0xa14851 / 0xa148b7)
 *      buf[esi] = 0                         ; NUL at OFFSET = len (VA 0xa1485b / 0xa148c1)
 *      [vtbl+0](obj)                        ; release (VA 0xa14865 / 0xa148cb)
 *   3. buf-null gates (FULL dword): vertex buf==0 -> vertex error (0xa14867 /
 *      0xa1496c); pixel buf==0 -> pixel error (0xa148d0 / 0xa1493e)
 *   4. pixel: edi = 0xa178d0(0xc37a10, [ebp+0x14]); if edi==0 -> pixel
 *      error (0xa1493e) = free buf1 (a648b0 cl=1) + log(8, 0xb81b84
 *      "Failed to load pixel shader '%s'") + return 0
 *   5. local pair table at [ebp-0x28] stride 8: {buf1, flag1, buf2, flag2};
 *      call 0xa14620(this, [ebp+8], [ebp+0xc], &local) — the pair table
 *      arg2 of the nested init (VA 0xa148e6..0xa148f6)
 *   6. free buf1 (cl=1), free buf2 (cl=1); return = nested al (byte)
 *      (VA 0xa148fb..0xa14928)
 * Host leaves: 0xa178d0 registry lookup (string-keyed hash on 0xc379e0 via
 * 0xa17180/0xa17f40/0xa17ea0), 4 vtable slots per object (x2), alloc
 * a0f4e0, free a648b0 (cl=1), logger 0xa112c0 (level 8, msg VAs). The
 * exported laws are pure scalars — none reads host memory. NARROWED not
 * removed. NEXT_VA 0x00a149a0 (the v39 a149a0 virtual dtor body).
 * =========================================================================== */

enum { ISAAC_RENDER_SHELL_A147E0_HOST_VA = 0x00a147e0u };
enum { ISAAC_RENDER_SHELL_A147E0_END_VA = 0x00a1498fu };
enum { ISAAC_RENDER_SHELL_A147E0_NEXT_VA = 0x00a149a0u };
enum { ISAAC_RENDER_SHELL_A147E0_REGISTRY_VA = 0x00a178d0u };
enum { ISAAC_RENDER_SHELL_A147E0_REGISTRY_THIS_VA = 0x00c37a10u };
enum { ISAAC_RENDER_SHELL_A147E0_NESTED_VA = 0x00a14620u };
enum { ISAAC_RENDER_SHELL_A147E0_LOG_VERTEX_MSG_VA = 0x00b81b18u };
enum { ISAAC_RENDER_SHELL_A147E0_LOG_PIXEL_MSG_VA = 0x00b81b84u };
enum { ISAAC_RENDER_SHELL_A147E0_LOG_LEVEL = 8 };
enum { ISAAC_RENDER_SHELL_A147E0_FREE_CL = 0x01 };
enum { ISAAC_RENDER_SHELL_A147E0_FILL_CONST = 0x01 }; /* push 1 to +0x14 */
enum { ISAAC_RENDER_SHELL_A147E0_ERR_RET = 0 };
enum { ISAAC_RENDER_SHELL_A147E0_VTABLE_CALLS = 4 };
enum { ISAAC_RENDER_SHELL_A147E0_VTABLE_SLOT_0 = 0x0c }; /* init */
enum { ISAAC_RENDER_SHELL_A147E0_VTABLE_SLOT_1 = 0x04 }; /* length */
enum { ISAAC_RENDER_SHELL_A147E0_VTABLE_SLOT_2 = 0x14 }; /* fill */
enum { ISAAC_RENDER_SHELL_A147E0_VTABLE_SLOT_3 = 0x00 }; /* release */
enum { ISAAC_RENDER_SHELL_A147E0_LOCAL_BASE_OFF = 0x28 }; /* [ebp-0x28] */
enum { ISAAC_RENDER_SHELL_A147E0_LOCAL_PTR_0 = 0x00 };
enum { ISAAC_RENDER_SHELL_A147E0_LOCAL_PTR_1 = 0x08 };
enum { ISAAC_RENDER_SHELL_A147E0_LOCAL_FLAG_0 = 0x04 };
enum { ISAAC_RENDER_SHELL_A147E0_LOCAL_FLAG_1 = 0x0c };
enum { ISAAC_RENDER_SHELL_A147E0_LOCAL_STRIDE = 0x08 };

uint32_t isaac_render_shell_a147e0_host_va(void);
uint32_t isaac_render_shell_a147e0_end_va(void);
uint32_t isaac_render_shell_a147e0_next_va(void);
uint32_t isaac_render_shell_a147e0_registry_va(void);
uint32_t isaac_render_shell_a147e0_registry_this_va(void);
int32_t isaac_render_shell_a147e0_obj_needed(uint32_t obj);
int32_t isaac_render_shell_a147e0_buf_needed(uint32_t buf);
uint32_t isaac_render_shell_a147e0_dup_size(uint32_t len);
uint32_t isaac_render_shell_a147e0_nul_term_off(uint32_t len);
uint32_t isaac_render_shell_a147e0_free_cl(void);
uint32_t isaac_render_shell_a147e0_nested_va(void);
uint32_t isaac_render_shell_a147e0_vtable_calls(void);
uint32_t isaac_render_shell_a147e0_vtable_slot_off(uint32_t kind);
uint32_t isaac_render_shell_a147e0_local_ptr_off(uint32_t index);
uint32_t isaac_render_shell_a147e0_local_flag_off(uint32_t index);
uint32_t isaac_render_shell_a147e0_log_vertex_msg_va(void);
uint32_t isaac_render_shell_a147e0_log_pixel_msg_va(void);
uint32_t isaac_render_shell_a147e0_log_level(void);
uint32_t isaac_render_shell_a147e0_fill_const(void);
uint32_t isaac_render_shell_a147e0_err_ret(void);
int32_t isaac_render_shell_a147e0_result(uint32_t al);

/* ===========================================================================
 * FUN_00a149a0 a14620-object virtual destructor body — ABI v42
 *
 * Body VA 0x00a149a0..0x00a14be4, ret (no args, this=ecx), SEH+GS-cookie
 * prologue; no exact ZHL. Virtual dtor body at vtable `0xb81bac` slot +4
 * (a145e0's CALL_HOST_VA_0). Frees the object built by a14620 (v40):
 *   +0x00 vtable · +0x04 flags · +0x08 char* string · +0x0c pair array
 *   (8-byte {ptr,flag} entries, count +0x10) · +0x14..+0x30 eight dword
 *   slots · +0x34 vector<0x18> (begin/end +0x34/+0x38) · +0x40 vector
 *   (3 dwords, destroyed by a145e0 after this body).
 * Body (PE order):
 *   1. pair loop (0xa149d0..0xa149df): for i in [0, count): ptr =
 *      [array + i*8]; if ptr != 0 (FULL dword gate) -> tracked-free
 *   2. vector<0x18> walk (0xa14a17..0xa14aed): count = MAGIC SIGNED
 *      div by 0x18 of (end-begin) (0x2aaaaaab imul / sar edx,2 /
 *      shr 0x1f / add — re-derived per __element); inner array at
 *      [elem+0xc], dword count = (end-begin)>>2 (SAR signed); if
 *      [elem+8] > 7 (SIGNED, jle skip) free each inner dword via
 *      tracked-free; then [elem+0x10] = [elem+0xc] (collapse)
 *   3. per-0x18-element 4149d0(elem+0xc) at 0xa14af7..0xa14b04;
 *      then [0x38] = [0x34] (vector emptied)
 *   4. eight slots +0x14..+0x30 stride 4 (0xa14b0c..0xa14b50):
 *      ptr != 0 -> tracked-free + store 0
 *   5. string +0x8 (0xa14b52): ptr != 0 -> tracked-free + store 0
 *   6. array base +0xc (0xa14b94): ptr != 0 -> tracked-free + store 0
 *   7. [this+4] &= ~1 (clear bit0); [this+0x10] = 0 (0xa14bc8..0xa14bcc)
 * Tracked-free template (identical at all 5 sites):
 *   edx = [0xc7de78]; if edx != 0 (FULL dword) edx += 0x30 else
 *   edx = 0xc7f618; eax = [ptr-4] (size header); sub [edx],eax;
 *   sbb [edx+4],0; call [0xb187dc] (IAT free) — the alloc counter is
 *   a 64-bit value at the selected base, decremented by the header size.
 * Host leaves: IAT free [0xb187dc], 0x4149d0 (vector destroy), the
 *   counter select base [0xc7de78]. Exported laws are pure scalars —
 *   none reads host memory. NARROWED not removed.
 * NEXT_VA 0x00a14bf0 (thunk `add ecx,0xc; jmp 0x4149d0`).
 * =========================================================================== */

enum { ISAAC_RENDER_SHELL_A149A0_HOST_VA = 0x00a149a0u };
enum { ISAAC_RENDER_SHELL_A149A0_END_VA = 0x00a14be4u };
enum { ISAAC_RENDER_SHELL_A149A0_NEXT_VA = 0x00a14bf0u };
enum { ISAAC_RENDER_SHELL_A149A0_VTABLE_VA = 0x00b81bacu };
enum { ISAAC_RENDER_SHELL_A149A0_FREE_IAT_VA = 0x00b187dcu };
enum { ISAAC_RENDER_SHELL_A149A0_COUNTER_SEL_VA = 0x00c7de78u };
enum { ISAAC_RENDER_SHELL_A149A0_COUNTER_FALLBACK_VA = 0x00c7f618u };
enum { ISAAC_RENDER_SHELL_A149A0_COUNTER_OFF = 0x30 };
enum { ISAAC_RENDER_SHELL_A149A0_FLAGS_OFF = 0x04 };
enum { ISAAC_RENDER_SHELL_A149A0_STR_OFF = 0x08 };
enum { ISAAC_RENDER_SHELL_A149A0_ARRAY_OFF = 0x0c };
enum { ISAAC_RENDER_SHELL_A149A0_COUNT_OFF = 0x10 };
enum { ISAAC_RENDER_SHELL_A149A0_SLOTS_OFF = 0x14 };
enum { ISAAC_RENDER_SHELL_A149A0_SLOT_STRIDE = 0x04 };
enum { ISAAC_RENDER_SHELL_A149A0_SLOT_COUNT = 8 };
enum { ISAAC_RENDER_SHELL_A149A0_PAIR_STRIDE = 0x08 };
enum { ISAAC_RENDER_SHELL_A149A0_VEC_OFF = 0x34 };
enum { ISAAC_RENDER_SHELL_A149A0_VEC_STRIDE = 0x18 };
enum { ISAAC_RENDER_SHELL_A149A0_ELEM_TYPE_OFF = 0x08 };
enum { ISAAC_RENDER_SHELL_A149A0_ELEM_ARRAY_OFF = 0x0c };
enum { ISAAC_RENDER_SHELL_A149A0_ELEM_END_OFF = 0x10 };
enum { ISAAC_RENDER_SHELL_A149A0_VEC_DESTROY_VA = 0x004149d0u };
enum { ISAAC_RENDER_SHELL_A149A0_VEC18_MAGIC = 0x2aaaaaabu };
enum { ISAAC_RENDER_SHELL_A149A0_TRACKED_FREE_SITES = 5 };

int32_t isaac_render_shell_a149a0_ptr_free_needed(uint32_t ptr);
uint32_t isaac_render_shell_a149a0_counter_base(uint32_t sel);
uint32_t isaac_render_shell_a149a0_counter_dec_lo(uint32_t lo,
                                                  uint32_t size_hdr);
int32_t isaac_render_shell_a149a0_counter_sbb_borrow(uint32_t lo,
                                                      uint32_t size_hdr);
uint32_t isaac_render_shell_a149a0_counter_dec_hi(uint32_t hi,
                                                  uint32_t borrow);
int32_t isaac_render_shell_a149a0_elem_free_needed(uint32_t type_dword);
int32_t isaac_render_shell_a149a0_vec18_count(uint32_t begin,
                                              uint32_t end);
int32_t isaac_render_shell_a149a0_inner_dword_count(uint32_t begin_ptr,
                                                    uint32_t end_ptr);
uint32_t isaac_render_shell_a149a0_flags_clear_bit0(uint32_t flags);
uint32_t isaac_render_shell_a149a0_vtable_va(void);
uint32_t isaac_render_shell_a149a0_free_iat_va(void);
uint32_t isaac_render_shell_a149a0_counter_sel_va(void);
uint32_t isaac_render_shell_a149a0_counter_fallback_va(void);
uint32_t isaac_render_shell_a149a0_counter_off(void);
uint32_t isaac_render_shell_a149a0_vec_destroy_va(void);
uint32_t isaac_render_shell_a149a0_tracked_free_sites(void);
uint32_t isaac_render_shell_a149a0_slot_count(void);
uint32_t isaac_render_shell_a149a0_host_va(void);
uint32_t isaac_render_shell_a149a0_end_va(void);
uint32_t isaac_render_shell_a149a0_next_va(void);

/* ===========================================================================
 * FUN_00a14c00 render-shell item add/update method — ABI v43
 *
 * Body VA 0x00a14c00..0x00a14f0f, ret 0x10 @ 0xa14f0c, SEH+GS-cookie
 * prologue; no exact ZHL; this=ecx. 45 direct E8 callers
 * (0x4095c3..0x9945c8) — signature (this, name@[ebp+8] C-string,
 * type@[ebp+0xc], data@[ebp+0x10], unused@[ebp+0x14]; ret 0x10 pops
 * all 4 stack args, arg4 never read). Callers use types 9/0xa/0xb.
 * Body (PE order):
 *   1. [ebp-0x18] = a15040(this, name) — host linear search over the
 *      this+0x34 vec18 (strcmp [elem] vs name); eax != 0 (FULL dword
 *      gate) -> element found, jump to dispatch
 *   2. not found: zero local buf; a152a0(&this+0x34, &buf) host
 *      vector-push (copies 0x18 bytes, clears buf — local free block
 *      then no-ops on begin==0); esi = last vec18 element (MAGIC
 *      count, re-derived); [esi]=name, [esi+4]=1, [esi+8]=type;
 *      [ebp-0x18]=esi
 *   3. type -> size dispatch (0xa14d50..0xa14db1): cmp type,0x1c;
 *      ja -> err A; jmp [type*4 + 0xa14f10] (29-entry jump table).
 *      idx 0..7 -> err B (push 0xb81b40); idx 8..0x1c -> esi = size
 *      (8->4, 9->8, 10->0xc, 11->0x10, 12->4, 13->8, 14->0xc,
 *      15->0x10, 16->4, 17->8, 18->0xc, 19->0x10, 20->0x10, 21->0x18,
 *      22->0x20, 23->0x18, 24->0x24, 25->0x30, 26->0x20, 27->0x30,
 *      28->0x40); type > 0x1c -> err A (push 0xb81aec). Both errors:
 *      push 0x10; call a112c0 (logger level 0x10); esi = 0.
 *   4. dedup compare (0xa14db3..0xa14e2d): inner count =
 *      ([elem+0x10]-[elem+0xc])>>2 SAR; count==0 -> copy; else
 *      memcmp `size` bytes (elem-inner vs [ebp+0x10]) dword loop +
 *      byte remainder (-4/-3/-2/-1 edges); full match -> epilogue
 *      (skip re-copy); mismatch -> copy path
 *   5. copy path: a0f4e0(esi) host alloc; af05df(dup, data, esi)
 *      host copy; push dup into elem inner vec (direct store when
 *      room, else 42c920 grow, host)
 *   6. rewalk (0xa14e67..0xa14ef7): this+0x44 = this+0x40 (empty);
 *      count = vec18 MAGIC div (RE-DERIVED per iteration); per
 *      element push ([elem+0x10]-[elem+0xc])>>2 - 1 into this+0x40
 *      vec (direct or 42c920 grow); loop jb UNSIGNED
 * Exported laws are pure scalars (no host memory read):
 *   a14c00_size_for_type(type) — jump-table law, 0 on error band;
 *   a14c00_error_msg_va(type) — 0xb81b40 (type<=7) / 0xb81aec
 *   (type>0x1c, UNSIGNED) / 0 (valid 8..0x1c).
 * Template coverage: SAME vec18 magic (0x2aaaaaab signed div by 0x18,
 * C-truncation) and SAME 0x18-element inner layout (+0xc/+0x10/+0x14)
 * as a149a0 (v42) — cross-ABI constants pinned equal in tests. The
 * v42 `[elem+8] > 7` SIGNED free gate is explained: [elem+8] holds
 * the TYPE (stored here), only data types 8..28 own an inner array.
 * Host leaves: a15040, a152a0, a0f4e0, af05df, 42c920, a112c0,
 * aef15c, IAT [0xb18894]/[0xb1893c]. NARROWED not removed.
 * NEXT_VA 0x00a14f90 (next SEH body after the 29-dword jump table).
 * =========================================================================== */

enum { ISAAC_RENDER_SHELL_A14C00_HOST_VA = 0x00a14c00u };
enum { ISAAC_RENDER_SHELL_A14C00_END_VA = 0x00a14f0fu };
enum { ISAAC_RENDER_SHELL_A14C00_NEXT_VA = 0x00a14f90u };
enum { ISAAC_RENDER_SHELL_A14C00_JUMP_TABLE_VA = 0x00a14f10u };
enum { ISAAC_RENDER_SHELL_A14C00_JUMP_TABLE_ENTRIES = 0x1d };
enum { ISAAC_RENDER_SHELL_A14C00_TYPE_MIN_VALID = 0x08 };
enum { ISAAC_RENDER_SHELL_A14C00_TYPE_MAX_VALID = 0x1c };
enum { ISAAC_RENDER_SHELL_A14C00_LOG_LEVEL = 0x10 };
enum { ISAAC_RENDER_SHELL_A14C00_MSG_LO_VA = 0x00b81b40u };
enum { ISAAC_RENDER_SHELL_A14C00_MSG_HI_VA = 0x00b81aecu };
enum { ISAAC_RENDER_SHELL_A14C00_LOGGER_VA = 0x00a112c0u };
enum { ISAAC_RENDER_SHELL_A14C00_FIND_VA = 0x00a15040u };
enum { ISAAC_RENDER_SHELL_A14C00_PUSH_VA = 0x00a152a0u };
enum { ISAAC_RENDER_SHELL_A14C00_ALLOC_VA = 0x00a0f4e0u };
enum { ISAAC_RENDER_SHELL_A14C00_COPY_VA = 0x00af05dfu };
enum { ISAAC_RENDER_SHELL_A14C00_GROW_VA = 0x0042c920u };
enum { ISAAC_RENDER_SHELL_A14C00_SIZED_FREE_VA = 0x00aef15cu };
enum { ISAAC_RENDER_SHELL_A14C00_RANGE_IAT_VA = 0x00b18894u };
enum { ISAAC_RENDER_SHELL_A14C00_MEMCPY_IAT_VA = 0x00b1893cu };
enum { ISAAC_RENDER_SHELL_A14C00_STACK_ARGS = 4 };
enum { ISAAC_RENDER_SHELL_A14C00_ELEM_STRIDE = 0x18 };
enum { ISAAC_RENDER_SHELL_A14C00_ELEM_NAME_OFF = 0x00 };
enum { ISAAC_RENDER_SHELL_A14C00_ELEM_FLAG_OFF = 0x04 };
enum { ISAAC_RENDER_SHELL_A14C00_ELEM_VALUE_OFF = 0x08 };
enum { ISAAC_RENDER_SHELL_A14C00_ELEM_INNER_BEGIN_OFF = 0x0c };
enum { ISAAC_RENDER_SHELL_A14C00_ELEM_INNER_END_OFF = 0x10 };
enum { ISAAC_RENDER_SHELL_A14C00_ELEM_INNER_CAP_OFF = 0x14 };
enum { ISAAC_RENDER_SHELL_A14C00_VEC18_OFF = 0x34 };
enum { ISAAC_RENDER_SHELL_A14C00_VEC18_END_OFF = 0x38 };
enum { ISAAC_RENDER_SHELL_A14C00_VEC_OFF = 0x40 };
enum { ISAAC_RENDER_SHELL_A14C00_VEC_END_OFF = 0x44 };
enum { ISAAC_RENDER_SHELL_A14C00_VEC_CAP_OFF = 0x48 };
enum { ISAAC_RENDER_SHELL_A14C00_VEC18_MAGIC = 0x2aaaaaabu };
enum { ISAAC_RENDER_SHELL_A14C00_FLAG_CONST = 1 };
enum { ISAAC_RENDER_SHELL_A14C00_SIZE_4 = 0x04 };
enum { ISAAC_RENDER_SHELL_A14C00_SIZE_8 = 0x08 };
enum { ISAAC_RENDER_SHELL_A14C00_SIZE_C = 0x0c };
enum { ISAAC_RENDER_SHELL_A14C00_SIZE_10 = 0x10 };
enum { ISAAC_RENDER_SHELL_A14C00_SIZE_18 = 0x18 };
enum { ISAAC_RENDER_SHELL_A14C00_SIZE_20 = 0x20 };
enum { ISAAC_RENDER_SHELL_A14C00_SIZE_24 = 0x24 };
enum { ISAAC_RENDER_SHELL_A14C00_SIZE_30 = 0x30 };
enum { ISAAC_RENDER_SHELL_A14C00_SIZE_40 = 0x40 };

int32_t isaac_render_shell_a14c00_size_for_type(uint32_t type);
uint32_t isaac_render_shell_a14c00_error_msg_va(uint32_t type);
uint32_t isaac_render_shell_a14c00_jump_table_va(void);
uint32_t isaac_render_shell_a14c00_jump_table_entries(void);
uint32_t isaac_render_shell_a14c00_type_min_valid(void);
uint32_t isaac_render_shell_a14c00_type_max_valid(void);
uint32_t isaac_render_shell_a14c00_log_level(void);
uint32_t isaac_render_shell_a14c00_msg_lo_va(void);
uint32_t isaac_render_shell_a14c00_msg_hi_va(void);
uint32_t isaac_render_shell_a14c00_logger_va(void);
uint32_t isaac_render_shell_a14c00_find_va(void);
uint32_t isaac_render_shell_a14c00_push_va(void);
uint32_t isaac_render_shell_a14c00_alloc_va(void);
uint32_t isaac_render_shell_a14c00_copy_va(void);
uint32_t isaac_render_shell_a14c00_grow_va(void);
uint32_t isaac_render_shell_a14c00_sized_free_va(void);
uint32_t isaac_render_shell_a14c00_range_iat_va(void);
uint32_t isaac_render_shell_a14c00_memcpy_iat_va(void);
uint32_t isaac_render_shell_a14c00_stack_args(void);
uint32_t isaac_render_shell_a14c00_elem_stride(void);
uint32_t isaac_render_shell_a14c00_elem_inner_begin_off(void);
uint32_t isaac_render_shell_a14c00_elem_inner_end_off(void);
uint32_t isaac_render_shell_a14c00_elem_inner_cap_off(void);
uint32_t isaac_render_shell_a14c00_vec18_off(void);
uint32_t isaac_render_shell_a14c00_vec_off(void);
uint32_t isaac_render_shell_a14c00_vec18_magic(void);
uint32_t isaac_render_shell_a14c00_host_va(void);
uint32_t isaac_render_shell_a14c00_end_va(void);
uint32_t isaac_render_shell_a14c00_next_va(void);

/* ===========================================================================
 * FUN_00a14f90 render-shell class method (vtable slot +0x0c of the
 * 0xb81bac vtable) — ABI v44
 *
 * Body VA 0x00a14f90..0x00a15037, ret 4 @ 0xa15035 (1 stack arg); plain
 * ebp frame (no SEH/GS); this=ecx. The 0xb81bac vtable (shared with the
 * a145e0 deleting dtor slot +0 / a149a0 dtor body slot +4, pinned v39/
 * v42) holds this body at slot +0x0c and the next method at slot +0x14
 * (0xa150d0). identify-zhl reports only a 14-byte prologue-prefix match
 * to `Music::Crossfade(int,float)`; the body pops 1 stack arg (ret 4),
 * so the 2-arg catalog signature does not fit — name stays
 * address-stable FUN_00a14f90 (no exact ZHL, like a145e0/a149a0/a14c00).
 * Signature: (this=ecx, list@[ebp+8] — nullable dword-index vector).
 *   list == 0 -> list = &this+0x40 (default index vec; the SAME vec
 *   a14c00's step-6 rewalk fills — cross-ABI link).
 * Phase 1 walk (0xa14fa3..0xa15011): count = (list[4]-list[0])>>2
 *   (SAR signed, RE-DERIVED per iteration); count == 0 skips the walk.
 *   Per i in [0,count): value = list[i] (dword); elem = this->vec18[i]
 *   (stride 0x18 at this+0x34, begin RE-READ per iteration; offset
 *   accumulator [ebp+8] += 0x18 per iteration); inner_count =
 *   (elem[0x10]-elem[0xc])>>2 (SAR); value >= inner_count (UNSIGNED
 *   jae) -> skip; else inner_value = elem_inner[value]; type = elem[8];
 *   type <= 7 (UNSIGNED `cmp edx,7; ja`) -> DAT_00c79928[type] =
 *   inner_value (8-slot host table); type > 7 -> vtable slot +0x1c
 *   call (this, elem[0] name, type, inner_value, elem[4] flag) — 4
 *   stack args.
 * Phase 2 flush (0xa15013..0xa1502d): per i in 0..7: val =
 *   DAT_00c79928[i]; val != 0 (FULL dword test 0xa1501c) -> vtable
 *   slot +0x18 call (this, i, val) — 2 stack args.
 * Exported laws are pure scalars (no host memory read):
 *   a14f90_list_dword_count(begin,end) — (end-begin)>>2 SAR (entry
 *     bound and per-iteration re-derived bound; SAME law as v42
 *     a149a0_inner_dword_count — pinned equal in tests);
 *   a14f90_index_in_range(value,inner_count) — UNSIGNED value <
 *     inner_count (the cmp/jae gate; inner_count = SAR result
 *     reinterpreted unsigned);
 *   a14f90_type_to_table(type) — 1 for type <= 7 (UNSIGNED, table
 *     store), 0 for type > 7 (vtable slot +0x1c dispatch);
 *   a14f90_flush_needed(val) — FULL dword val != 0 gate (flush slot
 *     +0x18 dispatch);
 *   a14f90_element_off(index) — index * 0x18 32-bit wrap (the
 *     [ebp+8] accumulator law feeding vec18 element addressing).
 * Host state/leaves: list/vec18/inner memory reads, the DAT 0xc79928
 * 8-slot table, and the two unnamed vtable dispatch slots (+0x1c per
 * element / +0x18 flush) — address-stable host actions per the v26
 * convention. NARROWED not removed.
 * NEXT_VA 0x00a15040 (literal next body: the a15040 find helper, a
 * shared vec18 strcmp walk — host leaf per standing decision). Next
 * class method 0x00a150d0 (vtable slot +0x14, allocator counter
 * machinery) — NEXT_METHOD_VA.
 * =========================================================================== */

enum { ISAAC_RENDER_SHELL_A14F90_HOST_VA = 0x00a14f90u };
enum { ISAAC_RENDER_SHELL_A14F90_END_VA = 0x00a15037u };
enum { ISAAC_RENDER_SHELL_A14F90_NEXT_VA = 0x00a15040u };
enum { ISAAC_RENDER_SHELL_A14F90_NEXT_METHOD_VA = 0x00a150d0u };
enum { ISAAC_RENDER_SHELL_A14F90_VTABLE_VA = 0x00b81bacu };
enum { ISAAC_RENDER_SHELL_A14F90_VTABLE_SLOT = 0x0c };
enum { ISAAC_RENDER_SHELL_A14F90_SLOT_PER_ELEM = 0x1c };
enum { ISAAC_RENDER_SHELL_A14F90_SLOT_FLUSH = 0x18 };
enum { ISAAC_RENDER_SHELL_A14F90_PER_ELEM_ARGS = 4 };
enum { ISAAC_RENDER_SHELL_A14F90_FLUSH_ARGS = 2 };
enum { ISAAC_RENDER_SHELL_A14F90_TABLE_VA = 0x00c79928u };
enum { ISAAC_RENDER_SHELL_A14F90_TABLE_ENTRIES = 8 };
enum { ISAAC_RENDER_SHELL_A14F90_TABLE_MAX_TYPE = 7 };
enum { ISAAC_RENDER_SHELL_A14F90_LIST_FALLBACK_OFF = 0x40 };
enum { ISAAC_RENDER_SHELL_A14F90_VEC18_OFF = 0x34 };
enum { ISAAC_RENDER_SHELL_A14F90_ELEM_STRIDE = 0x18 };
enum { ISAAC_RENDER_SHELL_A14F90_ELEM_NAME_OFF = 0x00 };
enum { ISAAC_RENDER_SHELL_A14F90_ELEM_FLAG_OFF = 0x04 };
enum { ISAAC_RENDER_SHELL_A14F90_ELEM_TYPE_OFF = 0x08 };
enum { ISAAC_RENDER_SHELL_A14F90_ELEM_INNER_BEGIN_OFF = 0x0c };
enum { ISAAC_RENDER_SHELL_A14F90_ELEM_INNER_END_OFF = 0x10 };
enum { ISAAC_RENDER_SHELL_A14F90_STACK_ARGS = 1 };

int32_t isaac_render_shell_a14f90_list_dword_count(uint32_t begin,
                                                   uint32_t end);
int32_t isaac_render_shell_a14f90_index_in_range(uint32_t value,
                                                 int32_t inner_count);
int32_t isaac_render_shell_a14f90_type_to_table(uint32_t type);
int32_t isaac_render_shell_a14f90_flush_needed(uint32_t val);
uint32_t isaac_render_shell_a14f90_element_off(uint32_t index);
uint32_t isaac_render_shell_a14f90_host_va(void);
uint32_t isaac_render_shell_a14f90_end_va(void);
uint32_t isaac_render_shell_a14f90_next_va(void);
uint32_t isaac_render_shell_a14f90_next_method_va(void);
uint32_t isaac_render_shell_a14f90_vtable_va(void);
uint32_t isaac_render_shell_a14f90_vtable_slot(void);
uint32_t isaac_render_shell_a14f90_slot_per_elem(void);
uint32_t isaac_render_shell_a14f90_slot_flush(void);
uint32_t isaac_render_shell_a14f90_per_elem_args(void);
uint32_t isaac_render_shell_a14f90_flush_args(void);
uint32_t isaac_render_shell_a14f90_table_va(void);
uint32_t isaac_render_shell_a14f90_table_entries(void);
uint32_t isaac_render_shell_a14f90_table_max_type(void);
uint32_t isaac_render_shell_a14f90_list_fallback_off(void);
uint32_t isaac_render_shell_a14f90_vec18_off(void);
uint32_t isaac_render_shell_a14f90_elem_stride(void);
uint32_t isaac_render_shell_a14f90_stack_args(void);

/* ===========================================================================
 * FUN_00a150d0 render-shell class method (vtable slot +0x14 of the
 * 0xb81bac vtable) — ABI v45
 *
 * Body VA 0x00a150d0..0x00a15296, ret (no args, this=ecx), SEH+GS-cookie
 * prologue; no exact ZHL. Fourth method of the 0xb81bac vtable (a145e0
 * slot +0 / a149a0 slot +4 / a14f90 slot +0xc pinned v39/v42/v44; this
 * body at slot +0x14, confirmed from the PE vtable bytes). Same object
 * family: built by a14620 (v40), extended by a14c00 (v43), walked by
 * a14f90 (v44).
 * Body (PE order):
 *   Phase A inner free + retain-last (0xa150fd..0xa151f8): count =
 *     MAGIC SIGNED div by 0x18 of ([this+0x38]-[this+0x34])
 *     (0x2aaaaaab imul / sar edx,2 / shr 0x1f / add — RE-DERIVED per
 *     iteration, same template as a149a0 v42); count == 0 skips. Per
 *     element (stride 0x18): inner_count = ([elem+0x10]-[elem+0xc])>>2
 *     (SAR signed); inner_count == 0 -> skip element entirely (no
 *     collapse); last = [elem_begin + inner_count*4 - 4] (0xa1513f);
 *     if [elem+8] > 7 (SIGNED cmp dword,7; jle skip) for j in
 *     [0, inner_count-1) (UNSIGNED jb loop, elem_begin RE-READ per
 *     iteration): inner = [elem_begin + j*4]; inner != 0 (FULL dword
 *     gate) -> tracked-free, then [elem_begin + j*4] = 0.
 *     Collapse: [elem+0x10] = [elem+0xc] (end = begin); retain:
 *     begin == cap (cmp/je 0xa151b9) -> grow 0x42c920(lea elem+0xc,
 *     begin, &last) host; else [begin] = last; [elem+0x10] += 4.
 *   Phase B vec rewalk (0xa151fe..0xa15283): [this+0x44] = [this+0x40]
 *     (vec emptied); count = MAGIC div (RE-DERIVED per iteration);
 *     count == 0 skips. Per element: push_value = ([elem+0x10]-
 *     [elem+0xc])>>2 SAR - 1 (0xa1523b sar; 0xa1523e dec); vec.end ==
 *     vec.cap (cmp/je 0xa15248) -> grow 0x42c920(&this+0x40, vec.end,
 *     &push_value) host; else [vec.end] = push_value; vec.end += 4.
 * Tracked-free template (single site here, 0xa1516a..0xa15187): the
 * SAME counter select / sbb decrement as a149a0 (v42) — edx =
 * [0xc7de78]; edx != 0 (FULL dword) -> edx += 0x30 else edx =
 * 0xc7f618; eax = [ptr-4] (size header); sub [edx],eax; sbb [edx+4],0;
 * call [0xb187dc] (IAT free). 64-bit alloc counter at the selected
 * base, decremented by the header size; borrow = UNSIGNED strict <.
 * Host leaves: IAT free [0xb187dc], grow 0x42c920 (x2), the counter
 * select base load [0xc7de78], and all memory (elem/vec reads +
 * stores). Exported laws are pure scalars (no host memory read):
 * FULL-dword ptr gate, counter select + sbb-borrow decrement trio,
 * SIGNED elem type gate, vec18 magic div, inner dword count, grow
 * gate (je EQUALITY — direct store when ptr != cap), retain-last
 * load-offset and push_value/retain_end scalar arithmetic.
 * NARROWED not removed.
 * NEXT_VA 0x00a152a0 (vec18 push element helper; plain ebp frame,
 * ret 4 — the a14c00 PUSH_VA leaf).
 * =========================================================================== */

enum { ISAAC_RENDER_SHELL_A150D0_HOST_VA = 0x00a150d0u };
enum { ISAAC_RENDER_SHELL_A150D0_END_VA = 0x00a15296u };
enum { ISAAC_RENDER_SHELL_A150D0_NEXT_VA = 0x00a152a0u };
enum { ISAAC_RENDER_SHELL_A150D0_VTABLE_VA = 0x00b81bacu };
enum { ISAAC_RENDER_SHELL_A150D0_VTABLE_SLOT = 0x14 };
enum { ISAAC_RENDER_SHELL_A150D0_FREE_IAT_VA = 0x00b187dcu };
enum { ISAAC_RENDER_SHELL_A150D0_COUNTER_SEL_VA = 0x00c7de78u };
enum { ISAAC_RENDER_SHELL_A150D0_COUNTER_FALLBACK_VA = 0x00c7f618u };
enum { ISAAC_RENDER_SHELL_A150D0_COUNTER_OFF = 0x30 };
enum { ISAAC_RENDER_SHELL_A150D0_COUNTER_LO_OFF = 0x00 };
enum { ISAAC_RENDER_SHELL_A150D0_COUNTER_HI_OFF = 0x04 };
enum { ISAAC_RENDER_SHELL_A150D0_GROW_VA = 0x0042c920u };
enum { ISAAC_RENDER_SHELL_A150D0_TYPE_FREE_MAX = 7 };
enum { ISAAC_RENDER_SHELL_A150D0_VEC18_MAGIC = 0x2aaaaaabu };
enum { ISAAC_RENDER_SHELL_A150D0_VEC18_OFF = 0x34 };
enum { ISAAC_RENDER_SHELL_A150D0_VEC18_END_OFF = 0x38 };
enum { ISAAC_RENDER_SHELL_A150D0_VEC18_STRIDE = 0x18 };
enum { ISAAC_RENDER_SHELL_A150D0_VEC_OFF = 0x40 };
enum { ISAAC_RENDER_SHELL_A150D0_VEC_END_OFF = 0x44 };
enum { ISAAC_RENDER_SHELL_A150D0_VEC_CAP_OFF = 0x48 };
enum { ISAAC_RENDER_SHELL_A150D0_ELEM_TYPE_OFF = 0x08 };
enum { ISAAC_RENDER_SHELL_A150D0_ELEM_INNER_BEGIN_OFF = 0x0c };
enum { ISAAC_RENDER_SHELL_A150D0_ELEM_INNER_END_OFF = 0x10 };
enum { ISAAC_RENDER_SHELL_A150D0_ELEM_INNER_CAP_OFF = 0x14 };
enum { ISAAC_RENDER_SHELL_A150D0_RETAIN_STORE_SIZE = 0x04 };
enum { ISAAC_RENDER_SHELL_A150D0_PUSH_DEC = 1 };

int32_t isaac_render_shell_a150d0_ptr_free_needed(uint32_t ptr);
uint32_t isaac_render_shell_a150d0_counter_base(uint32_t sel);
uint32_t isaac_render_shell_a150d0_counter_dec_lo(uint32_t lo,
                                                  uint32_t size_hdr);
int32_t isaac_render_shell_a150d0_counter_sbb_borrow(uint32_t lo,
                                                      uint32_t size_hdr);
uint32_t isaac_render_shell_a150d0_counter_dec_hi(uint32_t hi,
                                                  uint32_t borrow);
int32_t isaac_render_shell_a150d0_elem_free_needed(uint32_t type_dword);
int32_t isaac_render_shell_a150d0_vec18_count(uint32_t begin,
                                              uint32_t end);
int32_t isaac_render_shell_a150d0_inner_dword_count(uint32_t begin_ptr,
                                                    uint32_t end_ptr);
int32_t isaac_render_shell_a150d0_grow_needed(uint32_t ptr,
                                              uint32_t cap);
uint32_t isaac_render_shell_a150d0_inner_last_off(uint32_t begin,
                                                  int32_t inner_count);
uint32_t isaac_render_shell_a150d0_push_value(int32_t inner_count);
uint32_t isaac_render_shell_a150d0_retain_end(uint32_t begin);
uint32_t isaac_render_shell_a150d0_host_va(void);
uint32_t isaac_render_shell_a150d0_end_va(void);
uint32_t isaac_render_shell_a150d0_next_va(void);
uint32_t isaac_render_shell_a150d0_vtable_va(void);
uint32_t isaac_render_shell_a150d0_vtable_slot(void);
uint32_t isaac_render_shell_a150d0_free_iat_va(void);
uint32_t isaac_render_shell_a150d0_counter_sel_va(void);
uint32_t isaac_render_shell_a150d0_counter_fallback_va(void);
uint32_t isaac_render_shell_a150d0_counter_off(void);
uint32_t isaac_render_shell_a150d0_counter_lo_off(void);
uint32_t isaac_render_shell_a150d0_counter_hi_off(void);
uint32_t isaac_render_shell_a150d0_grow_va(void);
uint32_t isaac_render_shell_a150d0_type_free_max(void);
uint32_t isaac_render_shell_a150d0_vec18_magic(void);
uint32_t isaac_render_shell_a150d0_vec18_off(void);
uint32_t isaac_render_shell_a150d0_vec18_end_off(void);
uint32_t isaac_render_shell_a150d0_vec18_stride(void);
uint32_t isaac_render_shell_a150d0_vec_off(void);
uint32_t isaac_render_shell_a150d0_vec_end_off(void);
uint32_t isaac_render_shell_a150d0_vec_cap_off(void);
uint32_t isaac_render_shell_a150d0_elem_type_off(void);
uint32_t isaac_render_shell_a150d0_elem_inner_begin_off(void);
uint32_t isaac_render_shell_a150d0_elem_inner_end_off(void);
uint32_t isaac_render_shell_a150d0_elem_inner_cap_off(void);
uint32_t isaac_render_shell_a150d0_retain_store_size(void);
uint32_t isaac_render_shell_a150d0_push_dec(void);

/* ===========================================================================
 * FUN_00a152a0 vec18 push element helper — ABI v46
 *
 * Body VA 0x00a152a0..0x00a15301, ret 4 (this=ecx, one stack arg
 * elem@[ebp+8]), plain ebp frame (NO SEH/GS). The a14c00 (v43)
 * PUSH_VA leaf: called as a152a0(&vec18, &buf) to append a new 0x18
 * element. vec18 header layout begin@+0 / end@+4 / cap@+8 (the object
 * vec at this+0x34/+0x38/+0x3c and the +0x40 vec share the template).
 * Body (PE order):
 *   end = [this+4]; cmp end,[this+8]; je 0xa152f5 — FULL gate: grow
 *     iff end == cap (EQUALITY; direct append when end != cap).
 *   Direct append (0xa152b0..0xa152f2): elem 6 dwords (0x18) copied —
 *     name+0 / flag+4 / value+8 / inner vec begin+0xc / end+0x10 /
 *     cap+0x14; inner vec read at the SOURCE, source inner vec ZEROED,
 *     saved triple written to the dest; then [this+4] += 0x18 (the
 *     0x18 STRIDE, 32-bit wrap).
 *   Grow request (0xa152f5..0xa15301): push elem; push end; call
 *     0xa153a0 (this=ecx untouched on this path) — the vec18 grow IAT,
 *     ret 8, stack args (end@[ebp+8], elem@[ebp+0xc]); then ret 4.
 * The grow IAT 0xa153a0 (realloc-push: magic-div count, 1.5x growth
 * clamp, alloc 0x40cf00, memmove 0x915eb0 x2, inner-vec destroy
 * 0x4149d0, sized free 0xaef15c — host) is NOT translated (standing
 * decision: alloc/free/grow IAT stays host). Exported laws are pure
 * scalars: the end==cap EQUALITY grow gate, the end += 0x18 stride
 * law, the 6-dword copy span, the grow-request call ABI (2 stack
 * args / callee ret 8 / arg offsets), plus layout getters.
 * NARROWED not removed.
 * NEXT_VA 0x00a153a0 (the grow IAT itself; peelable growth-factor
 * laws with alloc/memmove/destroy/free host).
 * PE evidence: section-notes/cpu-dump/00a152a0.txt
 * =========================================================================== */

enum { ISAAC_RENDER_SHELL_A152A0_HOST_VA = 0x00a152a0u };
enum { ISAAC_RENDER_SHELL_A152A0_END_VA = 0x00a15301u };
enum { ISAAC_RENDER_SHELL_A152A0_NEXT_VA = 0x00a153a0u };
enum { ISAAC_RENDER_SHELL_A152A0_VEC_BEGIN_OFF = 0x00 };
enum { ISAAC_RENDER_SHELL_A152A0_VEC_END_OFF = 0x04 };
enum { ISAAC_RENDER_SHELL_A152A0_VEC_CAP_OFF = 0x08 };
enum { ISAAC_RENDER_SHELL_A152A0_ELEM_NAME_OFF = 0x00 };
enum { ISAAC_RENDER_SHELL_A152A0_ELEM_FLAG_OFF = 0x04 };
enum { ISAAC_RENDER_SHELL_A152A0_ELEM_VALUE_OFF = 0x08 };
enum { ISAAC_RENDER_SHELL_A152A0_ELEM_INNER_BEGIN_OFF = 0x0c };
enum { ISAAC_RENDER_SHELL_A152A0_ELEM_INNER_END_OFF = 0x10 };
enum { ISAAC_RENDER_SHELL_A152A0_ELEM_INNER_CAP_OFF = 0x14 };
enum { ISAAC_RENDER_SHELL_A152A0_ELEM_STRIDE = 0x18 };
enum { ISAAC_RENDER_SHELL_A152A0_COPIED_DWORDS = 0x06 };
enum { ISAAC_RENDER_SHELL_A152A0_GROW_CALLEE_VA = 0x00a153a0u };
enum { ISAAC_RENDER_SHELL_A152A0_GROW_STACK_ARGS = 0x02 };
enum { ISAAC_RENDER_SHELL_A152A0_GROW_END_ARG_OFF = 0x08 };
enum { ISAAC_RENDER_SHELL_A152A0_GROW_ELEM_ARG_OFF = 0x0c };
enum { ISAAC_RENDER_SHELL_A152A0_STACK_ARGS = 0x01 };

int32_t isaac_render_shell_a152a0_grow_needed(uint32_t end, uint32_t cap);
uint32_t isaac_render_shell_a152a0_append_end(uint32_t end);
uint32_t isaac_render_shell_a152a0_copied_dwords(void);
uint32_t isaac_render_shell_a152a0_grow_stack_args(void);
uint32_t isaac_render_shell_a152a0_grow_end_arg_off(void);
uint32_t isaac_render_shell_a152a0_grow_elem_arg_off(void);
uint32_t isaac_render_shell_a152a0_grow_callee_va(void);
uint32_t isaac_render_shell_a152a0_host_va(void);
uint32_t isaac_render_shell_a152a0_end_va(void);
uint32_t isaac_render_shell_a152a0_next_va(void);
uint32_t isaac_render_shell_a152a0_vec_begin_off(void);
uint32_t isaac_render_shell_a152a0_vec_end_off(void);
uint32_t isaac_render_shell_a152a0_vec_cap_off(void);
uint32_t isaac_render_shell_a152a0_elem_name_off(void);
uint32_t isaac_render_shell_a152a0_elem_flag_off(void);
uint32_t isaac_render_shell_a152a0_elem_value_off(void);
uint32_t isaac_render_shell_a152a0_elem_inner_begin_off(void);
uint32_t isaac_render_shell_a152a0_elem_inner_end_off(void);
uint32_t isaac_render_shell_a152a0_elem_inner_cap_off(void);
uint32_t isaac_render_shell_a152a0_elem_stride(void);
uint32_t isaac_render_shell_a152a0_stack_args(void);

/* ===========================================================================
 * FUN_00a153a0 vec18 grow IAT — ABI v47
 *
 * Body VA 0x00a153a0..0x00a15522 (ret 8 @ 0xa15522; this=ecx, 2 stack
 * args: end@[ebp+8], elem@[ebp+0xc]), plain ebp frame (no SEH/GS). The
 * a152a0 (v46) grow request target: push elem; push end; call a153a0.
 * Realloc-push for the vec18 when end == cap:
 *   count  = MAGIC signed div by 0x18 of (end - begin), derived TWICE
 *     (0xa153b3 from the ARG end, 0xa153b5..d5 from this->end — equal at
 *     entry; 0x2aaaaaab imul / sar edx,2 / shr 0x1f / add template).
 *   MAX-SIZE GUARD 0xa153d7..0xa153dc: `cmp count,0xaaaaaaa; je
 *     0xa15542` — EQUALITY; count == 0xaaaaaaa jumps to the host fatal
 *     tail (0x415bc0 + 0x40cee0 + int3).
 *   new_count = count + 1 (lea ebx,[eax+1] 0xa153e5, 32-bit wrap).
 *   cap_count = MAGIC div of (cap - begin) (0xa153e2..0xa15401).
 *   CAP GATE 0xa15403..0xa1540b: half = cap_count >> 1 (shr edx,1
 *     UNSIGNED); `cmp cap_count, 0xaaaaaaa - half; jbe 0xa15525` —
 *     UNSIGNED: cap_count <= 0xaaaaaaa - cap_count/2 keeps the 1.5x
 *     growth tail; else FALL THROUGH to CLAMP new_cap = 0xaaaaaaa
 *     (0xa15411 mov ecx,0xaaaaaaa).
 *   SHARED BYTES 0xa15416..0xa15419 (clamp fall-through OR tail jmp
 *     0xa15537): lea eax,[ecx+ecx*2]; shl eax,3 — new_bytes =
 *     new_cap*0x18 (32-bit wrap); alloc 0x40cf00 (HOST); slot =
 *     newbuf + count*0x18 (0xa15428..0xa1542e); 6-dword elem copy
 *     (same as a152a0 direct path); memmove 0x915eb0 x2 (HOST);
 *     per-old-element inner destroy 0x4149d0 (HOST); sized free
 *     0xaef15c (HOST) with the UNSIGNED free-size gate `bytes >=
 *     0x1000` (jb plain free) at 0xa154dd..0xa154e2; writeback
 *     begin/end/cap at [edi]/[edi+4]/[edi+8] with end = newbuf +
 *     new_count*0x18.
 *   GROWTH TAIL 0xa15525..0xa15537 (gate true): lea eax,[edx+ecx] =
 *     cap_count + cap_count/2 (32-bit wrap); `cmp eax,new_count;
 *     cmovae ecx,eax` — UNSIGNED max(new_count, growth); `cmp
 *     new_cap,0xaaaaaaa; ja 0xa15547` (UNSIGNED overflow -> host fatal
 *     0x40cee0 + int3; unreachable in reachable states); jmp 0xa15416.
 * Exported laws are pure scalars (no host memory read): the magic
 * vec18 count, the EQUALITY max-size guard, the new_count +1, the
 * UNSIGNED cap halving, the UNSIGNED cap gate, the 1.5x growth factor,
 * the UNSIGNED cmovae max, the overflow recheck, the composite
 * next_cap (clamp vs growth), the *0x18 byte/off laws (bytes_for_cap /
 * slot_off / writeback_end_off / free_bytes), the free-size header
 * gate, plus layout getters. Alloc/memmove/destroy/free stay host
 * (standing decision). NARROWED not removed.
 * NEXT_VA 0x00a15550 (int3 pad 0xa1554c..0xa1554f then the float
 * clamp body 0xa15550..0xa15560, maxss/minss .rdata operands).
 * PE evidence: section-notes/cpu-dump/00a153a0.txt + 00a15525.txt
 * =========================================================================== */

enum { ISAAC_RENDER_SHELL_A153A0_HOST_VA = 0x00a153a0u };
enum { ISAAC_RENDER_SHELL_A153A0_END_VA = 0x00a15522u };
enum { ISAAC_RENDER_SHELL_A153A0_NEXT_VA = 0x00a15550u };
enum { ISAAC_RENDER_SHELL_A153A0_MAX_SIZE = 0x0aaaaaaau };
enum { ISAAC_RENDER_SHELL_A153A0_VEC18_MAGIC = 0x2aaaaaabu };
enum { ISAAC_RENDER_SHELL_A153A0_ELEM_STRIDE = 0x18 };
enum { ISAAC_RENDER_SHELL_A153A0_COPIED_DWORDS = 0x06 };
enum { ISAAC_RENDER_SHELL_A153A0_STACK_ARGS = 0x02 };
enum { ISAAC_RENDER_SHELL_A153A0_FREE_HEADER_MIN = 0x1000 };
enum { ISAAC_RENDER_SHELL_A153A0_ALLOC_VA = 0x0040cf00u };
enum { ISAAC_RENDER_SHELL_A153A0_MEMMOVE_VA = 0x00915eb0u };
enum { ISAAC_RENDER_SHELL_A153A0_INNER_DESTROY_VA = 0x004149d0u };
enum { ISAAC_RENDER_SHELL_A153A0_SIZED_FREE_VA = 0x00aef15cu };
enum { ISAAC_RENDER_SHELL_A153A0_MAX_SIZE_ERR_TAIL = 0x00a15542u };
enum { ISAAC_RENDER_SHELL_A153A0_OVERFLOW_ERR_TAIL = 0x00a15547u };
enum { ISAAC_RENDER_SHELL_A153A0_FREE_EDGE_IAT_VA = 0x00b18894u };
enum { ISAAC_RENDER_SHELL_A153A0_MAX_GUARD_CALL_VA = 0x00415bc0u };
enum { ISAAC_RENDER_SHELL_A153A0_OVERFLOW_CALL_VA = 0x0040cee0u };
enum { ISAAC_RENDER_SHELL_A153A0_VEC_BEGIN_OFF = 0x00 };
enum { ISAAC_RENDER_SHELL_A153A0_VEC_END_OFF = 0x04 };
enum { ISAAC_RENDER_SHELL_A153A0_VEC_CAP_OFF = 0x08 };
enum { ISAAC_RENDER_SHELL_A153A0_ELEM_INNER_BEGIN_OFF = 0x0c };
enum { ISAAC_RENDER_SHELL_A153A0_ELEM_INNER_END_OFF = 0x10 };
enum { ISAAC_RENDER_SHELL_A153A0_ELEM_INNER_CAP_OFF = 0x14 };

int32_t isaac_render_shell_a153a0_vec18_count(uint32_t begin, uint32_t end);
int32_t isaac_render_shell_a153a0_max_size_guard(uint32_t count);
uint32_t isaac_render_shell_a153a0_new_count(uint32_t count);
uint32_t isaac_render_shell_a153a0_cap_halved(uint32_t cap_count);
int32_t isaac_render_shell_a153a0_cap_gate(uint32_t cap_count);
uint32_t isaac_render_shell_a153a0_growth_factor(uint32_t cap_count);
uint32_t isaac_render_shell_a153a0_grown_cap(uint32_t new_count,
                                             uint32_t cap_count);
int32_t isaac_render_shell_a153a0_cap_overflow(uint32_t new_cap);
uint32_t isaac_render_shell_a153a0_next_cap(uint32_t new_count,
                                            uint32_t cap_count);
uint32_t isaac_render_shell_a153a0_bytes_for_cap(uint32_t new_cap);
uint32_t isaac_render_shell_a153a0_slot_off(uint32_t count);
uint32_t isaac_render_shell_a153a0_writeback_end_off(uint32_t new_count);
int32_t isaac_render_shell_a153a0_free_size_gate(uint32_t bytes);
uint32_t isaac_render_shell_a153a0_free_bytes(uint32_t cap_count);
uint32_t isaac_render_shell_a153a0_host_va(void);
uint32_t isaac_render_shell_a153a0_end_va(void);
uint32_t isaac_render_shell_a153a0_next_va(void);
uint32_t isaac_render_shell_a153a0_max_size(void);
uint32_t isaac_render_shell_a153a0_vec18_magic(void);
uint32_t isaac_render_shell_a153a0_elem_stride(void);
uint32_t isaac_render_shell_a153a0_copied_dwords(void);
uint32_t isaac_render_shell_a153a0_stack_args(void);
uint32_t isaac_render_shell_a153a0_free_header_min(void);
uint32_t isaac_render_shell_a153a0_alloc_va(void);
uint32_t isaac_render_shell_a153a0_memmove_va(void);
uint32_t isaac_render_shell_a153a0_inner_destroy_va(void);
uint32_t isaac_render_shell_a153a0_sized_free_va(void);
uint32_t isaac_render_shell_a153a0_max_size_err_tail(void);
uint32_t isaac_render_shell_a153a0_overflow_err_tail(void);
uint32_t isaac_render_shell_a153a0_free_edge_iat_va(void);
uint32_t isaac_render_shell_a153a0_vec_begin_off(void);
uint32_t isaac_render_shell_a153a0_vec_end_off(void);
uint32_t isaac_render_shell_a153a0_vec_cap_off(void);
uint32_t isaac_render_shell_a153a0_elem_inner_begin_off(void);
uint32_t isaac_render_shell_a153a0_elem_inner_end_off(void);
uint32_t isaac_render_shell_a153a0_elem_inner_cap_off(void);

/* ===========================================================================
 * ABI v48: FUN_00a15550 float clamp01 — PURE leaf
 *
 * Body VA 0x00a15550..0x00a15560: `maxss xmm0,[0xba9fe4]` then `minss
 * xmm0,[0xbaa454]` then `ret` (xmm0 in / xmm0 out, no stores, no
 * calls). .rdata operands: lo = 0xba9fe4 = f32 +0.0 (raw 0x7a85e4
 * bytes 00000000), hi = 0xbaa454 = f32 1.0 (raw 0x7a8a54 bytes
 * 0000803f). MAXSS/MINSS return the SECOND operand when the compare
 * is unordered (NaN) or both values are zero of either sign — so
 * clamp01(x) = min(max(x,0),1) with NaN -> +0.0f and -0.0f ->
 * +0.0f (sign normalized). Single direct rel32 caller 0x007734e6
 * (divss [0xbaa8a0]=25.0f before, mulss [0xbaa904]=40.0f after).
 * PURE — every byte of the body is in-module.
 * NEXT_VA 0x00a15570 (the is-power-of-two gate 0xa15570..0xa15580, landed
 * ABI v56; the v48 record's "bare ret stub" read was a misread — the
 * bytes 85 c9 74 0a 8d 41 ff 85 c1 75 03 b0 01 c3 32 c0 c3 are a real
 * body). Then next-pow2 leaf 0xa15590..0xa155b0, 2 direct callers
 * 0x00a12d8e / 0x00a12d98.
 * PE evidence: section-notes/cpu-dump/00a15525.txt + 00a15540.txt
 * =========================================================================== */

enum { ISAAC_RENDER_SHELL_A15550_HOST_VA = 0x00a15550u };
enum { ISAAC_RENDER_SHELL_A15550_END_VA = 0x00a15560u };
enum { ISAAC_RENDER_SHELL_A15550_NEXT_VA = 0x00a15570u };
enum { ISAAC_RENDER_SHELL_A15550_LO_VA = 0x00ba9fe4u };
enum { ISAAC_RENDER_SHELL_A15550_HI_VA = 0x00baa454u };
enum { ISAAC_RENDER_SHELL_A15550_LO_BITS = 0x00000000u };
enum { ISAAC_RENDER_SHELL_A15550_HI_BITS = 0x3f800000u };
enum { ISAAC_RENDER_SHELL_A15550_CALLER_VA = 0x007734e6u };

float isaac_render_shell_a15550_clamp01(float x);
uint32_t isaac_render_shell_a15550_host_va(void);
uint32_t isaac_render_shell_a15550_end_va(void);
uint32_t isaac_render_shell_a15550_next_va(void);
uint32_t isaac_render_shell_a15550_lo_va(void);
uint32_t isaac_render_shell_a15550_hi_va(void);
uint32_t isaac_render_shell_a15550_lo_bits(void);
uint32_t isaac_render_shell_a15550_hi_bits(void);
uint32_t isaac_render_shell_a15550_caller_va(void);

/* ============================================================================
 * ABI v49: 0xa15590 next-power-of-two leaf (PURE)
 * Body VA 0x00a15590..0x00a155b0: `push esi` / `mov esi,ecx` /
 * `mov ecx,1` / `mov eax,esi` / `shr eax,1` / `lea edx,[esi-1]` /
 * `je` (taken iff n>>1 == 0, i.e. n in {0,1}: returns (n-1)+1 = n) /
 * or-loop: `or edx,eax` / `inc ecx` / `mov eax,esi` / `shr eax,cl` /
 * `test eax,eax` / `jne` / `lea eax,[edx+1]` / `pop esi` / `ret`.
 * thiscall ecx in / eax out; no stores, no calls. The or-loop ORs
 * n>>1, n>>2, ... into edx = n-1, then +1: the smallest power of two
 * >= n (0 -> 0, 1 -> 1, 2^k -> 2^k, (2^k,2^(k+1)) -> 2^(k+1),
 * 0x7fffffff -> 0x80000000). DIVERGENCE corner: `shr eax,cl` masks
 * the shift count to 5 bits, so for n >= 0x80000000 the machine loop
 * never terminates (shift-by-32 == identity; bit 31 never clears).
 * Callers 0x00a12d8e / 0x00a12d98 gate inputs unsigned against a
 * vtable-bounded size (abort path 0xa12e83), so this corner is
 * unreachable; the port completes it with the machine's own OR-
 * accumulation result: edx would accumulate OR(n>>1..n>>31, n) =
 * 0xFFFFFFFF -> +1 = 0 for every n >= 0x80000000. PURE — every byte
 * of the body is in-module.
 * NEXT_VA 0x00a155c0 (clamped-lerp helper, 56 direct callers).
 * PE evidence: section-notes/cpu-dump/00a15590.txt.
 * =========================================================================== */

enum { ISAAC_RENDER_SHELL_A15590_HOST_VA = 0x00a15590u };
enum { ISAAC_RENDER_SHELL_A15590_END_VA = 0x00a155b0u };
enum { ISAAC_RENDER_SHELL_A15590_NEXT_VA = 0x00a155c0u };
enum { ISAAC_RENDER_SHELL_A15590_CALLER_VA = 0x00a12d8eu };
enum { ISAAC_RENDER_SHELL_A15590_CALLER2_VA = 0x00a12d98u };
enum { ISAAC_RENDER_SHELL_A15590_MAX_TERMINATING = 0x7fffffffu };
enum { ISAAC_RENDER_SHELL_A15590_JE_LIMIT = 0x1u };

uint32_t isaac_render_shell_a15590_next_pow2(uint32_t n);
uint32_t isaac_render_shell_a15590_host_va(void);
uint32_t isaac_render_shell_a15590_end_va(void);
uint32_t isaac_render_shell_a15590_next_va(void);
uint32_t isaac_render_shell_a15590_caller_va(void);
uint32_t isaac_render_shell_a15590_caller2_va(void);
uint32_t isaac_render_shell_a15590_max_terminating(void);
uint32_t isaac_render_shell_a15590_je_limit(void);

/* ===========================================================================
 * ABI v50: FUN_00a155c0 clamped lerp — PURE leaf
 *
 * Body VA 0x00a155c0..0x00a155e0: `test cl,cl` (0xa155c0) / `je
 * 0xa155d4` (0xa155c2) / `maxss xmm2,[0xba9fe4]` (0xa155c4) / `minss
 * xmm2,[0xbaa454]` (0xa155cc) / `subss xmm1,xmm0` (0xa155d4) / `mulss
 * xmm1,xmm2` (0xa155d8) / `addss xmm0,xmm1` (0xa155dc) / `ret`
 * (0xa155e0). xmm0=y0, xmm1=y1, xmm2=t, cl=clamp flag (low byte);
 * xmm0 out. No E8, no stores, no indirect. Clamp gated on the LOW
 * byte of the flag (`test cl,cl`) and reuses the v48 clamp01 .rdata
 * constants (lo = 0xba9fe4 = +0.0f raw 0x7a85e4, hi = 0xbaa454 = 1.0f
 * raw 0x7a8a54; MAXSS/MINSS return the SECOND operand on unordered/
 * equal: NaN t -> +0.0f, -0.0f t -> +0.0f). Then the lerp
 * y0 + t*(y1-y0) with per-step f32 rounding (subss then mulss then
 * addss). 56 direct rel32 callers 0x005dcac5..0x007e82e7.
 * NEXT_VA 0x00a155f0 (inverse lerp (t-y0)/(y1-y0), NARROWED: 1 E8 to
 * 0xa112c0 on the ordered-equal path). PURE — every byte of the body
 * is in-module.
 * PE evidence: section-notes/cpu-dump/00a155c0.txt.
 * =========================================================================== */

enum { ISAAC_RENDER_SHELL_A155C0_HOST_VA = 0x00a155c0u };
enum { ISAAC_RENDER_SHELL_A155C0_END_VA = 0x00a155e0u };
enum { ISAAC_RENDER_SHELL_A155C0_NEXT_VA = 0x00a155f0u };
enum { ISAAC_RENDER_SHELL_A155C0_CALLER_COUNT = 56u };
enum { ISAAC_RENDER_SHELL_A155C0_CALLER_FIRST_VA = 0x005dcac5u };
enum { ISAAC_RENDER_SHELL_A155C0_CALLER_LAST_VA = 0x007e82e7u };
enum { ISAAC_RENDER_SHELL_A155C0_LO_VA = 0x00ba9fe4u }; /* +0.0f */
enum { ISAAC_RENDER_SHELL_A155C0_LO_BITS = 0x00000000u };
enum { ISAAC_RENDER_SHELL_A155C0_HI_VA = 0x00baa454u }; /* 1.0f */
enum { ISAAC_RENDER_SHELL_A155C0_HI_BITS = 0x3f800000u };
enum { ISAAC_RENDER_SHELL_A155C0_CLAMP_OFF = 0x0u }; /* je iff low byte 0 */

float isaac_render_shell_a155c0_clamped_lerp(float y0, float y1, float t,
                                             uint32_t clamp_enabled_w);
uint32_t isaac_render_shell_a155c0_host_va(void);
uint32_t isaac_render_shell_a155c0_end_va(void);
uint32_t isaac_render_shell_a155c0_next_va(void);
uint32_t isaac_render_shell_a155c0_caller_count(void);
uint32_t isaac_render_shell_a155c0_caller_first_va(void);
uint32_t isaac_render_shell_a155c0_caller_last_va(void);
uint32_t isaac_render_shell_a155c0_lo_va(void);
uint32_t isaac_render_shell_a155c0_lo_bits(void);
uint32_t isaac_render_shell_a155c0_hi_va(void);
uint32_t isaac_render_shell_a155c0_hi_bits(void);
uint32_t isaac_render_shell_a155c0_clamp_off(void);

/* ===========================================================================
 * ABI v51: FUN_00a155f0 inverse lerp (t-y0)/(y1-y0) — NARROWED
 *
 * Body VA 0x00a155f0..0x00a1563e: `ucomiss xmm0,xmm1` (0xa155f6) /
 * `movss [ebp-4],xmm2` (spill t) / `movss [ebp-8],xmm1` (spill y1) /
 * `lahf` (0xa15603) / `movss [ebp-0xc],xmm0` (spill y0) / `test
 * ah,0x44` (0xa15609) / `jp 0xa1562c` (0xa1560c) / [logger arm:
 * `push 0xb81bd8` / `push 0x10` / `call 0xa112c0` / reload spills] /
 * `subss xmm2,xmm0` (0xa1562c, num = t-y0) / `subss xmm1,xmm0`
 * (0xa15630, den = y1-y0) / `divss xmm2,xmm1` (0xa15634) / `movaps
 * xmm0,xmm2` (0xa15638) / `ret` (0xa1563e). xmm0=y0, xmm1=y1,
 * xmm2=t; xmm0 out. NO early return: both arms join at 0xa1562c, so
 * the division runs unconditionally. The ucomiss/lahf/test ah,0x44/
 * jp gate fires the logger arm iff ORDERED EQUALITY (ucomiss ZF=1 &
 * PF=0): AH&0x44 = 0x40 (odd parity -> test PF=0 -> jp NOT taken)
 * only for y0==y1 finite; NaN (0x44, even -> jp) and ordered
 * inequality (0x00, even -> jp) skip the logger. divss has no guard:
 * den==0 -> +/-inf, 0/0 -> NaN (IEEE, no trap). 2 direct rel32
 * callers 0x0066aaa6 / 0x0078a3e0 (full .text census).
 * NEXT_VA 0x00a15640 (next body: movaps xmm4,xmm1 prologue, 40
 * direct callers, 1 E8 to 0xa112c0 + 1 indirect, ret @ 0xa156c4).
 * NARROWED — residual host: 1 E8 to 0xa112c0 + 2 pushes + 3 dword
 * spills; the two pure laws are in-module.
 * PE evidence: section-notes/cpu-dump/00a155f0.txt.
 * =========================================================================== */

enum { ISAAC_RENDER_SHELL_A155F0_HOST_VA = 0x00a155f0u };
enum { ISAAC_RENDER_SHELL_A155F0_END_VA = 0x00a1563eu };
enum { ISAAC_RENDER_SHELL_A155F0_NEXT_VA = 0x00a15640u };
enum { ISAAC_RENDER_SHELL_A155F0_CALLER_COUNT = 2u };
enum { ISAAC_RENDER_SHELL_A155F0_CALLER_FIRST_VA = 0x0066aaa6u };
enum { ISAAC_RENDER_SHELL_A155F0_CALLER_LAST_VA = 0x0078a3e0u };
enum { ISAAC_RENDER_SHELL_A155F0_LOGGER_VA = 0x00a112c0u };
enum { ISAAC_RENDER_SHELL_A155F0_LOG_MSG_VA = 0x00b81bd8u };
enum { ISAAC_RENDER_SHELL_A155F0_LOG_MSG_LEN = 0x10u };
enum { ISAAC_RENDER_SHELL_A155F0_SPILL_COUNT = 3u };

uint32_t isaac_render_shell_a155f0_ordered_equal_gate(float y0, float y1);
float isaac_render_shell_a155f0_inverse_lerp(float y0, float y1, float t);
uint32_t isaac_render_shell_a155f0_host_va(void);
uint32_t isaac_render_shell_a155f0_end_va(void);
uint32_t isaac_render_shell_a155f0_next_va(void);
uint32_t isaac_render_shell_a155f0_caller_count(void);
uint32_t isaac_render_shell_a155f0_caller_first_va(void);
uint32_t isaac_render_shell_a155f0_caller_last_va(void);
uint32_t isaac_render_shell_a155f0_logger_va(void);
uint32_t isaac_render_shell_a155f0_log_msg_va(void);
uint32_t isaac_render_shell_a155f0_log_msg_len(void);
uint32_t isaac_render_shell_a155f0_spill_count(void);

/* ===========================================================================
 * ABI v52: FUN_00a15640 nested lerp (fraction + clamp01 + apply) — NARROWED
 *
 * Body VA 0x00a15640..0x00a156c4: `movaps xmm4,xmm1` (0xa15646) /
 * `movss [ebp-0xc],xmm3` (spill base) / `ucomiss xmm4,xmm2` (0xa1564e,
 * compares xmm1=y1 vs xmm2=y0) / `mov bl,cl` (0xa15652) / spills y0/xmm4/y1/
 * t / `lahf` (0xa15661) / `test ah,0x44` (0xa15667) / `jp 0xa1568f`
 * (0xa1566a) / [logger arm: `push 0xb81bd8` / `push 0x10` / `call 0xa112c0` /
 * reload spills] / `subss xmm1,xmm4` (0xa1568f, p1 = t-y1) / `subss
 * xmm2,xmm4` (0xa15693, p2 = y0-y1) / `divss xmm1,xmm2` (0xa15697,
 * f = p1/p2, no guard) / `test bl,bl` (0xa1569b) / `je 0xa156af` (0xa1569d,
 * clamp iff LOW byte nonzero) / `maxss xmm1,[0xba9fe4]` (0xa1569f, +0.0f) /
 * `minss xmm1,[0xbaa454]` (0xa156a7, 1.0f) / `movss xmm0,[ebp+8]` (0xa156af,
 * target, first stack arg) / `subss xmm0,xmm3` (0xa156b4, d = target-base) /
 * `mulss xmm0,xmm1` (0xa156b9, m = d*f) / `addss xmm0,xmm3` (0xa156bd,
 * r = base+m) / `ret` (0xa156c4). xmm0=t (progress), xmm1=y1, xmm2=y0,
 * xmm3=base, cl=clamp flag, [ebp+8]=target; xmm0 out. NO early return:
 * both arms join at 0xa1568f — the division runs unconditionally. The
 * ucomiss/lahf/test ah,0x44/jp gate fires the logger arm iff ORDERED
 * EQUALITY of y1 against y0 (identical machine pattern + logger msg
 * 0xb81bd8 len 0x10 as FUN_00a155f0): AH&0x44 = 0x40 (odd parity -> test
 * PF=0 -> jp NOT taken) only for y1==y0 finite; NaN (0x44) and ordered
 * inequality (0x00) skip. divss has no guard: p2==0 -> +/-inf, 0/0 -> NaN.
 * Clamp reuses the v48 clamp01 .rdata constants (lo 0xba9fe4 = +0.0f /
 * hi 0xbaa454 = 1.0f; maxss/minss return the SECOND operand on
 * unordered/equal: NaN -> +0.0f, -0.0f -> +0.0f). Final apply is the lerp
 * base + (target-base)*f with per-step f32 rounding. 40 direct rel32
 * callers 0x005b962f..0x007c87a6 (full .text census).
 * NEXT_VA 0x00a156d0 (int3 pad 0xa156c5..0xa156cf; next body = 7-byte
 * import thunk push ecx / call [0xb18274] / ret @ 0xa156d7 — HOST — then
 * real body 0xa156e0..0xa1572d, ret @ 0xa1572d, 2 E8 to 0xaef15c).
 * NARROWED — residual host: 1 E8 to 0xa112c0 + 2 pushes + 4 dword
 * spills; the three pure laws are in-module.
 * PE evidence: section-notes/cpu-dump/00a15640.txt.
 * =========================================================================== */

enum { ISAAC_RENDER_SHELL_A15640_HOST_VA = 0x00a15640u };
enum { ISAAC_RENDER_SHELL_A15640_END_VA = 0x00a156c4u };
enum { ISAAC_RENDER_SHELL_A15640_NEXT_VA = 0x00a156d0u };
enum { ISAAC_RENDER_SHELL_A15640_CALLER_COUNT = 40u };
enum { ISAAC_RENDER_SHELL_A15640_CALLER_FIRST_VA = 0x005b962fu };
enum { ISAAC_RENDER_SHELL_A15640_CALLER_LAST_VA = 0x007c87a6u };
enum { ISAAC_RENDER_SHELL_A15640_LOGGER_VA = 0x00a112c0u };
enum { ISAAC_RENDER_SHELL_A15640_LOG_MSG_VA = 0x00b81bd8u };
enum { ISAAC_RENDER_SHELL_A15640_LOG_MSG_LEN = 0x10u };
enum { ISAAC_RENDER_SHELL_A15640_SPILL_COUNT = 4u };
enum { ISAAC_RENDER_SHELL_A15640_LO_VA = 0x00ba9fe4u }; /* +0.0f */
enum { ISAAC_RENDER_SHELL_A15640_LO_BITS = 0x00000000u };
enum { ISAAC_RENDER_SHELL_A15640_HI_VA = 0x00baa454u }; /* 1.0f */
enum { ISAAC_RENDER_SHELL_A15640_HI_BITS = 0x3f800000u };
enum { ISAAC_RENDER_SHELL_A15640_CLAMP_OFF = 0x0u }; /* je iff low byte 0 */

uint32_t isaac_render_shell_a15640_ordered_equal_gate(float y1, float y0);
float isaac_render_shell_a15640_fraction(float t, float y1, float y0,
                                         uint32_t clamp_w);
float isaac_render_shell_a15640_apply_lerp(float base, float target, float f);
uint32_t isaac_render_shell_a15640_host_va(void);
uint32_t isaac_render_shell_a15640_end_va(void);
uint32_t isaac_render_shell_a15640_next_va(void);
uint32_t isaac_render_shell_a15640_caller_count(void);
uint32_t isaac_render_shell_a15640_caller_first_va(void);
uint32_t isaac_render_shell_a15640_caller_last_va(void);
uint32_t isaac_render_shell_a15640_logger_va(void);
uint32_t isaac_render_shell_a15640_log_msg_va(void);
uint32_t isaac_render_shell_a15640_log_msg_len(void);
uint32_t isaac_render_shell_a15640_spill_count(void);
uint32_t isaac_render_shell_a15640_lo_va(void);
uint32_t isaac_render_shell_a15640_lo_bits(void);
uint32_t isaac_render_shell_a15640_hi_va(void);
uint32_t isaac_render_shell_a15640_hi_bits(void);
uint32_t isaac_render_shell_a15640_clamp_off(void);

/* ===========================================================================
 * ABI v53: FUN_00a156e0 CS-owning scalar deleting dtor (2 sized frees)
 * — NARROWED
 *
 * Body VA 0x00a156e0..0x00a1572d: `mov esi,ecx` (0xa156e4, this) /
 * `mov edi,[esi+8]` (0xa156e7, cs_ptr = this->field8) / `mov [esi],
 * 0xb81c0c` (0xa156ea, store 1: vftable = 0xb81c0c) / `test edi,edi`
 * (0xa156f0) / `je 0xa1570d` (0xa156f2, FULL-dword gate) / [`push edi` /
 * `call [0xb18274]` (0xa156f5 = KERNEL32 DeleteCriticalSection, HOST) /
 * `push 0x1c` / `push edi` / `call 0xaef15c` (0xa156fe = sized free
 * cs_ptr,0x1c, HOST allocator primitive) / `add esp,8` / `mov [esi+8],0`
 * (0xa15706, store 2: field8 = 0)] / `and byte [esi+4],0xfe` (0xa1570d,
 * flags LOW-BYTE clear bit 0) / `test byte [ebp+8],1` (0xa15711) /
 * `mov [esi],0xba04b4` (0xa15715, store 3: vftable = 0xba04b4) /
 * `je 0xa15728` (0xa1571b, low-byte gate) / [`push 0xc` / `push esi` /
 * `call 0xaef15c` (0xa15720 = sized free this,0xc, HOST)] / `mov eax,esi`
 * (0xa15729, return this) / `ret 4` (0xa1572d, thiscall + 1 stack arg
 * flag at [ebp+8]). The vftable 0xb81c0c's slot 0 IS 0xa156e0 (address-
 * taken census: exactly 1 hit, raw 0x78020c = VA 0xb81c0c; direct rel32
 * caller census 0) — this body is reached ONLY through virtual dispatch.
 * 0xba04b4 (raw 0x79eab4, first dword 0x00a68440) is the second vftable
 * written before the self-free gate. NEXT_VA 0x00a15730 (sibling dtor:
 * push esi / mov esi,ecx / push edi / mov edi,[esi+8] / mov [esi],
 * 0xb81c0c; vftable 0xb81c0c remaining slots 0xa15770/0xa157c0/0xa157f0/
 * 0xa159a0).
 * NARROWED — residual host: DeleteCriticalSection [0xb18274] + 2 sized
 * frees 0xaef15c (cs_ptr,0x1c / this,0xc); the three pure laws + the
 * store-order plan are in-module.
 * PE evidence: section-notes/cpu-dump/00a156e0.txt.
 * =========================================================================== */

enum { ISAAC_RENDER_SHELL_A156E0_HOST_VA = 0x00a156e0u };
enum { ISAAC_RENDER_SHELL_A156E0_END_VA = 0x00a1572du };
enum { ISAAC_RENDER_SHELL_A156E0_NEXT_VA = 0x00a15730u };
enum { ISAAC_RENDER_SHELL_A156E0_VTABLE_VA = 0x00b81c0cu };
enum { ISAAC_RENDER_SHELL_A156E0_VTABLE_FINAL_VA = 0x00ba04b4u };
enum { ISAAC_RENDER_SHELL_A156E0_VTABLE_SLOT = 0u };
enum { ISAAC_RENDER_SHELL_A156E0_CS_OFF = 0x08u };
enum { ISAAC_RENDER_SHELL_A156E0_FLAGS_OFF = 0x04u };
enum { ISAAC_RENDER_SHELL_A156E0_CS_FREE_SIZE = 0x1cu };
enum { ISAAC_RENDER_SHELL_A156E0_SELF_FREE_SIZE = 0x0cu };
enum { ISAAC_RENDER_SHELL_A156E0_CS_DELETE_IMPORT_VA = 0x00b18274u };
enum { ISAAC_RENDER_SHELL_A156E0_FREE_VA = 0x00aef15cu };
enum { ISAAC_RENDER_SHELL_A156E0_STACK_ARGS = 1u };
enum { ISAAC_RENDER_SHELL_A156E0_ADDR_TAKEN_COUNT = 1u };

uint32_t isaac_render_shell_a156e0_cs_free_gate(uint32_t cs_ptr);
uint32_t isaac_render_shell_a156e0_self_free_gate(uint32_t flag);
uint32_t isaac_render_shell_a156e0_flags_clear(uint32_t flags);
uint32_t isaac_render_shell_a156e0_host_va(void);
uint32_t isaac_render_shell_a156e0_end_va(void);
uint32_t isaac_render_shell_a156e0_next_va(void);
uint32_t isaac_render_shell_a156e0_vtable_va(void);
uint32_t isaac_render_shell_a156e0_vtable_final_va(void);
uint32_t isaac_render_shell_a156e0_vtable_slot(void);
uint32_t isaac_render_shell_a156e0_cs_off(void);
uint32_t isaac_render_shell_a156e0_flags_off(void);
uint32_t isaac_render_shell_a156e0_cs_free_size(void);
uint32_t isaac_render_shell_a156e0_self_free_size(void);
uint32_t isaac_render_shell_a156e0_cs_delete_import_va(void);
uint32_t isaac_render_shell_a156e0_free_va(void);
uint32_t isaac_render_shell_a156e0_stack_args(void);
uint32_t isaac_render_shell_a156e0_addr_taken_count(void);

/* ===========================================================================
 * ABI v54: FUN_00a15770 vftable-slot-1 lazy CS-init getter (alloc arm)
 * — NARROWED
 *
 * Body VA 0x00a15770..0x00a157b7: `push ebp / mov ebp,esp / sub esp,8`
 * (true prologue with one 8-byte local) / `mov edi,ecx` (0xa15778,
 * this) / `test byte [edi+4],1` (0xa1577a) / `jne 0xa157b0` (0xa1577e,
 * LOW-byte bit-0 gate: iff (flags & 1) != 0 -> already-initialized,
 * jump to done, return 1) / [`push 0x1c` / `call 0xa0f4c0` (0xa15782 =
 * sized new 0x1c, HOST allocator primitive) / `mov esi,eax` /
 * `mov [ebp-4],esi` (0xa1578c, local spill, dead after) /
 * `test esi,esi` / `je 0xa157a0` (0xa15791, FULL-dword test) /
 * [`push esi` / `mov byte [esi+0x18],0` (0xa15794, host CS object
 * pre-zero: DebugInfo dword low byte) / `call [0xb18278]` (0xa15798 =
 * KERNEL32 InitializeCriticalSection, HOST)] / `xor esi,esi`
 * (0xa157a0, alloc-fail path: ptr = 0; the flag STILL gets set)] /
 * `movzx eax, byte [edi+4]` (0xa157a2, LOW-BYTE re-read) /
 * `bts eax,0` (0xa157a6) / `mov [edi+8],esi` (0xa157aa, store:
 * this->field8 = ptr) / `mov byte [edi+4],al` (0xa157ad, store: flags
 * low byte |= 1, bits 8..31 preserved) / `mov al,1` (0xa157b1, BOTH
 * paths return 1) / `ret` (0xa157b7, plain thiscall, 0 stack args).
 * DELTAS vs v53 0xa156e0 (never homogenised): vftable variant = slot 1
 * (0xb81c0c), NO vftable store in-body (this is a getter, not a dtor);
 * stores = local spill + host CS pre-zero + field8=ptr + flags low
 * byte |= 1 (v53: vftable / field8=0 / vftable); alloc 0x1c via
 * 0xa0f4c0 (v53: TWO sized frees 0x1c/0xc via 0xaef15c); CS handling =
 * InitializeCriticalSection [0xb18278] (v53: DeleteCriticalSection
 * [0xb18274]); stack args 0 / ret (v53: 1 / ret 4 — v53's flag gate
 * reads the stack arg [ebp+8], v54's reads the member byte [edi+4]).
 * Census (verified this unit): 0xb81c0c slot 1 IS 0xa15770 — 9 direct
 * E8 callers + 9 address-taken hits (vtable slot 0xb81c10 + 8 .text
 * imm32 consts); every caller uses the devirtualize idiom `mov eax,
 * [0xb81c10] / cmp eax,0xa15770 / jne L / call 0xa15770 / L: call eax`.
 * 0xa15730 (v53's recorded NEXT_VA) is the ZERO-edge non-deleting dtor
 * (0 pointer hits, 0 callers) — NOT a vftable slot, DEAD, skipped.
 * NEXT_VA 0x00a157c0 (slot 2; remaining slots 0xa157f0 / 0xa159a0).
 * NARROWED — residual host: sized new 0xa0f4c0 (0x1c) +
 * InitializeCriticalSection [0xb18278]; the two pure laws + the
 * store/return plan are in-module.
 * PE evidence: section-notes/cpu-dump/00a15770.txt.
 * =========================================================================== */

enum { ISAAC_RENDER_SHELL_A15770_HOST_VA = 0x00a15770u };
enum { ISAAC_RENDER_SHELL_A15770_END_VA = 0x00a157b7u };
enum { ISAAC_RENDER_SHELL_A15770_NEXT_VA = 0x00a157c0u };
enum { ISAAC_RENDER_SHELL_A15770_VTABLE_VA = 0x00b81c0cu };
enum { ISAAC_RENDER_SHELL_A15770_VTABLE_SLOT = 1u };
enum { ISAAC_RENDER_SHELL_A15770_FLAGS_OFF = 0x04u };
enum { ISAAC_RENDER_SHELL_A15770_CS_PTR_OFF = 0x08u };
enum { ISAAC_RENDER_SHELL_A15770_ALLOC_SIZE = 0x1cu };
enum { ISAAC_RENDER_SHELL_A15770_ALLOC_VA = 0x00a0f4c0u };
enum { ISAAC_RENDER_SHELL_A15770_CS_INIT_IMPORT_VA = 0x00b18278u };
enum { ISAAC_RENDER_SHELL_A15770_STACK_ARGS = 0u };
enum { ISAAC_RENDER_SHELL_A15770_RET_CONST = 1u };
enum { ISAAC_RENDER_SHELL_A15770_ADDR_TAKEN_COUNT = 9u };
enum { ISAAC_RENDER_SHELL_A15770_DIRECT_CALLER_COUNT = 9u };

uint32_t isaac_render_shell_a15770_init_gate(uint32_t flags);
uint32_t isaac_render_shell_a15770_flags_set_bit0(uint32_t flags);
uint32_t isaac_render_shell_a15770_host_va(void);
uint32_t isaac_render_shell_a15770_end_va(void);
uint32_t isaac_render_shell_a15770_next_va(void);
uint32_t isaac_render_shell_a15770_vtable_va(void);
uint32_t isaac_render_shell_a15770_vtable_slot(void);
uint32_t isaac_render_shell_a15770_flags_off(void);
uint32_t isaac_render_shell_a15770_cs_ptr_off(void);
uint32_t isaac_render_shell_a15770_alloc_size(void);
uint32_t isaac_render_shell_a15770_alloc_va(void);
uint32_t isaac_render_shell_a15770_cs_init_import_va(void);
uint32_t isaac_render_shell_a15770_stack_args(void);
uint32_t isaac_render_shell_a15770_ret_const(void);
uint32_t isaac_render_shell_a15770_addr_taken_count(void);
uint32_t isaac_render_shell_a15770_direct_caller_count(void);

/* ============================================================================
 * v25j (wave-16, ABI stays 54): 0xa157c0 — 0xb81c0c vftable SLOT 2,
 * destroy/cleanup arm (mirror of slot 1's lazy-CS-init getter). THIS IS THE
 * INVERSE BODY: slot 1 builds the CS (new+init+set), slot 2 tears it down
 * (delete+free+clear). Deltas pinned, NEVER homogenised (vs v54 0xa15770):
 *   - vftable slot 2 (not 1).
 *   - gate = FULL-DWORD `test edi,edi; je` on this->field8 [+0x08]
 *     (slot 1: LOW-byte bit-0 test on flags [+0x04], jne). 0x100 -> 1 here
 *     (slot 1: 0x100 -> 0).
 *   - CS op = DeleteCriticalSection [0xb18274] (slot 1: Initialize
 *     [0xb18278]).
 *   - mem op = sized delete 0xaef15c, size 0x1c (slot 1: sized new 0xa0f4c0,
 *     0x1c).
 *   - stores: [esi+8] = 0 on the DELETE (gate-set) path ONLY; the flag byte
 *     AND 0xfe runs on BOTH paths (slot 1: field8 store + flag-set byte both
 *     fall-through ONLY). Conditionality inverted on purpose.
 *   - return: the body NEVER writes EAX (EAX_WRITES = 0) — NO ret const
 *     (slot 1: mov al,1 -> RET_CONST 1). Callsites must not consume EAX.
 *   - reachability: 1 addr-taken (.rdata 0xb81c14 = the vtable slot itself),
 *     0 direct E8 callers -> reached purely via virtual dispatch through
 *     vftable 0xb81c0c slot 2.
 * Body VA 0x00a157c0..0x00a157ea, plain thiscall ret, 0 stack args.
 * PE evidence: section-notes/cpu-dump/00a157c0.txt;
 * section-notes/render-shell-wave16j-a157c0/ (NOTES.md + census.py).
 * NEXT_VA 0x00a157f0 (slot 3; remaining slot 0xa159a0 — sibling agents).
 * NARROWED — residual host: DeleteCriticalSection [0xb18274] + sized delete
 * 0xaef15c (0x1c); the two pure laws + the store/return plan are in-module.
 * =========================================================================== */

enum { ISAAC_RENDER_SHELL_A157C0_HOST_VA = 0x00a157c0u };
enum { ISAAC_RENDER_SHELL_A157C0_END_VA = 0x00a157eau };
enum { ISAAC_RENDER_SHELL_A157C0_NEXT_VA = 0x00a157f0u };
enum { ISAAC_RENDER_SHELL_A157C0_VTABLE_VA = 0x00b81c0cu };
enum { ISAAC_RENDER_SHELL_A157C0_VTABLE_SLOT = 2u };
enum { ISAAC_RENDER_SHELL_A157C0_FLAGS_OFF = 0x04u };
enum { ISAAC_RENDER_SHELL_A157C0_CS_PTR_OFF = 0x08u };
enum { ISAAC_RENDER_SHELL_A157C0_FREE_SIZE = 0x1cu };
enum { ISAAC_RENDER_SHELL_A157C0_FREE_VA = 0x00aef15cu };
enum { ISAAC_RENDER_SHELL_A157C0_CS_DELETE_IMPORT_VA = 0x00b18274u };
enum { ISAAC_RENDER_SHELL_A157C0_STACK_ARGS = 0u };
enum { ISAAC_RENDER_SHELL_A157C0_EAX_WRITES = 0u };
enum { ISAAC_RENDER_SHELL_A157C0_ADDR_TAKEN_COUNT = 1u };
enum { ISAAC_RENDER_SHELL_A157C0_DIRECT_CALLER_COUNT = 0u };

uint32_t isaac_render_shell_a157c0_destroy_gate(uint32_t cs);
uint32_t isaac_render_shell_a157c0_flags_clear_bit0(uint32_t fl);
uint32_t isaac_render_shell_a157c0_host_va(void);
uint32_t isaac_render_shell_a157c0_end_va(void);
uint32_t isaac_render_shell_a157c0_next_va(void);
uint32_t isaac_render_shell_a157c0_vtable_va(void);
uint32_t isaac_render_shell_a157c0_vtable_slot(void);
uint32_t isaac_render_shell_a157c0_flags_off(void);
uint32_t isaac_render_shell_a157c0_cs_ptr_off(void);
uint32_t isaac_render_shell_a157c0_free_size(void);
uint32_t isaac_render_shell_a157c0_free_va(void);
uint32_t isaac_render_shell_a157c0_cs_delete_import_va(void);
uint32_t isaac_render_shell_a157c0_stack_args(void);
uint32_t isaac_render_shell_a157c0_eax_writes(void);
uint32_t isaac_render_shell_a157c0_addr_taken_count(void);
uint32_t isaac_render_shell_a157c0_direct_caller_count(void);

/* ===========================================================================
 * v25l (wave-16, ABI stays 54): 0xa159a0 — 0xb81c0c vftable SLOT 4 (LAST),
 * lazy-leave / CS teardown arm — NARROWED
 *
 * Body VA 0x00a159a0..0x00a159c7: `push esi` / `mov esi,ecx` (0xa159a1,
 * this) / `test byte [esi+4],1` (0xa159a3) / `jne 0xa159b8` (0xa159a7,
 * LOW-byte bit-0 gate: iff (flags & 1) != 0 the report arm is SKIPPED) /
 * [`push 0xb81c20` / `push 0x10` / `call 0xa112c0` (0xa159b0, freestanding
 * module-state report wrapper, HOST; cdecl 2 args: arg0 = 0x10 category,
 * arg1 = 0xb81c20 = .rdata string "Trying to unlock mutex that has not
 * been initial…" immediately AFTER the vftable end; the call result is
 * UNUSED — eax is overwritten by the next load) / `add esp,8`] /
 * `mov eax,dword ptr [esi+8]` (0xa159b8, POST-CALL re-read of cs_ptr —
 * defect-class-1: the leave arg is NOT the report call's return value) /
 * `push eax` / `mov byte ptr [eax+0x18],0` (0xa159bc, host CS object
 * pre-zero byte at DebugInfo offset 0x18, BOTH paths) / `call [0xb18268]`
 * (0xa159c0 = KERNEL32 LeaveCriticalSection, HOST) / `pop esi` / `ret`
 * (0xa159c7, plain thiscall, 0 stack args).
 * DELTAS vs v54 0xa15770 (slot 1, init arm): no alloc, no flags store, no
 * return value; the wrapped call carries (0x10, string const) instead of
 * sized-new 0x1c; the CS action is LeaveCriticalSection [0xb18268] on the
 * POST-CALL field8 (slot 1: InitializeCriticalSection [0xb18278] on the
 * alloc result); result discarded (slot 1 stored its alloc result into
 * field8).
 * Census (verified this unit, section-notes/render-shell-wave16a-a159a0/
 * census.py): 0xb81c0c slot 4 IS 0xa159a0 (dword at raw 0x78021c);
 * address-taken 1 (vtable slot 0xb81c1c ONLY — no .text imm32 consts),
 * direct E8 callers 0 — reached purely through virtual dispatch
 * (call [obj+0x10]). Slot 5 (0xb81c20) is NOT a body: it is the ASCII
 * string "Trying to unlock mutex…" — the vftable ENDS at slot 4.
 * NEXT_VA 0x00a159d0 is the ALREADY-LANDED v7 opaque_call_00a159d0
 * string-hash body (va 0xa159d0..0xa15a28) — the 0xb81c0c vftable is now
 * fully decoded (slots 0..4: a156e0 v53 / a15770 v54 / a157c0 v25j /
 * a157f0 / a159a0 v25l).
 * NARROWED — residual host: 0xa112c0 report wrapper (module-state
 * machine, internally calls slot-1 0xa15770 for the global CS at
 * 0xc37958) + pre-zero byte + LeaveCriticalSection [0xb18268].
 * PE evidence: section-notes/cpu-dump/00a159a0.txt + NOTES.md in
 * section-notes/render-shell-wave16a-a159a0/.
 * =========================================================================== */

enum { ISAAC_RENDER_SHELL_A159A0_HOST_VA = 0x00a159a0u };
enum { ISAAC_RENDER_SHELL_A159A0_END_VA = 0x00a159c7u };
enum { ISAAC_RENDER_SHELL_A159A0_NEXT_VA = 0x00a159d0u };
enum { ISAAC_RENDER_SHELL_A159A0_VTABLE_VA = 0x00b81c0cu };
enum { ISAAC_RENDER_SHELL_A159A0_VTABLE_SLOT = 4u };
enum { ISAAC_RENDER_SHELL_A159A0_FLAGS_OFF = 0x04u };
enum { ISAAC_RENDER_SHELL_A159A0_CS_PTR_OFF = 0x08u };
enum { ISAAC_RENDER_SHELL_A159A0_PREZERO_OFF = 0x18u };
enum { ISAAC_RENDER_SHELL_A159A0_REPORT_VA = 0x00a112c0u };
enum { ISAAC_RENDER_SHELL_A159A0_REPORT_ARG0 = 0x10u };
enum { ISAAC_RENDER_SHELL_A159A0_REPORT_ARG1 = 0x00b81c20u };
enum { ISAAC_RENDER_SHELL_A159A0_REPORT_RESULT_USED = 0u };
enum { ISAAC_RENDER_SHELL_A159A0_LEAVE_IMPORT_VA = 0x00b18268u };
enum { ISAAC_RENDER_SHELL_A159A0_STACK_ARGS = 0u };
enum { ISAAC_RENDER_SHELL_A159A0_ADDR_TAKEN_COUNT = 1u };
enum { ISAAC_RENDER_SHELL_A159A0_DIRECT_CALLER_COUNT = 0u };

uint32_t isaac_render_shell_a159a0_gate(uint32_t flags);
uint32_t isaac_render_shell_a159a0_report_arg(uint32_t index);
uint32_t isaac_render_shell_a159a0_host_va(void);
uint32_t isaac_render_shell_a159a0_end_va(void);
uint32_t isaac_render_shell_a159a0_next_va(void);
uint32_t isaac_render_shell_a159a0_vtable_va(void);
uint32_t isaac_render_shell_a159a0_vtable_slot(void);
uint32_t isaac_render_shell_a159a0_flags_off(void);
uint32_t isaac_render_shell_a159a0_cs_ptr_off(void);
uint32_t isaac_render_shell_a159a0_prezero_off(void);
uint32_t isaac_render_shell_a159a0_report_va(void);
uint32_t isaac_render_shell_a159a0_report_result_used(void);
uint32_t isaac_render_shell_a159a0_leave_import_va(void);
uint32_t isaac_render_shell_a159a0_stack_args(void);
uint32_t isaac_render_shell_a159a0_addr_taken_count(void);
uint32_t isaac_render_shell_a159a0_direct_caller_count(void);

/* ===========================================================================
 * v25k (wave-16, ABI stays 54): 0xa157f0 — 0xb81c0c vftable SLOT 3, CS
 * acquire (forever arm + timed arm) — NARROWED
 *
 * Body VA 0x00a157f0..0x00a15996 (ONE function; ret 4 at 0xa15850 = forever
 * epilogue, ret 4 at 0xa15996 = timed epilogue; the cold tail 0xa15853..
 * 0xa15996 is the jne target and shares the prologue's stack frame):
 * `push ebp` / `mov ebp,esp` / `and esp,0xfffffff8` / `sub esp,0x24`
 * (0xa157f3..f6, ALIGNED frame) / `mov eax,ecx` (0xa157f9, this) /
 * push ebx,esi,edi / `test byte [eax+4],1` (0xa157fe, GATE A LOW-byte
 * bit-0 init gate) / `mov [esp+0x10],eax` (0xa15802, this spill —
 * re-read at 0xa15814 AND 0xa158d1) / `jne 0xa1581b` (0xa15806) /
 * [`push 0xb81c58` / `push 0x10` / `call 0xa112c0` (0xa1580f, cdecl:
 * LAST push = arg0 = 0x10 factory category; arg1 = 0xb81c58 = .rdata
 * const; HOST, same dispatcher as slot 1/4) / `mov eax,[esp+0x18]`
 * (0xa15814, POST-CALL reload of this — the factory result is
 * DISCARDED, defect-class-1: never pre-call snapshot) / `add esp,8`] /
 * `cmp dword [ebp+8],-1` (0xa1581b, GATE B FULL-dword arg == -1) /
 * `jne 0xa15853` (0xa1581f -> cold timed tail) — FOREVER arm:
 * `mov esi,[eax+8]` (0xa15821, cs = this->field8) / `push esi` /
 * `call [0xb18270]` (0xa15825 = KERNEL32 EnterCriticalSection, HOST) /
 * spin: `cmp byte [esi+0x18],0` (0xa1582b, GATE C LOW-byte free) /
 * `je 0xa15844` / `mov edi,[0xb182d8]` / `push 0x3e8` / `call edi`
 * (0xa1583c = Sleep(1000), HOST) / `cmp byte [esi+0x18],0` /
 * `jne 0xa15837` (spin loop while byte18 != 0) / `mov byte [esi+0x18],1`
 * (0xa15844, host-object marker; ALWAYS on the forever arm, both spin
 * paths) / `mov al,1` (0xa15848, both forever paths return 1) / ret 4.
 * — TIMED arm (0xa15853): `call 0xa68490` (time helper: QPC/QPF + double
 * math, HOST, returns 64-bit edx:eax) then 64x64->128 lane multiply by
 * M = 0x431bde82d7b634db, high half >> 0x12 (0xa1585c..0xa158bc: scaled =
 * (t*M)>>82) — spills scaled1 at [esp+0xc]/[esp+0x20]; `cmp dword
 * [ebp+8],0` (0xa158bf, GATE D UNSIGNED arg == 0) / `jbe 0xa1598e`
 * (0xa158cb: arg==0 -> immediate timeout) — poll loop 0xa158d1:
 * `mov eax,[esp+0x10]` (this) / `mov esi,[eax+8]` (cs) / `push esi` /
 * `call [0xb1826c]` (0xa158d9 = KERNEL32 TryEnterCriticalSection, HOST)
 * / `test eax,eax` / `setne cl` (0xa158e1, GATE E FULL-dword tryret
 * != 0) / `test eax,eax` / `je 0xa158f7` / `cmp byte [esi+0x18],0`
 * (0xa158e8, GATE C RE-READ post-call — recapture trap: the byte18
 * tested here is the POST-TryEnter field) / `je 0xa158f7` / `push esi` /
 * `call [0xb18268]` (0xa158ef = LeaveCriticalSection — undo a
 * try-acquire while byte18 busy) / `jmp 0xa158ff` / `test cl,cl` /
 * `jne 0xa15848` (0xa158f9: tryret != 0 && byte18 == 0 -> success
 * return 1) / `push 0xa` / `call [0xb182d8]` (0xa15901 = Sleep(10),
 * HOST) / `call 0xa68490` (0xa15907, re-time, same scale) /
 * `sub ecx,[esp+0xc]` / `sbb edx,[esp+0x20]` (0xa15973..77: elapsed =
 * now - base, 64-bit) / `test edx,edx` / `jb 0xa158d1` (0xa1597d DEAD:
 * CF=0 after test — compiler artifact, loop NOT taken here) /
 * `ja 0xa1598e` (0xa15983: delta_hi != 0 -> timeout return 0) /
 * `cmp ecx,[ebp+8]` / `jb 0xa158d1` (0xa15988: delta_lo < arg (UNSIGNED)
 * -> loop again) / `xor al,al` / ret 4 (0xa1598e..96, timeout return 0).
 * int3 pad 0xa15999..9f; 0xa159a0 = next slot-4 body (v25l landed).
 * DELTAS vs v54 0xa15770 (slot 1, init arm): slot 3 has a STACK ARG
 * (ret 4 vs plain ret) whose value selects forever vs timed arms; the
 * gate-clear arm calls the SAME factory 0xa112c0 with arg1 = 0xb81c58
 * (slot 1: sized-new 0x1c; slot 4: arg1 = 0xb81c20) and the result is
 * discarded (slot 1 stored it into field8); byte18 is SET to 1 here on
 * acquisition (slot 1 pre-zeroes it before InitCS, slot 4 re-zeroes it
 * before Leave); the timed arm scales timestamps by (t * M)>>82 with
 * M = 0x431bde82d7b634db (unit ~ms from the QPC/QPF*1e9 helper) and
 * polls TryEnter + Sleep(10) until elapsed >= arg.
 * Census (verified this unit, section-notes/render-shell-wave16k-a157f0/
 * NOTES.md): 0xb81c0c slot 3 IS 0xa157f0 (dword at raw 0x780218 = VA
 * 0xb81c18); address-taken 1 (the vtable slot itself), direct E8
 * callers 0 — reached purely through virtual dispatch (call [obj+0xc]).
 * NARROWED — residual host: 0xa112c0 factory dispatcher (module-state
 * machine), 0xa68490 time helper (QPC/QPF), Enter/TryEnter/LeaveCS
 * [0xb18270/6c/68], Sleep [0xb182d8], host byte18 = 1 store.
 * PE evidence: section-notes/cpu-dump/00a157f0.txt + 00a15853.txt +
 * NOTES.md in section-notes/render-shell-wave16k-a157f0/.
 * =========================================================================== */

enum { ISAAC_RENDER_SHELL_A157F0_HOST_VA = 0x00a157f0u };
enum { ISAAC_RENDER_SHELL_A157F0_END_VA = 0x00a15996u };
enum { ISAAC_RENDER_SHELL_A157F0_NEXT_VA = 0x00a159a0u };
enum { ISAAC_RENDER_SHELL_A157F0_VTABLE_VA = 0x00b81c0cu };
enum { ISAAC_RENDER_SHELL_A157F0_VTABLE_SLOT = 3u };
enum { ISAAC_RENDER_SHELL_A157F0_FLAGS_OFF = 0x04u };
enum { ISAAC_RENDER_SHELL_A157F0_CS_PTR_OFF = 0x08u };
enum { ISAAC_RENDER_SHELL_A157F0_BYTE18_OFF = 0x18u };
enum { ISAAC_RENDER_SHELL_A157F0_FACTORY_VA = 0x00a112c0u };
enum { ISAAC_RENDER_SHELL_A157F0_FACTORY_ARG0 = 0x10u };
enum { ISAAC_RENDER_SHELL_A157F0_FACTORY_ARG1 = 0x00b81c58u };
enum { ISAAC_RENDER_SHELL_A157F0_CS_ENTER_IMPORT_VA = 0x00b18270u };
enum { ISAAC_RENDER_SHELL_A157F0_CS_TRY_IMPORT_VA = 0x00b1826cu };
enum { ISAAC_RENDER_SHELL_A157F0_CS_LEAVE_IMPORT_VA = 0x00b18268u };
enum { ISAAC_RENDER_SHELL_A157F0_SLEEP_IMPORT_VA = 0x00b182d8u };
enum { ISAAC_RENDER_SHELL_A157F0_TIME_HELPER_VA = 0x00a68490u };
enum { ISAAC_RENDER_SHELL_A157F0_SCALE_MUL_LO = 0xd7b634dbu };
enum { ISAAC_RENDER_SHELL_A157F0_SCALE_MUL_HI = 0x431bde82u };
enum { ISAAC_RENDER_SHELL_A157F0_SCALE_SHIFT = 0x12u };
enum { ISAAC_RENDER_SHELL_A157F0_SLEEP_MS_FOREVER = 0x3e8u };
enum { ISAAC_RENDER_SHELL_A157F0_SLEEP_MS_TIMED = 0x0au };
enum { ISAAC_RENDER_SHELL_A157F0_STACK_ARGS = 1u };
enum { ISAAC_RENDER_SHELL_A157F0_ADDR_TAKEN_COUNT = 1u };
enum { ISAAC_RENDER_SHELL_A157F0_DIRECT_CALLER_COUNT = 0u };

uint32_t isaac_render_shell_a157f0_init_gate(uint32_t flg);
uint32_t isaac_render_shell_a157f0_arg_m1_gate(uint32_t arg);
uint32_t isaac_render_shell_a157f0_byte18_free(uint32_t v);
uint32_t isaac_render_shell_a157f0_arg_zero_gate(uint32_t arg);
uint32_t isaac_render_shell_a157f0_tryret_gate(uint32_t ret);
uint32_t isaac_render_shell_a157f0_timed_take(uint32_t ret, uint32_t byte18);
uint32_t isaac_render_shell_a157f0_time_scale_lo(uint32_t t_hi, uint32_t t_lo);
uint32_t isaac_render_shell_a157f0_time_scale_hi(uint32_t t_hi, uint32_t t_lo);
uint32_t isaac_render_shell_a157f0_deadline_exceeded(uint32_t base_hi, uint32_t base_lo, uint32_t now_hi, uint32_t now_lo, uint32_t arg);
uint32_t isaac_render_shell_a157f0_host_va(void);
uint32_t isaac_render_shell_a157f0_end_va(void);
uint32_t isaac_render_shell_a157f0_next_va(void);
uint32_t isaac_render_shell_a157f0_vtable_va(void);
uint32_t isaac_render_shell_a157f0_vtable_slot(void);
uint32_t isaac_render_shell_a157f0_flags_off(void);
uint32_t isaac_render_shell_a157f0_cs_ptr_off(void);
uint32_t isaac_render_shell_a157f0_byte18_off(void);
uint32_t isaac_render_shell_a157f0_factory_va(void);
uint32_t isaac_render_shell_a157f0_factory_arg(uint32_t index);
uint32_t isaac_render_shell_a157f0_cs_enter_import_va(void);
uint32_t isaac_render_shell_a157f0_cs_try_import_va(void);
uint32_t isaac_render_shell_a157f0_cs_leave_import_va(void);
uint32_t isaac_render_shell_a157f0_sleep_import_va(void);
uint32_t isaac_render_shell_a157f0_time_helper_va(void);
uint32_t isaac_render_shell_a157f0_scale_mul_lo(void);
uint32_t isaac_render_shell_a157f0_scale_mul_hi(void);
uint32_t isaac_render_shell_a157f0_scale_shift(void);
uint32_t isaac_render_shell_a157f0_sleep_ms_forever(void);
uint32_t isaac_render_shell_a157f0_sleep_ms_timed(void);
uint32_t isaac_render_shell_a157f0_stack_args(void);
uint32_t isaac_render_shell_a157f0_addr_taken_count(void);
uint32_t isaac_render_shell_a157f0_direct_caller_count(void);

/* ===========================================================================
 * ABI v56: FUN_00a15570 is-power-of-two gate — PURE leaf
 *
 * Body VA 0x00a15570..0x00a15580: `test ecx,ecx` (0xa15570) / `je
 * 0xa1557e` (0xa15572, n==0 -> return 0) / `lea eax,[ecx-1]` (0xa15574,
 * flags UNCHANGED) / `test ecx,eax` (0xa15577, FULL-dword
 * (n & (n-1)) == 0) / `jne 0xa1557e` (0xa15579) / `mov al,1` (0xa1557b) /
 * `ret` (0xa1557d) / `xor al,al` (0xa1557e) / `ret` (0xa15580). thiscall
 * (ecx in, al out), 0 stack args, 0 stores, 0 calls. Semantics:
 * is_pow2(n) = (n != 0) && ((n & (n-1)) == 0) — full 32-bit unsigned;
 * 0 -> 0, 1/2/4/.../0x80000000 -> 1, else 0. BOTH gates are FULL-DWORD
 * (no byte narrowing). EAX writes 2 (mov al,1 / xor al,al) — both paths
 * return low byte 0/1, upper 24 bits caller-stale (same return convention
 * as a15770/a157c0).
 * Single direct rel32 caller 0xa614dd: `mov edi,edx / mov ebx,ecx /
 * mov ecx,edi / call 0xa15570 / test al,al / jne ok / push 0xb9f974 /
 * push 0x10 / call 0xa112c0` — assert gate logging level 0x10 with rdata
 * msg 0xb9f974 = "Destination buffer length is not a power of two".
 * int3 pad 0xa15562..0xa1556f before; int3 pad 0xa15581..0xa1558f after;
 * next body = the v49 next-pow2 leaf 0xa15590..0xa155b0 (LANDED).
 * PURE — every byte of the body is in-module.
 * PE evidence: section-notes/render-shell-v56-next/NOTES.md (census
 * bands + body dump).
 * =========================================================================== */

enum { ISAAC_RENDER_SHELL_A15570_HOST_VA = 0x00a15570u };
enum { ISAAC_RENDER_SHELL_A15570_END_VA = 0x00a15580u };
enum { ISAAC_RENDER_SHELL_A15570_NEXT_VA = 0x00a15590u };
enum { ISAAC_RENDER_SHELL_A15570_CALLER_COUNT = 1u };
enum { ISAAC_RENDER_SHELL_A15570_CALLER_FIRST_VA = 0x00a614ddu };
enum { ISAAC_RENDER_SHELL_A15570_CALLER_LAST_VA = 0x00a614ddu };
enum { ISAAC_RENDER_SHELL_A15570_LOGGER_VA = 0x00a112c0u };
enum { ISAAC_RENDER_SHELL_A15570_LOG_MSG_VA = 0x00b9f974u };
enum { ISAAC_RENDER_SHELL_A15570_LOG_LEVEL = 0x10u };
enum { ISAAC_RENDER_SHELL_A15570_STACK_ARGS = 0u };
enum { ISAAC_RENDER_SHELL_A15570_ADDR_TAKEN_COUNT = 0u };
enum { ISAAC_RENDER_SHELL_A15570_EAX_WRITES = 2u };

uint32_t isaac_render_shell_a15570_is_pow2(uint32_t n);
uint32_t isaac_render_shell_a15570_host_va(void);
uint32_t isaac_render_shell_a15570_end_va(void);
uint32_t isaac_render_shell_a15570_next_va(void);
uint32_t isaac_render_shell_a15570_caller_count(void);
uint32_t isaac_render_shell_a15570_caller_first_va(void);
uint32_t isaac_render_shell_a15570_caller_last_va(void);
uint32_t isaac_render_shell_a15570_logger_va(void);
uint32_t isaac_render_shell_a15570_log_msg_va(void);
uint32_t isaac_render_shell_a15570_log_level(void);
uint32_t isaac_render_shell_a15570_stack_args(void);
uint32_t isaac_render_shell_a15570_addr_taken_count(void);
uint32_t isaac_render_shell_a15570_eax_writes(void);

/* ===========================================================================
 * ABI v57: FUN_00a13fa0 shader-object factory — NARROWED
 *
 * Body VA 0x00a13fa0..0x00a14043 (ret 0xc @ 0xa14040; 3 stack args:
 * name@[ebp+8] C-string, tag@[ebp+0xc], pair-table@[ebp+0x10]); plain
 * ebp frame (no SEH); no exact ZHL. int3 pad 0xa14043..0xa1404f; next
 * body = the a14050 chain @ 0xa14050. The v56 handoff classified this
 * overlap as an "other-family lease" — WRONG: this is the 0x54-byte
 * shader-object FACTORY of THIS chain (calls LANDED a14620 init v40 +
 * LANDED a159d0 v7 shader hash + HOST-MARKED a14330 map insert on the
 * SAME map 0xc379bc the a14050/a140c0 chain reads), and it had NO
 * written census anywhere (repo-wide grep: only the generic lift).
 * 6 direct E8 callers (0xa18102 / 0xa18131 / 0xa18160 / 0xa19003 /
 * 0xa19032 / 0xa19061 — registry-loader band, 2 host bodies, 3 sites
 * each); zero address-taken.
 * Body (PE order):
 *   1. tracked counter select: esi = [0xc7de78]; `test esi,esi` (FULL
 *      dword); je -> esi = 0xc7f618 else esi += 0x30 (pair header).
 *      THE ALLOC SIDE of the tracked template pinned in a149a0/a150d0
 *      (same select; there [ptr-4] size header is SUBtracted, here the
 *      alloc writes header 0x54 and ADDs 0x54).
 *   2. alloc: push 0x54; call [0xb187e0] (IAT, HOST); `test eax,eax`
 *      (FULL dword) / jne ok.
 *   3. alloc-fail: push 0x7fcb9dd6; call 0xa23200 (HOST notify-list
 *      dispatch over [0xc37974]; result UNUSED); xor esi,esi (obj=0).
 *   4. init (BOTH paths): push [ebp+0x10]; ecx=obj; push [ebp+0xc];
 *      push [ebp+8]; call 0xa14620 (LANDED v40 init, ret 0xc, al out);
 *      `test al,al` (BYTE gate) / jne success.
 *   5. init-fail: `test esi,esi` (FULL dword) / je; vtable slot 0
 *      virtual dtor with push 1 (delete flag); return 0.
 *   6. alloc-ok: add dword [esi],0x54 (counter lo, 32-bit wrap); mov
 *      [eax],0x54 (header size); lea ecx,[eax+4] (obj = alloc+4);
 *      adc dword [esi+4],0 (counter hi += carry); `test ecx,ecx`
 *      (FULL dword) / je (dead: alloc != 0); call 0xa245b0 (HOST
 *      zero-init: [+4]/[+0x34]..[+0x44] = 0, eax = ecx); esi = obj;
 *      jmp init.
 *   7. success: call 0xa159d0 (LANDED v7 shader-name hash, ecx=name);
 *      [esp+4]=hash; ecx=0xc379bc; lea eax,[esp+4]; push eax;
 *      call 0xa14330 (HOST-MARKED find-or-insert) -> slot; mov [eax],
 *      esi (store obj into the value slot); return 1.
 * PURE laws exported are the scalar gates/arith (byte-gate discipline:
 * init_gate takes uint32_t and masks & 0xff — PE tests AL only).
 * NEXT_VA 0x00a14050 (the a14050 chain body).
 * PE evidence: section-notes/render-shell-v57-net/NOTES.md + audit-band.py
 * =========================================================================== */

enum { ISAAC_RENDER_SHELL_A13FA0_HOST_VA = 0x00a13fa0u };
enum { ISAAC_RENDER_SHELL_A13FA0_END_VA = 0x00a14043u };
enum { ISAAC_RENDER_SHELL_A13FA0_NEXT_VA = 0x00a14050u };
enum { ISAAC_RENDER_SHELL_A13FA0_CALLER_COUNT = 6u };
enum { ISAAC_RENDER_SHELL_A13FA0_CALLER_FIRST_VA = 0x00a18102u };
enum { ISAAC_RENDER_SHELL_A13FA0_CALLER_LAST_VA = 0x00a19061u };
enum { ISAAC_RENDER_SHELL_A13FA0_STACK_ARGS = 3u };
enum { ISAAC_RENDER_SHELL_A13FA0_ADDR_TAKEN_COUNT = 0u };
enum { ISAAC_RENDER_SHELL_A13FA0_EAX_WRITES = 2u };
enum { ISAAC_RENDER_SHELL_A13FA0_ALLOC_IAT_VA = 0x00b187e0u };
enum { ISAAC_RENDER_SHELL_A13FA0_NOTIFY_FN_VA = 0x00a23200u };
enum { ISAAC_RENDER_SHELL_A13FA0_NOTIFY_HASH = 0x7fcb9dd6u };
enum { ISAAC_RENDER_SHELL_A13FA0_ZERO_INIT_FN_VA = 0x00a245b0u };
enum { ISAAC_RENDER_SHELL_A13FA0_INIT_FN_VA = 0x00a14620u };
enum { ISAAC_RENDER_SHELL_A13FA0_HASH_FN_VA = 0x00a159d0u };
enum { ISAAC_RENDER_SHELL_A13FA0_MAP_FN_VA = 0x00a14330u };
enum { ISAAC_RENDER_SHELL_A13FA0_MAP_THIS_VA = 0x00c379bcu };
enum { ISAAC_RENDER_SHELL_A13FA0_COUNTER_INSTALLED_VA = 0x00c7de78u };
enum { ISAAC_RENDER_SHELL_A13FA0_COUNTER_DEFAULT_VA = 0x00c7f618u };
enum { ISAAC_RENDER_SHELL_A13FA0_COUNTER_PAIR_OFF = 0x30u };
enum { ISAAC_RENDER_SHELL_A13FA0_COUNTER_INC = 0x54u };
enum { ISAAC_RENDER_SHELL_A13FA0_DESTROY_FLAG = 1u };

uint32_t isaac_render_shell_a13fa0_counter_base(uint32_t counter_ptr);
uint32_t isaac_render_shell_a13fa0_alloc_size(void);
uint32_t isaac_render_shell_a13fa0_alloc_gate(uint32_t alloc);
uint32_t isaac_render_shell_a13fa0_counter_add_lo(uint32_t lo);
uint32_t isaac_render_shell_a13fa0_counter_carry(uint32_t lo);
uint32_t isaac_render_shell_a13fa0_counter_add_hi(uint32_t lo, uint32_t hi);
uint32_t isaac_render_shell_a13fa0_obj_off(void);
uint32_t isaac_render_shell_a13fa0_obj_gate(uint32_t obj);
uint32_t isaac_render_shell_a13fa0_init_gate(uint32_t al);
uint32_t isaac_render_shell_a13fa0_destroy_gate(uint32_t obj);
uint32_t isaac_render_shell_a13fa0_destroy_flag(void);
uint32_t isaac_render_shell_a13fa0_host_va(void);
uint32_t isaac_render_shell_a13fa0_end_va(void);
uint32_t isaac_render_shell_a13fa0_next_va(void);
uint32_t isaac_render_shell_a13fa0_caller_count(void);
uint32_t isaac_render_shell_a13fa0_caller_first_va(void);
uint32_t isaac_render_shell_a13fa0_caller_last_va(void);
uint32_t isaac_render_shell_a13fa0_stack_args(void);
uint32_t isaac_render_shell_a13fa0_addr_taken_count(void);
uint32_t isaac_render_shell_a13fa0_eax_writes(void);
uint32_t isaac_render_shell_a13fa0_alloc_iat_va(void);
uint32_t isaac_render_shell_a13fa0_notify_fn_va(void);
uint32_t isaac_render_shell_a13fa0_notify_hash(void);
uint32_t isaac_render_shell_a13fa0_zero_init_fn_va(void);
uint32_t isaac_render_shell_a13fa0_init_fn_va(void);
uint32_t isaac_render_shell_a13fa0_hash_fn_va(void);
uint32_t isaac_render_shell_a13fa0_map_fn_va(void);
uint32_t isaac_render_shell_a13fa0_map_this_va(void);
uint32_t isaac_render_shell_a13fa0_counter_installed_va(void);
uint32_t isaac_render_shell_a13fa0_counter_default_va(void);
uint32_t isaac_render_shell_a13fa0_counter_pair_off(void);
uint32_t isaac_render_shell_a13fa0_counter_inc(void);

/* ============================================================================
 * ABI v58: SECOND BAND 0xa17000..0xa1a000 caller bodies (NARROWED).
 *   A180A0 0xa180a0..0xa18229 -- SEH shader-loader (vtable 0xb82430
 *     slot+4): entry thunk `mov [ecx],0xb82430; jmp 0xa12f20` then the
 *     SEH/GS body 0xa180b0..0xa18229 building the THREE a13fa0 factory
 *     arg triples with the A140C0 NAME_* consts (0xb81e50 NAME_COLOR /
 *     0xb1a5b0 KAGE_ColorTextureShader / 0xb81940 NAME_INDEXED), vt
 *     calls 0x78/0x18(1,0)/0x58(floats), alloc 0x10 -> ctor 0xa67fe0
 *     (FULL gate), obj->0xc7367c + [obj+0xc]=1, color 0xff000000 via
 *     0xa0f550, [0xc379b4]/[0xc37984]|=1, this+4|=1, hooks
 *     0xc7163c/0xc71644 = 0xa12240. E8 callers 0, address-taken 1
 *     (vtable slot, .rdata dword 0xb82434). Only gate = FULL-dword
 *     alloc; NO byte gates in this body.
 *   A18E10 0xa18e10..0xa18e89 -- ctor chain: vtable 0xb82600 then
 *     0xb82430, 4x (reset 0xa1a500 + sized free 0x10 via 0xaef15c)
 *     over slots 0xf0/0xe8/0xe0/0xd8, tail jmp 0xa12f20. 1 direct
 *     caller 0xa18dc6; address-taken 0.
 *   A18E90 0xa18e90..0xa1912b -- SEH shader-loader (vtable 0xb82600
 *     slot+4): state probe 0xa6a420 (ok==1) else log(0x10, 0xb825cc);
 *     pair loader 0xa19450 over 0xc79a34/0xc79a38 -> [this+0xc8/0xcc];
 *     flag cmove gate (BYTE [0xc79a3c]: ==0 clears 0x400, !=0 turns
 *     the 0x10000 window bit against 0xfffeffff); preload 0xa5f090
 *     (-0x10) + IAT 0xb186b4/0xb186a8; tail gate BYTE on al
 *     (0xa19df0) -> the SAME triple/alloc/obj/color/flag/hook factory
 *     sequence as A180A0 (byte-identical immediates) with vt calls
 *     0x78/0x18(1,0)/0x58. 1 direct caller 0xa71284; address-taken 1
 *     (vtable slot, .rdata dword 0xb82604).
 *   Registry leaves 0xa17180/0xa178d0/0xa17ea0/0xa17f40 stay
 *   DECLARED-HOST (a147e0 record, cpu-dump censused).
 *   Byte-gate discipline: byte gates take uint32_t and mask & 0xff
 *   (PE tests AL/BL only); NO uint8_t params.
 *   NEXT_VA 0x00a18230 — LANDED v63 (render-shell-v63-a18230/NOTES.md:
 *   the v56/v58 "sfx lease" label REFUTED by sfx-v29-net's written
 *   census; 0xa18300/0xa19180 = game_render_slice VA_RT LEASE rows).
 *   Next render-shell open candidate 0xa18070, vtable 0xb82430 slot+0.
 *   PE evidence: section-notes/render-shell-v58-band2/NOTES.md +
 *   cpu-dump/00a180a0.txt + 00a18e10.txt + 00a18f7d.txt
 * =========================================================================== */

enum { ISAAC_RENDER_SHELL_A180A0_HOST_VA = 0x00a180a0u };
enum { ISAAC_RENDER_SHELL_A180A0_END_VA = 0x00a18229u };
enum { ISAAC_RENDER_SHELL_A180A0_NEXT_VA = 0x00a18230u };
enum { ISAAC_RENDER_SHELL_A180A0_CALLER_COUNT = 0x0u };
enum { ISAAC_RENDER_SHELL_A180A0_ADDR_TAKEN_COUNT = 0x1u };
enum { ISAAC_RENDER_SHELL_A180A0_EAX_WRITES = 0x2u };
enum { ISAAC_RENDER_SHELL_A180A0_STACK_ARGS = 0x0u };
enum { ISAAC_RENDER_SHELL_A180A0_VTABLE_VA = 0x00b82430u };
enum { ISAAC_RENDER_SHELL_A180A0_TAIL_VA = 0x00a12f20u };
enum { ISAAC_RENDER_SHELL_A180A0_SEH_SLOT_VA = 0x00b82434u };
enum { ISAAC_RENDER_SHELL_A180A0_SEH_REG_VA = 0x00b110a4u };
enum { ISAAC_RENDER_SHELL_A180A0_GS_COOKIE_VA = 0x00bf93b4u };
enum { ISAAC_RENDER_SHELL_A180A0_TRIPLE1_NAME_VA = 0x00b81e50u };
enum { ISAAC_RENDER_SHELL_A180A0_TRIPLE1_ARG2 = 0x00c0f8c0u };
enum { ISAAC_RENDER_SHELL_A180A0_TRIPLE1_BASE_VA = 0x00b81f10u };
enum { ISAAC_RENDER_SHELL_A180A0_TRIPLE1_VAL = 0xcau };
enum { ISAAC_RENDER_SHELL_A180A0_TRIPLE1_STR_VA = 0x00b820f8u };
enum { ISAAC_RENDER_SHELL_A180A0_TRIPLE1_VAL2 = 0x9au };
enum { ISAAC_RENDER_SHELL_A180A0_TRIPLE2_NAME_VA = 0x00b1a5b0u };
enum { ISAAC_RENDER_SHELL_A180A0_TRIPLE2_ARG2 = 0x00c0f8f0u };
enum { ISAAC_RENDER_SHELL_A180A0_TRIPLE2_BASE_VA = 0x00b81fe0u };
enum { ISAAC_RENDER_SHELL_A180A0_TRIPLE2_VAL = 0x117u };
enum { ISAAC_RENDER_SHELL_A180A0_TRIPLE2_STR_VA = 0x00b82320u };
enum { ISAAC_RENDER_SHELL_A180A0_TRIPLE2_VAL2 = 0x10bu };
enum { ISAAC_RENDER_SHELL_A180A0_TRIPLE3_NAME_VA = 0x00b81940u };
enum { ISAAC_RENDER_SHELL_A180A0_TRIPLE3_ARG2 = 0x00c0f8f0u };
enum { ISAAC_RENDER_SHELL_A180A0_TRIPLE3_BASE_VA = 0x00b81fe0u };
enum { ISAAC_RENDER_SHELL_A180A0_TRIPLE3_VAL = 0x117u };
enum { ISAAC_RENDER_SHELL_A180A0_TRIPLE3_STR_VA = 0x00b82198u };
enum { ISAAC_RENDER_SHELL_A180A0_TRIPLE3_VAL2 = 0x186u };
enum { ISAAC_RENDER_SHELL_A180A0_VT_SLOT_78 = 0x78u };
enum { ISAAC_RENDER_SHELL_A180A0_VT_SLOT_18 = 0x18u };
enum { ISAAC_RENDER_SHELL_A180A0_VT_SLOT_58 = 0x58u };
enum { ISAAC_RENDER_SHELL_A180A0_VT18_ARG0 = 0x0u };
enum { ISAAC_RENDER_SHELL_A180A0_VT18_ARG1 = 0x1u };
enum { ISAAC_RENDER_SHELL_A180A0_ALLOC_SIZE = 0x10u };
enum { ISAAC_RENDER_SHELL_A180A0_CTOR_VA = 0x00a67fe0u };
enum { ISAAC_RENDER_SHELL_A180A0_COLOR_ARG_BITS = 0xff000000u };
enum { ISAAC_RENDER_SHELL_A180A0_COLOR_CTOR_VA = 0x00a0f550u };
enum { ISAAC_RENDER_SHELL_A180A0_OBJ_GLOBAL_VA = 0x00c7367cu };
enum { ISAAC_RENDER_SHELL_A180A0_OBJ_FLAG_OFF = 0xcu };
enum { ISAAC_RENDER_SHELL_A180A0_OBJ_FLAG_VAL = 0x1u };
enum { ISAAC_RENDER_SHELL_A180A0_FLAG_379B4_VA = 0x00c379b4u };
enum { ISAAC_RENDER_SHELL_A180A0_FLAG_37984_VA = 0x00c37984u };
enum { ISAAC_RENDER_SHELL_A180A0_FLAG_VAL = 0x1u };
enum { ISAAC_RENDER_SHELL_A180A0_THIS_FLAG_OFF = 0x4u };
enum { ISAAC_RENDER_SHELL_A180A0_HOOK_VA_0 = 0x00c7163cu };
enum { ISAAC_RENDER_SHELL_A180A0_HOOK_VA_1 = 0x00c71644u };
enum { ISAAC_RENDER_SHELL_A180A0_HOOK_TARGET_VA = 0x00a12240u };
enum { ISAAC_RENDER_SHELL_A180A0_VT58_FLOAT0_BITS = 0x00b81f10u };
enum { ISAAC_RENDER_SHELL_A180A0_VT58_FLOAT1_BITS = 0xcau };

uint32_t isaac_render_shell_a180a0_alloc_gate(uint32_t alloc);
uint32_t isaac_render_shell_a180a0_host_va(void);
uint32_t isaac_render_shell_a180a0_end_va(void);
uint32_t isaac_render_shell_a180a0_next_va(void);
uint32_t isaac_render_shell_a180a0_caller_count(void);
uint32_t isaac_render_shell_a180a0_addr_taken_count(void);
uint32_t isaac_render_shell_a180a0_eax_writes(void);
uint32_t isaac_render_shell_a180a0_stack_args(void);
uint32_t isaac_render_shell_a180a0_vtable_va(void);
uint32_t isaac_render_shell_a180a0_tail_va(void);
uint32_t isaac_render_shell_a180a0_seh_slot_va(void);
uint32_t isaac_render_shell_a180a0_seh_reg_va(void);
uint32_t isaac_render_shell_a180a0_gs_cookie_va(void);
uint32_t isaac_render_shell_a180a0_triple1_name_va(void);
uint32_t isaac_render_shell_a180a0_triple1_arg2(void);
uint32_t isaac_render_shell_a180a0_triple1_base_va(void);
uint32_t isaac_render_shell_a180a0_triple1_val(void);
uint32_t isaac_render_shell_a180a0_triple1_str_va(void);
uint32_t isaac_render_shell_a180a0_triple1_val2(void);
uint32_t isaac_render_shell_a180a0_triple2_name_va(void);
uint32_t isaac_render_shell_a180a0_triple2_arg2(void);
uint32_t isaac_render_shell_a180a0_triple2_base_va(void);
uint32_t isaac_render_shell_a180a0_triple2_val(void);
uint32_t isaac_render_shell_a180a0_triple2_str_va(void);
uint32_t isaac_render_shell_a180a0_triple2_val2(void);
uint32_t isaac_render_shell_a180a0_triple3_name_va(void);
uint32_t isaac_render_shell_a180a0_triple3_arg2(void);
uint32_t isaac_render_shell_a180a0_triple3_base_va(void);
uint32_t isaac_render_shell_a180a0_triple3_val(void);
uint32_t isaac_render_shell_a180a0_triple3_str_va(void);
uint32_t isaac_render_shell_a180a0_triple3_val2(void);
uint32_t isaac_render_shell_a180a0_vt_slot_78(void);
uint32_t isaac_render_shell_a180a0_vt_slot_18(void);
uint32_t isaac_render_shell_a180a0_vt_slot_58(void);
uint32_t isaac_render_shell_a180a0_vt18_arg0(void);
uint32_t isaac_render_shell_a180a0_vt18_arg1(void);
uint32_t isaac_render_shell_a180a0_alloc_size(void);
uint32_t isaac_render_shell_a180a0_ctor_va(void);
uint32_t isaac_render_shell_a180a0_color_arg_bits(void);
uint32_t isaac_render_shell_a180a0_color_ctor_va(void);
uint32_t isaac_render_shell_a180a0_obj_global_va(void);
uint32_t isaac_render_shell_a180a0_obj_flag_off(void);
uint32_t isaac_render_shell_a180a0_obj_flag_val(void);
uint32_t isaac_render_shell_a180a0_flag_379b4_va(void);
uint32_t isaac_render_shell_a180a0_flag_37984_va(void);
uint32_t isaac_render_shell_a180a0_flag_val(void);
uint32_t isaac_render_shell_a180a0_this_flag_off(void);
uint32_t isaac_render_shell_a180a0_hook_va_0(void);
uint32_t isaac_render_shell_a180a0_hook_va_1(void);
uint32_t isaac_render_shell_a180a0_hook_target_va(void);
uint32_t isaac_render_shell_a180a0_vt58_float0_bits(void);
uint32_t isaac_render_shell_a180a0_vt58_float1_bits(void);
enum { ISAAC_RENDER_SHELL_A18E10_HOST_VA = 0x00a18e10u };
enum { ISAAC_RENDER_SHELL_A18E10_END_VA = 0x00a18e8au };
enum { ISAAC_RENDER_SHELL_A18E10_NEXT_VA = 0x00a18e90u };
enum { ISAAC_RENDER_SHELL_A18E10_CALLER_COUNT = 0x1u };
enum { ISAAC_RENDER_SHELL_A18E10_CALLER_FIRST_VA = 0x00a18dc6u };
enum { ISAAC_RENDER_SHELL_A18E10_CALLER_LAST_VA = 0x00a18dc6u };
enum { ISAAC_RENDER_SHELL_A18E10_ADDR_TAKEN_COUNT = 0x0u };
enum { ISAAC_RENDER_SHELL_A18E10_EAX_WRITES = 0x0u };
enum { ISAAC_RENDER_SHELL_A18E10_STACK_ARGS = 0x0u };
enum { ISAAC_RENDER_SHELL_A18E10_VTABLE_FIRST_VA = 0x00b82600u };
enum { ISAAC_RENDER_SHELL_A18E10_VTABLE_FINAL_VA = 0x00b82430u };
enum { ISAAC_RENDER_SHELL_A18E10_TAIL_VA = 0x00a12f20u };
enum { ISAAC_RENDER_SHELL_A18E10_SLOT_OFF_0 = 0xf0u };
enum { ISAAC_RENDER_SHELL_A18E10_SLOT_OFF_1 = 0xe8u };
enum { ISAAC_RENDER_SHELL_A18E10_SLOT_OFF_2 = 0xe0u };
enum { ISAAC_RENDER_SHELL_A18E10_SLOT_OFF_3 = 0xd8u };
enum { ISAAC_RENDER_SHELL_A18E10_FREE_SIZE = 0x10u };
enum { ISAAC_RENDER_SHELL_A18E10_FREE_FN_VA = 0x00aef15cu };
enum { ISAAC_RENDER_SHELL_A18E10_RESET_FN_VA = 0x00a1a500u };

uint32_t isaac_render_shell_a18e10_host_va(void);
uint32_t isaac_render_shell_a18e10_end_va(void);
uint32_t isaac_render_shell_a18e10_next_va(void);
uint32_t isaac_render_shell_a18e10_caller_count(void);
uint32_t isaac_render_shell_a18e10_caller_first_va(void);
uint32_t isaac_render_shell_a18e10_caller_last_va(void);
uint32_t isaac_render_shell_a18e10_addr_taken_count(void);
uint32_t isaac_render_shell_a18e10_eax_writes(void);
uint32_t isaac_render_shell_a18e10_stack_args(void);
uint32_t isaac_render_shell_a18e10_vtable_first_va(void);
uint32_t isaac_render_shell_a18e10_vtable_final_va(void);
uint32_t isaac_render_shell_a18e10_tail_va(void);
uint32_t isaac_render_shell_a18e10_slot_off_0(void);
uint32_t isaac_render_shell_a18e10_slot_off_1(void);
uint32_t isaac_render_shell_a18e10_slot_off_2(void);
uint32_t isaac_render_shell_a18e10_slot_off_3(void);
uint32_t isaac_render_shell_a18e10_free_size(void);
uint32_t isaac_render_shell_a18e10_free_fn_va(void);
uint32_t isaac_render_shell_a18e10_reset_fn_va(void);
enum { ISAAC_RENDER_SHELL_A18E90_HOST_VA = 0x00a18e90u };
enum { ISAAC_RENDER_SHELL_A18E90_END_VA = 0x00a1912cu };
enum { ISAAC_RENDER_SHELL_A18E90_NEXT_VA = 0x00a19130u };
enum { ISAAC_RENDER_SHELL_A18E90_CALLER_COUNT = 0x1u };
enum { ISAAC_RENDER_SHELL_A18E90_CALLER_FIRST_VA = 0x00a71284u };
enum { ISAAC_RENDER_SHELL_A18E90_CALLER_LAST_VA = 0x00a71284u };
enum { ISAAC_RENDER_SHELL_A18E90_ADDR_TAKEN_COUNT = 0x1u };
enum { ISAAC_RENDER_SHELL_A18E90_EAX_WRITES = 0x2u };
enum { ISAAC_RENDER_SHELL_A18E90_STACK_ARGS = 0x0u };
enum { ISAAC_RENDER_SHELL_A18E90_VTABLE_VA = 0x00b82600u };
enum { ISAAC_RENDER_SHELL_A18E90_VTABLE_SLOT = 0x4u };
enum { ISAAC_RENDER_SHELL_A18E90_SEH_REG_VA = 0x00b11164u };
enum { ISAAC_RENDER_SHELL_A18E90_GS_COOKIE_VA = 0x00bf93b4u };
enum { ISAAC_RENDER_SHELL_A18E90_HOOK_VA = 0x00c7de7cu };
enum { ISAAC_RENDER_SHELL_A18E90_HOOK_TARGET_VA = 0x00a19dd0u };
enum { ISAAC_RENDER_SHELL_A18E90_STATE_CALL_VA = 0x00a6a420u };
enum { ISAAC_RENDER_SHELL_A18E90_STATE_OK_VAL = 0x1u };
enum { ISAAC_RENDER_SHELL_A18E90_LOG_MSG_VA = 0x00b825ccu };
enum { ISAAC_RENDER_SHELL_A18E90_LOG_LEVEL = 0x10u };
enum { ISAAC_RENDER_SHELL_A18E90_PAIR_VA = 0x00c79a34u };
enum { ISAAC_RENDER_SHELL_A18E90_PAIR2_VA = 0x00c79a38u };
enum { ISAAC_RENDER_SHELL_A18E90_STATE_BYTE_VA = 0x00c79a3cu };
enum { ISAAC_RENDER_SHELL_A18E90_RELAY_OFF_0 = 0xc8u };
enum { ISAAC_RENDER_SHELL_A18E90_RELAY_OFF_1 = 0xccu };
enum { ISAAC_RENDER_SHELL_A18E90_FLAG_CLEAR_MASK = 0xfffffbffu };
enum { ISAAC_RENDER_SHELL_A18E90_FLAG_SET_BITS = 0x400u };
enum { ISAAC_RENDER_SHELL_A18E90_WIN_CLEAR_MASK = 0xfffeffffu };
enum { ISAAC_RENDER_SHELL_A18E90_WIN_SET_BITS = 0x10000u };
enum { ISAAC_RENDER_SHELL_A18E90_THIS_FLAG_OFF = 0x4u };
enum { ISAAC_RENDER_SHELL_A18E90_SLOT_OFF = 0xbcu };
enum { ISAAC_RENDER_SHELL_A18E90_PRELOAD_ARG = 0xfffffff0u };
enum { ISAAC_RENDER_SHELL_A18E90_PRELOAD_FN_VA = 0x00a5f090u };
enum { ISAAC_RENDER_SHELL_A18E90_DBL_IAT_VA_0 = 0x00b186b4u };
enum { ISAAC_RENDER_SHELL_A18E90_DBL_IAT_VA_1 = 0x00b186a8u };
enum { ISAAC_RENDER_SHELL_A18E90_WIN_OFF = 0x40u };
enum { ISAAC_RENDER_SHELL_A18E90_WIN_FLAG_OFF = 0x14u };
enum { ISAAC_RENDER_SHELL_A18E90_ESCALATE_LINE = 0x333u };
enum { ISAAC_RENDER_SHELL_A18E90_ESCALATE_FILE_VA = 0x00ba08f8u };
enum { ISAAC_RENDER_SHELL_A18E90_ESCALATE_MSG_VA = 0x00b9bbccu };
enum { ISAAC_RENDER_SHELL_A18E90_ESCALATE_IAT_VA = 0x00b18884u };
enum { ISAAC_RENDER_SHELL_A18E90_INIT_FN_VA = 0x00a69f60u };
enum { ISAAC_RENDER_SHELL_A18E90_INIT_ARG0 = 0x0u };
enum { ISAAC_RENDER_SHELL_A18E90_INIT_ARG1 = 0x10001u };
enum { ISAAC_RENDER_SHELL_A18E90_NOTIFY_FLAG_VA = 0x00c73680u };
enum { ISAAC_RENDER_SHELL_A18E90_NOTIFY_FN_VA_0 = 0x00c73748u };
enum { ISAAC_RENDER_SHELL_A18E90_NOTIFY_FN_VA_1 = 0x00c73754u };
enum { ISAAC_RENDER_SHELL_A18E90_TRIPLE1_NAME_VA = 0x00b81e50u };
enum { ISAAC_RENDER_SHELL_A18E90_TRIPLE1_ARG2 = 0x00c0f8c0u };
enum { ISAAC_RENDER_SHELL_A18E90_TRIPLE1_BASE_VA = 0x00b81f10u };
enum { ISAAC_RENDER_SHELL_A18E90_TRIPLE1_VAL = 0xcau };
enum { ISAAC_RENDER_SHELL_A18E90_TRIPLE1_STR_VA = 0x00b820f8u };
enum { ISAAC_RENDER_SHELL_A18E90_TRIPLE1_VAL2 = 0x9au };
enum { ISAAC_RENDER_SHELL_A18E90_TRIPLE2_NAME_VA = 0x00b1a5b0u };
enum { ISAAC_RENDER_SHELL_A18E90_TRIPLE2_ARG2 = 0x00c0f8f0u };
enum { ISAAC_RENDER_SHELL_A18E90_TRIPLE2_BASE_VA = 0x00b81fe0u };
enum { ISAAC_RENDER_SHELL_A18E90_TRIPLE2_VAL = 0x117u };
enum { ISAAC_RENDER_SHELL_A18E90_TRIPLE2_STR_VA = 0x00b82320u };
enum { ISAAC_RENDER_SHELL_A18E90_TRIPLE2_VAL2 = 0x10bu };
enum { ISAAC_RENDER_SHELL_A18E90_TRIPLE3_NAME_VA = 0x00b81940u };
enum { ISAAC_RENDER_SHELL_A18E90_TRIPLE3_ARG2 = 0x00c0f8f0u };
enum { ISAAC_RENDER_SHELL_A18E90_TRIPLE3_BASE_VA = 0x00b81fe0u };
enum { ISAAC_RENDER_SHELL_A18E90_TRIPLE3_VAL = 0x117u };
enum { ISAAC_RENDER_SHELL_A18E90_TRIPLE3_STR_VA = 0x00b82198u };
enum { ISAAC_RENDER_SHELL_A18E90_TRIPLE3_VAL2 = 0x186u };
enum { ISAAC_RENDER_SHELL_A18E90_VT_SLOT_78 = 0x78u };
enum { ISAAC_RENDER_SHELL_A18E90_VT_SLOT_18 = 0x18u };
enum { ISAAC_RENDER_SHELL_A18E90_VT_SLOT_58 = 0x58u };
enum { ISAAC_RENDER_SHELL_A18E90_VT18_ARG0 = 0x0u };
enum { ISAAC_RENDER_SHELL_A18E90_VT18_ARG1 = 0x1u };
enum { ISAAC_RENDER_SHELL_A18E90_ALLOC_SIZE = 0x10u };
enum { ISAAC_RENDER_SHELL_A18E90_CTOR_VA = 0x00a67fe0u };
enum { ISAAC_RENDER_SHELL_A18E90_COLOR_ARG_BITS = 0xff000000u };
enum { ISAAC_RENDER_SHELL_A18E90_COLOR_CTOR_VA = 0x00a0f550u };
enum { ISAAC_RENDER_SHELL_A18E90_OBJ_GLOBAL_VA = 0x00c7367cu };
enum { ISAAC_RENDER_SHELL_A18E90_OBJ_FLAG_OFF = 0xcu };
enum { ISAAC_RENDER_SHELL_A18E90_OBJ_FLAG_VAL = 0x1u };
enum { ISAAC_RENDER_SHELL_A18E90_FLAG_379B4_VA = 0x00c379b4u };
enum { ISAAC_RENDER_SHELL_A18E90_FLAG_37984_VA = 0x00c37984u };
enum { ISAAC_RENDER_SHELL_A18E90_FLAG_VAL = 0x1u };
enum { ISAAC_RENDER_SHELL_A18E90_HOOK_VA_0 = 0x00c7163cu };
enum { ISAAC_RENDER_SHELL_A18E90_HOOK_VA_1 = 0x00c71644u };
enum { ISAAC_RENDER_SHELL_A18E90_TAIL_HOOK_TARGET_VA = 0x00a12240u };
enum { ISAAC_RENDER_SHELL_A18E90_VT58_FLOAT0_BITS = 0x00b81f10u };
enum { ISAAC_RENDER_SHELL_A18E90_VT58_FLOAT1_BITS = 0xcau };

uint32_t isaac_render_shell_a18e90_flag_gate(uint32_t b);
uint32_t isaac_render_shell_a18e90_win_gate(uint32_t b);
uint32_t isaac_render_shell_a18e90_tail_gate(uint32_t al);
uint32_t isaac_render_shell_a18e90_alloc_gate(uint32_t alloc);
uint32_t isaac_render_shell_a18e90_host_va(void);
uint32_t isaac_render_shell_a18e90_end_va(void);
uint32_t isaac_render_shell_a18e90_next_va(void);
uint32_t isaac_render_shell_a18e90_caller_count(void);
uint32_t isaac_render_shell_a18e90_caller_first_va(void);
uint32_t isaac_render_shell_a18e90_caller_last_va(void);
uint32_t isaac_render_shell_a18e90_addr_taken_count(void);
uint32_t isaac_render_shell_a18e90_eax_writes(void);
uint32_t isaac_render_shell_a18e90_stack_args(void);
uint32_t isaac_render_shell_a18e90_vtable_va(void);
uint32_t isaac_render_shell_a18e90_vtable_slot(void);
uint32_t isaac_render_shell_a18e90_seh_reg_va(void);
uint32_t isaac_render_shell_a18e90_gs_cookie_va(void);
uint32_t isaac_render_shell_a18e90_hook_va(void);
uint32_t isaac_render_shell_a18e90_hook_target_va(void);
uint32_t isaac_render_shell_a18e90_state_call_va(void);
uint32_t isaac_render_shell_a18e90_state_ok_val(void);
uint32_t isaac_render_shell_a18e90_log_msg_va(void);
uint32_t isaac_render_shell_a18e90_log_level(void);
uint32_t isaac_render_shell_a18e90_pair_va(void);
uint32_t isaac_render_shell_a18e90_pair2_va(void);
uint32_t isaac_render_shell_a18e90_state_byte_va(void);
uint32_t isaac_render_shell_a18e90_relay_off_0(void);
uint32_t isaac_render_shell_a18e90_relay_off_1(void);
uint32_t isaac_render_shell_a18e90_flag_clear_mask(void);
uint32_t isaac_render_shell_a18e90_flag_set_bits(void);
uint32_t isaac_render_shell_a18e90_win_clear_mask(void);
uint32_t isaac_render_shell_a18e90_win_set_bits(void);
uint32_t isaac_render_shell_a18e90_this_flag_off(void);
uint32_t isaac_render_shell_a18e90_slot_off(void);
uint32_t isaac_render_shell_a18e90_preload_arg(void);
uint32_t isaac_render_shell_a18e90_preload_fn_va(void);
uint32_t isaac_render_shell_a18e90_dbl_iat_va_0(void);
uint32_t isaac_render_shell_a18e90_dbl_iat_va_1(void);
uint32_t isaac_render_shell_a18e90_win_off(void);
uint32_t isaac_render_shell_a18e90_win_flag_off(void);
uint32_t isaac_render_shell_a18e90_escalate_line(void);
uint32_t isaac_render_shell_a18e90_escalate_file_va(void);
uint32_t isaac_render_shell_a18e90_escalate_msg_va(void);
uint32_t isaac_render_shell_a18e90_escalate_iat_va(void);
uint32_t isaac_render_shell_a18e90_init_fn_va(void);
uint32_t isaac_render_shell_a18e90_init_arg0(void);
uint32_t isaac_render_shell_a18e90_init_arg1(void);
uint32_t isaac_render_shell_a18e90_notify_flag_va(void);
uint32_t isaac_render_shell_a18e90_notify_fn_va_0(void);
uint32_t isaac_render_shell_a18e90_notify_fn_va_1(void);
uint32_t isaac_render_shell_a18e90_triple1_name_va(void);
uint32_t isaac_render_shell_a18e90_triple1_arg2(void);
uint32_t isaac_render_shell_a18e90_triple1_base_va(void);
uint32_t isaac_render_shell_a18e90_triple1_val(void);
uint32_t isaac_render_shell_a18e90_triple1_str_va(void);
uint32_t isaac_render_shell_a18e90_triple1_val2(void);
uint32_t isaac_render_shell_a18e90_triple2_name_va(void);
uint32_t isaac_render_shell_a18e90_triple2_arg2(void);
uint32_t isaac_render_shell_a18e90_triple2_base_va(void);
uint32_t isaac_render_shell_a18e90_triple2_val(void);
uint32_t isaac_render_shell_a18e90_triple2_str_va(void);
uint32_t isaac_render_shell_a18e90_triple2_val2(void);
uint32_t isaac_render_shell_a18e90_triple3_name_va(void);
uint32_t isaac_render_shell_a18e90_triple3_arg2(void);
uint32_t isaac_render_shell_a18e90_triple3_base_va(void);
uint32_t isaac_render_shell_a18e90_triple3_val(void);
uint32_t isaac_render_shell_a18e90_triple3_str_va(void);
uint32_t isaac_render_shell_a18e90_triple3_val2(void);
uint32_t isaac_render_shell_a18e90_vt_slot_78(void);
uint32_t isaac_render_shell_a18e90_vt_slot_18(void);
uint32_t isaac_render_shell_a18e90_vt_slot_58(void);
uint32_t isaac_render_shell_a18e90_vt18_arg0(void);
uint32_t isaac_render_shell_a18e90_vt18_arg1(void);
uint32_t isaac_render_shell_a18e90_alloc_size(void);
uint32_t isaac_render_shell_a18e90_ctor_va(void);
uint32_t isaac_render_shell_a18e90_color_arg_bits(void);
uint32_t isaac_render_shell_a18e90_color_ctor_va(void);
uint32_t isaac_render_shell_a18e90_obj_global_va(void);
uint32_t isaac_render_shell_a18e90_obj_flag_off(void);
uint32_t isaac_render_shell_a18e90_obj_flag_val(void);
uint32_t isaac_render_shell_a18e90_flag_379b4_va(void);
uint32_t isaac_render_shell_a18e90_flag_37984_va(void);
uint32_t isaac_render_shell_a18e90_flag_val(void);
uint32_t isaac_render_shell_a18e90_hook_va_0(void);
uint32_t isaac_render_shell_a18e90_hook_va_1(void);
uint32_t isaac_render_shell_a18e90_tail_hook_target_va(void);
uint32_t isaac_render_shell_a18e90_vt58_float0_bits(void);
uint32_t isaac_render_shell_a18e90_vt58_float1_bits(void);
/* ============================================================================
 * ABI v59: NEXT-OPEN BAND BODY (0xa172e0, registry caller).
 *   Verify-open 0xa18070 (vtable 0xb82430 slot+0) -> TRIVIAL/DUPLICATE
 *   of v58 pins (vtable 0xb82430 / tail 0xa12f20 / sized-free 0xaef15c
 *   already pinned; 22-insn scalar deleting dtor, single `flags & 1`
 *   bit gate, size 0xbc, ret 4) -> per handoff, took the band's next
 *   open caller-bearing unlanded body = 0xa172e0.
 *   A172E0 0xa172e0..0xa17621 -- SEH/GS registry loader (cdecl, 2
 *   stack args; caller 0xa68853 = 0xc379e0 chain; address-taken via
 *   handler table 0xb81cc8, which also lists the declared-host leaves
 *   a17170/a17180): empty-gate on name (BYTE first byte) -> default
 *   string 0xb7ded4 via cmove; global 0xc5aa98 strlen + IAT 0xb18934
 *   3-arg op; object load 0xa16f50; entry walk at obj+0x114 with
 *   {0x468,0x46c,0x470} state and sub-entries +0x218 (+0x2c name,
 *   +0x234 alt), 0x104-capped cb2 copies; ok path '?' 0x3f + flag
 *   fields; err path attr select from first-byte bits (test al,0x40 ->
 *   0x2000, test al,0x10 -> 0x4000, else 0x8000); word gate on
 *   [+0x234]; byte strcmp loops vs 0xb1cebc/0xb1ceb8 (sbb/or idiom:
 *   equal 0, a<b -1, a>b +1); 0xa5a7a0 hash; attr byte 5+(flag==0x4000)
 *   -> {5,6}; 8-byte record append into out-vector (FULL end==cap
 *   gate -> grow 0xa17630); release gate (test cl,4; always taken for
 *   cl in {5,6} -- dead release path 0xa1755a, encoded faithfully);
 *   release 0xa648b0; IAT releases 0xb18290/0xb188b0; cb3 0xb187dc
 *   free chain; eax_writes 29.
 *   Byte-gate discipline: byte gates take uint32_t and mask & 0xff
 *   (PE tests AL/BL only); the word gate masks & 0xffff; NO uint8_t.
 *   NEXT_VA 0x00a17630 (in-band grow fn, stays HOST).
 *   PE evidence: section-notes/render-shell-v59/NOTES.md +
 *   cpu-dump/00a172e0.txt + 00a18070.txt
 * =========================================================================== */

enum { ISAAC_RENDER_SHELL_A172E0_HOST_VA = 0x00a172e0u };
enum { ISAAC_RENDER_SHELL_A172E0_END_VA = 0x00a17621u };
enum { ISAAC_RENDER_SHELL_A172E0_NEXT_VA = 0x00a17630u };
enum { ISAAC_RENDER_SHELL_A172E0_CALLER_COUNT = 0x1u };
enum { ISAAC_RENDER_SHELL_A172E0_CALLER_LAST_VA = 0x00a68853u };
enum { ISAAC_RENDER_SHELL_A172E0_ADDR_TAKEN_COUNT = 0x1u };
enum { ISAAC_RENDER_SHELL_A172E0_ADDR_TAKEN_TABLE_VA = 0x00b81cc8u };
enum { ISAAC_RENDER_SHELL_A172E0_EAX_WRITES = 0x1du };
enum { ISAAC_RENDER_SHELL_A172E0_STACK_ARGS = 0x2u };
enum { ISAAC_RENDER_SHELL_A172E0_THIS_CALL = 0x0u };
enum { ISAAC_RENDER_SHELL_A172E0_SEH_REG_VA = 0x00b10fedu };
enum { ISAAC_RENDER_SHELL_A172E0_GS_COOKIE_VA = 0x00bf93b4u };
enum { ISAAC_RENDER_SHELL_A172E0_GLOBAL_STR_VA = 0x00c5aa98u };
enum { ISAAC_RENDER_SHELL_A172E0_DEFAULT_STR_VA = 0x00b7ded4u };
enum { ISAAC_RENDER_SHELL_A172E0_CMP_IAT_VA = 0x00b18934u };
enum { ISAAC_RENDER_SHELL_A172E0_LOAD_FN_VA = 0x00a16f50u };
enum { ISAAC_RENDER_SHELL_A172E0_CB1_VA = 0x00b1825cu };
enum { ISAAC_RENDER_SHELL_A172E0_CB2_VA = 0x00b187b0u };
enum { ISAAC_RENDER_SHELL_A172E0_ENTRY_OFF = 0x114u };
enum { ISAAC_RENDER_SHELL_A172E0_STATE_468_OFF = 0x468u };
enum { ISAAC_RENDER_SHELL_A172E0_STATE_46C_OFF = 0x46cu };
enum { ISAAC_RENDER_SHELL_A172E0_STATE_470_OFF = 0x470u };
enum { ISAAC_RENDER_SHELL_A172E0_SUB_218_OFF = 0x218u };
enum { ISAAC_RENDER_SHELL_A172E0_SUB_2C_OFF = 0x2cu };
enum { ISAAC_RENDER_SHELL_A172E0_SUB_234_OFF = 0x234u };
enum { ISAAC_RENDER_SHELL_A172E0_COPY_SIZE = 0x104u };
enum { ISAAC_RENDER_SHELL_A172E0_Q_BYTE_VAL = 0x3fu };
enum { ISAAC_RENDER_SHELL_A172E0_CHAR_OFF = 0x11u };
enum { ISAAC_RENDER_SHELL_A172E0_CHAR_ZERO = 0x0u };
enum { ISAAC_RENDER_SHELL_A172E0_OUT8_VAL = 0x1u };
enum { ISAAC_RENDER_SHELL_A172E0_OUT12_VAL = 0x0u };
enum { ISAAC_RENDER_SHELL_A172E0_OUT0_ZERO = 0x0u };
enum { ISAAC_RENDER_SHELL_A172E0_OUT4_WORD = 0x114u };
enum { ISAAC_RENDER_SHELL_A172E0_ATTR_2000 = 0x2000u };
enum { ISAAC_RENDER_SHELL_A172E0_ATTR_4000 = 0x4000u };
enum { ISAAC_RENDER_SHELL_A172E0_ATTR_8000 = 0x8000u };
enum { ISAAC_RENDER_SHELL_A172E0_CMPSTR0_VA = 0x00b1cebcu };
enum { ISAAC_RENDER_SHELL_A172E0_CMPSTR1_VA = 0x00b1ceb8u };
enum { ISAAC_RENDER_SHELL_A172E0_HASH_FN_VA = 0x00a5a7a0u };
enum { ISAAC_RENDER_SHELL_A172E0_GROW_FN_VA = 0x00a17630u };
enum { ISAAC_RENDER_SHELL_A172E0_RELEASE_FN_VA = 0x00a648b0u };
enum { ISAAC_RENDER_SHELL_A172E0_RELEASE_IAT_VA = 0x00b18290u };
enum { ISAAC_RENDER_SHELL_A172E0_CB3_VA = 0x00b187dcu };
enum { ISAAC_RENDER_SHELL_A172E0_ERR_IAT_VA = 0x00b188b0u };
enum { ISAAC_RENDER_SHELL_A172E0_ERR_CODE = 0x9u };
enum { ISAAC_RENDER_SHELL_A172E0_REC_SIZE = 0x8u };
enum { ISAAC_RENDER_SHELL_A172E0_NEG1 = 0xffffffffu };

uint32_t isaac_render_shell_a172e0_empty_gate(uint32_t p, uint32_t b0);
uint32_t isaac_render_shell_a172e0_str_select(uint32_t e);
uint32_t isaac_render_shell_a172e0_byte_nonzero(uint32_t b);
uint32_t isaac_render_shell_a172e0_len_zero_gate(uint32_t len);
uint32_t isaac_render_shell_a172e0_field468_gate(uint32_t v);
uint32_t isaac_render_shell_a172e0_field46c_gate(uint32_t v);
uint32_t isaac_render_shell_a172e0_null_gate(uint32_t p);
uint32_t isaac_render_shell_a172e0_call1_gate(uint32_t v);
uint32_t isaac_render_shell_a172e0_call2_gate(uint32_t v);
uint32_t isaac_render_shell_a172e0_word_zero_gate(uint32_t w);
uint32_t isaac_render_shell_a172e0_bit40_gate(uint32_t b);
uint32_t isaac_render_shell_a172e0_bit10_gate(uint32_t b);
uint32_t isaac_render_shell_a172e0_attr_sel(uint32_t b);
uint32_t isaac_render_shell_a172e0_cmp_byte(uint32_t a, uint32_t b);
uint32_t isaac_render_shell_a172e0_cmp_skip_gate(uint32_t res);
uint32_t isaac_render_shell_a172e0_attr_byte(uint32_t flag);
uint32_t isaac_render_shell_a172e0_release_gate(uint32_t cl);
uint32_t isaac_render_shell_a172e0_append_full_gate(uint32_t pos, uint32_t cap);
uint32_t isaac_render_shell_a172e0_release2_gate(uint32_t v);
uint32_t isaac_render_shell_a172e0_field470_gate(uint32_t v);
uint32_t isaac_render_shell_a172e0_host_va(void);
uint32_t isaac_render_shell_a172e0_end_va(void);
uint32_t isaac_render_shell_a172e0_next_va(void);
uint32_t isaac_render_shell_a172e0_caller_count(void);
uint32_t isaac_render_shell_a172e0_caller_last_va(void);
uint32_t isaac_render_shell_a172e0_addr_taken_count(void);
uint32_t isaac_render_shell_a172e0_addr_taken_table_va(void);
uint32_t isaac_render_shell_a172e0_eax_writes(void);
uint32_t isaac_render_shell_a172e0_stack_args(void);
uint32_t isaac_render_shell_a172e0_this_call(void);
uint32_t isaac_render_shell_a172e0_seh_reg_va(void);
uint32_t isaac_render_shell_a172e0_gs_cookie_va(void);
uint32_t isaac_render_shell_a172e0_global_str_va(void);
uint32_t isaac_render_shell_a172e0_default_str_va(void);
uint32_t isaac_render_shell_a172e0_cmp_iat_va(void);
uint32_t isaac_render_shell_a172e0_load_fn_va(void);
uint32_t isaac_render_shell_a172e0_cb1_va(void);
uint32_t isaac_render_shell_a172e0_cb2_va(void);
uint32_t isaac_render_shell_a172e0_entry_off(void);
uint32_t isaac_render_shell_a172e0_state_468_off(void);
uint32_t isaac_render_shell_a172e0_state_46c_off(void);
uint32_t isaac_render_shell_a172e0_state_470_off(void);
uint32_t isaac_render_shell_a172e0_sub_218_off(void);
uint32_t isaac_render_shell_a172e0_sub_2c_off(void);
uint32_t isaac_render_shell_a172e0_sub_234_off(void);
uint32_t isaac_render_shell_a172e0_copy_size(void);
uint32_t isaac_render_shell_a172e0_q_byte_val(void);
uint32_t isaac_render_shell_a172e0_char_off(void);
uint32_t isaac_render_shell_a172e0_char_zero(void);
uint32_t isaac_render_shell_a172e0_out8_val(void);
uint32_t isaac_render_shell_a172e0_out12_val(void);
uint32_t isaac_render_shell_a172e0_out0_zero(void);
uint32_t isaac_render_shell_a172e0_out4_word(void);
uint32_t isaac_render_shell_a172e0_attr_2000(void);
uint32_t isaac_render_shell_a172e0_attr_4000(void);
uint32_t isaac_render_shell_a172e0_attr_8000(void);
uint32_t isaac_render_shell_a172e0_cmpstr0_va(void);
uint32_t isaac_render_shell_a172e0_cmpstr1_va(void);
uint32_t isaac_render_shell_a172e0_hash_fn_va(void);
uint32_t isaac_render_shell_a172e0_grow_fn_va(void);
uint32_t isaac_render_shell_a172e0_release_fn_va(void);
uint32_t isaac_render_shell_a172e0_release_iat_va(void);
uint32_t isaac_render_shell_a172e0_cb3_va(void);
uint32_t isaac_render_shell_a172e0_err_iat_va(void);
uint32_t isaac_render_shell_a172e0_err_code(void);
uint32_t isaac_render_shell_a172e0_rec_size(void);
uint32_t isaac_render_shell_a172e0_neg1(void);
uint32_t isaac_render_shell_a172e0_table_va(void);

/* ============================================================================
 * ABI v60: REGISTRY CHAIN — A17860 SEH/GS release probe (0xa17860).
 *
 * Body VA 0x00a17860..0x00a178c1 (ret 4 @ 0xa178c1; 1 stack arg
 * name@[ebp+8]); SEH reg 0xaf0a10, GS cookie 0xbf93b4 (frames stay
 * platform — evidence pins only); no exact ZHL. int3 pad
 * 0xa178c4..0xa178cf; next body = 0xa178d0 (DECLARED-HOST registry
 * leaf per the a147e0 record — stays host). Verify-open (v60 NOTES):
 * family files had ZERO mentions (header/cpp/model/tests); corrected
 * resync-aware census (census-callers-fixed.py, lea-sized — the old
 * capstone census early-halted on lea-before-thiscall and undercounted
 * ~25%) confirms the v59 table: 10 direct E8 callers (0x60fb85 /
 * 0x6b9fcc / 0x6ba2f7 / 0x6ba52a / 0x75ba23 / 0x75bdb2 / 0x8e3a27 /
 * 0x8f43cc / 0x8f44ee / 0x8f4635); zero address-taken (.rdata/.data
 * dword scan NONE); 4 EAX writes; this-call no (ecx set in body).
 * Band siblings 0xa17630 (vector grow) / 0xa177f0 (free-loop cleanup)
 * verify-opened and recorded HOST by the standing allocator decision
 * (raw alloc/dealloc = platform primitive); they are NOT landed here.
 * Body: push [ebp+8]; ecx=0xc379e0 (registry this, same string-keyed
 * hash registry the a172e0 caller 0xa68853 uses); call 0xa17180
 * (DECLARED-HOST registry leaf find) -> eax; test eax,eax (FULL
 * dword) / setne bl (found); test eax,eax / je 0xa178b0 (skip
 * release when zero); release via 0xa648b0 (cl=1, edx=found, 2 zero
 * stack args — the SAME pattern a172e0 uses at 0xa17562); mov al,bl
 * (return low byte 0/1; upper 24 bits caller-stale, same convention
 * as a15570/a15770/a172e0); SEH epilog; ret 4.
 * PURE law exported: found_gate — FULL-dword (test eax,eax), NOT a
 * byte gate; no byte gates anywhere in this body (discipline note:
 * byte gates would take uint32_t and mask & 0xff; NO uint8_t).
 * NEXT_VA 0x00a178d0 (declared-host leaf, stays host).
 * PE evidence: section-notes/render-shell-v60-chain/NOTES.md +
 * cpu-dump/00a17860.txt + census-callers-fixed.py
 * =========================================================================== */

enum { ISAAC_RENDER_SHELL_A17860_HOST_VA = 0x00a17860u };
enum { ISAAC_RENDER_SHELL_A17860_END_VA = 0x00a178c1u };
enum { ISAAC_RENDER_SHELL_A17860_NEXT_VA = 0x00a178d0u };
enum { ISAAC_RENDER_SHELL_A17860_CALLER_COUNT = 0xau };
enum { ISAAC_RENDER_SHELL_A17860_CALLER_FIRST_VA = 0x0060fb85u };
enum { ISAAC_RENDER_SHELL_A17860_CALLER_LAST_VA = 0x008f4635u };
enum { ISAAC_RENDER_SHELL_A17860_ADDR_TAKEN_COUNT = 0x0u };
enum { ISAAC_RENDER_SHELL_A17860_EAX_WRITES = 0x4u };
enum { ISAAC_RENDER_SHELL_A17860_STACK_ARGS = 0x1u };
enum { ISAAC_RENDER_SHELL_A17860_THIS_CALL = 0x0u };
enum { ISAAC_RENDER_SHELL_A17860_SEH_REG_VA = 0x00af0a10u };
enum { ISAAC_RENDER_SHELL_A17860_GS_COOKIE_VA = 0x00bf93b4u };
enum { ISAAC_RENDER_SHELL_A17860_REGISTRY_VA = 0x00c379e0u };
enum { ISAAC_RENDER_SHELL_A17860_FIND_FN_VA = 0x00a17180u };
enum { ISAAC_RENDER_SHELL_A17860_RELEASE_FN_VA = 0x00a648b0u };
enum { ISAAC_RENDER_SHELL_A17860_RELEASE_CL_VAL = 0x1u };
enum { ISAAC_RENDER_SHELL_A17860_RELEASE_ARG0 = 0x0u };
enum { ISAAC_RENDER_SHELL_A17860_RELEASE_ARG1 = 0x0u };

uint32_t isaac_render_shell_a17860_found_gate(uint32_t eax);
uint32_t isaac_render_shell_a17860_host_va(void);
uint32_t isaac_render_shell_a17860_end_va(void);
uint32_t isaac_render_shell_a17860_next_va(void);
uint32_t isaac_render_shell_a17860_caller_count(void);
uint32_t isaac_render_shell_a17860_caller_first_va(void);
uint32_t isaac_render_shell_a17860_caller_last_va(void);
uint32_t isaac_render_shell_a17860_addr_taken_count(void);
uint32_t isaac_render_shell_a17860_eax_writes(void);
uint32_t isaac_render_shell_a17860_stack_args(void);
uint32_t isaac_render_shell_a17860_this_call(void);
uint32_t isaac_render_shell_a17860_seh_reg_va(void);
uint32_t isaac_render_shell_a17860_gs_cookie_va(void);
uint32_t isaac_render_shell_a17860_registry_va(void);
uint32_t isaac_render_shell_a17860_find_fn_va(void);
uint32_t isaac_render_shell_a17860_release_fn_va(void);
uint32_t isaac_render_shell_a17860_release_cl_val(void);
uint32_t isaac_render_shell_a17860_release_arg0(void);
uint32_t isaac_render_shell_a17860_release_arg1(void);

/* ============================================================================
 * ABI v61: COLORMOD BAND (region-A carry-over, 0x407140..0x4074b0).
 *
 * The wave-23 band-3 census (update-v98-anm2-gapscan3,
 * update-v96-anm2-gapscan-detail §2/§4/§5) parked 15 OPEN bodies as
 * render-shell/generic carry-over: 0x407170 (256c ColorMod default-
 * init), 0x4071f0 (175c copy-if-not-same), 0x4073c0 (60c dword
 * getter), 0x4073b0 (38c byte getter), 0x4074b0 (34c getter) plus
 * 10 smaller pure helpers (0x407380, 0x407140, 0x4073a0, 0x407470,
 * 0x4074a0, 0x407320, 0x407220, 0x407370, 0x407440, 0x4072a0).
 * Caller counts are the lea-corrected ones (census-callers.py's
 * always-4-byte lea skip undercounted; corrected by the capstone
 * resync scan: 0x407170 = 256, 0x4074c0 = 170 - the latter is ANM2
 * HOST, exact ZHL constructor, NOT in this wave). This unit's own
 * resync-aware whole-.text census (census-colormod.py) reproduces
 * every count exactly.
 *   All bodies PURE leaves except: 0x407140 composes the v26
 * af0917_floor leaf (fld/fstp widen -> floor -> fstp narrow; floor
 * of a float32 is representable so narrowing never rounds); 0x407320
 * gates a HOST string copy-ctor 0x40cf50 (platform string family);
 * 0x407440 is a register-held fn-ptr dispatch loop (call ebx) ->
 * body stays platform/HOST, only the count gate + step add land.
 *   Identity/layout: 0x407170 writes the ColorMod identity
 * (4 x 1.0f tint at [0..0xc] + 7 x 0.0f at [0x10..0x28]) matching
 * the v21 COLOR_* consts; 0x4071f0 is the 44-byte (0x2c) copy with
 * the self-alias guard (cmp ecx,eax / je) + return-this, the guarded
 * twin of the v21 4071c0 copy; 0x4073b0 returns AL = p ? byte[p+0x34]
 * : 0 while EAX keeps the pointer's upper 24 bits on BOTH paths
 * (mov al / xor al) - the law reproduces the full EAX
 * ((p & 0xffffff00) | byte). 0x407380 is the SSO data-ptr select
 * (buf==0 -> empty literal 0xb1a4ec; UNSIGNED cap<0x10 -> buf;
 * else [buf]) - the jb row 0xffffffff discriminates vs signed.
 *   Byte-gate discipline: byte reads take uint32_t and mask & 0xff
 * (a4073b0_byte34, the a407320 SSO byte stores); NO uint8_t.
 *   ABI 60 was staked/landed by W24-F5 (A17860, chain); this band
 * lands 60 -> 61 (atomic if the laws land).
 *   PE evidence: section-notes/render-shell-v60-colormod/NOTES.md +
 * cpu-dump 00407140/00407170/004071f0/00407220/004072a0/00407320/
 * 0040733c/00407370/00407380/004073a0/004073b0/004073c4/00407440/
 * 00407480/004074a0/004074c0.txt + census-colormod.py
 * =========================================================================== */

enum { ISAAC_RENDER_SHELL_A407170_HOST_VA = 0x00407170u };
enum { ISAAC_RENDER_SHELL_A407170_END_VA = 0x004071bfu };
enum { ISAAC_RENDER_SHELL_A407170_NEXT_VA = 0x004071c0u };
enum { ISAAC_RENDER_SHELL_A407170_CALLER_COUNT = 0x100u };
enum { ISAAC_RENDER_SHELL_A407170_CALLER_FIRST_VA = 0x0040fc6eu };
enum { ISAAC_RENDER_SHELL_A407170_CALLER_LAST_VA = 0x009fdacau };
enum { ISAAC_RENDER_SHELL_A407170_ADDR_TAKEN_COUNT = 0x0u };
enum { ISAAC_RENDER_SHELL_A407170_EAX_WRITES = 0x1u };
enum { ISAAC_RENDER_SHELL_A407170_STACK_ARGS = 0x0u };
enum { ISAAC_RENDER_SHELL_A407170_THIS_CALL = 0x1u };
enum { ISAAC_RENDER_SHELL_A407170_TINT_BITS = 0x3f800000u };
enum { ISAAC_RENDER_SHELL_A407170_ZERO_COUNT = 0x7u };

enum { ISAAC_RENDER_SHELL_A4071F0_HOST_VA = 0x004071f0u };
enum { ISAAC_RENDER_SHELL_A4071F0_END_VA = 0x0040721eu };
enum { ISAAC_RENDER_SHELL_A4071F0_NEXT_VA = 0x00407220u };
enum { ISAAC_RENDER_SHELL_A4071F0_CALLER_COUNT = 0xafu };
enum { ISAAC_RENDER_SHELL_A4071F0_CALLER_FIRST_VA = 0x00411f60u };
enum { ISAAC_RENDER_SHELL_A4071F0_CALLER_LAST_VA = 0x009f40b2u };
enum { ISAAC_RENDER_SHELL_A4071F0_ADDR_TAKEN_COUNT = 0x0u };
enum { ISAAC_RENDER_SHELL_A4071F0_EAX_WRITES = 0x3u };
enum { ISAAC_RENDER_SHELL_A4071F0_STACK_ARGS = 0x1u };
enum { ISAAC_RENDER_SHELL_A4071F0_THIS_CALL = 0x1u };
enum { ISAAC_RENDER_SHELL_A4071F0_COLOR_FLOATS = 11u };

enum { ISAAC_RENDER_SHELL_A407220_HOST_VA = 0x00407220u };
enum { ISAAC_RENDER_SHELL_A407220_END_VA = 0x00407237u };
enum { ISAAC_RENDER_SHELL_A407220_NEXT_VA = 0x00407240u };
enum { ISAAC_RENDER_SHELL_A407220_CALLER_COUNT = 0x2u };
enum { ISAAC_RENDER_SHELL_A407220_CALLER_FIRST_VA = 0x0081d1c0u };
enum { ISAAC_RENDER_SHELL_A407220_CALLER_LAST_VA = 0x0081deb5u };
enum { ISAAC_RENDER_SHELL_A407220_ADDR_TAKEN_COUNT = 0x0u };
enum { ISAAC_RENDER_SHELL_A407220_EAX_WRITES = 0x1u };
enum { ISAAC_RENDER_SHELL_A407220_STACK_ARGS = 0x1u };
enum { ISAAC_RENDER_SHELL_A407220_THIS_CALL = 0x1u };
enum { ISAAC_RENDER_SHELL_A407220_ZERO_OFF = 0x10u };
enum { ISAAC_RENDER_SHELL_A407220_COPY_BYTES = 0x10u };

enum { ISAAC_RENDER_SHELL_A4072A0_HOST_VA = 0x004072a0u };
enum { ISAAC_RENDER_SHELL_A4072A0_END_VA = 0x004072a6u };
enum { ISAAC_RENDER_SHELL_A4072A0_NEXT_VA = 0x004072b0u };
enum { ISAAC_RENDER_SHELL_A4072A0_CALLER_COUNT = 0x1u };
enum { ISAAC_RENDER_SHELL_A4072A0_CALLER_FIRST_VA = 0x005ffb12u };
enum { ISAAC_RENDER_SHELL_A4072A0_CALLER_LAST_VA = 0x005ffb12u };
enum { ISAAC_RENDER_SHELL_A4072A0_ADDR_TAKEN_COUNT = 0x0u };
enum { ISAAC_RENDER_SHELL_A4072A0_EAX_WRITES = 0x0u };
enum { ISAAC_RENDER_SHELL_A4072A0_STACK_ARGS = 0x0u };
enum { ISAAC_RENDER_SHELL_A4072A0_THIS_CALL = 0x1u };
enum { ISAAC_RENDER_SHELL_A4072A0_FIELD_OFF = 0x1cu };

enum { ISAAC_RENDER_SHELL_A407140_HOST_VA = 0x00407140u };
enum { ISAAC_RENDER_SHELL_A407140_END_VA = 0x0040716eu };
enum { ISAAC_RENDER_SHELL_A407140_NEXT_VA = 0x00407170u };
enum { ISAAC_RENDER_SHELL_A407140_CALLER_COUNT = 0x8u };
enum { ISAAC_RENDER_SHELL_A407140_CALLER_FIRST_VA = 0x005e27a8u };
enum { ISAAC_RENDER_SHELL_A407140_CALLER_LAST_VA = 0x006c7964u };
enum { ISAAC_RENDER_SHELL_A407140_ADDR_TAKEN_COUNT = 0x0u };
enum { ISAAC_RENDER_SHELL_A407140_EAX_WRITES = 0x0u };
enum { ISAAC_RENDER_SHELL_A407140_STACK_ARGS = 0x0u };
enum { ISAAC_RENDER_SHELL_A407140_THIS_CALL = 0x0u };
enum { ISAAC_RENDER_SHELL_A407140_FLOOR_IAT_VA = 0x00af0917u };

enum { ISAAC_RENDER_SHELL_A407320_HOST_VA = 0x00407320u };
enum { ISAAC_RENDER_SHELL_A407320_END_VA = 0x00407364u };
enum { ISAAC_RENDER_SHELL_A407320_NEXT_VA = 0x00407370u };
enum { ISAAC_RENDER_SHELL_A407320_CALLER_COUNT = 0x3u };
enum { ISAAC_RENDER_SHELL_A407320_CALLER_FIRST_VA = 0x006c52e5u };
enum { ISAAC_RENDER_SHELL_A407320_CALLER_LAST_VA = 0x0080b629u };
enum { ISAAC_RENDER_SHELL_A407320_ADDR_TAKEN_COUNT = 0x0u };
enum { ISAAC_RENDER_SHELL_A407320_EAX_WRITES = 0x2u };
enum { ISAAC_RENDER_SHELL_A407320_STACK_ARGS = 0x1u };
enum { ISAAC_RENDER_SHELL_A407320_THIS_CALL = 0x1u };
enum { ISAAC_RENDER_SHELL_A407320_SSO_CAP = 0xfu };
enum { ISAAC_RENDER_SHELL_A407320_COPY_HOST_VA = 0x0040cf50u };

enum { ISAAC_RENDER_SHELL_A407370_HOST_VA = 0x00407370u };
enum { ISAAC_RENDER_SHELL_A407370_END_VA = 0x00407376u };
enum { ISAAC_RENDER_SHELL_A407370_NEXT_VA = 0x00407380u };
enum { ISAAC_RENDER_SHELL_A407370_CALLER_COUNT = 0x2u };
enum { ISAAC_RENDER_SHELL_A407370_CALLER_FIRST_VA = 0x005ff9dfu };
enum { ISAAC_RENDER_SHELL_A407370_CALLER_LAST_VA = 0x0080acedu };
enum { ISAAC_RENDER_SHELL_A407370_ADDR_TAKEN_COUNT = 0x0u };
enum { ISAAC_RENDER_SHELL_A407370_EAX_WRITES = 0x0u };
enum { ISAAC_RENDER_SHELL_A407370_STACK_ARGS = 0x0u };
enum { ISAAC_RENDER_SHELL_A407370_THIS_CALL = 0x1u };
enum { ISAAC_RENDER_SHELL_A407370_FIELD_OFF = 0x10u };

enum { ISAAC_RENDER_SHELL_A407380_HOST_VA = 0x00407380u };
enum { ISAAC_RENDER_SHELL_A407380_END_VA = 0x00407396u };
enum { ISAAC_RENDER_SHELL_A407380_NEXT_VA = 0x004073a0u };
enum { ISAAC_RENDER_SHELL_A407380_CALLER_COUNT = 0xdu };
enum { ISAAC_RENDER_SHELL_A407380_CALLER_FIRST_VA = 0x004c218eu };
enum { ISAAC_RENDER_SHELL_A407380_CALLER_LAST_VA = 0x00789542u };
enum { ISAAC_RENDER_SHELL_A407380_ADDR_TAKEN_COUNT = 0x0u };
enum { ISAAC_RENDER_SHELL_A407380_EAX_WRITES = 0x3u };
enum { ISAAC_RENDER_SHELL_A407380_STACK_ARGS = 0x0u };
enum { ISAAC_RENDER_SHELL_A407380_THIS_CALL = 0x1u };
enum { ISAAC_RENDER_SHELL_A407380_EMPTY_LITERAL_VA = 0x00b1a4ecu };
enum { ISAAC_RENDER_SHELL_A407380_CAP_LIM = 0x10u };

enum { ISAAC_RENDER_SHELL_A4073A0_HOST_VA = 0x004073a0u };
enum { ISAAC_RENDER_SHELL_A4073A0_END_VA = 0x004073a8u };
enum { ISAAC_RENDER_SHELL_A4073A0_NEXT_VA = 0x004073b0u };
enum { ISAAC_RENDER_SHELL_A4073A0_CALLER_COUNT = 0x7u };
enum { ISAAC_RENDER_SHELL_A4073A0_CALLER_FIRST_VA = 0x005c1c09u };
enum { ISAAC_RENDER_SHELL_A4073A0_CALLER_LAST_VA = 0x00787e75u };
enum { ISAAC_RENDER_SHELL_A4073A0_ADDR_TAKEN_COUNT = 0x0u };
enum { ISAAC_RENDER_SHELL_A4073A0_EAX_WRITES = 0x0u };
enum { ISAAC_RENDER_SHELL_A4073A0_STACK_ARGS = 0x0u };
enum { ISAAC_RENDER_SHELL_A4073A0_THIS_CALL = 0x1u };
enum { ISAAC_RENDER_SHELL_A4073A0_FIELD_OFF = 0x4u };

enum { ISAAC_RENDER_SHELL_A4073B0_HOST_VA = 0x004073b0u };
enum { ISAAC_RENDER_SHELL_A4073B0_END_VA = 0x004073beu };
enum { ISAAC_RENDER_SHELL_A4073B0_NEXT_VA = 0x004073c0u };
enum { ISAAC_RENDER_SHELL_A4073B0_CALLER_COUNT = 0x26u };
enum { ISAAC_RENDER_SHELL_A4073B0_CALLER_FIRST_VA = 0x00446670u };
enum { ISAAC_RENDER_SHELL_A4073B0_CALLER_LAST_VA = 0x00976d86u };
enum { ISAAC_RENDER_SHELL_A4073B0_ADDR_TAKEN_COUNT = 0x0u };
enum { ISAAC_RENDER_SHELL_A4073B0_EAX_WRITES = 0x1u };
enum { ISAAC_RENDER_SHELL_A4073B0_STACK_ARGS = 0x0u };
enum { ISAAC_RENDER_SHELL_A4073B0_THIS_CALL = 0x1u };
enum { ISAAC_RENDER_SHELL_A4073B0_FIELD_OFF = 0x34u };
enum { ISAAC_RENDER_SHELL_A4073B0_HIGH_MASK = 0xffffff00u };

enum { ISAAC_RENDER_SHELL_A4073C0_HOST_VA = 0x004073c0u };
enum { ISAAC_RENDER_SHELL_A4073C0_END_VA = 0x004073c4u };
enum { ISAAC_RENDER_SHELL_A4073C0_NEXT_VA = 0x004073d0u };
enum { ISAAC_RENDER_SHELL_A4073C0_CALLER_COUNT = 0x3cu };
enum { ISAAC_RENDER_SHELL_A4073C0_CALLER_FIRST_VA = 0x005b4783u };
enum { ISAAC_RENDER_SHELL_A4073C0_CALLER_LAST_VA = 0x0080b5d9u };
enum { ISAAC_RENDER_SHELL_A4073C0_ADDR_TAKEN_COUNT = 0x3u };
enum { ISAAC_RENDER_SHELL_A4073C0_ADDR_TAKEN_TABLE_VA = 0x0086b71bu };
enum { ISAAC_RENDER_SHELL_A4073C0_EAX_WRITES = 0x1u };
enum { ISAAC_RENDER_SHELL_A4073C0_STACK_ARGS = 0x0u };
enum { ISAAC_RENDER_SHELL_A4073C0_THIS_CALL = 0x1u };
enum { ISAAC_RENDER_SHELL_A4073C0_FIELD_OFF = 0x4u };

enum { ISAAC_RENDER_SHELL_A407440_HOST_VA = 0x00407440u };
enum { ISAAC_RENDER_SHELL_HOST_407440_VA = 0x00407440u }; /* fn-ptr dispatch host lease */
enum { ISAAC_RENDER_SHELL_A407440_END_VA = 0x00407466u };
enum { ISAAC_RENDER_SHELL_A407440_NEXT_VA = 0x00407470u };
enum { ISAAC_RENDER_SHELL_A407440_CALLER_COUNT = 0x1u };
enum { ISAAC_RENDER_SHELL_A407440_CALLER_FIRST_VA = 0x006f22e5u };
enum { ISAAC_RENDER_SHELL_A407440_CALLER_LAST_VA = 0x006f22e5u };
enum { ISAAC_RENDER_SHELL_A407440_ADDR_TAKEN_COUNT = 0x0u };
enum { ISAAC_RENDER_SHELL_A407440_EAX_WRITES = 0x0u };
enum { ISAAC_RENDER_SHELL_A407440_STACK_ARGS = 0x4u };
enum { ISAAC_RENDER_SHELL_A407440_THIS_CALL = 0x0u };
enum { ISAAC_RENDER_SHELL_A407440_BASE_OFF = 0x8u };
enum { ISAAC_RENDER_SHELL_A407440_STEP_OFF = 0xcu };
enum { ISAAC_RENDER_SHELL_A407440_COUNT_OFF = 0x10u };
enum { ISAAC_RENDER_SHELL_A407440_FN_OFF = 0x14u };

enum { ISAAC_RENDER_SHELL_A407470_HOST_VA = 0x00407470u };
enum { ISAAC_RENDER_SHELL_A407470_END_VA = 0x00407479u };
enum { ISAAC_RENDER_SHELL_A407470_NEXT_VA = 0x00407480u };
enum { ISAAC_RENDER_SHELL_A407470_CALLER_COUNT = 0x5u };
enum { ISAAC_RENDER_SHELL_A407470_CALLER_FIRST_VA = 0x005d5f16u };
enum { ISAAC_RENDER_SHELL_A407470_CALLER_LAST_VA = 0x006ca396u };
enum { ISAAC_RENDER_SHELL_A407470_ADDR_TAKEN_COUNT = 0x0u };
enum { ISAAC_RENDER_SHELL_A407470_EAX_WRITES = 0x0u };
enum { ISAAC_RENDER_SHELL_A407470_STACK_ARGS = 0x0u };
enum { ISAAC_RENDER_SHELL_A407470_THIS_CALL = 0x1u };
enum { ISAAC_RENDER_SHELL_A407470_FIELD_OFF = 0x7240u };

enum { ISAAC_RENDER_SHELL_A4074A0_HOST_VA = 0x004074a0u };
enum { ISAAC_RENDER_SHELL_A4074A0_END_VA = 0x004074a7u };
enum { ISAAC_RENDER_SHELL_A4074A0_NEXT_VA = 0x004074b0u };
enum { ISAAC_RENDER_SHELL_A4074A0_CALLER_COUNT = 0x3u };
enum { ISAAC_RENDER_SHELL_A4074A0_CALLER_FIRST_VA = 0x005b3becu };
enum { ISAAC_RENDER_SHELL_A4074A0_CALLER_LAST_VA = 0x005c02dcu };
enum { ISAAC_RENDER_SHELL_A4074A0_ADDR_TAKEN_COUNT = 0x0u };
enum { ISAAC_RENDER_SHELL_A4074A0_EAX_WRITES = 0x1u };
enum { ISAAC_RENDER_SHELL_A4074A0_STACK_ARGS = 0x0u };
enum { ISAAC_RENDER_SHELL_A4074A0_THIS_CALL = 0x1u };
enum { ISAAC_RENDER_SHELL_A4074A0_FIELD_OFF = 0x67758u };

enum { ISAAC_RENDER_SHELL_A4074B0_HOST_VA = 0x004074b0u };
enum { ISAAC_RENDER_SHELL_A4074B0_END_VA = 0x004074b7u };
enum { ISAAC_RENDER_SHELL_A4074B0_NEXT_VA = 0x004074c0u };
enum { ISAAC_RENDER_SHELL_A4074B0_CALLER_COUNT = 0x22u };
enum { ISAAC_RENDER_SHELL_A4074B0_CALLER_FIRST_VA = 0x005d6b78u };
enum { ISAAC_RENDER_SHELL_A4074B0_CALLER_LAST_VA = 0x0079d557u };
enum { ISAAC_RENDER_SHELL_A4074B0_ADDR_TAKEN_COUNT = 0x1u };
enum { ISAAC_RENDER_SHELL_A4074B0_ADDR_TAKEN_TABLE_VA = 0x0086d65bu };
enum { ISAAC_RENDER_SHELL_A4074B0_EAX_WRITES = 0x1u };
enum { ISAAC_RENDER_SHELL_A4074B0_STACK_ARGS = 0x0u };
enum { ISAAC_RENDER_SHELL_A4074B0_THIS_CALL = 0x1u };
enum { ISAAC_RENDER_SHELL_A4074B0_FIELD_OFF = 0x264f8u };

/* v62: Color RO/GO/BO fld getter trio (0x4072b0/0x4072c0/0x4072d0).
   Census this unit: 5/4/4 lea-corrected E8 callers, 0 E9 tails,
   1 addr-taken each (Lua kColorFields RO/GO/BO) — matched v61 band. */
enum { ISAAC_RENDER_SHELL_A4072B0_HOST_VA = 0x004072b0u };
enum { ISAAC_RENDER_SHELL_A4072B0_END_VA = 0x004072b4u };
enum { ISAAC_RENDER_SHELL_A4072B0_NEXT_VA = 0x004072c0u };
enum { ISAAC_RENDER_SHELL_A4072B0_CALLER_COUNT = 0x5u };
enum { ISAAC_RENDER_SHELL_A4072B0_CALLER_FIRST_VA = 0x005ef4f5u };
enum { ISAAC_RENDER_SHELL_A4072B0_CALLER_LAST_VA = 0x0080a78bu };
enum { ISAAC_RENDER_SHELL_A4072B0_ADDR_TAKEN_COUNT = 0x1u };
enum { ISAAC_RENDER_SHELL_A4072B0_ADDR_TAKEN_TABLE_VA = 0x008670deu };
enum { ISAAC_RENDER_SHELL_A4072B0_EAX_WRITES = 0x0u };
enum { ISAAC_RENDER_SHELL_A4072B0_STACK_ARGS = 0x0u };
enum { ISAAC_RENDER_SHELL_A4072B0_THIS_CALL = 0x1u };
enum { ISAAC_RENDER_SHELL_A4072B0_FIELD_OFF = 0x20u };

enum { ISAAC_RENDER_SHELL_A4072C0_HOST_VA = 0x004072c0u };
enum { ISAAC_RENDER_SHELL_A4072C0_END_VA = 0x004072c4u };
enum { ISAAC_RENDER_SHELL_A4072C0_NEXT_VA = 0x004072d0u };
enum { ISAAC_RENDER_SHELL_A4072C0_CALLER_COUNT = 0x4u };
enum { ISAAC_RENDER_SHELL_A4072C0_CALLER_FIRST_VA = 0x005ef483u };
enum { ISAAC_RENDER_SHELL_A4072C0_CALLER_LAST_VA = 0x006c9befu };
enum { ISAAC_RENDER_SHELL_A4072C0_ADDR_TAKEN_COUNT = 0x1u };
enum { ISAAC_RENDER_SHELL_A4072C0_ADDR_TAKEN_TABLE_VA = 0x008670f4u };
enum { ISAAC_RENDER_SHELL_A4072C0_EAX_WRITES = 0x0u };
enum { ISAAC_RENDER_SHELL_A4072C0_STACK_ARGS = 0x0u };
enum { ISAAC_RENDER_SHELL_A4072C0_THIS_CALL = 0x1u };
enum { ISAAC_RENDER_SHELL_A4072C0_FIELD_OFF = 0x24u };

enum { ISAAC_RENDER_SHELL_A4072D0_HOST_VA = 0x004072d0u };
enum { ISAAC_RENDER_SHELL_A4072D0_END_VA = 0x004072d4u };
enum { ISAAC_RENDER_SHELL_A4072D0_NEXT_VA = 0x004072e0u };
enum { ISAAC_RENDER_SHELL_A4072D0_CALLER_COUNT = 0x4u };
enum { ISAAC_RENDER_SHELL_A4072D0_CALLER_FIRST_VA = 0x005ef44cu };
enum { ISAAC_RENDER_SHELL_A4072D0_CALLER_LAST_VA = 0x006c9ba2u };
enum { ISAAC_RENDER_SHELL_A4072D0_ADDR_TAKEN_COUNT = 0x1u };
enum { ISAAC_RENDER_SHELL_A4072D0_ADDR_TAKEN_TABLE_VA = 0x0086710au };
enum { ISAAC_RENDER_SHELL_A4072D0_EAX_WRITES = 0x0u };
enum { ISAAC_RENDER_SHELL_A4072D0_STACK_ARGS = 0x0u };
enum { ISAAC_RENDER_SHELL_A4072D0_THIS_CALL = 0x1u };
enum { ISAAC_RENDER_SHELL_A4072D0_FIELD_OFF = 0x28u };

float* isaac_render_shell_a407170_init(float* dest);
uint32_t isaac_render_shell_a407170_tint_bits(void);
uint32_t isaac_render_shell_a4071f0_self_alias_gate(uint32_t dst, uint32_t src);
float* isaac_render_shell_a4071f0_copy(float* dest, const float* src);
void isaac_render_shell_a407220_copy16_zero10(float* dest, const float* src);
uint32_t isaac_render_shell_a407220_zero_off(void);
void isaac_render_shell_a4072a0_store1c(float* dest, float v);
uint32_t isaac_render_shell_a4072a0_field1c_off(void);
float isaac_render_shell_a407140_floor_f32(float x);
uint32_t isaac_render_shell_a407320_clear_gate(uint32_t data_ptr);
void isaac_render_shell_a407320_sso_zero(uint32_t dst);
uint32_t isaac_render_shell_a407320_sso_cap(void);
uint32_t isaac_render_shell_a407320_copy_host_va(void);

uint32_t isaac_render_shell_a407170_host_va(void);
uint32_t isaac_render_shell_a407170_end_va(void);
uint32_t isaac_render_shell_a407170_next_va(void);
uint32_t isaac_render_shell_a407170_caller_count(void);
uint32_t isaac_render_shell_a407170_caller_first_va(void);
uint32_t isaac_render_shell_a407170_caller_last_va(void);
uint32_t isaac_render_shell_a407170_addr_taken_count(void);
uint32_t isaac_render_shell_a407170_eax_writes(void);
uint32_t isaac_render_shell_a407170_stack_args(void);
uint32_t isaac_render_shell_a407170_this_call(void);

uint32_t isaac_render_shell_a4071f0_host_va(void);
uint32_t isaac_render_shell_a4071f0_end_va(void);
uint32_t isaac_render_shell_a4071f0_next_va(void);
uint32_t isaac_render_shell_a4071f0_caller_count(void);
uint32_t isaac_render_shell_a4071f0_caller_first_va(void);
uint32_t isaac_render_shell_a4071f0_caller_last_va(void);
uint32_t isaac_render_shell_a4071f0_addr_taken_count(void);
uint32_t isaac_render_shell_a4071f0_eax_writes(void);
uint32_t isaac_render_shell_a4071f0_stack_args(void);
uint32_t isaac_render_shell_a4071f0_this_call(void);

uint32_t isaac_render_shell_a407220_host_va(void);
uint32_t isaac_render_shell_a407220_end_va(void);
uint32_t isaac_render_shell_a407220_next_va(void);
uint32_t isaac_render_shell_a407220_caller_count(void);
uint32_t isaac_render_shell_a407220_caller_first_va(void);
uint32_t isaac_render_shell_a407220_caller_last_va(void);
uint32_t isaac_render_shell_a407220_addr_taken_count(void);
uint32_t isaac_render_shell_a407220_eax_writes(void);
uint32_t isaac_render_shell_a407220_stack_args(void);
uint32_t isaac_render_shell_a407220_this_call(void);

uint32_t isaac_render_shell_a4072a0_host_va(void);
uint32_t isaac_render_shell_a4072a0_end_va(void);
uint32_t isaac_render_shell_a4072a0_next_va(void);
uint32_t isaac_render_shell_a4072a0_caller_count(void);
uint32_t isaac_render_shell_a4072a0_caller_first_va(void);
uint32_t isaac_render_shell_a4072a0_caller_last_va(void);
uint32_t isaac_render_shell_a4072a0_addr_taken_count(void);
uint32_t isaac_render_shell_a4072a0_eax_writes(void);
uint32_t isaac_render_shell_a4072a0_stack_args(void);
uint32_t isaac_render_shell_a4072a0_this_call(void);

uint32_t isaac_render_shell_a407140_host_va(void);
uint32_t isaac_render_shell_a407140_end_va(void);
uint32_t isaac_render_shell_a407140_next_va(void);
uint32_t isaac_render_shell_a407140_caller_count(void);
uint32_t isaac_render_shell_a407140_caller_first_va(void);
uint32_t isaac_render_shell_a407140_caller_last_va(void);
uint32_t isaac_render_shell_a407140_addr_taken_count(void);
uint32_t isaac_render_shell_a407140_eax_writes(void);
uint32_t isaac_render_shell_a407140_stack_args(void);
uint32_t isaac_render_shell_a407140_this_call(void);

uint32_t isaac_render_shell_a407320_host_va(void);
uint32_t isaac_render_shell_a407320_end_va(void);
uint32_t isaac_render_shell_a407320_next_va(void);
uint32_t isaac_render_shell_a407320_caller_count(void);
uint32_t isaac_render_shell_a407320_caller_first_va(void);
uint32_t isaac_render_shell_a407320_caller_last_va(void);
uint32_t isaac_render_shell_a407320_addr_taken_count(void);
uint32_t isaac_render_shell_a407320_eax_writes(void);
uint32_t isaac_render_shell_a407320_stack_args(void);
uint32_t isaac_render_shell_a407320_this_call(void);

float isaac_render_shell_a407370_float10(uint32_t addr);
uint32_t isaac_render_shell_a407380_buf_null_gate(uint32_t buf);
uint32_t isaac_render_shell_a407380_cap_gate(uint32_t cap);
uint32_t isaac_render_shell_a407380_select(uint32_t buf, uint32_t cap, uint32_t data);
uint32_t isaac_render_shell_a407380_empty_literal_va(void);
uint32_t isaac_render_shell_a4073a0_null4(uint32_t v);
uint32_t isaac_render_shell_a4073b0_byte34(uint32_t p, uint32_t b34);
uint32_t isaac_render_shell_a4073b0_high_mask(void);
uint32_t isaac_render_shell_a4073c0_dword4(uint32_t addr);
uint32_t isaac_render_shell_a407440_count_gate(uint32_t count);
uint32_t isaac_render_shell_a407440_step_add(uint32_t base, uint32_t step);
float isaac_render_shell_a407470_float7240(uint32_t addr);
uint32_t isaac_render_shell_a4074a0_field_addr(uint32_t addr);
uint32_t isaac_render_shell_a4074b0_dword264f8(uint32_t addr);

uint32_t isaac_render_shell_a407370_host_va(void);
uint32_t isaac_render_shell_a407370_end_va(void);
uint32_t isaac_render_shell_a407370_next_va(void);
uint32_t isaac_render_shell_a407370_caller_count(void);
uint32_t isaac_render_shell_a407370_caller_first_va(void);
uint32_t isaac_render_shell_a407370_caller_last_va(void);
uint32_t isaac_render_shell_a407370_addr_taken_count(void);
uint32_t isaac_render_shell_a407370_eax_writes(void);
uint32_t isaac_render_shell_a407370_stack_args(void);
uint32_t isaac_render_shell_a407370_this_call(void);

uint32_t isaac_render_shell_a407380_host_va(void);
uint32_t isaac_render_shell_a407380_end_va(void);
uint32_t isaac_render_shell_a407380_next_va(void);
uint32_t isaac_render_shell_a407380_caller_count(void);
uint32_t isaac_render_shell_a407380_caller_first_va(void);
uint32_t isaac_render_shell_a407380_caller_last_va(void);
uint32_t isaac_render_shell_a407380_addr_taken_count(void);
uint32_t isaac_render_shell_a407380_eax_writes(void);
uint32_t isaac_render_shell_a407380_stack_args(void);
uint32_t isaac_render_shell_a407380_this_call(void);

uint32_t isaac_render_shell_a4073a0_host_va(void);
uint32_t isaac_render_shell_a4073a0_end_va(void);
uint32_t isaac_render_shell_a4073a0_next_va(void);
uint32_t isaac_render_shell_a4073a0_caller_count(void);
uint32_t isaac_render_shell_a4073a0_caller_first_va(void);
uint32_t isaac_render_shell_a4073a0_caller_last_va(void);
uint32_t isaac_render_shell_a4073a0_addr_taken_count(void);
uint32_t isaac_render_shell_a4073a0_eax_writes(void);
uint32_t isaac_render_shell_a4073a0_stack_args(void);
uint32_t isaac_render_shell_a4073a0_this_call(void);

uint32_t isaac_render_shell_a4073b0_host_va(void);
uint32_t isaac_render_shell_a4073b0_end_va(void);
uint32_t isaac_render_shell_a4073b0_next_va(void);
uint32_t isaac_render_shell_a4073b0_caller_count(void);
uint32_t isaac_render_shell_a4073b0_caller_first_va(void);
uint32_t isaac_render_shell_a4073b0_caller_last_va(void);
uint32_t isaac_render_shell_a4073b0_addr_taken_count(void);
uint32_t isaac_render_shell_a4073b0_eax_writes(void);
uint32_t isaac_render_shell_a4073b0_stack_args(void);
uint32_t isaac_render_shell_a4073b0_this_call(void);

uint32_t isaac_render_shell_a4073c0_host_va(void);
uint32_t isaac_render_shell_a4073c0_end_va(void);
uint32_t isaac_render_shell_a4073c0_next_va(void);
uint32_t isaac_render_shell_a4073c0_caller_count(void);
uint32_t isaac_render_shell_a4073c0_caller_first_va(void);
uint32_t isaac_render_shell_a4073c0_caller_last_va(void);
uint32_t isaac_render_shell_a4073c0_addr_taken_count(void);
uint32_t isaac_render_shell_a4073c0_eax_writes(void);
uint32_t isaac_render_shell_a4073c0_stack_args(void);
uint32_t isaac_render_shell_a4073c0_this_call(void);
uint32_t isaac_render_shell_a4073c0_addr_taken_table_va(void);

uint32_t isaac_render_shell_a407440_host_va(void);
uint32_t isaac_render_shell_a407440_end_va(void);
uint32_t isaac_render_shell_a407440_next_va(void);
uint32_t isaac_render_shell_a407440_caller_count(void);
uint32_t isaac_render_shell_a407440_caller_first_va(void);
uint32_t isaac_render_shell_a407440_caller_last_va(void);
uint32_t isaac_render_shell_a407440_addr_taken_count(void);
uint32_t isaac_render_shell_a407440_eax_writes(void);
uint32_t isaac_render_shell_a407440_stack_args(void);
uint32_t isaac_render_shell_a407440_this_call(void);

uint32_t isaac_render_shell_a407470_host_va(void);
uint32_t isaac_render_shell_a407470_end_va(void);
uint32_t isaac_render_shell_a407470_next_va(void);
uint32_t isaac_render_shell_a407470_caller_count(void);
uint32_t isaac_render_shell_a407470_caller_first_va(void);
uint32_t isaac_render_shell_a407470_caller_last_va(void);
uint32_t isaac_render_shell_a407470_addr_taken_count(void);
uint32_t isaac_render_shell_a407470_eax_writes(void);
uint32_t isaac_render_shell_a407470_stack_args(void);
uint32_t isaac_render_shell_a407470_this_call(void);

uint32_t isaac_render_shell_a4074a0_host_va(void);
uint32_t isaac_render_shell_a4074a0_end_va(void);
uint32_t isaac_render_shell_a4074a0_next_va(void);
uint32_t isaac_render_shell_a4074a0_caller_count(void);
uint32_t isaac_render_shell_a4074a0_caller_first_va(void);
uint32_t isaac_render_shell_a4074a0_caller_last_va(void);
uint32_t isaac_render_shell_a4074a0_addr_taken_count(void);
uint32_t isaac_render_shell_a4074a0_eax_writes(void);
uint32_t isaac_render_shell_a4074a0_stack_args(void);
uint32_t isaac_render_shell_a4074a0_this_call(void);

uint32_t isaac_render_shell_a4074b0_host_va(void);
uint32_t isaac_render_shell_a4074b0_end_va(void);
uint32_t isaac_render_shell_a4074b0_next_va(void);
uint32_t isaac_render_shell_a4074b0_caller_count(void);
uint32_t isaac_render_shell_a4074b0_caller_first_va(void);
uint32_t isaac_render_shell_a4074b0_caller_last_va(void);
uint32_t isaac_render_shell_a4074b0_addr_taken_count(void);
uint32_t isaac_render_shell_a4074b0_eax_writes(void);
uint32_t isaac_render_shell_a4074b0_stack_args(void);
uint32_t isaac_render_shell_a4074b0_this_call(void);
uint32_t isaac_render_shell_a4074b0_addr_taken_table_va(void);

/* ================= v62: Color RO/GO/BO fld getter trio
   (0x004072b0 +0x20 / 0x004072c0 +0x24 / 0x004072d0 +0x28 — region-A
   residue, wave-25 unit render-shell-v62-regiona). x87 float getters
   `fld dword ptr [ecx+off]; ret` (3 B each, 0 E8, 0 stores). Census
   (lea-corrected + capstone): 5/4/4 direct callers, 0 E9 tails, 1
   addr-taken each (Lua kColorFields RO/GO/BO tables @ 0x008670de /
   0x008670f4 / 0x0086710a — CALLERS not owners, v61 precedent).
   NEXT chain 0x4072b0 -> 0x4072c0 -> 0x4072d0 -> 0x4072e0 (v21 HOST
   blend). Region-A closure: the 15-body v61 band, the landed
   0x4071c0/0x4072e0 hosts and this trio close 0x407140..0x4074c0
   except 0x407440 (HOST pin) and 0x407490 (Lua-leased ScreenShake
   Offset addr getter, 0 callers — ledger row, NOT landed). */
float isaac_render_shell_a4072b0_float20(uint32_t addr);
float isaac_render_shell_a4072c0_float24(uint32_t addr);
float isaac_render_shell_a4072d0_float28(uint32_t addr);

uint32_t isaac_render_shell_a4072b0_host_va(void);
uint32_t isaac_render_shell_a4072b0_end_va(void);
uint32_t isaac_render_shell_a4072b0_next_va(void);
uint32_t isaac_render_shell_a4072b0_caller_count(void);
uint32_t isaac_render_shell_a4072b0_caller_first_va(void);
uint32_t isaac_render_shell_a4072b0_caller_last_va(void);
uint32_t isaac_render_shell_a4072b0_addr_taken_count(void);
uint32_t isaac_render_shell_a4072b0_addr_taken_table_va(void);
uint32_t isaac_render_shell_a4072b0_eax_writes(void);
uint32_t isaac_render_shell_a4072b0_stack_args(void);
uint32_t isaac_render_shell_a4072b0_this_call(void);
uint32_t isaac_render_shell_a4072b0_field_off(void);

uint32_t isaac_render_shell_a4072c0_host_va(void);
uint32_t isaac_render_shell_a4072c0_end_va(void);
uint32_t isaac_render_shell_a4072c0_next_va(void);
uint32_t isaac_render_shell_a4072c0_caller_count(void);
uint32_t isaac_render_shell_a4072c0_caller_first_va(void);
uint32_t isaac_render_shell_a4072c0_caller_last_va(void);
uint32_t isaac_render_shell_a4072c0_addr_taken_count(void);
uint32_t isaac_render_shell_a4072c0_addr_taken_table_va(void);
uint32_t isaac_render_shell_a4072c0_eax_writes(void);
uint32_t isaac_render_shell_a4072c0_stack_args(void);
uint32_t isaac_render_shell_a4072c0_this_call(void);
uint32_t isaac_render_shell_a4072c0_field_off(void);

uint32_t isaac_render_shell_a4072d0_host_va(void);
uint32_t isaac_render_shell_a4072d0_end_va(void);
uint32_t isaac_render_shell_a4072d0_next_va(void);
uint32_t isaac_render_shell_a4072d0_caller_count(void);
uint32_t isaac_render_shell_a4072d0_caller_first_va(void);
uint32_t isaac_render_shell_a4072d0_caller_last_va(void);
uint32_t isaac_render_shell_a4072d0_addr_taken_count(void);
uint32_t isaac_render_shell_a4072d0_addr_taken_table_va(void);
uint32_t isaac_render_shell_a4072d0_eax_writes(void);
uint32_t isaac_render_shell_a4072d0_stack_args(void);
uint32_t isaac_render_shell_a4072d0_this_call(void);
uint32_t isaac_render_shell_a4072d0_field_off(void);

/* ============================================================================
 * v63: 0x00a18230 band-start pure body (section-notes/
 * render-shell-v63-a18230/NOTES.md + census-a18230.json).
 *
 * Body: thiscall (this<ecx>, 0 stack args), 28 insns, 1 E8 (0xa14050 —
 * the family's OWN landed chain, v6/v31 laws) + 4 indirect IAT leaves
 * [0xc0f95c] x2 / [0xc0f960] x2, 10 memory stores, 2 branches. FULL-
 * dword gate `[this+0x68] != 0` selects ARM A (4 zero dwords -> IAT 0,
 * level 0x4100 -> IAT 1, 16-B copy of [this+8..0x17] -> IAT 0) vs
 * ARM B (level 0x4100 -> IAT 1); COMMON TAIL stores the constant pack
 * {0,1,0,1,0} at [this+0x20..0x30] (dword stores, machine order) and
 * calls the family's landed 0xa14050 chain with 1 stale-ecx stack arg.
 * 46 direct E8 callers (this unit, per-position-resync whole-.text
 * scan): first 0x006fbe73, last 0x00a62ae9, incl. the game_render_slice
 * always-host prolog sites 0x80eae1..0x80eb1b (callers-not-owners).
 * addr-taken 2: vtable slot 4 of BOTH 0xb82430 (0xb82440) and 0xb82600
 * (0xb82610) — the shared slot-4 vtable method. eax_writes 0, stack
 * args 0, this_call 1. NEXT 0xa182c0 (vtable slot 18, OPEN).
 *
 * Cross-family lease rows (comment markers, NO duplicate pins — grep
 * verified 0 pre-existing render-shell hits on all three ANM2 VAs):
 *   - 0x00407690 = ANM2 family LANDED v55 (construct_from_copy;
 *     ISAAC_ANM2_COPYCTOR_VA + plan/apply/layer-string laws + tests).
 *   - 0x00407ae0 = ANM2 family LANDED v53 (Isaac::SwapANM2;
 *     ISAAC_ANM2_SWAP_VA + isaac_anm2_swap_anm2 law + v53 tests).
 *   - 0x00407e90 = ANM2 family HOST (v53/v55 census-only: SEH teardown
 *     over SwapANM2 + Reset + dtors x2 + tidy x2; 14 callers).
 *   - 0x00a18300 + 0x00a19180 = game_render_slice family LEASE
 *     (ISAAC_GAME_RENDER_VA_RT_A18300 / VA_RT_A19180 + slice-step
 *     always-host prolog 0x80ea80..0x80eb1b; CONTINUE_AT_RT_POP_A19180
 *     = 20) — NOT render-shell landable this unit.
 * Byte-gate discipline: all scalar params uint32_t; NO uint8_t
 * variables (the gate is a FULL-dword cmp — no byte tests in body).
 * ============================================================================ */

enum { ISAAC_RENDER_SHELL_A18230_HOST_VA = 0x00a18230u };
enum { ISAAC_RENDER_SHELL_A18230_END_VA = 0x00a182b5u };
enum { ISAAC_RENDER_SHELL_A18230_NEXT_VA = 0x00a182c0u };
enum { ISAAC_RENDER_SHELL_A18230_CALLER_COUNT = 0x2eu };
enum { ISAAC_RENDER_SHELL_A18230_CALLER_FIRST_VA = 0x006fbe73u };
enum { ISAAC_RENDER_SHELL_A18230_CALLER_LAST_VA = 0x00a62ae9u };
enum { ISAAC_RENDER_SHELL_A18230_ADDR_TAKEN_COUNT = 0x2u };
enum { ISAAC_RENDER_SHELL_A18230_VTABLE_SLOT_VA_0 = 0x00b82440u };
enum { ISAAC_RENDER_SHELL_A18230_VTABLE_SLOT_VA_1 = 0x00b82610u };
enum { ISAAC_RENDER_SHELL_A18230_VTABLE_VA_0 = 0x00b82430u };
enum { ISAAC_RENDER_SHELL_A18230_VTABLE_VA_1 = 0x00b82600u };
enum { ISAAC_RENDER_SHELL_A18230_VTABLE_SLOT_IDX = 0x4u };
enum { ISAAC_RENDER_SHELL_A18230_EAX_WRITES = 0x0u };
enum { ISAAC_RENDER_SHELL_A18230_STACK_ARGS = 0x0u };
enum { ISAAC_RENDER_SHELL_A18230_THIS_CALL = 0x1u };
enum { ISAAC_RENDER_SHELL_A18230_GATE_OFF = 0x68u };
enum { ISAAC_RENDER_SHELL_A18230_IAT_VA_0 = 0x00c0f95cu };
enum { ISAAC_RENDER_SHELL_A18230_IAT_VA_1 = 0x00c0f960u };
enum { ISAAC_RENDER_SHELL_A18230_LOG_ARG = 0x4100u };
enum { ISAAC_RENDER_SHELL_A18230_ZERO_ARG_COUNT = 0x4u };
enum { ISAAC_RENDER_SHELL_A18230_COPY_OFF = 0x08u };
enum { ISAAC_RENDER_SHELL_A18230_COPY_BYTES = 0x10u };
enum { ISAAC_RENDER_SHELL_A18230_CHAIN_VA = 0x00a14050u };
enum { ISAAC_RENDER_SHELL_A18230_CHAIN_STACK_ARGS = 0x1u };

uint32_t isaac_render_shell_a18230_gate(uint32_t this_68);
uint32_t isaac_render_shell_a18230_pack_off(uint32_t idx);
uint32_t isaac_render_shell_a18230_pack_val(uint32_t idx);

uint32_t isaac_render_shell_a18230_host_va(void);
uint32_t isaac_render_shell_a18230_end_va(void);
uint32_t isaac_render_shell_a18230_next_va(void);
uint32_t isaac_render_shell_a18230_caller_count(void);
uint32_t isaac_render_shell_a18230_caller_first_va(void);
uint32_t isaac_render_shell_a18230_caller_last_va(void);
uint32_t isaac_render_shell_a18230_addr_taken_count(void);
uint32_t isaac_render_shell_a18230_vtable_slot_va_0(void);
uint32_t isaac_render_shell_a18230_vtable_slot_va_1(void);
uint32_t isaac_render_shell_a18230_vtable_va_0(void);
uint32_t isaac_render_shell_a18230_vtable_va_1(void);
uint32_t isaac_render_shell_a18230_vtable_slot_idx(void);
uint32_t isaac_render_shell_a18230_eax_writes(void);
uint32_t isaac_render_shell_a18230_stack_args(void);
uint32_t isaac_render_shell_a18230_this_call(void);
uint32_t isaac_render_shell_a18230_gate_off(void);
uint32_t isaac_render_shell_a18230_iat_va_0(void);
uint32_t isaac_render_shell_a18230_iat_va_1(void);
uint32_t isaac_render_shell_a18230_log_arg(void);
uint32_t isaac_render_shell_a18230_zero_arg_count(void);
uint32_t isaac_render_shell_a18230_copy_off(void);
uint32_t isaac_render_shell_a18230_copy_bytes(void);
uint32_t isaac_render_shell_a18230_chain_va(void);
uint32_t isaac_render_shell_a18230_chain_stack_args(void);

/* ============================================================================
 * ABI v64: vtable-slot method 0xa182c0..0xa182fb (vtable slot 18 of BOTH
 * 0xb82430 and 0xb82600; drefs 0xb82478/0xb82648 = slot 18). this-call
 * + 1 stack arg (ret 4). BYTE gate on the stack arg `[ebp+8] & 0xff != 0`
 * -> ARM A: .data FN-slot leaf [0xc1292c] + BTS bit 3 of [this+4]; ARM B:
 * leaf [0xc12928] + BTR bit 3 of [this+4]. Both arms pass the SAME hoisted
 * leaf arg 0x8db9 (push 0x8db9 before the branch; stdcall-shaped — no
 * caller cleanup after either call). Rest-state slot values: [0xc12928]
 * = 0xa35ca0, [0xc1292c] = 0xa36c60 — .data-initialized fn ptrs, typed-
 * host leaves (same treatment as v63 c0f95c/c0f960 IAT leaves). 0 E8
 * callers, addr-taken 2. eax_writes 2 (mov eax,[esi+4] per arm), stack
 * args 1, this_call 1. NEXT 0xa18300 (game_render_slice VA_RT_A18300
 * LEASE — stays typed-host).
 *
 * Byte-gate discipline: `isaac_render_shell_a182c0_gate` takes the FULL
 * stack arg as uint32_t and masks `& 0xffu` (PE: cmp byte ptr [ebp+8],0
 * / je ARM B) — NO uint8_t anywhere.
 *
 * HOST-3 final evidence rows (comment pins for the census tool; NOT
 * laws):
 *   - 0x00a19450 = loader HOST (pair loader; FULL pair-cache gate +
 *     flag 0x100 + signed gates; escalate IAT [0xb18884] x2 + init
 *     a69f60; 2 callers 0x925c9b/0xa18ee4; ret 4). Span ..0xa194fa.
 *   - 0x00a19dd0 = log wrapper HOST (only call a112c0 log; hook
 *     [0xc7de7c] = 0xa19dd0 installed by A18E90 at 0xa18eba; dref
 *     text 0xa18ec0). Span ..0xa19dea.
 *   - 0x00a19df0 = v58 tail-gate callee HOST (full body 0xa19df0..
 *     0xa1a2dc INCLUDING the post-first-ret arms 0xa1a2ab..0xa1a2c5 +
 *     0xa1a2c6..0xa1a2dc — NOT cut off; 25 E8s (a6ac80/a69f60 x8/
 *     a6a9b0 x2/a112c0 x3/a6af90/a5f090 x2/a18750 x1) + 21 ind calls;
 *     1 caller 0xa18f60). Span ..0xa1a2dc, next 0xa1a2e1.
 * ============================================================================ */

enum { ISAAC_RENDER_SHELL_A182C0_HOST_VA = 0x00a182c0u };
enum { ISAAC_RENDER_SHELL_A182C0_END_VA = 0x00a182fbu };
enum { ISAAC_RENDER_SHELL_A182C0_NEXT_VA = 0x00a18300u };
enum { ISAAC_RENDER_SHELL_A182C0_CALLER_COUNT = 0x0u };
enum { ISAAC_RENDER_SHELL_A182C0_ADDR_TAKEN_COUNT = 0x2u };
enum { ISAAC_RENDER_SHELL_A182C0_VTABLE_SLOT_VA_0 = 0x00b82478u };
enum { ISAAC_RENDER_SHELL_A182C0_VTABLE_SLOT_VA_1 = 0x00b82648u };
enum { ISAAC_RENDER_SHELL_A182C0_VTABLE_VA_0 = 0x00b82430u };
enum { ISAAC_RENDER_SHELL_A182C0_VTABLE_VA_1 = 0x00b82600u };
enum { ISAAC_RENDER_SHELL_A182C0_VTABLE_SLOT_IDX = 0x12u };
enum { ISAAC_RENDER_SHELL_A182C0_EAX_WRITES = 0x2u };
enum { ISAAC_RENDER_SHELL_A182C0_STACK_ARGS = 0x1u };
enum { ISAAC_RENDER_SHELL_A182C0_THISCALL = 0x1u };
enum { ISAAC_RENDER_SHELL_A182C0_LEAF_VA_0 = 0x00c12928u }; /* ARM B clear */
enum { ISAAC_RENDER_SHELL_A182C0_LEAF_VA_1 = 0x00c1292cu }; /* ARM A set */
enum { ISAAC_RENDER_SHELL_A182C0_LEAF_ARG = 0x8db9u };
enum { ISAAC_RENDER_SHELL_A182C0_FLAG_OFF = 0x4u };
enum { ISAAC_RENDER_SHELL_A182C0_FLAG_BIT = 0x3u };
enum { ISAAC_RENDER_SHELL_A182C0_ARG_OFF = 0x8u }; /* gate is [ebp+8] */
enum { ISAAC_RENDER_SHELL_HOST_A19450_VA = 0x00a19450u };
enum { ISAAC_RENDER_SHELL_HOST_A19DD0_VA = 0x00a19dd0u };
enum { ISAAC_RENDER_SHELL_HOST_A19DF0_VA = 0x00a19df0u };

uint32_t isaac_render_shell_a182c0_gate(uint32_t arg);
uint32_t isaac_render_shell_a182c0_flags_set(uint32_t flags);
uint32_t isaac_render_shell_a182c0_flags_clear(uint32_t flags);
uint32_t isaac_render_shell_a182c0_leaf_va(uint32_t arg);

uint32_t isaac_render_shell_a182c0_host_va(void);
uint32_t isaac_render_shell_a182c0_end_va(void);
uint32_t isaac_render_shell_a182c0_next_va(void);
uint32_t isaac_render_shell_a182c0_caller_count(void);
uint32_t isaac_render_shell_a182c0_addr_taken_count(void);
uint32_t isaac_render_shell_a182c0_vtable_slot_va_0(void);
uint32_t isaac_render_shell_a182c0_vtable_slot_va_1(void);
uint32_t isaac_render_shell_a182c0_vtable_va_0(void);
uint32_t isaac_render_shell_a182c0_vtable_va_1(void);
uint32_t isaac_render_shell_a182c0_vtable_slot_idx(void);
uint32_t isaac_render_shell_a182c0_eax_writes(void);
uint32_t isaac_render_shell_a182c0_stack_args(void);
uint32_t isaac_render_shell_a182c0_this_call(void);
uint32_t isaac_render_shell_a182c0_leaf_va_0(void);
uint32_t isaac_render_shell_a182c0_leaf_va_1(void);
uint32_t isaac_render_shell_a182c0_leaf_arg(void);
uint32_t isaac_render_shell_a182c0_flag_off(void);
uint32_t isaac_render_shell_a182c0_flag_bit(void);
uint32_t isaac_render_shell_a182c0_arg_off(void);
uint32_t isaac_render_shell_host_a19450_va(void);
uint32_t isaac_render_shell_host_a19dd0_va(void);
uint32_t isaac_render_shell_host_a19df0_va(void);

/* ============================================================================
 * ABI v65: vtable-slot method 0xa18460..0xa184d5 (vtable slot 22 of BOTH
 * 0xb82430 and 0xb82600; drefs 0xb82488/0xb82658 = slot 22, read-back =
 * 0xa18460). this-call + 3 float stack args (ret 0xc). Builds the 16-byte
 * pack {arg1, arg2, arg3, 1.0f} (movss [esp+0/4/8], mov [esp+0xc],
 * 0x3f800000), calls IAT leaf [0xc0f95c] (stdcall-shaped, no caller
 * cleanup; THE SAME leaf as v63 a18230 — rest value 0xa32770, typed-host),
 * then stores the same pack via one movups to [this+8..0x17] and zeroes
 * [this+0x18]. Leaf result never consumed; stores unconditional; 0 E8,
 * 0 branches, eax_writes 0. 0 E8 callers, addr-taken 2. NEXT 0xa184e0
 * (vtable slot 30, 6 FN leaves — OPEN, not this unit).
 *
 * Byte-gate discipline: all law params are uint32_t; the selector guards
 * use full-dword compares (PE has no byte test in this body) — NO uint8_t.
 *
 * Evidence: section-notes/render-shell-v65-a18460/NOTES.md.
 * ============================================================================ */
enum { ISAAC_RENDER_SHELL_A18460_HOST_VA = 0x00a18460u };
enum { ISAAC_RENDER_SHELL_A18460_END_VA = 0x00a184d5u };
enum { ISAAC_RENDER_SHELL_A18460_NEXT_VA = 0x00a184e0u };
enum { ISAAC_RENDER_SHELL_A18460_CALLER_COUNT = 0x0u };
enum { ISAAC_RENDER_SHELL_A18460_ADDR_TAKEN_COUNT = 0x2u };
enum { ISAAC_RENDER_SHELL_A18460_VTABLE_SLOT_VA_0 = 0x00b82488u };
enum { ISAAC_RENDER_SHELL_A18460_VTABLE_SLOT_VA_1 = 0x00b82658u };
enum { ISAAC_RENDER_SHELL_A18460_VTABLE_VA_0 = 0x00b82430u };
enum { ISAAC_RENDER_SHELL_A18460_VTABLE_VA_1 = 0x00b82600u };
enum { ISAAC_RENDER_SHELL_A18460_VTABLE_SLOT_IDX = 0x16u };
enum { ISAAC_RENDER_SHELL_A18460_EAX_WRITES = 0x0u };
enum { ISAAC_RENDER_SHELL_A18460_STACK_ARGS = 0x3u };
enum { ISAAC_RENDER_SHELL_A18460_THISCALL = 0x1u };
enum { ISAAC_RENDER_SHELL_A18460_RET_ADJ = 0xcu };
enum { ISAAC_RENDER_SHELL_A18460_LEAF_VA = 0x00c0f95cu };
enum { ISAAC_RENDER_SHELL_A18460_LEAF_ARG_COUNT = 0x4u };
enum { ISAAC_RENDER_SHELL_A18460_DEST_OFF = 0x8u };
enum { ISAAC_RENDER_SHELL_A18460_DEST_BYTES = 0x10u };
enum { ISAAC_RENDER_SHELL_A18460_ZERO_OFF = 0x18u };
enum { ISAAC_RENDER_SHELL_A18460_PACK_ONE_BITS = 0x3f800000u };

uint32_t isaac_render_shell_a18460_pack_off(uint32_t idx);
uint32_t isaac_render_shell_a18460_pack_val(uint32_t idx, uint32_t a1,
                                            uint32_t a2, uint32_t a3);
uint32_t isaac_render_shell_a18460_arg_off(uint32_t n);

uint32_t isaac_render_shell_a18460_host_va(void);
uint32_t isaac_render_shell_a18460_end_va(void);
uint32_t isaac_render_shell_a18460_next_va(void);
uint32_t isaac_render_shell_a18460_caller_count(void);
uint32_t isaac_render_shell_a18460_addr_taken_count(void);
uint32_t isaac_render_shell_a18460_vtable_slot_va_0(void);
uint32_t isaac_render_shell_a18460_vtable_slot_va_1(void);
uint32_t isaac_render_shell_a18460_vtable_va_0(void);
uint32_t isaac_render_shell_a18460_vtable_va_1(void);
uint32_t isaac_render_shell_a18460_vtable_slot_idx(void);
uint32_t isaac_render_shell_a18460_eax_writes(void);
uint32_t isaac_render_shell_a18460_stack_args(void);
uint32_t isaac_render_shell_a18460_this_call(void);
uint32_t isaac_render_shell_a18460_ret_adj(void);
uint32_t isaac_render_shell_a18460_leaf_va(void);
uint32_t isaac_render_shell_a18460_leaf_arg_count(void);
uint32_t isaac_render_shell_a18460_dest_off(void);
uint32_t isaac_render_shell_a18460_dest_bytes(void);
uint32_t isaac_render_shell_a18460_zero_off(void);
uint32_t isaac_render_shell_a18460_pack_one_bits(void);

/* ============================================================================
 * ABI v66: caller-bearing float body 0xa18530..0xa186e6 (5 E8 callers
 * 0xa18387/0xa1844b/0xa19a65/0xa19c8c/0xa24a0f; NOT addr-taken) — the next
 * caller-bearing pure body in band order after v65's a18460. this-call ret
 * body with GS prolog/epilog (cookie [0xbf93b4] xor ebp -> 0xaef12b CRT
 * __security_check_cookie, typed-host) and 3 typed-host .data FN-slot
 * leaves ([0xc0f918]/[0xc0f91c]/[0xc0f824]; rest 0xa3c690/0xa4c250/
 * 0xa4bef0). Plan (2 BYTE gates `test byte [ecx+4],0x20`): P1
 * edx=[this+0x68] != 0 && flag20 clear -> denominators = the
 * cvtdq2pd/addsd(0xbacb00 magic +0/2^32 by sign bit)/cvtpd2ps idiom of
 * u32 [edx+0x14] (denom A) / [edx+0x10] (denom B); P2 edx != 0 && flag20
 * set -> denom A = f32 [this+0xa0], denom B = f32 [this+0x9c]; P3 edx == 0
 * -> same this floats but the x0/x1 denominator is negated via
 * subss 0-da. Common tail: x1 = signflip(x1+0.0) / den_a,
 * x2 = signflip(x2+0.0) / db, x0 = 2.0f / den_a, x6 = 2.0f / db; the
 * float pack {xmm6,0,0,0,0,0,0,xmm0,0,0,0,0,0,0,0xba83126f,0,xmm2,xmm1,
 * 0x80000000,0x3f800000} is built at ebp-0x48 (PACK_BASE_OFF 0x48) and
 * consumed by the 3 typed-host leaf calls ("Transform" fmt 0xb62c40);
 * leaf results never feed arithmetic. Global [0xc379b8] null -> direct
 * GS epilog (no stores). NEXT 0xa186f0 (vtable slot 31 — OPEN).
 *
 * Also lands the two trivial vtable-B size stubs 0xa19340/0xa193c0
 * (mov eax,imm; ret — slots 12/13 of 0xb82600, drefs 0xb82630/0xb82634)
 * and closes the five HOST rows 0xa18750/0xa18a20/0xa19530/0xa19600/
 * 0xa196b0 with host_va pins (a112c0 family log / a69f60 init-notify /
 * unresolved vtable calls — HOST per the v63/v64 ledger; spans and
 * caller counts in NOTES). 0xa184e0 FN-leaf stub skipped this unit (zero
 * informative value); 0xa18aa0 SEH stays host.
 *
 * Byte-gate discipline: all law params are uint32_t; flag gates mask
 * &0xffu explicitly (PE byte test) — NO uint8_t. Float values cross as
 * 32-bit patterns; the math mirrors the PE instruction by instruction
 * (addss +0.0 normalization before the xorps sign flip matters for -0.0
 * inputs and is modeled; divss = C float division).
 *
 * Evidence: section-notes/render-shell-v66-a18530/NOTES.md.
 * ============================================================================ */
enum { ISAAC_RENDER_SHELL_A18530_HOST_VA = 0x00a18530u };
enum { ISAAC_RENDER_SHELL_A18530_END_VA = 0x00a186e6u };
enum { ISAAC_RENDER_SHELL_A18530_NEXT_VA = 0x00a186f0u };
enum { ISAAC_RENDER_SHELL_A18530_CALLER_COUNT = 0x5u };
enum { ISAAC_RENDER_SHELL_A18530_CALLER_FIRST_VA = 0x00a18387u };
enum { ISAAC_RENDER_SHELL_A18530_CALLER_LAST_VA = 0x00a24a0fu };
enum { ISAAC_RENDER_SHELL_A18530_ADDR_TAKEN_COUNT = 0x0u };
enum { ISAAC_RENDER_SHELL_A18530_EAX_WRITES = 0x0u };
enum { ISAAC_RENDER_SHELL_A18530_STACK_ARGS = 0x0u };
enum { ISAAC_RENDER_SHELL_A18530_THISCALL = 0x1u };
enum { ISAAC_RENDER_SHELL_A18530_GS_VA = 0x00aef12bu };
enum { ISAAC_RENDER_SHELL_A18530_GS_COOKIE_VA = 0x00bf93b4u };
enum { ISAAC_RENDER_SHELL_A18530_GLOBAL_VA = 0x00c379b8u };
enum { ISAAC_RENDER_SHELL_A18530_LEAF_VA_0 = 0x00c0f918u };
enum { ISAAC_RENDER_SHELL_A18530_LEAF_VA_1 = 0x00c0f91cu };
enum { ISAAC_RENDER_SHELL_A18530_LEAF_VA_2 = 0x00c0f824u };
enum { ISAAC_RENDER_SHELL_A18530_EDX_OFF = 0x68u };
enum { ISAAC_RENDER_SHELL_A18530_FLAG_OFF = 0x4u };
enum { ISAAC_RENDER_SHELL_A18530_FLAG_BIT = 0x20u };
enum { ISAAC_RENDER_SHELL_A18530_DEN_A_OFF = 0xa0u };
enum { ISAAC_RENDER_SHELL_A18530_DEN_B_OFF = 0x9cu };
enum { ISAAC_RENDER_SHELL_A18530_INT_A_OFF = 0x14u };
enum { ISAAC_RENDER_SHELL_A18530_INT_B_OFF = 0x10u };
enum { ISAAC_RENDER_SHELL_A18530_U32F_TABLE_VA = 0x00bacb00u };
enum { ISAAC_RENDER_SHELL_A18530_U32F_TABLE_HI = 0x41f00000u };
enum { ISAAC_RENDER_SHELL_A18530_U32F_TABLE_LO = 0x00000000u };
enum { ISAAC_RENDER_SHELL_A18530_U32F_SIGN_SHIFT = 0x1fu };
enum { ISAAC_RENDER_SHELL_A18530_F32_TWO_BITS = 0x40000000u };
enum { ISAAC_RENDER_SHELL_A18530_PACK_ONE_BITS = 0x3f800000u };
enum { ISAAC_RENDER_SHELL_A18530_PACK_NEGZERO_BITS = 0x80000000u };
enum { ISAAC_RENDER_SHELL_A18530_PACK_MILLI_BITS = 0xba83126fu };
enum { ISAAC_RENDER_SHELL_A18530_PACK_BASE_OFF = 0x48u };
enum { ISAAC_RENDER_SHELL_A19340_HOST_VA = 0x00a19340u };
enum { ISAAC_RENDER_SHELL_A19340_END_VA = 0x00a19346u };
enum { ISAAC_RENDER_SHELL_A19340_NEXT_VA = 0x00a19346u };
enum { ISAAC_RENDER_SHELL_A19340_CALLER_COUNT = 0x7u };
enum { ISAAC_RENDER_SHELL_A19340_ADDR_TAKEN_COUNT = 0x1u };
enum { ISAAC_RENDER_SHELL_A19340_VTABLE_SLOT_VA = 0x00b82630u };
enum { ISAAC_RENDER_SHELL_A19340_VTABLE_VA = 0x00b82600u };
enum { ISAAC_RENDER_SHELL_A19340_VTABLE_SLOT_IDX = 0xcu };
enum { ISAAC_RENDER_SHELL_A19340_EAX_WRITES = 0x1u };
enum { ISAAC_RENDER_SHELL_A193C0_HOST_VA = 0x00a193c0u };
enum { ISAAC_RENDER_SHELL_A193C0_END_VA = 0x00a193c6u };
enum { ISAAC_RENDER_SHELL_A193C0_NEXT_VA = 0x00a193c6u };
enum { ISAAC_RENDER_SHELL_A193C0_CALLER_COUNT = 0x6u };
enum { ISAAC_RENDER_SHELL_A193C0_ADDR_TAKEN_COUNT = 0x1u };
enum { ISAAC_RENDER_SHELL_A193C0_VTABLE_SLOT_VA = 0x00b82634u };
enum { ISAAC_RENDER_SHELL_A193C0_VTABLE_VA = 0x00b82600u };
enum { ISAAC_RENDER_SHELL_A193C0_VTABLE_SLOT_IDX = 0xdu };
enum { ISAAC_RENDER_SHELL_A193C0_EAX_WRITES = 0x1u };
/* HOST rows closed with pins this unit (v64 HOST-3 shape). */
enum { ISAAC_RENDER_SHELL_HOST_A18750_VA = 0x00a18750u };
enum { ISAAC_RENDER_SHELL_HOST_A18A20_VA = 0x00a18a20u };
enum { ISAAC_RENDER_SHELL_HOST_A19530_VA = 0x00a19530u };
enum { ISAAC_RENDER_SHELL_HOST_A19600_VA = 0x00a19600u };
enum { ISAAC_RENDER_SHELL_HOST_A196B0_VA = 0x00a196b0u };

uint32_t isaac_render_shell_a18530_plan(uint32_t edx, uint32_t flags);
uint32_t isaac_render_shell_a18530_u32f_bits(uint32_t v);
uint32_t isaac_render_shell_a18530_den_a_bits(uint32_t plan,
                                              uint32_t int_14,
                                              uint32_t a0_bits);
uint32_t isaac_render_shell_a18530_den_b_bits(uint32_t plan,
                                              uint32_t int_10,
                                              uint32_t b9c_bits);
uint32_t isaac_render_shell_a18530_x1_bits(uint32_t plan,
                                           uint32_t den_a_bits);
uint32_t isaac_render_shell_a18530_x2_bits(uint32_t den_b_bits);
uint32_t isaac_render_shell_a18530_x0_bits(uint32_t plan,
                                           uint32_t den_a_bits);
uint32_t isaac_render_shell_a18530_x6_bits(uint32_t den_b_bits);
uint32_t isaac_render_shell_a18530_neg_bits(uint32_t bits);
uint32_t isaac_render_shell_a19340_size(void);
uint32_t isaac_render_shell_a193c0_size(void);

uint32_t isaac_render_shell_a18530_host_va(void);
uint32_t isaac_render_shell_a18530_end_va(void);
uint32_t isaac_render_shell_a18530_next_va(void);
uint32_t isaac_render_shell_a18530_caller_count(void);
uint32_t isaac_render_shell_a18530_caller_first_va(void);
uint32_t isaac_render_shell_a18530_caller_last_va(void);
uint32_t isaac_render_shell_a18530_addr_taken_count(void);
uint32_t isaac_render_shell_a18530_eax_writes(void);
uint32_t isaac_render_shell_a18530_stack_args(void);
uint32_t isaac_render_shell_a18530_this_call(void);
uint32_t isaac_render_shell_a18530_gs_va(void);
uint32_t isaac_render_shell_a18530_gs_cookie_va(void);
uint32_t isaac_render_shell_a18530_global_va(void);
uint32_t isaac_render_shell_a18530_leaf_va_0(void);
uint32_t isaac_render_shell_a18530_leaf_va_1(void);
uint32_t isaac_render_shell_a18530_leaf_va_2(void);
uint32_t isaac_render_shell_a18530_edx_off(void);
uint32_t isaac_render_shell_a18530_flag_off(void);
uint32_t isaac_render_shell_a18530_flag_bit(void);
uint32_t isaac_render_shell_a18530_den_a_off(void);
uint32_t isaac_render_shell_a18530_den_b_off(void);
uint32_t isaac_render_shell_a19340_host_va(void);
uint32_t isaac_render_shell_a19340_end_va(void);
uint32_t isaac_render_shell_a19340_next_va(void);
uint32_t isaac_render_shell_a19340_caller_count(void);
uint32_t isaac_render_shell_a19340_addr_taken_count(void);
uint32_t isaac_render_shell_a19340_vtable_slot_va(void);
uint32_t isaac_render_shell_a19340_vtable_va(void);
uint32_t isaac_render_shell_a19340_vtable_slot_idx(void);
uint32_t isaac_render_shell_a19340_eax_writes(void);
uint32_t isaac_render_shell_a193c0_host_va(void);
uint32_t isaac_render_shell_a193c0_end_va(void);
uint32_t isaac_render_shell_a193c0_next_va(void);
uint32_t isaac_render_shell_a193c0_caller_count(void);
uint32_t isaac_render_shell_a193c0_addr_taken_count(void);
uint32_t isaac_render_shell_a193c0_vtable_slot_va(void);
uint32_t isaac_render_shell_a193c0_vtable_va(void);
uint32_t isaac_render_shell_a193c0_vtable_slot_idx(void);
uint32_t isaac_render_shell_a193c0_eax_writes(void);
uint32_t isaac_render_shell_host_a18750_va(void);
uint32_t isaac_render_shell_host_a18a20_va(void);
uint32_t isaac_render_shell_host_a19530_va(void);
uint32_t isaac_render_shell_host_a19600_va(void);
uint32_t isaac_render_shell_host_a196b0_va(void);

/* ============================================================================
 * ABI v67: vtable-slot band rest (ABI 66 base, v66 handoff) — closes the
 * render-shell a1xxxx band 0xa18230..0xa1a000 vtable surface.
 *
 * LAND PURE: 0xa19bc0..0xa19bef (vtable B 0xb82600 slot 31, dref
 * 0xb8267c; 0 E8 callers proven) — the B-twin of the HOST 0xa186f0:
 * BYTE gate `test byte [this+4],0x40` selects the f32 pair base
 * (DAT 0xc7b640 / this+0xa4), cvttss2si truncation of both floats
 * (NaN/±inf/out-of-range [-2^31,2^31) -> integer indefinite
 * 0x80000000), pass-throughs [this+0xc8]/[this+0xcc], one typed-host
 * FN-slot leaf [0xc0f920]. Laws: a19bc0_src_sel (byte gate),
 * a19bc0_trunc_bits (cvttss2si exact).
 *
 * LAND layout-getters-only (v58 A18E10 precedent): 0xa18dc0..0xa18de6
 * (canonical scalar-deleting-destructor, vtable B slot 0 dref
 * 0xb82600; calls LANDED A18E10 @ 0xa18dc6 — its only direct E8
 * caller — then sized free 0xf8 via 0xaef15c when (arg0 & 1); ret 4)
 * and 0xa18df0..0xa18e08 (member dtor leaf: reset [this] via
 * 0xa1a500 + sized free [this] 0x10 via 0xaef15c; 8 E9 tail-call
 * sites 0xb1110d/0xb1111b/0xb11129/0xb11743/0xb1174d/0xb11757/
 * 0xb11d4d/0xb11d5b). Both are call-chain bodies (no laws, v59).
 *
 * HOST rows closed with pins (v64 HOST-3 shape; 0 E8 callers each —
 * vtable-borne, proven by whole-.text census): 0xa186f0 (vtable A
 * 0xb82430 slot 31, dref 0xb824ac; 2 unresolved vtable dispatches
 * slots +0x30/+0x34 — slot 12/13 read-backs 0xaf05d3 stubs on A vs
 * LANDED a19340/a193c0 on B), 0xa188f0 (vtable slots 25 of BOTH
 * vtables, drefs 0xb82494/0xb82664; family log 0xa112c0 on the
 * default arm + 4 E8s to the v66-HOST a18a20; 5-arm jmp table
 * 0xa18984 {0x8006,0x800a,0x800b,0x8007,0x8008} -> leaf c0f944 +
 * 4x a18a20 dispatch -> leaf c0f948, ret 0x14. ZHL: exact 10-byte
 * prolog match for `ANM2::ReplaceSpritesheet(int LayerId,
 * std_string&)` REFUTED — observed signature is 5 stack args ret
 * 0x14 with 4 integer selectors + selector-0..4 arm table, receiver
 * is the flag-family vtable slot 25, not an ANM2; address-stable
 * name kept), 0xa189a0 (vtable slots 29 of BOTH vtables, drefs
 * 0xb824a4/0xb82674; global [0xc379b8] receiver with family log
 * 0xa112c0 on the null arm + 2 vtable dispatches slots +0x20/+0x24
 * on the global; 1 E9 tail site 0xa12a70), 0xa19130 (vtable B slot
 * 2, dref 0xb82608; direct callees a13060 vector-clear + a6af90
 * init-notify are host bodies), 0xa19b60 (vtable B slot 30, dref
 * 0xb82678; E8 callee 0xa1a470 is host: a69f60 init-notify chain).
 *
 * 0xa18aa0 SEH stays host per the v63/v64 ledger; games-render
 * VA_RT leases 0xa18300/0xa19180 stay; 0xa19bf0 closed as a HOST
 * pin this unit (v68: global-object 0xc798e0 listener-broadcast
 * body — arg gates, glob stores, runtime fn-pointer IND loop, the
 * a19bc0 twin pack, E8 a18750/a18530; end 0xa19c97, next 0xa19ca0;
 * evidence: section-notes/render-shell-v68-a19bf0/NOTES.md).
 * Byte-gate discipline: uint32 params, &0xffu masks, NO
 * uint8_t. Evidence: section-notes/render-shell-v67-bandrest/NOTES.md
 * + disasm-v67.txt + census-v67-bandrest.json.
 * ============================================================================ */
enum { ISAAC_RENDER_SHELL_A19BC0_HOST_VA = 0x00a19bc0u };
enum { ISAAC_RENDER_SHELL_A19BC0_END_VA = 0x00a19befu };
enum { ISAAC_RENDER_SHELL_A19BC0_NEXT_VA = 0x00a19bf0u };
enum { ISAAC_RENDER_SHELL_A19BC0_CALLER_COUNT = 0x0u };
enum { ISAAC_RENDER_SHELL_A19BC0_ADDR_TAKEN_COUNT = 0x1u };
enum { ISAAC_RENDER_SHELL_A19BC0_VTABLE_SLOT_VA = 0x00b8267cu };
enum { ISAAC_RENDER_SHELL_A19BC0_VTABLE_VA = 0x00b82600u };
enum { ISAAC_RENDER_SHELL_A19BC0_VTABLE_SLOT_IDX = 0x1fu };
enum { ISAAC_RENDER_SHELL_A19BC0_EAX_WRITES = 0x2u };
enum { ISAAC_RENDER_SHELL_A19BC0_STACK_ARGS = 0x0u };
enum { ISAAC_RENDER_SHELL_A19BC0_THISCALL = 0x1u };
enum { ISAAC_RENDER_SHELL_A19BC0_FLAG_OFF = 0x4u };
enum { ISAAC_RENDER_SHELL_A19BC0_FLAG_BIT = 0x40u };
enum { ISAAC_RENDER_SHELL_A19BC0_SRC_OFF = 0xa4u };
enum { ISAAC_RENDER_SHELL_A19BC0_SRC_DEFAULT_VA = 0x00c7b640u };
enum { ISAAC_RENDER_SHELL_A19BC0_LEAF_VA = 0x00c0f920u };
enum { ISAAC_RENDER_SHELL_A19BC0_ARG2_OFF = 0xc8u };
enum { ISAAC_RENDER_SHELL_A19BC0_ARG3_OFF = 0xccu };
enum { ISAAC_RENDER_SHELL_A18DC0_HOST_VA = 0x00a18dc0u };
enum { ISAAC_RENDER_SHELL_A18DC0_END_VA = 0x00a18de6u };
enum { ISAAC_RENDER_SHELL_A18DC0_NEXT_VA = 0x00a18df0u };
enum { ISAAC_RENDER_SHELL_A18DC0_CALLER_COUNT = 0x0u };
enum { ISAAC_RENDER_SHELL_A18DC0_ADDR_TAKEN_COUNT = 0x1u };
enum { ISAAC_RENDER_SHELL_A18DC0_VTABLE_SLOT_VA = 0x00b82600u };
enum { ISAAC_RENDER_SHELL_A18DC0_VTABLE_VA = 0x00b82600u };
enum { ISAAC_RENDER_SHELL_A18DC0_VTABLE_SLOT_IDX = 0x0u };
enum { ISAAC_RENDER_SHELL_A18DC0_STACK_ARGS = 0x1u };
enum { ISAAC_RENDER_SHELL_A18DC0_THISCALL = 0x1u };
enum { ISAAC_RENDER_SHELL_A18DC0_EAX_WRITES = 0x1u };
enum { ISAAC_RENDER_SHELL_A18DC0_DTOR_VA = 0x00a18e10u };
enum { ISAAC_RENDER_SHELL_A18DC0_FREE_FN_VA = 0x00aef15cu };
enum { ISAAC_RENDER_SHELL_A18DC0_FREE_SIZE = 0xf8u };
enum { ISAAC_RENDER_SHELL_A18DC0_FLAG_OFF = 0x8u };
enum { ISAAC_RENDER_SHELL_A18DC0_FLAG_BIT = 0x1u };
enum { ISAAC_RENDER_SHELL_A18DF0_HOST_VA = 0x00a18df0u };
enum { ISAAC_RENDER_SHELL_A18DF0_END_VA = 0x00a18e08u };
enum { ISAAC_RENDER_SHELL_A18DF0_NEXT_VA = 0x00a18e10u };
enum { ISAAC_RENDER_SHELL_A18DF0_CALLER_COUNT = 0x8u };
enum { ISAAC_RENDER_SHELL_A18DF0_CALLER_FIRST_VA = 0x00b1110du };
enum { ISAAC_RENDER_SHELL_A18DF0_CALLER_LAST_VA = 0x00b11d5bu };
enum { ISAAC_RENDER_SHELL_A18DF0_ADDR_TAKEN_COUNT = 0x0u };
enum { ISAAC_RENDER_SHELL_A18DF0_EAX_WRITES = 0x0u };
enum { ISAAC_RENDER_SHELL_A18DF0_STACK_ARGS = 0x0u };
enum { ISAAC_RENDER_SHELL_A18DF0_THISCALL = 0x1u };
enum { ISAAC_RENDER_SHELL_A18DF0_RESET_FN_VA = 0x00a1a500u };
enum { ISAAC_RENDER_SHELL_A18DF0_FREE_FN_VA = 0x00aef15cu };
enum { ISAAC_RENDER_SHELL_A18DF0_FREE_SIZE = 0x10u };
enum { ISAAC_RENDER_SHELL_A18DF0_DEREF_OFF = 0x0u };
/* HOST rows closed with pins this unit (v64 HOST-3 shape). */
enum { ISAAC_RENDER_SHELL_HOST_A186F0_VA = 0x00a186f0u };
enum { ISAAC_RENDER_SHELL_HOST_A188F0_VA = 0x00a188f0u };
enum { ISAAC_RENDER_SHELL_HOST_A189A0_VA = 0x00a189a0u };
enum { ISAAC_RENDER_SHELL_HOST_A19130_VA = 0x00a19130u };
enum { ISAAC_RENDER_SHELL_HOST_A19B60_VA = 0x00a19b60u };
/* v68: global-object 0xc798e0 listener-broadcast body (end
   0xa19c97, next 0xa19ca0; 0 E8 callers, sole reach = runtime slot
   store @ 0xa1a187; evidence render-shell-v68-a19bf0/). */
enum { ISAAC_RENDER_SHELL_HOST_A19BF0_VA = 0x00a19bf0u };
/* v69: twin + third-listener bodies (0 E8 callers each; sole reach =
   runtime slot stores @ 0xa1a1b1 (+0x270) / 0xa1a26b (+0x280) in the
   0xc798e0-object ctor family; evidence render-shell-v69-a19ca0/).
   0xa19ca0 SEH frame, cdecl 3 args, 2nd list head glob+0xe0, bit8
   gate, glob+0xd0/+0xd4 stores, flag40 cmove pack, leaf c0f920, no
   a18750/a18530 tail (end 0xa19d3c, next 0xa19d40).
   0xa19d40 SEH frame, cdecl 2 args, bit11 gate + (arg1==1)?-1:-2
   pack into E8 a5f090 (host) + IND b186a0, 3rd list head glob+0xe8
   (end 0xa19dc5, next 0xa19dd0). */
enum { ISAAC_RENDER_SHELL_HOST_A19CA0_VA = 0x00a19ca0u };
enum { ISAAC_RENDER_SHELL_HOST_A19D40_VA = 0x00a19d40u };
/* v69 band-close census rows: a1xxxx band 0xa18230..0xa1a000 fully
   closed (0xa1a000 boundary is interior to the a19df0 host body
   0xa19df0..0xa1a2dc; no candidate starts at the boundary). */
enum { ISAAC_RENDER_SHELL_A19CA0_END_VA = 0x00a19d3cu };
enum { ISAAC_RENDER_SHELL_A19CA0_NEXT_VA = 0x00a19d40u };
enum { ISAAC_RENDER_SHELL_A19D40_END_VA = 0x00a19dc5u };
enum { ISAAC_RENDER_SHELL_A19D40_NEXT_VA = 0x00a19dd0u };
enum { ISAAC_RENDER_SHELL_A1XXXX_BAND_START_VA = 0x00a18230u };
enum { ISAAC_RENDER_SHELL_A1XXXX_BAND_END_VA = 0x00a1a000u };
enum { ISAAC_RENDER_SHELL_A1XXXX_BAND_OPEN_BODIES = 0x0u };
enum { ISAAC_RENDER_SHELL_A1XXXX_BAND_HOST_ROWS = 0x6u };

uint32_t isaac_render_shell_a19bc0_src_sel(uint32_t flags);
uint32_t isaac_render_shell_a19bc0_trunc_bits(uint32_t f32_bits);
uint32_t isaac_render_shell_a19bc0_host_va(void);
uint32_t isaac_render_shell_a19bc0_end_va(void);
uint32_t isaac_render_shell_a19bc0_next_va(void);
uint32_t isaac_render_shell_a19bc0_caller_count(void);
uint32_t isaac_render_shell_a19bc0_addr_taken_count(void);
uint32_t isaac_render_shell_a19bc0_vtable_slot_va(void);
uint32_t isaac_render_shell_a19bc0_vtable_va(void);
uint32_t isaac_render_shell_a19bc0_vtable_slot_idx(void);
uint32_t isaac_render_shell_a19bc0_eax_writes(void);
uint32_t isaac_render_shell_a19bc0_stack_args(void);
uint32_t isaac_render_shell_a19bc0_this_call(void);
uint32_t isaac_render_shell_a19bc0_flag_off(void);
uint32_t isaac_render_shell_a19bc0_flag_bit(void);
uint32_t isaac_render_shell_a19bc0_src_off(void);
uint32_t isaac_render_shell_a19bc0_src_default_va(void);
uint32_t isaac_render_shell_a19bc0_leaf_va(void);
uint32_t isaac_render_shell_a19bc0_arg2_off(void);
uint32_t isaac_render_shell_a19bc0_arg3_off(void);
uint32_t isaac_render_shell_a18dc0_host_va(void);
uint32_t isaac_render_shell_a18dc0_end_va(void);
uint32_t isaac_render_shell_a18dc0_next_va(void);
uint32_t isaac_render_shell_a18dc0_caller_count(void);
uint32_t isaac_render_shell_a18dc0_addr_taken_count(void);
uint32_t isaac_render_shell_a18dc0_vtable_slot_va(void);
uint32_t isaac_render_shell_a18dc0_vtable_va(void);
uint32_t isaac_render_shell_a18dc0_vtable_slot_idx(void);
uint32_t isaac_render_shell_a18dc0_stack_args(void);
uint32_t isaac_render_shell_a18dc0_this_call(void);
uint32_t isaac_render_shell_a18dc0_eax_writes(void);
uint32_t isaac_render_shell_a18dc0_dtor_va(void);
uint32_t isaac_render_shell_a18dc0_free_fn_va(void);
uint32_t isaac_render_shell_a18dc0_free_size(void);
uint32_t isaac_render_shell_a18dc0_flag_off(void);
uint32_t isaac_render_shell_a18dc0_flag_bit(void);
uint32_t isaac_render_shell_a18df0_host_va(void);
uint32_t isaac_render_shell_a18df0_end_va(void);
uint32_t isaac_render_shell_a18df0_next_va(void);
uint32_t isaac_render_shell_a18df0_caller_count(void);
uint32_t isaac_render_shell_a18df0_caller_first_va(void);
uint32_t isaac_render_shell_a18df0_caller_last_va(void);
uint32_t isaac_render_shell_a18df0_addr_taken_count(void);
uint32_t isaac_render_shell_a18df0_eax_writes(void);
uint32_t isaac_render_shell_a18df0_stack_args(void);
uint32_t isaac_render_shell_a18df0_this_call(void);
uint32_t isaac_render_shell_a18df0_reset_fn_va(void);
uint32_t isaac_render_shell_a18df0_free_fn_va(void);
uint32_t isaac_render_shell_a18df0_free_size(void);
uint32_t isaac_render_shell_a18df0_deref_off(void);
uint32_t isaac_render_shell_host_a186f0_va(void);
uint32_t isaac_render_shell_host_a188f0_va(void);
uint32_t isaac_render_shell_host_a189a0_va(void);
uint32_t isaac_render_shell_host_a19130_va(void);
uint32_t isaac_render_shell_host_a19b60_va(void);
uint32_t isaac_render_shell_host_a19bf0_va(void);
uint32_t isaac_render_shell_host_a19ca0_va(void);
uint32_t isaac_render_shell_host_a19d40_va(void);
uint32_t isaac_render_shell_a19ca0_end_va(void);
uint32_t isaac_render_shell_a19ca0_next_va(void);
uint32_t isaac_render_shell_a19d40_end_va(void);
uint32_t isaac_render_shell_a19d40_next_va(void);
uint32_t isaac_render_shell_a1xxxx_band_start_va(void);
uint32_t isaac_render_shell_a1xxxx_band_end_va(void);
uint32_t isaac_render_shell_a1xxxx_band_open_bodies(void);
uint32_t isaac_render_shell_a1xxxx_band_host_rows(void);

/* ============================================================================
 * ABI v69: FontSettings band 0xa1a160..0xa1a600 — six PURE bodies landed +
 * three HOST rows + band census rows closed (evidence:
 * section-notes/render-shell-v69-a1a540/NOTES.md).
 *
 * LAND PURE (0 E8 each; whole-.text raw byte-scan, E8+E9 channels):
 *   A1A540 0xa1a540..0xa1a579 -- FontSettings::constructor() (ZHL exact;
 *     thiscall, ret, returns this). Stores 7-field layout: +0x00
 *     0x00000000 (alignment), +0x04 0x0000ffff (maxChars, word,
 *     unlimited), +0x08 0x00000000 (wrap/trunc mode), +0x0c 0x3f800000
 *     (scale 1.0f), +0x10 0xffffffff, +0x14 0x00000000, +0x18
 *     0x00000000 (stored twice at 0xa1a540/0xa1a572). 15 direct E8
 *     callers 0x430656..0x9b8312 (0x430656: lea ecx,[ebp-0x48]; call;
 *     mov esi,eax — stack ctor, eax==this); 0 addr-taken.
 *   A1A580 0xa1a580..0xa1a5bc -- FontSettings::constructor(alignment)
 *     cdecl 1 arg ret 4: [ebp+8] dword -> +0x00; same 6 remaining
 *     defaults as A1A540; returns this. 6 direct E8 callers
 *     0x6fc4b1..0x9c53bb; 0 addr-taken.
 *   A1A5C0 0xa1a5c0..0xa1a5c9 -- SetAlignment (Lua-registered, name
 *     0xb702d8; push-imm32 addr-taken 0x866db2): cdecl 1 arg ret 4,
 *     [ebp+8] -> [ecx+0x00]; eax passthrough = arg.
 *   A1A5D0 0xa1a5d0..0xa1a5dc -- SetMaxCharacters (name 0xb702b0;
 *     addr-taken 0x866ddc): cdecl 1 arg ret 4, WORD store
 *     `mov [ecx+4],ax` (mask 0xffff).
 *   A1A5E0 0xa1a5e0..0xa1a5e4 -- GetMaxCharacters (name 0xb70394;
 *     addr-taken 0x866df1): thiscall, `mov ax,[ecx+4]; ret`; law
 *     result = low16 (0xffff mask).
 *   A1A5F0 0xa1a5f0..0xa1a5f7 -- IsAutoWrapEnabled (name 0xb7036c;
 *     addr-taken 0x866e1b): thiscall, `cmp dword [ecx+8],1; sete al`.
 * Same-family registration neighbours EnableTruncation 0xa1a600 /
 * IsTruncationEnabled 0xa1a620 / setter 0xa1a630 are the NEXT
 * sub-band (OPEN; a1a640 SEH ctor + a1a6f0 dtor + a1a730 SEH host).
 *
 * HOST rows closed with pins (v64 HOST-3 shape; E8+globals/runtime
 * IND bodies — no laws):
 *   A1A2E0 0xa1a2e0..0xa1a460 -- list/rect walk query ([0xc73ca4]/
 *     [0xc73ca8], IND [0xc736ec]/[0xc736fc], [this+0xd0]/[0xd4]
 *     window). 2 direct E8 (0x925d0e, 0xa196e8). ZHL prolog match
 *     `EntityList::render_sort` NOT relied on (generic prolog; body
 *     is a window query, not a sort).
 *   A1A470 0xa1a470..0xa1a4f4 -- FontSettings-family init+notify
 *     (cdecl 1 byte arg ret 4; E8 a69f60 chain, IND [0xb18884]/
 *     [0xb18258]/[eax+0x234]/[0xb184fc], family log 0xba1098;
 *     vtable 0xb825e8 pushed to [0xb184fc] lookup). 2 direct E8
 *     (0x925dd9, 0xa19b6c).
 *   A1A500 0xa1a500..0xa1a532 -- reset helper (the A18E10/A18DF0
 *     documented `reset 0xa1a500`): clears [edx+4] tail slot, walks
 *     list head [edx], per node zeroes +0x8/+0xc and sized-frees
 *     0x10 bytes via 0xaef15c (host allocator). 28 direct E8.
 *
 * Band census rows: 0xa1a160..0xa1a600 fully closed this unit (start
 * interior to the a19df0 host body, no candidate at 0xa1a160):
 * OPEN 0 / HOST 3 / PURE 6. NEXT band 0xa1a600.. (a1a600/a1a620/
 * a1a630 pure-shaped + a1a640/a1a6f0/a1a730 host) — OPEN.
 *
 * Byte-gate discipline: all law params are uint32_t; NO uint8_t (these
 * bodies have no PE byte tests; selector guards use full-dword
 * compares; word accessors mask & 0xffffu explicitly). Evidence:
 * section-notes/render-shell-v69-a1a540/NOTES.md.
 * ============================================================================ */
enum { ISAAC_RENDER_SHELL_A1A540_HOST_VA = 0x00a1a540u };
enum { ISAAC_RENDER_SHELL_A1A540_END_VA = 0x00a1a57au };
enum { ISAAC_RENDER_SHELL_A1A540_NEXT_VA = 0x00a1a580u };
enum { ISAAC_RENDER_SHELL_A1A540_CALLER_COUNT = 0x0fu };
enum { ISAAC_RENDER_SHELL_A1A540_CALLER_FIRST_VA = 0x00430656u };
enum { ISAAC_RENDER_SHELL_A1A540_CALLER_LAST_VA = 0x009b8312u };
enum { ISAAC_RENDER_SHELL_A1A540_ADDR_TAKEN_COUNT = 0x0u };
enum { ISAAC_RENDER_SHELL_A1A540_EAX_WRITES = 0x1u };
enum { ISAAC_RENDER_SHELL_A1A540_STACK_ARGS = 0x0u };
enum { ISAAC_RENDER_SHELL_A1A540_THISCALL = 0x1u };
enum { ISAAC_RENDER_SHELL_A1A540_FIELD_COUNT = 0x7u };
enum { ISAAC_RENDER_SHELL_A1A540_ALIGNMENT_OFF = 0x00u };
enum { ISAAC_RENDER_SHELL_A1A540_MAX_CHARS_OFF = 0x04u };
enum { ISAAC_RENDER_SHELL_A1A540_MODE_OFF = 0x08u };
enum { ISAAC_RENDER_SHELL_A1A540_SCALE_OFF = 0x0cu };
enum { ISAAC_RENDER_SHELL_A1A540_UNK10_OFF = 0x10u };
enum { ISAAC_RENDER_SHELL_A1A540_UNK14_OFF = 0x14u };
enum { ISAAC_RENDER_SHELL_A1A540_UNK18_OFF = 0x18u };
enum { ISAAC_RENDER_SHELL_A1A540_MAX_CHARS_DEFAULT = 0x0000ffffu };
enum { ISAAC_RENDER_SHELL_A1A540_SCALE_DEFAULT_BITS = 0x3f800000u };
enum { ISAAC_RENDER_SHELL_A1A540_UNK10_DEFAULT = 0xffffffffu };
enum { ISAAC_RENDER_SHELL_A1A580_HOST_VA = 0x00a1a580u };
enum { ISAAC_RENDER_SHELL_A1A580_END_VA = 0x00a1a5bfu };
enum { ISAAC_RENDER_SHELL_A1A580_NEXT_VA = 0x00a1a5c0u };
enum { ISAAC_RENDER_SHELL_A1A580_CALLER_COUNT = 0x6u };
enum { ISAAC_RENDER_SHELL_A1A580_CALLER_FIRST_VA = 0x006fc4b1u };
enum { ISAAC_RENDER_SHELL_A1A580_CALLER_LAST_VA = 0x009c53bbu };
enum { ISAAC_RENDER_SHELL_A1A580_ADDR_TAKEN_COUNT = 0x0u };
enum { ISAAC_RENDER_SHELL_A1A580_EAX_WRITES = 0x1u };
enum { ISAAC_RENDER_SHELL_A1A580_STACK_ARGS = 0x1u };
enum { ISAAC_RENDER_SHELL_A1A580_THISCALL = 0x1u };
enum { ISAAC_RENDER_SHELL_A1A580_FIELD_COUNT = 0x7u };
enum { ISAAC_RENDER_SHELL_A1A580_ARG_OFF = 0x00u };
enum { ISAAC_RENDER_SHELL_A1A5C0_HOST_VA = 0x00a1a5c0u };
enum { ISAAC_RENDER_SHELL_A1A5C0_END_VA = 0x00a1a5ccu };
enum { ISAAC_RENDER_SHELL_A1A5C0_NEXT_VA = 0x00a1a5d0u };
enum { ISAAC_RENDER_SHELL_A1A5C0_CALLER_COUNT = 0x0u };
enum { ISAAC_RENDER_SHELL_A1A5C0_ADDR_TAKEN_COUNT = 0x1u };
enum { ISAAC_RENDER_SHELL_A1A5C0_ADDR_TAKEN_SITE_VA = 0x00866db2u };
enum { ISAAC_RENDER_SHELL_A1A5C0_EAX_WRITES = 0x1u };
enum { ISAAC_RENDER_SHELL_A1A5C0_STACK_ARGS = 0x1u };
enum { ISAAC_RENDER_SHELL_A1A5C0_THISCALL = 0x1u };
enum { ISAAC_RENDER_SHELL_A1A5C0_DEST_OFF = 0x00u };
enum { ISAAC_RENDER_SHELL_A1A5D0_HOST_VA = 0x00a1a5d0u };
enum { ISAAC_RENDER_SHELL_A1A5D0_END_VA = 0x00a1a5dfu };
enum { ISAAC_RENDER_SHELL_A1A5D0_NEXT_VA = 0x00a1a5e0u };
enum { ISAAC_RENDER_SHELL_A1A5D0_CALLER_COUNT = 0x0u };
enum { ISAAC_RENDER_SHELL_A1A5D0_ADDR_TAKEN_COUNT = 0x1u };
enum { ISAAC_RENDER_SHELL_A1A5D0_ADDR_TAKEN_SITE_VA = 0x00866ddcu };
enum { ISAAC_RENDER_SHELL_A1A5D0_EAX_WRITES = 0x0u };
enum { ISAAC_RENDER_SHELL_A1A5D0_STACK_ARGS = 0x1u };
enum { ISAAC_RENDER_SHELL_A1A5D0_THISCALL = 0x1u };
enum { ISAAC_RENDER_SHELL_A1A5D0_DEST_OFF = 0x04u };
enum { ISAAC_RENDER_SHELL_A1A5D0_WORD_MASK = 0x0000ffffu };
enum { ISAAC_RENDER_SHELL_A1A5E0_HOST_VA = 0x00a1a5e0u };
enum { ISAAC_RENDER_SHELL_A1A5E0_END_VA = 0x00a1a5e5u };
enum { ISAAC_RENDER_SHELL_A1A5E0_NEXT_VA = 0x00a1a5f0u };
enum { ISAAC_RENDER_SHELL_A1A5E0_CALLER_COUNT = 0x0u };
enum { ISAAC_RENDER_SHELL_A1A5E0_ADDR_TAKEN_COUNT = 0x1u };
enum { ISAAC_RENDER_SHELL_A1A5E0_ADDR_TAKEN_SITE_VA = 0x00866df1u };
enum { ISAAC_RENDER_SHELL_A1A5E0_EAX_WRITES = 0x1u };
enum { ISAAC_RENDER_SHELL_A1A5E0_STACK_ARGS = 0x0u };
enum { ISAAC_RENDER_SHELL_A1A5E0_THISCALL = 0x1u };
enum { ISAAC_RENDER_SHELL_A1A5E0_SRC_OFF = 0x04u };
enum { ISAAC_RENDER_SHELL_A1A5E0_WORD_MASK = 0x0000ffffu };
enum { ISAAC_RENDER_SHELL_A1A5F0_HOST_VA = 0x00a1a5f0u };
enum { ISAAC_RENDER_SHELL_A1A5F0_END_VA = 0x00a1a5f8u };
enum { ISAAC_RENDER_SHELL_A1A5F0_NEXT_VA = 0x00a1a600u };
enum { ISAAC_RENDER_SHELL_A1A5F0_CALLER_COUNT = 0x0u };
enum { ISAAC_RENDER_SHELL_A1A5F0_ADDR_TAKEN_COUNT = 0x1u };
enum { ISAAC_RENDER_SHELL_A1A5F0_ADDR_TAKEN_SITE_VA = 0x00866e1bu };
enum { ISAAC_RENDER_SHELL_A1A5F0_EAX_WRITES = 0x1u };
enum { ISAAC_RENDER_SHELL_A1A5F0_STACK_ARGS = 0x0u };
enum { ISAAC_RENDER_SHELL_A1A5F0_THISCALL = 0x1u };
enum { ISAAC_RENDER_SHELL_A1A5F0_CMP_OFF = 0x08u };
enum { ISAAC_RENDER_SHELL_A1A5F0_CMP_VAL = 0x1u };
/* HOST rows closed with pins this unit (v64 HOST-3 shape). */
enum { ISAAC_RENDER_SHELL_HOST_A1A2E0_VA = 0x00a1a2e0u };
enum { ISAAC_RENDER_SHELL_HOST_A1A2E0_END_VA = 0x00a1a461u };
enum { ISAAC_RENDER_SHELL_HOST_A1A2E0_NEXT_VA = 0x00a1a470u };
enum { ISAAC_RENDER_SHELL_HOST_A1A2E0_CALLER_COUNT = 0x2u };
enum { ISAAC_RENDER_SHELL_HOST_A1A2E0_CALLER_FIRST_VA = 0x00925d0eu };
enum { ISAAC_RENDER_SHELL_HOST_A1A2E0_CALLER_LAST_VA = 0x00a196e8u };
enum { ISAAC_RENDER_SHELL_HOST_A1A2E0_ADDR_TAKEN_COUNT = 0x0u };
enum { ISAAC_RENDER_SHELL_HOST_A1A470_VA = 0x00a1a470u };
enum { ISAAC_RENDER_SHELL_HOST_A1A470_END_VA = 0x00a1a4f7u };
enum { ISAAC_RENDER_SHELL_HOST_A1A470_NEXT_VA = 0x00a1a500u };
enum { ISAAC_RENDER_SHELL_HOST_A1A470_CALLER_COUNT = 0x2u };
enum { ISAAC_RENDER_SHELL_HOST_A1A470_CALLER_FIRST_VA = 0x00925dd9u };
enum { ISAAC_RENDER_SHELL_HOST_A1A470_CALLER_LAST_VA = 0x00a19b6cu };
enum { ISAAC_RENDER_SHELL_HOST_A1A470_ADDR_TAKEN_COUNT = 0x0u };
enum { ISAAC_RENDER_SHELL_HOST_A1A500_VA = 0x00a1a500u };
enum { ISAAC_RENDER_SHELL_HOST_A1A500_END_VA = 0x00a1a533u };
enum { ISAAC_RENDER_SHELL_HOST_A1A500_NEXT_VA = 0x00a1a540u };
enum { ISAAC_RENDER_SHELL_HOST_A1A500_CALLER_COUNT = 0x1cu };
enum { ISAAC_RENDER_SHELL_HOST_A1A500_CALLER_FIRST_VA = 0x00a18df5u };
enum { ISAAC_RENDER_SHELL_HOST_A1A500_CALLER_LAST_VA = 0x00b16fbbu };
enum { ISAAC_RENDER_SHELL_HOST_A1A500_ADDR_TAKEN_COUNT = 0x0u };
/* v69 band census rows: 0xa1a160..0xa1a600 fully closed (start
   interior to the a19df0 host body; no candidate at 0xa1a160;
   0xa1a600 boundary = START of the next-body a1a600, OPEN). */
enum { ISAAC_RENDER_SHELL_A1A160_BAND_START_VA = 0x00a1a160u };
enum { ISAAC_RENDER_SHELL_A1A160_BAND_END_VA = 0x00a1a600u };
enum { ISAAC_RENDER_SHELL_A1A160_BAND_OPEN_BODIES = 0x0u };
enum { ISAAC_RENDER_SHELL_A1A160_BAND_HOST_ROWS = 0x3u };
enum { ISAAC_RENDER_SHELL_A1A160_BAND_PURE_BODIES = 0x6u };

uint32_t isaac_render_shell_a1a540_field_off(uint32_t idx);
uint32_t isaac_render_shell_a1a540_field_default(uint32_t idx);
uint32_t isaac_render_shell_a1a540_host_va(void);
uint32_t isaac_render_shell_a1a540_end_va(void);
uint32_t isaac_render_shell_a1a540_next_va(void);
uint32_t isaac_render_shell_a1a540_caller_count(void);
uint32_t isaac_render_shell_a1a540_caller_first_va(void);
uint32_t isaac_render_shell_a1a540_caller_last_va(void);
uint32_t isaac_render_shell_a1a540_addr_taken_count(void);
uint32_t isaac_render_shell_a1a540_eax_writes(void);
uint32_t isaac_render_shell_a1a540_stack_args(void);
uint32_t isaac_render_shell_a1a540_this_call(void);
uint32_t isaac_render_shell_a1a540_field_count(void);
uint32_t isaac_render_shell_a1a540_alignment_off(void);
uint32_t isaac_render_shell_a1a540_max_chars_off(void);
uint32_t isaac_render_shell_a1a540_mode_off(void);
uint32_t isaac_render_shell_a1a540_scale_off(void);
uint32_t isaac_render_shell_a1a540_unk10_off(void);
uint32_t isaac_render_shell_a1a540_unk14_off(void);
uint32_t isaac_render_shell_a1a540_unk18_off(void);
uint32_t isaac_render_shell_a1a540_max_chars_default(void);
uint32_t isaac_render_shell_a1a540_scale_default_bits(void);
uint32_t isaac_render_shell_a1a540_unk10_default(void);
uint32_t isaac_render_shell_a1a580_field_off(uint32_t idx);
uint32_t isaac_render_shell_a1a580_field_default(uint32_t idx);
uint32_t isaac_render_shell_a1a580_host_va(void);
uint32_t isaac_render_shell_a1a580_end_va(void);
uint32_t isaac_render_shell_a1a580_next_va(void);
uint32_t isaac_render_shell_a1a580_caller_count(void);
uint32_t isaac_render_shell_a1a580_caller_first_va(void);
uint32_t isaac_render_shell_a1a580_caller_last_va(void);
uint32_t isaac_render_shell_a1a580_addr_taken_count(void);
uint32_t isaac_render_shell_a1a580_eax_writes(void);
uint32_t isaac_render_shell_a1a580_stack_args(void);
uint32_t isaac_render_shell_a1a580_this_call(void);
uint32_t isaac_render_shell_a1a580_field_count(void);
uint32_t isaac_render_shell_a1a580_arg_off(void);
uint32_t isaac_render_shell_a1a5c0_host_va(void);
uint32_t isaac_render_shell_a1a5c0_end_va(void);
uint32_t isaac_render_shell_a1a5c0_next_va(void);
uint32_t isaac_render_shell_a1a5c0_caller_count(void);
uint32_t isaac_render_shell_a1a5c0_addr_taken_count(void);
uint32_t isaac_render_shell_a1a5c0_addr_taken_site_va(void);
uint32_t isaac_render_shell_a1a5c0_eax_writes(void);
uint32_t isaac_render_shell_a1a5c0_stack_args(void);
uint32_t isaac_render_shell_a1a5c0_this_call(void);
uint32_t isaac_render_shell_a1a5c0_dest_off(void);
uint32_t isaac_render_shell_a1a5d0_host_va(void);
uint32_t isaac_render_shell_a1a5d0_end_va(void);
uint32_t isaac_render_shell_a1a5d0_next_va(void);
uint32_t isaac_render_shell_a1a5d0_caller_count(void);
uint32_t isaac_render_shell_a1a5d0_addr_taken_count(void);
uint32_t isaac_render_shell_a1a5d0_addr_taken_site_va(void);
uint32_t isaac_render_shell_a1a5d0_eax_writes(void);
uint32_t isaac_render_shell_a1a5d0_stack_args(void);
uint32_t isaac_render_shell_a1a5d0_this_call(void);
uint32_t isaac_render_shell_a1a5d0_dest_off(void);
uint32_t isaac_render_shell_a1a5d0_word_mask(void);
uint32_t isaac_render_shell_a1a5e0_host_va(void);
uint32_t isaac_render_shell_a1a5e0_end_va(void);
uint32_t isaac_render_shell_a1a5e0_next_va(void);
uint32_t isaac_render_shell_a1a5e0_caller_count(void);
uint32_t isaac_render_shell_a1a5e0_addr_taken_count(void);
uint32_t isaac_render_shell_a1a5e0_addr_taken_site_va(void);
uint32_t isaac_render_shell_a1a5e0_eax_writes(void);
uint32_t isaac_render_shell_a1a5e0_stack_args(void);
uint32_t isaac_render_shell_a1a5e0_this_call(void);
uint32_t isaac_render_shell_a1a5e0_src_off(void);
uint32_t isaac_render_shell_a1a5e0_word_mask(void);
uint32_t isaac_render_shell_a1a5f0_host_va(void);
uint32_t isaac_render_shell_a1a5f0_end_va(void);
uint32_t isaac_render_shell_a1a5f0_next_va(void);
uint32_t isaac_render_shell_a1a5f0_caller_count(void);
uint32_t isaac_render_shell_a1a5f0_addr_taken_count(void);
uint32_t isaac_render_shell_a1a5f0_addr_taken_site_va(void);
uint32_t isaac_render_shell_a1a5f0_eax_writes(void);
uint32_t isaac_render_shell_a1a5f0_stack_args(void);
uint32_t isaac_render_shell_a1a5f0_this_call(void);
uint32_t isaac_render_shell_a1a5f0_cmp_off(void);
uint32_t isaac_render_shell_a1a5f0_cmp_val(void);
uint32_t isaac_render_shell_host_a1a2e0_va(void);
uint32_t isaac_render_shell_host_a1a2e0_end_va(void);
uint32_t isaac_render_shell_host_a1a2e0_next_va(void);
uint32_t isaac_render_shell_host_a1a2e0_caller_count(void);
uint32_t isaac_render_shell_host_a1a2e0_caller_first_va(void);
uint32_t isaac_render_shell_host_a1a2e0_caller_last_va(void);
uint32_t isaac_render_shell_host_a1a2e0_addr_taken_count(void);
uint32_t isaac_render_shell_host_a1a470_va(void);
uint32_t isaac_render_shell_host_a1a470_end_va(void);
uint32_t isaac_render_shell_host_a1a470_next_va(void);
uint32_t isaac_render_shell_host_a1a470_caller_count(void);
uint32_t isaac_render_shell_host_a1a470_caller_first_va(void);
uint32_t isaac_render_shell_host_a1a470_caller_last_va(void);
uint32_t isaac_render_shell_host_a1a470_addr_taken_count(void);
uint32_t isaac_render_shell_host_a1a500_va(void);
uint32_t isaac_render_shell_host_a1a500_end_va(void);
uint32_t isaac_render_shell_host_a1a500_next_va(void);
uint32_t isaac_render_shell_host_a1a500_caller_count(void);
uint32_t isaac_render_shell_host_a1a500_caller_first_va(void);
uint32_t isaac_render_shell_host_a1a500_caller_last_va(void);
uint32_t isaac_render_shell_host_a1a500_addr_taken_count(void);
uint32_t isaac_render_shell_a1a160_band_start_va(void);
uint32_t isaac_render_shell_a1a160_band_end_va(void);
uint32_t isaac_render_shell_a1a160_band_open_bodies(void);
uint32_t isaac_render_shell_a1a160_band_host_rows(void);
uint32_t isaac_render_shell_a1a160_band_pure_bodies(void);

/* ============================================================================
 * ABI v70: FontSettings next sub-band 0xa1a600..0xa1a63f — the v69 OPEN
 * marker CLOSED. Three PURE bodies landed (evidence:
 * section-notes/render-shell-v70-fontsettings/NOTES.md):
 *   0xa1a600 EnableTruncation — thiscall ret 4; WORD arg load
 *     `mov ax,[ebp+8]`; dword [ecx+8] := 2 ALWAYS; word [ecx+6] := ax
 *     (in-body 0xffff mask); lua name 0xb70380, binder push @0x866e31.
 *   0xa1a620 IsTruncationEnabled — thiscall ret 0; `cmp dword
 *     [ecx+8],2 ; sete al` (8 B); lua name 0xb70340, binder push
 *     @0x866e46. Law: is_truncation_enabled(state_8) = (state_8 == 2).
 *   0xa1a630 SetMissingCharacterOverride — thiscall ret 4; dword
 *     [ecx+0x10] := [ebp+8] (FULL dword); lua name 0xb70324, binder
 *     push @0x866e85 + wrapper-table slot-store `mov [eax],0xa1a630`
 *     @0x89faf5 (imm @0x89faf7).
 * HOST census rows (v69 handoff prediction confirmed):
 *   0xa1a640 SEH ctor (fs:[0] x3 + cookie; 1 E8 to 0xa0f4c0; 18 direct
 *     E8 callers 0x6f20b1..0x9b54d8), 0xa1a6f0 dtor (4 E8 incl.
 *     vector-grow 0x42c8e0/0x4b3950 + 0xa1ad90 + free 0xaef15c; ZERO
 *     direct callers, 3 cold jmp tails 0xafb86f/0xafb87d/0xb02a2f),
 *     0xa1a730 SEH giant (2368 insns, 97 E8, 26 indirect, 28 fs:[0],
 *     9 cookie sites; 17 direct E8 callers 0x840956..0x9efbf6; ends
 *     ret 0xa1c442, switch-table gap to the 0xa1c474 pad).
 * Byte-gate discipline: uint32 params; NO uint8_t; the a1a600 word
 * store masks 0xffff IN-BODY (PE width verified from bytes:
 * `66 8b 45 08` load + `66 89 41 06` store).
 * ============================================================================ */
enum { ISAAC_RENDER_SHELL_A1A600_HOST_VA = 0x00a1a600u };
enum { ISAAC_RENDER_SHELL_A1A600_END_VA = 0x00a1a616u };
enum { ISAAC_RENDER_SHELL_A1A600_NEXT_VA = 0x00a1a620u };
enum { ISAAC_RENDER_SHELL_A1A600_ADDR_TAKEN_COUNT = 0x1u };
enum { ISAAC_RENDER_SHELL_A1A600_ADDR_TAKEN_SITE_VA = 0x00866e31u };
enum { ISAAC_RENDER_SHELL_A1A600_STACK_ARGS = 0x1u };
enum { ISAAC_RENDER_SHELL_A1A600_THISCALL = 0x1u };
enum { ISAAC_RENDER_SHELL_A1A600_STATE_OFF = 0x08u };
enum { ISAAC_RENDER_SHELL_A1A600_STATE_VALUE = 0x2u };
enum { ISAAC_RENDER_SHELL_A1A600_WORD_OFF = 0x06u };
enum { ISAAC_RENDER_SHELL_A1A600_WORD_MASK = 0x0000ffffu };
enum { ISAAC_RENDER_SHELL_A1A620_HOST_VA = 0x00a1a620u };
enum { ISAAC_RENDER_SHELL_A1A620_END_VA = 0x00a1a628u };
enum { ISAAC_RENDER_SHELL_A1A620_NEXT_VA = 0x00a1a630u };
enum { ISAAC_RENDER_SHELL_A1A620_ADDR_TAKEN_COUNT = 0x1u };
enum { ISAAC_RENDER_SHELL_A1A620_ADDR_TAKEN_SITE_VA = 0x00866e46u };
enum { ISAAC_RENDER_SHELL_A1A620_STACK_ARGS = 0x0u };
enum { ISAAC_RENDER_SHELL_A1A620_THISCALL = 0x1u };
enum { ISAAC_RENDER_SHELL_A1A620_CMP_OFF = 0x08u };
enum { ISAAC_RENDER_SHELL_A1A620_CMP_VAL = 0x2u };
enum { ISAAC_RENDER_SHELL_A1A630_HOST_VA = 0x00a1a630u };
enum { ISAAC_RENDER_SHELL_A1A630_END_VA = 0x00a1a63du };
enum { ISAAC_RENDER_SHELL_A1A630_NEXT_VA = 0x00a1a640u };
enum { ISAAC_RENDER_SHELL_A1A630_ADDR_TAKEN_COUNT = 0x2u };
enum { ISAAC_RENDER_SHELL_A1A630_ADDR_TAKEN_PUSH_SITE_VA = 0x00866e85u };
enum { ISAAC_RENDER_SHELL_A1A630_ADDR_TAKEN_STORE_SITE_VA = 0x0089faf7u };
enum { ISAAC_RENDER_SHELL_A1A630_STACK_ARGS = 0x1u };
enum { ISAAC_RENDER_SHELL_A1A630_THISCALL = 0x1u };
enum { ISAAC_RENDER_SHELL_A1A630_DEST_OFF = 0x10u };
/* HOST rows closed with pins this unit (v64 HOST-3 shape). */
enum { ISAAC_RENDER_SHELL_HOST_A1A640_VA = 0x00a1a640u };
enum { ISAAC_RENDER_SHELL_HOST_A1A640_END_VA = 0x00a1a6eeu };
enum { ISAAC_RENDER_SHELL_HOST_A1A640_NEXT_VA = 0x00a1a6f0u };
enum { ISAAC_RENDER_SHELL_HOST_A1A640_CALLER_COUNT = 0x12u };
enum { ISAAC_RENDER_SHELL_HOST_A1A640_CALLER_FIRST_VA = 0x006f20b1u };
enum { ISAAC_RENDER_SHELL_HOST_A1A640_CALLER_LAST_VA = 0x009b54d8u };
enum { ISAAC_RENDER_SHELL_HOST_A1A6F0_VA = 0x00a1a6f0u };
enum { ISAAC_RENDER_SHELL_HOST_A1A6F0_END_VA = 0x00a1a723u };
enum { ISAAC_RENDER_SHELL_HOST_A1A6F0_NEXT_VA = 0x00a1a730u };
enum { ISAAC_RENDER_SHELL_HOST_A1A6F0_CALLER_COUNT = 0x0u };
enum { ISAAC_RENDER_SHELL_HOST_A1A6F0_JMP_TAIL_COUNT = 0x3u };
enum { ISAAC_RENDER_SHELL_HOST_A1A6F0_JMP_TAIL_FIRST_VA = 0x00afb86fu };
enum { ISAAC_RENDER_SHELL_HOST_A1A730_VA = 0x00a1a730u };
enum { ISAAC_RENDER_SHELL_HOST_A1A730_END_VA = 0x00a1c445u };
enum { ISAAC_RENDER_SHELL_HOST_A1A730_NEXT_VA = 0x00a1c480u };
enum { ISAAC_RENDER_SHELL_HOST_A1A730_CALLER_COUNT = 0x11u };
enum { ISAAC_RENDER_SHELL_HOST_A1A730_CALLER_FIRST_VA = 0x00840956u };
enum { ISAAC_RENDER_SHELL_HOST_A1A730_CALLER_LAST_VA = 0x009efbf6u };
/* v70 band census rows: 0xa1a600..0xa1a640 (the pure trio) closed;
   0xa1a600 = START of the trio (v69 NEXT), 0xa1a640 = first HOST row. */
enum { ISAAC_RENDER_SHELL_A1A600_BAND_START_VA = 0x00a1a600u };
enum { ISAAC_RENDER_SHELL_A1A600_BAND_END_VA = 0x00a1a640u };
enum { ISAAC_RENDER_SHELL_A1A600_BAND_OPEN_BODIES = 0x0u };
enum { ISAAC_RENDER_SHELL_A1A600_BAND_PURE_BODIES = 0x3u };
enum { ISAAC_RENDER_SHELL_A1A600_BAND_HOST_ROWS = 0x3u };

uint32_t isaac_render_shell_a1a600_host_va(void);
uint32_t isaac_render_shell_a1a600_end_va(void);
uint32_t isaac_render_shell_a1a600_next_va(void);
uint32_t isaac_render_shell_a1a600_addr_taken_count(void);
uint32_t isaac_render_shell_a1a600_addr_taken_site_va(void);
uint32_t isaac_render_shell_a1a600_stack_args(void);
uint32_t isaac_render_shell_a1a600_this_call(void);
uint32_t isaac_render_shell_a1a600_state_off(void);
uint32_t isaac_render_shell_a1a600_state_written(void);
uint32_t isaac_render_shell_a1a600_word_off(void);
uint32_t isaac_render_shell_a1a600_truncation_word(uint32_t arg);
uint32_t isaac_render_shell_a1a600_apply(uint32_t* state8, uint32_t* word6, uint32_t arg);
uint32_t isaac_render_shell_a1a620_host_va(void);
uint32_t isaac_render_shell_a1a620_end_va(void);
uint32_t isaac_render_shell_a1a620_next_va(void);
uint32_t isaac_render_shell_a1a620_addr_taken_count(void);
uint32_t isaac_render_shell_a1a620_addr_taken_site_va(void);
uint32_t isaac_render_shell_a1a620_stack_args(void);
uint32_t isaac_render_shell_a1a620_this_call(void);
uint32_t isaac_render_shell_a1a620_cmp_off(void);
uint32_t isaac_render_shell_a1a620_cmp_val(void);
uint32_t isaac_render_shell_a1a620_is_truncation_enabled(uint32_t state_8);
uint32_t isaac_render_shell_a1a630_host_va(void);
uint32_t isaac_render_shell_a1a630_end_va(void);
uint32_t isaac_render_shell_a1a630_next_va(void);
uint32_t isaac_render_shell_a1a630_addr_taken_count(void);
uint32_t isaac_render_shell_a1a630_addr_taken_push_site_va(void);
uint32_t isaac_render_shell_a1a630_addr_taken_store_site_va(void);
uint32_t isaac_render_shell_a1a630_stack_args(void);
uint32_t isaac_render_shell_a1a630_this_call(void);
uint32_t isaac_render_shell_a1a630_dest_off(void);
uint32_t isaac_render_shell_a1a630_override_value(uint32_t arg);
uint32_t isaac_render_shell_a1a630_apply(uint32_t* dest10, uint32_t arg);
uint32_t isaac_render_shell_host_a1a640_va(void);
uint32_t isaac_render_shell_host_a1a640_end_va(void);
uint32_t isaac_render_shell_host_a1a640_next_va(void);
uint32_t isaac_render_shell_host_a1a640_caller_count(void);
uint32_t isaac_render_shell_host_a1a640_caller_first_va(void);
uint32_t isaac_render_shell_host_a1a640_caller_last_va(void);
uint32_t isaac_render_shell_host_a1a6f0_va(void);
uint32_t isaac_render_shell_host_a1a6f0_end_va(void);
uint32_t isaac_render_shell_host_a1a6f0_next_va(void);
uint32_t isaac_render_shell_host_a1a6f0_caller_count(void);
uint32_t isaac_render_shell_host_a1a6f0_jmp_tail_count(void);
uint32_t isaac_render_shell_host_a1a6f0_jmp_tail_first_va(void);
uint32_t isaac_render_shell_host_a1a730_va(void);
uint32_t isaac_render_shell_host_a1a730_end_va(void);
uint32_t isaac_render_shell_host_a1a730_next_va(void);
uint32_t isaac_render_shell_host_a1a730_caller_count(void);
uint32_t isaac_render_shell_host_a1a730_caller_first_va(void);
uint32_t isaac_render_shell_host_a1a730_caller_last_va(void);
uint32_t isaac_render_shell_a1a600_band_start_va(void);
uint32_t isaac_render_shell_a1a600_band_end_va(void);
uint32_t isaac_render_shell_a1a600_band_open_bodies(void);
uint32_t isaac_render_shell_a1a600_band_pure_bodies(void);
uint32_t isaac_render_shell_a1a600_band_host_rows(void);

/* ============================================================================
 * ABI v71: std::sort cluster band 0xa1c480..0xa1d600 — census + two PURE
 * bodies landed (evidence: section-notes/render-shell-v71-depth/NOTES.md,
 * census-v71.json). The band is the MSVC std::sort machinery over 16-byte
 * elements keyed by the leading uint64 (hi dword +4, lo dword +0, unsigned
 * compare), reached from the a1a730 (v70 HOST) caller web.
 *
 * Census rows (whole-.text E8 per-position, decode-resynced):
 *   0xa1c480 SEH string/glyph layout (fs:[0] x4, cookie 0xbf93b4, scope
 *     0xb11363; 14 E8 incl. a55d60/a56060/a56790/a56c30 string ops +
 *     a1b8e0/a1ba10 + a0f4e0/af05df/aef15c; 1 fail-fast IAT indirect
 *     [0xb18894]; ret 0x10 x2 @ 0xa1c546/0xa1c7c8; 8 direct E8 callers
 *     0x837f2a..0xa1b327). NARROWED not removed.
 *   0xa1c7d0 switch-dispatch consumer (plain and-esp,-8 frame; jmp table
 *     9 entries @ 0xa1ce6c; 14 E8: a140c0 (v34 law), a1ba10 x2, a1b510 x4,
 *     a1b580 x6, a112c0, 684fc0 (v35 law); ret 0x24 @ 0xa1ce68; 8 direct
 *     E8 callers 0x837f6f..0xa1b37f). NARROWED not removed.
 *   0xa1cea0 free/delete wrapper (calls 40cf00 operator-delete probe,
 *     af05e5/af08bd IAT thunks, aef15c free; cold tail 415bc0 throw helper
 *     + 40cee0 via branches past the ret; ret 8 @ 0xa1cf6c; 1 direct E8
 *     caller 0xa1ac16). NARROWED not removed.
 *   0xa1cfa0 recursive intro-sort driver (cookie 0xbf93b4 fetch at entry;
 *     self-recursion x2 @ 0xa1d01e/0xa1d035; calls sort body 0xa1d280
 *     @ 0xa1cfe8 and heap-adjust 0xa1d4d0 @ 0xa1d207; tail cookie checks
 *     0xaef12b x2; 3 direct E8 sites, 1 external 0xa1ad12). NARROWED.
 *   0xa1d280 pivot/partition body (zero abs/fs/cookie refs; sole callee
 *     med3 0xa1d5a0 at 5 sites 0xa1d2d0..0xa1d318; med3 lands pure this
 *     ABI but the partition walk stays host pending whole-cluster peel).
 *     PINNED row. 1 direct E8 caller 0xa1cfe8.
 *   0xa1d4d0 heap _Adjust_heap — PURE (landed): zero calls, zero abs/fs;
 *     sift hole to leaf picking larger child (ties -> higher index), then
 *     upwalk inserting val; special case hole==half && count even moves
 *     arr[count-1] up first. Signed index jumps; unsigned key compares.
 *   0xa1d5a0 _Med3 — PURE (landed): conditional triple swap with the MSVC
 *     else-return skip of step 3 when step 2 does not swap; median ends in
 *     the edx slot. Element key = uint64 at [+0,+8), hi dword at +4.
 * NEXT_VA 0x00a1d600 (11-byte thiscall double-zero `mov [ecx],0 /
 * mov [ecx+4],0 / ret` after the 0xa1d5fd int3 pad) — OPEN for v72.
 * Byte-gate discipline: uint32_t params; NO uint8_t; key compares are
 * UNSIGNED dwords while index arithmetic keeps PE signedness (sar/jge/jl).
 * ============================================================================ */

enum { ISAAC_RENDER_SHELL_HOST_A1C480_VA = 0x00a1c480u };
enum { ISAAC_RENDER_SHELL_HOST_A1C480_END_VA = 0x00a1c7cbu };
enum { ISAAC_RENDER_SHELL_HOST_A1C480_NEXT_VA = 0x00a1c7d0u };
enum { ISAAC_RENDER_SHELL_HOST_A1C480_CALLER_COUNT = 0x8u };
enum { ISAAC_RENDER_SHELL_HOST_A1C480_CALLER_FIRST_VA = 0x00837f2au };
enum { ISAAC_RENDER_SHELL_HOST_A1C480_CALLER_LAST_VA = 0x00a1b327u };
enum { ISAAC_RENDER_SHELL_HOST_A1C480_SEH_FS_PROBES = 0x4u };
enum { ISAAC_RENDER_SHELL_HOST_A1C480_RET_IMM = 0x10u };

enum { ISAAC_RENDER_SHELL_HOST_A1C7D0_VA = 0x00a1c7d0u };
enum { ISAAC_RENDER_SHELL_HOST_A1C7D0_END_VA = 0x00a1ce6bu };
enum { ISAAC_RENDER_SHELL_HOST_A1C7D0_NEXT_VA = 0x00a1cea0u };
enum { ISAAC_RENDER_SHELL_HOST_A1C7D0_CALLER_COUNT = 0x8u };
enum { ISAAC_RENDER_SHELL_HOST_A1C7D0_CALLER_FIRST_VA = 0x00837f6fu };
enum { ISAAC_RENDER_SHELL_HOST_A1C7D0_CALLER_LAST_VA = 0x00a1b37fu };
enum { ISAAC_RENDER_SHELL_HOST_A1C7D0_JUMP_TABLE_VA = 0x00a1ce6cu };
enum { ISAAC_RENDER_SHELL_HOST_A1C7D0_JUMP_TABLE_ENTRIES = 0x9u };
enum { ISAAC_RENDER_SHELL_HOST_A1C7D0_E8_COUNT = 0xeu };
enum { ISAAC_RENDER_SHELL_HOST_A1C7D0_RET_IMM = 0x24u };

enum { ISAAC_RENDER_SHELL_HOST_A1CEA0_VA = 0x00a1cea0u };
enum { ISAAC_RENDER_SHELL_HOST_A1CEA0_END_VA = 0x00a1cf9au };
enum { ISAAC_RENDER_SHELL_HOST_A1CEA0_NEXT_VA = 0x00a1cfa0u };
enum { ISAAC_RENDER_SHELL_HOST_A1CEA0_CALLER_COUNT = 0x1u };
enum { ISAAC_RENDER_SHELL_HOST_A1CEA0_CALLER_ONLY_VA = 0x00a1ac16u };
enum { ISAAC_RENDER_SHELL_HOST_A1CEA0_RET_IMM = 0x8u };

enum { ISAAC_RENDER_SHELL_HOST_A1CFA0_VA = 0x00a1cfa0u };
enum { ISAAC_RENDER_SHELL_HOST_A1CFA0_END_VA = 0x00a1d27du };
enum { ISAAC_RENDER_SHELL_HOST_A1CFA0_NEXT_VA = 0x00a1d280u };
enum { ISAAC_RENDER_SHELL_HOST_A1CFA0_CALLER_COUNT = 0x3u };
enum { ISAAC_RENDER_SHELL_HOST_A1CFA0_SELF_CALL_SITES = 0x2u };
enum { ISAAC_RENDER_SHELL_HOST_A1CFA0_CALLER_FIRST_VA = 0x00a1ad12u };
enum { ISAAC_RENDER_SHELL_HOST_A1CFA0_CALLER_LAST_VA = 0x00a1d035u };
enum { ISAAC_RENDER_SHELL_HOST_A1CFA0_COOKIE_VA = 0x00bf93b4u };

/* Pinned partition body: host pending whole-cluster peel (sole callee is
 * now-pure med3). */
enum { ISAAC_RENDER_SHELL_A1D280_VA = 0x00a1d280u };
enum { ISAAC_RENDER_SHELL_A1D280_END_VA = 0x00a1d4c8u };
enum { ISAAC_RENDER_SHELL_A1D280_NEXT_VA = 0x00a1d4d0u };
enum { ISAAC_RENDER_SHELL_A1D280_CALLER_COUNT = 0x1u };
enum { ISAAC_RENDER_SHELL_A1D280_CALLER_SITE_VA = 0x00a1cfe8u };
enum { ISAAC_RENDER_SHELL_A1D280_CALLEE_VA = 0x00a1d5a0u };
enum { ISAAC_RENDER_SHELL_A1D280_CALLEE_SITE_COUNT = 0x5u };

/* PURE law: heap _Adjust_heap over 16-byte elems keyed by leading uint64. */
enum { ISAAC_RENDER_SHELL_A1D4D0_HOST_VA = 0x00a1d4d0u };
enum { ISAAC_RENDER_SHELL_A1D4D0_END_VA = 0x00a1d591u };
enum { ISAAC_RENDER_SHELL_A1D4D0_NEXT_VA = 0x00a1d5a0u };
enum { ISAAC_RENDER_SHELL_A1D4D0_ELEM_SIZE = 0x10u };
enum { ISAAC_RENDER_SHELL_A1D4D0_KEY_HI_OFF = 0x4u };
enum { ISAAC_RENDER_SHELL_A1D4D0_KEY_LO_OFF = 0x0u };
enum { ISAAC_RENDER_SHELL_A1D4D0_CALLER_COUNT = 0x1u };
enum { ISAAC_RENDER_SHELL_A1D4D0_CALLER_SITE_VA = 0x00a1d207u };

/* PURE law: _Med3 conditional triple swap (median lands in the b slot). */
enum { ISAAC_RENDER_SHELL_A1D5A0_HOST_VA = 0x00a1d5a0u };
enum { ISAAC_RENDER_SHELL_A1D5A0_END_VA = 0x00a1d5fdu };
enum { ISAAC_RENDER_SHELL_A1D5A0_NEXT_VA = 0x00a1d600u };
enum { ISAAC_RENDER_SHELL_A1D5A0_ELEM_SIZE = 0x10u };
enum { ISAAC_RENDER_SHELL_A1D5A0_KEY_HI_OFF = 0x4u };
enum { ISAAC_RENDER_SHELL_A1D5A0_KEY_LO_OFF = 0x0u };
enum { ISAAC_RENDER_SHELL_A1D5A0_CALL_SITE_COUNT = 0x5u };
enum { ISAAC_RENDER_SHELL_A1D5A0_CALL_SITE_FIRST_VA = 0x00a1d2d0u };
enum { ISAAC_RENDER_SHELL_A1D5A0_CALL_SITE_LAST_VA = 0x00a1d318u };

/* v71 band census rows: START = first body after the v70 handoff
 * (HOST_A1A730 NEXT), END = next unlanded body start. */
enum { ISAAC_RENDER_SHELL_A1C480_BAND_START_VA = 0x00a1c480u };
enum { ISAAC_RENDER_SHELL_A1C480_BAND_END_VA = 0x00a1d600u };
enum { ISAAC_RENDER_SHELL_A1C480_BAND_OPEN_BODIES = 0x0u };
enum { ISAAC_RENDER_SHELL_A1C480_BAND_PURE_BODIES = 0x2u };
enum { ISAAC_RENDER_SHELL_A1C480_BAND_HOST_ROWS = 0x5u };

uint32_t isaac_render_shell_host_a1c480_va(void);
uint32_t isaac_render_shell_host_a1c480_end_va(void);
uint32_t isaac_render_shell_host_a1c480_next_va(void);
uint32_t isaac_render_shell_host_a1c480_caller_count(void);
uint32_t isaac_render_shell_host_a1c480_caller_first_va(void);
uint32_t isaac_render_shell_host_a1c480_caller_last_va(void);
uint32_t isaac_render_shell_host_a1c480_seh_fs_probes(void);
uint32_t isaac_render_shell_host_a1c480_ret_imm(void);
uint32_t isaac_render_shell_host_a1c7d0_va(void);
uint32_t isaac_render_shell_host_a1c7d0_end_va(void);
uint32_t isaac_render_shell_host_a1c7d0_next_va(void);
uint32_t isaac_render_shell_host_a1c7d0_caller_count(void);
uint32_t isaac_render_shell_host_a1c7d0_caller_first_va(void);
uint32_t isaac_render_shell_host_a1c7d0_caller_last_va(void);
uint32_t isaac_render_shell_host_a1c7d0_jump_table_va(void);
uint32_t isaac_render_shell_host_a1c7d0_jump_table_entries(void);
uint32_t isaac_render_shell_host_a1c7d0_e8_count(void);
uint32_t isaac_render_shell_host_a1c7d0_ret_imm(void);
uint32_t isaac_render_shell_host_a1cea0_va(void);
uint32_t isaac_render_shell_host_a1cea0_end_va(void);
uint32_t isaac_render_shell_host_a1cea0_next_va(void);
uint32_t isaac_render_shell_host_a1cea0_caller_count(void);
uint32_t isaac_render_shell_host_a1cea0_caller_only_va(void);
uint32_t isaac_render_shell_host_a1cea0_ret_imm(void);
uint32_t isaac_render_shell_host_a1cfa0_va(void);
uint32_t isaac_render_shell_host_a1cfa0_end_va(void);
uint32_t isaac_render_shell_host_a1cfa0_next_va(void);
uint32_t isaac_render_shell_host_a1cfa0_caller_count(void);
uint32_t isaac_render_shell_host_a1cfa0_self_call_sites(void);
uint32_t isaac_render_shell_host_a1cfa0_caller_first_va(void);
uint32_t isaac_render_shell_host_a1cfa0_caller_last_va(void);
uint32_t isaac_render_shell_host_a1cfa0_cookie_va(void);
uint32_t isaac_render_shell_a1d280_va(void);
uint32_t isaac_render_shell_a1d280_end_va(void);
uint32_t isaac_render_shell_a1d280_next_va(void);
uint32_t isaac_render_shell_a1d280_caller_count(void);
uint32_t isaac_render_shell_a1d280_caller_site_va(void);
uint32_t isaac_render_shell_a1d280_callee_va(void);
uint32_t isaac_render_shell_a1d280_callee_site_count(void);
uint32_t isaac_render_shell_a1d4d0_host_va(void);
uint32_t isaac_render_shell_a1d4d0_end_va(void);
uint32_t isaac_render_shell_a1d4d0_next_va(void);
uint32_t isaac_render_shell_a1d4d0_elem_size(void);
uint32_t isaac_render_shell_a1d4d0_key_hi_off(void);
uint32_t isaac_render_shell_a1d4d0_key_lo_off(void);
uint32_t isaac_render_shell_a1d4d0_caller_count(void);
uint32_t isaac_render_shell_a1d4d0_caller_site_va(void);
/* Heap adjust: base = elem array (16 B stride), hole/count signed, val =
 * pointer to the 16 B value element. Returns the final hole index. */
uint32_t isaac_render_shell_a1d4d0_adjust_heap(uint32_t base, int32_t hole,
                                               int32_t count, uint32_t val);
uint32_t isaac_render_shell_a1d5a0_host_va(void);
uint32_t isaac_render_shell_a1d5a0_end_va(void);
uint32_t isaac_render_shell_a1d5a0_next_va(void);
uint32_t isaac_render_shell_a1d5a0_elem_size(void);
uint32_t isaac_render_shell_a1d5a0_key_hi_off(void);
uint32_t isaac_render_shell_a1d5a0_key_lo_off(void);
uint32_t isaac_render_shell_a1d5a0_call_site_count(void);
uint32_t isaac_render_shell_a1d5a0_call_site_first_va(void);
uint32_t isaac_render_shell_a1d5a0_call_site_last_va(void);
/* Med3: three 16 B element pointers; median ends in *b; returns b. */
uint32_t isaac_render_shell_a1d5a0_med3_apply(uint32_t* a, uint32_t* b,
                                              uint32_t* c);
uint32_t isaac_render_shell_a1c480_band_start_va(void);
uint32_t isaac_render_shell_a1c480_band_end_va(void);
uint32_t isaac_render_shell_a1c480_band_open_bodies(void);
uint32_t isaac_render_shell_a1c480_band_pure_bodies(void);
uint32_t isaac_render_shell_a1c480_band_host_rows(void);

/* ============================================================================
 * ABI v72: 0xa1d600 double-zero PURE law + 0xa1d610 SEH ctor HOST row
 * (evidence: section-notes/render-shell-v71-depth/NOTES.md v72 append;
 * census corroboration rshell-a1c480-scan, byte-verified this unit).
 *
 *   0xa1d600..0xa1d60e — 14-byte thiscall `mov dword [ecx],0 /
 *     mov dword [ecx+4],0 / ret` (c7 01 ... / c7 41 04 ... / c3).
 *     Zero direct E8 callers whole .text; 14 cold e9 jmp tails
 *     byte-verified rel32 -> 0xa1d600 (8 with clean lea-ecx reload
 *     prefixes: 0xb1133e/0xb11383 [ebp-0x14], 0xb12443/0xb12833
 *     [ebp-0x20], 0xb126c3 [ebp-0x14], 0xb12863/0xb12893 [ebp+0xc];
 *     6 cold without: 0xb08a27/0xb11e1d/0xb11e28/0xb11ec0/0xb12abf/
 *     0xb12d21/0xb14138 minus one — full list in the test pins).
 *   0xa1d610..0xa1d6ab — SEH ctor-shaped HOST: fs:[0] x3, handler
 *     0xb11395 @0xa1d615, cookie 0xbf93b4; thiscall (esi=ecx), args
 *     edi=[ebp+8] ebx=[ebp+c]; push 0x10 then E8 alloc wrapper
 *     0xa0f4c0 (v11 thin->a648b0); push 0xb1c630 + indirect call
 *     dword ptr [0xb184d4] (single-scope: literal arg, NOT a second
 *     SEH scope); ret 8 @0xa1d6a8; cc pad to 0xa1d6b0. 14 direct E8
 *     callers 0x9069f5..0xa7148b. NARROWED not removed.
 * NEXT_VA 0x00a1d6b0 (next cc-separated body). Byte-gate discipline:
 * uint32_t params; NO uint8_t.
 * ============================================================================ */

enum { ISAAC_RENDER_SHELL_A1D600_HOST_VA = 0x00a1d600u };
enum { ISAAC_RENDER_SHELL_A1D600_END_VA = 0x00a1d60eu };
enum { ISAAC_RENDER_SHELL_A1D600_NEXT_VA = 0x00a1d610u };
enum { ISAAC_RENDER_SHELL_A1D600_BODY_SIZE = 0xeu };
enum { ISAAC_RENDER_SHELL_A1D600_ZERO_OFF_A = 0x0u };
enum { ISAAC_RENDER_SHELL_A1D600_ZERO_OFF_B = 0x4u };
enum { ISAAC_RENDER_SHELL_A1D600_DIRECT_CALLER_COUNT = 0x0u };
enum { ISAAC_RENDER_SHELL_A1D600_JMP_TAIL_COUNT = 0xeu };
enum { ISAAC_RENDER_SHELL_A1D600_JMP_TAIL_FIRST_VA = 0x00b08a27u };
enum { ISAAC_RENDER_SHELL_A1D600_JMP_TAIL_LAST_VA = 0x00b14138u };

enum { ISAAC_RENDER_SHELL_HOST_A1D610_VA = 0x00a1d610u };
enum { ISAAC_RENDER_SHELL_HOST_A1D610_END_VA = 0x00a1d6abu };
enum { ISAAC_RENDER_SHELL_HOST_A1D610_NEXT_VA = 0x00a1d6b0u };
enum { ISAAC_RENDER_SHELL_HOST_A1D610_CALLER_COUNT = 0xeu };
enum { ISAAC_RENDER_SHELL_HOST_A1D610_CALLER_FIRST_VA = 0x009069f5u };
enum { ISAAC_RENDER_SHELL_HOST_A1D610_CALLER_LAST_VA = 0x00a7148bu };
enum { ISAAC_RENDER_SHELL_HOST_A1D610_SEH_FS_PROBES = 0x3u };
enum { ISAAC_RENDER_SHELL_HOST_A1D610_HANDLER_VA = 0x00b11395u };
enum { ISAAC_RENDER_SHELL_HOST_A1D610_COOKIE_VA = 0x00bf93b4u };
enum { ISAAC_RENDER_SHELL_HOST_A1D610_E8_COUNT = 0x1u };
enum { ISAAC_RENDER_SHELL_HOST_A1D610_INDIRECT_COUNT = 0x1u };
enum { ISAAC_RENDER_SHELL_HOST_A1D610_ALLOC_SIZE = 0x10u };
enum { ISAAC_RENDER_SHELL_HOST_A1D610_ALLOC_HOST_VA = 0x00a0f4c0u };
enum { ISAAC_RENDER_SHELL_HOST_A1D610_RET_IMM = 0x8u };

/* v72 band census rows: START = the v71 handoff body, END = next
 * unlanded body start after the HOST row. */
enum { ISAAC_RENDER_SHELL_A1D600_BAND_START_VA = 0x00a1d600u };
enum { ISAAC_RENDER_SHELL_A1D600_BAND_END_VA = 0x00a1d6b0u };
enum { ISAAC_RENDER_SHELL_A1D600_BAND_OPEN_BODIES = 0x0u };
enum { ISAAC_RENDER_SHELL_A1D600_BAND_PURE_BODIES = 0x1u };
enum { ISAAC_RENDER_SHELL_A1D600_BAND_HOST_ROWS = 0x1u };

uint32_t isaac_render_shell_a1d600_host_va(void);
uint32_t isaac_render_shell_a1d600_end_va(void);
uint32_t isaac_render_shell_a1d600_next_va(void);
uint32_t isaac_render_shell_a1d600_body_size(void);
uint32_t isaac_render_shell_a1d600_zero_off_a(void);
uint32_t isaac_render_shell_a1d600_zero_off_b(void);
uint32_t isaac_render_shell_a1d600_direct_caller_count(void);
uint32_t isaac_render_shell_a1d600_jmp_tail_count(void);
uint32_t isaac_render_shell_a1d600_jmp_tail_first_va(void);
uint32_t isaac_render_shell_a1d600_jmp_tail_last_va(void);
/* Double-zero law: obj[0] = 0; obj[4] = 0 (thiscall ecx). */
void isaac_render_shell_a1d600_zero_pair(uint32_t obj);
uint32_t isaac_render_shell_host_a1d610_va(void);
uint32_t isaac_render_shell_host_a1d610_end_va(void);
uint32_t isaac_render_shell_host_a1d610_next_va(void);
uint32_t isaac_render_shell_host_a1d610_caller_count(void);
uint32_t isaac_render_shell_host_a1d610_caller_first_va(void);
uint32_t isaac_render_shell_host_a1d610_caller_last_va(void);
uint32_t isaac_render_shell_host_a1d610_seh_fs_probes(void);
uint32_t isaac_render_shell_host_a1d610_handler_va(void);
uint32_t isaac_render_shell_host_a1d610_cookie_va(void);
uint32_t isaac_render_shell_host_a1d610_e8_count(void);
uint32_t isaac_render_shell_host_a1d610_indirect_count(void);
uint32_t isaac_render_shell_host_a1d610_alloc_size(void);
uint32_t isaac_render_shell_host_a1d610_alloc_host_va(void);
uint32_t isaac_render_shell_host_a1d610_ret_imm(void);
uint32_t isaac_render_shell_a1d600_band_start_va(void);
uint32_t isaac_render_shell_a1d600_band_end_va(void);
uint32_t isaac_render_shell_a1d600_band_open_bodies(void);
uint32_t isaac_render_shell_a1d600_band_pure_bodies(void);
uint32_t isaac_render_shell_a1d600_band_host_rows();

/* ============================================================================
 * ABI v73: 0xa1dfd0..0xa1e044 hot float-gate predicate — PURE gate law +
 * sum-chain fragment + HOST row pins (evidence: section-notes/render-shell-
 * v71-a1c480/NOTES.md §9 Body H; caller list re-scanned byte-true this unit).
 *
 *   thiscall wrapper (esi=[ebp+8], ecx unused): movss [esi+0x40] then
 *   addss [esi+0x2c], [esi+0x54], [esi+0x68] in PE accumulation order,
 *   mulss .rdata [0xbaa1d4]=0.25f, ucomiss vs [0xba9fe4]=+0.0f, then
 *   lahf / test ah,0x44 / jp @0xa1e001. Flag algebra: ucomiss sets
 *   ZF(bit6)/PF(bit2)/CF(bit0) into AH; test result r=ah&0x44 has
 *   even parity (jp taken) for r in {0x00 greater-or-less, 0x44
 *   unordered} and odd parity (jp not taken) ONLY for r==0x40 equal.
 *   Law: gate = !(scaled == +0.0f) with NaN scaled -> TRUE arm — C
 *   f32 != semantics; -0 sums compare EQUAL -> false arm.
 *   False arm early xor eax,eax ret 0x4 @0xa1e009. True arm composes
 *   the shader-stack push: push "KAGE_ColorShader" (0xb81e50), E8
 *   a140c0 (v34 ring-bind alloc law); lea ecx,[ebp-0x24], E8 a11080
 *   (UNLANDED temp ctor); push 0, E8 a13750 (UNLANDED find-or-create);
 *   push temp/1/esi/lea-temp, mov ecx,eax, E8 a671b0 (UNLANDED bind
 *   method); mov esi,eax, E8 a14200 (v35 stack-pop law); ret 0x4
 *   @0xa1e041. True-arm effects stay HOST-resolved (3 of 5 callees
 *   unlanded); pure fragments expose the gate decision + exact f32
 *   sum chain. 39 insns, 0 fs / 0 cookie / 0 SEH; 44 direct E8 callers
 *   0x42e17a..0x9ed050.
 * NEXT_VA 0x00a1e050. Byte-gate discipline: uint32_t params; NO uint8_t.
 * ============================================================================ */

enum { ISAAC_RENDER_SHELL_HOST_A1DFD0_VA = 0x00a1dfd0u };
enum { ISAAC_RENDER_SHELL_HOST_A1DFD0_END_VA = 0x00a1e044u };
enum { ISAAC_RENDER_SHELL_HOST_A1DFD0_NEXT_VA = 0x00a1e050u };
enum { ISAAC_RENDER_SHELL_HOST_A1DFD0_BODY_SIZE = 0x74u };
enum { ISAAC_RENDER_SHELL_A1DFD0_FIELD_OFF_FIRST = 0x40u };
enum { ISAAC_RENDER_SHELL_A1DFD0_FIELD_OFF_SECOND = 0x2cu };
enum { ISAAC_RENDER_SHELL_A1DFD0_FIELD_OFF_THIRD = 0x54u };
enum { ISAAC_RENDER_SHELL_A1DFD0_FIELD_OFF_FOURTH = 0x68u };
enum { ISAAC_RENDER_SHELL_A1DFD0_SCALE_CONST_VA = 0x00baa1d4u };
enum { ISAAC_RENDER_SHELL_A1DFD0_THRESH_CONST_VA = 0x00ba9fe4u };
enum { ISAAC_RENDER_SHELL_A1DFD0_SCALE_BITS = 0x3e800000u /* 0.25f */ };
enum { ISAAC_RENDER_SHELL_A1DFD0_THRESH_BITS = 0x00000000u /* +0.0f */ };
enum { ISAAC_RENDER_SHELL_A1DFD0_TEST_AH_MASK = 0x44u };
enum { ISAAC_RENDER_SHELL_A1DFD0_NAME_KEY_VA = 0x00b81e50u };
enum { ISAAC_RENDER_SHELL_HOST_A1DFD0_E8_COUNT = 0x5u };
enum { ISAAC_RENDER_SHELL_HOST_A1DFD0_RET_IMM = 0x4u };
enum { ISAAC_RENDER_SHELL_HOST_A1DFD0_CALLER_COUNT = 0x2cu };
enum { ISAAC_RENDER_SHELL_HOST_A1DFD0_CALLER_FIRST_VA = 0x0042e17au };
enum { ISAAC_RENDER_SHELL_HOST_A1DFD0_CALLER_LAST_VA = 0x009ed050u };
enum { ISAAC_RENDER_SHELL_A1DFD0_CALLEE_SITE_COUNT = 0x5u };
enum { ISAAC_RENDER_SHELL_A1DFD0_CALLEE_SITE_1_VA = 0x00a140c0u /* v34 law */ };
enum { ISAAC_RENDER_SHELL_A1DFD0_CALLEE_SITE_2_VA = 0x00a11080u /* UNLANDED */ };
enum { ISAAC_RENDER_SHELL_A1DFD0_CALLEE_SITE_3_VA = 0x00a13750u /* UNLANDED */ };
enum { ISAAC_RENDER_SHELL_A1DFD0_CALLEE_SITE_4_VA = 0x00a671b0u /* UNLANDED */ };
enum { ISAAC_RENDER_SHELL_A1DFD0_CALLEE_SITE_5_VA = 0x00a14200u /* v35 law */ };
enum { ISAAC_RENDER_SHELL_A1DFD0_UNLANDED_CALLEE_COUNT = 0x3u };
enum { ISAAC_RENDER_SHELL_A1DFD0_BAND_START_VA = 0x00a1dfd0u };
enum { ISAAC_RENDER_SHELL_A1DFD0_BAND_END_VA = 0x00a1e050u };
enum { ISAAC_RENDER_SHELL_A1DFD0_BAND_OPEN_BODIES = 0x0u };
enum { ISAAC_RENDER_SHELL_A1DFD0_BAND_PURE_BODIES = 0x1u };
enum { ISAAC_RENDER_SHELL_A1DFD0_BAND_HOST_ROWS = 0x1u };

uint32_t isaac_render_shell_host_a1dfd0_va(void);
uint32_t isaac_render_shell_host_a1dfd0_end_va(void);
uint32_t isaac_render_shell_host_a1dfd0_next_va(void);
uint32_t isaac_render_shell_host_a1dfd0_body_size(void);
uint32_t isaac_render_shell_host_a1dfd0_caller_count(void);
uint32_t isaac_render_shell_host_a1dfd0_caller_first_va(void);
uint32_t isaac_render_shell_host_a1dfd0_caller_last_va(void);
uint32_t isaac_render_shell_host_a1dfd0_e8_count(void);
uint32_t isaac_render_shell_host_a1dfd0_ret_imm(void);
uint32_t isaac_render_shell_a1dfd0_field_off_first(void);
uint32_t isaac_render_shell_a1dfd0_field_off_second(void);
uint32_t isaac_render_shell_a1dfd0_field_off_third(void);
uint32_t isaac_render_shell_a1dfd0_field_off_fourth(void);
uint32_t isaac_render_shell_a1dfd0_scale_const_va(void);
uint32_t isaac_render_shell_a1dfd0_thresh_const_va(void);
uint32_t isaac_render_shell_a1dfd0_scale_bits(void);
uint32_t isaac_render_shell_a1dfd0_thresh_bits(void);
uint32_t isaac_render_shell_a1dfd0_test_ah_mask(void);
uint32_t isaac_render_shell_a1dfd0_name_key_va(void);
uint32_t isaac_render_shell_a1dfd0_callee_site_count(void);
uint32_t isaac_render_shell_a1dfd0_callee_site_1_va(void);
uint32_t isaac_render_shell_a1dfd0_callee_site_2_va(void);
uint32_t isaac_render_shell_a1dfd0_callee_site_3_va(void);
uint32_t isaac_render_shell_a1dfd0_callee_site_4_va(void);
uint32_t isaac_render_shell_a1dfd0_callee_site_5_va(void);
uint32_t isaac_render_shell_a1dfd0_unlanded_callee_count(void);
/* Float-gate law: PE chain ((f40+f2c)+f54)+f68, *0.25f, gate =
 * !(scaled == +0.0f) via the lahf/test ah,0x44/jp dance (NaN -> 1).
 * esi_ptr is the caller's [ebp+8]; fields read at the four offsets. */
int32_t isaac_render_shell_a1dfd0_float_gate(uint32_t esi_ptr);
/* Sum-chain fragment: raw f32 bits of the unrounded-input accumulation
 * (((f40+f2c)+f54)+f68) BEFORE the *0.25 scale (pins add order). */
int32_t isaac_render_shell_a1dfd0_sum_bits(uint32_t esi_ptr);
uint32_t isaac_render_shell_a1dfd0_band_start_va(void);
uint32_t isaac_render_shell_a1dfd0_band_end_va(void);
uint32_t isaac_render_shell_a1dfd0_band_open_bodies(void);
uint32_t isaac_render_shell_a1dfd0_band_pure_bodies(void);
uint32_t isaac_render_shell_a1dfd0_band_host_rows();

/* ============================================================================
 * ABI v74: 0xa1e490..0xa1e4a9 thiscall two-dword setter PURE law
 * (census: rshell-a1c480-scan, appended render-shell-v73-afd0/NOTES.md;
 * bytes re-verified this unit).
 *
 *   25-byte thiscall: mov eax,[ebp+8] / mov [ecx+0xc8],eax /
 *   mov eax,[ebp+0xc] / mov [ecx+0xcc],eax / pop ebp / ret 8.
 *   8 insns, 0 E8 / 0 indirect / 0 fs / 0 cookie / 0 SEH. ZERO direct
 *   E8 callers AND zero e9 tails -> reached via vtable slot (same
 *   self-referential dispatch channel as the 0xb82758 dtor twins J/K
 *   band). Pure-complete: both stores are the whole body.
 * NEXT_VA 0x00a1e4b0 (Body N start). Byte-gate discipline: uint32_t
 * params; NO uint8_t.
 * ============================================================================ */

enum { ISAAC_RENDER_SHELL_A1E490_HOST_VA = 0x00a1e490u };
enum { ISAAC_RENDER_SHELL_A1E490_END_VA = 0x00a1e4a9u };
enum { ISAAC_RENDER_SHELL_A1E490_NEXT_VA = 0x00a1e4b0u };
enum { ISAAC_RENDER_SHELL_A1E490_BODY_SIZE = 0x19u };
enum { ISAAC_RENDER_SHELL_A1E490_SETTER_OFF_A = 0xc8u };
enum { ISAAC_RENDER_SHELL_A1E490_SETTER_OFF_B = 0xccu };
enum { ISAAC_RENDER_SHELL_A1E490_RET_IMM = 0x8u };
enum { ISAAC_RENDER_SHELL_A1E490_DIRECT_CALLER_COUNT = 0x0u };
enum { ISAAC_RENDER_SHELL_A1E490_E9_TAIL_COUNT = 0x0u };
enum { ISAAC_RENDER_SHELL_A1E490_BAND_START_VA = 0x00a1e490u };
enum { ISAAC_RENDER_SHELL_A1E490_BAND_END_VA = 0x00a1e590u };
enum { ISAAC_RENDER_SHELL_A1E490_BAND_OPEN_BODIES = 0x0u };
enum { ISAAC_RENDER_SHELL_A1E490_BAND_PURE_BODIES = 0x1u };
enum { ISAAC_RENDER_SHELL_A1E490_BAND_HOST_ROWS = 0x1u };

uint32_t isaac_render_shell_a1e490_host_va(void);
uint32_t isaac_render_shell_a1e490_end_va(void);
uint32_t isaac_render_shell_a1e490_next_va(void);
uint32_t isaac_render_shell_a1e490_body_size(void);
uint32_t isaac_render_shell_a1e490_setter_off_a(void);
uint32_t isaac_render_shell_a1e490_setter_off_b(void);
uint32_t isaac_render_shell_a1e490_ret_imm(void);
uint32_t isaac_render_shell_a1e490_direct_caller_count(void);
uint32_t isaac_render_shell_a1e490_e9_tail_count(void);
/* Two-dword setter law: obj[0xc8] = a; obj[0xcc] = b (PE store order). */
void isaac_render_shell_a1e490_set_c8_cc(uint32_t obj, uint32_t a,
                                         uint32_t b);
uint32_t isaac_render_shell_a1e490_band_start_va(void);
uint32_t isaac_render_shell_a1e490_band_end_va(void);
uint32_t isaac_render_shell_a1e490_band_open_bodies(void);
uint32_t isaac_render_shell_a1e490_band_pure_bodies(void);
uint32_t isaac_render_shell_a1e490_band_host_rows(void);

/* ABI version export for Wasm / tests. */
int32_t isaac_render_shell_pure_helpers_abi_version(void);

#ifdef __cplusplus
}
#endif
