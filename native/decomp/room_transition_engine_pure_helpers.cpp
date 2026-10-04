/* ============================================================================
   RECONSTRUCTED v11 - 2026-08-10 (rte-restore unit).

   The ABI-v11 implementation of this TU was clobbered to 0 bytes at 14:50:33
   by a concurrent edit (open('w') OSError mid-write; .bak-v11 is a copy of
   the EMPTY file). The header, the JS oracle and the test file survived and
   encode every law. This file reconstructs all 73 exports by translating the
   oracle (scripts/decomp/room-transition-engine-pure-model.mjs) export by
   export, with the v1..v5 surface taken from the v4-era restore (which still
   compiles against the v11 header) and the v5 007abe20 trio re-verified.

   Translations are law-for-law from the JS model; PE comments cite the exact
   instruction VAs. uint32_t/int32_t parameters only - no uint8_t scalars
   (Wasm ABI never narrows i32 arguments; -O2 would delete an in-body mask).

   v7/D1 correction carried from the model: DAT_00c7b640 / DAT_00c7b644 are
   UNINITIALISED .data (zero at load), NOT the .reloc-derived bit patterns
   pinned through v6 - so both slots are +0.0f for the process lifetime and
   the exports use ISAAC_ROOM_TRANSITION_ENGINE_C7B640_BITS /
   ISAAC_ROOM_TRANSITION_ENGINE_C7B644_BITS (both 0).
   ============================================================================
*/

#include "room_transition_engine_pure_helpers.h"

#include <stddef.h>
#include <stdint.h>

/* Compile-time no-narrow-param guard list. Every exported prototype in the
   header is named here (the test re-parses the header and requires the guard
   set to cover 100% of exports). The expansion itself only proves the symbol
   exists; the parameter-type audit is the header scan in the test. */
#define ISAAC_RTE_NO_NARROW_PARAMS(fn)                                        \
  static_assert(&fn != nullptr, "no narrow scalar parameters in " #fn);

ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_82ee40_player_count)
// ---- v21 POST cluster ----
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_42a250_eq3_check)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_42a260_value_getter)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_42a270_chain_value)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_42a270_used_fallback)
// ---- v22 POOL cluster ----
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_42a290_accepts)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_42a2c0_non_null)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_42a310_value_getter)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_42a320_byte_getter)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_42a330_field_getter)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_42a340_field_getter)
// ---- v23 ----
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_42b020_contains)
// ---- v24 PAIR ----
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_42b340_contains)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_42b430_contains)
// ---- v25 ----
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_42b480_contains)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_42b550_field_getter)
// ---- v26 ----
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_42b940_store_5c)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_42b940_store_58)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_42b940_store_60)
// ---- v32 ----
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_42c700_value_plus8)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_42c710_ne_check)
// ---- v33 ----
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_42c7f0_elem_count)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_42d040_conditional_getter)
// ---- v34 ----
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_42c810_elem_addr)
// ---- v34 ----
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_42c810_elem_addr)
// ---- v31 ----
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_42c6e0_popped)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_42c6e0_advanced)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_82ee40_player_loop_enter)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_82ee40_player_loop_step)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_82ee40_player_loop_continue)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_82ee40_player_entry_eligible)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_82ee40_early_skip_setup)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_82ee40_needs_anm2_load)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_82ee40_rewrite_slot)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_82ee40_effective_dim)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_82ee40_apply_setup)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_82ee40_apply_start_state)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_82ee40_needs_anim12_sfx)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_82ee40_anim12_sfx_id)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_82ee40_player_entry_float_reset)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_82eb90_predicate)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_player_loop_needs_host)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_82ee40_7abcc0_needed)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_82ee40_7abcc0_arg)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_82ee40_7abe20_needed)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_82ee40_player_call_plan)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_7abe20_rewind_needed)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_7abe20_rewind_decision)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_7abe20_store_plan)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_7abcc0_param2)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_7abcc0_sfx_needed)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_7abcc0_plan)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_sfx_play_pack)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_c7b640_bits)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_c7b644_bits)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_82ee40_player_loop_end_used)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_82ee40_player_loop_step_exact)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_82ee40_loop_game_source)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_82ee40_anim12_sfx_id_from_args)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_82ee40_tail_plan)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_82ee40_entry_log_pack)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_82ee40_anm2_string_plan)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_82ee40_anm2_string_needs_release)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_82ee40_anm2_string_release_size)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_40a5d0_search_enter)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_40a5d0_name_ptr)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_40a5d0_loop_continue)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_40a5d0_entry_ptr)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_40a5d0_receiver)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_40a5d0_match_callee)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_40a5d0_return_eax)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_40a5d0_strcmp)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_40a5d0_lookup)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_40a5d0_warn_pack)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_animstate_alloc_size)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_animstate_memset_size)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_animstate_free_block_ptr)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_animstate_stats_block)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_408830_count_gate)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_408830_plan)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_408970_count_sample)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_408970_arm_select)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_408970_copy_needed)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_408970_copy_size)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_408970_arm_plan)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_408970_plan)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_animstate_seh_pack)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_animstate_seh_unwind_terminates)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_7abe20_408830_call_pack)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_7abe20_408830_pure_complete)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_82ee40_setup_store_plan)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_82ee40_frame_pack)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_7abe20_receivers)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_7abe20_nested_830_needed)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_7abe20_body_plan)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_82ee40_player_reset_index_after)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_82ee40_player_reset_store_plan)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_82ee40_player_reset_plan)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_pure_helpers_abi_version)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_408c90_plan)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_40a1b0_zero_plan)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_40a1b0_rewind_plan)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_956780_gate)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_956780_xorshift)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_956780_mod20)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_956780_remap_id)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_956780_plan)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_4288a0_lookup)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_4288f0_copy)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_428910_copy)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_428940_xorshift)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_428940_plan)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_428a80_bit_plan)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_428a50_field_getter)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_428a60_field_getter)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_428a70_value_getter)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_428930_field_getter)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_428ae0_clamp_value)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_428b10_value_getter)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_428b50_field_getter)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_428cd0_field_getter)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_429550_ge2_check)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_429560_eq4_check)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_429f20_float_constant)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_42a020_zero_store)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_42a040_found_gate)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_42a040_key_ge_field10)
ISAAC_RTE_NO_NARROW_PARAMS(isaac_room_transition_engine_42a040_bound_flag)

/* ============================================================================
   v1 - FUN_0082ee40 pure islands (VA 0x0082ee40, ret 0x14).
   ==========================================================================*/

extern "C" int32_t isaac_room_transition_engine_82ee40_early_skip_setup(
    int32_t gate_1ba78, int32_t anim) {
  /* cmp dword [Game+0x1ba78], 0; je setup
     cmp anim, 0xf; jne epilog - full-word compares. */
  if (gate_1ba78 != 0 && anim != 0xf) {
    return 1;
  }
  return 0;
}

extern "C" int32_t isaac_room_transition_engine_82ee40_needs_anm2_load(
    uint32_t field_141_byte) {
  /* cmp byte [this+0x141], 0; jne skip_anm2 - a BYTE gate. */
  return (field_141_byte & 0xffu) == 0u ? 1 : 0;
}

extern "C" int32_t isaac_room_transition_engine_82ee40_rewrite_slot(
    int32_t room, int32_t arg2, int32_t dim, int32_t game_18304,
    int32_t game_1830c) {
  /* Same-room/same-dim slot rewrite to -1 (VA ~0x0082ef60). */
  if (room == game_18304 && dim == game_1830c) {
    return -1;
  }
  return arg2;
}

extern "C" int32_t isaac_room_transition_engine_82ee40_effective_dim(
    int32_t dim, int32_t game_1830c) {
  /* test eax,eax; jns keep; mov eax, [Game+0x1830c] - SIGNED. */
  if (dim < 0) {
    return game_1830c;
  }
  return dim;
}

extern "C" void isaac_room_transition_engine_82ee40_apply_setup(
    IsaacRoomTransitionEngineSetup* state, int32_t room, int32_t slot,
    int32_t anim, int32_t effective_dim) {
  if (state == nullptr) {
    return;
  }
  /* VA 0x0082efae..0x0082efef (excludes Game+0x1bb74 = player host write). */
  state->field_14 = room;
  state->field_4 = 0;
  state->field_1c = anim;
  state->field_10 = slot;
  state->field_238 = 0;
  state->field_20 = 0;
  state->field_24 = 0;
  state->field_18 = effective_dim;
}

extern "C" void isaac_room_transition_engine_82ee40_apply_start_state(
    IsaacRoomTransitionEngineStart* state, int32_t anim, int32_t slot) {
  if (state == nullptr) {
    return;
  }
  /* v7/D1: the two floats at DAT_00c7b640 / DAT_00c7b644 are zero-at-load
     .data (+0.0f, raw bits 0) - never the v1..v6 .reloc-derived patterns. */
  const float f22c =
      __builtin_bit_cast(float, ISAAC_ROOM_TRANSITION_ENGINE_C7B640_BITS);
  const float f230 =
      __builtin_bit_cast(float, ISAAC_ROOM_TRANSITION_ENGINE_C7B644_BITS);

  state->field_0 = 1;
  if (anim == 2) {
    state->field_8 = 0x1e;
  } else {
    state->field_8 = (slot == -1) ? 3 : 7;
  }
  state->field_c = 0;
  state->field_22c = f22c;
  state->field_230 = f230;
}

extern "C" int32_t isaac_room_transition_engine_82ee40_needs_anim12_sfx(
    int32_t anim) {
  /* cmp edx, 0x12 on non-anim2 path; anim2 path jumps over this check */
  return anim == 0x12 ? 1 : 0;
}

extern "C" int32_t isaac_room_transition_engine_82ee40_anim12_sfx_id(
    int32_t dim) {
  /* xor eax,eax; cmp [ebx+0x18],1; setne al; add eax,0x260 */
  return (dim == 1) ? 0x260 : 0x261;
}

extern "C" void isaac_room_transition_engine_82ee40_player_entry_float_reset(
    float* field_360, float* field_364, uint8_t* field_410) {
  /* v7/D1: +0.0f, raw bits 0 - see apply_start_state. */
  const float f360 =
      __builtin_bit_cast(float, ISAAC_ROOM_TRANSITION_ENGINE_C7B640_BITS);
  const float f364 =
      __builtin_bit_cast(float, ISAAC_ROOM_TRANSITION_ENGINE_C7B644_BITS);
  if (field_360 != nullptr) {
    *field_360 = f360;
  }
  if (field_364 != nullptr) {
    *field_364 = f364;
  }
  if (field_410 != nullptr) {
    *field_410 = 0;
  }
}

extern "C" int32_t isaac_room_transition_engine_82eb90_predicate(int32_t field_1c) {
  /* VA 0x0082eb90: cmp field_1c against 3 / 0xc / 0xd / 0xb -> AL=1 else 0. */
  if (field_1c == 3 || field_1c == 0xc || field_1c == 0xd || field_1c == 0xb) {
    return 1;
  }
  return 0;
}

extern "C" int32_t isaac_room_transition_engine_player_loop_needs_host(
    int32_t field_1c) {
  /* Host residual for the 7abcc0 path when 82eb90 true (entry+0x173 gate
     inside host), or the 7abe20 path when !82eb90 && field_1c == 0x14. */
  if (isaac_room_transition_engine_82eb90_predicate(field_1c) != 0) {
    return 1;
  }
  if (field_1c == 0x14) {
    return 1;
  }
  return 0;
}

/* ---- v3: PE-exact player loop control flow (correctness fix) ---- */

extern "C" int32_t isaac_room_transition_engine_82ee40_player_count(
    uint32_t begin, uint32_t end) {
  /* PE: sub eax,[esi]; sar eax,2 - arithmetic shift on the wrapped byte
     difference, exactly ((end>>>0)-(begin>>>0))|0 then >>2. */
  const int32_t bytes = static_cast<int32_t>(end - begin);
  return bytes >> 2;
}

extern "C" int32_t isaac_room_transition_engine_82ee40_player_loop_enter(
    int32_t count) {
  /* PE 0x0082f005: test eax,eax; je 0x0082f0d4 - only zero skips. */
  return count != 0 ? 1 : 0;
}

extern "C" void isaac_room_transition_engine_82ee40_player_loop_step(
    int32_t index, uint32_t begin, uint32_t end,
    IsaacRoomTransitionEnginePlayerLoopStep* out) {
  if (out == nullptr) return;
  const int32_t count =
      isaac_room_transition_engine_82ee40_player_count(begin, end);
  out->count = count;
  out->index = index;
  /* PE 0x0082f01a: test eax,eax; jne - zero takes the fatal log and re-reads. */
  out->fatal_needed = count == 0 ? 1 : 0;
  /* PE 0x0082f040: cmp eax,ecx; jae 0x0082f047 - UNSIGNED. When it is taken
     the `lea` is skipped and `begin` itself is dereferenced, so the loop reads
     element 0. Latent original defect, reproduced deliberately. */
  const int32_t clamped =
      static_cast<uint32_t>(index) >= static_cast<uint32_t>(count) ? 1 : 0;
  out->clamped_to_first = clamped;
  out->element_ptr =
      clamped != 0
          ? begin
          : begin + static_cast<uint32_t>(index) *
                        uint32_t(ISAAC_ROOM_TRANSITION_ENGINE_PLAYER_ELEM_STRIDE);
  out->index_after = static_cast<int32_t>(static_cast<uint32_t>(index) + 1u);
}

extern "C" int32_t isaac_room_transition_engine_82ee40_player_loop_continue(
    int32_t index_after, uint32_t begin_after, uint32_t end_after) {
  /* The bound is re-derived at 0x0082f0c3 from the vector as it stands AFTER
     the body's host calls, then compared with `jb` - unsigned and strict. */
  const int32_t count =
      isaac_room_transition_engine_82ee40_player_count(begin_after, end_after);
  return static_cast<uint32_t>(index_after) < static_cast<uint32_t>(count) ? 1
                                                                          : 0;
}

extern "C" int32_t isaac_room_transition_engine_82ee40_player_entry_eligible(
    int32_t field_2c) {
  /* PE 0x0082f049: cmp dword [esi+0x2c],0; jne 0x0082f0b9 (skip body). */
  return field_2c == 0 ? 1 : 0;
}

/* ---- v4: in-loop host-call selection (0x0082f04f ... 0x0082f089) ---- */

extern "C" int32_t isaac_room_transition_engine_82ee40_7abcc0_needed(
    int32_t predicate, uint32_t entry_173_byte) {
  /* 0x0082f056 test al,al / je 0x82f077; 0x0082f05a cmp byte [esi+0x173],0
     / jne 0x82f077. entry+0x173 is a BYTE test: mask the word input. */
  if (predicate != 0 && (entry_173_byte & 0xffu) == 0u) {
    return 1;
  }
  return 0;
}

extern "C" int32_t isaac_room_transition_engine_82ee40_7abcc0_arg(
    int32_t anim) {
  /* 0x0082f063 cmp dword [ebx+0x10],0xb; setne al; movzx eax,al - full-word
     compare, result strictly 0 or 1. */
  return anim != 0xb ? 1 : 0;
}

extern "C" int32_t isaac_room_transition_engine_82ee40_7abe20_needed(
    int32_t field_1c) {
  /* 0x0082f077 cmp dword [edi+0x1c],0x14; jne 0x82f08f. Full-word compare;
     reached from !pred and from pred && entry+0x173 != 0. */
  return field_1c == 0x14 ? 1 : 0;
}

extern "C" void isaac_room_transition_engine_82ee40_player_call_plan(
    int32_t predicate, uint32_t entry_173_byte, int32_t field_1c,
    int32_t anim, IsaacRoomTransitionEnginePlayerCallPlan* out) {
  if (out == nullptr) return;
  const int32_t call_abcc0 =
      isaac_room_transition_engine_82ee40_7abcc0_needed(predicate,
                                                        entry_173_byte);
  const int32_t call_abe20 =
      isaac_room_transition_engine_82ee40_7abe20_needed(field_1c);
  out->call_7abcc0 = call_abcc0;
  out->arg_7abcc0 = isaac_room_transition_engine_82ee40_7abcc0_arg(anim);
  out->call_7abe20 = call_abe20;
  /* 0x0082f089 `mov edx,[0xc71678]` runs on the two host-call paths only
     (jmp 0x82f089 target / 7abe20 fall-through); the no-call path jumps to
     0x0082f08f with the stale pre-body Game pointer. */
  out->game_reread = (call_abcc0 != 0 || call_abe20 != 0) ? 1 : 0;
}


/* ---------------------------------------------------------------------------
   v5 - FUN_007abe20 per-entry body pure core (0x007abe20..0x007abe83).
   Stores in PE order; the 0x40a5d0 host result is a BYTE gate.
   ------------------------------------------------------------------------- */

extern "C" int32_t isaac_room_transition_engine_7abe20_rewind_needed(
    uint32_t a5d0_result_byte) {
  /* 0x007abe5e `test al,al`: the PE tests the LOW BYTE of the 0x40a5d0
     result. uint32_t parameter + explicit mask - a uint8_t parameter would
     let -O2 delete the mask (Wasm ABI never narrows i32 args). */
  return (a5d0_result_byte & 0xffu) != 0u ? 1 : 0;
}

extern "C" void isaac_room_transition_engine_7abe20_rewind_decision(
    uint32_t a5d0_result_byte, IsaacRoomTransitionEngine7abe20RewindDecision* out) {
  if (out == nullptr) return;
  const int32_t rewind =
      isaac_room_transition_engine_7abe20_rewind_needed(a5d0_result_byte);
  /* PE runs Rewind AND the 0x8c store on the same path; there is no store
     instruction at all on the AL==0 path, so store_8c mirrors rewind. */
  out->rewind_needed = rewind;
  out->store_8c = rewind;
}

extern "C" void isaac_room_transition_engine_7abe20_store_plan(
    IsaacRoomTransitionEngine7abe20StorePlan* out) {
  if (out == nullptr) return;
  /* PE order: 139a(h)->407f10->14c->408830->40a5d0->[8c]->139a(t)->1398.
     STATIC plan: the only conditional store is 0x8c (gated=1); the runtime
     RewindDecision fires it on the AL!=0 path only. */
  out->stores[0].offset = ISAAC_ROOM_TRANSITION_ENGINE_ENTRY_139A_OFF;
  out->stores[0].value = 0u;
  out->stores[0].pe_va = ISAAC_ROOM_TRANSITION_ENGINE_STORE_VA_139A_HEAD;
  out->stores[0].width = 1u;
  out->stores[0].gated = 0u;

  out->stores[1].offset = ISAAC_ROOM_TRANSITION_ENGINE_ENTRY_14C_OFF;
  out->stores[1].value = 0x3f800000u; /* float 1.0 raw bits */
  out->stores[1].pe_va = ISAAC_ROOM_TRANSITION_ENGINE_STORE_VA_14C;
  out->stores[1].width = 4u;
  out->stores[1].gated = 0u;

  out->stores[2].offset = ISAAC_ROOM_TRANSITION_ENGINE_ENTRY_8C_OFF;
  out->stores[2].value = 1u;
  out->stores[2].pe_va = ISAAC_ROOM_TRANSITION_ENGINE_STORE_VA_8C;
  out->stores[2].width = 1u;
  out->stores[2].gated = 1u; /* the one conditional store of the body */

  out->stores[3].offset = ISAAC_ROOM_TRANSITION_ENGINE_ENTRY_139A_OFF;
  out->stores[3].value = 0u;
  out->stores[3].pe_va = ISAAC_ROOM_TRANSITION_ENGINE_STORE_VA_139A_TAIL;
  out->stores[3].width = 1u;
  out->stores[3].gated = 0u;

  out->stores[4].offset = ISAAC_ROOM_TRANSITION_ENGINE_ENTRY_1398_OFF;
  out->stores[4].value = 1u;
  out->stores[4].pe_va = ISAAC_ROOM_TRANSITION_ENGINE_STORE_VA_1398;
  out->stores[4].width = 1u;
  out->stores[4].gated = 0u;
}

/* ---------------------------------------------------------------------------
   v6 - FUN_007abcc0 pure shell + the shared SFXManager::Play pack.
   ------------------------------------------------------------------------- */

extern "C" uint32_t isaac_room_transition_engine_7abcc0_param2(
    uint32_t arg_byte) {
  /* 0x007abcd5 CMOVZ on the LOW BYTE: bl == 0 -> 0xb1e010 ("TeleportUp"),
     bl != 0 -> 0xb1dff0 ("TeleportDown"). Never pre-mask the caller side. */
  return (arg_byte & 0xffu) == 0u
             ? ISAAC_ROOM_TRANSITION_ENGINE_PARAM2_7ABCC0_ARGZERO
             : ISAAC_ROOM_TRANSITION_ENGINE_PARAM2_7ABCC0_ARGNONZERO;
}

extern "C" int32_t isaac_room_transition_engine_7abcc0_sfx_needed(
    uint32_t arg_byte) {
  /* 0x007abcde `test bl,bl; je`: SFX block runs iff low byte != 0. */
  return (arg_byte & 0xffu) != 0u ? 1 : 0;
}

extern "C" void isaac_room_transition_engine_7abcc0_plan(
    uint32_t arg_byte, IsaacRoomTransitionEngine7abcc0Plan* out) {
  if (out == nullptr) return;
  out->param2 = isaac_room_transition_engine_7abcc0_param2(arg_byte);
  out->sfx_needed = isaac_room_transition_engine_7abcc0_sfx_needed(arg_byte);
  /* 0x007abceb: pre-prep const input to the host prep 0x00956780. */
  out->sfx_id = ISAAC_ROOM_TRANSITION_ENGINE_SFX_ID_7ABCC0;
}

extern "C" void isaac_room_transition_engine_sfx_play_pack(
    IsaacRoomTransitionEngineSfxPlayPack* out) {
  if (out == nullptr) return;
  /* Shared SFXManager::Play residual pack (engine H3 0x0082f154..0x82f19a +
     7abcc0 block). Receiver = [0x00c7169c] + 0x2a324. */
  out->volume_bits = ISAAC_ROOM_TRANSITION_ENGINE_SFX_VOLUME_BITS;   /* 1.0f */
  out->frame_delay = ISAAC_ROOM_TRANSITION_ENGINE_SFX_FRAME_DELAY;   /* 2 */
  out->loop = ISAAC_ROOM_TRANSITION_ENGINE_SFX_LOOP;                 /* 0 */
  out->pitch_bits = ISAAC_ROOM_TRANSITION_ENGINE_SFX_PITCH_BITS;     /* 1.0f */
  out->pan = ISAAC_ROOM_TRANSITION_ENGINE_SFX_PAN;                   /* 0 */
  out->receiver_off = ISAAC_ROOM_TRANSITION_ENGINE_SFX_RECEIVER_OFF; /* 0x2a324 */
  out->prep_va = ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_956780;        /* host */
  out->play_va = ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_92DC30;        /* Play */
}

/* ---------------------------------------------------------------------------
   v7 - register-level 0x0082ee40: loop, tail, log and ANM2 string build.
   ------------------------------------------------------------------------- */

extern "C" uint32_t isaac_room_transition_engine_c7b640_bits(void) {
  /* DAT_00c7b640 raw bits - v7/D1: zero-at-load .data, never written. */
  return ISAAC_ROOM_TRANSITION_ENGINE_C7B640_BITS;
}

extern "C" uint32_t isaac_room_transition_engine_c7b644_bits(void) {
  return ISAAC_ROOM_TRANSITION_ENGINE_C7B644_BITS;
}

extern "C" uint32_t isaac_room_transition_engine_82ee40_player_loop_end_used(
    int32_t fatal_needed, uint32_t end_f010, uint32_t end_f02a) {
  /* The `end` value alive in ECX at 0x0082f038: 0x0082f02a overwrote it only
     when the fatal block ran. */
  return fatal_needed != 0 ? end_f02a : end_f010;
}

extern "C" void isaac_room_transition_engine_82ee40_player_loop_step_exact(
    int32_t index, uint32_t end_f010, uint32_t begin_f015, uint32_t end_f02a,
    uint32_t begin_f036, IsaacRoomTransitionEnginePlayerLoopStepExact* out) {
  if (out == nullptr) return;
  /* PE-exact top of iteration, 0x0082f010..0x0082f047, register by register.
     Four SEPARATE live reads go in; folding them into one (begin,end) pair
     is only correct when the host log at 0x0082f025 leaves the vector alone. */
  const int32_t count_head =
      static_cast<int32_t>(end_f010 - begin_f015) >> 2; /* 0x0082f013/15/17 */
  const int32_t fatal = count_head == 0 ? 1 : 0;        /* 0x0082f01a */
  const uint32_t ecx = fatal != 0 ? end_f02a : end_f010; /* 0x0082f02a fatal only */
  const int32_t count_bound =
      static_cast<int32_t>(ecx - begin_f036) >> 2;  /* 0x0082f036/38/3d */
  /* 0x0082f040 cmp eax,ecx / jae - UNSIGNED: a negative index reads huge and
     clamps; a negative bound reads huge and does NOT clamp. Reproduced. */
  const int32_t clamped =
      static_cast<uint32_t>(index) >= static_cast<uint32_t>(count_bound) ? 1 : 0;
  out->count_head = count_head;
  out->fatal_needed = fatal;
  out->end_rereads = fatal;
  out->game_reread_fatal = fatal; /* 0x0082f030 mov edx,[0xc71678] */
  out->count_bound = count_bound;
  out->index = index;
  out->clamped_to_first = clamped;
  out->slot_ptr =
      clamped != 0 ? begin_f036
                   : begin_f036 +
                         static_cast<uint32_t>(index) *
                             uint32_t(ISAAC_ROOM_TRANSITION_ENGINE_PLAYER_ELEM_STRIDE);
  out->index_after = static_cast<int32_t>(static_cast<uint32_t>(index) + 1u);
}

extern "C" int32_t isaac_room_transition_engine_82ee40_loop_game_source(
    int32_t fatal_needed, int32_t entry_eligible, int32_t call_7abcc0,
    int32_t call_7abe20) {
  /* Which `mov edx,[0xc71678]` feeds the 0x0082f0ba re-base. 0x0082f030
     fires on the fatal path only, 0x0082f089 on the two host-call paths only
     (both behind the 0x0082f049 eligibility gate); the later one wins, and
     with neither the pre-loop pointer is still in edx. */
  const int32_t host_call =
      entry_eligible != 0 && (call_7abcc0 != 0 || call_7abe20 != 0) ? 1 : 0;
  if (host_call != 0) {
    return ISAAC_ROOM_TRANSITION_ENGINE_GAME_SRC_HOSTCALL;
  }
  if (fatal_needed != 0) {
    return ISAAC_ROOM_TRANSITION_ENGINE_GAME_SRC_FATAL;
  }
  return ISAAC_ROOM_TRANSITION_ENGINE_GAME_SRC_PRELOOP;
}

extern "C" int32_t isaac_room_transition_engine_82ee40_anim12_sfx_id_from_args(
    int32_t dim_arg_raw, int32_t game_1830c) {
  /* 0x0082f15f reads [ebx+0x18], the untouched RAW arg5 slot - NOT the
     effective dimension. game_1830c is accepted so that a model which
     wrongly switched to the effective dimension would differ. */
  (void)game_1830c;
  return (dim_arg_raw == 1)
             ? ISAAC_ROOM_TRANSITION_ENGINE_SFX_ID_DIM1
             : ISAAC_ROOM_TRANSITION_ENGINE_SFX_ID_DIMOTHER;
}

extern "C" void isaac_room_transition_engine_82ee40_tail_plan(
    int32_t field_1c_after_loop, int32_t slot_after_rewrite,
    int32_t dim_arg_raw, IsaacRoomTransitionEngineTailPlan* out) {
  if (out == nullptr) return;
  /* Tail 0x0082f0d4..0x0082f19a. edx = post-loop re-read of [edi+0x1c]. */
  const int32_t edx = field_1c_after_loop;
  const int32_t anim2 = (edx == 2) ? 1 : 0; /* 0x0082f0dd cmp edx,2 / jne */
  int32_t field_8;
  if (anim2 != 0) {
    field_8 = ISAAC_ROOM_TRANSITION_ENGINE_TAIL_FIELD8_ANIM2; /* 0x1e */
  } else {
    /* 0x0082f115 cmp [ebp-0x30],-1 - the post-rewrite slot. */
    field_8 = (slot_after_rewrite == -1)
                  ? ISAAC_ROOM_TRANSITION_ENGINE_TAIL_FIELD8_SLOT_NEG1
                  : ISAAC_ROOM_TRANSITION_ENGINE_TAIL_FIELD8_SLOT_OTHER;
  }
  /* 0x0082f110 jumps the anim2 path straight to the epilog, so 0x0082f14f is
     reachable only when edx != 2 - anim == 0x12 gates the SFX residual. */
  const int32_t sfx_needed = (anim2 == 0 && edx == 0x12) ? 1 : 0;
  out->field_0 = 1; /* 0x0082f0d7 mov dword [edi],1 */
  out->anim2_path = anim2;
  out->field_8 = field_8;
  out->field_c = 0;
  out->field_22c_bits = ISAAC_ROOM_TRANSITION_ENGINE_C7B640_BITS;
  out->field_230_bits = ISAAC_ROOM_TRANSITION_ENGINE_C7B644_BITS;
  out->sfx_needed = sfx_needed;
  out->sfx_id =
      sfx_needed != 0
          ? isaac_room_transition_engine_82ee40_anim12_sfx_id_from_args(
                dim_arg_raw, 0)
          : ISAAC_ROOM_TRANSITION_ENGINE_TAIL_SFX_ID_NONE;
}

extern "C" void isaac_room_transition_engine_82ee40_entry_log_pack(
    int32_t anim_arg, IsaacRoomTransitionEngineEntryLogPack* out) {
  if (out == nullptr) return;
  /* Entry log 0x0082ee88..0x0082ee9b: cdecl, four dwords, right to left. */
  out->level = ISAAC_ROOM_TRANSITION_ENGINE_ENTRY_LOG_LEVEL;
  out->format_va = ISAAC_ROOM_TRANSITION_ENGINE_ENTRY_LOG_FMT_VA;
  out->frame_field_off = ISAAC_ROOM_TRANSITION_ENGINE_ENTRY_LOG_FRAME_OFF;
  out->anim_arg = anim_arg;
  out->log_va = ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_LOG;
  out->argc = ISAAC_ROOM_TRANSITION_ENGINE_ENTRY_LOG_ARGC;
}

extern "C" void isaac_room_transition_engine_82ee40_anm2_string_plan(
    IsaacRoomTransitionEngineAnm2StringPlan* out) {
  if (out == nullptr) return;
  /* std::string build 0x0082eeab..0x0082ef70 - constants only, static. */
  out->literal_va = ISAAC_ROOM_TRANSITION_ENGINE_ANM2_LITERAL_VA;
  out->literal_len = ISAAC_ROOM_TRANSITION_ENGINE_ANM2_LITERAL_LEN;
  out->sso_capacity = ISAAC_ROOM_TRANSITION_ENGINE_ANM2_SSO_CAPACITY;
  out->heap_capacity = ISAAC_ROOM_TRANSITION_ENGINE_ANM2_HEAP_CAPACITY;
  out->alloc_request = ISAAC_ROOM_TRANSITION_ENGINE_ANM2_ALLOC_REQUEST;
  out->load_graphics = ISAAC_ROOM_TRANSITION_ENGINE_ANM2_LOAD_GRAPHICS;
  out->load_receiver_off = ISAAC_ROOM_TRANSITION_ENGINE_ANM2_LOAD_RECEIVER_OFF;
  out->load_va = ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_ANM2_LOAD;
  out->alloc_va = ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_ANM2_ALLOC;
  out->free_va = ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_ANM2_FREE;
}

extern "C" int32_t isaac_room_transition_engine_82ee40_anm2_string_needs_release(
    uint32_t capacity) {
  /* 0x0082ef2c `cmp edx,0x10 ; jb` on the CAPACITY - unsigned, full word. */
  return capacity >= ISAAC_ROOM_TRANSITION_ENGINE_ANM2_SSO_LIMIT ? 1 : 0;
}

extern "C" uint32_t isaac_room_transition_engine_82ee40_anm2_string_release_size(
    uint32_t capacity) {
  /* 0x0082ef34 `inc edx` - capacity + 1 with 32-bit wrap. */
  return capacity + 1u;
}


/* ---------------------------------------------------------------------------
   v8 - FUN_0040a5d0, the animation-name lookup (VA 0x0040a5d0..0x0040a685,
   ret 8). No exact ZHL match, so the name stays address-stable. Producer of
   the AL byte gate at 0x007abe5e. The inlined strcmp is the PE's two-bytes-
   per-pass unrolled form; the needle is RELOADED every iteration (D4).
   ------------------------------------------------------------------------- */

extern "C" int32_t isaac_room_transition_engine_40a5d0_search_enter(
    int32_t count) {
  /* 0x0040a5e6 `test ebx,ebx ; je` - a FULL DWORD test; only zero skips. */
  return count != 0 ? 1 : 0;
}

extern "C" uint32_t isaac_room_transition_engine_40a5d0_name_ptr(
    uint32_t elem_ptr, uint32_t capacity, uint32_t heap_ptr) {
  /* 0x0040a5f2/f8 `cmp dword [esi+0x14],0x10 ; jb` - UNSIGNED, full dword. */
  return capacity < ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_SSO_LIMIT ? elem_ptr
                                                                  : heap_ptr;
}

extern "C" int32_t isaac_room_transition_engine_40a5d0_loop_continue(
    int32_t index_after, int32_t count) {
  /* 0x0040a633/35 `cmp edi,ebx ; jb` - UNSIGNED and strict. */
  return static_cast<uint32_t>(index_after) < static_cast<uint32_t>(count) ? 1
                                                                          : 0;
}

extern "C" uint32_t isaac_room_transition_engine_40a5d0_entry_ptr(
    uint32_t table_base, int32_t index) {
  /* 0x0040a655 `imul eax,edi,0x13c` (32-bit) + 0x0040a65e `add eax,[ebp-8]`. */
  return table_base + static_cast<uint32_t>(index) *
                          uint32_t(ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_ENTRY_STRIDE);
}

extern "C" uint32_t isaac_room_transition_engine_40a5d0_receiver(
    uint32_t this_ptr) {
  /* 0x0040a65b `add ecx,0x30`. */
  return this_ptr + ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_RECEIVER_OFF;
}

extern "C" uint32_t isaac_room_transition_engine_40a5d0_match_callee(
    uint32_t arg2) {
  /* 0x0040a661 `cmp byte ptr [ebp+0xc],0` - a BYTE gate on a dword argument.
     Both callees stay host addresses; this export only SELECTS. */
  return (arg2 & 0xffu) != 0u
             ? uint32_t(ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_408830)
             : uint32_t(ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_408970);
}

extern "C" uint32_t isaac_room_transition_engine_40a5d0_return_eax(
    int32_t al, uint32_t callee_eax) {
  /* D6 - `xor al,al` / `mov al,1` patch AL only; bits 8..31 are the previous
     call's EAX. That is exactly why 0x007abe5e spells `test al,al`. */
  const uint32_t low =
      (al != 0) ? uint32_t(ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_AL_FOUND)
                : uint32_t(ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_AL_MISSING);
  return (callee_eax & 0xffffff00u) | (low & 0xffu);
}

extern "C" int32_t isaac_room_transition_engine_40a5d0_strcmp(
    const uint8_t* mem, uint32_t haystack_off, uint32_t needle_off,
    uint32_t* out_advance) {
  /* The inlined strcmp at 0x0040a600..0x0040a622: an ordinary UNSIGNED byte
     scan. The cursor advance law: the PE walks two bytes per pass and only
     runs `add eax,2 / add ecx,2` after BOTH bytes of a pair matched, so the
     cursors stop at the start of the pair that ended the scan - with one
     exception, a terminating NUL in the SECOND byte of a pair, where the
     adds happen before `test dl,dl` sees it. */
  uint32_t i = 0;
  while (mem[haystack_off + i] == mem[needle_off + i] &&
         mem[haystack_off + i] != 0) {
    i += 1;
  }
  const uint8_t av = mem[haystack_off + i];
  const uint8_t cv = mem[needle_off + i];
  const int32_t result = (av == cv) ? 0 : ((av < cv) ? -1 : 1);
  /* `sbb eax,eax ; or eax,1` turns the CF of the UNSIGNED compare into
     -1/+1; the equal exit is `xor eax,eax`. */
  *out_advance =
      (result == 0 && (i & 1u) == 1u) ? (i + 1u) : (i - (i & 1u));
  return result;
}

extern "C" void isaac_room_transition_engine_40a5d0_warn_pack(
    uint32_t needle, IsaacRoomTransitionEngine40a5d0WarnPack* out) {
  if (out == nullptr) return;
  /* 0x0040a637..0x0040a647, shared by "count == 0" and "search exhausted". */
  out->level = ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_WARN_LEVEL;
  out->format_va = ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_WARN_MSG_VA;
  out->needle = needle;
  out->log_va = ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_LOG;
  out->argc = ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_WARN_ARGC;
  out->al = ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_AL_MISSING;
}

extern "C" void isaac_room_transition_engine_40a5d0_lookup(
    const uint8_t* mem, uint32_t table_off, int32_t count, uint32_t needle_off,
    uint32_t this_off, uint32_t arg2, int32_t iteration_limit,
    IsaacRoomTransitionEngine40a5d0Lookup* out) {
  /* Whole body of 0x0040a5d0; every data address is an offset into mem.
     iteration_limit is a MODEL guard only - the PE has none, and the
     unsigned loop-back at 0x0040a635 happily accepts a count of 0x80000000. */
  if (out == nullptr) return;
  out->entered = 0;
  out->iterations = 0;
  out->found = 0;
  out->index = ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_NOT_FOUND;
  out->entry_ptr = 0;
  out->receiver = 0;
  out->callee_va = 0;
  out->warn_needle = 0;
  out->al = ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_AL_MISSING;
  out->truncated = 0;

  uint32_t ecx = needle_off; /* 0x0040a5d9 mov ecx,[ebp+8] */
  int32_t edi = 0;           /* 0x0040a5de xor edi,edi */

  /* 0x0040a5e3 mov ebx,[eax+0x78] ; 0x0040a5e6 test ebx,ebx / je */
  if (isaac_room_transition_engine_40a5d0_search_enter(count) == 0) {
    out->callee_va = ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_LOG;
    out->warn_needle = ecx; /* ECX untouched since 0x0040a5d9 */
    return;
  }
  out->entered = 1;

  uint32_t esi = table_off; /* 0x0040a5ea/ed/ef */
  for (;;) {
    if (iteration_limit >= 0 && out->iterations >= iteration_limit) {
      out->truncated = 1;
      return;
    }
    /* 0x0040a5f2..0x0040a5fa - SSO/heap split on [esi+0x14]. */
    const uint32_t capacity =
        mem[esi + ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_SSO_CAP_OFF] |
        (uint32_t(mem[esi + ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_SSO_CAP_OFF + 1])
         << 8) |
        (uint32_t(mem[esi + ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_SSO_CAP_OFF + 2])
         << 16) |
        (uint32_t(mem[esi + ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_SSO_CAP_OFF + 3])
         << 24);
    const uint32_t elem_ptr =
        mem[esi] | (uint32_t(mem[esi + 1]) << 8) |
        (uint32_t(mem[esi + 2]) << 16) | (uint32_t(mem[esi + 3]) << 24);
    const uint32_t eax =
        isaac_room_transition_engine_40a5d0_name_ptr(esi, capacity, elem_ptr);

    uint32_t advance = 0;
    const int32_t cmp = isaac_room_transition_engine_40a5d0_strcmp(
        mem, eax, ecx, &advance);
    out->iterations += 1;

    if (cmp == 0) { /* 0x0040a625/27 test eax,eax / je 0x40a652 */
      out->found = 1;
      out->index = edi;
      out->entry_ptr = isaac_room_transition_engine_40a5d0_entry_ptr(
          table_off, edi);
      out->receiver = isaac_room_transition_engine_40a5d0_receiver(this_off);
      out->callee_va = isaac_room_transition_engine_40a5d0_match_callee(arg2);
      out->al = ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_AL_FOUND;
      /* 0x0040a652 mov ecx,[ebp-4] overwrites ECX at once: the advanced
         needle cursor is dead on this path, so warn_needle stays 0. */
      return;
    }

    /* The strcmp left ECX advanced by `add ecx,2` per matched pair... */
    ecx += advance;
    /* ...and 0x0040a629 `mov ecx,[ebp+8]` puts it straight back. Deleting
       this line is the needle-fold defect (D4) and changes results in BOTH
       directions: false misses and false matches. */
    ecx = needle_off;

    edi = static_cast<int32_t>(static_cast<uint32_t>(edi) + 1u);
    esi += uint32_t(ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_ENTRY_STRIDE);

    /* 0x0040a633/35 cmp edi,ebx / jb - UNSIGNED strict. */
    if (isaac_room_transition_engine_40a5d0_loop_continue(edi, count) == 0) {
      break;
    }
  }

  out->callee_va = ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_LOG;
  out->warn_needle = ecx; /* 0x0040a637 push ecx */
  out->al = ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_AL_MISSING; /* 0x0040a647 */
}


/* ---------------------------------------------------------------------------
   v9 - the 0x00408830 / 0x00408970 AnimationState apply pair. The machine
   bodies stay host (address-stable VAs); these exports model the pure
   control-flow surface: allocation/memset/copy/free decisions, saturation
   and the SEH frame facts. Oracle laws: header + model (V1..V9 divergence
   table). The allocator IAT calls are platform primitives.
   ------------------------------------------------------------------------- */

extern "C" uint32_t isaac_room_transition_engine_animstate_alloc_size(
    uint32_t count) {
  /* `mul r32,4 / seto / neg / or` - an overflowed product reads 0xffffffff.
     count*4 overflows iff count > 0xffffffff/4 = 0x3fffffff. */
  if (count > 0x3fffffffu) {
    return ISAAC_ROOM_TRANSITION_ENGINE_ANIMSTATE_ALLOC_SAT;
  }
  return count * uint32_t(ISAAC_ROOM_TRANSITION_ENGINE_ANIMSTATE_ELEM_SIZE);
}

extern "C" uint32_t isaac_room_transition_engine_animstate_memset_size(
    uint32_t count) {
  /* shl/lea count*4 - plain 32-bit wrap, never saturated. */
  return count << 2;
}

extern "C" uint32_t isaac_room_transition_engine_animstate_free_block_ptr(
    uint32_t buf_ptr) {
  /* 970 inline release frees buf-4 ([ptr-4] carries the byte size). */
  return buf_ptr - ISAAC_ROOM_TRANSITION_ENGINE_ANIMSTATE_BLOCK_BIAS;
}

extern "C" uint32_t isaac_room_transition_engine_animstate_stats_block(
    uint32_t stats_head) {
  /* Stats block: live head -> head+0x30, else the fixed fallback pair. */
  if (stats_head == 0u) {
    return ISAAC_ROOM_TRANSITION_ENGINE_STATS_FIXED_VA;
  }
  return stats_head + ISAAC_ROOM_TRANSITION_ENGINE_STATS_HEAD_DELTA;
}

extern "C" int32_t isaac_room_transition_engine_408830_count_gate(
    uint32_t count) {
  /* 830 count gate: FULL-DWORD test/je - zero only (V2). */
  return count != 0u ? 1 : 0;
}

extern "C" void isaac_room_transition_engine_408830_plan(
    uint32_t arg, uint32_t buf_a, uint32_t buf_b, uint32_t data_0,
    uint32_t count_a_alloc, uint32_t count_a_memset, uint32_t data_after_a,
    uint32_t count_b_alloc, uint32_t count_b_memset, uint32_t alloc_a_result,
    uint32_t alloc_b_result, IsaacRoomTransitionEngine408830Plan* out) {
  if (out == nullptr) return;
  /* Whole-CF plan of 0x00408830. Every input is one machine observation:
     data_0/data_after_a are the 0x004088b0 / 0x004088f2 re-reads and the two
     count pairs are the pre-alloc and post-alloc reads (V9). */
  const int32_t free_a = (buf_a != 0u) ? 1 : 0;
  const int32_t free_b = (buf_b != 0u) ? 1 : 0;
  const bool data_live = (data_0 != 0u);
  const int32_t alloc_a =
      (data_live && isaac_room_transition_engine_408830_count_gate(
                        count_a_alloc) != 0)
          ? 1
          : 0;
  /* Block B sees the original pointer when block A was skipped on a zero
     count, and the 0x004088f2 re-read when block A ran. */
  bool b_live;
  if (!data_live) {
    b_live = false;
  } else if (alloc_a != 0) {
    b_live = (data_after_a != 0u);
  } else {
    b_live = true;
  }
  const int32_t alloc_b =
      (b_live &&
       isaac_room_transition_engine_408830_count_gate(count_b_alloc) != 0)
          ? 1
          : 0;
  out->store_arg_first = 1; /* V1: [this+4]=arg at 0x0040885c, pre-call */
  out->free_a = free_a;
  out->free_b = free_b;
  out->alloc_a = alloc_a;
  out->alloc_a_size =
      alloc_a != 0 ? isaac_room_transition_engine_animstate_alloc_size(
                         count_a_alloc)
                   : 0u;
  out->memset_a_size =
      alloc_a != 0 ? isaac_room_transition_engine_animstate_memset_size(
                         count_a_memset)
                   : 0u;
  out->alloc_b = alloc_b;
  out->alloc_b_size =
      alloc_b != 0 ? isaac_room_transition_engine_animstate_alloc_size(
                         count_b_alloc)
                   : 0u;
  out->memset_b_size =
      alloc_b != 0 ? isaac_room_transition_engine_animstate_memset_size(
                         count_b_memset)
                   : 0u;
  out->memset_fill = ISAAC_ROOM_TRANSITION_ENGINE_ANIMSTATE_FILL_BYTE; /* 0xff */
  out->final_4 = arg;
  out->final_8 = alloc_a != 0 ? alloc_a_result : 0u;
  out->final_c = alloc_b != 0 ? alloc_b_result : 0u;
  out->tail_10_bits = ISAAC_ROOM_TRANSITION_ENGINE_408830_F10_BITS; /* V6 */
  out->tail_14_byte = 0; /* BYTE store */
  out->tail_18 = 0;
  out->tail_1c = 0;
  out->host_calls = free_a + free_b + 2 * alloc_a + 2 * alloc_b;
}

extern "C" int32_t isaac_room_transition_engine_408970_count_sample(
    uint32_t data_ptr, uint32_t raw_count) {
  /* 970 null-safe count sample: a missing descriptor contributes zero. */
  return data_ptr == 0u ? 0 : static_cast<int32_t>(raw_count);
}

extern "C" int32_t isaac_room_transition_engine_408970_arm_select(
    uint32_t old_count, uint32_t new_count) {
  /* 970 arm law: equality skips; then SIGNED jg splits realloc from free. */
  if (old_count == new_count) {
    return ISAAC_ROOM_TRANSITION_ENGINE_408970_ARM_SKIP;
  }
  if (static_cast<int32_t>(new_count) > 0) {
    return ISAAC_ROOM_TRANSITION_ENGINE_408970_ARM_REALLOC;
  }
  return ISAAC_ROOM_TRANSITION_ENGINE_408970_ARM_FREE;
}

extern "C" int32_t isaac_room_transition_engine_408970_copy_needed(
    uint32_t old_count) {
  /* Copy gate: OLD count > 0 SIGNED (jle skips). */
  return static_cast<int32_t>(old_count) > 0 ? 1 : 0;
}

extern "C" uint32_t isaac_room_transition_engine_408970_copy_size(
    uint32_t old_count) {
  /* Copy length: OLD count * 4, wrapped - never clamped to the new size
     (V4 original defect, reproduced). */
  return old_count << 2;
}

extern "C" void isaac_room_transition_engine_408970_arm_plan(
    uint32_t which_b, uint32_t old_count, uint32_t new_count,
    uint32_t slot_ptr, uint32_t stats_head, uint32_t alloc_result,
    IsaacRoomTransitionEngine408970ArmPlan* out) {
  if (out == nullptr) return;
  /* One 970 arm. which_b selects buffer B semantics (slot 0xc, V7 publish). */
  const uint32_t own_off =
      which_b != 0u ? ISAAC_ROOM_TRANSITION_ENGINE_ANIMSTATE_BUF_B_OFF
                    : ISAAC_ROOM_TRANSITION_ENGINE_ANIMSTATE_BUF_A_OFF;
  const int32_t arm =
      isaac_room_transition_engine_408970_arm_select(old_count, new_count);
  const bool slot_live = (slot_ptr != 0u);

  out->arm = arm;
  out->wrapper_free = 0;
  out->zero_needed = 0;
  out->zero_off = 0;
  out->alloc_size = 0;
  out->memset_size = 0;
  out->memset_fill = ISAAC_ROOM_TRANSITION_ENGINE_ANIMSTATE_FILL_BYTE;
  out->copy_needed = 0;
  out->copy_size = 0;
  out->copy_src_off = own_off;
  out->release_old = 0;
  out->stats_block = 0;
  out->release_ptr = 0;
  out->publish_needed = 0;
  out->publish_off = 0;
  out->publish_value = 0;
  out->host_calls = 0;

  if (arm == ISAAC_ROOM_TRANSITION_ENGINE_408970_ARM_FREE) {
    if (slot_live) {
      out->wrapper_free = 1;
      out->zero_needed = 1;
      out->zero_off = own_off;
      out->host_calls = 1;
    }
    return;
  }
  if (arm != ISAAC_ROOM_TRANSITION_ENGINE_408970_ARM_REALLOC) {
    return;
  }
  out->alloc_size = isaac_room_transition_engine_animstate_alloc_size(new_count);
  out->memset_size = isaac_room_transition_engine_animstate_memset_size(new_count);
  out->copy_needed = isaac_room_transition_engine_408970_copy_needed(old_count);
  out->copy_size =
      out->copy_needed != 0
          ? isaac_room_transition_engine_408970_copy_size(old_count)
          : 0u;
  if (slot_live) {
    out->release_old = 1;
    out->stats_block = isaac_room_transition_engine_animstate_stats_block(
        stats_head);
    out->release_ptr = isaac_room_transition_engine_animstate_free_block_ptr(
        slot_ptr);
    if (which_b != 0u) {
      out->zero_needed = 1;
      out->zero_off = ISAAC_ROOM_TRANSITION_ENGINE_ANIMSTATE_BUF_B_OFF;
    }
  }
  out->publish_needed = 1;
  out->publish_off = ISAAC_ROOM_TRANSITION_ENGINE_408970_PUBLISH_OFF; /* 8 */
  out->publish_value = alloc_result;
  out->host_calls = 2 + out->copy_needed + out->release_old;
}

extern "C" void isaac_room_transition_engine_408970_plan(
    uint32_t old_data, uint32_t new_data, uint32_t old_count_a_raw,
    uint32_t old_count_b_raw, uint32_t new_count_a_raw,
    uint32_t new_count_b_raw, uint32_t slot_08, uint32_t slot_0c,
    uint32_t stats_head, uint32_t alloc_a_result, uint32_t alloc_b_result,
    IsaacRoomTransitionEngine408970Plan* out) {
  if (out == nullptr) return;
  /* Whole 0x00408970: four null-safe samples up front, arm A, arm B, then
     the descriptor published LAST - with the V7 slot-8 double publish folded
     into the final slot values exactly as the store order dictates. */
  const int32_t old_count_a = isaac_room_transition_engine_408970_count_sample(
      old_data, old_count_a_raw);
  const int32_t new_count_a = isaac_room_transition_engine_408970_count_sample(
      new_data, new_count_a_raw);
  const int32_t old_count_b = isaac_room_transition_engine_408970_count_sample(
      old_data, old_count_b_raw);
  const int32_t new_count_b = isaac_room_transition_engine_408970_count_sample(
      new_data, new_count_b_raw);

  IsaacRoomTransitionEngine408970ArmPlan arm_a;
  isaac_room_transition_engine_408970_arm_plan(
      0, static_cast<uint32_t>(old_count_a),
      static_cast<uint32_t>(new_count_a), slot_08, stats_head, alloc_a_result,
      &arm_a);
  IsaacRoomTransitionEngine408970ArmPlan arm_b;
  isaac_room_transition_engine_408970_arm_plan(
      1, static_cast<uint32_t>(old_count_b),
      static_cast<uint32_t>(new_count_b), slot_0c, stats_head, alloc_b_result,
      &arm_b);

  uint32_t v08 = slot_08;
  uint32_t v0c = slot_0c;
  uint32_t clobbered_a = 0;
  if (arm_a.wrapper_free == 1) {
    v08 = 0;
  } else if (arm_a.publish_needed == 1) {
    v08 = alloc_a_result;
  }
  if (arm_b.wrapper_free == 1) {
    v0c = 0;
  } else if (arm_b.publish_needed == 1) {
    if (arm_b.zero_needed == 1) {
      v0c = 0;
    }
    clobbered_a = v08;
    v08 = alloc_b_result;
  }

  out->old_count_a = old_count_a;
  out->new_count_a = new_count_a;
  out->old_count_b = old_count_b;
  out->new_count_b = new_count_b;
  out->arm_a = arm_a;
  out->arm_b = arm_b;
  out->final_4 = new_data; /* stored LAST at 0x00408b6d (V1) */
  out->final_8 = v08;
  out->final_c = v0c;
  out->clobbered_a = clobbered_a;
  out->store_arg_last = 1;
  out->host_calls = arm_a.host_calls + arm_b.host_calls;
}

extern "C" void isaac_room_transition_engine_animstate_seh_pack(
    uint32_t which_970, IsaacRoomTransitionEngineAnimstateSehPack* out) {
  if (out == nullptr) return;
  /* Recovered frame facts for either sibling (0x00408830 / 0x00408970). */
  const bool alt = (which_970 != 0u);
  out->body_va =
      alt ? uint32_t(ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_408970)
          : uint32_t(ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_408830);
  out->handler_va =
      alt ? ISAAC_ROOM_TRANSITION_ENGINE_SEH_HANDLER_VA_408970
          : ISAAC_ROOM_TRANSITION_ENGINE_SEH_HANDLER_VA_408830;
  out->funcinfo_va =
      alt ? ISAAC_ROOM_TRANSITION_ENGINE_SEH_FUNCINFO_VA_408970
          : ISAAC_ROOM_TRANSITION_ENGINE_SEH_FUNCINFO_VA_408830;
  out->magic = ISAAC_ROOM_TRANSITION_ENGINE_SEH_MAGIC;
  out->max_state =
      alt ? ISAAC_ROOM_TRANSITION_ENGINE_SEH_MAX_STATE_408970
          : ISAAC_ROOM_TRANSITION_ENGINE_SEH_MAX_STATE_408830;
  out->try_blocks = ISAAC_ROOM_TRANSITION_ENGINE_SEH_TRY_BLOCKS;
  out->eh_flags = ISAAC_ROOM_TRANSITION_ENGINE_SEH_EH_FLAGS;
  out->unwind_action_va = ISAAC_ROOM_TRANSITION_ENGINE_SEH_ACTION_VA;
  out->unwind_to_state = ISAAC_ROOM_TRANSITION_ENGINE_SEH_UNWIND_TO_STATE;
  out->terminate_iat_va = ISAAC_ROOM_TRANSITION_ENGINE_IAT_VA_TERMINATE;
  out->dispatch_va = ISAAC_ROOM_TRANSITION_ENGINE_SEH_DISPATCH_VA;
  out->dispatch_iat_va = ISAAC_ROOM_TRANSITION_ENGINE_IAT_VA_CXXHANDLER;
  out->cookie_va = ISAAC_ROOM_TRANSITION_ENGINE_SEH_COOKIE_VA;
}

extern "C" int32_t isaac_room_transition_engine_animstate_seh_unwind_terminates(
    int32_t state, uint32_t which_970) {
  /* Unwinding from any registered state terminates; -1 propagates. */
  const int32_t max_state =
      (which_970 != 0u) ? ISAAC_ROOM_TRANSITION_ENGINE_SEH_MAX_STATE_408970
                        : ISAAC_ROOM_TRANSITION_ENGINE_SEH_MAX_STATE_408830;
  return (state >= 0 && state < max_state) ? 1 : 0;
}


/* ---------------------------------------------------------------------------
   v10 - the composed FUN_007abe20 body, the missing Game store, the frame.
   ------------------------------------------------------------------------- */

extern "C" void isaac_room_transition_engine_7abe20_408830_call_pack(
    IsaacRoomTransitionEngine7abe20408830CallPack* out) {
  if (out == nullptr) return;
  /* The 0x007abe4c direct-call shape plus the receiver-chain layout proof
     (entry+0x98 overlay state = entry+0x48 anm2 + 0x50 delta). */
  out->callee_va = ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_408830;
  out->receiver_off = ISAAC_ROOM_TRANSITION_ENGINE_ENTRY_98_OFF;
  out->arg = ISAAC_ROOM_TRANSITION_ENGINE_7ABE20_408830_ARG;
  out->push_va = ISAAC_ROOM_TRANSITION_ENGINE_7ABE20_408830_PUSH_VA;
  out->call_va = ISAAC_ROOM_TRANSITION_ENGINE_7ABE20_408830_CALL_VA;
  out->via_a5d0_receiver_off = ISAAC_ROOM_TRANSITION_ENGINE_ENTRY_78_OFF;
  out->anm2_off = ISAAC_ROOM_TRANSITION_ENGINE_ENTRY_48_OFF;
  out->anim_state_delta = ISAAC_ROOM_TRANSITION_ENGINE_ANIMSTATE_MAIN_DELTA;
  out->overlay_state_delta = ISAAC_ROOM_TRANSITION_ENGINE_ANIMSTATE_OVERLAY_DELTA;
}

extern "C" int32_t isaac_room_transition_engine_7abe20_408830_pure_complete(
    uint32_t buf_a, uint32_t buf_b) {
  /* arg==0 site: with both buffers null the body is stores-only (no host). */
  return (buf_a == 0u && buf_b == 0u) ? 1 : 0;
}

extern "C" void isaac_room_transition_engine_82ee40_setup_store_plan(
    int32_t room, int32_t slot, int32_t anim, int32_t effective_dim,
    int32_t player_arg, IsaacRoomTransitionEngineSetupStorePlan* out) {
  if (out == nullptr) return;
  /* N7 - the complete setup store block 0x0082efae..0x0082efef, PE order,
     Game write (0x0082efcb, EDX base) included. */
  out->stores[0].target = ISAAC_ROOM_TRANSITION_ENGINE_SETUP_TARGET_THIS;
  out->stores[0].offset = 0x14u;
  out->stores[0].value = static_cast<uint32_t>(room);
  out->stores[0].pe_va = ISAAC_ROOM_TRANSITION_ENGINE_STORE_VA_FIELD_14;

  out->stores[1].target = ISAAC_ROOM_TRANSITION_ENGINE_SETUP_TARGET_THIS;
  out->stores[1].offset = 0x04u;
  out->stores[1].value = 0u;
  out->stores[1].pe_va = ISAAC_ROOM_TRANSITION_ENGINE_STORE_VA_FIELD_4;

  out->stores[2].target = ISAAC_ROOM_TRANSITION_ENGINE_SETUP_TARGET_THIS;
  out->stores[2].offset = 0x1cu;
  out->stores[2].value = static_cast<uint32_t>(anim);
  out->stores[2].pe_va = ISAAC_ROOM_TRANSITION_ENGINE_STORE_VA_FIELD_1C;

  out->stores[3].target = ISAAC_ROOM_TRANSITION_ENGINE_SETUP_TARGET_THIS;
  out->stores[3].offset = 0x10u;
  out->stores[3].value = static_cast<uint32_t>(slot);
  out->stores[3].pe_va = ISAAC_ROOM_TRANSITION_ENGINE_STORE_VA_FIELD_10;

  out->stores[4].target = ISAAC_ROOM_TRANSITION_ENGINE_SETUP_TARGET_THIS;
  out->stores[4].offset = 0x238u;
  out->stores[4].value = 0u;
  out->stores[4].pe_va = ISAAC_ROOM_TRANSITION_ENGINE_STORE_VA_FIELD_238;

  out->stores[5].target = ISAAC_ROOM_TRANSITION_ENGINE_SETUP_TARGET_GAME;
  out->stores[5].offset = ISAAC_ROOM_TRANSITION_ENGINE_GAME_PLAYER_ARG_OFF;
  out->stores[5].value = static_cast<uint32_t>(player_arg);
  out->stores[5].pe_va = ISAAC_ROOM_TRANSITION_ENGINE_STORE_VA_GAME_1BB74;

  out->stores[6].target = ISAAC_ROOM_TRANSITION_ENGINE_SETUP_TARGET_THIS;
  out->stores[6].offset = 0x20u;
  out->stores[6].value = 0u;
  out->stores[6].pe_va = ISAAC_ROOM_TRANSITION_ENGINE_STORE_VA_FIELD_20;

  out->stores[7].target = ISAAC_ROOM_TRANSITION_ENGINE_SETUP_TARGET_THIS;
  out->stores[7].offset = 0x24u;
  out->stores[7].value = 0u;
  out->stores[7].pe_va = ISAAC_ROOM_TRANSITION_ENGINE_STORE_VA_FIELD_24;

  out->stores[8].target = ISAAC_ROOM_TRANSITION_ENGINE_SETUP_TARGET_THIS;
  out->stores[8].offset = 0x18u;
  out->stores[8].value = static_cast<uint32_t>(effective_dim);
  out->stores[8].pe_va = ISAAC_ROOM_TRANSITION_ENGINE_STORE_VA_FIELD_18;
}

extern "C" void isaac_room_transition_engine_82ee40_frame_pack(
    IsaacRoomTransitionEngine82ee40FramePack* out) {
  if (out == nullptr) return;
  /* N8 - the frame of 0x0082ee40 (aligned-stack thunk, SEH, cookie, calls). */
  out->body_va = ISAAC_ROOM_TRANSITION_ENGINE_82EE40_VA;
  out->ret_va = ISAAC_ROOM_TRANSITION_ENGINE_82EE40_RET_VA;
  out->end_va = ISAAC_ROOM_TRANSITION_ENGINE_82EE40_END_VA;
  out->size = ISAAC_ROOM_TRANSITION_ENGINE_82EE40_SIZE;
  out->ret_bytes = ISAAC_ROOM_TRANSITION_ENGINE_82EE40_RET_BYTES;
  out->argc = ISAAC_ROOM_TRANSITION_ENGINE_82EE40_ARGC;
  out->arg_room_off = ISAAC_ROOM_TRANSITION_ENGINE_82EE40_ARG_ROOM_OFF;
  out->arg_slot_off = ISAAC_ROOM_TRANSITION_ENGINE_82EE40_ARG_SLOT_OFF;
  out->arg_anim_off = ISAAC_ROOM_TRANSITION_ENGINE_82EE40_ARG_ANIM_OFF;
  out->arg_player_off = ISAAC_ROOM_TRANSITION_ENGINE_82EE40_ARG_PLAYER_OFF;
  out->arg_dim_off = ISAAC_ROOM_TRANSITION_ENGINE_82EE40_ARG_DIM_OFF;
  out->seh_handler_va = ISAAC_ROOM_TRANSITION_ENGINE_82EE40_SEH_HANDLER_VA;
  out->seh_push_va = ISAAC_ROOM_TRANSITION_ENGINE_82EE40_SEH_PUSH_VA;
  out->cookie_va = ISAAC_ROOM_TRANSITION_ENGINE_SEH_COOKIE_VA;
  out->cookie_check_va = ISAAC_ROOM_TRANSITION_ENGINE_82EE40_COOKIE_CHECK_VA;
  out->call_sites = ISAAC_ROOM_TRANSITION_ENGINE_82EE40_CALL_SITES;
  out->callees = ISAAC_ROOM_TRANSITION_ENGINE_82EE40_CALLEES;
  out->direct_call_sites = ISAAC_ROOM_TRANSITION_ENGINE_82EE40_DIRECT_CALL_SITES;
  out->indirect_call_sites = ISAAC_ROOM_TRANSITION_ENGINE_82EE40_INDIRECT_CALL_SITES;
  out->indirect_iat_va = ISAAC_ROOM_TRANSITION_ENGINE_IAT_VA_INVALID_PARAM;
}

extern "C" void isaac_room_transition_engine_7abe20_receivers(
    uint32_t entry_ptr, IsaacRoomTransitionEngine7abe20Receivers* out) {
  if (out == nullptr) return;
  /* N9b - the four `lea` receivers, 32-bit wrap, plus the computed alias. */
  const uint32_t a5d0 = entry_ptr + ISAAC_ROOM_TRANSITION_ENGINE_ENTRY_48_OFF;
  const uint32_t a5d0_match =
      a5d0 + uint32_t(ISAAC_ROOM_TRANSITION_ENGINE_ANIMSTATE_MAIN_DELTA);
  const uint32_t rewind = entry_ptr + ISAAC_ROOM_TRANSITION_ENGINE_ENTRY_78_OFF;
  out->reset = entry_ptr + ISAAC_ROOM_TRANSITION_ENGINE_7ABE20_RESET_RECEIVER_OFF;
  out->direct_830 = entry_ptr + ISAAC_ROOM_TRANSITION_ENGINE_ENTRY_98_OFF;
  out->a5d0 = a5d0;
  out->a5d0_match = a5d0_match;
  out->rewind = rewind;
  out->alias = (a5d0_match == rewind) ? 1 : 0;
}

extern "C" int32_t isaac_room_transition_engine_7abe20_nested_830_needed(
    uint32_t a5d0_result_byte) {
  /* N9a - the byte at 0x007abe5e also says the nested 0x00408830 already
     ran (the match path of 0x0040a5d0 calls it with arg2 != 0). */
  return (a5d0_result_byte & 0xffu) != 0u ? 1 : 0;
}

extern "C" void isaac_room_transition_engine_7abe20_body_plan(
    uint32_t entry_ptr, uint32_t a5d0_result_byte,
    const IsaacRoomTransitionEngine408830Plan* direct_830,
    const IsaacRoomTransitionEngine408830Plan* nested_830,
    int32_t reset_host_calls, int32_t rewind_host_calls,
    IsaacRoomTransitionEngine7abe20BodyPlan* out) {
  if (out == nullptr) return;
  /* N9 - the whole composed body of FUN_007abe20. The two 0x00408830
     instantiations are v9 plans the CALLER built from its own separate
     observations - rebuilding them here would fold the four post-allocator
     re-reads onto one input each (defect class 1). Null plans count as zero
     residual host calls on both sides (test contract). */
  const IsaacRoomTransitionEngine408830Plan empty830 = {};
  const IsaacRoomTransitionEngine408830Plan* direct =
      direct_830 != nullptr ? direct_830 : &empty830;
  const IsaacRoomTransitionEngine408830Plan* nested =
      nested_830 != nullptr ? nested_830 : &empty830;

  const int32_t matched =
      isaac_room_transition_engine_7abe20_nested_830_needed(a5d0_result_byte);
  const int32_t nested_830_host_calls =
      matched != 0 ? static_cast<int32_t>(nested->host_calls) : 0;
  const int32_t a5d0_warn_host = matched != 0 ? 0 : 1;
  const int32_t a5d0_host_calls = a5d0_warn_host + nested_830_host_calls;
  const int32_t effective_rewind_host =
      matched != 0 ? rewind_host_calls : 0;

  /* The nine records in PE order; the two AL-gated records (0x007abe65 /
     0x007abe6a) execute only when matched, exactly as the `je` at 0x007abe60
     skips them by CONTROL FLOW on the miss path. */
  IsaacRoomTransitionEngine7abe20BodyStep* s = out->steps;

  s[0].pe_va = 0x007abe2eu;
  s[0].kind = ISAAC_ROOM_TRANSITION_ENGINE_7ABE20_STEP_STORE;
  s[0].offset = ISAAC_ROOM_TRANSITION_ENGINE_ENTRY_139A_OFF;
  s[0].value = 0u;
  s[0].width = 1u;
  s[0].gated = 0u;
  s[0].ran = 1u;
  s[0].owner = ISAAC_ROOM_TRANSITION_ENGINE_OWNER_PURE;
  s[0].host_calls = 0u;

  s[1].pe_va = ISAAC_ROOM_TRANSITION_ENGINE_7ABE20_407F10_CALL_VA;
  s[1].kind = ISAAC_ROOM_TRANSITION_ENGINE_7ABE20_STEP_CALL;
  s[1].offset = ISAAC_ROOM_TRANSITION_ENGINE_7ABE20_RESET_RECEIVER_OFF;
  s[1].value = ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_407F10;
  s[1].width = 0u;
  s[1].gated = 0u;
  s[1].ran = 1u;
  s[1].owner = ISAAC_ROOM_TRANSITION_ENGINE_OWNER_ANM2;
  s[1].host_calls = static_cast<uint32_t>(reset_host_calls);

  s[2].pe_va = ISAAC_ROOM_TRANSITION_ENGINE_STORE_VA_14C;
  s[2].kind = ISAAC_ROOM_TRANSITION_ENGINE_7ABE20_STEP_STORE;
  s[2].offset = ISAAC_ROOM_TRANSITION_ENGINE_ENTRY_14C_OFF;
  s[2].value = 0x3f800000u; /* float 1.0 raw bits */
  s[2].width = 4u;
  s[2].gated = 0u;
  s[2].ran = 1u;
  s[2].owner = ISAAC_ROOM_TRANSITION_ENGINE_OWNER_PURE;
  s[2].host_calls = 0u;

  s[3].pe_va = ISAAC_ROOM_TRANSITION_ENGINE_7ABE20_408830_CALL_VA;
  s[3].kind = ISAAC_ROOM_TRANSITION_ENGINE_7ABE20_STEP_CALL;
  s[3].offset = ISAAC_ROOM_TRANSITION_ENGINE_ENTRY_98_OFF;
  s[3].value = ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_408830;
  s[3].width = 0u;
  s[3].gated = 0u;
  s[3].ran = 1u;
  s[3].owner = ISAAC_ROOM_TRANSITION_ENGINE_OWNER_THIS;
  s[3].host_calls = static_cast<uint32_t>(direct->host_calls);

  s[4].pe_va = ISAAC_ROOM_TRANSITION_ENGINE_7ABE20_A5D0_CALL_VA;
  s[4].kind = ISAAC_ROOM_TRANSITION_ENGINE_7ABE20_STEP_CALL;
  s[4].offset = ISAAC_ROOM_TRANSITION_ENGINE_ENTRY_48_OFF;
  s[4].value = ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_40A5D0;
  s[4].width = 0u;
  s[4].gated = 0u;
  s[4].ran = 1u;
  s[4].owner = ISAAC_ROOM_TRANSITION_ENGINE_OWNER_THIS;
  s[4].host_calls = static_cast<uint32_t>(a5d0_host_calls);

  s[5].pe_va = ISAAC_ROOM_TRANSITION_ENGINE_7ABE20_40A1B0_CALL_VA;
  s[5].kind = ISAAC_ROOM_TRANSITION_ENGINE_7ABE20_STEP_CALL;
  s[5].offset = ISAAC_ROOM_TRANSITION_ENGINE_ENTRY_78_OFF;
  s[5].value = ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_40A1B0;
  s[5].width = 0u;
  s[5].gated = 1u;
  s[5].ran = static_cast<uint32_t>(matched);
  s[5].owner = ISAAC_ROOM_TRANSITION_ENGINE_OWNER_ANM2;
  s[5].host_calls = static_cast<uint32_t>(effective_rewind_host);

  s[6].pe_va = ISAAC_ROOM_TRANSITION_ENGINE_STORE_VA_8C;
  s[6].kind = ISAAC_ROOM_TRANSITION_ENGINE_7ABE20_STEP_STORE;
  s[6].offset = ISAAC_ROOM_TRANSITION_ENGINE_ENTRY_8C_OFF;
  s[6].value = 1u;
  s[6].width = 1u;
  s[6].gated = 1u;
  s[6].ran = static_cast<uint32_t>(matched);
  s[6].owner = ISAAC_ROOM_TRANSITION_ENGINE_OWNER_PURE;
  s[6].host_calls = 0u;

  s[7].pe_va = ISAAC_ROOM_TRANSITION_ENGINE_STORE_VA_139A_TAIL;
  s[7].kind = ISAAC_ROOM_TRANSITION_ENGINE_7ABE20_STEP_STORE;
  s[7].offset = ISAAC_ROOM_TRANSITION_ENGINE_ENTRY_139A_OFF;
  s[7].value = 0u;
  s[7].width = 1u;
  s[7].gated = 0u;
  s[7].ran = 1u;
  s[7].owner = ISAAC_ROOM_TRANSITION_ENGINE_OWNER_PURE;
  s[7].host_calls = 0u;

  s[8].pe_va = ISAAC_ROOM_TRANSITION_ENGINE_STORE_VA_1398;
  s[8].kind = ISAAC_ROOM_TRANSITION_ENGINE_7ABE20_STEP_STORE;
  s[8].offset = ISAAC_ROOM_TRANSITION_ENGINE_ENTRY_1398_OFF;
  s[8].value = 1u;
  s[8].width = 1u;
  s[8].gated = 0u;
  s[8].ran = 1u;
  s[8].owner = ISAAC_ROOM_TRANSITION_ENGINE_OWNER_PURE;
  s[8].host_calls = 0u;

  out->rewind_needed =
      isaac_room_transition_engine_7abe20_rewind_needed(a5d0_result_byte);
  out->nested_830_ran = matched;
  out->a5d0_warn_host = a5d0_warn_host;
  out->reset_host_calls = reset_host_calls;
  out->direct_830_host_calls = static_cast<int32_t>(direct->host_calls);
  out->nested_830_host_calls = nested_830_host_calls;
  out->a5d0_host_calls = a5d0_host_calls;
  out->rewind_host_calls = effective_rewind_host;
  out->host_calls = reset_host_calls + static_cast<int32_t>(direct->host_calls) +
                    a5d0_host_calls + effective_rewind_host;
  out->pure_complete = out->host_calls == 0 ? 1 : 0;
  out->direct_arg_ok =
      (direct_830 != nullptr && direct_830->final_4 == 0u) ? 1 : 0;
  /* arg2 == 1 at the 0x007abe51 push: low byte nonzero selects 0x00408830. */
  out->nested_830_callee_va =
      isaac_room_transition_engine_40a5d0_match_callee(
          ISAAC_ROOM_TRANSITION_ENGINE_7ABE20_A5D0_ARG2);
  out->nested_830_data =
      (matched != 0 && nested_830 != nullptr) ? nested_830->final_4 : 0u;
  isaac_room_transition_engine_7abe20_receivers(entry_ptr, &out->receivers);
}

/* ---------------------------------------------------------------------------
   v11 - THE PLAYER-RESET LANE (0x0082f08f..0x0082f0b2) + THE INDEX LAW.
   Three stores (360, 364 - +0.0f; 410 - byte 0) plus index_after =
   (eligible ? reloaded : top) + 1, 32-bit wrap (N10).
   ------------------------------------------------------------------------- */

extern "C" int32_t isaac_room_transition_engine_82ee40_player_reset_index_after(
    int32_t entry_eligible, int32_t index_at_top, int32_t index_reloaded) {
  /* 0x0082f0b9 `inc eax`. entry_eligible nonzero (field_2c == 0) means the
     0x0082f097 reload ran and its value feeds the inc; zero means the inc
     consumed the 0x0082f03a read. The two index inputs are SEPARATE live
     observations - folding the reload across the body is defect class 1. */
  const int32_t base =
      entry_eligible != 0 ? index_reloaded : index_at_top;
  return static_cast<int32_t>(static_cast<uint32_t>(base) + 1u);
}

extern "C" void isaac_room_transition_engine_82ee40_player_reset_store_plan(
    IsaacRoomTransitionEnginePlayerResetStorePlan* out) {
  if (out == nullptr) return;
  /* Static three-store reset plan (PE order 360, 364, 410, VAs as anchors).
     Both floats are the v7/D1 BSS zero-at-load +0.0f (raw bits 0). */
  out->stores[0].offset = ISAAC_ROOM_TRANSITION_ENGINE_PLAYER_F360_OFF;
  out->stores[0].value = ISAAC_ROOM_TRANSITION_ENGINE_C7B640_BITS;
  out->stores[0].pe_va = ISAAC_ROOM_TRANSITION_ENGINE_STORE_VA_F360;
  out->stores[0].width = 4u;

  out->stores[1].offset = ISAAC_ROOM_TRANSITION_ENGINE_PLAYER_F364_OFF;
  out->stores[1].value = ISAAC_ROOM_TRANSITION_ENGINE_C7B644_BITS;
  out->stores[1].pe_va = ISAAC_ROOM_TRANSITION_ENGINE_STORE_VA_F364;
  out->stores[1].width = 4u;

  out->stores[2].offset = ISAAC_ROOM_TRANSITION_ENGINE_PLAYER_410_OFF;
  out->stores[2].value = 0u;
  out->stores[2].pe_va = ISAAC_ROOM_TRANSITION_ENGINE_STORE_VA_410;
  out->stores[2].width = 1u;
}

extern "C" void isaac_room_transition_engine_82ee40_player_reset_plan(
    int32_t entry_eligible, int32_t index_at_top, int32_t index_reloaded,
    IsaacRoomTransitionEnginePlayerResetPlan* out) {
  if (out == nullptr) return;
  /* Fused reset lane: the three stores plus the index law (60 B). */
  out->stores[0].offset = ISAAC_ROOM_TRANSITION_ENGINE_PLAYER_F360_OFF;
  out->stores[0].value = ISAAC_ROOM_TRANSITION_ENGINE_C7B640_BITS;
  out->stores[0].pe_va = ISAAC_ROOM_TRANSITION_ENGINE_STORE_VA_F360;
  out->stores[0].width = 4u;
  out->stores[1].offset = ISAAC_ROOM_TRANSITION_ENGINE_PLAYER_F364_OFF;
  out->stores[1].value = ISAAC_ROOM_TRANSITION_ENGINE_C7B644_BITS;
  out->stores[1].pe_va = ISAAC_ROOM_TRANSITION_ENGINE_STORE_VA_F364;
  out->stores[1].width = 4u;
  out->stores[2].offset = ISAAC_ROOM_TRANSITION_ENGINE_PLAYER_410_OFF;
  out->stores[2].value = 0u;
  out->stores[2].pe_va = ISAAC_ROOM_TRANSITION_ENGINE_STORE_VA_410;
  out->stores[2].width = 1u;
  const int32_t index_after =
      isaac_room_transition_engine_82ee40_player_reset_index_after(
          entry_eligible, index_at_top, index_reloaded);
  out->index_after = index_after;
  out->index_stored_back = index_after; /* 0x0082f0c0 store-back == inc */
  out->reload_used = entry_eligible != 0 ? 1 : 0;
}

extern "C" uint32_t isaac_room_transition_engine_pure_helpers_abi_version(void) {
  return ISAAC_ROOM_TRANSITION_ENGINE_PURE_HELPERS_ABI_VERSION;
}

/* ===========================================================================
   v12 - FUN_0040a1b0 AnimationState::Rewind whole body + the 0x00408c90
   bitset loop it calls. The machine bodies of the OTHER host callees
   (0x00407f10 ANM2::Reset, 0x00408830, 0x00408970, and the 0x0040a5d0 tail
   pair) remain host; these exports compute the pure decision surface of
   Rewind: the three unconditional dword-zero stores, the bitset result
   (STORE unless ordered-equal; NaN falls through - see the flag law in the
   header), and the two zero-loop plans (counts + buffer addresses + needs
   gates). The host still APPLIES the zeroing (the buffers live outside the
   Game capture), so the 0x0040a1b0 record is NARROWED, not removed.
   ========================================================================= */

static inline uint32_t rte_load32_mem(const uint8_t* mem, uint32_t off) {
  return uint32_t(mem[off]) | (uint32_t(mem[off + 1u]) << 8) |
         (uint32_t(mem[off + 2u]) << 16) | (uint32_t(mem[off + 3u]) << 24);
}

extern "C" void isaac_room_transition_engine_408c90_plan(
    const uint8_t* mem, uint32_t this_off, uint32_t threshold_bits,
    uint32_t f18_in, uint32_t f1c_in, int32_t iteration_limit,
    IsaacRoomTransitionEngine408c90Plan* out) {
  if (out == nullptr) return;
  out->entered = 0;
  out->iterations = 0;
  out->f18 = f18_in;
  out->f1c = f1c_in;
  out->warn_data_null = 0;
  out->fault = 0;
  out->truncated = 0;

  uint32_t data =
      rte_load32_mem(mem, this_off + ISAAC_ROOM_TRANSITION_ENGINE_408C90_DATA_OFF);
  if (data == 0u) { /* 0x00408c9a test edi,edi */
    out->warn_data_null = 1; /* 0x00408c9e warn record {0x10, 0xb1a504} */
    data = rte_load32_mem(
        mem, this_off + ISAAC_ROOM_TRANSITION_ENGINE_408C90_DATA_OFF); /* re-read */
  }
  if (data == 0u) {
    /* 0x00408cb4 cmp [0+0x2c],0 dereferences a null page -> PE AV. */
    out->fault = 1;
    return;
  }
  uint32_t count =
      rte_load32_mem(mem, data + ISAAC_ROOM_TRANSITION_ENGINE_408C90_COUNT_OFF);
  if (count == 0u) return; /* 0x00408cb7 jbe: UNSIGNED, skip iff 0 */
  out->entered = 1;

  float threshold;
  __builtin_memcpy(&threshold, &threshold_bits, sizeof(threshold));
  uint32_t edx = 0;
  for (;;) {
    if (iteration_limit >= 0 && out->iterations >= iteration_limit) {
      out->truncated = 1;
      return;
    }
    uint32_t base =
        rte_load32_mem(mem, data + ISAAC_ROOM_TRANSITION_ENGINE_408C90_PAIRS_OFF);
    uint32_t val = rte_load32_mem(
        mem, base + edx * 8u + ISAAC_ROOM_TRANSITION_ENGINE_408C90_VAL_OFF);
    const float fv = static_cast<float>(static_cast<int32_t>(val)); /* cvtdq2ps, SIGNED */
    out->iterations += 1;
    /* 0x00408ccc ucomiss / 0x00408ccf lahf / 0x00408cd0 test ah,0x44 /
       0x00408cd3 jp: jp is taken iff ZF XOR PF == 1, i.e. ONLY for
       ordered-equal. Less, greater and NaN (ZF=PF=1 -> even parity) all
       fall through and STORE. skip == (fv == threshold). */
    if (!(fv == threshold)) {
      const uint32_t key = rte_load32_mem(
          mem, base + edx * 8u + ISAAC_ROOM_TRANSITION_ENGINE_408C90_KEY_OFF);
      out->f18 |= (1u << (key & 31u)); /* bts: index mod 32 */
      out->f1c |= (1u << (key & 31u));
    }
    edx += 1u;
    count = rte_load32_mem(
        mem, data + ISAAC_ROOM_TRANSITION_ENGINE_408C90_COUNT_OFF); /* re-read */
    if (!(edx < count)) break; /* 0x00408cf7 jb: UNSIGNED */
  }
}

extern "C" void isaac_room_transition_engine_40a1b0_zero_plan(
    const uint8_t* mem, uint32_t this_off,
    IsaacRoomTransitionEngine40a1b0ZeroPlan* out) {
  if (out == nullptr) return;
  out->count_a = 0;
  out->buf_a = 0;
  out->needs_a = 0;
  out->count_b = 0;
  out->buf_b = 0;
  out->needs_b = 0;
  uint32_t data =
      rte_load32_mem(mem, this_off + ISAAC_ROOM_TRANSITION_ENGINE_408C90_DATA_OFF);
  if (data == 0u) return; /* PE would AV reading [0+0x1c]; plan stays zeroed */
  out->count_a = rte_load32_mem(
      mem, data + ISAAC_ROOM_TRANSITION_ENGINE_ANIMSTATE_COUNT_A_OFF);
  out->buf_a = rte_load32_mem(
      mem, this_off + ISAAC_ROOM_TRANSITION_ENGINE_ANIMSTATE_BUF_A_OFF);
  out->needs_a = (out->count_a != 0u) ? 1 : 0; /* jbe: UNSIGNED, <=0 == 0 */
  out->count_b = rte_load32_mem(
      mem, data + ISAAC_ROOM_TRANSITION_ENGINE_ANIMSTATE_COUNT_B_OFF);
  out->buf_b = rte_load32_mem(
      mem, this_off + ISAAC_ROOM_TRANSITION_ENGINE_ANIMSTATE_BUF_B_OFF);
  out->needs_b = (out->count_b != 0u) ? 1 : 0; /* jbe: UNSIGNED, <=0 == 0 */
}

extern "C" void isaac_room_transition_engine_40a1b0_rewind_plan(
    const uint8_t* mem, uint32_t this_off, int32_t iteration_limit,
    IsaacRoomTransitionEngine40a1b0RewindPlan* out) {
  if (out == nullptr) return;
  out->stores[0].disp = ISAAC_ROOM_TRANSITION_ENGINE_ANIMSTATE_F10_OFF;
  out->stores[0].width = 4u;
  out->stores[0].imm = 0u;
  out->stores[0].va = ISAAC_ROOM_TRANSITION_ENGINE_40A1B0_VA_STORE_F10;
  out->stores[1].disp = ISAAC_ROOM_TRANSITION_ENGINE_ANIMSTATE_F18_OFF;
  out->stores[1].width = 4u;
  out->stores[1].imm = 0u;
  out->stores[1].va = ISAAC_ROOM_TRANSITION_ENGINE_40A1B0_VA_STORE_F18;
  out->stores[2].disp = ISAAC_ROOM_TRANSITION_ENGINE_ANIMSTATE_F1C_OFF;
  out->stores[2].width = 4u;
  out->stores[2].imm = 0u;
  out->stores[2].va = ISAAC_ROOM_TRANSITION_ENGINE_40A1B0_VA_STORE_F1C;
  out->entered = 0;
  out->iterations = 0;
  out->f18 = 0;
  out->f1c = 0;
  out->warn_data_null = 0;
  out->fault = 0;
  out->truncated = 0;
  out->zero.count_a = 0;
  out->zero.buf_a = 0;
  out->zero.needs_a = 0;
  out->zero.count_b = 0;
  out->zero.buf_b = 0;
  out->zero.needs_b = 0;

  /* 0x0040a1c8 call 0x408c90 - the f10/f18/f1c stores above are exactly the
     threshold and accumulators the callee reads, so it runs with 0/0/0. */
  IsaacRoomTransitionEngine408c90Plan bits;
  isaac_room_transition_engine_408c90_plan(mem, this_off, 0u, 0u, 0u,
                                           iteration_limit, &bits);
  out->entered = bits.entered;
  out->iterations = bits.iterations;
  out->f18 = bits.f18;
  out->f1c = bits.f1c;
  out->warn_data_null = bits.warn_data_null;
  out->fault = bits.fault;
  out->truncated = bits.truncated;
  if (bits.fault != 0) return;
  isaac_room_transition_engine_40a1b0_zero_plan(mem, this_off, &out->zero);
}

/* ============================================================================
   v13 - FUN_00956780 anim-0x12 / 7abcc0 SFX-prep xorshift core.
   Map lookup 0x004288a0, CRT TLS 0x00aef29d, log 0x00a112c0 and Play
   0x0092dc30 stay host. [edi] is never read; stores 0x25 then maybe 0x12d.
   ==========================================================================*/

extern "C" int32_t isaac_room_transition_engine_956780_gate(
    int32_t game, uint32_t node_byte_d, int32_t node_field_10,
    uint32_t node_ptr, uint32_t sentinel) {
  /* 0x009567ae test eax,eax / je skip
     0x009567d5 cmp byte [eax+0xd],0 / jne skip  -- BYTE
     0x009567df cmp dword [eax+0x10],7 / jg skip -- SIGNED
     0x009567e9 cmp eax,[esi] / je skip */
  if (game == 0) {
    return 0;
  }
  if ((node_byte_d & 0xffu) != 0u) {
    return 0;
  }
  if (node_field_10 > 7) {
    return 0;
  }
  if (node_ptr == sentinel) {
    return 0;
  }
  return 1;
}

extern "C" uint32_t isaac_room_transition_engine_956780_xorshift(
    uint32_t seed, uint32_t shift_a, uint32_t shift_b, uint32_t shift_c) {
  /* CL-masked counts: shr/shl eax/edx/esi, cl. Mask is hardware & 31. */
  const uint32_t mask = ISAAC_ROOM_TRANSITION_ENGINE_956780_CL_MASK;
  uint32_t s = seed;
  s ^= s >> (shift_a & mask);
  s ^= s << (shift_b & mask);
  s ^= s >> (shift_c & mask);
  return s;
}

extern "C" uint32_t isaac_room_transition_engine_956780_mod20(uint32_t value) {
  /* 0x00956850 mov eax,0xcccccccd / mul esi / shr edx,4 /
     lea eax,[edx+edx*4] / shl eax,2 / sub esi,eax */
  const uint64_t prod =
      static_cast<uint64_t>(value) *
      static_cast<uint64_t>(ISAAC_ROOM_TRANSITION_ENGINE_956780_MAGIC);
  const uint32_t hi = static_cast<uint32_t>(prod >> 32);
  const uint32_t q = hi >> ISAAC_ROOM_TRANSITION_ENGINE_956780_MAGIC_SHIFT;
  return value - q * ISAAC_ROOM_TRANSITION_ENGINE_956780_MODULUS;
}

extern "C" uint32_t isaac_room_transition_engine_956780_remap_id(
    uint32_t remainder) {
  /* 0x0095686c jne keep-0x25 / 0x0095686e mov dword [edi],0x12d */
  return remainder == 0u ? ISAAC_ROOM_TRANSITION_ENGINE_956780_ID_RARE
                         : ISAAC_ROOM_TRANSITION_ENGINE_956780_ID_COMMON;
}

extern "C" void isaac_room_transition_engine_956780_plan(
    int32_t game, uint32_t node_byte_d, int32_t node_field_10,
    uint32_t node_ptr, uint32_t sentinel, int32_t id_in, uint32_t seed,
    uint32_t seed_reread, uint32_t shift_a, uint32_t shift_b, uint32_t shift_c,
    IsaacRoomTransitionEngine956780Plan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t ran = isaac_room_transition_engine_956780_gate(
      game, node_byte_d, node_field_10, node_ptr, sentinel);
  if (ran == 0) {
    out->ran = 0;
    out->seed_warn = 0;
    out->seed_fault = 0;
    out->seed_after = seed;
    out->remainder = 0;
    out->id_out = id_in;
    out->store_25 = 0;
    out->store_12d = 0;
    return;
  }
  /* 0x00956806 mov dword [edi],0x25 happens BEFORE the seed test. */
  out->ran = 1;
  out->seed_warn = 0;
  out->seed_fault = 0;
  out->seed_after = seed;
  out->remainder = 0;
  out->id_out = ISAAC_ROOM_TRANSITION_ENGINE_956780_ID_COMMON;
  out->store_25 = 1;
  out->store_12d = 0;
  uint32_t live = seed;
  if (live == 0u) {
    /* 0x0095681d call 0xa112c0 then 0x00956822 re-read seed. */
    out->seed_warn = 1;
    live = seed_reread;
    if (live == 0u) {
      out->seed_fault = 1;
      out->seed_after = 0u;
      return;
    }
  }
  const uint32_t shifted = isaac_room_transition_engine_956780_xorshift(
      live, shift_a, shift_b, shift_c);
  /* 0x0095685b store-back ESI (xorshift result) BEFORE the modulo subtract. */
  out->seed_after = shifted;
  out->remainder = isaac_room_transition_engine_956780_mod20(shifted);
  if (out->remainder == 0u) {
    out->store_12d = 1;
    out->id_out = ISAAC_ROOM_TRANSITION_ENGINE_956780_ID_RARE;
  }
}

/* ===========================================================================
   v14 - FUN_004288a0 sorted-map lower-bound walk (FULLY PURE, ret 8).
   Called from the v13 SFX-prep at 0x9567cd (this = Game+0x1bbd8, key 7);
   204 direct E8 callers image-wide - a shared map primitive. Every pointer
   is an offset into `mem` (v12 mem-plan convention). Law (instruction
   stream 0x4288a0..0x4288e8):
     root = [this]; node = [root+4]; out = {node, 0, root};
     if byte [node+0xd] != 0 -> return (first node terminates);
     key; loop: out[0]=node;
       SIGNED [node+0x10] >= key -> out[8]=node (BEFORE the move), flag=1,
         node=[node+0];  else flag=0, node=[node+8];
       out[4]=flag; if byte [node+0xd] != 0 -> return; else loop.
   ========================================================================= */

extern "C" void isaac_room_transition_engine_4288a0_lookup(
    const uint8_t* mem, uint32_t this_off, int32_t key,
    int32_t iteration_limit, IsaacRoomTransitionEngine4288a0Lookup* out) {
  if (out == nullptr) {
    return;
  }
  out->node0 = 0;
  out->flag4 = 0;
  out->node8 = 0;
  out->root = 0;
  out->entered = 0;
  out->iterations = 0;
  out->truncated = 0;

  /* 0x004288a3 mov ecx,[ecx] / 0x004288a8 mov eax,[ecx+4] */
  const uint32_t root = rte_load32_mem(mem, this_off);
  uint32_t node =
      rte_load32_mem(mem, root + ISAAC_ROOM_TRANSITION_ENGINE_4288A0_ROOT_NODE_OFF);
  out->node0 = node;
  out->flag4 = 0;
  out->node8 = root;
  out->root = root;

  /* 0x004288b7 cmp byte [eax+0xd],0 / 0x004288bb jne end - BYTE gate. */
  if ((mem[(node + ISAAC_ROOM_TRANSITION_ENGINE_4288A0_NODE_BYTE_D_OFF) &
           0xffffffffu] &
       0xffu) != 0u) {
    return;
  }
  out->entered = 1;

  for (;;) {
    if (iteration_limit >= 0 && out->iterations >= iteration_limit) {
      out->truncated = 1;
      return;
    }
    out->node0 = node; /* 0x004288c3 mov [edx],eax */
    const int32_t field10 = static_cast<int32_t>(rte_load32_mem(
        mem, node + ISAAC_ROOM_TRANSITION_ENGINE_4288A0_NODE_FIELD_10_OFF));
    if (field10 >= key) { /* 0x004288c8 jge - SIGNED */
      out->node8 = node; /* 0x004288d1 mov [edx+8],eax BEFORE the move */
      out->flag4 = 1;
      node = rte_load32_mem(
          mem, node + ISAAC_ROOM_TRANSITION_ENGINE_4288A0_NODE_NEXT_GE_OFF);
    } else {
      out->flag4 = 0;
      node = rte_load32_mem(
          mem, node + ISAAC_ROOM_TRANSITION_ENGINE_4288A0_NODE_NEXT_LT_OFF);
    }
    out->iterations += 1;
    /* 0x004288de cmp byte [eax+0xd],0 / 0x004288e2 je LOOP: nonzero exits. */
    if ((mem[(node + ISAAC_ROOM_TRANSITION_ENGINE_4288A0_NODE_BYTE_D_OFF) &
             0xffffffffu] &
         0xffu) != 0u) {
      return;
    }
  }
}

/* ===========================================================================
   v15 - FUN_004288f0 / FUN_00428910 map-result getters (FULLY PURE, ret 4).
   The two 12-byte bodies right after the v14 walk; 40 / 50 direct E8 callers
   image-wide, none on the engine's own edge path. Both thiscall with one
   stack arg `out` (the 4288a0 walk triple); zero calls, zero branches, zero
   byte gates - plain dword copies:
     0x4288f0: [this+0x33c]=out[0] / [this+0x340]=out[4]
     0x428910: [this+0x360]=out[0] / [this+0x364]=out[4]
   The plans carry the two stored dwords; the receiver offsets are the
   DST_*_OFF constants a future wire applies them to.
   =========================================================================*/

extern "C" void isaac_room_transition_engine_4288f0_copy(
    const uint8_t* mem, uint32_t out_off,
    IsaacRoomTransitionEngine4288f0Copy* out) {
  if (out == nullptr) {
    return;
  }
  /* 0x004288f6 mov eax,[edx] / 0x004288fe mov eax,[edx+4] - dword loads. */
  out->node0 = rte_load32_mem(
      mem, out_off + ISAAC_ROOM_TRANSITION_ENGINE_4288A0_LOOKUP_NODE0_OFF);
  out->flag4 = rte_load32_mem(
      mem, out_off + ISAAC_ROOM_TRANSITION_ENGINE_4288A0_LOOKUP_FLAG4_OFF);
}

extern "C" void isaac_room_transition_engine_428910_copy(
    const uint8_t* mem, uint32_t out_off,
    IsaacRoomTransitionEngine428910Copy* out) {
  if (out == nullptr) {
    return;
  }
  /* 0x00428916 mov eax,[edx] / 0x0042891e mov eax,[edx+4] - dword loads. */
  out->node0 = rte_load32_mem(
      mem, out_off + ISAAC_ROOM_TRANSITION_ENGINE_4288A0_LOOKUP_NODE0_OFF);
  out->flag4 = rte_load32_mem(
      mem, out_off + ISAAC_ROOM_TRANSITION_ENGINE_4288A0_LOOKUP_FLAG4_OFF);
}

/* ===========================================================================
   v16 - FUN_00428940 xorshift128+-style RNG core (ret 4) + FUN_00428a80
   bit setter/clearer (ret 8). 48 / 10 direct E8 callers image-wide; both
   address-stable (identify-zhl empty). 0x428940: state = 4 dword lanes
   (two 64-bit words, LE); lane0 is xorshift32'd three times with counts
   from the OTHER lanes' low bytes (dword loads, CL, hardware & 31), then
   a final xorshift32 with the .rdata constants (11, 7, 12) at 0xb1f7e0 /
   0xb1f7e8; the four 0xa112c0 CRT assert walls are data-dependent traps
   that never alter the arithmetic (host edges, gated out). Receiver
   stores recv+0x58/+0x5c/+0x60/+0x64; the state lane0 write-back is
   step60 (the final combine never stores back). 0x428a80: signed clamps
   index to [0, 25] (cmovle <= 0, jge >= 25 -> 25), word = idx >> 5,
   bit = idx & 0x1f, dword at this+0x1839c + word*4 |= / &= ~(1 << bit)
   by the flag byte; its 0x428ad0 call to 0x42a030 (jae >= 0x1a,
   UNSIGNED) is STATICALLY UNREACHABLE after the clamps (idx in
   [0, 25] < 0x1a) - dead compiler assert leftover, gated out.
   =========================================================================*/

extern "C" uint32_t isaac_room_transition_engine_428940_xorshift(
    uint32_t x, uint32_t c1, uint32_t c2, uint32_t c3) {
  /* 0x42896f/0x428978/0x428981 CL shifts: dword count loads at 0x42896a/
     0x428971/0x42897a, CL = low byte (& 0xff), hardware masks to & 31. */
  const uint32_t mask =
      static_cast<uint32_t>(ISAAC_ROOM_TRANSITION_ENGINE_428940_CL_MASK);
  uint32_t s = x;
  s ^= s >> ((c1 & 0xffu) & mask);
  s ^= s << ((c2 & 0xffu) & mask);
  s ^= s >> ((c3 & 0xffu) & mask);
  return s;
}

extern "C" void isaac_room_transition_engine_428940_plan(
    const uint8_t* mem, uint32_t state_off,
    IsaacRoomTransitionEngine428940Plan* out) {
  if (out == nullptr) {
    return;
  }
  /* 0x0042894e mov eax,[esi] - state lane0 (also the wall-1 gate input). */
  const uint32_t lane0 = rte_load32_mem(
      mem, state_off + ISAAC_ROOM_TRANSITION_ENGINE_428940_STATE_LANE0_OFF);
  /* 0x42896a/0x428971/0x42897a dword count loads; CL takes the low byte. */
  const uint32_t c1 = rte_load32_mem(
      mem, state_off + ISAAC_ROOM_TRANSITION_ENGINE_428940_STATE_LANE1_OFF);
  const uint32_t c2 = rte_load32_mem(
      mem, state_off + ISAAC_ROOM_TRANSITION_ENGINE_428940_STATE_LANE2_OFF);
  const uint32_t c3 = rte_load32_mem(
      mem, state_off + ISAAC_ROOM_TRANSITION_ENGINE_428940_STATE_LANE3_OFF);
  const uint32_t step58 = isaac_room_transition_engine_428940_xorshift(
      lane0, c1, c2, c3); /* 0x42896a core 1 */
  const uint32_t step5c = isaac_room_transition_engine_428940_xorshift(
      step58, c1, c2, c3); /* 0x4289a6 core 2 */
  const uint32_t step60 = isaac_room_transition_engine_428940_xorshift(
      step5c, c1, c2, c3); /* 0x4289e2 core 3 */
  /* 0x4289e7 movq xmm0,[0xb1f7e0] / 0x428a0c mov esi,[0xb1f7e8] - the
     final xorshift's counts (11, 7, 12). */
  const uint32_t step64 = isaac_room_transition_engine_428940_xorshift(
      step60,
      static_cast<uint32_t>(ISAAC_ROOM_TRANSITION_ENGINE_428940_SHIFT_CONST_0),
      static_cast<uint32_t>(ISAAC_ROOM_TRANSITION_ENGINE_428940_SHIFT_CONST_1),
      static_cast<uint32_t>(ISAAC_ROOM_TRANSITION_ENGINE_428940_SHIFT_CONST_2));
  out->step58 = step58; /* 0x428987 mov [ebx+0x58],edx */
  out->step5c = step5c; /* 0x4289c3 mov [ebx+0x5c],edx */
  out->step60 = step60; /* 0x428a12 mov [ebx+0x60],edi */
  out->step64 = step64; /* 0x428a43 mov [ebx+0x64],eax */
  /* 0x428a0a mov [esi],edi - lane0 write-back is step60; the final
     combine (0x428a27) never stores back to the state. */
  out->state0_after = step60;
}

extern "C" void isaac_room_transition_engine_428a80_bit_plan(
    const uint8_t* mem, uint32_t this_off, int32_t index, uint32_t flag,
    IsaacRoomTransitionEngine428a80BitPlan* out) {
  if (out == nullptr) {
    return;
  }
  /* 0x428a90 cmovle ecx,eax - SIGNED <= 0 clamp; 0x428a96 jge 0x428a9f /
     mov ecx,0x19 - SIGNED >= 25 clamp to 25. */
  int32_t idx = index;
  if (idx <= 0) {
    idx = 0;
  } else if (idx >= ISAAC_ROOM_TRANSITION_ENGINE_428A80_INDEX_MAX) {
    idx = ISAAC_ROOM_TRANSITION_ENGINE_428A80_INDEX_MAX;
  }
  /* 0x428a98 cmp ecx,0x1a / 0x428a9b jae 0x428ad0 - the UNSIGNED >= 26
     bound edge to 0x42a030 is STATICALLY UNREACHABLE here (idx in
     [0, 25]): dead compiler assert leftover, documented and gated. */
  const uint32_t uidx = static_cast<uint32_t>(idx);
  const uint32_t word = uidx >> ISAAC_ROOM_TRANSITION_ENGINE_428A80_WORD_SHIFT; /* 0x428aa9 shr eax,5 */
  const uint32_t bit = uidx & 0x1fu; /* 0x428aa6 and ecx,0x1f */
  const uint32_t mask = 1u << bit;   /* 0x428aaf mov eax,1 / 0x428ab4 shl eax,cl */
  const uint32_t slot_off = this_off +
      ISAAC_ROOM_TRANSITION_ENGINE_428A80_BITS_BASE_OFF + word * 4u;
  uint32_t dword = rte_load32_mem(mem, slot_off); /* 0x428aba mov ecx,[edx] */
  int32_t set = 0;
  if ((flag & 0xffu) != 0u) { /* 0x428ab6 cmp byte [ebp+0xc],0 / je clear */
    dword |= mask;            /* 0x428abe or ecx,eax */
    set = 1;
  } else {
    dword &= ~mask;           /* 0x428ac6 not eax / 0x428ac8 and eax,ecx */
  }
  out->index_clamped = idx;
  out->word = word;
  out->bit = bit;
  out->mask = mask;
  out->dword_after = dword;   /* 0x428ac0 / 0x428aca mov [edx],... */
  out->set = set;
}

/* ===========================================================================
   v17 - FUN_00428a50 field getter (ret 0, thiscall, no stack args).
   46 direct E8 callers image-wide; address-stable (identify-zhl empty).
   Two instructions: `lea eax,[ecx+0x1258]` / `ret` (0x428a50..0x428a56,
   int3 padding to the next stub at 0x428a60) - zero calls, zero branches,
   zero stores. The lea CARRIES the effective address of the receiver's
   field at +0x1258 (canonical MSVC `uint32_t* field()` pattern: the
   callers dereference the returned pointer); the pure law is exactly the
   u32-wrapping address add. No byte gates anywhere.
   =========================================================================*/

extern "C" uint32_t isaac_room_transition_engine_428a50_field_getter(
    const uint8_t* mem, uint32_t this_off) {
  (void)mem; /* the law carries the address; the body dereferences nothing */
  /* 0x00428a50 lea eax,[ecx+0x1258] / 0x00428a56 ret - u32 wrap add. */
  return this_off + ISAAC_ROOM_TRANSITION_ENGINE_428A50_FIELD_OFF;
}

/* ===========================================================================
   v18 - FUN_00428a60 field getter + FUN_00428a70 value getter (ret 0,
   thiscall, no stack args) - the band-closing residue one-liners.
   0x428a60: 144 direct E8 callers image-wide; address-stable
   (identify-zhl empty). Two instructions: `lea eax,[ecx+0x1218]` / `ret`
   (0x428a60..0x428a66, int3 padding to 0x428a70) - zero calls, zero
   branches, zero stores. The lea CARRIES the effective address of the
   receiver's field at +0x1218 (same canonical MSVC `uint32_t* field()`
   pattern as v17's 0x428a50); the pure law is exactly the u32-wrapping
   address add. No byte gates anywhere.
   0x428a70: 2 direct E8 callers image-wide (0x5c2a21 / 0x6ca2d9, both
   this-call the loaded dword as an object pointer into 0x944a40 /
   0x944d10); address-stable (identify-zhl empty). Two instructions:
   `mov eax,[ecx+0x11f8]` / `ret` (0x428a70..0x428a76, int3 padding to
   the family's own v16 0x428a80 bit setter) - zero calls, zero branches,
   zero stores. The mov LOADS the receiver's u32 LE dword at +0x11f8 and
   returns the value; the pure law is the mem-law read at the
   u32-wrapping offset add. No byte gates anywhere.
   =========================================================================*/

extern "C" uint32_t isaac_room_transition_engine_428a60_field_getter(
    const uint8_t* mem, uint32_t this_off) {
  (void)mem; /* the law carries the address; the body dereferences nothing */
  /* 0x00428a60 lea eax,[ecx+0x1218] / 0x00428a66 ret - u32 wrap add. */
  return this_off + ISAAC_ROOM_TRANSITION_ENGINE_428A60_FIELD_OFF;
}

extern "C" uint32_t isaac_room_transition_engine_428a70_value_getter(
    const uint8_t* mem, uint32_t this_off) {
  /* 0x00428a70 mov eax,[ecx+0x11f8] / 0x00428a76 ret - u32 LE load. */
  return rte_load32_mem(mem, this_off + ISAAC_ROOM_TRANSITION_ENGINE_428A70_FIELD_OFF);
}

/* ===========================================================================
   v19 - band residue one-liners (ABI 18 -> 19): the five unclaimed stubs
   around the closed 0x428940..0x428a80 band. All address-stable
   (identify-zhl empty), zero calls/branches, zero indirect; the only
   store anywhere is 428ae0's single clamped dword. No byte gates.
   0x428930: 3 direct E8 callers (0x5b8a08/0x5d6da3/0x797cc4);
   `lea eax,[ecx+0x40]` / `ret` (0x428930..0x428933, int3 padding to the
   family's own v16 0x428940 RNG) - the u32-wrapping effective address of
   the receiver field at +0x40 (MSVC field-pointer pattern, same as v17/v18).
   0x428ae0: 13 direct E8 callers (0x5b7e69/0x5bd5d3/0x5bd718/0x5c2e10/
   0x5da97e/0x5fe3f8/0x5fe54e/0x7854e2/0x7b30fa/0x7b345e/0x7b34cd/
   0x7b3afc/0x7b5f22); ret 4. `or eax,-1; cmp edx,eax; cmovle edx,eax`
   (SIGNED low clamp to -1) then `mov eax,7; cmp edx,eax; cmovl eax,edx`
   (SIGNED high clamp to 7), one FULL-DWORD store `[this+0x18318]` at
   0x428af8, and eax at ret IS the stored clamped value. The host applies
   the constant-offset store (this_off + FIELD_OFF); the export is the pure
   clamp scalar law.
   0x428b10: ZERO direct E8 callers but exposed as a Lua-registered
   callback (`push 0x428b10` @0x8698cb); `mov eax,[ecx+0x1344]` / `ret`
   (0x428b10..0x428b16) - u32 LE load at the u32-wrapping offset add.
   0x428b50: 14 direct E8 callers (0x77c6f7/0x77e26d/0x7800c8/0x780284/
   0x7830a7/0x78312d/0x7837ab/0x783ffb/0x78468e/0x785c2b/0x788ac7/
   0x78951e/0x78a7ce/0x79e195); `mov eax,[0xc71678]` loads the BSS Game
   pointer (host-resolved - [0xc71678] is BSS, not a file-backed constant
   per the v13 precedent) then `add eax,0x1ba78` / `ret` - the
   u32-wrapping address add of the resolved base + 0x1ba78.
   0x428cd0: 9 direct E8 callers (0x5b3d08/0x5bd6bd/0x78a365/0x78a3bb/
   0x795b94/0x795be5/0x795c20/0x795c84/0x795cb3); same shape with the BSS
   Sfx global [0xc7169c] + 0x29fbc.
   The 0x705ee0 / 0x6f9000 rewind seam is game-update-slice-owned (ABI
   v74/v96/v99) and is NOT re-translated here.
   =========================================================================*/

extern "C" uint32_t isaac_room_transition_engine_428930_field_getter(
    const uint8_t* mem, uint32_t this_off) {
  (void)mem; /* the law carries the address; the body dereferences nothing */
  /* 0x00428930 lea eax,[ecx+0x40] / 0x00428933 ret - u32 wrap add. */
  return this_off + ISAAC_ROOM_TRANSITION_ENGINE_428930_FIELD_OFF;
}

extern "C" int32_t isaac_room_transition_engine_428ae0_clamp_value(
    int32_t value) {
  /* 0x428ae6 or eax,-1 / cmp edx,eax / 0x428aeb cmovle edx,eax - SIGNED
     low clamp to -1; 0x428aee mov eax,7 / cmp edx,eax / 0x428af5 cmovl
     eax,edx - SIGNED high clamp to 7. The machine stores the clamped dword
     at [this+0x18318] (0x428af8, ISAAC_..._428AE0_FIELD_OFF) and returns
     it in eax; the host applies the store. */
  int32_t v = value;
  if (v <= ISAAC_ROOM_TRANSITION_ENGINE_428AE0_CLAMP_MIN) {
    v = ISAAC_ROOM_TRANSITION_ENGINE_428AE0_CLAMP_MIN;
  } else if (v >= ISAAC_ROOM_TRANSITION_ENGINE_428AE0_CLAMP_MAX) {
    v = ISAAC_ROOM_TRANSITION_ENGINE_428AE0_CLAMP_MAX;
  }
  return v;
}

extern "C" uint32_t isaac_room_transition_engine_428b10_value_getter(
    const uint8_t* mem, uint32_t this_off) {
  /* 0x00428b10 mov eax,[ecx+0x1344] / 0x00428b16 ret - u32 LE load. */
  return rte_load32_mem(mem, this_off + ISAAC_ROOM_TRANSITION_ENGINE_428B10_FIELD_OFF);
}

extern "C" uint32_t isaac_room_transition_engine_428b50_field_getter(
    const uint8_t* mem, uint32_t this_off) {
  (void)mem; /* [0xc71678] is BSS (host-resolved); law = base + 0x1ba78 */
  /* 0x00428b50 mov eax,[0xc71678] / 0x00428b55 add eax,0x1ba78 /
     0x00428b5a ret - u32 wrap address add with this_off == the resolved
     [0xc71678] Game pointer value. */
  return this_off + ISAAC_ROOM_TRANSITION_ENGINE_428B50_FIELD_OFF;
}

extern "C" uint32_t isaac_room_transition_engine_428cd0_field_getter(
    const uint8_t* mem, uint32_t this_off) {
  (void)mem; /* [0xc7169c] is BSS (host-resolved); law = base + 0x29fbc */
  /* 0x00428cd0 mov eax,[0xc7169c] / 0x00428cd5 add eax,0x29fbc /
     0x00428cda ret - u32 wrap address add with this_off == the resolved
     [0xc7169c] Sfx global pointer value. */
  return this_off + ISAAC_ROOM_TRANSITION_ENGINE_428CD0_FIELD_OFF;
}

/* ===========================================================================
   v19 lead-up stubs (same ABI): the four one-liners between the 0x428ce0
   host SEH body and the 342-insn 0x42a030 bound handler, found by the v19
   residue sweep. All address-stable (identify-zhl empty), zero
   calls/branches, no byte gates (429550/429560 compare FULL dwords).
   0x429550: 157 direct E8 callers - the family's largest shared
   primitive. `cmp dword [ecx],2 / setge al / ret` (0x429550..0x429556):
   setge is SIGNED (SF==OF); the output byte is born 0/1.
   0x429560: 2 direct E8 callers. `cmp dword [ecx],4 / sete al / ret`
   (0x429560..0x429566): sete is signedness-free (ZF).
   0x429f20: 1 direct E8 caller. `movss xmm0,[0xbaa198] / ret`
   (0x429f20..0x429f28): loads the FILE-BACKED .rdata dword at 0xbaa198
   = 0x3e4ccccd (float 0.2f) - a pure constant law.
   0x42a020: 4 direct E8 callers. `mov dword [ecx],0 / mov eax,ecx / ret`
   (0x42a020..0x42a028): one FULL-DWORD zero store at [this+0] (host
   applies at this_off) and the receiver identity in eax.
   =========================================================================*/

extern "C" int32_t isaac_room_transition_engine_429550_ge2_check(
    const uint8_t* mem, uint32_t this_off) {
  /* 0x00429550 cmp dword [ecx],2 / 0x00429553 setge al - SIGNED >=. */
  const int32_t d = static_cast<int32_t>(rte_load32_mem(mem, this_off));
  return d >= ISAAC_ROOM_TRANSITION_ENGINE_429550_COMPARE_VALUE ? 1 : 0;
}

extern "C" int32_t isaac_room_transition_engine_429560_eq4_check(
    const uint8_t* mem, uint32_t this_off) {
  /* 0x00429560 cmp dword [ecx],4 / 0x00429563 sete al - ZF equality. */
  const uint32_t d = rte_load32_mem(mem, this_off);
  return d == static_cast<uint32_t>(ISAAC_ROOM_TRANSITION_ENGINE_429560_COMPARE_VALUE) ? 1 : 0;
}

extern "C" uint32_t isaac_room_transition_engine_429f20_float_constant(void) {
  /* 0x00429f20 movss xmm0,[0xbaa198] - the file-backed .rdata dword
     0x3e4ccccd (float 0.2f); the law is the loaded constant itself. */
  return ISAAC_ROOM_TRANSITION_ENGINE_429F20_CONST_BITS;
}

extern "C" uint32_t isaac_room_transition_engine_42a020_zero_store(
    const uint8_t* mem, uint32_t this_off) {
  (void)mem; /* the store32(mem, this_off) = 0 goes through the host */
  /* 0x0042a020 mov dword [ecx],0 / 0x0042a026 mov eax,ecx / ret - the
     eax IS the receiver identity (this_off), u32. */
  return this_off;
}

/* ===========================================================================
   v20 - the 0x42a030 bound-handler census seam (ABI 19 -> 20).
   0x42a030 is the 5-byte noreturn bitset-position throw stub: `push
   0xb1c618` ("invalid bitset position") / `call dword [0xb18468]`
   (host slot resolving to a bounds-check helper) / int3 - 19 direct E8
   callers image-wide (incl. the family's own 0x428ad0 bit-setter bound
   edge, STATICALLY UNREACHABLE after the clamps); all fatal, host.
   The 342-insn body FUN_0042a040..0x0042a1f8 (ret 8) is a sorted-map
   INSERT: SEH frame (funcinfo 0xaf1cad), this = edi, arg2 = key ptr;
   0x42a072 calls the family's own v14 walk 0x4288a0 (out triple at
   [ebp-0x20] = {last node, flag, last-GE node}, key ptr), then the
   FOUND prefix 0x42a077..0x42a08c dispatches on the walk's last-GE
   node (out[8], [ebp-0x18]):
     0x42a07a cmp byte [node+0xd],0 / jne bound   BYTE gate (+0xd == 0)
     0x42a082 cmp key,[node+0x10] / jl bound      SIGNED key >= field10
     0x42a08a [out]=node; 0x42a08c byte [out+4]=0 FOUND: flag 0
   The bound path 0x42a0a4.. is host: 0xaaaaaaa uninitialized-map guard
   -> 0x4170d0 (86 callers), malloc 0xa0f4c0(0x18), node stores
   ([+0x10]=key, [+0x14]=0, [+0]=[+4]=[+8], word [+0xc]=0), splice with
   the walk's out[0] hint, RB-style rebalance loop with rotation calls
   0x415f80/0x415fe0 (105 callers each, ecx = this) and color-byte
   flips at +0xc, then 0x42a1e1 [out]=new node / 0x42a1e3 byte
   [out+4]=1 (INSERT flag 1). The laws below carry ONLY the pure FOUND
   prefix decision (same node-byte-d / signed-field10 shape as the
   family's v13 956780 gate and v14 walk); byte gates take WIDE inputs
   masked &0xff (ISAAC_RTE_NO_NARROW_PARAMS). The machine's out stores
   are host-applied (found: node / 0; insert: new node / 1).
   The 1 direct E8 caller of 0x42a040 is the aligned-thunk wrapper
   0x429f30 (returns out[0]+0x14), itself host-adjacent.
   =========================================================================*/

extern "C" int32_t isaac_room_transition_engine_42a040_found_gate(
    uint32_t node_byte_d) {
  /* 0x0042a07a cmp byte [ecx+0xd],0 / 0x0042a07e jne bound - the walk's
     last-GE node at +0xd must be zero (byte load, wide-masked &0xff). */
  return (node_byte_d & 0xffu) == 0u ? 1 : 0;
}

extern "C" int32_t isaac_room_transition_engine_42a040_key_ge_field10(
    int32_t key, int32_t node_field_10) {
  /* 0x0042a082 cmp eax,[ecx+0x10] / 0x0042a085 jl bound - jl is SIGNED:
     found requires key >= field10 as int32. */
  return key >= node_field_10 ? 1 : 0;
}

extern "C" int32_t isaac_room_transition_engine_42a040_bound_flag(
    uint32_t node_byte_d, int32_t node_field_10, int32_t key) {
  /* The fused FOUND-prefix dispatch: the byte the machine stores at
     out[4] - 0 (ROOM_TRANSITION_ENGINE_42A040_FOUND_FLAG) when the byte
     gate holds AND key >= field10 SIGNED (the existing-key latch at
     0x42a08a/0x42a08c), else 1 (INSERT_FLAG) - the machine stores the
     host-allocated new node and the insert flag at 0x42a1e1/0x42a1e3. */
  const int32_t found =
      isaac_room_transition_engine_42a040_found_gate(node_byte_d) != 0 &&
      isaac_room_transition_engine_42a040_key_ge_field10(key, node_field_10) != 0;
  return found ? ISAAC_ROOM_TRANSITION_ENGINE_42A040_FOUND_FLAG
               : ISAAC_ROOM_TRANSITION_ENGINE_42A040_INSERT_FLAG;
}

/* ===================================================================== */
/* v21 — POST: the first post-band cluster (three FULLY PURE one-liners, */
/* all thiscall plain-ret; ZERO byte gates — sete is signedness-free).   */
/* ===================================================================== */

extern "C" int32_t isaac_room_transition_engine_42a250_eq3_check(
    uint32_t field_28) {
  /* 0x0042a250 cmp dword ptr [ecx+0x28],3 / 0x0042a254 sete al —
     EQUALITY (ZF-based), signedness-free: exactly 3 -> 1. */
  return static_cast<uint32_t>(field_28) ==
                 static_cast<uint32_t>(ISAAC_ROOM_TRANSITION_ENGINE_42A250_CMP_IMM)
             ? 1
             : 0;
}

extern "C" uint32_t isaac_room_transition_engine_42a260_value_getter(
    const uint8_t* mem, uint32_t this_off) {
  /* 0x0042a260 mov eax,dword ptr [ecx+0x3bc] — u32 LE load at the
     u32-wrapping offset add (v18 0x428a70 shape). */
  return rte_load32_mem(
      mem, this_off +
               static_cast<uint32_t>(ISAAC_ROOM_TRANSITION_ENGINE_42A260_FIELD_3BC_OFF));
}

extern "C" uint32_t isaac_room_transition_engine_42a270_chain_value(
    const uint8_t* mem, uint32_t this_off) {
  /* Chained fallback getter: eax = [this+4]; null -> 1;
     eax = [eax+0x10]; null -> 1; else [eax+0x48] (u32 LE loads,
     u32-wrapping adds). */
  const uint32_t chain = rte_load32_mem(
      mem, this_off +
               static_cast<uint32_t>(ISAAC_ROOM_TRANSITION_ENGINE_42A270_PTR_OFF));
  if (chain == 0u) {
    return static_cast<uint32_t>(ISAAC_ROOM_TRANSITION_ENGINE_42A270_FALLBACK);
  }
  const uint32_t inner = rte_load32_mem(
      mem, chain +
               static_cast<uint32_t>(ISAAC_ROOM_TRANSITION_ENGINE_42A270_INNER_OFF));
  if (inner == 0u) {
    return static_cast<uint32_t>(ISAAC_ROOM_TRANSITION_ENGINE_42A270_FALLBACK);
  }
  return rte_load32_mem(
      mem, inner +
               static_cast<uint32_t>(ISAAC_ROOM_TRANSITION_ENGINE_42A270_VALUE_OFF));
}

extern "C" int32_t isaac_room_transition_engine_42a270_used_fallback(
    const uint8_t* mem, uint32_t this_off) {
  /* The two je hops at 0x0042a275 / 0x0042a27c — 1 iff either hop ran. */
  const uint32_t chain = rte_load32_mem(
      mem, this_off +
               static_cast<uint32_t>(ISAAC_ROOM_TRANSITION_ENGINE_42A270_PTR_OFF));
  if (chain == 0u) {
    return 1;
  }
  return rte_load32_mem(
             mem, chain +
                      static_cast<uint32_t>(ISAAC_ROOM_TRANSITION_ENGINE_42A270_INNER_OFF))
                 ? 0
                 : 1;
}

/* ===================================================================== */
/* v22 — POOL: six verify-open one-liners, one law each. V22-D's PE      */
/* load is BYTE-width (mov al) -> v9 rule: & 0xff explicit in-body.      */
/* ===================================================================== */

extern "C" int32_t isaac_room_transition_engine_42a290_accepts(uint32_t index) {
  /* 0x0042a296 cmp edx,0x1bf / 0x0042a29c ja — UNSIGNED above rejects;
     the law models the accept decision directly. The store SITE
     [ecx+idx*4+0x76c] stays host. */
  return static_cast<uint32_t>(index) <=
                 static_cast<uint32_t>(ISAAC_ROOM_TRANSITION_ENGINE_42A290_BOUND)
             ? 1
             : 0;
}

extern "C" int32_t isaac_room_transition_engine_42a2c0_non_null(uint32_t field_4) {
  /* 0x0042a2c0 cmp dword ptr [ecx+4],0 / setne al — EQUALITY-to-zero
     family; signedness-free. */
  return static_cast<uint32_t>(field_4) != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_room_transition_engine_42a310_value_getter(
    const uint8_t* mem, uint32_t this_off) {
  /* 0x0042a310 mov eax,dword ptr [ecx+0x1340] — u32 LE at the
     u32-wrapping offset add. */
  return rte_load32_mem(
      mem, this_off +
               static_cast<uint32_t>(ISAAC_ROOM_TRANSITION_ENGINE_42A310_FIELD_1340_OFF));
}

extern "C" uint32_t isaac_room_transition_engine_42a320_byte_getter(
    const uint8_t* mem, uint32_t this_off) {
  /* 0x0042a320 mov al,byte ptr [ecx+0x20a9] — BYTE-width load: the
     observable contract is the low byte; masked & 0xff (v9 rule). */
  return rte_load32_mem(
             mem, this_off +
                      static_cast<uint32_t>(ISAAC_ROOM_TRANSITION_ENGINE_42A320_FIELD_20A9_OFF)) &
         static_cast<uint32_t>(ISAAC_ROOM_TRANSITION_ENGINE_42A320_BYTE_MASK);
}

extern "C" uint32_t isaac_room_transition_engine_42a330_field_getter(uint32_t this_off) {
  /* 0x0042a330 lea eax,[ecx+0x1a740] — u32-wrapping address add
     (v17/v18 field-pointer shape). */
  return this_off +
         static_cast<uint32_t>(ISAAC_ROOM_TRANSITION_ENGINE_42A330_FIELD_1A740_OFF);
}

extern "C" uint32_t isaac_room_transition_engine_42a340_field_getter(uint32_t this_off) {
  /* 0x0042a340 lea eax,[ecx+0x1bb84] — same shape. */
  return this_off +
         static_cast<uint32_t>(ISAAC_ROOM_TRANSITION_ENGINE_42A340_FIELD_1BB84_OFF);
}

/* ===================================================================== */
/* v23 — 0x0042b020 multi-table switch classifier (797 B, FULLY PURE:    */
/* 0 E8 / 0 indirect / 0 SEH; the 0x42b06d..0x42b33d region is pinned    */
/* jump-table DATA). Machine: arg == 0xe8 -> TRUE; SIGNED jg 0xe8 ->     */
/* high path (idx2 = u32(arg - 234), bound 0x1eb, byte_table2 ->         */
/* dword_table2); else low path (idx1 = u32(arg - 11), bound 0xcc,       */
/* byte_table1 -> dword_table1); byte value 0 -> TRUE, nonzero -> FALSE. */
/* ===================================================================== */

static const uint8_t ISAAC_RTE_42B020_BYTE_TABLE1[205] = {
    0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1,
    0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1,
    0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0,
    1, 0, 1, 1, 0,
};

static const uint8_t ISAAC_RTE_42B020_BYTE_TABLE2[492] = {
    0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 1,
    1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1,
    1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1,
    1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0,
    1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 0,
    1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1,
    1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1,
    1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1,
    0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1,
    1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1,
    1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1,
    0, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1,
    1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0, 1,
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1,
    1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1,
    1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1, 0,
    1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0,
    1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0,
    0, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1,
    0, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1,
    0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0,
};

extern "C" int32_t isaac_room_transition_engine_42b020_contains(int32_t arg) {
  /* 0x0042b026 cmp eax,0xe8 / 0x0042b02b jg (SIGNED) high / 0x0042b02d
     je TRUE. Low path: 0x0042b02f add eax,-0xb / 0x0042b032 cmp 0xcc /
     0x0042b037 ja FALSE / movzx byte_table1 / jmp dword_table1. High
     path: 0x0042b047 add eax,0xffffff16 (-234) / 0x0042b04c cmp 0x1eb /
     0x0042b051 ja FALSE / byte_table2 / dword_table2.
     dword targets: [0] = 0x0042b061 TRUE, [1] = 0x0042b067 FALSE. */
  const int32_t a = static_cast<int32_t>(arg);
  if (a == static_cast<int32_t>(ISAAC_ROOM_TRANSITION_ENGINE_42B020_EQ_IMM)) {
    return 1;
  }
  uint32_t idx;
  const uint8_t* byte_table;
  if (a > static_cast<int32_t>(ISAAC_ROOM_TRANSITION_ENGINE_42B020_EQ_IMM)) {
    idx = static_cast<uint32_t>(a) -
          static_cast<uint32_t>(234u); /* add eax,0xffffff16 */
    if (idx > static_cast<uint32_t>(ISAAC_ROOM_TRANSITION_ENGINE_42B020_HIGH_BOUND)) {
      return 0;
    }
    byte_table = ISAAC_RTE_42B020_BYTE_TABLE2;
  } else {
    idx = static_cast<uint32_t>(a) -
          static_cast<uint32_t>(11u); /* add eax,-0xb */
    if (idx > static_cast<uint32_t>(ISAAC_ROOM_TRANSITION_ENGINE_42B020_LOW_BOUND)) {
      return 0;
    }
    byte_table = ISAAC_RTE_42B020_BYTE_TABLE1;
  }
  /* dword targets [0]=TRUE 0x0042b061 / [1]=FALSE 0x0042b067: byte
     value 0 selects the TRUE stub. */
  return byte_table[idx] == 0u ? 1 : 0;
}

/* ===================================================================== */
/* v24 — PAIR: sibling switch classifiers 0x0042b340 / 0x0042b430 (both  */
/* FULLY PURE: cdecl plain-ret, one int32 stack arg, bool in al).        */
/* ja is UNSIGNED-above in both; byte value 0 -> TRUE stub.              */
/* ===================================================================== */

static const uint8_t ISAAC_RTE_42B340_BYTE_TABLE[186] = {
    0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1,
    0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1,
    0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0,
    0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
    1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1,
    0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 0,
    0, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0,
    0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 1, 1, 0,
    1, 0, 1, 1, 0, 0,
};

static const uint8_t ISAAC_RTE_42B430_BYTE_TABLE[24] = {
    0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 0, 0,
};

extern "C" int32_t isaac_room_transition_engine_42b340_contains(int32_t arg) {
  /* 0x0042b346 add eax,-3 / 0x0042b349 cmp 0xb9 / 0x0042b34e ja FALSE /
     movzx byte_tableA @0x42b374 / jmp dword_tableA @0x42b36c
     ([0]=TRUE 0x0042b35e / [1]=FALSE 0x0042b364). */
  const uint32_t idx = static_cast<uint32_t>(arg) -
                       static_cast<uint32_t>(ISAAC_ROOM_TRANSITION_ENGINE_42B340_REBIAS);
  if (idx > static_cast<uint32_t>(ISAAC_ROOM_TRANSITION_ENGINE_42B340_BOUND)) {
    return 0;
  }
  return ISAAC_RTE_42B340_BYTE_TABLE[idx] == 0u ? 1 : 0;
}

extern "C" int32_t isaac_room_transition_engine_42b430_contains(int32_t arg) {
  /* 0x0042b436 add eax,-0x13 / 0x0042b439 cmp 0x17 / 0x0042b43c ja FALSE /
     movzx byte_tableB @0x42b460 / jmp dword_tableB @0x42b458
     ([0]=TRUE 0x0042b44c / [1]=FALSE 0x0042b452). */
  const uint32_t idx = static_cast<uint32_t>(arg) -
                       static_cast<uint32_t>(ISAAC_ROOM_TRANSITION_ENGINE_42B430_REBIAS);
  if (idx > static_cast<uint32_t>(ISAAC_ROOM_TRANSITION_ENGINE_42B430_BOUND)) {
    return 0;
  }
  return ISAAC_RTE_42B430_BYTE_TABLE[idx] == 0u ? 1 : 0;
}

/* ===================================================================== */
/* v25 — 0x0042b480 switch classifier + 0x0042b550 field-pointer getter  */
/* (both FULLY PURE).                                                    */
/* ===================================================================== */

static const uint8_t ISAAC_RTE_42B480_BYTE_TABLE[97] = {
    0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0,
    1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 1,
    1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0,
    1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1,
    1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0,
};

extern "C" int32_t isaac_room_transition_engine_42b480_contains(int32_t arg) {
  /* 0x0042b486 dec eax / 0x0042b487 cmp 0x60 / 0x0042b48a ja FALSE /
     movzx byte_table @0x42b4b0 / jmp dword_table @0x42b4a8
     ([0]=TRUE 0x0042b49a / [1]=FALSE 0x0042b4a0). */
  const uint32_t idx = static_cast<uint32_t>(arg) -
                       static_cast<uint32_t>(ISAAC_ROOM_TRANSITION_ENGINE_42B480_REBIAS);
  if (idx > static_cast<uint32_t>(ISAAC_ROOM_TRANSITION_ENGINE_42B480_BOUND)) {
    return 0;
  }
  return ISAAC_RTE_42B480_BYTE_TABLE[idx] == 0u ? 1 : 0;
}

extern "C" uint32_t isaac_room_transition_engine_42b550_field_getter(uint32_t this_off) {
  /* 0x0042b550 lea eax,[ecx+0x10] — u32-wrapping address add
     (v17/v18 field-pointer shape). */
  return this_off +
         static_cast<uint32_t>(ISAAC_ROOM_TRANSITION_ENGINE_42B550_FIELD_OFF);
}

/* ===================================================================== */
/* v26 — 0x0042b940 multi-case setter (FULLY PURE). Three store sites    */
/* stay host ([obj+0x5c], [+0x58], [+0x60]); retired VALUES decided by   */
/* these three laws. The leading jg is SIGNED; the rest are EQUALITY.    */
/* ===================================================================== */

extern "C" int32_t isaac_room_transition_engine_42b940_store_5c(uint32_t type) {
  /* [obj+0x5c] <- 10 when type is 0x14e or 0x81; otherwise no store. */
  const uint32_t tv = static_cast<uint32_t>(type);
  if (tv == static_cast<uint32_t>(ISAAC_ROOM_TRANSITION_ENGINE_42B940_TYPE_14E) ||
      tv == static_cast<uint32_t>(ISAAC_ROOM_TRANSITION_ENGINE_42B940_TYPE_81)) {
    return static_cast<int32_t>(ISAAC_ROOM_TRANSITION_ENGINE_42B940_VALUE_10);
  }
  return static_cast<int32_t>(ISAAC_ROOM_TRANSITION_ENGINE_42B940_NO_STORE);
}

extern "C" int32_t isaac_room_transition_engine_42b940_store_58(uint32_t type) {
  /* [obj+0x58] <- 10 only when type is 0x14e. */
  if (static_cast<uint32_t>(type) ==
      static_cast<uint32_t>(ISAAC_ROOM_TRANSITION_ENGINE_42B940_TYPE_14E)) {
    return static_cast<int32_t>(ISAAC_ROOM_TRANSITION_ENGINE_42B940_VALUE_10);
  }
  return static_cast<int32_t>(ISAAC_ROOM_TRANSITION_ENGINE_42B940_NO_STORE);
}

extern "C" int32_t isaac_room_transition_engine_42b940_store_60(uint32_t type) {
  /* [obj+0x60] <- 2 when type is 0x12d; <- 4 when type is 0x1ac;
     otherwise no store. */
  const uint32_t tv = static_cast<uint32_t>(type);
  if (tv == static_cast<uint32_t>(ISAAC_ROOM_TRANSITION_ENGINE_42B940_TYPE_12D)) {
    return static_cast<int32_t>(ISAAC_ROOM_TRANSITION_ENGINE_42B940_VALUE_2);
  }
  if (tv == static_cast<uint32_t>(ISAAC_ROOM_TRANSITION_ENGINE_42B940_TYPE_1AC)) {
    return static_cast<int32_t>(ISAAC_ROOM_TRANSITION_ENGINE_42B940_VALUE_4);
  }
  return static_cast<int32_t>(ISAAC_ROOM_TRANSITION_ENGINE_42B940_NO_STORE);
}

/* ===================================================================== */
/* v31 — 0x0042c6e0 linked-list pop-head (FULLY PURE). The store SITES   */
/* (*out and [this+0]) stay host; retired VALUES decided by these two    */
/* identity laws. NO null check in the PE — caller must guard.           */
/* ===================================================================== */

extern "C" uint32_t isaac_room_transition_engine_42c6e0_popped(uint32_t old_head) {
  /* 0x0042c6e3 mov edx,[ecx] / 0x0042c6e8 mov [eax],edx — the head
     dword is retired verbatim into *arg0 (u32 identity). */
  return static_cast<uint32_t>(old_head);
}

extern "C" uint32_t isaac_room_transition_engine_42c6e0_advanced(uint32_t next) {
  /* 0x0042c6ea mov edx,[edx] / 0x0042c6ec mov [ecx],edx — the next
     pointer (loaded from [old_head]) is retired verbatim into [this+0]
     (u32 identity). */
  return static_cast<uint32_t>(next);
}

/* ===================================================================== */
/* v32 — POST: value+8 getter + ne-check (both FULLY PURE).              */
/* ===================================================================== */

extern "C" uint32_t isaac_room_transition_engine_42c700_value_plus8(
    const uint8_t* mem, uint32_t this_off) {
  /* 0x0042c700 mov eax,dword ptr [ecx] / 0x0042c702 add eax,8 — u32 LE
     load at the u32-wrapping offset add, then u32-wrapping +8. */
  const uint32_t base = rte_load32_mem(mem, this_off);
  return base +
         static_cast<uint32_t>(ISAAC_ROOM_TRANSITION_ENGINE_42C700_ADD_IMM);
}

extern "C" int32_t isaac_room_transition_engine_42c710_ne_check(
    const uint8_t* mem, uint32_t this_off, uint32_t other_off) {
  /* 0x0042c713 mov ecx,[ecx] / 0x0042c718 cmp [eax],ecx /
     0x0042c71a setne al — EQUALITY only, signedness-free. */
  const uint32_t lhs = rte_load32_mem(mem, this_off);
  const uint32_t rhs = rte_load32_mem(mem, other_off);
  return lhs != rhs ? 1 : 0;
}

/* ===================================================================== */
/* v33 — 0x0042c7f0 element count getter (FULLY PURE). Div-magic         */
/* 0x92492493 with sar 4 + sign fixup = SIGNED division by 12.           */
/* ===================================================================== */

extern "C" int32_t isaac_room_transition_engine_42c7f0_elem_count(
    int32_t span_bytes) {
  /* 0x0042c7f4 mov esi,[ecx+4] / sub esi,[ecx] -> span;
     imul 0x92492493 / sar edx,4 / shr eax,31 / add -> SIGNED div by 12.
     The span_bytes param carries the pre-computed (end - begin) value
     (the host resolves the two field loads); the law models only the
     div-magic arithmetic. */
  return span_bytes /
         static_cast<int32_t>(ISAAC_ROOM_TRANSITION_ENGINE_42C7F0_ELEM_STRIDE);
}

/* ===================================================================== */
/* v34 — 0x0042c810 element address getter (FULLY PURE). u32 LE load     */
/* from [this+0], then u32-wrapping lea add of index*4.                  */
/* ===================================================================== */

extern "C" uint32_t isaac_room_transition_engine_42c810_elem_addr(
    uint32_t this_base, uint32_t index) {
  /* 0x0042c813 mov ecx,[ecx] / 0x0042c818 lea eax,[ecx+eax*4] —
     base + index*4 (u32 wrap). */
  return static_cast<uint32_t>(this_base) +
         static_cast<uint32_t>(index) *
         static_cast<uint32_t>(ISAAC_ROOM_TRANSITION_ENGINE_42C810_ELEM_SCALE);
}

extern "C" uint32_t isaac_room_transition_engine_42d040_conditional_getter(
    uint32_t field_13dc, uint32_t field_13e0) {
  /* 0x0042d040 mov eax,[ecx+0x13dc] / test eax,eax / jne ret /
     mov eax,[ecx+0x13e0] — the jne is ZF-based (nonzero check). */
  if (field_13dc != 0u) {
    return field_13dc;
  }
  return field_13e0;
}
