#include "game_update_slice.h"
#include "frame_effect_pure_helpers.h"
#include "frame_opaque_pure_helpers.h"
#include "hud_post_update_pure_helpers.h"
#include "player_manager_update_pure_helpers.h"
/* ABI v128: u32 f32-bits lane -> float (bit-copy, host byte order). */
static inline float isaac_sfx_upd_f32_from_bits(uint32_t bits) {
  float f;
  __builtin_memcpy(&f, &bits, sizeof(f));
  return f;
}
#include "sfx_pure_helpers.h"
#include "playerhud_post_update_pure_helpers.h"
#include "room_pure_helpers.h"
#include "room_transition_engine_pure_helpers.h"
/* ABI v56 rank-display body captures. */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, rank_display_switch) == 1980,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, rank_display_byte_22d) == 1984,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, rank_display_dword_158) == 1988,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, rank_display_byte_168) == 1992,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, rank_display_dword_248) == 1996,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, rank_display_byte_119) == 2000,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, rank_display_ptr_44) == 2004,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, rank_display_byte_54) == 2008,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, rank_display_byte_39c) == 2012,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, rank_display_byte_39d) == 2016,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, rank_display_byte_3b0) == 2020,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, rank_display_disp_word_0) == 2024,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, rank_display_disp_word_1) == 2028,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, rank_display_disp_word_2) == 2032,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, rank_display_disp_word_3) == 2036,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, rank_display_disp_eos) == 2040,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, rank_display_is_playing_al) == 2044,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, rank_display_st_upd) == 2048,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, rank_display_st_after_loading) == 2052,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, rank_display_st_after_idle) == 2056,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, rank_display_st_after_display) == 2060,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, lua_frame_unref_ready) == 2064,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, lua_frame_unref_flag_byte) == 2068,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, state24ecc_22ed0_ready) == 2072,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, state24ecc_22ed0) == 2076,
              "runtime input ABI changed");
/* ABI v60: SFX stop gate captures (VA 0x0092e230, callsite 0x009bb7a2). */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, sfx_stop_ready) == 2080,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, sfx_stop_span) == 2084,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, sfx_stop_voices_190) == 2088,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, sfx_stop_enabled_198) == 2092,
              "runtime input ABI changed");
/* ABI v64 FX-lerp lane read-only vectors. */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, fx_step_676d0) == 2096,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, fx_step_676e4) == 2116,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, fx_goal_676e8) == 2120,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, fx_goal_676fc) == 2140,
              "runtime input ABI changed");
/* ABI v65: 0x00746560 notify post-state confirmation. */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, host_fun_746560_post_ready) == 2144,
              "runtime input ABI changed");
/* Runtime-ABI head pins (added at ABI 88): the first 9 fields of
   IsaacGameUpdateSliceRuntimeInputs must stay at these offsets — the JS
   RUNTIME_INPUTS_LAYOUT mirrors them, and a prior silent reorder
   (pad-era head filled in a different order on the JS side) swapped
   menu_guard/enable/range until the frame-path differential caught it. */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, monotonic_counter_low) == 0,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, monotonic_counter_high) == 4,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, monotonic_baseline_low) == 8,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, monotonic_baseline_high) == 12,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, global_clear_skip_997a) == 16,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, global_menu_enable_2a3a5) == 20,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, global_menu_guard_4b3ca) == 24,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, global_range_byte_length) == 28,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, challenge_0x123) == 32,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4212c0_slot_char) == 36,
              "runtime input ABI changed");
/* ABI v66: FUN_0098dba0 timer-block entry gate capture (PE 0x0098de4a read of
   Game+0x264e8, tested by the signed `jle` at 0x0098de52). */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_98dba0_timer_ready) == 2148,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_98dba0_timer_264e8) == 2152,
              "runtime input ABI changed");
/* ABI v69: PM0/PM1 death-walk wire packs (PlayerManager::Update 0x009bb5d0). */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, pm_death_player_count) == 2156,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, pm_death_blob_ready) == 2160,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, pm_death_anim_7c) == 2164,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, pm_death_twin_anim_7c) == 2196,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, pm_death_dead_173) == 2228,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, pm_death_anim_8c) == 2260,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, pm_death_twin_null) == 2292,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, pm_death_twin_anim_8c) == 2324,
              "runtime input ABI changed");
/* ABI v70: FUN_0098dba0 timer-interior wire inputs. */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_98dba0_timer_pure_ready) == 2356,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_98dba0_timer_sample) == 2360,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_98dba0_timer_use_crt_rand) == 2364,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_98dba0_timer_x264ec_bits) == 2368,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_98dba0_timer_y264f0_bits) == 2372,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_98dba0_timer_cos_bits_lo) == 2376,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_98dba0_timer_sin_bits_lo) == 2384,
              "runtime input ABI changed");
/* ABI v71 FUN_004257b0 blob. Scalars first, then the index-aligned sample
   packs; every offset is pinned so a reordered field is a build error. */
static_assert(ISAAC_FRAME_OPAQUE_4257B0_MAX_PLAYERS == 8, "4257b0 player cap changed");
static_assert(ISAAC_FRAME_OPAQUE_4257B0_MAX_ELEMS == 16, "4257b0 elem cap changed");
static_assert(ISAAC_FRAME_OPAQUE_4257B0_MAX_LIST == 16, "4257b0 list cap changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4257b0_blob_ready) == 2392,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4257b0_list_begin) == 2396,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4257b0_list_end) == 2400,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4257b0_list_cap) == 2404,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4257b0_post_list_begin) == 2408,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4257b0_post_list_end) == 2412,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4257b0_idvec_begin) == 2416,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4257b0_idvec_end) == 2420,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4257b0_ctr_begin) == 2424,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4257b0_ctr_end) == 2428,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4257b0_initial_byte13) == 2432,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4257b0_p_ptrs) == 2436,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4257b0_p_ids_1618) == 2468,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4257b0_p_161cs) == 2500,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4257b0_q_ptrs) == 2532,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4257b0_q_161cs) == 2564,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4257b0_q_ids_1618) == 2596,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4257b0_qq_ptrs) == 2628,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4257b0_qq_161cs) == 2660,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4257b0_p_chars_13c0) == 2692,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4257b0_elem_ids) == 2724,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4257b0_elem_sub_ptrs) == 2788,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4257b0_elem_sub_los) == 2852,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4257b0_elem_sub_his) == 2916,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4257b0_list_lo) == 2980,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4257b0_list_hi) == 3044,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4257b0_list_slot8) == 3108,
              "runtime input ABI changed");
/* ABI v72 FrameEffect_6fd7c0 shell (record 21) no-op gate. */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_effect_shell_ready) == 3172,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_effect_shell_room_18304) == 3176,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_effect_shell_room_182d0) == 3180,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_effect_shell_room_byte1) == 3184,
              "runtime input ABI changed");
/* ABI v74 FUN_00705ee0 entry-guard gate. The 0x68d70 guard is pinned last on
   purpose: that offset is exactly ISAAC_GAME_UPDATE_GAME_OBJECT_MIN_SIZE, so
   the byte lives one past the captured Game buffer and CANNOT become sparse
   state — this assert is what keeps a later refactor from "tidying" it there. */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_effect_rewind_ready) == 3188,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_effect_rewind_guard_269ea) == 3192,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_effect_rewind_guard_269eb) == 3196,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_effect_rewind_guard_68d70) == 3200,
              "runtime input ABI changed");
/* ABI v96 (record idx 12 opaqueCall006fd7c0) LIVE seam capture lanes,
   APPENDED at the runtime-inputs tail (after the b18 pack, which ends at
   11592). Finals fixed by the coordinator merge at 11592..13736; the
   ABI-96 tail (record-4/10/9/22) continues after 13736. All lanes u32/i32. */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, rewind_705ee0_slot_index_676ac) == 11592,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, rewind_705ee0_slot_valid_byte) == 11596,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, rewind_705ee0_slot_room_19d20) == 11600,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, rewind_705ee0_slot_tag_e8) == 11604,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, rewind_705ee0_slot_arg_1fe2c) == 11608,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, rewind_705ee0_slot_frame_1fe30) == 11612,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, rewind_705ee0_game_base) == 11616,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, rewind_705ee0_game_tag_0) == 11620,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, rewind_705ee0_game_frame_264f8) == 11624,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, rewind_705ee0_game_18318) == 11628,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, rewind_705ee0_payload_blob_ready) == 11632,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, rewind_705ee0_payload_blob_addr) == 11636,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, rewind_705ee0_payload_blob) == 11640,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, opaque_call_006fd7c0_ready) == 13732,
              "runtime input ABI changed");
/* ABI v96 coordinator-merged tail: record-4 SFX-manager store-plan
   capture + per-player entry pack (13736..14152). */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, opaque_8318a0_sfx_global_798e4) == 13736,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, opaque_8318a0_sfx_global_79948) == 13740,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, opaque_8318a0_sfx_global_79790) == 13744,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, opaque_8318a0_sfx_global_7978c) == 13748,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, opaque_8318a0_engine_field_28) == 13752,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, opaque_8318a0_engine_byte_7c) == 13756,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, opaque_8318a0_player_entry_ready) == 13760,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, opaque_8318a0_player_entry_count) == 13764,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, opaque_8318a0_player_entry_b173) == 13768,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, opaque_8318a0_player_entry_b1398) == 13800,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, opaque_8318a0_player_entry_b139a) == 13832,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, opaque_8318a0_player_entry_b171) == 13864,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, opaque_8318a0_player_entry_w410) == 13896,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, opaque_8318a0_player_entry_w3fc) == 13928,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, opaque_8318a0_player_entry_ptr7c) == 13960,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, opaque_8318a0_player_entry_b34) == 13992,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, opaque_8318a0_player_entry_b88) == 14024,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, opaque_8318a0_player_entry_w1600) == 14056,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, opaque_8318a0_player_entry_w418) == 14088,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, opaque_8318a0_player_entry_w16c) == 14120,
              "runtime input ABI changed");
/* ABI v96 coordinator-merged tail: record-10 true-probe SFX-manager blob
   (14152..14200). */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4212c0_true_probe_ready) == 14152,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4212c0_true_probe_mgr_base) == 14156,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4212c0_true_probe_mgr_f18) == 14160,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4212c0_true_probe_mgr_ebc) == 14164,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4212c0_true_probe_mgr_14) == 14168,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4212c0_true_probe_mgr_21618) == 14172,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4212c0_true_probe_mgr_21620) == 14176,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4212c0_true_probe_mgr_21624) == 14180,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4212c0_true_probe_mgr_2161c) == 14184,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4212c0_true_probe_mgr_29fb8) == 14188,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4212c0_true_probe_volume_bits) == 14192,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4212c0_true_probe_volume_eq_one) == 14196,
              "runtime input ABI changed");
/* ABI v96 coordinator-merged tail: record-9 TAIL-A slot pair + optional
   seed (14200..14212). */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, state24ecc8ef990TailaSlotBegin) == 14200,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, state24ecc8ef990TailaSlotEnd) == 14204,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, state24ecc8ef990TailaSfxSeed) == 14208,
              "runtime input ABI changed");
/* ABI v96 coordinator-merged tail: record-22 ANM2::Load pre-lane host
   half captures (14212..14276; flags are 32 inline BYTES). */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, engine_anm2_filename_ready) == 14212,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, engine_anm2_filename_ptr) == 14216,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, engine_anm2_filename_size) == 14220,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, engine_anm2_filename_cap) == 14224,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, engine_anm2_anim_first_pre) == 14228,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, engine_anm2_anim_second_pre) == 14232,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, engine_anm2_anim_ready) == 14236,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, engine_anm2_loadgraphics_flag_ready) == 14240,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, engine_anm2_loadgraphics_flags) == 14244,
              "runtime input ABI changed");
/* ABI v102 (record idx 0 walker live wiring; PLAN update-v102-abi97-plan,
   wave-26 merge reconciles): the 0x84cc40 walker's committed capture
   lanes (14276..14292). */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, hud_stat_walker_player_a) == 14276,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, hud_stat_walker_player_b) == 14280,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, hud_stat_walker_b_frame328) == 14284,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, hud_stat_walk_probe1_arg) == 14288,
              "runtime input ABI changed");
/* ABI v104 (record idx 12 transition-pack wiring; PLAN update-v102-record12-
   tran §5, wave-27 merge reconciles): the 9-lane pack (14292..14328). */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, transition_6fd7c0_game0) == 14292,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, transition_6fd7c0_alt_path_probe) == 14296,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, transition_6fd7c0_route_probe) == 14300,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, transition_6fd7c0_player_loop_probe) == 14304,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, transition_6fd7c0_room_type_8) == 14308,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, transition_6fd7c0_room_subroom_flag_44) == 14312,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, transition_6fd7c0_blue_room_probe) == 14316,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, transition_6fd7c0_engine_pred_probe) == 14320,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, transition_6fd7c0_ready) == 14324,
              "runtime input ABI changed");
/* ABI v99 (wave-28 entity-surface REBIND, idx 5/32): ready voucher +
   8x44 B capture blobs @14328..14684 (slot field bases sampled; the full
   struct stride is enforced by sizeof == 14684 below). */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_98dba0_entity_surface_ready) == 14328,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_98dba0_entity_surface_capture) == 14332,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_98dba0_entity_surface_capture[7]) == 14640,
              "runtime input ABI changed");
static_assert(sizeof(IsaacGameUpdateSliceRuntimeInputs) == 23696, "runtime input ABI changed");
/* ABI v75 record-22 engine-prefix latch gate. */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, engine_anm2_latch_ready) == 3204,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, engine_anm2_latch) == 3208,
              "runtime input ABI changed");
/* ABI v76: FUN_0098dba0 timer-interior MT19937 wire. */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_98dba0_timer_mt_ready) == 3212,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_98dba0_timer_mt_in) == 3216,
              "runtime input ABI changed");
/* ABI v77: record 22 ANM2::Load lane blob. */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, engine_anm2_blob_ready) == 3220,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, engine_anm2_layer_count) == 3224,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, engine_anm2_extra_count) == 3228,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, engine_anm2_bitflags_110_pre) == 3232,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, engine_anm2_layer_names) == 3236,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, engine_anm2_extra_names) == 3492,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, global_tree_4aba0_blob_ready) == 3748,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, global_tree_4aba0_count) == 3752,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, global_tree_4aba0_begin) == 3756,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, global_tree_4aba0_end) == 3760,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, global_tree_4aba0_nodes) == 3764,
              "runtime input ABI changed");
static_assert(sizeof(IsaacGlobalTree4aba0Node) == 24, "runtime input ABI changed");
static_assert(sizeof(IsaacGameUpdateSliceRuntimeInputs) == 23696, "runtime input ABI changed");
/* ABI v56 rank-display state writes. */
static_assert(offsetof(IsaacGameUpdateSliceState, rank_display_switch_after) == 456,
              "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, rank_display_state_after) == 460,
              "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, rank_display_clear_3b0_out) == 464,
              "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, rank_display_tail_out) == 468,
              "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, item_overlay_counter_11d1d0) == 472,
              "state ABI changed");
static_assert(sizeof(IsaacGameUpdateSliceState) == 524, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, transition_tail_byte_29fb8) == 476,
              "state ABI changed");
/* ABI v64 FX-lerp gate lane state fields. */
static_assert(offsetof(IsaacGameUpdateSliceState, fx_lerp_gate_676b4) == 480,
              "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, fx_cur_676b8) == 484,
              "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, fx_cur_676bc) == 488,
              "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, fx_cur_676c0) == 492,
              "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, fx_cur_676c4) == 496,
              "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, fx_cur_676c8) == 500,
              "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, fx_cur_676cc) == 504,
              "state ABI changed");
/* ABI v77: record 22 ANM2::Load lane posts. */
static_assert(offsetof(IsaacGameUpdateSliceState, engine_anm2_loaded) == 508,
              "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, engine_anm2_slot_10c) == 512,
              "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, engine_anm2_bitflags_110) == 516,
              "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, global_tree_4aba0_result) == 520,
              "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, hud_history_latch_5c7c) == 521,
              "state ABI changed");
static_assert(sizeof(IsaacGameUpdateSliceState) == 524, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, hud_history_slot_flag0) == 4532,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, hud_history_slot_flag1) == 4533,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, hud_stat_countdown_ready) == 4536,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, hud_stat_player_list_begin) == 4540,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, hud_stat_player_list_end) == 4544,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, hud_stat_countdown) == 4548,
              "runtime ABI changed");
/* ABI v84: record-0 StatHUD tail walk-arm lane blob (PE 0x84c170..0x84c2b9).
   Scalars first, then the per-player packs; every offset is pinned so a
   reordered field is a build error. */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, hud_stat_walk_blob_ready) == 4628,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, hud_stat_owner_byte) == 4632,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, hud_stat_container_begin) == 4636,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, hud_stat_container_end) == 4640,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, hud_stat_walk_probe1) == 4644,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, hud_stat_walk_probe2) == 4648,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, hud_stat_walk_probe3) == 4652,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, hud_stat_game_1adb4) == 4656,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, hud_stat_slot_ptr_0) == 4660,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, hud_stat_slot_ptr_1) == 4664,
              "runtime ABI changed");
/* 20 tween k-slot states: one 16-byte IsaacGameUpdateSliceHudStatSlotState
   per (row g, k-slot k) — current@+0, prev@+4, threshold@+8, timer@+12
   (offset 4668 + (g*10+k)*16 + f*4). */
static_assert(sizeof(IsaacGameUpdateSliceHudStatSlotState) == 16, "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceHudStatSlotState, current) == 0,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceHudStatSlotState, prev) == 4,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceHudStatSlotState, threshold) == 8,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceHudStatSlotState, timer) == 12,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, hud_stat_slots) == 4668,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, hud_stat_slots[0][1]) == 4684,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, hud_stat_slots[0][1].timer) == 4696,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, hud_stat_slots[1][9].timer) == 4984,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, hud_stat_players[0]) == 4988,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, hud_stat_players[1]) == 5052,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, hud_stat_players[2]) == 5116,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, hud_stat_players[3]) == 5180,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, hud_stat_players[4]) == 5244,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, hud_stat_players[5]) == 5308,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, hud_stat_players[6]) == 5372,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, hud_stat_players[7]) == 5436,
              "runtime ABI changed");
static_assert(sizeof(IsaacGameUpdateSliceHudStatPlayerPack) == 64, "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceHudStatPlayerPack, ptr) == 0,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceHudStatPlayerPack, predA) == 4,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceHudStatPlayerPack, f2c) == 8,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceHudStatPlayerPack, f3bc) == 12,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceHudStatPlayerPack, f13c0) == 16,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceHudStatPlayerPack, f172) == 20,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceHudStatPlayerPack, otherPtr) == 24,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceHudStatPlayerPack, other161c) == 28,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceHudStatPlayerPack, f161c) == 32,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceHudStatPlayerPack, f328) == 36,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceHudStatPlayerPack, f1568) == 40,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceHudStatPlayerPack, f1460) == 44,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceHudStatPlayerPack, f1470) == 48,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceHudStatPlayerPack, f1480) == 52,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceHudStatPlayerPack, f1464) == 56,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceHudStatPlayerPack, f156c) == 60,
              "runtime ABI changed");
static_assert(sizeof(IsaacGameUpdateSliceRuntimeInputs) == 23696, "runtime ABI changed");
/* ABI v85: VA 0x0092e300 StopAll voice blob (runtime 5500 -> 6696). */
static_assert(ISAAC_OPAQUE_0092E300_MAX_VOICES == 32, "0092e300 voice cap changed");
static_assert(sizeof(IsaacGameUpdateSliceOpaque0092e300VoicePack) == 36,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceOpaque0092e300VoicePack, channel_null) == 0,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceOpaque0092e300VoicePack, pending_09) == 4,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceOpaque0092e300VoicePack, probe_first) == 8,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceOpaque0092e300VoicePack, probe_second) == 12,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceOpaque0092e300VoicePack, channel_null_third) == 16,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceOpaque0092e300VoicePack, loop_08) == 20,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceOpaque0092e300VoicePack, query_44) == 24,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceOpaque0092e300VoicePack, channel_null_fourth) == 28,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceOpaque0092e300VoicePack, voices_reloaded) == 32,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, opaque_0092e300_voice_blob_ready) == 5500,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, opaque_0092e300_voice_count) == 5504,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, opaque_0092e300_first_voice) == 5508,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, opaque_0092e300_voices) == 5540,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, opaque_0092e300_pad_6692) == 6692,
              "runtime ABI changed");
/* ABI v86: VA 0x0092f1c0 HUD-v5 try_pure blob. */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, opaque_0092f1c0_ready) == 6696,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, opaque_0092f1c0_mode) == 6700,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, opaque_0092f1c0_counter) == 6704,
              "runtime ABI changed");
/* ABI v87: VA 0x008318a0 HUD-v5 try_pure blob. */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, opaque_008318a0_ready) == 6708,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, opaque_008318a0_mode) == 6712,
              "runtime ABI changed");
/* ABI v88: 0x0092e300 sound-group walk ready (extends v50/v85 packs). */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, sound_group_walk_ready) == 6716,
              "runtime ABI changed");
/* ABI v90: 4212c0 flag_111 pair B-sub gate (Game+0x1d348 / Game+0x1d358)
   + pair-ready gate (ready=0 keeps the pre-v90 always-host residual).
   ABI v91: 4212c0 secondary==3 false-probe blob (0x40add0 probe: empty
   list or host-resolved bit-clear -> pure clear, no host). */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4212c0_pair_ready) == 6720,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4212c0_field_5c) == 6724,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4212c0_flag_6c) == 6728,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4212c0_probe_ready) == 6732,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4212c0_probe_resolved) == 6736,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4212c0_add0_field_4) == 6740,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4212c0_add0_list_count) == 6744,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4212c0_add0_match_index) == 6748,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4212c0_add0_bitfield_18) == 6752,
              "runtime ABI changed");
/* ABI v92: FUN_0098dba0 player-vector span capture (Game+0x1baa8/+0x1baac). */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_98dba0_walk_ready) == 6756,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_98dba0_walk_begin) == 6760,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_98dba0_walk_end) == 6764,
              "runtime ABI changed");
/* ABI v93: record idx 9 iterate-arm JOIN blob capture. */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, state24ecc_8ef990_join_ready) == 6768,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, state24ecc_8ef990_join_probe) == 6772,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, state24ecc_8ef990_join_idx8) == 6776,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, state24ecc_8ef990_956780_game) == 6780,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, state24ecc_8ef990_956780_node_bd) == 6784,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, state24ecc_8ef990_956780_node_f10) == 6788,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, state24ecc_8ef990_956780_node_ptr) == 6792,
              "runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, state24ecc_8ef990_956780_sentinel) == 6796,
              "runtime ABI changed");
/* ABI v95 (record idx 23): clear-path game-mode sample at the struct tail
   (after the v95 956110 / 92f1c0 / sfx_stop_fold / 4212c0-ab / b15-rain
   capture blocks). */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, clear_path_game_mode_0) == 7888,
              "runtime ABI changed");
static_assert(sizeof(IsaacGameUpdateSliceRuntimeInputs) == 23696, "runtime ABI changed");
static_assert(sizeof(IsaacGameUpdateSliceSoundGroupWalkPlan) == 40,
              "sound-group walk plan ABI changed");
/* ABI v95 (record idx 32): FUN_00956110 arg-prep + result plan carriers. */
static_assert(sizeof(IsaacGameUpdateSlice956110ArgPrep) == 48,
              "956110 arg-prep ABI changed");
static_assert(offsetof(IsaacGameUpdateSlice956110ArgPrep, net_arg2_imm) == 4,
              "956110 arg-prep net_arg2_imm");
static_assert(offsetof(IsaacGameUpdateSlice956110ArgPrep, walk_vtbl_off) == 16,
              "956110 arg-prep walk_vtbl_off");
static_assert(offsetof(IsaacGameUpdateSlice956110ArgPrep, general_callback_va) == 32,
              "956110 arg-prep general_callback_va");
static_assert(sizeof(IsaacGameUpdateSlice956110Result) == 28,
              "956110 result ABI changed");
static_assert(offsetof(IsaacGameUpdateSlice956110Result, value) == 0,
              "956110 result value");
static_assert(offsetof(IsaacGameUpdateSlice956110Result, path) == 4,
              "956110 result path");
static_assert(offsetof(IsaacGameUpdateSlice956110Result, pure) == 8,
              "956110 result pure");
static_assert(offsetof(IsaacGameUpdateSlice956110Result, pure_cf_ok) == 24,
              "956110 result pure_cf_ok");
/* ABI v95 (record idx 5/32): entity-surface capture contract structs. */
static_assert(sizeof(IsaacGameUpdateSliceEntitySurfaceCapture) == 44,
              "entity-surface capture ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEntitySurfaceCapture, vtable_class_bits) == 0,
              "entity-surface capture class bits");
static_assert(offsetof(IsaacGameUpdateSliceEntitySurfaceCapture, impl_ptr) == 4,
              "entity-surface capture impl ptr");
static_assert(offsetof(IsaacGameUpdateSliceEntitySurfaceCapture, impl_20_10) == 24,
              "entity-surface capture layer tag");
static_assert(offsetof(IsaacGameUpdateSliceEntitySurfaceCapture, global_c5ac00) == 40,
              "entity-surface capture sentinel global");
static_assert(sizeof(IsaacGameUpdateSliceEntitySurfacePlan) == 20,
              "entity-surface plan ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEntitySurfacePlan, accept) == 0,
              "entity-surface plan accept");
static_assert(offsetof(IsaacGameUpdateSliceEntitySurfacePlan, host_verify) == 16,
              "entity-surface plan host_verify");
static_assert(sizeof(IsaacGameUpdateSliceEntitySurfaceWalkStep) == 12,
              "entity-surface walk step ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEntitySurfaceWalkStep, bl_after1) == 0,
              "entity-surface walk step bl");
static_assert(offsetof(IsaacGameUpdateSliceEntitySurfaceWalkStep, rtti_enter) == 8,
              "entity-surface walk step rtti_enter");
static_assert(ISAAC_GAME_UPDATE_ENTITY_SURFACE_MAX_CAPTURES == 8,
              "entity-surface capture cap changed");
static_assert(ISAAC_SOUND_GROUP_WALK_PLAN_WORDS == 10, "sound-group walk plan words changed");
static_assert(ISAAC_HUD_STAT_COUNTDOWN_COUNT == 20, "countdown lane ABI changed");
static_assert(ISAAC_HUD_STAT_WALK_MAX_PLAYERS == 8, "walk lane ABI changed");
static_assert(ISAAC_HUD_STAT_WALK_SLOT_COUNT == 20, "walk lane ABI changed");
static_assert(ISAAC_HUD_STAT_WALK_SCRATCH_WORDS == 83, "walk lane ABI changed");
/* ABI v56 rank-display events. */
static_assert(offsetof(IsaacGameUpdateSliceEvents, rank_display_calls) == 376,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, rank_display_state_upd) == 380,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, rank_display_play_mask) == 384,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, rank_display_is_playing) == 388,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_call_009a2b30) == 392,
              "event ABI changed");
/* ABI v65: typed VA 0x00746560 notify carrier. */
static_assert(offsetof(IsaacGameUpdateSliceEvents, host_fun_746560_site) == 396,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, host_fun_746560_param) == 400,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, host_fun_746560_byte_216e9) == 404,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, host_fun_746560_deathmatch_suffix) == 408,
              "event ABI changed");
/* ABI v70: FUN_0098dba0 timer-interior float-store plan carriers. */
static_assert(offsetof(IsaacGameUpdateSliceEvents, frame_opaque_98dba0_timer_plan_applied) == 412,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, frame_opaque_98dba0_timer_mt_advanced) == 416,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, frame_opaque_98dba0_timer_after) == 420,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, frame_opaque_98dba0_timer_theta_bits) == 424,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, frame_opaque_98dba0_timer_x_bits) == 428,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, frame_opaque_98dba0_timer_y_bits) == 432,
              "event ABI changed");
/* ABI v76: in-module draw post-state index. */
static_assert(offsetof(IsaacGameUpdateSliceEvents, frame_opaque_98dba0_timer_mt_index_out) == 464,
              "event ABI changed");
/* ABI v77: record 22 lane accounting. */
static_assert(offsetof(IsaacGameUpdateSliceEvents, engine_anm2_lane_applied) == 468,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, engine_anm2_star_layer_mask) == 472,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, hud_history_loop_residual) == 476,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_0092f1c0_counter_out) == 480,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_0092e300_slot_3c) == 484,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, sound_group_walk_stores) == 488,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, sound_group_walk_pending_mask) == 492,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, sound_group_walk_applied) == 496,
              "event ABI changed");
/* ABI v92: FUN_0098dba0 empty-vector walk pure-skip proof event. */
static_assert(offsetof(IsaacGameUpdateSliceEvents, frame_opaque_98dba0_walk_empty_skip) == 500,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, state24ecc_8ef990_join_pure) == 504,
              "event ABI changed");
/* ABI v94 (R3 log-split, record idx 10): FUN_0040add0 fatal-log typed event. */
static_assert(offsetof(IsaacGameUpdateSliceEvents, frame_opaque_4212c0_add0_log_needed) == 508,
              "event ABI changed");
/* ABI v95 (record idx 48 0x008607a0 set-arm arg-prep): the six typed-event
   arg-prep words land at 512..532; pcallk stays typed-host (mod bytecode). */
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_call_008607a0_args_registry_index) == 512,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_call_008607a0_args_nargs) == 516,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_call_008607a0_args_nresults) == 520,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_call_008607a0_args_pcallk_context) == 524,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_call_008607a0_args_arg1) == 528,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_call_008607a0_args_arg2) == 532,
              "event ABI changed");
/* NOTE: the sizeof(IsaacGameUpdateSliceEvents) pin is COORDINATOR-MERGED at
   wave end (R48's ==536 removed per coordinator freeze; peers land events
   fields concurrently). The R48 slice owns offsets 512..532 above. */

/* Wave-21 coordinator merge pins: record-12's rewind seam @912/916 (landed
   into the struct this wave) + the record-0 probe events @920/924/928
   (committed by this merge) + the whole-struct size 932. */
static_assert(offsetof(IsaacGameUpdateSliceEvents, rewind_705ee0_stores) == 912,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, rewind_705ee0_save_state) == 916,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, hud_stat_walk_probe1) == 920,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, hud_stat_walk_probe2) == 924,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, hud_stat_walk_probe3) == 928,
              "event ABI changed");
/* ABI v96 coordinator-merged tail (932..956): record-4 SFX-manager store
   plan + record-10 true-probe interior + record-0 fatal-empty + the
   record-22 ANM2::Load pre-lane host trio (W22-S2 §lane-requests). */
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_008318a0_sfx_manager_stores) == 932,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, frame_opaque_4212c0_true_probe_interior) == 936,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, hud_stat_walk_fatal_empty) == 940,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, engine_anm2_prefix_filename_assign) == 944,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, engine_anm2_prefix_cache_fetch) == 948,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, engine_anm2_prefix_loadimage) == 952,
              "event ABI changed");
/* ABI v102 (record idx 0 walker live wiring; PLAN update-v102-abi97-plan,
   wave-26 merge reconciles): the typed walker probe events (956..968). */
static_assert(offsetof(IsaacGameUpdateSliceEvents, hud_stat_walker_probe1) == 956,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, hud_stat_walker_probe2) == 960,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, hud_stat_walker_probe3) == 964,
              "event ABI changed");
/* ABI v104 (record idx 12 transition-pack wiring; PLAN update-v102-record12-
   tran §5, wave-27 merge reconciles): the 3 typed pack events (968..980). */
static_assert(offsetof(IsaacGameUpdateSliceEvents, frame_effect_6fd7c0_stage_transition) == 968,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, frame_effect_6fd7c0_player_loop) == 972,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, frame_effect_6fd7c0_room_dispatch) == 976,
              "event ABI changed");
/* ABI v107 (wave-29 merge, record idx 39 mid-restock): the typed-event DROP
   proof word (offset 984, next-free after 980; events 984 -> 988). */
static_assert(offsetof(IsaacGameUpdateSliceEvents, mid_restock_seed_zero_drop) == 984,
              "event ABI changed");
/* ABI v127 (update-v127-706c-restock-removal): the shop-restock residual
   event set @1000..1020 (warn/create1/create2/seed_zero_drop/
   copy_back_ready). */
static_assert(offsetof(IsaacGameUpdateSliceEvents, shop_restock_warn) == 1000,
              "event ABI changed");
/* ABI v128 (update-v128-heartbeat-sfxupd-removal): update-lane residual
   events @1020..1056 (PLAN-45 §4). */
static_assert(offsetof(IsaacGameUpdateSliceEvents, sfx_upd_busy_applied) == 1020,
              "event ABI changed");
static_assert(sizeof(IsaacGameUpdateSliceEvents) == 1260, "event ABI changed");

/* ABI v115 (record idx 23 removal): the clear-path flag-store typed
   carrier (offset 988, next-free after 984; events 988 -> 992). */
static_assert(offsetof(IsaacGameUpdateSliceEvents, clear_path_flag_store) == 988,
              "event ABI changed");

/* ABI v119 (update-v119-door-removal): the type-5 forced-rerun typed
   carrier (offset 992, next-free after 988; events 992 -> 996). */
static_assert(offsetof(IsaacGameUpdateSliceEvents, type5_door_forced_rerun) == 992,
              "event ABI changed");

/* ABI v126 (update-v126-7230-spawn-removal): the tailMid7230SpawnArmed
   typed carrier (offset 996, next-free after 992; events 996 -> 1000). */
static_assert(offsetof(IsaacGameUpdateSliceEvents, tail_mid_7230_spawn_armed) == 996,
              "event ABI changed");

static_assert(sizeof(IsaacGameUpdateSliceState) == 524, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, decay_value) == 20, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, transition_mode) == 32, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, post_update_delay) == 36, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, gate_1d520) == 40, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, gate_1ba78) == 64, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, gate_1b83c) == 68, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, counter_265c0) == 76, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, item_overlay_state) == 80, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, transition_aux_bits) == 120, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, timed_transition_progress) == 124, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, timed_transition_cleanup_mode) == 140, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, effect_counter_67788) == 144, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, frame_counter_264f8) == 172, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, fade_counter_26514) == 176, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, list_count_67730) == 200, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, room_fx_counter_70d8) == 204, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, room_fx_step_70f0) == 232, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, room_clear_delay_11ec) == 236, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, room_desc_subtype) == 256, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, room_byte_7220) == 260, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, room_water_lerp_countdown_7298) == 264, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, room_boss_count_12c8) == 268, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, room_boss_count_12cc) == 272, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, room_boss_snapshot_7224) == 276, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, room_timer_722c) == 280, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, room_collectible_timer_7764) == 284, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, room_timer_7214) == 288, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, room_timer_706c) == 292, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, room_timer_7230) == 296, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, room_water_amount_7240) == 300, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, room_lava_intensity_7740) == 304, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, frame_opaque_4212c0_mode) == 308, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, frame_opaque_4212c0_secondary) == 312, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, frame_opaque_4212c0_field_3c) == 316, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, frame_opaque_4212c0_flag_4c) == 320, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, frame_opaque_4212c0_flag_111) == 324, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, room_desc_flags_44) == 328, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, room_desc_clear_count_4a) == 332, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, byte_67744) == 336, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, room_flag_7894) == 340, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, room_flag_7769) == 344, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, engine_field_8) == 348, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, engine_field_c) == 352, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, engine_float_22c) == 356, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, engine_float_230) == 360, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, engine_field_4) == 364, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, engine_field_10) == 368, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, engine_field_14) == 372, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, engine_field_18) == 376, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, engine_field_1c) == 380, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, engine_field_20) == 384, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, engine_field_24) == 388, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, frame_opaque_98dba0_mode) == 392, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, frame_opaque_98dba0_flag) == 396, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, frame_opaque_98dba0_counter) == 400, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, frame_opaque_98dba0_float_170) == 404, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, frame_opaque_98dba0_float_2d0) == 408, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, difficulty_269c8) == 412, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, engine_player_1bb74) == 416, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, room_ambient_count_7454) == 420, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, room_ambient_intensity_7458) == 424, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, room_ambient_flag_745c) == 428, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, mode_26584) == 432, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, flags_2654c) == 436, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, game_flags_1839c) == 440, "state ABI changed");
static_assert(sizeof(IsaacGameUpdateSliceConstants) == 32, "constants ABI changed");
static_assert(sizeof(IsaacGameUpdateDoorSlotRuntime) == 16, "door slot runtime ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, challenge_0x123) == 32, "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4212c0_slot_char) == 36, "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, door_slots) == 40, "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, engine_call_room) == 168, "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, engine_call_dim) == 172, "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, engine_game_18304) == 176, "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_98dba0_bvar2) == 180,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_98dba0_manager_2a35c) == 184,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_98dba0_game_216e9) == 188,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4257b0_id_count) == 192,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, frame_opaque_4257b0_list_count) == 196,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, room_grid_cells) == 200,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, room_b8_blob_ready) == 204,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, engine_player_count) == 208,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, engine_player_blob_ready) == 212,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, player_hud_occupied_mask) == 216,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, manager_history_count) == 220,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, manager_stat_flag) == 224,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, ambient_desc_present) == 228,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, ambient_desc_id) == 232,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, ambient_player_count) == 236,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, ambient_vel_x_7460) == 240,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, ambient_vel_y_7464) == 244,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, ambient_stage) == 248,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, ambient_stage_type) == 252,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, ambient_stage_id) == 256,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, ambient_room_subtype_1bb0) == 260,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, ambient_room_active) == 264,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, ambient_room_entry_11f0) == 268,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, player_hud_blob_ready) == 272,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, player_hud_slots) == 276,
              "runtime input ABI changed");
static_assert(sizeof(IsaacPlayerHudSlotPack) == 52, "PlayerHUD slot pack ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, mid_restock_owner_0x209) == 692,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, pm_intensity_player_count) == 696,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, pm_intensity_sfx_playing) == 700,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, pm_intensity_blob_ready) == 704,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, pm_intensity_raw_1ea8) == 708,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, pm_intensity_flags_168) == 740,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, pm_intensity_dead_173) == 772,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b1_sfx_ready) == 804,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b1_buffer_ready) == 808,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b1_desc_field_40) == 812,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b1_nested_field_10) == 816,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b1_begin_183a4) == 820,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b1_end_183a8) == 824,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, mid_restock_desc_ready) == 828,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, mid_restock_desc_ac) == 832,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, mid_restock_desc_ae) == 836,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, mid_restock_desc_seed58) == 840,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, h5_body_blob_ready) == 844,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, ambient_room_f14) == 848,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, ambient_room_1d18) == 864,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b3b7_sparse_ready) == 868,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b3b7_te_byte_7321) == 872,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b3b7_te_begin) == 876,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b3b7_te_end) == 880,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b3b7_desc_type0) == 884,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b3b7_tree_count_7238) == 888,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b3b7_width_c) == 892,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b3b7_height_10) == 896,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b9b11_inputs_ready) == 900,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b9b11_challenge_result_nonzero) == 904,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b9b11_room_byte_11f4) == 908,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b9b11_room_byte_1d0d) == 912,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b9b11_room_byte_7321) == 916,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b9b11_list_begin_7314) == 920,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b9b11_list_end_7318) == 924,
              "runtime input ABI changed");
/* ABI v49 tail list sweep packs. */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, update_list_blob_ready) == 928,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, update_list_timers) == 932,
              "runtime input ABI changed");
/* ABI v50 Update-local opaque peels. */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, player_flag_410_ready) == 1060,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, player_flag_410_count) == 1064,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, opaque_0092e300_ready) == 1068,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, opaque_0092e300_group_count) == 1072,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, opaque_0092e300_packs_ready) == 1076,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, opaque_0092e300_group_enabled) == 1080,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, opaque_0092e300_group_entry_count) == 1112,
              "runtime input ABI changed");
/* ABI v51 Update-local opaque depth. */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, opaque_857450_ready) == 1144,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, opaque_857450_manager_4abbc) == 1148,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, menu_aux_tree_ready) == 1152,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, menu_aux_tree_root) == 1156,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, menu_aux_tree_node_count) == 1160,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, menu_aux_accounting_lo) == 1164,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, menu_aux_accounting_hi) == 1168,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, menu_aux_tree_left) == 1172,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, menu_aux_tree_payload_size) == 1812,
              "runtime input ABI changed");
/* ABI v52 genrand wire. */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, genrand_mt_ready) == 1940,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, genrand_index_in) == 1944,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, genrand_mode_flag) == 1948,
              "runtime input ABI changed");
/* ABI v53 F4 recaptured Pass B gate. */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs,
                       frame_opaque_4257b0_post_pass_a_list_count) == 1952,
              "runtime input ABI changed");
/* ABI v54 menu-aux sentinel capture. */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, menu_aux_sentinel_ready) == 1956,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, menu_aux_sentinel_addr) == 1960,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, menu_aux_menu_addr) == 1964,
              "runtime input ABI changed");
/* ABI v55 HUD_Message::text_out string protocol. */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, hud_message_text_ptr_54) == 1968,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, hud_message_text_words_0) == 1972,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, hud_message_text_words_1) == 1976,
              "runtime input ABI changed");
/* Whole-struct size re-pinned at ABI v87 (8318a0 try_pure blob);
   extended at ABI v92 (98dba0 walk span capture). */
static_assert(sizeof(IsaacGameUpdateSliceRuntimeInputs) == 23696, "runtime input ABI changed");
static_assert((int)ISAAC_GENRAND_STATE_WORDS == (int)ISAAC_ROOM_GENRAND_N,
              "genrand state length must mirror the Room recovery");
static_assert(ISAAC_GENRAND_MAX_SAMPLES == 448, "genrand sample cap changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, ambient_824a70_genrand_samples) == 372,
              "event ABI changed");
static_assert(ISAAC_UPDATE_LIST_MAX_NODES == 32, "list sweep cap changed");
static_assert(ISAAC_OPAQUE_0092E300_MAX_GROUPS == 8, "0092e300 group cap changed");
static_assert(ISAAC_MENU_AUX_TREE_MAX_NODES == 32, "menu aux tree cap changed");
static_assert(ISAAC_MENU_AUX_TREE_NODE_SIZE == 0x2c, "menu aux node size changed");
static_assert(ISAAC_MENU_AUX_SENTINEL_OUT_WORDS == 5, "menu aux sentinel out words changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, menu_aux_node_free) == 364,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, menu_aux_payload_free) == 368,
              "event ABI changed");
/* Whole-struct size pin is COORDINATOR-MERGED at wave end (R48's ==536
   removed per coordinator freeze; the R48 slice owns offsets 512..532 —
   see the offsetof asserts above). */
/* ABI v71 FUN_004257b0 pure accounting. */
static_assert(offsetof(IsaacGameUpdateSliceEvents, frame_opaque_4257b0_pass_a_applied) == 436,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, frame_opaque_4257b0_pass_b_applied) == 440,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, frame_opaque_4257b0_id_count) == 444,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, frame_opaque_4257b0_inserted) == 448,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, frame_opaque_4257b0_post_count) == 452,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, frame_opaque_4257b0_pass_b_stores) == 456,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, frame_opaque_4257b0_list_grow) == 460,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, ambient_824a70_loop_count) == 348,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_room_update_ambient_824a70_genrand) == 352,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_room_update_ambient_824a70_create) == 356,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, list_update_6772c_free) == 360,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceState, room_desc_short_ae) == 444, "state ABI changed");
static_assert(sizeof(IsaacGameUpdateSliceState) == 524, "state ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, player_hud_update_hearts) == 308,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, hud_stat_residual) == 324,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, player_manager_update_heartbeat_sfx_update) == 328,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, player_manager_update_heartbeat_sfx_play) == 332,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, player_manager_update_heartbeat_sfx_stop) == 336,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_room_update_prefix_b1_sfx) == 340,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_room_update_prefix_b1_spawn) == 344,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_call_0098dba0_player_walk) == 64,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_call_006fd7c0_mode4_sfx) == 108,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_frame_effect_6fd7c0_shell) == 112,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_room_transition_engine_prefix) == 116,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_room_transition_engine_body) == 120,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, room_transition_index) == 124, "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, room_transition_dimension) == 128,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, engine_site_anim) == 132, "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_room_update_prefix_b1) == 136, "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_room_update_prefix_b2) == 140, "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_room_update_prefix_b3_b7) == 144, "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_room_update_prefix_b8) == 148, "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_room_update_prefix_b9_b11) == 152, "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, room_trigger_output) == 156, "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_room_update_clear_path) == 160, "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_room_update_clear_door_slots) == 164, "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, room_trigger_clear_stats) == 168, "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, room_trigger_clear_audio_non_greed) == 172, "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, room_trigger_clear_audio) == 176, "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, room_trigger_clear_awards_non_greed) == 180, "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, room_trigger_clear_awards_bit7) == 184, "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, room_trigger_clear_awards_greed) == 188, "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, room_trigger_clear_awards_tail) == 192, "event ABI changed");
/* ABI v131 (update-v131-greed-probe-pack, record idx 30): entity capture
   pack @15504..15736 (voucher + count + 8 elems x 7 u32, stride 28) and
   the probe/fire carriers @1056..1072. */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, greed_probe_pack_ready) == 15504,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, greed_probe_elem_count) == 15508,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, greed_probe_elems) == 15512,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, greed_probe_elems[7].f20a9) == 15732,
              "runtime input ABI changed");
static_assert(sizeof(IsaacGameUpdateSliceRuntimeInputs) == 23696,
              "runtime inputs size changed");
/* ABI v133 (update-v133-audio-music-pack, records idx26/27): spawn-tail
   capture packs @16780..17536 + tail-spawn carriers @1100..1104. */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca40_tail_pack_ready) == 16780,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca40_tail_rot_sin_bits) == 16808,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca40_tail_rows) == 16812,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_tail_pack_ready) == 17164,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_tail_rows) == 17188,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, room_trigger_clear_audio_non_greed_tail_spawns) == 1100,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, room_trigger_clear_audio_music_path_tail_spawns) == 1104,
              "event ABI changed");
/* ABI v132 (update-v132-b16-spawn-pack, record idx 36): spawn-walk
   enumeration capture @15736..16776 + echo carriers @1076..1096. */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, water_b16_spawn_rows_ready) == 15736,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, water_b16_water_hit_count) == 15740,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, water_b16_lava_hit_count) == 15744,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, water_b16_grid_w_echo) == 15748,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, water_b16_grid_h_echo) == 15752,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, water_b16_water_hits) == 15756,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, water_b16_lava_hits) == 16268,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, awards_head_ready) == 17540,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, awards_head_src_h_rnd3) == 17648,
              "runtime input ABI changed");
/* ABI v136 (update-v136-audio-head-pack, record idx26): head-gate +
   ABI-67 fail capture @17696..17852 - design-exact offsets
   (contracts-audio-head NOTES section 2). */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca40_head_pack_ready) == 17696,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca40_head_ran_bits) == 17700,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca40_head_desc_f10_f10) == 17704,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca40_head_obj_2c7) == 17708,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca40_head_obj_8) == 17712,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca40_head_game_26630) == 17716,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca40_head_game_byte_26589) == 17720,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca40_head_game_26550) == 17724,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca40_head_game_c) == 17728,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca40_head_game_18304) == 17732,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca40_head_game_182d0) == 17736,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca40_head_game_4) == 17740,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca40_head_room_728) == 17744,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca40_head_h_74ea50_al) == 17748,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca40_head_h_706940_h80) == 17752,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca40_head_h_6f9400) == 17756,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca40_head_h_6f95a0) == 17760,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca40_head_h_740bc0_ret8) == 17764,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca40_head_h_706940b_h80) == 17768,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca40_head_h_74bae0) == 17772,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca40_head_h_74e9b0_al) == 17776,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca40_head_h_70d360) == 17780,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca40_head_obj_1e3) == 17784,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca40_head_game_18314) == 17788,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca40_head_slot_seed) == 17792,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca40_head_bm1) == 17796,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca40_head_bm2) == 17800,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca40_head_slot_occ0) == 17804,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca40_head_slot_occ1) == 17808,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca40_head_slot_occ2) == 17812,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca40_head_slot_occ3) == 17816,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca40_head_slot_occ4) == 17820,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca40_head_slot_occ5) == 17824,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca40_head_slot_occ6) == 17828,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca40_head_slot_occ7) == 17832,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca40_head_slot_8) == 17836,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca40_head_genrand_tail) == 17840,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca40_head_room_f10_f8) == 17844,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca40_head_r74bba0_f10_f8) == 17848,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca40_head_r74bba0b_f10_f8) == 17852,
              "runtime input ABI changed");
/* ABI v137 (update-v137-audio-head-83b0-pack, record idx27): head/
   ALT-walk/tail-RNG capture @17856..18012 (contracts-audio-head-83b0
   NOTES section 2; indicative base 17852 shifts +4 to the design-exact
   idx26 end). */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_head_pack_ready) == 17856,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_head_gate_749830) == 17860,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_head_game_18304) == 17864,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_head_room_idx_ret8) == 17868,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_head_game_18314) == 17872,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_head_value_92b0_bits) == 17876,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_head_music_seed) == 17880,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_head_owner_probe) == 17884,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_head_tls_chain_a) == 17888,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_head_c8108c_a) == 17892,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_head_tls_chain_b) == 17896,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_head_c8108c_b) == 17900,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_head_game_1830c) == 17904,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_head_bm2_non_null) == 17908,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_head_desc_f58) == 17912,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_head_random_int_rnd) == 17916,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_head_bm1_38) == 17920,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_head_slot_occ0) == 17924,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_head_slot_occ1) == 17928,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_head_slot_occ2) == 17932,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_head_slot_occ3) == 17936,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_head_slot_occ4) == 17940,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_head_slot_occ5) == 17944,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_head_slot_occ6) == 17948,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_head_slot_occ7) == 17952,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_alt_walk_game_1830c) == 17956,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_alt_walk_game_18308) == 17960,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_alt_walk_game_1831c) == 17964,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_alt_walk_bm1_38) == 17968,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_alt_walk_seed_f58) == 17972,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_alt_walk_bm2_38) == 17976,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_alt_walk_bm2_34) == 17980,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_alt_walk_mode_269c8) == 17984,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_head_door_magic) == 17988,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_head_game4) == 17992,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_head_game_stage0) == 17996,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_tail_rng_seed_in) == 18000,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_tail_rng_sh1) == 18004,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_tail_rng_sh2) == 18008,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_tail_rng_sh3) == 18012,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, room_trigger_clear_audio_alt_path_tail_spawns) == 1144,
              "event ABI changed");
/* ABI v138 (update-v138-audio-alt-tail-pack, record idx27): ALT-tail
   capture @18016..18391 (NOTES 6C.1/6C.2 structure;
   real ledger base 18016 -- NOTES' 18012 assumed Sh3 @18008). Pins
   the stride-44 row identity (r_b @+0, cos_h @+28, item_py @+40). */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_alt_tail_pack_ready) == 18016,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_alt_tail_iter_count) == 18020,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_alt_tail_door_f24) == 18024,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_alt_tail_game_c) == 18028,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_alt_tail_vec_a_bits) == 18032,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_alt_tail_vec_b_bits) == 18036,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_alt_tail_rows[0].r_b) == 18040,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_alt_tail_rows[0].cos_h_bits) == 18068,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_alt_tail_rows[0].item_py_bits) == 18080,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_alt_tail_rows[1].r_b) == 18084,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_alt_tail_rows[1].cos_h_bits) == 18112,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_alt_tail_rows[1].item_py_bits) == 18124,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_alt_tail_rows[2].r_b) == 18128,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_alt_tail_rows[2].cos_h_bits) == 18156,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_alt_tail_rows[2].item_py_bits) == 18168,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_alt_tail_rows[3].r_b) == 18172,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_alt_tail_rows[3].cos_h_bits) == 18200,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_alt_tail_rows[3].item_py_bits) == 18212,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_alt_tail_rows[4].r_b) == 18216,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_alt_tail_rows[4].cos_h_bits) == 18244,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_alt_tail_rows[4].item_py_bits) == 18256,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_alt_tail_rows[5].r_b) == 18260,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_alt_tail_rows[5].cos_h_bits) == 18288,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_alt_tail_rows[5].item_py_bits) == 18300,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_alt_tail_rows[6].r_b) == 18304,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_alt_tail_rows[6].cos_h_bits) == 18332,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_alt_tail_rows[6].item_py_bits) == 18344,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_alt_tail_rows[7].r_b) == 18348,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_alt_tail_rows[7].cos_h_bits) == 18376,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca83b0_alt_tail_rows[7].item_py_bits) == 18388,
              "runtime input ABI changed");
/* ABI v139 (update-v139-b1-rain-pack, records idx13/idx35): shared-half
   typed search/create/bind outcome rows @18392..21999 (contracts-b1-rain
   NOTES 2.3). Header pins exact; first+last row pins the stride-56
   identity and the 64-row cap. */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b1_rain_rows_ready) == 18392,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b1_rain_spawn_count) == 18396,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b1_rain_quality_echo) == 18400,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b1_rain_owner_nonzero_echo) == 18404,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b1_rain_seed0_echo) == 18408,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b1_rain_decor_count_echo) == 18412,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b1_rain_rows[0].iter_index) == 18416,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b1_rain_rows[0].shuffle_seed_in) == 18420,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b1_rain_rows[0].shuffle_seed_out) == 18424,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b1_rain_rows[0].corner_pick) == 18428,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b1_rain_rows[0].world_x) == 18432,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b1_rain_rows[0].world_y) == 18436,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b1_rain_rows[0].search_ok) == 18440,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b1_rain_rows[0].search_draws) == 18444,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b1_rain_rows[0].create_entity_ptr) == 18448,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b1_rain_rows[0].bind_repositioned) == 18452,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b1_rain_rows[0].bind_repos_draws) == 18456,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b1_rain_rows[0].repos_x) == 18460,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b1_rain_rows[0].repos_y) == 18464,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b1_rain_rows[0].bind_store_7764) == 18468,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b1_rain_rows[63].iter_index) == 21944,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b1_rain_rows[63].shuffle_seed_in) == 21948,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b1_rain_rows[63].shuffle_seed_out) == 21952,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b1_rain_rows[63].corner_pick) == 21956,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b1_rain_rows[63].world_x) == 21960,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b1_rain_rows[63].world_y) == 21964,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b1_rain_rows[63].search_ok) == 21968,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b1_rain_rows[63].search_draws) == 21972,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b1_rain_rows[63].create_entity_ptr) == 21976,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b1_rain_rows[63].bind_repositioned) == 21980,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b1_rain_rows[63].bind_repos_draws) == 21984,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b1_rain_rows[63].repos_x) == 21988,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b1_rain_rows[63].repos_y) == 21992,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, b1_rain_rows[63].bind_store_7764) == 21996,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, b1_rain_rows_applied) == 1148,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, b1_rain_bind_repositioned) == 1168,
              "event ABI changed");
/* ABI v140 (update-v140-awards-spawn-loop-pack, record idx29): SPAWN_LOOP
   continuation capture @22000..22571. Shared lanes + 16 x stride-32 rows;
   first/last row field pins the stride-32 identity and the 16-row cap.
   Carriers @1172..1203 (events 1172 -> 1204). */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, awards_spawn_loop_ready) == 22000,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, awards_spawn_loop_iter_count) == 22004,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, awards_spawn_loop_variant0) == 22008,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, awards_spawn_loop_room_w_c) == 22012,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, awards_spawn_loop_room_h_10) == 22016,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, awards_spawn_loop_b1_music_gate_al) == 22020,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, awards_spawn_loop_b1_quality_int) == 22024,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, awards_spawn_loop_b1_quality_f_bits) == 22028,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, awards_spawn_loop_b1_rnd_f_bits) == 22032,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, awards_spawn_loop_b1_site_pos_x_bits) == 22036,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, awards_spawn_loop_b1_site_pos_y_bits) == 22040,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, awards_spawn_loop_b1_site_draw) == 22044,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, awards_spawn_loop_b1_picker_al) == 22048,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, awards_spawn_loop_tail_gate_b1_al) == 22052,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, awards_spawn_loop_game_26584) == 22056,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, awards_spawn_loop_rows[0].pos_x_bits) == 22060,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, awards_spawn_loop_rows[0].entity_variant_2c) == 22076,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, awards_spawn_loop_rows[0].sfx_owner) == 22088,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, awards_spawn_loop_rows[15].pos_x_bits) == 22540,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, awards_spawn_loop_rows[15].sfx_owner) == 22568,
              "runtime input ABI changed");
static_assert(ISAAC_GAME_UPDATE_AWARD_LOOP_MAX_ROWS == 16,
              "award spawn-loop row cap changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, room_awards_spawn_loop_rows_applied) == 1172,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, room_awards_spawn_loop_variant_final) == 1188,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, room_awards_spawn_loop_b1_chase_fired) == 1200,
              "event ABI changed");
/* ABI v142 (update-v142-rt-band-pop, record idx4): the rt_band_pop
   composite carrier lanes @1244..1256 after the v141 0xb-block tail
   @1240. */
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_008318a0_rt_band_pop_fired) == 1244,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_008318a0_rt_band_pop_depth_after) == 1248,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_008318a0_rt_band_pop_latch_after) == 1252,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_008318a0_rt_band_pop_params_pack) == 1256,
              "event ABI changed");
static_assert(sizeof(IsaacGameUpdateSlice8318a0RtBandPop) == 28,
              "rt_band_pop payload layout changed");


/* ABI v135 (update-v135-deep-music-pack, record idx28): deep-music gate
   capture @17652..17692 + fire carrier @1140. */
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca_dm_gate_ready) == 17652,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca_dm_head_clear_1bb84) == 17656,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca_dm_probe_a_9e9b50) == 17660,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca_dm_probe_b_9595e0) == 17664,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca_dm_byte_26588) == 17668,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca_dm_vec_begin_4b3d8) == 17672,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca_dm_vec_end_4b3dc) == 17676,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca_dm_count_334) == 17680,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca_dm_room_match_ret8) == 17684,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca_dm_game_18314) == 17688,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceRuntimeInputs, tca_dm_game4) == 17692,
              "runtime input ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, room_trigger_clear_deep_music_fire) == 1140,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, water_b16_spawn_rows_applied) == 1076,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, water_b16_leaf_call_count) == 1096,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, room_trigger_clear_awards_greed_probe_9bf990) == 1056,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, room_trigger_clear_awards_greed_fire_mask) == 1072,
              "event ABI changed");
static_assert(sizeof(IsaacGameUpdateSliceEvents) == 1260,
              "events size changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_room_update_clear_doors) == 196, "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_room_update_ambient) == 200, "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_room_update_tail_rain) == 204, "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_room_update_tail_water_b16) == 208, "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_room_update_tail_mid) == 212, "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_room_update_tail_mid_706c_expire) == 216,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_room_update_tail_mid_restock) == 220,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_room_update_tail_mid_7230_spawn) == 224,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_room_update_tail_entity) == 228, "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_room_update_tail_path) == 232, "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, player_manager_update_death) == 236, "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, player_manager_update_heartbeat) == 240,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_call_004257b0_pass_a) == 244, "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_call_004257b0_pass_b) == 248, "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_call_008607a0) == 252, "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, list_update_6772c) == 256, "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_call_0098dba0_timer) == 260, "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, hud_message_text_out) == 264, "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, frame_opaque_98dba0_site) == 268, "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_room_update_ambient_8024f0) == 272,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_room_update_ambient_7f01c0) == 276,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_room_update_ambient_stage_spawn) == 280,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_room_update_ambient_mode_sfx) == 284,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_room_update_ambient_824800_spawn) == 288,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_room_update_ambient_824a70) == 292,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_room_update_ambient_24ee0) == 296,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_room_update_ambient_74e9b0) == 300,
              "event ABI changed");
static_assert(offsetof(IsaacGameUpdateSliceEvents, opaque_room_update_ambient_special_1023) == 304,
              "event ABI changed");

namespace {
constexpr size_t kShortTimerOffset = 0x26528;
constexpr size_t kTransitionTailByte29fb8Offset = 0x29fb8;  // ABI v63
/* ABI v64: FX-lerp gate lane (PE 0x006fae80..0x006faf0b). */
constexpr size_t kFxLerpGate676b4Offset = 0x676b4;
/* ABI v77: record 22 ANM2::Load lane posts (receiver engine+0x38 = Game+0x1b874). */
constexpr size_t kEngineAnm2LoadedOffset = 0x1b97d;      /* [recv+0x109] latch byte */
constexpr size_t kEngineAnm2Slot10cOffset = 0x1b980;     /* [recv+0x10c] */
constexpr size_t kEngineAnm2Bitflags110Offset = 0x1b984; /* [recv+0x110] */
/* ABI v79: record 2 result byte (PE 0x006fb46f mov byte [ecx+0x4aba0],al). */
constexpr size_t kGlobalTree4aba0Offset = 0x4aba0;
/* ABI v80: HUD::PostUpdate history one-shot latch, Game+0x1da04 + 0x5c7c =
   Game+0x23680 (sole writer PE 0x009a2b77, sole reader PE 0x009a2b67 — both
   in record 0). Corrected 2026-08-11: earlier versions recorded Game+0x23580
   (base misread as 0x1d904); the Exit family's independent pins
   (ISAAC_EXIT_9A27D0/9A19A0_THIS_FROM_GAME = 0x1da04 and
   ISAAC_EXIT_84BFD0_THIS_FROM_GAME = 0x233a8) and the PE callsite
   `lea esi,[edi+0x1da04]` (EDI = Game) fix the base at 0x1da04. */
constexpr size_t kHudHistoryLatch5c7cOffset = 0x23680;
/* ABI v82: 0x83b280 loop slot gate buffer offsets (PE 0x009a2b85 lea
   [ebx+0x5c58] / +0x14 stride; recv = Game+0x1da04 -> Game+0x2365c and
   Game+0x23670. Corrected 2026-08-11 with the latch (same misread base). */
constexpr size_t kHudHistorySlotFlag0Offset = 0x2365c;
constexpr size_t kHudHistorySlotFlag1Offset = 0x23670;
static_assert(kHudHistorySlotFlag0Offset == 0x2365c, "buffer ABI changed");
static_assert(kHudHistorySlotFlag1Offset == 0x23670, "buffer ABI changed");
constexpr size_t kFxCur676b8Offset = 0x676b8;
constexpr size_t kPositionResetTimerOffset = 0x26508;
constexpr size_t kPositionXBitsOffset = 0x2650c;
constexpr size_t kPositionYBitsOffset = 0x26510;
constexpr size_t kSecondaryTimerOffset = 0x26538;
constexpr size_t kDecayValueOffset = 0x67734;
constexpr size_t kTransitionProgressOffset = 0x265b0;
constexpr size_t kTransitionRateOffset = 0x265b8;
constexpr size_t kTransitionModeOffset = 0x265bc;
constexpr size_t kPostUpdateDelayOffset = 0x264f4;
constexpr size_t kGate1d520Offset = 0x1d520;
constexpr size_t kOneShot1d63cOffset = 0x1d63c;
constexpr size_t kState24eccOffset = 0x24ecc;
constexpr size_t kValue24ed0Offset = 0x24ed0;
constexpr size_t kMode24ed8Offset = 0x24ed8;
constexpr size_t kGate1d654Offset = 0x1d654;
constexpr size_t kGate1ba78Offset = 0x1ba78;
constexpr size_t kGate1b83cOffset = 0x1b83c;
constexpr size_t kPredicate1ba74Offset = 0x1ba74;
/* FUN_0082ee40 setup + start-state fields when this == Game+0x1b83c. */
constexpr size_t kEngineField4Offset = 0x1b840;
constexpr size_t kEngineField8Offset = 0x1b844;
constexpr size_t kEngineFieldCOffset = 0x1b848;
constexpr size_t kEngineField10Offset = 0x1b84c;
constexpr size_t kEngineField14Offset = 0x1b850;
constexpr size_t kEngineField18Offset = 0x1b854;
constexpr size_t kEngineField1cOffset = 0x1b858;
constexpr size_t kEngineField20Offset = 0x1b85c;
constexpr size_t kEngineField24Offset = 0x1b860;
constexpr size_t kEngineFloat22cOffset = 0x1ba68;
constexpr size_t kEngineFloat230Offset = 0x1ba6c;
constexpr size_t kEnginePlayer1bb74Offset = 0x1bb74;
constexpr size_t kCounter265c0Offset = 0x265c0;
constexpr size_t kItemOverlayStateOffset = 0x1c034;
constexpr size_t kItemOverlayCounter11d1d0Offset = 0x1d1d0; /* ItemOverlay this+0x119c (ABI v58) */
constexpr size_t kMenuState23a74Offset = 0x23a74;
constexpr size_t kGenericPromptActiveObjectOffset = 0x267ac;
constexpr size_t kGenericPromptActiveFlagOffset = 0x267bc;
constexpr size_t kGenericPromptSubmittedSelectionOffset = 0x268a4;
constexpr size_t kGenericPromptPostUpdateFlagOffset = 0x268a8;
constexpr size_t kSkipTimedTransitionFlagOffset = 0x25954;
constexpr size_t kTransitionColorRBitsOffset = 0x265a4;
constexpr size_t kTransitionColorGBitsOffset = 0x265a8;
constexpr size_t kTransitionColorBBitsOffset = 0x265ac;
constexpr size_t kTransitionAuxBitsOffset = 0x265b4;
constexpr size_t kTimedTransitionProgressOffset = 0x26598;
constexpr size_t kTimedTransitionForceFinishOffset = 0x269e8;
constexpr size_t kStatus22ed4Offset = 0x22ed4;
constexpr size_t kStatus22edcOffset = 0x22edc;
constexpr size_t kTimedTransitionCleanupModeOffset = 0x26614;
constexpr size_t kEffectCounter67788Offset = 0x67788;
constexpr size_t kEffectCounter68d6cOffset = 0x68d6c;
constexpr size_t kRoomTransitionMode1830cOffset = 0x1830c;
constexpr size_t kRoomTransitionMarker18318Offset = 0x18318;
constexpr size_t kRoomTransitionIndex18900Offset = 0x18900;
constexpr size_t kRoomTransitionDimension18904Offset = 0x18904;
constexpr size_t kFrameCounter264fcOffset = 0x264fc;
constexpr size_t kFrameCounter264f8Offset = 0x264f8;
constexpr size_t kFadeCounter26514Offset = 0x26514;
constexpr size_t kFadeProgress26518Offset = 0x26518;
constexpr size_t kShakeCurrent67738Offset = 0x67738;
constexpr size_t kShakeTarget6773cOffset = 0x6773c;
constexpr size_t kShakeStep67740Offset = 0x67740;
constexpr size_t kTimer269e0Offset = 0x269e0;
constexpr size_t kDifficulty269c8Offset = 0x269c8;
constexpr size_t kMode26584Offset = 0x26584;
constexpr size_t kFlags2654cOffset = 0x2654c;
/* B1 once-flag dword (float-slot 0x60e7); pure |= 0x80000 when outer gate. */
constexpr size_t kGameFlags1839cOffset = 0x1839c;
constexpr size_t kListCount67730Offset = 0x67730;
constexpr size_t kByte67744Offset = 0x67744;
/* FrameOpaque_4212c0 receiver Game+0x1d2ec field map. */
constexpr size_t kFrameOpaque4212c0ModeOffset = 0x1d2ec;
constexpr size_t kFrameOpaque4212c0SecondaryOffset = 0x1d2f0;
constexpr size_t kFrameOpaque4212c0Field3cOffset = 0x1d328;
constexpr size_t kFrameOpaque4212c0Flag4cOffset = 0x1d338;
constexpr size_t kFrameOpaque4212c0Flag111Offset = 0x1d3fd;
/* FUN_0098dba0 receiver Game+0x25ecc field map. */
constexpr size_t kFrameOpaque98dba0ModeOffset = 0x25ecc;
constexpr size_t kFrameOpaque98dba0FlagOffset = 0x25ed0;
constexpr size_t kFrameOpaque98dba0CounterOffset = 0x25ed4;
constexpr size_t kFrameOpaque98dba0Float170Offset = 0x2603c;
constexpr size_t kFrameOpaque98dba0Float2d0Offset = 0x261bc;
/* HUD_Message at Game+0x216e0 (VA 0x00840c60 text_out receiver). */
constexpr size_t kHudMessageFlag8Offset = 0x216e8;    /* this+0x8  byte  */
constexpr size_t kHudMessagePlayed64Offset = 0x21744; /* this+0x64 byte  */
/* Rank-display (VA 0x00857450) receiver Game+0x1d650 sparse writes. */
constexpr size_t kRankDisplaySwitchOffset = 0x1d650;  /* [esi+0]  dword */
constexpr size_t kRankDisplayStateOffset = 0x1d654;   /* [esi+4]  dword */
constexpr size_t kRankDisplayByte3b0Offset = 0x1da00; /* [esi+0x3b0] byte */
constexpr uint32_t kTransitionStepBits = 0x3da3d70au;
constexpr uint32_t kFloatAbsMask = 0x7fffffffu;
constexpr uint64_t kMicrosecondReciprocal = 0x431bde82d7b634dbull;

IsaacGameUpdateSliceState scratch_state = {};
IsaacGameUpdateSliceConstants scratch_constants = {};
IsaacGameUpdateSliceRuntimeInputs scratch_runtime_inputs = {};
IsaacGameUpdateSliceEvents scratch_events = {};
uint8_t scratch_game_object[ISAAC_GAME_UPDATE_GAME_OBJECT_MIN_SIZE] = {};
/* B8 path-cost pure-apply scratch: hybrid host fills before prefix_b2 when
   room_b8_blob_ready is set. Layout matches Room+0x76c ints / +0xe6c shorts. */
int32_t scratch_b8_costs[ISAAC_ROOM_B8_MAX_CELLS] = {};
/* ABI v95 (record idx 10 R1): the A/B 409030-pair plan scratch (typed
   ADVANCE/REWIND dispatch). Filled by apply_frame_opaque_4212c0_pure when
   ab_pack_ready; the host reads it after the step (address export). */
IsaacGameUpdateSlice4212c0Anm2Plan scratch_4212c0_anm2_plan = {};
/* ABI v96 (record idx 10 R2, 0x004212c0, v98 interior LIVE seam): the
   composed true-probe interior prefix plan scratch. Filled by
   apply_frame_opaque_4212c0_pure when the ABI-96 SFX-manager blob is
   live (blob ready + probe ready + probe TRUE) and the @936 typed event
   fires; the host reads it after the step (address export) to apply the
   interior bodies. Zeroed every step (blob absent -> all zeros). */
IsaacGameUpdateSlice4212c0TrueProbePrefixPlan scratch_4212c0_true_probe_prefix_plan = {};
/* ABI v102 (record idx 4, 0x008318a0 store-plan APPLICATION arm): the
   typed per-row apply plan scratch (148 B, 37 words). Filled by the
   gate_1b83c mode-1 seam when the manager-block gate opens (the @932
   typed event fires); the host reads it after the step (address export)
   to apply the 9 masked stores to the SFX-manager BSS. Zeroed every step
   (gate miss -> all zeros). */
IsaacGameUpdateSlice8318a0SfxManagerStoreApplyPlan
    scratch_8318a0_sfx_manager_store_apply_plan = {};
int16_t scratch_b8_trails[ISAAC_ROOM_B8_MAX_CELLS] = {};
/* B2 (record idx 14) spawn-plan scratch. IN: the host captures the spawn
   element array BEFORE resume_room_update_prefix_b2 (16 B per element:
   {i16 x @0, i16 y @2, u8 flag8 @4, pad, u32 d4 @8, u16 w4_4 @12,
   u16 w4_6 @14}); b2_spawn_count = live [desc+0x10+0x44] word count.
   OUT: the module fills per QUALIFYING element (in order) {f32 x @0,
   f32 y @4, u32 grid @8, u32 seed_after @12, u32 spawn2 @16, u32 pad @20}
   = 24 B x cap. Pool-list scratch: ids u32[31] + weights i32[31]. */
uint8_t scratch_b2_spawn_in[ISAAC_GAME_UPDATE_B2_SPAWN_MAX_ELEMS * 16] = {};
uint8_t scratch_b2_spawn_out[ISAAC_GAME_UPDATE_B2_SPAWN_MAX_ELEMS * 24] = {};
uint32_t scratch_b2_pool_ids[ISAAC_GAME_UPDATE_B2_POOL_COUNT] = {};
int32_t scratch_b2_pool_weights[ISAAC_GAME_UPDATE_B2_POOL_COUNT] = {};
/* Engine player pure float-reset scratch: hybrid host fills eligible[i]
   (entry+0x2c==0) before resume_engine_prefix when engine_player_blob_ready. */
uint8_t scratch_engine_player_eligible[ISAAC_ENGINE_PLAYER_MAX] = {};
float scratch_engine_player_f360[ISAAC_ENGINE_PLAYER_MAX] = {};
float scratch_engine_player_f364[ISAAC_ENGINE_PLAYER_MAX] = {};
uint8_t scratch_engine_player_f410[ISAAC_ENGINE_PLAYER_MAX] = {};
/* ABI v49 tail list sweep output scratch: surviving countdowns for node+0xc.
   Inputs arrive through runtime_inputs->update_list_timers; hybrid host copies
   these back in PE order for every node the residual did not evict. */
int32_t scratch_update_list_timers_out[ISAAC_UPDATE_LIST_MAX_NODES] = {};
/* ABI v78: per-slot eviction flags (1 = evict) produced by the frozen
   frame-opaque v31 sweep contract. The hybrid host reads these to run the
   unlink + four vector tidies + sized free for exactly the evicted set. */
int32_t scratch_update_list_evict_flags[ISAAC_UPDATE_LIST_MAX_NODES] = {};
/* ABI v83: record-0 StatHUD tail countdown lane output. One tick per record
   call (1 per pass, 2 on the postUpdateDelay>0 early-return path). */
int32_t scratch_hud_stat_countdown[ISAAC_HUD_STAT_COUNTDOWN_COUNT] = {};
/* ABI v84: record-0 StatHUD tail walk-arm lane output. 83 u32 words:
   +0 ownerByte, +1/+2 slotPtr0/1 (post-walk), +3+(g*10+k)*4+f = 20 slots
   x {current, delta, prev, timer} (f=0..3; f32 bit patterns, delta from
   the tween; threshold stays host-owned). Timers include the countdown
   decrement (the 20 timers ARE the countdown counters). One full walk per
   record call (1 per pass, 2 on the postUpdateDelay>0 early-return path;
   the second call re-runs from this scratch). */
uint32_t scratch_hud_stat_walk[ISAAC_HUD_STAT_WALK_SCRATCH_WORDS] = {};
/* ABI v50 VA 0x009bea10 output scratch: the +0x410 byte the pure broadcast
   assigns to each Game+0x1baa8 element. Hybrid host copies it back. */
uint8_t scratch_player_flag_410[ISAAC_ENGINE_PLAYER_MAX] = {};
/* ABI v88: 0x0092e300 in-module [entry+0x29] pending-byte stores + walk plan. */
uint8_t scratch_sound_group_pending[ISAAC_OPAQUE_0092E300_MAX_VOICES] = {};
IsaacGameUpdateSliceSoundGroupWalkPlan scratch_sound_group_walk_plan = {};
/* ABI v95: 0x0092e230 STOP fold scratch — post-record [voice+0x29] bytes
   (VISITED voices only; 0 = cleared by the record) + the fold plan. */
uint8_t scratch_sfx_stop_pending[ISAAC_SFX_STOP_FOLD_MAX_VOICES] = {};
IsaacGameUpdateSliceSfxStopFoldPlan scratch_sfx_stop_fold_plan = {};
/* ABI v51 VA 0x0041d030 outputs: free order, per-visit payload-free flag, and
   the post-walk 64-bit accounting counter. */
int32_t scratch_menu_aux_visit_order[ISAAC_MENU_AUX_TREE_MAX_NODES] = {};
uint8_t scratch_menu_aux_payload_free[ISAAC_MENU_AUX_TREE_MAX_NODES] = {};
uint32_t scratch_menu_aux_accounting_out[2] = {};
/* ABI v54 callsite wrapper outputs: three sentinel self-link values followed
   by the _Mysize clear and the menu+0x12a4 clear (see header comment). */
uint32_t scratch_menu_aux_sentinel_out[ISAAC_MENU_AUX_SENTINEL_OUT_WORDS] = {};
/* ABI v52 Isaac::genrand_int32 scratch. state is read/write (mt[624] at
   0x00C7AC70); index_out carries the new mti for 0x00C34F04; samples carries
   the H5 draw stream in PE call order. */
uint32_t scratch_genrand_state[ISAAC_GENRAND_STATE_WORDS] = {};
int32_t scratch_genrand_index_out = 0;
uint32_t scratch_genrand_samples[ISAAC_GENRAND_MAX_SAMPLES] = {};
/* ABI v95 (record idx 34 B13 H5 per-loop create arm): typed per-loop
   CREATE-arm plans, 7 u32 per loop (effect_type, effect_variant,
   layer_index, anm_data_ptr, a1_arg, seed, game_ptr_global) in PE order.
   Filled ONLY on the blob + mt-pure arm (seeds in-module). */
uint32_t scratch_ambient_824a70_create_args[ISAAC_AMBIENT_824A70_MAX_LOOPS * 7] = {};
/* ABI v133 (update-v133-audio-music-pack, records idx26/27): spawn-tail
   plan-Out scratch -- the module writes one Out per consumed row; the host
   reads them via the exported address accessors and applies each in PE
   order (spawn 0x428b20 + [ent+0x474] + timers + [vtbl+0xc]). */
static IsaacRoomTca40TailItemOut scratch_tca40_tail_plan_out[8] = {};
static IsaacRoomTca83B0TailItemOut scratch_tca83b0_tail_plan_out[8] = {};
/* ABI v138: ALT-tail plan-Out scratch (112-B Out x8), accessor mirror. */
static IsaacRoomTca83B0AltItemOut scratch_tca83b0_alt_tail_plan_out[8] = {};
/* PlayerHUD pure-island scratch (ABI v41 multi-slot; PE order 0..7). */
IsaacPlayerHudActiveCountdownState scratch_player_hud_active[ISAAC_PLAYER_HUD_MAX_SLOTS] = {};
int16_t scratch_player_hud_blink[ISAAC_PLAYER_HUD_MAX_SLOTS] = {};
float scratch_player_hud_float[ISAAC_PLAYER_HUD_MAX_SLOTS] = {};
IsaacPlayerHudTailCharCountdownState scratch_player_hud_chars[ISAAC_PLAYER_HUD_MAX_SLOTS] = {};
/* ABI v71 FUN_004257b0 working buffer + published triples.
   `bytes` is the 0x68-stride element array the frozen frame-opaque helpers
   operate on (they take a raw uint8_t* list base). It is rebuilt from the
   runtime-input triples on every entry, so neither continuation depends on
   what a previous tick left behind. `list_out` publishes element +0 / +4 / +8
   for the hybrid host: [0 .. MAX-1] lo, [MAX .. 2*MAX-1] hi,
   [2*MAX .. 3*MAX-1] the Pass B slot value. */
constexpr int32_t kFrameOpaque4257b0ElemStride =
    (int32_t)ISAAC_FRAME_OPAQUE_4257B0_ELEM_STRIDE;
constexpr int32_t kFrameOpaque4257b0MaxList =
    (int32_t)ISAAC_FRAME_OPAQUE_4257B0_MAX_LIST;
constexpr int32_t kFrameOpaque4257b0BytesSize =
    kFrameOpaque4257b0MaxList * kFrameOpaque4257b0ElemStride;
uint8_t scratch_frame_opaque_4257b0_bytes[kFrameOpaque4257b0BytesSize] = {};
uint32_t scratch_frame_opaque_4257b0_list_out[3 * ISAAC_FRAME_OPAQUE_4257B0_MAX_LIST] = {};

uint32_t read_u32(const uint8_t* source) {
  return (uint32_t)source[0] |
      ((uint32_t)source[1] << 8) |
      ((uint32_t)source[2] << 16) |
      ((uint32_t)source[3] << 24);
}

void write_u32(uint8_t* destination, uint32_t value) {
  destination[0] = (uint8_t)value;
  destination[1] = (uint8_t)(value >> 8);
  destination[2] = (uint8_t)(value >> 16);
  destination[3] = (uint8_t)(value >> 24);
}

int32_t read_i32(const uint8_t* source) {
  return __builtin_bit_cast(int32_t, read_u32(source));
}

float read_f32(const uint8_t* source) {
  return __builtin_bit_cast(float, read_u32(source));
}

void write_i32(uint8_t* destination, int32_t value) {
  write_u32(destination, __builtin_bit_cast(uint32_t, value));
}

void write_f32(uint8_t* destination, float value) {
  write_u32(destination, __builtin_bit_cast(uint32_t, value));
}

/* ABI v50 (a): complete translation of VA 0x009bea10 (callsite 0x006fb7e3).

     0x009bea10: push ebp / mov ebp, esp
     0x009bea13: mov  edx, ecx              ; this = Game+0x1baa8 (vector)
     0x009bea15: mov  eax, dword ptr [edx]  ; _Myfirst
     0x009bea17: cmp  eax, dword ptr [edx+4]; _Mylast
     0x009bea1a: je   0x009bea31            ; empty vector -> no writes at all
     0x009bea1d: mov  bl, byte ptr [ebp+8]  ; low byte of the stack argument
     0x009bea20: mov  ecx, dword ptr [eax]  ; element pointer
     0x009bea22: add  eax, 4                ; pointer vector, stride 4
     0x009bea25: mov  byte ptr [ecx+0x410], bl
     0x009bea2b: cmp  eax, dword ptr [edx+4]
     0x009bea2e: jne  0x009bea20
     0x009bea32: ret  4

   No direct or indirect calls: this is a complete leaf, so the whole body is
   translatable. The loop re-reads _Mylast every iteration, but the body only
   stores into element objects (never into the vector header), so the bound is
   loop-invariant and a plain count loop is exact. Only the low byte of the
   argument is stored; the Update callsite pushes the constant 1. */
void player_flag_410_broadcast(uint32_t flag, int32_t count, uint8_t* out) {
  const uint8_t value = (uint8_t)(flag & 0xffu);
  for (int32_t i = 0; i < count; ++i) {
    out[i] = value;
  }
}

/* ABI v50 (b): pure host gate for VA 0x0092e300 (callsite 0x006fb408).

   The function is NOT a leaf — 0x0092e375 / 0x0092e389 / 0x0092e3ad call
   through vtable slots +0x38 and +0x44, and 0x0092e3c4 calls slot +0x3c — so
   the body stays an address-stable host action. What is provable is when the
   body cannot reach any of those dispatches or any store:

     0x0092e30f: edx = [this+4] - [this]      ; byte span of the outer vector
     0x0092e316: eax = 0x094f2095
     0x0092e31e: imul edx                     ; signed 32x32 -> 64
     0x0092e320: sar  edx, 4
     0x0092e323: eax = edx; shr eax,0x1f; add eax, edx   ; signed divide fixup
     0x0092e32a: je   0x0092e41d              ; count == 0 -> immediate return

   0x094f2095 with `sar 4` plus the sign fixup is exact division by 440, which
   matches the outer stride `add ecx, 0x1b8` at 0x0092e3ec.

     0x0092e340: cmp byte ptr [group+0x198], 0
     0x0092e34a: je  0x0092e3ec               ; disabled -> advance, no work
     0x0092e350: xor ebx, ebx
     0x0092e352: cmp dword ptr [group+0x190], ebx
     0x0092e359: jbe 0x0092e3e9               ; jbe is UNSIGNED <=, and ebx is
                                              ; 0, so this is entry count == 0

   If every group is either disabled or empty, the outer walk performs no store
   and no dispatch, so skipping the call is behaviorally exact. Returns 1 when
   the host call is still required. */
int32_t opaque_0092e300_needs_host(
    uint32_t ready,
    int32_t group_count,
    uint32_t packs_ready,
    const uint32_t* group_enabled,
    const uint32_t* group_entry_count) {
  if (ready == 0) return 1;
  /* Byte span of zero divides to zero; the 0x0092e32a je returns at once. */
  if (group_count == 0) return 0;
  /* A negative span cannot occur in a well-formed vector; stay host. */
  if (group_count < 0) return 1;
  if (packs_ready == 0 || group_count > ISAAC_OPAQUE_0092E300_MAX_GROUPS) return 1;
  for (int32_t i = 0; i < group_count; ++i) {
    /* Byte test at group+0x198, then unsigned dword test at group+0x190. */
    if ((group_enabled[i] & 0xffu) == 0) continue;
    if (group_entry_count[i] == 0) continue;
    return 1;
  }
  return 0;
}

/* ABI v85: wrap the v50 group gate with the frozen SFX StopAll plan.
   ready=0 / missing voice blob keeps the v50 result byte-for-byte. */
int32_t opaque_0092e300_emits_host(
    uint32_t ready,
    int32_t group_count,
    uint32_t packs_ready,
    const uint32_t* group_enabled,
    const uint32_t* group_entry_count,
    uint32_t voice_blob_ready,
    int32_t voice_count,
    const int32_t* first_voice,
    const IsaacGameUpdateSliceOpaque0092e300VoicePack* voices) {
  if (ready == 0u) return 1; /* ABI v88: ready=0 stays pre-v50 monolithic */
  const int32_t v50 = opaque_0092e300_needs_host(
      ready, group_count, packs_ready, group_enabled, group_entry_count);
  if (v50 == 0) return 0;
  if (voice_blob_ready != 1u) return v50;
  if (voice_count < 0 || voice_count > ISAAC_OPAQUE_0092E300_MAX_VOICES) return 1;
  if (group_count < 0 || group_count > ISAAC_OPAQUE_0092E300_MAX_GROUPS ||
      packs_ready == 0) {
    return 1;
  }
  if (group_enabled == nullptr || group_entry_count == nullptr ||
      first_voice == nullptr || voices == nullptr) {
    return 1;
  }
  const int32_t span_bytes = group_count * ISAAC_SFX_ENTRY_STRIDE;
  IsaacSfxStopAllGroup groups[ISAAC_OPAQUE_0092E300_MAX_GROUPS];
  for (int32_t i = 0; i < group_count; ++i) {
    groups[i].enabled_198 = group_enabled[i];
    groups[i].voices_190 = group_entry_count[i];
    groups[i].first_voice = first_voice[i];
  }
  IsaacSfxStopAllVoiceSample samples[ISAAC_OPAQUE_0092E300_MAX_VOICES];
  for (int32_t i = 0; i < voice_count; ++i) {
    samples[i].channel_null = voices[i].channel_null;
    samples[i].pending_09 = voices[i].pending_09;
    samples[i].probe_first = voices[i].probe_first;
    samples[i].probe_second = voices[i].probe_second;
    samples[i].channel_null_third = voices[i].channel_null_third;
    samples[i].loop_08 = voices[i].loop_08;
    samples[i].query_44 = voices[i].query_44;
    samples[i].channel_null_fourth = voices[i].channel_null_fourth;
    samples[i].voices_reloaded = voices[i].voices_reloaded;
  }
  IsaacSfxStopAllPlan plan;
  isaac_sfx_stop_all_plan(span_bytes, groups, group_count, samples, voice_count,
                          &plan);
  return plan.pure_complete == 0 ? 1 : 0;
}

/* ABI v88: in-module outer 0x1b8 walk + inner 0x38 walk.
   Host-resolved bools for vtable +0x38/+0x44 live in the v85 voice blob.
   +0x3c stays a typed host event. Both [e+0x29]=0 stores land in scratch.
   Returns 1 when the walk ran in-module (caller must NOT emit the
   monolithic 0x0092e300 host). Returns 0 to keep v50/v85 emits_host.
   walk_ready=0 or v50 ready=0 -> not applied (pre-v50 / pre-v88). */
static int32_t opaque_0092e300_walk(
    uint32_t walk_ready,
    uint32_t ready,
    int32_t group_count,
    uint32_t packs_ready,
    const uint32_t* group_enabled,
    const uint32_t* group_entry_count,
    uint32_t voice_blob_ready,
    int32_t voice_count,
    const int32_t* first_voice,
    const IsaacGameUpdateSliceOpaque0092e300VoicePack* voices,
    IsaacGameUpdateSliceSoundGroupWalkPlan* plan_out,
    uint8_t* pending_out) {
  if (plan_out != nullptr) {
    plan_out->groups_visited = 0;
    plan_out->groups_disabled = 0;
    plan_out->groups_empty = 0;
    plan_out->groups_walked = 0;
    plan_out->voices_visited = 0;
    plan_out->probe_calls = 0;
    plan_out->query_calls = 0;
    plan_out->stop_calls = 0;
    plan_out->stores = 0;
    plan_out->applied = 0;
  }
  if (pending_out != nullptr) {
    for (int32_t i = 0; i < ISAAC_OPAQUE_0092E300_MAX_VOICES; ++i) pending_out[i] = 0;
  }
  if (walk_ready != 1u) return 0;
  if (ready == 0u) return 0;
  if (voice_blob_ready != 1u) return 0;
  if (group_count < 0 || group_count > ISAAC_OPAQUE_0092E300_MAX_GROUPS ||
      packs_ready == 0u) {
    return 0;
  }
  if (voice_count < 0 || voice_count > ISAAC_OPAQUE_0092E300_MAX_VOICES) return 0;
  if (group_count > 0 && (group_enabled == nullptr || group_entry_count == nullptr ||
                          first_voice == nullptr || voices == nullptr)) {
    return 0;
  }
  if (plan_out != nullptr) plan_out->applied = 1;
  if (group_count == 0) return 1;
  for (int32_t g = 0; g < group_count; ++g) {
    if (plan_out != nullptr) plan_out->groups_visited += 1;
    const int32_t action =
        isaac_sfx_stop_all_group_action(group_enabled[g], group_entry_count[g]);
    if (action == ISAAC_SFX_STOP_ALL_GROUP_DISABLED) {
      if (plan_out != nullptr) plan_out->groups_disabled += 1;
      continue;
    }
    if (action == ISAAC_SFX_STOP_ALL_GROUP_EMPTY) {
      if (plan_out != nullptr) plan_out->groups_empty += 1;
      continue;
    }
    if (action != ISAAC_SFX_STOP_ALL_GROUP_WALK) continue;
    if (plan_out != nullptr) plan_out->groups_walked += 1;
    for (int32_t i = 0;; ++i) {
      const int32_t slot = first_voice[g] + i;
      if (slot < 0 || slot >= voice_count) break;
      IsaacSfxStopAllVoiceSample sample;
      sample.channel_null = (int32_t)voices[slot].channel_null;
      sample.pending_09 = voices[slot].pending_09;
      sample.probe_first = (int32_t)voices[slot].probe_first;
      sample.probe_second = (int32_t)voices[slot].probe_second;
      sample.channel_null_third = (int32_t)voices[slot].channel_null_third;
      sample.loop_08 = voices[slot].loop_08;
      sample.query_44 = voices[slot].query_44;
      sample.channel_null_fourth = (int32_t)voices[slot].channel_null_fourth;
      sample.voices_reloaded = voices[slot].voices_reloaded;
      IsaacSfxStopAllVoiceDecision d;
      isaac_sfx_stop_all_voice_decide(&sample, &d);
      if (plan_out != nullptr) {
        plan_out->voices_visited += 1;
        plan_out->probe_calls += d.probe_calls;
        plan_out->query_calls += d.query_needed;
        plan_out->stop_calls += d.stop_called;
        plan_out->stores += d.observable_stores;
      }
      uint8_t pending = (uint8_t)(voices[slot].pending_09 & 0xffu);
      if (d.pending_cleared_early != 0 || d.pending_cleared_late != 0) pending = 0;
      if (pending_out != nullptr) pending_out[slot] = pending;
      if (isaac_sfx_voice_loop_continue((uint32_t)(i + 1), sample.voices_reloaded) == 0) {
        break;
      }
    }
  }
  return 1;
}

/* ABI v95: in-module STOP fold of 0x0092e230 (record idx 47,
   playerManagerUpdateHeartbeatSfxStop). Mirrors opaque_0092e300_walk for
   the STOP body: single id-indexed entry, per-voice channel walk + stop
   gates, [entry+4]=-1 sentinel + [voice+0x29] clears land in scratch,
   device vtbl[0x3c] stops are COUNTED for the typed host event. Shared
   family helpers are consumed BY REFERENCE (never restated).

   Gates (PE, transcript): MISS = SIGNED id<0 (0x92e239 js) or id>=count
   (0x92e25b jge); NO_SAMPLES = UNSIGNED voices==0 (0x92e269 cmp
   dword[entry+0x190],0 / ja); DISABLED = BYTE [entry+0x198]==0 (0x92e289
   cmp byte / je); else LIVE. MISS/DISABLED are proof-complete no-ops ->
   applied=1 with all zeros (the v60 drop becomes in-module); NO_SAMPLES is
   NOT applied (the warn-log 0xa112c0 stays host -> caller keeps the v60
   fallback); LIVE folds the walk. The loop bound is the per-sample
   voices_reloaded (PE 0x92e2e6 re-reads [entry+0x190] EVERY iteration)
   through the captured array capped at voice_count. fold_ready=0 /
   ready=0 / missing blob -> not applied (v60 fallback byte-for-byte). */
static int32_t opaque_0092e230_stop_fold(
    uint32_t fold_ready, uint32_t ready, int32_t span_bytes,
    uint32_t voices_190, uint32_t enabled_198, int32_t voice_count,
    const IsaacGameUpdateSliceSfxStopVoicePack* voices,
    IsaacGameUpdateSliceSfxStopFoldPlan* plan_out, uint8_t* pending_out) {
  if (plan_out != nullptr) {
    plan_out->applied = 0;
    plan_out->sentinel_written = 0;
    plan_out->voices_visited = 0;
    plan_out->probe_calls = 0;
    plan_out->stop_calls = 0;
    plan_out->stores = 0;
  }
  if (pending_out != nullptr) {
    for (int32_t i = 0; i < ISAAC_SFX_STOP_FOLD_MAX_VOICES; ++i) {
      pending_out[i] = 0;
    }
  }
  if (fold_ready != 1u) return 0;
  if (ready == 0u) return 0;
  if (voice_count < 0 || voice_count > ISAAC_SFX_STOP_FOLD_MAX_VOICES) return 0;
  if (voice_count > 0 && voices == nullptr) return 0;

  const int32_t gate = isaac_sfx_mutator_gate(
      ISAAC_PM_INTENSITY_SFX_ID, span_bytes, voices_190, enabled_198);
  if (gate == ISAAC_SFX_GATE_NO_SAMPLES) {
    /* 0x92e272..0x92e27a: the warn-log host stays on the v60 fallback. */
    return 0;
  }
  if (plan_out != nullptr) plan_out->applied = 1;
  if (gate != ISAAC_SFX_GATE_LIVE) {
    /* MISS / DISABLED: proof-complete no-op; sentinel never runs. */
    return 1;
  }
  if (plan_out != nullptr) plan_out->sentinel_written = 1;
  for (int32_t i = 0; i < voice_count; ++i) {
    const IsaacGameUpdateSliceSfxStopVoicePack& v = voices[i];
    if (plan_out != nullptr) {
      plan_out->voices_visited += 1;
      /* 0x92e2a0: [entry+4] = -1 is the FIRST insn of the loop body and
         runs EVERY iteration on LIVE (divergence #0 vs 0x92e300). */
      plan_out->stores += 1;
    }
    uint8_t pending = (uint8_t)(v.pending_09 & 0xffu);
    if (v.channel_null == 0u) {
      if (plan_out != nullptr) {
        plan_out->probe_calls +=
            isaac_sfx_probe_voice_probe_calls((int32_t)v.channel_null,
                                              v.pending_09);
      }
      /* 0x92e2ae cmp byte [esi],0 — LOW-BYTE first-probe gate. */
      if (isaac_sfx_voice_first_probe_needed((int32_t)v.channel_null,
                                             v.pending_09) != 0 &&
          v.probe_first != 0u) {
        /* 0x92e2be early clear: [voice+0x29] = 0. */
        pending = 0;
        if (plan_out != nullptr) plan_out->stores += 1;
      }
      /* 0x92e2cb jne / 0x92e2cf cmp byte [esi],al: stop iff probe2 != 0
         || pending_after != 0. 0x92e2d3..0x92e2d6: the RELOADED channel
         must be non-null for the device stop (and the late clear). */
      const int32_t act = isaac_sfx_voice_act(
          (int32_t)v.channel_null, v.pending_09, (int32_t)v.probe_first,
          (int32_t)v.probe_second);
      if (isaac_sfx_stop_clears_pending(act, (int32_t)v.channel_null_reload) !=
          0) {
        /* 0x92e2da call dword [vtbl+0x3c] (device, typed host) then
           0x92e2df late clear. */
        if (plan_out != nullptr) {
          plan_out->stop_calls += 1;
          plan_out->stores += 1;
        }
        pending = 0;
      }
    }
    /* The scratch carries the post-record pending byte for VISITED voices
       (captured low byte, 0 when either clear store ran); unvisited lanes
       keep the init 0 ("untouched", never a mask bit — the call site
       derives the mask over plan.voices_visited only). */
    if (pending_out != nullptr) pending_out[i] = pending;
    /* 0x92e2e6 cmp ebx,[edi+0x190] / jb — UNSIGNED, per-iteration re-read. */
    if (isaac_sfx_voice_loop_continue((uint32_t)(i + 1), v.voices_reloaded) ==
        0) {
      break;
    }
  }
  return 1;
}

/* ABI v86: HUD v5 try_pure skip. ABI v95: record idx 3 case-arm pure-tail
   gate — the SAME switch-default law plus the case-1/2 pure-tail exits
   (counter/limit/field_14; see isaac_game_update_slice_92f1c0_try_pure).
   ready=0 keeps v85 always-host (v86 lockstep).
   Returns 1 when the host call is still required. */
int32_t opaque_0092f1c0_needs_host(uint32_t ready, uint32_t mode,
                                   uint32_t counter, uint32_t limit,
                                   uint32_t field_14) {
  if (ready == 0u) return 1;
  return isaac_game_update_slice_92f1c0_try_pure(mode, counter, limit, field_14) == 0
             ? 1
             : 0;
}

/* ABI v87: HUD v5 try_pure skip for VA 0x008318a0. SAME law as
   opaque_0092f1c0_needs_host — isaac_hud_gate_92f1c0_try_pure BY
   REFERENCE. ready=0 keeps v86 always-host. Returns 1 when the
   8318a0 host call is still required. The 98dba0 walk is a different
   VA and is never dropped here. */
int32_t opaque_008318a0_needs_host(uint32_t ready, uint32_t mode) {
  if (ready == 0u) return 1;
  return isaac_hud_gate_92f1c0_try_pure(mode) == 0 ? 1 : 0;
}

/* ABI v51 (b): pure early-out gate for VA 0x00857450 (callsite 0x006fb4cb).

   The body stays host: 0x0040a380 is an exact ANM2::Play and 0x00409030 /
   0x0040a4d0 are the same ANM2 family, owned elsewhere. Only the two early
   returns are peeled, and both jump to 0x008576af:

     0x00857455: mov ecx, dword ptr [esi+4]     ; Game+0x1d654
     0x00857458: test ecx, ecx
     0x0085745a: je  0x008576af                 ; gate 1
     0x00857460: eax = *(*0xc7169c + 0x4abbc)
     0x0085746b: and eax, 0x80000001
     0x00857470: jns 0x00857477
     0x00857472: dec eax
     0x00857473: or  eax, 0xfffffffe
     0x00857476: inc eax
     0x00857477: cmp eax, 1
     0x0085747a: je  0x008576af                 ; gate 2

   0x008576af is `pop edi / pop esi / pop ebx / ret` — pure epilogue. The tail
   Manager clears (`byte [Manager+0x4aa70] = 0`, `byte [Manager+0x4aba0] = 0`)
   live at 0x0085769c, BEFORE that label, so an early return skips them too.
   An early-out is therefore a complete no-op and the call can be skipped.

   The and/dec/or/inc sequence is the MSVC signed `% 2` idiom, so gate 2 is
   `(int32)v % 2 == 1`. It fires only for POSITIVE odd values: a negative odd
   value masks to 0x80000001, the fixup turns it into -1, and -1 != 1. Reading
   it as unsigned `v & 1` would wrongly early-out on negative odd inputs.
   Returns 1 when the host call is still required. */
int32_t signed_mod2_is_one(int32_t value) {
  uint32_t masked = (uint32_t)value & 0x80000001u;
  if ((int32_t)masked < 0) {
    masked = ((masked - 1u) | 0xfffffffeu) + 1u;
  }
  return (int32_t)masked == 1 ? 1 : 0;
}

int32_t opaque_857450_needs_host(uint32_t ready, int32_t gate_1d654,
                                 int32_t manager_4abbc) {
  if (ready == 0) return 1;
  /* Gate 1 (also enforced by the callsite at 0x006fb4bc). */
  if (gate_1d654 == 0) return 0;
  /* Gate 2: positive-odd only. */
  if (signed_mod2_is_one(manager_4abbc) != 0) return 0;
  return 1;
}


/* ABI v56: VA 0x00857450 rank-display body — pure re-transcription. This is
   the C++ mirror of scripts/decomp/game-update-model.mjs rankDisplayBodyFold;
   both were written directly from the instruction stream (section-notes/
   anm2-v6/disasm-857450.txt) — neither was mechanically derived from the
   other. The six host-call recapture points (runtime inputs read only where
   the PE re-reads [esi+4]/AL after a call) are documented in the JS fold.
   Play-mask bits: 0 Loading@this+0x124, 1 Idle@this+0x124, 2 Loading@this+0x10,
   3 DisplayRankStart@this+0x10, 4 DisplayRank@this+0x10, 5 Appear@this+0x124. */
static uint32_t rank_display_bit_count(uint32_t mask) {
  uint32_t n = 0;
  while (mask != 0) {
    n += mask & 1u;
    mask >>= 1;
  }
  return n;
}

static int32_t rank_display_name_eq(uint32_t w0, uint32_t w1, uint32_t w2,
                                    uint32_t w3, uint32_t w4) {
  /* The PE compares 20 bytes (16 chars + NUL) against 0xb6e4d0
     "DisplayRankStart": "Disp","layR","ankS","tart", eos byte == 0. */
  if (w0 != 0x70736944u) return 0;
  if (w1 != 0x5279616cu) return 0;
  if (w2 != 0x536b6e61u) return 0;
  if (w3 != 0x74726174u) return 0;
  return (w4 & 0xffu) == 0u ? 1 : 0;
}

extern "C" uint32_t isaac_game_update_slice_857450_body(
    const IsaacGameUpdateSliceRuntimeInputs* inputs, IsaacGameUpdateSliceState* state,
    IsaacGameUpdateSliceEvents* events) {
  if (inputs == nullptr || state == nullptr || events == nullptr) return 0;
  const uint32_t st = (uint32_t)state->gate_1d654;
  const uint32_t sw = inputs->rank_display_switch;
  uint32_t state_upd = 0;
  uint32_t play_mask = 0;
  uint32_t is_playing = 0;
  uint32_t sw_after = sw;
  uint32_t st_after = st;
  uint32_t clear_3b0 = 0;

  if ((int32_t)sw == 0) {
    /* ---------------- block A (0x00857556) ---------------- */
    uint32_t ebx;
    uint32_t ec;
    if ((inputs->rank_display_byte_119 & 0xffu) != 0u) {
      state_upd = 2; /* 0x409030 this+0x40 / this+0x60 */
      ec = inputs->rank_display_st_upd;   /* recapture 0x00857574 */
    } else {
      ec = st;
    }
    if (ec == 1u) {
      if (inputs->rank_display_ptr_44 == 0u ||
          (inputs->rank_display_byte_54 & 0xffu) == 0u) {
        play_mask |= 1u << 2; /* Play "Loading" this+0x10 */
        st_after = 2u;        /* 0x0085759b; no later [esi+4] read */
        ebx = 2u;
      } else {
        ebx = 1u;
      }
    } else {
      ebx = ec;
    }
    is_playing = 1; /* 0x008575b1 IsPlaying(this+0x10, "Loading") */
    if ((inputs->rank_display_is_playing_al & 0xffu) != 0u &&
        (inputs->rank_display_byte_39c & 0xffu) != 0u &&
        (inputs->rank_display_byte_39d & 0xffu) != 0u) {
      play_mask |= 1u << 3; /* Play "DisplayRankStart" this+0x10 */
      st_after = 3u;        /* 0x008575dd */
      ebx = 3u;
    }
    if (inputs->rank_display_ptr_44 != 0u &&
        (inputs->rank_display_byte_54 & 0xffu) == 0u) {
      if (rank_display_name_eq(inputs->rank_display_disp_word_0,
                               inputs->rank_display_disp_word_1,
                               inputs->rank_display_disp_word_2,
                               inputs->rank_display_disp_word_3,
                               inputs->rank_display_disp_eos) != 0) {
        play_mask |= 1u << 4; /* Play "DisplayRank" this+0x10 */
        st_after = inputs->rank_display_st_after_display; /* 0x00857646 */
        ebx = inputs->rank_display_st_after_display;
      }
    }
    if (ebx == 4u) {
      /* 0x0085764e: Play "Appear" this+0x124 */
      if (inputs->rank_display_ptr_44 == 0u ||
          (inputs->rank_display_byte_54 & 0xffu) == 0u) {
        play_mask |= 1u << 5;
        sw_after = 1u;
        st_after = 1u;
      }
    }
    if ((inputs->rank_display_byte_3b0 & 0xffu) != 0u) {
      if (inputs->rank_display_ptr_44 == 0u ||
          (inputs->rank_display_byte_54 & 0xffu) == 0u) {
        clear_3b0 = 1u; /* 0x0085768e */
        st_after = 0u;
      }
    }
  } else if ((int32_t)sw == 1) {
    /* ---------------- block 1 (0x00857494) ---------------- */
    uint32_t ec;
    if ((inputs->rank_display_byte_22d & 0xffu) == 0u) {
      state_upd = 2; /* 0x409030 this+0x154 / this+0x174 */
      ec = inputs->rank_display_st_upd; /* recapture 0x008574b2 */
    } else {
      ec = st;
    }
    if (ec == 1u) {
      /* 0x008574ba: d158==0 or b168==0 -> Play "Loading" this+0x124 */
      if (inputs->rank_display_dword_158 == 0 ||
          (inputs->rank_display_byte_168 & 0xffu) == 0) {
        play_mask |= 1u << 0;
        st_after = 2u; /* write before the call */
        ec = inputs->rank_display_st_after_loading; /* recapture 0x008574e5 */
      }
    }
    if (ec == 2u) {
      if (inputs->rank_display_dword_248 != 0) {
        play_mask |= 1u << 1; /* Play "Idle" this+0x124 */
        st_after = 3u;        /* write before the call */
        ec = inputs->rank_display_st_after_idle; /* recapture 0x0085750f */
      }
    }
    if (ec == 4u) {
      /* 0x00857529 */
      if (inputs->rank_display_dword_158 == 0 ||
          (inputs->rank_display_byte_168 & 0xffu) == 0) {
        st_after = 0u;
      }
    }
    /* 0x00857530 tail: the b168 compare at 0x0085754a is dead (unconditional
       jmp) — reads have no observable effect. */
    if ((inputs->rank_display_byte_3b0 & 0xffu) != 0u) {
      if (inputs->rank_display_dword_158 == 0 ||
          (inputs->rank_display_byte_54 & 0xffu) == 0) {
        clear_3b0 = 1u;
        st_after = 0u;
      }
    }
  }

  /* Common tail 0x0085769c: the v51 gate (st==0 / manager odd) already
     returned at the head, so a body that reaches here zeroes the two
     manager bytes. */
  state->rank_display_switch_after = (int32_t)sw_after;
  state->rank_display_state_after = (int32_t)st_after;
  state->rank_display_clear_3b0_out = clear_3b0;
  state->rank_display_tail_out = 1u;
  events->rank_display_state_upd = state_upd;
  events->rank_display_play_mask = play_mask;
  events->rank_display_calls =
      state_upd + rank_display_bit_count(play_mask) + is_playing;
  events->rank_display_is_playing = is_playing;
  return 1;
}


/* ABI v51 (a): complete translation of the game-logic half of VA 0x0041d030
   (menu_aux_list_clear, receiver *(Game+0x18300)).

     _Erase(arg at [ebp+8], node at [ebp+0xc]):
       while (node->_Isnil == 0)            ; byte [node+0xd], 0x0041d05a
         _Erase(arg, node->_Right)          ; [node+8],  0x0041d060..68
         edi = node
         node = node->_Left                 ; [node+0],  0x0041d06f
         if (edi->flag_1c == 0) {           ; byte [edi+0x1c], 0x0041d071
           ecx = edi->payload               ; [edi+0x20]
           edx = *0xc7de78 ? *0xc7de78 + 0x30 : 0xc7f618
           if (ecx != 0) {
             eax = [ecx-4]                  ; size stored one dword below
             ecx -= 4                       ; payload rebiased to the header
             [edx]   -= eax                 ; 64-bit accounting, low half
             [edx+4] -= borrow              ; sbb, high half
             free(ecx)                      ; *0xb187dc  RAW
           }
         }
         operator delete(edi, 0x2c)         ; 0x00aef15c  RAW

   Reverse in-order (right subtree, then the node, then iterate left) fixes the
   free ORDER, which the allocator standing decision makes observable. The
   payload bias, the size-at-payload-4 read, and the 64-bit borrow are exactly
   the wrapper accounting that decision requires translating. What remains is
   two RAW frees, which are platform primitives.

   Returns the number of visited nodes, or -1 when the blob is malformed
   (out-of-range index, cycle, or overflow past the cap) so the caller can fall
   back to the monolithic host residual. */
int32_t menu_aux_tree_erase(
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs,
    int32_t* visit_order,
    uint8_t* payload_free,
    uint32_t* accounting_out) {
  const int32_t count = runtime_inputs->menu_aux_tree_node_count;
  if (count < 0 || count > ISAAC_MENU_AUX_TREE_MAX_NODES) return -1;

  uint32_t lo = runtime_inputs->menu_aux_accounting_lo;
  uint32_t hi = runtime_inputs->menu_aux_accounting_hi;

  /* Explicit stack replaces the PE recursion; depth cannot exceed the node
     cap because every push consumes a distinct unvisited node. */
  int32_t stack[ISAAC_MENU_AUX_TREE_MAX_NODES];
  int32_t depth = 0;
  int32_t visited = 0;
  uint8_t seen[ISAAC_MENU_AUX_TREE_MAX_NODES] = {};

  int32_t node = runtime_inputs->menu_aux_tree_root;
  for (;;) {
    /* Walk the current spine, pushing each non-nil node and descending right,
       reproducing `_Erase(node->_Right)` before the node is processed. */
    while (node >= 0) {
      if (node >= count) return -1;
      if (runtime_inputs->menu_aux_tree_isnil[node] != 0) break;
      if (seen[node] != 0) return -1; /* cycle */
      seen[node] = 1;
      if (depth >= ISAAC_MENU_AUX_TREE_MAX_NODES) return -1;
      stack[depth] = node;
      depth += 1;
      node = runtime_inputs->menu_aux_tree_right[node];
    }
    if (node < -1) return -1;
    if (depth == 0) break;
    depth -= 1;
    const int32_t current = stack[depth];

    if (visited >= ISAAC_MENU_AUX_TREE_MAX_NODES) return -1;
    visit_order[visited] = current;
    uint8_t freed_payload = 0;
    /* 0x0041d071 is `cmp byte ptr [edi+0x1c], 0` — a LOW-BYTE test, so a value
       whose only set bits are above bit 7 still takes the payload path.
       payload_present derives from the full dword at node+0x20, so it is not
       masked. */
    if ((runtime_inputs->menu_aux_tree_flag_1c[current] & 0xffu) == 0 &&
        runtime_inputs->menu_aux_tree_payload_present[current] != 0) {
      const uint32_t size = runtime_inputs->menu_aux_tree_payload_size[current];
      /* 64-bit subtract with borrow, matching sub/sbb at 0x0041d098. */
      const uint32_t new_lo = lo - size;
      const uint32_t borrow = (lo < size) ? 1u : 0u;
      lo = new_lo;
      hi = hi - borrow;
      freed_payload = 1;
    }
    payload_free[visited] = freed_payload;
    visited += 1;

    /* PE continues the while loop with node = current->_Left. */
    node = runtime_inputs->menu_aux_tree_left[current];
  }

  accounting_out[0] = lo;
  accounting_out[1] = hi;
  return visited;
}

void classify_transition_dispatch(int32_t mode, IsaacGameUpdateSliceEvents* events) {
  events->dispatch_kind = ISAAC_TRANSITION_DISPATCH_NONE;
  events->queued_screen_id = -1;
  events->fade_argb = 0;
  events->payload_copy_required = 0;
  switch (mode) {
    case 1:
      events->dispatch_kind = ISAAC_TRANSITION_DISPATCH_QUEUE_SCREEN;
      events->queued_screen_id = 2;
      break;
    case 2:
      events->dispatch_kind = ISAAC_TRANSITION_DISPATCH_QUEUE_SCREEN;
      events->queued_screen_id = 3;
      break;
    case 3:
      events->dispatch_kind = ISAAC_TRANSITION_DISPATCH_QUEUE_SCREEN;
      events->queued_screen_id = 0x13;
      break;
    case 4:
      events->dispatch_kind = ISAAC_TRANSITION_DISPATCH_QUEUE_SCREEN;
      events->queued_screen_id = 1;
      break;
    case 5:
    case 6:
      events->dispatch_kind = ISAAC_TRANSITION_DISPATCH_RESTART_FLOW;
      break;
    case 7:
      events->dispatch_kind = ISAAC_TRANSITION_DISPATCH_NEXT_VICTORY_LAP;
      break;
    case 8:
    case 10:
      events->dispatch_kind = ISAAC_TRANSITION_DISPATCH_OPAQUE_MODE;
      break;
    case 9:
      events->dispatch_kind = ISAAC_TRANSITION_DISPATCH_NO_OP;
      break;
    case 11:
      events->dispatch_kind = ISAAC_TRANSITION_DISPATCH_QUEUE_SCREEN;
      events->queued_screen_id = 0x11;
      break;
    default:
      events->dispatch_kind = ISAAC_TRANSITION_DISPATCH_UNKNOWN;
      break;
  }
  if (events->dispatch_kind == ISAAC_TRANSITION_DISPATCH_QUEUE_SCREEN) {
    events->fade_argb = 0xff000000u;
    events->payload_copy_required = 1;
  }
}

uint64_t join_u64(uint32_t low, uint32_t high) {
  return ((uint64_t)high << 32) | low;
}

uint64_t scale_monotonic_counter(uint64_t counter) {
  const unsigned __int128 product = (unsigned __int128)counter * kMicrosecondReciprocal;
  return (uint64_t)(product >> 82);
}

/* ABI v36/v40/v41: emit HUD::PostUpdate residual only when pure-complete idle
   is unreachable. When player_hud_blob_ready, PE-order loop occupied mask bits
   0..7 and peel PlayerHUD FUN_00842230 pure islands + typed UpdateHearts host
   (exact ZHL 0x00841e20) + gfx/dirty per slot; history/stat once after loop.
   Without blob, monolithic hud_post_update_calls covers full body. */

/* ABI v83: record-0 StatHUD tail countdown lane (PE 0x84c224..0x84c2b0).
   Active only when (a) the tail gate byte (Manager+0x2a37c, the low byte of
   manager_stat_flag) is set — the whole 0x84c170 tail is skipped otherwise,
   (b) the host captured the 20 counters at the record boundary
   (hud_stat_countdown_ready), and (c) the player vector at Game+0x1baa8 is
   EMPTY ((end-begin)>>2 == 0): with entries, RecomputeStats 0x84ca00 calls
   stat_bar_tween 0x84d6b0 which WRITES [tween+0x10] — the very bytes the
   countdown decrements — so the true inputs are post-walk host leaves and
   the lane must stay off (defect class 1 guard). The PE runs the countdown
   once per record call (1 call every pass at 0x006fb3b8, a second only on
   the postUpdateDelay>0 early-return path at 0x006fb3d0), so the model
   calls init once (inputs -> scratch, tick) and tick once per additional
   record call; the scratch then holds the exact post-tick values for the
   residual consumer. */
static bool hud_stat_countdown_lane_active(
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs) {
  if ((runtime_inputs->manager_stat_flag & 0xffu) == 0u) return false;
  if (runtime_inputs->hud_stat_countdown_ready == 0u) return false;
  const int32_t begin = static_cast<int32_t>(runtime_inputs->hud_stat_player_list_begin);
  const int32_t end = static_cast<int32_t>(runtime_inputs->hud_stat_player_list_end);
  return (((end - begin) >> 2) == 0);
}

static void hud_stat_countdown_tick(int32_t* counters) {
  for (int32_t i = 0; i < ISAAC_HUD_STAT_COUNTDOWN_COUNT; ++i) {
    const int32_t v = counters[i];
    if (v > 0) counters[i] = v - 1;
  }
}

static void maybe_hud_stat_countdown_init(
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs) {
  if (!hud_stat_countdown_lane_active(runtime_inputs)) return;
  for (int32_t i = 0; i < ISAAC_HUD_STAT_COUNTDOWN_COUNT; ++i) {
    scratch_hud_stat_countdown[i] = runtime_inputs->hud_stat_countdown[i];
  }
  hud_stat_countdown_tick(scratch_hud_stat_countdown);
}

static void maybe_hud_stat_countdown_tick(
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs) {
  /* The lane condition is step-constant (all inputs are runtime captures),
     so the second record call ticks the same scratch the first call
     initialized. An inactive step leaves the scratch at its step-reset
     zeros. */
  if (!hud_stat_countdown_lane_active(runtime_inputs)) return;
  hud_stat_countdown_tick(scratch_hud_stat_countdown);
}

/* ABI v84: record-0 StatHUD tail WALK-ACTIVE lane (PE 0x84c170..0x84c2b9).
   Active when the tail gate byte (Manager+0x2a37c, low byte of
   manager_stat_flag) is set, the host captured the walk blob
   (hud_stat_walk_blob_ready == 1), and the player vector count
   ((end-begin)>>2, the PE `sar eax,2` at 0x84c1be) is in [1, 8]:
   count==0 is the v83 walk-empty countdown lane (dispatched before this
   one), count>8 keeps the host residual. The PE runs the walk once per
   record call (1 call every pass at 0x006fb3b8, a second only on the
   postUpdateDelay>0 early-return path at 0x006fb3d0), so the model calls
   init once (inputs -> scratch, full walk) and tick once per additional
   record call (full walk from the post-first-call scratch); the scratch
   then holds the exact post-walk values for the residual consumer. */
static bool hud_stat_walk_lane_active(
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs) {
  if ((runtime_inputs->manager_stat_flag & 0xffu) == 0u) return false;
  if (runtime_inputs->hud_stat_walk_blob_ready != 1u) return false;
  const int32_t begin =
      static_cast<int32_t>(runtime_inputs->hud_stat_player_list_begin);
  const int32_t end =
      static_cast<int32_t>(runtime_inputs->hud_stat_player_list_end);
  const int32_t count = (end - begin) >> 2;
  return count >= 1 && count <= ISAAC_HUD_STAT_WALK_MAX_PLAYERS;
}

/* PE 0x84bf30 (slot get-or-insert). Args: the entry pack, the Manager
   container bounds (predA gate), and the two slot ptr words (read + the
   insert store). Returns the slot index 0/1 or -1, with the exact reject
   order of the disasm:
     container non-empty && predA == 0        -> -1 (0x84bf58 je)
     f2c   != 0                               -> -1 (0x84bf5c jne)
     f3bc  != 0                               -> -1 (0x84bf62 jne)
     f13c0 == 0x28                            -> -1 (0x84bf6b je)
     predB != 0 (TRUE-PURE 0x7db700)          -> -1 (0x84bf7b jne)
   then the 2-slot search (stride 0xcc at StatHUD+0x114): match on the
   entry token pack->ptr (the player pointer VALUE the PE derefs from
   begin[i]) returns the slot without a store; otherwise the first free
   slot receives the only store (insert of pack->ptr). */
static int32_t hud_stat_walk_slot_get_or_insert(
    const IsaacGameUpdateSliceHudStatPlayerPack* pack,
    uint32_t container_begin, uint32_t container_end, uint32_t* slot_ptr_0,
    uint32_t* slot_ptr_1) {
  if (container_begin != container_end && pack->predA == 0u) return -1;
  if (pack->f2c != 0u) return -1;
  if (pack->f3bc != 0u) return -1;
  if (pack->f13c0 == 0x28u) return -1;
  /* predB = 0x7db700 (TRUE-PURE, 16 insns, zero stores/calls). The PE's
     `other != entry` identity clause compares the packed opaque otherPtr
     against the entry token pack->ptr (the player pointer VALUE); the
     clause is LIVE in the pure lane. The rest of the conjunction is
     exact. */
  const bool pred_b =
      (pack->f172 != 0u) &&
      (pack->f13c0 == 0x1du || pack->f13c0 == 0x26u) &&
      (pack->otherPtr != 0u) &&
      (pack->otherPtr != pack->ptr) &&
      (pack->other161c != 0xffffffffu) && /* != -1 (signed) */
      ((int32_t)pack->other161c < (int32_t)pack->f161c);
  if (pred_b) return -1;
  const uint32_t entry_identity = pack->ptr;
  int32_t free_slot = -1;
  for (int32_t s = 0; s < 2; ++s) {
    const uint32_t p = s == 0 ? *slot_ptr_0 : *slot_ptr_1;
    if (p == entry_identity) return s;
    if (p == 0u && free_slot < 0) free_slot = s;
  }
  if (free_slot < 0) return -1;
  /* Insert (the only store of 0x84bf30, at 0x84bfb5). */
  if (free_slot == 0) {
    *slot_ptr_0 = entry_identity;
  } else {
    *slot_ptr_1 = entry_identity;
  }
  return free_slot;
}

/* One masked tween application. Reads current/prev/timer from the chained
   slot state, consumes the frozen v18 isaac_playerhud_stat_bar_tween BY
   REFERENCE, and writes current/delta/prev/timer back. The tween's write
   set is branch-dependent: the equal fast-path (0x84d737) writes ONLY
   current, so delta/prev/timer keep their pre-call values — seed the temp
   from the slot state first, then copy the whole temp back (the
   residual-host apply semantics; same pattern as the 84e9d0 wrapper).
   An unseeded temp copies stack garbage on the equal path. */
static void hud_stat_walk_tween(uint32_t* slot_state, uint32_t current_bits,
                                uint32_t prev_bits, uint32_t threshold_bits,
                                int32_t timer, uint32_t target_bits,
                                uint32_t mode) {
  IsaacPlayerHudStatBarTweenState out;
  out.current_bits = current_bits;
  out.delta_bits = slot_state[1];
  out.prev_bits = prev_bits;
  out.timer = timer;
  isaac_playerhud_stat_bar_tween(&out, current_bits, prev_bits,
                                 threshold_bits, timer, target_bits, mode);
  slot_state[0] = out.current_bits;
  slot_state[1] = out.delta_bits;
  slot_state[2] = out.prev_bits;
  slot_state[3] = (uint32_t)out.timer;
}

/* PE 0x84ca00 (RecomputeStats-style per-player recompute) at the walk site,
   mask CONSTANT 0xfffffeff (pushed at 0x84c1f6; bit 0x100 clear -> the
   k=8 tween is skipped). The 9 masked tween calls (k=0..7,9) run on
   DISTINCT k-slots of row idx (StatHUD+0x118+idx*0xcc+0x14k): each tween
   reads ONLY its own k-slot's pre-call state and writes back its own
   current/delta/prev/timer — tweens NEVER chain across k (k=8's slot is
   untouched by the walk). Slot-state words in the scratch:
   base = 3 + (idx*10+k)*4: current(+0), delta(+1), prev(+2), timer(+3);
   threshold is host-owned and read per (row, k) from the runtime inputs;
   the owner byte (scratch[0]) selects the k=6 target formula. */
static uint32_t* hud_stat_walk_slot_state(uint32_t* scratch, int32_t idx,
                                          int32_t k) {
  return scratch + 3 + (idx * 10 + k) * 4;
}

static void hud_stat_walk_recompute_stats(
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs,
    const IsaacGameUpdateSliceState* state, uint32_t* scratch,
    const IsaacGameUpdateSliceHudStatPlayerPack* pack, int32_t idx,
    IsaacGameUpdateSliceEvents* events) {
  if (idx < 0 || idx > 1) return;
  /* PE 0x84ca13 imul edi, eax, 0xcc: per-player ROW STRIDE (geometry law;
     the 83-word scratch abstracts the memory layout, so the decision is
     lawed + probed, not folded into the scratch index math). */
  (void)isaac_game_update_slice_hud_stat_recompute_row_stride((uint32_t)idx);
  /* PE 0x84ca19..0x84ca22 test edx,edx / je 0x84cc34: the entry ptr
     [this+0x114] null gate — FULL-DWORD (a 0x100-wide entry pointer is
     valid; only exactly 0 skips the whole per-entry body). */
  if (!isaac_game_update_slice_hud_stat_recompute_entry_valid(
          scratch[1 + idx])) {
    return;
  }
  const uint32_t mask = 0xfffffeffu;
  /* PE 0x84ca28..0x84ca3f: flag = (i32[Game+0x264f8] - i32[entry+0x328]) > 1
     (setg, SIGNED). frameCounter264f8 is sparse state (offset 172), exact
     at step start. Decision law: isaac_game_update_slice_hud_stat_tail_
     recompute_mode (0x84ca3f). */
  const uint32_t mode = (uint32_t)isaac_game_update_slice_hud_stat_tail_recompute_mode(
      state->frame_counter_264f8, pack->f328);
  /* PE 0x84ca45..0x84cc11: per-k mask gates `test bl,N / je` (k6/k7 are
     JOINED at 0x84cb39 test bl,0xc0; k=8 at 0x84cbf0 test ebx,0x100; k=9
     at 0x84cc0b test ebx,0x200). Decision law: isaac_game_update_slice_
     hud_stat_recompute_slot_runs (FULL-dword mask, bit k set -> slot k
     tween runs). */
  if (isaac_game_update_slice_hud_stat_recompute_slot_runs(mask, 0)) {
    /* k=0 (slot +0x118): target = f32[entry+0x1568] */
    uint32_t* st = hud_stat_walk_slot_state(scratch, idx, 0);
    hud_stat_walk_tween(st, st[0], st[2],
                        __builtin_bit_cast(
                            uint32_t, runtime_inputs->hud_stat_slots[idx][0].threshold),
                        (int32_t)st[3], pack->f1568, mode);
  }
  if (isaac_game_update_slice_hud_stat_recompute_slot_runs(mask, 1)) {
    /* k=1 (+0x12c): 30.0f / (f32[entry+0x1460] + 1.0f) */
    uint32_t* st = hud_stat_walk_slot_state(scratch, idx, 1);
    const uint32_t target = __builtin_bit_cast(
        uint32_t,
        30.0f / (__builtin_bit_cast(float, pack->f1460) + 1.0f));
    hud_stat_walk_tween(st, st[0], st[2],
                        __builtin_bit_cast(
                            uint32_t, runtime_inputs->hud_stat_slots[idx][1].threshold),
                        (int32_t)st[3], target, mode);
  }
  if (isaac_game_update_slice_hud_stat_recompute_slot_runs(mask, 2)) {
    /* k=2 (+0x140): target = f32[entry+0x1470] */
    uint32_t* st = hud_stat_walk_slot_state(scratch, idx, 2);
    hud_stat_walk_tween(st, st[0], st[2],
                        __builtin_bit_cast(
                            uint32_t, runtime_inputs->hud_stat_slots[idx][2].threshold),
                        (int32_t)st[3], pack->f1470, mode);
  }
  if (isaac_game_update_slice_hud_stat_recompute_slot_runs(mask, 3)) {
    /* k=3 (+0x154): target = f32[entry+0x1480] / 40.0f */
    uint32_t* st = hud_stat_walk_slot_state(scratch, idx, 3);
    const uint32_t target = __builtin_bit_cast(
        uint32_t, __builtin_bit_cast(float, pack->f1480) / 40.0f);
    hud_stat_walk_tween(st, st[0], st[2],
                        __builtin_bit_cast(
                            uint32_t, runtime_inputs->hud_stat_slots[idx][3].threshold),
                        (int32_t)st[3], target, mode);
  }
  if (isaac_game_update_slice_hud_stat_recompute_slot_runs(mask, 4)) {
    /* k=4 (+0x168): target = f32[entry+0x1464] */
    uint32_t* st = hud_stat_walk_slot_state(scratch, idx, 4);
    hud_stat_walk_tween(st, st[0], st[2],
                        __builtin_bit_cast(
                            uint32_t, runtime_inputs->hud_stat_slots[idx][4].threshold),
                        (int32_t)st[3], pack->f1464, mode);
  }
  if (isaac_game_update_slice_hud_stat_recompute_slot_runs(mask, 5)) {
    /* k=5 (+0x17c): target = f32[entry+0x156c] */
    uint32_t* st = hud_stat_walk_slot_state(scratch, idx, 5);
    hud_stat_walk_tween(st, st[0], st[2],
                        __builtin_bit_cast(
                            uint32_t, runtime_inputs->hud_stat_slots[idx][5].threshold),
                        (int32_t)st[3], pack->f156c, mode);
  }
  if (isaac_game_update_slice_hud_stat_recompute_slot_runs(mask, 6) ||
      isaac_game_update_slice_hud_stat_recompute_slot_runs(mask, 7)) {
    /* 0x84cb39 test bl,0xc0: BOTH bits gate together (k6 + k7 run as one
       block); slot_runs(6) | slot_runs(7) == (mask & 0xc0) != 0. */
    /* Typed host events (coordinator-merged @920/924/928): the three probe
       BODIES ran at the seam — 1 per k6/k7-arm entry, all together
       (mirrors the JS oracle's +1s in this same block). */
    events->hud_stat_walk_probe1 += 1u;
    events->hud_stat_walk_probe2 += 1u;
    events->hud_stat_walk_probe3 += 1u;
    /* ---- ABI v101/102 (wave update-v100-record0-islands + wave
       update-v102-record0-wire): the walker's PURE islands — the
       row-head decisions of the 0x84cc40 body BEFORE the probe chain.
       v101 (void)-lawed all four BY REFERENCE (walker stays host). v102
       COMMITS the capture lanes (hud_stat_walker_player_a/b @14276/
       @14280, b_frame328 @14284, probe1_arg @14288) and wires the law
       calls with the LIVE lane values — pass-through per the v101
       bit-identical contract (the lane values do NOT change the seam
       outputs; only the walker-side descriptions become live, evented
       @956/960/964 below). */
    /* Swap-gate [block+0x114] row-arm (0x84cc9d cmp eax,[ebx+8] /
       0x84cca0 jne 0x84d659 + 0x84d659 cmp eax,edx / 0x84d65b jne):
       entry == A -> arm 1 (swap-to-B store @0x84cca6 + the inline
       RESET/TWEEN body), entry == B -> arm 2 (swap-back @0x84d666 + the
       0x84d66d seam call), else 0 (loop tail, row untouched). The entry
       arg IS the module's row slot (scratch[1 + idx] — the walker's
       [edi+esi+0x114] for the same row); A/B are the COMMITTED lanes
       hud_stat_walker_player_a/b @14276/@14280 (the v101 NULL
       stand-ins replaced; the arm is evented @960 below — the seam
       outputs stay bit-identical, pass-through). */
    const uint32_t walker_a = runtime_inputs->hud_stat_walker_player_a;
    const uint32_t walker_b = runtime_inputs->hud_stat_walker_player_b;
    const int32_t walker_arm = isaac_game_update_slice_hud_stat_walker_row_arm(
        scratch[1 + idx], walker_a, walker_b);
    (void)walker_arm; /* pass-through — evented @960 below */
    /* RESET/TWEEN split at the walker's site (0x84ccbd..0x84ccd1):
       flag [ebp-1] = (i32[Game+0x264f8] - i32[B+0x328]) > 1 ? TWEEN :
       RESET (0x84ccc8 sub / 0x84ccce cmp eax,1 / 0x84ccd1 jg 0x84ce1b) —
       the SEAM head formula hud_stat_tail_recompute_mode RE-DERIVED on
       the walker's own B (swap-in) frame word; the flag selects the
       k6/k7/k8/k9 fast-vs-full paths. The frame is the module's sparse
       state; B's word is the COMMITTED lane hud_stat_walker_b_frame328
       @14284 (the v101 0 stand-in replaced). */
    (void)isaac_game_update_slice_hud_stat_walker_reset_split(
        state->frame_counter_264f8, runtime_inputs->hud_stat_walker_b_frame328);
    /* Walker k6 call-site dispatch (0x84d18e/0x84d1b6/0x84d1c7): the
       0x84cc40 walker selects the same three probe leaves in FIXED order
       with NO mask gate (its inline block has no test bl,0xc0 twin — the
       mask arg is ignored by the law; the seam's joined gate is the
       slot_runs(6)|slot_runs(7) check above). BY-REFERENCE description
       of the host walker (the probe1 ARG read [Game+0x18300] is lawed as
       hud_stat_walker_probe1_arg (void) below; the live value stays
       host). */
    (void)isaac_game_update_slice_hud_stat_walker_k6_probe_leaf_va(mask, 0);
    (void)isaac_game_update_slice_hud_stat_walker_k6_probe_leaf_va(mask, 1);
    (void)isaac_game_update_slice_hud_stat_walker_k6_probe_leaf_va(mask, 2);
    /* The walker's 4 direct E8 leaves' call ORDER (0x84d18e -> PROBE1,
       0x84d1b6 -> PROBE2, 0x84d1c7 -> PROBE3, then 0x84d66d -> the
       RecomputeStats seam 0x84ca00 LAST — swap-back rows only): decision
       law isaac_game_update_slice_hud_stat_walker_e8_call_order, pinned
       per position (completes the v98 site-dispatch law with the seam as
       E8 #4). */
    (void)isaac_game_update_slice_hud_stat_walker_e8_call_order(0u);
    (void)isaac_game_update_slice_hud_stat_walker_e8_call_order(1u);
    (void)isaac_game_update_slice_hud_stat_walker_e8_call_order(2u);
    (void)isaac_game_update_slice_hud_stat_walker_e8_call_order(3u);
    /* The probe1 ARG read [Game+0x18300] (0x84d188 mov ecx,[eax+
       0x18300] — the game ROOM ptr word, ABI v67 pinned to 0 in the
       sparse lanes; seam twin 0x84cb47, PM swap-body twin 0x9bf31f):
       FULL-DWORD transfer into ecx for the host leaf 0x7f92b0 — no byte
       gate (law isaac_game_update_slice_hud_stat_walker_probe1_arg; the
       COMMITTED lane hud_stat_walk_probe1_arg @14288 — the v101 0
       operand replaced; the live value stays host, the law describes
       the transfer). */
    (void)isaac_game_update_slice_hud_stat_walker_probe1_arg(
        runtime_inputs->hud_stat_walk_probe1_arg);
    /* Clamp + probe2-live zeroing = the walker's probe chain law
       isaac_game_update_slice_hud_stat_walker_probe1_clamped
       (0x84d199..0x84d1c2; the seam twin 0x84cb5b..0x84cb7e is
       byte-identical in gates, so the k6/k7 block consumes the law on
       both sites): maxss(probe1, 0.0) THEN minss(x, 1.0) — NaN -> 0.0
       (maxss returns the SECOND operand on NaN) — then the probe2 BOOL
       LOW-BYTE gate @0x84d1bb zeroing the clamped value (xorps
       @0x84d1c2). Oracle parity: cpp + JS call the same law. */
    const float clamped = __builtin_bit_cast(
        float, isaac_game_update_slice_hud_stat_walker_probe1_clamped(
                   runtime_inputs->hud_stat_walk_probe1,
                   runtime_inputs->hud_stat_walk_probe2));
    const float probe3 =
        __builtin_bit_cast(float, runtime_inputs->hud_stat_walk_probe3);
    /* k=6 (+0x190): owner byte branch at 0x84cba1; the PE's `movss xmm4,
       100.0` at 0x84cb31 loads the scale for both arms. The seam READ is
       the PE 0x84cba1 `cmp byte ptr [esi+0x2ac],0 / je` — LOW-BYTE over
       the stored owner byte (decision law isaac_game_update_slice_hud_stat_
       recompute_owner_byte; WIDE 0x100 -> 0, unlike the tail's FULL-dword
       owner_mode STORE law). The formula consumes the seeded scratch[0]
       (owner_mode bool — the pinned store contract; the two agree on real
       0/1 captures), so the seam decision stays lawed + probed here. */
    (void)isaac_game_update_slice_hud_stat_recompute_owner_byte(
        runtime_inputs->hud_stat_owner_byte);
    const uint32_t k6_target =
        scratch[0] != 0u
            ? __builtin_bit_cast(uint32_t, clamped * 100.0f)
            : __builtin_bit_cast(uint32_t,
                                 (1.0f - probe3) * clamped * 100.0f);
    /* Typed walker probe events (ABI v102; twins of the seam trio
       @920/924/928 — the walker's probe calls are NOT counted by the
       seam counters): hud_stat_walker_probe1 @956 = REACHED (+1 per
       walker k6/k7-arm entry), hud_stat_walker_probe2 @960 = the
       swap-gate row-ARM value (1/2/0 from the live A/B lanes),
       hud_stat_walker_probe3 @964 = the walker-site probe-K6 target
       bits. Fired ONLY when the walker capture is LIVE (a real PM swap
       captured A/B — player_a|player_b != 0); lanes all-zero (capture
       absent) keeps the residual byte-for-byte (events stay 0). The
       seam outputs (the tween slot states) are NOT affected — the lane
       drive is observable through the events only. */
    if (walker_a != 0u || walker_b != 0u) {
      events->hud_stat_walker_probe1 += 1u;
      events->hud_stat_walker_probe2 = (uint32_t)walker_arm;
      events->hud_stat_walker_probe3 = k6_target;
    }
    uint32_t* st6 = hud_stat_walk_slot_state(scratch, idx, 6);
    hud_stat_walk_tween(st6, st6[0], st6[2],
                        __builtin_bit_cast(
                            uint32_t, runtime_inputs->hud_stat_slots[idx][6].threshold),
                        (int32_t)st6[3], k6_target, mode);
    /* k=7 (+0x1a4): target = probe3 * clamped * 100.0f (0x84cbd4..0x84cbeb). */
    /* The 0x84cc40 walker's INLINE k7 (0x84d4c7 mode-0 / 0x84d280
       mode-1) DIVERGES on the owner arm: owner ? clamped*100 :
       probe3*clamped*100 (decision law isaac_game_update_slice_hud_stat_
       walker_k7_target, owner LOW-BYTE @0x84d1cc) — the S2 caveat's true
       home, unobservable on real captures (probe3 == 1.0 there). Lawed
       BY-REFERENCE on the same inputs, never folded into the seam
       formula below (row_stride precedent). */
    (void)isaac_game_update_slice_hud_stat_walker_k7_target(
        runtime_inputs->hud_stat_owner_byte, runtime_inputs->hud_stat_walk_probe3,
        __builtin_bit_cast(uint32_t, clamped));
    /* The swap BACK store semantics (0x84d659..0x84d698): on arm 2 the
       row is re-pointed at A (0x84d666 mov [edi+esi+0x114],eax) BEFORE
       the 0x84d66d seam call — the seam then re-derives mode from A.f328
       under mask -1 (E8 #4, lawed hud_stat_walker_e8_call_order). The
       store VALUE law (arm 1 -> B @0x84cca6, arm 2 -> A @0x84d666, else
       the row keeps its entry) is isaac_game_update_slice_hud_stat_
       walker_swap_store; the arm + A/B are LIVE (the row_arm result +
       the committed lanes @14276/14280 — the v101 (0u, 0u, 0u)
       stand-ins replaced). Pass-through: the row slot is NOT written
       here — the seam path stays bit-identical; the store value is the
       walker-side description (evented @960 as the arm). */
    (void)isaac_game_update_slice_hud_stat_walker_swap_store(
        (uint32_t)walker_arm, scratch[1 + idx], walker_a, walker_b);
    const uint32_t k7_target =
        __builtin_bit_cast(uint32_t, probe3 * clamped * 100.0f);
    uint32_t* st7 = hud_stat_walk_slot_state(scratch, idx, 7);
    hud_stat_walk_tween(st7, st7[0], st7[2],
                        __builtin_bit_cast(
                            uint32_t, runtime_inputs->hud_stat_slots[idx][7].threshold),
                        (int32_t)st7[3], k7_target, mode);
  }
  /* k=8 (+0x1b8): target = 0.0f. The WALK-SITE mask arm (0x84cbf0
     test ebx,0x100 / je): the walk site's residue mask 0xfffffeff has
     bit 8 clear -> SKIPPED here; the 0x84cc40 walker site 0x84d66d
     pushes -1 (0xffffffff) -> RUNS (decision law isaac_game_update_
     slice_hud_stat_walk_site_k8_skipped; exact complement of
     slot_runs(mask, 8)). */
  if (!isaac_game_update_slice_hud_stat_walk_site_k8_skipped(mask)) {
    uint32_t* st = hud_stat_walk_slot_state(scratch, idx, 8);
    hud_stat_walk_tween(st, st[0], st[2],
                        __builtin_bit_cast(
                            uint32_t, runtime_inputs->hud_stat_slots[idx][8].threshold),
                        (int32_t)st[3], 0u, mode);
  }
  if (isaac_game_update_slice_hud_stat_recompute_slot_runs(mask, 9)) {
    /* k=9 (+0x1cc): f32[Game+0x1adb4] * 100.0f */
    uint32_t* st = hud_stat_walk_slot_state(scratch, idx, 9);
    const uint32_t target = __builtin_bit_cast(
        uint32_t,
        __builtin_bit_cast(float, runtime_inputs->hud_stat_game_1adb4) *
            100.0f);
    hud_stat_walk_tween(st, st[0], st[2],
                        __builtin_bit_cast(
                            uint32_t, runtime_inputs->hud_stat_slots[idx][9].threshold),
                        (int32_t)st[3], target, mode);
  }
}

/* The full walk + tail countdown, operating on the CURRENT scratch state
   (pre-seeded on the first record call; the post-walk scratch on the
   second). Mirrors PE 0x84c1b7..0x84c2b0: derive the player count, walk
   each entry through slot get-or-insert, recompute the stats for acquired
   slots, then the tail countdown ticks all 20 published slot timers. The
   clamp/fatal host edges of the PE loop (0x84c1d3..0x84c1ee) are proven
   structurally dead (count re-derived per iteration, write-free closure) —
   omitted per the contract. */
static void hud_stat_walk_run(
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs,
    const IsaacGameUpdateSliceState* state,
    IsaacGameUpdateSliceEvents* events) {
  const int32_t begin =
      static_cast<int32_t>(runtime_inputs->hud_stat_player_list_begin);
  const int32_t end =
      static_cast<int32_t>(runtime_inputs->hud_stat_player_list_end);
  const int32_t count = (end - begin) >> 2;
  for (int32_t i = 0; i < count && i < ISAAC_HUD_STAT_WALK_MAX_PLAYERS; ++i) {
    /* PE 0x84c1c5..0x84c1da: the per-iteration re-derived count gate — the
       fatal log 0xa112c0 (level 0x10, fmt 0xb7e6bc) fires iff the
       re-derivation is zero (decision law isaac_game_update_slice_hud_stat_
       tail_fatal_empty; typed host event hudStatWalkFatalEmpty). The
       capture is static and the lane gate requires count in [1,8], so this
       is provably 0 in-lane — the arm is host-mutation-only (a host probe
       body shrinking the live registry [0xc71678]+0x1baa8 between the
       outer and inner checks). */
    (void)isaac_game_update_slice_hud_stat_tail_fatal_empty((uint32_t)count);
    const IsaacGameUpdateSliceHudStatPlayerPack* pack =
        &runtime_inputs->hud_stat_players[i];
    const int32_t idx = hud_stat_walk_slot_get_or_insert(
        pack, runtime_inputs->hud_stat_container_begin,
        runtime_inputs->hud_stat_container_end, &scratch_hud_stat_walk[1],
        &scratch_hud_stat_walk[2]);
    if (idx >= 0) {
      hud_stat_walk_recompute_stats(runtime_inputs, state,
                                    scratch_hud_stat_walk, pack, idx, events);
    }
  }
  /* Tail countdown (PE 0x84c224..0x84c2b0): the 20 counters ARE the tween
     timers — tween k of row g at StatHUD+0x118+g*0xcc+0x14k, timer at
     +0x10 = StatHUD+0x128+g*0xcc+0x14k = counter (g,k). The scratch
     publishes every slot timer (word 3+(g*10+k)*4+3); signed `jle` skip
     law: v > 0 decrements, <= 0 untouched (k=8's timer ticks here even
     though its tween is skipped by the mask). */
  for (int32_t s = 0; s < ISAAC_HUD_STAT_WALK_SLOT_COUNT; ++s) {
    const int32_t timer_word = 3 + s * 4 + 3;
    const int32_t v = (int32_t)scratch_hud_stat_walk[timer_word];
    if (v > 0) scratch_hud_stat_walk[timer_word] = (uint32_t)(v - 1);
  }
}

static void maybe_hud_stat_walk_init(
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs,
    const IsaacGameUpdateSliceState* state,
    IsaacGameUpdateSliceEvents* events) {
  if (!hud_stat_walk_lane_active(runtime_inputs)) return;
  /* Seed the scratch from the walk blob (the first record call): owner byte
     booled as the PE `setne` store (decision law isaac_game_update_slice_
     hud_stat_tail_owner_mode, 0x84c1a6), pre-walk slot ptrs, and all 20
     tween k-slot states with delta = 0 (write-only in the PE, never read). */
  scratch_hud_stat_walk[0] =
      (uint32_t)isaac_game_update_slice_hud_stat_tail_owner_mode(
          runtime_inputs->hud_stat_owner_byte);
  scratch_hud_stat_walk[1] = runtime_inputs->hud_stat_slot_ptr_0;
  scratch_hud_stat_walk[2] = runtime_inputs->hud_stat_slot_ptr_1;
  for (int32_t s = 0; s < ISAAC_HUD_STAT_WALK_SLOT_COUNT; ++s) {
    const int32_t g = s / 10;
    const int32_t k = s % 10;
    uint32_t* const st = scratch_hud_stat_walk + 3 + s * 4;
    st[0] = __builtin_bit_cast(uint32_t,
                               runtime_inputs->hud_stat_slots[g][k].current);
    st[1] = 0u;
    st[2] = __builtin_bit_cast(uint32_t,
                               runtime_inputs->hud_stat_slots[g][k].prev);
    st[3] = (uint32_t)runtime_inputs->hud_stat_slots[g][k].timer;
  }
  hud_stat_walk_run(runtime_inputs, state, events);
}

static void maybe_hud_stat_walk_tick(
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs,
    const IsaacGameUpdateSliceState* state,
    IsaacGameUpdateSliceEvents* events) {
  /* The lane condition is step-constant (all inputs are runtime captures),
     so the second record call re-runs the full walk from the first call's
     post-walk scratch (slot ptrs and states). An inactive step leaves the
     scratch at its step-reset zeros. */
  if (!hud_stat_walk_lane_active(runtime_inputs)) return;
  hud_stat_walk_run(runtime_inputs, state, events);
}

/* ---- ABI v95 (wave update-v96-record0-tail): record-0 StatHUD tail
   DECISION laws. The tail is the 0x84c170 controller (called at 0x009a2bb2
   from HUD::PostUpdate, receiver StatHUD). Every branch of
   0x84c170..0x84c2b9 is now an in-module pure decision; the two host edges
   are typed: the FCO owner capture (hud_stat_owner_byte @4632, host
   0x9be080) and the fatal logger 0xa112c0 (tail site 0x84c1da, named typed
   event hudStatWalkFatalEmpty, coordinator-merged). Census this unit:
   0x84ca00 3 callers (only 0x84c206 on the record-0 path; 0x84d66d lives in
   the 0x84cc40 tween walker [callers 0x9bef23/0x9bf3d3], 0x9a8b5e in
   0x9a8970 — both outside record 0); 0x9be080 174 callers; 0xa112c0 3286
   callers image-wide; 0xaef15c sized-free 3702 callers image-wide and ZERO
   inside the tail closure (0x84c170/0x84bf30/0x84ca00/0x9be080) — the
   sized-free edge is REFUTED for the tail. */

/* PE 0x84c1cf `test eax,eax / jne 0x84c1e5`: the per-iteration re-derived
   registry count (end-begin)>>2 is FULL-DWORD tested; zero fires the fatal
   log 0xa112c0 (level 0x10, fmt 0xb7e6bc = the GetPlayer no-players
   message "PlayerManager::GetPlayer() : There are no players! \n",
   verified .rdata read — NOT "Gamestate corrupted or has new data!"
   (that string lives at 0x77f4bd rva, used by other sites)). In the static
   blob lane the count is invariant and the lane gate
   requires 1..8, so the typed host event NEVER fires in-lane; the decision
   stays lawed in-module (host-mutation-only arm). WIDE drivable: only
   count == 0 fires (0x100/0xffffffff do NOT). */
extern "C" int32_t isaac_game_update_slice_hud_stat_tail_fatal_empty(
    uint32_t count) {
  return (count == 0u) ? 1 : 0;
}

/* PE 0x84c1a6 `test eax,eax / setne al`: the FCO (0x9be080) result pointer
   truthiness is FULL-DWORD; the byte stored to StatHUD+0x2ac is the setne
   bool, which also selects the k=6 tween target formula (0x84cba1). WIDE
   drivable: 0x100/0xffffffff -> 1 (a nonzero pointer), only 0 -> 0. */
extern "C" int32_t isaac_game_update_slice_hud_stat_tail_owner_mode(
    uint32_t owner_word) {
  return (owner_word != 0u) ? 1 : 0;
}

/* PE 0x84ca28..0x84ca3f (RecomputeStats head): flag = (i32[Game+0x264f8] -
   i32[entry+0x328]) SIGNED-diff, `cmp eax,1 / setg al` -> mode arg of all 11
   tween calls. WIDE drivable: entry_frame 0x80000000 (F328) with game frame
   0 -> negative diff -> mode 0 (an unsigned compare would return 1). */
extern "C" int32_t isaac_game_update_slice_hud_stat_tail_recompute_mode(
    uint32_t game_frame_264f8, uint32_t entry_frame_328) {
  const int32_t diff =
      (int32_t)((uint32_t)game_frame_264f8 - (uint32_t)entry_frame_328);
  return (diff > 1) ? 1 : 0;
}

/* ---- ABI v95 (wave update-v96-record0-tween): the RecomputeStats
   0x84ca00 SEAM decision laws. The seam = the shared per-entry body called
   from ALL THREE 0x84ca00 sites — the record-0 walk site 0x84c206 (mask
   0xfffffeff), the per-frame tween walker 0x84cc40 site 0x84d66d (mask
   0xffffffff, player_index == dead == loop index i), and 0x9a8b5e in
   0x9a8970 (mask 0xfffffeff). The walker's own GATE/PLAN laws stay with
   the playerhud family (ABI v33 isaac_playerhud_84cc40_*, consumed BY
   REFERENCE — never re-transcribed). Census this unit: 0x84cc40 has 4
   direct E8 = the three host probe leaves 0x7f92b0 (0x84d18e) / 0x749830
   (0x84d1b6) / 0x7f96f0 (0x84d1c7) + 0x84d66d -> 0x84ca00 (the walker
   INLINES the v18 tween arithmetic, it never calls 0x84d6b0); 0x84ca00
   has 14 direct E8 = 11x 0x84d6b0 (v18 tween, landed) + the three host
   leaves 0x7f92b0 (PROBE1 f32 via x87 ST0) / 0x749830 (PROBE2 BOOL in AL)
   / 0x7f96f0 (PROBE3 f32 via XMM0) — named typed events
   hudStatWalkProbe1/2/3 (coordinator-merged, offset -1, 1 per k6/k7-arm
   entry). The walker's inline k7 target DIFFERS from the seam on the
   owner path (walker: clamped*100; seam: probe3*clamped*100 uncondition-
   ally — the 0x84cbd4..0x84cbdd recompute) — host-side quirk, unobservable
   on real captures (probe3 1.0); the seam formula is exact for record 0.
   Sized-free 0xaef15c stays REFUTED for the closure (0 in
   0x84ca00/0x84cc40). */

/* PE 0x84ca13 `imul edi, eax, 0xcc` (also 0x84cc90 in the walker loop):
   the per-player ROW STRIDE over StatHUD's double block. u32 wrap
   multiply; the 0xcc constant is the mutant target. */
extern "C" uint32_t isaac_game_update_slice_hud_stat_recompute_row_stride(
    uint32_t entry_index) {
  return entry_index * 0xccu;
}

/* PE 0x84ca19..0x84ca22 `mov edx,[edi+esi+0x114]; test edx,edx; je
   0x84cc34`: the per-entry ENTRY PTR null gate is FULL-DWORD — a wide
   pointer token (0x100/0xffffffff) is valid, only exactly 0 skips the
   per-entry body. */
extern "C" int32_t isaac_game_update_slice_hud_stat_recompute_entry_valid(
    uint32_t entry_ptr) {
  return (entry_ptr != 0u) ? 1 : 0;
}

/* PE 0x84ca45..0x84cc11: the per-k FLAGS BITMASK gates (`test bl,1/2/4/8/
   0x10/0x20` k=0..5, `test bl,0xc0` k6/k7 JOINED at 0x84cb39, `test ebx,
   0x100` k=8 at 0x84cbf0, `test ebx,0x200` k=9 at 0x84cc0b). bit k set ->
   k-slot tween runs. k is masked to 0x1f (the PE tests FIXED bit
   positions; the guard keeps the shift well-defined for any word). The
   k6/k7 joined gate is slot_runs(6) | slot_runs(7) == (flags & 0xc0)
   != 0. */
extern "C" int32_t isaac_game_update_slice_hud_stat_recompute_slot_runs(
    uint32_t flags, uint32_t k) {
  const uint32_t bit = 1u << (k & 0x1fu);
  return ((flags & bit) != 0u) ? 1 : 0;
}

/* PE 0x84cba1 `cmp byte ptr [esi+0x2ac], 0 / je 0x84cbba`: the FCO-flag
   READ-BACK is a LOW-BYTE test of the stored owner byte (the tail's
   0x84c1a6 owner_mode law is the FULL-DWORD setne STORE of the FCO
   pointer; the seam reads the STORED byte). WIDE drivable: 0x100 -> 0
   here, but 0x100 -> 1 in owner_mode — the byte-vs-dword contrast is the
   mutant target. On real captures (the byte is 0/1) the two agree. */
extern "C" int32_t isaac_game_update_slice_hud_stat_recompute_owner_byte(
    uint32_t owner_byte) {
  return ((owner_byte & 0xffu) != 0u) ? 1 : 0;
}

/* PE 0x84cb7a `test al, al / jne 0x84cb86` (PROBE2 0x749830 returns its
   BOOL in AL; the walker twin site is 0x84d1bb): the LOW BYTE decides
   whether the clamp is zeroed (xorps @0x84cb7e -> clamped = 0.0). WIDE
   drivable: 0x100 -> 0 (a full-dword test would wrongly keep the clamp),
   0x80/0x1ff/0xffffffff -> 1. Landed at record-0's final assessment so
   every decision of the k6/k7 block is a named law (block gate
   slot_runs(6)|slot_runs(7), AL-byte gate probe2_live, owner byte
   owner_byte, k7 formula pinned by test). */
extern "C" int32_t isaac_game_update_slice_hud_stat_recompute_probe2_live(
    uint32_t probe2_bits) {
  return ((probe2_bits & 0xffu) != 0u) ? 1 : 0;
}

/* ---- ABI v96 (wave update-v98-record0-walker): the 0x84cc40 walker's
   remaining PURE decisions (BY-REFERENCE host descriptions, record idx 0).
   The walker stays host (playerhud-family ABI v33 gate/plan); these laws
   name the pure decisions of its inline body reachable from the committed
   lanes: the walk-site mask arm (k=8 skip), the owner-mode k7 formula,
   and the k6 probe-leaf dispatch. All scalar params uint32. */

/* PE 0x84cbf0 `test ebx,0x100 / je 0x84cc0b` — the WALK-SITE mask arm:
   the 0xfffffeff pushed @0x84c1f6 survives 0x84bf30 (ret 4, thiscall +
   1 arg) as 0x84ca00's arg2 (arg3 is the phantom count, never read), so
   bit 8 clear -> the k=8 slot tween is SKIPPED at the record-0 walk site
   0x84c206. The 0x84cc40 walker site 0x84d66d pushes -1 -> k=8 RUNS.
   Bit-8 test over the FULL mask dword (the PE tests ebx whole): WIDE
   drivable — 0xffffff00 (bit 8 set in the high word) -> 0. */
extern "C" int32_t isaac_game_update_slice_hud_stat_walk_site_k8_skipped(
    uint32_t mask) {
  return ((mask & 0x100u) == 0u) ? 1 : 0;
}

/* The walker's INLINE k7 target (0x84d4c7 mode-0 via [ebp-8]=clamped*100
   / 0x84d280 mode-1 movaps xmm2,xmm1 on the owner arm; 0x84d31f..
   0x84d339 fast / 0x84d3d3..0x84d3ed full on the non-owner arm):
   owner ? clamped*100 : probe3*clamped*100 — the S2 caveat's true home
   (the SEAM k7 at 0x84cbd4..0x84cbdd is probe3*clamped*100
   UNCONDITIONAL, already lawed + pinned). Owner gate = 0x84d1cc
   `cmp byte [esi+0x2ac],0 / je` — LOW-BYTE (the same stored FCO byte
   the seam reads at 0x84cba1); f32 single-precision roundings per
   mulss. On real captures probe3 == 1.0 so the walker and seam
   formulas agree. Wired (void)-lawed in the k6/k7 block (row_stride
   precedent), never folded into the seam formula. */
extern "C" uint32_t isaac_game_update_slice_hud_stat_walker_k7_target(
    uint32_t owner_mode, uint32_t probe3_bits, uint32_t clamped_bits) {
  const float probe3 = __builtin_bit_cast(float, probe3_bits);
  const float clamped = __builtin_bit_cast(float, clamped_bits);
  const float target = ((owner_mode & 0xffu) != 0u)
                           ? clamped * 100.0f
                           : probe3 * clamped * 100.0f;
  return __builtin_bit_cast(uint32_t, target);
}

/* The walker's k6 call-site dispatch (0x84d18e / 0x84d1b6 / 0x84d1c7):
   site 0 -> 0x7f92b0 (PROBE1), site 1 -> 0x749830 (PROBE2), site 2 ->
   0x7f96f0 (PROBE3), else 0. The selection is MASK-FREE — the walker's
   inline block has NO twin of the seam's `0x84cb39 test bl,0xc0` joined
   gate (its mask -1 runs every slot per processed row), so the mask
   argument is deliberately ignored (the law pins that non-gate). Same
   fixed leaf order as the seam sites 0x84cb4d/0x84cb75/0x84cb86. */
extern "C" uint32_t isaac_game_update_slice_hud_stat_walker_k6_probe_leaf_va(
    uint32_t mask, uint32_t site_index) {
  (void)mask;
  if (site_index == 0u) return 0x7f92b0u;
  if (site_index == 1u) return 0x749830u;
  if (site_index == 2u) return 0x7f96f0u;
  return 0u;
}

/* ---- ABI v100 (wave update-v99-record0-walker): the 0x84cc40 walker
   body depth — the probe chain + the 4 direct E8 leaves' call ordering
   (record idx 0, BY-REFERENCE host descriptions; the walker stays host;
   zero layout bytes, ABI stays 96). All scalar params uint32. */

/* PE 0x84d199..0x84d1c2 — the walker's probe chain (the seam twin
   0x84cb5b..0x84cb7e is byte-identical in gates): fstp the PROBE1 x87
   result, maxss xmm0,[0xba9fe4] = max(x, 0.0f) THEN minss xmm0,
   [0xbaa454] = min(x, 1.0f) — maxss/minss return the SECOND operand on
   NaN, so probe1 NaN -> 0.0; then 0x84d1bb `test al,al / jne` —
   0x749830's BOOL is in AL, so the zeroing gate (xorps @0x84d1c2) is
   the LOW BYTE ONLY (`& 0xff`; WIDE 0x100 -> clamped 0.0). Composes the
   lawed isaac_game_update_slice_hud_stat_recompute_probe2_live; returns
   f32 bits. Wired as the k6/k7 block's clamped value (oracle parity —
   the JS mirror calls the same law). */
extern "C" uint32_t isaac_game_update_slice_hud_stat_walker_probe1_clamped(
    uint32_t probe1_bits, uint32_t probe2_bits) {
  float clamped = __builtin_bit_cast(float, probe1_bits);
  if (clamped != clamped) clamped = 0.0f; /* maxss(NaN, 0.0f) -> 0.0f */
  if (clamped < 0.0f) clamped = 0.0f;     /* maxss(x, 0.0f) */
  if (clamped > 1.0f) clamped = 1.0f;     /* minss(x, 1.0f) */
  if (!isaac_game_update_slice_hud_stat_recompute_probe2_live(probe2_bits)) {
    clamped = 0.0f; /* 0x84d1c2 xorps zero after the gate */
  }
  return __builtin_bit_cast(uint32_t, clamped);
}

/* The walker's 4 direct E8 leaves in CALL ORDER (0x84cc40 body census;
   the seam 0x84ca00 has 14 E8, the WALKER exactly 4): position 0 =
   0x84d18e -> 0x7f92b0 (PROBE1), 1 = 0x84d1b6 -> 0x749830 (PROBE2),
   2 = 0x84d1c7 -> 0x7f96f0 (PROBE3), 3 = 0x84d66d -> 0x84ca00 (the
   RecomputeStats seam — LAST of the four, and only on the swap-back row
   arm; the swap-to-B arm inlines everything). Else 0. Completes
   hud_stat_walker_k6_probe_leaf_va (v98) with the seam as E8 #4. */
extern "C" uint32_t isaac_game_update_slice_hud_stat_walker_e8_call_order(
    uint32_t position) {
  if (position == 0u) return 0x7f92b0u;
  if (position == 1u) return 0x749830u;
  if (position == 2u) return 0x7f96f0u;
  if (position == 3u) return 0x84ca00u;
  return 0u;
}

/* ---- ABI v101/102 (wave update-v100-record0-islands + wave
   update-v102-record0-wire): the 0x84cc40 walker's remaining lane-free
   PURE islands — the swap-gate row arm, the RESET/TWEEN split at the
   walker site, the swap-back store semantics, and the probe1-arg read
   (record idx 0, BY-REFERENCE host descriptions; the walker stays host).
   v101 landed the four laws (void)-lawed (zero layout bytes, ABI stays
   96); v102 COMMITS their inputs as runtime lanes
   (hud_stat_walker_player_a @14276 / player_b @14280 / b_frame328
   @14284 / probe1_arg @14288) and the k6/k7 block consumes the LIVE
   lane values (pass-through — the v101 bit-identical contract) with the
   walker probe typed events @956/960/964. All scalar params uint32. */

/* PEs 0x84cc9d `cmp eax,[ebx+8]` / 0x84cca0 `jne 0x84d659` (swap-gate)
   + 0x84d659 `cmp eax,edx` / 0x84d65b `jne 0x84d698` (swap-back check):
   FULL-DWORD compares of the row entry [StatHUD+i*0xcc+0x114] against
   the live swap args (arg1 = A = swap-out, arg2 = B = swap-in, pushed
   @0x9bef22/0x9bef09 and 0x9bf3cc/0x9bf3cb): entry == A -> arm 1
   (0x84cca6 store entry := B + the inline RESET/TWEEN body), entry == B
   -> arm 2 (0x84d666 store entry := A + the 0x84d66d RecomputeStats
   seam call), else 0 (loop tail, row untouched). A is checked before B
   (a == b == entry takes arm 1). Returns 0/1/2. */
extern "C" int32_t isaac_game_update_slice_hud_stat_walker_row_arm(
    uint32_t entry, uint32_t player_a, uint32_t player_b) {
  if (entry == player_a) return 1;
  if (entry == player_b) return 2;
  return 0;
}

/* PEs 0x84ccc8 `sub eax,[edx+0x328]` / 0x84ccce `cmp eax,1` /
   0x84ccd1 `jg 0x84ce1b` — the walker-site RESET/TWEEN split: the flag
   byte [ebp-1] (0 = RESET arm 0x84ccd7.., 1 = TWEEN arm 0x84ce1b..) is
   the SIGNED full-dword diff (i32[Game+0x264f8] - i32[B+0x328]) > 1.
   The formula is EXACTLY the lawed seam head
   isaac_game_update_slice_hud_stat_tail_recompute_mode (0x84ca28..
   0x84ca3f) re-derived at the walker's site on B's (swap-in) frame word
   — composed, not duplicated. WIDE drivable: B.f328 0x80000000 with
   frame 0 -> negative diff -> RESET (an unsigned compare would return
   TWEEN). Returns 1 (TWEEN) / 0 (RESET). */
extern "C" int32_t isaac_game_update_slice_hud_stat_walker_reset_split(
    uint32_t frame_counter_264f8, uint32_t b_frame328) {
  return isaac_game_update_slice_hud_stat_tail_recompute_mode(
      frame_counter_264f8, b_frame328);
}

/* The swap stores (arm 1: 0x84cca6 `mov [edi+esi+0x114],edx` = entry :=
   B; arm 2: 0x84d666 `mov [edi+esi+0x114],eax` = entry := A BEFORE the
   0x84d66d seam call — the seam then re-derives mode from A.f328 under
   mask -1; arm 0: no store, the row keeps its entry through the loop
   tail). The arm-1 store runs before the FULL-DWORD B==0 bail (0x84ccb5
   test edx,edx / je — a NULL B still leaves the row at NULL,
   self-healing next frame). Pure function of (row_arm, a, b) with the
   entry passthrough on the no-store arm; the row_arm law supplies the
   arm. Returns the entry value after the arm. */
extern "C" uint32_t isaac_game_update_slice_hud_stat_walker_swap_store(
    uint32_t row_arm, uint32_t entry, uint32_t player_a, uint32_t player_b) {
  if (row_arm == 1u) return player_b;
  if (row_arm == 2u) return player_a;
  return entry;
}

/* PE 0x84d188 `mov ecx,[eax+0x18300]` — the probe1 ARG read: the FULL
   dword at Game+0x18300 (the game ROOM ptr word — ABI v67 pinned to 0
   in the sparse lanes; read-site twins: seam 0x84cb47, PM swap body
   0x9bf31f [+0x1218 receiver]) is transferred WHOLE into ecx for the
   host leaf 0x7f92b0 (PROBE1 @0x84d18e). No byte gate, no narrowing —
   identity (the `& 0xff` truncation is the mutant bait). */
extern "C" uint32_t isaac_game_update_slice_hud_stat_walker_probe1_arg(
    uint32_t game_18300) {
  return game_18300;
}

void maybe_emit_hud_post_update(
    IsaacGameUpdateSliceState* state,
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs,
    IsaacGameUpdateSliceEvents* events) {
  const uint32_t mask = runtime_inputs->player_hud_occupied_mask;
  const int32_t history = runtime_inputs->manager_history_count;
  const uint8_t stat = static_cast<uint8_t>(runtime_inputs->manager_stat_flag & 0xffu);
  if (isaac_hud_post_update_try_pure(mask, history, stat) == 0) return;

  if ((mask & 0xffu) != 0u && runtime_inputs->player_hud_blob_ready != 0u) {
    for (int slot = 0; slot < ISAAC_PLAYER_HUD_MAX_SLOTS; ++slot) {
      if ((mask & (1u << slot)) == 0u) continue;
      const IsaacPlayerHudSlotPack* pack = &runtime_inputs->player_hud_slots[slot];

      /* P0 pure entry clear (flags only; hybrid applies to live PlayerHUD). */
      uint8_t heart_flags[ISAAC_PLAYERHUD_HEART_SLOT_COUNT];
      for (int i = 0; i < ISAAC_PLAYERHUD_HEART_SLOT_COUNT; ++i) heart_flags[i] = 1;
      isaac_playerhud_entry_clear_heart_byte1(heart_flags);

      /* H0 exact PlayerHUD::UpdateHearts @ 0x00841e20 — 1 or 2 calls. */
      const int32_t twin = isaac_playerhud_update_hearts_uses_twin(
          pack->twin_ptr, pack->player_type, pack->field_3bc);
      events->player_hud_update_hearts += twin != 0 ? 2u : 1u;

      /* P1 pure critical blink (uses Game frame counter). */
      scratch_player_hud_blink[slot] = isaac_playerhud_critical_heart_blink(
          pack->hearts_sum, static_cast<uint8_t>(pack->flag_1519 & 0xffu),
          pack->tramp_suppress, state->frame_counter_264f8);

      /* P2 pure active-slot countdown → dirty feeds notify. */
      IsaacPlayerHudActiveCountdownState* active = &scratch_player_hud_active[slot];
      active->slots[0] = pack->active0;
      active->slots[1] = pack->active1;
      active->slots[2] = pack->active2;
      active->slots[3] = pack->active3;
      const int32_t dirty = isaac_playerhud_active_slot_countdown_tick(active);

      /* H1 bulk gfx residual after hearts (LoadImage/ANM2/trinket/…). */
      events->player_hud_gfx_residual += 1;

      /* P3/P4 pure tail after host pred result (hybrid-resolved). */
      float f6b8 = pack->float_6b8;
      isaac_playerhud_tail_float_step(&f6b8, pack->tail_pred);
      scratch_player_hud_float[slot] = f6b8;
      IsaacPlayerHudTailCharCountdownState* chars = &scratch_player_hud_chars[slot];
      const uint32_t packed = pack->tail_chars;
      chars->c0 = static_cast<int8_t>(packed & 0xffu);
      chars->c1 = static_cast<int8_t>((packed >> 8) & 0xffu);
      chars->c2 = static_cast<int8_t>((packed >> 16) & 0xffu);
      isaac_playerhud_tail_char_countdown(chars);

      if (dirty != 0) events->player_hud_dirty_notify += 1;
    }

    /* PE: history/stat after the full PlayerHUD slot loop.  ABI v80: the
       one-shot latch (PE 0x009a2b67 cmp / 0x009a2b77 store) splits the
       history block: latch clear -> 0x83b850 (RecomputeAll) + 0x83b280 loop
       (hud_history_residual) and the store runs; latch set -> the PE jumps
       0x009a2b83 and only the 0x83b280 loop runs (hud_history_loop_residual). */
    if (history > 0) {
      if (state->hud_history_latch_5c7c == 0) {
        events->hud_history_residual += 1;
        state->hud_history_latch_5c7c = 1;
      } else if (runtime_inputs->hud_history_slot_flag0 != 0 ||
                 runtime_inputs->hud_history_slot_flag1 != 0) {
        /* ABI v81/v82: both flags clear -> the PE loop body never calls
           0x83b280 (each iteration skips at 0x009a2b93); pure no-op. */
        events->hud_history_loop_residual += 1;
      }
    }
    if (stat != 0) events->hud_stat_residual += 1;
    return;
  }

  /* Blob not ready or no occupied slots: monolithic residual covers PlayerHUD
     + history + stat as in pre-v40 host body.  ABI v80: the monolithic run
     executes the record, so when history > 0 the PE's own store
     (0x009a2b77) sets the latch in the game buffer; mirror it in state so
     the apply round-trip does not clear it. */
  if (history > 0) state->hud_history_latch_5c7c = 1;
  events->hud_post_update_calls += 1;
}
}

extern "C" void isaac_game_update_slice_step(
    IsaacGameUpdateSliceState* state,
    const IsaacGameUpdateSliceConstants* constants,
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs,
    IsaacGameUpdateSliceEvents* events) {
  if (state == nullptr || constants == nullptr || runtime_inputs == nullptr || events == nullptr) return;

  events->transition_completed = 0;
  events->transition_mode = 0;
  events->hud_post_update_calls = 0;
  events->dispatch_kind = ISAAC_TRANSITION_DISPATCH_NONE;
  events->queued_screen_id = -1;
  events->fade_argb = 0;
  events->payload_copy_required = 0;
  events->clear_transition_gate = 0;
  events->early_return_after_hud = 0;
  events->continuation_kind = ISAAC_GAME_UPDATE_CONTINUE_NEXT_GATE;
  events->opaque_call_0092e300 = 0;
  events->opaque_global_4aba0_refresh = 0;
  events->opaque_call_009b6840 = 0;
  events->opaque_call_00857450 = 0;
  events->opaque_call_0092f1c0 = 0;
  events->opaque_call_008318a0 = 0;
  events->opaque_call_0098dba0_player_walk = 0;
  events->generic_prompt_update_calls = 0;
  events->item_overlay_update_calls = 0;
  events->opaque_call_00746560 = 0;
  events->opaque_call_009bea10 = 0;
  events->opaque_call_0040c7f0 = 0;
  events->opaque_call_009b7680 = 0;
  events->menu_aux_list_clear = 0;
  events->opaque_call_008ef990 = 0;
  events->opaque_call_004212c0 = 0;
  /* ABI v133 (records idx26/27): the audio/music spawn-tail carriers. */
  events->room_trigger_clear_audio_non_greed_tail_spawns = 0;
  events->room_trigger_clear_audio_music_path_tail_spawns = 0;
  /* ABI v135 (record idx28): the deep-music fire carrier. */
  events->room_trigger_clear_deep_music_fire = 0;
  events->opaque_call_006fdc10 = 0;
  events->opaque_call_006fd7c0_mode4_sfx = 0;
  events->opaque_frame_effect_6fd7c0_shell = 0;
  /* ABI v131 (record idx 30): the greed probe/fire typed carriers. */
  events->room_trigger_clear_awards_greed_probe_9bf990 = 0;
  events->room_trigger_clear_awards_greed_probe_9bfa00 = 0;
  events->room_trigger_clear_awards_greed_probe_9bfa70 = 0;
  events->room_trigger_clear_awards_greed_fire_count = 0;
  events->room_trigger_clear_awards_greed_fire_mask = 0;
  /* ABI v132 (record idx 36): the B16 spawn enumeration echo carriers. */
  events->water_b16_spawn_rows_applied = 0;
  events->water_b16_water_hit_count = 0;
  events->water_b16_lava_hit_count = 0;
  events->water_b16_walk_arm_mask = 0;
  events->water_b16_cast_count = 0;
  events->water_b16_leaf_call_count = 0;
  events->rewind_705ee0_stores = 0;
  events->rewind_705ee0_save_state = 0;
  events->hud_stat_walk_probe1 = 0;
  events->hud_stat_walk_probe2 = 0;
  events->hud_stat_walk_probe3 = 0;
  events->opaque_008318a0_sfx_manager_stores = 0;
  events->frame_opaque_4212c0_true_probe_interior = 0;
  events->hud_stat_walk_fatal_empty = 0;
  events->engine_anm2_prefix_filename_assign = 0;
  events->engine_anm2_prefix_cache_fetch = 0;
  events->engine_anm2_prefix_loadimage = 0;
  events->hud_stat_walker_probe1 = 0;
  events->hud_stat_walker_probe2 = 0;
  events->hud_stat_walker_probe3 = 0;
  events->frame_effect_6fd7c0_stage_transition = 0;
  events->frame_effect_6fd7c0_player_loop = 0;
  events->frame_effect_6fd7c0_room_dispatch = 0;
  events->opaque_room_transition_engine_prefix = 0;
  events->opaque_room_transition_engine_body = 0;
  events->room_transition_index = 0;
  events->room_transition_dimension = 0;
  events->engine_site_anim = 0;
  events->opaque_room_update_prefix_b1 = 0;
  events->opaque_room_update_prefix_b1_sfx = 0;
  events->opaque_room_update_prefix_b1_spawn = 0;
  events->opaque_room_update_prefix_b2 = 0;
  events->opaque_room_update_prefix_b3_b7 = 0;
  events->opaque_room_update_prefix_b8 = 0;
  events->opaque_room_update_prefix_b9_b11 = 0;
  events->opaque_room_update_prefix_b9_b11_free = 0;
  events->opaque_room_update_prefix_b9_b11_mode_hooks = 0;
  events->opaque_room_update_prefix_b9_b11_flag_11f4 = 0;
  events->opaque_room_update_prefix_b9_b11_b10_fatal = 0;
  events->opaque_room_update_prefix_b9_b11_manager = 0;
  events->opaque_room_update_prefix_b9_b11_camera = 0;
  events->room_trigger_output = 0;
  events->opaque_room_update_clear_path = 0;
  events->clear_path_flag_store = 0;
  events->type5_door_forced_rerun = 0;
  events->opaque_room_update_clear_door_slots = 0;
  events->tail_mid_7230_spawn_armed = 0;
  events->shop_restock_warn = 0;
  events->shop_restock_create1 = 0;
  events->shop_restock_create2 = 0;
  events->shop_restock_seed_zero_drop = 0;
  events->shop_restock_copy_back_ready = 0;
  events->opaque_room_update_clear_door_slots_mask = 0;
  events->room_trigger_clear_stats = 0;
  events->room_trigger_clear_audio_non_greed = 0;
  events->room_trigger_clear_audio = 0;
  events->room_trigger_clear_awards_non_greed = 0;
  events->room_trigger_clear_awards_bit7 = 0;
  events->room_trigger_clear_awards_greed = 0;
  events->room_trigger_clear_awards_tail = 0;
  events->opaque_room_update_clear_doors = 0;
  events->opaque_room_update_ambient = 0;
  events->opaque_room_update_ambient_stage_spawn = 0;
  events->opaque_room_update_ambient_mode_sfx = 0;
  events->opaque_room_update_ambient_824800_spawn = 0;
  events->opaque_room_update_ambient_824a70 = 0;
  events->ambient_824a70_loop_count = 0;
  events->opaque_room_update_ambient_824a70_genrand = 0;
  events->opaque_room_update_ambient_824a70_create = 0;
  events->opaque_room_update_ambient_24ee0 = 0;
  events->opaque_room_update_ambient_74e9b0 = 0;
  events->opaque_room_update_ambient_special_1023 = 0;
  events->player_hud_update_hearts = 0;
  events->player_hud_gfx_residual = 0;
  events->player_hud_dirty_notify = 0;
  events->hud_history_residual = 0;
  events->hud_history_loop_residual = 0;
  events->opaque_0092f1c0_counter_out = 0;
  events->opaque_0092e300_slot_3c = 0;
  events->sound_group_walk_stores = 0;
  events->sound_group_walk_pending_mask = 0;
  events->sound_group_walk_applied = 0;
  events->frame_opaque_98dba0_walk_empty_skip = 0;
  events->state24ecc_8ef990_join_pure = 0;
  events->frame_opaque_4212c0_add0_log_needed = 0;
  /* ABI v95 (record idx 32): FUN_00956110 probe pure-decision proof. */
  events->frame_opaque_98dba0_956110_probe_pure = 0;
  /* ABI v95 (record idx 43): TriggerDeath CALL-ARG typed host event. */
  events->player_manager_update_death_arg_prep = 0;
  events->ambient_824a70_create_typed = 0;
  /* ABI v95 (record idx 3, 0x0092f1c0): typed dispatch + case-arm events. */
  events->opaque_0092f1c0_case = 0;
  events->opaque_0092f1c0_host_leaf = 0;
  /* ABI v95 (record idx 10 R1): 409030-pair typed ADVANCE/REWIND events. */
  events->frame_opaque_4212c0_409030_advance = 0;
  events->frame_opaque_4212c0_409030_rewind = 0;
  scratch_4212c0_anm2_plan = {};
  scratch_4212c0_true_probe_prefix_plan = {};
  /* ABI v102 (record idx 4): the store-plan apply scratch is zeroed
     every step too (gate miss / capture absent -> all zeros). */
  scratch_8318a0_sfx_manager_store_apply_plan = {};
  events->hud_stat_residual = 0;
  events->opaque_room_update_tail_rain = 0;
  /* ABI v95 (record idx 35): B15 rain loop-frame typed carriers. */
  events->b15_rain_pure_steps = 0;
  events->b15_rain_host_search = 0;
  events->b15_rain_host_create = 0;
  events->b15_rain_host_bind = 0;
  events->b15_rain_host_swap = 0;
  events->b15_rain_genrand_draws = 0;
  events->opaque_room_update_tail_water_b16 = 0;
  events->opaque_room_update_tail_mid = 0;
  events->opaque_room_update_tail_mid_706c_expire = 0;
  events->opaque_room_update_tail_mid_restock = 0;
  events->opaque_room_update_tail_mid_7230_spawn = 0;
  /* ABI v107 (wave-29 merge): the mid-restock seed==0 typed drop proof. */
  events->mid_restock_seed_zero_drop = 0;
  events->opaque_room_update_tail_entity = 0;
  events->b18_entity_walk_type5_calls = 0;
  events->b18_entity_walk_pathb_calls = 0;
  events->b18_entity_walk_frame = 0;
  events->opaque_room_update_tail_path = 0;
  events->tail_path_pure_steps = 0;
  events->tail_path_host_rebuild = 0;
  events->tail_path_host_trail = 0;
  events->tail_path_host_push = 0;
  events->tail_path_host_spawn = 0;
  events->tail_path_host_multispawn_steps = 0;
  events->tail_path_host_genrand_draws = 0;
  events->player_manager_update_death = 0;
  events->player_manager_update_heartbeat = 0;
  events->player_manager_update_heartbeat_sfx_update = 0;
  events->player_manager_update_heartbeat_sfx_play = 0;
  events->player_manager_update_heartbeat_sfx_stop = 0;
  events->opaque_call_004257b0_pass_a = 0;
  events->opaque_call_004257b0_pass_b = 0;
  events->frame_opaque_4257b0_pass_a_applied = 0;
  events->frame_opaque_4257b0_pass_b_applied = 0;
  events->frame_opaque_4257b0_id_count = 0;
  events->frame_opaque_4257b0_inserted = 0;
  events->frame_opaque_4257b0_post_count = 0;
  events->frame_opaque_4257b0_pass_b_stores = 0;
  events->frame_opaque_4257b0_list_grow = 0;
  events->opaque_call_008607a0 = 0;
  events->list_update_6772c = 0;
  events->list_update_6772c_free = 0;
  events->menu_aux_node_free = 0;
  events->menu_aux_payload_free = 0;
  events->ambient_824a70_genrand_samples = 0;
  events->opaque_call_0098dba0_timer = 0;
  events->hud_message_text_out = 0;
  events->frame_opaque_98dba0_site = 0;
  events->host_fun_746560_site = ISAAC_HOST_FUN_746560_SITE_NONE;
  events->host_fun_746560_param = 0;
  events->host_fun_746560_byte_216e9 = 0;
  events->host_fun_746560_deathmatch_suffix = 0;

  if (state->short_timer > 0) state->short_timer -= 1;

  if (state->position_reset_timer > 0) {
    state->position_reset_timer -= 1;
    if (state->position_reset_timer < 1) {
      state->position_x_bits = constants->reset_position_x_bits;
      state->position_y_bits = constants->reset_position_y_bits;
    }
  }

  if (state->secondary_timer > 0) state->secondary_timer -= 1;

  /* ABI v64: FX-lerp gate lane, PE 0x006fae80..0x006faf0b (unmodeled
     through v63). Gate open when byte[Game+0x676b4] != 0: 0x006ef410
     (translated inline) moves cur[i] toward goal[i] by step[i]: snap to
     goal when ordered step >= |cur - goal| (comiss/jae), else step +/-
     toward goal -- ordered goal > cur adds (comiss goal,cur jbe not
     taken), equal/unordered subtracts (jbe taken). The gate byte then
     clears only if every post-call ucomiss cur-vs-step pair is EXACTLY
     EQUAL: PE `lahf; test ah,0x44; jp` falls through only when R has odd
     parity (equal: R=0x40); unordered (R=0x44, even) and ordered-unequal
     (R=0x00, even) both take jp and keep the gate. */
  if ((state->fx_lerp_gate_676b4 & 0xffu) != 0) {
    float cur[6] = {state->fx_cur_676b8, state->fx_cur_676bc,
                    state->fx_cur_676c0, state->fx_cur_676c4,
                    state->fx_cur_676c8, state->fx_cur_676cc};
    for (int i = 0; i < 6; ++i) {
      const float c = cur[i];
      const float g = (&runtime_inputs->fx_goal_676e8)[i];
      const float s = (&runtime_inputs->fx_step_676d0)[i];
      const float sub = c - g;  /* subss */
      const uint32_t d_bits =
          __builtin_bit_cast(uint32_t, sub) & 0x7fffffffu;  /* andps abs */
      const float d = __builtin_bit_cast(float, d_bits);
      float o;
      if (!(s != s) && !(d != d) && s >= d) {
        o = g;  /* comiss step,|cur-goal|; jae -> snap to goal, not step */
      } else if (!(g != g) && !(c != c) && g > c) {
        o = c + s;  /* jbe not taken: ordered goal > cur -> add step */
      } else {
        o = c - s;  /* jbe taken: goal <= cur or unordered -> subtract */
      }
      cur[i] = o;
    }
    state->fx_cur_676b8 = cur[0];
    state->fx_cur_676bc = cur[1];
    state->fx_cur_676c0 = cur[2];
    state->fx_cur_676c4 = cur[3];
    state->fx_cur_676c8 = cur[4];
    state->fx_cur_676cc = cur[5];
    int all_match = 1;
    for (int i = 0; i < 6; ++i) {
      const float c = cur[i];
      const float s = (&runtime_inputs->fx_step_676d0)[i];
      /* test ah,0x44 / jp: equal -> R=0x40 (odd parity, jp not taken ->
         keep checking); ordered-unequal -> R=0x00 (even, jp taken -> leave);
         unordered NaN -> R=0x44 (even, jp taken -> leave). Only EXACT
         equality falls through all six checks. */
      if (c == s) continue;
      all_match = 0;
      break;
    }
    if (all_match == 1) state->fx_lerp_gate_676b4 = 0;
  }

  if (state->decay_value > 0.0f) {
    if (state->decay_value <= constants->decay_threshold) {
      state->decay_value = 0.0f;
    } else {
      state->decay_value *= constants->decay_factor;
    }
  }

  if (state->transition_progress > 0.0f) {
    if (state->transition_mode == 0) {
      state->transition_progress -= state->transition_rate;
      if (state->transition_progress < 0.0f) state->transition_progress = 0.0f;
    } else {
      state->transition_progress += state->transition_rate;
      if (state->transition_progress >= constants->transition_complete) {
        state->transition_progress = constants->transition_complete;
        events->transition_completed = 1;
        events->transition_mode = state->transition_mode;
        events->clear_transition_gate = 1;
        classify_transition_dispatch(state->transition_mode, events);
        if (state->transition_mode != 8 && state->transition_mode != 9) {
          state->transition_mode = 0;
        }
      }
    }
    /* Safe site: start-of-step; pure transition does not rewrite Manager/PlayerHUD. */
    maybe_emit_hud_post_update(state, runtime_inputs, events);
  }

  /* ABI v61: VA 0x009a2b30 transition-tail sweep host edge.
     PE 0x006fb3b6..0x006fb3d0: ecx = Game+0x1da04; call always at 0x006fb3b8,
     and a second call after the post_update_delay decrement on the
     early-return path (PE 0x006fb3c7..0x006fb3d0). */
  /* ABI v63: common-tail WRITE lane, PE 0x006fb38a. Byte clear and the
     keep-8/9 mode normalization ran on the PE every pass but were
     unmodeled through v62. */
  state->transition_tail_byte_29fb8 = 0;
  if (state->transition_mode != 8 && state->transition_mode != 9) {
    state->transition_mode = 0;
  }
  events->opaque_call_009a2b30 += 1;
  /* ABI v83/v84: the record's tail (0x84c170) runs once per record call.
     Dispatch order: the v84 WALK-ACTIVE lane first (count in [1, 8] with
     the walk blob present) — init seeds the walk scratch from the host
     blob and runs the full walk + countdown; otherwise the v83 walk-empty
     countdown lane (count==0 fallback, unchanged). */
  if (hud_stat_walk_lane_active(runtime_inputs)) {
    maybe_hud_stat_walk_init(runtime_inputs, state, events);
  } else {
    maybe_hud_stat_countdown_init(runtime_inputs);
  }
  if (state->post_update_delay > 0) {
    state->post_update_delay -= 1;
    events->opaque_call_009a2b30 += 1;
    if (hud_stat_walk_lane_active(runtime_inputs)) {
      maybe_hud_stat_walk_tick(runtime_inputs, state, events);
    } else {
      maybe_hud_stat_countdown_tick(runtime_inputs);
    }
    /* Safe site: same step after transition count; host residuals not yet applied. */
    maybe_emit_hud_post_update(state, runtime_inputs, events);
    events->early_return_after_hud = 1;
    events->continuation_kind = ISAAC_GAME_UPDATE_RETURN_AFTER_HUD_DELAY;
    return;
  }

  if (state->gate_1d520 != 0) {
    if (state->one_shot_1d63c != 0) {
      /* ABI v88: sound-group walk split. walk_ready=0 keeps v85 emits_host
         (and v50 ready=0 stays pre-v50 monolithic). The one_shot clear at
         PE 0x006fb40d is outside the call and stays unconditional. */
      {
        const uint32_t walk_ready =
            runtime_inputs != nullptr ? runtime_inputs->sound_group_walk_ready : 0u;
        const uint32_t v50_ready =
            runtime_inputs != nullptr ? runtime_inputs->opaque_0092e300_ready : 0u;
        const int32_t group_count =
            runtime_inputs != nullptr ? (int32_t)runtime_inputs->opaque_0092e300_group_count : 0;
        const uint32_t packs_ready =
            runtime_inputs != nullptr ? runtime_inputs->opaque_0092e300_packs_ready : 0u;
        const uint32_t* group_enabled =
            runtime_inputs != nullptr ? runtime_inputs->opaque_0092e300_group_enabled : nullptr;
        const uint32_t* group_entry_count =
            runtime_inputs != nullptr ? runtime_inputs->opaque_0092e300_group_entry_count
                                      : nullptr;
        const uint32_t voice_blob_ready =
            runtime_inputs != nullptr ? runtime_inputs->opaque_0092e300_voice_blob_ready : 0u;
        const int32_t voice_count =
            runtime_inputs != nullptr ? runtime_inputs->opaque_0092e300_voice_count : 0;
        const int32_t* first_voice =
            runtime_inputs != nullptr ? runtime_inputs->opaque_0092e300_first_voice : nullptr;
        const IsaacGameUpdateSliceOpaque0092e300VoicePack* voices =
            runtime_inputs != nullptr ? runtime_inputs->opaque_0092e300_voices : nullptr;
        const int32_t applied = opaque_0092e300_walk(
            walk_ready, v50_ready, group_count, packs_ready, group_enabled,
            group_entry_count, voice_blob_ready, voice_count, first_voice, voices,
            &scratch_sound_group_walk_plan, scratch_sound_group_pending);
        if (applied != 0) {
          events->sound_group_walk_applied = 1;
          events->opaque_0092e300_slot_3c =
              scratch_sound_group_walk_plan.stop_calls > 0 ? 1u : 0u;
          events->sound_group_walk_stores =
              (uint32_t)scratch_sound_group_walk_plan.stores;
          /* ABI v94: the pending-mask loop carries the SAME group-action
             gate as the walk itself (PE 0x92e340 BYTE enabled test /
             0x92e352 UNSIGNED count test PRECEDE every [e+0x29] store at
             0x92e37b/0x92e3c7): a disabled or empty group executes NO
             store, so its firstVoice slots must not be reported as
             cleared even when pending_09 is non-zero (scratch init 0 there
             is the "untouched" value, not a clear). */
          uint32_t mask = 0;
          if (voices != nullptr && first_voice != nullptr && group_enabled != nullptr &&
              group_entry_count != nullptr) {
            for (int32_t g = 0; g < group_count && g < ISAAC_OPAQUE_0092E300_MAX_GROUPS; ++g) {
              if (isaac_sfx_stop_all_group_action(group_enabled[g], group_entry_count[g]) !=
                  ISAAC_SFX_STOP_ALL_GROUP_WALK) {
                continue;
              }
              for (int32_t i = 0;; ++i) {
                const int32_t slot = first_voice[g] + i;
                if (slot < 0 || slot >= voice_count) break;
                if (scratch_sound_group_pending[slot] == 0 &&
                    (voices[slot].pending_09 & 0xffu) != 0u) {
                  mask |= (1u << slot);
                }
                if (isaac_sfx_voice_loop_continue(
                        (uint32_t)(i + 1), voices[slot].voices_reloaded) == 0) {
                  break;
                }
              }
            }
          }
          events->sound_group_walk_pending_mask = mask;
        } else if (opaque_0092e300_emits_host(
                       v50_ready, group_count, packs_ready, group_enabled, group_entry_count,
                       voice_blob_ready, voice_count, first_voice, voices) != 0) {
          events->opaque_call_0092e300 = 1;
        }
      }
      state->one_shot_1d63c = 0;
    }
    /* ABI v79: record 2 (opaqueGlobal4aba0Refresh) — blob-gated pure.
       PE 0x006fb414..0x006fb474: when the Manager container
       [Game+0x4b3d8, +0x4b3dc) is EMPTY the whole block is skipped (the
       result byte is untouched and no host can run), and when the blob is
       present + in contract the byte is computed from the captured tree
       (isaac_game_update_slice_global_tree_4aba0_pure, verbatim walk +
       0x00414a80 advance). Everything else keeps the monolithic residual
       byte-for-byte (default blob_ready = 0). */
    if (runtime_inputs != nullptr && runtime_inputs->global_tree_4aba0_blob_ready != 0u &&
        runtime_inputs->global_tree_4aba0_begin != runtime_inputs->global_tree_4aba0_end &&
        runtime_inputs->global_tree_4aba0_count <= ISAAC_GLOBAL_TREE_4ABA0_MAX_NODES) {
      const int32_t tree_result = isaac_game_update_slice_global_tree_4aba0_pure(
          runtime_inputs->global_tree_4aba0_begin,
          runtime_inputs->global_tree_4aba0_end,
          runtime_inputs->global_tree_4aba0_count,
          runtime_inputs->global_tree_4aba0_nodes);
      if (tree_result >= 0) {
        state->global_tree_4aba0_result = (uint8_t)tree_result;
      } else {
        events->opaque_global_4aba0_refresh = 1;
      }
    } else {
      events->opaque_global_4aba0_refresh = 1;
    }
    /* MenuGate_Update pure early-out: skip host when *menu==0 or dual-gate. */
    if (isaac_menu_gate_update_needs_host(
            state->menu_state_23a74, state->gate_1b83c, state->predicate_1ba74) !=
        0) {
      events->opaque_call_009b6840 = 1;
      /* ABI v95 (record idx 2 body): A2 mode-latch store law (PE 0x9b6905..
         0x9b6918) executes on EVERY non-early-out body path after 0x425130
         (which does not touch Game+0x22ed4/0x22edc — verified). Mirror the
         store in-module so the residual host store is idempotent. */
      if (isaac_game_update_slice_9b6840_mode_latch_needed(
              static_cast<uint32_t>(state->status_22ed4)) != 0) {
        state->status_22ed4 = 1;
        state->status_22edc = 2;
      }
    }
    if (state->state_24ecc != 0) {
      state->state_24ecc = 2;
      state->mode_24ed8 = 8;
      state->value_24ed0 = -1;
      events->continuation_kind = ISAAC_GAME_UPDATE_RETURN_AFTER_GATE_1D520;
    } else {
      events->continuation_kind = ISAAC_GAME_UPDATE_CONTINUE_AT_COMMON_TAIL;
    }
    return;
  }

  if (state->gate_1d654 != 0) {
    /* ABI v51: skip the call when its own early-outs make it a complete
       no-op. The continuation is unchanged either way — the PE returns to the
       same place whether or not 0x00857450 did anything. */
    const uint32_t rank_ready =
        runtime_inputs != nullptr ? runtime_inputs->opaque_857450_ready : 0u;
    if (opaque_857450_needs_host(rank_ready, state->gate_1d654,
            runtime_inputs != nullptr ? runtime_inputs->opaque_857450_manager_4abbc : 0) != 0) {
      events->opaque_call_00857450 = 1;
      /* ABI v56: with the captures present the whole body folds purely. */
      if (rank_ready != 0u) {
        (void)isaac_game_update_slice_857450_body(runtime_inputs, state, events);
      }
    }
    events->continuation_kind = ISAAC_GAME_UPDATE_RETURN_AFTER_GATE_1D654;
    return;
  }

  if (state->gate_1ba78 != 0) {
    /* ABI v86: HUD v5 try_pure skip. ABI v95 (record idx 3): the case-1/2
       pure-tail laws extend the drop (counter/limit/field_14); cases 0/3
       stay ALWAYS host (unconditional Room interior 0x4186c0). On the host
       branch, typed events pin the dispatch + case-arm decisions (ready!=0
       only, mirroring the v94 ready-gated precedent). Drop path: no case
       body ran, so HUD inputs are independent — apply the modelled tail
       then HUD and return (no RESUME_AFTER_92F1C0). */
    const uint32_t ready =
        runtime_inputs != nullptr ? runtime_inputs->opaque_0092f1c0_ready : 0u;
    const uint32_t mode =
        runtime_inputs != nullptr ? runtime_inputs->opaque_0092f1c0_mode : 0u;
    const int32_t counter =
        runtime_inputs != nullptr ? runtime_inputs->opaque_0092f1c0_counter : 0;
    const uint32_t limit =
        runtime_inputs != nullptr ? runtime_inputs->opaque_0092f1c0_limit : 0u;
    const uint32_t field_14 =
        runtime_inputs != nullptr ? runtime_inputs->opaque_0092f1c0_field_14 : 0u;
    if (opaque_0092f1c0_needs_host(ready, mode, (uint32_t)counter, limit,
                                   field_14) != 0) {
      events->opaque_call_0092f1c0 = 1;
      if (ready != 0u) {
        /* ABI v95 typed host events: dispatch case + host leaf code. */
        const int32_t dc = isaac_game_update_slice_92f1c0_dispatch_case(mode);
        if (dc >= 0) {
          const uint32_t c = (uint32_t)counter;
          events->opaque_0092f1c0_case = (uint32_t)dc;
          if (dc == 0) {
            events->opaque_0092f1c0_host_leaf = 1u; /* case 0: uncond 0x4186c0 */
          } else if (dc == 1) {
            if (c >= limit) {
              events->opaque_0092f1c0_host_leaf = 3u; /* reset arm */
            } else if (c == limit - 2u) {
              events->opaque_0092f1c0_host_leaf = 4u; /* limit-2 arm */
            } else {
              events->opaque_0092f1c0_host_leaf = 5u; /* 0x74f090 arm */
            }
          } else if (dc == 2) {
            uint32_t leaf = 0u;
            if (c == 2u && (field_14 & 0xffu) != 0u) leaf |= 1u; /* 0x7eb1b0 */
            if (c >= limit) leaf |= 2u;                         /* 0x746560 */
            events->opaque_0092f1c0_host_leaf = leaf; /* 1/2/3 (both) */
          } else {
            events->opaque_0092f1c0_host_leaf = 2u; /* case 3: uncond 0x4186c0 */
          }
        }
      }
      events->continuation_kind = ISAAC_GAME_UPDATE_RESUME_AFTER_92F1C0;
      return;
    }
    IsaacHudGate92f1c0Plan plan;
    isaac_hud_gate_92f1c0_plan(mode, mode, counter, &plan);
    events->opaque_0092f1c0_counter_out = plan.counter_out;
    if (plan.tail_stores_needed != 0) {
      state->status_22ed4 = 2;
      state->status_22edc = 2;
    }
    maybe_emit_hud_post_update(state, runtime_inputs, events);
    events->continuation_kind = ISAAC_GAME_UPDATE_RETURN_AFTER_GATE_1BA78;
    return;
  }

  if (state->gate_1b83c != 0) {
    /* ABI v87: HUD v5 try_pure skip for VA 0x008318a0. ready=0 keeps
       v86 always-host. Drop 8318a0 only — KEEP the 98dba0 walk host
       and RESUME_AFTER_98DBA0_PLAYER_WALK. Default 0x8326a1 is SEH
       unwind + GS cookie; ZERO Game stores on the skip. */
    const uint32_t ready =
        runtime_inputs != nullptr ? runtime_inputs->opaque_008318a0_ready : 0u;
    const uint32_t mode =
        runtime_inputs != nullptr ? runtime_inputs->opaque_008318a0_mode : 0u;
    /* ABI v95 (record idx 4): the mode-3 HEAD pure shared-advance arm.
       PE 0x8320c6 mov eax,[ebx+4] / 0x8320c9 cmp eax,[ebx+8] / 0x8320cc
       jl 0x8320bd — SIGNED (int32)counter < (int32)limit jumps to the
       shared advance 0x8320bd (inc eax; mov [ebx+4],eax; jmp 0x832663)
       with ZERO host calls on the whole arm, then the common tail stores
       ratio f32 bits into [ebx+0xc] (Game+0x1b848) and, because the mode
       is re-read as 3 (0x832670), Game+0x22ed4/0x22edc = 2 dwords
       (0x832688/0x832697). The receiver fields are the captured state
       lanes: [ebx+4]=Game+0x1b840=engine_field_4, [ebx+8]=Game+0x1b844=
       engine_field_8, [ebx+0xc]=Game+0x1b848=engine_field_c. ready!=0 is
       required (ready=0 keeps the pre-v95 always-host arm). On this arm
       the 8318a0 host edge is DROPPED (the v87 needs_host would host all
       of mode 3); the pure proof event is published instead. */
    if (ready != 0u && mode == 3u &&
        isaac_game_update_slice_8318a0_mode3_advance_signed(
            static_cast<uint32_t>(state->engine_field_4),
            static_cast<uint32_t>(state->engine_field_8)) != 0) {
      events->opaque_008318a0_mode3_advance_pure = 1;
      const uint32_t counter_next =
          static_cast<uint32_t>(state->engine_field_4) + 1u; /* 32-bit wrap */
      state->engine_field_4 = static_cast<int32_t>(counter_next);
      state->engine_field_c = static_cast<int32_t>(
          isaac_hud_8318a0_ratio_f32_bits(counter_next,
                                          static_cast<uint32_t>(state->engine_field_8)));
      /* recaptured mode == 3 -> the 0x832688/0x832697 tail stores fire. */
      state->status_22ed4 = 2;
      state->status_22edc = 2;
    } else if (opaque_008318a0_needs_host(ready, mode) != 0) {
      events->opaque_call_008318a0 = 1;
      /* ABI v95 (record idx 4): the mode-4 HEAD SFX gate. PE 0x83243b cmp
         [ebx+0x1c],3 / jne 0x832488 and 0x832441 cmp [ebx+4],8 / jne
         0x832488 — BOTH FULL-DWORD: type_1c==3 && counter==8 opens the
         pre-0x4186c0 SFX prep (0x956780 + 0x92dc30 arg 0xd6). The SFX
         call stays typed-host; this event pins the pure gate + arg so the
         host consumer issues it exactly ([type_1c]=Game+0x1b858=
         engine_field_1c, [counter]=Game+0x1b840=engine_field_4). */
      if (ready != 0u && mode == 4u &&
          isaac_game_update_slice_8318a0_mode4_sfx_gate(
              static_cast<uint32_t>(state->engine_field_1c),
              static_cast<uint32_t>(state->engine_field_4)) != 0) {
        events->opaque_008318a0_mode4_sfx_gate_open = 1;
      }
    }
    /* ABI v96 (record idx 4): the mode-1 SFX-manager store-plan seam, LIVE.
       When the ABI-96 pack is captured (opaque_8318a0_player_entry_ready
       names the FULL record-4 capture: sfx globals 13736..13748 +
       engine_field_28 + byte_7c + the per-player entry pack 13760..14152)
       AND mode==1, the manager block 0x831e31 (9 stores + 10 E8 sites) is
       provable in-module: candidate_found = [ebp-0x41] (set 1 @0x83191c,
       cleared @0x831ae4 iff the walk scores an entry with b173==0 &&
       (b1398||b139a) && (ptr7c==0 || byte34==0) && w3fc!=4 — FULL-DWORD
       w3fc; entries with b173!=0 or ptr7c!=0&&byte34!=0 exit 0x831aff
       before the score block), then
       mode1_manager_block_gate(candidate_found, type_1c, field_14)
       (PE 0x831c64 cmp byte [ebp-0x41],0 / jne 0x831c75; FULL-DWORD
       type/field_14). When the plan fires, the typed event
       opaque_008318a0_sfx_manager_stores +1s (the 9 store rows resolve via
       isaac_game_update_slice_8318a0_sfx_manager_store_plan over the
       captured globals); the coarse opaque_call_008318a0 edge STAYS (the
       record-12 seam precedent). Pack rows are the span slots in order
       (count = (end-begin)>>2, cap 8); null-slot rows MUST be all-zero.
       Gate misses (ready=0 / mode!=1 / pack not ready / count>cap / block
       not reached) leave the residual byte-for-byte.
       ABi v99 (fold): the flag-clear needs type_1c != 0 — PE 0x831a1f/
       0x831a26/0x831a53/0x831a59 zero e+0x1398/e+0x139a when type==0
       (0x831a19 cmp dword [ebx+0x1c],0), so the 0x831a95 re-check finds
       both bytes zero and every score-block entry exits at 0x831af8
       ([e+0x171]=0): the 0x831ae4 clear is unreachable for type==0
       (mode1_walk_entry_zero_arm BY REFERENCE). */
    if (ready != 0u && mode == 1u) {
      /* ABI v102 (store-plan APPLICATION arm): the typed per-row apply
         plan scratch is zeroed before the gate decision — every gate
         miss / capture absence leaves it all-zero (residual
         byte-for-byte; the @932 +1 event is the only event delta). */
      scratch_8318a0_sfx_manager_store_apply_plan = {};
      const uint32_t pack_ready =
          runtime_inputs != nullptr ? runtime_inputs->opaque_8318a0_player_entry_ready : 0u;
      if (pack_ready != 0u &&
          runtime_inputs->opaque_8318a0_player_entry_count <=
              ISAAC_GAME_UPDATE_8318A0_PLAYER_ENTRY_MAX) {
        uint32_t candidate_found = 1u;
        const uint32_t count = runtime_inputs->opaque_8318a0_player_entry_count;
        const uint32_t type_1c = static_cast<uint32_t>(state->engine_field_1c);
        for (uint32_t i = 0u; i < count; ++i) {
          if (type_1c != 0u &&
              (runtime_inputs->opaque_8318a0_player_entry_b173[i] & 0xffu) == 0u &&
              ((runtime_inputs->opaque_8318a0_player_entry_b1398[i] & 0xffu) != 0u ||
               (runtime_inputs->opaque_8318a0_player_entry_b139a[i] & 0xffu) != 0u) &&
              (runtime_inputs->opaque_8318a0_player_entry_ptr7c[i] == 0u ||
               (runtime_inputs->opaque_8318a0_player_entry_b34[i] & 0xffu) == 0u) &&
              runtime_inputs->opaque_8318a0_player_entry_w3fc[i] != 4u) {
            candidate_found = 0u;
            break;
          }
        }
        if (isaac_game_update_slice_8318a0_mode1_manager_block_gate(
                candidate_found, type_1c,
                static_cast<uint32_t>(state->engine_field_14)) != 0) {
          events->opaque_008318a0_sfx_manager_stores += 1;
          /* ABI v102 APPLICATION arm: emit the typed per-row apply plan
             into the step scratch — store_mask 0x1ff (the 9 block sites
             0x831e31..0x831f34; row 0's node guard @0x831e5d is host-
             apply on the element=1 rows) + the 9 rows via the v96 plan
             law over the captured globals @13736..13748. The host
             consumer (native-update-bridge §5) applies the masked rows
             to the SFX-manager BSS after the step. */
          scratch_8318a0_sfx_manager_store_apply_plan.store_mask =
              ISAAC_GAME_UPDATE_SLICE_8318A0_SFX_MANAGER_STORE_MASK;
          isaac_game_update_slice_8318a0_sfx_manager_store_apply_plan(
              runtime_inputs->opaque_8318a0_sfx_global_798e4,
              runtime_inputs->opaque_8318a0_sfx_global_79790,
              runtime_inputs->opaque_8318a0_sfx_global_7978c,
              runtime_inputs->opaque_8318a0_sfx_global_79948,
              &scratch_8318a0_sfx_manager_store_apply_plan);
          /* ABI v142 (rt_band_pop typed carrier): the capture-live
             RETIRE arm — the two stateful band deltas (0xc79790 depth
             decrement, 0xc7978c empty-latch clear) retire onto the
             composite event lanes and the five constant param stores are
             derived purely; @932 + the v102 apply-plan scratch stay as
             shipped. The four opaque thiscall leaves on *0xc798e0 remain
             host actions. Capture absence never reaches this arm: the
             lanes stay 0 and the residual keeps byte-for-byte. */
          IsaacGameUpdateSlice8318a0RtBandPop rt_band_pop = {};
          isaac_game_update_slice_8318a0_rt_band_pop(
              runtime_inputs->opaque_8318a0_sfx_global_798e4,
              runtime_inputs->opaque_8318a0_sfx_global_79790,
              runtime_inputs->opaque_8318a0_sfx_global_7978c,
              &rt_band_pop);
          events->opaque_008318a0_rt_band_pop_fired += 1;
          events->opaque_008318a0_rt_band_pop_depth_after =
              rt_band_pop.depth_after;
          events->opaque_008318a0_rt_band_pop_latch_after =
              rt_band_pop.latch_after;
          events->opaque_008318a0_rt_band_pop_params_pack =
              (rt_band_pop.params[0] & 0xfu) |
              ((rt_band_pop.params[1] & 0xfu) << 4) |
              ((rt_band_pop.params[2] & 0xfu) << 8) |
              ((rt_band_pop.params[3] & 0xfu) << 12) |
              ((rt_band_pop.params[4] & 0xfu) << 16);
        }
      }
    }
    /* ABI v92: blob-gated empty-vector walk arm. When the captured player
       vector span proves count==0 (PE 0x98dbe1 test/jne + 0x98dc11 test/je),
       the walk loop is a PROOF-COMPLETE pure skip — the walk residual's only
       host content on this arm is the fatal log 0xa112c0, so the in-module
       gate publishes walk_empty_skip alongside the (still required) walk
       host edge. ready=0 keeps the pre-v92 always-host walk, no event. */
    const uint32_t walk_ready =
        runtime_inputs != nullptr ? runtime_inputs->frame_opaque_98dba0_walk_ready : 0u;
    if (walk_ready != 0u &&
        isaac_game_update_slice_98dba0_walk_pure_skip(
            runtime_inputs->frame_opaque_98dba0_walk_begin,
            runtime_inputs->frame_opaque_98dba0_walk_end) != 0) {
      events->frame_opaque_98dba0_walk_empty_skip = 1;
    }
    events->opaque_call_0098dba0_player_walk = 1;
    events->frame_opaque_98dba0_site = ISAAC_FRAME_OPAQUE_98DBA0_SITE_GATE_1B83C;
    events->continuation_kind = ISAAC_GAME_UPDATE_RESUME_AFTER_98DBA0_PLAYER_WALK;
    return;
  }

  if (state->item_overlay_state == 0) {
    const bool prompt_active = state->generic_prompt_active_object != 0 &&
        state->generic_prompt_active_flag != 0;
    if (prompt_active) {
      events->generic_prompt_update_calls = 1;
      events->continuation_kind = ISAAC_GAME_UPDATE_RESUME_AFTER_GENERIC_PROMPT_UPDATE;
    } else if (state->skip_timed_transition_flag != 0) {
      events->continuation_kind = ISAAC_GAME_UPDATE_CONTINUE_AT_COMMON_TAIL;
    } else {
      events->continuation_kind = ISAAC_GAME_UPDATE_CONTINUE_AT_TIMED_TRANSITION;
    }
    return;
  }

  if (state->menu_state_23a74 == 0 || runtime_inputs->global_range_byte_length != 0) {
    if (state->item_overlay_state == 1) {
      /* ABI v58 pure: VA 0x009aca90 ItemOverlay::Update(false) state-1 block
         (site 0x006fb5a2). if (this[0]==1) { this[0x119c]--; if
         (this[0x119c] > 0) keep; else this[0] = 2; }. The `dec` wraps at
         32 bits and the `jg` is signed (counter 0 -> -1 flips to 2;
         INT32_MIN -> INT32_MAX stays 1). No host call on this path. */
      /* PE `dec dword ptr [ecx+0x119c]` wraps 32-bit; the follow-up `jg` is
         signed on the wrapped value. Compute in unsigned to avoid signed
         overflow UB (INT_MIN - 1 wraps to INT_MAX and stays). */
      const uint32_t wrapped = static_cast<uint32_t>(state->item_overlay_counter_11d1d0) - 1u;
      state->item_overlay_counter_11d1d0 = static_cast<int32_t>(wrapped);
      if (static_cast<int32_t>(wrapped) > 0) {
        /* PE 0x006fb5ae `jne 0x006fb6a8` — still != 2 → timed tail. */
        events->continuation_kind = ISAAC_GAME_UPDATE_CONTINUE_AT_TIMED_TRANSITION;
      } else {
        state->item_overlay_state = 2;
        events->continuation_kind = ISAAC_GAME_UPDATE_RESUME_AFTER_ITEM_OVERLAY_UPDATE;
      }
    } else {
      events->item_overlay_update_calls = 1;
      events->continuation_kind = ISAAC_GAME_UPDATE_RESUME_AFTER_ITEM_OVERLAY_UPDATE;
    }
  } else {
    events->continuation_kind = ISAAC_GAME_UPDATE_CONTINUE_AT_TIMED_TRANSITION;
  }
}

extern "C" int32_t isaac_game_update_slice_resume_gate_1b83c(
    IsaacGameUpdateSliceState* state,
    IsaacGameUpdateSliceEvents* events) {
  if (state == nullptr || events == nullptr ||
      events->continuation_kind != ISAAC_GAME_UPDATE_RESUME_AFTER_GATE_1B83C_UPDATES) {
    return 0;
  }
  if (state->gate_1b83c != 0 && state->predicate_1ba74 != 0) {
    state->counter_265c0 = 0;
    events->continuation_kind = ISAAC_GAME_UPDATE_RETURN_AFTER_GATE_1B83C;
  } else {
    events->continuation_kind = ISAAC_GAME_UPDATE_CONTINUE_AT_COMMON_TAIL;
  }
  return 1;
}

extern "C" int32_t isaac_game_update_slice_resume_92f1c0(
    IsaacGameUpdateSliceState* state,
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs,
    IsaacGameUpdateSliceEvents* events) {
  if (state == nullptr || runtime_inputs == nullptr || events == nullptr ||
      events->continuation_kind != ISAAC_GAME_UPDATE_RESUME_AFTER_92F1C0) {
    return 0;
  }
  /* Safe site only after host applied 0x0092f1c0 and recaptured HUD inputs. */
  maybe_emit_hud_post_update(state, runtime_inputs, events);
  events->continuation_kind = ISAAC_GAME_UPDATE_RETURN_AFTER_GATE_1BA78;
  return 1;
}

extern "C" int32_t isaac_game_update_slice_resume_generic_prompt(
    IsaacGameUpdateSliceState* state,
    IsaacGameUpdateSliceEvents* events) {
  if (state == nullptr || events == nullptr ||
      events->continuation_kind != ISAAC_GAME_UPDATE_RESUME_AFTER_GENERIC_PROMPT_UPDATE) {
    return 0;
  }
  if (state->generic_prompt_post_update_flag == 0 &&
      state->generic_prompt_submitted_selection == 1) {
    const float transition_step = __builtin_bit_cast(float, kTransitionStepBits);
    state->transition_rate = transition_step;
    state->transition_mode = 7;
    state->transition_color_r_bits = 0;
    state->transition_color_g_bits = 0;
    state->transition_color_b_bits = 0;
    state->transition_aux_bits = 0;
    state->transition_progress += transition_step;
    events->continuation_kind = ISAAC_GAME_UPDATE_RETURN_AFTER_GENERIC_PROMPT_TRANSITION;
  } else {
    events->continuation_kind = ISAAC_GAME_UPDATE_CONTINUE_AT_COMMON_TAIL;
  }
  return 1;
}

extern "C" int32_t isaac_game_update_slice_resume_item_overlay(
    IsaacGameUpdateSliceState* state,
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs,
    IsaacGameUpdateSliceEvents* events) {
  if (state == nullptr || runtime_inputs == nullptr || events == nullptr ||
      events->continuation_kind != ISAAC_GAME_UPDATE_RESUME_AFTER_ITEM_OVERLAY_UPDATE) {
    return 0;
  }
  if (state->item_overlay_state == 2) {
    /* Safe site: post-ItemOverlay::Update recapture; hybrid refills HUD inputs. */
    maybe_emit_hud_post_update(state, runtime_inputs, events);
    if (state->menu_state_23a74 != 0) {
      if (isaac_menu_gate_update_needs_host(
              state->menu_state_23a74, state->gate_1b83c, state->predicate_1ba74) !=
          0) {
        events->opaque_call_009b6840 += 1;
        /* ABI v95 (record idx 2 body): A2 mode-latch store law mirror. */
        if (isaac_game_update_slice_9b6840_mode_latch_needed(
                static_cast<uint32_t>(state->status_22ed4)) != 0) {
          state->status_22ed4 = 1;
          state->status_22edc = 2;
        }
      }
      events->continuation_kind = ISAAC_GAME_UPDATE_RETURN_AFTER_ITEM_OVERLAY_MENU;
    } else {
      events->continuation_kind = ISAAC_GAME_UPDATE_CONTINUE_AT_COMMON_TAIL;
    }
  } else {
    events->continuation_kind = ISAAC_GAME_UPDATE_CONTINUE_AT_TIMED_TRANSITION;
  }
  return 1;
}

/* ABI v65: defined below with the rest of the 0x00746560 carrier. */
namespace {
void record_host_fun_746560(
    IsaacGameUpdateSliceState* state,
    IsaacGameUpdateSliceEvents* events,
    int32_t site,
    uint32_t param,
    int32_t cleanup_mode,
    uint32_t post_ready);
}  // namespace

extern "C" int32_t isaac_game_update_slice_continue_timed_transition(
    IsaacGameUpdateSliceState* state,
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs,
    IsaacGameUpdateSliceEvents* events) {
  if (state == nullptr || runtime_inputs == nullptr || events == nullptr ||
      events->continuation_kind != ISAAC_GAME_UPDATE_CONTINUE_AT_TIMED_TRANSITION) {
    return 0;
  }

  if (state->timed_transition_progress > 0.0f) {
    bool hold_decrement = false;
    if (runtime_inputs->global_range_byte_length == 0 &&
        state->timed_transition_force_finish == 0) {
      const uint64_t counter = join_u64(
          runtime_inputs->monotonic_counter_low,
          runtime_inputs->monotonic_counter_high);
      const uint64_t baseline = join_u64(
          runtime_inputs->monotonic_baseline_low,
          runtime_inputs->monotonic_baseline_high);
      const uint64_t elapsed = scale_monotonic_counter(counter) - baseline;
      hold_decrement = elapsed <= 3000;
    }

    if (!hold_decrement) {
      state->timed_transition_progress -= state->transition_rate;
      state->status_22ed4 = 2;
      state->status_22edc = 2;
      if (state->timed_transition_progress <= 0.0f ||
          state->timed_transition_force_finish != 0) {
        state->timed_transition_force_finish = 0;
        state->timed_transition_progress = 0.0f;
        if (state->timed_transition_cleanup_mode < 2) {
          events->opaque_call_00746560 = 1;
          /* ABI v65: PE 0x006fb7d2 `push 0` — the widget therefore stores
             (0 ^ 1) = 1 into Game+0x216e9. The caller gate at 0x006fb7b8
             (`cmp [edi+0x26614],2` / `jge`) already proved cleanup_mode < 2,
             so the callee's own 0x007465b7 `jl` never takes the online-name
             append from this site; the carrier still derives it from the field
             rather than assuming it. */
          record_host_fun_746560(
              state,
              events,
              ISAAC_HOST_FUN_746560_SITE_TIMED_CLEANUP,
              0u,
              state->timed_transition_cleanup_mode,
              runtime_inputs != nullptr ? runtime_inputs->host_fun_746560_post_ready : 0u);
          /* ABI v50: VA 0x009bea10 is fully translated. The Update callsite at
             0x006fb7e3 pushes the constant 1, so the broadcast value is 1. */
          const uint32_t flag_ready =
              runtime_inputs != nullptr ? runtime_inputs->player_flag_410_ready : 0u;
          const int32_t flag_count =
              runtime_inputs != nullptr ? runtime_inputs->player_flag_410_count : 0;
          if (flag_ready == 0 || flag_count < 0 ||
              flag_count > ISAAC_ENGINE_PLAYER_MAX) {
            events->opaque_call_009bea10 = 1;
          } else {
            /* count 0 reproduces the 0x009bea1a je: no writes, no host call. */
            player_flag_410_broadcast(1u, flag_count, scratch_player_flag_410);
          }
        }
        events->opaque_call_0040c7f0 = 2;
      }
    }
  }

  if (state->timed_transition_progress > 0.0f) {
    /* Safe site: HUD fires only while progress still > 0; cleanup hosts did not. */
    maybe_emit_hud_post_update(state, runtime_inputs, events);
    events->continuation_kind = ISAAC_GAME_UPDATE_RETURN_AFTER_TIMED_TRANSITION_HUD;
  } else {
    events->continuation_kind = ISAAC_GAME_UPDATE_CONTINUE_AFTER_TIMED_TRANSITION;
  }
  return 1;
}

namespace {
int32_t wrap_increment_i32(int32_t value) {
  const uint32_t bits = __builtin_bit_cast(uint32_t, value) + 1u;
  return __builtin_bit_cast(int32_t, bits);
}

bool translated_menu_gate_should_exit(
    const IsaacGameUpdateSliceState* state,
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs) {
  if (state->menu_state_23a74 == 0) return false;
  const uint32_t byte_length = runtime_inputs->global_range_byte_length;
  return byte_length == 0 || (byte_length & 0xfffffffcu) == 4;
}

void continue_after_menu_update(
    IsaacGameUpdateSliceState* state,
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs,
    IsaacGameUpdateSliceEvents* events,
    bool menu_branch_was_entered) {
  if (menu_branch_was_entered) {
    /* ABI v51/v54: VA 0x0041d030 game logic is translated, and ABI v54 also
       translates the callsite wrapper (VA 0x006fb8b0..0x006fb8c0): the three
       sentinel self-links, the _Mysize clear and the menu+0x12a4 clear are
       pure outputs computed from the captured sentinel/menu addresses. Only
       the two raw frees and the application of the five wrapper writes stay
       host (platform side effects). Pure runs ONLY when the tree blob AND the
       sentinel capture are ready: a ready blob with menu_aux_sentinel_ready
       == 0 falls back to the monolithic residual, exactly the pre-v54
       behavior (menu_aux_list_clear increments when erased==null OR the
       sentinel is not ready). An empty tree (root index 0, the nil sentinel)
       is pure-complete with zero visits. */
    int32_t erased = -1;
    if (runtime_inputs != nullptr && runtime_inputs->menu_aux_tree_ready != 0 &&
        runtime_inputs->menu_aux_sentinel_ready != 0) {
      erased = menu_aux_tree_erase(runtime_inputs, scratch_menu_aux_visit_order,
                                   scratch_menu_aux_payload_free,
                                   scratch_menu_aux_accounting_out);
    }
    if (erased < 0) {
      events->menu_aux_list_clear += 1;
    } else {
      events->menu_aux_node_free += (uint32_t)erased;
      uint32_t payload_frees = 0;
      for (int32_t i = 0; i < erased; ++i) {
        if (scratch_menu_aux_payload_free[i] != 0) payload_frees += 1;
      }
      events->menu_aux_payload_free += payload_frees;
      /* Callsite wrapper in PE order (after the erase): three self-links,
         then _Mysize = 0, then menu+0x12a4 = 0. */
      const uint32_t sentinel_addr = runtime_inputs->menu_aux_sentinel_addr;
      scratch_menu_aux_sentinel_out[0] = sentinel_addr;
      scratch_menu_aux_sentinel_out[1] = sentinel_addr;
      scratch_menu_aux_sentinel_out[2] = sentinel_addr;
      scratch_menu_aux_sentinel_out[3] = 0;
      scratch_menu_aux_sentinel_out[4] = 0;
    }
    if (translated_menu_gate_should_exit(state, runtime_inputs)) {
      events->continuation_kind = ISAAC_GAME_UPDATE_RETURN_AFTER_MENU_GATE_EXIT;
      return;
    }
  }

  if (runtime_inputs->global_range_byte_length == 0 && state->state_24ecc != 0) {
    /* ABI v89: VA 0x008ef990 State24ecc_Update gate re-transcription
       (PE 0x8ef99e cmp [edi],1 / jne 0x8efdec; 0x8ef9af cmp byte
       [Game+0x22ed0],0 / je exit; 0x8efdec cmp eax,2 / jne exit).
       state==1: no-op when the 0x22ed0 byte is zero (v59 fold); host
       residual when nonzero (full body, can store state=2 / mode=8 /
       value=-1 at PE 0x8efdd1). state==2: PURE — mode_24ed8 -= 1 with
       32-bit wrap (PE 0x8efdf4 lea eax,[ecx-1]), and when the
       PRE-decrement value is <= 0 (PE test ecx,ecx / jg skip) clear
       state_24ecc (PE 0x8efdfe). Other states: no-op (0x8efdef jne).
       ready=0 preserves the pre-v59 always-host behavior (the host runs
       the whole body, including the state==2 arm). */
    const uint32_t gate_ready = runtime_inputs->state24ecc_22ed0_ready;
    const uint32_t gate_byte = runtime_inputs->state24ecc_22ed0 & 0xffu;
    if (gate_ready == 0u) {
      events->opaque_call_008ef990 += 1;
    } else if (state->state_24ecc == 1) {
      if (gate_byte != 0u) {
        events->opaque_call_008ef990 += 1;
        /* ABI v93: iterate-arm JOIN pure-decision proof (PE 0x8efc92..0x8efce9).
           The host runs the body; when it captured the JOIN seam blob
           (ready!=0) the model proves the tail is pure: idx8 == probe-0xe
           -> NO-SFX exit with zero calls, OR the RTE 956780 gate is closed
           -> the prep is a no-op and Play 0x92dc30 is the sole residual
           host call. ready=0 keeps the pre-v93 proof-free host edge. */
        const uint32_t join_ready =
            runtime_inputs != nullptr ? runtime_inputs->state24ecc_8ef990_join_ready : 0u;
        if (join_ready != 0u) {
          const int32_t join_skip = isaac_game_update_slice_8ef990_join_skip(
              runtime_inputs->state24ecc_8ef990_join_probe,
              runtime_inputs->state24ecc_8ef990_join_idx8);
          const int32_t prep_closed = isaac_game_update_slice_8ef990_join_956780_closed(
              runtime_inputs->state24ecc_8ef990_956780_game,
              runtime_inputs->state24ecc_8ef990_956780_node_bd,
              runtime_inputs->state24ecc_8ef990_956780_node_f10,
              runtime_inputs->state24ecc_8ef990_956780_node_ptr,
              runtime_inputs->state24ecc_8ef990_956780_sentinel);
          if (join_skip != 0 || prep_closed != 0) {
            events->state24ecc_8ef990_join_pure = 1;
          }
        }
      }
    } else if (state->state_24ecc == 2) {
      const int32_t pre = state->mode_24ed8;
      state->mode_24ed8 = pre - 1;
      if (pre <= 0) {
        state->state_24ecc = 0;
      }
    }
    events->continuation_kind = ISAAC_GAME_UPDATE_RETURN_AFTER_STATE_24ECC_UPDATE;
    return;
  }

  state->counter_265c0 = wrap_increment_i32(state->counter_265c0);
  /* FUN_0098dba0 multi-cont (frame-aux site): host player walk then pure islands
     + timer/text_out residuals; FrameOpaque_4212c0 pure shell runs after clamp. */
  /* ABI v92: same blob-gated empty-vector walk arm as the gate-1b83c site — a
     captured count==0 makes the walk loop a pure skip (fatal log stays host);
     ready=0 keeps the pre-v92 always-host walk, no event. */
  const uint32_t walk_ready =
      runtime_inputs != nullptr ? runtime_inputs->frame_opaque_98dba0_walk_ready : 0u;
  if (walk_ready != 0u &&
      isaac_game_update_slice_98dba0_walk_pure_skip(
          runtime_inputs->frame_opaque_98dba0_walk_begin,
          runtime_inputs->frame_opaque_98dba0_walk_end) != 0) {
    events->frame_opaque_98dba0_walk_empty_skip = 1;
  }
  events->opaque_call_0098dba0_player_walk += 1;
  events->frame_opaque_98dba0_site = ISAAC_FRAME_OPAQUE_98DBA0_SITE_FRAME_AUX;
  events->continuation_kind = ISAAC_GAME_UPDATE_RESUME_AFTER_98DBA0_PLAYER_WALK;
}

void continue_after_menu_open(
    IsaacGameUpdateSliceState* state,
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs,
    IsaacGameUpdateSliceEvents* events) {
  if (state->menu_state_23a74 != 0) {
    if (isaac_menu_gate_update_needs_host(
            state->menu_state_23a74, state->gate_1b83c, state->predicate_1ba74) !=
        0) {
      events->opaque_call_009b6840 += 1;
      /* ABI v95 (record idx 2 body): A2 mode-latch store law mirror. */
      if (isaac_game_update_slice_9b6840_mode_latch_needed(
              static_cast<uint32_t>(state->status_22ed4)) != 0) {
        state->status_22ed4 = 1;
        state->status_22edc = 2;
      }
    }
    events->continuation_kind = ISAAC_GAME_UPDATE_RESUME_AFTER_MENU_UPDATE;
    return;
  }
  continue_after_menu_update(state, runtime_inputs, events, false);
}
}

extern "C" int32_t isaac_game_update_slice_continue_menu_gates(
    IsaacGameUpdateSliceState* state,
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs,
    IsaacGameUpdateSliceEvents* events) {
  if (state == nullptr || runtime_inputs == nullptr || events == nullptr ||
      events->continuation_kind != ISAAC_GAME_UPDATE_CONTINUE_AFTER_TIMED_TRANSITION) {
    return 0;
  }

  if ((runtime_inputs->global_menu_guard_4b3ca & 0xffu) == 0 &&
      (runtime_inputs->global_menu_enable_2a3a5 & 0xffu) != 0 &&
      runtime_inputs->global_range_byte_length == 0 &&
      state->menu_state_23a74 == 0) {
    events->opaque_call_009b7680 += 1;
    events->continuation_kind = ISAAC_GAME_UPDATE_RESUME_AFTER_MENU_OPEN;
  } else {
    continue_after_menu_open(state, runtime_inputs, events);
  }
  return 1;
}

extern "C" int32_t isaac_game_update_slice_resume_menu_open(
    IsaacGameUpdateSliceState* state,
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs,
    IsaacGameUpdateSliceEvents* events) {
  if (state == nullptr || runtime_inputs == nullptr || events == nullptr ||
      events->continuation_kind != ISAAC_GAME_UPDATE_RESUME_AFTER_MENU_OPEN) {
    return 0;
  }
  continue_after_menu_open(state, runtime_inputs, events);
  return 1;
}

extern "C" int32_t isaac_game_update_slice_resume_menu_update(
    IsaacGameUpdateSliceState* state,
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs,
    IsaacGameUpdateSliceEvents* events) {
  if (state == nullptr || runtime_inputs == nullptr || events == nullptr ||
      events->continuation_kind != ISAAC_GAME_UPDATE_RESUME_AFTER_MENU_UPDATE) {
    return 0;
  }
  continue_after_menu_update(state, runtime_inputs, events, true);
  return 1;
}

namespace {
int32_t sign_extend_low_byte(uint32_t value) {
  const uint32_t byte = value & 0xffu;
  return byte < 0x80u ? (int32_t)byte : (int32_t)byte - 0x100;
}

/* ABI v139 (update-v139-b1-rain-pack): shared-half voucher law
   (contracts-b1-rain NOTES 2.4/2.5). All-or-nothing: dense iter_index,
   UNSIGNED min(quality, decor_count) count closure, seed-chain closure
   row0.seed_in == seed0_echo and seed_out(k) == seed_in(k+1). Rows past
   spawn_count stay unfilled without invalidating. Over-cap or any break
   poisons the WHOLE voucher -> both records' pins fire byte-for-byte. */
static bool isaac_slice_b1_rain_voucher_live(
    const IsaacGameUpdateSliceRuntimeInputs* rt) {
  if (rt == nullptr || rt->b1_rain_rows_ready == 0u) {
    return false;
  }
  const int32_t n = rt->b1_rain_spawn_count;
  if (n < 0 || n > ISAAC_GAME_UPDATE_B1RAIN_SPAWN_MAX_ROWS) {
    return false; /* over-cap poisons whole voucher; never truncate */
  }
  /* count == UNSIGNED min(quality_echo, decor_count_echo) (cmovb @0x802bdc) */
  const uint32_t q = rt->b1_rain_quality_echo;
  const uint32_t d = rt->b1_rain_decor_count_echo;
  const uint32_t cmin = (q <= d) ? q : d;
  if (static_cast<uint32_t>(n) != cmin) {
    return false;
  }
  if (rt->b1_rain_rows[0].shuffle_seed_in != rt->b1_rain_seed0_echo) {
    return false;
  }
  for (int32_t k = 0; k + 1 < n; ++k) {
    if (rt->b1_rain_rows[k].shuffle_seed_out !=
        rt->b1_rain_rows[k + 1].shuffle_seed_in) {
      return false; /* chain-break poisons the voucher */
    }
  }
  for (int32_t k = 0; k < n; ++k) {
    if (rt->b1_rain_rows[k].iter_index != static_cast<uint32_t>(k)) {
      return false; /* PE-order density law */
    }
  }
  return true;
}
void continue_to_frame_manager_updates(
    IsaacGameUpdateSliceState* state,
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs,
    IsaacGameUpdateSliceEvents* events) {
  state->frame_counter_264fc = wrap_increment_i32(state->frame_counter_264fc);
  state->frame_counter_264f8 = wrap_increment_i32(state->frame_counter_264f8);
  if (state->frame_counter_264f8 % 30 == 0 && state->status_22ed4 != 2) {
    state->status_22ed4 = 1;
    state->status_22edc = 2;
  }
  /* B0 pure entry write (mov byte ptr [Room+0x7220], 0) before ordered prefix
     host residuals B1 → B2-host → B3–B11. No pure islands require recapture
     between those host segments (pure B2/B6/B10 apply after B3–B11). Recapture
     room_byte_7220 before handoff. */
  uint8_t byte_7220 = (uint8_t)(state->room_byte_7220 & 0xffu);
  isaac_room_entry_clear_7220(&byte_7220);
  state->room_byte_7220 = byte_7220;
  /* ABI v42–v45 B1 residual wire:
     outer_ready=1 when runtime present (ambient filled); nullptr uses
     ambient defaults (active=1, entry=0) with outer_ready=1 and sfx_ready=0
     so open gate → MONOLITHIC (prior always-host). ABI v43 pure once-flag
     OR still applies when plan.pure_once_flag_apply. ABI v45 splits host
     via isaac_room_b1_wire_decide. */
  const uint32_t room_active =
      runtime_inputs != nullptr ? runtime_inputs->ambient_room_active : 1u;
  const int32_t room_entry =
      runtime_inputs != nullptr ? runtime_inputs->ambient_room_entry_11f0 : 0;
  const int32_t outer_ready = 1; /* ambient defaults always available */
  const int32_t sfx_ready =
      runtime_inputs != nullptr && runtime_inputs->b1_sfx_ready != 0 ? 1 : 0;
  const int32_t buffer_ready =
      runtime_inputs != nullptr && runtime_inputs->b1_buffer_ready != 0 ? 1 : 0;
  const int32_t room_type = state->room_type_8;
  const int32_t desc_field_40 =
      runtime_inputs != nullptr ? runtime_inputs->b1_desc_field_40 : 0;
  const int32_t difficulty = state->difficulty_269c8;
  const int32_t stage_0 =
      runtime_inputs != nullptr ? runtime_inputs->ambient_stage : 1;
  const int32_t nested_field_10 =
      runtime_inputs != nullptr ? runtime_inputs->b1_nested_field_10 : 0;
  const int32_t boss_id =
      runtime_inputs != nullptr ? runtime_inputs->ambient_room_subtype_1bb0 : 0;
  const uint32_t begin_183a4 =
      runtime_inputs != nullptr ? runtime_inputs->b1_begin_183a4 : 0u;
  const uint32_t end_183a8 =
      runtime_inputs != nullptr ? runtime_inputs->b1_end_183a8 : 0u;
  IsaacRoomB1ResidualPlan b1_plan = {};
  isaac_room_b1_wire_decide(
      outer_ready, sfx_ready, buffer_ready, room_active, state->frame_counter_264f8,
      room_entry, room_type, desc_field_40, difficulty, stage_0, nested_field_10,
      state->game_flags_1839c, boss_id, begin_183a4, end_183a8, &b1_plan);
  if (b1_plan.pure_once_flag_apply != 0) {
    isaac_room_b1_flag_or_80000(&state->game_flags_1839c);
  }
  /* ABI v139: shared-half typed contract. Under a LIVE b1_rain voucher
     the spawn-half residual is carried entirely by the outcome rows +
     scalar echoes (exactly-once application: the mirror counters
     observe, they never re-drive); capture absence keeps today's
     byte-for-byte monolith. SFX fragments are OUTSIDE the shared half
     and keep their standing classification. */
  const bool b1_rain_live = isaac_slice_b1_rain_voucher_live(runtime_inputs);
  const bool b1_spawn_residual =
      b1_plan.residual_kind == ISAAC_ROOM_B1_RESIDUAL_SPAWN ||
      b1_plan.residual_kind == ISAAC_ROOM_B1_RESIDUAL_SFX_SPAWN;
  if (b1_spawn_residual && b1_rain_live) {
    uint32_t search_ok_count = 0u;
    uint32_t draws_total = 0u;
    uint32_t stores_7764 = 0u;
    uint32_t repos_count = 0u;
    const int32_t nb1 = runtime_inputs->b1_rain_spawn_count; /* validated by voucher law */
    for (int32_t k = 0; k < nb1; ++k) {
      const IsaacGameUpdateSliceB1RainSpawnRow* r =
          &runtime_inputs->b1_rain_rows[k];
      search_ok_count += (r->search_ok != 0u) ? 1u : 0u;
      draws_total += r->search_draws + r->bind_repos_draws;
      stores_7764 += (r->bind_store_7764 != 0u) ? 1u : 0u;
      repos_count += (r->bind_repositioned != 0u) ? 1u : 0u;
    }
    events->b1_rain_rows_applied = 1u;
    events->b1_rain_spawn_count_echo = static_cast<uint32_t>(
        runtime_inputs->b1_rain_spawn_count);
    events->b1_rain_search_ok_count = search_ok_count;
    events->b1_rain_genrand_draws_total = draws_total;
    events->b1_rain_bind_7764_stores = stores_7764;
    events->b1_rain_bind_repositioned = repos_count;
  }
  if (b1_plan.pure_complete != 0) {
    /* residual NONE */
  } else if (b1_plan.residual_kind == ISAAC_ROOM_B1_RESIDUAL_MONOLITHIC) {
    events->opaque_room_update_prefix_b1 += 1;
  } else if (b1_plan.residual_kind == ISAAC_ROOM_B1_RESIDUAL_SFX) {
    events->opaque_room_update_prefix_b1_sfx += 1;
  } else if (b1_plan.residual_kind == ISAAC_ROOM_B1_RESIDUAL_SPAWN) {
    if (!b1_rain_live) {
      events->opaque_room_update_prefix_b1_spawn += 1;
    }
  } else if (b1_plan.residual_kind == ISAAC_ROOM_B1_RESIDUAL_SFX_SPAWN) {
    events->opaque_room_update_prefix_b1_sfx += 1;
    if (!b1_rain_live) {
      events->opaque_room_update_prefix_b1_spawn += 1;
    }
  } else {
    events->opaque_room_update_prefix_b1 += 1;
  }
  events->continuation_kind = ISAAC_GAME_UPDATE_RESUME_AFTER_ROOM_UPDATE_PREFIX_B1;
}

}  // namespace

/* ABI v72: record 21's no-op decision. Composed from the frame-effect v9
   exports; the branch-by-branch PE transcription is in the header banner.
   Declared outside the unnamed namespace so the Wasm export has external
   linkage. */
extern "C" int32_t isaac_game_update_slice_frame_effect_shell_drop(
    int32_t site_anim, int32_t site_room, int32_t site_dim, int32_t room_18304,
    int32_t room_182d0, uint32_t room_byte1,
    int32_t room_transition_mode_1830c) {
  /* PE 0x006fd8f0 `cmp ebx,-2` / 0x006fd8f5 `xor esi,esi`. */
  int32_t effective_dim = site_dim;
  isaac_frame_effect_6fd7c0_force_dim_room_neg2(site_room, &effective_dim);
  /* PE 0x006fdb34 is a full-word `cmp eax,[edx+0x182d0]`. */
  const int32_t room_indices_equal = room_18304 == room_182d0 ? 1 : 0;
  /* PE 0x006fdb42 is `cmp byte ptr [eax+1],0` — narrow explicitly here so an
     out-of-range argument cannot make the gate read as set. */
  const int32_t room_byte1_nonzero = (room_byte1 & 0xffu) != 0u ? 1 : 0;
  if (isaac_frame_effect_6fd7c0_needs_705ee0_null_player(
          static_cast<uint32_t>(site_anim), room_indices_equal,
          room_byte1_nonzero) != 0) {
    return 0;
  }
  if (isaac_frame_effect_6fd7c0_blue_room_eligible(
          static_cast<uint32_t>(site_anim), effective_dim,
          room_transition_mode_1830c) != 0) {
    return 0;
  }
  return 1;
}

/* ABI v73: the body of Level::TryInitializeBlueRoom (0x0074d4a0) reduced to
   its side-effect-free prefix. Branch-by-branch from the instruction stream;
   the store census that licenses the word "no-op" is in the header banner. */
extern "C" int32_t isaac_game_update_slice_blue_room_74d4a0_noop(
    int32_t current_idx, int32_t destination_idx, int32_t direction) {
  /* 0x0074d4d3 `mov eax,[ebp+0xc]` / 0x0074d4d6 `mov [ebp-0xd0],eax`: arg2 is
     read and parked before either gate, and neither no-op arm reads it back.
     It is a genuine argument, so it stays in the signature. */
  (void)destination_idx;
  /* 0x0074d4dc `cmp ebx,-1` is 83 fb ff — CMP r/m32, imm8 sign-extended — so
     this is a full 32-bit compare against 0xffffffff. Writing it as a compare
     against a narrowed byte, or against a value other than -1, changes the
     answer for 0xff / 0x1ff / 0xffffff00 and for every non-(-1) direction. */
  if (direction == -1) {
    return 1; /* 0x0074d4df je 0x74d6f3 -> xor al,al -> ret, no stores */
  }
  /* 0x0074d4e5 `cmp dword ptr [ebp+8],0` / 0x0074d4e9 `jl 0x74d6f3` — SIGNED,
     so 0x80000000 and 0xffffffff take it and an unsigned read would not. */
  if (current_idx < 0) {
    return 1;
  }
  /* Otherwise 0x0074d4ef `push -1` / `push eax` / 0x0074d4f2
     `call 0x740bc0` (Level::GetRoomByIdx): a host call, so not a no-op. */
  return 0;
}

/* ABI v73: record 21's drop with the blue-room probe resolved. Composed from
   the frame-effect v9 exports and the probe above; never re-derived. */
extern "C" int32_t isaac_game_update_slice_frame_effect_shell_drop_probed(
    int32_t site_anim, int32_t site_room, int32_t site_dim, int32_t room_18304,
    int32_t room_182d0, uint32_t room_byte1,
    int32_t room_transition_mode_1830c, int32_t site_direction) {
  /* PE 0x006fd8f0 `cmp ebx,-2` / 0x006fd8f5 `xor esi,esi`. */
  int32_t effective_dim = site_dim;
  isaac_frame_effect_6fd7c0_force_dim_room_neg2(site_room, &effective_dim);
  /* PE 0x006fdb34 is a full-word `cmp eax,[edx+0x182d0]`. */
  const int32_t room_indices_equal = room_18304 == room_182d0 ? 1 : 0;
  /* PE 0x006fdb42 is `cmp byte ptr [eax+1],0` — narrow explicitly here so an
     out-of-range argument cannot make the gate read as set. */
  const int32_t room_byte1_nonzero = (room_byte1 & 0xffu) != 0u ? 1 : 0;
  if (isaac_frame_effect_6fd7c0_needs_705ee0_null_player(
          static_cast<uint32_t>(site_anim), room_indices_equal,
          room_byte1_nonzero) != 0) {
    /* FUN_00705ee0 at 0x006fdb4f — record 21's one surviving blocker. */
    return 0;
  }
  if (isaac_frame_effect_6fd7c0_blue_room_eligible(
          static_cast<uint32_t>(site_anim), effective_dim,
          room_transition_mode_1830c) == 0) {
    /* The v72 arm: the PE walks to 0x006fdb87 without reaching 0x006fdb78. */
    return 1;
  }
  /* The PE DOES call 0x0074d4a0 here. 0x006fdb6c pushes the shell's own arg2
     as the probe's `direction`, 0x006fdb71 pushes ebx (the site room) as
     `destinationIdx`, 0x006fdb72 pushes [edx+0x18304] as `currentIdx`. If the
     probe is a no-op it also returns AL == 0, so 0x006fdb7d `test al,al`
     leaves ZF set and 0x006fdb84 `cmovne ebx,ecx` does not fire either. */
  return isaac_game_update_slice_blue_room_74d4a0_noop(room_18304, site_room,
                                                       site_direction);
}

/* ABI v74: FUN_00705ee0 (0x00705ee0) reduced to its side-effect-free exits.
   Branch-by-branch from the instruction stream; the store census that licenses
   the word "no-op" is in the header banner. Returns 1 only when the PE writes
   nothing outside its own frame and calls nothing. */
extern "C" int32_t isaac_game_update_slice_rewind_705ee0_noop(
    uint32_t guard_269ea, uint32_t guard_269eb, uint32_t guard_68d70,
    int32_t snapshot_arg, int32_t slot_index_676ac, uint32_t slot_valid_byte,
    int32_t slot_room_19d20, int32_t game_room_18304, int32_t slot_tag_e8,
    int32_t game_tag_0, int32_t slot_arg_1fe2c, int32_t game_frame_264f8,
    int32_t slot_frame_1fe30) {
  /* 0x00705eef / 0x00705efc / 0x00705f09 are all `cmp byte ptr […],0` + `jne
     0x706016`, and 0x706016 is the bare pop/pop/pop/leave/`ret 4` epilogue.
     Narrow explicitly: the PE reads ONE byte, so 0x100 is CLEAR. Dropping any
     of these masks makes a wide capture read as SET and claims a no-op the PE
     does not take. */
  if ((guard_269ea & 0xffu) != 0u) return 1;
  if ((guard_269eb & 0xffu) != 0u) return 1;
  if ((guard_68d70 & 0xffu) != 0u) return 1;
  /* 0x00705f24 `test edi,edi` / 0x00705f26 `js 0x705f9b` — SIGNED, so
     0x80000000 takes it and an unsigned read would not. 0x705f9b is the write
     block, so every `js` below is a NON-no-op. */
  if (slot_index_676ac < 0) return 0;
  /* 0x00705f36 `cmp byte ptr [ecx],dl` with dl == 0 from 0x00705f1c
     `xor edx,edx`, then `je 0x705f9b`: a CLEAR slot byte writes. */
  if ((slot_valid_byte & 0xffu) == 0u) return 0;
  /* 0x00705f40 `cmp eax,[esi+0x18304]` / `jne 0x705f88` and 0x00705f4e
     `cmp eax,[esi]` / `jne 0x705f88`. 0x705f88 is NOT an exit: it stores
     [ecx+0x19d54] and falls through to the write block, so both are 0. */
  if (slot_room_19d20 != game_room_18304) return 0;
  if (slot_tag_e8 != game_tag_0) return 0;
  /* 0x00705f58 `test ebx,ebx` / 0x00705f5a `js 0x705f9b` — SIGNED. This is the
     Update arm: 0x006fdb4d pushes -1, so the slice always lands here. */
  if (snapshot_arg < 0) return 0;
  /* 0x00705f62 `cmp ebx,eax` / 0x00705f64 `je 0x706016` — a full-dword
     equality against the stored argument, and the second true no-op exit. */
  if (snapshot_arg == slot_arg_1fe2c) return 1;
  /* 0x00705f6a `test eax,eax` / 0x00705f6c `js 0x705f9b` — SIGNED, on the
     STORED argument, not the incoming one. */
  if (slot_arg_1fe2c < 0) return 0;
  /* 0x00705f6e `mov eax,[esi+0x264f8]` / 0x00705f74 `sub eax,[ecx+0x1fe30]`
     wraps at 32 bits, and 0x00705f7a `cmp eax,0xf` / 0x00705f7d `jae 0x705f9b`
     is UNSIGNED: delta 15 writes, delta 14 does not, and any delta the signed
     reading would call negative is a huge unsigned and writes. Computing in
     uint32_t is the point — a signed compare here inverts the answer for every
     stale stamp. */
  const uint32_t delta = static_cast<uint32_t>(game_frame_264f8) -
                         static_cast<uint32_t>(slot_frame_1fe30);
  if (delta >= 0xfu) return 0;
  /* 0x00705f7f pop/pop/pop / 0x00705f82 `mov esp,ebp` / `ret 4`. */
  return 1;
}

/* ABI v96 (record idx 20 opaqueFrameEffect6fd7c0Shell depth): FUN_00705ee0
   CALL-ARG law. The frozen -1 snapshot arg is pushed at BOTH Update call
   sites (shell 0x006fdb4d `push -1` -> call @0x006fdb4f; record-30 rewind
   tail 0x00806c0a `push -1` -> call @0x00806c0c). 0x705ee0 is `ret 4` —
   exactly ONE 4-byte stack arg — and reads `esi = [0xc71678]` (Game)
   itself at entry, so there is no ecx thiscall. A negative argument takes
   the SIGNED `test ebx,ebx / js 0x705f9b` at 0x705f58/0x705f5a: the two
   dedupe no-op exits (0x705f62/0x705f7f) are unreachable, so the frozen
   -1 reaches the write block whenever the three entry byte guards are
   clear (the v74 rewind_705ee0_noop probe licenses exactly this). */
extern "C" int32_t isaac_game_update_slice_705ee0_call_arg(void) {
  return ISAAC_GAME_UPDATE_SHELL_REWIND_ARG;
}

/* ABI v96: the ORDER law of the same call seam. Census: 8 direct rel32
   callers of 0x705ee0 image-wide (0x6eb948, 0x6fdb4f, 0x6fdd63, 0x70cb6e,
   0x7a3f0e, 0x7f0545, 0x806c0c, 0x9bbfa3); the two Update-path sites are
   pinned here with their surrounding order:
     - shell (0x006fdb4f): the FIRST host call of the rewrite span — the
       canopy decisions (anim 3/0x10 or room18304==182d0 && byte1 && anim
       != 0xc) converge at the push; AFTER the call the site room is
       re-read `mov edx,[ebp-0x10]` @0x006fdb54, THEN the blue-room probe
       0x74d4a0 fires @0x006fdb78 and `cmovne ebx,0xfffffff0` @0x006fdb84
       rewrites the direction before the engine prefix 0x82ee40 @0x006fdb9b.
     - rewind tail (0x00806c0c): the LAST call — the greed skip path
       (0x806be0 jmp 0x806bff), the bit7-arm (0x806bfd je 0x806c0a) and
       the 0x9bfae0 call (0x806c05) all converge at 0x806c0a, and the
       function exits via the bare ret-4 epilogue @0x806c11..0x806c17
       right after the call (the record-30 law
       isaac_game_update_slice_trigger_clear_rewind_tail_arg fires the
       same 0xffffffff). */
extern "C" void isaac_game_update_slice_705ee0_call_order_plan(
    IsaacGameUpdateSlice705ee0CallOrder* out) {
  if (out == nullptr) {
    return;
  }
  out->shell_call_va = 0x006fdb4fu;
  out->shell_arg = 0xffffffffu;
  out->shell_first_in_span = 1u;
  out->tail_call_va = 0x00806c0cu;
  out->tail_arg = 0xffffffffu;
  out->tail_last = 1u;
  out->receiver_self = 1u;
  out->post_call_reread = 1u;
}

/* ABI v96 (record idx 12 opaqueCall006fd7c0): FUN_00705ee0 write-block
   DECISION laws. The v74 noop probe licenses WHETHER the write block runs;
   these laws license WHAT it does — the nine-store site mask (S1..S9 =
   bits 0..8), the new slot index (edx), the payload word count and the
   SaveState call-arg prep (receiver Game self-loaded from [0xc71678], arg
   = newslot+4). The branch structure mirrors
   isaac_game_update_slice_rewind_705ee0_noop exactly (the composed plan
   consumes it BY REFERENCE); the store census + writer-domain closure are
   in section-notes update-v96-record12-705ee0. Every scalar is
   uint32_t/int32_t — no uint8_t scalar params (Wasm ABI does not narrow
   i32 args). */

/* The 705ee0 slot-record base: Game+0x269ec + idx*0x20660 (PE 0x705fa1
   lea edi,[esi+0x269ec] + 0x705f9b/0x705fb6 imul/add). 32-bit wrap. */
extern "C" uint32_t isaac_game_update_slice_705ee0_slot_base(
    uint32_t game_base, int32_t slot_index) {
  return game_base + ISAAC_GAME_UPDATE_705EE0_SLOT0_OFF +
         static_cast<uint32_t>(static_cast<uint32_t>(slot_index) *
                               ISAAC_GAME_UPDATE_705EE0_SLOT_STRIDE);
}

extern "C" uint32_t isaac_game_update_slice_705ee0_payload_words(void) {
  return ISAAC_GAME_UPDATE_705EE0_PAYLOAD_WORDS;
}

/* The writer-domain closure: the ONLY .text writers of Game+0x676ac are
   the exit-0x6f4520 init @0x6f46fd (-1), this function @0x705fa7 (edx in
   {0, 1-edi, edi}) and the 0x706020 sibling @0x70636f/@0x706388 (0/1).
   Entry indices outside {-1,0,1} cannot occur on the Update path. */
extern "C" int32_t isaac_game_update_slice_705ee0_slot_index_domain(
    int32_t slot_index) {
  return (slot_index == -1 || slot_index == 0 || slot_index == 1) ? 1 : 0;
}

/* Shell-site write-reach with the frozen -1 (PE 0x705f58 test ebx,ebx /
   0x705f5a js 0x705f9b): a NEGATIVE snapshot arg jumps straight to the
   write block, so the two dedupe exits (0x705f62 je / 0x705f7f..0x705f85)
   are unreachable and the write block runs IFF the three entry byte
   guards are clear (record-20 law). WIDE guards (0x100 etc.) read as
   CLEAR — the PE compares ONE byte (0x705eef/0x705efc/0x705f09 cmp byte). */
extern "C" int32_t isaac_game_update_slice_705ee0_write_reached_neg1(
    uint32_t guard_269ea, uint32_t guard_269eb, uint32_t guard_68d70) {
  if ((guard_269ea & 0xffu) != 0u) return 0;
  if ((guard_269eb & 0xffu) != 0u) return 0;
  if ((guard_68d70 & 0xffu) != 0u) return 0;
  return 1;
}

/* The new slot index (edx). Paths (mirror of rewind_705ee0_noop):
   idx<0 / slot invalid -> 0 (PE 0x705f1c xor edx,edx);
   room/tag mismatch -> 1-idx (PE 0x705f8e mov edx,1 / 0x705f93 sub);
   match (incl. the -1 / slot-arg<0 / delta>=0xf writes) -> idx (0x705f56);
   dedupe no-op exits -> 0 (no write; the caller gates on reached). */
extern "C" int32_t isaac_game_update_slice_705ee0_new_slot_index(
    uint32_t guard_269ea, uint32_t guard_269eb, uint32_t guard_68d70,
    int32_t snapshot_arg, int32_t slot_index_676ac, uint32_t slot_valid_byte,
    int32_t slot_room_19d20, int32_t game_room_18304, int32_t slot_tag_e8,
    int32_t game_tag_0, int32_t slot_arg_1fe2c, int32_t game_frame_264f8,
    int32_t slot_frame_1fe30) {
  if ((guard_269ea & 0xffu) != 0u) return 0;
  if ((guard_269eb & 0xffu) != 0u) return 0;
  if ((guard_68d70 & 0xffu) != 0u) return 0;
  if (slot_index_676ac < 0) return 0;
  if ((slot_valid_byte & 0xffu) == 0u) return 0;
  if (slot_room_19d20 != game_room_18304) return 1 - slot_index_676ac;
  if (slot_tag_e8 != game_tag_0) return 1 - slot_index_676ac;
  if (snapshot_arg < 0) return slot_index_676ac;
  if (snapshot_arg == slot_arg_1fe2c) return 0; /* dedupe no-op: no write */
  if (slot_arg_1fe2c < 0) return slot_index_676ac;
  const uint32_t delta = static_cast<uint32_t>(game_frame_264f8) -
                         static_cast<uint32_t>(slot_frame_1fe30);
  if (delta >= 0xfu) return slot_index_676ac;
  return 0; /* dedupe no-op: no write */
}

/* The nine-site store mask. S2/S3/S5/S6/S7/S8/S9 are unconditional in the
   write block (0x1f6); S1 (bit 0, 0x705f95 oldslot+0x19d54) adds ONLY on
   the room/tag mismatch path; S4 (bit 3, 0x705fd0 newslot+0x48 restore)
   adds ONLY on the match path ([ebp-1]==1). 0 when no write. */
extern "C" int32_t isaac_game_update_slice_705ee0_store_mask(
    uint32_t guard_269ea, uint32_t guard_269eb, uint32_t guard_68d70,
    int32_t snapshot_arg, int32_t slot_index_676ac, uint32_t slot_valid_byte,
    int32_t slot_room_19d20, int32_t game_room_18304, int32_t slot_tag_e8,
    int32_t game_tag_0, int32_t slot_arg_1fe2c, int32_t game_frame_264f8,
    int32_t slot_frame_1fe30) {
  if ((guard_269ea & 0xffu) != 0u) return 0;
  if ((guard_269eb & 0xffu) != 0u) return 0;
  if ((guard_68d70 & 0xffu) != 0u) return 0;
  if (slot_index_676ac < 0) return ISAAC_GAME_UPDATE_705EE0_STORE_MASK_BASE;
  if ((slot_valid_byte & 0xffu) == 0u) return ISAAC_GAME_UPDATE_705EE0_STORE_MASK_BASE;
  if (slot_room_19d20 != game_room_18304 || slot_tag_e8 != game_tag_0) {
    return ISAAC_GAME_UPDATE_705EE0_STORE_MASK_BASE |
           ISAAC_GAME_UPDATE_705EE0_STORE_MASK_S1;
  }
  if (snapshot_arg < 0) {
    return ISAAC_GAME_UPDATE_705EE0_STORE_MASK_BASE |
           ISAAC_GAME_UPDATE_705EE0_STORE_MASK_S4;
  }
  if (snapshot_arg == slot_arg_1fe2c) return 0; /* dedupe no-op */
  if (slot_arg_1fe2c < 0) {
    return ISAAC_GAME_UPDATE_705EE0_STORE_MASK_BASE |
           ISAAC_GAME_UPDATE_705EE0_STORE_MASK_S4;
  }
  const uint32_t delta = static_cast<uint32_t>(game_frame_264f8) -
                         static_cast<uint32_t>(slot_frame_1fe30);
  if (delta >= 0xfu) {
    return ISAAC_GAME_UPDATE_705EE0_STORE_MASK_BASE |
           ISAAC_GAME_UPDATE_705EE0_STORE_MASK_S4;
  }
  return 0; /* dedupe no-op */
}

/* The SaveState call-arg prep: the call site pushes newslot+4 (PE
   0x705fbe lea eax,[edi+4] / 0x705fc1 push eax / 0x705fc2 call 0x6f9000)
   with the receiver loaded inside (esi=[0xc71678] at entry, mov ecx,esi
   @0x705fad — no thiscall on the caller side). */
extern "C" uint32_t isaac_game_update_slice_705ee0_save_state_arg_prep(
    uint32_t game_base, int32_t new_slot_index) {
  return isaac_game_update_slice_705ee0_slot_base(game_base, new_slot_index) +
         4u;
}

/* The COMPOSED decision seam. reached is consumed BY REFERENCE from the
   v74 noop probe (never re-derived); the mask/index/arg laws fill the
   plan. Returns reached (1 = the host edge runs the write block). */
extern "C" int32_t isaac_game_update_slice_705ee0_write_plan(
    uint32_t guard_269ea, uint32_t guard_269eb, uint32_t guard_68d70,
    int32_t snapshot_arg, int32_t slot_index_676ac, uint32_t slot_valid_byte,
    int32_t slot_room_19d20, int32_t game_room_18304, int32_t slot_tag_e8,
    int32_t game_tag_0, int32_t slot_arg_1fe2c, int32_t game_frame_264f8,
    int32_t slot_frame_1fe30, uint32_t game_base,
    IsaacGameUpdateSlice705ee0WritePlan* out) {
  const int32_t reached =
      isaac_game_update_slice_rewind_705ee0_noop(
          guard_269ea, guard_269eb, guard_68d70, snapshot_arg,
          slot_index_676ac, slot_valid_byte, slot_room_19d20,
          game_room_18304, slot_tag_e8, game_tag_0, slot_arg_1fe2c,
          game_frame_264f8, slot_frame_1fe30) == 0
          ? 1
          : 0;
  if (out != nullptr) {
    out->reached = reached;
    out->new_slot_index = isaac_game_update_slice_705ee0_new_slot_index(
        guard_269ea, guard_269eb, guard_68d70, snapshot_arg,
        slot_index_676ac, slot_valid_byte, slot_room_19d20, game_room_18304,
        slot_tag_e8, game_tag_0, slot_arg_1fe2c, game_frame_264f8,
        slot_frame_1fe30);
    out->store_mask = static_cast<uint32_t>(
        isaac_game_update_slice_705ee0_store_mask(
            guard_269ea, guard_269eb, guard_68d70, snapshot_arg,
            slot_index_676ac, slot_valid_byte, slot_room_19d20,
            game_room_18304, slot_tag_e8, game_tag_0, slot_arg_1fe2c,
            game_frame_264f8, slot_frame_1fe30));
    out->payload_words = ISAAC_GAME_UPDATE_705EE0_PAYLOAD_WORDS;
    out->save_state_fire = reached;
    out->save_state_arg = isaac_game_update_slice_705ee0_save_state_arg_prep(
        game_base, out->new_slot_index);
    out->old_slot_base =
        isaac_game_update_slice_705ee0_slot_base(game_base, slot_index_676ac);
    out->new_slot_base =
        isaac_game_update_slice_705ee0_slot_base(game_base, out->new_slot_index);
  }
  return reached;
}

/* ABI v74: record 21's drop with BOTH callees probed. Composed from the
   frame-effect v9 exports and the two probes; never re-derived. */
extern "C" int32_t isaac_game_update_slice_frame_effect_shell_drop_rewound(
    int32_t site_anim, int32_t site_room, int32_t site_dim, int32_t room_18304,
    int32_t room_182d0, uint32_t room_byte1,
    int32_t room_transition_mode_1830c, int32_t site_direction,
    uint32_t rewind_guard_269ea, uint32_t rewind_guard_269eb,
    uint32_t rewind_guard_68d70) {
  /* PE 0x006fd8f0 `cmp ebx,-2` / 0x006fd8f5 `xor esi,esi`. */
  int32_t effective_dim = site_dim;
  isaac_frame_effect_6fd7c0_force_dim_room_neg2(site_room, &effective_dim);
  /* PE 0x006fdb34 is a full-word `cmp eax,[edx+0x182d0]`. */
  const int32_t room_indices_equal = room_18304 == room_182d0 ? 1 : 0;
  /* PE 0x006fdb42 is `cmp byte ptr [eax+1],0`. */
  const int32_t room_byte1_nonzero = (room_byte1 & 0xffu) != 0u ? 1 : 0;
  if (isaac_frame_effect_6fd7c0_needs_705ee0_null_player(
          static_cast<uint32_t>(site_anim), room_indices_equal,
          room_byte1_nonzero) != 0) {
    /* The PE DOES call 0x00705ee0 here, with the frozen -1 from 0x006fdb4d.
       A negative argument takes 0x00705f5a `js 0x705f9b`, so the two dedupe
       exits are unreachable and the slot observations below cannot change the
       answer — they are passed as zeros deliberately, and a test sweeps them
       to prove the invariant instead of trusting this comment.

       NEGATIVITY is the entire precondition for those zeros, so pin it here
       rather than in a comment: with a non-negative argument the probe would
       reach 0x00705f5c and start reading slot observations this call site
       does not have, and the zeros would silently become invented data. */
    static_assert(ISAAC_GAME_UPDATE_SHELL_REWIND_ARG < 0,
                  "the zeros below are only sound for a negative argument");
    if (isaac_game_update_slice_rewind_705ee0_noop(
            rewind_guard_269ea, rewind_guard_269eb, rewind_guard_68d70,
            ISAAC_GAME_UPDATE_SHELL_REWIND_ARG,
            /*slot_index_676ac=*/0, /*slot_valid_byte=*/0,
            /*slot_room_19d20=*/0, /*game_room_18304=*/0, /*slot_tag_e8=*/0,
            /*game_tag_0=*/0, /*slot_arg_1fe2c=*/0, /*game_frame_264f8=*/0,
            /*slot_frame_1fe30=*/0) == 0) {
      return 0;
    }
    /* The snapshot no-oped, so the PE walks on to 0x006fdb57 exactly as if it
       had never been called. Fall through to the blue-room decision. */
  }
  if (isaac_frame_effect_6fd7c0_blue_room_eligible(
          static_cast<uint32_t>(site_anim), effective_dim,
          room_transition_mode_1830c) == 0) {
    return 1;
  }
  return isaac_game_update_slice_blue_room_74d4a0_noop(room_18304, site_room,
                                                       site_direction);
}

/* ABI v102 (record idx 12 opaqueCall006fd7c0): transition/blue-room capture
   pack — the LANE-FREE arm-selection laws (site args + state + already-
   committed lanes only; census update-v102-record12-tran, disasm-6fd7c0-full).
   Every gate consumes the frame-effect family law BY REFERENCE; the
   capture-dependent arms (anim-0xc special route / player-loop gate /
   anim-3 room dispatch / engine arg0 cmov / 0x6f0070 terminal pred) are
   staged in the unit NOTES §lane-requests. All params uint32_t/int32_t —
   no uint8_t scalar params (Wasm i32 args are not narrowed; byte gates
   re-narrow in-body). */
extern "C" int32_t isaac_game_update_slice_6fd7c0_args_valid(
    int32_t site_room, uint32_t site_anim, int32_t site_dim) {
  /* The A entry-validation gate. PE: 0x006fd7f6 `cmp eax,0xbc / ja` (the
     lea wrap is UNSIGNED), 0x006fd804 `cmp edi,0x16 / ja` (unsigned),
     0x006fd810 `cmp esi,3 / jl` (SIGNED — dim >= 3 dies). */
  return isaac_frame_effect_6fd7c0_args_valid(site_room, site_anim, site_dim);
}

/* The ordered fatal classifier (PE check order: room, then anim, then dim).
   0 = OK; 1/2/3 = the failing check (family VALIDATE_FAIL_* constants). */
extern "C" int32_t isaac_game_update_slice_6fd7c0_validate_fail_kind(
    int32_t site_room, uint32_t site_anim, int32_t site_dim) {
  if (isaac_game_update_slice_6fd7c0_args_valid(site_room, site_anim,
                                                site_dim) != 0) {
    return ISAAC_FRAME_EFFECT_VALIDATE_OK;
  }
  if (((static_cast<uint32_t>(site_room) + 0x14u) & 0xffffffffu) > 0xbcu) {
    return ISAAC_FRAME_EFFECT_VALIDATE_FAIL_ROOM;
  }
  if (site_anim > 0x16u) {
    return ISAAC_FRAME_EFFECT_VALIDATE_FAIL_ANIM;
  }
  return ISAAC_FRAME_EFFECT_VALIDATE_FAIL_DIM;
}

/* The fatal string the failing check pushes (0x006fdbdd / 0x006fdbd6 push
   sites; the shared log call 0xa112c0 follows at 0x006fdbe4). */
extern "C" uint32_t isaac_game_update_slice_6fd7c0_fatal_string_va(
    int32_t fail_kind) {
  switch (fail_kind) {
    case ISAAC_FRAME_EFFECT_VALIDATE_FAIL_ROOM:
      return ISAAC_FRAME_EFFECT_FATAL_ROOM_STR_VA;
    case ISAAC_FRAME_EFFECT_VALIDATE_FAIL_ANIM:
      return ISAAC_FRAME_EFFECT_FATAL_ANIM_STR_VA;
    case ISAAC_FRAME_EFFECT_VALIDATE_FAIL_DIM:
      return ISAAC_FRAME_EFFECT_FATAL_DIM_STR_VA;
    default:
      return 0u;
  }
}

/* The shared fatal log level (push 8 at 0x006fdbe2). */
extern "C" int32_t isaac_game_update_slice_6fd7c0_fatal_level(void) {
  return ISAAC_FRAME_EFFECT_FATAL_LEVEL;
}

/* The blue-room arm-selection gate: the 0x74d4a0 probe at 0x006fdb6c is
   REACHED iff anim==0 (0x006fdb57 `test edi,edi / jne 0x6fdb87`) AND
   (dim < 0 SIGNED (0x006fdb5b `js 0x6fdb6c`) OR dim == [Game+0x1830c]
   (0x006fdb64 `cmp [eax+0x1830c],esi / jne 0x6fdb87`)). Site args + the
   state mode lane — NO new capture (this is why the v73 drop works). */
extern "C" int32_t isaac_game_update_slice_6fd7c0_blue_room_reach(
    uint32_t site_anim, int32_t site_dim, int32_t room_transition_mode_1830c) {
  return isaac_frame_effect_6fd7c0_blue_room_eligible(
      site_anim, site_dim, room_transition_mode_1830c);
}

/* The blue-room REWRITE value: 0x006fdb7f `mov ecx,0xfffffff0` /
   0x006fdb84 `cmovne ebx,ecx` — the engine room arg becomes -0x10 when the
   probe returned nonzero. VALUE law only (the probe RESULT is the staged
   transition_6fd7c0_blue_probe_74d4a0 lane). */
extern "C" int32_t isaac_game_update_slice_6fd7c0_blue_room_apply_index(
    int32_t room_index) {
  int32_t out = room_index;
  isaac_frame_effect_6fd7c0_apply_blue_room_index(&out);
  return out;
}

/* The engine-prefix arm-selection gate: the 0x82ee40 call at 0x006fdb9b is
   reached iff the entry validation passed AND the mode-4 early return
   (ret 0x14 @0x006fd877) did not fire. The anim-0xc special alt tail
   (0x006fd8eb jmp 0x006fd82c -> the SFX build, returns before the engine)
   is unreachable at the Update sites (site A anim 20 / site B anim 0; the
   special requires anim==0xc + [Game+0x0]==1 + the 0x74bac0/0x6f8120
   probes — the staged transition pack names those lanes). valid + mode4
   are themselves in-module (args_valid + the mode-4 state law). */
extern "C" int32_t isaac_game_update_slice_6fd7c0_engine_prefix_fires(
    int32_t valid, int32_t mode4) {
  if (valid == 0) {
    return 0;
  }
  if (mode4 != 0) {
    return 0;
  }
  return 1;
}

/* ABI v104 (record idx 12 opaqueCall006fd7c0): the transition-pack
   CAPTURE-DEPENDENT arm laws (wave update-v104-record12-wire; census
   update-v102-record12-tran). These consume the COMMITTED pack lanes
   (transition_6fd7c0_* @14292..14324) + site args; byte-gated inputs are
   FULL-DWORD lanes re-narrowed & 0xff in-body (the PE gates are AL byte
   tests). No uint8_t scalar params. */

/* C arm selector: 0 none / 1 REWRITE {anim 3, dim 0} / 2 NESTED. Gate =
   anim==0xc (0x6fd87a cmp $0xc,%edi FULL-DWORD) && game0==1 (0x6fd87f
   cmpl $0x1,(%edx) FULL-DWORD) && (alt&0xff)==0 (0x6fd889 test %al,%al /
   jne) && room_eq!=0 (0x6fd88d..0x6fd899 cmp 0x182d0,0x18304) &&
   (byte1&0xff)!=0 (0x6fd8a1 cmpb $0x0,0x1(%eax)). Open && (route&0xff)!=0
   -> 1 (0x6fd8b2 test %al,%al / je 0x6fd8c1; the 0x6fd8b9 lea -0xe /
   0x6fd8bc +5 rewrite); open && (route&0xff)==0 -> 2 (nested 0x6fdc10). */
extern "C" int32_t isaac_game_update_slice_6fd7c0_anim0xc_route(
    uint32_t anim, uint32_t game0, uint32_t alt_probe, int32_t room_eq,
    int32_t room_byte1, uint32_t route_probe) {
  if (anim != 0xcu) {
    return 0;
  }
  if (game0 != 1u) {
    return 0;
  }
  if ((alt_probe & 0xffu) != 0u) {
    return 0;
  }
  if (room_eq == 0) {
    return 0;
  }
  if ((room_byte1 & 0xffu) == 0u) {
    return 0;
  }
  return (route_probe & 0xffu) != 0u ? 1 : 2;
}

/* The StageTransition typed-event predicate (@968): 1 iff the C arm routes
   NESTED. Consumes the route selector BY REFERENCE (never re-derived). */
extern "C" int32_t isaac_game_update_slice_6fd7c0_stage_transition_reach(
    uint32_t anim, uint32_t game0, uint32_t alt_probe, int32_t room_eq,
    int32_t room_byte1, uint32_t route_probe) {
  return isaac_game_update_slice_6fd7c0_anim0xc_route(
             anim, game0, alt_probe, room_eq, room_byte1, route_probe) == 2
             ? 1
             : 0;
}

/* D arm: the 0x8279a0 player-loop gate opens (0x6fd91d call / 0x6fd922
   test %al,%al) iff (anim==3 || anim==0xc) (0x6fd904/0x6fd909 cmp
   FULL-DWORD) && arg3!=0 (0x6fd8fa cmpl $0x0,0x14(%ebp) FULL-DWORD) &&
   (player_probe&0xff)!=0. The arg3 is the site's 4th stack arg — a SIGNED
   -1 opens the arm. */
extern "C" int32_t isaac_game_update_slice_6fd7c0_player_loop_reach(
    uint32_t anim, int32_t arg3, uint32_t player_probe) {
  if (anim != 3u && anim != 0xcu) {
    return 0;
  }
  if (arg3 == 0) {
    return 0;
  }
  if ((player_probe & 0xffu) == 0u) {
    return 0;
  }
  return 1;
}

/* D arm: the anim-3 ROOM-TYPE dispatch selector — 0 none / 1 0x425ac0
   (evented @976) / 2 direct-705ee0. The dispatch runs only when the
   player-loop gate CLOSED (player_probe&0xff)==0 and anim==3 (0x6fdad2
   cmp $0x3,%edi / jne 0x6fdb29). Type = [[Game+0x18300]+8] FULL-DWORD
   (0x6fdadd mov 0x8(%ecx),%eax; cmp $0xb / $0x11 / $0xa / $0x3); the
   subroom flag = [[[Game+0x18300]+4]+0x44] BYTE bit0 (0x6fdae8 testb
   $0x1,0x44(%eax)): type 0xb/0x11 with the flag clear -> 0x425ac0; flag
   set -> 705ee0 (0x6fdb4d); type 0xa/0x3 -> 0x425ac0; else 705ee0. */
extern "C" int32_t isaac_game_update_slice_6fd7c0_room_dispatch_reach(
    uint32_t anim, uint32_t player_probe, uint32_t room_type_8,
    uint32_t subroom_flag_44) {
  if (anim != 3u) {
    return 0;
  }
  if ((player_probe & 0xffu) != 0u) {
    return 0;
  }
  if ((room_type_8 == 0xbu || room_type_8 == 0x11u) &&
      (subroom_flag_44 & 0xffu & 1u) == 0u) {
    return 1;
  }
  if (room_type_8 == 0xau || room_type_8 == 0x3u) {
    return 1;
  }
  return 2;
}

/* E arm: the 0x82ee40 arg0 cmov (0x6fdb7f mov $0xfffffff0,%ecx /
   0x6fdb84 cmovne %ecx,%ebx): the blue-room probe RESULT (AL byte) != 0
   rewrites the engine room arg to -0x10. Feeds the host fold re-issue. */
extern "C" int32_t isaac_game_update_slice_6fd7c0_engine_room_arg(
    int32_t room_index, uint32_t blue_probe) {
  return (blue_probe & 0xffu) != 0u ? -0x10 : room_index;
}

/* F arm: the 0x6f0070 engine predicate (0x6fdba6 call / 0x6fdbab test
   %al,%al / je 0x6fdbbb — AL byte): nonzero -> [Game+0x265c0]=0
   (0x6fdbb1 movl). The 0x67744 byte store stays unconditional on the P4
   family law. */
extern "C" int32_t isaac_game_update_slice_6fd7c0_terminal_265c0_clear(
    uint32_t engine_pred_probe) {
  return (engine_pred_probe & 0xffu) != 0u ? 1 : 0;
}

/* ABI v75: record 22's engine-prefix no-op decision (FUN_0082ee40 entry ..
   the 0x0082ef74 join).

   Transcribed branch-by-branch from the instruction stream, not from a
   description of the function:

     0x0082ee96  call 0xa112c0            <- always; logger, platform primitive
     0x0082ee9e  cmp byte ptr [edi+0x141], 0
     0x0082eea5  jne 0x0082ef74           <- taken => skip arm => DROPPABLE
     0x0082eeab..0x0082ef73               <- string build + 0x0040bd50 + free

   The compare is a BYTE compare, so only the low 8 bits decide. Narrow here
   explicitly rather than in the signature; a uint8_t parameter would let -O2
   delete this mask and make 0x100 drop a host event the PE raises. */
extern "C" int32_t isaac_game_update_slice_engine_prefix_drop_latched(
    uint32_t engine_anm2_latch) {
  return (engine_anm2_latch & 0xffu) != 0u ? 1 : 0;
}

/* ABI v77: record 22's ANM2::Load lane decision (the anm2 family v7 wire
   contract). Returns 1 exactly when the gated arm runs AND the blob captures
   are complete:

     - blob_ready and latch_ready are both set (the host supplies the lane
       captures as of PE 0x0082ef1d, after the log and the pre-lane host
       half; blob without latch is an undefined capture and stays host);
     - the latch LOW BYTE is clear — PE 0x0082ee9e `cmp byte ptr
       [edi+0x141],0` / 0x0082eea5 `jne 0x0082ef74` is a byte test, so
       0x100 / 0xffffff00 have a clear low byte and the load RUNS (a
       uint8_t parameter would let -O2 delete this mask);
     - both counts fit the blob caps (the PE walks are UNSIGNED:
       `cmp [esi+0x80],ebx / jbe` entry, `jb` back-edge; the extras gate is
       a full-word `test edx,edx / je`).

   Every scalar parameter is uint32_t — no uint8_t scalar parameters. */
extern "C" int32_t isaac_game_update_slice_engine_anm2_lane_pure(
    uint32_t engine_anm2_blob_ready, uint32_t engine_anm2_latch_ready,
    uint32_t engine_anm2_layer_count, uint32_t engine_anm2_extra_count,
    uint32_t engine_anm2_latch) {
  if (engine_anm2_blob_ready == 0u || engine_anm2_latch_ready == 0u) return 0;
  if ((engine_anm2_latch & 0xffu) != 0u) return 0;
  if (engine_anm2_layer_count > ISAAC_GAME_UPDATE_ANM2_MAX_LAYERS) return 0;
  if (engine_anm2_extra_count > ISAAC_GAME_UPDATE_ANM2_MAX_EXTRAS) return 0;
  return 1;
}

/* ABI v77: applies the S1..S6 observable-store lane of ANM2::Load
   (0x0040bd50, exact ZHL) from the runtime-input blob onto sparse state and
   events. Defensive: re-checks lane_pure and reads every input from the
   runtime-inputs struct — never a caller-supplied plan. Returns 1 when
   applied, 0 otherwise (lane off; the v76 host event performs everything).

   PE order and laws, transcribed from the 111-instruction body:

     S1 0x0040bdb2  byte  [this+0x109] = 1        (UNCONDITIONAL; BYTE store
        — high bytes of the captured latch word are preserved)
     S2 0x0040bdb9  dword [this+0x10c] = 0xffffffff (UNCONDITIONAL)
     loop 1: i = 0; while i < u32[this+0x80] (unsigned entry `jbe`, back-edge
        `jb`); layer name = resolved bytes (host did the SSO-select, exactly
        like the PE: data == 0 -> "" ; else capacity < 0x10 ? data+8 :
        *(data+8)); strcmp(name,"shadow") == 0 -> S3 dword [this+0x10c] = i
        (LAST match wins, no break); name[0] == '*' -> S4 dword
        [layer+0x8c] |= 5 (heap array OUTSIDE the capture ABI — published as
        star_layer_mask for the host) AND S5 dword [this+0x110] |= 0x400.
     loop 2: u32[this+0x88] == 0 skips ENTIRELY (the PE does not even load
        [this+0x84]); per extra (stride 0x18): first byte '*' -> S6 dword
        [this+0x110] |= 0x800.

   The shadow strcmp is the MSVC inlined two-byte loop normalized to -1/0/+1
   and tested with `test eax,eax / jne`; equality therefore needs
   name[0..5] == "shadow" AND name[6] == '\0' — strcmp stops at the first
   NUL in either operand, so bytes past name[6] are dead and the 8-byte
   capture is provably sufficient. The '*' test reads byte 0 only. */
extern "C" int32_t isaac_game_update_slice_engine_anm2_load_lane(
    IsaacGameUpdateSliceState* state,
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs,
    IsaacGameUpdateSliceEvents* events) {
  if (state == nullptr || runtime_inputs == nullptr || events == nullptr) {
    return 0;
  }
  if (isaac_game_update_slice_engine_anm2_lane_pure(
          runtime_inputs->engine_anm2_blob_ready,
          runtime_inputs->engine_anm2_latch_ready,
          runtime_inputs->engine_anm2_layer_count,
          runtime_inputs->engine_anm2_extra_count,
          runtime_inputs->engine_anm2_latch) == 0) {
    return 0;
  }
  const uint32_t layer_count = runtime_inputs->engine_anm2_layer_count;
  const uint32_t extra_count = runtime_inputs->engine_anm2_extra_count;
  const uint32_t latch_pre = runtime_inputs->engine_anm2_latch;
  const uint32_t flags_pre = runtime_inputs->engine_anm2_bitflags_110_pre;
  state->engine_anm2_loaded = (latch_pre & 0xffffff00u) | 1u; /* S1 */
  uint32_t slot_10c = 0xffffffffu;                            /* S2 */
  uint32_t star_mask = 0u;
  uint32_t flags = flags_pre;
  for (uint32_t i = 0; i < layer_count; ++i) {
    const uint8_t* name = runtime_inputs->engine_anm2_layer_names[i];
    if (name[0] == 's' && name[1] == 'h' && name[2] == 'a' &&
        name[3] == 'd' && name[4] == 'o' && name[5] == 'w' &&
        name[6] == '\0') {
      slot_10c = i; /* S3 — last match wins */
    }
    if (name[0] == '*') {        /* 0x0040be31 cmp byte ptr [edi],0x2a */
      star_mask |= 1u << i;      /* S4 — heap layer, host applies */
      flags |= 0x400u;           /* S5 */
    }
  }
  state->engine_anm2_slot_10c = slot_10c;
  for (uint32_t j = 0; j < extra_count; ++j) {
    const uint8_t* name = runtime_inputs->engine_anm2_extra_names[j];
    if (name[0] == '*') {
      flags |= 0x800u;           /* S6 */
    }
  }
  state->engine_anm2_bitflags_110 = flags;
  events->engine_anm2_lane_applied = 1;
  events->engine_anm2_star_layer_mask = star_mask;
  return 1;
}

/* ABI v95: record idx 21 ANM2::Load frame decision laws (PE
   0x0040bd50..0x0040be99, 111 insns, exact ZHL). The record's gated arm
   (FUN_0082ee40 @ 0x0082ef1a lea ecx,[edi+0x38]) calls ANM2::Load with
   `push &str` (the caller's copy of the .rdata constant
   "gfx/ui/boss/versusscreen.anm2" @ 0xb6cda8) and `push 1` (loadgraphics,
   UNCONDITIONAL). These laws publish the PURE part of the frame — WHICH of
   the six pre-lane host callees fire, and the ordered host-call count —
   leaving the host callees themselves untouched (prologue 0x40e2b0, assign
   0x40ccd0, cache guard 0x40db90, cache fetch 0x40e110, loader 0x40c000,
   anim applies 0x408830 x2). The 6 observable stores S1..S6 need NO body
   (v77 lane): S1/S2 are UNCONDITIONAL (0x40bdb2 byte latch=1 preserving
   high bytes, 0x40bdb9 dword 0xffffffff); S3 (shadow index, last-match) and
   S5/S6 (|=0x400/|=0x800) are decided by the pure 8-byte name scans; S4
   (heap [layer+0x8c] |=5) by the same '*' scan, published as
   engineAnm2StarLayerMask — the closure read census (135 functions from
   {0x0082ee40, 0x0040c000}) finds ZERO [*+0x8c] readers on the Update
   path, so no typed host apply is needed. Every scalar param is uint32_t
   (no uint8_t scalar params; Wasm i32 args are not narrowed). */

/* PE 0x0040bd59: cmp dword ptr [esi+0x10],0 / je 0x40bd65 — FULL-DWORD
   gate on the pre-call filename size (recv+0x10): nonzero runs the
   0x0040e2b0 prologue host. 0x100 / 0xffffff00 are PRESENT — a low-byte
   test would invert them (uint8_t-param trap). */
extern "C" int32_t isaac_game_update_slice_engine_anm2_load_path_present(
    uint32_t path_size_10) {
  return (path_size_10 != 0u) ? 1 : 0;
}

/* PE 0x0040bd68: cmp esi,edi / je 0x40bd81 — ADDRESS equality over the
   full 32 bits; 1 when recv == path (the 0x0040ccd0 string assign is
   skipped). */
extern "C" int32_t isaac_game_update_slice_engine_anm2_load_path_is_self(
    uint32_t this_addr, uint32_t path_addr) {
  return (this_addr == path_addr) ? 1 : 0;
}

/* PE 0x0040bd8e: cmp byte ptr [ebp+0xc],0 / je 0x40bd9c — LOW-BYTE gate
   on the loadgraphics arg: runs the 0x0040c000 loader host iff the byte
   is nonzero. The module owns the narrowing (uint32_t param; the wasm
   i32 arrives unmasked): 0x1ff / 0xffffffff RUN it; 0x100 / 0xffffff00
   have a CLEAR low byte and are SKIPPED. The arg slot is reused as the
   layer-offset counter at 0x40bdd1 AFTER this gate, so the law reads the
   arg pre-state. */
extern "C" int32_t isaac_game_update_slice_engine_anm2_load_graphics_needed(
    uint32_t loadgraphics_in) {
  return ((loadgraphics_in & 0xffu) != 0u) ? 1 : 0;
}

/* The composed ordered host-call law of the frame (PE order):
     H1 prologue     0x40e2b0  iff path_size != 0            (0x40bd59)
     H2 assign       0x40ccd0  iff !is_self                  (0x40bd68)
     H3 cache guard  0x40db90  ALWAYS                        (0x40bd81)
     H4 cache fetch  0x40e110  ALWAYS                        (0x40bd88)
     H5 loader       0x40c000  iff graphics low byte         (0x40bd8e)
     H6a/H6b anim    0x408830  (recv+0x30, recv+0x50) ALWAYS (0x40bd9c)
   count = 4 + !is_self + path_present + graphics_needed. */
extern "C" int32_t isaac_game_update_slice_engine_anm2_load_frame_host_calls(
    uint32_t path_size_10, uint32_t this_addr, uint32_t path_addr,
    uint32_t loadgraphics_in) {
  int32_t count = 4;
  if (isaac_game_update_slice_engine_anm2_load_path_is_self(this_addr,
                                                            path_addr) == 0) {
    count += 1; /* H2 assign */
  }
  if (isaac_game_update_slice_engine_anm2_load_path_present(path_size_10) != 0) {
    count += 1; /* H1 prologue */
  }
  if (isaac_game_update_slice_engine_anm2_load_graphics_needed(
          loadgraphics_in) != 0) {
    count += 1; /* H5 loader */
  }
  return count;
}

/* Update-site law (record idx 21 gated arm, lane-on fixed point): recv =
   Game+0x1b874; the path is the caller's copy of the .rdata constant —
   never == recv (is_self 0); loadgraphics `push 1` is unconditional
   (0x0082ef0d); the latch low byte clear (PE 0x0082ee9e BYTE test) means
   never loaded, so the pre-call filename size [recv+0x10] is 0.
   -> 4 + 1 + 0 + 1 = 6 host calls on every ANM2::Load this record runs. */
extern "C" int32_t isaac_game_update_slice_engine_anm2_load_site_host_calls(
    void) {
  return 6;
}

/* ABI v96 (record idx 21 opaqueRoomTransitionEnginePrefix depth): ANM2::Load
   LATCH one-shot laws. Latch byte = Game+0x1b97d = engine-base+0x141
   (engine base = Game+0x1b83c) = recv+0x109 (recv = Game+0x1b874).
   S1 @0x0040bdb2 `mov byte ptr [esi+0x109],1` (UNCONDITIONAL) is the ONLY
   writer on the Update path: image-wide disp-0x141 census finds exactly 3
   accessors (0x70e447 mov byte [edi+0x141],al — a WRITE in a non-closure
   function; 0x8db65e / 0x8dba13 cmp), NONE inside the prefix's 15-function
   closure; absolute Game+0x1b97d has ZERO references; the recv-relative
   disp-0x109 accesses (39 image-wide) never alias Game+0x1b97d except via
   the engine base. => the latch goes 0->1 on the first ANM2::Load and
   NEVER clears: the prefix arm (PE 0x82ee9e `cmp byte [edi+0x141],0` /
   jne 0x82ef74) is FIRST-LOAD-ONLY, at most once per Game object. */

/* S1's byte-store value (PE 0x0040bdb2): the low byte is forced 1, the
   high bytes of the captured latch word are preserved (a BYTE store never
   touches them; the v77 lane posts this to state->engine_anm2_loaded). */
extern "C" uint32_t isaac_game_update_slice_engine_anm2_latch_after_load(
    uint32_t latch_pre) {
  return (latch_pre & 0xffffff00u) | 1u;
}

/* PE 0x0082ee9e — BYTE gate, positive form: the ANM2::Load arm RUNS iff
   the latch low byte is clear (0x100 / 0xffffff00 have a clear low byte
   and DO run; the uint8_t-param trap would let -O2 delete the mask).
   Negative form: isaac_game_update_slice_engine_prefix_drop_latched. */
extern "C" int32_t isaac_game_update_slice_engine_anm2_load_arm_run(
    uint32_t latch) {
  return ((latch & 0xffu) == 0u) ? 1 : 0;
}

/* The one-shot invariant: a load ALWAYS SETS the latch and never clears it
   (latch_after == latch_after_load(latch_pre)); combined with arm_run the
   arm fires at most once (0 -> 1, then closed for the Game object's life). */
extern "C" int32_t isaac_game_update_slice_engine_anm2_latch_one_shot(
    uint32_t latch_pre, uint32_t latch_after) {
  return (latch_after ==
          isaac_game_update_slice_engine_anm2_latch_after_load(latch_pre))
             ? 1
             : 0;
}

/* ABI v97 (wave-22 Unit A, record 22 rank opaqueRoomTransitionEnginePrefix):
   TYPED HOST-LEAF laws of the record's pre-lane host half. The six callees
   of ANM2::Load (0x0040bd50..0x0040be99, exact ZHL) stay HOST until Unit B's
   standing LoadImage/cache decision; these exports NAME the leaves (VAs,
   args, write offsets, gates) in pure form so the host edge is typed.
   Exports-only: ABI stays 95, layouts frozen, no uint8_t scalar params. The
   H2/H4/LoadImage EMISSIONS and the capture lanes are §lane-requests in
   section-notes/update-v97-record22-prefix-typed (ABI-96 merge). */

/* H1 typing — filename prologue 0x0040e2b0 (PE 0x40bd5f `push esi`). */
extern "C" int32_t isaac_game_update_slice_engine_anm2_prologue_va(void) {
  return static_cast<int32_t>(0x0040e2b0);
}

extern "C" int32_t isaac_game_update_slice_engine_anm2_prologue_argc(void) {
  return 1; /* push esi — recv (Game+0x1b874 at the site) */
}

/* H2 arm — filename assign 0x0040ccd0 fires iff recv != path (PE 0x40bd68
   cmp esi,edi / je 0x40bd81 — ADDRESS equality; NOT a restate of
   path_is_self: this is the positive ASSIGN arm of the same compare). */
extern "C" int32_t isaac_game_update_slice_engine_anm2_filename_assign_needed(
    uint32_t this_addr, uint32_t path_addr) {
  return (this_addr != path_addr) ? 1 : 0;
}

/* H2 SSO-select of the assign's SOURCE (PE 0x40bd6c cmp dword [edi+0x14],
   0x10 / jb 0x40bd76): chars inline at the source object iff cap < 0x10
   UNSIGNED; else the heap ptr at [source]. Site constant cap 0x1f -> 0. */
extern "C" int32_t isaac_game_update_slice_engine_anm2_filename_assign_sso_source(
    uint32_t source_cap) {
  return (source_cap < 0x10u) ? 1 : 0;
}

extern "C" uint32_t isaac_game_update_slice_engine_anm2_filename_src_chars(
    uint32_t source_addr, uint32_t source_cap, uint32_t heap_ptr) {
  return (source_cap < 0x10u) ? source_addr : heap_ptr;
}

/* H2 write surface: recv+0x00..0x14 = Game+0x1b874 (ptr/SSO dword, VALUE
   platform-owned), Game+0x1b884 (size dword), Game+0x1b888 (cap dword).
   size/cap are game state (0x1d/0x1f at the site); the heap content stays
   host-owned under the standing allocator decision. */
extern "C" uint32_t isaac_game_update_slice_engine_anm2_filename_ptr_offset(
    void) {
  return 0x00u; /* recv+0x00 = Game+0x1b874 */
}

extern "C" uint32_t isaac_game_update_slice_engine_anm2_filename_size_offset(
    void) {
  return 0x10u; /* recv+0x10 = Game+0x1b884 */
}

extern "C" uint32_t isaac_game_update_slice_engine_anm2_filename_cap_offset(
    void) {
  return 0x14u; /* recv+0x14 = Game+0x1b888 */
}

/* H3/H4 typing — cache guard + fetch (straight-line, UNCONDITIONAL). */
extern "C" uint32_t isaac_game_update_slice_engine_anm2_cache_guard_va(void) {
  return 0x0040db90u; /* SEH + 64-bit magic-multiply clock (host) */
}

extern "C" uint32_t isaac_game_update_slice_engine_anm2_cache_fetch_va(void) {
  return 0x0040e110u;
}

extern "C" uint32_t isaac_game_update_slice_engine_anm2_cache_fetch_globals_base(
    void) {
  return 0x00c798b8u; /* magic statics 0xc798b8 / 0xc798bc / 0xc798c0 */
}

extern "C" uint32_t isaac_game_update_slice_engine_anm2_cache_fetch_globals_words(
    void) {
  return 3u;
}

/* H5 typing — per-layer graphics loader 0x0040c000 + its leaf
   Manager::LoadImage 0x009588a0 (exact ZHL). */
extern "C" uint32_t isaac_game_update_slice_engine_anm2_loadgraphics_va(void) {
  return 0x0040c000u;
}

extern "C" uint32_t isaac_game_update_slice_engine_anm2_loadimage_va(void) {
  return 0x009588a0u;
}

/* v8 plan law — entry fence (PE 0x40c043 cmp [this+0x80],0 / jbe exit):
   UNSIGNED; only count 0 skips, and then [this+0x7c] is never loaded.
   0x100 / 0xffffff00 ENTER (a low-byte mutant would invert them). */
extern "C" int32_t isaac_game_update_slice_engine_anm2_loadgraphics_entered(
    uint32_t layer_count) {
  return (layer_count != 0u) ? 1 : 0;
}

/* v8 plan law — per-layer skip (PE 0x40c043 cmp byte [layer+0x30],0 / jne
   skip): LOW-BYTE; a nonzero +0x30 (already loaded) skips the layer.
   0x100 / 0xffffff00 have a CLEAR low byte -> PROCESSED (not skipped). */
extern "C" int32_t isaac_game_update_slice_engine_anm2_loadgraphics_skip_predicate(
    uint32_t flag_30) {
  return ((flag_30 & 0xffu) != 0u) ? 1 : 0;
}

/* v8 apply law — STORE A normalization (byte[layer+0x30] = flag): exactly
   0/1, mirroring the PE's mov byte [ebp-0x11], 1/0 (the module owns the
   narrowing — the host cell is a byte). */
extern "C" int32_t isaac_game_update_slice_engine_anm2_loadgraphics_flag_normalize(
    uint32_t flag) {
  return ((flag & 0xffu) != 0u) ? 1 : 0;
}

/* H6 typing — anim-state applies 0x00408830 x2 (UNCONDITIONAL, push 0):
   recv+0x30 = Game+0x1b8a4, recv+0x50 = Game+0x1b8c4 (family v2 plan
   consumption at Unit B). */
extern "C" uint32_t isaac_game_update_slice_engine_anm2_anim_apply_first_offset(
    void) {
  return 0x30u;
}

extern "C" uint32_t isaac_game_update_slice_engine_anm2_anim_apply_second_offset(
    void) {
  return 0x50u;
}

extern "C" uint32_t isaac_game_update_slice_engine_anm2_anim_apply_arg(void) {
  return 0u; /* push 0 @0x40bd9c / @0x40bda6 — reset=true arm */
}

extern "C" uint32_t isaac_game_update_slice_engine_anm2_anim_apply_count(void) {
  return 2u; /* H6a + H6b */
}

/* The COMPOSED v8-wire decision (0x40bd97 callsite): the v8 loadgraphics
   plan/apply can run IN-MODULE iff the EXISTING v77 lane machinery is on
   (engine_anm2_lane_pure: blob + latch-ready + latch low byte CLEAR +
   counts <= caps — the LIVE lanes hosts set) AND the loadgraphics LOW-BYTE
   gate opens (PE 0x40bd8e). Consumes the LIVE engine_anm2_* lanes as-is;
   at the site (push 1, lane on) -> 1. */
extern "C" int32_t isaac_game_update_slice_engine_anm2_v8_wire_decision(
    uint32_t engine_anm2_blob_ready, uint32_t engine_anm2_latch_ready,
    uint32_t engine_anm2_latch, uint32_t engine_anm2_layer_count,
    uint32_t engine_anm2_extra_count, uint32_t loadgraphics_in) {
  if (isaac_game_update_slice_engine_anm2_lane_pure(
          engine_anm2_blob_ready, engine_anm2_latch_ready,
          engine_anm2_layer_count, engine_anm2_extra_count,
          engine_anm2_latch) == 0) {
    return 0;
  }
  return isaac_game_update_slice_engine_anm2_load_graphics_needed(
      loadgraphics_in);
}

/* The COMPOSED typed-host-edge mask of the record's gated arm on the
   LANE-ON path (consumes the LIVE engine_anm2_* lanes as-is):

     0            — lane machinery OFF (any lane_pure term fails, latch
                    low byte SET, or over-cap counts): the record keeps the
                    pre-v77 monolith and NO typed naming applies.
     bit0 (1)     — H2 filename assign 0x40ccd0 fires (!path_is_self;
                    PE 0x40bd68; 1 at the site — path is the caller's copy
                    of the .rdata constant, never == Game+0x1b874).
     bit1 (2)     — H4 cache fetch 0x40e110 fires (straight-line; ALWAYS
                    on the arm; globals 0xc798b8/bc/c0).
     bit2 (4)     — H5 leaf Manager::LoadImage 0x9588a0 fires
                    (graphics_needed LOW-BYTE; 1 at the site — push 1).

   Site fixed point (path_size 0, distinct path, push 1): mask = 7.
   H1/H3/H6a/H6b are typed by their own laws (prologue_va/argc,
   cache_guard_va, anim_apply_*) — not bits in this mask. */
extern "C" int32_t isaac_game_update_slice_engine_anm2_prefix_typed_host_events(
    uint32_t engine_anm2_blob_ready, uint32_t engine_anm2_latch_ready,
    uint32_t engine_anm2_latch, uint32_t engine_anm2_layer_count,
    uint32_t engine_anm2_extra_count, uint32_t path_size_10,
    uint32_t this_addr, uint32_t path_addr, uint32_t loadgraphics_in) {
  if (isaac_game_update_slice_engine_anm2_lane_pure(
          engine_anm2_blob_ready, engine_anm2_latch_ready,
          engine_anm2_layer_count, engine_anm2_extra_count,
          engine_anm2_latch) == 0) {
    return 0;
  }
  int32_t mask = 2; /* bit1: H4 cache fetch — straight-line, ALWAYS */
  if (isaac_game_update_slice_engine_anm2_load_path_is_self(this_addr,
                                                            path_addr) == 0) {
    mask |= 1; /* bit0: H2 filename assign */
  }
  if (isaac_game_update_slice_engine_anm2_load_graphics_needed(
          loadgraphics_in) != 0) {
    mask |= 4; /* bit2: H5 LoadImage */
  }
  (void)path_size_10; /* H1 prologue is typed by prologue_va/argc; its gate
                         is path_present (v95) — not a mask bit */
  return mask;
}

/* ABI v98 (wave-22 Unit B, record 22 rank opaqueRoomTransitionEnginePrefix):
   the standing LoadImage/cache decision laws + the H6 anim-apply gate
   translation, consuming the ABI-96 COMMITTED capture lanes (runtime tail
   14212..14244) and driving the typed emissions (events 944/948/952).
   ABI stays 96; layouts frozen; no uint8_t scalar params. */

/* The REMOVAL gate: 1 iff ALL FIVE capture vouchers are LIVE (v77 blob +
   v77 latch + v96 H2 filename + v96 H6 anim + v96 v8-wire loadgraphics).
   The typed path covers every arm of the record only when every committed
   capture is host-set; any 0 keeps the pre-v98 residual byte-for-byte. */
extern "C" int32_t isaac_game_update_slice_engine_anm2_prefix_fold_ready(
    uint32_t engine_anm2_blob_ready, uint32_t engine_anm2_latch_ready,
    uint32_t engine_anm2_filename_ready, uint32_t engine_anm2_anim_ready,
    uint32_t engine_anm2_loadgraphics_flag_ready) {
  if (engine_anm2_blob_ready == 0u || engine_anm2_latch_ready == 0u ||
      engine_anm2_filename_ready == 0u || engine_anm2_anim_ready == 0u ||
      engine_anm2_loadgraphics_flag_ready == 0u) {
    return 0;
  }
  return 1;
}

/* The standing CACHE decision: H4 cache fetch 0x40e110 is STRAIGHT-LINE —
   on the typed arm it ALWAYS fires (globals 0xc798b8/bc/c0, the
   global-cache contract; cache_fetch_globals_base/words name the statics).
   1 iff lane_pure && the H2/H4 capture voucher (filename_ready) is live. */
extern "C" int32_t isaac_game_update_slice_engine_anm2_cache_fetch_decision(
    uint32_t engine_anm2_blob_ready, uint32_t engine_anm2_latch_ready,
    uint32_t engine_anm2_latch, uint32_t engine_anm2_layer_count,
    uint32_t engine_anm2_extra_count, uint32_t engine_anm2_filename_ready) {
  if (isaac_game_update_slice_engine_anm2_lane_pure(
          engine_anm2_blob_ready, engine_anm2_latch_ready,
          engine_anm2_layer_count, engine_anm2_extra_count,
          engine_anm2_latch) == 0) {
    return 0;
  }
  return (engine_anm2_filename_ready != 0u) ? 1 : 0;
}

/* The standing LOADIMAGE decision: the leaf Manager::LoadImage 0x9588a0
   fires via the 0x40c000 loader only when the v8 entry fence OPENS
   (entered — UNSIGNED layer_count != 0; a 0 count exits BEFORE the leaf)
   AND the loadgraphics LOW-BYTE gate opens (graphics_needed). The v8-wire
   voucher must be live. Site push 1 -> graphics_needed 1; entered decides. */
extern "C" int32_t isaac_game_update_slice_engine_anm2_loadimage_decision(
    uint32_t engine_anm2_blob_ready, uint32_t engine_anm2_latch_ready,
    uint32_t engine_anm2_latch, uint32_t engine_anm2_layer_count,
    uint32_t engine_anm2_extra_count, uint32_t loadgraphics_in,
    uint32_t engine_anm2_loadgraphics_flag_ready) {
  if (isaac_game_update_slice_engine_anm2_lane_pure(
          engine_anm2_blob_ready, engine_anm2_latch_ready,
          engine_anm2_layer_count, engine_anm2_extra_count,
          engine_anm2_latch) == 0) {
    return 0;
  }
  if (engine_anm2_loadgraphics_flag_ready == 0u) {
    return 0;
  }
  if (isaac_game_update_slice_engine_anm2_loadgraphics_entered(
          engine_anm2_layer_count) == 0) {
    return 0;
  }
  return isaac_game_update_slice_engine_anm2_load_graphics_needed(
      loadgraphics_in);
}

/* The H6 anim-apply GATE translation: the 0x408830 applies fire x2
   (UNCONDITIONAL on the arm, push 0) onto recv+0x30/+0x50 = Game+0x1b8a4/
   0x1b8c4 (pre-states from engine_anm2_anim_first_pre/second_pre; family
   v2 plan consumed by reference). 1 iff lane_pure && the H6 capture
   voucher (anim_ready) is live. PURE — no event; the fold's anim coverage
   is the voucher + this law. */
extern "C" int32_t isaac_game_update_slice_engine_anm2_anim_apply_decision(
    uint32_t engine_anm2_blob_ready, uint32_t engine_anm2_latch_ready,
    uint32_t engine_anm2_latch, uint32_t engine_anm2_layer_count,
    uint32_t engine_anm2_extra_count, uint32_t engine_anm2_anim_ready) {
  if (isaac_game_update_slice_engine_anm2_lane_pure(
          engine_anm2_blob_ready, engine_anm2_latch_ready,
          engine_anm2_layer_count, engine_anm2_extra_count,
          engine_anm2_latch) == 0) {
    return 0;
  }
  return (engine_anm2_anim_ready != 0u) ? 1 : 0;
}

/* ABI v79: record 2 (opaqueGlobal4aba0Refresh) pure refresh law — PE
   0x006fb414..0x006fb474 with the advance callee 0x00414a80 (22 insns,
   call-free) inlined over the captured tree table. The tree is the global
   intrusive 0x20-byte-node list at [0xc7987c] (nodes[0] = sentinel: self
   links, flag byte 1 — ctor word [eax+0xc] = 0x101 at VA 0x00401a10).
   Contract: begin != end (caller tests the PE range-equality gate first),
   count in [1, ISAAC_GLOBAL_TREE_4ABA0_MAX_NODES], every link resolves
   in-table; anything else returns -1 and the caller keeps the monolithic
   residual byte-for-byte.

   Machine control flow (re-transcribed branch-for-branch):

     0x6fb41a mov eax,[game+0x4b3d8]     0x6fb420 cmp eax,[game+0x4b3dc]
     0x6fb426 je  skip                    ; EMPTY range: byte untouched
     0x6fb42e xor ecx,ecx                -> flag = 0
     0x6fb430 mov eax,[esi]              ; cur = sentinel.next
     0x6fb435 cmp eax,esi / je done      ; empty tree -> byte = 1
     loop (0x6fb440):
       cmp dword [cur+0x18],0
       lea ecx,[flag+1] / cmovne ecx,flag ; flag += (cur.f18 == 0)
       call 0x414a80(&cur)               ; advance
       cmp cur,esi / jne loop
     done (0x6fb464): test flag / sete al / mov byte [game+0x4aba0],al

   advance 0x00414a80 (esi = &local, node = *local):
     a = node.child (+8)
     if a.flag == 0:                      ; 0x414a89 je 0x414ab1 (0x414ab1 side)
       c = a.next; if c.flag != 0: local = a (0x414ab7 jne 0x414acc)
       else loop 0x414ac0: e = c.next; d = c; c = e; while c.flag == 0
            local = d                     ; last flag==0 node before a flag!=0
     else:                                ; 0x414a8f side (a.flag != 0)
       b = node.prev; if b.flag != 0: local = b (0x414a96 jne 0x414aaa)
       else loop: while (node == b.child): local = b; node = b; b = node.prev;
            if b.flag != 0: local = b; break
            (loop exits with local = b also when node != b.child at entry)

   The flag byte is the +0xd byte (word ctor 0x101 -> 1); the counting is
   per-node [f18 == 0] over the walk's visit set, identical for every
   traversal convention because the visit order is replicated exactly.
   Sentinel reads are safe: its child/next/prev are self links (flag 1), so
   a dead-end descent lands on the sentinel and the caller's loop exits. */
static int32_t global_tree_4aba0_node_index(const IsaacGlobalTree4aba0Node* nodes,
                                            uint32_t count, uint32_t addr) {
  for (uint32_t i = 0; i < count; ++i) {
    if (nodes[i].addr == addr) return (int32_t)i;
  }
  return -1;
}

extern "C" int32_t isaac_game_update_slice_global_tree_4aba0_pure(
    uint32_t begin, uint32_t end, uint32_t count,
    const IsaacGlobalTree4aba0Node* nodes) {
  if (begin == end) return -1; /* caller gates; defensive */
  if (nodes == nullptr || count < 1u ||
      count > ISAAC_GLOBAL_TREE_4ABA0_MAX_NODES) {
    return -1;
  }
  const uint32_t sentinel_addr = nodes[0].addr;
  uint32_t flag = 0u;
  uint32_t cur = nodes[0].next; /* mov eax,[esi] */
  uint32_t guard = 0u;
  while (cur != sentinel_addr) { /* cmp eax,esi / je done */
    if (++guard > 4u * count + 4u) return -1; /* malformed cycle -> monolith */
    const int32_t ci = global_tree_4aba0_node_index(nodes, count, cur);
    if (ci < 0) return -1;
    if (nodes[ci].f18 == 0u) flag += 1u; /* cmp dword [eax+0x18],0 / cmovne */
    int32_t node = ci;
    const int32_t a = global_tree_4aba0_node_index(nodes, count, nodes[node].child);
    if (a < 0) return -1;
    if (nodes[a].f0d == 0u) {
      /* 0x414ab1 side */
      int32_t c = global_tree_4aba0_node_index(nodes, count, nodes[a].next);
      if (c < 0) return -1;
      if (nodes[c].f0d != 0u) {
        cur = nodes[a].addr; /* local = a */
      } else {
        uint32_t d = nodes[a].addr;
        for (;;) {
          const int32_t e = global_tree_4aba0_node_index(nodes, count, nodes[c].next);
          if (e < 0) return -1;
          d = nodes[c].addr;
          c = e;
          if (nodes[c].f0d != 0u) break;
        }
        cur = d;
      }
    } else {
      /* 0x414a8f side */
      int32_t b = global_tree_4aba0_node_index(nodes, count, nodes[node].prev);
      if (b < 0) return -1;
      if (nodes[b].f0d != 0u) {
        cur = nodes[b].addr; /* local = b */
      } else {
        for (;;) {
          if (nodes[node].addr != nodes[b].child) {
            cur = nodes[b].addr; /* 0x414a9b jne -> local = b */
            break;
          }
          node = b;
          b = global_tree_4aba0_node_index(nodes, count, nodes[node].prev);
          if (b < 0) return -1;
          if (nodes[b].f0d != 0u) {
            cur = nodes[b].addr; /* 0x414aaa -> local = b */
            break;
          }
        }
      }
    }
  }
  return flag == 0u ? 1 : 0; /* test ecx,ecx / sete al */
}

namespace {

/* FrameEffect_6fd7c0 host residual fragments (ABI v26/v29). site_anim is fixed
   per Update site (20 effect-expire, 0 clear-nested). Sets continuation:
   mode-4 → site final resume; else → RESUME_AFTER_ENGINE_PREFIX (body deferred). */
void emit_frame_effect_6fd7c0_host_residuals(
    IsaacGameUpdateSliceState* state,
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs,
    IsaacGameUpdateSliceEvents* events, int32_t site_anim, int32_t room_index,
    int32_t room_dim, int32_t site_arg3) {
  events->room_transition_index = room_index;
  events->room_transition_dimension = room_dim;
  events->engine_site_anim = site_anim;
  /* ABI v104 (record idx 12 transition-pack REAL wiring; wave
     update-v104-record12-wire): the pack K-block is LIVE only when the pack
     voucher transition_6fd7c0_ready (@14324) AND the record's own ready
     opaque_call_006fd7c0_ready (@13732) are BOTH set — either 0 (capture
     absent) keeps the pre-v104 residual byte-for-byte. The pack-live flow
     follows the PE arm order (A entry validation FIRST — the machine
     fatals before it ever reaches the mode-4 check at 0x6fd81c). */
  const bool transition_pack_live =
      runtime_inputs != nullptr &&
      runtime_inputs->opaque_call_006fd7c0_ready != 0 &&
      runtime_inputs->transition_6fd7c0_ready != 0;
  int32_t pack_arm = 0; /* 0 proceed / 1 fatal / 2 mode-4 / 3 nested */
  int32_t pack_valid = 1;
  int32_t pack_mode4 = 0;
  int32_t effective_anim = site_anim;
  int32_t effective_dim = room_dim;
  if (transition_pack_live) {
    pack_valid = isaac_game_update_slice_6fd7c0_args_valid(
        room_index, static_cast<uint32_t>(site_anim), room_dim);
    if (pack_valid == 0) {
      /* A/G fatal: log (0xa112c0, level 8, string by fail kind) + ret 0x14
         @0x6fdbfd — nothing below runs (no shell/engine/P4). The laws pin
         the push sites (0x6fdbdd room / 0x6fdbd6 anim / dim) for the host
         log re-issue. */
      (void)isaac_game_update_slice_6fd7c0_validate_fail_kind(
          room_index, static_cast<uint32_t>(site_anim), room_dim);
      (void)isaac_game_update_slice_6fd7c0_fatal_string_va(
          isaac_game_update_slice_6fd7c0_validate_fail_kind(
              room_index, static_cast<uint32_t>(site_anim), room_dim));
      (void)isaac_game_update_slice_6fd7c0_fatal_level();
      pack_arm = 1;
    } else {
      pack_mode4 = isaac_frame_effect_6fd7c0_mode4_sfx_early(
          state->timed_transition_cleanup_mode);
      if (pack_mode4 != 0) {
        pack_arm = 2;
      } else {
        const int32_t room_indices_equal =
            runtime_inputs->frame_effect_shell_room_18304 ==
                    runtime_inputs->frame_effect_shell_room_182d0
                ? 1
                : 0;
        const int32_t room_byte1_nonzero =
            (runtime_inputs->frame_effect_shell_room_byte1 & 0xffu) != 0u
                ? 1
                : 0;
        /* C: the anim-0xc special — the COMMITTED lanes
           transition_6fd7c0_game0/alt_path_probe/route_probe make the
           route capture-decidable (site anim 20/0 never opens the arm; an
           arbitrary site shape can). */
        const int32_t route_kind =
            isaac_game_update_slice_6fd7c0_anim0xc_route(
                static_cast<uint32_t>(site_anim),
                runtime_inputs->transition_6fd7c0_game0,
                runtime_inputs->transition_6fd7c0_alt_path_probe,
                room_indices_equal, room_byte1_nonzero,
                runtime_inputs->transition_6fd7c0_route_probe);
        if (route_kind == 2) {
          /* NESTED: 0x6fdc10(0,6,0) @0x6fd8ca (record idx 11 body); the
             arg3!=0 tail (0x6fd8da..0x6fd8eb: log 0x7abe20 + seed 0xd7 +
             the mode-4 SFX build) runs the Play host leaf before the
             return. Either way the body returns BEFORE the engine. */
          events->frame_effect_6fd7c0_stage_transition += 1;
          if (site_arg3 != 0) {
            /* ABI v122: coarse retired — typed Play leaf ONLY. */
            events->frame_effect_6fd7c0_mode4_sfx_play_typed += 1;
          }
          pack_arm = 3;
        } else {
          if (route_kind == 1) {
            /* REWRITE (0x6fd8b9 lea -0xe / 0x6fd8bc +5 -> room -2, anim 3;
               dim 0 at 0x6fd8f5). */
            effective_anim = 3;
            effective_dim = 0;
          }
          if (room_index == -2) {
            effective_dim = 0;
          }
          /* D: the generic arm — player-loop gate + anim-3 dispatch
             consume the player probe / room type / subroom flag lanes. */
          if (site_arg3 != 0 &&
              (effective_anim == 3 || effective_anim == 0xc)) {
            const int32_t player_probe =
                runtime_inputs->transition_6fd7c0_player_loop_probe;
            if (isaac_game_update_slice_6fd7c0_player_loop_reach(
                    static_cast<uint32_t>(effective_anim), site_arg3,
                    player_probe) != 0) {
              events->frame_effect_6fd7c0_player_loop += 1;
            } else if (isaac_game_update_slice_6fd7c0_room_dispatch_reach(
                           static_cast<uint32_t>(effective_anim), player_probe,
                           runtime_inputs->transition_6fd7c0_room_type_8,
                           runtime_inputs->transition_6fd7c0_room_subroom_flag_44) == 1) {
              events->frame_effect_6fd7c0_room_dispatch += 1;
            }
            /* dispatch == 2: direct 705ee0 (the needs-law tail follows in
               the shared span below). */
          }
        }
      }
    }
  }
  if (pack_arm != 0) {
    if (pack_arm == 2) {
      /* ABI v122: coarse retired — the typed Play leaf below IS the arm
         capture (same tick, same order, 1:1 with the retired edge). */
      events->frame_effect_6fd7c0_mode4_sfx_play_typed += 1;
    }
    events->continuation_kind =
        site_anim == 20 ? ISAAC_GAME_UPDATE_RESUME_AFTER_ROOM_TRANSITION_EFFECT
                        : ISAAC_GAME_UPDATE_RESUME_AFTER_ROOM_CLEAR_NESTED;
    return;
  }
  if (!transition_pack_live &&
      isaac_frame_effect_6fd7c0_mode4_sfx_early(
          state->timed_transition_cleanup_mode) != 0) {
    /* ABI v95 (record idx 19) + ABI v122 (update-v122-mode4-sfx-removal):
       the Play call is a TYPED host leaf — the composed arg-prep laws
       (seed 0xbb/0xd7, %20 rare hit, loop-0 pack, receiver base+0x2a324,
       play_va 0x92dc30) pin what the host consumer re-issues at the
       0x92dc30 seam. ABI v122 retires the coarse counter: it fired 1:1
       with this typed event at EVERY arming site (mode-4 early arm,
       pack-live mode-4 arm, nested arg3!=0 tail — same tick, same order),
       so coarse_old(t) == frame_effect_6fd7c0_mode4_sfx_play_typed(t) for
       all t and the counter @108 STAYS in the frozen events ABI, never
       fires. */
    events->frame_effect_6fd7c0_mode4_sfx_play_typed += 1;
    /* Mode-4 skips mid-engine cont; site final resume applies no pure setup/start. */
    events->continuation_kind =
        site_anim == 20 ? ISAAC_GAME_UPDATE_RESUME_AFTER_ROOM_TRANSITION_EFFECT
                        : ISAAC_GAME_UPDATE_RESUME_AFTER_ROOM_CLEAR_NESTED;
    return;
  }
  /* Shell: optional 705ee0 / blue-room (host owns internal gates; may rewrite
     stack room). Engine prefix: FUN_0082ee40 H0 log + H1 optional ANM2.
     ABI v72: with the shell captures ready, both gates closed makes the whole
     0x006fd8f0…0x006fdb87 span a proven no-op and the shell event is DROPPED.
     ABI v73: the blue-room gate no longer has to be closed — reaching
     0x006fdb78 with the sites' frozen direction -1 is itself a no-op, so only
     FUN_00705ee0 still keeps the host edge alive.
     ABI v74: FUN_00705ee0 is IRREDUCIBLE (it snapshots the Game object and
     calls Game::SaveState), so record 21 SURVIVES — but its three entry byte
     guards are proven no-op exits, so with the rewind captures ready the
     residual is also dropped when any guard is set.
     Either ready = 0 keeps the earlier decision byte-for-byte. */
  const bool shell_ready =
      runtime_inputs != nullptr && runtime_inputs->frame_effect_shell_ready != 0;
  const bool rewind_ready =
      runtime_inputs != nullptr && runtime_inputs->frame_effect_rewind_ready != 0;
  /* ABI v129 (update-v129-record20-shell-removal): record idx 20
     opaque_frame_effect_6fd7c0_shell REMOVED under the FULL-CAPTURE
     voucher cap_live == frame_effect_shell_ready @3172 (canopy lanes) &&
     opaque_call_006fd7c0_ready @13732 (the record-12 capture: the
     rewind_705ee0_* slot/game/payload lanes + the v74 guard bytes).
     Arming-identity theorem -- every arm of the coarse edge on a
     capture-live tick:
       - needs == 0 && blue == 0 -> PROVEN pure skip (frame-effect family
         laws consumed BY REFERENCE);
       - needs == 0 && blue == 1 -> the PE's ONLY host call is
         Level::TryInitializeBlueRoom 0x74d4a0 @0x006fdb78 with the
         site-frozen direction -1 -> the v73 Update-no-op law;
       - needs == 1 -> FUN_00705ee0 runs @0x006fdb4f: the composed write
         plan reaching the write block publishes the TYPED carriers
         rewind_705ee0_stores/rewind_705ee0_save_state (v96 seam); an
         early exit is own-frame-only (v74 store census) = no observable
         residual.
     The coarse counter carries no information on capture-live ticks and
     is RETIRED there; capture absence keeps the pre-v72 monolith
     byte-for-byte. Slot @112 STAYS in the frozen events ABI. */
  const bool cap_live =
      runtime_inputs != nullptr && shell_ready &&
      runtime_inputs->opaque_call_006fd7c0_ready != 0;
  int32_t shell_drop = 0;
  if (cap_live) {
    /* PE 0x006fdb34 is a full-word `cmp eax,[edx+0x182d0]`; PE 0x006fdb42
       is `cmp byte ptr [eax+1],0` -- narrow explicitly so an out-of-range
       capture cannot make the gate read as set. */
    const int32_t room_indices_equal =
        runtime_inputs->frame_effect_shell_room_18304 ==
                runtime_inputs->frame_effect_shell_room_182d0
            ? 1
            : 0;
    const int32_t room_byte1_nonzero =
        (runtime_inputs->frame_effect_shell_room_byte1 & 0xffu) != 0u ? 1 : 0;
    if (isaac_frame_effect_6fd7c0_needs_705ee0_null_player(
            static_cast<uint32_t>(effective_anim), room_indices_equal,
            room_byte1_nonzero) != 0) {
      /* Canopy open: the PE calls 0x705ee0 at 0x006fdb4f with the frozen
         -1 snapshot arg (PE 0x006fdb4d push -1, signed js at 0x705f5a).
         plan.reached publishes the typed pair; plan.miss is the proven
         own-frame-only exit. Either way: retired. */
      IsaacGameUpdateSlice705ee0WritePlan write_plan;
      const int32_t reached = isaac_game_update_slice_705ee0_write_plan(
          runtime_inputs->frame_effect_rewind_guard_269ea,
          runtime_inputs->frame_effect_rewind_guard_269eb,
          runtime_inputs->frame_effect_rewind_guard_68d70,
          ISAAC_GAME_UPDATE_SHELL_REWIND_ARG,
          runtime_inputs->rewind_705ee0_slot_index_676ac,
          runtime_inputs->rewind_705ee0_slot_valid_byte,
          runtime_inputs->rewind_705ee0_slot_room_19d20,
          runtime_inputs->frame_effect_shell_room_18304,
          runtime_inputs->rewind_705ee0_slot_tag_e8,
          runtime_inputs->rewind_705ee0_game_tag_0,
          runtime_inputs->rewind_705ee0_slot_arg_1fe2c,
          runtime_inputs->rewind_705ee0_game_frame_264f8,
          runtime_inputs->rewind_705ee0_slot_frame_1fe30,
          runtime_inputs->rewind_705ee0_game_base, &write_plan);
      if (reached != 0) {
        events->rewind_705ee0_stores += 1;
        events->rewind_705ee0_save_state += 1;
      }
      shell_drop = 1;
    } else if (isaac_frame_effect_6fd7c0_blue_room_eligible(
                   static_cast<uint32_t>(effective_anim), effective_dim,
                   state->room_transition_mode_1830c) != 0) {
      /* Blue-room arm: 0x74d4a0 with the site-frozen direction -1 is the
         v73 proven Update-no-op (consumed BY REFERENCE). */
      shell_drop = isaac_game_update_slice_blue_room_74d4a0_noop(
          runtime_inputs->frame_effect_shell_room_18304, room_index,
          ISAAC_GAME_UPDATE_SHELL_SITE_DIRECTION);
    } else {
      /* Both gates closed: the whole 0x006fd8f0..0x006fdb87 span is a
         proven pure skip (the v72 law). */
      shell_drop = 1;
    }
  } else if (shell_ready && rewind_ready) {
    shell_drop = isaac_game_update_slice_frame_effect_shell_drop_rewound(
        effective_anim, room_index, effective_dim,
        runtime_inputs->frame_effect_shell_room_18304,
        runtime_inputs->frame_effect_shell_room_182d0,
        runtime_inputs->frame_effect_shell_room_byte1,
        state->room_transition_mode_1830c,
        ISAAC_GAME_UPDATE_SHELL_SITE_DIRECTION,
        runtime_inputs->frame_effect_rewind_guard_269ea,
        runtime_inputs->frame_effect_rewind_guard_269eb,
        runtime_inputs->frame_effect_rewind_guard_68d70);
  } else if (shell_ready) {
    shell_drop = isaac_game_update_slice_frame_effect_shell_drop_probed(
        effective_anim, room_index, effective_dim,
        runtime_inputs->frame_effect_shell_room_18304,
        runtime_inputs->frame_effect_shell_room_182d0,
        runtime_inputs->frame_effect_shell_room_byte1,
        state->room_transition_mode_1830c,
        ISAAC_GAME_UPDATE_SHELL_SITE_DIRECTION);
  }
  if (shell_drop == 0) {
    events->opaque_frame_effect_6fd7c0_shell += 1;
  }
  /* ABI v104: the E blue-room arm goes LIVE — blue_room_reach (the
     site-decidable law, PE 0x6fdb57/0x6fdb5b/0x6fdb64) gates the probe
     RESULT consumption: the 0x74d4a0 AL lane drives the cmovne -0x10
     room rewrite (0x6fdb7f/0x6fdb84) — the 0x82ee40 arg0 for the host
     fold re-issue (engine_room_arg, bytes-re-narrowed). Pack-live only;
     the v73 noop law still covers the CALL itself. */
  if (transition_pack_live &&
      isaac_game_update_slice_6fd7c0_blue_room_reach(
          static_cast<uint32_t>(effective_anim), effective_dim,
          state->room_transition_mode_1830c) != 0) {
    (void)isaac_game_update_slice_6fd7c0_engine_room_arg(
        room_index, runtime_inputs->transition_6fd7c0_blue_room_probe);
  }
  /* ABI v104: the F engine arm — engine_prefix_fires(valid, mode4) gates
     the 0x82ee40 fold: the engine (0x6fdb9b) is reached iff the entry
     validation passed AND the mode-4 early return did not fire. Both are
     pack-decided above (pack_arm returned early on fatal/mode-4), so this
     is the law's in-module consumption with the LIVE values. */
  if (transition_pack_live &&
      isaac_game_update_slice_6fd7c0_engine_prefix_fires(pack_valid,
                                                         pack_mode4) == 0) {
    events->continuation_kind = ISAAC_GAME_UPDATE_RESUME_AFTER_ENGINE_PREFIX;
    return;
  }
  /* ABI v75: record 22's prefix. The 0x00a112c0 log at PE 0x0082ee96 is on the
     always path but is a platform primitive under the standing logger split,
     so the ONLY thing keeping this event alive is the gated ANM2::Load. With
     the latch supplied and its low byte set, PE 0x0082eea5 jumps the whole
     arm and the skip path's observable-store set is empty — drop the event.
     ready = 0 keeps the v74 unconditional emission byte-for-byte. */
  const bool engine_anm2_ready =
      runtime_inputs != nullptr && runtime_inputs->engine_anm2_latch_ready != 0;
  int32_t prefix_drop = 0;
  if (engine_anm2_ready) {
    prefix_drop = isaac_game_update_slice_engine_prefix_drop_latched(
        runtime_inputs->engine_anm2_latch);
  }
  if (prefix_drop == 0) {
    /* ABI v98 (wave-22 Unit B): when every committed capture voucher is
       LIVE the typed path covers every arm of the record — the coarse
       counter is DROPPED and the typed emissions (events 944/948/952)
       carry the fold (H2 assign / H4 cache fetch / H5 LoadImage leaf).
       Any voucher 0, a set latch low byte, or a lane-off keeps the
       pre-v98 residual byte-for-byte (v75 precedent). */
    if (runtime_inputs != nullptr &&
        isaac_game_update_slice_engine_anm2_prefix_fold_ready(
            runtime_inputs->engine_anm2_blob_ready,
            runtime_inputs->engine_anm2_latch_ready,
            runtime_inputs->engine_anm2_filename_ready,
            runtime_inputs->engine_anm2_anim_ready,
            runtime_inputs->engine_anm2_loadgraphics_flag_ready) != 0 &&
        isaac_game_update_slice_engine_anm2_lane_pure(
            runtime_inputs->engine_anm2_blob_ready,
            runtime_inputs->engine_anm2_latch_ready,
            runtime_inputs->engine_anm2_layer_count,
            runtime_inputs->engine_anm2_extra_count,
            runtime_inputs->engine_anm2_latch) != 0) {
      /* H2 filename assign 0x40ccd0 — site fixed point (v95 site law:
         the path constant 0xb6cda8 never == recv Game+0x1b874, PE
         0x40bd68 -> assign fires). */
      events->engine_anm2_prefix_filename_assign += 1;
      /* H4 cache fetch 0x40e110 — straight-line; the standing cache
         decision names the global-cache contract (0xc798b8/bc/c0). */
      if (isaac_game_update_slice_engine_anm2_cache_fetch_decision(
              runtime_inputs->engine_anm2_blob_ready,
              runtime_inputs->engine_anm2_latch_ready,
              runtime_inputs->engine_anm2_latch,
              runtime_inputs->engine_anm2_layer_count,
              runtime_inputs->engine_anm2_extra_count,
              runtime_inputs->engine_anm2_filename_ready) != 0) {
        events->engine_anm2_prefix_cache_fetch += 1;
      }
      /* H5 leaf Manager::LoadImage 0x9588a0 via 0x40c000 — the standing
         LoadImage decision; the site pushes 1 (0x0082ef0d). */
      if (isaac_game_update_slice_engine_anm2_loadimage_decision(
              runtime_inputs->engine_anm2_blob_ready,
              runtime_inputs->engine_anm2_latch_ready,
              runtime_inputs->engine_anm2_latch,
              runtime_inputs->engine_anm2_layer_count,
              runtime_inputs->engine_anm2_extra_count,
              /*loadgraphics_in=*/1u,
              runtime_inputs->engine_anm2_loadgraphics_flag_ready) != 0) {
        events->engine_anm2_prefix_loadimage += 1;
      }
    } else {
      events->opaque_room_transition_engine_prefix += 1;
    }
    /* ABI v77: the anm2-family v7 wire. With the blob + latch captures
       present and the latch low byte clear (the gated arm is TAKEN), the
       S1..S6 observable-store lane of ANM2::Load runs IN-MODULE and its
       posts land in sparse state (latch/10c/110) plus the star_layer_mask
       event. The lane gate is INDEPENDENT of the v98 fold arm: the stores
       run on lane_pure whether the typed emissions or the coarse fallback
       fire. blob absent, latch ready 0, a set latch low byte, or an
       over-cap count all reproduce v76 byte-for-byte. */
    if (runtime_inputs != nullptr &&
        isaac_game_update_slice_engine_anm2_lane_pure(
            runtime_inputs->engine_anm2_blob_ready,
            runtime_inputs->engine_anm2_latch_ready,
            runtime_inputs->engine_anm2_layer_count,
            runtime_inputs->engine_anm2_extra_count,
            runtime_inputs->engine_anm2_latch) != 0) {
      isaac_game_update_slice_engine_anm2_load_lane(state, runtime_inputs,
                                                    events);
    }
  }
  /* Body residual deferred to resume_engine_prefix after pure setup. */
  events->continuation_kind = ISAAC_GAME_UPDATE_RESUME_AFTER_ENGINE_PREFIX;
}

/* Pure setup stores on RESUME_AFTER_ENGINE_PREFIX when !early_skip.
   Update path arg2=-1. Update path player arg is always 0 → pure Game+0x1bb74=0.
   Body residual is player-loop only when engine_player_count > 0 (refined in
   ABI v35 when engine_player_blob_ready supplies eligibility). */
void apply_engine_setup_pure(IsaacGameUpdateSliceState* state,
                             const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs,
                             int32_t site_anim) {
  const int32_t room = runtime_inputs->engine_call_room;
  const int32_t dim = runtime_inputs->engine_call_dim;
  const int32_t slot = isaac_room_transition_engine_82ee40_rewrite_slot(
      room, /*arg2=*/-1, dim, runtime_inputs->engine_game_18304,
      state->room_transition_mode_1830c);
  const int32_t effective_dim = isaac_room_transition_engine_82ee40_effective_dim(
      dim, state->room_transition_mode_1830c);
  IsaacRoomTransitionEngineSetup setup = {};
  isaac_room_transition_engine_82ee40_apply_setup(&setup, room, slot, site_anim,
                                                  effective_dim);
  state->engine_field_4 = setup.field_4;
  state->engine_field_10 = setup.field_10;
  state->engine_field_14 = setup.field_14;
  state->engine_field_18 = setup.field_18;
  state->engine_field_1c = setup.field_1c;
  state->engine_field_20 = setup.field_20;
  state->engine_field_24 = setup.field_24;
  state->predicate_1ba74 = setup.field_238;
  /* PE: Game+0x1bb74 = player. Update sites always pass player=0. */
  state->engine_player_1bb74 = 0;
}

/* ABI v35/v36: pure per-entry float reset for eligible players (entry+0x2c==0).
   Returns 1 when any entry is eligible. Host residual for 7abcc0/7abe20 is
   further gated by isaac_room_transition_engine_player_loop_needs_host(anim). */
int32_t apply_engine_player_float_resets_pure(int32_t player_count) {
  int32_t any_eligible = 0;
  for (int32_t i = 0; i < player_count; ++i) {
    if (scratch_engine_player_eligible[i] == 0) {
      continue;
    }
    any_eligible = 1;
    isaac_room_transition_engine_82ee40_player_entry_float_reset(
        &scratch_engine_player_f360[i], &scratch_engine_player_f364[i],
        &scratch_engine_player_f410[i]);
  }
  return any_eligible;
}

void continue_after_stage_transition_effect(
    IsaacGameUpdateSliceState* state,
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs,
    IsaacGameUpdateSliceEvents* events) {
  if (state->effect_counter_68d6c > 0) {
    state->effect_counter_68d6c -= 1;
    state->position_reset_timer = 10;
    if (state->effect_counter_68d6c <= 0) {
      state->effect_counter_68d6c = 0;
      if (state->room_transition_mode_1830c == 2) {
        state->room_transition_marker_18318 = -1;
        /* Site A: anim=20, args (Game[0x18900], -1, 20, 0, sext_i8(Game[0x18904])).
           emit sets RESUME_AFTER_ENGINE_PREFIX (or mode-4 final cont). */
        emit_frame_effect_6fd7c0_host_residuals(
            state, runtime_inputs, events, 20,
            state->room_transition_index_18900,
            sign_extend_low_byte(state->room_transition_dimension_18904),
            /*site_arg3=*/0);
        return;
      }
    }
  }
  continue_to_frame_manager_updates(state, runtime_inputs, events);
}
}

extern "C" int32_t isaac_game_update_slice_resume_frame_aux_updates(
    IsaacGameUpdateSliceState* state,
    const IsaacGameUpdateSliceConstants* constants,
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs,
    IsaacGameUpdateSliceEvents* events) {
  if (state == nullptr || constants == nullptr || events == nullptr ||
      events->continuation_kind != ISAAC_GAME_UPDATE_RESUME_AFTER_FRAME_AUX_UPDATES) {
    return 0;
  }

  if (state->effect_counter_67788 > 0) {
    state->effect_counter_67788 = wrap_increment_i32(state->effect_counter_67788);
    state->position_reset_timer = state->effect_counter_67788 / 6 + 2;
    if (state->effect_counter_67788 >= 90) {
      state->position_reset_timer = 0;
      state->effect_counter_67788 = 0;
      state->position_x_bits = constants->reset_position_x_bits;
      state->position_y_bits = constants->reset_position_y_bits;
      events->opaque_call_006fdc10 += 1;
      events->continuation_kind = ISAAC_GAME_UPDATE_RESUME_AFTER_STAGE_TRANSITION_EFFECT;
      return 1;
    }
  }
  continue_after_stage_transition_effect(state, runtime_inputs, events);
  return 1;
}

extern "C" int32_t isaac_game_update_slice_resume_stage_transition_effect(
    IsaacGameUpdateSliceState* state,
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs,
    IsaacGameUpdateSliceEvents* events) {
  if (state == nullptr || events == nullptr ||
      events->continuation_kind != ISAAC_GAME_UPDATE_RESUME_AFTER_STAGE_TRANSITION_EFFECT) {
    return 0;
  }
  continue_after_stage_transition_effect(state, runtime_inputs, events);
  return 1;
}

namespace {
/* FrameEffect_6fd7c0 pure start-state + P4 after host body residual.
   Mode-4 SFX early residual returns without engine/P4 — skip pure apply.
   Site anim: site A effect-expire 20 / site B clear-nested 0.
   ABI v29: setup fields + predicate already pure-applied on engine-prefix
   resume when body ran; re-clear predicate here (idempotent 0) with start. */
void apply_frame_effect_6fd7c0_pure_after_host(
    IsaacGameUpdateSliceState* state,
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs,
    int32_t site_anim) {
  if (isaac_frame_effect_6fd7c0_mode4_sfx_early(
          state->timed_transition_cleanup_mode) != 0) {
    return;
  }
  /* ABI v104 (record idx 12 transition-pack wiring): with the pack LIVE the
     terminal pred becomes lane-decidable. The machine ran the engine (the
     F arm), then 0x6f0070 (0x6fdba6) decides the 0x265c0 clear (0x6fdbb1)
     from its captured AL; the 0x67744 byte store stays unconditional
     (family law). The pack-live flow also re-checks the SITE args: an
     invalid entry fataled in the body (ret 0x14 before the engine) so the
     start-state + terminals must NOT run. ready=0 keeps the pre-v104 dual
     approximation byte-for-byte. */
  const bool transition_pack_live =
      runtime_inputs != nullptr &&
      runtime_inputs->opaque_call_006fd7c0_ready != 0 &&
      runtime_inputs->transition_6fd7c0_ready != 0;
  if (transition_pack_live) {
    const int32_t site_room =
        site_anim == 20 ? state->room_transition_index_18900 : 0;
    const int32_t site_dim =
        site_anim == 20
            ? sign_extend_low_byte(state->room_transition_dimension_18904)
            : -1;
    if (isaac_game_update_slice_6fd7c0_args_valid(
            site_room, static_cast<uint32_t>(site_anim), site_dim) == 0) {
      return; /* PE fatal: no engine start-state, no P4 terminals */
    }
  }
  if (isaac_room_transition_engine_82ee40_early_skip_setup(state->gate_1ba78,
                                                           site_anim) == 0) {
    state->predicate_1ba74 = 0;
    /* Update sites pass arg2=-1; rewrite_slot keeps/sets -1. */
    IsaacRoomTransitionEngineStart start = {};
    isaac_room_transition_engine_82ee40_apply_start_state(&start, site_anim, -1);
    state->gate_1b83c = start.field_0;
    state->engine_field_8 = start.field_8;
    state->engine_field_c = start.field_c;
    state->engine_float_22c = start.field_22c;
    state->engine_float_230 = start.field_230;
  }
  const int32_t dual =
      transition_pack_live
          ? isaac_game_update_slice_6fd7c0_terminal_265c0_clear(
                runtime_inputs->transition_6fd7c0_engine_pred_probe)
          : (state->gate_1b83c != 0 && state->predicate_1ba74 != 0) ? 1 : 0;
  uint8_t byte = static_cast<uint8_t>(state->byte_67744 & 0xffu);
  isaac_frame_effect_6fd7c0_apply_terminals(&state->counter_265c0, dual, &byte);
  state->byte_67744 = byte;
}

/* FrameOpaque_4212c0 pure-complete shell after FUN_0098dba0 clamp (frame-aux). */
void apply_frame_opaque_4212c0_pure(
    IsaacGameUpdateSliceState* state,
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs,
    IsaacGameUpdateSliceEvents* events) {
  int32_t mode = state->frame_opaque_4212c0_mode;
  int32_t secondary = state->frame_opaque_4212c0_secondary;
  const int8_t flag_4c =
      static_cast<int8_t>(static_cast<uint8_t>(state->frame_opaque_4212c0_flag_4c & 0xffu));
  const int8_t slot_char = static_cast<int8_t>(
      static_cast<uint8_t>(runtime_inputs->frame_opaque_4212c0_slot_char & 0xffu));
  const int8_t flag_111 =
      static_cast<int8_t>(static_cast<uint8_t>(state->frame_opaque_4212c0_flag_111 & 0xffu));
  /* ABI v90: PE 0x00421300..0x00421316 — flag_111 low byte gates the
     sequential 409030 pair on subobjects A=+0x38 (field4=[+0x3c],
     flag14=[+0x4c]) and B=+0x58 (field4=[+0x5c], flag14=[+0x6c]).
     Each 409030 is a pure no-op (0x0040903d je / 0x00409045 je ->
     0x4090eb epilogue, no stores) when field4==0 or flag14 low byte==0.
     Both no-op -> the pair contributes nothing; fold flag_111 to 0 so
     try_pure reaches the secondary==3 arm (which follows the pair at
     0x0042131b) and applies its pure clear. One live 409030 -> keep
     flag_111 so try_pure hosts the whole arm (defect class 1: the live
     call stores into the subobject, and state apply must not fold the
     host's post-call bytes). ready=0 (runtime_inputs == nullptr or the
     slice's unshaped caller) keeps the pre-v90 always-host residual. */
  int32_t pair_needs_host = 0;
  if ((flag_111 & 0xffu) != 0u && runtime_inputs != nullptr &&
      runtime_inputs->frame_opaque_4212c0_pair_ready != 0u) {
    pair_needs_host = isaac_frame_opaque_409030_pair_needs_host(
        static_cast<uint32_t>(state->frame_opaque_4212c0_field_3c),
        static_cast<int32_t>(flag_4c),
        runtime_inputs->frame_opaque_4212c0_field_5c,
        static_cast<int32_t>(runtime_inputs->frame_opaque_4212c0_flag_6c));
  }
  /* ready==0 (or a live 409030) keeps flag_111 so try_pure hosts the whole
     arm; only a VERIFIED both-no-op pair folds it to 0. */
  uint32_t flag_111_eff =
      (flag_111 & 0xffu) != 0u &&
              (runtime_inputs == nullptr ||
               runtime_inputs->frame_opaque_4212c0_pair_ready == 0u ||
               pair_needs_host != 0)
          ? flag_111
          : 0u;
  /* ABI v95 (R1, record idx 10): when the A/B 409030 pair is LIVE
     (pair_needs_host) AND the capture pack is present (ab_pack_ready), the
     pair is decided PURELY in-module — the ANM2 state-update plan BY
     REFERENCE (frame-opaque 409030/408d00 laws + anm2 Rewind semantics) over
     the sampled subobject fields — and 0x408d00 AdvancePosition /
     0x40a1b0 Rewind fire as TYPED host events (they mutate heap AnimationData
     outside the Game capture). flag_111 folds to 0 so the PE's fall-through
     (0x42131b secondary==3 arm) still runs after the pair, exactly like the
     machine. pack_ready==0 (or pair_ready==0) keeps the pre-v95 always-host
     for a live pair. The pair events are published ONLY when the whole record
     resolves pure (host_required==0 at the exits below) — a true-probe host
     edge re-runs the whole record inside the host, pair included. */
  int32_t pair_plan_pure = 0;
  uint32_t pair_advance = 0;
  uint32_t pair_rewind = 0;
  int32_t a_no_loop_clear = 0;
  if ((flag_111 & 0xffu) != 0u && runtime_inputs != nullptr &&
      runtime_inputs->frame_opaque_4212c0_ab_pack_ready != 0u &&
      pair_needs_host != 0) {
    scratch_4212c0_anm2_plan = {};
    pair_plan_pure = 1;
    flag_111_eff = 0; /* the pair contributes no record host gate */
    for (int side = 0; side < 2; ++side) {
      const int is_a = side == 0;
      const uint32_t field4 = is_a
          ? static_cast<uint32_t>(state->frame_opaque_4212c0_field_3c)
          : runtime_inputs->frame_opaque_4212c0_field_5c;
      const int32_t flag14 = is_a
          ? static_cast<int32_t>(flag_4c)
          : static_cast<int32_t>(runtime_inputs->frame_opaque_4212c0_flag_6c);
      IsaacGameUpdateSlice4212c0Anm2Entry* ent =
          &scratch_4212c0_anm2_plan.entries[side];
      ent->receiver_off = is_a ? 0x38u : 0x58u;
      ent->path = -1; /* pure no-op epilogue until proven live */
      if (isaac_frame_opaque_409030_needs_host(field4, flag14) == 0) {
        continue; /* PE 0x40903d/0x409045 -> 0x4090eb, store-free */
      }
      const float float_10 = is_a
          ? __builtin_bit_cast(float, runtime_inputs->frame_opaque_4212c0_a_float_10)
          : __builtin_bit_cast(float, runtime_inputs->frame_opaque_4212c0_b_float_10);
      const float layer_104 = is_a
          ? __builtin_bit_cast(float, runtime_inputs->frame_opaque_4212c0_a_layer_104)
          : __builtin_bit_cast(float, runtime_inputs->frame_opaque_4212c0_b_layer_104);
      const int32_t frame_bound = is_a
          ? static_cast<int32_t>(runtime_inputs->frame_opaque_4212c0_a_frame_bound)
          : static_cast<int32_t>(runtime_inputs->frame_opaque_4212c0_b_frame_bound);
      const int32_t loop_flag = is_a
          ? static_cast<int32_t>(runtime_inputs->frame_opaque_4212c0_a_loop_flag)
          : static_cast<int32_t>(runtime_inputs->frame_opaque_4212c0_b_loop_flag);
      IsaacFrameOpaque409030Plan po = {};
      isaac_frame_opaque_409030_residual_plan(&po, float_10, layer_104,
                                              frame_bound, loop_flag);
      ent->path = static_cast<int32_t>(po.path);
      ent->advance_target = static_cast<int32_t>(po.advance_frame);
      ent->float_10_out = po.store_float_10 != 0 ? po.sum : 0u;
      ent->clear_flag_14 = po.clear_flag_14 != 0 ? 1u : 0u;
      scratch_4212c0_anm2_plan.live += 1;
      if (po.host_advance != 0) pair_advance += 1;
      if (po.host_rewind != 0) pair_rewind += 1;
      if (is_a != 0 && po.clear_flag_14 != 0) a_no_loop_clear = 1;
    }
    scratch_4212c0_anm2_plan.advance = static_cast<int32_t>(pair_advance);
    scratch_4212c0_anm2_plan.rewind = static_cast<int32_t>(pair_rewind);
    scratch_4212c0_anm2_plan.pure = 1;
  }
  /* ABI v91: PE 0x42132f..0x42133b — the secondary==3 probe arm
     (`call 0x40add0` on A; `test al,al; je 0x4213de`). Pure-false when the
     animation-name list is empty (isaac_frame_opaque_40add0_needs_host
     with listCount==0 and field4!=0 -> 0) or the host-resolved
     matchIndex/bitfield18 show the bit clear (bit_result -> 0). False ->
     0x4213de..0x4213ea is a pure clear (flag4c low==0 -> clear both; else
     ret) with NO calls. True -> 0x421343 true-probe interior (manager
     stores + 92e430 + 6fd7c0 + 8318a0) stays host. probeReady=0 keeps the
     pre-v91 always-host. flag_111 being live (host) short-circuits here:
     try_pure hosts the whole arm anyway.
     ABI v94 (R3 log-split): FUN_0040add0's fatal log 'AnimationData is
     NULL\n' (PE 0x40adde..0x40adee: push 0xb1a504; push 0x10; call
     0xa112c0; add esp,8) on the field_4==0 gate (0x40addc cmp / 0x40ade0
     jne) becomes a TYPED HOST EVENT. The log is NEVER a return — the probe
     flow (0x40adf1 mov esi,[ebx]; count=[esi+0x90]; test/je 0x40ae43
     miss; 0x40ae4e..0x40ae6a bit; 0x4213de..0x4213ea false-arm clear) runs
     after it on BOTH field_4 arms. So: the miss law (probe_pure_false on
     listCount) applies UNCONDITIONALLY — no field_4 gate — and the bit law
     applies when probe_resolved with a non-negative matchIndex, also
     without the old field_4!=0 gate (the machine re-tests nothing after
     the log). When the log fires the HOST EDGE STAYS (the platform logger
     is host; the false-arm clear runs inside the host's real 0x4212c0) and
     the typed event pins the log as the ONLY host content left — the
     post-log probe decision is pure (record-5 precedent). */
  const int32_t flag_111_live = flag_111_eff != 0u ? 1 : 0;
  /* The probe arm is reachable ONLY when mode != 0: PE 0x4212ce `je
     0x4213f7` exits pure on [A]==0 BEFORE the pair and the secondary==3
     arm (census A0 CLOSED, try_pure). mode==0 + secondary==3 +
     field_3c!=0 + probeReady==0 therefore stays pure (case 898: oracle 0,
     module used to fire the pre-v91 rail). */
  const int32_t probe_arm =
      flag_111_live == 0 && mode != 0 && secondary == 3 &&
      state->frame_opaque_4212c0_field_3c != 0 ? 1 : 0;
  int32_t host_required = 0;
  if (probe_arm != 0 &&
      runtime_inputs != nullptr &&
      runtime_inputs->frame_opaque_4212c0_probe_ready != 0u) {
    const uint32_t field_4 = runtime_inputs->frame_opaque_4212c0_add0_field_4;
    const uint32_t list_count = runtime_inputs->frame_opaque_4212c0_add0_list_count;
    const int32_t match_index = runtime_inputs->frame_opaque_4212c0_add0_match_index;
    const uint32_t bitfield_18 = runtime_inputs->frame_opaque_4212c0_add0_bitfield_18;
    const int32_t probe_resolved = runtime_inputs->frame_opaque_4212c0_probe_resolved != 0u ? 1 : 0;
    /* v94 split: log arm (field_4 == 0, PE 0x40addc/0x40ade0) vs probe arm. */
    const int32_t log_needed =
        isaac_game_update_slice_4212c0_add0_log_needed(field_4);
    if (log_needed != 0) {
      events->frame_opaque_4212c0_add0_log_needed = 1; /* typed host event */
    }
    int32_t probe_false = 0;
    if (isaac_game_update_slice_4212c0_add0_probe_pure_false(list_count) != 0) {
      probe_false = 1; /* post-log pure miss: count==0 -> al=0, any field_4 */
    } else if (runtime_inputs->frame_opaque_4212c0_add0_equal_flags_ready != 0u &&
               list_count <= ISAAC_FRAME_OPAQUE_40ADD0_MAX_ENTRIES) {
      /* ABI v95 (R4 equal-flag capture): the NON-EMPTY animation-name walk
         (PE 0x40ae05..0x40ae41, 0 E8 / 0 stores) runs ENTIRELY in-module
         via the frozen frame-opaque 40add0 laws — first match index over
         the per-entry equal-flag bytes, then the bit test
         (probe_from_equal_flags). The probe result (al) is fully
         in-module; the v91 host-resolved matchIndex/probeResolved are
         IGNORED on this arm (host strcmp leftovers). count over the cap
         or ready==0 keeps the exact v91/v94 matchIndex path below. */
      probe_false =
          isaac_frame_opaque_40add0_probe_from_equal_flags(
              runtime_inputs->frame_opaque_4212c0_add0_equal_flags,
              list_count, bitfield_18) == 0 ? 1 : 0;
    } else if (probe_resolved != 0 && match_index >= 0) {
      probe_false =
          isaac_frame_opaque_40add0_bit_result(bitfield_18, match_index) == 0 ? 1 : 0;
    }
    if (probe_false != 0) {
      /* PE 0x4213de..0x4213ea: field3c==0 -> clear both (unreachable here);
         flag4c low byte==0 -> clear both; else ret unchanged. Pure on the
         no-log arm; on the log arm the host still fires (platform logger)
         and runs the real clear — the event is the typed proof. */
      if (log_needed == 0) {
        if ((static_cast<uint32_t>(state->frame_opaque_4212c0_flag_4c) & 0xffu) == 0u) {
          mode = 0;
          secondary = 0;
        }
        if (pair_plan_pure != 0) {
          events->frame_opaque_4212c0_409030_advance = pair_advance;
          events->frame_opaque_4212c0_409030_rewind = pair_rewind;
          if (a_no_loop_clear != 0) {
            int32_t flag_4c_dword =
                static_cast<int32_t>(state->frame_opaque_4212c0_flag_4c);
            isaac_frame_opaque_409030_apply_no_loop_clear(&flag_4c_dword);
            state->frame_opaque_4212c0_flag_4c =
                static_cast<uint32_t>(flag_4c_dword);
          }
        }
        state->frame_opaque_4212c0_mode = mode;
        state->frame_opaque_4212c0_secondary = secondary;
        return;
      }
      host_required = 1; /* only the platform log is host */
    } else {
      /* ABI v96 (record idx 10 R2, v98 interior LIVE seam; layouts frozen
         956/14276): the true-probe interior PREFIX (PE 0x421343..0x4213cd)
         becomes an in-module DECISION when the ABI-96 SFX-manager blob is
         captured (frame_opaque_4212c0_true_probe_ready != 0) AND the probe
         is PROVABLY TRUE (true_probe_reached — the same equal-flags /
         matchIndex bit arms the probe_false split uses) AND no fatal log
         is pending. The composed prefix plan (store mask 0x1ff, the
         volume gate host_92e430_needed, the se+0x14 store, the five
         0x6fd7c0 args, call_8318a0_drop from the LIVE record-4 gate lanes
         opaque_008318a0_ready/_mode) is filled into the step scratch, the
         typed event frame_opaque_4212c0_true_probe_interior +1s, and the
         opaque record edge is DROPPED — the bridge applies the typed
         bodies (9 manager stores + 0x92e430 + 0x6fd7c0 + 0x8318a0 iff
         call_8318a0_drop==0) from the scratch. The prefix has ZERO Game
         stores, so mode/secondary commit unchanged. Blob absent / log /
         walk-live undecided keep the pre-v96 monolithic host edge
         byte-for-byte (@936 stays 0). probeReady==0 is capture-absence
         (the PE probe always runs) — the v91 host edge stays. */
      const uint32_t blob_ready =
          runtime_inputs->frame_opaque_4212c0_true_probe_ready;
      const uint32_t equal_flags_ready =
          runtime_inputs->frame_opaque_4212c0_add0_equal_flags_ready;
      scratch_4212c0_true_probe_prefix_plan = {};
      if (log_needed == 0 && blob_ready != 0u &&
          isaac_game_update_slice_4212c0_true_probe_reached(
              runtime_inputs->frame_opaque_4212c0_probe_ready, probe_resolved,
              equal_flags_ready, runtime_inputs->frame_opaque_4212c0_add0_equal_flags,
              list_count, match_index, bitfield_18) != 0) {
        isaac_game_update_slice_4212c0_true_probe_prefix_plan(
            runtime_inputs->frame_opaque_4212c0_probe_ready, probe_resolved,
            equal_flags_ready, runtime_inputs->frame_opaque_4212c0_add0_equal_flags,
            list_count, match_index, bitfield_18,
            runtime_inputs->frame_opaque_4212c0_true_probe_volume_bits,
            runtime_inputs->opaque_008318a0_ready,
            runtime_inputs->opaque_008318a0_mode,
            &scratch_4212c0_true_probe_prefix_plan);
        events->frame_opaque_4212c0_true_probe_interior += 1;
        /* host_required stays 0: the typed event replaces the opaque edge. */
      } else {
        host_required = 1;
      }
    }
  } else {
    host_required = probe_arm != 0
        ? 1
        : isaac_frame_opaque_4212c0_try_pure(
              &mode,
              &secondary,
              state->frame_opaque_4212c0_field_3c,
              flag_4c,
              slot_char,
              flag_111_eff);
  }
  if (host_required != 0) {
    events->opaque_call_004212c0 += 1;
  } else {
    if (pair_plan_pure != 0) {
      events->frame_opaque_4212c0_409030_advance = pair_advance;
      events->frame_opaque_4212c0_409030_rewind = pair_rewind;
      if (a_no_loop_clear != 0) {
        int32_t flag_4c_dword =
            static_cast<int32_t>(state->frame_opaque_4212c0_flag_4c);
        isaac_frame_opaque_409030_apply_no_loop_clear(&flag_4c_dword);
        state->frame_opaque_4212c0_flag_4c =
            static_cast<uint32_t>(flag_4c_dword);
      }
    }
    state->frame_opaque_4212c0_mode = mode;
    state->frame_opaque_4212c0_secondary = secondary;
  }
}

/* FUN_0098dba0 pure islands after host player walk produced runtime bVar2.
   Machine order: pure counter step → host timer → pure mode/float → gated
   text_out → pure clamp. */
/* HUD_Message::text_out (VA 0x00840c60) pure decision, transcribed from the
   instruction stream:
     0x840c63  cmp byte [esi+0x8], 0 ; je ret          gate 1: this+8
     0x840c69  cmp dword [esi+0x54], 0 ; je 0x840cb9  gate 2a: no text -> play
     0x840c6f  cmp byte [esi+0x64], 0 ; je 0x840cb9  gate 2b: not played -> play
     0x840c75.. mov eax, [esi+0x54]; cap<0x10 ? ptr : [ptr]; maybe 0xb1a4ec ""
     0x840c90..0x840caa two-byte-stride strcmp against 0xb6dbe8 "TextOut"
     equal (0x840cac) -> skip; differ (0x840cb0 sbb/or) -> play.
   The 8 captured compare bytes are compared byte-wise to "TextOut" + NUL;
   equality on all 8 is exactly C-string equality for this fixed target. */
extern "C" int32_t isaac_game_update_slice_hud_message_text_out_need(
    uint32_t flag_8,
    uint32_t ptr_54,
    uint32_t played_64,
    uint32_t words_0,
    uint32_t words_1) {
  const uint32_t flag = flag_8 & 0xffu;
  const uint32_t played = played_64 & 0xffu;
  if (flag == 0u) return 0;                 /* 0x840c67 je return */
  if (ptr_54 == 0u) return 1;               /* 0x840c6d je play   */
  if (played == 0u) return 1;               /* 0x840c73 je play   */
  /* 0x0074754f78746554 = bytes 54 65 78 74 4F 75 74 00 ("TextOut"+NUL, LE). */
  const uint64_t words = (uint64_t)words_0 | ((uint64_t)words_1 << 32u);
  return words == UINT64_C(0x0074754f78746554) ? 0 : 1;
}

/* ABI v65: VA 0x00746560 notify arguments and proven post-state.

   0x00746560 itself stays a host residual — it builds two std::strings
   (0x007460b0 from Game+0x26584/+0x1bbd8/+0x269c4, 0x00746260 over the
   0x70-stride Game+0x1a564..+0x1a568 vector), optionally appends the
   0x009586f0 lookup of ".rdata 0xb6a82c \"#Online/DEATHMATCH_NAME\"", and
   hands both to the Game+0x216e0 widget at 0x00840b00, which plays an ANM2
   animation. None of that is translatable here.

   What IS pure is everything the PE decides before entering the body, plus the
   two byte stores 0x00840b00 makes into fields this slice already tracks:
     0x00840bd7  mov byte [edi+8], 1   -> Game+0x216e8 (hud_message_flag_8)
     0x00840b9c  mov byte [edi+9], cl  -> Game+0x216e9 (the text_out gate byte)
   with edi = Game+0x216e0. */
extern "C" uint32_t isaac_game_update_slice_host_746560_notify_byte(uint32_t param) {
  /* 0x00746602 `mov al,[ebp+8]` reads only the low byte of the pushed dword,
     0x0074661f `xor al,1` flips bit 0 of that byte, and 0x00840b9c stores the
     low byte again. Narrow explicitly: the Wasm ABI does not narrow i32
     arguments, so a uint8_t parameter here would be silently wrong. */
  const uint32_t low = param & 0xffu;
  return (low ^ 1u) & 0xffu;
}

extern "C" int32_t isaac_game_update_slice_host_746560_deathmatch_suffix(
    uint32_t cleanup_mode) {
  /* 0x007465b0 `cmp dword [esi+0x26614], 2` / 0x007465b7 `jl 0x7465fb` — the
     jump is SIGNED, so the append block runs on int32 >= 2 only. */
  return (int32_t)cleanup_mode >= 2 ? 1 : 0;
}

/* ABI v95: record idx 6 (0x00746560 notify body) string-build DECISION
   laws. The body's std::string content stays host-built (0x7460b0/0x746260
   tails + 0x745ca0); the widget 0x840b00 (intern-alloc 0xa2c370 + ANM2
   play) stays typed-host. These six laws are the pure decisions the PE
   executes before the widget call and during string teardown. */

/* 0x0074660c `cmp dword [ebp-0x18],0x10` / 0x00746613 `cmovae edx,
   [ebp-0x2c]` (string2) and 0x00746617/0x0074661b (string1): the widget's
   string-data argument is the HEAP pointer iff _Myres >= 0x10 (UNSIGNED
   ae), else the SSO inline buffer. The widget 0x840b00 null-tests the
   pointer (0x840b2b je fatal / 0x840b46 jne intern), so the choice is
   observable. */
extern "C" uint32_t isaac_game_update_slice_746560_string_data_ptr(
    uint32_t cap, uint32_t ptr, uint32_t base) {
  return cap >= 0x10u ? ptr : base;
}

/* 0x007465fb `cmp dword [ebp-0x1c],0` / 0x00746608 `setne byte
   [ebp-0x48]`: the widget's 4th argument is `string2._Mysize != 0` — the
   walk-found flag (0x840b91 stores it to Game+0x216ea). */
extern "C" int32_t isaac_game_update_slice_746560_string_found(uint32_t size) {
  return size != 0u ? 1 : 0;
}

/* 0x00746632..0x007466a0 (both strings; string2 shown): the inlined MSVC
   _Tidy_deallocate length/capacity gates —
     746635  cmp edx,0x10 / jb   ; _Myres < 0x10      -> SSO, NO free
     746640  cmp edx,0x1000 / jb ; _Myres+1 < 0x1000  -> small free
     746648  mov ecx,[ecx-4]     ; _Alval = *(ptr-4)   (block header)
     746653  cmp eax,0x1f / ja   ; ptr-_Alval-4 > 0x1f -> operator delete
   All compares UNSIGNED; edx = _Myres+1 (32-bit wrap at 0xffffffff), and
   the large-arm size adds 0x23. Returns 0 NONE / 1 SMALL / 2 LARGE. The
   free calls themselves (0xaef15c / [0xb18894]) are platform primitives. */
extern "C" uint32_t isaac_game_update_slice_746560_free_plan(
    uint32_t cap, uint32_t ptr, uint32_t block_header) {
  if (cap < 0x10u) return 0u;                       /* 0x746638 jb skip */
  const uint32_t size = cap + 1u;                   /* 0x74663d inc edx */
  if (size < 0x1000u) return 1u;                    /* 0x746646 jb small */
  /* Large arm: delta = ptr - _Alval - 4, UNSIGNED 32-bit wrap. */
  const uint32_t delta = (ptr - block_header) - 4u; /* 0x74664e/0x746650 */
  if (delta > 0x1fu) return 2u;                     /* 0x746656 ja delete */
  return 1u;                                        /* 0x746658 small */
}

/* 0x007462e8..0x00746304: the 0x746260 walk count. span = [Game+0x1a568] -
   [Game+0x1a564] (32-bit wrap), then the signed magic divide:
     mov eax,0x92492493; imul ecx; add edx,ecx; sar edx,4; shr eax,31; add
   = trunc(span / 28) (verified over 599,987 int32 spans, 0 mismatches).
   The 0x00746302 `test eax,eax / jle` gate is SIGNED: negative counts skip
   the walk. */
extern "C" int32_t isaac_game_update_slice_746260_walk_count(
    uint32_t end, uint32_t begin) {
  const int32_t span = static_cast<int32_t>(end - begin); /* 32-bit wrap */
  /* Signed 64-bit product of M (as int32) and span; the PE's `add edx,ecx`
     wraps mod 2^32, so do the add in uint32_t before the arithmetic shift —
     this mirrors `sar edx,4` + the sign fixup exactly. */
  const int64_t prod =
      static_cast<int64_t>(static_cast<int32_t>(UINT32_C(0x92492493))) * span;
  const uint32_t hi = static_cast<uint32_t>(static_cast<int32_t>(prod >> 32));
  const int32_t shifted = static_cast<int32_t>(hi + static_cast<uint32_t>(span)) >> 4;
  /* PE 0x7462fd `shr eax,31` is LOGICAL: 0/1, never -1. */
  return shifted + static_cast<int32_t>(static_cast<uint32_t>(shifted) >> 31);
}

/* 0x00746310..0x00746344: per-index match. acc = 0x6f9400() | this+0xc |
   *(Game+0x26550) (host-captured predicate OR), clear = 0x6f95a0() (host),
   mask = 1 << (index & 31) (`shl eax,cl`), and `test edi,edx / jne` fires
   iff acc & ~clear & mask != 0 — that index takes the 0x82c600 lookup
   branch (0x74637d). */
extern "C" int32_t isaac_game_update_slice_746260_index_matches(
    uint32_t acc, uint32_t clear, uint32_t index) {
  const uint32_t mask = 1u << (index & 31u);
  return (acc & ~clear & mask) != 0u ? 1 : 0;
}

/* 0x007460c8 `cmp dword [esi+0x26584],0x2c` / 0x007460d5 `jne 0x74619d`:
   the string-1 choice gate, FULL-DWORD equality (mode26584 is a slice
   state field @432). */
extern "C" int32_t isaac_game_update_slice_7460b0_gate_26584(uint32_t mode) {
  return mode == 0x2cu ? 1 : 0;
}

/* ABI v66: FUN_0098dba0 timer-block entry gate, transcribed from the stream:

     0098de4a  8b871c060000       mov  eax, dword ptr [edi + 0x61c]
     0098de50  85c0               test eax, eax
     0098de52  0f8ec7000000       jle  0x98df1f            ; SIGNED
     0098de58  48                 dec  eax
     0098de59  89871c060000       mov  dword ptr [edi + 0x61c], eax
     ... 0x6eef60 / 0x41d540 / 0x41d520 ...
     0098df0f  f30f118f20060000   movss dword ptr [edi + 0x620], xmm1
     0098df17  f30f118724060000   movss dword ptr [edi + 0x624], xmm0
     0098df1f  8b07               mov  eax, dword ptr [edi]     ; join

   edi = Game+0x25ecc, so +0x61c/+0x620/+0x624 are Game+0x264e8/+0x264ec/+0x264f0.

   THE SKIP IS A PROOF-COMPLETE NO-OP. Every path from 0x0098de4a to the join
   at 0x0098df1f, enumerated from the instruction stream:

   - The block has exactly ONE entry. A whole-function branch census finds the
     only branch targets landing in [0x0098de4a, 0x0098df1f) are 0x0098dc13
     `je`, 0x0098de36 `je` and 0x0098de3f `jne`, and all three target
     0x0098de4a itself. Nothing jumps into the interior.
   - The block contains exactly ONE branch, the `jle` at 0x0098de52. So there
     are exactly two paths: the gate-taken path (3 instructions) and the
     straight-line fall-through.
   - Every memory write and every call in the block is at an address >=
     0x0098de59, i.e. strictly after the `jle`. The gate-taken path performs no
     store and no call — only the single READ at 0x0098de4a.
   - Its two clobbers are dead at the join. eax is overwritten by the join's own
     first instruction (0x0098df1f `mov eax,[edi]`). EFLAGS: 0x0098df1f `mov`,
     0x0098df21 `xorps` and 0x0098df24 `movss` write no flags, and the first
     flag producer after the join is 0x0098df2c `sub eax,0`, consumed by
     0x0098df2f `je` — so the `test` flags are never read.
   - The four ebp scratch slots the live path writes ([ebp-0x10], [ebp-0x14],
     [ebp-0x18], [ebp-0x1c]) are not read at or after the join: the last read of
     any of them in the whole function is 0x0098df0a, inside the block.

   So `(int32)Game+0x264e8 <= 0` makes the whole block observationally empty,
   and the host timer edge must not be emitted there.

   `jle` is 0f 8e — SIGNED. An unsigned model inverts the common path: it would
   run the block for 0x80000000 and 0xffffffff, which the PE skips. */
extern "C" int32_t isaac_game_update_slice_98dba0_timer_block_live(uint32_t timer_264e8) {
  /* Re-narrow explicitly. The parameter is uint32_t so the differential can
     present 0x80000000/0xffffffff across the Wasm boundary unmasked. */
  return (int32_t)timer_264e8 > 0 ? 1 : 0;
}

/* ABI v92: FUN_0098dba0 empty-vector player-walk gate, transcribed from the
   walk head (disasm-98dba0-walk.txt):

     0x0098dbcd  mov eax, dword ptr [0xc71678]   ; Game
     0x0098dbd2  mov edx, dword ptr [eax+0x1baac]; player vector END
     0x0098dbd8  sub edx, dword ptr [eax+0x1baa8]; END-BEGIN (32-bit wrap)
     0x0098dbde  sar edx, 2                      ; count = (end-begin) SAR 2
     0x0098dbe1  test edx, edx
     0x0098dbe3  jne  0x0098dbf4                 ; count != 0 -> skip fatal
     0x0098dbe5  push 0xb7e6bc                   ; "There are no players!"
     0x0098dbea  push 0x10                       ; level 0x10
     0x0098dbec  call 0xa112c0                   ; platform logger (HOST)
     0x0098dbf1  add  esp, 8
     0x0098dbf4  ... xor bl,bl / re-derive count
     0x0098dc11  test eax, eax
     0x0098dc13  je   0x0098de4a                 ; count==0 -> SKIP walk loop

   The empty arm (count==0) is proof-complete: [0x0098dbf4, 0x0098de4a) has
   ZERO stores and ZERO calls (the mid-loop re-check fatal 0x0098dc30 is only
   reachable when the vector empties between iterations — impossible when the
   loop never runs), and the 0x0098de34 `test bl,bl / je` counter step no-ops
   (bl==0). What stays host is ONLY the fatal log edge 0xa112c0, a platform
   primitive under the standing logger split. The count law is `test edx,edx`
   on the FULL SAR result: any nonzero count — including NEGATIVE diffs
   (end < begin) and wrapped diffs — keeps the walk body host; a byte-narrow
   or unsigned-shift translation diverges on wide diffs. */
extern "C" int32_t isaac_game_update_slice_98dba0_walk_vector_count(uint32_t begin, uint32_t end) {
  /* 0x0098dbd8 sub / 0x0098dbde sar 2: 32-bit wrap then ARITHMETIC shift. */
  const int32_t delta =
      static_cast<int32_t>(static_cast<uint32_t>(end) - static_cast<uint32_t>(begin));
  return delta >> 2;
}

extern "C" int32_t isaac_game_update_slice_98dba0_walk_pure_skip(uint32_t begin, uint32_t end) {
  /* PE 0x0098dbe1 test/jne + 0x0098dc11 test/je: count==0 -> fatal + pure skip. */
  return isaac_game_update_slice_98dba0_walk_vector_count(begin, end) == 0 ? 1 : 0;
}

/* ABI v93: record idx 9 (0x008ef990) iterate-arm JOIN (PE 0x8efc92..0x8efce9).
   The JOIN tests idx8 ([edi+8] == mode_24ed8) against the mode-0xe listener
   probe out P ([esp+0x10]); equal -> epilogue 0x8efe04 (NO-SFX exit, zero
   calls); else the SFX path writes node->id=0x11a, calls 0x956780, then
   Play 0x92dc30. When the RTE 956780 gate is CLOSED the prep is a pure
   no-op and Play is the sole residual host call. */
extern "C" int32_t isaac_game_update_slice_8ef990_join_skip(uint32_t probe, uint32_t idx8) {
  /* 0x008efc96 cmp [edi+8],eax / 0x008efc99 je 0x8efe04. */
  return probe == idx8 ? 1 : 0;
}

/* ABI v94 (R3 log-split, record idx 10): FUN_0040add0 probe-arm split laws.
   log_needed mirrors PE 0x40addc cmp dword [ebx+4],0 / 0x40ade0 jne — a
   FULL-DWORD compare (0x100 must NOT log; the family needs_host conflation
   folded this arm and the walk arm together). */
extern "C" int32_t isaac_game_update_slice_4212c0_add0_log_needed(uint32_t field_4) {
  return (field_4 == 0u) ? 1 : 0;
}

/* probe_pure_false mirrors PE 0x40adfb test ebx,ebx / 0x40adfd je 0x40ae43
   -> al=0: the empty animation-name list probe is PURE-FALSE. This is the
   post-log MISS law: the log falls through (add esp,8 @0x40adee) into the
   probe flow, so the miss is reachable on BOTH field_4 arms — no field_4
   gate (the old isaac_frame_opaque_40add0_needs_host required field_4!=0,
   hiding the post-log miss). FULL-DWORD compare on the count. */
extern "C" int32_t isaac_game_update_slice_4212c0_add0_probe_pure_false(uint32_t list_count) {
  return (list_count == 0u) ? 1 : 0;
}

/* ABI v96 (record idx 10 R2, 0x004212c0): the true-probe interior PREFIX
   decision law — blob-gated pure arm per the v92 98dba0-walk precedent.
   PE 0x421343..0x4213cd (wait-gate 0x4213cd/0x4213d3): 9 manager stores +
   the volume ucomiss gate + the 0x6fd7c0 edge + the 0x8318a0 call-mode.
   The interior host edge (0x92e430 / 0x6fd7c0 / 0x8318a0) STAYS; these
   exports pin what the prefix DOES with today's lanes. probeReady==0 is
   the capture-absence always-host boundary (NOT this law's arm — reached
   returns 0 and the v91 host edge keeps firing). The probe-false
   inversion mirrors apply_frame_opaque_4212c0_pure BY REFERENCE to the
   frozen frame-opaque 40add0 laws: miss (probe_pure_false) -> false;
   equal-flags arm (ready && count<=64) -> probe_from_equal_flags;
   resolved arm (probe_resolved && match_index>=0) -> bit_result;
   undecided (walk-live) -> NOT provably reached (0). */
extern "C" int32_t isaac_game_update_slice_4212c0_true_probe_reached(
    uint32_t probe_ready, uint32_t probe_resolved, uint32_t equal_flags_ready,
    const uint8_t* equal_flags, uint32_t list_count, int32_t match_index,
    uint32_t bitfield_18) {
  if (probe_ready == 0u) return 0; /* blob-gate: no capture -> host boundary */
  if (isaac_game_update_slice_4212c0_add0_probe_pure_false(list_count) != 0) {
    return 0; /* empty list -> al=0 (PE 0x40adfd je), any field_4 */
  }
  if (equal_flags_ready != 0u && list_count <= ISAAC_FRAME_OPAQUE_40ADD0_MAX_ENTRIES) {
    /* v95 equal-flag walk: the probe result (al) is fully in-module. */
    return isaac_frame_opaque_40add0_probe_from_equal_flags(
               equal_flags, list_count, bitfield_18) != 0
               ? 1
               : 0;
  }
  if (probe_resolved != 0u && match_index >= 0) {
    return isaac_frame_opaque_40add0_bit_result(bitfield_18, match_index) != 0
               ? 1
               : 0;
  }
  return 0; /* undecided — the host walk resolves the probe */
}

/* The 0x4213d3 wait-gate law: the record-4 mode dispatch decides whether
   the 8318a0 call is a PURE epilogue. PE 0x831902 mov eax,[ebx] / dec /
   cmp 3 / ja 0x8326a1 — FULL-DWORD (u32)(mode-1) > 3 folds to 0, the
   record-4 body_case law BY REFERENCE. ready==0 keeps the v87 always-host
   (no opaque_008318a0_ready capture). */
extern "C" int32_t isaac_game_update_slice_4212c0_true_probe_8318a0_drop(
    uint32_t gate_ready, uint32_t mode) {
  if (gate_ready == 0u) return 0;
  return isaac_game_update_slice_8318a0_body_case(mode) == 0 ? 1 : 0;
}

/* The COMPOSED interior prefix plan. reached is consumed from
   true_probe_reached (never re-derived); the store mask, the volume gate
   (bit-exact 0x3f800000 equality — ucomiss compares VALUES and NaN/-0.0
   can never equal 1.0f, so bit equality is exact), the se+0x14 store and
   the five 0x6fd7c0 args are PE constants; call_8318a0_drop comes from
   the wait-gate law. Returns reached (1 = the host edge runs the prefix).
   The manager blob (base/f18/ebc/volume_bits) has NO layout lanes —
   raw params, ABI-96 §lane-requests. */
extern "C" int32_t isaac_game_update_slice_4212c0_true_probe_prefix_plan(
    uint32_t probe_ready, uint32_t probe_resolved, uint32_t equal_flags_ready,
    const uint8_t* equal_flags, uint32_t list_count, int32_t match_index,
    uint32_t bitfield_18, uint32_t volume_bits, uint32_t gate_8318a0_ready,
    uint32_t gate_8318a0_mode, IsaacGameUpdateSlice4212c0TrueProbePrefixPlan* out) {
  const int32_t reached = isaac_game_update_slice_4212c0_true_probe_reached(
      probe_ready, probe_resolved, equal_flags_ready, equal_flags, list_count,
      match_index, bitfield_18);
  if (out == nullptr) return reached;
  const int32_t eq = (volume_bits == ISAAC_GAME_UPDATE_4212C0_TRUE_PROBE_VOLUME_ONE_BITS)
                         ? 1
                         : 0;
  out->reached = reached;
  out->store_mask = reached != 0 ? ISAAC_GAME_UPDATE_4212C0_TRUE_PROBE_STORE_MASK : 0u;
  out->volume_eq_one = eq;
  out->host_92e430_needed = (eq == 0) ? 1 : 0;
  out->volume_after_gate =
      eq != 0 ? volume_bits : ISAAC_GAME_UPDATE_4212C0_TRUE_PROBE_VOLUME_ONE_BITS;
  out->se_14_bits = ISAAC_GAME_UPDATE_4212C0_TRUE_PROBE_SE14_BITS;
  out->sixfd7c0_arg0 = ISAAC_GAME_UPDATE_4212C0_TRUE_PROBE_6FD7C0_ARG0;
  out->sixfd7c0_arg1 = ISAAC_GAME_UPDATE_4212C0_TRUE_PROBE_6FD7C0_ARG1;
  out->sixfd7c0_arg2 = ISAAC_GAME_UPDATE_4212C0_TRUE_PROBE_6FD7C0_ARG2;
  out->sixfd7c0_arg3 = ISAAC_GAME_UPDATE_4212C0_TRUE_PROBE_6FD7C0_ARG3;
  out->sixfd7c0_arg4 = ISAAC_GAME_UPDATE_4212C0_TRUE_PROBE_6FD7C0_ARG4;
  out->call_8318a0_drop =
      isaac_game_update_slice_4212c0_true_probe_8318a0_drop(gate_8318a0_ready,
                                                            gate_8318a0_mode);
  return reached;
}

/* ------------------------------------------------------------------ v95 - */
/* Record idx 2 (0x009b6840 MenuGateUpdate) body pure laws. Full-body census
   in section-notes/update-v95-menu-update-census/NOTES.md. TRUE extent
   0x9b6840..0x9b7180 (645 reachable insns, single ret 0x9b7180, SEH
   epilogue); 46 E8 + 3 indirect. Every law below is a pure gate/arm-select/
   store law transcribed from the instruction stream — the host leaves
   (FCO 0x9be080, ANM2 0x40b430/0x408b90/0x40a5d0/0x40a380/0x40aaf0/
   0x408e00/0x409030/0x425130, room walks 0x6edfa0/0x90aeb0/0x90b100/
   0x907b60/0x9b7f90/0x417870/0x90aeb0, fatal logs 0xa112c0, 0xa288a0,
   virtual [vt+0x1c]/[vt+0xc] and global fnptr [0xc7f60c]) stay host. */

/* A2 mode-latch store law (PE 0x9b6905 cmp dword [eax+0x22ed4],2 /
   0x9b690c je skip): FULL-DWORD !=2 -> store 1 to Game+0x22ed4 and 2 to
   Game+0x22edc. The slice tracks both status fields, so the law is the
   in-module mirror of a host-internal store. WIDE 0x100/0x1ff/0xffffffff
   must latch (a low-byte compare would skip on 0x102). */
extern "C" int32_t isaac_game_update_slice_9b6840_mode_latch_needed(
    uint32_t status_22ed4) {
  return status_22ed4 != 2u ? 1 : 0;
}

/* A1 FCO-probe gate (PE 0x9b6895 mov eax,[ecx+0x4b3d8] / 0x9b689b cmp
   eax,[ecx+0x4b3dc] / 0x9b68a1 jne skip): the FirstCollectibleOwner probe +
   room-entity walk runs ONLY when the manager container [Manager+0x4b3d8,
   +0x4b3dc) is EMPTY; any non-empty span is a pure skip (0 calls, 0 stores
   on that path). FULL-DWORD equality. */
extern "C" int32_t isaac_game_update_slice_9b6840_fco_probe_needed(
    uint32_t mp_begin, uint32_t mp_end) {
  return mp_begin == mp_end ? 1 : 0;
}

/* A1 walk count gate (PE 0x9b68c7 cmp [ebx+0x1264], esi(0) / 0x9b68cd
   jbe skip): UNSIGNED count==0 skips the walk loop entirely (zero calls,
   zero stores). Negative counts (0xffffffff) are non-zero and walk. */
extern "C" int32_t isaac_game_update_slice_9b6840_walk_count_needed(
    uint32_t count) {
  return count != 0u ? 1 : 0;
}

/* A1 walk per-entry eligibility (PE 0x9b68d9 cmp dword [ecx+0x28],5 /
   0x9b68df cmp dword [ecx+0x2c],0x64): type==5 && variant==0x64 are
   FULL-DWORD compares — 0x105/0x164 must NOT be eligible. The 0x6edfa0
   host leaf fires once per eligible entry. */
extern "C" int32_t isaac_game_update_slice_9b6840_walk_entry_needed(
    uint32_t type_28, uint32_t variant_2c) {
  return (type_28 == 5u && variant_2c == 0x64u) ? 1 : 0;
}

/* A8 tail render gate (PE 0x9b712a cmp esi,1 / 0x9b7132 mov ecx,0x135 /
   0x9b7137 cmovne eax,ecx / 0x9b713a cmp byte [eax+edi],0 / 0x9b713e
   je exit): FULL-DWORD mode==1 selects byte this+0x249 else this+0x135,
   LOW-BYTE test != 0 -> the two 0x409030 renders run. WIDE 0x101 mode
   must pick the 0x135 byte; byte 0x100 is low-byte 0 (no render). */
extern "C" int32_t isaac_game_update_slice_9b6840_tail_render_needed(
    uint32_t mode, uint32_t byte_249, uint32_t byte_135) {
  const uint32_t sel = mode == 1u ? byte_249 : byte_135;
  return (sel & 0xffu) != 0u ? 1 : 0;
}

/* A4 ANM2 layer bounds gate (PE 0x9b6a02 cmp [anim+0x80],2 / 0x9b6a09
   jg ok): SIGNED anim_max > requested skips the 'LayerId out of bounds\n'
   fatal log (0xa112c0, b1a564). 0xffffffff max is negative and logs. */
extern "C" int32_t isaac_game_update_slice_9b6840_anim_layer_ok(
    uint32_t anim_max, uint32_t requested) {
  return (int32_t)anim_max > (int32_t)requested ? 1 : 0;
}

/* A4 ANM2 id bounds gate (PE 0x9b6a32..0x9b6a3d: test eax,eax / je fatal;
   test ebx,ebx / js fatal; cmp ebx,[anim+0x1c] / jl ok): the layer op runs
   iff anim!=0 && (int32)id >= 0 && (int32)id < (int32)count — SIGNED both
   ends; 0xffffffff id (negative) must fail. */
extern "C" int32_t isaac_game_update_slice_9b6840_anim_id_ok(
    uint32_t anim_nonzero, uint32_t id, uint32_t count) {
  if (anim_nonzero == 0u) return 0;
  const int32_t s_id = (int32_t)id;
  const int32_t s_count = (int32_t)count;
  return (s_id >= 0 && s_id < s_count) ? 1 : 0;
}

/* ------------------------------------------------------------------ v95 - */
/* Record idx 35 opaqueRoomUpdateTailRain (B15 rain spawn loop 0x00802a80..
   0x00802e0d): loop-frame pure laws. The room-family laws are consumed BY
   REFERENCE (v54 relay 0x428b20, v55 loop step/spawn args, B1
   corners/world-xy/count/xorshift/once-flag) — never re-transcribed here. */

/* Count law 0x00802bb1..0x00802bdc: esi = 4; owner!=0 -> q=0x7cb6e0(owner)
   (q-2==0 -> 6, q-3==0 -> 8); spawn_count = min_u32(base, signed
   (end-begin)/0x78) via magic 0x88888889 idiv (signed) + cmovb.
   Delegation equals the room B1 transcription exactly. */
extern "C" int32_t isaac_game_update_slice_b15_rain_spawn_count(
    uint32_t owner_nonzero, uint32_t quality, uint32_t begin_183a4,
    uint32_t end_183a8) {
  return isaac_room_b1_spawn_count_resolved(
      static_cast<int32_t>(owner_nonzero != 0u ? 1 : 0),
      static_cast<int32_t>(quality), begin_183a4, end_183a8);
}

/* One-iteration loop-frame law (0x00802c20..0x00802e08 + 0x00802daf..
   0x00802dc4 + 0x00802dee). Compose: v55 rain loop_step (seed carry,
   UNSIGNED rem div-guard, jge continue, fatal stops) + B1 corner_indices /
   corner_pick (t[seed_corner & 3], PE 0x00802d40) + B1 corner_world_xy
   (idiv w, x=col*40+40 @0xbaa904, y=row*40+120 @0xbaaa00;
   f32 bits) + v55 rain spawn_args (a1..a7, relay 0x428b20, bind 0x7ef420,
   entity mark 0x32c = -1). Zero-fill defaults so fatal early-outs leave
   stable zeros (v55 convention). */
extern "C" void isaac_game_update_slice_b15_rain_frame(
    uint32_t seed_in, int32_t index, int32_t spawn_count, int32_t room_w_c,
    int32_t room_h_10, uint32_t slot_f0, uint32_t slot_f4, uint32_t slot_f8,
    uint32_t slot_f34, uint32_t search_result,
    IsaacGameUpdateSliceB15RainFrame* out) {
  if (out == nullptr) return;
  IsaacGameUpdateSliceB15RainFrame f = {};
  f.remaining = spawn_count - index;
  f.seed_in = seed_in;
  f.next_index = index + 1;
  f.continue_loop = (f.next_index < spawn_count) ? 1 : 0;
  f.seed_fatal = ISAAC_GAME_UPDATE_B15_RAIN_SEED_OK;
  f.arg_a4 = ISAAC_GAME_UPDATE_B15_RAIN_POS_VEC_PTR;
  f.arg_a5 = 0;
  f.arg_a3 = search_result;
  f.spawn_site_va = ISAAC_GAME_UPDATE_B15_RAIN_SPAWN_SITE_VA;
  f.bind_va = ISAAC_GAME_UPDATE_B15_RAIN_HOST_VA_BIND;
  f.entity_mark_value = ISAAC_GAME_UPDATE_B15_RAIN_ENTITY_MARK_VALUE;
  /* v55 loop step (room law, by reference) — slot/swap offsets come from
     the step (index*0x78 / swap_index*0x78, PE 0x00802de0 / 0x00802c8b). */
  {
    IsaacRoomB15RainLoopStep step = {};
    isaac_room_b15_rain_loop_step(seed_in, index, spawn_count, &step);
    f.seed_shuffle = step.seed_shuffle;
    f.shuffle_rem = step.shuffle_rem;
    f.needs_swap = step.needs_swap;
    f.swap_index = step.swap_index;
    f.slot_offset = step.slot_offset;
    f.swap_offset = step.swap_offset;
    f.seed_corner = step.seed_corner;
    f.seed_out = step.seed_out;
    f.next_index = step.next_index;
    f.continue_loop = step.continue_loop;
    f.seed_fatal = step.seed_fatal;
    if (f.seed_fatal != ISAAC_GAME_UPDATE_B15_RAIN_SEED_OK) {
      /* Write ONLY the fatal marker + the step scalars: a whole-struct
         store here lets -O3 sink the later (unreachable-on-fatal) arg
         stores before the branch, so the shipped module would fill the
         args on a fatal step. Field-wise stores keep the early-out real. */
      *out = {};
      out->remaining = f.remaining;
      out->seed_in = f.seed_in;
      out->seed_shuffle = f.seed_shuffle;
      out->shuffle_rem = f.shuffle_rem;
      out->needs_swap = f.needs_swap;
      out->swap_index = f.swap_index;
      out->slot_offset = f.slot_offset;
      out->swap_offset = f.swap_offset;
      out->seed_corner = f.seed_corner;
      out->seed_out = f.seed_out;
      out->next_index = f.next_index;
      out->continue_loop = f.continue_loop;
      out->seed_fatal = f.seed_fatal;
      return;
    }
  }
  /* B1 corners + pick + world xy (room law, by reference). */
  {
    IsaacRoomB1Corners corners = {};
    isaac_room_b1_corner_indices(room_w_c, room_h_10, &corners);
    f.corner_index = isaac_room_b1_corner_pick(&corners, f.seed_corner);
    IsaacRoomB1CornerWorld xy = {};
    isaac_room_b1_corner_world_xy(f.corner_index, room_w_c, &xy);
    f.world_x_bits = __builtin_bit_cast(uint32_t, xy.x);
    f.world_y_bits = __builtin_bit_cast(uint32_t, xy.y);
  }
  /* v55 spawn-site arg provenance (room law, by reference; a3 = search
     result verbatim — never masked). */
  {
    IsaacRoomB15RainSpawnArgs args = {};
    isaac_room_b15_rain_spawn_args(slot_f0, slot_f4, slot_f8, slot_f34,
                                   search_result, &args);
    f.arg_a1 = args.a1;
    f.arg_a2 = args.a2;
    f.arg_a3 = args.a3;
    f.arg_a4 = args.a4;
    f.arg_a5 = args.a5;
    f.arg_a6 = args.a6;
    f.arg_a7 = args.a7;
  }
  *out = f;
}

/* Record wire decide: once-flag gate (0x00802a93 test/jne) -> buffer gate
   (0x00802b50 cmp/je) -> count (0x00802bb1) -> loop walk (0x00802c20..
   0x00802e08). Host counts follow the PE order: the 0x78 swap runs BEFORE
   the pre-corner assert (0x00802c83..0x00802ccb < 0x00802cee), so
   host_swap counts a swap on a pre-corner-fatal iteration while
   host_search/create/bind only count fully-OK iterations. genrand_draws =
   min(host count, GENRAND_MAX_SAMPLES); genrand_mt_advance = draws != 0
   && mt_ready (caller advances the scratch via roomGenrandNext). */
extern "C" void isaac_game_update_slice_b15_rain_wire(
    uint32_t flags_1839c, uint32_t owner_nonzero, uint32_t quality,
    uint32_t begin_183a4, uint32_t end_183a8, uint32_t seed0, int32_t room_w_c,
    int32_t room_h_10, const uint32_t* slot_f0, const uint32_t* slot_f4,
    const uint32_t* slot_f8, const uint32_t* slot_f34,
    const uint32_t* search_results, uint32_t slot_capacity,
    uint32_t genrand_draws, uint32_t genrand_mt_ready,
    IsaacGameUpdateSliceB15RainPlan* out) {
  if (out == nullptr) return;
  IsaacGameUpdateSliceB15RainPlan p = {};
  uint32_t draws = genrand_draws;
  if (draws > static_cast<uint32_t>(ISAAC_GENRAND_MAX_SAMPLES)) {
    draws = static_cast<uint32_t>(ISAAC_GENRAND_MAX_SAMPLES);
  }
  p.genrand_draws = draws;
  p.seed_fatal = ISAAC_GAME_UPDATE_B15_RAIN_SEED_OK;
  if (isaac_room_b1_once_flag_clear(flags_1839c) == 0) {
    /* 0x00802a98 jne 0x802e25: rain spawn skipped when the once-flag is set. */
    *out = p;
    return;
  }
  p.once_flag_apply = 1;
  if (begin_183a4 == end_183a8) {
    /* 0x00802b53 je 0x802e25: empty decor buffer. */
    p.buffer_empty = 1;
    *out = p;
    return;
  }
  const int32_t count = isaac_game_update_slice_b15_rain_spawn_count(
      owner_nonzero, quality, begin_183a4, end_183a8);
  p.spawn_count = count;
  if (count <= 0) {
    /* 0x00802c0a jle 0x802e0d: zero spawn_count exits the loop directly. */
    *out = p;
    return;
  }
  p.loop_enter = 1;
  const uint32_t cap = slot_capacity;
  uint32_t n = static_cast<uint32_t>(count);
  if (n > static_cast<uint32_t>(ISAAC_GAME_UPDATE_B15_RAIN_LOOP_MAX_STEPS)) {
    n = static_cast<uint32_t>(ISAAC_GAME_UPDATE_B15_RAIN_LOOP_MAX_STEPS);
  }
  if (n > cap) n = cap;
  uint32_t seed = seed0;
  for (uint32_t i = 0; i < n; ++i) {
    IsaacGameUpdateSliceB15RainFrame f = {};
    isaac_game_update_slice_b15_rain_frame(
        seed, static_cast<int32_t>(i), count, room_w_c, room_h_10,
        slot_f0 != nullptr ? slot_f0[i] : 0u,
        slot_f4 != nullptr ? slot_f4[i] : 0u,
        slot_f8 != nullptr ? slot_f8[i] : 0u,
        slot_f34 != nullptr ? slot_f34[i] : 0u,
        search_results != nullptr ? search_results[i] : 0u, &f);
    p.steps = static_cast<int32_t>(i) + 1;
    if (f.seed_fatal == ISAAC_GAME_UPDATE_B15_RAIN_SEED_FATAL_PRE_SHUFFLE) {
      p.seed_fatal = ISAAC_GAME_UPDATE_B15_RAIN_SEED_FATAL_PRE_SHUFFLE;
      break;
    }
    if (f.needs_swap != 0) {
      /* The 0x78-byte swap runs BEFORE the pre-corner assert (PE order). */
      p.host_swap += 1;
    }
    if (f.seed_fatal == ISAAC_GAME_UPDATE_B15_RAIN_SEED_FATAL_PRE_CORNER) {
      p.seed_fatal = ISAAC_GAME_UPDATE_B15_RAIN_SEED_FATAL_PRE_CORNER;
      break;
    }
    p.host_search += 1;
    p.host_create += 1;
    p.host_bind += 1;
    seed = f.seed_out;
  }
  p.seed_out = seed;
  if (draws != 0 && genrand_mt_ready != 0) {
    p.genrand_mt_advance = 1;
  }
  *out = p;
}

/* ABI v95 (record idx 3, 0x0092f1c0 gate-1ba78): case-arm pure laws.
   dispatch_case mirrors PE 0x92f1f0..0x92f1fc: mov eax,[ebx]; dec eax;
   cmp eax,3; ja 0x92ff60; jmp [eax*4+0x92ffa4] — FULL-DWORD (u32)(mode-1)>3
   (0x101 / any large high-byte mode is -1, the switch default tail).
   Modes 1 (case 0) and 4 (case 3) are NEVER pure: the Room interior
   0x4186c0 call is UNCONDITIONAL before any eligibility (0x92f231 /
   0x92fee9; 2026-08-15 addendum verified from the instruction stream). */
extern "C" int32_t isaac_game_update_slice_92f1c0_dispatch_case(uint32_t mode) {
  const uint32_t m = mode;
  if ((m - 1u) > 3u) return -1;
  return (int32_t)(m - 1u);
}

/* try_pure proves the pure-tail exits (PE map in the header comment):
   case 1 (mode==2): (u32)counter < (u32)limit (0x92fa0f cmp / 0x92fa11 jb)
   && counter != limit-2 (0x92fd7e..0x92fd83) && (counter != limit-1
   (0x92fe46..0x92fe4b jne -> tail) || (field_14 & 0xff) != 0 (0x92fe51 cmp
   byte / 0x92fe55 jne -> tail)). case 2 (mode==3): (u32)counter < (u32)limit
   (0x92feaa cmp / 0x92fead jb -> tail) && !(counter==2 && (field_14 & 0xff)
   != 0) (0x92fe8b cmp / 0x92fe90 cmp byte -> 0x7eb1b0 host). field_14 is
   the machine's BYTE test — re-narrowed in-body (& 0xff). */
extern "C" int32_t isaac_game_update_slice_92f1c0_try_pure(
    uint32_t mode, uint32_t counter, uint32_t limit, uint32_t field_14) {
  const uint32_t c = counter;
  const uint32_t lim = limit;
  const int32_t dc = isaac_game_update_slice_92f1c0_dispatch_case(mode);
  if (dc < 0) return 1; /* switch default: tail only, zero stores/calls */
  if (dc == 0 || dc == 3) return 0; /* cases 0/3: unconditional 0x4186c0 */
  if (dc == 1) {
    if (c >= lim) return 0;      /* reset arm 0x92fa17 (jb not taken) */
    if (c == lim - 2u) return 0; /* limit-2 arm 0x92fd89 */
    if (c == lim - 1u && (field_14 & 0xffu) == 0u) return 0; /* 0x74f090 arm */
    return 1; /* pure tail: 0x92fe51 jne / 0x92fe4b jne -> 0x92ff60 */
  }
  /* dc == 2 (case 2, mode==3). */
  if (c == 2u && (field_14 & 0xffu) != 0u) return 0; /* 0x7eb1b0 arm 0x92fea2 */
  if (c >= lim) return 0;                            /* 0x746560 arm 0x92feb3 */
  return 1; /* pure tail: 0x92feaa cmp / 0x92fead jb -> 0x92ff60 */
}

/* counter_next mirrors PE 0x92ff60 inc dword ptr [ebx+4] (32-bit wrap). */
extern "C" uint32_t isaac_game_update_slice_92f1c0_counter_next(uint32_t counter) {
  return (uint32_t)((int32_t)counter + 1);
}

/* ABI v116 (record idx 3 case-arm leaves): 0x0074f090 complete predicate
   + 0x007eb1b0 prefix FULL-dword mode gates. Body of 0x7eb1b0 stays
   typed-host. */
extern "C" uint32_t isaac_game_update_slice_74f090_type_ok(uint32_t type) {
  /* PE 0x74f090 mov eax,[ecx]; 0x74f092 dec eax; 0x74f093 cmp eax,5;
     0x74f096 ja 0x74f0b2. UNSIGNED. */
  return ((type - 1u) > 5u) ? 0u : 1u;
}

extern "C" uint32_t isaac_game_update_slice_74f090_flag(uint32_t flags_2654c) {
  /* PE 0x74f0a5 and ecx,0x10000; 0x74f0ab or eax,ecx; 0x74f0ad je. */
  return (flags_2654c & 0x10000u) != 0u ? 1u : 0u;
}

extern "C" uint32_t isaac_game_update_slice_74f090_result(
    uint32_t type, uint32_t flags_2654c) {
  return (isaac_game_update_slice_74f090_type_ok(type) != 0u &&
          isaac_game_update_slice_74f090_flag(flags_2654c) != 0u)
             ? 1u
             : 0u;
}

extern "C" uint32_t isaac_game_update_slice_7eb1b0_mode_2c(uint32_t mode_26584) {
  /* PE 0x7eb1c4 cmp dword [edi+0x26584],0x2c; 0x7eb1d6 jne 0x7eb1f3.
     FULL-dword. Open -> host 0x74f690. */
  return mode_26584 == 0x2cu ? 1u : 0u;
}

extern "C" uint32_t isaac_game_update_slice_7eb1b0_mode_2d(uint32_t mode_26584) {
  /* PE 0x7eb1f8 cmp dword [edi+0x26584],0x2d; 0x7eb202 jne 0x7eb2e0.
     FULL-dword. Open -> GetPlayer/GetGrid/mineshaft interior HOST. */
  return mode_26584 == 0x2du ? 1u : 0u;
}
/* ABI v117 (record idx 3, 0x0074f690 mode-44 stage-type helper): pure
   decision layer; PE map in game_update_slice.h. The single host call
   (GetRoomByIdx 0x740bc0) and the [desc+0x10] validity gate stay bridge. */
extern "C" int32_t isaac_game_update_slice_74f690_entry_plan(
    uint32_t mode_26584, uint32_t room_idx, uint32_t stage_0,
    uint32_t flag_183a0) {
  /* PE 0x74f69c cmp dword [eax+0x26584],0x2c; 0x74f6a3 jne 0x74f6b6
     ([ebx+4] arm). FULL-dword. */
  if (mode_26584 != 0x2cu) return 0; /* PLAN_TYPE4 */
  /* PE 0x74f6a5 mov esi,[ebp+8]; 0x74f6a8 cmp esi,-0xa; 0x74f6ab jne. */
  if (static_cast<int32_t>(room_idx) == -10) {
    /* PE 0x74f6ad cmp dword [ebx],7 (FULL-dword); je 0x74f7b1 (mov eax,4)
       else fallthrough 0x74f6b6 ([ebx+4]). */
    return stage_0 == 7u ? 1 : 0; /* PLAN_CONST4 : PLAN_TYPE4 */
  }
  /* PE 0x74f6bf test esi,esi; 0x74f6c1 js 0x74f6b6. SIGNED. */
  if (static_cast<int32_t>(room_idx) < 0) return 0; /* PLAN_TYPE4 */
  /* PE 0x74f6c3 cmp BYTE [ebx+0x183a0],0; 0x74f6ca jne 0x74f6f0 (dispatch,
     no host call). Byte test — re-narrowed in-body. */
  if ((flag_183a0 & 0xffu) != 0u) return 3; /* PLAN_STAGE */
  return 2; /* PLAN_GETROOM: host 0x740bc0 push -1, room_idx @0x74f6cc..cf */
}

extern "C" uint32_t isaac_game_update_slice_74f690_clamp_desc_dword0(
    uint32_t desc_dword0) {
  /* PE 0x74f6da mov eax,[eax] (desc dword0); 0x74f6dc xor ecx,ecx;
     0x74f6de test eax,eax; 0x74f6e0 mov esi,0xa8; 0x74f6e5 cmovle eax,ecx;
     0x74f6e8 cmp eax,esi; 0x74f6ea cmovl esi,eax; 0x74f6ed mov [ebp+8],esi.
     SIGNED both folds. */
  const int32_t v = static_cast<int32_t>(desc_dword0);
  if (v <= 0) return 0u;
  if (v >= 0xa8) return 0xa8u;
  return desc_dword0;
}

extern "C" int32_t isaac_game_update_slice_74f690_grid_dist(
    uint32_t slot_field, uint32_t room_idx_final) {
  /* PE 0x74f76b mov ecx,[eax+ebx+0x14] (slot_field); q = SIGNED / 13 via
     magic 0x4ec4ec4f imul + sar 2 + shr 31 sign fix (0x74f76b..0x74f78b)
     on slot_field and room_idx (esi); 0x74f78d..0x74f799 eax =
     13*(q2-q1) - room_idx + slot_field = r1 - r2; cdq/xor/sub absolute
     values; 0x74f7a9 add ecx,eax = |r1-r2| + |q1-q2|. */
  const int32_t s = static_cast<int32_t>(slot_field);
  const int32_t r = static_cast<int32_t>(room_idx_final);
  const int32_t q1 = s / 13;
  const int32_t q2 = r / 13;
  const int32_t dr = (s % 13) - (r % 13);
  const int32_t dq = q1 - q2;
  return (dr < 0 ? -dr : dr) + (dq < 0 ? -dq : dq);
}

extern "C" int32_t isaac_game_update_slice_74f690_stage_route(
    uint32_t stage_after, uint32_t room_idx_final, uint32_t slot_field) {
  /* PE 0x74f6f0 mov eax,[ebx] — stage RE-READ after the host call;
     0x74f6f2 cmp eax,6; 0x74f6f5 jg 0x74f74e. SIGNED: stage 0xffffffff
     (-1) routes the lo table, an unsigned compare would NOT. */
  const int32_t s = static_cast<int32_t>(stage_after);
  if (s <= 6) return 0; /* ROUTE_TABLE_LO (0x74f6f7..0x74f74b) */
  /* PE 0x74f74e cmp eax,7 je 0x74f75c; 0x74f753 cmp eax,8;
     0x74f756 jne 0x74f6b6 ([ebx+4]). FULL-dword equalities. */
  if (s == 7 || s == 8) {
    /* PE 0x74f7ac cmp ecx,3; 0x74f7af jg 0x74f7bc (hi table) else
       0x74f7b1 mov eax,4. SIGNED jg. */
    return isaac_game_update_slice_74f690_grid_dist(slot_field,
                                                    room_idx_final) > 3
               ? 2  /* ROUTE_WOMB_FAR_HI */
               : 1; /* ROUTE_WOMB_NEAR_RET4 */
  }
  return 3; /* ROUTE_TYPE4 */
}

/* f32 lane: bits -> f32, PE 0x74f703 mulss [0xbaa784] (=5.0f), 0x74f70b
   maxss xmm2 (0.0; NaN folds to 0 like MAXSS src2), 0x74f70f minss
   [0xbaa780] (=4.999f), 0x74f717 cvttss2si (trunc toward 0). */
union IsaacGameUpdateSlice74f690F32 {
  uint32_t u;
  float f;
};
static int32_t isaac_game_update_slice_74f690_f32_lane(uint32_t bits) {
  IsaacGameUpdateSlice74f690F32 cv;
  cv.u = bits;
  float v = cv.f * 5.0f;
  if (!(v > 0.0f)) v = 0.0f;
  if (v > 4.999f) v = 4.999f;
  return static_cast<int32_t>(v);
}

extern "C" uint32_t isaac_game_update_slice_74f690_table_type(
    uint32_t table_sel, uint32_t fa_bits, uint32_t fb_bits) {
  /* PE 0x74f6f7 movss [ebx+esi*4+0x183b0] / 0x74f7c3 [ebx+ecx*4+0x183b0]
     (fa), 0x74f71b / 0x74f7e4 (+0x18654) (fb); 0x74f72e lea eax,[eax+eax*4]
     + 0x74f741 add = a*5+c; 0x74f743 mov eax,[eax*4+0xb6a878] (lo) /
     0x74f80b +0xb6a8e0 (hi). Tables hash-bound from the binary. */
  static const uint32_t kTableLo[25] = {0, 0, 0, 2, 2, 0, 0, 2, 2, 2, 0, 1, 0,
                                        2, 4, 1, 1, 1, 4, 5, 1, 1, 4, 5, 5};
  static const uint32_t kTableHi[25] = {0, 0, 0, 0, 2, 0, 0, 0, 2, 2, 0, 0, 0,
                                        2, 2, 0, 1, 1, 1, 2, 1, 1, 1, 1, 2};
  const int32_t idx = isaac_game_update_slice_74f690_f32_lane(fa_bits) * 5 +
                      isaac_game_update_slice_74f690_f32_lane(fb_bits);
  return (table_sel == 0u ? kTableLo : kTableHi)[idx];
}

/* ABI v95 (record idx 4, 0x008318a0 mode-1/3/4 host bodies): pure decision
   layers. Evidence: cpu-dump/008318a0.txt + 00831900.txt + 008320c6.txt +
   00832290.txt + 0083243b.txt + 008327b0.txt; jump table 0x8327bc raw
   bytes 15 19 83 00 a1 1f 83 00 c6 20 83 00 3b 24 83 00 = {0x831915,
   0x831fa1, 0x8320c6, 0x83243b}. The bodies stay typed-host (0x4186c0 +
   ANM2 pair 0x409100/0x409030 + per-player walks); these laws publish the
   dispatch selection, arg prep and byte/full-word gates. */

/* body_case mirrors PE 0x831902 mov eax,[ebx] (mode); 0x831904 dec eax;
   0x831905 cmp eax,3; 0x831908 ja 0x8326a1 (SEH epilogue, zero Game
   stores); 0x83190e jmp [eax*4+0x8327bc]. FULL-DWORD (u32)(mode-1) > 3
   folds to 0 (0x101 / any large high-byte mode is case 0, NOT 1..4). */
extern "C" int32_t isaac_game_update_slice_8318a0_body_case(uint32_t mode) {
  const uint32_t m = mode;
  if ((m - 1u) > 3u) return 0;
  return (int32_t)(m - 1u) + 1; /* 1..4 */
}

/* mode3_advance_signed mirrors PE 0x8320c6 mov eax,[ebx+4] (counter);
   0x8320c9 cmp eax,[ebx+8] (limit); 0x8320cc jl 0x8320bd — SIGNED
   (int32)counter < (int32)limit: the mode-3 head jumps to the shared
   advance 0x8320bd (inc eax; mov [ebx+4],eax; jmp 0x832663 common tail)
   with ZERO host calls. WIDE counter 0xffffffff (=-1) with limit 1 MUST
   advance (signed jl), and counter 0x80000000 with limit 0x7fffffff MUST
   advance too — an unsigned compare would diverge on both. */
extern "C" int32_t isaac_game_update_slice_8318a0_mode3_advance_signed(
    uint32_t counter, uint32_t limit) {
  return static_cast<int32_t>(counter) < static_cast<int32_t>(limit) ? 1 : 0;
}

/* mode4_sfx_gate mirrors PE 0x83243b cmp [ebx+0x1c],3 / jne 0x832488 and
   0x832441 cmp [ebx+4],8 / jne 0x832488 — BOTH FULL-DWORD equality:
   type_1c==3 && counter==8 opens the pre-0x4186c0 SFX prep (0x956780 +
   0x92dc30 with arg 0xd6 = [ebp-0x50]). 0x103 / 0x1008 / 0x1000003 must
   NOT open the gate (full-word, not low-byte). */
extern "C" int32_t isaac_game_update_slice_8318a0_mode4_sfx_gate(
    uint32_t type_1c, uint32_t counter) {
  return (type_1c == 3u && counter == 8u) ? 1 : 0;
}

/* 4186c0 arg prep constants: push 1 at 0x83191a (mode-1), 0x832368
   (mode-3 default), 0x8323da (mode-3 0xb/0x10/0x11/0x13), 0x832490
   (mode-4); receiver = [0xc71678]+0x18300+0x1218 on every call. */
extern "C" uint32_t isaac_game_update_slice_8318a0_4186c0_arg(void) {
  return 1u;
}
extern "C" uint32_t isaac_game_update_slice_8318a0_4186c0_receiver_offset(void) {
  return 0x18300u + 0x1218u; /* 0x19518 */
}

/* mode1_slot_gate mirrors PE 0x83195a cmp [ebx+0x1c],0x13 / 0x83195d jne
   0x83199b — FULL-WORD equality: the 8-slot virtual loop (0x831970,
   slots 0x724..0x744 of Game+0x18300, [eax+8] dispatch per slot) runs.
   0x113 / 0x10000013 must NOT run it. */
extern "C" int32_t isaac_game_update_slice_8318a0_mode1_slot_gate(
    uint32_t type_1c) {
  return type_1c == 0x13u ? 1 : 0;
}

/* ABI v96 (record idx 4, 0x008318a0 modes 1/2/4 decision laws): the
   mode-1 SFX-manager block + tail, mode-2 gates + 0x418 fold, mode-4
   per-player gates and the blob-gated walk arm. Evidence:
   disasm-8318a0-full.txt (clean single-span 0x8318a0..0x8327d0; extent
   0x8318a0..0x8327bb, int3 pad 0x8327dc, next fn 0x8327e0). The SFX
   manager object base is 0xc798e0 (.data BSS — file-backed .data ends VA
   0xc61800, so the manager and the [0xc7169c] pointer are OUTSIDE
   BINARY_LAYOUT; no capture lanes this wave — §lane-requests ABI 96). */

/* mode1_manager_block_gate mirrors PE 0x831c64..0x831e31: the mode-1 tail
   reaches the SFX-manager block 0x831e31 iff
   (candidate_found != 0 || type == 0x15) && type != 0x13 &&
   !(type == 0xb || type == 0x10) && field_14 != 0x18304
   — candidate_found is the [ebp-0x41] polarity (byte flag set 1 at
   0x83191c, cleared at 0x831ae4 on the walk score path; host-resolved).
   type compares are FULL-DWORD (0x831c75 cmp ecx,0x13 / 0x831d6c cmp
   ecx,0xb / 0x831d71 cmp ecx,0x10), field_14 compare FULL-DWORD
   (0x831d7f cmp [ebx+0x14],[Game+0x18304]). 0xb/0x10 with
   field_14 == Game+0x18304 takes the clear+reset arm (0x831d76..0x831dc1)
   instead. */
extern "C" int32_t isaac_game_update_slice_8318a0_mode1_manager_block_gate(
    uint32_t candidate_found, uint32_t type_1c, uint32_t field_14) {
  if (candidate_found == 0u && type_1c != 0x15u) return 0;
  if (type_1c == 0x13u) return 0;
  if ((type_1c == 0xbu || type_1c == 0x10u) && field_14 == 0x18304u) return 0;
  return 1;
}

/* mode1_clear_walk_gate mirrors PE 0x831dc6..0x831dea: the per-player
   [ecx+0x171]=0 walk at 0x831dec runs iff field_10 != -1 (FULL-DWORD cmp
   dword [ebx+0x10],0xffffffff — 0xffff00ff must NOT match) || type in
   {3,0xc,0xd,0xb,0x10} (0x831dd3..0x831dea); else the block enters
   0x831e31 directly. */
extern "C" int32_t isaac_game_update_slice_8318a0_mode1_clear_walk_gate(
    uint32_t field_10, uint32_t type_1c) {
  if (field_10 != 0xffffffffu) return 1;
  return (type_1c == 3u || type_1c == 0xcu || type_1c == 0xdu ||
          type_1c == 0xbu || type_1c == 0x10u)
             ? 1
             : 0;
}

/* mode1_player_171_store mirrors PE 0x831e09..0x831e1f: the store
   [ecx+0x171]=0 fires iff NOT ((type==0 || type==2) && field_10 != -1 &&
   player == saved_1bb74). saved_1bb74 = [Game+0x1bb74] (state
   engine_player_1bb74; 0 on the update path). FULL-DWORD compares
   (0x831e15 cmp dword [ebx+0x10],-1 / 0x831e1b cmp ecx,esi). */
extern "C" int32_t isaac_game_update_slice_8318a0_mode1_player_171_store(
    uint32_t type_1c, uint32_t field_10, uint32_t player,
    uint32_t saved_1bb74) {
  if ((type_1c == 0u || type_1c == 2u) && field_10 != 0xffffffffu &&
      player == saved_1bb74) {
    return 0;
  }
  return 1;
}

/* Typed SFX-manager store plan (record idx 4, mode-1 block
   0x831e31..0x831f34): 9 stores, program order. element==1 -> target is
   the queue node at the 0x684f30() return (mgr_off is node-relative);
   element==0 -> mgr-relative absolute BSS offset. Value laws:
   0x831e61 dword [0xc798e4]>>5 &1; 0x831e6f [0xc79948]; 0x831ea0 0;
   0x831e8f byte [0xc798e4]&4 == 0 ? 6 : 1 (cmove, test byte); 0x831ead 7;
   0x831ec2 1; 0x831ecc 7; 0x831f1b [0xc79790]-=1 (32-bit wrap, sub AFTER
   the log-check join 0x831f05); 0x831f2f [0xc7978c] = (new79790 == 0) ? 0
   : old (cmove from the sub flags). Width split on [0xc798e4]: BYTE &4 vs
   DWORD >>5 — a low-byte-only model diverges. Struct + count constant come
   from the header (extern "C" linkage). */
extern "C" uint32_t isaac_game_update_slice_8318a0_sfx_manager_store_plan(
    uint32_t global_798e4, uint32_t global_79790, uint32_t global_7978c,
    uint32_t global_79948, IsaacGameUpdateSlice8318a0SfxManagerStore* out) {
  if (out == nullptr) return ISAAC_GAME_UPDATE_SLICE_8318A0_SFX_MANAGER_STORES;
  const uint32_t new_79790 = global_79790 - 1u; /* 32-bit wrap */
  /* Row encodings (v99 fold correction; PE 0x831e53..0x831f2f):
     row0 = byte queue-node slot node+4 (0x831e5a lea edx,[esi+4]; the
     node-relative offset is 4, NOT 0); row7 = 0xc79790 = mgr-0x150 ->
     0xfffffeb0 (NOT 0xffffff50 = -0xb0); row8 = 0xc7978c = mgr-0x154 ->
     0xfffffeac (NOT 0xffffffac = -0x54). Values (bit5/79948/cmove/sub-1)
     were already exact. */
  out[0] = (IsaacGameUpdateSlice8318a0SfxManagerStore){0x4u, 1u,
      (global_798e4 >> 5) & 1u, 1u};
  out[1] = (IsaacGameUpdateSlice8318a0SfxManagerStore){0x0u, 4u,
      global_79948, 1u};
  out[2] = (IsaacGameUpdateSlice8318a0SfxManagerStore){0x20u, 4u, 0u, 0u};
  out[3] = (IsaacGameUpdateSlice8318a0SfxManagerStore){0x24u, 4u,
      ((global_798e4 & 4u) == 0u) ? 6u : 1u, 0u};
  out[4] = (IsaacGameUpdateSlice8318a0SfxManagerStore){0x28u, 4u, 7u, 0u};
  out[5] = (IsaacGameUpdateSlice8318a0SfxManagerStore){0x2cu, 4u, 1u, 0u};
  out[6] = (IsaacGameUpdateSlice8318a0SfxManagerStore){0x30u, 4u, 7u, 0u};
  out[7] = (IsaacGameUpdateSlice8318a0SfxManagerStore){0xfffffeb0u, 4u,
      new_79790, 0u};
  out[8] = (IsaacGameUpdateSlice8318a0SfxManagerStore){0xfffffeacu, 4u,
      (new_79790 == 0u) ? 0u : global_7978c, 0u};
  return ISAAC_GAME_UPDATE_SLICE_8318A0_SFX_MANAGER_STORES;
}

/* ABI v102 (record idx 4, store-plan APPLICATION arm): the typed per-row
   apply plan law. Fills out->store_mask = 0x1ff (the 9 store sites of the
   mode-1 manager block — the module's application decision when the gate
   opens; row 0's PE guard @0x831e5d node+4 != 0 is a HOST-apply
   condition on the element=1 rows) and out->rows = the 9
   sfx_manager_store_plan rows (v96 §3d BY REFERENCE, program order).
   Returns the row count. out == nullptr -> count constant, nothing
   written (plan-request pattern). */
extern "C" uint32_t isaac_game_update_slice_8318a0_sfx_manager_store_apply_plan(
    uint32_t global_798e4, uint32_t global_79790, uint32_t global_7978c,
    uint32_t global_79948, IsaacGameUpdateSlice8318a0SfxManagerStoreApplyPlan* out) {
  if (out == nullptr) return ISAAC_GAME_UPDATE_SLICE_8318A0_SFX_MANAGER_STORES;
  out->store_mask = ISAAC_GAME_UPDATE_SLICE_8318A0_SFX_MANAGER_STORE_MASK;
  return isaac_game_update_slice_8318a0_sfx_manager_store_plan(
      global_798e4, global_79790, global_7978c, global_79948, out->rows);
}
/* ABI v142 (record idx4, rt_band_pop typed carrier; evidence
   contracts-idx4-engine-band NOTES §1/§4/§5): the PURE derivation of the
   mode-1 store block's stateful band deltas over the already-captured sfx
   globals — zero new capture roots, receiver-pointer decision NOT amended.
   depth_after mirrors PE 0x831f1b sub dword [0xc79790],1 (32-bit wrap; the
   underflow log-check @0x831eed only gates the fatal 0xa112c0 call, the
   sub itself is unconditional on the block path). latch_after mirrors
   PE 0x831f27/2f (cmove from the sub flags: [0xc7978c]=0 iff the new
   depth==0, else the pre value is kept). params[5] fold the five constant
   param stores purely: 0xc79900=0 (@0x831ea0), 0xc79904 = byte
   [0xc798e4]&4==0 ? 6 : 1 (@0x831e8f test byte / @0x831eaa cmove,
   store @0x831ebd), 0xc79908=7 (@0x831ead), 0xc7990c=1 (@0x831ec2),
   0xc79910=7 (@0x831ecc). The four opaque thiscall leaves on *0xc798e0
   (0xa18300 x2, 0xa18230, 0xa19180) stay HOST actions — no whole-object
   ABI. Theorem arms (both mirrors): capture-live -> the deltas RETIRE onto
   the typed carrier lanes (events opaque_008318a0_rt_band_pop_*, @932 and
   the v102 apply-plan scratch unchanged); capture absent -> byte-for-byte
   pre-v142 residual keeps (all four lanes stay 0). Returns the param
   count; out == nullptr -> count constant, nothing written. */
extern "C" uint32_t isaac_game_update_slice_8318a0_rt_band_pop(
    uint32_t global_798e4, uint32_t global_79790, uint32_t global_7978c,
    IsaacGameUpdateSlice8318a0RtBandPop* out) {
  if (out == nullptr) return ISAAC_GAME_UPDATE_SLICE_8318A0_RT_BAND_POP_PARAMS;
  const uint32_t depth_after = global_79790 - 1u; /* 32-bit wrap */
  out->depth_after = depth_after;
  out->latch_after = (depth_after == 0u) ? 0u : global_7978c;
  out->params[0] = 0u;
  out->params[1] = ((global_798e4 & 4u) == 0u) ? 6u : 1u;
  out->params[2] = 7u;
  out->params[3] = 1u;
  out->params[4] = 7u;
  return ISAAC_GAME_UPDATE_SLICE_8318A0_RT_BAND_POP_PARAMS;
}

/* ABI v99 (record idx 4, 0x008318a0 mode-1 walk fold): the per-player
   entry writes now foldable onto the committed pack rows — NEW laws
   (byte-gate u32 + &0xff; NO uint8_t params), land the PE
   0x8319b2..0x831b0d walk-arm + 0x831c75..0x831e31 block write semantics
   the v98 candidate_found derivation consumes. */

/* mode1_walk_entry_zero_arm mirrors PE 0x831a19..0x831a59: iff
   type_1c==0 (0x831a19 cmp dword [ebx+0x1c],0 / jne 0x831a2d; FULL-DWORD)
   && the entry reached the score block (b173 byte clear 0x8319bc, byte
   (b1398|b139a)!=0 0x8319d1/0x8319da, ptr7c==0 || byte34==0 0x8319e6/
   0x8319ea), the machine stores BYTE 0 to [e+0x1398] AND [e+0x139a]
   (0x831a1f/0x831a26 then 0x831a53/0x831a59 with al==0). These 4 writes
   fold onto pack rows b1398[i]/b139a[i]. The same zeroing makes the
   0x831a95 re-check exit at 0x831af8: the flag [ebp-0x41] is NEVER
   cleared for type==0 — the candidate_found clearing law needs the
   type_1c != 0 term (BY REFERENCE here). */
extern "C" int32_t isaac_game_update_slice_8318a0_mode1_walk_entry_zero_arm(
    uint32_t type_1c, uint32_t b173, uint32_t b1398, uint32_t b139a,
    uint32_t ptr7c, uint32_t b34) {
  if (type_1c != 0u) return 0;
  if ((b173 & 0xffu) != 0u) return 0;
  if ((b1398 & 0xffu) == 0u && (b139a & 0xffu) == 0u) return 0;
  if (ptr7c != 0u && (b34 & 0xffu) != 0u) return 0;
  return 1;
}

/* mode1_walk_entry_171_zero mirrors PE 0x831a95..0x831af8: on a
   score-block entry the [e+0x171]=0 store fires iff post-write
   (b1398==0 && b139a==0) || w3fc==4 — for type==0 the zero-arm makes the
   byte pair zero; for type!=0 the w3fc compare is FULL-DWORD (0x831aa7
   cmp dword [edi+0x3fc],4). Folds onto pack row b171[i]. (The 0x831a8e
   type-0x13 probe arm stays host — 0x40add0 name compare.) */
extern "C" int32_t isaac_game_update_slice_8318a0_mode1_walk_entry_171_zero(
    uint32_t type_1c, uint32_t b173, uint32_t b1398, uint32_t b139a,
    uint32_t ptr7c, uint32_t b34, uint32_t w3fc) {
  if (isaac_game_update_slice_8318a0_mode1_walk_entry_zero_arm(
          type_1c, b173, b1398, b139a, ptr7c, b34) != 0) {
    return 1;
  }
  if (type_1c == 0u) return 0;
  if ((b173 & 0xffu) != 0u) return 0;
  if ((b1398 & 0xffu) == 0u && (b139a & 0xffu) == 0u) return 0;
  if (ptr7c != 0u && (b34 & 0xffu) != 0u) return 0;
  return w3fc == 4u ? 1 : 0;
}

/* mode1_reset_span_clear_writes mirrors PE 0x831d6c..0x831db4: iff
   type_1c==0xb || type_1c==0x10 (FULL-DWORD 0x831d6f/0x831d71) &&
   field_14 == 0x18304 (the v96 FULL-DWORD constant compare of 0x831d7f
   cmp eax,[Game+0x18304] — mode1_manager_block_gate's reset arm BY
   REFERENCE), the span loop 0x831d87..0x831db2 stores BYTE 0 to
   [e+0x171] (0x831d9b) and BYTE 1 to [e+0x410] (0x831da2) on EVERY
   non-null slot. Folds onto pack rows b171[i]/w410[i] (constant
   writes). */
extern "C" int32_t isaac_game_update_slice_8318a0_mode1_reset_span_clear_writes(
    uint32_t type_1c, uint32_t field_14) {
  if (type_1c != 0xbu && type_1c != 0x10u) return 0;
  return field_14 == 0x18304u ? 1 : 0;
}

/* mode1_tail_mode_set mirrors PE 0x831f34..0x831f81: [ebx] = 3 iff
   (type not in {1,2,0xb,0xf,0x10,0x11,0x12,0x13,0x14,0x15}) &&
   field_10 != -1; else [ebx] = 2. FULL-DWORD compares (cmp eax,imm). */
extern "C" int32_t isaac_game_update_slice_8318a0_mode1_tail_mode_set(
    uint32_t type_1c, uint32_t field_10) {
  if (type_1c == 1u || type_1c == 2u || type_1c == 0xbu ||
      type_1c == 0xfu || type_1c == 0x10u || type_1c == 0x11u ||
      type_1c == 0x12u || type_1c == 0x13u || type_1c == 0x14u ||
      type_1c == 0x15u) {
    return 2;
  }
  return (field_10 != 0xffffffffu) ? 3 : 2;
}

/* mode1_tail_830950_call mirrors PE 0x831f71 + 0x831f87..0x831f97: the
   0x830950 call fires iff mode_set==3 (default arm) || type in {0xf,0x15}
   (the =2 arm). */
extern "C" int32_t isaac_game_update_slice_8318a0_mode1_tail_830950_call(
    uint32_t type_1c, uint32_t field_10) {
  if (isaac_game_update_slice_8318a0_mode1_tail_mode_set(type_1c, field_10) ==
      3) {
    return 1;
  }
  return (type_1c == 0xfu || type_1c == 0x15u) ? 1 : 0;
}

/* Mode-2 laws (body 0x831fa1..0x8320c1). */
extern "C" int32_t isaac_game_update_slice_8318a0_mode2_lane_gate(
    uint32_t predicate_238) {
  /* PE 0x831fa1 cmp dword [ebx+0x238],0 / je 0x83209c — FULL-DWORD. */
  return predicate_238 != 0u ? 1 : 0;
}
extern "C" int32_t isaac_game_update_slice_8318a0_mode2_direct_tail_gate(
    uint32_t vec_begin, uint32_t byte_7c) {
  /* PE 0x832024 cmp dword [ebx+0x6c],0 / je 0x832034 + 0x83202a cmp byte
     [ebx+0x7c],0 / jne 0x832663: direct tail (skip 0x7eb1b0) iff
     vec_begin != 0 (FULL-DWORD; [ebx+0x6c] = Game+0x1baa8 = the SAME
     captured walk span begin) && byte_7c != 0. */
  return (vec_begin != 0u && byte_7c != 0u) ? 1 : 0;
}
extern "C" int32_t isaac_game_update_slice_8318a0_mode2_fast_reset(
    uint32_t counter, uint32_t limit) {
  /* PE 0x83209c mov eax,[ebx+4] / 0x83209f cmp eax,[ebx+8] / 0x8320a2 jl
     0x8320bd — SIGNED, SAME shared-advance law as mode 3. 1 = advance
     ([ebx+4]++ + tail); 0 = reset ([ebx+4]=0, [ebx]=3, call 0x830950). */
  return static_cast<int32_t>(counter) < static_cast<int32_t>(limit) ? 1 : 0;
}
extern "C" int32_t isaac_game_update_slice_8318a0_mode2_player_418_next(
    uint32_t cur_418) {
  /* PE 0x832076 mov edx,[esi+0x418]; mov ecx,0xa; cmp edx,ecx; cmovg
     ecx,edx — SIGNED max: cur > 0xa ? cur : 0xa. WIDE cur 0xffffffff (=-1)
     -> 0xa; an unsigned cmovae diverges. */
  return static_cast<int32_t>(cur_418) > 0xa ? (int32_t)cur_418 : 0xa;
}

/* Mode-4 laws (body 0x83243b..0x832663). */
extern "C" int32_t isaac_game_update_slice_8318a0_mode4_walk_call_gate(
    uint32_t byte_1398, uint32_t byte_139a, uint32_t ptr_7c,
    uint32_t byte_34) {
  /* PE 0x8324ce cmp byte [edi+0x1398],0 / jne 0x8324e4; 0x8324d7 cmp byte
     [edi+0x139a],0 / je 0x8325f9 (skip); 0x8324e4..0x8324f4 ptr_7c==0 ->
     al=0, else al=byte[ptr+0x34]; test al,al / jne skip. BYTE compares on
     0x1398/0x139a and [ptr+0x34]. */
  if ((byte_1398 & 0xffu) == 0u && (byte_139a & 0xffu) == 0u) return 0;
  if (ptr_7c != 0u && (byte_34 & 0xffu) != 0u) return 0;
  return 1;
}
extern "C" int32_t isaac_game_update_slice_8318a0_mode4_name_string_gate(
    uint32_t byte_1398, uint32_t byte_139a) {
  /* PE 0x832539 cmp byte [edi+0x1398],0 / jne 0x8326bd + 0x83254f cmp byte
     [edi+0x139a],0 / jne 0x8326bd — BYTE gates (0x100 must NOT enter the
     name-compare block). */
  return ((byte_1398 & 0xffu) != 0u || (byte_139a & 0xffu) != 0u) ? 1 : 0;
}
extern "C" int32_t isaac_game_update_slice_8318a0_mode4_final_reset_gate(
    uint32_t last_leave) {
  /* PE 0x83260d test cl,cl / je 0x832663 — the LOW BYTE of the accumulated
     value (the [ebp-0x50] domain is {0,1}: cmove from movzx byte
     0x8325aa..0x8325c0). 0x100 must NOT run the reset. */
  return (last_leave & 0xffu) != 0u ? 1 : 0;
}

/* Blob-gated pure arm (v92 precedent BY REFERENCE): the record-4 player
   walks iterate the SAME Game+0x1baa8/+0x1baac span the v92
   frame_opaque_98dba0_walk capture covers. count==0 -> every record-4 walk
   loop (mode-1 0x8319b2..0x831b16 + 0x831dec..0x831e31 + 0x832393/0x832405
   arms; mode-2 0x83205e..0x832097; mode-3 0x83210f..0x83214f + 0x832393/
   0x832405; mode-4 0x8324be..0x832607 + 0x832624..0x832661) is a
   PROOF-COMPLETE pure skip (zero per-player stores, zero per-player calls).
   Never restates the SAR math — forwards to
   isaac_game_update_slice_98dba0_walk_pure_skip. */
extern "C" int32_t isaac_game_update_slice_8318a0_walk_pure_skip(
    uint32_t begin, uint32_t end) {
  return isaac_game_update_slice_98dba0_walk_pure_skip(begin, end);
}

/* ABI v99 exports-only (idx 4, update-v118-8318a0-leftovers). Transcribed
   from the instruction stream — do NOT derive from the JS oracle. */

extern "C" int32_t isaac_game_update_slice_8318a0_pickup_latch(
    uint32_t ptr_234, uint32_t type_28, uint32_t variant_2c) {
  /* PE 0x8318eb test eax,eax / je 0x831902; 0x8318ef cmp [eax+0x28],0x3c5
     / jne; 0x8318f8 cmp [eax+0x2c],0xa / cmove ecx,eax. FULL-DWORD. Twin
     re-check at 0x831c84..0x831c9d. 0x103c5 / 0x10a must NOT latch. */
  if (ptr_234 == 0u) return 0;
  return (type_28 == 0x3c5u && variant_2c == 0xau) ? 1 : 0;
}

extern "C" int32_t isaac_game_update_slice_8318a0_mode1_score_block_gate(
    uint32_t type_1c, uint32_t player, uint32_t candidate, uint32_t score) {
  /* PE 0x831b16 cmp ecx,0xb / je; 0x831b1b cmp 0x10 / je; 0x831b20 cmp 0x13
     / jne 0x831c64; 0x831b2c test esi,esi / je; 0x831b37 test edi,edi / je;
     0x831b3f cmp [ebp-0x5c],6 / jl skip — SIGNED score>=6. Hit 0x452bf0 +
     0x7abe20 stay typed-host. */
  if (type_1c != 0xbu && type_1c != 0x10u && type_1c != 0x13u) return 0;
  if (player == 0u) return 0;
  if (candidate == 0u) return 0;
  return static_cast<int32_t>(score) >= 6 ? 1 : 0;
}

extern "C" int32_t isaac_game_update_slice_8318a0_mode1_type13_pickup_gate(
    uint32_t type_1c, uint32_t ptr_234, uint32_t type_28, uint32_t variant_2c) {
  /* PE 0x831c75 cmp ecx,0x13 / jne 0x831d6c then the 0x3c5/0xa re-check.
     FULL-DWORD. Hit 0x812c90 + 0x4ce0f0 stay typed-host. */
  if (type_1c != 0x13u) return 0;
  return isaac_game_update_slice_8318a0_pickup_latch(ptr_234, type_28,
                                                     variant_2c);
}

extern "C" int32_t isaac_game_update_slice_8318a0_mode1_type13_b64_exit(
    uint32_t field_b64) {
  /* PE 0x831ca6 cmp dword [edi+0xb64],4 / je 0x832663. FULL-DWORD. */
  return (field_b64 == 4u) ? 1 : 0;
}

extern "C" uint32_t isaac_game_update_slice_8318a0_mode1_4ce0f0_esi_remap(
    uint32_t ret, uint32_t type_1c) {
  /* PE 0x831ceb add eax,-7; 0x831cee cmp eax,3; 0x831cf1 ja 0x831d0a
     (UNSIGNED); jmp table 0x8327cc {2, 0, 3, lea ecx-0x12}. Recapture of
     0x4ce0f0 — never fold pre-call. 32-bit wrap. */
  const uint32_t a = ret - 7u;
  if (a > 3u) return type_1c - 0x12u;
  if (a == 0u) return 2u;
  if (a == 1u) return 0u;
  if (a == 2u) return 3u;
  return type_1c - 0x12u;
}

extern "C" int32_t isaac_game_update_slice_8318a0_mode3_membership_hit(
    uint32_t al) {
  /* PE 0x8320ed test al,al / je 0x8321ae. LOW BYTE of 0x82eb90 recapture.
     0x100 must NOT take the true walk. */
  return ((al & 0xffu) != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_game_update_slice_8318a0_mode3_flag_2000000_skip(
    uint32_t flags_16c) {
  /* PE 0x832130 and ecx,0x2000000; or eax,ecx; jne skip 0x171 store.
     FULL-DWORD bit. 0x20 must NOT skip. */
  return ((flags_16c & 0x2000000u) != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_game_update_slice_8318a0_mode3_type3_string_gate(
    uint32_t type_1c) {
  /* PE 0x832116 cmp dword [ebx+0x1c],3 / jne skip 0x7abe20. FULL-DWORD. */
  return (type_1c == 3u) ? 1 : 0;
}

extern "C" uint32_t isaac_game_update_slice_8318a0_mode3_miss_arm(
    uint32_t type_1c) {
  /* PE 0x8321ae..0x83235d cascade after 82eb90 AL==0. FULL-DWORD cmps. */
  if (type_1c == 5u || type_1c == 6u || type_1c == 8u || type_1c == 9u ||
      type_1c == 0xau) {
    return (uint32_t)ISAAC_GAME_UPDATE_8318A0_MODE3_ARM_ANIM;
  }
  if (type_1c == 7u) {
    return (uint32_t)ISAAC_GAME_UPDATE_8318A0_MODE3_ARM_SFX_ANIM;
  }
  if (type_1c == 0xeu) {
    return (uint32_t)ISAAC_GAME_UPDATE_8318A0_MODE3_ARM_ANIM2;
  }
  if (type_1c == 1u || type_1c == 2u || type_1c == 0x12u || type_1c == 0x14u) {
    return (uint32_t)ISAAC_GAME_UPDATE_8318A0_MODE3_ARM_SET4;
  }
  if (type_1c == 0xbu || type_1c == 0x10u || type_1c == 0x11u ||
      type_1c == 0x13u) {
    return (uint32_t)ISAAC_GAME_UPDATE_8318A0_MODE3_ARM_WALK_410_ALWAYS;
  }
  return (uint32_t)ISAAC_GAME_UPDATE_8318A0_MODE3_ARM_WALK_410_COND;
}

extern "C" uint32_t isaac_game_update_slice_8318a0_mode3_true_arm(
    uint32_t type_1c) {
  /* PE 0x832154 cmp 0xc / 0x832181 cmp 0xd else 0x8321d0 [ebx]=4. */
  if (type_1c == 0xcu || type_1c == 0xdu) {
    return (uint32_t)ISAAC_GAME_UPDATE_8318A0_MODE3_ARM_ANIM;
  }
  return (uint32_t)ISAAC_GAME_UPDATE_8318A0_MODE3_ARM_SET4;
}

extern "C" uint32_t isaac_game_update_slice_8318a0_mode3_anim_arg(
    uint32_t type_1c, uint32_t membership_hit) {
  /* Push-imm at each 0x7ab380/0x7ab550 site. Recapture membership BYTE. */
  if ((membership_hit & 0xffu) != 0u) {
    if (type_1c == 0xcu) return 0x1a6u;
    if (type_1c == 0xdu) return 0x1b5u;
    return 0u;
  }
  if (type_1c == 5u) return 0xa1u;
  if (type_1c == 6u) return 0x51u;
  if (type_1c == 7u) return 0xbu;
  if (type_1c == 8u) return 0xd4u;
  if (type_1c == 9u) return 0x137u;
  if (type_1c == 0xau) return 0x14cu;
  if (type_1c == 0xeu) return 0x17u;
  return 0u;
}

extern "C" int32_t isaac_game_update_slice_8318a0_mode3_anim_live(
    uint32_t saved_1bb74) {
  /* PE 0x83215c / 0x8321b6 test esi/edi,edi. FULL-DWORD. 0x100 is live. */
  return (saved_1bb74 != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_game_update_slice_8318a0_mode3_walk_410_cond(
    uint32_t field_26614) {
  /* PE 0x83239e cmp dword [eax+0x26614],2 / 0x8323a5 jge skip store.
     SIGNED. 0x80000000 MUST store; 2 must NOT. */
  return static_cast<int32_t>(field_26614) < 2 ? 1 : 0;
}

extern "C" uint32_t isaac_game_update_slice_8318a0_mode3_host_va_7ab380(void) {
  /* ZHL HasCollectible pattern matched the VA but the call site is 3
     pushes (file/line/id) — signature mismatch, address-stable name. */
  return ISAAC_GAME_UPDATE_8318A0_HOST_VA_7AB380;
}

extern "C" uint32_t isaac_game_update_slice_8318a0_mode3_host_va_7ab550(void) {
  return ISAAC_GAME_UPDATE_8318A0_HOST_VA_7AB550;
}



/* ABI v95 (record idx 39 mid-restock HOST_FATAL): RNG::RandomInt zero-seed
   law. PE 0x007e9026 mov edx,[esi] / 0x007e9028 test edx,edx / 0x007e902a
   jne 0x7e9042 — a FULL-DWORD compare on the captured desc+0x58 seed:
   0x100 must NOT be a fatal (only seed==0 enters the 0xa112c0 log + int3
   arm). The zero-seed arm makes ZERO game-memory stores before the fatal,
   so the mid-restock body wire drops the restock (typed event
   `mid_restock_seed_zero_drop`, coordinator merge) instead of rerunning
   the monolithic residual. */
extern "C" int32_t isaac_game_update_slice_mid_restock_seed_zero(uint32_t seed58) {
  return (seed58 == 0u) ? 1 : 0;
}

/* ------------------------------------------------------------------ */
/* ABI v123 (record idx 38 opaqueRoomUpdateTailMid706cExpire): shop-
   restock body 0x008158a0 (Room::ShopRestockPartial) LAW PACK —
   exports-only landing (update-v123-706c-restock-laws; ADDENDUM 3 F1-F4
   in section-notes/update-84c170-tail/NOTES.md). Fresh linear decode
   cpu-dump/008158a0.txt re-verified branch-by-branch: extent
   0x008158a0..0x00815ad0, thiscall this=Room (esi), no stack args.
   Site PE 0x00805403 after the landed countdown gate. The typed-host
   residual classes (F4: 2x 0x428b20 entity creates per item, the
   effect-freedom-unproven [vtbl+0x14] item-def call, the untraced
   0x6eef60 getter, the reachable zero-hash fatal) keep the boundary
   counted — the coarse counter STAYS and fires exactly as before
   (capture contract NOT wired into the emission site this unit; layouts
   frozen, ABI stays 99). Transcribed from the instruction stream — do
   NOT derive from the C++. */

#define ISAAC_GAME_UPDATE_706C_XORSHIFT_S1 2u
#define ISAAC_GAME_UPDATE_706C_XORSHIFT_S2 7u
#define ISAAC_GAME_UPDATE_706C_XORSHIFT_S3 7u

/* shop gate: PE 0x8158ab mov eax,[esi+8] / 0x8158ae cmp eax,2 /
   0x8158b1 jne warn-tail — FULL-DWORD [Room+8]==2. Mismatch -> level-1
   warn log 0xa112c0(1, fmt 0xb6c8e4 @0xb6c8e4, arg=[Room+8]) then a
   NORMAL ret (NOT noreturn). */
extern "C" int32_t isaac_game_update_slice_706c_shop_gate(
    uint32_t room_type_8) {
  return (room_type_8 == 2u) ? 1 : 0;
}

/* bucket select: PE 0x8158e0..0x81590b — parity = cursor & 1 (and edx,1);
   idx = (cursor >> 1) & (count - 1) UNSIGNED shr/and (dec eax / shr
   ecx,1 / and ecx,eax). Pair table [[Room+0x7074] + idx*4];
   item_id = pair[parity*8]; cell_ptr = pair[parity*8 + 4]. */
extern "C" uint32_t isaac_game_update_slice_706c_bucket_parity(
    uint32_t cursor) {
  return cursor & 1u;
}

extern "C" uint32_t isaac_game_update_slice_706c_bucket_index(
    uint32_t cursor, uint32_t count) {
  return (cursor >> 1u) & (count - 1u);
}

/* cell counter: PE 0x81590e..0x815922 — cell_ptr SIGNED >= 0 gates
   (test ecx,ecx / js skip); byte cmp al,0xff / jae skips at cap
   (UNSIGNED); inc otherwise. A 0xff byte must stay 0xff. */
extern "C" uint32_t isaac_game_update_slice_706c_counter_inc_cap255(
    uint32_t byte_val) {
  const uint32_t b = byte_val & 0xffu;
  return (b < 0xffu) ? (b + 1u) : b;
}

/* grid pos: PE 0x815929..0x815997 — cdq/idiv [esi+0xc] SIGNED (x86
   TRUNCATES toward zero; remainder has the dividend's sign), then
   cvtdq2ps/mulss 40.0f/addss -> posX adds another 40.0f (xmm1 =
   0xbaa904), posY adds 120.0f (0xbaaa00). Each op rounds to f32. */
extern "C" int32_t isaac_game_update_slice_706c_idiv_quot(int32_t item_id,
                                                          int32_t width) {
  return item_id / width;
}

extern "C" int32_t isaac_game_update_slice_706c_idiv_rem(int32_t item_id,
                                                         int32_t width) {
  return item_id % width;
}

extern "C" float isaac_game_update_slice_706c_pos_x(int32_t rem) {
  const float r = static_cast<float>(rem);
  return (r * 40.0f) + 40.0f;
}

extern "C" float isaac_game_update_slice_706c_pos_y(int32_t quot) {
  const float q = static_cast<float>(quot);
  return (q * 40.0f) + 120.0f;
}

/* item-def vcall arm: PE 0x81599c..0x8159b4 — id <= 0x1bf UNSIGNED (ja)
   && slot [Room + id*4 + 0x24] != 0 (test/je). Call [[slot]+0x14]
   (slot, 1, &descriptor) — RESULT DISCARDED (effect-freedom unproven,
   F4 blocker 2). */
extern "C" int32_t isaac_game_update_slice_706c_vcall_arm(
    uint32_t slot_ptr, uint32_t item_id) {
  if (item_id > 0x1bfu) return 0;
  return (slot_ptr != 0u) ? 1 : 0;
}

/* hash fatal twin: PE 0x8159b7..0x8159ca (in-loop) AND the flush-tail
   twin 0x815a7f..0x815a92 (REACHABLE incl. empty-loop count==0 via the
   je @0x8158da) — hash==0 fires log 0xa112c0(0x10, "RNG Seed is
   zero!\n" @0xb6bf54) + int3, NORETURN. Typed-drop predicate
   (mid-restock precedent). */
extern "C" int32_t isaac_game_update_slice_706c_hash_zero(uint32_t hash_in) {
  return (hash_in == 0u) ? 1 : 0;
}

/* xorshift step: PE 0x8159cb..0x8159ea / tail twin 0x815a93..0x815aab —
   x ^= x >> s1; x ^= x << s2; x ^= x >> s3 with {2,7,7} (u32 wrap;
   single chain across iterations + flush). Keys are .rdata 0xb1f54c/50/54
   (IMMUTABLE, byte-verified {2,7,7}). */
extern "C" uint32_t isaac_game_update_slice_706c_xorshift_step(uint32_t x) {
  x ^= x >> ISAAC_GAME_UPDATE_706C_XORSHIFT_S1;
  x ^= x << ISAAC_GAME_UPDATE_706C_XORSHIFT_S2;
  x ^= x >> ISAAC_GAME_UPDATE_706C_XORSHIFT_S3;
  return x;
}

/* ---- ABI v95 (record idx 25 roomTriggerClearStats): stats residual of
   Room::TriggerClear -> FUN_009e5960 (this = Game+0x266e4, called
   unconditionally at 0x00806935). Pure laws transcribed from
   cpu-dump/009e5960.txt + 009e6740.txt + 009e6940.txt + 0069ee50.txt.
   The guest-alloc vector growth 0x69ee50 stays typed-host (malloc-based
   alloc 0x40cf00 / memmove 0xaf08bd / free 0xaef15c; length_error
   0x415bc0/0x40cee0); the laws below pin the arg prep + growth-count
   math so the host replays the growth exactly. */

/* gate: PE 0x009e5970 cmp dword [ebp+0x10],1 / jne 0x9e5a1c — FULL-DWORD
   compare on the movzx-widened clearCount word (param_4). 0x10001 must
   NOT open (only the word 1 does). */
extern "C" int32_t isaac_game_update_slice_tcs_stats_gate(uint32_t clear_count) {
  return (clear_count == 1u) ? 1 : 0;
}

/* count: PE 0x009e6740..0x009e6764 — eax = arg-8 (u32 wrap); cmp eax,4;
   ja -> 1; jmp [eax*4+0x9e6768]; ALL FIVE table entries -> 0x9e6755
   (mov eax,2). So arg in [8..12] -> 2, else 1. UNSIGNED bounds: arg < 8
   wraps huge -> 1. */
extern "C" int32_t isaac_game_update_slice_tcs_stats_count(uint32_t arg_10_48) {
  return ((arg_10_48 - 8u) <= 4u) ? 2 : 1;
}

/* float_gate: PE 0x009e59a7 comiss xmm0, [0xba9fe4] (= -18.0f) /
   0x009e59ae jbe 0x9e5a1b. Ordered > -18.0f required; unordered (NaN)
   takes jbe (closes). lookup_bits is the 0x9e6940 result float bits
   (host-captured; 0x00000000 or 0x00000001 on the known path, both
   > -18.0f so the gate always opens there). */
extern "C" int32_t isaac_game_update_slice_tcs_stats_float_gate(uint32_t lookup_bits) {
  const float f = __builtin_bit_cast(float, lookup_bits);
  if (f != f) return 0; /* unordered -> comiss sets CF -> jbe closes */
  return f > -18.0f ? 1 : 0;
}

/* record_dword: PE 0x009e59b0/0x009e59b6 — record[0..3] = [ebp+8] =
   Room.field_8 (param_2, FULL dword). */
extern "C" int32_t isaac_game_update_slice_tcs_stats_record_dword(uint32_t room_f8) {
  return (int32_t)room_f8;
}

/* record_byte: PE 0x009e59b9/0x009e59bc — record[4] low byte = [ebp+0x14]
   = (desc.flags>>10)&1 (param_5). */
extern "C" int32_t isaac_game_update_slice_tcs_stats_record_byte(uint32_t flags44) {
  return (int32_t)((flags44 >> 10) & 1u);
}

/* growth_sim: per-append replay of the PE loop 0x009e59d3..0x009e5a00
   with the 0x69ee50 capacity math. end is RE-READ per iteration; the
   growth fires iff end == cap (PE 0x9e59d6 cmp / 0x9e59d9 je). New
   capacity: old_cap = (cap-begin)/12 (signed magic div 0x2aaaaaab,
   PE 0x69ee7a..0x69ee8a); throw when old_cap == 0x15555555 or new_cap
   > 0x15555555 (PE 0x69ee8d/0x69ef15); new_cap = max(old_cap+1,
   old_cap + (old_cap>>1)) (PE 0x69ef0b..0x69ef12 cmovae); cap =
   begin + 12*new_cap (u32 wrap, PE 0x69eec4 lea/shl + store). Returns
   the guest-alloc call count; out_end/out_cap = final vector pointers. */
extern "C" uint32_t isaac_game_update_slice_tcs_stats_growth_sim(
    uint32_t count, uint32_t begin, uint32_t end, uint32_t cap,
    uint32_t* out_end, uint32_t* out_cap) {
  uint32_t growths = 0;
  for (uint32_t i = 0; i < count; ++i) {
    if (end == cap) {
      /* 0x69ee50 capacity law. */
      /* old_cap = (cap-begin)/12 — the PE magic (0x69ee5b/0x69ee7a):
         signed 32x32 imul by 0x2aaaaaab, sar edx,1, then + sign bit. */
      const int32_t delta = (int32_t)(cap - begin);
      int64_t prod = (int64_t)delta * (int64_t)0x2aaaaaab;
      int32_t hi = (int32_t)(prod >> 32);
      hi >>= 1;
      int32_t old_cap = hi + (int32_t)(((uint32_t)hi) >> 31);
      if (old_cap == 0x15555555) break; /* length_error 0x415bc0 (host) */
      /* new_cap = max(old_cap+1, old_cap + (old_cap>>>1)) — PE 0x69ef0b
         lea eax,[edx+ecx] / 0x69ef0e mov ecx,ebx / 0x69ef12 cmovae. */
      int32_t new_cap = old_cap + (int32_t)(((uint32_t)old_cap) >> 1);
      if (new_cap < old_cap + 1) new_cap = old_cap + 1;
      if (new_cap > 0x15555555) break; /* length_error 0x40cee0 (host) */
      /* cap = begin + 12*new_cap (PE 0x69eec4 lea eax,[ecx+ecx*2] /
         shl eax,2), u32 wrap. */
      cap = begin + (uint32_t)new_cap * 12u;
      ++growths;
    }
    end += 12u; /* PE 0x9e59ea add dword [this+0x60],0xc */
  }
  if (out_end != nullptr) *out_end = end;
  if (out_cap != nullptr) *out_cap = cap;
  return growths;
}

/* tail_add: PE 0x009e5a0c cmp dword [ebp+8],0xb / jne + 0x009e5a12 cmp
   byte [Game+8],0 / je + 0x009e5a18 add [this+0x74], count. Room.field_8
   FULL-DWORD compare (0x10b must NOT match); [Game+8] LOW-BYTE. */
extern "C" int32_t isaac_game_update_slice_tcs_stats_tail_add(
    uint32_t room_f8, uint32_t game_byte_8, uint32_t count) {
  if (room_f8 != ISAAC_GAME_UPDATE_TCS_STATS_TAIL_TYPE) return 0;
  if ((game_byte_8 & 0xffu) == 0u) return 0;
  return (int32_t)count;
}

/* ---- ABI v95 (record idx 27 roomTriggerClearAudio): always-music body
   decision law of 0x7f83b0 (VA 0x007f83b0..0x007f84e7 front, called by
   Room::TriggerClear at 0x008069da with arg1=1, arg2=0). Branch-by-
   branch from cpu-dump 007f83b0.txt; do NOT derive from the C++.
   Semantics:
     if (arg2 == 0) { if (!0x749830(game)) return 0;   // gate leaf
                      if (!roomMatch) return 0;         // gate leaf
     }
     value = 0x7f92b0(room);                            // host leaf
     if (arg2 != 0) -> MUSIC (0x7f8509)
     seed = [game+0x182e4];
     rnd  = f32( xorshift32(seed; {2,0x15,9}) * 0x2f7ffffe )  // [0,1)
     if (value > rnd)  -> MUSIC          // comiss/ja  (ordered)
     if (value >= 1.0f)-> MUSIC          // comiss/jae (ordered)
     else -> byte [game+9] = 1, ret 0    // flag store leaf
   The gate leaves (0x749830/GetRoomByIdx/0x7f92b0) are captured host
   results; THIS law is the pure rnd + compare core. NaN value: comiss
   sets CF/ZF/PF so ja and jae are NOT taken -> music == 0 (matches the
   machine: NaN value falls to the flag-store arm). */

/* xorshift32 with the machine's shift triple {2, 0x15, 9}: PE 0x7f8495..
   0x7f84b3 loads cl from qword [0xb1f594] = {2, 0x15} and dword
   [0xb1f59c] = {9} (movq + mov ecx + two dword loads), then:
     edx = eax; edx >>= 2; edx ^= eax;  eax = edx;
     eax <<= 0x15; eax ^= edx;          edx = eax;
     edx >>= 9; edx ^= eax;             eax = edx  (result). */
static uint32_t rtca_xorshift(uint32_t seed) {
  uint32_t x = seed;
  uint32_t t = x ^ (x >> 2);
  t ^= t << 0x15;
  t ^= t >> 9;
  return t;
}

extern "C" int32_t isaac_game_update_slice_room_trigger_clear_audio_music(
    uint32_t arg2, uint32_t value_bits, uint32_t seed) {
  if (arg2 != 0u) return 1; /* PE 0x7f8453 jne 0x7f8509 */
  const uint32_t r = rtca_xorshift(seed);
  /* uint32 -> double via cvtdq2pd + sign-fix: PE 0x7f84b9/0x7f84bd
     shr edx,0x1f / 0x7f84c0 addsd [edx*8 + 0xbacb00] — the table holds
     {0.0, 4294967296.0} so negative-as-int32 wraps to the unsigned
     value. Then cvtpd2ps (0x7f84c9) + mulss [0xba9ff0] =
     2.3283061589829401e-10 (0x2f7ffffe). */
  const double as_double = (double)(uint64_t)r; /* == sign-fixed u32 */
  const float rnd = (float)as_double * __builtin_bit_cast(float, 0x2f7ffffeu);
  const float value = __builtin_bit_cast(float, value_bits);
  /* comiss value,rnd ; ja -> value > rnd ordered (NaN: CF=1 -> no) */
  if (value > rnd) return 1;
  /* comiss value,1.0f ; jae -> value >= 1.0f ordered */
  if (value >= 1.0f) return 1;
  return 0;
}

/* ---- ABI v95 (record idx 30 roomTriggerClearAwardsGreed): greedy-arm
   laws of Room::TriggerClear (VA 0x008068f0..0x00806c17, ret 4) — the
   greed special-mode 2/3 arm 0x806b9e..0x806c0a (FUN_009bf990 /
   FUN_009bfae0 special residual) plus the unconditional 0x705ee0 tail.
   Branch-by-branch from cpu-dump 008068f0.txt + 00806bf0.txt; do NOT
   derive from the C++. The non-greed body (0x8069d4..0x806b63) and the
   tail -1 ARG law are owned by records 29/31; Game::SaveState typing
   inside 0x705ee0 is the record-12/20 store-plan unit. No uint8_t params
   (all i32/u32, explicit re-narrow; Wasm ABI does not narrow i32 args). */

/* greed_mode: 0x806b9e mov edi,[esi+0x269c8] — the machine RE-READS
   difficulty fresh for this arm — / 0x806ba4 cmp edi,2 / je + 0x806ba9 cmp
   edi,3 / jne 0x806c0a. FULL-DWORD equality: WIDE 0x102 / 0xffffffff are
   NOT greed; 2 and 3 are. */
extern "C" int32_t isaac_game_update_slice_trigger_clear_greed_mode(
    int32_t difficulty_269c8) {
  return (difficulty_269c8 == 2 || difficulty_269c8 == 3) ? 1 : 0;
}

/* greed_arm: 0x806bae mov eax,[ebx+8] (Room+8 = room type) / 0x806bb1 cmp
   eax,1 / jne 0x806be2 -> branch A (type==1) / 0x806be2 cmp eax,5 / jne
   0x806c0a + 0x806be7 cmp dword [ebx+0x1bb0],0x3e / jne 0x806c0a -> branch
   B (type==5 && subtype==0x3e). Returns 1 (branch A), 2 (branch B), 0 (no
   special residual; straight to the 705ee0 tail). FULL-DWORD equalities:
   type 0x100 is neither 1 nor 5. */
extern "C" int32_t isaac_game_update_slice_trigger_clear_greed_arm(
    uint32_t room_type_8, uint32_t room_subtype_1bb0) {
  if (room_type_8 == 1u) return 1;
  if (room_type_8 == 5u && room_subtype_1bb0 == 0x3eu) return 2;
  return 0;
}

/* greed_expected: 0x806bd1 xor eax,eax / 0x806bd3 cmp edi,3 / 0x806bd6
   sete al / 0x806bd9 add eax,0xa — (difficulty==3) ? 11 : 10 (Greedier 11,
   Greed 10). FULL-DWORD equality on edi (WIDE 0x103 -> 10). */
extern "C" int32_t isaac_game_update_slice_trigger_clear_greed_expected(
    int32_t difficulty_269c8) {
  return (difficulty_269c8 == 3) ? 11 : 10;
}

/* greed_match: 0x806bdc cmp ebx,eax / 0x806bde jne 0x806c0a — branch A
   reads [Game+0x18334] (mov ebx,[esi+0x18334] @0x806bb6), stores it to
   [Game+0x18368] (mov [esi+0x18368],ebx @0x806bc2, the arm's observable
   Game store), and fires FUN_009bfae0 ONLY when the value equals the
   expected constant. FULL-DWORD compare (0x100 must NOT match 10). */
extern "C" int32_t isaac_game_update_slice_trigger_clear_greed_match(
    int32_t store_value_18334, int32_t difficulty_269c8) {
  return (store_value_18334 ==
          isaac_game_update_slice_trigger_clear_greed_expected(
              difficulty_269c8))
             ? 1
             : 0;
}

/* greed_next: the FUN_009bfae0 fire decision (this=Game+0x1baa8, NO stack
   args; 0x806bff lea ecx,[esi+0x1baa8] / 0x806c05 call 0x9bfae0).
   Branch A: 0x806bcd test al,al / je 0x806c0a (probe = FUN_009bf990 return,
   LOW-BYTE 0x100 -> 0) AND 0x806bdc cmp/jne (match). Branch B:
   0x806bfb test al,al / je 0x806c0a (probe LOW-BYTE). arm 0 -> never. */
extern "C" int32_t isaac_game_update_slice_trigger_clear_greed_next(
    int32_t arm, int32_t probe_al, int32_t match) {
  if ((probe_al & 0xff) == 0) return 0;
  if (arm == 1) return match != 0 ? 1 : 0;
  if (arm == 2) return 1;
  return 0;
}

/* greed_tail_always: control-flow law — EVERY greed-arm exit edge (0x806bac
   jne / 0x806bcf je / 0x806bde jne / 0x806be5 jne / 0x806bee jne /
   0x806bfd je) targets LAB_00806c0a (the 705ee0 tail); the arm has NO early
   return. The record-30 share of "0x705ee0 typed-host": after the greed arm
   the tail call ALWAYS fires (push -1 @0x806c0a / call 0x705ee0 @0x806c0c;
   the -1 ARG law belongs to record 31, Game::SaveState typing to records
   12/20). */
extern "C" int32_t isaac_game_update_slice_trigger_clear_greed_tail_always() {
  return 1;
}

/* ---- ABI v95 (record idx 32): FUN_00956110 phone-home probe pure laws ----
   FUN_00956110 (0x956110..0x9561d2, cdecl 4 args, ret 0x10) is called at
   BOTH player-walk sites (0x98dcb5 arg1=0xd,arg2=player_id,arg3=player;
   0x98ddcd arg1=0xd,arg2=[rtti+0x378]->[+0xc]|0xdeadbeef,arg3=player).
   The pure decision CF is transcribed below; the platform IO tail
   0x864c30 (SEH + IAT [0xb183xx] + lua-pack 0x874910 + logger 0xa112c0),
   the walk-path virtual [[entry]+0x30](entry,arg1) dispatch, and the
   general callback [0xc57b18 container]+0x74(arg2,0xa20940,&arg1,0,0)
   dispatch stay TYPED-HOST (plan.host_* flags). */

/* net_gate: PE 0x956120 cmp dword [edi+8],2 / jne + 0x956126 cmp dword
   [0xc71690],0 / je — BOTH FULL-DWORD compares. A byte-narrow read of the
   mode (0x102 low byte 2) or of the flag (0x100 low byte 0) diverges. */
extern "C" int32_t isaac_game_update_slice_98dba0_956110_net_gate(
    uint32_t manager_mode, uint32_t global_c71690) {
  return (manager_mode == 2u && global_c71690 != 0u) ? 1 : 0;
}

/* net_early: PE 0x95613e test al,al / je -> fall-through; 0x956142 mov
   al,[ebp+0xb] / ret — the probe out byte IS the return value; callers
   test al (LOW BYTE). 0x100 -> 0, 0xff -> 1. */
extern "C" int32_t isaac_game_update_slice_98dba0_956110_net_early(
    uint32_t net_out_byte) {
  return (net_out_byte & 0xffu) != 0u ? 1 : 0;
}

/* path: PE 0x95615d cmp ecx,eax / je 0x9561ac (mp begin==end -> GENERAL) +
   0x956161 cmp edx,-1 / jne 0x9561ac (arg2 != -1 -> GENERAL). WALK iff the
   mp span is non-empty AND arg2 == 0xffffffff. FULL-DWORD arg2 compare:
   0x1ff must be GENERAL, not WALK. */
extern "C" int32_t isaac_game_update_slice_98dba0_956110_path(
    uint32_t mp_begin, uint32_t mp_end, uint32_t arg2) {
  if (mp_begin == mp_end) {
    return ISAAC_GAME_UPDATE_956110_PATH_GENERAL;
  }
  if (arg2 != 0xffffffffu) {
    return ISAAC_GAME_UPDATE_956110_PATH_GENERAL;
  }
  return ISAAC_GAME_UPDATE_956110_PATH_ID_NEG1_WALK;
}

/* walk_result: PE 0x956166..0x9561a9. count = (end-begin) SAR 2 re-derived
   EVERY iteration (0x956180..0x95618f); esi runs while esi < count with an
   UNSIGNED jb (0x956194); per entry call [[entry]+0x30](entry,arg1) and
   test al,al — the FIRST nonzero (LOW-BYTE test; 0x100 -> 0) wins -> 1,
   else 0. count==0 (or null results with count 0) -> 0. */
extern "C" int32_t isaac_game_update_slice_98dba0_956110_walk_result(
    const uint32_t* vtable_results, uint32_t count) {
  if (vtable_results == nullptr || count == 0u) {
    return 0;
  }
  for (uint32_t i = 0u; i < count; ++i) {
    if ((vtable_results[i] & 0xffu) != 0u) {
      return 1;
    }
  }
  return 0;
}

/* arg_prep: the call-argument constants FUN_00956110 composes on each arm
   (net: arg3 passthrough, imm 0, arg1 passthrough, out-buf = arg1 slot +3
   at PE 0x95612f..0x956136; walk: vtable+0x30 with arg1 pushed at PE
   0x956174/0x956177; general: container 0xc57b18 vtable+0x74, callback
   0xa20940, arg1 imm 0xd stored into its slot, 2 zero args + 5 pushes at
   PE 0x9561ac..0x9561c7). */
extern "C" void isaac_game_update_slice_98dba0_956110_arg_prep(
    IsaacGameUpdateSlice956110ArgPrep* out) {
  if (out == nullptr) {
    return;
  }
  out->net_arg1_kind = 0;
  out->net_arg2_imm = 0;
  out->net_arg3_kind = 0;
  out->net_out_buf_off = 0xb;
  out->walk_vtbl_off = 0x30;
  out->walk_stack_arg1 = 1;
  out->general_container_va = 0x00c57b18u;
  out->general_vtbl_off = 0x74;
  out->general_callback_va = 0x00a20940u;
  out->general_arg1_imm = 0xd;
  out->general_push_count = 5;
  out->general_zero_args = 2;
}

/* result_plan: the composed FUN_00956110 decision. net gate open ->
   host_864c30=1 (the platform IO tail runs); gate open && 0x864c30
   returned nonzero (net_host_ok) -> value = net_early(out_byte), path =
   NET_EARLY, pure. Else the path law: WALK -> value = walk fold (pure
   when the capture is complete, vtable_count <= 8), host_vtable_walk=1;
   GENERAL -> value = (general_result & 0xff) != 0 (host echo: the
   callback dispatch is host), host_general=1, pure=0. */
extern "C" void isaac_game_update_slice_98dba0_956110_result_plan(
    IsaacGameUpdateSlice956110Result* out, uint32_t manager_mode,
    uint32_t global_c71690, uint32_t mp_begin, uint32_t mp_end, uint32_t arg2,
    uint32_t net_host_ok, uint32_t net_out_byte,
    const uint32_t* vtable_results, uint32_t vtable_count,
    uint32_t general_result) {
  if (out == nullptr) {
    return;
  }
  out->pure_cf_ok = 1;
  out->host_864c30 = 0;
  out->host_vtable_walk = 0;
  out->host_general = 0;
  out->pure = 0;
  out->path = ISAAC_GAME_UPDATE_956110_PATH_GENERAL;
  out->value = 0;
  if (isaac_game_update_slice_98dba0_956110_net_gate(manager_mode,
                                                     global_c71690) != 0) {
    out->host_864c30 = 1; /* the platform IO tail 0x864c30 is reachable */
    if (net_host_ok != 0u) {
      out->path = ISAAC_GAME_UPDATE_956110_PATH_NET_EARLY;
      out->value = isaac_game_update_slice_98dba0_956110_net_early(
          net_out_byte);
      out->pure = 1;
      return;
    }
  }
  if (isaac_game_update_slice_98dba0_956110_path(mp_begin, mp_end, arg2) ==
      ISAAC_GAME_UPDATE_956110_PATH_ID_NEG1_WALK) {
    out->path = ISAAC_GAME_UPDATE_956110_PATH_ID_NEG1_WALK;
    out->host_vtable_walk = 1; /* [[entry]+0x30] dispatch is host */
    if (vtable_count <= ISAAC_GAME_UPDATE_956110_MAX_VTABLE) {
      out->value = isaac_game_update_slice_98dba0_956110_walk_result(
          vtable_results, vtable_count);
      out->pure = 1; /* complete per-entry capture -> fold is pure */
    }
    return;
  }
  out->path = ISAAC_GAME_UPDATE_956110_PATH_GENERAL;
  out->host_general = 1; /* 0xa20940 callback dispatch is host */
  out->value = (general_result & 0xffu) != 0u ? 1 : 0;
}

/* ---- ABI v95 (record idx 5/32, 0x0098dba0): ENTITY-SURFACE capture
   contract for VIRTUAL [[player+0x370]+0x14] (walk sites 0x98dca2 /
   0x98dd1d). The [matched MP entry]+0x370 subobject vptr is one of
   exactly two .rdata vtables (0xb82d98 DataUpdate_t / 0xb82e20
   Network::KAGE::MultiplayerManager::LobbyDataUpdate_t); slot[0x14] is
   0xa5f260 / 0xa23970 — the accept predicates transcribed below (pure).
   The virtual dispatch itself stays TYPED-HOST: the host performs the
   call and captures the real AL to verify the in-module prediction
   (plan.typed_host / plan.host_verify). PE-truth from cpu-dump
   0098dba0.txt (sites), 00a5f260.txt + 00a5f2b0.txt (DataUpdate_t),
   00a23970.txt (LobbyDataUpdate_t), 00af0750.txt (shift helper),
   00a5f090.txt + 00a5f0ab.txt (netman lookup). */

/* class_bits: FULL-DWORD decode of the subobject vptr at [entry+0x370].
   The only vptr writes in the image are the constructor stores of
   0xb82d98 / 0xb82e20 (0x009015f0/0x00901603/0x009018c5/0x00901979); any
   other value is class UNKNOWN (2) and the plan refuses to be pure. A
   byte-narrow decode (low byte 0x98 vs 0x20) misreads 0xb82e98 as
   DataUpdate_t. */
extern "C" int32_t isaac_game_update_slice_entity_surface_class_bits(
    uint32_t vtable_ptr) {
  if (vtable_ptr == ISAAC_GAME_UPDATE_ENTITY_SURFACE_VTABLE_DATA_UPDATE_T) {
    return ISAAC_GAME_UPDATE_ENTITY_SURFACE_CLASS_DATA_UPDATE_T;
  }
  if (vtable_ptr ==
      ISAAC_GAME_UPDATE_ENTITY_SURFACE_VTABLE_LOBBY_DATA_UPDATE_T) {
    return ISAAC_GAME_UPDATE_ENTITY_SURFACE_CLASS_LOBBY_DATA_UPDATE_T;
  }
  return ISAAC_GAME_UPDATE_ENTITY_SURFACE_CLASS_UNKNOWN;
}

/* lobby_accept: PE 0xa23970. ecx=[this+4]; ecx==0 -> 0. [ecx+0x20]==0 ->
   byte law. [ecx+0x20]->[+0x10] == [0xc5ac00] (FULL-DWORD) -> 1. byte
   law: al = byte[ecx] & 1 — LOW-BYTE load; 0x100 -> 0, 0xff -> 1. */
extern "C" int32_t isaac_game_update_slice_entity_surface_lobby_accept(
    uint32_t impl_ptr, uint32_t impl_b0, uint32_t impl_20,
    uint32_t impl_20_10, uint32_t global_c5ac00) {
  if (impl_ptr == 0u) {
    return 0;
  }
  if (impl_20 != 0u && impl_20_10 == global_c5ac00) {
    return 1;
  }
  return (impl_b0 & 1u) != 0u ? 1 : 0;
}

/* data_accept: PE 0xa5f260..0xa5f2c9. edi=[this+4]; edi==0 -> 0.
   0xaf0750(eax=[edi+8], cl=0x20, edx=[edi+0xc]) degenerates to
   eax=[edi+0xc], edx=0 — the sentinel gate is the FULL-DWORD compare
   [edi+0xc] == 0xfefefefe. Match arm: lookup = 0xa5f090([0xc7999c]) =
   ([0xc73680]!=0 && [0xc73694]==0x60001) ? [[0xc7999c]+0x2b4] : 0
   (the two failure arms push log args to 0xa69f60 then return 0; the
   log is a typed-host leaf outside the value law); return [edi+8] ==
   lookup. Else the layer gate [edi+0x20]->[+0x10] == [0xc5ac00] -> 1;
   else byte law (byte[edi] & 1). */
extern "C" int32_t isaac_game_update_slice_entity_surface_data_accept(
    uint32_t impl_ptr, uint32_t impl_b0, uint32_t impl_8, uint32_t impl_c,
    uint32_t impl_20, uint32_t impl_20_10, uint32_t global_c5ac00,
    uint32_t global_c73680, uint32_t global_c73694, uint32_t netman_2b4) {
  if (impl_ptr == 0u) {
    return 0;
  }
  if (impl_c == static_cast<uint32_t>(ISAAC_GAME_UPDATE_ENTITY_SURFACE_IMPL_C_SENTINEL)) {
    uint32_t lookup = 0u;
    if (global_c73680 != 0u &&
        global_c73694 == ISAAC_GAME_UPDATE_ENTITY_SURFACE_NETMODE_ACTIVE) {
      lookup = netman_2b4;
    }
    return (impl_8 == lookup) ? 1 : 0;
  }
  if (impl_20 != 0u && impl_20_10 == global_c5ac00) {
    return 1;
  }
  return (impl_b0 & 1u) != 0u ? 1 : 0;
}

/* accept: the composed accept law over the capture blob, dispatched by
   class_bits. Unknown classes fall back to the data law here; the plan
   export marks pure=0 for them so the wire refuses a pure prediction. */
extern "C" int32_t isaac_game_update_slice_entity_surface_accept(
    const IsaacGameUpdateSliceEntitySurfaceCapture* cap) {
  if (cap == nullptr) {
    return 0;
  }
  if (cap->vtable_class_bits ==
      ISAAC_GAME_UPDATE_ENTITY_SURFACE_CLASS_LOBBY_DATA_UPDATE_T) {
    return isaac_game_update_slice_entity_surface_lobby_accept(
        cap->impl_ptr, cap->impl_b0, cap->impl_20, cap->impl_20_10,
        cap->global_c5ac00);
  }
  return isaac_game_update_slice_entity_surface_data_accept(
      cap->impl_ptr, cap->impl_b0, cap->impl_8, cap->impl_c, cap->impl_20,
      cap->impl_20_10, cap->global_c5ac00, cap->global_c73680,
      cap->global_c73694, cap->netman_2b4);
}

/* plan: the composed accept decision + typed-host contract. The virtual
   [[entry+0x370]+0x14] dispatch ALWAYS stays host (typed_host=1) and the
   host captures the real AL to verify the prediction (host_verify=1);
   pure=1 only when the class is known and the blob fully determines the
   accept. */
extern "C" void isaac_game_update_slice_entity_surface_plan(
    IsaacGameUpdateSliceEntitySurfacePlan* out,
    const IsaacGameUpdateSliceEntitySurfaceCapture* cap) {
  if (out == nullptr) {
    return;
  }
  out->typed_host = 1;  /* the virtual dispatch is the standing host leaf */
  out->host_verify = 1; /* host captures the real AL to verify */
  if (cap == nullptr) {
    out->accept = -1;
    out->class_bits = ISAAC_GAME_UPDATE_ENTITY_SURFACE_CLASS_UNKNOWN;
    out->pure = 0;
    return;
  }
  out->class_bits = cap->vtable_class_bits;
  if (cap->vtable_class_bits ==
      ISAAC_GAME_UPDATE_ENTITY_SURFACE_CLASS_UNKNOWN) {
    out->accept = -1;
    out->pure = 0;
    return;
  }
  out->accept = isaac_game_update_slice_entity_surface_accept(cap);
  out->pure = 1;
}

/* walk_step: one player iteration of the walk's accept-driven state
   machine. Phase 1 (PE 0x98dc5c..0x98dcbc): the site-1 probe runs iff
   (mp_found==0 || accept1_al!=0) — mp miss jumps 0x98dca8 straight to
   FUN_00956110 with arg2=player_id; mp hit with accept1==0 jumps
   0x98dd07 and clears bl WITHOUT the probe. accept1/accept2 are virtual
   AL results — BYTE-gated (test al,al @0x98dca4 / @0x98dd1f; 0x100 -> 0,
   v106 corrected). bl = probe1_ran && (probe1_nz & 0xff) != 0 (0x98dcba
   test al,al — LOW-BYTE, 0x100 -> 0). Phase 2 (PE 0x98dcc0..0x98dd39):
   the 0x98dd27 RTTI block is entered iff found2 ? accept2_al : mp_nonempty
   — found2 with accept2==0 jumps 0x98de0e straight to the next player,
   skipping RTTI. */
extern "C" void isaac_game_update_slice_entity_surface_walk_step(
    IsaacGameUpdateSliceEntitySurfaceWalkStep* out, uint32_t mp_found,
    uint32_t accept1, uint32_t probe1_nz, uint32_t found2, uint32_t accept2,
    uint32_t mp_nonempty) {
  if (out == nullptr) {
    return;
  }
  uint32_t accept1_al = (accept1 & 0xffu) != 0u ? 1u : 0u;
  uint32_t accept2_al = (accept2 & 0xffu) != 0u ? 1u : 0u;
  uint32_t probe1_ran = (mp_found == 0u || accept1_al != 0u) ? 1u : 0u;
  out->probe1_ran = probe1_ran;
  out->bl_after1 = (probe1_ran != 0u && (probe1_nz & 0xffu) != 0u) ? 1 : 0;
  out->rtti_enter =
      (found2 != 0u) ? ((accept2_al != 0u) ? 1u : 0u)
                     : ((mp_nonempty != 0u) ? 1u : 0u);
}

/* rtti_fold (v106): the RTTI block of the walk (PE 0x98dd27..0x98dddc) —
   the bl outcome once the block is entered. Block gates are FULL-DWORD
   (rtti_out/cast = test eax,eax; gate378 = cmp [eax+0x378],0); local +
   probe2 are LOW-BYTE (test al,al @0x98ddad / @0x98ddd2) -> & 0xff
   (0x100 -> 0, 0xff -> 1). Branch order per the machine: enter==0 or any
   gate 0 -> bl unchanged (0x98dd60/0x98dd7e/0x98dd82 je 0x98dddc); bl
   already 1 -> 1 (0x98dd8b jne 0x98ddda); mp empty -> probe2 runs -> bl =
   (probe2_nz & 0xff) != 0 (0x98dd9b je 0x98ddb1 / 0x98ddd4 jne); !local
   -> 0 with probe2 SKIPPED (0x98ddad je 0x98ddd6); else probe2 decides
   (0x98ddd2 test al,al). */
extern "C" int32_t isaac_game_update_slice_entity_surface_rtti_fold(
    uint32_t rtti_enter, uint32_t bl_after1, uint32_t rtti_out,
    uint32_t rtti_cast, uint32_t gate378, uint32_t mp_empty,
    uint32_t is_idx_local, uint32_t probe2_nz) {
  int32_t bl = (bl_after1 != 0u) ? 1 : 0;
  if (rtti_enter == 0u) {
    return bl;
  }
  if (rtti_out == 0u || rtti_cast == 0u || gate378 == 0u) {
    return bl;
  }
  if (bl != 0) {
    return 1;
  }
  if (mp_empty != 0u) {
    return ((probe2_nz & 0xffu) != 0u) ? 1 : 0;
  }
  if ((is_idx_local & 0xffu) == 0u) {
    return 0;
  }
  return ((probe2_nz & 0xffu) != 0u) ? 1 : 0;
}

/* ---- ABI v95 (record idx 34 B13 H5 FUN_00824a70): per-loop CREATE-arm
   PURE LAWS (entity create stays TYPED HOST). ----

   loop_count_from_age: PE 0x00824b60 test ecx,ecx (age = Room[0]==0 ? -1 :
   Game+0x264f8 - Room+0x11f0) / 0x00824b7f sete al / 0x00824b9c lea
   eax,[eax*4+1]: age==0 -> 5, else 1. FULL-DWORD compare on age (WIDE
   0x100 / 0xffffffff are != 0 -> 1 loop). */
extern "C" int32_t isaac_game_update_slice_ambient_824a70_loop_count_from_age(
    uint32_t age) {
  return (age == 0u) ? 5 : 1;
}

/* create_args_plan: typed CREATE-arm argument plan (PE 0x00824c97..0x00824cc2
   + A1/L0 imms): effect_type 0x3e8 (push 0x3e8 @0x824cb8), effect_variant
   0x8a (push 0x8a @0x824cb3), layer_index 0 (GetLayer arg, push 0 @0x824e55),
   anm_data_ptr 0xb1bc54 (push 0xb1bc54 @0x824cc2), a1_arg 1 (push 1
   @0x824ce7), seed = R3 genrand dword (pushed @0x824ca4), game_ptr_global
   0xc71678. The 0x6fe410 entity create stays TYPED HOST; this law types the
   host call with the in-module per-loop argument plan. */
extern "C" void isaac_game_update_slice_ambient_824a70_create_args_plan(
    uint32_t seed, IsaacGameUpdateSliceAmbient824a70CreateArgs* out) {
  if (out == nullptr) return;
  out->effect_type = 0x3e8u;
  out->effect_variant = 0x8au;
  out->layer_index = 0u;
  out->anm_data_ptr = 0xb1bc54u;
  out->a1_arg = 1u;
  out->seed = seed;
  out->game_ptr_global = 0xc71678u;
}

/* r4_genrand_needed: PE 0x00824cd8 test edi,edi ([anm2+0x30] anim_count) /
   0x00824cda je 0x824ce7 -> the conditional R4 anim-frame draw runs iff
   anim_count != 0. FULL-DWORD compare (WIDE 0x100 / 0xffffffff still draw).
   The draw itself stays host (guest entity field + genrand CALL); this law
   decides it (layer/genrand decisions already in-module for H5). */
extern "C" int32_t isaac_game_update_slice_ambient_824a70_r4_genrand_needed(
    uint32_t anim_count) {
  return (anim_count != 0u) ? 1 : 0;
}

/* Typed per-loop CREATE-arm plan scratch (7 u32 per loop:
   [type, variant, layer, data, a1, seed, game_ptr_global]; cap 64 loops =
   448 words). Mirrors the v52 genrand samples scratch pattern. */
extern "C" uintptr_t isaac_game_update_slice_ambient_824a70_create_args_address(
    void) {
  return (uintptr_t)scratch_ambient_824a70_create_args;
}

extern "C" uint32_t isaac_game_update_slice_ambient_824a70_create_args_max(void) {
  return (uint32_t)ISAAC_AMBIENT_824A70_MAX_LOOPS;
}

extern "C" uintptr_t isaac_game_update_slice_tca40_tail_plan_out_address(void) {
  return (uintptr_t)scratch_tca40_tail_plan_out;
}

extern "C" uint32_t isaac_game_update_slice_tca40_tail_plan_out_max(void) {
  return (uint32_t)ISAAC_GAME_UPDATE_TCA_TAIL_MAX_ROWS;
}

extern "C" uintptr_t isaac_game_update_slice_tca83b0_tail_plan_out_address(void) {
  return (uintptr_t)scratch_tca83b0_tail_plan_out;
}

extern "C" uint32_t isaac_game_update_slice_tca83b0_tail_plan_out_max(void) {
  return (uint32_t)ISAAC_GAME_UPDATE_TCA_TAIL_MAX_ROWS;
}
extern "C" uintptr_t isaac_game_update_slice_tca83b0_alt_tail_plan_out_address(void) {
  return (uintptr_t)scratch_tca83b0_alt_tail_plan_out;
}

extern "C" uint32_t isaac_game_update_slice_tca83b0_alt_tail_plan_out_max(void) {
  return (uint32_t)(sizeof(scratch_tca83b0_alt_tail_plan_out) /
                    sizeof(scratch_tca83b0_alt_tail_plan_out[0]));
}

/* ---- ABI v95 (record idx 43): TriggerDeath CALL-ARG laws ----
   The PM1 death walk (PlayerManager::Update 0x009bb5d0) composes the
   pre-call pack at 0x009bb67d..0x009bb682: push 0; call 0x7a1090 with
   ecx = the LIVE cursor element. These three exports carry the
   composition laws the v69 wire consumes BY REFERENCE (extending the
   frozen PM death contract with the arg-prep laws).

   receiver: PE 0x009bb63c mov eax,[esi] (begin2) / 0x009bb63e sub ecx,eax
   (end2-begin2, 32-bit wrap) / 0x009bb640 sar ecx,2 (count2, ARITHMETIC) /
   0x009bb643 cmp edi,ecx; jae 0x9bb64a (u32 index >= u32 count2 -> cursor
   stays begin2: element 0 dereferenced, NEVER skipped) / 0x009bb647 lea
   eax,[eax+edi*4] (in-range: begin2 + index*4, wrap). The count is
   re-derived per iteration; begin/end here are the frame span capture. */
extern "C" uint32_t isaac_game_update_slice_death_call_receiver(uint32_t begin,
                                                                uint32_t end,
                                                                uint32_t index) {
  const int32_t count2 = (int32_t)(end - begin) >> 2;
  if ((uint32_t)index < (uint32_t)count2) {
    return begin + index * 4u;
  }
  return begin;
}

/* flag: PE 0x009bb67d push 0 — the ONLY argument, ALWAYS 0
   (checkOnly=false, PM_DEATH_TRIGGER_ARG_CHECK_ONLY). Independent of the
   index and of the eligibility decision (eligibility decides WHETHER the
   call fires, never WHAT it receives). A nonzero flag would flip
   state==1 players onto TriggerDeath's CHECK_ONLY no-op arm
   (PE 0x007a10b3 cmp byte [ebp+8],0 / 0x007a10b7 jne 0x7a1ca1). */
extern "C" int32_t isaac_game_update_slice_death_call_flag(void) { return 0; }

/* arg_prep: the composed event's arg-prep record. receiver = the receiver
   law; flag = the flag law; can_trigger = (eligible != 0) — the PE fires
   the call iff the eligibility decision passes (0x009bb64c..0x009bb67b),
   with FIXED args. eligible is the PM-family decision consumed BY
   REFERENCE (isaac_pm_death_player_eligible / tick should_trigger). */
extern "C" void isaac_game_update_slice_death_call_arg_prep(
    uint32_t begin, uint32_t end, uint32_t index, uint32_t eligible,
    IsaacGameUpdateSliceDeathCallArgPrep* out) {
  if (out == nullptr) {
    return;
  }
  out->receiver = isaac_game_update_slice_death_call_receiver(begin, end, index);
  out->flag = (uint32_t)isaac_game_update_slice_death_call_flag();
  out->can_trigger = (eligible != 0u) ? 1 : 0;
}

/* ABI v95 (record idx 19 opaqueCall006fd7c0Mode4Sfx): mode-4 SFX ARG/seed
   laws as the composed typed-event arg-prep. Every law consumes the
   frame-effect v18 family export BY REFERENCE (never re-derived). PE
   anchors: seed select 0x006fd825 mov [ebp+0x14],0xbb / 0x006fd8e4 mov
   0xd7; rare 0x0095685b..0x0095686c (UNSIGNED % 20 == 0); id 0x00956806
   mov 0x25 / 0x0095686e mov 0x12d; args 0x006fd83a..0x006fd851 (loop slot
   = the `push 0` at 0x006fd84c); receiver 0x006fd858 lea ecx,
   [esi+0x2a324]; play leaf 0x0092dc30 (SFXManager::Play). All scalar
   params uint32_t/int32_t — no uint8_t scalar param (Wasm ABI does not
   narrow i32 args; the family laws re-narrow in-body). */
extern "C" int32_t isaac_game_update_slice_6fd7c0_mode4_sfx_seed(
    uint32_t special) {
  return (special != 0u) ? isaac_frame_effect_6fd7c0_special_sfx_seed()
                         : isaac_frame_effect_6fd7c0_mode4_sfx_seed();
}

extern "C" int32_t isaac_game_update_slice_6fd7c0_sfx_rare_hit(
    uint32_t mixed_counter) {
  return isaac_frame_effect_6fd7c0_sfx_rare_hit(mixed_counter);
}

extern "C" int32_t isaac_game_update_slice_6fd7c0_sfx_play_id(
    int32_t seed_id, int32_t remap_gate_open, int32_t rare_hit) {
  return isaac_frame_effect_6fd7c0_sfx_play_id(seed_id, remap_gate_open,
                                               rare_hit);
}

extern "C" uint32_t isaac_game_update_slice_6fd7c0_sfx_play_args(
    uint32_t* out_args, uint32_t len, int32_t sfx_id) {
  return isaac_frame_effect_6fd7c0_sfx_play_args(out_args, len, sfx_id);
}

extern "C" uint32_t isaac_game_update_slice_6fd7c0_sfx_manager_receiver(
    uint32_t base) {
  return isaac_frame_effect_6fd7c0_sfx_manager_receiver(base);
}

/* The COMPOSED typed-event arg-prep. play_va names the typed host leaf
   (SFXManager::Play 0x92dc30) whose call the host consumer re-issues with
   the in-module argument plan. */
extern "C" void isaac_game_update_slice_6fd7c0_mode4_sfx_arg_prep(
    uint32_t special, int32_t remap_gate_open, uint32_t mixed_counter,
    uint32_t base, IsaacGameUpdateSlice6fd7c0Mode4SfxArgPrep* out) {
  if (out == nullptr) {
    return;
  }
  out->seed = (uint32_t)isaac_game_update_slice_6fd7c0_mode4_sfx_seed(special);
  out->rare_hit = isaac_game_update_slice_6fd7c0_sfx_rare_hit(mixed_counter);
  out->id = isaac_game_update_slice_6fd7c0_sfx_play_id(
      (int32_t)out->seed, remap_gate_open, out->rare_hit);
  (void)isaac_game_update_slice_6fd7c0_sfx_play_args(
      out->args, ISAAC_FRAME_EFFECT_SFX_PLAY_ARG_COUNT, out->id);
  out->receiver = isaac_game_update_slice_6fd7c0_sfx_manager_receiver(base);
  out->play_va = ISAAC_FRAME_EFFECT_HOST_SFX_PLAY_VA;
}

/* ABI v96 (record idx 46 playerManagerUpdateHeartbeatSfxPlay depth): PLAY
   CONTINUATION body-law mirrors. The v88 typed-leaf split (record-46
   abiV95) landed the ENTRY gate; the continuation body laws live in the
   SFX family and are FORWARDED here BY REFERENCE (never re-derived — the
   family is the source of truth; sfx_pure_helpers.h SP section):
     A4 window_open   isaac_sfx_play_window_open  (PE 0x92dd04..0x92dd0a)
     A6 seed          isaac_sfx_rng_next          (PE 0x92dd51..0x92dd77)
     A7 voice         isaac_sfx_voice_select      (PE 0x92dd75..0x92dd80)
     A7 pick_offset   isaac_sfx_voice_pick_offset (PE 0x92dd82..0x92dd90)
     A9 volume-clamp  isaac_sfx_voice_volume_clamped (PE 0x92de22..0x92de41)
   All scalar params uint32_t/int32_t/float — no uint8_t scalar params. */
extern "C" int32_t isaac_game_update_slice_sfx_play_window_open(
    int32_t clock_4abbc, int32_t entry_end_4) {
  return isaac_sfx_play_window_open(clock_4abbc, entry_end_4);
}

extern "C" uint32_t isaac_game_update_slice_sfx_play_seed_next(
    uint32_t seed, uint32_t shift1, uint32_t shift2, uint32_t shift3) {
  return isaac_sfx_rng_next(seed, shift1, shift2, shift3);
}

extern "C" uint32_t isaac_game_update_slice_sfx_voice_select(uint32_t seed_out,
                                                             uint32_t voices) {
  return isaac_sfx_voice_select(seed_out, voices);
}

extern "C" int32_t isaac_game_update_slice_sfx_voice_pick_offset(
    uint32_t voice_index) {
  return isaac_sfx_voice_pick_offset(voice_index);
}

extern "C" float isaac_game_update_slice_sfx_voice_volume_clamped(
    float mgr_volume_modifier, float volume, float master_volume) {
  return isaac_sfx_voice_volume_clamped(mgr_volume_modifier, volume,
                                        master_volume);
}

/* The COMPOSED continuation plan: the ordered A4->A6->A7->A9 chain gated
   on window_open (A4 closed = PE side-effect-free ret 0x92de8b — the seed
   NEVER advances, no voice is picked, volume is not computed). */
extern "C" void isaac_game_update_slice_sfx_play_continuation(
    uint32_t clock_4abbc, int32_t entry_end_4, uint32_t rng_seed,
    uint32_t voices, float mgr_volume_modifier, float volume,
    float master_volume, IsaacGameUpdateSliceSfxPlayContinuation* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t window_open =
      isaac_game_update_slice_sfx_play_window_open((int32_t)clock_4abbc,
                                                   entry_end_4);
  out->window_open = window_open;
  if (window_open == 0) {
    out->seed_out = rng_seed;
    out->voice_index = 0u;
    out->voice_offset = 0;
    out->volume_bits = 0u;
    out->body_reached = 0;
    return;
  }
  const uint32_t seed_out = isaac_game_update_slice_sfx_play_seed_next(
      rng_seed, ISAAC_GAME_UPDATE_SFX_PLAY_RNG_SHIFT1,
      ISAAC_GAME_UPDATE_SFX_PLAY_RNG_SHIFT2,
      ISAAC_GAME_UPDATE_SFX_PLAY_RNG_SHIFT3);
  const uint32_t voice_index =
      isaac_game_update_slice_sfx_voice_select(seed_out, voices);
  const float clamped = isaac_game_update_slice_sfx_voice_volume_clamped(
      mgr_volume_modifier, volume, master_volume);
  /* Family convention: __builtin_bit_cast (sfx_pure_helpers.cpp f32_bits). */
  const uint32_t volume_bits = __builtin_bit_cast(uint32_t, clamped);
  out->seed_out = seed_out;
  out->voice_index = voice_index;
  out->voice_offset = isaac_game_update_slice_sfx_voice_pick_offset(voice_index);
  out->volume_bits = volume_bits;
  out->body_reached = 1;
}

/* ABI v95 (record idx 44 PM3 arm laws, PlayerManager::Update PM3 arm
   0x009bb76e..0x009bb835). quiet_gate mirrors PE 0x009bb774 movss xmm0,
   [0xbaa06c]=0.01f / 0x009bb782 comiss xmm0,xmm1 / 0x009bb78c jb
   0x9bb7ad: comiss CF = (0.01f < maxVol) || unordered, so the QUIET arm
   is ordered 0.01f >= maxVol. NaN maxVol -> unordered -> CF=1 -> LOUD
   (C `>=` on NaN is false). Boundary: maxVol == 0.01f EXACTLY is quiet
   (CF=0). The quiet arm probes is-playing (0x92e560) and either pure-skips
   (al==0, 0x9bb795 je) or runs the 0x92e230 stop (0x9bb7a2). */
extern "C" __attribute__((noinline)) int32_t isaac_game_update_slice_pm3_quiet_gate(float max_vol) {
  return (0.01f >= max_vol) ? 1 : 0;
}

/* empty_pure_skip: the EMPTY player vector leaves maxVol = 0.0f (PE
   0x009bb6b2 xorps xmm1,xmm1; 0x009bb6c3 test eax,eax / 0x009bb6c5 je
   0x9bb76e skips the loop) -> the arm is QUIET and the probe 0x92e560
   returns al==0 -> PE 0x009bb795 je 0x9bb830: the WHOLE PM3 arm (and thus
   the heartbeat) is a host-free pure skip. FULL-DWORD count compare
   (0x100 must NOT be empty: PE counts (end-begin) SAR 2). is_playing is
   the captured hybrid probe (typed host, record 44 wire). */
extern "C" __attribute__((noinline)) int32_t isaac_game_update_slice_pm3_empty_pure_skip(
    uint32_t player_count, uint32_t is_playing) {
  const uint32_t playing = is_playing != 0u ? 1u : 0u;
  return (player_count == 0u &&
          isaac_game_update_slice_pm3_quiet_gate(0.0f) != 0 && playing == 0u)
             ? 1
             : 0;
}

/* empty_stop_split: empty vector + playing -> the QUIET arm's probe is
   nonzero -> ONLY the 0x92e230 SFX stop runs (PE 0x009bb7a2, epilogue A).
   The whole-heartbeat MONOLITHIC residual must NOT fire for the empty
   vector (the PM2 loop is skipped, maxVol=0 — no pack required). The stop
   body stays the typed record-47 host lane (v60 entry gate). */
extern "C" __attribute__((noinline)) int32_t isaac_game_update_slice_pm3_empty_stop_split(
    uint32_t player_count, uint32_t is_playing) {
  const uint32_t playing = is_playing != 0u ? 1u : 0u;
  return (player_count == 0u &&
          isaac_game_update_slice_pm3_quiet_gate(0.0f) != 0 && playing != 0u)
             ? 1
             : 0;
}

/* ABI v95 (R4 equal-flags capture, record idx 10): the FULL non-empty walk
   decision, consumed BY REFERENCE from the frozen frame-opaque 40add0
   contract (isaac_frame_opaque_40add0_probe_from_equal_flags): first
   match index over the per-entry equal-flag bytes, then the bit test of
   [A+0x18] (1 << (index & 31)). 1 = probe TRUE (match + bit set -> the
   0x421343 true-probe interior stays host, R2); 0 = probe FALSE (miss or
   bit clear -> the 0x4213de..0x4213ea pure clear). equal_flags is a
   POINTER to the runtime blob's sized byte lane — no uint8_t scalar
   crosses the ABI (contract rule). */
extern "C" int32_t isaac_game_update_slice_4212c0_add0_probe_from_equal_flags(
    const uint8_t* equal_flags,
    uint32_t list_count,
    uint32_t bitfield_18) {
  return isaac_frame_opaque_40add0_probe_from_equal_flags(
      equal_flags, list_count, bitfield_18);
}

extern "C" int32_t isaac_game_update_slice_8ef990_join_956780_closed(
    uint32_t game, uint32_t node_bd, uint32_t node_f10, uint32_t node_ptr,
    uint32_t sentinel) {
  /* FUN_00956780 gate (RTE v13 law, imported in-module): game==0, byte+0xd
     nonzero, signed dword+0x10 > 7, or node==sentinel all SKIP the prep
     (0x9567ae test/je, 0x9567d5 cmp byte/jne, 0x9567df cmp dword/jg,
     0x9567e9 cmp eax,[esi]/je). Closed == gate==0 == prep no-op. */
  return isaac_room_transition_engine_956780_gate(
             static_cast<int32_t>(game), node_bd,
             static_cast<int32_t>(node_f10), node_ptr, sentinel) == 0
             ? 1
             : 0;
}

/* ---- ABI v96: record idx 9 (0x008ef990) TAIL-A seam laws (0x8efcea..
   0x8efdd1, unit update-v96-record9-tailalaws). Census: the SFX manager's
   multiplayer player-ptr vector [0xc7169c]+0x4b3d8/+0x4b3dc (begin/end) and
   the 0x956780/0x92dc30 sfx leg. The ONLY TAIL-A-internal branch is D1
   (slot empty); the 956780 gate closed -> the prep is a no-op; the
   else-reset triple is constant. Every scalar param is uint32_t; no
   uint8_t scalar params. */

/* D1, PE 0x8efcf4 mov eax,[M+0x4b3d8] / 0x8efcfa cmp eax,[M+0x4b3dc] /
   0x8efd00 je 0x8efd3e: FULL-dword begin==end (MP slot empty -> ARM B;
   else ARM A). WIDE 0x100/0xffffffff pairs compare equal — never a
   byte-narrow test (0x100 vs 0x100 must be EMPTY). */
extern "C" int32_t isaac_game_update_slice_8ef990_taila_slot_empty(
    uint32_t slot_begin, uint32_t slot_end) {
  return slot_begin == slot_end ? 1 : 0;
}

/* Else-reset store triple, PE 0x8efdd1 mov dword ptr [edi],2 /
   0x8efdd7 mov dword ptr [edi+0xc],8 / 0x8efdde mov dword ptr
   [edi+4],0xffffffff. Path-agnostic: find-fail 0x8ef9d8, count==0
   0x8ef9e0 and the TAIL-A fallthrough (0x8efdcc -> 0x8efdd1) all write
   the SAME triple (state24ecc=2, mode24ed8=8, value24ed0=-1). */
extern "C" int32_t isaac_game_update_slice_8ef990_else_reset_state(void) {
  return 2;
}
extern "C" int32_t isaac_game_update_slice_8ef990_else_reset_mode(void) {
  return 8;
}
extern "C" int32_t isaac_game_update_slice_8ef990_else_reset_value(void) {
  return 0xffffffff;
}

/* Site-pinned (0x8efd9f) re-export of the v93 JOIN law: same RTE v13
   956780 gate operands (0x4288a0 shape). Gate closed -> the prep is a pure
   no-op and the played id stays the fallback 0x36 (PE 0x8efd97 mov
   [esp+0x10],0x36); Play 0x92dc30 is the sole residual host call on the
   TAIL-A sfx leg. */
extern "C" int32_t isaac_game_update_slice_8ef990_taila_956780_closed(
    uint32_t game, uint32_t node_bd, uint32_t node_f10, uint32_t node_ptr,
    uint32_t sentinel) {
  return isaac_game_update_slice_8ef990_join_956780_closed(
      game, node_bd, node_f10, node_ptr, sentinel);
}

/* OPEN-path roll select: PE 0x956806 mov dword ptr [edi],0x25 (seed) /
   0x956850..0x95686c magic-mul mod-20 (0xcccccccd mul / shr edx,4 exact
   iff seed % 20 == 0, UNSIGNED) / 0x95686c jne skip / 0x95686e mov
   dword ptr [edi],0x12d. roll % 20 == 0 -> 0x12d (301) else 0x25 (37).
   The xorshift RNG chain ([0xc5d2b0/b4/b8/bc]) and the seed store stay
   host; the modulo is pure arithmetic (roll = the xorshift output quad). */
extern "C" int32_t isaac_game_update_slice_8ef990_taila_sfx_id(
    uint32_t roll) {
  return roll % 20u == 0u ? 0x12d : 0x25;
}

/* ---- ABI v95: record idx 9 (0x008ef990) LISTENER-REGISTRY accept-gate laws
   (0xc57b18 surface, unit update-v95-8ef990-listener). Census (2026-08-16):
   registry singleton @0xc57b18 (.data, size 0x4c, vtbl 0xb827f4); element
   list span [this+8..this+0xc] stride 8 pairs {key*, obj*}; key->[+0xc] =
   key id; key vtbl+0x34 = accept(mode) virtual; obj vtbl+1 = active, vtbl+3
   = release. Virtual Notify dispatch = vtbl+0x74 = 0xa20fb0 walk; record-9
   probe arms (modes 0xe/0xf/0x16/0x17/0x14/0x15) call it via callback
   0xa209e0 with arg2 = &mode_slot and arg0 = value24ed0 ([edi+4]): arg0 ==
   -1 selects the FULL-WALK law, else the FIND law. The virtual dispatch,
   the [0xc7e814] hook and the release chain stay host (TYPED HOST EVENT);
   these four laws reproduce the pure DECISION from host-captured class-bits.
   per-element bits (state24ecc8ef990ListenerBits[i]): bit0 obj present,
   bit1 obj active, bit2 obj release, bits 4..9 accept(mode_k) for the SIX
   fixed record-9 modes k=0..5 -> [0xe,0xf,0x16,0x17,0x14,0x15]. Every
   scalar param is uint32_t; no uint8_t scalar params. */

/* 0xa2100d mov eax,[ebx+0xc] / 0xa21016 mov ecx,[ebx+8] / 0xa21019 sub
   eax,ecx / 0xa2101b sar eax,3 (also 0xa20068..0xa2006e slot-7 size).
   count = SAR32(end-begin, 3): FULL-DWORD arithmetic shift; wrapped/negative
   spans give negative counts (the walk loop still runs -> nonzero). */
extern "C" int32_t isaac_game_update_slice_8ef990_listener_count(
    uint32_t begin, uint32_t end) {
  return static_cast<int32_t>(end - begin) >> 3;
}

/* 0xa20390 find: 0xa203f0 mov ecx,[eax] / 0xa203f2 cmp [ecx+0xc],edi /
   0xa203f5 je found / 0xa203f7 add eax,8 / 0xa203fa cmp eax,edx / jne.
   FIRST-match linear scan of key ids == value (full-dword equality); the
   element stride-copy and release chain are host side effects. */
extern "C" int32_t isaac_game_update_slice_8ef990_listener_find(
    uint32_t count, uint32_t value, const uint32_t* ids) {
  for (uint32_t i = 0; i < count; ++i) {
    if (ids[i] == value) return 1;
  }
  return 0;
}

/* Record-9 probe-arm accept: walk FIND path (arg0 != -1). PE 0xa21116 cmp
   [ebp-0x1c],0 / je 0xa2118a (no match -> 0) then the callback 0xa209e0
   accept = key->vtbl[0x34](*arg2 == mode) — captured as bits[first][4+k].
   The six machine mode constants are FIXED by the contract; mode_index out
   of [0,6) -> 0. */
extern "C" int32_t isaac_game_update_slice_8ef990_listener_arm_accept(
    uint32_t count, uint32_t value, uint32_t mode_index,
    const uint32_t* ids, const uint32_t* bits) {
  if (mode_index >= 6u) return 0;
  uint32_t first = count;
  for (uint32_t i = 0; i < count; ++i) {
    if (ids[i] == value) {
      first = i;
      break;
    }
  }
  if (first >= count) return 0;
  return (bits[first] >> (4u + mode_index)) & 1u;
}

/* Record-9 walk-all accept (arg0 == -1): PE 0xa21055 test eax,eax / je
   (obj==0 skip), 0xa2105b..0xa21061 obj->vtbl[1]() (active), 0xa2106e..0xa21073
   pair.obj->vtbl[3]() (release), commit, then callback accept on the
   committed key (0xa2109d..0xa210b1 loop). cur = last committed element;
   element i commits iff present && active && (none committed yet or the
   previous committed obj releases). No commit ever -> 0 (the machine would
   call the callback with a null key; accept 0 is the pure decision). */
extern "C" int32_t isaac_game_update_slice_8ef990_listener_walk_accept(
    uint32_t count, uint32_t mode_index, const uint32_t* bits) {
  if (mode_index >= 6u) return 0;
  int32_t cur = -1;
  for (uint32_t i = 0; i < count; ++i) {
    const uint32_t b = bits[i];
    if ((b & 1u) != 0u && (b & 2u) != 0u &&
        (cur < 0 || (bits[static_cast<uint32_t>(cur)] & 4u) != 0u)) {
      cur = static_cast<int32_t>(i);
    }
    if (cur >= 0 &&
        (bits[static_cast<uint32_t>(cur)] & (1u << (4u + mode_index))) != 0u) {
      return 1;
    }
  }
  return 0;
}

/* ---- ABI v95: PlayerManager::FirstCollectibleOwner (0x009be080) decision
   laws (record idx 0, wave-18 unit update-v95-record0-fco). FRESH census:
   67 insns, ret 0xc, 3 E8 (GetCollectible 0x72fd10 + HasCollectible
   0x7706e0 x2), 0 indirect, 174 direct rel32 callers image-wide, exact ZHL
   `__thiscall Entity_Player* FirstCollectibleOwner(CollectibleType, RNG**,
   bool)`. arg2 RNG** [ebp+0xc] is NEVER READ by this body — no CRT/genrand
   draw (the xorshift draw lives in the sibling RandomCollectibleOwner
   0x009be150) -> per unit contract NO RNG typed-host lands; the sparse
   hud_stat_owner_byte capture STAYS. These laws are the pure decision CF
   (bool 3rd arg gate + player-vector walk + result select) so the slice
   owns the FCO decision; the two callee bodies stay host (0x72fd10 is a
   HUD-owned pure island, 0x7706e0 is address-stable host). Every scalar
   param is uint32_t and byte gates re-narrow in the body (Wasm ABI). */

namespace {
constexpr uint32_t kFco9be080TwinBit = 0x80000000u;  /* and eax,0x80000000 */
constexpr uint32_t kFco9be080ListStride = 4u;        /* add esi,4 @0x9be10d */
constexpr uint32_t kFco9be080ProbeWords = 5u;        /* ptr,f2c,has1,twin,has2 */
}  // namespace

/* 0x009be0a7 cmp byte [ebp+0x10],0 / je 0x9be0c8; 0x009be0ad test eax,eax /
   je; 0x009be0b7 and eax,0x80000000 / or eax,0 / je -> [esp+0x13]=1 else 0.
   The bool 3rd arg is a LOW-BYTE test; the twin bit is bit 31 of the
   GetCollectible config item's +0xb8 flags dword. */
extern "C" int32_t isaac_game_update_slice_fco_twin_flag(
    uint32_t arg3_byte, uint32_t item_ptr, uint32_t item_flags_b8) {
  if ((arg3_byte & 0xffu) == 0u) return 0;
  if (item_ptr == 0u) return 0;
  return (item_flags_b8 & kFco9be080TwinBit) != 0u ? 1 : 0;
}

/* 0x009be0ce mov esi,[edi] / 0x009be0d0 cmp esi,[edi+4] / je 0x9be115.
   FULL-DWORD compare of begin vs end -> not-found (eax=0). */
extern "C" int32_t isaac_game_update_slice_fco_list_empty(
    uint32_t list_begin, uint32_t list_end) {
  return (list_begin == list_end) ? 1 : 0;
}

/* 0x009be0d9 cmp dword [player+0x2c],0 / jne 0x9be10d. FULL-DWORD gate:
   the slot is probed only when player field +0x2c == 0. */
extern "C" int32_t isaac_game_update_slice_fco_slot_checkable(
    uint32_t player_field_2c) {
  return (player_field_2c == 0u) ? 1 : 0;
}

/* 0x009be0e9 test al,al / jne 0x9be12f and 0x009be105 test al,al /
   jne 0x9be120: the HasCollectible result is tested as a LOW BYTE. RAW
   uint32 (0x100 -> miss), re-narrowed in the body. */
extern "C" int32_t isaac_game_update_slice_fco_has_collectible_hit(
    uint32_t al_byte) {
  return ((al_byte & 0xffu) != 0u) ? 1 : 0;
}

/* 0x009be0ed cmp byte [esp+0x13],al / je 0x9be109 THEN 0x009be0f9 test
   ecx,ecx / je 0x9be109: the shared byte (low byte!) is tested BEFORE the
   twin pointer; both must be nonzero for the twin HasCollectible probe. */
extern "C" int32_t isaac_game_update_slice_fco_twin_check_needed(
    uint32_t shared_byte, uint32_t twin_ptr) {
  if ((shared_byte & 0xffu) == 0u) return 0;
  return (twin_ptr != 0u) ? 1 : 0;
}

/* 0x009be10d add esi,4. 32-bit wrap. */
extern "C" uint32_t isaac_game_update_slice_fco_walk_next(uint32_t iter) {
  return iter + kFco9be080ListStride;
}

/* 0x009be110 cmp esi,[eax+4] / jne 0x9be0d7. FULL-DWORD loop condition
   (eax = the list ptr reloaded from the stack save, PE 0x9be109). */
extern "C" int32_t isaac_game_update_slice_fco_walk_continue(
    uint32_t next_iter, uint32_t list_end) {
  return (next_iter != list_end) ? 1 : 0;
}

/* Composite walk (PE 0x009be0ce..0x009be113): derives the owner pointer
   exactly — shared byte via fco_twin_flag, per-entry slot gate
   [p+0x2c]==0, primary HasCollectible low-byte hit -> player, else twin
   gate (shared byte then ptr) + twin low-byte hit -> twin, else next
   entry; miss -> 0. probes is a POINTER to count x 5 words
   {player_ptr, f2c, has_primary, twin_ptr, has_twin} (has_* are the host
   0x7706e0 result bytes — not capturable today, hence the sparse owner
   byte stays). The probe span is bounded by count; the PE list walk is
   unbounded, so uncaptured spans stay host. */
extern "C" uint32_t isaac_game_update_slice_fco_walk_owner(
    uint32_t arg3_byte, uint32_t item_ptr, uint32_t item_flags_b8,
    uint32_t list_begin, uint32_t list_end, const uint32_t* probes,
    uint32_t probe_count) {
  if (probes == nullptr || probe_count == 0u) return 0u; /* caller gates; defensive */
  const int32_t shared =
      isaac_game_update_slice_fco_twin_flag(arg3_byte, item_ptr, item_flags_b8);
  if (isaac_game_update_slice_fco_list_empty(list_begin, list_end) != 0) {
    return 0u; /* 0x9be0d3 je not-found */
  }
  uint32_t iter = list_begin;
  for (uint32_t i = 0u; i < probe_count; ++i) {
    const uint32_t entry = i * kFco9be080ProbeWords;
    const uint32_t player_ptr = probes[entry + 0u];
    const uint32_t f2c = probes[entry + 1u];
    const uint32_t has_primary = probes[entry + 2u];
    const uint32_t twin_ptr = probes[entry + 3u];
    const uint32_t has_twin = probes[entry + 4u];
    if (isaac_game_update_slice_fco_slot_checkable(f2c) != 0) {
      if (isaac_game_update_slice_fco_has_collectible_hit(has_primary) != 0) {
        return player_ptr; /* 0x9be0eb jne 0x9be12f -> mov eax,edi */
      }
      if (isaac_game_update_slice_fco_twin_check_needed(
              static_cast<uint32_t>(shared), twin_ptr) != 0 &&
          isaac_game_update_slice_fco_has_collectible_hit(has_twin) != 0) {
        return twin_ptr; /* 0x9be107 jne 0x9be120 -> mov eax,[edi+0x1e6c] */
      }
    }
    /* 0x9be109 mov eax,[esp+0x14] reloads the list ptr; 0x9be10d add esi,4 */
    iter = isaac_game_update_slice_fco_walk_next(iter);
    if (isaac_game_update_slice_fco_walk_continue(iter, list_end) == 0) break;
  }
  return 0u; /* 0x9be115 xor eax,eax not-found */
}

/* ---- ABI v95: MenuGateOpen 0x009b7680 head laws (record idx 8, wave-18 unit
   update-v95-menu-open-census). FRESH full-body census: 1979 insns / 0 resyncs
   over the 7224-byte span 0x9b7680..0x9b92b8 (9-function menu-object cluster),
   128 direct E8 + 15 indirect, 279 stores, 9 rets. The body is IRREDUCIBLE host
   (SFX 0x92dc30/0x956780/0x92e300 + ANM2 Load/Rewind/GetLayer + 12 alloc sites
   + 8 virtual slots + IAT operator delete). These FIVE laws transcribe the
   recoverable pure consequences of the head (0x9b7680..0x9b7a1e): the ANM2
   slot select, the three GetLayer byte+0x74 store values, and the fac
   game-index search — all PURE functions of inputs the slice already captures
   (global_range_byte_length runtime, difficulty_269c8 state, the v92 98dba0
   player-span begin/end). Every scalar param is uint32_t (Wasm ABI). */

/* 0x009b772f cmp dword [edi+4],1 / 0x009b7733 mov ebx,0x140 /
   0x009b7738 mov eax,0x2c / 0x009b774c cmovne esi,eax: the ANM2 slot offset
   is 0x140 when menu_mode == 1, else 0x2c. FULL-DWORD equality. */
extern "C" uint32_t isaac_game_update_slice_menu_open_slot_select(
    uint32_t menu_mode) {
  return (menu_mode == 1u) ? 0x140u : 0x2cu;
}

/* 0x009b7979 mov ecx,[edx+0x4b3d8] / 0x009b797f cmp ecx,[edx+0x4b3dc] /
   0x009b7989 setne al: layer+0x74 = (game_range_begin != end), FULL-DWORD.
   byte_length = end-begin (the existing global_range_byte_length input). */
extern "C" int32_t isaac_game_update_slice_menu_open_layer74_range_nonempty(
    uint32_t byte_length) {
  return (byte_length != 0u) ? 1 : 0;
}

/* 0x009b79c4 cmp edx,ecx / je 0; 0x009b79c8 sub / 0x009b79ca sar ecx,2 /
   0x009b79cd cmp ecx,1 / 0x009b79d0 jbe 0: layer+0x74 = (count > 1) where
   count = (end-begin)>>2 ARITHMETIC and the jbe bound is UNSIGNED.
   WIDE: byte_length 0x100 -> count 0x40 -> 1; 4 -> 1 -> 0;
   0xffffffff -> -1 -> (uint32)-1 > 1 -> 1. */
extern "C" int32_t isaac_game_update_slice_menu_open_layer74_count_gt_one(
    uint32_t byte_length) {
  const int32_t delta =
      static_cast<int32_t>(static_cast<uint32_t>(byte_length));
  const int32_t count = delta >> 2;
  return (static_cast<uint32_t>(count) > 1u) ? 1 : 0;
}

/* 0x009b7a04 cmp dword [ecx+0x269c8],1 / 0x009b7a0b sete cl: layer+0x74 =
   (difficulty_269c8 == 1), FULL-DWORD equality (existing state field). */
extern "C" int32_t isaac_game_update_slice_menu_open_layer74_difficulty_one(
    uint32_t difficulty_269c8) {
  return (difficulty_269c8 == 1u) ? 1 : 0;
}

/* 0x009b76ed..0x009b7713: the head's fac game-index search over the player
   span (Game+0x1baa8/+0x1baac — the SAME span as the v92 frame_98dba0
   capture) for the host-resolved target id:
     0x9b76fb sub esi,edx; 0x9b76fd sar esi,2   count = SAR32(end-begin,2)
     0x9b7700 test esi,esi; je 0x9b7710         count==0 -> -1
     0x9b7704 cmp [edx],eax; je 0x9b7713        full-dword match -> i
     0x9b7708 inc ecx; add edx,4; cmp ecx,esi; jb 0x9b7704  UNSIGNED bound
   samples is a POINTER to sample_count captured span dwords (the PE span is
   unbounded; the capture contract bounds it, caller gates on walk_ready). */
extern "C" int32_t isaac_game_update_slice_menu_open_fac_index(
    uint32_t span_begin, uint32_t span_end, uint32_t target,
    const uint32_t* samples, uint32_t sample_count) {
  const int32_t delta = static_cast<int32_t>(static_cast<uint32_t>(span_end) -
                                             static_cast<uint32_t>(span_begin));
  const int32_t count = delta >> 2; /* SAR32 */
  if (count == 0) return -1;        /* 0x9b7702 je 0x9b7710 */
  const uint32_t bound = static_cast<uint32_t>(count); /* UNSIGNED jb */
  uint32_t i = 0u;
  for (; i < bound; ++i) {
    if (i >= sample_count) return -1; /* capture cap (defensive) */
    if (samples[i] == target) return static_cast<int32_t>(i);
  }
  return -1; /* 0x9b7710 or ecx,-1 */
}

/* ABI v70: FUN_0098dba0 timer-interior pure float chain. Each helper is one
   dependency spine of the straight-line interior 0x0098de58..0x0098df1e,
   transcribed instruction-by-instruction (full listing in the header above
   frame_opaque_98dba0_timer_pure_ready). All values cross as raw bit
   patterns; each f32 operation rounds exactly once, mirroring one SSE scalar
   instruction. Constants are written as bit patterns read through the PE
   section table from file-backed .rdata, each with hundreds of independent
   consumers image-wide (counts in the header). */

extern "C" uint32_t isaac_game_update_slice_98dba0_timer_theta_bits(uint32_t sample) {
  /* 0x0098de7e movd / 0x0098de82 cvtdq2pd: (double)(int32)sample, exact. */
  double wide = (double)(int32_t)sample;
  /* 0x0098de86 shr eax,0x1f / 0x0098de89 addsd [eax*8+0xbacb00]: the standard
     u32 fixup — qword[0] = 0.0, qword[1] = 2^32 (0x41f0000000000000). After
     it `wide` is exactly (double)(uint32)sample. */
  if ((sample >> 31) != 0u) {
    wide += 4294967296.0;
  }
  /* 0x0098de92 cvtpd2ps: the ONE double->f32 rounding, BEFORE the 2^-32
     multiply — sample 0xffffffff rounds up to 2^32 here, and 0xffffff80 is
     the round-to-even tie that also lands on 2^32. */
  const float as_f32 = (float)wide;
  /* 0x0098de9e mulss [0xba9ff4] (2^-32f) — NOT 0x2f7ffffe; the 7230 finish
     helper's one-ULP-off twin must not leak in here. */
  const float unit = as_f32 * __builtin_bit_cast(float, 0x2f800000u);
  /* 0x0098dea9 mulss [0xbaa704] — 3.14f (0x4048f5c3), the game's truncated
     pi, not float(M_PI) (0x40490fdb). */
  const float scaled = unit * __builtin_bit_cast(float, 0x4048f5c3u);
  /* 0x0098deb9 addss xmm1,xmm1 — doubling by self-add, one rounding. */
  const float theta = scaled + scaled;
  return __builtin_bit_cast(uint32_t, theta);
}

extern "C" uint32_t isaac_game_update_slice_98dba0_timer_mag_bits(uint32_t timer_after_dec) {
  /* 0x0098de96 movd from the re-read of Game+0x264e8 (folds to timer-1; the
     only call in between is Isaac::genrand_int32, whose censused writes are
     mt[]/mti/ring globals and fresh heap nodes) / 0x0098dea6 cvtdq2ps: a
     SIGNED int32->f32 convert, so the u32 parameter is re-interpreted. */
  const float t = (float)(int32_t)timer_after_dec;
  /* 0x0098deb1 divss [0xbaa81c] — 10.0f. A divide, not a 0.1f multiply. */
  const float mag = t / __builtin_bit_cast(float, 0x41200000u);
  return __builtin_bit_cast(uint32_t, mag);
}

extern "C" uint32_t isaac_game_update_slice_98dba0_timer_trig_narrow_bits(
    uint32_t result_bits_lo, uint32_t result_bits_hi) {
  /* Wrapper tails 0x0041d54f / 0x0041d52f cvtsd2ss on the CRT primitive's
     double result (the widening cvtss2sd at 0x0041d546/0x0041d526 is exact
     and is pinned through the published theta instead). */
  const uint64_t bits =
      ((uint64_t)result_bits_hi << 32) | (uint64_t)result_bits_lo;
  const float narrow = (float)__builtin_bit_cast(double, bits);
  return __builtin_bit_cast(uint32_t, narrow);
}

extern "C" uint32_t isaac_game_update_slice_98dba0_timer_axis_bits(
    uint32_t trig_bits, uint32_t mag_bits, uint32_t old_bits) {
  /* One store lane. x: 0x0098ded4 mulss (cos*mag), 0x0098ded9 mulss
     (old_x*0.5f), 0x0098dee1 addss. y: 0x0098df01 mulss (sin*mag),
     0x0098def9 mulss (old_y*0.5f), 0x0098df06 addss. Same shape, applied
     twice by the caller. The 0.5f is .rdata 0xbaa2d0 (0x3f000000). */
  const float scaled =
      __builtin_bit_cast(float, trig_bits) * __builtin_bit_cast(float, mag_bits);
  const float halved =
      __builtin_bit_cast(float, old_bits) * __builtin_bit_cast(float, 0x3f000000u);
  const float sum = scaled + halved;
  return __builtin_bit_cast(uint32_t, sum);
}

/* Records the typed carrier for one 0x00746560 emission and applies the post
   state the widget leaves behind. Only Game+0x216e8 is a tracked sparse field
   here, so only that store is applied; the Game+0x216e9 byte is published in
   the event (it is a runtime input on this ABI, not state). `post_ready`
   mirrors the 0x00840b61 `test ebx,ebx` write path — when it is 0 the PE took
   the 0x00840bdd assert path and stored nothing at all. */
void record_host_fun_746560(
    IsaacGameUpdateSliceState* state,
    IsaacGameUpdateSliceEvents* events,
    int32_t site,
    uint32_t param,
    int32_t cleanup_mode,
    uint32_t post_ready) {
  events->host_fun_746560_site = site;
  events->host_fun_746560_param = param & 0xffu;
  events->host_fun_746560_byte_216e9 =
      isaac_game_update_slice_host_746560_notify_byte(param);
  events->host_fun_746560_deathmatch_suffix =
      isaac_game_update_slice_host_746560_deathmatch_suffix((uint32_t)cleanup_mode);
  if (post_ready == 0u) return;
  state->hud_message_flag_8 = 1u; /* 0x00840bd7 mov byte [edi+8], 1 */
}

void apply_98dba0_after_player_walk(
    IsaacGameUpdateSliceState* state,
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs,
    IsaacGameUpdateSliceEvents* events) {
  const int32_t bvar2 = runtime_inputs->frame_opaque_98dba0_bvar2;
  int32_t counter = state->frame_opaque_98dba0_counter;
  /* PE 0x0098de34 `test bl,bl` / 0x0098de38 `inc [edi+8]` /
     0x0098de3b `cmp [edi+8],0xa` / `jne` — fires at exactly 10. */
  if (isaac_frame_opaque_98dba0_bvar2_counter_step(&counter, bvar2) != 0) {
    events->opaque_call_00746560 += 1;
    /* ABI v65: the callsite pushes the literal 1 (0x0098de41 `6a 01`), so the
       widget stores (1 ^ 1) = 0 into Game+0x216e9 and 1 into Game+0x216e8. */
    record_host_fun_746560(
        state,
        events,
        ISAAC_HOST_FUN_746560_SITE_WALK_COUNTER,
        1u,
        state->timed_transition_cleanup_mode,
        runtime_inputs->host_fun_746560_post_ready);
  }
  state->frame_opaque_98dba0_counter = counter;

  /* ABI v66: PE 0x0098de4a..0x0098de52 gates the whole timer block on a SIGNED
     Game+0x264e8 > 0, and the skip is a proven complete no-op (enumerated above
     isaac_game_update_slice_98dba0_timer_block_live). Emit the host edge only
     when the block actually runs.

     The capture is taken at the gate, not folded across a call that could move
     it: a whole-.text census of Game+0x264e8 finds exactly one writer besides
     0x0098de59 itself — 0x007401e4 `mov dword [eax+0x264e8], 0x1e`, inside
     FUN_0073fc80, which is the Lua "ChangeRoom" binding (registered at
     0x0086ccc4 `push 0x73fc80` / `push 0xb7407c "ChangeRoom"` /
     `call 0x891a90`) and is NOT in the 150-function CFG closure of the
     0x00746560 call at 0x0098de45. The receiver-relative census adds only
     0x0098db06 `mov dword [edi+0x61c], 0`, which lives in FUN_0098d560 and is
     not in this function's direct-call set.

     ready = 0 keeps the pre-v66 unconditional emission byte-for-byte. */
  if (runtime_inputs->frame_opaque_98dba0_timer_ready == 0u) {
    /* Pre-v66 compatibility arm: no capture, unconditional host edge. */
    events->opaque_call_0098dba0_timer += 1;
  } else if (isaac_game_update_slice_98dba0_timer_block_live(
                 runtime_inputs->frame_opaque_98dba0_timer_264e8) != 0) {
    if (runtime_inputs->frame_opaque_98dba0_timer_pure_ready == 0u) {
      /* v66..v69 live arm without the interior captures: the block body
         (Isaac::genrand_int32 + the two 0x0041d5xx wrappers + the
         0x264ec/0x264f0 stores) stays one host edge. */
      events->opaque_call_0098dba0_timer += 1;
    } else {
      /* ABI v70: the interior is straight-line and its game logic is fully
         translated, so with the captures present the host edge is DROPPED and
         the float-store plan is published instead. What remains on this arm
         is platform-primitive-owned only: the draw the host already performed
         when supplying `sample` (MT advance + debug ring when the useCrtRand
         byte is 0 — raw operator new / RtlCaptureStackBackTrace / frees per
         the frozen Room contract — or CRT rand() when nonzero) and the two
         _libm_sse2_{cos,sin}_precise evaluations whose double results arrived
         as inputs. Same shape as the v52 H5 precedent, where the mt-ready arm
         drops opaque_room_update_ambient_824a70_genrand to 0 while the ring
         stays host-owned.

         PE order inside the block: dec+store timer, READ old x/y
         (0x0098de5f/0x0098de6c — before the genrand call), draw, theta,
         cos lane, sin lane, store x then y. The pre-call captures are exact
         per the writer census in the header (no writer of
         Game+0x264e8/0x264ec/0x264f0 is reachable from 0x00746560, and the
         interior's own calls do not touch Game). */
      /* ABI v76: when the host captured mt[624] + mti at THIS boundary and
         the use_crt_rand low byte is clear, the draw runs IN-MODULE on the
         genrand_state scratch (the Room family's recovered MT19937,
         consumed by reference) and the host-supplied `sample` is not
         consulted — the host no longer performs Isaac::genrand_int32 for
         this boundary. The advanced 624 words stay in the scratch and the
         new index goes both to scratch_genrand_index_out (the v52 H5
         carrier the host already knows how to read back) and to the events,
         so a host that applies per-boundary can apply both. A set low byte
         keeps the v70 host-drawn arm (PE 0x006eef91 takes CRT rand() and
         does NOT touch mt[]), and mt_ready = 0 keeps it too. */
      const uint32_t use_crt_rand =
          runtime_inputs->frame_opaque_98dba0_timer_use_crt_rand;
      uint32_t sample = runtime_inputs->frame_opaque_98dba0_timer_sample;
      if (runtime_inputs->frame_opaque_98dba0_timer_mt_ready != 0u &&
          (use_crt_rand & 0xffu) == 0u) {
        IsaacRoomGenrandStep step = {};
        isaac_room_genrand_next(scratch_genrand_state,
                                runtime_inputs->frame_opaque_98dba0_timer_mt_in,
                                &step);
        sample = step.value;
        scratch_genrand_index_out = step.index_out;
        events->frame_opaque_98dba0_timer_mt_index_out = step.index_out;
      }
      const int32_t timer_after =
          (int32_t)runtime_inputs->frame_opaque_98dba0_timer_264e8 - 1;
      const uint32_t theta_bits = isaac_game_update_slice_98dba0_timer_theta_bits(
          sample);
      const uint32_t mag_bits = isaac_game_update_slice_98dba0_timer_mag_bits(
          (uint32_t)timer_after);
      const uint32_t cos_f32_bits =
          isaac_game_update_slice_98dba0_timer_trig_narrow_bits(
              runtime_inputs->frame_opaque_98dba0_timer_cos_bits_lo,
              runtime_inputs->frame_opaque_98dba0_timer_cos_bits_hi);
      const uint32_t sin_f32_bits =
          isaac_game_update_slice_98dba0_timer_trig_narrow_bits(
              runtime_inputs->frame_opaque_98dba0_timer_sin_bits_lo,
              runtime_inputs->frame_opaque_98dba0_timer_sin_bits_hi);
      events->frame_opaque_98dba0_timer_plan_applied = 1u;
      /* 0x006eef8a `cmp byte ptr [0xc7ac68],0` — LOW BYTE ONLY, so 0x100
         reads as 0 and the MT stream DID advance. On the mt-ready arm this
         is exactly the in-module draw decision. */
      events->frame_opaque_98dba0_timer_mt_advanced =
          (use_crt_rand & 0xffu) == 0u ? 1u : 0u;
      events->frame_opaque_98dba0_timer_after = timer_after;
      events->frame_opaque_98dba0_timer_theta_bits = theta_bits;
      /* COS feeds the x store (0x0041d540 -> IAT 0xb18820 _libm_sse2_cos_precise,
         consumed at 0x0098ded4 into the 0x0098df0f store), SIN the y store. */
      events->frame_opaque_98dba0_timer_x_bits =
          isaac_game_update_slice_98dba0_timer_axis_bits(
              cos_f32_bits, mag_bits,
              runtime_inputs->frame_opaque_98dba0_timer_x264ec_bits);
      events->frame_opaque_98dba0_timer_y_bits =
          isaac_game_update_slice_98dba0_timer_axis_bits(
              sin_f32_bits, mag_bits,
              runtime_inputs->frame_opaque_98dba0_timer_y264f0_bits);
    }
  }

  IsaacFrameOpaque98dba0State pure = {};
  pure.mode = state->frame_opaque_98dba0_mode;
  pure.flag = static_cast<int8_t>(
      static_cast<uint8_t>(state->frame_opaque_98dba0_flag & 0xffu));
  pure.counter = state->frame_opaque_98dba0_counter;
  /* IsaacFrameOpaque98dba0State stores the two floats as RAW BITS
     (uint32_t fields); the update-state members are floats, so both
     directions must bit-cast — implicit float→uint32 would truncate
     0.5f to 0 and uint32→float would inflate 0x3dcccccd to 1036831949,
     which the clamp then snaps to 1.0f (the observed 0→1 jump). */
  pure.float_170 = __builtin_bit_cast(uint32_t, state->frame_opaque_98dba0_float_170);
  pure.float_2d0 = __builtin_bit_cast(uint32_t, state->frame_opaque_98dba0_float_2d0);
  const int32_t fallthrough = isaac_frame_opaque_98dba0_mode_float_step(
      &pure, bvar2, runtime_inputs->frame_opaque_98dba0_manager_2a35c);
  state->frame_opaque_98dba0_mode = pure.mode;
  state->frame_opaque_98dba0_flag =
      static_cast<uint32_t>(static_cast<uint8_t>(pure.flag));
  state->frame_opaque_98dba0_counter = pure.counter;
  state->frame_opaque_98dba0_float_170 =
      __builtin_bit_cast(float, pure.float_170);
  state->frame_opaque_98dba0_float_2d0 =
      __builtin_bit_cast(float, pure.float_2d0);

  /* PE 0x0098df54 `cmp byte [ecx+0x216e9],0` is a FRESH guest-memory read and
     0x00746560 writes that byte at 0x00840b9c earlier in the same call, but the
     two are provably mutually exclusive, so the capture is correct and this is
     NOT a stale fold. The counter tail needs `bl != 0` (0x0098de34
     `test bl,bl` / `je`); every predecessor of the gate label 0x0098df47 needs
     `bl == 0` — 0x0098df43 `jne` (mode >= 3), 0x0098e157 `je` (modes 0 and 2),
     and the mode-1 exits 0x0098e06c / 0x0098e089. Nothing between 0x0098de34
     and 0x0098df43 writes ebx: the timer block only calls 0x006eef60 (which
     never touches ebx through its ret at 0x006eefa9) and the two 0x0041d5xx
     float wrappers. Do not "fix" this into a post-call read. */
  if (fallthrough != 0 &&
      (runtime_inputs->frame_opaque_98dba0_game_216e9 & 0xffu) == 0u) {
    /* ABI v55: the HUD_Message::text_out decision is translated. The sprite
       play itself (0x40a5d0 Sprite::Play "TextOut" on this+0x20, then
       0x40a1b0 AnimationState::Rewind on this+0x50) is an ANM2-family host
       action; the event counts it and the byte write this+0x64 = 1 is the
       pure post-state (PE executes it when the play returns nonzero, which
       only fails on the console-warn path). */
    if (isaac_game_update_slice_hud_message_text_out_need(
            state->hud_message_flag_8,
            runtime_inputs->hud_message_text_ptr_54,
            state->hud_message_played_64,
            runtime_inputs->hud_message_text_words_0,
            runtime_inputs->hud_message_text_words_1) != 0) {
      events->hud_message_text_out += 1;
      state->hud_message_played_64 = 1u;
    }
  }

  float f170 = state->frame_opaque_98dba0_float_170;
  float f2d0 = state->frame_opaque_98dba0_float_2d0;
  isaac_frame_opaque_98dba0_clamp_floats(&f170, &f2d0);
  state->frame_opaque_98dba0_float_170 = f170;
  state->frame_opaque_98dba0_float_2d0 = f2d0;
}
}  // namespace

extern "C" int32_t isaac_game_update_slice_resume_98dba0_player_walk(
    IsaacGameUpdateSliceState* state,
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs,
    IsaacGameUpdateSliceEvents* events) {
  if (state == nullptr || runtime_inputs == nullptr || events == nullptr ||
      events->continuation_kind !=
          ISAAC_GAME_UPDATE_RESUME_AFTER_98DBA0_PLAYER_WALK) {
    return 0;
  }

  apply_98dba0_after_player_walk(state, runtime_inputs, events);

  /* ABI v95 (record idx 32): FUN_00956110 phone-home probe pure-decision
     proof. The host walk calls FUN_00956110 at BOTH sites (0x98dcb5 /
     0x98ddcd) and captures per-edge samples (the site id is
     events->frame_opaque_98dba0_site). When the capture is ready
     (_956110_ready != 0) the composed law decides the probe outcome; a
     PURE decision (net-early byte law OR the id==-1 walk fold with a
     complete capture) publishes probe_pure. ready=0 keeps the pre-v95
     always-host probe with no proof event. The platform IO tail 0x864c30,
     the walk-path [[entry]+0x30] dispatch, and the general callback
     0xa20940 dispatch stay typed-host (result_plan.host_*). */
  if (runtime_inputs->frame_opaque_98dba0_956110_ready != 0u) {
    IsaacGameUpdateSlice956110Result probe;
    isaac_game_update_slice_98dba0_956110_result_plan(
        &probe, runtime_inputs->frame_opaque_98dba0_956110_manager_mode,
        runtime_inputs->frame_opaque_98dba0_956110_global_c71690,
        runtime_inputs->frame_opaque_98dba0_956110_mp_begin,
        runtime_inputs->frame_opaque_98dba0_956110_mp_end,
        runtime_inputs->frame_opaque_98dba0_956110_arg2,
        runtime_inputs->frame_opaque_98dba0_956110_net_host_ok,
        runtime_inputs->frame_opaque_98dba0_956110_net_out_byte,
        runtime_inputs->frame_opaque_98dba0_956110_vtable_results,
        runtime_inputs->frame_opaque_98dba0_956110_vtable_count,
        runtime_inputs->frame_opaque_98dba0_956110_general_result);
    if (probe.pure != 0) {
      events->frame_opaque_98dba0_956110_probe_pure = 1;
    }
  }

  /* ABI v99 (record idx 5/32): entity-surface accept pure-proof. The host
     captures the per-matched-entry surface at the walk seam (ready latch
     @14328 + 8x44 B blobs @14332..14684); ready=0 publishes nothing and
     the walk keeps the pre-pack edge. Slot 0 = the first matched entry;
     a KNOWN class with a complete blob makes the accept prediction PURE
     even though the virtual dispatch stays typed-host. */
  if (runtime_inputs->frame_opaque_98dba0_entity_surface_ready != 0u) {
    IsaacGameUpdateSliceEntitySurfacePlan es_plan;
    isaac_game_update_slice_entity_surface_plan(
        &es_plan,
        &runtime_inputs->frame_opaque_98dba0_entity_surface_capture[0]);
    if (es_plan.pure != 0) {
      events->frame_opaque_98dba0_entity_surface_accept_pure = 1;
    }
  }

  if (events->frame_opaque_98dba0_site ==
      ISAAC_FRAME_OPAQUE_98DBA0_SITE_GATE_1B83C) {
    /* Safe site: post-player-walk recapture; hybrid refills HUD inputs. */
    maybe_emit_hud_post_update(state, runtime_inputs, events);
    events->continuation_kind = ISAAC_GAME_UPDATE_RESUME_AFTER_GATE_1B83C_UPDATES;
  } else {
    apply_frame_opaque_4212c0_pure(state, runtime_inputs, events);
    events->continuation_kind = ISAAC_GAME_UPDATE_RESUME_AFTER_FRAME_AUX_UPDATES;
  }
  return 1;
}

extern "C" int32_t isaac_game_update_slice_resume_engine_prefix(
    IsaacGameUpdateSliceState* state,
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs,
    IsaacGameUpdateSliceEvents* events) {
  if (state == nullptr || runtime_inputs == nullptr || events == nullptr ||
      events->continuation_kind != ISAAC_GAME_UPDATE_RESUME_AFTER_ENGINE_PREFIX) {
    return 0;
  }
  const int32_t site_anim = events->engine_site_anim;
  /* Pure setup (incl. Game+0x1bb74=0) then player-loop body residual when
     !early_skip and engine_player_count > 0. Empty player vector is pure-
     complete after setup (empty loop + pure 1bb74 write). Anim-0x12 SFX
     unreachable on Update sites (anim 20 / 0).
     ABI v35: when engine_player_blob_ready and count fits MAX, pure float
     resets for eligible entries.
     ABI v36: body host residual only if any eligible AND pure
     player_loop_needs_host(field_1c/anim) — FUN_0082eb90 predicate or
     anim==0x14 (7abe20). Update anim 0 is pure-complete for those hosts;
     anim 20 emits 7abe20 residual only. When blob not ready, full body
     residual (hosts+floats) as v34. */
  if (isaac_room_transition_engine_82ee40_early_skip_setup(state->gate_1ba78,
                                                           site_anim) == 0) {
    apply_engine_setup_pure(state, runtime_inputs, site_anim);
    const int32_t player_count = runtime_inputs->engine_player_count;
    if (player_count > 0) {
      if (runtime_inputs->engine_player_blob_ready != 0 &&
          player_count <= ISAAC_ENGINE_PLAYER_MAX) {
        const int32_t any_eligible = apply_engine_player_float_resets_pure(player_count);
        /* ABI v95 (record idx 22): when the host also sampled the per-entry
           byte-0x173 gate lanes (engine_player_entry_173_ready), the module
           decides PER ENTRY which host body the machine fires (0x7abcc0 /
           0x7abe20) via the pre-call laws and publishes typed counts; the
           coarse edge then fires only when some eligible entry actually
           needs a host call. ready=0 keeps the exact pre-v95 v36 gate
           (any eligible && player_loop_needs_host). */
        if (runtime_inputs->engine_player_entry_173_ready != 0u) {
          uint32_t abcc0_calls = 0u;
          uint32_t abe20_calls = 0u;
          const uint32_t predicate = (uint32_t)isaac_game_update_slice_82ee40_body_predicate(
              (uint32_t)state->engine_field_1c);
          for (int32_t i = 0; i < player_count; ++i) {
            if (scratch_engine_player_eligible[i] == 0) {
              continue;
            }
            IsaacGameUpdateSlice82ee40BodyEntryPlan plan = {};
            isaac_game_update_slice_82ee40_body_entry_plan(
                /*eligible=*/1u, predicate,
                runtime_inputs->engine_player_entry_173[i],
                (uint32_t)state->engine_field_1c,
                (uint32_t)site_anim, &plan);
            abcc0_calls += (uint32_t)plan.call_7abcc0;
            abe20_calls += (uint32_t)plan.call_7abe20;
          }
          events->opaque_room_transition_engine_body_7abcc0_calls = abcc0_calls;
          events->opaque_room_transition_engine_body_7abe20_calls = abe20_calls;
          if (abcc0_calls != 0u || abe20_calls != 0u) {
            events->opaque_room_transition_engine_body += 1;
          }
        } else if (any_eligible != 0 &&
                   isaac_room_transition_engine_player_loop_needs_host(
                       state->engine_field_1c) != 0) {
          events->opaque_room_transition_engine_body += 1;
        }
      } else {
        events->opaque_room_transition_engine_body += 1;
      }
    }
  }
  events->continuation_kind =
      site_anim == 20 ? ISAAC_GAME_UPDATE_RESUME_AFTER_ROOM_TRANSITION_EFFECT
                      : ISAAC_GAME_UPDATE_RESUME_AFTER_ROOM_CLEAR_NESTED;
  return 1;
}

extern "C" int32_t isaac_game_update_slice_resume_room_transition_effect(
    IsaacGameUpdateSliceState* state,
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs,
    IsaacGameUpdateSliceEvents* events) {
  if (state == nullptr || events == nullptr ||
      events->continuation_kind != ISAAC_GAME_UPDATE_RESUME_AFTER_ROOM_TRANSITION_EFFECT) {
    return 0;
  }
  /* Host applied engine body residual (if any) without pure start-state / P4
     and recaptured sparse Game fields. Site A anim=20. */
  apply_frame_effect_6fd7c0_pure_after_host(state, runtime_inputs, 20);
  /* ABI v45: pass runtime for B1 wire_decide (default packs → MONOLITHIC). */
  continue_to_frame_manager_updates(state, runtime_inputs, events);
  return 1;
}

namespace {
float float_abs_bits(float value) {
  const uint32_t bits = __builtin_bit_cast(uint32_t, value) & kFloatAbsMask;
  return __builtin_bit_cast(float, bits);
}

/* ABI v49 pure tail list sweep of VA 0x006fbb44…0x006fbba3.

   Machine control flow (Game+0x6772c is the list object; _Myhead at +0x6772c,
   _Mysize at +0x67730):

     0x006fbb2f  cmp dword [game+0x67730], 0
     0x006fbb36  je  0x006fbba5              ; _Mysize == 0 skips the whole loop
     0x006fbb38  mov eax, [game+0x6772c]     ; _Myhead (sentinel)
     0x006fbb3e  mov esi, [eax]              ; first node
     0x006fbb40  cmp esi, eax
     0x006fbb42  je  0x006fbba5              ; empty list skips the whole loop
     0x006fbb44  mov eax, [esi+0xc]          ; node countdown
     0x006fbb47  test eax, eax
     0x006fbb49  jne 0x006fbb95
                 ; countdown == 0: unlink (prev/next fixups at 0x006fbb4b…),
                 ; dec [game+0x67730] at 0x006fbb60, then 0x004147f0 /
                 ; 0x00426980 / 0x00423020 / 0x0042f240 and
                 ; operator delete(node, 0x40) through 0x00aef15c.
     0x006fbb95  jle 0x006fbb9b              ; test cleared OF, so jle is
                                             ; eax <= 0; eax != 0 here, so the
                                             ; taken edge is strictly negative
     0x006fbb97  dec eax
     0x006fbb98  mov [esi+0xc], eax          ; only strictly positive decrements
     0x006fbb9b  mov esi, [esi]              ; advance to _Next
     0x006fbb9d  cmp esi, [game+0x6772c]
     0x006fbba3  jne 0x006fbb44

   Every node is visited exactly once in _Next order and the eviction set is
   fixed by the pre-loop countdowns: `_Next` is latched at 0x006fbb4e before any
   destructor runs, the four destructors are vector _Tidy heap frees over the
   node's own subobjects, and the loop never reloads _Mysize (only decrements
   it). So the sweep is a single linear pass with no post-call predicate and
   needs no continuation.

   Returns the number of evicted nodes. `timers_out[i]` receives the post-loop
   countdown for surviving nodes; evicted slots hold 0 (their storage is freed
   by the residual). `dec` cannot wrap here because the branch guarantees a
   strictly positive input. The law itself now lives in the frozen
   frame-opaque v31 contract (isaac_frame_opaque_list6772c_sweep) and is
   consumed by reference at the blob path below (ABI v78). */
void continue_after_frame_manager_updates(
    IsaacGameUpdateSliceState* state,
    const IsaacGameUpdateSliceConstants* constants,
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs,
    IsaacGameUpdateSliceEvents* events) {
  if (state->fade_counter_26514 < 1) {
    float next = state->fade_progress_26518 - constants->fade_out_step;
    state->fade_progress_26518 = next;
    if (next < 0.0f) {
      state->fade_progress_26518 = 0.0f;
    }
  } else {
    float next = state->fade_progress_26518 + constants->fade_in_step;
    state->fade_progress_26518 = next;
    if (constants->fade_complete < next) {
      state->fade_progress_26518 = constants->fade_complete;
    }
    state->fade_counter_26514 -= 1;
  }

  const float current = state->shake_current_67738;
  float target = state->shake_target_6773c;
  if (current != target) {
    const float step = state->shake_step_67740;
    if (step < float_abs_bits(current - target)) {
      if (target <= current) {
        target = current - step;
      } else {
        target = step + current;
      }
    }
    state->shake_current_67738 = target;
  }

  if (state->timer_269e0 > 0) {
    state->timer_269e0 -= 1;
  }

  /* Safe site: only pure fade/shake/timer precede HUD on this resume. */
  maybe_emit_hud_post_update(state, runtime_inputs, events);
  /* ABI v49 tail list sweep. The PE guard is `_Mysize != 0` (not > 0) followed
     by the sentinel-equality check, so a non-positive count can only reach the
     monolithic residual. */
  if (state->list_count_67730 != 0) {
    const int32_t count = state->list_count_67730;
    const uint32_t blob_ready =
        runtime_inputs != nullptr ? runtime_inputs->update_list_blob_ready : 0u;
    if (blob_ready != 0 && count > 0 && count <= ISAAC_UPDATE_LIST_MAX_NODES) {
      /* ABI v78: the sweep law is consumed BY REFERENCE from the frozen
       frame-opaque v31 contract (isaac_frame_opaque_list6772c_sweep) —
       timers_out + per-slot evict flags in one call. Contract: count in
       [1, ISAAC_UPDATE_LIST_MAX_NODES] (the blob gate above already
       enforces it), so the export's -1 out-of-contract answer cannot
       occur here. PE evidence (VA 0x006fbb2f..0x006fbba3): _Mysize != 0
       guard, sentinel-equality empty check, `_Next` latched before any
       destructor (0x006fbb4e) so the eviction set is fixed by the
       pre-loop countdowns, `dec [game+0x67730]` once per evicted node. */
    const int32_t evicted = isaac_frame_opaque_list6772c_sweep(
        runtime_inputs->update_list_timers, count,
        scratch_update_list_timers_out, scratch_update_list_evict_flags);
      /* Pure owns the _Mysize arithmetic: the loop decrements it once per
         evicted node and never reads it back. */
      state->list_count_67730 = count - evicted;
      if (evicted > 0) {
        events->list_update_6772c += 1;
        events->list_update_6772c_free += (uint32_t)evicted;
      }
    } else {
      events->list_update_6772c += 1;
    }
  }
  /* ABI v57: LuaEngine frame-unref 0x008607a0 — the last sequential host
     call (PE 0x006fbba5). When the hybrid host supplied the flag byte
     (lua_frame_unref_ready) and bit 1 is CLEAR, the PE `test byte ptr
     [eax],2 ; je skip` (0x008607b6) makes the whole residual a complete
     no-op (only stack locals written before the gate) and the call is
     dropped. Otherwise the host executes the materialize residual
     FUN_00872980 + luaL_unref pair. ready=0 keeps the pre-v57 behavior.
     ABI v95: on the captured SET arm only (ready!=0 && bit 1 set, PE
     0x008607e7 LOW-BYTE test — 0x100/0x300 stay dropped) the typed event
     additionally publishes the set-arm call-ARG prep: LUA_REGISTRYINDEX
     0xfff0b9d8, nargs 2, nresults 1, pcallk context 0 (errfunc/ctx/k) and
     the two pushed call args 1 / 0xffffffff (PE 0x8607d1/0x8607d8 +
     materialize 0x872996/0x8729c0..c8). The pcallk stays typed-host: the
     registry-indexed fn is mod bytecode with game-API side effects; its
     key (P[4]) and lua_State are host-time reads. ready==0 (monolith)
     leaves the prep words 0 (family "ready=0 never sets vNN" rule). */
  const uint32_t lua_unref_ready =
      runtime_inputs != nullptr ? runtime_inputs->lua_frame_unref_ready : 0u;
  const uint32_t lua_unref_set =
      runtime_inputs != nullptr && (runtime_inputs->lua_frame_unref_flag_byte & 2u) != 0u
          ? 1u
          : 0u;
  if (lua_unref_ready == 0u || lua_unref_set != 0u) {
    events->opaque_call_008607a0 += 1;
  }
  if (lua_unref_ready != 0u && lua_unref_set != 0u) {
    events->opaque_call_008607a0_args_registry_index = 0xfff0b9d8u;
    events->opaque_call_008607a0_args_nargs = 2u;
    events->opaque_call_008607a0_args_nresults = 1u;
    events->opaque_call_008607a0_args_pcallk_context = 0u;
    events->opaque_call_008607a0_args_arg1 = 1u;
    events->opaque_call_008607a0_args_arg2 = 0xffffffffu;
  }
  events->continuation_kind = ISAAC_GAME_UPDATE_RETURN_AFTER_GAME_UPDATE;
}
}

extern "C" int32_t isaac_game_update_slice_resume_room_update_prefix_b1(
    IsaacGameUpdateSliceState* state,
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs,
    IsaacGameUpdateSliceEvents* events) {
  if (state == nullptr || runtime_inputs == nullptr || events == nullptr ||
      events->continuation_kind != ISAAC_GAME_UPDATE_RESUME_AFTER_ROOM_UPDATE_PREFIX_B1) {
    return 0;
  }
  /* Host already applied B1 (first-frame special-room setup ~0x00802a40…~0x00802e20).
     ABI v95 (record idx 14): on the ready path the B2 resume owns the whole
     item-pool/spawn special body in-module (laws + typed leaves), so the
     parent counter opaque_room_update_prefix_b2 must NOT fire; ready=0
     keeps the pre-v95 monolithic host residual (parent counter +1). */
  (void)state;
  if (runtime_inputs->b2_pool_ready == 0u) {
    events->opaque_room_update_prefix_b2 += 1;
  }
  events->continuation_kind = ISAAC_GAME_UPDATE_RESUME_AFTER_ROOM_UPDATE_PREFIX_B2;
  return 1;
}

/* ---- ABI v95 (record idx 14 opaqueRoomUpdatePrefixB2) pure laws ----
   Transcribed branch-by-branch from the instruction stream
   (cpu-dump/00802e20.txt + 0080311d.txt + 0049cbf0.txt + 007e90f0.txt;
   PE 0x00802e20..0x00803321). The item-pool selection laws (pool id /
   special gates) + the set-to-60 timer law land here; the pool/alloc
   calls stay TYPED-HOST (spawn 0x00428b20 x2, genrand 0x006eef60,
   0x00733610, fatal logs 0x00a112c0). Do NOT derive from the C++. */

extern "C" int32_t isaac_game_update_slice_b2_pool_special_gate(
    uint32_t timer7764, uint32_t game18304) {
  /* PE 0x802e2b test/js (timer<0 skips ALL incl. countdown), 0x802e33 jne
     (timer!=0 -> countdown only), 0x802e39 cmp dword [Game+0x18304],-0xc
     / 0x802e40 jne: the special body opens ONLY on timer==0 &&
     game18304==0xfffffff4 (FULL-DWORD, WIDE 0x10000004 must NOT open). */
  return (timer7764 == 0u && game18304 == 0xfffffff4u) ? 1 : 0;
}

extern "C" int32_t isaac_game_update_slice_b2_collectible_bounds_log_needed(
    int32_t count) {
  /* PE 0x802e60 cmp ecx,0x26e / 0x802e66 jg skip (SIGNED): the 0xa112c0
     "Collectible ID out of bounds!" log fires when count <= 622, where
     count = (end-begin) SAR 4. A count of 0x100 = 256 fires; a count of
     0x1000 = 4096 does not. */
  return count <= 0x26e ? 1 : 0;
}

extern "C" uint32_t isaac_game_update_slice_b2_last_collectible_offset(
    int32_t count) {
  /* PE 0x802e8d..0x802e9b: eax = count-1; edx = 0x26e; cmp eax,edx;
     cmovb edx,eax (UNSIGNED below) -> off = min_u((u32)(count-1), 0x26e);
     shl edx,4. count 0 -> (u32)-1 = 0xffffffff is NOT < 0x26e -> off =
     0x26e (begin+9968); count 1..622 -> (count-1)*16; count >= 623 ->
     0x26e*16 (the ready path requires count>=1 so the seed struct is
     captured from a valid location). */
  const uint32_t cm1 = (uint32_t)(count - 1);
  const uint32_t off = cm1 < 0x26eu ? cm1 : 0x26eu;
  return off * 0x10u;
}

extern "C" uint32_t isaac_game_update_slice_b2_rng_xorshift(
    uint32_t seed, uint32_t s1, uint32_t s2, uint32_t s3) {
  /* PE 0x7e910f..0x7e912a (FUN_007e90f0) + 0x8031db..0x803209 (spawn
     loop): seed ^= seed>>(s1&31); ^= seed<<(s2&31); ^= seed>>(s3&31).
     x86 shr/shl mask the count to 5 bits (cl & 0x1f); the spawn loop's
     shifts come from byte[struct+4/+8/+0xc] of the captured struct. */
  uint32_t v = seed;
  v ^= v >> (s1 & 0x1fu);
  v ^= v << (s2 & 0x1fu);
  v ^= v >> (s3 & 0x1fu);
  return v;
}

extern "C" int32_t isaac_game_update_slice_b2_rng_zero_log_needed(
    uint32_t seed) {
  /* PE 0x7e90f5 test edx,edx / jne + 0x8031c1 test edx,edx / jne: seed==0
     fires the 0xa112c0 "RNG Seed is zero!" log (0xb6bf54) BEFORE the
     advance. FULL-DWORD test (0x100 is NOT zero). */
  return seed == 0u ? 1 : 0;
}

extern "C" uint32_t isaac_game_update_slice_b2_pool_aggregate(
    const uint16_t* counts, uint32_t* out_ids, int32_t* out_weights) {
  /* PE 0x802ef7..0x802f73: for id 0..30 (loop `cmp esi,0x1f` / jb):
     w = (i16)counts[id] (movzx then SIGNED jle -> skip when <= 0, so
     0x8000=-32768 skips); linear-search the local {id u32, weight i32}
     list (8 B stride, `cmp [ecx+eax*8],esi` / je); found -> weight += w
     (i32 add), if ((i32)result < 0) weight = 0 (add/jns/mov 0 — the
     overflow clamp); else append {id, w}. any flag == (n > 0) (both the
     found and append paths set it at LAB_00802f59). Returns entry count. */
  if (counts == nullptr || out_ids == nullptr || out_weights == nullptr) {
    return 0u;
  }
  uint32_t n = 0u;
  for (uint32_t id = 0u; id < ISAAC_GAME_UPDATE_B2_POOL_COUNT; ++id) {
    const int16_t w = (int16_t)counts[id];
    if (w <= 0) continue;
    const int32_t w32 = (int32_t)w; /* movsx */
    uint32_t j = 0u;
    for (; j < n; ++j) {
      if (out_ids[j] == id) break;
    }
    if (j < n) {
      const int32_t new_w = out_weights[j] + w32;
      out_weights[j] = (new_w < 0) ? 0 : new_w;
    } else {
      out_ids[n] = id;
      out_weights[n] = w32;
      ++n;
    }
  }
  return n;
}

extern "C" uint32_t isaac_game_update_slice_b2_pool_pick(
    uint32_t seed1, const uint32_t* ids, const int32_t* weights, uint32_t n,
    int32_t* out_total) {
  /* FUN_0049cbf0 (cpu-dump 0049cbf0.txt, ret 0x10, this = list).
     total = SUM weights mod 2^32 (SSE2 lanes associate freely). seed1==0
     -> 0xb6bf54 fatal (dead on the ready path: 0x7e90f0 logs first).
     draw_seed = xorshift(seed1, 5, 9, 7) BY VALUE (the [ebp+8] write-back
     is a dead store into the caller's arg slot). draw = total ?
     draw_seed % total : 0 (UNSIGNED div ebx). Walk: cum += weights[i]
     (i32 wrap); if ((i32)draw < (i32)cum) return ids[i] (SIGNED jl
     0x49cd54). Not found: if ((i32)total > 0) return 0 (0x49cd60 jg), else
     the 0xb1e650 fatal + return 0 (0x49cd62). Never returns 0xffffffff
     (the caller's -1 check is machine-dead, kept faithful at the wire). */
  uint32_t total = 0u;
  for (uint32_t i = 0u; i < n; ++i) {
    total += (uint32_t)weights[i];
  }
  if (out_total != nullptr) *out_total = (int32_t)total;
  uint32_t draw = 0u;
  if (total != 0u) {
    const uint32_t draw_seed =
        isaac_game_update_slice_b2_rng_xorshift(seed1, 5u, 9u, 7u);
    draw = draw_seed % total;
  }
  int32_t cum = 0;
  for (uint32_t i = 0u; i < n; ++i) {
    cum += weights[i];
    if ((int32_t)draw < cum) return ids[i];
  }
  return 0u; /* total>0 -> 0 (0x49cd71); total==0 -> 0xb1e650 fatal (0x49cd62) */
}

extern "C" uint32_t isaac_game_update_slice_b2_pool_count_dec_word(
    uint32_t count_word) {
  /* PE 0x803080 dec word ptr [..+esi*2+0x1af30]: u16 wrap (0 -> 0xffff). */
  return (count_word - 1u) & 0xffffu;
}

extern "C" int32_t isaac_game_update_slice_b2_spawn_qualify(
    uint32_t flag8, uint32_t d4, uint32_t w4_4, uint32_t w4_6) {
  /* PE 0x803130 cmp byte [elem+8],1 / jne (BYTE); 0x80313d cmp dword
     [elem+4],5 / jne (FULL-DWORD); 0x803146 cmp word [elem+4+4],0x64 /
     jne; 0x803151 cmp word [elem+4+6],0 / jne. */
  return ((flag8 & 0xffu) == 1u && d4 == 5u && (w4_4 & 0xffffu) == 100u &&
          (w4_6 & 0xffffu) == 0u)
             ? 1
             : 0;
}

extern "C" uint32_t isaac_game_update_slice_b2_spawn_grid_index(
    uint32_t x_s16, uint32_t y_s16, uint32_t width) {
  /* PE 0x80315c movsx ecx,word [elem+2] (y); inc ecx; imul ecx,
     [Room+0xc] (32-bit wrap); 0x803160 movsx eax,word [elem] (x);
     inc eax; add eax,ecx -> u32 grid = (x+1) + ((y+1)*width). */
  const int32_t x = (int32_t)(int16_t)x_s16;
  const int32_t y = (int32_t)(int16_t)y_s16;
  return (uint32_t)(x + 1) + (uint32_t)((y + 1) * (int32_t)width);
}

static int32_t b2_signed_idiv_rem(int32_t index, int32_t width) {
  /* x86 idiv (cdq) semantics: trunc-toward-zero remainder. int64 math
     avoids C++ UB on INT_MIN/-1 (x86 raises #DE there; the wire's width
     is the live Room+0xc, positive — documented approximation). */
  if (width == -1) return 0; /* #DE case: no defined value */
  return (int32_t)((int64_t)index % (int64_t)width);
}

static int32_t b2_signed_idiv_quot(int32_t index, int32_t width) {
  if (width == -1) return 0;
  return (int32_t)((int64_t)index / (int64_t)width);
}

extern "C" uint32_t isaac_game_update_slice_b2_pos_x(uint32_t index,
                                                     uint32_t width) {
  /* PE 0x803177 add eax,ecx (grid); 0x803179 cdq; 0x80317a idiv
     [Room+0xc] -> edx = SIGNED rem; 0x803197 cvtdq2ps xmm1; 0x80319d
     mulss xmm1,[0xbaa904] (40.0f); 0x8031a5 addss xmm1,[0xbaa904] ->
     f32 x = rem*40+40 (each op rounds to f32). Returns float bits. */
  const int32_t rem = b2_signed_idiv_rem((int32_t)index, (int32_t)width);
  const float v = (float)rem * 40.0f + 40.0f;
  return __builtin_bit_cast(uint32_t, v);
}

extern "C" uint32_t isaac_game_update_slice_b2_pos_y(uint32_t index,
                                                     uint32_t width) {
  /* PE 0x80317a idiv -> eax = SIGNED quot; 0x80319a cvtdq2ps xmm0;
     0x8031a1 mulss xmm0,[0xbaa904] (40.0f); 0x8031a9 addss xmm0,
     [0xbaaa00] (120.0f) -> f32 y = quot*40+120. Returns float bits. */
  const int32_t quot = b2_signed_idiv_quot((int32_t)index, (int32_t)width);
  const float v = (float)quot * 40.0f + 120.0f;
  return __builtin_bit_cast(uint32_t, v);
}

extern "C" int32_t isaac_game_update_slice_b2_spawn2_gate(
    uint32_t room_active_byte, uint32_t frame264f8, uint32_t room_entry_11f0) {
  /* PE 0x8032b2 cmp byte [edi],0 / je skip (BYTE active test);
     0x8032bc mov eax,[Game+0x264f8]; 0x8032c2 sub eax,[Room+0x11f0];
     0x8032c8 cmp eax,4; 0x8032cb jle skip -> spawn2 when
     (i32)(frame-entry) > 4 (SIGNED). */
  if ((room_active_byte & 0xffu) == 0u) return 0;
  return (int32_t)(frame264f8 - room_entry_11f0) > 4 ? 1 : 0;
}

extern "C" int32_t isaac_game_update_slice_resume_room_update_prefix_b2(
    IsaacGameUpdateSliceState* state,
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs,
    IsaacGameUpdateSliceEvents* events) {
  if (state == nullptr || runtime_inputs == nullptr || events == nullptr ||
      events->continuation_kind != ISAAC_GAME_UPDATE_RESUME_AFTER_ROOM_UPDATE_PREFIX_B2) {
    return 0;
  }
  /* ABI v95 (record idx 14): the item-pool/spawn special + set-to-60 body
     (PE 0x00802e20..0x00803321) runs IN-MODULE when b2_pool_ready (the
     host vouches the captures — see the runtime-input comment + NOTES.md;
     the B1 resume already skipped the parent counter in that case). The
     module owns: special gate, count-bounds fatal law, seed1 advance,
     pool aggregation, pure pick, count-decrement carrier, set-to-60
     terminal write, and the spawn-loop qualifier/grid/RNG/position laws
     into the out-scratch. The spawn/alloc calls stay TYPED-HOST (spawn
     0x00428b20 x2, genrand 0x006eef60, 0x00733610, fatal logs
     0x00a112c0). ready=0 -> pre-v95 monolithic (parent counter from B1). */
  if (runtime_inputs->b2_pool_ready != 0u) {
    const uint32_t timer = (uint32_t)state->room_collectible_timer_7764;
    if (isaac_game_update_slice_b2_pool_special_gate(
            timer, runtime_inputs->b2_pool_gate_18304) != 0) {
      events->b2_special_gate_open = 1u;
      const int32_t count = (int32_t)runtime_inputs->b2_player_col_count;
      if (isaac_game_update_slice_b2_collectible_bounds_log_needed(count) !=
          0) {
        events->b2_fatal_collectible_bounds = 1u;
      }
      uint32_t seed = runtime_inputs->b2_pool_seed_0;
      if (isaac_game_update_slice_b2_rng_zero_log_needed(seed) != 0) {
        events->b2_fatal_rng_zero += 1u;
      }
      seed = isaac_game_update_slice_b2_rng_xorshift(
          seed, runtime_inputs->b2_pool_seed_1, runtime_inputs->b2_pool_seed_2,
          runtime_inputs->b2_pool_seed_3);
      events->b2_spawn_seed1 = seed;
      const uint32_t n = isaac_game_update_slice_b2_pool_aggregate(
          runtime_inputs->b2_pool_counts, scratch_b2_pool_ids,
          scratch_b2_pool_weights);
      if (n == 0u) {
        /* any==0 -> SET-60 (PE 0x802fe9); the next resume's already-pure
           countdown decs 60 -> 59 exactly like PE 0x803321. */
        state->room_collectible_timer_7764 = 0x3c;
        events->b2_pick_pool = 0xffffffffu;
      } else {
        int32_t total = 0;
        const uint32_t picked = isaac_game_update_slice_b2_pool_pick(
            seed, scratch_b2_pool_ids, scratch_b2_pool_weights, n, &total);
        if (total == 0) {
          events->b2_fatal_pick_empty = 1u;
        }
        events->b2_pick_pool = picked;
        if (picked == 0xffffffffu) {
          /* Machine-dead path (the pick never returns -1); kept faithful:
             SET-60 + countdown (PE 0x8030f1). */
          state->room_collectible_timer_7764 = 0x3c;
        } else {
          /* Spawn loop (PE 0x803122..0x803320) over the captured element
             array; per QUALIFYING element the module advances the shared
             seed and fills the out-scratch plan. */
          const uint32_t elem_count = runtime_inputs->b2_spawn_count;
          const uint32_t cap =
              elem_count <= ISAAC_GAME_UPDATE_B2_SPAWN_MAX_ELEMS
                  ? elem_count
                  : ISAAC_GAME_UPDATE_B2_SPAWN_MAX_ELEMS;
          uint32_t plan_count = 0u;
          for (uint32_t i = 0u; i < cap; ++i) {
            const uint8_t* e = scratch_b2_spawn_in + (size_t)i * 16u;
            const uint16_t ex =
                (uint16_t)((uint16_t)e[0] | (uint16_t)(e[1] << 8));
            const uint16_t ey =
                (uint16_t)((uint16_t)e[2] | (uint16_t)(e[3] << 8));
            const uint32_t flag8 = e[4];
            const uint32_t d4 = read_u32(e + 8);
            const uint16_t w44 =
                (uint16_t)((uint16_t)e[12] | (uint16_t)(e[13] << 8));
            const uint16_t w46 =
                (uint16_t)((uint16_t)e[14] | (uint16_t)(e[15] << 8));
            if (isaac_game_update_slice_b2_spawn_qualify(flag8, d4, w44, w46) ==
                0) {
              continue;
            }
            const uint32_t grid = isaac_game_update_slice_b2_spawn_grid_index(
                ex, ey, runtime_inputs->b2_grid_width);
            if (isaac_game_update_slice_b2_rng_zero_log_needed(seed) != 0) {
              events->b2_fatal_rng_zero += 1u;
            }
            seed = isaac_game_update_slice_b2_rng_xorshift(
                seed, runtime_inputs->b2_pool_seed_1,
                runtime_inputs->b2_pool_seed_2,
                runtime_inputs->b2_pool_seed_3);
            const uint32_t x_bits = isaac_game_update_slice_b2_pos_x(
                grid, runtime_inputs->b2_grid_width);
            const uint32_t y_bits = isaac_game_update_slice_b2_pos_y(
                grid, runtime_inputs->b2_grid_width);
            const uint32_t spawn2 =
                (uint32_t)isaac_game_update_slice_b2_spawn2_gate(
                    runtime_inputs->ambient_room_active,
                    (uint32_t)state->frame_counter_264f8,
                    runtime_inputs->ambient_room_entry_11f0);
            if (plan_count < ISAAC_GAME_UPDATE_B2_SPAWN_MAX_ELEMS) {
              uint8_t* o =
                  scratch_b2_spawn_out + (size_t)plan_count * 24u;
              write_u32(o + 0, x_bits);
              write_u32(o + 4, y_bits);
              write_u32(o + 8, grid);
              write_u32(o + 12, seed);
              write_u32(o + 16, spawn2);
              write_u32(o + 20, 0u);
              ++plan_count;
            }
          }
          events->b2_spawn_plan_count = plan_count;
        }
      }
      events->b2_seed_after = seed;
    }
  }
  /* The B3-B7/B8/B9-B11 residuals below are the ordered prefix AFTER the
     B2 body (ready=0 kept the monolithic B2 residual from the B1 resume).
     ABI v33/v34/v48: ordered prefix B3–B7 wire → pure-gated B8 path-cost →
     B9–B11 wire. Pure B2 countdown is deferred until after these residuals
     because they do not write Room+0x7764. B8 gate: frame_counter_264f8 % 3
     == 0 and room_grid_cells > 0. When room_b8_blob_ready and cells fit the
     scratch cap, pure grid apply mutates scratch costs/trails and skips host
     residual; otherwise gate-open still emits host residual over live Room
     grids.
     ABI v48: B3B7/B9B11 use freestanding wire_decide. Default sparse packs
     (ready=0) force MONOLITHIC parent residual (lockstep prior always-host).
     When packs ready, residual_kind HOST / ALWAYS_HOST; host_needed still 1
     (FCO/manager chain always hosts). Events layout keeps parent counters. */
  {
    const int32_t sparse_ready =
        runtime_inputs->b3b7_sparse_ready != 0 ? 1 : 0;
    if (sparse_ready == 0) {
      /* Pre-v95 monolithic: the host runs the whole B3-B7 residual. */
      IsaacRoomB3B7ResidualPlan b3b7_plan = {};
      isaac_room_b3b7_wire_decide(
          sparse_ready, runtime_inputs->b3b7_te_byte_7321,
          runtime_inputs->b3b7_te_begin, runtime_inputs->b3b7_te_end,
          runtime_inputs->b3b7_desc_type0, runtime_inputs->ambient_room_active,
          state->frame_counter_264f8, runtime_inputs->ambient_room_entry_11f0,
          runtime_inputs->b3b7_tree_count_7238, runtime_inputs->b3b7_width_c,
          runtime_inputs->b3b7_height_10, &b3b7_plan);
      if (b3b7_plan.pure_complete == 0 && b3b7_plan.host_needed != 0) {
        events->opaque_room_update_prefix_b3_b7 += 1;
      }
    } else {
      /* ABI v95 (record idx 15): typed-host B3-B7. The decision laws run
         in-module; each plan counter names one host leaf body the host
         must run (FCO/HCE/challenge/TE-call/lookup/pos/genrand/spawn/
         cleanup/count/grow/vtable/list/fatal). */
      IsaacGameUpdateSliceB3B7Plan b3b7_plan = {};
      isaac_game_update_slice_b3b7_wire(runtime_inputs,
                                        state->frame_counter_264f8,
                                        &b3b7_plan);
      events->b3b7_host_fco += b3b7_plan.b3_host_fco;
      events->b3b7_host_challenge += b3b7_plan.b3_host_challenge;
      events->b3b7_host_te_call += b3b7_plan.b3_host_te_call;
      events->b4_host_lookup += b3b7_plan.b4_host_lookup;
      events->b4_host_pos_a += b3b7_plan.b4_host_pos_a;
      events->b4_host_pos_finish += b3b7_plan.b4_host_pos_finish;
      events->b4_genrand_draws += b3b7_plan.b4_genrand_draws;
      events->b4_host_spawns += b3b7_plan.b4_host_spawns;
      events->b4_host_cleanup += b3b7_plan.b4_host_cleanup;
      events->b4_seed_fatal += b3b7_plan.b4_seed_fatal;
      events->b5_host_count_708250 += b3b7_plan.b5_host_count_708250;
      events->b5_host_vcall48 += b3b7_plan.b5_host_vcall48;
      events->b5_host_grow += b3b7_plan.b5_host_grow;
      events->b5_host_vcall4c += b3b7_plan.b5_host_vcall4c;
      events->b5_seed_fatal += b3b7_plan.b5_seed_fatal;
      events->b6_host_destroy += b3b7_plan.b6_host_destroy;
      events->b6_host_iterate += b3b7_plan.b6_host_iterate;
      events->b6_host_clear += b3b7_plan.b6_host_clear;
      events->b7_host_update += b3b7_plan.b7_host_update;
    }
  }
  const int32_t grid_cells = runtime_inputs->room_grid_cells;
  if (isaac_room_b8_needs_path_cost_host(state->frame_counter_264f8,
                                         grid_cells) != 0) {
    if (runtime_inputs->room_b8_blob_ready != 0 && grid_cells > 0 &&
        grid_cells <= ISAAC_ROOM_B8_MAX_CELLS) {
      isaac_room_b8_path_cost_grid_step(scratch_b8_costs, scratch_b8_trails,
                                        grid_cells);
    } else {
      events->opaque_room_update_prefix_b8 += 1;
    }
  }
  {
    const int32_t inputs_ready =
        runtime_inputs->b9b11_inputs_ready != 0 ? 1 : 0;
    IsaacRoomB9B11ResidualPlan b9b11_plan = {};
    isaac_room_b9b11_wire_decide(
        inputs_ready, runtime_inputs->b9b11_challenge_result_nonzero,
        runtime_inputs->ambient_room_active, state->frame_counter_264f8,
        runtime_inputs->ambient_room_entry_11f0, state->room_type_8,
        state->room_desc_flags_44, runtime_inputs->global_clear_skip_997a,
        runtime_inputs->b9b11_room_byte_11f4, state->room_boss_count_12c8,
        state->room_boss_count_12cc, state->room_boss_snapshot_7224,
        runtime_inputs->b9b11_room_byte_1d0d, runtime_inputs->ambient_room_1d18,
        runtime_inputs->b9b11_room_byte_7321,
        runtime_inputs->b9b11_list_begin_7314,
        runtime_inputs->b9b11_list_end_7318, &b9b11_plan);
    if (b9b11_plan.pure_complete == 0 && b9b11_plan.host_needed != 0) {
      events->opaque_room_update_prefix_b9_b11 += 1;
      if (inputs_ready != 0) {
        /* ABI v95 (record idx 17): typed-host bodies of the B9-B11 residual.
           The B9 free body (0x41af60 lookup + helper/free), the B10
           deathspawn warn (0xa112c0), the B11 manager chain (0x4186c0 /
           0x993a70 / 0x409030 double / 0x83a080 / 0x7eb870 / 0x930820 /
           0x8020d0) and the TempFX camera body (genrand + 0x7df690) STAY
           host; each typed event names one body the host must run. The
           per-node scan sub-laws (tempfx_is_candidate / walk_next /
           walk_continue) + free sub-laws (helper/path/ptr/heap) are
           exported for the host to apply. ready=0 keeps the v48 monolithic
           parent counter only (no typed carriers — family rule). */
        if (isaac_game_update_slice_b9b11_challenge_gate(
                runtime_inputs->b9b11_challenge_result_nonzero,
                runtime_inputs->ambient_room_active,
                (uint32_t)state->frame_counter_264f8,
                runtime_inputs->ambient_room_entry_11f0,
                (uint32_t)state->room_type_8,
                state->room_desc_flags_44) != 0) {
          events->opaque_room_update_prefix_b9_b11_free += 1;
        }
        if (isaac_game_update_slice_b9b11_mode_hooks_needed(
                (uint32_t)state->room_type_8,
                runtime_inputs->global_clear_skip_997a) != 0) {
          events->opaque_room_update_prefix_b9_b11_mode_hooks += 1;
        }
        if (isaac_game_update_slice_b9b11_flag_11f4_needed(
                runtime_inputs->b9b11_room_byte_11f4) != 0) {
          events->opaque_room_update_prefix_b9_b11_flag_11f4 += 1;
        }
        const int32_t b9b11_enemies = isaac_game_update_slice_b9b11_b10_enemies(
            state->room_boss_count_12c8, state->room_boss_count_12cc);
        if (isaac_game_update_slice_b9b11_b10_fatal_needed(
                b9b11_enemies, state->room_boss_snapshot_7224) != 0) {
          events->opaque_room_update_prefix_b9_b11_b10_fatal += 1;
        }
        /* B11 always-host chain: 0x4186c0 / 0x993a70 / 0x83a080 / 0x930820 /
           0x8020d0 run on EVERY ready arm (PE 0x803e70/0x803e7d/0x803f16/
           0x804101/0x80410c unconditional). */
        events->opaque_room_update_prefix_b9_b11_manager += 1;
        if (isaac_game_update_slice_b9b11_tempfx_flag_clear(
                runtime_inputs->b9b11_room_byte_7321) != 0 &&
            isaac_game_update_slice_b9b11_tempfx_list_empty(
                runtime_inputs->b9b11_list_begin_7314,
                runtime_inputs->b9b11_list_end_7318) == 0) {
          /* TempFX camera entry gate (PE 0x803f43..0x803f5e): flag clear
             && list non-empty; the per-node scan + genrand + 0x7df690
             stay host. */
          events->opaque_room_update_prefix_b9_b11_camera += 1;
        }
      }
    }
  }
  events->continuation_kind = ISAAC_GAME_UPDATE_RESUME_AFTER_ROOM_UPDATE_PREFIX;
  return 1;
}

/* ---- ABI v95 (record idx 17 opaqueRoomUpdatePrefixB9B11) pure laws ----
   Transcribed branch-by-branch from section-notes/room-b9b11/
   disasm-803ce5.txt (B9 challenge gate + free body 0x803cfe..0x803dd3,
   B10 deathspawn gate 0x803e0a..0x803e62, B11 mode-hooks/flag/double/
   stage-1a/age1/TempFX decisions 0x803dd9..0x803f8c). All params uint32_t
   (Wasm ABI does not narrow i32); low-byte tests re-narrow in the body.
   Bodies stay typed-host; the wire emits the typed events on the ready arm. */

extern "C" int32_t isaac_game_update_slice_b9b11_challenge_gate(
    uint32_t fco_result_nonzero, uint32_t room_active_byte0,
    uint32_t frame_264f8, uint32_t room_entry_11f0, uint32_t room_type_8,
    uint32_t room_desc_flags_44) {
  /* PE 0x803cfe test eax,eax / je 0x803dd3: FULL-DWORD result test. */
  if (fco_result_nonzero == 0) return 0;
  /* PE 0x803d06 cmp byte [edi],0 / je 0x803dd3: LOW-BYTE active. */
  if ((room_active_byte0 & 0xffu) == 0u) return 0;
  /* PE 0x803d15 mov eax,[Game+0x264f8] / 0x803d1b sub eax,[edi+0x11f0] /
     0x803d21 cmp eax,4 / 0x803d24 jne — signed sub, EXACT equality to 4. */
  if (((frame_264f8 - room_entry_11f0) & 0xffffffffu) != 4u) return 0;
  /* PE 0x803d2a..0x803d30 cmp dword [eax+8],0x11 / jne: FULL-DWORD type. */
  if (room_type_8 != 0x11u) return 0;
  /* PE 0x803d3a..0x803d45 mov eax,[eax+4]; mov eax,[eax+0x44]; shr eax,3;
     test al,1 / jne: LOW-BYTE of ((flags>>3)&1). */
  if (((room_desc_flags_44 >> 3) & 1u) != 0u) return 0;
  return 1;
}

extern "C" int32_t isaac_game_update_slice_b9b11_free_helper_needed(
    uint32_t count) {
  /* PE 0x803d6e cmp dword [ebp-0xa3c],0 / jne 0x803d88: FULL-DWORD. */
  return count == 0u ? 1 : 0;
}

extern "C" int32_t isaac_game_update_slice_b9b11_free_path_needed(
    uint32_t byte0) {
  /* PE 0x803d8f cmp byte [ebp-0xa48],0 / jne 0x803dd3: LOW-BYTE. */
  return (byte0 & 0xffu) == 0u ? 1 : 0;
}

extern "C" int32_t isaac_game_update_slice_b9b11_free_ptr_needed(
    uint32_t ptr) {
  /* PE 0x803db2 test ecx,ecx / je 0x803dcc: ptr != 0. */
  return ptr != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_game_update_slice_b9b11_free_heap_lo(
    uint32_t heap_lo, uint32_t size) {
  /* PE 0x803dbc sub dword [edx],eax: lo' = lo - size (32-bit wrap). */
  return heap_lo - size;
}

extern "C" uint32_t isaac_game_update_slice_b9b11_free_heap_hi(
    uint32_t heap_lo, uint32_t heap_hi, uint32_t size) {
  /* PE 0x803dbf sbb dword [edx+4],0: hi' = hi - borrow; borrow iff
     lo < size (UNSIGNED). */
  return heap_hi - (heap_lo < size ? 1u : 0u);
}

extern "C" int32_t isaac_game_update_slice_b9b11_b10_enemies(
    int32_t count_12c8, int32_t count_12cc) {
  /* PE 0x803e0a mov eax,[edi+0x12c8] / 0x803e10 xor esi,esi /
     0x803e12 add eax,[edi+0x12cc] / 0x803e18 test eax,eax /
     0x803e1a cmovg esi,eax — SIGNED cmovg: esi = sum > 0 ? sum : 0. */
  const int32_t sum = count_12c8 + count_12cc;
  return sum > 0 ? sum : 0;
}

extern "C" int32_t isaac_game_update_slice_b9b11_b10_fatal_needed(
    int32_t enemies, int32_t old_7224) {
  /* PE 0x803e1d test esi,esi / 0x803e1f jg 0x803e62 — skip when enemies>0
     (SIGNED), so fatal needs enemies <= 0. PE 0x803e21 cmp [edi+0x7224],0
     / 0x803e28 jle 0x803e62 — skip when old<=0 (SIGNED), so fatal needs
     old > 0. */
  if (enemies > 0) return 0;
  if (old_7224 <= 0) return 0;
  return 1;
}

extern "C" int32_t isaac_game_update_slice_b9b11_mode_hooks_needed(
    uint32_t room_type_8, uint32_t game_byte) {
  /* PE 0x803dd9..0x803ded: cmp eax,0xb / je; cmp eax,0x11 / jne;
     cmp byte [ecx+0x265e8],0 / je. Type FULL-DWORD equality; byte LOW-BYTE.
     NOTE: the PE reads Game+0x265e8 (prior NOTES said 0x997a; the v48 wire
     passes the same capture byte, capture contract unchanged this unit). */
  if (room_type_8 != 0xbu && room_type_8 != 0x11u) return 0;
  if ((game_byte & 0xffu) == 0u) return 0;
  return 1;
}

extern "C" int32_t isaac_game_update_slice_b9b11_flag_11f4_needed(
    uint32_t room_byte_11f4) {
  /* PE 0x803dfa cmp byte [edi+0x11f4],0 / je 0x803e0a: LOW-BYTE. */
  return (room_byte_11f4 & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_game_update_slice_b9b11_double_409030_needed(
    uint32_t room_byte_1d0d) {
  /* PE 0x803e82 cmp byte [edi+0x1d0d],0 / je 0x803ea1: LOW-BYTE. */
  return (room_byte_1d0d & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_game_update_slice_b9b11_stage_1a_needed(
    uint32_t room_1d18) {
  /* PE 0x803ea1 cmp dword [edi+0x1d18],0x1a / jne 0x803f16: FULL-DWORD. */
  return room_1d18 == 0x1au ? 1 : 0;
}

extern "C" int32_t isaac_game_update_slice_b9b11_age1_needed(
    uint32_t room_active_byte0, uint32_t frame_264f8,
    uint32_t room_entry_11f0) {
  /* PE 0x803f21 cmp byte [edi],0 / je 0x803f43: LOW-BYTE active;
     0x803f26..0x803f3a sub/cmp eax,1 / jne: EXACT age == 1. */
  if ((room_active_byte0 & 0xffu) == 0u) return 0;
  if (((frame_264f8 - room_entry_11f0) & 0xffffffffu) != 1u) return 0;
  return 1;
}

extern "C" int32_t isaac_game_update_slice_b9b11_tempfx_flag_clear(
    uint32_t room_byte_7321) {
  /* PE 0x803f43 cmp byte [edi+0x7321],0 / jne 0x804101: LOW-BYTE. */
  return (room_byte_7321 & 0xffu) == 0u ? 1 : 0;
}

extern "C" int32_t isaac_game_update_slice_b9b11_tempfx_list_empty(
    uint32_t list_begin_7314, uint32_t list_end_7318) {
  /* PE 0x803f50..0x803f5e: mov eax,[edi+0x7314]; mov esi,[edi+0x7318];
     cmp eax,esi / je 0x804101 — FULL-DWORD equality. */
  return list_begin_7314 == list_end_7318 ? 1 : 0;
}

extern "C" int32_t isaac_game_update_slice_b9b11_tempfx_is_candidate(
    uint32_t effect_type, uint32_t effect_variant) {
  /* PE 0x803f68..0x803f77: cmp ecx,1 / je; cmp ecx,3 / je; cmp ecx,4 /
     jne; cmp dword [edx+4],0x1e1 / je — FULL-DWORD. */
  if (effect_type != 1u && effect_type != 3u && effect_type != 4u) return 0;
  return effect_variant == 0x1e1u ? 1 : 0;
}

extern "C" uint32_t isaac_game_update_slice_b9b11_tempfx_walk_next(
    uint32_t cur) {
  /* PE 0x803f80 add eax,0x10 — stride 0x10, 32-bit wrap. */
  return cur + 0x10u;
}

extern "C" int32_t isaac_game_update_slice_b9b11_tempfx_walk_continue(
    uint32_t cur, uint32_t end) {
  /* PE 0x803f83 cmp eax,esi / jne 0x803f64 — continue while cur != end
     (FULL-DWORD). */
  return cur != end ? 1 : 0;
}

/* ---- ABI v95 (record idx 23 opaqueRoomUpdateClearPath) pure laws ----
   Transcribed from cpu-dump 00804180.txt (0x00804212..0x0080424d) and the
   always-run type-5 door loop (0x008042be..0x008042f3); do NOT derive from
   the C++. FUN_00710dd0's open tail stays typed-host (v25 pin). */

extern "C" int32_t isaac_game_update_slice_clear_path_flag_gate(
    uint32_t game_mode, uint32_t flags_2654c) {
  /* PE 0x00804214 cmp eax,0xd / 0x00804217 je SKIP: FULL-DWORD equality
     (0x1000000d must NOT skip). 0x00804219 cmp eax,1 jl CLEAR + 0x0080421e
     cmp eax,6 jg CLEAR: SIGNED range. 0x0080422b and ecx,0x10000 /
     0x00804233 jne SKIP: bit16 of Game+0x2654c closes the gate only for
     modes 1..6. Any other mode clears the flag. */
  if (game_mode == 0xdu) return 0;
  if ((int32_t)game_mode < 1) return 1;
  if ((int32_t)game_mode > 6) return 1;
  return ((flags_2654c & 0x10000u) != 0u) ? 0 : 1;
}

extern "C" uint32_t isaac_game_update_slice_clear_path_flag_mask(void) {
  /* PE 0x00804245 and dword [..], 0xfffffffe — clears bit 0 only. */
  return 0xfffffffeu;
}

extern "C" uint32_t isaac_game_update_slice_clear_path_flag_target(
    uint32_t manager_base, uint32_t count_29fbc) {
  /* PE 0x0080423b imul eax,[ecx+0x29fbc],0x184 (32-bit wrap) then
     0x00804245 target [eax+ecx+0x2a12c]. Manager + count*0x184 + 0x2a12c,
     all u32 wrap. */
  return manager_base + count_29fbc * 0x184u + 0x2a12cu;
}

extern "C" int32_t isaac_game_update_slice_clear_path_door_result_merge(
    uint32_t any_needs_host, uint32_t type5_needs_host) {
  /* Post-door state: the machine ALWAYS runs the type-5 door loop after the
     clear path. When the clear-path door residual ran (any_needs_host), door
     +0x8/+0xc may have been mutated, so the pre-clear snapshot cannot gate
     the type-5 loop — host forced. Otherwise the pure-gated type-5 decision
     stands. 1 = emit the type-5 door host residual. */
  return (any_needs_host != 0u || type5_needs_host != 0u) ? 1 : 0;
}

/* ---- ABI v95 (record idx 24 opaqueRoomUpdateClearDoorSlots) composed
   per-slot decision ----   Transcribed from cpu-dump 00804100.txt
   (0x0080424d..0x0080427d) + the FUN_00710dd0 prologue (0x710ddb..0x710e07);
   the open tail (0x710e0d..0x710f4b) stays typed-host (v25 pin). */

extern "C" uint32_t isaac_game_update_slice_clear_door_slots_failing_mask(
    const IsaacGameUpdateDoorSlotRuntime* slots) {
  /* The residual loop (PE 0x804260..0x80427d) walks the 8 Room+0x724 slots:
     0x804260 mov ecx,[esi] / 0x804262 test ecx,ecx je SKIP (FULL-DWORD
     present gate) then call FUN_00710dd0 with thiscall ecx=door. The callee
     prologue (room law isaac_door_helper_710dd0_early_out) returns 1 =
     PURE no-op (skip) on:
       (f3a0 & 0x10) && f8 != 8   (0x710ddb test al,0x10 / 0x710ddf cmp dword)
       (f3a0 & 0x20) && f8 == 4   (0x710de9 test al,0x20 / 0x710ded cmp dword)
       fc == 2                     (0x710df7 cmp dword)
       f8 == 7                     (0x710e01 / 0x710e07 cmp dword)
     and returns 0 = the residual open body must run for that door. bit i of
     the returned mask is set iff slot i is present && early_out == 0. The
     coarse opaque_room_update_clear_door_slots event fires iff mask != 0
     (semantically the v25 any_needs_host gate); the mask TYPES the failing
     open so the host opens exactly the failing doors. present is FULL-DWORD
     (0x100 present qualifies); all params are u32 re-narrowed in the body. */
  uint32_t mask = 0u;
  if (slots == nullptr) return mask;
  for (int i = 0; i < ISAAC_GAME_UPDATE_TYPE5_DOOR_SLOT_COUNT; ++i) {
    if (slots[i].present == 0u) continue;
    if (isaac_door_helper_710dd0_early_out(slots[i].field_3a0,
                                           (int32_t)slots[i].field_8,
                                           (int32_t)slots[i].field_c) == 0u) {
      mask |= (1u << i);
    }
  }
  return mask;
}

/* ---- Record idx 22 opaqueRoomTransitionEngineBody: player-loop PRE-CALL
   decision laws (FUN_0082ee40, PE 0x0082f049..0x0082f084; census
   update-v95-82ee40-body-entry/NOTES.md). The record-22 body walks the
   player vector [Game+0x1baa8] and per eligible entry either calls
   0x7abcc0 (pred && byte[entry+0x173]==0) or 0x7abe20 (the other path &&
   engine field_1c == 0x14). These five exports decide WHICH host call
   fires + the 0x7abcc0 arg; the bodies (Rewind 0x40a1b0 / ANM2::Reset
   0x407f10 heap zeros, the unconditional stores [entry+0x139a]/
   [entry+0x14c]/[entry+0x1398], Sprite::Play 0x40a5d0, the
   0x956780/0x92dc30 SFX leg of 0x7abcc0) STAY TYPED-HOST — the
   player-entry objects are outside the capture ABI. uint32_t params
   everywhere, re-narrowed in the body (Wasm ABI never narrows i32 args). */

extern "C" int32_t isaac_game_update_slice_82ee40_body_eligible(
    uint32_t entry_2c) {
  /* PE 0x0082f049 cmp dword [esi+0x2c],0 / jne 0x82f0b9 — FULL-DWORD
     eligibility: only ==0 enters the body; 0x100 is INELIGIBLE. */
  return entry_2c == 0u ? 1 : 0;
}

extern "C" int32_t isaac_game_update_slice_82ee40_body_predicate(
    uint32_t field_1c) {
  /* FUN_0082eb90 (cpu-dump 0082eb90.txt): reads [ecx+0x1c] and compares
     against 3, 0xc, 0xd, 0xb — four full-dword equalities, OR'd. Consumed
     BY REFERENCE from the RTE family law
     (isaac_room_transition_engine_82eb90_predicate, the v2 source of
     truth) so the {3,0xc,0xd,0xb} set never drifts between families.
     int32_t cast is exact: the PE compares the FULL 32-bit word. */
  return isaac_room_transition_engine_82eb90_predicate((int32_t)field_1c);
}

extern "C" int32_t isaac_game_update_slice_82ee40_body_7abcc0_needed(
    uint32_t predicate, uint32_t entry_173_byte) {
  /* PE 0x0082f056 test al,al / je 0x82f077 (pred false -> 7abe20 check);
     0x0082f05a cmp byte [esi+0x173],0 / jne 0x82f077. entry+0x173 is a
     BYTE test: 0x100 CLEARS it, 0x1ff SETS it. */
  if (predicate != 0u && (entry_173_byte & 0xffu) == 0u) {
    return 1;
  }
  return 0;
}

extern "C" int32_t isaac_game_update_slice_82ee40_body_7abcc0_arg(
    uint32_t anim) {
  /* PE 0x0082f063 cmp dword [ebx+0x10],0xb / setne al / movzx eax,al —
     FULL-DWORD compare; result strictly 0 or 1. WIDE 0x10b != 0xb -> 1. */
  return anim != 0xbu ? 1 : 0;
}

extern "C" int32_t isaac_game_update_slice_82ee40_body_7abe20_needed(
    uint32_t field_1c, uint32_t predicate, uint32_t entry_173_byte) {
  /* PE 0x0082f058 je 0x82f077 + 0x0082f061 jne 0x82f077: BOTH the !pred
     path and the pred && byte173 != 0 path converge at 0x82f077, where
     `cmp dword [edi+0x1c],0x14 / jne 0x82f08f` FULL-DWORD decides the
     7abe20 call. So 7abe20 fires iff !(pred && byte173==0) && field_1c
     == 0x14. A WIDE 0x114 must NOT fire (only 0x14 equals). */
  if (predicate != 0u && (entry_173_byte & 0xffu) == 0u) {
    return 0;
  }
  return field_1c == 0x14u ? 1 : 0;
}

extern "C" void isaac_game_update_slice_82ee40_body_entry_plan(
    uint32_t eligible, uint32_t predicate, uint32_t entry_173_byte,
    uint32_t field_1c, uint32_t anim,
    IsaacGameUpdateSlice82ee40BodyEntryPlan* out) {
  if (out == nullptr) return;
  const int32_t call_abcc0 =
      isaac_game_update_slice_82ee40_body_7abcc0_needed(predicate,
                                                        entry_173_byte);
  const int32_t call_abe20 =
      isaac_game_update_slice_82ee40_body_7abe20_needed(field_1c, predicate,
                                                        entry_173_byte);
  const int32_t ineligible = eligible == 0u ? 1 : 0;
  out->call_7abcc0 = ineligible ? 0 : call_abcc0;
  out->arg_7abcc0 = ineligible ? 0 : isaac_game_update_slice_82ee40_body_7abcc0_arg(anim);
  out->call_7abe20 = ineligible ? 0 : call_abe20;
  out->any_host = ineligible ? 0 : ((call_abcc0 != 0 || call_abe20 != 0) ? 1 : 0);
  /* PE 0x0082f089 `mov edx,[0xc71678]` runs on the two host-call paths
     only (the 7abcc0 jmp target and the 7abe20 fall-through); the no-call
     path jumps to 0x0082f08f with the stale pre-body Game pointer. */
  out->game_reread = ineligible ? 0 : ((call_abcc0 != 0 || call_abe20 != 0) ? 1 : 0);
}

/* ---- Record idx 33 opaqueRoomUpdateClearDoors: type-5 door loop frame
   laws (PE FrameOpaque_802980 0x008042be..0x008042f3; census
   update-v95-clear-doors-type5/NOTES.md). Forced-arm census result: the
   forced arm (clear-path door residual ran) runs the SAME 8-slot loop as
   the gated arm; only the qualifying door SET differs (POST-clear states —
   field_c=5 written on open — are host-time, not derivable from the
   pre-clear snapshot). Frame laws below + typed per-door open plan. ---- */
extern "C" uint32_t isaac_game_update_slice_type5_door_loop_count(void) {
  /* PE 0x8042be mov eax,8; the loop counter is STORED to [ebp-0x98c]
     (0x8042c9/0x8042ed) and RELOADED after the call (0x8042e1) — the bound
     is the constant 8 re-derived per iteration, never folded once. */
  return ISAAC_GAME_UPDATE_TYPE5_DOOR_SLOT_COUNT;
}
static_assert(ISAAC_GAME_UPDATE_TYPE5_DOOR_SLOT_COUNT ==
                  ISAAC_ROOM_DOOR_SLOT_COUNT,
              "type-5 door loop bound must match the Room door-slot array");

extern "C" int32_t isaac_game_update_slice_type5_door_open_needed(
    uint32_t present, int32_t field_c) {
  /* PE 0x8042d2 test ecx,ecx / je skip — FULL-DWORD null test; 0x8042d6
     cmp dword [ecx+0xc],5 / jne skip — FULL-DWORD field_c == 5. NO
     low-byte narrowing: 0x100 present qualifies, field_c 0x1000005 does
     NOT (5 only). */
  return (present != 0u && field_c == 5) ? 1 : 0;
}

extern "C" uint32_t isaac_game_update_slice_type5_door_open_host_va(void) {
  /* PE 0x8042dc call 0x710dd0 — the door open/update call, stays host. */
  return ISAAC_GAME_UPDATE_TYPE5_DOOR_OPEN_HOST_VA;
}

extern "C" uint32_t isaac_game_update_slice_type5_door_open_stack_arg_count(
    void) {
  /* PE 0x8042dc: thiscall ecx = door ptr, no stack args pushed. */
  return 0u;
}

/* ABI v99 leaf peel (idx 23): FUN_00710dd0 OPEN TAIL prefix
   0x00710e0d..0x00710e51 (before/around host 0x748760). The rest of
   the open body (Game flag stores, 0x5cd5f0 / 0x710f70 / 0x740bc0
   GetRoomByIdx / 0x711740 / jmp 0x70ee40) stays typed-host. */

extern "C" int32_t isaac_game_update_slice_710dd0_open_tail_arm_0xb(
    uint32_t field_160) {
  /* PE 0x710e19 cmp ebx,0xb / 0x710e1c jne 0x710ebd. FULL-DWORD. */
  return (field_160 == 0xbu) ? 1 : 0;
}

extern "C" int32_t isaac_game_update_slice_710dd0_open_tail_bl(
    uint32_t field_15c) {
  /* PE 0x710e22 cmp eax,7 / je bl=1; 0x710e27 cmp eax,8 / je bl=1;
     else xor bl,bl. FULL-DWORD. */
  return (field_15c == 7u || field_15c == 8u) ? 1 : 0;
}

extern "C" int32_t isaac_game_update_slice_710dd0_open_tail_skip_after_748760(
    uint32_t host_al, uint32_t field_392, uint32_t bl) {
  /* PE 0x710e43 test al,al / jne join; 0x710e47 cmp byte [esi+0x392],al
     / jne join; 0x710e4f test bl,bl / je RET. Reached the byte392/bl
     tests only when al==0. Skip (RET) iff all three low bytes are 0. */
  if ((host_al & 0xffu) != 0u) {
    return 0;
  }
  if ((field_392 & 0xffu) != 0u) {
    return 0;
  }
  if ((bl & 0xffu) != 0u) {
    return 0;
  }
  return 1;
}

extern "C" uint32_t isaac_game_update_slice_710dd0_open_tail_host_va_748760(
    void) {
  return 0x00748760u;
}

/* ABI v99 exports-only (idx 23, update-v112-710dd0-rest): FUN_00710dd0
   OPEN TAIL REST 0x00710e51..0x00710f64. Transcribed from the instruction
   stream; do NOT derive from the JS oracle. Complete helpers 0x5cd5f0 /
   0x710f70 / 0x711740 (0x711740..0x71177f predicate). Game+0x2654c store,
   0x740bc0 GetRoomByIdx (dual ZHL, not promoted), jmp 0x70ee40 stay
   typed-host. Every scalar is uint32_t/int32_t — no uint8_t params. */

extern "C" int32_t isaac_game_update_slice_5cd5f0(uint32_t field_15c,
                                                 uint32_t field_160,
                                                 uint32_t arg) {
  /* PE 0x5cd5f6 cmp [ecx+0x15c],arg / je al=1;
     0x5cd5fe cmp [ecx+0x160],arg / je al=1; else al=0. FULL-DWORD.
     stdcall ret 4; thiscall ecx=door. Site 0x710edd pushes 0. */
  return (field_15c == arg || field_160 == arg) ? 1 : 0;
}

extern "C" int32_t isaac_game_update_slice_710f70(uint32_t field_160,
                                                 int32_t game_18334,
                                                 uint32_t game_269c8) {
  /* PE 0x710f73 cmp edx,0x17 / jne al=0. FULL-DWORD.
     0x710f7f cmp [Game+0x269c8],3 / sete cl; add ecx,0xa.
     0x710f8c cmp [ebp+8],ecx / jge al=0 else al=1. SIGNED. */
  if (field_160 != 0x17u) {
    return 0;
  }
  const int32_t thresh = 0xa + ((game_269c8 == 3u) ? 1 : 0);
  return (game_18334 < thresh) ? 1 : 0;
}

extern "C" int32_t isaac_game_update_slice_711740(uint32_t field_394,
                                                 uint32_t game_18308,
                                                 uint32_t mgr_begin,
                                                 uint32_t mgr_end,
                                                 uint32_t field_154) {
  /* PE 0x71174b cmp [ecx+0x394],[Game+0x18308] / jne al=1.
     0x711764 cmp begin,end / je al=1.
     0x711768 sub end,begin; sar 2; cmp eax,1 / jbe al=1. UNSIGNED jbe
     of the SAR result (32-bit wrap then arithmetic shift).
     0x711772 cmp [ecx+0x154],0x1e / seta al. UNSIGNED. */
  if (field_394 != game_18308) {
    return 1;
  }
  if (mgr_begin == mgr_end) {
    return 1;
  }
  const int32_t count =
      static_cast<int32_t>(mgr_end - mgr_begin) >> 2;
  if (static_cast<uint32_t>(count) <= 1u) {
    return 1;
  }
  return (field_154 > 0x1eu) ? 1 : 0;
}

extern "C" int32_t isaac_game_update_slice_710dd0_join_flag_or_20000(
    uint32_t field_8) {
  /* PE 0x710e5a cmp eax,5 / jne skip OR. FULL-DWORD.
     Then Game+0x2654c |= 0x20000 + 26548 self-store (HOST store). */
  return (field_8 == 5u) ? 1 : 0;
}

extern "C" uint32_t isaac_game_update_slice_710dd0_join_flag_or_mask(void) {
  return 0x20000u;
}

extern "C" int32_t isaac_game_update_slice_710dd0_join_boss_close(
    uint32_t field_8, uint32_t field_160, uint32_t field_394,
    uint32_t game_18370) {
  /* PE 0x710e7e cmp eax,6 / jne 0x710f4b;
     0x710e87 cmp [esi+0x160],4 / jne 0x710f4b;
     0x710e9f cmp ecx,[eax+0x18370] / jne 0x710f4b.
     FULL-DWORD all three. Hit -> store field8=1, jmp 0x70ee40.
     Miss -> store field_c=2, field8=8, jmp 0x70ee40. */
  return (field_8 == 6u && field_160 == 4u && field_394 == game_18370)
             ? 1
             : 0;
}

extern "C" uint32_t isaac_game_update_slice_710dd0_join_boss_field8(void) {
  return 1u;
}

extern "C" uint32_t isaac_game_update_slice_710dd0_join_else_field8(void) {
  return 8u;
}

extern "C" uint32_t isaac_game_update_slice_710dd0_join_else_field_c(void) {
  return 2u;
}

extern "C" int32_t isaac_game_update_slice_710dd0_arm_15c_0xb(
    uint32_t field_15c) {
  /* PE 0x710ebd cmp eax,0xb / jne 0x710edd. FULL-DWORD.
     eax is still field15c from 0x710e13 on the arm_0xb-false path. */
  return (field_15c == 0xbu) ? 1 : 0;
}

extern "C" int32_t isaac_game_update_slice_710dd0_skip_after_15c_0xb(
    uint32_t game_265e8, uint32_t field_392) {
  /* PE 0x710ec7 cmp byte [Game+0x265e8],0 / je 0x710f33 (711740);
     0x710ed0 cmp byte [esi+0x392],0 / jne 0x710f33; else RET.
     LOW-BYTE both. Skip (RET) iff 265e8 != 0 AND 392 == 0. */
  if ((game_265e8 & 0xffu) == 0u) {
    return 0;
  }
  if ((field_392 & 0xffu) != 0u) {
    return 0;
  }
  return 1;
}

extern "C" uint32_t isaac_game_update_slice_710dd0_rest_field8_arm(
    uint32_t field_8) {
  /* PE 0x710ee8 cmp edi,4 / je 0x710f31;
     0x710eed cmp edi,6 / jne 0x710f0d;
     0x710f0d cmp edi,1 / jne 0x710f2b.
     FULL-DWORD. 4 -> 711740; 6 -> 710f70; 1 -> GetRoomByIdx; else 8-test. */
  if (field_8 == 4u) {
    return 4u;
  }
  if (field_8 == 6u) {
    return 6u;
  }
  if (field_8 == 1u) {
    return 1u;
  }
  return 0u;
}

extern "C" int32_t isaac_game_update_slice_710dd0_rest_field8_eq_8(
    uint32_t field_8) {
  /* PE 0x710f2b cmp dword [esi+8],8 / jne RET else 711740. FULL-DWORD.
     Re-read of field8 (not edi). */
  return (field_8 == 8u) ? 1 : 0;
}

extern "C" int32_t isaac_game_update_slice_710dd0_room_40_ja(
    uint32_t room_40) {
  /* PE 0x710f25 cmp dword [eax+0x40],0 / ja 0x710f31. UNSIGNED. */
  return (room_40 > 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_game_update_slice_710dd0_711740_false_field_c(
    void) {
  /* PE 0x710f40 mov dword [esi+0xc],5 then RET. */
  return 5u;
}

extern "C" uint32_t isaac_game_update_slice_710dd0_getroom_arg1(void) {
  /* PE 0x710f18 push -1. Dual-ZHL 0x740bc0 not promoted. */
  return 0xffffffffu;
}

extern "C" uint32_t isaac_game_update_slice_710dd0_host_va_5cd5f0(void) {
  return 0x005cd5f0u;
}

extern "C" uint32_t isaac_game_update_slice_710dd0_host_va_710f70(void) {
  return 0x00710f70u;
}

extern "C" uint32_t isaac_game_update_slice_710dd0_host_va_740bc0(void) {
  return 0x00740bc0u;
}

extern "C" uint32_t isaac_game_update_slice_710dd0_host_va_711740(void) {
  return 0x00711740u;
}

extern "C" uint32_t isaac_game_update_slice_710dd0_host_va_70ee40(void) {
  return 0x0070ee40u;
}


/* Module-private scratch the wire publishes: host consumer reads the plan
   (count + 8 x {slot_index, present, field_3a0, field_8, field_c}) and runs
   0x710dd0(Room+0x724[slot_index]) per entry when type5_door_open_calls>0. */
static uint32_t scratch_type5_door_open_plan[
    (sizeof(IsaacGameUpdateSliceType5DoorOpenPlan) + 3u) / 4u];

void isaac_game_update_slice_type5_door_open_plan(
    const IsaacGameUpdateDoorSlotRuntime* slots,
    IsaacGameUpdateSliceType5DoorOpenPlan* out) {
  if (out == nullptr) return;
  out->count = 0;
  const uint32_t count = isaac_game_update_slice_type5_door_loop_count();
  for (uint32_t i = 0; i < count &&
                      i < (uint32_t)ISAAC_GAME_UPDATE_TYPE5_DOOR_SLOT_COUNT;
       ++i) {
    if (slots == nullptr) break;
    const IsaacGameUpdateDoorSlotRuntime* s = &slots[i];
    if (isaac_game_update_slice_type5_door_open_needed(
            s->present, (int32_t)s->field_c) == 0) {
      continue;
    }
    /* The callee FUN_00710dd0's own prologue early-outs (pure no-op gate);
       those calls produce ZERO observable work so they are not typed
       (matches the v25 any_type5_needs_host contract). */
    if (isaac_door_helper_710dd0_early_out(
            s->field_3a0, (int32_t)s->field_8, (int32_t)s->field_c) != 0) {
      continue;
    }
    IsaacGameUpdateSliceType5DoorOpenEntry* e = &out->doors[out->count];
    e->slot_index = i;
    e->present = s->present;
    e->field_3a0 = s->field_3a0;
    e->field_8 = (int32_t)s->field_8;
    e->field_c = (int32_t)s->field_c;
    out->count += 1;
  }
}

extern "C" uintptr_t isaac_game_update_slice_type5_door_open_plan_address(
    void) {
  return reinterpret_cast<uintptr_t>(scratch_type5_door_open_plan);
}

extern "C" uint32_t isaac_game_update_slice_type5_door_open_plan_max_entries(
    void) {
  return ISAAC_GAME_UPDATE_TYPE5_DOOR_SLOT_COUNT;
}

extern "C" int32_t isaac_game_update_slice_resume_room_update_prefix(
    IsaacGameUpdateSliceState* state,
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs,
    IsaacGameUpdateSliceEvents* events) {
  if (state == nullptr || runtime_inputs == nullptr || events == nullptr ||
      events->continuation_kind != ISAAC_GAME_UPDATE_RESUME_AFTER_ROOM_UPDATE_PREFIX) {
    return 0;
  }

  /* Pure companions after ordered prefix host residuals B1 / B2-host / B3–B11:
     B2: if (Room+0x7764 >= 0) -- (0 → -1). Host pool/spawn and set-to-60 remain
     in opaqueRoomUpdatePrefixB2; B3–B11 residual do not write +0x7764.
     B6: if (Room+0x7298 > 0) -- (field unused by residual B1/B2/B3–B11 host).
     B10: Room+0x7224 = max(0, +0x12c8 + +0x12cc). Fatal deathspawn warn stays
     in B3–B11 residual.
     Then B12 pure clear-delay shell. Fragmented host residual after pure shell:
       roomTriggerOutput (exact Room::TriggerOutput(9)),
       nested opaqueCall006fd7c0 (type 0x10 subtype 3) with recapture pause,
       opaqueRoomUpdateClearPath (player-flag only),
       opaqueRoomUpdateClearDoorSlots (FUN_00710dd0 loop, pure early-out gate),
       pure TriggerClear entry + stats/audio/awards residuals when (flags&9)==0,
       opaqueRoomUpdateClearDoors (type-5 door loop; pure early-out when snapshot
       still valid, forced when clear-path door residual ran).
     Game[0x997a] nonzero maps onto enemies_present so the helper takes the
     set-to-10/20 path matching the machine else/goto LAB_00804293 branch. */
  isaac_room_countdown_dec_if_nonnegative(&state->room_collectible_timer_7764);
  isaac_room_countdown_dec_if_positive(&state->room_water_lerp_countdown_7298);
  isaac_room_boss_count_snapshot(&state->room_boss_snapshot_7224,
                                 state->room_boss_count_12c8,
                                 state->room_boss_count_12cc);

  IsaacRoomClearDelayState delay = {};
  delay.alive_a = state->room_alive_12c0;
  delay.alive_b = state->room_alive_12c4;
  delay.room_clear_delay = state->room_clear_delay_11ec;
  delay.greed_wave_timer = state->room_greed_wave_723c;
  delay.room_type = state->room_type_8;
  delay.room_subtype = state->room_desc_subtype;
  int32_t alive = delay.alive_a + delay.alive_b;
  if (alive < 0) alive = 0;
  const uint32_t skip = runtime_inputs->global_clear_skip_997a & 0xffu;
  delay.enemies_present = (alive > 0 || skip != 0) ? 1u : 0u;
  isaac_room_clear_delay_step(&delay);
  state->room_clear_delay_11ec = delay.room_clear_delay;

  /* Clear-side host predicates use post-shell delay (pure shell leaves delay < 1
     unchanged when no enemies/greed). Matches machine order at ~0x00804110. */
  const int32_t clear_side =
      (skip == 0 && alive < 1 && delay.greed_wave_timer < 1 &&
       state->room_clear_delay_11ec < 1)
          ? 1
          : 0;

  /* Exact Room::TriggerOutput(9) when clear-bit0 off and clear-side conditions. */
  if (clear_side != 0 && (state->room_desc_flags_44 & 1u) == 0u) {
    events->room_trigger_output += 1;
  }

  /* Door snapshot is valid for type-5 pure gate only when clear-path door residual
     did not run (may mutate door +0x8/+0xc, including writing field_c=5). */
  int32_t clear_path_door_slots_emitted = 0;

  if (clear_side != 0) {
    /* Nested FrameEffect_6fd7c0 for type 0x10 subtype 3: pause so host can apply
       residual without pure terminals (writes Game+0x1831c=-1; args
       (Game+0x18328, -1, 0, 0, -1)) and recapture Game sparse; pure P4 runs on
       resume before type-5 doors / ambient. Subtype 3 does not fall into
       clear-path residual after the nested call. */
    if (state->room_type_8 == 0x10 && state->room_desc_subtype == 3) {
      /* Site B: anim=0, args (Game[0x18328], -1, 0, 0, -1); room index not sparse.
         emit sets RESUME_AFTER_ENGINE_PREFIX (or mode-4 → CLEAR_NESTED).
         ABI v72: the room argument is NOT a sparse field, so 0 stands in for
         Game[0x18328] in the shell-drop force test. That is conservative in
         one direction only: the real dim argument is the literal -1 pushed at
         0x008041ee, so unless the room really is -2 the PE takes the SIGN
         branch at 0x006fdb5d and the blue-room host always runs — the drop is
         refused. A real room of -2 would zero the dim and could open the drop
         when the mode is nonzero; the placeholder simply keeps the host event
         there. It can never drop an arm the PE would have executed. */
      emit_frame_effect_6fd7c0_host_residuals(state, runtime_inputs, events, 0,
                                              0, -1, /*site_arg3=*/0);
      return 1;
    }
    /* Clear path residual for non-(0x10,2) rooms: player-flag clear gated by
       the ABI v95 flag law (PE 0x00804212..0x0080424d); door-slot
       FUN_00710dd0 gated by pure early-out over runtime door_slots. When
       (flags&9)==0, pure TriggerClear entry (Flags|=1, ClearCount++) then
       residual host room_trigger_clear_stats/audio/awards (body after entry;
       host must not re-run entry). Type 0x10 subtype 2 skips entirely. */
    if (!(state->room_type_8 == 0x10 && state->room_desc_subtype == 2)) {
      /* Flag clear: gate open (mode != 0xd && (mode < 1 || mode > 6 ||
         (flags_2654c & 0x10000) == 0)) -> the machine clears bit 0 of the
         Manager per-player flag at +0x2a12c; gate closed -> the arm is a
         pure skip, no event. Default clear_path_game_mode_0 = 0 keeps the
         gate open.
         ABI v115 (update-v115-clearpath-removal): record idx 23 REMOVED
         from opaqueBoundaries (42 -> 41, 8th removal since v79). The
         coarse edge is RETIRED — full-capture theorem: the firing site's
         entire residual (PE 0x00804235..0x0080424b) is exactly ONE
         platform-class masked store, and [0xc7169c] (manager) sits
         OUTSIDE the Game buffer, so the store runs host-side under its
         typed carrier clear_path_flag_store fired here under the SAME
         pure gate law. No capture gate exists (mode lane @7888 +
         flags_2654c state are always in-module), so there is no
         capture-absence arm: the coarse counter @160 STAYS in the frozen
         events ABI but NEVER fires.
         ABI v119 (update-v119-door-removal): idx-24/idx-33 are REMOVED
         too (41 -> 39) — see the door-slot residual below and the type-5
         door loop below for their per-record theorems. */
      if (isaac_game_update_slice_clear_path_flag_gate(
              runtime_inputs->clear_path_game_mode_0,
              state->flags_2654c) != 0) {
        events->clear_path_flag_store += 1;
      }
      /* Door-slot FUN_00710dd0 residual (record idx 24): the composed
         per-slot early-out decision runs in-module — bit i of the failing
         mask = present slot i fails the early-out (needs host open). The
         mask event IS the typed carrier (ABI v119 retirement): it is
         nonzero iff the retired coarse edge armed, and it types the
         failing open so the host opens EXACTLY the failing doors. */
      const uint32_t clear_door_slots_failing_mask =
          isaac_game_update_slice_clear_door_slots_failing_mask(
              runtime_inputs->door_slots);
      if (clear_door_slots_failing_mask != 0u) {
        events->opaque_room_update_clear_door_slots_mask =
            clear_door_slots_failing_mask;
        clear_path_door_slots_emitted = 1;
      }
      if ((state->room_desc_flags_44 & 9u) == 0u) {
        IsaacRoomTriggerClearEntry tc = {};
        tc.room_desc_flags_44 = state->room_desc_flags_44;
        tc.room_desc_clear_count_4a = (int16_t)state->room_desc_clear_count_4a;
        isaac_room_trigger_clear_entry(&tc);
        state->room_desc_flags_44 = tc.room_desc_flags_44;
        state->room_desc_clear_count_4a = tc.room_desc_clear_count_4a;
        /* Ordered residual body fragments (ABI v31) with pure gates on
           difficulty_269c8 (mode 2/3 greed) and post-entry flags bit7. */
        /* ABI v95 (record idx 25): typed stats-residual carriers. The
           guest-alloc vector growth 0x69ee50 (stats vector at Game+0x266e4
           +0x5c) fires tcs_stats_growth_calls times; the record + append
           count prep the host's replay.
           ABI v125 (update-v125-tcs-stats-removal): record idx 25
           roomTriggerClearStats REMOVED (35 -> 34, 15th removal since
           v79) — the LIVE coarse edge is RETIRED under the
           tcs_stats_vec_ready voucher. On capture-valid ticks the retired
           increment carried no information: gates closed is a PROVEN pure
           skip (PE 0x9e5970 clearCount==1 FULL-DWORD else ret; 0x9e59ae
           comiss jbe — NaN closes), gates open publishes the full
           residual via the typed carriers below in PE order. The
           guest-alloc 0x69ee50 growth stays the standing allocator
           platform leaf behind tcs_stats_growth_calls (alloc-v5-frontier
           platform contract: malloc 0x40cf00 wrapper / memmove 0xaf08bd /
           free 0xaef15c; growth math already in-module). ready=0 keeps
           the pre-v95 monolithic edge byte-for-byte: coarse @168 STAYS in
           the frozen events ABI and fires ONLY on capture absence. */
        if (runtime_inputs->tcs_stats_vec_ready != 0) {
          const uint32_t clear_count = (uint32_t)(state->room_desc_clear_count_4a & 0xffff);
          const uint32_t desc_10_48 = runtime_inputs->tcs_stats_desc_10_48;
          const uint32_t lookup_bits = runtime_inputs->tcs_stats_lookup_bits;
          if (isaac_game_update_slice_tcs_stats_gate(clear_count) != 0 &&
              isaac_game_update_slice_tcs_stats_float_gate(lookup_bits) != 0) {
            const uint32_t count =
                (uint32_t)isaac_game_update_slice_tcs_stats_count(desc_10_48);
            uint32_t end_out = 0;
            uint32_t cap_out = 0;
            const uint32_t growths = isaac_game_update_slice_tcs_stats_growth_sim(
                count, runtime_inputs->tcs_stats_vec_begin,
                runtime_inputs->tcs_stats_vec_end, runtime_inputs->tcs_stats_vec_cap,
                &end_out, &cap_out);
            events->tcs_stats_append_count = count;
            events->tcs_stats_growth_calls = growths;
            events->tcs_stats_record_dword = (uint32_t)isaac_game_update_slice_tcs_stats_record_dword(
                (uint32_t)state->room_type_8);
            events->tcs_stats_record_byte = (uint32_t)isaac_game_update_slice_tcs_stats_record_byte(
                state->room_desc_flags_44);
            events->tcs_stats_record_float = lookup_bits;
            events->tcs_stats_tail_add = (uint32_t)isaac_game_update_slice_tcs_stats_tail_add(
                (uint32_t)state->room_type_8, runtime_inputs->tcs_stats_game_byte_8, count);
          }
        } else {
          /* ABI v125 capture-absence arm: ready=0 keeps the pre-v95
             monolithic residual byte-for-byte. */
          events->room_trigger_clear_stats += 1;
        }
        /* ABI v133 (update-v133-audio-music-pack, record idx26
           roomTriggerClearAudioNonGreed): under the tca40_tail_pack_ready
           voucher the spawn tail 0x7f7e34..0x7f817c runs IN-MODULE --
           rot/base once from the header lanes, then per-row item plans
           via the frozen room-pure ABI v81 laws consumed BY REFERENCE.
           The typed carrier room_trigger_clear_audio_non_greed_tail_spawns
           = rows consumed; the host applies each plan-Out in PE order
           (spawn 0x428b20 type 0x3e8/variant 0x3b + [ent+0x474] f474 +
           [ent+0x45c/0x460] timers + [vtbl+0xc]). Capture absence or
           over-cap keeps the coarse @172 byte-for-byte. */
        /* ABI v135 (update-v135-deep-music-pack, record idx28
           roomTriggerClearAwardsNonGreed REMOVED): under the NEW
           tca_dm_gate_ready voucher (@17652; 11 gate rows @17656..17692,
           contracts-deep-music NOTES section 1/2) the ENTIRE deep-music
           gate band 0x806a65..0x806b63 runs IN-MODULE via the landed law
           isaac_game_update_slice_trigger_clear_deep_music_gate consumed BY
           REFERENCE (short-circuit-honest packed probe rows: bit8=RAN,
           bits[7:0]=al). When the gate OPENS the typed carrier
           room_trigger_clear_deep_music_fire @1140 carries the whole
           deterministic fire package: flags-or 0x10000 apply-back via
           game_flags_1839c (inout state), SFX seed 0x5a + Play pack to
           [0xc7169c]+0x2a324 (typed-host), Room[+0x72fc]=0. With every
           sub-decision in-module the coarse @180 carries no information and
           is RETIRED on capture-live ticks; absence keeps the monolith
           byte-for-byte. */
        if (isaac_room_trigger_clear_needs_non_greed_host(
                state->difficulty_269c8) != 0) {
          /* ---- v136 head-gates: consume frozen ABI-67a laws. ---- */
          const bool head_live =
              runtime_inputs != nullptr &&
              runtime_inputs->tca40_head_pack_ready != 0;
          /* coarse @172 fires ONLY on head-capture absence (v136). */
          if (!head_live) {
            events->room_trigger_clear_audio_non_greed += 1;
          }
          /* ---- v133 spawn-tail consumption (independent of head). ---- */
          const bool tca40_live =
              runtime_inputs->tca40_tail_pack_ready != 0 &&
              runtime_inputs->tca40_tail_iter_count <= 8;
          if (tca40_live) {
            const uint32_t n =
                static_cast<uint32_t>(runtime_inputs->tca40_tail_iter_count);
            IsaacRoomTca40TailRotOut rot{};
            isaac_room_trigger_clear_audio_7f7a40_tail_rot(
                runtime_inputs->tca40_tail_vec0_bits,
                runtime_inputs->tca40_tail_vec4_bits,
                __builtin_bit_cast(float, runtime_inputs->tca40_tail_rot_cos_bits),
                __builtin_bit_cast(float, runtime_inputs->tca40_tail_rot_sin_bits),
                &rot);
            IsaacRoomTca40TailBaseOut base{};
            isaac_room_trigger_clear_audio_7f7a40_tail_base(
                runtime_inputs->tca40_tail_door_f24,
                runtime_inputs->tca40_tail_game_c, &base);
            for (uint32_t i = 0; i < n; ++i) {
              const IsaacGameUpdateSliceTcaTailRow* row =
                  &runtime_inputs->tca40_tail_rows[i];
              IsaacRoomTca40TailItemSrc src{};
              src.r_a = row->r_a;           src.r_b = row->r_b;
              src.r_c = row->r_c;           src.r_d = row->r_d;
              src.r_e = row->r_e;           src.r_f = row->r_f;
              src.r_g = row->r_g;
              src.a_bits = runtime_inputs->tca40_tail_vec0_bits ^ 0x80000000u;
              src.b_bits = runtime_inputs->tca40_tail_vec4_bits ^ 0x80000000u;
              src.r0_bits = __builtin_bit_cast(uint32_t, rot.r0);
              src.r1_bits = __builtin_bit_cast(uint32_t, rot.r1);
              src.base_x_bits = __builtin_bit_cast(uint32_t, base.x);
              src.base_y_bits = __builtin_bit_cast(uint32_t, base.y);
              src.cos_h_bits = row->cos_h_bits;
              src.sin_h_bits = row->sin_h_bits;
              src.ent_px_bits = row->ent_px_bits;
              src.ent_py_bits = row->ent_py_bits;
              isaac_room_trigger_clear_audio_7f7a40_tail_item_plan(
                  &src, &scratch_tca40_tail_plan_out[i]);
            }
            events->room_trigger_clear_audio_non_greed_tail_spawns = n;
          }
          /* ---- v136 head gates/fail: consume frozen ABI-67a laws. ---- */
          if (head_live) {
            IsaacRoomTriggerClearAudio7f7a40GatesSrc gs{};
            gs.a1 = 1;
            gs.a2 = 0;
            gs.game_26584 = state->mode_26584;
            gs.room_type_8 = state->room_type_8;
            gs.desc_f10_f10 = runtime_inputs->tca40_head_desc_f10_f10;
            gs.h_74ea50 = runtime_inputs->tca40_head_h_74ea50_al;
            gs.game_stage_0 = static_cast<int32_t>(runtime_inputs->clear_path_game_mode_0);
            gs.game_2654c = state->flags_2654c;
            gs.obj_2c7 = runtime_inputs->tca40_head_obj_2c7;
            gs.obj_8 = runtime_inputs->tca40_head_obj_8;
            gs.game_present = 1;
            gs.game_26630 = runtime_inputs->tca40_head_game_26630;
            gs.game_26589 = runtime_inputs->tca40_head_game_byte_26589;
            gs.h_706940_80 = runtime_inputs->tca40_head_h_706940_h80;
            gs.h_6f9400 = static_cast<int32_t>(runtime_inputs->tca40_head_h_6f9400);
            gs.h_6f95a0 = static_cast<int32_t>(runtime_inputs->tca40_head_h_6f95a0);
            gs.game_26550 = runtime_inputs->tca40_head_game_26550;
            gs.game_c = runtime_inputs->tca40_head_game_c;
            gs.game_18304 = runtime_inputs->tca40_head_game_18304;
            gs.game_182d0 = runtime_inputs->tca40_head_game_182d0;
            gs.game_4 = runtime_inputs->tca40_head_game_4;
            gs.room_728 = runtime_inputs->tca40_head_room_728;
            gs.room_f10_f8 = runtime_inputs->tca40_head_room_f10_f8;
            gs.r74bba0_f10_f8 = runtime_inputs->tca40_head_r74bba0_f10_f8;
            IsaacRoomTriggerClearAudio7f7a40GatesOut g_out{};
            isaac_room_trigger_clear_audio_7f7a40_gates(&gs, &g_out);
            /* ABI-67 fail chain: when the gates law diverts to the fail
               path (fail_path == 1), the complete xorshift slot scan +
               tail-count law runs IN-MODULE from the fail rows (contracts-
               audio-head NOTES section 1b). Fire-only leaves stay host-
               executed; the module publishes no event mass from the chain. */
            if (g_out.fail_path == 1u) {
              IsaacRoomTriggerClearAudio7f7a40FailSrc fs{};
              fs.a1 = 1;
              fs.a2 = 0;
              fs.game_26584 = state->mode_26584;
              fs.game_26630 = runtime_inputs->tca40_head_game_26630;
              fs.game_26589 = runtime_inputs->tca40_head_game_byte_26589;
              fs.game_18304 = runtime_inputs->tca40_head_game_18304;
              fs.game_18314 = runtime_inputs->tca40_head_game_18314;
              fs.h_740bc0_ret_8 = runtime_inputs->tca40_head_h_740bc0_ret8;
              fs.h_706940b_80 = runtime_inputs->tca40_head_h_706940b_h80;
              fs.obj_1e3 = runtime_inputs->tca40_head_obj_1e3;
              fs.obj_8 = runtime_inputs->tca40_head_obj_8;
              fs.h_74bae0 = runtime_inputs->tca40_head_h_74bae0;
              fs.h_74e9b0 = runtime_inputs->tca40_head_h_74e9b0_al;
              fs.slot_seed = runtime_inputs->tca40_head_slot_seed;
              fs.bm1 = runtime_inputs->tca40_head_bm1;
              fs.bm2 = runtime_inputs->tca40_head_bm2;
              fs.slot_occ0 = runtime_inputs->tca40_head_slot_occ0;
              fs.slot_occ1 = runtime_inputs->tca40_head_slot_occ1;
              fs.slot_occ2 = runtime_inputs->tca40_head_slot_occ2;
              fs.slot_occ3 = runtime_inputs->tca40_head_slot_occ3;
              fs.slot_occ4 = runtime_inputs->tca40_head_slot_occ4;
              fs.slot_occ5 = runtime_inputs->tca40_head_slot_occ5;
              fs.slot_occ6 = runtime_inputs->tca40_head_slot_occ6;
              fs.slot_occ7 = runtime_inputs->tca40_head_slot_occ7;
              fs.r74bba0b_f10_f8 = runtime_inputs->tca40_head_r74bba0b_f10_f8;
              fs.slot_8 = runtime_inputs->tca40_head_slot_8;
              fs.h_70d360 = runtime_inputs->tca40_head_h_70d360;
              fs.genrand_tail = runtime_inputs->tca40_head_genrand_tail;
              IsaacRoomTriggerClearAudio7f7a40FailOut f_out{};
              isaac_room_trigger_clear_audio_7f7a40_fail(&fs, &f_out);
            }
          }
        }

        /* ABI v95 (record idx 27 roomTriggerClearAudio): the always-music
           body 0x7f83b0 (called at 0x8069da with arg1=1, arg2=0) is
           split into TYPED HOST leaves when the seam is captured. The
           pure law decides the music path (arg2!=0 || value>rnd ||
           value>=1.0f); ready=0 (any capture missing) keeps the
           monolithic counter. The host must STILL run the gate leaves
           (0x749830/GetRoomByIdx/0x7f92b0 captured as results) and the
           music-body/door/SFX chain (FirstCollectibleOwner 0x9be080,
           door ops, 0x956780 remap + 0x92dc30 Play). */
        const uint32_t rtca_seed = runtime_inputs->room_trigger_clear_audio_seed;
        const uint32_t rtca_value = runtime_inputs->room_trigger_clear_audio_value;
        const uint32_t rtca_play = runtime_inputs->room_trigger_clear_audio_play_sound;
        const uint32_t rtca_gate = runtime_inputs->room_trigger_clear_audio_gate749830;
        const uint32_t rtca_room = runtime_inputs->room_trigger_clear_audio_room_match;
        /* ABI v133 (record idx27 roomTriggerClearAudio): the coarse @176
           fires ONLY on capture absence -- the v95 rtca carriers below
           keep modeling the music split on their own seams, and the
           tca83b0 pack carries the spawn tail when the music path
           reached it (music != 0). */
        const bool rtca_captured =
            rtca_seed != 0u || rtca_value != 0u || rtca_play != 0u ||
            rtca_gate != 0u || rtca_room != 0u;
        const bool tca83b0_live =
            runtime_inputs != nullptr &&
            runtime_inputs->tca83b0_tail_pack_ready != 0 &&
            runtime_inputs->tca83b0_tail_iter_count <= 8;
        /* ABI v137 (update-v137-audio-head-83b0-pack, record idx27):
           under the NEW tca83b0_head_pack_ready voucher (@17856; rows
           @17860..18012, contracts-audio-head-83b0 NOTES section 2)
           windows A-F decide IN-MODULE via the frozen roomTca83b0* laws
           consumed BY REFERENCE (skip L4 mirror of the landed
           gates_open pair, music = landed
           isaac_game_update_slice_room_trigger_clear_audio_music, the
           window-B dispatch probes + collect-walk count via the frozen
           isaac_room_trigger_clear_audio_83b0_door_walk_music_count and
           its UNSIGNED >=2 continue gate). The coarse @176 retires on
           the head decision PLUS the tail voucher for whichever tail
           window fired; on ALT-dispatch ticks the coarse KEEPS counting
           -- the ALT spawn tail has frozen law v84 but NO capture lanes
           yet (section 6 companion gap), so record idx27 stays NARROWED. */
        const bool head83_live =
            runtime_inputs->tca83b0_head_pack_ready != 0;
        int32_t tca83_coarse_fires;
        uint32_t n_alt = 0u; /* ABI v138: ALT rows consumed this tick. */
        if (!head83_live) {
          tca83_coarse_fires = (!(rtca_captured && tca83b0_live)) ? 1 : 0;
        } else {
          const uint32_t match83 =
              ((static_cast<int32_t>(runtime_inputs->tca83b0_head_room_idx_ret8) ==
                static_cast<int32_t>(runtime_inputs->tca83b0_head_game_18314))
                   ? 1u : 0u);
          /* roomTca83b0Skip(0, gate, match): arg2 folded 0 at 0x8069da. */
          const uint32_t skip83 =
              (runtime_inputs->tca83b0_head_gate_749830 == 0u ||
               match83 == 0u) ? 1u : 0u;
          if (skip83 == 1u) {
            tca83_coarse_fires = 0; /* pure-skip epilogue: no stores. */
          } else {
            const uint32_t music83 =
                isaac_game_update_slice_room_trigger_clear_audio_music(
                    0u, runtime_inputs->tca83b0_head_value_92b0_bits,
                    runtime_inputs->tca83b0_head_music_seed);
            if (music83 == 0u) {
              tca83_coarse_fires = 0; /* flag-store path, window A end. */
            } else {
              uint32_t free_mask83 = 0u;
              for (uint32_t i = 0; i < 8u; ++i) {
                const uint32_t occ = (i == 0u)
                    ? runtime_inputs->tca83b0_head_slot_occ0
                    : (i == 1u) ? runtime_inputs->tca83b0_head_slot_occ1
                    : (i == 2u) ? runtime_inputs->tca83b0_head_slot_occ2
                    : (i == 3u) ? runtime_inputs->tca83b0_head_slot_occ3
                    : (i == 4u) ? runtime_inputs->tca83b0_head_slot_occ4
                    : (i == 5u) ? runtime_inputs->tca83b0_head_slot_occ5
                    : (i == 6u) ? runtime_inputs->tca83b0_head_slot_occ6
                                : runtime_inputs->tca83b0_head_slot_occ7;
                if (occ == 0u) {
                  free_mask83 |= (1u << i);
                }
              }
              const uint32_t count83 =
                  isaac_room_trigger_clear_audio_83b0_door_walk_music_count(
                      runtime_inputs->tca83b0_head_random_int_rnd,
                      runtime_inputs->tca83b0_head_bm1_38, 0u,
                      free_mask83);
              const bool diverted83 =
                  runtime_inputs->tca83b0_head_owner_probe == 0u ||
                  runtime_inputs->tca83b0_head_bm2_non_null != 0u ||
                  count83 < 2u;
              /* ABI v138 (update-v138-audio-alt-tail-pack): route-split
                 retirement per NOTES 6C.3 -- the ALT band consumes the
                 stride-44 rows IN-MODULE via the frozen v84 law consumed
                 BY REFERENCE and applies each Out in PE order from the
                 scratch; magic_eq_e is DERIVED from the landed head row
                 tca83b0_head_door_magic (@17984) == 0xe (single pre-loop
                 latch writer @0x7f8ef5, falsifier 1). A captured
                 game_c == 0 yields div_ok=0 with a zeroed plan Out
                 (cpp:11846..59): no spawn for that row, contract total. */
              const bool alt_live =
                  runtime_inputs->tca83b0_alt_tail_pack_ready != 0 &&
                  runtime_inputs->tca83b0_alt_tail_iter_count <= 8u;
              if (alt_live) {
                const uint32_t na = static_cast<uint32_t>(
                    runtime_inputs->tca83b0_alt_tail_iter_count);
                for (uint32_t i = 0; i < na; ++i) {
                  const IsaacGameUpdateSliceTcaAltTailRow* row =
                      &runtime_inputs->tca83b0_alt_tail_rows[i];
                  IsaacRoomTca83B0AltItemSrc asrc{};
                  asrc.r_b = row->r_b;
                  asrc.r_c = row->r_c;
                  asrc.r_d = row->r_d;
                  asrc.r_e = row->r_e;
                  asrc.r_f = row->r_f;
                  asrc.r_g = row->r_g;
                  asrc.r_h = row->r_h;
                  asrc.vec_a_bits = runtime_inputs->tca83b0_alt_tail_vec_a_bits;
                  asrc.vec_b_bits = runtime_inputs->tca83b0_alt_tail_vec_b_bits;
                  asrc.magic_eq_e =
                      (runtime_inputs->tca83b0_head_door_magic == 0xeu)
                          ? 1u : 0u;
                  asrc.door_f24 = runtime_inputs->tca83b0_alt_tail_door_f24;
                  asrc.game_c = runtime_inputs->tca83b0_alt_tail_game_c;
                  asrc.cos_h_bits = row->cos_h_bits;
                  asrc.sin_h_bits = row->sin_h_bits;
                  asrc.item_px_bits = row->item_px_bits;
                  asrc.item_py_bits = row->item_py_bits;
                  isaac_room_trigger_clear_audio_83b0_tail_alt_item_plan(
                      &asrc, &scratch_tca83b0_alt_tail_plan_out[i]);
                }
                n_alt = na;
              }
              if (diverted83) {
                /* ALT band route: coarse fires iff the ALT voucher is
                 * absent (NOTES 6C.3 row 4 -- THE v137 blocker removed). */
                tca83_coarse_fires = (!alt_live) ? 1 : 0;
              } else {
                /* Main completion route: unchanged v137 shape. */
                tca83_coarse_fires = (!tca83b0_live) ? 1 : 0;
              }
            }
          }
        }
        if (tca83_coarse_fires == 1) {
          events->room_trigger_clear_audio += 1;
        }
        /* ABI v138: carrier @1144 UNPINNED -- rows consumed on
           music&&diverted ticks with the ALT voucher live, else 0.
           Main-completion counting stays @1104 (NOTES 6C.3 table). */
        events->room_trigger_clear_audio_alt_path_tail_spawns = n_alt;
        if (rtca_seed != 0u || rtca_value != 0u || rtca_play != 0u ||
            rtca_gate != 0u || rtca_room != 0u) {
          /* Gate leaves G1 (0x749830 result) + G2 (GetRoomByIdx match)
             must BOTH open at this callsite (arg2==0): a closed gate is
             a pure skip (PE 0x7f8407/0x7f8439 -> ret 0 with NO stores —
             no music AND no flag store). */
          const int32_t gates_open = (rtca_gate != 0u) && (rtca_room != 0u);
          if (gates_open) {
            const int32_t music = isaac_game_update_slice_room_trigger_clear_audio_music(
                0u /* arg2 == 0 at the 0x8069da callsite */, rtca_value, rtca_seed);
            if (music != 0) {
              events->room_trigger_clear_audio_music += 1;
            } else {
              events->room_trigger_clear_audio_flag_store += 1;
            }
            if (music != 0 && tca83b0_live) {
              /* ABI v133 (update-v133-audio-music-pack, record idx27): the
                 music path reached the spawn tail -- consume the tca83b0
                 rows IN-MODULE via the frozen room-pure ABI v82 plan and
                 publish the typed carrier. Host applies each plan-Out in
                 PE order (spawn 0x428b20 + [ent+0x474] + timers +
                 [vtbl+0xc]). */
              const uint32_t n83 = static_cast<uint32_t>(
                  runtime_inputs->tca83b0_tail_iter_count);
              for (uint32_t i = 0; i < n83; ++i) {
                const IsaacGameUpdateSliceTcaTailRow* row =
                    &runtime_inputs->tca83b0_tail_rows[i];
                IsaacRoomTca83B0TailItemSrc src{};
                src.r_a = row->r_a;
                src.r_b = row->r_b;
                src.r_c = row->r_c;
                src.r_d = row->r_d;
                src.r_e = row->r_e;
                src.r_f = row->r_f;
                src.r_g = row->r_g;
                src.vec0_bits = runtime_inputs->tca83b0_tail_vec0_bits;
                src.vec1_bits = runtime_inputs->tca83b0_tail_vec1_bits;
                src.door_f24 = runtime_inputs->tca83b0_tail_door_f24;
                src.game_c = runtime_inputs->tca83b0_tail_game_c;
                src.cos_h_bits = row->cos_h_bits;
                src.sin_h_bits = row->sin_h_bits;
                src.item_px_bits = row->ent_px_bits;
                src.item_py_bits = row->ent_py_bits;
                src.first_iter = (i == 0) ? 1u : 0u;
                isaac_room_trigger_clear_audio_83b0_tail_item_plan(
                  &src, &scratch_tca83b0_tail_plan_out[i]);
              }
              events->room_trigger_clear_audio_music_path_tail_spawns = n83;
            }
          }
          /* Caller SFX leaf: consume the record-31 sfx_plan law BY
             REFERENCE (PE 0x8069df playSound==0 -> id 0x24 remap +
             Play 1.0f/2/0/1.0f/0 @ [0xc7169c]+0x2a324). */
          IsaacGameUpdateSliceTriggerClearSfxPlan r31_sfx = {};
          isaac_game_update_slice_trigger_clear_sfx_plan(rtca_play, &r31_sfx);
          if (r31_sfx.armed != 0u) {
            events->room_trigger_clear_audio_sfx += 1;
          }
        }
        if (isaac_room_trigger_clear_needs_awards_bit7_walk(
                state->room_desc_flags_44) != 0) {
          /* ABI v134 (update-v134-awards-head-pack, records idx28/29):
             under the awards_head_ready voucher (@17540; src rows
             @17544..17648 mirroring IsaacRoomAwardSpawn7fb250Src) the
             frozen room-pure ABI v83 head plan runs IN-MODULE and
             publishes its Out as eight typed carriers. Retirement matrix
             (contracts-awards §3): exits {0 LUA_TAIL, 1 SFX_ARM,
             2 RT_END, 3 GREED_ARM(dispatch), 5 GATE_END, 6 RT_ALT}
             retire the coarse @184 unconditionally; exits {7 NO_SPAWNS,
             8 ID_ZERO} retire on the full count-law pack (ready covers
             all 27 rows). Capture absence keeps the coarse
             byte-for-byte. */
          /* ABI v140 (update-v140-awards-spawn-loop-pack, record idx29):
             exit {4 SPAWN_LOOP} retires under the awards_spawn_loop_
             ready voucher (@22000) when every body leaf is representable:
             the per-iteration body + B1 luck section run IN-MODULE via the
             frozen room-pure ABI v85 laws (consumed BY REFERENCE).
             ABI v141 (update-v141-b-block-probe-pack): the post-loop
             0xb-block (0x7fb9cc..0x7fbb04) is NO LONGER a blocker. Its
             three probes 0x9b92c0/0x7cb6e0/0x7c3980 are FROZEN room-pure
             ABI v86 laws consumed BY REFERENCE below, and the v140 note's
             "indirect vtable leaf [eax-0x18] @0x7fbabf" was a linear-
             decode MISDECODE (fresh span dump 007fb9cc.txt: ZERO indirect
             calls in the window; VA 0x7fbabf falls mid-instruction inside
             lea eax,[ebp-0xac]). The band + the {5,0x12c} extra create
             ([Game+0x26584]==0x2b) retire under the NEW awards_b_block_
             ready voucher (@22572): iter_count must EQUAL the PE loop
             recount sar(vec_end-vec_begin,2) and stay <= 8; absence /
             over-cap / recount mismatch keeps the coarse byte-for-byte.
             The host still executes every typed-host leaf: band gate
             0x44bfb0(0xb1) al + desc-chain bit (captured), pos walk
             0x813520 + draw 0x7e90f0 + creates 0x428b20 (carriers), roll
             apply-backs counters[this+0x1520+w%6*4]++ /
             [this+0x1574]|=0x41f (law isaac_room_roll_7c3980_flags_or),
             followup 0x7abd30 gate. */
          const bool awards_head_live =
              runtime_inputs != nullptr &&
              runtime_inputs->awards_head_ready != 0;
          if (awards_head_live) {
            IsaacRoomAwardSpawn7fb250Out head_out{};
            isaac_room_award_spawn_7fb250_head_plan(
                reinterpret_cast<const IsaacRoomAwardSpawn7fb250Src*>(
                    &runtime_inputs->awards_head_src_lua_gate),
                &head_out);
            events->room_awards_head_exit_kind = head_out.exit_kind;
            events->room_awards_head_sfx_arm = head_out.sfx_arm;
            events->room_awards_head_byte_6d = head_out.byte_6d;
            events->room_awards_head_variant_local =
                static_cast<uint32_t>(head_out.variant_local);
            events->room_awards_head_count = head_out.count;
            events->room_awards_head_id_final = head_out.id_final;
            events->room_awards_head_flag_66 = head_out.flag_66;
            events->room_awards_head_planned_spawns = head_out.planned_spawns;
            if ((head_out.exit_kind | 0) != 4) {
              /* Non-SPAWN_LOOP exits: retired unconditionally by the v134
                 matrix (decided in-module above). */
            } else {
              const uint32_t loop_n =
                  runtime_inputs->awards_spawn_loop_iter_count;
              const bool body_live =
                  runtime_inputs->awards_spawn_loop_ready != 0 &&
                  loop_n == head_out.count &&
                  loop_n <= ISAAC_GAME_UPDATE_AWARD_LOOP_MAX_ROWS;
              /* ABI v141 blocker lanes (PE 0x7fb9ea / 0x7fbb04). */
              const bool bb_armed =
                  runtime_inputs->awards_spawn_loop_tail_gate_b1_al != 0u &&
                  state->room_type_8 == 0xb;
              const bool tail_2b =
                  runtime_inputs->awards_spawn_loop_game_26584 == 0x2bu;
              /* PE loop recount @0x7fba7f..0x7fba92:
                 sar([Game+0x1baac]-[Game+0x1baa8], 2). */
              const uint32_t bb_count =
                  (runtime_inputs->awards_b_block_vec_end -
                   runtime_inputs->awards_b_block_vec_begin) >>
                  2;
              const bool bb_pack_live =
                  runtime_inputs->awards_b_block_ready != 0 &&
                  runtime_inputs->awards_b_block_iter_count == bb_count &&
                  bb_count <= ISAAC_GAME_UPDATE_B_BLOCK_MAX_ROWS;
              if (!body_live) {
                /* Poisoned/absent spawn-loop voucher: byte-for-byte. */
                events->room_trigger_clear_awards_bit7 += 1;
              } else if ((bb_armed || tail_2b) && !bb_pack_live) {
                /* Armed 0xb-band or 0x2b extra-create WITHOUT a valid
                   capture pack -> byte-for-byte (exact remaining lane
                   named by the missing voucher). */
                events->room_trigger_clear_awards_bit7 += 1;
              } else {
              /* Capture-live retirement: run the loop body + B1 luck
                 laws in-module and publish the typed carriers. The host
                 still executes every typed-host leaf (pos walk 0x813520 /
                 create relay 0x428b20 / door gate 0x822820 / door spawn
                 0x6e30a0 / sfx 0x9be080+0x8276e0); the module only
                 re-decides from the captured results. */
              uint32_t door_fires = 0;
              uint32_t chase_fires = 0;
              uint32_t flag_mask = 0;
              int32_t variant_cur =
                  static_cast<int32_t>(
                      runtime_inputs->awards_spawn_loop_variant0);
              const uint32_t n =
                  runtime_inputs->awards_spawn_loop_iter_count;
              for (uint32_t i = 0; i < n; ++i) {
                const IsaacGameUpdateSliceAwardLoopRow* row =
                    &runtime_inputs->awards_spawn_loop_rows[i];
                IsaacRoomAwardSpawn7fb250IterSrc isrc{};
                isrc.picked_id = head_out.id_final;
                isrc.variant_cur = static_cast<uint32_t>(variant_cur);
                isrc.counter = static_cast<int32_t>(i);
                isrc.count_limit = static_cast<int32_t>(head_out.count);
                isrc.flag_66 = head_out.flag_66;
                isrc.entity_type_28 = row->entity_type_28;
                isrc.entity_variant_2c = row->entity_variant_2c;
                isrc.entity_field_30 = row->entity_field_30;
                isrc.h_door_gate = row->door_gate_al;
                isrc.h_sfx_owner = row->sfx_owner;
                isrc.pos_x_bits = row->pos_x_bits;
                isrc.pos_y_bits = row->pos_y_bits;
                isrc.room_w = runtime_inputs->awards_spawn_loop_room_w_c;
                isrc.room_h = runtime_inputs->awards_spawn_loop_room_h_10;
                IsaacRoomAwardSpawn7fb250IterOut iout{};
                isaac_room_award_spawn_7fb250_iter_plan(&isrc, &iout);
                door_fires += iout.door_spawn_fired;
                chase_fires += iout.sfx_chase;
                flag_mask |= iout.flag_rmw << i;
                variant_cur = static_cast<int32_t>(iout.variant_next);
              }
              IsaacRoomAwardSpawn7fb250B1LuckSrc bsrc{};
              bsrc.h_quality_int =
                  runtime_inputs->awards_spawn_loop_b1_quality_int;
              bsrc.h_quality_f_bits =
                  runtime_inputs->awards_spawn_loop_b1_quality_f_bits;
              bsrc.h_rnd_f_bits =
                  runtime_inputs->awards_spawn_loop_b1_rnd_f_bits;
              IsaacRoomAwardSpawn7fb250B1LuckOut bout{};
              isaac_room_award_spawn_7fb250_b1_luck_gate(&bsrc, &bout);
              events->room_awards_spawn_loop_rows_applied = n;
              events->room_awards_spawn_loop_door_spawn_fires = door_fires;
              events->room_awards_spawn_loop_sfx_chase_fires = chase_fires;
              events->room_awards_spawn_loop_flag_rmw_mask = flag_mask;
              events->room_awards_spawn_loop_variant_final =
                  static_cast<uint32_t>(variant_cur);
              events->room_awards_spawn_loop_b1_pass = bout.pass;
              events->room_awards_spawn_loop_b1_site_armed = bout.pass;
              events->room_awards_spawn_loop_b1_chase_fired =
                  (bout.pass != 0u &&
                   runtime_inputs->awards_spawn_loop_b1_picker_al != 0u)
                      ? 1u
                      : 0u;
                static_assert(sizeof(IsaacRoomCountSrc) == 132,
                              "count src size");
                static_assert(sizeof(IsaacRoomIdx29AtOut) == 12,
                              "probe A out size");
                static_assert(sizeof(IsaacRoomRollOut) == 12,
                              "roll out size");
                static_assert(sizeof(IsaacRoomIdx29RollPlanOut) == 8,
                              "roll plan out size");
                if (bb_armed) {
                  /* ABI v141 capture-live: run the whole 0xb-block
                     in-module via the frozen room-pure ABI v86 laws
                     (consumed BY REFERENCE, never re-derived). Probe A
                     fetches from the CAPTURED element-value mirror; the
                     raw host addresses are opaque evidence only. At this
                     callsite the jb loop guard pins index<count UNSIGNED,
                     so the law's OOB-defect/fatal arms cannot fire -- the
                     defect stays pinned in the law and the carrier counts
                     it anyway. RNG state threads s0 across the pre-loop
                     draws (already applied in the capture) and every roll. */
                  uint32_t oob_defects = 0;
                  int32_t count_sum = 0;
                  uint32_t roll_first_mask = 0;
                  uint32_t roll_second_mask = 0;
                  uint32_t roll_index_sum = 0;
                  uint32_t followup_fires = 0;
                  uint32_t rng_s0 = runtime_inputs->awards_b_block_rng_s0;
                  const uint32_t rng_s1 =
                      runtime_inputs->awards_b_block_rng_s1;
                  const uint32_t rng_s2 =
                      runtime_inputs->awards_b_block_rng_s2;
                  const uint32_t rng_s3 =
                      runtime_inputs->awards_b_block_rng_s3;
                  const uint32_t* elems =
                      &runtime_inputs->awards_b_block_elem_values[0];
                  const uint32_t elems_begin =
                      static_cast<uint32_t>(
                          reinterpret_cast<uintptr_t>(elems));
                  for (uint32_t i = 0; i < bb_count; ++i) {
                    /* Probe A -- 0x009b92c0 (BY REFERENCE). */
                    IsaacRoomIdx29AtOut atout{};
                    isaac_room_idx29_at_9b92c0(
                        elems_begin, elems_begin + bb_count * 4u, i,
                        &atout);
                    oob_defects += atout.oob_defect;
                    const IsaacGameUpdateSliceBBlockRow* row =
                        &runtime_inputs->awards_b_block_rows[i];
                    /* Probe B -- FUN_007cb6e0 (BY REFERENCE); id is the
                       pinned 0xb1 arg (push 0xb1 @0x7fba9a). */
                    IsaacRoomCountSrc csrc{};
                    csrc.id = 0xb1u;
                    csrc.f13c0 = row->f13c0;
                    csrc.gate_202c = row->gate_202c;
                    csrc.gate_20a9 = row->gate_20a9;
                    csrc.mode_2663c =
                        runtime_inputs->awards_b_block_mode_2663c;
                    csrc.mode_26584 =
                        runtime_inputs->awards_spawn_loop_game_26584;
                    csrc.mgr_seed_264f8 =
                        runtime_inputs->awards_b_block_mgr_seed_264f8;
                    csrc.h_count15 = row->h_count15;
                    csrc.h_count40 = row->h_count40;
                    csrc.h_count4b = row->h_count4b;
                    csrc.h_bd_r = row->h_bd_r;
                    csrc.h_rng_raw = row->h_rng_raw;
                    csrc.has_8b = row->has_8b;
                    csrc.has_1ca = row->has_1ca;
                    csrc.has_1b7 = row->has_1b7;
                    csrc.slot0 = row->slot0;
                    csrc.slot1 = row->slot1;
                    csrc.block_nonnull = row->block_nonnull;
                    csrc.block0 = row->block0;
                    csrc.block4 = row->block4;
                    csrc.flag_17cc = row->flag_17cc;
                    csrc.item_begin = row->item_begin;
                    csrc.item_end = row->item_end;
                    csrc.item_w0 = row->item_w0;
                    csrc.item_w1 = row->item_w1;
                    csrc.byte_begin = row->byte_begin;
                    csrc.byte_end = row->byte_end;
                    csrc.byte_val = row->byte_val;
                    csrc.f2ef8 = row->f2ef8;
                    csrc.byte_2ef0 = row->byte_2ef0;
                    csrc.h_adder_17 = row->h_adder_17;
                    csrc.f18dc = row->f18dc;
                    csrc.f18e0 = row->f18e0;
                    IsaacRoomCountOut cout{};
                    isaac_room_count_7cb6e0_plan(&csrc, &cout);
                    count_sum += cout.result;
                    /* Caller glue 0x7fbab2/0x7fbacc (SIGNED jle, BY
                       REFERENCE) + Probe C -- FUN_007c3980 (BY
                       REFERENCE); s0 threads through [ebp-0xac]. */
                    IsaacRoomIdx29RollPlanOut rp{};
                    isaac_room_idx29_roll_plan(cout.result, &rp);
                    if (rp.roll_first != 0u) {
                      IsaacRoomRollOut rout{};
                      isaac_room_roll_7c3980_core(rng_s0, rng_s1, rng_s2,
                                                  rng_s3, &rout);
                      rng_s0 = rout.new_s0;
                      roll_first_mask |= 1u << i;
                      roll_index_sum += rout.index;
                      /* Host apply-backs per fire: 0x763570
                         unconditional; counters++/[this+0x1574]|=0x41f;
                         0x7abd30 iff both gates zero. */
                      followup_fires +=
                          isaac_room_roll_7c3980_followup_gate(
                              row->roll_f3fc, row->roll_byte_173);
                    }
                    if (rp.roll_second != 0u) {
                      IsaacRoomRollOut rout{};
                      isaac_room_roll_7c3980_core(rng_s0, rng_s1, rng_s2,
                                                  rng_s3, &rout);
                      rng_s0 = rout.new_s0;
                      roll_second_mask |= 1u << i;
                      roll_index_sum += rout.index;
                      followup_fires +=
                          isaac_room_roll_7c3980_followup_gate(
                              row->roll_f3fc, row->roll_byte_173);
                    }
                  }
                  events->room_awards_b_block_rows_applied = bb_count;
                  events->room_awards_b_block_oob_defects = oob_defects;
                  events->room_awards_b_block_count_sum = count_sum;
                  events->room_awards_b_block_roll_first_mask =
                      roll_first_mask;
                  events->room_awards_b_block_roll_second_mask =
                      roll_second_mask;
                  events->room_awards_b_block_roll_index_sum =
                      roll_index_sum;
                  events->room_awards_b_block_followup_fires =
                      followup_fires;
                  events->room_awards_b_block_rng_final = rng_s0;
                  events->room_awards_b_block_preloop_create_variant =
                      (runtime_inputs->awards_b_block_desc_chain_bit != 0u)
                          ? 0x64u
                          : 0x32u;
                }
                if (tail_2b) {
                  /* {5,0x12c} extra create @0x7fbb11..0x7fbb5f: pos walk
                     + draw stay typed-host (captured lanes); the fire is
                     published. Runs on the SAME bb_pack_live voucher. */
                  events->room_awards_b_block_tail_create_fired = 1u;
                }
              }
            }
          } else {
            events->room_trigger_clear_awards_bit7 += 1;
          }
        }
        if (isaac_room_trigger_clear_is_greed_mode(state->difficulty_269c8) !=
            0) {
          /* ABI v131 (update-v131-greed-probe-pack, record idx 30
             roomTriggerClearAwardsGreed REMOVED): the greedy-arm residual
             was exactly the probe band 0x9bf990/0x9bfa00/0x9bfa70 (pure
             reads over the entity list) + the 0x9bfae0 fire loop
             (typed-host 0x7d93b0(this=e) leaf per qualifying element).
             room-pure ABI v81 freezes those bodies (consumed BY
             REFERENCE); under the greed_probe_pack_ready voucher
             (@15504, rows @15512..15736, cap 8) the module computes all
             three probes IN-MODULE and publishes the fire plan as typed
             carriers -- the coarse edge carries no information and is
             RETIRED. Capture absence or over-cap keeps the pre-v95
             monolith byte-for-byte. */
          const bool greed_pack_live =
              runtime_inputs != nullptr &&
              runtime_inputs->greed_probe_pack_ready != 0 &&
              runtime_inputs->greed_probe_elem_count <= 8u;
          if (!greed_pack_live) {
            events->room_trigger_clear_awards_greed += 1;
          }
          if (greed_pack_live) {
            const uint32_t n = runtime_inputs->greed_probe_elem_count;
            IsaacRoomGreedProbeElem elems[8];
            for (uint32_t i = 0; i < n; ++i) {
              const IsaacGameUpdateSliceGreedProbeRow* row =
                  &runtime_inputs->greed_probe_elems[i];
              elems[i].f2c = row->f2c;
              elems[i].f3bc = row->f3bc;
              elems[i].has_parent = row->has_parent;
              elems[i].parent_161c = row->parent_161c;
              elems[i].self_161c = row->self_161c;
              elems[i].parent_is_self = row->parent_is_self;
              elems[i].f20a9 = row->f20a9;
            }
            events->room_trigger_clear_awards_greed_probe_9bf990 =
                isaac_room_greed_probe_9bf990(elems, n);
            events->room_trigger_clear_awards_greed_probe_9bfa00 =
                isaac_room_greed_probe_9bfa00(elems, n);
            events->room_trigger_clear_awards_greed_probe_9bfa70 =
                isaac_room_greed_probe_9bfa70(elems, n);
            IsaacRoomGreedFire9bfae0PlanOut fire{};
            isaac_room_greed_fire_9bfae0_plan(elems, n, &fire);
            events->room_trigger_clear_awards_greed_fire_count =
                fire.fire_count;
            events->room_trigger_clear_awards_greed_fire_mask =
                fire.fire_mask;
          }
        }
        /* ABI v135 (update-v135-deep-music-pack, record idx28
           roomTriggerClearAwardsNonGreed): under the tca_dm_gate_ready
           voucher (@17652; 11 gate rows @17656..17692) the deep-music
           gate band decides IN-MODULE via the landed law consumed BY
           REFERENCE; when it OPENS the typed fire carrier @1140
           publishes and the flags-or 0x10000 apply-back runs on inout
           state. Capture absence keeps the coarse @180 monolith
           byte-for-byte (restored: the interrupted v136 session had
           dropped this block from the cpp). */
        if (isaac_room_trigger_clear_needs_non_greed_host(
                state->difficulty_269c8) != 0) {
          const bool tca_dm_live =
              runtime_inputs->tca_dm_gate_ready != 0;
          if (!tca_dm_live) {
            events->room_trigger_clear_awards_non_greed += 1;
          } else {
            IsaacGameUpdateSliceTriggerClearDeepMusic dm{};
            isaac_game_update_slice_trigger_clear_deep_music_gate(
                runtime_inputs->tca_dm_head_clear_1bb84,
                runtime_inputs->tca_dm_probe_a_9e9b50,
                runtime_inputs->tca_dm_probe_b_9595e0,
                runtime_inputs->tca_dm_byte_26588,
                runtime_inputs->tca_dm_vec_begin_4b3d8,
                runtime_inputs->tca_dm_vec_end_4b3dc,
                runtime_inputs->tca_dm_count_334,
                state->game_flags_1839c,
                runtime_inputs->tca_dm_room_match_ret8,
                runtime_inputs->clear_path_game_mode_0,
                runtime_inputs->tca_dm_game4,
                static_cast<uint32_t>(state->frame_counter_264f8),
                &dm);
            if (dm.fire != 0u) {
              events->room_trigger_clear_deep_music_fire = 1;
              state->game_flags_1839c |= dm.flag_or_10000;
            }
          }
        }
        /* Clear-path tail residual close: unconditional at this scope
          (model :12334 twin -- every tick reaching the clear tail
          with flags44&9==0 and not the type-0x10/2 room counts it).
          Restored: the interrupted v136 session dropped this edge. */
        events->room_trigger_clear_awards_tail += 1;
      }
    }
  }

  /* Type-5 door loop (VA ~0x008042a8, always runs after the clear path).
     Door result merge law (ABI v95): when clear-path doors mutated the
     snapshot, host is forced; otherwise the pure-gated type-5 decision over
     the pre-clear door_slots stands.
     ABI v119 (update-v119-door-removal): record idx 33
     opaqueRoomUpdateClearDoors REMOVED (40 -> 39; 10th removal). The
     coarse edge is RETIRED — per-arm typed carriers fire under the SAME
     pure merge law: gated arm -> type5_door_open_calls = plan.count > 0
     (plan predicate present!=0 && field_c==5 && !early_out is IDENTICAL
     to the any_type5_needs_host gate); forced arm -> the new
     type5_door_forced_rerun @992 (the two arms are mutually exclusive on
     clear_path_door_slots_emitted, so exactly one carrier fires per
     coarse firing; same tick, same order position). No capture gate
     exists (door_slots are captured runtime inputs), so there is no
     capture-absence arm: the coarse counter @196 STAYS in the frozen ABI
     but NEVER fires. */
  {
    IsaacDoorSlotFields slots[ISAAC_GAME_UPDATE_TYPE5_DOOR_SLOT_COUNT];
    for (int i = 0; i < ISAAC_GAME_UPDATE_TYPE5_DOOR_SLOT_COUNT; ++i) {
      slots[i].present = runtime_inputs->door_slots[i].present;
      slots[i].field_3a0 = runtime_inputs->door_slots[i].field_3a0;
      slots[i].field_8 = runtime_inputs->door_slots[i].field_8;
      slots[i].field_c = runtime_inputs->door_slots[i].field_c;
    }
    if (isaac_game_update_slice_clear_path_door_result_merge(
            (uint32_t)clear_path_door_slots_emitted,
            (uint32_t)isaac_door_slots_710dd0_any_type5_needs_host(slots)) !=
        0) {
      if (clear_path_door_slots_emitted == 0) {
        /* Gated arm: the pre-clear snapshot is valid -> land the type-5
           door-loop frame laws in-module (count bound / per-door state /
           arg prep; census update-v95-clear-doors-type5) and TYPE the door
           open calls: plan.count > 0 == the any_type5_needs_host gate
           above, so the plan fires exactly with the coarse event. The host
           consumer runs 0x710dd0(Room+0x724[entry.slot_index]) per entry
           (arg prep: thiscall door ptr, 0 stack args). Forced arm
           publishes NO plan (post-clear door states are host-time). */
        IsaacGameUpdateSliceType5DoorOpenPlan* plan =
            reinterpret_cast<IsaacGameUpdateSliceType5DoorOpenPlan*>(
                scratch_type5_door_open_plan);
        isaac_game_update_slice_type5_door_open_plan(
            runtime_inputs->door_slots, plan);
        events->type5_door_open_calls = plan->count;
      } else {
        /* ABI v119 forced arm: the clear-path door residual ran (idx-24
           mask != 0) -> the pre-clear snapshot is stale, so the machine
           re-runs the 8-slot type-5 loop over POST-clear door states
           (census update-v95-clear-doors-type5). Typed carrier
           type5_door_forced_rerun @992 fires 1-per-tick under the SAME
           merge law that armed the retired coarse edge. */
        events->type5_door_forced_rerun += 1;
      }
    }
  }
  events->continuation_kind = ISAAC_GAME_UPDATE_RESUME_AFTER_ROOM_UPDATE_CLEAR;
  return 1;
}

extern "C" int32_t isaac_game_update_slice_resume_room_clear_nested(
    IsaacGameUpdateSliceState* state,
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs,
    IsaacGameUpdateSliceEvents* events) {
  if (state == nullptr || runtime_inputs == nullptr || events == nullptr ||
      events->continuation_kind != ISAAC_GAME_UPDATE_RESUME_AFTER_ROOM_CLEAR_NESTED) {
    return 0;
  }

  /* Host already applied nested FrameEffect_6fd7c0 residual without engine pure
     sparse / P4 and recaptured Game sparse. Site B anim=0. Apply pure engine
     sparse + P4, then gated type-5 doors. Type 0x10 subtype 3 skips clear-path
     so door snapshot is still valid. */
  apply_frame_effect_6fd7c0_pure_after_host(state, runtime_inputs, 0);
  IsaacDoorSlotFields slots[ISAAC_GAME_UPDATE_TYPE5_DOOR_SLOT_COUNT];
  for (int i = 0; i < ISAAC_GAME_UPDATE_TYPE5_DOOR_SLOT_COUNT; ++i) {
    slots[i].present = runtime_inputs->door_slots[i].present;
    slots[i].field_3a0 = runtime_inputs->door_slots[i].field_3a0;
    slots[i].field_8 = runtime_inputs->door_slots[i].field_8;
    slots[i].field_c = runtime_inputs->door_slots[i].field_c;
  }
  /* No clear-path door residual ran here (subtype 3 skips it), so the merge
     degenerates to the pure type-5 gate; law keeps the decision pinned.
     ABI v119: the coarse edge is RETIRED here too — the gated arm's typed
     carrier type5_door_open_calls (plan.count > 0 == the same gate) is
     the host signal; the coarse counter @196 NEVER fires. */
  if (isaac_game_update_slice_clear_path_door_result_merge(
          0u, (uint32_t)isaac_door_slots_710dd0_any_type5_needs_host(slots)) != 0) {
    IsaacGameUpdateSliceType5DoorOpenPlan* plan =
        reinterpret_cast<IsaacGameUpdateSliceType5DoorOpenPlan*>(
            scratch_type5_door_open_plan);
    /* Snapshot valid on the nested site (clear-path skipped): type the
       door open calls like the gated arm above. */
    isaac_game_update_slice_type5_door_open_plan(runtime_inputs->door_slots,
                                                 plan);
    events->type5_door_open_calls = plan->count;
  }
  events->continuation_kind = ISAAC_GAME_UPDATE_RESUME_AFTER_ROOM_UPDATE_CLEAR;
  return 1;
}

extern "C" int32_t isaac_game_update_slice_resume_room_update_clear(
    IsaacGameUpdateSliceState* state,
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs,
    IsaacGameUpdateSliceEvents* events) {
  if (state == nullptr || runtime_inputs == nullptr || events == nullptr ||
      events->continuation_kind != ISAAC_GAME_UPDATE_RESUME_AFTER_ROOM_UPDATE_CLEAR) {
    return 0;
  }

  /* Host already applied B12 clear residual fragments. Hybrid recaptured Game
     sparse + Room ambient sparse (7454/7458/745c) and ambient_* runtime gates.
     ABI v37: pure FUN_00824800 float shell then ordered PE host fragments. */
  IsaacRoomAmbient824800State amb = {};
  amb.count_7454 = state->room_ambient_count_7454;
  amb.intensity_7458 = state->room_ambient_intensity_7458;
  amb.flag_745c = state->room_ambient_flag_745c & 0xffu;
  isaac_room_ambient_824800_float_step(&amb);
  state->room_ambient_count_7454 = amb.count_7454;
  state->room_ambient_intensity_7458 = amb.intensity_7458;
  state->room_ambient_flag_745c = amb.flag_745c & 0xffu;

  /* H0 FUN_008024f0: host residual unless flags early-out ((Flags>>1)&1). */
  if (isaac_room_ambient_8024f0_flags_early_out(state->room_desc_flags_44) == 0u) {
    events->opaque_room_update_ambient_8024f0 += 1;
  }
  /* H1 FUN_007f01c0 pure early-out inverse. */
  if (isaac_room_ambient_7f01c0_needs_host(
          state->gate_1b83c, runtime_inputs->ambient_desc_present, state->room_type_8,
          runtime_inputs->ambient_desc_id, runtime_inputs->ambient_player_count) != 0) {
    events->opaque_room_update_ambient_7f01c0 += 1;
  }
  /* H2 stage ambient spawn: greed remap then may-RNG pure gate. */
  {
    int32_t stage = runtime_inputs->ambient_stage;
    int32_t stage_type = runtime_inputs->ambient_stage_type;
    isaac_room_ambient_greed_stage_remap(state->difficulty_269c8, &stage, &stage_type);
    if (isaac_room_ambient_stage_spawn_may_rng(stage, stage_type) != 0) {
      events->opaque_room_update_ambient_stage_spawn += 1;
    }
  }
  /* H3 mode/stage SFX: pure-complete skip when mode!=0x2c && 1830c==2. */
  if (isaac_room_ambient_mode_sfx_needs_host(
          state->mode_26584, state->room_transition_mode_1830c) != 0) {
    events->opaque_room_update_ambient_mode_sfx += 1;
  }
  /* H4 FUN_00824800 spawn residual after pure float shell. */
  if (isaac_room_ambient_824800_needs_spawn_host(&amb) != 0) {
    events->opaque_room_update_ambient_824800_spawn += 1;
  }
  /* H5 FUN_00824a70: pure force/mineshaft/dim/cadence gate (helpers ABI v17).
     ABI v47: when needs_host and h5_body_blob_ready, pure body_bounds yields
     loop_count; residual fragments genrand (loop*7) + create (loop) past pure
     posts; summary 824a70 still marks residual open. Without blob: monolithic
     summary only (HostHandler owns full genrand×8 body). */
  if (isaac_room_ambient_824a70_needs_host(
          state->mode_26584, state->room_transition_mode_1830c,
          runtime_inputs->ambient_stage_id, state->room_type_8,
          runtime_inputs->ambient_room_subtype_1bb0, runtime_inputs->engine_game_18304,
          state->difficulty_269c8, runtime_inputs->ambient_stage,
          runtime_inputs->ambient_stage_type, state->flags_2654c,
          runtime_inputs->ambient_room_active, state->frame_counter_264f8,
          runtime_inputs->ambient_room_entry_11f0) != 0) {
    events->opaque_room_update_ambient_824a70 += 1;
    if (runtime_inputs->h5_body_blob_ready != 0) {
      IsaacRoomAmbient824a70BodyBounds bounds = {};
      isaac_room_ambient_824a70_body_bounds(
          runtime_inputs->ambient_room_active, state->frame_counter_264f8,
          runtime_inputs->ambient_room_entry_11f0, runtime_inputs->ambient_room_f14,
          runtime_inputs->ambient_room_f18, runtime_inputs->ambient_room_f1c,
          runtime_inputs->ambient_room_f20, &bounds);
      /* ABI v95: the per-loop LOOP-COUNT-FROM-AGE law (PE 0x824b60 test
         ecx,ecx / 0x824b7f sete al / 0x824b9c lea eax,[eax*4+1]) is landed
         in-module; the typed per-loop create plans iterate it. */
      int32_t loops =
          isaac_game_update_slice_ambient_824a70_loop_count_from_age(
              (uint32_t)bounds.age);
      if (loops < 0) loops = 0;
      if (loops > ISAAC_AMBIENT_824A70_MAX_LOOPS)
        loops = ISAAC_AMBIENT_824A70_MAX_LOOPS; /* defensive cap; PE is 1 or 5 */
      events->ambient_824a70_loop_count = loops;
      /* ABI v52: consume the Room family's recovered MT19937 rather than
         hosting the draws. The plan reports genrand_pure only when the caller
         supplied mt[624] + mti AND the useCrtRand low byte is clear; the PE
         early-returns at 0x006eefa9 before touching state when it is set, so
         that case must stay host and must not advance mt[]. */
      IsaacRoomAmbient824a70GenrandMtPlan mt_plan = {};
      isaac_room_ambient_824a70_genrand_mt_plan(
          loops, runtime_inputs->genrand_mt_ready != 0 ? 1 : 0,
          runtime_inputs->genrand_mode_flag, &mt_plan);
      if (mt_plan.genrand_pure != 0) {
        IsaacRoomGenrandFill fill = {};
        isaac_room_ambient_824a70_genrand_mt_samples(
            scratch_genrand_state, runtime_inputs->genrand_index_in, loops,
            runtime_inputs->genrand_mode_flag, scratch_genrand_samples, &fill);
        scratch_genrand_index_out = fill.index_out;
        events->ambient_824a70_genrand_samples = fill.count;
        /* ABI v95: per-loop typed CREATE-arm plans. Samples are 7 per loop
           (R0,R1,R2,R3,R5,R6,R7); the R3 slot (i*7+3) is the create seed the
           PE pushes at 0x00824ca4. The typed plan (PE 0x00824c97..0x00824cc2:
           type 0x3e8 / variant 0x8a / layer 0 / data 0xb1bc54 / a1 1 / seed /
           game 0xc71678) types every loop's entity-create HOST call — the
           0x6fe410 create itself STAYS TYPED HOST (R3 log-split precedent:
           the host edge still fires, the event + scratch carry the plan). */
        const int32_t plan_loops =
            loops < (int32_t)ISAAC_AMBIENT_824A70_MAX_LOOPS
                ? loops
                : (int32_t)ISAAC_AMBIENT_824A70_MAX_LOOPS;
        for (int32_t i = 0; i < plan_loops; ++i) {
          const uint32_t seed = scratch_genrand_samples[i * 7 + 3];
          IsaacGameUpdateSliceAmbient824a70CreateArgs plan = {};
          isaac_game_update_slice_ambient_824a70_create_args_plan(seed, &plan);
          uint32_t* dst = &scratch_ambient_824a70_create_args[i * 7];
          dst[0] = plan.effect_type;
          dst[1] = plan.effect_variant;
          dst[2] = plan.layer_index;
          dst[3] = plan.anm_data_ptr;
          dst[4] = plan.a1_arg;
          dst[5] = plan.seed;
          dst[6] = plan.game_ptr_global;
        }
        events->ambient_824a70_create_typed = (uint32_t)plan_loops;
      } else {
        /* Host genrand sites R0,R1,R2,R3,R5,R6,R7 = 7 per loop. */
        events->opaque_room_update_ambient_824a70_genrand +=
            (uint32_t)(loops * 7);
        /* Seeds are not in-module on the host-genrand arm: no typed plans. */
        events->ambient_824a70_create_typed = 0;
      }
      /* Create + ANM2 + GetLayer + vcall residual per loop (R4 cond inside). */
      events->opaque_room_update_ambient_824a70_create += (uint32_t)loops;
    }
  }
  /* H6 FUN_00824ee0 PE-zero early-out. */
  if (isaac_room_ambient_24ee0_needs_host(runtime_inputs->ambient_vel_x_7460,
                                          runtime_inputs->ambient_vel_y_7464) != 0) {
    events->opaque_room_update_ambient_24ee0 += 1;
  }
  /* H7 FUN_0074e9b0: pure-false early-out skips host + parent float stores. */
  if (isaac_room_ambient_74e9b0_pure_false(state->difficulty_269c8,
                                           runtime_inputs->ambient_stage,
                                           state->flags_2654c) == 0) {
    events->opaque_room_update_ambient_74e9b0 += 1;
  }
  /* H8 special room 0x10 / id 0x23. */
  if (isaac_room_ambient_special_1023_needs_host(
          runtime_inputs->ambient_desc_present, state->room_type_8,
          runtime_inputs->ambient_desc_id) != 0) {
    events->opaque_room_update_ambient_special_1023 += 1;
  }

  /* Summary for hybrid host log / frame-path (any fragment residual). */
  if (events->opaque_room_update_ambient_8024f0 != 0 ||
      events->opaque_room_update_ambient_7f01c0 != 0 ||
      events->opaque_room_update_ambient_stage_spawn != 0 ||
      events->opaque_room_update_ambient_mode_sfx != 0 ||
      events->opaque_room_update_ambient_824800_spawn != 0 ||
      events->opaque_room_update_ambient_824a70 != 0 ||
      events->opaque_room_update_ambient_24ee0 != 0 ||
      events->opaque_room_update_ambient_74e9b0 != 0 ||
      events->opaque_room_update_ambient_special_1023 != 0) {
    events->opaque_room_update_ambient = 1;
  }

  events->continuation_kind = ISAAC_GAME_UPDATE_RESUME_AFTER_ROOM_UPDATE_HEAD;
  return 1;
}

/* ---- ABI v71: FUN_004257b0 Pass A + Pass B pure bodies -------------------

   Every law below is CONSUMED from the frozen frame-opaque v27/v28/v29
   contract; nothing here re-derives one. The Update slice owns only the
   plumbing: shaping the captured samples, the two cap gates, the F4
   recapture decision, and the published accounting.

   PE re-check for this wire (capstone 5.0.7, CS_MODE_32, linear decode from
   the function start with a resync loop; 0 resyncs over
   [0x004257b0, 0x004258a0)):

     004257ee  je 0x425870      id_count == 0 skips Pass A ENTIRELY and lands
                                on the recount with the list untouched — so
                                the PRE-captured F4 pair is already the post
                                value and recapturing there would be the
                                recapture-on-one-path defect in the other
                                direction.
     00425870  the recount reads [this] at 0x00425879 and [this+4] at
               0x00425883 — the SAME instant, from the LIVE object.
     00425894  je 0x4259a2      a zero post count returns before Pass B. */

struct FrameOpaque4257b0Plan {
  int32_t usable;      /* blob ready and every captured count inside its cap */
  uint32_t id_count;   /* 0x009b9480 over the player samples */
  uint32_t pre_count;  /* 0x68-stride count of the PRE F4 pair */
  uint32_t cap_count;  /* elements the captured Game+0x1bbe8 capacity holds */
  uint32_t player_count;
  uint32_t elem_count;
  uint32_t resolved;   /* ids whose (lo, hi) pair the samples resolved */
  uint32_t pairs[2 * ISAAC_FRAME_OPAQUE_4257B0_MAX_PLAYERS];
};

/* Shape the captured samples and evaluate the two counts the caps depend on.
   `usable` is 0 whenever the pre-v71 host residual must run instead. */
void frame_opaque_4257b0_plan(
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs,
    FrameOpaque4257b0Plan* out) {
  out->usable = 0;
  out->id_count = 0u;
  out->pre_count = 0u;
  out->cap_count = 0u;
  out->player_count = 0u;
  out->elem_count = 0u;
  out->resolved = 0u;
  for (int32_t i = 0; i < 2 * ISAAC_FRAME_OPAQUE_4257B0_MAX_PLAYERS; ++i) {
    out->pairs[i] = 0u;
  }
  if (runtime_inputs == nullptr ||
      runtime_inputs->frame_opaque_4257b0_blob_ready == 0u) {
    return;
  }
  /* Game+0x1baa8/+0x1baac and the container bounds are pointer vectors:
     the count law is the PE `SAR 2` (frame-opaque vector_count). */
  const int32_t players = isaac_frame_opaque_98dba0_vector_count(
      runtime_inputs->frame_opaque_4257b0_idvec_begin,
      runtime_inputs->frame_opaque_4257b0_idvec_end);
  const int32_t elems = isaac_frame_opaque_98dba0_vector_count(
      runtime_inputs->frame_opaque_4257b0_ctr_begin,
      runtime_inputs->frame_opaque_4257b0_ctr_end);
  if (players < 0 || players > ISAAC_FRAME_OPAQUE_4257B0_MAX_PLAYERS ||
      elems < 0 || elems > ISAAC_FRAME_OPAQUE_4257B0_MAX_ELEMS) {
    return;
  }
  /* The PE's SIGNED magic division of the F4 pair, read together at one
     instant — never an unsigned delta / 0x68. */
  const uint32_t pre = isaac_frame_opaque_4257b0_list_count_from_bounds(
      runtime_inputs->frame_opaque_4257b0_list_begin,
      runtime_inputs->frame_opaque_4257b0_list_end);
  if (pre > (uint32_t)ISAAC_FRAME_OPAQUE_4257B0_MAX_LIST) {
    return;
  }
  out->player_count = (uint32_t)players;
  out->elem_count = (uint32_t)elems;
  out->pre_count = pre;
  out->cap_count = isaac_frame_opaque_4257b0_list_count_from_bounds(
      runtime_inputs->frame_opaque_4257b0_list_begin,
      runtime_inputs->frame_opaque_4257b0_list_cap);
  out->id_count = isaac_frame_opaque_9b9480_count(
      runtime_inputs->frame_opaque_4257b0_q_ptrs,
      runtime_inputs->frame_opaque_4257b0_p_ptrs,
      runtime_inputs->frame_opaque_4257b0_q_161cs,
      runtime_inputs->frame_opaque_4257b0_p_161cs, out->player_count);
  /* The buffer must hold pre_count + every append Pass A could make. */
  if (pre + out->id_count > (uint32_t)ISAAC_FRAME_OPAQUE_4257B0_MAX_LIST) {
    out->id_count = 0u;
    out->pre_count = 0u;
    out->cap_count = 0u;
    out->player_count = 0u;
    out->elem_count = 0u;
    return;
  }
  out->usable = 1;
}

/* Rebuild the 0x68-stride working buffer from the captured triples and, when
   the plan resolved ids, run the frozen Pass A count evolution over it.
   Returns the post-Pass-A element count (the value the PE re-derives at
   0x00425870 from the LIVE pointers). Deterministic in (runtime_inputs), so
   the resume can reproduce it without carrying state across the boundary. */
uint32_t frame_opaque_4257b0_build_list(
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs,
    FrameOpaque4257b0Plan* plan,
    int32_t run_pass_a) {
  for (int32_t i = 0; i < kFrameOpaque4257b0BytesSize; ++i) {
    scratch_frame_opaque_4257b0_bytes[i] = 0;
  }
  for (uint32_t i = 0; i < plan->pre_count; ++i) {
    uint8_t* elem = scratch_frame_opaque_4257b0_bytes +
                    (size_t)i * (size_t)kFrameOpaque4257b0ElemStride;
    write_u32(elem + 0, runtime_inputs->frame_opaque_4257b0_list_lo[i]);
    write_u32(elem + 4, runtime_inputs->frame_opaque_4257b0_list_hi[i]);
    write_u32(elem + ISAAC_FRAME_OPAQUE_4257B0_ENTRY_VALUE_OFF,
              runtime_inputs->frame_opaque_4257b0_list_slot8[i]);
  }
  if (run_pass_a == 0 || plan->id_count == 0u) {
    return plan->pre_count;
  }
  /* 0x004257fb call 0x9b9310 + 0x00425801 call 0x4264c0, per id, in id
     order — the whole resolution is the frozen v29 pairs export. */
  plan->resolved = isaac_frame_opaque_4257b0_pass_a_pairs_from_samples(
      plan->pairs, (uint32_t)(2 * ISAAC_FRAME_OPAQUE_4257B0_MAX_PLAYERS),
      runtime_inputs->frame_opaque_4257b0_p_ptrs,
      runtime_inputs->frame_opaque_4257b0_p_ids_1618,
      runtime_inputs->frame_opaque_4257b0_p_161cs,
      runtime_inputs->frame_opaque_4257b0_q_ptrs,
      runtime_inputs->frame_opaque_4257b0_q_161cs,
      runtime_inputs->frame_opaque_4257b0_q_ids_1618,
      runtime_inputs->frame_opaque_4257b0_qq_ptrs,
      runtime_inputs->frame_opaque_4257b0_qq_161cs, plan->player_count,
      isaac_frame_opaque_98dba0_mp_range_empty(
          runtime_inputs->frame_opaque_4257b0_ctr_begin,
          runtime_inputs->frame_opaque_4257b0_ctr_end),
      runtime_inputs->frame_opaque_4257b0_elem_ids,
      runtime_inputs->frame_opaque_4257b0_elem_sub_ptrs,
      runtime_inputs->frame_opaque_4257b0_elem_sub_los,
      runtime_inputs->frame_opaque_4257b0_elem_sub_his, plan->elem_count,
      plan->id_count);
  /* 0x00425810 considered gate + 0x00425817 live duplicate scan +
     0x00425850 append, the whole loop as the frozen v27 evolution. */
  return isaac_frame_opaque_4257b0_pass_a_count_evolution(
      scratch_frame_opaque_4257b0_bytes, plan->pre_count, plan->pairs,
      plan->resolved);
}

/* Publish element +0 / +4 / +8 for the first `count` elements. */
void frame_opaque_4257b0_publish(uint32_t count) {
  for (int32_t i = 0; i < 3 * kFrameOpaque4257b0MaxList; ++i) {
    scratch_frame_opaque_4257b0_list_out[i] = 0u;
  }
  const uint32_t bound = count > (uint32_t)kFrameOpaque4257b0MaxList
                             ? (uint32_t)kFrameOpaque4257b0MaxList
                             : count;
  for (uint32_t i = 0; i < bound; ++i) {
    const uint8_t* elem = scratch_frame_opaque_4257b0_bytes +
                          (size_t)i * (size_t)kFrameOpaque4257b0ElemStride;
    scratch_frame_opaque_4257b0_list_out[i] = read_u32(elem + 0);
    scratch_frame_opaque_4257b0_list_out[(uint32_t)kFrameOpaque4257b0MaxList + i] =
        read_u32(elem + 4);
    scratch_frame_opaque_4257b0_list_out[2u * (uint32_t)kFrameOpaque4257b0MaxList + i] =
        read_u32(elem + ISAAC_FRAME_OPAQUE_4257B0_ENTRY_VALUE_OFF);
  }
}

/* Pass B over the already-evolved buffer, gated on the post-Pass-A count.
   `post_begin`/`post_end` are the F4 pair that governs THIS entry — the
   pre-captured pair on the id_count == 0 path, the recaptured pair on the
   path where Pass A ran. They are always consumed as a pair. */
void frame_opaque_4257b0_pass_b(
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs,
    const FrameOpaque4257b0Plan* plan, uint32_t post_begin, uint32_t post_end,
    uint32_t post_count, IsaacGameUpdateSliceEvents* events) {
  /* 0x00425894 je 0x4259a2 — a zero recaptured count never enters. */
  if (isaac_frame_opaque_4257b0_pass_b_needs_host_recaptured(post_count) == 0) {
    events->frame_opaque_4257b0_pass_b_applied = 1u;
    return;
  }
  events->frame_opaque_4257b0_pass_b_applied = 1u;
  events->frame_opaque_4257b0_pass_b_stores = isaac_frame_opaque_4257b0_pass_b_apply(
      scratch_frame_opaque_4257b0_bytes, post_begin, post_end,
      runtime_inputs->frame_opaque_4257b0_ctr_begin,
      runtime_inputs->frame_opaque_4257b0_ctr_end,
      runtime_inputs->frame_opaque_4257b0_elem_sub_ptrs,
      runtime_inputs->frame_opaque_4257b0_elem_sub_los,
      runtime_inputs->frame_opaque_4257b0_elem_sub_his,
      runtime_inputs->frame_opaque_4257b0_elem_ids,
      (uint32_t)ISAAC_FRAME_OPAQUE_4257B0_MAX_ELEMS,
      runtime_inputs->frame_opaque_4257b0_idvec_begin,
      runtime_inputs->frame_opaque_4257b0_idvec_end,
      runtime_inputs->frame_opaque_4257b0_p_ids_1618,
      runtime_inputs->frame_opaque_4257b0_p_chars_13c0,
      (uint32_t)ISAAC_FRAME_OPAQUE_4257B0_MAX_PLAYERS, plan->id_count,
      runtime_inputs->frame_opaque_4257b0_initial_byte13);
}

/* STOP-fold emission, shared by the empty arm and the dispatch's STOP
   arm (differential case 495: an inline-only emission let -O2/-O3 vacate
   the STOP assignment on the count==0 path and fall into the MONOLITHIC
   default). The body is the fold's applied/failed event write-back. */
static void emit_sfx_stop_fold(
    IsaacGameUpdateSliceEvents* events,
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs) {
  const uint32_t sfx_stop_ready =
      runtime_inputs != nullptr ? runtime_inputs->sfx_stop_ready : 0u;
  const int32_t sfx_stop_span =
      runtime_inputs != nullptr ? (int32_t)runtime_inputs->sfx_stop_span : 0;
  const uint32_t sfx_stop_voices =
      runtime_inputs != nullptr ? runtime_inputs->sfx_stop_voices_190 : 0u;
  const uint32_t sfx_stop_enabled =
      runtime_inputs != nullptr ? runtime_inputs->sfx_stop_enabled_198 : 0u;
  const uint32_t sfx_stop_fold_ready =
      runtime_inputs != nullptr ? runtime_inputs->sfx_stop_fold_ready : 0u;
  const int32_t sfx_stop_voice_count =
      runtime_inputs != nullptr ? (int32_t)runtime_inputs->sfx_stop_voice_count
                                : 0;
  const IsaacGameUpdateSliceSfxStopVoicePack* sfx_stop_voice_packs =
      runtime_inputs != nullptr ? runtime_inputs->sfx_stop_voices : nullptr;
  const int32_t fold_applied = opaque_0092e230_stop_fold(
      sfx_stop_fold_ready, sfx_stop_ready, sfx_stop_span, sfx_stop_voices,
      sfx_stop_enabled, sfx_stop_voice_count, sfx_stop_voice_packs,
      &scratch_sfx_stop_fold_plan, scratch_sfx_stop_pending);
  if (fold_applied != 0) {
    events->sfx_stop_fold_applied = 1;
    events->sfx_stop_fold_stop_calls =
        scratch_sfx_stop_fold_plan.stop_calls > 0
            ? (uint32_t)scratch_sfx_stop_fold_plan.stop_calls
            : 0u;
    events->sfx_stop_fold_stores = (uint32_t)scratch_sfx_stop_fold_plan.stores;
    /* Mask over the VISITED voices only: bit i when voice i's +0x29 byte
       was zeroed by the record (scratch byte 0 + captured low byte
       nonzero). Unvisited lanes (scratch init 0) are never mask bits —
       the walk loop bounds are plan.voices_visited. */
    uint32_t mask = 0u;
    const int32_t visited = scratch_sfx_stop_fold_plan.voices_visited;
    if (sfx_stop_voice_packs != nullptr && visited > 0) {
      const int32_t bound = visited < ISAAC_SFX_STOP_FOLD_MAX_VOICES
                                ? visited
                                : ISAAC_SFX_STOP_FOLD_MAX_VOICES;
      for (int32_t i = 0; i < bound; ++i) {
        if (scratch_sfx_stop_pending[i] == 0 &&
            (sfx_stop_voice_packs[i].pending_09 & 0xffu) != 0u) {
          mask |= (1u << static_cast<uint32_t>(i));
        }
      }
    }
    events->sfx_stop_fold_pending_mask = mask;
  } else {
    const int32_t sfx_stop_gate = isaac_pm_sfx_entry_gate(
        ISAAC_PM_INTENSITY_SFX_ID, sfx_stop_span, sfx_stop_voices,
        sfx_stop_enabled);
    if (sfx_stop_ready == 0u ||
        isaac_pm_sfx_mutator_pure_complete(sfx_stop_gate) == 0) {
      events->player_manager_update_heartbeat_sfx_stop += 1;
    }
  }
}

extern "C" int32_t isaac_game_update_slice_resume_room_update_head(
    IsaacGameUpdateSliceState* state,
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs,
    IsaacGameUpdateSliceEvents* events) {
  if (state == nullptr || runtime_inputs == nullptr || events == nullptr ||
      events->continuation_kind != ISAAC_GAME_UPDATE_RESUME_AFTER_ROOM_UPDATE_HEAD) {
    return 0;
  }

  /* Pure B14 dual camera/FX lerp, then pure tail companions peeled from B15–B20:
       B15 Room+0x7214 rain timer: if > 0 then -- (spawn loop stays host rain)
       B16 water/lava float shell + pure descriptor |0x100 band via
         isaac_room_water_lava_float_step (challenge 0x123 runtime input +
         Room+0x8 + room_desc_flags_44 + PE float constants; type-7 grid /
         FUN_00823540 stay residual water-b16 when needs_grid_host)
       B17 Room+0x722c: if > 0 then --
       mid-tail Room+0x706c: if > 0 then --, result < 1 → -1 (FUN_008158a0 host
         pure-gated via pre-timer)
       mid-tail Room+0x7230: if > 0 then -- (periodic spawn pure-gated on pre)
       B18 Room+0x7894 = 0 via isaac_room_entry_clear_7220 (entity walk gated
         on pre-flag)
       B19 Room+0x7769 = 0 via isaac_room_entry_clear_7220 (path rebuild host)
     Then ordered host residual fragments (ABI v32):
       rain → water-b16 (cond) → mid (always) → mid706cExpire (cond) →
       mid7230Spawn (cond) → entity (cond) → path → PM death (cond) →
       PM heartbeat (always) → 4257b0 PassA/B (cond)
     Residual host does not rewrite peeled counters, pure floats, pure |0x100,
     or pure B18/B19 flag clears. Recapture FX, timers, water, lava, room type,
     roomDescFlags44, room_flag_7894, room_flag_7769 before this. */
  IsaacRoomCameraFxState fx = {};
  fx.counter_70d8 = state->room_fx_counter_70d8;
  fx.limit_70dc = state->room_fx_limit_70dc;
  fx.value_70cc = state->room_fx_value_70cc;
  fx.step_70d4 = state->room_fx_step_70d4;
  fx.counter_70f4 = state->room_fx_counter_70f4;
  fx.limit_70f8 = state->room_fx_limit_70f8;
  fx.value_70e8 = state->room_fx_value_70e8;
  fx.step_70f0 = state->room_fx_step_70f0;
  isaac_room_camera_fx_lerp_step(&fx);
  state->room_fx_counter_70d8 = fx.counter_70d8;
  state->room_fx_limit_70dc = fx.limit_70dc;
  state->room_fx_value_70cc = fx.value_70cc;
  state->room_fx_step_70d4 = fx.step_70d4;
  state->room_fx_counter_70f4 = fx.counter_70f4;
  state->room_fx_limit_70f8 = fx.limit_70f8;
  state->room_fx_value_70e8 = fx.value_70e8;
  state->room_fx_step_70f0 = fx.step_70f0;

  isaac_room_countdown_dec_if_positive(&state->room_timer_7214);

  const float water_pre = state->room_water_amount_7240;
  const float lava_pre = state->room_lava_intensity_7740;
  IsaacRoomWaterLavaState water_lava = {};
  water_lava.water_amount_7240 = water_pre;
  water_lava.lava_intensity_7740 = lava_pre;
  water_lava.room_type_8 = state->room_type_8;
  water_lava.challenge_0x123 = runtime_inputs->challenge_0x123;
  water_lava.room_desc_flags_44 = state->room_desc_flags_44;
  isaac_room_water_lava_float_step(&water_lava);
  state->room_water_amount_7240 = water_lava.water_amount_7240;
  state->room_lava_intensity_7740 = water_lava.lava_intensity_7740;
  state->room_desc_flags_44 = water_lava.room_desc_flags_44;

  isaac_room_countdown_dec_if_positive(&state->room_timer_722c);

  /* Capture pre-pure mid-tail timers for host residual pure gates before
     pure countdown peels rewrite them. */
  const int32_t timer_706c_pre = state->room_timer_706c;
  const int32_t timer_7230_pre = state->room_timer_7230;
  isaac_room_countdown_dec_expire_neg1(&state->room_timer_706c);
  isaac_room_countdown_dec_if_positive(&state->room_timer_7230);

  /* Pure B18/B19 terminal flag clears (decompile: mov byte [Room+0x7894],0
     after entity walk; mov byte [Room+0x7769],0 after path rebuild). Always
     writing 0 matches the machine (already-zero flags stay zero). Host
     residual entity/path bodies exclude these stores. Capture pre-flag for
     B18 pure walk gate. */
  const uint32_t flag_7894_pre = state->room_flag_7894;
  uint8_t flag_7894 = (uint8_t)(state->room_flag_7894 & 0xffu);
  isaac_room_entry_clear_7220(&flag_7894);
  state->room_flag_7894 = flag_7894;
  /* ABI v95 (record idx 42): capture the PRE-clear Room+0x7769 for the
     B19 rebuild decision (PE 0x008055a7 cmp byte / je B20 runs BEFORE the
     terminal clear at 0x00806043). */
  const uint32_t flag_7769_pre = state->room_flag_7769;
  uint8_t flag_7769 = (uint8_t)(state->room_flag_7769 & 0xffu);
  isaac_room_entry_clear_7220(&flag_7769);
  state->room_flag_7769 = flag_7769;

  /* ABI v139: idx35 MIRROR rule (contracts-b1-rain NOTES 4) -- the pin
     is the exact mirror of idx13's shared-half residual, evaluated
     against the SAME voucher. Under a live b1_rain voucher the
     double-booked bytes' trace is carried by the rows + echoes exactly
     once per tick; capture absence keeps today's byte-for-byte edge.
     (Under the host-side fill contract a live voucher implies the
     shared half executed this tick.) */
  if (!isaac_slice_b1_rain_voucher_live(runtime_inputs)) {
    events->opaque_room_update_tail_rain += 1;
  }
  /* ABI v95 (record idx 35, B15 rain spawn loop): loop-frame wire. The
     record's host edge still fires (the type-5 SFX special 0x92dc30, the
     decor-list copy 0x752830/0x9be6b0/0x7cb6e0 seam, the 0x78-byte swap,
     the 0x00813520 search, the opaque create and the 0x007ef420 bind stay
     host). With a captured rain blob (b15_rain_ready) the loop-frame laws
     (count/bounds, xorshift seed carry, corner world-xy, spawn-arg
     assembly) run IN-MODULE and the typed carriers publish the residual
     host content; ready=0 keeps the pre-v95 monolithic record exactly. */
  if (runtime_inputs != nullptr && runtime_inputs->b15_rain_ready != 0) {
    IsaacGameUpdateSliceB15RainPlan plan = {};
    isaac_game_update_slice_b15_rain_wire(
        state->game_flags_1839c, 1 /* owner was 0x9be6b0(0x89) != 0 on the
                                     quality path (host-resolved) */,
        runtime_inputs->b15_rain_quality, runtime_inputs->b15_rain_begin_183a4,
        runtime_inputs->b15_rain_end_183a8, runtime_inputs->b15_rain_seed_58,
        runtime_inputs->b15_rain_room_w_c, runtime_inputs->b15_rain_room_h_10,
        runtime_inputs->b15_rain_slot_f0, runtime_inputs->b15_rain_slot_f4,
        runtime_inputs->b15_rain_slot_f8, runtime_inputs->b15_rain_slot_f34,
        runtime_inputs->b15_rain_search_results,
        ISAAC_GAME_UPDATE_B15_RAIN_LOOP_MAX_STEPS,
        runtime_inputs->b15_rain_genrand_count,
        runtime_inputs->genrand_mt_ready != 0 ? 1u : 0u, &plan);
    if (plan.once_flag_apply != 0) {
      /* PE 0x00802a9e or eax,0x80000 / 0x00802aa3 store (same bit as the B1
         once-path; idempotent because the gate already required it clear). */
      isaac_room_b1_flag_or_80000(&state->game_flags_1839c);
    }
    events->b15_rain_pure_steps += static_cast<uint32_t>(plan.steps);
    events->b15_rain_host_search += plan.host_search;
    events->b15_rain_host_create += plan.host_create;
    events->b15_rain_host_bind += plan.host_bind;
    events->b15_rain_host_swap += plan.host_swap;
    /* RNG draw typed-host via roomGenrandNext: the host counted its own
       Isaac::genrand_int32 draws inside 0x00813520; when the MT blob is
       ready the in-module scratch advances the same draws and the post
       index travels to scratch_genrand_index_out (v52/v76 precedent). */
    events->b15_rain_genrand_draws += plan.genrand_draws;
    if (plan.genrand_mt_advance != 0 && plan.genrand_draws != 0) {
      int32_t cursor = runtime_inputs->b15_rain_genrand_mt_in;
      IsaacRoomGenrandStep step = {};
      uint32_t drawn = 0;
      while (drawn < plan.genrand_draws &&
             drawn < static_cast<uint32_t>(ISAAC_GENRAND_MAX_SAMPLES)) {
        isaac_room_genrand_next(scratch_genrand_state, cursor, &step);
        cursor = step.index_out;
        ++drawn;
      }
      scratch_genrand_index_out = cursor;
    }
  }
  if (isaac_room_b16_needs_grid_host(runtime_inputs->challenge_0x123,
                                     state->room_type_8, water_pre, lava_pre,
                                     state->room_desc_flags_44) != 0) {
    /* ABI v130 (update-v130-record36-waterb16-close): FULL-CARRY
       conjunction (mirror of the model wire). The tail-span decode
       (funcmap-802980, block 0x0080521b..0x00805373) groups the coarse
       arm's effects as: (a) water/lava state floats — applied in-module
       by the v20/v24 float shell; (b) the pure wrapper chain
       0x823370 -> gate bytes -> spray 0x7067c0 — carried by the
       water_b16 typed carriers + fx state writes below; (c) the
       WATER-BAND type-7 spawn walk; (d) the LAVA-BAND spawn walk (PE
       0x0080526e..0x00805338, spawns via guest ctor 0xaf08b1 + leaf
       0x714610). Groups c/d have no standing carriers or capture rows,
       so the coarse edge is retired ONLY when the blob is live AND the
       823540 gate opens AND neither spawn walk arms. Every other arm
       keeps the monolith byte-for-byte. */
    const bool b16_blob_live = runtime_inputs->water_b16_blob_ready != 0;
    const bool b16_gate_open =
        isaac_room_b16_needs_823540(state->room_water_amount_7240,
                                    lava_pre) != 0;
    const bool b16_type7_arm =
        isaac_room_b16_needs_type7_grid(
            runtime_inputs->challenge_0x123, state->room_type_8,
            water_pre, state->room_desc_flags_44) != 0;
    /* PE decay constant [0xbaa3f4] = 0x3f6b851f; new = f32(old * decay). */
    const float b16_lava_new = lava_pre *
        __builtin_bit_cast(float, 0x3f6b851fu);
    const bool b16_lava_arm =
        isaac_room_b16_needs_lava_band_grid(lava_pre, b16_lava_new) != 0;
    /* ABI v132 (update-v132-b16-spawn-pack, contracts-b16-spawn NOTES
       §2.6): the FULL-CARRY conjunction extends per walk lane — an armed
       lane is carried when its enumeration rows are ready. Voucher law
       (host side): water_b16_spawn_rows_ready=1 IFF both armed walks were
       intercepted per cell, each arm's hit count <= 64 (over-cap poisons
       the WHOLE voucher), and grid_w/h_echo match the dims the model
       knows (b3b7_width_c/b3b7_height_10) — all-or-nothing, no partial
       mode. The cast thunk 0x00af08b1 + virtuals (lane W) and leaf
       0x00714610 (lane L) stay TYPED-HOST leaves named by the echo
       carriers below -- verdict class NARROWED (B18 precedent). */
    const bool b16_rows_ok =
        runtime_inputs->water_b16_spawn_rows_ready != 0 &&
        runtime_inputs->water_b16_water_hit_count >= 0 &&
        runtime_inputs->water_b16_water_hit_count <= 64 &&
        runtime_inputs->water_b16_lava_hit_count >= 0 &&
        runtime_inputs->water_b16_lava_hit_count <= 64 &&
        runtime_inputs->water_b16_grid_w_echo ==
            runtime_inputs->b3b7_width_c &&
        runtime_inputs->water_b16_grid_h_echo ==
            runtime_inputs->b3b7_height_10;
    const bool b16_full_carry = b16_blob_live && b16_gate_open &&
        (!b16_type7_arm || b16_rows_ok) && (!b16_lava_arm || b16_rows_ok);
    events->water_b16_walk_arm_mask =
        static_cast<uint32_t>(b16_type7_arm ? 1 : 0) |
        static_cast<uint32_t>(b16_lava_arm ? 2 : 0);
    if (!b16_full_carry) {
      events->opaque_room_update_tail_water_b16 += 1;
    }
    if (b16_full_carry) {
      /* Enumeration echo carriers: the counts prove the host performed
         exactly the enumerated casts/virtuals/leaf calls; the module
         derives the implied typed-host leaf counts from the pools. */
      const int32_t w_hits = runtime_inputs->water_b16_water_hit_count;
      const int32_t l_hits = runtime_inputs->water_b16_lava_hit_count;
      events->water_b16_spawn_rows_applied = 1;
      events->water_b16_water_hit_count =
          static_cast<uint32_t>(w_hits);
      events->water_b16_lava_hit_count =
          static_cast<uint32_t>(l_hits);
      events->water_b16_cast_count =
          static_cast<uint32_t>(w_hits + l_hits);
      events->water_b16_leaf_call_count =
          static_cast<uint32_t>(l_hits);
    }
    if (b16_blob_live && b16_gate_open) {
      IsaacGameUpdateSliceB16WaterState ws = {};
      ws.water_post = state->room_water_amount_7240;
      ws.lava_pre = lava_pre;
      ws.game_byte_183a0 = runtime_inputs->water_b16_game_byte_183a0;
      ws.game_byte_269e9 = runtime_inputs->water_b16_game_byte_269e9;
      ws.game_1830c = (uint32_t)state->room_transition_mode_1830c;
      ws.room_type_8 = (uint32_t)state->room_type_8;
      ws.difficulty_269c8 = (uint32_t)state->difficulty_269c8;
      ws.game_type_0 = runtime_inputs->water_b16_game_type_0;
      ws.game_subtype_4 = runtime_inputs->water_b16_game_subtype_4;
      ws.flags_2654c = state->flags_2654c;
      ws.unlock_acc = runtime_inputs->water_b16_unlock_acc;
      ws.unlock_clear = runtime_inputs->water_b16_unlock_clear;
      for (int i = 0; i < 6; ++i) {
        ws.src_1b10[i] =
            __builtin_bit_cast(float, runtime_inputs->water_b16_src_1b10[i]);
      }
      ws.grid_flags_44 = runtime_inputs->water_b16_grid_flags_44;
      ws.room_1d18 = runtime_inputs->ambient_room_1d18;
      ws.grid_w_c = runtime_inputs->b3b7_width_c;
      ws.grid_h_10 = runtime_inputs->b3b7_height_10;
      ws.cell_dword_54 = runtime_inputs->water_b16_cell_dword_54;
      ws.fx_cur[0] = state->fx_cur_676b8;
      ws.fx_cur[1] = state->fx_cur_676bc;
      ws.fx_cur[2] = state->fx_cur_676c0;
      ws.fx_cur[3] = state->fx_cur_676c4;
      ws.fx_cur[4] = state->fx_cur_676c8;
      ws.fx_cur[5] = state->fx_cur_676cc;
      isaac_game_update_slice_b16_water_wire(&ws);
      events->water_b16_gate = ws.gate;
      events->water_b16_step_0 =
          __builtin_bit_cast(uint32_t, ws.step[0]);
      events->water_b16_step_1 =
          __builtin_bit_cast(uint32_t, ws.step[1]);
      events->water_b16_step_2 =
          __builtin_bit_cast(uint32_t, ws.step[2]);
      events->water_b16_step_3 =
          __builtin_bit_cast(uint32_t, ws.step[3]);
      events->water_b16_step_4 =
          __builtin_bit_cast(uint32_t, ws.step[4]);
      events->water_b16_step_5 =
          __builtin_bit_cast(uint32_t, ws.step[5]);
      events->water_b16_goal_0 =
          __builtin_bit_cast(uint32_t, ws.goal[0]);
      events->water_b16_goal_1 =
          __builtin_bit_cast(uint32_t, ws.goal[1]);
      events->water_b16_goal_2 =
          __builtin_bit_cast(uint32_t, ws.goal[2]);
      events->water_b16_goal_3 =
          __builtin_bit_cast(uint32_t, ws.goal[3]);
      events->water_b16_goal_4 =
          __builtin_bit_cast(uint32_t, ws.goal[4]);
      events->water_b16_goal_5 =
          __builtin_bit_cast(uint32_t, ws.goal[5]);
      events->water_b16_wire_applied = 1;
      if (ws.gate == 0) {
        /* 7067c0 flag==0 arm (PE 0x7068c1..0x7068ca): snap cur[0..3] to
           the vector; the 0x676b4 gate byte is NOT written (keeps its
           pre-call value — the fx lane may hold it set). */
        state->fx_cur_676b8 = ws.cur_snap[0];
        state->fx_cur_676bc = ws.cur_snap[1];
        state->fx_cur_676c0 = ws.cur_snap[2];
        state->fx_cur_676c4 = ws.cur_snap[3];
      } else {
        state->fx_lerp_gate_676b4 = 1;
      }
    }
  }
  /* ABI v32 PE order: mid (curse/801ee0/800500) → 706c expire → restock → 7230 spawn. */
  events->opaque_room_update_tail_mid += 1;
  /* ABI v127 (update-v127-706c-restock-removal): record idx 38
     opaqueRoomUpdateTailMid706cExpire REMOVED (33 -> 32, 17th removal
     since v79) — ADDENDUM-3 F3 capture contract; the BODY 0x008158a0
     (Room::ShopRestockPartial) runs IN-MODULE under the shop_restock_
     ready voucher; the two entity creates stay the standing guest-memory
     platform leaves behind shop_restock_create1/create2; the [vtbl+0x14]
     discarded-result call stays the host voucher row shop_vcall_fired;
     0x6eef60 stays captured per-item. ready=0 or over-cap keeps the
     pre-v123 monolithic byte-for-byte: coarse @216 fires ONLY on capture
     absence/over-cap. */
  if (isaac_room_706c_needs_expire_host(timer_706c_pre) != 0) {
    const int32_t shop_ready = (runtime_inputs->shop_restock_ready != 0u) ? 1 : 0;
    const int32_t restock_count = runtime_inputs->shop_restock_count;
    const int32_t shop_over_cap =
        ((uint32_t)restock_count > (uint32_t)ISAAC_GAME_UPDATE_SHOP_RESTOCK_MAX) ? 1 : 0;
    if (shop_ready == 0 || shop_over_cap != 0) {
      events->opaque_room_update_tail_mid_706c_expire += 1;
    } else {
      uint32_t hash = runtime_inputs->shop_hash_in;
      uint32_t cursor = runtime_inputs->shop_bucket_cursor_in;
      int32_t left = restock_count;
      if (isaac_game_update_slice_706c_shop_gate(
              (uint32_t)state->room_type_8) == 0) {
        events->shop_restock_warn += 1;
      } else if (isaac_game_update_slice_706c_hash_zero(hash) != 0) {
        events->shop_restock_seed_zero_drop += 1;
      } else {
        for (int32_t i = 0; i < restock_count; i += 1) {
          const uint32_t cursor_pre = cursor;
          (void)isaac_game_update_slice_706c_bucket_parity(cursor_pre);
          (void)isaac_game_update_slice_706c_bucket_index(
              cursor_pre, runtime_inputs->shop_bucket_count);
          const uint32_t item_id = runtime_inputs->shop_cell_ids[i];
          const uint32_t cell_ptr = runtime_inputs->shop_cell_ptrs[i];
          if ((int32_t)runtime_inputs->shop_cell_valid[i] >= 0) {
            (void)isaac_game_update_slice_706c_counter_inc_cap255(
                runtime_inputs->shop_cell_counter_pre[i]);
          }
          const int32_t quot = isaac_game_update_slice_706c_idiv_quot(
              (int32_t)item_id, runtime_inputs->shop_room_width);
          const int32_t rem = isaac_game_update_slice_706c_idiv_rem(
              (int32_t)item_id, runtime_inputs->shop_room_width);
          (void)isaac_game_update_slice_706c_pos_x(rem);
          (void)isaac_game_update_slice_706c_pos_y(quot);
          (void)isaac_game_update_slice_706c_vcall_arm(cell_ptr, item_id);
          if (isaac_game_update_slice_706c_hash_zero(hash) != 0) {
            events->shop_restock_seed_zero_drop += 1;
            left = -1;
            break;
          }
          hash = isaac_game_update_slice_706c_xorshift_step(hash);
          events->shop_restock_create1 += 1;
          (void)runtime_inputs->shop_genrand_ret[i];
          events->shop_restock_create2 += 1;
          left -= 1;
          cursor = (left != 0) ? (cursor_pre + 1u) : 0u;
        }
        if (left >= 0) {
          if (isaac_game_update_slice_706c_hash_zero(hash) != 0) {
            events->shop_restock_seed_zero_drop += 1;
          } else {
            hash = isaac_game_update_slice_706c_xorshift_step(hash);
            events->shop_restock_copy_back_ready += 1;
          }
        }
      }
    }
  }
  /* ABI v46: mid-restock pure-complete body wire (helpers freestanding v23).
     Default desc_ready=0 → MONOLITHIC when outer gate open (prior always-host). */
  {
    const int32_t outer_ready = 1;
    const int32_t desc_ready =
        runtime_inputs->mid_restock_desc_ready != 0 ? 1 : 0;
    int32_t residual_kind = 0;
    int32_t out_ae = 0;
    int32_t applied = 0;
    isaac_room_mid_restock_wire_decide(
        outer_ready, desc_ready, state->room_type_8,
        runtime_inputs->mid_restock_owner_0x209,
        runtime_inputs->ambient_room_active, state->frame_counter_264f8,
        runtime_inputs->ambient_room_entry_11f0,
        runtime_inputs->mid_restock_desc_ac, runtime_inputs->mid_restock_desc_ae,
        runtime_inputs->mid_restock_desc_seed58, &residual_kind, &out_ae,
        &applied);
    if (residual_kind == ISAAC_ROOM_MID_RESTOCK_RESIDUAL_PURE_COMPLETE &&
        applied != 0) {
      state->room_desc_short_ae = out_ae;
    } else if (residual_kind == ISAAC_ROOM_MID_RESTOCK_RESIDUAL_MONOLITHIC) {
      /* desc capture missing (desc_ready=0): whole residual re-run. */
      events->opaque_room_update_tail_mid_restock += 1;
    } else if (residual_kind == ISAAC_ROOM_MID_RESTOCK_RESIDUAL_HOST_FATAL) {
      /* ABI v95: RNG::RandomInt zero-seed fatal (PE 0x007e9028 test edx,edx
         / 0x007e9033 call 0xa112c0 'RNG Seed is zero!\n' @0xb6bf54 /
         0x007e9041 int3) is a TYPED-EVENT DROP: zero game-memory stores
         precede the fatal (desc+0xae @0x8054a4 is written only after the
         call), so dropping the restock body reproduces the machine's
         pre-crash state exactly. The typed event field
         `mid_restock_seed_zero_drop` (1 u32) lands at the coordinator's
         wave-end layout merge (name pinned in NOTES.md); the in-module law
         `isaac_game_update_slice_mid_restock_seed_zero` is the FULL-DWORD
        seed==0 edge. body_apply returns HOST_FATAL ONLY for seed58==0
        (desc-gate-closed returns 0), so this branch always drops; the
        guard keeps the coarse host edge honest if a second fatal source
        ever appears. */
      events->mid_restock_seed_zero_drop =
          (uint32_t)isaac_game_update_slice_mid_restock_seed_zero(
              runtime_inputs->mid_restock_desc_seed58);
      if (isaac_game_update_slice_mid_restock_seed_zero(
              runtime_inputs->mid_restock_desc_seed58) == 0) {
        events->opaque_room_update_tail_mid_restock += 1;
      }
      /* drop: no desc+0xae write, no host residual, no mutation. */
    }
    /* NONE / pure-complete without apply: no host residual */
  }
  /* ABI v126 (update-v126-7230-spawn-removal): record idx 40
     opaqueRoomUpdateTailMid7230Spawn REMOVED (34 -> 33, 16th removal
     since v79; clearPathFlagStore / type5DoorForcedRerun precedent).
     The gate input is SLICE STATE (room_timer_7230 @296), not
     host-captured memory — no capture-absence arm exists. The retired
     coarse increment was exactly [gate open] and carried the host cue
     "re-issue pos 0x813460 / genrand 0x6eef60 / create 0x428b20 / RTTI
     0xaf08b1 with the v95 arg-prep plan"; the carrier event
     tail_mid_7230_spawn_armed @996 fires iff the retired edge armed
     (same expression isaac_room_7230_needs_spawn_host, same tick, same
     order position) and IS that cue. The pure countdown dec and the
     whole v95 law pack stay committed. Coarse @224 STAYS in the frozen
     events ABI but NEVER fires. */
  if (isaac_room_7230_needs_spawn_host(timer_7230_pre) != 0) {
    events->tail_mid_7230_spawn_armed += 1;
  }
  if (isaac_room_b18_needs_entity_walk_host(flag_7894_pre) != 0) {
    /* ABI v95 (record idx 41, B18 entity walk): typed-host wire. With a
       captured entity pack (b18_entity_ready) the in-module walk frame
       (re-derived count/bound + per-entity TYPE5/RTTI/SKIP decision)
       types the residual host content: type5/rtti/pathb counters tell
       the host EXACTLY how many 0x6e17c0 / 0xaf08b1 / 0x6da530 calls to
       re-issue. ready=0 keeps the pre-v95 monolithic edge.
       ABI v120 (update-v120-b18-entity-removal): record idx 41 REMOVED
       (39 -> 38, 11th removal since v79) — full-capture theorem over the
       v115 three-body census: on every capture-valid tick (ready != 0,
       count <= ISAAC_GAME_UPDATE_B18_ENTITY_MAX) the retired live
       increment was exactly [count != 0], byte-for-byte redundant with
       the typed carriers — the span's ONLY store (terminal flag clear
       0x8055a0) is prior-lawed pure and every per-entity host call is
       counted by b18_entity_walk_type5_calls / rtti_casts / pathb_calls
       in PE order. The counter STAYS in the events ABI @228 and fires
       ONLY on the capture-absence gate miss (ready == 0 / pack
       truncation count > 64 -> monolith). */
    const uint32_t b18_ready =
        runtime_inputs != nullptr && runtime_inputs->b18_entity_ready != 0
            ? 1u
            : 0u;
    if (b18_ready == 0u ||
        runtime_inputs->b18_entity_count >
            ISAAC_GAME_UPDATE_B18_ENTITY_MAX) {
      /* Capture-absence gate miss: exact pre-v95 monolithic record
         (count is uint32_t, so negative captures read as huge -> here). */
      events->opaque_room_update_tail_entity += 1;
    } else {
      IsaacGameUpdateSliceB18WalkPlan b18 = {};
      isaac_game_update_slice_b18_walk_frame(
          runtime_inputs->b18_entity_count,
          (int32_t)runtime_inputs->b18_entity_mode,
          runtime_inputs->b18_entity_types,
          runtime_inputs->b18_entity_cast_results,
          ISAAC_GAME_UPDATE_B18_ENTITY_MAX, &b18);
      events->b18_entity_walk_type5_calls += b18.type5_calls;
      events->b18_entity_walk_rtti_casts += b18.rtti_casts;
      events->b18_entity_walk_pathb_calls += b18.pathb_calls;
      events->b18_entity_walk_frame += 1;
    /* ABI v120: no live-capture coarse edge — the carriers are the full
       residual capture (count==0 -> zero calls + pure flag clear). */
    }
  }
  /* ABI v95 (record idx 42, opaqueRoomUpdateTailPath B19+B20): the
     path/trail record wire. With a captured blob (tail_path_ready) the
     rebuild decision (B19 flag gate 0x008055a7 LOW-BYTE) + the trail-loop
     frame laws (B20: list gate 0x0080608e, count 0x008060c7, pass1
     filter, pass2 route, pair posts, chain gates — room v30/v31/v32 laws
     consumed by reference) run IN-MODULE and the typed carriers publish
     the residual host content. ready=0 keeps the pre-v95 monolithic
     record exactly. The B19 terminal flag clear already ran pure
     (isaac_room_entry_clear_7220 above); the host residual excludes that
     store.
     ABI v114 (update-v114-tailpath-removal): record idx 42 REMOVED from
     opaqueBoundaries (43 -> 42, 7th removal since v79). The live-capture
     coarse edge is RETIRED: the v111+v113 leaf census proves every leaf
     of the B19 rebuild body (0x008055a7..0x0080608e) and the B20 trail
     body (0x0080608e..0x008068a1) is ZHL-typed (GetGridCollision
     0x7f0800 / query 0x72fe80 / pedestals 0x6e1d70/0x6e1a80), a platform
     primitive (memset 0xaf05e5, vector 0x42c920, tree alloc 0xa0f4c0,
     fatal 0xa112c0, SEH 0xaef12b/0xaef15c, frees 0xaef15c/0x40c740,
     genrand 0x6eef60, sin/cos 0x41d520/0x41d540, pos pack 0x802740) or a
     pure relay already counted by the typed carriers below (spawn
     0x428b20 pure room v54 -> tail_path_host_spawn; tree 0x4288a0 pure;
     pass1 push -> tail_path_host_push; multi-spawn chain ->
     tail_path_host_multispawn_steps; draw stream ->
     tail_path_host_genrand_draws). The retired increment was exactly
     (host_rebuild != 0 || host_trail != 0) — byte-for-byte implied by
     tail_path_host_rebuild / tail_path_host_trail published above in the
     same order, same tick. The counter STAYS in the events ABI @232 and
     fires ONLY on the capture-absence gate miss (ready=0 / MONOLITHIC
     residual), byte-for-byte (idx-16 v110 precedent). */
  {
    IsaacGameUpdateSliceTailPathPlan plan = {};
    const uint32_t tail_ready =
        runtime_inputs != nullptr && runtime_inputs->tail_path_ready != 0
            ? 1u
            : 0u;
    const uint32_t tail_cap =
        static_cast<uint32_t>(ISAAC_GAME_UPDATE_TAIL_PATH_MAX_NODES);
    isaac_game_update_slice_tail_path_wire(
        tail_ready, flag_7769_pre,
        runtime_inputs != nullptr ? runtime_inputs->tail_path_list_begin_c82674
                                  : 0u,
        runtime_inputs != nullptr ? runtime_inputs->tail_path_list_end_c82678
                                  : 0u,
        runtime_inputs != nullptr ? runtime_inputs->tail_path_mode_26614 : 0u,
        runtime_inputs != nullptr ? runtime_inputs->tail_path_genrand_draws : 0u,
        runtime_inputs != nullptr ? runtime_inputs->tail_path_entries : nullptr,
        tail_cap, &plan);
    if (plan.b19_residual_kind == ISAAC_ROOM_B19_RESIDUAL_MONOLITHIC ||
        plan.b20_residual_kind == ISAAC_ROOM_B20_RESIDUAL_MONOLITHIC) {
      /* ready=0 (no capture): exact pre-v95 monolithic record. */
      events->opaque_room_update_tail_path += 1;
    } else {
      events->tail_path_pure_steps +=
          static_cast<uint32_t>(plan.pure_steps);
      events->tail_path_host_rebuild += plan.host_rebuild;
      events->tail_path_host_trail += plan.host_trail;
      events->tail_path_host_push += plan.host_push;
      events->tail_path_host_spawn += plan.host_spawn;
      events->tail_path_host_multispawn_steps += plan.host_multispawn_steps;
      events->tail_path_host_genrand_draws += plan.host_genrand_draws;
      /* ABI v114: no live-capture coarse edge. host_rebuild/host_trail
         nonzero = the B19/B20 bodies run under their typed carriers;
         both zero = pure skip (no host residual at all). */
    }
  }
  /* PlayerManager::Update PM0/PM1 death walk. ABI v69: route the v32
     dual-zero emission through the frozen PM family plan (family ABI v17,
     consumed by reference). PE 0x009bb5df/0x009bb5ee dual-zero, 0x009bb610
     outer `je` count==0 loop skip (NO fatal), 0x009bb64c..0x009bb67b
     per-player eligibility byte/word loads, 0x009bb67d..0x009bb682
     TriggerDeath(false). Residual NONE drops the host event: zero eligible
     means zero TriggerDeath and zero mutation, so the pre-walk packs stay
     valid across every re-derived iteration (PE 0x009bb68a..0x009bb69e).
     WALK and MONOLITHIC keep the single monolithic host walk — the eligible
     mask is never expanded into per-player host calls because TriggerDeath
     mutates live players/vector mid-walk. Defaults count=1 blob=0 →
     MONOLITHIC under dual-zero → the exact pre-v69 event stream. */
  {
    IsaacPlayerManagerDeathPlayer death_packs[ISAAC_PM_DEATH_PLAYER_MAX] = {};
    const int32_t death_count =
        runtime_inputs != nullptr ? runtime_inputs->pm_death_player_count : 1;
    const int32_t death_blob =
        runtime_inputs != nullptr && runtime_inputs->pm_death_blob_ready != 0
            ? 1
            : 0;
    int32_t death_pack_count = 0;
    if (death_blob != 0) {
      death_pack_count = death_count;
      if (death_pack_count < 0) death_pack_count = 0;
      if (death_pack_count > ISAAC_PM_DEATH_PLAYER_MAX) {
        death_pack_count = ISAAC_PM_DEATH_PLAYER_MAX;
      }
      for (int32_t i = 0; i < death_pack_count; ++i) {
        death_packs[i].anim_7c = runtime_inputs->pm_death_anim_7c[i];
        death_packs[i].twin_anim_7c = runtime_inputs->pm_death_twin_anim_7c[i];
        /* Byte lanes: store the LOW BYTE exactly as the PE's `cmp byte`
           loads would see it (family JS applies asU8 to the same lanes).
           The u32 runtime inputs cross the Wasm boundary unmasked. */
        death_packs[i].dead_173 =
            static_cast<uint8_t>(runtime_inputs->pm_death_dead_173[i] & 0xffu);
        death_packs[i].anim_8c =
            static_cast<uint8_t>(runtime_inputs->pm_death_anim_8c[i] & 0xffu);
        death_packs[i].twin_null =
            static_cast<uint8_t>(runtime_inputs->pm_death_twin_null[i] & 0xffu);
        death_packs[i].twin_anim_8c = static_cast<uint8_t>(
            runtime_inputs->pm_death_twin_anim_8c[i] & 0xffu);
      }
    }
    IsaacPlayerManagerDeathPlan death_plan = {};
    isaac_pm_death_wire_decide(state->gate_1b83c, state->gate_1ba78,
                               death_count, death_blob, death_packs,
                               death_pack_count, &death_plan);
    if (death_plan.pure_complete == 0) {
      events->player_manager_update_death += 1;
    }
    /* ABI v95 (record idx 43): the TriggerDeath CALL-ARG laws land as the
       composed event's arg-prep. PE 0x009bb67d push 0 / 0x009bb67f call
       0x7a1090: the host call receives {receiver = walk cursor element,
       flag = 0 (checkOnly=false)}; the receiver is begin + index*4 when
       u32(index) < u32(count2) (PE 0x9bb647 lea) else begin (PE 0x9bb643
       cmp/jae OOB clamp — element 0 dereferenced, never skipped), with
       count2 = (end2-begin2)>>2 re-derived per iteration (PE 0x9bb63c..
       0x9bb640). The typed event publishes the proof when the wire
       resolves WALK (ready packs + at least one eligible player — the
       composed event's pre-call pack exists) AND the frame's player-vector
       span is captured (frame_opaque_98dba0_walk_ready, the v92 seam on
       the SAME Game+0x1baa8 vector the death walk iterates). MONOLITHIC
       (no packs → no pack eligibility) and NONE (no host call) publish
       nothing; ready=0 never sets it. TriggerDeath 0x007a1090 itself stays
       typed-host — NO per-player expansion (v69 pin). */
    if (death_plan.residual_kind == ISAAC_PM_DEATH_RESIDUAL_WALK &&
        runtime_inputs != nullptr &&
        runtime_inputs->frame_opaque_98dba0_walk_ready != 0u) {
      events->player_manager_update_death_arg_prep += 1;
    }
    /* pure-complete NONE: no death host (dual-zero closed, outer count 0,
       or ready packs with zero eligible players). */
  }
  /* ABI v44: pure PM2 intensity + PM3 residual plan (helpers freestanding).
     ABI v95: record idx 44 PM3 arm decision laws (slice exports) — the
     EMPTY vector is decided by pm3_empty_pure_skip / pm3_empty_stop_split
     (PE 0x9bb6c3 test/je -> maxVol=0 -> QUIET arm; probe 0x92e560 -> pure
     skip 0x9bb795 je or 0x92e230 stop 0x9bb7a2). The NON-EMPTY arm keeps
     the v44 pack wire below; MONOLITHIC never applies to the empty vector
     (the PM2 loop is skipped, maxVol=0 — no pack required). The is-playing
     probe capture (@700) and the volume/pitch update stay typed-host
     (records 45/46). */
  {
    IsaacPlayerManagerIntensityPlayer packs[ISAAC_PM_INTENSITY_PLAYER_MAX] = {};
    const int32_t count = runtime_inputs->pm_intensity_player_count;
    const int32_t blob = runtime_inputs->pm_intensity_blob_ready != 0 ? 1 : 0;
    const int32_t sfx_playing =
        runtime_inputs->pm_intensity_sfx_playing != 0 ? 1 : 0;
    int32_t pack_count = 0;
    if (blob != 0) {
      pack_count = count;
      if (pack_count < 0) pack_count = 0;
      if (pack_count > ISAAC_PM_INTENSITY_PLAYER_MAX) {
        pack_count = ISAAC_PM_INTENSITY_PLAYER_MAX;
      }
      for (int32_t i = 0; i < pack_count; ++i) {
        packs[i].raw_1ea8 = runtime_inputs->pm_intensity_raw_1ea8[i];
        packs[i].flags_168 = runtime_inputs->pm_intensity_flags_168[i];
        packs[i].dead_173 =
            static_cast<uint8_t>(runtime_inputs->pm_intensity_dead_173[i] & 0xffu);
      }
    }
    const uint32_t ucount = static_cast<uint32_t>(count);
    const uint32_t uplaying = static_cast<uint32_t>(sfx_playing);
    /* The arm split is computed by the (noinline) pm3_empty_* laws: -O2
       constant-folds quiet_gate(0.0f)=1 and, when the split was written
       inline, REWROTE the count==0+playing case into the MONOLITHIC
       heartbeat bump (differential case 495, -O2/-O3; -O0 correct). The
       noinline calls keep the arm decision opaque so the dispatch keeps
       the PE arm binding (PE 0x009bb6b2/0x009bb7a2: empty+playing ->
       ONLY the 0x92e230 STOP lane; never MONOLITHIC). */
    const int32_t empty_skip =
        isaac_game_update_slice_pm3_empty_pure_skip(ucount, uplaying);
    const int32_t empty_stop =
        isaac_game_update_slice_pm3_empty_stop_split(ucount, uplaying);
    IsaacPlayerManagerHeartbeatPlan plan = {};
    int32_t plan_pure = 1;
    int32_t plan_kind = ISAAC_PM_INTENSITY_SFX_RESIDUAL_NONE;
    int32_t plan_pm2 = 1;
    if (empty_stop != 0) {
      /* Empty + playing -> the QUIET arm's probe is nonzero -> ONLY the
         0x92e230 stop (record-47 lane below); never MONOLITHIC. FIRST so
         the compiled dispatch cannot route the empty+playing arm into
         the wire (differential case 495: the wire-first order compiled
         count<1 into the wire call, flipping the arm to MONOLITHIC). The
         fold emission is a static helper called HERE and from the
         dispatch, so the optimizer cannot vacate the STOP assignment on
         the count==0 path (it previously dropped it and fell into the
         MONOLITHIC default). */
      plan_kind = ISAAC_PM_INTENSITY_SFX_RESIDUAL_STOP;
      plan_pure = 0; /* the STOP lane runs (quiet arm, probe nonzero) */
      emit_sfx_stop_fold(events, runtime_inputs);
      /* The dispatch is inside the non-empty arm; the empty arm's emit
         is the whole story. Keep the plan NONE so a future reader cannot
         mistake this path for the wire's plan output. */
      plan_kind = ISAAC_PM_INTENSITY_SFX_RESIDUAL_NONE;
      plan_pure = 1;
    } else if (empty_skip == 0 && empty_stop == 0) {
      /* NON-EMPTY arm (or the empty arm with the laws refusing — never on
         the PE path, but kept as the pre-v95 plan fallback). */
      isaac_pm_intensity_wire_decide(count, blob, sfx_playing, packs,
                                     pack_count, &plan);
      plan_pure = plan.pure_complete;
      plan_kind = plan.residual_kind;
      plan_pm2 = plan.pm2_pure;
      /* The residual dispatch lives INSIDE the non-empty arm: the
         count==0 paths (empty STOP above, empty NONE below) must never
         reach the dispatch's final-else heartbeat bump (differential
         case 495 — the zeroed plan{} on the count==0 path landed there). */
      (void)plan_pm2;
      if (plan_pure != 0) {
      /* residual NONE — no heartbeat host */
    } else if (plan_kind == ISAAC_PM_INTENSITY_SFX_RESIDUAL_MONOLITHIC) {
      events->player_manager_update_heartbeat += 1;
    } else if (plan_kind == ISAAC_PM_INTENSITY_SFX_RESIDUAL_UPDATE) {
      /* ABI v62: wire the v5 PMS volume-update gate (VA 0x0092df40 +
         0x0092e050; callsites 0x009bb7c9 / 0x009bb7dd; receiver
         Game+0x2a324) — same entry gate as the v60 stop fold. MISS
         (PE 0x92df51 js / 0x92df71 jge) and DISABLED (PE 0x92dfa8 je
         byte[entry+0x198]) are complete no-ops and BOTH calls are
         DROPPED; NO_SAMPLES keeps the warn-log host (PE 0x92df90 call
         0xa112c0) and LIVE keeps the per-voice volume host. ready=0
         keeps the pre-v62 always-host residual. Captures are the shared
         PM3 SFX entry (id 0x1fc, receiver Game+0x2a324): sfx_stop_*
         fields reused. */
      const uint32_t sfx_update_ready =
          runtime_inputs != nullptr ? runtime_inputs->sfx_stop_ready : 0u;
      const int32_t sfx_update_span =
          runtime_inputs != nullptr ? (int32_t)runtime_inputs->sfx_stop_span : 0;
      const uint32_t sfx_update_voices =
          runtime_inputs != nullptr ? runtime_inputs->sfx_stop_voices_190 : 0u;
      const uint32_t sfx_update_enabled =
          runtime_inputs != nullptr ? runtime_inputs->sfx_stop_enabled_198 : 0u;
      const int32_t sfx_update_gate = isaac_pm_sfx_entry_gate(
          ISAAC_PM_INTENSITY_SFX_ID, sfx_update_span, sfx_update_voices,
          sfx_update_enabled);
      /* ABI v128 (update-v128-heartbeat-sfxupd-removal, PLAN-45): record
         idx 45 REMOVED (32 -> 31, 18th removal since v79). Under the
         sfx_upd_ready voucher the whole update lane runs IN-MODULE
         (predicate gates BY REFERENCE via isaac_pm_sfx_entry_gate;
         pending-clear side effects land as sfx_upd_pending_mask bits;
         busy short-circuit publishes walk_count/busy_applied; the volume
         leaf's S1 [g+0x194] store publishes sfx_vol_set_group_mem and its
         S2/D1 pair publish sfx_vol_set_voice + sfx_dev_volume_calls; the
         pitch leaf's raw S3/D2 pair publish sfx_pitch_set_voice +
         sfx_dev_pitch_calls; the G3 NO_SAMPLES warn twin publishes
         sfx_upd_no_samples_warn). Device vtbl+0x38/+0x48/+0x58 probes
         stay the standing audio-backend platform leaves behind those
         counters. ready=0 / blob missing keeps the pre-v62 monolithic
         byte-for-byte: coarse @328 fires ONLY on capture absence. */
      const IsaacGameUpdateSliceSfxStopVoicePack* upd_packs =
          runtime_inputs != nullptr ? runtime_inputs->sfx_stop_voices : nullptr;
      const int32_t upd_voice_count = runtime_inputs != nullptr
          ? (int32_t)runtime_inputs->sfx_stop_voice_count : 0;
      const uint32_t sfx_upd_ready =
          runtime_inputs != nullptr ? runtime_inputs->sfx_upd_ready : 0u;
      if (sfx_upd_ready == 0u || upd_packs == nullptr) {
        if (sfx_update_ready == 0u ||
            isaac_pm_sfx_mutator_pure_complete(sfx_update_gate) == 0) {
          events->player_manager_update_heartbeat_sfx_update += 1;
        }
      } else if (isaac_pm_sfx_mutator_pure_complete(sfx_update_gate) != 0) {
        /* MISS / DISABLED: pure drop, unchanged. */
      } else {
        uint32_t pending_mask = 0u;
        uint32_t visited = 0u;
        int32_t busy = 0;
        if (sfx_update_gate == ISAAC_PM_SFX_GATE_NO_SAMPLES) {
          events->sfx_upd_no_samples_warn += 1;
        } else {
          const float mgr_scalar =
              isaac_sfx_upd_f32_from_bits(runtime_inputs->sfx_upd_mgr_scalar);
          const float master =
              isaac_sfx_upd_f32_from_bits(runtime_inputs->sfx_upd_master_vol);
          const float arg_vol =
              isaac_sfx_upd_f32_from_bits(runtime_inputs->sfx_upd_arg_vol);
          events->sfx_vol_set_group_mem = runtime_inputs->sfx_upd_arg_vol;
          const int32_t nvoices = (int32_t)sfx_update_voices < upd_voice_count
              ? (int32_t)sfx_update_voices : upd_voice_count;
          for (int32_t i = 0; i < nvoices; i += 1) {
            const uint32_t chan_null = upd_packs[i].channel_null;
            uint32_t pending = upd_packs[i].pending_09 & 0xffu;
            const uint32_t probe1 = upd_packs[i].probe_first & 0xffu;
            const uint32_t probe2 = upd_packs[i].probe_second & 0xffu;
            if (chan_null == 0u) continue; /* V1: null -> no probes fired */
            if (pending != 0u && probe1 != 0u) {
              pending = 0u;
              pending_mask |= (1u << i);
            }
            visited = (uint32_t)(i + 1);
            if (probe2 != 0u || pending != 0u) {
              /* BUSY: short-circuit — volume leaf then pitch leaf. */
              float eff = mgr_scalar > 0.0f ? mgr_scalar : 0.0f;
              eff *= arg_vol;
              eff *= master;
              /* minss returns its SECOND operand on NaN. */
              const float clamped = (eff < 1.0f) ? eff : 1.0f;
              (void)clamped;
              events->sfx_upd_busy_applied += 1;
              events->sfx_vol_set_voice += 1;
              events->sfx_dev_volume_calls += 1;
              events->sfx_pitch_set_voice += 1;
              events->sfx_dev_pitch_calls += 1;
              busy = 1;
              break;
            }
          }
        }
        events->sfx_upd_pending_mask = pending_mask;
        events->sfx_upd_walk_count += visited;
        (void)busy;
      }
} else if (plan.residual_kind == ISAAC_PM_INTENSITY_SFX_RESIDUAL_PLAY) {
      /* ABI v95: the PLAY lane consumes the SFX family's Play entry gate
         BY REFERENCE (isaac_sfx_play_gate — the exact 0x0092dc30 first
         three tests; the PM-family gate copy was the v68 carrier) and
         replaces the single monolithic residual with THREE TYPED host
         leaves (record idx 46, family v26b):
           NO_SAMPLES -> the "[warn] Sound %d has no samples." warn-log
             leaf (PE 0x92dcb5, then ret 0x92dcce) — the ONLY host
             content on that arm;
           PRELOAD -> SoundEffect::Load 0x92cfb0 + "[warn] Sound %d was
             not preloaded." + this[0xc]++ + the continuation body edge
             (PE 0x92dcda..0x92dcf1 — the v68 "DISABLED keeps the host
             because the play path LOADS the entry and CONTINUES into
             the body" pin; the body's window/voice inputs are not
             captured, so the whole edge is ONE typed leaf);
           LIVE -> the per-voice device body (allocate probe +0x28,
             wrapper reset 0xa2abd0, stream create [0xc5aaa0]+0x24,
             assign 0xa2add0 + release 0x7e2740, set-loop +0x40,
             set-pitch +0x58, set-volume +0x48, start +0x2c, pan
             0xa2ac20 — the B-gates that steer each call are in-module,
             isaac_sfx_play_leaf_plan).
         MISS (PE 0x92dc73 js / 0x92dc96 jge) stays the side-effect-free
         drop (no event). ready=0 keeps the pre-v68 monolithic residual
         byte-for-byte. Captures are the shared PM3 SFX entry (id 0x1fc,
         receiver Game+0x2a324): sfx_stop_* fields reused. */
      const uint32_t sfx_play_ready =
          runtime_inputs != nullptr ? runtime_inputs->sfx_stop_ready : 0u;
      const int32_t sfx_play_span =
          runtime_inputs != nullptr ? (int32_t)runtime_inputs->sfx_stop_span : 0;
      const uint32_t sfx_play_voices =
          runtime_inputs != nullptr ? runtime_inputs->sfx_stop_voices_190 : 0u;
      const uint32_t sfx_play_enabled =
          runtime_inputs != nullptr ? runtime_inputs->sfx_stop_enabled_198 : 0u;
      const int32_t sfx_play_gate = isaac_sfx_play_gate(
          ISAAC_PM_INTENSITY_SFX_ID, sfx_play_span, sfx_play_voices,
          sfx_play_enabled);
      if (sfx_play_ready == 0u) {
        events->player_manager_update_heartbeat_sfx_play += 1;
      } else if (sfx_play_gate != ISAAC_SFX_PLAY_GATE_MISS) {
        events->player_manager_update_heartbeat_sfx_play_no_samples +=
            isaac_sfx_play_no_samples_host(sfx_play_gate);
        events->player_manager_update_heartbeat_sfx_play_preload +=
            isaac_sfx_play_preload_host(sfx_play_gate);
        events->player_manager_update_heartbeat_sfx_play_device +=
            isaac_sfx_play_body_host(sfx_play_gate);
      }
    } else if (plan.residual_kind == ISAAC_PM_INTENSITY_SFX_RESIDUAL_STOP) {
      /* ABI v60 entry gate (VA 0x0092e230, callsite 0x009bb7a2, receiver
         Game+0x2a324) + ABI v95 in-module STOP fold. MISS (PE 0x92e239 js
         / 0x92e25b jge) and DISABLED (PE 0x92e290 je) are proof-complete
         no-ops: the fold applies them with all-zero events (same drop as
         v60, now in-module). NO_SAMPLES keeps the warn-log host (PE
         0x92e272..0x92e27a call 0xa112c0) — NOT applied -> v60 fallback.
         LIVE now FOLDS the per-voice channel walk in-module: the sentinel
         [entry+4]=-1 and the [voice+0x29] clears land in scratch, the two
         vtbl[0x38] probes are captured by reference, and the device
         vtbl+0x3c stops are published as the typed
         sfx_stop_fold_stop_calls event (record-1 opaque_0092e300_slot_3c
         precedent) — the monolithic host edge is DROPPED on the applied
         fold. fold_ready=0 / ready=0 / missing blob keep the v60
         fallback byte-for-byte. */
      emit_sfx_stop_fold(events, runtime_inputs);      } else {
        events->player_manager_update_heartbeat += 1;
      }
    }
  }
  if (isaac_frame_opaque_4257b0_needs_host(state->timed_transition_cleanup_mode) !=
      0) {
    /* ABI v33: Pass A empty-count gate. ABI v53: PE-exact recaptured Pass B
       gate. ABI v71: on the blob path BOTH passes run as pure bodies and
       neither host counter is emitted; the only host edge left is the
       0x00426640 grow, published as frame_opaque_4257b0_list_grow.

       The recapture is taken on ONE path only, exactly as before: when Pass A
       ran (id_count != 0) the slice stops at RESUME_AFTER_4257B0_PASS_A so
       the F4 pair can be re-read together; when Pass A was a no-op the PE's
       0x004257ee je 0x00425870 leaves the list untouched, so the pre-captured
       pair IS the post value and NOTHING is recaptured. */
    FrameOpaque4257b0Plan plan;
    frame_opaque_4257b0_plan(runtime_inputs, &plan);
    if (plan.usable != 0) {
      events->frame_opaque_4257b0_id_count = plan.id_count;
      if (isaac_frame_opaque_4257b0_pass_a_needs_host(plan.id_count) != 0) {
        const uint32_t post = frame_opaque_4257b0_build_list(runtime_inputs, &plan, 1);
        events->frame_opaque_4257b0_pass_a_applied = 1u;
        events->frame_opaque_4257b0_inserted = post - plan.pre_count;
        events->frame_opaque_4257b0_post_count = post;
        /* 0x00425a11 cmp eax,[ebx+8] / je 0x425a28: an append with
           end == cap reallocates through the guest allocator. */
        events->frame_opaque_4257b0_list_grow = (post > plan.cap_count) ? 1u : 0u;
        frame_opaque_4257b0_publish(post);
        events->continuation_kind = ISAAC_GAME_UPDATE_RESUME_AFTER_4257B0_PASS_A;
        return 1;
      }
      /* id_count == 0: no Pass A, no recapture, no grow. */
      frame_opaque_4257b0_build_list(runtime_inputs, &plan, 0);
      events->frame_opaque_4257b0_post_count = plan.pre_count;
      frame_opaque_4257b0_pass_b(runtime_inputs, &plan,
                                 runtime_inputs->frame_opaque_4257b0_list_begin,
                                 runtime_inputs->frame_opaque_4257b0_list_end,
                                 plan.pre_count, events);
      frame_opaque_4257b0_publish(plan.pre_count);
    } else {
      /* Pre-v71 host residuals, byte-identical (no blob / count over a cap). */
      if (isaac_frame_opaque_4257b0_pass_a_needs_host(
              runtime_inputs->frame_opaque_4257b0_id_count) != 0) {
        events->opaque_call_004257b0_pass_a += 1;
        events->continuation_kind = ISAAC_GAME_UPDATE_RESUME_AFTER_4257B0_PASS_A;
        return 1;
      }
      if (isaac_frame_opaque_4257b0_pass_b_needs_host_recaptured(
              runtime_inputs->frame_opaque_4257b0_list_count) != 0) {
        events->opaque_call_004257b0_pass_b += 1;
      }
    }
  }
  events->continuation_kind = ISAAC_GAME_UPDATE_RESUME_AFTER_FRAME_MANAGER_UPDATES;
  return 1;
}

extern "C" int32_t isaac_game_update_slice_resume_4257b0_pass_a(
    IsaacGameUpdateSliceState* state,
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs,
    IsaacGameUpdateSliceEvents* events) {
  if (state == nullptr || runtime_inputs == nullptr || events == nullptr ||
      events->continuation_kind != ISAAC_GAME_UPDATE_RESUME_AFTER_4257B0_PASS_A) {
    return 0;
  }
  /* ABI v71: on the blob path the pure Pass A already ran in the head. Rebuild
     the same evolved list (deterministic in runtime_inputs — no state crosses
     the boundary) and gate Pass B on the RECAPTURED F4 pair. Both pointers
     come from the post-Pass-A capture and are consumed together: a grow moves
     begin and end at once, so mixing a pre pointer with a post one would
     produce a garbage bound.

     The recaptured count is the PE truth (0x00425870 reads the LIVE pair). If
     it disagrees with the count the pure Pass A produced, the host applied
     something the slice did not model, so the blob is not trustworthy for
     Pass B and the v70 host residual is emitted instead. */
  FrameOpaque4257b0Plan plan;
  frame_opaque_4257b0_plan(runtime_inputs, &plan);
  if (plan.usable != 0 && events->frame_opaque_4257b0_pass_a_applied != 0u) {
    const uint32_t pure_post =
        frame_opaque_4257b0_build_list(runtime_inputs, &plan, 1);
    const uint32_t post_begin = runtime_inputs->frame_opaque_4257b0_post_list_begin;
    const uint32_t post_end = runtime_inputs->frame_opaque_4257b0_post_list_end;
    const uint32_t recaptured =
        isaac_frame_opaque_4257b0_list_count_from_bounds(post_begin, post_end);
    if (recaptured == pure_post) {
      frame_opaque_4257b0_pass_b(runtime_inputs, &plan, post_begin, post_end,
                                 recaptured, events);
      frame_opaque_4257b0_publish(pure_post);
      events->continuation_kind =
          ISAAC_GAME_UPDATE_RESUME_AFTER_FRAME_MANAGER_UPDATES;
      return 1;
    }
    if (isaac_frame_opaque_4257b0_pass_b_needs_host_recaptured(recaptured) != 0) {
      events->opaque_call_004257b0_pass_b += 1;
    }
    events->continuation_kind =
        ISAAC_GAME_UPDATE_RESUME_AFTER_FRAME_MANAGER_UPDATES;
    return 1;
  }
  /* PE-exact Pass B gate on the count the host re-derived after Pass A. */
  if (isaac_frame_opaque_4257b0_pass_b_needs_host_recaptured(
          runtime_inputs->frame_opaque_4257b0_post_pass_a_list_count) != 0) {
    events->opaque_call_004257b0_pass_b += 1;
  }
  events->continuation_kind = ISAAC_GAME_UPDATE_RESUME_AFTER_FRAME_MANAGER_UPDATES;
  return 1;
}

extern "C" int32_t isaac_game_update_slice_resume_frame_manager_updates(
    IsaacGameUpdateSliceState* state,
    const IsaacGameUpdateSliceConstants* constants,
    const IsaacGameUpdateSliceRuntimeInputs* runtime_inputs,
    IsaacGameUpdateSliceEvents* events) {
  if (state == nullptr || constants == nullptr || runtime_inputs == nullptr ||
      events == nullptr ||
      events->continuation_kind != ISAAC_GAME_UPDATE_RESUME_AFTER_FRAME_MANAGER_UPDATES) {
    return 0;
  }
  continue_after_frame_manager_updates(state, constants, runtime_inputs, events);
  return 1;
}

extern "C" int32_t isaac_game_update_slice_capture(
    const uint8_t* game_object,
    size_t game_object_size,
    IsaacGameUpdateSliceState* state) {
  if (game_object == nullptr || state == nullptr || game_object_size < ISAAC_GAME_UPDATE_GAME_OBJECT_MIN_SIZE) return 0;
  state->short_timer = read_i32(game_object + kShortTimerOffset);
  state->position_reset_timer = read_i32(game_object + kPositionResetTimerOffset);
  state->position_x_bits = read_u32(game_object + kPositionXBitsOffset);
  state->position_y_bits = read_u32(game_object + kPositionYBitsOffset);
  state->secondary_timer = read_i32(game_object + kSecondaryTimerOffset);
  state->decay_value = read_f32(game_object + kDecayValueOffset);
  state->transition_progress = read_f32(game_object + kTransitionProgressOffset);
  state->transition_rate = read_f32(game_object + kTransitionRateOffset);
  state->transition_mode = read_i32(game_object + kTransitionModeOffset);
  state->post_update_delay = read_i32(game_object + kPostUpdateDelayOffset);
  state->gate_1d520 = read_i32(game_object + kGate1d520Offset);
  state->one_shot_1d63c = game_object[kOneShot1d63cOffset];
  state->state_24ecc = read_i32(game_object + kState24eccOffset);
  state->value_24ed0 = read_i32(game_object + kValue24ed0Offset);
  state->mode_24ed8 = read_i32(game_object + kMode24ed8Offset);
  state->gate_1d654 = read_i32(game_object + kGate1d654Offset);
  state->gate_1ba78 = read_i32(game_object + kGate1ba78Offset);
  state->gate_1b83c = read_i32(game_object + kGate1b83cOffset);
  state->predicate_1ba74 = read_i32(game_object + kPredicate1ba74Offset);
  state->engine_field_4 = read_i32(game_object + kEngineField4Offset);
  state->engine_field_8 = read_i32(game_object + kEngineField8Offset);
  state->engine_field_c = read_i32(game_object + kEngineFieldCOffset);
  state->engine_field_10 = read_i32(game_object + kEngineField10Offset);
  state->engine_field_14 = read_i32(game_object + kEngineField14Offset);
  state->engine_field_18 = read_i32(game_object + kEngineField18Offset);
  state->engine_field_1c = read_i32(game_object + kEngineField1cOffset);
  state->engine_field_20 = read_i32(game_object + kEngineField20Offset);
  state->engine_field_24 = read_i32(game_object + kEngineField24Offset);
  state->engine_float_22c = read_f32(game_object + kEngineFloat22cOffset);
  state->engine_float_230 = read_f32(game_object + kEngineFloat230Offset);
  state->engine_player_1bb74 = read_i32(game_object + kEnginePlayer1bb74Offset);
  state->counter_265c0 = read_i32(game_object + kCounter265c0Offset);
  state->item_overlay_state = read_i32(game_object + kItemOverlayStateOffset);
  state->item_overlay_counter_11d1d0 = read_i32(game_object + kItemOverlayCounter11d1d0Offset);
  state->menu_state_23a74 = read_i32(game_object + kMenuState23a74Offset);
  state->generic_prompt_active_object = read_i32(game_object + kGenericPromptActiveObjectOffset);
  state->generic_prompt_active_flag = game_object[kGenericPromptActiveFlagOffset];
  state->generic_prompt_submitted_selection = read_i32(game_object + kGenericPromptSubmittedSelectionOffset);
  state->generic_prompt_post_update_flag = game_object[kGenericPromptPostUpdateFlagOffset];
  state->skip_timed_transition_flag = game_object[kSkipTimedTransitionFlagOffset];
  state->transition_color_r_bits = read_u32(game_object + kTransitionColorRBitsOffset);
  state->transition_color_g_bits = read_u32(game_object + kTransitionColorGBitsOffset);
  state->transition_color_b_bits = read_u32(game_object + kTransitionColorBBitsOffset);
  state->transition_aux_bits = read_u32(game_object + kTransitionAuxBitsOffset);
  state->timed_transition_progress = read_f32(game_object + kTimedTransitionProgressOffset);
  state->timed_transition_force_finish = game_object[kTimedTransitionForceFinishOffset];
  state->status_22ed4 = read_i32(game_object + kStatus22ed4Offset);
  state->status_22edc = read_i32(game_object + kStatus22edcOffset);
  state->timed_transition_cleanup_mode = read_i32(game_object + kTimedTransitionCleanupModeOffset);
  state->effect_counter_67788 = read_i32(game_object + kEffectCounter67788Offset);
  state->effect_counter_68d6c = read_i32(game_object + kEffectCounter68d6cOffset);
  state->room_transition_mode_1830c = read_i32(game_object + kRoomTransitionMode1830cOffset);
  state->room_transition_marker_18318 = read_i32(game_object + kRoomTransitionMarker18318Offset);
  state->room_transition_index_18900 = read_i32(game_object + kRoomTransitionIndex18900Offset);
  state->room_transition_dimension_18904 = game_object[kRoomTransitionDimension18904Offset];
  state->frame_counter_264fc = read_i32(game_object + kFrameCounter264fcOffset);
  state->frame_counter_264f8 = read_i32(game_object + kFrameCounter264f8Offset);
  state->fade_counter_26514 = read_i32(game_object + kFadeCounter26514Offset);
  state->fade_progress_26518 = read_f32(game_object + kFadeProgress26518Offset);
  state->shake_current_67738 = read_f32(game_object + kShakeCurrent67738Offset);
  state->shake_target_6773c = read_f32(game_object + kShakeTarget6773cOffset);
  state->shake_step_67740 = read_f32(game_object + kShakeStep67740Offset);
  state->timer_269e0 = read_i32(game_object + kTimer269e0Offset);
  state->list_count_67730 = read_i32(game_object + kListCount67730Offset);
  state->frame_opaque_4212c0_mode = read_i32(game_object + kFrameOpaque4212c0ModeOffset);
  state->frame_opaque_4212c0_secondary = read_i32(game_object + kFrameOpaque4212c0SecondaryOffset);
  state->frame_opaque_4212c0_field_3c = read_i32(game_object + kFrameOpaque4212c0Field3cOffset);
  state->frame_opaque_4212c0_flag_4c = game_object[kFrameOpaque4212c0Flag4cOffset];
  state->frame_opaque_4212c0_flag_111 = game_object[kFrameOpaque4212c0Flag111Offset];
  state->frame_opaque_98dba0_mode = read_i32(game_object + kFrameOpaque98dba0ModeOffset);
  state->frame_opaque_98dba0_flag = game_object[kFrameOpaque98dba0FlagOffset];
  state->frame_opaque_98dba0_counter = read_i32(game_object + kFrameOpaque98dba0CounterOffset);
  state->frame_opaque_98dba0_float_170 = read_f32(game_object + kFrameOpaque98dba0Float170Offset);
  state->frame_opaque_98dba0_float_2d0 = read_f32(game_object + kFrameOpaque98dba0Float2d0Offset);
  state->hud_message_flag_8 = game_object[kHudMessageFlag8Offset];
  state->hud_message_played_64 = game_object[kHudMessagePlayed64Offset];
  /* ABI v56 rank-display sparse (captured so the no-fold round-trip is a
     no-op; the model overwrites them when the fold runs). The tail manager
     bytes are host-only (the manager pointer is outside the sparse buffer). */
  state->rank_display_switch_after = read_i32(game_object + kRankDisplaySwitchOffset);
  state->rank_display_state_after = read_i32(game_object + kRankDisplayStateOffset);
  state->rank_display_clear_3b0_out = game_object[kRankDisplayByte3b0Offset];
  state->difficulty_269c8 = read_i32(game_object + kDifficulty269c8Offset);
  state->byte_67744 = game_object[kByte67744Offset];
  state->mode_26584 = read_i32(game_object + kMode26584Offset);
  state->flags_2654c = read_u32(game_object + kFlags2654cOffset);
  state->transition_tail_byte_29fb8 =
      game_object[kTransitionTailByte29fb8Offset];
  /* ABI v64: FX-lerp gate lane state (PE 0x006fae80). */
  state->fx_lerp_gate_676b4 = game_object[kFxLerpGate676b4Offset];
  state->fx_cur_676b8 = read_f32(game_object + kFxCur676b8Offset);
  state->fx_cur_676bc = read_f32(game_object + kFxCur676b8Offset + 4);
  state->fx_cur_676c0 = read_f32(game_object + kFxCur676b8Offset + 8);
  state->fx_cur_676c4 = read_f32(game_object + kFxCur676b8Offset + 12);
  state->fx_cur_676c8 = read_f32(game_object + kFxCur676b8Offset + 16);
  state->fx_cur_676cc = read_f32(game_object + kFxCur676b8Offset + 20);
  /* ABI v77: record 22 lane posts (Game+0x1b97d / +0x1b980 / +0x1b984). */
  state->engine_anm2_loaded = read_u32(game_object + kEngineAnm2LoadedOffset);
  state->engine_anm2_slot_10c = read_u32(game_object + kEngineAnm2Slot10cOffset);
  state->engine_anm2_bitflags_110 = read_u32(game_object + kEngineAnm2Bitflags110Offset);
  /* ABI v79: record 2 result byte (Game+0x4aba0). */
  state->global_tree_4aba0_result = game_object[kGlobalTree4aba0Offset];
  /* ABI v80: HUD::PostUpdate history one-shot latch (Game+0x23680). */
  state->hud_history_latch_5c7c = game_object[kHudHistoryLatch5c7cOffset];
  state->game_flags_1839c = read_u32(game_object + kGameFlags1839cOffset);
  /* ABI v67 Room capture contract: the members below live in guest memory the
     sparse Game buffer cannot carry (Room object at *(Game+0x18300), live
     RoomDescriptor at *(Room+0x4), or derived per-tick flags), so capture
     CANNOT read them from `game_object`. They are pinned to 0 — the
     deterministic empty-Room default — and the host overlays its Room values
     after capture (JS overlayHostOwnedState / HOST_OWNED_STATE_CONTRACT).
     Before v67 capture skipped them entirely, so they kept whatever the
     struct held from the previous tick: caller Room state was silently
     discarded and the room trigger-clear chain became a one-shot keyed to
     the Wasm instance instead of to the RoomDescriptor. Every state member
     is now assigned on capture; the struct after capture is a pure function
     of the buffer. */
  state->room_fx_counter_70d8 = 0;
  state->room_fx_limit_70dc = 0;
  state->room_fx_value_70cc = 0.0f;
  state->room_fx_step_70d4 = 0.0f;
  state->room_fx_counter_70f4 = 0;
  state->room_fx_limit_70f8 = 0;
  state->room_fx_value_70e8 = 0.0f;
  state->room_fx_step_70f0 = 0.0f;
  state->room_clear_delay_11ec = 0;
  state->room_alive_12c0 = 0;
  state->room_alive_12c4 = 0;
  state->room_greed_wave_723c = 0;
  state->room_type_8 = 0;
  state->room_desc_subtype = 0;
  state->room_byte_7220 = 0;
  state->room_water_lerp_countdown_7298 = 0;
  state->room_boss_count_12c8 = 0;
  state->room_boss_count_12cc = 0;
  state->room_boss_snapshot_7224 = 0;
  state->room_timer_722c = 0;
  state->room_collectible_timer_7764 = 0;
  state->room_timer_7214 = 0;
  state->room_timer_706c = 0;
  state->room_timer_7230 = 0;
  state->room_water_amount_7240 = 0.0f;
  state->room_lava_intensity_7740 = 0.0f;
  state->room_desc_flags_44 = 0;
  state->room_desc_clear_count_4a = 0;
  state->room_flag_7894 = 0;
  state->room_flag_7769 = 0;
  state->room_ambient_count_7454 = 0;
  state->room_ambient_intensity_7458 = 0.0f;
  state->room_ambient_flag_745c = 0;
  /* ABI v46 decision, kept: roomDescShortAe input arrives via the
     midRestockDescAc/Ae/Seed58 runtime pack; this member is the pure apply's
     output lane only. */
  state->room_desc_short_ae = 0;
  /* Per-tick "rank-display fold reached the 0x0085769c common tail" report
     flag. Before v67 it was never capture-assigned, so once the fold ran a
     stale 1 stuck to every later tick of the instance. */
  state->rank_display_tail_out = 0;
  return 1;
}

extern "C" int32_t isaac_game_update_slice_apply(
    uint8_t* game_object,
    size_t game_object_size,
    const IsaacGameUpdateSliceState* state) {
  if (game_object == nullptr || state == nullptr || game_object_size < ISAAC_GAME_UPDATE_GAME_OBJECT_MIN_SIZE) return 0;
  write_i32(game_object + kShortTimerOffset, state->short_timer);
  write_i32(game_object + kPositionResetTimerOffset, state->position_reset_timer);
  write_u32(game_object + kPositionXBitsOffset, state->position_x_bits);
  write_u32(game_object + kPositionYBitsOffset, state->position_y_bits);
  write_i32(game_object + kSecondaryTimerOffset, state->secondary_timer);
  write_f32(game_object + kDecayValueOffset, state->decay_value);
  write_f32(game_object + kTransitionProgressOffset, state->transition_progress);
  write_f32(game_object + kTransitionRateOffset, state->transition_rate);
  write_i32(game_object + kTransitionModeOffset, state->transition_mode);
  write_i32(game_object + kPostUpdateDelayOffset, state->post_update_delay);
  write_i32(game_object + kGate1d520Offset, state->gate_1d520);
  game_object[kOneShot1d63cOffset] = (uint8_t)state->one_shot_1d63c;
  game_object[kTransitionTailByte29fb8Offset] = (uint8_t)state->transition_tail_byte_29fb8;
  /* ABI v64: FX-lerp gate lane state. */
  game_object[kFxLerpGate676b4Offset] = (uint8_t)state->fx_lerp_gate_676b4;
  write_f32(game_object + kFxCur676b8Offset, state->fx_cur_676b8);
  write_f32(game_object + kFxCur676b8Offset + 4, state->fx_cur_676bc);
  write_f32(game_object + kFxCur676b8Offset + 8, state->fx_cur_676c0);
  write_f32(game_object + kFxCur676b8Offset + 12, state->fx_cur_676c4);
  write_f32(game_object + kFxCur676b8Offset + 16, state->fx_cur_676c8);
  write_f32(game_object + kFxCur676b8Offset + 20, state->fx_cur_676cc);
  /* ABI v77: record 22 lane posts. On arms where the lane did not run these
     write the captured pre values back unchanged (latch byte untouched). */
  write_u32(game_object + kEngineAnm2LoadedOffset, state->engine_anm2_loaded);
  write_u32(game_object + kEngineAnm2Slot10cOffset, state->engine_anm2_slot_10c);
  write_u32(game_object + kEngineAnm2Bitflags110Offset, state->engine_anm2_bitflags_110);
  /* ABI v79: record 2 result byte. */
  game_object[kGlobalTree4aba0Offset] = (uint8_t)state->global_tree_4aba0_result;
  /* ABI v80: HUD::PostUpdate history latch. */
  game_object[kHudHistoryLatch5c7cOffset] = state->hud_history_latch_5c7c;
  write_i32(game_object + kState24eccOffset, state->state_24ecc);
  write_i32(game_object + kValue24ed0Offset, state->value_24ed0);
  write_i32(game_object + kMode24ed8Offset, state->mode_24ed8);
  write_i32(game_object + kGate1d654Offset, state->gate_1d654);
  write_i32(game_object + kGate1ba78Offset, state->gate_1ba78);
  write_i32(game_object + kGate1b83cOffset, state->gate_1b83c);
  write_i32(game_object + kPredicate1ba74Offset, state->predicate_1ba74);
  write_i32(game_object + kEngineField4Offset, state->engine_field_4);
  write_i32(game_object + kEngineField8Offset, state->engine_field_8);
  write_i32(game_object + kEngineFieldCOffset, state->engine_field_c);
  write_i32(game_object + kEngineField10Offset, state->engine_field_10);
  write_i32(game_object + kEngineField14Offset, state->engine_field_14);
  write_i32(game_object + kEngineField18Offset, state->engine_field_18);
  write_i32(game_object + kEngineField1cOffset, state->engine_field_1c);
  write_i32(game_object + kEngineField20Offset, state->engine_field_20);
  write_i32(game_object + kEngineField24Offset, state->engine_field_24);
  write_f32(game_object + kEngineFloat22cOffset, state->engine_float_22c);
  write_f32(game_object + kEngineFloat230Offset, state->engine_float_230);
  write_i32(game_object + kEnginePlayer1bb74Offset, state->engine_player_1bb74);
  write_i32(game_object + kCounter265c0Offset, state->counter_265c0);
  write_i32(game_object + kItemOverlayStateOffset, state->item_overlay_state);
  write_i32(game_object + kItemOverlayCounter11d1d0Offset, state->item_overlay_counter_11d1d0);
  write_i32(game_object + kMenuState23a74Offset, state->menu_state_23a74);
  write_i32(game_object + kGenericPromptActiveObjectOffset, state->generic_prompt_active_object);
  game_object[kGenericPromptActiveFlagOffset] = (uint8_t)state->generic_prompt_active_flag;
  write_i32(game_object + kGenericPromptSubmittedSelectionOffset, state->generic_prompt_submitted_selection);
  game_object[kGenericPromptPostUpdateFlagOffset] = (uint8_t)state->generic_prompt_post_update_flag;
  game_object[kSkipTimedTransitionFlagOffset] = (uint8_t)state->skip_timed_transition_flag;
  write_u32(game_object + kTransitionColorRBitsOffset, state->transition_color_r_bits);
  write_u32(game_object + kTransitionColorGBitsOffset, state->transition_color_g_bits);
  write_u32(game_object + kTransitionColorBBitsOffset, state->transition_color_b_bits);
  write_u32(game_object + kTransitionAuxBitsOffset, state->transition_aux_bits);
  write_f32(game_object + kTimedTransitionProgressOffset, state->timed_transition_progress);
  game_object[kTimedTransitionForceFinishOffset] = (uint8_t)state->timed_transition_force_finish;
  write_i32(game_object + kStatus22ed4Offset, state->status_22ed4);
  write_i32(game_object + kStatus22edcOffset, state->status_22edc);
  write_i32(game_object + kTimedTransitionCleanupModeOffset, state->timed_transition_cleanup_mode);
  write_i32(game_object + kEffectCounter67788Offset, state->effect_counter_67788);
  write_i32(game_object + kEffectCounter68d6cOffset, state->effect_counter_68d6c);
  write_i32(game_object + kRoomTransitionMode1830cOffset, state->room_transition_mode_1830c);
  write_i32(game_object + kRoomTransitionMarker18318Offset, state->room_transition_marker_18318);
  write_i32(game_object + kRoomTransitionIndex18900Offset, state->room_transition_index_18900);
  game_object[kRoomTransitionDimension18904Offset] = (uint8_t)state->room_transition_dimension_18904;
  write_i32(game_object + kFrameCounter264fcOffset, state->frame_counter_264fc);
  write_i32(game_object + kFrameCounter264f8Offset, state->frame_counter_264f8);
  write_i32(game_object + kFadeCounter26514Offset, state->fade_counter_26514);
  write_f32(game_object + kFadeProgress26518Offset, state->fade_progress_26518);
  write_f32(game_object + kShakeCurrent67738Offset, state->shake_current_67738);
  write_f32(game_object + kShakeTarget6773cOffset, state->shake_target_6773c);
  write_f32(game_object + kShakeStep67740Offset, state->shake_step_67740);
  write_i32(game_object + kTimer269e0Offset, state->timer_269e0);
  write_i32(game_object + kListCount67730Offset, state->list_count_67730);
  write_i32(game_object + kFrameOpaque4212c0ModeOffset, state->frame_opaque_4212c0_mode);
  write_i32(game_object + kFrameOpaque4212c0SecondaryOffset, state->frame_opaque_4212c0_secondary);
  write_i32(game_object + kFrameOpaque4212c0Field3cOffset, state->frame_opaque_4212c0_field_3c);
  game_object[kFrameOpaque4212c0Flag4cOffset] =
      static_cast<uint8_t>(state->frame_opaque_4212c0_flag_4c & 0xffu);
  game_object[kFrameOpaque4212c0Flag111Offset] =
      static_cast<uint8_t>(state->frame_opaque_4212c0_flag_111 & 0xffu);
  write_i32(game_object + kFrameOpaque98dba0ModeOffset, state->frame_opaque_98dba0_mode);
  game_object[kFrameOpaque98dba0FlagOffset] =
      static_cast<uint8_t>(state->frame_opaque_98dba0_flag & 0xffu);
  write_i32(game_object + kFrameOpaque98dba0CounterOffset, state->frame_opaque_98dba0_counter);
  write_f32(game_object + kFrameOpaque98dba0Float170Offset, state->frame_opaque_98dba0_float_170);
  write_f32(game_object + kFrameOpaque98dba0Float2d0Offset, state->frame_opaque_98dba0_float_2d0);
  game_object[kHudMessageFlag8Offset] =
      static_cast<uint8_t>(state->hud_message_flag_8 & 0xffu);
  game_object[kHudMessagePlayed64Offset] =
      static_cast<uint8_t>(state->hud_message_played_64 & 0xffu);
  write_i32(game_object + kRankDisplaySwitchOffset, state->rank_display_switch_after);
  write_i32(game_object + kRankDisplayStateOffset, state->rank_display_state_after);
  game_object[kRankDisplayByte3b0Offset] =
      static_cast<uint8_t>(state->rank_display_clear_3b0_out & 0xffu);
  write_i32(game_object + kDifficulty269c8Offset, state->difficulty_269c8);
  game_object[kByte67744Offset] = static_cast<uint8_t>(state->byte_67744 & 0xffu);
  write_i32(game_object + kMode26584Offset, state->mode_26584);
  write_u32(game_object + kFlags2654cOffset, state->flags_2654c);
  write_u32(game_object + kGameFlags1839cOffset, state->game_flags_1839c);
  return 1;
}

extern "C" uint32_t isaac_game_update_slice_abi_version(void) {
  return ISAAC_GAME_UPDATE_SLICE_ABI_VERSION;
}

extern "C" uint32_t isaac_game_update_slice_state_size(void) {
  return (uint32_t)sizeof(IsaacGameUpdateSliceState);
}

extern "C" uint32_t isaac_game_update_slice_constants_size(void) {
  return (uint32_t)sizeof(IsaacGameUpdateSliceConstants);
}

extern "C" uint32_t isaac_game_update_slice_runtime_inputs_size(void) {
  return (uint32_t)sizeof(IsaacGameUpdateSliceRuntimeInputs);
}

extern "C" uint32_t isaac_game_update_slice_events_size(void) {
  return (uint32_t)sizeof(IsaacGameUpdateSliceEvents);
}

extern "C" uintptr_t isaac_game_update_slice_state_address(void) {
  return (uintptr_t)&scratch_state;
}

extern "C" uintptr_t isaac_game_update_slice_constants_address(void) {
  return (uintptr_t)&scratch_constants;
}

extern "C" uintptr_t isaac_game_update_slice_runtime_inputs_address(void) {
  return (uintptr_t)&scratch_runtime_inputs;
}

extern "C" uintptr_t isaac_game_update_slice_events_address(void) {
  return (uintptr_t)&scratch_events;
}

extern "C" uintptr_t isaac_game_update_slice_game_object_address(void) {
  return (uintptr_t)scratch_game_object;
}

extern "C" uint32_t isaac_game_update_slice_game_object_size(void) {
  return (uint32_t)sizeof(scratch_game_object);
}

extern "C" void isaac_game_update_slice_reset_scratch(void) {
  scratch_state = {};
  scratch_constants = {};
  scratch_runtime_inputs = {};
  scratch_events = {};
  for (int32_t i = 0; i < ISAAC_ROOM_B8_MAX_CELLS; ++i) {
    scratch_b8_costs[i] = 0;
    scratch_b8_trails[i] = 0;
  }
  for (int32_t i = 0; i < ISAAC_GAME_UPDATE_B2_SPAWN_MAX_ELEMS * 16; ++i) {
    scratch_b2_spawn_in[i] = 0;
  }
  for (int32_t i = 0; i < ISAAC_GAME_UPDATE_B2_SPAWN_MAX_ELEMS * 24; ++i) {
    scratch_b2_spawn_out[i] = 0;
  }
  for (int32_t i = 0; i < ISAAC_GAME_UPDATE_B2_POOL_COUNT; ++i) {
    scratch_b2_pool_ids[i] = 0;
    scratch_b2_pool_weights[i] = 0;
  }
  for (int32_t i = 0; i < ISAAC_ENGINE_PLAYER_MAX; ++i) {
    scratch_engine_player_eligible[i] = 0;
    scratch_engine_player_f360[i] = 0.0f;
    scratch_engine_player_f364[i] = 0.0f;
    scratch_engine_player_f410[i] = 0;
  }
  for (int32_t i = 0; i < ISAAC_PLAYER_HUD_MAX_SLOTS; ++i) {
    scratch_player_hud_active[i] = {};
    scratch_player_hud_blink[i] = 0;
    scratch_player_hud_float[i] = 0.0f;
    scratch_player_hud_chars[i] = {};
  }
  for (int32_t i = 0; i < ISAAC_UPDATE_LIST_MAX_NODES; ++i) {
    scratch_update_list_timers_out[i] = 0;
    scratch_update_list_evict_flags[i] = 0;
  }
  for (int32_t i = 0; i < ISAAC_HUD_STAT_COUNTDOWN_COUNT; ++i) {
    scratch_hud_stat_countdown[i] = 0;
  }
  for (int32_t i = 0; i < ISAAC_HUD_STAT_WALK_SCRATCH_WORDS; ++i) {
    scratch_hud_stat_walk[i] = 0;
  }
  for (int32_t i = 0; i < ISAAC_ENGINE_PLAYER_MAX; ++i) {
    scratch_player_flag_410[i] = 0;
  }
  for (int32_t i = 0; i < ISAAC_OPAQUE_0092E300_MAX_VOICES; ++i) {
    scratch_sound_group_pending[i] = 0;
  }
  scratch_sound_group_walk_plan = {};
  for (int32_t i = 0; i < ISAAC_SFX_STOP_FOLD_MAX_VOICES; ++i) {
    scratch_sfx_stop_pending[i] = 0;
  }
  scratch_sfx_stop_fold_plan = {};
  for (int32_t i = 0; i < ISAAC_MENU_AUX_TREE_MAX_NODES; ++i) {
    scratch_menu_aux_visit_order[i] = -1;
    scratch_menu_aux_payload_free[i] = 0;
  }
  scratch_menu_aux_accounting_out[0] = 0;
  scratch_menu_aux_accounting_out[1] = 0;
  for (int32_t i = 0; i < ISAAC_MENU_AUX_SENTINEL_OUT_WORDS; ++i) {
    scratch_menu_aux_sentinel_out[i] = 0;
  }
  for (int32_t i = 0; i < ISAAC_GENRAND_STATE_WORDS; ++i) {
    scratch_genrand_state[i] = 0;
  }
  for (int32_t i = 0; i < ISAAC_GENRAND_MAX_SAMPLES; ++i) {
    scratch_genrand_samples[i] = 0;
  }
  scratch_genrand_index_out = 0;
  for (int32_t i = 0; i < (int32_t)(ISAAC_AMBIENT_824A70_MAX_LOOPS * 7); ++i) {
    scratch_ambient_824a70_create_args[i] = 0;
  }
  for (int32_t i = 0; i < kFrameOpaque4257b0BytesSize; ++i) {
    scratch_frame_opaque_4257b0_bytes[i] = 0;
  }
  for (int32_t i = 0; i < 3 * kFrameOpaque4257b0MaxList; ++i) {
    scratch_frame_opaque_4257b0_list_out[i] = 0;
  }
}

extern "C" uintptr_t
isaac_game_update_slice_frame_opaque_4257b0_list_out_address(void) {
  return (uintptr_t)scratch_frame_opaque_4257b0_list_out;
}

extern "C" uint32_t isaac_game_update_slice_frame_opaque_4257b0_max_list(void) {
  return (uint32_t)ISAAC_FRAME_OPAQUE_4257B0_MAX_LIST;
}

extern "C" uint32_t isaac_game_update_slice_frame_opaque_4257b0_max_players(void) {
  return (uint32_t)ISAAC_FRAME_OPAQUE_4257B0_MAX_PLAYERS;
}

extern "C" uint32_t isaac_game_update_slice_frame_opaque_4257b0_max_elems(void) {
  return (uint32_t)ISAAC_FRAME_OPAQUE_4257B0_MAX_ELEMS;
}

extern "C" uintptr_t isaac_game_update_slice_genrand_state_address(void) {
  return (uintptr_t)scratch_genrand_state;
}

extern "C" uintptr_t isaac_game_update_slice_genrand_index_out_address(void) {
  return (uintptr_t)&scratch_genrand_index_out;
}

extern "C" uintptr_t isaac_game_update_slice_genrand_samples_address(void) {
  return (uintptr_t)scratch_genrand_samples;
}

extern "C" uint32_t isaac_game_update_slice_genrand_state_words(void) {
  return (uint32_t)ISAAC_GENRAND_STATE_WORDS;
}

extern "C" uint32_t isaac_game_update_slice_genrand_max_samples(void) {
  return (uint32_t)ISAAC_GENRAND_MAX_SAMPLES;
}

extern "C" uintptr_t isaac_game_update_slice_menu_aux_visit_order_address(void) {
  return (uintptr_t)scratch_menu_aux_visit_order;
}

extern "C" uintptr_t isaac_game_update_slice_menu_aux_payload_free_address(void) {
  return (uintptr_t)scratch_menu_aux_payload_free;
}

extern "C" uintptr_t isaac_game_update_slice_menu_aux_accounting_out_address(void) {
  return (uintptr_t)scratch_menu_aux_accounting_out;
}

extern "C" uint32_t isaac_game_update_slice_menu_aux_max_nodes(void) {
  return (uint32_t)ISAAC_MENU_AUX_TREE_MAX_NODES;
}

extern "C" uintptr_t isaac_game_update_slice_menu_aux_sentinel_out_address(void) {
  return (uintptr_t)scratch_menu_aux_sentinel_out;
}

extern "C" uint32_t isaac_game_update_slice_menu_aux_sentinel_out_words(void) {
  return (uint32_t)ISAAC_MENU_AUX_SENTINEL_OUT_WORDS;
}

extern "C" uintptr_t isaac_game_update_slice_update_list_timers_out_address(void) {
  return (uintptr_t)scratch_update_list_timers_out;
}
extern "C" uintptr_t isaac_game_update_slice_update_list_evict_flags_address(void) {
  return (uintptr_t)scratch_update_list_evict_flags;
}
extern "C" uintptr_t isaac_game_update_slice_hud_stat_countdown_address(void) {
  return (uintptr_t)scratch_hud_stat_countdown;
}
extern "C" uint32_t isaac_game_update_slice_hud_stat_countdown_count(void) {
  return (uint32_t)ISAAC_HUD_STAT_COUNTDOWN_COUNT;
}
extern "C" uintptr_t isaac_game_update_slice_hud_stat_walk_address(void) {
  return (uintptr_t)scratch_hud_stat_walk;
}
extern "C" uint32_t isaac_game_update_slice_hud_stat_walk_count(void) {
  return (uint32_t)ISAAC_HUD_STAT_WALK_SCRATCH_WORDS;
}

extern "C" uint32_t isaac_game_update_slice_update_list_max_nodes(void) {
  return (uint32_t)ISAAC_UPDATE_LIST_MAX_NODES;
}

extern "C" uintptr_t isaac_game_update_slice_player_flag_410_address(void) {
  return (uintptr_t)scratch_player_flag_410;
}

extern "C" uint32_t isaac_game_update_slice_player_flag_410_max(void) {
  return (uint32_t)ISAAC_ENGINE_PLAYER_MAX;
}

extern "C" uintptr_t isaac_game_update_slice_sound_group_walk_pending_address(void) {
  return (uintptr_t)scratch_sound_group_pending;
}
extern "C" uintptr_t isaac_game_update_slice_sound_group_walk_plan_address(void) {
  return (uintptr_t)&scratch_sound_group_walk_plan;
}
extern "C" uint32_t isaac_game_update_slice_sound_group_walk_max_voices(void) {
  return (uint32_t)ISAAC_OPAQUE_0092E300_MAX_VOICES;
}
extern "C" uint32_t isaac_game_update_slice_sound_group_walk_plan_words(void) {
  return (uint32_t)ISAAC_SOUND_GROUP_WALK_PLAN_WORDS;
}

/* ABI v95 (record idx 1, 0x0092e300, LAST in-module leaf L4): the frozen
   sound-group walk EXACTNESS gate (see header decl for the full law).
   PE-truth anchors (instruction stream, cpu-dump/0092e300.txt):
     0x92e30f mov edx,[eax+4] ; 0x92e312 mov edi,[eax] ; 0x92e314 sub edx,edi
       -> span = (u32)end - (u32)begin, 32-bit wrap
     0x92e316..0x92e32a  mov eax,0x094f2095 ; imul edx ; sar edx,4 ;
       mov eax,edx ; shr eax,0x1f ; add eax,edx ; je 0x92e41d
       -> group_count = trunc(span/0x1b8) SIGNED (the shared family
          divide; consumed BY REFERENCE via isaac_sfx_entry_count —
          never restated), count==0 returns at once
     0x92e340/0x92e352  BYTE [grp+0x198] / UNSIGNED [grp+0x190] gates
     0x92e361..  per-voice channel re-reads (0x92e380/0x92e39a/0x92e3b7)
     0x92e3d9  bound re-read [grp+0x190] EVERY inner iteration
     0x92e3f8  span re-read (end-begin) EVERY outer iteration
   The law: 1 iff the FROZEN capture is exact-by-construction (count
   agrees with span through the PE divide, caps hold, every walked group's
   voice window fits the captured array, zero span exact). */
extern "C" int32_t isaac_game_update_slice_0092e300_walk_exact(
    uint32_t span_bytes, uint32_t group_count, uint32_t voice_count,
    const int32_t* first_voice, const uint32_t* group_entry_count,
    const uint32_t* group_enabled) {
  const int32_t derived =
      isaac_sfx_entry_count(static_cast<int32_t>(span_bytes));
  if (derived == 0 && group_count == 0u) return 1; /* PE 0x92e32a je */
  if (derived != static_cast<int32_t>(group_count)) return 0;
  if (group_count > ISAAC_OPAQUE_0092E300_MAX_GROUPS) return 0;
  if (voice_count > ISAAC_OPAQUE_0092E300_MAX_VOICES) return 0;
  if (group_count == 0u) return 1;
  if (first_voice == nullptr || group_entry_count == nullptr ||
      group_enabled == nullptr) {
    return 0;
  }
  for (uint32_t g = 0; g < group_count; ++g) {
    /* Only WALK groups execute voice reads in the PE (0x92e340 BYTE
       enabled / 0x92e352 UNSIGNED count gates precede every [e+0x29]
       store); disabled/empty groups never touch their window, so their
       first_voice/entry_count do not constrain exactness. */
    if (isaac_sfx_stop_all_group_action(group_enabled[g],
                                        group_entry_count[g]) !=
        ISAAC_SFX_STOP_ALL_GROUP_WALK) {
      continue;
    }
    const int32_t fv = first_voice[g];
    const uint32_t count_190 = group_entry_count[g];
    if (fv < 0) return 0;
    /* The window is fully inside the captured array: no truncated voice
       the PE would visit may fall outside the frozen voice_count. */
    if (static_cast<uint64_t>(static_cast<uint32_t>(fv)) +
            static_cast<uint64_t>(count_190) >
        voice_count) {
      return 0;
    }
  }
  return 1;
}

/* ABI v95 (record idx 10 R1): the 4212c0 A/B 409030-pair plan scratch.
   The host reads it after the step to dispatch the typed ADVANCE/REWIND
   events (0x408d00/0x40a1b0) with the exact PE targets. Filled by
   apply_frame_opaque_4212c0_pure only when ab_pack_ready and the pair is
   live; zeroed every step. */
extern "C" uintptr_t isaac_game_update_slice_4212c0_anm2_plan_address(void) {
  return (uintptr_t)&scratch_4212c0_anm2_plan;
}
extern "C" uint32_t isaac_game_update_slice_4212c0_anm2_plan_words(void) {
  return (uint32_t)(sizeof(IsaacGameUpdateSlice4212c0Anm2Plan) / 4u);
}

/* ABI v96 (record idx 10 R2, v98 interior LIVE seam): the composed
   true-probe interior prefix-plan scratch. Filled by
   apply_frame_opaque_4212c0_pure when the ABI-96 SFX-manager blob is live
   (blob ready + probe ready + probe TRUE) and the @936 typed event fires.
   The host reads it after the step to apply the interior bodies (the
   9-store mask, the volume gate 0x92e430, the 0x6fd7c0 arg build, the
   8318a0 drop decision). Zeroed every step (blob absent -> all zeros). */
extern "C" uintptr_t isaac_game_update_slice_4212c0_true_probe_prefix_plan_address(void) {
  return (uintptr_t)&scratch_4212c0_true_probe_prefix_plan;
}
extern "C" uint32_t isaac_game_update_slice_4212c0_true_probe_prefix_plan_words(void) {
  return (uint32_t)(sizeof(IsaacGameUpdateSlice4212c0TrueProbePrefixPlan) / 4u);
}

/* ABI v102 (record idx 4, 0x008318a0 store-plan APPLICATION arm): the
   step-scratch of the typed per-row apply plan (148 B, 37 words — the
   struct the apply law fills). Filled by the gate_1b83c mode-1 seam when
   the manager-block gate opens (the @932 typed event fires); the host
   reads it after the step (address export) to apply the 9 masked stores
   to the SFX-manager BSS. Zeroed every step (gate miss -> all zeros). */
extern "C" uintptr_t isaac_game_update_slice_8318a0_sfx_manager_store_apply_plan_address(void) {
  return (uintptr_t)&scratch_8318a0_sfx_manager_store_apply_plan;
}
extern "C" uint32_t isaac_game_update_slice_8318a0_sfx_manager_store_apply_plan_words(void) {
  return (uint32_t)(sizeof(IsaacGameUpdateSlice8318a0SfxManagerStoreApplyPlan) / 4u);
}

/* ABI v95: record idx 47 STOP fold (0x0092e230) in-module scratch. */
extern "C" uintptr_t isaac_game_update_slice_sfx_stop_fold_pending_address(void) {
  return (uintptr_t)scratch_sfx_stop_pending;
}
extern "C" uintptr_t isaac_game_update_slice_sfx_stop_fold_plan_address(void) {
  return (uintptr_t)&scratch_sfx_stop_fold_plan;
}
extern "C" uint32_t isaac_game_update_slice_sfx_stop_fold_max_voices(void) {
  return (uint32_t)ISAAC_SFX_STOP_FOLD_MAX_VOICES;
}
extern "C" uint32_t isaac_game_update_slice_sfx_stop_fold_plan_words(void) {
  return (uint32_t)ISAAC_SFX_STOP_FOLD_PLAN_WORDS;
}

extern "C" uintptr_t isaac_game_update_slice_player_hud_active_address(void) {
  return (uintptr_t)scratch_player_hud_active;
}

extern "C" uintptr_t isaac_game_update_slice_player_hud_blink_address(void) {
  return (uintptr_t)scratch_player_hud_blink;
}

extern "C" uintptr_t isaac_game_update_slice_player_hud_float_address(void) {
  return (uintptr_t)scratch_player_hud_float;
}

extern "C" uintptr_t isaac_game_update_slice_player_hud_chars_address(void) {
  return (uintptr_t)scratch_player_hud_chars;
}

extern "C" uint32_t isaac_game_update_slice_player_hud_max_slots(void) {
  return (uint32_t)ISAAC_PLAYER_HUD_MAX_SLOTS;
}

extern "C" uintptr_t isaac_game_update_slice_b8_costs_address(void) {
  return (uintptr_t)scratch_b8_costs;
}

extern "C" uintptr_t isaac_game_update_slice_b8_trails_address(void) {
  return (uintptr_t)scratch_b8_trails;
}

extern "C" uint32_t isaac_game_update_slice_b8_max_cells(void) {
  return (uint32_t)ISAAC_ROOM_B8_MAX_CELLS;
}

extern "C" uintptr_t isaac_game_update_slice_engine_player_eligible_address(void) {
  return (uintptr_t)scratch_engine_player_eligible;
}

extern "C" uintptr_t isaac_game_update_slice_engine_player_f360_address(void) {
  return (uintptr_t)scratch_engine_player_f360;
}

extern "C" uintptr_t isaac_game_update_slice_engine_player_f364_address(void) {
  return (uintptr_t)scratch_engine_player_f364;
}

extern "C" uintptr_t isaac_game_update_slice_engine_player_f410_address(void) {
  return (uintptr_t)scratch_engine_player_f410;
}

extern "C" uint32_t isaac_game_update_slice_engine_player_max(void) {
  return (uint32_t)ISAAC_ENGINE_PLAYER_MAX;
}

extern "C" int32_t isaac_game_update_slice_capture_scratch(void) {
  return isaac_game_update_slice_capture(scratch_game_object, sizeof(scratch_game_object), &scratch_state);
}

extern "C" int32_t isaac_game_update_slice_apply_scratch(void) {
  return isaac_game_update_slice_apply(scratch_game_object, sizeof(scratch_game_object), &scratch_state);
}

extern "C" void isaac_game_update_slice_step_scratch(void) {
  isaac_game_update_slice_step(&scratch_state, &scratch_constants, &scratch_runtime_inputs, &scratch_events);
}

extern "C" int32_t isaac_game_update_slice_resume_gate_1b83c_scratch(void) {
  return isaac_game_update_slice_resume_gate_1b83c(&scratch_state, &scratch_events);
}

extern "C" int32_t isaac_game_update_slice_resume_92f1c0_scratch(void) {
  return isaac_game_update_slice_resume_92f1c0(
      &scratch_state, &scratch_runtime_inputs, &scratch_events);
}

extern "C" int32_t isaac_game_update_slice_resume_generic_prompt_scratch(void) {
  return isaac_game_update_slice_resume_generic_prompt(&scratch_state, &scratch_events);
}

extern "C" int32_t isaac_game_update_slice_resume_item_overlay_scratch(void) {
  return isaac_game_update_slice_resume_item_overlay(
      &scratch_state, &scratch_runtime_inputs, &scratch_events);
}

extern "C" int32_t isaac_game_update_slice_continue_timed_transition_scratch(void) {
  return isaac_game_update_slice_continue_timed_transition(
      &scratch_state, &scratch_runtime_inputs, &scratch_events);
}

extern "C" int32_t isaac_game_update_slice_continue_menu_gates_scratch(void) {
  return isaac_game_update_slice_continue_menu_gates(
      &scratch_state, &scratch_runtime_inputs, &scratch_events);
}

extern "C" int32_t isaac_game_update_slice_resume_menu_open_scratch(void) {
  return isaac_game_update_slice_resume_menu_open(
      &scratch_state, &scratch_runtime_inputs, &scratch_events);
}

extern "C" int32_t isaac_game_update_slice_resume_menu_update_scratch(void) {
  return isaac_game_update_slice_resume_menu_update(
      &scratch_state, &scratch_runtime_inputs, &scratch_events);
}

extern "C" int32_t isaac_game_update_slice_resume_frame_aux_updates_scratch(void) {
  return isaac_game_update_slice_resume_frame_aux_updates(
      &scratch_state, &scratch_constants, &scratch_runtime_inputs, &scratch_events);
}

extern "C" int32_t isaac_game_update_slice_resume_stage_transition_effect_scratch(void) {
  return isaac_game_update_slice_resume_stage_transition_effect(
      &scratch_state, &scratch_runtime_inputs, &scratch_events);
}

extern "C" int32_t isaac_game_update_slice_resume_room_transition_effect_scratch(void) {
  return isaac_game_update_slice_resume_room_transition_effect(
      &scratch_state, &scratch_runtime_inputs, &scratch_events);
}

extern "C" int32_t isaac_game_update_slice_resume_engine_prefix_scratch(void) {
  return isaac_game_update_slice_resume_engine_prefix(
      &scratch_state, &scratch_runtime_inputs, &scratch_events);
}

extern "C" int32_t isaac_game_update_slice_resume_98dba0_player_walk_scratch(void) {
  return isaac_game_update_slice_resume_98dba0_player_walk(
      &scratch_state, &scratch_runtime_inputs, &scratch_events);
}

extern "C" int32_t isaac_game_update_slice_resume_frame_manager_updates_scratch(void) {
  return isaac_game_update_slice_resume_frame_manager_updates(
      &scratch_state, &scratch_constants, &scratch_runtime_inputs, &scratch_events);
}

extern "C" int32_t isaac_game_update_slice_resume_room_update_prefix_b1_scratch(void) {
  return isaac_game_update_slice_resume_room_update_prefix_b1(
      &scratch_state, &scratch_runtime_inputs, &scratch_events);
}

extern "C" int32_t isaac_game_update_slice_resume_room_update_prefix_b2_scratch(void) {
  return isaac_game_update_slice_resume_room_update_prefix_b2(
      &scratch_state, &scratch_runtime_inputs, &scratch_events);
}

/* ABI v95 (record idx 14): B2 spawn-plan + pool-list scratch exports. */
extern "C" uintptr_t isaac_game_update_slice_b2_spawn_in_address(void) {
  return (uintptr_t)&scratch_b2_spawn_in[0];
}
extern "C" uintptr_t isaac_game_update_slice_b2_spawn_out_address(void) {
  return (uintptr_t)&scratch_b2_spawn_out[0];
}
extern "C" uint32_t isaac_game_update_slice_b2_spawn_max(void) {
  return (uint32_t)ISAAC_GAME_UPDATE_B2_SPAWN_MAX_ELEMS;
}
extern "C" uintptr_t isaac_game_update_slice_b2_pool_list_address(void) {
  return (uintptr_t)&scratch_b2_pool_ids[0];
}
extern "C" uint32_t isaac_game_update_slice_b2_pool_list_max(void) {
  return (uint32_t)ISAAC_GAME_UPDATE_B2_POOL_COUNT;
}

extern "C" int32_t isaac_game_update_slice_resume_room_update_prefix_scratch(void) {
  return isaac_game_update_slice_resume_room_update_prefix(
      &scratch_state, &scratch_runtime_inputs, &scratch_events);
}

extern "C" int32_t isaac_game_update_slice_resume_room_clear_nested_scratch(void) {
  return isaac_game_update_slice_resume_room_clear_nested(
      &scratch_state, &scratch_runtime_inputs, &scratch_events);
}

extern "C" int32_t isaac_game_update_slice_resume_room_update_clear_scratch(void) {
  return isaac_game_update_slice_resume_room_update_clear(
      &scratch_state, &scratch_runtime_inputs, &scratch_events);
}

extern "C" int32_t isaac_game_update_slice_resume_room_update_head_scratch(void) {
  return isaac_game_update_slice_resume_room_update_head(
      &scratch_state, &scratch_runtime_inputs, &scratch_events);
}

extern "C" int32_t isaac_game_update_slice_resume_4257b0_pass_a_scratch(void) {
  return isaac_game_update_slice_resume_4257b0_pass_a(
      &scratch_state, &scratch_runtime_inputs, &scratch_events);
}

/* ------------------------------------------------------------------ */
/* ABI v95 (record idx 37, opaqueRoomUpdateTailMid): pure DECISION laws
   of the three always-body calls (curse FUN_00820910 / greed-special
   FUN_00801ee0 / room mid-tail FUN_00800500), census 0x00805378..
   0x008053e2. Arg prep + gate shapes; the BODIES stay typed-host
   (stateful: genrand/create/vcall, Game stores + wave/music/SFX, entity
   walks + intensity posts). Each law wraps the room family's proven
   transcription (isaac_room_tailmid_*, room package ABI 53) so the
   update slice owns it as its own ABI contract. uint32_t/int32_t/float
   params only — no uint8_t scalar params (low-byte re-narrow in body). */

extern "C" int32_t isaac_game_update_slice_tailmid_curse_gate_open(
    uint32_t game_flags_1839c, uint32_t room_desc_flags_44,
    uint32_t room_active_byte0, int32_t frame_264f8, int32_t room_entry_11f0) {
  /* PE 0x80537e..0x8053aa: four pure clauses; IsPaused sample excluded. */
  if ((game_flags_1839c & ISAAC_ROOM_TAILMID_CURSE_FLAG_BIT) == 0u) return 0;
  if ((room_desc_flags_44 & ISAAC_ROOM_TAILMID_CURSE_FLAG_BIT) != 0u) return 0;
  if ((room_active_byte0 & 0xffu) == 0u) return 0;
  if ((frame_264f8 - room_entry_11f0) != 1) return 0;
  return 1;
}

extern "C" int32_t isaac_game_update_slice_tailmid_curse_needs_host(
    uint32_t game_flags_1839c, uint32_t room_desc_flags_44,
    uint32_t room_active_byte0, int32_t frame_264f8, int32_t room_entry_11f0,
    uint32_t is_paused) {
  if (isaac_game_update_slice_tailmid_curse_gate_open(
          game_flags_1839c, room_desc_flags_44, room_active_byte0,
          frame_264f8, room_entry_11f0) == 0) {
    return 0;
  }
  /* PE 0x8053ac call Game::IsPaused; test al; 0x8053b3 jne skip. */
  if ((is_paused & 0xffu) != 0u) return 0;
  return 1;
}

extern "C" uint32_t isaac_game_update_slice_tailmid_curse_flag_or_4000(
    uint32_t room_desc_flags_44) {
  return room_desc_flags_44 | ISAAC_ROOM_TAILMID_CURSE_FLAG_BIT;
}

extern "C" uint32_t isaac_game_update_slice_tailmid_curse_arg_zero(void) {
  return 0u;
}

extern "C" uint32_t isaac_game_update_slice_tailmid_curse_pos_vec_ptr(void) {
  return ISAAC_ROOM_TAILMID_CURSE_POS_VEC_PTR;
}

extern "C" uint32_t isaac_game_update_slice_tailmid_curse_effect_type(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_TAILMID_CURSE_EFFECT_TYPE);
}

extern "C" uint32_t isaac_game_update_slice_tailmid_curse_effect_variant(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_TAILMID_CURSE_EFFECT_VARIANT);
}

extern "C" int32_t isaac_game_update_slice_tailmid_801ee0_is_greed_mode(
    int32_t difficulty_269c8) {
  return (difficulty_269c8 == 2 || difficulty_269c8 == 3) ? 1 : 0;
}

extern "C" int32_t isaac_game_update_slice_tailmid_801ee0_boss_count(
    int32_t count_12c0, int32_t count_12c4) {
  return isaac_room_tailmid_801ee0_boss_count(count_12c0, count_12c4);
}

extern "C" int32_t isaac_game_update_slice_tailmid_801ee0_needs_timer_reset(
    int32_t post_timer_723c, int32_t boss_count) {
  return isaac_room_tailmid_801ee0_needs_timer_reset_host(post_timer_723c,
                                                          boss_count);
}

extern "C" int32_t isaac_game_update_slice_tailmid_801ee0_needs_spawn_wave(
    int32_t post_timer_723c, int32_t pre_timer_723c) {
  return isaac_room_tailmid_801ee0_needs_spawn_wave_host(post_timer_723c,
                                                         pre_timer_723c);
}

extern "C" int32_t isaac_game_update_slice_tailmid_801ee0_needs_special(
    int32_t stage0, int32_t room_type_8, uint32_t game_flags_1839c,
    int32_t player_count) {
  return isaac_room_tailmid_801ee0_needs_special_host(
      stage0, room_type_8, game_flags_1839c, player_count);
}

extern "C" int32_t isaac_game_update_slice_tailmid_801ee0_timer_set_13(void) {
  return ISAAC_ROOM_TAILMID_WAVE_TIMER_SET;
}

extern "C" uint32_t isaac_game_update_slice_tailmid_801ee0_desc_clear_bit40(
    uint32_t room_desc_flags_44) {
  return room_desc_flags_44 &
         ~static_cast<uint32_t>(ISAAC_ROOM_TAILMID_DESC_CLEAR_BIT40);
}

extern "C" uint32_t isaac_game_update_slice_tailmid_801ee0_game_flag_or_1000(
    uint32_t game_flags_1839c) {
  return game_flags_1839c | ISAAC_ROOM_TAILMID_SPECIAL_FLAG_BIT;
}

extern "C" int32_t isaac_game_update_slice_tailmid_800500_early_skip(
    uint32_t is_paused, int32_t gate_1b83c) {
  return isaac_room_tailmid_800500_early_skip(is_paused, gate_1b83c);
}

extern "C" int32_t isaac_game_update_slice_tailmid_800500_entity_list_empty(
    uint32_t count_1264) {
  /* PE 0x80076c cmp [Room+0x1264],0 / 0x800772 jbe: FULL-DWORD == 0. */
  return count_1264 == 0u ? 1 : 0;
}

extern "C" float isaac_game_update_slice_tailmid_800500_avg_intensity(
    float threat_sum, int32_t threat_count) {
  return isaac_room_tailmid_800500_avg_intensity(threat_sum, threat_count);
}

extern "C" int32_t isaac_game_update_slice_tailmid_800500_type_in_threat_band(
    int32_t type_28) {
  return isaac_room_tailmid_800500_type_in_threat_band(type_28);
}

extern "C" int32_t isaac_game_update_slice_tailmid_800500_outer_include_candidate(
    int32_t game_dim_26614, int32_t type_28) {
  return isaac_room_tailmid_800500_outer_include_candidate(game_dim_26614,
                                                            type_28);
}

extern "C" int32_t isaac_game_update_slice_tailmid_800500_entity_include(
    int32_t entity_nonzero, int32_t game_dim_26614, int32_t type_28,
    uint32_t flag_byte_173, int32_t short_c74, float float_39c,
    int32_t int_31c, uint32_t flags_168, uint32_t flags_16c) {
  return isaac_room_tailmid_800500_entity_include(
      entity_nonzero, game_dim_26614, type_28, flag_byte_173, short_c74,
      float_39c, int_31c, flags_168, flags_16c);
}

extern "C" float isaac_game_update_slice_tailmid_800500_approach(
    float curr, float target, float step) {
  return isaac_room_tailmid_800500_approach(curr, target, step);
}

extern "C" float isaac_game_update_slice_tailmid_800500_default_intensity(void) {
  return isaac_room_tailmid_800500_default_intensity();
}

extern "C" int32_t isaac_game_update_slice_tailmid_800500_timer_72fc_needs_host(
    int32_t timer_72fc) {
  return isaac_room_tailmid_800500_timer_72fc_needs_host(timer_72fc);
}

extern "C" int32_t isaac_game_update_slice_tailmid_800500_timer_72fc_inc(
    int32_t timer_72fc) {
  return isaac_room_tailmid_800500_timer_72fc_inc(timer_72fc);
}

extern "C" int32_t isaac_game_update_slice_tailmid_800500_timer_72fc_needs_sfx_play(
    int32_t post_inc) {
  return isaac_room_tailmid_800500_timer_72fc_needs_sfx_play(post_inc);
}

extern "C" int32_t isaac_game_update_slice_tailmid_800500_timer_72fc_needs_isplaying_host(
    int32_t post_inc) {
  return isaac_room_tailmid_800500_timer_72fc_needs_isplaying_host(post_inc);
}

extern "C" int32_t isaac_game_update_slice_tailmid_800500_timer_72fc_clear_neg1(
    void) {
  return ISAAC_ROOM_TAILMID_800500_TIMER_CLEAR;
}

/* ------------------------------------------------------------------ */
/* ABI v95 (record idx 40, opaqueRoomUpdateTailMid7230Spawn): spawn-loop
   FRAME pure laws. Frame = PE 0x008054ab..0x00805527 (countdown at
   Room+0x7230 + periodic spawn every 5 frames, signed): the pre gate,
   the PER-ITERATION BOUND RE-READ (0x00805515 re-reads Room+0x7230 AFTER
   the pos/genrand/spawn/RTTI host calls — the decrement is UNCONDITIONAL
   on the re-read, never the folded pre), the 0x00813460 pos math
   (spans/unit/max_span/centers — radius_arg = unit*max_span is THE SQRT
   ARGUMENT), the CRT sqrt platform-primitive gate (0x00435a50: host only
   when ORDERED 0.0 > arg, NaN/-0.0 stay inline), and the typed spawn-call
   arg prep (0x00428b20 push imms type 4 / variant 3 / 0xc7b640 /
   0xc5d838 / 0xc5d5dc / zeros). The spawn calls themselves stay
   typed-host in PE order: pos 813460 -> genrand 6eef60 -> spawn 428b20 ->
   RTTI af08b1. Laws wrap the room family's proven transcriptions
   (isaac_room_7230_*, package ABI 66) by reference where a room helper
   exists; the frame-only laws (gate/counter re-read/spans) are
   transcribed directly with PE addresses. uint32_t/int32_t/float params
   only — no uint8_t scalar params. */

extern "C" int32_t isaac_game_update_slice_tailmid_7230_gate_open(
    int32_t pre_timer_7230) {
  /* PE 0x8054b1 test ecx,ecx / 0x8054b3 jle (SIGNED) + 0x8054b7 mov esi,5
     / cdq / idiv / 0x8054bf test edx,edx / jne — spawn iff pre>0 &&
     pre%5==0. Wraps isaac_room_7230_needs_spawn_host (room ABI 13+). */
  return isaac_room_7230_needs_spawn_host(pre_timer_7230);
}

extern "C" int32_t isaac_game_update_slice_tailmid_7230_counter_next(
    int32_t re_read_counter) {
  /* Per-iteration bound re-read — PE 0x805515 mov ecx,[edi+0x7230] AFTER
     the four host calls; 0x80551e lea eax,[ecx-1]; 0x805521 store. The
     frame already passed the pre>0 gate so the dec is UNCONDITIONAL on the
     re-read: 0 -> -1 (0xffffffff), -1 -> -2 (i32 wrap). */
  return static_cast<int32_t>(static_cast<uint32_t>(re_read_counter) - 1u);
}

extern "C" float isaac_game_update_slice_tailmid_7230_span_x(float x0,
                                                             float x1) {
  /* PE 0x81346c movss xmm0,[edi+0x1c]; 0x813471 subss xmm0,[edi+0x14] —
     span_x = room+0x1c - room+0x14 (f32). */
  return x1 - x0;
}

extern "C" float isaac_game_update_slice_tailmid_7230_span_y(float y0,
                                                             float y1) {
  /* PE 0x81347c movss xmm0,[edi+0x20]; 0x813481 subss xmm0,[edi+0x18] —
     span_y = room+0x20 - room+0x18 (f32). */
  return y1 - y0;
}

extern "C" float isaac_game_update_slice_tailmid_7230_unit_float(
    uint32_t genrand) {
  /* PE 0x8134a2..0x8134cf inside 813460: MSVC u32->f32 (cvtdq2pd signed +
     addsd 2^32 when bit31) * [0xba9ff4] (2^-32). Same law as the room's
     isaac_room_7230_spawn_unit_float. */
  return isaac_room_7230_spawn_unit_float(genrand);
}

extern "C" float isaac_game_update_slice_tailmid_7230_max_span(float span_x,
                                                               float span_y) {
  /* PE 0x8134c4 movaps xmm0,span_y; 0x8134d7 maxss xmm0,span_x — maxss
     yields the SECOND operand on NaN, so span_x <= span_y or NaN returns
     span_y; only span_x STRICTLY greater wins. */
  return isaac_room_7230_spawn_max_span(span_x, span_y);
}

extern "C" float isaac_game_update_slice_tailmid_7230_center_x(float x0,
                                                               float span_x) {
  /* PE 0x8134c7 mulss span_x,[0xbaa2d0] (0.5f); 0x8134ec addss room+0x14
     (x0) — X centre = x0 + span_x*0.5. v47 axis fix. */
  return isaac_room_7230_spawn_center_x(x0, span_x);
}

extern "C" float isaac_game_update_slice_tailmid_7230_center_y(float y0,
                                                               float span_y) {
  /* PE 0x8134db mulss span_y,[0xbaa2d0]; 0x8134e3 addss room+0x18 (y0) —
     Y centre = y0 + span_y*0.5. v47 axis fix. */
  return isaac_room_7230_spawn_center_y(y0, span_y);
}

extern "C" float isaac_game_update_slice_tailmid_7230_sqrt_arg(float unit,
                                                               float max_span) {
  /* THE SQRT ARGUMENT — PE 0x8134e8 mulss xmm1(unit),xmm0(max_span): the
     radius fed to the search head 0x813520 and its CRT sqrt 0x435a50. */
  return isaac_room_7230_spawn_radius_arg(unit, max_span);
}

extern "C" int32_t isaac_game_update_slice_tailmid_7230_sqrt_host_needed(
    float sqrt_arg) {
  /* sqrt platform-primitive gate — PE 0x435a5d ucomisd 0.0,x / 0x435a61
     ja error: crt host runs iff ORDERED 0.0 > x (x < 0). NaN and -0.0 do
     NOT branch (ucomisd CF=ZF=1 unordered/equal; ja needs CF=0 && ZF=0),
     so the sqrt stays the inline platform primitive. */
  IsaacRoom7230FinishSqrt s{};
  isaac_room_7230_finish_sqrt(sqrt_arg, &s);
  return s.crt_host_needed;
}

extern "C" uint32_t isaac_game_update_slice_tailmid_7230_spawn_type(void) {
  /* PE 0x805508 push 4 before call 0x428b20. */
  return isaac_room_7230_spawn_type();
}

extern "C" uint32_t isaac_game_update_slice_tailmid_7230_spawn_variant(void) {
  /* PE 0x805506 push 3 before call 0x428b20. */
  return isaac_room_7230_spawn_variant();
}

extern "C" uint32_t isaac_game_update_slice_tailmid_7230_spawn_pos_vec_ptr(
    void) {
  /* PE 0x8054fa push 0xc7b640. */
  return isaac_room_7230_spawn_pos_vec_ptr();
}

extern "C" uint32_t isaac_game_update_slice_tailmid_7230_spawn_arg_ptr_a(
    void) {
  /* PE 0x8054e9 push 0xc5d838. */
  return isaac_room_7230_spawn_arg_ptr_a();
}

extern "C" uint32_t isaac_game_update_slice_tailmid_7230_spawn_arg_ptr_b(
    void) {
  /* PE 0x8054ee push 0xc5d5dc. */
  return isaac_room_7230_spawn_arg_ptr_b();
}

extern "C" uint32_t isaac_game_update_slice_tailmid_7230_spawn_push_zero(
    void) {
  /* PE 0x8054e7/0x8054f3/0x8054f6/0x8054f8 push 0 — the four zero imms of
     the 428b20 arg list (twice the pos-out slot argument edx=0 too). */
  return isaac_room_7230_spawn_pos_zero_arg();
}

extern "C" uint32_t isaac_game_update_slice_tailmid_7230_game_room_offset(
    void) {
  /* PE 0x8054d1 mov ecx,[eax+0x18300] — the 813460 receiver (Game room). */
  return isaac_room_7230_spawn_game_room_offset();
}

extern "C" uint32_t isaac_game_update_slice_tailmid_7230_pos_call_va(void) {
  /* Typed host call sequence head: 0x8054d7 call 0x813460 (pos fill). */
  return isaac_room_7230_host_va_pos();
}

extern "C" uint32_t isaac_game_update_slice_tailmid_7230_genrand_call_va(
    void) {
  /* 0x8054dc call 0x6eef60 — global RNG advance feeding the spawn dword */
  return isaac_room_7230_host_va_genrand();
}

extern "C" uint32_t isaac_game_update_slice_tailmid_7230_spawn_call_va(void) {
  /* 0x80550a call 0x428b20 — the typed spawn (type 4 / variant 3). */
  return isaac_room_7230_host_va_spawn();
}

extern "C" uint32_t isaac_game_update_slice_tailmid_7230_rtti_call_va(void) {
  /* 0x805510 call 0xaf08b1 — entity post-spawn RTTI touch. */
  return isaac_room_7230_host_va_rtti();
}

/* ------------------------------------------------------------------ */
/* ABI v95 (record idx 41, opaqueRoomUpdateTailEntity): B18 entity walk
   FRAME laws (PE 0x00805527..0x008055a7, census
   update-v95-r41-entity-walk/NOTES.md). The walk runs when the pre-clear
   Room+0x7894 low byte is nonzero; it walks Room+0x125c vec[0..count)
   with count RE-READ from Room+0x1264 EVERY iteration (0x805598 cmp esi,
   [edi+0x1264] / 0x80559e jb — never folded once), per entity deciding
   TYPE5 (0x6e17c0) / RTTI candidate (0xaf08b1, cast != 0 -> 0x6da530) /
   SKIP. The three entity update bodies STAY TYPED-HOST; these laws make
   the DECISION CF pure + in-module. Laws wrap the room family's proven
   transcriptions (isaac_room_b18_*, package ABI 29) by reference;
   uint32_t/int32_t params only — no uint8_t scalar params. */

extern "C" int32_t isaac_game_update_slice_b18_list_empty(
    uint32_t count_1264) {
  /* PE 0x805532 cmp dword [edi+0x1264],esi (esi=0) / 0x805538 jbe —
     FULL-DWORD count==0. 0x100 is NOT empty (the walk would run). */
  return isaac_room_b18_list_empty(count_1264);
}

extern "C" int32_t isaac_game_update_slice_b18_list_continue(
    uint32_t index, uint32_t count_1264) {
  /* PE 0x805597 inc esi / 0x805598 cmp esi,[edi+0x1264] / 0x80559e jb:
     (index+1) < count UNSIGNED. The bound is RE-READ from memory every
     iteration (a host body can shrink it mid-walk) — the law takes the
     count per call, never folded once. 0xffffffff keeps looping. */
  return isaac_room_b18_list_continue(index, count_1264);
}

extern "C" int32_t isaac_game_update_slice_b18_entity_is_type5(
    int32_t entity_type_28) {
  /* PE 0x80554c cmp edx,5 / 0x80554f jne — FULL-DWORD; 0x105 is NOT 5. */
  return isaac_room_b18_entity_is_type5(entity_type_28);
}

extern "C" int32_t isaac_game_update_slice_b18_entity_type1_mode_gate(
    int32_t timed_transition_cleanup_mode, int32_t entity_type_28) {
  /* PE 0x80555d cmp dword [eax+0x26614],2 / 0x805564 jl (SIGNED mode>=2)
     + 0x805566 cmp edx,1 / 0x805569 je (FULL-DWORD type==1). */
  return isaac_room_b18_entity_type1_mode_gate(
      timed_transition_cleanup_mode, entity_type_28);
}

extern "C" int32_t isaac_game_update_slice_b18_entity_type_in_range(
    int32_t entity_type_28) {
  /* PE 0x80556b lea eax,[edx-0xa] / 0x80556e cmp eax,0x3dd / 0x805573 ja:
     (type-10)u32 < 0x3de UNSIGNED (types [10,999]); 0x80000000 is NOT in
     range (a signed read would misfire). */
  return isaac_room_b18_entity_type_in_range(entity_type_28);
}

extern "C" int32_t isaac_game_update_slice_b18_entity_path_b_candidate(
    int32_t timed_transition_cleanup_mode, int32_t entity_type_28) {
  return isaac_room_b18_entity_path_b_candidate(
      timed_transition_cleanup_mode, entity_type_28);
}

extern "C" int32_t isaac_game_update_slice_b18_entity_action(
    int32_t timed_transition_cleanup_mode, int32_t entity_type_28) {
  /* PE 0x80554c..0x805573: SKIP(0) / TYPE5(1) / RTTI_CANDIDATE(2). */
  return isaac_room_b18_entity_action(timed_transition_cleanup_mode,
                                      entity_type_28);
}

extern "C" int32_t isaac_game_update_slice_b18_path_b_needs_host(
    uint32_t rtti_cast_result) {
  /* PE 0x80558c test eax,eax / 0x80558e je skip — FULL-DWORD cast != 0
     (0x100 must fire 0x6da530). */
  return isaac_room_b18_path_b_needs_host(rtti_cast_result);
}

extern "C" uint32_t isaac_game_update_slice_b18_rtti_src_ptr(void) {
  return ISAAC_GAME_UPDATE_B18_RTTI_SRC_PTR;
}

extern "C" uint32_t isaac_game_update_slice_b18_rtti_dst_ptr(void) {
  return ISAAC_GAME_UPDATE_B18_RTTI_DST_PTR;
}

extern "C" void isaac_game_update_slice_b18_walk_frame(
    uint32_t count, int32_t timed_transition_cleanup_mode,
    const uint32_t* entity_types, const uint32_t* cast_results,
    uint32_t max_entities, IsaacGameUpdateSliceB18WalkPlan* out) {
  if (out == nullptr) return;
  out->type5_calls = 0;
  out->rtti_casts = 0;
  out->pathb_calls = 0;
  out->skip_count = 0;
  out->walked = 0;
  out->pure_complete = 0;
  if (count == 0u) {
    /* Empty-list pure-complete: PE 0x805532 jbe -> flag clear, ZERO host
       calls (only the already-pure flag store follows). */
    out->pure_complete = 1;
    return;
  }
  if (count > max_entities) count = max_entities;
  if (entity_types == nullptr || cast_results == nullptr) return;
  /* Walk frame: PE body-first loop — 0x805540 body(i) then 0x805597 inc
     esi / 0x805598 cmp esi,[Room+0x1264] / 0x80559e jb. The bound is
     RE-DERIVED per iteration (list_continue is the post-body continue
     check); per entity apply the decision (entity_action); path-B folds
     the host-captured cast results (path_b_needs_host). */
  uint32_t i = 0;
  for (;;) {
    const int32_t action = isaac_game_update_slice_b18_entity_action(
        timed_transition_cleanup_mode, (int32_t)entity_types[i]);
    if (action == ISAAC_GAME_UPDATE_B18_ACTION_TYPE5) {
      out->type5_calls += 1;
    } else if (action == ISAAC_GAME_UPDATE_B18_ACTION_RTTI_CANDIDATE) {
      out->rtti_casts += 1;
      if (isaac_game_update_slice_b18_path_b_needs_host(
              cast_results[i]) != 0) {
        out->pathb_calls += 1;
      }
    } else {
      out->skip_count += 1;
    }
    out->walked += 1;
    if (isaac_game_update_slice_b18_list_continue(i, count) == 0) break;
    ++i;
  }
}

/* ------------------------------------------------------------------ */
/* ABI v95 (record idx 36, opaqueRoomUpdateTailWaterB16): pure DECISION
   laws of the FUN_00823540 chain (census 0x00823540). The chain runs in
   the B16 lava sub-block of FrameOpaque_802980 (callsite PE 0x805373),
   exactly when 0 < water_post && 0 < lava_pre (isaac_room_b16_needs_
   823540). FUN_00823540 = FUN_00823370 (per-cell vector math) +
   FUN_0074efd0 (lerp-run predicate) + FUN_007067c0 (spray/fx state
   update on Game+0x676b4..0x676fc). The 0x4288a0 challenge-store lookups
   (0x6f9400/0x6f95a0 masks — host-composed acc / host-captured clear,
   same contract as isaac_game_update_slice_746260_index_matches) and the
   Game+0x676d0/+0x676e8 apply stay TYPED-HOST; these laws publish the
   exact decision + computed content. Every scalar param is uint32_t/
   int32_t/float — no uint8_t scalar params (low-byte re-narrow in body). */

extern "C" int32_t isaac_game_update_slice_b16_gate_74efd0(
    uint32_t difficulty_269c8, uint32_t game_type_0, uint32_t game_subtype_4,
    uint32_t flags_2654c, uint32_t unlock_acc, uint32_t unlock_clear) {
  /* PE 0x74efd0..0x74f02e, arg = Game (callsite 0x8233c1 mov ecx,
     [0xc71678]):
       0x74efd9 cmp [Game+0x269c8],2 / je 0x74f02b (return 0)
       0x74efe4 cmp 3 / je 0x74f02b
       0x74efe9 mov edx,[arg] (game type); lea eax,[edx-1];
       0x74efee cmp eax,5 / ja skip-flags  -> type in [1..6] UNSIGNED
       0x74eff3 flags = [Game+0x2654c] & 0x10000; jne return 0
       0x74f005 subtype=[arg+4]; ==4 || ==5 required (je/jne)
       0x74f012 type==4 -> return 1
       0x74f017 type==3 -> call 0x748490; test al,2; je return 0
       0x74f027 mov al,1 / return 1
     0x748490 = (0x6f9400() | [arg+0xc] | [Game+0x26550]) & ~0x6f95a0()
     (host composes acc = low | Game[0xc] | Game[0x26550], clear =
     0x6f95a0()); `test al,2` checks bit 1 of the fold. */
  if (difficulty_269c8 == 2u || difficulty_269c8 == 3u) return 0;
  const uint32_t type = game_type_0;
  if (type - 1u <= 5u && (flags_2654c & 0x10000u) != 0u) return 0;
  const uint32_t subtype = game_subtype_4;
  if (subtype != 4u && subtype != 5u) return 0;
  if (type == 4u) return 1;
  if (type != 3u) return 0;
  return (unlock_acc & ~unlock_clear & 2u) != 0u ? 1 : 0;
}

extern "C" void isaac_game_update_slice_b16_water_wire(
    IsaacGameUpdateSliceB16WaterState* s) {
  if (s == nullptr) return;
  /* ---- FUN_00823370 (0x00823370..0x00823536): per-cell vector math ---- */
  float v[6];
  v[0] = s->src_1b10[0];
  v[1] = s->src_1b10[1];
  v[2] = s->src_1b10[2];
  v[3] = s->src_1b10[3];
  v[4] = s->src_1b10[4];
  v[5] = s->src_1b10[5];
  /* Lerp gate (0x8233af..0x8233e0): room type 7/8/0x1d -> lerp ALWAYS;
     else gate74efd0(Game) && Game[0x1830c]==1 -> lerp. */
  int lerp = 0;
  if (s->room_type_8 == 7u || s->room_type_8 == 8u || s->room_type_8 == 0x1du) {
    lerp = 1;
  } else if (isaac_game_update_slice_b16_gate_74efd0(
                 s->difficulty_269c8, s->game_type_0, s->game_subtype_4,
                 s->flags_2654c, s->unlock_acc, s->unlock_clear) != 0 &&
             s->game_1830c == 1u) {
    lerp = 1;
  }
  if (lerp) {
    /* 0x8233e6..0x82346f: v += (target - v) * 0.75; target =
       [1,1,1,0,0,1] (0xbaa454 = 1.0f, xmm2 = 0 for idx 3/4; factor
       0xbaa380 = 0.75f). subss/mulss/addss per component. */
    v[0] = v[0] + (1.0f - v[0]) * 0.75f;
    v[4] = v[4] + (0.0f - v[4]) * 0.75f;
    v[1] = v[1] + (1.0f - v[1]) * 0.75f;
    v[2] = v[2] + (1.0f - v[2]) * 0.75f;
    v[5] = v[5] + (1.0f - v[5]) * 0.75f;
    v[3] = v[3] + (0.0f - v[3]) * 0.75f;
  }
  /* 0x823477..0x823490: (grid_flags >> 9) & 1 -> v[4] += 0.03
     (0xbaa0a0). */
  if (((s->grid_flags_44 >> 9) & 1u) != 0u) v[4] += 0.03f;
  /* 0x823495..0x82352c: Room+0x1d18 == 0x20 (FULL DWORD) && (grid_flags
     >> 5) & 1 -> lava displacement:
       0x8234ae mov ecx,[Room+0x10] / 0x8234b1 mov eax,[Room+0xc];
       0x8234b4 sub ecx,2 / 0x8234bc sub eax,2 / 0x8234bf imul ecx,eax
       (32-bit wrap); 0x8234b7 movd xmm2,[Room+4+0x54];
       0x8234c2 cvtdq2ps (int32->float); 0x8234cc divss (cell/denom);
       0x8234d4 mulss lava (0x7740). v[0]-=vel; v[1]+=vel*0.4
       (0xbaa280); v[2]+=vel*0.4; v[3]-=vel*0.45 (0xbaa2b8);
       v[5]+=vel*0.2 (0xbaa198). */
  if (s->room_1d18 == 0x20u && ((s->grid_flags_44 >> 5) & 1u) != 0u) {
    const int32_t w = (int32_t)(s->grid_w_c - 2u);
    const int32_t h = (int32_t)(s->grid_h_10 - 2u);
    const int32_t cells = (int32_t)((uint32_t)w * (uint32_t)h); /* imul */
    const float denom = (float)cells;                  /* cvtdq2ps */
    const float cell = (float)(int32_t)s->cell_dword_54; /* cvtdq2ps */
    const float vel = (cell / denom) * s->lava_pre;    /* divss+mulss */
    v[0] = v[0] - vel;
    v[1] = v[1] + vel * 0.4f;
    v[2] = v[2] + vel * 0.4f;
    v[3] = v[3] - vel * 0.45f;
    v[5] = v[5] + vel * 0.2f;
  }
  /* ---- FUN_007067c0 (0x007067c0..0x007068be): spray/fx apply ---- */
  /* 0x7067d4..0x7067e3: Game+0x676d0 = v[0..3] (16B), Game+0x676e0 =
     v[4..5] (8B). */
  for (int i = 0; i < 6; ++i) s->step[i] = v[i];
  /* 0x823557..0x82356d (823540 wrapper): flag = ([Game+0x183a0] byte == 0
     && [Game+0x269e9] byte == 0) ? 1 : 0 (LOW-BYTE tests). */
  const int flag =
      (s->game_byte_183a0 & 0xffu) == 0u && (s->game_byte_269e9 & 0xffu) == 0u
          ? 1
          : 0;
  if (flag == 0) {
    /* 0x7068c1..0x7068ca: Game+0x676b8 = Game+0x676d0 (16B snap,
       cur[0..3]); byte 676b4 = 0. cur[4..5] unchanged. */
    for (int i = 0; i < 4; ++i) s->cur_snap[i] = v[i];
    s->gate = 0;
  } else {
    /* 0x7067f1..0x7068b5: al = 1; goal[i] = |step[i]-cur[i]| * 0.015
       (subss, andps 0x7fffffff abs, mulss 0xbaa078 = 0.015f); byte
       676b4 = 1. cur unchanged. */
    for (int i = 0; i < 6; ++i) {
      const float d = v[i] - s->fx_cur[i];
      const uint32_t abs_bits = __builtin_bit_cast(uint32_t, d) & 0x7fffffffu;
      s->goal[i] = __builtin_bit_cast(float, abs_bits) * 0.015f;
    }
    s->gate = 1;
  }
}

/* ABI v95 (record idx 38, opaqueRoomUpdateTailMid706cExpire): pure
   DECISION laws of the 706c expire arm, census 0x008158a0. The countdown
   gate (PE 0x8053e2..0x80540a: mov eax,[Room+0x706c]; test eax,eax; jle
   skip; dec; mov [Room+0x706c],eax; test eax,eax; jg skip; mov [Room+
   0x706c],0xffffffff; mov ecx,Room; call 0x8158a0) fires the expire body
   exactly when pre>0 && (pre-1)<1. The body FUN_008158a0 (Room::
   ShopRestockPartial, this=room) stays TYPED-HOST (stateful bucket walk,
   item-def vcall, two 0x428b20 entity creates, [RoomData+0x5c] hash
   state); these laws publish the expire decision + the body's typed
   arg/state contract: inner shop gate [Room+8]==2 (0x8158ae), items-
   remaining gate [Room+0x7080]!=0 (0x8158b7), per-item byte counter
   [item+roomdata+0xa4] 0xff-capped inc (0x815915..0x815922), bucket cell
   (idx>>1)&(count-1) + parity (0x8158e8..0x81590b), item-def vcall gate
   item<=0x1bf (0x81599c), FNV-ish hash step (0x8159cb..0x8159ea), idiv
   pos floats (0x815969..0x815997), create imms type 0x96 variant 5 /
   type 0x3e8 variant 0xf + [entity+0x32c]=item (0x8159fa..0x815a31).
   Every scalar param is uint32_t/int32_t/float — no uint8_t scalar
   params (low-byte re-narrow in body). */

extern "C" int32_t isaac_game_update_slice_tailmid_706c_needs_expire_host(
    int32_t pre_timer_706c) {
  return isaac_room_706c_needs_expire_host(pre_timer_706c);
}

extern "C" int32_t isaac_game_update_slice_tailmid_706c_countdown_next(
    int32_t pre_timer_706c) {
  /* PE 0x8053e2..0x8053f9: test/jle (pre<=0 unchanged); dec; store;
     test/jg (post>0 -> post); else store -1 (0xffffffff). */
  if (!(pre_timer_706c > 0)) return pre_timer_706c;
  const int32_t post = pre_timer_706c - 1;
  return post < 1 ? -1 : post;
}

extern "C" int32_t isaac_game_update_slice_tailmid_706c_expire_room_is_shop(
    uint32_t room_type_8) {
  /* PE 0x8158ae cmp [esi+8],2 / 0x8158b1 jne 0x815aba (assert tail). */
  return room_type_8 == 2u ? 1 : 0;
}

extern "C" int32_t isaac_game_update_slice_tailmid_706c_expire_has_items(
    uint32_t count_7080) {
  /* PE 0x8158b7 cmp [esi+0x7080],0 / 0x8158da je 0x815a7f. FULL-DWORD. */
  return count_7080 != 0u ? 1 : 0;
}

extern "C" int32_t isaac_game_update_slice_tailmid_706c_expire_item_counter_byte_inc(
    uint32_t counter_byte) {
  /* PE 0x815915..0x815922: al=[item+roomdata+0xa4]; cmp al,0xff; jae
     skip; inc al; store. LOW-BYTE (re-narrow), 0xff stays 0xff. */
  const uint32_t b = counter_byte & 0xffu;
  return b >= 0xffu ? (int32_t)b : (int32_t)(b + 1u);
}

extern "C" uint32_t isaac_game_update_slice_tailmid_706c_expire_bucket_cell(
    uint32_t index_707c, uint32_t count_7078) {
  /* PE 0x8158e8..0x815904: ecx=idx; eax=count; dec eax; shr ecx,1; and
     ecx,eax -> (idx>>1) & (count-1). 32-bit wrap: count==0 -> mask
     0xffffffff. */
  return (index_707c >> 1) & (count_7078 - 1u);
}

extern "C" uint32_t isaac_game_update_slice_tailmid_706c_expire_bucket_parity(
    uint32_t index_707c) {
  /* PE 0x8158ee and edx,1 — picks [slot] vs [slot+4] (parity lane). */
  return index_707c & 1u;
}

extern "C" int32_t isaac_game_update_slice_tailmid_706c_expire_item_def_vcall_needed(
    uint32_t item_id) {
  /* PE 0x81599c cmp ebx,0x1bf / 0x8159a2 ja skip — UNSIGNED (item id). */
  return item_id <= 0x1bfu ? 1 : 0;
}

extern "C" uint32_t isaac_game_update_slice_tailmid_706c_expire_hash_step(
    uint32_t hash, uint32_t shift_c1, uint32_t shift_c2, uint32_t shift_c3) {
  /* PE 0x8159cb..0x8159ea: t=(h>>c1)^h; u=(t<<c2)^t; v=(u>>c3)^u, all
     32-bit wrap. Shift counts are x86 cl (masked &31); runtime values
     read from .rdata 0xb1f54c / 0xb1f550 / 0xb1f554 (host-time reads;
     the final tail application uses c3 = last item id, ebx-reuse). */
  const uint32_t t = (hash >> (shift_c1 & 31u)) ^ hash;
  const uint32_t u = (t << (shift_c2 & 31u)) ^ t;
  return (u >> (shift_c3 & 31u)) ^ u;
}

extern "C" float isaac_game_update_slice_tailmid_706c_expire_pos_y(
    int32_t rem_idiv, uint32_t c4_bits) {
  /* PE 0x815969..0x815974: movd xmm0,edx(rem); cvtdq2ps; mulss xmm0,
     [0xbaa904](c4); addss xmm0,[0xbaa904]. Each op rounds once. */
  const float c4 = __builtin_bit_cast(float, c4_bits);
  const float p = (float)rem_idiv * c4;
  return p + c4;
}

extern "C" float isaac_game_update_slice_tailmid_706c_expire_pos_x(
    int32_t quot_idiv, uint32_t c4_bits, uint32_t c5_bits) {
  /* PE 0x815988..0x815997: movd xmm0,eax(quot); cvtdq2ps; mulss xmm0,
     [0xbaa904](c4); addss xmm0,[0xbaaa00](c5). */
  const float c4 = __builtin_bit_cast(float, c4_bits);
  const float c5 = __builtin_bit_cast(float, c5_bits);
  const float p = (float)quot_idiv * c4;
  return p + c5;
}

extern "C" uint32_t isaac_game_update_slice_tailmid_706c_expire_drop_type(
    void) {
  return 0x96u; /* PE 0x8159fa push 0x96 */
}
extern "C" uint32_t isaac_game_update_slice_tailmid_706c_expire_drop_variant(
    void) {
  return 5u; /* PE 0x8159ff push 5 */
}
extern "C" uint32_t isaac_game_update_slice_tailmid_706c_expire_extra_type(
    void) {
  return 0x3e8u; /* PE 0x815a27 push 0x3e8 */
}
extern "C" uint32_t isaac_game_update_slice_tailmid_706c_expire_extra_variant(
    void) {
  return 0xfu; /* PE 0x815a25 push 0xf */
}
extern "C" uint32_t isaac_game_update_slice_tailmid_706c_expire_entity_item_off(
    void) {
  return 0x32cu; /* PE 0x815a06 mov [eax+0x32c],ebx (item id store) */
}
extern "C" uint32_t isaac_game_update_slice_tailmid_706c_expire_host_va(void) {
  return 0x008158a0u; /* typed host: Room::ShopRestockPartial(this=room) */
}

/* ============================================================================
 * ABI v95 (record idx 20 depth): Game::SaveState 0x006f9000 pure decision
 * layers. Census: section-notes/update-v95-savestate-6f9000/NOTES.md.
 *
 * Pure side owns the serialization-order/header laws (version word 0x35, the
 * 0x35 flag bytes, the pre/post header store counts, the 15-dword run) and
 * the per-section write gates (badges alias/grow/copy-bytes, ptr-vector
 * count + zero-skip, the signed setg byte, the +0x88 cmovle clamp, the
 * section/dword loop constants). The IO/heap serializers stay typed-host:
 * 0x9c79a0, 0x9e9320/0x9e9430 (strings), 0x424540/0xaef15c, 0x7099a0 (grow),
 * 0xaf08bd (memcpy), 0x708b70, 0x7367d0, 0x422f80, 0x7310e0, 0x7efa50,
 * 0x747e10, 0x9bd150, 0x6f8a40 x7, 0x9e54d0, plus the 2 virtuals (vtbl+4 ->
 * GameState+0x1fddc, vtbl+0x70). Every scalar param is uint32_t/int32_t —
 * no uint8_t scalar params.
 * ========================================================================== */
static IsaacGameUpdateSliceSaveStatePlan scratch_savestate_plan = {};

/* PE 0x6f90c6 mov eax,0x35 / 0x6f90cb mov word [edi+0xc],ax. */
extern "C" int32_t isaac_game_update_slice_savestate_flags_count(void) {
  return ISAAC_GAME_UPDATE_SAVESTATE_FLAGS_COUNT;
}
extern "C" int32_t isaac_game_update_slice_savestate_version_word(void) {
  return ISAAC_GAME_UPDATE_SAVESTATE_VERSION_WORD;
}
/* PE 0x6f90d0..0x6f9118: per-index flag byte. idx >= 0x35 is past the loop
   bound (0x6f9114 cmp bx, word [edi+0xc] unsigned jb) -> 0 (PE never stores
   it). For legal idx the word index idx>>6 is 0, so word_lo/word_hi are the
   low/high dwords of the FIRST 64-bit badge word (@game+0x26548/+0x2654c);
   the law keeps the bit<0x20 / bit>=0x20 split general (bts/cmp 0x20/cmovae
   @0x6f90dd..0x6f90e3, cmp 0x40 @0x6f90e8). */
extern "C" int32_t isaac_game_update_slice_savestate_flags_byte(
    uint32_t idx, uint32_t word_lo, uint32_t word_hi) {
  if (idx >= (uint32_t)ISAAC_GAME_UPDATE_SAVESTATE_FLAGS_COUNT) return 0;
  const uint32_t bit = idx & 0x3fu;
  const uint32_t src = bit < 0x20u ? word_lo : word_hi;
  return (int32_t)((src >> bit) & 1u);
}
extern "C" int32_t isaac_game_update_slice_savestate_pre_header_stores(void) {
  return ISAAC_GAME_UPDATE_SAVESTATE_PRE_HEADER_STORES;
}
extern "C" int32_t isaac_game_update_slice_savestate_post_header_stores(void) {
  return ISAAC_GAME_UPDATE_SAVESTATE_POST_HEADER_STORES;
}
extern "C" int32_t isaac_game_update_slice_savestate_dword_run_stores(void) {
  return ISAAC_GAME_UPDATE_SAVESTATE_DWORD_RUN_STORES;
}
/* 0x6f91dd cmp ecx,eax / je 0x6f922e: &state->badges == &game->badges ->
   the whole vector-copy section is SKIPPED (vector self-assign guard).
   Address equality is a pure u32 compare on the two field addresses. */
extern "C" int32_t isaac_game_update_slice_savestate_badges_alias(
    uint32_t dst_field_addr, uint32_t src_field_addr) {
  return (dst_field_addr == src_field_addr) ? 1 : 0;
}
/* 0x6f91e6 sub ebx,eax / 0x6f91ef sar eax,3: src element count, SIGNED. */
extern "C" int32_t isaac_game_update_slice_savestate_badges_src_count(
    uint32_t src_begin, uint32_t src_end) {
  return ((int32_t)(src_end - src_begin)) >> 3;
}
/* 0x6f91f8 sub eax,edx / 0x6f91fd sar eax,3: dst capacity count, SIGNED. */
extern "C" int32_t isaac_game_update_slice_savestate_badges_dst_count(
    uint32_t dst_begin, uint32_t dst_end) {
  return ((int32_t)(dst_end - dst_begin)) >> 3;
}
/* 0x6f9200 cmp src_count,dst_count / 0x6f9203 jbe 0x6f9216: grow iff
   (u32)src_count > (u32)dst_count — jbe is UNSIGNED; a negative signed
   src_count (wrapped span) MUST still grow. */
extern "C" int32_t isaac_game_update_slice_savestate_badges_grow(
    uint32_t src_begin, uint32_t src_end, uint32_t dst_begin,
    uint32_t dst_end) {
  const int32_t sc = ((int32_t)(src_end - src_begin)) >> 3;
  const int32_t dc = ((int32_t)(dst_end - dst_begin)) >> 3;
  return ((uint32_t)sc > (uint32_t)dc) ? 1 : 0;
}
/* 0x6f9216..0x6f921b: memcpy(dst_begin, src_begin, ebx=end-begin) — the raw
   byte span (8-byte elements), ALSO the new-end increment @0x6f9228. */
extern "C" int32_t isaac_game_update_slice_savestate_badges_copy_bytes(
    uint32_t src_begin, uint32_t src_end) {
  return (int32_t)(src_end - src_begin);
}
/* 0x6f929a sar eax,2: ptr-vector element count, SIGNED; the bound is
   RE-READ per iteration (0x6f92d6 re-loads [game+0x6775c]/[game+0x67758]). */
extern "C" int32_t isaac_game_update_slice_savestate_ptrvec_count(
    uint32_t begin, uint32_t end) {
  return ((int32_t)(end - begin)) >> 2;
}
/* 0x6f92b6 test eax,eax / je 0x6f92e9: skip iff count == 0. */
extern "C" int32_t isaac_game_update_slice_savestate_ptrvec_skip(
    uint32_t begin, uint32_t end) {
  return (((int32_t)(end - begin)) >> 2) == 0 ? 1 : 0;
}
/* 0x6f9308 cmp dword [esi+0x67788],0 / 0x6f930f setg al: the store to
   GameState+0x1e7b0 uses SGTE — SIGNED greater-than-zero; 0xffffffff and
   0x80000000 set 0. */
extern "C" int32_t isaac_game_update_slice_savestate_setg_67788(
    int32_t game_67788) {
  return game_67788 > 0 ? 1 : 0;
}
/* 0x6f9398..0x6f93a3: ecx = [*0xc71678+0x265ec]; test ecx,ecx; lea eax,
   [ecx-1]; cmovle eax,ecx — flags from TEST only: cmovle (signed) iff
   ecx <= 0 -> out = ecx, else ecx-1 (32-bit wrap, e.g. 0x80000000 stays
   0x80000000). */
extern "C" int32_t isaac_game_update_slice_savestate_clamp_265ec(
    int32_t game_265ec) {
  return game_265ec <= 0 ? game_265ec : game_265ec - 1;
}
extern "C" int32_t isaac_game_update_slice_savestate_section_loop_count(void) {
  return ISAAC_GAME_UPDATE_SAVESTATE_SECTION_LOOP;
}
extern "C" int32_t isaac_game_update_slice_savestate_section_stride(void) {
  return ISAAC_GAME_UPDATE_SAVESTATE_SECTION_STRIDE;
}
extern "C" int32_t isaac_game_update_slice_savestate_dword_loop_count(void) {
  return ISAAC_GAME_UPDATE_SAVESTATE_DWORD_LOOP;
}
/* ABI v99 (record idx 12 depth): the 0xe-dword blob source address.
   PE 0x6f9357 mov edx,[0xc7169c] / 0x6f935d add edx,0x21994; the committed
   LIVE-seam lane rewind_705ee0_payload_blob_addr captures *[0xc7169c]+0x2d0
   (the S8 copy source), so the SaveState blob source = blob_addr + 0x216c4
   (0x21994 - 0x2d0), u32 wrap. Values stay host (disjoint capture). */
extern "C" uint32_t isaac_game_update_slice_savestate_blob14_source_addr(
    uint32_t payload_blob_addr) {
  return payload_blob_addr + ISAAC_GAME_UPDATE_SAVESTATE_BLOB14_SRC_DELTA;
}
/* ABI v99 (record idx 12 depth): the ONE SaveState store value decidable
   from the committed lanes — [state+0x78] = [game+0x264f8] (PE 0x6f9195
   mov eax,[esi+0x264f8] / 0x6f919b mov [edi+0x78],eax). The source is the
   committed lane rewind_705ee0_game_frame_264f8; the destination =
   save_state_arg_prep(game_base, new_slot_index) + 0x78 (newslot+0x7c),
   consumed BY REFERENCE. u32 wrap. */
extern "C" uint32_t isaac_game_update_slice_savestate_frame_dword_dst(
    uint32_t game_base, int32_t new_slot_index) {
  return isaac_game_update_slice_705ee0_save_state_arg_prep(game_base,
                                                            new_slot_index) +
         ISAAC_GAME_UPDATE_SAVESTATE_FRAME_DWORD_DST_OFF;
}
/* Composed plan: serialization order + per-section write gates in one read
   (scratch carrier, sfx_stop_fold_plan precedent). host_calls = the 17
   direct rel32 sites (19 total sites = 17 E8 + 2 vtbl; the v95 "18" was a
   head-chunk miscount — see update-v99-record12-savestate); host_virtual =
   the 2 vtbl calls. */
extern "C" int32_t isaac_game_update_slice_savestate_plan(
    uint32_t src_begin, uint32_t src_end, uint32_t dst_begin,
    uint32_t dst_end, uint32_t dst_field_addr, uint32_t src_field_addr,
    uint32_t px_begin, uint32_t px_end, int32_t game_67788,
    int32_t game_265ec, IsaacGameUpdateSliceSaveStatePlan* out) {
  if (out == nullptr) return 0;
  out->applied = 1;
  out->version_word = ISAAC_GAME_UPDATE_SAVESTATE_VERSION_WORD;
  out->flags_count = ISAAC_GAME_UPDATE_SAVESTATE_FLAGS_COUNT;
  out->pre_header_stores = ISAAC_GAME_UPDATE_SAVESTATE_PRE_HEADER_STORES;
  out->post_header_stores = ISAAC_GAME_UPDATE_SAVESTATE_POST_HEADER_STORES;
  out->dword_run_stores = ISAAC_GAME_UPDATE_SAVESTATE_DWORD_RUN_STORES;
  out->badges_alias =
      isaac_game_update_slice_savestate_badges_alias(dst_field_addr,
                                                     src_field_addr);
  out->badges_src_count = isaac_game_update_slice_savestate_badges_src_count(
      src_begin, src_end);
  out->badges_dst_count = isaac_game_update_slice_savestate_badges_dst_count(
      dst_begin, dst_end);
  out->badges_grow = isaac_game_update_slice_savestate_badges_grow(
      src_begin, src_end, dst_begin, dst_end);
  out->badges_copy_bytes =
      isaac_game_update_slice_savestate_badges_copy_bytes(src_begin, src_end);
  out->ptrvec_count =
      isaac_game_update_slice_savestate_ptrvec_count(px_begin, px_end);
  out->ptrvec_skip =
      isaac_game_update_slice_savestate_ptrvec_skip(px_begin, px_end);
  out->setg_1e7b0 = isaac_game_update_slice_savestate_setg_67788(game_67788);
  out->clamp_88 = isaac_game_update_slice_savestate_clamp_265ec(game_265ec);
  out->section_loop = ISAAC_GAME_UPDATE_SAVESTATE_SECTION_LOOP;
  out->dword_loop = ISAAC_GAME_UPDATE_SAVESTATE_DWORD_LOOP;
  out->host_calls = 17;
  out->host_virtual = 2;
  return 1;
}
extern "C" uintptr_t isaac_game_update_slice_savestate_plan_address(void) {
  return (uintptr_t)&scratch_savestate_plan;
}
extern "C" uint32_t isaac_game_update_slice_savestate_plan_words(void) {
  return (uint32_t)ISAAC_GAME_UPDATE_SAVESTATE_PLAN_WORDS;
}

static_assert(sizeof(IsaacGameUpdateSliceSaveStatePlan) ==
                  4 * ISAAC_GAME_UPDATE_SAVESTATE_PLAN_WORDS,
              "IsaacGameUpdateSliceSaveStatePlan ABI changed");

/* ==================================================================== */
/* ABI v95 (record idx 31, Room::TriggerClear 0x008068f0): the non-greed
   fragment CALL-ARG / decision laws. Bodies stay TYPED-HOST — the
   exports pin what the host leaves are invoked with and when. Zero
   layout (no events/runtime/state fields; ABI stays 95). Every scalar
   param is uint32_t/int32_t (Wasm i32 args never narrow; low-byte
   re-narrow happens in the body). Census: update-v95-8068f0-trigger-
   clear/NOTES.md + disasm-8068f0-full.txt. */

/* stats (0x9e5960) CALL-ARG pack (PE 0x806918..0x806935). clear_count is
   the pre-truncation word (PE movzx at 0x806927); flags44 is the
   post-entry RoomDescriptor flags (entry only ORs bit 0). */
extern "C" void isaac_game_update_slice_trigger_clear_stats_args(
    uint32_t room_type, uint32_t stage_data, uint32_t clear_count,
    uint32_t flags44, IsaacGameUpdateSliceTriggerClearStatsArgs* out) {
  if (out == nullptr) {
    return;
  }
  out->room_type = room_type;
  out->stage_data = stage_data;
  out->clear_count_word = (uint16_t)clear_count; /* PE movzx word */
  out->flag_bit10 = (flags44 >> 10) & 1u;        /* PE shr 0xa / and al,1 */
}

/* music/audio play args (PE 0x8069c9 push 0; 0x8069cb push 1; call
   0x7f7a40 — cdecl (arg1=1, arg2=0), this=room). 0x7f7a40 fires only in
   non-greed (mode != 2 && mode != 3); 0x7f83b0 fires ALWAYS with the
   same (1, 0) pair. */
extern "C" void isaac_game_update_slice_trigger_clear_music_args(
    uint32_t difficulty_269c8, IsaacGameUpdateSliceTriggerClearMusicArgs* out) {
  if (out == nullptr) {
    return;
  }
  const uint32_t greed =
      (difficulty_269c8 == 2u || difficulty_269c8 == 3u) ? 1u : 0u;
  out->fire_7f7a40 = (greed == 0u) ? 1u : 0u;
  out->fire_7f83b0 = 1u;
  out->arg1 = 1u;
  out->arg2 = 0u;
}

/* playSound==0 SFX path (PE 0x8069df cmp byte [ebp+8],0 / jne skip;
   0x8069ee mov [ebp+8],0x24; 0x806a05/0x806a2a float consts). The id
   slot seeded 0x24 feeds the pre-play 0x956780 (host) then Play 0x92dc30
   with the const args (volume 1.0f, frame_delay 2, loop 0, pitch 1.0f,
   pan 0) and receiver [0xc7169c]+0x2a324. */
extern "C" void isaac_game_update_slice_trigger_clear_sfx_plan(
    uint32_t play_sound_byte, IsaacGameUpdateSliceTriggerClearSfxPlan* out) {
  if (out == nullptr) {
    return;
  }
  out->armed = ((play_sound_byte & 0xffu) == 0u) ? 1u : 0u;
  out->seed_id = 0x24u;
  out->volume_bits = 0x3f800000u;
  out->frame_delay = 2u;
  out->loop = 0u;
  out->pitch_bits = 0x3f800000u;
  out->pan = 0u;
  out->receiver_off = 0x2a324u;
}

/* deep challenge/music path (PE 0x806a65..0x806b59). head-clear =
   byte[Game+0x1bb84]==0 && probe 0x9e9b50 al==0 && probe 0x9595e0 al==0
   && byte[Game+0x26588]==0 (the je @0x806a99 to 0x806aad). Otherwise the
   vec non-empty gate (0x806a9b mov/cmp/je 0x806b63). Then 0x806aad:
   count[Manager+0x334]>0 (jbe), [Game+0x1839c]&0x10000==0 (jne),
   [ret+8]==[Game+0x18314] (0x740bc0 match, host-captured), [Game]==1,
   [Game+4] not 4/5, [Game+0x264f8]<=0x708 (jg, SIGNED). Fire =
   Game+0x1839c |= 0x10000 ; SFX seed 0x5a ; Room+0x72fc = 0. */
extern "C" void isaac_game_update_slice_trigger_clear_deep_music_gate(
    uint32_t byte_1bb84, uint32_t probe_9e9b50, uint32_t probe_9595e0,
    uint32_t byte_26588, uint32_t vec_begin_4b3d8, uint32_t vec_end_4b3dc,
    uint32_t count_334, uint32_t flag_1839c, uint32_t room_match,
    uint32_t game_0, uint32_t game_4, uint32_t frame_264f8,
    IsaacGameUpdateSliceTriggerClearDeepMusic* out) {
  if (out == nullptr) {
    return;
  }
  const uint32_t head_clear =
      ((byte_1bb84 & 0xffu) == 0u && (probe_9e9b50 & 0xffu) == 0u &&
       (probe_9595e0 & 0xffu) == 0u && (byte_26588 & 0xffu) == 0u)
          ? 1u
          : 0u;
  const uint32_t vec_nonempty =
      (vec_begin_4b3d8 != vec_end_4b3dc) ? 1u : 0u;
  const uint32_t reach_aad =
      (head_clear != 0u || vec_nonempty != 0u) ? 1u : 0u;
  const int32_t frame_signed = (int32_t)frame_264f8;
  const uint32_t gate_334 = (count_334 != 0u) ? 1u : 0u;
  const uint32_t gate_1839c =
      ((flag_1839c & 0x10000u) == 0u) ? 1u : 0u;
  const uint32_t gate_room = (room_match != 0u) ? 1u : 0u;
  const uint32_t gate_game0 = (game_0 == 1u) ? 1u : 0u;
  const uint32_t gate_game4 =
      (game_4 != 4u && game_4 != 5u) ? 1u : 0u;
  const uint32_t gate_frame = (frame_signed <= 0x708) ? 1u : 0u;
  const uint32_t fire =
      (reach_aad != 0u && gate_334 != 0u && gate_1839c != 0u &&
       gate_room != 0u && gate_game0 != 0u && gate_game4 != 0u &&
       gate_frame != 0u)
          ? 1u
          : 0u;
  out->fire = fire;
  out->flag_or_10000 = (fire != 0u) ? 0x10000u : 0u;
  out->sfx_seed_id = (fire != 0u) ? 0x5au : 0u;
  out->room72fc_zero = fire;
}

/* Awards bit7 walk (PE 0x806b63..0x806b98). walk_active = bit7 clear
   (0x806b69 shr 7 / test al,1 / jne 0x806b9e). fire_9bb840: skip iff
   greed (mode 2/3) && roomType==1 (0x806b80 cmp [ebx+8],1 / je
   0x806b91); receiver lea ecx,[esi+0x1baa8]. fire_7fb250 ALWAYS when
   walk active (0x806b91 mov ecx,ebx room). */
extern "C" void isaac_game_update_slice_trigger_clear_awards_walk(
    uint32_t flags44, uint32_t difficulty_269c8, uint32_t room_type_8,
    IsaacGameUpdateSliceTriggerClearAwardsWalk* out) {
  if (out == nullptr) {
    return;
  }
  const uint32_t walk_active =
      (((flags44 >> 7) & 1u) == 0u) ? 1u : 0u;
  const uint32_t greed =
      (difficulty_269c8 == 2u || difficulty_269c8 == 3u) ? 1u : 0u;
  const uint32_t greed_room1 =
      (greed != 0u && room_type_8 == 1u) ? 1u : 0u;
  out->walk_active = walk_active;
  out->fire_9bb840 =
      (walk_active != 0u && greed_room1 == 0u) ? 1u : 0u;
  out->fire_7fb250 = walk_active;
  out->receiver_9bb840_off = 0x1baa8u;
}

/* Rewind tail: push -1 @0x806c0a -> 0x705ee0(0xffffffff) ALWAYS. */
extern "C" void isaac_game_update_slice_trigger_clear_rewind_tail_arg(
    IsaacGameUpdateSliceTriggerClearRewindTail* out) {
  if (out == nullptr) {
    return;
  }
  out->fire = 1u;
  out->arg = 0xffffffffu;
}

/* Awards non-greed music suite (PE 0x806a26..0x806a64): the ordered
   three-call suite. Gate = difficulty not 2/3 (FULL-DWORD 0x806a32
   cmp/je 0x806b63 + 0x806a3b cmp/je — WIDE 0x102 must NOT open). When
   open the machine runs, in order, thiscall Room:
     0x7f9960(0, 0)   (push 0 @0x806a44, push 0 @0x806a46)
     0x820170(1, 0, 0)(push 0 @0x806a4f, push 0 @0x806a51, push 1
                       @0x806a53 — cdecl order (1, 0, 0))
     0x8204b0(0)      (push 0 @0x806a5c)
   All three bodies stay TYPED-HOST (music leaves); this pack pins gate
   + call order + args so the host consumer re-issues them verbatim. */
extern "C" void isaac_game_update_slice_trigger_clear_awards_suite(
    uint32_t difficulty_269c8, IsaacGameUpdateSliceTriggerClearAwardsSuite* out) {
  if (out == nullptr) {
    return;
  }
  const uint32_t greed =
      (difficulty_269c8 == 2u || difficulty_269c8 == 3u) ? 1u : 0u;
  const uint32_t fire = (greed == 0u) ? 1u : 0u;
  out->fire = fire;
  out->call1_va = 0x007f9960u;
  out->call1_arg1 = 0u;
  out->call1_arg2 = 0u;
  out->call2_va = 0x00820170u;
  out->call2_arg1 = 1u;
  out->call2_arg2 = 0u;
  out->call2_arg3 = 0u;
  out->call3_va = 0x008204b0u;
  out->call3_arg1 = 0u;
  out->receiver_is_room = 1u;
}

static_assert(sizeof(IsaacGameUpdateSliceTriggerClearStatsArgs) == 16,
              "TriggerClearStatsArgs ABI changed");
static_assert(sizeof(IsaacGameUpdateSliceTriggerClearMusicArgs) == 16,
              "TriggerClearMusicArgs ABI changed");
static_assert(sizeof(IsaacGameUpdateSliceTriggerClearSfxPlan) == 32,
              "TriggerClearSfxPlan ABI changed");
static_assert(sizeof(IsaacGameUpdateSliceTriggerClearDeepMusic) == 16,
              "TriggerClearDeepMusic ABI changed");
static_assert(sizeof(IsaacGameUpdateSliceTriggerClearAwardsWalk) == 16,
              "TriggerClearAwardsWalk ABI changed");
static_assert(sizeof(IsaacGameUpdateSliceTriggerClearAwardsSuite) == 44,
              "TriggerClearAwardsSuite ABI changed");
static_assert(sizeof(IsaacGameUpdateSliceTriggerClearRewindTail) == 8,
              "TriggerClearRewindTail ABI changed");

/* ------------------------------------------------------------------ v95 - */
/* Record idx 15 opaqueRoomUpdatePrefixB3B7 — typed-host B3-B7 (PE
   0x00803327..0x00803bfb). The B3 decision laws (FCO query gate, challenge
   id, TE list walk bounds/pre) + the B4-B7 frame laws (entity/grid
   per-step decisions) land here as slice exports. Room-family v36/v37/v39
   freestanding laws are consumed BY REFERENCE (never re-transcribed —
   B15-rain convention). The leaf bodies (FCO 0x9be080, HCE 0x9305f0,
   challenge 0x7ea2d0, TE call 0x9960b0, lookup 0x41af60, pos
   0x812d00/0x813520, genrand 0x6eef60, spawn 0x428b20, cleanup 0xa648b0,
   count 0x708250, grow 0x42c920, list 0x414a80/0x424540, vtable
   [vt+0]/[vt+8]/[vt+0x48]/[vt+0x4c], seed fatals 0xa112c0) stay
   typed-host. */

/* ---- B3: FCO query gate (PE 0x00803340 test eax,eax / 0x0080334d setne
   al -> Room+0x7768). FULL-DWORD. ---- */
extern "C" int32_t isaac_game_update_slice_b3b7_b3_fco_flag_gate(
    uint32_t fco_result) {
  return (fco_result != 0u) ? 1 : 0;
}

/* B3: challenge collectible id 0x28d (PE 0x00803336 push 0x28d). */
extern "C" uint32_t isaac_game_update_slice_b3b7_b3_fco_id(void) {
  return 0x28du;
}

/* B3: HCE effect id 0x2a5 (PE 0x00803348 push 0x2a5). */
extern "C" uint32_t isaac_game_update_slice_b3b7_b3_hce_id(void) {
  return 0x2a5u;
}

/* B3: challenge body host gate — HCE(0x2a5) hit (PE 0x0080335b test
   al,al / je skip). LOW-BYTE. */
extern "C" int32_t isaac_game_update_slice_b3b7_b3_challenge_host_gate(
    uint32_t hce_result) {
  return ((hce_result & 0xffu) != 0u) ? 1 : 0;
}

/* B3: TE walk gate — walk iff byte Room+0x7321 == 0 (PE 0x00803374 cmp
   byte / 0x0080337b jne skip). LOW-BYTE: 0x100 -> byte 0 -> walk. */
extern "C" int32_t isaac_game_update_slice_b3b7_b3_te_walk_gate(
    uint32_t byte_7321) {
  return ((byte_7321 & 0xffu) == 0u) ? 1 : 0;
}

/* B3: TE list non-empty — begin != end (PE 0x00803389 cmp / je). FULL. */
extern "C" int32_t isaac_game_update_slice_b3b7_b3_te_walk_nonempty(
    uint32_t begin, uint32_t end) {
  return (begin != end) ? 1 : 0;
}

/* B3: TE entry match — entry->type == 0 && entry->id == 0x40 (PE
   0x00803392 cmp dword [ecx],0 / 0x00803397 cmp dword [ecx+4],0x40).
   FULL-DWORD both (0x1000000 must NOT match). */
extern "C" int32_t isaac_game_update_slice_b3b7_b3_te_entry_match(
    uint32_t type0, uint32_t variant4) {
  return (type0 == 0u && variant4 == 0x40u) ? 1 : 0;
}

/* B3: TE walk continue — next != end (PE 0x008033a0 cmp eax,edx / jne
   loop). FULL-DWORD. */
extern "C" int32_t isaac_game_update_slice_b3b7_b3_te_walk_continue(
    uint32_t next, uint32_t end) {
  return (next != end) ? 1 : 0;
}

/* B3: TE call host this-off 0x1618 / const arg 0xc5d108 (PE 0x008033a6
   lea ecx,[edi+0x1618] / 0x008033ac push 0xc5d108). */
extern "C" uint32_t isaac_game_update_slice_b3b7_b3_te_host_this_off(void) {
  return 0x1618u;
}
extern "C" uint32_t isaac_game_update_slice_b3b7_b3_te_host_arg(void) {
  return 0xc5d108u;
}

/* ---- B4 frame laws (PE 0x008033b6..0x00803854) ---- */

/* desc type gate: (int32)type == -0x14 (PE 0x008033b9 cmp dword
   [eax],-0x14). FULL-DWORD SIGNED. */
extern "C" int32_t isaac_game_update_slice_b3b7_b4_desc_type_gate(
    uint32_t desc_type0) {
  return ((int32_t)desc_type0 == -0x14) ? 1 : 0;
}

/* frame-in-room gate: byte Room+1 != 0 (LOW) && frame == entry (PE
   0x00803472 cmp byte [edi+1],0 / 0x00803487 cmp [eax+0x264f8]). */
extern "C" int32_t isaac_game_update_slice_b3b7_b4_frame_in_room_gate(
    uint32_t room_byte1, int32_t frame_264f8, int32_t entry_11f0) {
  if ((room_byte1 & 0xffu) == 0u) {
    return 0;
  }
  return (frame_264f8 == entry_11f0) ? 1 : 0;
}

/* lookup route: count == 0 -> G0 (PE 0x008033eb cmp dword
   [ebp-0xa74],0 / jne entity-seed). FULL-DWORD. */
extern "C" int32_t isaac_game_update_slice_b3b7_b4_lookup_route(
    uint32_t lookup_count) {
  return (lookup_count == 0u) ? 1 : 0;
}

/* pickup variant ladder (PE 0x00803528..0x0080357c; ALL UNSIGNED jae /
   cmovb). rem<4 0x35, <9 0x34, <0x13 0x33, <0x1d 0x168, <0x36 0x3c,
   else 0x32. Room law by reference. */
extern "C" uint32_t isaac_game_update_slice_b3b7_b4_pickup_variant_from_rem(
    uint32_t rem100) {
  return isaac_room_b4_pickup_variant_from_rem(rem100);
}

/* second band kind (PE 0x00803660..0x0080377c; UNSIGNED jae). 0 none,
   1 A, 2 B, 3 C, 4 D. Room law by reference. */
extern "C" int32_t isaac_game_update_slice_b3b7_b4_second_band_kind(
    uint32_t rem100) {
  return isaac_room_b4_second_band_kind(rem100);
}

/* band option gate (PE 0x0080368f..0x008036c0 pattern): byte != 0 OR
   (mode==2 && game != 0 && (count 0x26630 > 0 OR byte 0x26589 != 0)).
   Room law by reference. */
extern "C" int32_t isaac_game_update_slice_b3b7_b4_band_option_gate(
    uint32_t option_byte, uint32_t mgr_mode8, uint32_t game_nonnull,
    uint32_t game_26630, uint32_t game_byte_26589) {
  return isaac_room_b4_option_gate(option_byte, (int32_t)mgr_mode8,
                                   game_nonnull, game_26630,
                                   game_byte_26589);
}

/* third spawn gate — (rng & 3) == 0 (PE 0x008037c1 and eax,3 / jne
   skip). FULL-DWORD. Room law by reference. */
extern "C" int32_t isaac_game_update_slice_b3b7_b4_third_spawn_gate(
    uint32_t rng3) {
  return isaac_room_b4_third_spawn_gate(rng3);
}

/* cleanup gate — lookup result byte == 0 (PE 0x00803829 cmp byte
   [ebp-0xa80],0 / jne next). LOW-BYTE. Room law by reference. */
extern "C" int32_t isaac_game_update_slice_b3b7_b4_cleanup_gate(
    uint32_t lookup_result_byte) {
  return isaac_room_b4_cleanup_needed(lookup_result_byte);
}

/* ---- B5 frame laws (PE 0x00803854..0x00803b1d) ---- */

/* outer gate: byte Room+0 != 0 (LOW) && frame == entry (PE 0x00803886
   cmp byte [edi],0 / 0x0080389b sub / jne skip). */
extern "C" int32_t isaac_game_update_slice_b3b7_b5_outer_gate(
    uint32_t room_byte0, int32_t frame_264f8, int32_t entry_11f0) {
  if ((room_byte0 & 0xffu) == 0u) {
    return 0;
  }
  return (frame_264f8 == entry_11f0) ? 1 : 0;
}

/* pass1 mode: Game+0x26584 == 0x28 (PE 0x008038a7 cmp dword
   [ecx+0x26584],0x28). FULL-DWORD. */
extern "C" int32_t isaac_game_update_slice_b3b7_b5_pass1_mode(
    uint32_t game_26584) {
  return (game_26584 == 0x28u) ? 1 : 0;
}

/* type candidate: (mode >= 2 && type == 1) || (type - 0xa) < 0x3de
   (PE 0x008038e6 cmp [eax+0x26614],2 jl / 0x008038ef cmp [esi+0x28],1 je /
   0x008038f8 sub eax,0xa / 0x008038fb cmp eax,0x3dd ja skip). mode SIGNED
   >= 2; the range compare is UNSIGNED — WIDE 0x4000000a must NOT pass.
   Room law by reference. */
extern "C" int32_t isaac_game_update_slice_b3b7_b5_type_candidate(
    uint32_t mode_26614, uint32_t entity_type28) {
  return isaac_room_b5_entity_type_candidate((int32_t)mode_26614,
                                             (int32_t)entity_type28);
}

/* flag clear: !(flags168 & 0x20000000) (PE 0x00803908 and eax,
   0x20000000 / or eax,0 / jne skip). FULL-DWORD bit test. Room by ref. */
extern "C" int32_t isaac_game_update_slice_b3b7_b5_flag_clear(
    uint32_t flags168) {
  return isaac_room_b5_entity_flag_clear(flags168);
}

/* excluded type: 0x2d/0x54/0x112/0x113/(0x4e && variant==0xa) (PE
   0x0080392e..0x00803952; FULL-DWORD). Room law by reference. */
extern "C" int32_t isaac_game_update_slice_b3b7_b5_excluded_type(
    uint32_t type28, uint32_t variant2c) {
  return isaac_room_b5_entity_type_excluded((int32_t)type28,
                                            (int32_t)variant2c);
}

/* post-vcall48 ok: vt48 LOW != 0 && field32c SIGNED >= 0 (PE 0x00803921
   test al,al / 0x00803925 cmp dword [esi+0x32c],0 jl). */
extern "C" int32_t isaac_game_update_slice_b3b7_b5_post_vcall48_ok(
    uint32_t vt48_al, int32_t field32c) {
  if ((vt48_al & 0xffu) == 0u) {
    return 0;
  }
  return (field32c >= 0) ? 1 : 0;
}

/* pass2 count gate: (int32)count > 3 (PE 0x008039ae cmp eax,3 / jle
   skip). SIGNED. Room law by reference. */
extern "C" int32_t isaac_game_update_slice_b3b7_b5_pass2_count_gate(
    uint32_t count_708250) {
  return isaac_room_b5_pass2_count_gate((int32_t)count_708250);
}

/* needs RNG: vt4c LOW == 0 (PE 0x00803a47 test al,al / jne skip). */
extern "C" int32_t isaac_game_update_slice_b3b7_b5_needs_rng(
    uint32_t vt4c_al) {
  return ((vt4c_al & 0xffu) == 0u) ? 1 : 0;
}

/* append gate: (rng & 1) == 0 (PE 0x00803aae and eax,1 / jne skip).
   Room law by reference. */
extern "C" int32_t isaac_game_update_slice_b3b7_b5_append_gate(
    uint32_t rng) {
  return isaac_room_b5_entity_rng_append_gate(rng);
}

/* seed fatal: seed == 0 (PE 0x00803a66 test edx,edx / jne; FULL-DWORD). */
extern "C" int32_t isaac_game_update_slice_b3b7_b5_seed_fatal_gate(
    uint32_t seed3dc) {
  return (seed3dc == 0u) ? 1 : 0;
}

/* ABI v99 leaf peel (idx 15): FUN_00708250 (0x00708250..0x00708343).
   Transcribed from the instruction stream. Nested 0x4288a0 is the
   last-node sample source (HUD-v16 pin); nested 0x7db860 is the
   per-included-player addend. 0xa112c0 mid-loop empty warn continues
   and is not in this captured-count model. */

extern "C" int32_t isaac_game_update_slice_b5_count_708250_node_reject(
    uint32_t node_byte_d, uint32_t node_value_10, uint32_t node_is_head) {
  /* PE 0x70827c cmp byte [eax+0xd],0 / 0x708280 jne 0x70833b. LOW-BYTE. */
  if ((node_byte_d & 0xffu) != 0u) {
    return 1;
  }
  /* PE 0x708286 cmp dword [eax+0x10],0x4f / 0x70828a jg 0x70833b.
     SIGNED — 0xffffffff is -1 and does NOT reject. */
  if ((int32_t)node_value_10 >
      (int32_t)ISAAC_GAME_UPDATE_B5_COUNT_708250_SCAN_WANTED) {
    return 1;
  }
  /* PE 0x708290 cmp eax,[esi+0x1bbd8] / 0x708296 je 0x70833b. FULL. */
  if (node_is_head != 0u) {
    return 1;
  }
  return 0;
}

extern "C" int32_t isaac_game_update_slice_b5_count_708250_player_include(
    uint32_t field_2c, uint32_t field_3bc) {
  /* PE 0x7082fb cmp dword [ecx+0x2c],0 / jne skip;
     PE 0x708301 cmp dword [ecx+0x3bc],0 / jne skip. FULL-DWORD. */
  return (field_2c == 0u && field_3bc == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_game_update_slice_b5_count_708250_empty(
    uint32_t player_count) {
  /* PE 0x7082b6 test ecx,ecx / 0x7082b8 je 0x708332. FULL-DWORD. */
  return (player_count == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_game_update_slice_b5_count_708250_continue(
    uint32_t index, uint32_t count_now) {
  /* PE 0x70832b cmp edi,ecx / 0x70832d jb 0x7082c0. UNSIGNED.
     The bound ecx is re-read every iteration (0x708312..0x708326). */
  return (index < count_now) ? 1 : 0;
}

extern "C" int32_t isaac_game_update_slice_b5_count_708250_7db860(
    uint32_t node_byte_d, uint32_t node_value_10, uint32_t node_is_head,
    uint32_t buf_begin, uint32_t buf_end, uint32_t buf_byte) {
  /* Nested 0x7db860: same node reject (0x7db88d..0x7db89f) then
     SIGNED (end-begin) > 0x8f (0x7db8af cmp eax,0x8f / jle) then
     movzx eax, byte [begin+0x8f]. */
  if (isaac_game_update_slice_b5_count_708250_node_reject(
          node_byte_d, node_value_10, node_is_head) != 0) {
    return 0;
  }
  if ((int32_t)(buf_end - buf_begin) <=
      (int32_t)ISAAC_GAME_UPDATE_B5_COUNT_708250_BUF_GATE) {
    return 0;
  }
  return (int32_t)(buf_byte & 0xffu);
}

extern "C" uint32_t isaac_game_update_slice_b5_count_708250_result(
    uint32_t node_byte_d, uint32_t node_value_10, uint32_t node_is_head,
    uint32_t player_count,
    const IsaacGameUpdateSliceB5Count708250Player* players) {
  IsaacGameUpdateSliceB5Count708250Plan plan = {};
  isaac_game_update_slice_b5_count_708250(node_byte_d, node_value_10,
                                          node_is_head, player_count, players,
                                          &plan);
  return plan.result;
}

extern "C" void isaac_game_update_slice_b5_count_708250(
    uint32_t node_byte_d, uint32_t node_value_10, uint32_t node_is_head,
    uint32_t player_count,
    const IsaacGameUpdateSliceB5Count708250Player* players,
    IsaacGameUpdateSliceB5Count708250Plan* out) {
  if (out == nullptr) {
    return;
  }
  IsaacGameUpdateSliceB5Count708250Plan p = {};
  if (isaac_game_update_slice_b5_count_708250_node_reject(
          node_byte_d, node_value_10, node_is_head) != 0) {
    p.node_reject = 1u;
    *out = p;
    return;
  }
  if (isaac_game_update_slice_b5_count_708250_empty(player_count) != 0) {
    p.empty_vector = 1u;
    *out = p;
    return;
  }
  /* Walk cap MAX_PLAYERS. Bound re-derived every iteration via continue
     (UNSIGNED jb vs the captured count). */
  const uint32_t cap =
      (uint32_t)ISAAC_GAME_UPDATE_B5_COUNT_708250_MAX_PLAYERS;
  uint32_t acc = 0u;
  IsaacGameUpdateSliceB5Count708250Player zero = {};
  for (uint32_t i = 0u;
       isaac_game_update_slice_b5_count_708250_continue(i, player_count) !=
           0 &&
       i < cap;
       ++i) {
    const IsaacGameUpdateSliceB5Count708250Player* pl =
        (players != nullptr) ? &players[i] : &zero;
    if (isaac_game_update_slice_b5_count_708250_player_include(
            pl->field_2c, pl->field_3bc) == 0) {
      continue;
    }
    p.included += 1u;
    p.host_7db860 += 1u;
    acc += (uint32_t)isaac_game_update_slice_b5_count_708250_7db860(
        node_byte_d, node_value_10, node_is_head, pl->buf_begin, pl->buf_end,
        pl->buf_byte);
  }
  p.result = acc;
  *out = p;
}

extern "C" uint32_t isaac_game_update_slice_b5_count_708250_host_va(void) {
  return ISAAC_GAME_UPDATE_B5_COUNT_708250_HOST_VA;
}
extern "C" uint32_t isaac_game_update_slice_b5_count_708250_host_va_7db860(
    void) {
  return ISAAC_GAME_UPDATE_B5_COUNT_708250_HOST_VA_7DB860;
}
extern "C" uint32_t isaac_game_update_slice_b5_count_708250_host_va_4288a0(
    void) {
  return ISAAC_GAME_UPDATE_B5_COUNT_708250_HOST_VA_4288A0;
}


/* ---- B6 frame laws (PE 0x00803b2e..0x00803bb4) ---- */

/* destroy tree needed: count != 0 (PE 0x00803b2e cmp dword
   [edi+0x7238],0 / je skip). FULL-DWORD. Room law by reference. */
extern "C" int32_t isaac_game_update_slice_b3b7_b6_destroy_needed(
    uint32_t tree_count_7238) {
  return isaac_room_b6_destroy_tree_gate(tree_count_7238);
}

/* grid index valid: idx >= 0 (SIGNED) && idx < w*h (SIGNED) (PE
   0x00803b53 test esi,esi js / 0x00803b5e cmp esi,eax jge). Room by ref. */
extern "C" int32_t isaac_game_update_slice_b3b7_b6_grid_index_valid(
    int32_t grid_index, int32_t width_c, int32_t height_10) {
  return isaac_room_b6_grid_index_valid(grid_index, width_c, height_10);
}

/* ---- B7 frame laws (PE 0x00803bb4..0x00803bfb) ---- */

/* grid cells = h*w (PE 0x00803bbe imul eax,ecx; 32-bit wrap). Room by ref. */
extern "C" int32_t isaac_game_update_slice_b3b7_b7_grid_cells(int32_t w,
                                                              int32_t h) {
  return isaac_room_b7_cell_count(w, h);
}

/* grid update needed: cells > 0 (PE 0x00803bc7 test eax,eax / jle skip).
   SIGNED. Room law by reference. */
extern "C" int32_t isaac_game_update_slice_b3b7_b7_grid_update_needed(
    uint32_t cells) {
  return isaac_room_b7_cell_loop_enter((int32_t)cells);
}

/* slot update needed: slot != 0 (PE 0x00803bd2 test ecx,ecx / je skip).
   FULL-DWORD. Room law by reference. */
extern "C" int32_t isaac_game_update_slice_b3b7_b7_slot_update_needed(
    uint32_t slot_ptr) {
  return isaac_room_b7_cell_needs_vcall(slot_ptr);
}

/* B7 grid slot base offset 0x24 (PE 0x00803bcb lea esi,[edi+0x24]). */
extern "C" uint32_t isaac_game_update_slice_b3b7_b7_cell_base_off(void) {
  return 0x24u;
}


/* ---- Record wire: full B3-B7 typed plan (branch-by-branch PE
   0x00803327..0x00803bfb). frame_264f8 comes from the state (Game+0x264f8);
   every other capture comes from the runtime pack. ---- */
extern "C" void isaac_game_update_slice_b3b7_wire(
    const IsaacGameUpdateSliceRuntimeInputs* in, int32_t frame_264f8,
    IsaacGameUpdateSliceB3B7Plan* out) {
  if (out == nullptr) {
    return;
  }
  IsaacGameUpdateSliceB3B7Plan p = {};
  if (in == nullptr) {
    *out = p;
    return;
  }
  /* ---- B3 (0x00803327..0x008033b1) ---- */
  p.b3_host_fco = 1u; /* call 0x9be080 @0x0080333b unconditional */
  if (isaac_game_update_slice_b3b7_b3_challenge_host_gate(
          in->b3b7_hce_2a5_hit) != 0) {
    p.b3_host_challenge = 1u; /* 0x7ea2d0 @0x00803367 */
  }
  if (isaac_game_update_slice_b3b7_b3_te_walk_gate(in->b3b7_te_byte_7321) !=
          0 &&
      isaac_game_update_slice_b3b7_b3_te_walk_nonempty(in->b3b7_te_begin,
                                                       in->b3b7_te_end) != 0) {
    uint32_t n = in->b3b7_te_entries_count;
    const uint32_t cap =
        static_cast<uint32_t>(ISAAC_GAME_UPDATE_B3B7_TE_MAX_ENTRIES);
    if (n > cap) {
      n = cap;
    }
    for (uint32_t i = 0u; i < n; ++i) {
      if (isaac_game_update_slice_b3b7_b3_te_entry_match(
              in->b3b7_te_entry_type[i], in->b3b7_te_entry_id[i]) != 0) {
        p.b3_host_te_call = 1u; /* 0x9960b0 @0x008033b1 */
        break;
      }
    }
  }
  /* ---- B4 (0x008033b6..0x00803854) ---- */
  if (isaac_game_update_slice_b3b7_b4_desc_type_gate(in->b3b7_desc_type0) !=
      0) {
    p.b4_host_lookup = 1u; /* 0x41af60 @0x008033df */
    if (isaac_game_update_slice_b3b7_b4_lookup_route(in->b3b7_lookup_count) !=
        0) {
      /* G0 empty route (0x008033f4..0x00803455): pos_a + pos_finish +
         genrand + spawn. */
      p.b4_host_pos_a = 1u;
      p.b4_host_pos_finish += 1u;
      p.b4_genrand_draws += 1u;
      p.b4_host_spawns += 1u;
    }
    if (isaac_game_update_slice_b3b7_b4_frame_in_room_gate(
            in->b3b7_room_byte1, frame_264f8,
            (int32_t)in->ambient_room_entry_11f0) != 0) {
      /* Frame suite (0x00803472..0x00803822). Seed check first: desc+0x5c
         != 0 else typed fatal (0xa112c0 + int3 stops the whole residual —
         the cleanup below is NOT reached). */
      if (in->b3b7_desc_seed_5c == 0u) {
        p.b4_seed_fatal = 1u;
      } else {
        /* G1: genrand + reward pos_finish + pickup spawn. */
        p.b4_genrand_draws += 1u;
        p.b4_host_pos_finish += 1u;
        p.b4_host_spawns += 1u;
        /* Second band from rem2 = mod100(xorshift(seed1,5,9,7)). The seed
           chain (xorshift x3 + mod100 x2 + third gate) is a room law. */
        {
          IsaacRoomB4RewardSeedChain chain = {};
          isaac_room_b4_reward_seed_chain(in->b3b7_desc_seed_5c, &chain);
          if (chain.band_kind != 0) {
            const int32_t band_ok =
                chain.band_kind == 1 /* band A: no option gate */
                    ? 1
                    : isaac_game_update_slice_b3b7_b4_band_option_gate(
                          chain.band_kind == 2 ? in->b3b7_mgr_byte_1b4
                          : chain.band_kind == 3 ? in->b3b7_mgr_byte_2bf
                                                : in->b3b7_mgr_byte_1ba,
                          in->b3b7_mgr_mode8, in->b3b7_game_nonnull,
                          in->b3b7_game_26630, in->b3b7_game_byte_26589);
            if (band_ok != 0) {
              /* Band genrand + spawn (0x00803665/0x8036c6/0x80371f/
                 0x803761). */
              p.b4_genrand_draws += 1u;
              p.b4_host_spawns += 1u;
            }
          }
          if (chain.third_gate != 0) {
            /* Third: pos_finish + genrand + spawn (0x008037c6..0x0080381d). */
            p.b4_host_pos_finish += 1u;
            p.b4_genrand_draws += 1u;
            p.b4_host_spawns += 1u;
          }
        }
      }
    }
    /* Cleanup (0x00803822): result byte == 0 -> 0xa648b0. Runs on BOTH the
       G0 and the entity-seed routes (always after the desc-type gate),
       but NOT after the seed-null fatal (int3 terminates the residual). */
    if (p.b4_seed_fatal == 0u &&
        isaac_game_update_slice_b3b7_b4_cleanup_gate(
            in->b3b7_lookup_result_byte) != 0) {
      p.b4_host_cleanup = 1u;
    }
  }
  /* The seed-null fatal's int3 terminates the process: no further B5-B7
     host content. */
  if (p.b4_seed_fatal != 0u) {
    *out = p;
    return;
  }
  /* ---- B5 (0x00803854..0x00803b1d) ---- */
  if (isaac_game_update_slice_b3b7_b5_outer_gate(
          in->b3b7_room_byte0, frame_264f8,
          (int32_t)in->ambient_room_entry_11f0) != 0) {
    p.b5_host_count_708250 = 1u; /* 0x708250 @0x008039a3 */
    uint32_t end = in->b3b7_list_end;
    const uint32_t cap = in->b3b7_list_cap;
    const uint32_t count = in->b3b7_entity_count;
    const uint32_t ecap =
        static_cast<uint32_t>(ISAAC_GAME_UPDATE_B3B7_B5_MAX_ENTITIES);
    const uint32_t n = count > ecap ? ecap : count;
    /* pass1 (mode == 0x28; PE 0x008038a7..0x008039a3). */
    if (isaac_game_update_slice_b3b7_b5_pass1_mode(in->b3b7_game_26584) != 0) {
      for (uint32_t i = 0u; i < n; ++i) {
        if (isaac_game_update_slice_b3b7_b5_type_candidate(
                in->b3b7_game_26614, in->b3b7_b5_type[i]) == 0) {
          continue;
        }
        if (isaac_game_update_slice_b3b7_b5_flag_clear(
                in->b3b7_b5_flags168[i]) == 0) {
          continue;
        }
        p.b5_host_vcall48 += 1u; /* [vt+0x48] @0x0080391f */
        if (isaac_game_update_slice_b3b7_b5_post_vcall48_ok(
                in->b3b7_b5_vt48_al[i], (int32_t)in->b3b7_b5_field32c[i]) !=
                0 &&
            isaac_game_update_slice_b3b7_b5_excluded_type(
                in->b3b7_b5_type[i], in->b3b7_b5_variant[i]) == 0) {
          /* Append: end != cap direct store else grow 0x42c920. */
          if (isaac_room_b5_list_at_capacity(end, cap) != 0) {
            p.b5_host_grow += 1u;
          }
          end = isaac_room_b5_list_end_after_store(end);
        }
      }
    }
    /* pass2 (count > 3 signed; PE 0x008039a3..0x00803b17). */
    if (isaac_game_update_slice_b3b7_b5_pass2_count_gate(
            in->b3b7_count_708250) != 0) {
      int32_t budget = isaac_room_b5_pass2_append_budget(
          (int32_t)in->b3b7_count_708250);
      for (uint32_t i = 0u; i < n; ++i) {
        if (isaac_game_update_slice_b3b7_b5_type_candidate(
                in->b3b7_game_26614, in->b3b7_b5_type[i]) == 0) {
          continue;
        }
        if (isaac_game_update_slice_b3b7_b5_flag_clear(
                in->b3b7_b5_flags168[i]) == 0) {
          continue;
        }
        p.b5_host_vcall48 += 1u; /* [vt+0x48] @0x00803a24 */
        if (isaac_game_update_slice_b3b7_b5_post_vcall48_ok(
                in->b3b7_b5_vt48_al[i], (int32_t)in->b3b7_b5_field32c[i]) ==
            0) {
          continue;
        }
        p.b5_host_vcall4c += 1u; /* [vt+0x4c] @0x00803a42 */
        if (isaac_game_update_slice_b3b7_b5_needs_rng(
                in->b3b7_b5_vt4c_al[i]) == 0) {
          continue;
        }
        /* Per-entity RNG loop (0x00803a60..0x00803af2): budget = count-3
           iterations of xorshift(seed3dc, 3e0, 3e4, 3e8) with store-back;
           seed==0 fatal; (rng&1)==0 appends. */
        uint32_t seed = in->b3b7_b5_seed3dc[i];
        for (int32_t b = 0; b < budget; ++b) {
          if (isaac_game_update_slice_b3b7_b5_seed_fatal_gate(seed) != 0) {
            p.b5_seed_fatal = 1u; /* 0xa112c0 @0x00803a71 + int3 */
            seed = 0u;
            break;
          }
          seed = isaac_room_b5_entity_rng_step(seed, in->b3b7_b5_shift3e0[i],
                                               in->b3b7_b5_shift3e4[i],
                                               in->b3b7_b5_shift3e8[i]);
          if (isaac_game_update_slice_b3b7_b5_append_gate(seed) != 0) {
            if (isaac_room_b5_list_at_capacity(end, cap) != 0) {
              p.b5_host_grow += 1u;
            }
            end = isaac_room_b5_list_end_after_store(end);
          }
        }
        if (p.b5_seed_fatal != 0u) {
          break; /* the fatal's int3 stops the residual */
        }
      }
    }
  }
  /* The B5 pass2 seed-null fatal (int3 @0x00803a83) terminates the
     process: B6/B7 never run. */
  if (p.b5_seed_fatal != 0u) {
    *out = p;
    return;
  }
  /* ---- B6 (0x00803b2e..0x00803bb4) ---- */
  if (isaac_game_update_slice_b3b7_b6_destroy_needed(
          in->b3b7_tree_count_7238) != 0) {
    uint32_t m = in->b3b7_b6_node_count;
    const uint32_t mcap =
        static_cast<uint32_t>(ISAAC_GAME_UPDATE_B3B7_B6_MAX_NODES);
    if (m > mcap) {
      m = mcap;
    }
    for (uint32_t i = 0u; i < m; ++i) {
      /* iterate 0x414a80 runs per node regardless of the destroy skip. */
      p.b6_host_iterate += 1u;
      if (isaac_game_update_slice_b3b7_b6_grid_index_valid(
              (int32_t)in->b3b7_b6_node_idx[i], (int32_t)in->b3b7_width_c,
              (int32_t)in->b3b7_height_10) == 0) {
        continue;
      }
      if (in->b3b7_b6_node_slot_nonnull[i] == 0u) {
        continue;
      }
      p.b6_host_destroy += 1u; /* [vt+0] push 1 @0x00803b6e */
    }
    p.b6_host_clear = 1u; /* 0x424540 @0x00803b9d when count != 0 */
  }
  /* ---- B7 (0x00803bb4..0x00803bfb) ---- */
  {
    const int32_t cells = isaac_game_update_slice_b3b7_b7_grid_cells(
        (int32_t)in->b3b7_width_c, (int32_t)in->b3b7_height_10);
    if (isaac_game_update_slice_b3b7_b7_grid_update_needed(
            (uint32_t)cells) != 0) {
      uint32_t k = in->b3b7_b7_nonnull_slot_count;
      const uint32_t kcap =
          static_cast<uint32_t>(ISAAC_GAME_UPDATE_B3B7_B7_MAX_SLOTS);
      if (k > kcap) {
        k = kcap;
      }
      for (uint32_t i = 0u; i < k; ++i) {
        /* Each captured index is a non-null grid slot -> one [vt+8] call. */
        p.b7_host_update += 1u;
      }
    }
  }
  *out = p;
}

/* ================================================================== v95 -
   Record idx 29 roomTriggerClearAwardsBit7 — FUN_007fb250 award-spawner
   HEAD dispatch + arithmetic laws (VA 0x007fb250..0x007fe0b3, 2970 insns,
   ret 0x7fe0b3). Branch-by-branch from cpu-dump 007fb250.txt /
   00812d00.txt / 00823ec0.txt; do NOT derive from the C++. The whole-body
   Lua gate 0x866220 and the walk/greed/generic arm bodies stay TYPED-HOST.
   No uint8_t scalar params (all i32/u32 with explicit low-byte re-narrow). */

/* walk_decision: 0x7fb464 mov eax,[esi+8] / 0x7fb467 cmp eax,5 / je
   0x7fbb64 + 0x7fb470 cmp eax,0x11 / je 0x7fbb64 + 0x7fb479 cmp eax,0x10
   / je 0x7fe087. FULL-DWORD equalities (WIDE 0x100/0x105/0x101 diverge). */
extern "C" int32_t isaac_game_update_slice_awards_bit7_walk_decision(
    uint32_t room_type_8) {
  if (room_type_8 == 5u || room_type_8 == 0x11u) return 1;
  if (room_type_8 == 0x10u) return 2;
  return 0;
}

/* merchant_gate: 0x7fb40f mov eax,[esi+4] / 0x7fb412 mov eax,[eax+0x10]
   / 0x7fb415 test eax,eax / je 0x7fb464 + 0x7fb419 cmp [eax+8],0x10 / jne
   0x7fb464 + 0x7fb41f cmp [eax],0x23 / jne 0x7fb464. NULL-check on the
   loaded pointer; merchant chain fires iff the room+4->+0x10 struct is
   non-null, its type field @+0 == 0x23 and its kind @+8 == 0x10.
   FULL-DWORD compares (0x100/0x23f/0x101 diverge). */
extern "C" int32_t isaac_game_update_slice_awards_bit7_merchant_gate(
    uint32_t merchant_ptr_nonzero, uint32_t merchant_kind_0,
    uint32_t merchant_type_8) {
  if (merchant_ptr_nonzero == 0u) return 0;
  if (merchant_kind_0 != 0x23u) return 0;
  if (merchant_type_8 != 0x10u) return 0;
  return 1;
}

/* head_select: 0x7fb3f7 mov eax,[ecx+0x269c8] (fresh difficulty read) /
   0x7fb3fd cmp eax,2 / je 0x7fd8e2 + 0x7fb406 cmp eax,3 / je 0x7fd8e2
   (GREED — reuses trigger_clear_greed_mode, the SAME PE law landed for the
   TriggerClear greed arm; do NOT re-transcribe) / merchant gate (above) ->
   2 / walk_decision 1 -> 3 (walk arm) / walk_decision 2 -> 4 (0x10 skip to
   the tail store) / else 0 generic. Dispatch ORDER is machine order:
   greed > merchant > walk > skip. */
extern "C" int32_t isaac_game_update_slice_awards_bit7_head_select(
    int32_t difficulty_269c8, int32_t merchant_gate, int32_t walk_decision) {
  if (isaac_game_update_slice_trigger_clear_greed_mode(difficulty_269c8) !=
      0) {
    return 1;
  }
  if (merchant_gate != 0) return 2;
  if (walk_decision == 1) return 3;
  if (walk_decision == 2) return 4;
  return 0;
}

/* generic_skip: 0x7fb482 call 0x74efd0 (HasAbandonedMineshaft, HOST al) /
   0x7fb487 test al,al / je 0x7fb49d (generic arm runs) + 0x7fb48b mov
   eax,[0xc71678] / 0x7fb490 cmp dword [eax+0x1830c],1 / je 0x7fe087 (skip
   to the tail store). Skip iff (mineshaft_al & 0xff) != 0 && dim_1830c ==
   1. LOW-BYTE on al, FULL-DWORD on dim. */
extern "C" int32_t isaac_game_update_slice_awards_bit7_generic_skip(
    uint32_t mineshaft_al, uint32_t dim_1830c) {
  if ((mineshaft_al & 0xffu) == 0u) return 0;
  return dim_1830c == 1u ? 1 : 0;
}

/* lua_gate_skip: 0x7fb2c6 call 0x866220 (Lua binding, HOST) / 0x7fb2cb
   test al,al / 0x7fb2cd jne 0x7fe099 — nonzero LOW BYTE skips ALL award
   spawning AND the tail store (jumps straight to the SEH teardown). WIDE
   0x100 -> 0. */
extern "C" int32_t isaac_game_update_slice_awards_bit7_lua_gate_skip(
    uint32_t gate_al) {
  return (gate_al & 0xffu) != 0u ? 1 : 0;
}

/* tail_store_fire: the 0x7fe087..0x7fe096 epilogue store
   [Room+4+0x60] = final_ac runs on EVERY non-Lua-skip path — greed arm
   (0x7fd8dd/0x7fd979/0x7fd9cf/0x7fd9f9/0x7fda10 jmp 0x7fe087), walk arm
   (0x7fbb5f), merchant (0x7fb45f), 0x10-skip (0x7fb47c), mineshaft-skip
   (0x7fb497). ONLY 0x7fb2cd jne 0x7fe099 skips it. */
extern "C" int32_t isaac_game_update_slice_awards_bit7_tail_store_fire(
    uint32_t lua_gate_skip) {
  return lua_gate_skip == 0u ? 1 : 0;
}

/* 812d00: VA 0x00812d00 (37 insns, 0 E8, 0 indirect, 2 stores, ret 4).
   0x812d03 eax=[0xc71678] / 0x812d08 ecx=[eax+0x18300] / 0x812d0e eax=
   [ecx+4] / test / je 0x812d88 (NO store) / 0x812d15 eax=[eax+0x10] /
   test / je 0x812d88 / 0x812d1c eax=[eax+0x48] (stage48) / 0x812d1f sub
   eax,9 / 0x812d22 cmp eax,3 / 0x812d25 ja 0x812d88 (UNSIGNED) /
   0x812d27 jmp [eax*4+0x812dc8] jump table {9:0x148, 10:0x13b, 11:0x84,
   12:0x77} (tbl dwords read this unit: 0x812d7a/0x812d81/0x812d2e/
   0x812d73) / 0x812d33 cdq / 0x812d34 idiv [ecx+0xc] (SIGNED quot/rem) /
   0x812d44..0x812d53 out0 = f32(rem)*40.0f+40.0f (movd/cvtdq2ps/mulss
   [0xbaa904]=40.0f/addss) / 0x812d57..0x812d6a out1 = f32(quot)*40.0f+
   120.0f (addss [0xbaaa00]=120.0f). The mulss/addss pipelines are exactly
   the landed tailmid_706c_expire_pos_y/_pos_x laws (same consts) — this
   law COMPOSES them. divisor==0 would #DE in PE; fire=0 here (documented
   divergence). */
extern "C" void isaac_game_update_slice_812d00_arithmetic(
    uint32_t chain4_nonzero, uint32_t chain4_10_nonzero, uint32_t stage48,
    uint32_t divisor_c, IsaacGameUpdateSlice812d00Out* out) {
  if (out == nullptr) return;
  out->fire = 0u;
  out->out0_bits = 0u;
  out->out1_bits = 0u;
  if (chain4_nonzero == 0u) return;
  if (chain4_10_nonzero == 0u) return;
  const uint32_t dec = stage48 - 9u;
  if (dec > 3u) return;
  uint32_t numer;
  switch (dec) {
    case 0u: numer = 0x148u; break; /* stage48 9  */
    case 1u: numer = 0x13bu; break; /* stage48 10 */
    case 2u: numer = 0x84u; break;  /* stage48 11 */
    default: numer = 0x77u; break;  /* stage48 12 */
  }
  const int32_t divisor = static_cast<int32_t>(divisor_c);
  if (divisor == 0) return; /* PE #DE; model keeps fire=0 */
  const int32_t quot = static_cast<int32_t>(numer) / divisor;
  const int32_t rem = static_cast<int32_t>(numer) % divisor;
  const float out0 = isaac_game_update_slice_tailmid_706c_expire_pos_y(
      rem, 0x42200000u); /* 40.0f */
  const float out1 = isaac_game_update_slice_tailmid_706c_expire_pos_x(
      quot, 0x42200000u, 0x42f00000u); /* 40.0f, 120.0f */
  out->fire = 1u;
  out->out0_bits = __builtin_bit_cast(uint32_t, out0);
  out->out1_bits = __builtin_bit_cast(uint32_t, out1);
}

/* 823ec0: VA 0x00823ec0 (49 insns, 1 E8 -> 0x812d00, 0 stores, ret cdecl).
   0x823ecd call 0x812d00(&tmp) / 0x823ed2 xmm2=40.0f (0xbaa904) /
   0x823eda xmm3=0.5f (0xbaa2d0) / 0x823ee2 xmm0=out0+0.0f (0xba9fe4) /
   0x823eee xmm1=out1-80.0f (0xbaa9a0) / 0x823efb xmm0=(xmm0-40)/40+0.5 /
   0x823f07 cvttss2si edx (TRUNC toward zero; NaN/overflow -> 0x80000000)
   / 0x823f0b test edx,edx / 0x823f0d js -1 (SIGNED <0) / 0x823f0f eax=
   [Room+0xc] / 0x823f12 cmp edx,eax / 0x823f14 jge -1 (SIGNED >=) /
   0x823f16 xmm1=(xmm1-120.0f (0xbaaa00))/40+0.5 / 0x823f26 cvttss2si ecx /
   0x823f2a js -1 / 0x823f2e cmp ecx,[Room+0x10] / 0x823f31 jge -1 /
   0x823f33 imul eax,ecx / 0x823f37 add eax,edx -> return [Room+0xc]*yd+xd
   / 0x823f3d or eax,-1. fire==0 -> PE reads UNINITIALIZED stack; the pure
   law returns -1 (documented divergence — the only deterministic branch).
   cvttss2si indefinite emulated with the x<-2^31 || x>=2^31 guard. */
extern "C" int32_t isaac_game_update_slice_823ec0_index(
    uint32_t fire_812d00, uint32_t out0_bits, uint32_t out1_bits,
    uint32_t room_c, uint32_t room_10) {
  if (fire_812d00 == 0u) return -1;
  const float c4 = __builtin_bit_cast(float, 0x42200000u); /* 40.0f */
  float x = __builtin_bit_cast(float, out0_bits);
  x = x + 0.0f; /* addss [0xba9fe4] */
  float y = __builtin_bit_cast(float, out1_bits);
  y = y - 80.0f; /* subss [0xbaa9a0] */
  x = (x - c4) / c4 + 0.5f; /* subss/divss/addss 0.5f */
  int32_t xd;
  if (!(x >= -2147483648.0f && x < 2147483648.0f)) {
    xd = INT32_MIN; /* cvttss2si indefinite */
  } else {
    xd = static_cast<int32_t>(x);
  }
  if (xd < 0) return -1;
  if (xd >= static_cast<int32_t>(room_c)) return -1;
  y = (y - 120.0f) / c4 + 0.5f; /* subss [0xbaaa00] */
  int32_t yd;
  if (!(y >= -2147483648.0f && y < 2147483648.0f)) {
    yd = INT32_MIN;
  } else {
    yd = static_cast<int32_t>(y);
  }
  if (yd < 0) return -1;
  if (yd >= static_cast<int32_t>(room_10)) return -1;
  /* imul eax,ecx + add eax,edx — 32-bit wrap (uint32 arithmetic avoids
     signed-overflow UB). */
  const uint32_t prod = static_cast<uint32_t>(static_cast<int32_t>(room_c)) *
                        static_cast<uint32_t>(yd);
  return static_cast<int32_t>(prod + static_cast<uint32_t>(xd));
}

/* merchant_chain: typed-host call-arg pack of the merchant chain
   (0x7fb42e..0x7fb45f). Fixed constants read from the instruction stream:
   0x7fb42a push 1 / 0x7fb42c push 1 / 0x7fb42e lea ecx,[Mgr+0x14] /
   call 0x929b40; 0x7fb436 push 0xe / call 0x95a7b0 (no receiver; the body
   reads [0xc71678] itself); 0x7fb443 push 1 / 0x7fb445 push 0x1ec /
   0x7fb44a lea ecx,[Mgr+0x14] / call 0x929b40; 0x7fb452 mov ecx,[0xc71678]
   / 0x7fb458 push 0xe / call 0x6f9770. Fires iff merchant_gate. */
extern "C" void isaac_game_update_slice_awards_bit7_merchant_chain(
    uint32_t fire, IsaacGameUpdateSliceAwardsBit7MerchantChain* out) {
  if (out == nullptr) return;
  out->fire = fire != 0u ? 1u : 0u;
  out->call1_va = 0x00929b40u;
  out->call1_arg1 = 1u;
  out->call1_arg2 = 1u;
  out->call1_this_off = 0x14u; /* [0xc7169c]+0x14 */
  out->call2_va = 0x0095a7b0u;
  out->call2_arg1 = 0xeu;
  out->call3_va = 0x00929b40u;
  out->call3_arg1 = 0x1ecu;
  out->call3_arg2 = 1u;
  out->call3_this_off = 0x14u;
  out->call4_va = 0x006f9770u;
  out->call4_arg1 = 0xeu;
  out->call4_this_off = 0u; /* Game [0xc71678] receiver */
}

/* ==================================================================== */
/* ABI v95 (record idx 18, roomTriggerOutput 0x00823080): BODY pure laws.
   Census + branch-for-branch transcription:
   section-notes/update-v95-18-trigger-output/NOTES.md.
   Phase 1 walk (0x82308f..0x8230c5): head = [this+0x7328+8*arg]; cur =
   *head; while (cur != head) { idx = cur->f10; p = [this+0x24+4*idx];
   if (p) 0x823150(p); advance(&cur); }  — advance 0x414a80 is the SAME
   callee as record 2 (v79); this transcription mirrors
   global_tree_4aba0_pure branch-for-branch.
   Phase 2 scan (0x8230c7..0x823113): unsigned jb loop over [this+0x125c]
   (count [this+0x1264]); FULL-DWORD gates f28==0x3e8 && f2c==0x78 &&
   f450==arg; match -> byte [entry+0x173]=1 + vtbl+0xc vcall (host).
   Phase 3 callbacks (0x823115..0x82313d): begin/end at
   this+0x7378+12*arg / this+0x737c+12*arg; fp != end step 4 -> host call.
   Every scalar param uint32_t/int32_t (no uint8_t scalar params). ABI
   stays 95. */
/* ==================================================================== */

static int32_t room_trigger_output_node_index(
    const IsaacRoomTriggerOutputNode* nodes, uint32_t count, uint32_t addr) {
  for (uint32_t i = 0; i < count; ++i) {
    if (nodes[i].addr == addr) return (int32_t)i;
  }
  return -1;
}

static int32_t room_trigger_output_table_index(
    const IsaacRoomTriggerOutputTableEntry* table, uint32_t count,
    uint32_t index) {
  for (uint32_t i = 0; i < count; ++i) {
    if (table[i].index == index) return (int32_t)i;
  }
  return -1;
}

/* advance 0x00414a80 over the captured set (head = virtual slot node_count;
   the walk terminates when the advance returns the head). Returns 0 on
   success (*next_addr set), -1 when the graph leaves the capture. */
static int32_t room_trigger_output_advance(
    const IsaacRoomTriggerOutputHead* head,
    const IsaacRoomTriggerOutputNode* nodes, uint32_t node_count,
    uint32_t cur_addr, uint32_t* next_addr) {
  /* resolve addr -> node; node_count = the head slot */
  int32_t node_ci = -1;
  if (head != nullptr && cur_addr == head->addr) {
    node_ci = (int32_t)node_count;
  } else {
    node_ci = room_trigger_output_node_index(nodes, node_count, cur_addr);
  }
  if (node_ci < 0) return -1;
  /* a = node->child (+8) */
  uint32_t a_addr;
  if (node_ci == (int32_t)node_count) {
    a_addr = head->child;
  } else {
    a_addr = nodes[node_ci].child;
  }
  int32_t a_ci = -1;
  uint8_t a_flag = 0u;
  if (head != nullptr && a_addr == head->addr) {
    a_ci = (int32_t)node_count;
    a_flag = head->flag;
  } else {
    a_ci = room_trigger_output_node_index(nodes, node_count, a_addr);
    if (a_ci >= 0) a_flag = nodes[a_ci].flag;
  }
  if (a_ci < 0) return -1;
  if (a_flag == 0u) {
    /* 0x414ab1 side: c = a->next; if c->flag != 0 -> local = a; else run
       to the last flag==0 node before a flag!=0 node (0x414ac0 loop). */
    uint32_t c_addr;
    if (a_ci == (int32_t)node_count) {
      c_addr = head->next;
    } else {
      c_addr = nodes[a_ci].next;
    }
    int32_t c_ci = -1;
    uint8_t c_flag = 0u;
    if (head != nullptr && c_addr == head->addr) {
      c_ci = (int32_t)node_count;
      c_flag = head->flag;
    } else {
      c_ci = room_trigger_output_node_index(nodes, node_count, c_addr);
      if (c_ci >= 0) c_flag = nodes[c_ci].flag;
    }
    if (c_ci < 0) return -1;
    if (c_flag != 0u) {
      *next_addr = a_addr; /* 0x414ab7 jne 0x414acc, local = a */
      return 0;
    }
    uint32_t d_addr = a_addr;
    uint32_t guard = 0u;
    for (;;) {
      if (++guard > node_count + 2u) return -1; /* malformed cycle */
      uint32_t e_addr;
      if (c_ci == (int32_t)node_count) {
        e_addr = head->next;
      } else {
        e_addr = nodes[c_ci].next;
      }
      d_addr = c_addr; /* 0x414ac2 mov edi, ecx */
      c_addr = e_addr; /* 0x414ac4 mov ecx, eax */
      int32_t e_ci = -1;
      uint8_t e_flag = 0u;
      if (head != nullptr && c_addr == head->addr) {
        e_ci = (int32_t)node_count;
        e_flag = head->flag;
      } else {
        e_ci = room_trigger_output_node_index(nodes, node_count, c_addr);
        if (e_ci >= 0) e_flag = nodes[e_ci].flag;
      }
      if (e_ci < 0) return -1;
      c_ci = e_ci;
      if (e_flag != 0u) break; /* 0x414ac6 cmp byte / je loop */
      c_flag = e_flag;
    }
    *next_addr = d_addr; /* 0x414acc mov [esi], edi */
    return 0;
  }
  /* 0x414a8f side: b = node->parent; climb while node == b->child. */
  uint32_t b_addr;
  if (node_ci == (int32_t)node_count) {
    b_addr = head->parent;
  } else {
    b_addr = nodes[node_ci].parent;
  }
  uint32_t node_addr = cur_addr;
  uint32_t guard = 0u;
  for (;;) {
    if (++guard > node_count + 2u) return -1; /* malformed climb */
    int32_t b_ci = -1;
    uint8_t b_flag = 0u;
    if (head != nullptr && b_addr == head->addr) {
      b_ci = (int32_t)node_count;
      b_flag = head->flag;
    } else {
      b_ci = room_trigger_output_node_index(nodes, node_count, b_addr);
      if (b_ci >= 0) b_flag = nodes[b_ci].flag;
    }
    if (b_ci < 0) return -1;
    if (b_flag != 0u) {
      *next_addr = b_addr; /* 0x414a96 jne 0x414aaa */
      return 0;
    }
    uint32_t b_child;
    if (b_ci == (int32_t)node_count) {
      b_child = head->child;
    } else {
      b_child = nodes[b_ci].child;
    }
    if (node_addr != b_child) {
      *next_addr = b_addr; /* 0x414a9b jne 0x414aaa */
      return 0;
    }
    /* 0x414a9d mov [esi],eax ; node = b ; b = b->parent */
    node_addr = b_addr;
    if (b_ci == (int32_t)node_count) {
      b_addr = head->parent;
    } else {
      b_addr = nodes[b_ci].parent;
    }
    /* 0x414aa4 cmp byte [eax+0xd],0 / je 0x414a98 (loop) */
  }
}

extern "C" int32_t isaac_game_update_slice_room_trigger_output_walk(
    const IsaacRoomTriggerOutputHead* head,
    const IsaacRoomTriggerOutputNode* nodes, uint32_t node_count,
    const IsaacRoomTriggerOutputTableEntry* table, uint32_t table_count,
    IsaacRoomTriggerOutputWalkResult* out) {
  if (out == nullptr) return -1;
  out->valid = 0;
  out->visited = 0;
  out->dispatch = 0;
  if (head == nullptr || table == nullptr || table_count > ISAAC_ROOM_TRIGGER_OUTPUT_MAX_TABLE) {
    return -1;
  }
  if (node_count == 0u || node_count > ISAAC_ROOM_TRIGGER_OUTPUT_MAX_WALK_NODES ||
      nodes == nullptr) {
    return -1;
  }
  /* head_addr == 0 with node_count==0 handled above; sentinel sanity. */
  const uint32_t head_addr = head->addr;
  /* 0x823096 mov eax,[edx] — first node = *head; 0x82309e cmp/je skip. */
  uint32_t cur = head->next;
  uint32_t visited = 0u;
  uint32_t dispatch = 0u;
  if (cur == head_addr) {
    out->valid = 1;
    out->visited = 0;
    out->dispatch = 0;
    return 0; /* empty list: the machine skips straight to phase 2 */
  }
  uint32_t guard = 0u;
  while (cur != head_addr) { /* 0x8230be cmp / 0x8230c5 jne */
    if (++guard > 2u * node_count + 4u) return -1; /* malformed cycle */
    const int32_t ci = room_trigger_output_node_index(nodes, node_count, cur);
    if (ci < 0) return -1;
    /* 0x8230a0 mov eax,[eax+0x10] ; 0x8230a3 mov eax,[edi+eax*4+0x24] */
    const uint32_t idx = nodes[ci].f10;
    const int32_t ti = room_trigger_output_table_index(table, table_count, idx);
    if (ti < 0) return -1; /* capture cannot resolve the machine read */
    if (table[ti].value != 0u) dispatch += 1u; /* 0x8230a7 test/je + 0x8230ac */
    visited += 1u;
    /* 0x8230b1 lea ecx,[esp+0xc] ; 0x8230b5 call 0x414a80 */
    uint32_t next = 0u;
    if (room_trigger_output_advance(head, nodes, node_count, cur, &next) != 0) {
      return -1;
    }
    cur = next;
  }
  out->valid = 1;
  out->visited = visited;
  out->dispatch = dispatch;
  return (int32_t)dispatch;
}

extern "C" int32_t isaac_game_update_slice_room_trigger_output_scan(
    uint32_t arg, const IsaacRoomTriggerOutputEntryField* entries,
    uint32_t entry_count, uint32_t* match_indexes, uint32_t match_index_cap) {
  if (entry_count > ISAAC_ROOM_TRIGGER_OUTPUT_MAX_ENTRIES) return -1;
  if (entry_count != 0u && entries == nullptr) return -1;
  if (match_index_cap != 0u && match_indexes == nullptr) return -1;
  uint32_t match = 0u;
  for (uint32_t i = 0u; i < entry_count; ++i) { /* 0x823113 jb loop */
    /* FULL-DWORD gates: 0x8230e9 cmp [ecx+0x28],0x3e8 / 0x8230f2 cmp
       [ecx+0x2c],0x78 / 0x8230f8 cmp [ecx+0x450],ebx */
    if (entries[i].f28 != ISAAC_ROOM_TRIGGER_OUTPUT_MATCH_TYPE) continue;
    if (entries[i].f2c != ISAAC_ROOM_TRIGGER_OUTPUT_MATCH_VARIANT) continue;
    if (entries[i].f450 != arg) continue;
    if (match >= match_index_cap) return -1; /* overflow -> monolith */
    match_indexes[match] = i; /* the 0x823102 f173=1 store site */
    match += 1u;
  }
  return (int32_t)match; /* == host vtbl+0xc calls == f173 byte stores */
}

extern "C" int32_t isaac_game_update_slice_room_trigger_output_callbacks(
    uint32_t begin, uint32_t end) {
  if (begin == end) return 0; /* 0x823128 je 0x82313f */
  if (end < begin) return -1; /* the 0x82313d jne loop would overrun */
  const uint32_t span = end - begin;
  if ((span & 3u) != 0u) return -1; /* 4-byte fn-ptr stride */
  const uint32_t count = span >> 2;
  if (count > ISAAC_ROOM_TRIGGER_OUTPUT_MAX_CALLBACKS) return -1;
  return (int32_t)count; /* 0x823130..0x82313d host calls */
}

/* ABI v99 exports-only (idx 18, update-v114-triggeroutput-dispatch):
   FUN_00823150 gate layer. Transcribed from the instruction stream. */

extern "C" int32_t isaac_game_update_slice_823150_gate_type_c(
    uint32_t type, uint32_t field_c) {
  /* PE 0x823162 cmp eax,0xc / jne; 0x823167 cmp [ebx+0xc],4 / jae JOIN.
     FULL-DWORD type, UNSIGNED field_c < 4. */
  return (type == 0xcu && field_c < 4u) ? 1 : 0;
}

extern "C" int32_t isaac_game_update_slice_823150_gate_type_14(
    uint32_t type, uint32_t field_c) {
  /* PE 0x8231d3 cmp eax,0x14 / jne; 0x8231d8 cmp [ebx+0xc],0 / jne JOIN.
     FULL-DWORD both. */
  return (type == 0x14u && field_c == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_game_update_slice_823150_gate_type_2(
    uint32_t type, uint32_t field_c, uint32_t field_18) {
  /* PE 0x8231fa cmp eax,2 / jne; 0x8231ff cmp [ebx+0x18],0 / je JOIN;
     0x823209 cmp [ebx+0xc],1 / jne JOIN. FULL-DWORD. */
  return (type == 2u && field_18 != 0u && field_c == 1u) ? 1 : 0;
}

extern "C" int32_t isaac_game_update_slice_823150_gate_type_7(
    uint32_t type, uint32_t field_c, uint32_t field_18) {
  /* PE 0x82322f cmp eax,7 / jne; 0x823238 cmp [ebx+0x18],0 / je JOIN;
     0x823242 cmp [ebx+0xc],0 / jne JOIN. FULL-DWORD. */
  return (type == 7u && field_18 != 0u && field_c == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_game_update_slice_823150_gate_type_17(uint32_t type) {
  /* PE 0x823326 cmp eax,0x17 / jne JOIN. FULL-DWORD. */
  return (type == 0x17u) ? 1 : 0;
}

extern "C" int32_t isaac_game_update_slice_823150_type_17_field_c_eq2(
    uint32_t field_c) {
  /* PE 0x82332b cmp [ebx+0xc],2 / jne else-Play. FULL-DWORD. */
  return (field_c == 2u) ? 1 : 0;
}

static void isaac_game_update_slice_823150_dispatch_compute(
    uint32_t type, uint32_t field_c, uint32_t field_18,
    uint32_t* arm, uint32_t* host, uint32_t* store) {
  /* Cascade 0xc -> 0x14 -> 2 -> 7 -> 0x17 -> JOIN. Subtype miss JOINs
     (does not fall through to the next type). */
  if (type == 0xcu) {
    if (field_c < 4u) {
      *arm = ISAAC_GAME_UPDATE_823150_ARM_C;
      *host = ISAAC_GAME_UPDATE_823150_HOST_VCALL;
      *store = 0u;
      return;
    }
    *arm = ISAAC_GAME_UPDATE_823150_ARM_JOIN;
    *host = ISAAC_GAME_UPDATE_823150_HOST_NONE;
    *store = 0u;
    return;
  }
  if (type == 0x14u) {
    if (field_c == 0u) {
      *arm = ISAAC_GAME_UPDATE_823150_ARM_14;
      *host = ISAAC_GAME_UPDATE_823150_HOST_ANM2;
      *store = 0u;
      return;
    }
    *arm = ISAAC_GAME_UPDATE_823150_ARM_JOIN;
    *host = ISAAC_GAME_UPDATE_823150_HOST_NONE;
    *store = 0u;
    return;
  }
  if (type == 2u) {
    if (field_18 != 0u && field_c == 1u) {
      *arm = ISAAC_GAME_UPDATE_823150_ARM_2;
      *host = ISAAC_GAME_UPDATE_823150_HOST_CTOR;
      *store = 0u;
      return;
    }
    *arm = ISAAC_GAME_UPDATE_823150_ARM_JOIN;
    *host = ISAAC_GAME_UPDATE_823150_HOST_NONE;
    *store = 0u;
    return;
  }
  if (type == 7u) {
    if (field_18 != 0u && field_c == 0u) {
      *arm = ISAAC_GAME_UPDATE_823150_ARM_7;
      *host = ISAAC_GAME_UPDATE_823150_HOST_SPAWN_SFX;
      *store = 2u; /* PE 0x823311; recapture type7_store_fires */
      return;
    }
    *arm = ISAAC_GAME_UPDATE_823150_ARM_JOIN;
    *host = ISAAC_GAME_UPDATE_823150_HOST_NONE;
    *store = 0u;
    return;
  }
  if (type == 0x17u) {
    if (field_c == 2u) {
      *arm = ISAAC_GAME_UPDATE_823150_ARM_17_EQ;
      *host = ISAAC_GAME_UPDATE_823150_HOST_ANM2;
      *store = 1u;
      return;
    }
    *arm = ISAAC_GAME_UPDATE_823150_ARM_17_NE;
    *host = ISAAC_GAME_UPDATE_823150_HOST_ANM2;
    *store = 2u;
    return;
  }
  *arm = ISAAC_GAME_UPDATE_823150_ARM_JOIN;
  *host = ISAAC_GAME_UPDATE_823150_HOST_NONE;
  *store = 0u;
}

extern "C" uint32_t isaac_game_update_slice_823150_dispatch_arm(
    uint32_t type, uint32_t field_c, uint32_t field_18) {
  uint32_t arm = 0u, host = 0u, store = 0u;
  isaac_game_update_slice_823150_dispatch_compute(type, field_c, field_18,
                                                  &arm, &host, &store);
  return arm;
}

extern "C" uint32_t isaac_game_update_slice_823150_dispatch_host_kind(
    uint32_t type, uint32_t field_c, uint32_t field_18) {
  uint32_t arm = 0u, host = 0u, store = 0u;
  isaac_game_update_slice_823150_dispatch_compute(type, field_c, field_18,
                                                  &arm, &host, &store);
  return host;
}

extern "C" uint32_t isaac_game_update_slice_823150_dispatch_field_c_store(
    uint32_t type, uint32_t field_c, uint32_t field_18) {
  uint32_t arm = 0u, host = 0u, store = 0u;
  isaac_game_update_slice_823150_dispatch_compute(type, field_c, field_18,
                                                  &arm, &host, &store);
  return store;
}

extern "C" int32_t isaac_game_update_slice_823150_type7_store_fires(
    uint32_t field_c) {
  /* PE 0x82330b cmp [ecx+0xc],0 / jne JOIN. Recapture after Play.
     FULL-DWORD. */
  return (field_c == 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_game_update_slice_823150_anm2_receiver_off(void) {
  /* PE 0x8231e9 / 0x82332f lea ecx,[ebx+0x40]. */
  return 0x40u;
}

extern "C" uint32_t isaac_game_update_slice_823150_anm2_play_bool(void) {
  /* PE 0x8231e2 / 0x823332 push 0. */
  return 0u;
}

extern "C" uint32_t isaac_game_update_slice_823150_anm2_string_va(uint32_t arm) {
  /* PE 0x8231e4 push 0xb6c96c (type 0x14);
     0x823336 push 0xb60ec4 (type 0x17 field_c==2);
     0x823350 push 0xb60ecc (type 0x17 else). */
  if (arm == (uint32_t)ISAAC_GAME_UPDATE_823150_ARM_14) return 0x00b6c96cu;
  if (arm == (uint32_t)ISAAC_GAME_UPDATE_823150_ARM_17_EQ) return 0x00b60ec4u;
  if (arm == (uint32_t)ISAAC_GAME_UPDATE_823150_ARM_17_NE) return 0x00b60eccu;
  return 0u;
}

extern "C" uint32_t isaac_game_update_slice_823150_anm2_play_va(void) {
  return 0x0040a380u;
}

extern "C" uint32_t isaac_game_update_slice_823150_sfx_id(void) {
  return 0x89u;
}

extern "C" uint32_t isaac_game_update_slice_823150_sfx_vol_bits(void) {
  return 0x3f800000u;
}

extern "C" uint32_t isaac_game_update_slice_823150_sfx_delay(void) {
  return 2u;
}

extern "C" uint32_t isaac_game_update_slice_823150_sfx_loop(void) {
  return 0u;
}

extern "C" uint32_t isaac_game_update_slice_823150_sfx_pitch_bits(void) {
  return 0x3f800000u;
}

extern "C" uint32_t isaac_game_update_slice_823150_sfx_pan(void) {
  return 0u;
}

extern "C" uint32_t isaac_game_update_slice_823150_sfx_receiver_off(void) {
  /* PE 0x8232f9 lea ecx,[esi+0x2a324], esi=[0xc7169c]. */
  return 0x2a324u;
}

extern "C" uint32_t isaac_game_update_slice_823150_sfx_play_va(void) {
  return 0x0092dc30u;
}

extern "C" uint32_t isaac_game_update_slice_823150_sfx_prep_va(void) {
  return 0x00956780u;
}

extern "C" uint32_t isaac_game_update_slice_823150_spawn_type(void) {
  /* PE 0x8232a8 push 0x3e8. */
  return 0x3e8u;
}

extern "C" uint32_t isaac_game_update_slice_823150_spawn_variant(void) {
  /* PE 0x8232a6 push 0xf. */
  return 0xfu;
}

extern "C" uint32_t isaac_game_update_slice_823150_spawn_pos_vec(void) {
  /* PE 0x82327b push 0xc7b640. */
  return 0x00c7b640u;
}

extern "C" uint32_t isaac_game_update_slice_823150_spawn_va(void) {
  return 0x006fe410u;
}

extern "C" uint32_t isaac_game_update_slice_823150_host_va_ctor(void) {
  return 0x00435c70u;
}

extern "C" uint32_t isaac_game_update_slice_823150_host_va_genrand(void) {
  return 0x006eef60u;
}

extern "C" uint32_t isaac_game_update_slice_823150_host_va_714610(void) {
  return 0x00714610u;
}

extern "C" uint32_t isaac_game_update_slice_823150_vcall_off(void) {
  /* PE 0x8231c7 / 0x823223 call [vtbl+0x14]. */
  return 0x14u;
}

/* ABI v116 (idx 18 type-2 arm): FUN_00435c70 complete ctor image.
   BSS floats [0xc7b640]/[0xc7b644] are captured bit patterns. */
extern "C" uint32_t isaac_game_update_slice_435c70_va(void) {
  return 0x00435c70u;
}
extern "C" uint32_t isaac_game_update_slice_435c70_byte_len(void) {
  return 96u;
}
extern "C" uint32_t isaac_game_update_slice_435c70_struct_size(void) {
  return 0x28u;
}
extern "C" uint32_t isaac_game_update_slice_435c70_word_count(void) {
  return 10u;
}
extern "C" uint32_t isaac_game_update_slice_435c70_src_640_va(void) {
  return 0x00c7b640u;
}
extern "C" uint32_t isaac_game_update_slice_435c70_src_644_va(void) {
  return 0x00c7b644u;
}
extern "C" uint32_t isaac_game_update_slice_435c70_word(
    uint32_t index, uint32_t bits_c7b640, uint32_t bits_c7b644) {
  /* dword image: 0,0,0,0, bits640, bits644, bits640, bits644, 0, 0.
     index>=10 -> 0 (no wrap). */
  if (index >= 10u) return 0u;
  if (index == 4u || index == 6u) return bits_c7b640;
  if (index == 5u || index == 7u) return bits_c7b644;
  return 0u;
}


static_assert(sizeof(IsaacRoomTriggerOutputNode) == 24,
              "IsaacRoomTriggerOutputNode ABI changed");
static_assert(sizeof(IsaacRoomTriggerOutputHead) == 20,
              "IsaacRoomTriggerOutputHead ABI changed");
static_assert(sizeof(IsaacRoomTriggerOutputTableEntry) == 8,
              "IsaacRoomTriggerOutputTableEntry ABI changed");
static_assert(sizeof(IsaacRoomTriggerOutputEntryField) == 12,
              "IsaacRoomTriggerOutputEntryField ABI changed");
static_assert(sizeof(IsaacRoomTriggerOutputWalkResult) == 12,
              "IsaacRoomTriggerOutputWalkResult ABI changed");
static_assert(offsetof(IsaacRoomTriggerOutputWalkResult, dispatch) == 8,
              "IsaacRoomTriggerOutputWalkResult dispatch offset");

/* ==================================================================== */
/* ABI v95 (record idx 42 opaqueRoomUpdateTailPath): B19 path rebuild +
   B20 trail-list record wire laws. Room-family laws consumed BY REFERENCE
   (B19 v30 / B20 v31-v32) — delegation equals the room transcriptions. */

/* B19 rebuild decision (PE 0x008055a7 cmp byte [Room+0x7769],0 / je B20):
   LOW-BYTE test of the PRE-clear flag; 1 = rebuild body must host. */
extern "C" int32_t isaac_game_update_slice_b19_rebuild_decision(
    uint32_t room_flag_7769) {
  return isaac_room_b19_needs_path_rebuild_host(room_flag_7769);
}

/* ABI v99 leaf peel (idx 42): B19 rebuild-body islands. Transcribed from
   the instruction stream. 0x72fe80 / 0x7f0800 / pedestal stay typed-host. */
extern "C" int32_t isaac_game_update_slice_b19_query_al_proceed(
    uint32_t query_al) {
  /* PE 0x80570e test al,al / jne 0x80576e. LOW-BYTE. */
  return ((query_al & 0xffu) == 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_game_update_slice_b19_flags168_clear_bit(
    uint32_t flags168) {
  /* PE 0x805718 and dword [esi+0x168], 0xfff7ffff. FULL-DWORD. */
  return flags168 & 0xfff7ffffu;
}

extern "C" int32_t isaac_game_update_slice_b19_cell_buf_in_range(
    uint32_t idx) {
  /* PE 0x805e6e cmp edi,0x1c0 / jae 0x8068db. UNSIGNED. */
  return (idx < 0x1c0u) ? 1 : 0;
}

extern "C" uint32_t isaac_game_update_slice_b19_type10_y_nudge(
    uint32_t room_type_8, uint32_t y_bits) {
  /* PE 0x805db3 cmp dword [esi+8],0x10 / jne 0x805de1. FULL-DWORD.
     0x805dc1/0x805dc9 addss [0xbaa8d0] = 0x41f00000 (30.0f). */
  if (room_type_8 != 0x10u) {
    return y_bits;
  }
  const float y = __builtin_bit_cast(float, y_bits);
  const float nudged = y + 30.0f;
  return __builtin_bit_cast(uint32_t, nudged);
}

extern "C" uint32_t isaac_game_update_slice_b19_host_va_get_grid_collision(
    void) {
  /* ZHL Room::GetGridCollision. */
  return 0x007f0800u;
}

extern "C" uint32_t isaac_game_update_slice_b19_host_va_query_8000(void) {
  /* Address-stable (no ZHL). PE 0x805706 call 0x72fe80. */
  return 0x0072fe80u;
}

extern "C" uint32_t isaac_game_update_slice_b19_host_va_get_alt_pedestal(
    void) {
  /* ZHL Entity_Pickup::GetAlternatePedestal. */
  return 0x006e1d70u;
}

extern "C" uint32_t isaac_game_update_slice_b19_host_va_set_alt_pedestal(
    void) {
  /* ZHL Entity_Pickup::SetAlternatePedestal. */
  return 0x006e1a80u;
}

/* ABI v99 exports-only (idx 42, update-v113-tailpath-b19b20): leftover
   B19/B20 islands. Transcribed from the instruction stream. Tree alloc
   0xa0f4c0 / spawn 0x428b20 / vector 0x42c920 / SEH 0xaef12b stay host. */

extern "C" int32_t isaac_game_update_slice_b19_entity_present(
    uint32_t entity_ptr) {
  /* PE 0x805649 test esi,esi / je 0x805764. FULL-DWORD. */
  return (entity_ptr != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_game_update_slice_b19_spawn_ptr_live(
    uint32_t spawn_ptr) {
  /* PE 0x805de7 test edx,edx / jne 0x805e01; else fatal 0xa112c0.
     FULL-DWORD. 0 = fatal arm, 1 = spawn 0x428b20. */
  return (spawn_ptr != 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_game_update_slice_b19_fatal_level(void) {
  /* PE 0x805df0 push 0x10. */
  return 0x10u;
}

extern "C" uint32_t isaac_game_update_slice_b19_fatal_string_va(void) {
  /* PE 0x805deb push 0xb6bf54. */
  return 0x00b6bf54u;
}

extern "C" int32_t isaac_game_update_slice_b19_field528_gt0(
    int32_t field_528) {
  /* PE 0x805f80 test eax,eax / jle 0x80600b. SIGNED > 0 enters
     0x4288a0 / 0x6eed30 / 0x5cc710. */
  return (field_528 > 0) ? 1 : 0;
}

extern "C" int32_t isaac_game_update_slice_b20_vector_inplace(
    uint32_t vec_end, uint32_t vec_cap) {
  /* PE 0x806105 cmp edi,ecx / je 0x806116 (grow 0x42c920).
     FULL-DWORD. 1 = in-place store, 0 = host grow. */
  return (vec_end != vec_cap) ? 1 : 0;
}

extern "C" int32_t isaac_game_update_slice_b20_spawn_result_live(
    uint32_t spawn_ptr) {
  /* PE 0x8067e8 test ecx,ecx / je 0x80680e. FULL-DWORD.
     1 = |0x80 post, 0 = skip. */
  return (spawn_ptr != 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_game_update_slice_b19_host_va_fatal(void) {
  return 0x00a112c0u;
}

extern "C" uint32_t isaac_game_update_slice_b19_host_va_4288a0(void) {
  return 0x004288a0u;
}

extern "C" uint32_t isaac_game_update_slice_b19_host_va_6eed30(void) {
  return 0x006eed30u;
}

extern "C" uint32_t isaac_game_update_slice_b19_host_va_5cc710(void) {
  return 0x005cc710u;
}

extern "C" uint32_t isaac_game_update_slice_b19_host_va_42c8e0(void) {
  return 0x0042c8e0u;
}

extern "C" uint32_t isaac_game_update_slice_b20_host_va_802740(void) {
  return 0x00802740u;
}

extern "C" uint32_t isaac_game_update_slice_b20_host_va_42c920(void) {
  return 0x0042c920u;
}


/* One-iteration B20 trail-loop frame law (0x0080608e..0x00806880). Per
   captured entity: pass1 type filter -> |0x4000 post + host push; pass2
   action route (FLAGGED / PAIR_X / PAIR_Y / DEFAULT) -> spawn |0x80 post
   + host spawn; FLAGGED -> multi-spawn enter (field_3c0==0) + chain
   continue gate + host genrand arm; pair offsets (60.0/30.0 f32 bits). */
extern "C" void isaac_game_update_slice_b20_trail_frame(
    uint32_t entity_type_28, uint32_t entity_flags_16c, uint32_t field_3c0,
    uint32_t child_ptr_3bc, uint32_t child_type_28, uint32_t mode_26614,
    uint32_t pos_x_bits, uint32_t pos_y_bits,
    IsaacGameUpdateSliceB20TrailFrame* out) {
  if (out == nullptr) return;
  IsaacGameUpdateSliceB20TrailFrame f = {};
  const int32_t type = static_cast<int32_t>(entity_type_28);
  f.pass1_match = isaac_room_b20_pass1_type_match(type);
  f.flag_or_4000 = isaac_room_b20_flag_or_4000(entity_flags_16c);
  f.pass2_action = isaac_room_b20_pass2_action(entity_flags_16c, type);
  f.spawn_flag_or_80 = isaac_room_b20_spawn_flag_or_80(entity_flags_16c);
  f.host_push = f.pass1_match;
  /* Every pass2 action spawns at least one entity (PAIR_X/PAIR_Y/DEFAULT
     exactly one 0x428b20 call; FLAGGED spawns through the chain). */
  f.host_spawn = 1;
  if (f.pass2_action == ISAAC_ROOM_B20_ACTION_FLAGGED) {
    f.multispawn_enter = isaac_room_b20_flagged_multispawn_enter(field_3c0);
    f.chain_continue = isaac_room_b20_chain_continue(
        child_ptr_3bc, static_cast<int32_t>(mode_26614),
        static_cast<int32_t>(child_type_28));
    f.host_genrand = 1; /* 0x6eef60 + sin/cos arm */
  } else if (f.pass2_action == ISAAC_ROOM_B20_ACTION_DEFAULT) {
    f.host_genrand = 1; /* default RNG offset draws 0x6eef60 */
  }
  /* Pair ±offset pure posts (PE 0x806717/0x80678e ±60.0, 0x806525/0x806590
     ±30.0). Computed unconditionally; the host consumer picks per action. */
  {
    const float px = __builtin_bit_cast(float, pos_x_bits);
    const float py = __builtin_bit_cast(float, pos_y_bits);
    IsaacRoomB20Pos2 pos = {};
    isaac_room_b20_pair_x_left(px, py, &pos);
    f.pair_x_left_bits = __builtin_bit_cast(uint32_t, pos.x);
    isaac_room_b20_pair_x_right(px, py, &pos);
    f.pair_x_right_bits = __builtin_bit_cast(uint32_t, pos.x);
    isaac_room_b20_pair_y_up(px, py, &pos);
    f.pair_y_up_bits = __builtin_bit_cast(uint32_t, pos.y);
    isaac_room_b20_pair_y_down(px, py, &pos);
    f.pair_y_down_bits = __builtin_bit_cast(uint32_t, pos.y);
  }
  *out = f;
}

/* Record wire decide: flag_ready (B19) -> list gate (B20) -> count -> loop
   walk. ready=0 -> MONOLITHIC (pre-v95 exact). B19 flag low byte 0 -> NONE
   (B20 may still host); B20 begin==end -> NONE. host_genrand_draws =
   host-reported draws (capped at entry_capacity; one draw arm max per
   entity, the host counts the real draw stream inside the bodies). */
extern "C" void isaac_game_update_slice_tail_path_wire(
    uint32_t flag_ready, uint32_t room_flag_7769,
    uint32_t list_begin_c82674, uint32_t list_end_c82678,
    uint32_t mode_26614, uint32_t host_genrand_draws,
    const IsaacGameUpdateSliceTailPathEntry* entries, uint32_t entry_capacity,
    IsaacGameUpdateSliceTailPathPlan* out) {
  if (out == nullptr) return;
  IsaacGameUpdateSliceTailPathPlan p = {};
  uint32_t draws = host_genrand_draws;
  const uint32_t cap = entry_capacity;
  if (draws > cap) draws = cap;
  p.host_genrand_draws = draws;
  if (flag_ready == 0) {
    p.b19_residual_kind = ISAAC_ROOM_B19_RESIDUAL_MONOLITHIC;
    p.b20_residual_kind = ISAAC_ROOM_B20_RESIDUAL_MONOLITHIC;
    *out = p;
    return;
  }
  /* B19: PE 0x008055a7 cmp byte / je — LOW-BYTE flag gate. */
  if (isaac_room_b19_needs_path_rebuild_host(room_flag_7769) != 0) {
    p.b19_residual_kind = ISAAC_ROOM_B19_RESIDUAL_HOST_REBUILD;
    p.host_rebuild = 1u;
  } else {
    p.b19_residual_kind = ISAAC_ROOM_B19_RESIDUAL_NONE;
  }
  /* B20: PE 0x0080608e cmp [begin],[end] / je epilogue. */
  if (list_begin_c82674 == list_end_c82678) {
    p.b20_residual_kind = ISAAC_ROOM_B20_RESIDUAL_NONE;
    *out = p;
    return;
  }
  p.b20_residual_kind = ISAAC_ROOM_B20_RESIDUAL_HOST_TRAIL;
  p.host_trail = 1u;
  const int32_t list_count = isaac_room_b20_list_count(
      list_begin_c82674, list_end_c82678);
  p.list_count = list_count;
  if (list_count <= 0 || entries == nullptr) {
    /* begin != end but (int32)(end-begin)>>2 == 0: PE still runs the
       SEH/local-vector setup + free (no B18-style empty pure-complete). */
    p.host_deallocate = 1u;
    *out = p;
    return;
  }
  uint32_t n = static_cast<uint32_t>(list_count);
  if (n > static_cast<uint32_t>(ISAAC_GAME_UPDATE_TAIL_PATH_MAX_NODES)) {
    n = static_cast<uint32_t>(ISAAC_GAME_UPDATE_TAIL_PATH_MAX_NODES);
  }
  if (n > cap) n = cap;
  uint32_t multispawn = 0;
  for (uint32_t i = 0; i < n; ++i) {
    IsaacGameUpdateSliceB20TrailFrame f = {};
    isaac_game_update_slice_b20_trail_frame(
        entries[i].type_28, entries[i].flags_16c, entries[i].field_3c0,
        entries[i].child_3bc, entries[i].child_type_28, mode_26614,
        entries[i].pos_x_bits, entries[i].pos_y_bits, &f);
    p.pure_steps = static_cast<int32_t>(i) + 1;
    p.host_push += static_cast<uint32_t>(f.host_push);
    p.host_spawn += static_cast<uint32_t>(f.host_spawn);
    /* FLAGGED + field_3c0==0 -> the multi-spawn CHAIN body runs (host
       walks the live children; the enter gate is in-module). */
    if (f.multispawn_enter != 0) {
      multispawn += 1;
    }
  }
  p.host_multispawn_steps = multispawn;
  p.host_deallocate = 1u; /* trail vector free 0x40c740 runs on this arm */
  *out = p;
}

/* ABI v96 (record idx 12/20/21/46): new struct ABI pins (pack 1). */
static_assert(sizeof(IsaacGameUpdateSlice705ee0CallOrder) == 32,
              "IsaacGameUpdateSlice705ee0CallOrder ABI changed");
static_assert(sizeof(IsaacGameUpdateSliceSfxPlayContinuation) == 24,
              "IsaacGameUpdateSliceSfxPlayContinuation ABI changed");
static_assert(sizeof(IsaacGameUpdateSlice705ee0WritePlan) == 32,
              "IsaacGameUpdateSlice705ee0WritePlan ABI changed");
static_assert(sizeof(IsaacGameUpdateSlice4212c0TrueProbePrefixPlan) == 48,
              "IsaacGameUpdateSlice4212c0TrueProbePrefixPlan ABI changed");
static_assert(sizeof(IsaacGameUpdateSlice8318a0SfxManagerStoreApplyPlan) == 148,
              "IsaacGameUpdateSlice8318a0SfxManagerStoreApplyPlan ABI changed");
