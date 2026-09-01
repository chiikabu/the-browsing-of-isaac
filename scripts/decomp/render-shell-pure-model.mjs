/** Independent JS oracle for FUN_0080ea80 frame-shell pure gates/islands
 *  (VA 0x0080ea80) and FUN_00817830 body pure islands (VA 0x00817830).
 *  Do not derive mechanically from the C++ implementation.
 *  ABI v2: v1 gates + non-39 fade block pure islands (0x0080ecfb…0x0080ee81).
 *  ABI v3: aux nested 817830 pure decision (0x0080f13a…0x0080f176) + RT-pop
 *  depth step (0x0080f1b5…0x0080f1c9).
 *  ABI v4: FUN_00817830 entry pure islands after host GetStageID through
 *  special fade-blend t (pre residual open 0x00817adc).
 *  ABI v5: residual open pure at 0x00817adc (frame→shader scales) + post-
 *  a14050 gates G21–G23; host call remains 0x00817b2f opaque_call_00a14050.
 *  ABI v6: pure islands inside opaque_call_00a14050 (lookup/bind gates +
 *  c379b8 try_bind) + post-return L-room init loop structure + type-9 cell
 *  float packs.
 *  ABI v7: complete pure body of opaque_call_00a159d0 (case-fold path-sep
 *  string hash → shader_id). Nested hosts 416440/a14270 + GetLRoomAreaDesc
 *  0x0081f8b0 + draw callees remain.
 *  ABI v8: complete pure body of opaque_call_00416440 (MSVC map lower_bound)
 *  + a14270 found-path/size pure islands + GetLRoomAreaDesc pure islands
 *  (fallback AABB, grid index/idiv, cell floats, L-room pack). Host residual:
 *  a14270 insert/alloc chain; live DAT row load when not sparsified.
 *  ABI v9: a14270 insert residual plan + node_init + insert_link (pre-
 *  rebalance) + 81f8b0 table row address + complete a10690 / a0f550 /
 *  a10c00 draw bodies. Host residual: alloc 0xa0f4c0, rebalance/rotates
 *  when parent red, size-throw 0x4170d0.
 *  ABI v10: pure-complete 415f80/415fe0 rotates + 415c1a rebalance residual
 *  of 415bd0 (insert_fix). Host residual: alloc 0xa0f4c0, throw 0x4170d0.
 *  ABI v11: pure CF around residual host alloc 0xa0f4c0 (→a648b0) and throw
 *  0x4170d0: size imm, map_head load, a648b0 arg pack, malloc-size +4,
 *  throw msg VA. Host residual: a648b0 malloc IAT body + 0x4170d0 IAT/int3.
 *  ABI v12: stage-overlay residual after G7 dual open (0x0080ef1c…0x0080f12c):
 *  post-74ea50 gate, scale/pre-floor/div/camera pos, 6edc/6ee0 stores, color
 *  init, draw flag/order plan. Host: 74ea50, 812d00, floor af0917, 40a030.
 *  ABI v13: Game::GetStageID @ 0x00738470 pure CF (mode44/dim2/RC plan) +
 *  complete RoomConfig::GetStageID @ 0x0082d030 pure body + 74ea50 pure
 *  islands (diff/flag early-false, post-poll mode/type before host 4217a0).
 *  Host residual: 74f690 (mode44 type), 74ea50 polls + 4217a0, 812d00, floor,
 *  AnimationState::Render.
 *  ABI v14: opaque_call_0074f690 mode-44 stage-type pure CF (early type/const4,
 *  optional host GetRoomByIdx 0x740bc0, room clamp, stage float tables +
 *  womb grid distance). Host residual: GetRoomByIdx body when flag_183a0==0.
 *  ABI v15: Game::GetRoomByIdx @ 0x00740bc0 pure CF islands (dim default/range,
 *  special -100/-101 plans, idx range, neg/grid offsets, empty VA, walk match,
 *  once-init gate). Full body host for once-init / recurse / walk residuals.
 *  ABI v16: complete pure bodies of opaque_call_00812d00 (overlay Vector*;
 *  L-room grid vs AABB center) and opaque_call_004217a0 (challenge bitset).
 *  Host residual: 74ea50 polls, floor, AnimationState::Render, GetRoom once-
 *  init/recurse/walk, a14270 heap.
 *  ABI v17: address-stable pure islands of FUN_006f9400 / FUN_006f95a0 as
 *  consumed by 74ea50 (map present, gate39, mask assembly) + complete pure
 *  AL for 74ea50 given sparse presence + bitset. Coordinate with ProcessInput
 *  isaac_input_mask_* (same PE). Host residual for polls: map lower_bound
 *  0x004288a0 when presence not sparsified. Other residuals: floor,
 *  AnimationState::Render, GetRoom once-init/recurse/walk, a14270 heap.
 *  ABI v18: pure CF of exact AnimationState::Render @ 0x0040a030 (anim/layer
 *  gates, layer this + frame slot pack, loop step) + residual plan. Nested
 *  host per layer: opaque_call_00409120 (no exact ZHL). Pure-complete when
 *  anim null or layer_count==0. Other residuals: floor, GetRoom once-init/
 *  recurse/walk, a14270 heap, map lower_bound.
 *  ABI v19: pure CF islands of residual opaque_call_00409120 (entry layer/
 *  frame/layer-state visibility + signed frame range, frame×0x6c and
 *  LayerState×0xa0 packs, flags OR, flag-bit4 early-out, post-sprite
 *  continue, color path plan). Pure-complete when entry plan SKIP. Host
 *  residual opens at 0x408590 then color/quad/draw chain (GetSourceQuad
 *  0x4098a0 exact; 0x409cb0 dest residual). Other residuals: floor, GetRoom
 *  once-init/recurse/walk, a14270 heap, map lower_bound.
 *  ABI v20: pure CF islands of residual opaque_call_00408590 (sprite
 *  SharedPtr present, pair-A/B cache equal + update-needed, residual plan
 *  PURE_NULL/COPY/VT44/VT48/VT_BOTH, pure pair cache stores) + nested
 *  0x40c550 SharedPtr zero / null-control pure island. Pure-complete when
 *  plan PURE_NULL. Host: vtable +0x44/+0x48 on cache miss; 0x40c550 when
 *  control non-null. Other residuals: color/quad/draw, floor, GetRoom,
 *  a14270 heap, map lower_bound.
 *  ABI v21: complete pure bodies of color residual opaque_call_004071c0
 *  (0x2c ColorMod copy) and opaque_call_004072e0 (lhs × other via nested
 *  pure opaque_call_006831c0 mul-blend + copy). 0x6831c0 pure-complete
 *  (tint mul, offset SKIP/COPY/AVERAGE, tail add). Other residuals:
 *  GetSourceQuad/dest quad/draw, floor, GetRoom, a14270 heap, map
 *  lower_bound, 408590 vtable/40c550.
 *  ABI v22: exact AnimationLayer::GetSourceQuad @ 0x004098a0 complete pure
 *  body (crop clamp, flip X/Y, flag-bit2 RNG plan + xorshift unit jitter,
 *  cropOffset) + pure CF islands of dest-quad residual 0x00409cb0
 *  (GetDestQuad-shaped; no exact ZHL). Host residual: a112c0 when RNG seed
 *  zero; dest-quad a0f550/a10d00/a10950/a10760.
 *  ABI v23: complete pure body of color-ring residual opaque_call_0040c6f0
 *  (DAT_c78db4..c78dc0 ring index + table load; zero nested calls).
 *  COLOR_HOST path pure-complete when ring sparsified.
 *  ABI v24: complete pure bodies of dest-quad nested residuals a10d00
 *  (AABB + 4× color), a10950 (scale-about-offset), a10760 (rotate-about-
 *  pivot via CRT cos/sin 41d540/41d520). Whole 409cb0 glue not yet a single
 *  pure compute. Other residuals: a112c0 when seed 0, 409cb0 position glue,
 *  draw/floor/GetRoom/heap.
 *  ABI v25: opaque_call_00409cb0 becomes a single pure-complete compute —
 *  every call on its root path (a0f550, a10d00, 2× a10950, 2× a10760) is a
 *  translated pure body. New islands: camera-base select (DAT_c71678 /
 *  DAT_c33910 with DAT_c7b640/44 fallback), the flag-bit8 four-scale pack
 *  plus four sign flips, the two-stage span fold under the strict-negative
 *  scale tests, rotation parity, pivot pair, clamp corner pack, and the
 *  DAT_00baa088 degree→radian. Plan flips HOST_BODY → PURE. Other residuals
 *  unchanged: a112c0 when RNG seed 0, draw/floor/GetRoom/heap.
 *  ABI v26: (a) opaque_call_0040c550 full continuation chain — src control
 *  vtable slot +0x04, the post-call abort gate, dest control slot +0x0c, the
 *  DAT_00c7163c cdecl hook gate, and an apply driven by three sampled
 *  indirect results; [dest+4] is recaptured after the AddRef call rather
 *  than folded to the entry zero. (b) opaque_call_00408590 split into an
 *  entry phase and a post-A phase keyed on the sprite pointer recaptured at
 *  VA 0x004085de, with the pair-A store pinned to the PRE-call pointer and
 *  the redundant compares exported. (c) 0x00af0917 resolved through the PE
 *  import directory (IAT 0x00b18840) to CRT `floor` and translated exactly;
 *  the stage-overlay draw position no longer needs sampled floor results.
 *  ABI v27: mode-44 / GetRoomByIdx cluster. (a) 0x0074f690 resolved with
 *  separate pre-call and post-call stage snapshots — [this+0] is read at
 *  VA 0x0074f6ad and again at VA 0x0074f6f0 with the host call between — and
 *  the +0x183b0 / +0x18654 float arrays indexed in-model by the post-call
 *  clamped room index. (b) GetRoomByIdx once-init split into plan (entry
 *  epoch compare) and resume (guard RE-READ after the header call, == -1 →
 *  construct). (c) the -101 walk performs the real two-level dereference and
 *  the -100/-101 recursion is a bounded continuation with per-entry
 *  recaptured samples. Allocator chain stays host by standing decision.
 *  ABI v28: RoomDescriptor::constructor @ 0x006ef590 (exact ZHL). Full 0xb8
 *  field layout proven from store width + offset arithmetic; the size is
 *  confirmed independently by the 0xb8 descriptor stride already recovered
 *  in GetRoomByIdx. Readers inside this section prove +0x00 (room index),
 *  +0x0c (walk kind word) and +0x10 (a POINTER — the ctor's plain 0 is why
 *  the static empty descriptor fails both the 74f690 gate and the walk).
 *  Both vectors are vector<EntitySaveState> (dtor 0x004d6ee0 exact ZHL,
 *  element size 0x78 from the divide magic). The +0xa4..+0xab hole is never
 *  written. Container ranges are recaptured after the allocator/grow calls.
 *  ABI v29 (correctness fix): the entity-list loop at VA 0x0080eead-0x0080eed1
 *  re-derives BOTH its bound and its array base after every Game::Render
 *  call — [Game+0x1264] at 0x0080eecb and [Game+0x125c] at 0x0080eebc. The
 *  old doc said "for i in [0, count)", which folds the bound. The boolean
 *  entry gate was correct and is retained; entity_loop_step / _arg / _run
 *  express the recapture.
 *
 *  Binary SHA-256 5129DF723E645DAAEA59514394195F3EA1DCE1671BB0433D724648A845017200
 *  Notes: output/decomp/5129df723e64/section-notes/render-advance-2/
 *         output/decomp/5129df723e64/section-notes/render-advance-3/
 *         output/decomp/5129df723e64/section-notes/render-advance-4/
 *         output/decomp/5129df723e64/section-notes/render-advance-5/
 *         output/decomp/5129df723e64/section-notes/render-advance-6/
 *         output/decomp/5129df723e64/section-notes/render-advance-7/
 *         output/decomp/5129df723e64/section-notes/render-advance-8/
 *         output/decomp/5129df723e64/section-notes/render-advance-9/
 *         output/decomp/5129df723e64/section-notes/render-advance-10/
 *         output/decomp/5129df723e64/section-notes/render-advance-11/
 *         output/decomp/5129df723e64/section-notes/render-alloc-v11/
 *         output/decomp/5129df723e64/section-notes/render-v12/
 *         output/decomp/5129df723e64/section-notes/render-v13/
 *         output/decomp/5129df723e64/section-notes/render-v14/
 *         output/decomp/5129df723e64/section-notes/render-v15/
 *         output/decomp/5129df723e64/section-notes/render-v16/
 *         output/decomp/5129df723e64/section-notes/render-v17/
 *         output/decomp/5129df723e64/section-notes/render-v18/
 *         output/decomp/5129df723e64/section-notes/render-v19/
 *         output/decomp/5129df723e64/section-notes/render-v20/
 *         output/decomp/5129df723e64/section-notes/render-v21-color/
 *         output/decomp/5129df723e64/section-notes/render-v21-quad/
 *         output/decomp/5129df723e64/section-notes/render-40c6f0/
 *         output/decomp/5129df723e64/section-notes/render-v23-dest/
 *         output/decomp/5129df723e64/section-notes/render-v24/
 *         output/decomp/5129df723e64/section-notes/render-v26/
 *         output/decomp/5129df723e64/section-notes/render-v27/
 *         output/decomp/5129df723e64/section-notes/render-v28/
 *         output/decomp/5129df723e64/section-notes/render-v29/
 *         output/decomp/5129df723e64/section-notes/render-advance-12/
 *
 * ABI v30: Room::GetLRoomAreaDesc (VA 0x0081f8b0) live DAT_00c35b80 row
 * sparsify. The success-path row burst (VA 0x0081f8dc..0x0081f903) becomes
 * an explicit plan + read + resume group:
 *   rowNeeded   - PE type-range gate (lea [type-9]; cmp 3; ja fallback),
 *   loadPlan    - FALLBACK (pure AABB, no row) / PURE (row window is a
 *                 runtime input at the P38 row address) / LIVE (DAT read
 *                 stays host; the 8 recaptured row dwords are the resume
 *                 parameters of lroomPack - never a pre-call snapshot),
 *   rowRead     - the sparsified 8-dword window read (signed dwords),
 *   lroomFromRow- resume: rowRead then lroomPack; 1 when a row was read.
 * Existing P30-P35/P38 unchanged. Not a render slice ABI.
 *
 * ABI v31: opaque_call_00a14050 whole-body pure decision surface (37 call
 * sites; frame-shell site VA 0x00817b2f under FUN_0080ea80 ->
 * FUN_00817830). With a159d0 (v7) + 416440 (v8) + a14270 found path
 * (v8/v9) already pure, the remaining body is a FAIL/FOUND plan over the
 * RECAPTURED post-416440 bound fields plus a typed resume continuation
 * over the RECAPTURED map-value-slot dword (bound+0x14) and the byte at
 * value+4 (never a pre-call snapshot). The a14270 INSERT/THROW edges are
 * provably unreachable from this callsite: G24 (bound-isnil == 0,
 * id >= key, bound != map head) already implies the inner 416440 re-walk
 * hits the same bound (no map write between the two walks), and the
 * size-full test (VA 0x00a142b7) sits on the miss path.
 *   chainPlan  - FAIL (0) / FOUND (1) decision (a total function; wide
 *                bound-isnil draws are low-byte gated like the PE's
 *                `cmp byte ptr [edx+0xd], 0`),
 *   chainResume- post-sub-step bind continuation:
 *                ok + c379b8 store iff value != 0 && (value+4)&1.
 * Host alloc 0xa0f4c0 -> 0xa648b0 and size-throw 0x4170d0 stay host for
 * the a14270 family (raw alloc = platform primitive; the INSERT/THROW
 * codes of the a14270 plan still drive those other call sites).
 *
 * ABI v34: FUN_00a140c0 ring-matrix bind (VA 0x00a140c0…0x00a141fa,
 * ret 4; 24 E8 sites; no exact ZHL). Sibling of a14050: same G24/G25
 * then a ring push of the previous DAT_00c379b8. Grow 0x44be50 and
 * page alloc 0xa0f4c0(0x10) are CONDITIONAL, not always-path GL.
 *
 * ABI v35: FUN_00a14200 shader-stack pop (VA 0x00a14200…0x00a1424d,
 * ret 0; 12 E8 sites; no exact ZHL). Empty-cursor gate logs via host
 * a112c0 then recaptures DAT_00c379dc. Nested 0x00684fc0 (this=0xc379cc;
 * 16 E8; no ZHL) is a complete zero-call ring-peek leaf. Pop apply
 * writes [c379b8]=*[slot], cursor-1, cmove write_idx←0 when after==0.
 * Reuses v34 ring DAT VAs / ALIGN_MASK by reference.
 *
 * ABI v36: FUN_00a14250 thin +0x14 wrap (VA 0x00a14250…0x00a1426d,
 * ret 4; 2 E8 sites 0xa13740/0xa67cc9; 0 imm32/disp32; no exact ZHL).
 * Always-host nested 0xa143f0 (map find-or-insert; only E8 in body).
 * Resume: *[pair] + MAP_VALUE_OFF (0x14). a143f0 stays host.
 *
 * ABI v37: FUN_00a14330 map operator[] (VA 0x00a14330…0x00a143dd,
 * ret 4; no exact ZHL). Always-path 416440 (v8 pure) then a14270-shaped
 * FOUND/THROW/INSERT. Alloc 0xa0f4c0 + throw 0x4170d0 stay host.
 * NEXT_VA 0x00a143f0.
 * ABI v38: FUN_00a143f0 map find-or-insert (VA 0x00a143f0…0x00a145d1,
 * ret 8; no exact ZHL). Inlined 416440 walk then FOUND/THROW/INSERT.
 * FOUND writes pair {node, inserted=0}; INSERT host-alloc 0x18 then
 * BYTE node_init at +0x14, inlined insert_link + rebalance (v9/v10 by
 * reference), pair {node, inserted=1}. Alloc/throw stay host.
 * NEXT_VA 0x00a145e0.
 * ABI v39: FUN_00a145e0 scalar deleting dtor (VA 0x00a145e0…0x00a14616,
 * ret 4; zero direct E8 sites — vtable 0xb81bac slot +0x00, virtual
 * dtor body a149a0 = slot +0x04; no exact ZHL). Unconditional vftable
 * store, three-call subobject dtor sequence (a149a0(this) / 4149d0
 * this+0x40 / a15310 this+0x34), LOW-BYTE delete gate, sized free
 * (0x4c via aef15c) when flag bit 0. Nested dtors + free stay host.
 * NEXT_VA 0x00a14620. */

export const RENDER_SHELL_PURE_ABI_VERSION = 74;


export const RENDER_SHELL_STAGE_SPECIAL_39 = 0x39;
export const RENDER_SHELL_OVERLAY_ROOM_TYPE_59 = 0x59;
export const RENDER_SHELL_OVERLAY_GAME_MODE_5 = 5;
export const RENDER_SHELL_FADE_BOOST_MODE_8 = 8;
export const RENDER_SHELL_FADE_BOOST_MODE_1D = 0x1d;
export const RENDER_SHELL_FADE_FORCE_MGR0 = 0x0d;
export const RENDER_SHELL_FADE_FORCE_MGR1 = 1;
export const RENDER_SHELL_F32_ONE_BITS = 0x3f800000;
export const RENDER_SHELL_F32_BOOST_ADD_BITS = 0x3f19999a;
export const RENDER_SHELL_817830_STAGE_STRIDE = 0x13c;
export const RENDER_SHELL_817830_STAGE_2C = 0x2c;
export const RENDER_SHELL_817830_STAGE_ID_4 = 4;
export const RENDER_SHELL_817830_STAGE_ID_5 = 5;
export const RENDER_SHELL_817830_STAGE_ID_6 = 6;
export const RENDER_SHELL_817830_STAGE_ID_1B = 0x1b;
export const RENDER_SHELL_817830_STAGE_ID_1C = 0x1c;
export const RENDER_SHELL_817830_LROOM_TYPE_BASE = 9;
export const RENDER_SHELL_817830_LROOM_TYPE_SPAN = 3;
export const RENDER_SHELL_817830_ROOM_TYPE_9 = 9;
export const RENDER_SHELL_817830_LROOM_QUAD_COUNT = 0x0c;
export const RENDER_SHELL_817830_LROOM_QUAD_STRIDE = 0x24;
export const RENDER_SHELL_817830_LROOM_QUAD_FLAG_OFF = 0x20;
export const RENDER_SHELL_817830_LROOM_PAIR_COUNT = 6;
export const RENDER_SHELL_817830_LROOM_PAIR_STRIDE = 0x70;
export const RENDER_SHELL_817830_LROOM_A0F550_ARG = -1;
export const RENDER_SHELL_F32_HALF_BITS = 0x3f000000;
export const RENDER_SHELL_F32_THIRTY_BITS = 0x41f00000;
export const RENDER_SHELL_F32_HUNDREDTH_BITS = 0x3c23d70a;
export const RENDER_SHELL_F32_TENTH_BITS = 0x3dcccccd;
export const RENDER_SHELL_F32_COLOR_R_2C_BITS = 0x3f800000;
export const RENDER_SHELL_F32_COLOR_G_2C_BITS = 0x3e99999a;
export const RENDER_SHELL_F32_COLOR_B_2C_BITS = 0x3e99999a;
export const RENDER_SHELL_F32_COLOR_A_2C_BITS = 0x3f800000;
export const RENDER_SHELL_A159D0_SEED = 0x1505;
export const RENDER_SHELL_A159D0_PATH_SEP_FROM = 0x5c;
export const RENDER_SHELL_A159D0_PATH_SEP_TO = 0x2f;
export const RENDER_SHELL_A159D0_KAGE_SHADER_HASH = 0xb3d14323;
export const RENDER_SHELL_MAP_LEFT_OFF = 0;
export const RENDER_SHELL_MAP_PARENT_OFF = 4;
export const RENDER_SHELL_MAP_RIGHT_OFF = 8;
export const RENDER_SHELL_MAP_COLOR_OFF = 0xc;
export const RENDER_SHELL_MAP_ISNIL_OFF = 0xd;
export const RENDER_SHELL_MAP_KEY_OFF = 0x10;
export const RENDER_SHELL_MAP_VALUE_OFF = 0x14;
export const RENDER_SHELL_A14270_SIZE_FULL = 0x0aaaaaaa;
export const RENDER_SHELL_A14270_ALLOC_SIZE = 0x18;
export const RENDER_SHELL_A14270_PLAN_FOUND = 0;
export const RENDER_SHELL_A14270_PLAN_THROW = 1;
export const RENDER_SHELL_A14270_PLAN_INSERT = 2;
export const RENDER_SHELL_MAP_COLOR_RED = 0;
export const RENDER_SHELL_MAP_COLOR_BLACK = 1;
export const RENDER_SHELL_HOST_ALLOC_VA = 0x00a0f4c0;
export const RENDER_SHELL_HOST_HEAP_VA = 0x00a648b0;
export const RENDER_SHELL_HOST_THROW_VA = 0x004170d0;
export const RENDER_SHELL_A0F4C0_A648B0_CL = 0;
export const RENDER_SHELL_A0F4C0_A648B0_ARG1 = 0;
export const RENDER_SHELL_A0F4C0_A648B0_SIZE_HI = 0;
export const RENDER_SHELL_A648B0_HEADER_SIZE = 4;
export const RENDER_SHELL_A14270_THROW_MSG_VA = 0x00b1b160;
export const RENDER_SHELL_HOST_74EA50_VA = 0x0074ea50;
export const RENDER_SHELL_HOST_812D00_VA = 0x00812d00;
export const RENDER_SHELL_HOST_FLOOR_VA = 0x00af0917;
export const RENDER_SHELL_HOST_ANIM_RENDER_VA = 0x0040a030;
export const RENDER_SHELL_HOST_GET_STAGE_ID_VA = 0x00738470;
export const RENDER_SHELL_HOST_74F690_VA = 0x0074f690;
export const RENDER_SHELL_HOST_82D030_VA = 0x0082d030;
export const RENDER_SHELL_HOST_4217A0_VA = 0x004217a0;
export const RENDER_SHELL_GET_STAGE_ID_PLAN_PURE_DIM2 = 0;
export const RENDER_SHELL_GET_STAGE_ID_PLAN_MODE44 = 1;
export const RENDER_SHELL_GET_STAGE_ID_PLAN_RC = 2;
export const RENDER_SHELL_GET_STAGE_ID_MODE_44 = 0x2c;
export const RENDER_SHELL_GET_STAGE_ID_DIM2_RESULT = 0x23;
export const RENDER_SHELL_GET_STAGE_ID_DIM_2 = 2;
export const RENDER_SHELL_82D030_MODE_AUTO = -1;
export const RENDER_SHELL_82D030_MODE_GREED_FORCE = 1;
export const RENDER_SHELL_82D030_DIFF_GREED_A = 2;
export const RENDER_SHELL_82D030_DIFF_GREED_B = 3;
export const RENDER_SHELL_74EA50_PLAN_FALSE = 0;
export const RENDER_SHELL_74EA50_PLAN_POLL = 1;
export const RENDER_SHELL_74EA50_PLAN_PROBE = 2;
export const RENDER_SHELL_74EA50_FLAG_BIT = 0x10000;
export const RENDER_SHELL_74EA50_MODE_TARGET = 6;
export const RENDER_SHELL_74EA50_TYPE_4 = 4;
export const RENDER_SHELL_74EA50_TYPE_5 = 5;
export const RENDER_SHELL_74EA50_PROBE_ARG = 0x2f;
export const RENDER_SHELL_74F690_PLAN_TYPE4 = 0;
export const RENDER_SHELL_74F690_PLAN_CONST4 = 1;
export const RENDER_SHELL_74F690_PLAN_GETROOM = 2;
export const RENDER_SHELL_74F690_PLAN_STAGE = 3;
export const RENDER_SHELL_74F690_STAGE_TABLE_LO = 0;
export const RENDER_SHELL_74F690_STAGE_WOMB = 1;
export const RENDER_SHELL_74F690_STAGE_TYPE4 = 2;
export const RENDER_SHELL_74F690_ROOM_IDX_SPECIAL = -10;
export const RENDER_SHELL_74F690_ROOM_IDX_CLAMP_MAX = 0xa8;
export const RENDER_SHELL_74F690_STAGE_WOMB_A = 7;
export const RENDER_SHELL_74F690_STAGE_WOMB_B = 8;
export const RENDER_SHELL_74F690_CONST_TYPE4 = 4;
export const RENDER_SHELL_74F690_GRID = 0x0d;
export const RENDER_SHELL_74F690_DIST_NEAR = 3;
export const RENDER_SHELL_74F690_SLOT_STRIDE = 0xb8;
export const RENDER_SHELL_74F690_SLOT_FIELD_OFF = 0x14;
export const RENDER_SHELL_74F690_FLOAT_A_OFF = 0x183b0;
export const RENDER_SHELL_74F690_FLOAT_B_OFF = 0x18654;
export const RENDER_SHELL_74F690_FLAG_OFF = 0x183a0;
export const RENDER_SHELL_74F690_ROOM_SLOT_OFF = 0x18314;
export const RENDER_SHELL_74F690_TABLE_DIM = 5;
export const RENDER_SHELL_74F690_TABLE_SIZE = 25;
export const RENDER_SHELL_F32_5_BITS = 0x40a00000;
export const RENDER_SHELL_F32_4_999_BITS = 0x409ff7cf;
export const RENDER_SHELL_74F690_SDIV13_MAGIC = 0x4ec4ec4f;
export const RENDER_SHELL_HOST_740BC0_VA = 0x00740bc0;
export const RENDER_SHELL_74F690_TABLE_LO_VA = 0x00b6a878;
export const RENDER_SHELL_74F690_TABLE_HI_VA = 0x00b6a8e0;
export const RENDER_SHELL_74F690_GETROOM_DIM = -1;
export const RENDER_SHELL_740BC0_PLAN_EMPTY = 0;
export const RENDER_SHELL_740BC0_PLAN_NEGATIVE = 1;
export const RENDER_SHELL_740BC0_PLAN_GRID = 2;
export const RENDER_SHELL_740BC0_PLAN_RECURSE_CURRENT = 3;
export const RENDER_SHELL_740BC0_PLAN_RECURSE_SPECIAL = 4;
export const RENDER_SHELL_740BC0_PLAN_WALK = 5;
export const RENDER_SHELL_740BC0_KIND_EMPTY = 0;
export const RENDER_SHELL_740BC0_KIND_GAME_OFF = 1;
export const RENDER_SHELL_740BC0_KIND_HOST = 2;
export const RENDER_SHELL_740BC0_IDX_CURRENT = -100;
export const RENDER_SHELL_740BC0_IDX_SPECIAL = -101;
export const RENDER_SHELL_740BC0_IDX_RANGE_ADD = 0x14;
export const RENDER_SHELL_740BC0_IDX_RANGE_LIM = 0xbc;
export const RENDER_SHELL_740BC0_DIM_COUNT = 3;
export const RENDER_SHELL_740BC0_GRID_STRIDE = 0xa9;
export const RENDER_SHELL_740BC0_MAP_BASE_OFF = 0x17adc;
export const RENDER_SHELL_740BC0_SLOT_MAX = 0x20e;
export const RENDER_SHELL_740BC0_SLOT_STRIDE = 0xb8;
export const RENDER_SHELL_740BC0_DESC_BASE_OFF = 0x14;
export const RENDER_SHELL_740BC0_NEG_BASE_OFF = 0x16bc4;
export const RENDER_SHELL_740BC0_EMPTY_VA = 0x00c81090;
export const RENDER_SHELL_740BC0_ONCE_GUARD_VA = 0x00c8108c;
export const RENDER_SHELL_740BC0_CUR_IDX_OFF = 0x18304;
export const RENDER_SHELL_740BC0_DIM_OFF = 0x1830c;
export const RENDER_SHELL_740BC0_ROOM_COUNT_OFF = 0x182cc;
export const RENDER_SHELL_740BC0_WALK_START_OFF = 0x24;
export const RENDER_SHELL_740BC0_WALK_STRIDE = 0xb8;
export const RENDER_SHELL_740BC0_WALK_RESULT_DELTA = -0x10;
export const RENDER_SHELL_740BC0_WALK_MATCH_TYPE = 1;
export const RENDER_SHELL_740BC0_WALK_MATCH_VAR = 10;
export const RENDER_SHELL_740BC0_SPECIAL_RECURSE_IDX = 0xa2;
export const RENDER_SHELL_740BC0_SPECIAL_RECURSE_DIM = 1;
export const RENDER_SHELL_HOST_AEF29D_VA = 0x00aef29d;
export const RENDER_SHELL_HOST_6EF590_VA = 0x006ef590;
export const RENDER_SHELL_HOST_ATEXIT_VA = 0x00aef5af;
export const RENDER_SHELL_HOST_AEF253_VA = 0x00aef253;
export const RENDER_SHELL_740BC0_ATEXIT_CB_VA = 0x00b15b30;
/* ABI v16: opaque_call_00812d00 */
export const RENDER_SHELL_812D00_PLAN_AABB = 0;
export const RENDER_SHELL_812D00_PLAN_LROOM = 1;
export const RENDER_SHELL_812D00_LROOM_TYPE_BASE = 9;
export const RENDER_SHELL_812D00_LROOM_TYPE_SPAN = 3;
export const RENDER_SHELL_812D00_DIV_TYPE9 = 0x148;
export const RENDER_SHELL_812D00_DIV_TYPE10 = 0x13b;
export const RENDER_SHELL_812D00_DIV_TYPE11 = 0x84;
export const RENDER_SHELL_812D00_DIV_TYPE12 = 0x77;
export const RENDER_SHELL_812D00_ROOM_WIDTH_OFF = 0x0c;
export const RENDER_SHELL_812D00_ROOM_LEFT_OFF = 0x14;
export const RENDER_SHELL_812D00_ROOM_TOP_OFF = 0x18;
export const RENDER_SHELL_812D00_ROOM_RIGHT_OFF = 0x1c;
export const RENDER_SHELL_812D00_ROOM_BOTTOM_OFF = 0x20;
export const RENDER_SHELL_812D00_ROOM_DESC_OFF = 4;
export const RENDER_SHELL_812D00_DESC_NEST_OFF = 0x10;
export const RENDER_SHELL_812D00_TYPE_OFF = 0x48;
export const RENDER_SHELL_812D00_MGR_ROOM_OFF = 0x18300;
/* ABI v16: opaque_call_004217a0 */
export const RENDER_SHELL_4217A0_BITSET_OFF = 0x26548;
export const RENDER_SHELL_4217A0_CLAMP_MAX = 0x34;
export const RENDER_SHELL_4217A0_PROBE_ARG = 0x2f;
/* ABI v17: residual poll hosts + map lower_bound */
export const RENDER_SHELL_HOST_6F9400_VA = 0x006f9400;
export const RENDER_SHELL_HOST_6F95A0_VA = 0x006f95a0;
export const RENDER_SHELL_HOST_4288A0_VA = 0x004288a0;
export const RENDER_SHELL_POLL_A_ID_38 = 0x38;
export const RENDER_SHELL_POLL_A_ID_39 = 0x39;
export const RENDER_SHELL_POLL_A_ID_3A = 0x3a;
export const RENDER_SHELL_POLL_A_ID_3B = 0x3b;
export const RENDER_SHELL_POLL_A_ID_3C = 0x3c;
export const RENDER_SHELL_POLL_A_ID_3D = 0x3d;
export const RENDER_SHELL_POLL_A_ID_3E = 0x3e;
export const RENDER_SHELL_POLL_B_ID_3F = 0x3f;
export const RENDER_SHELL_POLL_B_ID_40 = 0x40;
export const RENDER_SHELL_POLL_B_ID_41 = 0x41;
export const RENDER_SHELL_POLL_B_ID_42 = 0x42;
export const RENDER_SHELL_POLL_B_ID_43 = 0x43;
export const RENDER_SHELL_POLL_B_ID_44 = 0x44;
export const RENDER_SHELL_POLL_B_ID_46 = 0x46;
export const RENDER_SHELL_POLL_B_ID_4F = 0x4f;
export const RENDER_SHELL_POLL_BIT0 = 0x01;
export const RENDER_SHELL_POLL_BIT1 = 0x02;
export const RENDER_SHELL_POLL_BIT2 = 0x04;
export const RENDER_SHELL_POLL_BIT3 = 0x08;
export const RENDER_SHELL_POLL_BIT4 = 0x10;
export const RENDER_SHELL_POLL_BIT5 = 0x20;
export const RENDER_SHELL_POLL_BIT6 = 0x40;
export const RENDER_SHELL_POLL_B_ID_46_FORCE = 0x7f;
export const RENDER_SHELL_POLL_GATE39_MODE_EXCLUDE = 0x2c;
export const RENDER_SHELL_POLL_GATE39_STAGE_MAX = 8;
export const RENDER_SHELL_POLL_MAP_OFF = 0x1bbd8;
/* ABI v18: AnimationState::Render 0x0040a030 pure CF */
export const RENDER_SHELL_HOST_409120_VA = 0x00409120;
export const RENDER_SHELL_40A030_PLAN_SKIP = 0;
export const RENDER_SHELL_40A030_PLAN_HOST_LAYERS = 1;
export const RENDER_SHELL_40A030_STATE_ANM2_OFF = 0;
export const RENDER_SHELL_40A030_STATE_ANIM_OFF = 4;
export const RENDER_SHELL_40A030_STATE_LAYER_FRAMES_OFF = 8;
export const RENDER_SHELL_40A030_ANIM_LAYERS_OFF = 0x18;
export const RENDER_SHELL_40A030_ANIM_LAYER_COUNT_OFF = 0x1c;
export const RENDER_SHELL_40A030_LAYER_STRIDE = 0x10;
/* ABI v19: opaque_call_00409120 pure entry CF */
export const RENDER_SHELL_409120_PLAN_SKIP = 0;
export const RENDER_SHELL_409120_PLAN_HOST_BODY = 1;
export const RENDER_SHELL_409120_FRAME_STRIDE = 0x6c;
export const RENDER_SHELL_409120_LAYER_STATE_STRIDE = 0xa0;
export const RENDER_SHELL_409120_LAYER_ID_OFF = 0;
export const RENDER_SHELL_409120_FRAMES_OFF = 4;
export const RENDER_SHELL_409120_NUM_FRAMES_OFF = 8;
export const RENDER_SHELL_409120_LAYER_VIS_OFF = 0xc;
export const RENDER_SHELL_409120_FRAME_VIS_OFF = 0x2c;
export const RENDER_SHELL_409120_LAYER_STATE_VIS_OFF = 0x74;
export const RENDER_SHELL_409120_LAYER_FLAGS_OFF = 0x8c;
export const RENDER_SHELL_409120_ANM2_LAYERS_OFF = 0x7c;
export const RENDER_SHELL_409120_ANM2_FLAGS_OFF = 0x110;
export const RENDER_SHELL_409120_FLAG_BIT1 = 0x01;
export const RENDER_SHELL_409120_FLAG_BIT4 = 0x04;
export const RENDER_SHELL_409120_COLOR_LAYER = 0;
export const RENDER_SHELL_409120_COLOR_ANM2 = 1;
export const RENDER_SHELL_409120_COLOR_HOST = 2;
export const RENDER_SHELL_HOST_408590_VA = 0x00408590;
export const RENDER_SHELL_HOST_40C440_VA = 0x0040c440;
export const RENDER_SHELL_HOST_4071C0_VA = 0x004071c0; /* pure-complete v21 */
export const RENDER_SHELL_HOST_4072E0_VA = 0x004072e0; /* pure-complete v21 */
export const RENDER_SHELL_HOST_4098A0_VA = 0x004098a0;
export const RENDER_SHELL_HOST_409CB0_VA = 0x00409cb0;
export const RENDER_SHELL_HOST_40C6F0_VA = 0x0040c6f0; /* pure-complete v23 */
/* ABI v21: ColorMod layout + nested pure mul-blend 0x6831c0 */
export const RENDER_SHELL_COLOR_SIZE = 0x2c;
export const RENDER_SHELL_COLOR_FLOATS = 11;
export const RENDER_SHELL_COLOR_TINT_COUNT = 4;
export const RENDER_SHELL_COLOR_OFF_R = 0x10;
export const RENDER_SHELL_COLOR_OFF_G = 0x14;
export const RENDER_SHELL_COLOR_OFF_B = 0x18;
export const RENDER_SHELL_COLOR_OFF_A = 0x1c;
export const RENDER_SHELL_COLOR_ADD0 = 0x20;
export const RENDER_SHELL_COLOR_ADD1 = 0x24;
export const RENDER_SHELL_COLOR_ADD2 = 0x28;
export const RENDER_SHELL_6831C0_OFF_SKIP = 0;
export const RENDER_SHELL_6831C0_OFF_COPY = 1;
export const RENDER_SHELL_6831C0_OFF_AVERAGE = 2;
export const RENDER_SHELL_HOST_6831C0_VA = 0x006831c0; /* pure-complete v21 */
/* ABI v22: GetSourceQuad 0x4098a0 + dest-quad 0x409cb0 */
export const RENDER_SHELL_SOURCE_QUAD_SIZE = 0x24;
export const RENDER_SHELL_SOURCE_QUAD_SPACE_OFF = 0x20;
export const RENDER_SHELL_SOURCE_QUAD_SPACE_UV = 1;
export const RENDER_SHELL_4098A0_FLAG_BIT2 = 0x02;
export const RENDER_SHELL_4098A0_PLAN_PURE = 0;
export const RENDER_SHELL_4098A0_PLAN_RNG = 1;
export const RENDER_SHELL_4098A0_PLAN_HOST_ASSERT = 2;
export const RENDER_SHELL_F32_SIGN_BITS = 0x80000000;
export const RENDER_SHELL_F32_RNG_UNIT_BITS = 0x2f7ffffe;
export const RENDER_SHELL_HOST_A112C0_VA = 0x00a112c0;
export const RENDER_SHELL_4098A0_RNG_MSG_VA = 0x00b6bf54;
export const RENDER_SHELL_4098A0_RNG_MSG_ARG = 0x10;
/* ABI v32: a112c0 raised twice on the zero-seed path (0x409aa7 entry,
   0x409b2d mid-jitter); int3 traps while still zero are fatal, not ported. */
export const RENDER_SHELL_4098A0_ZERO_SEED_ASSERT_COUNT = 2;
/* ABI v33: FUN_00827bc0 probe-B pure narrowing (host kind AT_BOOST_827BC0;
   3 direct call sites — 0x00762646 / 0x0080ed7c / 0x009379d4; body VA
   0x00827bc0..0x00827be6 is the factored twin of the overlay G7 probe
   block 0x0080ef08..0x0080ef2f). Pre-gate + byte-test pure; the nested
   74ea50 call (polls 6f9400/6f95a0 + 4217a0) stays host. */
export const RENDER_SHELL_827BC0_FIELD8_TARGET = 5;
export const RENDER_SHELL_827BC0_NEST_TYPE_TARGET = 0x59;
export const RENDER_SHELL_827BC0_PLAN_FALSE = 0;
export const RENDER_SHELL_827BC0_PLAN_HOST = 1;
export const RENDER_SHELL_HOST_827BC0_VA = 0x00827bc0;
export const RENDER_SHELL_827BC0_MGR_RECEIVER_OFF = 0x18300;
/* ABI v34: FUN_00a140c0 ring-matrix bind (24 E8 sites; no exact ZHL).
   G24/G25 twin of a14050, then ring push of previous DAT_00c379b8 onto
   the 0xc379cc page table. Grow 0x44be50 / alloc 0xa0f4c0 stay host. */
export const RENDER_SHELL_A140C0_PLAN_FALSE = 0;
export const RENDER_SHELL_A140C0_PLAN_GROW = 1;
export const RENDER_SHELL_A140C0_PLAN_ALLOC = 2;
export const RENDER_SHELL_A140C0_PLAN_PURE = 3;
export const RENDER_SHELL_HOST_A140C0_VA = 0x00a140c0;
export const RENDER_SHELL_HOST_44BE50_VA = 0x0044be50;
export const RENDER_SHELL_A140C0_ALLOC_SIZE = 0x10;
export const RENDER_SHELL_A140C0_ALIGN_MASK = 3;
export const RENDER_SHELL_A140C0_PAGE_SLOTS = 4;
export const RENDER_SHELL_A140C0_RING_THIS_VA = 0x00c379cc;
export const RENDER_SHELL_A140C0_PAGE_TABLE_VA = 0x00c379d0;
export const RENDER_SHELL_A140C0_CAP_VA = 0x00c379d4;
export const RENDER_SHELL_A140C0_WRITE_IDX_VA = 0x00c379d8;
export const RENDER_SHELL_A140C0_CURSOR_VA = 0x00c379dc;
export const RENDER_SHELL_A140C0_NAME_COLOR_VA = 0x00b81e50;
export const RENDER_SHELL_A140C0_NAME_COLOR_TEX_VA = 0x00b1a5b0;
export const RENDER_SHELL_A140C0_NAME_INDEXED_VA = 0x00b81940;
/* ABI v35: FUN_00a14200 shader-stack pop (12 E8 sites; no exact ZHL).
   Empty-cursor a112c0 is advisory (standing logger split). Nested
   0x00684fc0 ring-peek is a complete zero-call leaf. */
export const RENDER_SHELL_A14200_PLAN_EMPTY_LOG = 0;
export const RENDER_SHELL_A14200_PLAN_PURE = 1;
export const RENDER_SHELL_HOST_A14200_VA = 0x00a14200;
export const RENDER_SHELL_HOST_684FC0_VA = 0x00684fc0;
export const RENDER_SHELL_A14200_EMPTY_MSG_VA = 0x00b81ac4;
export const RENDER_SHELL_A14200_EMPTY_MSG_LEVEL = 0x10;
export const RENDER_SHELL_A14200_C379B8_VA = 0x00c379b8;
export const RENDER_SHELL_684FC0_PAGE_TABLE_OFF = 0x04;
export const RENDER_SHELL_684FC0_CAP_OFF = 0x08;
export const RENDER_SHELL_684FC0_WRITE_IDX_OFF = 0x0c;
export const RENDER_SHELL_684FC0_CURSOR_OFF = 0x10;
/* ABI v36: FUN_00a14250 thin +0x14 wrap (2 E8; no exact ZHL).
   Always-host nested 0xa143f0. Resume is pair.node + 0x14. */
export const RENDER_SHELL_A14250_PLAN_HOST = 0;
export const RENDER_SHELL_HOST_A14250_VA = 0x00a14250;
export const RENDER_SHELL_HOST_A143F0_VA = 0x00a143f0;
export const RENDER_SHELL_A14250_MAP_THIS_VA = 0x00c379c4;
export const RENDER_SHELL_A14250_VALUE_OFF = 0x14;
/* ABI v37: FUN_00a14330 map operator[] (no exact ZHL).
   Always-path 416440 then a14270-shaped FOUND/THROW/INSERT.
   Alloc 0xa0f4c0 + throw 0x4170d0 stay host. NEXT_VA 0xa143f0. */
export const RENDER_SHELL_A14330_PLAN_FOUND = 0;
export const RENDER_SHELL_A14330_PLAN_THROW = 1;
export const RENDER_SHELL_A14330_PLAN_INSERT = 2;
export const RENDER_SHELL_HOST_A14330_VA = 0x00a14330;
export const RENDER_SHELL_A14330_NEXT_VA = 0x00a143f0;
export const RENDER_SHELL_A14330_SIZE_FULL = 0x0aaaaaaa;
export const RENDER_SHELL_A14330_ALLOC_SIZE = 0x18;
/* ABI v38: FUN_00a143f0 map find-or-insert (no exact ZHL).
   Inlined 416440 walk; FOUND/THROW/INSERT. BYTE value at +0x14.
   Alloc 0xa0f4c0 + throw 0x4170d0 stay host. NEXT_VA 0xa145e0. */
export const RENDER_SHELL_A143F0_PLAN_FOUND = 0;
export const RENDER_SHELL_A143F0_PLAN_THROW = 1;
export const RENDER_SHELL_A143F0_PLAN_INSERT = 2;
export const RENDER_SHELL_A143F0_NEXT_VA = 0x00a145e0;
export const RENDER_SHELL_A143F0_END_VA = 0x00a145d1;
export const RENDER_SHELL_A143F0_SIZE_FULL = 0x0aaaaaaa;
export const RENDER_SHELL_A143F0_ALLOC_SIZE = 0x18;
export const RENDER_SHELL_A143F0_PAIR_INSERTED_OFF = 4;
export const RENDER_SHELL_A143F0_INSERTED_FOUND = 0;
export const RENDER_SHELL_A143F0_INSERTED_INSERT = 1;
/* ABI v39: FUN_00a145e0 scalar deleting dtor (no exact ZHL; vtable
   0xb81bac slot +0; virtual dtor body a149a0 = slot +4; ret 4).
   Unconditional vftable store; 3-call subobject dtor sequence
   (a149a0(this) / 4149d0 +0x40 / a15310 +0x34); LOW-BYTE delete
   gate; sized free (0x4c via aef15c) when flag bit 0. Nested dtors
   + free stay host. NEXT_VA 0xa14620. */
export const RENDER_SHELL_A145E0_HOST_VA = 0x00a145e0;
export const RENDER_SHELL_A145E0_END_VA = 0x00a14616;
export const RENDER_SHELL_A145E0_NEXT_VA = 0x00a14620;
export const RENDER_SHELL_A145E0_VTABLE_VA = 0x00b81bac;
export const RENDER_SHELL_A145E0_FREE_SIZE = 0x4c;
export const RENDER_SHELL_A145E0_FREE_VA = 0x00aef15c;
export const RENDER_SHELL_A145E0_CALL_COUNT = 3;
export const RENDER_SHELL_A145E0_CALL_THIS_OFF_0 = 0x00;
export const RENDER_SHELL_A145E0_CALL_THIS_OFF_1 = 0x40;
export const RENDER_SHELL_A145E0_CALL_THIS_OFF_2 = 0x34;
export const RENDER_SHELL_A145E0_CALL_THIS_OFF_1_TAIL = 0x0c;
export const RENDER_SHELL_A145E0_CALL_HOST_VA_0 = 0x00a149a0;
export const RENDER_SHELL_A145E0_CALL_HOST_VA_1 = 0x004149d0;
export const RENDER_SHELL_A145E0_CALL_HOST_VA_2 = 0x00a15310;

/* ABI v40: FUN_00a14620 string/pair-table object init (no exact ZHL;
   ret 0xc; SEH+GS prologue; this=ecx; [ebp+8]=src C-string,
   [ebp+0xc]=pair table stride 8 {ptr,flag}, [ebp+0x10]=arg2).
   Body: free-old gate ([this+8]!=0 -> host FREE a648b0 cl=1 + store 0);
   arg0 strdup (strlen+1 via host a0f4e0 operator-new -> a648b0 ALLOC
   cl=0, then SECOND strlen re-derived for IAT memcpy [0xb1893c]);
   pair scan (count = leading nonzero-flag run, pair0 FULL-dword gate);
   alloc count*8 with 64-bit overflow SATURATION to 0xffffffff
   (seto/neg/or — never folds); fill loop (null pair ptr -> slot dup 0
   else strlen+1 dup + re-derived memcpy; flag verbatim; UNSIGNED jb);
   vtable tail ([+8] gate call arg2 -> al; al==0 -> [+4] + return 0;
   al!=0 -> or [this+4],1 + [+0x28](arg0) + return 1). Host leaves:
   a648b0/a0f4e0/memcpy IAT/3 vtable slots. NARROWED not removed.
   NEXT_VA 0xa147e0. */
export const RENDER_SHELL_A14620_HOST_VA = 0x00a14620;
export const RENDER_SHELL_A14620_END_VA = 0x00a147cb;
export const RENDER_SHELL_A14620_NEXT_VA = 0x00a147e0;
export const RENDER_SHELL_A14620_STR_OFF = 0x08;
export const RENDER_SHELL_A14620_ARRAY_OFF = 0x0c;
export const RENDER_SHELL_A14620_COUNT_OFF = 0x10;
export const RENDER_SHELL_A14620_FLAGS_OFF = 0x04;
export const RENDER_SHELL_A14620_PAIR_STRIDE = 0x08;
export const RENDER_SHELL_A14620_PAIR_FLAG_OFF = 0x04;
export const RENDER_SHELL_A14620_PAIR_PTR_OFF = 0x00;
export const RENDER_SHELL_A14620_VTABLE_GATE_SLOT = 0x08;
export const RENDER_SHELL_A14620_VTABLE_FALSE_SLOT = 0x04;
export const RENDER_SHELL_A14620_VTABLE_TRUE_SLOT = 0x28;
export const RENDER_SHELL_A14620_FREE_CL = 0x01;
export const RENDER_SHELL_A14620_ALLOC_CL = 0x00;
export const RENDER_SHELL_A14620_FLAG_BIT0 = 0x01;
export const RENDER_SHELL_A14620_OP_NEW_VA = 0x00a0f4e0;
export const RENDER_SHELL_A14620_MEMCPY_IAT_VA = 0x00b1893c;
export const RENDER_SHELL_A14620_HEAP_VA = 0x00a648b0;
export const RENDER_SHELL_A14620_TAIL_RET_FALSE = 0x00;
export const RENDER_SHELL_A14620_TAIL_RET_TRUE = 0x01;

/* ABI v41: FUN_00a147e0 vertex/pixel shader string wrapper (no exact ZHL;
   ret 0x10; SEH+GS prologue; this=ecx; [ebp+8]/[ebp+0xc] forwarded to the
   nested 0xa14620 init; [ebp+0x10]=vertex name, [ebp+0x14]=pixel name).
   Body: per object (x2, identical template) — registry lookup
   0xa178d0(0xc37a10, name) FULL-dword null gate -> log(8, msg) + return 0;
   [vtbl+0xc](obj,0,0) init; len=[vtbl+4](obj); host a0f4e0(len+1) alloc;
   flag=[vtbl+0x14](obj,buf,len,1) fill; NUL at buf[len] (offset = len);
   [vtbl+0](obj) release; buf FULL-dword null gates (vertex -> vertex error;
   pixel error = free buf1 + log pixel msg); local pair table [ebp-0x28]
   stride 8 {buf1,flag1,buf2,flag2}; call 0xa14620(this, arg0, arg1, &local)
   (arg2 = local table); free buf1/buf2 (cl=1); return nested al BYTE.
   Host leaves: registry 0xa178d0, 4 vtable slots x2, alloc a0f4e0, free
   a648b0, logger (level 8, msgs 0xb81b18/0xb81b84). NARROWED not removed.
   NEXT_VA 0xa149a0 (v39 a149a0 virtual dtor body). */
export const RENDER_SHELL_A147E0_HOST_VA = 0x00a147e0;
export const RENDER_SHELL_A147E0_END_VA = 0x00a1498f;
export const RENDER_SHELL_A147E0_NEXT_VA = 0x00a149a0;
export const RENDER_SHELL_A147E0_REGISTRY_VA = 0x00a178d0;
export const RENDER_SHELL_A147E0_REGISTRY_THIS_VA = 0x00c37a10;
export const RENDER_SHELL_A147E0_NESTED_VA = 0x00a14620;
export const RENDER_SHELL_A147E0_LOG_VERTEX_MSG_VA = 0x00b81b18;
export const RENDER_SHELL_A147E0_LOG_PIXEL_MSG_VA = 0x00b81b84;
export const RENDER_SHELL_A147E0_LOG_LEVEL = 8;
export const RENDER_SHELL_A147E0_FREE_CL = 0x01;
export const RENDER_SHELL_A147E0_FILL_CONST = 0x01;
export const RENDER_SHELL_A147E0_ERR_RET = 0;
export const RENDER_SHELL_A147E0_VTABLE_CALLS = 4;
export const RENDER_SHELL_A147E0_VTABLE_SLOT_0 = 0x0c;
export const RENDER_SHELL_A147E0_VTABLE_SLOT_1 = 0x04;
export const RENDER_SHELL_A147E0_VTABLE_SLOT_2 = 0x14;
export const RENDER_SHELL_A147E0_VTABLE_SLOT_3 = 0x00;
export const RENDER_SHELL_A147E0_LOCAL_BASE_OFF = 0x28;
export const RENDER_SHELL_A147E0_LOCAL_PTR_0 = 0x00;
export const RENDER_SHELL_A147E0_LOCAL_PTR_1 = 0x08;
export const RENDER_SHELL_A147E0_LOCAL_FLAG_0 = 0x04;
export const RENDER_SHELL_A147E0_LOCAL_FLAG_1 = 0x0c;
export const RENDER_SHELL_A147E0_LOCAL_STRIDE = 0x08;

/* ABI v42: FUN_00a149a0 a14620-object virtual destructor body (no exact
   ZHL; ret; this=ecx; virtual dtor at vtable 0xb81bac slot +4 =
   a145e0's CALL_HOST_VA_0). Frees the a14620 object: pair array +0xc
   (8-byte {ptr,flag}, count +0x10); vector<0x18> walk +0x34/+0x38
   (MAGIC SIGNED div by 0x18, C-truncation); inner dword array
   [elem+0xc] count (end-begin)>>2 SAR; gate [elem+8]>7 SIGNED; 4149d0
   per element; 8 slots +0x14..+0x30; string +0x8; array base +0xc;
   [+4]&=~1; [+0x10]=0. Tracked-free (5 sites): sel=[0xc7de78];
   base = sel? sel+0x30 : 0xc7f618; lo -= [ptr-4]; sbb hi; free IAT
   [0xb187dc]. Laws pure scalars. NARROWED not removed.
   NEXT_VA 0xa14bf0 (thunk add ecx,0xc; jmp 0x4149d0). */
export const RENDER_SHELL_A149A0_HOST_VA = 0x00a149a0;
export const RENDER_SHELL_A149A0_END_VA = 0x00a14be4;
export const RENDER_SHELL_A149A0_NEXT_VA = 0x00a14bf0;
export const RENDER_SHELL_A149A0_VTABLE_VA = 0x00b81bac;
export const RENDER_SHELL_A149A0_FREE_IAT_VA = 0x00b187dc;
export const RENDER_SHELL_A149A0_COUNTER_SEL_VA = 0x00c7de78;
export const RENDER_SHELL_A149A0_COUNTER_FALLBACK_VA = 0x00c7f618;
export const RENDER_SHELL_A149A0_COUNTER_OFF = 0x30;
export const RENDER_SHELL_A149A0_FLAGS_OFF = 0x04;
export const RENDER_SHELL_A149A0_STR_OFF = 0x08;
export const RENDER_SHELL_A149A0_ARRAY_OFF = 0x0c;
export const RENDER_SHELL_A149A0_COUNT_OFF = 0x10;
export const RENDER_SHELL_A149A0_SLOTS_OFF = 0x14;
export const RENDER_SHELL_A149A0_SLOT_STRIDE = 0x04;
export const RENDER_SHELL_A149A0_SLOT_COUNT = 8;
export const RENDER_SHELL_A149A0_PAIR_STRIDE = 0x08;
export const RENDER_SHELL_A149A0_VEC_OFF = 0x34;
export const RENDER_SHELL_A149A0_VEC_STRIDE = 0x18;
export const RENDER_SHELL_A149A0_ELEM_TYPE_OFF = 0x08;
export const RENDER_SHELL_A149A0_ELEM_ARRAY_OFF = 0x0c;
export const RENDER_SHELL_A149A0_ELEM_END_OFF = 0x10;
export const RENDER_SHELL_A149A0_VEC_DESTROY_VA = 0x004149d0;
export const RENDER_SHELL_A149A0_VEC18_MAGIC = 0x2aaaaaab;
export const RENDER_SHELL_A149A0_TRACKED_FREE_SITES = 5;

/* ABI v43: FUN_00a14c00 render-shell item add/update method (no exact
   ZHL; ret 0x10 @ 0xa14f0c; SEH+GS prologue; this=ecx; 45 direct E8
   callers 0x4095c3..0x9945c8). Signature (this, name@[ebp+8],
   type@[ebp+0xc], data@[ebp+0x10], unused@[ebp+0x14]).
   Body: find element by name (a15040, host vec18 strcmp walk); if
   missing a152a0 pushes a new 0x18 element (name+0 / flag+4=1 /
   value+8=type); type->size dispatch (cmp type,0x1c; ja errA; jmp
   [type*4+0xa14f10]) — 29-entry table: idx 0..7 err B (0xb81b40),
   8..0x1c -> size (4/8/0xc/0x10/0x18/0x20/0x24/0x30/0x40), >0x1c
   err A (0xb81aec); both errors log a112c0 level 0x10, esi=0.
   Dedup memcmp of inner data vs incoming (size bytes) skips re-copy
   on full match; else a0f4e0 alloc + af05df copy + inner-vec push
   (42c920 grow); rewalk vec18 -> this+0x40 gets inner_count-1.
   Laws pure scalars (no host memory read). NARROWED not removed.
   Template coverage: shares the vec18 magic div and 0x18-element
   inner layout with a149a0 (v42) — pinned equal in tests.
   NEXT_VA 0xa14f90 (next SEH body after the 29-dword table). */
export const RENDER_SHELL_A14C00_HOST_VA = 0x00a14c00;
export const RENDER_SHELL_A14C00_END_VA = 0x00a14f0f;
export const RENDER_SHELL_A14C00_NEXT_VA = 0x00a14f90;
export const RENDER_SHELL_A14C00_JUMP_TABLE_VA = 0x00a14f10;
export const RENDER_SHELL_A14C00_JUMP_TABLE_ENTRIES = 0x1d;
export const RENDER_SHELL_A14C00_TYPE_MIN_VALID = 0x08;
export const RENDER_SHELL_A14C00_TYPE_MAX_VALID = 0x1c;
export const RENDER_SHELL_A14C00_LOG_LEVEL = 0x10;
export const RENDER_SHELL_A14C00_MSG_LO_VA = 0x00b81b40;
export const RENDER_SHELL_A14C00_MSG_HI_VA = 0x00b81aec;
export const RENDER_SHELL_A14C00_LOGGER_VA = 0x00a112c0;
export const RENDER_SHELL_A14C00_FIND_VA = 0x00a15040;
export const RENDER_SHELL_A14C00_PUSH_VA = 0x00a152a0;
export const RENDER_SHELL_A14C00_ALLOC_VA = 0x00a0f4e0;
export const RENDER_SHELL_A14C00_COPY_VA = 0x00af05df;
export const RENDER_SHELL_A14C00_GROW_VA = 0x0042c920;
export const RENDER_SHELL_A14C00_SIZED_FREE_VA = 0x00aef15c;
export const RENDER_SHELL_A14C00_RANGE_IAT_VA = 0x00b18894;
export const RENDER_SHELL_A14C00_MEMCPY_IAT_VA = 0x00b1893c;
export const RENDER_SHELL_A14C00_STACK_ARGS = 4;
export const RENDER_SHELL_A14C00_ELEM_STRIDE = 0x18;
export const RENDER_SHELL_A14C00_ELEM_NAME_OFF = 0x00;
export const RENDER_SHELL_A14C00_ELEM_FLAG_OFF = 0x04;
export const RENDER_SHELL_A14C00_ELEM_VALUE_OFF = 0x08;
export const RENDER_SHELL_A14C00_ELEM_INNER_BEGIN_OFF = 0x0c;
export const RENDER_SHELL_A14C00_ELEM_INNER_END_OFF = 0x10;
export const RENDER_SHELL_A14C00_ELEM_INNER_CAP_OFF = 0x14;
export const RENDER_SHELL_A14C00_VEC18_OFF = 0x34;
export const RENDER_SHELL_A14C00_VEC18_END_OFF = 0x38;
export const RENDER_SHELL_A14C00_VEC_OFF = 0x40;
export const RENDER_SHELL_A14C00_VEC_END_OFF = 0x44;
export const RENDER_SHELL_A14C00_VEC_CAP_OFF = 0x48;
export const RENDER_SHELL_A14C00_VEC18_MAGIC = 0x2aaaaaab;
export const RENDER_SHELL_A14C00_FLAG_CONST = 1;
export const RENDER_SHELL_A14C00_SIZE_4 = 0x04;
export const RENDER_SHELL_A14C00_SIZE_8 = 0x08;
export const RENDER_SHELL_A14C00_SIZE_C = 0x0c;
export const RENDER_SHELL_A14C00_SIZE_10 = 0x10;
export const RENDER_SHELL_A14C00_SIZE_18 = 0x18;
export const RENDER_SHELL_A14C00_SIZE_20 = 0x20;
export const RENDER_SHELL_A14C00_SIZE_24 = 0x24;
export const RENDER_SHELL_A14C00_SIZE_30 = 0x30;
export const RENDER_SHELL_A14C00_SIZE_40 = 0x40;
/* Size per type 8..0x1c, transcribed from the PE's 29 dwords at
   0xa14f10 (idx 0..7 -> err B -> 0). */
export const RENDER_SHELL_A14C00_SIZE_TABLE = [
  0, 0, 0, 0, 0, 0, 0, 0,
  0x04, 0x08, 0x0c, 0x10,
  0x04, 0x08, 0x0c, 0x10,
  0x04, 0x08, 0x0c, 0x10,
  0x10, 0x18, 0x20, 0x18,
  0x24, 0x30, 0x20, 0x30, 0x40,
];

/* ABI v44: FUN_00a14f90 render-shell class method — vtable slot +0x0c
   of the 0xb81bac vtable (slots +0 a145e0 / +4 a149a0 pinned v39/v42;
   next method slot +0x14 = 0xa150d0). Plain ebp frame (no SEH/GS);
   ret 4 @ 0xa15035; this=ecx. Signature (this, list@[ebp+8] nullable
   dword-index vector): list == 0 -> &this+0x40 (the vec a14c00's
   step-6 rewalk fills). Walk: count = (list[4]-list[0])>>2 SAR,
   re-derived per iteration; count == 0 skips. Per i in [0,count):
   value = list[i]; elem = this->vec18[i] (stride 0x18 at this+0x34);
   inner_count = (elem[0x10]-elem[0xc])>>2 SAR; value >= inner_count
   (UNSIGNED jae) -> skip; inner_value = elem_inner[value]; type =
   elem[8]; type <= 7 (UNSIGNED) -> DAT 0xc79928[type] = inner_value;
   else vtable slot +0x1c (this, name, type, inner_value, flag) — 4
   args. Flush: per i in 0..7: val = DAT 0xc79928[i]; val != 0 (FULL
   dword) -> vtable slot +0x18 (this, i, val) — 2 args. Pure scalar
   laws; host owns all memory + the two vtable slots.
   NEXT_VA 0xa15040 (find helper leaf). Next class method 0xa150d0. */
export const RENDER_SHELL_A14F90_HOST_VA = 0x00a14f90;
export const RENDER_SHELL_A14F90_END_VA = 0x00a15037;
export const RENDER_SHELL_A14F90_NEXT_VA = 0x00a15040;
export const RENDER_SHELL_A14F90_NEXT_METHOD_VA = 0x00a150d0;
export const RENDER_SHELL_A14F90_VTABLE_VA = 0x00b81bac;
export const RENDER_SHELL_A14F90_VTABLE_SLOT = 0x0c;
export const RENDER_SHELL_A14F90_SLOT_PER_ELEM = 0x1c;
export const RENDER_SHELL_A14F90_SLOT_FLUSH = 0x18;
export const RENDER_SHELL_A14F90_PER_ELEM_ARGS = 4;
export const RENDER_SHELL_A14F90_FLUSH_ARGS = 2;
export const RENDER_SHELL_A14F90_TABLE_VA = 0x00c79928;
export const RENDER_SHELL_A14F90_TABLE_ENTRIES = 8;
export const RENDER_SHELL_A14F90_TABLE_MAX_TYPE = 7;
export const RENDER_SHELL_A14F90_LIST_FALLBACK_OFF = 0x40;
export const RENDER_SHELL_A14F90_VEC18_OFF = 0x34;
export const RENDER_SHELL_A14F90_ELEM_STRIDE = 0x18;
export const RENDER_SHELL_A14F90_ELEM_NAME_OFF = 0x00;
export const RENDER_SHELL_A14F90_ELEM_FLAG_OFF = 0x04;
export const RENDER_SHELL_A14F90_ELEM_TYPE_OFF = 0x08;
export const RENDER_SHELL_A14F90_ELEM_INNER_BEGIN_OFF = 0x0c;
export const RENDER_SHELL_A14F90_ELEM_INNER_END_OFF = 0x10;
export const RENDER_SHELL_A14F90_STACK_ARGS = 1;

/* ABI v45: FUN_00a150d0 render-shell class method — vtable slot +0x14
   of the 0xb81bac vtable (slots +0 a145e0 / +4 a149a0 / +0xc a14f90
   pinned v39/v42/v44; this body at +0x14). SEH+GS prologue; ret;
   this=ecx. Same object family: built by a14620 (v40), extended by
   a14c00 (v43), walked by a14f90 (v44). Body: Phase A per-element
   inner-dword free (count = vec18 MAGIC div by 0x18 re-derived per
   iteration; inner_count = (end-begin)>>2 SAR; inner_count==0 skips;
   last = [begin + inner_count*4 - 4]; [elem+8] > 7 SIGNED -> per-j
   full-dword tracked-free of inner[j] + store 0; collapse end=begin;
   begin==cap -> 42c920 grow else store last + end=begin+4). Phase B
   vec rewalk: vec emptied (end=begin); per element push
   inner_count-1 (SAR then dec) via direct store or 42c920 grow.
   Tracked-free (1 site): sel=[0xc7de78]; base = sel? sel+0x30 :
   0xc7f618; lo -= [ptr-4]; sbb hi; free IAT [0xb187dc]. Grow gate =
   cmp/je EQUALITY (direct store when ptr != cap). Laws pure scalars.
   NARROWED not removed. NEXT_VA 0xa152a0 (vec18 push leaf; the
   a14c00 PUSH_VA). */
export const RENDER_SHELL_A150D0_HOST_VA = 0x00a150d0;
export const RENDER_SHELL_A150D0_END_VA = 0x00a15296;
export const RENDER_SHELL_A150D0_NEXT_VA = 0x00a152a0;
export const RENDER_SHELL_A150D0_VTABLE_VA = 0x00b81bac;
export const RENDER_SHELL_A150D0_VTABLE_SLOT = 0x14;
export const RENDER_SHELL_A150D0_FREE_IAT_VA = 0x00b187dc;
export const RENDER_SHELL_A150D0_COUNTER_SEL_VA = 0x00c7de78;
export const RENDER_SHELL_A150D0_COUNTER_FALLBACK_VA = 0x00c7f618;
export const RENDER_SHELL_A150D0_COUNTER_OFF = 0x30;
export const RENDER_SHELL_A150D0_COUNTER_LO_OFF = 0x00;
export const RENDER_SHELL_A150D0_COUNTER_HI_OFF = 0x04;
export const RENDER_SHELL_A150D0_GROW_VA = 0x0042c920;
export const RENDER_SHELL_A150D0_TYPE_FREE_MAX = 7;
export const RENDER_SHELL_A150D0_VEC18_MAGIC = 0x2aaaaaab;
export const RENDER_SHELL_A150D0_VEC18_OFF = 0x34;
export const RENDER_SHELL_A150D0_VEC18_END_OFF = 0x38;
export const RENDER_SHELL_A150D0_VEC18_STRIDE = 0x18;
export const RENDER_SHELL_A150D0_VEC_OFF = 0x40;
export const RENDER_SHELL_A150D0_VEC_END_OFF = 0x44;
export const RENDER_SHELL_A150D0_VEC_CAP_OFF = 0x48;
export const RENDER_SHELL_A150D0_ELEM_TYPE_OFF = 0x08;
export const RENDER_SHELL_A150D0_ELEM_INNER_BEGIN_OFF = 0x0c;
export const RENDER_SHELL_A150D0_ELEM_INNER_END_OFF = 0x10;
export const RENDER_SHELL_A150D0_ELEM_INNER_CAP_OFF = 0x14;
export const RENDER_SHELL_A150D0_RETAIN_STORE_SIZE = 0x04;
export const RENDER_SHELL_A150D0_PUSH_DEC = 1;




export const RENDER_SHELL_HOST_A0F550_VA = 0x00a0f550;
export const RENDER_SHELL_HOST_A10D00_VA = 0x00a10d00; /* pure-complete v24 */
export const RENDER_SHELL_HOST_A10950_VA = 0x00a10950; /* pure-complete v24 */
export const RENDER_SHELL_HOST_A10760_VA = 0x00a10760; /* pure-complete v24 */
export const RENDER_SHELL_409CB0_FLAG_BIT8 = 0x08;
export const RENDER_SHELL_409CB0_PLAN_PURE = 0;
export const RENDER_SHELL_409CB0_PLAN_HOST_BODY = 1;
/* ABI v25: 409cb0 whole-body pure compute */
export const RENDER_SHELL_409CB0_COLOR_ARG = -1;
export const RENDER_SHELL_409CB0_DAT_C71678_VA = 0x00c71678;
export const RENDER_SHELL_409CB0_DAT_C33910_VA = 0x00c33910;
export const RENDER_SHELL_409CB0_DAT_C7B640_VA = 0x00c7b640;
export const RENDER_SHELL_409CB0_DAT_C7B644_VA = 0x00c7b644;
export const RENDER_SHELL_409CB0_DAT_C7977D_VA = 0x00c7977d;
export const RENDER_SHELL_409CB0_CAM_X_OFF = 0x2650c;
export const RENDER_SHELL_409CB0_CAM_Y_OFF = 0x26510;
export const RENDER_SHELL_F32_DEG2RAD_BITS = 0x3c8efa35;
export const RENDER_SHELL_409CB0_DEG2RAD_VA = 0x00baa088;
export const RENDER_SHELL_409CB0_ANM2_FLAGS_OFF = 0x110;
export const RENDER_SHELL_409CB0_ANM2_FLIP_X_OFF = 0x100;
export const RENDER_SHELL_409CB0_ANM2_FLIP_Y_OFF = 0x101;
export const RENDER_SHELL_409CB0_ANM2_OFF_X_OFF = 0x94;
export const RENDER_SHELL_409CB0_ANM2_OFF_Y_OFF = 0x98;
export const RENDER_SHELL_409CB0_ANM2_SCALE_X_OFF = 0x9c;
export const RENDER_SHELL_409CB0_ANM2_SCALE_Y_OFF = 0xa0;
export const RENDER_SHELL_409CB0_ANM2_ROT_OFF = 0xa4;
export const RENDER_SHELL_409CB0_LAYER_FLAGS_OFF = 0x8c;
export const RENDER_SHELL_409CB0_LAYER_FLIP_X_OFF = 0x32;
export const RENDER_SHELL_409CB0_LAYER_FLIP_Y_OFF = 0x33;
export const RENDER_SHELL_409CB0_LAYER_SIZE_X_OFF = 0x34;
export const RENDER_SHELL_409CB0_LAYER_SIZE_Y_OFF = 0x38;
export const RENDER_SHELL_409CB0_LAYER_ROT_OFF = 0x3c;
export const RENDER_SHELL_409CB0_LAYER_POS_X_OFF = 0x40;
export const RENDER_SHELL_409CB0_LAYER_POS_Y_OFF = 0x44;
export const RENDER_SHELL_409CB0_FRAME_REF_X_OFF = 0x08;
export const RENDER_SHELL_409CB0_FRAME_REF_Y_OFF = 0x0c;
export const RENDER_SHELL_409CB0_FRAME_POS_X_OFF = 0x10;
export const RENDER_SHELL_409CB0_FRAME_POS_Y_OFF = 0x14;
export const RENDER_SHELL_409CB0_FRAME_SCALE_X_OFF = 0x18;
export const RENDER_SHELL_409CB0_FRAME_SCALE_Y_OFF = 0x1c;
export const RENDER_SHELL_409CB0_FRAME_PIVOT_X_OFF = 0x20;
export const RENDER_SHELL_409CB0_FRAME_PIVOT_Y_OFF = 0x24;
export const RENDER_SHELL_409CB0_FRAME_ROT_OFF = 0x5c;
/* ABI v24: dest-quad nested pure bodies */
export const RENDER_SHELL_DEST_QUAD_SIZE = 0x20;
export const RENDER_SHELL_A10D00_OBJ_SIZE = 0x70;
export const RENDER_SHELL_A10D00_COLOR_OFF = 0x20;
export const RENDER_SHELL_A10D00_COLOR_DWORDS = 5;
export const RENDER_SHELL_A10D00_COLOR_COPIES = 4;
export const RENDER_SHELL_HOST_41D540_VA = 0x0041d540;
export const RENDER_SHELL_HOST_41D520_VA = 0x0041d520;
export const RENDER_SHELL_A10950_PLAN_SKIP = 0;
export const RENDER_SHELL_A10950_PLAN_APPLY = 1;
export const RENDER_SHELL_A10760_PLAN_SKIP = 0;
export const RENDER_SHELL_A10760_PLAN_APPLY = 1;
export const RENDER_SHELL_F32_ZERO_BITS = 0x00000000;
/* ABI v23: opaque_call_0040c6f0 color-ring pure-complete */
export const RENDER_SHELL_40C6F0_DAT_C78DB4_VA = 0x00c78db4;
export const RENDER_SHELL_40C6F0_DAT_C78DB8_VA = 0x00c78db8;
export const RENDER_SHELL_40C6F0_DAT_C78DBC_VA = 0x00c78dbc;
export const RENDER_SHELL_40C6F0_DAT_C78DC0_VA = 0x00c78dc0;
export const RENDER_SHELL_40C6F0_PLAN_PURE = 0;
/* ABI v20: opaque_call_00408590 pure CF + nested 0x40c550 */
export const RENDER_SHELL_HOST_40C550_VA = 0x0040c550;
export const RENDER_SHELL_408590_PLAN_PURE_NULL = 0;
export const RENDER_SHELL_408590_PLAN_COPY = 1;
export const RENDER_SHELL_408590_PLAN_VT44 = 2;
export const RENDER_SHELL_408590_PLAN_VT48 = 3;
export const RENDER_SHELL_408590_PLAN_VT_BOTH = 4;
export const RENDER_SHELL_408590_LAYER_SPRITE_OFF = 0x98;
export const RENDER_SHELL_408590_LAYER_CTRL_OFF = 0x9c;
export const RENDER_SHELL_408590_LAYER_A0_OFF = 0x20;
export const RENDER_SHELL_408590_LAYER_A1_OFF = 0x24;
export const RENDER_SHELL_408590_LAYER_B0_OFF = 0x28;
export const RENDER_SHELL_408590_LAYER_B1_OFF = 0x2c;
export const RENDER_SHELL_408590_SPRITE_A0_OFF = 0x30;
export const RENDER_SHELL_408590_SPRITE_A1_OFF = 0x34;
export const RENDER_SHELL_408590_SPRITE_B0_OFF = 0x38;
export const RENDER_SHELL_408590_SPRITE_B1_OFF = 0x3c;
export const RENDER_SHELL_408590_VT_PAIR_A_OFF = 0x44;
export const RENDER_SHELL_408590_VT_PAIR_B_OFF = 0x48;
export const RENDER_SHELL_40C550_OBJ_OFF = 0;
export const RENDER_SHELL_40C550_CTRL_OFF = 4;
/* ABI v26: 40c550 continuation chain + 408590 recapture + af0917 floor */
export const RENDER_SHELL_40C550_SRC_VT_ADDREF_OFF = 0x04;
export const RENDER_SHELL_40C550_DEST_VT_RELEASE_OFF = 0x0c;
export const RENDER_SHELL_40C550_HOOK_DAT_VA = 0x00c7163c;
export const RENDER_SHELL_40C550_PLAN_ZERO_ONLY = 0;
export const RENDER_SHELL_40C550_PLAN_ADDREF = 1;
export const RENDER_SHELL_40C550_RESUME_ABORT = 0;
export const RENDER_SHELL_40C550_RESUME_RELEASE = 1;
export const RENDER_SHELL_40C550_RESUME_ASSIGN = 2;
export const RENDER_SHELL_40C550_POST_NO_HOOK = 0;
export const RENDER_SHELL_40C550_POST_HOOK = 1;
export const RENDER_SHELL_408590_ENTRY_TAIL_COPY = 0;
export const RENDER_SHELL_408590_ENTRY_PAIR_A = 1;
export const RENDER_SHELL_408590_ENTRY_CHECK_B = 2;
export const RENDER_SHELL_408590_POST_A_TAIL_COPY = 0;
export const RENDER_SHELL_408590_POST_A_PAIR_B = 1;
export const RENDER_SHELL_AF0917_IAT_VA = 0x00b18840;
/* ABI v27: mode-44 / GetRoomByIdx cluster */
export const RENDER_SHELL_740BC0_ONCE_PLAN_SKIP = 0;
export const RENDER_SHELL_740BC0_ONCE_PLAN_HEADER = 1;
export const RENDER_SHELL_740BC0_ONCE_RESUME_SKIP = 0;
export const RENDER_SHELL_740BC0_ONCE_RESUME_CONSTRUCT = 1;
export const RENDER_SHELL_740BC0_ONCE_GUARD_UNINIT = -1;
export const RENDER_SHELL_740BC0_WALK_ENTRY_PTR_OFF = 0;
export const RENDER_SHELL_740BC0_WALK_KIND_OFF = -4;
export const RENDER_SHELL_740BC0_WALK_PTR_TYPE_OFF = 8;
export const RENDER_SHELL_740BC0_WALK_PTR_VAR_OFF = 0x10;
export const RENDER_SHELL_740BC0_WALK_NO_MATCH = 0;
export const RENDER_SHELL_740BC0_MAX_RECURSE_DEPTH = 4;
export const RENDER_SHELL_74F690_STAGE_RELOAD_VA = 0x0074f6f0;
/* ABI v28: RoomDescriptor::constructor @ 0x006ef590 (exact ZHL) */
/* ABI v29: vector<EntitySaveState> grow 0x00708eb0 */
export const RENDER_SHELL_708EB0_MAX_LEN = 0x2222222;
export const RENDER_SHELL_708EB0_SHL_A = 4;
export const RENDER_SHELL_708EB0_SHL_B = 3;
export const RENDER_SHELL_HOST_40CF00_VA = 0x0040cf00;
export const RENDER_SHELL_HOST_4D3130_VA = 0x004d3130;
export const RENDER_SHELL_HOST_4D7340_VA = 0x004d7340;
/* ABI v29: entity-list loop re-derived bound */
export const RENDER_SHELL_ENTITY_COUNT_OFF = 0x1264;
export const RENDER_SHELL_ENTITY_ARRAY_OFF = 0x125c;
export const RENDER_SHELL_ENTITY_ELEM = 4;
export const RENDER_SHELL_ENTITY_RENDER_VA = 0x00806c20;
export const RENDER_SHELL_6EF590_VA = 0x006ef590;
export const RENDER_SHELL_6EF590_DESC_SIZE = 0xb8;
export const RENDER_SHELL_6EF590_NEG_HEAD_OFF = 0x00;
export const RENDER_SHELL_6EF590_NEG_HEAD_COUNT = 3;
export const RENDER_SHELL_6EF590_ZERO_A_OFF = 0x0c;
export const RENDER_SHELL_6EF590_ZERO_A_COUNT = 4;
export const RENDER_SHELL_6EF590_NEG_LATE_OFF = 0x1c;
export const RENDER_SHELL_6EF590_NEG_LATE_COUNT = 8;
export const RENDER_SHELL_6EF590_ZERO_B_OFF = 0x3c;
export const RENDER_SHELL_6EF590_ZERO_B_COUNT = 3;
export const RENDER_SHELL_6EF590_ZERO_C_OFF = 0x48;
export const RENDER_SHELL_6EF590_ZERO_C_COUNT = 8;
export const RENDER_SHELL_6EF590_GRID_BEGIN_OFF = 0x68;
export const RENDER_SHELL_6EF590_GRID_END_OFF = 0x6c;
export const RENDER_SHELL_6EF590_GRID_CAP_OFF = 0x70;
export const RENDER_SHELL_6EF590_GRID_ALLOC_REQ = 0x3823;
export const RENDER_SHELL_6EF590_GRID_ALIGN = 0x20;
export const RENDER_SHELL_6EF590_GRID_ALIGN_BIAS = 0x23;
export const RENDER_SHELL_6EF590_GRID_BYTES = 0x3800;
export const RENDER_SHELL_6EF590_GRID_COUNT = 0x1c0;
export const RENDER_SHELL_6EF590_GRID_ELEM = 0x20;
export const RENDER_SHELL_6EF590_GRID_MAGIC = 0x16a9de81;
export const RENDER_SHELL_6EF590_ENTITY_SAVE_SIZE = 0x78;
export const RENDER_SHELL_6EF590_VEC_A_OFF = 0x74;
export const RENDER_SHELL_6EF590_VEC_B_OFF = 0x88;
export const RENDER_SHELL_6EF590_VEC_A_RESERVE = 0x10;
export const RENDER_SHELL_6EF590_VEC_B_RESERVE = 0x20;
export const RENDER_SHELL_6EF590_VEC_DIV_MAGIC = 0x88888889;
export const RENDER_SHELL_6EF590_VEC_DIV_SHIFT = 6;
export const RENDER_SHELL_6EF590_MAP_OFF = 0x80;
export const RENDER_SHELL_6EF590_MAP_SIZE_OFF = 0x84;
export const RENDER_SHELL_6EF590_NODE_ALLOC_REQ = 0x14;
export const RENDER_SHELL_6EF590_NODE_FLAGS_WORD = 0x0101;
export const RENDER_SHELL_6EF590_TAIL_ZERO_OFF = 0x94;
export const RENDER_SHELL_6EF590_TAIL_ZERO_LEN = 0x10;
export const RENDER_SHELL_6EF590_HOLE_OFF = 0xa4;
export const RENDER_SHELL_6EF590_HOLE_LEN = 8;
export const RENDER_SHELL_6EF590_WORD_A_OFF = 0xac;
export const RENDER_SHELL_6EF590_WORD_B_OFF = 0xae;
export const RENDER_SHELL_6EF590_TAIL_ZERO_DWORD_OFF = 0xb0;
export const RENDER_SHELL_6EF590_TAIL_NEG_DWORD_OFF = 0xb4;
export const RENDER_SHELL_HOST_4D6EE0_VA = 0x004d6ee0;
export const RENDER_SHELL_HOST_708EB0_VA = 0x00708eb0;
export const RENDER_SHELL_HOST_424540_VA = 0x00424540;
export const RENDER_SHELL_6EF590_FAIL_IAT_VA = 0x00b18894;
export const RENDER_SHELL_40C550_VT_ADDREF_OFF = 4;
/** PE DAT_00b6a878 5×5 stage-type table (stage ≤ 6). */
export const RENDER_SHELL_74F690_TABLE_LO = Object.freeze([
  0, 0, 0, 2, 2, 0, 0, 2, 2, 2, 0, 1, 0, 2, 4, 1, 1, 1, 4, 5, 1, 1, 4, 5, 5,
]);
/** PE DAT_00b6a8e0 5×5 stage-type table (stage 7/8 far). */
export const RENDER_SHELL_74F690_TABLE_HI = Object.freeze([
  0, 0, 0, 0, 2, 0, 0, 0, 2, 2, 0, 0, 0, 2, 2, 0, 1, 1, 1, 2, 1, 1, 1, 1, 2,
]);
export const RENDER_SHELL_OVERLAY_CLAMP_VA = 0x00c7b640;
export const RENDER_SHELL_OVERLAY_SCALE_X_OFF = 0x6edc;
export const RENDER_SHELL_OVERLAY_SCALE_Y_OFF = 0x6ee0;
export const RENDER_SHELL_OVERLAY_COLOR_OFF = 0x6ee8;
export const RENDER_SHELL_OVERLAY_COLOR_SIZE = 0x2c;
export const RENDER_SHELL_OVERLAY_DRAW_FLAG_OFF = 0x6f49;
export const RENDER_SHELL_OVERLAY_SWAP_FLAG_OFF = 0x6eb0;
export const RENDER_SHELL_OVERLAY_ANIM_A_OFF = 0x6e70;
export const RENDER_SHELL_OVERLAY_ANIM_B_OFF = 0x6e90;
export const RENDER_SHELL_OVERLAY_PLAN_SKIP = 0;
export const RENDER_SHELL_OVERLAY_PLAN_ORDER_A = 1;
export const RENDER_SHELL_OVERLAY_PLAN_ORDER_B = 2;
export const RENDER_SHELL_F32_TWO_BITS = 0x40000000;
export const RENDER_SHELL_F32_60_BITS = 0x42700000;
export const RENDER_SHELL_F32_140_BITS = 0x430c0000;
export const RENDER_SHELL_F32_182_BITS = 0x43360000;
export const RENDER_SHELL_F32_338_BITS = 0x43a90000;
export const RENDER_SHELL_F32_0_65_BITS = 0x3f266666;
export const RENDER_SHELL_F32_FORTY_BITS = 0x42200000;
export const RENDER_SHELL_F32_TWENTY_BITS = 0x41a00000;
export const RENDER_SHELL_F32_HUNDRED_TWENTY_BITS = 0x42f00000;
export const RENDER_SHELL_81F8B0_ROW_STRIDE = 0x20;
export const RENDER_SHELL_81F8B0_AABB_FLOATS = 8;
export const RENDER_SHELL_81F8B0_TABLE_BASE = 0x00c35b80;
export const RENDER_SHELL_81F8B0_PLAN_FALLBACK = 0;
export const RENDER_SHELL_81F8B0_PLAN_PURE = 1;
export const RENDER_SHELL_81F8B0_PLAN_LIVE = 2;
export const RENDER_SHELL_81F8B0_ROW_DWORDS = 8;
export const RENDER_SHELL_F32_255_BITS = 0x437f0000;
export const RENDER_SHELL_F32_A10C00_DAT0_BITS = 0x3760371c;
export const RENDER_SHELL_F32_A10C00_DAT1_BITS = 0x37873770;
export const RENDER_SHELL_A10C00_SRC_DWORDS = 5;
export const RENDER_SHELL_A10C00_COPY_COUNT = 4;

function asU8(v) {
  return (v | 0) & 0xff;
}

function asI32(v) {
  return v | 0;
}

function asU32(v) {
  return v >>> 0;
}

function f32(v) {
  return Math.fround(v);
}

function f32FromBits(bits) {
  const buf = new ArrayBuffer(4);
  new DataView(buf).setUint32(0, asU32(bits), true);
  return new DataView(buf).getFloat32(0, true);
}

/** SSE minss: unordered/NaN or a >= b → b. */
function sseMinss(a, b) {
  const x = f32(a);
  const y = f32(b);
  return x < y ? x : y;
}

/** SSE maxss: unordered/NaN or a <= b → b. */
function sseMaxss(a, b) {
  const x = f32(a);
  const y = f32(b);
  return x > y ? x : y;
}

/** G0 VA 0x0080eb1c: option byte ManagerOpts+0x2a3c3 != 0 → main body. */
export function renderShellMainBodyNeeded(option2a3c3) {
  return asU8(option2a3c3) !== 0;
}

/**
 * G1 VA 0x0080eb2e: comiss/ja — host 6f9400/6f95a0 when NOT strictly > 0.
 * Matches PE for finite and NaN (NaN → needs host).
 */
export function renderShellManagerFadePollNeeded(managerFade26518) {
  const x = f32(managerFade26518);
  return !(x > 0);
}

/** G2 VA 0x0080ec00: room flags word bit 9. */
export function renderShellRoomFlagsBit9(roomFlagsAt44) {
  return ((asU32(roomFlagsAt44) >>> 9) & 1) !== 0;
}

/** P0 VA 0x0080ecbd: camera = Game camera + manager scroll (float32). */
export function renderShellCameraOffset(game1204, game1208, mgr2650c, mgr26510) {
  return {
    outX: f32(f32(game1204) + f32(mgr2650c)),
    outY: f32(f32(game1208) + f32(mgr26510)),
  };
}

/** G3 VA 0x0080ecb6: stage id == 0x39 → host FUN_0083a1b0. */
export function renderShellStage39HostNeeded(stage1d18) {
  return asI32(stage1d18) === RENDER_SHELL_STAGE_SPECIAL_39;
}

/**
 * G10 VA 0x0080ecfb: non-39 fade block when room flags bit 9 clear
 * (stage != 0x39 already selected by caller).
 */
export function renderShellNon39FadeBlockNeeded(roomFlagsAt44) {
  return ((asU32(roomFlagsAt44) >>> 9) & 1) === 0;
}

/** P4a VA 0x0080ed0c: Manager+0x26550 | Manager+0xc. */
export function renderShellFadeMgrWordsOr(manager26550, managerWord0c) {
  return (asU32(manager26550) | asU32(managerWord0c)) >>> 0;
}

/**
 * P4b VA 0x0080ed1a: ((~poll_b) & (poll_a | mgr_or)) & 1 → select 1.0f base.
 */
export function renderShellFadePollSelectsOne(mgrOr, poll6f9400, poll6f95a0) {
  const combined =
    (~asU32(poll6f95a0) & (asU32(poll6f9400) | asU32(mgrOr))) >>> 0;
  return (combined & 1) !== 0;
}

/** P4c VA 0x0080ed2f: 1.0f if selects_one else mgr_2651c * mgr_26518. */
export function renderShellFadeBase(selectsOne, manager2651c, manager26518) {
  if (selectsOne) {
    return f32FromBits(RENDER_SHELL_F32_ONE_BITS);
  }
  return f32(f32(manager2651c) * f32(manager26518));
}

/** G11 VA 0x0080ed58: Game+8 == 8 || == 0x1d. */
export function renderShellFadeBoostModeOpen(gameField8) {
  const m = asI32(gameField8);
  return m === RENDER_SHELL_FADE_BOOST_MODE_8 || m === RENDER_SHELL_FADE_BOOST_MODE_1D;
}

/**
 * G11b combine after optional hosts 74efd0 / 827bc0.
 * PE: mode || (74efd0 && 1830c==1) || 827bc0.
 */
export function renderShellFadeBoostNeeded(
  modeOpen,
  host74efd0True,
  manager1830cEq1,
  host827bc0True,
) {
  if (modeOpen) return true;
  if (host74efd0True && manager1830cEq1) return true;
  if (host827bc0True) return true;
  return false;
}

/**
 * P111 VA 0x00827bc0..0x00827bd1: probe-B pre-gate.
 * [receiver+8] == 5 && [[receiver+4]+0x10]+0x10 == 0x59 (full-dword cmp/
 * jne, sign-agnostic). Op-for-op identical to renderShellStageOverlayDualOpen
 * (overlay G7 at VA 0x0080ef08/0x0080ef18); the cross-helper agreement is
 * pinned by the tests. Receiver basis per call census: Game* at 0x0080ed7c,
 * [Manager+0x18300] at 0x00762646 / 0x009379d4.
 */
export function renderShell827bc0PreGate(receiverField8, nestedRoomType10) {
  return (
    asI32(receiverField8) === RENDER_SHELL_827BC0_FIELD8_TARGET &&
    asI32(nestedRoomType10) === RENDER_SHELL_827BC0_NEST_TYPE_TARGET
  );
}

/** P112 VA 0x00827bc0: entry plan — FALSE (0) pure AL=0 without 74ea50,
 *  HOST (1) when the pre-gate passes and the host must evaluate
 *  74ea50(Manager=[0xc71678]) (nested polls/probe stay host). */
export function renderShell827bc0EntryPlan(receiverField8, nestedRoomType10) {
  return renderShell827bc0PreGate(receiverField8, nestedRoomType10)
    ? RENDER_SHELL_827BC0_PLAN_HOST
    : RENDER_SHELL_827BC0_PLAN_FALSE;
}

/**
 * P113 VA 0x00827bdd..0x00827be6: resume byte test.
 * test al,al; je -> xor al,al; ret / mov al,1; ret — only AL (the LOW byte)
 * decides, so wide values are narrowed here and NEVER pre-masked by callers.
 */
export function renderShell827bc0ResumeAl(host74ea50Al) {
  return asU8(host74ea50Al) !== 0 ? 1 : 0;
}

/** P114 complete probe-B AL given the host's 74ea50 result. */
export function renderShell827bc0EvalAl(
  receiverField8,
  nestedRoomType10,
  host74ea50Al,
) {
  if (!renderShell827bc0PreGate(receiverField8, nestedRoomType10)) {
    return 0;
  }
  return renderShell827bc0ResumeAl(host74ea50Al);
}

/** P115 host VA of opaque_call_00827bc0. */
export function renderShell827bc0HostVa() {
  return RENDER_SHELL_HOST_827BC0_VA >>> 0;
}

/* ---- ABI v34: FUN_00a140c0 ring-matrix bind ---- */

/** P116 VA 0x00a140fd…0x00a14116: G24 as a140c0 pre-gate. */
export function renderShellA140c0PreGate(
  shaderId,
  boundIsnil,
  boundKey,
  boundPtr,
  mapRootC379bc,
) {
  return (
    renderShellA14050ChainPlan(
      shaderId,
      boundIsnil,
      boundKey,
      boundPtr,
      mapRootC379bc,
    ) === RENDER_SHELL_A14050_CHAIN_PLAN_FOUND
  );
}

/** P117 VA 0x00a1412a / 0x00a14134: value != 0 && (byte[value+4] & 1). */
export function renderShellA140c0BindOk(valueAtPtr, byteAtValuePlus4) {
  return renderShellA14050BindOk(valueAtPtr, byteAtValuePlus4);
}

/**
 * P118 VA 0x00a1414a…0x00a1415d.
 * test al,3 on (cursor+write_idx); if aligned, grow when cap <= (cursor+4)>>2.
 */
export function renderShellA140c0GrowNeeded(cursor, writeIdx, capacity) {
  const sum = (asU32(cursor) + asU32(writeIdx)) >>> 0;
  if ((sum & RENDER_SHELL_A140C0_ALIGN_MASK) !== 0) return false;
  const need = (asU32(cursor) + 4) >>> 2;
  return asU32(capacity) <= need;
}

/** P119 VA 0x00a1417c: cap*4 - 1. */
export function renderShellA140c0WriteMask(capacity) {
  return (asU32(capacity) * 4 - 1) >>> 0;
}

/** P119 VA 0x00a14184: write_idx &= mask. */
export function renderShellA140c0WriteIndex(writeIdx, capacity) {
  return (asU32(writeIdx) & renderShellA140c0WriteMask(capacity)) >>> 0;
}

/** P119 VA 0x00a1418c: wrapped write_idx + cursor. */
export function renderShellA140c0Slot(cursor, writeIdx, capacity) {
  return (renderShellA140c0WriteIndex(writeIdx, capacity) + asU32(cursor)) >>> 0;
}

/** P119 VA 0x00a14183/0x00a14193: ((cap-1) & (slot>>2))*4. */
export function renderShellA140c0PageOff(cursor, writeIdx, capacity) {
  const slot = renderShellA140c0Slot(cursor, writeIdx, capacity);
  const pageIdx = ((asU32(capacity) - 1) >>> 0) & (slot >>> 2);
  return (pageIdx * 4) >>> 0;
}

/** P119 VA 0x00a141cc: slot & 3. */
export function renderShellA140c0SlotInPage(cursor, writeIdx, capacity) {
  return renderShellA140c0Slot(cursor, writeIdx, capacity) &
    RENDER_SHELL_A140C0_ALIGN_MASK;
}

/** P120 VA 0x00a141a5: page dword != 0. */
export function renderShellA140c0PagePresent(pagePtr) {
  return asU32(pagePtr) !== 0;
}

/** P121 whole-body entry plan over recaptured G24/G25 + ring DAT. */
export function renderShellA140c0EntryPlan(
  shaderId,
  boundIsnil,
  boundKey,
  boundPtr,
  mapRootC379bc,
  valueAtPtr,
  byteAtValuePlus4,
  cursor,
  writeIdx,
  capacity,
  pagePtr,
) {
  if (!renderShellA140c0PreGate(
    shaderId, boundIsnil, boundKey, boundPtr, mapRootC379bc,
  )) {
    return RENDER_SHELL_A140C0_PLAN_FALSE;
  }
  if (!renderShellA140c0BindOk(valueAtPtr, byteAtValuePlus4)) {
    return RENDER_SHELL_A140C0_PLAN_FALSE;
  }
  if (renderShellA140c0GrowNeeded(cursor, writeIdx, capacity)) {
    return RENDER_SHELL_A140C0_PLAN_GROW;
  }
  if (!renderShellA140c0PagePresent(pagePtr)) {
    return RENDER_SHELL_A140C0_PLAN_ALLOC;
  }
  return RENDER_SHELL_A140C0_PLAN_PURE;
}

/** P122 post-grow resume: recaptured page dword decides ALLOC vs PURE. */
export function renderShellA140c0GrowResumePlan(pagePtrAfter) {
  return renderShellA140c0PagePresent(pagePtrAfter)
    ? RENDER_SHELL_A140C0_PLAN_PURE
    : RENDER_SHELL_A140C0_PLAN_ALLOC;
}

/**
 * P123 VA 0x00a141c9…0x00a141e3 ring stores.
 * @param {DataView|null|undefined} view linear memory; pageBase==0 skips write
 */
export function renderShellA140c0RingApply(view, pageBase, slotInPage, oldC379b8, newValue, cursor) {
  const slot = asU32(slotInPage) & RENDER_SHELL_A140C0_ALIGN_MASK;
  if (view && asU32(pageBase) !== 0) {
    view.setUint32((asU32(pageBase) + slot * 4) >>> 0, asU32(oldC379b8), true);
  }
  return {
    ok: true,
    c379b8: asU32(newValue),
    cursor: (asU32(cursor) + 1) >>> 0,
  };
}

/** P124 complete AL: FALSE → 0, else 1. */
export function renderShellA140c0EvalAl(entryPlan) {
  return asI32(entryPlan) === RENDER_SHELL_A140C0_PLAN_FALSE ? 0 : 1;
}

export function renderShellA140c0HostVa() {
  return RENDER_SHELL_HOST_A140C0_VA >>> 0;
}
export function renderShellA140c0GrowHostVa() {
  return RENDER_SHELL_HOST_44BE50_VA >>> 0;
}
export function renderShellA140c0AllocHostVa() {
  return RENDER_SHELL_HOST_ALLOC_VA >>> 0;
}
export function renderShellA140c0AllocSize() {
  return RENDER_SHELL_A140C0_ALLOC_SIZE >>> 0;
}
export function renderShellA140c0RingThisVa() {
  return RENDER_SHELL_A140C0_RING_THIS_VA >>> 0;
}
export function renderShellA140c0PageTableVa() {
  return RENDER_SHELL_A140C0_PAGE_TABLE_VA >>> 0;
}
export function renderShellA140c0CapVa() {
  return RENDER_SHELL_A140C0_CAP_VA >>> 0;
}
export function renderShellA140c0WriteIdxVa() {
  return RENDER_SHELL_A140C0_WRITE_IDX_VA >>> 0;
}
export function renderShellA140c0CursorVa() {
  return RENDER_SHELL_A140C0_CURSOR_VA >>> 0;
}
export function renderShellA140c0NameColorVa() {
  return RENDER_SHELL_A140C0_NAME_COLOR_VA >>> 0;
}
export function renderShellA140c0NameColorTexVa() {
  return RENDER_SHELL_A140C0_NAME_COLOR_TEX_VA >>> 0;
}
export function renderShellA140c0NameIndexedVa() {
  return RENDER_SHELL_A140C0_NAME_INDEXED_VA >>> 0;
}

/* ---- ABI v35: FUN_00a14200 shader-stack pop + 684fc0 peek ---- */

/** P126 VA 0x00a14207: test esi,esi; jne skip-log. Full dword. */
export function renderShellA14200EmptyNeeded(cursor) {
  return asU32(cursor) === 0;
}

/** P127 whole-body plan. EMPTY_LOG when cursor==0 else PURE. */
export function renderShellA14200EntryPlan(cursor) {
  return renderShellA14200EmptyNeeded(cursor)
    ? RENDER_SHELL_A14200_PLAN_EMPTY_LOG
    : RENDER_SHELL_A14200_PLAN_PURE;
}

/** P128 VA 0x00684fcc…0x00684fd2: cursor+write_idx-1 (uint32 wrap). */
export function renderShell684fc0Slot(cursor, writeIdx) {
  return (asU32(cursor) + asU32(writeIdx) - 1) >>> 0;
}

/** P128 VA 0x00684fd5…0x00684fde: (cap-1) & (slot>>2). */
export function renderShell684fc0PageIdx(cursor, writeIdx, capacity) {
  const slot = renderShell684fc0Slot(cursor, writeIdx);
  return ((asU32(capacity) - 1) >>> 0) & (slot >>> 2);
}

/** P128 VA 0x00684fe3: slot & 3. */
export function renderShell684fc0SlotInPage(cursor, writeIdx) {
  return renderShell684fc0Slot(cursor, writeIdx) &
    RENDER_SHELL_A140C0_ALIGN_MASK;
}

/** P128 page_idx*4. */
export function renderShell684fc0PageOff(cursor, writeIdx, capacity) {
  return (renderShell684fc0PageIdx(cursor, writeIdx, capacity) * 4) >>> 0;
}

/** P128 VA 0x00684fe7…0x00684fea: [page_table+page_off] + (slot&3)*4. */
export function renderShell684fc0SlotAddr(pageBase, cursor, writeIdx, capacity) {
  if (asU32(pageBase) === 0) return 0;
  return (
    asU32(pageBase) +
    (renderShell684fc0SlotInPage(cursor, writeIdx) * 4)
  ) >>> 0;
}

/**
 * P129 VA 0x00a14232: *[slot]. pageBase==0 → 0 (test convenience).
 * @param {DataView|null|undefined} view
 */
export function renderShell684fc0Peek(view, pageBase, cursor, writeIdx, capacity) {
  const addr = renderShell684fc0SlotAddr(pageBase, cursor, writeIdx, capacity);
  if (!view || addr === 0) return 0;
  return view.getUint32(addr, true) >>> 0;
}

/**
 * P130 VA 0x00a1422a…0x00a14247 pop stores.
 * cmove write_idx←0 when (cursor-1)==0 (ZF after sub esi,1).
 */
export function renderShellA14200PopApply(cursor, writeIdx, peeked) {
  const after = (asU32(cursor) - 1) >>> 0;
  return {
    c379b8: asU32(peeked),
    cursor: after,
    writeIdx: after === 0 ? 0 : asU32(writeIdx),
    writeCleared: after === 0,
  };
}

export function renderShellA14200HostVa() {
  return RENDER_SHELL_HOST_A14200_VA >>> 0;
}
export function renderShell684fc0HostVa() {
  return RENDER_SHELL_HOST_684FC0_VA >>> 0;
}
export function renderShellA14200EmptyLogVa() {
  return RENDER_SHELL_HOST_A112C0_VA >>> 0;
}
export function renderShellA14200EmptyMsgVa() {
  return RENDER_SHELL_A14200_EMPTY_MSG_VA >>> 0;
}
export function renderShellA14200EmptyMsgLevel() {
  return RENDER_SHELL_A14200_EMPTY_MSG_LEVEL >>> 0;
}
export function renderShellA14200C379b8Va() {
  return RENDER_SHELL_A14200_C379B8_VA >>> 0;
}
export function renderShell684fc0PageTableOff() {
  return RENDER_SHELL_684FC0_PAGE_TABLE_OFF >>> 0;
}
export function renderShell684fc0CapOff() {
  return RENDER_SHELL_684FC0_CAP_OFF >>> 0;
}
export function renderShell684fc0WriteIdxOff() {
  return RENDER_SHELL_684FC0_WRITE_IDX_OFF >>> 0;
}
export function renderShell684fc0CursorOff() {
  return RENDER_SHELL_684FC0_CURSOR_OFF >>> 0;
}

/* ---- ABI v36: FUN_00a14250 thin +0x14 wrap ---- */

/** P132 always-path host a143f0. */
export function renderShellA14250EntryPlan() {
  return RENDER_SHELL_A14250_PLAN_HOST;
}

/** P133 VA 0x00a14265…0x00a14267: *[pair] + 0x14 (uint32 wrap). */
export function renderShellA14250Resume(pairNode) {
  return (asU32(pairNode) + (RENDER_SHELL_A14250_VALUE_OFF >>> 0)) >>> 0;
}

export function renderShellA14250HostVa() {
  return RENDER_SHELL_HOST_A14250_VA >>> 0;
}
export function renderShellA143f0HostVa() {
  return RENDER_SHELL_HOST_A143F0_VA >>> 0;
}
export function renderShellA14250MapThisVa() {
  return RENDER_SHELL_A14250_MAP_THIS_VA >>> 0;
}
export function renderShellA14250ValueOff() {
  return RENDER_SHELL_A14250_VALUE_OFF >>> 0;
}

/* ---- ABI v37: FUN_00a14330 map operator[] ---- */

/** P135 VA 0x00a1436a…0x00a14375: !isnil && key >= node_key (unsigned). */
export function renderShellA14330LookupHit(nodeIsnil, searchKey, nodeKey) {
  if (asU8(nodeIsnil) !== 0) return false;
  return asU32(searchKey) >= asU32(nodeKey);
}

/** P136 VA 0x00a143c9: node + 0x14. */
export function renderShellA14330ValuePtr(nodePtr) {
  return (asU32(nodePtr) + (RENDER_SHELL_MAP_VALUE_OFF >>> 0)) >>> 0;
}

/** P137 VA 0x00a14377: size == 0x0aaaaaaa. */
export function renderShellA14330MapSizeFull(mapSize) {
  return asU32(mapSize) === (RENDER_SHELL_A14330_SIZE_FULL >>> 0);
}

/**
 * P138 residual plan: FOUND / THROW / INSERT.
 * @returns {number} RENDER_SHELL_A14330_PLAN_*
 */
export function renderShellA14330ResidualPlan(
  nodeIsnil,
  searchKey,
  nodeKey,
  mapSize,
) {
  if (renderShellA14330LookupHit(nodeIsnil, searchKey, nodeKey)) {
    return RENDER_SHELL_A14330_PLAN_FOUND;
  }
  if (renderShellA14330MapSizeFull(mapSize)) {
    return RENDER_SHELL_A14330_PLAN_THROW;
  }
  return RENDER_SHELL_A14330_PLAN_INSERT;
}

/**
 * P139 post-alloc node field init (VA 0x00a1439f…0x00a143ba).
 * @param {DataView} view
 */
export function renderShellA14330NodeInit(view, nodePtr, mapHead, key) {
  const n = asU32(nodePtr);
  const h = asU32(mapHead);
  view.setUint32(n + RENDER_SHELL_MAP_KEY_OFF, asU32(key), true);
  view.setUint32(n + RENDER_SHELL_MAP_VALUE_OFF, 0, true);
  view.setUint32(n + RENDER_SHELL_MAP_LEFT_OFF, h, true);
  view.setUint32(n + RENDER_SHELL_MAP_PARENT_OFF, h, true);
  view.setUint32(n + RENDER_SHELL_MAP_RIGHT_OFF, h, true);
  view.setUint8(n + RENDER_SHELL_MAP_COLOR_OFF, 0);
  view.setUint8(n + RENDER_SHELL_MAP_ISNIL_OFF, 0);
}

export function renderShellA14330HostVa() {
  return RENDER_SHELL_HOST_A14330_VA >>> 0;
}
export function renderShellA14330NextVa() {
  return RENDER_SHELL_A14330_NEXT_VA >>> 0;
}
export function renderShellA14330AllocSize() {
  return RENDER_SHELL_A14330_ALLOC_SIZE >>> 0;
}

/* ---- ABI v38: FUN_00a143f0 map find-or-insert ---- */

/** P140 VA 0x00a14454…0x00a1445f: !isnil && search >= node_key (unsigned jb). */
export function renderShellA143f0LookupHit(nodeIsnil, searchKey, nodeKey) {
  if (asU8(nodeIsnil) !== 0) return false;
  return asU32(searchKey) >= asU32(nodeKey);
}

/** P141 VA 0x00a1447e: size == 0x0aaaaaaa. */
export function renderShellA143f0MapSizeFull(mapSize) {
  return asU32(mapSize) === (RENDER_SHELL_A143F0_SIZE_FULL >>> 0);
}

/**
 * P142 residual plan: FOUND / THROW / INSERT.
 * @returns {number} RENDER_SHELL_A143F0_PLAN_*
 */
export function renderShellA143f0ResidualPlan(
  nodeIsnil,
  searchKey,
  nodeKey,
  mapSize,
) {
  if (renderShellA143f0LookupHit(nodeIsnil, searchKey, nodeKey)) {
    return RENDER_SHELL_A143F0_PLAN_FOUND;
  }
  if (renderShellA143f0MapSizeFull(mapSize)) {
    return RENDER_SHELL_A143F0_PLAN_THROW;
  }
  return RENDER_SHELL_A143F0_PLAN_INSERT;
}

/**
 * P143 post-alloc node field init (VA 0x00a144b0…0x00a144c2).
 * Value store is BYTE at +0x14 (PE `mov byte [ebx+0x14], 0`), not dword.
 * @param {DataView} view
 */
export function renderShellA143f0NodeInit(view, nodePtr, mapHead, key) {
  const n = asU32(nodePtr);
  const h = asU32(mapHead);
  view.setUint32(n + RENDER_SHELL_MAP_KEY_OFF, asU32(key), true);
  view.setUint8(n + RENDER_SHELL_MAP_VALUE_OFF, 0);
  view.setUint32(n + RENDER_SHELL_MAP_LEFT_OFF, h, true);
  view.setUint32(n + RENDER_SHELL_MAP_PARENT_OFF, h, true);
  view.setUint32(n + RENDER_SHELL_MAP_RIGHT_OFF, h, true);
  view.setUint16(n + RENDER_SHELL_MAP_COLOR_OFF, 0, true);
}

/** P144 VA 0x00a14461…0x00a14466: pair.node = bound; pair.inserted = 0. */
export function renderShellA143f0FoundPair(view, pairPtr, node) {
  const p = asU32(pairPtr);
  view.setUint32(p, asU32(node), true);
  view.setUint8(p + RENDER_SHELL_A143F0_PAIR_INSERTED_OFF, RENDER_SHELL_A143F0_INSERTED_FOUND);
}

/** P145 VA 0x00a145b7…0x00a145bc: pair.node = new; pair.inserted = 1. */
export function renderShellA143f0InsertPair(view, pairPtr, node) {
  const p = asU32(pairPtr);
  view.setUint32(p, asU32(node), true);
  view.setUint8(p + RENDER_SHELL_A143F0_PAIR_INSERTED_OFF, RENDER_SHELL_A143F0_INSERTED_INSERT);
}

export function renderShellA143f0NextVa() {
  return RENDER_SHELL_A143F0_NEXT_VA >>> 0;
}
export function renderShellA143f0AllocSize() {
  return RENDER_SHELL_A143F0_ALLOC_SIZE >>> 0;
}
export function renderShellA143f0PairInsertedOff() {
  return RENDER_SHELL_A143F0_PAIR_INSERTED_OFF >>> 0;
}

/* ---- ABI v39: FUN_00a145e0 scalar deleting dtor plan ---- */

/**
 * P146 VA 0x00a14601 `test byte [ebp+8], 1` — Grp3 Eb,Ib: BIT 0 of the
 * LOW BYTE of the delete flag. Wide 0x100 does NOT free; 0x101 does.
 */
export function renderShellA145e0DeleteNeeded(deleteFlag) {
  return (asU8(deleteFlag) & 1) !== 0;
}

/** P147 VA 0x00a145e6: unconditional vftable store [this] = 0xb81bac. */
export function renderShellA145e0VftableStore(view, thisPtr) {
  view.setUint32(asU32(thisPtr), RENDER_SHELL_A145E0_VTABLE_VA, true);
}

/** P148 the three subobject-dtor calls in PE order (VA 0x00a145ec /
 *  0x00a145f1 / 0x00a145f9): index 0 self (a149a0), 1 vec @+0x40
 *  (4149d0), 2 vec @+0x34 (a15310). Out-of-range index → 0. */
export function renderShellA145e0CallThisOff(index) {
  switch (index) {
    case 0: return RENDER_SHELL_A145E0_CALL_THIS_OFF_0;
    case 1: return RENDER_SHELL_A145E0_CALL_THIS_OFF_1;
    case 2: return RENDER_SHELL_A145E0_CALL_THIS_OFF_2;
    default: return 0;
  }
}
export function renderShellA145e0CallHostVa(index) {
  switch (index) {
    case 0: return RENDER_SHELL_A145E0_CALL_HOST_VA_0;
    case 1: return RENDER_SHELL_A145E0_CALL_HOST_VA_1;
    case 2: return RENDER_SHELL_A145E0_CALL_HOST_VA_2;
    default: return 0;
  }
}
export function renderShellA145e0CallCount() {
  return RENDER_SHELL_A145E0_CALL_COUNT;
}
export function renderShellA145e0VtableVa() {
  return RENDER_SHELL_A145E0_VTABLE_VA >>> 0;
}
export function renderShellA145e0FreeSize() {
  return RENDER_SHELL_A145E0_FREE_SIZE >>> 0;
}
export function renderShellA145e0FreeVa() {
  return RENDER_SHELL_A145E0_FREE_VA >>> 0;
}
export function renderShellA145e0HostVa() {
  return RENDER_SHELL_A145E0_HOST_VA >>> 0;
}
export function renderShellA145e0NextVa() {
  return RENDER_SHELL_A145E0_NEXT_VA >>> 0;
}

/* ---- ABI v40: 0xa14620 string/pair-table object init laws ---- */
export function renderShellA14620FreeOldNeeded(oldPtr) {
  return (asU32(oldPtr) !== 0) ? 1 : 0;
}
export function renderShellA14620DupNeeded(strPtr) {
  return (asU32(strPtr) !== 0) ? 1 : 0;
}
export function renderShellA14620DupSize(strLen) {
  return (asU32(strLen) + 1) >>> 0;
}
export function renderShellA14620DupMemcpyCount(strLen) {
  /* Second strlen + 1 — independent re-derivation, never folded. */
  return (asU32(strLen) + 1) >>> 0;
}
export function renderShellA14620PairCountEntry(pair0Flag) {
  return (asU32(pair0Flag) !== 0) ? 1 : 0;
}
export function renderShellA14620PairCountStep(flag) {
  return (asU32(flag) !== 0) ? 1 : 0;
}
export function renderShellA14620AllocSize(count) {
  /* 64-bit count*8 with overflow SATURATION (mul edx,8 / seto / neg /
     or ecx,eax: high-32 nonzero -> 0xffffffff, never folded to low 32).
     JS Number holds 2^53 exactly, so compute then clamp. */
  const c = asU32(count);
  const product = c * 8;
  if (product > 0xffffffff) return 0xffffffff >>> 0;
  return product >>> 0;
}
export function renderShellA14620FillLoopContinue(index, count) {
  return (asU32(index) < asU32(count)) ? 1 : 0;
}
export function renderShellA14620PairPtrNeedsDup(ptr) {
  return (asU32(ptr) !== 0) ? 1 : 0;
}
export function renderShellA14620FlagsSet(flags) {
  return (asU32(flags) | RENDER_SHELL_A14620_FLAG_BIT0) >>> 0;
}
export function renderShellA14620TailResult(al) {
  return ((asU32(al) & 0xff) !== 0) ? 1 : 0;
}
export function renderShellA14620VtableSlotOff(kind) {
  switch (kind) {
    case 0: return RENDER_SHELL_A14620_VTABLE_GATE_SLOT;
    case 1: return RENDER_SHELL_A14620_VTABLE_FALSE_SLOT;
    case 2: return RENDER_SHELL_A14620_VTABLE_TRUE_SLOT;
    default: return 0;
  }
}
export function renderShellA14620HostVa() {
  return RENDER_SHELL_A14620_HOST_VA >>> 0;
}
export function renderShellA14620NextVa() {
  return RENDER_SHELL_A14620_NEXT_VA >>> 0;
}
export function renderShellA14620StrOff() {
  return RENDER_SHELL_A14620_STR_OFF >>> 0;
}
export function renderShellA14620ArrayOff() {
  return RENDER_SHELL_A14620_ARRAY_OFF >>> 0;
}
export function renderShellA14620CountOff() {
  return RENDER_SHELL_A14620_COUNT_OFF >>> 0;
}
export function renderShellA14620FlagsOff() {
  return RENDER_SHELL_A14620_FLAGS_OFF >>> 0;
}
export function renderShellA14620PairStride() {
  return RENDER_SHELL_A14620_PAIR_STRIDE >>> 0;
}
export function renderShellA14620PairFlagOff() {
  return RENDER_SHELL_A14620_PAIR_FLAG_OFF >>> 0;
}
export function renderShellA14620FreeCl() {
  return RENDER_SHELL_A14620_FREE_CL >>> 0;
}
export function renderShellA14620AllocCl() {
  return RENDER_SHELL_A14620_ALLOC_CL >>> 0;
}
export function renderShellA14620OpNewVa() {
  return RENDER_SHELL_A14620_OP_NEW_VA >>> 0;
}
export function renderShellA14620MemcpyVa() {
  return RENDER_SHELL_A14620_MEMCPY_IAT_VA >>> 0;
}
export function renderShellA14620HeapVa() {
  return RENDER_SHELL_A14620_HEAP_VA >>> 0;
}
export function renderShellA14620TailRetFalse() {
  return RENDER_SHELL_A14620_TAIL_RET_FALSE >>> 0;
}
export function renderShellA14620TailRetTrue() {
  return RENDER_SHELL_A14620_TAIL_RET_TRUE >>> 0;
}

/* ---- ABI v41: 0xa147e0 vertex/pixel shader string wrapper laws ---- */
export function renderShellA147e0ObjNeeded(obj) {
  return (asU32(obj) !== 0) ? 1 : 0;
}
export function renderShellA147e0BufNeeded(buf) {
  return (asU32(buf) !== 0) ? 1 : 0;
}
export function renderShellA147e0DupSize(len) {
  return (asU32(len) + 1) >>> 0;
}
export function renderShellA147e0NulTermOff(len) {
  return asU32(len) >>> 0;
}
export function renderShellA147e0FreeCl() {
  return RENDER_SHELL_A147E0_FREE_CL >>> 0;
}
export function renderShellA147e0NestedVa() {
  return RENDER_SHELL_A147E0_NESTED_VA >>> 0;
}
export function renderShellA147e0VtableCalls() {
  return RENDER_SHELL_A147E0_VTABLE_CALLS >>> 0;
}
export function renderShellA147e0VtableSlotOff(kind) {
  switch (kind) {
    case 0: return RENDER_SHELL_A147E0_VTABLE_SLOT_0;
    case 1: return RENDER_SHELL_A147E0_VTABLE_SLOT_1;
    case 2: return RENDER_SHELL_A147E0_VTABLE_SLOT_2;
    case 3: return RENDER_SHELL_A147E0_VTABLE_SLOT_3;
    default: return 0;
  }
}
export function renderShellA147e0LocalPtrOff(index) {
  switch (index) {
    case 0: return RENDER_SHELL_A147E0_LOCAL_PTR_0;
    case 1: return RENDER_SHELL_A147E0_LOCAL_PTR_1;
    default: return 0;
  }
}
export function renderShellA147e0LocalFlagOff(index) {
  switch (index) {
    case 0: return RENDER_SHELL_A147E0_LOCAL_FLAG_0;
    case 1: return RENDER_SHELL_A147E0_LOCAL_FLAG_1;
    default: return 0;
  }
}
export function renderShellA147e0LogVertexMsgVa() {
  return RENDER_SHELL_A147E0_LOG_VERTEX_MSG_VA >>> 0;
}
export function renderShellA147e0LogPixelMsgVa() {
  return RENDER_SHELL_A147E0_LOG_PIXEL_MSG_VA >>> 0;
}
export function renderShellA147e0LogLevel() {
  return RENDER_SHELL_A147E0_LOG_LEVEL >>> 0;
}
export function renderShellA147e0FillConst() {
  return RENDER_SHELL_A147E0_FILL_CONST >>> 0;
}
export function renderShellA147e0ErrRet() {
  return RENDER_SHELL_A147E0_ERR_RET >>> 0;
}
export function renderShellA147e0Result(al) {
  return ((asU32(al) & 0xff) !== 0) ? 1 : 0;
}
export function renderShellA147e0HostVa() {
  return RENDER_SHELL_A147E0_HOST_VA >>> 0;
}
export function renderShellA147e0EndVa() {
  return RENDER_SHELL_A147E0_END_VA >>> 0;
}
export function renderShellA147e0NextVa() {
  return RENDER_SHELL_A147E0_NEXT_VA >>> 0;
}
export function renderShellA147e0RegistryVa() {
  return RENDER_SHELL_A147E0_REGISTRY_VA >>> 0;
}
export function renderShellA147e0RegistryThisVa() {
  return RENDER_SHELL_A147E0_REGISTRY_THIS_VA >>> 0;
}

/* ---- ABI v42: 0xa149a0 a14620-object virtual dtor body laws ---- */
export function renderShellA149a0PtrFreeNeeded(ptr) {
  return (asU32(ptr) !== 0) ? 1 : 0;
}
export function renderShellA149a0CounterBase(sel) {
  const s = asU32(sel);
  return s !== 0 ? (s + RENDER_SHELL_A149A0_COUNTER_OFF) >>> 0
                 : RENDER_SHELL_A149A0_COUNTER_FALLBACK_VA >>> 0;
}
export function renderShellA149a0CounterDecLo(lo, sizeHdr) {
  return (asU32(lo) - asU32(sizeHdr)) >>> 0;
}
export function renderShellA149a0CounterSbbBorrow(lo, sizeHdr) {
  return asU32(lo) < asU32(sizeHdr) ? 1 : 0;
}
export function renderShellA149a0CounterDecHi(hi, borrow) {
  return (asU32(hi) - asU32(borrow)) >>> 0;
}
export function renderShellA149a0ElemFreeNeeded(typeDword) {
  /* SIGNED: [elem+8] > 7 (cmp dword,7; jle skip). 0x100 frees,
     0xffffffff does NOT. */
  return ((asU32(typeDword) | 0) > 7) ? 1 : 0;
}
export function renderShellA149a0Vec18Count(begin, end) {
  /* PE magic: span = (end-begin) wrap u32 -> SIGNED; eax = 0x2aaaaaab;
     imul ecx (signed 64x64 -> edx:eax); sar edx,2; eax=edx; shr
     eax,0x1f; add eax,edx — MSVC C-truncation div by 0x18. */
  const spanU32 = (asU32(end) - asU32(begin)) >>> 0;
  const span = spanU32 | 0;
  const prod = BigInt(span) * BigInt(RENDER_SHELL_A149A0_VEC18_MAGIC);
  let hi = Number(BigInt.asIntN(64, prod) >> 32n) | 0;
  hi >>= 2; /* sar edx,2 */
  let q = hi;
  q += (hi >>> 31) | 0; /* shr eax,0x1f then add */
  return q | 0;
}
export function renderShellA149a0InnerDwordCount(beginPtr, endPtr) {
  /* (end - begin) >> 2 SAR signed. */
  return ((asU32(endPtr) - asU32(beginPtr)) | 0) >> 2;
}
export function renderShellA149a0FlagsClearBit0(flags) {
  return (asU32(flags) & ~1) >>> 0;
}
export function renderShellA149a0VtableVa() {
  return RENDER_SHELL_A149A0_VTABLE_VA >>> 0;
}
export function renderShellA149a0FreeIatVa() {
  return RENDER_SHELL_A149A0_FREE_IAT_VA >>> 0;
}
export function renderShellA149a0CounterSelVa() {
  return RENDER_SHELL_A149A0_COUNTER_SEL_VA >>> 0;
}
export function renderShellA149a0CounterFallbackVa() {
  return RENDER_SHELL_A149A0_COUNTER_FALLBACK_VA >>> 0;
}
export function renderShellA149a0CounterOff() {
  return RENDER_SHELL_A149A0_COUNTER_OFF >>> 0;
}
export function renderShellA149a0VecDestroyVa() {
  return RENDER_SHELL_A149A0_VEC_DESTROY_VA >>> 0;
}
export function renderShellA149a0TrackedFreeSites() {
  return RENDER_SHELL_A149A0_TRACKED_FREE_SITES >>> 0;
}
export function renderShellA149a0SlotCount() {
  return RENDER_SHELL_A149A0_SLOT_COUNT >>> 0;
}
export function renderShellA149a0HostVa() {
  return RENDER_SHELL_A149A0_HOST_VA >>> 0;
}
export function renderShellA149a0EndVa() {
  return RENDER_SHELL_A149A0_END_VA >>> 0;
}
export function renderShellA149a0NextVa() {
  return RENDER_SHELL_A149A0_NEXT_VA >>> 0;
}

/* ---- ABI v43: 0xa14c00 render-shell item add/update method laws ---- */
export function renderShellA14c00SizeForType(type) {
  /* PE: cmp type,0x1c; ja errA (UNSIGNED); jmp [type*4+0xa14f10].
     idx 0..7 -> err B; 8..0x1c -> size; >0x1c -> err A; size 0. */
  const t = asU32(type);
  if (t > RENDER_SHELL_A14C00_TYPE_MAX_VALID) {
    return 0;
  }
  return RENDER_SHELL_A14C00_SIZE_TABLE[t] | 0;
}
export function renderShellA14c00ErrorMsgVa(type) {
  /* err B (type<=7) -> 0xb81b40; err A (type>0x1c) -> 0xb81aec;
     valid 8..0x1c -> 0 (no log). */
  const t = asU32(type);
  if (t <= 7) {
    return RENDER_SHELL_A14C00_MSG_LO_VA >>> 0;
  }
  if (t > RENDER_SHELL_A14C00_TYPE_MAX_VALID) {
    return RENDER_SHELL_A14C00_MSG_HI_VA >>> 0;
  }
  return 0;
}
export function renderShellA14c00JumpTableVa() {
  return RENDER_SHELL_A14C00_JUMP_TABLE_VA >>> 0;
}
export function renderShellA14c00JumpTableEntries() {
  return RENDER_SHELL_A14C00_JUMP_TABLE_ENTRIES >>> 0;
}
export function renderShellA14c00TypeMinValid() {
  return RENDER_SHELL_A14C00_TYPE_MIN_VALID >>> 0;
}
export function renderShellA14c00TypeMaxValid() {
  return RENDER_SHELL_A14C00_TYPE_MAX_VALID >>> 0;
}
export function renderShellA14c00LogLevel() {
  return RENDER_SHELL_A14C00_LOG_LEVEL >>> 0;
}
export function renderShellA14c00MsgLoVa() {
  return RENDER_SHELL_A14C00_MSG_LO_VA >>> 0;
}
export function renderShellA14c00MsgHiVa() {
  return RENDER_SHELL_A14C00_MSG_HI_VA >>> 0;
}
export function renderShellA14c00LoggerVa() {
  return RENDER_SHELL_A14C00_LOGGER_VA >>> 0;
}
export function renderShellA14c00FindVa() {
  return RENDER_SHELL_A14C00_FIND_VA >>> 0;
}
export function renderShellA14c00PushVa() {
  return RENDER_SHELL_A14C00_PUSH_VA >>> 0;
}
export function renderShellA14c00AllocVa() {
  return RENDER_SHELL_A14C00_ALLOC_VA >>> 0;
}
export function renderShellA14c00CopyVa() {
  return RENDER_SHELL_A14C00_COPY_VA >>> 0;
}
export function renderShellA14c00GrowVa() {
  return RENDER_SHELL_A14C00_GROW_VA >>> 0;
}
export function renderShellA14c00SizedFreeVa() {
  return RENDER_SHELL_A14C00_SIZED_FREE_VA >>> 0;
}
export function renderShellA14c00RangeIatVa() {
  return RENDER_SHELL_A14C00_RANGE_IAT_VA >>> 0;
}
export function renderShellA14c00MemcpyIatVa() {
  return RENDER_SHELL_A14C00_MEMCPY_IAT_VA >>> 0;
}
export function renderShellA14c00StackArgs() {
  return RENDER_SHELL_A14C00_STACK_ARGS >>> 0;
}
export function renderShellA14c00ElemStride() {
  return RENDER_SHELL_A14C00_ELEM_STRIDE >>> 0;
}
export function renderShellA14c00ElemInnerBeginOff() {
  return RENDER_SHELL_A14C00_ELEM_INNER_BEGIN_OFF >>> 0;
}
export function renderShellA14c00ElemInnerEndOff() {
  return RENDER_SHELL_A14C00_ELEM_INNER_END_OFF >>> 0;
}
export function renderShellA14c00ElemInnerCapOff() {
  return RENDER_SHELL_A14C00_ELEM_INNER_CAP_OFF >>> 0;
}
export function renderShellA14c00Vec18Off() {
  return RENDER_SHELL_A14C00_VEC18_OFF >>> 0;
}
export function renderShellA14c00VecOff() {
  return RENDER_SHELL_A14C00_VEC_OFF >>> 0;
}
export function renderShellA14c00Vec18Magic() {
  return RENDER_SHELL_A14C00_VEC18_MAGIC >>> 0;
}
export function renderShellA14c00HostVa() {
  return RENDER_SHELL_A14C00_HOST_VA >>> 0;
}
export function renderShellA14c00EndVa() {
  return RENDER_SHELL_A14C00_END_VA >>> 0;
}
export function renderShellA14c00NextVa() {
  return RENDER_SHELL_A14C00_NEXT_VA >>> 0;
}

/* ---- ABI v44: 0xa14f90 render-shell class method laws ---- */
export function renderShellA14f90ListDwordCount(begin, end) {
  /* (end - begin) >> 2 SAR signed — entry bound and per-iteration
     re-derived bound (0xa14fa3..0xa14fac / 0xa14ffd..0xa15009). */
  return ((asU32(end) - asU32(begin)) | 0) >> 2;
}
export function renderShellA14f90IndexInRange(value, innerCount) {
  /* cmp [ebp-4],eax; jae skip — UNSIGNED; gate passes exactly when
     value < innerCount unsigned (innerCount is the SAR result). */
  return (asU32(value) < asU32(innerCount | 0)) ? 1 : 0;
}
export function renderShellA14f90TypeToTable(type) {
  /* cmp edx,7; ja vtable — UNSIGNED type > 7 -> vtable slot +0x1c;
     type <= 7 -> DAT 0xc79928[type] store. */
  return (asU32(type) <= RENDER_SHELL_A14F90_TABLE_MAX_TYPE) ? 1 : 0;
}
export function renderShellA14f90FlushNeeded(val) {
  /* test ecx,ecx; je skip — FULL dword gate (0x100 flushes). */
  return (asU32(val) !== 0) ? 1 : 0;
}
export function renderShellA14f90ElementOff(index) {
  /* add [ebp+8],0x18 per iteration — index*0x18 32-bit wrap. */
  return (Math.imul(asU32(index), RENDER_SHELL_A14F90_ELEM_STRIDE)) >>> 0;
}
export function renderShellA14f90HostVa() {
  return RENDER_SHELL_A14F90_HOST_VA >>> 0;
}
export function renderShellA14f90EndVa() {
  return RENDER_SHELL_A14F90_END_VA >>> 0;
}
export function renderShellA14f90NextVa() {
  return RENDER_SHELL_A14F90_NEXT_VA >>> 0;
}
export function renderShellA14f90NextMethodVa() {
  return RENDER_SHELL_A14F90_NEXT_METHOD_VA >>> 0;
}
export function renderShellA14f90VtableVa() {
  return RENDER_SHELL_A14F90_VTABLE_VA >>> 0;
}
export function renderShellA14f90VtableSlot() {
  return RENDER_SHELL_A14F90_VTABLE_SLOT >>> 0;
}
export function renderShellA14f90SlotPerElem() {
  return RENDER_SHELL_A14F90_SLOT_PER_ELEM >>> 0;
}
export function renderShellA14f90SlotFlush() {
  return RENDER_SHELL_A14F90_SLOT_FLUSH >>> 0;
}
export function renderShellA14f90PerElemArgs() {
  return RENDER_SHELL_A14F90_PER_ELEM_ARGS >>> 0;
}
export function renderShellA14f90FlushArgs() {
  return RENDER_SHELL_A14F90_FLUSH_ARGS >>> 0;
}
export function renderShellA14f90TableVa() {
  return RENDER_SHELL_A14F90_TABLE_VA >>> 0;
}
export function renderShellA14f90TableEntries() {
  return RENDER_SHELL_A14F90_TABLE_ENTRIES >>> 0;
}
export function renderShellA14f90TableMaxType() {
  return RENDER_SHELL_A14F90_TABLE_MAX_TYPE >>> 0;
}
export function renderShellA14f90ListFallbackOff() {
  return RENDER_SHELL_A14F90_LIST_FALLBACK_OFF >>> 0;
}
export function renderShellA14f90Vec18Off() {
  return RENDER_SHELL_A14F90_VEC18_OFF >>> 0;
}
export function renderShellA14f90ElemStride() {
  return RENDER_SHELL_A14F90_ELEM_STRIDE >>> 0;
}
export function renderShellA14f90StackArgs() {
  return RENDER_SHELL_A14F90_STACK_ARGS >>> 0;
}

/* ---- ABI v45: 0xa150d0 render-shell class method laws ---- */
export function renderShellA150d0PtrFreeNeeded(ptr) {
  /* 0xa15166..0xa15168: test ecx,ecx; je 0xa151a8 — FULL dword gate
     (0x100 frees, only 0 skips). */
  return (asU32(ptr) !== 0) ? 1 : 0;
}
export function renderShellA150d0CounterBase(sel) {
  /* 0xa1516a..0xa15179: mov edx,[0xc7de78]; test edx,edx; je
     0xc7f618; add edx,0x30 — FULL dword test on the select value. */
  const s = asU32(sel);
  return s !== 0 ? (s + RENDER_SHELL_A150D0_COUNTER_OFF) >>> 0
                 : RENDER_SHELL_A150D0_COUNTER_FALLBACK_VA >>> 0;
}
export function renderShellA150d0CounterDecLo(lo, sizeHdr) {
  /* 0xa15184: sub dword ptr [edx],eax — 32-bit wrap; the sbb borrow
     is computed separately. */
  return (asU32(lo) - asU32(sizeHdr)) >>> 0;
}
export function renderShellA150d0CounterSbbBorrow(lo, sizeHdr) {
  /* 0xa15187: sbb dword ptr [edx+4],0 — borrow = UNSIGNED
     (lo < size_hdr), exactly the sbb carry-out. */
  return asU32(lo) < asU32(sizeHdr) ? 1 : 0;
}
export function renderShellA150d0CounterDecHi(hi, borrow) {
  /* 0xa15187: hi -= borrow (the sbb [edx+4],0), 32-bit wrap. */
  return (asU32(hi) - asU32(borrow)) >>> 0;
}
export function renderShellA150d0ElemFreeNeeded(typeDword) {
  /* 0xa15149..0xa15151: cmp dword ptr [ebx+esi+8],7; jle 0xa151b3 —
     SIGNED dword compare: only > 7 frees (0x100 frees, 0xffffffff
     does NOT). */
  return ((asU32(typeDword) | 0) > RENDER_SHELL_A150D0_TYPE_FREE_MAX)
    ? 1 : 0;
}
export function renderShellA150d0Vec18Count(begin, end) {
  /* PE magic: span = (end-begin) wrap u32 -> SIGNED; eax = 0x2aaaaaab;
     imul ecx (signed 64x64 -> edx:eax); sar edx,2; eax=edx; shr
     eax,0x1f; add eax,edx — MSVC C-truncation div by 0x18.
     (0xa15100..0xa15119 entry; RE-DERIVED per iteration at
     0xa151d3..0xa151f3 / 0xa1520c..0xa15223.) Same law as
     a149a0_vec18_count (v42) — pinned equal in tests. */
  const spanU32 = (asU32(end) - asU32(begin)) >>> 0;
  const span = spanU32 | 0;
  const prod = BigInt(span) * BigInt(RENDER_SHELL_A150D0_VEC18_MAGIC);
  let hi = Number(BigInt.asIntN(64, prod) >> 32n) | 0;
  hi >>= 2; /* sar edx,2 */
  let q = hi;
  q += (hi >>> 31) | 0; /* shr eax,0x1f then add */
  return q | 0;
}
export function renderShellA150d0InnerDwordCount(beginPtr, endPtr) {
  /* 0xa1512f / 0xa1523b: sub then sar edx,2 — SAR signed dword count
     of the elem inner vector. */
  return ((asU32(endPtr) - asU32(beginPtr)) | 0) >> 2;
}
export function renderShellA150d0GrowNeeded(ptr, cap) {
  /* 0xa151b6 cmp eax,[edi+0x14]; je 0xa151c3 and 0xa15245 cmp
     ecx,[edx+0x48]; je 0xa15252 — grow on EQUALITY (ptr == cap);
     the direct store runs when ptr != cap. */
  return (asU32(ptr) === asU32(cap)) ? 1 : 0;
}
export function renderShellA150d0InnerLastOff(begin, innerCount) {
  /* 0xa1513f: mov edx,[eax + ecx*4 - 4] where eax = elem begin,
     ecx = inner_count — the retained last-dword load address
     (begin + inner_count*4 - 4, 32-bit wrap). */
  return (asU32(begin) + (Math.imul(asI32(innerCount), 4) | 0) - 4) >>> 0;
}
export function renderShellA150d0PushValue(innerCount) {
  /* Phase B 0xa1523e: dec eax after the SAR — push_value =
     inner_count - 1, 32-bit wrap (empty inner vec pushes 0xffffffff). */
  return (asU32(innerCount) - RENDER_SHELL_A150D0_PUSH_DEC) >>> 0;
}
export function renderShellA150d0RetainEnd(begin) {
  /* Phase A 0xa151bd: add dword ptr [edi+0x10],4 after the last-dword
     store — direct path end = begin + 4 (retain ONE dword). */
  return (asU32(begin) + RENDER_SHELL_A150D0_RETAIN_STORE_SIZE) >>> 0;
}
export function renderShellA150d0HostVa() {
  return RENDER_SHELL_A150D0_HOST_VA >>> 0;
}
export function renderShellA150d0EndVa() {
  return RENDER_SHELL_A150D0_END_VA >>> 0;
}
export function renderShellA150d0NextVa() {
  return RENDER_SHELL_A150D0_NEXT_VA >>> 0;
}
export function renderShellA150d0VtableVa() {
  return RENDER_SHELL_A150D0_VTABLE_VA >>> 0;
}
export function renderShellA150d0VtableSlot() {
  return RENDER_SHELL_A150D0_VTABLE_SLOT >>> 0;
}
export function renderShellA150d0FreeIatVa() {
  return RENDER_SHELL_A150D0_FREE_IAT_VA >>> 0;
}
export function renderShellA150d0CounterSelVa() {
  return RENDER_SHELL_A150D0_COUNTER_SEL_VA >>> 0;
}
export function renderShellA150d0CounterFallbackVa() {
  return RENDER_SHELL_A150D0_COUNTER_FALLBACK_VA >>> 0;
}
export function renderShellA150d0CounterOff() {
  return RENDER_SHELL_A150D0_COUNTER_OFF >>> 0;
}
export function renderShellA150d0CounterLoOff() {
  return RENDER_SHELL_A150D0_COUNTER_LO_OFF >>> 0;
}
export function renderShellA150d0CounterHiOff() {
  return RENDER_SHELL_A150D0_COUNTER_HI_OFF >>> 0;
}
export function renderShellA150d0GrowVa() {
  return RENDER_SHELL_A150D0_GROW_VA >>> 0;
}
export function renderShellA150d0TypeFreeMax() {
  return RENDER_SHELL_A150D0_TYPE_FREE_MAX >>> 0;
}
export function renderShellA150d0Vec18Magic() {
  return RENDER_SHELL_A150D0_VEC18_MAGIC >>> 0;
}
export function renderShellA150d0Vec18Off() {
  return RENDER_SHELL_A150D0_VEC18_OFF >>> 0;
}
export function renderShellA150d0Vec18EndOff() {
  return RENDER_SHELL_A150D0_VEC18_END_OFF >>> 0;
}
export function renderShellA150d0Vec18Stride() {
  return RENDER_SHELL_A150D0_VEC18_STRIDE >>> 0;
}
export function renderShellA150d0VecOff() {
  return RENDER_SHELL_A150D0_VEC_OFF >>> 0;
}
export function renderShellA150d0VecEndOff() {
  return RENDER_SHELL_A150D0_VEC_END_OFF >>> 0;
}
export function renderShellA150d0VecCapOff() {
  return RENDER_SHELL_A150D0_VEC_CAP_OFF >>> 0;
}
export function renderShellA150d0ElemTypeOff() {
  return RENDER_SHELL_A150D0_ELEM_TYPE_OFF >>> 0;
}
export function renderShellA150d0ElemInnerBeginOff() {
  return RENDER_SHELL_A150D0_ELEM_INNER_BEGIN_OFF >>> 0;
}
export function renderShellA150d0ElemInnerEndOff() {
  return RENDER_SHELL_A150D0_ELEM_INNER_END_OFF >>> 0;
}
export function renderShellA150d0ElemInnerCapOff() {
  return RENDER_SHELL_A150D0_ELEM_INNER_CAP_OFF >>> 0;
}
export function renderShellA150d0RetainStoreSize() {
  return RENDER_SHELL_A150D0_RETAIN_STORE_SIZE >>> 0;
}
export function renderShellA150d0PushDec() {
  return RENDER_SHELL_A150D0_PUSH_DEC >>> 0;
}

/* ---- ABI v46: 0xa152a0 vec18 push element helper (the a14c00 v43
   PUSH_VA leaf) laws ---- */
export const RENDER_SHELL_A152A0_HOST_VA = 0x00a152a0;
export const RENDER_SHELL_A152A0_END_VA = 0x00a15301;
export const RENDER_SHELL_A152A0_NEXT_VA = 0x00a153a0;
export const RENDER_SHELL_A152A0_VEC_BEGIN_OFF = 0x00;
export const RENDER_SHELL_A152A0_VEC_END_OFF = 0x04;
export const RENDER_SHELL_A152A0_VEC_CAP_OFF = 0x08;
export const RENDER_SHELL_A152A0_ELEM_NAME_OFF = 0x00;
export const RENDER_SHELL_A152A0_ELEM_FLAG_OFF = 0x04;
export const RENDER_SHELL_A152A0_ELEM_VALUE_OFF = 0x08;
export const RENDER_SHELL_A152A0_ELEM_INNER_BEGIN_OFF = 0x0c;
export const RENDER_SHELL_A152A0_ELEM_INNER_END_OFF = 0x10;
export const RENDER_SHELL_A152A0_ELEM_INNER_CAP_OFF = 0x14;
export const RENDER_SHELL_A152A0_ELEM_STRIDE = 0x18;
export const RENDER_SHELL_A152A0_COPIED_DWORDS = 0x06;
export const RENDER_SHELL_A152A0_GROW_CALLEE_VA = 0x00a153a0;
export const RENDER_SHELL_A152A0_GROW_STACK_ARGS = 0x02;
export const RENDER_SHELL_A152A0_GROW_END_ARG_OFF = 0x08;
export const RENDER_SHELL_A152A0_GROW_ELEM_ARG_OFF = 0x0c;
export const RENDER_SHELL_A152A0_STACK_ARGS = 0x01;

export function renderShellA152a0GrowNeeded(end, cap) {
  /* 0xa152aa..0xa152ad: `cmp ebx,[edi+8]; je 0xa152f5` where ebx =
     [this+4] (end) — grow request on EQUALITY (end == cap); direct
     append when end != cap. SAME cmp/je EQUALITY law as the a150d0
     42c920 gates (v45) — pinned equal in tests. */
  return (asU32(end) === asU32(cap)) ? 1 : 0;
}
export function renderShellA152a0AppendEnd(end) {
  /* 0xa152ea: `add dword ptr [edi+4],0x18` — direct-path end advance,
     32-bit wrap (0xfffffff0 + 0x18 -> 0x8). */
  return (asU32(end) + RENDER_SHELL_A152A0_ELEM_STRIDE) >>> 0;
}
export function renderShellA152a0CopiedDwords() {
  return RENDER_SHELL_A152A0_COPIED_DWORDS >>> 0;
}
export function renderShellA152a0GrowStackArgs() {
  return RENDER_SHELL_A152A0_GROW_STACK_ARGS >>> 0;
}
export function renderShellA152a0GrowEndArgOff() {
  return RENDER_SHELL_A152A0_GROW_END_ARG_OFF >>> 0;
}
export function renderShellA152a0GrowElemArgOff() {
  return RENDER_SHELL_A152A0_GROW_ELEM_ARG_OFF >>> 0;
}
export function renderShellA152a0GrowCalleeVa() {
  return RENDER_SHELL_A152A0_GROW_CALLEE_VA >>> 0;
}
export function renderShellA152a0HostVa() {
  return RENDER_SHELL_A152A0_HOST_VA >>> 0;
}
export function renderShellA152a0EndVa() {
  return RENDER_SHELL_A152A0_END_VA >>> 0;
}
export function renderShellA152a0NextVa() {
  return RENDER_SHELL_A152A0_NEXT_VA >>> 0;
}
export function renderShellA152a0VecBeginOff() {
  return RENDER_SHELL_A152A0_VEC_BEGIN_OFF >>> 0;
}
export function renderShellA152a0VecEndOff() {
  return RENDER_SHELL_A152A0_VEC_END_OFF >>> 0;
}
export function renderShellA152a0VecCapOff() {
  return RENDER_SHELL_A152A0_VEC_CAP_OFF >>> 0;
}
export function renderShellA152a0ElemNameOff() {
  return RENDER_SHELL_A152A0_ELEM_NAME_OFF >>> 0;
}
export function renderShellA152a0ElemFlagOff() {
  return RENDER_SHELL_A152A0_ELEM_FLAG_OFF >>> 0;
}
export function renderShellA152a0ElemValueOff() {
  return RENDER_SHELL_A152A0_ELEM_VALUE_OFF >>> 0;
}
export function renderShellA152a0ElemInnerBeginOff() {
  return RENDER_SHELL_A152A0_ELEM_INNER_BEGIN_OFF >>> 0;
}
export function renderShellA152a0ElemInnerEndOff() {
  return RENDER_SHELL_A152A0_ELEM_INNER_END_OFF >>> 0;
}
export function renderShellA152a0ElemInnerCapOff() {
  return RENDER_SHELL_A152A0_ELEM_INNER_CAP_OFF >>> 0;
}
export function renderShellA152a0ElemStride() {
  return RENDER_SHELL_A152A0_ELEM_STRIDE >>> 0;
}
export function renderShellA152a0StackArgs() {
  return RENDER_SHELL_A152A0_STACK_ARGS >>> 0;
}

/* ---- ABI v47: 0xa153a0 vec18 grow IAT (a152a0 v46 grow request
   target) growth-factor laws ---- */
export const RENDER_SHELL_A153A0_HOST_VA = 0x00a153a0;
export const RENDER_SHELL_A153A0_END_VA = 0x00a15522;
export const RENDER_SHELL_A153A0_NEXT_VA = 0x00a15550;
export const RENDER_SHELL_A153A0_MAX_SIZE = 0x0aaaaaaa;
export const RENDER_SHELL_A153A0_VEC18_MAGIC = 0x2aaaaaab;
export const RENDER_SHELL_A153A0_ELEM_STRIDE = 0x18;
export const RENDER_SHELL_A153A0_COPIED_DWORDS = 0x06;
export const RENDER_SHELL_A153A0_STACK_ARGS = 0x02;
export const RENDER_SHELL_A153A0_FREE_HEADER_MIN = 0x1000;
export const RENDER_SHELL_A153A0_ALLOC_VA = 0x0040cf00;
export const RENDER_SHELL_A153A0_MEMMOVE_VA = 0x00915eb0;
export const RENDER_SHELL_A153A0_INNER_DESTROY_VA = 0x004149d0;
export const RENDER_SHELL_A153A0_SIZED_FREE_VA = 0x00aef15c;
export const RENDER_SHELL_A153A0_MAX_SIZE_ERR_TAIL = 0x00a15542;
export const RENDER_SHELL_A153A0_OVERFLOW_ERR_TAIL = 0x00a15547;
export const RENDER_SHELL_A153A0_FREE_EDGE_IAT_VA = 0x00b18894;
export const RENDER_SHELL_A153A0_MAX_GUARD_CALL_VA = 0x00415bc0;
export const RENDER_SHELL_A153A0_OVERFLOW_CALL_VA = 0x0040cee0;
export const RENDER_SHELL_A153A0_VEC_BEGIN_OFF = 0x00;
export const RENDER_SHELL_A153A0_VEC_END_OFF = 0x04;
export const RENDER_SHELL_A153A0_VEC_CAP_OFF = 0x08;
export const RENDER_SHELL_A153A0_ELEM_INNER_BEGIN_OFF = 0x0c;
export const RENDER_SHELL_A153A0_ELEM_INNER_END_OFF = 0x10;
export const RENDER_SHELL_A153A0_ELEM_INNER_CAP_OFF = 0x14;

export function renderShellA153a0Vec18Count(begin, end) {
  /* PE magic: span = (end-begin) wrap u32 -> SIGNED; eax = 0x2aaaaaab;
     imul (signed 64x64 -> edx:eax); sar edx,2; eax=edx; shr eax,0x1f;
     add eax,edx — MSVC C-truncation div by 0x18. Derived TWICE at
     0xa153b3 (arg end -> esi, slot math) and 0xa153b5..0xa153d5
     (this->end -> eax, guard math); equal at entry. SAME law as
     a149a0_vec18_count (v42) / a150d0_vec18_count (v45) — pinned
     equal in tests. */
  const spanU32 = (asU32(end) - asU32(begin)) >>> 0;
  const span = spanU32 | 0;
  const prod = BigInt(span) * BigInt(RENDER_SHELL_A153A0_VEC18_MAGIC);
  let hi = Number(BigInt.asIntN(64, prod) >> 32n) | 0;
  hi >>= 2; /* sar edx,2 */
  let q = hi;
  q += (hi >>> 31) | 0; /* shr eax,0x1f then add */
  return q | 0;
}
export function renderShellA153a0MaxSizeGuard(count) {
  /* 0xa153d7..0xa153dc: `cmp eax,0xaaaaaaa; je 0xa15542` — the
     MAX-SIZE guard fires on EQUALITY (count == MAX) and jumps to the
     host fatal tail (0x415bc0 + 0x40cee0 + int3). */
  return (asU32(count) === RENDER_SHELL_A153A0_MAX_SIZE) ? 1 : 0;
}
export function renderShellA153a0NewCount(count) {
  /* 0xa153e5: `lea ebx,[eax+1]` — new_count = count + 1, 32-bit wrap
     (0xffffffff -> 0). */
  return (asU32(count) + 1) >>> 0;
}
export function renderShellA153a0CapHalved(capCount) {
  /* 0xa15405: `shr edx,1` — UNSIGNED half of cap_count (the 1.5x
     growth and the gate rhs both use it). */
  return asU32(capCount) >>> 1;
}
export function renderShellA153a0CapGate(capCount) {
  /* 0xa15403..0xa1540b: edx = cap_count; `shr edx,1` (UNSIGNED);
     eax = 0xaaaaaaa; `sub eax,edx` (32-bit wrap rhs); `cmp ecx,eax;
     jbe 0xa15525` — UNSIGNED: cap_count <= MAX - cap_count/2 keeps
     the 1.5x growth tail, else the CLAMP path (new_cap = MAX). */
  const cap = asU32(capCount);
  const half = cap >>> 1;
  const rhs = (RENDER_SHELL_A153A0_MAX_SIZE - half) >>> 0;
  return cap <= rhs ? 1 : 0;
}
export function renderShellA153a0GrowthFactor(capCount) {
  /* 0xa15525: `lea eax,[edx+ecx]` where edx = cap_count>>1 (UNSIGNED
     shr) and ecx = cap_count — 1.5x ELEMENT growth, 32-bit wrap. */
  const cap = asU32(capCount);
  return (cap + (cap >>> 1)) >>> 0;
}
export function renderShellA153a0GrownCap(newCount, capCount) {
  /* 0xa1552a..0xa1552c: `cmp eax,ebx; cmovae ecx,eax` — UNSIGNED
     max: ecx = growth >= new_count ? growth : new_count. */
  const growth = renderShellA153a0GrowthFactor(capCount);
  return growth >= asU32(newCount) ? growth : asU32(newCount);
}
export function renderShellA153a0CapOverflow(newCap) {
  /* 0xa1552f..0xa15535: `cmp ecx,0xaaaaaaa; ja 0xa15547` — UNSIGNED
     new_cap > MAX jumps to the host fatal tail (0x40cee0 + int3). */
  return asU32(newCap) > RENDER_SHELL_A153A0_MAX_SIZE ? 1 : 0;
}
export function renderShellA153a0NextCap(newCount, capCount) {
  /* Composite new_cap law: gate false -> CLAMP new_cap = 0xaaaaaaa
     (0xa15411 mov ecx,0xaaaaaaa); gate true -> the cmovae max from
     the 0xa15525 growth tail. A result > MAX means the PE took the
     host overflow fatal tail (0xa15547) and never wrote back (the
     `cmp/ja` recheck 0xa1552f..0xa15535; unreachable in reachable
     states). */
  if (renderShellA153a0CapGate(capCount) === 0) {
    return RENDER_SHELL_A153A0_MAX_SIZE >>> 0;
  }
  return renderShellA153a0GrownCap(newCount, capCount);
}
export function renderShellA153a0BytesForCap(newCap) {
  /* 0xa15416..0xa15419 (shared bytes path, entered from clamp
     fall-through or tail jmp 0xa15537): `lea eax,[ecx+ecx*2]; shl
     eax,3` — new_bytes = new_cap*0x18, 32-bit wrap (MAX*0x18 =
     0xfffffff0; 0xaaaaaab*0x18 -> 0x8). */
  return Math.imul(asU32(newCap), RENDER_SHELL_A153A0_ELEM_STRIDE) >>> 0;
}
export function renderShellA153a0SlotOff(count) {
  /* 0xa15428..0xa1542e: `lea eax,[esi+esi*2]; lea ecx,[ebx+eax*8]` —
     slot offset = count*0x18 (32-bit wrap); slot = newbuf + count*24. */
  return Math.imul(asU32(count), RENDER_SHELL_A153A0_ELEM_STRIDE) >>> 0;
}
export function renderShellA153a0WritebackEndOff(newCount) {
  /* 0xa1550b..0xa1550e: `lea ecx,[ecx+ecx*2]; lea ecx,[ebx+ecx*8]` —
     new this->end offset = new_count*0x18 (same law as slot_off;
     pinned equal in tests). */
  return Math.imul(asU32(newCount), RENDER_SHELL_A153A0_ELEM_STRIDE) >>> 0;
}
export function renderShellA153a0FreeSizeGate(bytes) {
  /* 0xa154dd..0xa154e2: `cmp eax,0x1000; jb 0xa154f6` — UNSIGNED:
     bytes >= 0x1000 takes the header sized-free path (reads
     [old_begin-4]); bytes < 0x1000 plain free(ptr, bytes). */
  return asU32(bytes) >= RENDER_SHELL_A153A0_FREE_HEADER_MIN ? 1 : 0;
}
export function renderShellA153a0FreeBytes(capCount) {
  /* 0xa154d7..0xa154da: `lea eax,[eax+eax*2]; shl eax,3` — old_bytes
     = old_cap_count*0x18 (RE-DERIVED cap count at 0xa154c1..0xa154d5,
     same magic law) — same law as bytes_for_cap; pinned equal. */
  return Math.imul(asU32(capCount), RENDER_SHELL_A153A0_ELEM_STRIDE) >>> 0;
}
export function renderShellA153a0HostVa() {
  return RENDER_SHELL_A153A0_HOST_VA >>> 0;
}
export function renderShellA153a0EndVa() {
  return RENDER_SHELL_A153A0_END_VA >>> 0;
}
export function renderShellA153a0NextVa() {
  return RENDER_SHELL_A153A0_NEXT_VA >>> 0;
}
export function renderShellA153a0MaxSize() {
  return RENDER_SHELL_A153A0_MAX_SIZE >>> 0;
}
export function renderShellA153a0Vec18Magic() {
  return RENDER_SHELL_A153A0_VEC18_MAGIC >>> 0;
}
export function renderShellA153a0ElemStride() {
  return RENDER_SHELL_A153A0_ELEM_STRIDE >>> 0;
}
export function renderShellA153a0CopiedDwords() {
  return RENDER_SHELL_A153A0_COPIED_DWORDS >>> 0;
}
export function renderShellA153a0StackArgs() {
  return RENDER_SHELL_A153A0_STACK_ARGS >>> 0;
}
export function renderShellA153a0FreeHeaderMin() {
  return RENDER_SHELL_A153A0_FREE_HEADER_MIN >>> 0;
}
export function renderShellA153a0AllocVa() {
  return RENDER_SHELL_A153A0_ALLOC_VA >>> 0;
}
export function renderShellA153a0MemmoveVa() {
  return RENDER_SHELL_A153A0_MEMMOVE_VA >>> 0;
}
export function renderShellA153a0InnerDestroyVa() {
  return RENDER_SHELL_A153A0_INNER_DESTROY_VA >>> 0;
}
export function renderShellA153a0SizedFreeVa() {
  return RENDER_SHELL_A153A0_SIZED_FREE_VA >>> 0;
}
export function renderShellA153a0MaxSizeErrTail() {
  return RENDER_SHELL_A153A0_MAX_SIZE_ERR_TAIL >>> 0;
}
export function renderShellA153a0OverflowErrTail() {
  return RENDER_SHELL_A153A0_OVERFLOW_ERR_TAIL >>> 0;
}
export function renderShellA153a0FreeEdgeIatVa() {
  return RENDER_SHELL_A153A0_FREE_EDGE_IAT_VA >>> 0;
}
export function renderShellA153a0VecBeginOff() {
  return RENDER_SHELL_A153A0_VEC_BEGIN_OFF >>> 0;
}
export function renderShellA153a0VecEndOff() {
  return RENDER_SHELL_A153A0_VEC_END_OFF >>> 0;
}
export function renderShellA153a0VecCapOff() {
  return RENDER_SHELL_A153A0_VEC_CAP_OFF >>> 0;
}
export function renderShellA153a0ElemInnerBeginOff() {
  return RENDER_SHELL_A153A0_ELEM_INNER_BEGIN_OFF >>> 0;
}
export function renderShellA153a0ElemInnerEndOff() {
  return RENDER_SHELL_A153A0_ELEM_INNER_END_OFF >>> 0;
}
export function renderShellA153a0ElemInnerCapOff() {
  return RENDER_SHELL_A153A0_ELEM_INNER_CAP_OFF >>> 0;
}

/* ---- ABI v48: 0xa15550 float clamp01 (PURE leaf) ----
   Body 0xa15550..0xa15560: `maxss xmm0,[0xba9fe4]` (0xa15550),
   `minss xmm0,[0xbaa454]` (0xa15558), `ret` (0xa15560). xmm0 in /
   xmm0 out; no stores; no calls. .rdata operands via the section
   table (.rdata VA 0xb18000 raw 0x716600): lo = 0xba9fe4 -> raw
   0x7a85e4 bytes 00000000 (+0.0f), hi = 0xbaa454 -> raw 0x7a8a54
   bytes 0000803f (1.0f). MAXSS/MINSS return the SECOND operand when
   the compare is unordered (NaN) or the values compare equal (incl.
   both zeros) — NaN -> +0.0f, -0.0f -> +0.0f (sign normalized),
   x<0 -> +0.0f, 0<=x<=1 identity, x>1 -> 1.0f. Single direct rel32
   caller 0x007734e6 (divss [0xbaa8a0]=25.0f before, mulss
   [0xbaa904]=40.0f after). NEXT_VA 0x00a15590 (next-pow2 leaf,
   2 callers 0x00a12d8e/0x00a12d98; NEXT_VA 0xa15570 = the v56 is-pow2
   gate (the v48 "bare ret stub" read was a misread). */
export const RENDER_SHELL_A15550_HOST_VA = 0x00a15550;
export const RENDER_SHELL_A15550_END_VA = 0x00a15560;
export const RENDER_SHELL_A15550_NEXT_VA = 0x00a15570;
export const RENDER_SHELL_A15550_LO_VA = 0x00ba9fe4;
export const RENDER_SHELL_A15550_HI_VA = 0x00baa454;
export const RENDER_SHELL_A15550_LO_BITS = 0x00000000;
export const RENDER_SHELL_A15550_HI_BITS = 0x3f800000;
export const RENDER_SHELL_A15550_CALLER_VA = 0x007734e6;

export function renderShellA15550Clamp01(x) {
  /* PE order preserved: maxss FIRST (0xa15550), minss SECOND
     (0xa15558). sseMaxss/sseMinss both return the SECOND operand on
     unordered/equal, pinning NaN -> +0.0f and -0.0f -> +0.0f. */
  const lo = f32FromBits(RENDER_SHELL_A15550_LO_BITS);
  const hi = f32FromBits(RENDER_SHELL_A15550_HI_BITS);
  return sseMinss(sseMaxss(f32(x), lo), hi);
}
export function renderShellA15550HostVa() {
  return RENDER_SHELL_A15550_HOST_VA >>> 0;
}
export function renderShellA15550EndVa() {
  return RENDER_SHELL_A15550_END_VA >>> 0;
}
export function renderShellA15550NextVa() {
  return RENDER_SHELL_A15550_NEXT_VA >>> 0;
}
export function renderShellA15550LoVa() {
  return RENDER_SHELL_A15550_LO_VA >>> 0;
}
export function renderShellA15550HiVa() {
  return RENDER_SHELL_A15550_HI_VA >>> 0;
}
export function renderShellA15550LoBits() {
  return RENDER_SHELL_A15550_LO_BITS >>> 0;
}
export function renderShellA15550HiBits() {
  return RENDER_SHELL_A15550_HI_BITS >>> 0;
}
export function renderShellA15550CallerVa() {
  return RENDER_SHELL_A15550_CALLER_VA >>> 0;
}

/* ---- ABI v49: 0xa15590 next-power-of-two leaf (PURE) ----
   Body 0xa15590..0xa155b0: push esi / mov esi,ecx / mov ecx,1 /
   mov eax,esi / shr eax,1 / lea edx,[esi-1] / je done / loop:
   or edx,eax / inc ecx / mov eax,esi / shr eax,cl / test eax,eax /
   jne loop / done: lea eax,[edx+1] / pop esi / ret. thiscall ecx in
   / eax out; no stores, no calls. je (ZF from shr eax,1) taken iff
   n in {0,1} -> (n-1)+1 = n. The or-loop ORs n>>1, n>>2, ... into
   edx = n-1, then +1: the smallest power of two >= n (0->0, 1->1,
   2^k->2^k, (2^k,2^(k+1))->2^(k+1), 0x7fffffff->0x80000000).
   DIVERGENCE corner: `shr eax,cl` masks the shift count to 5 bits,
   so for n >= 0x80000000 the machine loop never terminates
   (shift-by-32 == identity; bit 31 never clears). Callers
   0xa12d8e/0xa12d98 gate inputs unsigned vs a vtable size (abort
   path 0xa12e83) — corner unreachable; the port completes it with
   the machine's own OR-accumulation: edx would accumulate OR of
   n, n>>1..n>>31 = 0xFFFFFFFF -> +1 = 0 for every n >= 0x80000000.
   NEXT_VA 0x00a155c0 (clamped-lerp helper, 56 direct callers). */
export const RENDER_SHELL_A15590_HOST_VA = 0x00a15590;
export const RENDER_SHELL_A15590_END_VA = 0x00a155b0;
export const RENDER_SHELL_A15590_NEXT_VA = 0x00a155c0;
export const RENDER_SHELL_A15590_CALLER_VA = 0x00a12d8e;
export const RENDER_SHELL_A15590_CALLER2_VA = 0x00a12d98;
export const RENDER_SHELL_A15590_MAX_TERMINATING = 0x7fffffff;
export const RENDER_SHELL_A15590_JE_LIMIT = 0x1;

export function renderShellA15590NextPow2(n) {
  const x = asU32(n);
  /* je @0xa1559f (ZF from `shr eax,1`): n in {0,1} -> (n-1)+1 = n. */
  if (x <= RENDER_SHELL_A15590_JE_LIMIT) return x;
  /* Divergence corner (documented completion, not PE-observable):
     the machine's or-loop never terminates for n >= 0x80000000. */
  if (x >= 0x80000000) return 0;
  /* or-loop closed form: smallest power of two >= x — the OR of
     n>>1..n>>k into n-1 with the first k where n>>k == 0, +1. */
  const k = 32 - Math.clz32((x - 1) >>> 0);
  return (1 << k) >>> 0;
}
export function renderShellA15590HostVa() {
  return RENDER_SHELL_A15590_HOST_VA >>> 0;
}
export function renderShellA15590EndVa() {
  return RENDER_SHELL_A15590_END_VA >>> 0;
}
export function renderShellA15590NextVa() {
  return RENDER_SHELL_A15590_NEXT_VA >>> 0;
}
export function renderShellA15590CallerVa() {
  return RENDER_SHELL_A15590_CALLER_VA >>> 0;
}
export function renderShellA15590Caller2Va() {
  return RENDER_SHELL_A15590_CALLER2_VA >>> 0;
}
export function renderShellA15590MaxTerminating() {
  return RENDER_SHELL_A15590_MAX_TERMINATING >>> 0;
}
export function renderShellA15590JeLimit() {
  return RENDER_SHELL_A15590_JE_LIMIT >>> 0;
}

/* ---- ABI v50: 0xa155c0 clamped lerp (PURE leaf) ----
   Body 0xa155c0..0xa155e0: `test cl,cl` (0xa155c0) / `je 0xa155d4`
   (0xa155c2) / `maxss xmm2,[0xba9fe4]` (0xa155c4) / `minss
   xmm2,[0xbaa454]` (0xa155cc) / `subss xmm1,xmm0` (0xa155d4) /
   `mulss xmm1,xmm2` (0xa155d8) / `addss xmm0,xmm1` (0xa155dc) /
   `ret` (0xa155e0). xmm0=y0, xmm1=y1, xmm2=t, cl=clamp flag; xmm0
   out. No E8, no stores, no indirect. Clamp gated on the LOW byte
   of the flag (`test cl,cl`); reuses the v48 clamp01 .rdata
   constants lo = 0xba9fe4 (+0.0f, raw 0x7a85e4) / hi = 0xbaa454
   (1.0f, raw 0x7a8a54); MAXSS/MINSS return the SECOND operand on
   unordered/equal (NaN t -> +0.0f, -0.0f -> +0.0f). Then the lerp
   y0 + t*(y1-y0) with per-step f32 rounding (subss/mulss/addss).
   56 direct rel32 callers 0x5dcac5..0x7e82e7. PURE.
   NEXT_VA 0x00a155f0 (inverse lerp (t-y0)/(y1-y0), NARROWED: 1 E8
   to 0xa112c0 on the ordered-equal path). */
export const RENDER_SHELL_A155C0_HOST_VA = 0x00a155c0;
export const RENDER_SHELL_A155C0_END_VA = 0x00a155e0;
export const RENDER_SHELL_A155C0_NEXT_VA = 0x00a155f0;
export const RENDER_SHELL_A155C0_CALLER_COUNT = 56;
export const RENDER_SHELL_A155C0_CALLER_FIRST_VA = 0x005dcac5;
export const RENDER_SHELL_A155C0_CALLER_LAST_VA = 0x007e82e7;
export const RENDER_SHELL_A155C0_LO_VA = 0x00ba9fe4;
export const RENDER_SHELL_A155C0_LO_BITS = 0x00000000;
export const RENDER_SHELL_A155C0_HI_VA = 0x00baa454;
export const RENDER_SHELL_A155C0_HI_BITS = 0x3f800000;
export const RENDER_SHELL_A155C0_CLAMP_OFF = 0x0;

export function renderShellA155c0ClampedLerp(y0, y1, t, clampFlag) {
  const a = f32(y0);
  const b = f32(y1);
  let tt = f32(t);
  /* VA 0x00a155c0 test cl,cl / VA 0x00a155c2 je 0xa155d4: clamp iff
     the LOW byte of the flag is nonzero. */
  if ((asU32(clampFlag) & 0xff) !== 0) {
    /* VA 0x00a155c4 maxss xmm2,[0xba9fe4] (+0.0f); VA 0x00a155cc
       minss xmm2,[0xbaa454] (1.0f) — second-operand NaN/equal
       semantics: NaN t -> +0.0f, -0.0f t -> +0.0f (v48 clamp01). */
    tt = sseMinss(sseMaxss(tt, f32FromBits(RENDER_SHELL_A155C0_LO_BITS)),
                  f32FromBits(RENDER_SHELL_A155C0_HI_BITS));
  }
  /* VA 0x00a155d4 subss xmm1,xmm0 (d = y1-y0, f32);
     VA 0x00a155d8 mulss xmm1,xmm2 (m = d*t, f32);
     VA 0x00a155dc addss xmm0,xmm1 (r = y0+m, f32);
     VA 0x00a155e0 ret */
  const d = f32(b - a);
  const m = f32(d * tt);
  return f32(a + m);
}
export function renderShellA155c0HostVa() {
  return RENDER_SHELL_A155C0_HOST_VA >>> 0;
}
export function renderShellA155c0EndVa() {
  return RENDER_SHELL_A155C0_END_VA >>> 0;
}
export function renderShellA155c0NextVa() {
  return RENDER_SHELL_A155C0_NEXT_VA >>> 0;
}
export function renderShellA155c0CallerCount() {
  return RENDER_SHELL_A155C0_CALLER_COUNT >>> 0;
}
export function renderShellA155c0CallerFirstVa() {
  return RENDER_SHELL_A155C0_CALLER_FIRST_VA >>> 0;
}
export function renderShellA155c0CallerLastVa() {
  return RENDER_SHELL_A155C0_CALLER_LAST_VA >>> 0;
}
export function renderShellA155c0LoVa() {
  return RENDER_SHELL_A155C0_LO_VA >>> 0;
}
export function renderShellA155c0LoBits() {
  return RENDER_SHELL_A155C0_LO_BITS >>> 0;
}
export function renderShellA155c0HiVa() {
  return RENDER_SHELL_A155C0_HI_VA >>> 0;
}
export function renderShellA155c0HiBits() {
  return RENDER_SHELL_A155C0_HI_BITS >>> 0;
}
export function renderShellA155c0ClampOff() {
  return RENDER_SHELL_A155C0_CLAMP_OFF >>> 0;
}

/** P5 VA 0x0080ed8b: if boost minss(fade+0.6, 1.0) else fade. */
export function renderShellFadeApplyBoost(fade, boost) {
  if (!boost) return f32(fade);
  const one = f32FromBits(RENDER_SHELL_F32_ONE_BITS);
  const add = f32FromBits(RENDER_SHELL_F32_BOOST_ADD_BITS);
  return sseMinss(f32(f32(fade) + add), one);
}

/**
 * G12 VA 0x0080edb5: mgr0==0xd && mgr1==1 && room flags bit 2 clear
 * → force fade = 1.0f.
 */
export function renderShellFadeForceFullNeeded(managerDword0, managerDword1, roomFlagsAt44) {
  if (asI32(managerDword0) !== RENDER_SHELL_FADE_FORCE_MGR0) return false;
  if (asI32(managerDword1) !== RENDER_SHELL_FADE_FORCE_MGR1) return false;
  if (((asU32(roomFlagsAt44) >>> 2) & 1) !== 0) return false;
  return true;
}

/** P6 VA 0x0080edd3: maxss(fade - Manager+0x67734, 0). */
export function renderShellFadeT(fade, manager67734) {
  return sseMaxss(f32(f32(fade) - f32(manager67734)), f32(0));
}

/** P7 VA 0x0080ee10: (src - base) * t + base. */
export function renderShellFadeLerpChannel(src, base, t) {
  const s = f32(src);
  const b = f32(base);
  const tt = f32(t);
  return f32(f32(f32(s - b) * tt) + b);
}

/**
 * P8 VA 0x0080ee5c: if ptr!=0 && (byte_at_ptr+4 & 1) → ptr else current.
 */
export function renderShellC379b8Next(ptr, byteAtPtrPlus4, currentC379b8) {
  const p = asU32(ptr);
  if (p === 0) return asU32(currentC379b8);
  if ((asU8(byteAtPtrPlus4) & 1) !== 0) return p;
  return asU32(currentC379b8);
}

/** P1 VA 0x0080eea2: Game+0x730c ← 0. */
export function renderShellTreeCountClear(count730c) {
  return 0;
}

/** P1b VA 0x0080ee98: head self-links. */
export function renderShellTreeHeadSelfLinks(headNode) {
  const h = asU32(headNode);
  return { link0: h, link4: h, link8: h };
}

/** G4 VA 0x0080eead: entity count != 0 (unsigned jbe). */
export function renderShellEntityLoopNeeded(entityCount1264) {
  return asU32(entityCount1264) !== 0;
}

/* ---- ABI v29: the entity loop re-derives its bound AND its array base ----
 * Traced straight off the register stream. esi is the index; edi is Game*.
 * The tempting reading is `for (i = 0; i < count; ++i)` with count hoisted,
 * because the entry gate loads it once. But 0x0080eebc reloads the array base
 * at the TOP of the body and 0x0080eecb reloads the count at the BOTTOM,
 * both on the far side of `call 0x00806c20`. Game::Render can add or remove
 * entities, which is precisely why the PE re-reads.
 */

/** P199 continue gate: `inc esi; cmp esi,[Game+0x1264]; jb` — unsigned. */
export function renderShellEntityLoopStep(index, countAfter) {
  return renderShellEntityLoopNextIndex(index) < asU32(countAfter);
}

/** P200 `inc esi` with 32-bit wrap. */
export function renderShellEntityLoopNextIndex(index) {
  return (asU32(index) + 1) >>> 0;
}

/** P201 slot address from the base recaptured for this iteration. */
export function renderShellEntityLoopArg(baseAfter, index) {
  return (asU32(baseAfter) + asU32(index) * RENDER_SHELL_ENTITY_ELEM) >>> 0;
}

/** G172 the base really is reloaded inside the body. */
export function renderShellEntityLoopBaseReloadNeeded() {
  return true;
}

/**
 * P202 bounded driver.
 * @returns {{ calls: number, slots: number[] }}
 */
export function renderShellEntityLoopRun(entryCount, baseSeq, countSeq) {
  if (!renderShellEntityLoopNeeded(entryCount)) return { calls: 0, slots: [] };
  const slots = [];
  let index = 0;
  let calls = 0;
  const limit = Math.min(baseSeq.length, countSeq.length);
  while (calls < limit) {
    slots.push(renderShellEntityLoopArg(baseSeq[calls], index));
    calls += 1;
    if (!renderShellEntityLoopStep(index, countSeq[calls - 1])) break;
    index = renderShellEntityLoopNextIndex(index);
  }
  return { calls, slots };
}

/* ---- ABI v29: vector<EntitySaveState> grow 0x00708eb0 pure islands ---- */

/** P204 element count before the grow (same /0x78 sequence as v28). */
export function renderShell708eb0SizeBefore(begin, end) {
  return renderShell6ef590VecCapacity(begin, end);
}

/** G173 unsigned max-length gate: want > 0x2222222 throws. */
export function renderShell708eb0LenOverflow(want) {
  return asU32(want) > RENDER_SHELL_708EB0_MAX_LEN;
}

/** P205 ((want<<4) - want) << 3 == want * 0x78, 32-bit wrap. */
export function renderShell708eb0AllocBytes(want) {
  const w = asU32(want);
  const shifted = (w << RENDER_SHELL_708EB0_SHL_A) >>> 0;
  return (((shifted - w) >>> 0) << RENDER_SHELL_708EB0_SHL_B) >>> 0;
}

/** P206 one per-element copy call per existing element. */
export function renderShell708eb0CopyCount(begin, end) {
  return renderShell708eb0SizeBefore(begin, end);
}

export function renderShell708eb0AllocHostVa() {
  return RENDER_SHELL_HOST_40CF00_VA >>> 0;
}
export function renderShell708eb0CopyHostVa() {
  return RENDER_SHELL_HOST_4D3130_VA >>> 0;
}
export function renderShell708eb0InstallHostVa() {
  return RENDER_SHELL_HOST_4D7340_VA >>> 0;
}

export function renderShellEntityCountOff() {
  return RENDER_SHELL_ENTITY_COUNT_OFF >>> 0;
}
export function renderShellEntityArrayOff() {
  return RENDER_SHELL_ENTITY_ARRAY_OFF >>> 0;
}
export function renderShellEntityRenderVa() {
  return RENDER_SHELL_ENTITY_RENDER_VA >>> 0;
}

/** P2 VA 0x0080eed6: signed 32-bit imul product. */
export function renderShellGridCellCount(gridW0c, gridH10) {
  return Math.imul(asI32(gridH10), asI32(gridW0c)) | 0;
}

/** G5 VA 0x0080eee0: signed cell_count > 0. */
export function renderShellGridLoopNeeded(cellCount) {
  return asI32(cellCount) > 0;
}

/** G6 VA 0x0080eee9: non-null grid slot. */
export function renderShellGridSlotNeedsRender(slotPtr) {
  return asU32(slotPtr) !== 0;
}

/** G7 VA 0x0080ef08 pure dual (FUN_0074ea50 still host). */
export function renderShellStageOverlayDualOpen(gameField8, nestedRoomType10) {
  return (
    asI32(gameField8) === RENDER_SHELL_OVERLAY_GAME_MODE_5 &&
    asI32(nestedRoomType10) === RENDER_SHELL_OVERLAY_ROOM_TYPE_59
  );
}

/** G8 VA 0x0080f12c: ManagerOpts+0x2a3c5 != 0. */
export function renderShellOptionAuxOpen(option2a3c5) {
  return asU8(option2a3c5) !== 0;
}

/**
 * G13 VA 0x0080f13a–0x0080f176: after G8 open, decide FUN_00817830.
 * fadePollNeeded false (fade strictly > 0) → call direct.
 * else after host polls → call iff pollSelectsOne.
 */
export function renderShellAux817830Needed(fadePollNeeded, pollSelectsOne) {
  if (!fadePollNeeded) return true;
  return !!pollSelectsOne;
}

/**
 * G8+G13 composite: option closed → no call; else nested aux decision.
 */
export function renderShellOptionAux817830Needed(
  option2a3c5,
  fadePollNeeded,
  pollSelectsOne,
) {
  if (!renderShellOptionAuxOpen(option2a3c5)) return false;
  return renderShellAux817830Needed(fadePollNeeded, pollSelectsOne);
}

/**
 * P9 VA 0x0080f1b5–0x0080f1c9: RT depth-- with unsigned wrap; clear base iff 0.
 * @returns {{ depthAfter: number, clearStackPtr: boolean }}
 */
export function renderShellRtPopDepthStep(depthBefore) {
  const depthAfter = (asU32(depthBefore) - 1) >>> 0;
  return {
    depthAfter,
    clearStackPtr: depthAfter === 0,
  };
}

/**
 * G9/P3 VA 0x0080f1d5: if flag==1 clear and need host FUN_00826ae0.
 * @returns {{ hostNeeded: boolean, flag: number }}
 */
export function renderShellFlag11f6Oneshot(flag11f6) {
  let flag = asU8(flag11f6);
  if (flag === 1) {
    return { hostNeeded: true, flag: 0 };
  }
  return { hostNeeded: false, flag };
}

/* ---- FUN_00817830 body pure (VA 0x00817830) ---- */

/** P10 VA 0x0081785f: signed imul stage * 0x13c. */
export function renderShell817830StageSlotOffset(stage1d18) {
  return Math.imul(asI32(stage1d18), RENDER_SHELL_817830_STAGE_STRIDE) | 0;
}

/** G14 VA 0x00817869: stage slot dword != 0. */
export function renderShell817830StageSlotOpen(stageSlot1d80) {
  return asU32(stageSlot1d80) !== 0;
}

/** G15 VA 0x00817877: GetStageID ∈ {4,5,6,0x1b,0x1c}. */
export function renderShell817830StageIdSpecial(stageId) {
  const id = asU32(stageId);
  return (
    id === RENDER_SHELL_817830_STAGE_ID_4 ||
    id === RENDER_SHELL_817830_STAGE_ID_5 ||
    id === RENDER_SHELL_817830_STAGE_ID_6 ||
    id === RENDER_SHELL_817830_STAGE_ID_1B ||
    id === RENDER_SHELL_817830_STAGE_ID_1C
  );
}

/** G16 VA 0x00817890: room+0x54 >= 0 && flags bit5. */
export function renderShell817830RoomSpecialOk(roomField54, roomFlags44) {
  if (asI32(roomField54) < 0) return false;
  return ((asU32(roomFlags44) >>> 5) & 1) !== 0;
}

/** G17 VA 0x008178a3: special flag byte. */
export function renderShell817830SpecialFlag(stageIdSpecial, roomSpecialOk) {
  return !!(stageIdSpecial && roomSpecialOk);
}

/**
 * G18 VA 0x008178a9: fade_7240 strictly > 0 (comiss/ja) OR special.
 * NaN does not take ja → needs special.
 */
export function renderShell817830BodyContinueNeeded(fade7240, specialFlag) {
  const x = f32(fade7240);
  if (x > 0) return true;
  return !!specialFlag;
}

/** G19 composite after host GetStageID. */
export function renderShell817830BodyNeeded(
  stageSlot1d80,
  stageId,
  roomField54,
  roomFlags44,
  fade7240,
) {
  if (!renderShell817830StageSlotOpen(stageSlot1d80)) return false;
  const special = renderShell817830SpecialFlag(
    renderShell817830StageIdSpecial(stageId),
    renderShell817830RoomSpecialOk(roomField54, roomFlags44),
  );
  return renderShell817830BodyContinueNeeded(fade7240, special);
}

/** P11 VA 0x008178d0: 2*(w+h) from Game rect floats — PE (w+w)+(h+h). */
export function renderShell817830ViewSpanSum(game14, game18, game1c, game20) {
  const w = f32(f32(game1c) - f32(game14));
  const h = f32(f32(game20) - f32(game18));
  const twoW = f32(w + w);
  const twoH = f32(h + h);
  return f32(twoW + twoH);
}

/**
 * P12 VA 0x00817968: MSVC uint32→float32 via signed double + 2^32 bias.
 */
export function renderShell817830U32ToF32(value) {
  const u = asU32(value);
  const asSigned = u | 0; /* force i32 */
  let d = asSigned;
  if (u >>> 31) {
    d += 4294967296;
  }
  return f32(d);
}

/** P13 VA 0x00817986: span/dim + 0.5f. */
export function renderShell817830ScalePreFloor(spanSum, dimF) {
  const half = f32FromBits(RENDER_SHELL_F32_HALF_BITS);
  return f32(f32(f32(spanSum) / f32(dimF)) + half);
}

/** G20 VA 0x00817a73: stage == 0x2c. */
export function renderShell817830Stage2cColorNeeded(stage1d18) {
  return asI32(stage1d18) === RENDER_SHELL_817830_STAGE_2C;
}

/** P16 DAT_00bac350 RGBA. */
export function renderShell817830Stage2cColor() {
  return {
    r: f32FromBits(RENDER_SHELL_F32_COLOR_R_2C_BITS),
    g: f32FromBits(RENDER_SHELL_F32_COLOR_G_2C_BITS),
    b: f32FromBits(RENDER_SHELL_F32_COLOR_B_2C_BITS),
    a: f32FromBits(RENDER_SHELL_F32_COLOR_A_2C_BITS),
  };
}

/**
 * P14 VA 0x00817a8b: special ? clamp(room_54/30, 0, 1) : 0.
 * cvtdq2ps on room_54 (signed int → float).
 */
export function renderShell817830SpecialBaseT(specialFlag, roomField54) {
  if (!specialFlag) return f32(0);
  const thirty = f32FromBits(RENDER_SHELL_F32_THIRTY_BITS);
  const one = f32FromBits(RENDER_SHELL_F32_ONE_BITS);
  const raw = f32(f32(asI32(roomField54)) / thirty);
  return sseMinss(sseMaxss(raw, f32(0)), one);
}

/**
 * P15 VA 0x00817ac0: if fade > 0: base + (1-base)*fade else base.
 */
export function renderShell817830FadeBlendT(baseT, fade7240) {
  const fade = f32(fade7240);
  if (!(fade > 0)) return f32(baseT);
  const one = f32FromBits(RENDER_SHELL_F32_ONE_BITS);
  const b = f32(baseT);
  return f32(f32(b) + f32(f32(one - b) * fade));
}

/* ---- FUN_00817830 residual open pure (VA 0x00817adc…) — ABI v5 ---- */

/**
 * P17 VA 0x00817af4: cvtdq2ps of Manager+0x264f8 (signed int32 → float32).
 */
export function renderShell817830FrameToF32(manager264f8) {
  return f32(asI32(manager264f8));
}

/**
 * P18 VA 0x00817b02…0x00817b26: shader time scales before host a14050.
 *   mul_01 = frame * 0.01; mul_05 = frame * 0.5; mul_005 = mul_05 * 0.1
 */
export function renderShell817830ShaderScales(frameF) {
  const frame = f32(frameF);
  const hundredth = f32FromBits(RENDER_SHELL_F32_HUNDREDTH_BITS);
  const half = f32FromBits(RENDER_SHELL_F32_HALF_BITS);
  const tenth = f32FromBits(RENDER_SHELL_F32_TENTH_BITS);
  const mul01 = f32(frame * hundredth);
  const mul05 = f32(frame * half);
  const mul005 = f32(mul05 * tenth);
  return { mul01, mul05, mul005 };
}

/**
 * G21 VA 0x00817b3d: (type - 9) <= 3 unsigned → type ∈ [9,12].
 */
export function renderShell817830LroomTypeRange(roomType48) {
  const adj =
    (asU32(roomType48) - (RENDER_SHELL_817830_LROOM_TYPE_BASE >>> 0)) >>> 0;
  return adj <= (RENDER_SHELL_817830_LROOM_TYPE_SPAN >>> 0);
}

/**
 * G22 VA 0x00817bc9: Room* and [Room+0x10] both non-null.
 */
export function renderShell817830RoomDescOpen(roomPtr, nestedDescPtr) {
  return asU32(roomPtr) !== 0 && asU32(nestedDescPtr) !== 0;
}

/**
 * G23 VA 0x00817bdf: nested room type dword == 9.
 */
export function renderShell817830RoomTypeEq9(roomType48) {
  return asI32(roomType48) === RENDER_SHELL_817830_ROOM_TYPE_9;
}

/* ---- opaque_call_00a14050 pure (VA 0x00a14050) — ABI v6 ---- */

/**
 * G24 VA 0x00a1407b…0x00a1408c: post-416440 continue to host a14270.
 *   node+0xd==0 && id >= node+0x10 (unsigned) && node != map root.
 */
export function renderShellA14050LookupContinue(
  nodeByte0d,
  shaderId,
  nodeField10,
  nodePtr,
  mapRootC379bc,
) {
  if (asU8(nodeByte0d) !== 0) return false;
  if (asU32(shaderId) < asU32(nodeField10)) return false;
  if (asU32(nodePtr) === asU32(mapRootC379bc)) return false;
  return true;
}

/**
 * G25 VA 0x00a1409c…0x00a140a6: ptr != 0 && (byte_at_ptr+4 & 1).
 */
export function renderShellA14050BindOk(ptr, byteAtPtrPlus4) {
  if (asU32(ptr) === 0) return false;
  if ((asU8(byteAtPtrPlus4) & 1) === 0) return false;
  return true;
}

/**
 * P19 VA 0x00a140a8: if bind_ok store ptr into c379b8 and succeed.
 * @returns {{ ok: boolean, c379b8: number }}
 */
export function renderShellA14050TryBind(ptr, byteAtPtrPlus4, currentC379b8) {
  if (!renderShellA14050BindOk(ptr, byteAtPtrPlus4)) {
    return { ok: false, c379b8: asU32(currentC379b8) };
  }
  return { ok: true, c379b8: asU32(ptr) };
}

/* ---- a14050 whole-body chain plan/resume - ABI v31 ---- */

/** Chain plan codes. Only FAIL/FOUND are emitted from this callsite: G24
 * pass implies the a14270 inner 416440 re-walk hits the same bound (no map
 * write between the two walks), so the INSERT/THROW edges of
 * renderShellA14270ResidualPlan are unreachable here. Values are distinct
 * from the a14270 plan codes (see renderShellA14270ResidualPlan). */
export const RENDER_SHELL_A14050_CHAIN_PLAN_FAIL = 0;
export const RENDER_SHELL_A14050_CHAIN_PLAN_FOUND = 1;

/**
 * G31 VA 0x00a1407b...0x00a1408c whole-body decision surface.
 * Params are the RECAPTURED post-416440 bound fields (never a pre-walk
 * snapshot); mapRoot = first dword of the map object (0xc379bc head).
 * @returns {number} RENDER_SHELL_A14050_CHAIN_PLAN_*
 */
export function renderShellA14050ChainPlan(
  shaderId,
  boundIsnil,
  boundKey,
  boundPtr,
  mapRootC379bc,
) {
  if (asU8(boundIsnil) !== 0) return RENDER_SHELL_A14050_CHAIN_PLAN_FAIL;
  if (asU32(shaderId) < asU32(boundKey)) return RENDER_SHELL_A14050_CHAIN_PLAN_FAIL;
  if (asU32(boundPtr) === asU32(mapRootC379bc)) return RENDER_SHELL_A14050_CHAIN_PLAN_FAIL;
  return RENDER_SHELL_A14050_CHAIN_PLAN_FOUND;
}

/**
 * G35 VA 0x00a1409c...0x00a140ad typed continuation at the map-value-slot
 * edge. valueAtPtr is the RECAPTURED dword after the a14270 sub-step (the
 * PE reads it from bound+0x14), byteAtValuePlus4 the recaptured byte at
 * value+4 - both consumed AFTER the boundary, never folded from a pre-call
 * snapshot (recapture discipline). Same predicate as G25/P19 exported as the named
 * chain-resume boundary entry.
 * @returns {{ ok: boolean, c379b8: number }}
 */
export function renderShellA14050ChainResume(valueAtPtr, byteAtValuePlus4, currentC379b8) {
  if (asU32(valueAtPtr) === 0) return { ok: false, c379b8: asU32(currentC379b8) };
  if ((asU8(byteAtValuePlus4) & 1) === 0) return { ok: false, c379b8: asU32(currentC379b8) };
  return { ok: true, c379b8: asU32(valueAtPtr) };
}

/**
 * Full-body reference model (oracle only, not exported to Wasm): plan then,
 * on FOUND, bind from the recaptured value; FAIL leaves c379b8 untouched.
 * Mirrors PE order exactly - the value slot is read only on the FOUND path.
 * @returns {{ plan: number, ok: boolean, c379b8: number }}
 */
export function renderShellA14050ChainRun(
  shaderId,
  boundIsnil,
  boundKey,
  boundPtr,
  mapRootC379bc,
  valueAtPtr,
  byteAtValuePlus4,
  currentC379b8,
) {
  const plan = renderShellA14050ChainPlan(shaderId, boundIsnil, boundKey, boundPtr, mapRootC379bc);
  if (plan !== RENDER_SHELL_A14050_CHAIN_PLAN_FOUND) {
    return { plan, ok: false, c379b8: asU32(currentC379b8) };
  }
  const resume = renderShellA14050ChainResume(valueAtPtr, byteAtValuePlus4, currentC379b8);
  return { plan, ok: resume.ok, c379b8: resume.c379b8 };
}

/* ---- opaque_call_00a159d0 pure (VA 0x00a159d0) — ABI v7 ---- */

/**
 * P24 VA 0x00a159f0…0x00a15a11: A-Z→a-z (unsigned (c-'A')≤0x19); '\\'→'/'.
 */
export function renderShellA159d0NormChar(ch) {
  const c = asU8(ch);
  const delta = (c - 0x41) & 0xff;
  let folded = c;
  if (delta <= 0x19) {
    folded = (c + 0x20) & 0xff;
  }
  if (folded === RENDER_SHELL_A159D0_PATH_SEP_FROM) {
    return RENDER_SHELL_A159D0_PATH_SEP_TO;
  }
  return folded;
}

/**
 * P25 VA 0x00a15a14…0x00a15a1c: hash = hash*33 + norm(ch), uint32 wrap.
 */
export function renderShellA159d0HashStep(hash, ch) {
  const norm = renderShellA159d0NormChar(ch);
  return (asU32(hash) * 33 + norm) >>> 0;
}

/**
 * P26 VA 0x00a159d0…0x00a15a28 full body.
 * @param {null|undefined|Uint8Array|number[]|string} bytes
 *   null/undefined → 0; string encoded as latin1 bytes; arrays until 0 or end.
 */
export function renderShellA159d0Hash(bytes) {
  if (bytes == null) {
    return 0;
  }
  let arr;
  if (typeof bytes === "string") {
    arr = Array.from(bytes, (ch) => ch.charCodeAt(0) & 0xff);
  } else {
    arr = bytes;
  }
  if (arr.length === 0 || asU8(arr[0]) === 0) {
    return RENDER_SHELL_A159D0_SEED >>> 0;
  }
  let hash = RENDER_SHELL_A159D0_SEED >>> 0;
  for (let i = 0; i < arr.length; i += 1) {
    const ch = asU8(arr[i]);
    if (ch === 0) break;
    hash = renderShellA159d0HashStep(hash, ch);
  }
  return hash;
}

/* ---- opaque_call_00416440 pure (VA 0x00416440) — ABI v8 ---- */

/**
 * P27 one lower_bound walk step (sparse fields).
 * @returns {{ next: number, side: number, bound: number }}
 */
export function renderShell416440WalkStep(
  node,
  nodeKey,
  nodeLeft,
  nodeRight,
  searchKey,
  bound,
) {
  if (asU32(nodeKey) >= asU32(searchKey)) {
    return {
      next: asU32(nodeLeft),
      side: 1,
      bound: asU32(node),
    };
  }
  return {
    next: asU32(nodeRight),
    side: 0,
    bound: asU32(bound),
  };
}

/**
 * P28 complete find_lower_bound against a DataView linear-memory tree.
 * @param {DataView} view
 * @param {number} mapHead head/sentinel address
 * @param {number} searchKey
 * @returns {{ node: number, side: number, bound: number }}
 */
export function renderShell416440FindLowerBound(view, mapHead, searchKey) {
  const loadU32 = (addr) => view.getUint32(asU32(addr), true) >>> 0;
  const isNil = (addr) =>
    view.getUint8((asU32(addr) + RENDER_SHELL_MAP_ISNIL_OFF) >>> 0);

  const head = asU32(mapHead);
  const root = loadU32(head + RENDER_SHELL_MAP_PARENT_OFF);
  let node = root;
  let side = 0;
  let bound = head;
  if (isNil(root) !== 0) {
    return { node: root, side: 0, bound: head };
  }
  let last = root;
  for (;;) {
    last = node;
    const nodeKey = loadU32(node + RENDER_SHELL_MAP_KEY_OFF);
    const left = loadU32(node + RENDER_SHELL_MAP_LEFT_OFF);
    const right = loadU32(node + RENDER_SHELL_MAP_RIGHT_OFF);
    const step = renderShell416440WalkStep(
      node,
      nodeKey,
      left,
      right,
      searchKey,
      bound,
    );
    side = step.side;
    bound = step.bound;
    node = step.next;
    if (isNil(node) !== 0) break;
  }
  return { node: last, side, bound };
}

/* ---- opaque_call_00a14270 pure islands — ABI v8 ---- */

/** G27 VA 0x00a142aa: !isnil && key >= node_key → found. */
export function renderShellA14270LookupHit(nodeIsnil, searchKey, nodeKey) {
  if (asU8(nodeIsnil) !== 0) return false;
  return asU32(searchKey) >= asU32(nodeKey);
}

/** P29 VA 0x00a14309: node + 0x14. */
export function renderShellA14270ValuePtr(nodePtr) {
  return (asU32(nodePtr) + (RENDER_SHELL_MAP_VALUE_OFF >>> 0)) >>> 0;
}

/** G28 VA 0x00a142b7: size == 0x0aaaaaaa. */
export function renderShellA14270MapSizeFull(mapSize) {
  return asU32(mapSize) === (RENDER_SHELL_A14270_SIZE_FULL >>> 0);
}

/**
 * G29 residual plan: FOUND / THROW / INSERT.
 * @returns {number} RENDER_SHELL_A14270_PLAN_*
 */
export function renderShellA14270ResidualPlan(
  nodeIsnil,
  searchKey,
  nodeKey,
  mapSize,
) {
  if (renderShellA14270LookupHit(nodeIsnil, searchKey, nodeKey)) {
    return RENDER_SHELL_A14270_PLAN_FOUND;
  }
  if (renderShellA14270MapSizeFull(mapSize)) {
    return RENDER_SHELL_A14270_PLAN_THROW;
  }
  return RENDER_SHELL_A14270_PLAN_INSERT;
}

/**
 * P36 post-alloc node field init against DataView linear memory.
 * @param {DataView} view
 */
export function renderShellA14270NodeInit(view, nodePtr, mapHead, key) {
  const n = asU32(nodePtr);
  const h = asU32(mapHead);
  view.setUint32(n + RENDER_SHELL_MAP_KEY_OFF, asU32(key), true);
  view.setUint32(n + RENDER_SHELL_MAP_VALUE_OFF, 0, true);
  view.setUint32(n + RENDER_SHELL_MAP_LEFT_OFF, h, true);
  view.setUint32(n + RENDER_SHELL_MAP_PARENT_OFF, h, true);
  view.setUint32(n + RENDER_SHELL_MAP_RIGHT_OFF, h, true);
  view.setUint8(n + RENDER_SHELL_MAP_COLOR_OFF, 0);
  view.setUint8(n + RENDER_SHELL_MAP_ISNIL_OFF, 0);
}

/**
 * P37 insert_link pure prefix of 0x415bd0.
 * @param {DataView} view
 * @returns {boolean} true when rebalance pure residual needed (parent red)
 */
export function renderShellA14270InsertLink(view, mapThis, parent, side, newNode) {
  const m = asU32(mapThis);
  const p = asU32(parent);
  const n = asU32(newNode);
  const s = asU32(side);
  const head = view.getUint32(m, true) >>> 0;
  const size = (view.getUint32(m + 4, true) + 1) >>> 0;
  view.setUint32(m + 4, size, true);
  view.setUint32(n + RENDER_SHELL_MAP_PARENT_OFF, p, true);
  if (p === head) {
    view.setUint32(head + RENDER_SHELL_MAP_LEFT_OFF, n, true);
    view.setUint32(head + RENDER_SHELL_MAP_PARENT_OFF, n, true);
    view.setUint32(head + RENDER_SHELL_MAP_RIGHT_OFF, n, true);
    view.setUint8(n + RENDER_SHELL_MAP_COLOR_OFF, RENDER_SHELL_MAP_COLOR_BLACK);
    return false;
  }
  if (s === 0) {
    view.setUint32(p + RENDER_SHELL_MAP_RIGHT_OFF, n, true);
    const headRight = view.getUint32(head + RENDER_SHELL_MAP_RIGHT_OFF, true) >>> 0;
    if (p === headRight) {
      view.setUint32(head + RENDER_SHELL_MAP_RIGHT_OFF, n, true);
    }
  } else {
    view.setUint32(p + RENDER_SHELL_MAP_LEFT_OFF, n, true);
    const headLeft = view.getUint32(head + RENDER_SHELL_MAP_LEFT_OFF, true) >>> 0;
    if (p === headLeft) {
      view.setUint32(head + RENDER_SHELL_MAP_LEFT_OFF, n, true);
    }
  }
  return view.getUint8(p + RENDER_SHELL_MAP_COLOR_OFF) === RENDER_SHELL_MAP_COLOR_RED;
}

function mapIsNil(view, node) {
  return view.getUint8(asU32(node) + RENDER_SHELL_MAP_ISNIL_OFF) !== 0;
}

function mapColor(view, node) {
  return view.getUint8(asU32(node) + RENDER_SHELL_MAP_COLOR_OFF);
}

/**
 * P42 rotate right VA 0x00415f80.
 * @param {DataView} view
 */
export function renderShellA14270RotateRight(view, mapThis, node) {
  const x = asU32(node);
  const left = view.getUint32(x + RENDER_SHELL_MAP_LEFT_OFF, true) >>> 0;
  const leftRight = view.getUint32(left + RENDER_SHELL_MAP_RIGHT_OFF, true) >>> 0;
  view.setUint32(x + RENDER_SHELL_MAP_LEFT_OFF, leftRight, true);
  if (!mapIsNil(view, leftRight)) {
    view.setUint32(leftRight + RENDER_SHELL_MAP_PARENT_OFF, x, true);
  }
  const parent = view.getUint32(x + RENDER_SHELL_MAP_PARENT_OFF, true) >>> 0;
  view.setUint32(left + RENDER_SHELL_MAP_PARENT_OFF, parent, true);
  const head = view.getUint32(asU32(mapThis), true) >>> 0;
  const root = view.getUint32(head + RENDER_SHELL_MAP_PARENT_OFF, true) >>> 0;
  if (x === root) {
    view.setUint32(head + RENDER_SHELL_MAP_PARENT_OFF, left, true);
  } else {
    const pRight = view.getUint32(parent + RENDER_SHELL_MAP_RIGHT_OFF, true) >>> 0;
    if (x === pRight) {
      view.setUint32(parent + RENDER_SHELL_MAP_RIGHT_OFF, left, true);
    } else {
      view.setUint32(parent + RENDER_SHELL_MAP_LEFT_OFF, left, true);
    }
  }
  view.setUint32(left + RENDER_SHELL_MAP_RIGHT_OFF, x, true);
  view.setUint32(x + RENDER_SHELL_MAP_PARENT_OFF, left, true);
}

/**
 * P43 rotate left VA 0x00415fe0.
 * @param {DataView} view
 */
export function renderShellA14270RotateLeft(view, mapThis, node) {
  const x = asU32(node);
  const right = view.getUint32(x + RENDER_SHELL_MAP_RIGHT_OFF, true) >>> 0;
  const rightLeft = view.getUint32(right + RENDER_SHELL_MAP_LEFT_OFF, true) >>> 0;
  view.setUint32(x + RENDER_SHELL_MAP_RIGHT_OFF, rightLeft, true);
  if (!mapIsNil(view, rightLeft)) {
    view.setUint32(rightLeft + RENDER_SHELL_MAP_PARENT_OFF, x, true);
  }
  const parent = view.getUint32(x + RENDER_SHELL_MAP_PARENT_OFF, true) >>> 0;
  view.setUint32(right + RENDER_SHELL_MAP_PARENT_OFF, parent, true);
  const head = view.getUint32(asU32(mapThis), true) >>> 0;
  const root = view.getUint32(head + RENDER_SHELL_MAP_PARENT_OFF, true) >>> 0;
  if (x === root) {
    view.setUint32(head + RENDER_SHELL_MAP_PARENT_OFF, right, true);
  } else {
    const pLeft = view.getUint32(parent + RENDER_SHELL_MAP_LEFT_OFF, true) >>> 0;
    if (x === pLeft) {
      view.setUint32(parent + RENDER_SHELL_MAP_LEFT_OFF, right, true);
    } else {
      view.setUint32(parent + RENDER_SHELL_MAP_RIGHT_OFF, right, true);
    }
  }
  view.setUint32(right + RENDER_SHELL_MAP_LEFT_OFF, x, true);
  view.setUint32(x + RENDER_SHELL_MAP_PARENT_OFF, right, true);
}

/**
 * P44 rebalance residual pure-complete VA 0x00415c1a…0x00415cd7.
 * @param {DataView} view
 */
export function renderShellA14270Rebalance(view, mapThis, newNode) {
  const head = view.getUint32(asU32(mapThis), true) >>> 0;
  let cur = asU32(newNode);
  let parent = view.getUint32(cur + RENDER_SHELL_MAP_PARENT_OFF, true) >>> 0;
  if (mapColor(view, parent) === RENDER_SHELL_MAP_COLOR_RED) {
    for (;;) {
      parent = view.getUint32(cur + RENDER_SHELL_MAP_PARENT_OFF, true) >>> 0;
      const grand =
        view.getUint32(parent + RENDER_SHELL_MAP_PARENT_OFF, true) >>> 0;
      const gleft = view.getUint32(grand + RENDER_SHELL_MAP_LEFT_OFF, true) >>> 0;
      if (parent === gleft) {
        const uncle =
          view.getUint32(grand + RENDER_SHELL_MAP_RIGHT_OFF, true) >>> 0;
        if (mapColor(view, uncle) === RENDER_SHELL_MAP_COLOR_RED) {
          view.setUint8(parent + RENDER_SHELL_MAP_COLOR_OFF, RENDER_SHELL_MAP_COLOR_BLACK);
          view.setUint8(uncle + RENDER_SHELL_MAP_COLOR_OFF, RENDER_SHELL_MAP_COLOR_BLACK);
          view.setUint8(grand + RENDER_SHELL_MAP_COLOR_OFF, RENDER_SHELL_MAP_COLOR_RED);
          cur = grand;
        } else {
          const pRight =
            view.getUint32(parent + RENDER_SHELL_MAP_RIGHT_OFF, true) >>> 0;
          if (cur === pRight) {
            cur = parent;
            renderShellA14270RotateLeft(view, mapThis, cur);
          }
          parent = view.getUint32(cur + RENDER_SHELL_MAP_PARENT_OFF, true) >>> 0;
          view.setUint8(parent + RENDER_SHELL_MAP_COLOR_OFF, RENDER_SHELL_MAP_COLOR_BLACK);
          const g2 =
            view.getUint32(parent + RENDER_SHELL_MAP_PARENT_OFF, true) >>> 0;
          view.setUint8(g2 + RENDER_SHELL_MAP_COLOR_OFF, RENDER_SHELL_MAP_COLOR_RED);
          renderShellA14270RotateRight(view, mapThis, g2);
        }
      } else {
        const uncle = gleft;
        if (mapColor(view, uncle) === RENDER_SHELL_MAP_COLOR_RED) {
          view.setUint8(parent + RENDER_SHELL_MAP_COLOR_OFF, RENDER_SHELL_MAP_COLOR_BLACK);
          view.setUint8(uncle + RENDER_SHELL_MAP_COLOR_OFF, RENDER_SHELL_MAP_COLOR_BLACK);
          view.setUint8(grand + RENDER_SHELL_MAP_COLOR_OFF, RENDER_SHELL_MAP_COLOR_RED);
          cur = grand;
        } else {
          const pLeft =
            view.getUint32(parent + RENDER_SHELL_MAP_LEFT_OFF, true) >>> 0;
          if (cur === pLeft) {
            cur = parent;
            renderShellA14270RotateRight(view, mapThis, cur);
          }
          parent = view.getUint32(cur + RENDER_SHELL_MAP_PARENT_OFF, true) >>> 0;
          view.setUint8(parent + RENDER_SHELL_MAP_COLOR_OFF, RENDER_SHELL_MAP_COLOR_BLACK);
          const g2 =
            view.getUint32(parent + RENDER_SHELL_MAP_PARENT_OFF, true) >>> 0;
          view.setUint8(g2 + RENDER_SHELL_MAP_COLOR_OFF, RENDER_SHELL_MAP_COLOR_RED);
          renderShellA14270RotateLeft(view, mapThis, g2);
        }
      }
      parent = view.getUint32(cur + RENDER_SHELL_MAP_PARENT_OFF, true) >>> 0;
      if (mapColor(view, parent) !== RENDER_SHELL_MAP_COLOR_RED) break;
    }
  }
  const root = view.getUint32(head + RENDER_SHELL_MAP_PARENT_OFF, true) >>> 0;
  view.setUint8(root + RENDER_SHELL_MAP_COLOR_OFF, RENDER_SHELL_MAP_COLOR_BLACK);
}

/**
 * P45 full 0x415bd0 after node_init: insert_link + non-empty rebalance.
 * @param {DataView} view
 */
export function renderShellA14270InsertFix(view, mapThis, parent, side, newNode) {
  const head = view.getUint32(asU32(mapThis), true) >>> 0;
  renderShellA14270InsertLink(view, mapThis, parent, side, newNode);
  if (asU32(parent) !== head) {
    renderShellA14270Rebalance(view, mapThis, newNode);
  }
}

/* ---- a14270 host alloc / throw pure CF — ABI v11 ---- */

/** P46 VA 0x00a142cc: push 0x18 before host 0xa0f4c0. */
export function renderShellA14270AllocSize() {
  return RENDER_SHELL_A14270_ALLOC_SIZE >>> 0;
}

/**
 * P47 VA 0x00a142c0: mov esi, [edi] — map head for node_init.
 * @param {DataView} view
 */
export function renderShellA14270MapHead(view, mapThis) {
  return view.getUint32(asU32(mapThis), true) >>> 0;
}

/** P48 a0f4c0→a648b0 cl (xor cl,cl → MODE_ALLOC). */
export function renderShellA0f4c0A648b0Cl() {
  return RENDER_SHELL_A0F4C0_A648B0_CL & 0xff;
}

/** P48 a0f4c0→a648b0 stack arg1 (push 0). */
export function renderShellA0f4c0A648b0Arg1() {
  return RENDER_SHELL_A0F4C0_A648B0_ARG1 >>> 0;
}

/** P48 a0f4c0→a648b0 size_hi (xor edx,edx). */
export function renderShellA0f4c0A648b0SizeHi() {
  return RENDER_SHELL_A0F4C0_A648B0_SIZE_HI >>> 0;
}

/**
 * P49 a648b0 malloc IAT size for a0f4c0 request (size_hi always 0).
 * PE: malloc_size = request + 4 (32-bit wrap). Host owns malloc body.
 */
export function renderShellA0f4c0MallocSize(requestSize) {
  return (asU32(requestSize) + (RENDER_SHELL_A648B0_HEADER_SIZE >>> 0)) >>> 0;
}

/** P50 a14270 fixed malloc size for ALLOC_SIZE request → 0x1c. */
export function renderShellA14270MallocSize() {
  return renderShellA0f4c0MallocSize(RENDER_SHELL_A14270_ALLOC_SIZE);
}

/** P51 throw msg VA 0xb1b160 ("map/set too long"). */
export function renderShellA14270ThrowMsgVa() {
  return RENDER_SHELL_A14270_THROW_MSG_VA >>> 0;
}

/** G30 throw needed = G28 map size full. */
export function renderShellA14270ThrowNeeded(mapSize) {
  return renderShellA14270MapSizeFull(mapSize);
}

/**
 * P52 INSERT-path alloc prep before host 0xa0f4c0.
 * @param {DataView} view
 * @returns {{ mapHead: number, allocSize: number, mallocSize: number }}
 */
export function renderShellA14270InsertAllocPrep(view, mapThis) {
  return {
    mapHead: renderShellA14270MapHead(view, mapThis),
    allocSize: renderShellA14270AllocSize(),
    mallocSize: renderShellA14270MallocSize(),
  };
}

/* ---- Room::GetLRoomAreaDesc pure islands (VA 0x0081f8b0) — ABI v8 + v9 ---- */

/** P38 table row address: (type<<5) + tableBase. */
export function renderShell81f8b0TableRowAddr(roomType48, tableBase) {
  return ((asI32(roomType48) << 5) + asU32(tableBase)) >>> 0;
}

/**
 * P30 non-L fallback AABB pack (duplicate Room+0x14…0x20 ×2).
 * @returns {number[]} length 8
 */
export function renderShell81f8b0FallbackAabb(room14, room18, room1c, room20) {
  const a = f32(room14);
  const b = f32(room18);
  const c = f32(room1c);
  const d = f32(room20);
  return [a, b, c, d, a, b, c, d];
}

/** P31 signed in-bounds index or -1. */
export function renderShell81f8b0GridIndex(x, y, width, height) {
  const xi = asI32(x);
  const yi = asI32(y);
  const w = asI32(width);
  const h = asI32(height);
  if (xi < 0 || xi >= w || yi < 0 || yi >= h) return -1;
  return asI32(w * yi + xi);
}

/**
 * P32 x86 idiv toward-zero (width != 0).
 * @returns {{ quot: number, rem: number }}
 */
export function renderShell81f8b0GridDiv(index, width) {
  const n = asI32(index);
  const d = asI32(width);
  const quot = asI32(Math.trunc(n / d));
  const rem = asI32(n - quot * d);
  return { quot, rem };
}

/**
 * P33 grid float coord: rem/quot *40 + base ±20.
 * isX → base 40; else base 120. plusEdge → +20 else -20.
 */
export function renderShell81f8b0GridCoord(indexPart, isX, plusEdge) {
  const scale = f32FromBits(RENDER_SHELL_F32_FORTY_BITS);
  const edge = f32FromBits(RENDER_SHELL_F32_TWENTY_BITS);
  const yBase = f32FromBits(RENDER_SHELL_F32_HUNDRED_TWENTY_BITS);
  const part = f32(asI32(indexPart));
  let v = f32(part * scale);
  if (isX) {
    v = f32(v + scale);
  } else {
    v = f32(v + yBase);
  }
  if (plusEdge) {
    return f32(v + edge);
  }
  return f32(v - edge);
}

/**
 * P34 one cell (gx,gy) → (xf,yf).
 * @returns {{ x: number, y: number }}
 */
export function renderShell81f8b0CellXy(gx, gy, width, height, plusEdge) {
  const index = renderShell81f8b0GridIndex(gx, gy, width, height);
  const { quot, rem } = renderShell81f8b0GridDiv(index, width);
  return {
    x: renderShell81f8b0GridCoord(rem, true, plusEdge),
    y: renderShell81f8b0GridCoord(quot, false, plusEdge),
  };
}

/**
 * P35 full L-room 8-float pack from sparse 8-int table row.
 * @param {number[]} row8
 * @returns {number[]} length 8
 */
export function renderShell81f8b0LroomPack(row8, width, height) {
  const out = new Array(8);
  const p0 = renderShell81f8b0CellXy(row8[0], row8[1], width, height, false);
  out[0] = p0.x;
  out[1] = p0.y;
  const p1 = renderShell81f8b0CellXy(row8[2], row8[3], width, height, true);
  out[2] = p1.x;
  out[3] = p1.y;
  const p2 = renderShell81f8b0CellXy(row8[4], row8[5], width, height, false);
  out[4] = p2.x;
  out[5] = p2.y;
  const p3 = renderShell81f8b0CellXy(row8[6], row8[7], width, height, true);
  out[6] = p3.x;
  out[7] = p3.y;
  return out;
}

/* ---- GetLRoomAreaDesc live-row sparsify (ABI v30) ---- */

/**
 * G-bis VA 0x0081f8c7..0x0081f8cd: lea [type-9]; cmp 3; ja fallback.
 * Unsigned compare of (type-9) against 3 (same immediates as G21).
 * @returns {number} 1 when the L-room row path is needed, else 0
 */
export function renderShell81f8b0RowNeeded(roomType48) {
  const d = (asU32(roomType48) - RENDER_SHELL_817830_LROOM_TYPE_BASE) >>> 0;
  return d <= RENDER_SHELL_817830_LROOM_TYPE_SPAN ? 1 : 0;
}

/**
 * G-bis2 row load plan (entry, before any row-load boundary).
 * @param {number} tableSparsified capture-layer flag: DAT table supplied
 * @returns {number} PLAN_FALLBACK / PLAN_PURE / PLAN_LIVE
 */
export function renderShell81f8b0LoadPlan(roomType48, tableSparsified) {
  if (renderShell81f8b0RowNeeded(roomType48) === 0) {
    return RENDER_SHELL_81F8B0_PLAN_FALLBACK;
  }
  return tableSparsified !== 0
    ? RENDER_SHELL_81F8B0_PLAN_PURE
    : RENDER_SHELL_81F8B0_PLAN_LIVE;
}

/**
 * P-bis sparsified row-window read (VA 0x0081f8dc..0x0081f903).
 * Reads the eight dwords at rowAddr + 0,4,...,0x1c as SIGNED (the PE tests
 * them with test/js before using them as grid coordinates). rowAddr == 0 is
 * a null window: returns eight 0s (the PE would fault; the model no-ops).
 * @param {DataView|null|undefined} view
 * @returns {number[]} length 8
 */
export function renderShell81f8b0RowRead(view, rowAddr) {
  const out = new Array(RENDER_SHELL_81F8B0_ROW_DWORDS);
  const base = asU32(rowAddr);
  if (base === 0 || !view) {
    for (let i = 0; i < RENDER_SHELL_81F8B0_ROW_DWORDS; i += 1) out[i] = 0;
    return out;
  }
  for (let i = 0; i < RENDER_SHELL_81F8B0_ROW_DWORDS; i += 1) {
    out[i] = asI32(view.getInt32((base + i * 4) >>> 0, true));
  }
  return out;
}

/**
 * P-bis2 resume: full success path from the recaptured row window.
 * rowRead(rowAddr) then lroomPack. Null window -> zero floats, ok = false.
 * @param {DataView|null|undefined} view
 * @returns {{ ok: boolean, out: number[] }}
 */
export function renderShell81f8b0LroomFromRow(view, rowAddr, width, height) {
  const base = asU32(rowAddr);
  if (base === 0 || !view) {
    return { ok: false, out: new Array(8).fill(0) };
  }
  const row8 = renderShell81f8b0RowRead(view, base);
  return { ok: true, out: renderShell81f8b0LroomPack(row8, width, height) };
}

/* ---- Draw helpers pure complete (ABI v9) ---- */

/**
 * P39 a10690 unit-quad field init.
 * @param {DataView} view
 */
export function renderShellA10690Init(view, objPtr, x, y, z, w) {
  const o = asU32(objPtr);
  const fx = f32(x);
  const fy = f32(y);
  const fz = f32(z);
  const fw = f32(w);
  view.setFloat32(o + 0x00, fx, true);
  view.setFloat32(o + 0x04, fy, true);
  view.setFloat32(o + 0x08, fz, true);
  view.setFloat32(o + 0x0c, fy, true);
  view.setFloat32(o + 0x10, fx, true);
  view.setFloat32(o + 0x14, fw, true);
  view.setFloat32(o + 0x18, fz, true);
  view.setFloat32(o + 0x1c, fw, true);
}

/**
 * P40 a0f550 packed color → float RGBA / 255.
 * @param {DataView} view
 */
export function renderShellA0f550Init(view, objPtr, packedArg) {
  const o = asU32(objPtr);
  const arg = asU32(packedArg);
  const denom = f32FromBits(RENDER_SHELL_F32_255_BITS);
  const r = (arg >>> 16) & 0xff;
  const g = (arg >>> 8) & 0xff;
  const b = arg & 0xff;
  const a = (arg >>> 24) & 0xff;
  view.setFloat32(o + 0x00, f32(f32(r) / denom), true);
  view.setFloat32(o + 0x04, f32(f32(g) / denom), true);
  view.setFloat32(o + 0x08, f32(f32(b) / denom), true);
  view.setFloat32(o + 0x0c, f32(f32(a) / denom), true);
  view.setUint32(o + 0x10, 0, true);
}

/**
 * P41 a10c00 pair-object fill from sparse DAT + src 5 dwords.
 * @param {DataView} view
 */
export function renderShellA10c00Init(view, objPtr, srcPtr) {
  const o = asU32(objPtr);
  const s = asU32(srcPtr);
  const d0 = f32FromBits(RENDER_SHELL_F32_A10C00_DAT0_BITS);
  const d1 = f32FromBits(RENDER_SHELL_F32_A10C00_DAT1_BITS);
  view.setFloat32(o + 0x00, d0, true);
  view.setFloat32(o + 0x04, d1, true);
  view.setFloat32(o + 0x08, d0, true);
  view.setFloat32(o + 0x0c, d1, true);
  view.setFloat32(o + 0x10, d0, true);
  view.setFloat32(o + 0x14, d1, true);
  view.setFloat32(o + 0x18, d0, true);
  view.setFloat32(o + 0x1c, d1, true);
  for (let copy = 0; copy < RENDER_SHELL_A10C00_COPY_COUNT; copy += 1) {
    const dst = o + 0x20 + copy * RENDER_SHELL_A10C00_SRC_DWORDS * 4;
    for (let i = 0; i < RENDER_SHELL_A10C00_SRC_DWORDS; i += 1) {
      const word = view.getUint32(s + i * 4, true) >>> 0;
      view.setUint32(dst + i * 4, word, true);
    }
  }
}

/* ---- Post-a14050 L-room init + type-9 pure — ABI v6 ---- */

/**
 * P20 VA 0x00817b8a: clear flag at +0x20; return obj + 0x24.
 * @returns {{ next: number, flag: number }}
 */
export function renderShell817830LroomQuadPost(objPtr, flagAt20) {
  return {
    next: (asU32(objPtr) + (RENDER_SHELL_817830_LROOM_QUAD_STRIDE >>> 0)) >>> 0,
    flag: 0,
  };
}

/** P20b VA 0x00817bbd: obj + 0x70. */
export function renderShell817830LroomPairAdvance(objPtr) {
  return (asU32(objPtr) + (RENDER_SHELL_817830_LROOM_PAIR_STRIDE >>> 0)) >>> 0;
}

/**
 * G26 VA 0x00817b6c / 0x00817bc0: pre-dec; continue while post-dec != 0.
 * @returns {{ countAfter: number, more: boolean }}
 */
export function renderShell817830LroomLoopStep(countBefore) {
  const countAfter = (asU32(countBefore) - 1) >>> 0;
  return { countAfter, more: countAfter !== 0 };
}

/** P21 VA 0x00817bf2: scale * 0.5f. */
export function renderShell817830Type9Half(scale) {
  return f32(f32(scale) * f32FromBits(RENDER_SHELL_F32_HALF_BITS));
}

/**
 * P22 VA 0x00817be9…0x00817c37: first type-9 cell float pack.
 */
export function renderShell817830Type9Cell0(scaleA8, mul005, mul05, offsetC) {
  const halfA = renderShell817830Type9Half(scaleA8);
  const outX = f32(f32(mul005) + f32(offsetC));
  const outY = f32(halfA + f32(mul05));
  return { halfA, outX, outY };
}

/**
 * P23 VA 0x00817c89…0x00817cc0: second type-9 cell float pack.
 */
export function renderShell817830Type9Cell1(scale70, halfA, mul05) {
  const halfB = renderShell817830Type9Half(scale70);
  const outSum = f32(halfB + f32(halfA));
  const outY2 = f32(outSum + f32(mul05));
  return { halfB, outSum, outY2 };
}

/* ---- Stage-overlay residual pure — ABI v12 (VA 0x0080ef1c…0x0080f12c) ---- */

/** G31 VA 0x0080ef2d: host 74ea50 AL != 0 → continue overlay body. */
export function renderShellStageOverlayHostOpen(host74ea50Al) {
  return asU8(host74ea50Al) !== 0;
}

/** G7 triple: dual open && host AL. */
export function renderShellStageOverlayTripleOpen(
  gameField8,
  nestedRoomType10,
  host74ea50Al,
) {
  return (
    renderShellStageOverlayDualOpen(gameField8, nestedRoomType10) &&
    renderShellStageOverlayHostOpen(host74ea50Al)
  );
}

/** P53 VA 0x0080ef53: 1.0f * 2.0f. */
export function renderShellStageOverlayScale() {
  return f32(
    f32FromBits(RENDER_SHELL_F32_ONE_BITS) *
      f32FromBits(RENDER_SHELL_F32_TWO_BITS),
  );
}

/**
 * P54 VA 0x0080ef41…0x0080ef90 pre-floor X.
 * ((scroll - 338)*0.5 + (pos - 60)*0.65) * scale + 0.5
 */
export function renderShellStageOverlayPreFloorX(scrollX, posX, scale) {
  const half = f32FromBits(RENDER_SHELL_F32_HALF_BITS);
  const factor = f32FromBits(RENDER_SHELL_F32_0_65_BITS);
  const offScroll = f32FromBits(RENDER_SHELL_F32_338_BITS);
  const offPos = f32FromBits(RENDER_SHELL_F32_60_BITS);
  const a = f32(f32(f32(scrollX) - offScroll) * half);
  const b = f32(f32(f32(posX) - offPos) * factor);
  return f32(f32(f32(a + b) * f32(scale)) + half);
}

/**
 * P55 VA 0x0080efc2…0x0080efff pre-floor Y.
 * ((pos - 140)*0.65 + (scroll - 182)*0.5) * scale + 0.5
 */
export function renderShellStageOverlayPreFloorY(scrollY, posY, scale) {
  const half = f32FromBits(RENDER_SHELL_F32_HALF_BITS);
  const factor = f32FromBits(RENDER_SHELL_F32_0_65_BITS);
  const offPos = f32FromBits(RENDER_SHELL_F32_140_BITS);
  const offScroll = f32FromBits(RENDER_SHELL_F32_182_BITS);
  const a = f32(f32(f32(posY) - offPos) * factor);
  const b = f32(f32(f32(scrollY) - offScroll) * half);
  return f32(f32(f32(a + b) * f32(scale)) + half);
}

/** P56 post-floor / scale. */
export function renderShellStageOverlayDivScale(floorVal, scale) {
  return f32(f32(floorVal) / f32(scale));
}

/** P57 camera + div. */
export function renderShellStageOverlayPosAdd(camera, div) {
  return f32(f32(camera) + f32(div));
}

/**
 * P58 Game+0x6edc / +0x6ee0 from globals.
 * @returns {{ scaleX: number, scaleY: number }}
 */
export function renderShellStageOverlayStoreScales(srcC3793c, srcC37940) {
  return { scaleX: f32(srcC3793c), scaleY: f32(srcC37940) };
}

/**
 * P59 color init at Game+0x6ee8 (white RGBA + zeros).
 * @param {DataView} view
 * @returns {boolean} true when writes applied
 */
export function renderShellStageOverlayColorInit(view, dstPtr, selfSkipPtr) {
  const dst = asU32(dstPtr);
  if (dst === asU32(selfSkipPtr)) return false;
  const one = f32FromBits(RENDER_SHELL_F32_ONE_BITS);
  view.setFloat32(dst + 0x00, one, true);
  view.setFloat32(dst + 0x04, one, true);
  view.setFloat32(dst + 0x08, one, true);
  view.setFloat32(dst + 0x0c, one, true);
  view.setFloat32(dst + 0x10, 0, true);
  view.setFloat32(dst + 0x14, 0, true);
  view.setFloat32(dst + 0x18, 0, true);
  view.setFloat32(dst + 0x1c, 0, true);
  view.setUint32(dst + 0x20, 0, true);
  view.setUint32(dst + 0x24, 0, true);
  view.setUint32(dst + 0x28, 0, true);
  return true;
}

/** G32 VA 0x0080f0ac: Game+0x6f49 != 0 → draws. */
export function renderShellStageOverlayDrawNeeded(flag6f49) {
  return asU8(flag6f49) !== 0;
}

/** G33 VA 0x0080f0d7: Game+0x6eb0 != 0 → B then A. */
export function renderShellStageOverlayDrawSwap(flag6eb0) {
  return asU8(flag6eb0) !== 0;
}

/** P60 clamp DAT_00c7b640. */
export function renderShellStageOverlayClampVa() {
  return RENDER_SHELL_OVERLAY_CLAMP_VA >>> 0;
}

/**
 * P61 anim this offsets for dual Render residual.
 * @returns {{ firstOff: number, secondOff: number }}
 */
export function renderShellStageOverlayAnimOffsets(plan) {
  const p = asI32(plan);
  if (p === RENDER_SHELL_OVERLAY_PLAN_ORDER_A) {
    return {
      firstOff: RENDER_SHELL_OVERLAY_ANIM_A_OFF >>> 0,
      secondOff: RENDER_SHELL_OVERLAY_ANIM_B_OFF >>> 0,
    };
  }
  if (p === RENDER_SHELL_OVERLAY_PLAN_ORDER_B) {
    return {
      firstOff: RENDER_SHELL_OVERLAY_ANIM_B_OFF >>> 0,
      secondOff: RENDER_SHELL_OVERLAY_ANIM_A_OFF >>> 0,
    };
  }
  return { firstOff: 0, secondOff: 0 };
}

/** G34 draw plan: SKIP / ORDER_A / ORDER_B. */
export function renderShellStageOverlayDrawPlan(flag6f49, flag6eb0) {
  if (!renderShellStageOverlayDrawNeeded(flag6f49)) {
    return RENDER_SHELL_OVERLAY_PLAN_SKIP;
  }
  if (renderShellStageOverlayDrawSwap(flag6eb0)) {
    return RENDER_SHELL_OVERLAY_PLAN_ORDER_B;
  }
  return RENDER_SHELL_OVERLAY_PLAN_ORDER_A;
}

/**
 * P62 post-floor draw position both axes.
 * @returns {{ x: number, y: number }}
 */
export function renderShellStageOverlayDrawPos(
  cameraX,
  cameraY,
  floorX,
  floorY,
  scale,
) {
  const divX = renderShellStageOverlayDivScale(floorX, scale);
  const divY = renderShellStageOverlayDivScale(floorY, scale);
  return {
    x: renderShellStageOverlayPosAdd(cameraX, divX),
    y: renderShellStageOverlayPosAdd(cameraY, divY),
  };
}

/* ---- Game::GetStageID pure CF — ABI v13 (VA 0x00738470) ---- */

/** G35 VA 0x00738478: mode_26584 == 0x2c. */
export function renderShellGetStageIdMode44(mode26584) {
  return asI32(mode26584) === RENDER_SHELL_GET_STAGE_ID_MODE_44;
}

/** G36 VA 0x0073849e: dim_1830c == 2 (only after mode != 0x2c). */
export function renderShellGetStageIdDim2(dim1830c) {
  return asI32(dim1830c) === RENDER_SHELL_GET_STAGE_ID_DIM_2;
}

/** G37 residual plan: PURE_DIM2 / MODE44 / RC. */
export function renderShellGetStageIdPlan(mode26584, dim1830c) {
  if (renderShellGetStageIdMode44(mode26584)) {
    return RENDER_SHELL_GET_STAGE_ID_PLAN_MODE44;
  }
  if (renderShellGetStageIdDim2(dim1830c)) {
    return RENDER_SHELL_GET_STAGE_ID_PLAN_PURE_DIM2;
  }
  return RENDER_SHELL_GET_STAGE_ID_PLAN_RC;
}

/** P63 dim2 result imm 0x23. */
export function renderShellGetStageIdDim2Result() {
  return RENDER_SHELL_GET_STAGE_ID_DIM2_RESULT >>> 0;
}

/**
 * G38 RoomConfig::GetStageID greed path (VA 0x0082d036…0x0082d065).
 * Mode==-1 auto uses manager+difficulty; Mode==1 forces greed.
 */
export function renderShell82d030GreedPath(
  modeArg,
  managerNonnull,
  difficulty269c8,
) {
  const mode = asI32(modeArg);
  if (mode === RENDER_SHELL_82D030_MODE_AUTO) {
    if (asI32(managerNonnull) === 0) {
      return false;
    }
    const d = asI32(difficulty269c8);
    return (
      d === RENDER_SHELL_82D030_DIFF_GREED_A ||
      d === RENDER_SHELL_82D030_DIFF_GREED_B
    );
  }
  return mode === RENDER_SHELL_82D030_MODE_GREED_FORCE;
}

/**
 * P64 complete RoomConfig::GetStageID pure body (VA 0x0082d030…0x0082d0fd).
 * Independent of C++; PE ecx=LevelStage, edx=StageType, stack=Mode.
 */
export function renderShell82d030GetStageId(
  levelStage,
  stageType,
  modeArg,
  managerNonnull,
  difficulty269c8,
) {
  const stage = asU32(levelStage);
  const typ = asU32(stageType);
  const stageS = asI32(stage);
  const typS = asI32(typ);
  const greed = renderShell82d030GreedPath(
    modeArg,
    managerNonnull,
    difficulty269c8,
  );

  if (greed) {
    if (stageS === 7 || stageS === 6) {
      return (stageS + 0x12) >>> 0;
    }
    if (stageS === 5) {
      return (stageS + 9) >>> 0;
    }
    if (typS === 4) {
      return (Math.imul(stage, 2) + 0x19) >>> 0;
    }
    if (typS === 5) {
      return (Math.imul(stage, 2) + 0x1a) >>> 0;
    }
    return (typ + Math.imul(stage - 1, 2) + stage) >>> 0;
  }

  if (stageS === 0x0d) {
    return 0x23;
  }
  if (stageS >= 9) {
    if (stageS === 9) {
      return typS === 4 ? 0x24 : 0x0d;
    }
    if (stageS === 0x0c) {
      return 0x1a;
    }
    return (typ + Math.imul(stage - 3, 2)) >>> 0;
  }

  let ecx = (stage - 1) >>> 0;
  if (typS === 4) {
    ecx = (ecx & 0xfffffffe) >>> 0;
    return (ecx + 0x1b) >>> 0;
  }
  ecx = ecx >>> 1;
  if (typS === 5) {
    return (Math.imul(ecx, 2) + 0x1c) >>> 0;
  }
  return (typ + 1 + Math.imul(ecx, 2) + ecx) >>> 0;
}

/**
 * P65 Game::GetStageID hybrid resolve after optional host 74f690 type.
 * MODE44 uses hostType74f690; RC uses stageType; PURE_DIM2 → 0x23.
 */
export function renderShellGetStageIdResolve(
  mode26584,
  dim1830c,
  levelStage,
  stageType,
  hostType74f690,
  managerNonnull,
  difficulty269c8,
) {
  const plan = renderShellGetStageIdPlan(mode26584, dim1830c);
  if (plan === RENDER_SHELL_GET_STAGE_ID_PLAN_PURE_DIM2) {
    return renderShellGetStageIdDim2Result();
  }
  const typ =
    plan === RENDER_SHELL_GET_STAGE_ID_PLAN_MODE44
      ? asU32(hostType74f690)
      : asU32(stageType);
  return renderShell82d030GetStageId(
    levelStage,
    typ,
    RENDER_SHELL_82D030_MODE_AUTO,
    managerNonnull,
    difficulty269c8,
  );
}

/* ---- opaque_call_0074ea50 pure islands — ABI v13 ---- */

/** G39 difficulty ∈ {2,3} → pure AL=0. */
export function renderShell74ea50DiffEarlyFalse(difficulty269c8) {
  const d = asI32(difficulty269c8);
  return (
    d === RENDER_SHELL_82D030_DIFF_GREED_A ||
    d === RENDER_SHELL_82D030_DIFF_GREED_B
  );
}

/** G40 (this0-1) u<=5 && flags bit16 → pure AL=0. */
export function renderShell74ea50FlagEarlyFalse(this0, flags2654c) {
  const dec = (asU32(this0) - 1) >>> 0;
  if (dec > 5) {
    return false;
  }
  return (asU32(flags2654c) & RENDER_SHELL_74EA50_FLAG_BIT) !== 0;
}

/** G41 any early false. */
export function renderShell74ea50EarlyFalse(
  difficulty269c8,
  this0,
  flags2654c,
) {
  return (
    renderShell74ea50DiffEarlyFalse(difficulty269c8) ||
    renderShell74ea50FlagEarlyFalse(this0, flags2654c)
  );
}

/** P66 Manager+0x26550 | this+0xc. */
export function renderShell74ea50MgrWordsOr(manager26550, thisWord0c) {
  return (asU32(manager26550) | asU32(thisWord0c)) >>> 0;
}

/**
 * P67 post-poll mode adjust: bit2 of ((~poll_b)&(poll_a|mgr_or))
 * → this0+1 else this0.
 */
export function renderShell74ea50ModeAdjust(
  this0,
  mgrOr,
  poll6f9400,
  poll6f95a0,
) {
  const combined =
    (~asU32(poll6f95a0) & (asU32(poll6f9400) | asU32(mgrOr))) >>> 0;
  if ((combined & 2) !== 0) {
    return (asU32(this0) + 1) >>> 0;
  }
  return asU32(this0);
}

/** G42 mode_adj==6 && this4∈{4,5} → host 4217a0. */
export function renderShell74ea50ProbeNeeded(modeAdj, this4) {
  if (asU32(modeAdj) !== RENDER_SHELL_74EA50_MODE_TARGET) {
    return false;
  }
  const t = asU32(this4);
  return t === RENDER_SHELL_74EA50_TYPE_4 || t === RENDER_SHELL_74EA50_TYPE_5;
}

/** G43 entry plan FALSE / POLL. */
export function renderShell74ea50EntryPlan(
  difficulty269c8,
  this0,
  flags2654c,
) {
  if (renderShell74ea50EarlyFalse(difficulty269c8, this0, flags2654c)) {
    return RENDER_SHELL_74EA50_PLAN_FALSE;
  }
  return RENDER_SHELL_74EA50_PLAN_POLL;
}

/** G44 post-poll plan FALSE / PROBE. */
export function renderShell74ea50PostPollPlan(
  this0,
  this4,
  mgrOr,
  poll6f9400,
  poll6f95a0,
) {
  const modeAdj = renderShell74ea50ModeAdjust(
    this0,
    mgrOr,
    poll6f9400,
    poll6f95a0,
  );
  if (renderShell74ea50ProbeNeeded(modeAdj, this4)) {
    return RENDER_SHELL_74EA50_PLAN_PROBE;
  }
  return RENDER_SHELL_74EA50_PLAN_FALSE;
}

/** P68 probe stack arg 0x2f. */
export function renderShell74ea50ProbeArg() {
  return RENDER_SHELL_74EA50_PROBE_ARG >>> 0;
}

/* ---- opaque_call_0074f690 pure CF — ABI v14 (VA 0x0074f690) ---- */

function iabs32(x) {
  const v = asI32(x);
  const mask = v >> 31;
  return ((v ^ mask) - mask) | 0;
}

/**
 * G45 entry residual plan (VA 0x0074f69c…0x0074f6ca).
 * TYPE4 / CONST4 / GETROOM / STAGE.
 */
export function renderShell74f690EntryPlan(
  mode26584,
  roomIdx,
  stage0,
  flag183a0,
) {
  if (asI32(mode26584) !== RENDER_SHELL_GET_STAGE_ID_MODE_44) {
    return RENDER_SHELL_74F690_PLAN_TYPE4;
  }
  const idx = asI32(roomIdx);
  if (idx === RENDER_SHELL_74F690_ROOM_IDX_SPECIAL) {
    if (asI32(stage0) === RENDER_SHELL_74F690_STAGE_WOMB_A) {
      return RENDER_SHELL_74F690_PLAN_CONST4;
    }
    return RENDER_SHELL_74F690_PLAN_TYPE4;
  }
  if (idx < 0) {
    return RENDER_SHELL_74F690_PLAN_TYPE4;
  }
  if ((asU8(flag183a0) & 0xff) === 0) {
    return RENDER_SHELL_74F690_PLAN_GETROOM;
  }
  return RENDER_SHELL_74F690_PLAN_STAGE;
}

/** P69 special room_idx -10. */
export function renderShell74f690RoomIdxSpecial() {
  return RENDER_SHELL_74F690_ROOM_IDX_SPECIAL | 0;
}

/** P70 GetRoomByIdx dimension -1. */
export function renderShell74f690GetroomDim() {
  return RENDER_SHELL_74F690_GETROOM_DIM | 0;
}

/** P71 nested host VA 0x00740bc0. */
export function renderShell74f690GetroomVa() {
  return RENDER_SHELL_HOST_740BC0_VA >>> 0;
}

/**
 * P72 clamp room idx from RoomDescriptor after host GetRoomByIdx
 * (VA 0x0074f6d4…0x0074f6ed).
 */
export function renderShell74f690ClampRoomIdx(
  roomIdxIn,
  roomDescDword0,
  roomDescField10Nz,
) {
  if (asI32(roomDescField10Nz) === 0) {
    return asI32(roomIdxIn);
  }
  let v = asI32(roomDescDword0);
  if (v <= 0) {
    v = 0;
  }
  if (v < RENDER_SHELL_74F690_ROOM_IDX_CLAMP_MAX) {
    return v;
  }
  return RENDER_SHELL_74F690_ROOM_IDX_CLAMP_MAX;
}

/** P73 apply optional GetRoom clamp when flag_183a0==0. */
export function renderShell74f690FinalRoomIdx(
  roomIdxIn,
  flag183a0,
  roomDescDword0,
  roomDescField10Nz,
) {
  if ((asU8(flag183a0) & 0xff) !== 0) {
    return asI32(roomIdxIn);
  }
  return renderShell74f690ClampRoomIdx(
    roomIdxIn,
    roomDescDword0,
    roomDescField10Nz,
  );
}

/**
 * G46 stage residual plan (VA 0x0074f6f0…0x0074f756).
 * TABLE_LO / WOMB / TYPE4.
 */
export function renderShell74f690StagePlan(stage0) {
  const s = asI32(stage0);
  if (s > 6) {
    if (
      s === RENDER_SHELL_74F690_STAGE_WOMB_A ||
      s === RENDER_SHELL_74F690_STAGE_WOMB_B
    ) {
      return RENDER_SHELL_74F690_STAGE_WOMB;
    }
    return RENDER_SHELL_74F690_STAGE_TYPE4;
  }
  return RENDER_SHELL_74F690_STAGE_TABLE_LO;
}

/** P74 MSVC signed /13 magic. */
export function renderShell74f690Sdiv13(value) {
  const x = asI32(value);
  const magic = RENDER_SHELL_74F690_SDIV13_MAGIC | 0;
  const prod = BigInt(x) * BigInt(magic);
  let edx = Number(BigInt.asIntN(32, prod >> 32n));
  edx = edx >> 2;
  const sign = edx >>> 31;
  return (edx + sign) | 0;
}

/** P75 stage 7/8 grid distance. */
export function renderShell74f690WombDistance(roomIdx, field14) {
  const room = asI32(roomIdx);
  const field = asI32(field14);
  const fieldDiv = renderShell74f690Sdiv13(field);
  const roomDiv = renderShell74f690Sdiv13(room);
  let eax = (roomDiv - fieldDiv) | 0;
  const edi = (fieldDiv - roomDiv) | 0;
  eax = Math.imul(eax, RENDER_SHELL_74F690_GRID);
  eax = (eax - room) | 0;
  eax = (eax + field) | 0;
  return (iabs32(eax) + iabs32(edi)) | 0;
}

/** G47 womb near: distance <= 3. */
export function renderShell74f690WombNear(distance) {
  return asI32(distance) <= RENDER_SHELL_74F690_DIST_NEAR;
}

/** P76 float axis *5 max0 min~4.999 cvtt (VA 0x0074f6f7…0x0074f717). */
export function renderShell74f690ScaleAxis(value) {
  const mul = f32FromBits(RENDER_SHELL_F32_5_BITS);
  const maxv = f32FromBits(RENDER_SHELL_F32_4_999_BITS);
  let x = f32(f32(value) * mul);
  x = sseMaxss(x, 0);
  x = sseMinss(x, maxv);
  /* cvttss2si toward zero */
  return Math.trunc(x) | 0;
}

/** P77 table index row*5+col. */
export function renderShell74f690TableIndex(row, col) {
  return (
    (Math.imul(asI32(row), RENDER_SHELL_74F690_TABLE_DIM) + asI32(col)) | 0
  );
}

/** P78 PE table LO. */
export function renderShell74f690TableLo(index) {
  const i = asI32(index);
  if (i < 0 || i >= RENDER_SHELL_74F690_TABLE_SIZE) {
    return 0;
  }
  return RENDER_SHELL_74F690_TABLE_LO[i] >>> 0;
}

/** P79 PE table HI. */
export function renderShell74f690TableHi(index) {
  const i = asI32(index);
  if (i < 0 || i >= RENDER_SHELL_74F690_TABLE_SIZE) {
    return 0;
  }
  return RENDER_SHELL_74F690_TABLE_HI[i] >>> 0;
}

/** P80 float-table stage type from sparse floats. */
export function renderShell74f690FloatTableType(f183b0, f18654, useHiTable) {
  const row = renderShell74f690ScaleAxis(f183b0);
  const col = renderShell74f690ScaleAxis(f18654);
  const idx = renderShell74f690TableIndex(row, col);
  if (asI32(useHiTable) !== 0) {
    return renderShell74f690TableHi(idx);
  }
  return renderShell74f690TableLo(idx);
}

/** P81 slot field Game-relative offset. */
export function renderShell74f690SlotFieldOff(roomSlot18314) {
  return (
    (RENDER_SHELL_74F690_SLOT_FIELD_OFF +
      Math.imul(asI32(roomSlot18314), RENDER_SHELL_74F690_SLOT_STRIDE)) >>>
    0
  );
}

/**
 * P82 hybrid pure resolve of 74f690.
 * When entry is GETROOM, caller supplies post-host RoomDescriptor sparse.
 */
export function renderShell74f690Resolve(
  mode26584,
  roomIdx,
  stage0,
  stageType4,
  flag183a0,
  roomDescDword0,
  roomDescField10Nz,
  f183b0,
  f18654,
  field14,
) {
  const entry = renderShell74f690EntryPlan(
    mode26584,
    roomIdx,
    stage0,
    flag183a0,
  );
  if (entry === RENDER_SHELL_74F690_PLAN_TYPE4) {
    return asU32(stageType4);
  }
  if (entry === RENDER_SHELL_74F690_PLAN_CONST4) {
    return RENDER_SHELL_74F690_CONST_TYPE4 >>> 0;
  }

  const room = renderShell74f690FinalRoomIdx(
    roomIdx,
    flag183a0,
    roomDescDword0,
    roomDescField10Nz,
  );
  const stagePlan = renderShell74f690StagePlan(stage0);
  if (stagePlan === RENDER_SHELL_74F690_STAGE_TYPE4) {
    return asU32(stageType4);
  }
  if (stagePlan === RENDER_SHELL_74F690_STAGE_WOMB) {
    const dist = renderShell74f690WombDistance(room, field14);
    if (renderShell74f690WombNear(dist)) {
      return RENDER_SHELL_74F690_CONST_TYPE4 >>> 0;
    }
    return renderShell74f690FloatTableType(f183b0, f18654, 1);
  }
  return renderShell74f690FloatTableType(f183b0, f18654, 0);
}

/* ---- Game::GetRoomByIdx pure CF — ABI v15 (VA 0x00740bc0) ---- */

/** P83 effective dimension: dim_signed < 0 → game_dim else dim. */
export function renderShell740bc0DimEffective(dim, gameDim) {
  if (asI32(dim) < 0) {
    return asI32(gameDim);
  }
  return asI32(dim);
}

/** G48 dimension unsigned < 3. */
export function renderShell740bc0DimInRange(dimEff) {
  return (asI32(dimEff) >>> 0) < (RENDER_SHELL_740BC0_DIM_COUNT >>> 0);
}

/** G49 idx in [-20, 168]: (idx+0x14)_u <= 0xbc. */
export function renderShell740bc0IdxInRange(idx) {
  const adj = (asI32(idx) + RENDER_SHELL_740BC0_IDX_RANGE_ADD) >>> 0;
  return adj <= (RENDER_SHELL_740BC0_IDX_RANGE_LIM >>> 0);
}

/**
 * G50 entry residual plan.
 * EMPTY / NEGATIVE / GRID / RECURSE_CURRENT / RECURSE_SPECIAL / WALK.
 */
export function renderShell740bc0EntryPlan(dimEff, idx, currentIdx) {
  if (!renderShell740bc0DimInRange(dimEff)) {
    return RENDER_SHELL_740BC0_PLAN_EMPTY;
  }
  const i = asI32(idx);
  const cur = asI32(currentIdx);
  if (i === RENDER_SHELL_740BC0_IDX_CURRENT) {
    if (cur < 0) {
      return RENDER_SHELL_740BC0_PLAN_EMPTY;
    }
    return RENDER_SHELL_740BC0_PLAN_RECURSE_CURRENT;
  }
  if (i === RENDER_SHELL_740BC0_IDX_SPECIAL) {
    if (cur < 0) {
      return RENDER_SHELL_740BC0_PLAN_EMPTY;
    }
    if (asI32(dimEff) === 0) {
      return RENDER_SHELL_740BC0_PLAN_RECURSE_SPECIAL;
    }
    return RENDER_SHELL_740BC0_PLAN_WALK;
  }
  if (!renderShell740bc0IdxInRange(i)) {
    return RENDER_SHELL_740BC0_PLAN_EMPTY;
  }
  if (i < 0) {
    return RENDER_SHELL_740BC0_PLAN_NEGATIVE;
  }
  return RENDER_SHELL_740BC0_PLAN_GRID;
}

/** P84 current-room recurse dim: dim==0 → 1 else 0. */
export function renderShell740bc0CurrentRecurseDim(dimEff) {
  return asI32(dimEff) === 0 ? 1 : 0;
}

/** P85 special recurse idx 0xa2. */
export function renderShell740bc0SpecialRecurseIdx() {
  return RENDER_SHELL_740BC0_SPECIAL_RECURSE_IDX | 0;
}

/** P85 special recurse dim 1. */
export function renderShell740bc0SpecialRecurseDim() {
  return RENDER_SHELL_740BC0_SPECIAL_RECURSE_DIM | 0;
}

/** P86 negative-idx Game-relative desc off: 0x16bc4 - idx*0xb8. */
export function renderShell740bc0NegDescOff(idx) {
  return (
    (RENDER_SHELL_740BC0_NEG_BASE_OFF -
      Math.imul(asI32(idx), RENDER_SHELL_740BC0_SLOT_STRIDE)) >>>
    0
  );
}

/** P87 grid map element Game-relative off. */
export function renderShell740bc0MapElemOff(dimEff, idx) {
  const linear =
    Math.imul(asI32(dimEff), RENDER_SHELL_740BC0_GRID_STRIDE) + asI32(idx);
  return ((linear * 4 + RENDER_SHELL_740BC0_MAP_BASE_OFF) >>> 0);
}

/** G51 slot unsigned <= 0x20e. */
export function renderShell740bc0SlotValid(slot) {
  return (slot >>> 0) <= (RENDER_SHELL_740BC0_SLOT_MAX >>> 0);
}

/** P88 slot → RoomDescriptor Game-relative off. */
export function renderShell740bc0SlotDescOff(slot) {
  return (
    (Math.imul(slot >>> 0, RENDER_SHELL_740BC0_SLOT_STRIDE) +
      RENDER_SHELL_740BC0_DESC_BASE_OFF) >>>
    0
  );
}

/** P89 empty RoomDescriptor VA. */
export function renderShell740bc0EmptyVa() {
  return RENDER_SHELL_740BC0_EMPTY_VA >>> 0;
}

/** P90 once-init guard VA. */
export function renderShell740bc0OnceGuardVa() {
  return RENDER_SHELL_740BC0_ONCE_GUARD_VA >>> 0;
}

/** G52 once-init needed: signed guard > tls_c. */
export function renderShell740bc0OnceInitNeeded(guardVal, tlsC) {
  return asI32(guardVal) > asI32(tlsC);
}

/** G53 walk match: kind==0 && type==1 && var==10. */
export function renderShell740bc0WalkMatch(kindM4, typeAt8, fieldAt10) {
  return (
    asI32(kindM4) === 0 &&
    asI32(typeAt8) === RENDER_SHELL_740BC0_WALK_MATCH_TYPE &&
    asI32(fieldAt10) === RENDER_SHELL_740BC0_WALK_MATCH_VAR
  );
}

/** P91 walk start off. */
export function renderShell740bc0WalkStartOff() {
  return RENDER_SHELL_740BC0_WALK_START_OFF >>> 0;
}

/** P91 walk stride. */
export function renderShell740bc0WalkStride() {
  return RENDER_SHELL_740BC0_WALK_STRIDE >>> 0;
}

/** P91 walk result delta -0x10. */
export function renderShell740bc0WalkResultDelta() {
  return RENDER_SHELL_740BC0_WALK_RESULT_DELTA | 0;
}

/** P92 host GetRoomByIdx VA. */
export function renderShell740bc0HostVa() {
  return RENDER_SHELL_HOST_740BC0_VA >>> 0;
}

/**
 * G54 hybrid resolve kind EMPTY / GAME_OFF / HOST.
 * slot used only for GRID plan.
 */
export function renderShell740bc0ResolveKind(dimEff, idx, currentIdx, slot) {
  const plan = renderShell740bc0EntryPlan(dimEff, idx, currentIdx);
  if (plan === RENDER_SHELL_740BC0_PLAN_EMPTY) {
    return RENDER_SHELL_740BC0_KIND_EMPTY;
  }
  if (plan === RENDER_SHELL_740BC0_PLAN_NEGATIVE) {
    return RENDER_SHELL_740BC0_KIND_GAME_OFF;
  }
  if (plan === RENDER_SHELL_740BC0_PLAN_GRID) {
    if (!renderShell740bc0SlotValid(slot)) {
      return RENDER_SHELL_740BC0_KIND_EMPTY;
    }
    return RENDER_SHELL_740BC0_KIND_GAME_OFF;
  }
  return RENDER_SHELL_740BC0_KIND_HOST;
}

/**
 * P93 hybrid resolve Game-relative offset when kind==GAME_OFF; else 0.
 */
export function renderShell740bc0ResolveGameOff(dimEff, idx, currentIdx, slot) {
  const plan = renderShell740bc0EntryPlan(dimEff, idx, currentIdx);
  if (plan === RENDER_SHELL_740BC0_PLAN_NEGATIVE) {
    return renderShell740bc0NegDescOff(idx);
  }
  if (plan === RENDER_SHELL_740BC0_PLAN_GRID && renderShell740bc0SlotValid(slot)) {
    return renderShell740bc0SlotDescOff(slot);
  }
  return 0;
}

/* ---- opaque_call_00812d00 complete pure body — ABI v16 (VA 0x00812d00) ---- */

/** G55 type chain open: field4_nz && nested10_nz. */
export function renderShell812d00TypeChainOpen(field4Nz, nested10Nz) {
  return asI32(field4Nz) !== 0 && asI32(nested10Nz) !== 0;
}

/** G56 L-room type range: (type-9)_u <= 3. */
export function renderShell812d00LroomTypeOpen(roomType48) {
  const adj =
    (asI32(roomType48) - RENDER_SHELL_812D00_LROOM_TYPE_BASE) >>> 0;
  return adj <= (RENDER_SHELL_812D00_LROOM_TYPE_SPAN >>> 0);
}

/** G57 plan AABB (0) vs LROOM (1). */
export function renderShell812d00Plan(field4Nz, nested10Nz, roomType48) {
  if (!renderShell812d00TypeChainOpen(field4Nz, nested10Nz)) {
    return RENDER_SHELL_812D00_PLAN_AABB;
  }
  if (!renderShell812d00LroomTypeOpen(roomType48)) {
    return RENDER_SHELL_812D00_PLAN_AABB;
  }
  return RENDER_SHELL_812D00_PLAN_LROOM;
}

/** P94 jump-table dividend for type ∈ [9,12]. */
export function renderShell812d00LroomDividend(roomType48) {
  switch (asI32(roomType48)) {
    case 9:
      return RENDER_SHELL_812D00_DIV_TYPE9 | 0;
    case 10:
      return RENDER_SHELL_812D00_DIV_TYPE10 | 0;
    case 11:
      return RENDER_SHELL_812D00_DIV_TYPE11 | 0;
    case 12:
      return RENDER_SHELL_812D00_DIV_TYPE12 | 0;
    default:
      return 0;
  }
}

/** Signed idiv toward zero (x86 cdq/idiv). width must be non-zero. */
function idivI32(numer, denom) {
  const n = asI32(numer);
  const d = asI32(denom);
  const quot = (n / d) | 0; /* JS |0 truncates toward zero */
  const rem = (n - Math.imul(quot, d)) | 0;
  return { quot, rem };
}

/** P95 L-room grid Vector from dividend / width. */
export function renderShell812d00LroomXy(dividend, roomWidthC) {
  const { quot, rem } = idivI32(dividend, roomWidthC);
  const scale = f32FromBits(RENDER_SHELL_F32_FORTY_BITS);
  const yBase = f32FromBits(RENDER_SHELL_F32_HUNDRED_TWENTY_BITS);
  return {
    x: f32(f32(rem) * scale + scale),
    y: f32(f32(quot) * scale + yBase),
  };
}

/** P96 AABB center Vector. */
export function renderShell812d00AabbCenter(room14, room18, room1c, room20) {
  const half = f32FromBits(RENDER_SHELL_F32_HALF_BITS);
  return {
    x: f32(f32(f32(room1c) - f32(room14)) * half + f32(room14)),
    y: f32(f32(f32(room20) - f32(room18)) * half + f32(room18)),
  };
}

/**
 * P97 complete pure body of opaque_call_00812d00.
 * @returns {{ x: number, y: number, plan: number }}
 */
export function renderShell812d00Compute(
  field4Nz,
  nested10Nz,
  roomType48,
  roomWidthC,
  room14,
  room18,
  room1c,
  room20,
) {
  const plan = renderShell812d00Plan(field4Nz, nested10Nz, roomType48);
  if (plan === RENDER_SHELL_812D00_PLAN_LROOM) {
    const div = renderShell812d00LroomDividend(roomType48);
    const xy = renderShell812d00LroomXy(div, roomWidthC);
    return { x: xy.x, y: xy.y, plan };
  }
  const xy = renderShell812d00AabbCenter(room14, room18, room1c, room20);
  return { x: xy.x, y: xy.y, plan };
}

/** P98 host VA (pure-complete). */
export function renderShell812d00HostVa() {
  return RENDER_SHELL_HOST_812D00_VA >>> 0;
}

/* ---- opaque_call_004217a0 complete pure body — ABI v16 (VA 0x004217a0) ---- */

/* v109 dedupe: 0x4217a0 clamp law is OWNED by the frame-opaque family
   (isaac_frame_opaque_4217a0_clamp_id + the full bitset band, ABI v39).
   This family keeps `test` (consumer 64-bit limb probe for the 74ea50
   path) and the host-VA constants; the clamp EXPORT was removed and its
   body is now a file-local helper ONLY used by test() — NO duplicate law
   export. See section-notes/update-v109-dupva-dedupe/. */

/** P99 clamp challenge id to [0, 0x34] (file-local; FO owns the export). */
function renderShell4217a0ClampId(challengeId) {
  let eax = asI32(challengeId);
  if (eax <= 0) {
    eax = 0;
  }
  let esi = RENDER_SHELL_4217A0_CLAMP_MAX | 0;
  if (eax < esi) {
    esi = eax;
  }
  return esi | 0;
}

/**
 * P100 complete pure bit test on sparse low 64-bit limb.
 * bitsetWord0 may be Number (safe for low 53 bits) or BigInt.
 */
export function renderShell4217a0Test(bitsetWord0, challengeId) {
  const id = renderShell4217a0ClampId(challengeId);
  const bit = id & 0x3f;
  const word = BigInt(bitsetWord0);
  const mask = 1n << BigInt(bit);
  return (word & mask) !== 0n;
}

/** P101 host VA (pure-complete). */
export function renderShell4217a0HostVa() {
  return RENDER_SHELL_HOST_4217A0_VA >>> 0;
}

/** P102 74ea50 probe arg imm 0x2f. */
export function renderShell4217a0ProbeArg() {
  return RENDER_SHELL_4217A0_PROBE_ARG | 0;
}

/* ---- FUN_006f9400 / FUN_006f95a0 pure islands — ABI v17 ---- */

function nonzeroU8(v) {
  return ((v | 0) & 0xff) !== 0 ? 1 : 0;
}

/** PE signed n%2 remainder == 1 (and 0x80000001 + js fixup). */
export function renderShellPeSignedMod2Eq1(stage) {
  let eax = asI32(stage);
  eax = asI32(eax & 0x80000001);
  if (eax < 0) {
    eax = asI32(eax - 1);
    eax = asI32(eax | 0xfffffffe);
    eax = asI32(eax + 1);
  }
  return eax === 1;
}

/** P103 map node present after lower_bound. */
export function renderShellMapNodePresent(isnil0d, key10, actionId) {
  if (((isnil0d | 0) & 0xff) !== 0) return false;
  if (asI32(key10) > asI32(actionId)) return false;
  return true;
}

/** P104 6f9400 gate for action 0x39 bit. */
export function renderShell6f9400Gate39(mode26584, stage, difficulty269c8) {
  if (asI32(mode26584) === RENDER_SHELL_POLL_GATE39_MODE_EXCLUDE) return false;
  if (!renderShellPeSignedMod2Eq1(stage)) return false;
  if (asI32(stage) >= RENDER_SHELL_POLL_GATE39_STAGE_MAX) return false;
  const d = asI32(difficulty269c8);
  if (
    d === RENDER_SHELL_82D030_DIFF_GREED_A ||
    d === RENDER_SHELL_82D030_DIFF_GREED_B
  ) {
    return false;
  }
  return true;
}

/**
 * P105 6f9400 pure mask assembly.
 * @param {object} p presence flags present38..present3e
 * @param {boolean|number} gate39
 */
export function renderShell6f9400Mask(p, gate39) {
  let ebx = 0;
  if (nonzeroU8(p.present38)) ebx |= RENDER_SHELL_POLL_BIT0;
  if (nonzeroU8(p.present39) && (gate39 ? 1 : 0)) ebx |= RENDER_SHELL_POLL_BIT1;
  if (nonzeroU8(p.present3a)) ebx |= RENDER_SHELL_POLL_BIT2;
  if (nonzeroU8(p.present3b)) ebx |= RENDER_SHELL_POLL_BIT3;
  if (nonzeroU8(p.present3c)) ebx |= RENDER_SHELL_POLL_BIT5;
  if (nonzeroU8(p.present3d)) ebx |= RENDER_SHELL_POLL_BIT6;
  if (nonzeroU8(p.present3e)) ebx |= RENDER_SHELL_POLL_BIT4;
  return asU32(ebx);
}

/** Convenience full 6f9400 mask. */
export function renderShell6f9400MaskFull(p, mode26584, stage, difficulty269c8) {
  const gate = renderShell6f9400Gate39(mode26584, stage, difficulty269c8);
  return renderShell6f9400Mask(p, gate);
}

/**
 * P106 6f95a0 pure mask assembly.
 * @param {object} p presence flags present3f..present4f
 */
export function renderShell6f95a0Mask(p) {
  let ebx = 0;
  if (nonzeroU8(p.present3f)) ebx |= RENDER_SHELL_POLL_BIT0;
  if (nonzeroU8(p.present40)) ebx |= RENDER_SHELL_POLL_BIT1;
  if (nonzeroU8(p.present41)) ebx |= RENDER_SHELL_POLL_BIT2;
  if (nonzeroU8(p.present42)) ebx |= RENDER_SHELL_POLL_BIT3;
  if (nonzeroU8(p.present43)) ebx |= RENDER_SHELL_POLL_BIT5;
  if (nonzeroU8(p.present44)) ebx |= RENDER_SHELL_POLL_BIT6;
  if (nonzeroU8(p.present46)) ebx = RENDER_SHELL_POLL_B_ID_46_FORCE;
  if (nonzeroU8(p.present4f)) ebx |= RENDER_SHELL_POLL_BIT6;
  return asU32(ebx);
}

/** P107 full combine dword. */
export function renderShellPollCombine(poll6f9400, poll6f95a0, mgrOr) {
  return asU32((~asU32(poll6f95a0)) & (asU32(poll6f9400) | asU32(mgrOr)));
}

/**
 * P108 complete pure AL of 74ea50 given sparse poll masks + bitset.
 * @returns {boolean}
 */
export function renderShell74ea50EvalAl(
  difficulty269c8,
  this0,
  this4,
  flags2654c,
  mgrOr,
  poll6f9400,
  poll6f95a0,
  bitsetWord0,
) {
  if (renderShell74ea50EarlyFalse(difficulty269c8, this0, flags2654c)) {
    return false;
  }
  if (
    renderShell74ea50PostPollPlan(
      this0,
      this4,
      mgrOr,
      poll6f9400,
      poll6f95a0,
    ) !== RENDER_SHELL_74EA50_PLAN_PROBE
  ) {
    return false;
  }
  return renderShell4217a0Test(bitsetWord0, RENDER_SHELL_74EA50_PROBE_ARG);
}

/**
 * P109 complete pure AL from sparse presence flags.
 * @param {object} pA presence 38..3e
 * @param {object} pB presence 3f..4f
 */
export function renderShell74ea50EvalAlFromPresence(
  difficulty269c8,
  this0,
  this4,
  flags2654c,
  mgrOr,
  pA,
  mode26584,
  stage,
  pB,
  bitsetWord0,
) {
  const pollA = renderShell6f9400MaskFull(
    pA,
    mode26584,
    stage,
    difficulty269c8,
  );
  const pollB = renderShell6f95a0Mask(pB);
  return renderShell74ea50EvalAl(
    difficulty269c8,
    this0,
    this4,
    flags2654c,
    mgrOr,
    pollA,
    pollB,
    bitsetWord0,
  );
}

/** P110 host VAs. */
export function renderShell6f9400HostVa() {
  return RENDER_SHELL_HOST_6F9400_VA >>> 0;
}
export function renderShell6f95a0HostVa() {
  return RENDER_SHELL_HOST_6F95A0_VA >>> 0;
}
export function renderShell4288a0HostVa() {
  return RENDER_SHELL_HOST_4288A0_VA >>> 0;
}
export function renderShell74ea50HostVa() {
  return RENDER_SHELL_HOST_74EA50_VA >>> 0;
}

/* ---- AnimationState::Render pure CF — ABI v18 (VA 0x0040a030) ---- */

/** G111 anim non-null. */
export function renderShell40a030AnimOpen(animPtr) {
  return asU32(animPtr) !== 0;
}

/** G112 unsigned layer_count != 0. */
export function renderShell40a030LayerLoopNeeded(layerCount) {
  return asU32(layerCount) !== 0;
}

/** G113 residual plan: SKIP or HOST_LAYERS. */
export function renderShell40a030Plan(animPtr, layerCount) {
  if (!renderShell40a030AnimOpen(animPtr)) {
    return RENDER_SHELL_40A030_PLAN_SKIP;
  }
  if (!renderShell40a030LayerLoopNeeded(layerCount)) {
    return RENDER_SHELL_40A030_PLAN_SKIP;
  }
  return RENDER_SHELL_40A030_PLAN_HOST_LAYERS;
}

/** P111 layer stride imm 0x10. */
export function renderShell40a030LayerStride() {
  return RENDER_SHELL_40A030_LAYER_STRIDE >>> 0;
}

/** P112 layer this = base + index * 0x10. */
export function renderShell40a030LayerThis(layersBase, index) {
  return asU32(asU32(layersBase) + asU32(index) * RENDER_SHELL_40A030_LAYER_STRIDE);
}

/** P113 frame-index slot address. */
export function renderShell40a030LayerFrameSlot(layerFramesPtr, index) {
  return asU32(asU32(layerFramesPtr) + asU32(index) * 4);
}

/** P114 unsigned index < layer_count. */
export function renderShell40a030LoopContinue(index, layerCount) {
  return asU32(index) < asU32(layerCount);
}

/**
 * P115 loop step: next = before+1; return continue.
 * @returns {{ indexAfter: number, cont: boolean }}
 */
export function renderShell40a030LoopStep(indexBefore, layerCount) {
  const indexAfter = asU32(asU32(indexBefore) + 1);
  return {
    indexAfter,
    cont: renderShell40a030LoopContinue(indexAfter, layerCount),
  };
}

/**
 * P116 pack residual host 0x409120 args for one layer.
 * @returns {{ layerThis: number, frameIndex: number, position: number,
 *   topLeft: number, bottomRight: number, anm2: number }}
 */
export function renderShell40a030HostArgs(
  anm2Ptr,
  layersBase,
  index,
  frameIndex,
  positionPtr,
  topLeftPtr,
  bottomRightPtr,
) {
  return {
    layerThis: renderShell40a030LayerThis(layersBase, index),
    frameIndex: frameIndex | 0,
    position: asU32(positionPtr),
    topLeft: asU32(topLeftPtr),
    bottomRight: asU32(bottomRightPtr),
    anm2: asU32(anm2Ptr),
  };
}

/** P117 pure-complete when plan SKIP. */
export function renderShell40a030PureComplete(animPtr, layerCount) {
  return renderShell40a030Plan(animPtr, layerCount) === RENDER_SHELL_40A030_PLAN_SKIP;
}

/** P118 host VAs. */
export function renderShell40a030HostVa() {
  return RENDER_SHELL_HOST_ANIM_RENDER_VA >>> 0;
}
export function renderShell409120HostVa() {
  return RENDER_SHELL_HOST_409120_VA >>> 0;
}

/* ---- opaque_call_00409120 pure CF islands — ABI v19 (VA 0x00409120) ---- */

/** G119 layer visible [layer+0xc] != 0. */
export function renderShell409120LayerVisible(visible0c) {
  return (visible0c & 0xff) !== 0;
}

/** G120 signed frame index in range. */
export function renderShell409120FrameInRange(frameIndex, numFrames) {
  const fi = frameIndex | 0;
  const nf = numFrames | 0;
  if (fi < 0) return false;
  if (fi >= nf) return false;
  return true;
}

/** P119 frame stride 0x6c. */
export function renderShell409120FrameStride() {
  return RENDER_SHELL_409120_FRAME_STRIDE >>> 0;
}

/** P120 frame data pointer. */
export function renderShell409120FramePtr(framesBase, frameIndex) {
  return asU32(
    asU32(framesBase) +
      asU32(frameIndex | 0) * RENDER_SHELL_409120_FRAME_STRIDE,
  );
}

/** G121 frame visible [frame+0x2c] != 0. */
export function renderShell409120FrameVisible(visible2c) {
  return (visible2c & 0xff) !== 0;
}

/** P121 LayerState stride 0xa0. */
export function renderShell409120LayerStateStride() {
  return RENDER_SHELL_409120_LAYER_STATE_STRIDE >>> 0;
}

/** P122 LayerState pointer = base + layer_id * 0xa0. */
export function renderShell409120LayerStatePtr(layerStatesBase, layerId) {
  return asU32(
    asU32(layerStatesBase) +
      asU32(layerId | 0) * RENDER_SHELL_409120_LAYER_STATE_STRIDE,
  );
}

/** G122 layer-state visible [ls+0x74] != 0. */
export function renderShell409120LayerStateVisible(visible74) {
  return (visible74 & 0xff) !== 0;
}

/** G123 entry open (all pure pre-host gates). */
export function renderShell409120EntryOpen(
  layerVis0c,
  frameIndex,
  numFrames,
  frameVis2c,
  layerStateVis74,
) {
  if (!renderShell409120LayerVisible(layerVis0c)) return false;
  if (!renderShell409120FrameInRange(frameIndex, numFrames)) return false;
  if (!renderShell409120FrameVisible(frameVis2c)) return false;
  if (!renderShell409120LayerStateVisible(layerStateVis74)) return false;
  return true;
}

/** G124 residual plan SKIP / HOST_BODY. */
export function renderShell409120Plan(
  layerVis0c,
  frameIndex,
  numFrames,
  frameVis2c,
  layerStateVis74,
) {
  if (
    !renderShell409120EntryOpen(
      layerVis0c,
      frameIndex,
      numFrames,
      frameVis2c,
      layerStateVis74,
    )
  ) {
    return RENDER_SHELL_409120_PLAN_SKIP;
  }
  return RENDER_SHELL_409120_PLAN_HOST_BODY;
}

/** P123 pure-complete when plan SKIP. */
export function renderShell409120PureComplete(
  layerVis0c,
  frameIndex,
  numFrames,
  frameVis2c,
  layerStateVis74,
) {
  return (
    renderShell409120Plan(
      layerVis0c,
      frameIndex,
      numFrames,
      frameVis2c,
      layerStateVis74,
    ) === RENDER_SHELL_409120_PLAN_SKIP
  );
}

/** P124 flags OR. */
export function renderShell409120FlagsOr(anm2Flags110, layerFlags8c) {
  return asU32(asU32(anm2Flags110) | asU32(layerFlags8c));
}

/** G125 sprite non-null after host 0x408590. */
export function renderShell409120SpriteOpen(spriteNz) {
  return (spriteNz | 0) !== 0;
}

/** G126 flag bit4 early-out. */
export function renderShell409120Flag4EarlyOut(flags, datC7977e) {
  if ((asU32(flags) & RENDER_SHELL_409120_FLAG_BIT4) === 0) return false;
  return (datC7977e & 0xff) === 0;
}

/** G127 post-sprite continue. */
export function renderShell409120PostSpriteContinue(spriteNz, flags, datC7977e) {
  if (!renderShell409120SpriteOpen(spriteNz)) return false;
  if (renderShell409120Flag4EarlyOut(flags, datC7977e)) return false;
  return true;
}

/**
 * G128 color residual path plan.
 * @returns {number} COLOR_LAYER / COLOR_ANM2 / COLOR_HOST
 */
export function renderShell409120ColorPlan(flags, datC78dc0Nz) {
  if ((asU32(flags) & RENDER_SHELL_409120_FLAG_BIT1) !== 0) {
    return RENDER_SHELL_409120_COLOR_LAYER;
  }
  if ((datC78dc0Nz | 0) === 0) {
    return RENDER_SHELL_409120_COLOR_ANM2;
  }
  return RENDER_SHELL_409120_COLOR_HOST;
}

/** P125 nested residual host VAs. */
export function renderShell408590HostVa() {
  return RENDER_SHELL_HOST_408590_VA >>> 0;
}
export function renderShell40c440HostVa() {
  return RENDER_SHELL_HOST_40C440_VA >>> 0;
}
export function renderShell4071c0HostVa() {
  return RENDER_SHELL_HOST_4071C0_VA >>> 0;
}
export function renderShell4072e0HostVa() {
  return RENDER_SHELL_HOST_4072E0_VA >>> 0;
}
export function renderShell4098a0HostVa() {
  return RENDER_SHELL_HOST_4098A0_VA >>> 0;
}
export function renderShell409cb0HostVa() {
  return RENDER_SHELL_HOST_409CB0_VA >>> 0;
}
export function renderShell40c6f0HostVa() {
  return RENDER_SHELL_HOST_40C6F0_VA >>> 0;
}

/* ---- ABI v20: opaque_call_00408590 pure CF ---- */

/** G129 sprite object present. */
export function renderShell408590SpritePresent(spriteObj) {
  return asU32(spriteObj) !== 0;
}

/** G130 pair-A cache equal. */
export function renderShell408590PairAEqual(spriteA0, spriteA1, layerA0, layerA1) {
  return asU32(spriteA0) === asU32(layerA0) && asU32(spriteA1) === asU32(layerA1);
}

/** G131 pair-A update needed. */
export function renderShell408590PairAUpdateNeeded(
  spriteObj,
  spriteA0,
  spriteA1,
  layerA0,
  layerA1,
) {
  if (!renderShell408590SpritePresent(spriteObj)) return false;
  return !renderShell408590PairAEqual(spriteA0, spriteA1, layerA0, layerA1);
}

/** G132 pair-B cache equal. */
export function renderShell408590PairBEqual(spriteB0, spriteB1, layerB0, layerB1) {
  return asU32(spriteB0) === asU32(layerB0) && asU32(spriteB1) === asU32(layerB1);
}

/** G133 pair-B update needed. */
export function renderShell408590PairBUpdateNeeded(
  spriteObj,
  spriteB0,
  spriteB1,
  layerB0,
  layerB1,
) {
  if (!renderShell408590SpritePresent(spriteObj)) return false;
  return !renderShell408590PairBEqual(spriteB0, spriteB1, layerB0, layerB1);
}

/**
 * G134 residual plan for 408590.
 * @returns {number} PURE_NULL / COPY / VT44 / VT48 / VT_BOTH
 */
export function renderShell408590Plan(
  spriteObj,
  spriteCtrl,
  spriteA0,
  spriteA1,
  layerA0,
  layerA1,
  spriteB0,
  spriteB1,
  layerB0,
  layerB1,
) {
  if (asU32(spriteObj) === 0 && asU32(spriteCtrl) === 0) {
    return RENDER_SHELL_408590_PLAN_PURE_NULL;
  }
  const needA = renderShell408590PairAUpdateNeeded(
    spriteObj,
    spriteA0,
    spriteA1,
    layerA0,
    layerA1,
  );
  const needB = renderShell408590PairBUpdateNeeded(
    spriteObj,
    spriteB0,
    spriteB1,
    layerB0,
    layerB1,
  );
  if (needA && needB) return RENDER_SHELL_408590_PLAN_VT_BOTH;
  if (needA) return RENDER_SHELL_408590_PLAN_VT44;
  if (needB) return RENDER_SHELL_408590_PLAN_VT48;
  return RENDER_SHELL_408590_PLAN_COPY;
}

/** P131 pure-complete when plan PURE_NULL. */
export function renderShell408590PureComplete(
  spriteObj,
  spriteCtrl,
  spriteA0,
  spriteA1,
  layerA0,
  layerA1,
  spriteB0,
  spriteB1,
  layerB0,
  layerB1,
) {
  return (
    renderShell408590Plan(
      spriteObj,
      spriteCtrl,
      spriteA0,
      spriteA1,
      layerA0,
      layerA1,
      spriteB0,
      spriteB1,
      layerB0,
      layerB1,
    ) === RENDER_SHELL_408590_PLAN_PURE_NULL
  );
}

/** P126 apply pair-A cache stores into linear memory view. */
export function renderShell408590ApplyPairACache(view, spriteObj, layerA0, layerA1) {
  const base = asU32(spriteObj);
  if (base === 0 || !view) return;
  view.setUint32(base + RENDER_SHELL_408590_SPRITE_A0_OFF, asU32(layerA0), true);
  view.setUint32(base + RENDER_SHELL_408590_SPRITE_A1_OFF, asU32(layerA1), true);
}

/** P127 apply pair-B cache stores. */
export function renderShell408590ApplyPairBCache(view, spriteObj, layerB0, layerB1) {
  const base = asU32(spriteObj);
  if (base === 0 || !view) return;
  view.setUint32(base + RENDER_SHELL_408590_SPRITE_B0_OFF, asU32(layerB0), true);
  view.setUint32(base + RENDER_SHELL_408590_SPRITE_B1_OFF, asU32(layerB1), true);
}

/** P128 offset constants. */
export function renderShell408590LayerSpriteOff() {
  return RENDER_SHELL_408590_LAYER_SPRITE_OFF >>> 0;
}
export function renderShell408590LayerCtrlOff() {
  return RENDER_SHELL_408590_LAYER_CTRL_OFF >>> 0;
}
export function renderShell408590VtPairAOff() {
  return RENDER_SHELL_408590_VT_PAIR_A_OFF >>> 0;
}
export function renderShell408590VtPairBOff() {
  return RENDER_SHELL_408590_VT_PAIR_B_OFF >>> 0;
}

/** G135 40c550 src control null. */
export function renderShell40c550SrcControlNull(srcCtrl) {
  return asU32(srcCtrl) === 0;
}

/** G136 40c550 needs host AddRef. */
export function renderShell40c550NeedAddref(srcCtrl) {
  return !renderShell40c550SrcControlNull(srcCtrl);
}

/** P129 zero SharedPtr dest. */
export function renderShell40c550ZeroDest(view, destPtr) {
  const base = asU32(destPtr);
  if (base === 0 || !view) return;
  view.setUint32(base + RENDER_SHELL_40C550_OBJ_OFF, 0, true);
  view.setUint32(base + RENDER_SHELL_40C550_CTRL_OFF, 0, true);
}

/** P130 assign SharedPtr after AddRef. */
export function renderShell40c550Assign(view, destPtr, srcObj, srcCtrl) {
  const base = asU32(destPtr);
  if (base === 0 || !view) return;
  view.setUint32(base + RENDER_SHELL_40C550_OBJ_OFF, asU32(srcObj), true);
  view.setUint32(base + RENDER_SHELL_40C550_CTRL_OFF, asU32(srcCtrl), true);
}

/** P132 nested host VA for 40c550. */
export function renderShell40c550HostVa() {
  return RENDER_SHELL_HOST_40C550_VA >>> 0;
}

/* ---- ABI v22: AnimationLayer::GetSourceQuad 0x4098a0 pure ---- */

/** G138 effective flipY under DAT_c7977d. */
export function renderShell4098a0EffectiveFlipY(anm2FlipY, datC7977d) {
  if (asU8(datC7977d) === 0) return asU8(anm2FlipY) !== 0 ? 1 : 0;
  return asU8(anm2FlipY) === 0 ? 1 : 0;
}

/** P139/P140 scale packs. */
export function renderShell4098a0ScaleX(frameScaleX, layerSizeX) {
  return f32(f32(frameScaleX) * f32(layerSizeX));
}
export function renderShell4098a0ScaleY(frameScaleY, layerSizeY) {
  return f32(f32(frameScaleY) * f32(layerSizeY));
}

/** P141 clamp-adjusted crop rect. */
export function renderShell4098a0CropRect(
  frameCropX,
  frameCropY,
  frameW,
  frameH,
  scaleX,
  scaleY,
  clampTlX,
  clampTlY,
  clampBrX,
  clampBrY,
) {
  const left = f32(f32(frameCropX) + f32(f32(clampTlX) / f32(scaleX)));
  const top = f32(f32(frameCropY) + f32(f32(clampTlY) / f32(scaleY)));
  const right = f32(
    f32(f32(frameCropX) + f32(frameW)) - f32(f32(clampBrX) / f32(scaleX)),
  );
  const bottom = f32(
    f32(f32(frameCropY) + f32(frameH)) - f32(f32(clampBrY) / f32(scaleY)),
  );
  return { left, top, right, bottom };
}

/** G139 comiss seta: 0 > x. */
export function renderShell4098a0F32StrictNeg(x) {
  return 0 > f32(x);
}

/** P142 xorps sign-bit negate. */
export function renderShell4098a0F32Neg(x) {
  const bits = (() => {
    const buf = new ArrayBuffer(4);
    new DataView(buf).setFloat32(0, f32(x), true);
    return new DataView(buf).getUint32(0, true);
  })();
  return f32FromBits((bits ^ RENDER_SHELL_F32_SIGN_BITS) >>> 0);
}

/** G140 FlipX needed. */
export function renderShell4098a0FlipXNeeded(
  scaleX,
  anm2ScaleX,
  layerFlipX,
  anm2FlipX,
) {
  let sx = f32(scaleX);
  let ax = f32(anm2ScaleX);
  if (asU8(layerFlipX) !== 0) sx = renderShell4098a0F32Neg(sx);
  if (asU8(anm2FlipX) !== 0) ax = renderShell4098a0F32Neg(ax);
  return (
    renderShell4098a0F32StrictNeg(ax) !== renderShell4098a0F32StrictNeg(sx)
  );
}

/** G141 FlipY needed. */
export function renderShell4098a0FlipYNeeded(
  scaleY,
  anm2ScaleY,
  layerFlipY,
  effAnm2FlipY,
) {
  let sy = f32(scaleY);
  let ay = f32(anm2ScaleY);
  if (asU8(layerFlipY) !== 0) sy = renderShell4098a0F32Neg(sy);
  if (asU8(effAnm2FlipY) !== 0) ay = renderShell4098a0F32Neg(ay);
  return (
    renderShell4098a0F32StrictNeg(sy) !== renderShell4098a0F32StrictNeg(ay)
  );
}

/** G142 flags & 2. */
export function renderShell4098a0RngFlagOpen(flagsOr) {
  return (asU32(flagsOr) & RENDER_SHELL_4098A0_FLAG_BIT2) !== 0;
}

/** G143 residual plan. */
export function renderShell4098a0Plan(flagsOr, rngSeed) {
  if (!renderShell4098a0RngFlagOpen(flagsOr)) {
    return RENDER_SHELL_4098A0_PLAN_PURE;
  }
  if (asU32(rngSeed) === 0) return RENDER_SHELL_4098A0_PLAN_HOST_ASSERT;
  return RENDER_SHELL_4098A0_PLAN_RNG;
}

/** P143 pure-complete when not HOST_ASSERT. */
export function renderShell4098a0PureComplete(flagsOr, rngSeed) {
  return (
    renderShell4098a0Plan(flagsOr, rngSeed) !==
    RENDER_SHELL_4098A0_PLAN_HOST_ASSERT
  );
}

/** P144 xorshift step (count masked to 5 bits). */
export function renderShell4098a0RngStep(seed, shr1, shl, shr2) {
  const c1 = asU32(shr1) & 31;
  const c2 = asU32(shl) & 31;
  const c3 = asU32(shr2) & 31;
  const s = asU32(seed);
  let a = ((s >>> c1) ^ s) >>> 0;
  let b = ((a << c2) ^ a) >>> 0;
  return ((b >>> c3) ^ b) >>> 0;
}

/** P145 unit jitter ≈[-0.5, 0.5). */
export function renderShell4098a0RngUnit(seed) {
  const asF = renderShell817830U32ToF32(seed);
  const unit = f32FromBits(RENDER_SHELL_F32_RNG_UNIT_BITS);
  const half = f32FromBits(RENDER_SHELL_F32_HALF_BITS);
  return f32(f32(asF * unit) - half);
}

/**
 * P146 complete pure GetSourceQuad.
 * @returns {{ seed: number, corners: number[] }} final seed + 8 floats TL/TR/BL/BR
 */
export function renderShell4098a0Compute(args) {
  const scaleX = renderShell4098a0ScaleX(args.frameScaleX, args.layerSizeX);
  const scaleY = renderShell4098a0ScaleY(args.frameScaleY, args.layerSizeY);
  const rect = renderShell4098a0CropRect(
    args.frameCropX,
    args.frameCropY,
    args.frameW,
    args.frameH,
    scaleX,
    scaleY,
    args.clampTlX,
    args.clampTlY,
    args.clampBrX,
    args.clampBrY,
  );
  let tlX = rect.left;
  let tlY = rect.top;
  let trX = rect.right;
  let trY = rect.top;
  let blX = rect.left;
  let blY = rect.bottom;
  let brX = rect.right;
  let brY = rect.bottom;

  const effFlipY = renderShell4098a0EffectiveFlipY(
    args.anm2FlipY,
    args.datC7977d,
  );
  if (
    renderShell4098a0FlipXNeeded(
      scaleX,
      args.anm2ScaleX,
      args.layerFlipX,
      args.anm2FlipX,
    )
  ) {
    let t = tlX;
    tlX = trX;
    trX = t;
    t = blX;
    blX = brX;
    brX = t;
  }
  if (
    renderShell4098a0FlipYNeeded(
      scaleY,
      args.anm2ScaleY,
      args.layerFlipY,
      effFlipY,
    )
  ) {
    let tx = tlX;
    let ty = tlY;
    tlX = blX;
    tlY = blY;
    blX = tx;
    blY = ty;
    tx = trX;
    ty = trY;
    trX = brX;
    trY = brY;
    brX = tx;
    brY = ty;
  }

  let seed = asU32(args.rngSeed);
  if (renderShell4098a0RngFlagOpen(args.flagsOr)) {
    /* ABI v32: gate is flags&2 only (VA 0x00409a6f). Zero seed continues the
       jitter too (trap-swallowed continuation; host raises the two a112c0
       events per ZERO_SEED_ASSERT_COUNT): step(0)==0, unit(0)==-0.5f. */
    const width = f32(trX - tlX);
    const height = f32(blY - tlY);
    seed = renderShell4098a0RngStep(
      seed,
      args.rngShr1,
      args.rngShl,
      args.rngShr2,
    );
    const yJ = f32(renderShell4098a0RngUnit(seed) * height);
    seed = renderShell4098a0RngStep(
      seed,
      args.rngShr1,
      args.rngShl,
      args.rngShr2,
    );
    const xJ = f32(renderShell4098a0RngUnit(seed) * width);
    tlX = f32(tlX + xJ);
    tlY = f32(tlY + yJ);
    trX = f32(trX + xJ);
    trY = f32(trY + yJ);
    blX = f32(blX + xJ);
    blY = f32(blY + yJ);
    brX = f32(brX + xJ);
    brY = f32(brY + yJ);
  }

  const cx = f32(args.layerCropX);
  const cy = f32(args.layerCropY);
  tlX = f32(tlX + cx);
  tlY = f32(tlY + cy);
  trX = f32(trX + cx);
  trY = f32(trY + cy);
  blX = f32(blX + cx);
  blY = f32(blY + cy);
  brX = f32(brX + cx);
  brY = f32(brY + cy);

  return {
    seed: seed >>> 0,
    corners: [tlX, tlY, trX, trY, blX, blY, brX, brY],
    space: RENDER_SHELL_SOURCE_QUAD_SPACE_UV,
  };
}

/** Write compute result into a DataView SourceQuad. */
export function renderShell4098a0Apply(view, outPtr, args) {
  const r = renderShell4098a0Compute(args);
  const base = asU32(outPtr);
  if (base === 0 || !view) return r.seed >>> 0;
  for (let i = 0; i < 8; i += 1) {
    view.setFloat32(base + i * 4, r.corners[i], true);
  }
  view.setUint8(base + RENDER_SHELL_SOURCE_QUAD_SPACE_OFF, r.space);
  return r.seed >>> 0;
}

export function renderShellA112c0HostVa() {
  return RENDER_SHELL_HOST_A112C0_VA >>> 0;
}
export function renderShell4098a0RngMsgVa() {
  return RENDER_SHELL_4098A0_RNG_MSG_VA >>> 0;
}
export function renderShell4098a0RngMsgArg() {
  return RENDER_SHELL_4098A0_RNG_MSG_ARG | 0;
}
export function renderShell4098a0ZeroSeedAssertCount() {
  return RENDER_SHELL_4098A0_ZERO_SEED_ASSERT_COUNT | 0;
}

/* ---- ABI v22: dest-quad residual 0x409cb0 pure CF ---- */

export function renderShell409cb0FlagsOr(anm2Flags110, layerFlags8c) {
  return (asU32(anm2Flags110) | asU32(layerFlags8c)) >>> 0;
}

export function renderShell409cb0Flag8Open(flagsOr) {
  return (asU32(flagsOr) & RENDER_SHELL_409CB0_FLAG_BIT8) !== 0;
}

export function renderShell409cb0ScaleX(frameScaleX, layerSizeX) {
  return renderShell4098a0ScaleX(frameScaleX, layerSizeX);
}
export function renderShell409cb0ScaleY(frameScaleY, layerSizeY) {
  return renderShell4098a0ScaleY(frameScaleY, layerSizeY);
}

/* v25: all six root-path callees are translated pure bodies. */
export function renderShell409cb0Plan() {
  return RENDER_SHELL_409CB0_PLAN_PURE;
}
export function renderShell409cb0PureComplete() {
  return true;
}

export function renderShellA0f550HostVa() {
  return RENDER_SHELL_HOST_A0F550_VA >>> 0;
}
export function renderShellA10d00HostVa() {
  return RENDER_SHELL_HOST_A10D00_VA >>> 0;
}
export function renderShellA10950HostVa() {
  return RENDER_SHELL_HOST_A10950_VA >>> 0;
}
export function renderShellA10760HostVa() {
  return RENDER_SHELL_HOST_A10760_VA >>> 0;
}

/* ---- ABI v24: dest-quad nested pure bodies a10d00 / a10950 / a10760 ---- */

function f32Bits(v) {
  const buf = new ArrayBuffer(4);
  new DataView(buf).setFloat32(0, f32(v), true);
  return new DataView(buf).getUint32(0, true) >>> 0;
}

/**
 * P158 a10d00 AABB dest-quad + 4× color pack.
 * @param {DataView} view
 */
export function renderShellA10d00Init(view, objPtr, left, top, right, bottom, colorPtr) {
  const o = asU32(objPtr);
  const c = asU32(colorPtr);
  view.setFloat32(o + 0x00, f32(left), true);
  view.setFloat32(o + 0x04, f32(top), true);
  view.setFloat32(o + 0x08, f32(right), true);
  view.setFloat32(o + 0x0c, f32(top), true);
  view.setFloat32(o + 0x10, f32(left), true);
  view.setFloat32(o + 0x14, f32(bottom), true);
  view.setFloat32(o + 0x18, f32(right), true);
  view.setFloat32(o + 0x1c, f32(bottom), true);
  for (let copy = 0; copy < RENDER_SHELL_A10D00_COLOR_COPIES; copy += 1) {
    const dst = o + RENDER_SHELL_A10D00_COLOR_OFF + copy * RENDER_SHELL_A10D00_COLOR_DWORDS * 4;
    for (let i = 0; i < RENDER_SHELL_A10D00_COLOR_DWORDS; i += 1) {
      view.setUint32(dst + i * 4, view.getUint32(c + i * 4, true) >>> 0, true);
    }
  }
}

export function renderShellA10d00PureComplete() {
  return true;
}

/** G149 scale ordered-eq (1,1). */
export function renderShellA10950ScaleIdentity(scaleX, scaleY) {
  const one = f32FromBits(RENDER_SHELL_F32_ONE_BITS);
  return f32(scaleX) === one && f32(scaleY) === one;
}

export function renderShellA10950Plan(scaleX, scaleY) {
  return renderShellA10950ScaleIdentity(scaleX, scaleY)
    ? RENDER_SHELL_A10950_PLAN_SKIP
    : RENDER_SHELL_A10950_PLAN_APPLY;
}

/**
 * P159 a10950 scale-about-offset in-place on DestinationQuad corners.
 * @param {DataView} view
 */
export function renderShellA10950Apply(view, objPtr, offsetX, offsetY, scaleX, scaleY) {
  if (renderShellA10950Plan(scaleX, scaleY) === RENDER_SHELL_A10950_PLAN_SKIP) {
    return;
  }
  const o = asU32(objPtr);
  const ox = f32(offsetX);
  const oy = f32(offsetY);
  const sx = f32(scaleX);
  const sy = f32(scaleY);
  const nx = f32FromBits(f32Bits(ox) ^ RENDER_SHELL_F32_SIGN_BITS);
  const ny = f32FromBits(f32Bits(oy) ^ RENDER_SHELL_F32_SIGN_BITS);
  for (let i = 0; i < 4; i += 1) {
    const xo = o + i * 8;
    const yo = xo + 4;
    let x = f32(view.getFloat32(xo, true));
    let y = f32(view.getFloat32(yo, true));
    x = f32(x + nx);
    y = f32(y + ny);
    x = f32(x * sx);
    y = f32(y * sy);
    x = f32(x + ox);
    y = f32(y + oy);
    view.setFloat32(xo, x, true);
    view.setFloat32(yo, y, true);
  }
}

export function renderShellA10950PureComplete() {
  return true;
}

/** G152 angle ordered-eq 0. */
export function renderShellA10760AngleZero(angleRad) {
  return f32(angleRad) === f32FromBits(RENDER_SHELL_F32_ZERO_BITS);
}

export function renderShellA10760Plan(angleRad) {
  return renderShellA10760AngleZero(angleRad)
    ? RENDER_SHELL_A10760_PLAN_SKIP
    : RENDER_SHELL_A10760_PLAN_APPLY;
}

/**
 * P160 rotate body with sparse cos/sin.
 * @param {DataView} view
 */
export function renderShellA10760ApplyCs(view, objPtr, pivotX, pivotY, cosA, sinA) {
  const o = asU32(objPtr);
  const px = f32(pivotX);
  const py = f32(pivotY);
  const c = f32(cosA);
  const s = f32(sinA);
  const nx = f32FromBits(f32Bits(px) ^ RENDER_SHELL_F32_SIGN_BITS);
  const ny = f32FromBits(f32Bits(py) ^ RENDER_SHELL_F32_SIGN_BITS);
  for (let i = 0; i < 4; i += 1) {
    const xo = o + i * 8;
    const yo = xo + 4;
    const x = f32(f32(view.getFloat32(xo, true)) + nx);
    const y = f32(f32(view.getFloat32(yo, true)) + ny);
    const xr = f32(f32(x * c) - f32(y * s));
    const yr = f32(f32(x * s) + f32(y * c));
    view.setFloat32(xo, f32(xr + px), true);
    view.setFloat32(yo, f32(yr + py), true);
  }
}

/**
 * P161 complete a10760 via Math.cos/sin (soft-float cos/sin in Wasm).
 * @param {DataView} view
 */
export function renderShellA10760Apply(view, objPtr, pivotX, pivotY, angleRad) {
  if (renderShellA10760Plan(angleRad) === RENDER_SHELL_A10760_PLAN_SKIP) {
    return;
  }
  const a = f32(angleRad);
  const cosA = f32(Math.cos(a));
  const sinA = f32(Math.sin(a));
  renderShellA10760ApplyCs(view, objPtr, pivotX, pivotY, cosA, sinA);
}

export function renderShellA10760PureComplete() {
  return true;
}

export function renderShell41d540HostVa() {
  return RENDER_SHELL_HOST_41D540_VA >>> 0;
}
export function renderShell41d520HostVa() {
  return RENDER_SHELL_HOST_41D520_VA >>> 0;
}

/* ---- ABI v23: opaque_call_0040c6f0 color-ring pure body ---- */

/** P151 ring mask: (DAT_c78dc0 + DAT_c78dbc) - 1  (u32 wrap). */
export function renderShell40c6f0RingMask(datC78dc0, datC78dbc) {
  return (asU32(datC78dc0) + asU32(datC78dbc) - 1) >>> 0;
}

/** P152 cursor-1: DAT_c78db8 - 1. */
export function renderShell40c6f0CursorDec(datC78db8) {
  return (asU32(datC78db8) - 1) >>> 0;
}

/** P153 ring index: (cursor-1) & mask. */
export function renderShell40c6f0Index(datC78dc0, datC78dbc, datC78db8) {
  return (
    renderShell40c6f0CursorDec(datC78db8) &
    renderShell40c6f0RingMask(datC78dc0, datC78dbc)
  ) >>> 0;
}

/**
 * P154 table slot load [table_base + index*4].
 * table_base==0 → 0 (safe pure-model no-op; PE would fault).
 * @param {DataView|null|undefined} view
 * @param {number} tableBase
 * @param {number} index
 */
export function renderShell40c6f0Lookup(view, tableBase, index) {
  const base = asU32(tableBase);
  if (base === 0) return 0;
  const off = (base + asU32(index) * 4) >>> 0;
  if (!view) return 0;
  return view.getUint32(off, true) >>> 0;
}

/**
 * P155 complete pure body: sparse ring globals → Color* dword.
 * @param {DataView|null|undefined} view linear-memory model for table load
 * @param {number} datC78db4 table base (linear addr when sparsified)
 * @param {number} datC78db8 cursor
 * @param {number} datC78dbc base addend
 * @param {number} datC78dc0 count
 */
export function renderShell40c6f0Compute(
  view,
  datC78db4,
  datC78db8,
  datC78dbc,
  datC78dc0,
) {
  const index = renderShell40c6f0Index(datC78dc0, datC78dbc, datC78db8);
  return renderShell40c6f0Lookup(view, datC78db4, index);
}

/** G147 residual plan: always PURE. */
export function renderShell40c6f0Plan() {
  return RENDER_SHELL_40C6F0_PLAN_PURE;
}

/** P156 pure-complete? always true. */
export function renderShell40c6f0PureComplete() {
  return true;
}

/** P157 DAT VAs. */
export function renderShell40c6f0DatC78db4Va() {
  return RENDER_SHELL_40C6F0_DAT_C78DB4_VA >>> 0;
}
export function renderShell40c6f0DatC78db8Va() {
  return RENDER_SHELL_40C6F0_DAT_C78DB8_VA >>> 0;
}
export function renderShell40c6f0DatC78dbcVa() {
  return RENDER_SHELL_40C6F0_DAT_C78DBC_VA >>> 0;
}
export function renderShell40c6f0DatC78dc0Va() {
  return RENDER_SHELL_40C6F0_DAT_C78DC0_VA >>> 0;
}

/* ---- ABI v21: color residual 4071c0 / 6831c0 / 4072e0 pure bodies ---- */

/** P133 ColorMod size / float count. */
export function renderShellColorSize() {
  return RENDER_SHELL_COLOR_SIZE >>> 0;
}
export function renderShellColorFloats() {
  return RENDER_SHELL_COLOR_FLOATS >>> 0;
}

/**
 * P134 complete pure body of opaque_call_004071c0 (0x2c ColorMod copy).
 * @param {Float32Array|number[]|null|undefined} dest
 * @param {Float32Array|number[]|null|undefined} src
 * @returns {Float32Array|null} dest (mutated) or null
 */
export function renderShell4071c0Copy(dest, src) {
  if (dest == null || src == null) return dest == null ? null : dest;
  for (let i = 0; i < RENDER_SHELL_COLOR_FLOATS; i += 1) {
    dest[i] = f32(src[i]);
  }
  return dest;
}

/**
 * P134 variant writing into a DataView linear-memory model.
 * @param {DataView} view
 * @param {number} destOff
 * @param {number} srcOff
 */
export function renderShell4071c0CopyMem(view, destOff, srcOff) {
  const d = asU32(destOff);
  const s = asU32(srcOff);
  if (d === 0 || s === 0 || !view) return;
  for (let i = 0; i < RENDER_SHELL_COLOR_FLOATS; i += 1) {
    view.setFloat32(d + i * 4, view.getFloat32(s + i * 4, true), true);
  }
}

/** P135 offset RGB sum (PE addss chain). */
export function renderShell6831c0OffsetSum(offR, offG, offB) {
  return f32(f32(f32(offR) + f32(offG)) + f32(offB));
}

/**
 * G137 offset residual plan (ucomiss ordered-eq 0).
 * @returns {number} SKIP / COPY / AVERAGE
 */
export function renderShell6831c0OffsetPlan(thisSum, otherSum) {
  if (f32(otherSum) === 0) return RENDER_SHELL_6831C0_OFF_SKIP;
  if (f32(thisSum) === 0) return RENDER_SHELL_6831C0_OFF_COPY;
  return RENDER_SHELL_6831C0_OFF_AVERAGE;
}

/**
 * P136 complete pure body of opaque_call_006831c0 (in-place mul-blend).
 * @param {Float32Array|number[]} inout
 * @param {Float32Array|number[]} other
 * @returns {Float32Array|number[]|null}
 */
export function renderShell6831c0MulBlend(inout, other) {
  if (inout == null || other == null) return inout == null ? null : inout;
  for (let i = 0; i < RENDER_SHELL_COLOR_TINT_COUNT; i += 1) {
    inout[i] = f32(f32(inout[i]) * f32(other[i]));
  }
  const otherSum = renderShell6831c0OffsetSum(other[4], other[5], other[6]);
  const thisSum = renderShell6831c0OffsetSum(inout[4], inout[5], inout[6]);
  const plan = renderShell6831c0OffsetPlan(thisSum, otherSum);
  if (plan === RENDER_SHELL_6831C0_OFF_COPY) {
    inout[4] = f32(other[4]);
    inout[5] = f32(other[5]);
    inout[6] = f32(other[6]);
    inout[7] = f32(other[7]);
  } else if (plan === RENDER_SHELL_6831C0_OFF_AVERAGE) {
    const half = f32FromBits(RENDER_SHELL_F32_HALF_BITS);
    inout[4] = f32(f32(f32(inout[4]) + f32(other[4])) * half);
    inout[5] = f32(f32(f32(inout[5]) + f32(other[5])) * half);
    inout[6] = f32(f32(f32(inout[6]) + f32(other[6])) * half);
    inout[7] = f32(f32(f32(inout[7]) + f32(other[7])) * half);
  }
  inout[8] = f32(f32(inout[8]) + f32(other[8]));
  inout[9] = f32(f32(inout[9]) + f32(other[9]));
  inout[10] = f32(f32(inout[10]) + f32(other[10]));
  return inout;
}

/**
 * P136 DataView variant (inout at destOff, other at otherOff).
 */
export function renderShell6831c0MulBlendMem(view, destOff, otherOff) {
  const d = asU32(destOff);
  const o = asU32(otherOff);
  if (d === 0 || o === 0 || !view) return;
  const load = (base, i) => view.getFloat32(base + i * 4, true);
  const store = (base, i, v) => view.setFloat32(base + i * 4, f32(v), true);
  for (let i = 0; i < RENDER_SHELL_COLOR_TINT_COUNT; i += 1) {
    store(d, i, f32(load(d, i) * load(o, i)));
  }
  const otherSum = renderShell6831c0OffsetSum(load(o, 4), load(o, 5), load(o, 6));
  const thisSum = renderShell6831c0OffsetSum(load(d, 4), load(d, 5), load(d, 6));
  const plan = renderShell6831c0OffsetPlan(thisSum, otherSum);
  if (plan === RENDER_SHELL_6831C0_OFF_COPY) {
    for (let i = 4; i <= 7; i += 1) store(d, i, load(o, i));
  } else if (plan === RENDER_SHELL_6831C0_OFF_AVERAGE) {
    const half = f32FromBits(RENDER_SHELL_F32_HALF_BITS);
    for (let i = 4; i <= 7; i += 1) {
      store(d, i, f32(f32(load(d, i) + load(o, i)) * half));
    }
  }
  for (let i = 8; i <= 10; i += 1) {
    store(d, i, f32(load(d, i) + load(o, i)));
  }
}

/**
 * P137 complete pure body of opaque_call_004072e0.
 * dest = copy(lhs); mul_blend(dest, other).
 * @param {Float32Array|number[]} dest
 * @param {Float32Array|number[]} lhs
 * @param {Float32Array|number[]} other
 */
export function renderShell4072e0Blend(dest, lhs, other) {
  if (dest == null || lhs == null) return dest == null ? null : dest;
  renderShell4071c0Copy(dest, lhs);
  if (other != null) {
    renderShell6831c0MulBlend(dest, other);
  }
  return dest;
}

/**
 * P137 DataView variant: destOff = blend(lhsOff, otherOff).
 */
export function renderShell4072e0BlendMem(view, destOff, lhsOff, otherOff) {
  if (!view) return;
  renderShell4071c0CopyMem(view, destOff, lhsOff);
  renderShell6831c0MulBlendMem(view, destOff, otherOff);
}

/** P138 nested pure VA for 6831c0 (address-stable; pure-complete v21). */
export function renderShell6831c0HostVa() {
  return RENDER_SHELL_HOST_6831C0_VA >>> 0;
}

/* ===========================================================================
 * ABI v25 — opaque_call_00409cb0 whole-body pure compute (VA 0x00409cb0)
 *
 * Modelled directly off the PE stack frame rather than off the C++ peel:
 * `and esp,~7; sub esp,0x4c; push esi` gives a frame base B and the body only
 * ever touches the slots below. Slot names track the PE offsets so the two
 * derivations stay independent.
 *
 *   B+0x0a effFlipY   B+0x0b anm2FlipX  B+0x0c spanX   B+0x10 spanY
 *   B+0x14 posX/p2x   B+0x18 p2y        B+0x1c rotA    B+0x20 rotB
 *   B+0x24 posY/p1x   B+0x28 p1y        B+0x2c sxF     B+0x30 syF
 *   B+0x34 sxA        B+0x38 syA        B+0x3c color (0x14 bytes)
 * =========================================================================== */

/** G155 camera-base open: DAT_c71678 && DAT_c33910 (VA 0x00409ef8). */
export function renderShell409cb0CameraOpen(datC71678, datC33910) {
  return asU32(datC71678) !== 0 && asU8(datC33910) !== 0;
}

/**
 * P163 camera base select (VA 0x00409ee3…0x00409f15).
 * @param {DataView|null|undefined} view linear memory holding manager fields
 */
export function renderShell409cb0CameraBase(
  view,
  datC71678,
  datC33910,
  datC7b640,
  datC7b644,
) {
  const fallback = { x: f32(datC7b640), y: f32(datC7b644) };
  if (!renderShell409cb0CameraOpen(datC71678, datC33910)) return fallback;
  if (!view) return fallback;
  const base = asU32(datC71678);
  return {
    x: f32(view.getFloat32(base + RENDER_SHELL_409CB0_CAM_X_OFF, true)),
    y: f32(view.getFloat32(base + RENDER_SHELL_409CB0_CAM_Y_OFF, true)),
  };
}

/** xorps DAT_00bacb70 sign flip. */
function negSign409cb0(v) {
  return f32FromBits((f32Bits(v) ^ RENDER_SHELL_F32_SIGN_BITS) >>> 0);
}

/** comiss 0, x / jbe → the fold runs only for ordered x < 0. */
function strictNeg409cb0(v) {
  return f32(0) > f32(v);
}

/**
 * P164 four-scale pack + flag bit8 override + the four xorps flips.
 * Returns the values stored at B+0x2c / +0x30 / +0x34 / +0x38.
 */
export function renderShell409cb0ScalePack(args) {
  const {
    flagsOr,
    frameScaleX,
    frameScaleY,
    layerSizeX,
    layerSizeY,
    anm2ScaleX,
    anm2ScaleY,
    layerFlipX,
    layerFlipY,
    anm2FlipX,
    effFlipY,
  } = args;
  let sxF = f32(f32(frameScaleX) * f32(layerSizeX));
  let syF = f32(f32(frameScaleY) * f32(layerSizeY));
  let sxA = f32(anm2ScaleX);
  let syA = f32(anm2ScaleY);
  if ((asU32(flagsOr) & RENDER_SHELL_409CB0_FLAG_BIT8) !== 0) {
    sxA = f32(f32(layerSizeX) * f32(anm2ScaleX));
    syA = f32(f32(layerSizeY) * f32(anm2ScaleY));
    sxF = f32(frameScaleX);
    syF = f32(frameScaleY);
  }
  if (asU8(layerFlipX) !== 0) sxF = negSign409cb0(sxF);
  if (asU8(anm2FlipX) !== 0) sxA = negSign409cb0(sxA);
  if (asU8(layerFlipY) !== 0) syF = negSign409cb0(syF);
  if (asU8(effFlipY) !== 0) syA = negSign409cb0(syA);
  return { sxF, syF, sxA, syA };
}

/** P165 span fold: pivot → ref-pivot → ref-span. */
export function renderShell409cb0Span(ref, pivot, negAnm2, negFrame) {
  let span = f32(pivot);
  if (negAnm2) span = f32(f32(ref) - f32(pivot));
  if (negFrame) span = f32(f32(ref) - span);
  return span;
}

/** G156 rotation parity: both folds xorps rotA and rotB, so they cancel. */
export function renderShell409cb0RotNegated(negX, negY) {
  return Boolean(negX) !== Boolean(negY);
}

/** P166 DAT_00baa088 degrees → radians. */
export function renderShell409cb0DegToRad(degrees) {
  return f32(f32(degrees) * f32FromBits(RENDER_SHELL_F32_DEG2RAD_BITS));
}

/** P167 pivot pair from camera base + world position. */
export function renderShell409cb0Pivots(
  camX,
  camY,
  posX,
  posY,
  posBaseX,
  posBaseY,
  anm2OffX,
  anm2OffY,
) {
  const bx = f32(f32(camX) + f32(posX));
  const by = f32(f32(camY) + f32(posY));
  return {
    p1x: f32(bx + f32(posBaseX)),
    p1y: f32(by + f32(posBaseY)),
    p2x: f32(bx + f32(anm2OffX)),
    p2y: f32(by + f32(anm2OffY)),
  };
}

/** P168 clamp corner pack (divss by the folded frame scales). */
export function renderShell409cb0Corners(
  x0,
  y0,
  frameRefX,
  frameRefY,
  clampTlX,
  clampTlY,
  clampBrX,
  clampBrY,
  sxFrame,
  syFrame,
) {
  const bottom = f32(
    f32(f32(y0) + f32(frameRefY)) - f32(f32(clampBrY) / f32(syFrame)),
  );
  const right = f32(
    f32(f32(x0) + f32(frameRefX)) - f32(f32(clampBrX) / f32(sxFrame)),
  );
  const top = f32(f32(f32(clampTlY) / f32(syFrame)) + f32(y0));
  const left = f32(f32(f32(clampTlX) / f32(sxFrame)) + f32(x0));
  return { left, top, right, bottom };
}

/** P169 a0f550 packed color arg pushed at VA 0x00409f18 (imm -1). */
export function renderShell409cb0ColorArg() {
  return RENDER_SHELL_409CB0_COLOR_ARG >>> 0;
}

/**
 * P170 complete pure body of opaque_call_00409cb0.
 * Writes the 0x70 DestinationQuad at outPtr and the 0x14 color at colorPtr.
 * @param {DataView} view
 * @returns {number} outPtr (PE returns the object pointer in EAX)
 */
export function renderShell409cb0Compute(view, outPtr, colorPtr, a) {
  const out = asU32(outPtr);
  const color = asU32(colorPtr);

  /* 0x00409cc0 / 0x00409cc6: edx = [anm2+0x110] | [layer+0x8c] */
  const flagsOr = (asU32(a.anm2Flags110) | asU32(a.layerFlags8c)) >>> 0;
  /* 0x00409ccc…0x00409cf6: sete inversion of [anm2+0x101] when DAT_c7977d */
  const slotFlipY = asU8(a.datC7977d) !== 0
    ? (asU8(a.anm2FlipY) === 0 ? 1 : 0)
    : (asU8(a.anm2FlipY) !== 0 ? 1 : 0);
  const slotFlipX = asU8(a.anm2FlipX) !== 0 ? 1 : 0;

  const packed = renderShell409cb0ScalePack({
    flagsOr,
    frameScaleX: a.frameScaleX,
    frameScaleY: a.frameScaleY,
    layerSizeX: a.layerSizeX,
    layerSizeY: a.layerSizeY,
    anm2ScaleX: a.anm2ScaleX,
    anm2ScaleY: a.anm2ScaleY,
    layerFlipX: a.layerFlipX,
    layerFlipY: a.layerFlipY,
    anm2FlipX: slotFlipX,
    effFlipY: slotFlipY,
  });
  let sxF = packed.sxF;
  let syF = packed.syF;
  let sxA = packed.sxA;
  let syA = packed.syA;

  /* 0x00409d5e / 0x00409d53 / 0x00409d59 / 0x00409d77 slot seeds */
  let rotA = f32(f32(a.frameRot) + f32(a.layerRot));
  let rotB = f32(a.anm2Rot);
  let posX = f32(f32(f32(a.framePosX) + f32(a.layerPosX)) + f32(a.anm2OffX));
  let posY = f32(f32(f32(a.framePosY) + f32(a.layerPosY)) + f32(a.anm2OffY));

  /* 0x00409e06 comiss 0, sxA */
  const negXa = strictNeg409cb0(sxA);
  if (negXa) {
    sxA = negSign409cb0(sxA);
    rotA = negSign409cb0(rotA);
    rotB = negSign409cb0(rotB);
    posX = negSign409cb0(posX);
  }
  /* 0x00409e45 comiss 0, sxF */
  const negXf = strictNeg409cb0(sxF);
  if (negXf) sxF = negSign409cb0(sxF);
  /* 0x00409e83 comiss 0, syA */
  const negYa = strictNeg409cb0(syA);
  if (negYa) {
    syA = negSign409cb0(syA);
    rotA = negSign409cb0(rotA);
    rotB = negSign409cb0(rotB);
    posY = negSign409cb0(posY);
  }
  /* 0x00409eca comiss 0, syF */
  const negYf = strictNeg409cb0(syF);
  if (negYf) syF = negSign409cb0(syF);

  const spanX = renderShell409cb0Span(a.frameRefX, a.framePivotX, negXa, negXf);
  const spanY = renderShell409cb0Span(a.frameRefY, a.framePivotY, negYa, negYf);

  const piv = renderShell409cb0Pivots(
    a.camX,
    a.camY,
    a.posX,
    a.posY,
    posX,
    posY,
    a.anm2OffX,
    a.anm2OffY,
  );
  const x0 = f32(piv.p1x - spanX);
  const y0 = f32(piv.p1y - spanY);

  /* 0x00409f69 a0f550(color, -1) */
  renderShellA0f550Init(view, color, renderShell409cb0ColorArg());

  const c = renderShell409cb0Corners(
    x0,
    y0,
    a.frameRefX,
    a.frameRefY,
    a.clampTlX,
    a.clampTlY,
    a.clampBrX,
    a.clampBrY,
    sxF,
    syF,
  );

  /* 0x00409fc4 / 0x00409fd5 / 0x00409fe4 / 0x00409ffc / 0x0040a016 */
  renderShellA10d00Init(view, out, c.left, c.top, c.right, c.bottom, color);
  renderShellA10950Apply(view, out, piv.p1x, piv.p1y, sxF, syF);
  renderShellA10950Apply(view, out, piv.p2x, piv.p2y, sxA, syA);
  renderShellA10760Apply(
    view,
    out,
    piv.p1x,
    piv.p1y,
    renderShell409cb0DegToRad(rotA),
  );
  renderShellA10760Apply(
    view,
    out,
    piv.p2x,
    piv.p2y,
    renderShell409cb0DegToRad(rotB),
  );
  return out;
}

/* P171 hash-bound DAT VAs for the camera-base / deg2rad globals. */
export function renderShell409cb0DatC71678Va() {
  return RENDER_SHELL_409CB0_DAT_C71678_VA >>> 0;
}
export function renderShell409cb0DatC33910Va() {
  return RENDER_SHELL_409CB0_DAT_C33910_VA >>> 0;
}
export function renderShell409cb0DatC7b640Va() {
  return RENDER_SHELL_409CB0_DAT_C7B640_VA >>> 0;
}
export function renderShell409cb0DatC7b644Va() {
  return RENDER_SHELL_409CB0_DAT_C7B644_VA >>> 0;
}
export function renderShell409cb0Deg2radVa() {
  return RENDER_SHELL_409CB0_DEG2RAD_VA >>> 0;
}
export function renderShell409cb0CamXOff() {
  return RENDER_SHELL_409CB0_CAM_X_OFF >>> 0;
}
export function renderShell409cb0CamYOff() {
  return RENDER_SHELL_409CB0_CAM_Y_OFF >>> 0;
}

/* ===========================================================================
 * ABI v26 (a) — opaque_call_0040c550 continuation chain (VA 0x0040c550)
 *
 * Read straight off the PE register trace rather than off the C++ peel:
 *   esi = dest (ECX)   edi = src[4] control   ebx = src[0] object
 * The entry stores zero both dest words, so a reader is tempted to fold the
 * later `mov ecx,[esi+4]` to 0. That load happens AFTER the indirect call at
 * 0x0040c578, so it is modelled as a recaptured input.
 * =========================================================================== */

/** G157 entry plan: src control null → ZERO_ONLY, else ADDREF. */
export function renderShell40c550EntryPlan(srcCtrl) {
  return renderShell40c550SrcControlNull(srcCtrl)
    ? RENDER_SHELL_40C550_PLAN_ZERO_ONLY
    : RENDER_SHELL_40C550_PLAN_ADDREF;
}

/** G158 resume plan after the src vt+0x04 sample (`test al,al` = low byte). */
export function renderShell40c550ResumePlan(addrefResult, destCtrlAfter) {
  if ((asU32(addrefResult) & 0xff) === 0) return RENDER_SHELL_40C550_RESUME_ABORT;
  return asU32(destCtrlAfter) !== 0
    ? RENDER_SHELL_40C550_RESUME_RELEASE
    : RENDER_SHELL_40C550_RESUME_ASSIGN;
}

/** G159 hook gate after the dest vt+0x0c sample. */
export function renderShell40c550HookNeeded(releaseResult, hookPtr) {
  if ((asU32(releaseResult) & 0xff) === 0) return false;
  return asU32(hookPtr) !== 0;
}

/** P174 cdecl hook arg pushed at VA 0x0040c599. */
export function renderShell40c550HookArg(destPtr) {
  return asU32(destPtr);
}

/**
 * P175 complete memory effects of 40c550 given three sampled host results.
 * @param {DataView} view
 * @returns {number} the resume plan actually reached (ZERO_ONLY when no call)
 */
export function renderShell40c550Apply(view, destPtr, args) {
  renderShell40c550ZeroDest(view, destPtr);
  if (renderShell40c550EntryPlan(args.srcCtrl) === RENDER_SHELL_40C550_PLAN_ZERO_ONLY) {
    return RENDER_SHELL_40C550_PLAN_ZERO_ONLY;
  }
  const resume = renderShell40c550ResumePlan(args.addrefResult, args.destCtrlAfter);
  if (resume === RENDER_SHELL_40C550_RESUME_ABORT) return resume;
  renderShell40c550Assign(view, destPtr, args.srcObj, args.srcCtrl);
  return resume;
}

/** G160 pure-complete only when the src control is null. */
export function renderShell40c550PureComplete(srcCtrl) {
  return renderShell40c550EntryPlan(srcCtrl) === RENDER_SHELL_40C550_PLAN_ZERO_ONLY;
}

export function renderShell40c550SrcVtAddrefOff() {
  return RENDER_SHELL_40C550_SRC_VT_ADDREF_OFF >>> 0;
}
export function renderShell40c550DestVtReleaseOff() {
  return RENDER_SHELL_40C550_DEST_VT_RELEASE_OFF >>> 0;
}
export function renderShell40c550HookDatVa() {
  return RENDER_SHELL_40C550_HOOK_DAT_VA >>> 0;
}

/* ===========================================================================
 * ABI v26 (b) — opaque_call_00408590 recapture-correct two-phase plan
 * =========================================================================== */

/** G161 entry plan (phase 1). */
export function renderShell408590EntryPlan(spriteObj, spriteA0, spriteA1, layerA0, layerA1) {
  if (!renderShell408590SpritePresent(spriteObj)) {
    return RENDER_SHELL_408590_ENTRY_TAIL_COPY;
  }
  return renderShell408590PairAEqual(spriteA0, spriteA1, layerA0, layerA1)
    ? RENDER_SHELL_408590_ENTRY_CHECK_B
    : RENDER_SHELL_408590_ENTRY_PAIR_A;
}

/** G162 post-A plan (phase 2) on the sprite pointer recaptured at 0x004085de. */
export function renderShell408590PostAPlan(spriteAfter, spriteB0, spriteB1, layerB0, layerB1) {
  if (asU32(spriteAfter) === 0) return RENDER_SHELL_408590_POST_A_TAIL_COPY;
  return renderShell408590PairBEqual(spriteB0, spriteB1, layerB0, layerB1)
    ? RENDER_SHELL_408590_POST_A_TAIL_COPY
    : RENDER_SHELL_408590_POST_A_PAIR_B;
}

/** G163 duplicated pair-A compare at VA 0x004085c2 (same operands, no store). */
export function renderShell408590PairARecheck(spriteA0, spriteA1, layerA0, layerA1) {
  return asU32(layerA0) === asU32(spriteA0) && asU32(layerA1) === asU32(spriteA1);
}

/** G164 duplicated pair-B compare at VA 0x004085fc. */
export function renderShell408590PairBRecheck(spriteB0, spriteB1, layerB0, layerB1) {
  return asU32(layerB0) === asU32(spriteB0) && asU32(layerB1) === asU32(spriteB1);
}

/**
 * P177 complete memory effects of the 408590 body.
 * `spritePre` is what the pair-A cache store targets ([ebp-8]); `spriteAfter`
 * is the reload at VA 0x004085de that pair B reads and writes.
 * @param {DataView} view
 * @returns {number} outPtr
 */
export function renderShell408590Apply(view, outPtr, a) {
  const entry = renderShell408590EntryPlan(
    a.spritePre, a.spriteA0, a.spriteA1, a.layerA0, a.layerA1,
  );
  let spriteForB = asU32(a.spritePre);
  if (entry === RENDER_SHELL_408590_ENTRY_PAIR_A) {
    renderShell408590ApplyPairACache(view, a.spritePre, a.layerA0, a.layerA1);
    spriteForB = asU32(a.spriteAfter);
  }
  if (entry !== RENDER_SHELL_408590_ENTRY_TAIL_COPY) {
    const post = renderShell408590PostAPlan(
      spriteForB, a.spriteB0, a.spriteB1, a.layerB0, a.layerB1,
    );
    if (post === RENDER_SHELL_408590_POST_A_PAIR_B) {
      renderShell408590ApplyPairBCache(view, spriteForB, a.layerB0, a.layerB1);
    }
  }
  renderShell40c550Apply(view, outPtr, a);
  return asU32(outPtr);
}

/* ===========================================================================
 * ABI v26 (c) — 0x00af0917 = IAT thunk to CRT floor
 *
 * The PE widens float32 → double exactly, calls floor, then narrows with
 * `fstp dword`. floor of a float32 is always exactly representable as a
 * float32, so the narrowing never rounds. Math.floor on the already-f32
 * value is therefore the same function, including -0 and NaN.
 * =========================================================================== */

/** P178 (float)floor((double)v). */
export function renderShellAf0917Floor(value) {
  return f32(Math.floor(f32(value)));
}

/** G165 pure-complete: leaf CRT rounding primitive. */
export function renderShellAf0917PureComplete() {
  return true;
}

/** P179 IAT slot VA behind the 0x00af0917 thunk. */
export function renderShellAf0917IatVa() {
  return RENDER_SHELL_AF0917_IAT_VA >>> 0;
}

/** P180 stage-overlay draw position with the floor performed in-model. */
export function renderShellStageOverlayDrawPosPure(
  scrollXc78dc4,
  scrollYc78edc,
  posX,
  posY,
  scale,
  cameraX,
  cameraY,
) {
  const preX = renderShellStageOverlayPreFloorX(scrollXc78dc4, posX, scale);
  const preY = renderShellStageOverlayPreFloorY(scrollYc78edc, posY, scale);
  return renderShellStageOverlayDrawPos(
    cameraX,
    cameraY,
    renderShellAf0917Floor(preX),
    renderShellAf0917Floor(preY),
    scale,
  );
}

/* ===========================================================================
 * ABI v27 — mode-44 / GetRoomByIdx cluster
 *
 * Derived from the register trace, not from the C++ peel. The two things the
 * PE does that a structured reading loses:
 *   1. `mov eax,[ebx]` appears twice in 0x74f690 — at 0x74f6ad (before the
 *      call at 0x74f6cf) and at 0x74f6f0 (after it), on the same `this`.
 *   2. `mov edx,[eax]` at 0x740c9a is a POINTER load; the +8 and +0x10 tests
 *      that follow go through it, not through the slot.
 * =========================================================================== */

/* ===========================================================================
 * ABI v28 — RoomDescriptor::constructor @ 0x006ef590
 *
 * Written from the store list in address order, not from the C++ peel. The
 * PE writes the object in three passes separated by host calls, and the
 * +0x1c..+0x38 run lands at the very end (VA 0x006ef805) even though it sits
 * in the middle of the object — replaying it in offset order would be wrong
 * if anything in between touched those bytes, so the order is preserved.
 * =========================================================================== */

function storeDwordRun(view, base, off, count, value) {
  for (let i = 0; i < count; i += 1) {
    view.setUint32((base + off + i * 4) >>> 0, value >>> 0, true);
  }
}

/** P188 early scalar block (VA 0x006ef5be…0x006ef626). */
export function renderShell6ef590InitScalars(view, objPtr) {
  const o = asU32(objPtr);
  if (o === 0 || !view) return;
  storeDwordRun(view, o, RENDER_SHELL_6EF590_NEG_HEAD_OFF, RENDER_SHELL_6EF590_NEG_HEAD_COUNT, 0xffffffff);
  storeDwordRun(view, o, RENDER_SHELL_6EF590_ZERO_A_OFF, RENDER_SHELL_6EF590_ZERO_A_COUNT, 0);
  storeDwordRun(view, o, RENDER_SHELL_6EF590_ZERO_B_OFF, RENDER_SHELL_6EF590_ZERO_B_COUNT, 0);
  storeDwordRun(view, o, RENDER_SHELL_6EF590_ZERO_C_OFF, RENDER_SHELL_6EF590_ZERO_C_COUNT, 0);
  view.setUint32(o + RENDER_SHELL_6EF590_GRID_BEGIN_OFF, 0, true);
  view.setUint32(o + RENDER_SHELL_6EF590_GRID_END_OFF, 0, true);
  view.setUint32(o + RENDER_SHELL_6EF590_GRID_CAP_OFF, 0, true);
}

/** P189 aligned grid base + the free-back pointer at base-4. */
export function renderShell6ef590AlignGrid(view, rawPtr) {
  const raw = asU32(rawPtr);
  if (raw === 0) return 0;
  const base = ((raw + RENDER_SHELL_6EF590_GRID_ALIGN_BIAS) & ~(RENDER_SHELL_6EF590_GRID_ALIGN - 1)) >>> 0;
  if (view) view.setUint32((base - 4) >>> 0, raw, true);
  return base;
}

/** P190 one 0x20-byte grid element; +0x19..+0x1b stay untouched. */
export function renderShell6ef590GridElemInit(view, elemPtr) {
  const e = asU32(elemPtr);
  if (!view) return;
  view.setUint32(e + 0x00, 0, true);
  view.setUint32(e + 0x04, 0, true);
  view.setUint32(e + 0x08, 0, true);
  view.setUint32(e + 0x0c, 0, true);
  view.setUint32(e + 0x10, RENDER_SHELL_6EF590_GRID_MAGIC >>> 0, true);
  view.setUint32(e + 0x14, 0, true);
  view.setUint8(e + 0x18, 0);
  view.setUint32(e + 0x1c, RENDER_SHELL_6EF590_GRID_MAGIC >>> 0, true);
}

/** P191 fill all 0x1c0 elements. */
export function renderShell6ef590GridFill(view, basePtr) {
  const b = asU32(basePtr);
  if (b === 0 || !view) return;
  for (let n = 0; n < RENDER_SHELL_6EF590_GRID_COUNT; n += 1) {
    renderShell6ef590GridElemInit(view, b + n * RENDER_SHELL_6EF590_GRID_ELEM);
  }
}

/** P192 tree sentinel: self-links + the 0x0101 color/isnil word. */
export function renderShell6ef590MapNodeInit(view, nodePtr) {
  const n = asU32(nodePtr);
  if (n === 0 || !view) return;
  view.setUint32(n + RENDER_SHELL_MAP_LEFT_OFF, n, true);
  view.setUint32(n + RENDER_SHELL_MAP_PARENT_OFF, n, true);
  view.setUint32(n + RENDER_SHELL_MAP_RIGHT_OFF, n, true);
  view.setUint8(n + RENDER_SHELL_MAP_COLOR_OFF, RENDER_SHELL_6EF590_NODE_FLAGS_WORD & 0xff);
  view.setUint8(n + RENDER_SHELL_MAP_ISNIL_OFF, (RENDER_SHELL_6EF590_NODE_FLAGS_WORD >>> 8) & 0xff);
}

/** P193 exact MSVC signed divide-by-0x78 (imul 0x88888889; add; sar 6; +sign). */
export function renderShell6ef590VecCapacity(begin, end) {
  const span = asI32(asU32(end) - asU32(begin));
  const magic = asI32(RENDER_SHELL_6EF590_VEC_DIV_MAGIC);
  const prod = BigInt(span) * BigInt(magic);
  let hi = Number(BigInt.asIntN(32, prod >> 32n));
  hi = asI32(hi + span);
  hi >>= RENDER_SHELL_6EF590_VEC_DIV_SHIFT;
  return asI32(hi + (hi >>> 31));
}

/** G169 unsigned `cmp cap, want; jae skip`. */
export function renderShell6ef590ReserveNeeded(begin, end, want) {
  return asU32(renderShell6ef590VecCapacity(begin, end)) < asU32(want);
}

/** G170 destroy-loop trip count from the RECAPTURED range; -1 = runaway. */
export function renderShell6ef590ClearLoopCount(begin, end) {
  const b = asU32(begin);
  const e = asU32(end);
  if (b === e) return 0;
  const span = asI32(e - b);
  if (span < 0 || span % RENDER_SHELL_6EF590_ENTITY_SAVE_SIZE !== 0) return -1;
  return span / RENDER_SHELL_6EF590_ENTITY_SAVE_SIZE;
}

/** P194 late -1 fill of +0x1c..+0x38. */
export function renderShell6ef590LateNegFill(view, objPtr) {
  const o = asU32(objPtr);
  if (o === 0 || !view) return;
  storeDwordRun(view, o, RENDER_SHELL_6EF590_NEG_LATE_OFF, RENDER_SHELL_6EF590_NEG_LATE_COUNT, 0xffffffff);
}

/** P195 second grid pass; the PE reloads [this+0x68] each iteration. */
export function renderShell6ef590GridSecondPass(view, objPtr) {
  const o = asU32(objPtr);
  if (o === 0 || !view) return;
  for (let k = 0; k < RENDER_SHELL_6EF590_GRID_BYTES; k += RENDER_SHELL_6EF590_GRID_ELEM) {
    const base = view.getUint32(o + RENDER_SHELL_6EF590_GRID_BEGIN_OFF, true);
    if (base === 0) return;
    view.setUint32((base + k) >>> 0, 0, true);
  }
}

/** P196 movups 16 zero bytes at +0x94; the +0xa4 hole is left alone. */
export function renderShell6ef590TailZero(view, objPtr) {
  const o = asU32(objPtr);
  if (o === 0 || !view) return;
  for (let i = 0; i < RENDER_SHELL_6EF590_TAIL_ZERO_LEN; i += 1) {
    view.setUint8(o + RENDER_SHELL_6EF590_TAIL_ZERO_OFF + i, 0);
  }
}

/**
 * P197 whole body given the sampled host results.
 * @param {DataView} view
 * @returns {{ obj: number, dtorCalls: number }}
 */
export function renderShell6ef590Apply(view, objPtr, a) {
  const o = asU32(objPtr);
  let dtorCalls = 0;
  if (o === 0 || !view) return { obj: 0, dtorCalls: 0 };
  renderShell6ef590InitScalars(view, o);
  const gridBase = renderShell6ef590AlignGrid(view, a.gridRaw);
  if (gridBase === 0) return { obj: o, dtorCalls: 0 };
  view.setUint32(o + RENDER_SHELL_6EF590_GRID_BEGIN_OFF, gridBase, true);
  view.setUint32(o + RENDER_SHELL_6EF590_GRID_CAP_OFF, (gridBase + RENDER_SHELL_6EF590_GRID_BYTES) >>> 0, true);
  renderShell6ef590GridFill(view, gridBase);
  view.setUint32(o + RENDER_SHELL_6EF590_GRID_END_OFF, (gridBase + RENDER_SHELL_6EF590_GRID_BYTES) >>> 0, true);
  storeDwordRun(view, o, RENDER_SHELL_6EF590_VEC_A_OFF, 3, 0);
  view.setUint32(o + RENDER_SHELL_6EF590_MAP_OFF, 0, true);
  view.setUint32(o + RENDER_SHELL_6EF590_MAP_SIZE_OFF, 0, true);
  renderShell6ef590MapNodeInit(view, a.nodeRaw);
  view.setUint32(o + RENDER_SHELL_6EF590_MAP_OFF, asU32(a.nodeRaw), true);
  storeDwordRun(view, o, RENDER_SHELL_6EF590_VEC_B_OFF, 3, 0);
  view.setUint8(o + RENDER_SHELL_6EF590_WORD_A_OFF, 0xff);
  view.setUint8(o + RENDER_SHELL_6EF590_WORD_A_OFF + 1, 0xff);
  view.setUint8(o + RENDER_SHELL_6EF590_WORD_B_OFF, 0xff);
  view.setUint8(o + RENDER_SHELL_6EF590_WORD_B_OFF + 1, 0xff);
  view.setUint32(o + RENDER_SHELL_6EF590_TAIL_ZERO_DWORD_OFF, 0, true);
  view.setUint32(o + RENDER_SHELL_6EF590_TAIL_NEG_DWORD_OFF, 0xffffffff, true);
  const ca = renderShell6ef590ClearLoopCount(a.vecABeginAfter, a.vecAEndAfter);
  if (ca > 0) dtorCalls += ca;
  view.setUint32(o + RENDER_SHELL_6EF590_VEC_A_OFF + 4, asU32(a.vecABeginAfter), true);
  const cb = renderShell6ef590ClearLoopCount(a.vecBBeginAfter, a.vecBEndAfter);
  if (cb > 0) dtorCalls += cb;
  view.setUint32(o + RENDER_SHELL_6EF590_VEC_B_OFF + 4, asU32(a.vecBBeginAfter), true);
  const head = view.getUint32(o + RENDER_SHELL_6EF590_MAP_OFF, true);
  if (head !== 0) {
    view.setUint32(head + RENDER_SHELL_MAP_PARENT_OFF, head, true);
    view.setUint32(head + RENDER_SHELL_MAP_LEFT_OFF, head, true);
    view.setUint32(head + RENDER_SHELL_MAP_RIGHT_OFF, head, true);
  }
  view.setUint32(o + RENDER_SHELL_6EF590_MAP_SIZE_OFF, 0, true);
  renderShell6ef590LateNegFill(view, o);
  renderShell6ef590GridSecondPass(view, o);
  renderShell6ef590TailZero(view, o);
  return { obj: o, dtorCalls };
}

/** G171 not pure-complete: allocator, vector grow and tree clear stay host. */
export function renderShell6ef590PureComplete() {
  return false;
}

export function renderShell6ef590HostVa() {
  return RENDER_SHELL_6EF590_VA >>> 0;
}
export function renderShell6ef590DescSize() {
  return RENDER_SHELL_6EF590_DESC_SIZE >>> 0;
}
export function renderShell6ef590DtorHostVa() {
  return RENDER_SHELL_HOST_4D6EE0_VA >>> 0;
}
export function renderShell6ef590GrowHostVa() {
  return RENDER_SHELL_HOST_708EB0_VA >>> 0;
}
export function renderShell6ef590TreeClearHostVa() {
  return RENDER_SHELL_HOST_424540_VA >>> 0;
}
export function renderShell6ef590FailIatVa() {
  return RENDER_SHELL_6EF590_FAIL_IAT_VA >>> 0;
}
export function renderShell6ef590HoleOff() {
  return RENDER_SHELL_6EF590_HOLE_OFF >>> 0;
}
export function renderShell6ef590HoleLen() {
  return RENDER_SHELL_6EF590_HOLE_LEN >>> 0;
}

/** G166 only the GETROOM plan crosses the host call before the stage reload. */
export function renderShell74f690StageReloadNeeded(entryPlan) {
  return asI32(entryPlan) === RENDER_SHELL_74F690_PLAN_GETROOM;
}

/** P181 hash-bound VA of the stage reload. */
export function renderShell74f690StageReloadVa() {
  return RENDER_SHELL_74F690_STAGE_RELOAD_VA >>> 0;
}

/**
 * P182 resolve with split pre/post stage snapshots and in-model float reads.
 * @param {DataView|null|undefined} view linear memory for the `this` object
 */
export function renderShell74f690ResolvePost(view, gamePtr, a) {
  const entry = renderShell74f690EntryPlan(
    a.mode26584, a.roomIdx, a.stageEntry, a.flag183a0,
  );
  if (entry === RENDER_SHELL_74F690_PLAN_TYPE4) return asU32(a.stageType4);
  if (entry === RENDER_SHELL_74F690_PLAN_CONST4) {
    return RENDER_SHELL_74F690_CONST_TYPE4 >>> 0;
  }
  const room = renderShell74f690FinalRoomIdx(
    a.roomIdx, a.flag183a0, a.roomDescDword0, a.roomDescField10Nz,
  );
  const stageDispatch = renderShell74f690StageReloadNeeded(entry)
    ? a.stageAfter
    : a.stageEntry;
  const stagePlan = renderShell74f690StagePlan(stageDispatch);
  if (stagePlan === RENDER_SHELL_74F690_STAGE_TYPE4) return asU32(a.stageType4);
  let fa = a.f183b0;
  let fb = a.f18654;
  const base = asU32(gamePtr);
  if (base !== 0 && view) {
    fa = view.getFloat32(base + RENDER_SHELL_74F690_FLOAT_A_OFF + asU32(room) * 4, true);
    fb = view.getFloat32(base + RENDER_SHELL_74F690_FLOAT_B_OFF + asU32(room) * 4, true);
  }
  if (stagePlan === RENDER_SHELL_74F690_STAGE_WOMB) {
    const dist = renderShell74f690WombDistance(room, a.field14);
    if (renderShell74f690WombNear(dist)) return RENDER_SHELL_74F690_CONST_TYPE4 >>> 0;
    return renderShell74f690FloatTableType(fa, fb, 1);
  }
  return renderShell74f690FloatTableType(fa, fb, 0);
}

/** G167 once-init entry gate (signed compare against the TLS epoch). */
export function renderShell740bc0OnceInitPlan(guardVal, tlsEpoch) {
  return renderShell740bc0OnceInitNeeded(guardVal, tlsEpoch)
    ? RENDER_SHELL_740BC0_ONCE_PLAN_HEADER
    : RENDER_SHELL_740BC0_ONCE_PLAN_SKIP;
}

/** G168 once-init resume on the guard RE-READ after the host header call. */
export function renderShell740bc0OnceInitResume(guardAfter) {
  return asI32(guardAfter) === RENDER_SHELL_740BC0_ONCE_GUARD_UNINIT
    ? RENDER_SHELL_740BC0_ONCE_RESUME_CONSTRUCT
    : RENDER_SHELL_740BC0_ONCE_RESUME_SKIP;
}

export function renderShell740bc0InitHeaderVa() {
  return RENDER_SHELL_HOST_AEF29D_VA >>> 0;
}
export function renderShell740bc0InitFooterVa() {
  return RENDER_SHELL_HOST_AEF253_VA >>> 0;
}
export function renderShell740bc0CtorVa() {
  return RENDER_SHELL_HOST_6EF590_VA >>> 0;
}
export function renderShell740bc0AtexitVa() {
  return RENDER_SHELL_HOST_ATEXIT_VA >>> 0;
}

/** P184 the slot's pointer field offset. */
export function renderShell740bc0WalkEntryPtrOff() {
  return RENDER_SHELL_740BC0_WALK_ENTRY_PTR_OFF >>> 0;
}

/**
 * P185 memory-driven -101 walk with the real two-level dereference.
 * @param {DataView|null|undefined} view
 * @returns {number} Game-relative offset of the match, or WALK_NO_MATCH
 */
export function renderShell740bc0WalkFind(view, gamePtr, roomCount) {
  const base = asU32(gamePtr);
  const count = asI32(roomCount);
  if (base === 0 || count <= 0 || !view) return RENDER_SHELL_740BC0_WALK_NO_MATCH;
  let entry = (base + RENDER_SHELL_740BC0_WALK_START_OFF) >>> 0;
  for (let n = 0; n < count; n += 1) {
    const kind = view.getUint32((entry + RENDER_SHELL_740BC0_WALK_KIND_OFF) >>> 0, true);
    if (kind === 0) {
      const slotPtr = view.getUint32(
        (entry + RENDER_SHELL_740BC0_WALK_ENTRY_PTR_OFF) >>> 0, true,
      );
      if (slotPtr !== 0) {
        const t = view.getInt32((slotPtr + RENDER_SHELL_740BC0_WALK_PTR_TYPE_OFF) >>> 0, true);
        const v = view.getInt32((slotPtr + RENDER_SHELL_740BC0_WALK_PTR_VAR_OFF) >>> 0, true);
        if (renderShell740bc0WalkMatch(0, t, v)) {
          return ((entry + RENDER_SHELL_740BC0_WALK_RESULT_DELTA) - base) >>> 0;
        }
      }
    }
    entry = (entry + RENDER_SHELL_740BC0_WALK_STRIDE) >>> 0;
  }
  return RENDER_SHELL_740BC0_WALK_NO_MATCH;
}

/** P186 the -100 recursion's idx argument. */
export function renderShell740bc0CurrentRecurseIdx(currentIdx) {
  return asI32(currentIdx);
}

/**
 * P187 bounded recursion driver; every entry uses its own recaptured sample.
 * @param {DataView|null|undefined} view
 * @returns {{ kind: number, off: number, steps: number }}
 */
export function renderShell740bc0ResolveChain(view, gamePtr, idx, seq, roomCount) {
  let steps = 0;
  let kind = RENDER_SHELL_740BC0_KIND_EMPTY;
  let off = 0;
  let resolved = false;
  let curIdxArg = asI32(idx);
  const limit = Math.min(seq.length, RENDER_SHELL_740BC0_MAX_RECURSE_DEPTH);
  while (steps < limit) {
    const { dimEff, currentIdx, slot } = seq[steps];
    const plan = renderShell740bc0EntryPlan(dimEff, curIdxArg, currentIdx);
    steps += 1;
    if (plan === RENDER_SHELL_740BC0_PLAN_RECURSE_CURRENT) {
      curIdxArg = renderShell740bc0CurrentRecurseIdx(currentIdx);
      continue;
    }
    if (plan === RENDER_SHELL_740BC0_PLAN_RECURSE_SPECIAL) {
      curIdxArg = renderShell740bc0SpecialRecurseIdx();
      continue;
    }
    if (plan === RENDER_SHELL_740BC0_PLAN_WALK) {
      off = renderShell740bc0WalkFind(view, gamePtr, roomCount);
      kind = off === RENDER_SHELL_740BC0_WALK_NO_MATCH
        ? RENDER_SHELL_740BC0_KIND_EMPTY
        : RENDER_SHELL_740BC0_KIND_GAME_OFF;
      resolved = true;
      break;
    }
    kind = renderShell740bc0ResolveKind(dimEff, curIdxArg, currentIdx, slot);
    off = renderShell740bc0ResolveGameOff(dimEff, curIdxArg, currentIdx, slot);
    resolved = true;
    break;
  }
  if (!resolved) {
    kind = RENDER_SHELL_740BC0_KIND_HOST;
    off = 0;
  }
  return { kind, off: off >>> 0, steps };
}

/* ---- ABI v51: 0xa155f0 inverse lerp (t-y0)/(y1-y0) (NARROWED) ----
   Body 0xa155f0..0xa1563e: `ucomiss xmm0,xmm1` (0xa155f6) / spill t
   (0xa155f9) / spill y1 (0xa155fe) / `lahf` (0xa15603) / spill y0
   (0xa15604) / `test ah,0x44` (0xa15609) / `jp 0xa1562c` (0xa1560c)
   / [logger arm: push 0xb81bd8 / push 0x10 / call 0xa112c0 / reload
   spills] / `subss xmm2,xmm0` (0xa1562c, num = t-y0) / `subss
   xmm1,xmm0` (0xa15630, den = y1-y0) / `divss xmm2,xmm1` (0xa15634)
   / `movaps xmm0,xmm2` (0xa15638) / `ret` (0xa1563e). xmm0=y0,
   xmm1=y1, xmm2=t; xmm0 out. Both arms join at 0xa1562c — the
   division runs UNCONDITIONALLY. The ucomiss/lahf/test-ah-0x44/jp
   gate fires the logger arm iff ORDERED EQUALITY (ucomiss ZF=1 &
   PF=0: AH&0x44 = 0x40, odd parity -> test PF=0 -> jp NOT taken);
   NaN (0x44, even -> jp) and ordered inequality (0x00, even -> jp)
   skip the logger. divss has NO guard: den==0 -> +/-inf, 0/0 -> NaN.
   2 direct rel32 callers 0x66aaa6 / 0x78a3e0. NARROWED — residual
   host: 1 E8 to 0xa112c0 + 2 pushes + 3 dword spills.
   NEXT_VA 0x00a15640 (next leaf, 40 direct callers). */
export const RENDER_SHELL_A155F0_HOST_VA = 0x00a155f0;
export const RENDER_SHELL_A155F0_END_VA = 0x00a1563e;
export const RENDER_SHELL_A155F0_NEXT_VA = 0x00a15640;
export const RENDER_SHELL_A155F0_CALLER_COUNT = 2;
export const RENDER_SHELL_A155F0_CALLER_FIRST_VA = 0x0066aaa6;
export const RENDER_SHELL_A155F0_CALLER_LAST_VA = 0x0078a3e0;
export const RENDER_SHELL_A155F0_LOGGER_VA = 0x00a112c0;
export const RENDER_SHELL_A155F0_LOG_MSG_VA = 0x00b81bd8;
export const RENDER_SHELL_A155F0_LOG_MSG_LEN = 0x10;
export const RENDER_SHELL_A155F0_SPILL_COUNT = 3;

export function renderShellA155f0OrderedEqualGate(y0, y1) {
  const a = f32(y0);
  const b = f32(y1);
  /* ucomiss xmm0,xmm1 / lahf / test ah,0x44 / jp 0xa1562c: the
     logger arm is reached iff AH&0x44 == 0x40 (odd parity -> test
     PF=0): ordered equality only. NaN and ordered inequality skip. */
  return a === b ? 1 : 0;
}
export function renderShellA155f0InverseLerp(y0, y1, t) {
  const a = f32(y0);
  const b = f32(y1);
  const tt = f32(t);
  /* 0xa1562c subss xmm2,xmm0 (num = t-y0, f32)
     0xa15630 subss xmm1,xmm0 (den = y1-y0, f32)
     0xa15634 divss xmm2,xmm1 (res = num/den, f32, no guard)
     0xa15638 movaps xmm0,xmm2 / ret — unconditional on both arms */
  const num = f32(tt - a);
  const den = f32(b - a);
  return f32(num / den);
}
export function renderShellA155f0HostVa() {
  return RENDER_SHELL_A155F0_HOST_VA >>> 0;
}
export function renderShellA155f0EndVa() {
  return RENDER_SHELL_A155F0_END_VA >>> 0;
}
export function renderShellA155f0NextVa() {
  return RENDER_SHELL_A155F0_NEXT_VA >>> 0;
}
export function renderShellA155f0CallerCount() {
  return RENDER_SHELL_A155F0_CALLER_COUNT >>> 0;
}
export function renderShellA155f0CallerFirstVa() {
  return RENDER_SHELL_A155F0_CALLER_FIRST_VA >>> 0;
}
export function renderShellA155f0CallerLastVa() {
  return RENDER_SHELL_A155F0_CALLER_LAST_VA >>> 0;
}
export function renderShellA155f0LoggerVa() {
  return RENDER_SHELL_A155F0_LOGGER_VA >>> 0;
}
export function renderShellA155f0LogMsgVa() {
  return RENDER_SHELL_A155F0_LOG_MSG_VA >>> 0;
}
export function renderShellA155f0LogMsgLen() {
  return RENDER_SHELL_A155F0_LOG_MSG_LEN >>> 0;
}
export function renderShellA155f0SpillCount() {
  return RENDER_SHELL_A155F0_SPILL_COUNT >>> 0;
}

/* ---- ABI v52: 0xa15640 nested lerp (fraction + clamp01 + apply)
   (NARROWED) ----
   Body 0xa15640..0xa156c4: `movaps xmm4,xmm1` (0xa15646) / spill base
   (0xa15649) / `ucomiss xmm4,xmm2` (0xa1564e, y1 vs y0) / `mov bl,cl`
   (0xa15652) / spills y0/xmm4(y1)/t / `lahf` (0xa15661) / `test
   ah,0x44` (0xa15667) / `jp 0xa1568f` (0xa1566a) / [logger arm: push
   0xb81bd8 / push 0x10 / call 0xa112c0 / reload spills] / `subss
   xmm1,xmm4` (0xa1568f, p1 = t-y1) / `subss xmm2,xmm4` (0xa15693,
   p2 = y0-y1) / `divss xmm1,xmm2` (0xa15697, f = p1/p2, no guard) /
   `test bl,bl` (0xa1569b) / `je` (0xa1569d, clamp iff LOW byte
   nonzero) / `maxss xmm1,[0xba9fe4]` (0xa1569f) / `minss
   xmm1,[0xbaa454]` (0xa156a7) / `movss xmm0,[ebp+8]` (0xa156af,
   target) / `subss xmm0,xmm3` (0xa156b4, d = target-base) / `mulss
   xmm0,xmm1` (0xa156b9, m = d*f) / `addss xmm0,xmm3` (0xa156bd,
   r = base+m) / `ret` (0xa156c4). xmm0=t, xmm1=y1, xmm2=y0, xmm3=base,
   cl=clamp flag, [ebp+8]=target; xmm0 out. Both arms join at 0xa1568f
   — the division runs UNCONDITIONALLY. The ucomiss/lahf/test-ah-0x44/
   jp gate fires the logger arm iff ORDERED EQUALITY of y1 vs y0
   (identical to FUN_00a155f0, same logger msg 0xb81bd8 len 0x10);
   NaN (0x44) and ordered inequality (0x00) skip. divss has NO guard:
   p2==0 -> +/-inf, 0/0 -> NaN. Clamp reuses the v48 clamp01 .rdata
   constants (lo 0xba9fe4 +0.0f / hi 0xbaa454 1.0f); maxss/minss return
   the SECOND operand on unordered/equal (NaN -> +0.0f, -0.0f ->
   +0.0f). Final apply base + (target-base)*f, per-step f32 rounding.
   40 direct rel32 callers 0x5b962f..0x7c87a6. NARROWED — residual
   host: 1 E8 to 0xa112c0 + 2 pushes + 4 dword spills.
   NEXT_VA 0x00a156d0 (import thunk push ecx / call [0xb18274] / ret
   @0xa156d7, HOST; then real body 0xa156e0..0xa1572d, 2 E8 to
   0xaef15c). */
export const RENDER_SHELL_A15640_HOST_VA = 0x00a15640;
export const RENDER_SHELL_A15640_END_VA = 0x00a156c4;
export const RENDER_SHELL_A15640_NEXT_VA = 0x00a156d0;
export const RENDER_SHELL_A15640_CALLER_COUNT = 40;
export const RENDER_SHELL_A15640_CALLER_FIRST_VA = 0x005b962f;
export const RENDER_SHELL_A15640_CALLER_LAST_VA = 0x007c87a6;
export const RENDER_SHELL_A15640_LOGGER_VA = 0x00a112c0;
export const RENDER_SHELL_A15640_LOG_MSG_VA = 0x00b81bd8;
export const RENDER_SHELL_A15640_LOG_MSG_LEN = 0x10;
export const RENDER_SHELL_A15640_SPILL_COUNT = 4;
export const RENDER_SHELL_A15640_LO_VA = 0x00ba9fe4;
export const RENDER_SHELL_A15640_LO_BITS = 0x00000000;
export const RENDER_SHELL_A15640_HI_VA = 0x00baa454;
export const RENDER_SHELL_A15640_HI_BITS = 0x3f800000;
export const RENDER_SHELL_A15640_CLAMP_OFF = 0x0;

export function renderShellA15640OrderedEqualGate(y1, y0) {
  const a = f32(y1);
  const b = f32(y0);
  /* ucomiss xmm4,xmm2 / lahf / test ah,0x44 / jp 0xa1568f: the
     logger arm is reached iff AH&0x44 == 0x40 (odd parity -> test
     PF=0): ordered equality only. NaN and ordered inequality skip. */
  return a === b ? 1 : 0;
}
export function renderShellA15640Fraction(t, y1, y0, clampW) {
  const a = f32(t);
  const b = f32(y1);
  const c = f32(y0);
  /* Both arms join at 0xa1568f — the division runs UNCONDITIONALLY.
     0xa1568f subss xmm1,xmm4 (p1 = t-y1, f32)
     0xa15693 subss xmm2,xmm4 (p2 = y0-y1, f32)
     0xa15697 divss xmm1,xmm2 (f = p1/p2, f32, no guard: p2==0 ->
       +/-inf, 0/0 -> NaN) */
  let f = f32(f32(a - b) / f32(c - b));
  /* 0xa1569b test bl,bl / 0xa1569d je — clamp gated on the LOW byte
     of the flag. */
  if ((asU32(clampW) & 0xff) !== 0) {
    /* 0xa1569f maxss xmm1,[0xba9fe4] (+0.0f); 0xa156a7 minss
       xmm1,[0xbaa454] (1.0f) — second-operand NaN/equal semantics
       (v48 clamp01): NaN f -> +0.0f, -0.0f -> +0.0f. */
    f = sseMinss(sseMaxss(f, f32FromBits(RENDER_SHELL_A15640_LO_BITS)),
                 f32FromBits(RENDER_SHELL_A15640_HI_BITS));
  }
  return f;
}
export function renderShellA15640ApplyLerp(base, target, f) {
  const a = f32(base);
  const b = f32(target);
  const c = f32(f);
  /* 0xa156b4 subss xmm0,xmm3 (d = target-base, f32)
     0xa156b9 mulss xmm0,xmm1 (m = d*f, f32)
     0xa156bd addss xmm0,xmm3 (r = base+m, f32) */
  const d = f32(b - a);
  const m = f32(d * c);
  return f32(a + m);
}
export function renderShellA15640HostVa() {
  return RENDER_SHELL_A15640_HOST_VA >>> 0;
}
export function renderShellA15640EndVa() {
  return RENDER_SHELL_A15640_END_VA >>> 0;
}
export function renderShellA15640NextVa() {
  return RENDER_SHELL_A15640_NEXT_VA >>> 0;
}
export function renderShellA15640CallerCount() {
  return RENDER_SHELL_A15640_CALLER_COUNT >>> 0;
}
export function renderShellA15640CallerFirstVa() {
  return RENDER_SHELL_A15640_CALLER_FIRST_VA >>> 0;
}
export function renderShellA15640CallerLastVa() {
  return RENDER_SHELL_A15640_CALLER_LAST_VA >>> 0;
}
export function renderShellA15640LoggerVa() {
  return RENDER_SHELL_A15640_LOGGER_VA >>> 0;
}
export function renderShellA15640LogMsgVa() {
  return RENDER_SHELL_A15640_LOG_MSG_VA >>> 0;
}
export function renderShellA15640LogMsgLen() {
  return RENDER_SHELL_A15640_LOG_MSG_LEN >>> 0;
}
export function renderShellA15640SpillCount() {
  return RENDER_SHELL_A15640_SPILL_COUNT >>> 0;
}
export function renderShellA15640LoVa() {
  return RENDER_SHELL_A15640_LO_VA >>> 0;
}
export function renderShellA15640LoBits() {
  return RENDER_SHELL_A15640_LO_BITS >>> 0;
}
export function renderShellA15640HiVa() {
  return RENDER_SHELL_A15640_HI_VA >>> 0;
}
export function renderShellA15640HiBits() {
  return RENDER_SHELL_A15640_HI_BITS >>> 0;
}
export function renderShellA15640ClampOff() {
  return RENDER_SHELL_A15640_CLAMP_OFF >>> 0;
}

/* ---- ABI v53: 0xa156e0 CS-owning scalar deleting dtor (2 sized
   frees) — NARROWED. Body VA 0x00a156e0..0x00a1572d (thiscall, ret 4).
   this=ecx; [esi+8]=cs_ptr (heap CRITICAL_SECTION); store 1 vftable
   0xb81c0c @0xa156ea; FULL-dword gate @0xa156f0; CS arm:
   DeleteCriticalSection [0xb18274] (HOST) + sized free 0xaef15c
   (cs_ptr,0x1c) (HOST) + [esi+8]=0; and byte [esi+4],0xfe @0xa1570d;
   store 3 vftable 0xba04b4 @0xa15715; LOW-byte gate test [ebp+8],1
   @0xa15711 (sized free this,0xc iff flag&1); eax=this; ret 4.
   0xb81c0c slot 0 IS 0xa156e0 (the single address-taken hit;
   direct rel32 census 0). PE evidence: section-notes/cpu-dump/
   00a156e0.txt. ---- */
export const RENDER_SHELL_A156E0_HOST_VA = 0x00a156e0;
export const RENDER_SHELL_A156E0_END_VA = 0x00a1572d;
export const RENDER_SHELL_A156E0_NEXT_VA = 0x00a15730;
export const RENDER_SHELL_A156E0_VTABLE_VA = 0x00b81c0c;
export const RENDER_SHELL_A156E0_VTABLE_FINAL_VA = 0x00ba04b4;
export const RENDER_SHELL_A156E0_VTABLE_SLOT = 0;
export const RENDER_SHELL_A156E0_CS_OFF = 0x08;
export const RENDER_SHELL_A156E0_FLAGS_OFF = 0x04;
export const RENDER_SHELL_A156E0_CS_FREE_SIZE = 0x1c;
export const RENDER_SHELL_A156E0_SELF_FREE_SIZE = 0x0c;
export const RENDER_SHELL_A156E0_CS_DELETE_IMPORT_VA = 0x00b18274;
export const RENDER_SHELL_A156E0_FREE_VA = 0x00aef15c;
export const RENDER_SHELL_A156E0_STACK_ARGS = 1;
export const RENDER_SHELL_A156E0_ADDR_TAKEN_COUNT = 1;

export function renderShellA156e0CsFreeGate(csPtr) {
  /* test edi,edi @0xa156f0 / je 0xa1570d @0xa156f2: FULL-dword gate
     (0x100 IS set). */
  return (csPtr >>> 0) !== 0 ? 1 : 0;
}
export function renderShellA156e0SelfFreeGate(flag) {
  /* test byte [ebp+8],1 @0xa15711 / je 0xa15728 @0xa1571b: LOW-byte
     gate, bit 0 only. WIDE-driven: 0x100 -> 0, 0x1ff/0xffffffff -> 1. */
  return ((flag >>> 0) & 1) !== 0 ? 1 : 0;
}
export function renderShellA156e0FlagsClear(flags) {
  /* and byte [esi+4],0xfe @0xa1570d: LOW-BYTE store — bit 0 cleared,
     bits 1..31 preserved. */
  return ((flags >>> 0) & 0xfffffffe) >>> 0;
}
export function renderShellA156e0HostVa() {
  return RENDER_SHELL_A156E0_HOST_VA >>> 0;
}
export function renderShellA156e0EndVa() {
  return RENDER_SHELL_A156E0_END_VA >>> 0;
}
export function renderShellA156e0NextVa() {
  return RENDER_SHELL_A156E0_NEXT_VA >>> 0;
}
export function renderShellA156e0VtableVa() {
  return RENDER_SHELL_A156E0_VTABLE_VA >>> 0;
}
export function renderShellA156e0VtableFinalVa() {
  return RENDER_SHELL_A156E0_VTABLE_FINAL_VA >>> 0;
}
export function renderShellA156e0VtableSlot() {
  return RENDER_SHELL_A156E0_VTABLE_SLOT >>> 0;
}
export function renderShellA156e0CsOff() {
  return RENDER_SHELL_A156E0_CS_OFF >>> 0;
}
export function renderShellA156e0FlagsOff() {
  return RENDER_SHELL_A156E0_FLAGS_OFF >>> 0;
}
export function renderShellA156e0CsFreeSize() {
  return RENDER_SHELL_A156E0_CS_FREE_SIZE >>> 0;
}
export function renderShellA156e0SelfFreeSize() {
  return RENDER_SHELL_A156E0_SELF_FREE_SIZE >>> 0;
}
export function renderShellA156e0CsDeleteImportVa() {
  return RENDER_SHELL_A156E0_CS_DELETE_IMPORT_VA >>> 0;
}
export function renderShellA156e0FreeVa() {
  return RENDER_SHELL_A156E0_FREE_VA >>> 0;
}
export function renderShellA156e0StackArgs() {
  return RENDER_SHELL_A156E0_STACK_ARGS >>> 0;
}
export function renderShellA156e0AddrTakenCount() {
  return RENDER_SHELL_A156E0_ADDR_TAKEN_COUNT >>> 0;
}

/* ---- ABI v54: 0xa15770 vftable-slot-1 lazy CS-init getter (alloc
   arm) — NARROWED. Body VA 0x00a15770..0x00a157b7 (thiscall, plain
   ret, 0 stack args). this=ecx (edi); LOW-byte bit-0 gate
   test byte [edi+4],1 @0xa1577a / jne done: iff (flags&1)!=0 the
   alloc/init arm is skipped and the body returns 1 with NO stores.
   Fall-through arm: sized new 0xa0f4c0(0x1c) (HOST) -> ptr; if ptr!=0
   (FULL-dword test @0xa15791): [ptr+0x18]=0 (host CS DebugInfo
   pre-zero) + call [0xb18278] = InitializeCriticalSection (HOST);
   alloc-fail -> ptr=0 (free path); then movzx byte [edi+4] / bts 0 /
   mov [edi+8]=ptr / mov byte [edi+4]=al (LOW-BYTE store: bit 0 set,
   bits 8..31 preserved) — the flag set runs on the fall-through path
   ALWAYS, even when the alloc fails; BOTH paths mov al,1 (ret 1).
   0xb81c0c slot 1 IS 0xa15770 (census: 9 address-taken hits incl.
   vtable slot 0xb81c10 + 8 .text imm32 consts; 9 direct E8 callers;
   devirtualize idiom mov eax,[0xb81c10] / cmp / jne L / call
   0xa15770 / L: call eax). 0xa15730 = ZERO-edge non-deleting dtor
   (dead, NOT a slot — skipped). DELTAS vs v53 0xa156e0: slot 1, no
   vftable store, alloc 0x1c (not 2 frees), InitializeCriticalSection
   (not DeleteCriticalSection), gate reads member byte [edi+4] (not
   stack arg [ebp+8]), stack_args 0 / ret (not 1 / ret 4). PE
   evidence: section-notes/cpu-dump/00a15770.txt. ---- */
export const RENDER_SHELL_A15770_HOST_VA = 0x00a15770;
export const RENDER_SHELL_A15770_END_VA = 0x00a157b7;
export const RENDER_SHELL_A15770_NEXT_VA = 0x00a157c0;
export const RENDER_SHELL_A15770_VTABLE_VA = 0x00b81c0c;
export const RENDER_SHELL_A15770_VTABLE_SLOT = 1;
export const RENDER_SHELL_A15770_FLAGS_OFF = 0x04;
export const RENDER_SHELL_A15770_CS_PTR_OFF = 0x08;
export const RENDER_SHELL_A15770_ALLOC_SIZE = 0x1c;
export const RENDER_SHELL_A15770_ALLOC_VA = 0x00a0f4c0;
export const RENDER_SHELL_A15770_CS_INIT_IMPORT_VA = 0x00b18278;
export const RENDER_SHELL_A15770_STACK_ARGS = 0;
export const RENDER_SHELL_A15770_RET_CONST = 1;
export const RENDER_SHELL_A15770_ADDR_TAKEN_COUNT = 9;
export const RENDER_SHELL_A15770_DIRECT_CALLER_COUNT = 9;

export function renderShellA15770InitGate(flags) {
  /* test byte [edi+4],1 @0xa1577a / jne done @0xa1577e: LOW-byte bit-0
     gate — 1 iff (flags & 1) != 0 (already-initialized skip).
     WIDE-driven: 0x100 -> 0, 0x1ff/0xffffffff -> 1. */
  return ((flags >>> 0) & 1) !== 0 ? 1 : 0;
}
export function renderShellA15770FlagsSetBit0(flags) {
  /* movzx byte [edi+4] @0xa157a2 / bts eax,0 @0xa157a6 / mov byte
     [edi+4],al @0xa157ad: LOW-BYTE store — low byte |= 1, bits
     8..31 preserved untouched. */
  const f = flags >>> 0;
  return ((f & 0xffffff00) | ((f & 0xff) | 1)) >>> 0;
}
export function renderShellA15770HostVa() {
  return RENDER_SHELL_A15770_HOST_VA >>> 0;
}
export function renderShellA15770EndVa() {
  return RENDER_SHELL_A15770_END_VA >>> 0;
}
export function renderShellA15770NextVa() {
  return RENDER_SHELL_A15770_NEXT_VA >>> 0;
}
export function renderShellA15770VtableVa() {
  return RENDER_SHELL_A15770_VTABLE_VA >>> 0;
}
export function renderShellA15770VtableSlot() {
  return RENDER_SHELL_A15770_VTABLE_SLOT >>> 0;
}
export function renderShellA15770FlagsOff() {
  return RENDER_SHELL_A15770_FLAGS_OFF >>> 0;
}
export function renderShellA15770CsPtrOff() {
  return RENDER_SHELL_A15770_CS_PTR_OFF >>> 0;
}
export function renderShellA15770AllocSize() {
  return RENDER_SHELL_A15770_ALLOC_SIZE >>> 0;
}
export function renderShellA15770AllocVa() {
  return RENDER_SHELL_A15770_ALLOC_VA >>> 0;
}
export function renderShellA15770CsInitImportVa() {
  return RENDER_SHELL_A15770_CS_INIT_IMPORT_VA >>> 0;
}
export function renderShellA15770StackArgs() {
  return RENDER_SHELL_A15770_STACK_ARGS >>> 0;
}
export function renderShellA15770RetConst() {
  return RENDER_SHELL_A15770_RET_CONST >>> 0;
}
export function renderShellA15770AddrTakenCount() {
  return RENDER_SHELL_A15770_ADDR_TAKEN_COUNT >>> 0;
}
export function renderShellA15770DirectCallerCount() {
  return RENDER_SHELL_A15770_DIRECT_CALLER_COUNT >>> 0;
}

/* ===========================================================================
 * v25j (wave-16, ABI stays 54): 0xa157c0 — 0xb81c0c vftable SLOT 2,
 * destroy/cleanup arm (mirror of slot 1's lazy-CS-init getter). Deltas
 * pinned (never homogenised vs v54 0xa15770): slot 2; FULL-DWORD gate on
 * this->field8 [+8] (0x100 -> 1) instead of the low-byte bit-0 flags gate;
 * DeleteCriticalSection [0xb18274] instead of Initialize [0xb18278]; sized
 * delete 0xaef15c (0x1c) instead of sized new 0xa0f4c0; field8=0 store on
 * the delete (gate-set) path ONLY + flag byte AND 0xfe on BOTH paths
 * (conditionality inverted); body NEVER writes EAX (EAX_WRITES 0, NO ret
 * const). Reachability: 1 addr-taken (.rdata 0xb81c14), 0 direct callers —
 * pure virtual dispatch. Body 0xa157c0..0xa157ea, plain ret, 0 stack args.
 * PE evidence: section-notes/cpu-dump/00a157c0.txt. ---- */
export const RENDER_SHELL_A157C0_HOST_VA = 0x00a157c0;
export const RENDER_SHELL_A157C0_END_VA = 0x00a157ea;
export const RENDER_SHELL_A157C0_NEXT_VA = 0x00a157f0;
export const RENDER_SHELL_A157C0_VTABLE_VA = 0x00b81c0c;
export const RENDER_SHELL_A157C0_VTABLE_SLOT = 2;
export const RENDER_SHELL_A157C0_FLAGS_OFF = 0x04;
export const RENDER_SHELL_A157C0_CS_PTR_OFF = 0x08;
export const RENDER_SHELL_A157C0_FREE_SIZE = 0x1c;
export const RENDER_SHELL_A157C0_FREE_VA = 0x00aef15c;
export const RENDER_SHELL_A157C0_CS_DELETE_IMPORT_VA = 0x00b18274;
export const RENDER_SHELL_A157C0_STACK_ARGS = 0;
export const RENDER_SHELL_A157C0_EAX_WRITES = 0;
export const RENDER_SHELL_A157C0_ADDR_TAKEN_COUNT = 1;
export const RENDER_SHELL_A157C0_DIRECT_CALLER_COUNT = 0;

export function renderShellA157c0DestroyGate(cs) {
  return asU32(cs) !== 0 ? 1 : 0;
}
export function renderShellA157c0FlagsClearBit0(fl) {
  const f = asU32(fl);
  return ((f & 0xffffff00) | ((f & 0xff) & 0xfe)) >>> 0;
}
export function renderShellA157c0HostVa() {
  return RENDER_SHELL_A157C0_HOST_VA >>> 0;
}
export function renderShellA157c0EndVa() {
  return RENDER_SHELL_A157C0_END_VA >>> 0;
}
export function renderShellA157c0NextVa() {
  return RENDER_SHELL_A157C0_NEXT_VA >>> 0;
}
export function renderShellA157c0VtableVa() {
  return RENDER_SHELL_A157C0_VTABLE_VA >>> 0;
}
export function renderShellA157c0VtableSlot() {
  return RENDER_SHELL_A157C0_VTABLE_SLOT >>> 0;
}
export function renderShellA157c0FlagsOff() {
  return RENDER_SHELL_A157C0_FLAGS_OFF >>> 0;
}
export function renderShellA157c0CsPtrOff() {
  return RENDER_SHELL_A157C0_CS_PTR_OFF >>> 0;
}
export function renderShellA157c0FreeSize() {
  return RENDER_SHELL_A157C0_FREE_SIZE >>> 0;
}
export function renderShellA157c0FreeVa() {
  return RENDER_SHELL_A157C0_FREE_VA >>> 0;
}
export function renderShellA157c0CsDeleteImportVa() {
  return RENDER_SHELL_A157C0_CS_DELETE_IMPORT_VA >>> 0;
}
export function renderShellA157c0StackArgs() {
  return RENDER_SHELL_A157C0_STACK_ARGS >>> 0;
}
export function renderShellA157c0EaxWrites() {
  return RENDER_SHELL_A157C0_EAX_WRITES >>> 0;
}
export function renderShellA157c0AddrTakenCount() {
  return RENDER_SHELL_A157C0_ADDR_TAKEN_COUNT >>> 0;
}
export function renderShellA157c0DirectCallerCount() {
  return RENDER_SHELL_A157C0_DIRECT_CALLER_COUNT >>> 0;
}
/* ---- v25l (wave-16, ABI stays 54): 0xa159a0 — 0xb81c0c vftable SLOT 4
   (LAST), lazy-leave / CS teardown arm — NARROWED. Body VA
   0x00a159a0..0x00a159c7 (thiscall, plain ret). Byte gate `test byte
   [esi+4],1 / jne` skips the report arm; report arm = cdecl 0xa112c0
   (arg0 = 0x10, arg1 = 0xb81c20 string const, result DISCARDED — eax
   re-read); then cs_ptr = field8 (POST-CALL), byte [cs+0x18] pre-zeroed,
   LeaveCriticalSection [0xb18268]. Deliberately mirrors the v54 slot-1
   law family; DELTAS: no alloc / no flags store / no return value /
   report args (0x10, string) instead of sized-new / leave instead of
   init. Census: addr-taken 1 (vtable slot 0xb81c1c only), direct E8
   callers 0 — pure virtual dispatch. NEXT 0xa159d0 = already-landed v7
   string-hash body; vftable now fully decoded. NARROWED — residual host:
   0xa112c0 wrapper + pre-zero byte + LeaveCriticalSection [0xb18268].
   Evidence: section-notes/cpu-dump/00a159a0.txt +
   section-notes/render-shell-wave16a-a159a0/NOTES.md. ---- */
export const RENDER_SHELL_A159A0_HOST_VA = 0x00a159a0;
export const RENDER_SHELL_A159A0_END_VA = 0x00a159c7;
export const RENDER_SHELL_A159A0_NEXT_VA = 0x00a159d0;
export const RENDER_SHELL_A159A0_VTABLE_VA = 0x00b81c0c;
export const RENDER_SHELL_A159A0_VTABLE_SLOT = 4;
export const RENDER_SHELL_A159A0_FLAGS_OFF = 0x04;
export const RENDER_SHELL_A159A0_CS_PTR_OFF = 0x08;
export const RENDER_SHELL_A159A0_PREZERO_OFF = 0x18;
export const RENDER_SHELL_A159A0_REPORT_VA = 0x00a112c0;
export const RENDER_SHELL_A159A0_REPORT_ARG0 = 0x10;
export const RENDER_SHELL_A159A0_REPORT_ARG1 = 0x00b81c20;
export const RENDER_SHELL_A159A0_REPORT_RESULT_USED = 0;
export const RENDER_SHELL_A159A0_LEAVE_IMPORT_VA = 0x00b18268;
export const RENDER_SHELL_A159A0_STACK_ARGS = 0;
export const RENDER_SHELL_A159A0_ADDR_TAKEN_COUNT = 1;
export const RENDER_SHELL_A159A0_DIRECT_CALLER_COUNT = 0;
export function renderShellA159a0Gate(flags) {
  /* test byte [esi+4],1 @0xa159a3 / jne report-skip @0xa159a7: LOW-byte
     bit-0 gate — 1 iff (flags & 1) != 0 (initialized -> skip report
     arm). WIDE-driven: 0x100 -> 0, 0x1ff/0xffffffff -> 1. */
  return ((flags >>> 0) & 1) !== 0 ? 1 : 0;
}
export function renderShellA159a0ReportArg(index) {
  /* push 0xb81c20 @0xa159a9 / push 0x10 @0xa159ae / call 0xa112c0
     @0xa159b0: cdecl — the LAST push is arg0, so arg0 = 0x10 (report
     category), arg1 = 0xb81c20 (.rdata string "Trying to unlock
     mutex..."). index 0/1 -> arg, else 0. */
  const i = index >>> 0;
  if (i === 0) return RENDER_SHELL_A159A0_REPORT_ARG0 >>> 0;
  if (i === 1) return RENDER_SHELL_A159A0_REPORT_ARG1 >>> 0;
  return 0;
}
export function renderShellA159a0HostVa() {
  return RENDER_SHELL_A159A0_HOST_VA >>> 0;
}
export function renderShellA159a0EndVa() {
  return RENDER_SHELL_A159A0_END_VA >>> 0;
}
export function renderShellA159a0NextVa() {
  return RENDER_SHELL_A159A0_NEXT_VA >>> 0;
}
export function renderShellA159a0VtableVa() {
  return RENDER_SHELL_A159A0_VTABLE_VA >>> 0;
}
export function renderShellA159a0VtableSlot() {
  return RENDER_SHELL_A159A0_VTABLE_SLOT >>> 0;
}
export function renderShellA159a0FlagsOff() {
  return RENDER_SHELL_A159A0_FLAGS_OFF >>> 0;
}
export function renderShellA159a0CsPtrOff() {
  return RENDER_SHELL_A159A0_CS_PTR_OFF >>> 0;
}
export function renderShellA159a0PrezeroOff() {
  return RENDER_SHELL_A159A0_PREZERO_OFF >>> 0;
}
export function renderShellA159a0ReportVa() {
  return RENDER_SHELL_A159A0_REPORT_VA >>> 0;
}
export function renderShellA159a0ReportResultUsed() {
  return RENDER_SHELL_A159A0_REPORT_RESULT_USED >>> 0;
}
export function renderShellA159a0LeaveImportVa() {
  return RENDER_SHELL_A159A0_LEAVE_IMPORT_VA >>> 0;
}
export function renderShellA159a0StackArgs() {
  return RENDER_SHELL_A159A0_STACK_ARGS >>> 0;
}
export function renderShellA159a0AddrTakenCount() {
  return RENDER_SHELL_A159A0_ADDR_TAKEN_COUNT >>> 0;
}
export function renderShellA159a0DirectCallerCount() {
  return RENDER_SHELL_A159A0_DIRECT_CALLER_COUNT >>> 0;
}

/* v25k (wave-16, ABI stays 54): 0xa157f0 vftable-slot-3 CS acquire
   (forever arm + timed arm). Body 0xa157f0..0xa15996, ret 4 (1 stack
   arg at [ebp+8]: -1 = forever, else timeout ms). PE evidence:
   section-notes/cpu-dump/00a157f0.txt + 00a15853.txt. */
export const RENDER_SHELL_A157F0_HOST_VA = 0x00a157f0;
export const RENDER_SHELL_A157F0_END_VA = 0x00a15996;
export const RENDER_SHELL_A157F0_NEXT_VA = 0x00a159a0;
export const RENDER_SHELL_A157F0_VTABLE_VA = 0x00b81c0c;
export const RENDER_SHELL_A157F0_VTABLE_SLOT = 3;
export const RENDER_SHELL_A157F0_FLAGS_OFF = 0x04;
export const RENDER_SHELL_A157F0_CS_PTR_OFF = 0x08;
export const RENDER_SHELL_A157F0_BYTE18_OFF = 0x18;
export const RENDER_SHELL_A157F0_FACTORY_VA = 0x00a112c0;
export const RENDER_SHELL_A157F0_FACTORY_ARG0 = 0x10;
export const RENDER_SHELL_A157F0_FACTORY_ARG1 = 0x00b81c58;
export const RENDER_SHELL_A157F0_CS_ENTER_IMPORT_VA = 0x00b18270;
export const RENDER_SHELL_A157F0_CS_TRY_IMPORT_VA = 0x00b1826c;
export const RENDER_SHELL_A157F0_CS_LEAVE_IMPORT_VA = 0x00b18268;
export const RENDER_SHELL_A157F0_SLEEP_IMPORT_VA = 0x00b182d8;
export const RENDER_SHELL_A157F0_TIME_HELPER_VA = 0x00a68490;
export const RENDER_SHELL_A157F0_SCALE_MUL_LO = 0xd7b634db;
export const RENDER_SHELL_A157F0_SCALE_MUL_HI = 0x431bde82;
export const RENDER_SHELL_A157F0_SCALE_SHIFT = 0x12;
export const RENDER_SHELL_A157F0_SLEEP_MS_FOREVER = 0x3e8;
export const RENDER_SHELL_A157F0_SLEEP_MS_TIMED = 0x0a;
export const RENDER_SHELL_A157F0_STACK_ARGS = 1;
export const RENDER_SHELL_A157F0_ADDR_TAKEN_COUNT = 1;
export const RENDER_SHELL_A157F0_DIRECT_CALLER_COUNT = 0;
export function renderShellA157f0InitGate(flg) {
  /* test byte [eax+4],1 @0xa157fe / jne 0xa1581b: LOW-byte bit-0 gate
     — 1 iff (flg & 1) != 0 (initialized -> skip factory arm).
     WIDE-driven: 0x100 -> 0, 0x1ff/0xffffffff -> 1. */
  return ((flg >>> 0) & 1) !== 0 ? 1 : 0;
}
export function renderShellA157f0ArgM1Gate(argv) {
  /* cmp [ebp+8],-1 @0xa1581b / jne 0xa15853: FULL-DWORD gate — 1 iff
     arg == 0xffffffff (forever arm). 0x1ff -> 0. */
  return (argv >>> 0) === 0xffffffff ? 1 : 0;
}
export function renderShellA157f0Byte18Free(bv) {
  /* cmp byte [esi+0x18],0 @0xa1582b (forever) and @0xa158e8 (timed,
     POST-call re-read): LOW-byte test — 1 iff (bv & 0xff) == 0.
     0x100 -> 1, 0x1ff/0xffffffff -> 0. */
  return ((bv >>> 0) & 0xff) === 0 ? 1 : 0;
}
export function renderShellA157f0ArgZeroGate(argv) {
  /* cmp [ebp+8],0 @0xa158bf / jbe 0xa1598e: UNSIGNED compare — 1 iff
     arg == 0 (immediate timeout). 0xffffffff -> 0. */
  return (argv >>> 0) === 0 ? 1 : 0;
}
export function renderShellA157f0TryretGate(retv) {
  /* test eax,eax @0xa158df / setne cl: FULL-DWORD gate — 1 iff
     ret != 0 (0x100 IS set). */
  return (retv >>> 0) !== 0 ? 1 : 0;
}
export function renderShellA157f0TimedTake(retv, bv) {
  /* 0xa158f7 test cl,cl / jne 0xa15848: timed-arm success iff
     tryret != 0 && byte18 == 0. */
  return (retv >>> 0) !== 0 && ((bv >>> 0) & 0xff) === 0 ? 1 : 0;
}
const A157F0_M_LO = 0xd7b634db;
const A157F0_M_HI = 0x431bde82;
function a157f0ScaleLanes(t_hi, t_lo) {
  /* PE 64x64->128 lane multiply (0xa1585c..bc): p00 = t_lo*M_lo, p01 =
     t_lo*M_hi, p10 = t_hi*M_lo, p11 = t_hi*M_hi; mid = p00_hi +
     p01_lo + p10_lo; high = mid_hi + p01_hi + p10_hi + p11 (mod
     2^64 == the PE adc carry chain); scaled = high >> 0x12 ==
     (t * M) >> 82. Returns {lo, hi}. */
  const plo = BigInt(t_lo >>> 0);
  const phi = BigInt(t_hi >>> 0);
  const ml = BigInt(A157F0_M_LO);
  const mh = BigInt(A157F0_M_HI);
  const p00 = plo * ml;
  const p01 = plo * mh;
  const p10 = phi * ml;
  const p11 = phi * mh;
  const mid = (p00 >> 32n) + (p01 & 0xffffffffn) + (p10 & 0xffffffffn);
  const high = (mid >> 32n) + (p01 >> 32n) + (p10 >> 32n) + p11;
  const scaled = high >> 18n;
  return {
    lo: Number(scaled & 0xffffffffn) >>> 0,
    hi: Number(scaled >> 32n) >>> 0,
  };
}
export function renderShellA157f0TimeScaleLo(t_hi, t_lo) {
  return a157f0ScaleLanes(t_hi, t_lo).lo;
}
export function renderShellA157f0TimeScaleHi(t_hi, t_lo) {
  return a157f0ScaleLanes(t_hi, t_lo).hi;
}
export function renderShellA157f0DeadlineExceeded(
  baseHi, baseLo, nowHi, nowLo, arg,
) {
  /* 0xa15973 sub ecx,[esp+0xc] / 0xa15977 sbb edx,[esp+0x20]:
     elapsed = now - base (64-bit unsigned wrap); test edx,edx (dead
     jb artifact) / ja 0xa1598e: delta_hi != 0 -> exceeded; cmp
     ecx,[ebp+8] / jb 0xa158d1: delta_lo < arg (UNSIGNED) -> NOT
     exceeded. 1 iff delta_hi != 0 || delta_lo >= arg. */
  const base = (BigInt(baseHi >>> 0) << 32n) | BigInt(baseLo >>> 0);
  const now = (BigInt(nowHi >>> 0) << 32n) | BigInt(nowLo >>> 0);
  const delta = (now - base) & 0xffffffffffffffffn;
  const dHi = Number(delta >> 32n) >>> 0;
  const dLo = Number(delta & 0xffffffffn) >>> 0;
  const a = arg >>> 0;
  return dHi !== 0 || dLo >= a ? 1 : 0;
}
export function renderShellA157f0HostVa() {
  return RENDER_SHELL_A157F0_HOST_VA >>> 0;
}
export function renderShellA157f0EndVa() {
  return RENDER_SHELL_A157F0_END_VA >>> 0;
}
export function renderShellA157f0NextVa() {
  return RENDER_SHELL_A157F0_NEXT_VA >>> 0;
}
export function renderShellA157f0VtableVa() {
  return RENDER_SHELL_A157F0_VTABLE_VA >>> 0;
}
export function renderShellA157f0VtableSlot() {
  return RENDER_SHELL_A157F0_VTABLE_SLOT >>> 0;
}
export function renderShellA157f0FlagsOff() {
  return RENDER_SHELL_A157F0_FLAGS_OFF >>> 0;
}
export function renderShellA157f0CsPtrOff() {
  return RENDER_SHELL_A157F0_CS_PTR_OFF >>> 0;
}
export function renderShellA157f0Byte18Off() {
  return RENDER_SHELL_A157F0_BYTE18_OFF >>> 0;
}
export function renderShellA157f0FactoryVa() {
  return RENDER_SHELL_A157F0_FACTORY_VA >>> 0;
}
export function renderShellA157f0FactoryArg(index) {
  const i = index >>> 0;
  if (i === 0) return RENDER_SHELL_A157F0_FACTORY_ARG0 >>> 0;
  if (i === 1) return RENDER_SHELL_A157F0_FACTORY_ARG1 >>> 0;
  return 0;
}
export function renderShellA157f0CsEnterImportVa() {
  return RENDER_SHELL_A157F0_CS_ENTER_IMPORT_VA >>> 0;
}
export function renderShellA157f0CsTryImportVa() {
  return RENDER_SHELL_A157F0_CS_TRY_IMPORT_VA >>> 0;
}
export function renderShellA157f0CsLeaveImportVa() {
  return RENDER_SHELL_A157F0_CS_LEAVE_IMPORT_VA >>> 0;
}
export function renderShellA157f0SleepImportVa() {
  return RENDER_SHELL_A157F0_SLEEP_IMPORT_VA >>> 0;
}
export function renderShellA157f0TimeHelperVa() {
  return RENDER_SHELL_A157F0_TIME_HELPER_VA >>> 0;
}
export function renderShellA157f0ScaleMulLo() {
  return RENDER_SHELL_A157F0_SCALE_MUL_LO >>> 0;
}
export function renderShellA157f0ScaleMulHi() {
  return RENDER_SHELL_A157F0_SCALE_MUL_HI >>> 0;
}
export function renderShellA157f0ScaleShift() {
  return RENDER_SHELL_A157F0_SCALE_SHIFT >>> 0;
}
export function renderShellA157f0SleepMsForever() {
  return RENDER_SHELL_A157F0_SLEEP_MS_FOREVER >>> 0;
}
export function renderShellA157f0SleepMsTimed() {
  return RENDER_SHELL_A157F0_SLEEP_MS_TIMED >>> 0;
}
export function renderShellA157f0StackArgs() {
  return RENDER_SHELL_A157F0_STACK_ARGS >>> 0;
}
export function renderShellA157f0AddrTakenCount() {
  return RENDER_SHELL_A157F0_ADDR_TAKEN_COUNT >>> 0;
}
export function renderShellA157f0DirectCallerCount() {
  return RENDER_SHELL_A157F0_DIRECT_CALLER_COUNT >>> 0;
}

/* ---- ABI v56: 0xa15570 is-power-of-two gate (PURE leaf) ----
   Body 0xa15570..0xa15580: test ecx,ecx / je / lea eax,[ecx-1] /
   test ecx,eax / jne / mov al,1 / ret / xor al,al / ret. thiscall,
   0 stack args, 0 stores, 0 calls. is_pow2(n) = (n != 0) &&
   ((n & (n-1)) == 0), FULL-dword gates both; 0 -> 0, 1/2/4/.../
   0x80000000 -> 1, else 0. eax writes 2, upper bits caller-stale.
   One direct caller 0xa614dd (assert gate logging 0xb9f974 =
   "Destination buffer length is not a power of two", level 0x10,
   via logger 0xa112c0). Next body 0xa15590 = v49 next-pow2 leaf. */
export const RENDER_SHELL_A15570_HOST_VA = 0x00a15570;
export const RENDER_SHELL_A15570_END_VA = 0x00a15580;
export const RENDER_SHELL_A15570_NEXT_VA = 0x00a15590;
export const RENDER_SHELL_A15570_CALLER_COUNT = 1;
export const RENDER_SHELL_A15570_CALLER_FIRST_VA = 0x00a614dd;
export const RENDER_SHELL_A15570_CALLER_LAST_VA = 0x00a614dd;
export const RENDER_SHELL_A15570_LOGGER_VA = 0x00a112c0;
export const RENDER_SHELL_A15570_LOG_MSG_VA = 0x00b9f974;
export const RENDER_SHELL_A15570_LOG_LEVEL = 0x10;
export const RENDER_SHELL_A15570_STACK_ARGS = 0;
export const RENDER_SHELL_A15570_ADDR_TAKEN_COUNT = 0;
export const RENDER_SHELL_A15570_EAX_WRITES = 2;

export function renderShellA15570IsPow2(n) {
  /* PE order preserved: test ecx,ecx (full-dword zero gate; je -> 0),
     lea eax,[ecx-1], test ecx,eax (full-dword (n & (n-1)) == 0; jne
     -> 0), mov al,1 -> 1. */
  const v = n >>> 0;
  if (v === 0) return 0;
  return (v & (v - 1)) === 0 ? 1 : 0;
}
export function renderShellA15570HostVa() {
  return RENDER_SHELL_A15570_HOST_VA >>> 0;
}
export function renderShellA15570EndVa() {
  return RENDER_SHELL_A15570_END_VA >>> 0;
}
export function renderShellA15570NextVa() {
  return RENDER_SHELL_A15570_NEXT_VA >>> 0;
}
export function renderShellA15570CallerCount() {
  return RENDER_SHELL_A15570_CALLER_COUNT >>> 0;
}
export function renderShellA15570CallerFirstVa() {
  return RENDER_SHELL_A15570_CALLER_FIRST_VA >>> 0;
}
export function renderShellA15570CallerLastVa() {
  return RENDER_SHELL_A15570_CALLER_LAST_VA >>> 0;
}
export function renderShellA15570LoggerVa() {
  return RENDER_SHELL_A15570_LOGGER_VA >>> 0;
}
export function renderShellA15570LogMsgVa() {
  return RENDER_SHELL_A15570_LOG_MSG_VA >>> 0;
}
export function renderShellA15570LogLevel() {
  return RENDER_SHELL_A15570_LOG_LEVEL >>> 0;
}
export function renderShellA15570StackArgs() {
  return RENDER_SHELL_A15570_STACK_ARGS >>> 0;
}
export function renderShellA15570AddrTakenCount() {
  return RENDER_SHELL_A15570_ADDR_TAKEN_COUNT >>> 0;
}
export function renderShellA15570EaxWrites() {
  return RENDER_SHELL_A15570_EAX_WRITES >>> 0;
}

/* ---- ABI v57: FUN_00a13fa0 shader-object factory (NARROWED) ----
   Body 0xa13fa0..0xa14043, ret 0xc @ 0xa14040 (3 stack args), plain
   ebp frame, no exact ZHL. The v56 handoff mis-classified the in-band
   overlap as an other-family lease; this is THIS chain's 0x54-byte
   shader-object factory: calls LANDED a14620 init + LANDED a159d0
   shader hash + HOST-MARKED a14330 find-or-insert on map 0xc379bc
   (the SAME map the a14050/a140c0 chain reads). 6 direct callers
   (0xa18102/0xa18131/0xa18160/0xa19003/0xa19032/0xa19061), 0
   address-taken. Gates: counter select / alloc / obj / destroy =
   FULL-dword; init = BYTE on al (uint32_t & 0xff). Arith: tracked
   counter lo += 0x54 (32-bit wrap), hi += carry (adc); obj = alloc+4.
   Host: alloc IAT 0xb187e0 (0x54), notify 0xa23200 (hash
   0x7fcb9dd6), zero-init 0xa245b0, init 0xa14620, hash 0xa159d0,
   map 0xa14330. Counter pair select = ALLOC side of the tracked
   template pinned in a149a0/a150d0. Next body 0xa14050. */
export const RENDER_SHELL_A13FA0_HOST_VA = 0x00a13fa0;
export const RENDER_SHELL_A13FA0_END_VA = 0x00a14043;
export const RENDER_SHELL_A13FA0_NEXT_VA = 0x00a14050;
export const RENDER_SHELL_A13FA0_CALLER_COUNT = 6;
export const RENDER_SHELL_A13FA0_CALLER_FIRST_VA = 0x00a18102;
export const RENDER_SHELL_A13FA0_CALLER_LAST_VA = 0x00a19061;
export const RENDER_SHELL_A13FA0_STACK_ARGS = 3;
export const RENDER_SHELL_A13FA0_ADDR_TAKEN_COUNT = 0;
export const RENDER_SHELL_A13FA0_EAX_WRITES = 2;
export const RENDER_SHELL_A13FA0_ALLOC_IAT_VA = 0x00b187e0;
export const RENDER_SHELL_A13FA0_NOTIFY_FN_VA = 0x00a23200;
export const RENDER_SHELL_A13FA0_NOTIFY_HASH = 0x7fcb9dd6;
export const RENDER_SHELL_A13FA0_ZERO_INIT_FN_VA = 0x00a245b0;
export const RENDER_SHELL_A13FA0_INIT_FN_VA = 0x00a14620;
export const RENDER_SHELL_A13FA0_HASH_FN_VA = 0x00a159d0;
export const RENDER_SHELL_A13FA0_MAP_FN_VA = 0x00a14330;
export const RENDER_SHELL_A13FA0_MAP_THIS_VA = 0x00c379bc;
export const RENDER_SHELL_A13FA0_COUNTER_INSTALLED_VA = 0x00c7de78;
export const RENDER_SHELL_A13FA0_COUNTER_DEFAULT_VA = 0x00c7f618;
export const RENDER_SHELL_A13FA0_COUNTER_PAIR_OFF = 0x30;
export const RENDER_SHELL_A13FA0_COUNTER_INC = 0x54;
export const RENDER_SHELL_A13FA0_DESTROY_FLAG = 1;

export function renderShellA13fa0CounterBase(counterPtr) {
  /* 0xa13fa8 mov esi,[0xc7de78]; 0xa13fae test esi,esi (FULL dword);
     0xa13fb0 je 0xa13fb7 -> 0xc7f618; 0xa13fb2 add esi,0x30. */
  const p = counterPtr >>> 0;
  return p !== 0 ? (p + 0x30) >>> 0 : 0x00c7f618;
}
export function renderShellA13fa0AllocSize() {
  return 0x54;
}
export function renderShellA13fa0AllocGate(alloc) {
  /* 0xa13fc7 test eax,eax (FULL dword); 0xa13fc9 jne 0xa14000. */
  return alloc !== 0 ? 1 : 0;
}
export function renderShellA13fa0CounterAddLo(lo) {
  /* 0xa14000 add dword [esi],0x54 — 32-bit wrap. */
  return (lo + 0x54) >>> 0;
}
export function renderShellA13fa0CounterCarry(lo) {
  /* CF after the 32-bit add: carry iff lo + 0x54 wrapped. */
  const v = (lo + 0x54) >>> 0;
  return v < (lo >>> 0) ? 1 : 0;
}
export function renderShellA13fa0CounterAddHi(lo, hi) {
  /* 0xa1400c adc dword [esi+4],0 — hi += carry(lo + 0x54). */
  const v = (lo + 0x54) >>> 0;
  return (hi + (v < (lo >>> 0) ? 1 : 0)) >>> 0;
}
export function renderShellA13fa0ObjOff() {
  return 0x04;
}
export function renderShellA13fa0ObjGate(obj) {
  /* 0xa14010 test ecx,ecx (FULL dword); 0xa14012 je 0xa13fd5. */
  return obj !== 0 ? 1 : 0;
}
export function renderShellA13fa0InitGate(al) {
  /* 0xa13fe7 test al,al — BYTE gate on AL only; 0xa13fe9 jne 0xa1401d. */
  return (al & 0xff) !== 0 ? 1 : 0;
}
export function renderShellA13fa0DestroyGate(obj) {
  /* 0xa13feb test esi,esi (FULL dword); 0xa13fed je 0xa13ff7. */
  return obj !== 0 ? 1 : 0;
}
export function renderShellA13fa0DestroyFlag() {
  return 1;
}
export function renderShellA13fa0HostVa() {
  return RENDER_SHELL_A13FA0_HOST_VA >>> 0;
}
export function renderShellA13fa0EndVa() {
  return RENDER_SHELL_A13FA0_END_VA >>> 0;
}
export function renderShellA13fa0NextVa() {
  return RENDER_SHELL_A13FA0_NEXT_VA >>> 0;
}
export function renderShellA13fa0CallerCount() {
  return RENDER_SHELL_A13FA0_CALLER_COUNT >>> 0;
}
export function renderShellA13fa0CallerFirstVa() {
  return RENDER_SHELL_A13FA0_CALLER_FIRST_VA >>> 0;
}
export function renderShellA13fa0CallerLastVa() {
  return RENDER_SHELL_A13FA0_CALLER_LAST_VA >>> 0;
}
export function renderShellA13fa0StackArgs() {
  return RENDER_SHELL_A13FA0_STACK_ARGS >>> 0;
}
export function renderShellA13fa0AddrTakenCount() {
  return RENDER_SHELL_A13FA0_ADDR_TAKEN_COUNT >>> 0;
}
export function renderShellA13fa0EaxWrites() {
  return RENDER_SHELL_A13FA0_EAX_WRITES >>> 0;
}
export function renderShellA13fa0AllocIatVa() {
  return RENDER_SHELL_A13FA0_ALLOC_IAT_VA >>> 0;
}
export function renderShellA13fa0NotifyFnVa() {
  return RENDER_SHELL_A13FA0_NOTIFY_FN_VA >>> 0;
}
export function renderShellA13fa0NotifyHash() {
  return RENDER_SHELL_A13FA0_NOTIFY_HASH >>> 0;
}
export function renderShellA13fa0ZeroInitFnVa() {
  return RENDER_SHELL_A13FA0_ZERO_INIT_FN_VA >>> 0;
}
export function renderShellA13fa0InitFnVa() {
  return RENDER_SHELL_A13FA0_INIT_FN_VA >>> 0;
}
export function renderShellA13fa0HashFnVa() {
  return RENDER_SHELL_A13FA0_HASH_FN_VA >>> 0;
}
export function renderShellA13fa0MapFnVa() {
  return RENDER_SHELL_A13FA0_MAP_FN_VA >>> 0;
}
export function renderShellA13fa0MapThisVa() {
  return RENDER_SHELL_A13FA0_MAP_THIS_VA >>> 0;
}
export function renderShellA13fa0CounterInstalledVa() {
  return RENDER_SHELL_A13FA0_COUNTER_INSTALLED_VA >>> 0;
}
export function renderShellA13fa0CounterDefaultVa() {
  return RENDER_SHELL_A13FA0_COUNTER_DEFAULT_VA >>> 0;
}
export function renderShellA13fa0CounterPairOff() {
  return RENDER_SHELL_A13FA0_COUNTER_PAIR_OFF >>> 0;
}
export function renderShellA13fa0CounterInc() {
  return RENDER_SHELL_A13FA0_COUNTER_INC >>> 0;
}

/* ---- ABI v58: second-band caller bodies (NARROWED) ---- */

export const RENDER_SHELL_A180A0_HOST_VA = 0x00a180a0;
export const RENDER_SHELL_A180A0_END_VA = 0x00a18229;
export const RENDER_SHELL_A180A0_NEXT_VA = 0x00a18230;
export const RENDER_SHELL_A180A0_CALLER_COUNT = 0x0;
export const RENDER_SHELL_A180A0_ADDR_TAKEN_COUNT = 0x1;
export const RENDER_SHELL_A180A0_EAX_WRITES = 0x2;
export const RENDER_SHELL_A180A0_STACK_ARGS = 0x0;
export const RENDER_SHELL_A180A0_VTABLE_VA = 0x00b82430;
export const RENDER_SHELL_A180A0_TAIL_VA = 0x00a12f20;
export const RENDER_SHELL_A180A0_SEH_SLOT_VA = 0x00b82434;
export const RENDER_SHELL_A180A0_SEH_REG_VA = 0x00b110a4;
export const RENDER_SHELL_A180A0_GS_COOKIE_VA = 0x00bf93b4;
export const RENDER_SHELL_A180A0_TRIPLE1_NAME_VA = 0x00b81e50;
export const RENDER_SHELL_A180A0_TRIPLE1_ARG2 = 0x00c0f8c0;
export const RENDER_SHELL_A180A0_TRIPLE1_BASE_VA = 0x00b81f10;
export const RENDER_SHELL_A180A0_TRIPLE1_VAL = 0xca;
export const RENDER_SHELL_A180A0_TRIPLE1_STR_VA = 0x00b820f8;
export const RENDER_SHELL_A180A0_TRIPLE1_VAL2 = 0x9a;
export const RENDER_SHELL_A180A0_TRIPLE2_NAME_VA = 0x00b1a5b0;
export const RENDER_SHELL_A180A0_TRIPLE2_ARG2 = 0x00c0f8f0;
export const RENDER_SHELL_A180A0_TRIPLE2_BASE_VA = 0x00b81fe0;
export const RENDER_SHELL_A180A0_TRIPLE2_VAL = 0x117;
export const RENDER_SHELL_A180A0_TRIPLE2_STR_VA = 0x00b82320;
export const RENDER_SHELL_A180A0_TRIPLE2_VAL2 = 0x10b;
export const RENDER_SHELL_A180A0_TRIPLE3_NAME_VA = 0x00b81940;
export const RENDER_SHELL_A180A0_TRIPLE3_ARG2 = 0x00c0f8f0;
export const RENDER_SHELL_A180A0_TRIPLE3_BASE_VA = 0x00b81fe0;
export const RENDER_SHELL_A180A0_TRIPLE3_VAL = 0x117;
export const RENDER_SHELL_A180A0_TRIPLE3_STR_VA = 0x00b82198;
export const RENDER_SHELL_A180A0_TRIPLE3_VAL2 = 0x186;
export const RENDER_SHELL_A180A0_VT_SLOT_78 = 0x78;
export const RENDER_SHELL_A180A0_VT_SLOT_18 = 0x18;
export const RENDER_SHELL_A180A0_VT_SLOT_58 = 0x58;
export const RENDER_SHELL_A180A0_VT18_ARG0 = 0x0;
export const RENDER_SHELL_A180A0_VT18_ARG1 = 0x1;
export const RENDER_SHELL_A180A0_ALLOC_SIZE = 0x10;
export const RENDER_SHELL_A180A0_CTOR_VA = 0x00a67fe0;
export const RENDER_SHELL_A180A0_COLOR_ARG_BITS = 0xff000000;
export const RENDER_SHELL_A180A0_COLOR_CTOR_VA = 0x00a0f550;
export const RENDER_SHELL_A180A0_OBJ_GLOBAL_VA = 0x00c7367c;
export const RENDER_SHELL_A180A0_OBJ_FLAG_OFF = 0xc;
export const RENDER_SHELL_A180A0_OBJ_FLAG_VAL = 0x1;
export const RENDER_SHELL_A180A0_FLAG_379B4_VA = 0x00c379b4;
export const RENDER_SHELL_A180A0_FLAG_37984_VA = 0x00c37984;
export const RENDER_SHELL_A180A0_FLAG_VAL = 0x1;
export const RENDER_SHELL_A180A0_THIS_FLAG_OFF = 0x4;
export const RENDER_SHELL_A180A0_HOOK_VA_0 = 0x00c7163c;
export const RENDER_SHELL_A180A0_HOOK_VA_1 = 0x00c71644;
export const RENDER_SHELL_A180A0_HOOK_TARGET_VA = 0x00a12240;
export const RENDER_SHELL_A180A0_VT58_FLOAT0_BITS = 0x00b81f10;
export const RENDER_SHELL_A180A0_VT58_FLOAT1_BITS = 0xca;

export function renderShellA180a0AllocGate(alloc) {
  return alloc !== 0 ? 1 : 0;
}
export function renderShellA180a0HostVa() {
  return RENDER_SHELL_A180A0_HOST_VA >>> 0;
}
export function renderShellA180a0EndVa() {
  return RENDER_SHELL_A180A0_END_VA >>> 0;
}
export function renderShellA180a0NextVa() {
  return RENDER_SHELL_A180A0_NEXT_VA >>> 0;
}
export function renderShellA180a0CallerCount() {
  return RENDER_SHELL_A180A0_CALLER_COUNT >>> 0;
}
export function renderShellA180a0AddrTakenCount() {
  return RENDER_SHELL_A180A0_ADDR_TAKEN_COUNT >>> 0;
}
export function renderShellA180a0EaxWrites() {
  return RENDER_SHELL_A180A0_EAX_WRITES >>> 0;
}
export function renderShellA180a0StackArgs() {
  return RENDER_SHELL_A180A0_STACK_ARGS >>> 0;
}
export function renderShellA180a0VtableVa() {
  return RENDER_SHELL_A180A0_VTABLE_VA >>> 0;
}
export function renderShellA180a0TailVa() {
  return RENDER_SHELL_A180A0_TAIL_VA >>> 0;
}
export function renderShellA180a0SehSlotVa() {
  return RENDER_SHELL_A180A0_SEH_SLOT_VA >>> 0;
}
export function renderShellA180a0SehRegVa() {
  return RENDER_SHELL_A180A0_SEH_REG_VA >>> 0;
}
export function renderShellA180a0GsCookieVa() {
  return RENDER_SHELL_A180A0_GS_COOKIE_VA >>> 0;
}
export function renderShellA180a0Triple1NameVa() {
  return RENDER_SHELL_A180A0_TRIPLE1_NAME_VA >>> 0;
}
export function renderShellA180a0Triple1Arg2() {
  return RENDER_SHELL_A180A0_TRIPLE1_ARG2 >>> 0;
}
export function renderShellA180a0Triple1BaseVa() {
  return RENDER_SHELL_A180A0_TRIPLE1_BASE_VA >>> 0;
}
export function renderShellA180a0Triple1Val() {
  return RENDER_SHELL_A180A0_TRIPLE1_VAL >>> 0;
}
export function renderShellA180a0Triple1StrVa() {
  return RENDER_SHELL_A180A0_TRIPLE1_STR_VA >>> 0;
}
export function renderShellA180a0Triple1Val2() {
  return RENDER_SHELL_A180A0_TRIPLE1_VAL2 >>> 0;
}
export function renderShellA180a0Triple2NameVa() {
  return RENDER_SHELL_A180A0_TRIPLE2_NAME_VA >>> 0;
}
export function renderShellA180a0Triple2Arg2() {
  return RENDER_SHELL_A180A0_TRIPLE2_ARG2 >>> 0;
}
export function renderShellA180a0Triple2BaseVa() {
  return RENDER_SHELL_A180A0_TRIPLE2_BASE_VA >>> 0;
}
export function renderShellA180a0Triple2Val() {
  return RENDER_SHELL_A180A0_TRIPLE2_VAL >>> 0;
}
export function renderShellA180a0Triple2StrVa() {
  return RENDER_SHELL_A180A0_TRIPLE2_STR_VA >>> 0;
}
export function renderShellA180a0Triple2Val2() {
  return RENDER_SHELL_A180A0_TRIPLE2_VAL2 >>> 0;
}
export function renderShellA180a0Triple3NameVa() {
  return RENDER_SHELL_A180A0_TRIPLE3_NAME_VA >>> 0;
}
export function renderShellA180a0Triple3Arg2() {
  return RENDER_SHELL_A180A0_TRIPLE3_ARG2 >>> 0;
}
export function renderShellA180a0Triple3BaseVa() {
  return RENDER_SHELL_A180A0_TRIPLE3_BASE_VA >>> 0;
}
export function renderShellA180a0Triple3Val() {
  return RENDER_SHELL_A180A0_TRIPLE3_VAL >>> 0;
}
export function renderShellA180a0Triple3StrVa() {
  return RENDER_SHELL_A180A0_TRIPLE3_STR_VA >>> 0;
}
export function renderShellA180a0Triple3Val2() {
  return RENDER_SHELL_A180A0_TRIPLE3_VAL2 >>> 0;
}
export function renderShellA180a0VtSlot78() {
  return RENDER_SHELL_A180A0_VT_SLOT_78 >>> 0;
}
export function renderShellA180a0VtSlot18() {
  return RENDER_SHELL_A180A0_VT_SLOT_18 >>> 0;
}
export function renderShellA180a0VtSlot58() {
  return RENDER_SHELL_A180A0_VT_SLOT_58 >>> 0;
}
export function renderShellA180a0Vt18Arg0() {
  return RENDER_SHELL_A180A0_VT18_ARG0 >>> 0;
}
export function renderShellA180a0Vt18Arg1() {
  return RENDER_SHELL_A180A0_VT18_ARG1 >>> 0;
}
export function renderShellA180a0AllocSize() {
  return RENDER_SHELL_A180A0_ALLOC_SIZE >>> 0;
}
export function renderShellA180a0CtorVa() {
  return RENDER_SHELL_A180A0_CTOR_VA >>> 0;
}
export function renderShellA180a0ColorArgBits() {
  return RENDER_SHELL_A180A0_COLOR_ARG_BITS >>> 0;
}
export function renderShellA180a0ColorCtorVa() {
  return RENDER_SHELL_A180A0_COLOR_CTOR_VA >>> 0;
}
export function renderShellA180a0ObjGlobalVa() {
  return RENDER_SHELL_A180A0_OBJ_GLOBAL_VA >>> 0;
}
export function renderShellA180a0ObjFlagOff() {
  return RENDER_SHELL_A180A0_OBJ_FLAG_OFF >>> 0;
}
export function renderShellA180a0ObjFlagVal() {
  return RENDER_SHELL_A180A0_OBJ_FLAG_VAL >>> 0;
}
export function renderShellA180a0Flag379b4Va() {
  return RENDER_SHELL_A180A0_FLAG_379B4_VA >>> 0;
}
export function renderShellA180a0Flag37984Va() {
  return RENDER_SHELL_A180A0_FLAG_37984_VA >>> 0;
}
export function renderShellA180a0FlagVal() {
  return RENDER_SHELL_A180A0_FLAG_VAL >>> 0;
}
export function renderShellA180a0ThisFlagOff() {
  return RENDER_SHELL_A180A0_THIS_FLAG_OFF >>> 0;
}
export function renderShellA180a0HookVa0() {
  return RENDER_SHELL_A180A0_HOOK_VA_0 >>> 0;
}
export function renderShellA180a0HookVa1() {
  return RENDER_SHELL_A180A0_HOOK_VA_1 >>> 0;
}
export function renderShellA180a0HookTargetVa() {
  return RENDER_SHELL_A180A0_HOOK_TARGET_VA >>> 0;
}
export function renderShellA180a0Vt58Float0Bits() {
  return RENDER_SHELL_A180A0_VT58_FLOAT0_BITS >>> 0;
}
export function renderShellA180a0Vt58Float1Bits() {
  return RENDER_SHELL_A180A0_VT58_FLOAT1_BITS >>> 0;
}

export const RENDER_SHELL_A18E10_HOST_VA = 0x00a18e10;
export const RENDER_SHELL_A18E10_END_VA = 0x00a18e8a;
export const RENDER_SHELL_A18E10_NEXT_VA = 0x00a18e90;
export const RENDER_SHELL_A18E10_CALLER_COUNT = 0x1;
export const RENDER_SHELL_A18E10_CALLER_FIRST_VA = 0x00a18dc6;
export const RENDER_SHELL_A18E10_CALLER_LAST_VA = 0x00a18dc6;
export const RENDER_SHELL_A18E10_ADDR_TAKEN_COUNT = 0x0;
export const RENDER_SHELL_A18E10_EAX_WRITES = 0x0;
export const RENDER_SHELL_A18E10_STACK_ARGS = 0x0;
export const RENDER_SHELL_A18E10_VTABLE_FIRST_VA = 0x00b82600;
export const RENDER_SHELL_A18E10_VTABLE_FINAL_VA = 0x00b82430;
export const RENDER_SHELL_A18E10_TAIL_VA = 0x00a12f20;
export const RENDER_SHELL_A18E10_SLOT_OFF_0 = 0xf0;
export const RENDER_SHELL_A18E10_SLOT_OFF_1 = 0xe8;
export const RENDER_SHELL_A18E10_SLOT_OFF_2 = 0xe0;
export const RENDER_SHELL_A18E10_SLOT_OFF_3 = 0xd8;
export const RENDER_SHELL_A18E10_FREE_SIZE = 0x10;
export const RENDER_SHELL_A18E10_FREE_FN_VA = 0x00aef15c;
export const RENDER_SHELL_A18E10_RESET_FN_VA = 0x00a1a500;

export function renderShellA18e10HostVa() {
  return RENDER_SHELL_A18E10_HOST_VA >>> 0;
}
export function renderShellA18e10EndVa() {
  return RENDER_SHELL_A18E10_END_VA >>> 0;
}
export function renderShellA18e10NextVa() {
  return RENDER_SHELL_A18E10_NEXT_VA >>> 0;
}
export function renderShellA18e10CallerCount() {
  return RENDER_SHELL_A18E10_CALLER_COUNT >>> 0;
}
export function renderShellA18e10CallerFirstVa() {
  return RENDER_SHELL_A18E10_CALLER_FIRST_VA >>> 0;
}
export function renderShellA18e10CallerLastVa() {
  return RENDER_SHELL_A18E10_CALLER_LAST_VA >>> 0;
}
export function renderShellA18e10AddrTakenCount() {
  return RENDER_SHELL_A18E10_ADDR_TAKEN_COUNT >>> 0;
}
export function renderShellA18e10EaxWrites() {
  return RENDER_SHELL_A18E10_EAX_WRITES >>> 0;
}
export function renderShellA18e10StackArgs() {
  return RENDER_SHELL_A18E10_STACK_ARGS >>> 0;
}
export function renderShellA18e10VtableFirstVa() {
  return RENDER_SHELL_A18E10_VTABLE_FIRST_VA >>> 0;
}
export function renderShellA18e10VtableFinalVa() {
  return RENDER_SHELL_A18E10_VTABLE_FINAL_VA >>> 0;
}
export function renderShellA18e10TailVa() {
  return RENDER_SHELL_A18E10_TAIL_VA >>> 0;
}
export function renderShellA18e10SlotOff0() {
  return RENDER_SHELL_A18E10_SLOT_OFF_0 >>> 0;
}
export function renderShellA18e10SlotOff1() {
  return RENDER_SHELL_A18E10_SLOT_OFF_1 >>> 0;
}
export function renderShellA18e10SlotOff2() {
  return RENDER_SHELL_A18E10_SLOT_OFF_2 >>> 0;
}
export function renderShellA18e10SlotOff3() {
  return RENDER_SHELL_A18E10_SLOT_OFF_3 >>> 0;
}
export function renderShellA18e10FreeSize() {
  return RENDER_SHELL_A18E10_FREE_SIZE >>> 0;
}
export function renderShellA18e10FreeFnVa() {
  return RENDER_SHELL_A18E10_FREE_FN_VA >>> 0;
}
export function renderShellA18e10ResetFnVa() {
  return RENDER_SHELL_A18E10_RESET_FN_VA >>> 0;
}

export const RENDER_SHELL_A18E90_HOST_VA = 0x00a18e90;
export const RENDER_SHELL_A18E90_END_VA = 0x00a1912c;
export const RENDER_SHELL_A18E90_NEXT_VA = 0x00a19130;
export const RENDER_SHELL_A18E90_CALLER_COUNT = 0x1;
export const RENDER_SHELL_A18E90_CALLER_FIRST_VA = 0x00a71284;
export const RENDER_SHELL_A18E90_CALLER_LAST_VA = 0x00a71284;
export const RENDER_SHELL_A18E90_ADDR_TAKEN_COUNT = 0x1;
export const RENDER_SHELL_A18E90_EAX_WRITES = 0x2;
export const RENDER_SHELL_A18E90_STACK_ARGS = 0x0;
export const RENDER_SHELL_A18E90_VTABLE_VA = 0x00b82600;
export const RENDER_SHELL_A18E90_VTABLE_SLOT = 0x4;
export const RENDER_SHELL_A18E90_SEH_REG_VA = 0x00b11164;
export const RENDER_SHELL_A18E90_GS_COOKIE_VA = 0x00bf93b4;
export const RENDER_SHELL_A18E90_HOOK_VA = 0x00c7de7c;
export const RENDER_SHELL_A18E90_HOOK_TARGET_VA = 0x00a19dd0;
export const RENDER_SHELL_A18E90_STATE_CALL_VA = 0x00a6a420;
export const RENDER_SHELL_A18E90_STATE_OK_VAL = 0x1;
export const RENDER_SHELL_A18E90_LOG_MSG_VA = 0x00b825cc;
export const RENDER_SHELL_A18E90_LOG_LEVEL = 0x10;
export const RENDER_SHELL_A18E90_PAIR_VA = 0x00c79a34;
export const RENDER_SHELL_A18E90_PAIR2_VA = 0x00c79a38;
export const RENDER_SHELL_A18E90_STATE_BYTE_VA = 0x00c79a3c;
export const RENDER_SHELL_A18E90_RELAY_OFF_0 = 0xc8;
export const RENDER_SHELL_A18E90_RELAY_OFF_1 = 0xcc;
export const RENDER_SHELL_A18E90_FLAG_CLEAR_MASK = 0xfffffbff;
export const RENDER_SHELL_A18E90_FLAG_SET_BITS = 0x400;
export const RENDER_SHELL_A18E90_WIN_CLEAR_MASK = 0xfffeffff;
export const RENDER_SHELL_A18E90_WIN_SET_BITS = 0x10000;
export const RENDER_SHELL_A18E90_THIS_FLAG_OFF = 0x4;
export const RENDER_SHELL_A18E90_SLOT_OFF = 0xbc;
export const RENDER_SHELL_A18E90_PRELOAD_ARG = 0xfffffff0;
export const RENDER_SHELL_A18E90_PRELOAD_FN_VA = 0x00a5f090;
export const RENDER_SHELL_A18E90_DBL_IAT_VA_0 = 0x00b186b4;
export const RENDER_SHELL_A18E90_DBL_IAT_VA_1 = 0x00b186a8;
export const RENDER_SHELL_A18E90_WIN_OFF = 0x40;
export const RENDER_SHELL_A18E90_WIN_FLAG_OFF = 0x14;
export const RENDER_SHELL_A18E90_ESCALATE_LINE = 0x333;
export const RENDER_SHELL_A18E90_ESCALATE_FILE_VA = 0x00ba08f8;
export const RENDER_SHELL_A18E90_ESCALATE_MSG_VA = 0x00b9bbcc;
export const RENDER_SHELL_A18E90_ESCALATE_IAT_VA = 0x00b18884;
export const RENDER_SHELL_A18E90_INIT_FN_VA = 0x00a69f60;
export const RENDER_SHELL_A18E90_INIT_ARG0 = 0x0;
export const RENDER_SHELL_A18E90_INIT_ARG1 = 0x10001;
export const RENDER_SHELL_A18E90_NOTIFY_FLAG_VA = 0x00c73680;
export const RENDER_SHELL_A18E90_NOTIFY_FN_VA_0 = 0x00c73748;
export const RENDER_SHELL_A18E90_NOTIFY_FN_VA_1 = 0x00c73754;
export const RENDER_SHELL_A18E90_TRIPLE1_NAME_VA = 0x00b81e50;
export const RENDER_SHELL_A18E90_TRIPLE1_ARG2 = 0x00c0f8c0;
export const RENDER_SHELL_A18E90_TRIPLE1_BASE_VA = 0x00b81f10;
export const RENDER_SHELL_A18E90_TRIPLE1_VAL = 0xca;
export const RENDER_SHELL_A18E90_TRIPLE1_STR_VA = 0x00b820f8;
export const RENDER_SHELL_A18E90_TRIPLE1_VAL2 = 0x9a;
export const RENDER_SHELL_A18E90_TRIPLE2_NAME_VA = 0x00b1a5b0;
export const RENDER_SHELL_A18E90_TRIPLE2_ARG2 = 0x00c0f8f0;
export const RENDER_SHELL_A18E90_TRIPLE2_BASE_VA = 0x00b81fe0;
export const RENDER_SHELL_A18E90_TRIPLE2_VAL = 0x117;
export const RENDER_SHELL_A18E90_TRIPLE2_STR_VA = 0x00b82320;
export const RENDER_SHELL_A18E90_TRIPLE2_VAL2 = 0x10b;
export const RENDER_SHELL_A18E90_TRIPLE3_NAME_VA = 0x00b81940;
export const RENDER_SHELL_A18E90_TRIPLE3_ARG2 = 0x00c0f8f0;
export const RENDER_SHELL_A18E90_TRIPLE3_BASE_VA = 0x00b81fe0;
export const RENDER_SHELL_A18E90_TRIPLE3_VAL = 0x117;
export const RENDER_SHELL_A18E90_TRIPLE3_STR_VA = 0x00b82198;
export const RENDER_SHELL_A18E90_TRIPLE3_VAL2 = 0x186;
export const RENDER_SHELL_A18E90_VT_SLOT_78 = 0x78;
export const RENDER_SHELL_A18E90_VT_SLOT_18 = 0x18;
export const RENDER_SHELL_A18E90_VT_SLOT_58 = 0x58;
export const RENDER_SHELL_A18E90_VT18_ARG0 = 0x0;
export const RENDER_SHELL_A18E90_VT18_ARG1 = 0x1;
export const RENDER_SHELL_A18E90_ALLOC_SIZE = 0x10;
export const RENDER_SHELL_A18E90_CTOR_VA = 0x00a67fe0;
export const RENDER_SHELL_A18E90_COLOR_ARG_BITS = 0xff000000;
export const RENDER_SHELL_A18E90_COLOR_CTOR_VA = 0x00a0f550;
export const RENDER_SHELL_A18E90_OBJ_GLOBAL_VA = 0x00c7367c;
export const RENDER_SHELL_A18E90_OBJ_FLAG_OFF = 0xc;
export const RENDER_SHELL_A18E90_OBJ_FLAG_VAL = 0x1;
export const RENDER_SHELL_A18E90_FLAG_379B4_VA = 0x00c379b4;
export const RENDER_SHELL_A18E90_FLAG_37984_VA = 0x00c37984;
export const RENDER_SHELL_A18E90_FLAG_VAL = 0x1;
export const RENDER_SHELL_A18E90_HOOK_VA_0 = 0x00c7163c;
export const RENDER_SHELL_A18E90_HOOK_VA_1 = 0x00c71644;
export const RENDER_SHELL_A18E90_TAIL_HOOK_TARGET_VA = 0x00a12240;
export const RENDER_SHELL_A18E90_VT58_FLOAT0_BITS = 0x00b81f10;
export const RENDER_SHELL_A18E90_VT58_FLOAT1_BITS = 0xca;

export function renderShellA18e90FlagGate(b) {
  return (b & 0xff) === 0 ? 1 : 0;
}
export function renderShellA18e90WinGate(b) {
  return (b & 0xff) !== 0 ? 1 : 0;
}
export function renderShellA18e90TailGate(al) {
  return (al & 0xff) !== 0 ? 1 : 0;
}
export function renderShellA18e90AllocGate(alloc) {
  return alloc !== 0 ? 1 : 0;
}
export function renderShellA18e90HostVa() {
  return RENDER_SHELL_A18E90_HOST_VA >>> 0;
}
export function renderShellA18e90EndVa() {
  return RENDER_SHELL_A18E90_END_VA >>> 0;
}
export function renderShellA18e90NextVa() {
  return RENDER_SHELL_A18E90_NEXT_VA >>> 0;
}
export function renderShellA18e90CallerCount() {
  return RENDER_SHELL_A18E90_CALLER_COUNT >>> 0;
}
export function renderShellA18e90CallerFirstVa() {
  return RENDER_SHELL_A18E90_CALLER_FIRST_VA >>> 0;
}
export function renderShellA18e90CallerLastVa() {
  return RENDER_SHELL_A18E90_CALLER_LAST_VA >>> 0;
}
export function renderShellA18e90AddrTakenCount() {
  return RENDER_SHELL_A18E90_ADDR_TAKEN_COUNT >>> 0;
}
export function renderShellA18e90EaxWrites() {
  return RENDER_SHELL_A18E90_EAX_WRITES >>> 0;
}
export function renderShellA18e90StackArgs() {
  return RENDER_SHELL_A18E90_STACK_ARGS >>> 0;
}
export function renderShellA18e90VtableVa() {
  return RENDER_SHELL_A18E90_VTABLE_VA >>> 0;
}
export function renderShellA18e90VtableSlot() {
  return RENDER_SHELL_A18E90_VTABLE_SLOT >>> 0;
}
export function renderShellA18e90SehRegVa() {
  return RENDER_SHELL_A18E90_SEH_REG_VA >>> 0;
}
export function renderShellA18e90GsCookieVa() {
  return RENDER_SHELL_A18E90_GS_COOKIE_VA >>> 0;
}
export function renderShellA18e90HookVa() {
  return RENDER_SHELL_A18E90_HOOK_VA >>> 0;
}
export function renderShellA18e90HookTargetVa() {
  return RENDER_SHELL_A18E90_HOOK_TARGET_VA >>> 0;
}
export function renderShellA18e90StateCallVa() {
  return RENDER_SHELL_A18E90_STATE_CALL_VA >>> 0;
}
export function renderShellA18e90StateOkVal() {
  return RENDER_SHELL_A18E90_STATE_OK_VAL >>> 0;
}
export function renderShellA18e90LogMsgVa() {
  return RENDER_SHELL_A18E90_LOG_MSG_VA >>> 0;
}
export function renderShellA18e90LogLevel() {
  return RENDER_SHELL_A18E90_LOG_LEVEL >>> 0;
}
export function renderShellA18e90PairVa() {
  return RENDER_SHELL_A18E90_PAIR_VA >>> 0;
}
export function renderShellA18e90Pair2Va() {
  return RENDER_SHELL_A18E90_PAIR2_VA >>> 0;
}
export function renderShellA18e90StateByteVa() {
  return RENDER_SHELL_A18E90_STATE_BYTE_VA >>> 0;
}
export function renderShellA18e90RelayOff0() {
  return RENDER_SHELL_A18E90_RELAY_OFF_0 >>> 0;
}
export function renderShellA18e90RelayOff1() {
  return RENDER_SHELL_A18E90_RELAY_OFF_1 >>> 0;
}
export function renderShellA18e90FlagClearMask() {
  return RENDER_SHELL_A18E90_FLAG_CLEAR_MASK >>> 0;
}
export function renderShellA18e90FlagSetBits() {
  return RENDER_SHELL_A18E90_FLAG_SET_BITS >>> 0;
}
export function renderShellA18e90WinClearMask() {
  return RENDER_SHELL_A18E90_WIN_CLEAR_MASK >>> 0;
}
export function renderShellA18e90WinSetBits() {
  return RENDER_SHELL_A18E90_WIN_SET_BITS >>> 0;
}
export function renderShellA18e90ThisFlagOff() {
  return RENDER_SHELL_A18E90_THIS_FLAG_OFF >>> 0;
}
export function renderShellA18e90SlotOff() {
  return RENDER_SHELL_A18E90_SLOT_OFF >>> 0;
}
export function renderShellA18e90PreloadArg() {
  return RENDER_SHELL_A18E90_PRELOAD_ARG >>> 0;
}
export function renderShellA18e90PreloadFnVa() {
  return RENDER_SHELL_A18E90_PRELOAD_FN_VA >>> 0;
}
export function renderShellA18e90DblIatVa0() {
  return RENDER_SHELL_A18E90_DBL_IAT_VA_0 >>> 0;
}
export function renderShellA18e90DblIatVa1() {
  return RENDER_SHELL_A18E90_DBL_IAT_VA_1 >>> 0;
}
export function renderShellA18e90WinOff() {
  return RENDER_SHELL_A18E90_WIN_OFF >>> 0;
}
export function renderShellA18e90WinFlagOff() {
  return RENDER_SHELL_A18E90_WIN_FLAG_OFF >>> 0;
}
export function renderShellA18e90EscalateLine() {
  return RENDER_SHELL_A18E90_ESCALATE_LINE >>> 0;
}
export function renderShellA18e90EscalateFileVa() {
  return RENDER_SHELL_A18E90_ESCALATE_FILE_VA >>> 0;
}
export function renderShellA18e90EscalateMsgVa() {
  return RENDER_SHELL_A18E90_ESCALATE_MSG_VA >>> 0;
}
export function renderShellA18e90EscalateIatVa() {
  return RENDER_SHELL_A18E90_ESCALATE_IAT_VA >>> 0;
}
export function renderShellA18e90InitFnVa() {
  return RENDER_SHELL_A18E90_INIT_FN_VA >>> 0;
}
export function renderShellA18e90InitArg0() {
  return RENDER_SHELL_A18E90_INIT_ARG0 >>> 0;
}
export function renderShellA18e90InitArg1() {
  return RENDER_SHELL_A18E90_INIT_ARG1 >>> 0;
}
export function renderShellA18e90NotifyFlagVa() {
  return RENDER_SHELL_A18E90_NOTIFY_FLAG_VA >>> 0;
}
export function renderShellA18e90NotifyFnVa0() {
  return RENDER_SHELL_A18E90_NOTIFY_FN_VA_0 >>> 0;
}
export function renderShellA18e90NotifyFnVa1() {
  return RENDER_SHELL_A18E90_NOTIFY_FN_VA_1 >>> 0;
}
export function renderShellA18e90Triple1NameVa() {
  return RENDER_SHELL_A18E90_TRIPLE1_NAME_VA >>> 0;
}
export function renderShellA18e90Triple1Arg2() {
  return RENDER_SHELL_A18E90_TRIPLE1_ARG2 >>> 0;
}
export function renderShellA18e90Triple1BaseVa() {
  return RENDER_SHELL_A18E90_TRIPLE1_BASE_VA >>> 0;
}
export function renderShellA18e90Triple1Val() {
  return RENDER_SHELL_A18E90_TRIPLE1_VAL >>> 0;
}
export function renderShellA18e90Triple1StrVa() {
  return RENDER_SHELL_A18E90_TRIPLE1_STR_VA >>> 0;
}
export function renderShellA18e90Triple1Val2() {
  return RENDER_SHELL_A18E90_TRIPLE1_VAL2 >>> 0;
}
export function renderShellA18e90Triple2NameVa() {
  return RENDER_SHELL_A18E90_TRIPLE2_NAME_VA >>> 0;
}
export function renderShellA18e90Triple2Arg2() {
  return RENDER_SHELL_A18E90_TRIPLE2_ARG2 >>> 0;
}
export function renderShellA18e90Triple2BaseVa() {
  return RENDER_SHELL_A18E90_TRIPLE2_BASE_VA >>> 0;
}
export function renderShellA18e90Triple2Val() {
  return RENDER_SHELL_A18E90_TRIPLE2_VAL >>> 0;
}
export function renderShellA18e90Triple2StrVa() {
  return RENDER_SHELL_A18E90_TRIPLE2_STR_VA >>> 0;
}
export function renderShellA18e90Triple2Val2() {
  return RENDER_SHELL_A18E90_TRIPLE2_VAL2 >>> 0;
}
export function renderShellA18e90Triple3NameVa() {
  return RENDER_SHELL_A18E90_TRIPLE3_NAME_VA >>> 0;
}
export function renderShellA18e90Triple3Arg2() {
  return RENDER_SHELL_A18E90_TRIPLE3_ARG2 >>> 0;
}
export function renderShellA18e90Triple3BaseVa() {
  return RENDER_SHELL_A18E90_TRIPLE3_BASE_VA >>> 0;
}
export function renderShellA18e90Triple3Val() {
  return RENDER_SHELL_A18E90_TRIPLE3_VAL >>> 0;
}
export function renderShellA18e90Triple3StrVa() {
  return RENDER_SHELL_A18E90_TRIPLE3_STR_VA >>> 0;
}
export function renderShellA18e90Triple3Val2() {
  return RENDER_SHELL_A18E90_TRIPLE3_VAL2 >>> 0;
}
export function renderShellA18e90VtSlot78() {
  return RENDER_SHELL_A18E90_VT_SLOT_78 >>> 0;
}
export function renderShellA18e90VtSlot18() {
  return RENDER_SHELL_A18E90_VT_SLOT_18 >>> 0;
}
export function renderShellA18e90VtSlot58() {
  return RENDER_SHELL_A18E90_VT_SLOT_58 >>> 0;
}
export function renderShellA18e90Vt18Arg0() {
  return RENDER_SHELL_A18E90_VT18_ARG0 >>> 0;
}
export function renderShellA18e90Vt18Arg1() {
  return RENDER_SHELL_A18E90_VT18_ARG1 >>> 0;
}
export function renderShellA18e90AllocSize() {
  return RENDER_SHELL_A18E90_ALLOC_SIZE >>> 0;
}
export function renderShellA18e90CtorVa() {
  return RENDER_SHELL_A18E90_CTOR_VA >>> 0;
}
export function renderShellA18e90ColorArgBits() {
  return RENDER_SHELL_A18E90_COLOR_ARG_BITS >>> 0;
}
export function renderShellA18e90ColorCtorVa() {
  return RENDER_SHELL_A18E90_COLOR_CTOR_VA >>> 0;
}
export function renderShellA18e90ObjGlobalVa() {
  return RENDER_SHELL_A18E90_OBJ_GLOBAL_VA >>> 0;
}
export function renderShellA18e90ObjFlagOff() {
  return RENDER_SHELL_A18E90_OBJ_FLAG_OFF >>> 0;
}
export function renderShellA18e90ObjFlagVal() {
  return RENDER_SHELL_A18E90_OBJ_FLAG_VAL >>> 0;
}
export function renderShellA18e90Flag379b4Va() {
  return RENDER_SHELL_A18E90_FLAG_379B4_VA >>> 0;
}
export function renderShellA18e90Flag37984Va() {
  return RENDER_SHELL_A18E90_FLAG_37984_VA >>> 0;
}
export function renderShellA18e90FlagVal() {
  return RENDER_SHELL_A18E90_FLAG_VAL >>> 0;
}
export function renderShellA18e90HookVa0() {
  return RENDER_SHELL_A18E90_HOOK_VA_0 >>> 0;
}
export function renderShellA18e90HookVa1() {
  return RENDER_SHELL_A18E90_HOOK_VA_1 >>> 0;
}
export function renderShellA18e90TailHookTargetVa() {
  return RENDER_SHELL_A18E90_TAIL_HOOK_TARGET_VA >>> 0;
}
export function renderShellA18e90Vt58Float0Bits() {
  return RENDER_SHELL_A18E90_VT58_FLOAT0_BITS >>> 0;
}
export function renderShellA18e90Vt58Float1Bits() {
  return RENDER_SHELL_A18E90_VT58_FLOAT1_BITS >>> 0;
}

/* ============================================================================
 * ABI v59: 0xa172e0 registry loader (section-notes/render-shell-v59/NOTES.md
 * + cpu-dump/00a172e0.txt). Byte gates mask & 0xff; word gate & 0xffff.
 * ========================================================================== */

export const RENDER_SHELL_A172E0_HOST_VA = 0x00a172e0;
export const RENDER_SHELL_A172E0_END_VA = 0x00a17621;
export const RENDER_SHELL_A172E0_NEXT_VA = 0x00a17630;
export const RENDER_SHELL_A172E0_CALLER_COUNT = 0x1;
export const RENDER_SHELL_A172E0_CALLER_LAST_VA = 0x00a68853;
export const RENDER_SHELL_A172E0_ADDR_TAKEN_COUNT = 0x1;
export const RENDER_SHELL_A172E0_ADDR_TAKEN_TABLE_VA = 0x00b81cc8;
export const RENDER_SHELL_A172E0_EAX_WRITES = 0x1d;
export const RENDER_SHELL_A172E0_STACK_ARGS = 0x2;
export const RENDER_SHELL_A172E0_THIS_CALL = 0x0;
export const RENDER_SHELL_A172E0_SEH_REG_VA = 0x00b10fed;
export const RENDER_SHELL_A172E0_GS_COOKIE_VA = 0x00bf93b4;
export const RENDER_SHELL_A172E0_GLOBAL_STR_VA = 0x00c5aa98;
export const RENDER_SHELL_A172E0_DEFAULT_STR_VA = 0x00b7ded4;
export const RENDER_SHELL_A172E0_CMP_IAT_VA = 0x00b18934;
export const RENDER_SHELL_A172E0_LOAD_FN_VA = 0x00a16f50;
export const RENDER_SHELL_A172E0_CB1_VA = 0x00b1825c;
export const RENDER_SHELL_A172E0_CB2_VA = 0x00b187b0;
export const RENDER_SHELL_A172E0_ENTRY_OFF = 0x114;
export const RENDER_SHELL_A172E0_STATE_468_OFF = 0x468;
export const RENDER_SHELL_A172E0_STATE_46C_OFF = 0x46c;
export const RENDER_SHELL_A172E0_STATE_470_OFF = 0x470;
export const RENDER_SHELL_A172E0_SUB_218_OFF = 0x218;
export const RENDER_SHELL_A172E0_SUB_2C_OFF = 0x2c;
export const RENDER_SHELL_A172E0_SUB_234_OFF = 0x234;
export const RENDER_SHELL_A172E0_COPY_SIZE = 0x104;
export const RENDER_SHELL_A172E0_Q_BYTE_VAL = 0x3f;
export const RENDER_SHELL_A172E0_CHAR_OFF = 0x11;
export const RENDER_SHELL_A172E0_CHAR_ZERO = 0x0;
export const RENDER_SHELL_A172E0_OUT8_VAL = 0x1;
export const RENDER_SHELL_A172E0_OUT12_VAL = 0x0;
export const RENDER_SHELL_A172E0_OUT0_ZERO = 0x0;
export const RENDER_SHELL_A172E0_OUT4_WORD = 0x114;
export const RENDER_SHELL_A172E0_ATTR_2000 = 0x2000;
export const RENDER_SHELL_A172E0_ATTR_4000 = 0x4000;
export const RENDER_SHELL_A172E0_ATTR_8000 = 0x8000;
export const RENDER_SHELL_A172E0_CMPSTR0_VA = 0x00b1cebc;
export const RENDER_SHELL_A172E0_CMPSTR1_VA = 0x00b1ceb8;
export const RENDER_SHELL_A172E0_HASH_FN_VA = 0x00a5a7a0;
export const RENDER_SHELL_A172E0_GROW_FN_VA = 0x00a17630;
export const RENDER_SHELL_A172E0_RELEASE_FN_VA = 0x00a648b0;
export const RENDER_SHELL_A172E0_RELEASE_IAT_VA = 0x00b18290;
export const RENDER_SHELL_A172E0_CB3_VA = 0x00b187dc;
export const RENDER_SHELL_A172E0_ERR_IAT_VA = 0x00b188b0;
export const RENDER_SHELL_A172E0_ERR_CODE = 0x9;
export const RENDER_SHELL_A172E0_REC_SIZE = 0x8;
export const RENDER_SHELL_A172E0_NEG1 = 0xffffffff;

export function renderShellA172e0EmptyGate(p, b0) {
  /* 0xa17308..0xa17318: null arg0 OR first byte 0 -> cl=1 (empty). */
  return p === 0 || (b0 & 0xff) === 0 ? 1 : 0;
}
export function renderShellA172e0StrSelect(e) {
  /* 0xa17327 cmove: e==0 keeps arg0 (sentinel 0), else default. */
  return (e & 0xff) === 0 ? 0 : RENDER_SHELL_A172E0_DEFAULT_STR_VA;
}
export function renderShellA172e0ByteNonzero(b) {
  /* 0xa17333 test al,al; jne: strlen scan continue. */
  return (b & 0xff) !== 0 ? 1 : 0;
}
export function renderShellA172e0LenZeroGate(len) {
  /* 0xa1733c je: strlen == 0 skips the register call. */
  return len === 0 ? 1 : 0;
}
export function renderShellA172e0Field468Gate(v) {
  /* 0xa17386 cmp [esi+0x468],0; je simple path. */
  return v === 0 ? 1 : 0;
}
export function renderShellA172e0Field46cGate(v) {
  /* 0xa173a7/0xa175be cmp -1; je skip release. */
  return v === 0xffffffff ? 1 : 0;
}
export function renderShellA172e0NullGate(p) {
  /* 0xa173c5/0xa175b4 test; je exit paths. */
  return p === 0 ? 1 : 0;
}
export function renderShellA172e0Call1Gate(v) {
  /* 0xa173ba test eax,eax; je cb1-fail cleanup. */
  return v === 0 ? 1 : 0;
}
export function renderShellA172e0Call2Gate(v) {
  /* 0xa173e8/0xa17412 test eax,eax; je error path. */
  return v === 0 ? 1 : 0;
}
export function renderShellA172e0WordZeroGate(w) {
  /* 0xa173ec cmp word ptr [edi+0x234],0; je ok path. */
  return (w & 0xffff) === 0 ? 1 : 0;
}
export function renderShellA172e0Bit40Gate(b) {
  /* 0xa1743a test al,0x40; je -> 0x2000 else continue. */
  return (b & 0xff) & 0x40 ? 1 : 0;
}
export function renderShellA172e0Bit10Gate(b) {
  /* 0xa1744c test al,0x10; je -> 0x8000 else 0x4000. */
  return (b & 0xff) & 0x10 ? 1 : 0;
}
export function renderShellA172e0AttrSel(b) {
  /* 0xa1743e/50/5e: bit40 -> 0x2000, bit10 -> 0x4000, else 0x8000. */
  const x = b & 0xff;
  return x & 0x40 ? 0x2000 : x & 0x10 ? 0x4000 : 0x8000;
}
export function renderShellA172e0CmpByte(a, b) {
  /* 0xa174a0 sbb/or idiom: equal 0, a<b -> 0xffffffff, a>b -> 1. */
  const x = a & 0xff;
  const y = b & 0xff;
  return x === y ? 0 : x < y ? 0xffffffff : 1;
}
export function renderShellA172e0CmpSkipGate(res) {
  /* 0xa174ab/0xa174eb test eax,eax; je loop back. */
  return res === 0 ? 1 : 0;
}
export function renderShellA172e0AttrByte(flag) {
  /* 0xa17506 cmp edi,0x4000; sete cl; add cl,5 -> 5 or 6. */
  return flag === 0x4000 ? 6 : 5;
}
export function renderShellA172e0ReleaseGate(cl) {
  /* 0xa17547 test cl,4; jne loops (dead path for cl in {5,6}). */
  return (cl & 0xff) & 4 ? 1 : 0;
}
export function renderShellA172e0AppendFullGate(pos, cap) {
  /* 0xa17522 cmp edx,[edi+8]; je grow. */
  return pos === cap ? 1 : 0;
}
export function renderShellA172e0Release2Gate(v) {
  /* 0xa1755a test eax,eax; je loops. */
  return v === 0 ? 1 : 0;
}
export function renderShellA172e0Field470Gate(v) {
  /* 0xa175da test eax,eax; je skips the cb3 release. */
  return v === 0 ? 1 : 0;
}
export function renderShellA172e0HostVa() {
  return RENDER_SHELL_A172E0_HOST_VA >>> 0;
}
export function renderShellA172e0EndVa() {
  return RENDER_SHELL_A172E0_END_VA >>> 0;
}
export function renderShellA172e0NextVa() {
  return RENDER_SHELL_A172E0_NEXT_VA >>> 0;
}
export function renderShellA172e0CallerCount() {
  return RENDER_SHELL_A172E0_CALLER_COUNT >>> 0;
}
export function renderShellA172e0CallerLastVa() {
  return RENDER_SHELL_A172E0_CALLER_LAST_VA >>> 0;
}
export function renderShellA172e0AddrTakenCount() {
  return RENDER_SHELL_A172E0_ADDR_TAKEN_COUNT >>> 0;
}
export function renderShellA172e0AddrTakenTableVa() {
  return RENDER_SHELL_A172E0_ADDR_TAKEN_TABLE_VA >>> 0;
}
export function renderShellA172e0EaxWrites() {
  return RENDER_SHELL_A172E0_EAX_WRITES >>> 0;
}
export function renderShellA172e0StackArgs() {
  return RENDER_SHELL_A172E0_STACK_ARGS >>> 0;
}
export function renderShellA172e0ThisCall() {
  return RENDER_SHELL_A172E0_THIS_CALL >>> 0;
}
export function renderShellA172e0SehRegVa() {
  return RENDER_SHELL_A172E0_SEH_REG_VA >>> 0;
}
export function renderShellA172e0GsCookieVa() {
  return RENDER_SHELL_A172E0_GS_COOKIE_VA >>> 0;
}
export function renderShellA172e0GlobalStrVa() {
  return RENDER_SHELL_A172E0_GLOBAL_STR_VA >>> 0;
}
export function renderShellA172e0DefaultStrVa() {
  return RENDER_SHELL_A172E0_DEFAULT_STR_VA >>> 0;
}
export function renderShellA172e0CmpIatVa() {
  return RENDER_SHELL_A172E0_CMP_IAT_VA >>> 0;
}
export function renderShellA172e0LoadFnVa() {
  return RENDER_SHELL_A172E0_LOAD_FN_VA >>> 0;
}
export function renderShellA172e0Cb1Va() {
  return RENDER_SHELL_A172E0_CB1_VA >>> 0;
}
export function renderShellA172e0Cb2Va() {
  return RENDER_SHELL_A172E0_CB2_VA >>> 0;
}
export function renderShellA172e0EntryOff() {
  return RENDER_SHELL_A172E0_ENTRY_OFF >>> 0;
}
export function renderShellA172e0State468Off() {
  return RENDER_SHELL_A172E0_STATE_468_OFF >>> 0;
}
export function renderShellA172e0State46cOff() {
  return RENDER_SHELL_A172E0_STATE_46C_OFF >>> 0;
}
export function renderShellA172e0State470Off() {
  return RENDER_SHELL_A172E0_STATE_470_OFF >>> 0;
}
export function renderShellA172e0Sub218Off() {
  return RENDER_SHELL_A172E0_SUB_218_OFF >>> 0;
}
export function renderShellA172e0Sub2cOff() {
  return RENDER_SHELL_A172E0_SUB_2C_OFF >>> 0;
}
export function renderShellA172e0Sub234Off() {
  return RENDER_SHELL_A172E0_SUB_234_OFF >>> 0;
}
export function renderShellA172e0CopySize() {
  return RENDER_SHELL_A172E0_COPY_SIZE >>> 0;
}
export function renderShellA172e0QByteVal() {
  return RENDER_SHELL_A172E0_Q_BYTE_VAL >>> 0;
}
export function renderShellA172e0CharOff() {
  return RENDER_SHELL_A172E0_CHAR_OFF >>> 0;
}
export function renderShellA172e0CharZero() {
  return RENDER_SHELL_A172E0_CHAR_ZERO >>> 0;
}
export function renderShellA172e0Out8Val() {
  return RENDER_SHELL_A172E0_OUT8_VAL >>> 0;
}
export function renderShellA172e0Out12Val() {
  return RENDER_SHELL_A172E0_OUT12_VAL >>> 0;
}
export function renderShellA172e0Out0Zero() {
  return RENDER_SHELL_A172E0_OUT0_ZERO >>> 0;
}
export function renderShellA172e0Out4Word() {
  return RENDER_SHELL_A172E0_OUT4_WORD >>> 0;
}
export function renderShellA172e0Attr2000() {
  return RENDER_SHELL_A172E0_ATTR_2000 >>> 0;
}
export function renderShellA172e0Attr4000() {
  return RENDER_SHELL_A172E0_ATTR_4000 >>> 0;
}
export function renderShellA172e0Attr8000() {
  return RENDER_SHELL_A172E0_ATTR_8000 >>> 0;
}
export function renderShellA172e0Cmpstr0Va() {
  return RENDER_SHELL_A172E0_CMPSTR0_VA >>> 0;
}
export function renderShellA172e0Cmpstr1Va() {
  return RENDER_SHELL_A172E0_CMPSTR1_VA >>> 0;
}
export function renderShellA172e0HashFnVa() {
  return RENDER_SHELL_A172E0_HASH_FN_VA >>> 0;
}
export function renderShellA172e0GrowFnVa() {
  return RENDER_SHELL_A172E0_GROW_FN_VA >>> 0;
}
export function renderShellA172e0ReleaseFnVa() {
  return RENDER_SHELL_A172E0_RELEASE_FN_VA >>> 0;
}
export function renderShellA172e0ReleaseIatVa() {
  return RENDER_SHELL_A172E0_RELEASE_IAT_VA >>> 0;
}
export function renderShellA172e0Cb3Va() {
  return RENDER_SHELL_A172E0_CB3_VA >>> 0;
}
export function renderShellA172e0ErrIatVa() {
  return RENDER_SHELL_A172E0_ERR_IAT_VA >>> 0;
}
export function renderShellA172e0ErrCode() {
  return RENDER_SHELL_A172E0_ERR_CODE >>> 0;
}
export function renderShellA172e0RecSize() {
  return RENDER_SHELL_A172E0_REC_SIZE >>> 0;
}
export function renderShellA172e0Neg1() {
  return RENDER_SHELL_A172E0_NEG1 >>> 0;
}
export function renderShellA172e0TableVa() {
  return RENDER_SHELL_A172E0_ADDR_TAKEN_TABLE_VA >>> 0;
}

/* ============================================================================
 * ABI v60: 0xa17860 registry release probe (section-notes/
 * render-shell-v60-chain/NOTES.md + cpu-dump/00a17860.txt). SINGLE
 * FULL-dword gate (test eax,eax) - no byte gates in this body; NO
 * uint8_t in the C side. SEH reg 0xaf0a10 / GS cookie 0xbf93b4 pins.
 * ========================================================================== */

export const RENDER_SHELL_A17860_HOST_VA = 0x00a17860;
export const RENDER_SHELL_A17860_END_VA = 0x00a178c1;
export const RENDER_SHELL_A17860_NEXT_VA = 0x00a178d0;
export const RENDER_SHELL_A17860_CALLER_COUNT = 0xa;
export const RENDER_SHELL_A17860_CALLER_FIRST_VA = 0x0060fb85;
export const RENDER_SHELL_A17860_CALLER_LAST_VA = 0x008f4635;
export const RENDER_SHELL_A17860_ADDR_TAKEN_COUNT = 0x0;
export const RENDER_SHELL_A17860_EAX_WRITES = 0x4;
export const RENDER_SHELL_A17860_STACK_ARGS = 0x1;
export const RENDER_SHELL_A17860_THIS_CALL = 0x0;
export const RENDER_SHELL_A17860_SEH_REG_VA = 0x00af0a10;
export const RENDER_SHELL_A17860_GS_COOKIE_VA = 0x00bf93b4;
export const RENDER_SHELL_A17860_REGISTRY_VA = 0x00c379e0;
export const RENDER_SHELL_A17860_FIND_FN_VA = 0x00a17180;
export const RENDER_SHELL_A17860_RELEASE_FN_VA = 0x00a648b0;
export const RENDER_SHELL_A17860_RELEASE_CL_VAL = 0x1;
export const RENDER_SHELL_A17860_RELEASE_ARG0 = 0x0;
export const RENDER_SHELL_A17860_RELEASE_ARG1 = 0x0;

export function renderShellA17860FoundGate(v) {
  /* 0xa17890 test eax,eax; setne bl + 0xa17895 test/je 0xa178b0:
     FULL dword; nonzero -> found (return AL=1). */
  return v !== 0 ? 1 : 0;
}
export function renderShellA17860HostVa() {
  return RENDER_SHELL_A17860_HOST_VA >>> 0;
}
export function renderShellA17860EndVa() {
  return RENDER_SHELL_A17860_END_VA >>> 0;
}
export function renderShellA17860NextVa() {
  return RENDER_SHELL_A17860_NEXT_VA >>> 0;
}
export function renderShellA17860CallerCount() {
  return RENDER_SHELL_A17860_CALLER_COUNT >>> 0;
}
export function renderShellA17860CallerFirstVa() {
  return RENDER_SHELL_A17860_CALLER_FIRST_VA >>> 0;
}
export function renderShellA17860CallerLastVa() {
  return RENDER_SHELL_A17860_CALLER_LAST_VA >>> 0;
}
export function renderShellA17860AddrTakenCount() {
  return RENDER_SHELL_A17860_ADDR_TAKEN_COUNT >>> 0;
}
export function renderShellA17860EaxWrites() {
  return RENDER_SHELL_A17860_EAX_WRITES >>> 0;
}
export function renderShellA17860StackArgs() {
  return RENDER_SHELL_A17860_STACK_ARGS >>> 0;
}
export function renderShellA17860ThisCall() {
  return RENDER_SHELL_A17860_THIS_CALL >>> 0;
}
export function renderShellA17860SehRegVa() {
  return RENDER_SHELL_A17860_SEH_REG_VA >>> 0;
}
export function renderShellA17860GsCookieVa() {
  return RENDER_SHELL_A17860_GS_COOKIE_VA >>> 0;
}
export function renderShellA17860RegistryVa() {
  return RENDER_SHELL_A17860_REGISTRY_VA >>> 0;
}
export function renderShellA17860FindFnVa() {
  return RENDER_SHELL_A17860_FIND_FN_VA >>> 0;
}
export function renderShellA17860ReleaseFnVa() {
  return RENDER_SHELL_A17860_RELEASE_FN_VA >>> 0;
}
export function renderShellA17860ReleaseClVal() {
  return RENDER_SHELL_A17860_RELEASE_CL_VAL >>> 0;
}
export function renderShellA17860ReleaseArg0() {
  return RENDER_SHELL_A17860_RELEASE_ARG0 >>> 0;
}
export function renderShellA17860ReleaseArg1() {
  return RENDER_SHELL_A17860_RELEASE_ARG1 >>> 0;
}

/* ============================================================================
 * ABI v61: COLORMOD BAND (0x407140..0x4074b0, region-A carry-over).
 *   15 OPEN bodies, lea-corrected caller counts (update-v98-anm2-
 *   gapscan3 + update-v96-anm2-gapscan-detail); census-colormod.py.
 *   Byte-gate discipline: uint32_t args masked & 0xff; NO uint8_t.
 *   ABI 60 landed by W24-F5 (A17860); this band is 60 -> 61.
 * ========================================================================== */
export const RENDER_SHELL_A407170_HOST_VA = 0x00407170;
export const RENDER_SHELL_A407170_END_VA = 0x004071bf;
export const RENDER_SHELL_A407170_NEXT_VA = 0x004071c0;
export const RENDER_SHELL_A407170_CALLER_COUNT = 256;
export const RENDER_SHELL_A407170_CALLER_FIRST_VA = 0x0040fc6e;
export const RENDER_SHELL_A407170_CALLER_LAST_VA = 0x009fdaca;
export const RENDER_SHELL_A407170_ADDR_TAKEN_COUNT = 0;
export const RENDER_SHELL_A407170_EAX_WRITES = 1;
export const RENDER_SHELL_A407170_STACK_ARGS = 0;
export const RENDER_SHELL_A407170_THIS_CALL = 1;
export const RENDER_SHELL_A407170_TINT_BITS = 0x3f800000;
export const RENDER_SHELL_A407170_ZERO_COUNT = 0x7;

export const RENDER_SHELL_A4071F0_HOST_VA = 0x004071f0;
export const RENDER_SHELL_A4071F0_END_VA = 0x0040721e;
export const RENDER_SHELL_A4071F0_NEXT_VA = 0x00407220;
export const RENDER_SHELL_A4071F0_CALLER_COUNT = 175;
export const RENDER_SHELL_A4071F0_CALLER_FIRST_VA = 0x00411f60;
export const RENDER_SHELL_A4071F0_CALLER_LAST_VA = 0x009f40b2;
export const RENDER_SHELL_A4071F0_ADDR_TAKEN_COUNT = 0;
export const RENDER_SHELL_A4071F0_EAX_WRITES = 3;
export const RENDER_SHELL_A4071F0_STACK_ARGS = 1;
export const RENDER_SHELL_A4071F0_THIS_CALL = 1;
export const RENDER_SHELL_A4071F0_COLOR_FLOATS = 11;

export const RENDER_SHELL_A407220_HOST_VA = 0x00407220;
export const RENDER_SHELL_A407220_END_VA = 0x00407237;
export const RENDER_SHELL_A407220_NEXT_VA = 0x00407240;
export const RENDER_SHELL_A407220_CALLER_COUNT = 2;
export const RENDER_SHELL_A407220_CALLER_FIRST_VA = 0x0081d1c0;
export const RENDER_SHELL_A407220_CALLER_LAST_VA = 0x0081deb5;
export const RENDER_SHELL_A407220_ADDR_TAKEN_COUNT = 0;
export const RENDER_SHELL_A407220_EAX_WRITES = 1;
export const RENDER_SHELL_A407220_STACK_ARGS = 1;
export const RENDER_SHELL_A407220_THIS_CALL = 1;
export const RENDER_SHELL_A407220_ZERO_OFF = 0x10;
export const RENDER_SHELL_A407220_COPY_BYTES = 0x10;

export const RENDER_SHELL_A4072A0_HOST_VA = 0x004072a0;
export const RENDER_SHELL_A4072A0_END_VA = 0x004072a6;
export const RENDER_SHELL_A4072A0_NEXT_VA = 0x004072b0;
export const RENDER_SHELL_A4072A0_CALLER_COUNT = 1;
export const RENDER_SHELL_A4072A0_CALLER_FIRST_VA = 0x005ffb12;
export const RENDER_SHELL_A4072A0_CALLER_LAST_VA = 0x005ffb12;
export const RENDER_SHELL_A4072A0_ADDR_TAKEN_COUNT = 0;
export const RENDER_SHELL_A4072A0_EAX_WRITES = 0;
export const RENDER_SHELL_A4072A0_STACK_ARGS = 0;
export const RENDER_SHELL_A4072A0_THIS_CALL = 1;
export const RENDER_SHELL_A4072A0_FIELD_OFF = 0x1c;

export const RENDER_SHELL_A407140_HOST_VA = 0x00407140;
export const RENDER_SHELL_A407140_END_VA = 0x0040716e;
export const RENDER_SHELL_A407140_NEXT_VA = 0x00407170;
export const RENDER_SHELL_A407140_CALLER_COUNT = 8;
export const RENDER_SHELL_A407140_CALLER_FIRST_VA = 0x005e27a8;
export const RENDER_SHELL_A407140_CALLER_LAST_VA = 0x006c7964;
export const RENDER_SHELL_A407140_ADDR_TAKEN_COUNT = 0;
export const RENDER_SHELL_A407140_EAX_WRITES = 0;
export const RENDER_SHELL_A407140_STACK_ARGS = 0;
export const RENDER_SHELL_A407140_THIS_CALL = 0;
export const RENDER_SHELL_A407140_FLOOR_IAT_VA = 0x00af0917;

export const RENDER_SHELL_A407320_HOST_VA = 0x00407320;
export const RENDER_SHELL_A407320_END_VA = 0x00407364;
export const RENDER_SHELL_A407320_NEXT_VA = 0x00407370;
export const RENDER_SHELL_A407320_CALLER_COUNT = 3;
export const RENDER_SHELL_A407320_CALLER_FIRST_VA = 0x006c52e5;
export const RENDER_SHELL_A407320_CALLER_LAST_VA = 0x0080b629;
export const RENDER_SHELL_A407320_ADDR_TAKEN_COUNT = 0;
export const RENDER_SHELL_A407320_EAX_WRITES = 2;
export const RENDER_SHELL_A407320_STACK_ARGS = 1;
export const RENDER_SHELL_A407320_THIS_CALL = 1;
export const RENDER_SHELL_A407320_SSO_CAP = 0xf;
export const RENDER_SHELL_A407320_COPY_HOST_VA = 0x0040cf50;

export const RENDER_SHELL_A407370_HOST_VA = 0x00407370;
export const RENDER_SHELL_A407370_END_VA = 0x00407376;
export const RENDER_SHELL_A407370_NEXT_VA = 0x00407380;
export const RENDER_SHELL_A407370_CALLER_COUNT = 2;
export const RENDER_SHELL_A407370_CALLER_FIRST_VA = 0x005ff9df;
export const RENDER_SHELL_A407370_CALLER_LAST_VA = 0x0080aced;
export const RENDER_SHELL_A407370_ADDR_TAKEN_COUNT = 0;
export const RENDER_SHELL_A407370_EAX_WRITES = 0;
export const RENDER_SHELL_A407370_STACK_ARGS = 0;
export const RENDER_SHELL_A407370_THIS_CALL = 1;
export const RENDER_SHELL_A407370_FIELD_OFF = 0x10;

export const RENDER_SHELL_A407380_HOST_VA = 0x00407380;
export const RENDER_SHELL_A407380_END_VA = 0x00407396;
export const RENDER_SHELL_A407380_NEXT_VA = 0x004073a0;
export const RENDER_SHELL_A407380_CALLER_COUNT = 13;
export const RENDER_SHELL_A407380_CALLER_FIRST_VA = 0x004c218e;
export const RENDER_SHELL_A407380_CALLER_LAST_VA = 0x00789542;
export const RENDER_SHELL_A407380_ADDR_TAKEN_COUNT = 0;
export const RENDER_SHELL_A407380_EAX_WRITES = 3;
export const RENDER_SHELL_A407380_STACK_ARGS = 0;
export const RENDER_SHELL_A407380_THIS_CALL = 1;
export const RENDER_SHELL_A407380_EMPTY_LITERAL_VA = 0x00b1a4ec;
export const RENDER_SHELL_A407380_CAP_LIM = 0x10;

export const RENDER_SHELL_A4073A0_HOST_VA = 0x004073a0;
export const RENDER_SHELL_A4073A0_END_VA = 0x004073a8;
export const RENDER_SHELL_A4073A0_NEXT_VA = 0x004073b0;
export const RENDER_SHELL_A4073A0_CALLER_COUNT = 7;
export const RENDER_SHELL_A4073A0_CALLER_FIRST_VA = 0x005c1c09;
export const RENDER_SHELL_A4073A0_CALLER_LAST_VA = 0x00787e75;
export const RENDER_SHELL_A4073A0_ADDR_TAKEN_COUNT = 0;
export const RENDER_SHELL_A4073A0_EAX_WRITES = 0;
export const RENDER_SHELL_A4073A0_STACK_ARGS = 0;
export const RENDER_SHELL_A4073A0_THIS_CALL = 1;
export const RENDER_SHELL_A4073A0_FIELD_OFF = 0x4;

export const RENDER_SHELL_A4073B0_HOST_VA = 0x004073b0;
export const RENDER_SHELL_A4073B0_END_VA = 0x004073be;
export const RENDER_SHELL_A4073B0_NEXT_VA = 0x004073c0;
export const RENDER_SHELL_A4073B0_CALLER_COUNT = 38;
export const RENDER_SHELL_A4073B0_CALLER_FIRST_VA = 0x00446670;
export const RENDER_SHELL_A4073B0_CALLER_LAST_VA = 0x00976d86;
export const RENDER_SHELL_A4073B0_ADDR_TAKEN_COUNT = 0;
export const RENDER_SHELL_A4073B0_EAX_WRITES = 1;
export const RENDER_SHELL_A4073B0_STACK_ARGS = 0;
export const RENDER_SHELL_A4073B0_THIS_CALL = 1;
export const RENDER_SHELL_A4073B0_FIELD_OFF = 0x34;
export const RENDER_SHELL_A4073B0_HIGH_MASK = 0xffffff00;

export const RENDER_SHELL_A4073C0_HOST_VA = 0x004073c0;
export const RENDER_SHELL_A4073C0_END_VA = 0x004073c4;
export const RENDER_SHELL_A4073C0_NEXT_VA = 0x004073d0;
export const RENDER_SHELL_A4073C0_CALLER_COUNT = 60;
export const RENDER_SHELL_A4073C0_CALLER_FIRST_VA = 0x005b4783;
export const RENDER_SHELL_A4073C0_CALLER_LAST_VA = 0x0080b5d9;
export const RENDER_SHELL_A4073C0_ADDR_TAKEN_COUNT = 3;
export const RENDER_SHELL_A4073C0_ADDR_TAKEN_TABLE_VA = 0x0086b71b;
export const RENDER_SHELL_A4073C0_EAX_WRITES = 1;
export const RENDER_SHELL_A4073C0_STACK_ARGS = 0;
export const RENDER_SHELL_A4073C0_THIS_CALL = 1;
export const RENDER_SHELL_A4073C0_FIELD_OFF = 0x4;

export const RENDER_SHELL_A407440_HOST_VA = 0x00407440;
export const RENDER_SHELL_A407440_END_VA = 0x00407466;
export const RENDER_SHELL_A407440_NEXT_VA = 0x00407470;
export const RENDER_SHELL_A407440_CALLER_COUNT = 1;
export const RENDER_SHELL_A407440_CALLER_FIRST_VA = 0x006f22e5;
export const RENDER_SHELL_A407440_CALLER_LAST_VA = 0x006f22e5;
export const RENDER_SHELL_A407440_ADDR_TAKEN_COUNT = 0;
export const RENDER_SHELL_A407440_EAX_WRITES = 0;
export const RENDER_SHELL_A407440_STACK_ARGS = 4;
export const RENDER_SHELL_A407440_THIS_CALL = 0;
export const RENDER_SHELL_A407440_BASE_OFF = 0x8;
export const RENDER_SHELL_A407440_STEP_OFF = 0xc;
export const RENDER_SHELL_A407440_COUNT_OFF = 0x10;
export const RENDER_SHELL_A407440_FN_OFF = 0x14;
export const RENDER_SHELL_A407440_HOST_LEASE_VA = 0x00407440;

export const RENDER_SHELL_A407470_HOST_VA = 0x00407470;
export const RENDER_SHELL_A407470_END_VA = 0x00407479;
export const RENDER_SHELL_A407470_NEXT_VA = 0x00407480;
export const RENDER_SHELL_A407470_CALLER_COUNT = 5;
export const RENDER_SHELL_A407470_CALLER_FIRST_VA = 0x005d5f16;
export const RENDER_SHELL_A407470_CALLER_LAST_VA = 0x006ca396;
export const RENDER_SHELL_A407470_ADDR_TAKEN_COUNT = 0;
export const RENDER_SHELL_A407470_EAX_WRITES = 0;
export const RENDER_SHELL_A407470_STACK_ARGS = 0;
export const RENDER_SHELL_A407470_THIS_CALL = 1;
export const RENDER_SHELL_A407470_FIELD_OFF = 0x7240;

export const RENDER_SHELL_A4074A0_HOST_VA = 0x004074a0;
export const RENDER_SHELL_A4074A0_END_VA = 0x004074a7;
export const RENDER_SHELL_A4074A0_NEXT_VA = 0x004074b0;
export const RENDER_SHELL_A4074A0_CALLER_COUNT = 3;
export const RENDER_SHELL_A4074A0_CALLER_FIRST_VA = 0x005b3bec;
export const RENDER_SHELL_A4074A0_CALLER_LAST_VA = 0x005c02dc;
export const RENDER_SHELL_A4074A0_ADDR_TAKEN_COUNT = 0;
export const RENDER_SHELL_A4074A0_EAX_WRITES = 1;
export const RENDER_SHELL_A4074A0_STACK_ARGS = 0;
export const RENDER_SHELL_A4074A0_THIS_CALL = 1;
export const RENDER_SHELL_A4074A0_FIELD_OFF = 0x67758;

export const RENDER_SHELL_A4074B0_HOST_VA = 0x004074b0;
export const RENDER_SHELL_A4074B0_END_VA = 0x004074b7;
export const RENDER_SHELL_A4074B0_NEXT_VA = 0x004074c0;
export const RENDER_SHELL_A4074B0_CALLER_COUNT = 34;
export const RENDER_SHELL_A4074B0_CALLER_FIRST_VA = 0x005d6b78;
export const RENDER_SHELL_A4074B0_CALLER_LAST_VA = 0x0079d557;
export const RENDER_SHELL_A4074B0_ADDR_TAKEN_COUNT = 1;
export const RENDER_SHELL_A4074B0_ADDR_TAKEN_TABLE_VA = 0x0086d65b;
export const RENDER_SHELL_A4074B0_EAX_WRITES = 1;
export const RENDER_SHELL_A4074B0_STACK_ARGS = 0;
export const RENDER_SHELL_A4074B0_THIS_CALL = 1;
export const RENDER_SHELL_A4074B0_FIELD_OFF = 0x264f8;


/* ---- v61 laws ---- */

/** A407170 ColorMod identity init (array oracle). Returns dest. */
export function renderShellA407170Init(dest) {
  if (dest == null) return null;
  for (let i = 0; i < RENDER_SHELL_A4071F0_COLOR_FLOATS; i += 1) {
    dest[i] = i < 4 ? 1.0 : 0.0;
  }
  return dest;
}
/** A407170 mem variant (writes 11 dwords at destOff), returns destOff. */
export function renderShellA407170InitMem(view, destOff) {
  const d = asU32(destOff);
  if (d === 0 || !view) return 0;
  for (let i = 0; i < RENDER_SHELL_A4071F0_COLOR_FLOATS; i += 1) {
    view.setFloat32(d + i * 4, i < 4 ? 1.0 : 0.0, true);
  }
  return d;
}
export function renderShellA407170TintBits() {
  return RENDER_SHELL_A407170_TINT_BITS >>> 0;
}
/** A4071F0 self-alias gate (cmp ecx,eax / je skips the copy). */
export function renderShellA4071f0SelfAliasGate(dst, src) {
  return (dst >>> 0) === (src >>> 0) ? 1 : 0;
}
/** A4071F0 44-byte ColorMod copy (guarded, returns dest). */
export function renderShellA4071f0Copy(dest, src) {
  if (dest == null || src == null) return dest == null ? null : dest;
  if (dest === src) return dest;
  for (let i = 0; i < RENDER_SHELL_A4071F0_COLOR_FLOATS; i += 1) {
    dest[i] = f32(src[i]);
  }
  return dest;
}
/** A4071F0 mem variant. */
export function renderShellA4071f0CopyMem(view, destOff, srcOff) {
  const d = asU32(destOff);
  const s = asU32(srcOff);
  if (d === 0 || s === 0 || !view) return 0;
  if (d === s) return d;
  for (let i = 0; i < RENDER_SHELL_A4071F0_COLOR_FLOATS; i += 1) {
    view.setFloat32(d + i * 4, view.getFloat32(s + i * 4, true), true);
  }
  return d;
}
/** A407220 16B copy + zero [dst+0x10] (PE order: zero first). */
export function renderShellA407220Copy16Zero10(dest, src) {
  if (dest == null || src == null) return;
  dest[4] = 0.0;
  for (let i = 0; i < 4; i += 1) dest[i] = f32(src[i]);
}
export function renderShellA407220Copy16Zero10Mem(view, destOff, srcOff) {
  const d = asU32(destOff);
  const s = asU32(srcOff);
  if (d === 0 || s === 0 || !view) return;
  view.setFloat32(d + RENDER_SHELL_A407220_ZERO_OFF, 0.0, true);
  for (let i = 0; i < 4; i += 1) {
    view.setFloat32(d + i * 4, view.getFloat32(s + i * 4, true), true);
  }
}
export function renderShellA407220ZeroOff() {
  return RENDER_SHELL_A407220_ZERO_OFF >>> 0;
}
/** A4072A0 movss [dest+0x1c] (writer). */
export function renderShellA4072a0Store1c(dest, v) {
  if (dest == null) return;
  dest[7] = f32(v);
}
export function renderShellA4072a0Store1cMem(view, destOff, v) {
  const d = asU32(destOff);
  if (d === 0 || !view) return;
  view.setFloat32(d + RENDER_SHELL_A4072A0_FIELD_OFF, f32(v), true);
}
export function renderShellA4072a0Field1cOff() {
  return RENDER_SHELL_A4072A0_FIELD_OFF >>> 0;
}
/** A407140 float32 floor wrapper (composes the v26 af0917 leaf). */
export function renderShellA407140FloorF32(x) {
  return renderShellAf0917Floor(x);
}
/** A407320 FULL-dword clear gate ([this+0] == 0 -> SSO path). */
export function renderShellA407320ClearGate(dataPtr) {
  return (dataPtr >>> 0) === 0 ? 1 : 0;
}
/** A407320 SSO clear writer (6 stores, PE order) — mem variant only. */
export function renderShellA407320SsoZeroMem(view, dst) {
  const d = asU32(dst);
  if (d === 0 || !view) return;
  view.setUint32(d + 0x00, 0, true);
  view.setUint32(d + 0x10, 0, true);
  view.setUint32(d + 0x14, RENDER_SHELL_A407320_SSO_CAP, true);
  view.setUint8(d + 0x00, 0);
  view.setUint32(d + 0x10, 0, true);
  view.setUint8(d + 0x00, 0);
}
export function renderShellA407320SsoCap() {
  return RENDER_SHELL_A407320_SSO_CAP >>> 0;
}
export function renderShellA407320CopyHostVa() {
  return RENDER_SHELL_A407320_COPY_HOST_VA >>> 0;
}
/** A407370 float getter at +0x10 (mem-backed). */
export function renderShellA407370Float10Mem(view, addr) {
  return f32(view.getFloat32((addr >>> 0) + RENDER_SHELL_A407370_FIELD_OFF, true));
}
/** A407380 buf==0 gate (je 0x407390 -> empty literal). */
export function renderShellA407380BufNullGate(buf) {
  return (buf >>> 0) === 0 ? 1 : 0;
}
/** A407380 UNSIGNED cap<0x10 gate (jb skips the data load). */
export function renderShellA407380CapGate(cap) {
  return (cap >>> 0) < RENDER_SHELL_A407380_CAP_LIM ? 1 : 0;
}
/** A407380 SSO data-ptr select (buf/cap/data inputs). */
export function renderShellA407380Select(buf, cap, data) {
  const b = buf >>> 0;
  const c = cap >>> 0;
  if (b === 0) return RENDER_SHELL_A407380_EMPTY_LITERAL_VA >>> 0;
  if (c < RENDER_SHELL_A407380_CAP_LIM) return b;
  return data >>> 0;
}
export function renderShellA407380EmptyLiteralVa() {
  return RENDER_SHELL_A407380_EMPTY_LITERAL_VA >>> 0;
}
/** A4073A0 FULL-dword null boolean (cmp [ecx+4],0 / sete al). */
export function renderShellA4073a0Null4(v) {
  return (v >>> 0) === 0 ? 1 : 0;
}
/** A4073B0 byte-34 getter with faithful EAX (pointer high bits). */
export function renderShellA4073b0Byte34(p, b34) {
  const pp = p >>> 0;
  const high = pp & RENDER_SHELL_A4073B0_HIGH_MASK;
  const low = pp === 0 ? 0 : (b34 & 0xff);
  return (high | low) >>> 0;
}
export function renderShellA4073b0HighMask() {
  return RENDER_SHELL_A4073B0_HIGH_MASK >>> 0;
}
/** A4073C0 dword getter at +4 (mem-backed). */
export function renderShellA4073c0Dword4Mem(view, addr) {
  return view.getUint32((addr >>> 0) + RENDER_SHELL_A4073C0_FIELD_OFF, true) >>> 0;
}
/** A407440 count==0 early-out gate (je 0x407461). */
export function renderShellA407440CountGate(count) {
  return (count >>> 0) === 0 ? 1 : 0;
}
/** A407440 step add (add edi,[ebp+0xc], 32-bit wrap). */
export function renderShellA407440StepAdd(base, step) {
  return ((base >>> 0) + (step >>> 0)) >>> 0;
}
/** A407470 float getter at +0x7240 (mem-backed). */
export function renderShellA407470Float7240Mem(view, addr) {
  return f32(view.getFloat32((addr >>> 0) + RENDER_SHELL_A407470_FIELD_OFF, true));
}
/** A4074A0 lea address add (no deref). */
export function renderShellA4074a0FieldAddr(addr) {
  return ((addr >>> 0) + RENDER_SHELL_A4074A0_FIELD_OFF) >>> 0;
}
/** A4074B0 dword getter at +0x264f8 (mem-backed). */
export function renderShellA4074b0Dword264f8Mem(view, addr) {
  return view.getUint32((addr >>> 0) + RENDER_SHELL_A4074B0_FIELD_OFF, true) >>> 0;
}



export function renderShellA407170HostVa() {
  return RENDER_SHELL_A407170_HOSTVA >>> 0;
}
export function renderShellA407170EndVa() {
  return RENDER_SHELL_A407170_ENDVA >>> 0;
}
export function renderShellA407170NextVa() {
  return RENDER_SHELL_A407170_NEXTVA >>> 0;
}
export function renderShellA407170CallerCount() {
  return RENDER_SHELL_A407170_CALLERCOUNT >>> 0;
}
export function renderShellA407170CallerFirstVa() {
  return RENDER_SHELL_A407170_CALLERFIRSTVA >>> 0;
}
export function renderShellA407170CallerLastVa() {
  return RENDER_SHELL_A407170_CALLERLASTVA >>> 0;
}
export function renderShellA407170AddrTakenCount() {
  return RENDER_SHELL_A407170_ADDRTAKENCOUNT >>> 0;
}
export function renderShellA407170EaxWrites() {
  return RENDER_SHELL_A407170_EAXWRITES >>> 0;
}
export function renderShellA407170StackArgs() {
  return RENDER_SHELL_A407170_STACKARGS >>> 0;
}
export function renderShellA407170ThisCall() {
  return RENDER_SHELL_A407170_THISCALL >>> 0;
}

export function renderShellA4071f0HostVa() {
  return RENDER_SHELL_A4071F0_HOSTVA >>> 0;
}
export function renderShellA4071f0EndVa() {
  return RENDER_SHELL_A4071F0_ENDVA >>> 0;
}
export function renderShellA4071f0NextVa() {
  return RENDER_SHELL_A4071F0_NEXTVA >>> 0;
}
export function renderShellA4071f0CallerCount() {
  return RENDER_SHELL_A4071F0_CALLERCOUNT >>> 0;
}
export function renderShellA4071f0CallerFirstVa() {
  return RENDER_SHELL_A4071F0_CALLERFIRSTVA >>> 0;
}
export function renderShellA4071f0CallerLastVa() {
  return RENDER_SHELL_A4071F0_CALLERLASTVA >>> 0;
}
export function renderShellA4071f0AddrTakenCount() {
  return RENDER_SHELL_A4071F0_ADDRTAKENCOUNT >>> 0;
}
export function renderShellA4071f0EaxWrites() {
  return RENDER_SHELL_A4071F0_EAXWRITES >>> 0;
}
export function renderShellA4071f0StackArgs() {
  return RENDER_SHELL_A4071F0_STACKARGS >>> 0;
}
export function renderShellA4071f0ThisCall() {
  return RENDER_SHELL_A4071F0_THISCALL >>> 0;
}

export function renderShellA407220HostVa() {
  return RENDER_SHELL_A407220_HOSTVA >>> 0;
}
export function renderShellA407220EndVa() {
  return RENDER_SHELL_A407220_ENDVA >>> 0;
}
export function renderShellA407220NextVa() {
  return RENDER_SHELL_A407220_NEXTVA >>> 0;
}
export function renderShellA407220CallerCount() {
  return RENDER_SHELL_A407220_CALLERCOUNT >>> 0;
}
export function renderShellA407220CallerFirstVa() {
  return RENDER_SHELL_A407220_CALLERFIRSTVA >>> 0;
}
export function renderShellA407220CallerLastVa() {
  return RENDER_SHELL_A407220_CALLERLASTVA >>> 0;
}
export function renderShellA407220AddrTakenCount() {
  return RENDER_SHELL_A407220_ADDRTAKENCOUNT >>> 0;
}
export function renderShellA407220EaxWrites() {
  return RENDER_SHELL_A407220_EAXWRITES >>> 0;
}
export function renderShellA407220StackArgs() {
  return RENDER_SHELL_A407220_STACKARGS >>> 0;
}
export function renderShellA407220ThisCall() {
  return RENDER_SHELL_A407220_THISCALL >>> 0;
}

export function renderShellA4072a0HostVa() {
  return RENDER_SHELL_A4072A0_HOSTVA >>> 0;
}
export function renderShellA4072a0EndVa() {
  return RENDER_SHELL_A4072A0_ENDVA >>> 0;
}
export function renderShellA4072a0NextVa() {
  return RENDER_SHELL_A4072A0_NEXTVA >>> 0;
}
export function renderShellA4072a0CallerCount() {
  return RENDER_SHELL_A4072A0_CALLERCOUNT >>> 0;
}
export function renderShellA4072a0CallerFirstVa() {
  return RENDER_SHELL_A4072A0_CALLERFIRSTVA >>> 0;
}
export function renderShellA4072a0CallerLastVa() {
  return RENDER_SHELL_A4072A0_CALLERLASTVA >>> 0;
}
export function renderShellA4072a0AddrTakenCount() {
  return RENDER_SHELL_A4072A0_ADDRTAKENCOUNT >>> 0;
}
export function renderShellA4072a0EaxWrites() {
  return RENDER_SHELL_A4072A0_EAXWRITES >>> 0;
}
export function renderShellA4072a0StackArgs() {
  return RENDER_SHELL_A4072A0_STACKARGS >>> 0;
}
export function renderShellA4072a0ThisCall() {
  return RENDER_SHELL_A4072A0_THISCALL >>> 0;
}

export function renderShellA407140HostVa() {
  return RENDER_SHELL_A407140_HOSTVA >>> 0;
}
export function renderShellA407140EndVa() {
  return RENDER_SHELL_A407140_ENDVA >>> 0;
}
export function renderShellA407140NextVa() {
  return RENDER_SHELL_A407140_NEXTVA >>> 0;
}
export function renderShellA407140CallerCount() {
  return RENDER_SHELL_A407140_CALLERCOUNT >>> 0;
}
export function renderShellA407140CallerFirstVa() {
  return RENDER_SHELL_A407140_CALLERFIRSTVA >>> 0;
}
export function renderShellA407140CallerLastVa() {
  return RENDER_SHELL_A407140_CALLERLASTVA >>> 0;
}
export function renderShellA407140AddrTakenCount() {
  return RENDER_SHELL_A407140_ADDRTAKENCOUNT >>> 0;
}
export function renderShellA407140EaxWrites() {
  return RENDER_SHELL_A407140_EAXWRITES >>> 0;
}
export function renderShellA407140StackArgs() {
  return RENDER_SHELL_A407140_STACKARGS >>> 0;
}
export function renderShellA407140ThisCall() {
  return RENDER_SHELL_A407140_THISCALL >>> 0;
}

export function renderShellA407320HostVa() {
  return RENDER_SHELL_A407320_HOSTVA >>> 0;
}
export function renderShellA407320EndVa() {
  return RENDER_SHELL_A407320_ENDVA >>> 0;
}
export function renderShellA407320NextVa() {
  return RENDER_SHELL_A407320_NEXTVA >>> 0;
}
export function renderShellA407320CallerCount() {
  return RENDER_SHELL_A407320_CALLERCOUNT >>> 0;
}
export function renderShellA407320CallerFirstVa() {
  return RENDER_SHELL_A407320_CALLERFIRSTVA >>> 0;
}
export function renderShellA407320CallerLastVa() {
  return RENDER_SHELL_A407320_CALLERLASTVA >>> 0;
}
export function renderShellA407320AddrTakenCount() {
  return RENDER_SHELL_A407320_ADDRTAKENCOUNT >>> 0;
}
export function renderShellA407320EaxWrites() {
  return RENDER_SHELL_A407320_EAXWRITES >>> 0;
}
export function renderShellA407320StackArgs() {
  return RENDER_SHELL_A407320_STACKARGS >>> 0;
}
export function renderShellA407320ThisCall() {
  return RENDER_SHELL_A407320_THISCALL >>> 0;
}

export function renderShellA407370HostVa() {
  return RENDER_SHELL_A407370_HOSTVA >>> 0;
}
export function renderShellA407370EndVa() {
  return RENDER_SHELL_A407370_ENDVA >>> 0;
}
export function renderShellA407370NextVa() {
  return RENDER_SHELL_A407370_NEXTVA >>> 0;
}
export function renderShellA407370CallerCount() {
  return RENDER_SHELL_A407370_CALLERCOUNT >>> 0;
}
export function renderShellA407370CallerFirstVa() {
  return RENDER_SHELL_A407370_CALLERFIRSTVA >>> 0;
}
export function renderShellA407370CallerLastVa() {
  return RENDER_SHELL_A407370_CALLERLASTVA >>> 0;
}
export function renderShellA407370AddrTakenCount() {
  return RENDER_SHELL_A407370_ADDRTAKENCOUNT >>> 0;
}
export function renderShellA407370EaxWrites() {
  return RENDER_SHELL_A407370_EAXWRITES >>> 0;
}
export function renderShellA407370StackArgs() {
  return RENDER_SHELL_A407370_STACKARGS >>> 0;
}
export function renderShellA407370ThisCall() {
  return RENDER_SHELL_A407370_THISCALL >>> 0;
}

export function renderShellA407380HostVa() {
  return RENDER_SHELL_A407380_HOSTVA >>> 0;
}
export function renderShellA407380EndVa() {
  return RENDER_SHELL_A407380_ENDVA >>> 0;
}
export function renderShellA407380NextVa() {
  return RENDER_SHELL_A407380_NEXTVA >>> 0;
}
export function renderShellA407380CallerCount() {
  return RENDER_SHELL_A407380_CALLERCOUNT >>> 0;
}
export function renderShellA407380CallerFirstVa() {
  return RENDER_SHELL_A407380_CALLERFIRSTVA >>> 0;
}
export function renderShellA407380CallerLastVa() {
  return RENDER_SHELL_A407380_CALLERLASTVA >>> 0;
}
export function renderShellA407380AddrTakenCount() {
  return RENDER_SHELL_A407380_ADDRTAKENCOUNT >>> 0;
}
export function renderShellA407380EaxWrites() {
  return RENDER_SHELL_A407380_EAXWRITES >>> 0;
}
export function renderShellA407380StackArgs() {
  return RENDER_SHELL_A407380_STACKARGS >>> 0;
}
export function renderShellA407380ThisCall() {
  return RENDER_SHELL_A407380_THISCALL >>> 0;
}

export function renderShellA4073a0HostVa() {
  return RENDER_SHELL_A4073A0_HOSTVA >>> 0;
}
export function renderShellA4073a0EndVa() {
  return RENDER_SHELL_A4073A0_ENDVA >>> 0;
}
export function renderShellA4073a0NextVa() {
  return RENDER_SHELL_A4073A0_NEXTVA >>> 0;
}
export function renderShellA4073a0CallerCount() {
  return RENDER_SHELL_A4073A0_CALLERCOUNT >>> 0;
}
export function renderShellA4073a0CallerFirstVa() {
  return RENDER_SHELL_A4073A0_CALLERFIRSTVA >>> 0;
}
export function renderShellA4073a0CallerLastVa() {
  return RENDER_SHELL_A4073A0_CALLERLASTVA >>> 0;
}
export function renderShellA4073a0AddrTakenCount() {
  return RENDER_SHELL_A4073A0_ADDRTAKENCOUNT >>> 0;
}
export function renderShellA4073a0EaxWrites() {
  return RENDER_SHELL_A4073A0_EAXWRITES >>> 0;
}
export function renderShellA4073a0StackArgs() {
  return RENDER_SHELL_A4073A0_STACKARGS >>> 0;
}
export function renderShellA4073a0ThisCall() {
  return RENDER_SHELL_A4073A0_THISCALL >>> 0;
}

export function renderShellA4073b0HostVa() {
  return RENDER_SHELL_A4073B0_HOSTVA >>> 0;
}
export function renderShellA4073b0EndVa() {
  return RENDER_SHELL_A4073B0_ENDVA >>> 0;
}
export function renderShellA4073b0NextVa() {
  return RENDER_SHELL_A4073B0_NEXTVA >>> 0;
}
export function renderShellA4073b0CallerCount() {
  return RENDER_SHELL_A4073B0_CALLERCOUNT >>> 0;
}
export function renderShellA4073b0CallerFirstVa() {
  return RENDER_SHELL_A4073B0_CALLERFIRSTVA >>> 0;
}
export function renderShellA4073b0CallerLastVa() {
  return RENDER_SHELL_A4073B0_CALLERLASTVA >>> 0;
}
export function renderShellA4073b0AddrTakenCount() {
  return RENDER_SHELL_A4073B0_ADDRTAKENCOUNT >>> 0;
}
export function renderShellA4073b0EaxWrites() {
  return RENDER_SHELL_A4073B0_EAXWRITES >>> 0;
}
export function renderShellA4073b0StackArgs() {
  return RENDER_SHELL_A4073B0_STACKARGS >>> 0;
}
export function renderShellA4073b0ThisCall() {
  return RENDER_SHELL_A4073B0_THISCALL >>> 0;
}

export function renderShellA4073c0HostVa() {
  return RENDER_SHELL_A4073C0_HOSTVA >>> 0;
}
export function renderShellA4073c0EndVa() {
  return RENDER_SHELL_A4073C0_ENDVA >>> 0;
}
export function renderShellA4073c0NextVa() {
  return RENDER_SHELL_A4073C0_NEXTVA >>> 0;
}
export function renderShellA4073c0CallerCount() {
  return RENDER_SHELL_A4073C0_CALLERCOUNT >>> 0;
}
export function renderShellA4073c0CallerFirstVa() {
  return RENDER_SHELL_A4073C0_CALLERFIRSTVA >>> 0;
}
export function renderShellA4073c0CallerLastVa() {
  return RENDER_SHELL_A4073C0_CALLERLASTVA >>> 0;
}
export function renderShellA4073c0AddrTakenCount() {
  return RENDER_SHELL_A4073C0_ADDRTAKENCOUNT >>> 0;
}
export function renderShellA4073c0EaxWrites() {
  return RENDER_SHELL_A4073C0_EAXWRITES >>> 0;
}
export function renderShellA4073c0StackArgs() {
  return RENDER_SHELL_A4073C0_STACKARGS >>> 0;
}
export function renderShellA4073c0ThisCall() {
  return RENDER_SHELL_A4073C0_THISCALL >>> 0;
}
export function renderShellA4073c0AddrTakenTableVa() {
  return RENDER_SHELL_A4073C0_ADDR_TAKEN_TABLE_VA >>> 0;
}

export function renderShellA407440HostVa() {
  return RENDER_SHELL_A407440_HOSTVA >>> 0;
}
export function renderShellA407440EndVa() {
  return RENDER_SHELL_A407440_ENDVA >>> 0;
}
export function renderShellA407440NextVa() {
  return RENDER_SHELL_A407440_NEXTVA >>> 0;
}
export function renderShellA407440CallerCount() {
  return RENDER_SHELL_A407440_CALLERCOUNT >>> 0;
}
export function renderShellA407440CallerFirstVa() {
  return RENDER_SHELL_A407440_CALLERFIRSTVA >>> 0;
}
export function renderShellA407440CallerLastVa() {
  return RENDER_SHELL_A407440_CALLERLASTVA >>> 0;
}
export function renderShellA407440AddrTakenCount() {
  return RENDER_SHELL_A407440_ADDRTAKENCOUNT >>> 0;
}
export function renderShellA407440EaxWrites() {
  return RENDER_SHELL_A407440_EAXWRITES >>> 0;
}
export function renderShellA407440StackArgs() {
  return RENDER_SHELL_A407440_STACKARGS >>> 0;
}
export function renderShellA407440ThisCall() {
  return RENDER_SHELL_A407440_THISCALL >>> 0;
}

export function renderShellA407470HostVa() {
  return RENDER_SHELL_A407470_HOSTVA >>> 0;
}
export function renderShellA407470EndVa() {
  return RENDER_SHELL_A407470_ENDVA >>> 0;
}
export function renderShellA407470NextVa() {
  return RENDER_SHELL_A407470_NEXTVA >>> 0;
}
export function renderShellA407470CallerCount() {
  return RENDER_SHELL_A407470_CALLERCOUNT >>> 0;
}
export function renderShellA407470CallerFirstVa() {
  return RENDER_SHELL_A407470_CALLERFIRSTVA >>> 0;
}
export function renderShellA407470CallerLastVa() {
  return RENDER_SHELL_A407470_CALLERLASTVA >>> 0;
}
export function renderShellA407470AddrTakenCount() {
  return RENDER_SHELL_A407470_ADDRTAKENCOUNT >>> 0;
}
export function renderShellA407470EaxWrites() {
  return RENDER_SHELL_A407470_EAXWRITES >>> 0;
}
export function renderShellA407470StackArgs() {
  return RENDER_SHELL_A407470_STACKARGS >>> 0;
}
export function renderShellA407470ThisCall() {
  return RENDER_SHELL_A407470_THISCALL >>> 0;
}

export function renderShellA4074a0HostVa() {
  return RENDER_SHELL_A4074A0_HOSTVA >>> 0;
}
export function renderShellA4074a0EndVa() {
  return RENDER_SHELL_A4074A0_ENDVA >>> 0;
}
export function renderShellA4074a0NextVa() {
  return RENDER_SHELL_A4074A0_NEXTVA >>> 0;
}
export function renderShellA4074a0CallerCount() {
  return RENDER_SHELL_A4074A0_CALLERCOUNT >>> 0;
}
export function renderShellA4074a0CallerFirstVa() {
  return RENDER_SHELL_A4074A0_CALLERFIRSTVA >>> 0;
}
export function renderShellA4074a0CallerLastVa() {
  return RENDER_SHELL_A4074A0_CALLERLASTVA >>> 0;
}
export function renderShellA4074a0AddrTakenCount() {
  return RENDER_SHELL_A4074A0_ADDRTAKENCOUNT >>> 0;
}
export function renderShellA4074a0EaxWrites() {
  return RENDER_SHELL_A4074A0_EAXWRITES >>> 0;
}
export function renderShellA4074a0StackArgs() {
  return RENDER_SHELL_A4074A0_STACKARGS >>> 0;
}
export function renderShellA4074a0ThisCall() {
  return RENDER_SHELL_A4074A0_THISCALL >>> 0;
}

export function renderShellA4074b0HostVa() {
  return RENDER_SHELL_A4074B0_HOSTVA >>> 0;
}
export function renderShellA4074b0EndVa() {
  return RENDER_SHELL_A4074B0_ENDVA >>> 0;
}
export function renderShellA4074b0NextVa() {
  return RENDER_SHELL_A4074B0_NEXTVA >>> 0;
}
export function renderShellA4074b0CallerCount() {
  return RENDER_SHELL_A4074B0_CALLERCOUNT >>> 0;
}
export function renderShellA4074b0CallerFirstVa() {
  return RENDER_SHELL_A4074B0_CALLERFIRSTVA >>> 0;
}
export function renderShellA4074b0CallerLastVa() {
  return RENDER_SHELL_A4074B0_CALLERLASTVA >>> 0;
}
export function renderShellA4074b0AddrTakenCount() {
  return RENDER_SHELL_A4074B0_ADDRTAKENCOUNT >>> 0;
}
export function renderShellA4074b0EaxWrites() {
  return RENDER_SHELL_A4074B0_EAXWRITES >>> 0;
}
export function renderShellA4074b0StackArgs() {
  return RENDER_SHELL_A4074B0_STACKARGS >>> 0;
}
export function renderShellA4074b0ThisCall() {
  return RENDER_SHELL_A4074B0_THISCALL >>> 0;
}
export function renderShellA4074b0AddrTakenTableVa() {
  return RENDER_SHELL_A4074B0_ADDR_TAKEN_TABLE_VA >>> 0;
}

/* ================= v62: Color RO/GO/BO fld getter trio ==========
   0x4072b0 `fld dword ptr [ecx+0x20]; ret` / 0x4072c0 +0x24 /
   0x4072d0 +0x28 — x87 float getters (3 B, 0 E8, 0 stores).
   Census (unit render-shell-v62-regiona): 5/4/4 E8 callers,
   1 addr-taken each (Lua kColorFields RO/GO/BO @ 0x8670de /
   0x8670f4 / 0x86710a). Twin fns mirror the header laws; the fld
   read is a pure f32 load at addr + off. */
export const RENDER_SHELL_A4072B0_HOST_VA = 0x004072b0;
export const RENDER_SHELL_A4072B0_END_VA = 0x004072b4;
export const RENDER_SHELL_A4072B0_NEXT_VA = 0x004072c0;
export const RENDER_SHELL_A4072B0_CALLER_COUNT = 5;
export const RENDER_SHELL_A4072B0_CALLER_FIRST_VA = 0x005ef4f5;
export const RENDER_SHELL_A4072B0_CALLER_LAST_VA = 0x0080a78b;
export const RENDER_SHELL_A4072B0_ADDR_TAKEN_COUNT = 1;
export const RENDER_SHELL_A4072B0_ADDR_TAKEN_TABLE_VA = 0x008670de;
export const RENDER_SHELL_A4072B0_EAX_WRITES = 0;
export const RENDER_SHELL_A4072B0_STACK_ARGS = 0;
export const RENDER_SHELL_A4072B0_THIS_CALL = 1;
export const RENDER_SHELL_A4072B0_FIELD_OFF = 0x20;

export const RENDER_SHELL_A4072C0_HOST_VA = 0x004072c0;
export const RENDER_SHELL_A4072C0_END_VA = 0x004072c4;
export const RENDER_SHELL_A4072C0_NEXT_VA = 0x004072d0;
export const RENDER_SHELL_A4072C0_CALLER_COUNT = 4;
export const RENDER_SHELL_A4072C0_CALLER_FIRST_VA = 0x005ef483;
export const RENDER_SHELL_A4072C0_CALLER_LAST_VA = 0x006c9bef;
export const RENDER_SHELL_A4072C0_ADDR_TAKEN_COUNT = 1;
export const RENDER_SHELL_A4072C0_ADDR_TAKEN_TABLE_VA = 0x008670f4;
export const RENDER_SHELL_A4072C0_EAX_WRITES = 0;
export const RENDER_SHELL_A4072C0_STACK_ARGS = 0;
export const RENDER_SHELL_A4072C0_THIS_CALL = 1;
export const RENDER_SHELL_A4072C0_FIELD_OFF = 0x24;

export const RENDER_SHELL_A4072D0_HOST_VA = 0x004072d0;
export const RENDER_SHELL_A4072D0_END_VA = 0x004072d4;
export const RENDER_SHELL_A4072D0_NEXT_VA = 0x004072e0;
export const RENDER_SHELL_A4072D0_CALLER_COUNT = 4;
export const RENDER_SHELL_A4072D0_CALLER_FIRST_VA = 0x005ef44c;
export const RENDER_SHELL_A4072D0_CALLER_LAST_VA = 0x006c9ba2;
export const RENDER_SHELL_A4072D0_ADDR_TAKEN_COUNT = 1;
export const RENDER_SHELL_A4072D0_ADDR_TAKEN_TABLE_VA = 0x0086710a;
export const RENDER_SHELL_A4072D0_EAX_WRITES = 0;
export const RENDER_SHELL_A4072D0_STACK_ARGS = 0;
export const RENDER_SHELL_A4072D0_THIS_CALL = 1;
export const RENDER_SHELL_A4072D0_FIELD_OFF = 0x28;

/** A4072B0 x87 f32 getter at +0x20 (mem-backed twin). */
export function renderShellA4072b0Float20Mem(view, addr) {
  return f32(view.getFloat32((addr >>> 0) + RENDER_SHELL_A4072B0_FIELD_OFF, true));
}
/** A4072C0 x87 f32 getter at +0x24 (mem-backed twin). */
export function renderShellA4072c0Float24Mem(view, addr) {
  return f32(view.getFloat32((addr >>> 0) + RENDER_SHELL_A4072C0_FIELD_OFF, true));
}
/** A4072D0 x87 f32 getter at +0x28 (mem-backed twin). */
export function renderShellA4072d0Float28Mem(view, addr) {
  return f32(view.getFloat32((addr >>> 0) + RENDER_SHELL_A4072D0_FIELD_OFF, true));
}
export function renderShellA4072b0HostVa() {
  return RENDER_SHELL_A4072B0_HOST_VA >>> 0;
}
export function renderShellA4072b0EndVa() {
  return RENDER_SHELL_A4072B0_END_VA >>> 0;
}
export function renderShellA4072b0NextVa() {
  return RENDER_SHELL_A4072B0_NEXT_VA >>> 0;
}
export function renderShellA4072b0CallerCount() {
  return RENDER_SHELL_A4072B0_CALLER_COUNT >>> 0;
}
export function renderShellA4072b0CallerFirstVa() {
  return RENDER_SHELL_A4072B0_CALLER_FIRST_VA >>> 0;
}
export function renderShellA4072b0CallerLastVa() {
  return RENDER_SHELL_A4072B0_CALLER_LAST_VA >>> 0;
}
export function renderShellA4072b0AddrTakenCount() {
  return RENDER_SHELL_A4072B0_ADDR_TAKEN_COUNT >>> 0;
}
export function renderShellA4072b0AddrTakenTableVa() {
  return RENDER_SHELL_A4072B0_ADDR_TAKEN_TABLE_VA >>> 0;
}
export function renderShellA4072b0EaxWrites() {
  return RENDER_SHELL_A4072B0_EAX_WRITES >>> 0;
}
export function renderShellA4072b0StackArgs() {
  return RENDER_SHELL_A4072B0_STACK_ARGS >>> 0;
}
export function renderShellA4072b0ThisCall() {
  return RENDER_SHELL_A4072B0_THISCALL >>> 0;
}
export function renderShellA4072b0FieldOff() {
  return RENDER_SHELL_A4072B0_FIELD_OFF >>> 0;
}
export function renderShellA4072c0HostVa() {
  return RENDER_SHELL_A4072C0_HOST_VA >>> 0;
}
export function renderShellA4072c0EndVa() {
  return RENDER_SHELL_A4072C0_END_VA >>> 0;
}
export function renderShellA4072c0NextVa() {
  return RENDER_SHELL_A4072C0_NEXT_VA >>> 0;
}
export function renderShellA4072c0CallerCount() {
  return RENDER_SHELL_A4072C0_CALLER_COUNT >>> 0;
}
export function renderShellA4072c0CallerFirstVa() {
  return RENDER_SHELL_A4072C0_CALLER_FIRST_VA >>> 0;
}
export function renderShellA4072c0CallerLastVa() {
  return RENDER_SHELL_A4072C0_CALLER_LAST_VA >>> 0;
}
export function renderShellA4072c0AddrTakenCount() {
  return RENDER_SHELL_A4072C0_ADDR_TAKEN_COUNT >>> 0;
}
export function renderShellA4072c0AddrTakenTableVa() {
  return RENDER_SHELL_A4072C0_ADDR_TAKEN_TABLE_VA >>> 0;
}
export function renderShellA4072c0EaxWrites() {
  return RENDER_SHELL_A4072C0_EAX_WRITES >>> 0;
}
export function renderShellA4072c0StackArgs() {
  return RENDER_SHELL_A4072C0_STACK_ARGS >>> 0;
}
export function renderShellA4072c0ThisCall() {
  return RENDER_SHELL_A4072C0_THISCALL >>> 0;
}
export function renderShellA4072c0FieldOff() {
  return RENDER_SHELL_A4072C0_FIELD_OFF >>> 0;
}
export function renderShellA4072d0HostVa() {
  return RENDER_SHELL_A4072D0_HOST_VA >>> 0;
}
export function renderShellA4072d0EndVa() {
  return RENDER_SHELL_A4072D0_END_VA >>> 0;
}
export function renderShellA4072d0NextVa() {
  return RENDER_SHELL_A4072D0_NEXT_VA >>> 0;
}
export function renderShellA4072d0CallerCount() {
  return RENDER_SHELL_A4072D0_CALLER_COUNT >>> 0;
}
export function renderShellA4072d0CallerFirstVa() {
  return RENDER_SHELL_A4072D0_CALLER_FIRST_VA >>> 0;
}
export function renderShellA4072d0CallerLastVa() {
  return RENDER_SHELL_A4072D0_CALLER_LAST_VA >>> 0;
}
export function renderShellA4072d0AddrTakenCount() {
  return RENDER_SHELL_A4072D0_ADDR_TAKEN_COUNT >>> 0;
}
export function renderShellA4072d0AddrTakenTableVa() {
  return RENDER_SHELL_A4072D0_ADDR_TAKEN_TABLE_VA >>> 0;
}
export function renderShellA4072d0EaxWrites() {
  return RENDER_SHELL_A4072D0_EAX_WRITES >>> 0;
}
export function renderShellA4072d0StackArgs() {
  return RENDER_SHELL_A4072D0_STACK_ARGS >>> 0;
}
export function renderShellA4072d0ThisCall() {
  return RENDER_SHELL_A4072D0_THISCALL >>> 0;
}
export function renderShellA4072d0FieldOff() {
  return RENDER_SHELL_A4072D0_FIELD_OFF >>> 0;
}

/* ============================================================================
 * ABI v63: 0x00a18230 band-start pure body (section-notes/
 * render-shell-v63-a18230/NOTES.md + census-a18230.json).
 * Body: thiscall (0 stack args), FULL-dword gate [this+0x68] != 0 ->
 * ARM A (IAT [0xc0f95c] x2 + [0xc0f960] + 16-B copy of [this+8]) vs
 * ARM B ([0xc0f960] level 0x4100 only); COMMON TAIL stores the pack
 * {0,1,0,1,0} at [this+0x20..0x30] and calls the family's landed
 * 0xa14050 chain (1 stale-ecx stack arg). 46 callers, addr-taken 2
 * (vtable slot 4 of 0xb82430 + 0xb82600).
 * ============================================================================ */
export const RENDER_SHELL_A18230_HOST_VA = 0x00a18230;
export const RENDER_SHELL_A18230_END_VA = 0x00a182b5;
export const RENDER_SHELL_A18230_NEXT_VA = 0x00a182c0;
export const RENDER_SHELL_A18230_CALLER_COUNT = 0x2e;
export const RENDER_SHELL_A18230_CALLER_FIRST_VA = 0x006fbe73;
export const RENDER_SHELL_A18230_CALLER_LAST_VA = 0x00a62ae9;
export const RENDER_SHELL_A18230_ADDR_TAKEN_COUNT = 0x2;
export const RENDER_SHELL_A18230_VTABLE_SLOT_VA_0 = 0x00b82440;
export const RENDER_SHELL_A18230_VTABLE_SLOT_VA_1 = 0x00b82610;
export const RENDER_SHELL_A18230_VTABLE_VA_0 = 0x00b82430;
export const RENDER_SHELL_A18230_VTABLE_VA_1 = 0x00b82600;
export const RENDER_SHELL_A18230_VTABLE_SLOT_IDX = 0x4;
export const RENDER_SHELL_A18230_EAX_WRITES = 0x0;
export const RENDER_SHELL_A18230_STACK_ARGS = 0x0;
export const RENDER_SHELL_A18230_THISCALL = 0x1;
export const RENDER_SHELL_A18230_GATE_OFF = 0x68;
export const RENDER_SHELL_A18230_IAT_VA_0 = 0x00c0f95c;
export const RENDER_SHELL_A18230_IAT_VA_1 = 0x00c0f960;
export const RENDER_SHELL_A18230_LOG_ARG = 0x4100;
export const RENDER_SHELL_A18230_ZERO_ARG_COUNT = 0x4;
export const RENDER_SHELL_A18230_COPY_OFF = 0x08;
export const RENDER_SHELL_A18230_COPY_BYTES = 0x10;
export const RENDER_SHELL_A18230_CHAIN_VA = 0x00a14050;
export const RENDER_SHELL_A18230_CHAIN_STACK_ARGS = 0x1;
export const RENDER_SHELL_A18230_PACK_VALS = [0, 1, 0, 1, 0];

/** FULL-dword gate: [this+0x68] != 0 -> ARM A. */
export function renderShellA18230Gate(this68) {
  return asU32(this68) !== 0 ? 1 : 0;
}

/** Pack store offset for idx 0..4 (0x20 + 4*idx). */
export function renderShellA18230PackOff(idx) {
  const i = asU32(idx);
  return i < 5 ? (0x20 + 4 * i) >>> 0 : 0;
}

/** Pack store value for idx 0..4 (PE {0,1,0,1,0}). */
export function renderShellA18230PackVal(idx) {
  const i = asU32(idx);
  return i < 5 ? RENDER_SHELL_A18230_PACK_VALS[i] : 0;
}

export function renderShellA18230HostVa() {
  return RENDER_SHELL_A18230_HOST_VA >>> 0;
}
export function renderShellA18230EndVa() {
  return RENDER_SHELL_A18230_END_VA >>> 0;
}
export function renderShellA18230NextVa() {
  return RENDER_SHELL_A18230_NEXT_VA >>> 0;
}
export function renderShellA18230CallerCount() {
  return RENDER_SHELL_A18230_CALLER_COUNT >>> 0;
}
export function renderShellA18230CallerFirstVa() {
  return RENDER_SHELL_A18230_CALLER_FIRST_VA >>> 0;
}
export function renderShellA18230CallerLastVa() {
  return RENDER_SHELL_A18230_CALLER_LAST_VA >>> 0;
}
export function renderShellA18230AddrTakenCount() {
  return RENDER_SHELL_A18230_ADDR_TAKEN_COUNT >>> 0;
}
export function renderShellA18230VtableSlotVa0() {
  return RENDER_SHELL_A18230_VTABLE_SLOT_VA_0 >>> 0;
}
export function renderShellA18230VtableSlotVa1() {
  return RENDER_SHELL_A18230_VTABLE_SLOT_VA_1 >>> 0;
}
export function renderShellA18230VtableVa0() {
  return RENDER_SHELL_A18230_VTABLE_VA_0 >>> 0;
}
export function renderShellA18230VtableVa1() {
  return RENDER_SHELL_A18230_VTABLE_VA_1 >>> 0;
}
export function renderShellA18230VtableSlotIdx() {
  return RENDER_SHELL_A18230_VTABLE_SLOT_IDX >>> 0;
}
export function renderShellA18230EaxWrites() {
  return RENDER_SHELL_A18230_EAX_WRITES >>> 0;
}
export function renderShellA18230StackArgs() {
  return RENDER_SHELL_A18230_STACK_ARGS >>> 0;
}
export function renderShellA18230ThisCall() {
  return RENDER_SHELL_A18230_THISCALL >>> 0;
}
export function renderShellA18230GateOff() {
  return RENDER_SHELL_A18230_GATE_OFF >>> 0;
}
export function renderShellA18230IatVa0() {
  return RENDER_SHELL_A18230_IAT_VA_0 >>> 0;
}
export function renderShellA18230IatVa1() {
  return RENDER_SHELL_A18230_IAT_VA_1 >>> 0;
}
export function renderShellA18230LogArg() {
  return RENDER_SHELL_A18230_LOG_ARG >>> 0;
}
export function renderShellA18230ZeroArgCount() {
  return RENDER_SHELL_A18230_ZERO_ARG_COUNT >>> 0;
}
export function renderShellA18230CopyOff() {
  return RENDER_SHELL_A18230_COPY_OFF >>> 0;
}
export function renderShellA18230CopyBytes() {
  return RENDER_SHELL_A18230_COPY_BYTES >>> 0;
}
export function renderShellA18230ChainVa() {
  return RENDER_SHELL_A18230_CHAIN_VA >>> 0;
}
export function renderShellA18230ChainStackArgs() {
  return RENDER_SHELL_A18230_CHAIN_STACK_ARGS >>> 0;
}

/* ============================================================================
 * ABI v64: vtable-slot method 0xa182c0..0xa182fb (slot 18 of BOTH
 * 0xb82430/0xb82600; section-notes/render-shell-v64-hostrows/NOTES.md +
 * census-v64-hostrows.json). this-call + 1 stack arg (ret 4). BYTE gate
 * on the stack arg: (arg & 0xff) != 0 -> ARM A (leaf [0xc1292c] + BTS
 * bit 3 of [this+4]); == 0 -> ARM B (leaf [0xc12928] + BTR bit 3).
 * Both leaves take the hoisted arg 0x8db9 (stdcall-shaped, typed-host
 * .data FN slots; rest 0xa35ca0 / 0xa36c60). 0 E8 callers, addr-taken
 * 2. HOST-3 comment pins: 0xa19450 / 0xa19dd0 / 0xa19df0 (evidence
 * rows only — no laws).
 * ============================================================================ */
export const RENDER_SHELL_A182C0_HOST_VA = 0x00a182c0;
export const RENDER_SHELL_A182C0_END_VA = 0x00a182fb;
export const RENDER_SHELL_A182C0_NEXT_VA = 0x00a18300;
export const RENDER_SHELL_A182C0_CALLER_COUNT = 0x0;
export const RENDER_SHELL_A182C0_ADDR_TAKEN_COUNT = 0x2;
export const RENDER_SHELL_A182C0_VTABLE_SLOT_VA_0 = 0x00b82478;
export const RENDER_SHELL_A182C0_VTABLE_SLOT_VA_1 = 0x00b82648;
export const RENDER_SHELL_A182C0_VTABLE_VA_0 = 0x00b82430;
export const RENDER_SHELL_A182C0_VTABLE_VA_1 = 0x00b82600;
export const RENDER_SHELL_A182C0_VTABLE_SLOT_IDX = 0x12;
export const RENDER_SHELL_A182C0_EAX_WRITES = 0x2;
export const RENDER_SHELL_A182C0_STACK_ARGS = 0x1;
export const RENDER_SHELL_A182C0_THISCALL = 0x1;
export const RENDER_SHELL_A182C0_LEAF_VA_0 = 0x00c12928;
export const RENDER_SHELL_A182C0_LEAF_VA_1 = 0x00c1292c;
export const RENDER_SHELL_A182C0_LEAF_ARG = 0x8db9;
export const RENDER_SHELL_A182C0_FLAG_OFF = 0x4;
export const RENDER_SHELL_A182C0_FLAG_BIT = 0x3;
export const RENDER_SHELL_A182C0_ARG_OFF = 0x8;
export const RENDER_SHELL_HOST_A19450_VA = 0x00a19450;
export const RENDER_SHELL_HOST_A19DD0_VA = 0x00a19dd0;
export const RENDER_SHELL_HOST_A19DF0_VA = 0x00a19df0;

/** BYTE gate on the stack arg: (arg & 0xff) != 0 -> ARM A. */
export function renderShellA182c0Gate(arg) {
  return (asU32(arg) & 0xff) !== 0 ? 1 : 0;
}

/** ARM A: BTS bit 3 of [this+4]. */
export function renderShellA182c0FlagsSet(flags) {
  return (asU32(flags) | (1 << RENDER_SHELL_A182C0_FLAG_BIT)) >>> 0;
}

/** ARM B: BTR bit 3 of [this+4]. */
export function renderShellA182c0FlagsClear(flags) {
  return (asU32(flags) & ~(1 << RENDER_SHELL_A182C0_FLAG_BIT)) >>> 0;
}

/** Leaf selection: ARM A -> [0xc1292c], ARM B -> [0xc12928]. */
export function renderShellA182c0LeafVa(arg) {
  return (asU32(arg) & 0xff) !== 0
    ? RENDER_SHELL_A182C0_LEAF_VA_1
    : RENDER_SHELL_A182C0_LEAF_VA_0;
}

export function renderShellA182c0HostVa() {
  return RENDER_SHELL_A182C0_HOST_VA >>> 0;
}
export function renderShellA182c0EndVa() {
  return RENDER_SHELL_A182C0_END_VA >>> 0;
}
export function renderShellA182c0NextVa() {
  return RENDER_SHELL_A182C0_NEXT_VA >>> 0;
}
export function renderShellA182c0CallerCount() {
  return RENDER_SHELL_A182C0_CALLER_COUNT >>> 0;
}
export function renderShellA182c0AddrTakenCount() {
  return RENDER_SHELL_A182C0_ADDR_TAKEN_COUNT >>> 0;
}
export function renderShellA182c0VtableSlotVa0() {
  return RENDER_SHELL_A182C0_VTABLE_SLOT_VA_0 >>> 0;
}
export function renderShellA182c0VtableSlotVa1() {
  return RENDER_SHELL_A182C0_VTABLE_SLOT_VA_1 >>> 0;
}
export function renderShellA182c0VtableVa0() {
  return RENDER_SHELL_A182C0_VTABLE_VA_0 >>> 0;
}
export function renderShellA182c0VtableVa1() {
  return RENDER_SHELL_A182C0_VTABLE_VA_1 >>> 0;
}
export function renderShellA182c0VtableSlotIdx() {
  return RENDER_SHELL_A182C0_VTABLE_SLOT_IDX >>> 0;
}
export function renderShellA182c0EaxWrites() {
  return RENDER_SHELL_A182C0_EAX_WRITES >>> 0;
}
export function renderShellA182c0StackArgs() {
  return RENDER_SHELL_A182C0_STACK_ARGS >>> 0;
}
export function renderShellA182c0ThisCall() {
  return RENDER_SHELL_A182C0_THISCALL >>> 0;
}
export function renderShellA182c0LeafVa0() {
  return RENDER_SHELL_A182C0_LEAF_VA_0 >>> 0;
}
export function renderShellA182c0LeafVa1() {
  return RENDER_SHELL_A182C0_LEAF_VA_1 >>> 0;
}
export function renderShellA182c0LeafArg() {
  return RENDER_SHELL_A182C0_LEAF_ARG >>> 0;
}
export function renderShellA182c0FlagOff() {
  return RENDER_SHELL_A182C0_FLAG_OFF >>> 0;
}
export function renderShellA182c0FlagBit() {
  return RENDER_SHELL_A182C0_FLAG_BIT >>> 0;
}
export function renderShellA182c0ArgOff() {
  return RENDER_SHELL_A182C0_ARG_OFF >>> 0;
}
export function renderShellHostA19450Va() {
  return RENDER_SHELL_HOST_A19450_VA >>> 0;
}
export function renderShellHostA19dd0Va() {
  return RENDER_SHELL_HOST_A19DD0_VA >>> 0;
}

export function renderShellHostA19df0Va() {
  return RENDER_SHELL_HOST_A19DF0_VA >>> 0;
}

/* ============================================================================
 * ABI v65: vtable-slot method 0xa18460..0xa184d5 (slot 22 of BOTH
 * 0xb82430/0xb82600; section-notes/render-shell-v65-a18460/NOTES.md).
 * This-call + 3 float stack args (ret 0xc). The 16-byte pack
 * {arg1, arg2, arg3, 1.0f} is built on the stack (slot offsets
 * 0/4/8/0xc; slot 3 = const 0x3f800000) and passed to IAT leaf
 * [0xc0f95c] (stdcall-shaped, typed-host; THE SAME leaf as v63
 * a18230, rest 0xa32770), then rebuilt and stored via one movups to
 * [this+8..0x17] plus [this+0x18] = 0. Leaf result never consumed;
 * stores unconditional; 0 E8, 0 branches, eax_writes 0. 0 E8 callers,
 * addr-taken 2. NEXT 0xa184e0 (vtable slot 30 — OPEN). Byte-gate
 * discipline: uint32 params, full-dword guards, NO uint8_t.
 * ============================================================================ */
export const RENDER_SHELL_A18460_HOST_VA = 0x00a18460;
export const RENDER_SHELL_A18460_END_VA = 0x00a184d5;
export const RENDER_SHELL_A18460_NEXT_VA = 0x00a184e0;
export const RENDER_SHELL_A18460_CALLER_COUNT = 0x0;
export const RENDER_SHELL_A18460_ADDR_TAKEN_COUNT = 0x2;
export const RENDER_SHELL_A18460_VTABLE_SLOT_VA_0 = 0x00b82488;
export const RENDER_SHELL_A18460_VTABLE_SLOT_VA_1 = 0x00b82658;
export const RENDER_SHELL_A18460_VTABLE_VA_0 = 0x00b82430;
export const RENDER_SHELL_A18460_VTABLE_VA_1 = 0x00b82600;
export const RENDER_SHELL_A18460_VTABLE_SLOT_IDX = 0x16;
export const RENDER_SHELL_A18460_EAX_WRITES = 0x0;
export const RENDER_SHELL_A18460_STACK_ARGS = 0x3;
export const RENDER_SHELL_A18460_THISCALL = 0x1;
export const RENDER_SHELL_A18460_RET_ADJ = 0xc;
export const RENDER_SHELL_A18460_LEAF_VA = 0x00c0f95c;
export const RENDER_SHELL_A18460_LEAF_ARG_COUNT = 0x4;
export const RENDER_SHELL_A18460_DEST_OFF = 0x8;
export const RENDER_SHELL_A18460_DEST_BYTES = 0x10;
export const RENDER_SHELL_A18460_ZERO_OFF = 0x18;
export const RENDER_SHELL_A18460_PACK_ONE_BITS = 0x3f800000;

/** 16-B pack slot offsets for idx 0..3 (0/4/8/0xc), else 0. */
export function renderShellA18460PackOff(idx) {
  const i = asU32(idx);
  return i < 4 ? (4 * i) >>> 0 : 0;
}

/** Selector over the pack {a1, a2, a3, 1.0f}: slot 3 = 0x3f800000. */
export function renderShellA18460PackVal(idx, a1, a2, a3) {
  const i = asU32(idx);
  if (i === 0) return asU32(a1);
  if (i === 1) return asU32(a2);
  if (i === 2) return asU32(a3);
  if (i === 3) return RENDER_SHELL_A18460_PACK_ONE_BITS >>> 0;
  return 0;
}

/** Stack-arg base offsets for arg slot n 0..2 (8/0xc/0x10), else 0. */
export function renderShellA18460ArgOff(n) {
  const i = asU32(n);
  return i < 3 ? (8 + 4 * i) >>> 0 : 0;
}

export function renderShellA18460HostVa() {
  return RENDER_SHELL_A18460_HOST_VA >>> 0;
}
export function renderShellA18460EndVa() {
  return RENDER_SHELL_A18460_END_VA >>> 0;
}
export function renderShellA18460NextVa() {
  return RENDER_SHELL_A18460_NEXT_VA >>> 0;
}
export function renderShellA18460CallerCount() {
  return RENDER_SHELL_A18460_CALLER_COUNT >>> 0;
}
export function renderShellA18460AddrTakenCount() {
  return RENDER_SHELL_A18460_ADDR_TAKEN_COUNT >>> 0;
}
export function renderShellA18460VtableSlotVa0() {
  return RENDER_SHELL_A18460_VTABLE_SLOT_VA_0 >>> 0;
}
export function renderShellA18460VtableSlotVa1() {
  return RENDER_SHELL_A18460_VTABLE_SLOT_VA_1 >>> 0;
}
export function renderShellA18460VtableVa0() {
  return RENDER_SHELL_A18460_VTABLE_VA_0 >>> 0;
}
export function renderShellA18460VtableVa1() {
  return RENDER_SHELL_A18460_VTABLE_VA_1 >>> 0;
}
export function renderShellA18460VtableSlotIdx() {
  return RENDER_SHELL_A18460_VTABLE_SLOT_IDX >>> 0;
}
export function renderShellA18460EaxWrites() {
  return RENDER_SHELL_A18460_EAX_WRITES >>> 0;
}
export function renderShellA18460StackArgs() {
  return RENDER_SHELL_A18460_STACK_ARGS >>> 0;
}
export function renderShellA18460ThisCall() {
  return RENDER_SHELL_A18460_THISCALL >>> 0;
}
export function renderShellA18460RetAdj() {
  return RENDER_SHELL_A18460_RET_ADJ >>> 0;
}
export function renderShellA18460LeafVa() {
  return RENDER_SHELL_A18460_LEAF_VA >>> 0;
}
export function renderShellA18460LeafArgCount() {
  return RENDER_SHELL_A18460_LEAF_ARG_COUNT >>> 0;
}
export function renderShellA18460DestOff() {
  return RENDER_SHELL_A18460_DEST_OFF >>> 0;
}
export function renderShellA18460DestBytes() {
  return RENDER_SHELL_A18460_DEST_BYTES >>> 0;
}
export function renderShellA18460ZeroOff() {
  return RENDER_SHELL_A18460_ZERO_OFF >>> 0;
}
export function renderShellA18460PackOneBits() {
  return RENDER_SHELL_A18460_PACK_ONE_BITS >>> 0;
}


/* ============================================================================
 * ABI v66: 0xa18530..0xa186e6 (caller-bearing float body, 5 E8 callers
 * 0xa18387/0xa1844b/0xa19a65/0xa19c8c/0xa24a0f; GS check 0xaef12b + 3
 * typed-host .data leaves c0f918/c0f91c/c0f824) + trivial vtable-B size
 * stubs 0xa19340/0xa193c0 + HOST row pins. Plan P1/P2/P3 by the PE byte
 * gates (test byte [ecx+4],0x20); denominators u32f([edx+0x14|0x10])
 * (P1) or this floats +0xa0/+0x9c (P2/P3); common tail x1/x2 =
 * signflip(+0 normalize)/den, x0 = 2.0f/den_a, x6 = 2.0f/db (P3
 * denominator = 0-da via subss, NOT a sign flip — matters for ±0.0).
 * Byte-gate discipline: uint32 params, &0xff masks, NO uint8_t.
 * Evidence: section-notes/render-shell-v66-a18530/NOTES.md.
 * ============================================================================ */
export const RENDER_SHELL_A18530_HOST_VA = 0x00a18530;
export const RENDER_SHELL_A18530_END_VA = 0x00a186e6;
export const RENDER_SHELL_A18530_NEXT_VA = 0x00a186f0;
export const RENDER_SHELL_A18530_CALLER_COUNT = 0x5;
export const RENDER_SHELL_A18530_CALLER_FIRST_VA = 0x00a18387;
export const RENDER_SHELL_A18530_CALLER_LAST_VA = 0x00a24a0f;
export const RENDER_SHELL_A18530_ADDR_TAKEN_COUNT = 0x0;
export const RENDER_SHELL_A18530_EAX_WRITES = 0x0;
export const RENDER_SHELL_A18530_STACK_ARGS = 0x0;
export const RENDER_SHELL_A18530_THISCALL = 0x1;
export const RENDER_SHELL_A18530_GS_VA = 0x00aef12b;
export const RENDER_SHELL_A18530_GS_COOKIE_VA = 0x00bf93b4;
export const RENDER_SHELL_A18530_GLOBAL_VA = 0x00c379b8;
export const RENDER_SHELL_A18530_LEAF_VA_0 = 0x00c0f918;
export const RENDER_SHELL_A18530_LEAF_VA_1 = 0x00c0f91c;
export const RENDER_SHELL_A18530_LEAF_VA_2 = 0x00c0f824;
export const RENDER_SHELL_A18530_EDX_OFF = 0x68;
export const RENDER_SHELL_A18530_FLAG_OFF = 0x4;
export const RENDER_SHELL_A18530_FLAG_BIT = 0x20;
export const RENDER_SHELL_A18530_DEN_A_OFF = 0xa0;
export const RENDER_SHELL_A18530_DEN_B_OFF = 0x9c;
export const RENDER_SHELL_A18530_INT_A_OFF = 0x14;
export const RENDER_SHELL_A18530_INT_B_OFF = 0x10;
export const RENDER_SHELL_A18530_U32F_TABLE_VA = 0x00bacb00;
export const RENDER_SHELL_A18530_U32F_TABLE_HI = 0x41f00000;
export const RENDER_SHELL_A18530_U32F_TABLE_LO = 0x00000000;
export const RENDER_SHELL_A18530_U32F_SIGN_SHIFT = 0x1f;
export const RENDER_SHELL_A18530_F32_TWO_BITS = 0x40000000;
export const RENDER_SHELL_A18530_PACK_ONE_BITS = 0x3f800000;
export const RENDER_SHELL_A18530_PACK_NEGZERO_BITS = 0x80000000;
export const RENDER_SHELL_A18530_PACK_MILLI_BITS = 0xba83126f;
export const RENDER_SHELL_A18530_PACK_BASE_OFF = 0x48;
export const RENDER_SHELL_A19340_HOST_VA = 0x00a19340;
export const RENDER_SHELL_A19340_END_VA = 0x00a19346;
export const RENDER_SHELL_A19340_NEXT_VA = 0x00a19346;
export const RENDER_SHELL_A19340_CALLER_COUNT = 0x7;
export const RENDER_SHELL_A19340_ADDR_TAKEN_COUNT = 0x1;
export const RENDER_SHELL_A19340_VTABLE_SLOT_VA = 0x00b82630;
export const RENDER_SHELL_A19340_VTABLE_VA = 0x00b82600;
export const RENDER_SHELL_A19340_VTABLE_SLOT_IDX = 0xc;
export const RENDER_SHELL_A19340_EAX_WRITES = 0x1;
export const RENDER_SHELL_A193C0_HOST_VA = 0x00a193c0;
export const RENDER_SHELL_A193C0_END_VA = 0x00a193c6;
export const RENDER_SHELL_A193C0_NEXT_VA = 0x00a193c6;
export const RENDER_SHELL_A193C0_CALLER_COUNT = 0x6;
export const RENDER_SHELL_A193C0_ADDR_TAKEN_COUNT = 0x1;
export const RENDER_SHELL_A193C0_VTABLE_SLOT_VA = 0x00b82634;
export const RENDER_SHELL_A193C0_VTABLE_VA = 0x00b82600;
export const RENDER_SHELL_A193C0_VTABLE_SLOT_IDX = 0xd;
export const RENDER_SHELL_A193C0_EAX_WRITES = 0x1;
export const RENDER_SHELL_HOST_A18750_VA = 0x00a18750;
export const RENDER_SHELL_HOST_A18A20_VA = 0x00a18a20;
export const RENDER_SHELL_HOST_A19530_VA = 0x00a19530;
export const RENDER_SHELL_HOST_A19600_VA = 0x00a19600;
export const RENDER_SHELL_HOST_A196B0_VA = 0x00a196b0;

/** Plan selector: edx==0 -> 0 (P3); flag20 -> 1 (P2); else 2 (P1). */
export function renderShellA18530Plan(edx, flags) {
  if (asU32(edx) === 0) return 0;
  return (asU32(flags) & 0xff) & 0x20 ? 1 : 2;
}

/** cvtdq2pd + addsd 0xbacb00 (±2^32-magic) + cvtpd2ps = fround(u32). */
export function renderShellA18530U32fBits(v) {
  return f32Bits(Math.fround(v >>> 0));
}

/** Denominator A: plan 2 -> u32f(int_14), else f32(this_a0). */
export function renderShellA18530DenABits(plan, int14, a0Bits) {
  if (asU32(plan) === 2) return renderShellA18530U32fBits(int14 >>> 0);
  return f32Bits(f32FromBits(asU32(a0Bits)));
}

/** Denominator B: plan 2 -> u32f(int_10), else f32(this_9c). */
export function renderShellA18530DenBBits(plan, int10, b9cBits) {
  if (asU32(plan) === 2) return renderShellA18530U32fBits(int10 >>> 0);
  return f32Bits(f32FromBits(asU32(b9cBits)));
}

/** x1 = signflip(da + 0.0f) / (plan 0 ? 0.0f - da : da). */
export function renderShellA18530X1Bits(plan, denABits) {
  const da = f32FromBits(asU32(denABits));
  const numerator = f32FromBits(f32Bits(f32(da + 0)) ^ RENDER_SHELL_F32_SIGN_BITS);
  const denom = asU32(plan) === 0 ? f32(0 - da) : da;
  return f32Bits(f32(f32(numerator) / f32(denom)));
}

/** x2 = signflip(db + 0.0f) / db. */
export function renderShellA18530X2Bits(denBBits) {
  const db = f32FromBits(asU32(denBBits));
  const numerator = f32FromBits(f32Bits(f32(db + 0)) ^ RENDER_SHELL_F32_SIGN_BITS);
  return f32Bits(f32(f32(numerator) / f32(db)));
}

/** x0 = 2.0f / (plan 0 ? 0.0f - da : da). */
export function renderShellA18530X0Bits(plan, denABits) {
  const da = f32FromBits(asU32(denABits));
  const denom = asU32(plan) === 0 ? f32(0 - da) : da;
  const two = f32FromBits(RENDER_SHELL_A18530_F32_TWO_BITS);
  return f32Bits(f32(f32(two) / f32(denom)));
}

/** x6 = 2.0f / db. */
export function renderShellA18530X6Bits(denBBits) {
  const db = f32FromBits(asU32(denBBits));
  const two = f32FromBits(RENDER_SHELL_A18530_F32_TWO_BITS);
  return f32Bits(f32(f32(two) / f32(db)));
}

/** xorps DAT_00bacb70 lane mask: sign-bit flip. */
export function renderShellA18530NegBits(bits) {
  return (asU32(bits) ^ RENDER_SHELL_F32_SIGN_BITS) >>> 0;
}

/** mov eax,0x3c0; ret — vtable B 0xb82600 slot 12 size getter. */
export function renderShellA19340Size() {
  return 0x3c0;
}

/** mov eax,0x21c; ret — vtable B 0xb82600 slot 13 size getter. */
export function renderShellA193c0Size() {
  return 0x21c;
}

export function renderShellA18530HostVa() {
  return RENDER_SHELL_A18530_HOST_VA >>> 0;
}
export function renderShellA18530EndVa() {
  return RENDER_SHELL_A18530_END_VA >>> 0;
}
export function renderShellA18530NextVa() {
  return RENDER_SHELL_A18530_NEXT_VA >>> 0;
}
export function renderShellA18530CallerCount() {
  return RENDER_SHELL_A18530_CALLER_COUNT >>> 0;
}
export function renderShellA18530CallerFirstVa() {
  return RENDER_SHELL_A18530_CALLER_FIRST_VA >>> 0;
}
export function renderShellA18530CallerLastVa() {
  return RENDER_SHELL_A18530_CALLER_LAST_VA >>> 0;
}
export function renderShellA18530AddrTakenCount() {
  return RENDER_SHELL_A18530_ADDR_TAKEN_COUNT >>> 0;
}
export function renderShellA18530EaxWrites() {
  return RENDER_SHELL_A18530_EAX_WRITES >>> 0;
}
export function renderShellA18530StackArgs() {
  return RENDER_SHELL_A18530_STACK_ARGS >>> 0;
}
export function renderShellA18530ThisCall() {
  return RENDER_SHELL_A18530_THISCALL >>> 0;
}
export function renderShellA18530GsVa() {
  return RENDER_SHELL_A18530_GS_VA >>> 0;
}
export function renderShellA18530GsCookieVa() {
  return RENDER_SHELL_A18530_GS_COOKIE_VA >>> 0;
}
export function renderShellA18530GlobalVa() {
  return RENDER_SHELL_A18530_GLOBAL_VA >>> 0;
}
export function renderShellA18530LeafVa0() {
  return RENDER_SHELL_A18530_LEAF_VA_0 >>> 0;
}
export function renderShellA18530LeafVa1() {
  return RENDER_SHELL_A18530_LEAF_VA_1 >>> 0;
}
export function renderShellA18530LeafVa2() {
  return RENDER_SHELL_A18530_LEAF_VA_2 >>> 0;
}
export function renderShellA18530EdxOff() {
  return RENDER_SHELL_A18530_EDX_OFF >>> 0;
}
export function renderShellA18530FlagOff() {
  return RENDER_SHELL_A18530_FLAG_OFF >>> 0;
}
export function renderShellA18530FlagBit() {
  return RENDER_SHELL_A18530_FLAG_BIT >>> 0;
}
export function renderShellA18530DenAOff() {
  return RENDER_SHELL_A18530_DEN_A_OFF >>> 0;
}
export function renderShellA18530DenBOff() {
  return RENDER_SHELL_A18530_DEN_B_OFF >>> 0;
}
export function renderShellA19340HostVa() {
  return RENDER_SHELL_A19340_HOST_VA >>> 0;
}
export function renderShellA19340EndVa() {
  return RENDER_SHELL_A19340_END_VA >>> 0;
}
export function renderShellA19340NextVa() {
  return RENDER_SHELL_A19340_NEXT_VA >>> 0;
}
export function renderShellA19340CallerCount() {
  return RENDER_SHELL_A19340_CALLER_COUNT >>> 0;
}
export function renderShellA19340AddrTakenCount() {
  return RENDER_SHELL_A19340_ADDR_TAKEN_COUNT >>> 0;
}
export function renderShellA19340VtableSlotVa() {
  return RENDER_SHELL_A19340_VTABLE_SLOT_VA >>> 0;
}
export function renderShellA19340VtableVa() {
  return RENDER_SHELL_A19340_VTABLE_VA >>> 0;
}
export function renderShellA19340VtableSlotIdx() {
  return RENDER_SHELL_A19340_VTABLE_SLOT_IDX >>> 0;
}
export function renderShellA19340EaxWrites() {
  return RENDER_SHELL_A19340_EAX_WRITES >>> 0;
}
export function renderShellA193c0HostVa() {
  return RENDER_SHELL_A193C0_HOST_VA >>> 0;
}
export function renderShellA193c0EndVa() {
  return RENDER_SHELL_A193C0_END_VA >>> 0;
}
export function renderShellA193c0NextVa() {
  return RENDER_SHELL_A193C0_NEXT_VA >>> 0;
}
export function renderShellA193c0CallerCount() {
  return RENDER_SHELL_A193C0_CALLER_COUNT >>> 0;
}
export function renderShellA193c0AddrTakenCount() {
  return RENDER_SHELL_A193C0_ADDR_TAKEN_COUNT >>> 0;
}
export function renderShellA193c0VtableSlotVa() {
  return RENDER_SHELL_A193C0_VTABLE_SLOT_VA >>> 0;
}
export function renderShellA193c0VtableVa() {
  return RENDER_SHELL_A193C0_VTABLE_VA >>> 0;
}
export function renderShellA193c0VtableSlotIdx() {
  return RENDER_SHELL_A193C0_VTABLE_SLOT_IDX >>> 0;
}
export function renderShellA193c0EaxWrites() {
  return RENDER_SHELL_A193C0_EAX_WRITES >>> 0;
}
export function renderShellHostA18750Va() {
  return RENDER_SHELL_HOST_A18750_VA >>> 0;
}
export function renderShellHostA18a20Va() {
  return RENDER_SHELL_HOST_A18A20_VA >>> 0;
}
export function renderShellHostA19530Va() {
  return RENDER_SHELL_HOST_A19530_VA >>> 0;
}
export function renderShellHostA19600Va() {
  return RENDER_SHELL_HOST_A19600_VA >>> 0;
}
export function renderShellHostA196b0Va() {
  return RENDER_SHELL_HOST_A196B0_VA >>> 0;
}

/* ============================================================================
 * ABI v67: vtable-slot band rest (ABI 66 base, v66 handoff). LAND PURE
 * 0xa19bc0..0xa19bef (vtable B 0xb82600 slot 31, dref 0xb8267c):
 * BYTE gate [this+4]&0x40 -> f32 pair base DAT 0xc7b640 / this+0xa4;
 * cvttss2si truncation of both floats (NaN/±inf/out-of-range
 * [-2^31,2^31) -> integer indefinite 0x80000000); pass-throughs
 * [this+0xc8]/[this+0xcc]; typed-host FN leaf [0xc0f920].
 * LAND layout-getters-only (v58 A18E10 precedent): 0xa18dc0
 * (scalar-deleting-dtor, vtable B slot 0; calls LANDED A18E10 then
 * free 0xf8 when (arg0&1)) and 0xa18df0 (member dtor: reset
 * 0xa1a500 + sized free 0x10 0xaef15c; 8 E9 tail-call sites).
 * HOST pins: a186f0/a188f0/a189a0/a19130/a19b60 (evidence in
 * render-shell-v67-bandrest/NOTES.md; the a188f0 ANM2::
 * ReplaceSpritesheet ZHL prolog match is REFUTED — observed
 * signature ret 0x14/5 stack args + 4 integer selectors, receiver
 * = flag-family vtable slots 25, not ANM2).
 * Byte-gate discipline: uint32 params, &0xff masks, NO uint8_t.
 * ============================================================================ */
export const RENDER_SHELL_A19BC0_HOST_VA = 0x00a19bc0;
export const RENDER_SHELL_A19BC0_END_VA = 0x00a19bef;
export const RENDER_SHELL_A19BC0_NEXT_VA = 0x00a19bf0;
export const RENDER_SHELL_A19BC0_CALLER_COUNT = 0x0;
export const RENDER_SHELL_A19BC0_ADDR_TAKEN_COUNT = 0x1;
export const RENDER_SHELL_A19BC0_VTABLE_SLOT_VA = 0x00b8267c;
export const RENDER_SHELL_A19BC0_VTABLE_VA = 0x00b82600;
export const RENDER_SHELL_A19BC0_VTABLE_SLOT_IDX = 0x1f;
export const RENDER_SHELL_A19BC0_EAX_WRITES = 0x2;
export const RENDER_SHELL_A19BC0_STACK_ARGS = 0x0;
export const RENDER_SHELL_A19BC0_THISCALL = 0x1;
export const RENDER_SHELL_A19BC0_FLAG_OFF = 0x4;
export const RENDER_SHELL_A19BC0_FLAG_BIT = 0x40;
export const RENDER_SHELL_A19BC0_SRC_OFF = 0xa4;
export const RENDER_SHELL_A19BC0_SRC_DEFAULT_VA = 0x00c7b640;
export const RENDER_SHELL_A19BC0_LEAF_VA = 0x00c0f920;
export const RENDER_SHELL_A19BC0_ARG2_OFF = 0xc8;
export const RENDER_SHELL_A19BC0_ARG3_OFF = 0xcc;
export const RENDER_SHELL_A18DC0_HOST_VA = 0x00a18dc0;
export const RENDER_SHELL_A18DC0_END_VA = 0x00a18de6;
export const RENDER_SHELL_A18DC0_NEXT_VA = 0x00a18df0;
export const RENDER_SHELL_A18DC0_CALLER_COUNT = 0x0;
export const RENDER_SHELL_A18DC0_ADDR_TAKEN_COUNT = 0x1;
export const RENDER_SHELL_A18DC0_VTABLE_SLOT_VA = 0x00b82600;
export const RENDER_SHELL_A18DC0_VTABLE_VA = 0x00b82600;
export const RENDER_SHELL_A18DC0_VTABLE_SLOT_IDX = 0x0;
export const RENDER_SHELL_A18DC0_STACK_ARGS = 0x1;
export const RENDER_SHELL_A18DC0_THISCALL = 0x1;
export const RENDER_SHELL_A18DC0_EAX_WRITES = 0x1;
export const RENDER_SHELL_A18DC0_DTOR_VA = 0x00a18e10;
export const RENDER_SHELL_A18DC0_FREE_FN_VA = 0x00aef15c;
export const RENDER_SHELL_A18DC0_FREE_SIZE = 0xf8;
export const RENDER_SHELL_A18DC0_FLAG_OFF = 0x8;
export const RENDER_SHELL_A18DC0_FLAG_BIT = 0x1;
export const RENDER_SHELL_A18DF0_HOST_VA = 0x00a18df0;
export const RENDER_SHELL_A18DF0_END_VA = 0x00a18e08;
export const RENDER_SHELL_A18DF0_NEXT_VA = 0x00a18e10;
export const RENDER_SHELL_A18DF0_CALLER_COUNT = 0x8;
export const RENDER_SHELL_A18DF0_CALLER_FIRST_VA = 0x00b1110d;
export const RENDER_SHELL_A18DF0_CALLER_LAST_VA = 0x00b11d5b;
export const RENDER_SHELL_A18DF0_ADDR_TAKEN_COUNT = 0x0;
export const RENDER_SHELL_A18DF0_EAX_WRITES = 0x0;
export const RENDER_SHELL_A18DF0_STACK_ARGS = 0x0;
export const RENDER_SHELL_A18DF0_THISCALL = 0x1;
export const RENDER_SHELL_A18DF0_RESET_FN_VA = 0x00a1a500;
export const RENDER_SHELL_A18DF0_FREE_FN_VA = 0x00aef15c;
export const RENDER_SHELL_A18DF0_FREE_SIZE = 0x10;
export const RENDER_SHELL_A18DF0_DEREF_OFF = 0x0;
export const RENDER_SHELL_HOST_A186F0_VA = 0x00a186f0;
export const RENDER_SHELL_HOST_A188F0_VA = 0x00a188f0;
export const RENDER_SHELL_HOST_A189A0_VA = 0x00a189a0;
export const RENDER_SHELL_HOST_A19130_VA = 0x00a19130;
export const RENDER_SHELL_HOST_A19B60_VA = 0x00a19b60;
/* v68: global-object 0xc798e0 listener-broadcast body, end
   0xa19c97, next 0xa19ca0 (evidence render-shell-v68-a19bf0/). */
export const RENDER_SHELL_HOST_A19BF0_VA = 0x00a19bf0;

/* v69: twin + third-listener HOST rows (0 E8 callers each; runtime
   slot stores @ 0xa1a1b1 / 0xa1a26b; evidence
   render-shell-v69-a19ca0/). a19ca0: SEH frame, 2nd list glob+0xe0,
   bit8 gate, glob+0xd0/+0xd4 stores, flag40 cmove, leaf c0f920, no
   tail (end 0xa19d3c, next 0xa19d40). a19d40: SEH frame, bit11 gate
   + a5f090 pack + IND b186a0, 3rd list glob+0xe8 (end 0xa19dc5,
   next 0xa19dd0). Band-close census rows: a1xxxx band
   0xa18230..0xa1a000 fully closed (boundary interior to a19df0). */
export const RENDER_SHELL_HOST_A19CA0_VA = 0x00a19ca0;
export const RENDER_SHELL_HOST_A19D40_VA = 0x00a19d40;
export const RENDER_SHELL_A19CA0_END_VA = 0x00a19d3c;
export const RENDER_SHELL_A19CA0_NEXT_VA = 0x00a19d40;
export const RENDER_SHELL_A19D40_END_VA = 0x00a19dc5;
export const RENDER_SHELL_A19D40_NEXT_VA = 0x00a19dd0;
export const RENDER_SHELL_A1XXXX_BAND_START_VA = 0x00a18230;
export const RENDER_SHELL_A1XXXX_BAND_END_VA = 0x00a1a000;
export const RENDER_SHELL_A1XXXX_BAND_OPEN_BODIES = 0;
export const RENDER_SHELL_A1XXXX_BAND_HOST_ROWS = 6;

/** src_sel: PE byte gate test byte [ecx+4],0x40 @ 0xa19bc0; flag
 *  set -> this+0xa4 base, clear -> DAT 0xc7b640. */
export function renderShellA19bc0SrcSel(flags) {
  return (asU32(flags) & 0xff) & 0x40 ? 1 : 0;
}

/** trunc_bits: cvttss2si @ 0xa19bd1/0xa19be3. Truncation toward
 *  zero; NaN/±inf/out-of-range [-2^31,2^31) -> 0x80000000.
 *  -0.0 -> 0; -2^31 (in range) converts to 0x80000000 (same bits
 *  as the indefinite — identical on x86). */
export function renderShellA19bc0TruncBits(f32Bits) {
  const f = f32FromBits(asU32(f32Bits));
  if (!(f >= -2147483648 && f < 2147483648)) return 0x80000000;
  return Math.trunc(f) >>> 0;
}

export function renderShellA19bc0HostVa() {
  return RENDER_SHELL_A19BC0_HOST_VA >>> 0;
}
export function renderShellA19bc0EndVa() {
  return RENDER_SHELL_A19BC0_END_VA >>> 0;
}
export function renderShellA19bc0NextVa() {
  return RENDER_SHELL_A19BC0_NEXT_VA >>> 0;
}
export function renderShellA19bc0CallerCount() {
  return RENDER_SHELL_A19BC0_CALLER_COUNT >>> 0;
}
export function renderShellA19bc0AddrTakenCount() {
  return RENDER_SHELL_A19BC0_ADDR_TAKEN_COUNT >>> 0;
}
export function renderShellA19bc0VtableSlotVa() {
  return RENDER_SHELL_A19BC0_VTABLE_SLOT_VA >>> 0;
}
export function renderShellA19bc0VtableVa() {
  return RENDER_SHELL_A19BC0_VTABLE_VA >>> 0;
}
export function renderShellA19bc0VtableSlotIdx() {
  return RENDER_SHELL_A19BC0_VTABLE_SLOT_IDX >>> 0;
}
export function renderShellA19bc0EaxWrites() {
  return RENDER_SHELL_A19BC0_EAX_WRITES >>> 0;
}
export function renderShellA19bc0StackArgs() {
  return RENDER_SHELL_A19BC0_STACK_ARGS >>> 0;
}
export function renderShellA19bc0ThisCall() {
  return RENDER_SHELL_A19BC0_THISCALL >>> 0;
}
export function renderShellA19bc0FlagOff() {
  return RENDER_SHELL_A19BC0_FLAG_OFF >>> 0;
}
export function renderShellA19bc0FlagBit() {
  return RENDER_SHELL_A19BC0_FLAG_BIT >>> 0;
}
export function renderShellA19bc0SrcOff() {
  return RENDER_SHELL_A19BC0_SRC_OFF >>> 0;
}
export function renderShellA19bc0SrcDefaultVa() {
  return RENDER_SHELL_A19BC0_SRC_DEFAULT_VA >>> 0;
}
export function renderShellA19bc0LeafVa() {
  return RENDER_SHELL_A19BC0_LEAF_VA >>> 0;
}
export function renderShellA19bc0Arg2Off() {
  return RENDER_SHELL_A19BC0_ARG2_OFF >>> 0;
}
export function renderShellA19bc0Arg3Off() {
  return RENDER_SHELL_A19BC0_ARG3_OFF >>> 0;
}
export function renderShellA18dc0HostVa() {
  return RENDER_SHELL_A18DC0_HOST_VA >>> 0;
}
export function renderShellA18dc0EndVa() {
  return RENDER_SHELL_A18DC0_END_VA >>> 0;
}
export function renderShellA18dc0NextVa() {
  return RENDER_SHELL_A18DC0_NEXT_VA >>> 0;
}
export function renderShellA18dc0CallerCount() {
  return RENDER_SHELL_A18DC0_CALLER_COUNT >>> 0;
}
export function renderShellA18dc0AddrTakenCount() {
  return RENDER_SHELL_A18DC0_ADDR_TAKEN_COUNT >>> 0;
}
export function renderShellA18dc0VtableSlotVa() {
  return RENDER_SHELL_A18DC0_VTABLE_SLOT_VA >>> 0;
}
export function renderShellA18dc0VtableVa() {
  return RENDER_SHELL_A18DC0_VTABLE_VA >>> 0;
}
export function renderShellA18dc0VtableSlotIdx() {
  return RENDER_SHELL_A18DC0_VTABLE_SLOT_IDX >>> 0;
}
export function renderShellA18dc0StackArgs() {
  return RENDER_SHELL_A18DC0_STACK_ARGS >>> 0;
}
export function renderShellA18dc0ThisCall() {
  return RENDER_SHELL_A18DC0_THISCALL >>> 0;
}
export function renderShellA18dc0EaxWrites() {
  return RENDER_SHELL_A18DC0_EAX_WRITES >>> 0;
}
export function renderShellA18dc0DtorVa() {
  return RENDER_SHELL_A18DC0_DTOR_VA >>> 0;
}
export function renderShellA18dc0FreeFnVa() {
  return RENDER_SHELL_A18DC0_FREE_FN_VA >>> 0;
}
export function renderShellA18dc0FreeSize() {
  return RENDER_SHELL_A18DC0_FREE_SIZE >>> 0;
}
export function renderShellA18dc0FlagOff() {
  return RENDER_SHELL_A18DC0_FLAG_OFF >>> 0;
}
export function renderShellA18dc0FlagBit() {
  return RENDER_SHELL_A18DC0_FLAG_BIT >>> 0;
}
export function renderShellA18df0HostVa() {
  return RENDER_SHELL_A18DF0_HOST_VA >>> 0;
}
export function renderShellA18df0EndVa() {
  return RENDER_SHELL_A18DF0_END_VA >>> 0;
}
export function renderShellA18df0NextVa() {
  return RENDER_SHELL_A18DF0_NEXT_VA >>> 0;
}
export function renderShellA18df0CallerCount() {
  return RENDER_SHELL_A18DF0_CALLER_COUNT >>> 0;
}
export function renderShellA18df0CallerFirstVa() {
  return RENDER_SHELL_A18DF0_CALLER_FIRST_VA >>> 0;
}
export function renderShellA18df0CallerLastVa() {
  return RENDER_SHELL_A18DF0_CALLER_LAST_VA >>> 0;
}
export function renderShellA18df0AddrTakenCount() {
  return RENDER_SHELL_A18DF0_ADDR_TAKEN_COUNT >>> 0;
}
export function renderShellA18df0EaxWrites() {
  return RENDER_SHELL_A18DF0_EAX_WRITES >>> 0;
}
export function renderShellA18df0StackArgs() {
  return RENDER_SHELL_A18DF0_STACK_ARGS >>> 0;
}
export function renderShellA18df0ThisCall() {
  return RENDER_SHELL_A18DF0_THISCALL >>> 0;
}
export function renderShellA18df0ResetFnVa() {
  return RENDER_SHELL_A18DF0_RESET_FN_VA >>> 0;
}
export function renderShellA18df0FreeFnVa() {
  return RENDER_SHELL_A18DF0_FREE_FN_VA >>> 0;
}
export function renderShellA18df0FreeSize() {
  return RENDER_SHELL_A18DF0_FREE_SIZE >>> 0;
}
export function renderShellA18df0DerefOff() {
  return RENDER_SHELL_A18DF0_DEREF_OFF >>> 0;
}
export function renderShellHostA186f0Va() {
  return RENDER_SHELL_HOST_A186F0_VA >>> 0;
}
export function renderShellHostA188f0Va() {
  return RENDER_SHELL_HOST_A188F0_VA >>> 0;
}
export function renderShellHostA189a0Va() {
  return RENDER_SHELL_HOST_A189A0_VA >>> 0;
}
export function renderShellHostA19130Va() {
  return RENDER_SHELL_HOST_A19130_VA >>> 0;
}
export function renderShellHostA19b60Va() {
  return RENDER_SHELL_HOST_A19B60_VA >>> 0;
}
export function renderShellHostA19bf0Va() {
  return RENDER_SHELL_HOST_A19BF0_VA >>> 0;
}
export function renderShellHostA19ca0Va() {
  return RENDER_SHELL_HOST_A19CA0_VA >>> 0;
}
export function renderShellHostA19d40Va() {
  return RENDER_SHELL_HOST_A19D40_VA >>> 0;
}
export function renderShellA19ca0EndVa() {
  return RENDER_SHELL_A19CA0_END_VA >>> 0;
}
export function renderShellA19ca0NextVa() {
  return RENDER_SHELL_A19CA0_NEXT_VA >>> 0;
}
export function renderShellA19d40EndVa() {
  return RENDER_SHELL_A19D40_END_VA >>> 0;
}
export function renderShellA19d40NextVa() {
  return RENDER_SHELL_A19D40_NEXT_VA >>> 0;
}
export function renderShellA1xxxxBandStartVa() {
  return RENDER_SHELL_A1XXXX_BAND_START_VA >>> 0;
}
export function renderShellA1xxxxBandEndVa() {
  return RENDER_SHELL_A1XXXX_BAND_END_VA >>> 0;
}
export function renderShellA1xxxxBandOpenBodies() {
  return RENDER_SHELL_A1XXXX_BAND_OPEN_BODIES >>> 0;
}
export function renderShellA1xxxxBandHostRows() {
  return RENDER_SHELL_A1XXXX_BAND_HOST_ROWS >>> 0;
}

/* ============================================================================
 * ABI v69: FontSettings band 0xa1a160..0xa1a600 (evidence
 * section-notes/render-shell-v69-a1a540/NOTES.md). Six PURE bodies
 * (0 E8 each; raw byte-scan channel) + three HOST rows + band rows.
 * Please keep the render shell export list in sync with these names.
 * ========================================================================== */
export const RENDER_SHELL_A1A540_HOST_VA = 0x00a1a540;
export const RENDER_SHELL_A1A540_END_VA = 0x00a1a57a;
export const RENDER_SHELL_A1A540_NEXT_VA = 0x00a1a580;
export const RENDER_SHELL_A1A540_CALLER_COUNT = 0xf;
export const RENDER_SHELL_A1A540_CALLER_FIRST_VA = 0x00430656;
export const RENDER_SHELL_A1A540_CALLER_LAST_VA = 0x009b8312;
export const RENDER_SHELL_A1A540_ADDR_TAKEN_COUNT = 0x0;
export const RENDER_SHELL_A1A540_EAX_WRITES = 0x1;
export const RENDER_SHELL_A1A540_STACK_ARGS = 0x0;
export const RENDER_SHELL_A1A540_THISCALL = 0x1;
export const RENDER_SHELL_A1A540_FIELD_COUNT = 0x7;
export const RENDER_SHELL_A1A540_ALIGNMENT_OFF = 0x00;
export const RENDER_SHELL_A1A540_MAX_CHARS_OFF = 0x04;
export const RENDER_SHELL_A1A540_MODE_OFF = 0x08;
export const RENDER_SHELL_A1A540_SCALE_OFF = 0x0c;
export const RENDER_SHELL_A1A540_UNK10_OFF = 0x10;
export const RENDER_SHELL_A1A540_UNK14_OFF = 0x14;
export const RENDER_SHELL_A1A540_UNK18_OFF = 0x18;
export const RENDER_SHELL_A1A540_MAX_CHARS_DEFAULT = 0x0000ffff;
export const RENDER_SHELL_A1A540_SCALE_DEFAULT_BITS = 0x3f800000;
export const RENDER_SHELL_A1A540_UNK10_DEFAULT = 0xffffffff;
export const RENDER_SHELL_A1A580_HOST_VA = 0x00a1a580;
export const RENDER_SHELL_A1A580_END_VA = 0x00a1a5bf;
export const RENDER_SHELL_A1A580_NEXT_VA = 0x00a1a5c0;
export const RENDER_SHELL_A1A580_CALLER_COUNT = 0x6;
export const RENDER_SHELL_A1A580_CALLER_FIRST_VA = 0x006fc4b1;
export const RENDER_SHELL_A1A580_CALLER_LAST_VA = 0x009c53bb;
export const RENDER_SHELL_A1A580_ADDR_TAKEN_COUNT = 0x0;
export const RENDER_SHELL_A1A580_EAX_WRITES = 0x1;
export const RENDER_SHELL_A1A580_STACK_ARGS = 0x1;
export const RENDER_SHELL_A1A580_THISCALL = 0x1;
export const RENDER_SHELL_A1A580_FIELD_COUNT = 0x7;
export const RENDER_SHELL_A1A580_ARG_OFF = 0x00;
export const RENDER_SHELL_A1A5C0_HOST_VA = 0x00a1a5c0;
export const RENDER_SHELL_A1A5C0_END_VA = 0x00a1a5cc;
export const RENDER_SHELL_A1A5C0_NEXT_VA = 0x00a1a5d0;
export const RENDER_SHELL_A1A5C0_CALLER_COUNT = 0x0;
export const RENDER_SHELL_A1A5C0_ADDR_TAKEN_COUNT = 0x1;
export const RENDER_SHELL_A1A5C0_ADDR_TAKEN_SITE_VA = 0x00866db2;
export const RENDER_SHELL_A1A5C0_EAX_WRITES = 0x1;
export const RENDER_SHELL_A1A5C0_STACK_ARGS = 0x1;
export const RENDER_SHELL_A1A5C0_THISCALL = 0x1;
export const RENDER_SHELL_A1A5C0_DEST_OFF = 0x00;
export const RENDER_SHELL_A1A5D0_HOST_VA = 0x00a1a5d0;
export const RENDER_SHELL_A1A5D0_END_VA = 0x00a1a5df;
export const RENDER_SHELL_A1A5D0_NEXT_VA = 0x00a1a5e0;
export const RENDER_SHELL_A1A5D0_CALLER_COUNT = 0x0;
export const RENDER_SHELL_A1A5D0_ADDR_TAKEN_COUNT = 0x1;
export const RENDER_SHELL_A1A5D0_ADDR_TAKEN_SITE_VA = 0x00866ddc;
export const RENDER_SHELL_A1A5D0_EAX_WRITES = 0x0;
export const RENDER_SHELL_A1A5D0_STACK_ARGS = 0x1;
export const RENDER_SHELL_A1A5D0_THISCALL = 0x1;
export const RENDER_SHELL_A1A5D0_DEST_OFF = 0x04;
export const RENDER_SHELL_A1A5D0_WORD_MASK = 0x0000ffff;
export const RENDER_SHELL_A1A5E0_HOST_VA = 0x00a1a5e0;
export const RENDER_SHELL_A1A5E0_END_VA = 0x00a1a5e5;
export const RENDER_SHELL_A1A5E0_NEXT_VA = 0x00a1a5f0;
export const RENDER_SHELL_A1A5E0_CALLER_COUNT = 0x0;
export const RENDER_SHELL_A1A5E0_ADDR_TAKEN_COUNT = 0x1;
export const RENDER_SHELL_A1A5E0_ADDR_TAKEN_SITE_VA = 0x00866df1;
export const RENDER_SHELL_A1A5E0_EAX_WRITES = 0x1;
export const RENDER_SHELL_A1A5E0_STACK_ARGS = 0x0;
export const RENDER_SHELL_A1A5E0_THISCALL = 0x1;
export const RENDER_SHELL_A1A5E0_SRC_OFF = 0x04;
export const RENDER_SHELL_A1A5E0_WORD_MASK = 0x0000ffff;
export const RENDER_SHELL_A1A5F0_HOST_VA = 0x00a1a5f0;
export const RENDER_SHELL_A1A5F0_END_VA = 0x00a1a5f8;
export const RENDER_SHELL_A1A5F0_NEXT_VA = 0x00a1a600;
export const RENDER_SHELL_A1A5F0_CALLER_COUNT = 0x0;
export const RENDER_SHELL_A1A5F0_ADDR_TAKEN_COUNT = 0x1;
export const RENDER_SHELL_A1A5F0_ADDR_TAKEN_SITE_VA = 0x00866e1b;
export const RENDER_SHELL_A1A5F0_EAX_WRITES = 0x1;
export const RENDER_SHELL_A1A5F0_STACK_ARGS = 0x0;
export const RENDER_SHELL_A1A5F0_THISCALL = 0x1;
export const RENDER_SHELL_A1A5F0_CMP_OFF = 0x08;
export const RENDER_SHELL_A1A5F0_CMP_VAL = 0x1;
export const RENDER_SHELL_HOST_A1A2E0_VA = 0x00a1a2e0;
export const RENDER_SHELL_HOST_A1A2E0_END_VA = 0x00a1a461;
export const RENDER_SHELL_HOST_A1A2E0_NEXT_VA = 0x00a1a470;
export const RENDER_SHELL_HOST_A1A2E0_CALLER_COUNT = 0x2;
export const RENDER_SHELL_HOST_A1A2E0_CALLER_FIRST_VA = 0x00925d0e;
export const RENDER_SHELL_HOST_A1A2E0_CALLER_LAST_VA = 0x00a196e8;
export const RENDER_SHELL_HOST_A1A2E0_ADDR_TAKEN_COUNT = 0x0;
export const RENDER_SHELL_HOST_A1A470_VA = 0x00a1a470;
export const RENDER_SHELL_HOST_A1A470_END_VA = 0x00a1a4f7;
export const RENDER_SHELL_HOST_A1A470_NEXT_VA = 0x00a1a500;
export const RENDER_SHELL_HOST_A1A470_CALLER_COUNT = 0x2;
export const RENDER_SHELL_HOST_A1A470_CALLER_FIRST_VA = 0x00925dd9;
export const RENDER_SHELL_HOST_A1A470_CALLER_LAST_VA = 0x00a19b6c;
export const RENDER_SHELL_HOST_A1A470_ADDR_TAKEN_COUNT = 0x0;
export const RENDER_SHELL_HOST_A1A500_VA = 0x00a1a500;
export const RENDER_SHELL_HOST_A1A500_END_VA = 0x00a1a533;
export const RENDER_SHELL_HOST_A1A500_NEXT_VA = 0x00a1a540;
export const RENDER_SHELL_HOST_A1A500_CALLER_COUNT = 0x1c;
export const RENDER_SHELL_HOST_A1A500_CALLER_FIRST_VA = 0x00a18df5;
export const RENDER_SHELL_HOST_A1A500_CALLER_LAST_VA = 0x00b16fbb;
export const RENDER_SHELL_HOST_A1A500_ADDR_TAKEN_COUNT = 0x0;
export const RENDER_SHELL_A1A160_BAND_START_VA = 0x00a1a160;
export const RENDER_SHELL_A1A160_BAND_END_VA = 0x00a1a600;
export const RENDER_SHELL_A1A160_BAND_OPEN_BODIES = 0x0;
export const RENDER_SHELL_A1A160_BAND_HOST_ROWS = 0x3;
export const RENDER_SHELL_A1A160_BAND_PURE_BODIES = 0x6;

/* a1a540/a1a580 7-field layout table: idx -> {off, default}. */
const RENDER_SHELL_A1A540_FIELDS = [
  [0x00000000, 0x00000000],
  [0x00000004, 0x0000ffff],
  [0x00000008, 0x00000000],
  [0x0000000c, 0x3f800000],
  [0x00000010, 0xffffffff],
  [0x00000014, 0x00000000],
  [0x00000018, 0x00000000],
];

/** a1a540 field offset law (PE store offsets, ascending). */
export function renderShellA1a540FieldOff(idx) {
  idx = asU32(idx);
  if (idx >= RENDER_SHELL_A1A540_FIELD_COUNT) return 0;
  return RENDER_SHELL_A1A540_FIELDS[idx][0] >>> 0;
}

/** a1a540 field default law (PE stored constants). */
export function renderShellA1a540FieldDefault(idx) {
  idx = asU32(idx);
  if (idx >= RENDER_SHELL_A1A540_FIELD_COUNT) return 0;
  return RENDER_SHELL_A1A540_FIELDS[idx][1] >>> 0;
}

export function renderShellA1a540HostVa() {
  return RENDER_SHELL_A1A540_HOST_VA >>> 0;
}
export function renderShellA1a540EndVa() {
  return RENDER_SHELL_A1A540_END_VA >>> 0;
}
export function renderShellA1a540NextVa() {
  return RENDER_SHELL_A1A540_NEXT_VA >>> 0;
}
export function renderShellA1a540CallerCount() {
  return RENDER_SHELL_A1A540_CALLER_COUNT >>> 0;
}
export function renderShellA1a540CallerFirstVa() {
  return RENDER_SHELL_A1A540_CALLER_FIRST_VA >>> 0;
}
export function renderShellA1a540CallerLastVa() {
  return RENDER_SHELL_A1A540_CALLER_LAST_VA >>> 0;
}
export function renderShellA1a540AddrTakenCount() {
  return RENDER_SHELL_A1A540_ADDR_TAKEN_COUNT >>> 0;
}
export function renderShellA1a540EaxWrites() {
  return RENDER_SHELL_A1A540_EAX_WRITES >>> 0;
}
export function renderShellA1a540StackArgs() {
  return RENDER_SHELL_A1A540_STACK_ARGS >>> 0;
}
export function renderShellA1a540ThisCall() {
  return RENDER_SHELL_A1A540_THISCALL >>> 0;
}
export function renderShellA1a540FieldCount() {
  return RENDER_SHELL_A1A540_FIELD_COUNT >>> 0;
}
export function renderShellA1a540AlignmentOff() {
  return RENDER_SHELL_A1A540_ALIGNMENT_OFF >>> 0;
}
export function renderShellA1a540MaxCharsOff() {
  return RENDER_SHELL_A1A540_MAX_CHARS_OFF >>> 0;
}
export function renderShellA1a540ModeOff() {
  return RENDER_SHELL_A1A540_MODE_OFF >>> 0;
}
export function renderShellA1a540ScaleOff() {
  return RENDER_SHELL_A1A540_SCALE_OFF >>> 0;
}
export function renderShellA1a540Unk10Off() {
  return RENDER_SHELL_A1A540_UNK10_OFF >>> 0;
}
export function renderShellA1a540Unk14Off() {
  return RENDER_SHELL_A1A540_UNK14_OFF >>> 0;
}
export function renderShellA1a540Unk18Off() {
  return RENDER_SHELL_A1A540_UNK18_OFF >>> 0;
}
export function renderShellA1a540MaxCharsDefault() {
  return RENDER_SHELL_A1A540_MAX_CHARS_DEFAULT >>> 0;
}
export function renderShellA1a540ScaleDefaultBits() {
  return RENDER_SHELL_A1A540_SCALE_DEFAULT_BITS >>> 0;
}
export function renderShellA1a540Unk10Default() {
  return RENDER_SHELL_A1A540_UNK10_DEFAULT >>> 0;
}

/** a1a580 field offset law (same table as a1a540). */
export function renderShellA1a580FieldOff(idx) {
  idx = asU32(idx);
  if (idx >= RENDER_SHELL_A1A580_FIELD_COUNT) return 0;
  return RENDER_SHELL_A1A540_FIELDS[idx][0] >>> 0;
}

/** a1a580 field default law (same table as a1a540). */
export function renderShellA1a580FieldDefault(idx) {
  idx = asU32(idx);
  if (idx >= RENDER_SHELL_A1A580_FIELD_COUNT) return 0;
  return RENDER_SHELL_A1A540_FIELDS[idx][1] >>> 0;
}

export function renderShellA1a580HostVa() {
  return RENDER_SHELL_A1A580_HOST_VA >>> 0;
}
export function renderShellA1a580EndVa() {
  return RENDER_SHELL_A1A580_END_VA >>> 0;
}
export function renderShellA1a580NextVa() {
  return RENDER_SHELL_A1A580_NEXT_VA >>> 0;
}
export function renderShellA1a580CallerCount() {
  return RENDER_SHELL_A1A580_CALLER_COUNT >>> 0;
}
export function renderShellA1a580CallerFirstVa() {
  return RENDER_SHELL_A1A580_CALLER_FIRST_VA >>> 0;
}
export function renderShellA1a580CallerLastVa() {
  return RENDER_SHELL_A1A580_CALLER_LAST_VA >>> 0;
}
export function renderShellA1a580AddrTakenCount() {
  return RENDER_SHELL_A1A580_ADDR_TAKEN_COUNT >>> 0;
}
export function renderShellA1a580EaxWrites() {
  return RENDER_SHELL_A1A580_EAX_WRITES >>> 0;
}
export function renderShellA1a580StackArgs() {
  return RENDER_SHELL_A1A580_STACK_ARGS >>> 0;
}
export function renderShellA1a580ThisCall() {
  return RENDER_SHELL_A1A580_THISCALL >>> 0;
}
export function renderShellA1a580FieldCount() {
  return RENDER_SHELL_A1A580_FIELD_COUNT >>> 0;
}
export function renderShellA1a580ArgOff() {
  return RENDER_SHELL_A1A580_ARG_OFF >>> 0;
}
export function renderShellA1a5c0HostVa() {
  return RENDER_SHELL_A1A5C0_HOST_VA >>> 0;
}
export function renderShellA1a5c0EndVa() {
  return RENDER_SHELL_A1A5C0_END_VA >>> 0;
}
export function renderShellA1a5c0NextVa() {
  return RENDER_SHELL_A1A5C0_NEXT_VA >>> 0;
}
export function renderShellA1a5c0CallerCount() {
  return RENDER_SHELL_A1A5C0_CALLER_COUNT >>> 0;
}
export function renderShellA1a5c0AddrTakenCount() {
  return RENDER_SHELL_A1A5C0_ADDR_TAKEN_COUNT >>> 0;
}
export function renderShellA1a5c0AddrTakenSiteVa() {
  return RENDER_SHELL_A1A5C0_ADDR_TAKEN_SITE_VA >>> 0;
}
export function renderShellA1a5c0EaxWrites() {
  return RENDER_SHELL_A1A5C0_EAX_WRITES >>> 0;
}
export function renderShellA1a5c0StackArgs() {
  return RENDER_SHELL_A1A5C0_STACK_ARGS >>> 0;
}
export function renderShellA1a5c0ThisCall() {
  return RENDER_SHELL_A1A5C0_THISCALL >>> 0;
}
export function renderShellA1a5c0DestOff() {
  return RENDER_SHELL_A1A5C0_DEST_OFF >>> 0;
}
export function renderShellA1a5d0HostVa() {
  return RENDER_SHELL_A1A5D0_HOST_VA >>> 0;
}
export function renderShellA1a5d0EndVa() {
  return RENDER_SHELL_A1A5D0_END_VA >>> 0;
}
export function renderShellA1a5d0NextVa() {
  return RENDER_SHELL_A1A5D0_NEXT_VA >>> 0;
}
export function renderShellA1a5d0CallerCount() {
  return RENDER_SHELL_A1A5D0_CALLER_COUNT >>> 0;
}
export function renderShellA1a5d0AddrTakenCount() {
  return RENDER_SHELL_A1A5D0_ADDR_TAKEN_COUNT >>> 0;
}
export function renderShellA1a5d0AddrTakenSiteVa() {
  return RENDER_SHELL_A1A5D0_ADDR_TAKEN_SITE_VA >>> 0;
}
export function renderShellA1a5d0EaxWrites() {
  return RENDER_SHELL_A1A5D0_EAX_WRITES >>> 0;
}
export function renderShellA1a5d0StackArgs() {
  return RENDER_SHELL_A1A5D0_STACK_ARGS >>> 0;
}
export function renderShellA1a5d0ThisCall() {
  return RENDER_SHELL_A1A5D0_THISCALL >>> 0;
}
export function renderShellA1a5d0DestOff() {
  return RENDER_SHELL_A1A5D0_DEST_OFF >>> 0;
}
export function renderShellA1a5d0WordMask() {
  return RENDER_SHELL_A1A5D0_WORD_MASK >>> 0;
}
export function renderShellA1a5e0HostVa() {
  return RENDER_SHELL_A1A5E0_HOST_VA >>> 0;
}
export function renderShellA1a5e0EndVa() {
  return RENDER_SHELL_A1A5E0_END_VA >>> 0;
}
export function renderShellA1a5e0NextVa() {
  return RENDER_SHELL_A1A5E0_NEXT_VA >>> 0;
}
export function renderShellA1a5e0CallerCount() {
  return RENDER_SHELL_A1A5E0_CALLER_COUNT >>> 0;
}
export function renderShellA1a5e0AddrTakenCount() {
  return RENDER_SHELL_A1A5E0_ADDR_TAKEN_COUNT >>> 0;
}
export function renderShellA1a5e0AddrTakenSiteVa() {
  return RENDER_SHELL_A1A5E0_ADDR_TAKEN_SITE_VA >>> 0;
}
export function renderShellA1a5e0EaxWrites() {
  return RENDER_SHELL_A1A5E0_EAX_WRITES >>> 0;
}
export function renderShellA1a5e0StackArgs() {
  return RENDER_SHELL_A1A5E0_STACK_ARGS >>> 0;
}
export function renderShellA1a5e0ThisCall() {
  return RENDER_SHELL_A1A5E0_THISCALL >>> 0;
}
export function renderShellA1a5e0SrcOff() {
  return RENDER_SHELL_A1A5E0_SRC_OFF >>> 0;
}
export function renderShellA1a5e0WordMask() {
  return RENDER_SHELL_A1A5E0_WORD_MASK >>> 0;
}
export function renderShellA1a5f0HostVa() {
  return RENDER_SHELL_A1A5F0_HOST_VA >>> 0;
}
export function renderShellA1a5f0EndVa() {
  return RENDER_SHELL_A1A5F0_END_VA >>> 0;
}
export function renderShellA1a5f0NextVa() {
  return RENDER_SHELL_A1A5F0_NEXT_VA >>> 0;
}
export function renderShellA1a5f0CallerCount() {
  return RENDER_SHELL_A1A5F0_CALLER_COUNT >>> 0;
}
export function renderShellA1a5f0AddrTakenCount() {
  return RENDER_SHELL_A1A5F0_ADDR_TAKEN_COUNT >>> 0;
}
export function renderShellA1a5f0AddrTakenSiteVa() {
  return RENDER_SHELL_A1A5F0_ADDR_TAKEN_SITE_VA >>> 0;
}
export function renderShellA1a5f0EaxWrites() {
  return RENDER_SHELL_A1A5F0_EAX_WRITES >>> 0;
}
export function renderShellA1a5f0StackArgs() {
  return RENDER_SHELL_A1A5F0_STACK_ARGS >>> 0;
}
export function renderShellA1a5f0ThisCall() {
  return RENDER_SHELL_A1A5F0_THISCALL >>> 0;
}
export function renderShellA1a5f0CmpOff() {
  return RENDER_SHELL_A1A5F0_CMP_OFF >>> 0;
}
export function renderShellA1a5f0CmpVal() {
  return RENDER_SHELL_A1A5F0_CMP_VAL >>> 0;
}
export function renderShellHostA1a2e0Va() {
  return RENDER_SHELL_HOST_A1A2E0_VA >>> 0;
}
export function renderShellHostA1a2e0EndVa() {
  return RENDER_SHELL_HOST_A1A2E0_END_VA >>> 0;
}
export function renderShellHostA1a2e0NextVa() {
  return RENDER_SHELL_HOST_A1A2E0_NEXT_VA >>> 0;
}
export function renderShellHostA1a2e0CallerCount() {
  return RENDER_SHELL_HOST_A1A2E0_CALLER_COUNT >>> 0;
}
export function renderShellHostA1a2e0CallerFirstVa() {
  return RENDER_SHELL_HOST_A1A2E0_CALLER_FIRST_VA >>> 0;
}
export function renderShellHostA1a2e0CallerLastVa() {
  return RENDER_SHELL_HOST_A1A2E0_CALLER_LAST_VA >>> 0;
}
export function renderShellHostA1a2e0AddrTakenCount() {
  return RENDER_SHELL_HOST_A1A2E0_ADDR_TAKEN_COUNT >>> 0;
}
export function renderShellHostA1a470Va() {
  return RENDER_SHELL_HOST_A1A470_VA >>> 0;
}
export function renderShellHostA1a470EndVa() {
  return RENDER_SHELL_HOST_A1A470_END_VA >>> 0;
}
export function renderShellHostA1a470NextVa() {
  return RENDER_SHELL_HOST_A1A470_NEXT_VA >>> 0;
}
export function renderShellHostA1a470CallerCount() {
  return RENDER_SHELL_HOST_A1A470_CALLER_COUNT >>> 0;
}
export function renderShellHostA1a470CallerFirstVa() {
  return RENDER_SHELL_HOST_A1A470_CALLER_FIRST_VA >>> 0;
}
export function renderShellHostA1a470CallerLastVa() {
  return RENDER_SHELL_HOST_A1A470_CALLER_LAST_VA >>> 0;
}
export function renderShellHostA1a470AddrTakenCount() {
  return RENDER_SHELL_HOST_A1A470_ADDR_TAKEN_COUNT >>> 0;
}
export function renderShellHostA1a500Va() {
  return RENDER_SHELL_HOST_A1A500_VA >>> 0;
}
export function renderShellHostA1a500EndVa() {
  return RENDER_SHELL_HOST_A1A500_END_VA >>> 0;
}
export function renderShellHostA1a500NextVa() {
  return RENDER_SHELL_HOST_A1A500_NEXT_VA >>> 0;
}
export function renderShellHostA1a500CallerCount() {
  return RENDER_SHELL_HOST_A1A500_CALLER_COUNT >>> 0;
}
export function renderShellHostA1a500CallerFirstVa() {
  return RENDER_SHELL_HOST_A1A500_CALLER_FIRST_VA >>> 0;
}
export function renderShellHostA1a500CallerLastVa() {
  return RENDER_SHELL_HOST_A1A500_CALLER_LAST_VA >>> 0;
}
export function renderShellHostA1a500AddrTakenCount() {
  return RENDER_SHELL_HOST_A1A500_ADDR_TAKEN_COUNT >>> 0;
}
export function renderShellA1a160BandStartVa() {
  return RENDER_SHELL_A1A160_BAND_START_VA >>> 0;
}
export function renderShellA1a160BandEndVa() {
  return RENDER_SHELL_A1A160_BAND_END_VA >>> 0;
}
export function renderShellA1a160BandOpenBodies() {
  return RENDER_SHELL_A1A160_BAND_OPEN_BODIES >>> 0;
}
export function renderShellA1a160BandHostRows() {
  return RENDER_SHELL_A1A160_BAND_HOST_ROWS >>> 0;
}
export function renderShellA1a160BandPureBodies() {
  return RENDER_SHELL_A1A160_BAND_PURE_BODIES >>> 0;
}

/* ============================================================================
 * ABI v70: FontSettings next sub-band 0xa1a600..0xa1a63f (evidence
 * section-notes/render-shell-v70-fontsettings/NOTES.md). Three PURE
 * bodies + three HOST rows close the v69 OPEN marker. Please keep the
 * render shell export list in sync with these names.
 * ========================================================================== */
export const RENDER_SHELL_A1A600_HOST_VA = 0x00a1a600;
export const RENDER_SHELL_A1A600_END_VA = 0x00a1a616;
export const RENDER_SHELL_A1A600_NEXT_VA = 0x00a1a620;
export const RENDER_SHELL_A1A600_ADDR_TAKEN_COUNT = 0x1;
export const RENDER_SHELL_A1A600_ADDR_TAKEN_SITE_VA = 0x00866e31;
export const RENDER_SHELL_A1A600_STACK_ARGS = 0x1;
export const RENDER_SHELL_A1A600_THISCALL = 0x1;
export const RENDER_SHELL_A1A600_STATE_OFF = 0x08;
export const RENDER_SHELL_A1A600_STATE_VALUE = 0x2;
export const RENDER_SHELL_A1A600_WORD_OFF = 0x06;
export const RENDER_SHELL_A1A600_WORD_MASK = 0x0000ffff;
export const RENDER_SHELL_A1A620_HOST_VA = 0x00a1a620;
export const RENDER_SHELL_A1A620_END_VA = 0x00a1a628;
export const RENDER_SHELL_A1A620_NEXT_VA = 0x00a1a630;
export const RENDER_SHELL_A1A620_ADDR_TAKEN_COUNT = 0x1;
export const RENDER_SHELL_A1A620_ADDR_TAKEN_SITE_VA = 0x00866e46;
export const RENDER_SHELL_A1A620_STACK_ARGS = 0x0;
export const RENDER_SHELL_A1A620_THISCALL = 0x1;
export const RENDER_SHELL_A1A620_CMP_OFF = 0x08;
export const RENDER_SHELL_A1A620_CMP_VAL = 0x2;
export const RENDER_SHELL_A1A630_HOST_VA = 0x00a1a630;
export const RENDER_SHELL_A1A630_END_VA = 0x00a1a63d;
export const RENDER_SHELL_A1A630_NEXT_VA = 0x00a1a640;
export const RENDER_SHELL_A1A630_ADDR_TAKEN_COUNT = 0x2;
export const RENDER_SHELL_A1A630_ADDR_TAKEN_PUSH_SITE_VA = 0x00866e85;
export const RENDER_SHELL_A1A630_ADDR_TAKEN_STORE_SITE_VA = 0x0089faf7;
export const RENDER_SHELL_A1A630_STACK_ARGS = 0x1;
export const RENDER_SHELL_A1A630_THISCALL = 0x1;
export const RENDER_SHELL_A1A630_DEST_OFF = 0x10;
export const RENDER_SHELL_HOST_A1A640_VA = 0x00a1a640;
export const RENDER_SHELL_HOST_A1A640_END_VA = 0x00a1a6ee;
export const RENDER_SHELL_HOST_A1A640_NEXT_VA = 0x00a1a6f0;
export const RENDER_SHELL_HOST_A1A640_CALLER_COUNT = 0x12;
export const RENDER_SHELL_HOST_A1A640_CALLER_FIRST_VA = 0x006f20b1;
export const RENDER_SHELL_HOST_A1A640_CALLER_LAST_VA = 0x009b54d8;
export const RENDER_SHELL_HOST_A1A6F0_VA = 0x00a1a6f0;
export const RENDER_SHELL_HOST_A1A6F0_END_VA = 0x00a1a723;
export const RENDER_SHELL_HOST_A1A6F0_NEXT_VA = 0x00a1a730;
export const RENDER_SHELL_HOST_A1A6F0_CALLER_COUNT = 0x0;
export const RENDER_SHELL_HOST_A1A6F0_JMP_TAIL_COUNT = 0x3;
export const RENDER_SHELL_HOST_A1A6F0_JMP_TAIL_FIRST_VA = 0x00afb86f;
export const RENDER_SHELL_HOST_A1A730_VA = 0x00a1a730;
export const RENDER_SHELL_HOST_A1A730_END_VA = 0x00a1c445;
export const RENDER_SHELL_HOST_A1A730_NEXT_VA = 0x00a1c480;
export const RENDER_SHELL_HOST_A1A730_CALLER_COUNT = 0x11;
export const RENDER_SHELL_HOST_A1A730_CALLER_FIRST_VA = 0x00840956;
export const RENDER_SHELL_HOST_A1A730_CALLER_LAST_VA = 0x009efbf6;
export const RENDER_SHELL_A1A600_BAND_START_VA = 0x00a1a600;
export const RENDER_SHELL_A1A600_BAND_END_VA = 0x00a1a640;
export const RENDER_SHELL_A1A600_BAND_OPEN_BODIES = 0x0;
export const RENDER_SHELL_A1A600_BAND_PURE_BODIES = 0x3;
export const RENDER_SHELL_A1A600_BAND_HOST_ROWS = 0x3;

/** a1a600 law: the ALWAYS state store value (dword [ecx+8] := 2). */
export function renderShellA1a600StateWritten() {
  return RENDER_SHELL_A1A600_STATE_VALUE >>> 0;
}

/** a1a600 law: PE word load/store -> in-body 0xffff mask. */
export function renderShellA1a600TruncationWord(arg) {
  return (asU32(arg) & RENDER_SHELL_A1A600_WORD_MASK) >>> 0;
}

/** a1a620 law: `cmp dword [ecx+8],2 ; sete al ; ret`. */
export function renderShellA1a620IsTruncationEnabled(state8) {
  return asU32(state8) === RENDER_SHELL_A1A620_CMP_VAL ? 1 : 0;
}

/** a1a630 law: FULL-dword override passthrough (NO word mask). */
export function renderShellA1a630OverrideValue(arg) {
  return asU32(arg);
}

/* ============================================================================
 * ABI v71: std::sort cluster band 0xa1c480..0xa1d600 (evidence:
 * section-notes/render-shell-v71-depth/NOTES.md). Two PURE bodies landed
 * (heap adjust 0xa1d4d0, med3 0xa1d5a0) + census pins for the host rows
 * 0xa1c480 / 0xa1c7d0 / 0xa1cea0 / 0xa1cfa0 and the pinned partition body
 * 0xa1d280. Please keep the render shell export list in sync.
 * ========================================================================== */
export const RENDER_SHELL_HOST_A1C480_VA = 0x00a1c480;
export const RENDER_SHELL_HOST_A1C480_END_VA = 0x00a1c7cb;
export const RENDER_SHELL_HOST_A1C480_NEXT_VA = 0x00a1c7d0;
export const RENDER_SHELL_HOST_A1C480_CALLER_COUNT = 0x8;
export const RENDER_SHELL_HOST_A1C480_CALLER_FIRST_VA = 0x00837f2a;
export const RENDER_SHELL_HOST_A1C480_CALLER_LAST_VA = 0x00a1b327;
export const RENDER_SHELL_HOST_A1C480_SEH_FS_PROBES = 0x4;
export const RENDER_SHELL_HOST_A1C480_RET_IMM = 0x10;
export const RENDER_SHELL_HOST_A1C7D0_VA = 0x00a1c7d0;
export const RENDER_SHELL_HOST_A1C7D0_END_VA = 0x00a1ce6b;
export const RENDER_SHELL_HOST_A1C7D0_NEXT_VA = 0x00a1cea0;
export const RENDER_SHELL_HOST_A1C7D0_CALLER_COUNT = 0x8;
export const RENDER_SHELL_HOST_A1C7D0_CALLER_FIRST_VA = 0x00837f6f;
export const RENDER_SHELL_HOST_A1C7D0_CALLER_LAST_VA = 0x00a1b37f;
export const RENDER_SHELL_HOST_A1C7D0_JUMP_TABLE_VA = 0x00a1ce6c;
export const RENDER_SHELL_HOST_A1C7D0_JUMP_TABLE_ENTRIES = 0x9;
export const RENDER_SHELL_HOST_A1C7D0_E8_COUNT = 0xe;
export const RENDER_SHELL_HOST_A1C7D0_RET_IMM = 0x24;
export const RENDER_SHELL_HOST_A1CEA0_VA = 0x00a1cea0;
export const RENDER_SHELL_HOST_A1CEA0_END_VA = 0x00a1cf9a;
export const RENDER_SHELL_HOST_A1CEA0_NEXT_VA = 0x00a1cfa0;
export const RENDER_SHELL_HOST_A1CEA0_CALLER_COUNT = 0x1;
export const RENDER_SHELL_HOST_A1CEA0_CALLER_ONLY_VA = 0x00a1ac16;
export const RENDER_SHELL_HOST_A1CEA0_RET_IMM = 0x8;
export const RENDER_SHELL_HOST_A1CFA0_VA = 0x00a1cfa0;
export const RENDER_SHELL_HOST_A1CFA0_END_VA = 0x00a1d27d;
export const RENDER_SHELL_HOST_A1CFA0_NEXT_VA = 0x00a1d280;
export const RENDER_SHELL_HOST_A1CFA0_CALLER_COUNT = 0x3;
export const RENDER_SHELL_HOST_A1CFA0_SELF_CALL_SITES = 0x2;
export const RENDER_SHELL_HOST_A1CFA0_CALLER_FIRST_VA = 0x00a1ad12;
export const RENDER_SHELL_HOST_A1CFA0_CALLER_LAST_VA = 0x00a1d035;
export const RENDER_SHELL_HOST_A1CFA0_COOKIE_VA = 0x00bf93b4;
export const RENDER_SHELL_A1D280_VA = 0x00a1d280;
export const RENDER_SHELL_A1D280_END_VA = 0x00a1d4c8;
export const RENDER_SHELL_A1D280_NEXT_VA = 0x00a1d4d0;
export const RENDER_SHELL_A1D280_CALLER_COUNT = 0x1;
export const RENDER_SHELL_A1D280_CALLER_SITE_VA = 0x00a1cfe8;
export const RENDER_SHELL_A1D280_CALLEE_VA = 0x00a1d5a0;
export const RENDER_SHELL_A1D280_CALLEE_SITE_COUNT = 0x5;
export const RENDER_SHELL_A1D4D0_HOST_VA = 0x00a1d4d0;
export const RENDER_SHELL_A1D4D0_END_VA = 0x00a1d591;
export const RENDER_SHELL_A1D4D0_NEXT_VA = 0x00a1d5a0;
export const RENDER_SHELL_A1D4D0_ELEM_SIZE = 0x10;
export const RENDER_SHELL_A1D4D0_KEY_HI_OFF = 0x4;
export const RENDER_SHELL_A1D4D0_KEY_LO_OFF = 0x0;
export const RENDER_SHELL_A1D4D0_CALLER_COUNT = 0x1;
export const RENDER_SHELL_A1D4D0_CALLER_SITE_VA = 0x00a1d207;
export const RENDER_SHELL_A1D5A0_HOST_VA = 0x00a1d5a0;
export const RENDER_SHELL_A1D5A0_END_VA = 0x00a1d5fd;
export const RENDER_SHELL_A1D5A0_NEXT_VA = 0x00a1d600;
export const RENDER_SHELL_A1D5A0_ELEM_SIZE = 0x10;
export const RENDER_SHELL_A1D5A0_KEY_HI_OFF = 0x4;
export const RENDER_SHELL_A1D5A0_KEY_LO_OFF = 0x0;
export const RENDER_SHELL_A1D5A0_CALL_SITE_COUNT = 0x5;
export const RENDER_SHELL_A1D5A0_CALL_SITE_FIRST_VA = 0x00a1d2d0;
export const RENDER_SHELL_A1D5A0_CALL_SITE_LAST_VA = 0x00a1d318;
export const RENDER_SHELL_A1C480_BAND_START_VA = 0x00a1c480;
export const RENDER_SHELL_A1C480_BAND_END_VA = 0x00a1d600;
export const RENDER_SHELL_A1C480_BAND_OPEN_BODIES = 0x0;
export const RENDER_SHELL_A1C480_BAND_PURE_BODIES = 0x2;
export const RENDER_SHELL_A1C480_BAND_HOST_ROWS = 0x5;

/** a1d5a0/a1d4d0 key law: uint64 at [+0,+8), hi dword at +4, unsigned. */
export function renderShellV71KeyLt(hiP, loP, hiQ, loQ) {
  if ((hiP >>> 0) < (hiQ >>> 0)) return 1;
  if ((hiP >>> 0) > (hiQ >>> 0)) return 0;
  return (loP >>> 0) < (loQ >>> 0) ? 1 : 0;
}

/** a1d4d0 down-phase child pick law: larger child; TIES -> higher index
 * (PE `ja` on right2.hi, then `jae` on right2.lo -> pick 2). */
export function renderShellA1d4d0ChildPick(
  hiLeft, loLeft, hiRight, loRight,
) {
  if ((hiRight >>> 0) > (hiLeft >>> 0)) return 2;
  if ((hiRight >>> 0) < (hiLeft >>> 0)) return 1;
  return (loRight >>> 0) >= (loLeft >>> 0) ? 2 : 1;
}

/** a1d5a0 med3 scalar oracle: the median of the three uint64 keys (hi,lo
 * pairs, unsigned) — after the PE swaps this exact key ends up in the edx
 * slot. Returned as packed [hi, lo] array. */
export function renderShellA1d5a0MedianKey(hiA, loA, hiB, loB, hiC, loC) {
  const keys = [
    [hiA >>> 0, loA >>> 0],
    [hiB >>> 0, loB >>> 0],
    [hiC >>> 0, loC >>> 0],
  ];
  keys.sort((p, q) => (p[0] - q[0]) || (p[1] - q[1]));
  return keys[1];
}

/* ============================================================================
 * ABI v72: 0xa1d600 double-zero PURE law + 0xa1d610 SEH ctor HOST row
 * (evidence: section-notes/render-shell-v71-depth/NOTES.md v72 append).
 * Please keep the render shell export list in sync.
 * ========================================================================== */
export const RENDER_SHELL_A1D600_HOST_VA = 0x00a1d600;
export const RENDER_SHELL_A1D600_END_VA = 0x00a1d60e;
export const RENDER_SHELL_A1D600_NEXT_VA = 0x00a1d610;
export const RENDER_SHELL_A1D600_BODY_SIZE = 0xe;
export const RENDER_SHELL_A1D600_ZERO_OFF_A = 0x0;
export const RENDER_SHELL_A1D600_ZERO_OFF_B = 0x4;
export const RENDER_SHELL_A1D600_DIRECT_CALLER_COUNT = 0x0;
export const RENDER_SHELL_A1D600_JMP_TAIL_COUNT = 0xe;
export const RENDER_SHELL_A1D600_JMP_TAIL_FIRST_VA = 0x00b08a27;
export const RENDER_SHELL_A1D600_JMP_TAIL_LAST_VA = 0x00b14138;
export const RENDER_SHELL_HOST_A1D610_VA = 0x00a1d610;
export const RENDER_SHELL_HOST_A1D610_END_VA = 0x00a1d6ab;
export const RENDER_SHELL_HOST_A1D610_NEXT_VA = 0x00a1d6b0;
export const RENDER_SHELL_HOST_A1D610_CALLER_COUNT = 0xe;
export const RENDER_SHELL_HOST_A1D610_CALLER_FIRST_VA = 0x009069f5;
export const RENDER_SHELL_HOST_A1D610_CALLER_LAST_VA = 0x00a7148b;
export const RENDER_SHELL_HOST_A1D610_SEH_FS_PROBES = 0x3;
export const RENDER_SHELL_HOST_A1D610_HANDLER_VA = 0x00b11395;
export const RENDER_SHELL_HOST_A1D610_COOKIE_VA = 0x00bf93b4;
export const RENDER_SHELL_HOST_A1D610_E8_COUNT = 0x1;
export const RENDER_SHELL_HOST_A1D610_INDIRECT_COUNT = 0x1;
export const RENDER_SHELL_HOST_A1D610_ALLOC_SIZE = 0x10;
export const RENDER_SHELL_HOST_A1D610_ALLOC_HOST_VA = 0x00a0f4c0;
export const RENDER_SHELL_HOST_A1D610_RET_IMM = 0x8;
export const RENDER_SHELL_A1D600_BAND_START_VA = 0x00a1d600;
export const RENDER_SHELL_A1D600_BAND_END_VA = 0x00a1d6b0;
export const RENDER_SHELL_A1D600_BAND_OPEN_BODIES = 0x0;
export const RENDER_SHELL_A1D600_BAND_PURE_BODIES = 0x1;
export const RENDER_SHELL_A1D600_BAND_HOST_ROWS = 0x1;

/** a1d600 law: which dword offsets the body zeroes ([+0] then [+4]). */
export function renderShellA1d600ZeroOffsets() {
  return [RENDER_SHELL_A1D600_ZERO_OFF_A, RENDER_SHELL_A1D600_ZERO_OFF_B];
}

/* ============================================================================
 * ABI v73: 0xa1dfd0..0xa1e044 hot float-gate predicate law + sum chain
 * (evidence: section-notes/render-shell-v71-a1c480/NOTES.md §9 Body H).
 * Independently transcribed from the PE bytes: movss/addss x3 chain in
 * field order, mulss [0xbaa1d4]=0.25f, ucomiss [0xba9fe4]=+0.0f,
 * lahf / test ah,0x44 / jp @0xa1e001. Please keep the render shell
 * export list in sync.
 * ========================================================================== */
export const RENDER_SHELL_HOST_A1DFD0_VA = 0x00a1dfd0;
export const RENDER_SHELL_HOST_A1DFD0_END_VA = 0x00a1e044;
export const RENDER_SHELL_HOST_A1DFD0_NEXT_VA = 0x00a1e050;
export const RENDER_SHELL_HOST_A1DFD0_BODY_SIZE = 0x74;
export const RENDER_SHELL_A1DFD0_FIELD_OFF_FIRST = 0x40;
export const RENDER_SHELL_A1DFD0_FIELD_OFF_SECOND = 0x2c;
export const RENDER_SHELL_A1DFD0_FIELD_OFF_THIRD = 0x54;
export const RENDER_SHELL_A1DFD0_FIELD_OFF_FOURTH = 0x68;
export const RENDER_SHELL_A1DFD0_SCALE_CONST_VA = 0x00baa1d4;
export const RENDER_SHELL_A1DFD0_THRESH_CONST_VA = 0x00ba9fe4;
export const RENDER_SHELL_A1DFD0_SCALE_BITS = 0x3e800000; /* 0.25f */
export const RENDER_SHELL_A1DFD0_THRESH_BITS = 0x00000000; /* +0.0f */
export const RENDER_SHELL_A1DFD0_TEST_AH_MASK = 0x44;
export const RENDER_SHELL_A1DFD0_NAME_KEY_VA = 0x00b81e50;
export const RENDER_SHELL_HOST_A1DFD0_E8_COUNT = 0x5;
export const RENDER_SHELL_HOST_A1DFD0_RET_IMM = 0x4;
export const RENDER_SHELL_HOST_A1DFD0_CALLER_COUNT = 0x2c;
export const RENDER_SHELL_HOST_A1DFD0_CALLER_FIRST_VA = 0x0042e17a;
export const RENDER_SHELL_HOST_A1DFD0_CALLER_LAST_VA = 0x009ed050;
export const RENDER_SHELL_A1DFD0_CALLEE_SITE_COUNT = 0x5;
export const RENDER_SHELL_A1DFD0_CALLEE_SITE_1_VA = 0x00a140c0; /* v34 law */
export const RENDER_SHELL_A1DFD0_CALLEE_SITE_2_VA = 0x00a11080; /* UNLANDED */
export const RENDER_SHELL_A1DFD0_CALLEE_SITE_3_VA = 0x00a13750; /* UNLANDED */
export const RENDER_SHELL_A1DFD0_CALLEE_SITE_4_VA = 0x00a671b0; /* UNLANDED */
export const RENDER_SHELL_A1DFD0_CALLEE_SITE_5_VA = 0x00a14200; /* v35 law */
export const RENDER_SHELL_A1DFD0_UNLANDED_CALLEE_COUNT = 0x3;
export const RENDER_SHELL_A1DFD0_BAND_START_VA = 0x00a1dfd0;
export const RENDER_SHELL_A1DFD0_BAND_END_VA = 0x00a1e050;
export const RENDER_SHELL_A1DFD0_BAND_OPEN_BODIES = 0x0;
export const RENDER_SHELL_A1DFD0_BAND_PURE_BODIES = 0x1;
export const RENDER_SHELL_A1DFD0_BAND_HOST_ROWS = 0x1;

function a1dfd0BitsToF32(bits) {
  const buf = new ArrayBuffer(4);
  const view = new DataView(buf);
  view.setUint32(0, bits >>> 0, true);
  return view.getFloat32(0, true);
}

/** Sum-chain oracle: (((f40+f2c)+f54)+f68) with each step rounded to
 * f32 exactly like the PE addss sequence. Returns raw f32 BITS (the
 * gate boolean alone cannot see accumulation-order divergence). */
export function renderShellA1dfd0SumChain(f40, f2c, f54, f68) {
  const fr = Math.fround;
  const acc = fr(fr(fr(fr(f40) + f2c) + f54) + f68);
  const buf = new ArrayBuffer(4);
  const view = new DataView(buf);
  view.setFloat32(0, acc, true);
  return view.getUint32(0, true);
}

/** Float-gate oracle via the EXACT flag dance (not collapsed to !=):
 * ucomiss sets ZF(bit6)/PF(bit2)/CF(bit0); lafh copies them into AH;
 * test ah,0x44 then jp reads PARITY OF THE RESULT BYTE (PF set iff an
 * even number of bits). Taken for r in {0x00, 0x44}; not taken only
 * for r==0x40 (equal). Net: !(scaled == +0.0f), NaN scaled -> true. */
export function renderShellA1dfd0FloatGate(f40, f2c, f54, f68) {
  const fr = Math.fround;
  const sum = fr(fr(fr(fr(f40) + f2c) + f54) + f68);
  const scaled = fr(sum * a1dfd0BitsToF32(RENDER_SHELL_A1DFD0_SCALE_BITS));
  const thr = a1dfd0BitsToF32(RENDER_SHELL_A1DFD0_THRESH_BITS);
  const unord = Number.isNaN(scaled) || Number.isNaN(thr);
  const zf = (unord || scaled === thr) ? 0x40 : 0x00;
  const cf = (unord || scaled < thr) ? 0x01 : 0x00;
  const pfUcomiss = unord ? 0x04 : 0x00;
  const ah = zf | pfUcomiss | cf;
  const masked = ah & RENDER_SHELL_A1DFD0_TEST_AH_MASK;
  let pc = 0;
  for (let m = masked >>> 0; m !== 0; m >>>= 1) pc += m & 1;
  return ((pc & 1) === 0) ? 1 : 0;
}

/** PE field offsets in accumulation order [0x40, 0x2c, 0x54, 0x68]. */
export function renderShellA1dfd0FieldOffsets() {
  return [
    RENDER_SHELL_A1DFD0_FIELD_OFF_FIRST,
    RENDER_SHELL_A1DFD0_FIELD_OFF_SECOND,
    RENDER_SHELL_A1DFD0_FIELD_OFF_THIRD,
    RENDER_SHELL_A1DFD0_FIELD_OFF_FOURTH,
  ];
}

/* ============================================================================
 * ABI v74: 0xa1e490 two-dword setter PURE law (census rshell-a1c480-
 * scan; bytes re-verified). PE store order [0xc8]=arg0, [0xcc]=arg1.
 * ========================================================================== */
export const RENDER_SHELL_A1E490_HOST_VA = 0x00a1e490;
export const RENDER_SHELL_A1E490_END_VA = 0x00a1e4a9;
export const RENDER_SHELL_A1E490_NEXT_VA = 0x00a1e4b0;
export const RENDER_SHELL_A1E490_BODY_SIZE = 0x19;
export const RENDER_SHELL_A1E490_SETTER_OFF_A = 0xc8;
export const RENDER_SHELL_A1E490_SETTER_OFF_B = 0xcc;
export const RENDER_SHELL_A1E490_RET_IMM = 0x8;
export const RENDER_SHELL_A1E490_DIRECT_CALLER_COUNT = 0x0;
export const RENDER_SHELL_A1E490_E9_TAIL_COUNT = 0x0;
export const RENDER_SHELL_A1E490_BAND_START_VA = 0x00a1e490;
export const RENDER_SHELL_A1E490_BAND_END_VA = 0x00a1e590;
export const RENDER_SHELL_A1E490_BAND_OPEN_BODIES = 0x0;
export const RENDER_SHELL_A1E490_BAND_PURE_BODIES = 0x1;
export const RENDER_SHELL_A1E490_BAND_HOST_ROWS = 0x1;

/** Setter law oracle: which dword offsets the body writes, in order. */
export function renderShellA1e490SetOffsets() {
  return [RENDER_SHELL_A1E490_SETTER_OFF_A, RENDER_SHELL_A1E490_SETTER_OFF_B];
}
