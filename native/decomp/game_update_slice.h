#pragma once

#include <stddef.h>
#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

/* Reconstructed from intact native/decomp/game_update_slice.cpp
   offsetof/sizeof/static_assert pins. ABI 88: 0x0092e300 SFX sound-group walk
   split (host-resolved +0x38/+0x44, host event +0x3c, in-module [e+0x29]
   stores). ready=0 stays pre-v50 monolithic. Not a Read-tool dump. */

enum {
  /* ABI v96 (record idx 4, 0x008318a0 modes 1/2/4 decision laws): the
     mode-1 SFX-manager block entry/clear-walk/171-store gates + the 9-store
     TYPED store plan (sfx_manager_store_plan; manager base 0xc798e0 = .data
     BSS outside BINARY_LAYOUT — globals are ABI-96 lane requests) + the
     tail mode-set/0x830950 laws; mode-2 lane/direct-tail (vec_begin =
     Game+0x1baa8 = the v92 walk span)/fast-reset/player-418 laws; mode-4
     per-player walk-call/name-string (BYTE)/final-reset laws; the blob-
     gated walk arm (walk_pure_skip BY REFERENCE to the v92 98dba0 law —
     count==0 makes every record-4 player-walk loop a proof-complete pure
     skip). Exports-only; ABI 95 unchanged; layouts frozen; no uint8_t
     params. The 0x4213d3 call-mode (record-10 true-probe -> 0x8318a0)
     provability needs the SFX-manager BSS capture + per-player entry pack +
     byte_7c lane (NOTES §5, ABI 96 post-freeze). */
  /* ABI v95: record idx 32 (0x0098dba0 PlayerWalk) FUN_00956110 phone-home
     probe pure laws. net_gate = FULL-DWORD (mode==2 && [0xc71690]!=0) at
     PE 0x956120/0x956126; net_early = (out_byte & 0xff) != 0 at PE 0x956142;
     path = WALK iff mp non-empty && arg2==-1 (PE 0x95615d/0x956161 FULL-DWORD);
     walk_result = first (entry_al & 0xff) != 0 fold (PE 0x956166..0x9561a9,
     unsigned jb loop); arg_prep/result_plan = the arg-prep + composition
     (platform IO tail 0x864c30 / vtable+0x30 / general callback 0xa20940
     stay typed-host). */
  /* ABI v94: record idx 1 (0x0092e300) walk pending-mask law action-gated:
     disabled/empty groups set no mask bits (PE 0x92e340/0x92e352 gates
     precede every [e+0x29] store at 0x92e37b/0x92e3c7). */
/* ABI v94 (R3 log-split): FUN_0040add0 fatal log 'AnimationData is NULL'
     (0x40adde..0x40adee push 0xb1a504/0x10, call 0xa112c0) is split into a
     TYPED HOST EVENT (frame_opaque_4212c0_add0_log_needed @508); the post-log
     probe flow (miss/bit + false-arm clear) is proven pure on BOTH field_4
     arms (PE 0x40adf1..0x40ae6a reached from the log fall-through too). */
  /* ABI v95 (record idx 48 0x008607a0 set-arm arg-prep): the LuaEngine
     frame-unref SET arm (flag byte bit 1 set) publishes the lua_pcallk
     call-ARG laws as the typed event's arg-prep: LUA_REGISTRYINDEX
     0xfff0b9d8 (0x860803/0x872996/0x8729e4), nargs 2 / nresults 1
     (0x8729c8/0x8729c6), pcallk context errfunc/ctx/k == 0 (0x8729c0..c4)
     and the two pushed call args 1 / 0xffffffff (0x8607d1/0x8607d8). The
     pcallk itself stays typed-host (registry[fn_key] is mod bytecode with
     game-API side effects; fn_key = P[4], P=[engine+0x10], host-time).
     ready==0 (monolith) and the v57-dropped clear arm leave them 0. */
  /* ABI v95 (R4 equal-flags capture, record idx 10 0x004212c0): the
     FUN_0040add0 NON-EMPTY animation-name walk (PE 0x40ae05..0x40ae41,
     0 E8 / 0 stores — pure computation) is extended to run fully
     in-module: the host captures PER-ENTRY equal-flag bytes (strcmp of
     each 0x18-stride entry's SSO/heap name against the 'End' literal
     0xb1c00c) into the runtime blob, and the module derives the first
     match index + bit test via the frozen frame-opaque 40add0 laws
     (isaac_frame_opaque_40add0_probe_from_equal_flags) — the probe
     result (al) is fully in-module. equal_flags_ready==0 or a count over
     the cap keeps the exact v91/v94 host-resolved matchIndex path.
     Host leaves unchanged: field_4==0 fatal-log arm (R3, v94 typed
     event) and the true-probe interior (R2, needs records idx 12/4). */
  /* ABI v95 (record idx 6, 0x00746560 notify body): the string-BUILD
     decision laws. data_ptr = UNSIGNED cap>=0x10 ? heap : SSO buffer
     (PE 0x74660c/0x746617 cmp+cmovae for both widget args); found =
     _Mysize != 0 (PE 0x7465fb cmp/setne @0x746608, the widget's 4th arg
     stored Game+0x216ea @0x840b91); free_plan = the _Tidy_deallocate
     length/capacity gates (cap<0x10 SSO no-free; cap+1<0x1000 small free;
     delta=ptr-*(ptr-4)-4 > 0x1f -> operator delete — all UNSIGNED);
     walk_count = SIGNED trunc(span/28) via magic 0x92492493 sar 4
     (PE 0x7462e8..0x746304, the 0x746260 vector-count head); index_matches
     = acc & ~clear & (1<<(index&31)) != 0 (PE 0x746310..0x746344);
     gate_26584 = [Game+0x26584] == 0x2c FULL-DWORD (PE 0x7460c8 cmp/jne).
     The string content builders (0x7460b0/0x746260 host tails + 0x745ca0)
     and the intern/ANM2 widget 0x840b00 stay typed-host. */
  /* ABI v95 (record idx 21, 0x0082ee40 ANM2::Load frame laws): the
     load-path host-call DECISION laws land in-module — path_present
     (PE 0x40bd59 FULL-DWORD on the pre-call filename size), path_is_self
     (PE 0x40bd68 address equality), graphics_needed (PE 0x40bd8e LOW-BYTE
     on loadgraphics), frame_host_calls (4 + !is_self + path_present +
     graphics) and site_host_calls (fixed-point 6). The 6 observable stores
     S1..S6 (v77 lane) need NO body: S1/S2 UNCONDITIONAL, S3/S5/S6 pure
     name-scan, S4 heap '*' scan (starLayerMask; closure read census shows
     zero [*+0x8c] readers — no typed apply). Host callees
     0x40e2b0/0x40ccd0/0x40db90/0x40e110/0x40c000/0x408830x2 unchanged. */
  /* ABI v95 (record idx 44 PM3 arm laws): playerManagerUpdateHeartbeat PM3
     decision laws become slice exports — quiet-gate (PE 0x009bb774 movss
     0.01f / 0x009bb782 comiss / 0x009bb78c jb: quiet = ordered 0.01f >=
     maxVol, NaN -> LOUD), empty+not-playing pure-skip (PE 0x9bb6c3 test/je
     -> maxVol 0 -> quiet arm -> probe 0x92e560 -> 0x9bb795 je: whole arm
     host-free) and empty+playing host-STOP split (PE 0x9bb7a2 call
     0x92e230). The probe capture (@700) and the volume/pitch update stay
     typed-host (records 45/46). No events/runtime changes. */
  /* ABI v95 (record idx 43 playerManagerUpdateDeath arg-prep): the
     TriggerDeath CALL-ARG laws the death walk computes between the
     eligibility decision and the call (PE 0x009bb63c..0x009bb682) land as
     the composed event's arg-prep — receiver law (0x9bb643 cmp/jae OOB
     clamp to element 0 + 0x9bb647 lea begin+index*4, count2 =
     (end2-begin2)>>2 sar re-derived per iteration), flag law (0x9bb67d
     push 0 = checkOnly=false, ALWAYS 0, independent of index/eligibility)
     and the composition {receiver, flag, can_trigger=eligible}. The
     TriggerDeath call 0x007a1090 itself STAYS typed-host (SEH cascade;
     no per-player expansion — v69 pin kept). Typed event
     player_manager_update_death_arg_prep fires when the wire resolves WALK
     (ready packs + eligible) AND the frame's player-vector span is
     captured (frame_opaque_98dba0_walk_ready, v92 seam on the same
     Game+0x1baa8 vector). */
  /* ABI v95 (record idx 39 mid-restock): RNG::RandomInt zero-seed fatal is
     a TYPED-EVENT DROP (isaac_game_update_slice_mid_restock_seed_zero,
     FULL-DWORD seed==0, PE 0x007e9028 test edx,edx / 0x007e9033 call
     0xa112c0 'RNG Seed is zero!' / 0x007e9041 int3; typed event field
     `mid_restock_seed_zero_drop` lands at the coordinator's wave-end
     layout merge). HOST_FATAL no longer reruns the MONOLITHIC residual:
     zero game-memory stores precede the fatal, drop == pre-crash state. */
  /* ABI v95 (record idx 19 opaqueCall006fd7c0Mode4Sfx): the mode-4 SFX early
     arm's ARG/seed laws land as the composed typed-event arg-prep — seed
     selection 0xbb/0xd7 (PE 0x6fd825/0x6fd8e4), UNSIGNED %20 rare hit
     (0x95685b..0x95686c), the six-dword Play pack with the LOOP SLOT 0
     (PE 0x6fd84c push 0), receiver = base + 0x2a324 (0x6fd858 lea) — all
     consumed BY REFERENCE from the frame-effect v18 family laws and
     composed by isaac_game_update_slice_6fd7c0_mode4_sfx_arg_prep. The
     Play call 0x92dc30 stays TYPED-HOST: the typed event
     frame_effect_6fd7c0_mode4_sfx_play_typed fires +1 whenever the gate
     (already in-module) opens; the coarse opaque_call_006fd7c0_mode4_sfx
     counter STAYS (host edge still fires). No layout offsets touched —
     the coordinator v3 merge fixes the event offset (intended @628). */
  /* ABI v97 (wave-26 merge, PLAN update-v102-abi97-plan): the walker
     freeze-lift — 4 runtime input lanes @14276..14292
     (hud_stat_walker_player_a/b, b_frame328, probe1_arg) + 3 typed
     walker probe events @956..968 (hud_stat_walker_probe1/2/3);
     record-4 store-plan APPLICATION arm (148-B plan scratch + 3 exports);
     record-12 transition-pack lane-free laws (7 exports). */
  /* ABI v98 (wave-27 merge, PLAN update-v104-abi98-plan): the record-12
     transition-pack FREEZE-LIFT — 9 runtime lanes @14292..14328
     (transition_6fd7c0_game0/alt_path_probe/route_probe/
     player_loop_probe/room_type_8/room_subroom_flag_44/blue_room_probe/
     engine_pred_probe/ready) + 3 typed events @968..980
     (frame_effect_6fd7c0_stage_transition/player_loop/room_dispatch);
     the 6 capture-dependent laws (stage_transition_reach / anim0xc_route /
     player_loop_reach / room_dispatch_reach / engine_room_arg /
     terminal_265c0_clear) + the k-block live behind the two-voucher ready
     gate (transition_6fd7c0_ready @14324 AND opaque_call_006fd7c0_ready
     @13732 both nonzero; either 0 keeps the pre-v104 residual). */
  /* ABI v99 (wave-28 merge): the entity-surface capture REBIND (idx 5/32,
     update-v106-record5-32-entity-surface) — the v95 provisional rows
     @8040..8396 / @640 are REMOVED (they collided with the committed b3b7
     lanes / tcsStats region); the pack is rebound to the tail:
     frame_opaque_98dba0_entity_surface_ready @14328 (FULL-DWORD voucher) +
     8 x IsaacGameUpdateSliceEntitySurfaceCapture @14332..14684 (44 B
     pack(1): vtable_class_bits/impl_ptr/impl_b0/impl_8/impl_c/impl_20/
     impl_20_10/netman_2b4/global_c73680/global_c73694/global_c5ac00) +
     the accept-pure proof event
     frame_opaque_98dba0_entity_surface_accept_pure @980..984; the
     RTTI-block bl-fold law (isaac_game_update_slice_entity_surface_rtti_
     fold) + the walk_step accept-AL byte-gate correction land in-module. */
  ISAAC_GAME_UPDATE_SLICE_ABI_VERSION = 99,
  /* ABI v95 (record idx 15 opaqueRoomUpdatePrefixB3B7): capture caps. A
     host that sees more live entries than the cap MUST NOT set
     b3b7_sparse_ready (module falls back to the monolithic residual). */
  ISAAC_GAME_UPDATE_B3B7_TE_MAX_ENTRIES = 8,
  ISAAC_GAME_UPDATE_B3B7_B5_MAX_ENTITIES = 32,
  ISAAC_GAME_UPDATE_B3B7_B6_MAX_NODES = 32,
  ISAAC_GAME_UPDATE_B3B7_B7_MAX_SLOTS = 64,
  /* ABI v99 leaf peel (idx 15): FUN_00708250 player-count body
     (0x00708250..0x00708343). Nested 0x7db860 / 0x4288a0 stay
     address-stable host samples; the decision surface is in-module.
     Layouts frozen — exports-only. */
  ISAAC_GAME_UPDATE_B5_COUNT_708250_MAX_PLAYERS = 8,
  ISAAC_GAME_UPDATE_B5_COUNT_708250_SCAN_WANTED = 0x4f,
  ISAAC_GAME_UPDATE_B5_COUNT_708250_BUF_GATE = 0x8f,
  ISAAC_GAME_UPDATE_B5_COUNT_708250_HOST_VA = 0x00708250u,
  ISAAC_GAME_UPDATE_B5_COUNT_708250_HOST_VA_7DB860 = 0x007db860u,
  ISAAC_GAME_UPDATE_B5_COUNT_708250_HOST_VA_4288A0 = 0x004288a0u,
  ISAAC_GAME_UPDATE_B5_COUNT_708250_HOST_VA_FATAL = 0x00a112c0u,
  ISAAC_GAME_UPDATE_B5_COUNT_708250_FATAL_STRING = 0x00b7e6bcu,
  ISAAC_GAME_UPDATE_B5_COUNT_708250_FATAL_ARG = 0x10u,
  ISAAC_GAME_UPDATE_B5_COUNT_708250_GAME_GLOBAL = 0x00c71678u,
  ISAAC_GAME_UPDATE_B5_COUNT_708250_SCAN_LIST_OFF = 0x1bbd8u,
  ISAAC_GAME_UPDATE_B5_COUNT_708250_PLAYER_BEGIN_OFF = 0x1baa8u,
  ISAAC_GAME_UPDATE_B5_COUNT_708250_PLAYER_END_OFF = 0x1baacu,
  ISAAC_GAME_UPDATE_B5_COUNT_708250_PLAYER_FIELD_2C_OFF = 0x2cu,
  ISAAC_GAME_UPDATE_B5_COUNT_708250_PLAYER_FIELD_3BC_OFF = 0x3bcu,
  ISAAC_GAME_UPDATE_B5_COUNT_708250_PLAYER_BUF_OFF = 0x1fd4u,
  ISAAC_GAME_UPDATE_B5_COUNT_708250_PLAYER_BUF_END_OFF = 0x1fd8u,
  /* ABI v95 (record idx 14 opaqueRoomUpdatePrefixB2): pool/spawn caps. The
     pool-weight array is fixed at 31 x u16 (Game+0x1af30, ids 0..30, PE
     0x802ef7 loop `cmp esi,0x1f`). A host that sees more spawn elements
     than the cap MUST NOT set b2_pool_ready (module falls back to the
     monolithic residual — the spawn-loop bound [desc+0x10+0x44] is u16
     and unbounded, PE 0x80330f re-read per iteration). */
  ISAAC_GAME_UPDATE_B2_POOL_COUNT = 31,
  ISAAC_GAME_UPDATE_B2_SPAWN_MAX_ELEMS = 64,
  ISAAC_GAME_UPDATE_GAME_OBJECT_MIN_SIZE = 0x68d70,
  ISAAC_GAME_UPDATE_ANM2_MAX_LAYERS = 32,
  ISAAC_GAME_UPDATE_ANM2_MAX_EXTRAS = 32,
  ISAAC_GAME_UPDATE_ANM2_NAME_BYTES = 8,
  ISAAC_ENGINE_PLAYER_MAX = 8,
  /* ABI v96 (record idx 4 opaqueCall008318a0): per-player entry pack cap.
     Mirrors ISAAC_ENGINE_PLAYER_MAX. A host that sees more live span
     entries (end-begin)>>2 than the cap MUST NOT set
     opaque_8318a0_player_entry_ready (module falls back to the
     monolithic mode-1/2/4 residual). */
  ISAAC_GAME_UPDATE_8318A0_PLAYER_ENTRY_MAX = 8,
  ISAAC_PLAYER_HUD_MAX_SLOTS = 8,
  ISAAC_ROOM_B8_MAX_CELLS = 448,
  ISAAC_GENRAND_STATE_WORDS = 624,
  ISAAC_GENRAND_MAX_SAMPLES = 448,
  /* ABI v95 (record idx 34 B13 H5): per-loop typed CREATE-arm scratch cap.
     Matches the slice's defensive loop cap (PE loop_count is 1 or 5). */
  ISAAC_AMBIENT_824A70_MAX_LOOPS = 64,
  ISAAC_UPDATE_LIST_MAX_NODES = 32,
  ISAAC_GLOBAL_TREE_4ABA0_MAX_NODES = 32,
  ISAAC_OPAQUE_0092E300_MAX_GROUPS = 8,
  ISAAC_OPAQUE_0092E300_MAX_VOICES = 32,
  ISAAC_SOUND_GROUP_WALK_PLAN_WORDS = 10,
  ISAAC_MENU_AUX_TREE_MAX_NODES = 32,
  ISAAC_MENU_AUX_TREE_NODE_SIZE = 0x2c,
  ISAAC_MENU_AUX_SENTINEL_OUT_WORDS = 5,
  ISAAC_HUD_STAT_COUNTDOWN_COUNT = 20,
  ISAAC_HUD_STAT_WALK_MAX_PLAYERS = 8,
  ISAAC_HUD_STAT_WALK_SCRATCH_WORDS = 83,
  ISAAC_HUD_STAT_WALK_SLOT_COUNT = 20,
  ISAAC_HUD_STAT_WALK_K_COUNT = 10,
  /* The 40add0 walk capture cap: stride 0x18 entries of the animation-name
     list at [data+0x8c]/+0x90. A host that sees more than this many live
     entries must NOT set equal_flags_ready (the module falls back to the
     v91 host-resolved matchIndex path, keeping pre-v95 semantics). */
  ISAAC_FRAME_OPAQUE_40ADD0_MAX_ENTRIES = 64,
  ISAAC_FRAME_OPAQUE_4257B0_MAX_ELEMS = 16,
  ISAAC_FRAME_OPAQUE_4257B0_MAX_LIST = 16,
  ISAAC_FRAME_OPAQUE_4257B0_MAX_PLAYERS = 8,
  ISAAC_GAME_UPDATE_SHELL_REWIND_ARG = -1,
  ISAAC_GAME_UPDATE_SHELL_SITE_DIRECTION = -1,
  /* ABI v96 (record idx 46): the SFXManager::Play continuation RNG stream
     (0x00c5d2a0) defaults from .rdata 0x00b1f6c0 — (5, 27, 8), distinct
     from the 0x00c5d2b0 prep stream (2, 7, 7). */
  ISAAC_GAME_UPDATE_SFX_PLAY_RNG_SHIFT1 = 5,
  ISAAC_GAME_UPDATE_SFX_PLAY_RNG_SHIFT2 = 27,
  ISAAC_GAME_UPDATE_SFX_PLAY_RNG_SHIFT3 = 8,
  /* ABI v96 (record idx 12 opaqueCall006fd7c0): FUN_00705ee0 write-block
     decision constants. The slot records live at Game+0x269ec (slot0) and
     Game+0x4704c (slot1), stride 0x20660; slot1 ENDS at Game+0x676ac == the
     slot-index field. The write-block payload copy is 0x20b dwords (0x82c
     bytes) from *[0xc7169c]+0x2d0 into newslot+0x1fe34..+0x20660. The
     nine-site store mask (S1..S9 = bits 0..8): S2|S3|S5|S6|S7|S8|S9 are
     unconditional in the write block (0x1f6); S1 (bit 0) adds on the
     room/tag mismatch path; S4 (bit 3) adds on the match path. */
  ISAAC_GAME_UPDATE_705EE0_SLOT0_OFF = 0x269ec,
  ISAAC_GAME_UPDATE_705EE0_SLOT_STRIDE = 0x20660,
  ISAAC_GAME_UPDATE_705EE0_PAYLOAD_WORDS = 0x20b,
  ISAAC_GAME_UPDATE_705EE0_PAYLOAD_SRC_OFF = 0x2d0,
  ISAAC_GAME_UPDATE_705EE0_STORE_MASK_BASE = 0x1f6,
  ISAAC_GAME_UPDATE_705EE0_STORE_MASK_S1 = 0x1,
  ISAAC_GAME_UPDATE_705EE0_STORE_MASK_S4 = 0x8,
  ISAAC_GAME_UPDATE_705EE0_SAVESTATE_VA = 0x006f9000u,
  /* ABI v96 (record idx 10 R2, 0x004212c0): the true-probe interior PREFIX
     law (blob-gated pure arm, v92 98dba0-walk precedent; PE
     0x421343..0x4213cd, wait-gate 0x4213cd/0x4213d3). The nine manager
     stores ([0xc7169c]+0xf18 inc / +0x14=1 x2 / +0xebc inc / +0x21618=1 /
     +0x21620=0 / +0x21624=1 / +0x2161c=0x19 / +0x29fb8=1) are straight-line
     constants once the probe-true gate passes — mask 0x1ff (bits 0..8,
     S4 = the idempotent +0x14 repeat kept site-true). Volume gate = bit-
     exact equality vs 0x3f800000 (ucomiss/lahf/test ah,0x44/jnp @0x421390..
     0x42139b: skip 0x92e430 ONLY on ordered-equal; NaN falls through and
     resets — bit equality is exact for this compare). The 0x6fd7c0 edge
     args (-1,0,1,-1,-0xa) + [se+0x14]=0x3ba3d70a are unconditional within
     the prefix (after the gate join 0x4213ab). The manager blob (base/
     f18/ebc/volume_bits) has NO layout lanes — ABI-96 §lane-requests. */
  ISAAC_GAME_UPDATE_4212C0_TRUE_PROBE_STORE_MASK = 0x1ff,
  ISAAC_GAME_UPDATE_4212C0_TRUE_PROBE_STORE_COUNT = 9,
  ISAAC_GAME_UPDATE_4212C0_TRUE_PROBE_VOLUME_ONE_BITS = 0x3f800000u,
  ISAAC_GAME_UPDATE_4212C0_TRUE_PROBE_SE14_BITS = 0x3ba3d70au,
  ISAAC_GAME_UPDATE_4212C0_TRUE_PROBE_6FD7C0_ARG0 = 0xffffffffu,
  ISAAC_GAME_UPDATE_4212C0_TRUE_PROBE_6FD7C0_ARG1 = 0x0u,
  ISAAC_GAME_UPDATE_4212C0_TRUE_PROBE_6FD7C0_ARG2 = 0x1u,
  ISAAC_GAME_UPDATE_4212C0_TRUE_PROBE_6FD7C0_ARG3 = 0xffffffffu,
  ISAAC_GAME_UPDATE_4212C0_TRUE_PROBE_6FD7C0_ARG4 = 0xfffffff6u,
  ISAAC_GAME_UPDATE_RETURN_AFTER_GAME_UPDATE = 0,
  ISAAC_GAME_UPDATE_RETURN_AFTER_GATE_1D520 = 1,
  ISAAC_GAME_UPDATE_RETURN_AFTER_GATE_1D654 = 2,
  ISAAC_GAME_UPDATE_RETURN_AFTER_STATE_24ECC_UPDATE = 3,
  ISAAC_GAME_UPDATE_RETURN_AFTER_GENERIC_PROMPT_TRANSITION = 4,
  ISAAC_GAME_UPDATE_RETURN_AFTER_ITEM_OVERLAY_MENU = 5,
  ISAAC_GAME_UPDATE_RETURN_AFTER_HUD_DELAY = 6,
  ISAAC_GAME_UPDATE_RETURN_AFTER_GATE_1BA78 = 7,
  ISAAC_GAME_UPDATE_RETURN_AFTER_GATE_1B83C = 8,
  ISAAC_GAME_UPDATE_RETURN_AFTER_MENU_GATE_EXIT = 9,
  ISAAC_GAME_UPDATE_RETURN_AFTER_TIMED_TRANSITION_HUD = 10,
  ISAAC_GAME_UPDATE_CONTINUE_NEXT_GATE = 11,
  ISAAC_GAME_UPDATE_CONTINUE_AT_TIMED_TRANSITION = 12,
  ISAAC_GAME_UPDATE_CONTINUE_AFTER_TIMED_TRANSITION = 13,
  ISAAC_GAME_UPDATE_CONTINUE_AT_COMMON_TAIL = 14,
  ISAAC_GAME_UPDATE_RESUME_AFTER_GENERIC_PROMPT_UPDATE = 15,
  ISAAC_GAME_UPDATE_RESUME_AFTER_ITEM_OVERLAY_UPDATE = 16,
  ISAAC_GAME_UPDATE_RESUME_AFTER_MENU_OPEN = 17,
  ISAAC_GAME_UPDATE_RESUME_AFTER_MENU_UPDATE = 18,
  ISAAC_GAME_UPDATE_RESUME_AFTER_GATE_1B83C_UPDATES = 19,
  ISAAC_GAME_UPDATE_RESUME_AFTER_92F1C0 = 20,
  ISAAC_GAME_UPDATE_RESUME_AFTER_98DBA0_PLAYER_WALK = 21,
  ISAAC_GAME_UPDATE_RESUME_AFTER_FRAME_AUX_UPDATES = 22,
  ISAAC_GAME_UPDATE_RESUME_AFTER_STAGE_TRANSITION_EFFECT = 23,
  ISAAC_GAME_UPDATE_RESUME_AFTER_ENGINE_PREFIX = 24,
  ISAAC_GAME_UPDATE_RESUME_AFTER_ROOM_TRANSITION_EFFECT = 25,
  ISAAC_GAME_UPDATE_RESUME_AFTER_ROOM_UPDATE_PREFIX_B1 = 26,
  ISAAC_GAME_UPDATE_RESUME_AFTER_ROOM_UPDATE_PREFIX_B2 = 27,
  ISAAC_GAME_UPDATE_RESUME_AFTER_ROOM_UPDATE_PREFIX = 28,
  ISAAC_GAME_UPDATE_RESUME_AFTER_ROOM_CLEAR_NESTED = 29,
  ISAAC_GAME_UPDATE_RESUME_AFTER_ROOM_UPDATE_CLEAR = 30,
  ISAAC_GAME_UPDATE_RESUME_AFTER_ROOM_UPDATE_HEAD = 31,
  ISAAC_GAME_UPDATE_RESUME_AFTER_4257B0_PASS_A = 32,
  ISAAC_GAME_UPDATE_RESUME_AFTER_FRAME_MANAGER_UPDATES = 33,
  ISAAC_TRANSITION_DISPATCH_NONE = 0,
  ISAAC_TRANSITION_DISPATCH_QUEUE_SCREEN = 1,
  ISAAC_TRANSITION_DISPATCH_RESTART_FLOW = 2,
  ISAAC_TRANSITION_DISPATCH_NEXT_VICTORY_LAP = 3,
  ISAAC_TRANSITION_DISPATCH_OPAQUE_MODE = 4,
  ISAAC_TRANSITION_DISPATCH_NO_OP = 5,
  ISAAC_TRANSITION_DISPATCH_UNKNOWN = 6,
  ISAAC_HOST_FUN_746560_SITE_NONE = 0,
  ISAAC_HOST_FUN_746560_SITE_TIMED_CLEANUP = 1,
  ISAAC_HOST_FUN_746560_SITE_WALK_COUNTER = 2,
  ISAAC_FRAME_OPAQUE_98DBA0_SITE_GATE_1B83C = 0,
  ISAAC_FRAME_OPAQUE_98DBA0_SITE_FRAME_AUX = 1,
  /* ABI v95: FUN_00956110 fall-through path choice (PE 0x95615d/0x956161). */
  ISAAC_GAME_UPDATE_956110_PATH_ID_NEG1_WALK = 0,
  ISAAC_GAME_UPDATE_956110_PATH_GENERAL = 1,
  ISAAC_GAME_UPDATE_956110_PATH_NET_EARLY = 2,
  ISAAC_GAME_UPDATE_956110_MAX_VTABLE = 8,
  ISAAC_GAME_UPDATE_956110_NET_ARG2_IMM = 0,
  ISAAC_GAME_UPDATE_956110_OUT_BUF_OFF = 0xb,
  ISAAC_GAME_UPDATE_956110_WALK_VTBL_OFF = 0x30,
  ISAAC_GAME_UPDATE_956110_GENERAL_VTBL_OFF = 0x74,
  ISAAC_GAME_UPDATE_956110_GENERAL_CALLBACK_VA = 0x00a20940,
  ISAAC_GAME_UPDATE_956110_GENERAL_CONTAINER_VA = 0x00c57b18,
  ISAAC_GAME_UPDATE_956110_MANAGER_MODE_OFF = 8,
  ISAAC_GAME_UPDATE_956110_MANAGER_MP_VEC_OFF = 0x4b3d8,
  /* ABI v95 (record idx 35 B15 rain spawn loop): spawn_count =
     min(quality {4,6,8}, (end-begin)/0x78) <= 4..8; the slot/search
     capture lanes and the in-module walk cap at this value. */
  ISAAC_GAME_UPDATE_B15_RAIN_LOOP_MAX_STEPS = 8,
  /* ABI v95 (record idx 42 opaqueRoomUpdateTailPath): trail-list capture
     cap. The B20 pass1/pass2 loop (PE 0x0080608e..0x00806884) iterates
     (end-begin)>>2 trail entities; a host that sees more live entities
     than this must NOT set tail_path_ready (pre-v95 monolith stays). */
  ISAAC_GAME_UPDATE_TAIL_PATH_MAX_NODES = 32,
  /* ABI v95 (record idx 47 playerManagerUpdateHeartbeatSfxStop): the STOP
     fold of 0x0092e230. Per-voice capture cap = the SFX-family voice cap
     (32, same as ISAAC_OPAQUE_0092E300_MAX_VOICES; the PE entry's [entry+
     0x190] count is RE-READ per iteration and the captured array is the
     model's own bound). Plan words: applied, sentinel_written,
     voices_visited, probe_calls, stop_calls, stores. */
  ISAAC_SFX_STOP_FOLD_MAX_VOICES = 32,
  ISAAC_SFX_STOP_FOLD_PLAN_WORDS = 6,
  /* ABI v95 (record idx 33): type-5 door loop frame laws (PE 0x8042be..0x8042f3).
     The loop bound is the constant 8 re-read per iteration (mov eax,8 +
     counter store/reload — not folded once), == the Room door-slot array
     ISAAC_ROOM_DOOR_SLOT_COUNT (cross-pinned in the cpp). The open call
     target is FUN_00710dd0 (thiscall door ptr, 0 stack args). */
  ISAAC_GAME_UPDATE_TYPE5_DOOR_SLOT_COUNT = 8,
  ISAAC_GAME_UPDATE_TYPE5_DOOR_OPEN_HOST_VA = 0x00710dd0u,
  /* ABI v95 (record idx 41 opaqueRoomUpdateTailEntity, B18 entity walk
     0x00805527..0x008055a7): per-entity capture cap. The PE walks
     Room+0x125c vec[0..count) with count RE-READ from Room+0x1264 EVERY
     iteration (0x805598 cmp esi,[edi+0x1264] / jb 0x805540); the frozen
     pack the in-module walk frame runs on caps here (host must NOT set
     b18_entity_ready when the live count exceeds it; fallback = the
     pre-v95 monolithic coarse edge). The three entity update calls stay
     TYPED-HOST: type-5 body 0x6e17c0, __RTDynamicCast 0xaf08b1, path-B
     body 0x6da530. RTTI args: (ent, 0, 0xc5d5dc src, 0xc5d6ac dst, 0),
     PE 0x805575..0x805584 (push 0; push 0xc5d6ac; push 0xc5d5dc; push
     0; push ecx). */
  ISAAC_GAME_UPDATE_SHOP_RESTOCK_MAX = 32,
  ISAAC_GAME_UPDATE_B18_ENTITY_MAX = 64,
  ISAAC_GAME_UPDATE_B18_ACTION_SKIP = 0,
  ISAAC_GAME_UPDATE_B18_ACTION_TYPE5 = 1,
  ISAAC_GAME_UPDATE_B18_ACTION_RTTI_CANDIDATE = 2,
  ISAAC_GAME_UPDATE_B18_RTTI_SRC_PTR = 0x00c5d5dcu,
  ISAAC_GAME_UPDATE_B18_RTTI_DST_PTR = 0x00c5d6acu,
  ISAAC_GAME_UPDATE_B18_HOST_VA_TYPE5 = 0x006e17c0u,
  ISAAC_GAME_UPDATE_B18_HOST_VA_RTTI = 0x00af08b1u,
  ISAAC_GAME_UPDATE_B18_HOST_VA_PATH_B = 0x006da530u,
  /* ABI v95 (record idx 25 roomTriggerClearStats): the stats residual of
     Room::TriggerClear -> FUN_009e5960 (this = Game+0x266e4). Element
     stride 0xc; count law (0x9e6740) = 2 for arg in [8..12] else 1;
     growth (0x69ee50) new_cap = max(cap+1, cap + cap>>1), alloc bytes =
     12*new_cap, length_error at 0x15555555 elements; vector object at
     Game+0x266e4+0x5c {begin@0x5c, end@0x60, cap@0x64}. */
  ISAAC_GAME_UPDATE_TCS_STATS_STRIDE = 12,
  ISAAC_GAME_UPDATE_TCS_STATS_MAX_CAP = 0x15555555,
  ISAAC_GAME_UPDATE_TCS_STATS_VEC_OFF = 0x5c,
  ISAAC_GAME_UPDATE_TCS_STATS_END_OFF = 0x60,
  ISAAC_GAME_UPDATE_TCS_STATS_CAP_OFF = 0x64,
  ISAAC_GAME_UPDATE_TCS_STATS_TAIL_TYPE = 0xb,
  ISAAC_GAME_UPDATE_TCS_STATS_FLOAT_MINUS18_BITS = 0xc1900000 /* -18.0f */,
  /* ABI v95 (record idx 22 opaqueRoomTransitionEngineBody): pre-call
     decision surface of the engine player-loop body (PE 0x0082f049..
     0x0082f089). Offsets are the RTE-family entry-blob contract, mirrored
     here BY NAME so the coordinator can wire the capture lanes without a
     layout edit; the 0x82eb90 predicate law itself is consumed BY
     REFERENCE from room_transition_engine_pure_helpers.h
     (isaac_room_transition_engine_82eb90_predicate) and never restated. */
  ISAAC_GAME_UPDATE_ENGINE_ENTRY_2C_OFF = 0x2c,    /* u32 eligible gate  (PE 0x82f049) */
  ISAAC_GAME_UPDATE_ENGINE_ENTRY_173_OFF = 0x173,  /* u8  7abcc0 gate   (PE 0x82f05a) */
  ISAAC_GAME_UPDATE_ENGINE_ENTRY_F360_OFF = 0x360, /* f32 reset store   (PE 0x82f09a) */
  ISAAC_GAME_UPDATE_ENGINE_ENTRY_F364_OFF = 0x364, /* f32 reset store   (PE 0x82f0aa) */
  ISAAC_GAME_UPDATE_ENGINE_ENTRY_F410_OFF = 0x410, /* u8  reset store   (PE 0x82f0b2) */
  ISAAC_GAME_UPDATE_ENGINE_ANIM_ARG_VA = 0x0082f063u,  /* cmp [ebx+0x10],0xb / setne */
  ISAAC_GAME_UPDATE_ENGINE_173_GATE_VA = 0x0082f05au,
  ISAAC_GAME_UPDATE_ENGINE_14_GATE_VA = 0x0082f077u,
  ISAAC_GAME_UPDATE_ENGINE_7ABCC0_CALL_VA = 0x0082f070u,
  ISAAC_GAME_UPDATE_ENGINE_7ABE20_CALL_VA = 0x0082f084u,
  ISAAC_GAME_UPDATE_ENGINE_GAME_REREAD_VA = 0x0082f089u,
  ISAAC_GAME_UPDATE_ENGINE_7ABE20_PARAM_VA = 0x00b6ce1cu, /* pushed name-string arg */
  ISAAC_GAME_UPDATE_ENGINE_ENTRY_CALL_PLAN_WORDS = 4
};

typedef struct IsaacGameUpdateDoorSlotRuntime {
  uint32_t present;
  uint32_t field_3a0;
  uint32_t field_8;
  uint32_t field_c;
} IsaacGameUpdateDoorSlotRuntime;

/* ABI v95 (record idx 33): per-door typed open-call entry of the type-5
   door loop (PE 0x008042d0..0x008042dc). slot_index = Room+0x724[i] slot
   (stride 4 pointer array) so the host consumer re-resolves the door at
   host time; the fields echo the captured runtime slot for differential
   verification. Entries are in machine slot order (0..7). */
#pragma pack(push, 1)
typedef struct IsaacGameUpdateSliceType5DoorOpenEntry {
  uint32_t slot_index;
  uint32_t present;
  uint32_t field_3a0;
  int32_t field_8;
  int32_t field_c; /* == 5 (type-5) when qualifying */
} IsaacGameUpdateSliceType5DoorOpenEntry;
#pragma pack(pop)
static_assert(sizeof(IsaacGameUpdateSliceType5DoorOpenEntry) == 20,
              "type5 door open entry ABI changed");

typedef struct IsaacGameUpdateSliceType5DoorOpenPlan {
  uint32_t count; /* <= ISAAC_GAME_UPDATE_TYPE5_DOOR_SLOT_COUNT (8) */
  IsaacGameUpdateSliceType5DoorOpenEntry doors[ISAAC_GAME_UPDATE_TYPE5_DOOR_SLOT_COUNT];
} IsaacGameUpdateSliceType5DoorOpenPlan;
static_assert(sizeof(IsaacGameUpdateSliceType5DoorOpenPlan) ==
                  4 + ISAAC_GAME_UPDATE_TYPE5_DOOR_SLOT_COUNT * 20,
              "type5 door open plan ABI changed");

typedef struct IsaacPlayerHudSlotPack {
  uint32_t twin_ptr;
  int32_t player_type;
  int32_t field_3bc;
  int32_t hearts_sum;
  uint32_t flag_1519;
  int32_t tramp_suppress;
  int32_t active0;
  int32_t active1;
  int32_t active2;
  int32_t active3;
  float float_6b8;
  int32_t tail_pred;
  uint32_t tail_chars;
} IsaacPlayerHudSlotPack;

typedef struct IsaacGlobalTree4aba0Node {
  uint32_t addr;
  uint32_t next;
  uint32_t prev;
  uint32_t child;
  uint32_t f0d;
  uint32_t f18;
} IsaacGlobalTree4aba0Node;

typedef struct IsaacGameUpdateSliceHudStatSlotState {
  float current;
  float prev;
  float threshold;
  int32_t timer;
} IsaacGameUpdateSliceHudStatSlotState;

typedef struct IsaacGameUpdateSliceHudStatPlayerPack {
  uint32_t ptr;
  uint32_t predA;
  uint32_t f2c;
  uint32_t f3bc;
  uint32_t f13c0;
  uint32_t f172;
  uint32_t otherPtr;
  uint32_t other161c;
  uint32_t f161c;
  uint32_t f328;
  uint32_t f1568;
  uint32_t f1460;
  uint32_t f1470;
  uint32_t f1480;
  uint32_t f1464;
  uint32_t f156c;
} IsaacGameUpdateSliceHudStatPlayerPack;

typedef struct IsaacGameUpdateSliceOpaque0092e300VoicePack {
  uint32_t channel_null;
  uint32_t pending_09;
  uint32_t probe_first;
  uint32_t probe_second;
  uint32_t channel_null_third;
  uint32_t loop_08;
  uint32_t query_44;
  uint32_t channel_null_fourth;
  uint32_t voices_reloaded;
} IsaacGameUpdateSliceOpaque0092e300VoicePack;


typedef struct IsaacGameUpdateSliceSoundGroupWalkPlan {
  int32_t groups_visited;
  int32_t groups_disabled;
  int32_t groups_empty;
  int32_t groups_walked;
  int32_t voices_visited;
  int32_t probe_calls;
  int32_t query_calls;
  int32_t stop_calls;
  int32_t stores;
  int32_t applied;
} IsaacGameUpdateSliceSoundGroupWalkPlan;

/* ABI v95 (record idx 47 STOP fold of 0x0092e230): one voice's captured
   host observations in PE order. SIX fields — deliberately NOT the
   sibling 0x92e300's nine: the STOP body has no vtbl[0x44] query stage,
   no +0x08 loop-byte fallback (divergence #3, pinned) and no third/
   fourth channel reads beyond the reload. */
typedef struct IsaacGameUpdateSliceSfxStopVoicePack {
  uint32_t channel_null;          /* [voice+0x20] == 0, 1st read  0x0092e2a7 */
  uint32_t pending_09;            /* [voice+0x29] pending byte    0x0092e2ae */
  uint32_t probe_first;           /* AL of vtbl[0x38]             0x0092e2b8 */
  uint32_t probe_second;          /* AL of vtbl[0x38]             0x0092e2c9 */
  uint32_t channel_null_reload;   /* [voice+0x20] reload          0x0092e2d3 */
  uint32_t voices_reloaded;       /* [entry+0x190] re-read        0x0092e2e6 */
} IsaacGameUpdateSliceSfxStopVoicePack;

/* Plan of the in-module STOP fold (scratch + step events). 6 words. */
typedef struct IsaacGameUpdateSliceSfxStopFoldPlan {
  int32_t applied;          /* 1 when the fold ran in-module */
  int32_t sentinel_written; /* 1 when [entry+4] = -1 executed (gate LIVE) */
  int32_t voices_visited;
  int32_t probe_calls;      /* device vtbl[0x38], captured by reference */
  int32_t stop_calls;       /* device vtbl[0x3c] -> typed host event */
  int32_t stores;           /* sentinel + early/late pending clears */
} IsaacGameUpdateSliceSfxStopFoldPlan;

/* ABI v95 (record idx 34 B13 H5 FUN_00824a70 per-loop CREATE arm):
   typed argument plan for the entity-create host call at PE 0x00824cbd
   (call 0x6fe410). PE-immediates: type 0x3e8 (push 0x3e8 @0x824cb8),
   variant 0x8a (push 0x8a @0x824cb3), a1_arg 1 (push 1 @0x824ce7),
   anm_data_ptr 0xb1bc54 (push 0xb1bc54 @0x824cc2). layer_index 0 is the
   ANM2::GetLayer(0) argument (push 0 @0x824e55). seed is the per-loop R3
   genrand dword. game_ptr_global is [0xc71678] (g_Game). Flat order
   matches the per-loop scratch: 7 x u32 = 28 bytes, seed @20,
   game_ptr_global @24. */
typedef struct IsaacGameUpdateSliceAmbient824a70CreateArgs {
  uint32_t effect_type;
  uint32_t effect_variant;
  uint32_t layer_index;
  uint32_t anm_data_ptr;
  uint32_t a1_arg;
  uint32_t seed;
  uint32_t game_ptr_global;
} IsaacGameUpdateSliceAmbient824a70CreateArgs;

/* ABI v95 (record idx 43): composed TriggerDeath call-arg prep record.
   receiver = the walk cursor element pointer (PE 0x9bb643 cmp/jae OOB
   clamp + 0x9bb647 lea: begin + index*4 when u32 index < u32 count2,
   else begin — element 0 dereferenced); flag = ALWAYS 0 (PE 0x9bb67d
   push 0, checkOnly=false); can_trigger = the eligibility decision
   (PM family law by reference). The TriggerDeath call 0x007a1090 stays
   typed-host. */
typedef struct IsaacGameUpdateSliceDeathCallArgPrep {
  uint32_t receiver;
  uint32_t flag;
  int32_t can_trigger;
} IsaacGameUpdateSliceDeathCallArgPrep;

/* ABI v95 (record idx 22 opaqueRoomTransitionEngineBody): the per-entry
   PRE-CALL decision of the record-22 player-loop body (FUN_0082ee40,
   PE 0x0082f049..0x0082f084). The module decides WHICH per-entry host call
   the machine fires (0x7abcc0 / 0x7abe20) + the 0x7abcc0 argument; the
   bodies themselves (incl. 0x407f10 ANM2::Reset, 0x40a1b0 Rewind, the
   unconditional stores [entry+0x139a]/[entry+0x14c]/[entry+0x1398], the
   Sprite::Play 0x40a5d0 and the 0x956780/0x92dc30 SFX leg of 0x7abcc0)
   STAY TYPED-HOST — the player-entry objects are outside the capture ABI. */
typedef struct IsaacGameUpdateSlice82ee40BodyEntryPlan {
  int32_t call_7abcc0;   /* pred && byte173==0 (PE 0x82f056/0x82f05a) */
  int32_t arg_7abcc0;    /* (anim != 0xb) ? 1 : 0 (PE 0x82f063 full-word) */
  int32_t call_7abe20;   /* !(pred && byte173==0) && field_1c==0x14 */
  int32_t any_host;      /* call_7abcc0 || call_7abe20 */
  int32_t game_reread;   /* 1 on host-call paths (PE 0x82f089) */
} IsaacGameUpdateSlice82ee40BodyEntryPlan;

/* ABI v95 (record idx 19): composed mode-4 SFX typed-event arg-prep. The
   update slice's frame-effect 6fd7c0 mode-4 arm (PE 0x006fd81c gate, FULL
   dword) fires SFXManager::Play 0x92dc30 with the argument plan pinned by
   the frame-effect v18 family laws consumed BY REFERENCE: seed = the mode-4
   seed selection (0xbb mode-4 / 0xd7 anim-0xc special, PE 0x6fd825 / 0x6fd8e4)
   unless an open 0x956780 remap maps it (0x25 common / 0x12d rare when the
   second RNG quad % 20 == 0, PE 0x956806 / 0x95686e); args = the six-dword
   pack {id, 1.0f, 2, 0, 1.0f, 0} — LOOP SLOT 0 pinned (PE 0x6fd84c push 0);
   receiver = [0xc7169c] base + 0x2a324 (PE 0x6fd858 lea); play_va =
   0x92dc30 (TYPED HOST LEAF). All scalar params uint32_t/int32_t — no
   uint8_t scalar param (Wasm ABI does not narrow i32). */
typedef struct IsaacGameUpdateSlice6fd7c0Mode4SfxArgPrep {
  uint32_t seed;        /* 0xbb (mode-4) or 0xd7 (special) */
  int32_t rare_hit;     /* (mixed_counter % 20) == 0, UNSIGNED */
  int32_t id;           /* effective Play id (closed gate keeps seed) */
  uint32_t args[6];     /* {id, 0x3f800000, 2, 0, 0x3f800000, 0} */
  uint32_t receiver;    /* base + 0x2a324, 32-bit wrap */
  uint32_t play_va;     /* 0x0092dc30 */
} IsaacGameUpdateSlice6fd7c0Mode4SfxArgPrep;

/* ABI v95: FUN_00956110 arg-prep constants (PE 0x95612f..0x956136 net path;
   0x956174 walk path; 0x9561ac..0x9561c7 general path). */
#pragma pack(push, 1)
typedef struct IsaacGameUpdateSlice956110ArgPrep {
  uint32_t net_arg1_kind;        /* 0 = passthrough (caller arg3 = player) */
  uint32_t net_arg2_imm;         /* 0 (PE 0x956134 push 0) */
  uint32_t net_arg3_kind;        /* 0 = passthrough (caller arg1 = 0xd) */
  uint32_t net_out_buf_off;      /* 0xb (PE 0x95612f lea eax,[ebp+0xb]) */
  uint32_t walk_vtbl_off;        /* 0x30 (PE 0x956177 mov eax,[eax+0x30]) */
  uint32_t walk_stack_arg1;      /* 1 (PE 0x956174 push ebx before the call) */
  uint32_t general_container_va; /* 0xc57b18 (PE 0x9561ac) */
  uint32_t general_vtbl_off;     /* 0x74 (PE 0x9561b9) */
  uint32_t general_callback_va;  /* 0xa20940 (PE 0x9561c1) */
  uint32_t general_arg1_imm;     /* 0xd (PE 0x9561c7 mov [ebp+8],ebx) */
  uint32_t general_push_count;   /* 5 (pushes edx,0xa20940,&arg1,0,0) */
  uint32_t general_zero_args;    /* 2 (the two push 0) */
} IsaacGameUpdateSlice956110ArgPrep;
#pragma pack(pop)

/* ABI v95: composed FUN_00956110 decision plan (PE 0x956110..0x9561d2). */
#pragma pack(push, 1)
typedef struct IsaacGameUpdateSlice956110Result {
  int32_t value;                 /* predicted low-byte result (0/1) */
  uint32_t path;                 /* NET_EARLY / ID_NEG1_WALK / GENERAL */
  uint32_t pure;                 /* 1 = value purely determined (net-early or
                                    walk fold with complete capture) */
  uint32_t host_864c30;          /* 1 = platform IO tail 0x864c30 is the host
                                    leaf on this arm (gate open) */
  uint32_t host_vtable_walk;     /* 1 = walk-path virtual [[entry]+0x30]
                                    dispatch is a host leaf */
  uint32_t host_general;         /* 1 = general callback 0xa20940 dispatch is
                                    a host leaf */
  uint32_t pure_cf_ok;           /* 1 = decision CF fully transcribed */
} IsaacGameUpdateSlice956110Result;
#pragma pack(pop)

/* ABI v95 (record idx 5/32, 0x0098dba0): the ENTITY-SURFACE capture
   contract for VIRTUAL [[player+0x370]+0x14] (walk sites 0x98dca2 /
   0x98dd1d). Census: the matched [Manager+0x4b3d8 mp entry]+0x370 is an
   EMBEDDED subobject whose vptr is stored AT entry+0x370 and is one of
   EXACTLY two .rdata vtables written by the entry constructor
   (0x009015f0/0x00901603/0x009018c5/0x00901979): 0xb82d98 (RTTI
   DataUpdate_t) or 0xb82e20 (Network::KAGE::MultiplayerManager::
   LobbyDataUpdate_t). vtable slot[0x14] = 0xa5f260 (DataUpdate_t::accept)
   / 0xa23970 (LobbyDataUpdate_t::accept) — both PURE predicates over
   [this+4] (the impl ptr): byte0 frame-state flag (mov al,[impl]; and
   al,1 = LOW-BYTE), id words [impl+8]/[impl+0xc] (0xfefefefe FULL-DWORD
   sentinel gate, 0xaf0750 shift helper at cl=0x20 degenerates to
   eax=[impl+0xc],edx=0), layer-data node [impl+0x20] -> [+0x10] vs
   [0xc5ac00] FULL-DWORD, and (DataUpdate_t only) the netman lookup
   0xa5f090: ([0xc73680]!=0 && [0xc73694]==0x60001) ? [[0xc7999c]+0x2b4]
   : 0, compared == to [impl+8]. The virtual dispatch STAYS TYPED-HOST
   (host captures the real AL to verify); this blob captures the surface
   so the pure decision shell can predict the accept. */
enum {
  ISAAC_GAME_UPDATE_ENTITY_SURFACE_CLASS_DATA_UPDATE_T = 0,
  ISAAC_GAME_UPDATE_ENTITY_SURFACE_CLASS_LOBBY_DATA_UPDATE_T = 1,
  ISAAC_GAME_UPDATE_ENTITY_SURFACE_CLASS_UNKNOWN = 2,
  ISAAC_GAME_UPDATE_ENTITY_SURFACE_VTABLE_DATA_UPDATE_T = 0x00b82d98u,
  ISAAC_GAME_UPDATE_ENTITY_SURFACE_VTABLE_LOBBY_DATA_UPDATE_T = 0x00b82e20u,
  ISAAC_GAME_UPDATE_ENTITY_SURFACE_IMPL_PTR_OFF = 0x4,
  ISAAC_GAME_UPDATE_ENTITY_SURFACE_IMPL_B0_OFF = 0x0,
  ISAAC_GAME_UPDATE_ENTITY_SURFACE_IMPL_8_OFF = 0x8,
  ISAAC_GAME_UPDATE_ENTITY_SURFACE_IMPL_C_OFF = 0xc,
  ISAAC_GAME_UPDATE_ENTITY_SURFACE_IMPL_20_OFF = 0x20,
  ISAAC_GAME_UPDATE_ENTITY_SURFACE_IMPL_20_10_OFF = 0x30,
  ISAAC_GAME_UPDATE_ENTITY_SURFACE_IMPL_C_SENTINEL = 0xfefefefe,
  ISAAC_GAME_UPDATE_ENTITY_SURFACE_NETMODE_ACTIVE = 0x60001,
  ISAAC_GAME_UPDATE_ENTITY_SURFACE_NETMAN_GLOBAL = 0x00c7999c,
  ISAAC_GAME_UPDATE_ENTITY_SURFACE_NETMAN_2B4_OFF = 0x2b4,
  ISAAC_GAME_UPDATE_ENTITY_SURFACE_GLOBAL_C73680 = 0x00c73680,
  ISAAC_GAME_UPDATE_ENTITY_SURFACE_GLOBAL_C73694 = 0x00c73694,
  ISAAC_GAME_UPDATE_ENTITY_SURFACE_GLOBAL_C5AC00 = 0x00c5ac00,
  ISAAC_GAME_UPDATE_ENTITY_SURFACE_MAX_CAPTURES = 8,
};

/* The per-matched-entry capture blob (vtable class-bits + frame/animation
   fields the accept virtual reads; see the census comment above). */
#pragma pack(push, 1)
typedef struct IsaacGameUpdateSliceEntitySurfaceCapture {
  uint32_t vtable_class_bits; /* 0 DataUpdate_t / 1 LobbyDataUpdate_t / 2 unknown */
  uint32_t impl_ptr;          /* [entry+0x374]; 0 -> accept 0 */
  uint32_t impl_b0;           /* byte[impl+0] frame-state flag (low byte) */
  uint32_t impl_8;            /* [impl+8] id word A (data-law compare) */
  uint32_t impl_c;            /* [impl+0xc] id word B / 0xfefefefe gate */
  uint32_t impl_20;           /* [impl+0x20] layer-data node ptr */
  uint32_t impl_20_10;        /* [impl+0x20+0x10] layer-data node tag */
  uint32_t netman_2b4;        /* [[0xc7999c]+0x2b4] netman slot */
  uint32_t global_c73680;     /* netman init flag (0xa5f090 gate) */
  uint32_t global_c73694;     /* netman mode, 0x60001 (0xa5f090 gate) */
  uint32_t global_c5ac00;     /* layer-tag sentinel global */
} IsaacGameUpdateSliceEntitySurfaceCapture;
#pragma pack(pop)

/* The composed accept plan: predicted AL + typed-host contract. */
#pragma pack(push, 1)
typedef struct IsaacGameUpdateSliceEntitySurfacePlan {
  int32_t accept;      /* predicted virtual AL (0/1); -1 = not determinable */
  uint32_t class_bits; /* echo of the capture's class bits */
  uint32_t pure;       /* 1 = accept fully determined from the blob */
  uint32_t typed_host; /* 1 = [[entry+0x370]+0x14] dispatch is typed-host */
  uint32_t host_verify;/* 1 = host captures the real AL to verify */
} IsaacGameUpdateSliceEntitySurfacePlan;
#pragma pack(pop)

/* One player iteration of the walk's accept-driven state machine. */
#pragma pack(push, 1)
typedef struct IsaacGameUpdateSliceEntitySurfaceWalkStep {
  int32_t bl_after1;   /* phase-1 sticky bvar2 result (probe1 low-byte fold) */
  uint32_t probe1_ran; /* 1 = site-1 FUN_00956110 call runs */
  uint32_t rtti_enter; /* 1 = the 0x98dd27 RTTI block runs (accept2 gate) */
} IsaacGameUpdateSliceEntitySurfaceWalkStep;
#pragma pack(pop)

typedef struct IsaacGameUpdateSliceConstants {
  float decay_factor;
  float decay_threshold;
  float fade_complete;
  float fade_in_step;
  float fade_out_step;
  uint32_t reset_position_x_bits;
  uint32_t reset_position_y_bits;
  float transition_complete;
} IsaacGameUpdateSliceConstants;

typedef struct IsaacGameUpdateSliceEvents {
  uint32_t transition_completed;
  uint32_t transition_mode;
  uint32_t hud_post_update_calls;
  int32_t dispatch_kind;
  int32_t queued_screen_id;
  uint32_t fade_argb;
  uint32_t payload_copy_required;
  uint32_t clear_transition_gate;
  uint32_t early_return_after_hud;
  int32_t continuation_kind;
  uint32_t opaque_call_0092e300;
  uint32_t opaque_global_4aba0_refresh;
  uint32_t opaque_call_009b6840;
  uint32_t opaque_call_00857450;
  uint32_t opaque_call_0092f1c0;
  uint32_t opaque_call_008318a0;
  uint32_t opaque_call_0098dba0_player_walk;
  uint32_t generic_prompt_update_calls;
  uint32_t item_overlay_update_calls;
  uint32_t opaque_call_00746560;
  uint32_t opaque_call_009bea10;
  uint32_t opaque_call_0040c7f0;
  uint32_t opaque_call_009b7680;
  uint32_t menu_aux_list_clear;
  uint32_t opaque_call_008ef990;
  uint32_t opaque_call_004212c0;
  uint32_t opaque_call_006fdc10;
  uint32_t opaque_call_006fd7c0_mode4_sfx;
  /* ABI v129 (update-v129-record20-shell-removal): record idx 20 REMOVED.
     Under the FULL-CAPTURE voucher cap_live = frame_effect_shell_ready
     @3172 && opaque_call_006fd7c0_ready @13732 every arm of the coarse
     edge is a proven pure skip (needs==0 && blue==0), the v73 Update-no-op
     (needs==0 && blue==1: 0x74d4a0, site direction -1), or TYPED-carried
     (needs==1: rewind_705ee0_stores/save_state when plan.reached;
     own-frame-only exit otherwise). The counter STAYS frozen here and
     never fires under capLive; capture absence keeps the pre-v72
     monolith byte-for-byte. */
  uint32_t opaque_frame_effect_6fd7c0_shell;
  uint32_t opaque_room_transition_engine_prefix;
  uint32_t opaque_room_transition_engine_body;
  uint32_t room_transition_index;
  uint32_t room_transition_dimension;
  uint32_t engine_site_anim;
  uint32_t opaque_room_update_prefix_b1;
  uint32_t opaque_room_update_prefix_b2;
  uint32_t opaque_room_update_prefix_b3_b7;
  uint32_t opaque_room_update_prefix_b8;
  uint32_t opaque_room_update_prefix_b9_b11;
  uint32_t room_trigger_output;
  uint32_t opaque_room_update_clear_path;
  uint32_t opaque_room_update_clear_door_slots;
  uint32_t room_trigger_clear_stats;
  uint32_t room_trigger_clear_audio_non_greed;
  uint32_t room_trigger_clear_audio;
  uint32_t room_trigger_clear_awards_non_greed;
  uint32_t room_trigger_clear_awards_bit7;
  uint32_t room_trigger_clear_awards_greed;
  uint32_t room_trigger_clear_awards_tail;
  uint32_t opaque_room_update_clear_doors;
  uint32_t opaque_room_update_ambient;
  uint32_t opaque_room_update_tail_rain;
  uint32_t opaque_room_update_tail_water_b16;
  uint32_t opaque_room_update_tail_mid;
  uint32_t opaque_room_update_tail_mid_706c_expire;
  uint32_t opaque_room_update_tail_mid_restock;
  uint32_t opaque_room_update_tail_mid_7230_spawn;
  uint32_t opaque_room_update_tail_entity;
  uint32_t opaque_room_update_tail_path;
  uint32_t player_manager_update_death;
  uint32_t player_manager_update_heartbeat;
  uint32_t opaque_call_004257b0_pass_a;
  uint32_t opaque_call_004257b0_pass_b;
  uint32_t opaque_call_008607a0;
  uint32_t list_update_6772c;
  uint32_t opaque_call_0098dba0_timer;
  uint32_t hud_message_text_out;
  uint32_t frame_opaque_98dba0_site;
  uint32_t opaque_room_update_ambient_8024f0;
  uint32_t opaque_room_update_ambient_7f01c0;
  uint32_t opaque_room_update_ambient_stage_spawn;
  uint32_t opaque_room_update_ambient_mode_sfx;
  uint32_t opaque_room_update_ambient_824800_spawn;
  uint32_t opaque_room_update_ambient_824a70;
  uint32_t opaque_room_update_ambient_24ee0;
  uint32_t opaque_room_update_ambient_74e9b0;
  uint32_t opaque_room_update_ambient_special_1023;
  uint32_t player_hud_update_hearts;
  uint32_t player_hud_gfx_residual;
  uint32_t player_hud_dirty_notify;
  uint32_t hud_history_residual;
  uint32_t hud_stat_residual;
  uint32_t player_manager_update_heartbeat_sfx_update;
  uint32_t player_manager_update_heartbeat_sfx_play;
  uint32_t player_manager_update_heartbeat_sfx_stop;
  uint32_t opaque_room_update_prefix_b1_sfx;
  uint32_t opaque_room_update_prefix_b1_spawn;
  uint32_t ambient_824a70_loop_count;
  uint32_t opaque_room_update_ambient_824a70_genrand;
  uint32_t opaque_room_update_ambient_824a70_create;
  uint32_t list_update_6772c_free;
  uint32_t menu_aux_node_free;
  uint32_t menu_aux_payload_free;
  uint32_t ambient_824a70_genrand_samples;
  uint32_t rank_display_calls;
  uint32_t rank_display_state_upd;
  uint32_t rank_display_play_mask;
  uint32_t rank_display_is_playing;
  uint32_t opaque_call_009a2b30;
  uint32_t host_fun_746560_site;
  uint32_t host_fun_746560_param;
  uint32_t host_fun_746560_byte_216e9;
  uint32_t host_fun_746560_deathmatch_suffix;
  uint32_t frame_opaque_98dba0_timer_plan_applied;
  uint32_t frame_opaque_98dba0_timer_mt_advanced;
  uint32_t frame_opaque_98dba0_timer_after;
  uint32_t frame_opaque_98dba0_timer_theta_bits; /* () uint32_t */
  uint32_t frame_opaque_98dba0_timer_x_bits;
  uint32_t frame_opaque_98dba0_timer_y_bits;
  uint32_t frame_opaque_4257b0_pass_a_applied;
  uint32_t frame_opaque_4257b0_pass_b_applied;
  uint32_t frame_opaque_4257b0_id_count;
  uint32_t frame_opaque_4257b0_inserted;
  uint32_t frame_opaque_4257b0_post_count;
  uint32_t frame_opaque_4257b0_pass_b_stores;
  uint32_t frame_opaque_4257b0_list_grow;
  int32_t frame_opaque_98dba0_timer_mt_index_out;
  uint32_t engine_anm2_lane_applied;
  uint32_t engine_anm2_star_layer_mask;
  uint32_t hud_history_loop_residual;
  uint32_t opaque_0092f1c0_counter_out;
  uint32_t opaque_0092e300_slot_3c;
  uint32_t sound_group_walk_stores;
  uint32_t sound_group_walk_pending_mask;
  uint32_t sound_group_walk_applied;
  /* ABI v92: FUN_0098dba0 empty-vector player-walk arm blob-gated. 1 when the
     captured player vector span shows count==0 (PE 0x98dbe1 test/jne + 0x98dc11
     test/je): the walk loop is a PROOF-COMPLETE pure skip and the ONLY host
     content left on the walk residual is the fatal log 0xa112c0. The walk
     host edge still fires (the fatal is host); this event is the pure-skip
     proof published by the in-module gate. ready=0 never sets it. */
  uint32_t frame_opaque_98dba0_walk_empty_skip;
  /* ABI v93: record idx 9 iterate-arm JOIN pure decision proof. 1 when the
     captured JOIN blob shows the tail is pure: idx8 == probe-0xe (PE
     cmp/je 0x8efe04 -> NO-SFX exit, zero calls) OR the RTE 956780 gate is
     CLOSED (gate==0 -> the prep is a no-op; SFXManager::Play 0x92dc30 is
     the sole residual host call on the JOIN's SFX path). ready=0 never
     sets it (pre-v93 always-host). */
  uint32_t state24ecc_8ef990_join_pure;
  /* ABI v94 (R3 log-split, record idx 10): FUN_0040add0 fatal log
     'AnimationData is NULL\n' (PE 0x40adde..0x40adee: push 0xb1a504;
     push 0x10; call 0xa112c0; add esp,8) becomes a TYPED HOST EVENT. 1
     when the secondary==3 probe arm fires with the captured add0_field_4
     == 0 (PE 0x40addc cmp [ebx+4],0 / 0x40ade0 jne). The log is a platform
     primitive (standing logger split) and the host edge still fires; this
     event pins the log as the ONLY host content left — the post-log probe
     flow (miss 0x40adfb/0x40adfd, bit 0x40ae4e..0x40ae6a, false-arm clear
     0x4213de..0x4213ea) is proven pure in-module. ready=0 never sets it. */
  uint32_t frame_opaque_4212c0_add0_log_needed;
  /* ABI v95: record idx 48 0x008607a0 set-arm call-ARG prep (typed host
     event). Filled ONLY when the captured set arm fires (ready!=0 && flag
     byte bit 1 set): the pure arg laws that build the lua_pcallk frame
     inside the materialize residual FUN_00872980 + the luaL_unref tail.
     The pcallk stays typed-host (mod bytecode); these fields let the host
     consumer issue the call without re-deriving the record's pure prologue.
     registry_index == LUA_REGISTRYINDEX 0xfff0b9d8 (used by rawgeti @
     0x872996, luaL_ref @ 0x8729e4 and luaL_unref @ 0x860803); nargs 2 /
     nresults 1 (0x8729c8/0x8729c6); pcallk_context packs errfunc/ctx/k,
     all 0 (0x8729c0/c2/c4); arg1 1 / arg2 0xffffffff are the two pushed
     call args (0x8607d1/0x8607d8 holder+4/+8). The dynamic fn_key
     (registry slot of the callback) and lua_State stay host-time reads
     (P[4]/P[0], P = [engine+0x10]). */
  uint32_t opaque_call_008607a0_args_registry_index;
  uint32_t opaque_call_008607a0_args_nargs;
  uint32_t opaque_call_008607a0_args_nresults;
  uint32_t opaque_call_008607a0_args_pcallk_context;
  uint32_t opaque_call_008607a0_args_arg1;
  uint32_t opaque_call_008607a0_args_arg2;
  /* ABI v95 (record idx 32): FUN_00956110 phone-home probe pure-decision
     proof. 1 when the captured 956110 probe samples prove the probe outcome
     PURELY: net-early byte law (gate open && 0x864c30 returned nonzero, PE
     0x956139..0x95614b) OR the id==-1 walk-path fold over captured vtable
     results (PE 0x956166..0x9561a9, count <= 8). The platform IO tail
     0x864c30 (SEH + IAT + lua-pack + logger), the walk-path virtual
     [[entry]+0x30] dispatch, and the general callback 0xa20940 dispatch
     stay typed-host (plan.host_* flags). ready=0 never sets it. */
  uint32_t frame_opaque_98dba0_956110_probe_pure;
  /* ABI v95 (record idx 43 playerManagerUpdateDeath): TriggerDeath
     CALL-ARG typed host event. 1 when the v69 death wire resolves WALK
     (ready packs + at least one eligible player) AND the frame's
     player-vector span is captured (frame_opaque_98dba0_walk_ready, the
     v92 seam on the SAME Game+0x1baa8 vector the death walk iterates):
     the composed event's pre-call pack is pinned by the in-module laws —
     receiver = isaac_game_update_slice_death_call_receiver (PE 0x9bb643
     cmp/jae OOB clamp + 0x9bb647 lea), flag = 0 (PE 0x9bb67d push 0,
     checkOnly=false). MONOLITHIC (no packs) and NONE (no host call)
     publish nothing; ready=0 never sets it. The call stays typed-host
     (0x007a1090; no per-player expansion — v69 pin). */
  uint32_t player_manager_update_death_arg_prep;
  /* ABI v95 (record idx 34 B13 H5 FUN_00824a70 per-loop create arm):
     per-loop typed CREATE-arm plan count. == loops (1 or 5) on the blob +
     mt-pure arm, when the per-loop R3 genrand seeds are in-module; 0 on
     the host-genrand arm (seeds not captured). The entity create 0x6fe410
     STAYS TYPED HOST — this carrier tells the host consumer that
     `ambient_824a70_create_typed` per-loop argument plans (type 0x3e8 /
     variant 0x8a / layer 0 / data 0xb1bc54 + seed) are in the create-args
     scratch (isaac_game_update_slice_ambient_824a70_create_args_address,
     7 u32 per loop, off 0..6 = type/variant/layer/data/a1/seed/game_ptr).
     Offset fixed by the coordinator merge (v3 table); intend @556. */
  uint32_t ambient_824a70_create_typed;
  /* ABI v95 (record idx 3, 0x0092f1c0 gate-1ba78): typed host events for
     the dispatch + case-arm decisions (intended offsets @548/@552; the
     coordinator merge fixes the final offsets). opaque_0092f1c0_case = the
     switch index (mode-1, PE 0x92f1f0..0x92f1fc, jmp [eax*4+0x92ffa4])
     0..3 — set ONLY when the record body must host (ready!=0).
     opaque_0092f1c0_host_leaf = typed code naming the host content the
     case fires:
     1: case 0 (mode==1) — 0x4186c0 Room interior UNCONDITIONAL at 0x92f231
        before any eligibility (skip impossible, 2026-08-15 addendum);
     2: case 3 (mode==4) — 0x4186c0 UNCONDITIONAL at 0x92fee9;
     3: case 1 (mode==2) reset arm (counter >= limit): big walk/ANM2/SFX/RTE
        body from 0x92fa17;
     4: case 1 limit-2 arm (counter == limit-2): 0x7466d0/0x7467c0 by
        [recv+0x10], 0x665c60+0x6f8120+0x7466d0+0x9eb980, then indirect
        jmp [0xc7169c+0x4b3d8];
     5: case 1 limit-1 arm (counter == limit-1 && field_14 low 0):
        call 0x74f090 + the [0xc7169c+0x4b2a4]/[+0x4b2a5] byte stores;
     6: case 2 (mode==3) 0x7eb1b0 arm (counter==2 && field_14 low != 0);
     7: case 2 0x746560 arm (counter >= limit);
     8: case 2 BOTH (counter==2 && field_14 low != 0 && counter >= limit). */
  uint32_t opaque_0092f1c0_case;
  uint32_t opaque_0092f1c0_host_leaf;
  /* ABI v95 (record idx 10 R1, 0x004212c0): the flag_111 409030 pair
     (A=+0x38 / B=+0x58) becomes a PURE in-module decision (ANM2 state-update
     plan by reference: frame-opaque 409030/408d00 laws + anm2 Rewind
     semantics) over the captured A/B pack (frame_opaque_4212c0_ab_pack_*).
     The two typed host events count the ANM2-family host bodies the pure
     pair REQUIRES: advance = 0x408d00 AnimationState::AdvancePosition
     (advance target via the 4212c0 ANM2 plan scratch), rewind = 0x40a1b0
     AnimationState::Rewind. The record-level host edge
     (opaque_call_004212c0) does NOT fire for the pair when ab_pack_ready.
     ready=0 (pack/pair gates) keeps the pre-v95 always-host pair arm.
     Offsets fixed by the coordinator merge (v3 table). */
  uint32_t frame_opaque_4212c0_409030_advance;
  uint32_t frame_opaque_4212c0_409030_rewind;
  /* ABI v95 (record idx 47 playerManagerUpdateHeartbeatSfxStop): STOP fold
     of 0x0092e230 typed events. Set ONLY when the fold ran in-module
     (sfx_stop_fold_ready && ready && capture): stop_calls > 0 means the
     host must re-issue the per-voice device vtbl+0x3c stops at the seam
     (record-1 opaque_0092e300_slot_3c precedent); stores counts the
     in-module [entry+4]=-1 sentinel + [voice+0x29] clears; pending_mask
     bit i = voice i's pending byte was zeroed by the record. ready=0 /
     fold_ready=0 / missing blob never set them (v60 fallback stays).
     Offsets fixed by the coordinator merge (v3 table). */
  uint32_t sfx_stop_fold_applied;
  uint32_t sfx_stop_fold_stop_calls;
  uint32_t sfx_stop_fold_stores;
  uint32_t sfx_stop_fold_pending_mask;
  /* ABI v95 (record idx 35 opaqueRoomUpdateTailRain, B15 rain spawn loop
     0x00802a80..0x00802e0d): loop-frame typed-host carriers. Filled ONLY
     when the rain blob is captured (runtime b15_rain_ready != 0). The
     loop-frame laws (count/bounds, corner world-xy, spawn-arg assembly,
     xorshift seed carry) run IN-MODULE (room v54/v55/B1 laws consumed by
     reference); these events type the residual host content of the same
     record:
       b15_rain_pure_steps    = loop iterations whose frame law ran
                                 in-module (seed carry complete);
       b15_rain_host_search   = iterations that called 0x00813520 (HOST);
       b15_rain_host_create   = iterations that called 0x00428b20 ->
                                 0x006fe410 opaque create (HOST; the relay
                                 arg-relayout itself is pure, v54);
       b15_rain_host_bind     = iterations that called 0x007ef420 per-entity
                                 bind (HOST);
       b15_rain_host_swap     = 0x78-byte Fisher-Yates slot swaps executed
                                 (0x004d3130/0x004d3230/0x004d6ee0, HOST;
                                 counted BEFORE the pre-corner fatal, PE
                                 0x00802c83..0x00802ccb runs before the
                                 0x00802cee assert);
       b15_rain_genrand_draws = host-reported Isaac::genrand_int32 draws made
                                 inside the host 0x00813520 position search
                                 (TYPED-HOST via roomGenrandNext: when
                                 genrand_mt_ready the in-module scratch
                                 advances the same draws, else the host
                                 draw stream is counted verbatim).
     ready=0 keeps the pre-v95 monolithic record (no carriers set).
     Offsets fixed by the coordinator merge (v3 table; intended 6 u32). */
  uint32_t b15_rain_pure_steps;
  uint32_t b15_rain_host_search;
  uint32_t b15_rain_host_create;
  uint32_t b15_rain_host_bind;
  uint32_t b15_rain_host_swap;
  uint32_t b15_rain_genrand_draws;
  /* ABI v95 (record idx 46 playerManagerUpdateHeartbeatSfxPlay): the
     RESIDUAL_PLAY lane of the heartbeat emits THREE TYPED host leaves
     instead of one monolithic counter (SFXManager::Play 0x92dc30, family
     v26b laws consumed by reference — isaac_sfx_play_gate + the
     *_host(gate) discriminators). Exactly one fires per non-MISS call,
     naming the content the host must re-issue at the 0x009bb82b seam:
       _no_samples = the "[warn] Sound %d has no samples." warn-log leaf
                     (PE 0x92dcb5 call 0xa112c0 then ret 0x92dcce);
       _preload    = SoundEffect::Load 0x92cfb0 + "[warn] Sound %d was
                     not preloaded." + this[0xc]++ (PE 0x92dcda..0x92dcf1)
                     + the continuation body edge (NOT a no-op — the v68
                     preload-keeps-host pin);
       _device     = the LIVE per-voice device body (allocate probes/
                     stream create + set-loop/pitch/volume + start + pan;
                     the B-gates that steer each call are in-module,
                     isaac_sfx_play_leaf_plan).
     ready=0 keeps the monolithic player_manager_update_heartbeat_sfx_play
     (pre-v68 fallback); MISS (id out of range) drops everything, exactly
     as before. Offsets fixed by the coordinator merge (v3 table;
     intended 3 u32 after the landed tail). */
  uint32_t player_manager_update_heartbeat_sfx_play_no_samples;
  uint32_t player_manager_update_heartbeat_sfx_play_preload;
  uint32_t player_manager_update_heartbeat_sfx_play_device;
  /* ABI v95 (record idx 33 opaqueRoomUpdateClearDoors, type-5 door loop
     ~0x008042a8): typed door-open call-plan count. Set ONLY on the gated
     arms (door snapshot valid — no clear-path 0x710dd0 residual ran, or the
     nested type 0x10/3 site) and == the number of Room+0x724[i] slots with
     (ptr != 0 && [ptr+0xc] == 5, FULL-DWORD: 0x8042d2 test ecx,ecx/je +
     0x8042d6 cmp dword [ecx+0xc],5/jne) that FAIL the FUN_00710dd0 early-out
     prologue (the callee's own pure no-op gate). The loop bound is the
     constant 8 re-read per iteration (0x8042be mov eax,8; counter store/
     reload 0x8042c9/e1/ea/ed/f3 — NOT folded once). The door open call
     0x00710dd0 stays TYPED HOST (arg prep: thiscall door ptr, 0 stack args,
     0x8042dc); the per-door plans live in the type5 door-open plan scratch
     (isaac_game_update_slice_type5_door_open_plan_address; entry = slot
     index + door fields). 0 on the FORCED arm (clear-path residual ran: the
     pre-clear capture is stale — the machine re-runs the SAME loop over
     POST-clear states, field_c=5 written on open) and on the all-early-out
     arm. Offset fixed by the coordinator merge (v3 table; expected after
     R39@620). */
  uint32_t type5_door_open_calls;
  /* ABI v95 (record idx 4, 0x008318a0 mode-3 head): pure shared-advance
     proof. 1 when ready!=0 && mode==3 && SIGNED counter<limit (PE
     0x8320c6..0x8320cc jl -> 0x8320bd shared advance): the mode-3 head
     runs ENTIRELY in-module — [ebx+4]=counter+1 (u32 wrap) + common tail
     0x832663 (ratio f32 bits into [ebx+0xc]=Game+0x1b848, then Game+
     0x22ed4/0x22edc = 2 dwords since recaptured mode==3). ZERO host calls
     on this arm, so the 8318a0 host edge is DROPPED (v87 hosted all of
     mode 3). ready=0 keeps the pre-v95 always-host arm (no proof event).
     Offsets fixed by the coordinator merge (v3 table). */
  uint32_t opaque_008318a0_mode3_advance_pure;
  /* ABI v95 (record idx 4, 0x008318a0 mode-4 head): SFX gate-open proof.
     1 when ready!=0 && mode==4 && type_1c==3 (FULL-WORD 0x83243b cmp
     dword) && counter==8 (FULL-WORD 0x832441 cmp dword): the pre-0x4186c0
     SFX prep fires (0x956780 + 0x92dc30 with arg 0xd6 = [ebp-0x50]).
     The SFX call stays TYPED-HOST; this event pins the pure gate + arg
     (0xd6) so the host consumer issues the call with the exact arg. Wide
     full-word values (0x103/0x1008) must NOT open the gate. ready=0
     keeps the pre-v95 always-host mode-4 arm (no proof event). Offsets
     fixed by the coordinator merge (v3 table). */
  uint32_t opaque_008318a0_mode4_sfx_gate_open;
  /* ABI v95 (record idx 25 roomTriggerClearStats): typed carriers for the
     stats residual of Room::TriggerClear (FUN_009e5960, this = Game+
     0x266e4). Filled ONLY when the host captured the stats-vector span
     (runtime tcs_stats_vec_ready != 0) AND the pure gates open
     (clearCount==1 && ordered lookup-float > -18.0f):
       tcs_stats_growth_calls  = guest-alloc vector-growth calls the
                                 machine will make (0x69ee50; 0 when the
                                 captured end != cap for every append);
       tcs_stats_append_count  = stat records appended (the 0x9e6740
                                 count law: 2 for desc.f10+0x48 in [8..12]
                                 else 1);
       tcs_stats_record_dword  = record[0..3] = Room.field_8 (param_2);
       tcs_stats_record_byte   = record[4] low byte = (flags>>10)&1
                                 (param_5);
       tcs_stats_record_float  = record[8] float bits = 0x9e6940 lookup
                                 result (host-captured; 0x00000000 iff
                                 found && match-count>1, else 1);
       tcs_stats_tail_add      = count when Room.field_8==0xb (FULL-
                                 DWORD) && [Game+8]!=0, else 0 (dead on
                                 the known callers; lawed exactly).
     ready=0 keeps the pre-v95 host residual (coarse roomTriggerClearStats
     edge still fires). Offsets fixed by the coordinator merge (v3
     table; intended 6 u32). */
  uint32_t tcs_stats_growth_calls;
  uint32_t tcs_stats_append_count;
  uint32_t tcs_stats_record_dword;
  uint32_t tcs_stats_record_byte;
  uint32_t tcs_stats_record_float;
  uint32_t tcs_stats_tail_add;
  /* ABI v95 (record idx 27 roomTriggerClearAudio, always-music body
     0x7f83b0 called from Room::TriggerClear 0x8068f0 at 0x8069da with
     (this=room, arg1=1, arg2=0)): TYPED HOST leaves replacing the
     monolithic room_trigger_clear_audio counter. Filled ONLY when the
     host captured the always-music seam (runtime
     room_trigger_clear_audio_seed/value/play_sound/gate749830/
     room_match ALL set — see the runtime block; ready is the OR of
     those captures != 0):
       room_trigger_clear_audio_music      = 1 iff the music path body
             runs (arg2!=0 || value > rnd || value >= 1.0f — the pure
             law isaac_room_trigger_clear_audio_music; PE comiss/ja +
             comiss/jae, NaN -> NOT taken -> music==0; xorshift32
             shifts {2, 0x15, 9} from 0xb1f594 qword + 0xb1f59c,
             uint32->double sign-fix 0xbacb00, cvtpd2ps, mulss
             0x2f7ffffe). Gate leaves 0x749830/GetRoomByIdx/0x7f92b0
             are captured results; the host must still run the music
             body leaf chain when music fires (FirstCollectibleOwner
             0x9be080 + door ops stay host).
       room_trigger_clear_audio_flag_store = 1 iff music did NOT fire
             (byte [game+9] = 1, PE 0x7f84e3 mov byte [edi+9],1; the
             host must apply that store).
       room_trigger_clear_audio_sfx        = 1 iff the CALLER SFX leaf
             fires (playSound==0 -> [ebp+8]=0x24, 0x956780 remap +
             0x92dc30 Play(id=0x24-remapped, 1.0f, 2, 0, 1.0f, 0), PE
             0x8069df..0x806a21). The remap + Play laws stay host
             (RTE 956780 gate / SFX play gate consumed by reference).
     ready=0 (any capture missing) keeps the pre-v95 monolithic
     room_trigger_clear_audio counter (exact fallback). Append-only by
     name; offsets pinned by the coordinator merge at wave end. */
  uint32_t room_trigger_clear_audio_music;
  uint32_t room_trigger_clear_audio_flag_store;
  uint32_t room_trigger_clear_audio_sfx;
  /* ABI v95 (record idx 19 opaqueCall006fd7c0Mode4Sfx): typed-host Play
     carrier for the frame-effect mode-4 SFX arm. Fires +1 whenever the
     mode-4 gate (timed_transition_cleanup_mode == 4, FULL-DWORD, already
     in-module) opens — the PE then runs 0x956780 prep + SFXManager::Play
     0x92dc30 with the arg plan pinned by the composed laws
     (isaac_game_update_slice_6fd7c0_mode4_sfx_arg_prep / seed / rare_hit /
     play_id / play_args / manager_receiver — frame-effect v18 laws by
     reference). The coarse opaque_call_006fd7c0_mode4_sfx counter STAYS
     (host edge still fires); this event names the host leaf so the host
     consumer issues the call with the exact composed arg-prep. Offset
     fixed by the coordinator merge (v3 table; intended @628 after R33's
     type5DoorOpenCalls @624). */
  uint32_t frame_effect_6fd7c0_mode4_sfx_play_typed;
  /* ABI v95 (record idx 15 opaqueRoomUpdatePrefixB3B7): typed host leaves
     of the B3-B7 residual (PE 0x00803327..0x00803bfb). Filled ONLY when
     runtime b3b7_sparse_ready != 0; ready=0 keeps the monolithic
     opaque_room_update_prefix_b3_b7 counter (exact fallback). The bodies
     (FCO 0x9be080, HCE 0x9305f0, challenge 0x7ea2d0, TE call 0x9960b0,
     lookup 0x41af60, pos 0x812d00/0x813520, genrand 0x6eef60, spawn
     0x428b20, cleanup 0xa648b0, count 0x708250, grow 0x42c920, list
     0x414a80/0x424540, vtable [vt+0]/[vt+8]/[vt+0x48]/[vt+0x4c], seed
     fatals 0xa112c0) STAY typed-host; each counter names one leaf body
     that the host must run. Append-only by name; offsets pinned by the
     coordinator merge at wave end. */
  uint32_t b3b7_host_fco;          /* 0x009be080 FirstCollectibleOwner(0x28d) */
  uint32_t b3b7_host_challenge;    /* 0x007ea2d0 challenge float body */
  uint32_t b3b7_host_te_call;      /* 0x009960b0 TE call (match hit) */
  uint32_t b4_host_lookup;         /* 0x0041af60 lookup */
  uint32_t b4_host_pos_a;          /* 0x00812d00 pos_a (G0 route) */
  uint32_t b4_host_pos_finish;     /* 0x00813520 pos_finish count */
  uint32_t b4_genrand_draws;       /* 0x006eef60 draws (G0/G1/band/G3) */
  uint32_t b4_host_spawns;         /* 0x00428b20 spawn count */
  uint32_t b4_host_cleanup;        /* 0x00a648b0 cleanup */
  uint32_t b4_seed_fatal;          /* typed drop: 0xa112c0 seed-null fatal */
  uint32_t b5_host_count_708250;   /* 0x00708250 player count */
  uint32_t b5_host_vcall48;        /* [vt+0x48] candidate probes */
  uint32_t b5_host_grow;           /* 0x0042c920 list grow */
  uint32_t b5_host_vcall4c;        /* [vt+0x4c] probes (pass2) */
  uint32_t b5_seed_fatal;          /* typed drop: 0xa112c0 seed-null fatal */
  uint32_t b6_host_destroy;        /* [vt+0] destroy calls */
  uint32_t b6_host_iterate;        /* 0x00414a80 per-node advances */
  uint32_t b6_host_clear;          /* 0x00424540 list clear */
  uint32_t b7_host_update;         /* [vt+8] grid Update calls */
  /* ABI v95 (record idx 42 opaqueRoomUpdateTailPath, B19 0x008055a7..
     0x00806043 + B20 0x0080608e..0x00806884): TYPED carriers for the path
     rebuild + trail-list record. Filled ONLY when the runtime tail_path_
     blob is captured (tail_path_ready != 0); the room-family laws (B19 v30,
     B20 v31/v32) drive the DECISIONS by reference:
       tail_path_pure_steps          = in-module trail-loop iterations whose
                                       B19/B20 frame laws ran;
       tail_path_host_rebuild        = B19 rebuild body host needed
                                       (refcount/memset/tree alloc/pathfinding/
                                       spawn/pedestal suite, 0x008055b4..0x0602f);
       tail_path_host_trail          = B20 trail body host needed (SEH/local
                                       vector + spawn suite, 0x008060a1..);
       tail_path_host_push           = pass1 type-filter matches -> 0x42c920
                                       vector push (HOST);
       tail_path_host_spawn          = pass2 spawn 0x428b20 calls (HOST);
       tail_path_host_multispawn_steps = FLAGGED multi-spawn child-chain steps
                                       (HOST; the chain_continue gate laws are
                                       in-module);
       tail_path_host_genrand_draws  = Isaac::genrand_int32 draws made by the
                                       FLAGGED/DEFAULT arms (TYPED-HOST, capped
                                       by the trail-array cap).
     ready=0 keeps the pre-v95 monolithic record (no carriers set).
     Offsets fixed by the coordinator merge (claim 628..655). */
  uint32_t tail_path_pure_steps;
  uint32_t tail_path_host_rebuild;
  uint32_t tail_path_host_trail;
  uint32_t tail_path_host_push;
  uint32_t tail_path_host_spawn;
  uint32_t tail_path_host_multispawn_steps;
  uint32_t tail_path_host_genrand_draws;
  /* ABI v95 (record idx 14 opaqueRoomUpdatePrefixB2): typed leaves +
     carriers for the item-pool/spawn special + set-to-60 body (PE
     0x00802e20..0x00803321). Set ONLY on the ready path (b2_pool_ready
     != 0) when the special gate opens (Room+0x7764 == 0 && Game+0x18304
     == 0xfffffff4); ready=0 keeps the pre-v95 monolithic residual (the
     B1 resume emits the parent counter opaque_room_update_prefix_b2).
       b2_special_gate_open       = 1 when the module owned the body;
       b2_pick_pool               = picked pool id (0..30) after the pure
             pick, or 0xffffffff when the empty path set-to-60 fired
             (host decs word [Game+0x1af30 + id*2], PE 0x803080);
       b2_seed_after              = final advanced collectible RNG seed
             (host writes it back to the 16-byte struct at begin +
             min(count-1,622)*0x10; 0x7e910f + 0x803209 advances);
       b2_spawn_seed1             = the pre-pick seed1 (0x7e90f0 result),
             constant per frame — host arg for 0x00733610 on each
             spawn1 leaf;
       b2_spawn_plan_count        = qualifying spawn elements; the
             per-element plans (f32 x/y, grid index, seed_after, spawn2
             gate) live in the exported out-scratch
             (isaac_game_update_slice_b2_spawn_out_address);
       b2_fatal_collectible_bounds = 1 when count <= 622 (the
             0xa112c0 "Collectible ID out of bounds!" log, PE 0x802e66);
       b2_fatal_rng_zero          = count of "RNG Seed is zero!" logs
             (0xb6bf54; 0x7e90f5 pre-pick + 0x8031c1 per qualifying
             spawn element);
       b2_fatal_pick_empty        = 1 when the pick's weight total is 0
             (0xb1e650 log, PE 0x49cd62; dead on the ready path).
     Append-only by name; offsets pinned by the coordinator merge. */
  uint32_t b2_special_gate_open;
  uint32_t b2_pick_pool;
  uint32_t b2_seed_after;
  uint32_t b2_spawn_seed1;
  uint32_t b2_spawn_plan_count;
  uint32_t b2_fatal_collectible_bounds;
  uint32_t b2_fatal_rng_zero;
  uint32_t b2_fatal_pick_empty;
  /* ABI v95 (record idx 17 opaqueRoomUpdatePrefixB9B11): typed-host bodies
     of the B9-B11 residual (PE 0x00803ce5..0x00804110). Filled ONLY on the
     inputs_ready arm (b9b11_inputs_ready != 0); ready=0 keeps the v48
     monolithic parent counter opaque_room_update_prefix_b9_b11 (exact
     fallback). The bodies STAY typed-host; each counter names one body
     the host must run:
       _free      = B9 free body entered (challenge gate open: FCO(0x226)
                    result != 0 && Room active && age==4 && type==0x11 &&
                    !((desc_flags_44>>3)&1), PE 0x803cfe..0x803d4b). Host
                    runs 0x41af60 lookup + optional 0x833420 helper +
                    free IAT; the free sub-laws
                    (isaac_game_update_slice_b9b11_free_*) tell the host
                    which arms fire.
       _mode_hooks = B9 mode hooks 0x834350 fired (type 0xb/0x11 &&
                    Game byte != 0, PE 0x803dd9..0x803df5).
       _flag_11f4  = 0x7fe220 fired (Room+0x11f4 byte != 0, PE
                    0x803dfa..0x803e05).
       _b10_fatal  = B10 deathspawn warn-log gate opened (enemies <= 0 &&
                    old_7224 > 0 SIGNED, PE 0x803e1d..0x803e5f): the
                    typed-event — host runs 0xa112c0 x2.
       _manager    = B11 always-host manager chain ran (0x4186c0 +
                    0x993a70 + 0x409030 double + 0x83a080 + 0x7eb870 +
                    0x930820 + 0x8020d0). == 1 on EVERY ready arm (the
                    always chain is unconditional).
       _camera     = B11 TempFX camera body entered (flag 7321 clear &&
                    list non-empty, PE 0x803f43..0x803f5e); the per-node
                    scan + genrand + 0x7df690 stay host (sub-laws
                    tempfx_* exported for the host scan).
     Append-only by name; offsets pinned by the coordinator merge at wave
     end (intended 632..656 after R19's frameEffect6fd7c0Mode4SfxPlayTyped
     @628). */
  uint32_t opaque_room_update_prefix_b9_b11_free;
  uint32_t opaque_room_update_prefix_b9_b11_mode_hooks;
  uint32_t opaque_room_update_prefix_b9_b11_flag_11f4;
  uint32_t opaque_room_update_prefix_b9_b11_b10_fatal;
  uint32_t opaque_room_update_prefix_b9_b11_manager;
  uint32_t opaque_room_update_prefix_b9_b11_camera;
  /* ABI v95 (record idx 36 opaqueRoomUpdateTailWaterB16 / FUN_00823540):
     typed-host spray/fx carriers of the 0x00823540 chain. Filled ONLY when
     runtime water_b16_blob_ready != 0 AND the 823540 gate opens (post-step
     water > 0 && pre lava > 0 — isaac_room_b16_needs_823540): the in-module
     water_wire computes the per-cell vector step (FUN_00823370 float math +
     the grid-cell gates), the 7067c0 spray goal deltas and the 0x676b4
     gate byte. The coarse opaque_room_update_tail_water_b16 edge STAYS
     (type-7 / lava-band entity grid walks + the 0x4288a0 challenge-store
     lookups + the Game+0x676d0/+0x676e8 apply stay typed-host); these
     carriers publish the pure-computed content so the host apply does not
     re-derive it:
       water_b16_gate          = byte target Game+0x676b4 (0/1);
       water_b16_step_0..5     = float bits Game+0x676d0..0x676e4 (the
             in-module 6-float vector; host applies ALWAYS when
             wire_applied);
       water_b16_goal_0..5     = float bits Game+0x676e8..0x676fc
             (|step-cur|*0.015; host applies ONLY when gate==1);
       water_b16_wire_applied  = 1 when the in-module chain ran.
     The fx gate byte + cur snap travel in SLICE STATE (fx_lerp_gate_676b4
     / fx_cur_676b8..676c4, existing write-back publishes them). ready=0
     keeps the pre-v95 monolithic residual (no carriers). Append-only by
     name; offsets pinned by the coordinator merge (claimed next-free after
     the v3 table @624). */
  uint32_t water_b16_gate;
  uint32_t water_b16_step_0;
  uint32_t water_b16_step_1;
  uint32_t water_b16_step_2;
  uint32_t water_b16_step_3;
  uint32_t water_b16_step_4;
  uint32_t water_b16_step_5;
  uint32_t water_b16_goal_0;
  uint32_t water_b16_goal_1;
  uint32_t water_b16_goal_2;
  uint32_t water_b16_goal_3;
  uint32_t water_b16_goal_4;
  uint32_t water_b16_goal_5;
  uint32_t water_b16_wire_applied;
  /* ABI v95 (record idx 41 opaqueRoomUpdateTailEntity, B18 entity walk
     0x00805527..0x008055a7): TYPED HOST counters for the entity update
     calls. Filled ONLY when b18_entity_ready != 0 (runtime pack valid);
     ready=0 keeps the pre-v95 monolithic coarse event (exact fallback).
     The walk DECISION CF is pure + in-module (list_empty/list_continue/
     entity_action/path_b_needs_host + the composed walk_frame plan); the
     three entity update bodies stay TYPED-HOST — these counters tell the
     host consumer EXACTLY how many of each to re-issue at the seam:
       b18_entity_walk_type5_calls = entities routed to 0x6e17c0
             (type==5, FULL-DWORD cmp edx,5 @0x80554c);
       b18_entity_walk_rtti_casts  = entities routed to 0xaf08b1
             ((mode>=2 SIGNED @0x80555d && type==1 FULL-DWORD @0x805566)
             || (type-10)u32 < 0x3de UNSIGNED @0x80556b..0x805573);
       b18_entity_walk_pathb_calls = RTTI candidates whose host-captured
             cast result != 0 (FULL-DWORD test eax,eax @0x80558c) ->
             0x6da530;
       b18_entity_walk_frame       = 1 when the frame law ran in-module
             (incl. the empty-list pure-complete arm: count==0 under an
             open gate -> ZERO host calls -> the COARSE event DROPS on
             that arm, PE 0x805532 cmp dword [Room+0x1264],esi / jbe
             0x8055a0).
     Append-only by name; offsets pinned by the coordinator merge (v3
     table; EVENTS next-free after the landed tail). */
  uint32_t b18_entity_walk_type5_calls;
  uint32_t b18_entity_walk_rtti_casts;
  uint32_t b18_entity_walk_pathb_calls;
  uint32_t b18_entity_walk_frame;
  /* ABI v95 (record idx 24 opaqueRoomUpdateClearDoorSlots, clear-path door
     loop 0x0080424d..0x0080427d): composed per-slot early-out decision.
     bit i (i in 0..7) is SET iff runtime slot i is PRESENT (FULL-DWORD,
     PE 0x804262 test ecx,ecx/je) AND the FUN_00710dd0 early-out prologue
     FAILS (isaac_door_helper_710dd0_early_out == 0, PE 0x710ddb..0x710e07)
     — the residual open body runs for exactly those slots (typed host
     open; the coarse opaque_room_update_clear_door_slots counter still
     fires 0/1). 0 when every present slot early-outs (pure skip — the v25
     any_needs_host contract, now per-slot typed). Written by
     isaac_game_update_slice_clear_door_slots_failing_mask (mask law);
     the host consumer opens exactly the failing doors. Append-only by
     name; offset assigned by the coordinator merge (v3 table). */
  uint32_t opaque_room_update_clear_door_slots_mask;
  /* ABI v95 (record idx 22 opaqueRoomTransitionEngineBody): typed host
     carriers for the player-loop body's per-entry host calls (PE
     0x0082f070 call 0x7abcc0 / 0x0082f084 call 0x7abe20). Filled ONLY
     when the entry blob is captured (runtime engine_player_entry_173_ready
     != 0 && engine_player_blob_ready != 0 && engine_player_count fits
     ISAAC_ENGINE_PLAYER_MAX): each lane counts the eligible entries whose
     pre-call plan fires that host body. The bodies STAY TYPED-HOST (Rewind
     0x40a1b0 / ANM2::Reset 0x407f10 heap zeros + the unconditional stores
     [entry+0x139a]/[entry+0x14c]/[entry+0x1398] + Sprite::Play 0x40a5d0 +
     the 0x956780/0x92dc30 SFX leg — player-entry objects are outside the
     capture ABI); these carriers tell the host consumer exactly which
     per-entry bodies to re-issue at the seam. ready=0 keeps the pre-v95
     coarse opaque_room_transition_engine_body edge (exact fallback).
     Offsets fixed by the coordinator merge (v3 table). */
  uint32_t opaque_room_transition_engine_body_7abcc0_calls;
  uint32_t opaque_room_transition_engine_body_7abe20_calls;
  /* ABI v96 (record idx 12 opaqueCall006fd7c0): typed events of the
     705ee0 write-block DECISION seam. Filled ONLY when the record-12
     capture is LIVE — runtime opaque_call_006fd7c0_ready != 0 AND
     frame_effect_shell_ready != 0 — AND the shell canopy gate
     (isaac_frame_effect_6fd7c0_needs_705ee0_null_player) opens AND
     the composed write-plan over the captured lanes reaches the write
     block (plan.reached — the frozen -1 arg at 0x006fdb4d; PE 0x705f5a
     js + the three entry byte guards clear). The nine-store site mask
     resolves in-module (isaac_game_update_slice_705ee0_store_mask);
     the SaveState leaf 0x6f9000 fires with receiver Game + arg newslot+4
     (isaac_game_update_slice_705ee0_save_state_arg_prep). The coarse
     opaque_frame_effect_6fd7c0_shell counter STAYS. ready=0 never sets
     them (the seam is inert; the pre-v96 monolithic frame-effect
     residual stays byte-for-byte). Offsets fixed by the
     coordinator merge (912/916 next-free after the landed tail 908). */
  uint32_t rewind_705ee0_stores;
  uint32_t rewind_705ee0_save_state;
  /* ABI v96 (record idx 0 RecomputeStats seam, coordinator-merged): typed
     host events — 1 per k6/k7-arm entry, all three together (the
     0x84cb39 test bl,0xc0 gate). The probe RESULTS are the runtime blob
     scalars hud_stat_walk_probe1/2/3 consumed by the k6/k7 block; these
     events tell the host consumer the real probe BODIES ran at the seam:
       hud_stat_walk_probe1 = 0x7f92b0 (f32 clamp source, x87 ST0);
       hud_stat_walk_probe2 = 0x749830 (BOOL in AL; low-byte gate);
       hud_stat_walk_probe3 = 0x7f96f0 (f32 in XMM0; k6/k7 complement).
     Filled in hud_stat_walk_recompute_stats' k6/k7 block. Offsets fixed
     by the coordinator merge (920/924/928, next-free after 916). */
  uint32_t hud_stat_walk_probe1;
  uint32_t hud_stat_walk_probe2;
  uint32_t hud_stat_walk_probe3;
  /* ABI v96 (record idx 4 opaqueCall008318a0 / record idx 10
     opaqueCall004212c0 / record idx 0 RecomputeStats, coordinator-merged
     ABI-96 tail): typed host carriers for the SFX-manager store plan, the
     4212c0 true-probe interior prefix and the record-0 fatal-empty walk
     arm. All three STAY typed-host: the 9 masked manager stores, the
     interior 9-store + volume-gate + 0x92e430/0x6fd7c0/0x8318a0 host
     edges, and the 0x84c1da fatal log receive their DECISION surfaces
     in-module (the exported plans), and these events +1 the host
     consumer at the seam. Filled ONLY when the ABI-96 capture lanes are
     LIVE (opaque_8318a0_player_entry_ready / the record-10 true-probe
     blob ready / record-0's walk span capture); ready=0 keeps the
     pre-v96 monolithic residuals byte-for-byte (the events stay 0).
     Offsets fixed by the coordinator merge (932/936/940). */
  uint32_t opaque_008318a0_sfx_manager_stores;
  uint32_t frame_opaque_4212c0_true_probe_interior;
  uint32_t hud_stat_walk_fatal_empty;
  /* ABI v96 (record idx 22 opaqueRoomTransitionEnginePrefix, W22-S2
     §lane-requests, coordinator-merged ABI-96 tail): typed events of the
     ANM2::Load pre-lane host half — the H2 filename assign (0x40ccd0,
     writes Game+0x1b874/0x1b884/0x1b888), the H4 cache fetch (0x40e110,
     globals 0xc798b8/bc/c0) and the H5 leaf Manager::LoadImage
     (0x9588a0 via 0x40c000). +1 each per lane-on host fire; the coarse
     opaque_room_transition_engine_prefix counter STAYS (the edge keeps
     firing until record-22 Unit B); the typed events ride the EXISTING
     lane gate (engine_anm2_lane_pure + latch low-byte clear) and name
     the host leaf content for the Unit B fold. Filled only when the
     ABI-96 capture lanes (engine_anm2_filename_ready /
     engine_anm2_loadgraphics_flag_ready) are set; ready=0 keeps the
     pre-v96 monolithic residual. Offsets fixed by the coordinator
     merge (944/948/952, next-free after 940). */
  uint32_t engine_anm2_prefix_filename_assign;
  uint32_t engine_anm2_prefix_cache_fetch;
  uint32_t engine_anm2_prefix_loadimage;
  /* ABI v102 (record idx 0 walker live wiring, wave update-v102-record0-
     wire; PLAN update-v102-abi97-plan — offsets pinned by the wave-26
     merge): typed events of the 0x84cc40 walker's probe bodies — twins of
     the seam trio @920/924/928 (the walker's probe calls are NOT counted
     by the seam counters). Walkers stay host; fired ONLY when the walker
     capture lanes (hud_stat_walker_player_a/b @14276/@14280) are LIVE
     (a real PM swap captured A/B): probe1 = reached (+1 per walker
     k6/k7-arm entry), probe2 = the swap-gate row-arm value (1/2/0, the
     live A/B drive), probe3 = the walker-site k6 target bits (the
     probe->clamp->k6 chain). Lanes all-zero (capture absent) leaves the
     residual byte-for-byte (events stay 0 + the (void) law calls consume
     the same 0u stand-ins as v101). Offsets fixed by the PLAN
     (956/960/964, next-free after 952). */
  uint32_t hud_stat_walker_probe1;
  uint32_t hud_stat_walker_probe2;
  uint32_t hud_stat_walker_probe3;
  /* ABI v104 (record idx 12 opaqueCall006fd7c0 transition-pack REAL wiring,
     wave update-v104-record12-wire; PLAN update-v102-record12-tran §5 +
     W27-S1 ABI-98 lanes; offsets pinned by the wave-27 merge): typed events
     of the capture-decidable arms — +1 each when the corresponding arm
     fires with the pack LIVE (transition_6fd7c0_ready @14324 AND the
     record's own ready opaque_call_006fd7c0_ready @13732 both set):
     stage_transition = the anim-0xc special arm routes NESTED (route probe
     AL==0 -> 0x6fdc10(0,6,0) @0x6fd8ca); player_loop = the 0x8279a0 gate
     opens (player-loop arm 0x6fd92a; host leaves 0x81e9d0/0x945190/
     0x41ab50/0xa648b0/0x4175b0/0x7cd950 + the 0x13bc clamp); room_dispatch
     = the anim-3 dispatch runs 0x425ac0 @0x6fdb1d (receiver Game+0x1bbe0,
     9 args, site arg3; the 705ee0 tail always follows per needs-law).
     Either voucher 0 (capture absent) keeps the pre-v104 residual
     byte-for-byte (the events stay 0). Offsets fixed by the PLAN
     (968/972/976, next-free after 964). */
  uint32_t frame_effect_6fd7c0_stage_transition;
  uint32_t frame_effect_6fd7c0_player_loop;
  uint32_t frame_effect_6fd7c0_room_dispatch;
  /* ABI v99 (wave-28 entity-surface REBIND, idx 5/32): the accept-pure
     proof event — 1 when a captured matched entry is PURE (class known +
     blob complete) and frame_opaque_98dba0_entity_surface_ready != 0;
     ready=0 publishes nothing (the v95 provisional @640 was removed — it
     collided with the committed tcsStats region). Offset fixed by the
     wave-28 merge (980, next-free after 976). */
  uint32_t frame_opaque_98dba0_entity_surface_accept_pure;
  /* ABI v107 (wave-29 merge, record idx 39 mid-restock 0x00805408): the
     typed-event DROP proof — 1 when RNG::RandomInt's zero-seed fatal
     (PE 0x007e9028 test edx,edx / 0x007e9033 call 0xa112c0 'RNG Seed is
     zero!' / 0x007e9041 int3) made the mid-restock body return HOST_FATAL
     and the module dropped it instead of rerunning the monolithic
     residual (zero game-memory stores precede the fatal, drop == pre-crash
     state). FULL-DWORD seed==0 via
     isaac_game_update_slice_mid_restock_seed_zero. Offset fixed by the
     wave-29 merge (984, next-free after 980). */
  uint32_t mid_restock_seed_zero_drop;
  /* ABI v115 (record idx 23 opaqueRoomUpdateClearPath removal,
     update-v115-clearpath-removal): typed carrier for the clear-path
     per-player flag store. PE 0x00804235..0x0080424b: ecx=[0xc7169c]
     (manager, OUTSIDE the Game buffer) / eax=[ecx+0x29fbc]*0x184 (u32
     wrap) / and dword [eax+ecx+0x2a12c],0xfffffffe — exactly ONE
     platform-class masked store, no loop / no SEH / no other leaves.
     Fires under the SAME pure gate law that armed the retired coarse
     edge (isaac_game_update_slice_clear_path_flag_gate: mode==0xd skip;
     1..6 closed iff Game+0x2654c bit16; else open). Offset fixed by the
     v115 merge (988, next-free after 984; events 988 -> 992). */
  uint32_t clear_path_flag_store;
  /* ABI v119 (update-v119-door-removal, records idx 24 + idx 33): typed
     carrier for the FORCED arm of the type-5 door loop (record idx 33
     opaqueRoomUpdateClearDoors). When the clear-path door residual ran
     (idx-24 failing mask != 0) the pre-clear door snapshot is stale, so
     the machine re-runs the 8-slot type-5 loop over POST-clear door
     states (census update-v95-clear-doors-type5: PE 0x008042be..0x008042f3
     runs ALWAYS; forced arm publishes NO plan — post-clear states are
     host-time). This word fires 1-per-tick under the SAME pure merge law
     that armed the retired coarse edge
     (isaac_game_update_slice_clear_path_door_result_merge with
     any_needs_host=1); the gated arm keeps its existing typed carrier
     type5_door_open_calls (plan count > 0 == the same gate). Offset 992,
     next-free after 988; events 992 -> 996. */
  uint32_t type5_door_forced_rerun;
  /* ABI v126 (update-v126-7230-spawn-removal): the idx-40 coarse
     retirement carrier — fires iff the retired edge armed (gate open:
     Room+0x7230 pre > 0 SIGNED && pre % 5 == 0 SIGNED idiv), same tick,
     same order position. Offset 996, next-free after 992; events
     996 -> 1000. */
  uint32_t tail_mid_7230_spawn_armed;
  /* ABI v127 (update-v127-706c-restock-removal): the idx-38 shop-restock
     residual typed events (ADDENDUM-3 F3 event set) @1000..1020. */
  uint32_t shop_restock_warn;
  uint32_t shop_restock_create1;
  uint32_t shop_restock_create2;
  uint32_t shop_restock_seed_zero_drop;
  uint32_t shop_restock_copy_back_ready;
  /* ABI v128 (update-v128-heartbeat-sfxupd-removal, PLAN-45 §4): the
     update-lane residual typed events @1020..1056. */
  uint32_t sfx_upd_busy_applied;
  uint32_t sfx_upd_walk_count;
  uint32_t sfx_upd_pending_mask;
  uint32_t sfx_upd_no_samples_warn;
  uint32_t sfx_vol_set_group_mem;
  uint32_t sfx_vol_set_voice;
  uint32_t sfx_dev_volume_calls;
  uint32_t sfx_pitch_set_voice;
  uint32_t sfx_dev_pitch_calls;
  /* ABI v131 (update-v131-greed-probe-pack, record idx 30): the
     in-module probe band + fire plan carriers @1056..1072. */
  uint32_t room_trigger_clear_awards_greed_probe_9bf990;
  uint32_t room_trigger_clear_awards_greed_probe_9bfa00;
  uint32_t room_trigger_clear_awards_greed_probe_9bfa70;
  uint32_t room_trigger_clear_awards_greed_fire_count;
  uint32_t room_trigger_clear_awards_greed_fire_mask;
  /* ABI v132 (update-v132-b16-spawn-pack, record idx 36): enumeration
     echo carriers @1076..1096 (contracts-b16-spawn NOTES §4). */
  uint32_t water_b16_spawn_rows_applied;
  uint32_t water_b16_water_hit_count;
  uint32_t water_b16_lava_hit_count;
  uint32_t water_b16_walk_arm_mask;
  uint32_t water_b16_cast_count;
  uint32_t water_b16_leaf_call_count;
  /* ABI v133 (update-v133-audio-music-pack, records idx26/27): typed
     spawn-tail carriers @1100..1104 (contracts-audio-music NOTES §2d). */
  uint32_t room_trigger_clear_audio_non_greed_tail_spawns;
  uint32_t room_trigger_clear_audio_music_path_tail_spawns;
  /* ABI v134 (update-v134-awards-head-pack, records idx28/29): head-plan
     Out carriers @1108..1136 (contracts-awards NOTES §2c). */
  uint32_t room_awards_head_exit_kind;
  uint32_t room_awards_head_sfx_arm;
  uint32_t room_awards_head_byte_6d;
  uint32_t room_awards_head_variant_local;
  uint32_t room_awards_head_count;
  uint32_t room_awards_head_id_final;
  uint32_t room_awards_head_flag_66;
  uint32_t room_awards_head_planned_spawns;
  /* ABI v135 (record idx28): deep-challenge fire carrier @1140. */
  uint32_t room_trigger_clear_deep_music_fire;
  /* ABI v137 (record idx27): ALT spawn-path carrier @1144 = rows
     consumed from the future ALT-tail capture pack (law frozen v84,
     lanes pending); stays 0 until the companion pack lands. */
  uint32_t room_trigger_clear_audio_alt_path_tail_spawns;
  /* ABI v139 (records idx13/idx35): scalar tail echoes @1148..1168
     (contracts-b1-rain NOTES 3). Observe-only mirrors; never re-drive.
     b1_rain_bind_7764_stores expected in {0,1} (last writer wins). */
  uint32_t b1_rain_rows_applied;
  uint32_t b1_rain_spawn_count_echo;
  uint32_t b1_rain_search_ok_count;
  uint32_t b1_rain_genrand_draws_total;
  uint32_t b1_rain_bind_7764_stores;
  uint32_t b1_rain_bind_repositioned;
  /* ABI v140 (update-v140-awards-spawn-loop-pack, record idx29): SPAWN_LOOP
     typed carriers @1172..1200 (contracts-awards NOTES section 6). Published
     ONLY on capture-live retirement ticks (voucher valid + blockers inert);
     the coarse @184 stays silent those ticks. */
  uint32_t room_awards_spawn_loop_rows_applied;   /* rows consumed (== count) */
  uint32_t room_awards_spawn_loop_door_spawn_fires; /* door arm && !gate al */
  uint32_t room_awards_spawn_loop_sfx_chase_fires;  /* owner != 0 chases */
  uint32_t room_awards_spawn_loop_flag_rmw_mask;    /* bit i: flag66&&i==0 */
  int32_t room_awards_spawn_loop_variant_final;     /* [ebp-0x8c] after loop */
  uint32_t room_awards_spawn_loop_b1_pass;          /* luck gate ABOVE pass */
  uint32_t room_awards_spawn_loop_b1_site_armed;    /* pass -> {5,0x5a} spawn */
  uint32_t room_awards_spawn_loop_b1_chase_fired;   /* pass && picker al */
  /* ABI v141 (update-v141-b-block-probe-pack, record idx29): post-loop
     0xb-block carriers @1204..1240 (contracts-awards NOTES section 6
     companion). The pre-loop band spawn + per-iteration probes
     0x9b92c0/0x7cb6e0/0x7c3980 run IN-MODULE via the frozen room-pure
     ABI v86 laws consumed BY REFERENCE; the host still applies every
     typed-host leaf (pos walk 0x813520, create 0x428b20, roll
     counter++/[this+0x1574]|=0x41f apply-backs, followup 0x7abd30).
     Published ONLY on capture-live retirement ticks; coarse @184 stays
     silent those ticks. */
  uint32_t room_awards_b_block_rows_applied;   /* iterations processed */
  uint32_t room_awards_b_block_oob_defects;    /* probe A jae arms (0 by
                                                  loop-guard construction;
                                                  defect pinned in law) */
  int32_t room_awards_b_block_count_sum;        /* sum of probe B results q */
  uint32_t room_awards_b_block_roll_first_mask; /* bit i: first roll fired */
  uint32_t room_awards_b_block_roll_second_mask;/* bit i: second roll fired */
  uint32_t room_awards_b_block_roll_index_sum;  /* sum of w%6 selectors */
  uint32_t room_awards_b_block_followup_fires;  /* 0x7abd30 gates opened */
  uint32_t room_awards_b_block_rng_final;       /* threaded s0 after rolls */
  uint32_t room_awards_b_block_preloop_create_variant; /* 0x64 / 0x32 / 0 */
  uint32_t room_awards_b_block_tail_create_fired;      /* {5,0x12c} @0x2b */
  /* ABI v142 (update-v142-rt-band-pop, record idx4): the typed
     rt_band_pop composite carrier @1244..1256 (contracts-idx4-engine-band
     NOTES §4/§5). Extends the standing v97 store-plan / v102 apply-plan
     pair: on capture-live firing ticks the two STATEFUL band deltas are
     applied through these lanes and the five constant param stores
     (0xc79900..0xc79910) are DERIVED purely; the four opaque thiscall
     leaves on *0xc798e0 stay host actions. Capture absence keeps the
     pre-v142 residual byte-for-byte (all four lanes stay 0). */
  uint32_t opaque_008318a0_rt_band_pop_fired;      /* +1 per firing tick */
  uint32_t opaque_008318a0_rt_band_pop_depth_after;/* [0xc79790] post-dec */
  uint32_t opaque_008318a0_rt_band_pop_latch_after;/* [0xc7978c] post */
  uint32_t opaque_008318a0_rt_band_pop_params_pack;/* {0,{1|6},7,1,7} 4b each */
} IsaacGameUpdateSliceEvents;

/* ABI v95 (record idx 41 opaqueRoomUpdateTailEntity, B18 entity walk
   0x00805527..0x008055a7): composed walk-frame plan. Filled by
   isaac_game_update_slice_b18_walk_frame when the runtime pack is valid
   (b18_entity_ready != 0); the walk frame RE-DERIVES the count/bound per
   iteration (list_continue — PE 0x805597 inc esi / 0x805598 cmp esi,
   [Room+0x1264] / 0x80559e jb, NEVER folded once) and applies the
   per-entity decision (entity_action) over the frozen types/casts.
   pure_complete=1 when count==0 under an open gate (PE 0x805532 jbe ->
   flag clear, ZERO host calls). The host re-issues
   b18_entity_walk_type5_calls x 0x6e17c0, b18_entity_walk_rtti_casts x
   0xaf08b1 and b18_entity_walk_pathb_calls x 0x6da530 at the seam. */
typedef struct IsaacGameUpdateSliceB18WalkPlan {
  uint32_t type5_calls;
  uint32_t rtti_casts;
  uint32_t pathb_calls;
  uint32_t skip_count;
  uint32_t walked;
  uint32_t pure_complete;
} IsaacGameUpdateSliceB18WalkPlan;
static_assert(sizeof(IsaacGameUpdateSliceB18WalkPlan) == 24,
              "B18 walk plan ABI changed");

/* ABI v95 (record idx 10 R1): the A/B 409030-pair plan scratch — the host
   consumer reads it after a step to dispatch the typed ADVANCE/REWIND
   events with the exact PE targets. receiver_off = 0x38 (A) / 0x58 (B);
   path = ISAAC_FRAME_OPAQUE_409030_PATH_ADVANCE_MID (0) / REWIND (1) /
   NO_LOOP (2), -1 when the subobject was a pure no-op (field4==0 or flag14
   low==0; the PE ran the store-free epilogue). advance_target = trunc_sum
   on ADVANCE_MID (PE 0x4090d9 push eax) and length-1 on NO_LOOP when the
   advance is needed (PE 0x4090c7 push edi); else 0. float_10_out = the
   UNTRUNCATED sum bits the PE stores [state+0x10]= AFTER the advance on
   ADVANCE_MID (PE 0x4090e1..0x4090e6) — the host must store it after
   running 0x408d00 (the advance body may step the frame; 409030 overwrites
   it with sum). clear_flag_14 = 1 on NO_LOOP (PE 0x4090cf mov byte
   [state+0x14],0 — LOW byte only; the host clears the live low byte; the
   wasm applies the A-side low-byte clear to state->frame_opaque_4212c0_
   flag_4c so apply() agrees). */
typedef struct IsaacGameUpdateSlice4212c0Anm2Entry {
  uint32_t receiver_off;
  int32_t path;
  int32_t advance_target;
  uint32_t float_10_out;
  uint32_t clear_flag_14;
} IsaacGameUpdateSlice4212c0Anm2Entry;

typedef struct IsaacGameUpdateSlice4212c0Anm2Plan {
  IsaacGameUpdateSlice4212c0Anm2Entry entries[2];
  int32_t live;
  int32_t advance;
  int32_t rewind;
  int32_t pure;
} IsaacGameUpdateSlice4212c0Anm2Plan;

typedef struct IsaacGameUpdateSliceState {
  int32_t short_timer;
  int32_t position_reset_timer;
  uint32_t position_x_bits;
  uint32_t position_y_bits;
  int32_t secondary_timer;
  float decay_value;
  float transition_progress;
  float transition_rate;
  int32_t transition_mode;
  int32_t post_update_delay;
  int32_t gate_1d520;
  int32_t one_shot_1d63c;
  int32_t state_24ecc;
  int32_t value_24ed0;
  int32_t mode_24ed8;
  int32_t gate_1d654;
  int32_t gate_1ba78;
  int32_t gate_1b83c;
  int32_t predicate_1ba74;
  int32_t counter_265c0;
  int32_t item_overlay_state;
  int32_t menu_state_23a74;
  int32_t generic_prompt_active_object;
  int32_t generic_prompt_active_flag;
  int32_t generic_prompt_submitted_selection;
  int32_t generic_prompt_post_update_flag;
  int32_t skip_timed_transition_flag;
  uint32_t transition_color_r_bits;
  uint32_t transition_color_g_bits;
  uint32_t transition_color_b_bits;
  uint32_t transition_aux_bits;
  float timed_transition_progress;
  int32_t timed_transition_force_finish;
  int32_t status_22ed4;
  int32_t status_22edc;
  int32_t timed_transition_cleanup_mode;
  int32_t effect_counter_67788;
  int32_t effect_counter_68d6c;
  int32_t room_transition_mode_1830c;
  int32_t room_transition_marker_18318;
  int32_t room_transition_index_18900;
  int32_t room_transition_dimension_18904;
  int32_t frame_counter_264fc;
  int32_t frame_counter_264f8;
  int32_t fade_counter_26514;
  float fade_progress_26518;
  float shake_current_67738;
  float shake_target_6773c;
  float shake_step_67740;
  int32_t timer_269e0;
  int32_t list_count_67730;
  int32_t room_fx_counter_70d8;
  int32_t room_fx_value_70cc;
  int32_t room_fx_step_70d4;
  int32_t room_fx_limit_70dc;
  int32_t room_fx_value_70e8;
  int32_t room_fx_counter_70f4;
  int32_t room_fx_limit_70f8;
  int32_t room_fx_step_70f0;
  int32_t room_clear_delay_11ec;
  int32_t room_alive_12c0;
  int32_t room_alive_12c4;
  int32_t room_greed_wave_723c;
  int32_t room_type_8;
  int32_t room_desc_subtype;
  int32_t room_byte_7220;
  int32_t room_water_lerp_countdown_7298;
  int32_t room_boss_count_12c8;
  int32_t room_boss_count_12cc;
  int32_t room_boss_snapshot_7224;
  int32_t room_timer_722c;
  int32_t room_collectible_timer_7764;
  int32_t room_timer_7214;
  int32_t room_timer_706c;
  int32_t room_timer_7230;
  float room_water_amount_7240;
  float room_lava_intensity_7740;
  int32_t frame_opaque_4212c0_mode;
  int32_t frame_opaque_4212c0_secondary;
  int32_t frame_opaque_4212c0_field_3c;
  uint32_t frame_opaque_4212c0_flag_4c;
  uint32_t frame_opaque_4212c0_flag_111;
  int32_t room_desc_flags_44;
  int32_t room_desc_clear_count_4a;
  uint32_t byte_67744;
  int32_t room_flag_7894;
  int32_t room_flag_7769;
  int32_t engine_field_8;
  int32_t engine_field_c;
  float engine_float_22c;
  float engine_float_230;
  int32_t engine_field_4;
  int32_t engine_field_10;
  int32_t engine_field_14;
  int32_t engine_field_18;
  int32_t engine_field_1c;
  int32_t engine_field_20;
  int32_t engine_field_24;
  int32_t frame_opaque_98dba0_mode;
  uint32_t frame_opaque_98dba0_flag;
  int32_t frame_opaque_98dba0_counter;
  float frame_opaque_98dba0_float_170;
  float frame_opaque_98dba0_float_2d0;
  int32_t difficulty_269c8;
  int32_t engine_player_1bb74;
  int32_t room_ambient_count_7454;
  float room_ambient_intensity_7458;
  int32_t room_ambient_flag_745c;
  int32_t mode_26584;
  uint32_t flags_2654c;
  uint32_t game_flags_1839c;
  int32_t room_desc_short_ae;
  uint32_t hud_message_flag_8;
  uint32_t hud_message_played_64;
  int32_t rank_display_switch_after;
  int32_t rank_display_state_after;
  uint32_t rank_display_clear_3b0_out;
  uint32_t rank_display_tail_out;
  int32_t item_overlay_counter_11d1d0;
  uint32_t transition_tail_byte_29fb8;
  uint32_t fx_lerp_gate_676b4;
  float fx_cur_676b8;
  float fx_cur_676bc;
  float fx_cur_676c0;
  float fx_cur_676c4;
  float fx_cur_676c8;
  float fx_cur_676cc;
  uint32_t engine_anm2_loaded;
  uint32_t engine_anm2_slot_10c;
  uint32_t engine_anm2_bitflags_110;
  uint8_t global_tree_4aba0_result;
  uint8_t hud_history_latch_5c7c;
} IsaacGameUpdateSliceState;

/* ABI v95 (record idx 42 opaqueRoomUpdateTailPath): one captured trail-list
   entity pack (B20 pass1/pass2 loop, PE 0x0080608e..0x00806884). All fields
   u32 bits; NO uint8_t scalar params cross the ABI (low-byte tests re-narrow
   in the laws). */
#pragma pack(push, 1)
typedef struct IsaacGameUpdateSliceTailPathEntry {
  uint32_t type_28;         /* [entity+0x28] — pass1 filter + pass2 route */
  uint32_t flags_16c;       /* [entity+0x16c] — |0x4000 / |0x80 posts */
  uint32_t field_3c0;       /* [entity+0x3c0] — multi-spawn enter == 0 */
  uint32_t child_3bc;       /* [entity+0x3bc] — child ptr (chain continue) */
  uint32_t child_type_28;   /* [child+0x28] — chain continue type gate */
  uint32_t pos_x_bits;      /* f32 bits [entity+0x33c] — pair ±offset posts */
  uint32_t pos_y_bits;      /* f32 bits [entity+0x340] */
} IsaacGameUpdateSliceTailPathEntry;
#pragma pack(pop)
static_assert(sizeof(IsaacGameUpdateSliceTailPathEntry) == 28,
              "IsaacGameUpdateSliceTailPathEntry size");

#pragma pack(push, 1)
/* One B20 trail-loop iteration composed from the room-family laws
   (B20 v31/v32 by reference): pass1 filter + flag posts + pass2 route +
   pair offsets + chain gates + per-step host counts (0x0080608e..0x80680e). */
typedef struct IsaacGameUpdateSliceB20TrailFrame {
  int32_t pass1_match;          /* type ∈ {0x1c,0x13,0xef,0x59} 0x8060e3..fd */
  uint32_t flag_or_4000;        /* flags_16c | 0x4000 post 0x806135..145 */
  int32_t pass2_action;         /* FLAGGED=0/PAIR_X=1/PAIR_Y=2/DEFAULT=3
                                   0x806200 + type route 0x8064ab */
  uint32_t spawn_flag_or_80;    /* flags_16c | 0x80 post 0x8067f2 */
  int32_t multispawn_enter;     /* FLAGGED && field_3c0==0 0x806281 */
  int32_t chain_continue;       /* child walk gate 0x80635b (mode + range) */
  uint32_t pair_x_left_bits;    /* pos_x - 60.0 f32 0x806717 subss 0xbaa950 */
  uint32_t pair_x_right_bits;   /* pos_x + 60.0 f32 0x80678e addss */
  uint32_t pair_y_up_bits;      /* pos_y + 30.0 f32 0x806525 addss 0xbaa8d0 */
  uint32_t pair_y_down_bits;    /* pos_y - 30.0 f32 0x806590 subss */
  int32_t host_push;            /* pass1_match -> 0x42c920 vector push (HOST) */
  int32_t host_spawn;           /* pass2 action -> spawn 0x428b20 (HOST) */
  int32_t host_genrand;         /* FLAGGED/DEFAULT -> 0x6eef60 draws (HOST) */
} IsaacGameUpdateSliceB20TrailFrame;
#pragma pack(pop)
static_assert(sizeof(IsaacGameUpdateSliceB20TrailFrame) == 52,
              "IsaacGameUpdateSliceB20TrailFrame size");

#pragma pack(push, 1)
/* Record wire plan for opaqueRoomUpdateTailPath (B19 0x008055a7..0x00806043
   + B20 0x0080608e..0x00806884). */
typedef struct IsaacGameUpdateSliceTailPathPlan {
  int32_t b19_residual_kind;    /* 0 NONE / 1 HOST_REBUILD / 2 MONOLITHIC */
  int32_t b20_residual_kind;    /* 0 NONE / 1 HOST_TRAIL / 2 MONOLITHIC */
  int32_t list_count;           /* (int32)(end-begin)>>2 signed sar 0x8060c7 */
  int32_t pure_steps;           /* in-module iterations (<= MAX_NODES) */
  uint32_t host_rebuild;        /* 1 = B19 rebuild body host needed */
  uint32_t host_trail;          /* 1 = B20 trail body host needed */
  uint32_t host_push;           /* pass1 matches -> 0x42c920 vector push */
  uint32_t host_spawn;          /* pass2 spawn 0x428b20 calls */
  uint32_t host_multispawn_steps; /* FLAGGED child-chain steps (HOST) */
  uint32_t host_deallocate;     /* 0x40c740 trail vector free (once, HOST) */
  uint32_t host_genrand_draws;  /* host-reported 0x6eef60 draws (TYPED-HOST,
                                   capped at entry_capacity * draws-arm) */
} IsaacGameUpdateSliceTailPathPlan;
#pragma pack(pop)
static_assert(sizeof(IsaacGameUpdateSliceTailPathPlan) == 44,
              "IsaacGameUpdateSliceTailPathPlan size");
static_assert(offsetof(IsaacGameUpdateSliceTailPathPlan, b19_residual_kind) == 0,
              "IsaacGameUpdateSliceTailPathPlan b19_residual_kind offset");
static_assert(offsetof(IsaacGameUpdateSliceTailPathPlan, host_genrand_draws) == 40,
              "IsaacGameUpdateSliceTailPathPlan host_genrand_draws offset");

/* ABI v131 (update-v131-greed-probe-pack, record idx 30): one element of
   the greed-probe capture pack. Field-for-field mirror of
   IsaacRoomGreedProbeElem (room_pure_helpers.h) so the wire copies rows
   straight into the ABI v81 helpers consumed BY REFERENCE. */
#pragma pack(push, 1)
typedef struct IsaacGameUpdateSliceGreedProbeRow {
  uint32_t f2c;            /* [e+0x2c] must be 0 */
  uint32_t f3bc;           /* [e+0x3bc] must be 0 */
  uint32_t has_parent;     /* [e+0x1e68] != 0 */
  int32_t parent_161c;     /* [parent+0x161c] (valid iff has_parent) */
  int32_t self_161c;       /* [e+0x161c] */
  uint32_t parent_is_self; /* parent pointer == e */
  uint32_t f20a9;          /* byte [e+0x20a9] widened (low byte only) */
} IsaacGameUpdateSliceGreedProbeRow;
#pragma pack(pop)
static_assert(sizeof(IsaacGameUpdateSliceGreedProbeRow) == 28,
              "IsaacGameUpdateSliceGreedProbeRow size");

/* ABI v132 (update-v132-b16-spawn-pack, record idx 36): one enumerated
   type-7 spawn-walk hit (contracts-b16-spawn NOTES §2.2). */
#pragma pack(push, 1)
typedef struct IsaacGameUpdateSliceB16SpawnHitRow {
  uint32_t cell_index; /* y*w + x, the exact imul/add product
                          (PE 0x80518b/0x8052db); coords recoverable via
                          x = idx % w, y = idx / w */
  uint32_t entity_ptr; /* eax of 0x00af08b1 (__RTDynamicCast result) at
                          PE 0x8051cb (W) / 0x80531b (L); the handle every
                          downstream host effect fires on */
} IsaacGameUpdateSliceB16SpawnHitRow;
#pragma pack(pop)
static_assert(sizeof(IsaacGameUpdateSliceB16SpawnHitRow) == 8,
              "IsaacGameUpdateSliceB16SpawnHitRow size");
#define ISAAC_GAME_UPDATE_B16_SPAWN_MAX_HITS_PER_ARM 64

/* ABI v133 (update-v133-audio-music-pack, records idx26/27): one captured
   spawn-tail iteration (contracts-audio-music NOTES §2a). The seven
   genrand draws are the HOST's actual 0x6eef60 returns consumed verbatim;
   cos/sin are the HOST CRT results; px/py are the post-spawn readbacks. */
#pragma pack(push, 1)
typedef struct IsaacGameUpdateSliceTcaTailRow {
  uint32_t r_a;        /* draw 1 (spawn arg7 echo) */
  uint32_t r_b;        /* draw 2 -> f1 */
  uint32_t r_c;        /* draw 3 -> magnitude m */
  uint32_t r_d;        /* draw 4 -> height pre-angle */
  uint32_t r_e;        /* draw 5 -> speed */
  uint32_t r_f;        /* draw 6 -> threshold */
  uint32_t r_g;        /* draw 7 -> timer */
  uint32_t cos_h_bits; /* HOST 0x41d540 result on h */
  uint32_t sin_h_bits; /* HOST 0x41d520 result on h */
  uint32_t ent_px_bits;/* [ent+0x33c] readback */
  uint32_t ent_py_bits;/* [ent+0x340] readback */
} IsaacGameUpdateSliceTcaTailRow;
#pragma pack(pop)
static_assert(sizeof(IsaacGameUpdateSliceTcaTailRow) == 44,
              "IsaacGameUpdateSliceTcaTailRow size");
/* ABI v138 (update-v138-audio-alt-tail-pack, record idx27): ALT-tail
   per-iteration row (contracts-audio-head-83b0 NOTES 6C.2). DISTINCT
   typedef from TcaTailRow: the draws shift one letter (no r_a slot;
   r_b IS the spawn arg-pack echo @0x7f9093). */
typedef struct IsaacGameUpdateSliceTcaAltTailRow {
  uint32_t r_b;         /* draw 1 (spawn arg echo) @0x7f8ef8 */
  uint32_t r_c;         /* draw 2 -> f1 @0x7f8f00 */
  uint32_t r_d;         /* draw 3 -> magnitude m @0x7f8f32 */
  uint32_t r_e;         /* draw 4 -> height @0x7f8fb6 */
  uint32_t r_f;         /* draw 5 -> speed @0x7f8fec */
  uint32_t r_g;         /* draw 6 -> threshold @0x7f9143 */
  uint32_t r_h;         /* draw 7 -> timer @0x7f9185 */
  uint32_t cos_h_bits;  /* HOST 0x41d540 result @0x7f9023 */
  uint32_t sin_h_bits;  /* HOST 0x41d520 result @0x7f9052 */
  uint32_t item_px_bits;/* [item+0x33c] readback @0x7f90cf */
  uint32_t item_py_bits;/* [item+0x340] readback @0x7f90d9 */
} IsaacGameUpdateSliceTcaAltTailRow;
#define ISAAC_GAME_UPDATE_B1RAIN_SPAWN_MAX_ROWS 64

/* ABI v139 (update-v139-b1-rain-pack, records idx13/idx35): ONE row per
   executed shared-half spawn iteration (contracts-b1-rain NOTES 2.2;
   region 0x00802A80..0x00802E0D is DOUBLE-BOOKED -- idx13's spawn half
   carries ALL of idx35). world/repos xy are f32 BITS (v131 no-narrow). */
#pragma pack(push, 1)
typedef struct IsaacGameUpdateSliceB1RainSpawnRow {
  uint32_t iter_index;         /* i, PE order (dense from 0) */
  uint32_t shuffle_seed_in;    /* esi at iteration entry (row0 = seed0) */
  uint32_t shuffle_seed_out;   /* esi after SECOND xorshift (chain-closed) */
  uint32_t corner_pick;        /* seed_out & 3 -> corner table */
  uint32_t world_x;            /* f32 bits: row-term*40+40 */
  uint32_t world_y;            /* f32 bits: col-term*40+120 */
  uint32_t search_ok;          /* 0x813520 return != 0 */
  uint32_t search_draws;       /* MT draws inside outer search */
  uint32_t create_entity_ptr;  /* 0x428b20 return (host handle, evidence) */
  uint32_t bind_repositioned;  /* bind took the nested-search arm */
  uint32_t bind_repos_draws;   /* MT draws inside BIND nested search */
  uint32_t repos_x;            /* f32 bits: ent+0x33c (iff repositioned) */
  uint32_t repos_y;            /* f32 bits: ent+0x340 */
  uint32_t bind_store_7764;    /* bind wrote Room+0x7764=-1 */
} IsaacGameUpdateSliceB1RainSpawnRow;   /* 14 words = 56 bytes */
#pragma pack(pop)

/* ABI v140 (update-v140-awards-spawn-loop-pack, record idx29): ONE row per
   executed SPAWN_LOOP iteration (PE 0x007fb7be..0x007fb8d1; contracts-awards
   NOTES section 6 companion). Every field is a host-observed leaf of the
   frozen v85 per-iteration law: the pos-walk f32 pair + the 0x7e90f0 draw
   (create-relay args echo) and the created-entity readbacks the law's
   decisions consume. Grid idx / re-dispatch / variant latch are COMPUTED
   in-module from these (frozen laws, never captured). */

#pragma pack(push, 1)
typedef struct IsaacGameUpdateSliceAwardLoopRow {
  uint32_t pos_x_bits;       /* HOST 0x00813520 out f32 bits ([ebp-0x9c]) */
  uint32_t pos_y_bits;       /* HOST 0x00813520 out f32 bits ([ebp-0x7c]) */
  uint32_t draw;             /* 0x007e90f0 return (last create-relay arg) */
  uint32_t entity_type_28;    /* [edi+0x28] readback -> door arm gate */
  uint32_t entity_variant_2c; /* [edi+0x2c] -> 0x6ee340 gate + door arm */
  uint32_t entity_field_30;   /* [edi+0x30] al==0 variant re-latch source */
  uint32_t door_gate_al;      /* HOST 0x00822820(room, grid_idx) al */
  uint32_t sfx_owner;         /* HOST 0x009be080(0x29e, Game+0x1baa8, 1) */
} IsaacGameUpdateSliceAwardLoopRow;   /* 8 words = 32 bytes */
#pragma pack(pop)

static_assert(sizeof(IsaacGameUpdateSliceAwardLoopRow) == 32,
              "IsaacGameUpdateSliceAwardLoopRow size");
static_assert(offsetof(IsaacGameUpdateSliceAwardLoopRow, entity_variant_2c) == 16,
              "IsaacGameUpdateSliceAwardLoopRow variant offset");
#define ISAAC_GAME_UPDATE_AWARD_LOOP_MAX_ROWS 16
#pragma pack(push, 1)
typedef struct IsaacGameUpdateSliceBBlockRow {
  /* IsaacRoomCountSrc per-element legs (id is the pinned 0xb1 arg;
     mode_2663c / mode_26584 / mgr_seed are block-level lanes). */
  uint32_t f13c0;        /* [edi+0x13c0] boost field */
  uint32_t gate_202c;    /* byte [edi+0x202c] */
  uint32_t gate_20a9;    /* byte [edi+0x20a9] */
  int32_t h_count15;     /* recursed count(0x15) result */
  int32_t h_count40;     /* recursed count(0x40) result */
  int32_t h_count4b;     /* recursed count(0x4b) result */
  uint32_t h_bd_r;       /* [ret+0x5c] after HOST 0x740bc0 */
  uint32_t h_rng_raw;    /* HOST 0x7e9020 draw (raw) */
  uint32_t has_8b;       /* HOST 0x7706e0(0x8b) al */
  uint32_t has_1ca;      /* HOST 0x7706e0(0x1ca) al */
  uint32_t has_1b7;      /* HOST 0x7706e0(0x1b7) al */
  uint32_t slot0;        /* [edi+0x16c0] */
  uint32_t slot1;        /* [edi+0x16c4] */
  uint32_t block_nonnull;/* [edi+0x17c4] != 0 */
  uint32_t block0;       /* [ptr] */
  uint32_t block4;       /* [ptr+4] */
  uint32_t flag_17cc;    /* byte [edi+0x17cc] */
  uint32_t item_begin;   /* [edi+0x1748] */
  uint32_t item_end;     /* [edi+0x174c] */
  uint32_t item_w0;      /* movsx word [edx+i*4] */
  uint32_t item_w1;      /* movsx word [edx+i*4+2] */
  uint32_t byte_begin;   /* [edi+0x1fe0] */
  uint32_t byte_end;     /* [edi+0x1fe4] */
  uint32_t byte_val;     /* zero-ext [ecx+i] */
  uint32_t f2ef8;        /* [edi+0x2ef8] */
  uint32_t byte_2ef0;    /* byte [edi+0x2ef0] */
  uint32_t h_adder_17;   /* HOST 0x930aa0 return */
  uint32_t f18dc;        /* [edi+0x18dc] */
  uint32_t f18e0;        /* [edi+0x18e0] */
  /* Probe C roll leaves on the same element. */
  uint32_t roll_f3fc;          /* [this+0x3fc] followup gate */
  uint32_t roll_byte_173;      /* byte [this+0x173] */
  uint32_t roll_old_flags_1574;/* [this+0x1574] pre-OR (host applies back) */
} IsaacGameUpdateSliceBBlockRow;   /* 32 words = 128 bytes */
#pragma pack(pop)

static_assert(sizeof(IsaacGameUpdateSliceBBlockRow) == 128,
              "IsaacGameUpdateSliceBBlockRow size");
static_assert(offsetof(IsaacGameUpdateSliceBBlockRow, roll_old_flags_1574) == 124,
              "IsaacGameUpdateSliceBBlockRow flags offset");
#define ISAAC_GAME_UPDATE_B_BLOCK_MAX_ROWS 8

/* ABI v141 (update-v141-b-block-probe-pack, record idx29): ONE row per
   executed 0xb-block iteration (PE 0x007fb9cc..0x7fbb04). Captured legs of
   the frozen room-pure ABI v86 probes isaac_room_idx29_at_9b92c0 /
   isaac_room_count_7cb6e0_plan / isaac_room_roll_7c3980_core consumed BY
   REFERENCE; see the RuntimeInputs tail for the shared lanes. */




#define ISAAC_GAME_UPDATE_TCA_TAIL_MAX_ROWS 8

typedef struct IsaacGameUpdateSliceRuntimeInputs {
  uint32_t monotonic_counter_low;
  uint32_t monotonic_counter_high;
  uint32_t monotonic_baseline_low;
  uint32_t monotonic_baseline_high;
  uint32_t global_clear_skip_997a;
  uint32_t global_menu_enable_2a3a5;
  uint32_t global_menu_guard_4b3ca;
  uint32_t global_range_byte_length;
  uint32_t challenge_0x123;
  uint32_t frame_opaque_4212c0_slot_char;
  IsaacGameUpdateDoorSlotRuntime door_slots[8];
  uint32_t engine_call_room;
  uint32_t engine_call_dim;
  uint32_t engine_game_18304;
  uint32_t frame_opaque_98dba0_bvar2;
  float frame_opaque_98dba0_manager_2a35c;
  uint32_t frame_opaque_98dba0_game_216e9;
  uint32_t frame_opaque_4257b0_id_count;
  uint32_t frame_opaque_4257b0_list_count;
  uint32_t room_grid_cells;
  uint32_t room_b8_blob_ready;
  uint32_t engine_player_count;
  uint32_t engine_player_blob_ready;
  uint32_t player_hud_occupied_mask;
  uint32_t manager_history_count;
  uint32_t manager_stat_flag;
  uint32_t ambient_desc_present;
  uint32_t ambient_desc_id;
  uint32_t ambient_player_count;
  uint32_t ambient_vel_x_7460;
  uint32_t ambient_vel_y_7464;
  uint32_t ambient_stage;
  uint32_t ambient_stage_type;
  uint32_t ambient_stage_id;
  uint32_t ambient_room_subtype_1bb0;
  uint32_t ambient_room_active;
  uint32_t ambient_room_entry_11f0;
  uint32_t player_hud_blob_ready;
  IsaacPlayerHudSlotPack player_hud_slots[ISAAC_PLAYER_HUD_MAX_SLOTS];
  uint32_t mid_restock_owner_0x209;
  uint32_t pm_intensity_player_count;
  float pm_intensity_sfx_playing;
  uint32_t pm_intensity_blob_ready;
  uint32_t pm_intensity_raw_1ea8[ISAAC_FRAME_OPAQUE_4257B0_MAX_PLAYERS];
  uint32_t pm_intensity_flags_168[ISAAC_FRAME_OPAQUE_4257B0_MAX_PLAYERS];
  uint32_t pm_intensity_dead_173[ISAAC_FRAME_OPAQUE_4257B0_MAX_PLAYERS];
  uint32_t b1_sfx_ready;
  uint32_t b1_buffer_ready;
  uint32_t b1_desc_field_40;
  uint32_t b1_nested_field_10;
  uint32_t b1_begin_183a4;
  uint32_t b1_end_183a8;
  uint32_t mid_restock_desc_ready;
  uint32_t mid_restock_desc_ac;
  uint32_t mid_restock_desc_ae;
  uint32_t mid_restock_desc_seed58;
  uint32_t h5_body_blob_ready;
  float ambient_room_f14;
  float ambient_room_f18;
  float ambient_room_f1c;
  float ambient_room_f20;
  uint32_t ambient_room_1d18;
  uint32_t b3b7_sparse_ready;
  uint32_t b3b7_te_byte_7321;
  uint32_t b3b7_te_begin;
  uint32_t b3b7_te_end;
  uint32_t b3b7_desc_type0;
  uint32_t b3b7_tree_count_7238;
  uint32_t b3b7_width_c;
  uint32_t b3b7_height_10;
  uint32_t b9b11_inputs_ready;
  uint32_t b9b11_challenge_result_nonzero;
  uint32_t b9b11_room_byte_11f4;
  uint32_t b9b11_room_byte_1d0d;
  uint32_t b9b11_room_byte_7321;
  uint32_t b9b11_list_begin_7314;
  uint32_t b9b11_list_end_7318;
  uint32_t update_list_blob_ready;
  int32_t update_list_timers[ISAAC_UPDATE_LIST_MAX_NODES];
  uint32_t player_flag_410_ready;
  uint32_t player_flag_410_count;
  uint32_t opaque_0092e300_ready;
  uint32_t opaque_0092e300_group_count;
  uint32_t opaque_0092e300_packs_ready;
  uint32_t opaque_0092e300_group_enabled[ISAAC_OPAQUE_0092E300_MAX_GROUPS];
  uint32_t opaque_0092e300_group_entry_count[ISAAC_OPAQUE_0092E300_MAX_GROUPS];
  uint32_t opaque_857450_ready;
  uint32_t opaque_857450_manager_4abbc;
  uint32_t menu_aux_tree_ready;
  uint32_t menu_aux_tree_root;
  uint32_t menu_aux_tree_node_count;
  uint32_t menu_aux_accounting_lo;
  uint32_t menu_aux_accounting_hi;
  uint32_t menu_aux_tree_left[ISAAC_MENU_AUX_TREE_MAX_NODES];
  uint32_t menu_aux_tree_right[ISAAC_MENU_AUX_TREE_MAX_NODES];
  uint32_t menu_aux_tree_flag_1c[ISAAC_MENU_AUX_TREE_MAX_NODES];
  uint32_t menu_aux_tree_isnil[ISAAC_MENU_AUX_TREE_MAX_NODES];
  uint32_t menu_aux_tree_payload_present[ISAAC_MENU_AUX_TREE_MAX_NODES];
  uint32_t menu_aux_tree_payload_size[ISAAC_MENU_AUX_TREE_MAX_NODES];
  uint32_t genrand_mt_ready;
  uint32_t genrand_index_in;
  uint32_t genrand_mode_flag;
  uint32_t frame_opaque_4257b0_post_pass_a_list_count;
  uint32_t menu_aux_sentinel_ready;
  uint32_t menu_aux_sentinel_addr;
  uint32_t menu_aux_menu_addr;
  uint32_t hud_message_text_ptr_54;
  uint32_t hud_message_text_words_0;
  uint32_t hud_message_text_words_1;
  uint32_t rank_display_switch;
  uint32_t rank_display_byte_22d;
  uint32_t rank_display_dword_158;
  uint32_t rank_display_byte_168;
  uint32_t rank_display_dword_248;
  uint32_t rank_display_byte_119;
  uint32_t rank_display_ptr_44;
  uint32_t rank_display_byte_54;
  uint32_t rank_display_byte_39c;
  uint32_t rank_display_byte_39d;
  uint32_t rank_display_byte_3b0;
  uint32_t rank_display_disp_word_0;
  uint32_t rank_display_disp_word_1;
  uint32_t rank_display_disp_word_2;
  uint32_t rank_display_disp_word_3;
  uint32_t rank_display_disp_eos;
  uint32_t rank_display_is_playing_al;
  uint32_t rank_display_st_upd;
  uint32_t rank_display_st_after_loading;
  uint32_t rank_display_st_after_idle;
  uint32_t rank_display_st_after_display;
  uint32_t lua_frame_unref_ready;
  uint32_t lua_frame_unref_flag_byte;
  uint32_t state24ecc_22ed0_ready;
  uint32_t state24ecc_22ed0;
  uint32_t sfx_stop_ready;
  uint32_t sfx_stop_span;
  uint32_t sfx_stop_voices_190;
  uint32_t sfx_stop_enabled_198;
  float fx_step_676d0;
  float fx_step_676d4;
  float fx_step_676d8;
  float fx_step_676dc;
  float fx_step_676e0;
  float fx_step_676e4;
  float fx_goal_676e8;
  float fx_goal_676ec;
  float fx_goal_676f0;
  float fx_goal_676f4;
  float fx_goal_676f8;
  float fx_goal_676fc;
  uint32_t host_fun_746560_post_ready;
  uint32_t frame_opaque_98dba0_timer_ready;
  uint32_t frame_opaque_98dba0_timer_264e8;
  uint32_t pm_death_player_count;
  uint32_t pm_death_blob_ready;
  uint32_t pm_death_anim_7c[ISAAC_FRAME_OPAQUE_4257B0_MAX_PLAYERS];
  uint32_t pm_death_twin_anim_7c[ISAAC_FRAME_OPAQUE_4257B0_MAX_PLAYERS];
  uint32_t pm_death_dead_173[ISAAC_FRAME_OPAQUE_4257B0_MAX_PLAYERS];
  uint32_t pm_death_anim_8c[ISAAC_FRAME_OPAQUE_4257B0_MAX_PLAYERS];
  uint32_t pm_death_twin_null[ISAAC_FRAME_OPAQUE_4257B0_MAX_PLAYERS];
  uint32_t pm_death_twin_anim_8c[8];
  uint32_t frame_opaque_98dba0_timer_pure_ready;
  uint32_t frame_opaque_98dba0_timer_sample;
  uint32_t frame_opaque_98dba0_timer_use_crt_rand;
  uint32_t frame_opaque_98dba0_timer_x264ec_bits;
  uint32_t frame_opaque_98dba0_timer_y264f0_bits;
  uint32_t frame_opaque_98dba0_timer_cos_bits_lo;
  uint32_t frame_opaque_98dba0_timer_cos_bits_hi;
  uint32_t frame_opaque_98dba0_timer_sin_bits_lo;
  uint32_t frame_opaque_98dba0_timer_sin_bits_hi;
  uint32_t frame_opaque_4257b0_blob_ready;
  uint32_t frame_opaque_4257b0_list_begin;
  uint32_t frame_opaque_4257b0_list_end;
  uint32_t frame_opaque_4257b0_list_cap;
  uint32_t frame_opaque_4257b0_post_list_begin;
  uint32_t frame_opaque_4257b0_post_list_end;
  uint32_t frame_opaque_4257b0_idvec_begin;
  uint32_t frame_opaque_4257b0_idvec_end;
  uint32_t frame_opaque_4257b0_ctr_begin;
  uint32_t frame_opaque_4257b0_ctr_end;
  uint32_t frame_opaque_4257b0_initial_byte13;
  uint32_t frame_opaque_4257b0_p_ptrs[ISAAC_FRAME_OPAQUE_4257B0_MAX_PLAYERS];
  int32_t frame_opaque_4257b0_p_ids_1618[ISAAC_FRAME_OPAQUE_4257B0_MAX_PLAYERS];
  int32_t frame_opaque_4257b0_p_161cs[ISAAC_FRAME_OPAQUE_4257B0_MAX_PLAYERS];
  uint32_t frame_opaque_4257b0_q_ptrs[ISAAC_FRAME_OPAQUE_4257B0_MAX_PLAYERS];
  int32_t frame_opaque_4257b0_q_161cs[ISAAC_FRAME_OPAQUE_4257B0_MAX_PLAYERS];
  int32_t frame_opaque_4257b0_q_ids_1618[ISAAC_FRAME_OPAQUE_4257B0_MAX_PLAYERS];
  uint32_t frame_opaque_4257b0_qq_ptrs[ISAAC_FRAME_OPAQUE_4257B0_MAX_PLAYERS];
  int32_t frame_opaque_4257b0_qq_161cs[ISAAC_FRAME_OPAQUE_4257B0_MAX_PLAYERS];
  uint32_t frame_opaque_4257b0_p_chars_13c0[ISAAC_FRAME_OPAQUE_4257B0_MAX_PLAYERS];
  uint32_t frame_opaque_4257b0_elem_ids[ISAAC_FRAME_OPAQUE_4257B0_MAX_ELEMS];
  uint32_t frame_opaque_4257b0_elem_sub_ptrs[ISAAC_FRAME_OPAQUE_4257B0_MAX_ELEMS];
  uint32_t frame_opaque_4257b0_elem_sub_los[ISAAC_FRAME_OPAQUE_4257B0_MAX_ELEMS];
  uint32_t frame_opaque_4257b0_elem_sub_his[ISAAC_FRAME_OPAQUE_4257B0_MAX_ELEMS];
  uint32_t frame_opaque_4257b0_list_lo[ISAAC_FRAME_OPAQUE_4257B0_MAX_ELEMS];
  uint32_t frame_opaque_4257b0_list_hi[ISAAC_FRAME_OPAQUE_4257B0_MAX_ELEMS];
  uint32_t frame_opaque_4257b0_list_slot8[ISAAC_FRAME_OPAQUE_4257B0_MAX_ELEMS];
  uint32_t frame_effect_shell_ready;
  uint32_t frame_effect_shell_room_18304;
  uint32_t frame_effect_shell_room_182d0;
  uint32_t frame_effect_shell_room_byte1;
  uint32_t frame_effect_rewind_ready;
  uint32_t frame_effect_rewind_guard_269ea;
  uint32_t frame_effect_rewind_guard_269eb;
  uint32_t frame_effect_rewind_guard_68d70;
  uint32_t engine_anm2_latch_ready;
  uint32_t engine_anm2_latch;
  uint32_t frame_opaque_98dba0_timer_mt_ready;
  uint32_t frame_opaque_98dba0_timer_mt_in;
  uint32_t engine_anm2_blob_ready;
  uint32_t engine_anm2_layer_count;
  uint32_t engine_anm2_extra_count;
  uint32_t engine_anm2_bitflags_110_pre;
  uint8_t engine_anm2_layer_names[ISAAC_GAME_UPDATE_ANM2_MAX_LAYERS][ISAAC_GAME_UPDATE_ANM2_NAME_BYTES];
  uint8_t engine_anm2_extra_names[ISAAC_GAME_UPDATE_ANM2_MAX_EXTRAS][ISAAC_GAME_UPDATE_ANM2_NAME_BYTES];
  uint32_t global_tree_4aba0_blob_ready;
  uint32_t global_tree_4aba0_count;
  uint32_t global_tree_4aba0_begin;
  uint32_t global_tree_4aba0_end;
  IsaacGlobalTree4aba0Node global_tree_4aba0_nodes[ISAAC_GLOBAL_TREE_4ABA0_MAX_NODES];
  uint8_t hud_history_slot_flag0;
  uint8_t hud_history_slot_flag1;
  uint32_t hud_stat_countdown_ready;
  uint32_t hud_stat_player_list_begin;
  uint32_t hud_stat_player_list_end;
  int32_t hud_stat_countdown[ISAAC_HUD_STAT_COUNTDOWN_COUNT];
  uint32_t hud_stat_walk_blob_ready;
  uint32_t hud_stat_owner_byte;
  uint32_t hud_stat_container_begin;
  uint32_t hud_stat_container_end;
  uint32_t hud_stat_walk_probe1;
  uint32_t hud_stat_walk_probe2;
  uint32_t hud_stat_walk_probe3;
  uint32_t hud_stat_game_1adb4;
  uint32_t hud_stat_slot_ptr_0;
  uint32_t hud_stat_slot_ptr_1;
  IsaacGameUpdateSliceHudStatSlotState hud_stat_slots[2][10];
  IsaacGameUpdateSliceHudStatPlayerPack hud_stat_players[ISAAC_HUD_STAT_WALK_MAX_PLAYERS];
  uint32_t opaque_0092e300_voice_blob_ready;
  uint32_t opaque_0092e300_voice_count;
  int32_t opaque_0092e300_first_voice[ISAAC_OPAQUE_0092E300_MAX_GROUPS];
  IsaacGameUpdateSliceOpaque0092e300VoicePack opaque_0092e300_voices[ISAAC_OPAQUE_0092E300_MAX_VOICES];
  uint32_t opaque_0092e300_pad_6692;
  uint32_t opaque_0092f1c0_ready;
  uint32_t opaque_0092f1c0_mode;
  uint32_t opaque_0092f1c0_counter;
  uint32_t opaque_008318a0_ready;
  uint32_t opaque_008318a0_mode;
  uint32_t sound_group_walk_ready;
  uint32_t frame_opaque_4212c0_pair_ready;
  uint32_t frame_opaque_4212c0_field_5c;
  uint32_t frame_opaque_4212c0_flag_6c;
  uint32_t frame_opaque_4212c0_probe_ready;
  uint32_t frame_opaque_4212c0_probe_resolved;
  uint32_t frame_opaque_4212c0_add0_field_4;
  uint32_t frame_opaque_4212c0_add0_list_count;
  int32_t frame_opaque_4212c0_add0_match_index;
  uint32_t frame_opaque_4212c0_add0_bitfield_18;
  /* ABI v92: FUN_0098dba0 player-vector span capture (Game+0x1baa8/+0x1baac).
     ready=0 keeps the pre-v92 always-host walk edge. begin/end are the raw
     vector pointers; count is (end-begin) SAR 2, FULL dword. */
  uint32_t frame_opaque_98dba0_walk_ready;
  uint32_t frame_opaque_98dba0_walk_begin;
  uint32_t frame_opaque_98dba0_walk_end;
  /* ABI v93: record idx 9 (0x008ef990) iterate-arm JOIN blob capture
     (PE 0x8efc92 mov eax,[esp+0x10] / cmp [edi+8],eax / je 0x8efe04; the
     SFX path 0x8efca9..0x8efce9 calls the RTE 956780 prep then Play
     0x92dc30). P = the mode-0xe listener-probe out slot [esp+0x10];
     idx8 = [edi+8] == mode_24ed8 (state24ecc+8). ready=0 keeps the
     pre-v93 always-host JOIN with no proof event. The 956780 gate operands
     are host-resolved at the seam (map lookup node byte +0xd, dword +0x10,
     node vs sentinel) and fed to the RTE v13 gate law in-module. */
  uint32_t state24ecc_8ef990_join_ready;
  uint32_t state24ecc_8ef990_join_probe;
  uint32_t state24ecc_8ef990_join_idx8;
  uint32_t state24ecc_8ef990_956780_game;
  uint32_t state24ecc_8ef990_956780_node_bd;
  uint32_t state24ecc_8ef990_956780_node_f10;
  uint32_t state24ecc_8ef990_956780_node_ptr;
  uint32_t state24ecc_8ef990_956780_sentinel;
  /* ABI v95: FUN_00956110 phone-home probe sample capture (record idx 32,
     both walk call sites 0x98dcb5 / 0x98ddcd; the site id is
     events->frame_opaque_98dba0_site). ready=0 keeps the pre-v95 always-host
     probe with no proof event. manager_mode = [Manager+8] (PE 0x956120),
     global_c71690 = [0xc71690] (PE 0x956126) — BOTH full-dword gate operands.
     mp_begin/mp_end = Manager+0x4b3d8/+0x4b3dc (PE 0x95614e/0x956154);
     arg2 = the walk's id arg (site 1: player_id [player+0x1618]; site 2:
     [rtti_obj+0x378]->[+0xc] or 0xdeadbeef); net_host_ok = 0x864c30 al!=0
     (PE 0x95613e); net_out_byte = the probe out byte [ebp+0xb] (PE 0x956142);
     vtable_results[count] = per-entry al of [[entry]+0x30](entry,arg1)
     (PE 0x956171..0x95617c); general_result = the [container+0x74] callback
     al (PE 0x9561ca). */
  uint32_t frame_opaque_98dba0_956110_ready;
  uint32_t frame_opaque_98dba0_956110_manager_mode;
  uint32_t frame_opaque_98dba0_956110_global_c71690;
  uint32_t frame_opaque_98dba0_956110_mp_begin;
  uint32_t frame_opaque_98dba0_956110_mp_end;
  uint32_t frame_opaque_98dba0_956110_arg2;
  uint32_t frame_opaque_98dba0_956110_net_host_ok;
  uint32_t frame_opaque_98dba0_956110_net_out_byte;
  uint32_t frame_opaque_98dba0_956110_vtable_count;
  uint32_t frame_opaque_98dba0_956110_vtable_results[ISAAC_GAME_UPDATE_956110_MAX_VTABLE];
  uint32_t frame_opaque_98dba0_956110_general_result;
  /* ABI v95 (record idx 3, 0x0092f1c0): gate-1ba78 receiver captures for
     the case-1/2 pure-tail laws (intended offsets @6872/@6876; coordinator
     merge fixes finals). limit = [recv+8] (PE 0x92fa0c mov ecx,[ebx+8] /
     0x92feaa cmp eax,[ebx+8]); field_14 = [recv+0x14] BYTE (PE 0x92fe51
     cmp byte [ebx+0x14],0 / 0x92fe90 cmp byte [ebx+0x14],0 — LOW-BYTE
     gate; travels un-narrowed as u32, the law re-narrows with & 0xff). */
  uint32_t opaque_0092f1c0_limit;
  uint32_t opaque_0092f1c0_field_14;
  /* ABI v95 (record idx 47 STOP fold of 0x0092e230): per-voice capture
     blob. sfx_stop_fold_ready = 1 only when the host captured the voices
     at a quiescent seam (the record RE-READS [entry+0x190] and the channel
     pointer per iteration; the blob freezes them). voices[i] is the 6-field
     pack (channel_null / pending_09 / probe_first / probe_second /
     channel_null_reload / voices_reloaded); probe results are device
     vtbl[0x38] return values consumed BY REFERENCE (record-1 v85/v88
     precedent). Offsets fixed by the coordinator merge (v3 table). */
  uint32_t sfx_stop_fold_ready;
  uint32_t sfx_stop_voice_count;
  IsaacGameUpdateSliceSfxStopVoicePack
      sfx_stop_voices[ISAAC_SFX_STOP_FOLD_MAX_VOICES];
  /* ABI v95 (record idx 10 R1, 0x004212c0): A/B 409030-pair capture pack.
     receiver Game+0x1d2ec; A = +0x38 (Game+0x1d324), B = +0x58 (Game+0x1d344).
     ab_pack_ready gates the pack (ready=0 keeps the pre-v95 always-host pair
     arm). a/b_float_10 = float32 bits [Game+0x1d334]/[Game+0x1d354] (frame,
     pre-tick). a/b_layer_104 = float32 bits [[Game+0x1d324]+0x104] /
     [[Game+0x1d344]+0x104] (owner ANM2 _playbackSpeed, PE 0x40905e).
     a/b_frame_bound = int32 [data+0x30] via field4 ([Game+0x1d328]+0x30 /
     [Game+0x1d348]+0x30), the SIGNED length compare operand (PE 0x409076).
     a/b_loop_flag = byte [data+0x34] via field4 (PE 0x40908e), the REWIND
     gate. The pair decision is the ANM2 state-update plan BY REFERENCE
     (frame-opaque 409030 laws); 0x408d00/0x40a1b0 fire as typed host events.
     Offsets fixed by the coordinator merge (v3 table). */
  uint32_t frame_opaque_4212c0_ab_pack_ready;
  uint32_t frame_opaque_4212c0_a_float_10;
  uint32_t frame_opaque_4212c0_b_float_10;
  uint32_t frame_opaque_4212c0_a_layer_104;
  uint32_t frame_opaque_4212c0_b_layer_104;
  uint32_t frame_opaque_4212c0_a_frame_bound;
  uint32_t frame_opaque_4212c0_b_frame_bound;
  uint32_t frame_opaque_4212c0_a_loop_flag;
  uint32_t frame_opaque_4212c0_b_loop_flag;
  /* ABI v95 (record idx 35 opaqueRoomUpdateTailRain, B15 rain spawn loop
     0x00802a80..0x00802e0d): rain-frame capture blob. ready=0 keeps the
     pre-v95 monolithic record; ready=1 drives the in-module loop-frame
     laws + typed carriers. Host resolves at the seam:
       seed_58       = [[owner]+0x58]  (PE 0x00802bf0 mov esi,[eax+0x58],
                      owner = [Room+4], the B1/rain shuffle RNG seed)
       quality       = 0x7cb6e0(owner) result (PE 0x00802b92; owner =
                      0x9be6b0(0x89) result, 0x00802b7d)
       begin/end     = Game+0x183a4/+0x183a8 decor buffer span (PE
                      0x00802b4e..0x00802b53 gate + 0x00802bb6 count)
       room_w_c/h_10 = Room+0xc / Room+0x10 (corner table 0x00802aa9 +
                      idiv width 0x00802d48)
       genrand_count = host-counted Isaac::genrand_int32 draws inside the
                      host 0x00813520 position search (typed-host RNG via
                      roomGenrandNext; capped at GENRAND_MAX_SAMPLES)
       genrand_mt_in = the genrand scratch index_in at this boundary
                      (in-module draw arm, v52 H5 precedent)
       slot_f0/f4/f8/f34[8] = per-iteration slot fields AFTER the host
                      0x78-byte swap (a1=+0 a2=+4 a6=+8 a7=+0x34, PE
                      0x00802dc2/0x00802dbf/0x00802db0/0x00802d69)
       search_results[8] = the 0x00813520 al/return per iteration (host,
                      a3 of the relay, PE 0x00802dbe)
     Coordinated slot caps: LOOP_MAX_STEPS = 8 (spawn_count =
     min(quality {4,6,8}, byte_len/0x78) <= 8). */
  uint32_t b15_rain_ready;
  uint32_t b15_rain_seed_58;
  uint32_t b15_rain_quality;
  uint32_t b15_rain_begin_183a4;
  uint32_t b15_rain_end_183a8;
  uint32_t b15_rain_room_w_c;
  uint32_t b15_rain_room_h_10;
  uint32_t b15_rain_genrand_count;
  uint32_t b15_rain_genrand_mt_in;
  uint32_t b15_rain_slot_f0[ISAAC_GAME_UPDATE_B15_RAIN_LOOP_MAX_STEPS];
  uint32_t b15_rain_slot_f4[ISAAC_GAME_UPDATE_B15_RAIN_LOOP_MAX_STEPS];
  uint32_t b15_rain_slot_f8[ISAAC_GAME_UPDATE_B15_RAIN_LOOP_MAX_STEPS];
  uint32_t b15_rain_slot_f34[ISAAC_GAME_UPDATE_B15_RAIN_LOOP_MAX_STEPS];
  uint32_t b15_rain_search_results[ISAAC_GAME_UPDATE_B15_RAIN_LOOP_MAX_STEPS];
  /* ABI v95 (record idx 23 opaqueRoomUpdateClearPath): game-mode sample
     [Game+0] used by the player-flag-clear gate (PE 0x00804212 mov eax,
     [edx]; 0x00804214 cmp eax,0xd — FULL-DWORD equality; 0x00804219 cmp
     eax,1 jl + 0x0080421e cmp eax,6 jg — SIGNED range). default 0 keeps
     the gate OPEN (mode 0 < 1 -> clear), preserving the pre-wire
     unconditional clear-path event for hosts that do not sample it. */
  uint32_t clear_path_game_mode_0;
  /* ABI v95 (record idx 10 R4 equal-flags capture, shared with record idx 4
     via the 0x40add0 call at 0x831a7b): the NON-EMPTY animation-name walk
     (PE 0x40ae05..0x40ae41, 0 E8 / 0 stores) runs ENTIRELY in-module via
     the frozen frame-opaque 40add0 laws (first match index over the
     per-entry equal-flag bytes, then the bit test of [A+0x18]). The host
     resolves each stride-0x18 entry's two-byte strcmp vs 'End'
     (0xb1c00c) into one byte of the lane; ready=0 or list_count over the
     cap keeps the exact v91/v94 host-resolved matchIndex path (a host that
     sees more than ISAAC_FRAME_OPAQUE_40ADD0_MAX_ENTRIES live entries must
     NOT set ready). Lane is inline bytes — no uint8_t scalar crosses the
     ABI. Offsets fixed by the coordinator merge (v3 table). */
  uint32_t frame_opaque_4212c0_add0_equal_flags_ready;
  uint8_t frame_opaque_4212c0_add0_equal_flags[ISAAC_FRAME_OPAQUE_40ADD0_MAX_ENTRIES];
  /* ABI v95 (record idx 25 roomTriggerClearStats): stats-vector + lookup
     captures at the clear seam (before the host replays the FUN_009e5960
     residual). tcs_stats_vec_ready = 1 only when the host captured the
     live span of the stats vector at Game+0x266e4+0x5c (begin/end/cap
     pointers) — the SAME vector the growth sim + 0x69ee50 alloc operate
     on; ready=0 keeps the pre-v95 host residual byte-for-byte.
       tcs_stats_vec_begin/end/cap = [Game+0x266e4+0x5c/+0x60/+0x64];
       tcs_stats_desc_10_48 = [[Room+4 desc]+0x10 + 0x48] (the 0x9e6740
       count-law arg);
       tcs_stats_lookup_bits = FUN_009e6940 result float bits (host runs
       the +0x40-vector match walk; 0x00000000 iff found && count>1 else
       0x00000001);
       tcs_stats_game_byte_8 = [Game+8] byte (the never-taken 0xb tail
       gate's second condition).
     Offsets fixed by the coordinator merge (v3 table). */
  uint32_t tcs_stats_vec_ready;
  uint32_t tcs_stats_vec_begin;
  uint32_t tcs_stats_vec_end;
  uint32_t tcs_stats_vec_cap;
  uint32_t tcs_stats_desc_10_48;
  uint32_t tcs_stats_lookup_bits;
  uint32_t tcs_stats_game_byte_8;
  /* ABI v95 (record idx 27 roomTriggerClearAudio): always-music seam
     captures at the Room::TriggerClear 0x7f83b0 callsite (PE 0x8069da).
     ALL FIVE must be captured by the host (ready = OR != 0) for the
     typed leaves; any missing keeps the pre-v95 monolithic counter.
       room_trigger_clear_audio_seed       = [game+0x182e4] FILTER RNG
             seed (PE 0x7f8459 mov eax,[edi+0x182e4]; seed==0 -> log
             0xb6bf54 warn + int3 debug assert).
       room_trigger_clear_audio_value      = float bits of 0x7f92b0(room)
             (PE 0x7f8441 call 0x7f92b0 / 0x7f8450 fstp [ebp-0x38]).
       room_trigger_clear_audio_play_sound = the caller's playSound arg
             (0x8068f0 [ebp+8]; gates the caller SFX leaf).
       room_trigger_clear_audio_gate749830 = 0x749830(game) result
             (PE 0x7f8400; arg2==0 gate).
       room_trigger_clear_audio_room_match = GetRoomByIdx match result
             (PE 0x7f8426 call 0x740bc0 / 0x7f8433 cmp [eax+0x18314]).
     Offsets fixed by the coordinator merge (v3 table; append-only by
     name). */
  uint32_t room_trigger_clear_audio_seed;
  uint32_t room_trigger_clear_audio_value;
  uint32_t room_trigger_clear_audio_play_sound;
  uint32_t room_trigger_clear_audio_gate749830;
  uint32_t room_trigger_clear_audio_room_match;
  /* ABI v95 (record idx 15 opaqueRoomUpdatePrefixB3B7): typed-host capture
     pack for the B3-B7 residual. b3b7_sparse_ready (v48 wire, above) is
     the OR-gate: the host must fill ALL of these for the typed plan; any
     missing keeps the monolithic counter. See NOTES.md for PE offsets.
     Append-only by name; offsets pinned by the coordinator merge. */
  uint32_t b3b7_fco_result;          /* FCO(0x28d) return != 0 (host leaf) */
  uint32_t b3b7_hce_2a5_hit;         /* HCE(0x2a5) return != 0 (host leaf) */
  uint32_t b3b7_room_byte1;          /* Room+1 low byte (B4 frame gate) */
  uint32_t b3b7_desc_seed_5c;        /* RoomDesc+0x5c (B4 RNG seed) */
  uint32_t b3b7_lookup_count;        /* lookup result +0xc */
  uint32_t b3b7_lookup_result_byte;  /* lookup result +0 (cleanup gate) */
  uint32_t b3b7_mgr_byte_1b4;        /* [Manager+0x1b4] band-B option */
  uint32_t b3b7_mgr_byte_2bf;        /* [Manager+0x2bf] band-C option */
  uint32_t b3b7_mgr_byte_1ba;        /* [Manager+0x1ba] band-D option */
  uint32_t b3b7_mgr_mode8;           /* [Manager+8] == 2 mode gate */
  uint32_t b3b7_game_nonnull;        /* [0xc71678] != 0 */
  uint32_t b3b7_game_26630;          /* [Game+0x26630] count */
  uint32_t b3b7_game_byte_26589;     /* [Game+0x26589] low byte */
  uint32_t b3b7_room_byte0;          /* Room+0 low byte (B5 outer gate) */
  uint32_t b3b7_game_26584;          /* [Game+0x26584] pass1 mode */
  uint32_t b3b7_game_26614;          /* [Game+0x26614] mode gate */
  uint32_t b3b7_entity_count;        /* Room+0x1264 entity count */
  uint32_t b3b7_list_end;            /* DAT_00c82678 end */
  uint32_t b3b7_list_cap;            /* DAT_00c8267c cap */
  uint32_t b3b7_count_708250;        /* 0x00708250 result (host leaf) */
  uint32_t b3b7_te_entries_count;    /* captured TE entries (<= 8) */
  uint32_t b3b7_te_entry_type[ISAAC_GAME_UPDATE_B3B7_TE_MAX_ENTRIES];
  uint32_t b3b7_te_entry_id[ISAAC_GAME_UPDATE_B3B7_TE_MAX_ENTRIES];
  uint32_t b3b7_b5_type[ISAAC_GAME_UPDATE_B3B7_B5_MAX_ENTITIES];
  uint32_t b3b7_b5_variant[ISAAC_GAME_UPDATE_B3B7_B5_MAX_ENTITIES];
  uint32_t b3b7_b5_flags168[ISAAC_GAME_UPDATE_B3B7_B5_MAX_ENTITIES];
  uint32_t b3b7_b5_vt48_al[ISAAC_GAME_UPDATE_B3B7_B5_MAX_ENTITIES];
  uint32_t b3b7_b5_field32c[ISAAC_GAME_UPDATE_B3B7_B5_MAX_ENTITIES];
  uint32_t b3b7_b5_vt4c_al[ISAAC_GAME_UPDATE_B3B7_B5_MAX_ENTITIES];
  uint32_t b3b7_b5_seed3dc[ISAAC_GAME_UPDATE_B3B7_B5_MAX_ENTITIES];
  uint32_t b3b7_b5_shift3e0[ISAAC_GAME_UPDATE_B3B7_B5_MAX_ENTITIES];
  uint32_t b3b7_b5_shift3e4[ISAAC_GAME_UPDATE_B3B7_B5_MAX_ENTITIES];
  uint32_t b3b7_b5_shift3e8[ISAAC_GAME_UPDATE_B3B7_B5_MAX_ENTITIES];
  uint32_t b3b7_b6_node_count;       /* captured destroy-tree nodes (<= 32) */
  uint32_t b3b7_b6_node_idx[ISAAC_GAME_UPDATE_B3B7_B6_MAX_NODES];
  uint32_t b3b7_b6_node_slot_nonnull[ISAAC_GAME_UPDATE_B3B7_B6_MAX_NODES];
  uint32_t b3b7_b7_nonnull_slot_count; /* captured non-null grid slots (<= 64) */
  uint32_t b3b7_b7_nonnull_slots[ISAAC_GAME_UPDATE_B3B7_B7_MAX_SLOTS];
  /* ABI v95 (record idx 14 opaqueRoomUpdatePrefixB2): item-pool/spawn
     special + set-to-60 capture pack (PE 0x00802e20..0x00803321). The
     host fills ALL of these (b2_pool_ready = OR != 0) only when it can
     vouch the captures are quiescent for the body's duration (player
     collectible vector nonempty, count fits, spawn element count <=
     ISAAC_GAME_UPDATE_B2_SPAWN_MAX_ELEMS, and neither the spawn element
     array [desc+0x10+0x40] nor its word count [desc+0x10+0x44] is
     reachable from the body's host calls); ready=0 keeps the pre-v95
     monolithic residual (the B1 resume still emits
     opaque_room_update_prefix_b2). See section-notes
     update-v95-14-prefix-b2-pool/NOTES.md for the full census.
       b2_pool_gate_18304   = dword [Game+0x18304] (special marker; the
             special body opens only when == 0xfffffff4, PE 0x802e39);
       b2_pool_counts       = 31 x u16 at Game+0x1af30 (per-pool weights,
             signed word gate > 0, PE 0x802ef7..0x802f73);
       b2_pool_seed_0..3    = the 16-byte collectible RNG struct at
             player-collectible begin + min(count-1,622)*0x10 (seed +
             shift1/2/3 bytes, PE 0x802eab call 0x7e90f0);
       b2_player_col_count  = (u32)((end-begin)>>4) of the player
             collectible vector (PE 0x802e4f..0x802e9b);       b2_grid_width        = Room+0xc (the spawn-loop idiv divisor);
       b2_spawn_count       = live word count [desc+0x10+0x44] (loop
             bound, re-read per iteration in the PE, 0x80330f); the
             captured element array lives in the exported scratch
             (isaac_game_update_slice_b2_spawn_in_address).
     Append-only by name; offsets pinned by the coordinator merge. */
  uint32_t b2_pool_ready;
  uint32_t b2_pool_gate_18304;
  uint16_t b2_pool_counts[ISAAC_GAME_UPDATE_B2_POOL_COUNT]; /* 31 */
  uint32_t b2_pool_seed_0;
  uint32_t b2_pool_seed_1;
  uint32_t b2_pool_seed_2;
  uint32_t b2_pool_seed_3;
  uint32_t b2_player_col_count;
  uint32_t b2_grid_width;
  uint32_t b2_spawn_count;
  /* ABI v95 (record idx 42 opaqueRoomUpdateTailPath): B19/B20 capture blob.
     tail_path_ready = 1 only when the host captured the pre-clear
     Room+0x7769 flag (sparse state, pre-clear at this seam) + the
     DAT_00c82674/78 trail-list span + up to ISAAC_GAME_UPDATE_TAIL_PATH_
     MAX_NODES trail entity packs at a quiescent seam (a host that sees
     more live trail entities than the cap must NOT set ready; the pre-v95
     monolith stays). list_begin/end = DAT_00c82674/78 (PE 0x0080608e);
     mode_26614 = Game+0x26614 (chain-continue gate, PE 0x0080635b);
     entries[i] = the pass1/pass2 loop's entity packs in machine order.
     The B19 rebuild decision uses state->room_flag_7769 (already sparse).
     Offsets fixed by the coordinator merge (claim 7892..8804). */
  uint32_t tail_path_ready;
  uint32_t tail_path_list_begin_c82674;
  uint32_t tail_path_list_end_c82678;
  uint32_t tail_path_mode_26614;
  uint32_t tail_path_genrand_draws; /* host-reported 0x6eef60 draws in the
                                       FLAGGED/DEFAULT arms (typed-host) */
  IsaacGameUpdateSliceTailPathEntry
      tail_path_entries[ISAAC_GAME_UPDATE_TAIL_PATH_MAX_NODES];
  /* ABI v95 (record idx 36 opaqueRoomUpdateTailWaterB16 / FUN_00823540):
     blob captures at the B16 lava sub-block seam (before the 0x00823540
     chain runs). ALL must be filled when water_b16_blob_ready != 0; any
     missing keeps the pre-v95 monolithic residual. Byte lanes are u32
     (WIDE) — the law re-narrows (& 0xff) in-module:
       water_b16_game_byte_183a0 = [Game+0x183a0] byte (spray flag gate,
             PE 0x823557 cmp byte);
       water_b16_game_byte_269e9 = [Game+0x269e9] byte (spray flag gate,
             PE 0x823560 cmp byte);
       water_b16_game_type_0     = [Game+0] (74efd0 arg type);
       water_b16_game_subtype_4  = [Game+4] (74efd0 arg subtype);
       water_b16_unlock_acc      = 0x6f9400() | [Game+0xc] |
                                   [Game+0x26550] (host-composed
                                   challenge mask, PE 0x748490);
       water_b16_unlock_clear    = 0x6f95a0() (host-captured challenge
                                   mask, PE 0x7484ae);
       water_b16_src_1b10[6]     = float bits Room+0x1b10..+0x1b28
                                   (SKIPS +0x1b20; the 6-float source
                                   vector, PE 0x82337a..0x8233ac);
       water_b16_grid_flags_44   = dword [Room+4+0x44] (bit9 / bit5 cell
                                   gates, PE 0x823477..0x8234a8);
       water_b16_cell_dword_54   = dword [Room+4+0x54] (int32->float cell
                                   amount, PE 0x8234b7 cvtdq2ps).
     Reused captures (no new fields): flags_2654c / difficulty_269c8 /
     room_type_8 / room_transition_mode_1830c (Game+0x1830c) from STATE;
     ambient_room_1d18 (Room+0x1d18) / b3b7_width_c (Room+0xc) /
     b3b7_height_10 (Room+0x10) from RUNTIME. Append-only by name;
     offsets pinned by the coordinator merge (claimed next-free after the
     wave's runtime claims). */
  uint32_t water_b16_blob_ready;
  uint32_t water_b16_game_byte_183a0;
  uint32_t water_b16_game_byte_269e9;
  uint32_t water_b16_game_type_0;
  uint32_t water_b16_game_subtype_4;
  uint32_t water_b16_unlock_acc;
  uint32_t water_b16_unlock_clear;
  uint32_t water_b16_src_1b10[6];
  uint32_t water_b16_grid_flags_44;
  uint32_t water_b16_cell_dword_54;
  /* ABI v95 (record idx 22 opaqueRoomTransitionEngineBody): the per-entry
     capture contract for the player-entry blob (PE 0x0082f047..0x0082f0b2
     walk; census update-v95-82ee40-body-entry/NOTES.md). Host samples at
     the seam: engine_player_count (above) + eligibility lane (existing
     scratch engine_player_eligible) + THESE byte-0x173 lanes
     (byte [entry+0x173], the 0x7abcc0 gate) + the existing f360/f364/f410
     float lanes. ready=0 keeps the pre-v95 coarse body edge (any eligible
     && player_loop_needs_host) byte-for-byte; ready=1 + count fits MAX
     drives the in-module per-entry pre-call laws + typed host events.
     The lanes travel UN-NARROWED (u32; the laws re-narrow & 0xff). */
  uint32_t engine_player_entry_173_ready;
  uint32_t engine_player_entry_173[ISAAC_ENGINE_PLAYER_MAX];
  /* ABI v95 (record idx 41 opaqueRoomUpdateTailEntity, B18 entity walk
     0x00805527..0x008055a7): per-entity capture pack. ready=0 keeps the
     pre-v95 monolithic coarse event (exact fallback); ready=1 drives the
     in-module walk frame + typed host counters. Host samples at the seam:
       b18_entity_count = Room+0x1264 (PE 0x805532 cmp dword [edi+0x1264],
         esi / jbe — FULL-DWORD; the bound is RE-READ per iteration at
         0x805598 cmp esi,[edi+0x1264] / jb);
       b18_entity_mode  = Game+0x26614 timedTransitionCleanupMode (PE
         0x80555d cmp dword [eax+0x26614],2 / jl — SIGNED >= 2);
       b18_entity_types[i]        = ent+0x28 of vec[i] (Room+0x125c,
         stride 4; PE 0x805546..0x805549) — FULL-DWORD type compares;
       b18_entity_cast_results[i] = host-captured __RTDynamicCast result
         per RTTI candidate (0 or nonzero, PE 0x80558c test eax,eax).
     The host MUST NOT set ready when the live count > 64 or the list is
     mid-mutation (a host body can shrink the bound mid-walk). Lanes are
     u32 (no uint8_t scalar crosses the ABI). Append-only by name;
     offsets pinned by the coordinator merge (claimed next-free after the
     wave's runtime claims). */
  uint32_t b18_entity_ready;
  uint32_t b18_entity_count;
  uint32_t b18_entity_mode;
  uint32_t b18_entity_types[ISAAC_GAME_UPDATE_B18_ENTITY_MAX];
  uint32_t b18_entity_cast_results[ISAAC_GAME_UPDATE_B18_ENTITY_MAX];
  /* ABI v96 (record idx 12 opaqueCall006fd7c0) LIVE seam capture, APPENDED
     at the tail (after the b18 pack, which ends at 11592). The
     coordinator merge fixed the finals at 11592..13736; the ABI-96 tail
     (record-4/10/9/22) continues after 13736. All lanes u32/i32.
     game_room_18304 = frame_effect_shell_room_18304 [Game+0x18304]
     (same frame-effect seam sample); the entry guards =
     frame_effect_rewind_guard_269ea/269eb/68d70; canopy operands =
     frame_effect_shell_room_182d0 / room_byte1 (family laws by
     reference). opaque_call_006fd7c0_ready names the FULL record-12
     capture (slot + game scalars + payload blob); the seam gates on it. */
  int32_t rewind_705ee0_slot_index_676ac;      /* [Game+0x676ac] slot index (edi) */
  uint32_t rewind_705ee0_slot_valid_byte;      /* byte [newslot] — S5 valid flag */
  int32_t rewind_705ee0_slot_room_19d20;       /* [newslot+0x19d20] room compare (0x705f3a) */
  int32_t rewind_705ee0_slot_tag_e8;           /* [newslot+0xe8] tag compare (0x705f48) */
  int32_t rewind_705ee0_slot_arg_1fe2c;        /* [newslot+0x1fe2c] — S6 snapshot arg */
  uint32_t rewind_705ee0_slot_frame_1fe30;     /* [newslot+0x1fe30] — S7 slot frame */
  uint32_t rewind_705ee0_game_base;            /* [0xc71678] g_Game (slot bases + SaveState arg) */
  int32_t rewind_705ee0_game_tag_0;            /* [Game+0] tag compare (0x705f48 cmp [esi]) */
  uint32_t rewind_705ee0_game_frame_264f8;     /* [Game+0x264f8] — S7 source + delta compare */
  uint32_t rewind_705ee0_game_18318;           /* [Game+0x18318] — S1 store value source */
  uint32_t rewind_705ee0_payload_blob_ready;   /* v93 JOIN-shape ready (host fills the blob) */
  uint32_t rewind_705ee0_payload_blob_addr;    /* *[0xc7169c]+0x2d0 source address (host-resolved) */
  uint32_t rewind_705ee0_payload_blob[ISAAC_GAME_UPDATE_705EE0_PAYLOAD_WORDS]; /* S8, 0x20b dwords */
  uint32_t opaque_call_006fd7c0_ready;         /* record-12 ready lane naming the seam */
  /* ABI v96 (record idx 4 opaqueCall008318a0, coordinator-merged ABI-96
     tail): the mode-1 SFX-manager store-plan capture + the mode-1/2/4
     per-player entry pack. ALL u32 (no uint8_t scalar crosses the ABI;
     byte-semantics fields use a u32 carrier and the laws re-narrow
     & 0xff in-module). The four sfx globals are the .data BSS sources
     of the 9-store plan rows (record-4 §5); engine_field_28 = Game+
     0x1b864 (the 0xa18300 arg @0x831e7d); engine_byte_7c = Game+0x1bab8
     (the mode-2 direct-tail gate 0x83202a). The player-entry pack spans
     ISAAC_GAME_UPDATE_8318A0_PLAYER_ENTRY_MAX == 8 entries; the count
     lane is the host span (end-begin)>>2 capped at 8; ready names the
     whole pack. The record-4 §5.1 manager-word names are ALIASES of the
     record-10 true-probe blob (dedupe per the C11 ABI-96 plan). */
  uint32_t opaque_8318a0_sfx_global_798e4;   /* [0xc798e4] low-byte &4 / dword >>5 &1 split */
  uint32_t opaque_8318a0_sfx_global_79948;   /* [0xc79948] queue-element dword (plan row 2) */
  uint32_t opaque_8318a0_sfx_global_79790;   /* [0xc79790] sub-1 wrap source (plan row 8) */
  uint32_t opaque_8318a0_sfx_global_7978c;   /* [0xc7978c] cmove source (plan row 9) */
  uint32_t opaque_8318a0_engine_field_28;    /* Game+0x1b864 (0xa18300 arg @0x831e7d) */
  uint32_t opaque_8318a0_engine_byte_7c;     /* Game+0x1bab8 byte (mode-2 gate 0x83202a) */
  uint32_t opaque_8318a0_player_entry_ready; /* per-player entry pack ready */
  uint32_t opaque_8318a0_player_entry_count; /* span (end-begin)>>2, cap = PLAYER_ENTRY_MAX */
  uint32_t opaque_8318a0_player_entry_b173[ISAAC_GAME_UPDATE_8318A0_PLAYER_ENTRY_MAX];
  uint32_t opaque_8318a0_player_entry_b1398[ISAAC_GAME_UPDATE_8318A0_PLAYER_ENTRY_MAX];
  uint32_t opaque_8318a0_player_entry_b139a[ISAAC_GAME_UPDATE_8318A0_PLAYER_ENTRY_MAX];
  uint32_t opaque_8318a0_player_entry_b171[ISAAC_GAME_UPDATE_8318A0_PLAYER_ENTRY_MAX];
  uint32_t opaque_8318a0_player_entry_w410[ISAAC_GAME_UPDATE_8318A0_PLAYER_ENTRY_MAX];
  uint32_t opaque_8318a0_player_entry_w3fc[ISAAC_GAME_UPDATE_8318A0_PLAYER_ENTRY_MAX];
  uint32_t opaque_8318a0_player_entry_ptr7c[ISAAC_GAME_UPDATE_8318A0_PLAYER_ENTRY_MAX];
  uint32_t opaque_8318a0_player_entry_b34[ISAAC_GAME_UPDATE_8318A0_PLAYER_ENTRY_MAX];
  uint32_t opaque_8318a0_player_entry_b88[ISAAC_GAME_UPDATE_8318A0_PLAYER_ENTRY_MAX];
  uint32_t opaque_8318a0_player_entry_w1600[ISAAC_GAME_UPDATE_8318A0_PLAYER_ENTRY_MAX];
  uint32_t opaque_8318a0_player_entry_w418[ISAAC_GAME_UPDATE_8318A0_PLAYER_ENTRY_MAX];
  uint32_t opaque_8318a0_player_entry_w16c[ISAAC_GAME_UPDATE_8318A0_PLAYER_ENTRY_MAX];
  /* ABI v96 (record idx 10 opaqueCall004212c0, coordinator-merged):
     the true-probe interior SFX-manager blob (ONE blob, 12 words —
     record-4 §5.1 manager-word aliases deduped onto these names per the
     C11 ABI-96 plan). ready names the capture; mgr_base = [0xc7169c]
     runtime value; the mgr_* words are the 9 caller-side store sources
     (inc fields f18/ebc, store-constant fields 14/21618/21620/21624/
     2161c/29fb8) read PRE-interior; volume_bits = [mgr+0x2a324+0x10]
     f32 bits (ucomiss vs 1.0f @0xbaa454); volume_eq_one = the ucomiss
     result (1 iff ordered equal 0x3f800000 — the bit-exact law). */
  uint32_t frame_opaque_4212c0_true_probe_ready;
  uint32_t frame_opaque_4212c0_true_probe_mgr_base;
  uint32_t frame_opaque_4212c0_true_probe_mgr_f18;
  uint32_t frame_opaque_4212c0_true_probe_mgr_ebc;
  uint32_t frame_opaque_4212c0_true_probe_mgr_14;
  uint32_t frame_opaque_4212c0_true_probe_mgr_21618;
  uint32_t frame_opaque_4212c0_true_probe_mgr_21620;
  uint32_t frame_opaque_4212c0_true_probe_mgr_21624;
  uint32_t frame_opaque_4212c0_true_probe_mgr_2161c;
  uint32_t frame_opaque_4212c0_true_probe_mgr_29fb8;
  uint32_t frame_opaque_4212c0_true_probe_volume_bits;
  uint32_t frame_opaque_4212c0_true_probe_volume_eq_one;
  /* ABI v96 (record idx 9 state24ecc0x8ef990 TAIL-A, coordinator-
     merged): the MP-slot pair [0xc7169c]+0x4b3d8/+0x4b3dc (TAIL-A D1
     empty-test) + the OPTIONAL 956780 RNG seed [0xc5d2b0] (lane inert
     until the taila_sfx_id law opts in; hosts MAY leave it 0). The
     process-input-v48 glist reads of the same pair are satisfied by
     these lanes — no duplicate allocation. */
  uint32_t state24ecc8ef990TailaSlotBegin;
  uint32_t state24ecc8ef990TailaSlotEnd;
  uint32_t state24ecc8ef990TailaSfxSeed;     /* OPTIONAL ([0xc5d2b0]) */
  /* ABI v96 (record idx 22 opaqueRoomTransitionEnginePrefix, W22-S2
     §lane-requests, coordinator-merged): the ANM2::Load pre-lane host
     half captures. filename_* = the H2 write surface Game+0x1b874/
     0x1b884/0x1b888 (recv+0x00/+0x10/+0x14; the ptr dword VALUE is
     platform — standing allocator decision); anim_first_pre/second_pre
     = H6a/H6b pre-state Game+0x1b8a4/0x1b8c4; anim_ready = the H6
     capture voucher; loadgraphics_flag_ready = the v8-wire voucher;
     loadgraphics_flags = per-layer [layer+0x30] host load results
     (inline BYTES, cap ISAAC_GAME_UPDATE_ANM2_MAX_LAYERS == 32 — no
     uint8_t scalar crosses the ABI). */
  uint32_t engine_anm2_filename_ready;      /* H2 capture voucher */
  uint32_t engine_anm2_filename_ptr;        /* Game+0x1b874 (ptr/SSO dword) */
  uint32_t engine_anm2_filename_size;       /* Game+0x1b884 (0x1d at the site) */
  uint32_t engine_anm2_filename_cap;        /* Game+0x1b888 (0x1f at the site) */
  uint32_t engine_anm2_anim_first_pre;      /* Game+0x1b8a4 (H6a pre-state) */
  uint32_t engine_anm2_anim_second_pre;     /* Game+0x1b8c4 (H6b pre-state) */
  uint32_t engine_anm2_anim_ready;          /* H6a/H6b capture voucher */
  uint32_t engine_anm2_loadgraphics_flag_ready; /* v8 wire voucher */
  uint8_t engine_anm2_loadgraphics_flags[ISAAC_GAME_UPDATE_ANM2_MAX_LAYERS];
  /* ABI v102 (record idx 0 walker live wiring, wave update-v102-record0-
     wire; PLAN update-v102-abi97-plan — offsets pinned by the wave-26
     merge): the 0x84cc40 walker's committed capture lanes (the v100 §6
     FINALIZED requests). All u32; the walker stays host, the lanes are
     plain reads captured AT the walker call sites: player_a/b = the
     swap args pushed at 0x9bef22/0x9bef09 (A=[ebx+8] @0x9beef4,
     B=[ebx+0xc] @0x9beefa) and 0x9bf3cc/0x9bf3cb (A=[ebx+8] @0x9bf3aa,
     B=[ebx+0xc] @0x9bf124; partner exchange 0x9bef03..0x9bef16 /
     0x9bf3bb); b_frame328 = the exact [B+0x328] deref the walker-site
     RESET/TWEEN split reads (PE 0x84ccc8 sub eax,[edx+0x328]);
     probe1_arg = the [Game+0x18300] ROOM ptr word (PE 0x84d188 mov
     ecx,[eax+0x18300]; seam twin 0x84cb47, PM swap twin 0x9bf31f; ABI
     v67 pinned 0 today). Consumers (k6/k7 block, both mirrors):
     hud_stat_walker_row_arm / swap_store (A/B), reset_split (b_frame328),
     probe1_arg (probe1_arg). a==b==0 = capture absent (no swap this
     frame) -> the residual stays byte-for-byte. */
  uint32_t hud_stat_walker_player_a;
  uint32_t hud_stat_walker_player_b;
  uint32_t hud_stat_walker_b_frame328;
  uint32_t hud_stat_walk_probe1_arg;
  /* ABI v104 (record idx 12 opaqueCall006fd7c0 transition-pack REAL wiring,
     wave update-v104-record12-wire; PLAN update-v102-record12-tran §5 +
     W27-S1 ABI-98 lanes — offsets pinned by the wave-27 merge): the 9-lane
     transition capture pack (all u32; byte-gated inputs are carried
     FULL-WORD and re-narrowed & 0xff in the laws — no uint8_t lanes).
     game0 = [Game+0x0] word (PE 0x6fd87f cmpl $0x1) — the anim-0xc special
     gate; alt_path_probe = captured AL of the 0x74bac0 alt-path probe
     (PE 0x6fd884, this=Game); route_probe = captured AL of the 0x6f8120
     route probe (PE 0x6fd8ad, this=[0xc71678]) — 0 nests 0x6fdc10,
     nonzero rewrites anim 3/dim 0; player_loop_probe = captured AL of the
     0x8279a0 player-loop gate (PE 0x6fd91d, ecx=[Game+0x18300]);
     room_type_8 = [[Game+0x18300]+8] type (PE 0x6fdadd) — the anim-3
     dispatch; room_subroom_flag_44 = low byte [[[Game+0x18300]+4]+0x44]
     (PE 0x6fdae8 testb $0x1) — the dispatch subroom flag; blue_room_probe
     = captured AL of 0x74d4a0 TryInitializeBlueRoom (PE 0x6fdb78) — gates
     the cmovne -0x10 room rewrite (the 0x82ee40 arg0);
     engine_pred_probe = captured AL of the 0x6f0070 engine predicate
     (PE 0x6fdba6, this=Game+0x1b83c) — gates the 0x265c0 terminal clear;
     ready = the pack VOUCHER (mirror of opaque_call_006fd7c0_ready
     @13732) — the K-block arms go live only when ready != 0 AND
     opaque_call_006fd7c0_ready != 0; ready=0 keeps the pre-v104 residual
     byte-for-byte. */
  uint32_t transition_6fd7c0_game0;
  uint32_t transition_6fd7c0_alt_path_probe;
  uint32_t transition_6fd7c0_route_probe;
  uint32_t transition_6fd7c0_player_loop_probe;
  uint32_t transition_6fd7c0_room_type_8;
  uint32_t transition_6fd7c0_room_subroom_flag_44;
  uint32_t transition_6fd7c0_blue_room_probe;
  uint32_t transition_6fd7c0_engine_pred_probe;
  uint32_t transition_6fd7c0_ready;
  /* ABI v99 (wave-28 entity-surface capture REBIND, idx 5/32; the v95
     provisional JSON rows @8040..8396 were REMOVED — they collided with
     the committed b3b7 lanes): ready = the pack VOUCHER (FULL-DWORD
     gate); capture[i] = the i-th matched MP entry's entity surface (the
     fields the accept virtuals 0xa5f260/0xa23970 read: vtable class-bits
     + impl/frame fields + netman globals; 44 B pack(1), cap 8, machine
     order). ready=0 keeps the pre-pack walk surface byte-for-byte; the
     accept-pure proof publishes only when ready != 0. */
  uint32_t frame_opaque_98dba0_entity_surface_ready;
  IsaacGameUpdateSliceEntitySurfaceCapture
      frame_opaque_98dba0_entity_surface_capture[8];
  /* ABI v127 (update-v127-706c-restock-removal, ADDENDUM-3 F3 capture
     contract, taken at PE 0x805403 entry): shop-restock walk pack,
     APPENDED at the tail. All lanes u32; per-item arrays cap
     ISAAC_GAME_UPDATE_SHOP_RESTOCK_MAX=32 (ready MUST NOT be set when
     [Room+0x7080] > 32 — over-cap keeps the monolith). */
  uint32_t shop_restock_ready;
  int32_t shop_room_width;
  int32_t shop_restock_count;
  uint32_t shop_bucket_count;
  uint32_t shop_bucket_cursor_in;
  uint32_t shop_hash_in;
  uint32_t shop_mgr_global_a;
  uint32_t shop_mgr_global_b;
  uint32_t shop_cell_ids[ISAAC_GAME_UPDATE_SHOP_RESTOCK_MAX];
  uint32_t shop_cell_ptrs[ISAAC_GAME_UPDATE_SHOP_RESTOCK_MAX];
  uint32_t shop_cell_valid[ISAAC_GAME_UPDATE_SHOP_RESTOCK_MAX];
  uint32_t shop_cell_counter_pre[ISAAC_GAME_UPDATE_SHOP_RESTOCK_MAX];
  uint32_t shop_vcall_fired[ISAAC_GAME_UPDATE_SHOP_RESTOCK_MAX];
  uint32_t shop_genrand_ret[ISAAC_GAME_UPDATE_SHOP_RESTOCK_MAX];
  /* ABI v128 (update-v128-heartbeat-sfxupd-removal, PLAN-45 §2): the
     update-lane capture scalars. Per-voice probes reuse the committed
     sfx_stop_voice_packs; master vol [[0xc7169c]+0x2a358] and [mgr+0x10]
     are mutable host state — captured IN, never folded. */
  uint32_t sfx_upd_ready;
  uint32_t sfx_upd_arg_vol;
  uint32_t sfx_upd_master_vol;
  uint32_t sfx_upd_mgr_scalar;
  uint32_t sfx_upd_vol_mem_pre;
  /* ABI v131 (update-v131-greed-probe-pack, record idx 30): entity
     capture pack @15504..15736 for the room-pure ABI v81 greed-probe
     band consumed BY REFERENCE. Per-element stride 28:
     f2c/f3bc/has_parent/parent_161c/self_161c/parent_is_self/f20a9.
     NO uint8_t scalars (Wasm i32 does not narrow; byte gates re-narrow). */
  uint32_t greed_probe_pack_ready;
  uint32_t greed_probe_elem_count;
  IsaacGameUpdateSliceGreedProbeRow greed_probe_elems[8];
  /* ABI v132 (update-v132-b16-spawn-pack, record idx 36): spawn-walk
     enumeration capture @15736..16776 (contracts-b16-spawn NOTES §2,
     Option A). Voucher law (host side): ready=1 IFF both armed walks were
     intercepted per cell, each arm's hit count <= 64 (over-cap poisons
     the WHOLE voucher), and grid_w/h_echo match the seam dims —
     all-or-nothing, no partial mode. Row pools are PE order (outer x asc,
     inner y asc); entity_ptr = the 0x00af08b1 __RTDynamicCast result
     every downstream host effect fires on. */
  uint32_t water_b16_spawn_rows_ready;
  int32_t water_b16_water_hit_count;
  int32_t water_b16_lava_hit_count;
  uint32_t water_b16_grid_w_echo;
  uint32_t water_b16_grid_h_echo;
  IsaacGameUpdateSliceB16SpawnHitRow water_b16_water_hits[64];
  IsaacGameUpdateSliceB16SpawnHitRow water_b16_lava_hits[64];
  /* ABI v133 (update-v133-audio-music-pack, records idx26/27):
     spawn-tail capture packs @16780..17536 (contracts-audio-music
     NOTES §2). Voucher law: pack_ready=1 IFF all header lanes captured,
     iter_count <= 8, and every row filled (the tick actually reached the
     spawn tail); any miss -> ready=0 -> monolith byte-for-byte. */
  uint32_t tca40_tail_pack_ready;
  uint32_t tca40_tail_iter_count;
  int32_t tca40_tail_door_f24;
  int32_t tca40_tail_game_c;
  uint32_t tca40_tail_vec0_bits;
  uint32_t tca40_tail_vec4_bits;
  uint32_t tca40_tail_rot_cos_bits;
  uint32_t tca40_tail_rot_sin_bits;
  IsaacGameUpdateSliceTcaTailRow tca40_tail_rows[ISAAC_GAME_UPDATE_TCA_TAIL_MAX_ROWS];
  uint32_t tca83b0_tail_pack_ready;
  uint32_t tca83b0_tail_iter_count;
  int32_t tca83b0_tail_door_f24;
  int32_t tca83b0_tail_game_c;
  uint32_t tca83b0_tail_vec0_bits;
  uint32_t tca83b0_tail_vec1_bits;
  IsaacGameUpdateSliceTcaTailRow tca83b0_tail_rows[ISAAC_GAME_UPDATE_TCA_TAIL_MAX_ROWS];
  /* ABI v134 (update-v134-awards-head-pack, records idx28/29): award
     spawner HEAD capture @17540..17648 (contracts-awards NOTES §2):
     voucher + 27 u32 src fields mirroring IsaacRoomAwardSpawn7fb250Src
     field-for-field; ready=1 iff ALL rows valid at the 0x806b91 seam;
     absence -> monolith byte-for-byte. */
  uint32_t awards_head_ready;
  uint32_t awards_head_src_lua_gate;
  uint32_t awards_head_src_desc_f10_present;
  uint32_t awards_head_src_desc_type_8;
  uint32_t awards_head_src_desc_type_00;
  uint32_t awards_head_src_room_type_8;
  uint32_t awards_head_src_h_74efd0;
  uint32_t awards_head_src_game_1830c;
  uint32_t awards_head_src_mode_269c8;
  uint32_t awards_head_src_h_9be630;
  uint32_t awards_head_src_flags_1839c;
  uint32_t awards_head_src_picked_id;
  uint32_t awards_head_src_gate_f1;
  uint32_t awards_head_src_h_9be750;
  uint32_t awards_head_src_h_4e4690_bits;
  uint32_t awards_head_src_h_7e9080_bits;
  uint32_t awards_head_src_h_rnd64;
  uint32_t awards_head_src_h_6ee340;
  uint32_t awards_head_src_h_9be140;
  uint32_t awards_head_src_xform_id;
  uint32_t awards_head_src_xform_b;
  int32_t awards_head_src_desc_f0;
  uint32_t awards_head_src_h_9be6b0;
  uint32_t awards_head_src_h_7cb6e0;
  uint32_t awards_head_src_gate_202;
  uint32_t awards_head_src_h_rnd4;
  uint32_t awards_head_src_h_9be080_1a0;
  uint32_t awards_head_src_h_rnd3;
  /* ABI v135 (update-v135-deep-music-pack, record idx28): deep-music
     gate capture @17652..17692 (contracts-deep-music NOTES §1/§2):
     voucher + head-clear byte + two PACKED probe rows (bits[7:0]=al,
     bit8=RAN short-circuit honesty) + byte26588 + MANAGER vec pair
     0x4b3d8/dc + count334 + room-match ret+8 / game18314 operands +
     game4. All-or-nothing voucher; absence -> monolith byte-for-byte. */
  uint32_t tca_dm_gate_ready;
  uint32_t tca_dm_head_clear_1bb84;
  uint32_t tca_dm_probe_a_9e9b50;
  uint32_t tca_dm_probe_b_9595e0;
  uint32_t tca_dm_byte_26588;
  uint32_t tca_dm_vec_begin_4b3d8;
  uint32_t tca_dm_vec_end_4b3dc;
  uint32_t tca_dm_count_334;
  uint32_t tca_dm_room_match_ret8;
  uint32_t tca_dm_game_18314;
  uint32_t tca_dm_game4;
  /* ABI v136 (update-v136-audio-head-pack, record idx26): head-gate +
     ABI-67 fail capture @17696..17852 (contracts-audio-head NOTES §2,
     design-exact order). All-or-nothing voucher; absence -> monolith
     byte-for-byte. */
  uint32_t tca40_head_pack_ready;
  uint32_t tca40_head_ran_bits;
  uint32_t tca40_head_desc_f10_f10;
  uint32_t tca40_head_obj_2c7;
  uint32_t tca40_head_obj_8;
  uint32_t tca40_head_game_26630;
  uint32_t tca40_head_game_byte_26589;
  uint32_t tca40_head_game_26550;
  uint32_t tca40_head_game_c;
  uint32_t tca40_head_game_18304;
  uint32_t tca40_head_game_182d0;
  uint32_t tca40_head_game_4;
  uint32_t tca40_head_room_728;
  uint32_t tca40_head_h_74ea50_al;
  uint32_t tca40_head_h_706940_h80;
  uint32_t tca40_head_h_6f9400;
  uint32_t tca40_head_h_6f95a0;
  uint32_t tca40_head_h_740bc0_ret8;
  uint32_t tca40_head_h_706940b_h80;
  uint32_t tca40_head_h_74bae0;
  uint32_t tca40_head_h_74e9b0_al;
  uint32_t tca40_head_h_70d360;
  uint32_t tca40_head_obj_1e3;
  uint32_t tca40_head_game_18314;
  uint32_t tca40_head_slot_seed;
  uint32_t tca40_head_bm1;
  uint32_t tca40_head_bm2;
  uint32_t tca40_head_slot_occ0;
  uint32_t tca40_head_slot_occ1;
  uint32_t tca40_head_slot_occ2;
  uint32_t tca40_head_slot_occ3;
  uint32_t tca40_head_slot_occ4;
  uint32_t tca40_head_slot_occ5;
  uint32_t tca40_head_slot_occ6;
  uint32_t tca40_head_slot_occ7;
  uint32_t tca40_head_slot_8;
  uint32_t tca40_head_genrand_tail;
  uint32_t tca40_head_room_f10_f8;
  uint32_t tca40_head_r74bba0_f10_f8;
  uint32_t tca40_head_r74bba0b_f10_f8;
  /* ABI v137 (update-v137-audio-head-83b0-pack, record idx27): head/
     ALT-walk/tail-RNG capture @17856..18012 (contracts-audio-head-83b0
     NOTES section 2; indicative base 17852 shifts +4 to the design-exact
     idx26 end). Window-membership voucher semantics (section 3). */
  uint32_t tca83b0_head_pack_ready;
  uint32_t tca83b0_head_gate_749830;
  uint32_t tca83b0_head_game_18304;
  uint32_t tca83b0_head_room_idx_ret8;
  uint32_t tca83b0_head_game_18314;
  uint32_t tca83b0_head_value_92b0_bits;
  uint32_t tca83b0_head_music_seed;
  uint32_t tca83b0_head_owner_probe;
  uint32_t tca83b0_head_tls_chain_a;
  uint32_t tca83b0_head_c8108c_a;
  uint32_t tca83b0_head_tls_chain_b;
  uint32_t tca83b0_head_c8108c_b;
  uint32_t tca83b0_head_game_1830c;
  uint32_t tca83b0_head_bm2_non_null;
  uint32_t tca83b0_head_desc_f58;
  uint32_t tca83b0_head_random_int_rnd;
  uint32_t tca83b0_head_bm1_38;
  uint32_t tca83b0_head_slot_occ0;
  uint32_t tca83b0_head_slot_occ1;
  uint32_t tca83b0_head_slot_occ2;
  uint32_t tca83b0_head_slot_occ3;
  uint32_t tca83b0_head_slot_occ4;
  uint32_t tca83b0_head_slot_occ5;
  uint32_t tca83b0_head_slot_occ6;
  uint32_t tca83b0_head_slot_occ7;
  uint32_t tca83b0_alt_walk_game_1830c;
  uint32_t tca83b0_alt_walk_game_18308;
  uint32_t tca83b0_alt_walk_game_1831c;
  uint32_t tca83b0_alt_walk_bm1_38;
  uint32_t tca83b0_alt_walk_seed_f58;
  uint32_t tca83b0_alt_walk_bm2_38;
  uint32_t tca83b0_alt_walk_bm2_34;
  uint32_t tca83b0_alt_walk_mode_269c8;
  uint32_t tca83b0_head_door_magic;
  uint32_t tca83b0_head_game4;
  uint32_t tca83b0_head_game_stage0;
  uint32_t tca83b0_tail_rng_seed_in;
  uint32_t tca83b0_tail_rng_sh1;
  uint32_t tca83b0_tail_rng_sh2;
  uint32_t tca83b0_tail_rng_sh3;
  /* ABI v138 (update-v138-audio-alt-tail-pack, record idx27): ALT-tail
     capture @18016..18391 (contracts-audio-head-83b0 NOTES 6C.1/6C.2
     structure; appends at the REAL ledger end 18016 -- the NOTES'
     '18012' base assumed tca83B0TailRngSh3 @18008, but the landed v137
     block is +4 (Sh3 @18012)). Route-
     agnostic voucher + 5 header lanes + 8 x stride-44 rows.
     magic_eq_e is DERIVED (tca83b0_head_door_magic @17984 == 0xe, single
     pre-loop latch writer @0x7f8ef5) -- no per-row flag slot.
     iter_count <= 8 kept as the stale-capture tripwire (6C falsifier 5). */
  uint32_t tca83b0_alt_tail_pack_ready;
  uint32_t tca83b0_alt_tail_iter_count;
  int32_t tca83b0_alt_tail_door_f24;
  int32_t tca83b0_alt_tail_game_c;
  uint32_t tca83b0_alt_tail_vec_a_bits;
  uint32_t tca83b0_alt_tail_vec_b_bits;
  IsaacGameUpdateSliceTcaAltTailRow tca83b0_alt_tail_rows[ISAAC_GAME_UPDATE_TCA_TAIL_MAX_ROWS];
  /* ABI v139 (update-v139-b1-rain-pack, records idx13/idx35): shared-half
     typed search/create/bind outcome rows @18392..22003 (contracts-b1-rain
     NOTES 2.3/2.4). All-or-nothing voucher; over-cap poisons whole
     voucher; seed-chain closure row0<->seed0 echo; count ==
     min(quality, decor_count) UNSIGNED. Exactly-once application is a
     HARD merge invariant (double-booked region). */
  uint32_t b1_rain_rows_ready;
  int32_t b1_rain_spawn_count;
  uint32_t b1_rain_quality_echo;
  uint32_t b1_rain_owner_nonzero_echo;
  uint32_t b1_rain_seed0_echo;
  uint32_t b1_rain_decor_count_echo;
  IsaacGameUpdateSliceB1RainSpawnRow b1_rain_rows[ISAAC_GAME_UPDATE_B1RAIN_SPAWN_MAX_ROWS];
  /* ABI v140 (update-v140-awards-spawn-loop-pack, record idx29): SPAWN_LOOP
     continuation capture @22000..22571 (contracts-awards NOTES section 6
     companion; consumes the frozen room-pure ABI v85 laws isaac_room_award_
     spawn_7fb250_iter_plan / _b1_luck_gate BY REFERENCE). All-or-nothing
     voucher: iter_count must EQUAL the head-plan count (PE iteration order)
     and stay <= 16 (over-cap poisons, never truncates). Post-loop blocker
     lanes: since ABI v141 the 0xb-block (0x7fb9cc..0x7fbb04) probes are
     FROZEN (room-pure ABI v86, consumed BY REFERENCE) — the block retires
     under its own voucher below; the "indirect vtable leaf [eax-0x18]
     @0x7fbabf" of the v140 note was a linear-decode MISDECODE (VA falls
     mid-instruction inside lea; the window has zero indirect calls). */
  uint32_t awards_spawn_loop_ready;
  uint32_t awards_spawn_loop_iter_count;
  int32_t awards_spawn_loop_variant0;      /* [ebp-0x8c] loop-entry latch (host 0x54 block store @0x7fb79d) */
  uint32_t awards_spawn_loop_room_w_c;     /* [room+0xc] grid idx law input */
  uint32_t awards_spawn_loop_room_h_10;    /* [room+0x10] */
  uint32_t awards_spawn_loop_b1_music_gate_al; /* HOST 0x44bfb0(0x8f) al @0x7fb8e2 */
  int32_t awards_spawn_loop_b1_quality_int;    /* HOST 0x9bea80(0x8f) eax */
  uint32_t awards_spawn_loop_b1_quality_f_bits;/* HOST 0x9bea40(0x8f) xmm0 */
  uint32_t awards_spawn_loop_b1_rnd_f_bits;    /* HOST 0x7e9080 f32 bits */
  uint32_t awards_spawn_loop_b1_site_pos_x_bits; /* HOST pos walk @0x7fb978 */
  uint32_t awards_spawn_loop_b1_site_pos_y_bits;
  uint32_t awards_spawn_loop_b1_site_draw;       /* 0x7e90f0 draw @0x7fb983 */
  uint32_t awards_spawn_loop_b1_picker_al;       /* HOST 0x4f8940(0x29e) al */
  uint32_t awards_spawn_loop_tail_gate_b1_al;    /* HOST 0x44bfb0(0xb1) al @0x7fb9dd */
  uint32_t awards_spawn_loop_game_26584;         /* [Game+0x26584] final gate */
  IsaacGameUpdateSliceAwardLoopRow awards_spawn_loop_rows[ISAAC_GAME_UPDATE_AWARD_LOOP_MAX_ROWS];
  /* ABI v141 (update-v141-b-block-probe-pack, record idx29): post-loop
     0xb-block capture @22572..23695 (contracts-awards NOTES section 6
     companion). All-or-nothing voucher: iter_count must EQUAL the PE loop
     recount sar([Game+0x1baac]-[Game+0x1baa8],2) and stay <= 8 (stale-
     capture tripwire; over-cap poisons, never truncates). elem_values
     mirror the captured vector contents so probe A's law can fetch from
     in-module memory BY REFERENCE (the raw [Game+0x1baa8] host addresses
     are opaque evidence only). mode_26584 reuses awards_spawn_loop_
     game_26584 (same dword [Game+0x26584]). The tail-create lanes capture
     the {5,0x12c} extra spawn site when the final gate arms. */
  uint32_t awards_b_block_ready;
  uint32_t awards_b_block_iter_count;
  uint32_t awards_b_block_desc_chain_bit; /* [[esi+4]+0x10]+0x10 == 1 */
  uint32_t awards_b_block_pos_x_bits;     /* HOST pos walk @0x7fba1b/47 */
  uint32_t awards_b_block_pos_y_bits;
  uint32_t awards_b_block_draw;           /* 0x7e90f0 draw @0x7fba26/52 */
  uint32_t awards_b_block_rng_s0;         /* [ebp-0xac] after pre-loop draws */
  uint32_t awards_b_block_rng_s1;
  uint32_t awards_b_block_rng_s2;
  uint32_t awards_b_block_rng_s3;
  uint32_t awards_b_block_vec_begin;      /* [Game+0x1baa8] */
  uint32_t awards_b_block_vec_end;        /* [Game+0x1baac] */
  uint32_t awards_b_block_mode_2663c;     /* [Game+0x2663c] */
  uint32_t awards_b_block_mgr_seed_264f8; /* [Game+0x264f8] */
  uint32_t awards_b_block_tail_pos_x_bits;/* HOST pos walk @0x7fbb2c */
  uint32_t awards_b_block_tail_pos_y_bits;
  uint32_t awards_b_block_tail_draw;      /* 0x7e90f0 draw @0x7fbb37 */
  uint32_t awards_b_block_elem_values[ISAAC_GAME_UPDATE_B_BLOCK_MAX_ROWS];
  IsaacGameUpdateSliceBBlockRow awards_b_block_rows[ISAAC_GAME_UPDATE_B_BLOCK_MAX_ROWS];
} IsaacGameUpdateSliceRuntimeInputs;

/* ABI v95 (record idx 23 opaqueRoomUpdateClearPath): the two remaining pure
   laws of the clear-path residual. flag_gate = 1 when the machine clears the
   player flag (PE 0x00804212..0x0080424d: FULL-DWORD equality vs 0xd, then
   SIGNED 1..6 range + bit16 of Game+0x2654c); flag_mask = 0xfffffffe (PE
   0x00804245 and dword); flag_target = Manager + [Manager+0x29fbc]*0x184 +
   0x2a12c, 32-bit wrap (PE 0x0080423b imul + 0x00804245 [eax+ecx+0x2a12c]).
   door_result_merge = the post-door type-5 decision (PE 0x008042be..0x008042f3
   always runs after the clear path): 1 when the clear-path door residual ran
   (snapshot invalid) OR the pre-clear snapshot pure-gates type-5; 0 only when
   both are clean. FUN_00710dd0's open tail stays typed-host (v25 pin). */
int32_t isaac_game_update_slice_clear_path_flag_gate(uint32_t game_mode, uint32_t flags_2654c);
uint32_t isaac_game_update_slice_clear_path_flag_mask(void);
uint32_t isaac_game_update_slice_clear_path_flag_target(uint32_t manager_base, uint32_t count_29fbc);
int32_t isaac_game_update_slice_clear_path_door_result_merge(uint32_t any_needs_host, uint32_t type5_needs_host);
/* ABI v95 (record idx 24 opaqueRoomUpdateClearDoorSlots): composed per-slot
   early-out decision over the 8 runtime door slots. bit i set iff slot i is
   present (FULL-DWORD) AND isaac_door_helper_710dd0_early_out == 0 (fails).
   The residual open body runs for exactly the failing slots (typed host);
   the coarse opaque_room_update_clear_door_slots event fires iff mask != 0.
   No uint8_t scalar params. */
uint32_t isaac_game_update_slice_clear_door_slots_failing_mask(
    const IsaacGameUpdateDoorSlotRuntime* slots);

/* ABI v95 (record idx 25 roomTriggerClearStats): stats-residual pure laws
   of FUN_009e5960 (called unconditionally by Room::TriggerClear at
   0x00806935; this = Game+0x266e4). gate = clearCount word == 1
   (PE 0x9e5970 FULL-DWORD on the movzx-widened word: 0x10001 must NOT
   open); count = (arg-8) UNSIGNED <= 4 ? 2 : 1 (PE 0x9e6740 jump table,
   all 5 entries -> 2); float_gate = ordered lookup-float > -18.0f, NaN
   closes (PE 0x9e59a7 comiss / 0x9e59ae jbe); record_dword/byte = the
   vector record's [0..3]/[4] (Room.field_8 / (flags>>10)&1, PE
   0x9e59b0..0x9e59bc); growth_sim = per-append end==cap -> guest-alloc
   0x69ee50 (new_cap = max(cap+1, cap+cap>>1), alloc 12*new_cap, throw at
   0x15555555) counting the alloc calls + final end/cap; tail_add =
   Room.field_8==0xb (FULL-DWORD) && [Game+8]!=0 ? count : 0 (PE
   0x9e5a0c..0x9e5a18). The alloc itself stays typed-host. */
int32_t isaac_game_update_slice_tcs_stats_gate(uint32_t clear_count);
int32_t isaac_game_update_slice_tcs_stats_count(uint32_t arg_10_48);
int32_t isaac_game_update_slice_tcs_stats_float_gate(uint32_t lookup_bits);
int32_t isaac_game_update_slice_tcs_stats_record_dword(uint32_t room_f8);
int32_t isaac_game_update_slice_tcs_stats_record_byte(uint32_t flags44);
uint32_t isaac_game_update_slice_tcs_stats_growth_sim(uint32_t count, uint32_t begin, uint32_t end, uint32_t cap, uint32_t* out_end, uint32_t* out_cap);
int32_t isaac_game_update_slice_tcs_stats_tail_add(uint32_t room_f8, uint32_t game_byte_8, uint32_t count);

/* ABI v95 (record idx 17 opaqueRoomUpdatePrefixB9B11): B9 challenge-result
   laws + B10 fatal gate + B11 camera/manager decision laws. Transcribed
   branch-by-branch from section-notes/room-b9b11/disasm-803ce5.txt. All
   params uint32_t (Wasm ABI does not narrow i32); low-byte tests re-narrow
   in the body. Bodies stay typed-host; the wire emits the typed events. */
int32_t isaac_game_update_slice_b9b11_challenge_gate(uint32_t fco_result_nonzero, uint32_t room_active_byte0, uint32_t frame_264f8, uint32_t room_entry_11f0, uint32_t room_type_8, uint32_t room_desc_flags_44);
int32_t isaac_game_update_slice_b9b11_free_helper_needed(uint32_t count);
int32_t isaac_game_update_slice_b9b11_free_path_needed(uint32_t byte0);
int32_t isaac_game_update_slice_b9b11_free_ptr_needed(uint32_t ptr);
uint32_t isaac_game_update_slice_b9b11_free_heap_lo(uint32_t heap_lo, uint32_t size);
uint32_t isaac_game_update_slice_b9b11_free_heap_hi(uint32_t heap_lo, uint32_t heap_hi, uint32_t size);
int32_t isaac_game_update_slice_b9b11_b10_enemies(int32_t count_12c8, int32_t count_12cc);
int32_t isaac_game_update_slice_b9b11_b10_fatal_needed(int32_t enemies, int32_t old_7224);
int32_t isaac_game_update_slice_b9b11_mode_hooks_needed(uint32_t room_type_8, uint32_t game_byte);
int32_t isaac_game_update_slice_b9b11_flag_11f4_needed(uint32_t room_byte_11f4);
int32_t isaac_game_update_slice_b9b11_double_409030_needed(uint32_t room_byte_1d0d);
int32_t isaac_game_update_slice_b9b11_stage_1a_needed(uint32_t room_1d18);
int32_t isaac_game_update_slice_b9b11_age1_needed(uint32_t room_active_byte0, uint32_t frame_264f8, uint32_t room_entry_11f0);
int32_t isaac_game_update_slice_b9b11_tempfx_flag_clear(uint32_t room_byte_7321);
int32_t isaac_game_update_slice_b9b11_tempfx_list_empty(uint32_t list_begin_7314, uint32_t list_end_7318);
int32_t isaac_game_update_slice_b9b11_tempfx_is_candidate(uint32_t effect_type, uint32_t effect_variant);
uint32_t isaac_game_update_slice_b9b11_tempfx_walk_next(uint32_t cur);
int32_t isaac_game_update_slice_b9b11_tempfx_walk_continue(uint32_t cur, uint32_t end);

/* ABI v95 (record idx 27 roomTriggerClearAudio): the always-music body
   decision law of 0x7f83b0 (called by Room::TriggerClear at 0x8069da
   with arg1=1, arg2=0). music = arg2 != 0 || value > rnd ||
   value >= 1.0f, where rnd = float32 of xorshift32(seed; shifts {2,
   0x15, 9} — PE 0x7f8459..0x7f84e1: seed [game+0x182e4], qword
   0xb1f594 {2, 0x15} + dword 0xb1f59c {9}; uint32->double via
   cvtdq2pd + sign-fix addsd [edx*8 + 0xbacb00]; cvtpd2ps; mulss
   0x2f7ffffe = 2.3283061589829401e-10; comiss value,rnd / ja +
   comiss value,1.0f / jae — NaN: comiss sets CF so ja/jae NOT taken,
   music==0). All params are uint32_t bits; NO uint8_t scalar. */
int32_t isaac_game_update_slice_room_trigger_clear_audio_music(uint32_t arg2, uint32_t value_bits, uint32_t seed);

uint32_t isaac_game_update_slice_857450_body(const IsaacGameUpdateSliceRuntimeInputs* inputs, IsaacGameUpdateSliceState* state, IsaacGameUpdateSliceEvents* events);
void isaac_game_update_slice_step(IsaacGameUpdateSliceState* state, const IsaacGameUpdateSliceConstants* constants, const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs, IsaacGameUpdateSliceEvents* events);
int32_t isaac_game_update_slice_resume_gate_1b83c(IsaacGameUpdateSliceState* state, IsaacGameUpdateSliceEvents* events);
int32_t isaac_game_update_slice_resume_92f1c0(IsaacGameUpdateSliceState* state, const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs, IsaacGameUpdateSliceEvents* events);
int32_t isaac_game_update_slice_resume_generic_prompt(IsaacGameUpdateSliceState* state, IsaacGameUpdateSliceEvents* events);
int32_t isaac_game_update_slice_resume_item_overlay(IsaacGameUpdateSliceState* state, const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs, IsaacGameUpdateSliceEvents* events);
int32_t isaac_game_update_slice_continue_timed_transition(IsaacGameUpdateSliceState* state, const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs, IsaacGameUpdateSliceEvents* events);
int32_t isaac_game_update_slice_continue_menu_gates(IsaacGameUpdateSliceState* state, const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs, IsaacGameUpdateSliceEvents* events);
int32_t isaac_game_update_slice_resume_menu_open(IsaacGameUpdateSliceState* state, const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs, IsaacGameUpdateSliceEvents* events);
int32_t isaac_game_update_slice_resume_menu_update(IsaacGameUpdateSliceState* state, const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs, IsaacGameUpdateSliceEvents* events);
int32_t isaac_game_update_slice_frame_effect_shell_drop(int32_t site_anim, int32_t site_room, int32_t site_dim, int32_t room_18304, int32_t room_182d0, uint32_t room_byte1, int32_t room_transition_mode_1830c);
int32_t isaac_game_update_slice_blue_room_74d4a0_noop(int32_t current_idx, int32_t destination_idx, int32_t direction);
int32_t isaac_game_update_slice_frame_effect_shell_drop_probed(int32_t site_anim, int32_t site_room, int32_t site_dim, int32_t room_18304, int32_t room_182d0, uint32_t room_byte1, int32_t room_transition_mode_1830c, int32_t site_direction);
int32_t isaac_game_update_slice_rewind_705ee0_noop(uint32_t guard_269ea, uint32_t guard_269eb, uint32_t guard_68d70, int32_t snapshot_arg, int32_t slot_index_676ac, uint32_t slot_valid_byte, int32_t slot_room_19d20, int32_t game_room_18304, int32_t slot_tag_e8, int32_t game_tag_0, int32_t slot_arg_1fe2c, int32_t game_frame_264f8, int32_t slot_frame_1fe30);
int32_t isaac_game_update_slice_frame_effect_shell_drop_rewound(int32_t site_anim, int32_t site_room, int32_t site_dim, int32_t room_18304, int32_t room_182d0, uint32_t room_byte1, int32_t room_transition_mode_1830c, int32_t site_direction, uint32_t rewind_guard_269ea, uint32_t rewind_guard_269eb, uint32_t rewind_guard_68d70);
/* ABI v96 (record idx 20 opaqueFrameEffect6fd7c0Shell depth): FUN_00705ee0
   CALL-ARG/ORDER laws. The body (9 observable Game stores + exact-ZHL
   Game::SaveState 0x6f9000) stays TYPED-HOST; these exports pin the pure
   part of the call seam: the frozen -1 snapshot arg pushed at BOTH Update
   sites (shell 0x006fdb4d / record-30 rewind tail 0x00806c0a), the
   ret-4 single-stack-arg signature, the self-loading receiver (0x705ee0
   reads [0xc71678]-as-Game at entry — no ecx thiscall), and the ORDER
   (shell: FIRST host call of the rewrite span, before the blue-room probe
   0x74d4a0 @0x006fdb78, with the site room re-read from [ebp-0x10]
   @0x006fdb54 after the call; tail: LAST call, direct ret-4 epilogue
   @0x806c11..0x806c17). 8 direct rel32 callers image-wide; only these two
   are on the Update path. Every scalar is uint32_t/int32_t. */
#pragma pack(push, 1)
typedef struct IsaacGameUpdateSlice705ee0CallOrder {
  uint32_t shell_call_va;     /* 0x006fdb4f — frame-effect shell site */
  uint32_t shell_arg;         /* 0xffffffff — frozen -1 (PE 0x006fdb4d) */
  uint32_t shell_first_in_span; /* 1 — first host call of the rewrite span */
  uint32_t tail_call_va;      /* 0x00806c0c — record-30 rewind tail site */
  uint32_t tail_arg;          /* 0xffffffff — frozen -1 (PE 0x00806c0a) */
  uint32_t tail_last;         /* 1 — last call; ret-4 epilogue right after */
  uint32_t receiver_self;     /* 1 — reads [0xc71678] itself; no thiscall */
  uint32_t post_call_reread;  /* 1 — PE 0x006fdb54 re-reads the site room */
} IsaacGameUpdateSlice705ee0CallOrder;
#pragma pack(pop)
int32_t isaac_game_update_slice_705ee0_call_arg(void);
void isaac_game_update_slice_705ee0_call_order_plan(IsaacGameUpdateSlice705ee0CallOrder* out);
/* ABI v96 (record idx 12 opaqueCall006fd7c0): FUN_00705ee0 write-block
   DECISION laws. The body (9 observable Game stores spanning
   Game+0x269ea..0x676ac + exact-ZHL Game::SaveState 0x6f9000) STAYS
   TYPED-HOST; these exports pin the pure decision surface around it: the
   write-block gate (reached), the new slot index (edx — always {0,1} by
   the writer-domain closure), the nine-site store mask, the payload word
   count, and the SaveState call-arg prep (receiver Game self-loaded from
   [0xc71678]; arg = newslot+4). The seam wire (emit site) is gated on the
   v74 DEAD lane frame_effect_rewind_ready and the record-12 ready lane
   opaque_call_006fd7c0_ready (merged at 11592..13736; the ABI-96 tail
   continues after 13736). Every scalar is uint32_t/int32_t (no
   uint8_t). */
#pragma pack(push, 1)
typedef struct IsaacGameUpdateSlice705ee0WritePlan {
  int32_t reached;         /* 1 = write block entered (guards clear + not a dedupe exit) */
  int32_t new_slot_index;  /* edx ∈ {0, 1-idx, idx} — {0,1} by the writer domain */
  uint32_t store_mask;     /* bits S1..S9 (0x1f6 base; +S1 mismatch; +S4 match) */
  uint32_t payload_words;  /* 0x20b — S8 loop bound (0x82c bytes) */
  int32_t save_state_fire; /* == reached — Game::SaveState 0x6f9000 fires */
  uint32_t save_state_arg; /* newslot+4 — the thiscall stack arg (receiver Game) */
  uint32_t old_slot_base;  /* Game+0x269ec + slot_index*0x20660 (S1 target) */
  uint32_t new_slot_base;  /* Game+0x269ec + new_slot_index*0x20660 (S5..S8) */
} IsaacGameUpdateSlice705ee0WritePlan;
#pragma pack(pop)
int32_t isaac_game_update_slice_705ee0_write_plan(uint32_t guard_269ea, uint32_t guard_269eb, uint32_t guard_68d70, int32_t snapshot_arg, int32_t slot_index_676ac, uint32_t slot_valid_byte, int32_t slot_room_19d20, int32_t game_room_18304, int32_t slot_tag_e8, int32_t game_tag_0, int32_t slot_arg_1fe2c, int32_t game_frame_264f8, int32_t slot_frame_1fe30, uint32_t game_base, IsaacGameUpdateSlice705ee0WritePlan* out);
int32_t isaac_game_update_slice_705ee0_write_reached_neg1(uint32_t guard_269ea, uint32_t guard_269eb, uint32_t guard_68d70);
int32_t isaac_game_update_slice_705ee0_new_slot_index(uint32_t guard_269ea, uint32_t guard_269eb, uint32_t guard_68d70, int32_t snapshot_arg, int32_t slot_index_676ac, uint32_t slot_valid_byte, int32_t slot_room_19d20, int32_t game_room_18304, int32_t slot_tag_e8, int32_t game_tag_0, int32_t slot_arg_1fe2c, int32_t game_frame_264f8, int32_t slot_frame_1fe30);
int32_t isaac_game_update_slice_705ee0_store_mask(uint32_t guard_269ea, uint32_t guard_269eb, uint32_t guard_68d70, int32_t snapshot_arg, int32_t slot_index_676ac, uint32_t slot_valid_byte, int32_t slot_room_19d20, int32_t game_room_18304, int32_t slot_tag_e8, int32_t game_tag_0, int32_t slot_arg_1fe2c, int32_t game_frame_264f8, int32_t slot_frame_1fe30);
uint32_t isaac_game_update_slice_705ee0_slot_base(uint32_t game_base, int32_t slot_index);
uint32_t isaac_game_update_slice_705ee0_save_state_arg_prep(uint32_t game_base, int32_t new_slot_index);
uint32_t isaac_game_update_slice_705ee0_payload_words(void);
int32_t isaac_game_update_slice_705ee0_slot_index_domain(int32_t slot_index);
/* ABI v102 (record idx 12 opaqueCall006fd7c0): transition/blue-room capture
   pack — LANE-FREE arm-selection laws (site args + state + committed lanes
   only; census update-v102-record12-tran). Every law consumes the
   frame-effect family law BY REFERENCE; the capture-dependent arms are
   staged in the unit NOTES §lane-requests. No uint8_t scalar params (Wasm
   i32 args are not narrowed; byte gates re-narrow in-body). */
int32_t isaac_game_update_slice_6fd7c0_args_valid(int32_t site_room, uint32_t site_anim, int32_t site_dim);
int32_t isaac_game_update_slice_6fd7c0_validate_fail_kind(int32_t site_room, uint32_t site_anim, int32_t site_dim);
uint32_t isaac_game_update_slice_6fd7c0_fatal_string_va(int32_t fail_kind);
int32_t isaac_game_update_slice_6fd7c0_fatal_level(void);
int32_t isaac_game_update_slice_6fd7c0_blue_room_reach(uint32_t site_anim, int32_t site_dim, int32_t room_transition_mode_1830c);
int32_t isaac_game_update_slice_6fd7c0_blue_room_apply_index(int32_t room_index);
int32_t isaac_game_update_slice_6fd7c0_engine_prefix_fires(int32_t valid, int32_t mode4);
/* ABI v104 (record idx 12 transition-pack REAL wiring, wave
   update-v104-record12-wire): the 6 capture-dependent arm laws of the pack.
   These consume the COMMITTED lanes + the site args; byte-gated inputs are
   FULL-DWORD lanes re-narrowed & 0xff in-body (PE AL byte tests). No
   uint8_t scalar params (Wasm i32 args are not narrowed). */
int32_t isaac_game_update_slice_6fd7c0_stage_transition_reach(uint32_t anim, uint32_t game0, uint32_t alt_probe, int32_t room_eq, int32_t room_byte1, uint32_t route_probe);
int32_t isaac_game_update_slice_6fd7c0_anim0xc_route(uint32_t anim, uint32_t game0, uint32_t alt_probe, int32_t room_eq, int32_t room_byte1, uint32_t route_probe);
int32_t isaac_game_update_slice_6fd7c0_player_loop_reach(uint32_t anim, int32_t arg3, uint32_t player_probe);
int32_t isaac_game_update_slice_6fd7c0_room_dispatch_reach(uint32_t anim, uint32_t player_probe, uint32_t room_type_8, uint32_t subroom_flag_44);
int32_t isaac_game_update_slice_6fd7c0_engine_room_arg(int32_t room_index, uint32_t blue_probe);
int32_t isaac_game_update_slice_6fd7c0_terminal_265c0_clear(uint32_t engine_pred_probe);
/* ABI v96 (record idx 10 R2, 0x004212c0): the true-probe interior PREFIX
   decision law (blob-gated pure arm, v92 98dba0-walk precedent; PE
   0x421343..0x4213cd, wait-gate 0x4213cd/0x4213d3). The interior host edge
   STAYS (0x92e430 / 0x6fd7c0 / 0x8318a0 are host leaves); these exports
   pin the prefix DECISION surface over TODAY'S lanes: the probe-true
   reach (probeReady/probeResolved/equal-flags/matchIndex/bitfield18 —
   the probe-false inversion mirrored by reference to the frozen
   frame-opaque 40add0 laws), the 9-store mask + volume gate + 6fd7c0
   args (constants), and the 0x4213d3 record-4 call-mode (mode 0/5+ =
   pure dispatch epilogue 0x8326a1 -> DROP; 1..4 = host) via the
   opaque_008318a0_ready/_mode lanes @6708/@6712 + body_case by
   reference. The manager blob was exports-only at S1 (the plan takes
   the words as raw params); the ABI-96 merge landed it as the runtime
   lanes frame_opaque_4212c0_true_probe_{mgr_base,mgr_f18,mgr_ebc,...}
   @14152..14200 + the typed event @936. No uint8_t scalar params. */
#pragma pack(push, 1)
typedef struct IsaacGameUpdateSlice4212c0TrueProbePrefixPlan {
  int32_t reached;          /* 1 = PE 0x421343 executes (probe-true, blob-gated) */
  uint32_t store_mask;      /* 9 manager sites (bits 0..8); 0x1ff when reached */
  int32_t volume_eq_one;    /* volume bits == 0x3f800000 (ucomiss jnp skip gate) */
  int32_t host_92e430_needed; /* 1 iff !eq — 0x92e430 ClearVolumeModifier fires */
  uint32_t volume_after_gate; /* eq ? volume_bits : 0x3f800000 ([se+0x10] final) */
  uint32_t se_14_bits;      /* 0x3ba3d70a — [se+0x14] = 0.005f @0x4213bb */
  uint32_t sixfd7c0_arg0;   /* -1 (0x4213b1) */
  uint32_t sixfd7c0_arg1;   /*  0 (0x4213b3) */
  uint32_t sixfd7c0_arg2;   /*  1 (0x4213b5) */
  uint32_t sixfd7c0_arg3;   /* -1 (0x4213b7) */
  uint32_t sixfd7c0_arg4;   /* -0xa (0x4213b9) */
  int32_t call_8318a0_drop; /* 1 = the 0x4213d3 edge is a pure dispatch epilogue */
} IsaacGameUpdateSlice4212c0TrueProbePrefixPlan;
#pragma pack(pop)
int32_t isaac_game_update_slice_4212c0_true_probe_reached(uint32_t probe_ready, uint32_t probe_resolved, uint32_t equal_flags_ready, const uint8_t* equal_flags, uint32_t list_count, int32_t match_index, uint32_t bitfield_18);
int32_t isaac_game_update_slice_4212c0_true_probe_prefix_plan(uint32_t probe_ready, uint32_t probe_resolved, uint32_t equal_flags_ready, const uint8_t* equal_flags, uint32_t list_count, int32_t match_index, uint32_t bitfield_18, uint32_t volume_bits, uint32_t gate_8318a0_ready, uint32_t gate_8318a0_mode, IsaacGameUpdateSlice4212c0TrueProbePrefixPlan* out);
int32_t isaac_game_update_slice_4212c0_true_probe_8318a0_drop(uint32_t gate_ready, uint32_t mode);
/* ABI v96 (record idx 10 R2, 0x004212c0, v98 interior LIVE seam): the
   step-scratch of the composed true-probe interior prefix plan (48 B,
   12 words — the same struct the prefix_plan law fills). Filled by
   apply_frame_opaque_4212c0_pure when the ABI-96 blob is live (blob
   ready + probe ready + probe TRUE) and the @936 typed event fires;
   zeroed every step otherwise. The host reads the scratch after the step
   to apply the interior bodies (9-store mask, volume gate 0x92e430,
   0x6fd7c0 args, 8318a0 drop). plan_words = sizeof(...)/4. */
uintptr_t isaac_game_update_slice_4212c0_true_probe_prefix_plan_address(void);
uint32_t isaac_game_update_slice_4212c0_true_probe_prefix_plan_words(void);
int32_t isaac_game_update_slice_engine_prefix_drop_latched(uint32_t engine_anm2_latch);
int32_t isaac_game_update_slice_engine_anm2_lane_pure(uint32_t engine_anm2_blob_ready, uint32_t engine_anm2_latch_ready, uint32_t engine_anm2_layer_count, uint32_t engine_anm2_extra_count, uint32_t engine_anm2_latch);
int32_t isaac_game_update_slice_engine_anm2_load_lane(IsaacGameUpdateSliceState* state, const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs, IsaacGameUpdateSliceEvents* events);
/* ABI v95: record idx 21 ANM2::Load (0x0040bd50) frame decision laws —
   which of the six pre-lane host callees fire (0x40e2b0 prologue,
   0x40ccd0 assign, 0x40db90 cache guard, 0x40e110 cache fetch, 0x40c000
   loader, 0x408830 x2 anim applies) + the ordered host-call count. Pure;
   the host callees stay host. Every scalar param is uint32_t (no uint8_t
   scalar params). */
int32_t isaac_game_update_slice_engine_anm2_load_path_present(uint32_t path_size_10);
int32_t isaac_game_update_slice_engine_anm2_load_path_is_self(uint32_t this_addr, uint32_t path_addr);
int32_t isaac_game_update_slice_engine_anm2_load_graphics_needed(uint32_t loadgraphics_in);
int32_t isaac_game_update_slice_engine_anm2_load_frame_host_calls(uint32_t path_size_10, uint32_t this_addr, uint32_t path_addr, uint32_t loadgraphics_in);
int32_t isaac_game_update_slice_engine_anm2_load_site_host_calls(void);
/* ABI v96 (record idx 21 opaqueRoomTransitionEnginePrefix depth): the
   ANM2::Load LATCH one-shot laws. The latch byte = Game+0x1b97d =
   engine-base+0x141 = recv+0x109 (recv = Game+0x1b874); ANM2::Load S1
   (PE 0x0040bdb2 `mov byte [esi+0x109],1`, UNCONDITIONAL) is the ONLY
   writer on the Update path (image-wide disp-0x141 census: 1 write
   0x70e447 + 2 cmp 0x8db65e/0x8dba13, NONE in the prefix's 15-function
   closure; absolute Game+0x1b97d: ZERO references), so the latch goes
   0->1 on first load and NEVER clears -> the prefix arm (PE 0x82ee9e
   BYTE test) is FIRST-LOAD-ONLY. latch_after_load mirrors S1's byte
   store (high bytes of the captured latch word preserved);
   load_arm_run is the positive form of the 0x82ee9e gate
   (engine_prefix_drop_latched is the negative); latch_one_shot pins the
   invariant latch_after == latch_after_load(latch_pre). Every scalar is
   uint32_t (no uint8_t scalar params). */
uint32_t isaac_game_update_slice_engine_anm2_latch_after_load(uint32_t latch_pre);
int32_t isaac_game_update_slice_engine_anm2_load_arm_run(uint32_t latch);
int32_t isaac_game_update_slice_engine_anm2_latch_one_shot(uint32_t latch_pre, uint32_t latch_after);
/* ABI v97 (wave-22 Unit A, record 22 rank opaqueRoomTransitionEnginePrefix):
   the pre-lane host half becomes TYPED. Pure NAMING laws for the six
   ANM2::Load (0x0040bd50) host callees the record's gated arm still fires —
   H1 prologue 0x40e2b0, H2 filename assign 0x40ccd0 (Game+0x1b874..0x1b888),
   H3 cache guard 0x40db90, H4 cache fetch 0x40e110 (globals 0xc798b8/bc/c0),
   H5 graphics loader 0x40c000 (leaf Manager::LoadImage 0x9588a0; the v8
   plan/apply store lane), H6a/H6b anim applies 0x408830 x2 (recv+0x30 =
   Game+0x1b8a4, recv+0x50 = Game+0x1b8c4) — plus the composed v8-wire
   decision and the typed-host-edge mask over the LIVE engine_anm2_* lanes.
   Unit A was exports-only; the ABI-96 coordinator merge committed the
   H2/H4/LoadImage EMISSION events (engine_anm2_prefix_* @944/948/952) and
   the capture lanes (engine_anm2_* @14212..14244); Unit B (ABI v98) folds
   the record under the standing LoadImage/cache decision — see the v98
   declarations below. Every scalar is uint32_t (no uint8_t scalar
   params). */
int32_t isaac_game_update_slice_engine_anm2_prologue_va(void);
int32_t isaac_game_update_slice_engine_anm2_prologue_argc(void);
int32_t isaac_game_update_slice_engine_anm2_filename_assign_needed(uint32_t this_addr, uint32_t path_addr);
int32_t isaac_game_update_slice_engine_anm2_filename_assign_sso_source(uint32_t source_cap);
uint32_t isaac_game_update_slice_engine_anm2_filename_src_chars(uint32_t source_addr, uint32_t source_cap, uint32_t heap_ptr);
uint32_t isaac_game_update_slice_engine_anm2_filename_ptr_offset(void);
uint32_t isaac_game_update_slice_engine_anm2_filename_size_offset(void);
uint32_t isaac_game_update_slice_engine_anm2_filename_cap_offset(void);
uint32_t isaac_game_update_slice_engine_anm2_cache_guard_va(void);
uint32_t isaac_game_update_slice_engine_anm2_cache_fetch_va(void);
uint32_t isaac_game_update_slice_engine_anm2_cache_fetch_globals_base(void);
uint32_t isaac_game_update_slice_engine_anm2_cache_fetch_globals_words(void);
uint32_t isaac_game_update_slice_engine_anm2_loadgraphics_va(void);
uint32_t isaac_game_update_slice_engine_anm2_loadimage_va(void);
int32_t isaac_game_update_slice_engine_anm2_loadgraphics_entered(uint32_t layer_count);
int32_t isaac_game_update_slice_engine_anm2_loadgraphics_skip_predicate(uint32_t flag_30);
int32_t isaac_game_update_slice_engine_anm2_loadgraphics_flag_normalize(uint32_t flag);
uint32_t isaac_game_update_slice_engine_anm2_anim_apply_first_offset(void);
uint32_t isaac_game_update_slice_engine_anm2_anim_apply_second_offset(void);
uint32_t isaac_game_update_slice_engine_anm2_anim_apply_arg(void);
uint32_t isaac_game_update_slice_engine_anm2_anim_apply_count(void);
int32_t isaac_game_update_slice_engine_anm2_v8_wire_decision(uint32_t engine_anm2_blob_ready, uint32_t engine_anm2_latch_ready, uint32_t engine_anm2_latch, uint32_t engine_anm2_layer_count, uint32_t engine_anm2_extra_count, uint32_t loadgraphics_in);
int32_t isaac_game_update_slice_engine_anm2_prefix_typed_host_events(uint32_t engine_anm2_blob_ready, uint32_t engine_anm2_latch_ready, uint32_t engine_anm2_latch, uint32_t engine_anm2_layer_count, uint32_t engine_anm2_extra_count, uint32_t path_size_10, uint32_t this_addr, uint32_t path_addr, uint32_t loadgraphics_in);
/* ABI v98 (wave-22 Unit B, record 22 rank opaqueRoomTransitionEnginePrefix):
   the standing LoadImage/cache decision laws + the H6 anim-apply gate
   translation, consuming the ABI-96 COMMITTED capture lanes (runtime tail
   14212..14244) and driving the typed emissions (events 944/948/952).
   prefix_fold_ready = the REMOVAL gate (all five vouchers: blob/latch/
   filename/anim/loadgraphics_flag_ready); cache_fetch_decision =
   lane_pure && filename_ready (H4 0x40e110 straight-line, globals
   0xc798b8/bc/c0); loadimage_decision = lane_pure && loadgraphics_flag_ready
   && entered(layer_count) UNSIGNED && graphics_needed LOW-BYTE (leaf
   0x9588a0 via 0x40c000); anim_apply_decision = lane_pure && anim_ready
   (H6a/H6b 0x408830 x2, push 0, recv+0x30/+0x50). When all vouchers are
   LIVE + latch low byte clear + counts<=32, the emission site drops the
   coarse opaque_room_transition_engine_prefix counter and fires the typed
   events; any voucher 0 keeps the pre-v98 residual byte-for-byte. ABI
   stays 96; layouts frozen; every scalar is uint32_t (no uint8_t scalar
   params). */
int32_t isaac_game_update_slice_engine_anm2_prefix_fold_ready(uint32_t engine_anm2_blob_ready, uint32_t engine_anm2_latch_ready, uint32_t engine_anm2_filename_ready, uint32_t engine_anm2_anim_ready, uint32_t engine_anm2_loadgraphics_flag_ready);
int32_t isaac_game_update_slice_engine_anm2_cache_fetch_decision(uint32_t engine_anm2_blob_ready, uint32_t engine_anm2_latch_ready, uint32_t engine_anm2_latch, uint32_t engine_anm2_layer_count, uint32_t engine_anm2_extra_count, uint32_t engine_anm2_filename_ready);
int32_t isaac_game_update_slice_engine_anm2_loadimage_decision(uint32_t engine_anm2_blob_ready, uint32_t engine_anm2_latch_ready, uint32_t engine_anm2_latch, uint32_t engine_anm2_layer_count, uint32_t engine_anm2_extra_count, uint32_t loadgraphics_in, uint32_t engine_anm2_loadgraphics_flag_ready);
int32_t isaac_game_update_slice_engine_anm2_anim_apply_decision(uint32_t engine_anm2_blob_ready, uint32_t engine_anm2_latch_ready, uint32_t engine_anm2_latch, uint32_t engine_anm2_layer_count, uint32_t engine_anm2_extra_count, uint32_t engine_anm2_anim_ready);
int32_t isaac_game_update_slice_global_tree_4aba0_pure(uint32_t begin, uint32_t end, uint32_t count, const IsaacGlobalTree4aba0Node* nodes);
int32_t isaac_game_update_slice_resume_frame_aux_updates(IsaacGameUpdateSliceState* state, const IsaacGameUpdateSliceConstants* constants, const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs, IsaacGameUpdateSliceEvents* events);
int32_t isaac_game_update_slice_resume_stage_transition_effect(IsaacGameUpdateSliceState* state, const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs, IsaacGameUpdateSliceEvents* events);
int32_t isaac_game_update_slice_hud_message_text_out_need(uint32_t flag_8, uint32_t ptr_54, uint32_t played_64, uint32_t words_0, uint32_t words_1);

uint32_t isaac_game_update_slice_host_746560_notify_byte(uint32_t param);
int32_t isaac_game_update_slice_host_746560_deathmatch_suffix(uint32_t cleanup_mode);
/* ABI v95 (record idx 6, 0x00746560 notify string-build decision laws).
   All six are pure DECISIONS of the body's string build + widget argument
   assembly (see the enum comment); the intern-alloc 0xa2c370 and the ANM2
   widget 0x840b00 stay typed-host. uint32_t params everywhere, re-narrowed
   in the body (Wasm ABI does not narrow i32 args). */
uint32_t isaac_game_update_slice_746560_string_data_ptr(uint32_t cap, uint32_t ptr, uint32_t base);
int32_t isaac_game_update_slice_746560_string_found(uint32_t size);
uint32_t isaac_game_update_slice_746560_free_plan(uint32_t cap, uint32_t ptr, uint32_t block_header);
int32_t isaac_game_update_slice_746260_walk_count(uint32_t end, uint32_t begin);
int32_t isaac_game_update_slice_746260_index_matches(uint32_t acc, uint32_t clear, uint32_t index);
int32_t isaac_game_update_slice_7460b0_gate_26584(uint32_t mode);
int32_t isaac_game_update_slice_98dba0_timer_block_live(uint32_t timer_264e8);
/* ABI v92: empty-vector player-walk gate. vector_count mirrors
   0x0098dbd2..0x0098dbde (mov/sub/sar 2, FULL dword, 32-bit wrap). pure_skip
   is the 0x0098dbe1 test/jne + 0x0098dc11 test/je decision: count==0 -> the
   walk loop is a PROOF-COMPLETE pure skip (host fatal log 0xa112c0 only). */
int32_t isaac_game_update_slice_98dba0_walk_vector_count(uint32_t begin, uint32_t end);
int32_t isaac_game_update_slice_98dba0_walk_pure_skip(uint32_t begin, uint32_t end);
uint32_t isaac_game_update_slice_98dba0_timer_theta_bits(uint32_t sample);
uint32_t isaac_game_update_slice_98dba0_timer_mag_bits(uint32_t timer_after_dec);
uint32_t isaac_game_update_slice_98dba0_timer_trig_narrow_bits(uint32_t result_bits_lo, uint32_t result_bits_hi);
uint32_t isaac_game_update_slice_98dba0_timer_axis_bits(uint32_t trig_bits, uint32_t mag_bits, uint32_t old_bits);
int32_t isaac_game_update_slice_8ef990_join_skip(uint32_t probe, uint32_t idx8);
int32_t isaac_game_update_slice_8ef990_join_956780_closed(uint32_t game, uint32_t node_bd, uint32_t node_f10, uint32_t node_ptr, uint32_t sentinel);
/* ABI v95 (record idx 9 listener registry, 0xc57b18 surface): the pure
   walk/find DECISION laws of the record-9 probe-arm accept gate. The
   virtual Notify dispatch (vtbl+0x74 = 0xa20fb0), the [0xc7e814] hook and
   the obj release chain stay typed-host; the host captures per-element
   class-bits (ids + bits[16]; bit0 present, bit1 active, bit2 release,
   bits 4..9 accept for the six fixed record-9 modes 0xe/0xf/0x16/0x17/0x14/
   0x15) and these laws reproduce the accept decision in-module. count is
   the captured element count (<= 16; ready gate). uint32_t params only. */
int32_t isaac_game_update_slice_8ef990_listener_count(uint32_t begin, uint32_t end);
int32_t isaac_game_update_slice_8ef990_listener_find(uint32_t count, uint32_t value, const uint32_t* ids);
int32_t isaac_game_update_slice_8ef990_listener_arm_accept(uint32_t count, uint32_t value, uint32_t mode_index, const uint32_t* ids, const uint32_t* bits);
int32_t isaac_game_update_slice_8ef990_listener_walk_accept(uint32_t count, uint32_t mode_index, const uint32_t* bits);
/* ABI v96 (record idx 9 TAIL-A seam 0x8efcea..0x8efdd1, unit
   update-v96-record9-tailalaws): the peelable decision laws. slot_empty
   mirrors the D1 branch PE 0x8efcf4 mov eax,[M+0x4b3d8] / 0x8efcfa cmp
   eax,[M+0x4b3dc] / 0x8efd00 je 0x8efd3e — FULL-dword begin==end (MP slot
   empty -> ARM B; wide 0x100/0xffffffff compare equal, never byte-narrow).
   else_reset_{state,mode,value} mirror the store triple PE 0x8efdd1..0x8efde4
   ([edi]=2 / [edi+0xc]=8 / [edi+4]=0xffffffff); path-agnostic — find-fail
   0x8ef9d8, count==0 0x8ef9e0 and the TAIL-A fallthrough write the SAME
   triple. taila_956780_closed is the site-pinned (0x8efd9f) re-export of
   the v93 join_956780_closed law: the RTE 956780 gate closed -> the prep is
   a pure no-op and the played id stays the fallback 0x36 (PE 0x8efd97 mov
   [esp+0x10],0x36). taila_sfx_id mirrors the OPEN-path roll select (PE
   0x956806 seeds 0x25; 0x95686e overwrites 0x12d iff the magic-mul mod-20
   zero test 0x956850..0x95686c hits, UNSIGNED % 20 computed in-module):
   roll % 20 == 0 ? 0x12d : 0x25 — the xorshift RNG chain [0xc5d2b0] stays
   host. uint32_t params only. */
int32_t isaac_game_update_slice_8ef990_taila_slot_empty(uint32_t slot_begin, uint32_t slot_end);
int32_t isaac_game_update_slice_8ef990_else_reset_state(void);
int32_t isaac_game_update_slice_8ef990_else_reset_mode(void);
int32_t isaac_game_update_slice_8ef990_else_reset_value(void);
int32_t isaac_game_update_slice_8ef990_taila_956780_closed(uint32_t game, uint32_t node_bd, uint32_t node_f10, uint32_t node_ptr, uint32_t sentinel);
int32_t isaac_game_update_slice_8ef990_taila_sfx_id(uint32_t roll);
/* ABI v94 (R3 log-split, record idx 10): FUN_0040add0 probe-arm split laws.
   log_needed mirrors PE 0x40addc cmp [ebx+4],0 / 0x40ade0 jne — FULL-DWORD
   compare, 0x100 must NOT log. probe_pure_false mirrors PE 0x40adfb test /
   0x40adfd je -> al=0 (empty animation-name list): the post-log MISS law,
   reachable on BOTH field_4 arms (the log falls through into the probe
   flow). */
int32_t isaac_game_update_slice_4212c0_add0_log_needed(uint32_t field_4);
int32_t isaac_game_update_slice_4212c0_add0_probe_pure_false(uint32_t list_count);
/* ABI v95 (record idx 2 0x009b6840 MenuGateUpdate): body pure laws from the
   full-body census (section-notes/update-v95-menu-update-census/NOTES.md).
   Zero uint8_t scalar params (Wasm ABI does not narrow): every law takes
   uint32_t and re-narrows in the body. Gate/arm-select/store laws only —
   the host leaves (FCO 0x9be080, ANM2 0x40b430/0x408b90/0x40a5d0/
   0x40a380/0x40aaf0/0x408e00/0x409030/0x425130, walks 0x6edfa0/0x90aeb0/
   0x90b100/0x907b60/0x9b7f90/0x417870, fatal 0xa112c0, 0xa288a0,
   [vt+0x1c]/[vt+0xc]/[0xc7f60c]) stay host. */
int32_t isaac_game_update_slice_9b6840_mode_latch_needed(uint32_t status_22ed4);
int32_t isaac_game_update_slice_9b6840_fco_probe_needed(uint32_t mp_begin, uint32_t mp_end);
int32_t isaac_game_update_slice_9b6840_walk_count_needed(uint32_t count);
int32_t isaac_game_update_slice_9b6840_walk_entry_needed(uint32_t type_28, uint32_t variant_2c);
int32_t isaac_game_update_slice_9b6840_tail_render_needed(uint32_t mode, uint32_t byte_249, uint32_t byte_135);
int32_t isaac_game_update_slice_9b6840_anim_layer_ok(uint32_t anim_max, uint32_t requested);
int32_t isaac_game_update_slice_9b6840_anim_id_ok(uint32_t anim_nonzero, uint32_t id, uint32_t count);
/* ABI v95 (record idx 10 R1): the 4212c0 ANM2-pair plan scratch (A/B
   409030 decision -> ADVANCE/REWIND typed events). The host reads the
   plan after the step; plan_words = sizeof(IsaacGameUpdateSlice4212c0Anm2Plan)/4. */
uintptr_t isaac_game_update_slice_4212c0_anm2_plan_address(void);
uint32_t isaac_game_update_slice_4212c0_anm2_plan_words(void);
/* ABI v95 (record idx 39): RNG::RandomInt zero-seed FULL-DWORD law
   (PE 0x007e9028 test edx,edx); drives the mid-restock typed-event drop. */
int32_t isaac_game_update_slice_mid_restock_seed_zero(uint32_t seed58);

/* ABI v123 (record idx 38 opaqueRoomUpdateTailMid706cExpire): shop-restock
   body 0x008158a0 (Room::ShopRestockPartial) LAW PACK — exports-only
   landing (update-v123-706c-restock-laws; ADDENDUM 3 F1-F4). Fresh decode
   cpu-dump/008158a0.txt re-verified branch-by-branch. Typed-host residual
   classes (2x 0x428b20 creates per item / [vtbl+0x14] item-def call /
   untraced 0x6eef60 getter / reachable zero-hash fatal) keep the boundary
   counted; layouts frozen, ABI stays 99. */
int32_t isaac_game_update_slice_706c_shop_gate(uint32_t room_type_8);
uint32_t isaac_game_update_slice_706c_bucket_parity(uint32_t cursor);
uint32_t isaac_game_update_slice_706c_bucket_index(uint32_t cursor,
                                                   uint32_t count);
uint32_t isaac_game_update_slice_706c_counter_inc_cap255(uint32_t byte_val);
int32_t isaac_game_update_slice_706c_idiv_quot(int32_t item_id,
                                               int32_t width);
int32_t isaac_game_update_slice_706c_idiv_rem(int32_t item_id,
                                              int32_t width);
float isaac_game_update_slice_706c_pos_x(int32_t rem);
float isaac_game_update_slice_706c_pos_y(int32_t quot);
int32_t isaac_game_update_slice_706c_vcall_arm(uint32_t slot_ptr,
                                               uint32_t item_id);
int32_t isaac_game_update_slice_706c_hash_zero(uint32_t hash_in);
uint32_t isaac_game_update_slice_706c_xorshift_step(uint32_t x);

/* ABI v95 (record idx 30 roomTriggerClearAwardsGreed): greedy-arm laws of
   Room::TriggerClear (VA 0x008068f0) — greed special-mode 2/3 arm
   0x806b9e..0x806c0a (FUN_009bf990/009bfae0 residual) + the unconditional
   0x705ee0 tail. Full transcriptions in the cpp banner; PE truth from
   cpu-dump 008068f0.txt/00806bf0.txt. Every scalar param is uint32_t or
   int32_t (no uint8_t scalar params; explicit low-byte re-narrow). */
int32_t isaac_game_update_slice_trigger_clear_greed_mode(int32_t difficulty_269c8);
int32_t isaac_game_update_slice_trigger_clear_greed_arm(uint32_t room_type_8, uint32_t room_subtype_1bb0);
int32_t isaac_game_update_slice_trigger_clear_greed_expected(int32_t difficulty_269c8);
int32_t isaac_game_update_slice_trigger_clear_greed_match(int32_t store_value_18334, int32_t difficulty_269c8);
int32_t isaac_game_update_slice_trigger_clear_greed_next(int32_t arm, int32_t probe_al, int32_t match);
int32_t isaac_game_update_slice_trigger_clear_greed_tail_always(void);
/* ABI v95 (record idx 37, opaqueRoomUpdateTailMid): pure DECISION laws of
   the three always-body calls (curse FUN_00820910 / greed-special
   FUN_00801ee0 / room mid-tail FUN_00800500) — arg prep + gate shapes,
   census 0x00805378..0x008053e2. The bodies STAY typed-host (stateful:
   genrand/create/vcall, Game stores + wave/music/SFX, entity walks +
   intensity posts). Laws wrap the room family's proven transcriptions
   (isaac_room_tailmid_*, package ABI 53) so the update slice owns them
   as its own ABI contracts. Every scalar param is uint32_t/int32_t/float
   — no uint8_t scalar params (explicit low-byte re-narrow in body). */
/* Curse outer gate (PE 0x80537e..0x8053aa, 4 pure clauses) — IsPaused
   excluded (host sample); needs_host folds the sample (PE 0x8053ac test
   al,al / 0x8053b3 jne). */
int32_t isaac_game_update_slice_tailmid_curse_gate_open(
    uint32_t game_flags_1839c, uint32_t room_desc_flags_44,
    uint32_t room_active_byte0, int32_t frame_264f8, int32_t room_entry_11f0);
int32_t isaac_game_update_slice_tailmid_curse_needs_host(
    uint32_t game_flags_1839c, uint32_t room_desc_flags_44,
    uint32_t room_active_byte0, int32_t frame_264f8, int32_t room_entry_11f0,
    uint32_t is_paused);
/* Curse body post (PE 0x82091e..0x820927 or dword [desc+0x44],0x4000) +
   create/imms arg prep (PE 0x820948..0x820959). */
uint32_t isaac_game_update_slice_tailmid_curse_flag_or_4000(
    uint32_t room_desc_flags_44);
uint32_t isaac_game_update_slice_tailmid_curse_arg_zero(void);
uint32_t isaac_game_update_slice_tailmid_curse_pos_vec_ptr(void);
uint32_t isaac_game_update_slice_tailmid_curse_effect_type(void);
uint32_t isaac_game_update_slice_tailmid_curse_effect_variant(void);
/* 801ee0 gates (PE 0x801efa..0x801f96): difficulty 2/3 early-out; 723c
   countdown; boss = max(0, 12c0+12c4) SIGNED (cmovg 0x801f29); timer-reset
   boss<=0 && post>=0x14 (0x801f30 cmp/jl); spawn-wave pre>0 && post==0
   (0x801f0e jle + 0x801f4d test/jne); special stage7/type5/!flag/players. */
int32_t isaac_game_update_slice_tailmid_801ee0_is_greed_mode(
    int32_t difficulty_269c8);
int32_t isaac_game_update_slice_tailmid_801ee0_boss_count(
    int32_t count_12c0, int32_t count_12c4);
int32_t isaac_game_update_slice_tailmid_801ee0_needs_timer_reset(
    int32_t post_timer_723c, int32_t boss_count);
int32_t isaac_game_update_slice_tailmid_801ee0_needs_spawn_wave(
    int32_t post_timer_723c, int32_t pre_timer_723c);
int32_t isaac_game_update_slice_tailmid_801ee0_needs_special(
    int32_t stage0, int32_t room_type_8, uint32_t game_flags_1839c,
    int32_t player_count);
/* 801ee0 posts + arg prep (PE 0x801f41 timer=0x13; 0x802005 desc &~0x40;
   0x802011 flags |=0x1000; special create type=0x14 variant=0). */
int32_t isaac_game_update_slice_tailmid_801ee0_timer_set_13(void);
uint32_t isaac_game_update_slice_tailmid_801ee0_desc_clear_bit40(
    uint32_t room_desc_flags_44);
uint32_t isaac_game_update_slice_tailmid_801ee0_game_flag_or_1000(
    uint32_t game_flags_1839c);
/* 800500 gates (PE 0x800730..0x80074e early skip IsPaused && gate1b83c==0;
   0x80076c cmp/jbe empty list; 0x80111c..0x80113f intensity; 0x80078f..
   0x80081f include candidate + multi-gate; LAB_00801544 approach). */
int32_t isaac_game_update_slice_tailmid_800500_early_skip(
    uint32_t is_paused, int32_t gate_1b83c);
int32_t isaac_game_update_slice_tailmid_800500_entity_list_empty(
    uint32_t count_1264);
float isaac_game_update_slice_tailmid_800500_avg_intensity(
    float threat_sum, int32_t threat_count);
int32_t isaac_game_update_slice_tailmid_800500_type_in_threat_band(
    int32_t type_28);
int32_t isaac_game_update_slice_tailmid_800500_outer_include_candidate(
    int32_t game_dim_26614, int32_t type_28);
int32_t isaac_game_update_slice_tailmid_800500_entity_include(
    int32_t entity_nonzero, int32_t game_dim_26614, int32_t type_28,
    uint32_t flag_byte_173, int32_t short_c74, float float_39c,
    int32_t int_31c, uint32_t flags_168, uint32_t flags_16c);
float isaac_game_update_slice_tailmid_800500_approach(
    float curr, float target, float step);
float isaac_game_update_slice_tailmid_800500_default_intensity(void);
/* 800500 timer 72fc pure CF (PE 0x801bf9..0x801c4e). */
int32_t isaac_game_update_slice_tailmid_800500_timer_72fc_needs_host(
    int32_t timer_72fc);
int32_t isaac_game_update_slice_tailmid_800500_timer_72fc_inc(
    int32_t timer_72fc);
int32_t isaac_game_update_slice_tailmid_800500_timer_72fc_needs_sfx_play(
    int32_t post_inc);
int32_t isaac_game_update_slice_tailmid_800500_timer_72fc_needs_isplaying_host(
    int32_t post_inc);
int32_t isaac_game_update_slice_tailmid_800500_timer_72fc_clear_neg1(void);
/* ABI v95 (record idx 40, opaqueRoomUpdateTailMid7230Spawn): spawn-loop
   FRAME laws. Frame = PE 0x008054ab..0x00805527 (countdown Room+0x7230 +
   periodic spawn every 5 frames, signed): gate (pre>0 && pre%5==0,
   0x8054b1 jle + 0x8054bf idiv remainder), PER-ITERATION BOUND RE-READ
   (0x805515 RE-READS Room+0x7230 after the pos/genrand/spawn/RTTI host
   calls; the decrement is UNCONDITIONAL on the re-read, 0 -> -1),
   the 0x00813460 pos math (spans/unit/max_span/centers — radius_arg =
   unit*max_span is THE SQRT ARGUMENT), the CRT sqrt platform-primitive
   gate (0x00435a50, host iff ORDERED 0.0 > arg; NaN/-0.0 stay inline),
   and the typed spawn-call arg prep (0x00428b20 push imms type 4 /
   variant 3 / 0xc7b640 / 0xc5d838 / 0xc5d5dc / zeros) + the typed host
   call sequence VAs (pos 813460 -> genrand 6eef60 -> spawn 428b20 ->
   RTTI af08b1). Every scalar param is int32/uint32/float — no uint8_t
   scalar params. */
int32_t isaac_game_update_slice_tailmid_7230_gate_open(int32_t pre_timer_7230);
int32_t isaac_game_update_slice_tailmid_7230_counter_next(int32_t re_read_counter);
float isaac_game_update_slice_tailmid_7230_span_x(float x0, float x1);
float isaac_game_update_slice_tailmid_7230_span_y(float y0, float y1);
float isaac_game_update_slice_tailmid_7230_unit_float(uint32_t genrand);
float isaac_game_update_slice_tailmid_7230_max_span(float span_x, float span_y);
float isaac_game_update_slice_tailmid_7230_center_x(float x0, float span_x);
float isaac_game_update_slice_tailmid_7230_center_y(float y0, float span_y);
float isaac_game_update_slice_tailmid_7230_sqrt_arg(float unit, float max_span);
int32_t isaac_game_update_slice_tailmid_7230_sqrt_host_needed(float sqrt_arg);
uint32_t isaac_game_update_slice_tailmid_7230_spawn_type(void);
uint32_t isaac_game_update_slice_tailmid_7230_spawn_variant(void);
uint32_t isaac_game_update_slice_tailmid_7230_spawn_pos_vec_ptr(void);
uint32_t isaac_game_update_slice_tailmid_7230_spawn_arg_ptr_a(void);
uint32_t isaac_game_update_slice_tailmid_7230_spawn_arg_ptr_b(void);
uint32_t isaac_game_update_slice_tailmid_7230_spawn_push_zero(void);
uint32_t isaac_game_update_slice_tailmid_7230_game_room_offset(void);
uint32_t isaac_game_update_slice_tailmid_7230_pos_call_va(void);
uint32_t isaac_game_update_slice_tailmid_7230_genrand_call_va(void);
uint32_t isaac_game_update_slice_tailmid_7230_spawn_call_va(void);
uint32_t isaac_game_update_slice_tailmid_7230_rtti_call_va(void);
/* ABI v95 (record idx 36 opaqueRoomUpdateTailWaterB16): pure DECISION laws
   of the FUN_00823540 chain (census 0x00823540, B16 lava sub-block of
   FrameOpaque_802980, callsite PE 0x805373). The chain = FUN_00823370
   (per-cell water/lava float math over the 6-float vector) + FUN_0074efd0
   (lerp-run predicate over Game fields) + FUN_007067c0 (spray/fx state
   update on Game+0x676b4..0x676fc). The 0x4288a0 challenge-store lookups
   (0x6f9400/0x6f95a0) and the Game+0x676d0/+0x676e8 apply stay
   TYPED-HOST; this law set publishes the exact decision + computed
   content. Every scalar param is uint32_t/int32_t — no uint8_t scalar
   params. */
typedef struct IsaacGameUpdateSliceB16WaterState {
  float water_post;         /* Room+0x7240 after the pure water step */
  float lava_pre;           /* Room+0x7740 before the lava decay (0x80524a) */
  uint32_t game_byte_183a0; /* [Game+0x183a0] byte (spray flag, 0x823557) */
  uint32_t game_byte_269e9; /* [Game+0x269e9] byte (spray flag, 0x823560) */
  uint32_t game_1830c;      /* [Game+0x1830c] full dword (0x8233d9 cmp 1) */
  uint32_t room_type_8;     /* Room+8 full dword (0x8233af cmp 7/8/0x1d) */
  uint32_t difficulty_269c8;/* [Game+0x269c8] full dword (74efd0) */
  uint32_t game_type_0;     /* [Game+0] full dword (74efd0 arg type) */
  uint32_t game_subtype_4;  /* [Game+4] full dword (74efd0 arg subtype) */
  uint32_t flags_2654c;     /* [Game+0x2654c] bit16 gate (74efd0) */
  uint32_t unlock_acc;      /* 0x6f9400()|Game[0xc]|Game[0x26550] (host) */
  uint32_t unlock_clear;    /* 0x6f95a0() (host) */
  float src_1b10[6];        /* Room+0x1b10..+0x1b28 (SKIPS +0x1b20) */
  uint32_t grid_flags_44;   /* dword [Room+4+0x44] (bit9/bit5 gates) */
  uint32_t room_1d18;       /* Room+0x1d18 full dword (== 0x20 gate) */
  uint32_t grid_w_c;        /* Room+0xc (cell count w-2) */
  uint32_t grid_h_10;       /* Room+0x10 (cell count h-2) */
  uint32_t cell_dword_54;   /* dword [Room+4+0x54] (int32->float) */
  float fx_cur[6];          /* Game+0x676b8..0x676cc (spray cur) */
  /* outputs */
  uint32_t gate;            /* byte target Game+0x676b4 (0/1) */
  float step[6];            /* Game+0x676d0..0x676e4 float bits */
  float goal[6];            /* Game+0x676e8..0x676fc float bits (gate==1) */
  float cur_snap[4];        /* Game+0x676b8..0x676c4 write (gate==0) */
} IsaacGameUpdateSliceB16WaterState;
/* 0x0074efd0..0x0074f02e (arg = Game): difficulty 2/3 -> false; type in
   [1..6] && bit16 of flags_2654c -> false; subtype {4,5} required;
   type==4 -> true; type==3 -> (acc & ~clear & 2) != 0 (0x748490 fold);
   else false. */
int32_t isaac_game_update_slice_b16_gate_74efd0(
    uint32_t difficulty_269c8, uint32_t game_type_0, uint32_t game_subtype_4,
    uint32_t flags_2654c, uint32_t unlock_acc, uint32_t unlock_clear);
/* Whole 0x00823540 chain (FUN_00823370 vector step + FUN_007067c0 spray
   apply). Caller gates with isaac_room_b16_needs_823540 (the machine runs
   the chain only when 0 < water_post && 0 < lava_pre). */
void isaac_game_update_slice_b16_water_wire(IsaacGameUpdateSliceB16WaterState* state);
/* ABI v95 (record idx 38, opaqueRoomUpdateTailMid706cExpire): pure
   DECISION laws of the 706c expire arm (census 0x008158a0). Countdown
   gate PE 0x8053e2..0x80540a (test pre / jle skip; dec; store; test
   post / jg skip; store -1; mov ecx,Room; call 0x8158a0): host fires
   iff pre>0 && (pre-1)<1. The body FUN_008158a0 = Room::
   ShopRestockPartial(this=room) STAYS TYPED-HOST (stateful bucket walk,
   item-def vcall, two 0x428b20 creates, [RoomData+0x5c] hash state);
   these laws publish the expire decision + the body's typed arg/state:
   room-is-shop [Room+8]==2 (0x8158ae), has-items [Room+0x7080]!=0
   (0x8158b7), item counter byte ++ with 0xff cap (0x815915..0x815922,
   LOW-BYTE), bucket cell (idx>>1)&(count-1) wrap + parity (0x8158e8..
   0x81590b), item-def vcall gate item<=0x1bf UNSIGNED (0x81599c), FNV-
   ish hash step (0x8159cb..0x8159ea; shifts masked &31, x86 cl), idiv
   pos floats (0x815969..0x815997; f32 one-rounding ops), create imms
   drop type 0x96 variant 5 / extra type 0x3e8 variant 0xf + [entity+
   0x32c]=item id (0x8159fa..0x815a31). Every scalar param is uint32_t/
   int32_t/float — no uint8_t scalar params. */
int32_t isaac_game_update_slice_tailmid_706c_needs_expire_host(
    int32_t pre_timer_706c);
int32_t isaac_game_update_slice_tailmid_706c_countdown_next(
    int32_t pre_timer_706c);
int32_t isaac_game_update_slice_tailmid_706c_expire_room_is_shop(
    uint32_t room_type_8);
int32_t isaac_game_update_slice_tailmid_706c_expire_has_items(
    uint32_t count_7080);
int32_t isaac_game_update_slice_tailmid_706c_expire_item_counter_byte_inc(
    uint32_t counter_byte);
uint32_t isaac_game_update_slice_tailmid_706c_expire_bucket_cell(
    uint32_t index_707c, uint32_t count_7078);
uint32_t isaac_game_update_slice_tailmid_706c_expire_bucket_parity(
    uint32_t index_707c);
int32_t isaac_game_update_slice_tailmid_706c_expire_item_def_vcall_needed(
    uint32_t item_id);
uint32_t isaac_game_update_slice_tailmid_706c_expire_hash_step(
    uint32_t hash, uint32_t shift_c1, uint32_t shift_c2, uint32_t shift_c3);
float isaac_game_update_slice_tailmid_706c_expire_pos_y(
    int32_t rem_idiv, uint32_t c4_bits);
float isaac_game_update_slice_tailmid_706c_expire_pos_x(
    int32_t quot_idiv, uint32_t c4_bits, uint32_t c5_bits);
uint32_t isaac_game_update_slice_tailmid_706c_expire_drop_type(void);
uint32_t isaac_game_update_slice_tailmid_706c_expire_drop_variant(void);
uint32_t isaac_game_update_slice_tailmid_706c_expire_extra_type(void);
uint32_t isaac_game_update_slice_tailmid_706c_expire_extra_variant(void);
uint32_t isaac_game_update_slice_tailmid_706c_expire_entity_item_off(void);
uint32_t isaac_game_update_slice_tailmid_706c_expire_host_va(void);
/* ABI v95 (record idx 3, 0x0092f1c0 gate-1ba78): case-arm pure laws.
   dispatch_case mirrors PE 0x92f1f0..0x92f1fc: mov eax,[ebx]; dec eax;
   cmp eax,3; ja 0x92ff60; jmp [eax*4+0x92ffa4] — FULL-DWORD (u32)(mode-1)>3
   (0x101/large-high-byte modes are pure). try_pure proves the pure-tail
   exits: dispatch<0 (switch default: tail only, zero stores/calls) OR
   mode==2 (case 1): (u32)counter < (u32)limit (PE 0x92fa0f cmp/0x92fa11 jb)
   && counter != limit-2 (PE 0x92fd7e lea/0x92fd83 jne) && (counter !=
   limit-1 (PE 0x92fe46 lea/0x92fe4b jne -> tail) || (field_14 & 0xff) != 0
   (PE 0x92fe51 cmp byte/0x92fe55 jne -> tail)) OR mode==3 (case 2):
   (u32)counter < (u32)limit (PE 0x92feaa cmp/0x92fead jb -> tail) &&
   !(counter==2 && (field_14 & 0xff) != 0) (PE 0x92fe8b cmp/0x92fe90 cmp
   byte/0x92fea2 jb -> 0x7eb1b0 host). Modes 1 (case 0) and 4 (case 3) are
   NEVER pure — the Room interior 0x4186c0 call is UNCONDITIONAL before
   eligibility (0x92f231 / 0x92fee9). counter_next mirrors PE 0x92ff60 inc
   dword [ebx+4] (32-bit wrap). Every scalar param is uint32_t: no uint8_t scalar params. */
int32_t isaac_game_update_slice_92f1c0_dispatch_case(uint32_t mode);
int32_t isaac_game_update_slice_92f1c0_try_pure(uint32_t mode, uint32_t counter, uint32_t limit, uint32_t field_14);
uint32_t isaac_game_update_slice_92f1c0_counter_next(uint32_t counter);
/* ABI v116 (record idx 3 case-arm leaves, ABI 99 frozen exports-only):
   0x0074f090 is a COMPLETE 14-insn predicate (37 B, 0 E8 / 0 IND / 0
   fs:[0] / 0 cookie / identify-zhl EMPTY). PE 0x74f090 mov eax,[ecx];
   0x74f092 dec eax; 0x74f093 cmp eax,5; 0x74f096 ja 0x74f0b2 (xor al,al
   ret) — UNSIGNED (u32)(type-1)>5. Else Game+0x2654c & 0x10000 (PE
   0x74f09d..0x74f0ad FULL-dword bit16) -> AL=1 else 0. Captured inputs:
   type=[ecx], flags_2654c=[Game+0x2654c]. 0x007eb1b0 stays HOST-always
   (435 insn / 15 E8 / 3 IND / 1 cookie); peelable prefix gates only:
   FULL-dword [Game+0x26584]==0x2c (0x7eb1c4 cmp / 0x7eb1d6 jne ->
   0x74f690) and ==0x2d (0x7eb1f8 / 0x7eb202 jne). Every scalar param is
   uint32_t: no uint8_t scalar params. Wide drives unmasked. */
uint32_t isaac_game_update_slice_74f090_type_ok(uint32_t type);
uint32_t isaac_game_update_slice_74f090_flag(uint32_t flags_2654c);
uint32_t isaac_game_update_slice_74f090_result(uint32_t type, uint32_t flags_2654c);
uint32_t isaac_game_update_slice_7eb1b0_mode_2c(uint32_t mode_26584);
uint32_t isaac_game_update_slice_7eb1b0_mode_2d(uint32_t mode_26584);
/* ABI v117 (record idx 3, 0x0074f690 mode-44 stage-type helper; ABI 99
   frozen exports-only): pure decision layer around the ONE host call
   (Game::GetRoomByIdx 0x740bc0 exact-ZHL, PE 0x74f6cf) gated by BYTE
   [ebx+0x183a0] (PE 0x74f6c3 cmp byte / 0x74f6ca jne -> skip). Body
   0x74f690..0x74f813: 117 insns / 0 resync / 1 E8 / 0 IND / 0 fs:[0] /
   0 cookie / 4 exits ret 4 (0x74f6bc, 0x74f74b, 0x74f7b9, 0x74f813).
   33 direct E8 callers image-wide (incl. 0x7eb1e0 inside 0x7eb1b0);
   0 E9 / push-imm / mov-imm / raw dword. identify-zhl EMPTY.
   entry_plan mirrors PE 0x74f69c cmp dword [Game+0x26584],0x2c / 0x74f6a3
   jne (FULL-dword re-test in-body); 0x74f6a8 cmp esi,-0xa; 0x74f6ad cmp
   [ebx],7 (FULL-dword) -> const 4 (0x74f7b1) else [ebx+4] (0x74f6b6);
   0x74f6bf test esi,esi / js -> [ebx+4] (SIGNED); BYTE flag 0x183a0
   != 0 -> stage dispatch WITHOUT the host call; else the GetRoomByIdx
   plan (host call, then [desc+0x10] gate + clamp + re-dispatch).
   Plans: 0 TYPE4 ([ebx+4]) / 1 CONST4 (return 4) / 2 GETROOM (host) /
   3 STAGE (dispatch with room_idx as-is).
   clamp_desc_dword0 mirrors PE 0x74f6da..0x74f6ed: SIGNED cmovle -> 0,
   cmovl vs 0xa8. Runs in-PE only when [desc+0x10]!=0; that gate is the
   bridge's, the law is the total clamp.
   grid_dist mirrors PE 0x74f76b..0x74f7a9: SIGNED /13 twice (magic
   0x4ec4ec4f, sar 2 + shr 31 sign fix) on slot_field
   ([[this+0x18314]*0xb8]+0x14) and room_idx_final; dist =
   |r1-r2| + |q1-q2| (13-wide grid, cdq/xor/sub absolute values).
   stage_route mirrors PE 0x74f6f0 mov eax,[ebx] (POST-call re-read);
   0x74f6f2 cmp eax,6 / 0x74f6f5 jg — SIGNED (stage 0xffffffff = -1
   routes TABLE_LO, an unsigned compare would NOT); 0x74f74e cmp 7 je /
   0x74f753 cmp 8 / 0x74f756 jne -> TYPE4; womb arm 0x74f7ac cmp ecx,3 /
   0x74f7af jg (SIGNED) far -> hi table else const 4.
   Routes: 0 TABLE_LO / 1 WOMB_NEAR_RET4 / 2 WOMB_FAR_HI / 3 TYPE4.
   table_type mirrors PE 0x74f6f7..0x74f74b (lo arm) / 0x74f7c3..0x74f813
   (hi arm): f32 * 5.0 ([0xbaa784] = 0x40a00000), maxss 0.0 (NaN folds
   to 0), minss 4.999f ([0xbaa780] = 0x3f9ff7cf), cvttss2si trunc, idx =
   a*5+c (0x74f72e lea eax,[eax+eax*4]), dword tables 0xb6a878 (lo) /
   0xb6a8e0 (hi), 25 entries each (hash-bound). table_sel 0 -> lo,
   nonzero -> hi. Every scalar param is uint32_t: no uint8_t scalar
   params. Byte gates &0xff in-body; wide drives unmasked. */
int32_t isaac_game_update_slice_74f690_entry_plan(uint32_t mode_26584,
                                                  uint32_t room_idx,
                                                  uint32_t stage_0,
                                                  uint32_t flag_183a0);
uint32_t isaac_game_update_slice_74f690_clamp_desc_dword0(uint32_t desc_dword0);
int32_t isaac_game_update_slice_74f690_grid_dist(uint32_t slot_field,
                                                 uint32_t room_idx_final);
int32_t isaac_game_update_slice_74f690_stage_route(uint32_t stage_after,
                                                   uint32_t room_idx_final,
                                                   uint32_t slot_field);
uint32_t isaac_game_update_slice_74f690_table_type(uint32_t table_sel,
                                                   uint32_t fa_bits,
                                                   uint32_t fb_bits);
/* ABI v95 (record idx 4, 0x008318a0 mode-1/3/4 host bodies): pure decision
   layers for the mode-1 0x831915 / mode-3 0x8320c6 / mode-4 0x83243b
   bodies. 0x4186c0 (receiver Game+0x18300+0x1218) and the ANM2 pair stay
   typed-host; these laws drive dispatch selection, arg prep and the
   byte/full-word gates in-module.
   body_case mirrors PE 0x831902 mov eax,[ebx]; dec; cmp 3; ja 0x8326a1;
   jmp [eax*4+0x8327bc] — FULL-DWORD (u32)(mode-1) > 3 folds to 0
   (0x101/large-high-byte modes are case 0, NOT 1..4). Returns the jump
   table entry index 1..4 or 0.
   mode3_advance_signed mirrors PE 0x8320c6 mov eax,[ebx+4]; 0x8320c9 cmp
   eax,[ebx+8]; 0x8320cc jl 0x8320bd — SIGNED (int32)counter < (int32)limit
   -> the shared advance 0x8320bd (inc + store + 0x832663 common tail).
   A WIDE counter 0xffffffff (=-1) with limit 1 MUST advance (signed).
   mode4_sfx_gate mirrors PE 0x83243b cmp [ebx+0x1c],3 / jne 0x832488 and
   0x832441 cmp [ebx+4],8 / jne 0x832488 — BOTH FULL-DWORD equality
   (type_1c==3 && counter==8): the pre-0x4186c0 SFX prep (0x956780 +
   0x92dc30, arg 0xd6) fires. 0x103 / 0x1008 must NOT open it.
   4186c0_arg = the push 1 at 0x83191a/0x832368/0x8323da/0x832490 (arg
   prep constant); 4186c0_receiver_offset = 0x18300+0x1218 (Game-relative).
   mode1_slot_gate mirrors PE 0x83195a cmp [ebx+0x1c],0x13 — FULL-WORD
   equality: the 8-slot virtual loop (0x831970, slots 0x724..0x744) runs.
   Every scalar param is uint32_t: no uint8_t scalar params. The mode-3
   shared advance + common tail RATIO/status stores are applied in-module by
   the gate-1b83c wire consuming the HUD 8318a0 advance law BY REFERENCE
   (isaac_hud_8318a0_advance_fires/ratio_f32_bits/tail_stores_needed). */
int32_t isaac_game_update_slice_8318a0_body_case(uint32_t mode);
int32_t isaac_game_update_slice_8318a0_mode3_advance_signed(uint32_t counter,
                                                            uint32_t limit);
int32_t isaac_game_update_slice_8318a0_mode4_sfx_gate(uint32_t type_1c,
                                                      uint32_t counter);
uint32_t isaac_game_update_slice_8318a0_4186c0_arg(void);
uint32_t isaac_game_update_slice_8318a0_4186c0_receiver_offset(void);
int32_t isaac_game_update_slice_8318a0_mode1_slot_gate(uint32_t type_1c);
/* ABI v96 (record idx 4, 0x008318a0 modes 1/2/4 decision laws; evidence
   disasm-8318a0-full.txt, extent 0x8318a0..0x8327bb, int3 pad 0x8327dc,
   next fn 0x8327e0): mode-1 SFX-manager block + tail, mode-2 gates + 0x418
   fold, mode-4 per-player gates, and the blob-gated walk arm (v92
   precedent BY REFERENCE). The SFX-manager object base is 0xc798e0 (.data
   BSS — file-backed .data ends VA 0xc61800; OUTSIDE BINARY_LAYOUT, no
   capture lanes this wave: the store-plan globals and byte_7c are
   ABI-96 lane requests). Every scalar param is uint32_t/int32_t: no
   uint8_t scalar params. The 9-store typed plan (sfx_manager_store_plan)
   is the future typed-host event payload (intended event
   opaque_008318a0_sfx_manager_stores for the coordinator merge). */
typedef struct IsaacGameUpdateSlice8318a0SfxManagerStore {
  uint32_t mgr_off;
  uint32_t size;
  uint32_t value;
  uint32_t element; /* 1 = queue node at 0x684f30() return, mgr_off node-rel */
} IsaacGameUpdateSlice8318a0SfxManagerStore;
#define ISAAC_GAME_UPDATE_SLICE_8318A0_SFX_MANAGER_STORES 9
/* ABI v102 (record idx 4, 0x008318a0 store-plan APPLICATION arm; evidence
   update-v102-record4-apply NOTES §1/§2): the typed per-row apply plan
   the module EMITS into the step scratch when the mode-1 manager block
   0x831e31..0x831f34 runs (gate open). store_mask names the block's 9
   store sites (bits 0..8; 0x1ff when the block runs, 0 otherwise — the
   module's application decision per candidate_found outcome; the ONLY
   gated store is row 0, byte [node+4], PE guard @0x831e5d test edx,edx /
   je = node+4 != 0 — a HOST-apply condition on the element=1 rows, the
   node being the residual 0x684f30() return). Rows are the v96
   sfx_manager_store_plan rows (element=1 -> queue node, mgr_off
   node-relative; element=0 -> 0xc798e0-relative BSS). 148 B = 4 + 9x16;
   the host reads it after the step via the address/words exports. */
#define ISAAC_GAME_UPDATE_SLICE_8318A0_SFX_MANAGER_STORE_MASK 0x1ffu
#pragma pack(push, 1)
typedef struct IsaacGameUpdateSlice8318a0SfxManagerStoreApplyPlan {
  uint32_t store_mask;
  IsaacGameUpdateSlice8318a0SfxManagerStore
      rows[ISAAC_GAME_UPDATE_SLICE_8318A0_SFX_MANAGER_STORES];
} IsaacGameUpdateSlice8318a0SfxManagerStoreApplyPlan;
#pragma pack(pop)
uint32_t isaac_game_update_slice_8318a0_sfx_manager_store_apply_plan(
    uint32_t global_798e4, uint32_t global_79790, uint32_t global_7978c,
    uint32_t global_79948, IsaacGameUpdateSlice8318a0SfxManagerStoreApplyPlan* out);
uintptr_t isaac_game_update_slice_8318a0_sfx_manager_store_apply_plan_address(void);
uint32_t isaac_game_update_slice_8318a0_sfx_manager_store_apply_plan_words(void);
/* ABI v142 (record idx4, 0x008318a0 rt_band_pop typed carrier; evidence
   contracts-idx4-engine-band NOTES §1/§4/§5): the pure derivation of the
   mode-1 store block's band deltas over the ALREADY-CAPTURED sfx globals
   (@13736..13748 — zero new capture roots). depth_after = [0xc79790]-1
   (32-bit wrap; the PE sub @0x831f1b fires AFTER the underflow log-check
   join 0x831f05); latch_after = [0xc7978c] post @0x831f27/2f (cmove:
   0 iff depth_after==0 else the pre value); params[5] = the five constant
   stores 0xc79900..0xc79910 derived purely ({0, byte[0xc798e4]&4==0?6:1,
   7, 1, 7} — PE 0x831ea0/ebd/ead/ec2/ecc). The four opaque thiscall
   leaves (0xa18300/0xa18230/0xa19180) stay HOST actions. Returns the
   param count (5); out == nullptr -> count constant, nothing written
   (plan-request pattern). */
#define ISAAC_GAME_UPDATE_SLICE_8318A0_RT_BAND_POP_PARAMS 5u
#pragma pack(push, 1)
typedef struct IsaacGameUpdateSlice8318a0RtBandPop {
  uint32_t depth_after;
  uint32_t latch_after;
  uint32_t params[ISAAC_GAME_UPDATE_SLICE_8318A0_RT_BAND_POP_PARAMS];
} IsaacGameUpdateSlice8318a0RtBandPop;
#pragma pack(pop)
uint32_t isaac_game_update_slice_8318a0_rt_band_pop(
    uint32_t global_798e4, uint32_t global_79790, uint32_t global_7978c,
    IsaacGameUpdateSlice8318a0RtBandPop* out);
int32_t isaac_game_update_slice_8318a0_mode1_manager_block_gate(
    uint32_t candidate_found, uint32_t type_1c, uint32_t field_14);
int32_t isaac_game_update_slice_8318a0_mode1_clear_walk_gate(uint32_t field_10,
                                                             uint32_t type_1c);
int32_t isaac_game_update_slice_8318a0_mode1_player_171_store(
    uint32_t type_1c, uint32_t field_10, uint32_t player,
    uint32_t saved_1bb74);
uint32_t isaac_game_update_slice_8318a0_sfx_manager_store_plan(
    uint32_t global_798e4, uint32_t global_79790, uint32_t global_7978c,
    uint32_t global_79948, IsaacGameUpdateSlice8318a0SfxManagerStore* out);
/* ABI v99 (record idx 4, 0x008318a0 mode-1 walk fold; evidence
   update-v99-record4-fold NOTES): the per-player entry-write laws now
   foldable onto the committed pack rows. Byte-gate u32 carriers (+&0xff);
   NO uint8_t params. mode1_walk_entry_zero_arm (PE 0x831a19..0x831a59:
   type==0 && score-block reach -> byte 0 into b1398/b139a, and the
   candidate_found clear is unreachable — the v98 seam's missing type
   term); mode1_walk_entry_171_zero (PE 0x831a95..0x831af8: b171=0 iff
   zero-arm || FULL-DWORD w3fc==4 on the score path); reset_span_clear_
   writes (PE 0x831d6c..0x831db4: 0xb/0x10 && field_14==0x18304 -> all
   non-null span slots get b171=0 + w410=1). */
int32_t isaac_game_update_slice_8318a0_mode1_walk_entry_zero_arm(
    uint32_t type_1c, uint32_t b173, uint32_t b1398, uint32_t b139a,
    uint32_t ptr7c, uint32_t b34);
int32_t isaac_game_update_slice_8318a0_mode1_walk_entry_171_zero(
    uint32_t type_1c, uint32_t b173, uint32_t b1398, uint32_t b139a,
    uint32_t ptr7c, uint32_t b34, uint32_t w3fc);
int32_t isaac_game_update_slice_8318a0_mode1_reset_span_clear_writes(
    uint32_t type_1c, uint32_t field_14);
int32_t isaac_game_update_slice_8318a0_mode1_tail_mode_set(uint32_t type_1c,
                                                           uint32_t field_10);
int32_t isaac_game_update_slice_8318a0_mode1_tail_830950_call(
    uint32_t type_1c, uint32_t field_10);
int32_t isaac_game_update_slice_8318a0_mode2_lane_gate(uint32_t predicate_238);
int32_t isaac_game_update_slice_8318a0_mode2_direct_tail_gate(
    uint32_t vec_begin, uint32_t byte_7c);
int32_t isaac_game_update_slice_8318a0_mode2_fast_reset(uint32_t counter,
                                                        uint32_t limit);
int32_t isaac_game_update_slice_8318a0_mode2_player_418_next(uint32_t cur_418);
int32_t isaac_game_update_slice_8318a0_mode4_walk_call_gate(
    uint32_t byte_1398, uint32_t byte_139a, uint32_t ptr_7c, uint32_t byte_34);
int32_t isaac_game_update_slice_8318a0_mode4_name_string_gate(
    uint32_t byte_1398, uint32_t byte_139a);
int32_t isaac_game_update_slice_8318a0_mode4_final_reset_gate(
    uint32_t last_leave);
int32_t isaac_game_update_slice_8318a0_walk_pure_skip(uint32_t begin,
                                                      uint32_t end);
/* ABI v99 exports-only (idx 4, update-v118-8318a0-leftovers): leftover
   pure decision gates of FUN_008318a0. Hit bodies stay typed-host.
   Every scalar param is uint32_t (byte gates re-narrow & 0xff in-body). */
/* ABI v133 (update-v133-audio-music-pack, records idx26/27): spawn-tail
   plan-Out scratch (module writes one Out per consumed row under the
   tca40/tca83b0 vouchers; the host reads them via these accessors and
   applies each in PE order). */
uintptr_t isaac_game_update_slice_tca40_tail_plan_out_address(void);
uint32_t isaac_game_update_slice_tca40_tail_plan_out_max(void);
uintptr_t isaac_game_update_slice_tca83b0_tail_plan_out_address(void);
uint32_t isaac_game_update_slice_tca83b0_tail_plan_out_max(void);
/* ABI v138: ALT-tail plan-Out scratch (112-B IsaacRoomTca83B0AltItemOut
   x8); the host reads/applies each Out in PE order under the
   tca83b0_alt_tail_pack_ready voucher. */
uintptr_t isaac_game_update_slice_tca83b0_alt_tail_plan_out_address(void);
uint32_t isaac_game_update_slice_tca83b0_alt_tail_plan_out_max(void);
enum {
  ISAAC_GAME_UPDATE_8318A0_MODE3_ARM_SET4 = 0,
  ISAAC_GAME_UPDATE_8318A0_MODE3_ARM_ANIM = 1,            /* 0x7ab380 */
  ISAAC_GAME_UPDATE_8318A0_MODE3_ARM_ANIM2 = 2,           /* 0x7ab550 */
  ISAAC_GAME_UPDATE_8318A0_MODE3_ARM_SFX_ANIM = 3,        /* type 7 SFX then 0x7ab380 */
  ISAAC_GAME_UPDATE_8318A0_MODE3_ARM_WALK_410_ALWAYS = 4, /* 4186c0 + 410=1 */
  ISAAC_GAME_UPDATE_8318A0_MODE3_ARM_WALK_410_COND = 5    /* 4186c0 + 410 iff 26614<2 SIGNED */
};
static constexpr uint32_t ISAAC_GAME_UPDATE_8318A0_PICKUP_TYPE = 0x3c5u;
static constexpr uint32_t ISAAC_GAME_UPDATE_8318A0_PICKUP_VARIANT = 0xau;
static constexpr uint32_t ISAAC_GAME_UPDATE_8318A0_MODE3_FLAG_2000000 = 0x2000000u;
static constexpr uint32_t ISAAC_GAME_UPDATE_8318A0_HOST_VA_7AB380 = 0x007ab380u;
static constexpr uint32_t ISAAC_GAME_UPDATE_8318A0_HOST_VA_7AB550 = 0x007ab550u;
int32_t isaac_game_update_slice_8318a0_pickup_latch(uint32_t ptr_234,
                                                    uint32_t type_28,
                                                    uint32_t variant_2c);
int32_t isaac_game_update_slice_8318a0_mode1_score_block_gate(
    uint32_t type_1c, uint32_t player, uint32_t candidate, uint32_t score);
int32_t isaac_game_update_slice_8318a0_mode1_type13_pickup_gate(
    uint32_t type_1c, uint32_t ptr_234, uint32_t type_28, uint32_t variant_2c);
int32_t isaac_game_update_slice_8318a0_mode1_type13_b64_exit(uint32_t field_b64);
uint32_t isaac_game_update_slice_8318a0_mode1_4ce0f0_esi_remap(uint32_t ret,
                                                              uint32_t type_1c);
int32_t isaac_game_update_slice_8318a0_mode3_membership_hit(uint32_t al);
int32_t isaac_game_update_slice_8318a0_mode3_flag_2000000_skip(uint32_t flags_16c);
int32_t isaac_game_update_slice_8318a0_mode3_type3_string_gate(uint32_t type_1c);
uint32_t isaac_game_update_slice_8318a0_mode3_miss_arm(uint32_t type_1c);
uint32_t isaac_game_update_slice_8318a0_mode3_true_arm(uint32_t type_1c);
uint32_t isaac_game_update_slice_8318a0_mode3_anim_arg(uint32_t type_1c,
                                                      uint32_t membership_hit);
int32_t isaac_game_update_slice_8318a0_mode3_anim_live(uint32_t saved_1bb74);
int32_t isaac_game_update_slice_8318a0_mode3_walk_410_cond(uint32_t field_26614);
uint32_t isaac_game_update_slice_8318a0_mode3_host_va_7ab380(void);
uint32_t isaac_game_update_slice_8318a0_mode3_host_va_7ab550(void);
static_assert(sizeof(uint32_t) == 4,
              "8318a0 leftover byte gates travel as uint32_t");

/* ABI v95 (record idx 34 B13 H5 per-loop create arm): pure laws that TYPE
   the entity-create host call (0x6fe410 stays TYPED HOST). loop_count_from_age
   = PE 0x824b60 test ecx,ecx / 0x824b7f sete al / 0x824b9c lea eax,[eax*4+1]
   (age==0 ? 5 : 1). create_args_plan = PE 0x824c97..0x824cc2 (type 0x3e8 /
   variant 0x8a / layer 0 / data 0xb1bc54 / a1 1 / seed R3 / game 0xc71678).
   r4_genrand_needed = PE 0x824cd8 test edi,edi / 0x824cda je (FULL-DWORD). */
int32_t isaac_game_update_slice_ambient_824a70_loop_count_from_age(uint32_t age);
void isaac_game_update_slice_ambient_824a70_create_args_plan(uint32_t seed, IsaacGameUpdateSliceAmbient824a70CreateArgs* out);
int32_t isaac_game_update_slice_ambient_824a70_r4_genrand_needed(uint32_t anim_count);
uintptr_t isaac_game_update_slice_ambient_824a70_create_args_address(void);
uint32_t isaac_game_update_slice_ambient_824a70_create_args_max(void);
/* ABI v95 (record idx 43): TriggerDeath CALL-ARG laws — the composed
   event's arg-prep. receiver = walk cursor element (PE 0x9bb643 cmp/jae
   OOB clamp to element 0 + 0x9bb647 lea begin+index*4; count2 =
   (end-begin)>>2 sar); flag = ALWAYS 0 (PE 0x9bb67d push 0,
   checkOnly=false); arg_prep composes {receiver, flag, can_trigger=
   eligible}. The call 0x007a1090 stays typed-host. */
uint32_t isaac_game_update_slice_death_call_receiver(uint32_t begin, uint32_t end, uint32_t index);
int32_t isaac_game_update_slice_death_call_flag(void);
void isaac_game_update_slice_death_call_arg_prep(uint32_t begin, uint32_t end, uint32_t index, uint32_t eligible, IsaacGameUpdateSliceDeathCallArgPrep* out);
/* ABI v95 (record idx 22 opaqueRoomTransitionEngineBody): pre-call decision
   laws of the record-22 player-loop body (FUN_0082ee40, PE 0x0082f049..
   0x0082f084; census update-v95-82ee40-body-entry/NOTES.md). All FIVE are
   pure SELECTION laws over the captured entry blob — the module decides
   which per-entry host call fires + its args; the 0x7abcc0/0x7abe20
   bodies (Rewind 0x40a1b0 / ANM2::Reset 0x407f10 heap zeros, unconditional
   stores [entry+0x139a]/[entry+0x14c]/[entry+0x1398], Sprite::Play
   0x40a5d0, SFX 0x956780/0x92dc30) STAY TYPED-HOST (player-entry objects
   outside the capture ABI). Every scalar param is uint32_t/int32_t — no
   uint8_t scalar params; the entry-0x173 byte is re-narrowed with & 0xff. */
int32_t isaac_game_update_slice_82ee40_body_predicate(uint32_t field_1c);
int32_t isaac_game_update_slice_82ee40_body_7abcc0_needed(uint32_t predicate, uint32_t entry_173_byte);
int32_t isaac_game_update_slice_82ee40_body_7abcc0_arg(uint32_t anim);
int32_t isaac_game_update_slice_82ee40_body_7abe20_needed(uint32_t field_1c, uint32_t predicate, uint32_t entry_173_byte);
void isaac_game_update_slice_82ee40_body_entry_plan(uint32_t eligible, uint32_t predicate, uint32_t entry_173_byte, uint32_t field_1c, uint32_t anim, IsaacGameUpdateSlice82ee40BodyEntryPlan* out);
/* ABI v95 (record idx 22): per-entry eligibility gate [entry+0x2c]==0
   (PE 0x82f049 cmp dword; jne skip — FULL-DWORD). */
int32_t isaac_game_update_slice_82ee40_body_eligible(uint32_t entry_2c);
/* ABI v95 (record idx 19 opaqueCall006fd7c0Mode4Sfx): mode-4 SFX ARG/seed
   laws as the composed typed-event arg-prep. All consume the frame-effect
   v18 family laws BY REFERENCE (isaac_frame_effect_6fd7c0_* — never
   re-derived here). PE anchors: seed select 0x6fd825 (mov 0xbb) /
   0x6fd8e4 (mov 0xd7); rare 0x95685b..0x95686c (UNSIGNED % 20 == 0);
   id 0x956806 (mov 0x25) / 0x95686e (mov 0x12d); args 0x6fd83a..0x6fd851
   (loop slot = the push 0 at 0x6fd84c); receiver 0x6fd858 lea
   [esi+0x2a324]. Every scalar param is uint32_t/int32_t — no uint8_t. */
int32_t isaac_game_update_slice_6fd7c0_mode4_sfx_seed(uint32_t special);
int32_t isaac_game_update_slice_6fd7c0_sfx_rare_hit(uint32_t mixed_counter);
int32_t isaac_game_update_slice_6fd7c0_sfx_play_id(int32_t seed_id,
                                                   int32_t remap_gate_open,
                                                   int32_t rare_hit);
uint32_t isaac_game_update_slice_6fd7c0_sfx_play_args(uint32_t* out_args,
                                                      uint32_t len,
                                                      int32_t sfx_id);
uint32_t isaac_game_update_slice_6fd7c0_sfx_manager_receiver(uint32_t base);
void isaac_game_update_slice_6fd7c0_mode4_sfx_arg_prep(
    uint32_t special, int32_t remap_gate_open, uint32_t mixed_counter,
    uint32_t base, IsaacGameUpdateSlice6fd7c0Mode4SfxArgPrep* out);
/* ABI v96 (record idx 46 playerManagerUpdateHeartbeatSfxPlay depth): the
   PLAY CONTINUATION body-law mirrors. The v88 typed-leaf split landed the
   ENTRY gate (isaac_sfx_play_gate + *_host discriminators BY REFERENCE);
   the continuation body laws (window A4 0x92dd04, seed A6 0x92dd51,
   voice select/pick A7 0x92dd75/0x92dd82, volume-clamp A9 0x92de22)
   live in the SFX family (isaac_sfx_play_window_open / isaac_sfx_rng_next
   / isaac_sfx_voice_select / isaac_sfx_voice_pick_offset /
   isaac_sfx_voice_volume_clamped) and are FORWARDED here BY REFERENCE —
   never re-derived. The composed continuation plan runs the ordered
   A4->A6->A7->A9 chain: window closed (A4 side-effect-free ret
   0x92de8b) -> seed unchanged, no voice, body_reached 0; window open ->
   seed_out = rng_next(seed), voice = select(seed_out, voices),
   offset = pick(voice), volume_bits = f32 bits of the clamped product,
   body_reached 1. Scalar params uint32_t/int32_t/float — no uint8_t. */
int32_t isaac_game_update_slice_sfx_play_window_open(int32_t clock_4abbc, int32_t entry_end_4);
uint32_t isaac_game_update_slice_sfx_play_seed_next(uint32_t seed, uint32_t shift1, uint32_t shift2, uint32_t shift3);
uint32_t isaac_game_update_slice_sfx_voice_select(uint32_t seed_out, uint32_t voices);
int32_t isaac_game_update_slice_sfx_voice_pick_offset(uint32_t voice_index);
float isaac_game_update_slice_sfx_voice_volume_clamped(float mgr_volume_modifier, float volume, float master_volume);
#pragma pack(push, 1)
typedef struct IsaacGameUpdateSliceSfxPlayContinuation {
  int32_t window_open;        /* A4 — 1 when Play proceeds past 0x92dd06 */
  uint32_t seed_out;          /* A6 — 0xc5d2a0 after the xorshift step */
  uint32_t voice_index;       /* A7 — seed_out % voices (0 when voices==0) */
  int32_t voice_offset;       /* A7 — voice_index * 0x38, 32-bit wrap */
  uint32_t volume_bits;       /* A9 — f32 bits of min(clamp0(mod)*vol*master,1) */
  int32_t body_reached;       /* continuation edge: window_open (A4 gate) */
} IsaacGameUpdateSliceSfxPlayContinuation;
#pragma pack(pop)
void isaac_game_update_slice_sfx_play_continuation(
    uint32_t clock_4abbc, int32_t entry_end_4, uint32_t rng_seed,
    uint32_t voices, float mgr_volume_modifier, float volume,
    float master_volume, IsaacGameUpdateSliceSfxPlayContinuation* out);
/* ABI v95 (record idx 33 opaqueRoomUpdateClearDoors): type-5 door loop
   frame laws (PE 0x8042be..0x8042f3; census update-v95-clear-doors-type5).
   loop_count = 8 (count bound, mov eax,8 + per-iteration counter
   store/reload 0x8042c9/e1/ea/ed/f3 — never folded). door_open_needed =
   present != 0 && field_c == 5 (FULL-DWORD both: 0x8042d2 test ecx,ecx/je +
   0x8042d6 cmp dword [ecx+0xc],5/jne). host_va = FUN_00710dd0, stack_arg_count
   = 0 (arg prep: thiscall ecx=door ptr at 0x8042dc). plan = per qualifying
   door (present && field_c==5 && failing the FUN_00710dd0 early-out
   prologue — isaac_door_helper_710dd0_early_out, the callee's pure no-op
   gate) {slot_index, present, field_3a0, field_8, field_c} in machine slot
   order. plan_address/max_entries expose the module scratch the wire
   publishes (host runs 0x710dd0(Room+0x724[slot_index]) per entry when
   events->type5_door_open_calls > 0). */
uint32_t isaac_game_update_slice_type5_door_loop_count(void);
int32_t isaac_game_update_slice_type5_door_open_needed(uint32_t present, int32_t field_c);
uint32_t isaac_game_update_slice_type5_door_open_host_va(void);
uint32_t isaac_game_update_slice_type5_door_open_stack_arg_count(void);
/* ABI v99 leaf peel (idx 23): FUN_00710dd0 OPEN TAIL prefix
   (0x00710e0d..0x00710e43, before host 0x748760). early_out already
   peeled. No uint8_t params. */
int32_t isaac_game_update_slice_710dd0_open_tail_arm_0xb(uint32_t field_160);
int32_t isaac_game_update_slice_710dd0_open_tail_bl(uint32_t field_15c);
int32_t isaac_game_update_slice_710dd0_open_tail_skip_after_748760(
    uint32_t host_al, uint32_t field_392, uint32_t bl);
uint32_t isaac_game_update_slice_710dd0_open_tail_host_va_748760(void);
/* ABI v99 exports-only (idx 23, update-v112-710dd0-rest): FUN_00710dd0
   OPEN TAIL REST 0x00710e51..0x00710f64 (rets 0x710edc/0x710f4a +
   jmp-70ee40 0x710eb8/0x710f5f; int3 pad; next fn 0x710f70). Complete
   small helpers 0x5cd5f0 / 0x710f70 / 0x711740 (predicate 0x711740..
   0x71177f, NOT the SEH body at 0x711780). Byte gates take uint32_t
   and re-narrow & 0xff. No uint8_t scalar params. */
int32_t isaac_game_update_slice_5cd5f0(uint32_t field_15c, uint32_t field_160,
                                      uint32_t arg);
int32_t isaac_game_update_slice_710f70(uint32_t field_160, int32_t game_18334,
                                      uint32_t game_269c8);
int32_t isaac_game_update_slice_711740(uint32_t field_394, uint32_t game_18308,
                                      uint32_t mgr_begin, uint32_t mgr_end,
                                      uint32_t field_154);
int32_t isaac_game_update_slice_710dd0_join_flag_or_20000(uint32_t field_8);
uint32_t isaac_game_update_slice_710dd0_join_flag_or_mask(void);
int32_t isaac_game_update_slice_710dd0_join_boss_close(uint32_t field_8,
    uint32_t field_160, uint32_t field_394, uint32_t game_18370);
uint32_t isaac_game_update_slice_710dd0_join_boss_field8(void);
uint32_t isaac_game_update_slice_710dd0_join_else_field8(void);
uint32_t isaac_game_update_slice_710dd0_join_else_field_c(void);
int32_t isaac_game_update_slice_710dd0_arm_15c_0xb(uint32_t field_15c);
int32_t isaac_game_update_slice_710dd0_skip_after_15c_0xb(uint32_t game_265e8,
                                                        uint32_t field_392);
uint32_t isaac_game_update_slice_710dd0_rest_field8_arm(uint32_t field_8);
int32_t isaac_game_update_slice_710dd0_rest_field8_eq_8(uint32_t field_8);
int32_t isaac_game_update_slice_710dd0_room_40_ja(uint32_t room_40);
uint32_t isaac_game_update_slice_710dd0_711740_false_field_c(void);
uint32_t isaac_game_update_slice_710dd0_getroom_arg1(void);
uint32_t isaac_game_update_slice_710dd0_host_va_5cd5f0(void);
uint32_t isaac_game_update_slice_710dd0_host_va_710f70(void);
uint32_t isaac_game_update_slice_710dd0_host_va_740bc0(void);
uint32_t isaac_game_update_slice_710dd0_host_va_711740(void);
uint32_t isaac_game_update_slice_710dd0_host_va_70ee40(void);
void isaac_game_update_slice_type5_door_open_plan(const IsaacGameUpdateDoorSlotRuntime* slots, IsaacGameUpdateSliceType5DoorOpenPlan* out);
uintptr_t isaac_game_update_slice_type5_door_open_plan_address(void);
uint32_t isaac_game_update_slice_type5_door_open_plan_max_entries(void);
/* ABI v95 (record idx 0, FCO): PlayerManager::FirstCollectibleOwner
   (0x009be080) decision laws (wave-18 unit update-v95-record0-fco). Exact
   ZHL, 174 direct rel32 callers image-wide. Fresh census: arg2 RNG**
   [ebp+0xc] is NEVER READ (no CRT/genrand draw; sibling RandomCollectible-
   Owner 0x009be150 owns it) -> per unit contract no RNG typed-host; the
   sparse hud_stat_owner_byte capture stays. twin_flag = PE 0x9be0a7..0x9be0c6
   (arg3 LOW BYTE && config && config+0xb8 bit 31); list_empty = FULL dword
   0x9be0ce; slot_checkable = FULL dword [player+0x2c]==0 0x9be0d9;
   has_collectible_hit = LOW BYTE 0x9be0e9/0x9be105; twin_check_needed =
   shared byte THEN ptr 0x9be0ed/0x9be0f9; walk_next = iter+4 wrap 0x9be10d;
   walk_continue = FULL dword 0x9be110; walk_owner = the composite walk
   over count x 5-word probes {player_ptr,f2c,has_primary,twin_ptr,has_twin}
   (has_* = host 0x7706e0 result bytes; owner = player / twin / 0). */
int32_t isaac_game_update_slice_fco_twin_flag(uint32_t arg3_byte, uint32_t item_ptr, uint32_t item_flags_b8);
int32_t isaac_game_update_slice_fco_list_empty(uint32_t list_begin, uint32_t list_end);
int32_t isaac_game_update_slice_fco_slot_checkable(uint32_t player_field_2c);
int32_t isaac_game_update_slice_fco_has_collectible_hit(uint32_t al_byte);
int32_t isaac_game_update_slice_fco_twin_check_needed(uint32_t shared_byte, uint32_t twin_ptr);
uint32_t isaac_game_update_slice_fco_walk_next(uint32_t iter);
int32_t isaac_game_update_slice_fco_walk_continue(uint32_t next_iter, uint32_t list_end);
uint32_t isaac_game_update_slice_fco_walk_owner(uint32_t arg3_byte, uint32_t item_ptr, uint32_t item_flags_b8, uint32_t list_begin, uint32_t list_end, const uint32_t* probes, uint32_t probe_count);
/* ABI v95 (record idx 0, StatHUD tail 0x84c170 controller, called at
   0x009a2bb2 from HUD::PostUpdate; wave update-v96-record0-tail): the tail
   DECISION laws — every branch of 0x84c170..0x84c2b9 is an in-module pure
   decision; the two host edges are typed (FCO owner capture @4632 + fatal
   logger 0xa112c0, named typed event hudStatWalkFatalEmpty coordinator-
   merged). fatal_empty = PE 0x84c1cf FULL-dword `test eax,eax / jne` on the
   per-iteration re-derived (end-begin)>>2 count (0 == fires the fatal log;
   WIDE 0x100/0xffffffff do NOT fire); owner_mode = PE 0x84c1a6 FULL-dword
   `test eax,eax / setne al` on the FCO result pointer (-> StatHUD+0x2ac
   byte + k=6 mode select; 0x100 IS an owner); recompute_mode = PE 0x84ca3f
   SIGNED `setg` on (i32[Game+0x264f8] - i32[entry+0x328]) > 1 (entry frame
   0x80000000 -> negative diff -> 0). No uint8_t params; byte gates re-
   narrow in bodies only where the PE tests a byte. Sized-free 0xaef15c is
   CENSUS-REFUTED for the tail closure (3702 image-wide callers, 0 inside
   0x84c170/0x84bf30/0x84ca00/0x9be080). */
int32_t isaac_game_update_slice_hud_stat_tail_fatal_empty(uint32_t count);
int32_t isaac_game_update_slice_hud_stat_tail_owner_mode(uint32_t owner_word);
int32_t isaac_game_update_slice_hud_stat_tail_recompute_mode(uint32_t game_frame_264f8, uint32_t entry_frame_328);
/* ABI v95 (record idx 0, RecomputeStats 0x84ca00 SEAM; wave
   update-v96-record0-tween): the per-entry decision laws of the SHARED
   recompute body — the record-0 walk site 0x84c206 (mask 0xfffffeff), the
   0x84cc40 per-frame tween walker site 0x84d66d (mask 0xffffffff, the
   LAST 0x84ca00 caller outside record 0) and 0x9a8b5e. row_stride = PE
   0x84ca13 imul edi,eax,0xcc (u32 wrap); entry_valid = PE 0x84ca20
   FULL-DWORD null gate on the entry ptr [this+0x114]; slot_runs = PE
   0x84ca45..0x84cc11 per-k flags bitmask (bit k -> slot k tween runs;
   k6/k7 joined at 0x84cb39 test bl,0xc0); owner_byte = PE 0x84cba1
   LOW-BYTE read-back of the stored FCO byte [StatHUD+0x2ac] (contrast the
   FULL-dword tail owner_mode STORE law). Typed host events for the three
   probe leaves hudStatWalkProbe1/2/3 (0x7f92b0/0x749830/0x7f96f0)
   coordinator-merged, offset -1. The 0x84cc40 walker itself stays host
   (playerhud-family ABI v33 gate/plan consumed BY REFERENCE). */
uint32_t isaac_game_update_slice_hud_stat_recompute_row_stride(uint32_t entry_index);
int32_t isaac_game_update_slice_hud_stat_recompute_entry_valid(uint32_t entry_ptr);
int32_t isaac_game_update_slice_hud_stat_recompute_slot_runs(uint32_t flags, uint32_t k);
int32_t isaac_game_update_slice_hud_stat_recompute_owner_byte(uint32_t owner_byte);
/* PE 0x84cb7a test al,al (PROBE2 0x749830 BOOL-in-AL; walker twin
   0x84d1bb): LOW-BYTE gate — (probe2_bits & 0xff) != 0 keeps the
   k6/k7 clamp, a zero low byte zeroes it. WIDE 0x100 -> 0. Landed
   at record-0's final assessment (record idx 0 tween-assess). */
int32_t isaac_game_update_slice_hud_stat_recompute_probe2_live(uint32_t probe2_bits);
/* ABI v96 (record idx 0, wave update-v98-record0-walker): the 0x84cc40
   walker's remaining PURE decisions, BY-REFERENCE host descriptions
   (walker stays host, playerhud-family ABI v33 consumed BY REFERENCE;
   zero layout bytes, ABI stays 96).
   walk_site_k8_skipped = PE 0x84cbf0 test ebx,0x100 / je — the WALK-SITE
     mask arm: the 0xfffffeff push @0x84c1f6 survives 0x84bf30 (ret 4) as
     0x84ca00 arg2 (arg3 phantom count never read), bit-8 clear -> k=8
     skipped at 0x84c206; the walker site 0x84d66d pushes -1 -> k=8 runs.
     FULL-dword bit test (0xffffff00 -> 0).
   walker_k7_target = the walker's INLINE k7 (0x84d4c7 mode-0 via
     [ebp-8]=clamped*100 / 0x84d280 mode-1 movaps xmm2,xmm1 on the owner
     arm; 0x84d31f..0x84d339 fast / 0x84d3d3..0x84d3ed full on the
     non-owner): owner ? clamped*100 : probe3*clamped*100 — the S2
     caveat's true home (the SEAM k7 is probe3*clamped*100 unconditional,
     already lawed + pinned; on real captures probe3==1.0 so the two
     agree). Owner gate 0x84d1cc cmp byte [esi+0x2ac],0 = LOW-BYTE
     (& 0xff, WIDE 0x100 -> non-owner formula). f32 single-precision
     roundings; returns f32 bits.
   walker_k6_probe_leaf_va = the walker's k6 call-site dispatch
     (0x84d18e/0x84d1b6/0x84d1c7): site 0/1/2 -> leaf VA
     0x7f92b0/0x749830/0x7f96f0 (PROBE1/2/3), else 0. MASK-FREE — the
     walker's inline block has NO twin of the seam's 0x84cb39 test
     bl,0xc0 joined gate (mask arg ignored; same fixed leaf order as the
     seam sites 0x84cb4d/0x84cb75/0x84cb86). */
int32_t isaac_game_update_slice_hud_stat_walk_site_k8_skipped(uint32_t mask);
uint32_t isaac_game_update_slice_hud_stat_walker_k7_target(uint32_t owner_mode, uint32_t probe3_bits, uint32_t clamped_bits);
uint32_t isaac_game_update_slice_hud_stat_walker_k6_probe_leaf_va(uint32_t mask, uint32_t site_index);
/* ABI v100 (record idx 0, wave update-v99-record0-walker): the 0x84cc40
   walker BODY DEPTH, BY-REFERENCE host descriptions (walker stays host;
   zero layout bytes, ABI stays 96).
   walker_probe1_clamped = the walker's probe chain (0x84d199..0x84d1c2;
     the seam twin 0x84cb5b..0x84cb7e is byte-identical in gates):
     maxss(probe1, 0.0f) THEN minss(x, 1.0f) — NaN -> 0.0 (maxss returns
     the SECOND operand on NaN) — then the probe2 BOOL LOW-BYTE gate
     @0x84d1bb (& 0xff; WIDE 0x100 -> clamped 0.0) zeroing the clamped
     value (xorps @0x84d1c2). Returns f32 bits. Wired as the k6/k7
     block's clamped value on both sites (oracle parity).
   walker_e8_call_order = the walker's 4 direct E8 leaves in CALL ORDER:
     position 0 -> 0x7f92b0 (PROBE1 @0x84d18e), 1 -> 0x749830 (PROBE2
     @0x84d1b6), 2 -> 0x7f96f0 (PROBE3 @0x84d1c7), 3 -> 0x84ca00 (the
     RecomputeStats seam @0x84d66d — LAST of the four, swap-back rows
     only), else 0. Completes walker_k6_probe_leaf_va with E8 #4. */
uint32_t isaac_game_update_slice_hud_stat_walker_probe1_clamped(uint32_t probe1_bits, uint32_t probe2_bits);
uint32_t isaac_game_update_slice_hud_stat_walker_e8_call_order(uint32_t position);
/* ABI v101 (record idx 0, wave update-v100-record0-islands): the 0x84cc40
   walker's remaining lane-free PURE islands, BY-REFERENCE host
   descriptions, all (void)-lawed in the k6/k7 block (v98 k6/k7
   (void)-lawing precedent; the live A/B/B.f328/[Game+0x18300] inputs were
   NOT committed lanes at the time — §lane-requests @14276/14280/14284/
   14288, since COMMITTED at ABI v102); zero layout bytes, ABI stays 96.
   All scalar params uint32.
   walker_row_arm = the swap-gate + swap-back row arm (0x84cc9d cmp
     eax,[ebx+8] / 0x84cca0 jne + 0x84d659 cmp eax,edx / 0x84d65b jne):
     entry == A -> 1 (swap-to-B store @0x84cca6 + inline body), entry ==
     B -> 2 (swap-back store @0x84d666 + the 0x84d66d seam call), else 0.
     FULL-DWORD compares; A checked before B.
   walker_reset_split = the walker-site RESET/TWEEN split (0x84ccc8 sub /
     0x84ccce cmp eax,1 / 0x84ccd1 jg): flag [ebp-1] =
     (i32[Game+0x264f8] - i32[B+0x328]) > 1 (SIGNED) -> TWEEN(1); the
     EXACT lawed seam formula hud_stat_tail_recompute_mode re-derived at
     the walker site on B — composed, not duplicated.
   walker_swap_store = the swap store semantics (arm 1 -> B @0x84cca6;
     arm 2 -> A @0x84d666 BEFORE the 0x84d66d seam call; else the entry
     passthrough): pure function of (row_arm, a, b) — the row_arm law
     supplies the arm; the arm-1 store precedes the FULL-DWORD B==0 bail
     (0x84ccb5).
   walker_probe1_arg = the probe1 ARG read (0x84d188 mov ecx,[eax+
     0x18300] — the game ROOM ptr word, seam twin 0x84cb47, PM swap twin
     0x9bf31f): FULL-DWORD transfer into ecx for leaf 0x7f92b0, no byte
     gate — identity. */
int32_t isaac_game_update_slice_hud_stat_walker_row_arm(uint32_t entry, uint32_t player_a, uint32_t player_b);
int32_t isaac_game_update_slice_hud_stat_walker_reset_split(uint32_t frame_counter_264f8, uint32_t b_frame328);
uint32_t isaac_game_update_slice_hud_stat_walker_swap_store(uint32_t row_arm, uint32_t entry, uint32_t player_a, uint32_t player_b);
uint32_t isaac_game_update_slice_hud_stat_walker_probe1_arg(uint32_t game_18300);
/* ABI v102 (record idx 0, wave update-v102-record0-wire; PLAN
   update-v102-abi97-plan): the walker lanes are COMMITTED runtime inputs
   (hud_stat_walker_player_a @14276 / player_b @14280 / b_frame328 @14284
   / probe1_arg @14288) and the typed walker probe events land @956/960/
   964. The four v101 laws' (void) wires in the k6/k7 block now consume
   the LIVE lane values (pass-through — the v101 bit-identical contract:
   the lane values do NOT change the seam outputs, only the walker-side
   descriptions become live); the walker capture is LIVE iff a real PM
   swap captured A/B (player_a|player_b != 0), and only then do the typed
   events fire: hud_stat_walker_probe1 = reached (+1 per k6/k7-arm
   entry), hud_stat_walker_probe2 = the swap-gate row-arm value (1/2/0),
   hud_stat_walker_probe3 = the walker-site k6 target bits. ABI stays 96
   until the wave-26 merge commits the layout (static_asserts pin the PLAN
   offsets; the merge reconciles). */
/* ABI v95 (record idx 8 MenuGateOpen 0x009b7680 head laws, wave-18 unit
   update-v95-menu-open-census): the only recoverable pure islands of the
   7224-byte 9-function menu-object span (full-body census in NOTES: 1979
   insns / 0 resyncs / 128 direct + 15 indirect / irreducible SFX+ANM2+alloc
   leaves keep the record HOST). slot_select = PE 0x9b7733/0x9b774c
   (menu_mode==1 -> 0x140 else 0x2c, FULL-DWORD cmovne); layer74_range_nonempty
   = PE 0x9b7979..0x9b798c setne (byte_length != 0); layer74_count_gt_one =
   PE 0x9b79c4..0x9b79dc (SAR32(end-begin,2) then UNSIGNED > 1 — WIDE
   0xffffffff -> -1 -> 1); layer74_difficulty_one = PE 0x9b7a04..0x9b7a0e
   sete FULL-DWORD ==1; fac_index = PE 0x9b76ed..0x9b7713 SAR32 count,
   full-dword match, UNSIGNED jb loop, -1 on empty/miss. Every scalar param
   is uint32_t (no uint8_t scalar params). */
uint32_t isaac_game_update_slice_menu_open_slot_select(uint32_t menu_mode);
int32_t isaac_game_update_slice_menu_open_layer74_range_nonempty(uint32_t byte_length);
int32_t isaac_game_update_slice_menu_open_layer74_count_gt_one(uint32_t byte_length);
int32_t isaac_game_update_slice_menu_open_layer74_difficulty_one(uint32_t difficulty_269c8);
int32_t isaac_game_update_slice_menu_open_fac_index(uint32_t span_begin, uint32_t span_end, uint32_t target, const uint32_t* samples, uint32_t sample_count);
/* ABI v95 (record idx 44 PM3 arm laws): quiet-gate = ordered 0.01f >=
   maxVol (PE 0x009bb774 movss 0.01f / 0x009bb782 comiss / 0x009bb78c jb;
   NaN maxVol -> comiss unordered CF=1 -> LOUD). empty_pure_skip = the
   empty vector's maxVol is 0.0f (PE 0x9bb6b2 xorps) -> quiet arm -> probe
   0x92e560 -> al==0 (PE 0x9bb795 je): whole arm host-free. empty_stop_split
   = empty + playing -> ONLY the 0x92e230 stop (PE 0x9bb7a2): the
   whole-heartbeat MONOLITHIC must NOT fire. FULL-DWORD count compares
   (0x100 must NOT be empty). */
int32_t isaac_game_update_slice_pm3_quiet_gate(float max_vol);
int32_t isaac_game_update_slice_pm3_empty_pure_skip(uint32_t player_count, uint32_t is_playing);
int32_t isaac_game_update_slice_pm3_empty_stop_split(uint32_t player_count, uint32_t is_playing);
/* ABI v95 (R4 equal-flags capture, record idx 10): full non-empty walk
   decision consumed by reference from the frozen frame-opaque 40add0 law
   (first_match_index over the per-entry equal-flag bytes + bit test).
   equal_flags is a pointer to the runtime blob's sized byte lane; no
   uint8_t scalar crosses the ABI. 1 = probe TRUE (true-probe interior
   0x421343 stays host), 0 = probe FALSE (pure 0x4213de clear). */
int32_t isaac_game_update_slice_4212c0_add0_probe_from_equal_flags(
    const uint8_t* equal_flags, uint32_t list_count, uint32_t bitfield_18);
/* ABI v95 (record idx 32): FUN_00956110 phone-home probe pure laws. net_gate
   mirrors PE 0x956120 cmp [edi+8],2 / 0x956126 cmp [0xc71690],0 — BOTH
   FULL-DWORD (byte-narrow or low-byte reads diverge on 0x102 / 0x100).
   net_early mirrors PE 0x956142 mov al,[ebp+0xb]: the probe out byte is the
   function's al (BYTE; 0x100 -> 0, 0xff -> 1). path mirrors PE 0x95615d
   cmp/je + 0x956161 cmp edx,-1 — WALK iff mp non-empty AND arg2 == -1
   (FULL-DWORD vs 0xffffffff). walk_result mirrors the PE 0x956166..0x9561a9
   loop: count = (end-begin) SAR 2 re-derived per iteration, UNsigned jb
   compare, first (entry_al & 0xff) != 0 wins -> 1 else 0 (each entry is the
   virtual's AL; test al,al is a LOW-BYTE test). arg_prep/result_plan carry
   the arg-prep constants and the composed decision; the platform IO tail
   0x864c30, the [[entry]+0x30] virtual dispatch, and the general callback
   0xa20940 dispatch stay typed-host. */
int32_t isaac_game_update_slice_98dba0_956110_net_gate(uint32_t manager_mode, uint32_t global_c71690);
int32_t isaac_game_update_slice_98dba0_956110_net_early(uint32_t net_out_byte);
int32_t isaac_game_update_slice_98dba0_956110_path(uint32_t mp_begin, uint32_t mp_end, uint32_t arg2);
int32_t isaac_game_update_slice_98dba0_956110_walk_result(const uint32_t* vtable_results, uint32_t count);
void isaac_game_update_slice_98dba0_956110_arg_prep(IsaacGameUpdateSlice956110ArgPrep* out);
void isaac_game_update_slice_98dba0_956110_result_plan(IsaacGameUpdateSlice956110Result* out, uint32_t manager_mode, uint32_t global_c71690, uint32_t mp_begin, uint32_t mp_end, uint32_t arg2, uint32_t net_host_ok, uint32_t net_out_byte, const uint32_t* vtable_results, uint32_t vtable_count, uint32_t general_result);
/* ABI v95 (record idx 5/32, 0x0098dba0): entity-surface capture contract.
   class_bits FULL-DWORD-decodes the subobject vptr at [entry+0x370]
   (0xb82d98 -> DataUpdate_t=0, 0xb82e20 -> LobbyDataUpdate_t=1, else 2).
   lobby_accept (PE 0xa23970): impl_ptr==0 -> 0; impl_20!=0 &&
   impl_20_10 == global_c5ac00 -> 1; else (impl_b0 & 1) — LOW-BYTE.
   data_accept (PE 0xa5f260..0xa5f2c9): impl_ptr==0 -> 0;
   impl_c == 0xfefefefe (FULL-DWORD) -> ((c73680!=0 && c73694==0x60001) ?
   netman_2b4 : 0) == impl_8; else impl_20/20_10/c5ac00 gate -> 1; else
   (impl_b0 & 1). walk_step (PE 0x98dc93..0x98dca6 + 0x98dcc0..0x98dd27):
   phase-1 probe1_ran = (mp_found==0 || accept1!=0), bl_after1 =
   probe1_ran && (probe1_nz & 0xff) != 0; phase-2 rtti_enter =
   found2 ? accept2 : mp_nonempty. The virtual dispatch stays TYPED-HOST
   (plan.typed_host/host_verify). */
int32_t isaac_game_update_slice_entity_surface_class_bits(uint32_t vtable_ptr);
int32_t isaac_game_update_slice_entity_surface_lobby_accept(uint32_t impl_ptr, uint32_t impl_b0, uint32_t impl_20, uint32_t impl_20_10, uint32_t global_c5ac00);
int32_t isaac_game_update_slice_entity_surface_data_accept(uint32_t impl_ptr, uint32_t impl_b0, uint32_t impl_8, uint32_t impl_c, uint32_t impl_20, uint32_t impl_20_10, uint32_t global_c5ac00, uint32_t global_c73680, uint32_t global_c73694, uint32_t netman_2b4);
int32_t isaac_game_update_slice_entity_surface_accept(const IsaacGameUpdateSliceEntitySurfaceCapture* cap);
void isaac_game_update_slice_entity_surface_plan(IsaacGameUpdateSliceEntitySurfacePlan* out, const IsaacGameUpdateSliceEntitySurfaceCapture* cap);
void isaac_game_update_slice_entity_surface_walk_step(IsaacGameUpdateSliceEntitySurfaceWalkStep* out, uint32_t mp_found, uint32_t accept1, uint32_t probe1_nz, uint32_t found2, uint32_t accept2, uint32_t mp_nonempty);
/* rtti_fold (v106): the RTTI block PE 0x98dd27..0x98dddc — final bl once
   the block is entered. GATES (FULL-DWORD): rtti_enter (walk_step's
   found2 ? accept2 : mp_nonempty), rtti_out/cast (test eax,eax),
   gate378 (cmp [eax+0x378],0). BYTE gates (& 0xff): is_idx_local
   (test al,al @0x98ddad), probe2_nz (test al,al @0x98ddd2). Order:
   enter==0 or any gate 0 -> bl unchanged; bl already 1 -> 1; mp empty ->
   probe2 decides; !local -> 0 (probe2 skipped); else probe2 decides. */
int32_t isaac_game_update_slice_entity_surface_rtti_fold(uint32_t rtti_enter, uint32_t bl_after1, uint32_t rtti_out, uint32_t rtti_cast, uint32_t gate378, uint32_t mp_empty, uint32_t is_idx_local, uint32_t probe2_nz);
int32_t isaac_game_update_slice_resume_98dba0_player_walk(IsaacGameUpdateSliceState* state, const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs, IsaacGameUpdateSliceEvents* events);
int32_t isaac_game_update_slice_resume_engine_prefix(IsaacGameUpdateSliceState* state, const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs, IsaacGameUpdateSliceEvents* events);
int32_t isaac_game_update_slice_resume_room_transition_effect(IsaacGameUpdateSliceState* state, const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs, IsaacGameUpdateSliceEvents* events);
int32_t isaac_game_update_slice_resume_room_update_prefix_b1(IsaacGameUpdateSliceState* state, const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs, IsaacGameUpdateSliceEvents* events);
int32_t isaac_game_update_slice_resume_room_update_prefix_b2(IsaacGameUpdateSliceState* state, const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs, IsaacGameUpdateSliceEvents* events);
int32_t isaac_game_update_slice_resume_room_update_prefix(IsaacGameUpdateSliceState* state, const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs, IsaacGameUpdateSliceEvents* events);
int32_t isaac_game_update_slice_resume_room_clear_nested(IsaacGameUpdateSliceState* state, const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs, IsaacGameUpdateSliceEvents* events);
int32_t isaac_game_update_slice_resume_room_update_clear(IsaacGameUpdateSliceState* state, const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs, IsaacGameUpdateSliceEvents* events);
int32_t isaac_game_update_slice_resume_room_update_head(IsaacGameUpdateSliceState* state, const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs, IsaacGameUpdateSliceEvents* events);
int32_t isaac_game_update_slice_resume_4257b0_pass_a(IsaacGameUpdateSliceState* state, const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs, IsaacGameUpdateSliceEvents* events);
int32_t isaac_game_update_slice_resume_frame_manager_updates(IsaacGameUpdateSliceState* state, const IsaacGameUpdateSliceConstants* constants, const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs, IsaacGameUpdateSliceEvents* events);
int32_t isaac_game_update_slice_capture(const uint8_t* game_object, size_t game_object_size, IsaacGameUpdateSliceState* state);
int32_t isaac_game_update_slice_apply(uint8_t* game_object, size_t game_object_size, const IsaacGameUpdateSliceState* state);
uint32_t isaac_game_update_slice_abi_version(void);
uint32_t isaac_game_update_slice_state_size(void);
uint32_t isaac_game_update_slice_constants_size(void);
uint32_t isaac_game_update_slice_runtime_inputs_size(void);
uint32_t isaac_game_update_slice_events_size(void);
uintptr_t isaac_game_update_slice_state_address(void);
uintptr_t isaac_game_update_slice_constants_address(void);
uintptr_t isaac_game_update_slice_runtime_inputs_address(void);
uintptr_t isaac_game_update_slice_events_address(void);
uintptr_t isaac_game_update_slice_game_object_address(void);
uint32_t isaac_game_update_slice_game_object_size(void);
void isaac_game_update_slice_reset_scratch(void);
uintptr_t isaac_game_update_slice_frame_opaque_4257b0_list_out_address(void);
uint32_t isaac_game_update_slice_frame_opaque_4257b0_max_list(void);
uint32_t isaac_game_update_slice_frame_opaque_4257b0_max_players(void);
uint32_t isaac_game_update_slice_frame_opaque_4257b0_max_elems(void);
/* v76: isaac_room_genrand_next — Room-family MT19937 (room_pure_helpers.h). */
uintptr_t isaac_game_update_slice_genrand_state_address(void);
uintptr_t isaac_game_update_slice_genrand_index_out_address(void);
uintptr_t isaac_game_update_slice_genrand_samples_address(void);
uint32_t isaac_game_update_slice_genrand_state_words(void);
uint32_t isaac_game_update_slice_genrand_max_samples(void);
uintptr_t isaac_game_update_slice_menu_aux_visit_order_address(void);
uintptr_t isaac_game_update_slice_menu_aux_payload_free_address(void);
uintptr_t isaac_game_update_slice_menu_aux_accounting_out_address(void);
uint32_t isaac_game_update_slice_menu_aux_max_nodes(void);
uintptr_t isaac_game_update_slice_menu_aux_sentinel_out_address(void);
uint32_t isaac_game_update_slice_menu_aux_sentinel_out_words(void);
uintptr_t isaac_game_update_slice_update_list_timers_out_address(void);
uintptr_t isaac_game_update_slice_update_list_evict_flags_address(void);
uintptr_t isaac_game_update_slice_hud_stat_countdown_address(void);
uint32_t isaac_game_update_slice_hud_stat_countdown_count(void);
uintptr_t isaac_game_update_slice_hud_stat_walk_address(void);
uint32_t isaac_game_update_slice_hud_stat_walk_count(void);
uint32_t isaac_game_update_slice_update_list_max_nodes(void);
uintptr_t isaac_game_update_slice_player_flag_410_address(void);
uint32_t isaac_game_update_slice_player_flag_410_max(void);
uintptr_t isaac_game_update_slice_sound_group_walk_pending_address(void);
uintptr_t isaac_game_update_slice_sound_group_walk_plan_address(void);
uint32_t isaac_game_update_slice_sound_group_walk_max_voices(void);
uint32_t isaac_game_update_slice_sound_group_walk_plan_words(void);
/* ABI v95 (record idx 1, 0x0092e300, LAST in-module leaf L4): the frozen
   sound-group walk EXACTNESS gate. The PE re-reads the group-vector span,
   base, and per-group entry count on EVERY iteration (0x92e3d5 mov eax,
   [eax]; 0x92e3d9 bound; 0x92e3f8 span; 0x92e400 magic divide); the
   in-module walk runs on FROZEN group_count/voice_count/voices_reloaded.
   This predicate returns 1 iff the FROZEN capture is exact-by-construction
   for any live vector equal to the snapshot: (1) the frozen span divides
   to the frozen group_count through the PE's OWN signed magic divide
   (0x094f2095 sar 4 + sign fixup — a capture whose count disagrees with
   its span is provably STALE, read across a mutation); (2) caps hold
   (groups <= 8, voices <= 32); (3) every walked group's voice window is
   FULLY inside the captured voice array (first_voice[g] >= 0 and
   first_voice[g] + entry_count_190[g] <= voice_count — no truncated
   window); (4) zero span -> 1 (PE 0x92e32a je). QUIESCENCE itself is
   host-time: the host must set walk_ready=1 only when walk_exact==1 AND
   the group vector + per-group counts + voice fields are quiescent for
   the record's duration (the record's only outbound edges are the four
   device vtbl slots; mutation windows censused in
   update-v95-92e300-l4-quiescence/NOTES.md). Verifier-visible only: no
   runtime consumer reads the scratch today. No uint8_t scalar params. */
int32_t isaac_game_update_slice_0092e300_walk_exact(
    uint32_t span_bytes, uint32_t group_count, uint32_t voice_count,
    const int32_t* first_voice, const uint32_t* group_entry_count,
    const uint32_t* group_enabled);
/* ABI v95: record idx 47 STOP fold (0x0092e230) in-module scratch — the
   host applies the [entry+4]=-1 sentinel + [voice+0x29] clears by
   reference (pending bytes after, 32 lanes) and reads the fold plan. */
uintptr_t isaac_game_update_slice_sfx_stop_fold_pending_address(void);
uintptr_t isaac_game_update_slice_sfx_stop_fold_plan_address(void);
uint32_t isaac_game_update_slice_sfx_stop_fold_max_voices(void);
uint32_t isaac_game_update_slice_sfx_stop_fold_plan_words(void);
uintptr_t isaac_game_update_slice_player_hud_active_address(void);
uintptr_t isaac_game_update_slice_player_hud_blink_address(void);
uintptr_t isaac_game_update_slice_player_hud_float_address(void);
uintptr_t isaac_game_update_slice_player_hud_chars_address(void);
uint32_t isaac_game_update_slice_player_hud_max_slots(void);
uintptr_t isaac_game_update_slice_b8_costs_address(void);
uintptr_t isaac_game_update_slice_b8_trails_address(void);
uint32_t isaac_game_update_slice_b8_max_cells(void);
uintptr_t isaac_game_update_slice_engine_player_eligible_address(void);
uintptr_t isaac_game_update_slice_engine_player_f360_address(void);
uintptr_t isaac_game_update_slice_engine_player_f364_address(void);
uintptr_t isaac_game_update_slice_engine_player_f410_address(void);
uint32_t isaac_game_update_slice_engine_player_max(void);
int32_t isaac_game_update_slice_capture_scratch(void);
int32_t isaac_game_update_slice_apply_scratch(void);
void isaac_game_update_slice_step_scratch(void);
int32_t isaac_game_update_slice_resume_gate_1b83c_scratch(void);
int32_t isaac_game_update_slice_resume_92f1c0_scratch(void);
int32_t isaac_game_update_slice_resume_generic_prompt_scratch(void);
int32_t isaac_game_update_slice_resume_item_overlay_scratch(void);
int32_t isaac_game_update_slice_continue_timed_transition_scratch(void);
int32_t isaac_game_update_slice_continue_menu_gates_scratch(void);
int32_t isaac_game_update_slice_resume_menu_open_scratch(void);
int32_t isaac_game_update_slice_resume_menu_update_scratch(void);
int32_t isaac_game_update_slice_resume_frame_aux_updates_scratch(void);
int32_t isaac_game_update_slice_resume_stage_transition_effect_scratch(void);
int32_t isaac_game_update_slice_resume_room_transition_effect_scratch(void);
int32_t isaac_game_update_slice_resume_engine_prefix_scratch(void);
int32_t isaac_game_update_slice_resume_98dba0_player_walk_scratch(void);
int32_t isaac_game_update_slice_resume_frame_manager_updates_scratch(void);
int32_t isaac_game_update_slice_resume_room_update_prefix_b1_scratch(void);
int32_t isaac_game_update_slice_resume_room_update_prefix_b2_scratch(void);
/* ABI v95 (record idx 14 opaqueRoomUpdatePrefixB2): item-pool/spawn
   special + set-to-60 pure laws (PE 0x00802e20..0x00803321, census
   update-v95-14-prefix-b2-pool). Every scalar param is uint32_t/int32_t
   (no uint8_t scalar params). */
int32_t isaac_game_update_slice_b2_pool_special_gate(uint32_t timer7764, uint32_t game18304);
int32_t isaac_game_update_slice_b2_collectible_bounds_log_needed(int32_t count);
uint32_t isaac_game_update_slice_b2_last_collectible_offset(int32_t count);
uint32_t isaac_game_update_slice_b2_rng_xorshift(uint32_t seed, uint32_t s1, uint32_t s2, uint32_t s3);
int32_t isaac_game_update_slice_b2_rng_zero_log_needed(uint32_t seed);
uint32_t isaac_game_update_slice_b2_pool_aggregate(const uint16_t* counts, uint32_t* out_ids, int32_t* out_weights);
uint32_t isaac_game_update_slice_b2_pool_pick(uint32_t seed1, const uint32_t* ids, const int32_t* weights, uint32_t n, int32_t* out_total);
uint32_t isaac_game_update_slice_b2_pool_count_dec_word(uint32_t count_word);
int32_t isaac_game_update_slice_b2_spawn_qualify(uint32_t flag8, uint32_t d4, uint32_t w4_4, uint32_t w4_6);
uint32_t isaac_game_update_slice_b2_spawn_grid_index(uint32_t x_s16, uint32_t y_s16, uint32_t width);
uint32_t isaac_game_update_slice_b2_pos_x(uint32_t index, uint32_t width);
uint32_t isaac_game_update_slice_b2_pos_y(uint32_t index, uint32_t width);
int32_t isaac_game_update_slice_b2_spawn2_gate(uint32_t room_active_byte, uint32_t frame264f8, uint32_t room_entry_11f0);
/* B2 spawn-plan + pool-list scratch (host fills the IN array before the
   resume; the module fills the OUT plans + pool list; the host reads both
   back). */
uintptr_t isaac_game_update_slice_b2_spawn_in_address(void);
uintptr_t isaac_game_update_slice_b2_spawn_out_address(void);
uint32_t isaac_game_update_slice_b2_spawn_max(void);
uintptr_t isaac_game_update_slice_b2_pool_list_address(void);
uint32_t isaac_game_update_slice_b2_pool_list_max(void);
int32_t isaac_game_update_slice_resume_room_update_prefix_scratch(void);
int32_t isaac_game_update_slice_resume_room_clear_nested_scratch(void);
int32_t isaac_game_update_slice_resume_room_update_clear_scratch(void);
int32_t isaac_game_update_slice_resume_room_update_head_scratch(void);
int32_t isaac_game_update_slice_resume_4257b0_pass_a_scratch(void);

int16_t isaac_playerhud_critical_heart_blink(int32_t hearts_sum, uint32_t player_flag_1519, int32_t tramp_suppress, int32_t frame_counter_264f8);

/* ------------------------------------------------------------------ v95 - */
/* Record idx 35 opaqueRoomUpdateTailRain (B15 rain spawn loop): loop-frame
   pure laws. PE listings 00802a80.txt (head) + 00802c80.txt (tail); the
   spawn loop 0x00802c20..0x00802e08 + spawn-site arg provenance
   0x00802daf..0x00802dc4. The room-family v54 (0x428b20 relay) / v55
   (loop-step + spawn-args) / B1 (corners, world-xy, count, xorshift,
   once-flag) laws are consumed BY REFERENCE — this family lands the
   update-slice record wire + the composed frame law. */

static constexpr uint32_t ISAAC_GAME_UPDATE_B15_RAIN_ONCE_FLAG = 0x80000u;
static constexpr uint32_t ISAAC_GAME_UPDATE_B15_RAIN_POS_VEC_PTR = 0x00c7b640u;
static constexpr uint32_t ISAAC_GAME_UPDATE_B15_RAIN_GAME_GLOBAL = 0x00c71678u;
static constexpr uint32_t ISAAC_GAME_UPDATE_B15_RAIN_SPAWN_SITE_VA = 0x00802dc4u;
static constexpr uint32_t ISAAC_GAME_UPDATE_B15_RAIN_HOST_VA_BIND = 0x007ef420u;
static constexpr uint32_t ISAAC_GAME_UPDATE_B15_RAIN_HOST_VA_SEARCH = 0x00813520u;
static constexpr uint32_t ISAAC_GAME_UPDATE_B15_RAIN_HOST_VA_CREATE = 0x006fe410u;
static constexpr uint32_t ISAAC_GAME_UPDATE_B15_RAIN_ENTITY_MARK_FIELD = 0x32cu;
static constexpr uint32_t ISAAC_GAME_UPDATE_B15_RAIN_ENTITY_MARK_VALUE = 0xffffffffu;
static constexpr uint32_t ISAAC_GAME_UPDATE_B15_RAIN_WORLD_CELL_BITS = 0x42200000u; /* 40.0f */
static constexpr uint32_t ISAAC_GAME_UPDATE_B15_RAIN_WORLD_Y0_BITS = 0x42f00000u;   /* 120.0f */
static constexpr int32_t ISAAC_GAME_UPDATE_B15_RAIN_SEED_OK = 0;
static constexpr int32_t ISAAC_GAME_UPDATE_B15_RAIN_SEED_FATAL_PRE_SHUFFLE = 1;
static constexpr int32_t ISAAC_GAME_UPDATE_B15_RAIN_SEED_FATAL_PRE_CORNER = 2;

#pragma pack(push, 1)
/* One loop iteration composed from the room-family laws: v55 loop step +
   B1 corners/world-xy + v55 spawn args (0x00802c20..0x00802e08). */
typedef struct IsaacGameUpdateSliceB15RainFrame {
  int32_t remaining;        /* spawn_count - index            0x00802c20 sub */
  uint32_t seed_in;         /* carried seed (step0 = seed0) */
  uint32_t seed_shuffle;    /* xorshift(seed_in)              0x00802c3c..0x64 */
  uint32_t shuffle_rem;     /* seed_shuffle % remaining UNSIGNED 0x00802c72 div */
  int32_t needs_swap;       /* rem != 0                       0x00802c7f cmp/je */
  int32_t swap_index;       /* index + rem                    0x00802c7c lea */
  int32_t slot_offset;      /* index * 0x78                   0x00802de0 add */
  int32_t swap_offset;      /* swap_index * 0x78              0x00802c8b..0x99 */
  uint32_t seed_corner;     /* xorshift(seed_shuffle)         0x00802d02..0x2f */
  uint32_t seed_out;        /* = seed_corner, esi carry       0x00802e02 */
  int32_t next_index;       /* index + 1                      0x00802de7 inc */
  int32_t continue_loop;    /* next_index < spawn_count SIGNED 0x00802dfe jge */
  int32_t seed_fatal;       /* 0 ok / 1 pre-shuffle / 2 pre-corner */
  int32_t corner_index;     /* corner_table[seed_corner & 3]  0x00802d40 */
  uint32_t world_x_bits;    /* f32 col*40+40  (0xbaa904=40, 0x00802d84/0x8c) */
  uint32_t world_y_bits;    /* f32 row*40+120 (0xbaaa00=120, 0x00802d80/0x88) */
  uint32_t arg_a1;          /* *(slot+0)                      0x00802dc2 push [edi] */
  uint32_t arg_a2;          /* *(slot+4)                      0x00802dbf push [edi+4] */
  uint32_t arg_a3;          /* search_result (host, verbatim) 0x00802dbe push eax */
  uint32_t arg_a4;          /* 0xc7b640 pos-vec ptr           0x00802db9 */
  uint32_t arg_a5;          /* 0                              0x00802db7 */
  uint32_t arg_a6;          /* *(slot+8)                      0x00802db0 push edi */
  uint32_t arg_a7;          /* *(slot+0x34)                   0x00802daf push esi */
  uint32_t spawn_site_va;   /* 0x00802dc4 FUN_00428b20 relay (v54 pure) */
  uint32_t bind_va;         /* 0x007ef420 per-entity bind (HOST) */
  uint32_t entity_mark_value; /* 0xffffffff [entity+0x32c]    0x00802dee */
} IsaacGameUpdateSliceB15RainFrame;
#pragma pack(pop)
static_assert(sizeof(IsaacGameUpdateSliceB15RainFrame) == 104,
              "IsaacGameUpdateSliceB15RainFrame size");

#pragma pack(push, 1)
/* Record wire plan for the B15 rain spawn (0x00802a80..0x00802e0d). */
typedef struct IsaacGameUpdateSliceB15RainPlan {
  uint32_t once_flag_apply;    /* 1 iff (flags_1839c & 0x80000) == 0 @gate
                                  0x00802a93 (caller ORs 0x80000) */
  uint32_t buffer_empty;       /* begin == end (PE je 0x00802e25) */
  int32_t spawn_count;         /* resolved count (quality min byte_len/0x78) */
  int32_t steps;               /* loop iterations written (<= LOOP_MAX_STEPS) */
  uint32_t seed_out;           /* final seed carry */
  int32_t seed_fatal;          /* 0 none / 1 pre-shuffle / 2 pre-corner */
  uint32_t loop_enter;         /* 1 iff spawn_count > 0 (signed 0x00802c0a jle) */
  uint32_t host_search;        /* iterations calling 0x00813520 (HOST) */
  uint32_t host_create;        /* iterations calling 0x00428b20 -> 0x6fe410 (HOST) */
  uint32_t host_bind;          /* iterations calling 0x007ef420 (HOST) */
  uint32_t host_swap;          /* 0x78-byte slot swaps (HOST, pre-corner order) */
  uint32_t genrand_draws;      /* host-reported genrand draws (TYPED-HOST,
                                  capped at GENRAND_MAX_SAMPLES) */
  uint32_t genrand_mt_advance; /* 1 iff mt_ready && draws>0 (caller advances
                                  scratch via roomGenrandNext) */
} IsaacGameUpdateSliceB15RainPlan;
#pragma pack(pop)
static_assert(sizeof(IsaacGameUpdateSliceB15RainPlan) == 52,
              "IsaacGameUpdateSliceB15RainPlan size");
static_assert(offsetof(IsaacGameUpdateSliceB15RainPlan, once_flag_apply) == 0,
              "IsaacGameUpdateSliceB15RainPlan once_flag_apply offset");
static_assert(offsetof(IsaacGameUpdateSliceB15RainPlan, genrand_mt_advance) == 48,
              "IsaacGameUpdateSliceB15RainPlan genrand_mt_advance offset");

/* Count law 0x00802bb1..0x00802bdc: base from quality + owner-nonzero
   (PE esi 4/6/8) then signed magic idiv-by-0x78 of (end-begin) + cmovb min.
   Delegates to isaac_room_b1_spawn_count_resolved (same transcription). */
int32_t isaac_game_update_slice_b15_rain_spawn_count(uint32_t owner_nonzero,
                                                     uint32_t quality,
                                                     uint32_t begin_183a4,
                                                     uint32_t end_183a8);

/* One-iteration loop-frame law: v55 loop step + B1 corners/world-xy +
   v55 spawn args composed into the frame (fields above).
   No uint8_t scalar params (all uint32_t/int32_t, explicit re-narrow). */
void isaac_game_update_slice_b15_rain_frame(uint32_t seed_in, int32_t index,
                                            int32_t spawn_count, int32_t room_w_c,
                                            int32_t room_h_10, uint32_t slot_f0,
                                            uint32_t slot_f4, uint32_t slot_f8,
                                            uint32_t slot_f34,
                                            uint32_t search_result,
                                            IsaacGameUpdateSliceB15RainFrame* out);

/* Record wire decide: once-flag gate (0x00802a93) -> buffer gate
   (0x00802b50) -> count (0x00802bb1) -> loop walk (0x00802c20..0x00802e08)
   with typed host counts + genrand draw typing (roomGenrandNext).
   slot_fields = 4 lanes x slot_capacity (f0,f4,f8,f34 per iteration);
   search_results[slot_capacity] = the 0x00813520 returns. */
void isaac_game_update_slice_b15_rain_wire(uint32_t flags_1839c,
                                           uint32_t owner_nonzero,
                                           uint32_t quality,
                                           uint32_t begin_183a4,
                                           uint32_t end_183a8, uint32_t seed0,
                                           int32_t room_w_c, int32_t room_h_10,
                                           const uint32_t* slot_f0,
                                           const uint32_t* slot_f4,
                                           const uint32_t* slot_f8,
                                           const uint32_t* slot_f34,
                                           const uint32_t* search_results,
                                           uint32_t slot_capacity,
                                           uint32_t genrand_draws,
                                           uint32_t genrand_mt_ready,
                                           IsaacGameUpdateSliceB15RainPlan* out);

/* ABI v95 (record idx 20 depth, census update-v95-savestate-6f9000):
   Game::SaveState 0x006f9000 pure decision layers. Sibling enum — keeps the
   shared enum tail untouched. All values transcribed from the instruction
   stream: version word 0x35 stored at GameState+0xc (0x6f90c6 mov eax,0x35 /
   0x6f90cb mov word [edi+0xc],ax); flags loop bound = same word (16-bit bx vs
   word [edi+0xc] unsigned jb @0x6f9114); pre-loop header stores = 7
   (0x1e780/0x1e784/0/4/5/8/0xc @0x6f908d..0x6f90cb); post-loop fixed stores
   = 19 (0x44..0x7c run + 0x80/0xdc/0xe0/0x1e788 @0x6f9126..0x6f91d1); the
   run itself = 15 dwords; game section loop = 7 (0x6f9324..0x6f9347, stride
   0x320); ptr-array dword loop = 0xe (0x6f9371..0x6f9384). */
enum {
  ISAAC_GAME_UPDATE_SAVESTATE_VERSION_WORD = 0x35,
  ISAAC_GAME_UPDATE_SAVESTATE_FLAGS_COUNT = 0x35,
  ISAAC_GAME_UPDATE_SAVESTATE_PRE_HEADER_STORES = 7,
  ISAAC_GAME_UPDATE_SAVESTATE_POST_HEADER_STORES = 19,
  ISAAC_GAME_UPDATE_SAVESTATE_DWORD_RUN_STORES = 15,
  ISAAC_GAME_UPDATE_SAVESTATE_SECTION_LOOP = 7,
  ISAAC_GAME_UPDATE_SAVESTATE_SECTION_STRIDE = 0x320,
  ISAAC_GAME_UPDATE_SAVESTATE_DWORD_LOOP = 0xe,
  /* ABI v99 (record idx 12 depth): 0x21994 - 0x2d0 — the 0xe-dword blob
     source *[0xc7169c]+0x21994 sits 0x216c4 past the committed payload
     blob source *[0xc7169c]+0x2d0 (rewind_705ee0_payload_blob_addr lane);
     same base global, so the SaveState blob ADDRESS derives from the lane.
     state+0x78 dst offset of the ONE lane-decidable store ([game+0x264f8],
     0x6f919b) = save_state_arg + 0x78 (newslot+0x7c). */
  ISAAC_GAME_UPDATE_SAVESTATE_BLOB14_SRC_DELTA = 0x216c4,
  ISAAC_GAME_UPDATE_SAVESTATE_FRAME_DWORD_DST_OFF = 0x78,
  ISAAC_GAME_UPDATE_SAVESTATE_PLAN_WORDS = 19
};

/* Composed SaveState decision plan (scratch carrier; serialization-order +
   per-section write gates in PE order). 19 words. */
typedef struct IsaacGameUpdateSliceSaveStatePlan {
  int32_t applied;            /* 1 when the plan law ran */
  int32_t version_word;       /* = 0x35, word @GameState+0xc */
  int32_t flags_count;        /* = 0x35 flag bytes @GameState+0xe */
  int32_t pre_header_stores;
  int32_t post_header_stores;
  int32_t dword_run_stores;
  int32_t badges_alias;       /* 1 = dst field addr == src field addr (skip) */
  int32_t badges_src_count;   /* (src_end-src_begin) SAR 3 */
  int32_t badges_dst_count;   /* (dst_end-dst_begin) SAR 3 */
  int32_t badges_grow;        /* 1 = (u32)src_count > (u32)dst_count (jbe) */
  int32_t badges_copy_bytes;  /* src_end - src_begin (memcpy size) */
  int32_t ptrvec_count;       /* (px_end-px_begin) SAR 2, re-derived per iter */
  int32_t ptrvec_skip;        /* 1 = count == 0 (je 0x6f92e9) */
  int32_t setg_1e7b0;         /* (i32)game+0x67788 > 0 (setg, SIGNED) */
  int32_t clamp_88;           /* v<=0 ? v : v-1 (cmovle @0x6f93a3) */
  int32_t section_loop;       /* = 7 */
  int32_t dword_loop;         /* = 0xe */
  int32_t host_calls;         /* 17 direct E8 sites (19 total = 17 E8 + 2 vtbl) */
  int32_t host_virtual;       /* 2 (vtbl+4, vtbl+0x70) */
} IsaacGameUpdateSliceSaveStatePlan;

/* Header/order laws (Game::SaveState 0x006f9000). Every scalar param is
   uint32_t/int32_t — no uint8_t scalar params (Wasm i32 args are not
   narrowed; low-byte re-narrow happens in the body). */
int32_t isaac_game_update_slice_savestate_flags_count(void);
int32_t isaac_game_update_slice_savestate_version_word(void);
int32_t isaac_game_update_slice_savestate_flags_byte(uint32_t idx,
                                                     uint32_t word_lo,
                                                     uint32_t word_hi);
int32_t isaac_game_update_slice_savestate_pre_header_stores(void);
int32_t isaac_game_update_slice_savestate_post_header_stores(void);
int32_t isaac_game_update_slice_savestate_dword_run_stores(void);

/* Per-section write gates. */
int32_t isaac_game_update_slice_savestate_badges_alias(uint32_t dst_field_addr,
                                                       uint32_t src_field_addr);
int32_t isaac_game_update_slice_savestate_badges_src_count(uint32_t src_begin,
                                                           uint32_t src_end);
int32_t isaac_game_update_slice_savestate_badges_dst_count(uint32_t dst_begin,
                                                           uint32_t dst_end);
int32_t isaac_game_update_slice_savestate_badges_grow(uint32_t src_begin,
                                                      uint32_t src_end,
                                                      uint32_t dst_begin,
                                                      uint32_t dst_end);
int32_t isaac_game_update_slice_savestate_badges_copy_bytes(uint32_t src_begin,
                                                            uint32_t src_end);
int32_t isaac_game_update_slice_savestate_ptrvec_count(uint32_t begin,
                                                       uint32_t end);
int32_t isaac_game_update_slice_savestate_ptrvec_skip(uint32_t begin,
                                                      uint32_t end);
int32_t isaac_game_update_slice_savestate_setg_67788(int32_t game_67788);
int32_t isaac_game_update_slice_savestate_clamp_265ec(int32_t game_265ec);
int32_t isaac_game_update_slice_savestate_section_loop_count(void);
int32_t isaac_game_update_slice_savestate_section_stride(void);
int32_t isaac_game_update_slice_savestate_dword_loop_count(void);

/* ABI v99 (record idx 12 depth): the decidable save-arm leftovers after
   the wave-22 LIVE seam. blob14_source_addr: the 0xe-dword blob source
   address from the committed payload_blob_addr lane (delta 0x216c4, wrap).
   frame_dword_dst: dst of the ONE lane-value-decidable store, [state+0x78]
   = [game+0x264f8], as save_state_arg + 0x78 (newslot+0x7c, wrap). */
uint32_t isaac_game_update_slice_savestate_blob14_source_addr(
    uint32_t payload_blob_addr);
uint32_t isaac_game_update_slice_savestate_frame_dword_dst(
    uint32_t game_base, int32_t new_slot_index);

/* Composed plan: serialization order + per-section gates in one read. */
int32_t isaac_game_update_slice_savestate_plan(
    uint32_t src_begin, uint32_t src_end, uint32_t dst_begin, uint32_t dst_end,
    uint32_t dst_field_addr, uint32_t src_field_addr, uint32_t px_begin,
    uint32_t px_end, int32_t game_67788, int32_t game_265ec,
    IsaacGameUpdateSliceSaveStatePlan* out);
uintptr_t isaac_game_update_slice_savestate_plan_address(void);
uint32_t isaac_game_update_slice_savestate_plan_words(void);

/* ==================================================================== */
/* ABI v95 (record idx 31, Room::TriggerClear 0x008068f0): the
   CALL-ARG / decision laws of the non-greed fragments. Bodies stay
   TYPED-HOST (music 0x7f83b0 / audio 0x7f7a40 / rewind 0x705ee0 / SFX
   path / deep-challenge music / awards walk). Zero layout: freestanding
   exports only, no events/runtime/state fields, ABI stays 95.
   Every scalar param is uint32_t/int32_t — no uint8_t scalar params. */

/* 0x9e5960 stats CALL-ARG pack (PE 0x806918..0x806935):
   arg1 room_type = this+8 (sparse room_type_8), arg2 stage_data =
   host-captured [[rd+0x10]+0x48], arg3 clear_count_word =
   (uint16)[rd+0x4a] (PE 0x806927 movzx), arg4 flag_bit10 =
   (flags44>>10)&1 (PE 0x80691e shr 0xa / and al,1 / movzx). */
typedef struct IsaacGameUpdateSliceTriggerClearStatsArgs {
  uint32_t room_type;
  uint32_t stage_data;
  uint32_t clear_count_word;
  uint32_t flag_bit10;
} IsaacGameUpdateSliceTriggerClearStatsArgs;

/* Music/audio play args (PE 0x8069c9..0x8069da): both 0x7f7a40 (non-greed
   only) and 0x7f83b0 (always) receive (arg1=1, arg2=0) — push 0 ; push 1. */
typedef struct IsaacGameUpdateSliceTriggerClearMusicArgs {
  uint32_t fire_7f7a40; /* 1 = non-greed (mode!=2 && mode!=3) */
  uint32_t fire_7f83b0; /* 1 = always */
  uint32_t arg1;        /* 1 */
  uint32_t arg2;        /* 0 */
} IsaacGameUpdateSliceTriggerClearMusicArgs;

/* playSound==0 SFX path (PE 0x8069df..0x806a25): armed = (byte
   playSound)==0; seed id 0x24 (0x8069ee mov [ebp+8],0x24); the 0x92dc30
   Play const args (volume 1.0f bits 0x3f800000, frame_delay 2, loop 0,
   pitch 1.0f bits 0x3f800000, pan 0) with receiver off 0x2a324 on
   [0xc7169c] (matches ISAAC_SFX_MANAGER_RECEIVER_OFF). */
typedef struct IsaacGameUpdateSliceTriggerClearSfxPlan {
  uint32_t armed;        /* (play_sound & 0xff) == 0 */
  uint32_t seed_id;      /* 0x24 */
  uint32_t volume_bits;  /* 0x3f800000 */
  uint32_t frame_delay;  /* 2 */
  uint32_t loop;         /* 0 */
  uint32_t pitch_bits;   /* 0x3f800000 */
  uint32_t pan;          /* 0 */
  uint32_t receiver_off; /* 0x2a324 */
} IsaacGameUpdateSliceTriggerClearSfxPlan;

/* Deep challenge/music path (PE 0x806a65..0x806b59): the multi-gate
   decision + the fire side effects (flag |0x10000, SFX seed 0x5a,
   Room+0x72fc = 0). Host leaves: 0x9e9b50/0x9595e0/0x740bc0 probes and
   the SFX pre-play 0x956780 + Play 0x92dc30. */
typedef struct IsaacGameUpdateSliceTriggerClearDeepMusic {
  uint32_t fire;          /* 1 = the path runs */
  uint32_t flag_or_10000; /* Game+0x1839c |= 0x10000 when fire */
  uint32_t sfx_seed_id;   /* 0x5a when fire */
  uint32_t room72fc_zero; /* 1 = Room+0x72fc = 0 when fire */
} IsaacGameUpdateSliceTriggerClearDeepMusic;

/* Awards bit7 walk (PE 0x806b63..0x806b98): walk_active = bit7 clear;
   fire_9bb840 = walk_active && !(greed && roomType==1) (PE 0x806b76..
   0x806b86); fire_7fb250 = walk_active (PE 0x806b91..0x806b93 ALWAYS
   when bit7 clear); receiver 0x9bb840 = Game+0x1baa8 (PE 0x806b86 lea),
   0x7fb250 = room (thiscall). */
typedef struct IsaacGameUpdateSliceTriggerClearAwardsWalk {
  uint32_t walk_active;       /* ((flags44>>7)&1) == 0 */
  uint32_t fire_9bb840;       /* walk && !(greed && room_type_8==1) */
  uint32_t fire_7fb250;       /* walk */
  uint32_t receiver_9bb840_off; /* 0x1baa8 */
} IsaacGameUpdateSliceTriggerClearAwardsWalk;

/* Rewind tail (PE 0x806c0a push -1 ; call 0x705ee0): ALWAYS fires with
   arg 0xffffffff (the v74 frozen -1; 0x705ee0 reads [0xc71678]). */
typedef struct IsaacGameUpdateSliceTriggerClearRewindTail {
  uint32_t fire; /* 1 = always */
  uint32_t arg;  /* 0xffffffff */
} IsaacGameUpdateSliceTriggerClearRewindTail;

/* Awards non-greed music suite (PE 0x806a26..0x806a64): the ordered
   three-call suite that fires when difficulty != 2 && != 3 (FULL-DWORD
   0x806a32 cmp/je + 0x806a3b cmp/je -> 0x806b63 skip). Order is
   machine-fixed: 0x7f9960(0, 0) then 0x820170(1, 0, 0) then
   0x8204b0(0) — every receiver is the ROOM (thiscall, ecx=ebx =
   Room; pushes at 0x806a44/0x806a46, 0x806a4f/0x806a51/0x806a53,
   0x806a5c). All three bodies stay TYPED-HOST (music leaves); this
   pack pins the gate + exact call order + args so the host consumer
   re-issues them verbatim. */
typedef struct IsaacGameUpdateSliceTriggerClearAwardsSuite {
  uint32_t fire;          /* 1 = difficulty not 2/3 (suite runs) */
  uint32_t call1_va;      /* 0x007f9960 */
  uint32_t call1_arg1;    /* 0 */
  uint32_t call1_arg2;    /* 0 */
  uint32_t call2_va;      /* 0x00820170 */
  uint32_t call2_arg1;    /* 1 */
  uint32_t call2_arg2;    /* 0 */
  uint32_t call2_arg3;    /* 0 */
  uint32_t call3_va;      /* 0x008204b0 */
  uint32_t call3_arg1;    /* 0 */
  uint32_t receiver_is_room; /* 1 = all three receivers are the room */
} IsaacGameUpdateSliceTriggerClearAwardsSuite;

void isaac_game_update_slice_trigger_clear_stats_args(
    uint32_t room_type, uint32_t stage_data, uint32_t clear_count,
    uint32_t flags44, IsaacGameUpdateSliceTriggerClearStatsArgs* out);
void isaac_game_update_slice_trigger_clear_music_args(
    uint32_t difficulty_269c8, IsaacGameUpdateSliceTriggerClearMusicArgs* out);
void isaac_game_update_slice_trigger_clear_sfx_plan(
    uint32_t play_sound_byte, IsaacGameUpdateSliceTriggerClearSfxPlan* out);
void isaac_game_update_slice_trigger_clear_deep_music_gate(
    uint32_t byte_1bb84, uint32_t probe_9e9b50, uint32_t probe_9595e0,
    uint32_t byte_26588, uint32_t vec_begin_4b3d8, uint32_t vec_end_4b3dc,
    uint32_t count_334, uint32_t flag_1839c, uint32_t room_match,
    uint32_t game_0, uint32_t game_4, uint32_t frame_264f8,
    IsaacGameUpdateSliceTriggerClearDeepMusic* out);
void isaac_game_update_slice_trigger_clear_awards_walk(
    uint32_t flags44, uint32_t difficulty_269c8, uint32_t room_type_8,
    IsaacGameUpdateSliceTriggerClearAwardsWalk* out);
void isaac_game_update_slice_trigger_clear_awards_suite(
    uint32_t difficulty_269c8, IsaacGameUpdateSliceTriggerClearAwardsSuite* out);
void isaac_game_update_slice_trigger_clear_rewind_tail_arg(
    IsaacGameUpdateSliceTriggerClearRewindTail* out);

/* ------------------------------------------------------------------ v95 - */
/* Record idx 15 opaqueRoomUpdatePrefixB3B7 — typed-host plan. Mirrors
   isaac_game_update_slice_b3b7_wire; every counter names one host leaf of
   the B3-B7 residual (PE 0x00803327..0x00803bfb). The pure decision laws
   (B3 FCO/challenge/TE + B4-B7 frame laws) run IN-MODULE; the bodies stay
   typed-host. Room-family v36/v37/v39 freestanding laws are consumed BY
   REFERENCE (never re-transcribed). */
#pragma pack(push, 1)
typedef struct IsaacGameUpdateSliceB3B7Plan {
  uint32_t b3_host_fco;         /* FCO(0x28d) leaf ran (always 1 entered) */
  uint32_t b3_host_challenge;   /* 0x7ea2d0 body when HCE(0x2a5) hit */
  uint32_t b3_host_te_call;     /* 0x9960b0 when TE walk match */
  uint32_t b4_host_lookup;      /* 0x41af60 when desc type == -0x14 */
  uint32_t b4_host_pos_a;       /* 0x812d00 (G0 route) */
  uint32_t b4_host_pos_finish;  /* 0x813520 count */
  uint32_t b4_genrand_draws;    /* 0x6eef60 draws */
  uint32_t b4_host_spawns;      /* 0x428b20 spawns */
  uint32_t b4_host_cleanup;     /* 0xa648b0 when result byte == 0 */
  uint32_t b4_seed_fatal;       /* typed drop 0xa112c0 seed-null */
  uint32_t b5_host_count_708250;/* 0x708250 when outer gate open */
  uint32_t b5_host_vcall48;     /* [vt+0x48] probes */
  uint32_t b5_host_grow;        /* 0x42c920 grows */
  uint32_t b5_host_vcall4c;     /* [vt+0x4c] probes (pass2) */
  uint32_t b5_seed_fatal;       /* typed drop 0xa112c0 seed-null */
  uint32_t b6_host_destroy;     /* [vt+0] destroy calls */
  uint32_t b6_host_iterate;     /* 0x414a80 per-node advances */
  uint32_t b6_host_clear;       /* 0x424540 list clear */
  uint32_t b7_host_update;      /* [vt+8] grid Update calls */
} IsaacGameUpdateSliceB3B7Plan;
#pragma pack(pop)
static_assert(sizeof(IsaacGameUpdateSliceB3B7Plan) == 76,
              "B3B7 typed plan ABI changed");

/* ABI v99 leaf peel (idx 15): FUN_00708250 result plan. result = the
   eax return (sum of nested 0x7db860 over included players). node_reject
   / empty_vector close the walk with result 0. host_7db860 = included
   player count (one thiscall per include). 0x4288a0 scan walk stays host
   as the last-node sample source. Mid-loop empty-vector 0xa112c0 is a
   typed-host warn (continues); not in this captured-count model. */
typedef struct IsaacGameUpdateSliceB5Count708250Plan {
  uint32_t result;
  uint32_t node_reject;
  uint32_t empty_vector;
  uint32_t host_7db860;
  uint32_t included;
} IsaacGameUpdateSliceB5Count708250Plan;
static_assert(sizeof(IsaacGameUpdateSliceB5Count708250Plan) == 20,
              "708250 count plan ABI changed");
typedef struct IsaacGameUpdateSliceB5Count708250Player {
  uint32_t field_2c;
  uint32_t field_3bc;
  uint32_t buf_begin;
  uint32_t buf_end;
  uint32_t buf_byte;
} IsaacGameUpdateSliceB5Count708250Player;
static_assert(sizeof(IsaacGameUpdateSliceB5Count708250Player) == 20,
              "708250 player pack ABI changed");
static_assert(sizeof(IsaacGameUpdateSliceB5Count708250Player) *
                  ISAAC_GAME_UPDATE_B5_COUNT_708250_MAX_PLAYERS ==
              160,
              "708250 8-player pack ABI changed");

/* ---- ABI v95 (record idx 29 roomTriggerClearAwardsBit7): FUN_007fb250
   award-spawner HEAD dispatch + arithmetic laws (VA 0x007fb250..0x007fe0b3,
   2970 insns, ret 0x7fe0b3). The whole-body Lua gate 0x866220 and the
   walk/greed/generic arm bodies (0x7fbb64 / 0x7fd8e2 / 0x7fa920 lane) stay
   TYPED-HOST; this block grounds the head mode/room-type select (reusing
   trigger_clear_greed_mode for the 2/3 gate), the merchant gate + chain
   call-arg pack, the walk decision, the Lua-gate skip, the generic-arm
   mineshaft skip, the tail store fire, and the two pure arithmetic
   helpers 0x812d00 (stage table idiv + f32 out pair) / 0x823ec0 (grid
   index). Branch-by-branch from cpu-dump 007fb250.txt / 00812d00.txt /
   00823ec0.txt — do NOT derive from the C++. No uint8_t scalar params. */
#pragma pack(push, 1)
/* 0x812d00 out (PE 0x812d53 movss [out],/ 0x812d6a movss [out+4],). */
typedef struct IsaacGameUpdateSlice812d00Out {
  uint32_t fire;       /* 0 = chain null or stage48 outside [9..12] */
  uint32_t out0_bits;  /* f32 bits: f32(rem)*40.0f + 40.0f (0x812d53) */
  uint32_t out1_bits;  /* f32 bits: f32(quot)*40.0f + 120.0f (0x812d6a) */
} IsaacGameUpdateSlice812d00Out;
#pragma pack(pop)
static_assert(sizeof(IsaacGameUpdateSlice812d00Out) == 12,
              "812d00 out ABI changed");

/* Merchant chain typed-host call-arg pack (PE 0x7fb42e..0x7fb45f). */
#pragma pack(push, 1)
typedef struct IsaacGameUpdateSliceAwardsBit7MerchantChain {
  uint32_t fire;              /* merchant gate open */
  uint32_t call1_va;          /* 0x929b40 */
  uint32_t call1_arg1;        /* 1 */
  uint32_t call1_arg2;        /* 1 */
  uint32_t call1_this_off;    /* Mgr+0x14 receiver offset ([0xc7169c]) */
  uint32_t call2_va;          /* 0x95a7b0 (no receiver) */
  uint32_t call2_arg1;        /* 0xe */
  uint32_t call3_va;          /* 0x929b40 */
  uint32_t call3_arg1;        /* 0x1ec */
  uint32_t call3_arg2;        /* 1 */
  uint32_t call3_this_off;    /* Mgr+0x14 */
  uint32_t call4_va;          /* 0x6f9770 */
  uint32_t call4_arg1;        /* 0xe */
  uint32_t call4_this_off;    /* Game ([0xc71678]) */
} IsaacGameUpdateSliceAwardsBit7MerchantChain;
#pragma pack(pop)
static_assert(sizeof(IsaacGameUpdateSliceAwardsBit7MerchantChain) == 56,
              "merchant chain ABI changed");

/* Walk decision (PE 0x7fb464..0x7fb47c): 1 walk (5/0x11), 2 skip (0x10),
   0 other — FULL-DWORD compares. */
int32_t isaac_game_update_slice_awards_bit7_walk_decision(uint32_t room_type_8);
/* Merchant gate (PE 0x7fb40f..0x7fb422): ptr!=0 && [ptr+0]==0x23 &&
   [ptr+8]==0x10. */
int32_t isaac_game_update_slice_awards_bit7_merchant_gate(
    uint32_t merchant_ptr_nonzero, uint32_t merchant_kind_0,
    uint32_t merchant_type_8);
/* Head select (PE 0x7fb3f7..0x7fb47c): 1 greed (composes
   trigger_clear_greed_mode for the 0x7fb3fd/0x7fb406 mode gate),
   2 merchant, 3 walk, 4 skip (0x10), 0 generic. */
int32_t isaac_game_update_slice_awards_bit7_head_select(
    int32_t difficulty_269c8, int32_t merchant_gate, int32_t walk_decision);
/* Generic-arm skip (PE 0x7fb482..0x7fb497): skip iff (mineshaft_al & 0xff)
   != 0 && dim_1830c == 1. */
int32_t isaac_game_update_slice_awards_bit7_generic_skip(
    uint32_t mineshaft_al, uint32_t dim_1830c);
/* Lua gate skip (PE 0x7fb2cb..0x7fb2cd test al,al / jne 0x7fe099): LOW
   BYTE; nonzero skips ALL award spawning + the tail store. */
int32_t isaac_game_update_slice_awards_bit7_lua_gate_skip(uint32_t gate_al);
/* Tail store fire (PE 0x7fb2cd / 0x7fe087..0x7fe096): the
   [Room+4+0x60] = final ac store runs on EVERY non-Lua-skip path. */
int32_t isaac_game_update_slice_awards_bit7_tail_store_fire(
    uint32_t lua_gate_skip);
/* 812d00 (VA 0x00812d00, 37 insns, 0 E8): stage table {9:0x148, 10:0x13b,
   11:0x84, 12:0x77} (jump table 0x812dc8), UNSIGNED stage gate
   (stage48-9 <= 3), SIGNED idiv by [Game+0x18300+0xc], out0 =
   f32(rem)*40.0f+40.0f (composes tailmid_706c_expire_pos_y), out1 =
   f32(quot)*40.0f+120.0f (composes _pos_x). divisor==0 -> fire=0
   (PE #DE; documented divergence). */
void isaac_game_update_slice_812d00_arithmetic(
    uint32_t chain4_nonzero, uint32_t chain4_10_nonzero, uint32_t stage48,
    uint32_t divisor_c, IsaacGameUpdateSlice812d00Out* out);
/* 823ec0 (VA 0x00823ec0, 49 insns, 1 E8 -> 0x812d00): grid index.
   x=(out0+0.0f-40.0f)/40.0f+0.5f cvttss2si; y=(out1-80.0f-120.0f)/
   40.0f+0.5f cvttss2si; SIGNED < 0 and SIGNED >= bounds ([Room+0xc],
   [Room+0x10]) -> -1; return [Room+0xc]*y+x. fire==0 -> -1 (PE reads
   uninitialized stack; documented divergence). */
int32_t isaac_game_update_slice_823ec0_index(
    uint32_t fire_812d00, uint32_t out0_bits, uint32_t out1_bits,
    uint32_t room_c, uint32_t room_10);
/* Merchant chain pack (PE 0x7fb42e..0x7fb45f): the 4 fixed-arg calls. */
void isaac_game_update_slice_awards_bit7_merchant_chain(
    uint32_t fire, IsaacGameUpdateSliceAwardsBit7MerchantChain* out);
static_assert(offsetof(IsaacGameUpdateSliceB3B7Plan, b7_host_update) == 72,
              "B3B7 typed plan b7 offset");

/* ---- B3 decision laws (PE 0x00803327..0x008033b1) ---- */
int32_t isaac_game_update_slice_b3b7_b3_fco_flag_gate(uint32_t fco_result);
uint32_t isaac_game_update_slice_b3b7_b3_fco_id(void);
uint32_t isaac_game_update_slice_b3b7_b3_hce_id(void);
int32_t isaac_game_update_slice_b3b7_b3_challenge_host_gate(uint32_t hce_result);
int32_t isaac_game_update_slice_b3b7_b3_te_walk_gate(uint32_t byte_7321);
int32_t isaac_game_update_slice_b3b7_b3_te_walk_nonempty(uint32_t begin,
                                                        uint32_t end);
int32_t isaac_game_update_slice_b3b7_b3_te_entry_match(uint32_t type0,
                                                      uint32_t variant4);
int32_t isaac_game_update_slice_b3b7_b3_te_walk_continue(uint32_t next,
                                                        uint32_t end);
uint32_t isaac_game_update_slice_b3b7_b3_te_host_this_off(void);
uint32_t isaac_game_update_slice_b3b7_b3_te_host_arg(void);
/* ---- B4 frame laws (PE 0x008033b6..0x00803854) ---- */
int32_t isaac_game_update_slice_b3b7_b4_desc_type_gate(uint32_t desc_type0);
int32_t isaac_game_update_slice_b3b7_b4_frame_in_room_gate(uint32_t room_byte1,
                                                          int32_t frame_264f8,
                                                          int32_t entry_11f0);
int32_t isaac_game_update_slice_b3b7_b4_lookup_route(uint32_t lookup_count);
uint32_t isaac_game_update_slice_b3b7_b4_pickup_variant_from_rem(uint32_t rem100);
int32_t isaac_game_update_slice_b3b7_b4_second_band_kind(uint32_t rem100);
int32_t isaac_game_update_slice_b3b7_b4_band_option_gate(uint32_t option_byte,
                                                        uint32_t mgr_mode8,
                                                        uint32_t game_nonnull,
                                                        uint32_t game_26630,
                                                        uint32_t game_byte_26589);
int32_t isaac_game_update_slice_b3b7_b4_third_spawn_gate(uint32_t rng3);
int32_t isaac_game_update_slice_b3b7_b4_cleanup_gate(uint32_t lookup_result_byte);
/* ---- B5 frame laws (PE 0x00803854..0x00803b1d) ---- */
int32_t isaac_game_update_slice_b3b7_b5_outer_gate(uint32_t room_byte0,
                                                   int32_t frame_264f8,
                                                   int32_t entry_11f0);
int32_t isaac_game_update_slice_b3b7_b5_pass1_mode(uint32_t game_26584);
int32_t isaac_game_update_slice_b3b7_b5_type_candidate(uint32_t mode_26614,
                                                      uint32_t entity_type28);
int32_t isaac_game_update_slice_b3b7_b5_flag_clear(uint32_t flags168);
int32_t isaac_game_update_slice_b3b7_b5_excluded_type(uint32_t type28,
                                                     uint32_t variant2c);
int32_t isaac_game_update_slice_b3b7_b5_post_vcall48_ok(uint32_t vt48_al,
                                                       int32_t field32c);
int32_t isaac_game_update_slice_b3b7_b5_pass2_count_gate(uint32_t count_708250);
int32_t isaac_game_update_slice_b3b7_b5_needs_rng(uint32_t vt4c_al);
int32_t isaac_game_update_slice_b3b7_b5_append_gate(uint32_t rng);
int32_t isaac_game_update_slice_b3b7_b5_seed_fatal_gate(uint32_t seed3dc);
/* ABI v99 leaf peel (idx 15): FUN_00708250 body laws. No uint8_t
   params. node_byte_d is LOW-BYTE (PE 0x70827c cmp byte [eax+0xd],0);
   node_value_10 is SIGNED jg vs 0x4f (PE 0x708286/0x70828a — 0xffffffff
   does NOT reject); node_is_head / field_2c / field_3bc / player_count
   are FULL-DWORD. Nested 0x7db860 reuses the same node reject then
   SIGNED (end-begin) > 0x8f and movzx byte [begin+0x8f].
   continue is UNSIGNED jb (PE 0x70832b cmp edi,ecx / jb) — the loop
   bound is re-derived every iteration. Walk cap =
   ISAAC_GAME_UPDATE_B5_COUNT_708250_MAX_PLAYERS (8) on BOTH sides. */
int32_t isaac_game_update_slice_b5_count_708250_node_reject(
    uint32_t node_byte_d, uint32_t node_value_10, uint32_t node_is_head);
int32_t isaac_game_update_slice_b5_count_708250_player_include(
    uint32_t field_2c, uint32_t field_3bc);
int32_t isaac_game_update_slice_b5_count_708250_empty(uint32_t player_count);
int32_t isaac_game_update_slice_b5_count_708250_continue(uint32_t index,
                                                        uint32_t count_now);
int32_t isaac_game_update_slice_b5_count_708250_7db860(
    uint32_t node_byte_d, uint32_t node_value_10, uint32_t node_is_head,
    uint32_t buf_begin, uint32_t buf_end, uint32_t buf_byte);
uint32_t isaac_game_update_slice_b5_count_708250_result(
    uint32_t node_byte_d, uint32_t node_value_10, uint32_t node_is_head,
    uint32_t player_count,
    const IsaacGameUpdateSliceB5Count708250Player* players);
void isaac_game_update_slice_b5_count_708250(
    uint32_t node_byte_d, uint32_t node_value_10, uint32_t node_is_head,
    uint32_t player_count,
    const IsaacGameUpdateSliceB5Count708250Player* players,
    IsaacGameUpdateSliceB5Count708250Plan* out);
uint32_t isaac_game_update_slice_b5_count_708250_host_va(void);
uint32_t isaac_game_update_slice_b5_count_708250_host_va_7db860(void);
uint32_t isaac_game_update_slice_b5_count_708250_host_va_4288a0(void);
/* ---- B6 frame laws (PE 0x00803b2e..0x00803bb4) ---- */
int32_t isaac_game_update_slice_b3b7_b6_destroy_needed(uint32_t tree_count_7238);
int32_t isaac_game_update_slice_b3b7_b6_grid_index_valid(int32_t grid_index,
                                                        int32_t width_c,
                                                        int32_t height_10);
/* ---- B7 frame laws (PE 0x00803bb4..0x00803bfb) ---- */
int32_t isaac_game_update_slice_b3b7_b7_grid_cells(int32_t w, int32_t h);
int32_t isaac_game_update_slice_b3b7_b7_grid_update_needed(uint32_t cells);
int32_t isaac_game_update_slice_b3b7_b7_slot_update_needed(uint32_t slot_ptr);
uint32_t isaac_game_update_slice_b3b7_b7_cell_base_off(void);

/* Record wire: full B3-B7 typed plan from the captured pack. When the pack
   is not ready the caller keeps the monolithic residual. */
void isaac_game_update_slice_b3b7_wire(
    const IsaacGameUpdateSliceRuntimeInputs* in, int32_t frame_264f8,
    IsaacGameUpdateSliceB3B7Plan* out);

/* ==================================================================== */
/* ABI v95 (record idx 42 opaqueRoomUpdateTailPath): B19 path rebuild +
   B20 trail-list record wire laws. Room-family laws consumed BY REFERENCE
   (B19 v30 / B20 v31-v32, room_pure_helpers) — never re-transcribed here.
   B19 gate PE 0x008055a7: cmp byte [Room+0x7769],0 / je B20 (LOW-BYTE);
   B20 gate PE 0x0080608e: cmp [DAT_00c82674],[DAT_00c82678] / je epilogue.
   No uint8_t scalar params (all u32; laws re-narrow & 0xff). */

/* B19 rebuild decision (PE 0x008055a7): 1 = rebuild body must host
   (refcount++/memset/tree/pathfinding/spawn/pedestal; flag-on ALWAYS hosts
   even when W*H<=0 and the entity list is empty — no B18-style empty
   pure-complete). 0 = pure NONE (flag low byte 0; zero stores at the B19
   head). Delegates to isaac_room_b19_needs_path_rebuild_host. */
int32_t isaac_game_update_slice_b19_rebuild_decision(uint32_t room_flag_7769);

/* ABI v99 leaf peel (idx 42): B19 rebuild-body islands. Flag-on ALWAYS
   hosts (refcount/memset/tree/spawn/pedestal). These four laws are the
   complete small helpers with every path understood. No uint8_t params. */
/* PE 0x80570e test al,al / jne skip after host 0x72fe80. LOW-BYTE.
   1 = proceed (al==0). */
int32_t isaac_game_update_slice_b19_query_al_proceed(uint32_t query_al);
/* PE 0x805718 and dword [esi+0x168], 0xfff7ffff. FULL-DWORD. */
uint32_t isaac_game_update_slice_b19_flags168_clear_bit(uint32_t flags168);
/* PE 0x805e6e cmp edi,0x1c0 / jae 0x8068db. UNSIGNED. 1 = in range. */
int32_t isaac_game_update_slice_b19_cell_buf_in_range(uint32_t idx);
/* PE 0x805db3 cmp dword [Room+8],0x10 / jne; addss [0xbaa8d0]=30.0f.
   FULL-DWORD type; returns y_bits (identity unless type==0x10). */
uint32_t isaac_game_update_slice_b19_type10_y_nudge(
    uint32_t room_type_8, uint32_t y_bits);
uint32_t isaac_game_update_slice_b19_host_va_get_grid_collision(void);
uint32_t isaac_game_update_slice_b19_host_va_query_8000(void);
uint32_t isaac_game_update_slice_b19_host_va_get_alt_pedestal(void);
uint32_t isaac_game_update_slice_b19_host_va_set_alt_pedestal(void);
/* ABI v99 exports-only (idx 42, update-v113-tailpath-b19b20): leftover
   B19/B20 decision islands. Tree/spawn/pedestal/SEH/vector bodies stay
   typed-host. No uint8_t scalar params. */
int32_t isaac_game_update_slice_b19_entity_present(uint32_t entity_ptr);
int32_t isaac_game_update_slice_b19_spawn_ptr_live(uint32_t spawn_ptr);
uint32_t isaac_game_update_slice_b19_fatal_level(void);
uint32_t isaac_game_update_slice_b19_fatal_string_va(void);
int32_t isaac_game_update_slice_b19_field528_gt0(int32_t field_528);
int32_t isaac_game_update_slice_b20_vector_inplace(uint32_t vec_end,
                                                  uint32_t vec_cap);
int32_t isaac_game_update_slice_b20_spawn_result_live(uint32_t spawn_ptr);
uint32_t isaac_game_update_slice_b19_host_va_fatal(void);
uint32_t isaac_game_update_slice_b19_host_va_4288a0(void);
uint32_t isaac_game_update_slice_b19_host_va_6eed30(void);
uint32_t isaac_game_update_slice_b19_host_va_5cc710(void);
uint32_t isaac_game_update_slice_b19_host_va_42c8e0(void);
uint32_t isaac_game_update_slice_b20_host_va_802740(void);
uint32_t isaac_game_update_slice_b20_host_va_42c920(void);


/* One-iteration B20 trail-loop frame law (0x0080608e..0x00806880): composed
   per-captured-entity: pass1 type filter (4 types, 0x008060e3..0x008060fd),
   |0x4000 pure post (0x00806135..0x00806145), pass2 action route
   (0x00806200 flags & 0x4000 -> FLAGGED, else type route 0x008064ab: pair-X
   set / 0x66 pair-Y / default), spawn |0x80 pure post (0x008067f2), pair
   ±offset pure posts (60.0/30.0), multi-spawn enter (field_3c0==0,
   0x00806281) + chain continue (0x0080635b, mode + type range [10,999]),
   per-step host counts: push (0x42c920), spawn (0x428b20), genrand draw arm
   (FLAGGED/DEFAULT -> 0x6eef60 + sin/cos), deallocate (0x40c740, once). */
void isaac_game_update_slice_b20_trail_frame(
    uint32_t entity_type_28, uint32_t entity_flags_16c, uint32_t field_3c0,
    uint32_t child_ptr_3bc, uint32_t child_type_28, uint32_t mode_26614,
    uint32_t pos_x_bits, uint32_t pos_y_bits,
    IsaacGameUpdateSliceB20TrailFrame* out);

/* Record wire decide: flag_ready gate (B19) -> list gate (B20) -> count ->
   loop walk. ready=0 -> MONOLITHIC (record keeps the pre-v95 monolithic
   edge exactly). B19: flag low byte 0 -> NONE, else HOST_REBUILD. B20:
   begin==end -> NONE, else HOST_TRAIL. host_genrand_draws = host-reported
   Isaac::genrand_int32 draws from the FLAGGED/DEFAULT arms (typed-host;
   capped). entries = the capture lane (up to entry_capacity nodes). */
void isaac_game_update_slice_tail_path_wire(
    uint32_t flag_ready, uint32_t room_flag_7769,
    uint32_t list_begin_c82674, uint32_t list_end_c82678,
    uint32_t mode_26614, uint32_t host_genrand_draws,
    const IsaacGameUpdateSliceTailPathEntry* entries, uint32_t entry_capacity,
    IsaacGameUpdateSliceTailPathPlan* out);

/* ------------------------------------------------------------------ v95 - */
/* ABI v95 (record idx 18, roomTriggerOutput 0x00823080): the BODY pure
   laws — per-channel intrusive walk (0x82308f..0x8230c5 + advance
   0x414a80), triple-match entry scan (0x8230c7..0x823113: f28==0x3e8 &&
   f2c==0x78 && f450==arg; f173=1 byte store + vtbl+0xc vcall), and the
   fn-pointer callback range (0x823115..0x82313d: begin/end at
   this+0x7378+12*arg / this+0x737c+12*arg, 4-byte stride). Census + full
   transcription: section-notes/update-v95-18-trigger-output/NOTES.md.
   All three caller sites (0x80207e arg0 / 0x804170 arg9 / 0x985957
   arg0..3) share this body; the laws are arg-parametric, the record wire
   passes the clear-side immediate 9 (PE 0x80416c push 9).
   Every scalar param is uint32_t/int32_t — no uint8_t scalar params
   (Wasm i32 args are not narrowed; low-byte flag re-narrow happens in
   the body). ABI stays 95 (no bump; coordinator owns layout). */
#define ISAAC_ROOM_TRIGGER_OUTPUT_MAX_WALK_NODES 128u
#define ISAAC_ROOM_TRIGGER_OUTPUT_MAX_TABLE 64u
#define ISAAC_ROOM_TRIGGER_OUTPUT_MAX_ENTRIES 256u
#define ISAAC_ROOM_TRIGGER_OUTPUT_MAX_MATCHES 64u
#define ISAAC_ROOM_TRIGGER_OUTPUT_MAX_CALLBACKS 256u

/* Captured intrusive-list node (advance 0x414a80 field set: next +0x0,
   parent +0x4, child +0x8, flag byte +0xd; dispatch index +0x10). */
typedef struct IsaacRoomTriggerOutputNode {
  uint32_t addr;   /* +0x00 */
  uint32_t next;   /* +0x04  (+0x0 of the PE node) */
  uint32_t parent; /* +0x08  (+0x4) */
  uint32_t child;  /* +0x0c  (+0x8) */
  uint8_t  flag;   /* +0x10  (+0xd byte) */
  uint8_t  pad[3];
  uint32_t f10;    /* +0x14  (+0x10, index into this+0x24 table) */
} IsaacRoomTriggerOutputNode;

/* The per-channel list head (sentinel) at this+0x7328+8*arg. Only
   field +0x0 ([head] = first node) is read by the 0x823096 prologue; the
   advance may descend into head->parent/child, so the full field set is
   captured. */
typedef struct IsaacRoomTriggerOutputHead {
  uint32_t addr;   /* +0x00 */
  uint32_t next;   /* +0x04 */
  uint32_t parent; /* +0x08 */
  uint32_t child;  /* +0x0c */
  uint8_t  flag;   /* +0x10 */
  uint8_t  pad[3];
} IsaacRoomTriggerOutputHead;

/* One resolved this+0x24+4*idx table entry (nonzero value = dispatch). */
typedef struct IsaacRoomTriggerOutputTableEntry {
  uint32_t index; /* +0x00 */
  uint32_t value; /* +0x04 */
} IsaacRoomTriggerOutputTableEntry;

/* Captured entry triple for the scan (PE reads +0x28/+0x2c/+0x450 only;
   the f173=1 byte store is implied per matched index). */
typedef struct IsaacRoomTriggerOutputEntryField {
  uint32_t f28;  /* +0x00 */
  uint32_t f2c;  /* +0x04 */
  uint32_t f450; /* +0x08 */
} IsaacRoomTriggerOutputEntryField;

/* Walk result carrier. valid=0 -> monolith (caller keeps the residual);
   valid=1 -> visited/dispatch are the pure counts (dispatch == nonzero
   table hits -> host 0x823150 calls). */
typedef struct IsaacRoomTriggerOutputWalkResult {
  int32_t  valid;    /* +0x00 */
  uint32_t visited;  /* +0x04 nodes visited by the walk */
  uint32_t dispatch; /* +0x08 host 0x823150 dispatch calls */
} IsaacRoomTriggerOutputWalkResult;

/* Phase-1 walk law (0x82308f..0x8230c5 + advance 0x414a80): simulates the
   exact advance over a head + captured node set (addr-resolved, v79-style
   guard). The head slot this+0x7328+8*arg is host-resolved before the law
   (arg itself is not needed: the machine uses it only to fetch the head).
   Returns the dispatch count (>= 0) or -1 (out-of-contract -> monolith);
   *out->visited = nodes visited when valid. */
int32_t isaac_game_update_slice_room_trigger_output_walk(
    const IsaacRoomTriggerOutputHead* head,
    const IsaacRoomTriggerOutputNode* nodes, uint32_t node_count,
    const IsaacRoomTriggerOutputTableEntry* table, uint32_t table_count,
    IsaacRoomTriggerOutputWalkResult* out);

/* Phase-2 scan law (0x8230c7..0x823113): match count == f173 byte stores
   == host vtbl+0xc calls. Matched entry indexes are written to
   match_indexes[0..count); count > match_index_cap -> -1 (monolith). */
int32_t isaac_game_update_slice_room_trigger_output_scan(
    uint32_t arg, const IsaacRoomTriggerOutputEntryField* entries,
    uint32_t entry_count, uint32_t* match_indexes, uint32_t match_index_cap);

/* Phase-3 callback law (0x823115..0x82313d): (end-begin)/4 host fn-pointer
   calls. end < begin, misaligned diff, or over-cap -> -1 (monolith). */
int32_t isaac_game_update_slice_room_trigger_output_callbacks(uint32_t begin,
                                                              uint32_t end);

/* Record-18 site immediate (PE 0x80416c push 9; this+0x7328+8*9 head
   table, this+0x7378+12*9 callback range). */
static constexpr int32_t ISAAC_GAME_UPDATE_ROOM_TRIGGER_OUTPUT_CLEAR_ARG = 9;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_OUTPUT_MATCH_TYPE = 0x3e8u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_OUTPUT_MATCH_VARIANT = 0x78u;

/* ABI v99 exports-only (idx 18, update-v114-triggeroutput-dispatch):
   FUN_00823150 gate layer 0x00823150..0x00823367 ret 4. Hit bodies stay
   typed-host. No uint8_t scalar params. */
enum {
  ISAAC_GAME_UPDATE_823150_ARM_JOIN = 0,
  ISAAC_GAME_UPDATE_823150_ARM_C = 1,
  ISAAC_GAME_UPDATE_823150_ARM_14 = 2,
  ISAAC_GAME_UPDATE_823150_ARM_2 = 3,
  ISAAC_GAME_UPDATE_823150_ARM_7 = 4,
  ISAAC_GAME_UPDATE_823150_ARM_17_EQ = 5,
  ISAAC_GAME_UPDATE_823150_ARM_17_NE = 6,
  ISAAC_GAME_UPDATE_823150_HOST_NONE = 0,
  ISAAC_GAME_UPDATE_823150_HOST_VCALL = 1,
  ISAAC_GAME_UPDATE_823150_HOST_ANM2 = 2,
  ISAAC_GAME_UPDATE_823150_HOST_CTOR = 3,
  ISAAC_GAME_UPDATE_823150_HOST_SPAWN_SFX = 4
};
int32_t isaac_game_update_slice_823150_gate_type_c(uint32_t type, uint32_t field_c);
int32_t isaac_game_update_slice_823150_gate_type_14(uint32_t type, uint32_t field_c);
int32_t isaac_game_update_slice_823150_gate_type_2(uint32_t type, uint32_t field_c,
                                                  uint32_t field_18);
int32_t isaac_game_update_slice_823150_gate_type_7(uint32_t type, uint32_t field_c,
                                                  uint32_t field_18);
int32_t isaac_game_update_slice_823150_gate_type_17(uint32_t type);
int32_t isaac_game_update_slice_823150_type_17_field_c_eq2(uint32_t field_c);
uint32_t isaac_game_update_slice_823150_dispatch_arm(uint32_t type, uint32_t field_c,
                                                    uint32_t field_18);
uint32_t isaac_game_update_slice_823150_dispatch_host_kind(uint32_t type,
    uint32_t field_c, uint32_t field_18);
uint32_t isaac_game_update_slice_823150_dispatch_field_c_store(uint32_t type,
    uint32_t field_c, uint32_t field_18);
int32_t isaac_game_update_slice_823150_type7_store_fires(uint32_t field_c);
uint32_t isaac_game_update_slice_823150_anm2_receiver_off(void);
uint32_t isaac_game_update_slice_823150_anm2_play_bool(void);
uint32_t isaac_game_update_slice_823150_anm2_string_va(uint32_t arm);
uint32_t isaac_game_update_slice_823150_anm2_play_va(void);
uint32_t isaac_game_update_slice_823150_sfx_id(void);
uint32_t isaac_game_update_slice_823150_sfx_vol_bits(void);
uint32_t isaac_game_update_slice_823150_sfx_delay(void);
uint32_t isaac_game_update_slice_823150_sfx_loop(void);
uint32_t isaac_game_update_slice_823150_sfx_pitch_bits(void);
uint32_t isaac_game_update_slice_823150_sfx_pan(void);
uint32_t isaac_game_update_slice_823150_sfx_receiver_off(void);
uint32_t isaac_game_update_slice_823150_sfx_play_va(void);
uint32_t isaac_game_update_slice_823150_sfx_prep_va(void);
uint32_t isaac_game_update_slice_823150_spawn_type(void);
uint32_t isaac_game_update_slice_823150_spawn_variant(void);
uint32_t isaac_game_update_slice_823150_spawn_pos_vec(void);
uint32_t isaac_game_update_slice_823150_spawn_va(void);
uint32_t isaac_game_update_slice_823150_host_va_ctor(void);
uint32_t isaac_game_update_slice_823150_host_va_genrand(void);
uint32_t isaac_game_update_slice_823150_host_va_714610(void);
uint32_t isaac_game_update_slice_823150_vcall_off(void);
/* ABI v116 (idx 18 type-2 arm, ABI 99 frozen exports-only): FUN_00435c70
   COMPLETE thiscall ctor (16 insn / 96 B / 1 ret / 0 E8 / 0 IND / 0
   fs:[0] / 0 cookie / identify-zhl EMPTY). PE 0x435c70..0x435ccf:
   dword [ecx+0x00/04/08/0c/20/24]=0; movss [ecx+0x10/0x18] from
   [0xc7b640]; movss [ecx+0x14/0x1c] from [0xc7b644]. Captured float
   stores as raw bit patterns (uint32_t). Struct 0x28 / 10 dwords.
   Callsite idx-18 0x823217. No uint8_t scalar params. */
uint32_t isaac_game_update_slice_435c70_va(void);
uint32_t isaac_game_update_slice_435c70_byte_len(void);
uint32_t isaac_game_update_slice_435c70_struct_size(void);
uint32_t isaac_game_update_slice_435c70_word_count(void);
uint32_t isaac_game_update_slice_435c70_src_640_va(void);
uint32_t isaac_game_update_slice_435c70_src_644_va(void);
uint32_t isaac_game_update_slice_435c70_word(uint32_t index, uint32_t bits_c7b640,
                                            uint32_t bits_c7b644);


/* ------------------------------------------------------------------ v95 - */
/* ABI v95 (record idx 41 opaqueRoomUpdateTailEntity, B18 entity walk
   0x00805527..0x008055a7): walk-frame laws. Every scalar param is
   uint32_t/int32_t — NO uint8_t scalar params (Wasm i32 args are not
   narrowed; low-byte re-narrow happens in the body where the PE tests a
   byte). The three entity update bodies (0x6e17c0 type-5, 0xaf08b1
   __RTDynamicCast, 0x6da530 path-B) STAY TYPED-HOST; these laws make the
   walk DECISION CF pure + in-module. PE-truth: disasm-805527.txt
   (0x00805527..0x008055a7); census update-v95-r41-entity-walk/NOTES.md.
   Laws wrap the room family's proven transcriptions by reference
   (isaac_room_b18_*, room package ABI v29) — tailmid precedent. */

/* Empty-list pure-complete gate: PE 0x805532 cmp dword [edi+0x1264],esi
   (esi=0) / 0x805538 jbe -> flag clear with ZERO host calls. FULL-DWORD
   ==0 (0x100 is NOT empty). */
int32_t isaac_game_update_slice_b18_list_empty(uint32_t count_1264);

/* Loop continue: PE 0x805597 inc esi / 0x805598 cmp esi,[edi+0x1264] /
   0x80559e jb. (index+1) < count UNSIGNED — the bound is RE-READ from
   memory EVERY iteration (never folded once); 0xffffffff keeps looping. */
int32_t isaac_game_update_slice_b18_list_continue(uint32_t index,
                                                  uint32_t count_1264);

/* Per-entity decision (PE 0x80554c cmp edx,5 / jne): FULL-DWORD type==5
   (0x105 is NOT type 5). */
int32_t isaac_game_update_slice_b18_entity_is_type5(int32_t entity_type_28);

/* PE 0x80555d cmp dword [eax+0x26614],2 / jl (SIGNED mode>=2) + 0x805566
   cmp edx,1 / je (FULL-DWORD type==1). */
int32_t isaac_game_update_slice_b18_entity_type1_mode_gate(
    int32_t timed_transition_cleanup_mode, int32_t entity_type_28);

/* PE 0x80556b lea eax,[edx-0xa] / 0x80556e cmp eax,0x3dd / 0x805573 ja:
   (type-10)u32 < 0x3de UNSIGNED — types [10, 999] inclusive; 0x80000000
   is NOT in range. */
int32_t isaac_game_update_slice_b18_entity_type_in_range(
    int32_t entity_type_28);

/* type1_mode_gate || type_in_range (PE order). */
int32_t isaac_game_update_slice_b18_entity_path_b_candidate(
    int32_t timed_transition_cleanup_mode, int32_t entity_type_28);

/* SKIP(0) / TYPE5(1) / RTTI_CANDIDATE(2) — PE 0x80554c..0x805573. */
int32_t isaac_game_update_slice_b18_entity_action(
    int32_t timed_transition_cleanup_mode, int32_t entity_type_28);

/* PE 0x80558c test eax,eax / 0x80558e je skip: FULL-DWORD cast != 0. */
int32_t isaac_game_update_slice_b18_path_b_needs_host(uint32_t rtti_cast_result);

/* RTTI arg constants (PE 0x805575..0x805584: push 0; push 0xc5d6ac; push
   0xc5d5dc; push 0; push ecx; call 0xaf08b1; add esp,0x14). */
uint32_t isaac_game_update_slice_b18_rtti_src_ptr(void);
uint32_t isaac_game_update_slice_b18_rtti_dst_ptr(void);

/* Composed walk frame: RE-DERIVES the count/bound per iteration
   (list_continue) + applies the per-entity decision (entity_action) over
   the frozen types/casts, folding cast results into path-B calls
   (path_b_needs_host). types/casts arrays have max_entities entries;
   count > max_entities clamps walked to the cap (host must not set ready
   then). pure_complete=1 when count==0 under an open gate. */
void isaac_game_update_slice_b18_walk_frame(
    uint32_t count, int32_t timed_transition_cleanup_mode,
    const uint32_t* entity_types, const uint32_t* cast_results,
    uint32_t max_entities, IsaacGameUpdateSliceB18WalkPlan* out);

#ifdef __cplusplus
}
#endif
