#include "render_shell_pure_helpers.h"

/* Pure freestanding helpers for FUN_0080ea80 frame shell (VA 0x0080ea80)
   and FUN_00817830 residual body pure islands (VA 0x00817830).
   Evidence: PE Capstone map under
   output/decomp/5129df723e64/section-notes/render-advance-2/,
   non-39 fade peel under render-advance-3/,
   aux nested + RT-pop depth under render-advance-4/,
   817830 body peels under render-advance-5/,
   residual open 0x00817adc peels under render-advance-6/,
   a14050 body + L-room/type-9 peels under render-advance-7/,
   a159d0 complete string-hash body under render-advance-8/,
   416440 complete + a14270/81f8b0 pure under render-advance-9/,
   a14270 insert residual + draw a10690/a0f550/a10c00 under render-advance-10/,
   a14270 rebalance/rotates pure-complete under render-advance-11/,
   a0f4c0/throw pure CF under section-notes/render-alloc-v11/,
   stage-overlay residual pure under section-notes/render-v12/,
   GetStageID CF + RoomConfig body + 74ea50 pure under section-notes/render-v13/,
   74f690 mode-44 stage-type pure CF under section-notes/render-v14/,
   GetRoomByIdx 0x740bc0 pure CF under section-notes/render-v15/,
   812d00 + 4217a0 complete pure bodies under section-notes/render-v16/,
   6f9400/6f95a0 pure islands + 74ea50 pure-complete under section-notes/render-v17/,
   AnimationState::Render 0x40a030 pure CF under section-notes/render-v18/.
   opaque_call_00409120 entry pure CF under section-notes/render-v19/.
   opaque_call_00408590 sprite residual pure CF under section-notes/render-v20/.
   color residual 4071c0/4072e0/6831c0 pure under section-notes/render-v21-color/.
   GetSourceQuad 0x4098a0 + dest-quad 0x409cb0 pure under section-notes/render-v21-quad/.
   color-ring 0x40c6f0 pure-complete under section-notes/render-40c6f0/.
   dest-quad nested a10d00/a10950/a10760 pure under section-notes/render-v23-dest/.
   a145e0 scalar deleting dtor plan under section-notes/render-shell-v39/.
   Hash-bound to tools/isaac-ng.unpacked.exe SHA-256 5129DF72â€¦ */

/* PE wrappers 0x0041d540 / 0x0041d520 call CRT cos/sin via double. Declare
   freestanding so em++ STANDALONE_WASM links soft-float cos/sin with zero
   imports (same approach as frame_opaque_pure_helpers). */
extern "C" double cos(double);
extern "C" double sin(double);

/* VA 0x00af0917 is `jmp [0x00b18840]`; the PE import directory resolves that
   IAT slot to `floor` in api-ms-win-crt-math-l1-1-0.dll. Declared freestanding
   for the same zero-import reason as cos/sin above. */
extern "C" double floor(double);

namespace {

float f32_from_bits(uint32_t bits) {
  return __builtin_bit_cast(float, bits);
}

void f32_store(uint32_t addr, float value) {
  const uint32_t bits = __builtin_bit_cast(uint32_t, value);
  uint8_t* p = reinterpret_cast<uint8_t*>(static_cast<uintptr_t>(addr));
  p[0] = static_cast<uint8_t>(bits & 0xffu);
  p[1] = static_cast<uint8_t>((bits >> 8) & 0xffu);
  p[2] = static_cast<uint8_t>((bits >> 16) & 0xffu);
  p[3] = static_cast<uint8_t>((bits >> 24) & 0xffu);
}

float f32_load(uint32_t addr) {
  const uint8_t* p = reinterpret_cast<const uint8_t*>(static_cast<uintptr_t>(addr));
  uint32_t bits = 0;
  bits |= static_cast<uint32_t>(p[0]);
  bits |= static_cast<uint32_t>(p[1]) << 8;
  bits |= static_cast<uint32_t>(p[2]) << 16;
  bits |= static_cast<uint32_t>(p[3]) << 24;
  return __builtin_bit_cast(float, bits);
}

/* xorps with DAT_00bacb70 (-0.0): flip sign bit. */
float f32_neg_sign(float x) {
  const uint32_t bits =
      __builtin_bit_cast(uint32_t, x) ^
      static_cast<uint32_t>(ISAAC_RENDER_SHELL_F32_SIGN_BITS);
  return __builtin_bit_cast(float, bits);
}

/* SSE minss: if unordered/NaN or a >= b â†’ b (second source). */
float sse_minss(float a, float b) {
  return (a < b) ? a : b;
}

/* SSE maxss: if unordered/NaN or a <= b â†’ b (second source). */
float sse_maxss(float a, float b) {
  return (a > b) ? a : b;
}

/* Wasm linear-memory model for MSVC map nodes (same as exit tree++). */
inline const uint8_t* map_node_ptr(uint32_t addr) {
  return reinterpret_cast<const uint8_t*>(static_cast<uintptr_t>(addr));
}

inline uint8_t* map_node_mut(uint32_t addr) {
  return reinterpret_cast<uint8_t*>(static_cast<uintptr_t>(addr));
}

inline uint32_t map_load_u32(uint32_t addr) {
  const uint8_t* p = map_node_ptr(addr);
  uint32_t value = 0;
  value |= static_cast<uint32_t>(p[0]);
  value |= static_cast<uint32_t>(p[1]) << 8;
  value |= static_cast<uint32_t>(p[2]) << 16;
  value |= static_cast<uint32_t>(p[3]) << 24;
  return value;
}

inline void map_store_u32(uint32_t addr, uint32_t value) {
  uint8_t* p = map_node_mut(addr);
  p[0] = static_cast<uint8_t>(value & 0xffu);
  p[1] = static_cast<uint8_t>((value >> 8) & 0xffu);
  p[2] = static_cast<uint8_t>((value >> 16) & 0xffu);
  p[3] = static_cast<uint8_t>((value >> 24) & 0xffu);
}

inline uint8_t map_load_u8(uint32_t addr) {
  return map_node_ptr(addr)[0];
}

inline void map_store_u8(uint32_t addr, uint8_t value) {
  map_node_mut(addr)[0] = value;
}

inline uint8_t map_load_isnil(uint32_t node_addr) {
  return map_load_u8(node_addr +
                     static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_ISNIL_OFF));
}

inline uint8_t map_load_color(uint32_t node_addr) {
  return map_load_u8(node_addr +
                     static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_COLOR_OFF));
}

/* x86 idiv toward-zero for signed 32-bit (width != 0). */
inline void idiv_i32(int32_t numer, int32_t denom, int32_t* quot,
                     int32_t* rem) {
  const int32_t q = static_cast<int32_t>(numer / denom);
  const int32_t r = static_cast<int32_t>(numer % denom);
  if (quot != nullptr) {
    *quot = q;
  }
  if (rem != nullptr) {
    *rem = r;
  }
}

/* PE signed n%2 remainder-equals-1 (MSVC and 0x80000001 + js fixup). */
inline int32_t pe_signed_mod2_eq1(int32_t stage) {
  int32_t eax = stage;
  eax &= static_cast<int32_t>(0x80000001u);
  if (eax < 0) {
    eax -= 1;
    eax |= static_cast<int32_t>(0xfffffffeu);
    eax += 1;
  }
  return eax == 1 ? 1 : 0;
}

inline uint8_t nonzero_u8(uint8_t v) { return v != 0 ? 1 : 0; }

}  // namespace

extern "C" int32_t isaac_render_shell_main_body_needed(uint32_t option_2a3c3_w) {
  const uint8_t option_2a3c3 = static_cast<uint8_t>(option_2a3c3_w & 0xffu);
  /* VA 0x0080eb21: cmp byte [opts+0x2a3c3], 0; je epilog */
  return option_2a3c3 != 0 ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_manager_fade_poll_needed(
    float manager_fade_26518) {
  /* VA 0x0080eb36â€“0x0080eb3c: comiss xmm0, 0; ja skip.
     Host 6f9400/6f95a0 runs when NOT strictly greater than 0.
     C++ `!(x > 0.f)` matches comiss/ja for finite and NaN (NaN â†’ host). */
  return !(manager_fade_26518 > 0.0f) ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_room_flags_bit9(uint32_t room_flags_at_44) {
  /* VA 0x0080ebf7â€“0x0080ec00: shr eax, 9; test al, 1 */
  return ((room_flags_at_44 >> 9) & 1u) != 0u ? 1 : 0;
}

extern "C" void isaac_render_shell_camera_offset(float game_1204,
                                                 float game_1208,
                                                 float manager_2650c,
                                                 float manager_26510,
                                                 float* out_x,
                                                 float* out_y) {
  /* VA 0x0080ecbdâ€“0x0080ece3: addss of Game camera + manager scroll.
     float32 rounding is the C float add (Wasm/x86 scalar fp32). */
  if (out_x != nullptr) {
    *out_x = game_1204 + manager_2650c;
  }
  if (out_y != nullptr) {
    *out_y = game_1208 + manager_26510;
  }
}

extern "C" int32_t isaac_render_shell_stage39_host_needed(int32_t stage_1d18) {
  /* VA 0x0080ecb6: cmp [Game+0x1d18], 0x39 */
  return stage_1d18 == ISAAC_RENDER_SHELL_STAGE_SPECIAL_39 ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_non39_fade_block_needed(
    uint32_t room_flags_at_44) {
  /* VA 0x0080ed01â€“0x0080ed06: shr 9; test al,1; jne skip (to tree).
     Block runs when bit 9 is clear. */
  return ((room_flags_at_44 >> 9) & 1u) == 0u ? 1 : 0;
}

extern "C" uint32_t isaac_render_shell_fade_mgr_words_or(
    uint32_t manager_26550,
    uint32_t manager_word_0c) {
  /* VA 0x0080ed0câ€“0x0080ed12 */
  return manager_26550 | manager_word_0c;
}

extern "C" int32_t isaac_render_shell_fade_poll_selects_one(
    uint32_t mgr_or,
    uint32_t poll_6f9400,
    uint32_t poll_6f95a0) {
  /* VA 0x0080ed1aâ€“0x0080ed2d:
       edi = poll_a | mgr_or
       eax = ~poll_b & edi
       test al, 1 */
  const uint32_t combined =
      (static_cast<uint32_t>(~poll_6f95a0) & (poll_6f9400 | mgr_or));
  return (combined & 1u) != 0u ? 1 : 0;
}

extern "C" float isaac_render_shell_fade_base(int32_t selects_one,
                                              float manager_2651c,
                                              float manager_26518) {
  /* VA 0x0080ed2fâ€“0x0080ed4b */
  if (selects_one != 0) {
    return f32_from_bits(ISAAC_RENDER_SHELL_F32_ONE_BITS);
  }
  return manager_2651c * manager_26518;
}

extern "C" int32_t isaac_render_shell_fade_boost_mode_open(
    int32_t game_field_8) {
  /* VA 0x0080ed58 / 0x0080ed5d */
  if (game_field_8 == ISAAC_RENDER_SHELL_FADE_BOOST_MODE_8) {
    return 1;
  }
  if (game_field_8 == ISAAC_RENDER_SHELL_FADE_BOOST_MODE_1D) {
    return 1;
  }
  return 0;
}

extern "C" int32_t isaac_render_shell_fade_boost_needed(
    int32_t mode_open,
    int32_t host_74efd0_true,
    int32_t manager_1830c_eq_1,
    int32_t host_827bc0_true) {
  /* VA 0x0080ed55â€“0x0080ed89 PE-ordered combine after optional hosts. */
  if (mode_open != 0) {
    return 1;
  }
  if (host_74efd0_true != 0 && manager_1830c_eq_1 != 0) {
    return 1;
  }
  if (host_827bc0_true != 0) {
    return 1;
  }
  return 0;
}

extern "C" float isaac_render_shell_fade_apply_boost(float fade,
                                                     int32_t boost) {
  /* VA 0x0080ed8bâ€“0x0080edb1 */
  if (boost == 0) {
    return fade;
  }
  const float one = f32_from_bits(ISAAC_RENDER_SHELL_F32_ONE_BITS);
  const float add = f32_from_bits(ISAAC_RENDER_SHELL_F32_BOOST_ADD_BITS);
  return sse_minss(fade + add, one);
}

extern "C" int32_t isaac_render_shell_fade_force_full_needed(
    int32_t manager_dword0,
    int32_t manager_dword1,
    uint32_t room_flags_at_44) {
  /* VA 0x0080edb5â€“0x0080edce:
       cmp [esp+0x6c], 0xd; cmp [esp+0x34], 1; room flags bit 2 clear */
  if (manager_dword0 != ISAAC_RENDER_SHELL_FADE_FORCE_MGR0) {
    return 0;
  }
  if (manager_dword1 != ISAAC_RENDER_SHELL_FADE_FORCE_MGR1) {
    return 0;
  }
  if (((room_flags_at_44 >> 2) & 1u) != 0u) {
    return 0;
  }
  return 1;
}

extern "C" float isaac_render_shell_fade_t(float fade, float manager_67734) {
  /* VA 0x0080edd3â€“0x0080edf8: subss then maxss vs 0 */
  return sse_maxss(fade - manager_67734, 0.0f);
}

extern "C" float isaac_render_shell_fade_lerp_channel(float src,
                                                      float base,
                                                      float t) {
  /* VA 0x0080ee10â€“0x0080ee56: (src - base) * t + base */
  return (src - base) * t + base;
}

extern "C" uint32_t isaac_render_shell_c379b8_next(uint32_t ptr,
                                                  uint32_t byte_at_ptr_plus_4_w,
                                                  uint32_t current_c379b8) {
  const uint8_t byte_at_ptr_plus_4 = static_cast<uint8_t>(byte_at_ptr_plus_4_w & 0xffu);
  /* VA 0x0080ee5câ€“0x0080ee6c */
  if (ptr == 0u) {
    return current_c379b8;
  }
  if ((byte_at_ptr_plus_4 & 1u) != 0u) {
    return ptr;
  }
  return current_c379b8;
}

extern "C" void isaac_render_shell_tree_count_clear(int32_t* tree_count_730c) {
  /* VA 0x0080eea2: mov dword [Game+0x730c], 0 after Erase_tree host */
  if (tree_count_730c != nullptr) {
    *tree_count_730c = 0;
  }
}

extern "C" void isaac_render_shell_tree_head_self_links(uint32_t head_node,
                                                       uint32_t* link0,
                                                       uint32_t* link4,
                                                       uint32_t* link8) {
  /* VA 0x0080ee98â€“0x0080ee9d: [H]=H, [H+4]=H, [H+8]=H */
  if (link0 != nullptr) {
    *link0 = head_node;
  }
  if (link4 != nullptr) {
    *link4 = head_node;
  }
  if (link8 != nullptr) {
    *link8 = head_node;
  }
}

extern "C" int32_t isaac_render_shell_entity_loop_needed(
    uint32_t entity_count_1264) {
  /* VA 0x0080eead: cmp [Game+0x1264], esi (esi==0); jbe skip â€” unsigned.
     ENTRY GATE ONLY. The loop bound is re-derived per iteration; see
     isaac_render_shell_entity_loop_step (ABI v29). */
  return entity_count_1264 != 0u ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_entity_loop_step(uint32_t index,
                                                       uint32_t count_after) {
  /* VA 0x0080eeca: inc esi; VA 0x0080eecb: cmp esi,[Game+0x1264]; jb loop.
     Unsigned strict compare against the RE-READ count. */
  const uint32_t next = isaac_render_shell_entity_loop_next_index(index);
  return next < count_after ? 1 : 0;
}

extern "C" uint32_t isaac_render_shell_entity_loop_next_index(uint32_t index) {
  /* `inc esi` â€” 32-bit wrap. */
  return index + 1u;
}

extern "C" uint32_t isaac_render_shell_entity_loop_arg(uint32_t base_after,
                                                       uint32_t index) {
  /* VA 0x0080eebc: mov eax,[Game+0x125c]; VA 0x0080eec2: push [eax+esi*4].
     The base is reloaded inside the loop body, so it is post-call from the
     previous iteration's perspective. */
  return base_after +
         index * static_cast<uint32_t>(ISAAC_RENDER_SHELL_ENTITY_ELEM);
}

extern "C" int32_t isaac_render_shell_entity_loop_base_reload_needed(void) {
  return 1;
}

extern "C" int32_t isaac_render_shell_entity_loop_run(uint32_t entry_count,
                                                      const uint32_t* base_seq,
                                                      const uint32_t* count_seq,
                                                      int32_t seq_len,
                                                      uint32_t* out_slots) {
  if (isaac_render_shell_entity_loop_needed(entry_count) == 0) {
    return 0;
  }
  int32_t calls = 0;
  uint32_t index = 0u;
  while (calls < seq_len) {
    /* Slot address uses the base recaptured for THIS iteration. */
    if (out_slots != nullptr) {
      out_slots[calls] =
          isaac_render_shell_entity_loop_arg(base_seq[calls], index);
    }
    ++calls;
    /* Continue decision uses the count recaptured AFTER this call. */
    if (isaac_render_shell_entity_loop_step(index, count_seq[calls - 1]) == 0) {
      break;
    }
    index = isaac_render_shell_entity_loop_next_index(index);
  }
  return calls;
}

extern "C" int32_t isaac_render_shell_708eb0_size_before(uint32_t begin,
                                                        uint32_t end) {
  /* VA 0x00708ee0-0x00708ef6: identical signed /0x78 magic sequence to the
     one recovered inside RoomDescriptor::constructor at ABI v28. */
  return isaac_render_shell_6ef590_vec_capacity(begin, end);
}

extern "C" int32_t isaac_render_shell_708eb0_len_overflow(uint32_t want) {
  /* VA 0x00708efe: cmp eax,0x2222222; ja throw â€” unsigned, strict.
     0x2222222 * 0x78 == 0xfffffff0, the largest non-overflowing byte count. */
  return want > static_cast<uint32_t>(ISAAC_RENDER_SHELL_708EB0_MAX_LEN) ? 1
                                                                        : 0;
}

extern "C" uint32_t isaac_render_shell_708eb0_alloc_bytes(uint32_t want) {
  /* VA 0x00708f05-0x00708f0c: mov ecx,eax; shl ecx,4; sub ecx,eax; shl ecx,3
     == want * 0x78, with 32-bit wrap. */
  const uint32_t shifted =
      want << static_cast<uint32_t>(ISAAC_RENDER_SHELL_708EB0_SHL_A);
  return (shifted - want) << static_cast<uint32_t>(
                                 ISAAC_RENDER_SHELL_708EB0_SHL_B);
}

extern "C" int32_t isaac_render_shell_708eb0_copy_count(uint32_t begin,
                                                        uint32_t end) {
  /* VA 0x00708f37: cmp edi,ebx; je done â€” one 0x004d3130 call per element. */
  return isaac_render_shell_708eb0_size_before(begin, end);
}

extern "C" uint32_t isaac_render_shell_708eb0_alloc_host_va(void) {
  return ISAAC_RENDER_SHELL_HOST_40CF00_VA;
}
extern "C" uint32_t isaac_render_shell_708eb0_copy_host_va(void) {
  return ISAAC_RENDER_SHELL_HOST_4D3130_VA;
}
extern "C" uint32_t isaac_render_shell_708eb0_install_host_va(void) {
  return ISAAC_RENDER_SHELL_HOST_4D7340_VA;
}

extern "C" uint32_t isaac_render_shell_entity_count_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_ENTITY_COUNT_OFF);
}

extern "C" uint32_t isaac_render_shell_entity_array_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_ENTITY_ARRAY_OFF);
}

extern "C" uint32_t isaac_render_shell_entity_render_va(void) {
  return ISAAC_RENDER_SHELL_ENTITY_RENDER_VA;
}

extern "C" int32_t isaac_render_shell_grid_cell_count(int32_t grid_w_0c,
                                                     int32_t grid_h_10) {
  /* VA 0x0080eed3â€“0x0080eed6: imul eax, [Game+0xc] with eax=[Game+0x10]
     Signed 32-bit product with wrap (x86 imul r/m32). */
  return static_cast<int32_t>(static_cast<int32_t>(grid_h_10) *
                              static_cast<int32_t>(grid_w_0c));
}

extern "C" int32_t isaac_render_shell_grid_loop_needed(int32_t cell_count) {
  /* VA 0x0080eede: test eax,eax; jle skip â€” signed > 0 opens loop */
  return cell_count > 0 ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_grid_slot_needs_render(uint32_t slot_ptr) {
  /* VA 0x0080eee5â€“0x0080eee9: test ecx, ecx; je skip */
  return slot_ptr != 0u ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_stage_overlay_dual_open(
    int32_t game_field_8,
    int32_t nested_room_type_10) {
  /* VA 0x0080ef08 / 0x0080ef18 pure dual before host FUN_0074ea50 */
  if (game_field_8 != ISAAC_RENDER_SHELL_OVERLAY_GAME_MODE_5) {
    return 0;
  }
  if (nested_room_type_10 != ISAAC_RENDER_SHELL_OVERLAY_ROOM_TYPE_59) {
    return 0;
  }
  return 1;
}

extern "C" int32_t isaac_render_shell_option_aux_open(uint32_t option_2a3c5_w) {
  const uint8_t option_2a3c5 = static_cast<uint8_t>(option_2a3c5_w & 0xffu);
  /* VA 0x0080f131: cmp byte [opts+0x2a3c5], 0; je RT-pop */
  return option_2a3c5 != 0 ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_aux_817830_needed(
    int32_t fade_poll_needed,
    int32_t poll_selects_one) {
  /* VA 0x0080f13aâ€“0x0080f176 nested decision (G8 already open):
       comiss/ja fade>0 â†’ call 817830
       else after host polls: test al,1; je skip; else call */
  if (fade_poll_needed == 0) {
    return 1;
  }
  return poll_selects_one != 0 ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_option_aux_817830_needed(
    uint32_t option_2a3c5_w,
    int32_t fade_poll_needed,
    int32_t poll_selects_one) {
  const uint8_t option_2a3c5 = static_cast<uint8_t>(option_2a3c5_w & 0xffu);
  /* VA 0x0080f12c outer + nested 0x0080f13aâ€¦ */
  if (option_2a3c5 == 0u) {
    return 0;
  }
  return isaac_render_shell_aux_817830_needed(fade_poll_needed,
                                             poll_selects_one);
}

extern "C" int32_t isaac_render_shell_rt_pop_depth_step(uint32_t depth_before,
                                                       uint32_t* depth_after) {
  /* VA 0x0080f1b5: sub dword [DAT_00c79790], 1
     VA 0x0080f1c6: cmove clear DAT_00c7978c when ZF (result == 0) */
  const uint32_t next = depth_before - 1u;
  if (depth_after != nullptr) {
    *depth_after = next;
  }
  return next == 0u ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_flag11f6_oneshot(uint8_t* flag_11f6) {
  /* VA 0x0080f1d5â€“0x0080f1e7 */
  if (flag_11f6 == nullptr) {
    return 0;
  }
  if (*flag_11f6 == 1u) {
    *flag_11f6 = 0u;
    return 1;
  }
  return 0;
}

extern "C" int32_t isaac_render_shell_817830_stage_slot_offset(
    int32_t stage_1d18) {
  /* VA 0x0081785f: imul ecx, [Game+0x1d18], 0x13c â€” signed wrap */
  return static_cast<int32_t>(static_cast<int32_t>(stage_1d18) *
                              ISAAC_RENDER_SHELL_817830_STAGE_STRIDE);
}

extern "C" int32_t isaac_render_shell_817830_stage_slot_open(
    uint32_t stage_slot_1d80) {
  /* VA 0x00817869: cmp dword, 0; je early_exit */
  return stage_slot_1d80 != 0u ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_817830_stage_id_special(
    uint32_t stage_id) {
  /* VA 0x00817877â€¦0x0081788e */
  switch (stage_id) {
    case ISAAC_RENDER_SHELL_817830_STAGE_ID_4:
    case ISAAC_RENDER_SHELL_817830_STAGE_ID_5:
    case ISAAC_RENDER_SHELL_817830_STAGE_ID_6:
    case ISAAC_RENDER_SHELL_817830_STAGE_ID_1B:
    case ISAAC_RENDER_SHELL_817830_STAGE_ID_1C:
      return 1;
    default:
      return 0;
  }
}

extern "C" int32_t isaac_render_shell_817830_room_special_ok(
    int32_t room_field_54,
    uint32_t room_flags_44) {
  /* VA 0x00817893: cmp [Room+0x54], 0; jl fail
     VA 0x0081789c: shr flags, 5; test al, 1 */
  if (room_field_54 < 0) {
    return 0;
  }
  return ((room_flags_44 >> 5) & 1u) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_817830_special_flag(
    int32_t stage_id_special,
    int32_t room_special_ok) {
  /* VA 0x008178a3 / 0x008178a7 */
  return (stage_id_special != 0 && room_special_ok != 0) ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_817830_body_continue_needed(
    float fade_7240,
    int32_t special_flag) {
  /* VA 0x008178b4: comiss fade, 0; ja continue
     else test special; je early_exit */
  if (fade_7240 > 0.0f) {
    return 1;
  }
  return special_flag != 0 ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_817830_body_needed(
    uint32_t stage_slot_1d80,
    uint32_t stage_id,
    int32_t room_field_54,
    uint32_t room_flags_44,
    float fade_7240) {
  if (isaac_render_shell_817830_stage_slot_open(stage_slot_1d80) == 0) {
    return 0;
  }
  const int32_t id_special =
      isaac_render_shell_817830_stage_id_special(stage_id);
  const int32_t room_ok =
      isaac_render_shell_817830_room_special_ok(room_field_54, room_flags_44);
  const int32_t special =
      isaac_render_shell_817830_special_flag(id_special, room_ok);
  return isaac_render_shell_817830_body_continue_needed(fade_7240, special);
}

extern "C" float isaac_render_shell_817830_view_span_sum(float game_14,
                                                        float game_18,
                                                        float game_1c,
                                                        float game_20) {
  /* VA 0x00817939â€¦0x00817964: w=1c-14, h=20-18; (w+w)+(h+h) */
  const float w = game_1c - game_14;
  const float h = game_20 - game_18;
  const float two_w = w + w;
  const float two_h = h + h;
  return two_w + two_h;
}

extern "C" float isaac_render_shell_817830_u32_to_f32(uint32_t value) {
  /* VA 0x00817968â€¦0x00817982 MSVC unsignedâ†’float via signed double + bias.
     DAT_00bacb00[0] = 0.0, DAT_00bacb00[1] = 2^32. */
  const int32_t as_signed = static_cast<int32_t>(value);
  double d = static_cast<double>(as_signed);
  if ((value >> 31) != 0u) {
    d += 4294967296.0;
  }
  return static_cast<float>(d);
}

extern "C" float isaac_render_shell_817830_scale_pre_floor(float span_sum,
                                                          float dim_f) {
  /* VA 0x00817986â€¦0x0081799b: span/dim + 0.5f */
  const float half = f32_from_bits(ISAAC_RENDER_SHELL_F32_HALF_BITS);
  return span_sum / dim_f + half;
}

extern "C" int32_t isaac_render_shell_817830_stage_2c_color_needed(
    int32_t stage_1d18) {
  /* VA 0x00817a73 */
  return stage_1d18 == ISAAC_RENDER_SHELL_817830_STAGE_2C ? 1 : 0;
}

extern "C" void isaac_render_shell_817830_stage_2c_color(float* out_rgba) {
  /* DAT_00bac350 @ VA 0x00817a7c */
  if (out_rgba == nullptr) {
    return;
  }
  out_rgba[0] = f32_from_bits(ISAAC_RENDER_SHELL_F32_COLOR_R_2C_BITS);
  out_rgba[1] = f32_from_bits(ISAAC_RENDER_SHELL_F32_COLOR_G_2C_BITS);
  out_rgba[2] = f32_from_bits(ISAAC_RENDER_SHELL_F32_COLOR_B_2C_BITS);
  out_rgba[3] = f32_from_bits(ISAAC_RENDER_SHELL_F32_COLOR_A_2C_BITS);
}

extern "C" float isaac_render_shell_817830_special_base_t(
    int32_t special_flag,
    int32_t room_field_54) {
  /* VA 0x00817a8bâ€¦0x00817abd */
  if (special_flag == 0) {
    return 0.0f;
  }
  const float thirty = f32_from_bits(ISAAC_RENDER_SHELL_F32_THIRTY_BITS);
  const float one = f32_from_bits(ISAAC_RENDER_SHELL_F32_ONE_BITS);
  /* cvtdq2ps of room+0x54 then / 30; maxss 0; minss 1 */
  const float raw = static_cast<float>(room_field_54) / thirty;
  return sse_minss(sse_maxss(raw, 0.0f), one);
}

extern "C" float isaac_render_shell_817830_fade_blend_t(float base_t,
                                                       float fade_7240) {
  /* VA 0x00817ac0â€¦0x00817ad8: if fade > 0: base + (1-base)*fade */
  if (!(fade_7240 > 0.0f)) {
    return base_t;
  }
  const float one = f32_from_bits(ISAAC_RENDER_SHELL_F32_ONE_BITS);
  return base_t + (one - base_t) * fade_7240;
}

extern "C" float isaac_render_shell_817830_frame_to_f32(int32_t manager_264f8) {
  /* VA 0x00817af4â€¦0x00817afc: movd + cvtdq2ps (signed int32 â†’ float32). */
  return static_cast<float>(manager_264f8);
}

extern "C" void isaac_render_shell_817830_shader_scales(float frame_f,
                                                       float* out_mul_01,
                                                       float* out_mul_05,
                                                       float* out_mul_005) {
  /* VA 0x00817b02â€¦0x00817b26 */
  const float hundredth = f32_from_bits(ISAAC_RENDER_SHELL_F32_HUNDREDTH_BITS);
  const float half = f32_from_bits(ISAAC_RENDER_SHELL_F32_HALF_BITS);
  const float tenth = f32_from_bits(ISAAC_RENDER_SHELL_F32_TENTH_BITS);
  const float mul_01 = frame_f * hundredth;
  const float mul_05 = frame_f * half;
  const float mul_005 = mul_05 * tenth;
  if (out_mul_01 != nullptr) {
    *out_mul_01 = mul_01;
  }
  if (out_mul_05 != nullptr) {
    *out_mul_05 = mul_05;
  }
  if (out_mul_005 != nullptr) {
    *out_mul_005 = mul_005;
  }
}

extern "C" int32_t isaac_render_shell_817830_lroom_type_range(
    int32_t room_type_48) {
  /* VA 0x00817b3dâ€¦0x00817b43: add -9; cmp 3; ja skip â€” unsigned range. */
  const uint32_t adj =
      static_cast<uint32_t>(room_type_48) -
      static_cast<uint32_t>(ISAAC_RENDER_SHELL_817830_LROOM_TYPE_BASE);
  return adj <= static_cast<uint32_t>(ISAAC_RENDER_SHELL_817830_LROOM_TYPE_SPAN)
             ? 1
             : 0;
}

extern "C" int32_t isaac_render_shell_817830_room_desc_open(
    uint32_t room_ptr,
    uint32_t nested_desc_ptr) {
  /* VA 0x00817bc9â€¦0x00817bd9: test Room*; test [Room+0x10]. */
  if (room_ptr == 0u) {
    return 0;
  }
  if (nested_desc_ptr == 0u) {
    return 0;
  }
  return 1;
}

extern "C" int32_t isaac_render_shell_817830_room_type_eq_9(
    int32_t room_type_48) {
  /* VA 0x00817bdf: cmp dword [nested+0x48], 9 */
  return room_type_48 == ISAAC_RENDER_SHELL_817830_ROOM_TYPE_9 ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_a14050_lookup_continue(
    uint32_t node_byte_0d_w,
    uint32_t shader_id,
    uint32_t node_field_10,
    uint32_t node_ptr,
    uint32_t map_root_c379bc) {
  const uint8_t node_byte_0d = static_cast<uint8_t>(node_byte_0d_w & 0xffu);
  /* VA 0x00a1407bâ€¦0x00a1408c after host 416440. */
  if (node_byte_0d != 0u) {
    return 0;
  }
  if (shader_id < node_field_10) {
    return 0;
  }
  if (node_ptr == map_root_c379bc) {
    return 0;
  }
  return 1;
}

extern "C" int32_t isaac_render_shell_a14050_bind_ok(
    uint32_t ptr,
    uint32_t byte_at_ptr_plus_4_w) {
  const uint8_t byte_at_ptr_plus_4 = static_cast<uint8_t>(byte_at_ptr_plus_4_w & 0xffu);
  /* VA 0x00a1409câ€¦0x00a140a6 */
  if (ptr == 0u) {
    return 0;
  }
  if ((byte_at_ptr_plus_4 & 1u) == 0u) {
    return 0;
  }
  return 1;
}

extern "C" int32_t isaac_render_shell_a14050_try_bind(
    uint32_t ptr,
    uint32_t byte_at_ptr_plus_4_w,
    uint32_t* c379b8) {
  const uint8_t byte_at_ptr_plus_4 = static_cast<uint8_t>(byte_at_ptr_plus_4_w & 0xffu);
  /* VA 0x00a140a8â€¦0x00a140ad success path. */
  if (isaac_render_shell_a14050_bind_ok(ptr, byte_at_ptr_plus_4) == 0) {
    return 0;
  }
  if (c379b8 != nullptr) {
    *c379b8 = ptr;
  }
  return 1;
}

extern "C" int32_t isaac_render_shell_a14050_chain_plan(
    uint32_t shader_id,
    uint32_t bound_isnil_w,
    uint32_t bound_key,
    uint32_t bound_ptr,
    uint32_t map_root_c379bc) {
  const uint8_t bound_isnil = static_cast<uint8_t>(bound_isnil_w & 0xffu);
  /* VA 0x00a1407bâ¦0x00a1408c G24 gates (post-416440 bound). */
  if (bound_isnil != 0u) {
    return ISAAC_RENDER_SHELL_A14050_CHAIN_PLAN_FAIL;
  }
  if (shader_id < bound_key) {
    /* cmp esi, [edx+0x10]; jb fail — unsigned. */
    return ISAAC_RENDER_SHELL_A14050_CHAIN_PLAN_FAIL;
  }
  if (bound_ptr == map_root_c379bc) {
    /* cmp edx, [0xc379bc]; je fail — bound == map head sentinel. */
    return ISAAC_RENDER_SHELL_A14050_CHAIN_PLAN_FAIL;
  }
  /* G24 passed ⇒ a14270 inner 416440 re-walk hits the same bound (no
     map write between VA 0x00a14073 and the inner walk at VA 0x00a142a2);
     the size-full check (VA 0x00a142b7) is on the miss path only, so
     INSERT/THROW are unreachable from this callsite. */
  return ISAAC_RENDER_SHELL_A14050_CHAIN_PLAN_FOUND;
}

extern "C" int32_t isaac_render_shell_a14050_chain_resume(
    uint32_t value_at_ptr,
    uint32_t byte_at_ptr_plus_4_w,
    uint32_t* c379b8) {
  const uint8_t byte_at_ptr_plus_4 = static_cast<uint8_t>(byte_at_ptr_plus_4_w & 0xffu);
  /* VA 0x00a1409câ¦0x00a140ad: post-a14270 bind continuation.
     value_at_ptr is the RECAPTURED map-value-slot dword (bound+0x14) read
     after the a14270 sub-step — never a pre-call snapshot (recapture
     discipline, stale-state defect class). */
  if (value_at_ptr == 0u) {
    return 0;
  }
  if ((byte_at_ptr_plus_4 & 1u) == 0u) {
    /* test byte ptr [eax+4], 1; je fail — low byte only. */
    return 0;
  }
  if (c379b8 != nullptr) {
    *c379b8 = value_at_ptr;
  }
  return 1;
}

extern "C" uint32_t isaac_render_shell_a159d0_norm_char(uint32_t ch_w) {
  const uint8_t ch = static_cast<uint8_t>(ch_w & 0xffu);
  /* VA 0x00a159f0â€¦0x00a15a11: A-Z â†’ a-z via unsigned (c-'A')â‰¤0x19; '\\'â†’'/'. */
  uint8_t folded = ch;
  const uint8_t delta = static_cast<uint8_t>(ch - static_cast<uint8_t>(0x41));
  if (delta <= static_cast<uint8_t>(0x19)) {
    folded = static_cast<uint8_t>(ch + static_cast<uint8_t>(0x20));
  }
  if (folded == static_cast<uint8_t>(ISAAC_RENDER_SHELL_A159D0_PATH_SEP_FROM)) {
    return static_cast<uint8_t>(ISAAC_RENDER_SHELL_A159D0_PATH_SEP_TO);
  }
  return folded;
}

extern "C" uint32_t isaac_render_shell_a159d0_hash_step(uint32_t hash,
                                                       uint32_t ch_w) {
  const uint8_t ch = static_cast<uint8_t>(ch_w & 0xffu);
  /* VA 0x00a15a14â€¦0x00a15a1c: hash = (hash << 5) + hash + norm(ch). */
  const uint8_t norm = isaac_render_shell_a159d0_norm_char(ch);
  return (hash << 5) + hash + static_cast<uint32_t>(norm);
}

extern "C" uint32_t isaac_render_shell_a159d0_hash(const uint8_t* bytes) {
  /* VA 0x00a159d0â€¦0x00a15a28 complete body; no nested calls. */
  if (bytes == nullptr) {
    return 0u;
  }
  uint32_t hash =
      static_cast<uint32_t>(ISAAC_RENDER_SHELL_A159D0_SEED);
  /* Empty string: first byte NUL â†’ return seed without loop. */
  if (bytes[0] == 0u) {
    return hash;
  }
  const uint8_t* p = bytes;
  for (;;) {
    const uint8_t ch = *p;
    if (ch == 0u) {
      break;
    }
    hash = isaac_render_shell_a159d0_hash_step(hash, ch);
    p += 1;
  }
  return hash;
}

extern "C" uint32_t isaac_render_shell_416440_walk_step(
    uint32_t node,
    uint32_t node_key,
    uint32_t node_left,
    uint32_t node_right,
    uint32_t search_key,
    uint32_t* out_side,
    uint32_t* inout_bound) {
  /* VA 0x00416463â€¦0x0041647b: unsigned cmp node_key vs search_key. */
  if (node_key >= search_key) {
    if (out_side != nullptr) {
      *out_side = 1u;
    }
    if (inout_bound != nullptr) {
      *inout_bound = node;
    }
    return node_left;
  }
  if (out_side != nullptr) {
    *out_side = 0u;
  }
  return node_right;
}

extern "C" void isaac_render_shell_416440_find_lower_bound(
    uint32_t map_head,
    uint32_t search_key,
    uint32_t* out_node,
    uint32_t* out_side,
    uint32_t* out_bound) {
  /* Exact PE 0x00416440â€¦0x00416488 (MSVC map lower_bound). */
  const uint32_t head = map_head;
  const uint32_t root =
      map_load_u32(head + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_PARENT_OFF));
  uint32_t node = root;
  uint32_t side = 0u;
  uint32_t bound = head;
  if (map_load_isnil(root) == 0u) {
    for (;;) {
      const uint32_t node_key = map_load_u32(
          node + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_KEY_OFF));
      const uint32_t left = map_load_u32(
          node + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_LEFT_OFF));
      const uint32_t right = map_load_u32(
          node + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_RIGHT_OFF));
      const uint32_t next = isaac_render_shell_416440_walk_step(
          node, node_key, left, right, search_key, &side, &bound);
      /* PE stores walk node into out[0] each iteration before child load. */
      if (out_node != nullptr) {
        *out_node = node;
      }
      node = next;
      if (map_load_isnil(node) != 0u) {
        break;
      }
    }
  } else {
    /* Empty: PE leaves out[0]=root, out[1]=0, out[2]=head. */
    if (out_node != nullptr) {
      *out_node = root;
    }
  }
  if (out_side != nullptr) {
    *out_side = side;
  }
  if (out_bound != nullptr) {
    *out_bound = bound;
  }
}

extern "C" int32_t isaac_render_shell_a14270_lookup_hit(uint32_t node_isnil_w,
                                                        uint32_t search_key,
                                                        uint32_t node_key) {
  const uint8_t node_isnil = static_cast<uint8_t>(node_isnil_w & 0xffu);
  /* VA 0x00a142aaâ€¦0x00a142b5: isnil â†’ insert; else key >= node_key â†’ found. */
  if (node_isnil != 0u) {
    return 0;
  }
  return (search_key >= node_key) ? 1 : 0;
}

extern "C" uint32_t isaac_render_shell_a14270_value_ptr(uint32_t node_ptr) {
  /* VA 0x00a14309: lea eax, [edx + 0x14] */
  return node_ptr + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_VALUE_OFF);
}

extern "C" int32_t isaac_render_shell_a14270_map_size_full(uint32_t map_size) {
  /* VA 0x00a142b7: cmp [map+4], 0x0aaaaaaa; je throw */
  return map_size == static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14270_SIZE_FULL)
             ? 1
             : 0;
}

extern "C" int32_t isaac_render_shell_a14270_residual_plan(uint32_t node_isnil_w,
                                                            uint32_t search_key,
                                                            uint32_t node_key,
                                                            uint32_t map_size) {
  const uint8_t node_isnil = static_cast<uint8_t>(node_isnil_w & 0xffu);
  /* VA 0x00a142aaâ€¦0x00a142c0 plan: found / throw / insert. */
  if (isaac_render_shell_a14270_lookup_hit(node_isnil, search_key, node_key) !=
      0) {
    return ISAAC_RENDER_SHELL_A14270_PLAN_FOUND;
  }
  if (isaac_render_shell_a14270_map_size_full(map_size) != 0) {
    return ISAAC_RENDER_SHELL_A14270_PLAN_THROW;
  }
  return ISAAC_RENDER_SHELL_A14270_PLAN_INSERT;
}

extern "C" void isaac_render_shell_a14270_node_init(uint32_t node_ptr,
                                                     uint32_t map_head,
                                                     uint32_t key) {
  /* VA 0x00a142dfâ€¦0x00a142fa after host alloc returns. */
  map_store_u32(node_ptr + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_KEY_OFF),
                key);
  map_store_u32(
      node_ptr + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_VALUE_OFF), 0u);
  map_store_u32(node_ptr + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_LEFT_OFF),
                map_head);
  map_store_u32(
      node_ptr + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_PARENT_OFF),
      map_head);
  map_store_u32(
      node_ptr + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_RIGHT_OFF),
      map_head);
  /* word [node+0xc] = 0 â†’ color=0, isnil=0 */
  map_store_u8(node_ptr + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_COLOR_OFF),
               0u);
  map_store_u8(node_ptr + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_ISNIL_OFF),
               0u);
}

extern "C" int32_t isaac_render_shell_a14270_insert_link(uint32_t map_this,
                                                          uint32_t parent,
                                                          uint32_t side,
                                                          uint32_t new_node) {
  /* Pure prefix of 0x415bd0 through link install (pre-rebalance). */
  const uint32_t head = map_load_u32(map_this);
  const uint32_t size =
      map_load_u32(map_this + 4u) + 1u; /* unsigned wrap matches PE inc */
  map_store_u32(map_this + 4u, size);
  map_store_u32(
      new_node + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_PARENT_OFF),
      parent);
  if (parent == head) {
    map_store_u32(head + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_LEFT_OFF),
                  new_node);
    map_store_u32(
        head + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_PARENT_OFF),
        new_node);
    map_store_u32(head + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_RIGHT_OFF),
                  new_node);
    map_store_u8(
        new_node + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_COLOR_OFF), 1u);
    return 0; /* empty install: no rebalance */
  }
  if (side == 0u) {
    map_store_u32(
        parent + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_RIGHT_OFF),
        new_node);
    if (parent ==
        map_load_u32(head +
                     static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_RIGHT_OFF))) {
      map_store_u32(
          head + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_RIGHT_OFF),
          new_node);
    }
  } else {
    map_store_u32(
        parent + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_LEFT_OFF),
        new_node);
    if (parent ==
        map_load_u32(head +
                     static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_LEFT_OFF))) {
      map_store_u32(
          head + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_LEFT_OFF),
          new_node);
    }
  }
  /* VA 0x00415c20: rebalance while parent color == 0 (red). */
  return map_load_color(parent) == 0u ? 1 : 0;
}

extern "C" void isaac_render_shell_a14270_rotate_right(uint32_t map_this,
                                                        uint32_t node) {
  /* Exact PE 0x00415f80â€¦0x00415fd5 (MSVC tree rotate right). */
  const uint32_t left = map_load_u32(
      node + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_LEFT_OFF));
  const uint32_t left_right = map_load_u32(
      left + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_RIGHT_OFF));
  map_store_u32(node + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_LEFT_OFF),
                left_right);
  if (map_load_isnil(left_right) == 0u) {
    map_store_u32(
        left_right + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_PARENT_OFF),
        node);
  }
  const uint32_t parent = map_load_u32(
      node + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_PARENT_OFF));
  map_store_u32(
      left + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_PARENT_OFF), parent);
  const uint32_t head = map_load_u32(map_this);
  const uint32_t root = map_load_u32(
      head + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_PARENT_OFF));
  if (node == root) {
    map_store_u32(
        head + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_PARENT_OFF), left);
  } else {
    const uint32_t p_right = map_load_u32(
        parent + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_RIGHT_OFF));
    if (node == p_right) {
      map_store_u32(
          parent + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_RIGHT_OFF),
          left);
    } else {
      map_store_u32(
          parent + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_LEFT_OFF), left);
    }
  }
  map_store_u32(left + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_RIGHT_OFF),
                node);
  map_store_u32(
      node + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_PARENT_OFF), left);
}

extern "C" void isaac_render_shell_a14270_rotate_left(uint32_t map_this,
                                                       uint32_t node) {
  /* Exact PE 0x00415fe0â€¦0x00416031 (MSVC tree rotate left). */
  const uint32_t right = map_load_u32(
      node + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_RIGHT_OFF));
  const uint32_t right_left = map_load_u32(
      right + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_LEFT_OFF));
  map_store_u32(node + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_RIGHT_OFF),
                right_left);
  if (map_load_isnil(right_left) == 0u) {
    map_store_u32(
        right_left + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_PARENT_OFF),
        node);
  }
  const uint32_t parent = map_load_u32(
      node + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_PARENT_OFF));
  map_store_u32(
      right + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_PARENT_OFF), parent);
  const uint32_t head = map_load_u32(map_this);
  const uint32_t root = map_load_u32(
      head + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_PARENT_OFF));
  if (node == root) {
    map_store_u32(
        head + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_PARENT_OFF), right);
  } else {
    const uint32_t p_left = map_load_u32(
        parent + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_LEFT_OFF));
    if (node == p_left) {
      map_store_u32(
          parent + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_LEFT_OFF),
          right);
    } else {
      map_store_u32(
          parent + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_RIGHT_OFF),
          right);
    }
  }
  map_store_u32(right + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_LEFT_OFF),
                node);
  map_store_u32(
      node + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_PARENT_OFF), right);
}

extern "C" void isaac_render_shell_a14270_rebalance(uint32_t map_this,
                                                     uint32_t new_node) {
  /* Exact PE 0x00415c1aâ€¦0x00415cd0 rebalance residual of 0x415bd0. */
  const uint32_t head = map_load_u32(map_this);
  uint32_t cur = new_node;
  uint32_t parent = map_load_u32(
      cur + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_PARENT_OFF));
  if (map_load_color(parent) ==
      static_cast<uint8_t>(ISAAC_RENDER_SHELL_MAP_COLOR_RED)) {
    for (;;) {
      parent = map_load_u32(
          cur + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_PARENT_OFF));
      const uint32_t grand = map_load_u32(
          parent + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_PARENT_OFF));
      const uint32_t gleft = map_load_u32(
          grand + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_LEFT_OFF));
      if (parent == gleft) {
        /* Parent is left child of grand; uncle = grand->right. */
        const uint32_t uncle = map_load_u32(
            grand + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_RIGHT_OFF));
        if (map_load_color(uncle) ==
            static_cast<uint8_t>(ISAAC_RENDER_SHELL_MAP_COLOR_RED)) {
          /* Color-flip case (VA 0x00415c76). */
          map_store_u8(
              parent + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_COLOR_OFF),
              static_cast<uint8_t>(ISAAC_RENDER_SHELL_MAP_COLOR_BLACK));
          map_store_u8(
              uncle + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_COLOR_OFF),
              static_cast<uint8_t>(ISAAC_RENDER_SHELL_MAP_COLOR_BLACK));
          map_store_u8(
              grand + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_COLOR_OFF),
              static_cast<uint8_t>(ISAAC_RENDER_SHELL_MAP_COLOR_RED));
          cur = grand;
        } else {
          /* Uncle black: LR then right-rotate grand (VA 0x00415c45â€¦). */
          const uint32_t p_right = map_load_u32(
              parent + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_RIGHT_OFF));
          if (cur == p_right) {
            cur = parent;
            isaac_render_shell_a14270_rotate_left(map_this, cur);
          }
          parent = map_load_u32(
              cur + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_PARENT_OFF));
          map_store_u8(
              parent + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_COLOR_OFF),
              static_cast<uint8_t>(ISAAC_RENDER_SHELL_MAP_COLOR_BLACK));
          const uint32_t g2 = map_load_u32(
              parent + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_PARENT_OFF));
          map_store_u8(
              g2 + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_COLOR_OFF),
              static_cast<uint8_t>(ISAAC_RENDER_SHELL_MAP_COLOR_RED));
          isaac_render_shell_a14270_rotate_right(map_this, g2);
        }
      } else {
        /* Parent is right child; uncle = grand->left (still in gleft). */
        const uint32_t uncle = gleft;
        if (map_load_color(uncle) ==
            static_cast<uint8_t>(ISAAC_RENDER_SHELL_MAP_COLOR_RED)) {
          map_store_u8(
              parent + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_COLOR_OFF),
              static_cast<uint8_t>(ISAAC_RENDER_SHELL_MAP_COLOR_BLACK));
          map_store_u8(
              uncle + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_COLOR_OFF),
              static_cast<uint8_t>(ISAAC_RENDER_SHELL_MAP_COLOR_BLACK));
          map_store_u8(
              grand + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_COLOR_OFF),
              static_cast<uint8_t>(ISAAC_RENDER_SHELL_MAP_COLOR_RED));
          cur = grand;
        } else {
          /* Uncle black: RL then left-rotate grand (VA 0x00415c90â€¦). */
          const uint32_t p_left = map_load_u32(
              parent + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_LEFT_OFF));
          if (cur == p_left) {
            cur = parent;
            isaac_render_shell_a14270_rotate_right(map_this, cur);
          }
          parent = map_load_u32(
              cur + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_PARENT_OFF));
          map_store_u8(
              parent + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_COLOR_OFF),
              static_cast<uint8_t>(ISAAC_RENDER_SHELL_MAP_COLOR_BLACK));
          const uint32_t g2 = map_load_u32(
              parent + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_PARENT_OFF));
          map_store_u8(
              g2 + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_COLOR_OFF),
              static_cast<uint8_t>(ISAAC_RENDER_SHELL_MAP_COLOR_RED));
          isaac_render_shell_a14270_rotate_left(map_this, g2);
        }
      }
      parent = map_load_u32(
          cur + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_PARENT_OFF));
      if (map_load_color(parent) !=
          static_cast<uint8_t>(ISAAC_RENDER_SHELL_MAP_COLOR_RED)) {
        break;
      }
    }
  }
  /* VA 0x00415cc9â€¦0x00415ccd: root color black. */
  const uint32_t root = map_load_u32(
      head + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_PARENT_OFF));
  map_store_u8(root + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_COLOR_OFF),
               static_cast<uint8_t>(ISAAC_RENDER_SHELL_MAP_COLOR_BLACK));
}

extern "C" void isaac_render_shell_a14270_insert_fix(uint32_t map_this,
                                                       uint32_t parent,
                                                       uint32_t side,
                                                       uint32_t new_node) {
  /* Full 0x415bd0 after node_init: link prefix + non-empty rebalance. */
  const uint32_t head = map_load_u32(map_this);
  (void)isaac_render_shell_a14270_insert_link(map_this, parent, side, new_node);
  if (parent != head) {
    isaac_render_shell_a14270_rebalance(map_this, new_node);
  }
}

extern "C" uint32_t isaac_render_shell_a14270_alloc_size(void) {
  /* VA 0x00a142cc: push 0x18 before host 0xa0f4c0. */
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14270_ALLOC_SIZE);
}

extern "C" uint32_t isaac_render_shell_a14270_map_head(uint32_t map_this) {
  /* VA 0x00a142c0: mov esi, dword ptr [edi] */
  return map_load_u32(map_this);
}

extern "C" uint32_t isaac_render_shell_a0f4c0_a648b0_cl(void) {
  /* VA 0x00a0f4cd: xor cl, cl â†’ MODE_ALLOC */
  return static_cast<uint8_t>(ISAAC_RENDER_SHELL_A0F4C0_A648B0_CL);
}

extern "C" uint32_t isaac_render_shell_a0f4c0_a648b0_arg1(void) {
  /* VA 0x00a0f4c6: push 0 (second stack arg to a648b0) */
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A0F4C0_A648B0_ARG1);
}

extern "C" uint32_t isaac_render_shell_a0f4c0_a648b0_size_hi(void) {
  /* VA 0x00a0f4cb: xor edx, edx */
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A0F4C0_A648B0_SIZE_HI);
}

extern "C" uint32_t isaac_render_shell_a0f4c0_malloc_size(uint32_t request_size) {
  /* a0f4c0 always passes size_hi=0 (xor edx); a648b0 malloc_size = lo + 4. */
  return request_size +
         static_cast<uint32_t>(ISAAC_RENDER_SHELL_A648B0_HEADER_SIZE);
}

extern "C" uint32_t isaac_render_shell_a14270_malloc_size(void) {
  return isaac_render_shell_a0f4c0_malloc_size(
      static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14270_ALLOC_SIZE));
}

extern "C" uint32_t isaac_render_shell_a14270_throw_msg_va(void) {
  /* VA 0x004170d0: push 0xb1b160 ("map/set too long") */
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14270_THROW_MSG_VA);
}

extern "C" int32_t isaac_render_shell_a14270_throw_needed(uint32_t map_size) {
  /* G30 = G28: size-full gate before host 0x4170d0. */
  return isaac_render_shell_a14270_map_size_full(map_size);
}

extern "C" void isaac_render_shell_a14270_insert_alloc_prep(
    uint32_t map_this,
    uint32_t* out_map_head,
    uint32_t* out_alloc_size,
    uint32_t* out_malloc_size) {
  /* Pure CF before residual host 0xa0f4c0 on INSERT plan. */
  if (out_map_head != nullptr) {
    *out_map_head = isaac_render_shell_a14270_map_head(map_this);
  }
  if (out_alloc_size != nullptr) {
    *out_alloc_size = isaac_render_shell_a14270_alloc_size();
  }
  if (out_malloc_size != nullptr) {
    *out_malloc_size = isaac_render_shell_a14270_malloc_size();
  }
}

extern "C" uint32_t isaac_render_shell_81f8b0_table_row_addr(
    int32_t room_type_48,
    uint32_t table_base) {
  /* VA 0x0081f8d3â€¦0x0081f8d6: shl type,5; add DAT_00c35b80 */
  const uint32_t t = static_cast<uint32_t>(room_type_48);
  return (t << 5) + table_base;
}

extern "C" void isaac_render_shell_81f8b0_fallback_aabb(float room_14,
                                                        float room_18,
                                                        float room_1c,
                                                        float room_20,
                                                        float* out8) {
  /* VA 0x0081faa0â€¦0x0081fad1: duplicate Room AABB into 8 floats. */
  if (out8 == nullptr) {
    return;
  }
  out8[0] = room_14;
  out8[1] = room_18;
  out8[2] = room_1c;
  out8[3] = room_20;
  out8[4] = room_14;
  out8[5] = room_18;
  out8[6] = room_1c;
  out8[7] = room_20;
}

extern "C" int32_t isaac_render_shell_81f8b0_grid_index(int32_t x,
                                                        int32_t y,
                                                        int32_t width,
                                                        int32_t height) {
  /* VA 0x0081f907â€¦0x0081f927: signed in-bounds â†’ w*y+x else -1. */
  if (x < 0 || x >= width || y < 0 || y >= height) {
    return -1;
  }
  return width * y + x;
}

extern "C" void isaac_render_shell_81f8b0_grid_div(int32_t index,
                                                   int32_t width,
                                                   int32_t* out_quot,
                                                   int32_t* out_rem) {
  /* VA 0x0081f92a: cdq; idiv ecx. width must be non-zero. */
  idiv_i32(index, width, out_quot, out_rem);
}

extern "C" float isaac_render_shell_81f8b0_grid_coord(int32_t index_part,
                                                      int32_t is_x,
                                                      int32_t plus_edge) {
  /* VA 0x0081f92dâ€¦: cvtdq2ps â†’ *40 â†’ +base â†’ Â±20. */
  const float scale = f32_from_bits(ISAAC_RENDER_SHELL_F32_FORTY_BITS);
  const float edge = f32_from_bits(ISAAC_RENDER_SHELL_F32_TWENTY_BITS);
  const float y_base =
      f32_from_bits(ISAAC_RENDER_SHELL_F32_HUNDRED_TWENTY_BITS);
  const float part = static_cast<float>(index_part);
  float v = part * scale;
  if (is_x != 0) {
    v = v + scale;
  } else {
    v = v + y_base;
  }
  if (plus_edge != 0) {
    return v + edge;
  }
  return v - edge;
}

extern "C" void isaac_render_shell_81f8b0_cell_xy(int32_t gx,
                                                  int32_t gy,
                                                  int32_t width,
                                                  int32_t height,
                                                  int32_t plus_edge,
                                                  float* out_x,
                                                  float* out_y) {
  const int32_t index =
      isaac_render_shell_81f8b0_grid_index(gx, gy, width, height);
  int32_t quot = 0;
  int32_t rem = 0;
  isaac_render_shell_81f8b0_grid_div(index, width, &quot, &rem);
  if (out_x != nullptr) {
    *out_x = isaac_render_shell_81f8b0_grid_coord(rem, 1, plus_edge);
  }
  if (out_y != nullptr) {
    *out_y = isaac_render_shell_81f8b0_grid_coord(quot, 0, plus_edge);
  }
}

extern "C" void isaac_render_shell_81f8b0_lroom_pack(const int32_t* row8,
                                                     int32_t width,
                                                     int32_t height,
                                                     float* out8) {
  /* Success path float order after four grid cells (PE end stores). */
  if (row8 == nullptr || out8 == nullptr) {
    return;
  }
  /* pair0 (row0,1) minus â†’ out0,1 */
  isaac_render_shell_81f8b0_cell_xy(row8[0], row8[1], width, height, 0,
                                    &out8[0], &out8[1]);
  /* pair1 (row2,3) plus â†’ out2,3 */
  isaac_render_shell_81f8b0_cell_xy(row8[2], row8[3], width, height, 1,
                                    &out8[2], &out8[3]);
  /* pair2 (row4,5) minus â†’ out4,5 */
  isaac_render_shell_81f8b0_cell_xy(row8[4], row8[5], width, height, 0,
                                    &out8[4], &out8[5]);
  /* pair3 (row6,7) plus â†’ out6,7 */
  isaac_render_shell_81f8b0_cell_xy(row8[6], row8[7], width, height, 1,
                                    &out8[6], &out8[7]);
}

extern "C" int32_t isaac_render_shell_81f8b0_row_needed(int32_t room_type_48) {
  /* VA 0x0081f8c7...0x0081f8cd: lea eax,[type-9]; cmp eax,3; ja fallback.
     Unsigned compare of (type-9) against 3 - the PE folds the lea result
     into the unsigned ja. */
  const uint32_t d = static_cast<uint32_t>(room_type_48) -
                     static_cast<uint32_t>(ISAAC_RENDER_SHELL_817830_LROOM_TYPE_BASE);
  return d <= static_cast<uint32_t>(ISAAC_RENDER_SHELL_817830_LROOM_TYPE_SPAN) ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_81f8b0_load_plan(int32_t room_type_48,
                                                       int32_t table_sparsified) {
  /* Entry plan, before any row-load boundary. The sparsified flag is a
     capture-layer fact (the DAT table base is a runtime input of the slice);
     the PE itself always performs the live burst. */
  if (!isaac_render_shell_81f8b0_row_needed(room_type_48)) {
    return ISAAC_RENDER_SHELL_81F8B0_PLAN_FALLBACK;
  }
  return table_sparsified != 0 ? ISAAC_RENDER_SHELL_81F8B0_PLAN_PURE
                               : ISAAC_RENDER_SHELL_81F8B0_PLAN_LIVE;
}

extern "C" void isaac_render_shell_81f8b0_row_read(uint32_t row_addr,
                                                   int32_t* out8) {
  /* VA 0x0081f8dc...0x0081f903: eight dword loads at +0x00..+0x1c. The PE
     uses them as SIGNED grid coordinates (test esi,esi / js at 0x0081f907),
     so each dword is sign-extended. Null window: zero-fill (PE would fault). */
  if (out8 == nullptr) {
    return;
  }
  if (row_addr == 0u) {
    for (uint32_t i = 0; i < static_cast<uint32_t>(ISAAC_RENDER_SHELL_81F8B0_ROW_DWORDS);
         ++i) {
      out8[i] = 0;
    }
    return;
  }
  for (uint32_t i = 0; i < static_cast<uint32_t>(ISAAC_RENDER_SHELL_81F8B0_ROW_DWORDS);
       ++i) {
    out8[i] = static_cast<int32_t>(map_load_u32(row_addr + i * 4u));
  }
}

extern "C" int32_t isaac_render_shell_81f8b0_lroom_from_row(uint32_t row_addr,
                                                            int32_t width,
                                                            int32_t height,
                                                            float* out8) {
  /* Resume entry: the row window (recaptured after the DAT boundary) is
     consumed by row_read + lroom_pack. Returns 1 when a row was read. */
  if (out8 == nullptr) {
    return 0;
  }
  int32_t row8[ISAAC_RENDER_SHELL_81F8B0_ROW_DWORDS] = {0};
  if (row_addr == 0u) {
    for (uint32_t i = 0; i < static_cast<uint32_t>(ISAAC_RENDER_SHELL_81F8B0_ROW_DWORDS);
         ++i) {
      out8[i] = 0.0f;
    }
    return 0;
  }
  isaac_render_shell_81f8b0_row_read(row_addr, row8);
  isaac_render_shell_81f8b0_lroom_pack(row8, width, height, out8);
  return 1;
}
extern "C" void isaac_render_shell_a10690_init(uint32_t obj_ptr,
                                                float x,
                                                float y,
                                                float z,
                                                float w) {
  /* VA 0x00a10690â€¦0x00a106d1: thiscall unit-quad field pack. */
  f32_store(obj_ptr + 0x00u, x);
  f32_store(obj_ptr + 0x04u, y);
  f32_store(obj_ptr + 0x08u, z);
  f32_store(obj_ptr + 0x0cu, y);
  f32_store(obj_ptr + 0x10u, x);
  f32_store(obj_ptr + 0x14u, w);
  f32_store(obj_ptr + 0x18u, z);
  f32_store(obj_ptr + 0x1cu, w);
}

extern "C" void isaac_render_shell_a0f550_init(uint32_t obj_ptr,
                                                uint32_t packed_arg) {
  /* VA 0x00a0f550â€¦0x00a0f5fb: packed ARGB bytes / 255.0f â†’ float RGBA. */
  const float denom = f32_from_bits(ISAAC_RENDER_SHELL_F32_255_BITS);
  const uint32_t r = (packed_arg >> 16) & 0xffu;
  const uint32_t g = (packed_arg >> 8) & 0xffu;
  const uint32_t b = packed_arg & 0xffu;
  const uint32_t a = (packed_arg >> 24) & 0xffu;
  /* movzx path: byte in 0..255 â†’ signed cvtdq2ps equals float(byte). */
  f32_store(obj_ptr + 0x00u, static_cast<float>(r) / denom);
  f32_store(obj_ptr + 0x04u, static_cast<float>(g) / denom);
  f32_store(obj_ptr + 0x08u, static_cast<float>(b) / denom);
  f32_store(obj_ptr + 0x0cu, static_cast<float>(a) / denom);
  map_store_u32(obj_ptr + 0x10u, 0u);
}

extern "C" void isaac_render_shell_a10c00_init(uint32_t obj_ptr,
                                                uint32_t src_ptr) {
  /* VA 0x00a10c00â€¦0x00a10cec: DAT corners + 4Ã—5 dword color packs. */
  const float d0 = f32_from_bits(ISAAC_RENDER_SHELL_F32_A10C00_DAT0_BITS);
  const float d1 = f32_from_bits(ISAAC_RENDER_SHELL_F32_A10C00_DAT1_BITS);
  f32_store(obj_ptr + 0x00u, d0);
  f32_store(obj_ptr + 0x04u, d1);
  f32_store(obj_ptr + 0x08u, d0);
  f32_store(obj_ptr + 0x0cu, d1);
  f32_store(obj_ptr + 0x10u, d0);
  f32_store(obj_ptr + 0x14u, d1);
  f32_store(obj_ptr + 0x18u, d0);
  f32_store(obj_ptr + 0x1cu, d1);
  for (uint32_t copy = 0; copy < static_cast<uint32_t>(
                                    ISAAC_RENDER_SHELL_A10C00_COPY_COUNT);
       ++copy) {
    const uint32_t dst_base =
        obj_ptr + 0x20u +
        copy * static_cast<uint32_t>(ISAAC_RENDER_SHELL_A10C00_SRC_DWORDS) * 4u;
    for (uint32_t i = 0;
         i < static_cast<uint32_t>(ISAAC_RENDER_SHELL_A10C00_SRC_DWORDS); ++i) {
      const uint32_t word = map_load_u32(src_ptr + i * 4u);
      map_store_u32(dst_base + i * 4u, word);
    }
  }
}

extern "C" uint32_t isaac_render_shell_817830_lroom_quad_post(
    uint32_t obj_ptr,
    uint8_t* flag_at_20) {
  /* VA 0x00817b8aâ€¦0x00817b8e */
  if (flag_at_20 != nullptr) {
    *flag_at_20 = 0u;
  }
  return obj_ptr +
         static_cast<uint32_t>(ISAAC_RENDER_SHELL_817830_LROOM_QUAD_STRIDE);
}

extern "C" uint32_t isaac_render_shell_817830_lroom_pair_advance(
    uint32_t obj_ptr) {
  /* VA 0x00817bbd */
  return obj_ptr +
         static_cast<uint32_t>(ISAAC_RENDER_SHELL_817830_LROOM_PAIR_STRIDE);
}

extern "C" int32_t isaac_render_shell_817830_lroom_loop_step(
    uint32_t count_before,
    uint32_t* count_after) {
  /* VA 0x00817b6c dec / 0x00817bc0 sub 1; continue while != 0. */
  const uint32_t next = count_before - 1u;
  if (count_after != nullptr) {
    *count_after = next;
  }
  return next != 0u ? 1 : 0;
}

extern "C" float isaac_render_shell_817830_type9_half(float scale) {
  /* VA 0x00817bf2 / 0x00817c8f */
  const float half = f32_from_bits(ISAAC_RENDER_SHELL_F32_HALF_BITS);
  return scale * half;
}

extern "C" void isaac_render_shell_817830_type9_cell0(float scale_a8,
                                                     float mul_005,
                                                     float mul_05,
                                                     float offset_c,
                                                     float* out_half_a,
                                                     float* out_x,
                                                     float* out_y) {
  /* VA 0x00817be9â€¦0x00817c37 */
  const float half_a = isaac_render_shell_817830_type9_half(scale_a8);
  const float x = mul_005 + offset_c;
  const float y = half_a + mul_05;
  if (out_half_a != nullptr) {
    *out_half_a = half_a;
  }
  if (out_x != nullptr) {
    *out_x = x;
  }
  if (out_y != nullptr) {
    *out_y = y;
  }
}

extern "C" void isaac_render_shell_817830_type9_cell1(float scale_70,
                                                     float half_a,
                                                     float mul_05,
                                                     float* out_half_b,
                                                     float* out_sum,
                                                     float* out_y2) {
  /* VA 0x00817c89â€¦0x00817cc0 */
  const float half_b = isaac_render_shell_817830_type9_half(scale_70);
  const float sum = half_b + half_a;
  const float y2 = sum + mul_05;
  if (out_half_b != nullptr) {
    *out_half_b = half_b;
  }
  if (out_sum != nullptr) {
    *out_sum = sum;
  }
  if (out_y2 != nullptr) {
    *out_y2 = y2;
  }
}

extern "C" int32_t isaac_render_shell_stage_overlay_host_open(
    uint32_t host_74ea50_al_w) {
  const uint8_t host_74ea50_al = static_cast<uint8_t>(host_74ea50_al_w & 0xffu);
  /* VA 0x0080ef2d: test al, al; je 0x0080f12c */
  return host_74ea50_al != 0u ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_stage_overlay_triple_open(
    int32_t game_field_8,
    int32_t nested_room_type_10,
    uint32_t host_74ea50_al_w) {
  const uint8_t host_74ea50_al = static_cast<uint8_t>(host_74ea50_al_w & 0xffu);
  if (isaac_render_shell_stage_overlay_dual_open(game_field_8,
                                                 nested_room_type_10) == 0) {
    return 0;
  }
  return isaac_render_shell_stage_overlay_host_open(host_74ea50_al);
}

extern "C" float isaac_render_shell_stage_overlay_scale(void) {
  /* VA 0x0080ef53â€¦0x0080ef5e: DAT_00bf941c (1.0) * DAT_00bf93e8 (2.0). */
  const float one = f32_from_bits(ISAAC_RENDER_SHELL_F32_ONE_BITS);
  const float two = f32_from_bits(ISAAC_RENDER_SHELL_F32_TWO_BITS);
  return one * two;
}

extern "C" float isaac_render_shell_stage_overlay_pre_floor_x(
    float scroll_x_c78dc4,
    float pos_x,
    float scale) {
  /* VA 0x0080ef41â€¦0x0080ef90 */
  const float off_scroll = f32_from_bits(ISAAC_RENDER_SHELL_F32_338_BITS);
  const float off_pos = f32_from_bits(ISAAC_RENDER_SHELL_F32_60_BITS);
  const float half = f32_from_bits(ISAAC_RENDER_SHELL_F32_HALF_BITS);
  const float factor = f32_from_bits(ISAAC_RENDER_SHELL_F32_0_65_BITS);
  const float a = (scroll_x_c78dc4 - off_scroll) * half;
  const float b = (pos_x - off_pos) * factor;
  return (a + b) * scale + half;
}

extern "C" float isaac_render_shell_stage_overlay_pre_floor_y(
    float scroll_y_c78edc,
    float pos_y,
    float scale) {
  /* VA 0x0080efc2â€¦0x0080efff */
  const float off_pos = f32_from_bits(ISAAC_RENDER_SHELL_F32_140_BITS);
  const float off_scroll = f32_from_bits(ISAAC_RENDER_SHELL_F32_182_BITS);
  const float half = f32_from_bits(ISAAC_RENDER_SHELL_F32_HALF_BITS);
  const float factor = f32_from_bits(ISAAC_RENDER_SHELL_F32_0_65_BITS);
  const float a = (pos_y - off_pos) * factor;
  const float b = (scroll_y_c78edc - off_scroll) * half;
  return (a + b) * scale + half;
}

extern "C" float isaac_render_shell_stage_overlay_div_scale(float floor_val,
                                                            float scale) {
  /* VA 0x0080efbc / 0x0080f083 */
  return floor_val / scale;
}

extern "C" float isaac_render_shell_stage_overlay_pos_add(float camera,
                                                          float div) {
  /* VA 0x0080f0b3â€¦0x0080f0cf */
  return camera + div;
}

extern "C" void isaac_render_shell_stage_overlay_store_scales(
    float src_c3793c,
    float src_c37940,
    float* out_6edc,
    float* out_6ee0) {
  /* VA 0x0080f033 / 0x0080f049: Game+0x6edc â† c3793c; +0x6ee0 â† c37940 */
  if (out_6edc != nullptr) {
    *out_6edc = src_c3793c;
  }
  if (out_6ee0 != nullptr) {
    *out_6ee0 = src_c37940;
  }
}

extern "C" int32_t isaac_render_shell_stage_overlay_color_init(
    uint32_t dst_ptr,
    uint32_t self_skip_ptr) {
  /* VA 0x0080f089: cmp ecx,eax; je skip (MSVC self-assign). */
  if (dst_ptr == self_skip_ptr) {
    return 0;
  }
  const float one = f32_from_bits(ISAAC_RENDER_SHELL_F32_ONE_BITS);
  /* movaps white from DAT_00bac7b0 (1,1,1,1) â†’ [dst+0..0xf] */
  f32_store(dst_ptr + 0x00u, one);
  f32_store(dst_ptr + 0x04u, one);
  f32_store(dst_ptr + 0x08u, one);
  f32_store(dst_ptr + 0x0cu, one);
  /* movups zero xmm2 â†’ [dst+0x10..0x1f] */
  f32_store(dst_ptr + 0x10u, 0.0f);
  f32_store(dst_ptr + 0x14u, 0.0f);
  f32_store(dst_ptr + 0x18u, 0.0f);
  f32_store(dst_ptr + 0x1cu, 0.0f);
  /* movq zero from stack zeros â†’ [dst+0x20..0x27]; dword [dst+0x28]=0 */
  map_store_u32(dst_ptr + 0x20u, 0u);
  map_store_u32(dst_ptr + 0x24u, 0u);
  map_store_u32(dst_ptr + 0x28u, 0u);
  return 1;
}

extern "C" int32_t isaac_render_shell_stage_overlay_draw_needed(
    uint32_t flag_6f49_w) {
  const uint8_t flag_6f49 = static_cast<uint8_t>(flag_6f49_w & 0xffu);
  /* VA 0x0080f0ac: cmp byte [Game+0x6f49], 0; je skip draws */
  return flag_6f49 != 0u ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_stage_overlay_draw_swap(
    uint32_t flag_6eb0_w) {
  const uint8_t flag_6eb0 = static_cast<uint8_t>(flag_6eb0_w & 0xffu);
  /* VA 0x0080f0d7: cmp byte [Game+0x6eb0], 0; je order A */
  return flag_6eb0 != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_render_shell_stage_overlay_clamp_va(void) {
  /* VA 0x0080f0de / 0x0080f118: push 0xc7b640 (twice per Render). */
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_OVERLAY_CLAMP_VA);
}

extern "C" void isaac_render_shell_stage_overlay_anim_offsets(
    int32_t plan,
    uint32_t* out_first_off,
    uint32_t* out_second_off) {
  uint32_t first = 0u;
  uint32_t second = 0u;
  if (plan == ISAAC_RENDER_SHELL_OVERLAY_PLAN_ORDER_A) {
    first = static_cast<uint32_t>(ISAAC_RENDER_SHELL_OVERLAY_ANIM_A_OFF);
    second = static_cast<uint32_t>(ISAAC_RENDER_SHELL_OVERLAY_ANIM_B_OFF);
  } else if (plan == ISAAC_RENDER_SHELL_OVERLAY_PLAN_ORDER_B) {
    first = static_cast<uint32_t>(ISAAC_RENDER_SHELL_OVERLAY_ANIM_B_OFF);
    second = static_cast<uint32_t>(ISAAC_RENDER_SHELL_OVERLAY_ANIM_A_OFF);
  }
  if (out_first_off != nullptr) {
    *out_first_off = first;
  }
  if (out_second_off != nullptr) {
    *out_second_off = second;
  }
}

extern "C" int32_t isaac_render_shell_stage_overlay_draw_plan(
    uint32_t flag_6f49_w,
    uint32_t flag_6eb0_w) {
  const uint8_t flag_6f49 = static_cast<uint8_t>(flag_6f49_w & 0xffu);
  const uint8_t flag_6eb0 = static_cast<uint8_t>(flag_6eb0_w & 0xffu);
  if (isaac_render_shell_stage_overlay_draw_needed(flag_6f49) == 0) {
    return ISAAC_RENDER_SHELL_OVERLAY_PLAN_SKIP;
  }
  if (isaac_render_shell_stage_overlay_draw_swap(flag_6eb0) != 0) {
    return ISAAC_RENDER_SHELL_OVERLAY_PLAN_ORDER_B;
  }
  return ISAAC_RENDER_SHELL_OVERLAY_PLAN_ORDER_A;
}

extern "C" void isaac_render_shell_stage_overlay_draw_pos(float camera_x,
                                                          float camera_y,
                                                          float floor_x,
                                                          float floor_y,
                                                          float scale,
                                                          float* out_x,
                                                          float* out_y) {
  /* P56+P57 both axes after host floor returns. */
  const float div_x =
      isaac_render_shell_stage_overlay_div_scale(floor_x, scale);
  const float div_y =
      isaac_render_shell_stage_overlay_div_scale(floor_y, scale);
  if (out_x != nullptr) {
    *out_x = isaac_render_shell_stage_overlay_pos_add(camera_x, div_x);
  }
  if (out_y != nullptr) {
    *out_y = isaac_render_shell_stage_overlay_pos_add(camera_y, div_y);
  }
}

extern "C" int32_t isaac_render_shell_get_stage_id_mode44(int32_t mode_26584) {
  /* VA 0x00738478: cmp [Manager+0x26584], 0x2c */
  return mode_26584 == ISAAC_RENDER_SHELL_GET_STAGE_ID_MODE_44 ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_get_stage_id_dim2(int32_t dim_1830c) {
  /* VA 0x0073849e: cmp [this+0x1830c], 2 */
  return dim_1830c == ISAAC_RENDER_SHELL_GET_STAGE_ID_DIM_2 ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_get_stage_id_plan(int32_t mode_26584,
                                                       int32_t dim_1830c) {
  if (isaac_render_shell_get_stage_id_mode44(mode_26584) != 0) {
    return ISAAC_RENDER_SHELL_GET_STAGE_ID_PLAN_MODE44;
  }
  if (isaac_render_shell_get_stage_id_dim2(dim_1830c) != 0) {
    return ISAAC_RENDER_SHELL_GET_STAGE_ID_PLAN_PURE_DIM2;
  }
  return ISAAC_RENDER_SHELL_GET_STAGE_ID_PLAN_RC;
}

extern "C" uint32_t isaac_render_shell_get_stage_id_dim2_result(void) {
  /* VA 0x007384a7: mov eax, 0x23 */
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_GET_STAGE_ID_DIM2_RESULT);
}

extern "C" int32_t isaac_render_shell_82d030_greed_path(
    int32_t mode_arg,
    int32_t manager_nonnull,
    int32_t difficulty_269c8) {
  /* VA 0x0082d036â€¦0x0082d065 */
  if (mode_arg == ISAAC_RENDER_SHELL_82D030_MODE_AUTO) {
    if (manager_nonnull == 0) {
      return 0;
    }
    if (difficulty_269c8 == ISAAC_RENDER_SHELL_82D030_DIFF_GREED_A ||
        difficulty_269c8 == ISAAC_RENDER_SHELL_82D030_DIFF_GREED_B) {
      return 1;
    }
    return 0;
  }
  if (mode_arg == ISAAC_RENDER_SHELL_82D030_MODE_GREED_FORCE) {
    return 1;
  }
  return 0;
}

extern "C" uint32_t isaac_render_shell_82d030_get_stage_id(
    uint32_t level_stage,
    uint32_t stage_type,
    int32_t mode_arg,
    int32_t manager_nonnull,
    int32_t difficulty_269c8) {
  /* VA 0x0082d030â€¦0x0082d0fd complete pure body (zero nested calls). */
  const int32_t greed = isaac_render_shell_82d030_greed_path(
      mode_arg, manager_nonnull, difficulty_269c8);
  const int32_t stage_s = static_cast<int32_t>(level_stage);

  if (greed != 0) {
    /* Greed path VA 0x0082d065â€¦0x0082d0a7 */
    if (stage_s == 7 || stage_s == 6) {
      return static_cast<uint32_t>(stage_s + 0x12);
    }
    if (stage_s == 5) {
      return static_cast<uint32_t>(stage_s + 9);
    }
    if (static_cast<int32_t>(stage_type) == 4) {
      return level_stage * 2u + 0x19u;
    }
    if (static_cast<int32_t>(stage_type) == 5) {
      return level_stage * 2u + 0x1au;
    }
    /* lea eax,[ecx-1]; lea eax,[edx+eax*2]; add eax,ecx */
    return stage_type + (level_stage - 1u) * 2u + level_stage;
  }

  /* Normal path VA 0x0082d054 / 0x0082d0a9â€¦ */
  if (stage_s == 0x0d) {
    return 0x23u;
  }
  if (stage_s >= 9) {
    if (stage_s == 9) {
      /* type==4 â†’ 0x24 else 0xd (cmove) */
      return static_cast<int32_t>(stage_type) == 4 ? 0x24u : 0x0du;
    }
    if (stage_s == 0x0c) {
      return 0x1au;
    }
    /* lea eax,[ecx-3]; lea eax,[edx+eax*2] */
    return stage_type + (level_stage - 3u) * 2u;
  }

  /* stage < 9 (signed): dec ecx; type branches */
  uint32_t ecx = level_stage - 1u;
  if (static_cast<int32_t>(stage_type) == 4) {
    ecx &= 0xfffffffeu;
    return ecx + 0x1bu;
  }
  ecx >>= 1; /* shr logical */
  if (static_cast<int32_t>(stage_type) == 5) {
    return ecx * 2u + 0x1cu;
  }
  /* lea eax,[edx+1]; lea eax,[eax+ecx*2]; add eax,ecx */
  return (stage_type + 1u) + ecx * 2u + ecx;
}

extern "C" uint32_t isaac_render_shell_get_stage_id_resolve(
    int32_t mode_26584,
    int32_t dim_1830c,
    uint32_t level_stage,
    uint32_t stage_type,
    uint32_t host_type_74f690,
    int32_t manager_nonnull,
    int32_t difficulty_269c8) {
  const int32_t plan =
      isaac_render_shell_get_stage_id_plan(mode_26584, dim_1830c);
  if (plan == ISAAC_RENDER_SHELL_GET_STAGE_ID_PLAN_PURE_DIM2) {
    return isaac_render_shell_get_stage_id_dim2_result();
  }
  const uint32_t type =
      (plan == ISAAC_RENDER_SHELL_GET_STAGE_ID_PLAN_MODE44) ? host_type_74f690
                                                           : stage_type;
  return isaac_render_shell_82d030_get_stage_id(
      level_stage,
      type,
      ISAAC_RENDER_SHELL_82D030_MODE_AUTO,
      manager_nonnull,
      difficulty_269c8);
}

extern "C" int32_t isaac_render_shell_74ea50_diff_early_false(
    int32_t difficulty_269c8) {
  /* VA 0x0074ea68 / 0x0074ea6d: je false when difficulty âˆˆ {2,3} */
  return (difficulty_269c8 == ISAAC_RENDER_SHELL_82D030_DIFF_GREED_A ||
          difficulty_269c8 == ISAAC_RENDER_SHELL_82D030_DIFF_GREED_B)
             ? 1
             : 0;
}

extern "C" int32_t isaac_render_shell_74ea50_flag_early_false(
    uint32_t this0,
    uint32_t flags_2654c) {
  /* VA 0x0074ea77â€¦0x0074ea8d: (this0-1) u<=5 && (flags & 0x10000) */
  const uint32_t dec = this0 - 1u;
  if (dec > 5u) {
    return 0;
  }
  return (flags_2654c & ISAAC_RENDER_SHELL_74EA50_FLAG_BIT) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_74ea50_early_false(
    int32_t difficulty_269c8,
    uint32_t this0,
    uint32_t flags_2654c) {
  if (isaac_render_shell_74ea50_diff_early_false(difficulty_269c8) != 0) {
    return 1;
  }
  return isaac_render_shell_74ea50_flag_early_false(this0, flags_2654c);
}

extern "C" uint32_t isaac_render_shell_74ea50_mgr_words_or(
    uint32_t manager_26550,
    uint32_t this_word_0c) {
  /* VA 0x0074ea90â€¦0x0074ea96 */
  return manager_26550 | this_word_0c;
}

extern "C" uint32_t isaac_render_shell_74ea50_mode_adjust(
    uint32_t this0,
    uint32_t mgr_or,
    uint32_t poll_6f9400,
    uint32_t poll_6f95a0) {
  /* VA 0x0074ea9aâ€¦0x0074eab5:
     eax = (~poll_b) & (poll_a | mgr_or); test al,2; cmove this0 / this0+1 */
  const uint32_t combined =
      (static_cast<uint32_t>(~poll_6f95a0) & (poll_6f9400 | mgr_or));
  if ((combined & 2u) != 0u) {
    return this0 + 1u;
  }
  return this0;
}

extern "C" int32_t isaac_render_shell_74ea50_probe_needed(uint32_t mode_adj,
                                                          uint32_t this4) {
  /* VA 0x0074eab9â€¦0x0074eacc */
  if (mode_adj !=
      static_cast<uint32_t>(ISAAC_RENDER_SHELL_74EA50_MODE_TARGET)) {
    return 0;
  }
  if (this4 == static_cast<uint32_t>(ISAAC_RENDER_SHELL_74EA50_TYPE_4) ||
      this4 == static_cast<uint32_t>(ISAAC_RENDER_SHELL_74EA50_TYPE_5)) {
    return 1;
  }
  return 0;
}

extern "C" int32_t isaac_render_shell_74ea50_entry_plan(
    int32_t difficulty_269c8,
    uint32_t this0,
    uint32_t flags_2654c) {
  if (isaac_render_shell_74ea50_early_false(difficulty_269c8, this0,
                                            flags_2654c) != 0) {
    return ISAAC_RENDER_SHELL_74EA50_PLAN_FALSE;
  }
  return ISAAC_RENDER_SHELL_74EA50_PLAN_POLL;
}

extern "C" int32_t isaac_render_shell_74ea50_post_poll_plan(
    uint32_t this0,
    uint32_t this4,
    uint32_t mgr_or,
    uint32_t poll_6f9400,
    uint32_t poll_6f95a0) {
  const uint32_t mode_adj = isaac_render_shell_74ea50_mode_adjust(
      this0, mgr_or, poll_6f9400, poll_6f95a0);
  if (isaac_render_shell_74ea50_probe_needed(mode_adj, this4) != 0) {
    return ISAAC_RENDER_SHELL_74EA50_PLAN_PROBE;
  }
  return ISAAC_RENDER_SHELL_74EA50_PLAN_FALSE;
}

extern "C" uint32_t isaac_render_shell_74ea50_probe_arg(void) {
  /* VA 0x0074eace: push 0x2f */
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_74EA50_PROBE_ARG);
}

/* PE static 5Ã—5 stage-type tables (hash-bound DAT_00b6a878 / DAT_00b6a8e0). */
static const uint32_t k74f690_table_lo[ISAAC_RENDER_SHELL_74F690_TABLE_SIZE] = {
    0, 0, 0, 2, 2, 0, 0, 2, 2, 2, 0, 1, 0, 2, 4, 1, 1, 1, 4, 5, 1, 1, 4, 5, 5};
static const uint32_t k74f690_table_hi[ISAAC_RENDER_SHELL_74F690_TABLE_SIZE] = {
    0, 0, 0, 0, 2, 0, 0, 0, 2, 2, 0, 0, 0, 2, 2, 0, 1, 1, 1, 2, 1, 1, 1, 1, 2};

static int32_t iabs32(int32_t x) {
  /* PE cdq / xor / sub */
  const int32_t mask = x >> 31;
  return (x ^ mask) - mask;
}

extern "C" int32_t isaac_render_shell_74f690_entry_plan(int32_t mode_26584,
                                                       int32_t room_idx,
                                                       int32_t stage_0,
                                                       uint32_t flag_183a0_w) {
  const uint8_t flag_183a0 = static_cast<uint8_t>(flag_183a0_w & 0xffu);
  /* VA 0x0074f69câ€¦0x0074f6ca */
  if (mode_26584 != ISAAC_RENDER_SHELL_GET_STAGE_ID_MODE_44) {
    return ISAAC_RENDER_SHELL_74F690_PLAN_TYPE4;
  }
  if (room_idx == ISAAC_RENDER_SHELL_74F690_ROOM_IDX_SPECIAL) {
    if (stage_0 == ISAAC_RENDER_SHELL_74F690_STAGE_WOMB_A) {
      return ISAAC_RENDER_SHELL_74F690_PLAN_CONST4;
    }
    return ISAAC_RENDER_SHELL_74F690_PLAN_TYPE4;
  }
  if (room_idx < 0) {
    return ISAAC_RENDER_SHELL_74F690_PLAN_TYPE4;
  }
  if (flag_183a0 == 0) {
    return ISAAC_RENDER_SHELL_74F690_PLAN_GETROOM;
  }
  return ISAAC_RENDER_SHELL_74F690_PLAN_STAGE;
}

extern "C" int32_t isaac_render_shell_74f690_room_idx_special(void) {
  return ISAAC_RENDER_SHELL_74F690_ROOM_IDX_SPECIAL;
}

extern "C" int32_t isaac_render_shell_74f690_getroom_dim(void) {
  return ISAAC_RENDER_SHELL_74F690_GETROOM_DIM;
}

extern "C" uint32_t isaac_render_shell_74f690_getroom_va(void) {
  return ISAAC_RENDER_SHELL_HOST_740BC0_VA;
}

extern "C" int32_t isaac_render_shell_74f690_clamp_room_idx(
    int32_t room_idx_in,
    int32_t room_desc_dword0,
    int32_t room_desc_field10_nz) {
  /* VA 0x0074f6d4â€¦0x0074f6ed */
  if (room_desc_field10_nz == 0) {
    return room_idx_in;
  }
  int32_t v = room_desc_dword0;
  if (v <= 0) {
    v = 0;
  }
  if (v < ISAAC_RENDER_SHELL_74F690_ROOM_IDX_CLAMP_MAX) {
    return v;
  }
  return ISAAC_RENDER_SHELL_74F690_ROOM_IDX_CLAMP_MAX;
}

extern "C" int32_t isaac_render_shell_74f690_final_room_idx(
    int32_t room_idx_in,
    uint32_t flag_183a0_w,
    int32_t room_desc_dword0,
    int32_t room_desc_field10_nz) {
  const uint8_t flag_183a0 = static_cast<uint8_t>(flag_183a0_w & 0xffu);
  if (flag_183a0 != 0) {
    return room_idx_in;
  }
  return isaac_render_shell_74f690_clamp_room_idx(
      room_idx_in, room_desc_dword0, room_desc_field10_nz);
}

extern "C" int32_t isaac_render_shell_74f690_stage_plan(int32_t stage_0) {
  /* VA 0x0074f6f2â€¦0x0074f756: cmp eax,6 / jg; cmp 7/8 */
  if (stage_0 > 6) {
    if (stage_0 == ISAAC_RENDER_SHELL_74F690_STAGE_WOMB_A ||
        stage_0 == ISAAC_RENDER_SHELL_74F690_STAGE_WOMB_B) {
      return ISAAC_RENDER_SHELL_74F690_STAGE_WOMB;
    }
    return ISAAC_RENDER_SHELL_74F690_STAGE_TYPE4;
  }
  return ISAAC_RENDER_SHELL_74F690_STAGE_TABLE_LO;
}

extern "C" int32_t isaac_render_shell_74f690_sdiv13(int32_t value) {
  /* imul 0x4ec4ec4f; sar edx,2; edi = edx + (edx>>31) */
  const int64_t prod =
      static_cast<int64_t>(value) *
      static_cast<int64_t>(
          static_cast<int32_t>(ISAAC_RENDER_SHELL_74F690_SDIV13_MAGIC));
  int32_t edx = static_cast<int32_t>(prod >> 32);
  edx >>= 2;
  const uint32_t sign = static_cast<uint32_t>(edx) >> 31;
  return edx + static_cast<int32_t>(sign);
}

extern "C" int32_t isaac_render_shell_74f690_womb_distance(int32_t room_idx,
                                                          int32_t field14) {
  /* VA 0x0074f75câ€¦0x0074f7a9 */
  const int32_t field_div = isaac_render_shell_74f690_sdiv13(field14);
  const int32_t room_div = isaac_render_shell_74f690_sdiv13(room_idx);
  int32_t eax = room_div - field_div;
  const int32_t edi = field_div - room_div;
  eax *= ISAAC_RENDER_SHELL_74F690_GRID;
  eax -= room_idx;
  eax += field14;
  return iabs32(eax) + iabs32(edi);
}

extern "C" int32_t isaac_render_shell_74f690_womb_near(int32_t distance) {
  /* VA 0x0074f7ac: cmp ecx, 3; jg far-table (near when <= 3) */
  return distance <= ISAAC_RENDER_SHELL_74F690_DIST_NEAR ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_74f690_scale_axis(float value) {
  /* mulss *5.0; maxss 0; minss ~4.999; cvttss2si */
  const float mul = f32_from_bits(ISAAC_RENDER_SHELL_F32_5_BITS);
  const float maxv = f32_from_bits(ISAAC_RENDER_SHELL_F32_4_999_BITS);
  float x = value * mul;
  x = sse_maxss(x, 0.0f);
  x = sse_minss(x, maxv);
  return static_cast<int32_t>(x);
}

extern "C" int32_t isaac_render_shell_74f690_table_index(int32_t row,
                                                        int32_t col) {
  /* lea eax,[eax+eax*4]; add eax,ecx */
  return row * ISAAC_RENDER_SHELL_74F690_TABLE_DIM + col;
}

extern "C" uint32_t isaac_render_shell_74f690_table_lo(int32_t index) {
  if (index < 0 || index >= ISAAC_RENDER_SHELL_74F690_TABLE_SIZE) {
    return 0u;
  }
  return k74f690_table_lo[index];
}

extern "C" uint32_t isaac_render_shell_74f690_table_hi(int32_t index) {
  if (index < 0 || index >= ISAAC_RENDER_SHELL_74F690_TABLE_SIZE) {
    return 0u;
  }
  return k74f690_table_hi[index];
}

extern "C" uint32_t isaac_render_shell_74f690_float_table_type(
    float f_183b0,
    float f_18654,
    int32_t use_hi_table) {
  const int32_t row = isaac_render_shell_74f690_scale_axis(f_183b0);
  const int32_t col = isaac_render_shell_74f690_scale_axis(f_18654);
  const int32_t idx = isaac_render_shell_74f690_table_index(row, col);
  if (use_hi_table != 0) {
    return isaac_render_shell_74f690_table_hi(idx);
  }
  return isaac_render_shell_74f690_table_lo(idx);
}

extern "C" uint32_t isaac_render_shell_74f690_slot_field_off(
    int32_t room_slot_18314) {
  /* imul eax, [Game+0x18314], 0xb8; then +0x14 */
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_74F690_SLOT_FIELD_OFF) +
         static_cast<uint32_t>(room_slot_18314) *
             static_cast<uint32_t>(ISAAC_RENDER_SHELL_74F690_SLOT_STRIDE);
}

extern "C" uint32_t isaac_render_shell_74f690_resolve(
    int32_t mode_26584,
    int32_t room_idx,
    int32_t stage_0,
    uint32_t stage_type_4,
    uint32_t flag_183a0_w,
    int32_t room_desc_dword0,
    int32_t room_desc_field10_nz,
    float f_183b0,
    float f_18654,
    int32_t field14) {
  const uint8_t flag_183a0 = static_cast<uint8_t>(flag_183a0_w & 0xffu);
  const int32_t entry = isaac_render_shell_74f690_entry_plan(
      mode_26584, room_idx, stage_0, flag_183a0);
  if (entry == ISAAC_RENDER_SHELL_74F690_PLAN_TYPE4) {
    return stage_type_4;
  }
  if (entry == ISAAC_RENDER_SHELL_74F690_PLAN_CONST4) {
    return static_cast<uint32_t>(ISAAC_RENDER_SHELL_74F690_CONST_TYPE4);
  }

  /* GETROOM or STAGE: finalize room_idx then stage dispatch.
     Caller must have executed host GetRoomByIdx when entry==GETROOM and
     supply room_desc_* sparse samples; flag!=0 leaves room_idx unchanged. */
  const int32_t room = isaac_render_shell_74f690_final_room_idx(
      room_idx, flag_183a0, room_desc_dword0, room_desc_field10_nz);
  const int32_t stage_plan = isaac_render_shell_74f690_stage_plan(stage_0);

  if (stage_plan == ISAAC_RENDER_SHELL_74F690_STAGE_TYPE4) {
    return stage_type_4;
  }
  if (stage_plan == ISAAC_RENDER_SHELL_74F690_STAGE_WOMB) {
    const int32_t dist =
        isaac_render_shell_74f690_womb_distance(room, field14);
    if (isaac_render_shell_74f690_womb_near(dist) != 0) {
      return static_cast<uint32_t>(ISAAC_RENDER_SHELL_74F690_CONST_TYPE4);
    }
    return isaac_render_shell_74f690_float_table_type(f_183b0, f_18654, 1);
  }
  /* TABLE_LO */
  return isaac_render_shell_74f690_float_table_type(f_183b0, f_18654, 0);
}

/* ---- Game::GetRoomByIdx pure CF â€” ABI v15 (VA 0x00740bc0) ---- */

extern "C" int32_t isaac_render_shell_740bc0_dim_effective(int32_t dim,
                                                          int32_t game_dim) {
  /* VA 0x00740bffâ€¦0x00740c0c: test ecx,ecx; jns keep; else load 0x1830c */
  if (dim < 0) {
    return game_dim;
  }
  return dim;
}

extern "C" int32_t isaac_render_shell_740bc0_dim_in_range(int32_t dim_eff) {
  /* VA 0x00740c0c: cmp ecx,3; jae empty â€” unsigned */
  return (static_cast<uint32_t>(dim_eff) <
          static_cast<uint32_t>(ISAAC_RENDER_SHELL_740BC0_DIM_COUNT))
             ? 1
             : 0;
}

extern "C" int32_t isaac_render_shell_740bc0_idx_in_range(int32_t idx) {
  /* VA 0x00740ce0: lea eax,[edx+0x14]; cmp eax,0xbc; ja empty */
  const uint32_t adj =
      static_cast<uint32_t>(idx) +
      static_cast<uint32_t>(ISAAC_RENDER_SHELL_740BC0_IDX_RANGE_ADD);
  return adj <= ISAAC_RENDER_SHELL_740BC0_IDX_RANGE_LIM ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_740bc0_entry_plan(int32_t dim_eff,
                                                       int32_t idx,
                                                       int32_t current_idx) {
  if (isaac_render_shell_740bc0_dim_in_range(dim_eff) == 0) {
    return ISAAC_RENDER_SHELL_740BC0_PLAN_EMPTY;
  }
  if (idx == ISAAC_RENDER_SHELL_740BC0_IDX_CURRENT) {
    if (current_idx < 0) {
      return ISAAC_RENDER_SHELL_740BC0_PLAN_EMPTY;
    }
    return ISAAC_RENDER_SHELL_740BC0_PLAN_RECURSE_CURRENT;
  }
  if (idx == ISAAC_RENDER_SHELL_740BC0_IDX_SPECIAL) {
    if (current_idx < 0) {
      return ISAAC_RENDER_SHELL_740BC0_PLAN_EMPTY;
    }
    if (dim_eff == 0) {
      return ISAAC_RENDER_SHELL_740BC0_PLAN_RECURSE_SPECIAL;
    }
    return ISAAC_RENDER_SHELL_740BC0_PLAN_WALK;
  }
  if (isaac_render_shell_740bc0_idx_in_range(idx) == 0) {
    return ISAAC_RENDER_SHELL_740BC0_PLAN_EMPTY;
  }
  if (idx < 0) {
    return ISAAC_RENDER_SHELL_740BC0_PLAN_NEGATIVE;
  }
  return ISAAC_RENDER_SHELL_740BC0_PLAN_GRID;
}

extern "C" int32_t isaac_render_shell_740bc0_current_recurse_dim(
    int32_t dim_eff) {
  /* VA 0x00740c2bâ€¦0x00740c34: xor eax; test ecx; sete al */
  return dim_eff == 0 ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_740bc0_special_recurse_idx(void) {
  return ISAAC_RENDER_SHELL_740BC0_SPECIAL_RECURSE_IDX;
}

extern "C" int32_t isaac_render_shell_740bc0_special_recurse_dim(void) {
  return ISAAC_RENDER_SHELL_740BC0_SPECIAL_RECURSE_DIM;
}

extern "C" uint32_t isaac_render_shell_740bc0_neg_desc_off(int32_t idx) {
  /* VA 0x00740cee: imul eax,edx,0xb8; sub esi,eax; lea [esi+0x16bc4]
     Game-relative: 0x16bc4 - idx*0xb8 */
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_740BC0_NEG_BASE_OFF) -
         static_cast<uint32_t>(idx) *
             static_cast<uint32_t>(ISAAC_RENDER_SHELL_740BC0_SLOT_STRIDE);
}

extern "C" uint32_t isaac_render_shell_740bc0_map_elem_off(int32_t dim_eff,
                                                          int32_t idx) {
  /* (dim*0xa9 + idx)*4 + 0x17adc */
  const uint32_t linear =
      static_cast<uint32_t>(dim_eff) *
          static_cast<uint32_t>(ISAAC_RENDER_SHELL_740BC0_GRID_STRIDE) +
      static_cast<uint32_t>(idx);
  return linear * 4u +
         static_cast<uint32_t>(ISAAC_RENDER_SHELL_740BC0_MAP_BASE_OFF);
}

extern "C" int32_t isaac_render_shell_740bc0_slot_valid(uint32_t slot) {
  /* VA 0x00740d1e: cmp eax,0x20e; ja empty */
  return slot <= static_cast<uint32_t>(ISAAC_RENDER_SHELL_740BC0_SLOT_MAX) ? 1
                                                                          : 0;
}

extern "C" uint32_t isaac_render_shell_740bc0_slot_desc_off(uint32_t slot) {
  /* slot*0xb8 + 0x14 */
  return slot * static_cast<uint32_t>(ISAAC_RENDER_SHELL_740BC0_SLOT_STRIDE) +
         static_cast<uint32_t>(ISAAC_RENDER_SHELL_740BC0_DESC_BASE_OFF);
}

extern "C" uint32_t isaac_render_shell_740bc0_empty_va(void) {
  return ISAAC_RENDER_SHELL_740BC0_EMPTY_VA;
}

extern "C" uint32_t isaac_render_shell_740bc0_once_guard_va(void) {
  return ISAAC_RENDER_SHELL_740BC0_ONCE_GUARD_VA;
}

extern "C" int32_t isaac_render_shell_740bc0_once_init_needed(int32_t guard_val,
                                                             int32_t tls_c) {
  /* VA 0x00740bf3: cmp guard, [tls+0xc]; jg once-init â€” signed */
  return guard_val > tls_c ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_740bc0_walk_match(int32_t kind_m4,
                                                       int32_t type_at8,
                                                       int32_t field_at10) {
  /* VA 0x00740c94â€¦0x00740ca6 */
  if (kind_m4 != 0) {
    return 0;
  }
  if (type_at8 != ISAAC_RENDER_SHELL_740BC0_WALK_MATCH_TYPE) {
    return 0;
  }
  if (field_at10 != ISAAC_RENDER_SHELL_740BC0_WALK_MATCH_VAR) {
    return 0;
  }
  return 1;
}

extern "C" uint32_t isaac_render_shell_740bc0_walk_start_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_740BC0_WALK_START_OFF);
}

extern "C" uint32_t isaac_render_shell_740bc0_walk_stride(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_740BC0_WALK_STRIDE);
}

extern "C" int32_t isaac_render_shell_740bc0_walk_result_delta(void) {
  return ISAAC_RENDER_SHELL_740BC0_WALK_RESULT_DELTA;
}

extern "C" uint32_t isaac_render_shell_740bc0_host_va(void) {
  return ISAAC_RENDER_SHELL_HOST_740BC0_VA;
}

extern "C" int32_t isaac_render_shell_740bc0_resolve_kind(int32_t dim_eff,
                                                         int32_t idx,
                                                         int32_t current_idx,
                                                         uint32_t slot) {
  const int32_t plan =
      isaac_render_shell_740bc0_entry_plan(dim_eff, idx, current_idx);
  if (plan == ISAAC_RENDER_SHELL_740BC0_PLAN_EMPTY) {
    return ISAAC_RENDER_SHELL_740BC0_KIND_EMPTY;
  }
  if (plan == ISAAC_RENDER_SHELL_740BC0_PLAN_NEGATIVE) {
    return ISAAC_RENDER_SHELL_740BC0_KIND_GAME_OFF;
  }
  if (plan == ISAAC_RENDER_SHELL_740BC0_PLAN_GRID) {
    if (isaac_render_shell_740bc0_slot_valid(slot) == 0) {
      return ISAAC_RENDER_SHELL_740BC0_KIND_EMPTY;
    }
    return ISAAC_RENDER_SHELL_740BC0_KIND_GAME_OFF;
  }
  /* RECURSE_CURRENT / RECURSE_SPECIAL / WALK */
  return ISAAC_RENDER_SHELL_740BC0_KIND_HOST;
}

extern "C" uint32_t isaac_render_shell_740bc0_resolve_game_off(
    int32_t dim_eff,
    int32_t idx,
    int32_t current_idx,
    uint32_t slot) {
  const int32_t plan =
      isaac_render_shell_740bc0_entry_plan(dim_eff, idx, current_idx);
  if (plan == ISAAC_RENDER_SHELL_740BC0_PLAN_NEGATIVE) {
    return isaac_render_shell_740bc0_neg_desc_off(idx);
  }
  if (plan == ISAAC_RENDER_SHELL_740BC0_PLAN_GRID &&
      isaac_render_shell_740bc0_slot_valid(slot) != 0) {
    return isaac_render_shell_740bc0_slot_desc_off(slot);
  }
  return 0u;
}

/* ---- opaque_call_00812d00 complete pure body â€” ABI v16 (VA 0x00812d00) ---- */

extern "C" int32_t isaac_render_shell_812d00_type_chain_open(
    int32_t field4_nz, int32_t nested10_nz) {
  /* VA 0x00812d11 / 0x00812d18: test eax,eax; je AABB */
  return (field4_nz != 0 && nested10_nz != 0) ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_812d00_lroom_type_open(
    int32_t room_type_48) {
  /* VA 0x00812d1f: sub eax,9; cmp eax,3; ja AABB â€” unsigned */
  const uint32_t adj =
      static_cast<uint32_t>(room_type_48) -
      static_cast<uint32_t>(ISAAC_RENDER_SHELL_812D00_LROOM_TYPE_BASE);
  return adj <= static_cast<uint32_t>(ISAAC_RENDER_SHELL_812D00_LROOM_TYPE_SPAN)
             ? 1
             : 0;
}

extern "C" int32_t isaac_render_shell_812d00_plan(int32_t field4_nz,
                                                 int32_t nested10_nz,
                                                 int32_t room_type_48) {
  if (isaac_render_shell_812d00_type_chain_open(field4_nz, nested10_nz) == 0) {
    return ISAAC_RENDER_SHELL_812D00_PLAN_AABB;
  }
  if (isaac_render_shell_812d00_lroom_type_open(room_type_48) == 0) {
    return ISAAC_RENDER_SHELL_812D00_PLAN_AABB;
  }
  return ISAAC_RENDER_SHELL_812D00_PLAN_LROOM;
}

extern "C" int32_t isaac_render_shell_812d00_lroom_dividend(
    int32_t room_type_48) {
  /* Jump table DAT_00812dc8 cases by (type-9). */
  switch (room_type_48) {
    case 9:
      return ISAAC_RENDER_SHELL_812D00_DIV_TYPE9;
    case 10:
      return ISAAC_RENDER_SHELL_812D00_DIV_TYPE10;
    case 11:
      return ISAAC_RENDER_SHELL_812D00_DIV_TYPE11;
    case 12:
      return ISAAC_RENDER_SHELL_812D00_DIV_TYPE12;
    default:
      return 0;
  }
}

extern "C" void isaac_render_shell_812d00_lroom_xy(int32_t dividend,
                                                  int32_t room_width_c,
                                                  float* out_x,
                                                  float* out_y) {
  /* VA 0x00812d33: cdq; idiv [ecx+0xc]; then *40 + base. */
  int32_t quot = 0;
  int32_t rem = 0;
  idiv_i32(dividend, room_width_c, &quot, &rem);
  const float scale = f32_from_bits(ISAAC_RENDER_SHELL_F32_FORTY_BITS);
  const float y_base =
      f32_from_bits(ISAAC_RENDER_SHELL_F32_HUNDRED_TWENTY_BITS);
  /* cvtdq2ps of rem/quot (signed int32 â†’ float32). */
  if (out_x != nullptr) {
    *out_x = static_cast<float>(rem) * scale + scale;
  }
  if (out_y != nullptr) {
    *out_y = static_cast<float>(quot) * scale + y_base;
  }
}

extern "C" void isaac_render_shell_812d00_aabb_center(float room_14,
                                                     float room_18,
                                                     float room_1c,
                                                     float room_20,
                                                     float* out_x,
                                                     float* out_y) {
  /* VA 0x00812d88â€¦0x00812dbd: (hi-lo)*0.5 + lo */
  const float half = f32_from_bits(ISAAC_RENDER_SHELL_F32_HALF_BITS);
  if (out_x != nullptr) {
    *out_x = (room_1c - room_14) * half + room_14;
  }
  if (out_y != nullptr) {
    *out_y = (room_20 - room_18) * half + room_18;
  }
}

extern "C" void isaac_render_shell_812d00_compute(int32_t field4_nz,
                                                 int32_t nested10_nz,
                                                 int32_t room_type_48,
                                                 int32_t room_width_c,
                                                 float room_14,
                                                 float room_18,
                                                 float room_1c,
                                                 float room_20,
                                                 float* out_x,
                                                 float* out_y) {
  const int32_t plan =
      isaac_render_shell_812d00_plan(field4_nz, nested10_nz, room_type_48);
  if (plan == ISAAC_RENDER_SHELL_812D00_PLAN_LROOM) {
    const int32_t div =
        isaac_render_shell_812d00_lroom_dividend(room_type_48);
    isaac_render_shell_812d00_lroom_xy(div, room_width_c, out_x, out_y);
    return;
  }
  isaac_render_shell_812d00_aabb_center(room_14, room_18, room_1c, room_20,
                                        out_x, out_y);
}

extern "C" uint32_t isaac_render_shell_812d00_host_va(void) {
  return ISAAC_RENDER_SHELL_HOST_812D00_VA;
}

/* ---- opaque_call_004217a0 complete pure body â€” ABI v16 (VA 0x004217a0) ---- */

/* v109 dedupe: the 0x004217a0 clamp law is OWNED by the frame-opaque
   family (isaac_frame_opaque_4217a0_clamp_id, ABI v39). The former
   isaac_render_shell_4217a0_clamp_id EXPORT was removed; its body is now a
   file-local helper used ONLY by isaac_render_shell_4217a0_test (the
   consumer 64-bit limb probe for the 74ea50 path). NO duplicate law
   export. See section-notes/update-v109-dupva-dedupe/. */
static int32_t render_shell_4217a0_clamp_id_impl(int32_t challenge_id) {
  /* VA 0x004217b5…0x004217bc: cmovle 0; cmovl min with 0x34 */
  int32_t eax = challenge_id;
  if (eax <= 0) {
    eax = 0;
  }
  int32_t esi = ISAAC_RENDER_SHELL_4217A0_CLAMP_MAX;
  if (eax < esi) {
    esi = eax;
  }
  return esi;
}

extern "C" int32_t isaac_render_shell_4217a0_test(uint64_t bitset_word0,
                                                 int32_t challenge_id) {
  /* Full PE limb select: low dword bits 0..31, high dword bits 32..63 of
     the 64-bit word at base + (id>>6)*8. Clamp ≤ 0x34 ⇒ word index 0. */
  const int32_t id = render_shell_4217a0_clamp_id_impl(challenge_id);
  const uint32_t bit = static_cast<uint32_t>(id) & 0x3fu;
  const uint32_t word_index = static_cast<uint32_t>(id) >> 6;
  (void)word_index; /* always 0 under clamp; retained for PE fidelity */
  const uint64_t mask = uint64_t{1} << bit;
  return (bitset_word0 & mask) != 0 ? 1 : 0;
}

extern "C" uint32_t isaac_render_shell_4217a0_host_va(void) {
  return ISAAC_RENDER_SHELL_HOST_4217A0_VA;
}

extern "C" int32_t isaac_render_shell_4217a0_probe_arg(void) {
  return ISAAC_RENDER_SHELL_4217A0_PROBE_ARG;
}

/* ---- FUN_006f9400 / FUN_006f95a0 pure islands â€” ABI v17 ---- */

extern "C" int32_t isaac_render_shell_map_node_present(uint32_t isnil_0d_w,
                                                      int32_t key_10,
                                                      int32_t action_id) {
  const uint8_t isnil_0d = static_cast<uint8_t>(isnil_0d_w & 0xffu);
  /* After host 0x4288a0: cmp [eax+0xd],0 / jne; cmp [eax+0x10],id / jg */
  if (isnil_0d != 0) {
    return 0;
  }
  if (key_10 > action_id) {
    return 0;
  }
  return 1;
}

extern "C" int32_t isaac_render_shell_6f9400_gate39(int32_t mode_26584,
                                                   int32_t stage,
                                                   int32_t difficulty_269c8) {
  /* VA 0x006f947dâ€¦0x006f94b6 */
  if (mode_26584 == ISAAC_RENDER_SHELL_POLL_GATE39_MODE_EXCLUDE) {
    return 0;
  }
  if (pe_signed_mod2_eq1(stage) == 0) {
    return 0;
  }
  if (stage >= ISAAC_RENDER_SHELL_POLL_GATE39_STAGE_MAX) {
    return 0;
  }
  if (difficulty_269c8 == ISAAC_RENDER_SHELL_82D030_DIFF_GREED_A ||
      difficulty_269c8 == ISAAC_RENDER_SHELL_82D030_DIFF_GREED_B) {
    return 0;
  }
  return 1;
}

extern "C" uint32_t isaac_render_shell_6f9400_mask(
    uint32_t present_38_w, uint32_t present_39_w, uint32_t present_3a_w,
    uint32_t present_3b_w, uint32_t present_3c_w, uint32_t present_3d_w,
    uint32_t present_3e_w, int32_t gate39) {
  const uint8_t present_38 = static_cast<uint8_t>(present_38_w & 0xffu);
  const uint8_t present_39 = static_cast<uint8_t>(present_39_w & 0xffu);
  const uint8_t present_3a = static_cast<uint8_t>(present_3a_w & 0xffu);
  const uint8_t present_3b = static_cast<uint8_t>(present_3b_w & 0xffu);
  const uint8_t present_3c = static_cast<uint8_t>(present_3c_w & 0xffu);
  const uint8_t present_3d = static_cast<uint8_t>(present_3d_w & 0xffu);
  const uint8_t present_3e = static_cast<uint8_t>(present_3e_w & 0xffu);
  /* VA 0x006f9400 â€¦ ret â€” presence flags post lower_bound */
  uint32_t ebx = 0;
  if (nonzero_u8(present_38) != 0) {
    ebx |= ISAAC_RENDER_SHELL_POLL_BIT0;
  }
  if (nonzero_u8(present_39) != 0 && gate39 != 0) {
    ebx |= ISAAC_RENDER_SHELL_POLL_BIT1;
  }
  if (nonzero_u8(present_3a) != 0) {
    ebx |= ISAAC_RENDER_SHELL_POLL_BIT2;
  }
  if (nonzero_u8(present_3b) != 0) {
    ebx |= ISAAC_RENDER_SHELL_POLL_BIT3;
  }
  if (nonzero_u8(present_3c) != 0) {
    ebx |= ISAAC_RENDER_SHELL_POLL_BIT5;
  }
  if (nonzero_u8(present_3d) != 0) {
    ebx |= ISAAC_RENDER_SHELL_POLL_BIT6;
  }
  if (nonzero_u8(present_3e) != 0) {
    ebx |= ISAAC_RENDER_SHELL_POLL_BIT4;
  }
  return ebx;
}

extern "C" uint32_t isaac_render_shell_6f9400_mask_full(
    uint32_t present_38_w, uint32_t present_39_w, uint32_t present_3a_w,
    uint32_t present_3b_w, uint32_t present_3c_w, uint32_t present_3d_w,
    uint32_t present_3e_w, int32_t mode_26584, int32_t stage,
    int32_t difficulty_269c8) {
  const uint8_t present_38 = static_cast<uint8_t>(present_38_w & 0xffu);
  const uint8_t present_39 = static_cast<uint8_t>(present_39_w & 0xffu);
  const uint8_t present_3a = static_cast<uint8_t>(present_3a_w & 0xffu);
  const uint8_t present_3b = static_cast<uint8_t>(present_3b_w & 0xffu);
  const uint8_t present_3c = static_cast<uint8_t>(present_3c_w & 0xffu);
  const uint8_t present_3d = static_cast<uint8_t>(present_3d_w & 0xffu);
  const uint8_t present_3e = static_cast<uint8_t>(present_3e_w & 0xffu);
  const int32_t gate =
      isaac_render_shell_6f9400_gate39(mode_26584, stage, difficulty_269c8);
  return isaac_render_shell_6f9400_mask(present_38, present_39, present_3a,
                                       present_3b, present_3c, present_3d,
                                       present_3e, gate);
}

extern "C" uint32_t isaac_render_shell_6f95a0_mask(
    uint32_t present_3f_w, uint32_t present_40_w, uint32_t present_41_w,
    uint32_t present_42_w, uint32_t present_43_w, uint32_t present_44_w,
    uint32_t present_46_w, uint32_t present_4f_w) {
  const uint8_t present_3f = static_cast<uint8_t>(present_3f_w & 0xffu);
  const uint8_t present_40 = static_cast<uint8_t>(present_40_w & 0xffu);
  const uint8_t present_41 = static_cast<uint8_t>(present_41_w & 0xffu);
  const uint8_t present_42 = static_cast<uint8_t>(present_42_w & 0xffu);
  const uint8_t present_43 = static_cast<uint8_t>(present_43_w & 0xffu);
  const uint8_t present_44 = static_cast<uint8_t>(present_44_w & 0xffu);
  const uint8_t present_46 = static_cast<uint8_t>(present_46_w & 0xffu);
  const uint8_t present_4f = static_cast<uint8_t>(present_4f_w & 0xffu);
  /* VA 0x006f95a0 â€¦ ret */
  uint32_t ebx = 0;
  if (nonzero_u8(present_3f) != 0) {
    ebx |= ISAAC_RENDER_SHELL_POLL_BIT0;
  }
  if (nonzero_u8(present_40) != 0) {
    ebx |= ISAAC_RENDER_SHELL_POLL_BIT1;
  }
  if (nonzero_u8(present_41) != 0) {
    ebx |= ISAAC_RENDER_SHELL_POLL_BIT2;
  }
  if (nonzero_u8(present_42) != 0) {
    ebx |= ISAAC_RENDER_SHELL_POLL_BIT3;
  }
  if (nonzero_u8(present_43) != 0) {
    ebx |= ISAAC_RENDER_SHELL_POLL_BIT5;
  }
  if (nonzero_u8(present_44) != 0) {
    ebx |= ISAAC_RENDER_SHELL_POLL_BIT6;
  }
  /* PE: mov ecx, 0x7f; cmovne ebx, ecx â€” replace whole mask when 0x46 present */
  if (nonzero_u8(present_46) != 0) {
    ebx = ISAAC_RENDER_SHELL_POLL_B_ID_46_FORCE;
  }
  if (nonzero_u8(present_4f) != 0) {
    ebx |= ISAAC_RENDER_SHELL_POLL_BIT6;
  }
  return ebx;
}

extern "C" uint32_t isaac_render_shell_poll_combine(uint32_t poll_6f9400,
                                                   uint32_t poll_6f95a0,
                                                   uint32_t mgr_or) {
  return static_cast<uint32_t>(~poll_6f95a0) & (poll_6f9400 | mgr_or);
}

extern "C" int32_t isaac_render_shell_74ea50_eval_al(
    int32_t difficulty_269c8, uint32_t this0, uint32_t this4,
    uint32_t flags_2654c, uint32_t mgr_or, uint32_t poll_6f9400,
    uint32_t poll_6f95a0, uint64_t bitset_word0) {
  /* Complete pure body of 0x0074ea50 with sparse polls + bitset. */
  if (isaac_render_shell_74ea50_early_false(difficulty_269c8, this0,
                                            flags_2654c) != 0) {
    return 0;
  }
  if (isaac_render_shell_74ea50_post_poll_plan(this0, this4, mgr_or,
                                              poll_6f9400, poll_6f95a0) !=
      ISAAC_RENDER_SHELL_74EA50_PLAN_PROBE) {
    return 0;
  }
  return isaac_render_shell_4217a0_test(
      bitset_word0, ISAAC_RENDER_SHELL_74EA50_PROBE_ARG);
}

extern "C" int32_t isaac_render_shell_74ea50_eval_al_from_presence(
    int32_t difficulty_269c8, uint32_t this0, uint32_t this4,
    uint32_t flags_2654c, uint32_t mgr_or, uint32_t present_38_w,
    uint32_t present_39_w, uint32_t present_3a_w, uint32_t present_3b_w,
    uint32_t present_3c_w, uint32_t present_3d_w, uint32_t present_3e_w,
    int32_t mode_26584, int32_t stage, uint32_t present_3f_w, uint32_t present_40_w,
    uint32_t present_41_w, uint32_t present_42_w, uint32_t present_43_w,
    uint32_t present_44_w, uint32_t present_46_w, uint32_t present_4f_w,
    uint64_t bitset_word0) {
  const uint8_t present_38 = static_cast<uint8_t>(present_38_w & 0xffu);
  const uint8_t present_39 = static_cast<uint8_t>(present_39_w & 0xffu);
  const uint8_t present_3a = static_cast<uint8_t>(present_3a_w & 0xffu);
  const uint8_t present_3b = static_cast<uint8_t>(present_3b_w & 0xffu);
  const uint8_t present_3c = static_cast<uint8_t>(present_3c_w & 0xffu);
  const uint8_t present_3d = static_cast<uint8_t>(present_3d_w & 0xffu);
  const uint8_t present_3e = static_cast<uint8_t>(present_3e_w & 0xffu);
  const uint8_t present_3f = static_cast<uint8_t>(present_3f_w & 0xffu);
  const uint8_t present_40 = static_cast<uint8_t>(present_40_w & 0xffu);
  const uint8_t present_41 = static_cast<uint8_t>(present_41_w & 0xffu);
  const uint8_t present_42 = static_cast<uint8_t>(present_42_w & 0xffu);
  const uint8_t present_43 = static_cast<uint8_t>(present_43_w & 0xffu);
  const uint8_t present_44 = static_cast<uint8_t>(present_44_w & 0xffu);
  const uint8_t present_46 = static_cast<uint8_t>(present_46_w & 0xffu);
  const uint8_t present_4f = static_cast<uint8_t>(present_4f_w & 0xffu);
  const uint32_t poll_a = isaac_render_shell_6f9400_mask_full(
      present_38, present_39, present_3a, present_3b, present_3c, present_3d,
      present_3e, mode_26584, stage, difficulty_269c8);
  const uint32_t poll_b = isaac_render_shell_6f95a0_mask(
      present_3f, present_40, present_41, present_42, present_43, present_44,
      present_46, present_4f);
  return isaac_render_shell_74ea50_eval_al(difficulty_269c8, this0, this4,
                                           flags_2654c, mgr_or, poll_a, poll_b,
                                           bitset_word0);
}

extern "C" uint32_t isaac_render_shell_6f9400_host_va(void) {
  return ISAAC_RENDER_SHELL_HOST_6F9400_VA;
}

extern "C" uint32_t isaac_render_shell_6f95a0_host_va(void) {
  return ISAAC_RENDER_SHELL_HOST_6F95A0_VA;
}

extern "C" uint32_t isaac_render_shell_4288a0_host_va(void) {
  return ISAAC_RENDER_SHELL_HOST_4288A0_VA;
}

extern "C" uint32_t isaac_render_shell_74ea50_host_va(void) {
  return ISAAC_RENDER_SHELL_HOST_74EA50_VA;
}

/* ---- AnimationState::Render pure CF â€” ABI v18 (VA 0x0040a030) ---- */

extern "C" int32_t isaac_render_shell_40a030_anim_open(uint32_t anim_ptr) {
  /* VA 0x0040a03câ€¦0x0040a041: test edx,edx; je skip */
  return anim_ptr != 0u ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_40a030_layer_loop_needed(
    uint32_t layer_count) {
  /* VA 0x0040a045â€¦0x0040a048: cmp [edx+0x1c], esi(=0); jbe skip */
  return layer_count != 0u ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_40a030_plan(uint32_t anim_ptr,
                                                 uint32_t layer_count) {
  if (isaac_render_shell_40a030_anim_open(anim_ptr) == 0) {
    return ISAAC_RENDER_SHELL_40A030_PLAN_SKIP;
  }
  if (isaac_render_shell_40a030_layer_loop_needed(layer_count) == 0) {
    return ISAAC_RENDER_SHELL_40A030_PLAN_SKIP;
  }
  return ISAAC_RENDER_SHELL_40A030_PLAN_HOST_LAYERS;
}

extern "C" uint32_t isaac_render_shell_40a030_layer_stride(void) {
  return ISAAC_RENDER_SHELL_40A030_LAYER_STRIDE;
}

extern "C" uint32_t isaac_render_shell_40a030_layer_this(uint32_t layers_base,
                                                        uint32_t index) {
  /* VA 0x0040a058â€¦0x0040a05e: ecx = [anim+0x18] + ebx; ebx = i*0x10 */
  return layers_base + index * ISAAC_RENDER_SHELL_40A030_LAYER_STRIDE;
}

extern "C" uint32_t isaac_render_shell_40a030_layer_frame_slot(
    uint32_t layer_frames_ptr, uint32_t index) {
  /* VA 0x0040a060: push dword [eax + esi*4] */
  return layer_frames_ptr + index * 4u;
}

extern "C" int32_t isaac_render_shell_40a030_loop_continue(
    uint32_t index, uint32_t layer_count) {
  /* VA 0x0040a072â€¦0x0040a075: cmp esi, [edx+0x1c]; jb loop */
  return index < layer_count ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_40a030_loop_step(uint32_t index_before,
                                                      uint32_t layer_count,
                                                      uint32_t* index_after) {
  /* VA 0x0040a06eâ€¦0x0040a075: inc esi; re-read count; jb */
  const uint32_t next = index_before + 1u;
  if (index_after != nullptr) {
    *index_after = next;
  }
  return isaac_render_shell_40a030_loop_continue(next, layer_count);
}

extern "C" void isaac_render_shell_40a030_host_args(
    uint32_t anm2_ptr, uint32_t layers_base, uint32_t index,
    int32_t frame_index, uint32_t position_ptr, uint32_t top_left_ptr,
    uint32_t bottom_right_ptr, uint32_t* out_layer_this,
    int32_t* out_frame_index, uint32_t* out_position, uint32_t* out_top_left,
    uint32_t* out_bottom_right, uint32_t* out_anm2) {
  /* Pack residual host call args for one layer iteration (PE push order
     ends with anm2 last; thiscall ecx = layer*). */
  if (out_layer_this != nullptr) {
    *out_layer_this =
        isaac_render_shell_40a030_layer_this(layers_base, index);
  }
  if (out_frame_index != nullptr) {
    *out_frame_index = frame_index;
  }
  if (out_position != nullptr) {
    *out_position = position_ptr;
  }
  if (out_top_left != nullptr) {
    *out_top_left = top_left_ptr;
  }
  if (out_bottom_right != nullptr) {
    *out_bottom_right = bottom_right_ptr;
  }
  if (out_anm2 != nullptr) {
    *out_anm2 = anm2_ptr;
  }
}

extern "C" int32_t isaac_render_shell_40a030_pure_complete(
    uint32_t anim_ptr, uint32_t layer_count) {
  return isaac_render_shell_40a030_plan(anim_ptr, layer_count) ==
                 ISAAC_RENDER_SHELL_40A030_PLAN_SKIP
             ? 1
             : 0;
}

extern "C" uint32_t isaac_render_shell_40a030_host_va(void) {
  return ISAAC_RENDER_SHELL_HOST_ANIM_RENDER_VA;
}

extern "C" uint32_t isaac_render_shell_409120_host_va(void) {
  return ISAAC_RENDER_SHELL_HOST_409120_VA;
}

/* ---- opaque_call_00409120 pure CF islands â€” ABI v19 (VA 0x00409120) ---- */

extern "C" int32_t isaac_render_shell_409120_layer_visible(uint32_t visible_0c_w) {
  const uint8_t visible_0c = static_cast<uint8_t>(visible_0c_w & 0xffu);
  /* VA 0x00409161â€¦0x0040917a: cmp byte [ecx+0xc], 0; je early */
  return visible_0c != 0u ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_409120_frame_in_range(int32_t frame_index,
                                                           int32_t num_frames) {
  /* VA 0x00409180â€¦0x0040918b: test eax,eax; js / cmp eax,[ecx+8]; jge */
  if (frame_index < 0) {
    return 0;
  }
  if (frame_index >= num_frames) {
    return 0;
  }
  return 1;
}

extern "C" uint32_t isaac_render_shell_409120_frame_stride(void) {
  return ISAAC_RENDER_SHELL_409120_FRAME_STRIDE;
}

extern "C" uint32_t isaac_render_shell_409120_frame_ptr(uint32_t frames_base,
                                                       int32_t frame_index) {
  /* VA 0x00409191â€¦0x00409194: imul eax,eax,0x6c; add eax,[ecx+4] */
  return frames_base +
         static_cast<uint32_t>(frame_index) *
             ISAAC_RENDER_SHELL_409120_FRAME_STRIDE;
}

extern "C" int32_t isaac_render_shell_409120_frame_visible(uint32_t visible_2c_w) {
  const uint8_t visible_2c = static_cast<uint8_t>(visible_2c_w & 0xffu);
  /* VA 0x0040919dâ€¦0x004091a1: cmp byte [frame+0x2c], 0; je early */
  return visible_2c != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_render_shell_409120_layer_state_stride(void) {
  return ISAAC_RENDER_SHELL_409120_LAYER_STATE_STRIDE;
}

extern "C" uint32_t isaac_render_shell_409120_layer_state_ptr(
    uint32_t layer_states_base, int32_t layer_id) {
  /* VA 0x004091a7â€¦0x004091af: lea edi,[eax+eax*4]; shl edi,5; add [edx+0x7c]
     â†’ layer_id * 0xa0 + anm2_layer_states_base */
  return layer_states_base +
         static_cast<uint32_t>(layer_id) *
             ISAAC_RENDER_SHELL_409120_LAYER_STATE_STRIDE;
}

extern "C" int32_t isaac_render_shell_409120_layer_state_visible(
    uint32_t visible_74_w) {
  const uint8_t visible_74 = static_cast<uint8_t>(visible_74_w & 0xffu);
  /* VA 0x004091b8â€¦0x004091bc: cmp byte [edi+0x74], 0; je early */
  return visible_74 != 0u ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_409120_entry_open(
    uint32_t layer_vis_0c_w, int32_t frame_index, int32_t num_frames,
    uint32_t frame_vis_2c_w, uint32_t layer_state_vis_74_w) {
  const uint8_t layer_vis_0c = static_cast<uint8_t>(layer_vis_0c_w & 0xffu);
  const uint8_t frame_vis_2c = static_cast<uint8_t>(frame_vis_2c_w & 0xffu);
  const uint8_t layer_state_vis_74 = static_cast<uint8_t>(layer_state_vis_74_w & 0xffu);
  if (isaac_render_shell_409120_layer_visible(layer_vis_0c) == 0) {
    return 0;
  }
  if (isaac_render_shell_409120_frame_in_range(frame_index, num_frames) == 0) {
    return 0;
  }
  if (isaac_render_shell_409120_frame_visible(frame_vis_2c) == 0) {
    return 0;
  }
  if (isaac_render_shell_409120_layer_state_visible(layer_state_vis_74) == 0) {
    return 0;
  }
  return 1;
}

extern "C" int32_t isaac_render_shell_409120_plan(
    uint32_t layer_vis_0c_w, int32_t frame_index, int32_t num_frames,
    uint32_t frame_vis_2c_w, uint32_t layer_state_vis_74_w) {
  const uint8_t layer_vis_0c = static_cast<uint8_t>(layer_vis_0c_w & 0xffu);
  const uint8_t frame_vis_2c = static_cast<uint8_t>(frame_vis_2c_w & 0xffu);
  const uint8_t layer_state_vis_74 = static_cast<uint8_t>(layer_state_vis_74_w & 0xffu);
  if (isaac_render_shell_409120_entry_open(layer_vis_0c, frame_index, num_frames,
                                           frame_vis_2c,
                                           layer_state_vis_74) == 0) {
    return ISAAC_RENDER_SHELL_409120_PLAN_SKIP;
  }
  return ISAAC_RENDER_SHELL_409120_PLAN_HOST_BODY;
}

extern "C" int32_t isaac_render_shell_409120_pure_complete(
    uint32_t layer_vis_0c_w, int32_t frame_index, int32_t num_frames,
    uint32_t frame_vis_2c_w, uint32_t layer_state_vis_74_w) {
  const uint8_t layer_vis_0c = static_cast<uint8_t>(layer_vis_0c_w & 0xffu);
  const uint8_t frame_vis_2c = static_cast<uint8_t>(frame_vis_2c_w & 0xffu);
  const uint8_t layer_state_vis_74 = static_cast<uint8_t>(layer_state_vis_74_w & 0xffu);
  return isaac_render_shell_409120_plan(layer_vis_0c, frame_index, num_frames,
                                        frame_vis_2c, layer_state_vis_74) ==
                 ISAAC_RENDER_SHELL_409120_PLAN_SKIP
             ? 1
             : 0;
}

extern "C" uint32_t isaac_render_shell_409120_flags_or(
    uint32_t anm2_flags_110, uint32_t layer_flags_8c) {
  /* VA 0x004091ebâ€¦0x004091f7: or ecx, [edi+0x8c] */
  return anm2_flags_110 | layer_flags_8c;
}

extern "C" int32_t isaac_render_shell_409120_sprite_open(int32_t sprite_nz) {
  /* VA 0x004091ddâ€¦0x004091df: test esi,esi; je early */
  return sprite_nz != 0 ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_409120_flag4_early_out(
    uint32_t flags, uint32_t dat_c7977e_w) {
  const uint8_t dat_c7977e = static_cast<uint8_t>(dat_c7977e_w & 0xffu);
  /* VA 0x004091fdâ€¦0x00409209: test cl,4; je cont; cmp DAT_c7977e,0; je early */
  if ((flags & ISAAC_RENDER_SHELL_409120_FLAG_BIT4) == 0u) {
    return 0;
  }
  return dat_c7977e == 0u ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_409120_post_sprite_continue(
    int32_t sprite_nz, uint32_t flags, uint32_t dat_c7977e_w) {
  const uint8_t dat_c7977e = static_cast<uint8_t>(dat_c7977e_w & 0xffu);
  if (isaac_render_shell_409120_sprite_open(sprite_nz) == 0) {
    return 0;
  }
  if (isaac_render_shell_409120_flag4_early_out(flags, dat_c7977e) != 0) {
    return 0;
  }
  return 1;
}

extern "C" int32_t isaac_render_shell_409120_color_plan(
    uint32_t flags, int32_t dat_c78dc0_nz) {
  /* VA 0x0040926câ€¦0x0040929c: test cl,1 / cmp DAT_c78dc0,0 */
  if ((flags & ISAAC_RENDER_SHELL_409120_FLAG_BIT1) != 0u) {
    return ISAAC_RENDER_SHELL_409120_COLOR_LAYER;
  }
  if (dat_c78dc0_nz == 0) {
    return ISAAC_RENDER_SHELL_409120_COLOR_ANM2;
  }
  return ISAAC_RENDER_SHELL_409120_COLOR_HOST;
}

extern "C" uint32_t isaac_render_shell_408590_host_va(void) {
  return ISAAC_RENDER_SHELL_HOST_408590_VA;
}

extern "C" uint32_t isaac_render_shell_40c440_host_va(void) {
  return ISAAC_RENDER_SHELL_HOST_40C440_VA;
}

extern "C" uint32_t isaac_render_shell_4071c0_host_va(void) {
  return ISAAC_RENDER_SHELL_HOST_4071C0_VA;
}

extern "C" uint32_t isaac_render_shell_4072e0_host_va(void) {
  return ISAAC_RENDER_SHELL_HOST_4072E0_VA;
}

extern "C" uint32_t isaac_render_shell_4098a0_host_va(void) {
  return ISAAC_RENDER_SHELL_HOST_4098A0_VA;
}

extern "C" uint32_t isaac_render_shell_409cb0_host_va(void) {
  return ISAAC_RENDER_SHELL_HOST_409CB0_VA;
}

extern "C" uint32_t isaac_render_shell_40c6f0_host_va(void) {
  return ISAAC_RENDER_SHELL_HOST_40C6F0_VA;
}

/* ---- opaque_call_00408590 pure CF islands â€” ABI v20 (VA 0x00408590) ---- */

extern "C" int32_t isaac_render_shell_408590_sprite_present(uint32_t sprite_obj) {
  /* VA 0x0040859aâ€¦0x004085a2: mov esi,[edi+0x98]; test esi,esi; je skip */
  return sprite_obj != 0u ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_408590_pair_a_equal(uint32_t sprite_a0,
                                                         uint32_t sprite_a1,
                                                         uint32_t layer_a0,
                                                         uint32_t layer_a1) {
  /* VA 0x004085a4â€¦0x004085b5: cmp [esi+0x30],ebx / cmp [esi+0x34],[edi+0x24] */
  if (sprite_a0 != layer_a0) {
    return 0;
  }
  if (sprite_a1 != layer_a1) {
    return 0;
  }
  return 1;
}

extern "C" int32_t isaac_render_shell_408590_pair_a_update_needed(
    uint32_t sprite_obj, uint32_t sprite_a0, uint32_t sprite_a1,
    uint32_t layer_a0, uint32_t layer_a1) {
  if (isaac_render_shell_408590_sprite_present(sprite_obj) == 0) {
    return 0;
  }
  return isaac_render_shell_408590_pair_a_equal(sprite_a0, sprite_a1, layer_a0,
                                                layer_a1) == 0
             ? 1
             : 0;
}

extern "C" int32_t isaac_render_shell_408590_pair_b_equal(uint32_t sprite_b0,
                                                         uint32_t sprite_b1,
                                                         uint32_t layer_b0,
                                                         uint32_t layer_b1) {
  /* VA 0x004085e4â€¦0x004085f4 */
  if (sprite_b0 != layer_b0) {
    return 0;
  }
  if (sprite_b1 != layer_b1) {
    return 0;
  }
  return 1;
}

extern "C" int32_t isaac_render_shell_408590_pair_b_update_needed(
    uint32_t sprite_obj, uint32_t sprite_b0, uint32_t sprite_b1,
    uint32_t layer_b0, uint32_t layer_b1) {
  if (isaac_render_shell_408590_sprite_present(sprite_obj) == 0) {
    return 0;
  }
  return isaac_render_shell_408590_pair_b_equal(sprite_b0, sprite_b1, layer_b0,
                                                layer_b1) == 0
             ? 1
             : 0;
}

extern "C" int32_t isaac_render_shell_408590_plan(
    uint32_t sprite_obj, uint32_t sprite_ctrl, uint32_t sprite_a0,
    uint32_t sprite_a1, uint32_t layer_a0, uint32_t layer_a1,
    uint32_t sprite_b0, uint32_t sprite_b1, uint32_t layer_b0,
    uint32_t layer_b1) {
  if (sprite_obj == 0u && sprite_ctrl == 0u) {
    return ISAAC_RENDER_SHELL_408590_PLAN_PURE_NULL;
  }
  const int32_t need_a = isaac_render_shell_408590_pair_a_update_needed(
      sprite_obj, sprite_a0, sprite_a1, layer_a0, layer_a1);
  const int32_t need_b = isaac_render_shell_408590_pair_b_update_needed(
      sprite_obj, sprite_b0, sprite_b1, layer_b0, layer_b1);
  if (need_a != 0 && need_b != 0) {
    return ISAAC_RENDER_SHELL_408590_PLAN_VT_BOTH;
  }
  if (need_a != 0) {
    return ISAAC_RENDER_SHELL_408590_PLAN_VT44;
  }
  if (need_b != 0) {
    return ISAAC_RENDER_SHELL_408590_PLAN_VT48;
  }
  return ISAAC_RENDER_SHELL_408590_PLAN_COPY;
}

extern "C" int32_t isaac_render_shell_408590_pure_complete(
    uint32_t sprite_obj, uint32_t sprite_ctrl, uint32_t sprite_a0,
    uint32_t sprite_a1, uint32_t layer_a0, uint32_t layer_a1,
    uint32_t sprite_b0, uint32_t sprite_b1, uint32_t layer_b0,
    uint32_t layer_b1) {
  return isaac_render_shell_408590_plan(sprite_obj, sprite_ctrl, sprite_a0,
                                        sprite_a1, layer_a0, layer_a1,
                                        sprite_b0, sprite_b1, layer_b0,
                                        layer_b1) ==
                 ISAAC_RENDER_SHELL_408590_PLAN_PURE_NULL
             ? 1
             : 0;
}

extern "C" void isaac_render_shell_408590_apply_pair_a_cache(
    uint32_t sprite_obj, uint32_t layer_a0, uint32_t layer_a1) {
  /* VA 0x004085d8â€¦0x004085db: mov [eax+0x30],ebx; mov [eax+0x34],esi */
  if (sprite_obj == 0u) {
    return;
  }
  map_store_u32(sprite_obj + ISAAC_RENDER_SHELL_408590_SPRITE_A0_OFF, layer_a0);
  map_store_u32(sprite_obj + ISAAC_RENDER_SHELL_408590_SPRITE_A1_OFF, layer_a1);
}

extern "C" void isaac_render_shell_408590_apply_pair_b_cache(
    uint32_t sprite_obj, uint32_t layer_b0, uint32_t layer_b1) {
  /* VA 0x00408611â€¦0x00408614: mov [esi+0x38],ebx; mov [esi+0x3c],eax */
  if (sprite_obj == 0u) {
    return;
  }
  map_store_u32(sprite_obj + ISAAC_RENDER_SHELL_408590_SPRITE_B0_OFF, layer_b0);
  map_store_u32(sprite_obj + ISAAC_RENDER_SHELL_408590_SPRITE_B1_OFF, layer_b1);
}

extern "C" uint32_t isaac_render_shell_408590_layer_sprite_off(void) {
  return ISAAC_RENDER_SHELL_408590_LAYER_SPRITE_OFF;
}

extern "C" uint32_t isaac_render_shell_408590_layer_ctrl_off(void) {
  return ISAAC_RENDER_SHELL_408590_LAYER_CTRL_OFF;
}

extern "C" uint32_t isaac_render_shell_408590_vt_pair_a_off(void) {
  return ISAAC_RENDER_SHELL_408590_VT_PAIR_A_OFF;
}

extern "C" uint32_t isaac_render_shell_408590_vt_pair_b_off(void) {
  return ISAAC_RENDER_SHELL_408590_VT_PAIR_B_OFF;
}

extern "C" int32_t isaac_render_shell_40c550_src_control_null(
    uint32_t src_ctrl) {
  /* VA 0x0040c56dâ€¦0x0040c56f: test edi,edi; je skip-addref */
  return src_ctrl == 0u ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_40c550_need_addref(uint32_t src_ctrl) {
  return isaac_render_shell_40c550_src_control_null(src_ctrl) == 0 ? 1 : 0;
}

extern "C" void isaac_render_shell_40c550_zero_dest(uint32_t dest_ptr) {
  /* VA 0x0040c55bâ€¦0x0040c568: mov dword [esi],0; mov dword [esi+4],0 */
  if (dest_ptr == 0u) {
    return;
  }
  map_store_u32(dest_ptr + ISAAC_RENDER_SHELL_40C550_OBJ_OFF, 0u);
  map_store_u32(dest_ptr + ISAAC_RENDER_SHELL_40C550_CTRL_OFF, 0u);
}

extern "C" void isaac_render_shell_40c550_assign(uint32_t dest_ptr,
                                                 uint32_t src_obj,
                                                 uint32_t src_ctrl) {
  /* VA 0x0040c59fâ€¦0x0040c5a2: mov [esi+4],edi; mov [esi],ebx */
  if (dest_ptr == 0u) {
    return;
  }
  map_store_u32(dest_ptr + ISAAC_RENDER_SHELL_40C550_OBJ_OFF, src_obj);
  map_store_u32(dest_ptr + ISAAC_RENDER_SHELL_40C550_CTRL_OFF, src_ctrl);
}

extern "C" uint32_t isaac_render_shell_40c550_host_va(void) {
  return ISAAC_RENDER_SHELL_HOST_40C550_VA;
}

/* ---- Color residual pure bodies â€” ABI v21 (4071c0 / 6831c0 / 4072e0) ---- */

extern "C" uint32_t isaac_render_shell_color_size(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_COLOR_SIZE);
}

extern "C" uint32_t isaac_render_shell_color_floats(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_COLOR_FLOATS);
}

extern "C" void isaac_render_shell_4071c0_copy(float* dest, const float* src) {
  /* Exact PE 0x004071c0â€¦0x004071e7: movupsÃ—2 + movq + mov dword (0x2c). */
  if (dest == nullptr || src == nullptr) {
    return;
  }
  for (int i = 0; i < ISAAC_RENDER_SHELL_COLOR_FLOATS; ++i) {
    dest[i] = src[i];
  }
}

extern "C" float isaac_render_shell_6831c0_offset_sum(float off_r, float off_g,
                                                     float off_b) {
  /* VA 0x00683202â€¦0x00683214: addss chain (float32). */
  return (off_r + off_g) + off_b;
}

extern "C" int32_t isaac_render_shell_6831c0_offset_plan(float this_sum,
                                                        float other_sum) {
  /* VA 0x00683214â€¦0x0068325b: ucomiss/lahf/test ah,0x44.
     jnp â†’ ordered-equal 0; jp â†’ not-equal or unordered (NaN).
     C `== 0.0f` matches ordered-equal (NaN â†’ false). */
  if (other_sum == 0.0f) {
    return ISAAC_RENDER_SHELL_6831C0_OFF_SKIP;
  }
  if (this_sum == 0.0f) {
    return ISAAC_RENDER_SHELL_6831C0_OFF_COPY;
  }
  return ISAAC_RENDER_SHELL_6831C0_OFF_AVERAGE;
}

extern "C" void isaac_render_shell_6831c0_mul_blend(float* inout,
                                                   const float* other) {
  /* Exact PE 0x006831c0â€¦0x006832d1 complete body; zero nested calls. */
  if (inout == nullptr || other == nullptr) {
    return;
  }
  /* Tint mul [0..0xc] (4Ã— float32). */
  for (int i = 0; i < ISAAC_RENDER_SHELL_COLOR_TINT_COUNT; ++i) {
    inout[i] = inout[i] * other[i];
  }
  /* Offset section [0x10..0x1c] gated by sum of other RGB offs. */
  const float other_sum = isaac_render_shell_6831c0_offset_sum(
      other[4], other[5], other[6]);
  const float this_sum =
      isaac_render_shell_6831c0_offset_sum(inout[4], inout[5], inout[6]);
  const int32_t plan =
      isaac_render_shell_6831c0_offset_plan(this_sum, other_sum);
  if (plan == ISAAC_RENDER_SHELL_6831C0_OFF_COPY) {
    /* bit-identical dword copy of 0x10..0x1c (4 floats). */
    inout[4] = other[4];
    inout[5] = other[5];
    inout[6] = other[6];
    inout[7] = other[7];
  } else if (plan == ISAAC_RENDER_SHELL_6831C0_OFF_AVERAGE) {
    const float half = f32_from_bits(ISAAC_RENDER_SHELL_F32_HALF_BITS);
    inout[4] = (inout[4] + other[4]) * half;
    inout[5] = (inout[5] + other[5]) * half;
    inout[6] = (inout[6] + other[6]) * half;
    inout[7] = (inout[7] + other[7]) * half;
  }
  /* Always: add [0x20..0x28]. */
  inout[8] = inout[8] + other[8];
  inout[9] = inout[9] + other[9];
  inout[10] = inout[10] + other[10];
}

extern "C" void isaac_render_shell_4072e0_blend(float* dest, const float* lhs,
                                               const float* other) {
  /* Exact PE 0x004072e0â€¦0x00407312: 6831c0(&stack_lhs, other) then copy. */
  if (dest == nullptr) {
    return;
  }
  if (lhs == nullptr) {
    return;
  }
  /* Copy lhs into dest, then in-place mul-blend with other. */
  isaac_render_shell_4071c0_copy(dest, lhs);
  if (other != nullptr) {
    isaac_render_shell_6831c0_mul_blend(dest, other);
  }
}

extern "C" uint32_t isaac_render_shell_6831c0_host_va(void) {
  return ISAAC_RENDER_SHELL_HOST_6831C0_VA;
}

/* ---- AnimationLayer::GetSourceQuad pure â€” ABI v22 (VA 0x004098a0) ---- */

extern "C" uint32_t isaac_render_shell_4098a0_effective_flip_y(uint32_t anm2_flip_y_w,
                                                             uint32_t dat_c7977d_w) {
  const uint8_t anm2_flip_y = static_cast<uint8_t>(anm2_flip_y_w & 0xffu);
  const uint8_t dat_c7977d = static_cast<uint8_t>(dat_c7977d_w & 0xffu);
  /* VA 0x004098a9â€¦0x004098d1: if DAT_c7977d==0 keep flipY else sete !flipY */
  if (dat_c7977d == 0u) {
    return anm2_flip_y != 0u ? 1u : 0u;
  }
  return anm2_flip_y == 0u ? 1u : 0u;
}

extern "C" float isaac_render_shell_4098a0_scale_x(float frame_scale_x,
                                                  float layer_size_x) {
  return frame_scale_x * layer_size_x;
}

extern "C" float isaac_render_shell_4098a0_scale_y(float frame_scale_y,
                                                  float layer_size_y) {
  return frame_scale_y * layer_size_y;
}

extern "C" void isaac_render_shell_4098a0_crop_rect(
    float frame_crop_x, float frame_crop_y, float frame_w, float frame_h,
    float scale_x, float scale_y, float clamp_tl_x, float clamp_tl_y,
    float clamp_br_x, float clamp_br_y, float* out_l, float* out_t, float* out_r,
    float* out_b) {
  /* VA 0x004098f0â€¦0x00409975: left/top/right/bottom from crop + clamps/scale */
  const float left = frame_crop_x + (clamp_tl_x / scale_x);
  const float top = frame_crop_y + (clamp_tl_y / scale_y);
  const float right = (frame_crop_x + frame_w) - (clamp_br_x / scale_x);
  const float bottom = (frame_crop_y + frame_h) - (clamp_br_y / scale_y);
  if (out_l != nullptr) {
    *out_l = left;
  }
  if (out_t != nullptr) {
    *out_t = top;
  }
  if (out_r != nullptr) {
    *out_r = right;
  }
  if (out_b != nullptr) {
    *out_b = bottom;
  }
}

extern "C" int32_t isaac_render_shell_4098a0_f32_strict_neg(float x) {
  /* comiss 0, x; seta â†’ 0 > x (strict; false for Â±0 and NaN) */
  return (0.0f > x) ? 1 : 0;
}

extern "C" float isaac_render_shell_4098a0_f32_neg(float x) {
  /* xorps with DAT_00bacb70 (-0.0 sign bit) */
  const uint32_t bits =
      __builtin_bit_cast(uint32_t, x) ^
      static_cast<uint32_t>(ISAAC_RENDER_SHELL_F32_SIGN_BITS);
  return f32_from_bits(bits);
}

extern "C" int32_t isaac_render_shell_4098a0_flip_x_needed(float scale_x,
                                                          float anm2_scale_x,
                                                          uint32_t layer_flip_x_w,
                                                          uint32_t anm2_flip_x_w) {
  const uint8_t layer_flip_x = static_cast<uint8_t>(layer_flip_x_w & 0xffu);
  const uint8_t anm2_flip_x = static_cast<uint8_t>(anm2_flip_x_w & 0xffu);
  float sx = scale_x;
  float ax = anm2_scale_x;
  if (layer_flip_x != 0u) {
    sx = isaac_render_shell_4098a0_f32_neg(sx);
  }
  if (anm2_flip_x != 0u) {
    ax = isaac_render_shell_4098a0_f32_neg(ax);
  }
  const int32_t n_ax = isaac_render_shell_4098a0_f32_strict_neg(ax);
  const int32_t n_sx = isaac_render_shell_4098a0_f32_strict_neg(sx);
  return n_ax != n_sx ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_4098a0_flip_y_needed(
    float scale_y, float anm2_scale_y, uint32_t layer_flip_y_w,
    uint32_t eff_anm2_flip_y_w) {
  const uint8_t layer_flip_y = static_cast<uint8_t>(layer_flip_y_w & 0xffu);
  const uint8_t eff_anm2_flip_y = static_cast<uint8_t>(eff_anm2_flip_y_w & 0xffu);
  float sy = scale_y;
  float ay = anm2_scale_y;
  if (layer_flip_y != 0u) {
    sy = isaac_render_shell_4098a0_f32_neg(sy);
  }
  if (eff_anm2_flip_y != 0u) {
    ay = isaac_render_shell_4098a0_f32_neg(ay);
  }
  const int32_t n_sy = isaac_render_shell_4098a0_f32_strict_neg(sy);
  const int32_t n_ay = isaac_render_shell_4098a0_f32_strict_neg(ay);
  return n_sy != n_ay ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_4098a0_rng_flag_open(uint32_t flags_or) {
  return (flags_or & static_cast<uint32_t>(ISAAC_RENDER_SHELL_4098A0_FLAG_BIT2)) !=
                 0u
             ? 1
             : 0;
}

extern "C" int32_t isaac_render_shell_4098a0_plan(uint32_t flags_or,
                                                 uint32_t rng_seed) {
  if (isaac_render_shell_4098a0_rng_flag_open(flags_or) == 0) {
    return ISAAC_RENDER_SHELL_4098A0_PLAN_PURE;
  }
  if (rng_seed == 0u) {
    return ISAAC_RENDER_SHELL_4098A0_PLAN_HOST_ASSERT;
  }
  return ISAAC_RENDER_SHELL_4098A0_PLAN_RNG;
}

extern "C" int32_t isaac_render_shell_4098a0_pure_complete(uint32_t flags_or,
                                                          uint32_t rng_seed) {
  return isaac_render_shell_4098a0_plan(flags_or, rng_seed) !=
                 ISAAC_RENDER_SHELL_4098A0_PLAN_HOST_ASSERT
             ? 1
             : 0;
}

extern "C" uint32_t isaac_render_shell_4098a0_rng_step(uint32_t seed,
                                                      uint32_t shr1,
                                                      uint32_t shl,
                                                      uint32_t shr2) {
  /* x86 32-bit variable shifts mask count to 5 bits. */
  const uint32_t c1 = shr1 & 31u;
  const uint32_t c2 = shl & 31u;
  const uint32_t c3 = shr2 & 31u;
  uint32_t a = seed;
  a = (a >> c1) ^ seed;
  uint32_t b = a;
  b = (b << c2) ^ a;
  uint32_t c = b;
  c = (c >> c3) ^ b;
  return c;
}

extern "C" float isaac_render_shell_4098a0_rng_unit(uint32_t seed) {
  /* u32â†’f32 via signed double + 2^32 bias, then *DAT_ba9ff0 - 0.5 */
  const float as_f = isaac_render_shell_817830_u32_to_f32(seed);
  const float unit = f32_from_bits(ISAAC_RENDER_SHELL_F32_RNG_UNIT_BITS);
  const float half = f32_from_bits(ISAAC_RENDER_SHELL_F32_HALF_BITS);
  return as_f * unit - half;
}

namespace {

void source_quad_store(uint32_t out_ptr, float tl_x, float tl_y, float tr_x,
                       float tr_y, float bl_x, float bl_y, float br_x,
                       float br_y) {
  if (out_ptr == 0u) {
    return;
  }
  f32_store(out_ptr + 0u, tl_x);
  f32_store(out_ptr + 4u, tl_y);
  f32_store(out_ptr + 8u, tr_x);
  f32_store(out_ptr + 12u, tr_y);
  f32_store(out_ptr + 16u, bl_x);
  f32_store(out_ptr + 20u, bl_y);
  f32_store(out_ptr + 24u, br_x);
  f32_store(out_ptr + 28u, br_y);
  map_store_u8(out_ptr + static_cast<uint32_t>(
                             ISAAC_RENDER_SHELL_SOURCE_QUAD_SPACE_OFF),
               static_cast<uint8_t>(ISAAC_RENDER_SHELL_SOURCE_QUAD_SPACE_UV));
}

float source_quad_load(uint32_t out_ptr, uint32_t off) {
  const uint32_t bits = map_load_u32(out_ptr + off);
  return f32_from_bits(bits);
}

} /* namespace */

extern "C" uint32_t isaac_render_shell_4098a0_compute(
    uint32_t out_ptr, float frame_crop_x, float frame_crop_y, float frame_w,
    float frame_h, float frame_scale_x, float frame_scale_y, float layer_size_x,
    float layer_size_y, uint32_t layer_flip_x_w, uint32_t layer_flip_y_w,
    float layer_crop_x, float layer_crop_y, float clamp_tl_x, float clamp_tl_y,
    float clamp_br_x, float clamp_br_y, float anm2_scale_x, float anm2_scale_y,
    uint32_t anm2_flip_x_w, uint32_t anm2_flip_y_w, uint32_t dat_c7977d_w,
    uint32_t flags_or, uint32_t rng_seed, uint32_t rng_shr1, uint32_t rng_shl,
    uint32_t rng_shr2) {
  const uint8_t layer_flip_x = static_cast<uint8_t>(layer_flip_x_w & 0xffu);
  const uint8_t layer_flip_y = static_cast<uint8_t>(layer_flip_y_w & 0xffu);
  const uint8_t anm2_flip_x = static_cast<uint8_t>(anm2_flip_x_w & 0xffu);
  const uint8_t anm2_flip_y = static_cast<uint8_t>(anm2_flip_y_w & 0xffu);
  const uint8_t dat_c7977d = static_cast<uint8_t>(dat_c7977d_w & 0xffu);
  const float scale_x =
      isaac_render_shell_4098a0_scale_x(frame_scale_x, layer_size_x);
  const float scale_y =
      isaac_render_shell_4098a0_scale_y(frame_scale_y, layer_size_y);
  float left = 0.f;
  float top = 0.f;
  float right = 0.f;
  float bottom = 0.f;
  isaac_render_shell_4098a0_crop_rect(frame_crop_x, frame_crop_y, frame_w,
                                      frame_h, scale_x, scale_y, clamp_tl_x,
                                      clamp_tl_y, clamp_br_x, clamp_br_y, &left,
                                      &top, &right, &bottom);

  /* Axis-aligned SourceQuad before flips. */
  float tl_x = left;
  float tl_y = top;
  float tr_x = right;
  float tr_y = top;
  float bl_x = left;
  float bl_y = bottom;
  float br_x = right;
  float br_y = bottom;

  const uint8_t eff_flip_y =
      isaac_render_shell_4098a0_effective_flip_y(anm2_flip_y, dat_c7977d);

  if (isaac_render_shell_4098a0_flip_x_needed(scale_x, anm2_scale_x, layer_flip_x,
                                              anm2_flip_x) != 0) {
    /* FlipX: swap left/right corners (TLâ†”TR, BLâ†”BR). */
    float t = tl_x;
    tl_x = tr_x;
    tr_x = t;
    t = bl_x;
    bl_x = br_x;
    br_x = t;
  }

  if (isaac_render_shell_4098a0_flip_y_needed(scale_y, anm2_scale_y, layer_flip_y,
                                              eff_flip_y) != 0) {
    /* FlipY: swap top/bottom corners (TLâ†”BL, TRâ†”BR). */
    float tx = tl_x;
    float ty = tl_y;
    tl_x = bl_x;
    tl_y = bl_y;
    bl_x = tx;
    bl_y = ty;
    tx = tr_x;
    ty = tr_y;
    tr_x = br_x;
    tr_y = br_y;
    br_x = tx;
    br_y = ty;
  }

  source_quad_store(out_ptr, tl_x, tl_y, tr_x, tr_y, bl_x, bl_y, br_x, br_y);

  uint32_t seed = rng_seed;
  if (isaac_render_shell_4098a0_rng_flag_open(flags_or) != 0) {
    /* width/height from current TL/TR/BL before jitter. */
    const float width = source_quad_load(out_ptr, 8u) - source_quad_load(out_ptr, 0u);
    const float height =
        source_quad_load(out_ptr, 20u) - source_quad_load(out_ptr, 4u);

    seed = isaac_render_shell_4098a0_rng_step(seed, rng_shr1, rng_shl, rng_shr2);
    const float y_j = isaac_render_shell_4098a0_rng_unit(seed) * height;
    seed = isaac_render_shell_4098a0_rng_step(seed, rng_shr1, rng_shl, rng_shr2);
    const float x_j = isaac_render_shell_4098a0_rng_unit(seed) * width;
    tl_x = source_quad_load(out_ptr, 0u) + x_j;
    tl_y = source_quad_load(out_ptr, 4u) + y_j;
    tr_x = source_quad_load(out_ptr, 8u) + x_j;
    tr_y = source_quad_load(out_ptr, 12u) + y_j;
    bl_x = source_quad_load(out_ptr, 16u) + x_j;
    bl_y = source_quad_load(out_ptr, 20u) + y_j;
    br_x = source_quad_load(out_ptr, 24u) + x_j;
    br_y = source_quad_load(out_ptr, 28u) + y_j;
    source_quad_store(out_ptr, tl_x, tl_y, tr_x, tr_y, bl_x, bl_y, br_x, br_y);
  }

  /* Crop offset translate (always; VA 0x00409c08â€¦0x00409c94). */
  if (out_ptr != 0u) {
    for (uint32_t i = 0; i < 4u; ++i) {
      const uint32_t base = out_ptr + i * 8u;
      f32_store(base, source_quad_load(out_ptr, i * 8u) + layer_crop_x);
      f32_store(base + 4u, source_quad_load(out_ptr, i * 8u + 4u) + layer_crop_y);
    }
  }

  return seed;
}

extern "C" uint32_t isaac_render_shell_a112c0_host_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A112C0_VA;
}

extern "C" uint32_t isaac_render_shell_4098a0_rng_msg_va(void) {
  return ISAAC_RENDER_SHELL_4098A0_RNG_MSG_VA;
}

extern "C" int32_t isaac_render_shell_4098a0_rng_msg_arg(void) {
  return ISAAC_RENDER_SHELL_4098A0_RNG_MSG_ARG;
}

/* ---- opaque_call_00409cb0 dest-quad pure CF â€” ABI v22 (VA 0x00409cb0) ---- */

extern "C" uint32_t isaac_render_shell_409cb0_flags_or(uint32_t anm2_flags_110,
                                                      uint32_t layer_flags_8c) {
  /* VA 0x00409cc0â€¦0x00409cc6 */
  return anm2_flags_110 | layer_flags_8c;
}

extern "C" int32_t isaac_render_shell_409cb0_flag8_open(uint32_t flags_or) {
  return (flags_or & static_cast<uint32_t>(ISAAC_RENDER_SHELL_409CB0_FLAG_BIT8)) !=
                 0u
             ? 1
             : 0;
}

extern "C" float isaac_render_shell_409cb0_scale_x(float frame_scale_x,
                                                  float layer_size_x) {
  return isaac_render_shell_4098a0_scale_x(frame_scale_x, layer_size_x);
}

extern "C" float isaac_render_shell_409cb0_scale_y(float frame_scale_y,
                                                  float layer_size_y) {
  return isaac_render_shell_4098a0_scale_y(frame_scale_y, layer_size_y);
}

extern "C" int32_t isaac_render_shell_409cb0_plan(void) {
  /* ABI v25: a0f550/a10d00/a10950/a10760 are all translated pure bodies. */
  return ISAAC_RENDER_SHELL_409CB0_PLAN_PURE;
}

extern "C" int32_t isaac_render_shell_409cb0_pure_complete(void) {
  return 1;
}

extern "C" uint32_t isaac_render_shell_a0f550_host_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A0F550_VA;
}

extern "C" uint32_t isaac_render_shell_a10d00_host_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A10D00_VA;
}

extern "C" uint32_t isaac_render_shell_a10950_host_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A10950_VA;
}

extern "C" uint32_t isaac_render_shell_a10760_host_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A10760_VA;
}

/* ---- dest-quad nested pure bodies â€” ABI v24 ---- */

extern "C" void isaac_render_shell_a10d00_init(uint32_t obj_ptr, float left,
                                               float top, float right,
                                               float bottom,
                                               uint32_t color_ptr) {
  /* VA 0x00a10d00â€¦0x00a10dbd: axis-aligned DestinationQuad + 4Ã— color. */
  /* Corner pack: TL(left,top) TR(right,top) BL(left,bottom) BR(right,bottom). */
  f32_store(obj_ptr + 0x00u, left);
  f32_store(obj_ptr + 0x04u, top);
  f32_store(obj_ptr + 0x08u, right);
  f32_store(obj_ptr + 0x0cu, top);
  f32_store(obj_ptr + 0x10u, left);
  f32_store(obj_ptr + 0x14u, bottom);
  f32_store(obj_ptr + 0x18u, right);
  f32_store(obj_ptr + 0x1cu, bottom);
  /* 4 copies of 5 dwords from color_ptr into +0x20..+0x6c. */
  for (uint32_t copy = 0; copy < static_cast<uint32_t>(
                                    ISAAC_RENDER_SHELL_A10D00_COLOR_COPIES);
       ++copy) {
    const uint32_t dst_base =
        obj_ptr +
        static_cast<uint32_t>(ISAAC_RENDER_SHELL_A10D00_COLOR_OFF) +
        copy * static_cast<uint32_t>(ISAAC_RENDER_SHELL_A10D00_COLOR_DWORDS) *
            4u;
    for (uint32_t i = 0; i < static_cast<uint32_t>(
                                 ISAAC_RENDER_SHELL_A10D00_COLOR_DWORDS);
         ++i) {
      map_store_u32(dst_base + i * 4u, map_load_u32(color_ptr + i * 4u));
    }
  }
}

extern "C" int32_t isaac_render_shell_a10d00_pure_complete(void) { return 1; }

extern "C" int32_t isaac_render_shell_a10950_scale_identity(float scale_x,
                                                            float scale_y) {
  /* ucomiss ordered-eq vs DAT_00baa454 (1.0f). NaN â†’ not identity. */
  const float one = f32_from_bits(ISAAC_RENDER_SHELL_F32_ONE_BITS);
  return (scale_x == one && scale_y == one) ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_a10950_plan(float scale_x, float scale_y) {
  return isaac_render_shell_a10950_scale_identity(scale_x, scale_y) != 0
             ? ISAAC_RENDER_SHELL_A10950_PLAN_SKIP
             : ISAAC_RENDER_SHELL_A10950_PLAN_APPLY;
}

extern "C" void isaac_render_shell_a10950_apply(uint32_t obj_ptr, float offset_x,
                                                float offset_y, float scale_x,
                                                float scale_y) {
  /* VA 0x00a10950â€¦0x00a10aa0. Early-out when scale ordered-eq (1,1). */
  if (isaac_render_shell_a10950_plan(scale_x, scale_y) ==
      ISAAC_RENDER_SHELL_A10950_PLAN_SKIP) {
    return;
  }
  /* p' = (p + (-offset)) * scale + offset  for each of 4 corners. */
  const float nx = f32_neg_sign(offset_x);
  const float ny = f32_neg_sign(offset_y);
  /* Corner (x,y) pairs at +0x00/+0x04, +0x08/+0x0c, +0x10/+0x14, +0x18/+0x1c. */
  for (uint32_t i = 0; i < 4u; ++i) {
    const uint32_t xo = obj_ptr + i * 8u;
    const uint32_t yo = xo + 4u;
    float x = f32_load(xo);
    float y = f32_load(yo);
    x = x + nx;
    y = y + ny;
    x = x * scale_x;
    y = y * scale_y;
    x = x + offset_x;
    y = y + offset_y;
    f32_store(xo, x);
    f32_store(yo, y);
  }
}

extern "C" int32_t isaac_render_shell_a10950_pure_complete(void) { return 1; }

extern "C" int32_t isaac_render_shell_a10760_angle_zero(float angle_rad) {
  /* ucomiss ordered-eq vs DAT_00ba9fe4 (0.0f). */
  const float zero = f32_from_bits(ISAAC_RENDER_SHELL_F32_ZERO_BITS);
  return angle_rad == zero ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_a10760_plan(float angle_rad) {
  return isaac_render_shell_a10760_angle_zero(angle_rad) != 0
             ? ISAAC_RENDER_SHELL_A10760_PLAN_SKIP
             : ISAAC_RENDER_SHELL_A10760_PLAN_APPLY;
}

extern "C" void isaac_render_shell_a10760_apply_cs(uint32_t obj_ptr,
                                                   float pivot_x, float pivot_y,
                                                   float cos_a, float sin_a) {
  /* VA 0x00a1079câ€¦0x00a1093c: translate -pivot, rotate, translate +pivot. */
  const float nx = f32_neg_sign(pivot_x);
  const float ny = f32_neg_sign(pivot_y);
  for (uint32_t i = 0; i < 4u; ++i) {
    const uint32_t xo = obj_ptr + i * 8u;
    const uint32_t yo = xo + 4u;
    float x = f32_load(xo) + nx;
    float y = f32_load(yo) + ny;
    /* x' = x*cos - y*sin; y' = x*sin + y*cos */
    const float xr = x * cos_a - y * sin_a;
    const float yr = x * sin_a + y * cos_a;
    f32_store(xo, xr + pivot_x);
    f32_store(yo, yr + pivot_y);
  }
}

extern "C" void isaac_render_shell_a10760_apply(uint32_t obj_ptr, float pivot_x,
                                                float pivot_y,
                                                float angle_rad) {
  /* VA 0x00a10760â€¦0x00a10942 complete body. */
  if (isaac_render_shell_a10760_plan(angle_rad) ==
      ISAAC_RENDER_SHELL_A10760_PLAN_SKIP) {
    return;
  }
  /* FUN_0041d540 / FUN_0041d520: cvtss2sd â†’ cos/sin â†’ cvtsd2ss */
  const float cos_a = static_cast<float>(cos(static_cast<double>(angle_rad)));
  const float sin_a = static_cast<float>(sin(static_cast<double>(angle_rad)));
  isaac_render_shell_a10760_apply_cs(obj_ptr, pivot_x, pivot_y, cos_a, sin_a);
}

extern "C" int32_t isaac_render_shell_a10760_pure_complete(void) { return 1; }

extern "C" uint32_t isaac_render_shell_41d540_host_va(void) {
  return ISAAC_RENDER_SHELL_HOST_41D540_VA;
}

extern "C" uint32_t isaac_render_shell_41d520_host_va(void) {
  return ISAAC_RENDER_SHELL_HOST_41D520_VA;
}

/* ---- opaque_call_00409cb0 whole-body pure compute â€” ABI v25 ---- */

extern "C" int32_t isaac_render_shell_409cb0_camera_open(uint32_t dat_c71678,
                                                         uint32_t dat_c33910_w) {
  const uint8_t dat_c33910 = static_cast<uint8_t>(dat_c33910_w & 0xffu);
  /* VA 0x00409ef8: test eax,eax / VA 0x00409efc: cmp byte [c33910], 0 */
  return (dat_c71678 != 0u && dat_c33910 != 0u) ? 1 : 0;
}

extern "C" void isaac_render_shell_409cb0_camera_base(uint32_t dat_c71678,
                                                      uint32_t dat_c33910_w,
                                                      float dat_c7b640,
                                                      float dat_c7b644,
                                                      float* out_x,
                                                      float* out_y) {
  const uint8_t dat_c33910 = static_cast<uint8_t>(dat_c33910_w & 0xffu);
  /* VA 0x00409ee3â€¦0x00409f15. Defaults loaded first, overwritten when open. */
  float cx = dat_c7b640;
  float cy = dat_c7b644;
  if (isaac_render_shell_409cb0_camera_open(dat_c71678, dat_c33910) != 0) {
    cx = f32_load(dat_c71678 +
                  static_cast<uint32_t>(ISAAC_RENDER_SHELL_409CB0_CAM_X_OFF));
    cy = f32_load(dat_c71678 +
                  static_cast<uint32_t>(ISAAC_RENDER_SHELL_409CB0_CAM_Y_OFF));
  }
  if (out_x != nullptr) {
    *out_x = cx;
  }
  if (out_y != nullptr) {
    *out_y = cy;
  }
}

extern "C" void isaac_render_shell_409cb0_scale_pack(
    uint32_t flags_or, float frame_scale_x, float frame_scale_y,
    float layer_size_x, float layer_size_y, float anm2_scale_x,
    float anm2_scale_y, uint32_t layer_flip_x_w, uint32_t layer_flip_y_w,
    uint32_t anm2_flip_x_w, uint32_t eff_flip_y_w, float* out_sx_frame,
    float* out_sy_frame, float* out_sx_anm2, float* out_sy_anm2) {
  const uint8_t layer_flip_x = static_cast<uint8_t>(layer_flip_x_w & 0xffu);
  const uint8_t layer_flip_y = static_cast<uint8_t>(layer_flip_y_w & 0xffu);
  const uint8_t anm2_flip_x = static_cast<uint8_t>(anm2_flip_x_w & 0xffu);
  const uint8_t eff_flip_y = static_cast<uint8_t>(eff_flip_y_w & 0xffu);
  /* VA 0x00409d27/0x00409d2c entry packs; 0x00409d8f/0x00409d3b anm2 pass. */
  float sxf = frame_scale_x * layer_size_x;
  float syf = frame_scale_y * layer_size_y;
  float sxa = anm2_scale_x;
  float sya = anm2_scale_y;
  /* VA 0x00409d9d: test dl,8 â†’ 0x00409da2â€¦0x00409ddc override block. */
  if (isaac_render_shell_409cb0_flag8_open(flags_or) != 0) {
    sxa = layer_size_x * anm2_scale_x;
    sya = layer_size_y * anm2_scale_y;
    sxf = frame_scale_x;
    syf = frame_scale_y;
  }
  /* VA 0x00409ddc / 0x00409df3 / 0x00409e64 / 0x00409e73 xorps -0.0 gates. */
  if (layer_flip_x != 0u) {
    sxf = f32_neg_sign(sxf);
  }
  if (anm2_flip_x != 0u) {
    sxa = f32_neg_sign(sxa);
  }
  if (layer_flip_y != 0u) {
    syf = f32_neg_sign(syf);
  }
  if (eff_flip_y != 0u) {
    sya = f32_neg_sign(sya);
  }
  if (out_sx_frame != nullptr) {
    *out_sx_frame = sxf;
  }
  if (out_sy_frame != nullptr) {
    *out_sy_frame = syf;
  }
  if (out_sx_anm2 != nullptr) {
    *out_sx_anm2 = sxa;
  }
  if (out_sy_anm2 != nullptr) {
    *out_sy_anm2 = sya;
  }
}

extern "C" float isaac_render_shell_409cb0_span(float ref, float pivot,
                                                int32_t neg_anm2,
                                                int32_t neg_frame) {
  /* X: 0x00409e2f (ref-pivot) then 0x00409e4a (ref-span).
     Y: 0x00409e88 (ref-pivot) then 0x00409ecf (ref-span). */
  float span = pivot;
  if (neg_anm2 != 0) {
    span = ref - pivot;
  }
  if (neg_frame != 0) {
    span = ref - span;
  }
  return span;
}

extern "C" int32_t isaac_render_shell_409cb0_rot_negated(int32_t neg_x,
                                                         int32_t neg_y) {
  /* rotA/rotB xorps in both folds (0x00409e0e/0x00409e17 and
     0x00409e9b/0x00409ea4): two flips cancel. */
  return ((neg_x != 0) != (neg_y != 0)) ? 1 : 0;
}

extern "C" float isaac_render_shell_409cb0_deg_to_rad(float degrees) {
  /* mulss xmm2, [0xbaa088] at VA 0x00409ff3 and 0x0040a00b. */
  return degrees * f32_from_bits(ISAAC_RENDER_SHELL_F32_DEG2RAD_BITS);
}

extern "C" void isaac_render_shell_409cb0_pivots(
    float cam_x, float cam_y, float pos_x, float pos_y, float pos_base_x,
    float pos_base_y, float anm2_off_x, float anm2_off_y, float* out_p1x,
    float* out_p1y, float* out_p2x, float* out_p2y) {
  /* VA 0x00409f1aâ€¦0x00409f5f. */
  const float bx = cam_x + pos_x;
  const float by = cam_y + pos_y;
  if (out_p1x != nullptr) {
    *out_p1x = bx + pos_base_x;
  }
  if (out_p2x != nullptr) {
    *out_p2x = bx + anm2_off_x;
  }
  if (out_p1y != nullptr) {
    *out_p1y = by + pos_base_y;
  }
  if (out_p2y != nullptr) {
    *out_p2y = by + anm2_off_y;
  }
}

extern "C" void isaac_render_shell_409cb0_corners(
    float x0, float y0, float frame_ref_x, float frame_ref_y, float clamp_tl_x,
    float clamp_tl_y, float clamp_br_x, float clamp_br_y, float sx_frame,
    float sy_frame, float* out_l, float* out_t, float* out_r, float* out_b) {
  /* VA 0x00409f70â€¦0x00409fc0 (divss by the folded frame scales). */
  const float bottom = (y0 + frame_ref_y) - (clamp_br_y / sy_frame);
  const float right = (x0 + frame_ref_x) - (clamp_br_x / sx_frame);
  const float top = (clamp_tl_y / sy_frame) + y0;
  const float left = (clamp_tl_x / sx_frame) + x0;
  if (out_l != nullptr) {
    *out_l = left;
  }
  if (out_t != nullptr) {
    *out_t = top;
  }
  if (out_r != nullptr) {
    *out_r = right;
  }
  if (out_b != nullptr) {
    *out_b = bottom;
  }
}

extern "C" uint32_t isaac_render_shell_409cb0_color_arg(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_409CB0_COLOR_ARG);
}

extern "C" uint32_t isaac_render_shell_409cb0_compute(
    uint32_t out_ptr, uint32_t color_ptr, float pos_x, float pos_y,
    float frame_ref_x, float frame_ref_y, float frame_pos_x, float frame_pos_y,
    float frame_scale_x, float frame_scale_y, float frame_pivot_x,
    float frame_pivot_y, float frame_rot, float layer_size_x,
    float layer_size_y, float layer_rot, float layer_pos_x, float layer_pos_y,
    uint32_t layer_flip_x_w, uint32_t layer_flip_y_w, uint32_t layer_flags_8c,
    float anm2_off_x, float anm2_off_y, float anm2_scale_x, float anm2_scale_y,
    float anm2_rot, uint32_t anm2_flip_x_w, uint32_t anm2_flip_y_w,
    uint32_t anm2_flags_110, float clamp_tl_x, float clamp_tl_y,
    float clamp_br_x, float clamp_br_y, uint32_t dat_c7977d_w, float cam_x,
    float cam_y) {
  const uint8_t layer_flip_x = static_cast<uint8_t>(layer_flip_x_w & 0xffu);
  const uint8_t layer_flip_y = static_cast<uint8_t>(layer_flip_y_w & 0xffu);
  const uint8_t anm2_flip_x = static_cast<uint8_t>(anm2_flip_x_w & 0xffu);
  const uint8_t anm2_flip_y = static_cast<uint8_t>(anm2_flip_y_w & 0xffu);
  const uint8_t dat_c7977d = static_cast<uint8_t>(dat_c7977d_w & 0xffu);
  /* VA 0x00409cb0â€¦0x0040a021 complete body; ret 0x1c, returns the object. */
  const uint32_t flags_or =
      isaac_render_shell_409cb0_flags_or(anm2_flags_110, layer_flags_8c);
  const uint8_t eff_flip_y =
      isaac_render_shell_4098a0_effective_flip_y(anm2_flip_y, dat_c7977d);

  float sxf = 0.0f;
  float syf = 0.0f;
  float sxa = 0.0f;
  float sya = 0.0f;
  isaac_render_shell_409cb0_scale_pack(
      flags_or, frame_scale_x, frame_scale_y, layer_size_x, layer_size_y,
      anm2_scale_x, anm2_scale_y, layer_flip_x, layer_flip_y, anm2_flip_x,
      eff_flip_y, &sxf, &syf, &sxa, &sya);

  /* comiss 0, scale at VA 0x00409e06 / 0x00409e45 / 0x00409e83 / 0x00409eca. */
  const int32_t neg_xa = isaac_render_shell_4098a0_f32_strict_neg(sxa);
  if (neg_xa != 0) {
    sxa = f32_neg_sign(sxa);
  }
  const int32_t neg_xf = isaac_render_shell_4098a0_f32_strict_neg(sxf);
  if (neg_xf != 0) {
    sxf = f32_neg_sign(sxf);
  }
  const int32_t neg_ya = isaac_render_shell_4098a0_f32_strict_neg(sya);
  if (neg_ya != 0) {
    sya = f32_neg_sign(sya);
  }
  const int32_t neg_yf = isaac_render_shell_4098a0_f32_strict_neg(syf);
  if (neg_yf != 0) {
    syf = f32_neg_sign(syf);
  }

  const float span_x =
      isaac_render_shell_409cb0_span(frame_ref_x, frame_pivot_x, neg_xa,
                                     neg_xf);
  const float span_y =
      isaac_render_shell_409cb0_span(frame_ref_y, frame_pivot_y, neg_ya,
                                     neg_yf);

  /* VA 0x00409d5e/0x00409d59 rotation + position base packs. */
  float rot_a = frame_rot + layer_rot;
  float rot_b = anm2_rot;
  if (isaac_render_shell_409cb0_rot_negated(neg_xa, neg_ya) != 0) {
    rot_a = f32_neg_sign(rot_a);
    rot_b = f32_neg_sign(rot_b);
  }
  float base_x = (frame_pos_x + layer_pos_x) + anm2_off_x;
  float base_y = (frame_pos_y + layer_pos_y) + anm2_off_y;
  if (neg_xa != 0) {
    base_x = f32_neg_sign(base_x);
  }
  if (neg_ya != 0) {
    base_y = f32_neg_sign(base_y);
  }

  float p1x = 0.0f;
  float p1y = 0.0f;
  float p2x = 0.0f;
  float p2y = 0.0f;
  isaac_render_shell_409cb0_pivots(cam_x, cam_y, pos_x, pos_y, base_x, base_y,
                                   anm2_off_x, anm2_off_y, &p1x, &p1y, &p2x,
                                   &p2y);
  const float x0 = p1x - span_x;
  const float y0 = p1y - span_y;

  /* VA 0x00409f69: a0f550(color, -1). */
  isaac_render_shell_a0f550_init(color_ptr,
                                 isaac_render_shell_409cb0_color_arg());

  float left = 0.0f;
  float top = 0.0f;
  float right = 0.0f;
  float bottom = 0.0f;
  isaac_render_shell_409cb0_corners(x0, y0, frame_ref_x, frame_ref_y,
                                    clamp_tl_x, clamp_tl_y, clamp_br_x,
                                    clamp_br_y, sxf, syf, &left, &top, &right,
                                    &bottom);

  /* VA 0x00409fc4 / 0x00409fd5 / 0x00409fe4 / 0x00409ffc / 0x0040a016. */
  isaac_render_shell_a10d00_init(out_ptr, left, top, right, bottom, color_ptr);
  isaac_render_shell_a10950_apply(out_ptr, p1x, p1y, sxf, syf);
  isaac_render_shell_a10950_apply(out_ptr, p2x, p2y, sxa, sya);
  isaac_render_shell_a10760_apply(out_ptr, p1x, p1y,
                                  isaac_render_shell_409cb0_deg_to_rad(rot_a));
  isaac_render_shell_a10760_apply(out_ptr, p2x, p2y,
                                  isaac_render_shell_409cb0_deg_to_rad(rot_b));
  return out_ptr;
}

/* ---- opaque_call_0040c550 continuation chain â€” ABI v26 ---- */

extern "C" int32_t isaac_render_shell_40c550_entry_plan(uint32_t src_ctrl) {
  /* VA 0x0040c56d: test edi,edi; je 0x40c5a4 */
  return isaac_render_shell_40c550_src_control_null(src_ctrl) != 0
             ? ISAAC_RENDER_SHELL_40C550_PLAN_ZERO_ONLY
             : ISAAC_RENDER_SHELL_40C550_PLAN_ADDREF;
}

extern "C" int32_t isaac_render_shell_40c550_resume_plan(
    uint32_t addref_result, uint32_t dest_ctrl_after) {
  /* VA 0x0040c57a: test al,al â€” low byte only (return value is bool in AL). */
  if ((addref_result & 0xffu) == 0u) {
    return ISAAC_RENDER_SHELL_40C550_RESUME_ABORT;
  }
  /* VA 0x0040c57e/0x0040c581: ecx = [dest+4] re-read after the call. */
  return dest_ctrl_after != 0u ? ISAAC_RENDER_SHELL_40C550_RESUME_RELEASE
                               : ISAAC_RENDER_SHELL_40C550_RESUME_ASSIGN;
}

extern "C" int32_t isaac_render_shell_40c550_hook_needed(
    uint32_t release_result, uint32_t hook_ptr) {
  /* VA 0x0040c58c: test al,al; VA 0x0040c595: test eax,eax on DAT_00c7163c. */
  if ((release_result & 0xffu) == 0u) {
    return 0;
  }
  return hook_ptr != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_render_shell_40c550_hook_arg(uint32_t dest_ptr) {
  /* VA 0x0040c599: push esi (the dest SharedPtr); cdecl, add esp,4. */
  return dest_ptr;
}

extern "C" int32_t isaac_render_shell_40c550_apply(
    uint32_t dest_ptr, uint32_t src_obj, uint32_t src_ctrl,
    uint32_t addref_result, uint32_t dest_ctrl_after, uint32_t release_result,
    uint32_t hook_ptr) {
  /* Entry zero always runs, even on the ZERO_ONLY path. */
  isaac_render_shell_40c550_zero_dest(dest_ptr);
  if (isaac_render_shell_40c550_entry_plan(src_ctrl) ==
      ISAAC_RENDER_SHELL_40C550_PLAN_ZERO_ONLY) {
    return ISAAC_RENDER_SHELL_40C550_PLAN_ZERO_ONLY;
  }
  const int32_t resume =
      isaac_render_shell_40c550_resume_plan(addref_result, dest_ctrl_after);
  if (resume == ISAAC_RENDER_SHELL_40C550_RESUME_ABORT) {
    /* VA 0x0040c57c: jump past the assign â€” dest is left zeroed. */
    return resume;
  }
  /* RELEASE only adds host calls; the assign at 0x0040c59f runs either way. */
  (void)release_result;
  (void)hook_ptr;
  isaac_render_shell_40c550_assign(dest_ptr, src_obj, src_ctrl);
  return resume;
}

extern "C" int32_t isaac_render_shell_40c550_pure_complete(uint32_t src_ctrl) {
  return isaac_render_shell_40c550_entry_plan(src_ctrl) ==
                 ISAAC_RENDER_SHELL_40C550_PLAN_ZERO_ONLY
             ? 1
             : 0;
}

extern "C" uint32_t isaac_render_shell_40c550_src_vt_addref_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_40C550_SRC_VT_ADDREF_OFF);
}

extern "C" uint32_t isaac_render_shell_40c550_dest_vt_release_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_40C550_DEST_VT_RELEASE_OFF);
}

extern "C" uint32_t isaac_render_shell_40c550_hook_dat_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_40C550_HOOK_DAT_VA);
}

/* ---- opaque_call_00408590 recapture-correct two-phase plan â€” ABI v26 ---- */

extern "C" int32_t isaac_render_shell_408590_entry_plan(uint32_t sprite_obj,
                                                        uint32_t sprite_a0,
                                                        uint32_t sprite_a1,
                                                        uint32_t layer_a0,
                                                        uint32_t layer_a1) {
  /* VA 0x004085a0: test esi,esi; je 0x408618 (straight to the tail copy). */
  if (isaac_render_shell_408590_sprite_present(sprite_obj) == 0) {
    return ISAAC_RENDER_SHELL_408590_ENTRY_TAIL_COPY;
  }
  /* VA 0x004085ad/0x004085b5 pair-A cache compare. */
  return isaac_render_shell_408590_pair_a_equal(sprite_a0, sprite_a1, layer_a0,
                                                layer_a1) == 0
             ? ISAAC_RENDER_SHELL_408590_ENTRY_PAIR_A
             : ISAAC_RENDER_SHELL_408590_ENTRY_CHECK_B;
}

extern "C" int32_t isaac_render_shell_408590_post_a_plan(uint32_t sprite_after,
                                                         uint32_t sprite_b0,
                                                         uint32_t sprite_b1,
                                                         uint32_t layer_b0,
                                                         uint32_t layer_b1) {
  /* Reads the sprite pointer recaptured at VA 0x004085de, not the pre-call
     one. A null recapture would fault in the PE; the pure model stops. */
  if (sprite_after == 0u) {
    return ISAAC_RENDER_SHELL_408590_POST_A_TAIL_COPY;
  }
  return isaac_render_shell_408590_pair_b_equal(sprite_b0, sprite_b1, layer_b0,
                                                layer_b1) == 0
             ? ISAAC_RENDER_SHELL_408590_POST_A_PAIR_B
             : ISAAC_RENDER_SHELL_408590_POST_A_TAIL_COPY;
}

extern "C" int32_t isaac_render_shell_408590_pair_a_recheck(uint32_t sprite_a0,
                                                            uint32_t sprite_a1,
                                                            uint32_t layer_a0,
                                                            uint32_t layer_a1) {
  /* VA 0x004085c2: cmp ebx,edx; VA 0x004085c6: cmp eax,[ecx+0x34].
     Same operands as the first gate, no intervening store. */
  return (layer_a0 == sprite_a0 && layer_a1 == sprite_a1) ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_408590_pair_b_recheck(uint32_t sprite_b0,
                                                            uint32_t sprite_b1,
                                                            uint32_t layer_b0,
                                                            uint32_t layer_b1) {
  /* VA 0x004085fc: cmp ebx,edx; VA 0x00408600: cmp ecx,[esi+0x3c]. */
  return (layer_b0 == sprite_b0 && layer_b1 == sprite_b1) ? 1 : 0;
}

extern "C" uint32_t isaac_render_shell_408590_apply(
    uint32_t layer_ptr, uint32_t out_ptr, uint32_t sprite_pre,
    uint32_t sprite_after, uint32_t layer_a0, uint32_t layer_a1,
    uint32_t layer_b0, uint32_t layer_b1, uint32_t sprite_a0,
    uint32_t sprite_a1, uint32_t sprite_b0, uint32_t sprite_b1,
    uint32_t src_obj, uint32_t src_ctrl, uint32_t addref_result,
    uint32_t dest_ctrl_after, uint32_t release_result, uint32_t hook_ptr) {
  (void)layer_ptr;
  const int32_t entry = isaac_render_shell_408590_entry_plan(
      sprite_pre, sprite_a0, sprite_a1, layer_a0, layer_a1);
  uint32_t sprite_for_b = sprite_pre;
  if (entry == ISAAC_RENDER_SHELL_408590_ENTRY_PAIR_A) {
    /* VA 0x004085d5â€¦0x004085db: the cache store uses [ebp-8], the PRE-call
       sprite pointer, even though the pointer is reloaded right after. */
    isaac_render_shell_408590_apply_pair_a_cache(sprite_pre, layer_a0,
                                                 layer_a1);
    /* VA 0x004085de: esi = [this+0x98] recapture. */
    sprite_for_b = sprite_after;
  }
  if (entry != ISAAC_RENDER_SHELL_408590_ENTRY_TAIL_COPY) {
    const int32_t post = isaac_render_shell_408590_post_a_plan(
        sprite_for_b, sprite_b0, sprite_b1, layer_b0, layer_b1);
    if (post == ISAAC_RENDER_SHELL_408590_POST_A_PAIR_B) {
      /* VA 0x00408611â€¦0x00408614: pair-B store targets the recaptured ptr. */
      isaac_render_shell_408590_apply_pair_b_cache(sprite_for_b, layer_b0,
                                                   layer_b1);
    }
  }
  /* VA 0x00408622: out = 0x40c550(out, &this+0x98). */
  isaac_render_shell_40c550_apply(out_ptr, src_obj, src_ctrl, addref_result,
                                  dest_ctrl_after, release_result, hook_ptr);
  return out_ptr;
}

/* ---- 0x00af0917 â†’ CRT floor â€” ABI v26 ---- */

extern "C" float isaac_render_shell_af0917_floor(float value) {
  /* fld dword / fstp qword widen exactly; floor; fstp dword narrows without
     rounding because floor of a float32 is representable in float32. */
  return static_cast<float>(floor(static_cast<double>(value)));
}

extern "C" int32_t isaac_render_shell_af0917_pure_complete(void) { return 1; }

extern "C" uint32_t isaac_render_shell_af0917_iat_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_AF0917_IAT_VA);
}

extern "C" void isaac_render_shell_stage_overlay_draw_pos_pure(
    float scroll_x_c78dc4, float scroll_y_c78edc, float pos_x, float pos_y,
    float scale, float camera_x, float camera_y, float* out_x, float* out_y) {
  const float pre_x = isaac_render_shell_stage_overlay_pre_floor_x(
      scroll_x_c78dc4, pos_x, scale);
  const float pre_y = isaac_render_shell_stage_overlay_pre_floor_y(
      scroll_y_c78edc, pos_y, scale);
  const float floor_x = isaac_render_shell_af0917_floor(pre_x);
  const float floor_y = isaac_render_shell_af0917_floor(pre_y);
  isaac_render_shell_stage_overlay_draw_pos(camera_x, camera_y, floor_x,
                                            floor_y, scale, out_x, out_y);
}

/* ---- ABI v28: RoomDescriptor::constructor @ 0x006ef590 ---- */

namespace {

void store_dword_run(uint32_t base, int32_t off, int32_t count,
                     uint32_t value) {
  for (int32_t i = 0; i < count; ++i) {
    map_store_u32(base + static_cast<uint32_t>(off) +
                      static_cast<uint32_t>(i) * 4u,
                  value);
  }
}

}  /* namespace */

extern "C" void isaac_render_shell_6ef590_init_scalars(uint32_t obj_ptr) {
  if (obj_ptr == 0u) {
    return;
  }
  /* VA 0x006ef5beâ€¦0x006ef5cb */
  store_dword_run(obj_ptr, ISAAC_RENDER_SHELL_6EF590_NEG_HEAD_OFF,
                  ISAAC_RENDER_SHELL_6EF590_NEG_HEAD_COUNT, 0xffffffffu);
  /* VA 0x006ef5d2â€¦0x006ef5e7 */
  store_dword_run(obj_ptr, ISAAC_RENDER_SHELL_6EF590_ZERO_A_OFF,
                  ISAAC_RENDER_SHELL_6EF590_ZERO_A_COUNT, 0u);
  /* VA 0x006ef5eeâ€¦0x006ef5fc */
  store_dword_run(obj_ptr, ISAAC_RENDER_SHELL_6EF590_ZERO_B_OFF,
                  ISAAC_RENDER_SHELL_6EF590_ZERO_B_COUNT, 0u);
  /* VA 0x006ef603â€¦0x006ef626 (+0x48..+0x70; +0x68/+0x6c/+0x70 are the grid
     triple and get overwritten once the allocation returns). */
  store_dword_run(obj_ptr, ISAAC_RENDER_SHELL_6EF590_ZERO_C_OFF,
                  ISAAC_RENDER_SHELL_6EF590_ZERO_C_COUNT, 0u);
  map_store_u32(obj_ptr + ISAAC_RENDER_SHELL_6EF590_GRID_BEGIN_OFF, 0u);
  map_store_u32(obj_ptr + ISAAC_RENDER_SHELL_6EF590_GRID_END_OFF, 0u);
  map_store_u32(obj_ptr + ISAAC_RENDER_SHELL_6EF590_GRID_CAP_OFF, 0u);
}

extern "C" uint32_t isaac_render_shell_6ef590_align_grid(uint32_t raw_ptr) {
  /* VA 0x006ef63b: lea eax,[ecx+0x23]; and eax,0xffffffe0; [eax-4] = ecx */
  if (raw_ptr == 0u) {
    return 0u;
  }
  const uint32_t base =
      (raw_ptr +
       static_cast<uint32_t>(ISAAC_RENDER_SHELL_6EF590_GRID_ALIGN_BIAS)) &
      ~(static_cast<uint32_t>(ISAAC_RENDER_SHELL_6EF590_GRID_ALIGN) - 1u);
  map_store_u32(base - 4u, raw_ptr);
  return base;
}

extern "C" void isaac_render_shell_6ef590_grid_elem_init(uint32_t elem_ptr) {
  /* VA 0x006ef660â€¦0x006ef694. +0x19..+0x1b are deliberately not written. */
  map_store_u32(elem_ptr + 0x00u, 0u);
  map_store_u32(elem_ptr + 0x04u, 0u);
  map_store_u32(elem_ptr + 0x08u, 0u);
  map_store_u32(elem_ptr + 0x0cu, 0u);
  map_store_u32(elem_ptr + 0x10u,
                static_cast<uint32_t>(ISAAC_RENDER_SHELL_6EF590_GRID_MAGIC));
  map_store_u32(elem_ptr + 0x14u, 0u);
  map_store_u8(elem_ptr + 0x18u, 0u);
  map_store_u32(elem_ptr + 0x1cu,
                static_cast<uint32_t>(ISAAC_RENDER_SHELL_6EF590_GRID_MAGIC));
}

extern "C" void isaac_render_shell_6ef590_grid_fill(uint32_t base_ptr) {
  if (base_ptr == 0u) {
    return;
  }
  uint32_t p = base_ptr;
  for (int32_t n = 0; n < ISAAC_RENDER_SHELL_6EF590_GRID_COUNT; ++n) {
    isaac_render_shell_6ef590_grid_elem_init(p);
    p += static_cast<uint32_t>(ISAAC_RENDER_SHELL_6EF590_GRID_ELEM);
  }
}

extern "C" void isaac_render_shell_6ef590_map_node_init(uint32_t node_ptr) {
  /* VA 0x006ef6c7â€¦0x006ef6cf: self-links then the 16-bit color/isnil pair. */
  if (node_ptr == 0u) {
    return;
  }
  map_store_u32(node_ptr +
                    static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_LEFT_OFF),
                node_ptr);
  map_store_u32(node_ptr +
                    static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_PARENT_OFF),
                node_ptr);
  map_store_u32(node_ptr +
                    static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_RIGHT_OFF),
                node_ptr);
  const uint32_t flags =
      static_cast<uint32_t>(ISAAC_RENDER_SHELL_6EF590_NODE_FLAGS_WORD);
  map_store_u8(node_ptr + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_COLOR_OFF),
               static_cast<uint8_t>(flags & 0xffu));
  map_store_u8(node_ptr + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_ISNIL_OFF),
               static_cast<uint8_t>((flags >> 8) & 0xffu));
}

extern "C" int32_t isaac_render_shell_6ef590_vec_capacity(uint32_t begin,
                                                          uint32_t end) {
  /* VA 0x006ef74fâ€¦0x006ef765: exact MSVC signed /0x78 sequence. */
  const int32_t span = static_cast<int32_t>(end - begin);
  const int32_t magic =
      static_cast<int32_t>(ISAAC_RENDER_SHELL_6EF590_VEC_DIV_MAGIC);
  const int64_t prod =
      static_cast<int64_t>(span) * static_cast<int64_t>(magic);
  int32_t hi = static_cast<int32_t>(prod >> 32);
  hi = static_cast<int32_t>(static_cast<uint32_t>(hi) +
                            static_cast<uint32_t>(span));
  hi >>= ISAAC_RENDER_SHELL_6EF590_VEC_DIV_SHIFT;
  const uint32_t sign = static_cast<uint32_t>(hi) >> 31;
  return static_cast<int32_t>(static_cast<uint32_t>(hi) + sign);
}

extern "C" int32_t isaac_render_shell_6ef590_reserve_needed(uint32_t begin,
                                                            uint32_t end,
                                                            int32_t want) {
  /* VA 0x006ef767 / 0x006ef7c8: cmp eax,N; jae skip â€” unsigned. */
  const uint32_t cap =
      static_cast<uint32_t>(isaac_render_shell_6ef590_vec_capacity(begin, end));
  return cap < static_cast<uint32_t>(want) ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_6ef590_clear_loop_count(uint32_t begin,
                                                              uint32_t end) {
  /* VA 0x006ef724: cmp esi,eax; je skip. Then `add esi,0x78` until esi==end.
     Ranges are recaptured, so a non-empty range is representable here. */
  if (begin == end) {
    return 0;
  }
  const int32_t span = static_cast<int32_t>(end - begin);
  if (span < 0 ||
      (span % static_cast<int32_t>(
                  ISAAC_RENDER_SHELL_6EF590_ENTITY_SAVE_SIZE)) != 0) {
    /* The PE compares for exact equality, so a misaligned range would run
       away. Report the host-visible fact instead of inventing a count. */
    return -1;
  }
  return span / static_cast<int32_t>(ISAAC_RENDER_SHELL_6EF590_ENTITY_SAVE_SIZE);
}

extern "C" void isaac_render_shell_6ef590_late_neg_fill(uint32_t obj_ptr) {
  /* VA 0x006ef805â€¦0x006ef836 */
  if (obj_ptr == 0u) {
    return;
  }
  store_dword_run(obj_ptr, ISAAC_RENDER_SHELL_6EF590_NEG_LATE_OFF,
                  ISAAC_RENDER_SHELL_6EF590_NEG_LATE_COUNT, 0xffffffffu);
}

extern "C" void isaac_render_shell_6ef590_grid_second_pass(uint32_t obj_ptr) {
  /* VA 0x006ef840â€¦0x006ef853. [this+0x68] is reloaded every iteration. */
  if (obj_ptr == 0u) {
    return;
  }
  for (uint32_t k = 0; k < static_cast<uint32_t>(
                               ISAAC_RENDER_SHELL_6EF590_GRID_BYTES);
       k += static_cast<uint32_t>(ISAAC_RENDER_SHELL_6EF590_GRID_ELEM)) {
    const uint32_t base = map_load_u32(
        obj_ptr + ISAAC_RENDER_SHELL_6EF590_GRID_BEGIN_OFF);
    if (base == 0u) {
      return;
    }
    map_store_u32(base + k, 0u);
  }
}

extern "C" void isaac_render_shell_6ef590_tail_zero(uint32_t obj_ptr) {
  /* VA 0x006ef85a: movups [edi+0x94], xmm0 â€” 16 bytes, stopping at +0xa3. */
  if (obj_ptr == 0u) {
    return;
  }
  for (int32_t i = 0; i < ISAAC_RENDER_SHELL_6EF590_TAIL_ZERO_LEN; ++i) {
    map_store_u8(obj_ptr +
                     static_cast<uint32_t>(
                         ISAAC_RENDER_SHELL_6EF590_TAIL_ZERO_OFF) +
                     static_cast<uint32_t>(i),
                 0u);
  }
}

extern "C" uint32_t isaac_render_shell_6ef590_apply(
    uint32_t obj_ptr, uint32_t grid_raw, uint32_t node_raw,
    uint32_t vec_a_begin_after, uint32_t vec_a_end_after,
    uint32_t vec_b_begin_after, uint32_t vec_b_end_after,
    int32_t* out_dtor_calls) {
  int32_t dtor_calls = 0;
  if (obj_ptr == 0u) {
    if (out_dtor_calls != nullptr) {
      *out_dtor_calls = 0;
    }
    return 0u;
  }
  isaac_render_shell_6ef590_init_scalars(obj_ptr);
  /* VA 0x006ef629: host alloc(0x3823). Null â†’ IAT 0x00b18894, no return. */
  const uint32_t grid_base = isaac_render_shell_6ef590_align_grid(grid_raw);
  if (grid_base == 0u) {
    if (out_dtor_calls != nullptr) {
      *out_dtor_calls = 0;
    }
    return obj_ptr;
  }
  map_store_u32(obj_ptr + ISAAC_RENDER_SHELL_6EF590_GRID_BEGIN_OFF, grid_base);
  map_store_u32(obj_ptr + ISAAC_RENDER_SHELL_6EF590_GRID_CAP_OFF,
                grid_base +
                    static_cast<uint32_t>(ISAAC_RENDER_SHELL_6EF590_GRID_BYTES));
  isaac_render_shell_6ef590_grid_fill(grid_base);
  map_store_u32(obj_ptr + ISAAC_RENDER_SHELL_6EF590_GRID_END_OFF,
                grid_base +
                    static_cast<uint32_t>(ISAAC_RENDER_SHELL_6EF590_GRID_BYTES));
  /* VA 0x006ef6a2â€¦0x006ef6bc: both vectors and the tree head zeroed. */
  store_dword_run(obj_ptr, ISAAC_RENDER_SHELL_6EF590_VEC_A_OFF, 3, 0u);
  map_store_u32(obj_ptr + ISAAC_RENDER_SHELL_6EF590_MAP_OFF, 0u);
  map_store_u32(obj_ptr + ISAAC_RENDER_SHELL_6EF590_MAP_SIZE_OFF, 0u);
  /* VA 0x006ef6bf: host alloc(0x14) for the tree sentinel. */
  isaac_render_shell_6ef590_map_node_init(node_raw);
  map_store_u32(obj_ptr + ISAAC_RENDER_SHELL_6EF590_MAP_OFF, node_raw);
  store_dword_run(obj_ptr, ISAAC_RENDER_SHELL_6EF590_VEC_B_OFF, 3, 0u);
  /* VA 0x006ef6fdâ€¦0x006ef707: or eax,-1 then two 16-bit stores. */
  map_store_u8(obj_ptr +
                   static_cast<uint32_t>(ISAAC_RENDER_SHELL_6EF590_WORD_A_OFF),
               0xffu);
  map_store_u8(obj_ptr +
                   static_cast<uint32_t>(ISAAC_RENDER_SHELL_6EF590_WORD_A_OFF) +
                   1u,
               0xffu);
  map_store_u8(obj_ptr +
                   static_cast<uint32_t>(ISAAC_RENDER_SHELL_6EF590_WORD_B_OFF),
               0xffu);
  map_store_u8(obj_ptr +
                   static_cast<uint32_t>(ISAAC_RENDER_SHELL_6EF590_WORD_B_OFF) +
                   1u,
               0xffu);
  map_store_u32(
      obj_ptr +
          static_cast<uint32_t>(ISAAC_RENDER_SHELL_6EF590_TAIL_ZERO_DWORD_OFF),
      0u);
  map_store_u32(
      obj_ptr +
          static_cast<uint32_t>(ISAAC_RENDER_SHELL_6EF590_TAIL_NEG_DWORD_OFF),
      0xffffffffu);
  /* VA 0x006ef71e / 0x006ef776: RECAPTURED container ranges drive the
     destroy loops and the grow gates. Never folded to the zeroes above. */
  const int32_t clear_a = isaac_render_shell_6ef590_clear_loop_count(
      vec_a_begin_after, vec_a_end_after);
  if (clear_a > 0) {
    dtor_calls += clear_a;
  }
  map_store_u32(obj_ptr + ISAAC_RENDER_SHELL_6EF590_VEC_A_OFF + 4u,
                vec_a_begin_after);
  const int32_t clear_b = isaac_render_shell_6ef590_clear_loop_count(
      vec_b_begin_after, vec_b_end_after);
  if (clear_b > 0) {
    dtor_calls += clear_b;
  }
  map_store_u32(obj_ptr + ISAAC_RENDER_SHELL_6EF590_VEC_B_OFF + 4u,
                vec_b_begin_after);
  /* VA 0x006ef7f1â€¦0x006ef7fb: tree head self-links restored, size zeroed. */
  const uint32_t head = map_load_u32(obj_ptr +
                                     ISAAC_RENDER_SHELL_6EF590_MAP_OFF);
  if (head != 0u) {
    map_store_u32(head + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_PARENT_OFF),
                  head);
    map_store_u32(head + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_LEFT_OFF),
                  head);
    map_store_u32(head + static_cast<uint32_t>(ISAAC_RENDER_SHELL_MAP_RIGHT_OFF),
                  head);
  }
  map_store_u32(obj_ptr + ISAAC_RENDER_SHELL_6EF590_MAP_SIZE_OFF, 0u);
  isaac_render_shell_6ef590_late_neg_fill(obj_ptr);
  isaac_render_shell_6ef590_grid_second_pass(obj_ptr);
  isaac_render_shell_6ef590_tail_zero(obj_ptr);
  if (out_dtor_calls != nullptr) {
    *out_dtor_calls = dtor_calls;
  }
  return obj_ptr;
}

extern "C" int32_t isaac_render_shell_6ef590_pure_complete(void) { return 0; }

extern "C" uint32_t isaac_render_shell_6ef590_host_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_6EF590_VA);
}
extern "C" uint32_t isaac_render_shell_6ef590_desc_size(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_6EF590_DESC_SIZE);
}
extern "C" uint32_t isaac_render_shell_6ef590_dtor_host_va(void) {
  return ISAAC_RENDER_SHELL_HOST_4D6EE0_VA;
}
extern "C" uint32_t isaac_render_shell_6ef590_grow_host_va(void) {
  return ISAAC_RENDER_SHELL_HOST_708EB0_VA;
}
extern "C" uint32_t isaac_render_shell_6ef590_tree_clear_host_va(void) {
  return ISAAC_RENDER_SHELL_HOST_424540_VA;
}
extern "C" uint32_t isaac_render_shell_6ef590_fail_iat_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_6EF590_FAIL_IAT_VA);
}
extern "C" uint32_t isaac_render_shell_6ef590_hole_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_6EF590_HOLE_OFF);
}
extern "C" uint32_t isaac_render_shell_6ef590_hole_len(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_6EF590_HOLE_LEN);
}

/* ---- ABI v27: mode-44 / GetRoomByIdx cluster ---- */

extern "C" int32_t isaac_render_shell_74f690_stage_reload_needed(
    int32_t entry_plan) {
  /* Only the GETROOM plan crosses the host call at VA 0x0074f6cf before the
     stage reload at VA 0x0074f6f0. */
  return entry_plan == ISAAC_RENDER_SHELL_74F690_PLAN_GETROOM ? 1 : 0;
}

extern "C" uint32_t isaac_render_shell_74f690_stage_reload_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_74F690_STAGE_RELOAD_VA);
}

extern "C" uint32_t isaac_render_shell_74f690_resolve_post(
    uint32_t game_ptr, int32_t mode_26584, int32_t room_idx,
    int32_t stage_entry, int32_t stage_after, uint32_t stage_type_4,
    uint32_t flag_183a0_w, int32_t room_desc_dword0,
    int32_t room_desc_field10_nz, float f_183b0, float f_18654,
    int32_t field14) {
  const uint8_t flag_183a0 = static_cast<uint8_t>(flag_183a0_w & 0xffu);
  /* Entry gate uses the PRE-call stage read at VA 0x0074f6ad. */
  const int32_t entry = isaac_render_shell_74f690_entry_plan(
      mode_26584, room_idx, stage_entry, flag_183a0);
  if (entry == ISAAC_RENDER_SHELL_74F690_PLAN_TYPE4) {
    return stage_type_4;
  }
  if (entry == ISAAC_RENDER_SHELL_74F690_PLAN_CONST4) {
    return static_cast<uint32_t>(ISAAC_RENDER_SHELL_74F690_CONST_TYPE4);
  }
  /* VA 0x0074f6d4â€¦0x0074f6ed: clamp from the RETURNED descriptor. When
     desc+0x10 is zero the PE leaves ESI (and [ebp+8]) at the original idx. */
  const int32_t room = isaac_render_shell_74f690_final_room_idx(
      room_idx, flag_183a0, room_desc_dword0, room_desc_field10_nz);
  /* VA 0x0074f6f0: stage re-read AFTER the call. */
  const int32_t stage_dispatch =
      isaac_render_shell_74f690_stage_reload_needed(entry) != 0 ? stage_after
                                                                : stage_entry;
  const int32_t stage_plan =
      isaac_render_shell_74f690_stage_plan(stage_dispatch);
  if (stage_plan == ISAAC_RENDER_SHELL_74F690_STAGE_TYPE4) {
    return stage_type_4;
  }
  /* Float table inputs are indexed by the RESOLVED room index. */
  float fa = f_183b0;
  float fb = f_18654;
  if (game_ptr != 0u) {
    const uint32_t scaled = static_cast<uint32_t>(room) * 4u;
    fa = f32_load(game_ptr +
                  static_cast<uint32_t>(ISAAC_RENDER_SHELL_74F690_FLOAT_A_OFF) +
                  scaled);
    fb = f32_load(game_ptr +
                  static_cast<uint32_t>(ISAAC_RENDER_SHELL_74F690_FLOAT_B_OFF) +
                  scaled);
  }
  if (stage_plan == ISAAC_RENDER_SHELL_74F690_STAGE_WOMB) {
    const int32_t dist = isaac_render_shell_74f690_womb_distance(room, field14);
    if (isaac_render_shell_74f690_womb_near(dist) != 0) {
      return static_cast<uint32_t>(ISAAC_RENDER_SHELL_74F690_CONST_TYPE4);
    }
    return isaac_render_shell_74f690_float_table_type(fa, fb, 1);
  }
  return isaac_render_shell_74f690_float_table_type(fa, fb, 0);
}

extern "C" int32_t isaac_render_shell_740bc0_once_init_plan(int32_t guard_val,
                                                            int32_t tls_epoch) {
  /* VA 0x00740bf3: cmp eax,[edx+0xc]; jg once-init â€” signed. */
  return isaac_render_shell_740bc0_once_init_needed(guard_val, tls_epoch) != 0
             ? ISAAC_RENDER_SHELL_740BC0_ONCE_PLAN_HEADER
             : ISAAC_RENDER_SHELL_740BC0_ONCE_PLAN_SKIP;
}

extern "C" int32_t isaac_render_shell_740bc0_once_init_resume(
    int32_t guard_after) {
  /* VA 0x00740d50: cmp dword [0xc8108c], -1; jne body.
     guard_after is the value re-read AFTER the host header call. */
  return guard_after == ISAAC_RENDER_SHELL_740BC0_ONCE_GUARD_UNINIT
             ? ISAAC_RENDER_SHELL_740BC0_ONCE_RESUME_CONSTRUCT
             : ISAAC_RENDER_SHELL_740BC0_ONCE_RESUME_SKIP;
}

extern "C" uint32_t isaac_render_shell_740bc0_init_header_va(void) {
  return ISAAC_RENDER_SHELL_HOST_AEF29D_VA;
}

extern "C" uint32_t isaac_render_shell_740bc0_init_footer_va(void) {
  return ISAAC_RENDER_SHELL_HOST_AEF253_VA;
}

extern "C" uint32_t isaac_render_shell_740bc0_ctor_va(void) {
  return ISAAC_RENDER_SHELL_HOST_6EF590_VA;
}

extern "C" uint32_t isaac_render_shell_740bc0_atexit_va(void) {
  return ISAAC_RENDER_SHELL_HOST_ATEXIT_VA;
}

extern "C" uint32_t isaac_render_shell_740bc0_walk_entry_ptr_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_740BC0_WALK_ENTRY_PTR_OFF);
}

extern "C" uint32_t isaac_render_shell_740bc0_walk_find(uint32_t game_ptr,
                                                        int32_t room_count) {
  /* VA 0x00740c91: lea eax,[esi+0x24]; loop while ecx < edi (signed). */
  if (game_ptr == 0u || room_count <= 0) {
    return static_cast<uint32_t>(ISAAC_RENDER_SHELL_740BC0_WALK_NO_MATCH);
  }
  uint32_t entry =
      game_ptr + static_cast<uint32_t>(ISAAC_RENDER_SHELL_740BC0_WALK_START_OFF);
  for (int32_t n = 0; n < room_count; ++n) {
    /* VA 0x00740c94: cmp dword [eax-4], 0 */
    const uint32_t kind = map_load_u32(
        entry + static_cast<uint32_t>(
                    ISAAC_RENDER_SHELL_740BC0_WALK_KIND_OFF));
    if (kind == 0u) {
      /* VA 0x00740c9a: mov edx,[eax] â€” a pointer, then two fields through it.
         A null pointer would fault in the PE; the model treats it as no match
         at this entry and keeps walking (the loop bound is unchanged). */
      const uint32_t slot_ptr = map_load_u32(
          entry + static_cast<uint32_t>(
                      ISAAC_RENDER_SHELL_740BC0_WALK_ENTRY_PTR_OFF));
      if (slot_ptr != 0u) {
        const int32_t type_at8 = static_cast<int32_t>(map_load_u32(
            slot_ptr + static_cast<uint32_t>(
                           ISAAC_RENDER_SHELL_740BC0_WALK_PTR_TYPE_OFF)));
        const int32_t var_at10 = static_cast<int32_t>(map_load_u32(
            slot_ptr + static_cast<uint32_t>(
                           ISAAC_RENDER_SHELL_740BC0_WALK_PTR_VAR_OFF)));
        if (isaac_render_shell_740bc0_walk_match(0, type_at8, var_at10) != 0) {
          /* VA 0x00740cca: add eax,-0x10 â€” returned as a Game-relative off.
             Minimum reachable value is 0x24-0x10 = 0x14, so 0 is a safe
             no-match sentinel. */
          return (entry +
                  static_cast<uint32_t>(
                      ISAAC_RENDER_SHELL_740BC0_WALK_RESULT_DELTA)) -
                 game_ptr;
        }
      }
    }
    entry += static_cast<uint32_t>(ISAAC_RENDER_SHELL_740BC0_WALK_STRIDE);
  }
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_740BC0_WALK_NO_MATCH);
}

extern "C" int32_t isaac_render_shell_740bc0_current_recurse_idx(
    int32_t current_idx) {
  /* VA 0x00740c35: push edx, where edx = [this+0x18304]. */
  return current_idx;
}

extern "C" int32_t isaac_render_shell_740bc0_resolve_chain(
    uint32_t game_ptr, int32_t idx, const int32_t* dim_eff_seq,
    const int32_t* current_idx_seq, const uint32_t* slot_seq, int32_t seq_len,
    int32_t room_count, uint32_t* out_off, int32_t* out_steps) {
  int32_t steps = 0;
  int32_t kind = ISAAC_RENDER_SHELL_740BC0_KIND_EMPTY;
  uint32_t off = 0u;
  int32_t resolved = 0;
  int32_t cur_idx_arg = idx;
  const int32_t depth_cap =
      static_cast<int32_t>(ISAAC_RENDER_SHELL_740BC0_MAX_RECURSE_DEPTH);
  const int32_t limit = seq_len < depth_cap ? seq_len : depth_cap;
  while (steps < limit) {
    /* Every entry is a fresh call: its dim / current idx / grid slot are
       recaptured samples, never carried over from the previous frame. */
    const int32_t dim_eff = dim_eff_seq[steps];
    const int32_t current_idx = current_idx_seq[steps];
    const uint32_t slot = slot_seq[steps];
    const int32_t plan = isaac_render_shell_740bc0_entry_plan(
        dim_eff, cur_idx_arg, current_idx);
    ++steps;
    if (plan == ISAAC_RENDER_SHELL_740BC0_PLAN_RECURSE_CURRENT) {
      cur_idx_arg = isaac_render_shell_740bc0_current_recurse_idx(current_idx);
      continue;
    }
    if (plan == ISAAC_RENDER_SHELL_740BC0_PLAN_RECURSE_SPECIAL) {
      cur_idx_arg = isaac_render_shell_740bc0_special_recurse_idx();
      continue;
    }
    if (plan == ISAAC_RENDER_SHELL_740BC0_PLAN_WALK) {
      off = isaac_render_shell_740bc0_walk_find(game_ptr, room_count);
      kind = off == static_cast<uint32_t>(ISAAC_RENDER_SHELL_740BC0_WALK_NO_MATCH)
                 ? ISAAC_RENDER_SHELL_740BC0_KIND_EMPTY
                 : ISAAC_RENDER_SHELL_740BC0_KIND_GAME_OFF;
      resolved = 1;
      break;
    }
    kind = isaac_render_shell_740bc0_resolve_kind(dim_eff, cur_idx_arg,
                                                  current_idx, slot);
    off = isaac_render_shell_740bc0_resolve_game_off(dim_eff, cur_idx_arg,
                                                     current_idx, slot);
    resolved = 1;
    break;
  }
  if (resolved == 0) {
    /* Ran out of supplied samples mid-recursion: report HOST rather than
       inventing a result from stale state. */
    kind = ISAAC_RENDER_SHELL_740BC0_KIND_HOST;
    off = 0u;
  }
  if (out_off != nullptr) {
    *out_off = off;
  }
  if (out_steps != nullptr) {
    *out_steps = steps;
  }
  return kind;
}

extern "C" uint32_t isaac_render_shell_409cb0_dat_c71678_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_409CB0_DAT_C71678_VA);
}

extern "C" uint32_t isaac_render_shell_409cb0_dat_c33910_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_409CB0_DAT_C33910_VA);
}

extern "C" uint32_t isaac_render_shell_409cb0_dat_c7b640_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_409CB0_DAT_C7B640_VA);
}

extern "C" uint32_t isaac_render_shell_409cb0_dat_c7b644_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_409CB0_DAT_C7B644_VA);
}

extern "C" uint32_t isaac_render_shell_409cb0_deg2rad_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_409CB0_DEG2RAD_VA);
}

extern "C" uint32_t isaac_render_shell_409cb0_cam_x_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_409CB0_CAM_X_OFF);
}

extern "C" uint32_t isaac_render_shell_409cb0_cam_y_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_409CB0_CAM_Y_OFF);
}

/* ---- opaque_call_0040c6f0 color-ring pure body â€” ABI v23 (VA 0x0040c6f0) ---- */

extern "C" uint32_t isaac_render_shell_40c6f0_ring_mask(uint32_t dat_c78dc0,
                                                       uint32_t dat_c78dbc) {
  /* VA 0x0040c6f6â€¦0x0040c70b: mov ecx,[c78dc0]; add ecx,[c78dbc]; dec ecx */
  return (dat_c78dc0 + dat_c78dbc) - 1u;
}

extern "C" uint32_t isaac_render_shell_40c6f0_cursor_dec(uint32_t dat_c78db8) {
  /* VA 0x0040c705â€¦0x0040c711: mov edx,[c78db8]; dec edx */
  return dat_c78db8 - 1u;
}

extern "C" uint32_t isaac_render_shell_40c6f0_index(uint32_t dat_c78dc0,
                                                   uint32_t dat_c78dbc,
                                                   uint32_t dat_c78db8) {
  /* VA 0x0040c711â€¦0x0040c714: and edx, ecx */
  return isaac_render_shell_40c6f0_cursor_dec(dat_c78db8) &
         isaac_render_shell_40c6f0_ring_mask(dat_c78dc0, dat_c78dbc);
}

extern "C" uint32_t isaac_render_shell_40c6f0_lookup(uint32_t table_base,
                                                    uint32_t index) {
  /* VA 0x0040c714: mov eax, [eax + edx*4]  (table_base + index*4) */
  if (table_base == 0u) {
    return 0u;
  }
  return map_load_u32(table_base + index * 4u);
}

extern "C" uint32_t isaac_render_shell_40c6f0_compute(uint32_t dat_c78db4,
                                                     uint32_t dat_c78db8,
                                                     uint32_t dat_c78dbc,
                                                     uint32_t dat_c78dc0) {
  /* Exact PE 0x0040c6f0â€¦0x0040c71a complete body; zero nested calls. */
  const uint32_t index =
      isaac_render_shell_40c6f0_index(dat_c78dc0, dat_c78dbc, dat_c78db8);
  return isaac_render_shell_40c6f0_lookup(dat_c78db4, index);
}

extern "C" int32_t isaac_render_shell_40c6f0_plan(void) {
  return ISAAC_RENDER_SHELL_40C6F0_PLAN_PURE;
}

extern "C" int32_t isaac_render_shell_40c6f0_pure_complete(void) {
  return 1;
}

extern "C" uint32_t isaac_render_shell_40c6f0_dat_c78db4_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_40C6F0_DAT_C78DB4_VA);
}

extern "C" uint32_t isaac_render_shell_40c6f0_dat_c78db8_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_40C6F0_DAT_C78DB8_VA);
}

extern "C" uint32_t isaac_render_shell_40c6f0_dat_c78dbc_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_40C6F0_DAT_C78DBC_VA);
}

extern "C" uint32_t isaac_render_shell_40c6f0_dat_c78dc0_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_40C6F0_DAT_C78DC0_VA);
}

extern "C" int32_t isaac_render_shell_pure_helpers_abi_version(void) {
  return ISAAC_RENDER_SHELL_PURE_HELPERS_ABI_VERSION;
}

/* ABI v32–v38 restorations (header already at 38). Reconstructed from
   render_shell_pure_helpers.h signatures + render-shell-pure-model.mjs
   oracles. Not a Read-tool dump. */

extern "C" uint32_t isaac_render_shell_4098a0_zero_seed_assert_count(void) {
  return (uint32_t)ISAAC_RENDER_SHELL_4098A0_ZERO_SEED_ASSERT_COUNT;
}

extern "C" uint32_t isaac_render_shell_684fc0_cap_off(void) {
  return (uint32_t)ISAAC_RENDER_SHELL_684FC0_CAP_OFF;
}
extern "C" uint32_t isaac_render_shell_684fc0_cursor_off(void) {
  return (uint32_t)ISAAC_RENDER_SHELL_684FC0_CURSOR_OFF;
}
extern "C" uint32_t isaac_render_shell_684fc0_host_va(void) {
  return (uint32_t)ISAAC_RENDER_SHELL_HOST_684FC0_VA;
}
extern "C" uint32_t isaac_render_shell_684fc0_write_idx_off(void) {
  return (uint32_t)ISAAC_RENDER_SHELL_684FC0_WRITE_IDX_OFF;
}
extern "C" uint32_t isaac_render_shell_684fc0_page_table_off(void) {
  return (uint32_t)ISAAC_RENDER_SHELL_684FC0_PAGE_TABLE_OFF;
}
extern "C" uint32_t isaac_render_shell_684fc0_slot(uint32_t cursor, uint32_t write_idx) {
  return (cursor + write_idx - 1u);
}
extern "C" uint32_t isaac_render_shell_684fc0_page_idx(uint32_t cursor, uint32_t write_idx,
                                                      uint32_t capacity) {
  const uint32_t slot = isaac_render_shell_684fc0_slot(cursor, write_idx);
  return ((capacity - 1u) & (slot >> 2));
}
extern "C" uint32_t isaac_render_shell_684fc0_slot_in_page(uint32_t cursor, uint32_t write_idx) {
  return isaac_render_shell_684fc0_slot(cursor, write_idx) &
         (uint32_t)ISAAC_RENDER_SHELL_A140C0_ALIGN_MASK;
}
extern "C" uint32_t isaac_render_shell_684fc0_page_off(uint32_t cursor, uint32_t write_idx,
                                                      uint32_t capacity) {
  return isaac_render_shell_684fc0_page_idx(cursor, write_idx, capacity) * 4u;
}
extern "C" uint32_t isaac_render_shell_684fc0_slot_addr(uint32_t page_base, uint32_t cursor,
                                                       uint32_t write_idx, uint32_t capacity) {
  (void)capacity;
  if (page_base == 0u) return 0u;
  return page_base + isaac_render_shell_684fc0_slot_in_page(cursor, write_idx) * 4u;
}
extern "C" uint32_t isaac_render_shell_684fc0_peek(uint32_t page_base, uint32_t cursor,
                                                  uint32_t write_idx, uint32_t capacity) {
  const uint32_t addr =
      isaac_render_shell_684fc0_slot_addr(page_base, cursor, write_idx, capacity);
  if (addr == 0u) return 0u;
  return map_load_u32(addr);
}

extern "C" int32_t isaac_render_shell_827bc0_pre_gate(int32_t receiver_field_8,
                                                     int32_t nested_room_type_10) {
  return (receiver_field_8 == (int32_t)ISAAC_RENDER_SHELL_827BC0_FIELD8_TARGET &&
          nested_room_type_10 == (int32_t)ISAAC_RENDER_SHELL_827BC0_NEST_TYPE_TARGET)
             ? 1
             : 0;
}
extern "C" int32_t isaac_render_shell_827bc0_entry_plan(int32_t receiver_field_8,
                                                       int32_t nested_room_type_10) {
  return isaac_render_shell_827bc0_pre_gate(receiver_field_8, nested_room_type_10) != 0
             ? (int32_t)ISAAC_RENDER_SHELL_827BC0_PLAN_HOST
             : (int32_t)ISAAC_RENDER_SHELL_827BC0_PLAN_FALSE;
}
extern "C" int32_t isaac_render_shell_827bc0_resume_al(uint32_t host_74ea50_al) {
  return (host_74ea50_al & 0xffu) != 0u ? 1 : 0;
}
extern "C" int32_t isaac_render_shell_827bc0_eval_al(int32_t receiver_field_8,
                                                    int32_t nested_room_type_10,
                                                    uint32_t host_74ea50_al) {
  if (isaac_render_shell_827bc0_pre_gate(receiver_field_8, nested_room_type_10) == 0) {
    return 0;
  }
  return isaac_render_shell_827bc0_resume_al(host_74ea50_al);
}
extern "C" uint32_t isaac_render_shell_827bc0_host_va(void) {
  return (uint32_t)ISAAC_RENDER_SHELL_HOST_827BC0_VA;
}

extern "C" int32_t isaac_render_shell_a140c0_pre_gate(uint32_t shader_id, uint32_t bound_isnil,
                                                     uint32_t bound_key, uint32_t bound_ptr,
                                                     uint32_t map_root_c379bc) {
  return isaac_render_shell_a14050_chain_plan(shader_id, bound_isnil, bound_key, bound_ptr,
                                              map_root_c379bc) ==
                 ISAAC_RENDER_SHELL_A14050_CHAIN_PLAN_FOUND
             ? 1
             : 0;
}
extern "C" int32_t isaac_render_shell_a140c0_bind_ok(uint32_t value_at_ptr,
                                                    uint32_t byte_at_ptr_plus_4) {
  return isaac_render_shell_a14050_bind_ok(value_at_ptr, byte_at_ptr_plus_4);
}
extern "C" int32_t isaac_render_shell_a140c0_grow_needed(uint32_t cursor, uint32_t write_idx,
                                                        uint32_t capacity) {
  const uint32_t sum = cursor + write_idx;
  if ((sum & (uint32_t)ISAAC_RENDER_SHELL_A140C0_ALIGN_MASK) != 0u) return 0;
  const uint32_t need = (cursor + 4u) >> 2;
  return capacity <= need ? 1 : 0;
}
extern "C" uint32_t isaac_render_shell_a140c0_write_mask(uint32_t capacity) {
  return capacity * 4u - 1u;
}
extern "C" uint32_t isaac_render_shell_a140c0_write_index(uint32_t write_idx, uint32_t capacity) {
  return write_idx & isaac_render_shell_a140c0_write_mask(capacity);
}
extern "C" uint32_t isaac_render_shell_a140c0_slot(uint32_t cursor, uint32_t write_idx,
                                                  uint32_t capacity) {
  return isaac_render_shell_a140c0_write_index(write_idx, capacity) + cursor;
}
extern "C" uint32_t isaac_render_shell_a140c0_page_off(uint32_t cursor, uint32_t write_idx,
                                                      uint32_t capacity) {
  const uint32_t slot = isaac_render_shell_a140c0_slot(cursor, write_idx, capacity);
  const uint32_t page_idx = ((capacity - 1u) & (slot >> 2));
  return page_idx * 4u;
}
extern "C" uint32_t isaac_render_shell_a140c0_slot_in_page(uint32_t cursor, uint32_t write_idx,
                                                          uint32_t capacity) {
  return isaac_render_shell_a140c0_slot(cursor, write_idx, capacity) &
         (uint32_t)ISAAC_RENDER_SHELL_A140C0_ALIGN_MASK;
}
extern "C" int32_t isaac_render_shell_a140c0_page_present(uint32_t page_ptr) {
  return page_ptr != 0u ? 1 : 0;
}
extern "C" int32_t isaac_render_shell_a140c0_entry_plan(
    uint32_t shader_id, uint32_t bound_isnil, uint32_t bound_key, uint32_t bound_ptr,
    uint32_t map_root_c379bc, uint32_t value_at_ptr, uint32_t byte_at_ptr_plus_4, uint32_t cursor,
    uint32_t write_idx, uint32_t capacity, uint32_t page_ptr) {
  if (isaac_render_shell_a140c0_pre_gate(shader_id, bound_isnil, bound_key, bound_ptr,
                                         map_root_c379bc) == 0) {
    return ISAAC_RENDER_SHELL_A140C0_PLAN_FALSE;
  }
  if (isaac_render_shell_a140c0_bind_ok(value_at_ptr, byte_at_ptr_plus_4) == 0) {
    return ISAAC_RENDER_SHELL_A140C0_PLAN_FALSE;
  }
  if (isaac_render_shell_a140c0_grow_needed(cursor, write_idx, capacity) != 0) {
    return ISAAC_RENDER_SHELL_A140C0_PLAN_GROW;
  }
  if (isaac_render_shell_a140c0_page_present(page_ptr) == 0) {
    return ISAAC_RENDER_SHELL_A140C0_PLAN_ALLOC;
  }
  return ISAAC_RENDER_SHELL_A140C0_PLAN_PURE;
}
extern "C" int32_t isaac_render_shell_a140c0_grow_resume_plan(uint32_t page_ptr_after) {
  return isaac_render_shell_a140c0_page_present(page_ptr_after) != 0
             ? (int32_t)ISAAC_RENDER_SHELL_A140C0_PLAN_PURE
             : (int32_t)ISAAC_RENDER_SHELL_A140C0_PLAN_ALLOC;
}
extern "C" int32_t isaac_render_shell_a140c0_ring_apply(uint32_t page_base, uint32_t slot_in_page,
                                                       uint32_t old_c379b8, uint32_t new_value,
                                                       uint32_t cursor, uint32_t* out_c379b8,
                                                       uint32_t* out_cursor) {
  const uint32_t slot = slot_in_page & (uint32_t)ISAAC_RENDER_SHELL_A140C0_ALIGN_MASK;
  if (page_base != 0u) {
    map_store_u32(page_base + slot * 4u, old_c379b8);
  }
  if (out_c379b8 != nullptr) *out_c379b8 = new_value;
  if (out_cursor != nullptr) *out_cursor = cursor + 1u;
  return 1;
}
extern "C" int32_t isaac_render_shell_a140c0_eval_al(int32_t entry_plan) {
  return entry_plan == ISAAC_RENDER_SHELL_A140C0_PLAN_FALSE ? 0 : 1;
}
extern "C" uint32_t isaac_render_shell_a140c0_host_va(void) {
  return (uint32_t)ISAAC_RENDER_SHELL_HOST_A140C0_VA;
}
extern "C" uint32_t isaac_render_shell_a140c0_grow_host_va(void) {
  return (uint32_t)ISAAC_RENDER_SHELL_HOST_44BE50_VA;
}
extern "C" uint32_t isaac_render_shell_a140c0_alloc_host_va(void) {
  return (uint32_t)ISAAC_RENDER_SHELL_HOST_ALLOC_VA;
}
extern "C" uint32_t isaac_render_shell_a140c0_alloc_size(void) {
  return (uint32_t)ISAAC_RENDER_SHELL_A140C0_ALLOC_SIZE;
}
extern "C" uint32_t isaac_render_shell_a140c0_ring_this_va(void) {
  return (uint32_t)ISAAC_RENDER_SHELL_A140C0_RING_THIS_VA;
}
extern "C" uint32_t isaac_render_shell_a140c0_page_table_va(void) {
  return (uint32_t)ISAAC_RENDER_SHELL_A140C0_PAGE_TABLE_VA;
}
extern "C" uint32_t isaac_render_shell_a140c0_cap_va(void) {
  return (uint32_t)ISAAC_RENDER_SHELL_A140C0_CAP_VA;
}
extern "C" uint32_t isaac_render_shell_a140c0_write_idx_va(void) {
  return (uint32_t)ISAAC_RENDER_SHELL_A140C0_WRITE_IDX_VA;
}
extern "C" uint32_t isaac_render_shell_a140c0_cursor_va(void) {
  return (uint32_t)ISAAC_RENDER_SHELL_A140C0_CURSOR_VA;
}
extern "C" uint32_t isaac_render_shell_a140c0_name_color_va(void) {
  return (uint32_t)ISAAC_RENDER_SHELL_A140C0_NAME_COLOR_VA;
}
extern "C" uint32_t isaac_render_shell_a140c0_name_color_tex_va(void) {
  return (uint32_t)ISAAC_RENDER_SHELL_A140C0_NAME_COLOR_TEX_VA;
}
extern "C" uint32_t isaac_render_shell_a140c0_name_indexed_va(void) {
  return (uint32_t)ISAAC_RENDER_SHELL_A140C0_NAME_INDEXED_VA;
}

extern "C" int32_t isaac_render_shell_a14200_empty_needed(uint32_t cursor) {
  return cursor == 0u ? 1 : 0;
}
extern "C" int32_t isaac_render_shell_a14200_entry_plan(uint32_t cursor) {
  return isaac_render_shell_a14200_empty_needed(cursor) != 0
             ? (int32_t)ISAAC_RENDER_SHELL_A14200_PLAN_EMPTY_LOG
             : (int32_t)ISAAC_RENDER_SHELL_A14200_PLAN_PURE;
}
extern "C" int32_t isaac_render_shell_a14200_pop_apply(uint32_t cursor, uint32_t write_idx,
                                                      uint32_t peeked, uint32_t* out_c379b8,
                                                      uint32_t* out_cursor,
                                                      uint32_t* out_write_idx) {
  const uint32_t after = cursor - 1u;
  if (out_c379b8 != nullptr) *out_c379b8 = peeked;
  if (out_cursor != nullptr) *out_cursor = after;
  if (out_write_idx != nullptr) *out_write_idx = (after == 0u) ? 0u : write_idx;
  return after == 0u ? 1 : 0;
}
extern "C" uint32_t isaac_render_shell_a14200_host_va(void) {
  return (uint32_t)ISAAC_RENDER_SHELL_HOST_A14200_VA;
}
extern "C" uint32_t isaac_render_shell_a14200_empty_log_va(void) {
  return (uint32_t)ISAAC_RENDER_SHELL_HOST_A112C0_VA;
}
extern "C" uint32_t isaac_render_shell_a14200_empty_msg_va(void) {
  return (uint32_t)ISAAC_RENDER_SHELL_A14200_EMPTY_MSG_VA;
}
extern "C" uint32_t isaac_render_shell_a14200_empty_msg_level(void) {
  return (uint32_t)ISAAC_RENDER_SHELL_A14200_EMPTY_MSG_LEVEL;
}
extern "C" uint32_t isaac_render_shell_a14200_c379b8_va(void) {
  return (uint32_t)ISAAC_RENDER_SHELL_A14200_C379B8_VA;
}

extern "C" int32_t isaac_render_shell_a14250_entry_plan(void) {
  return ISAAC_RENDER_SHELL_A14250_PLAN_HOST;
}
extern "C" uint32_t isaac_render_shell_a14250_host_va(void) {
  return (uint32_t)ISAAC_RENDER_SHELL_HOST_A14250_VA;
}
extern "C" uint32_t isaac_render_shell_a14250_map_this_va(void) {
  return (uint32_t)ISAAC_RENDER_SHELL_A14250_MAP_THIS_VA;
}
extern "C" uint32_t isaac_render_shell_a14250_resume(uint32_t pair_node) {
  return pair_node + (uint32_t)ISAAC_RENDER_SHELL_A14250_VALUE_OFF;
}
extern "C" uint32_t isaac_render_shell_a14250_value_off(void) {
  return (uint32_t)ISAAC_RENDER_SHELL_A14250_VALUE_OFF;
}

extern "C" int32_t isaac_render_shell_a14330_lookup_hit(uint32_t node_isnil, uint32_t search_key,
                                                       uint32_t node_key) {
  if ((node_isnil & 0xffu) != 0u) return 0;
  return search_key >= node_key ? 1 : 0;
}
extern "C" uint32_t isaac_render_shell_a14330_value_ptr(uint32_t node_ptr) {
  return node_ptr + (uint32_t)ISAAC_RENDER_SHELL_MAP_VALUE_OFF;
}
extern "C" int32_t isaac_render_shell_a14330_map_size_full(uint32_t map_size) {
  return map_size == (uint32_t)ISAAC_RENDER_SHELL_A14330_SIZE_FULL ? 1 : 0;
}
extern "C" int32_t isaac_render_shell_a14330_residual_plan(uint32_t node_isnil, uint32_t search_key,
                                                          uint32_t node_key, uint32_t map_size) {
  if (isaac_render_shell_a14330_lookup_hit(node_isnil, search_key, node_key) != 0) {
    return ISAAC_RENDER_SHELL_A14330_PLAN_FOUND;
  }
  if (isaac_render_shell_a14330_map_size_full(map_size) != 0) {
    return ISAAC_RENDER_SHELL_A14330_PLAN_THROW;
  }
  return ISAAC_RENDER_SHELL_A14330_PLAN_INSERT;
}
extern "C" void isaac_render_shell_a14330_node_init(uint32_t node_ptr, uint32_t map_head,
                                                    uint32_t key) {
  map_store_u32(node_ptr + (uint32_t)ISAAC_RENDER_SHELL_MAP_KEY_OFF, key);
  map_store_u32(node_ptr + (uint32_t)ISAAC_RENDER_SHELL_MAP_VALUE_OFF, 0u);
  map_store_u32(node_ptr + (uint32_t)ISAAC_RENDER_SHELL_MAP_LEFT_OFF, map_head);
  map_store_u32(node_ptr + (uint32_t)ISAAC_RENDER_SHELL_MAP_PARENT_OFF, map_head);
  map_store_u32(node_ptr + (uint32_t)ISAAC_RENDER_SHELL_MAP_RIGHT_OFF, map_head);
  map_store_u8(node_ptr + (uint32_t)ISAAC_RENDER_SHELL_MAP_COLOR_OFF, 0u);
  map_store_u8(node_ptr + (uint32_t)ISAAC_RENDER_SHELL_MAP_ISNIL_OFF, 0u);
}
extern "C" uint32_t isaac_render_shell_a14330_host_va(void) {
  return (uint32_t)ISAAC_RENDER_SHELL_HOST_A14330_VA;
}
extern "C" uint32_t isaac_render_shell_a14330_next_va(void) {
  return (uint32_t)ISAAC_RENDER_SHELL_A14330_NEXT_VA;
}
extern "C" uint32_t isaac_render_shell_a14330_alloc_size(void) {
  return (uint32_t)ISAAC_RENDER_SHELL_A14330_ALLOC_SIZE;
}

extern "C" int32_t isaac_render_shell_a143f0_lookup_hit(uint32_t node_isnil, uint32_t search_key,
                                                       uint32_t node_key) {
  if ((node_isnil & 0xffu) != 0u) return 0;
  return search_key >= node_key ? 1 : 0;
}
extern "C" int32_t isaac_render_shell_a143f0_map_size_full(uint32_t map_size) {
  return map_size == (uint32_t)ISAAC_RENDER_SHELL_A143F0_SIZE_FULL ? 1 : 0;
}
extern "C" int32_t isaac_render_shell_a143f0_residual_plan(uint32_t node_isnil, uint32_t search_key,
                                                          uint32_t node_key, uint32_t map_size) {
  if (isaac_render_shell_a143f0_lookup_hit(node_isnil, search_key, node_key) != 0) {
    return ISAAC_RENDER_SHELL_A143F0_PLAN_FOUND;
  }
  if (isaac_render_shell_a143f0_map_size_full(map_size) != 0) {
    return ISAAC_RENDER_SHELL_A143F0_PLAN_THROW;
  }
  return ISAAC_RENDER_SHELL_A143F0_PLAN_INSERT;
}
extern "C" void isaac_render_shell_a143f0_node_init(uint32_t node_ptr, uint32_t map_head,
                                                    uint32_t key) {
  /* VA 0x00a144b0..0x00a144c2: key dword, value BYTE (not dword),
     left/parent/right = map_head, word color+isnil = 0. */
  map_store_u32(node_ptr + (uint32_t)ISAAC_RENDER_SHELL_MAP_KEY_OFF, key);
  map_store_u8(node_ptr + (uint32_t)ISAAC_RENDER_SHELL_MAP_VALUE_OFF, 0u);
  map_store_u32(node_ptr + (uint32_t)ISAAC_RENDER_SHELL_MAP_LEFT_OFF, map_head);
  map_store_u32(node_ptr + (uint32_t)ISAAC_RENDER_SHELL_MAP_PARENT_OFF, map_head);
  map_store_u32(node_ptr + (uint32_t)ISAAC_RENDER_SHELL_MAP_RIGHT_OFF, map_head);
  map_store_u8(node_ptr + (uint32_t)ISAAC_RENDER_SHELL_MAP_COLOR_OFF, 0u);
  map_store_u8(node_ptr + (uint32_t)ISAAC_RENDER_SHELL_MAP_ISNIL_OFF, 0u);
}
extern "C" void isaac_render_shell_a143f0_found_pair(uint32_t pair_ptr, uint32_t node) {
  map_store_u32(pair_ptr, node);
  map_store_u8(pair_ptr + (uint32_t)ISAAC_RENDER_SHELL_A143F0_PAIR_INSERTED_OFF,
               (uint8_t)ISAAC_RENDER_SHELL_A143F0_INSERTED_FOUND);
}
extern "C" void isaac_render_shell_a143f0_insert_pair(uint32_t pair_ptr, uint32_t node) {
  map_store_u32(pair_ptr, node);
  map_store_u8(pair_ptr + (uint32_t)ISAAC_RENDER_SHELL_A143F0_PAIR_INSERTED_OFF,
               (uint8_t)ISAAC_RENDER_SHELL_A143F0_INSERTED_INSERT);
}
extern "C" uint32_t isaac_render_shell_a143f0_host_va(void) {
  return (uint32_t)ISAAC_RENDER_SHELL_HOST_A143F0_VA;
}
extern "C" uint32_t isaac_render_shell_a143f0_next_va(void) {
  return (uint32_t)ISAAC_RENDER_SHELL_A143F0_NEXT_VA;
}
extern "C" uint32_t isaac_render_shell_a143f0_alloc_size(void) {
  return (uint32_t)ISAAC_RENDER_SHELL_A143F0_ALLOC_SIZE;
}
extern "C" uint32_t isaac_render_shell_a143f0_pair_inserted_off(void) {
  return (uint32_t)ISAAC_RENDER_SHELL_A143F0_PAIR_INSERTED_OFF;
}

/* ===========================================================================
 * FUN_00a145e0 scalar deleting dtor — ABI v39
 *
 * Vtable 0xb81bac slot +0x00; virtual dtor body a149a0 is slot +0x04.
 * Body VA 0x00a145e0..0x00a14616 (ret 4; int3 pad to 0xa14620):
 *   [esi] = 0xb81bac ; call a149a0(esi) ; call 4149d0(esi+0x40)
 *   call a15310(esi+0x34) ; test byte [ebp+8], 1 ; je skip
 *   push 0x4c; push esi; call aef15c ; skip: eax = esi; ret 4
 * Zero direct E8 sites whole .text (only vtable-indirect). The nested
 * dtors (a149a0 / 4149d0 / a15310) and the sized free (aef15c) stay
 * host; this export set pins the typed deleting-dtor plan the host
 * must execute. Evidence: section-notes/render-shell-v39/.
 * =========================================================================== */

extern "C" int32_t isaac_render_shell_a145e0_delete_needed(uint32_t delete_flag) {
  /* VA 0x00a14601 `f6 45 08 01` — Grp3 Eb,Ib: BIT 0 of the LOW BYTE of
     the stack arg, so the wide value 0x100 does NOT free and 0x101 does. */
  return ((delete_flag & 0xffu) & 1u) != 0u ? 1 : 0;
}

extern "C" void isaac_render_shell_a145e0_vftable_store(uint32_t this_ptr) {
  /* VA 0x00a145e6: mov dword ptr [esi], 0xb81bac — unconditional, first
     instruction of the meaningful body. */
  map_store_u32(this_ptr, (uint32_t)ISAAC_RENDER_SHELL_A145E0_VTABLE_VA);
}

extern "C" uint32_t isaac_render_shell_a145e0_call_count(void) {
  return (uint32_t)ISAAC_RENDER_SHELL_A145E0_CALL_COUNT;
}

extern "C" uint32_t isaac_render_shell_a145e0_call_this_off(uint32_t index) {
  /* PE order (VA 0x00a145ec / 0x00a145f1 / 0x00a145f9): self(+0),
     vector +0x40, vector +0x34. If/else chain (no switch jump table):
     wasm switch tables land near 0x500 where the test suite writes
     scratch floats, and a clobbered table would corrupt the result. */
  if (index == 0u) {
    return (uint32_t)ISAAC_RENDER_SHELL_A145E0_CALL_THIS_OFF_0;
  }
  if (index == 1u) {
    return (uint32_t)ISAAC_RENDER_SHELL_A145E0_CALL_THIS_OFF_1;
  }
  if (index == 2u) {
    return (uint32_t)ISAAC_RENDER_SHELL_A145E0_CALL_THIS_OFF_2;
  }
  return 0u;
}

extern "C" uint32_t isaac_render_shell_a145e0_call_host_va(uint32_t index) {
  /* Same if/else chain rationale as call_this_off (see above). */
  if (index == 0u) {
    return (uint32_t)ISAAC_RENDER_SHELL_A145E0_CALL_HOST_VA_0;
  }
  if (index == 1u) {
    return (uint32_t)ISAAC_RENDER_SHELL_A145E0_CALL_HOST_VA_1;
  }
  if (index == 2u) {
    return (uint32_t)ISAAC_RENDER_SHELL_A145E0_CALL_HOST_VA_2;
  }
  return 0u;
}

extern "C" uint32_t isaac_render_shell_a145e0_vtable_va(void) {
  return (uint32_t)ISAAC_RENDER_SHELL_A145E0_VTABLE_VA;
}

extern "C" uint32_t isaac_render_shell_a145e0_free_size(void) {
  return (uint32_t)ISAAC_RENDER_SHELL_A145E0_FREE_SIZE;
}

extern "C" uint32_t isaac_render_shell_a145e0_free_va(void) {
  return (uint32_t)ISAAC_RENDER_SHELL_A145E0_FREE_VA;
}

extern "C" uint32_t isaac_render_shell_a145e0_host_va(void) {
  return (uint32_t)ISAAC_RENDER_SHELL_A145E0_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a145e0_next_va(void) {
  return (uint32_t)ISAAC_RENDER_SHELL_A145E0_NEXT_VA;
}

/* Layout invariants recovered from the PE body. */
static_assert((uint32_t)ISAAC_RENDER_SHELL_A145E0_HOST_VA <
                  (uint32_t)ISAAC_RENDER_SHELL_A145E0_END_VA,
              "a145e0 dtor ret follows entry");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A145E0_NEXT_VA -
                      (uint32_t)ISAAC_RENDER_SHELL_A145E0_END_VA ==
                  0xa,
              "ret @ 0xa14616 then int3 pad to 0xa14620");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A145E0_CALL_THIS_OFF_0 !=
                      (uint32_t)ISAAC_RENDER_SHELL_A145E0_CALL_THIS_OFF_1 &&
                  (uint32_t)ISAAC_RENDER_SHELL_A145E0_CALL_THIS_OFF_0 !=
                      (uint32_t)ISAAC_RENDER_SHELL_A145E0_CALL_THIS_OFF_2 &&
                  (uint32_t)ISAAC_RENDER_SHELL_A145E0_CALL_THIS_OFF_1 !=
                      (uint32_t)ISAAC_RENDER_SHELL_A145E0_CALL_THIS_OFF_2,
              "member dtor offsets are distinct");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A145E0_CALL_THIS_OFF_1 +
                      (uint32_t)ISAAC_RENDER_SHELL_A145E0_CALL_THIS_OFF_1_TAIL ==
                  (uint32_t)ISAAC_RENDER_SHELL_A145E0_FREE_SIZE,
              "the +0x40 std::vector (3-dword block) ends exactly at the "
              "0x4c sized free");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A145E0_CALL_HOST_VA_0 <
                  (uint32_t)ISAAC_RENDER_SHELL_A145E0_CALL_HOST_VA_2,
              "a149a0 self body precedes a15310 in VA order");

/* ===========================================================================
 * FUN_00a14620 string/pair-table object init — ABI v40
 *
 * Body VA 0x00a14620..0x00a147cb (ret 0xc, two arms), SEH+GS-cookie
 * prologue; no exact ZHL. this = ecx; [ebp+8] = src C-string,
 * [ebp+0xc] = pair table (stride 8: {ptr, flag}), [ebp+0x10] = arg2.
 * Recovered structure (PE VAs in each comment):
 *   1. free-old gate (0xa1464a..0xa1466d): [this+8]!=0 -> host FREE
 *      a648b0(cl=1, edx=old) + [this+8]=0 (store only on gate-open path)
 *   2. arg0 dup (0xa14674..0xa146b3): null arg -> edi=0; else
 *      strlen+1 via host a0f4e0 (operator-new -> a648b0 ALLOC cl=0), then
 *      SECOND strlen re-derived for IAT memcpy [0xb1893c] count; the dup
 *      size and the memcpy count are BOTH strlen+1 but independently
 *      re-derived (mutant class: folding reuses the first)
 *   3. pair scan (0xa146b6..0xa146d9): [this+0x10]=0; pair0.flag==0 ->
 *      count stays 0; else ++count / store / continue while
 *      [table+count*8+4]!=0 — leading nonzero-flag run length, FULL-dword
 *      tests (0x100 IS set; low-byte mutant fails)
 *   4. alloc (0xa146db..0xa146f7): size = count*8 as 64-bit (mul edx,8);
 *      seto cl / neg ecx / or ecx,eax -> 0xffffffff saturation on
 *      overflow, else count*8 LOW 32 (the | with the high-bit flag only
 *      saturates, never adds); host a648b0(cl=0) -> [this+0xc]
 *   5. fill loop (0xa14710..0xa1477f): pair.ptr 0 -> slot dup null; else
 *      host a0f4e0 strlen+1 dup + re-derived strlen for IAT memcpy;
 *      [array+i*8]=dup; [array+i*8+4]=[table+i*8+4] verbatim; UNSIGNED
 *      jb loop-back (i<count)
 *   6. vtable tail (0xa14781..0xa147cb): eax=[this]; push arg2;
 *      call [eax+8] -> al; al==0 -> call [vtbl+4], return 0; al!=0 ->
 *      push [ebp+8]; or [this+4],1; call [vtbl+0x28]; return 1
 * Host leaves: a648b0 FREE/ALLOC (cl=1/0), a0f4e0 operator-new wrapper,
 * IAT memcpy [0xb1893c], 3 vtable slots. All exported laws are pure and
 * take plain scalars — none reads host game memory. NARROWED not removed:
 * the object lives outside the Game buffer (typed host contract).
 * Evidence: section-notes/render-shell-v40/ + cpu-dump/00a14620.txt.
 * =========================================================================== */

extern "C" int32_t isaac_render_shell_a14620_free_old_needed(uint32_t old_ptr) {
  /* VA 0x00a1464a..0x00a1464f: `mov edx,[esi+8]; test edx,edx; je
     0xa14674` — FULL dword gate: any nonzero old ptr frees, 0 skips. */
  return old_ptr != 0u ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_a14620_dup_needed(uint32_t str_ptr) {
  /* VA 0x00a14674..0x00a14679: `mov ebx,[ebp+8]; test ebx,ebx; jne
     0xa1467f` — null arg -> no dup (edi=0), nonzero -> strdup path. */
  return str_ptr != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_render_shell_a14620_dup_size(uint32_t str_len) {
  /* VA 0x00a1467f..0x00a1468d: strlen loop then `sub ecx,edx; inc ecx`
     -> dup alloc size = str_len + 1 (32-bit wrap; 0xffffffff wraps 0). */
  return str_len + 1u;
}

extern "C" uint32_t isaac_render_shell_a14620_dup_memcpy_count(
    uint32_t str_len) {
  /* VA 0x00a14695..0x00a146a9: SECOND strlen, `sub eax,edx; inc eax` —
     the IAT memcpy count is RE-DERIVED from the source, not copied from
     the first strlen. Mutant class: folding the first loop's value. */
  return str_len + 1u;
}

extern "C" int32_t isaac_render_shell_a14620_pair_count_entry(
    uint32_t pair0_flag) {
  /* VA 0x00a146c5..0x00a146c8: `cmp [ebx+4],eax; je 0xa146db` with
     eax=0 — pair0.flag == 0 (FULL dword) -> count stays 0. */
  return pair0_flag != 0u ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_a14620_pair_count_step(uint32_t flag) {
  /* VA 0x00a146d0..0x00a146d9: `inc eax; mov [esi+0x10],eax; cmp
     [ebx+eax*8+4],0; jne loop` — continue while the NEXT pair's flag
     (full dword) is nonzero. The count is the number of leading
     nonzero-flag pairs (pair0 gate done separately). */
  return flag != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_render_shell_a14620_alloc_size(uint32_t count) {
  /* VA 0x00a146db..0x00a146ed: `xor ecx,ecx; mov edx,8; mul edx` ->
     edx:eax = count*8 (64-bit); `push 0; seto cl` (edx!=0 => OF);
     `xor edx,edx; neg ecx; or ecx,eax` -> ecx = (count*8 low 32) when
     the high 32 are zero, else 0xffffffff (saturated). Counterexample to
     `count*8 & 0xffffffff`: overflow saturates, never folds. */
  const uint64_t product = static_cast<uint64_t>(count) * 8u;
  if ((product >> 32) != 0u) {
    return 0xffffffffu;
  }
  return static_cast<uint32_t>(product & 0xffffffffu);
}

extern "C" int32_t isaac_render_shell_a14620_fill_loop_continue(
    uint32_t index, uint32_t count) {
  /* VA 0x00a1477c..0x00a1477f: `cmp eax,[esi+0x10]; jb 0xa14710` —
     UNSIGNED below: loop while index < count. A signed mutant fails at
     count >= 0x80000000. */
  return index < count ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_a14620_pair_ptr_needs_dup(
    uint32_t ptr) {
  /* VA 0x00a1471d..0x00a14723: `test edi,edi; jne 0xa14725` — null pair
     ptr -> the slot gets a null dup (no alloc, no memcpy). */
  return ptr != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_render_shell_a14620_flags_set(uint32_t flags) {
  /* VA 0x00a147b1: `or dword ptr [esi+4], 1` on the al!=0 tail arm. */
  return flags | static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14620_FLAG_BIT0);
}

extern "C" int32_t isaac_render_shell_a14620_tail_result(uint32_t al) {
  /* VA 0x00a14791..0x00a147b8: `test al,al; jne 0xa147ae` — al==0 -> the
     +4 vtable slot runs and the body returns 0; al!=0 -> the +0x28 slot
     runs (flag bit stored) and the body returns 1. LOW-BYTE test. */
  return (al & 0xffu) != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_render_shell_a14620_vtable_slot_off(
    uint32_t slot_kind) {
  /* PE tail slots: kind 0 = gate (+8, always), 1 = false arm (+4),
     2 = true arm (+0x28). if/else chain (no switch jump table — the same
     rationale as a145e0_call_this_off). */
  if (slot_kind == 0u) {
    return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14620_VTABLE_GATE_SLOT);
  }
  if (slot_kind == 1u) {
    return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14620_VTABLE_FALSE_SLOT);
  }
  if (slot_kind == 2u) {
    return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14620_VTABLE_TRUE_SLOT);
  }
  return 0u;
}

extern "C" uint32_t isaac_render_shell_a14620_host_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14620_HOST_VA);
}

extern "C" uint32_t isaac_render_shell_a14620_next_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14620_NEXT_VA);
}

extern "C" uint32_t isaac_render_shell_a14620_str_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14620_STR_OFF);
}

extern "C" uint32_t isaac_render_shell_a14620_array_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14620_ARRAY_OFF);
}

extern "C" uint32_t isaac_render_shell_a14620_count_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14620_COUNT_OFF);
}

extern "C" uint32_t isaac_render_shell_a14620_flags_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14620_FLAGS_OFF);
}

extern "C" uint32_t isaac_render_shell_a14620_pair_stride(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14620_PAIR_STRIDE);
}

extern "C" uint32_t isaac_render_shell_a14620_pair_flag_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14620_PAIR_FLAG_OFF);
}

extern "C" uint32_t isaac_render_shell_a14620_free_cl(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14620_FREE_CL);
}

extern "C" uint32_t isaac_render_shell_a14620_alloc_cl(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14620_ALLOC_CL);
}

extern "C" uint32_t isaac_render_shell_a14620_op_new_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14620_OP_NEW_VA);
}

extern "C" uint32_t isaac_render_shell_a14620_memcpy_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14620_MEMCPY_IAT_VA);
}

extern "C" uint32_t isaac_render_shell_a14620_heap_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14620_HEAP_VA);
}

extern "C" uint32_t isaac_render_shell_a14620_tail_ret_false(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14620_TAIL_RET_FALSE);
}

extern "C" uint32_t isaac_render_shell_a14620_tail_ret_true(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14620_TAIL_RET_TRUE);
}

/* Layout invariants recovered from the PE body. */
static_assert((uint32_t)ISAAC_RENDER_SHELL_A14620_HOST_VA <
                  (uint32_t)ISAAC_RENDER_SHELL_A14620_END_VA,
              "a14620 init ret follows entry");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A14620_NEXT_VA -
                      (uint32_t)ISAAC_RENDER_SHELL_A14620_END_VA ==
                  0x15,
              "ret @ 0xa147cb then int3 pad (0xa147ce..0xa147df) to 0xa147e0");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A14620_VTABLE_GATE_SLOT == 0x08u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A14620_VTABLE_FALSE_SLOT == 0x04u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A14620_VTABLE_TRUE_SLOT == 0x28u,
              "vtable tail slots match the PE call sites");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A14620_FREE_CL == 0x01u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A14620_ALLOC_CL == 0x00u,
              "a648b0 cl mode constants match the PE (mov cl,1 / xor cl,cl)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A14620_FLAGS_OFF == 0x04u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A14620_STR_OFF == 0x08u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A14620_ARRAY_OFF == 0x0cu &&
                  (uint32_t)ISAAC_RENDER_SHELL_A14620_COUNT_OFF == 0x10u,
              "object layout offsets ascending from +4 (vtable at +0)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A14620_PAIR_STRIDE == 0x08u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A14620_PAIR_FLAG_OFF == 0x04u,
              "pair stride 8 with flag at +4 (lea [eax*8] + [ebx+4])");

/* ===========================================================================
 * FUN_00a147e0 vertex/pixel shader string wrapper — ABI v41
 *
 * Body VA 0x00a147e0..0x00a1498f (ret 0x10, two arms), SEH+GS-cookie
 * prologue; no exact ZHL. this = ecx; [ebp+8]/[ebp+0xc] forwarded to the
 * nested 0xa14620 init; [ebp+0x10] = vertex name, [ebp+0x14] = pixel name.
 * 20 direct E8 callers image-wide (0x6802f6..0x6821cc), zero address-taken.
 * Recovered structure (PE VAs in each comment):
 *   1. vertex: edi = 0xa178d0(0xc37a10, vertexName); null ->
 *      log(8, 0xb81b18 "Failed to load vertex shader '%s'") + return 0
 *   2. per-object fill x2 (identical template): [vtbl+0xc](obj,0,0) init;
 *      len = [vtbl+4](obj); buf = host a0f4e0(len+1); flag = [vtbl+0x14]
 *      (obj,buf,len,1); NUL at buf[len] (offset = len); [vtbl+0](obj) release
 *   3. buf-null FULL-dword gates: vertex buf==0 -> vertex error arm;
 *      pixel buf==0 -> pixel error arm (free buf1 + log pixel msg)
 *   4. pixel: edi = 0xa178d0(0xc37a10, pixelName); null -> pixel error arm
 *   5. local pair table [ebp-0x28] stride 8 {buf1, flag1, buf2, flag2};
 *      call 0xa14620(this, arg0, arg1, &local) — arg2 = local table
 *   6. free buf1 (cl=1), free buf2 (cl=1); return = nested al (byte)
 * Host leaves: 0xa178d0 registry (string-keyed hash), 4 vtable slots x2,
 * alloc a0f4e0, free a648b0 (cl=1), logger (level 8, msg VAs). Exported
 * laws are pure scalars — none reads host memory. NARROWED not removed.
 * Evidence: section-notes/render-shell-v41/.
 * =========================================================================== */

extern "C" int32_t isaac_render_shell_a147e0_obj_needed(uint32_t obj) {
  /* VA 0x00a1481d..0x00a1481f (vertex) and 0x00a14883..0x00a14885
     (pixel): `test edi,edi; je <error>` — FULL-dword null gate. */
  return obj != 0u ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_a147e0_buf_needed(uint32_t buf) {
  /* VA 0x00a14867: `cmp dword ptr [ebp+0x10],0; je 0xa1496c` (vertex
     buf) and 0x00a148d0: `test edi,edi; je 0xa1493e` (pixel buf) —
     FULL-dword buf-null gates. */
  return buf != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_render_shell_a147e0_dup_size(uint32_t len) {
  /* VA 0x00a1483b (vertex) / 0x00a148a1 (pixel): `lea ecx,[esi+1]` —
     alloc size = len + 1 (esi = [vtbl+4] length getter result). 32-bit
     wrap; 0xffffffff wraps 0. */
  return len + 1u;
}

extern "C" uint32_t isaac_render_shell_a147e0_nul_term_off(uint32_t len) {
  /* VA 0x00a1485b (vertex) / 0x00a148c1 (pixel): `mov byte ptr
     [esi+eax],0` where esi = len and eax = buf — the NUL terminator is
     stored at buf[len], i.e. the OFFSET is the length, not len+1. */
  return len;
}

extern "C" uint32_t isaac_render_shell_a147e0_free_cl(void) {
  /* VA 0x00a1490c / 0x00a14920 (free buf1/buf2) and 0x00a1494e (pixel
     error arm free): `mov cl,1` before a648b0 — FREE mode. */
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A147E0_FREE_CL);
}

extern "C" uint32_t isaac_render_shell_a147e0_nested_va(void) {
  /* VA 0x00a148f6: `call 0xa14620` — the in-family init, by reference. */
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A147E0_NESTED_VA);
}

extern "C" uint32_t isaac_render_shell_a147e0_vtable_calls(void) {
  /* Per object: init +0xc, length +4, fill +0x14, release +0 (x2). */
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A147E0_VTABLE_CALLS);
}

extern "C" uint32_t isaac_render_shell_a147e0_vtable_slot_off(
    uint32_t kind) {
  /* PE slot order per object: 0 = init (+0xc, VA 0xa14830/0xa14896),
     1 = length (+4, 0xa14836/0xa1489c), 2 = fill (+0x14,
     0xa14851/0xa148b7), 3 = release (+0, 0xa14865/0xa148cb). if/else
     chain (no switch jump table — wasm table-collision rationale). */
  if (kind == 0u) {
    return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A147E0_VTABLE_SLOT_0);
  }
  if (kind == 1u) {
    return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A147E0_VTABLE_SLOT_1);
  }
  if (kind == 2u) {
    return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A147E0_VTABLE_SLOT_2);
  }
  if (kind == 3u) {
    return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A147E0_VTABLE_SLOT_3);
  }
  return 0u;
}

extern "C" uint32_t isaac_render_shell_a147e0_local_ptr_off(
    uint32_t index) {
  /* Local pair table at [ebp-0x28] (base ISAAC_RENDER_SHELL_A147E0_LOCAL_
     BASE_OFF from ebp), stride 8: pair 0 ptr at +0 (buf1, VA 0xa148ed),
     pair 1 ptr at +8 (buf2, VA 0xa148f3). */
  if (index == 0u) {
    return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A147E0_LOCAL_PTR_0);
  }
  if (index == 1u) {
    return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A147E0_LOCAL_PTR_1);
  }
  return 0u;
}

extern "C" uint32_t isaac_render_shell_a147e0_local_flag_off(
    uint32_t index) {
  /* pair 0 flag at +4 (VA 0xa148dd, [vtbl+0x14] result 1), pair 1 flag
     at +0xc (VA 0xa148e3, result 2). */
  if (index == 0u) {
    return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A147E0_LOCAL_FLAG_0);
  }
  if (index == 1u) {
    return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A147E0_LOCAL_FLAG_1);
  }
  return 0u;
}

extern "C" uint32_t isaac_render_shell_a147e0_log_vertex_msg_va(void) {
  /* VA 0x00a1496d: push 0xb81b18 "Failed to load vertex shader '%s'" */
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A147E0_LOG_VERTEX_MSG_VA);
}

extern "C" uint32_t isaac_render_shell_a147e0_log_pixel_msg_va(void) {
  /* VA 0x00a14954: push 0xb81b84 "Failed to load pixel shader '%s'" */
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A147E0_LOG_PIXEL_MSG_VA);
}

extern "C" uint32_t isaac_render_shell_a147e0_log_level(void) {
  /* VA 0x00a14959 / 0x00a14972: push 8 (the logger level arg). */
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A147E0_LOG_LEVEL);
}

extern "C" uint32_t isaac_render_shell_a147e0_fill_const(void) {
  /* VA 0x00a14845 / 0x00a148ab: push 1 — the third arg to [vtbl+0x14]
     (the fill call's constant flag). */
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A147E0_FILL_CONST);
}

extern "C" uint32_t isaac_render_shell_a147e0_err_ret(void) {
  /* VA 0x00a1497c: `xor al,al` on both error arms. */
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A147E0_ERR_RET);
}

extern "C" int32_t isaac_render_shell_a147e0_result(uint32_t al) {
  /* VA 0x00a148fb: `mov bl,al` then 0x00a14928 `mov al,bl` — the return
     is the nested 0xa14620 result BYTE (al, not full eax). */
  return (al & 0xffu) != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_render_shell_a147e0_host_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A147E0_HOST_VA);
}

extern "C" uint32_t isaac_render_shell_a147e0_end_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A147E0_END_VA);
}

extern "C" uint32_t isaac_render_shell_a147e0_next_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A147E0_NEXT_VA);
}

extern "C" uint32_t isaac_render_shell_a147e0_registry_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A147E0_REGISTRY_VA);
}

extern "C" uint32_t isaac_render_shell_a147e0_registry_this_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A147E0_REGISTRY_THIS_VA);
}

/* Layout invariants recovered from the PE body. */
static_assert((uint32_t)ISAAC_RENDER_SHELL_A147E0_HOST_VA <
                  (uint32_t)ISAAC_RENDER_SHELL_A147E0_END_VA,
              "a147e0 wrapper ret follows entry");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A147E0_NEXT_VA -
                      (uint32_t)ISAAC_RENDER_SHELL_A147E0_END_VA ==
                  0x11,
              "ret @ 0xa1498f then int3 pad (0xa14992..0xa1499f) to 0xa149a0");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A147E0_VTABLE_CALLS == 4u,
              "per-object vtable call count is 4 (init/len/fill/release)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A147E0_VTABLE_SLOT_1 !=
                      (uint32_t)ISAAC_RENDER_SHELL_A147E0_VTABLE_SLOT_0 &&
                  (uint32_t)ISAAC_RENDER_SHELL_A147E0_VTABLE_SLOT_2 !=
                      (uint32_t)ISAAC_RENDER_SHELL_A147E0_VTABLE_SLOT_0 &&
                  (uint32_t)ISAAC_RENDER_SHELL_A147E0_VTABLE_SLOT_0 != 0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A147E0_VTABLE_SLOT_1 != 0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A147E0_VTABLE_SLOT_2 != 0u,
              "vtable init/len/fill slots are distinct and nonzero");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A147E0_LOCAL_STRIDE == 0x08u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A147E0_LOCAL_PTR_0 == 0x00u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A147E0_LOCAL_FLAG_0 == 0x04u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A147E0_LOCAL_PTR_1 == 0x08u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A147E0_LOCAL_FLAG_1 == 0x0cu,
              "local pair table stride 8 {ptr, flag} at [ebp-0x28]");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A147E0_LOG_LEVEL == 8u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A147E0_LOG_VERTEX_MSG_VA !=
                      (uint32_t)ISAAC_RENDER_SHELL_A147E0_LOG_PIXEL_MSG_VA,
              "logger level 8 with distinct vertex/pixel message VAs");

/* ===========================================================================
 * FUN_00a149a0 a14620-object virtual destructor body — ABI v42
 *
 * Body VA 0x00a149a0..0x00a14be4, ret (no args, this=ecx), SEH+GS-cookie
 * prologue; no exact ZHL. Virtual dtor body at vtable `0xb81bac` slot +4
 * (a145e0's CALL_HOST_VA_0). Structure and PE VAs:
 *   1. pair loop (0xa149d0..0xa149df): ptr = [array+i*8] (count +0x10),
 *      FULL-dword gate -> tracked-free (stride 8 {ptr,flag} entries)
 *   2. vector<0x18> walk (0xa14a17..0xa14aed): count = MAGIC SIGNED
 *      div by 0x18 of (end-begin) at +0x34/+0x38; per element inner
 *      dword array [elem+0xc], dword count = (end-begin)>>2 SAR; gate
 *      [elem+8] > 7 (SIGNED jle) -> free inner dwords; [elem+0x10] =
 *      [elem+0xc] collapse
 *   3. 4149d0(elem+0xc) per element (0xa14af7..0xa14b04); [0x38]=[0x34]
 *   4. eight slots +0x14..+0x30 stride 4: FULL-dword gate -> free+0
 *   5. string +0x8: gate -> free+0; 6. array base +0xc: gate -> free+0
 *   7. [this+4] &= ~1; [this+0x10] = 0
 * Tracked-free (all 5 sites): sel = [0xc7de78]; base = sel != 0 ?
 *   sel+0x30 : 0xc7f618; size = [ptr-4]; lo -= size; sbb hi; free via
 *   IAT [0xb187dc]. All exported laws are pure scalars.
 * Evidence: section-notes/render-shell-v42/.
 * =========================================================================== */

extern "C" int32_t isaac_render_shell_a149a0_ptr_free_needed(
    uint32_t ptr) {
  /* FULL-dword gate at all five free sites: pair elems (0xa149dd test
     ecx,ecx / je), slots (0xa14b16), string (0xa14b55), array base
     (0xa14b97), inner dwords (0xa14a73). 0x100 IS freed. */
  return ptr != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_render_shell_a149a0_counter_base(uint32_t sel) {
  /* VA 0x00a149e1..0x00a149f3: `mov edx,[0xc7de78]; test edx,edx; je
     0xc7f618; add edx,0x30` — FULL dword test on the select value. */
  if (sel != 0u) {
    return sel + static_cast<uint32_t>(ISAAC_RENDER_SHELL_A149A0_COUNTER_OFF);
  }
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A149A0_COUNTER_FALLBACK_VA);
}

extern "C" uint32_t isaac_render_shell_a149a0_counter_dec_lo(
    uint32_t lo, uint32_t size_hdr) {
  /* VA 0x00a149fb: `sub dword ptr [edx],eax` — 32-bit wrap; the sbb
     borrow is computed separately. */
  return lo - size_hdr;
}

extern "C" int32_t isaac_render_shell_a149a0_counter_sbb_borrow(
    uint32_t lo, uint32_t size_hdr) {
  /* VA 0x00a149fe: `sbb dword ptr [edx+4],0` — borrow = UNSIGNED
     (lo < size_hdr), exactly the sbb carry-out. */
  return lo < size_hdr ? 1 : 0;
}

extern "C" uint32_t isaac_render_shell_a149a0_counter_dec_hi(
    uint32_t hi, uint32_t borrow) {
  /* VA 0x00a149fe: hi -= borrow (the sbb [edx+4],0), 32-bit wrap. */
  return hi - borrow;
}

extern "C" int32_t isaac_render_shell_a149a0_elem_free_needed(
    uint32_t type_dword) {
  /* VA 0x00a14a60..0x00a14a64: `cmp dword ptr [edi+8],7; jle 0xa14ab5`
     — the type field is a DWORD compare with immediate 7, SIGNED:
     only > 7 frees (0x100 frees, 0xffffffff does NOT). */
  return (static_cast<int32_t>(type_dword) > 7) ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_a149a0_vec18_count(uint32_t begin,
                                                          uint32_t end) {
  /* VA 0x00a14a1f..0x00a14a35: magic division by 0x18.
     `mov eax,0x2aaaaaab; mov ecx,edi(end); sub ecx,esi(begin); imul
     ecx; sar edx,2; mov eax,edx; shr eax,0x1f; add eax,edx` — the
     span is a 32-bit WRAP (`sub ecx,esi`) then SIGN-interpreted by
     the signed imul; result = floor(span / 24) for the signed span. */
  const uint32_t span_u32 = end - begin; /* 32-bit wrap, as the PE */
  const int32_t span = static_cast<int32_t>(span_u32);
  const int64_t prod = static_cast<int64_t>(span) *
                       static_cast<int64_t>(0x2aaaaaabLL);
  int32_t hi = static_cast<int32_t>(prod >> 32);
  hi >>= 2; /* sar edx,2 */
  int32_t q = hi;
  q += (static_cast<uint32_t>(hi) >> 31); /* shr 0x1f then add */
  return q;
}

extern "C" int32_t isaac_render_shell_a149a0_inner_dword_count(
    uint32_t begin_ptr, uint32_t end_ptr) {
  /* VA 0x00a14a4e..0x00a14a50: `sub edx,eax; sar edx,2` where edx =
     [elem+0x10] (end), eax = [elem+0xc] (begin) — SAR signed. */
  return (static_cast<int32_t>(end_ptr - begin_ptr)) >> 2;
}

extern "C" uint32_t isaac_render_shell_a149a0_flags_clear_bit0(
    uint32_t flags) {
  /* VA 0x00a14bc8: `and dword ptr [ebx+4],0xfffffffe` — clear bit 0,
     keep every other bit verbatim. */
  return flags & ~1u;
}

extern "C" uint32_t isaac_render_shell_a149a0_vtable_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A149A0_VTABLE_VA);
}

extern "C" uint32_t isaac_render_shell_a149a0_free_iat_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A149A0_FREE_IAT_VA);
}

extern "C" uint32_t isaac_render_shell_a149a0_counter_sel_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A149A0_COUNTER_SEL_VA);
}

extern "C" uint32_t isaac_render_shell_a149a0_counter_fallback_va(void) {
  return static_cast<uint32_t>(
      ISAAC_RENDER_SHELL_A149A0_COUNTER_FALLBACK_VA);
}

extern "C" uint32_t isaac_render_shell_a149a0_counter_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A149A0_COUNTER_OFF);
}

extern "C" uint32_t isaac_render_shell_a149a0_vec_destroy_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A149A0_VEC_DESTROY_VA);
}

extern "C" uint32_t isaac_render_shell_a149a0_tracked_free_sites(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A149A0_TRACKED_FREE_SITES);
}

extern "C" uint32_t isaac_render_shell_a149a0_slot_count(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A149A0_SLOT_COUNT);
}

extern "C" uint32_t isaac_render_shell_a149a0_host_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A149A0_HOST_VA);
}

extern "C" uint32_t isaac_render_shell_a149a0_end_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A149A0_END_VA);
}

extern "C" uint32_t isaac_render_shell_a149a0_next_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A149A0_NEXT_VA);
}

/* Layout invariants recovered from the PE body. */
static_assert((uint32_t)ISAAC_RENDER_SHELL_A149A0_HOST_VA <
                  (uint32_t)ISAAC_RENDER_SHELL_A149A0_END_VA,
              "a149a0 dtor body ret follows entry");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A149A0_NEXT_VA -
                      (uint32_t)ISAAC_RENDER_SHELL_A149A0_END_VA ==
                  0xc,
              "ret @ 0xa14be4 then int3 pad (0xa14be5..0xa14bef) to 0xa14bf0");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A149A0_SLOT_COUNT == 8u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A149A0_SLOT_STRIDE == 0x04u,
              "eight dword slots at +0x14..+0x30");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A149A0_SLOTS_OFF +
                      (uint32_t)ISAAC_RENDER_SHELL_A149A0_SLOT_COUNT *
                          (uint32_t)ISAAC_RENDER_SHELL_A149A0_SLOT_STRIDE ==
                  (uint32_t)ISAAC_RENDER_SHELL_A149A0_VEC_OFF,
              "slots end exactly at the vector<0x18> begin (+0x34)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A149A0_VEC_STRIDE == 0x18u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A149A0_PAIR_STRIDE == 0x08u,
              "vector element 0x18 / pair entry 8 match the walk strides");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A149A0_ELEM_TYPE_OFF == 0x08u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A149A0_ELEM_ARRAY_OFF == 0x0cu &&
                  (uint32_t)ISAAC_RENDER_SHELL_A149A0_ELEM_END_OFF == 0x10u,
              "0x18-element inner layout: type +8, dword array +0xc/+0x10");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A149A0_TRACKED_FREE_SITES == 5u,
              "five tracked-free sites (pair / inner / slots / str / array)");

/* ===========================================================================
 * FUN_00a14c00 render-shell item add/update method — ABI v43
 *
 * Body VA 0x00a14c00..0x00a14f0f, ret 0x10 @ 0xa14f0c, SEH+GS-cookie
 * prologue; no exact ZHL; this=ecx. 45 direct E8 callers
 * (0x4095c3..0x9945c8). Signature (this, name@[ebp+8], type@[ebp+0xc],
 * data@[ebp+0x10], unused@[ebp+0x14]) — ret 0x10 pops 4 stack args.
 * Pure laws exported here (scalar, no host memory read):
 *   size_for_type(type)  — jump-table law: type 8..0x1c -> element
 *     size (0x04/0x08/0x0c/0x10/0x18/0x20/0x24/0x30/0x40); type 0..7 or
 *     > 0x1c (UNSIGNED cmp, `ja`) -> 0 (error band). The 29-entry
 *     table at 0xa14f10 was extracted as raw dwords from the PE.
 *   error_msg_va(type)   — 0xb81b40 for type<=7 (err B), 0xb81aec for
 *     type>0x1c (err A), 0 for valid types. Both error bands then log
 *     via a112c0 with level 0x10 and fall through with size 0.
 * Template coverage: the body re-derives the SAME vec18 magic division
 * (0x2aaaaaab imul / sar edx,2 / shr 0x1f / add — C-truncation div by
 * 0x18, identical to a149a0's vec18_count law) and walks the SAME
 * 0x18-element inner layout (+0xc begin/+0x10 end/+0x14 cap). Cross-
 * ABI invariants pinned equal in the tests.
 * Host leaves: a15040 (find), a152a0 (vec push), a0f4e0 (alloc),
 * af05df (copy), 42c920 (grow), a112c0 (logger), aef15c (sized free),
 * IAT [0xb18894] (range report) / [0xb1893c] (memcpy).
 * NARROWED not removed. NEXT_VA 0x00a14f90.
 * =========================================================================== */

static const uint32_t kRenderShellA14C00SizeTable[0x1d] = {
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, /* idx 0..7 err B  */
    0x04, 0x08, 0x0c, 0x10, /* 8..11 */
    0x04, 0x08, 0x0c, 0x10, /* 12..15 */
    0x04, 0x08, 0x0c, 0x10, /* 16..19 */
    0x10, 0x18, 0x20, 0x18, /* 20..23 */
    0x24, 0x30, 0x20, 0x30, 0x40, /* 24..28 */
};

extern "C" int32_t isaac_render_shell_a14c00_size_for_type(uint32_t type) {
  /* PE: cmp type,0x1c; ja errA (UNSIGNED); jmp [type*4+0xa14f10].
     Valid 8..0x1c; 0..7 -> err B; > 0x1c -> err A; size 0 either way. */
  const uint32_t t = type;
  if (t > static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14C00_TYPE_MAX_VALID)) {
    return 0;
  }
  return static_cast<int32_t>(kRenderShellA14C00SizeTable[t]);
}

extern "C" uint32_t isaac_render_shell_a14c00_error_msg_va(uint32_t type) {
  /* err B (type<=7) -> 0xb81b40; err A (type>0x1c) -> 0xb81aec;
     valid 8..0x1c -> 0 (no log). */
  const uint32_t t = type;
  if (t <= 7u) {
    return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14C00_MSG_LO_VA);
  }
  if (t > static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14C00_TYPE_MAX_VALID)) {
    return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14C00_MSG_HI_VA);
  }
  return 0u;
}

extern "C" uint32_t isaac_render_shell_a14c00_jump_table_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14C00_JUMP_TABLE_VA);
}

extern "C" uint32_t isaac_render_shell_a14c00_jump_table_entries(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14C00_JUMP_TABLE_ENTRIES);
}

extern "C" uint32_t isaac_render_shell_a14c00_type_min_valid(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14C00_TYPE_MIN_VALID);
}

extern "C" uint32_t isaac_render_shell_a14c00_type_max_valid(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14C00_TYPE_MAX_VALID);
}

extern "C" uint32_t isaac_render_shell_a14c00_log_level(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14C00_LOG_LEVEL);
}

extern "C" uint32_t isaac_render_shell_a14c00_msg_lo_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14C00_MSG_LO_VA);
}

extern "C" uint32_t isaac_render_shell_a14c00_msg_hi_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14C00_MSG_HI_VA);
}

extern "C" uint32_t isaac_render_shell_a14c00_logger_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14C00_LOGGER_VA);
}

extern "C" uint32_t isaac_render_shell_a14c00_find_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14C00_FIND_VA);
}

extern "C" uint32_t isaac_render_shell_a14c00_push_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14C00_PUSH_VA);
}

extern "C" uint32_t isaac_render_shell_a14c00_alloc_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14C00_ALLOC_VA);
}

extern "C" uint32_t isaac_render_shell_a14c00_copy_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14C00_COPY_VA);
}

extern "C" uint32_t isaac_render_shell_a14c00_grow_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14C00_GROW_VA);
}

extern "C" uint32_t isaac_render_shell_a14c00_sized_free_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14C00_SIZED_FREE_VA);
}

extern "C" uint32_t isaac_render_shell_a14c00_range_iat_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14C00_RANGE_IAT_VA);
}

extern "C" uint32_t isaac_render_shell_a14c00_memcpy_iat_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14C00_MEMCPY_IAT_VA);
}

extern "C" uint32_t isaac_render_shell_a14c00_stack_args(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14C00_STACK_ARGS);
}

extern "C" uint32_t isaac_render_shell_a14c00_elem_stride(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14C00_ELEM_STRIDE);
}

extern "C" uint32_t isaac_render_shell_a14c00_elem_inner_begin_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14C00_ELEM_INNER_BEGIN_OFF);
}

extern "C" uint32_t isaac_render_shell_a14c00_elem_inner_end_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14C00_ELEM_INNER_END_OFF);
}

extern "C" uint32_t isaac_render_shell_a14c00_elem_inner_cap_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14C00_ELEM_INNER_CAP_OFF);
}

extern "C" uint32_t isaac_render_shell_a14c00_vec18_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14C00_VEC18_OFF);
}

extern "C" uint32_t isaac_render_shell_a14c00_vec_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14C00_VEC_OFF);
}

extern "C" uint32_t isaac_render_shell_a14c00_vec18_magic(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14C00_VEC18_MAGIC);
}

extern "C" uint32_t isaac_render_shell_a14c00_host_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14C00_HOST_VA);
}

extern "C" uint32_t isaac_render_shell_a14c00_end_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14C00_END_VA);
}

extern "C" uint32_t isaac_render_shell_a14c00_next_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14C00_NEXT_VA);
}

/* Layout invariants recovered from the PE body. */
static_assert((uint32_t)ISAAC_RENDER_SHELL_A14C00_HOST_VA <
                  (uint32_t)ISAAC_RENDER_SHELL_A14C00_END_VA,
              "a14c00 add/update body ret follows entry");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A14C00_END_VA + 1u ==
                  (uint32_t)ISAAC_RENDER_SHELL_A14C00_JUMP_TABLE_VA,
              "ret 0x10 @ 0xa14f0c; jump table data starts 0xa14f10");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A14C00_JUMP_TABLE_VA +
                      (uint32_t)ISAAC_RENDER_SHELL_A14C00_JUMP_TABLE_ENTRIES *
                          4u ==
                  0x00a14f84u,
              "29-entry jump table ends at 0xa14f84, int3 pad to 0xa14f90");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A14C00_NEXT_VA == 0x00a14f90u,
              "next SEH body after table + pad");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A14C00_TYPE_MIN_VALID == 0x08u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A14C00_TYPE_MAX_VALID == 0x1cu,
              "valid type band 8..0x1c (cmp type,0x1c; ja errA)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A14C00_ELEM_STRIDE == 0x18u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A14C00_ELEM_FLAG_OFF == 0x04u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A14C00_ELEM_VALUE_OFF == 0x08u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A14C00_ELEM_INNER_BEGIN_OFF ==
                      0x0cu &&
                  (uint32_t)ISAAC_RENDER_SHELL_A14C00_ELEM_INNER_END_OFF ==
                      0x10u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A14C00_ELEM_INNER_CAP_OFF ==
                      0x14u,
              "0x18-element: name +0, flag +4, value(type) +8, inner vec "
              "+0xc/+0x10/+0x14 — same inner layout as a149a0 (v42)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A14C00_VEC18_MAGIC ==
                      (uint32_t)ISAAC_RENDER_SHELL_A149A0_VEC18_MAGIC &&
                  (uint32_t)ISAAC_RENDER_SHELL_A14C00_ELEM_STRIDE ==
                      (uint32_t)ISAAC_RENDER_SHELL_A149A0_VEC_STRIDE &&
                  (uint32_t)ISAAC_RENDER_SHELL_A14C00_ELEM_INNER_BEGIN_OFF ==
                      (uint32_t)ISAAC_RENDER_SHELL_A149A0_ELEM_ARRAY_OFF &&
                  (uint32_t)ISAAC_RENDER_SHELL_A14C00_ELEM_INNER_END_OFF ==
                      (uint32_t)ISAAC_RENDER_SHELL_A149A0_ELEM_END_OFF,
              "cross-ABI template coverage: a14c00 shares the vec18 magic "
              "div and 0x18-element inner layout with a149a0 (v42)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A14C00_VEC18_OFF == 0x34u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A14C00_VEC18_END_OFF == 0x38u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A14C00_VEC_OFF == 0x40u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A14C00_VEC_END_OFF == 0x44u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A14C00_VEC_CAP_OFF == 0x48u,
              "this layout: vec18 +0x34/+0x38, vec +0x40/+0x44/+0x48");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A14C00_STACK_ARGS == 4u,
              "ret 0x10 pops 4 stack args (arg4 never read)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A14C00_LOG_LEVEL == 0x10u,
              "logger a112c0 called with level 0x10 on both error bands");

/* ===========================================================================
 * FUN_00a14f90 render-shell class method (vtable slot +0x0c of the
 * 0xb81bac vtable) — ABI v44
 *
 * Body VA 0x00a14f90..0x00a15037, ret 4 @ 0xa15035 (1 stack arg); plain
 * ebp frame (no SEH/GS); this=ecx. The 0xb81bac vtable (slots +0
 * a145e0 / +4 a149a0 pinned v39/v42; next method slot +0x14 = 0xa150d0)
 * holds this body at slot +0x0c. identify-zhl: only a 14-byte prologue
 * prefix matches `Music::Crossfade(int,float)` — ret 4 contradicts the
 * 2-arg catalog signature; no exact ZHL.
 * Signature (this, list@[ebp+8] nullable dword-index vector): walk the
 * index vector (null -> &this+0x40 default; count = (end-begin)>>2 SAR,
 * re-derived per iteration), per index pull the inner dword value from
 * the matching vec18 element i (stride 0x18 at this+0x34, begin re-read
 * per iteration), then table-store (DAT 0xc79928, 8 slots) for type <= 7
 * (UNSIGNED cmp edx,7; ja) or vtable slot +0x1c dispatch (name, type,
 * inner_value, flag) for type > 7; finally flush the table via vtable
 * slot +0x18 for each val != 0 (FULL dword test).
 * Exported laws are pure scalars (no host memory read):
 *   list_dword_count(begin,end)  — (end-begin)>>2 SAR; entry bound and
 *     per-iteration re-derived bound (SAME law as a149a0 inner_dword_count);
 *   index_in_range(value,count)  — UNSIGNED value < count (jae skip);
 *   type_to_table(type)          — type <= 7 (UNSIGNED) -> table store;
 *   flush_needed(val)            — FULL dword val != 0 gate;
 *   element_off(index)           — index*0x18 32-bit wrap accumulator.
 * Host: list/vec18/inner memory reads, DAT 0xc79928 8-slot table, and
 * the two unnamed vtable dispatch slots (+0x1c / +0x18) — address-
 * stable host actions per the v26 convention. NARROWED not removed.
 * NEXT_VA 0x00a15040 (find helper leaf). Next class method 0x00a150d0.
 * =========================================================================== */

extern "C" int32_t isaac_render_shell_a14f90_list_dword_count(
    uint32_t begin, uint32_t end) {
  /* VA 0x00a14fa3..0x00a14fac (entry) and 0xa14ffd..0xa15009 (per
     iteration): `mov eax,[ebx+4]; mov edx,[ebx]; sub eax,edx; sar
     eax,2` — SAR signed dword count of the index vector. */
  return (static_cast<int32_t>(end - begin)) >> 2;
}

extern "C" int32_t isaac_render_shell_a14f90_index_in_range(
    uint32_t value, int32_t inner_count) {
  /* VA 0x00a14fce..0x00a14fd1: `cmp [ebp-4],eax; jae skip` — UNSIGNED
     compare of value against the SAR-derived inner count; the gate
     passes (in-range) exactly when value < inner_count unsigned. */
  return (value < static_cast<uint32_t>(inner_count)) ? 1 : 0;
}

extern "C" int32_t isaac_render_shell_a14f90_type_to_table(uint32_t type) {
  /* VA 0x00a14fdf..0x00a14fe4: `cmp edx,7; ja vtable` — UNSIGNED.
     type <= 7 -> DAT_00c79928[type] store; type > 7 -> slot +0x1c
     dispatch (4 stack args: name, type, value, flag). */
  return (type <= static_cast<uint32_t>(
                     ISAAC_RENDER_SHELL_A14F90_TABLE_MAX_TYPE))
             ? 1
             : 0;
}

extern "C" int32_t isaac_render_shell_a14f90_flush_needed(uint32_t val) {
  /* VA 0x00a1501c..0x00a1501e: `test ecx,ecx; je skip` — FULL dword
     test on the table entry (0x100 flushes; a low-byte test would 0). */
  return (val != 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_render_shell_a14f90_element_off(uint32_t index) {
  /* VA 0x00a15005: `add dword ptr [ebp+8],0x18` per iteration — the
     vec18 element offset accumulator (index * 0x18, 32-bit wrap),
     feeding `lea ecx,[vec18_begin+off]` at 0xa14fbb. */
  return index * static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14F90_ELEM_STRIDE);
}

extern "C" uint32_t isaac_render_shell_a14f90_host_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14F90_HOST_VA);
}

extern "C" uint32_t isaac_render_shell_a14f90_end_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14F90_END_VA);
}

extern "C" uint32_t isaac_render_shell_a14f90_next_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14F90_NEXT_VA);
}

extern "C" uint32_t isaac_render_shell_a14f90_next_method_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14F90_NEXT_METHOD_VA);
}

extern "C" uint32_t isaac_render_shell_a14f90_vtable_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14F90_VTABLE_VA);
}

extern "C" uint32_t isaac_render_shell_a14f90_vtable_slot(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14F90_VTABLE_SLOT);
}

extern "C" uint32_t isaac_render_shell_a14f90_slot_per_elem(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14F90_SLOT_PER_ELEM);
}

extern "C" uint32_t isaac_render_shell_a14f90_slot_flush(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14F90_SLOT_FLUSH);
}

extern "C" uint32_t isaac_render_shell_a14f90_per_elem_args(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14F90_PER_ELEM_ARGS);
}

extern "C" uint32_t isaac_render_shell_a14f90_flush_args(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14F90_FLUSH_ARGS);
}

extern "C" uint32_t isaac_render_shell_a14f90_table_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14F90_TABLE_VA);
}

extern "C" uint32_t isaac_render_shell_a14f90_table_entries(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14F90_TABLE_ENTRIES);
}

extern "C" uint32_t isaac_render_shell_a14f90_table_max_type(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14F90_TABLE_MAX_TYPE);
}

extern "C" uint32_t isaac_render_shell_a14f90_list_fallback_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14F90_LIST_FALLBACK_OFF);
}

extern "C" uint32_t isaac_render_shell_a14f90_vec18_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14F90_VEC18_OFF);
}

extern "C" uint32_t isaac_render_shell_a14f90_elem_stride(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14F90_ELEM_STRIDE);
}

extern "C" uint32_t isaac_render_shell_a14f90_stack_args(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A14F90_STACK_ARGS);
}

/* Layout invariants recovered from the PE body. */
static_assert((uint32_t)ISAAC_RENDER_SHELL_A14F90_HOST_VA == 0x00a14f90u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A14F90_END_VA == 0x00a15037u,
              "plain ebp frame 0xa14f90; ret 4 @ 0xa15035..0xa15037");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A14F90_NEXT_VA == 0x00a15040u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A14F90_NEXT_VA -
                          (uint32_t)ISAAC_RENDER_SHELL_A14F90_END_VA ==
                      9u,
              "int3 pad 0xa15038..0xa1503f then find helper 0xa15040");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A14F90_NEXT_METHOD_VA ==
                  0x00a150d0u,
              "next class method (vtable slot +0x14) at 0xa150d0");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A14F90_VTABLE_VA ==
                      (uint32_t)ISAAC_RENDER_SHELL_A149A0_VTABLE_VA &&
                  (uint32_t)ISAAC_RENDER_SHELL_A14F90_VTABLE_VA ==
                      (uint32_t)ISAAC_RENDER_SHELL_A145E0_VTABLE_VA,
              "same 0xb81bac class vtable as a149a0 (v42) / a145e0 (v39)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A14F90_VTABLE_SLOT == 0x0cu &&
                  (uint32_t)ISAAC_RENDER_SHELL_A14F90_SLOT_PER_ELEM == 0x1cu &&
                  (uint32_t)ISAAC_RENDER_SHELL_A14F90_SLOT_FLUSH == 0x18u,
              "body sits at vtable slot +0x0c; dispatches +0x1c (per elem) "
              "and +0x18 (flush)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A14F90_PER_ELEM_ARGS == 4u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A14F90_FLUSH_ARGS == 2u,
              "slot +0x1c pushes name,type,value,flag (4 args); slot +0x18 "
              "pushes index,val (2 args)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A14F90_TABLE_VA == 0x00c79928u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A14F90_TABLE_ENTRIES == 8u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A14F90_TABLE_MAX_TYPE == 7u,
              "DAT 0xc79928 8-slot table, type band 0..7 unsigned");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A14F90_LIST_FALLBACK_OFF ==
                          (uint32_t)ISAAC_RENDER_SHELL_A14C00_VEC_OFF &&
                      (uint32_t)ISAAC_RENDER_SHELL_A14F90_VEC18_OFF ==
                          (uint32_t)ISAAC_RENDER_SHELL_A14C00_VEC18_OFF &&
                      (uint32_t)ISAAC_RENDER_SHELL_A14F90_ELEM_STRIDE ==
                          (uint32_t)ISAAC_RENDER_SHELL_A14C00_ELEM_STRIDE,
                  "cross-ABI template: default list = &this+0x40 (the vec "
                  "a14c00 step-6 rewalk fills), vec18 at +0x34, stride 0x18");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A14F90_ELEM_TYPE_OFF ==
                          (uint32_t)ISAAC_RENDER_SHELL_A14C00_ELEM_VALUE_OFF &&
                      (uint32_t)ISAAC_RENDER_SHELL_A14F90_ELEM_TYPE_OFF ==
                          (uint32_t)ISAAC_RENDER_SHELL_A149A0_ELEM_TYPE_OFF &&
                      (uint32_t)ISAAC_RENDER_SHELL_A14F90_ELEM_INNER_BEGIN_OFF ==
                          (uint32_t)ISAAC_RENDER_SHELL_A14C00_ELEM_INNER_BEGIN_OFF &&
                      (uint32_t)ISAAC_RENDER_SHELL_A14F90_ELEM_INNER_END_OFF ==
                          (uint32_t)ISAAC_RENDER_SHELL_A14C00_ELEM_INNER_END_OFF,
              "0x18-element inner layout shared with a14c00 (v43) / a149a0 "
              "(v42): type +8, inner vec +0xc/+0x10");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A14F90_STACK_ARGS == 1u,
              "ret 4 pops 1 stack arg (the nullable list pointer)");

/* ===========================================================================
 * ABI v45: FUN_00a150d0 render-shell class method (vtable slot +0x14
 * of the 0xb81bac vtable)
 *
 * Body VA 0x00a150d0..0x00a15296, ret (no args, this=ecx), SEH+GS-cookie
 * prologue; no exact ZHL. Phase A per-element inner-dword free +
 * retain-last; Phase B vec rewalk pushing inner_count-1 per element.
 * Tracked-free at 0xa1516a..0xa15187 (SAME template as a149a0 v42:
 * sel=[0xc7de78]; base = sel? sel+0x30 : 0xc7f618; lo -= [ptr-4];
 * sbb hi; free IAT [0xb187dc]). 42c920 grow x2 on cmp/je EQUALITY.
 * Exported laws are pure scalars; host owns the counter select load
 * [0xc7de78], the free IAT [0xb187dc], grow 0x42c920 and all memory.
 * NARROWED not removed. NEXT_VA 0x00a152a0 (vec18 push leaf).
 * PE evidence: section-notes/cpu-dump/00a150d0.txt
 * =========================================================================== */

extern "C" int32_t isaac_render_shell_a150d0_ptr_free_needed(
    uint32_t ptr) {
  /* VA 0x00a15166..0x00a15168: `test ecx,ecx; je 0xa151a8` on the
     inner dword — FULL dword gate (0x100 IS freed, only 0 skips). */
  return ptr != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_render_shell_a150d0_counter_base(uint32_t sel) {
  /* VA 0x00a1516a..0x00a15179: `mov edx,[0xc7de78]; test edx,edx; je
     0xc7f618; add edx,0x30` — FULL dword test on the select value. */
  if (sel != 0u) {
    return sel + static_cast<uint32_t>(ISAAC_RENDER_SHELL_A150D0_COUNTER_OFF);
  }
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A150D0_COUNTER_FALLBACK_VA);
}

extern "C" uint32_t isaac_render_shell_a150d0_counter_dec_lo(
    uint32_t lo, uint32_t size_hdr) {
  /* VA 0x00a15184: `sub dword ptr [edx],eax` — 32-bit wrap; the sbb
     borrow is computed separately. */
  return lo - size_hdr;
}

extern "C" int32_t isaac_render_shell_a150d0_counter_sbb_borrow(
    uint32_t lo, uint32_t size_hdr) {
  /* VA 0x00a15187: `sbb dword ptr [edx+4],0` — borrow = UNSIGNED
     (lo < size_hdr), exactly the sbb carry-out. */
  return lo < size_hdr ? 1 : 0;
}

extern "C" uint32_t isaac_render_shell_a150d0_counter_dec_hi(
    uint32_t hi, uint32_t borrow) {
  /* VA 0x00a15187: hi -= borrow (the sbb [edx+4],0), 32-bit wrap. */
  return hi - borrow;
}

extern "C" int32_t isaac_render_shell_a150d0_elem_free_needed(
    uint32_t type_dword) {
  /* VA 0x00a15149..0x00a15151: `cmp dword ptr [ebx+esi+8],7; jle
     0xa151b3` — DWORD compare with immediate 7, SIGNED: only > 7
     frees (0x100 frees, 0xffffffff does NOT). */
  return (static_cast<int32_t>(type_dword) >
          static_cast<int32_t>(ISAAC_RENDER_SHELL_A150D0_TYPE_FREE_MAX))
             ? 1
             : 0;
}

extern "C" int32_t isaac_render_shell_a150d0_vec18_count(uint32_t begin,
                                                          uint32_t end) {
  /* VA 0x00a15100..0x00a15119 (entry) and 0xa151d3..0xa151f3 /
     0xa1520c..0xa15223 (RE-DERIVED per iteration): magic division by
     0x18 — `mov eax,0x2aaaaaab; sub span; imul; sar edx,2; mov
     eax,edx; shr eax,0x1f; add eax,edx`. Wrap-u32 span,
     SIGN-interpreted by the signed imul; result = floor(span/24)
     for the signed span (MSVC C-truncation). SAME law as
     a149a0_vec18_count (v42) — pinned equal in tests. */
  const uint32_t span_u32 = end - begin; /* 32-bit wrap, as the PE */
  const int32_t span = static_cast<int32_t>(span_u32);
  const int64_t prod = static_cast<int64_t>(span) *
                       static_cast<int64_t>(0x2aaaaaabLL);
  int32_t hi = static_cast<int32_t>(prod >> 32);
  hi >>= 2; /* sar edx,2 */
  int32_t q = hi;
  q += (static_cast<uint32_t>(hi) >> 31); /* shr 0x1f then add */
  return q;
}

extern "C" int32_t isaac_render_shell_a150d0_inner_dword_count(
    uint32_t begin_ptr, uint32_t end_ptr) {
  /* VA 0x00a1512f (Phase A) / 0x00a1523b (Phase B): `sub` span then
     `sar edx,2` — SAR signed dword count of the elem inner vector. */
  return (static_cast<int32_t>(end_ptr - begin_ptr)) >> 2;
}

extern "C" int32_t isaac_render_shell_a150d0_grow_needed(uint32_t ptr,
                                                          uint32_t cap) {
  /* VA 0x00a151b6 `cmp eax,[edi+0x14]; je 0xa151c3` (inner cap) and
     VA 0x00a15245 `cmp ecx,[edx+0x48]; je 0xa15252` (vec cap) — the
     42c920 grow fires on EQUALITY (ptr == cap); the direct store runs
     when ptr != cap. */
  return (ptr == cap) ? 1 : 0;
}

extern "C" uint32_t isaac_render_shell_a150d0_inner_last_off(
    uint32_t begin, int32_t inner_count) {
  /* VA 0x00a1513f: `mov edx,[eax + ecx*4 - 4]` where eax = elem
     begin, ecx = inner_count — the retained last-dword load address
     (begin + inner_count*4 - 4, 32-bit wrap). */
  return begin + static_cast<uint32_t>(inner_count) * 4u - 4u;
}

extern "C" uint32_t isaac_render_shell_a150d0_push_value(
    int32_t inner_count) {
  /* Phase B VA 0x00a1523e: `dec eax` after the SAR — push_value =
     inner_count - 1, 32-bit wrap (an empty inner vec pushes
     0xffffffff into this->+0x40). */
  return static_cast<uint32_t>(inner_count) -
         static_cast<uint32_t>(ISAAC_RENDER_SHELL_A150D0_PUSH_DEC);
}

extern "C" uint32_t isaac_render_shell_a150d0_retain_end(uint32_t begin) {
  /* Phase A VA 0x00a151bd: `add dword ptr [edi+0x10],4` after the
     last-dword store — direct path end = begin + 4 (retain ONE dword
     of the collapsed inner vec). */
  return begin +
         static_cast<uint32_t>(ISAAC_RENDER_SHELL_A150D0_RETAIN_STORE_SIZE);
}

extern "C" uint32_t isaac_render_shell_a150d0_host_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A150D0_HOST_VA);
}

extern "C" uint32_t isaac_render_shell_a150d0_end_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A150D0_END_VA);
}

extern "C" uint32_t isaac_render_shell_a150d0_next_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A150D0_NEXT_VA);
}

extern "C" uint32_t isaac_render_shell_a150d0_vtable_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A150D0_VTABLE_VA);
}

extern "C" uint32_t isaac_render_shell_a150d0_vtable_slot(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A150D0_VTABLE_SLOT);
}

extern "C" uint32_t isaac_render_shell_a150d0_free_iat_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A150D0_FREE_IAT_VA);
}

extern "C" uint32_t isaac_render_shell_a150d0_counter_sel_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A150D0_COUNTER_SEL_VA);
}

extern "C" uint32_t isaac_render_shell_a150d0_counter_fallback_va(void) {
  return static_cast<uint32_t>(
      ISAAC_RENDER_SHELL_A150D0_COUNTER_FALLBACK_VA);
}

extern "C" uint32_t isaac_render_shell_a150d0_counter_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A150D0_COUNTER_OFF);
}

extern "C" uint32_t isaac_render_shell_a150d0_counter_lo_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A150D0_COUNTER_LO_OFF);
}

extern "C" uint32_t isaac_render_shell_a150d0_counter_hi_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A150D0_COUNTER_HI_OFF);
}

extern "C" uint32_t isaac_render_shell_a150d0_grow_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A150D0_GROW_VA);
}

extern "C" uint32_t isaac_render_shell_a150d0_type_free_max(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A150D0_TYPE_FREE_MAX);
}

extern "C" uint32_t isaac_render_shell_a150d0_vec18_magic(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A150D0_VEC18_MAGIC);
}

extern "C" uint32_t isaac_render_shell_a150d0_vec18_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A150D0_VEC18_OFF);
}

extern "C" uint32_t isaac_render_shell_a150d0_vec18_end_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A150D0_VEC18_END_OFF);
}

extern "C" uint32_t isaac_render_shell_a150d0_vec18_stride(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A150D0_VEC18_STRIDE);
}

extern "C" uint32_t isaac_render_shell_a150d0_vec_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A150D0_VEC_OFF);
}

extern "C" uint32_t isaac_render_shell_a150d0_vec_end_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A150D0_VEC_END_OFF);
}

extern "C" uint32_t isaac_render_shell_a150d0_vec_cap_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A150D0_VEC_CAP_OFF);
}

extern "C" uint32_t isaac_render_shell_a150d0_elem_type_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A150D0_ELEM_TYPE_OFF);
}

extern "C" uint32_t isaac_render_shell_a150d0_elem_inner_begin_off(void) {
  return static_cast<uint32_t>(
      ISAAC_RENDER_SHELL_A150D0_ELEM_INNER_BEGIN_OFF);
}

extern "C" uint32_t isaac_render_shell_a150d0_elem_inner_end_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A150D0_ELEM_INNER_END_OFF);
}

extern "C" uint32_t isaac_render_shell_a150d0_elem_inner_cap_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A150D0_ELEM_INNER_CAP_OFF);
}

extern "C" uint32_t isaac_render_shell_a150d0_retain_store_size(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A150D0_RETAIN_STORE_SIZE);
}

extern "C" uint32_t isaac_render_shell_a150d0_push_dec(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A150D0_PUSH_DEC);
}

/* Layout invariants recovered from the PE body. */
static_assert((uint32_t)ISAAC_RENDER_SHELL_A150D0_HOST_VA == 0x00a150d0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A150D0_END_VA == 0x00a15296u,
              "SEH+GS body 0xa150d0; ret @ 0xa15296");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A150D0_NEXT_VA == 0x00a152a0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A150D0_NEXT_VA -
                          (uint32_t)ISAAC_RENDER_SHELL_A150D0_END_VA ==
                      10u,
              "int3 pad 0xa15297..0xa1529f then vec18 push leaf 0xa152a0");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A150D0_VTABLE_VA ==
                      (uint32_t)ISAAC_RENDER_SHELL_A149A0_VTABLE_VA &&
                  (uint32_t)ISAAC_RENDER_SHELL_A150D0_VTABLE_SLOT == 0x14u,
              "fourth method of the 0xb81bac vtable (slot +0x14)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A150D0_FREE_IAT_VA ==
                      (uint32_t)ISAAC_RENDER_SHELL_A149A0_FREE_IAT_VA &&
                  (uint32_t)ISAAC_RENDER_SHELL_A150D0_COUNTER_SEL_VA ==
                      (uint32_t)ISAAC_RENDER_SHELL_A149A0_COUNTER_SEL_VA &&
                  (uint32_t)ISAAC_RENDER_SHELL_A150D0_COUNTER_FALLBACK_VA ==
                      (uint32_t)ISAAC_RENDER_SHELL_A149A0_COUNTER_FALLBACK_VA &&
                  (uint32_t)ISAAC_RENDER_SHELL_A150D0_COUNTER_OFF ==
                      (uint32_t)ISAAC_RENDER_SHELL_A149A0_COUNTER_OFF,
              "SAME tracked-free template as a149a0 (v42): free IAT "
              "0xb187dc, counter select 0xc7de78 / fallback 0xc7f618, "
              "offset +0x30");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A150D0_COUNTER_HI_OFF == 4u,
              "lo at base+0, sbb hi at base+4 (64-bit alloc counter)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A150D0_GROW_VA ==
                      (uint32_t)ISAAC_RENDER_SHELL_A14C00_GROW_VA,
              "both 42c920 grow call sites (0xa151cb / 0xa15259) use "
              "the a14c00 (v43) push helper");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A150D0_VEC18_MAGIC ==
                      (uint32_t)ISAAC_RENDER_SHELL_A14C00_VEC18_MAGIC &&
                  (uint32_t)ISAAC_RENDER_SHELL_A150D0_VEC18_STRIDE ==
                      (uint32_t)ISAAC_RENDER_SHELL_A14C00_ELEM_STRIDE &&
                  (uint32_t)ISAAC_RENDER_SHELL_A150D0_VEC18_OFF ==
                      (uint32_t)ISAAC_RENDER_SHELL_A14C00_VEC18_OFF,
              "cross-ABI template: same vec18 magic div / stride / "
              "this+0x34 base as a14c00 (v43) / a149a0 (v42)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A150D0_ELEM_TYPE_OFF ==
                          (uint32_t)ISAAC_RENDER_SHELL_A14C00_ELEM_VALUE_OFF &&
                      (uint32_t)ISAAC_RENDER_SHELL_A150D0_ELEM_INNER_BEGIN_OFF ==
                          (uint32_t)ISAAC_RENDER_SHELL_A14C00_ELEM_INNER_BEGIN_OFF &&
                      (uint32_t)ISAAC_RENDER_SHELL_A150D0_ELEM_INNER_END_OFF ==
                          (uint32_t)ISAAC_RENDER_SHELL_A14C00_ELEM_INNER_END_OFF &&
                      (uint32_t)ISAAC_RENDER_SHELL_A150D0_ELEM_INNER_CAP_OFF ==
                          (uint32_t)ISAAC_RENDER_SHELL_A14C00_ELEM_INNER_CAP_OFF,
              "0x18-element inner layout shared with a14c00 (v43) / "
              "a149a0 (v42): type +8, inner vec +0xc/+0x10/+0x14");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A150D0_VEC_OFF ==
                          (uint32_t)ISAAC_RENDER_SHELL_A14C00_VEC_OFF &&
                      (uint32_t)ISAAC_RENDER_SHELL_A150D0_VEC_END_OFF ==
                          (uint32_t)ISAAC_RENDER_SHELL_A14C00_VEC_END_OFF &&
                      (uint32_t)ISAAC_RENDER_SHELL_A150D0_VEC_CAP_OFF ==
                          (uint32_t)ISAAC_RENDER_SHELL_A14C00_VEC_CAP_OFF,
              "Phase B vec = the a14c00 step-6 rewalk target "
              "(&this+0x40, end +0x44, cap +0x48)");

/* ===========================================================================
 * ABI v46: FUN_00a152a0 vec18 push element helper (the a14c00 v43
 * PUSH_VA leaf)
 *
 * Body VA 0x00a152a0..0x00a15301, ret 4 (this=ecx, elem@[ebp+8]),
 * plain ebp frame (no SEH/GS). Appends the 0x18-byte source element
 * to the vec18 (begin@+0 / end@+4 / cap@+8): FULL gate `cmp
 * [this+4],[this+8]; je grow` fires the grow request on EQUALITY
 * (end == cap); the direct append copies 6 dwords (name/flag/value +
 * inner vec begin/end/cap with source inner vec zeroed) and advances
 * end += 0x18 (wrap). The grow path pushes elem then end and calls
 * 0xa153a0 (this=ecx untouched) — the vec18 grow IAT (ret 8; HOST:
 * alloc 0x40cf00 / memmove 0x915eb0 / inner destroy 0x4149d0 / sized
 * free 0xaef15c — all host, standing decision). Exported laws are
 * pure scalars (no host memory read): the end==cap grow gate, the
 * 0x18 stride append, the growth-request ABI pins and layout.
 * NARROWED not removed. NEXT_VA 0x00a153a0 (the grow IAT).
 * PE evidence: section-notes/cpu-dump/00a152a0.txt
 * =========================================================================== */

extern "C" int32_t isaac_render_shell_a152a0_grow_needed(uint32_t end,
                                                          uint32_t cap) {
  /* VA 0x00a152aa..0x00a152ad: `cmp ebx,[edi+8]; je 0xa152f5` where
     ebx = [this+4] (end) — the vec18 grow request fires on EQUALITY
     (end == cap); the direct append runs when end != cap. SAME
     cmp/je EQUALITY law as the two 42c920 grow gates in a150d0 (v45)
     — pinned equal in tests. */
  return (end == cap) ? 1 : 0;
}

extern "C" uint32_t isaac_render_shell_a152a0_append_end(uint32_t end) {
  /* VA 0x00a152ea: `add dword ptr [edi+4],0x18` — the direct-path
     end advance, 32-bit wrap (a 0xfffffff0 end appends to 0x8). */
  return end + static_cast<uint32_t>(0x18u);
}

extern "C" uint32_t isaac_render_shell_a152a0_copied_dwords(void) {
  /* VA 0x00a152b3..0x00a152e7: 6 dwords (0x18 bytes) copied: 3 head
     (name+0 / flag+4 / value+8) + 3 inner-vec move (+0xc/+0x10/+0x14)
     with the source inner vec zeroed. */
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A152A0_COPIED_DWORDS);
}

extern "C" uint32_t isaac_render_shell_a152a0_grow_stack_args(void) {
  /* VA 0x00a152f5..0x00a152f9: the grow request pushes elem then end
     (2 stack args) and calls 0xa153a0, which `ret 8`s — both args
     are cleaned by the callee. */
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A152A0_GROW_STACK_ARGS);
}

extern "C" uint32_t isaac_render_shell_a152a0_grow_end_arg_off(void) {
  /* Grow IAT ABI: end is pushed LAST so a153a0 reads it at [ebp+8]
     (`mov edx,[ebp+8]` at 0xa153a3); elem follows at [ebp+0xc]
     (`mov esi,[ebp+0xc]` at 0xa1542b). */
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A152A0_GROW_END_ARG_OFF);
}

extern "C" uint32_t isaac_render_shell_a152a0_grow_elem_arg_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A152A0_GROW_ELEM_ARG_OFF);
}

extern "C" uint32_t isaac_render_shell_a152a0_grow_callee_va(void) {
  /* VA 0x00a152f9: `call 0xa153a0` — the vec18 grow IAT (host). */
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A152A0_GROW_CALLEE_VA);
}

extern "C" uint32_t isaac_render_shell_a152a0_host_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A152A0_HOST_VA);
}

extern "C" uint32_t isaac_render_shell_a152a0_end_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A152A0_END_VA);
}

extern "C" uint32_t isaac_render_shell_a152a0_next_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A152A0_NEXT_VA);
}

extern "C" uint32_t isaac_render_shell_a152a0_vec_begin_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A152A0_VEC_BEGIN_OFF);
}

extern "C" uint32_t isaac_render_shell_a152a0_vec_end_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A152A0_VEC_END_OFF);
}

extern "C" uint32_t isaac_render_shell_a152a0_vec_cap_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A152A0_VEC_CAP_OFF);
}

extern "C" uint32_t isaac_render_shell_a152a0_elem_name_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A152A0_ELEM_NAME_OFF);
}

extern "C" uint32_t isaac_render_shell_a152a0_elem_flag_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A152A0_ELEM_FLAG_OFF);
}

extern "C" uint32_t isaac_render_shell_a152a0_elem_value_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A152A0_ELEM_VALUE_OFF);
}

extern "C" uint32_t isaac_render_shell_a152a0_elem_inner_begin_off(void) {
  return static_cast<uint32_t>(
      ISAAC_RENDER_SHELL_A152A0_ELEM_INNER_BEGIN_OFF);
}

extern "C" uint32_t isaac_render_shell_a152a0_elem_inner_end_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A152A0_ELEM_INNER_END_OFF);
}

extern "C" uint32_t isaac_render_shell_a152a0_elem_inner_cap_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A152A0_ELEM_INNER_CAP_OFF);
}

extern "C" uint32_t isaac_render_shell_a152a0_elem_stride(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A152A0_ELEM_STRIDE);
}

extern "C" uint32_t isaac_render_shell_a152a0_stack_args(void) {
  /* ret 4 — ONE stack arg (elem); this arrives in ecx. */
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A152A0_STACK_ARGS);
}

/* Layout invariants recovered from the PE body. */
static_assert((uint32_t)ISAAC_RENDER_SHELL_A152A0_HOST_VA == 0x00a152a0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A152A0_END_VA == 0x00a15301u,
              "plain ebp body 0xa152a0; direct ret @ 0xa152f2, grow ret "
              "@ 0xa15301");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A152A0_NEXT_VA == 0x00a153a0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A152A0_NEXT_VA -
                          (uint32_t)ISAAC_RENDER_SHELL_A152A0_END_VA ==
                      0x9fu,
              "int3 pad 0xa15302..0xa1539f then the vec18 grow IAT "
              "0xa153a0 (ret 8)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A152A0_GROW_CALLEE_VA ==
                      (uint32_t)ISAAC_RENDER_SHELL_A152A0_NEXT_VA,
              "the grow request at 0xa152f9 targets the next body "
              "0xa153a0");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A152A0_HOST_VA ==
                      (uint32_t)ISAAC_RENDER_SHELL_A14C00_PUSH_VA,
              "this IS the a14c00 (v43) PUSH_VA leaf");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A152A0_HOST_VA ==
                      (uint32_t)ISAAC_RENDER_SHELL_A150D0_NEXT_VA,
              "v45's recorded handoff: NEXT_VA 0xa152a0");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A152A0_ELEM_STRIDE ==
                          (uint32_t)ISAAC_RENDER_SHELL_A14C00_ELEM_STRIDE &&
                      (uint32_t)ISAAC_RENDER_SHELL_A152A0_ELEM_STRIDE ==
                          (uint32_t)ISAAC_RENDER_SHELL_A149A0_VEC_STRIDE,
              "0x18 element/vec18 stride shared with a14c00 (v43) / "
              "a149a0 (v42)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A152A0_ELEM_INNER_BEGIN_OFF ==
                          (uint32_t)ISAAC_RENDER_SHELL_A14C00_ELEM_INNER_BEGIN_OFF &&
                      (uint32_t)ISAAC_RENDER_SHELL_A152A0_ELEM_INNER_END_OFF ==
                          (uint32_t)ISAAC_RENDER_SHELL_A14C00_ELEM_INNER_END_OFF &&
                      (uint32_t)ISAAC_RENDER_SHELL_A152A0_ELEM_INNER_CAP_OFF ==
                          (uint32_t)ISAAC_RENDER_SHELL_A14C00_ELEM_INNER_CAP_OFF,
              "elem inner vec +0xc/+0x10/+0x14 shared with a14c00 (v43) "
              "/ a149a0 (v42) / a150d0 (v45)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A152A0_GROW_END_ARG_OFF == 8u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A152A0_GROW_ELEM_ARG_OFF == 0xcu &&
                  (uint32_t)ISAAC_RENDER_SHELL_A152A0_GROW_STACK_ARGS == 2u,
              "grow IAT ABI: push elem, push end, call a153a0 (ret 8) — "
              "callee sees end at [ebp+8], elem at [ebp+0xc]");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A152A0_STACK_ARGS == 1u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A152A0_COPIED_DWORDS == 6u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A152A0_ELEM_STRIDE == 0x18u,
              "ret 4 / one stack arg; the direct append copies 6 dwords "
              "= 0x18 bytes");

/* ===========================================================================
 * ABI v47: FUN_00a153a0 vec18 grow IAT (the a152a0 v46 grow request
 * target) — pure growth-factor laws
 *
 * Body VA 0x00a153a0..0x00a15522, ret 8 (this=ecx, 2 stack args:
 * end@[ebp+8], elem@[ebp+0xc]), plain ebp frame (no SEH/GS). Realloc
 * push for the vec18 when end == cap: magic-div count TWICE (arg end
 * 0xa153b3 and this->end 0xa153b5..d5; equal at entry), EQUALITY
 * MAX-SIZE guard (cmp count,0xaaaaaaa; je 0xa15542 host fatal),
 * new_count = count+1, magic-div cap_count, UNSIGNED cap gate (jbe:
 * cap_count <= 0xaaaaaaa - cap_count/2 -> the 1.5x tail, else CLAMP
 * new_cap = 0xaaaaaaa), shared bytes path (new_cap*0x18 wrap), alloc
 * 0x40cf00 / memmove 0x915eb0 x2 / inner destroy 0x4149d0 / sized
 * free 0xaef15c (all host), UNSIGNED free-size header gate (bytes >=
 * 0x1000), writeback begin/end/cap. Growth tail 0xa15525..0xa15537:
 * lea eax,[edx+ecx] = cap_count + cap_count/2 (32-bit wrap); cmovae
 * UNSIGNED max(new_count, growth); cmp/ja 0xaaaaaaa overflow recheck
 * (host fatal tail, unreachable in reachable states); jmp 0xa15416.
 * Exported laws are pure scalars (no host memory read); all
 * alloc/memmove/destroy/free stay host (standing decision).
 * NARROWED not removed. NEXT_VA 0x00a15550 (float clamp body
 * 0xa15550..0xa15560, maxss/minss .rdata operands).
 * PE evidence: section-notes/cpu-dump/00a153a0.txt + 00a15525.txt
 * =========================================================================== */

extern "C" int32_t isaac_render_shell_a153a0_vec18_count(uint32_t begin,
                                                         uint32_t end) {
  /* VA 0x00a153a3..0x00a153d5: count derived TWICE — from the ARG end
     (0xa153b3 `sub edx,[edi]`; imul; sar edx,2; shr esi,0x1f; add —
     esi) and from this->end (0xa153b5 `mov ecx,[edi+4]`; sub;
     imul; sar edx,2; shr eax,0x1f; add — eax). Both are the SAME
     magic SIGNED div by 0x18 of (end - begin) (0x2aaaaaab
     template); equal at entry. Same law as a149a0 (v42) / a150d0
     (v45) vec18_count — pinned equal in tests. */
  const uint32_t span = end - begin;
  const int32_t sl = static_cast<int32_t>(span);
  const int64_t prod = static_cast<int64_t>(sl) * 0x2aaaaaabLL;
  const int32_t hi =
      static_cast<int32_t>(static_cast<uint32_t>(prod >> 32)) >> 2;
  const int32_t sign = (hi >> 31) & 1; /* shr edx,0x1f then add */
  return hi + sign;
}

extern "C" int32_t isaac_render_shell_a153a0_max_size_guard(uint32_t count) {
  /* VA 0x00a153d7..0x00a153dc: `cmp eax,0xaaaaaaa; je 0xa15542` —
     the MAX-SIZE guard fires on EQUALITY (count == 0xaaaaaaa) and
     jumps to the host fatal tail (0x415bc0 + 0x40cee0 + int3). */
  return (count == ISAAC_RENDER_SHELL_A153A0_MAX_SIZE) ? 1 : 0;
}

extern "C" uint32_t isaac_render_shell_a153a0_new_count(uint32_t count) {
  /* VA 0x00a153e5: `lea ebx,[eax+1]` — new_count = count + 1,
     32-bit wrap (0xffffffff -> 0). */
  return count + 1u;
}

extern "C" uint32_t isaac_render_shell_a153a0_cap_halved(uint32_t cap_count) {
  /* VA 0x00a15405: `shr edx,1` — UNSIGNED half of cap_count (used by
     both the 1.5x growth and the gate rhs). */
  return cap_count >> 1;
}

extern "C" int32_t isaac_render_shell_a153a0_cap_gate(uint32_t cap_count) {
  /* VA 0x00a15403..0x00a1540b: edx = cap_count; `shr edx,1`
     (UNSIGNED); eax = 0xaaaaaaa; `sub eax,edx` (rhs, 32-bit wrap);
     `cmp ecx,eax; jbe 0xa15525` — UNSIGNED: cap_count <=
     0xaaaaaaa - cap_count/2 keeps the 1.5x growth tail; else the
     CLAMP path (new_cap = 0xaaaaaaa at 0xa15411). */
  const uint32_t half = cap_count >> 1;
  const uint32_t rhs =
      static_cast<uint32_t>(ISAAC_RENDER_SHELL_A153A0_MAX_SIZE) - half;
  return (cap_count <= rhs) ? 1 : 0;
}

extern "C" uint32_t isaac_render_shell_a153a0_growth_factor(
    uint32_t cap_count) {
  /* VA 0x00a15525: `lea eax,[edx+ecx]` where edx = cap_count >> 1
     (UNSIGNED shr) and ecx = cap_count — 1.5x ELEMENT growth,
     32-bit wrap. */
  return cap_count + (cap_count >> 1);
}

extern "C" uint32_t isaac_render_shell_a153a0_grown_cap(uint32_t new_count,
                                                        uint32_t cap_count) {
  /* VA 0x00a1552a..0x00a1552c: `cmp eax,ebx; cmovae ecx,eax` —
     UNSIGNED max: new_cap = growth >= new_count ? growth : new_count
     (ae = CF clear & ZF clear, i.e. eax >= ebx unsigned). */
  const uint32_t growth = isaac_render_shell_a153a0_growth_factor(cap_count);
  return (growth >= new_count) ? growth : new_count;
}

extern "C" int32_t isaac_render_shell_a153a0_cap_overflow(uint32_t new_cap) {
  /* VA 0x00a1552f..0x00a15535: `cmp ecx,0xaaaaaaa; ja 0xa15547` —
     UNSIGNED new_cap > 0xaaaaaaa jumps to the host fatal tail
     (0x40cee0 + int3); unreachable in reachable states (gate keeps
     growth <= MAX and the guard keeps count < MAX -> new_count <=
     MAX). */
  return (new_cap > ISAAC_RENDER_SHELL_A153A0_MAX_SIZE) ? 1 : 0;
}

extern "C" uint32_t isaac_render_shell_a153a0_next_cap(uint32_t new_count,
                                                       uint32_t cap_count) {
  /* Composite new_cap law: gate false -> CLAMP 0xaaaaaaa (0xa15411
     `mov ecx,0xaaaaaaa`); gate true -> the cmovae max from the
     0xa15525 tail. A result > MAX means the PE took the host
     overflow fatal tail (0xa15547) and never wrote back. */
  if (isaac_render_shell_a153a0_cap_gate(cap_count) == 0) {
    return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A153A0_MAX_SIZE);
  }
  return isaac_render_shell_a153a0_grown_cap(new_count, cap_count);
}

extern "C" uint32_t isaac_render_shell_a153a0_bytes_for_cap(
    uint32_t new_cap) {
  /* VA 0x00a15416..0x00a15419 (shared bytes path, entered from clamp
     fall-through or the tail jmp 0xa15537): `lea eax,[ecx+ecx*2];
     shl eax,3` — new_bytes = new_cap*0x18, 32-bit wrap (MAX*0x18 =
     0xfffffff0; 0xaaaaaab*0x18 -> 0x8). */
  return static_cast<uint32_t>(new_cap) *
         static_cast<uint32_t>(ISAAC_RENDER_SHELL_A153A0_ELEM_STRIDE);
}

extern "C" uint32_t isaac_render_shell_a153a0_slot_off(uint32_t count) {
  /* VA 0x00a15428..0x00a1542e: `lea eax,[esi+esi*2]; lea
     ecx,[ebx+eax*8]` — the new element slot offset = count*0x18
     (32-bit wrap; slot = newbuf + count*24). */
  return static_cast<uint32_t>(count) *
         static_cast<uint32_t>(ISAAC_RENDER_SHELL_A153A0_ELEM_STRIDE);
}

extern "C" uint32_t isaac_render_shell_a153a0_writeback_end_off(
    uint32_t new_count) {
  /* VA 0x00a1550b..0x00a1550e: `lea ecx,[ecx+ecx*2]; lea
     ecx,[ebx+ecx*8]` — new this->end offset = new_count*0x18 (same
     law as slot_off; pinned equal in tests). */
  return static_cast<uint32_t>(new_count) *
         static_cast<uint32_t>(ISAAC_RENDER_SHELL_A153A0_ELEM_STRIDE);
}

extern "C" int32_t isaac_render_shell_a153a0_free_size_gate(
    uint32_t bytes) {
  /* VA 0x00a154dd..0x00a154e2: `cmp eax,0x1000; jb 0xa154f6` —
     UNSIGNED: bytes >= 0x1000 takes the header sized-free path
     (reads [old_begin-4] and adjusts); bytes < 0x1000 plain
     free(ptr, bytes). */
  return (bytes >= ISAAC_RENDER_SHELL_A153A0_FREE_HEADER_MIN) ? 1 : 0;
}

extern "C" uint32_t isaac_render_shell_a153a0_free_bytes(
    uint32_t cap_count) {
  /* VA 0x00a154d7..0x00a154da: `lea eax,[eax+eax*2]; shl eax,3` —
     old_bytes = old_cap_count*0x18 (cap_count RE-DERIVED at
     0xa154c1..0xa154d5, same magic law) — same law as bytes_for_cap;
     pinned equal in tests. */
  return static_cast<uint32_t>(cap_count) *
         static_cast<uint32_t>(ISAAC_RENDER_SHELL_A153A0_ELEM_STRIDE);
}

extern "C" uint32_t isaac_render_shell_a153a0_host_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A153A0_HOST_VA);
}

extern "C" uint32_t isaac_render_shell_a153a0_end_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A153A0_END_VA);
}

extern "C" uint32_t isaac_render_shell_a153a0_next_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A153A0_NEXT_VA);
}

extern "C" uint32_t isaac_render_shell_a153a0_max_size(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A153A0_MAX_SIZE);
}

extern "C" uint32_t isaac_render_shell_a153a0_vec18_magic(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A153A0_VEC18_MAGIC);
}

extern "C" uint32_t isaac_render_shell_a153a0_elem_stride(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A153A0_ELEM_STRIDE);
}

extern "C" uint32_t isaac_render_shell_a153a0_copied_dwords(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A153A0_COPIED_DWORDS);
}

extern "C" uint32_t isaac_render_shell_a153a0_stack_args(void) {
  /* ret 8 — TWO stack args (end, elem) cleaned by the callee. */
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A153A0_STACK_ARGS);
}

extern "C" uint32_t isaac_render_shell_a153a0_free_header_min(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A153A0_FREE_HEADER_MIN);
}

extern "C" uint32_t isaac_render_shell_a153a0_alloc_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A153A0_ALLOC_VA);
}

extern "C" uint32_t isaac_render_shell_a153a0_memmove_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A153A0_MEMMOVE_VA);
}

extern "C" uint32_t isaac_render_shell_a153a0_inner_destroy_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A153A0_INNER_DESTROY_VA);
}

extern "C" uint32_t isaac_render_shell_a153a0_sized_free_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A153A0_SIZED_FREE_VA);
}

extern "C" uint32_t isaac_render_shell_a153a0_max_size_err_tail(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A153A0_MAX_SIZE_ERR_TAIL);
}

extern "C" uint32_t isaac_render_shell_a153a0_overflow_err_tail(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A153A0_OVERFLOW_ERR_TAIL);
}

extern "C" uint32_t isaac_render_shell_a153a0_free_edge_iat_va(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A153A0_FREE_EDGE_IAT_VA);
}

extern "C" uint32_t isaac_render_shell_a153a0_vec_begin_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A153A0_VEC_BEGIN_OFF);
}

extern "C" uint32_t isaac_render_shell_a153a0_vec_end_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A153A0_VEC_END_OFF);
}

extern "C" uint32_t isaac_render_shell_a153a0_vec_cap_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A153A0_VEC_CAP_OFF);
}

extern "C" uint32_t isaac_render_shell_a153a0_elem_inner_begin_off(void) {
  return static_cast<uint32_t>(
      ISAAC_RENDER_SHELL_A153A0_ELEM_INNER_BEGIN_OFF);
}

extern "C" uint32_t isaac_render_shell_a153a0_elem_inner_end_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A153A0_ELEM_INNER_END_OFF);
}

extern "C" uint32_t isaac_render_shell_a153a0_elem_inner_cap_off(void) {
  return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A153A0_ELEM_INNER_CAP_OFF);
}

/* Layout invariants recovered from the two PE dumps. */
static_assert((uint32_t)ISAAC_RENDER_SHELL_A153A0_HOST_VA == 0x00a153a0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A153A0_END_VA == 0x00a15522u,
              "plain ebp body 0xa153a0; ret 8 @ 0xa15522 (the 1.5x tail "
              "0xa15525..0xa15547 sits AFTER the ret in address order "
              "and rejoins at 0xa15416 / the fatal tails)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A153A0_NEXT_VA == 0x00a15550u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A153A0_NEXT_VA -
                          (uint32_t)ISAAC_RENDER_SHELL_A153A0_END_VA ==
                      0x2eu,
              "int3 pad 0xa1554c..0xa1554f then the float clamp body "
              "0xa15550 (maxss/minss)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A153A0_HOST_VA ==
                      (uint32_t)ISAAC_RENDER_SHELL_A152A0_GROW_CALLEE_VA,
              "v46's recorded handoff: this IS the grow IAT the a152a0 "
              "request calls (0xa152f9)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A153A0_MAX_SIZE == 0x0aaaaaaau &&
                  (uint32_t)ISAAC_RENDER_SHELL_A153A0_VEC18_MAGIC ==
                      0x2aaaaaabu &&
                  (uint32_t)ISAAC_RENDER_SHELL_A153A0_ELEM_STRIDE == 0x18u,
              "0xaaaaaaa elements * 0x18 = 0xfffffff0 <= 0xffffffff (max "
              "element count whose byte size fits 32 bits); SAME vec18 "
              "magic/stride template as v42/v43/v45");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A153A0_VEC18_MAGIC ==
                      (uint32_t)ISAAC_RENDER_SHELL_A149A0_VEC18_MAGIC &&
                  (uint32_t)ISAAC_RENDER_SHELL_A153A0_ELEM_STRIDE ==
                      (uint32_t)ISAAC_RENDER_SHELL_A149A0_VEC_STRIDE &&
                  (uint32_t)ISAAC_RENDER_SHELL_A153A0_ELEM_STRIDE ==
                      (uint32_t)ISAAC_RENDER_SHELL_A14C00_ELEM_STRIDE,
              "vec18 magic 0x2aaaaaab + 0x18 stride shared with a149a0 "
              "(v42) / a14c00 (v43) / a150d0 (v45)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A153A0_INNER_DESTROY_VA ==
                      (uint32_t)ISAAC_RENDER_SHELL_A149A0_VEC_DESTROY_VA,
              "the per-old-element inner vec destroy at 0xa154b3 is the "
              "SAME 0x4149d0 vec destroy a149a0 uses (v42)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A153A0_SIZED_FREE_VA ==
                      (uint32_t)ISAAC_RENDER_SHELL_A14C00_SIZED_FREE_VA,
              "the sized free at 0xa154f8 is the SAME 0xaef15c a14c00 "
              "(v43) uses");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A153A0_ELEM_INNER_BEGIN_OFF ==
                          (uint32_t)ISAAC_RENDER_SHELL_A14C00_ELEM_INNER_BEGIN_OFF &&
                      (uint32_t)ISAAC_RENDER_SHELL_A153A0_ELEM_INNER_END_OFF ==
                          (uint32_t)ISAAC_RENDER_SHELL_A14C00_ELEM_INNER_END_OFF &&
                      (uint32_t)ISAAC_RENDER_SHELL_A153A0_ELEM_INNER_CAP_OFF ==
                          (uint32_t)ISAAC_RENDER_SHELL_A14C00_ELEM_INNER_CAP_OFF,
              "elem inner vec +0xc/+0x10/+0x14 shared with a14c00 (v43) "
              "/ a149a0 (v42) / a150d0 (v45) / a152a0 (v46)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A153A0_STACK_ARGS == 2u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A153A0_COPIED_DWORDS == 6u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A153A0_FREE_HEADER_MIN ==
                      0x1000u,
              "ret 8 clears 2 stack args (end, elem); the elem copy is 6 "
              "dwords = 0x18 bytes; bytes >= 0x1000 takes the header "
              "sized-free path (jb 0xa154e2)");

/* ===========================================================================
 * ABI v48: FUN_00a15550 float clamp01 — PURE leaf, fully in-module
 *
 * Body VA 0x00a15550..0x00a15560: `maxss xmm0,[0xba9fe4]` (0xa15550),
 * `minss xmm0,[0xbaa454]` (0xa15558), `ret` (0xa15560). xmm0 in /
 * xmm0 out; no stores; no calls. .rdata operands read via the section
 * table (.rdata VA 0xb18000 raw 0x716600): lo = 0xba9fe4 -> raw
 * 0x7a85e4 = 00000000 (f32 +0.0), hi = 0xbaa454 -> raw 0x7a8a54 =
 * 0000803f (f32 1.0). MAXSS/MINSS return the SECOND operand when the
 * compare is unordered (NaN) or the values compare equal (incl. both
 * zeros of either sign) — i.e. m = (x>lo)?x:lo then r = (m<hi)?m:hi:
 * NaN -> +0.0f, -0.0f -> +0.0f (sign normalized), x<0 -> +0.0f,
 * 0<=x<=1 identity, x>1 -> 1.0f, +inf -> 1.0f, -inf -> +0.0f. Single
 * direct rel32 caller 0x007734e6 (divss [0xbaa8a0]=25.0f before,
 * mulss [0xbaa904]=40.0f after).
 * NEXT_VA 0x00a15570 (the is-power-of-two gate 0xa15570..0xa15580, landed
 * ABI v56 — the v48 "bare ret stub" read was a misread; bytes
 * 85 c9 74 0a 8d 41 ff 85 c1 75 03 b0 01 c3 32 c0 c3 are a real body).
 * Then next-pow2 leaf 0xa15590..0xa155b0, 2 direct callers
 * 0x00a12d8e / 0x00a12d98.
 * PE evidence: section-notes/cpu-dump/00a15525.txt + 00a15540.txt
 * =========================================================================== */

/* Layout invariants recovered from the PE dumps. */
static_assert((uint32_t)ISAAC_RENDER_SHELL_A15550_HOST_VA == 0x00a15550u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A15550_END_VA == 0x00a15560u,
              "maxss @ 0xa15550, minss @ 0xa15558, ret @ 0xa15560");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A15550_NEXT_VA == 0x00a15570u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A15550_NEXT_VA -
                          (uint32_t)ISAAC_RENDER_SHELL_A15550_END_VA ==
                      0x10u,
              "int3 pad 0xa15561..0xa1556f, then the v56 is-pow2 gate "
              "0xa15570..0xa15580");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A15550_LO_VA == 0x00ba9fe4u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A15550_HI_VA == 0x00baa454u &&
                  ISAAC_RENDER_SHELL_A15550_LO_BITS == 0x00000000u &&
                  ISAAC_RENDER_SHELL_A15550_HI_BITS == 0x3f800000u,
              "maxss operand 0xba9fe4 = +0.0f, minss operand 0xbaa454 = "
              "1.0f (.rdata; raw 0x7a85e4 / 0x7a8a54)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A15550_CALLER_VA == 0x007734e6u,
              "census-callers: exactly 1 direct rel32 caller (0x7734e6)");

extern "C" float isaac_render_shell_a15550_clamp01(float x) {
  /* VA 0x00a15550: maxss xmm0,[0xba9fe4] — result is the SECOND
     operand when x is NOT strictly greater (NaN unordered, both-zero
     equality incl. -0.0/+0.0, x < lo): m = (x > lo) ? x : lo. NaN
     collapses to +0.0f; -0.0f normalizes to +0.0f.
     VA 0x00a15558: minss xmm0,[0xbaa454] — result is the SECOND
     operand when m is NOT strictly less (NaN impossible after maxss,
     equality at hi, m > hi): r = (m < hi) ? m : hi. */
  const float lo = 0.0f;
  const float hi = 1.0f;
  const float m = (x > lo) ? x : lo;
  return (m < hi) ? m : hi;
}

extern "C" uint32_t isaac_render_shell_a15550_host_va(void) {
  return ISAAC_RENDER_SHELL_A15550_HOST_VA;
}
extern "C" uint32_t isaac_render_shell_a15550_end_va(void) {
  return ISAAC_RENDER_SHELL_A15550_END_VA;
}
extern "C" uint32_t isaac_render_shell_a15550_next_va(void) {
  return ISAAC_RENDER_SHELL_A15550_NEXT_VA;
}
extern "C" uint32_t isaac_render_shell_a15550_lo_va(void) {
  return ISAAC_RENDER_SHELL_A15550_LO_VA;
}
extern "C" uint32_t isaac_render_shell_a15550_hi_va(void) {
  return ISAAC_RENDER_SHELL_A15550_HI_VA;
}
extern "C" uint32_t isaac_render_shell_a15550_lo_bits(void) {
  return ISAAC_RENDER_SHELL_A15550_LO_BITS;
}
extern "C" uint32_t isaac_render_shell_a15550_hi_bits(void) {
  return ISAAC_RENDER_SHELL_A15550_HI_BITS;
}
extern "C" uint32_t isaac_render_shell_a15550_caller_va(void) {
  return ISAAC_RENDER_SHELL_A15550_CALLER_VA;
}

/* ============================================================================
 * ABI v49: 0xa15590 next-pow2 leaf. PE evidence:
 * section-notes/cpu-dump/00a15590.txt (raw disasm below).
 * =========================================================================== */

static_assert((uint32_t)ISAAC_RENDER_SHELL_A15590_HOST_VA == 0x00a15590u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A15590_END_VA == 0x00a155b0u,
              "push esi @0xa15590 .. pop esi/ret @0xa155af/0xa155b0");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A15590_NEXT_VA == 0x00a155c0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A15590_NEXT_VA -
                          (uint32_t)ISAAC_RENDER_SHELL_A15590_END_VA ==
                      0x10u,
              "int3 pad 0xa155b1..0xa155bf, then the clamped-lerp leaf "
              "0xa155c0 (56 direct callers)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A15590_CALLER_VA == 0x00a12d8eu &&
                  (uint32_t)ISAAC_RENDER_SHELL_A15590_CALLER2_VA ==
                      0x00a12d98u,
              "census-callers: exactly 2 direct rel32 callers 0xa12d8e / "
              "0xa12d98 (inputs gated unsigned vs a vtable size, abort "
              "path 0xa12e83)");
static_assert(ISAAC_RENDER_SHELL_A15590_MAX_TERMINATING == 0x7fffffffu &&
                  ISAAC_RENDER_SHELL_A15590_JE_LIMIT == 0x1u,
              "loop terminates iff n <= 0x7fffffff; je iff n in {0,1}");

extern "C" uint32_t isaac_render_shell_a15590_next_pow2(uint32_t n) {
  /* VA 0x00a15590: push esi
     VA 0x00a15591: mov esi,ecx      (n = thiscall arg)
     VA 0x00a15593: mov ecx,1
     VA 0x00a15598: mov eax,esi
     VA 0x00a1559a: shr eax,1        (eax = n>>1)
     VA 0x00a1559c: lea edx,[esi-1]  (edx = n-1)
     VA 0x00a1559f: je done          (ZF from shr eax,1 -> taken iff
                                      n in {0,1}: returns (n-1)+1 = n)
     loop: VA 0x00a155a1: or edx,eax
           VA 0x00a155a3: inc ecx
           VA 0x00a155a4: mov eax,esi
           VA 0x00a155a6: shr eax,cl (eax = n >> (cl & 31) in hardware)
           VA 0x00a155a8: test eax,eax
           VA 0x00a155aa: jne loop
     done: VA 0x00a155ac: lea eax,[edx+1]
           VA 0x00a155af: pop esi
           VA 0x00a155b0: ret
     The or-loop ORs n>>1, n>>2, ... into edx = n-1 until a shift
     yields 0, then +1: the smallest power of two >= n.
     DIVERGENCE corner: for n >= 0x80000000 the hardware masks the
     shift count to 5 bits, so `shr eax,cl` never clears bit 31 and
     the machine loops forever. Unreachable from the callers
     (0xa12d8e/0xa12d98 gate inputs with an unsigned `ja` to the
     abort path 0xa12e83). The port completes the corner with the
     machine's own accumulation result: edx would OR in n (shift by
     0) and every n>>1..n>>31 -> 0xFFFFFFFF -> +1 = 0 for every
     n >= 0x80000000 (0x80000000 -> 0, 0xffffffff -> 0). */
  if (n <= ISAAC_RENDER_SHELL_A15590_JE_LIMIT) return n;
  uint32_t edx = n - 1u;   /* lea edx,[esi-1] @0xa1559c */
  uint32_t eax = n >> 1u;  /* shr eax,1 @0xa1559a */
  uint32_t ecx = 1u;       /* mov ecx,1 @0xa15593 */
  while (eax != 0u && ecx < 32u) {  /* test/jne @0xa155a8/0xa155aa */
    edx |= eax;            /* or edx,eax @0xa155a1 */
    ++ecx;                 /* inc ecx @0xa155a3 */
    eax = n >> ecx;        /* shr eax,cl @0xa155a4..0xa155a6 */
  }
  if (eax != 0u) return 0u; /* n >= 0x80000000: PE diverges; completion */
  return edx + 1u;          /* lea eax,[edx+1] @0xa155ac */
}

extern "C" uint32_t isaac_render_shell_a15590_host_va(void) {
  return ISAAC_RENDER_SHELL_A15590_HOST_VA;
}
extern "C" uint32_t isaac_render_shell_a15590_end_va(void) {
  return ISAAC_RENDER_SHELL_A15590_END_VA;
}
extern "C" uint32_t isaac_render_shell_a15590_next_va(void) {
  return ISAAC_RENDER_SHELL_A15590_NEXT_VA;
}
extern "C" uint32_t isaac_render_shell_a15590_caller_va(void) {
  return ISAAC_RENDER_SHELL_A15590_CALLER_VA;
}
extern "C" uint32_t isaac_render_shell_a15590_caller2_va(void) {
  return ISAAC_RENDER_SHELL_A15590_CALLER2_VA;
}
extern "C" uint32_t isaac_render_shell_a15590_max_terminating(void) {
  return ISAAC_RENDER_SHELL_A15590_MAX_TERMINATING;
}
extern "C" uint32_t isaac_render_shell_a15590_je_limit(void) {
  return ISAAC_RENDER_SHELL_A15590_JE_LIMIT;
}

/* ============================================================================
 * ABI v50: 0xa155c0 clamped-lerp leaf. PE evidence:
 * section-notes/cpu-dump/00a155c0.txt (raw disasm below).
 * ============================================================================ */

static_assert((uint32_t)ISAAC_RENDER_SHELL_A155C0_HOST_VA == 0x00a155c0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A155C0_END_VA == 0x00a155e0u,
              "test cl,cl @0xa155c0 .. ret @0xa155e0");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A155C0_NEXT_VA == 0x00a155f0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A155C0_NEXT_VA -
                          (uint32_t)ISAAC_RENDER_SHELL_A155C0_END_VA ==
                      0x10u,
              "int3 pad 0xa155e1..0xa155ef, then the inverse-lerp host "
              "0xa155f0 (1 E8 to 0xa112c0)");
static_assert(ISAAC_RENDER_SHELL_A155C0_CALLER_COUNT == 56u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A155C0_CALLER_FIRST_VA ==
                      0x005dcac5u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A155C0_CALLER_LAST_VA ==
                      0x007e82e7u,
              "census-callers: exactly 56 direct rel32 callers "
              "(0x5dcac5 .. 0x7e82e7)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A155C0_LO_VA == 0x00ba9fe4u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A155C0_HI_VA == 0x00baa454u &&
                  ISAAC_RENDER_SHELL_A155C0_LO_BITS == 0x00000000u &&
                  ISAAC_RENDER_SHELL_A155C0_HI_BITS == 0x3f800000u &&
                  ISAAC_RENDER_SHELL_A155C0_LO_VA ==
                      (uint32_t)ISAAC_RENDER_SHELL_A15550_LO_VA &&
                  ISAAC_RENDER_SHELL_A155C0_HI_VA ==
                      (uint32_t)ISAAC_RENDER_SHELL_A15550_HI_VA &&
                  ISAAC_RENDER_SHELL_A155C0_LO_BITS ==
                      (uint32_t)ISAAC_RENDER_SHELL_A15550_LO_BITS &&
                  ISAAC_RENDER_SHELL_A155C0_HI_BITS ==
                      (uint32_t)ISAAC_RENDER_SHELL_A15550_HI_BITS,
              "clamp reuses the v48 clamp01 .rdata constants "
              "(lo 0xba9fe4 = +0.0f / hi 0xbaa454 = 1.0f)");

extern "C" float isaac_render_shell_a155c0_clamped_lerp(
    float y0, float y1, float t, uint32_t clamp_enabled_w) {
  /* VA 0x00a155c0: test cl,cl — the clamp is gated on the LOW byte
     of the flag (VA 0x00a155c2 je 0xa155d4 skips it when zero). */
  const uint8_t clamp_enabled =
      static_cast<uint8_t>(clamp_enabled_w & 0xffu);
  float tt = t;
  if (clamp_enabled != 0u) {
    /* VA 0x00a155c4 maxss xmm2,[0xba9fe4] (+0.0f) — result is the
       SECOND operand when tt is NOT strictly greater (NaN unordered,
       both-zero equality incl. -0.0/+0.0, tt < lo): m = (tt>0)?tt:0.
       NaN t collapses to +0.0f; -0.0f normalizes to +0.0f.
       VA 0x00a155cc minss xmm2,[0xbaa454] (1.0f) — result is the
       SECOND operand when m is NOT strictly less (m >= hi):
       r = (m<1)?m:1. */
    tt = (tt > 0.0f) ? tt : 0.0f;
    tt = (tt < 1.0f) ? tt : 1.0f;
  }
  /* VA 0x00a155d4 subss xmm1,xmm0  (d = y1 - y0, f32-rounded)
     VA 0x00a155d8 mulss xmm1,xmm2  (m = d * t, f32-rounded)
     VA 0x00a155dc addss xmm0,xmm1  (r = y0 + m, f32-rounded)
     VA 0x00a155e0 ret */
  const float d = y1 - y0;
  const float m = d * tt;
  return y0 + m;
}

extern "C" uint32_t isaac_render_shell_a155c0_host_va(void) {
  return ISAAC_RENDER_SHELL_A155C0_HOST_VA;
}
extern "C" uint32_t isaac_render_shell_a155c0_end_va(void) {
  return ISAAC_RENDER_SHELL_A155C0_END_VA;
}
extern "C" uint32_t isaac_render_shell_a155c0_next_va(void) {
  return ISAAC_RENDER_SHELL_A155C0_NEXT_VA;
}
extern "C" uint32_t isaac_render_shell_a155c0_caller_count(void) {
  return ISAAC_RENDER_SHELL_A155C0_CALLER_COUNT;
}
extern "C" uint32_t isaac_render_shell_a155c0_caller_first_va(void) {
  return ISAAC_RENDER_SHELL_A155C0_CALLER_FIRST_VA;
}
extern "C" uint32_t isaac_render_shell_a155c0_caller_last_va(void) {
  return ISAAC_RENDER_SHELL_A155C0_CALLER_LAST_VA;
}
extern "C" uint32_t isaac_render_shell_a155c0_lo_va(void) {
  return ISAAC_RENDER_SHELL_A155C0_LO_VA;
}
extern "C" uint32_t isaac_render_shell_a155c0_lo_bits(void) {
  return ISAAC_RENDER_SHELL_A155C0_LO_BITS;
}
extern "C" uint32_t isaac_render_shell_a155c0_hi_va(void) {
  return ISAAC_RENDER_SHELL_A155C0_HI_VA;
}
extern "C" uint32_t isaac_render_shell_a155c0_hi_bits(void) {
  return ISAAC_RENDER_SHELL_A155C0_HI_BITS;
}
extern "C" uint32_t isaac_render_shell_a155c0_clamp_off(void) {
  return ISAAC_RENDER_SHELL_A155C0_CLAMP_OFF;
}

/* ============================================================================
 * ABI v51: 0xa155f0 inverse-lerp leaf. PE evidence:
 * section-notes/cpu-dump/00a155f0.txt (raw disasm below).
 * ============================================================================ */

static_assert((uint32_t)ISAAC_RENDER_SHELL_A155F0_HOST_VA == 0x00a155f0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A155F0_END_VA == 0x00a1563eu,
              "ucomiss @0xa155f6 .. ret @0xa1563e");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A155F0_NEXT_VA == 0x00a15640u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A155F0_NEXT_VA -
                          (uint32_t)ISAAC_RENDER_SHELL_A155F0_END_VA ==
                      0x2u,
              "int3 @0xa1563f, then the next leaf 0xa15640 (movaps "
              "xmm4,xmm1 prologue, 40 direct callers, 1 E8 to 0xa112c0)");
static_assert(ISAAC_RENDER_SHELL_A155F0_CALLER_COUNT == 2u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A155F0_CALLER_FIRST_VA ==
                      0x0066aaa6u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A155F0_CALLER_LAST_VA ==
                      0x0078a3e0u,
              "census-callers: exactly 2 direct rel32 callers "
              "(0x66aaa6 / 0x78a3e0, full .text rel32 census)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A155F0_LOGGER_VA == 0x00a112c0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A155F0_LOG_MSG_VA ==
                      0x00b81bd8u &&
                  ISAAC_RENDER_SHELL_A155F0_LOG_MSG_LEN == 0x10u &&
                  ISAAC_RENDER_SHELL_A155F0_SPILL_COUNT == 3u,
              "logger arm: push 0xb81bd8 / push 0x10 / call 0xa112c0; "
              "3 dword spills (t/y1/y0)");

extern "C" uint32_t isaac_render_shell_a155f0_ordered_equal_gate(float y0,
                                                                 float y1) {
  /* VA 0x00a155f6 ucomiss xmm0,xmm1: y0 (xmm0) vs y1 (xmm1).
       ordered y0>y1: ZF=0 PF=0 | y0<y1: ZF=0 PF=0 | equal: ZF=1 PF=0
       unordered (NaN): ZF=1 PF=1.
     VA 0x00a15603 lahf: AH = SF:ZF:0:AF:0:PF:1:CF.
     VA 0x00a15609 test ah,0x44: AH&0x44 = (ZF<<6)|(PF<<2).
     VA 0x00a1560c jp 0xa1562c: taken iff test PF=1 (even parity of
       AH&0x44): 0x00 (ordered inequality) and 0x44 (NaN) skip the
       logger; only 0x40 (ordered equal, odd parity -> test PF=0)
       falls through to the logger arm. C++ `y0 == y1` is exactly
       ordered equality (NaN == NaN is false -> skip). */
  return (y0 == y1) ? 1u : 0u;
}

extern "C" float isaac_render_shell_a155f0_inverse_lerp(float y0, float y1,
                                                        float t) {
  /* Both arms (jp / logger fall-through) join at 0xa1562c — the
     division runs UNCONDITIONALLY.
     VA 0x00a1562c subss xmm2,xmm0  (num = t - y0, f32)
     VA 0x00a15630 subss xmm1,xmm0  (den = y1 - y0, f32)
     VA 0x00a15634 divss xmm2,xmm1  (res = num / den, f32, NO guard:
       den==0 -> +/-inf, 0/0 -> NaN, as IEEE)
     VA 0x00a15638 movaps xmm0,xmm2 / ret */
  const float num = t - y0;
  const float den = y1 - y0;
  return num / den;
}

extern "C" uint32_t isaac_render_shell_a155f0_host_va(void) {
  return ISAAC_RENDER_SHELL_A155F0_HOST_VA;
}
extern "C" uint32_t isaac_render_shell_a155f0_end_va(void) {
  return ISAAC_RENDER_SHELL_A155F0_END_VA;
}
extern "C" uint32_t isaac_render_shell_a155f0_next_va(void) {
  return ISAAC_RENDER_SHELL_A155F0_NEXT_VA;
}
extern "C" uint32_t isaac_render_shell_a155f0_caller_count(void) {
  return ISAAC_RENDER_SHELL_A155F0_CALLER_COUNT;
}
extern "C" uint32_t isaac_render_shell_a155f0_caller_first_va(void) {
  return ISAAC_RENDER_SHELL_A155F0_CALLER_FIRST_VA;
}
extern "C" uint32_t isaac_render_shell_a155f0_caller_last_va(void) {
  return ISAAC_RENDER_SHELL_A155F0_CALLER_LAST_VA;
}
extern "C" uint32_t isaac_render_shell_a155f0_logger_va(void) {
  return ISAAC_RENDER_SHELL_A155F0_LOGGER_VA;
}
extern "C" uint32_t isaac_render_shell_a155f0_log_msg_va(void) {
  return ISAAC_RENDER_SHELL_A155F0_LOG_MSG_VA;
}
extern "C" uint32_t isaac_render_shell_a155f0_log_msg_len(void) {
  return ISAAC_RENDER_SHELL_A155F0_LOG_MSG_LEN;
}
extern "C" uint32_t isaac_render_shell_a155f0_spill_count(void) {
  return ISAAC_RENDER_SHELL_A155F0_SPILL_COUNT;
}

/* ============================================================================
 * ABI v52: 0xa15640 nested lerp leaf. PE evidence:
 * section-notes/cpu-dump/00a15640.txt (raw disasm below).
 * ============================================================================ */

static_assert((uint32_t)ISAAC_RENDER_SHELL_A15640_HOST_VA == 0x00a15640u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A15640_END_VA == 0x00a156c4u,
              "movaps xmm4,xmm1 @0xa15640 .. ret @0xa156c4");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A15640_NEXT_VA == 0x00a156d0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A15640_NEXT_VA -
                          (uint32_t)ISAAC_RENDER_SHELL_A15640_END_VA ==
                      0xcu,
              "int3 pad 0xa156c5..0xa156cf, then the import thunk "
              "0xa156d0 (push ecx / call [0xb18274] / ret @0xa156d7)");
static_assert(ISAAC_RENDER_SHELL_A15640_CALLER_COUNT == 40u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A15640_CALLER_FIRST_VA ==
                      0x005b962fu &&
                  (uint32_t)ISAAC_RENDER_SHELL_A15640_CALLER_LAST_VA ==
                      0x007c87a6u,
              "census-callers: exactly 40 direct rel32 callers "
              "(0x5b962f .. 0x7c87a6, full .text rel32 census)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A15640_LOGGER_VA == 0x00a112c0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A15640_LOG_MSG_VA ==
                      0x00b81bd8u &&
                  ISAAC_RENDER_SHELL_A15640_LOG_MSG_LEN == 0x10u &&
                  ISAAC_RENDER_SHELL_A15640_SPILL_COUNT == 4u,
              "logger arm: push 0xb81bd8 / push 0x10 / call 0xa112c0; "
              "4 dword spills (t/y0/y1/base)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A15640_LO_VA == 0x00ba9fe4u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A15640_HI_VA == 0x00baa454u &&
                  ISAAC_RENDER_SHELL_A15640_LO_BITS == 0x00000000u &&
                  ISAAC_RENDER_SHELL_A15640_HI_BITS == 0x3f800000u &&
                  ISAAC_RENDER_SHELL_A15640_LO_VA ==
                      (uint32_t)ISAAC_RENDER_SHELL_A15550_LO_VA &&
                  ISAAC_RENDER_SHELL_A15640_HI_VA ==
                      (uint32_t)ISAAC_RENDER_SHELL_A15550_HI_VA &&
                  ISAAC_RENDER_SHELL_A15640_LO_BITS ==
                      (uint32_t)ISAAC_RENDER_SHELL_A15550_LO_BITS &&
                  ISAAC_RENDER_SHELL_A15640_HI_BITS ==
                      (uint32_t)ISAAC_RENDER_SHELL_A15550_HI_BITS,
              "clamp reuses the v48 clamp01 .rdata constants "
              "(lo 0xba9fe4 = +0.0f / hi 0xbaa454 = 1.0f)");

extern "C" uint32_t isaac_render_shell_a15640_ordered_equal_gate(float y1,
                                                                 float y0) {
  /* VA 0x00a15646 movaps xmm4,xmm1; VA 0x00a1564e ucomiss xmm4,xmm2:
     y1 (xmm1) vs y0 (xmm2). ordered y1>y0: ZF=0 PF=0 | y1<y0: ZF=0 PF=0 |
     equal: ZF=1 PF=0 | unordered (NaN): ZF=1 PF=1.
     VA 0x00a15661 lahf: AH = SF:ZF:0:AF:0:PF:1:CF.
     VA 0x00a15667 test ah,0x44: AH&0x44 = (ZF<<6)|(PF<<2).
     VA 0x00a1566a jp 0xa1568f: taken iff test PF=1 (even parity of
       AH&0x44): 0x00 (ordered inequality) and 0x44 (NaN) skip the
       logger; only 0x40 (ordered equal, odd parity -> test PF=0) falls
       through to the logger arm — identical machine pattern to
       FUN_00a155f0. C++ `y1 == y0` is exactly ordered equality
       (NaN == NaN is false -> skip). */
  return (y1 == y0) ? 1u : 0u;
}

extern "C" float isaac_render_shell_a15640_fraction(float t, float y1,
                                                    float y0,
                                                    uint32_t clamp_w) {
  /* VA 0x00a15652 mov bl,cl — the clamp is gated on the LOW byte of
     the flag (VA 0x00a1569b test bl,bl / VA 0x00a1569d je 0xa156af
     skips it when zero). */
  const uint8_t clamp_enabled =
      static_cast<uint8_t>(clamp_w & 0xffu);
  /* Both arms (jp / logger fall-through) join at 0xa1568f — the
     division runs UNCONDITIONALLY.
     VA 0x00a1568f subss xmm1,xmm4  (p1 = t - y1, f32)
     VA 0x00a15693 subss xmm2,xmm4  (p2 = y0 - y1, f32)
     VA 0x00a15697 divss xmm1,xmm2  (f = p1 / p2, f32, NO guard:
       p2==0 -> +/-inf, 0/0 -> NaN, as IEEE) */
  float f = (t - y1) / (y0 - y1);
  if (clamp_enabled != 0u) {
    /* VA 0x00a1569f maxss xmm1,[0xba9fe4] (+0.0f) — result is the
       SECOND operand when f is NOT strictly greater (NaN unordered,
       both-zero equality incl. -0.0/+0.0, f < lo): m = (f>0)?f:0.
       NaN f collapses to +0.0f; -0.0f normalizes to +0.0f.
       VA 0x00a156a7 minss xmm1,[0xbaa454] (1.0f) — result is the
       SECOND operand when m is NOT strictly less (m >= hi):
       r = (m<1)?m:1. */
    f = (f > 0.0f) ? f : 0.0f;
    f = (f < 1.0f) ? f : 1.0f;
  }
  return f;
}

extern "C" float isaac_render_shell_a15640_apply_lerp(float base,
                                                      float target, float f) {
  /* VA 0x00a156af movss xmm0,[ebp+8] (target, first stack arg)
     VA 0x00a156b4 subss xmm0,xmm3  (d = target - base, f32)
     VA 0x00a156b9 mulss xmm0,xmm1  (m = d * f, f32)
     VA 0x00a156bd addss xmm0,xmm3  (r = base + m, f32)
     VA 0x00a156c4 ret */
  const float d = target - base;
  const float m = d * f;
  return base + m;
}

extern "C" uint32_t isaac_render_shell_a15640_host_va(void) {
  return ISAAC_RENDER_SHELL_A15640_HOST_VA;
}
extern "C" uint32_t isaac_render_shell_a15640_end_va(void) {
  return ISAAC_RENDER_SHELL_A15640_END_VA;
}
extern "C" uint32_t isaac_render_shell_a15640_next_va(void) {
  return ISAAC_RENDER_SHELL_A15640_NEXT_VA;
}
extern "C" uint32_t isaac_render_shell_a15640_caller_count(void) {
  return ISAAC_RENDER_SHELL_A15640_CALLER_COUNT;
}
extern "C" uint32_t isaac_render_shell_a15640_caller_first_va(void) {
  return ISAAC_RENDER_SHELL_A15640_CALLER_FIRST_VA;
}
extern "C" uint32_t isaac_render_shell_a15640_caller_last_va(void) {
  return ISAAC_RENDER_SHELL_A15640_CALLER_LAST_VA;
}
extern "C" uint32_t isaac_render_shell_a15640_logger_va(void) {
  return ISAAC_RENDER_SHELL_A15640_LOGGER_VA;
}
extern "C" uint32_t isaac_render_shell_a15640_log_msg_va(void) {
  return ISAAC_RENDER_SHELL_A15640_LOG_MSG_VA;
}
extern "C" uint32_t isaac_render_shell_a15640_log_msg_len(void) {
  return ISAAC_RENDER_SHELL_A15640_LOG_MSG_LEN;
}
extern "C" uint32_t isaac_render_shell_a15640_spill_count(void) {
  return ISAAC_RENDER_SHELL_A15640_SPILL_COUNT;
}
extern "C" uint32_t isaac_render_shell_a15640_lo_va(void) {
  return ISAAC_RENDER_SHELL_A15640_LO_VA;
}
extern "C" uint32_t isaac_render_shell_a15640_lo_bits(void) {
  return ISAAC_RENDER_SHELL_A15640_LO_BITS;
}
extern "C" uint32_t isaac_render_shell_a15640_hi_va(void) {
  return ISAAC_RENDER_SHELL_A15640_HI_VA;
}
extern "C" uint32_t isaac_render_shell_a15640_hi_bits(void) {
  return ISAAC_RENDER_SHELL_A15640_HI_BITS;
}
extern "C" uint32_t isaac_render_shell_a15640_clamp_off(void) {
  return ISAAC_RENDER_SHELL_A15640_CLAMP_OFF;
}

/* ============================================================================
 * ABI v53: 0xa156e0 CS-owning scalar deleting dtor (2 sized frees).
 * PE evidence: section-notes/cpu-dump/00a156e0.txt (raw disasm below).
 * ============================================================================ */

static_assert((uint32_t)ISAAC_RENDER_SHELL_A156E0_HOST_VA == 0x00a156e0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A156E0_END_VA == 0x00a1572du,
              "mov esi,ecx @0xa156e0 .. ret 4 @0xa1572d");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A156E0_NEXT_VA == 0x00a15730u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A156E0_NEXT_VA -
                          (uint32_t)ISAAC_RENDER_SHELL_A156E0_END_VA ==
                      3u,
              "ret 4 (3 bytes 0xa1572d..0xa1572f) then the sibling dtor "
              "0xa15730 (same prologue: push esi / mov esi,ecx / ...)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A156E0_VTABLE_VA == 0x00b81c0cu &&
                  (uint32_t)ISAAC_RENDER_SHELL_A156E0_VTABLE_SLOT == 0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A156E0_ADDR_TAKEN_COUNT == 1u,
              "0xb81c0c slot 0 IS 0xa156e0 (raw 0x78020c); the single "
              "address-taken hit; direct rel32 caller census is 0");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A156E0_VTABLE_FINAL_VA ==
                  0x00ba04b4u,
              "vftable 0xba04b4 written at 0xa15715 (raw 0x79eab4, first "
              "dword 0x00a68440)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A156E0_CS_OFF == 8u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A156E0_FLAGS_OFF == 4u,
              "cs_ptr at +8 (mov edi,[esi+8] @0xa156e7), flags at +4 "
              "(and byte [esi+4] @0xa1570d), vtable at +0");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A156E0_CS_FREE_SIZE == 0x1cu &&
                  (uint32_t)ISAAC_RENDER_SHELL_A156E0_SELF_FREE_SIZE == 0x0cu,
              "sized frees: push 0x1c / push edi @0xa156fb..fd; push 0xc / "
              "push esi @0xa1571d..1f");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A156E0_CS_DELETE_IMPORT_VA ==
                      0x00b18274u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A156E0_FREE_VA == 0x00aef15cu,
              "call [0xb18274] = KERNEL32 DeleteCriticalSection (IAT, "
              "lua-v16/iat.txt); 0xaef15c = sized operator-delete shim "
              "(standing allocator decision)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A156E0_STACK_ARGS == 1u,
              "ret 4 pops the flag (test byte [ebp+8],1 @0xa15711)");

extern "C" uint32_t isaac_render_shell_a156e0_cs_free_gate(uint32_t cs_ptr) {
  /* VA 0x00a156f0 test edi,edi / VA 0x00a156f2 je 0xa1570d: FULL-dword
     gate — the CS-cleanup arm (DeleteCriticalSection + sized free
     cs_ptr,0x1c + field8=0) runs iff the pointer is nonzero (0x100 IS
     set). No uint8_t narrowing: uint32_t param, full-word test. */
  return cs_ptr != 0u ? 1u : 0u;
}

extern "C" uint32_t isaac_render_shell_a156e0_self_free_gate(uint32_t flag) {
  /* VA 0x00a15711 test byte ptr [ebp+8],1 / VA 0x00a1571b je 0xa15728:
     the deleting free of `this` (sized free this,0xc) runs iff the LOW
     byte of the flag has bit 0 set (test byte — only the low byte is
     inspected). uint32_t param re-narrowed explicitly. */
  return (flag & 1u) != 0u ? 1u : 0u;
}

extern "C" uint32_t isaac_render_shell_a156e0_flags_clear(uint32_t flags) {
  /* VA 0x00a1570d and byte ptr [esi+4],0xfe: LOW-BYTE store — bit 0 of
     the dword flags field is cleared; bits 1..31 (incl. bits 8..31)
     are preserved untouched. */
  return flags & 0xfffffffeu;
}

extern "C" uint32_t isaac_render_shell_a156e0_host_va(void) {
  return ISAAC_RENDER_SHELL_A156E0_HOST_VA;
}
extern "C" uint32_t isaac_render_shell_a156e0_end_va(void) {
  return ISAAC_RENDER_SHELL_A156E0_END_VA;
}
extern "C" uint32_t isaac_render_shell_a156e0_next_va(void) {
  return ISAAC_RENDER_SHELL_A156E0_NEXT_VA;
}
extern "C" uint32_t isaac_render_shell_a156e0_vtable_va(void) {
  return ISAAC_RENDER_SHELL_A156E0_VTABLE_VA;
}
extern "C" uint32_t isaac_render_shell_a156e0_vtable_final_va(void) {
  return ISAAC_RENDER_SHELL_A156E0_VTABLE_FINAL_VA;
}
extern "C" uint32_t isaac_render_shell_a156e0_vtable_slot(void) {
  return ISAAC_RENDER_SHELL_A156E0_VTABLE_SLOT;
}
extern "C" uint32_t isaac_render_shell_a156e0_cs_off(void) {
  return ISAAC_RENDER_SHELL_A156E0_CS_OFF;
}
extern "C" uint32_t isaac_render_shell_a156e0_flags_off(void) {
  return ISAAC_RENDER_SHELL_A156E0_FLAGS_OFF;
}
extern "C" uint32_t isaac_render_shell_a156e0_cs_free_size(void) {
  return ISAAC_RENDER_SHELL_A156E0_CS_FREE_SIZE;
}
extern "C" uint32_t isaac_render_shell_a156e0_self_free_size(void) {
  return ISAAC_RENDER_SHELL_A156E0_SELF_FREE_SIZE;
}
extern "C" uint32_t isaac_render_shell_a156e0_cs_delete_import_va(void) {
  return ISAAC_RENDER_SHELL_A156E0_CS_DELETE_IMPORT_VA;
}
extern "C" uint32_t isaac_render_shell_a156e0_free_va(void) {
  return ISAAC_RENDER_SHELL_A156E0_FREE_VA;
}
extern "C" uint32_t isaac_render_shell_a156e0_stack_args(void) {
  return ISAAC_RENDER_SHELL_A156E0_STACK_ARGS;
}
extern "C" uint32_t isaac_render_shell_a156e0_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A156E0_ADDR_TAKEN_COUNT;
}

/* ============================================================================
 * ABI v54: 0xa15770 vftable-slot-1 lazy CS-init getter (alloc arm).
 * PE evidence: section-notes/cpu-dump/00a15770.txt (raw disasm below).
 * ============================================================================ */

static_assert((uint32_t)ISAAC_RENDER_SHELL_A15770_HOST_VA == 0x00a15770u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A15770_END_VA == 0x00a157b7u,
              "push ebp/mov ebp,esp/sub esp,8 @0xa15770 .. ret @0xa157b7");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A15770_NEXT_VA == 0x00a157c0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A15770_NEXT_VA -
                          (uint32_t)ISAAC_RENDER_SHELL_A15770_END_VA ==
                      9u,
              "ret @0xa157b7 then int3 pad 0xa157b8..0xa157bf, next slot "
              "body 0xa157c0 (push esi / mov esi,ecx / ...)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A15770_VTABLE_VA == 0x00b81c0cu &&
                  (uint32_t)ISAAC_RENDER_SHELL_A15770_VTABLE_SLOT == 1u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A15770_ADDR_TAKEN_COUNT == 9u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A15770_DIRECT_CALLER_COUNT ==
                      9u,
              "0xb81c0c slot 1 IS 0xa15770 (dword at raw 0x780210); census "
              "9 pointer hits (vtable slot 0xb81c10 + 8 .text imm32 consts) "
              "+ 9 direct E8 callers (devirtualize idiom mov eax,[0xb81c10] "
              "/ cmp eax,0xa15770 / jne L / call 0xa15770 / L: call eax); "
              "the dead sibling 0xa15730 has 0 pointer hits + 0 callers "
              "(non-deleting dtor, NOT a vftable slot)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A15770_FLAGS_OFF == 4u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A15770_CS_PTR_OFF == 8u,
              "flags at +4 (test byte [edi+4] @0xa1577a, mov byte [edi+4] "
              "@0xa157ad), cs_ptr at +8 (mov [edi+8] @0xa157aa)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A15770_ALLOC_SIZE == 0x1cu &&
                  (uint32_t)ISAAC_RENDER_SHELL_A15770_ALLOC_VA == 0x00a0f4c0u,
              "push 0x1c / call 0xa0f4c0 @0xa15780..82: sized new 0x1c "
              "(allocator primitive; twin of the 0xaef15c sized-delete)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A15770_CS_INIT_IMPORT_VA ==
                      0x00b18278u,
              "call [0xb18278] = KERNEL32 InitializeCriticalSection (IAT "
              "slot next to DeleteCriticalSection 0xb18274, "
              "lua-v16/iat.txt); host CS object 0x1c bytes, DebugInfo "
              "dword pre-zeroed at +0x18");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A15770_STACK_ARGS == 0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A15770_RET_CONST == 1u,
              "plain ret (0 stack args) — the v53 stack-flag gate at "
              "[ebp+8] does NOT exist here; the gate reads the member "
              "byte [edi+4]; both paths mov al,1 (0xa157b1)");

extern "C" uint32_t isaac_render_shell_a15770_init_gate(uint32_t flags) {
  /* VA 0x00a1577a test byte ptr [edi+4],1 / VA 0x00a1577e jne 0xa157b0:
     LOW-byte bit-0 gate — if (flags & 1) != 0 the object is ALREADY
     initialized and the alloc/init arm is skipped (body returns 1
     without any store). uint32_t param re-narrowed explicitly (0x100 ->
     0, 0x1ff / 0xffffffff -> 1). */
  return (flags & 1u) != 0u ? 1u : 0u;
}

extern "C" uint32_t isaac_render_shell_a15770_flags_set_bit0(uint32_t flags) {
  /* VAs 0x00a157a2 (movzx eax, byte [edi+4]) / 0x00a157a6 (bts eax,0) /
     0x00a157ad (mov byte [edi+4],al): LOW-BYTE store — the low byte is
     re-read, bit 0 set, written back; bits 8..31 of the dword flags
     field are preserved untouched. Runs on the fall-through (gate
     clear) path ALWAYS — even when the alloc returns 0 (then field8
     gets 0 but the flag is still set). */
  return (flags & 0xffffff00u) | ((flags & 0xffu) | 1u);
}

extern "C" uint32_t isaac_render_shell_a15770_host_va(void) {
  return ISAAC_RENDER_SHELL_A15770_HOST_VA;
}
extern "C" uint32_t isaac_render_shell_a15770_end_va(void) {
  return ISAAC_RENDER_SHELL_A15770_END_VA;
}
extern "C" uint32_t isaac_render_shell_a15770_next_va(void) {
  return ISAAC_RENDER_SHELL_A15770_NEXT_VA;
}
extern "C" uint32_t isaac_render_shell_a15770_vtable_va(void) {
  return ISAAC_RENDER_SHELL_A15770_VTABLE_VA;
}
extern "C" uint32_t isaac_render_shell_a15770_vtable_slot(void) {
  return ISAAC_RENDER_SHELL_A15770_VTABLE_SLOT;
}
extern "C" uint32_t isaac_render_shell_a15770_flags_off(void) {
  return ISAAC_RENDER_SHELL_A15770_FLAGS_OFF;
}
extern "C" uint32_t isaac_render_shell_a15770_cs_ptr_off(void) {
  return ISAAC_RENDER_SHELL_A15770_CS_PTR_OFF;
}
extern "C" uint32_t isaac_render_shell_a15770_alloc_size(void) {
  return ISAAC_RENDER_SHELL_A15770_ALLOC_SIZE;
}
extern "C" uint32_t isaac_render_shell_a15770_alloc_va(void) {
  return ISAAC_RENDER_SHELL_A15770_ALLOC_VA;
}
extern "C" uint32_t isaac_render_shell_a15770_cs_init_import_va(void) {
  return ISAAC_RENDER_SHELL_A15770_CS_INIT_IMPORT_VA;
}
extern "C" uint32_t isaac_render_shell_a15770_stack_args(void) {
  return ISAAC_RENDER_SHELL_A15770_STACK_ARGS;
}
extern "C" uint32_t isaac_render_shell_a15770_ret_const(void) {
  return ISAAC_RENDER_SHELL_A15770_RET_CONST;
}
extern "C" uint32_t isaac_render_shell_a15770_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A15770_ADDR_TAKEN_COUNT;
}
extern "C" uint32_t isaac_render_shell_a15770_direct_caller_count(void) {
  return ISAAC_RENDER_SHELL_A15770_DIRECT_CALLER_COUNT;
}

/* ============================================================================
 * v25j (wave-16, ABI stays 54): 0xa157c0 — 0xb81c0c vftable SLOT 2,
 * destroy/cleanup arm (mirror of slot 1's lazy-CS-init getter).
 * PE evidence: section-notes/cpu-dump/00a157c0.txt (raw disasm below).
 * ============================================================================ */

static_assert((uint32_t)ISAAC_RENDER_SHELL_A157C0_HOST_VA == 0x00a157c0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A157C0_END_VA == 0x00a157eau,
              "push esi/mov esi,ecx @0xa157c0 .. ret @0xa157ea");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A157C0_NEXT_VA == 0x00a157f0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A157C0_NEXT_VA -
                          (uint32_t)ISAAC_RENDER_SHELL_A157C0_END_VA ==
                      6u,
              "ret @0xa157ea then int3 pad 0xa157eb..0xa157ef, next slot "
              "body 0xa157f0 (push ebp / mov ebp,esp / ...)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A157C0_VTABLE_VA == 0x00b81c0cu &&
                  (uint32_t)ISAAC_RENDER_SHELL_A157C0_VTABLE_SLOT == 2u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A157C0_ADDR_TAKEN_COUNT == 1u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A157C0_DIRECT_CALLER_COUNT ==
                      0u,
              "0xb81c0c slot 2 IS 0xa157c0 (dword at .rdata raw 0x780214 = "
              "VA 0xb81c14); census 1 pointer hit (the vtable slot itself) + "
              "0 direct E8 callers -> reached purely via virtual dispatch "
              "(contrast slot 1: 9/9 devirtualized callers)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A157C0_FLAGS_OFF == 4u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A157C0_CS_PTR_OFF == 8u,
              "cs_ptr at +8 (mov edi,[esi+8] @0xa157c4, mov [esi+8],0 "
              "@0xa157dd), flags at +4 (and byte [esi+4],0xfe @0xa157e4)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A157C0_FREE_SIZE == 0x1cu &&
                  (uint32_t)ISAAC_RENDER_SHELL_A157C0_FREE_VA == 0x00aef15cu,
              "push 0x1c / push edi / call 0xaef15c @0xa157d2..d5: sized "
              "delete 0x1c (twin of the 0xa0f4c0 sized-new on slot 1)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A157C0_CS_DELETE_IMPORT_VA ==
                      0x00b18274u,
              "call [0xb18274] @0xa157cc = KERNEL32 DeleteCriticalSection "
              "(IAT; slot 1 uses InitializeCriticalSection [0xb18278])");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A157C0_STACK_ARGS == 0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A157C0_EAX_WRITES == 0u,
              "plain thiscall ret (0 stack args); the body NEVER writes EAX "
              "(0 eax-writes: push/mov/test/je/push/call/add/mov/and/pop/"
              "pop/ret) — NO ret const, unlike slot 1's mov al,1 -> 1");

extern "C" uint32_t isaac_render_shell_a157c0_destroy_gate(uint32_t cs) {
  /* VA 0x00a157c7 test edi,edi / VA 0x00a157c9 je 0xa157e4: FULL-DWORD
     gate on this->field8 (the CS ptr) — the delete arm runs iff field8 !=
     0. uint32_t param; wide drive 0x0 -> 0, 0x1 / 0x100 / 0x1ff /
     0xffffffff -> 1. NEVER norrowed to the slot-1 byte test: 0x100 has bit
     0 clear but is a live pointer here. */
  return cs != 0u ? 1u : 0u;
}

extern "C" uint32_t isaac_render_shell_a157c0_flags_clear_bit0(uint32_t fl) {
  /* VA 0x00a157e4 and byte ptr [esi+4],0xfe (Grp1 Eb,Ib — a BYTE and):
     bit 0 of the flags low byte cleared, bits 8..31 preserved untouched
     (0x101 -> 0x100). UNCONDITIONAL: 0xa157e4 is BOTH the `je` target and
     the delete-path fallthrough, so the clear runs on both arms — the
     inverse of slot 1's fall-through-only flag set. */
  return (fl & 0xffffff00u) | ((fl & 0xffu) & 0xfeu);
}

extern "C" uint32_t isaac_render_shell_a157c0_host_va(void) {
  return ISAAC_RENDER_SHELL_A157C0_HOST_VA;
}
extern "C" uint32_t isaac_render_shell_a157c0_end_va(void) {
  return ISAAC_RENDER_SHELL_A157C0_END_VA;
}
extern "C" uint32_t isaac_render_shell_a157c0_next_va(void) {
  return ISAAC_RENDER_SHELL_A157C0_NEXT_VA;
}
extern "C" uint32_t isaac_render_shell_a157c0_vtable_va(void) {
  return ISAAC_RENDER_SHELL_A157C0_VTABLE_VA;
}
extern "C" uint32_t isaac_render_shell_a157c0_vtable_slot(void) {
  return ISAAC_RENDER_SHELL_A157C0_VTABLE_SLOT;
}
extern "C" uint32_t isaac_render_shell_a157c0_flags_off(void) {
  return ISAAC_RENDER_SHELL_A157C0_FLAGS_OFF;
}
extern "C" uint32_t isaac_render_shell_a157c0_cs_ptr_off(void) {
  return ISAAC_RENDER_SHELL_A157C0_CS_PTR_OFF;
}
extern "C" uint32_t isaac_render_shell_a157c0_free_size(void) {
  return ISAAC_RENDER_SHELL_A157C0_FREE_SIZE;
}
extern "C" uint32_t isaac_render_shell_a157c0_free_va(void) {
  return ISAAC_RENDER_SHELL_A157C0_FREE_VA;
}
extern "C" uint32_t isaac_render_shell_a157c0_cs_delete_import_va(void) {
  return ISAAC_RENDER_SHELL_A157C0_CS_DELETE_IMPORT_VA;
}
extern "C" uint32_t isaac_render_shell_a157c0_stack_args(void) {
  return ISAAC_RENDER_SHELL_A157C0_STACK_ARGS;
}
extern "C" uint32_t isaac_render_shell_a157c0_eax_writes(void) {
  return ISAAC_RENDER_SHELL_A157C0_EAX_WRITES;
}
extern "C" uint32_t isaac_render_shell_a157c0_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A157C0_ADDR_TAKEN_COUNT;
}
extern "C" uint32_t isaac_render_shell_a157c0_direct_caller_count(void) {
  return ISAAC_RENDER_SHELL_A157C0_DIRECT_CALLER_COUNT;
}

/* ============================================================================
 * v25l (wave-16, ABI stays 54): 0xa159a0 vftable-slot-4 (LAST) lazy-leave /
 * CS teardown arm — NARROWED. PE evidence:
 * section-notes/cpu-dump/00a159a0.txt (raw disasm below).
 * ============================================================================ */

static_assert((uint32_t)ISAAC_RENDER_SHELL_A159A0_HOST_VA == 0x00a159a0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A159A0_END_VA == 0x00a159c7u,
              "push esi / mov esi,ecx @0xa159a0 .. ret @0xa159c7");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A159A0_NEXT_VA == 0x00a159d0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A159A0_NEXT_VA -
                          (uint32_t)ISAAC_RENDER_SHELL_A159A0_END_VA ==
                      9u,
              "ret @0xa159c7 then int3 pad 0xa159c8..0xa159cf, next body "
              "0xa159d0 = ALREADY-LANDED v7 opaque_call_00a159d0 (string "
              "hash, va 0xa159d0..0xa15a28) — vftable 0xb81c0c fully "
              "decoded after this slot");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A159A0_VTABLE_VA == 0x00b81c0cu &&
                  (uint32_t)ISAAC_RENDER_SHELL_A159A0_VTABLE_SLOT == 4u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A159A0_ADDR_TAKEN_COUNT == 1u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A159A0_DIRECT_CALLER_COUNT ==
                      0u,
              "0xb81c0c slot 4 IS 0xa159a0 (dword at raw 0x78021c); census: "
              "1 pointer hit (vtable slot 0xb81c1c ONLY, no .text imm32 "
              "consts) + 0 direct E8 callers — pure virtual dispatch "
              "(call [obj+0x10]); slot 5 0xb81c20 = ASCII string \"Trying "
              "to unlock mutex that has not been initial...\" (vftable "
              "ends at slot 4)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A159A0_FLAGS_OFF == 4u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A159A0_CS_PTR_OFF == 8u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A159A0_PREZERO_OFF == 0x18u,
              "flags at +4 (test byte [esi+4] @0xa159a3), cs_ptr at +8 "
              "(mov eax,[esi+8] @0xa159b8), pre-zero byte at +0x18 (mov "
              "byte [eax+0x18],0 @0xa159bc — same DebugInfo offset as the "
              "v54 slot-1 init and v53 slot-0 dtor)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A159A0_REPORT_VA == 0x00a112c0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A159A0_REPORT_ARG0 == 0x10u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A159A0_REPORT_ARG1 ==
                      0x00b81c20u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A159A0_REPORT_RESULT_USED ==
                      0u,
              "gate-clear arm: push 0xb81c20 / push 0x10 / call 0xa112c0 / "
              "add esp,8 (cdecl, arg0=0x10 report category, arg1=0xb81c20 "
              "string const — the LAST push is arg0); the RESULT is "
              "DISCARDED: eax is overwritten by mov eax,[esi+8] @0xa159b8 "
              "(defect-class-1: the leave arg is the POST-CALL field8, "
              "never the call's return value)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A159A0_LEAVE_IMPORT_VA ==
                      0x00b18268u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A159A0_STACK_ARGS == 0u,
              "call [0xb18268] = KERNEL32 LeaveCriticalSection (IAT slot, "
              "lua-v16/iat.txt: 0xb1826c TryEnter / 0xb18270 Enter / "
              "0xb18274 Delete / 0xb18278 Initialize — the v53/v54/slot-2 "
              "family arms); pushed arg = cs_ptr = field8; plain ret "
              "(0 stack args); eax = callee leftover (void, undefined)");

extern "C" uint32_t isaac_render_shell_a159a0_gate(uint32_t flags) {
  /* VA 0x00a159a3 test byte ptr [esi+4],1 / VA 0x00a159a7 jne 0xa159b8:
     LOW-byte bit-0 gate — if (flags & 1) != 0 the object IS initialized
     and the report arm is SKIPPED (mirror of the v54 slot-1 init gate;
     uint32_t param re-narrowed explicitly: 0x100 -> 0, 0x1ff /
     0xffffffff -> 1). */
  return (flags & 1u) != 0u ? 1u : 0u;
}

extern "C" uint32_t isaac_render_shell_a159a0_report_arg(uint32_t index) {
  /* VA 0x00a159a9 push 0xb81c20 / VA 0x00a159ae push 0x10 / call
     0xa112c0 @0xa159b0: cdecl — the LAST push is arg0, so arg0 = 0x10
     (report category), arg1 = 0xb81c20 (.rdata string "Trying to unlock
     mutex that has not been initial..."). Pins the call shape + push
     order for a boundary-removal reimplementation; index 0/1 -> that
     arg, any other index -> 0. */
  if (index == 0u) {
    return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A159A0_REPORT_ARG0);
  }
  if (index == 1u) {
    return static_cast<uint32_t>(ISAAC_RENDER_SHELL_A159A0_REPORT_ARG1);
  }
  return 0u;
}

extern "C" uint32_t isaac_render_shell_a159a0_host_va(void) {
  return ISAAC_RENDER_SHELL_A159A0_HOST_VA;
}
extern "C" uint32_t isaac_render_shell_a159a0_end_va(void) {
  return ISAAC_RENDER_SHELL_A159A0_END_VA;
}
extern "C" uint32_t isaac_render_shell_a159a0_next_va(void) {
  return ISAAC_RENDER_SHELL_A159A0_NEXT_VA;
}
extern "C" uint32_t isaac_render_shell_a159a0_vtable_va(void) {
  return ISAAC_RENDER_SHELL_A159A0_VTABLE_VA;
}
extern "C" uint32_t isaac_render_shell_a159a0_vtable_slot(void) {
  return ISAAC_RENDER_SHELL_A159A0_VTABLE_SLOT;
}
extern "C" uint32_t isaac_render_shell_a159a0_flags_off(void) {
  return ISAAC_RENDER_SHELL_A159A0_FLAGS_OFF;
}
extern "C" uint32_t isaac_render_shell_a159a0_cs_ptr_off(void) {
  return ISAAC_RENDER_SHELL_A159A0_CS_PTR_OFF;
}
extern "C" uint32_t isaac_render_shell_a159a0_prezero_off(void) {
  return ISAAC_RENDER_SHELL_A159A0_PREZERO_OFF;
}
extern "C" uint32_t isaac_render_shell_a159a0_report_va(void) {
  return ISAAC_RENDER_SHELL_A159A0_REPORT_VA;
}
extern "C" uint32_t isaac_render_shell_a159a0_report_result_used(void) {
  return ISAAC_RENDER_SHELL_A159A0_REPORT_RESULT_USED;
}
extern "C" uint32_t isaac_render_shell_a159a0_leave_import_va(void) {
  return ISAAC_RENDER_SHELL_A159A0_LEAVE_IMPORT_VA;
}
extern "C" uint32_t isaac_render_shell_a159a0_stack_args(void) {
  return ISAAC_RENDER_SHELL_A159A0_STACK_ARGS;
}
extern "C" uint32_t isaac_render_shell_a159a0_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A159A0_ADDR_TAKEN_COUNT;
}
extern "C" uint32_t isaac_render_shell_a159a0_direct_caller_count(void) {
  return ISAAC_RENDER_SHELL_A159A0_DIRECT_CALLER_COUNT;
}

/* ============================================================================
 * v25k (wave-16, ABI stays 54): 0xa157f0 vftable-slot-3 CS acquire
 * (forever arm + timed arm) — NARROWED. ONE body 0xa157f0..0xa15996
 * (ret 4 @0xa15850 forever epilogue / ret 4 @0xa15996 timed epilogue;
 * cold tail 0xa15853.. shares the prologue frame).
 * PE evidence: section-notes/cpu-dump/00a157f0.txt + 00a15853.txt.
 * ============================================================================ */

static_assert((uint32_t)ISAAC_RENDER_SHELL_A157F0_HOST_VA == 0x00a157f0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A157F0_END_VA == 0x00a15996u,
              "push ebp/mov ebp,esp @0xa157f0 .. cold-tail ret @0xa15996");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A157F0_NEXT_VA == 0x00a159a0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A157F0_NEXT_VA -
                          (uint32_t)ISAAC_RENDER_SHELL_A157F0_END_VA ==
                      10u,
              "ret 4 @0xa15996 then int3 pad 0xa15999..0xa1599f, next slot "
              "4 body 0xa159a0 (v25l landed) — after that the claimed "
              "already-landed v7 opaque_call_00a159d0 at 0xa159d0");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A157F0_VTABLE_VA == 0x00b81c0cu &&
                  (uint32_t)ISAAC_RENDER_SHELL_A157F0_VTABLE_SLOT == 3u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A157F0_ADDR_TAKEN_COUNT == 1u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A157F0_DIRECT_CALLER_COUNT ==
                      0u,
              "0xb81c0c slot 3 IS 0xa157f0 (dword at raw 0x780218 = VA "
              "0xb81c18); census: 1 pointer hit (the vtable slot ONLY, no "
              ".text imm32 consts) + 0 direct E8 callers — pure virtual "
              "dispatch (call [obj+0xc]); contrast slot 1 (9/9)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A157F0_FLAGS_OFF == 4u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A157F0_CS_PTR_OFF == 8u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A157F0_BYTE18_OFF == 0x18u,
              "flags at +4 (test byte [eax+4] @0xa157fe), cs_ptr at +8 "
              "(mov esi,[eax+8] @0xa15821 and @0xa158d5), busy-marker "
              "byte at +0x18 (cmp byte [esi+0x18] @0xa1582b/@0xa158e8, "
              "mov byte [esi+0x18],1 @0xa15844)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A157F0_FACTORY_VA ==
                      0x00a112c0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A157F0_FACTORY_ARG0 == 0x10u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A157F0_FACTORY_ARG1 ==
                      0x00b81c58u,
              "gate-clear arm: push 0xb81c58 / push 0x10 / call 0xa112c0 "
              "@0xa15808..0f: cdecl, LAST push = arg0 = 0x10 (factory "
              "category), arg1 = 0xb81c58 = .rdata const; the RESULT is "
              "DISCARDED — eax is overwritten by mov eax,[esp+0x18] "
              "@0xa15814 (POST-CALL reload of this, defect-class-1)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A157F0_CS_ENTER_IMPORT_VA ==
                      0x00b18270u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A157F0_CS_TRY_IMPORT_VA ==
                      0x00b1826cu &&
                  (uint32_t)ISAAC_RENDER_SHELL_A157F0_CS_LEAVE_IMPORT_VA ==
                      0x00b18268u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A157F0_SLEEP_IMPORT_VA ==
                      0x00b182d8u,
              "Forever arm: call [0xb18270] = KERNEL32 EnterCriticalSection "
              "@0xa15825. Timed arm: call [0xb1826c] = "
              "TryEnterCriticalSection @0xa158d9 (undo with "
              "LeaveCriticalSection [0xb18268] @0xa158ef when byte18 busy) "
              "and Sleep [0xb182d8] @0xa1583c (1000ms) / @0xa15901 (10ms). "
              "lua-v16/iat.txt confirms all four slots");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A157F0_TIME_HELPER_VA ==
                      0x00a68490u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A157F0_SCALE_MUL_LO ==
                      0xd7b634dbu &&
                  (uint32_t)ISAAC_RENDER_SHELL_A157F0_SCALE_MUL_HI ==
                      0x431bde82u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A157F0_SCALE_SHIFT == 0x12u,
              "timed scale: call 0xa68490 @0xa15853/@0xa15907 (QPC/QPF "
              "+ double math, returns 64-bit in edx:eax), then 64x64->128 "
              "lane multiply by M = 0x431bde82d7b634db (mul/shrd "
              "0xa1585c..0xa158bc) = (t * M) >> 82 (~ms since boot)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A157F0_SLEEP_MS_FOREVER == 0x3e8u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A157F0_SLEEP_MS_TIMED == 0x0au &&
                  (uint32_t)ISAAC_RENDER_SHELL_A157F0_STACK_ARGS == 1u,
              "Sleep(1000) @0xa15837 (forever arm spin), Sleep(10) "
              "@0xa158ff (timed arm poll); ret 4 (1 stack arg at "
              "[ebp+8]: -1 = forever, else timeout ms — UNLIKE slot 1/4 "
              "plain ret)");

extern "C" uint32_t isaac_render_shell_a157f0_init_gate(uint32_t flg) {
  /* VA 0x00a157fe test byte ptr [eax+4],1 / VA 0x00a15806 jne 0xa1581b:
     LOW-byte bit-0 gate — if (flg & 1) != 0 the factory arm is SKIPPED
     (mirror of the v54 slot-1 / v25l slot-4 gates; `flg` name keeps the
     mutant anchor unique in this cpp). uint32_t param re-narrowed
     explicitly: 0x100 -> 0, 0x1ff / 0xffffffff -> 1. */
  return (flg & 1u) != 0u ? 1u : 0u;
}

extern "C" uint32_t isaac_render_shell_a157f0_arg_m1_gate(uint32_t argv) {
  /* VA 0x00a1581b cmp dword ptr [ebp+8],-1 / VA 0x00a1581f jne 0xa15853:
     FULL-DWORD gate — the forever arm (EnterCriticalSection + byte18
     spin) runs iff arg == 0xffffffff; anything else (incl. 0x1ff)
     goes to the timed arm. NEVER narrowed to a byte test. */
  return argv == 0xffffffffu ? 1u : 0u;
}

extern "C" uint32_t isaac_render_shell_a157f0_byte18_free(uint32_t bv) {
  /* VA 0x00a1582b cmp byte ptr [esi+0x18],0 / je 0xa15844 (forever
     arm) AND VA 0x00a158e8 cmp byte ptr [esi+0x18],0 / je 0xa158f7
     (timed arm): LOW-byte test of the busy marker — free iff
     (bv & 0xff) == 0. The timed-arm test RE-READS byte18 AFTER the
     TryEnterCriticalSection call (recapture). uint32_t param:
     0x100 -> 1 (byte 0), 0x1ff/0xffffffff -> 0. */
  return (bv & 0xffu) == 0u ? 1u : 0u;
}

extern "C" uint32_t isaac_render_shell_a157f0_arg_zero_gate(uint32_t argv) {
  /* VA 0x00a158bf cmp dword ptr [ebp+8],0 / VA 0x00a158cb jbe 0xa1598e:
     UNSIGNED `<='-style compare — the timed arm returns 0 (timeout)
     immediately iff arg == 0. 0xffffffff -> 0 (unsigned > 0);
     a signed mutant (int32 >= 0) would diverge at 0xffffffff. */
  return argv == 0u ? 1u : 0u;
}

extern "C" uint32_t isaac_render_shell_a157f0_tryret_gate(uint32_t retv) {
  /* VA 0x00a158df test eax,eax / VA 0x00a158e1 setne cl: FULL-DWORD
     gate on the TryEnterCriticalSection return — 1 iff ret != 0
     (0x100 IS set; never a byte test). */
  return retv != 0u ? 1u : 0u;
}

extern "C" uint32_t isaac_render_shell_a157f0_timed_take(uint32_t retv,
                                                         uint32_t bv) {
  /* VAs 0x00a158f7..f9: timed-arm success predicate — the only path
     that reaches the `mov al,1` (return 1) epilogue from the timed
     arm is tryret != 0 AND byte18 == 0 (the try-acquire landed on a
     free marker). tryret != 0 && byte18 != 0 -> LeaveCriticalSection +
     Sleep(10) + re-time (loop, NOT success). */
  return (retv != 0u && (bv & 0xffu) == 0u) ? 1u : 0u;
}

extern "C" uint32_t isaac_render_shell_a157f0_time_scale_lo(uint32_t t_hi,
                                                            uint32_t t_lo) {
  /* VAs 0x00a15853..0x00a158bc: scaled = (t * M) >> 82 where
     t = t_hi:t_lo (64-bit, from the 0xa68490 time helper) and
     M = 0x431bde82d7b634db. The machine computes the 128-bit product
     with four 32x32 lane muls (p00..p11), accumulates mid =
     p00_hi + p01_lo + p10_lo, high = p11 + p01_hi + p10_hi +
     (mid >> 32) [uint64 wrap == PE adc chain], then shifts the high
     64 by 0x12 (shrd ecx,edx,0x12 / shr edx,0x12). Return low 32. */
  const uint32_t m_lo = 0xd7b634dbu;
  const uint32_t m_hi = 0x431bde82u;
  const uint64_t p00 = (uint64_t)t_lo * m_lo;
  const uint64_t p01 = (uint64_t)t_lo * m_hi;
  const uint64_t p10 = (uint64_t)t_hi * m_lo;
  const uint64_t p11 = (uint64_t)t_hi * m_hi;
  const uint64_t mid =
      (p00 >> 32) + (p01 & 0xffffffffu) + (p10 & 0xffffffffu);
  const uint64_t high =
      (mid >> 32) + (p01 >> 32) + (p10 >> 32) + p11; /* uint64 wrap */
  const uint64_t scaled = high >> 18u;
  return (uint32_t)(scaled & 0xffffffffu);
}

extern "C" uint32_t isaac_render_shell_a157f0_time_scale_hi(uint32_t t_hi,
                                                            uint32_t t_lo) {
  /* Same (t * M) >> 82 lane multiply — high 32 of the result. */
  const uint32_t m_lo = 0xd7b634dbu;
  const uint32_t m_hi = 0x431bde82u;
  const uint64_t p00 = (uint64_t)t_lo * m_lo;
  const uint64_t p01 = (uint64_t)t_lo * m_hi;
  const uint64_t p10 = (uint64_t)t_hi * m_lo;
  const uint64_t p11 = (uint64_t)t_hi * m_hi;
  const uint64_t mid =
      (p00 >> 32) + (p01 & 0xffffffffu) + (p10 & 0xffffffffu);
  const uint64_t high =
      (mid >> 32) + (p01 >> 32) + (p10 >> 32) + p11; /* uint64 wrap */
  const uint64_t scaled = high >> 18u;
  return (uint32_t)(scaled >> 32);
}

extern "C" uint32_t isaac_render_shell_a157f0_deadline_exceeded(
    uint32_t base_hi, uint32_t base_lo, uint32_t now_hi, uint32_t now_lo,
    uint32_t arg) {
  /* VAs 0x00a15973..0x00a15988: elapsed = now - base (sub ecx /
     sbb edx — 64-bit unsigned wrap); `test edx,edx` @0xa1597b then
     `jb 0xa158d1` @0xa1597d is DEAD (CF=0 after test — compiler
     artifact, modeled away); `ja 0xa1598e` @0xa15983: delta_hi != 0
     -> timeout (return 0); `cmp ecx,[ebp+8]` / `jb 0xa158d1`
     @0xa15988: delta_lo < arg (UNSIGNED) -> poll loop again.
     Exceeded iff delta_hi != 0 || delta_lo >= arg. */
  const uint64_t base = ((uint64_t)base_hi << 32) | base_lo;
  const uint64_t now = ((uint64_t)now_hi << 32) | now_lo;
  const uint64_t delta = now - base; /* wraps mod 2^64 (PE sub/sbb) */
  const uint32_t d_hi = (uint32_t)(delta >> 32);
  const uint32_t d_lo = (uint32_t)(delta & 0xffffffffu);
  return (d_hi != 0u || d_lo >= arg) ? 1u : 0u;
}

extern "C" uint32_t isaac_render_shell_a157f0_host_va(void) {
  return ISAAC_RENDER_SHELL_A157F0_HOST_VA;
}
extern "C" uint32_t isaac_render_shell_a157f0_end_va(void) {
  return ISAAC_RENDER_SHELL_A157F0_END_VA;
}
extern "C" uint32_t isaac_render_shell_a157f0_next_va(void) {
  return ISAAC_RENDER_SHELL_A157F0_NEXT_VA;
}
extern "C" uint32_t isaac_render_shell_a157f0_vtable_va(void) {
  return ISAAC_RENDER_SHELL_A157F0_VTABLE_VA;
}
extern "C" uint32_t isaac_render_shell_a157f0_vtable_slot(void) {
  return ISAAC_RENDER_SHELL_A157F0_VTABLE_SLOT;
}
extern "C" uint32_t isaac_render_shell_a157f0_flags_off(void) {
  return ISAAC_RENDER_SHELL_A157F0_FLAGS_OFF;
}
extern "C" uint32_t isaac_render_shell_a157f0_cs_ptr_off(void) {
  return ISAAC_RENDER_SHELL_A157F0_CS_PTR_OFF;
}
extern "C" uint32_t isaac_render_shell_a157f0_byte18_off(void) {
  return ISAAC_RENDER_SHELL_A157F0_BYTE18_OFF;
}
extern "C" uint32_t isaac_render_shell_a157f0_factory_va(void) {
  return ISAAC_RENDER_SHELL_A157F0_FACTORY_VA;
}
extern "C" uint32_t isaac_render_shell_a157f0_factory_arg(uint32_t index) {
  /* Pins the cdecl push order of the factory call (push arg1 FIRST,
     arg0 LAST): arg0 = 0x10 category, arg1 = 0xb81c58 .rdata const. */
  if (index == 0u) {
    return ISAAC_RENDER_SHELL_A157F0_FACTORY_ARG0;
  }
  if (index == 1u) {
    return ISAAC_RENDER_SHELL_A157F0_FACTORY_ARG1;
  }
  return 0u;
}
extern "C" uint32_t isaac_render_shell_a157f0_cs_enter_import_va(void) {
  return ISAAC_RENDER_SHELL_A157F0_CS_ENTER_IMPORT_VA;
}
extern "C" uint32_t isaac_render_shell_a157f0_cs_try_import_va(void) {
  return ISAAC_RENDER_SHELL_A157F0_CS_TRY_IMPORT_VA;
}
extern "C" uint32_t isaac_render_shell_a157f0_cs_leave_import_va(void) {
  return ISAAC_RENDER_SHELL_A157F0_CS_LEAVE_IMPORT_VA;
}
extern "C" uint32_t isaac_render_shell_a157f0_sleep_import_va(void) {
  return ISAAC_RENDER_SHELL_A157F0_SLEEP_IMPORT_VA;
}
extern "C" uint32_t isaac_render_shell_a157f0_time_helper_va(void) {
  return ISAAC_RENDER_SHELL_A157F0_TIME_HELPER_VA;
}
extern "C" uint32_t isaac_render_shell_a157f0_scale_mul_lo(void) {
  return ISAAC_RENDER_SHELL_A157F0_SCALE_MUL_LO;
}
extern "C" uint32_t isaac_render_shell_a157f0_scale_mul_hi(void) {
  return ISAAC_RENDER_SHELL_A157F0_SCALE_MUL_HI;
}
extern "C" uint32_t isaac_render_shell_a157f0_scale_shift(void) {
  return ISAAC_RENDER_SHELL_A157F0_SCALE_SHIFT;
}
extern "C" uint32_t isaac_render_shell_a157f0_sleep_ms_forever(void) {
  return ISAAC_RENDER_SHELL_A157F0_SLEEP_MS_FOREVER;
}
extern "C" uint32_t isaac_render_shell_a157f0_sleep_ms_timed(void) {
  return ISAAC_RENDER_SHELL_A157F0_SLEEP_MS_TIMED;
}
extern "C" uint32_t isaac_render_shell_a157f0_stack_args(void) {
  return ISAAC_RENDER_SHELL_A157F0_STACK_ARGS;
}
extern "C" uint32_t isaac_render_shell_a157f0_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A157F0_ADDR_TAKEN_COUNT;
}
extern "C" uint32_t isaac_render_shell_a157f0_direct_caller_count(void) {
  return ISAAC_RENDER_SHELL_A157F0_DIRECT_CALLER_COUNT;
}

/* ===========================================================================
 * FUN_00a15570 is-power-of-two gate — ABI v56 (PURE leaf)
 *
 * PE order, exact machine CF:
 *   0x00a15570: test ecx,ecx / je 0xa1557e / lea eax,[ecx-1] /
 *   test ecx,eax / jne 0xa1557e / mov al,1 / ret / xor al,al / ret
 *   (0xa15580). thiscall (ecx in, al out), 0 stack args, 0 stores,
 *   0 calls. Full-dword gates: n == 0 -> 0; else (n & (n-1)) == 0
 *   -> 1, else 0. lea [ecx-1] does NOT touch flags. EAX writes 2
 *   (mov al,1 / xor al,al), upper 24 bits caller-stale (same return
 *   convention as a15770/a157c0).
 *   Single direct rel32 caller 0xa614dd (assert gate: `mov edi,edx /
 *   mov ebx,ecx / mov ecx,edi / call 0xa15570 / test al,al / jne ok /
 *   push 0xb9f974 / push 0x10 / call 0xa112c0` — logs level 0x10,
 *   rdata 0xb9f974 = "Destination buffer length is not a power of
 *   two" when the gate fails).
 * PE evidence: section-notes/render-shell-v56-next/NOTES.md
 * =========================================================================== */

static_assert((uint32_t)ISAAC_RENDER_SHELL_A15570_HOST_VA == 0x00a15570u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A15570_END_VA == 0x00a15580u,
              "test ecx @ 0xa15570, mov al,1 @ 0xa1557b, ret @ 0xa1557d, "
              "xor al,al @ 0xa1557e, ret @ 0xa15580");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A15570_NEXT_VA == 0x00a15590u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A15570_NEXT_VA -
                          (uint32_t)ISAAC_RENDER_SHELL_A15570_END_VA ==
                      0x10u,
              "int3 pad 0xa15581..0xa1558f, then the v49 next-pow2 leaf "
              "0xa15590");
static_assert(ISAAC_RENDER_SHELL_A15570_CALLER_COUNT == 1u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A15570_CALLER_FIRST_VA ==
                      0x00a614ddu &&
                  (uint32_t)ISAAC_RENDER_SHELL_A15570_CALLER_LAST_VA ==
                      0x00a614ddu,
              "census: exactly 1 direct rel32 caller 0xa614dd");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A15570_LOGGER_VA == 0x00a112c0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A15570_LOG_MSG_VA ==
                      0x00b9f974u &&
                  ISAAC_RENDER_SHELL_A15570_LOG_LEVEL == 0x10u,
              "assert gate: push msg / push 0x10 / call logger a112c0");
static_assert(ISAAC_RENDER_SHELL_A15570_STACK_ARGS == 0u &&
                  ISAAC_RENDER_SHELL_A15570_ADDR_TAKEN_COUNT == 0u &&
                  ISAAC_RENDER_SHELL_A15570_EAX_WRITES == 2u,
              "thiscall, 0 stack args, 0 addr-taken, eax writes 2");

extern "C" uint32_t isaac_render_shell_a15570_is_pow2(uint32_t n) {
  /* VA 0x00a15570: `test ecx,ecx` FULL-dword zero gate; je -> 0.
     VA 0x00a15574: `lea eax,[ecx-1]` (n-1, flags unchanged).
     VA 0x00a15577: `test ecx,eax` FULL-dword (n & (n-1)) == 0; jne -> 0.
     VA 0x00a1557b: `mov al,1` -> 1. */
  if (n == 0u) {
    return 0u;
  }
  return (n & (n - 1u)) == 0u ? 1u : 0u;
}

extern "C" uint32_t isaac_render_shell_a15570_host_va(void) {
  return ISAAC_RENDER_SHELL_A15570_HOST_VA;
}
extern "C" uint32_t isaac_render_shell_a15570_end_va(void) {
  return ISAAC_RENDER_SHELL_A15570_END_VA;
}
extern "C" uint32_t isaac_render_shell_a15570_next_va(void) {
  return ISAAC_RENDER_SHELL_A15570_NEXT_VA;
}
extern "C" uint32_t isaac_render_shell_a15570_caller_count(void) {
  return ISAAC_RENDER_SHELL_A15570_CALLER_COUNT;
}
extern "C" uint32_t isaac_render_shell_a15570_caller_first_va(void) {
  return ISAAC_RENDER_SHELL_A15570_CALLER_FIRST_VA;
}
extern "C" uint32_t isaac_render_shell_a15570_caller_last_va(void) {
  return ISAAC_RENDER_SHELL_A15570_CALLER_LAST_VA;
}
extern "C" uint32_t isaac_render_shell_a15570_logger_va(void) {
  return ISAAC_RENDER_SHELL_A15570_LOGGER_VA;
}
extern "C" uint32_t isaac_render_shell_a15570_log_msg_va(void) {
  return ISAAC_RENDER_SHELL_A15570_LOG_MSG_VA;
}
extern "C" uint32_t isaac_render_shell_a15570_log_level(void) {
  return ISAAC_RENDER_SHELL_A15570_LOG_LEVEL;
}
extern "C" uint32_t isaac_render_shell_a15570_stack_args(void) {
  return ISAAC_RENDER_SHELL_A15570_STACK_ARGS;
}
extern "C" uint32_t isaac_render_shell_a15570_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A15570_ADDR_TAKEN_COUNT;
}
extern "C" uint32_t isaac_render_shell_a15570_eax_writes(void) {
  return ISAAC_RENDER_SHELL_A15570_EAX_WRITES;
}

/* ===========================================================================
 * FUN_00a13fa0 shader-object factory — ABI v57 (NARROWED)
 *
 * PE order, exact machine CF:
 *   0x00a13fa0..0x00a14043, ret 0xc @ 0xa14040 (3 stack args:
 *   name@[ebp+8], tag@[ebp+0xc], pair-table@[ebp+0x10]); plain ebp
 *   frame (no SEH/GS); no exact ZHL. int3 pad 0xa14043..0xa1404f,
 *   next body = a14050 @ 0xa14050.
 *   Gates: counter select `test esi,esi` (FULL dword) / je 0xa13fb7
 *   -> default 0xc7f618 else [0xc7de78]+0x30; alloc `test eax,eax`
 *   (FULL) / jne 0xa14000; init `test al,al` (BYTE on AL) / jne
 *   0xa1401d; destroy `test esi,esi` (FULL) / je 0xa13ff7; obj
 *   `test ecx,ecx` (FULL) / je 0xa13fd5.
 *   Arith: add dword [esi],0x54 (counter lo, 32-bit wrap) /
 *   adc dword [esi+4],0 (hi += carry); lea ecx,[eax+4] (obj =
 *   alloc + 4-byte header); mov [eax],0x54 (header size imm).
 *   Host: alloc IAT [0xb187e0] (0x54), notify-list dispatch
 *   0xa23200 (hash 0x7fcb9dd6; result unused), zero-init 0xa245b0
 *   (eax = ecx), LANDED init 0xa14620 (ret 0xc, al out), LANDED hash
 *   0xa159d0, HOST-MARKED map find-or-insert 0xa14330 (map 0xc379bc,
 *   key &hash) -> [eax] = obj, virtual dtor slot 0 with push 1.
 *   6 direct rel32 callers (registry-loader band): 0xa18102 /
 *   0xa18131 / 0xa18160 / 0xa19003 / 0xa19032 / 0xa19061.
 *   The counter pair select is the ALLOC side of the tracked template
 *   pinned in a149a0/a150d0 (same select, sub [edx],eax of [ptr-4]).
 * PE evidence: section-notes/render-shell-v57-net/NOTES.md
 * =========================================================================== */

static_assert((uint32_t)ISAAC_RENDER_SHELL_A13FA0_HOST_VA == 0x00a13fa0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A13FA0_END_VA == 0x00a14043u,
              "push ebp @ 0xa13fa0, mov al,1 @ 0xa1403a, ret 0xc @ "
              "0xa14040");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A13FA0_NEXT_VA == 0x00a14050u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A13FA0_NEXT_VA -
                          (uint32_t)ISAAC_RENDER_SHELL_A13FA0_END_VA ==
                      0x0du,
              "int3 pad 0xa14043..0xa1404f, then the a14050 chain body "
              "0xa14050");
static_assert(ISAAC_RENDER_SHELL_A13FA0_CALLER_COUNT == 6u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A13FA0_CALLER_FIRST_VA ==
                      0x00a18102u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A13FA0_CALLER_LAST_VA ==
                      0x00a19061u,
              "census: 6 direct rel32 callers 0xa18102/0xa18131/0xa18160/"
              "0xa19003/0xa19032/0xa19061");
static_assert(ISAAC_RENDER_SHELL_A13FA0_STACK_ARGS == 3u &&
                  ISAAC_RENDER_SHELL_A13FA0_ADDR_TAKEN_COUNT == 0u &&
                  ISAAC_RENDER_SHELL_A13FA0_EAX_WRITES == 2u,
              "ret 0xc pops 3 stack args; 0 address-taken; eax writes "
              "xor al,al @ 0xa13ff7 / mov al,1 @ 0xa1403a");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A13FA0_ALLOC_IAT_VA ==
                      0x00b187e0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A13FA0_NOTIFY_FN_VA ==
                      0x00a23200u &&
                  ISAAC_RENDER_SHELL_A13FA0_NOTIFY_HASH == 0x7fcb9dd6u,
              "push 0x54 / call [0xb187e0]; alloc-fail notify-list "
              "0xa23200 with hash 0x7fcb9dd6");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A13FA0_ZERO_INIT_FN_VA ==
                      0x00a245b0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A13FA0_INIT_FN_VA ==
                      0x00a14620u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A13FA0_HASH_FN_VA ==
                      0x00a159d0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A13FA0_MAP_FN_VA ==
                      0x00a14330u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A13FA0_MAP_THIS_VA ==
                      0x00c379bcu,
              "init 0xa14620 / hash 0xa159d0 / map 0xa14330 on 0xc379bc");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A13FA0_COUNTER_INSTALLED_VA ==
                      0x00c7de78u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A13FA0_COUNTER_DEFAULT_VA ==
                      0x00c7f618u &&
                  ISAAC_RENDER_SHELL_A13FA0_COUNTER_PAIR_OFF == 0x30u &&
                  ISAAC_RENDER_SHELL_A13FA0_COUNTER_INC == 0x54u &&
                  ISAAC_RENDER_SHELL_A13FA0_DESTROY_FLAG == 1u,
              "tracked counter select [0xc7de78]/0xc7f618 + 0x30; "
              "counter += 0x54; vdtor push 1");

extern "C" uint32_t isaac_render_shell_a13fa0_counter_base(
    uint32_t counter_ptr) {
  /* 0xa13fa8 mov esi,[0xc7de78]; 0xa13fae test esi,esi (FULL dword);
     0xa13fb0 je 0xa13fb7 -> 0xc7f618; 0xa13fb2 add esi,0x30. */
  if (counter_ptr != 0u) {
    return counter_ptr + 0x30u;
  }
  return 0x00c7f618u;
}
extern "C" uint32_t isaac_render_shell_a13fa0_alloc_size(void) {
  return 0x54u;
}
extern "C" uint32_t isaac_render_shell_a13fa0_alloc_gate(uint32_t alloc) {
  /* 0xa13fc7 test eax,eax (FULL dword); 0xa13fc9 jne 0xa14000. */
  return alloc != 0u ? 1u : 0u;
}
extern "C" uint32_t isaac_render_shell_a13fa0_counter_add_lo(uint32_t lo) {
  /* 0xa14000 add dword [esi],0x54 — 32-bit wrap. */
  return lo + 0x54u;
}
extern "C" uint32_t isaac_render_shell_a13fa0_counter_carry(uint32_t lo) {
  /* CF after the 32-bit add: carry iff lo + 0x54 wrapped. */
  return (lo + 0x54u) < lo ? 1u : 0u;
}
extern "C" uint32_t isaac_render_shell_a13fa0_counter_add_hi(
    uint32_t lo, uint32_t hi) {
  /* 0xa1400c adc dword [esi+4],0 — hi += carry(lo + 0x54). */
  return hi + ((lo + 0x54u) < lo ? 1u : 0u);
}
extern "C" uint32_t isaac_render_shell_a13fa0_obj_off(void) {
  return 0x04u;
}
extern "C" uint32_t isaac_render_shell_a13fa0_obj_gate(uint32_t obj) {
  /* 0xa14010 test ecx,ecx (FULL dword); 0xa14012 je 0xa13fd5. */
  return obj != 0u ? 1u : 0u;
}
extern "C" uint32_t isaac_render_shell_a13fa0_init_gate(uint32_t al) {
  /* 0xa13fe7 test al,al — BYTE gate on AL only; 0xa13fe9 jne 0xa1401d. */
  return (al & 0xffu) != 0u ? 1u : 0u;
}
extern "C" uint32_t isaac_render_shell_a13fa0_destroy_gate(uint32_t obj) {
  /* 0xa13feb test esi,esi (FULL dword); 0xa13fed je 0xa13ff7. */
  return obj != 0u ? 1u : 0u;
}
extern "C" uint32_t isaac_render_shell_a13fa0_destroy_flag(void) {
  return 1u;
}
extern "C" uint32_t isaac_render_shell_a13fa0_host_va(void) {
  return ISAAC_RENDER_SHELL_A13FA0_HOST_VA;
}
extern "C" uint32_t isaac_render_shell_a13fa0_end_va(void) {
  return ISAAC_RENDER_SHELL_A13FA0_END_VA;
}
extern "C" uint32_t isaac_render_shell_a13fa0_next_va(void) {
  return ISAAC_RENDER_SHELL_A13FA0_NEXT_VA;
}
extern "C" uint32_t isaac_render_shell_a13fa0_caller_count(void) {
  return ISAAC_RENDER_SHELL_A13FA0_CALLER_COUNT;
}
extern "C" uint32_t isaac_render_shell_a13fa0_caller_first_va(void) {
  return ISAAC_RENDER_SHELL_A13FA0_CALLER_FIRST_VA;
}
extern "C" uint32_t isaac_render_shell_a13fa0_caller_last_va(void) {
  return ISAAC_RENDER_SHELL_A13FA0_CALLER_LAST_VA;
}
extern "C" uint32_t isaac_render_shell_a13fa0_stack_args(void) {
  return ISAAC_RENDER_SHELL_A13FA0_STACK_ARGS;
}
extern "C" uint32_t isaac_render_shell_a13fa0_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A13FA0_ADDR_TAKEN_COUNT;
}
extern "C" uint32_t isaac_render_shell_a13fa0_eax_writes(void) {
  return ISAAC_RENDER_SHELL_A13FA0_EAX_WRITES;
}
extern "C" uint32_t isaac_render_shell_a13fa0_alloc_iat_va(void) {
  return ISAAC_RENDER_SHELL_A13FA0_ALLOC_IAT_VA;
}
extern "C" uint32_t isaac_render_shell_a13fa0_notify_fn_va(void) {
  return ISAAC_RENDER_SHELL_A13FA0_NOTIFY_FN_VA;
}
extern "C" uint32_t isaac_render_shell_a13fa0_notify_hash(void) {
  return ISAAC_RENDER_SHELL_A13FA0_NOTIFY_HASH;
}
extern "C" uint32_t isaac_render_shell_a13fa0_zero_init_fn_va(void) {
  return ISAAC_RENDER_SHELL_A13FA0_ZERO_INIT_FN_VA;
}
extern "C" uint32_t isaac_render_shell_a13fa0_init_fn_va(void) {
  return ISAAC_RENDER_SHELL_A13FA0_INIT_FN_VA;
}
extern "C" uint32_t isaac_render_shell_a13fa0_hash_fn_va(void) {
  return ISAAC_RENDER_SHELL_A13FA0_HASH_FN_VA;
}
extern "C" uint32_t isaac_render_shell_a13fa0_map_fn_va(void) {
  return ISAAC_RENDER_SHELL_A13FA0_MAP_FN_VA;
}
extern "C" uint32_t isaac_render_shell_a13fa0_map_this_va(void) {
  return ISAAC_RENDER_SHELL_A13FA0_MAP_THIS_VA;
}
extern "C" uint32_t isaac_render_shell_a13fa0_counter_installed_va(void) {
  return ISAAC_RENDER_SHELL_A13FA0_COUNTER_INSTALLED_VA;
}
extern "C" uint32_t isaac_render_shell_a13fa0_counter_default_va(void) {
  return ISAAC_RENDER_SHELL_A13FA0_COUNTER_DEFAULT_VA;
}
extern "C" uint32_t isaac_render_shell_a13fa0_counter_pair_off(void) {
  return ISAAC_RENDER_SHELL_A13FA0_COUNTER_PAIR_OFF;
}
extern "C" uint32_t isaac_render_shell_a13fa0_counter_inc(void) {
  return ISAAC_RENDER_SHELL_A13FA0_COUNTER_INC;
}

/* ============================================================================
 * ABI v58: SECOND BAND caller bodies (NARROWED) -- laws + layout.
 * PE evidence: render-shell-v58-band2/NOTES.md; spans in comments.
 * ============================================================================ */


/* ---- a180a0 (ISAAC_RENDER_SHELL_A180A0_HOST_VA) ---- */

static_assert((uint32_t)ISAAC_RENDER_SHELL_A180A0_HOST_VA == 0x00a180a0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A180A0_END_VA == 0x00a18229u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A180A0_NEXT_VA == 0x00a18230u,
              "v58 a180a0 span (cpu-dump 00aa180a0.txt + NOTES)");

extern "C" uint32_t isaac_render_shell_a180a0_alloc_gate(uint32_t alloc) {
  /* 0xa1818b test eax,eax (FULL dword); 0xa1818d je 0xa18198. */
  return alloc != 0u ? 1u : 0u;
}

extern "C" uint32_t isaac_render_shell_a180a0_host_va(void) {
  return ISAAC_RENDER_SHELL_A180A0_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a180a0_end_va(void) {
  return ISAAC_RENDER_SHELL_A180A0_END_VA;
}

extern "C" uint32_t isaac_render_shell_a180a0_next_va(void) {
  return ISAAC_RENDER_SHELL_A180A0_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a180a0_caller_count(void) {
  return ISAAC_RENDER_SHELL_A180A0_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_a180a0_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A180A0_ADDR_TAKEN_COUNT;
}

extern "C" uint32_t isaac_render_shell_a180a0_eax_writes(void) {
  return ISAAC_RENDER_SHELL_A180A0_EAX_WRITES;
}

extern "C" uint32_t isaac_render_shell_a180a0_stack_args(void) {
  return ISAAC_RENDER_SHELL_A180A0_STACK_ARGS;
}

extern "C" uint32_t isaac_render_shell_a180a0_vtable_va(void) {
  return ISAAC_RENDER_SHELL_A180A0_VTABLE_VA;
}

extern "C" uint32_t isaac_render_shell_a180a0_tail_va(void) {
  return ISAAC_RENDER_SHELL_A180A0_TAIL_VA;
}

extern "C" uint32_t isaac_render_shell_a180a0_seh_slot_va(void) {
  return ISAAC_RENDER_SHELL_A180A0_SEH_SLOT_VA;
}

extern "C" uint32_t isaac_render_shell_a180a0_seh_reg_va(void) {
  return ISAAC_RENDER_SHELL_A180A0_SEH_REG_VA;
}

extern "C" uint32_t isaac_render_shell_a180a0_gs_cookie_va(void) {
  return ISAAC_RENDER_SHELL_A180A0_GS_COOKIE_VA;
}

extern "C" uint32_t isaac_render_shell_a180a0_triple1_name_va(void) {
  return ISAAC_RENDER_SHELL_A180A0_TRIPLE1_NAME_VA;
}

extern "C" uint32_t isaac_render_shell_a180a0_triple1_arg2(void) {
  return ISAAC_RENDER_SHELL_A180A0_TRIPLE1_ARG2;
}

extern "C" uint32_t isaac_render_shell_a180a0_triple1_base_va(void) {
  return ISAAC_RENDER_SHELL_A180A0_TRIPLE1_BASE_VA;
}

extern "C" uint32_t isaac_render_shell_a180a0_triple1_val(void) {
  return ISAAC_RENDER_SHELL_A180A0_TRIPLE1_VAL;
}

extern "C" uint32_t isaac_render_shell_a180a0_triple1_str_va(void) {
  return ISAAC_RENDER_SHELL_A180A0_TRIPLE1_STR_VA;
}

extern "C" uint32_t isaac_render_shell_a180a0_triple1_val2(void) {
  return ISAAC_RENDER_SHELL_A180A0_TRIPLE1_VAL2;
}

extern "C" uint32_t isaac_render_shell_a180a0_triple2_name_va(void) {
  return ISAAC_RENDER_SHELL_A180A0_TRIPLE2_NAME_VA;
}

extern "C" uint32_t isaac_render_shell_a180a0_triple2_arg2(void) {
  return ISAAC_RENDER_SHELL_A180A0_TRIPLE2_ARG2;
}

extern "C" uint32_t isaac_render_shell_a180a0_triple2_base_va(void) {
  return ISAAC_RENDER_SHELL_A180A0_TRIPLE2_BASE_VA;
}

extern "C" uint32_t isaac_render_shell_a180a0_triple2_val(void) {
  return ISAAC_RENDER_SHELL_A180A0_TRIPLE2_VAL;
}

extern "C" uint32_t isaac_render_shell_a180a0_triple2_str_va(void) {
  return ISAAC_RENDER_SHELL_A180A0_TRIPLE2_STR_VA;
}

extern "C" uint32_t isaac_render_shell_a180a0_triple2_val2(void) {
  return ISAAC_RENDER_SHELL_A180A0_TRIPLE2_VAL2;
}

extern "C" uint32_t isaac_render_shell_a180a0_triple3_name_va(void) {
  return ISAAC_RENDER_SHELL_A180A0_TRIPLE3_NAME_VA;
}

extern "C" uint32_t isaac_render_shell_a180a0_triple3_arg2(void) {
  return ISAAC_RENDER_SHELL_A180A0_TRIPLE3_ARG2;
}

extern "C" uint32_t isaac_render_shell_a180a0_triple3_base_va(void) {
  return ISAAC_RENDER_SHELL_A180A0_TRIPLE3_BASE_VA;
}

extern "C" uint32_t isaac_render_shell_a180a0_triple3_val(void) {
  return ISAAC_RENDER_SHELL_A180A0_TRIPLE3_VAL;
}

extern "C" uint32_t isaac_render_shell_a180a0_triple3_str_va(void) {
  return ISAAC_RENDER_SHELL_A180A0_TRIPLE3_STR_VA;
}

extern "C" uint32_t isaac_render_shell_a180a0_triple3_val2(void) {
  return ISAAC_RENDER_SHELL_A180A0_TRIPLE3_VAL2;
}

extern "C" uint32_t isaac_render_shell_a180a0_vt_slot_78(void) {
  return ISAAC_RENDER_SHELL_A180A0_VT_SLOT_78;
}

extern "C" uint32_t isaac_render_shell_a180a0_vt_slot_18(void) {
  return ISAAC_RENDER_SHELL_A180A0_VT_SLOT_18;
}

extern "C" uint32_t isaac_render_shell_a180a0_vt_slot_58(void) {
  return ISAAC_RENDER_SHELL_A180A0_VT_SLOT_58;
}

extern "C" uint32_t isaac_render_shell_a180a0_vt18_arg0(void) {
  return ISAAC_RENDER_SHELL_A180A0_VT18_ARG0;
}

extern "C" uint32_t isaac_render_shell_a180a0_vt18_arg1(void) {
  return ISAAC_RENDER_SHELL_A180A0_VT18_ARG1;
}

extern "C" uint32_t isaac_render_shell_a180a0_alloc_size(void) {
  return ISAAC_RENDER_SHELL_A180A0_ALLOC_SIZE;
}

extern "C" uint32_t isaac_render_shell_a180a0_ctor_va(void) {
  return ISAAC_RENDER_SHELL_A180A0_CTOR_VA;
}

extern "C" uint32_t isaac_render_shell_a180a0_color_arg_bits(void) {
  return ISAAC_RENDER_SHELL_A180A0_COLOR_ARG_BITS;
}

extern "C" uint32_t isaac_render_shell_a180a0_color_ctor_va(void) {
  return ISAAC_RENDER_SHELL_A180A0_COLOR_CTOR_VA;
}

extern "C" uint32_t isaac_render_shell_a180a0_obj_global_va(void) {
  return ISAAC_RENDER_SHELL_A180A0_OBJ_GLOBAL_VA;
}

extern "C" uint32_t isaac_render_shell_a180a0_obj_flag_off(void) {
  return ISAAC_RENDER_SHELL_A180A0_OBJ_FLAG_OFF;
}

extern "C" uint32_t isaac_render_shell_a180a0_obj_flag_val(void) {
  return ISAAC_RENDER_SHELL_A180A0_OBJ_FLAG_VAL;
}

extern "C" uint32_t isaac_render_shell_a180a0_flag_379b4_va(void) {
  return ISAAC_RENDER_SHELL_A180A0_FLAG_379B4_VA;
}

extern "C" uint32_t isaac_render_shell_a180a0_flag_37984_va(void) {
  return ISAAC_RENDER_SHELL_A180A0_FLAG_37984_VA;
}

extern "C" uint32_t isaac_render_shell_a180a0_flag_val(void) {
  return ISAAC_RENDER_SHELL_A180A0_FLAG_VAL;
}

extern "C" uint32_t isaac_render_shell_a180a0_this_flag_off(void) {
  return ISAAC_RENDER_SHELL_A180A0_THIS_FLAG_OFF;
}

extern "C" uint32_t isaac_render_shell_a180a0_hook_va_0(void) {
  return ISAAC_RENDER_SHELL_A180A0_HOOK_VA_0;
}

extern "C" uint32_t isaac_render_shell_a180a0_hook_va_1(void) {
  return ISAAC_RENDER_SHELL_A180A0_HOOK_VA_1;
}

extern "C" uint32_t isaac_render_shell_a180a0_hook_target_va(void) {
  return ISAAC_RENDER_SHELL_A180A0_HOOK_TARGET_VA;
}

extern "C" uint32_t isaac_render_shell_a180a0_vt58_float0_bits(void) {
  return ISAAC_RENDER_SHELL_A180A0_VT58_FLOAT0_BITS;
}

extern "C" uint32_t isaac_render_shell_a180a0_vt58_float1_bits(void) {
  return ISAAC_RENDER_SHELL_A180A0_VT58_FLOAT1_BITS;
}


/* ---- a18e10 (ISAAC_RENDER_SHELL_A18E10_HOST_VA) ---- */

static_assert((uint32_t)ISAAC_RENDER_SHELL_A18E10_HOST_VA == 0x00a18e10u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A18E10_END_VA == 0x00a18e8au &&
                  (uint32_t)ISAAC_RENDER_SHELL_A18E10_NEXT_VA == 0x00a18e90u,
              "v58 a18e10 span (cpu-dump 00aa18e10.txt + NOTES)");

extern "C" uint32_t isaac_render_shell_a18e10_host_va(void) {
  return ISAAC_RENDER_SHELL_A18E10_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a18e10_end_va(void) {
  return ISAAC_RENDER_SHELL_A18E10_END_VA;
}

extern "C" uint32_t isaac_render_shell_a18e10_next_va(void) {
  return ISAAC_RENDER_SHELL_A18E10_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a18e10_caller_count(void) {
  return ISAAC_RENDER_SHELL_A18E10_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_a18e10_caller_first_va(void) {
  return ISAAC_RENDER_SHELL_A18E10_CALLER_FIRST_VA;
}

extern "C" uint32_t isaac_render_shell_a18e10_caller_last_va(void) {
  return ISAAC_RENDER_SHELL_A18E10_CALLER_LAST_VA;
}

extern "C" uint32_t isaac_render_shell_a18e10_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A18E10_ADDR_TAKEN_COUNT;
}

extern "C" uint32_t isaac_render_shell_a18e10_eax_writes(void) {
  return ISAAC_RENDER_SHELL_A18E10_EAX_WRITES;
}

extern "C" uint32_t isaac_render_shell_a18e10_stack_args(void) {
  return ISAAC_RENDER_SHELL_A18E10_STACK_ARGS;
}

extern "C" uint32_t isaac_render_shell_a18e10_vtable_first_va(void) {
  return ISAAC_RENDER_SHELL_A18E10_VTABLE_FIRST_VA;
}

extern "C" uint32_t isaac_render_shell_a18e10_vtable_final_va(void) {
  return ISAAC_RENDER_SHELL_A18E10_VTABLE_FINAL_VA;
}

extern "C" uint32_t isaac_render_shell_a18e10_tail_va(void) {
  return ISAAC_RENDER_SHELL_A18E10_TAIL_VA;
}

extern "C" uint32_t isaac_render_shell_a18e10_slot_off_0(void) {
  return ISAAC_RENDER_SHELL_A18E10_SLOT_OFF_0;
}

extern "C" uint32_t isaac_render_shell_a18e10_slot_off_1(void) {
  return ISAAC_RENDER_SHELL_A18E10_SLOT_OFF_1;
}

extern "C" uint32_t isaac_render_shell_a18e10_slot_off_2(void) {
  return ISAAC_RENDER_SHELL_A18E10_SLOT_OFF_2;
}

extern "C" uint32_t isaac_render_shell_a18e10_slot_off_3(void) {
  return ISAAC_RENDER_SHELL_A18E10_SLOT_OFF_3;
}

extern "C" uint32_t isaac_render_shell_a18e10_free_size(void) {
  return ISAAC_RENDER_SHELL_A18E10_FREE_SIZE;
}

extern "C" uint32_t isaac_render_shell_a18e10_free_fn_va(void) {
  return ISAAC_RENDER_SHELL_A18E10_FREE_FN_VA;
}

extern "C" uint32_t isaac_render_shell_a18e10_reset_fn_va(void) {
  return ISAAC_RENDER_SHELL_A18E10_RESET_FN_VA;
}


/* ---- a18e90 (ISAAC_RENDER_SHELL_A18E90_HOST_VA) ---- */

static_assert((uint32_t)ISAAC_RENDER_SHELL_A18E90_HOST_VA == 0x00a18e90u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A18E90_END_VA == 0x00a1912cu &&
                  (uint32_t)ISAAC_RENDER_SHELL_A18E90_NEXT_VA == 0x00a19130u,
              "v58 a18e90 span (cpu-dump 00aa18e90.txt + NOTES)");

extern "C" uint32_t isaac_render_shell_a18e90_flag_gate(uint32_t b) {
  /* 0xa18f15 test bl,bl; 0xa18f17 cmove ecx,eax -- bl==0 selects
     the 0xfffffbff-ANDed (CLEARED) value, bl!=0 keeps the
     0x400-ORed value. BYTE gate on the [0xc79a3c] state byte:
     low byte only. */
  return (b & 0xffu) == 0u ? 1u : 0u;
}

extern "C" uint32_t isaac_render_shell_a18e90_win_gate(uint32_t b) {
  /* 0xa18f46 test bl,bl; 0xa18f48 cmovne eax,ecx -- bl!=0
     selects the 0x10000-ORed (SET) value, bl==0 keeps the
     0xfffeffff-ANDed value. BYTE gate (same state byte). */
  return (b & 0xffu) != 0u ? 1u : 0u;
}

extern "C" uint32_t isaac_render_shell_a18e90_tail_gate(uint32_t al) {
  /* 0xa18f67 test al,al; 0xa18f69 jne 0xa18f7d -- BYTE gate on
     AL (a19df0 return); low byte != 0 runs the a13fa0 triple
     tail. */
  return (al & 0xffu) != 0u ? 1u : 0u;
}

extern "C" uint32_t isaac_render_shell_a18e90_alloc_gate(uint32_t alloc) {
  /* 0xa1908c test eax,eax (FULL dword); 0xa1908e je 0xa19099. */
  return alloc != 0u ? 1u : 0u;
}

extern "C" uint32_t isaac_render_shell_a18e90_host_va(void) {
  return ISAAC_RENDER_SHELL_A18E90_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a18e90_end_va(void) {
  return ISAAC_RENDER_SHELL_A18E90_END_VA;
}

extern "C" uint32_t isaac_render_shell_a18e90_next_va(void) {
  return ISAAC_RENDER_SHELL_A18E90_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a18e90_caller_count(void) {
  return ISAAC_RENDER_SHELL_A18E90_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_a18e90_caller_first_va(void) {
  return ISAAC_RENDER_SHELL_A18E90_CALLER_FIRST_VA;
}

extern "C" uint32_t isaac_render_shell_a18e90_caller_last_va(void) {
  return ISAAC_RENDER_SHELL_A18E90_CALLER_LAST_VA;
}

extern "C" uint32_t isaac_render_shell_a18e90_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A18E90_ADDR_TAKEN_COUNT;
}

extern "C" uint32_t isaac_render_shell_a18e90_eax_writes(void) {
  return ISAAC_RENDER_SHELL_A18E90_EAX_WRITES;
}

extern "C" uint32_t isaac_render_shell_a18e90_stack_args(void) {
  return ISAAC_RENDER_SHELL_A18E90_STACK_ARGS;
}

extern "C" uint32_t isaac_render_shell_a18e90_vtable_va(void) {
  return ISAAC_RENDER_SHELL_A18E90_VTABLE_VA;
}

extern "C" uint32_t isaac_render_shell_a18e90_vtable_slot(void) {
  return ISAAC_RENDER_SHELL_A18E90_VTABLE_SLOT;
}

extern "C" uint32_t isaac_render_shell_a18e90_seh_reg_va(void) {
  return ISAAC_RENDER_SHELL_A18E90_SEH_REG_VA;
}

extern "C" uint32_t isaac_render_shell_a18e90_gs_cookie_va(void) {
  return ISAAC_RENDER_SHELL_A18E90_GS_COOKIE_VA;
}

extern "C" uint32_t isaac_render_shell_a18e90_hook_va(void) {
  return ISAAC_RENDER_SHELL_A18E90_HOOK_VA;
}

extern "C" uint32_t isaac_render_shell_a18e90_hook_target_va(void) {
  return ISAAC_RENDER_SHELL_A18E90_HOOK_TARGET_VA;
}

extern "C" uint32_t isaac_render_shell_a18e90_state_call_va(void) {
  return ISAAC_RENDER_SHELL_A18E90_STATE_CALL_VA;
}

extern "C" uint32_t isaac_render_shell_a18e90_state_ok_val(void) {
  return ISAAC_RENDER_SHELL_A18E90_STATE_OK_VAL;
}

extern "C" uint32_t isaac_render_shell_a18e90_log_msg_va(void) {
  return ISAAC_RENDER_SHELL_A18E90_LOG_MSG_VA;
}

extern "C" uint32_t isaac_render_shell_a18e90_log_level(void) {
  return ISAAC_RENDER_SHELL_A18E90_LOG_LEVEL;
}

extern "C" uint32_t isaac_render_shell_a18e90_pair_va(void) {
  return ISAAC_RENDER_SHELL_A18E90_PAIR_VA;
}

extern "C" uint32_t isaac_render_shell_a18e90_pair2_va(void) {
  return ISAAC_RENDER_SHELL_A18E90_PAIR2_VA;
}

extern "C" uint32_t isaac_render_shell_a18e90_state_byte_va(void) {
  return ISAAC_RENDER_SHELL_A18E90_STATE_BYTE_VA;
}

extern "C" uint32_t isaac_render_shell_a18e90_relay_off_0(void) {
  return ISAAC_RENDER_SHELL_A18E90_RELAY_OFF_0;
}

extern "C" uint32_t isaac_render_shell_a18e90_relay_off_1(void) {
  return ISAAC_RENDER_SHELL_A18E90_RELAY_OFF_1;
}

extern "C" uint32_t isaac_render_shell_a18e90_flag_clear_mask(void) {
  return ISAAC_RENDER_SHELL_A18E90_FLAG_CLEAR_MASK;
}

extern "C" uint32_t isaac_render_shell_a18e90_flag_set_bits(void) {
  return ISAAC_RENDER_SHELL_A18E90_FLAG_SET_BITS;
}

extern "C" uint32_t isaac_render_shell_a18e90_win_clear_mask(void) {
  return ISAAC_RENDER_SHELL_A18E90_WIN_CLEAR_MASK;
}

extern "C" uint32_t isaac_render_shell_a18e90_win_set_bits(void) {
  return ISAAC_RENDER_SHELL_A18E90_WIN_SET_BITS;
}

extern "C" uint32_t isaac_render_shell_a18e90_this_flag_off(void) {
  return ISAAC_RENDER_SHELL_A18E90_THIS_FLAG_OFF;
}

extern "C" uint32_t isaac_render_shell_a18e90_slot_off(void) {
  return ISAAC_RENDER_SHELL_A18E90_SLOT_OFF;
}

extern "C" uint32_t isaac_render_shell_a18e90_preload_arg(void) {
  return ISAAC_RENDER_SHELL_A18E90_PRELOAD_ARG;
}

extern "C" uint32_t isaac_render_shell_a18e90_preload_fn_va(void) {
  return ISAAC_RENDER_SHELL_A18E90_PRELOAD_FN_VA;
}

extern "C" uint32_t isaac_render_shell_a18e90_dbl_iat_va_0(void) {
  return ISAAC_RENDER_SHELL_A18E90_DBL_IAT_VA_0;
}

extern "C" uint32_t isaac_render_shell_a18e90_dbl_iat_va_1(void) {
  return ISAAC_RENDER_SHELL_A18E90_DBL_IAT_VA_1;
}

extern "C" uint32_t isaac_render_shell_a18e90_win_off(void) {
  return ISAAC_RENDER_SHELL_A18E90_WIN_OFF;
}

extern "C" uint32_t isaac_render_shell_a18e90_win_flag_off(void) {
  return ISAAC_RENDER_SHELL_A18E90_WIN_FLAG_OFF;
}

extern "C" uint32_t isaac_render_shell_a18e90_escalate_line(void) {
  return ISAAC_RENDER_SHELL_A18E90_ESCALATE_LINE;
}

extern "C" uint32_t isaac_render_shell_a18e90_escalate_file_va(void) {
  return ISAAC_RENDER_SHELL_A18E90_ESCALATE_FILE_VA;
}

extern "C" uint32_t isaac_render_shell_a18e90_escalate_msg_va(void) {
  return ISAAC_RENDER_SHELL_A18E90_ESCALATE_MSG_VA;
}

extern "C" uint32_t isaac_render_shell_a18e90_escalate_iat_va(void) {
  return ISAAC_RENDER_SHELL_A18E90_ESCALATE_IAT_VA;
}

extern "C" uint32_t isaac_render_shell_a18e90_init_fn_va(void) {
  return ISAAC_RENDER_SHELL_A18E90_INIT_FN_VA;
}

extern "C" uint32_t isaac_render_shell_a18e90_init_arg0(void) {
  return ISAAC_RENDER_SHELL_A18E90_INIT_ARG0;
}

extern "C" uint32_t isaac_render_shell_a18e90_init_arg1(void) {
  return ISAAC_RENDER_SHELL_A18E90_INIT_ARG1;
}

extern "C" uint32_t isaac_render_shell_a18e90_notify_flag_va(void) {
  return ISAAC_RENDER_SHELL_A18E90_NOTIFY_FLAG_VA;
}

extern "C" uint32_t isaac_render_shell_a18e90_notify_fn_va_0(void) {
  return ISAAC_RENDER_SHELL_A18E90_NOTIFY_FN_VA_0;
}

extern "C" uint32_t isaac_render_shell_a18e90_notify_fn_va_1(void) {
  return ISAAC_RENDER_SHELL_A18E90_NOTIFY_FN_VA_1;
}

extern "C" uint32_t isaac_render_shell_a18e90_triple1_name_va(void) {
  return ISAAC_RENDER_SHELL_A18E90_TRIPLE1_NAME_VA;
}

extern "C" uint32_t isaac_render_shell_a18e90_triple1_arg2(void) {
  return ISAAC_RENDER_SHELL_A18E90_TRIPLE1_ARG2;
}

extern "C" uint32_t isaac_render_shell_a18e90_triple1_base_va(void) {
  return ISAAC_RENDER_SHELL_A18E90_TRIPLE1_BASE_VA;
}

extern "C" uint32_t isaac_render_shell_a18e90_triple1_val(void) {
  return ISAAC_RENDER_SHELL_A18E90_TRIPLE1_VAL;
}

extern "C" uint32_t isaac_render_shell_a18e90_triple1_str_va(void) {
  return ISAAC_RENDER_SHELL_A18E90_TRIPLE1_STR_VA;
}

extern "C" uint32_t isaac_render_shell_a18e90_triple1_val2(void) {
  return ISAAC_RENDER_SHELL_A18E90_TRIPLE1_VAL2;
}

extern "C" uint32_t isaac_render_shell_a18e90_triple2_name_va(void) {
  return ISAAC_RENDER_SHELL_A18E90_TRIPLE2_NAME_VA;
}

extern "C" uint32_t isaac_render_shell_a18e90_triple2_arg2(void) {
  return ISAAC_RENDER_SHELL_A18E90_TRIPLE2_ARG2;
}

extern "C" uint32_t isaac_render_shell_a18e90_triple2_base_va(void) {
  return ISAAC_RENDER_SHELL_A18E90_TRIPLE2_BASE_VA;
}

extern "C" uint32_t isaac_render_shell_a18e90_triple2_val(void) {
  return ISAAC_RENDER_SHELL_A18E90_TRIPLE2_VAL;
}

extern "C" uint32_t isaac_render_shell_a18e90_triple2_str_va(void) {
  return ISAAC_RENDER_SHELL_A18E90_TRIPLE2_STR_VA;
}

extern "C" uint32_t isaac_render_shell_a18e90_triple2_val2(void) {
  return ISAAC_RENDER_SHELL_A18E90_TRIPLE2_VAL2;
}

extern "C" uint32_t isaac_render_shell_a18e90_triple3_name_va(void) {
  return ISAAC_RENDER_SHELL_A18E90_TRIPLE3_NAME_VA;
}

extern "C" uint32_t isaac_render_shell_a18e90_triple3_arg2(void) {
  return ISAAC_RENDER_SHELL_A18E90_TRIPLE3_ARG2;
}

extern "C" uint32_t isaac_render_shell_a18e90_triple3_base_va(void) {
  return ISAAC_RENDER_SHELL_A18E90_TRIPLE3_BASE_VA;
}

extern "C" uint32_t isaac_render_shell_a18e90_triple3_val(void) {
  return ISAAC_RENDER_SHELL_A18E90_TRIPLE3_VAL;
}

extern "C" uint32_t isaac_render_shell_a18e90_triple3_str_va(void) {
  return ISAAC_RENDER_SHELL_A18E90_TRIPLE3_STR_VA;
}

extern "C" uint32_t isaac_render_shell_a18e90_triple3_val2(void) {
  return ISAAC_RENDER_SHELL_A18E90_TRIPLE3_VAL2;
}

extern "C" uint32_t isaac_render_shell_a18e90_vt_slot_78(void) {
  return ISAAC_RENDER_SHELL_A18E90_VT_SLOT_78;
}

extern "C" uint32_t isaac_render_shell_a18e90_vt_slot_18(void) {
  return ISAAC_RENDER_SHELL_A18E90_VT_SLOT_18;
}

extern "C" uint32_t isaac_render_shell_a18e90_vt_slot_58(void) {
  return ISAAC_RENDER_SHELL_A18E90_VT_SLOT_58;
}

extern "C" uint32_t isaac_render_shell_a18e90_vt18_arg0(void) {
  return ISAAC_RENDER_SHELL_A18E90_VT18_ARG0;
}

extern "C" uint32_t isaac_render_shell_a18e90_vt18_arg1(void) {
  return ISAAC_RENDER_SHELL_A18E90_VT18_ARG1;
}

extern "C" uint32_t isaac_render_shell_a18e90_alloc_size(void) {
  return ISAAC_RENDER_SHELL_A18E90_ALLOC_SIZE;
}

extern "C" uint32_t isaac_render_shell_a18e90_ctor_va(void) {
  return ISAAC_RENDER_SHELL_A18E90_CTOR_VA;
}

extern "C" uint32_t isaac_render_shell_a18e90_color_arg_bits(void) {
  return ISAAC_RENDER_SHELL_A18E90_COLOR_ARG_BITS;
}

extern "C" uint32_t isaac_render_shell_a18e90_color_ctor_va(void) {
  return ISAAC_RENDER_SHELL_A18E90_COLOR_CTOR_VA;
}

extern "C" uint32_t isaac_render_shell_a18e90_obj_global_va(void) {
  return ISAAC_RENDER_SHELL_A18E90_OBJ_GLOBAL_VA;
}

extern "C" uint32_t isaac_render_shell_a18e90_obj_flag_off(void) {
  return ISAAC_RENDER_SHELL_A18E90_OBJ_FLAG_OFF;
}

extern "C" uint32_t isaac_render_shell_a18e90_obj_flag_val(void) {
  return ISAAC_RENDER_SHELL_A18E90_OBJ_FLAG_VAL;
}

extern "C" uint32_t isaac_render_shell_a18e90_flag_379b4_va(void) {
  return ISAAC_RENDER_SHELL_A18E90_FLAG_379B4_VA;
}

extern "C" uint32_t isaac_render_shell_a18e90_flag_37984_va(void) {
  return ISAAC_RENDER_SHELL_A18E90_FLAG_37984_VA;
}

extern "C" uint32_t isaac_render_shell_a18e90_flag_val(void) {
  return ISAAC_RENDER_SHELL_A18E90_FLAG_VAL;
}

extern "C" uint32_t isaac_render_shell_a18e90_hook_va_0(void) {
  return ISAAC_RENDER_SHELL_A18E90_HOOK_VA_0;
}

extern "C" uint32_t isaac_render_shell_a18e90_hook_va_1(void) {
  return ISAAC_RENDER_SHELL_A18E90_HOOK_VA_1;
}

extern "C" uint32_t isaac_render_shell_a18e90_tail_hook_target_va(void) {
  return ISAAC_RENDER_SHELL_A18E90_TAIL_HOOK_TARGET_VA;
}

extern "C" uint32_t isaac_render_shell_a18e90_vt58_float0_bits(void) {
  return ISAAC_RENDER_SHELL_A18E90_VT58_FLOAT0_BITS;
}

extern "C" uint32_t isaac_render_shell_a18e90_vt58_float1_bits(void) {
  return ISAAC_RENDER_SHELL_A18E90_VT58_FLOAT1_BITS;
}


/* ============================================================================
 * ABI v59: 0xa172e0 registry loader (section-notes/render-shell-v59/NOTES.md
 * + cpu-dump/00a172e0.txt). Byte-gate discipline: byte reads mask & 0xffu;
 * the [edi+0x234] gate is a WORD gate (mask & 0xffffu); NO uint8_t.
 * ========================================================================== */

static_assert((uint32_t)ISAAC_RENDER_SHELL_A172E0_HOST_VA == 0x00a172e0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A172E0_END_VA == 0x00a17621u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A172E0_NEXT_VA == 0x00a17630u,
              "v59 a172e0 span (cpu-dump 00a172e0.txt + NOTES)");

extern "C" uint32_t isaac_render_shell_a172e0_empty_gate(uint32_t p, uint32_t b0) {
  /* 0xa17308 test eax,eax; 0xa1730d je 0xa17318 -- arg0 null;
     0xa1730f cmp byte ptr [eax],0; 0xa17312 je 0xa17318 -- BYTE
     gate on the first byte; je-taken sets cl=1 (empty -> default
     string 0xb7ded4 used). */
  return (p == 0u) || ((b0 & 0xffu) == 0u) ? 1u : 0u;
}

extern "C" uint32_t isaac_render_shell_a172e0_str_select(uint32_t e) {
  /* 0xa17320 test cl,cl; 0xa17327 cmove esi,eax -- e==0 keeps
     arg0 (law returns 0 sentinel), e!=0 selects the default
     string 0xb7ded4. BYTE gate on cl (the empty-gate result). */
  return (e & 0xffu) == 0u ? 0u : static_cast<uint32_t>(ISAAC_RENDER_SHELL_A172E0_DEFAULT_STR_VA);
}

extern "C" uint32_t isaac_render_shell_a172e0_byte_nonzero(uint32_t b) {
  /* 0xa17333/0xa17343 mov al,[ecx]; test al,al; jne loop -- the
     strlen scan continue condition. BYTE gate on AL. */
  return (b & 0xffu) != 0u ? 1u : 0u;
}

extern "C" uint32_t isaac_render_shell_a172e0_len_zero_gate(uint32_t len) {
  /* 0xa1733c sub ecx,edx; 0xa1733c je 0xa17358 -- FULL dword
     strlen result == 0 skips the IAT register call. */
  return len == 0u ? 1u : 0u;
}

extern "C" uint32_t isaac_render_shell_a172e0_field468_gate(uint32_t v) {
  /* 0xa17386 cmp dword ptr [esi+0x468],0; 0xa1738d je 0xa173a1 --
     FULL dword state gate; zero takes the simple path. */
  return v == 0u ? 1u : 0u;
}

extern "C" uint32_t isaac_render_shell_a172e0_field46c_gate(uint32_t v) {
  /* 0xa173a7 cmp eax,-1; 0xa173aa je 0xa175a8 and the re-check at
     0xa175be/0xa175c1 -- FULL dword; 0xffffffff skips release. */
  return v == 0xffffffffu ? 1u : 0u;
}

extern "C" uint32_t isaac_render_shell_a172e0_null_gate(uint32_t p) {
  /* 0xa173c5 test edi,edi; je 0xa175a8 and 0xa175b4 test esi,esi;
     je 0xa175f3 -- FULL dword null gates (both uses). */
  return p == 0u ? 1u : 0u;
}

extern "C" uint32_t isaac_render_shell_a172e0_call1_gate(uint32_t v) {
  /* 0xa173ba test eax,eax; 0xa173bc je 0xa17592 -- FULL dword
     cb1 ([0xb1825c]) result gate; zero -> cleanup path. */
  return v == 0u ? 1u : 0u;
}

extern "C" uint32_t isaac_render_shell_a172e0_call2_gate(uint32_t v) {
  /* 0xa173e8/0xa17412 test eax,eax; je 0xa17431 -- FULL dword
     cb2 ([0xb187b0]) result gates (both uses). */
  return v == 0u ? 1u : 0u;
}

extern "C" uint32_t isaac_render_shell_a172e0_word_zero_gate(uint32_t w) {
  /* 0xa173ec cmp word ptr [edi+0x234],0; 0xa173fa je 0xa17416 --
     WORD gate (16-bit compare on the alt-buffer). */
  return (w & 0xffffu) == 0u ? 1u : 0u;
}

extern "C" uint32_t isaac_render_shell_a172e0_bit40_gate(uint32_t b) {
  /* 0xa1743a test al,0x40; 0xa1743c je 0xa1744c -- BYTE gate on
     the entry first byte; bit 0x40 selects attr 0x2000. */
  return ((b & 0xffu) & 0x40u) != 0u ? 1u : 0u;
}

extern "C" uint32_t isaac_render_shell_a172e0_bit10_gate(uint32_t b) {
  /* 0xa1744c test al,0x10; 0xa1744e je 0xa1745e -- BYTE gate on
     the entry first byte; bit 0x10 selects attr 0x4000. */
  return ((b & 0xffu) & 0x10u) != 0u ? 1u : 0u;
}

extern "C" uint32_t isaac_render_shell_a172e0_attr_sel(uint32_t b) {
  /* 0xa1743e/0xa17450/0xa1745e -- bit40 ? 0x2000 : (bit10 ?
     0x4000 : 0x8000); BYTE gates on the first byte. */
  const uint32_t x = b & 0xffu;
  return (x & 0x40u) != 0u ? static_cast<uint32_t>(ISAAC_RENDER_SHELL_A172E0_ATTR_2000)
       : (x & 0x10u) != 0u ? static_cast<uint32_t>(ISAAC_RENDER_SHELL_A172E0_ATTR_4000)
                           : static_cast<uint32_t>(ISAAC_RENDER_SHELL_A172E0_ATTR_8000);
}

extern "C" uint32_t isaac_render_shell_a172e0_cmp_byte(uint32_t a, uint32_t b) {
  /* 0xa174a0 sbb eax,eax; 0xa174a2 or eax,1 -- after byte cmp +
     jne: equal -> xor eax,eax (0); a<b (CF=1) -> 0xffffffff;
     a>b -> 1. BYTE compares on the low bytes. */
  const uint32_t x = a & 0xffu;
  const uint32_t y = b & 0xffu;
  if (x == y) {
    return 0u;
  }
  return x < y ? 0xffffffffu : 1u;
}

extern "C" uint32_t isaac_render_shell_a172e0_cmp_skip_gate(uint32_t res) {
  /* 0xa174ab/0xa174eb test eax,eax; je 0xa17380 -- FULL dword;
     equality loops back to the next entry (both cmpstr loops). */
  return res == 0u ? 1u : 0u;
}

extern "C" uint32_t isaac_render_shell_a172e0_attr_byte(uint32_t flag) {
  /* 0xa17506 cmp edi,0x4000; 0xa1750c sete cl; 0xa1750f add cl,5
     -- FULL dword compare; cl = 5 + (flag==0x4000) -> 5 or 6. */
  return flag == static_cast<uint32_t>(ISAAC_RENDER_SHELL_A172E0_ATTR_4000) ? 6u : 5u;
}

extern "C" uint32_t isaac_render_shell_a172e0_release_gate(uint32_t cl) {
  /* 0xa17547 test cl,4; 0xa17554 jne 0xa17380 -- BYTE gate on the
     attr byte; cl in {5,6} so (cl&4)!=0 always -> the 0xa1755a
     release path is DEAD in practice (encoded faithfully). */
  return ((cl & 0xffu) & 4u) != 0u ? 1u : 0u;
}

extern "C" uint32_t isaac_render_shell_a172e0_append_full_gate(uint32_t pos, uint32_t cap) {
  /* 0xa17522 cmp edx,[edi+8]; 0xa17525 je 0xa17532 -- FULL dword
     vector end vs cap; equal -> grow via 0xa17630. */
  return pos == cap ? 1u : 0u;
}

extern "C" uint32_t isaac_render_shell_a172e0_release2_gate(uint32_t v) {
  /* 0xa1755a test eax,eax; 0xa1755c je 0xa17380 -- FULL dword;
     zero skips the 0xa648b0 release (dead path per release_gate). */
  return v == 0u ? 1u : 0u;
}

extern "C" uint32_t isaac_render_shell_a172e0_field470_gate(uint32_t v) {
  /* 0xa175da test eax,eax; 0xa175dc je 0xa175ee -- FULL dword
     state gate; zero skips the cb3 release of the +0x470 field. */
  return v == 0u ? 1u : 0u;
}

extern "C" uint32_t isaac_render_shell_a172e0_host_va(void) {
  return ISAAC_RENDER_SHELL_A172E0_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a172e0_end_va(void) {
  return ISAAC_RENDER_SHELL_A172E0_END_VA;
}

extern "C" uint32_t isaac_render_shell_a172e0_next_va(void) {
  return ISAAC_RENDER_SHELL_A172E0_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a172e0_caller_count(void) {
  return ISAAC_RENDER_SHELL_A172E0_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_a172e0_caller_last_va(void) {
  return ISAAC_RENDER_SHELL_A172E0_CALLER_LAST_VA;
}

extern "C" uint32_t isaac_render_shell_a172e0_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A172E0_ADDR_TAKEN_COUNT;
}

extern "C" uint32_t isaac_render_shell_a172e0_addr_taken_table_va(void) {
  return ISAAC_RENDER_SHELL_A172E0_ADDR_TAKEN_TABLE_VA;
}

extern "C" uint32_t isaac_render_shell_a172e0_eax_writes(void) {
  return ISAAC_RENDER_SHELL_A172E0_EAX_WRITES;
}

extern "C" uint32_t isaac_render_shell_a172e0_stack_args(void) {
  return ISAAC_RENDER_SHELL_A172E0_STACK_ARGS;
}

extern "C" uint32_t isaac_render_shell_a172e0_this_call(void) {
  return ISAAC_RENDER_SHELL_A172E0_THIS_CALL;
}

extern "C" uint32_t isaac_render_shell_a172e0_seh_reg_va(void) {
  return ISAAC_RENDER_SHELL_A172E0_SEH_REG_VA;
}

extern "C" uint32_t isaac_render_shell_a172e0_gs_cookie_va(void) {
  return ISAAC_RENDER_SHELL_A172E0_GS_COOKIE_VA;
}

extern "C" uint32_t isaac_render_shell_a172e0_global_str_va(void) {
  return ISAAC_RENDER_SHELL_A172E0_GLOBAL_STR_VA;
}

extern "C" uint32_t isaac_render_shell_a172e0_default_str_va(void) {
  return ISAAC_RENDER_SHELL_A172E0_DEFAULT_STR_VA;
}

extern "C" uint32_t isaac_render_shell_a172e0_cmp_iat_va(void) {
  return ISAAC_RENDER_SHELL_A172E0_CMP_IAT_VA;
}

extern "C" uint32_t isaac_render_shell_a172e0_load_fn_va(void) {
  return ISAAC_RENDER_SHELL_A172E0_LOAD_FN_VA;
}

extern "C" uint32_t isaac_render_shell_a172e0_cb1_va(void) {
  return ISAAC_RENDER_SHELL_A172E0_CB1_VA;
}

extern "C" uint32_t isaac_render_shell_a172e0_cb2_va(void) {
  return ISAAC_RENDER_SHELL_A172E0_CB2_VA;
}

extern "C" uint32_t isaac_render_shell_a172e0_entry_off(void) {
  return ISAAC_RENDER_SHELL_A172E0_ENTRY_OFF;
}

extern "C" uint32_t isaac_render_shell_a172e0_state_468_off(void) {
  return ISAAC_RENDER_SHELL_A172E0_STATE_468_OFF;
}

extern "C" uint32_t isaac_render_shell_a172e0_state_46c_off(void) {
  return ISAAC_RENDER_SHELL_A172E0_STATE_46C_OFF;
}

extern "C" uint32_t isaac_render_shell_a172e0_state_470_off(void) {
  return ISAAC_RENDER_SHELL_A172E0_STATE_470_OFF;
}

extern "C" uint32_t isaac_render_shell_a172e0_sub_218_off(void) {
  return ISAAC_RENDER_SHELL_A172E0_SUB_218_OFF;
}

extern "C" uint32_t isaac_render_shell_a172e0_sub_2c_off(void) {
  return ISAAC_RENDER_SHELL_A172E0_SUB_2C_OFF;
}

extern "C" uint32_t isaac_render_shell_a172e0_sub_234_off(void) {
  return ISAAC_RENDER_SHELL_A172E0_SUB_234_OFF;
}

extern "C" uint32_t isaac_render_shell_a172e0_copy_size(void) {
  return ISAAC_RENDER_SHELL_A172E0_COPY_SIZE;
}

extern "C" uint32_t isaac_render_shell_a172e0_q_byte_val(void) {
  return ISAAC_RENDER_SHELL_A172E0_Q_BYTE_VAL;
}

extern "C" uint32_t isaac_render_shell_a172e0_char_off(void) {
  return ISAAC_RENDER_SHELL_A172E0_CHAR_OFF;
}

extern "C" uint32_t isaac_render_shell_a172e0_char_zero(void) {
  return ISAAC_RENDER_SHELL_A172E0_CHAR_ZERO;
}

extern "C" uint32_t isaac_render_shell_a172e0_out8_val(void) {
  return ISAAC_RENDER_SHELL_A172E0_OUT8_VAL;
}

extern "C" uint32_t isaac_render_shell_a172e0_out12_val(void) {
  return ISAAC_RENDER_SHELL_A172E0_OUT12_VAL;
}

extern "C" uint32_t isaac_render_shell_a172e0_out0_zero(void) {
  return ISAAC_RENDER_SHELL_A172E0_OUT0_ZERO;
}

extern "C" uint32_t isaac_render_shell_a172e0_out4_word(void) {
  return ISAAC_RENDER_SHELL_A172E0_OUT4_WORD;
}

extern "C" uint32_t isaac_render_shell_a172e0_attr_2000(void) {
  return ISAAC_RENDER_SHELL_A172E0_ATTR_2000;
}

extern "C" uint32_t isaac_render_shell_a172e0_attr_4000(void) {
  return ISAAC_RENDER_SHELL_A172E0_ATTR_4000;
}

extern "C" uint32_t isaac_render_shell_a172e0_attr_8000(void) {
  return ISAAC_RENDER_SHELL_A172E0_ATTR_8000;
}

extern "C" uint32_t isaac_render_shell_a172e0_cmpstr0_va(void) {
  return ISAAC_RENDER_SHELL_A172E0_CMPSTR0_VA;
}

extern "C" uint32_t isaac_render_shell_a172e0_cmpstr1_va(void) {
  return ISAAC_RENDER_SHELL_A172E0_CMPSTR1_VA;
}

extern "C" uint32_t isaac_render_shell_a172e0_hash_fn_va(void) {
  return ISAAC_RENDER_SHELL_A172E0_HASH_FN_VA;
}

extern "C" uint32_t isaac_render_shell_a172e0_grow_fn_va(void) {
  return ISAAC_RENDER_SHELL_A172E0_GROW_FN_VA;
}

extern "C" uint32_t isaac_render_shell_a172e0_release_fn_va(void) {
  return ISAAC_RENDER_SHELL_A172E0_RELEASE_FN_VA;
}

extern "C" uint32_t isaac_render_shell_a172e0_release_iat_va(void) {
  return ISAAC_RENDER_SHELL_A172E0_RELEASE_IAT_VA;
}

extern "C" uint32_t isaac_render_shell_a172e0_cb3_va(void) {
  return ISAAC_RENDER_SHELL_A172E0_CB3_VA;
}

extern "C" uint32_t isaac_render_shell_a172e0_err_iat_va(void) {
  return ISAAC_RENDER_SHELL_A172E0_ERR_IAT_VA;
}

extern "C" uint32_t isaac_render_shell_a172e0_err_code(void) {
  return ISAAC_RENDER_SHELL_A172E0_ERR_CODE;
}

extern "C" uint32_t isaac_render_shell_a172e0_rec_size(void) {
  return ISAAC_RENDER_SHELL_A172E0_REC_SIZE;
}

extern "C" uint32_t isaac_render_shell_a172e0_neg1(void) {
  return ISAAC_RENDER_SHELL_A172E0_NEG1;
}

extern "C" uint32_t isaac_render_shell_a172e0_table_va(void) {
  return ISAAC_RENDER_SHELL_A172E0_ADDR_TAKEN_TABLE_VA;
}

/* ============================================================================
 * ABI v60: 0xa17860 registry release probe (section-notes/
 * render-shell-v60-chain/NOTES.md + cpu-dump/00a17860.txt). SINGLE
 * FULL-dword gate (test eax,eax) — no byte gates in this body; NO
 * uint8_t. SEH reg 0xaf0a10 / GS cookie 0xbf93b4 are evidence pins
 * only (the frame stays platform, a172e0 precedent).
 * ========================================================================== */

static_assert((uint32_t)ISAAC_RENDER_SHELL_A17860_HOST_VA == 0x00a17860u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A17860_END_VA == 0x00a178c1u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A17860_NEXT_VA == 0x00a178d0u,
              "v60 a17860 span (cpu-dump 00a17860.txt + NOTES)");

extern "C" uint32_t isaac_render_shell_a17860_found_gate(uint32_t v) {
  /* 0xa17890 test eax,eax; 0xa17892 setne bl and 0xa17895/0xa17897
     test eax,eax; je 0xa178b0 -- FULL dword gate on the 0xa17180
     find result; nonzero -> found (return AL = 1), zero skips the
     0xa648b0 release and returns 0. Both test sites read the same
     value (no writes between 0xa17890 and 0xa17895). */
  return v != 0u ? 1u : 0u;
}

extern "C" uint32_t isaac_render_shell_a17860_host_va(void) {
  return ISAAC_RENDER_SHELL_A17860_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a17860_end_va(void) {
  return ISAAC_RENDER_SHELL_A17860_END_VA;
}

extern "C" uint32_t isaac_render_shell_a17860_next_va(void) {
  return ISAAC_RENDER_SHELL_A17860_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a17860_caller_count(void) {
  return ISAAC_RENDER_SHELL_A17860_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_a17860_caller_first_va(void) {
  return ISAAC_RENDER_SHELL_A17860_CALLER_FIRST_VA;
}

extern "C" uint32_t isaac_render_shell_a17860_caller_last_va(void) {
  return ISAAC_RENDER_SHELL_A17860_CALLER_LAST_VA;
}

extern "C" uint32_t isaac_render_shell_a17860_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A17860_ADDR_TAKEN_COUNT;
}

extern "C" uint32_t isaac_render_shell_a17860_eax_writes(void) {
  return ISAAC_RENDER_SHELL_A17860_EAX_WRITES;
}

extern "C" uint32_t isaac_render_shell_a17860_stack_args(void) {
  return ISAAC_RENDER_SHELL_A17860_STACK_ARGS;
}

extern "C" uint32_t isaac_render_shell_a17860_this_call(void) {
  return ISAAC_RENDER_SHELL_A17860_THIS_CALL;
}

extern "C" uint32_t isaac_render_shell_a17860_seh_reg_va(void) {
  return ISAAC_RENDER_SHELL_A17860_SEH_REG_VA;
}

extern "C" uint32_t isaac_render_shell_a17860_gs_cookie_va(void) {
  return ISAAC_RENDER_SHELL_A17860_GS_COOKIE_VA;
}

extern "C" uint32_t isaac_render_shell_a17860_registry_va(void) {
  return ISAAC_RENDER_SHELL_A17860_REGISTRY_VA;
}

extern "C" uint32_t isaac_render_shell_a17860_find_fn_va(void) {
  return ISAAC_RENDER_SHELL_A17860_FIND_FN_VA;
}

extern "C" uint32_t isaac_render_shell_a17860_release_fn_va(void) {
  return ISAAC_RENDER_SHELL_A17860_RELEASE_FN_VA;
}

extern "C" uint32_t isaac_render_shell_a17860_release_cl_val(void) {
  return ISAAC_RENDER_SHELL_A17860_RELEASE_CL_VAL;
}

extern "C" uint32_t isaac_render_shell_a17860_release_arg0(void) {
  return ISAAC_RENDER_SHELL_A17860_RELEASE_ARG0;
}

extern "C" uint32_t isaac_render_shell_a17860_release_arg1(void) {
  return ISAAC_RENDER_SHELL_A17860_RELEASE_ARG1;
}

/* ============================================================================
 * ABI v61: COLORMOD BAND (0x407140..0x4074b0, region-A carry-over).
 *   15 OPEN bodies from the wave-23 band-3 census (lea-corrected
 *   caller counts; update-v98-anm2-gapscan3 + update-v96-anm2-gapscan-
 *   detail): 0x407170 ColorMod identity init (256c, 4x 1.0f tint +
 *   7x 0.0f), 0x4071f0 guarded 0x2c copy (175c, self-alias je + return-
 *   this), getters 0x4073c0 (60c) / 0x4073b0 (38c, faithful EAX incl.
 *   pointer high bits) / 0x4074b0 (34c), and 10 smaller pure helpers
 *   (0x407380 SSO select, 0x407140 floor wrapper, 0x4073a0 null bool,
 *   0x407470/0x4074a0/0x407370/0x407220/0x4072a0/0x407320/0x407440).
 *   PURE leaves except 0x407140 (composes the v26 af0917_floor leaf),
 *   0x407320 (host 0x40cf50 string copy ctor) and 0x407440 (fn-ptr
 *   dispatch call ebx -> body HOST, pure count gate + step land).
 *   Byte-gate discipline: uint32_t args masked & 0xff; NO uint8_t.
 *   ABI 60 landed by W24-F5 (A17860); this band is 60 -> 61.
 *   PE evidence: section-notes/render-shell-v60-colormod/NOTES.md +
 *   cpu-dump 00407140..004074c0.txt + census-colormod.py
 * ========================================================================== */

static_assert((uint32_t)ISAAC_RENDER_SHELL_A407170_HOST_VA == 0x00407170u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A407170_END_VA == 0x004071bfu &&
                  (uint32_t)ISAAC_RENDER_SHELL_A407170_NEXT_VA == 0x004071c0u &&
                  ISAAC_RENDER_SHELL_A407170_CALLER_COUNT == 0x100u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A407170_CALLER_FIRST_VA ==
                      0x0040fc6eu &&
                  (uint32_t)ISAAC_RENDER_SHELL_A407170_CALLER_LAST_VA ==
                      0x009fdacau,
              "v61 407170 span + 256-caller census (lea-corrected)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A4071F0_HOST_VA == 0x004071f0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A4071F0_END_VA == 0x0040721eu &&
                  (uint32_t)ISAAC_RENDER_SHELL_A4071F0_NEXT_VA == 0x00407220u &&
                  ISAAC_RENDER_SHELL_A4071F0_CALLER_COUNT == 0xafu &&
                  (uint32_t)ISAAC_RENDER_SHELL_A4071F0_CALLER_FIRST_VA ==
                      0x00411f60u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A4071F0_CALLER_LAST_VA ==
                      0x009f40b2u,
              "v61 4071f0 span + 175-caller census");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A407220_HOST_VA == 0x00407220u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A407220_END_VA == 0x00407237u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A407220_NEXT_VA == 0x00407240u &&
                  ISAAC_RENDER_SHELL_A407220_CALLER_COUNT == 0x2u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A407220_CALLER_FIRST_VA ==
                      0x0081d1c0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A407220_CALLER_LAST_VA ==
                      0x0081deb5u,
              "v61 407220 span + 2-caller census");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A4072A0_HOST_VA == 0x004072a0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A4072A0_END_VA == 0x004072a6u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A4072A0_NEXT_VA == 0x004072b0u &&
                  ISAAC_RENDER_SHELL_A4072A0_CALLER_COUNT == 0x1u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A4072A0_CALLER_FIRST_VA ==
                      0x005ffb12u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A4072A0_CALLER_LAST_VA ==
                      0x005ffb12u,
              "v61 4072a0 span + 1-caller census");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A407140_HOST_VA == 0x00407140u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A407140_END_VA == 0x0040716eu &&
                  (uint32_t)ISAAC_RENDER_SHELL_A407140_NEXT_VA == 0x00407170u &&
                  ISAAC_RENDER_SHELL_A407140_CALLER_COUNT == 0x8u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A407140_CALLER_FIRST_VA ==
                      0x005e27a8u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A407140_CALLER_LAST_VA ==
                      0x006c7964u,
              "v61 407140 span + 8-caller census");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A407320_HOST_VA == 0x00407320u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A407320_END_VA == 0x00407364u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A407320_NEXT_VA == 0x00407370u &&
                  ISAAC_RENDER_SHELL_A407320_CALLER_COUNT == 0x3u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A407320_CALLER_FIRST_VA ==
                      0x006c52e5u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A407320_CALLER_LAST_VA ==
                      0x0080b629u,
              "v61 407320 span (incl. SSO twin 0x40733c) + 3-caller census");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A407370_HOST_VA == 0x00407370u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A407370_END_VA == 0x00407376u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A407370_NEXT_VA == 0x00407380u &&
                  ISAAC_RENDER_SHELL_A407370_CALLER_COUNT == 0x2u,
              "v61 407370 span + 2-caller census");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A407380_HOST_VA == 0x00407380u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A407380_END_VA == 0x00407396u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A407380_NEXT_VA == 0x004073a0u &&
                  ISAAC_RENDER_SHELL_A407380_CALLER_COUNT == 0xdu &&
                  (uint32_t)ISAAC_RENDER_SHELL_A407380_EMPTY_LITERAL_VA ==
                      0x00b1a4ecu,
              "v61 407380 span + 13-caller census + empty literal");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A4073A0_HOST_VA == 0x004073a0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A4073A0_END_VA == 0x004073a8u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A4073A0_NEXT_VA == 0x004073b0u &&
                  ISAAC_RENDER_SHELL_A4073A0_CALLER_COUNT == 0x7u,
              "v61 4073a0 span + 7-caller census");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A4073B0_HOST_VA == 0x004073b0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A4073B0_END_VA == 0x004073beu &&
                  (uint32_t)ISAAC_RENDER_SHELL_A4073B0_NEXT_VA == 0x004073c0u &&
                  ISAAC_RENDER_SHELL_A4073B0_CALLER_COUNT == 0x26u &&
                  ISAAC_RENDER_SHELL_A4073B0_HIGH_MASK == 0xffffff00u,
              "v61 4073b0 span + 38-caller census + high-bit mask");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A4073C0_HOST_VA == 0x004073c0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A4073C0_END_VA == 0x004073c4u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A4073C0_NEXT_VA == 0x004073d0u &&
                  ISAAC_RENDER_SHELL_A4073C0_CALLER_COUNT == 0x3cu &&
                  (uint32_t)ISAAC_RENDER_SHELL_A4073C0_ADDR_TAKEN_TABLE_VA ==
                      0x0086b71bu,
              "v61 4073c0 span + 60-caller census + 3 Lua glue dwords");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A407440_HOST_VA == 0x00407440u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A407440_END_VA == 0x00407466u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A407440_NEXT_VA == 0x00407470u &&
                  ISAAC_RENDER_SHELL_A407440_CALLER_COUNT == 0x1u &&
                  ISAAC_RENDER_SHELL_A407440_STACK_ARGS == 0x4u,
              "v61 407440 fn-ptr loop host (ret 0x10, 1 caller)");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A407470_HOST_VA == 0x00407470u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A407470_END_VA == 0x00407479u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A407470_NEXT_VA == 0x00407480u &&
                  ISAAC_RENDER_SHELL_A407470_CALLER_COUNT == 0x5u,
              "v61 407470 span + 5-caller census");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A4074A0_HOST_VA == 0x004074a0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A4074A0_END_VA == 0x004074a7u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A4074A0_NEXT_VA == 0x004074b0u &&
                  ISAAC_RENDER_SHELL_A4074A0_CALLER_COUNT == 0x3u,
              "v61 4074a0 span + 3-caller census");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A4074B0_HOST_VA == 0x004074b0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A4074B0_END_VA == 0x004074b7u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A4074B0_NEXT_VA == 0x004074c0u &&
                  ISAAC_RENDER_SHELL_A4074B0_CALLER_COUNT == 0x22u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A4074B0_ADDR_TAKEN_TABLE_VA ==
                      0x0086d65bu,
              "v61 4074b0 span + 34-caller census + Lua glue dword");

extern "C" float* isaac_render_shell_a407170_init(float* dest) {
  /* VA 0x00407170..0x004071be: ColorMod identity. 0x407170/78/7f/86
     store 1.0f (0x3f800000) at [0x00..0x0c]; 0x40718d..0x4071b7
     store 0.0f at [0x10..0x28]; 0x407176 `mov eax,ecx` returns dest
     (thiscall, ret 0). Matches the v21 COLOR_* layout (11 floats,
     4 tint channels). */
  if (dest == nullptr) {
    return nullptr;
  }
  dest[0] = 1.0f;
  dest[1] = 1.0f;
  dest[2] = 1.0f;
  dest[3] = 1.0f;
  dest[4] = 0.0f;
  dest[5] = 0.0f;
  dest[6] = 0.0f;
  dest[7] = 0.0f;
  dest[8] = 0.0f;
  dest[9] = 0.0f;
  dest[10] = 0.0f;
  return dest;
}

extern "C" uint32_t isaac_render_shell_a407170_tint_bits(void) {
  return ISAAC_RENDER_SHELL_A407170_TINT_BITS;
}

extern "C" uint32_t isaac_render_shell_a4071f0_self_alias_gate(
    uint32_t dst, uint32_t src) {
  /* VA 0x004071f6/0x004071f8: cmp ecx,eax / je 0x407218 -- self-alias
     guard; equal -> skip the 0x2c copy. */
  return dst == src ? 1u : 0u;
}

extern "C" float* isaac_render_shell_a4071f0_copy(float* dest,
                                                  const float* src) {
  /* VA 0x004071fa..0x00407215: movups x2 + movq + mov dword = the
     44-byte (0x2c) ColorMod copy, gated by the self-alias compare;
     0x407218 mov eax,ecx returns dest; ret 4 (1 stack arg src). */
  if (dest == nullptr || src == nullptr) {
    return nullptr;
  }
  if (dest == src) {
    return dest; /* je 0x407218 -- no copy on self-alias */
  }
  dest[0] = src[0];
  dest[1] = src[1];
  dest[2] = src[2];
  dest[3] = src[3];
  dest[4] = src[4];
  dest[5] = src[5];
  dest[6] = src[6];
  dest[7] = src[7];
  dest[8] = src[8];
  dest[9] = src[9];
  dest[10] = src[10];
  return dest;
}

extern "C" void isaac_render_shell_a407220_copy16_zero10(float* dest,
                                                         const float* src) {
  /* VA 0x00407226..0x00407230: movups xmm0,[ecx] reads 16B of this;
     PE order 0x407229 FIRST zeroes [dst+0x10] (mov dword), then
     0x407230 stores the 16B (movups [eax],xmm0). ret 4. */
  if (dest == nullptr || src == nullptr) {
    return;
  }
  dest[4] = 0.0f; /* [dst+0x10] -- PE stores zero BEFORE the copy */
  dest[0] = src[0];
  dest[1] = src[1];
  dest[2] = src[2];
  dest[3] = src[3];
}

extern "C" uint32_t isaac_render_shell_a407220_zero_off(void) {
  return ISAAC_RENDER_SHELL_A407220_ZERO_OFF;
}

extern "C" void isaac_render_shell_a4072a0_store1c(float* dest, float v) {
  /* VA 0x004072a0: movss dword ptr [ecx+0x1c],xmm1; ret. */
  if (dest == nullptr) {
    return;
  }
  dest[7] = v;
}

extern "C" uint32_t isaac_render_shell_a4072a0_field1c_off(void) {
  return ISAAC_RENDER_SHELL_A4072A0_FIELD_OFF;
}

extern "C" float isaac_render_shell_a407140_floor_f32(float x) {
  /* VA 0x0040714e..0x00407165: fld dword / fstp qword (exact widen),
     call floor (IAT 0xaf0917), fstp dword (narrow -- floor of a
     float32 is representable, so no rounding). Same law as the v26
     isaac_render_shell_af0917_floor leaf; composes it. */
  return isaac_render_shell_af0917_floor(x);
}

extern "C" uint32_t isaac_render_shell_a407320_clear_gate(uint32_t data_ptr) {
  /* VA 0x00407323/0x00407325: mov eax,[ecx]; test eax,eax; je
     0x40733c -- FULL dword gate on the string data pointer. */
  return data_ptr == 0u ? 1u : 0u;
}

extern "C" void isaac_render_shell_a407320_sso_zero(uint32_t dst) {
  /* VA 0x0040733c..0x0040735d (the je twin): mov [eax],0;
     mov [eax+0x10],0; mov [eax+0x14],0xf; byte [eax],0;
     mov [eax+0x10],0; byte [eax],0 -- all six stores in PE order
     (dword + byte mix; the duplicate dword/byte writes are encoded
     faithfully, not folded). */
  map_store_u32(dst + 0x00u, 0u);
  map_store_u32(dst + 0x10u, 0u);
  map_store_u32(dst + 0x14u, ISAAC_RENDER_SHELL_A407320_SSO_CAP);
  map_store_u8(dst + 0x00u, 0u);
  map_store_u32(dst + 0x10u, 0u);
  map_store_u8(dst + 0x00u, 0u);
}

extern "C" uint32_t isaac_render_shell_a407320_sso_cap(void) {
  return ISAAC_RENDER_SHELL_A407320_SSO_CAP;
}

extern "C" uint32_t isaac_render_shell_a407320_copy_host_va(void) {
  return ISAAC_RENDER_SHELL_A407320_COPY_HOST_VA;
}

extern "C" float isaac_render_shell_a407370_float10(uint32_t addr) {
  /* VA 0x00407370: movss xmm0,[ecx+0x10]; ret. */
  return f32_load(addr + ISAAC_RENDER_SHELL_A407370_FIELD_OFF);
}

extern "C" uint32_t isaac_render_shell_a407380_buf_null_gate(uint32_t buf) {
  /* VA 0x00407383/0x00407385: test eax,eax; je 0x407390 -- buf==0
     -> empty literal. */
  return buf == 0u ? 1u : 0u;
}

extern "C" uint32_t isaac_render_shell_a407380_cap_gate(uint32_t cap) {
  /* VA 0x00407387/0x0040738b: cmp dword [eax+0x14],0x10; jb
     0x407395 -- UNSIGNED below; cap<0x10 keeps buf as-is (jb is an
     unsigned compare; 0xffffffff goes the data-load path). */
  return cap < ISAAC_RENDER_SHELL_A407380_CAP_LIM ? 1u : 0u;
}

extern "C" uint32_t isaac_render_shell_a407380_select(uint32_t buf,
                                                      uint32_t cap,
                                                      uint32_t data) {
  /* VA 0x00407385..0x00407395: buf==0 -> empty literal 0xb1a4ec
     (mov eax,imm); else cap<0x10 -> buf (jb skips the load);
     else the data dword [buf]. */
  if (buf == 0u) {
    return ISAAC_RENDER_SHELL_A407380_EMPTY_LITERAL_VA;
  }
  if (cap < ISAAC_RENDER_SHELL_A407380_CAP_LIM) {
    return buf;
  }
  return data;
}

extern "C" uint32_t isaac_render_shell_a407380_empty_literal_va(void) {
  return ISAAC_RENDER_SHELL_A407380_EMPTY_LITERAL_VA;
}

extern "C" uint32_t isaac_render_shell_a4073a0_null4(uint32_t v) {
  /* VA 0x004073a0/0x004073a4: cmp dword [ecx+4],0; sete al; ret --
     FULL dword compare. */
  return v == 0u ? 1u : 0u;
}

extern "C" uint32_t isaac_render_shell_a4073b0_byte34(uint32_t p,
                                                      uint32_t b34) {
  /* VA 0x004073b0..0x004073bd: mov eax,[ecx+4] (p); test eax,eax;
     je 0x4073bb (null twin xor al,al); mov al,[eax+0x34] -- AL is the
     byte at p+0x34 (or 0 on null) while EAX keeps the pointer's upper
     24 bits on BOTH paths; the full EAX is
     (p & 0xffffff00) | (null ? 0 : (b34 & 0xff)). */
  const uint32_t high = p & ISAAC_RENDER_SHELL_A4073B0_HIGH_MASK;
  const uint32_t low = (p == 0u) ? 0u : (b34 & 0xffu);
  return high | low;
}

extern "C" uint32_t isaac_render_shell_a4073b0_high_mask(void) {
  return ISAAC_RENDER_SHELL_A4073B0_HIGH_MASK;
}

extern "C" uint32_t isaac_render_shell_a4073c0_dword4(uint32_t addr) {
  /* VA 0x004073c0: mov eax,[ecx+4]; ret. */
  return map_load_u32(addr + ISAAC_RENDER_SHELL_A4073C0_FIELD_OFF);
}

extern "C" uint32_t isaac_render_shell_a407440_count_gate(uint32_t count) {
  /* VA 0x00407447/0x00407449: test esi,esi; je 0x407461 -- count==0
     skips the dispatch loop. The loop itself calls the register-held
     fn (call ebx) -> platform/HOST body; only the gate + step land. */
  return count == 0u ? 1u : 0u;
}

extern "C" uint32_t isaac_render_shell_a407440_step_add(uint32_t base,
                                                        uint32_t step) {
  /* VA 0x00407457: add edi,[ebp+0xc] -- 32-bit wrap add. */
  return base + step;
}

extern "C" float isaac_render_shell_a407470_float7240(uint32_t addr) {
  /* VA 0x00407470: movss xmm0,[ecx+0x7240]; ret. */
  return f32_load(addr + ISAAC_RENDER_SHELL_A407470_FIELD_OFF);
}

extern "C" uint32_t isaac_render_shell_a4074a0_field_addr(uint32_t addr) {
  /* VA 0x004074a0: lea eax,[ecx+0x67758]; ret -- pure address add,
     no dereference. */
  return addr + ISAAC_RENDER_SHELL_A4074A0_FIELD_OFF;
}

extern "C" uint32_t isaac_render_shell_a4074b0_dword264f8(uint32_t addr) {
  /* VA 0x004074b0: mov eax,[ecx+0x264f8]; ret. */
  return map_load_u32(addr + ISAAC_RENDER_SHELL_A4074B0_FIELD_OFF);
}

extern "C" uint32_t isaac_render_shell_a407170_host_va(void) {
  return ISAAC_RENDER_SHELL_A407170_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a407170_end_va(void) {
  return ISAAC_RENDER_SHELL_A407170_END_VA;
}

extern "C" uint32_t isaac_render_shell_a407170_next_va(void) {
  return ISAAC_RENDER_SHELL_A407170_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a407170_caller_count(void) {
  return ISAAC_RENDER_SHELL_A407170_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_a407170_caller_first_va(void) {
  return ISAAC_RENDER_SHELL_A407170_CALLER_FIRST_VA;
}

extern "C" uint32_t isaac_render_shell_a407170_caller_last_va(void) {
  return ISAAC_RENDER_SHELL_A407170_CALLER_LAST_VA;
}

extern "C" uint32_t isaac_render_shell_a407170_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A407170_ADDR_TAKEN_COUNT;
}

extern "C" uint32_t isaac_render_shell_a407170_eax_writes(void) {
  return ISAAC_RENDER_SHELL_A407170_EAX_WRITES;
}

extern "C" uint32_t isaac_render_shell_a407170_stack_args(void) {
  return ISAAC_RENDER_SHELL_A407170_STACK_ARGS;
}

extern "C" uint32_t isaac_render_shell_a407170_this_call(void) {
  return ISAAC_RENDER_SHELL_A407170_THIS_CALL;
}

extern "C" uint32_t isaac_render_shell_a4071f0_host_va(void) {
  return ISAAC_RENDER_SHELL_A4071F0_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a4071f0_end_va(void) {
  return ISAAC_RENDER_SHELL_A4071F0_END_VA;
}

extern "C" uint32_t isaac_render_shell_a4071f0_next_va(void) {
  return ISAAC_RENDER_SHELL_A4071F0_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a4071f0_caller_count(void) {
  return ISAAC_RENDER_SHELL_A4071F0_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_a4071f0_caller_first_va(void) {
  return ISAAC_RENDER_SHELL_A4071F0_CALLER_FIRST_VA;
}

extern "C" uint32_t isaac_render_shell_a4071f0_caller_last_va(void) {
  return ISAAC_RENDER_SHELL_A4071F0_CALLER_LAST_VA;
}

extern "C" uint32_t isaac_render_shell_a4071f0_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A4071F0_ADDR_TAKEN_COUNT;
}

extern "C" uint32_t isaac_render_shell_a4071f0_eax_writes(void) {
  return ISAAC_RENDER_SHELL_A4071F0_EAX_WRITES;
}

extern "C" uint32_t isaac_render_shell_a4071f0_stack_args(void) {
  return ISAAC_RENDER_SHELL_A4071F0_STACK_ARGS;
}

extern "C" uint32_t isaac_render_shell_a4071f0_this_call(void) {
  return ISAAC_RENDER_SHELL_A4071F0_THIS_CALL;
}

extern "C" uint32_t isaac_render_shell_a407220_host_va(void) {
  return ISAAC_RENDER_SHELL_A407220_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a407220_end_va(void) {
  return ISAAC_RENDER_SHELL_A407220_END_VA;
}

extern "C" uint32_t isaac_render_shell_a407220_next_va(void) {
  return ISAAC_RENDER_SHELL_A407220_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a407220_caller_count(void) {
  return ISAAC_RENDER_SHELL_A407220_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_a407220_caller_first_va(void) {
  return ISAAC_RENDER_SHELL_A407220_CALLER_FIRST_VA;
}

extern "C" uint32_t isaac_render_shell_a407220_caller_last_va(void) {
  return ISAAC_RENDER_SHELL_A407220_CALLER_LAST_VA;
}

extern "C" uint32_t isaac_render_shell_a407220_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A407220_ADDR_TAKEN_COUNT;
}

extern "C" uint32_t isaac_render_shell_a407220_eax_writes(void) {
  return ISAAC_RENDER_SHELL_A407220_EAX_WRITES;
}

extern "C" uint32_t isaac_render_shell_a407220_stack_args(void) {
  return ISAAC_RENDER_SHELL_A407220_STACK_ARGS;
}

extern "C" uint32_t isaac_render_shell_a407220_this_call(void) {
  return ISAAC_RENDER_SHELL_A407220_THIS_CALL;
}

extern "C" uint32_t isaac_render_shell_a4072a0_host_va(void) {
  return ISAAC_RENDER_SHELL_A4072A0_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a4072a0_end_va(void) {
  return ISAAC_RENDER_SHELL_A4072A0_END_VA;
}

extern "C" uint32_t isaac_render_shell_a4072a0_next_va(void) {
  return ISAAC_RENDER_SHELL_A4072A0_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a4072a0_caller_count(void) {
  return ISAAC_RENDER_SHELL_A4072A0_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_a4072a0_caller_first_va(void) {
  return ISAAC_RENDER_SHELL_A4072A0_CALLER_FIRST_VA;
}

extern "C" uint32_t isaac_render_shell_a4072a0_caller_last_va(void) {
  return ISAAC_RENDER_SHELL_A4072A0_CALLER_LAST_VA;
}

extern "C" uint32_t isaac_render_shell_a4072a0_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A4072A0_ADDR_TAKEN_COUNT;
}

extern "C" uint32_t isaac_render_shell_a4072a0_eax_writes(void) {
  return ISAAC_RENDER_SHELL_A4072A0_EAX_WRITES;
}

extern "C" uint32_t isaac_render_shell_a4072a0_stack_args(void) {
  return ISAAC_RENDER_SHELL_A4072A0_STACK_ARGS;
}

extern "C" uint32_t isaac_render_shell_a4072a0_this_call(void) {
  return ISAAC_RENDER_SHELL_A4072A0_THIS_CALL;
}

extern "C" uint32_t isaac_render_shell_a407140_host_va(void) {
  return ISAAC_RENDER_SHELL_A407140_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a407140_end_va(void) {
  return ISAAC_RENDER_SHELL_A407140_END_VA;
}

extern "C" uint32_t isaac_render_shell_a407140_next_va(void) {
  return ISAAC_RENDER_SHELL_A407140_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a407140_caller_count(void) {
  return ISAAC_RENDER_SHELL_A407140_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_a407140_caller_first_va(void) {
  return ISAAC_RENDER_SHELL_A407140_CALLER_FIRST_VA;
}

extern "C" uint32_t isaac_render_shell_a407140_caller_last_va(void) {
  return ISAAC_RENDER_SHELL_A407140_CALLER_LAST_VA;
}

extern "C" uint32_t isaac_render_shell_a407140_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A407140_ADDR_TAKEN_COUNT;
}

extern "C" uint32_t isaac_render_shell_a407140_eax_writes(void) {
  return ISAAC_RENDER_SHELL_A407140_EAX_WRITES;
}

extern "C" uint32_t isaac_render_shell_a407140_stack_args(void) {
  return ISAAC_RENDER_SHELL_A407140_STACK_ARGS;
}

extern "C" uint32_t isaac_render_shell_a407140_this_call(void) {
  return ISAAC_RENDER_SHELL_A407140_THIS_CALL;
}

extern "C" uint32_t isaac_render_shell_a407320_host_va(void) {
  return ISAAC_RENDER_SHELL_A407320_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a407320_end_va(void) {
  return ISAAC_RENDER_SHELL_A407320_END_VA;
}

extern "C" uint32_t isaac_render_shell_a407320_next_va(void) {
  return ISAAC_RENDER_SHELL_A407320_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a407320_caller_count(void) {
  return ISAAC_RENDER_SHELL_A407320_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_a407320_caller_first_va(void) {
  return ISAAC_RENDER_SHELL_A407320_CALLER_FIRST_VA;
}

extern "C" uint32_t isaac_render_shell_a407320_caller_last_va(void) {
  return ISAAC_RENDER_SHELL_A407320_CALLER_LAST_VA;
}

extern "C" uint32_t isaac_render_shell_a407320_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A407320_ADDR_TAKEN_COUNT;
}

extern "C" uint32_t isaac_render_shell_a407320_eax_writes(void) {
  return ISAAC_RENDER_SHELL_A407320_EAX_WRITES;
}

extern "C" uint32_t isaac_render_shell_a407320_stack_args(void) {
  return ISAAC_RENDER_SHELL_A407320_STACK_ARGS;
}

extern "C" uint32_t isaac_render_shell_a407320_this_call(void) {
  return ISAAC_RENDER_SHELL_A407320_THIS_CALL;
}

extern "C" uint32_t isaac_render_shell_a407370_host_va(void) {
  return ISAAC_RENDER_SHELL_A407370_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a407370_end_va(void) {
  return ISAAC_RENDER_SHELL_A407370_END_VA;
}

extern "C" uint32_t isaac_render_shell_a407370_next_va(void) {
  return ISAAC_RENDER_SHELL_A407370_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a407370_caller_count(void) {
  return ISAAC_RENDER_SHELL_A407370_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_a407370_caller_first_va(void) {
  return ISAAC_RENDER_SHELL_A407370_CALLER_FIRST_VA;
}

extern "C" uint32_t isaac_render_shell_a407370_caller_last_va(void) {
  return ISAAC_RENDER_SHELL_A407370_CALLER_LAST_VA;
}

extern "C" uint32_t isaac_render_shell_a407370_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A407370_ADDR_TAKEN_COUNT;
}

extern "C" uint32_t isaac_render_shell_a407370_eax_writes(void) {
  return ISAAC_RENDER_SHELL_A407370_EAX_WRITES;
}

extern "C" uint32_t isaac_render_shell_a407370_stack_args(void) {
  return ISAAC_RENDER_SHELL_A407370_STACK_ARGS;
}

extern "C" uint32_t isaac_render_shell_a407370_this_call(void) {
  return ISAAC_RENDER_SHELL_A407370_THIS_CALL;
}

extern "C" uint32_t isaac_render_shell_a407380_host_va(void) {
  return ISAAC_RENDER_SHELL_A407380_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a407380_end_va(void) {
  return ISAAC_RENDER_SHELL_A407380_END_VA;
}

extern "C" uint32_t isaac_render_shell_a407380_next_va(void) {
  return ISAAC_RENDER_SHELL_A407380_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a407380_caller_count(void) {
  return ISAAC_RENDER_SHELL_A407380_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_a407380_caller_first_va(void) {
  return ISAAC_RENDER_SHELL_A407380_CALLER_FIRST_VA;
}

extern "C" uint32_t isaac_render_shell_a407380_caller_last_va(void) {
  return ISAAC_RENDER_SHELL_A407380_CALLER_LAST_VA;
}

extern "C" uint32_t isaac_render_shell_a407380_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A407380_ADDR_TAKEN_COUNT;
}

extern "C" uint32_t isaac_render_shell_a407380_eax_writes(void) {
  return ISAAC_RENDER_SHELL_A407380_EAX_WRITES;
}

extern "C" uint32_t isaac_render_shell_a407380_stack_args(void) {
  return ISAAC_RENDER_SHELL_A407380_STACK_ARGS;
}

extern "C" uint32_t isaac_render_shell_a407380_this_call(void) {
  return ISAAC_RENDER_SHELL_A407380_THIS_CALL;
}

extern "C" uint32_t isaac_render_shell_a4073a0_host_va(void) {
  return ISAAC_RENDER_SHELL_A4073A0_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a4073a0_end_va(void) {
  return ISAAC_RENDER_SHELL_A4073A0_END_VA;
}

extern "C" uint32_t isaac_render_shell_a4073a0_next_va(void) {
  return ISAAC_RENDER_SHELL_A4073A0_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a4073a0_caller_count(void) {
  return ISAAC_RENDER_SHELL_A4073A0_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_a4073a0_caller_first_va(void) {
  return ISAAC_RENDER_SHELL_A4073A0_CALLER_FIRST_VA;
}

extern "C" uint32_t isaac_render_shell_a4073a0_caller_last_va(void) {
  return ISAAC_RENDER_SHELL_A4073A0_CALLER_LAST_VA;
}

extern "C" uint32_t isaac_render_shell_a4073a0_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A4073A0_ADDR_TAKEN_COUNT;
}

extern "C" uint32_t isaac_render_shell_a4073a0_eax_writes(void) {
  return ISAAC_RENDER_SHELL_A4073A0_EAX_WRITES;
}

extern "C" uint32_t isaac_render_shell_a4073a0_stack_args(void) {
  return ISAAC_RENDER_SHELL_A4073A0_STACK_ARGS;
}

extern "C" uint32_t isaac_render_shell_a4073a0_this_call(void) {
  return ISAAC_RENDER_SHELL_A4073A0_THIS_CALL;
}

extern "C" uint32_t isaac_render_shell_a4073b0_host_va(void) {
  return ISAAC_RENDER_SHELL_A4073B0_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a4073b0_end_va(void) {
  return ISAAC_RENDER_SHELL_A4073B0_END_VA;
}

extern "C" uint32_t isaac_render_shell_a4073b0_next_va(void) {
  return ISAAC_RENDER_SHELL_A4073B0_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a4073b0_caller_count(void) {
  return ISAAC_RENDER_SHELL_A4073B0_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_a4073b0_caller_first_va(void) {
  return ISAAC_RENDER_SHELL_A4073B0_CALLER_FIRST_VA;
}

extern "C" uint32_t isaac_render_shell_a4073b0_caller_last_va(void) {
  return ISAAC_RENDER_SHELL_A4073B0_CALLER_LAST_VA;
}

extern "C" uint32_t isaac_render_shell_a4073b0_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A4073B0_ADDR_TAKEN_COUNT;
}

extern "C" uint32_t isaac_render_shell_a4073b0_eax_writes(void) {
  return ISAAC_RENDER_SHELL_A4073B0_EAX_WRITES;
}

extern "C" uint32_t isaac_render_shell_a4073b0_stack_args(void) {
  return ISAAC_RENDER_SHELL_A4073B0_STACK_ARGS;
}

extern "C" uint32_t isaac_render_shell_a4073b0_this_call(void) {
  return ISAAC_RENDER_SHELL_A4073B0_THIS_CALL;
}

extern "C" uint32_t isaac_render_shell_a4073c0_host_va(void) {
  return ISAAC_RENDER_SHELL_A4073C0_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a4073c0_end_va(void) {
  return ISAAC_RENDER_SHELL_A4073C0_END_VA;
}

extern "C" uint32_t isaac_render_shell_a4073c0_next_va(void) {
  return ISAAC_RENDER_SHELL_A4073C0_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a4073c0_caller_count(void) {
  return ISAAC_RENDER_SHELL_A4073C0_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_a4073c0_caller_first_va(void) {
  return ISAAC_RENDER_SHELL_A4073C0_CALLER_FIRST_VA;
}

extern "C" uint32_t isaac_render_shell_a4073c0_caller_last_va(void) {
  return ISAAC_RENDER_SHELL_A4073C0_CALLER_LAST_VA;
}

extern "C" uint32_t isaac_render_shell_a4073c0_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A4073C0_ADDR_TAKEN_COUNT;
}

extern "C" uint32_t isaac_render_shell_a4073c0_eax_writes(void) {
  return ISAAC_RENDER_SHELL_A4073C0_EAX_WRITES;
}

extern "C" uint32_t isaac_render_shell_a4073c0_stack_args(void) {
  return ISAAC_RENDER_SHELL_A4073C0_STACK_ARGS;
}

extern "C" uint32_t isaac_render_shell_a4073c0_this_call(void) {
  return ISAAC_RENDER_SHELL_A4073C0_THIS_CALL;
}

extern "C" uint32_t isaac_render_shell_a4073c0_addr_taken_table_va(void) {
  return ISAAC_RENDER_SHELL_A4073C0_ADDR_TAKEN_TABLE_VA;
}

extern "C" uint32_t isaac_render_shell_a407440_host_va(void) {
  return ISAAC_RENDER_SHELL_A407440_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a407440_end_va(void) {
  return ISAAC_RENDER_SHELL_A407440_END_VA;
}

extern "C" uint32_t isaac_render_shell_a407440_next_va(void) {
  return ISAAC_RENDER_SHELL_A407440_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a407440_caller_count(void) {
  return ISAAC_RENDER_SHELL_A407440_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_a407440_caller_first_va(void) {
  return ISAAC_RENDER_SHELL_A407440_CALLER_FIRST_VA;
}

extern "C" uint32_t isaac_render_shell_a407440_caller_last_va(void) {
  return ISAAC_RENDER_SHELL_A407440_CALLER_LAST_VA;
}

extern "C" uint32_t isaac_render_shell_a407440_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A407440_ADDR_TAKEN_COUNT;
}

extern "C" uint32_t isaac_render_shell_a407440_eax_writes(void) {
  return ISAAC_RENDER_SHELL_A407440_EAX_WRITES;
}

extern "C" uint32_t isaac_render_shell_a407440_stack_args(void) {
  return ISAAC_RENDER_SHELL_A407440_STACK_ARGS;
}

extern "C" uint32_t isaac_render_shell_a407440_this_call(void) {
  return ISAAC_RENDER_SHELL_A407440_THIS_CALL;
}

extern "C" uint32_t isaac_render_shell_a407470_host_va(void) {
  return ISAAC_RENDER_SHELL_A407470_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a407470_end_va(void) {
  return ISAAC_RENDER_SHELL_A407470_END_VA;
}

extern "C" uint32_t isaac_render_shell_a407470_next_va(void) {
  return ISAAC_RENDER_SHELL_A407470_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a407470_caller_count(void) {
  return ISAAC_RENDER_SHELL_A407470_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_a407470_caller_first_va(void) {
  return ISAAC_RENDER_SHELL_A407470_CALLER_FIRST_VA;
}

extern "C" uint32_t isaac_render_shell_a407470_caller_last_va(void) {
  return ISAAC_RENDER_SHELL_A407470_CALLER_LAST_VA;
}

extern "C" uint32_t isaac_render_shell_a407470_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A407470_ADDR_TAKEN_COUNT;
}

extern "C" uint32_t isaac_render_shell_a407470_eax_writes(void) {
  return ISAAC_RENDER_SHELL_A407470_EAX_WRITES;
}

extern "C" uint32_t isaac_render_shell_a407470_stack_args(void) {
  return ISAAC_RENDER_SHELL_A407470_STACK_ARGS;
}

extern "C" uint32_t isaac_render_shell_a407470_this_call(void) {
  return ISAAC_RENDER_SHELL_A407470_THIS_CALL;
}

extern "C" uint32_t isaac_render_shell_a4074a0_host_va(void) {
  return ISAAC_RENDER_SHELL_A4074A0_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a4074a0_end_va(void) {
  return ISAAC_RENDER_SHELL_A4074A0_END_VA;
}

extern "C" uint32_t isaac_render_shell_a4074a0_next_va(void) {
  return ISAAC_RENDER_SHELL_A4074A0_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a4074a0_caller_count(void) {
  return ISAAC_RENDER_SHELL_A4074A0_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_a4074a0_caller_first_va(void) {
  return ISAAC_RENDER_SHELL_A4074A0_CALLER_FIRST_VA;
}

extern "C" uint32_t isaac_render_shell_a4074a0_caller_last_va(void) {
  return ISAAC_RENDER_SHELL_A4074A0_CALLER_LAST_VA;
}

extern "C" uint32_t isaac_render_shell_a4074a0_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A4074A0_ADDR_TAKEN_COUNT;
}

extern "C" uint32_t isaac_render_shell_a4074a0_eax_writes(void) {
  return ISAAC_RENDER_SHELL_A4074A0_EAX_WRITES;
}

extern "C" uint32_t isaac_render_shell_a4074a0_stack_args(void) {
  return ISAAC_RENDER_SHELL_A4074A0_STACK_ARGS;
}

extern "C" uint32_t isaac_render_shell_a4074a0_this_call(void) {
  return ISAAC_RENDER_SHELL_A4074A0_THIS_CALL;
}

extern "C" uint32_t isaac_render_shell_a4074b0_host_va(void) {
  return ISAAC_RENDER_SHELL_A4074B0_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a4074b0_end_va(void) {
  return ISAAC_RENDER_SHELL_A4074B0_END_VA;
}

extern "C" uint32_t isaac_render_shell_a4074b0_next_va(void) {
  return ISAAC_RENDER_SHELL_A4074B0_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a4074b0_caller_count(void) {
  return ISAAC_RENDER_SHELL_A4074B0_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_a4074b0_caller_first_va(void) {
  return ISAAC_RENDER_SHELL_A4074B0_CALLER_FIRST_VA;
}

extern "C" uint32_t isaac_render_shell_a4074b0_caller_last_va(void) {
  return ISAAC_RENDER_SHELL_A4074B0_CALLER_LAST_VA;
}

extern "C" uint32_t isaac_render_shell_a4074b0_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A4074B0_ADDR_TAKEN_COUNT;
}

extern "C" uint32_t isaac_render_shell_a4074b0_eax_writes(void) {
  return ISAAC_RENDER_SHELL_A4074B0_EAX_WRITES;
}

extern "C" uint32_t isaac_render_shell_a4074b0_stack_args(void) {
  return ISAAC_RENDER_SHELL_A4074B0_STACK_ARGS;
}

extern "C" uint32_t isaac_render_shell_a4074b0_this_call(void) {
  return ISAAC_RENDER_SHELL_A4074B0_THIS_CALL;
}

extern "C" uint32_t isaac_render_shell_a4074b0_addr_taken_table_va(void) {
  return ISAAC_RENDER_SHELL_A4074B0_ADDR_TAKEN_TABLE_VA;
}

/* ================= v62: Color RO/GO/BO fld getter trio ============
   0x4072b0 `fld dword ptr [ecx+0x20]; ret` / 0x4072c0 +0x24 /
   0x4072d0 +0x28 — x87 float getters (3 B each, 0 E8, 0 stores,
   0 indirect; int3 padding separates the bodies). Census (this
   unit, lea-corrected + capstone whole-.text): 5/4/4 E8 callers,
   0 E9 tails, 1 addr-taken each (Lua kColorFields RO/GO/BO dwords
   0x008670de / 0x008670f4 / 0x0086710a; row callsites 0x8670e9 /
   0x8670ff / 0x867115 are CALLERS, not owners — v61 0x4073c0
   precedent). NEXT chain 4072b0 -> 4072c0 -> 4072d0 -> 4072e0 (v21
   HOST blend, untouched). Landed ABI 61 -> 62. */
static_assert((uint32_t)ISAAC_RENDER_SHELL_A4072B0_HOST_VA == 0x004072b0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A4072B0_END_VA == 0x004072b4u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A4072B0_NEXT_VA == 0x004072c0u &&
                  ISAAC_RENDER_SHELL_A4072B0_CALLER_COUNT == 0x5u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A4072B0_ADDR_TAKEN_TABLE_VA ==
                      0x008670deu,
              "v62 4072b0 span + 5-caller census + RO glue dword");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A4072C0_HOST_VA == 0x004072c0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A4072C0_END_VA == 0x004072c4u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A4072C0_NEXT_VA == 0x004072d0u &&
                  ISAAC_RENDER_SHELL_A4072C0_CALLER_COUNT == 0x4u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A4072C0_ADDR_TAKEN_TABLE_VA ==
                      0x008670f4u,
              "v62 4072c0 span + 4-caller census + GO glue dword");
static_assert((uint32_t)ISAAC_RENDER_SHELL_A4072D0_HOST_VA == 0x004072d0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A4072D0_END_VA == 0x004072d4u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A4072D0_NEXT_VA == 0x004072e0u &&
                  ISAAC_RENDER_SHELL_A4072D0_CALLER_COUNT == 0x4u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A4072D0_ADDR_TAKEN_TABLE_VA ==
                      0x0086710au,
              "v62 4072d0 span + 4-caller census + BO glue dword");

extern "C" float isaac_render_shell_a4072b0_float20(uint32_t addr) {
  /* VA 0x004072b0: fld dword ptr [ecx+0x20]; ret -- x87 f32 read at
     +0x20. */
  return f32_load(addr + ISAAC_RENDER_SHELL_A4072B0_FIELD_OFF);
}

extern "C" float isaac_render_shell_a4072c0_float24(uint32_t addr) {
  /* VA 0x004072c0: fld dword ptr [ecx+0x24]; ret -- x87 f32 read at
     +0x24. */
  return f32_load(addr + ISAAC_RENDER_SHELL_A4072C0_FIELD_OFF);
}

extern "C" float isaac_render_shell_a4072d0_float28(uint32_t addr) {
  /* VA 0x004072d0: fld dword ptr [ecx+0x28]; ret -- x87 f32 read at
     +0x28. */
  return f32_load(addr + ISAAC_RENDER_SHELL_A4072D0_FIELD_OFF);
}

extern "C" uint32_t isaac_render_shell_a4072b0_host_va(void) {
  return ISAAC_RENDER_SHELL_A4072B0_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a4072b0_end_va(void) {
  return ISAAC_RENDER_SHELL_A4072B0_END_VA;
}

extern "C" uint32_t isaac_render_shell_a4072b0_next_va(void) {
  return ISAAC_RENDER_SHELL_A4072B0_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a4072b0_caller_count(void) {
  return ISAAC_RENDER_SHELL_A4072B0_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_a4072b0_caller_first_va(void) {
  return ISAAC_RENDER_SHELL_A4072B0_CALLER_FIRST_VA;
}

extern "C" uint32_t isaac_render_shell_a4072b0_caller_last_va(void) {
  return ISAAC_RENDER_SHELL_A4072B0_CALLER_LAST_VA;
}

extern "C" uint32_t isaac_render_shell_a4072b0_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A4072B0_ADDR_TAKEN_COUNT;
}

extern "C" uint32_t isaac_render_shell_a4072b0_addr_taken_table_va(void) {
  return ISAAC_RENDER_SHELL_A4072B0_ADDR_TAKEN_TABLE_VA;
}

extern "C" uint32_t isaac_render_shell_a4072b0_eax_writes(void) {
  return ISAAC_RENDER_SHELL_A4072B0_EAX_WRITES;
}

extern "C" uint32_t isaac_render_shell_a4072b0_stack_args(void) {
  return ISAAC_RENDER_SHELL_A4072B0_STACK_ARGS;
}

extern "C" uint32_t isaac_render_shell_a4072b0_this_call(void) {
  return ISAAC_RENDER_SHELL_A4072B0_THIS_CALL;
}

extern "C" uint32_t isaac_render_shell_a4072b0_field_off(void) {
  return ISAAC_RENDER_SHELL_A4072B0_FIELD_OFF;
}

extern "C" uint32_t isaac_render_shell_a4072c0_host_va(void) {
  return ISAAC_RENDER_SHELL_A4072C0_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a4072c0_end_va(void) {
  return ISAAC_RENDER_SHELL_A4072C0_END_VA;
}

extern "C" uint32_t isaac_render_shell_a4072c0_next_va(void) {
  return ISAAC_RENDER_SHELL_A4072C0_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a4072c0_caller_count(void) {
  return ISAAC_RENDER_SHELL_A4072C0_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_a4072c0_caller_first_va(void) {
  return ISAAC_RENDER_SHELL_A4072C0_CALLER_FIRST_VA;
}

extern "C" uint32_t isaac_render_shell_a4072c0_caller_last_va(void) {
  return ISAAC_RENDER_SHELL_A4072C0_CALLER_LAST_VA;
}

extern "C" uint32_t isaac_render_shell_a4072c0_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A4072C0_ADDR_TAKEN_COUNT;
}

extern "C" uint32_t isaac_render_shell_a4072c0_addr_taken_table_va(void) {
  return ISAAC_RENDER_SHELL_A4072C0_ADDR_TAKEN_TABLE_VA;
}

extern "C" uint32_t isaac_render_shell_a4072c0_eax_writes(void) {
  return ISAAC_RENDER_SHELL_A4072C0_EAX_WRITES;
}

extern "C" uint32_t isaac_render_shell_a4072c0_stack_args(void) {
  return ISAAC_RENDER_SHELL_A4072C0_STACK_ARGS;
}

extern "C" uint32_t isaac_render_shell_a4072c0_this_call(void) {
  return ISAAC_RENDER_SHELL_A4072C0_THIS_CALL;
}

extern "C" uint32_t isaac_render_shell_a4072c0_field_off(void) {
  return ISAAC_RENDER_SHELL_A4072C0_FIELD_OFF;
}

extern "C" uint32_t isaac_render_shell_a4072d0_host_va(void) {
  return ISAAC_RENDER_SHELL_A4072D0_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a4072d0_end_va(void) {
  return ISAAC_RENDER_SHELL_A4072D0_END_VA;
}

extern "C" uint32_t isaac_render_shell_a4072d0_next_va(void) {
  return ISAAC_RENDER_SHELL_A4072D0_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a4072d0_caller_count(void) {
  return ISAAC_RENDER_SHELL_A4072D0_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_a4072d0_caller_first_va(void) {
  return ISAAC_RENDER_SHELL_A4072D0_CALLER_FIRST_VA;
}

extern "C" uint32_t isaac_render_shell_a4072d0_caller_last_va(void) {
  return ISAAC_RENDER_SHELL_A4072D0_CALLER_LAST_VA;
}

extern "C" uint32_t isaac_render_shell_a4072d0_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A4072D0_ADDR_TAKEN_COUNT;
}

extern "C" uint32_t isaac_render_shell_a4072d0_addr_taken_table_va(void) {
  return ISAAC_RENDER_SHELL_A4072D0_ADDR_TAKEN_TABLE_VA;
}

extern "C" uint32_t isaac_render_shell_a4072d0_eax_writes(void) {
  return ISAAC_RENDER_SHELL_A4072D0_EAX_WRITES;
}

extern "C" uint32_t isaac_render_shell_a4072d0_stack_args(void) {
  return ISAAC_RENDER_SHELL_A4072D0_STACK_ARGS;
}

extern "C" uint32_t isaac_render_shell_a4072d0_this_call(void) {
  return ISAAC_RENDER_SHELL_A4072D0_THIS_CALL;
}

extern "C" uint32_t isaac_render_shell_a4072d0_field_off(void) {
  return ISAAC_RENDER_SHELL_A4072D0_FIELD_OFF;
}


/* ============================================================================
 * ABI v63: 0x00a18230 band-start pure body (section-notes/
 * render-shell-v63-a18230/NOTES.md + census-a18230.json).
 * Byte-gate discipline: uint32 params; NO uint8_t scalars.
 * ============================================================================ */

static_assert((uint32_t)ISAAC_RENDER_SHELL_A18230_HOST_VA == 0x00a18230u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A18230_END_VA == 0x00a182b5u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A18230_NEXT_VA == 0x00a182c0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A18230_CALLER_COUNT == 0x2eu,
              "v63 a18230 span (census-a18230.json + NOTES)");

extern "C" uint32_t isaac_render_shell_a18230_gate(uint32_t this_68) {
  /* VA 0x00a18233 cmp dword ptr [esi+0x68],0 ; VA 0x00a18237 je ARM B.
     FULL-dword gate: [this+0x68] != 0 -> ARM A (log 4 zero dwords +
     level 0x4100 + 16-B copy); == 0 -> ARM B (level 0x4100 only). */
  return this_68 != 0u ? 1u : 0u;
}

extern "C" uint32_t isaac_render_shell_a18230_pack_off(uint32_t idx) {
  /* VA 0x00a1828b/92/99/a0/a7: dword stores at [this+0x20..0x30],
     stride 4, machine order. */
  return idx < 5u ? 0x20u + 4u * idx : 0u;
}

extern "C" uint32_t isaac_render_shell_a18230_pack_val(uint32_t idx) {
  /* PE values {0,1,0,1,0} at the five pack slots. */
  static const uint32_t vals[5] = {0u, 1u, 0u, 1u, 0u};
  return idx < 5u ? vals[idx] : 0u;
}

extern "C" uint32_t isaac_render_shell_a18230_host_va(void) {
  return ISAAC_RENDER_SHELL_A18230_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a18230_end_va(void) {
  return ISAAC_RENDER_SHELL_A18230_END_VA;
}

extern "C" uint32_t isaac_render_shell_a18230_next_va(void) {
  return ISAAC_RENDER_SHELL_A18230_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a18230_caller_count(void) {
  return ISAAC_RENDER_SHELL_A18230_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_a18230_caller_first_va(void) {
  return ISAAC_RENDER_SHELL_A18230_CALLER_FIRST_VA;
}

extern "C" uint32_t isaac_render_shell_a18230_caller_last_va(void) {
  return ISAAC_RENDER_SHELL_A18230_CALLER_LAST_VA;
}

extern "C" uint32_t isaac_render_shell_a18230_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A18230_ADDR_TAKEN_COUNT;
}

extern "C" uint32_t isaac_render_shell_a18230_vtable_slot_va_0(void) {
  return ISAAC_RENDER_SHELL_A18230_VTABLE_SLOT_VA_0;
}

extern "C" uint32_t isaac_render_shell_a18230_vtable_slot_va_1(void) {
  return ISAAC_RENDER_SHELL_A18230_VTABLE_SLOT_VA_1;
}

extern "C" uint32_t isaac_render_shell_a18230_vtable_va_0(void) {
  return ISAAC_RENDER_SHELL_A18230_VTABLE_VA_0;
}

extern "C" uint32_t isaac_render_shell_a18230_vtable_va_1(void) {
  return ISAAC_RENDER_SHELL_A18230_VTABLE_VA_1;
}

extern "C" uint32_t isaac_render_shell_a18230_vtable_slot_idx(void) {
  return ISAAC_RENDER_SHELL_A18230_VTABLE_SLOT_IDX;
}

extern "C" uint32_t isaac_render_shell_a18230_eax_writes(void) {
  return ISAAC_RENDER_SHELL_A18230_EAX_WRITES;
}

extern "C" uint32_t isaac_render_shell_a18230_stack_args(void) {
  return ISAAC_RENDER_SHELL_A18230_STACK_ARGS;
}

extern "C" uint32_t isaac_render_shell_a18230_this_call(void) {
  return ISAAC_RENDER_SHELL_A18230_THIS_CALL;
}

extern "C" uint32_t isaac_render_shell_a18230_gate_off(void) {
  return ISAAC_RENDER_SHELL_A18230_GATE_OFF;
}

extern "C" uint32_t isaac_render_shell_a18230_iat_va_0(void) {
  return ISAAC_RENDER_SHELL_A18230_IAT_VA_0;
}

extern "C" uint32_t isaac_render_shell_a18230_iat_va_1(void) {
  return ISAAC_RENDER_SHELL_A18230_IAT_VA_1;
}

extern "C" uint32_t isaac_render_shell_a18230_log_arg(void) {
  return ISAAC_RENDER_SHELL_A18230_LOG_ARG;
}

extern "C" uint32_t isaac_render_shell_a18230_zero_arg_count(void) {
  return ISAAC_RENDER_SHELL_A18230_ZERO_ARG_COUNT;
}

extern "C" uint32_t isaac_render_shell_a18230_copy_off(void) {
  return ISAAC_RENDER_SHELL_A18230_COPY_OFF;
}

extern "C" uint32_t isaac_render_shell_a18230_copy_bytes(void) {
  return ISAAC_RENDER_SHELL_A18230_COPY_BYTES;
}

extern "C" uint32_t isaac_render_shell_a18230_chain_va(void) {
  return ISAAC_RENDER_SHELL_A18230_CHAIN_VA;
}

extern "C" uint32_t isaac_render_shell_a18230_chain_stack_args(void) {
  return ISAAC_RENDER_SHELL_A18230_CHAIN_STACK_ARGS;
}

/* ============================================================================
 * ABI v64: vtable-slot method 0xa182c0..0xa182fb (slot 18 of BOTH
 * 0xb82430/0xb82600). Byte gate on the stack arg; ARM A = leaf
 * [0xc1292c] + BTS bit 3 of [this+4], ARM B = leaf [0xc12928] + BTR
 * bit 3. Leaves are .data FN slots (rest 0xa35ca0/0xa36c60) — typed-
 * host. Evidence: section-notes/render-shell-v64-hostrows/NOTES.md +
 * census-v64-hostrows.json + disasm-host3.py (this unit).
 * ============================================================================ */

static_assert((uint32_t)ISAAC_RENDER_SHELL_A182C0_HOST_VA == 0x00a182c0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A182C0_END_VA == 0x00a182fbu &&
                  (uint32_t)ISAAC_RENDER_SHELL_A182C0_NEXT_VA == 0x00a18300u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A182C0_CALLER_COUNT == 0x0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A182C0_ADDR_TAKEN_COUNT == 0x2u,
              "v64 a182c0 span (census-v64-hostrows.json + NOTES)");

extern "C" uint32_t isaac_render_shell_a182c0_gate(uint32_t arg) {
  /* VA 0x00a182c3 cmp byte ptr [ebp+8],0 ; VA 0x00a182cf je ARM B.
     BYTE gate on the stack arg: (arg & 0xff) != 0 -> ARM A (set),
     == 0 -> ARM B (clear). uint32 param, &0xff mask — NO uint8_t. */
  return (arg & 0xffu) != 0u ? 1u : 0u;
}

extern "C" uint32_t isaac_render_shell_a182c0_flags_set(uint32_t flags) {
  /* VA 0x00a182da bts eax,3 — ARM A sets bit 3 of [this+4]. */
  return flags | (1u << ISAAC_RENDER_SHELL_A182C0_FLAG_BIT);
}

extern "C" uint32_t isaac_render_shell_a182c0_flags_clear(uint32_t flags) {
  /* VA 0x00a182ef btr eax,3 — ARM B clears bit 3 of [this+4]. */
  return flags & ~(1u << ISAAC_RENDER_SHELL_A182C0_FLAG_BIT);
}

extern "C" uint32_t isaac_render_shell_a182c0_leaf_va(uint32_t arg) {
  /* ARM A -> [0xc1292c] (set-side), ARM B -> [0xc12928] (clear-side).
     Both leaves receive the hoisted arg 0x8db9 (stdcall-shaped). */
  return (arg & 0xffu) != 0u ? (uint32_t)ISAAC_RENDER_SHELL_A182C0_LEAF_VA_1
                             : (uint32_t)ISAAC_RENDER_SHELL_A182C0_LEAF_VA_0;
}

extern "C" uint32_t isaac_render_shell_a182c0_host_va(void) {
  return ISAAC_RENDER_SHELL_A182C0_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a182c0_end_va(void) {
  return ISAAC_RENDER_SHELL_A182C0_END_VA;
}

extern "C" uint32_t isaac_render_shell_a182c0_next_va(void) {
  return ISAAC_RENDER_SHELL_A182C0_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a182c0_caller_count(void) {
  return ISAAC_RENDER_SHELL_A182C0_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_a182c0_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A182C0_ADDR_TAKEN_COUNT;
}

extern "C" uint32_t isaac_render_shell_a182c0_vtable_slot_va_0(void) {
  return ISAAC_RENDER_SHELL_A182C0_VTABLE_SLOT_VA_0;
}

extern "C" uint32_t isaac_render_shell_a182c0_vtable_slot_va_1(void) {
  return ISAAC_RENDER_SHELL_A182C0_VTABLE_SLOT_VA_1;
}

extern "C" uint32_t isaac_render_shell_a182c0_vtable_va_0(void) {
  return ISAAC_RENDER_SHELL_A182C0_VTABLE_VA_0;
}

extern "C" uint32_t isaac_render_shell_a182c0_vtable_va_1(void) {
  return ISAAC_RENDER_SHELL_A182C0_VTABLE_VA_1;
}

extern "C" uint32_t isaac_render_shell_a182c0_vtable_slot_idx(void) {
  return ISAAC_RENDER_SHELL_A182C0_VTABLE_SLOT_IDX;
}

extern "C" uint32_t isaac_render_shell_a182c0_eax_writes(void) {
  return ISAAC_RENDER_SHELL_A182C0_EAX_WRITES;
}

extern "C" uint32_t isaac_render_shell_a182c0_stack_args(void) {
  return ISAAC_RENDER_SHELL_A182C0_STACK_ARGS;
}

extern "C" uint32_t isaac_render_shell_a182c0_this_call(void) {
  return ISAAC_RENDER_SHELL_A182C0_THISCALL;
}

extern "C" uint32_t isaac_render_shell_a182c0_leaf_va_0(void) {
  return ISAAC_RENDER_SHELL_A182C0_LEAF_VA_0;
}

extern "C" uint32_t isaac_render_shell_a182c0_leaf_va_1(void) {
  return ISAAC_RENDER_SHELL_A182C0_LEAF_VA_1;
}

extern "C" uint32_t isaac_render_shell_a182c0_leaf_arg(void) {
  return ISAAC_RENDER_SHELL_A182C0_LEAF_ARG;
}

extern "C" uint32_t isaac_render_shell_a182c0_flag_off(void) {
  return ISAAC_RENDER_SHELL_A182C0_FLAG_OFF;
}

extern "C" uint32_t isaac_render_shell_a182c0_flag_bit(void) {
  return ISAAC_RENDER_SHELL_A182C0_FLAG_BIT;
}

extern "C" uint32_t isaac_render_shell_a182c0_arg_off(void) {
  return ISAAC_RENDER_SHELL_A182C0_ARG_OFF;
}

extern "C" uint32_t isaac_render_shell_host_a19450_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A19450_VA;
}

extern "C" uint32_t isaac_render_shell_host_a19dd0_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A19DD0_VA;
}

extern "C" uint32_t isaac_render_shell_host_a19df0_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A19DF0_VA;
}


/* ============================================================================
 * ABI v65: vtable-slot method 0xa18460..0xa184d5 (slot 22 of BOTH
 * 0xb82430/0xb82600). This-call + 3 float stack args (ret 0xc). The
 * 16-byte pack {arg1, arg2, arg3, 1.0f} is built on the stack (slot
 * offsets 0/4/8/0xc; slot 3 = const 0x3f800000) and passed to IAT leaf
 * [0xc0f95c] (stdcall-shaped; THE SAME leaf as v63 a18230 — typed-
 * host, rest 0xa32770), then rebuilt and stored via one movups to
 * [this+8..0x17] plus [this+0x18] = 0. Leaf result never consumed.
 * 0 E8, 0 branches. Evidence: section-notes/render-shell-v65-a18460/
 * NOTES.md (this unit decode + census + identify-zhl exactMatches []).
 * ============================================================================ */

static_assert((uint32_t)ISAAC_RENDER_SHELL_A18460_HOST_VA == 0x00a18460u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A18460_END_VA == 0x00a184d5u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A18460_NEXT_VA == 0x00a184e0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A18460_CALLER_COUNT == 0x0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A18460_ADDR_TAKEN_COUNT == 0x2u,
              "v65 a18460 span (census + NOTES)");

extern "C" uint32_t isaac_render_shell_a18460_pack_off(uint32_t idx) {
  /* 16-B pack slot offsets: movss [esp+0]/[esp+4]/[esp+8] + mov
     [esp+0xc] at VA 0x00a18471..0x00a1848f (and the [this+8] store
     twin). idx 0..3 -> 4*idx; out of range -> 0. uint32 param,
     full-dword guard (PE has no byte test here) — NO uint8_t. */
  return idx < 4u ? 4u * idx : 0u;
}

extern "C" uint32_t isaac_render_shell_a18460_pack_val(uint32_t idx,
                                                       uint32_t a1,
                                                       uint32_t a2,
                                                       uint32_t a3) {
  /* Selector over the pack {a1, a2, a3, 1.0f}: slots 0..2 are the
     three stack floats ([ebp+8]/[ebp+0xc]/[ebp+0x10]), slot 3 is the
     imm 0x3f800000 (mov dword [esp+0xc],0x3f800000 at VA 0x00a18471;
     twin mov dword [ebp-8],0x3f800000 at 0xa184b8). Out of range
     -> 0. */
  if (idx == 0u) return a1;
  if (idx == 1u) return a2;
  if (idx == 2u) return a3;
  if (idx == 3u) return (uint32_t)ISAAC_RENDER_SHELL_A18460_PACK_ONE_BITS;
  return 0u;
}

extern "C" uint32_t isaac_render_shell_a18460_arg_off(uint32_t n) {
  /* Stack-arg base offsets: movss xmm0,[ebp+8]/[ebp+0xc]/[ebp+0x10]
     at VA 0x00a1848a/0x00a1847f/0x00a18466. Arg slot n 0..2 -> 8 + 4*n;
     out of range -> 0. */
  return n < 3u ? 8u + 4u * n : 0u;
}

extern "C" uint32_t isaac_render_shell_a18460_host_va(void) {
  return ISAAC_RENDER_SHELL_A18460_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a18460_end_va(void) {
  return ISAAC_RENDER_SHELL_A18460_END_VA;
}

extern "C" uint32_t isaac_render_shell_a18460_next_va(void) {
  return ISAAC_RENDER_SHELL_A18460_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a18460_caller_count(void) {
  return ISAAC_RENDER_SHELL_A18460_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_a18460_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A18460_ADDR_TAKEN_COUNT;
}

extern "C" uint32_t isaac_render_shell_a18460_vtable_slot_va_0(void) {
  return ISAAC_RENDER_SHELL_A18460_VTABLE_SLOT_VA_0;
}

extern "C" uint32_t isaac_render_shell_a18460_vtable_slot_va_1(void) {
  return ISAAC_RENDER_SHELL_A18460_VTABLE_SLOT_VA_1;
}

extern "C" uint32_t isaac_render_shell_a18460_vtable_va_0(void) {
  return ISAAC_RENDER_SHELL_A18460_VTABLE_VA_0;
}

extern "C" uint32_t isaac_render_shell_a18460_vtable_va_1(void) {
  return ISAAC_RENDER_SHELL_A18460_VTABLE_VA_1;
}

extern "C" uint32_t isaac_render_shell_a18460_vtable_slot_idx(void) {
  return ISAAC_RENDER_SHELL_A18460_VTABLE_SLOT_IDX;
}

extern "C" uint32_t isaac_render_shell_a18460_eax_writes(void) {
  return ISAAC_RENDER_SHELL_A18460_EAX_WRITES;
}

extern "C" uint32_t isaac_render_shell_a18460_stack_args(void) {
  return ISAAC_RENDER_SHELL_A18460_STACK_ARGS;
}

extern "C" uint32_t isaac_render_shell_a18460_this_call(void) {
  return ISAAC_RENDER_SHELL_A18460_THISCALL;
}

extern "C" uint32_t isaac_render_shell_a18460_ret_adj(void) {
  return ISAAC_RENDER_SHELL_A18460_RET_ADJ;
}

extern "C" uint32_t isaac_render_shell_a18460_leaf_va(void) {
  return ISAAC_RENDER_SHELL_A18460_LEAF_VA;
}

extern "C" uint32_t isaac_render_shell_a18460_leaf_arg_count(void) {
  return ISAAC_RENDER_SHELL_A18460_LEAF_ARG_COUNT;
}

extern "C" uint32_t isaac_render_shell_a18460_dest_off(void) {
  return ISAAC_RENDER_SHELL_A18460_DEST_OFF;
}

extern "C" uint32_t isaac_render_shell_a18460_dest_bytes(void) {
  return ISAAC_RENDER_SHELL_A18460_DEST_BYTES;
}

extern "C" uint32_t isaac_render_shell_a18460_zero_off(void) {
  return ISAAC_RENDER_SHELL_A18460_ZERO_OFF;
}

extern "C" uint32_t isaac_render_shell_a18460_pack_one_bits(void) {
  return ISAAC_RENDER_SHELL_A18460_PACK_ONE_BITS;
}
/* ============================================================================
 * ABI v66: 0xa18530..0xa186e6 (caller-bearing float body, 5 E8 callers
 * 0xa18387/0xa1844b/0xa19a65/0xa19c8c/0xa24a0f) + trivial vtable-B size
 * stubs 0xa19340/0xa193c0 + HOST row pins 0xa18750/0xa18a20/0xa19530/
 * 0xa19600/0xa196b0. GS prolog/epilog (cookie [0xbf93b4] xor ebp ->
 * 0xaef12b CRT __security_check_cookie, typed-host) + 3 typed-host .data
 * FN-slot leaves ([0xc0f918]/[0xc0f91c]/[0xc0f824]). Plan P1/P2/P3 by
 * BYTE gates `test byte [ecx+4],0x20`; denominators from u32 [edx+0x14]/
 * [edx+0x10] (P1, via cvtdq2pd + addsd 0xbacb00 magic +0/2^32 + cvtpd2ps)
 * or f32 [this+0xa0]/[this+0x9c] (P2/P3); common tail x1 = signflip
 * (x1+0.0)/den_a, x2 = signflip(x2+0.0)/db, x0 = 2.0f/den_a, x6 =
 * 2.0f/db (addss +0.0 normalization is modeled — matters for -0.0).
 * Evidence: section-notes/render-shell-v66-a18530/NOTES.md.
 * ============================================================================ */

static_assert((uint32_t)ISAAC_RENDER_SHELL_A18530_HOST_VA == 0x00a18530u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A18530_END_VA == 0x00a186e6u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A18530_CALLER_COUNT == 0x5u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A19340_HOST_VA == 0x00a19340u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A193C0_HOST_VA == 0x00a193c0u,
              "v66 a18530/a19340/a193c0 spans (census + NOTES)");

extern "C" uint32_t isaac_render_shell_a18530_plan(uint32_t edx,
                                                   uint32_t flags) {
  /* Plan selector, PE byte gates: test edx,edx je 0xa18590 @ 0xa18566;
     test byte [ecx+4],0x20 @ 0xa1856a/0xa1859f. edx==0 -> 0 (P3, this
     floats, negated denominator); edx!=0 && flag20 set -> 1 (P2, this
     floats); edx!=0 && flag20 clear -> 2 (P1, int denominators).
     BYTE gate: explicit &0xffu mask — NO uint8_t. */
  if (edx == 0u) {
    return 0u;
  }
  if (((flags & 0xffu) & 0x20u) != 0u) {
    return 1u;
  }
  return 2u;
}

extern "C" uint32_t isaac_render_shell_a18530_u32f_bits(uint32_t v) {
  /* VA 0x00a18573..0x00a18587 (and 0xa185af..0xa185c3): movd xmm0,eax;
     cvtdq2pd xmm0,xmm0; shr eax,0x1f; addsd xmm0,[eax*8+0xbacb00];
     cvtpd2ps. The 0xbacb00 table is {0.0, 2^32} selected by the sign
     bit (read this unit: entries 0.0 / 4294967296.0). cvtdq2pd is
     exact, the 2^32 add is exact in f64, cvtpd2ps rounds to f32 with
     the default RN mode == C float narrowing. Equivalent to
     fround(v >>> 0) in the oracle. */
  double d = (double)(int32_t)v;
  d += (v >> 31) ? 4294967296.0 : 0.0;
  const float f = (float)d;
  return __builtin_bit_cast(uint32_t, f);
}

extern "C" uint32_t isaac_render_shell_a18530_den_a_bits(uint32_t plan,
                                                         uint32_t int_14,
                                                         uint32_t a0_bits) {
  /* Denominator A: movss xmm3,[ecx+0xa0] @ 0xa18590 (P2/P3) vs the P1
     int pipeline on [edx+0x14] @ 0xa18570. plan==2 -> u32f(int_14);
     else f32_from_bits(a0_bits). */
  if (plan == 2u) {
    return isaac_render_shell_a18530_u32f_bits(int_14);
  }
  return __builtin_bit_cast(uint32_t, f32_from_bits(a0_bits));
}

extern "C" uint32_t isaac_render_shell_a18530_den_b_bits(uint32_t plan,
                                                         uint32_t int_10,
                                                         uint32_t b9c_bits) {
  /* Denominator B: movss xmm2,[ecx+0x9c] @ 0xa185e3 (P2/P3) vs the P1
     int pipeline on [edx+0x10] @ 0xa185a5. plan==2 -> u32f(int_10);
     else f32_from_bits(b9c_bits). */
  if (plan == 2u) {
    return isaac_render_shell_a18530_u32f_bits(int_10);
  }
  return __builtin_bit_cast(uint32_t, f32_from_bits(b9c_bits));
}

extern "C" uint32_t isaac_render_shell_a18530_x1_bits(uint32_t plan,
                                                      uint32_t den_a_bits) {
  /* x1 at VA 0x00a18610/0x00a18625: addss xmm1,xmm4 (+0.0 normalize,
     modeled: -0.0 + 0.0 = +0.0) then xorps xmm1,[0xbacb70] (sign-bit
     flip; the mask's first 4 dwords are 0x80000000) then divss by
     xmm3 = da (P1/P2) or xmm4 = 0.0f - da (P3 subss @ 0xa1862c).
     divss == C float division (RN); 0/0 -> canonical NaN both
     sides. */
  const float da = f32_from_bits(den_a_bits);
  const float numerator = f32_neg_sign(da + 0.0f);
  const float denom = (plan == 0u) ? (0.0f - da) : da;
  const float r = numerator / denom;
  return __builtin_bit_cast(uint32_t, r);
}

extern "C" uint32_t isaac_render_shell_a18530_x2_bits(uint32_t den_b_bits) {
  /* x2 at VA 0x00a18638..0x00a1863f: xorps xmm2,[0xbacb70] after the
     addss +0.0 normalize (0xa185d9/0xa18600), divss xmm2,xmm5 where
     xmm5 == db (subss db-0 is bit-identical). */
  const float db = f32_from_bits(den_b_bits);
  const float numerator = f32_neg_sign(db + 0.0f);
  const float r = numerator / db;
  return __builtin_bit_cast(uint32_t, r);
}

extern "C" uint32_t isaac_render_shell_a18530_x0_bits(uint32_t plan,
                                                      uint32_t den_a_bits) {
  /* x0 = 2.0f/da (divss xmm0,xmm3 @ 0xa1861b — P1/P2) vs
     2.0f/(0.0f-da) (divss xmm0,xmm4 @ 0xa18630 — P3). The P3
     denominator is subss 0-da, NOT a sign flip: for da = +/-0.0 it
     is +0.0 (IEEE 0-0), which flips the division infinity sign. */
  const float da = f32_from_bits(den_a_bits);
  const float denom = (plan == 0u) ? (0.0f - da) : da;
  const float two = f32_from_bits(ISAAC_RENDER_SHELL_A18530_F32_TWO_BITS);
  const float r = two / denom;
  return __builtin_bit_cast(uint32_t, r);
}

extern "C" uint32_t isaac_render_shell_a18530_x6_bits(uint32_t den_b_bits) {
  /* x6 = 2.0f/db (divss xmm6,xmm5 @ 0xa185dd/0xa18608; xmm5 == db). */
  const float db = f32_from_bits(den_b_bits);
  const float two = f32_from_bits(ISAAC_RENDER_SHELL_A18530_F32_TWO_BITS);
  const float r = two / db;
  return __builtin_bit_cast(uint32_t, r);
}

extern "C" uint32_t isaac_render_shell_a18530_neg_bits(uint32_t bits) {
  /* xorps with DAT_00bacb70 (16-byte mask whose lane dwords are
     0x80000000): sign-bit flip of one f32 lane. */
  return bits ^ (uint32_t)ISAAC_RENDER_SHELL_F32_SIGN_BITS;
}

extern "C" uint32_t isaac_render_shell_a19340_size(void) {
  /* mov eax,0x3c0 @ 0xa19340; ret @ 0xa19345. Vtable B 0xb82600 slot
     12 (dref 0xb82630, read-back 0xa19340). */
  return 0x3c0u;
}

extern "C" uint32_t isaac_render_shell_a193c0_size(void) {
  /* mov eax,0x21c @ 0xa193c0; ret @ 0xa193c5. Vtable B 0xb82600 slot
     13 (dref 0xb82634, read-back 0xa193c0). */
  return 0x21cu;
}

extern "C" uint32_t isaac_render_shell_a18530_host_va(void) {
  return ISAAC_RENDER_SHELL_A18530_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a18530_end_va(void) {
  return ISAAC_RENDER_SHELL_A18530_END_VA;
}

extern "C" uint32_t isaac_render_shell_a18530_next_va(void) {
  return ISAAC_RENDER_SHELL_A18530_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a18530_caller_count(void) {
  return ISAAC_RENDER_SHELL_A18530_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_a18530_caller_first_va(void) {
  return ISAAC_RENDER_SHELL_A18530_CALLER_FIRST_VA;
}

extern "C" uint32_t isaac_render_shell_a18530_caller_last_va(void) {
  return ISAAC_RENDER_SHELL_A18530_CALLER_LAST_VA;
}

extern "C" uint32_t isaac_render_shell_a18530_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A18530_ADDR_TAKEN_COUNT;
}

extern "C" uint32_t isaac_render_shell_a18530_eax_writes(void) {
  return ISAAC_RENDER_SHELL_A18530_EAX_WRITES;
}

extern "C" uint32_t isaac_render_shell_a18530_stack_args(void) {
  return ISAAC_RENDER_SHELL_A18530_STACK_ARGS;
}

extern "C" uint32_t isaac_render_shell_a18530_this_call(void) {
  return ISAAC_RENDER_SHELL_A18530_THISCALL;
}

extern "C" uint32_t isaac_render_shell_a18530_gs_va(void) {
  return ISAAC_RENDER_SHELL_A18530_GS_VA;
}

extern "C" uint32_t isaac_render_shell_a18530_gs_cookie_va(void) {
  return ISAAC_RENDER_SHELL_A18530_GS_COOKIE_VA;
}

extern "C" uint32_t isaac_render_shell_a18530_global_va(void) {
  return ISAAC_RENDER_SHELL_A18530_GLOBAL_VA;
}

extern "C" uint32_t isaac_render_shell_a18530_leaf_va_0(void) {
  return ISAAC_RENDER_SHELL_A18530_LEAF_VA_0;
}

extern "C" uint32_t isaac_render_shell_a18530_leaf_va_1(void) {
  return ISAAC_RENDER_SHELL_A18530_LEAF_VA_1;
}

extern "C" uint32_t isaac_render_shell_a18530_leaf_va_2(void) {
  return ISAAC_RENDER_SHELL_A18530_LEAF_VA_2;
}

extern "C" uint32_t isaac_render_shell_a18530_edx_off(void) {
  return ISAAC_RENDER_SHELL_A18530_EDX_OFF;
}

extern "C" uint32_t isaac_render_shell_a18530_flag_off(void) {
  return ISAAC_RENDER_SHELL_A18530_FLAG_OFF;
}

extern "C" uint32_t isaac_render_shell_a18530_flag_bit(void) {
  return ISAAC_RENDER_SHELL_A18530_FLAG_BIT;
}

extern "C" uint32_t isaac_render_shell_a18530_den_a_off(void) {
  return ISAAC_RENDER_SHELL_A18530_DEN_A_OFF;
}

extern "C" uint32_t isaac_render_shell_a18530_den_b_off(void) {
  return ISAAC_RENDER_SHELL_A18530_DEN_B_OFF;
}

extern "C" uint32_t isaac_render_shell_a19340_host_va(void) {
  return ISAAC_RENDER_SHELL_A19340_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a19340_end_va(void) {
  return ISAAC_RENDER_SHELL_A19340_END_VA;
}

extern "C" uint32_t isaac_render_shell_a19340_next_va(void) {
  return ISAAC_RENDER_SHELL_A19340_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a19340_caller_count(void) {
  return ISAAC_RENDER_SHELL_A19340_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_a19340_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A19340_ADDR_TAKEN_COUNT;
}

extern "C" uint32_t isaac_render_shell_a19340_vtable_slot_va(void) {
  return ISAAC_RENDER_SHELL_A19340_VTABLE_SLOT_VA;
}

extern "C" uint32_t isaac_render_shell_a19340_vtable_va(void) {
  return ISAAC_RENDER_SHELL_A19340_VTABLE_VA;
}

extern "C" uint32_t isaac_render_shell_a19340_vtable_slot_idx(void) {
  return ISAAC_RENDER_SHELL_A19340_VTABLE_SLOT_IDX;
}

extern "C" uint32_t isaac_render_shell_a19340_eax_writes(void) {
  return ISAAC_RENDER_SHELL_A19340_EAX_WRITES;
}

extern "C" uint32_t isaac_render_shell_a193c0_host_va(void) {
  return ISAAC_RENDER_SHELL_A193C0_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a193c0_end_va(void) {
  return ISAAC_RENDER_SHELL_A193C0_END_VA;
}

extern "C" uint32_t isaac_render_shell_a193c0_next_va(void) {
  return ISAAC_RENDER_SHELL_A193C0_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a193c0_caller_count(void) {
  return ISAAC_RENDER_SHELL_A193C0_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_a193c0_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A193C0_ADDR_TAKEN_COUNT;
}

extern "C" uint32_t isaac_render_shell_a193c0_vtable_slot_va(void) {
  return ISAAC_RENDER_SHELL_A193C0_VTABLE_SLOT_VA;
}

extern "C" uint32_t isaac_render_shell_a193c0_vtable_va(void) {
  return ISAAC_RENDER_SHELL_A193C0_VTABLE_VA;
}

extern "C" uint32_t isaac_render_shell_a193c0_vtable_slot_idx(void) {
  return ISAAC_RENDER_SHELL_A193C0_VTABLE_SLOT_IDX;
}

extern "C" uint32_t isaac_render_shell_a193c0_eax_writes(void) {
  return ISAAC_RENDER_SHELL_A193C0_EAX_WRITES;
}

extern "C" uint32_t isaac_render_shell_host_a18750_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A18750_VA;
}

extern "C" uint32_t isaac_render_shell_host_a18a20_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A18A20_VA;
}

extern "C" uint32_t isaac_render_shell_host_a19530_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A19530_VA;
}

extern "C" uint32_t isaac_render_shell_host_a19600_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A19600_VA;
}

extern "C" uint32_t isaac_render_shell_host_a196b0_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A196B0_VA;
}

static_assert((uint32_t)ISAAC_RENDER_SHELL_A19BC0_HOST_VA == 0x00a19bc0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A19BC0_END_VA == 0x00a19befu &&
                  (uint32_t)ISAAC_RENDER_SHELL_A19BC0_NEXT_VA == 0x00a19bf0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A18DC0_HOST_VA == 0x00a18dc0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A18DC0_END_VA == 0x00a18de6u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A18DC0_NEXT_VA == 0x00a18df0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A18DF0_HOST_VA == 0x00a18df0u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A18DF0_END_VA == 0x00a18e08u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A18DF0_NEXT_VA == 0x00a18e10u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A18DF0_CALLER_COUNT == 0x8u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A18DF0_CALLER_FIRST_VA == 0x00b1110du &&
                  (uint32_t)ISAAC_RENDER_SHELL_A18DF0_CALLER_LAST_VA == 0x00b11d5bu &&
                  (uint32_t)ISAAC_RENDER_SHELL_A18DC0_FREE_SIZE == 0xf8u &&
                  (uint32_t)ISAAC_RENDER_SHELL_A18DF0_FREE_SIZE == 0x10u,
              "v67 a19bc0/a18dc0/a18df0 spans (census + NOTES)");

extern "C" uint32_t isaac_render_shell_a19bc0_src_sel(uint32_t flags) {
  /* VA 0xa19bc0..0xa19bc9: test byte [ecx+4],0x40; je 0xa19bd1.
     Flag clear -> DAT 0xc7b640 default pair base; flag set ->
     lea edx,[ecx+0xa4]. BYTE gate: explicit &0xffu mask — NO
     uint8_t (a186f0 shares the same gate with the same base
     selection; there it feeds 2 vtable dispatches, HOST). */
  return ((flags & 0xffu) & ISAAC_RENDER_SHELL_A19BC0_FLAG_BIT) != 0u
             ? 1u
             : 0u;
}

extern "C" uint32_t isaac_render_shell_a19bc0_trunc_bits(
    uint32_t f32_bits) {
  /* cvttss2si @ 0xa19bd1/0xa19be3: truncation toward zero. NaN,
     ±inf, or out-of-range [-2^31, 2^31) -> integer indefinite
     0x80000000 (Intel SDM, masked invalid op). The range gate is
     exact in f32 (2^31 is representable); the in-range value
     -2147483648.0f converts to INT32_MIN which is the same bit
     pattern 0x80000000 as the indefinite — identical on x86. -0.0
     converts to 0. */
  const float f = f32_from_bits(f32_bits);
  if (!(f >= -2147483648.0f && f < 2147483648.0f)) {
    return 0x80000000u;
  }
  return static_cast<uint32_t>(static_cast<int32_t>(f));
}

extern "C" uint32_t isaac_render_shell_a19bc0_host_va(void) {
  return ISAAC_RENDER_SHELL_A19BC0_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a19bc0_end_va(void) {
  return ISAAC_RENDER_SHELL_A19BC0_END_VA;
}

extern "C" uint32_t isaac_render_shell_a19bc0_next_va(void) {
  return ISAAC_RENDER_SHELL_A19BC0_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a19bc0_caller_count(void) {
  return ISAAC_RENDER_SHELL_A19BC0_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_a19bc0_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A19BC0_ADDR_TAKEN_COUNT;
}

extern "C" uint32_t isaac_render_shell_a19bc0_vtable_slot_va(void) {
  return ISAAC_RENDER_SHELL_A19BC0_VTABLE_SLOT_VA;
}

extern "C" uint32_t isaac_render_shell_a19bc0_vtable_va(void) {
  return ISAAC_RENDER_SHELL_A19BC0_VTABLE_VA;
}

extern "C" uint32_t isaac_render_shell_a19bc0_vtable_slot_idx(void) {
  return ISAAC_RENDER_SHELL_A19BC0_VTABLE_SLOT_IDX;
}

extern "C" uint32_t isaac_render_shell_a19bc0_eax_writes(void) {
  return ISAAC_RENDER_SHELL_A19BC0_EAX_WRITES;
}

extern "C" uint32_t isaac_render_shell_a19bc0_stack_args(void) {
  return ISAAC_RENDER_SHELL_A19BC0_STACK_ARGS;
}

extern "C" uint32_t isaac_render_shell_a19bc0_this_call(void) {
  return ISAAC_RENDER_SHELL_A19BC0_THISCALL;
}

extern "C" uint32_t isaac_render_shell_a19bc0_flag_off(void) {
  return ISAAC_RENDER_SHELL_A19BC0_FLAG_OFF;
}

extern "C" uint32_t isaac_render_shell_a19bc0_flag_bit(void) {
  return ISAAC_RENDER_SHELL_A19BC0_FLAG_BIT;
}

extern "C" uint32_t isaac_render_shell_a19bc0_src_off(void) {
  return ISAAC_RENDER_SHELL_A19BC0_SRC_OFF;
}

extern "C" uint32_t isaac_render_shell_a19bc0_src_default_va(void) {
  return ISAAC_RENDER_SHELL_A19BC0_SRC_DEFAULT_VA;
}

extern "C" uint32_t isaac_render_shell_a19bc0_leaf_va(void) {
  return ISAAC_RENDER_SHELL_A19BC0_LEAF_VA;
}

extern "C" uint32_t isaac_render_shell_a19bc0_arg2_off(void) {
  return ISAAC_RENDER_SHELL_A19BC0_ARG2_OFF;
}

extern "C" uint32_t isaac_render_shell_a19bc0_arg3_off(void) {
  return ISAAC_RENDER_SHELL_A19BC0_ARG3_OFF;
}

extern "C" uint32_t isaac_render_shell_a18dc0_host_va(void) {
  return ISAAC_RENDER_SHELL_A18DC0_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a18dc0_end_va(void) {
  return ISAAC_RENDER_SHELL_A18DC0_END_VA;
}

extern "C" uint32_t isaac_render_shell_a18dc0_next_va(void) {
  return ISAAC_RENDER_SHELL_A18DC0_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a18dc0_caller_count(void) {
  return ISAAC_RENDER_SHELL_A18DC0_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_a18dc0_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A18DC0_ADDR_TAKEN_COUNT;
}

extern "C" uint32_t isaac_render_shell_a18dc0_vtable_slot_va(void) {
  return ISAAC_RENDER_SHELL_A18DC0_VTABLE_SLOT_VA;
}

extern "C" uint32_t isaac_render_shell_a18dc0_vtable_va(void) {
  return ISAAC_RENDER_SHELL_A18DC0_VTABLE_VA;
}

extern "C" uint32_t isaac_render_shell_a18dc0_vtable_slot_idx(void) {
  return ISAAC_RENDER_SHELL_A18DC0_VTABLE_SLOT_IDX;
}

extern "C" uint32_t isaac_render_shell_a18dc0_stack_args(void) {
  return ISAAC_RENDER_SHELL_A18DC0_STACK_ARGS;
}

extern "C" uint32_t isaac_render_shell_a18dc0_this_call(void) {
  return ISAAC_RENDER_SHELL_A18DC0_THISCALL;
}

extern "C" uint32_t isaac_render_shell_a18dc0_eax_writes(void) {
  return ISAAC_RENDER_SHELL_A18DC0_EAX_WRITES;
}

extern "C" uint32_t isaac_render_shell_a18dc0_dtor_va(void) {
  return ISAAC_RENDER_SHELL_A18DC0_DTOR_VA;
}

extern "C" uint32_t isaac_render_shell_a18dc0_free_fn_va(void) {
  return ISAAC_RENDER_SHELL_A18DC0_FREE_FN_VA;
}

extern "C" uint32_t isaac_render_shell_a18dc0_free_size(void) {
  return ISAAC_RENDER_SHELL_A18DC0_FREE_SIZE;
}

extern "C" uint32_t isaac_render_shell_a18dc0_flag_off(void) {
  return ISAAC_RENDER_SHELL_A18DC0_FLAG_OFF;
}

extern "C" uint32_t isaac_render_shell_a18dc0_flag_bit(void) {
  return ISAAC_RENDER_SHELL_A18DC0_FLAG_BIT;
}

extern "C" uint32_t isaac_render_shell_a18df0_host_va(void) {
  return ISAAC_RENDER_SHELL_A18DF0_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a18df0_end_va(void) {
  return ISAAC_RENDER_SHELL_A18DF0_END_VA;
}

extern "C" uint32_t isaac_render_shell_a18df0_next_va(void) {
  return ISAAC_RENDER_SHELL_A18DF0_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a18df0_caller_count(void) {
  return ISAAC_RENDER_SHELL_A18DF0_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_a18df0_caller_first_va(void) {
  return ISAAC_RENDER_SHELL_A18DF0_CALLER_FIRST_VA;
}

extern "C" uint32_t isaac_render_shell_a18df0_caller_last_va(void) {
  return ISAAC_RENDER_SHELL_A18DF0_CALLER_LAST_VA;
}

extern "C" uint32_t isaac_render_shell_a18df0_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A18DF0_ADDR_TAKEN_COUNT;
}

extern "C" uint32_t isaac_render_shell_a18df0_eax_writes(void) {
  return ISAAC_RENDER_SHELL_A18DF0_EAX_WRITES;
}

extern "C" uint32_t isaac_render_shell_a18df0_stack_args(void) {
  return ISAAC_RENDER_SHELL_A18DF0_STACK_ARGS;
}

extern "C" uint32_t isaac_render_shell_a18df0_this_call(void) {
  return ISAAC_RENDER_SHELL_A18DF0_THISCALL;
}

extern "C" uint32_t isaac_render_shell_a18df0_reset_fn_va(void) {
  return ISAAC_RENDER_SHELL_A18DF0_RESET_FN_VA;
}

extern "C" uint32_t isaac_render_shell_a18df0_free_fn_va(void) {
  return ISAAC_RENDER_SHELL_A18DF0_FREE_FN_VA;
}

extern "C" uint32_t isaac_render_shell_a18df0_free_size(void) {
  return ISAAC_RENDER_SHELL_A18DF0_FREE_SIZE;
}

extern "C" uint32_t isaac_render_shell_a18df0_deref_off(void) {
  return ISAAC_RENDER_SHELL_A18DF0_DEREF_OFF;
}

extern "C" uint32_t isaac_render_shell_host_a186f0_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A186F0_VA;
}

extern "C" uint32_t isaac_render_shell_host_a188f0_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A188F0_VA;
}

extern "C" uint32_t isaac_render_shell_host_a189a0_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A189A0_VA;
}

extern "C" uint32_t isaac_render_shell_host_a19130_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A19130_VA;
}

extern "C" uint32_t isaac_render_shell_host_a19b60_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A19B60_VA;
}

extern "C" uint32_t isaac_render_shell_host_a19bf0_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A19BF0_VA;
}

extern "C" uint32_t isaac_render_shell_host_a19ca0_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A19CA0_VA;
}

extern "C" uint32_t isaac_render_shell_host_a19d40_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A19D40_VA;
}

extern "C" uint32_t isaac_render_shell_a19ca0_end_va(void) {
  return ISAAC_RENDER_SHELL_A19CA0_END_VA;
}

extern "C" uint32_t isaac_render_shell_a19ca0_next_va(void) {
  return ISAAC_RENDER_SHELL_A19CA0_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a19d40_end_va(void) {
  return ISAAC_RENDER_SHELL_A19D40_END_VA;
}

extern "C" uint32_t isaac_render_shell_a19d40_next_va(void) {
  return ISAAC_RENDER_SHELL_A19D40_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a1xxxx_band_start_va(void) {
  return ISAAC_RENDER_SHELL_A1XXXX_BAND_START_VA;
}

extern "C" uint32_t isaac_render_shell_a1xxxx_band_end_va(void) {
  return ISAAC_RENDER_SHELL_A1XXXX_BAND_END_VA;
}

extern "C" uint32_t isaac_render_shell_a1xxxx_band_open_bodies(void) {
  return ISAAC_RENDER_SHELL_A1XXXX_BAND_OPEN_BODIES;
}

extern "C" uint32_t isaac_render_shell_a1xxxx_band_host_rows(void) {
  return ISAAC_RENDER_SHELL_A1XXXX_BAND_HOST_ROWS;
}

/* ============================================================================
 * ABI v69: FontSettings band 0xa1a160..0xa1a600 (evidence
 * section-notes/render-shell-v69-a1a540/NOTES.md). Six PURE bodies
 * (0 E8 each; raw byte-scan channel) + three HOST rows + band rows.
 * ========================================================================== */

/* a1a540 7-field layout table: idx -> {off, default}. Offsets ascending:
   0x00 alignment, 0x04 maxChars(word), 0x08 mode, 0x0c scale(1.0f),
   0x10 -1, 0x14 0, 0x18 0 (0x18 stored twice in PE: 0xa1a540/0xa1a572). */
static const uint32_t kRenderShellA1a540Fields[][2] = {
  {0x00000000u, 0x00000000u}, {0x00000004u, 0x0000ffffu},
  {0x00000008u, 0x00000000u}, {0x0000000cu, 0x3f800000u},
  {0x00000010u, 0xffffffffu}, {0x00000014u, 0x00000000u},
  {0x00000018u, 0x00000000u},
};

static_assert(ISAAC_RENDER_SHELL_A1A540_HOST_VA == 0x00a1a540u &&
              ISAAC_RENDER_SHELL_A1A540_END_VA == 0x00a1a57au &&
              ISAAC_RENDER_SHELL_A1A540_NEXT_VA == 0x00a1a580u &&
              ISAAC_RENDER_SHELL_A1A580_HOST_VA == 0x00a1a580u &&
              ISAAC_RENDER_SHELL_A1A580_END_VA == 0x00a1a5bfu &&
              ISAAC_RENDER_SHELL_A1A580_NEXT_VA == 0x00a1a5c0u &&
              ISAAC_RENDER_SHELL_A1A5C0_HOST_VA == 0x00a1a5c0u &&
              ISAAC_RENDER_SHELL_A1A5C0_END_VA == 0x00a1a5ccu &&
              ISAAC_RENDER_SHELL_A1A5C0_NEXT_VA == 0x00a1a5d0u &&
              ISAAC_RENDER_SHELL_A1A5D0_HOST_VA == 0x00a1a5d0u &&
              ISAAC_RENDER_SHELL_A1A5D0_END_VA == 0x00a1a5dfu &&
              ISAAC_RENDER_SHELL_A1A5D0_NEXT_VA == 0x00a1a5e0u &&
              ISAAC_RENDER_SHELL_A1A5E0_HOST_VA == 0x00a1a5e0u &&
              ISAAC_RENDER_SHELL_A1A5E0_END_VA == 0x00a1a5e5u &&
              ISAAC_RENDER_SHELL_A1A5E0_NEXT_VA == 0x00a1a5f0u &&
              ISAAC_RENDER_SHELL_A1A5F0_HOST_VA == 0x00a1a5f0u &&
              ISAAC_RENDER_SHELL_A1A5F0_END_VA == 0x00a1a5f8u &&
              ISAAC_RENDER_SHELL_A1A5F0_NEXT_VA == 0x00a1a600u &&
              ISAAC_RENDER_SHELL_HOST_A1A2E0_VA == 0x00a1a2e0u &&
              ISAAC_RENDER_SHELL_HOST_A1A2E0_END_VA == 0x00a1a461u &&
              ISAAC_RENDER_SHELL_HOST_A1A2E0_NEXT_VA == 0x00a1a470u &&
              ISAAC_RENDER_SHELL_HOST_A1A470_VA == 0x00a1a470u &&
              ISAAC_RENDER_SHELL_HOST_A1A470_END_VA == 0x00a1a4f7u &&
              ISAAC_RENDER_SHELL_HOST_A1A470_NEXT_VA == 0x00a1a500u &&
              ISAAC_RENDER_SHELL_HOST_A1A500_VA == 0x00a1a500u &&
              ISAAC_RENDER_SHELL_HOST_A1A500_END_VA == 0x00a1a533u &&
              ISAAC_RENDER_SHELL_HOST_A1A500_NEXT_VA == 0x00a1a540u &&
              ISAAC_RENDER_SHELL_A1A160_BAND_START_VA == 0x00a1a160u &&
              ISAAC_RENDER_SHELL_A1A160_BAND_END_VA == 0x00a1a600u,
              "v69 a1a160 band spans (census + NOTES)");

static_assert(ISAAC_RENDER_SHELL_A1A540_CALLER_COUNT == 0x0fu &&
              ISAAC_RENDER_SHELL_A1A540_CALLER_FIRST_VA == 0x00430656u &&
              ISAAC_RENDER_SHELL_A1A540_CALLER_LAST_VA == 0x009b8312u &&
              ISAAC_RENDER_SHELL_A1A580_CALLER_COUNT == 0x6u &&
              ISAAC_RENDER_SHELL_A1A580_CALLER_FIRST_VA == 0x006fc4b1u &&
              ISAAC_RENDER_SHELL_A1A580_CALLER_LAST_VA == 0x009c53bbu &&
              ISAAC_RENDER_SHELL_A1A5C0_CALLER_COUNT == 0x0u &&
              ISAAC_RENDER_SHELL_A1A5C0_ADDR_TAKEN_COUNT == 0x1u &&
              ISAAC_RENDER_SHELL_A1A5C0_ADDR_TAKEN_SITE_VA == 0x00866db2u &&
              ISAAC_RENDER_SHELL_A1A5D0_ADDR_TAKEN_SITE_VA == 0x00866ddcu &&
              ISAAC_RENDER_SHELL_A1A5E0_ADDR_TAKEN_SITE_VA == 0x00866df1u &&
              ISAAC_RENDER_SHELL_A1A5F0_ADDR_TAKEN_SITE_VA == 0x00866e1bu &&
              ISAAC_RENDER_SHELL_HOST_A1A2E0_CALLER_COUNT == 0x2u &&
              ISAAC_RENDER_SHELL_HOST_A1A2E0_CALLER_FIRST_VA == 0x00925d0eu &&
              ISAAC_RENDER_SHELL_HOST_A1A2E0_CALLER_LAST_VA == 0x00a196e8u &&
              ISAAC_RENDER_SHELL_HOST_A1A470_CALLER_COUNT == 0x2u &&
              ISAAC_RENDER_SHELL_HOST_A1A470_CALLER_FIRST_VA == 0x00925dd9u &&
              ISAAC_RENDER_SHELL_HOST_A1A470_CALLER_LAST_VA == 0x00a19b6cu &&
              ISAAC_RENDER_SHELL_HOST_A1A500_CALLER_COUNT == 0x1cu &&
              ISAAC_RENDER_SHELL_HOST_A1A500_CALLER_FIRST_VA == 0x00a18df5u &&
              ISAAC_RENDER_SHELL_HOST_A1A500_CALLER_LAST_VA == 0x00b16fbbu &&
              ISAAC_RENDER_SHELL_A1A160_BAND_OPEN_BODIES == 0x0u &&
              ISAAC_RENDER_SHELL_A1A160_BAND_HOST_ROWS == 0x3u &&
              ISAAC_RENDER_SHELL_A1A160_BAND_PURE_BODIES == 0x6u,
              "v69 a1a160 band callers/addr-taken (raw byte-scan)");

static_assert(ISAAC_RENDER_SHELL_A1A540_FIELD_COUNT == 0x7u &&
              ISAAC_RENDER_SHELL_A1A540_ALIGNMENT_OFF == 0x00u &&
              ISAAC_RENDER_SHELL_A1A540_MAX_CHARS_OFF == 0x04u &&
              ISAAC_RENDER_SHELL_A1A540_MODE_OFF == 0x08u &&
              ISAAC_RENDER_SHELL_A1A540_SCALE_OFF == 0x0cu &&
              ISAAC_RENDER_SHELL_A1A540_UNK10_OFF == 0x10u &&
              ISAAC_RENDER_SHELL_A1A540_UNK14_OFF == 0x14u &&
              ISAAC_RENDER_SHELL_A1A540_UNK18_OFF == 0x18u &&
              ISAAC_RENDER_SHELL_A1A540_MAX_CHARS_DEFAULT == 0x0000ffffu &&
              ISAAC_RENDER_SHELL_A1A540_SCALE_DEFAULT_BITS == 0x3f800000u &&
              ISAAC_RENDER_SHELL_A1A540_UNK10_DEFAULT == 0xffffffffu &&
              ISAAC_RENDER_SHELL_A1A580_ARG_OFF == 0x00u &&
              ISAAC_RENDER_SHELL_A1A5C0_DEST_OFF == 0x00u &&
              ISAAC_RENDER_SHELL_A1A5D0_DEST_OFF == 0x04u &&
              ISAAC_RENDER_SHELL_A1A5D0_WORD_MASK == 0x0000ffffu &&
              ISAAC_RENDER_SHELL_A1A5E0_SRC_OFF == 0x04u &&
              ISAAC_RENDER_SHELL_A1A5E0_WORD_MASK == 0x0000ffffu &&
              ISAAC_RENDER_SHELL_A1A5F0_CMP_OFF == 0x08u &&
              ISAAC_RENDER_SHELL_A1A5F0_CMP_VAL == 0x1u,
              "v69 FontSettings layout laws (PE stores/cmp)");

extern "C" uint32_t isaac_render_shell_a1a540_field_off(uint32_t idx) {
  if (idx >= ISAAC_RENDER_SHELL_A1A540_FIELD_COUNT) return 0u;
  return kRenderShellA1a540Fields[idx][0];
}

extern "C" uint32_t isaac_render_shell_a1a540_field_default(uint32_t idx) {
  if (idx >= ISAAC_RENDER_SHELL_A1A540_FIELD_COUNT) return 0u;
  return kRenderShellA1a540Fields[idx][1];
}

extern "C" uint32_t isaac_render_shell_a1a540_host_va(void) {
  return ISAAC_RENDER_SHELL_A1A540_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a1a540_end_va(void) {
  return ISAAC_RENDER_SHELL_A1A540_END_VA;
}

extern "C" uint32_t isaac_render_shell_a1a540_next_va(void) {
  return ISAAC_RENDER_SHELL_A1A540_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a1a540_caller_count(void) {
  return ISAAC_RENDER_SHELL_A1A540_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_a1a540_caller_first_va(void) {
  return ISAAC_RENDER_SHELL_A1A540_CALLER_FIRST_VA;
}

extern "C" uint32_t isaac_render_shell_a1a540_caller_last_va(void) {
  return ISAAC_RENDER_SHELL_A1A540_CALLER_LAST_VA;
}

extern "C" uint32_t isaac_render_shell_a1a540_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A1A540_ADDR_TAKEN_COUNT;
}

extern "C" uint32_t isaac_render_shell_a1a540_eax_writes(void) {
  return ISAAC_RENDER_SHELL_A1A540_EAX_WRITES;
}

extern "C" uint32_t isaac_render_shell_a1a540_stack_args(void) {
  return ISAAC_RENDER_SHELL_A1A540_STACK_ARGS;
}

extern "C" uint32_t isaac_render_shell_a1a540_this_call(void) {
  return ISAAC_RENDER_SHELL_A1A540_THISCALL;
}

extern "C" uint32_t isaac_render_shell_a1a540_field_count(void) {
  return ISAAC_RENDER_SHELL_A1A540_FIELD_COUNT;
}

extern "C" uint32_t isaac_render_shell_a1a540_alignment_off(void) {
  return ISAAC_RENDER_SHELL_A1A540_ALIGNMENT_OFF;
}

extern "C" uint32_t isaac_render_shell_a1a540_max_chars_off(void) {
  return ISAAC_RENDER_SHELL_A1A540_MAX_CHARS_OFF;
}

extern "C" uint32_t isaac_render_shell_a1a540_mode_off(void) {
  return ISAAC_RENDER_SHELL_A1A540_MODE_OFF;
}

extern "C" uint32_t isaac_render_shell_a1a540_scale_off(void) {
  return ISAAC_RENDER_SHELL_A1A540_SCALE_OFF;
}

extern "C" uint32_t isaac_render_shell_a1a540_unk10_off(void) {
  return ISAAC_RENDER_SHELL_A1A540_UNK10_OFF;
}

extern "C" uint32_t isaac_render_shell_a1a540_unk14_off(void) {
  return ISAAC_RENDER_SHELL_A1A540_UNK14_OFF;
}

extern "C" uint32_t isaac_render_shell_a1a540_unk18_off(void) {
  return ISAAC_RENDER_SHELL_A1A540_UNK18_OFF;
}

extern "C" uint32_t isaac_render_shell_a1a540_max_chars_default(void) {
  return ISAAC_RENDER_SHELL_A1A540_MAX_CHARS_DEFAULT;
}

extern "C" uint32_t isaac_render_shell_a1a540_scale_default_bits(void) {
  return ISAAC_RENDER_SHELL_A1A540_SCALE_DEFAULT_BITS;
}

extern "C" uint32_t isaac_render_shell_a1a540_unk10_default(void) {
  return ISAAC_RENDER_SHELL_A1A540_UNK10_DEFAULT;
}

extern "C" uint32_t isaac_render_shell_a1a580_field_off(uint32_t idx) {
  if (idx >= ISAAC_RENDER_SHELL_A1A580_FIELD_COUNT) return 0u;
  return kRenderShellA1a540Fields[idx][0];
}

extern "C" uint32_t isaac_render_shell_a1a580_field_default(uint32_t idx) {
  if (idx >= ISAAC_RENDER_SHELL_A1A580_FIELD_COUNT) return 0u;
  return kRenderShellA1a540Fields[idx][1];
}

extern "C" uint32_t isaac_render_shell_a1a580_host_va(void) {
  return ISAAC_RENDER_SHELL_A1A580_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a1a580_end_va(void) {
  return ISAAC_RENDER_SHELL_A1A580_END_VA;
}

extern "C" uint32_t isaac_render_shell_a1a580_next_va(void) {
  return ISAAC_RENDER_SHELL_A1A580_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a1a580_caller_count(void) {
  return ISAAC_RENDER_SHELL_A1A580_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_a1a580_caller_first_va(void) {
  return ISAAC_RENDER_SHELL_A1A580_CALLER_FIRST_VA;
}

extern "C" uint32_t isaac_render_shell_a1a580_caller_last_va(void) {
  return ISAAC_RENDER_SHELL_A1A580_CALLER_LAST_VA;
}

extern "C" uint32_t isaac_render_shell_a1a580_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A1A580_ADDR_TAKEN_COUNT;
}

extern "C" uint32_t isaac_render_shell_a1a580_eax_writes(void) {
  return ISAAC_RENDER_SHELL_A1A580_EAX_WRITES;
}

extern "C" uint32_t isaac_render_shell_a1a580_stack_args(void) {
  return ISAAC_RENDER_SHELL_A1A580_STACK_ARGS;
}

extern "C" uint32_t isaac_render_shell_a1a580_this_call(void) {
  return ISAAC_RENDER_SHELL_A1A580_THISCALL;
}

extern "C" uint32_t isaac_render_shell_a1a580_field_count(void) {
  return ISAAC_RENDER_SHELL_A1A580_FIELD_COUNT;
}

extern "C" uint32_t isaac_render_shell_a1a580_arg_off(void) {
  return ISAAC_RENDER_SHELL_A1A580_ARG_OFF;
}

extern "C" uint32_t isaac_render_shell_a1a5c0_host_va(void) {
  return ISAAC_RENDER_SHELL_A1A5C0_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a1a5c0_end_va(void) {
  return ISAAC_RENDER_SHELL_A1A5C0_END_VA;
}

extern "C" uint32_t isaac_render_shell_a1a5c0_next_va(void) {
  return ISAAC_RENDER_SHELL_A1A5C0_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a1a5c0_caller_count(void) {
  return ISAAC_RENDER_SHELL_A1A5C0_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_a1a5c0_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A1A5C0_ADDR_TAKEN_COUNT;
}

extern "C" uint32_t isaac_render_shell_a1a5c0_addr_taken_site_va(void) {
  return ISAAC_RENDER_SHELL_A1A5C0_ADDR_TAKEN_SITE_VA;
}

extern "C" uint32_t isaac_render_shell_a1a5c0_eax_writes(void) {
  return ISAAC_RENDER_SHELL_A1A5C0_EAX_WRITES;
}

extern "C" uint32_t isaac_render_shell_a1a5c0_stack_args(void) {
  return ISAAC_RENDER_SHELL_A1A5C0_STACK_ARGS;
}

extern "C" uint32_t isaac_render_shell_a1a5c0_this_call(void) {
  return ISAAC_RENDER_SHELL_A1A5C0_THISCALL;
}

extern "C" uint32_t isaac_render_shell_a1a5c0_dest_off(void) {
  return ISAAC_RENDER_SHELL_A1A5C0_DEST_OFF;
}

extern "C" uint32_t isaac_render_shell_a1a5d0_host_va(void) {
  return ISAAC_RENDER_SHELL_A1A5D0_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a1a5d0_end_va(void) {
  return ISAAC_RENDER_SHELL_A1A5D0_END_VA;
}

extern "C" uint32_t isaac_render_shell_a1a5d0_next_va(void) {
  return ISAAC_RENDER_SHELL_A1A5D0_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a1a5d0_caller_count(void) {
  return ISAAC_RENDER_SHELL_A1A5D0_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_a1a5d0_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A1A5D0_ADDR_TAKEN_COUNT;
}

extern "C" uint32_t isaac_render_shell_a1a5d0_addr_taken_site_va(void) {
  return ISAAC_RENDER_SHELL_A1A5D0_ADDR_TAKEN_SITE_VA;
}

extern "C" uint32_t isaac_render_shell_a1a5d0_eax_writes(void) {
  return ISAAC_RENDER_SHELL_A1A5D0_EAX_WRITES;
}

extern "C" uint32_t isaac_render_shell_a1a5d0_stack_args(void) {
  return ISAAC_RENDER_SHELL_A1A5D0_STACK_ARGS;
}

extern "C" uint32_t isaac_render_shell_a1a5d0_this_call(void) {
  return ISAAC_RENDER_SHELL_A1A5D0_THISCALL;
}

extern "C" uint32_t isaac_render_shell_a1a5d0_dest_off(void) {
  return ISAAC_RENDER_SHELL_A1A5D0_DEST_OFF;
}

extern "C" uint32_t isaac_render_shell_a1a5d0_word_mask(void) {
  return ISAAC_RENDER_SHELL_A1A5D0_WORD_MASK;
}

extern "C" uint32_t isaac_render_shell_a1a5e0_host_va(void) {
  return ISAAC_RENDER_SHELL_A1A5E0_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a1a5e0_end_va(void) {
  return ISAAC_RENDER_SHELL_A1A5E0_END_VA;
}

extern "C" uint32_t isaac_render_shell_a1a5e0_next_va(void) {
  return ISAAC_RENDER_SHELL_A1A5E0_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a1a5e0_caller_count(void) {
  return ISAAC_RENDER_SHELL_A1A5E0_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_a1a5e0_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A1A5E0_ADDR_TAKEN_COUNT;
}

extern "C" uint32_t isaac_render_shell_a1a5e0_addr_taken_site_va(void) {
  return ISAAC_RENDER_SHELL_A1A5E0_ADDR_TAKEN_SITE_VA;
}

extern "C" uint32_t isaac_render_shell_a1a5e0_eax_writes(void) {
  return ISAAC_RENDER_SHELL_A1A5E0_EAX_WRITES;
}

extern "C" uint32_t isaac_render_shell_a1a5e0_stack_args(void) {
  return ISAAC_RENDER_SHELL_A1A5E0_STACK_ARGS;
}

extern "C" uint32_t isaac_render_shell_a1a5e0_this_call(void) {
  return ISAAC_RENDER_SHELL_A1A5E0_THISCALL;
}

extern "C" uint32_t isaac_render_shell_a1a5e0_src_off(void) {
  return ISAAC_RENDER_SHELL_A1A5E0_SRC_OFF;
}

extern "C" uint32_t isaac_render_shell_a1a5e0_word_mask(void) {
  return ISAAC_RENDER_SHELL_A1A5E0_WORD_MASK;
}

extern "C" uint32_t isaac_render_shell_a1a5f0_host_va(void) {
  return ISAAC_RENDER_SHELL_A1A5F0_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a1a5f0_end_va(void) {
  return ISAAC_RENDER_SHELL_A1A5F0_END_VA;
}

extern "C" uint32_t isaac_render_shell_a1a5f0_next_va(void) {
  return ISAAC_RENDER_SHELL_A1A5F0_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a1a5f0_caller_count(void) {
  return ISAAC_RENDER_SHELL_A1A5F0_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_a1a5f0_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A1A5F0_ADDR_TAKEN_COUNT;
}

extern "C" uint32_t isaac_render_shell_a1a5f0_addr_taken_site_va(void) {
  return ISAAC_RENDER_SHELL_A1A5F0_ADDR_TAKEN_SITE_VA;
}

extern "C" uint32_t isaac_render_shell_a1a5f0_eax_writes(void) {
  return ISAAC_RENDER_SHELL_A1A5F0_EAX_WRITES;
}

extern "C" uint32_t isaac_render_shell_a1a5f0_stack_args(void) {
  return ISAAC_RENDER_SHELL_A1A5F0_STACK_ARGS;
}

extern "C" uint32_t isaac_render_shell_a1a5f0_this_call(void) {
  return ISAAC_RENDER_SHELL_A1A5F0_THISCALL;
}

extern "C" uint32_t isaac_render_shell_a1a5f0_cmp_off(void) {
  return ISAAC_RENDER_SHELL_A1A5F0_CMP_OFF;
}

extern "C" uint32_t isaac_render_shell_a1a5f0_cmp_val(void) {
  return ISAAC_RENDER_SHELL_A1A5F0_CMP_VAL;
}

extern "C" uint32_t isaac_render_shell_host_a1a2e0_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1A2E0_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1a2e0_end_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1A2E0_END_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1a2e0_next_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1A2E0_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1a2e0_caller_count(void) {
  return ISAAC_RENDER_SHELL_HOST_A1A2E0_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_host_a1a2e0_caller_first_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1A2E0_CALLER_FIRST_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1a2e0_caller_last_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1A2E0_CALLER_LAST_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1a2e0_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_HOST_A1A2E0_ADDR_TAKEN_COUNT;
}

extern "C" uint32_t isaac_render_shell_host_a1a470_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1A470_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1a470_end_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1A470_END_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1a470_next_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1A470_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1a470_caller_count(void) {
  return ISAAC_RENDER_SHELL_HOST_A1A470_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_host_a1a470_caller_first_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1A470_CALLER_FIRST_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1a470_caller_last_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1A470_CALLER_LAST_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1a470_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_HOST_A1A470_ADDR_TAKEN_COUNT;
}

extern "C" uint32_t isaac_render_shell_host_a1a500_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1A500_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1a500_end_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1A500_END_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1a500_next_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1A500_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1a500_caller_count(void) {
  return ISAAC_RENDER_SHELL_HOST_A1A500_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_host_a1a500_caller_first_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1A500_CALLER_FIRST_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1a500_caller_last_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1A500_CALLER_LAST_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1a500_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_HOST_A1A500_ADDR_TAKEN_COUNT;
}

extern "C" uint32_t isaac_render_shell_a1a160_band_start_va(void) {
  return ISAAC_RENDER_SHELL_A1A160_BAND_START_VA;
}

extern "C" uint32_t isaac_render_shell_a1a160_band_end_va(void) {
  return ISAAC_RENDER_SHELL_A1A160_BAND_END_VA;
}

extern "C" uint32_t isaac_render_shell_a1a160_band_open_bodies(void) {
  return ISAAC_RENDER_SHELL_A1A160_BAND_OPEN_BODIES;
}

extern "C" uint32_t isaac_render_shell_a1a160_band_host_rows(void) {
  return ISAAC_RENDER_SHELL_A1A160_BAND_HOST_ROWS;
}

extern "C" uint32_t isaac_render_shell_a1a160_band_pure_bodies(void) {
  return ISAAC_RENDER_SHELL_A1A160_BAND_PURE_BODIES;
}

/* ============================================================================
 * ABI v70: FontSettings next sub-band 0xa1a600..0xa1a63f (evidence
 * section-notes/render-shell-v70-fontsettings/NOTES.md). Three PURE
 * bodies + three HOST rows close the v69 OPEN marker.
 * ========================================================================== */

static_assert(ISAAC_RENDER_SHELL_A1A600_HOST_VA == 0x00a1a600u &&
              ISAAC_RENDER_SHELL_A1A600_END_VA == 0x00a1a616u &&
              ISAAC_RENDER_SHELL_A1A600_NEXT_VA == 0x00a1a620u &&
              ISAAC_RENDER_SHELL_A1A600_ADDR_TAKEN_SITE_VA == 0x00866e31u &&
              ISAAC_RENDER_SHELL_A1A600_STATE_OFF == 0x08u &&
              ISAAC_RENDER_SHELL_A1A600_STATE_VALUE == 0x2u &&
              ISAAC_RENDER_SHELL_A1A600_WORD_OFF == 0x06u &&
              ISAAC_RENDER_SHELL_A1A600_WORD_MASK == 0x0000ffffu &&
              ISAAC_RENDER_SHELL_A1A620_HOST_VA == 0x00a1a620u &&
              ISAAC_RENDER_SHELL_A1A620_END_VA == 0x00a1a628u &&
              ISAAC_RENDER_SHELL_A1A620_NEXT_VA == 0x00a1a630u &&
              ISAAC_RENDER_SHELL_A1A620_ADDR_TAKEN_SITE_VA == 0x00866e46u &&
              ISAAC_RENDER_SHELL_A1A620_CMP_OFF == 0x08u &&
              ISAAC_RENDER_SHELL_A1A620_CMP_VAL == 0x2u &&
              ISAAC_RENDER_SHELL_A1A630_HOST_VA == 0x00a1a630u &&
              ISAAC_RENDER_SHELL_A1A630_END_VA == 0x00a1a63du &&
              ISAAC_RENDER_SHELL_A1A630_NEXT_VA == 0x00a1a640u &&
              ISAAC_RENDER_SHELL_A1A630_ADDR_TAKEN_PUSH_SITE_VA == 0x00866e85u &&
              ISAAC_RENDER_SHELL_A1A630_ADDR_TAKEN_STORE_SITE_VA == 0x0089faf7u &&
              ISAAC_RENDER_SHELL_A1A630_DEST_OFF == 0x10u,
              "v70 FontSettings trio spans/laws (PE bytes)");

static_assert(ISAAC_RENDER_SHELL_A1A600_ADDR_TAKEN_COUNT == 0x1u &&
              ISAAC_RENDER_SHELL_A1A620_ADDR_TAKEN_COUNT == 0x1u &&
              ISAAC_RENDER_SHELL_A1A630_ADDR_TAKEN_COUNT == 0x2u &&
              ISAAC_RENDER_SHELL_HOST_A1A640_CALLER_COUNT == 0x12u &&
              ISAAC_RENDER_SHELL_HOST_A1A640_CALLER_FIRST_VA == 0x006f20b1u &&
              ISAAC_RENDER_SHELL_HOST_A1A640_CALLER_LAST_VA == 0x009b54d8u &&
              ISAAC_RENDER_SHELL_HOST_A1A6F0_CALLER_COUNT == 0x0u &&
              ISAAC_RENDER_SHELL_HOST_A1A6F0_JMP_TAIL_COUNT == 0x3u &&
              ISAAC_RENDER_SHELL_HOST_A1A6F0_JMP_TAIL_FIRST_VA == 0x00afb86fu &&
              ISAAC_RENDER_SHELL_HOST_A1A730_CALLER_COUNT == 0x11u &&
              ISAAC_RENDER_SHELL_HOST_A1A730_CALLER_FIRST_VA == 0x00840956u &&
              ISAAC_RENDER_SHELL_HOST_A1A730_CALLER_LAST_VA == 0x009efbf6u &&
              ISAAC_RENDER_SHELL_A1A600_BAND_START_VA == 0x00a1a600u &&
              ISAAC_RENDER_SHELL_A1A600_BAND_END_VA == 0x00a1a640u &&
              ISAAC_RENDER_SHELL_A1A600_BAND_OPEN_BODIES == 0x0u &&
              ISAAC_RENDER_SHELL_A1A600_BAND_PURE_BODIES == 0x3u &&
              ISAAC_RENDER_SHELL_A1A600_BAND_HOST_ROWS == 0x3u,
              "v70 trio reach + host rows (whole-.text census)");

extern "C" uint32_t isaac_render_shell_a1a600_host_va(void) {
  return ISAAC_RENDER_SHELL_A1A600_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a1a600_end_va(void) {
  return ISAAC_RENDER_SHELL_A1A600_END_VA;
}

extern "C" uint32_t isaac_render_shell_a1a600_next_va(void) {
  return ISAAC_RENDER_SHELL_A1A600_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a1a600_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A1A600_ADDR_TAKEN_COUNT;
}

extern "C" uint32_t isaac_render_shell_a1a600_addr_taken_site_va(void) {
  return ISAAC_RENDER_SHELL_A1A600_ADDR_TAKEN_SITE_VA;
}

extern "C" uint32_t isaac_render_shell_a1a600_stack_args(void) {
  return ISAAC_RENDER_SHELL_A1A600_STACK_ARGS;
}

extern "C" uint32_t isaac_render_shell_a1a600_this_call(void) {
  return ISAAC_RENDER_SHELL_A1A600_THISCALL;
}

extern "C" uint32_t isaac_render_shell_a1a600_state_off(void) {
  return ISAAC_RENDER_SHELL_A1A600_STATE_OFF;
}

/* a1a600 law: the ALWAYS state store value (dword [ecx+8] := 2). */
extern "C" uint32_t isaac_render_shell_a1a600_state_written(void) {
  return ISAAC_RENDER_SHELL_A1A600_STATE_VALUE;
}

extern "C" uint32_t isaac_render_shell_a1a600_word_off(void) {
  return ISAAC_RENDER_SHELL_A1A600_WORD_OFF;
}

/* a1a600 law: PE reads the arg as a WORD (`mov ax,[ebp+8]`) and stores
   a WORD (`mov word [ecx+6],ax`) — the in-body 0xffff mask. */
extern "C" uint32_t isaac_render_shell_a1a600_truncation_word(uint32_t arg) {
  return arg & ISAAC_RENDER_SHELL_A1A600_WORD_MASK;
}

/* a1a600 store law: state := 2 ALWAYS, then word := masked arg. */
extern "C" uint32_t isaac_render_shell_a1a600_apply(uint32_t* state8,
                                                    uint32_t* word6,
                                                    uint32_t arg) {
  *state8 = ISAAC_RENDER_SHELL_A1A600_STATE_VALUE;
  *word6 = arg & ISAAC_RENDER_SHELL_A1A600_WORD_MASK;
  return *word6;
}

extern "C" uint32_t isaac_render_shell_a1a620_host_va(void) {
  return ISAAC_RENDER_SHELL_A1A620_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a1a620_end_va(void) {
  return ISAAC_RENDER_SHELL_A1A620_END_VA;
}

extern "C" uint32_t isaac_render_shell_a1a620_next_va(void) {
  return ISAAC_RENDER_SHELL_A1A620_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a1a620_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A1A620_ADDR_TAKEN_COUNT;
}

extern "C" uint32_t isaac_render_shell_a1a620_addr_taken_site_va(void) {
  return ISAAC_RENDER_SHELL_A1A620_ADDR_TAKEN_SITE_VA;
}

extern "C" uint32_t isaac_render_shell_a1a620_stack_args(void) {
  return ISAAC_RENDER_SHELL_A1A620_STACK_ARGS;
}

extern "C" uint32_t isaac_render_shell_a1a620_this_call(void) {
  return ISAAC_RENDER_SHELL_A1A620_THISCALL;
}

extern "C" uint32_t isaac_render_shell_a1a620_cmp_off(void) {
  return ISAAC_RENDER_SHELL_A1A620_CMP_OFF;
}

extern "C" uint32_t isaac_render_shell_a1a620_cmp_val(void) {
  return ISAAC_RENDER_SHELL_A1A620_CMP_VAL;
}

/* a1a620 law: `cmp dword [ecx+8],2 ; sete al ; ret` (PE 83 79 08 02 /
   0f 94 c0 / c3). FULL-dword gate, byte 0/1 result, no normalize. */
extern "C" uint32_t isaac_render_shell_a1a620_is_truncation_enabled(uint32_t state_8) {
  return (state_8 == ISAAC_RENDER_SHELL_A1A620_CMP_VAL) ? 1u : 0u;
}

extern "C" uint32_t isaac_render_shell_a1a630_host_va(void) {
  return ISAAC_RENDER_SHELL_A1A630_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a1a630_end_va(void) {
  return ISAAC_RENDER_SHELL_A1A630_END_VA;
}

extern "C" uint32_t isaac_render_shell_a1a630_next_va(void) {
  return ISAAC_RENDER_SHELL_A1A630_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a1a630_addr_taken_count(void) {
  return ISAAC_RENDER_SHELL_A1A630_ADDR_TAKEN_COUNT;
}

extern "C" uint32_t isaac_render_shell_a1a630_addr_taken_push_site_va(void) {
  return ISAAC_RENDER_SHELL_A1A630_ADDR_TAKEN_PUSH_SITE_VA;
}

extern "C" uint32_t isaac_render_shell_a1a630_addr_taken_store_site_va(void) {
  return ISAAC_RENDER_SHELL_A1A630_ADDR_TAKEN_STORE_SITE_VA;
}

extern "C" uint32_t isaac_render_shell_a1a630_stack_args(void) {
  return ISAAC_RENDER_SHELL_A1A630_STACK_ARGS;
}

extern "C" uint32_t isaac_render_shell_a1a630_this_call(void) {
  return ISAAC_RENDER_SHELL_A1A630_THISCALL;
}

extern "C" uint32_t isaac_render_shell_a1a630_dest_off(void) {
  return ISAAC_RENDER_SHELL_A1A630_DEST_OFF;
}

/* a1a630 law: the override moves FULL-dword (`mov eax,[ebp+8]` +
   `mov [ecx+0x10],eax`) — identity passthrough, NO word mask. */
extern "C" uint32_t isaac_render_shell_a1a630_override_value(uint32_t arg) {
  return arg;
}

/* a1a630 store law: dword [ecx+0x10] := arg. */
extern "C" uint32_t isaac_render_shell_a1a630_apply(uint32_t* dest10, uint32_t arg) {
  *dest10 = arg;
  return arg;
}

extern "C" uint32_t isaac_render_shell_host_a1a640_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1A640_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1a640_end_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1A640_END_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1a640_next_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1A640_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1a640_caller_count(void) {
  return ISAAC_RENDER_SHELL_HOST_A1A640_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_host_a1a640_caller_first_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1A640_CALLER_FIRST_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1a640_caller_last_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1A640_CALLER_LAST_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1a6f0_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1A6F0_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1a6f0_end_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1A6F0_END_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1a6f0_next_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1A6F0_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1a6f0_caller_count(void) {
  return ISAAC_RENDER_SHELL_HOST_A1A6F0_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_host_a1a6f0_jmp_tail_count(void) {
  return ISAAC_RENDER_SHELL_HOST_A1A6F0_JMP_TAIL_COUNT;
}

extern "C" uint32_t isaac_render_shell_host_a1a6f0_jmp_tail_first_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1A6F0_JMP_TAIL_FIRST_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1a730_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1A730_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1a730_end_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1A730_END_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1a730_next_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1A730_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1a730_caller_count(void) {
  return ISAAC_RENDER_SHELL_HOST_A1A730_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_host_a1a730_caller_first_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1A730_CALLER_FIRST_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1a730_caller_last_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1A730_CALLER_LAST_VA;
}

extern "C" uint32_t isaac_render_shell_a1a600_band_start_va(void) {
  return ISAAC_RENDER_SHELL_A1A600_BAND_START_VA;
}

extern "C" uint32_t isaac_render_shell_a1a600_band_end_va(void) {
  return ISAAC_RENDER_SHELL_A1A600_BAND_END_VA;
}

extern "C" uint32_t isaac_render_shell_a1a600_band_open_bodies(void) {
  return ISAAC_RENDER_SHELL_A1A600_BAND_OPEN_BODIES;
}

extern "C" uint32_t isaac_render_shell_a1a600_band_pure_bodies(void) {
  return ISAAC_RENDER_SHELL_A1A600_BAND_PURE_BODIES;
}

extern "C" uint32_t isaac_render_shell_a1a600_band_host_rows(void) {
  return ISAAC_RENDER_SHELL_A1A600_BAND_HOST_ROWS;
}
/* ============================================================================
 * ABI v71: std::sort cluster band 0xa1c480..0xa1d600. Two PURE laws landed
 * (heap adjust 0xa1d4d0, med3 0xa1d5a0) + census pins for the host rows
 * 0xa1c480 / 0xa1c7d0 / 0xa1cea0 / 0xa1cfa0 and the pinned partition body
 * 0xa1d280. See the header block for the PE evidence.
 * ========================================================================== */

static void isaac_render_shell_v71_swap16(uint32_t* p, uint32_t* q) {
  uint32_t tmp[4];
  tmp[0] = p[0]; tmp[1] = p[1]; tmp[2] = p[2]; tmp[3] = p[3];
  p[0] = q[0]; p[1] = q[1]; p[2] = q[2]; p[3] = q[3];
  q[0] = tmp[0]; q[1] = tmp[1]; q[2] = tmp[2]; q[3] = tmp[3];
}

/* Key = uint64 at [+0,+8): hi dword at byte +4, lo dword at byte +0,
 * unsigned compare. The enum offsets are BYTES; uint32_t access needs the
 * dword index (off / 4). */
static int isaac_render_shell_v71_key_lt(const uint32_t* p,
                                         const uint32_t* q) {
  const uint32_t hi = ISAAC_RENDER_SHELL_A1D5A0_KEY_HI_OFF / 4u;
  const uint32_t lo = ISAAC_RENDER_SHELL_A1D5A0_KEY_LO_OFF / 4u;
  if (p[hi] < q[hi]) {
    return 1;
  }
  if (p[hi] > q[hi]) {
    return 0;
  }
  return p[lo] < q[lo];
}

extern "C" uint32_t isaac_render_shell_a1d5a0_med3_apply(uint32_t* a,
                                                         uint32_t* b,
                                                         uint32_t* c) {
  /* PE 0xa1d5a0: step1 `if (key(b) < key(a)) swap(a,b)`; step2
   * `if (key(c) < key(b)) { swap(b,c); step3 }` -- the MSVC else-return
   * skips step 3 when step 2 does not swap (VA 0xa1d5cc/0xa1d5d2 jae
   * straight to the epilog); step3 `if (key(b) < key(a)) swap(a,b)`. */
  if (isaac_render_shell_v71_key_lt(b, a)) {
    isaac_render_shell_v71_swap16(a, b);
  }
  if (isaac_render_shell_v71_key_lt(c, b)) {
    isaac_render_shell_v71_swap16(b, c);
    if (isaac_render_shell_v71_key_lt(b, a)) {
      isaac_render_shell_v71_swap16(a, b);
    }
  }
  return (uint32_t)(uintptr_t)b;
}

extern "C" uint32_t isaac_render_shell_a1d4d0_adjust_heap(uint32_t base,
                                                          int32_t hole,
                                                          int32_t count,
                                                          uint32_t val) {
  uint32_t* const arr = (uint32_t*)(uintptr_t)base;
  uint32_t* const value = (uint32_t*)(uintptr_t)val;
  const uint32_t elems = ISAAC_RENDER_SHELL_A1D4D0_ELEM_SIZE / 4u;
  const int32_t last = count - 1;
  /* PE `sar ebx,1` on the signed count-1 (VA 0xa1d4e6). */
  const int32_t half = last >> 1;
  const int32_t hole0 = hole; /* PE saves the entry hole at [ebp-4]. */
  int32_t cur = hole;
  /* Down phase: while hole < half, pick the larger child (ties pick the
   * higher index: VA 0xa1d4fb..0xa1d519, jae -> pick 2) and move it up
   * into the hole (VA 0xa1d51e..0xa1d52a: child elem -> arr[cur]). */
  while (cur < half) {
    const uint32_t* const left = arr + (uint32_t)(cur * 2) * elems;
    const uint32_t* const right = left + elems;      /* elem[2h+1] */
    const uint32_t* const right2 = left + 2 * elems; /* elem[2h+2] */
    const uint32_t khi = ISAAC_RENDER_SHELL_A1D4D0_KEY_HI_OFF / 4u;
    const uint32_t klo = ISAAC_RENDER_SHELL_A1D4D0_KEY_LO_OFF / 4u;
    int32_t pick;
    if (right2[khi] > right[khi]) {
      pick = 2;
    } else if (right2[khi] < right[khi]) {
      pick = 1;
    } else if (right2[klo] >= right[klo]) {
      pick = 2;
    } else {
      pick = 1;
    }
    const int32_t child = cur * 2 + pick;
    /* movups copy of elem[child] into elem[cur]. */
    uint32_t* const dst = arr + (uint32_t)cur * elems;
    const uint32_t* const src = arr + (uint32_t)child * elems;
    dst[0] = src[0]; dst[1] = src[1]; dst[2] = src[2]; dst[3] = src[3];
    cur = child;
  }
  /* Special case (VA 0xa1d536..0xa1d54b): when the down phase stopped with
   * cur == half and count is EVEN (`test al,1` on the reloaded [ebp+8]
   * count low bit), move elem[count-1] up into the hole and continue from
   * hole = count-1. */
  /* count > 0 is a wasm-safety guard; every PE call site (B4) passes
   * count >= 1, so the guard is unreachable in practice. */
  if (cur == half && (count & 1) == 0 && count > 0) {
    uint32_t* const dst = arr + (uint32_t)cur * elems;
    const uint32_t* const src =
        arr + (uint32_t)(count - 1) * elems;
    dst[0] = src[0]; dst[1] = src[1]; dst[2] = src[2]; dst[3] = src[3];
    cur = last;
  }
  /* Up phase (VA 0xa1d54e..0xa1d57f): walk parents while hole0 < parent,
   * stop when the parent key >= value key, moving each parent DOWN into
   * the hole. */
  const uint32_t vhi = ISAAC_RENDER_SHELL_A1D4D0_KEY_HI_OFF / 4u;
  const uint32_t vlo = ISAAC_RENDER_SHELL_A1D4D0_KEY_LO_OFF / 4u;
  while (hole0 < cur) {
    const int32_t parent = (cur - 1) >> 1; /* PE sar ecx,1 signed */
    const uint32_t* const pe = arr + (uint32_t)parent * elems;
    if (pe[vhi] > value[vhi]) {
      break;
    }
    if (pe[vhi] == value[vhi] && pe[vlo] >= value[vlo]) {
      break;
    }
    uint32_t* const dst = arr + (uint32_t)cur * elems;
    dst[0] = pe[0]; dst[1] = pe[1]; dst[2] = pe[2]; dst[3] = pe[3];
    cur = parent;
  }
  /* Final store: elem[hole] = value (VA 0xa1d581..0xa1d586). */
  {
    uint32_t* const dst = arr + (uint32_t)cur * elems;
    dst[0] = value[0]; dst[1] = value[1];
    dst[2] = value[2]; dst[3] = value[3];
  }
  return (uint32_t)cur;
}

/* v71 census pin getters. */
extern "C" uint32_t isaac_render_shell_host_a1c480_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1C480_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1c480_end_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1C480_END_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1c480_next_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1C480_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1c480_caller_count(void) {
  return ISAAC_RENDER_SHELL_HOST_A1C480_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_host_a1c480_caller_first_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1C480_CALLER_FIRST_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1c480_caller_last_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1C480_CALLER_LAST_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1c480_seh_fs_probes(void) {
  return ISAAC_RENDER_SHELL_HOST_A1C480_SEH_FS_PROBES;
}

extern "C" uint32_t isaac_render_shell_host_a1c480_ret_imm(void) {
  return ISAAC_RENDER_SHELL_HOST_A1C480_RET_IMM;
}

extern "C" uint32_t isaac_render_shell_host_a1c7d0_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1C7D0_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1c7d0_end_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1C7D0_END_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1c7d0_next_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1C7D0_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1c7d0_caller_count(void) {
  return ISAAC_RENDER_SHELL_HOST_A1C7D0_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_host_a1c7d0_caller_first_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1C7D0_CALLER_FIRST_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1c7d0_caller_last_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1C7D0_CALLER_LAST_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1c7d0_jump_table_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1C7D0_JUMP_TABLE_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1c7d0_jump_table_entries(void) {
  return ISAAC_RENDER_SHELL_HOST_A1C7D0_JUMP_TABLE_ENTRIES;
}

extern "C" uint32_t isaac_render_shell_host_a1c7d0_e8_count(void) {
  return ISAAC_RENDER_SHELL_HOST_A1C7D0_E8_COUNT;
}

extern "C" uint32_t isaac_render_shell_host_a1c7d0_ret_imm(void) {
  return ISAAC_RENDER_SHELL_HOST_A1C7D0_RET_IMM;
}

extern "C" uint32_t isaac_render_shell_host_a1cea0_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1CEA0_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1cea0_end_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1CEA0_END_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1cea0_next_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1CEA0_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1cea0_caller_count(void) {
  return ISAAC_RENDER_SHELL_HOST_A1CEA0_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_host_a1cea0_caller_only_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1CEA0_CALLER_ONLY_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1cea0_ret_imm(void) {
  return ISAAC_RENDER_SHELL_HOST_A1CEA0_RET_IMM;
}

extern "C" uint32_t isaac_render_shell_host_a1cfa0_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1CFA0_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1cfa0_end_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1CFA0_END_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1cfa0_next_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1CFA0_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1cfa0_caller_count(void) {
  return ISAAC_RENDER_SHELL_HOST_A1CFA0_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_host_a1cfa0_self_call_sites(void) {
  return ISAAC_RENDER_SHELL_HOST_A1CFA0_SELF_CALL_SITES;
}

extern "C" uint32_t isaac_render_shell_host_a1cfa0_caller_first_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1CFA0_CALLER_FIRST_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1cfa0_caller_last_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1CFA0_CALLER_LAST_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1cfa0_cookie_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1CFA0_COOKIE_VA;
}

extern "C" uint32_t isaac_render_shell_a1d280_va(void) {
  return ISAAC_RENDER_SHELL_A1D280_VA;
}

extern "C" uint32_t isaac_render_shell_a1d280_end_va(void) {
  return ISAAC_RENDER_SHELL_A1D280_END_VA;
}

extern "C" uint32_t isaac_render_shell_a1d280_next_va(void) {
  return ISAAC_RENDER_SHELL_A1D280_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a1d280_caller_count(void) {
  return ISAAC_RENDER_SHELL_A1D280_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_a1d280_caller_site_va(void) {
  return ISAAC_RENDER_SHELL_A1D280_CALLER_SITE_VA;
}

extern "C" uint32_t isaac_render_shell_a1d280_callee_va(void) {
  return ISAAC_RENDER_SHELL_A1D280_CALLEE_VA;
}

extern "C" uint32_t isaac_render_shell_a1d280_callee_site_count(void) {
  return ISAAC_RENDER_SHELL_A1D280_CALLEE_SITE_COUNT;
}

extern "C" uint32_t isaac_render_shell_a1d4d0_host_va(void) {
  return ISAAC_RENDER_SHELL_A1D4D0_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a1d4d0_end_va(void) {
  return ISAAC_RENDER_SHELL_A1D4D0_END_VA;
}

extern "C" uint32_t isaac_render_shell_a1d4d0_next_va(void) {
  return ISAAC_RENDER_SHELL_A1D4D0_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a1d4d0_elem_size(void) {
  return ISAAC_RENDER_SHELL_A1D4D0_ELEM_SIZE;
}

extern "C" uint32_t isaac_render_shell_a1d4d0_key_hi_off(void) {
  return ISAAC_RENDER_SHELL_A1D4D0_KEY_HI_OFF;
}

extern "C" uint32_t isaac_render_shell_a1d4d0_key_lo_off(void) {
  return ISAAC_RENDER_SHELL_A1D4D0_KEY_LO_OFF;
}

extern "C" uint32_t isaac_render_shell_a1d4d0_caller_count(void) {
  return ISAAC_RENDER_SHELL_A1D4D0_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_a1d4d0_caller_site_va(void) {
  return ISAAC_RENDER_SHELL_A1D4D0_CALLER_SITE_VA;
}

extern "C" uint32_t isaac_render_shell_a1d5a0_host_va(void) {
  return ISAAC_RENDER_SHELL_A1D5A0_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a1d5a0_end_va(void) {
  return ISAAC_RENDER_SHELL_A1D5A0_END_VA;
}

extern "C" uint32_t isaac_render_shell_a1d5a0_next_va(void) {
  return ISAAC_RENDER_SHELL_A1D5A0_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a1d5a0_elem_size(void) {
  return ISAAC_RENDER_SHELL_A1D5A0_ELEM_SIZE;
}

extern "C" uint32_t isaac_render_shell_a1d5a0_key_hi_off(void) {
  return ISAAC_RENDER_SHELL_A1D5A0_KEY_HI_OFF;
}

extern "C" uint32_t isaac_render_shell_a1d5a0_key_lo_off(void) {
  return ISAAC_RENDER_SHELL_A1D5A0_KEY_LO_OFF;
}

extern "C" uint32_t isaac_render_shell_a1d5a0_call_site_count(void) {
  return ISAAC_RENDER_SHELL_A1D5A0_CALL_SITE_COUNT;
}

extern "C" uint32_t isaac_render_shell_a1d5a0_call_site_first_va(void) {
  return ISAAC_RENDER_SHELL_A1D5A0_CALL_SITE_FIRST_VA;
}

extern "C" uint32_t isaac_render_shell_a1d5a0_call_site_last_va(void) {
  return ISAAC_RENDER_SHELL_A1D5A0_CALL_SITE_LAST_VA;
}

extern "C" uint32_t isaac_render_shell_a1c480_band_start_va(void) {
  return ISAAC_RENDER_SHELL_A1C480_BAND_START_VA;
}

extern "C" uint32_t isaac_render_shell_a1c480_band_end_va(void) {
  return ISAAC_RENDER_SHELL_A1C480_BAND_END_VA;
}

extern "C" uint32_t isaac_render_shell_a1c480_band_open_bodies(void) {
  return ISAAC_RENDER_SHELL_A1C480_BAND_OPEN_BODIES;
}

extern "C" uint32_t isaac_render_shell_a1c480_band_pure_bodies(void) {
  return ISAAC_RENDER_SHELL_A1C480_BAND_PURE_BODIES;
}

extern "C" uint32_t isaac_render_shell_a1c480_band_host_rows(void) {
  return ISAAC_RENDER_SHELL_A1C480_BAND_HOST_ROWS;
}


/* ABI v72: 0xa1d600 double-zero PURE law + 0xa1d610 SEH ctor HOST pin. */

extern "C" void isaac_render_shell_a1d600_zero_pair(uint32_t obj) {
  *(uint32_t*)(uintptr_t)(obj + ISAAC_RENDER_SHELL_A1D600_ZERO_OFF_A) = 0u;
  *(uint32_t*)(uintptr_t)(obj + ISAAC_RENDER_SHELL_A1D600_ZERO_OFF_B) = 0u;
}

extern "C" uint32_t isaac_render_shell_a1d600_host_va(void) {
  return ISAAC_RENDER_SHELL_A1D600_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a1d600_end_va(void) {
  return ISAAC_RENDER_SHELL_A1D600_END_VA;
}

extern "C" uint32_t isaac_render_shell_a1d600_next_va(void) {
  return ISAAC_RENDER_SHELL_A1D600_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a1d600_body_size(void) {
  return ISAAC_RENDER_SHELL_A1D600_BODY_SIZE;
}

extern "C" uint32_t isaac_render_shell_a1d600_zero_off_a(void) {
  return ISAAC_RENDER_SHELL_A1D600_ZERO_OFF_A;
}

extern "C" uint32_t isaac_render_shell_a1d600_zero_off_b(void) {
  return ISAAC_RENDER_SHELL_A1D600_ZERO_OFF_B;
}

extern "C" uint32_t isaac_render_shell_a1d600_direct_caller_count(void) {
  return ISAAC_RENDER_SHELL_A1D600_DIRECT_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_a1d600_jmp_tail_count(void) {
  return ISAAC_RENDER_SHELL_A1D600_JMP_TAIL_COUNT;
}

extern "C" uint32_t isaac_render_shell_a1d600_jmp_tail_first_va(void) {
  return ISAAC_RENDER_SHELL_A1D600_JMP_TAIL_FIRST_VA;
}

extern "C" uint32_t isaac_render_shell_a1d600_jmp_tail_last_va(void) {
  return ISAAC_RENDER_SHELL_A1D600_JMP_TAIL_LAST_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1d610_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1D610_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1d610_end_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1D610_END_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1d610_next_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1D610_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1d610_caller_count(void) {
  return ISAAC_RENDER_SHELL_HOST_A1D610_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_host_a1d610_caller_first_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1D610_CALLER_FIRST_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1d610_caller_last_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1D610_CALLER_LAST_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1d610_seh_fs_probes(void) {
  return ISAAC_RENDER_SHELL_HOST_A1D610_SEH_FS_PROBES;
}

extern "C" uint32_t isaac_render_shell_host_a1d610_handler_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1D610_HANDLER_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1d610_cookie_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1D610_COOKIE_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1d610_e8_count(void) {
  return ISAAC_RENDER_SHELL_HOST_A1D610_E8_COUNT;
}

extern "C" uint32_t isaac_render_shell_host_a1d610_indirect_count(void) {
  return ISAAC_RENDER_SHELL_HOST_A1D610_INDIRECT_COUNT;
}

extern "C" uint32_t isaac_render_shell_host_a1d610_alloc_size(void) {
  return ISAAC_RENDER_SHELL_HOST_A1D610_ALLOC_SIZE;
}

extern "C" uint32_t isaac_render_shell_host_a1d610_alloc_host_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1D610_ALLOC_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1d610_ret_imm(void) {
  return ISAAC_RENDER_SHELL_HOST_A1D610_RET_IMM;
}

extern "C" uint32_t isaac_render_shell_a1d600_band_start_va(void) {
  return ISAAC_RENDER_SHELL_A1D600_BAND_START_VA;
}

extern "C" uint32_t isaac_render_shell_a1d600_band_end_va(void) {
  return ISAAC_RENDER_SHELL_A1D600_BAND_END_VA;
}

extern "C" uint32_t isaac_render_shell_a1d600_band_open_bodies(void) {
  return ISAAC_RENDER_SHELL_A1D600_BAND_OPEN_BODIES;
}

extern "C" uint32_t isaac_render_shell_a1d600_band_pure_bodies(void) {
  return ISAAC_RENDER_SHELL_A1D600_BAND_PURE_BODIES;
}

extern "C" uint32_t isaac_render_shell_a1d600_band_host_rows(void) {
  return ISAAC_RENDER_SHELL_A1D600_BAND_HOST_ROWS;
}

/* ABI v73: 0xa1dfd0 float-gate predicate — PURE gate law + sum-chain
 * fragment + HOST row pins. Flag-faithful transcription of the PE
 * movss/addss x3 / mulss 0.25f / ucomiss +0.0f / lahf / test ah,0x44 /
 * jp dance (NOTES.md §9 Body H). Strict IEEE: no fast-math anywhere
 * in this build, so each f32 op rounds exactly like addss/mulss. */

static float isaac_render_shell_a1dfd0_bits_to_f32(uint32_t bits) {
  float f;
  __builtin_memcpy(&f, &bits, sizeof(f));
  return f;
}

static uint32_t isaac_render_shell_a1dfd0_f32_to_bits(float f) {
  uint32_t bits;
  __builtin_memcpy(&bits, &f, sizeof(bits));
  return bits;
}

static uint32_t isaac_render_shell_a1dfd0_popcount4(uint32_t v) {
  v = v - ((v >> 1) & 0x55u);
  v = (v & 0x33u) + ((v >> 2) & 0x33u);
  return (v + (v >> 4)) & 0x0fu; /* low nibble = popcount of a byte */
}

static float isaac_render_shell_a1dfd0_sum_chain(uint32_t esi_ptr) {
  const float f_first = *(float*)(uintptr_t)(esi_ptr +
      ISAAC_RENDER_SHELL_A1DFD0_FIELD_OFF_FIRST);
  const float f_second = *(float*)(uintptr_t)(esi_ptr +
      ISAAC_RENDER_SHELL_A1DFD0_FIELD_OFF_SECOND);
  const float f_third = *(float*)(uintptr_t)(esi_ptr +
      ISAAC_RENDER_SHELL_A1DFD0_FIELD_OFF_THIRD);
  const float f_fourth = *(float*)(uintptr_t)(esi_ptr +
      ISAAC_RENDER_SHELL_A1DFD0_FIELD_OFF_FOURTH);
  /* PE accumulation order: xmm0 = f40; += f2c; += f54; += f68. Each
   * step is an individual rounding addss — order is load-bearing. */
  float chain_acc = f_first;
  chain_acc = chain_acc + f_second;
  chain_acc = chain_acc + f_third;
  chain_acc = chain_acc + f_fourth;
  return chain_acc;
}

/* Core flag dance on the scaled sum. scale_bits/thresh_bits are kept
 * as explicit arguments so the .rdata pairing stays inspectable. */
static int32_t isaac_render_shell_a1dfd0_gate_core(
    float chain_sum, uint32_t scale_bits, uint32_t thresh_bits) {
  const float thr = isaac_render_shell_a1dfd0_bits_to_f32(thresh_bits);
  const float scaled = chain_sum *
      isaac_render_shell_a1dfd0_bits_to_f32(scale_bits);
  const uint32_t unord = ((scaled != scaled) || (thr != thr)) ? 1u : 0u;
  const uint32_t zf = ((unord || scaled == thr)) ? 0x40u : 0x00u;
  const uint32_t cf = ((unord || scaled < thr)) ? 0x01u : 0x00u;
  const uint32_t pf_ucomiss = unord ? 0x04u : 0x00u;
  const uint32_t ah = zf | pf_ucomiss | cf;
  /* test ah,0x44; jp reads PARITY OF THE RESULT BYTE: PF set iff the
   * low byte holds an EVEN number of set bits. */
  const uint32_t masked = ah & ISAAC_RENDER_SHELL_A1DFD0_TEST_AH_MASK;
  const uint32_t taken =
      ((isaac_render_shell_a1dfd0_popcount4(masked) & 1u) == 0u);
  if (!taken) {
    return 0; /* PE false arm: xor eax,eax @0xa1e003, ret 0x4 @0xa1e009 */
  }
  /* True arm (shader-stack push web) stays HOST-resolved: callees
   * a11080/a13750/a671b0 are unlanded, so this law yields only the
   * gate decision the 44 callers branch on before the E8 web. */
  return 1;
}

extern "C" int32_t isaac_render_shell_a1dfd0_float_gate(uint32_t esi_ptr) {
  return isaac_render_shell_a1dfd0_gate_core(isaac_render_shell_a1dfd0_sum_chain(esi_ptr), ISAAC_RENDER_SHELL_A1DFD0_SCALE_BITS, ISAAC_RENDER_SHELL_A1DFD0_THRESH_BITS);
}

extern "C" int32_t isaac_render_shell_a1dfd0_sum_bits(uint32_t esi_ptr) {
  return (int32_t)isaac_render_shell_a1dfd0_f32_to_bits(
      isaac_render_shell_a1dfd0_sum_chain(esi_ptr));
}

extern "C" uint32_t isaac_render_shell_host_a1dfd0_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1DFD0_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1dfd0_end_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1DFD0_END_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1dfd0_next_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1DFD0_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1dfd0_body_size(void) {
  return ISAAC_RENDER_SHELL_HOST_A1DFD0_BODY_SIZE;
}

extern "C" uint32_t isaac_render_shell_host_a1dfd0_caller_count(void) {
  return ISAAC_RENDER_SHELL_HOST_A1DFD0_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_host_a1dfd0_caller_first_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1DFD0_CALLER_FIRST_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1dfd0_caller_last_va(void) {
  return ISAAC_RENDER_SHELL_HOST_A1DFD0_CALLER_LAST_VA;
}

extern "C" uint32_t isaac_render_shell_host_a1dfd0_e8_count(void) {
  return ISAAC_RENDER_SHELL_HOST_A1DFD0_E8_COUNT;
}

extern "C" uint32_t isaac_render_shell_host_a1dfd0_ret_imm(void) {
  return ISAAC_RENDER_SHELL_HOST_A1DFD0_RET_IMM;
}

extern "C" uint32_t isaac_render_shell_a1dfd0_field_off_first(void) {
  return ISAAC_RENDER_SHELL_A1DFD0_FIELD_OFF_FIRST;
}

extern "C" uint32_t isaac_render_shell_a1dfd0_field_off_second(void) {
  return ISAAC_RENDER_SHELL_A1DFD0_FIELD_OFF_SECOND;
}

extern "C" uint32_t isaac_render_shell_a1dfd0_field_off_third(void) {
  return ISAAC_RENDER_SHELL_A1DFD0_FIELD_OFF_THIRD;
}

extern "C" uint32_t isaac_render_shell_a1dfd0_field_off_fourth(void) {
  return ISAAC_RENDER_SHELL_A1DFD0_FIELD_OFF_FOURTH;
}

extern "C" uint32_t isaac_render_shell_a1dfd0_scale_const_va(void) {
  return ISAAC_RENDER_SHELL_A1DFD0_SCALE_CONST_VA;
}

extern "C" uint32_t isaac_render_shell_a1dfd0_thresh_const_va(void) {
  return ISAAC_RENDER_SHELL_A1DFD0_THRESH_CONST_VA;
}

extern "C" uint32_t isaac_render_shell_a1dfd0_scale_bits(void) {
  return ISAAC_RENDER_SHELL_A1DFD0_SCALE_BITS;
}

extern "C" uint32_t isaac_render_shell_a1dfd0_thresh_bits(void) {
  return ISAAC_RENDER_SHELL_A1DFD0_THRESH_BITS;
}

extern "C" uint32_t isaac_render_shell_a1dfd0_test_ah_mask(void) {
  return ISAAC_RENDER_SHELL_A1DFD0_TEST_AH_MASK;
}

extern "C" uint32_t isaac_render_shell_a1dfd0_name_key_va(void) {
  return ISAAC_RENDER_SHELL_A1DFD0_NAME_KEY_VA;
}

extern "C" uint32_t isaac_render_shell_a1dfd0_callee_site_count(void) {
  return ISAAC_RENDER_SHELL_A1DFD0_CALLEE_SITE_COUNT;
}

extern "C" uint32_t isaac_render_shell_a1dfd0_callee_site_1_va(void) {
  return ISAAC_RENDER_SHELL_A1DFD0_CALLEE_SITE_1_VA;
}

extern "C" uint32_t isaac_render_shell_a1dfd0_callee_site_2_va(void) {
  return ISAAC_RENDER_SHELL_A1DFD0_CALLEE_SITE_2_VA;
}

extern "C" uint32_t isaac_render_shell_a1dfd0_callee_site_3_va(void) {
  return ISAAC_RENDER_SHELL_A1DFD0_CALLEE_SITE_3_VA;
}

extern "C" uint32_t isaac_render_shell_a1dfd0_callee_site_4_va(void) {
  return ISAAC_RENDER_SHELL_A1DFD0_CALLEE_SITE_4_VA;
}

extern "C" uint32_t isaac_render_shell_a1dfd0_callee_site_5_va(void) {
  return ISAAC_RENDER_SHELL_A1DFD0_CALLEE_SITE_5_VA;
}

extern "C" uint32_t isaac_render_shell_a1dfd0_unlanded_callee_count(void) {
  return ISAAC_RENDER_SHELL_A1DFD0_UNLANDED_CALLEE_COUNT;
}

extern "C" uint32_t isaac_render_shell_a1dfd0_band_start_va(void) {
  return ISAAC_RENDER_SHELL_A1DFD0_BAND_START_VA;
}

extern "C" uint32_t isaac_render_shell_a1dfd0_band_end_va(void) {
  return ISAAC_RENDER_SHELL_A1DFD0_BAND_END_VA;
}

extern "C" uint32_t isaac_render_shell_a1dfd0_band_open_bodies(void) {
  return ISAAC_RENDER_SHELL_A1DFD0_BAND_OPEN_BODIES;
}

extern "C" uint32_t isaac_render_shell_a1dfd0_band_pure_bodies(void) {
  return ISAAC_RENDER_SHELL_A1DFD0_BAND_PURE_BODIES;
}

extern "C" uint32_t isaac_render_shell_a1dfd0_band_host_rows(void) {
  return ISAAC_RENDER_SHELL_A1DFD0_BAND_HOST_ROWS;
}

/* ABI v74: 0xa1e490 two-dword setter PURE law (census rshell-a1c480-
 * scan; bytes re-verified this unit). PE store order: [ecx+0xc8]=arg0
 * FIRST, then [ecx+0xcc]=arg1. */

extern "C" void isaac_render_shell_a1e490_set_c8_cc(uint32_t obj,
                                                    uint32_t a,
                                                    uint32_t b) {
  *(uint32_t*)(uintptr_t)(obj + ISAAC_RENDER_SHELL_A1E490_SETTER_OFF_A) = a;
  *(uint32_t*)(uintptr_t)(obj + ISAAC_RENDER_SHELL_A1E490_SETTER_OFF_B) = b;
}

extern "C" uint32_t isaac_render_shell_a1e490_host_va(void) {
  return ISAAC_RENDER_SHELL_A1E490_HOST_VA;
}

extern "C" uint32_t isaac_render_shell_a1e490_end_va(void) {
  return ISAAC_RENDER_SHELL_A1E490_END_VA;
}

extern "C" uint32_t isaac_render_shell_a1e490_next_va(void) {
  return ISAAC_RENDER_SHELL_A1E490_NEXT_VA;
}

extern "C" uint32_t isaac_render_shell_a1e490_body_size(void) {
  return ISAAC_RENDER_SHELL_A1E490_BODY_SIZE;
}

extern "C" uint32_t isaac_render_shell_a1e490_setter_off_a(void) {
  return ISAAC_RENDER_SHELL_A1E490_SETTER_OFF_A;
}

extern "C" uint32_t isaac_render_shell_a1e490_setter_off_b(void) {
  return ISAAC_RENDER_SHELL_A1E490_SETTER_OFF_B;
}

extern "C" uint32_t isaac_render_shell_a1e490_ret_imm(void) {
  return ISAAC_RENDER_SHELL_A1E490_RET_IMM;
}

extern "C" uint32_t isaac_render_shell_a1e490_direct_caller_count(void) {
  return ISAAC_RENDER_SHELL_A1E490_DIRECT_CALLER_COUNT;
}

extern "C" uint32_t isaac_render_shell_a1e490_e9_tail_count(void) {
  return ISAAC_RENDER_SHELL_A1E490_E9_TAIL_COUNT;
}

extern "C" uint32_t isaac_render_shell_a1e490_band_start_va(void) {
  return ISAAC_RENDER_SHELL_A1E490_BAND_START_VA;
}

extern "C" uint32_t isaac_render_shell_a1e490_band_end_va(void) {
  return ISAAC_RENDER_SHELL_A1E490_BAND_END_VA;
}

extern "C" uint32_t isaac_render_shell_a1e490_band_open_bodies(void) {
  return ISAAC_RENDER_SHELL_A1E490_BAND_OPEN_BODIES;
}

extern "C" uint32_t isaac_render_shell_a1e490_band_pure_bodies(void) {
  return ISAAC_RENDER_SHELL_A1E490_BAND_PURE_BODIES;
}

extern "C" uint32_t isaac_render_shell_a1e490_band_host_rows(void) {
  return ISAAC_RENDER_SHELL_A1E490_BAND_HOST_ROWS;
}

