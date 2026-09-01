#include "process_input_pure_helpers.h"

/* ABS wasm (|x| with sign-bit clear, payload preserved) is builtin-only here:
 * <cmath> is not available in the freestanding wasm build. */

/* Pure peels of FUN_006f9400 / FUN_006f95a0 / GetDeviceType / Manager shell /
   FUN_00a6de60 entry gates + device-walk pure islands (ABI v4) + residual
   IAT/query-path pure islands and FUN_00a6dd30 POV head (ABI v5) + post-query
   hook repack / DIDOD match / a6da10 / a648b0 pure islands (ABI v6) +
   FUN_00a1fc00 / FUN_00a1f280 pure islands (ABI v7) + deeper a1f280 / a1eed0 /
   a20020 pure islands (ABI v8) + FUN_00a68490 / post-tick scale (ABI v9) +
   a1f65a rumble vcall arg prep / baseline store (ABI v10) + FUN_00a112c0
   pure CF / message-ptr islands (ABI v11) + a1f4db action-query vcall+0x3c
   pure arg/gate CF (ABI v12) + a1f3f8 fill vcall+0x80 pure arg/gate CF
   (ABI v13) + a1f40d axis-fill vcall+0x7c pure out-buffer / field CF
   (ABI v14) + a1f30a ready-gate vcall+0x78 pure arg/gate CF (ABI v15) +
   a648b0 tracked-heap CF / a6da10 teardown plan / a6dd30 axis store + callback
   frame CF, and the corrected a6dd30 pov_axis1 WEST value (ABI v16) +
   sibling device scan/connect FUN_00a6dab0 gates, slot loop, record init and
   device-id vector search (ABI v17) + its two callers FUN_00a220c0 (hot-plug
   poll thread proc) and FUN_00a6cf80 (one-time init / library probe ladder /
   hook table / CoInit retry) (ABI v18) + Manager shell body after the poll
   prefix: receivers, corrected 2-slot approach loop (NaN branch + 0x20 host
   gate), probe gate, state dispatch (ABI v19). State-2 arm remainder
    (parity-alt gate, post-IsPaused dispatch, mode==2 ladder), the 4-slot
    angle-wrap loop and the approach-tail float (ABI v22).
   Host residual: map lower_bound 0x004288a0; GetDeviceType lock/unlock vcalls;
   Manager poll platform callees (0x00a69f60 / DAT_00c7378c / 0x00a6de60 walk);
   a1fc00 lock/unlock + a1f280 CRT/vcalls + a1eed0 vcall + shared_ptr/notify +
   erase/grow/free; IAT/query CALLs, QPC IAT (incl. a68490), aefd70/aefe20,
   device vcall+0x84 rumble apply, device vcall+0x3c action-id query,
   device vcall+0x78 ready-gate body, device vcall+0x80 fill-present +
   vcall+0x7c axis fill body, callbacks, COM, CRT, a648b0; FUN_00a112c0 body
   (a15770 init, lock, format, ODS, sink). */

namespace {

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

/* PE `test al,al` / `cmp byte ptr …,0`. The parameter is deliberately WIDER
   than the byte the PE reads: the Wasm ABI does not narrow an i32 argument and
   -O2 deletes an in-body mask it can prove redundant for a uint8_t parameter,
   so a narrow parameter type silently ships an unmasked comparison. */
inline uint8_t nonzero_u8(uint32_t v) { return (v & 0xffu) != 0u ? 1 : 0; }

/* comiss xmm0=0 vs f: CF set when 0 < f OR unordered → PE jb fails gate. */
inline int32_t pe_comiss_zero_below_or_unordered(float f) {
  /* Match x86 comiss+jb: fail when f > 0 or NaN. Continue when f <= 0 ordered. */
  if (f != f) {
    return 1; /* NaN → CF path */
  }
  return f > 0.0f ? 1 : 0;
}

}  // namespace

extern "C" int32_t isaac_input_map_node_present(uint32_t isnil_0d, int32_t key_10,
                                                int32_t action_id) {
  if ((isnil_0d & 0xffu) != 0u) {
    return 0;
  }
  if (key_10 > action_id) {
    return 0;
  }
  return 1;
}

/* v109 dedupe: the FUN_006f9400 / FUN_006f95a0 law BODIES (gate39 / mask /
   mask_full / 6f95a0) were REMOVED here — OWNED by the render-shell family
   (isaac_render_shell_6f9400_* / isaac_render_shell_6f95a0_mask, ABI v31;
   the render-slice build links render_shell_pure_helpers.cpp and consumes
   them by name). This file keeps isaac_input_mask_combine + the node
   predicate; ISAAC_INPUT_MASK_6F9400_HOST_VA / _6F95A0_HOST_VA + the
   INPUT_MASK_* constants live in the header. NO duplicate law exports.
   See section-notes/update-v109-dupva-dedupe/. */

extern "C" uint32_t isaac_input_mask_combine(uint32_t mask_a, uint32_t mask_b,
                                             uint32_t mgr_or) {
  return static_cast<uint32_t>(~mask_b) & (mask_a | mgr_or);
}

extern "C" int32_t isaac_input_device_range_contains(uint32_t controlleridx,
                                                     uint32_t start,
                                                     uint32_t count) {
  /* PE unsigned: cmp idx,start / jb next; end=start+count (wrap); cmp idx,end / jb found */
  if (controlleridx < start) {
    return 0;
  }
  const uint32_t end = start + count; /* wrap */
  if (controlleridx < end) {
    return 1;
  }
  return 0;
}

extern "C" int32_t isaac_input_get_device_type_ranges(uint32_t controlleridx,
                                                      const uint32_t* starts,
                                                      const uint32_t* counts,
                                                      uint32_t n) {
  if (n == 0) {
    return 0;
  }
  if (starts == nullptr || counts == nullptr) {
    return 0;
  }
  for (uint32_t i = 0; i < n; ++i) {
    if (isaac_input_device_range_contains(controlleridx, starts[i], counts[i]) !=
        0) {
      return 1;
    }
  }
  return 0;
}

extern "C" int32_t isaac_manager_gate_6f9730(float game_26598, int32_t game_1ba78,
                                             int32_t game_1d520,
                                             uint32_t game_25954,
                                             int32_t game_1d654) {
  if (pe_comiss_zero_below_or_unordered(game_26598) != 0) {
    return 0;
  }
  if (game_1ba78 != 0) {
    return 0;
  }
  if (game_1d520 != 0) {
    return 0;
  }
  if ((game_25954 & 0xffu) != 0u) {
    return 0;
  }
  if (game_1d654 != 0) {
    return 0;
  }
  return 1;
}

extern "C" int32_t isaac_manager_update_early_skip(int32_t counter_4abbc,
                                                   uint32_t flag_2a3c0,
                                                   uint32_t flag_4abc4,
                                                   uint32_t flag_4abc5) {
  if (pe_signed_mod2_eq1(counter_4abbc) == 0) {
    return ISAAC_MANAGER_EARLY_CONTINUE;
  }
  if ((flag_2a3c0 & 0xffu) != 0u) {
    return ISAAC_MANAGER_EARLY_CONTINUE;
  }
  if ((flag_4abc4 & 0xffu) != 0u && (flag_4abc5 & 0xffu) == 0u) {
    return ISAAC_MANAGER_EARLY_RETURN_SILENT;
  }
  return ISAAC_MANAGER_EARLY_RETURN_INC;
}

extern "C" int32_t isaac_manager_early_counter_next(int32_t counter_4abbc) {
  return static_cast<int32_t>(static_cast<uint32_t>(counter_4abbc) + 1u);
}

extern "C" float isaac_manager_float_approach(float current, float target,
                                              float step) {
  /* PE: comiss current,target / jbe add_path; then cmovbe on a second comiss.
   * comiss sets CF=ZF=1 when unordered, so every `jbe`/`cmovbe` here is taken
   * on NaN. `!(a > b)` reproduces that exactly (a > b is false when unordered),
   * whereas `a <= b` would be false and pick the opposite arm. */
  if (isaac_manager_approach_uses_add_path(current, target) != 0) {
    const float next = current + step;
    return !(next > target) ? next : target;
  }
  const float next = current - step;
  return !(target > next) ? next : target;
}

extern "C" int32_t isaac_manager_poll_prefix_needed(uint32_t param1) {
  /* PE @ 0x00954f4d: `80 7d 08 00` = cmp BYTE ptr [ebp+8],0 — the stack
     argument is 4 bytes wide but only its low byte is tested. */
  return (param1 & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_manager_poll_platform_uses_a69f60(
    uint32_t flag_c73680) {
  return flag_c73680 == 0 ? 1 : 0;
}

extern "C" int32_t isaac_manager_poll_a6de60_body_needed(
    uint32_t enabled_c7e300, uint32_t reenter_c9ba98) {
  if ((enabled_c7e300 & 0xffu) == 0u) {
    return 0;
  }
  if ((reenter_c9ba98 & 0xffu) != 0u) {
    return 0;
  }
  return 1;
}

extern "C" int32_t isaac_manager_poll_a6de60_vector_count(int32_t end_c79bf0,
                                                         int32_t begin_c79bec) {
  /* PE: sub eax,ecx; sar eax,2 — 32-bit wrap then arithmetic shift. */
  const int32_t diff =
      static_cast<int32_t>(static_cast<uint32_t>(end_c79bf0) -
                           static_cast<uint32_t>(begin_c79bec));
  return diff >> 2;
}

extern "C" int32_t isaac_manager_poll_a6de60_loop_needed(int32_t vector_count) {
  return vector_count != 0 ? 1 : 0;
}

extern "C" int32_t isaac_manager_poll_a6de60_device_enabled(uint32_t flag_byte) {
  return (flag_byte & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_manager_poll_a6de60_query_ok(int32_t status) {
  return status == 0 ? 1 : 0;
}

extern "C" uint8_t isaac_manager_poll_a6de60_button_bit(uint32_t state_word,
                                                        uint32_t shift) {
  return static_cast<uint8_t>((state_word >> shift) & 1u);
}

extern "C" uint32_t isaac_manager_poll_a6de60_button_slot_shift(uint32_t slot) {
  /* PE unrolled first-path button block (VA 0x00a6dfa3 … 0x00a6e43f). */
  static const uint32_t kShifts[15] = {
      0u, 1u, 2u, 3u, 4u, 5u, 6u, 7u, 8u, 9u, 0xcu, 0xdu, 0xeu, 0xfu, 0xau};
  if (slot >= 15u) {
    return 0xffffffffu;
  }
  return kShifts[slot];
}

extern "C" int32_t isaac_manager_poll_a6de60_button_edge(
    uint32_t new_bit, uint32_t old_bit, uint32_t press_cb_nz,
    uint32_t release_cb_nz) {
  const uint8_t n = nonzero_u8(new_bit);
  const uint8_t o = nonzero_u8(old_bit);
  if (n == o) {
    return ISAAC_A6DE60_EDGE_NONE;
  }
  if (n != 0) {
    return nonzero_u8(press_cb_nz) != 0 ? ISAAC_A6DE60_EDGE_PRESS
                                        : ISAAC_A6DE60_EDGE_SILENT;
  }
  return nonzero_u8(release_cb_nz) != 0 ? ISAAC_A6DE60_EDGE_RELEASE
                                        : ISAAC_A6DE60_EDGE_SILENT;
}

extern "C" float isaac_manager_poll_a6de60_axis_normalize_i16(int32_t raw) {
  /* PE: movsx eax, word; add eax, 0x8000; cvtdq2ps; /65535; *2; -1.0.
     The parameter is wider than the word the PE reads so the sign
     extension stays visible to the differential (see the byte note on
     nonzero_u8: -O2 deletes a narrowing it can prove redundant). */
  const int32_t word = static_cast<int32_t>(
      static_cast<int32_t>(static_cast<uint32_t>(raw) << 16) >> 16);
  const int32_t eax = word + static_cast<int32_t>(0x8000);
  float f = static_cast<float>(eax);
  f /= 65535.0f;
  f += f;
  f -= 1.0f;
  return f;
}

extern "C" float isaac_manager_poll_a6de60_axis_normalize_u8(uint32_t raw) {
  /* PE: movzx eax, byte; cvtdq2ps; /127.5; -1.0 */
  float f = static_cast<float>(raw & 0xffu);
  f /= 127.5f;
  f -= 1.0f;
  return f;
}

extern "C" int32_t isaac_manager_poll_a6de60_float_changed(float new_v,
                                                           float old_v) {
  /* PE ucomiss + lahf/test 0x44/jnp: skip only on ordered-equal. */
  return (new_v == old_v) ? 0 : 1;
}

extern "C" int32_t isaac_manager_poll_a6de60_float_callback_needed(
    float new_v, float old_v, uint32_t cb_nz) {
  if (isaac_manager_poll_a6de60_float_changed(new_v, old_v) == 0) {
    return 0;
  }
  return nonzero_u8(cb_nz) != 0 ? 1 : 0;
}

extern "C" int32_t isaac_manager_poll_a6de60_dierr_reacquire(uint32_t hresult) {
  const uint32_t lost = static_cast<uint32_t>(ISAAC_A6DE60_DIERR_INPUTLOST);
  const uint32_t notacq =
      static_cast<uint32_t>(ISAAC_A6DE60_DIERR_NOTACQUIRED);
  if (hresult == lost || hresult == notacq) {
    return 1;
  }
  return 0;
}

extern "C" int32_t isaac_manager_poll_a6de60_index_continue(uint32_t index,
                                                            uint32_t count) {
  /* PE: inc index; cmp index, count; jb body — unsigned. */
  const uint32_t next = index + 1u;
  return next < count ? 1 : 0;
}

extern "C" int32_t isaac_manager_poll_a6de60_axis_type_dispatch(uint32_t type) {
  if (type > static_cast<uint32_t>(ISAAC_A6DE60_AXIS_TYPE_MAX)) {
    return ISAAC_A6DE60_AXIS_DISPATCH_OOR;
  }
  /* Byte table 0x00a6ef14: multiples of 4 → type/4; else default 12. */
  if ((type & 3u) != 0u) {
    return ISAAC_A6DE60_AXIS_DISPATCH_DEFAULT;
  }
  return static_cast<int32_t>(type / 4u);
}

extern "C" int32_t isaac_manager_poll_a6de60_device_continue(
    uint32_t device_index, int32_t end_c79bf0, int32_t begin_c79bec) {
  const uint32_t next = device_index + 1u;
  const int32_t recount =
      isaac_manager_poll_a6de60_vector_count(end_c79bf0, begin_c79bec);
  /* PE: cmp edi, eax / jb — signed compare of count vs index is rare when
     count is non-negative; match PE by treating recount as signed and index
     as zero-extended then compared the same way as `cmp reg32, reg32` with
     jb (unsigned). */
  return next < static_cast<uint32_t>(recount) ? 1 : 0;
}

/* --- ABI v5: residual IAT/query path + a6dd30 POV pure head --- */

extern "C" int32_t isaac_manager_poll_a6de60_query_uses_hook(
    uint32_t hook_fn_c7e29c) {
  return hook_fn_c7e29c != 0u ? 1 : 0;
}

extern "C" int32_t isaac_manager_poll_a6de60_qpc_freq_init_needed(
    uint32_t freq_lo_c9ba90, uint32_t freq_hi_c9ba94) {
  /* PE: mov eax,lo; or eax,hi; jne skip_init */
  return (freq_lo_c9ba90 | freq_hi_c9ba94) == 0u ? 1 : 0;
}

extern "C" double isaac_manager_poll_a6de60_u64_to_f64(uint32_t lo,
                                                       uint32_t hi) {
  /* CRT 0x00aefe80 legacy: cvtsi2sd lo/hi as i32 + lo sign bias + hi*2^32. */
  double lo_part = static_cast<double>(static_cast<int32_t>(lo));
  if ((lo >> 31) != 0u) {
    lo_part += 4294967296.0; /* DAT table [1] at 0xb1a4d8 / 0xbacb00 family */
  }
  const double hi_part =
      static_cast<double>(static_cast<int32_t>(hi)) * 4294967296.0;
  return lo_part + hi_part;
}

extern "C" double isaac_manager_poll_a6de60_qpc_seconds_f64(
    uint32_t counter_lo, uint32_t counter_hi, uint32_t freq_lo,
    uint32_t freq_hi) {
  const double counter =
      isaac_manager_poll_a6de60_u64_to_f64(counter_lo, counter_hi);
  const double freq = isaac_manager_poll_a6de60_u64_to_f64(freq_lo, freq_hi);
  const double ratio = counter / freq;
  /* PE: cvtpd2ps; cvtps2pd — keep f32 precision in the f64 lane. */
  const float as_f32 = static_cast<float>(ratio);
  return static_cast<double>(as_f32);
}

extern "C" int32_t isaac_manager_poll_a6de60_com_succeeded(int32_t hresult) {
  /* PE: test eax,eax / jns — SF clear when signed value >= 0. */
  return hresult >= 0 ? 1 : 0;
}

extern "C" int32_t isaac_manager_poll_a6de60_buffered_mode(uint32_t flag_18) {
  return (flag_18 & 0xffu) != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_manager_poll_a6de60_didod_alloc_size(uint32_t count) {
  /* PE: mul 0x14; seto cl; neg ecx; or ecx, eax */
  const uint64_t prod =
      static_cast<uint64_t>(count) *
      static_cast<uint64_t>(ISAAC_A6DE60_DIDOD_STRIDE);
  if (prod > 0xffffffffull) {
    return 0xffffffffu;
  }
  return static_cast<uint32_t>(prod);
}

extern "C" double isaac_manager_poll_a6de60_timestamp_to_seconds_f64(
    uint32_t timestamp) {
  /* PE: movd/cvtdq2pd; shr 31; addsd DAT_00bacb00[bit]; divsd 1000.0 */
  double d = static_cast<double>(static_cast<int32_t>(timestamp));
  if ((timestamp >> 31) != 0u) {
    d += 4294967296.0;
  }
  return d / 1000.0; /* DAT_00baa770 */
}

extern "C" uint8_t isaac_manager_poll_a6de60_nonzero_bit(uint32_t value) {
  return value != 0u ? 1u : 0u;
}

extern "C" float isaac_manager_poll_a6de60_pov_axis0(uint32_t pov) {
  /* FUN_00a6dd30: xmm1 lane (first axis written at [base+index*4]). */
  if ((pov & 0xffffu) ==
      static_cast<uint32_t>(ISAAC_A6DE60_POV_CENTER_LO16)) {
    return 0.0f;
  }
  if (pov == 0u || pov == static_cast<uint32_t>(ISAAC_A6DE60_POV_SOUTH)) {
    return 0.0f;
  }
  if (pov < static_cast<uint32_t>(ISAAC_A6DE60_POV_SOUTH)) {
    return 1.0f;
  }
  return -1.0f;
}

extern "C" float isaac_manager_poll_a6de60_pov_axis1(uint32_t pov) {
  /* FUN_00a6dd30: second axis at [base+(index+1)*4] via [ebp+8] scratch. */
  if ((pov & 0xffffu) ==
      static_cast<uint32_t>(ISAAC_A6DE60_POV_CENTER_LO16)) {
    return 0.0f;
  }
  /* Only pov > 27000 leaves the block early (0x00a6dd96 jbe not taken). */
  if (pov > static_cast<uint32_t>(ISAAC_A6DE60_POV_WEST)) {
    return -1.0f;
  }
  /* Everything else falls into the 0x00a6de38 ladder on the full dword: */
  if (pov < static_cast<uint32_t>(ISAAC_A6DE60_POV_EAST)) {
    return -1.0f; /* jb 0x00a6dd9c → xmm2 (-1.0f) */
  }
  if (pov == static_cast<uint32_t>(ISAAC_A6DE60_POV_EAST)) {
    return 0.0f; /* jbe 0x00a6de50 → xorps */
  }
  if (pov < static_cast<uint32_t>(ISAAC_A6DE60_POV_WEST)) {
    return 1.0f; /* jb 0x00a6dda1 → default +1.0f from 0x00a6dd6b */
  }
  /* pov == 27000 (west): jb not taken → 0x00a6de50 xorps → 0.0f. */
  return 0.0f;
}

/* --- ABI v6: post-query hook repack + DIDOD/a6da10/a648b0 pure islands --- */

extern "C" uint32_t isaac_manager_poll_a6de60_hook_repack_dw0(uint32_t src_u16_4,
                                                             uint32_t src_u8_6,
                                                             uint32_t src_u8_7) {
  return (src_u16_4 & 0xffffu) |
         ((src_u8_6 & 0xffu) << 16) | ((src_u8_7 & 0xffu) << 24);
}

extern "C" uint32_t isaac_manager_poll_a6de60_hook_repack_dw1(uint32_t src_u16_8,
                                                             uint32_t src_u16_a) {
  return (src_u16_8 & 0xffffu) | ((src_u16_a & 0xffffu) << 16);
}

extern "C" uint32_t isaac_manager_poll_a6de60_hook_repack_dw2(uint32_t src_u16_c,
                                                             uint32_t src_u16_e) {
  return (src_u16_c & 0xffffu) | ((src_u16_e & 0xffffu) << 16);
}

extern "C" void isaac_manager_poll_a6de60_hook_repack(
    uint32_t src_u16_4, uint32_t src_u8_6, uint32_t src_u8_7, uint32_t src_u16_8,
    uint32_t src_u16_a, uint32_t src_u16_c, uint32_t src_u16_e,
    uint32_t* out_dwords) {
  if (out_dwords == nullptr) {
    return;
  }
  out_dwords[0] =
      isaac_manager_poll_a6de60_hook_repack_dw0(src_u16_4, src_u8_6, src_u8_7);
  out_dwords[1] =
      isaac_manager_poll_a6de60_hook_repack_dw1(src_u16_8, src_u16_a);
  out_dwords[2] =
      isaac_manager_poll_a6de60_hook_repack_dw2(src_u16_c, src_u16_e);
}

extern "C" int32_t isaac_manager_poll_a6de60_didod_ofs_match(
    uint32_t event_ofs, uint32_t mapped_ofs) {
  return event_ofs == mapped_ofs ? 1 : 0;
}

extern "C" int32_t isaac_manager_poll_a6de60_axis_map_is_pov(
    uint32_t type_byte_4) {
  return (type_byte_4 & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_manager_poll_a6de60_query_fail_clear_value(void) {
  return 0;
}

extern "C" int32_t isaac_manager_poll_a6da10_index_after_remove(int32_t index) {
  return static_cast<int32_t>(static_cast<uint32_t>(index) - 1u);
}

extern "C" int32_t isaac_manager_poll_a6da10_disconnect_cb_needed(
    uint32_t cb_c78d7c) {
  return cb_c78d7c != 0u ? 1 : 0;
}

extern "C" int32_t isaac_manager_poll_a6da10_free_com_maps(uint32_t enable_byte) {
  /* PE: cmp byte [state],0 / jne skip_com_free → free when enable == 0. */
  return (enable_byte & 0xffu) == 0u ? 1 : 0;
}

extern "C" uint32_t isaac_manager_poll_a6da10_remove_move_bytes(
    uint32_t end_c79bf0, uint32_t begin_c79bec, uint32_t index) {
  /* slot = begin + index*4; size = end - (slot + 4). */
  const uint32_t slot =
      begin_c79bec + static_cast<uint32_t>(index * 4u); /* wrap */
  const uint32_t next = slot + 4u;
  return end_c79bf0 - next;
}

extern "C" uint32_t isaac_manager_poll_a6da10_end_after_remove(
    uint32_t end_c79bf0) {
  return end_c79bf0 - 4u;
}

extern "C" int32_t isaac_manager_poll_a648b0_mode(uint32_t cl) {
  /* PE: movzx eax,cl; sub 0 / je alloc; sub 1 / je free; sub 1 / jne nop. */
  const uint32_t v = cl & 0xffu;
  if (v == 0u) {
    return ISAAC_A648B0_MODE_ALLOC;
  }
  if (v == 1u) {
    return ISAAC_A648B0_MODE_FREE;
  }
  if (v == 2u) {
    return ISAAC_A648B0_MODE_ACCOUNT;
  }
  return ISAAC_A648B0_MODE_NOP;
}

extern "C" uint32_t isaac_manager_poll_a648b0_alloc_malloc_size(
    uint32_t size_lo, uint32_t size_hi) {
  uint32_t lo = size_lo;
  if (size_hi != 0u) {
    lo = 0u;
  }
  return lo + 4u; /* 32-bit wrap; PE only pushes low dword */
}

extern "C" void isaac_manager_poll_a648b0_tracker_sub_size(
    uint32_t tracker_lo, uint32_t tracker_hi, uint32_t size, uint32_t* out_lo,
    uint32_t* out_hi) {
  const uint32_t lo = tracker_lo - size;
  const uint32_t borrow = (tracker_lo < size) ? 1u : 0u;
  const uint32_t hi = tracker_hi - borrow;
  if (out_lo != nullptr) {
    *out_lo = lo;
  }
  if (out_hi != nullptr) {
    *out_hi = hi;
  }
}

extern "C" void isaac_manager_poll_a648b0_tracker_add(
    uint32_t tracker_lo, uint32_t tracker_hi, uint32_t add_lo, uint32_t add_hi,
    uint32_t* out_lo, uint32_t* out_hi) {
  const uint32_t lo = tracker_lo + add_lo;
  const uint32_t carry = (lo < tracker_lo) ? 1u : 0u;
  const uint32_t hi = tracker_hi + add_hi + carry;
  if (out_lo != nullptr) {
    *out_lo = lo;
  }
  if (out_hi != nullptr) {
    *out_hi = hi;
  }
}

/* --- ABI v7: FUN_00a1fc00 + FUN_00a1f280 pure islands --- */

extern "C" int32_t isaac_manager_poll_a1fc00_lock_obj_present(uint32_t lock_ptr) {
  return lock_ptr != 0u ? 1 : 0;
}

extern "C" int32_t isaac_manager_poll_a1fc00_queue_loop_needed(uint32_t begin_8,
                                                              uint32_t end_c) {
  return begin_8 != end_c ? 1 : 0;
}

extern "C" int32_t isaac_manager_poll_a1fc00_queue_count(int32_t end_c,
                                                        int32_t begin_8) {
  /* PE: sub edi, begin; sar edi, 3 — 32-bit wrap then arithmetic shift. */
  const int32_t diff =
      static_cast<int32_t>(static_cast<uint32_t>(end_c) -
                           static_cast<uint32_t>(begin_8));
  return diff >> 3;
}

extern "C" int32_t isaac_manager_poll_a1fc00_entry_already_active(
    uint32_t flags_byte_8) {
  return ((flags_byte_8 & 0xffu) & 1u) != 0u ? 1 : 0;
}

extern "C" uint16_t isaac_manager_poll_a1fc00_entry_mark_active(
    uint32_t flags_word_8) {
  return static_cast<uint16_t>((flags_word_8 & 0xffffu) | 1u);
}

extern "C" int32_t isaac_manager_poll_a1fc00_slot_table_usable(
    uint32_t count_c799f4) {
  return count_c799f4 != 0u ? 1 : 0;
}

extern "C" int32_t isaac_manager_poll_a1fc00_slot_is_free(uint32_t key_dword) {
  return key_dword == 0u ? 1 : 0;
}

extern "C" int32_t isaac_manager_poll_a1fc00_slot_index_continue(
    uint32_t index, uint32_t count) {
  const uint32_t next = index + 1u;
  return next < count ? 1 : 0;
}

extern "C" uint32_t isaac_manager_poll_a1fc00_slot_find_free(
    const uint32_t* keys, uint32_t count) {
  if (count == 0u) {
    return static_cast<uint32_t>(ISAAC_A1FC00_SLOT_FULL);
  }
  if (keys == nullptr) {
    return static_cast<uint32_t>(ISAAC_A1FC00_SLOT_FULL);
  }
  for (uint32_t i = 0; i < count; ++i) {
    if (keys[i] == 0u) {
      return i;
    }
  }
  return static_cast<uint32_t>(ISAAC_A1FC00_SLOT_FULL);
}

extern "C" uint32_t isaac_manager_poll_a1fc00_queue_end_after_erase(
    uint32_t end_c) {
  return end_c - static_cast<uint32_t>(ISAAC_A1FC00_QUEUE_STRIDE);
}

extern "C" uint32_t isaac_manager_poll_a1fc00_iter_advance(uint32_t iter) {
  return iter + static_cast<uint32_t>(ISAAC_A1FC00_QUEUE_STRIDE);
}

extern "C" int32_t isaac_manager_poll_a1fc00_iter_continue(uint32_t iter,
                                                           uint32_t end_c) {
  return iter != end_c ? 1 : 0;
}

extern "C" int32_t isaac_manager_poll_a1fc00_pending_needs_grow(
    uint32_t end, uint32_t capacity_end) {
  return end == capacity_end ? 1 : 0;
}

extern "C" uint32_t isaac_manager_poll_a1fc00_pending_end_after_push(
    uint32_t end) {
  return end + static_cast<uint32_t>(ISAAC_A1FC00_QUEUE_STRIDE);
}

extern "C" uint32_t isaac_manager_poll_a1fc00_pending_capacity_bytes(
    uint32_t cap_end, uint32_t begin) {
  const uint32_t raw = cap_end - begin;
  return raw & 0xfffffff8u;
}

extern "C" int32_t isaac_manager_poll_a1fc00_free_uses_heap_header(
    uint32_t size) {
  return size >= static_cast<uint32_t>(ISAAC_A1FC00_FREE_HEADER_THRESHOLD) ? 1
                                                                          : 0;
}

extern "C" uint32_t isaac_manager_poll_a1fc00_free_header_size(uint32_t size) {
  return size + static_cast<uint32_t>(ISAAC_A1FC00_FREE_HEADER_ADD);
}

extern "C" int32_t isaac_manager_poll_a1fc00_free_header_offset_ok(
    uint32_t begin, uint32_t header) {
  /* PE: eax = begin; sub eax, header; add eax, -4; cmp eax, 0x1f / jbe ok */
  const uint32_t off = (begin - header) - 4u;
  return off <= static_cast<uint32_t>(ISAAC_A1FC00_FREE_HEADER_OFFSET_MAX) ? 1
                                                                           : 0;
}

extern "C" int32_t isaac_manager_poll_a1fc00_notify_cb_needed(
    uint32_t cb_c7e814) {
  return cb_c7e814 != 0u ? 1 : 0;
}

extern "C" int32_t isaac_manager_poll_a1f280_buffer_bytes(int32_t end_14,
                                                         int32_t begin_10) {
  /* PE: sub; sar 4; shl 2 — 32-bit wrap on sub. */
  const int32_t diff =
      static_cast<int32_t>(static_cast<uint32_t>(end_14) -
                           static_cast<uint32_t>(begin_10));
  const int32_t count = diff >> 4;
  return static_cast<int32_t>(static_cast<uint32_t>(count) << 2);
}

extern "C" int32_t isaac_manager_poll_a1f280_axis_dir(float value,
                                                      float threshold) {
  /* PE comiss+jbe: set neg only when value < -threshold ordered.
     set pos only when value > threshold ordered. NaN → neither. */
  if (value != value || threshold != threshold) {
    return 0;
  }
  const float neg_thr = -threshold;
  if (value < neg_thr) {
    return ISAAC_A1F280_DIR_NEG_X; /* bit0 within a single-axis pair */
  }
  if (value > threshold) {
    return ISAAC_A1F280_DIR_POS_X;
  }
  return 0;
}

extern "C" uint32_t isaac_manager_poll_a1f280_axis_pair_bits(float x, float y,
                                                            float threshold,
                                                            uint32_t bit_base) {
  const int32_t dx = isaac_manager_poll_a1f280_axis_dir(x, threshold);
  const int32_t dy = isaac_manager_poll_a1f280_axis_dir(y, threshold);
  /* dy bits sit at +2 within the nibble (NEG_Y=4, POS_Y=8). */
  const uint32_t nibble =
      static_cast<uint32_t>(dx) | (static_cast<uint32_t>(dy) << 2);
  return nibble << (bit_base & 31u);
}

/* --- ABI v8: deeper a1f280 + a1eed0 pure islands --- */

namespace {

/* SSE maxss: if a > b ordered keep a, else b (NaN or a <= b → second). */
inline float a1f280_maxss(float a, float b) {
  if (a != a || b != b) {
    return b;
  }
  return a > b ? a : b;
}

} /* namespace */

extern "C" int32_t isaac_manager_poll_a1f280_buffer_count(int32_t end_14,
                                                         int32_t begin_10) {
  const int32_t diff =
      static_cast<int32_t>(static_cast<uint32_t>(end_14) -
                           static_cast<uint32_t>(begin_10));
  return diff >> 4;
}

extern "C" float isaac_manager_poll_a1eed0_deadzone_remap(float value,
                                                         float threshold) {
  /* PE comiss -thresh,v / jbe; comiss v,thresh / jbe → 0 on NaN/unordered. */
  if (value != value || threshold != threshold) {
    return 0.0f;
  }
  const float neg_thr = -threshold;
  if (neg_thr > value) {
    /* (v + thresh) / (1 - thresh) */
    return (value + threshold) / (1.0f - threshold);
  }
  if (value > threshold) {
    return (value - threshold) / (1.0f - threshold);
  }
  return 0.0f;
}

extern "C" float isaac_manager_poll_a1f280_axis_neg_part(float value) {
  /* comiss 0,v / jbe → 0; else xor sign → -v. NaN → jbe → 0. */
  if (value != value) {
    return 0.0f;
  }
  if (0.0f > value) {
    return -value;
  }
  return 0.0f;
}

extern "C" float isaac_manager_poll_a1f280_axis_pos_part(float value) {
  return a1f280_maxss(value, 0.0f);
}

extern "C" int32_t isaac_manager_poll_a1f280_action_mode_idle(uint32_t mode_cc) {
  return mode_cc == static_cast<uint32_t>(ISAAC_A1F280_ACTION_MODE_IDLE) ? 1
                                                                        : 0;
}

extern "C" int32_t isaac_manager_poll_a1f280_action_id_valid(int32_t action_id) {
  return action_id != -1 ? 1 : 0;
}

extern "C" int32_t isaac_manager_poll_a1f280_buffer_index_in_range(
    uint32_t index, int32_t buffer_count) {
  /* PE cmp index, count / jb — unsigned. */
  return index < static_cast<uint32_t>(buffer_count) ? 1 : 0;
}

extern "C" uint32_t isaac_manager_poll_a1f280_buffer_slot_offset(
    uint32_t mode_cc, uint32_t index) {
  /* lea eax,[cc+index*4]; store at begin[eax*4] → offset (cc+index*4)*4. */
  const uint32_t scaled = mode_cc + (index * 4u);
  return scaled * 4u;
}

extern "C" int32_t isaac_manager_poll_a1f280_rumble_path_needed(
    uint32_t flags_byte_8) {
  return ((flags_byte_8 & 0xffu) &
          static_cast<uint32_t>(ISAAC_A1F280_RUMBLE_SUPPRESS_FLAG)) == 0u
             ? 1
             : 0;
}

extern "C" int32_t isaac_manager_poll_a1f280_timer_positive(float timer) {
  /* comiss timer, 0 / jbe skip → active when ordered timer > 0. */
  if (timer != timer) {
    return 0;
  }
  return timer > 0.0f ? 1 : 0;
}

extern "C" float isaac_manager_poll_a1f280_timer_clamp_nonneg(float timer) {
  /* ABI v20 correction. PE @ 0x00a1f62b: comiss xmm0(0), xmm1(timer) then
   * `jb 0xa1f642`, which skips the `mov dword [esi+0xd8],0` at 0x00a1f633.
   * comiss sets CF on an unordered compare, so the jb is TAKEN for NaN and the
   * zero-store never runs — a NaN timer survives. The old form returned 0.0f.
   * Same instruction range as rumble_vcall_timer, which already had it right. */
  return pe_comiss_zero_below_or_unordered(timer) != 0 ? timer : 0.0f;
}

/* --- ABI v9: FUN_00a68490 pure + a1f280 post-tick rumble scale --- */

namespace {

constexpr uint64_t kTickScaleMul = (static_cast<uint64_t>(ISAAC_A1F280_TICK_SCALE_MUL_HI)
                                    << 32) |
                                   static_cast<uint64_t>(ISAAC_A1F280_TICK_SCALE_MUL_LO);

inline uint64_t a1f280_scale_tick_u64(uint32_t seed_lo, uint32_t seed_hi) {
  const uint64_t seed =
      static_cast<uint64_t>(seed_lo) | (static_cast<uint64_t>(seed_hi) << 32);
  const unsigned __int128 product =
      static_cast<unsigned __int128>(seed) *
      static_cast<unsigned __int128>(kTickScaleMul);
  return static_cast<uint64_t>(product >> ISAAC_A1F280_TICK_SCALE_SHIFT);
}

inline uint64_t a1f280_u64(uint32_t lo, uint32_t hi) {
  return static_cast<uint64_t>(lo) | (static_cast<uint64_t>(hi) << 32);
}

} /* namespace */

extern "C" double isaac_manager_poll_a68490_ns_f64(double counter_f64,
                                                   double freq_f64) {
  /* PE: divsd xmm1, xmm0; mulsd xmm1, qword [DAT_00baa8b0=1e9]. */
  return (counter_f64 / freq_f64) * 1000000000.0;
}

extern "C" uint32_t isaac_manager_poll_a1f280_scale_tick_lo(uint32_t seed_lo,
                                                            uint32_t seed_hi) {
  return static_cast<uint32_t>(a1f280_scale_tick_u64(seed_lo, seed_hi));
}

extern "C" uint32_t isaac_manager_poll_a1f280_scale_tick_hi(uint32_t seed_lo,
                                                            uint32_t seed_hi) {
  return static_cast<uint32_t>(a1f280_scale_tick_u64(seed_lo, seed_hi) >> 32);
}

extern "C" void isaac_manager_poll_a1f280_scale_tick(uint32_t seed_lo,
                                                     uint32_t seed_hi,
                                                     uint32_t* out_lo,
                                                     uint32_t* out_hi) {
  const uint64_t scaled = a1f280_scale_tick_u64(seed_lo, seed_hi);
  if (out_lo != nullptr) {
    *out_lo = static_cast<uint32_t>(scaled);
  }
  if (out_hi != nullptr) {
    *out_hi = static_cast<uint32_t>(scaled >> 32);
  }
}

extern "C" uint32_t isaac_manager_poll_a1f280_tick_delta_lo(uint32_t scaled_lo,
                                                            uint32_t scaled_hi,
                                                            uint32_t base_lo,
                                                            uint32_t base_hi) {
  const uint64_t delta =
      a1f280_u64(scaled_lo, scaled_hi) - a1f280_u64(base_lo, base_hi);
  return static_cast<uint32_t>(delta);
}

extern "C" uint32_t isaac_manager_poll_a1f280_tick_delta_hi(uint32_t scaled_lo,
                                                            uint32_t scaled_hi,
                                                            uint32_t base_lo,
                                                            uint32_t base_hi) {
  const uint64_t delta =
      a1f280_u64(scaled_lo, scaled_hi) - a1f280_u64(base_lo, base_hi);
  return static_cast<uint32_t>(delta >> 32);
}

extern "C" void isaac_manager_poll_a1f280_tick_delta(uint32_t scaled_lo,
                                                     uint32_t scaled_hi,
                                                     uint32_t base_lo,
                                                     uint32_t base_hi,
                                                     uint32_t* out_lo,
                                                     uint32_t* out_hi) {
  const uint64_t delta =
      a1f280_u64(scaled_lo, scaled_hi) - a1f280_u64(base_lo, base_hi);
  if (out_lo != nullptr) {
    *out_lo = static_cast<uint32_t>(delta);
  }
  if (out_hi != nullptr) {
    *out_hi = static_cast<uint32_t>(delta >> 32);
  }
}

extern "C" int32_t isaac_manager_poll_a1f280_tick_delta_nonzero(
    uint32_t delta_lo, uint32_t delta_hi) {
  /* PE: jne hi / test lo / je — any nonzero bit. */
  return (delta_lo | delta_hi) != 0u ? 1 : 0;
}

extern "C" float isaac_manager_poll_a1f280_tick_delta_seconds_f32(
    double delta_f64) {
  /* PE: cvtsd2ss xmm0, xmm0; mulss xmm0, dword [DAT_00baa020=0.001f]. */
  const float as_f32 = static_cast<float>(delta_f64);
  return as_f32 * 0.001f;
}

extern "C" float isaac_manager_poll_a1f280_timer_sub_delta(float timer,
                                                           float delta_sec) {
  /* PE: subss xmm1, xmm0 (timer - delta_sec). */
  return timer - delta_sec;
}

extern "C" int32_t isaac_manager_poll_a1f280_rumble_intensity_active(
    float timer) {
  /* comiss 0, timer / jb → CF when 0 < timer OR unordered (NaN). */
  if (timer != timer) {
    return 1;
  }
  return 0.0f < timer ? 1 : 0;
}

/* --- ABI v10: pure arg prep / stores around host vcall+0x84 @ 0x00a1f65a --- */

extern "C" float isaac_manager_poll_a1f280_rumble_vcall_timer(float timer) {
  /* Active keeps timer including NaN; inactive zeros. */
  if (isaac_manager_poll_a1f280_rumble_intensity_active(timer) != 0) {
    return timer;
  }
  return 0.0f;
}

extern "C" float isaac_manager_poll_a1f280_rumble_vcall_intensity(
    float timer, float saved_intensity) {
  if (isaac_manager_poll_a1f280_rumble_intensity_active(timer) != 0) {
    return saved_intensity;
  }
  return 0.0f;
}

extern "C" void isaac_manager_poll_a1f280_rumble_vcall_args(
    float timer, float saved_intensity, float* out_timer,
    float* out_intensity) {
  const float t = isaac_manager_poll_a1f280_rumble_vcall_timer(timer);
  const float i =
      isaac_manager_poll_a1f280_rumble_vcall_intensity(timer, saved_intensity);
  if (out_timer != nullptr) {
    *out_timer = t;
  }
  if (out_intensity != nullptr) {
    *out_intensity = i;
  }
}

extern "C" float isaac_manager_poll_a1f280_rumble_timer_after_gate(float timer) {
  /* Force-store 0 @ 0x00a1f633 when inactive; else keep pre-gate timer. */
  return isaac_manager_poll_a1f280_rumble_vcall_timer(timer);
}

extern "C" int32_t isaac_manager_poll_a1f280_rumble_neg_timer_path(
    float timer) {
  /* comiss 0, timer / jbe skip → run only when ordered 0 > timer (strict <). */
  if (timer != timer) {
    return 0; /* unordered → jbe → skip */
  }
  return 0.0f > timer ? 1 : 0;
}

extern "C" void isaac_manager_poll_a1f280_baseline_store(uint32_t scaled_lo,
                                                         uint32_t scaled_hi,
                                                         uint32_t* out_lo,
                                                         uint32_t* out_hi) {
  /* PE @ 0x00a1f6de…0x00a1f6e4: mov [device+0xe0], ecx; mov [device+0xe4], edx. */
  if (out_lo != nullptr) {
    *out_lo = scaled_lo;
  }
  if (out_hi != nullptr) {
    *out_hi = scaled_hi;
  }
}

extern "C" int32_t isaac_manager_poll_a1f280_success_return(void) {
  return static_cast<int32_t>(ISAAC_A1F280_SUCCESS_AL);
}

extern "C" uint32_t isaac_manager_poll_a1f280_rumble_vtbl_slot(void) {
  return static_cast<uint32_t>(ISAAC_A1F280_VTBL_RUMBLE);
}

/* --- ABI v11: pure CF / message ptrs around host FUN_00a112c0 --- */

namespace {

/* PE byte table @ 0x00a114bc indexed by (level-1) when level-1 <= 0xf.
 * Values 0..4 select jtable cases; 5 is default → empty prefix. */
constexpr uint8_t kA112c0PrefixCase[16] = {
    0, 1, 5, 2, 5, 5, 5, 3, 5, 5, 5, 5, 5, 5, 5, 4};

/* jtable @ 0x00a114a4 cases 0..5 → prefix string VAs. */
constexpr uint32_t kA112c0PrefixVa[6] = {
    ISAAC_A112C0_PREFIX_VA_INFO,   /* case 0: level 1 */
    ISAAC_A112C0_PREFIX_VA_NET,    /* case 1: level 2 */
    ISAAC_A112C0_PREFIX_VA_WARN,   /* case 2: level 4 */
    ISAAC_A112C0_PREFIX_VA_ERROR,  /* case 3: level 8 */
    ISAAC_A112C0_PREFIX_VA_ASSERT, /* case 4: level 0x10 */
    ISAAC_A112C0_PREFIX_VA_EMPTY,  /* case 5 / OOR: default */
};

} /* namespace */

extern "C" int32_t isaac_a112c0_reenter_skip(int32_t state_c7de48) {
  return state_c7de48 == ISAAC_A112C0_STATE_INIT ? 1 : 0;
}

extern "C" int32_t isaac_a112c0_sink_active(uint32_t sink_ptr_c79bd8,
                                            uint32_t sink_mask_c79bdc,
                                            uint32_t level) {
  if (sink_ptr_c79bd8 == 0u) {
    return 0;
  }
  if ((sink_mask_c79bdc & level) == 0u) {
    return 0;
  }
  return 1;
}

extern "C" int32_t isaac_a112c0_body_needed(int32_t state_c7de48,
                                            uint32_t sink_ptr_c79bd8,
                                            uint32_t sink_mask_c79bdc,
                                            uint32_t level) {
  if (isaac_a112c0_reenter_skip(state_c7de48) != 0) {
    return 0;
  }
  /* PE: test bl,bl / jne body; test cl,cl / je skip — low byte OR sink. */
  if ((level & 0xffu) != 0u) {
    return 1;
  }
  return isaac_a112c0_sink_active(sink_ptr_c79bd8, sink_mask_c79bdc, level);
}

extern "C" int32_t isaac_a112c0_init_needed(int32_t state_c7de48) {
  return state_c7de48 == ISAAC_A112C0_STATE_IDLE ? 1 : 0;
}

extern "C" int32_t isaac_a112c0_state_after_init(uint32_t init_ok_al) {
  return (init_ok_al & 0xffu) != 0u ? ISAAC_A112C0_STATE_READY
                                    : ISAAC_A112C0_STATE_IDLE;
}

extern "C" int32_t isaac_a112c0_prefix_enabled(uint32_t flag_c33911) {
  return (flag_c33911 & 0xffu) != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_a112c0_prefix_va(uint32_t level) {
  /* PE: lea eax,[ebx-1]; cmp eax,0xf / ja default; case = table[eax]. */
  const uint32_t idx = level - 1u; /* 32-bit wrap */
  uint32_t case_id = 5u;           /* default empty */
  if (idx <= 0xfu) {
    case_id = kA112c0PrefixCase[idx];
  }
  if (case_id >= 6u) {
    case_id = 5u;
  }
  return kA112c0PrefixVa[case_id];
}

extern "C" int32_t isaac_a112c0_ods_needed(uint32_t level) {
  return (level & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_a112c0_sink_write_needed(uint32_t sink_ptr_c79bd8,
                                                  uint32_t sink_mask_c79bdc,
                                                  uint32_t level) {
  return isaac_a112c0_sink_active(sink_ptr_c79bd8, sink_mask_c79bdc, level);
}

extern "C" uint32_t isaac_a112c0_buf_remaining(uint32_t prefix_len) {
  return static_cast<uint32_t>(ISAAC_A112C0_BUF_CAP) - prefix_len;
}

extern "C" int32_t isaac_a112c0_trail_newline(uint32_t last_char) {
  return (last_char & 0xffu) == static_cast<uint32_t>('\n') ? 1 : 0;
}

extern "C" uint32_t isaac_a112c0_host_va(void) {
  return static_cast<uint32_t>(ISAAC_A112C0_HOST_VA);
}

extern "C" uint32_t isaac_a112c0_fmt_va(void) {
  return static_cast<uint32_t>(ISAAC_A112C0_FMT_VA);
}

extern "C" uint32_t isaac_a112c0_buf_cap(void) {
  return static_cast<uint32_t>(ISAAC_A112C0_BUF_CAP);
}

extern "C" uint32_t isaac_a112c0_level_assert(void) {
  return static_cast<uint32_t>(ISAAC_A112C0_LEVEL_ASSERT);
}

extern "C" uint32_t isaac_a112c0_msg_va_invalid_mutex(void) {
  return static_cast<uint32_t>(ISAAC_A112C0_MSG_VA_INVALID_MUTEX);
}

extern "C" uint32_t isaac_a112c0_msg_va_action_id_oor(void) {
  return static_cast<uint32_t>(ISAAC_A112C0_MSG_VA_ACTION_ID_OOR);
}

extern "C" int32_t isaac_manager_poll_a1f280_action_id_oor_log_needed(
    uint32_t index, int32_t buffer_count) {
  /* PE cmp index,count / jb store else log — inverse of in-range. */
  return isaac_manager_poll_a1f280_buffer_index_in_range(index, buffer_count) ==
                 0
             ? 1
             : 0;
}

/* --- ABI v12: pure arg/gate CF around host device vcall+0x3c @ 0x00a1f4db --- */

extern "C" int32_t isaac_manager_poll_a1f280_action_query_vcall_needed(
    uint32_t mode_cc) {
  /* PE @ 0x00a1f4c9: cmp mode,4 / je skip → vcall when not idle. */
  return isaac_manager_poll_a1f280_action_mode_idle(mode_cc) == 0 ? 1 : 0;
}

extern "C" int32_t isaac_manager_poll_a1f280_action_query_vcall_arg(void) {
  /* PE push 0 @ 0x00a1f4d6. */
  return static_cast<int32_t>(ISAAC_A1F280_ACTION_QUERY_ARG);
}

extern "C" uint32_t isaac_manager_poll_a1f280_action_query_vtbl_slot(void) {
  return static_cast<uint32_t>(ISAAC_A1F280_VTBL_ACTION_QUERY);
}

extern "C" uint32_t isaac_manager_poll_a1f280_action_query_call_va(void) {
  return static_cast<uint32_t>(ISAAC_A1F280_ACTION_QUERY_CALL_VA);
}

extern "C" uint32_t isaac_manager_poll_a1f280_action_index_after_push(void) {
  /* PE mov dword ptr [esi+0xc8], 0xffffffff @ 0x00a1f527. */
  return static_cast<uint32_t>(ISAAC_A1F280_ACTION_INDEX_CLEARED);
}

extern "C" uint32_t isaac_manager_poll_a1f280_action_mode_after_push(void) {
  /* PE mov dword ptr [esi+0xcc], 4 @ 0x00a1f531. */
  return static_cast<uint32_t>(ISAAC_A1F280_ACTION_MODE_AFTER_PUSH);
}

/* --- ABI v13: pure arg/gate CF around host device vcall+0x80 @ 0x00a1f3f8 --- */

extern "C" int32_t isaac_manager_poll_a1f280_fill_vcall_ok(uint32_t al) {
  /* PE @ 0x00a1f3fa: test al,al / je skip → pair1 body when low-byte != 0.
   * Same predicate at sibling pair0 site @ 0x00a1f322. */
  return (al & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_manager_poll_a1f280_fill_pair1_arg(void) {
  /* PE push 1 @ 0x00a1f408 (axis fill) and @ 0x00a1f465 (a1eed0). */
  return static_cast<int32_t>(ISAAC_A1F280_FILL_PAIR1_ARG);
}

extern "C" int32_t isaac_manager_poll_a1f280_fill_pair0_arg(void) {
  /* PE push 0 @ 0x00a1f330 / 0x00a1f38a after fill @ 0x00a1f320. */
  return static_cast<int32_t>(ISAAC_A1F280_FILL_PAIR0_ARG);
}

extern "C" uint32_t isaac_manager_poll_a1f280_fill_vtbl_slot(void) {
  return static_cast<uint32_t>(ISAAC_A1F280_VTBL_FILL);
}

extern "C" uint32_t isaac_manager_poll_a1f280_fill_call_va(void) {
  return static_cast<uint32_t>(ISAAC_A1F280_FILL_PAIR1_CALL_VA);
}

extern "C" uint32_t isaac_manager_poll_a1f280_fill_pair0_call_va(void) {
  return static_cast<uint32_t>(ISAAC_A1F280_FILL_PAIR0_CALL_VA);
}

extern "C" uint32_t isaac_manager_poll_a1f280_axis_fill_vtbl_slot(void) {
  return static_cast<uint32_t>(ISAAC_A1F280_VTBL_AXIS_FILL);
}

extern "C" uint32_t isaac_manager_poll_a1f280_fill_axis_store_base_pair1(void) {
  /* PE movss [esi+0x50]…[esi+0x5c] after a1eed0 pair1. */
  return static_cast<uint32_t>(ISAAC_A1F280_OFF_AXIS_PAIR1);
}

extern "C" uint32_t isaac_manager_poll_a1f280_fill_dir_bit_base_pair1(void) {
  /* Pair1 dir OR masks start at bit 4 (0x10). */
  return static_cast<uint32_t>(ISAAC_A1F280_DIR_BIT_BASE_PAIR1);
}

/* --- ABI v14: pure out-buffer / field CF around host axis-fill @ 0x00a1f40d --- */

extern "C" uint32_t isaac_manager_poll_a1f280_axis_fill_call_va(void) {
  return static_cast<uint32_t>(ISAAC_A1F280_AXIS_FILL_PAIR1_CALL_VA);
}

extern "C" uint32_t isaac_manager_poll_a1f280_axis_fill_pair0_call_va(void) {
  return static_cast<uint32_t>(ISAAC_A1F280_AXIS_FILL_PAIR0_CALL_VA);
}

extern "C" uint32_t isaac_manager_poll_a1eed0_axis_fill_call_va(void) {
  return static_cast<uint32_t>(ISAAC_A1EED0_AXIS_FILL_CALL_VA);
}

extern "C" uint32_t isaac_manager_poll_a1f280_axis_fill_out_float_count(void) {
  return static_cast<uint32_t>(ISAAC_A1F280_AXIS_FILL_OUT_FLOAT_COUNT);
}

extern "C" uint32_t isaac_manager_poll_a1f280_axis_fill_out_x_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A1F280_AXIS_FILL_OUT_X_OFS);
}

extern "C" uint32_t isaac_manager_poll_a1f280_axis_fill_out_y_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A1F280_AXIS_FILL_OUT_Y_OFS);
}

extern "C" uint32_t isaac_manager_poll_a1f280_dir_thresh_ofs(void) {
  /* PE movss xmm2, [esi+0xd4] @ 0x00a1f410 / 0x00a1f338. */
  return static_cast<uint32_t>(ISAAC_A1F280_OFF_DIR_THRESH);
}

extern "C" uint32_t isaac_manager_poll_a1f280_remap_thresh_ofs(void) {
  /* PE movss xmm3, [edi+0xd0] inside a1eed0 @ 0x00a1eee3. */
  return static_cast<uint32_t>(ISAAC_A1F280_OFF_REMAP_THRESH);
}

extern "C" uint32_t isaac_manager_poll_a1f280_dir_bits_ofs(void) {
  /* PE or dword ptr [esi+0x30], imm @ 0x00a1f42d… / pair0 0x00a1f355…. */
  return static_cast<uint32_t>(ISAAC_A1F280_OFF_DIR_BITS);
}

extern "C" uint32_t isaac_manager_poll_a1f280_fill_axis_store_base_pair0(void) {
  /* PE movss [esi+0x40]…[esi+0x4c] after a1eed0 pair0. */
  return static_cast<uint32_t>(ISAAC_A1F280_OFF_AXIS_PAIR0);
}

extern "C" uint32_t isaac_manager_poll_a1f280_fill_dir_bit_base_pair0(void) {
  return static_cast<uint32_t>(ISAAC_A1F280_DIR_BIT_BASE_PAIR0);
}

extern "C" uint32_t isaac_manager_poll_a1f280_dir_bits_merge(uint32_t prior,
                                                             float x, float y,
                                                             float threshold,
                                                             uint32_t bit_base) {
  /* PE sequence of conditional or [esi+0x30], mask after host +0x7c fill.
   * Equivalent to a single OR of all applicable dir bits into prior. */
  const uint32_t bits =
      isaac_manager_poll_a1f280_axis_pair_bits(x, y, threshold, bit_base);
  return prior | bits;
}

/* --- ABI v15: pure arg/gate CF around host ready-gate vcall+0x78 @ 0x00a1f30a --- */

extern "C" int32_t isaac_manager_poll_a1f280_ready_vcall_ok(uint32_t al) {
  /* PE @ 0x00a1f30c: test al,al / jne 0xa1f316 → body when low-byte != 0.
   * Same low-byte predicate as fill_vcall_ok; branch sense is inverted
   * (jne continue vs je skip) but pure "ok" is identical. */
  return (al & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_manager_poll_a1f280_ready_early_return(uint32_t al) {
  /* PE fall-through epilog when ready_vcall_ok fails (AL low == 0). */
  return isaac_manager_poll_a1f280_ready_vcall_ok(al) == 0 ? 1 : 0;
}

extern "C" uint32_t isaac_manager_poll_a1f280_ready_vtbl_slot(void) {
  return static_cast<uint32_t>(ISAAC_A1F280_VTBL_READY);
}

extern "C" uint32_t isaac_manager_poll_a1f280_ready_call_va(void) {
  return static_cast<uint32_t>(ISAAC_A1F280_READY_CALL_VA);
}

/* --- ABI v16: a648b0 tracked-heap CF / a6da10 teardown / a6dd30 store CF --- */

extern "C" uint32_t isaac_manager_poll_a648b0_tracker_base(
    uint32_t ctx_c7de78) {
  /* PE: lea esi,[edi+0x30]; test edi,edi; jne keep; mov esi,0xc7f618. */
  if (ctx_c7de78 == 0u) {
    return static_cast<uint32_t>(ISAAC_A648B0_TRACKER_FALLBACK_VA);
  }
  return ctx_c7de78 + static_cast<uint32_t>(ISAAC_A648B0_TRACKER_CTX_OFS);
}

extern "C" uint32_t isaac_manager_poll_a648b0_account_target(
    uint32_t ctx_c7de78) {
  /* PE mode 2 uses `add [edi+0x30],eax` / `adc [edi+0x34],eax` — the fallback
   * base selected into ESI is deliberately not consulted on this path. */
  return ctx_c7de78 + static_cast<uint32_t>(ISAAC_A648B0_TRACKER_CTX_OFS);
}

extern "C" int32_t isaac_manager_poll_a648b0_alloc_clamp_needed(
    uint32_t size_hi) {
  /* `cmp edi,-1 / jbe` is unsigned <= 0xffffffff → always taken, so the only
   * live clamp condition is the preceding `test ebx,ebx / jne`. */
  return size_hi != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_manager_poll_a648b0_alloc_size_clamped_lo(
    uint32_t size_lo, uint32_t size_hi) {
  return isaac_manager_poll_a648b0_alloc_clamp_needed(size_hi) != 0 ? 0u
                                                                   : size_lo;
}

extern "C" uint32_t isaac_manager_poll_a648b0_alloc_malloc_size_hi(
    uint32_t size_lo, uint32_t size_hi) {
  /* Clamped high is always 0 (movlpd zeroes both halves), so `adc ebx,0`
   * reduces to the carry out of (clamped_lo + 4). */
  const uint32_t lo =
      isaac_manager_poll_a648b0_alloc_size_clamped_lo(size_lo, size_hi);
  const uint32_t sum = lo + 4u;
  return sum < lo ? 1u : 0u;
}

extern "C" int32_t isaac_manager_poll_a648b0_alloc_ok(uint32_t block_ptr) {
  return block_ptr != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_manager_poll_a648b0_alloc_header_value(
    uint32_t size_lo, uint32_t size_hi) {
  /* `mov [eax],edi` stores the same padded low dword pushed to malloc. */
  return isaac_manager_poll_a648b0_alloc_malloc_size(size_lo, size_hi);
}

extern "C" uint32_t isaac_manager_poll_a648b0_alloc_payload_ptr(
    uint32_t block_ptr) {
  return block_ptr + static_cast<uint32_t>(ISAAC_A648B0_HEADER_BYTES);
}

extern "C" uint32_t isaac_manager_poll_a648b0_alloc_return(
    uint32_t block_ptr) {
  if (isaac_manager_poll_a648b0_alloc_ok(block_ptr) == 0) {
    return 0u; /* host OOM broadcast then `xor eax,eax` */
  }
  return isaac_manager_poll_a648b0_alloc_payload_ptr(block_ptr);
}

extern "C" int32_t isaac_manager_poll_a648b0_free_needed(
    uint32_t payload_ptr) {
  return payload_ptr != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_manager_poll_a648b0_free_block_ptr(
    uint32_t payload_ptr) {
  return payload_ptr - static_cast<uint32_t>(ISAAC_A648B0_HEADER_BYTES);
}

extern "C" uint32_t isaac_manager_poll_a648b0_header_bytes(void) {
  return static_cast<uint32_t>(ISAAC_A648B0_HEADER_BYTES);
}

extern "C" uint32_t isaac_manager_poll_a648b0_oom_code(void) {
  return static_cast<uint32_t>(ISAAC_A648B0_OOM_CODE);
}

extern "C" uint32_t isaac_manager_poll_a648b0_oom_host_va(void) {
  return static_cast<uint32_t>(ISAAC_A648B0_OOM_HOST_VA);
}

extern "C" uint32_t isaac_manager_poll_a648b0_malloc_iat_va(void) {
  return static_cast<uint32_t>(ISAAC_A648B0_MALLOC_IAT_VA);
}

extern "C" uint32_t isaac_manager_poll_a648b0_free_iat_va(void) {
  return static_cast<uint32_t>(ISAAC_A648B0_FREE_IAT_VA);
}

extern "C" uint32_t isaac_manager_poll_a6da10_slot_byte_offset(
    uint32_t index) {
  return index * static_cast<uint32_t>(ISAAC_A6DA10_SLOT_STRIDE); /* wrap */
}

extern "C" uint32_t isaac_manager_poll_a6da10_slot_addr(uint32_t begin_c79bec,
                                                        uint32_t index) {
  return begin_c79bec + isaac_manager_poll_a6da10_slot_byte_offset(index);
}

extern "C" uint32_t isaac_manager_poll_a6da10_memmove_dst(
    uint32_t begin_c79bec, uint32_t index) {
  return isaac_manager_poll_a6da10_slot_addr(begin_c79bec, index);
}

extern "C" uint32_t isaac_manager_poll_a6da10_memmove_src(
    uint32_t begin_c79bec, uint32_t index) {
  return isaac_manager_poll_a6da10_slot_addr(begin_c79bec, index) +
         static_cast<uint32_t>(ISAAC_A6DA10_SLOT_STRIDE);
}

extern "C" int32_t isaac_manager_poll_a6da10_teardown_step_count(
    uint32_t enable_byte) {
  return isaac_manager_poll_a6da10_free_com_maps(enable_byte) != 0
             ? static_cast<int32_t>(ISAAC_A6DA10_TEARDOWN_STEPS_FULL)
             : static_cast<int32_t>(ISAAC_A6DA10_TEARDOWN_STEPS_TAIL);
}

extern "C" int32_t isaac_manager_poll_a6da10_teardown_plan(uint32_t enable_byte,
                                                           int32_t* out_steps,
                                                           int32_t max_steps) {
  /* PE order: optional COM/extra block first (0x00a6da56…0x00a6da6e), then the
   * unconditional tail (0x00a6da71…0x00a6da7f). */
  const int32_t head[4] = {ISAAC_A6DA10_STEP_COM_RELEASE,
                           ISAAC_A6DA10_STEP_FREE_STATE_MAP_A,
                           ISAAC_A6DA10_STEP_FREE_STATE_MAP_B,
                           ISAAC_A6DA10_STEP_FREE_DEV_NAME};
  const int32_t tail[4] = {ISAAC_A6DA10_STEP_FREE_STATE,
                           ISAAC_A6DA10_STEP_FREE_DEV_BUF_A,
                           ISAAC_A6DA10_STEP_FREE_DEV_BUF_B,
                           ISAAC_A6DA10_STEP_FREE_DEV};
  const int32_t limit =
      (out_steps == nullptr || max_steps < 0) ? 0 : max_steps;
  int32_t written = 0;
  if (isaac_manager_poll_a6da10_free_com_maps(enable_byte) != 0) {
    for (int32_t i = 0; i < 4; ++i) {
      if (written < limit) {
        out_steps[written] = head[i];
      }
      ++written;
    }
  }
  for (int32_t i = 0; i < 4; ++i) {
    if (written < limit) {
      out_steps[written] = tail[i];
    }
    ++written;
  }
  return written;
}

extern "C" uint32_t isaac_manager_poll_a6da10_com_release_vtbl_slot(void) {
  return static_cast<uint32_t>(ISAAC_A6DA10_COM_RELEASE_VTBL);
}

extern "C" uint32_t isaac_manager_poll_a6dd30_axis_base_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A6DD30_OFF_AXIS_BASE);
}

extern "C" uint32_t isaac_manager_poll_a6dd30_axis_slot_offset(
    uint32_t index) {
  return index * 4u; /* movss [edx+esi*4] */
}

extern "C" uint32_t isaac_manager_poll_a6dd30_axis_slot_offset_y(
    uint32_t index) {
  return isaac_manager_poll_a6dd30_index_after_x(index) * 4u;
}

extern "C" uint32_t isaac_manager_poll_a6dd30_index_after_x(uint32_t index) {
  return index + 1u; /* inc esi */
}

extern "C" int32_t isaac_manager_poll_a6dd30_cb_needed(float new_v, float old_v,
                                                       uint32_t cb_c78d70) {
  /* Same ucomiss/lahf/test ah,0x44/jnp gate as the walk's float_changed, then
   * `test ecx,ecx / je skip` on the callback pointer. */
  if (isaac_manager_poll_a6de60_float_changed(new_v, old_v) == 0) {
    return 0;
  }
  return cb_c78d70 != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_manager_poll_a6dd30_cb_frame_bytes(void) {
  return static_cast<uint32_t>(ISAAC_A6DD30_CB_FRAME_BYTES);
}

extern "C" uint32_t isaac_manager_poll_a6dd30_cb_arg_ofs(int32_t arg_id) {
  switch (arg_id) {
    case ISAAC_A6DD30_CB_ARG_DEVICE:
      return 0x00u; /* push edi */
    case ISAAC_A6DD30_CB_ARG_INDEX:
      return 0x04u; /* push esi */
    case ISAAC_A6DD30_CB_ARG_NEW:
      return 0x08u; /* movss [esp] before the two pushes */
    case ISAAC_A6DD30_CB_ARG_OLD:
      return 0x0cu; /* movss [esp+4] */
    case ISAAC_A6DD30_CB_ARG_TIME:
      return 0x10u; /* movsd [esp+8] (f64) */
    case ISAAC_A6DD30_CB_ARG_USER:
      return 0x18u; /* push [0xc75dac] */
    default:
      return 0xffffffffu;
  }
}

/* --- ABI v17: sibling device scan/connect FUN_00a6dab0 pure islands --- */

extern "C" int32_t isaac_manager_poll_a6dab0_scan_enabled(
    uint32_t enable_c7e300) {
  /* PE @ 0x00a6dad3: cmp byte [0xc7e300],0 / je epilog. */
  return (enable_c7e300 & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_manager_poll_a6dab0_pump_needed(
    uint32_t window_c7e2d4) {
  return window_c7e2d4 != 0u ? 1 : 0;
}

extern "C" int32_t isaac_manager_poll_a6dab0_enum_needed(uint32_t flag_c7ac6b) {
  return (flag_c7ac6b & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_manager_poll_a6dab0_enum_flag_after(void) {
  /* PE @ 0x00a6db82: mov byte [0xc7ac6b],0 on both COM outcomes. */
  return 0;
}

extern "C" int32_t isaac_manager_poll_a6dab0_slot_scan_needed(
    uint32_t flag_c7e301) {
  return (flag_c7e301 & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_manager_poll_a6dab0_slot_continue(uint32_t slot) {
  const uint32_t next = slot + 1u; /* inc esi (wrap) */
  return next < static_cast<uint32_t>(ISAAC_A6DAB0_SLOT_COUNT) ? 1 : 0;
}

extern "C" uint32_t isaac_manager_poll_a6dab0_slot_table_addr(uint32_t slot) {
  return static_cast<uint32_t>(ISAAC_A6DAB0_SLOT_TABLE_VA) + slot * 4u;
}

extern "C" uint32_t isaac_manager_poll_a6dab0_name_table_addr(uint32_t slot) {
  return static_cast<uint32_t>(ISAAC_A6DAB0_NAME_TABLE_VA) + slot * 4u;
}

extern "C" uint32_t isaac_manager_poll_a6dab0_slot_clear_value(void) {
  return 0u;
}

extern "C" int32_t isaac_manager_poll_a6dab0_query_ok(int32_t status) {
  return status == 0 ? 1 : 0;
}

extern "C" int32_t isaac_manager_poll_a6dab0_record_present(
    uint32_t record_ptr) {
  return record_ptr != 0u ? 1 : 0;
}

extern "C" int32_t isaac_manager_poll_a6dab0_connect_needed(
    int32_t status, uint32_t record_ptr) {
  if (isaac_manager_poll_a6dab0_query_ok(status) == 0) {
    return 0;
  }
  return isaac_manager_poll_a6dab0_record_present(record_ptr) == 0 ? 1 : 0;
}

extern "C" int32_t isaac_manager_poll_a6dab0_disconnect_needed(
    int32_t status, uint32_t record_ptr) {
  if (isaac_manager_poll_a6dab0_query_ok(status) != 0) {
    return 0;
  }
  return isaac_manager_poll_a6dab0_record_present(record_ptr) != 0 ? 1 : 0;
}

extern "C" int32_t isaac_manager_poll_a6dab0_caps_mode_ok(
    uint32_t mode_c7e304) {
  return mode_c7e304 == static_cast<uint32_t>(ISAAC_A6DAB0_CAPS_MODE_MATCH) ? 1
                                                                            : 0;
}

extern "C" int32_t isaac_manager_poll_a6dab0_caps_call_needed(
    uint32_t mode_c7e304, uint32_t hook_c7e2f8) {
  if (isaac_manager_poll_a6dab0_caps_mode_ok(mode_c7e304) == 0) {
    return 0;
  }
  return hook_c7e2f8 != 0u ? 1 : 0;
}

extern "C" int32_t isaac_manager_poll_a6dab0_caps_ok(int32_t caps_status) {
  /* PE @ 0x00a6dbf6: test eax,eax / jne log-error. */
  return caps_status == 0 ? 1 : 0;
}

extern "C" uint32_t isaac_manager_poll_a6dab0_id_word(uint32_t raw) {
  return raw & 0xffffu;
}

extern "C" uint32_t isaac_manager_poll_a6dab0_next_device_id(
    uint32_t counter_c7e298) {
  return counter_c7e298 + 1u; /* lea ecx,[edx+1] (wrap) */
}

extern "C" uint32_t isaac_manager_poll_a6dab0_state_enable_value(void) {
  return static_cast<uint32_t>(ISAAC_A6DAB0_STATE_ENABLE_VALUE);
}

extern "C" uint32_t isaac_manager_poll_a6dab0_record_field_ofs(
    int32_t field_id) {
  switch (field_id) {
    case ISAAC_A6DAB0_REC_ID:
      return 0x00u;
    case ISAAC_A6DAB0_REC_NAME:
      return 0x04u;
    case ISAAC_A6DAB0_REC_ENABLED:
      return 0x08u;
    case ISAAC_A6DAB0_REC_VID:
      return 0x0au;
    case ISAAC_A6DAB0_REC_PID:
      return 0x0cu;
    case ISAAC_A6DAB0_REC_AXIS_COUNT:
      return 0x10u;
    case ISAAC_A6DAB0_REC_BUTTON_COUNT:
      return 0x14u;
    case ISAAC_A6DAB0_REC_AXIS_ARRAY:
      return 0x18u;
    case ISAAC_A6DAB0_REC_BUTTON_ARRAY:
      return 0x1cu;
    case ISAAC_A6DAB0_REC_STATE:
      return 0x20u;
    default:
      return 0xffffffffu;
  }
}

extern "C" uint32_t isaac_manager_poll_a6dab0_state_field_ofs(
    int32_t field_id) {
  switch (field_id) {
    case ISAAC_A6DAB0_ST_ENABLE:
      return 0x00u;
    case ISAAC_A6DAB0_ST_SLOT:
      return 0x2cu;
    default:
      return 0xffffffffu;
  }
}

extern "C" void isaac_manager_poll_a6dab0_axis_calloc_args(uint32_t axis_count,
                                                           uint32_t* out_num,
                                                           uint32_t* out_size) {
  /* PE push [edi+0x10]; push 4 → cdecl (4, axis_count). */
  if (out_num != nullptr) {
    *out_num = static_cast<uint32_t>(ISAAC_A6DAB0_AXIS_ELEM_BYTES);
  }
  if (out_size != nullptr) {
    *out_size = axis_count;
  }
}

extern "C" void isaac_manager_poll_a6dab0_button_calloc_args(
    uint32_t button_count, uint32_t* out_num, uint32_t* out_size) {
  if (out_num != nullptr) {
    *out_num = static_cast<uint32_t>(ISAAC_A6DAB0_BUTTON_ELEM_BYTES);
  }
  if (out_size != nullptr) {
    *out_size = button_count;
  }
}

extern "C" int32_t isaac_manager_poll_a6dab0_push_needs_grow(
    uint32_t end_c79bf0, uint32_t capacity_c79bf4) {
  return end_c79bf0 == capacity_c79bf4 ? 1 : 0;
}

extern "C" uint32_t isaac_manager_poll_a6dab0_end_after_push(
    uint32_t end_c79bf0) {
  return end_c79bf0 + 4u;
}

extern "C" int32_t isaac_manager_poll_a6dab0_connect_cb_needed(
    uint32_t cb_c75da8) {
  return cb_c75da8 != 0u ? 1 : 0;
}

extern "C" int32_t isaac_manager_poll_a6dab0_search_loop_needed(
    int32_t count) {
  /* PE test eax,eax / je — only exactly zero skips the scan. */
  return count != 0 ? 1 : 0;
}

extern "C" int32_t isaac_manager_poll_a6dab0_search_index_continue(
    uint32_t index, int32_t count) {
  /* PE inc ecx; cmp ecx,eax; jb — unsigned compare against the signed count. */
  const uint32_t next = index + 1u;
  return next < static_cast<uint32_t>(count) ? 1 : 0;
}

extern "C" uint32_t isaac_manager_poll_a6dab0_vector_find(
    const uint32_t* entries, uint32_t count, uint32_t target_id) {
  if (entries == nullptr || count == 0u) {
    return static_cast<uint32_t>(ISAAC_A6DAB0_SEARCH_NOT_FOUND);
  }
  for (uint32_t i = 0u; i < count; ++i) {
    if (entries[i] == target_id) {
      return i;
    }
  }
  return static_cast<uint32_t>(ISAAC_A6DAB0_SEARCH_NOT_FOUND);
}

extern "C" uint32_t isaac_manager_poll_a6dab0_slot_count(void) {
  return static_cast<uint32_t>(ISAAC_A6DAB0_SLOT_COUNT);
}

extern "C" uint32_t isaac_manager_poll_a6dab0_enum_vtbl_slot(void) {
  return static_cast<uint32_t>(ISAAC_A6DAB0_ENUM_VTBL);
}

extern "C" uint32_t isaac_manager_poll_a6dab0_enum_callback_va(void) {
  return static_cast<uint32_t>(ISAAC_A6DAB0_ENUM_CALLBACK_VA);
}

extern "C" uint32_t isaac_manager_poll_a6dab0_msg_va_enum_fail(void) {
  return static_cast<uint32_t>(ISAAC_A6DAB0_MSG_VA_ENUM_FAIL);
}

extern "C" uint32_t isaac_manager_poll_a6dab0_msg_va_connect(void) {
  return static_cast<uint32_t>(ISAAC_A6DAB0_MSG_VA_CONNECT);
}

extern "C" uint32_t isaac_manager_poll_a6dab0_msg_va_caps_fail(void) {
  return static_cast<uint32_t>(ISAAC_A6DAB0_MSG_VA_CAPS_FAIL);
}

/* --- ABI v18: FUN_00a220c0 poll thread + FUN_00a6cf80 one-time init --- */

extern "C" int32_t isaac_manager_poll_a220c0_thread_run(
    uint32_t flags_c57b1c) {
  /* PE `test byte [0xc57b1c],2 / je ret` — byte-wide test. */
  return ((flags_c57b1c & 0xffu) &
          static_cast<uint32_t>(ISAAC_A220C0_RUN_BIT)) != 0u
             ? 1
             : 0;
}

extern "C" int32_t isaac_manager_poll_a220c0_thread_continue(
    uint32_t flags_c57b1c) {
  return isaac_manager_poll_a220c0_thread_run(flags_c57b1c);
}

extern "C" int32_t isaac_manager_poll_a220c0_spawn_needed(
    uint32_t flags_c57b1c) {
  return isaac_manager_poll_a220c0_thread_run(flags_c57b1c) == 0 ? 1 : 0;
}

extern "C" uint32_t isaac_manager_poll_a220c0_flag_after_start(
    uint32_t flags_c57b1c) {
  return flags_c57b1c | static_cast<uint32_t>(ISAAC_A220C0_RUN_BIT);
}

extern "C" uint32_t isaac_manager_poll_a220c0_flag_after_stop(
    uint32_t flags_c57b1c) {
  return flags_c57b1c & ~static_cast<uint32_t>(ISAAC_A220C0_RUN_BIT);
}

extern "C" uint32_t isaac_manager_poll_a220c0_scan_iterations(
    const uint32_t* run_seq, uint32_t n) {
  if (run_seq == nullptr || n == 0u) {
    return 0u;
  }
  uint32_t scans = 0u;
  for (uint32_t i = 0u; i < n; ++i) {
    if (isaac_manager_poll_a220c0_thread_run(run_seq[i]) == 0) {
      break;
    }
    ++scans;
  }
  return scans;
}

extern "C" uint32_t isaac_manager_poll_a220c0_sleep_ms(void) {
  return static_cast<uint32_t>(ISAAC_A220C0_SLEEP_MS);
}

extern "C" uint32_t isaac_manager_poll_a220c0_thread_proc_va(void) {
  return static_cast<uint32_t>(ISAAC_A220C0_THREAD_PROC_VA);
}

extern "C" uint32_t isaac_manager_poll_a220c0_spawn_vtbl_slot(void) {
  return static_cast<uint32_t>(ISAAC_A220C0_SPAWN_VTBL);
}

extern "C" int32_t isaac_manager_poll_a6cf80_init_skip(
    uint32_t enable_c7e300) {
  /* PE `cmp byte [0xc7e300],0 / jne epilog`. */
  return (enable_c7e300 & 0xffu) != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_manager_poll_a6cf80_probe_name_va(int32_t probe) {
  switch (probe) {
    case 0:
      return 0x00ba1750u; /* "XInput1_4.dll" */
    case 1:
      return 0x00ba1760u; /* "bin\\XInput1_4.dll" */
    case 2:
      return 0x00ba1974u; /* "XInput1_3.dll" */
    case 3:
      return 0x00ba18f4u; /* "bin\\XInput1_3.dll" */
    default:
      return 0xffffffffu;
  }
}

extern "C" uint32_t isaac_manager_poll_a6cf80_mode_for_probe(int32_t probe) {
  if (probe == 0 || probe == 1) {
    return static_cast<uint32_t>(ISAAC_A6CF80_MODE_MODERN);
  }
  if (probe == 2 || probe == 3) {
    return static_cast<uint32_t>(ISAAC_A6CF80_MODE_LEGACY);
  }
  return static_cast<uint32_t>(ISAAC_A6CF80_MODE_NONE);
}

extern "C" uint32_t isaac_manager_poll_a6cf80_select_probe(
    const uint8_t* loaded, uint32_t n) {
  if (loaded == nullptr || n == 0u) {
    return static_cast<uint32_t>(ISAAC_A6CF80_PROBE_NOT_FOUND);
  }
  for (uint32_t i = 0u; i < n; ++i) {
    if (loaded[i] != 0) {
      return i;
    }
  }
  return static_cast<uint32_t>(ISAAC_A6CF80_PROBE_NOT_FOUND);
}

extern "C" uint32_t isaac_manager_poll_a6cf80_mode_after_probes(
    const uint8_t* loaded, uint32_t n) {
  const uint32_t probe = isaac_manager_poll_a6cf80_select_probe(loaded, n);
  if (probe == static_cast<uint32_t>(ISAAC_A6CF80_PROBE_NOT_FOUND)) {
    return static_cast<uint32_t>(ISAAC_A6CF80_MODE_NONE);
  }
  return isaac_manager_poll_a6cf80_mode_for_probe(static_cast<int32_t>(probe));
}

extern "C" uint32_t isaac_manager_poll_a6cf80_log_level_for_mode(
    uint32_t mode) {
  /* PE loads eax with the level immediate on each branch (v11 level enum). */
  if (mode == static_cast<uint32_t>(ISAAC_A6CF80_MODE_MODERN)) {
    return static_cast<uint32_t>(ISAAC_A112C0_LEVEL_INFO);
  }
  if (mode == static_cast<uint32_t>(ISAAC_A6CF80_MODE_LEGACY)) {
    return static_cast<uint32_t>(ISAAC_A112C0_LEVEL_WARN);
  }
  return static_cast<uint32_t>(ISAAC_A112C0_LEVEL_ERROR);
}

extern "C" uint32_t isaac_manager_poll_a6cf80_log_msg_va_for_mode(
    uint32_t mode) {
  if (mode == static_cast<uint32_t>(ISAAC_A6CF80_MODE_MODERN)) {
    return 0x00ba1960u;
  }
  if (mode == static_cast<uint32_t>(ISAAC_A6CF80_MODE_LEGACY)) {
    return 0x00ba1908u;
  }
  return 0x00ba19b0u;
}

extern "C" uint32_t isaac_manager_poll_a6cf80_scan_flag_after(uint32_t mode) {
  /* PE stores 1 on both success branches and 0 (esi) on the failure path. */
  return mode != static_cast<uint32_t>(ISAAC_A6CF80_MODE_NONE) ? 1u : 0u;
}

extern "C" int32_t isaac_manager_poll_a6cf80_caps_hook_probe_needed(
    uint32_t mode) {
  return mode == static_cast<uint32_t>(ISAAC_A6CF80_MODE_MODERN) ? 1 : 0;
}

extern "C" uint32_t isaac_manager_poll_a6cf80_hook_slot_target_va(
    int32_t slot) {
  switch (slot) {
    case ISAAC_A6CF80_HOOK_ORD_PRIMARY:
      return 0x00c7e29cu;
    case ISAAC_A6CF80_HOOK_GET_STATE:
      return 0x00c7e2dcu;
    case ISAAC_A6CF80_HOOK_SET_STATE:
      return 0x00c7e2f0u;
    case ISAAC_A6CF80_HOOK_GET_CAPS:
      return 0x00c7e2f4u;
    case ISAAC_A6CF80_HOOK_CAPS_EX:
      return 0x00c7e2f8u;
    default:
      return 0xffffffffu;
  }
}

extern "C" uint32_t isaac_manager_poll_a6cf80_hook_slot_name_va(int32_t slot) {
  switch (slot) {
    case ISAAC_A6CF80_HOOK_GET_STATE:
      return 0x00ba1a08u; /* "XInputGetState" */
    case ISAAC_A6CF80_HOOK_SET_STATE:
      return 0x00ba1984u; /* "XInputSetState" */
    case ISAAC_A6CF80_HOOK_GET_CAPS:
      return 0x00ba1994u; /* "XInputGetCapabilities" */
    default:
      return 0xffffffffu; /* ordinal slots and unknown ids */
  }
}

extern "C" uint32_t isaac_manager_poll_a6cf80_hook_slot_ordinal(int32_t slot) {
  switch (slot) {
    case ISAAC_A6CF80_HOOK_ORD_PRIMARY:
      return static_cast<uint32_t>(ISAAC_A6CF80_PROC_ORD_PRIMARY);
    case ISAAC_A6CF80_HOOK_CAPS_EX:
      return static_cast<uint32_t>(ISAAC_A6CF80_PROC_ORD_CAPS_EX);
    default:
      return 0xffffffffu; /* named slots and unknown ids */
  }
}

extern "C" int32_t isaac_manager_poll_a6cf80_coinit_retry_needed(uint32_t hr) {
  return hr == static_cast<uint32_t>(ISAAC_A6CF80_COINIT_CHANGED_MODE) ? 1 : 0;
}

extern "C" uint32_t isaac_manager_poll_a6cf80_enable_after_init(void) {
  return 1u; /* mov byte [0xc7e300],1 @ 0x00a6d132 */
}

extern "C" uint32_t isaac_manager_poll_a6cf80_enum_flag_after_init(void) {
  return 1u; /* mov byte [0xc7ac6b],1 @ 0x00a6d139 */
}

extern "C" uint32_t isaac_manager_poll_a6cf80_probe_count(void) {
  return static_cast<uint32_t>(ISAAC_A6CF80_PROBE_COUNT);
}

extern "C" uint32_t isaac_manager_poll_a6cf80_coinit_flags_first(void) {
  return static_cast<uint32_t>(ISAAC_A6CF80_COINIT_FLAGS_FIRST);
}

extern "C" uint32_t isaac_manager_poll_a6cf80_coinit_flags_retry(void) {
  return static_cast<uint32_t>(ISAAC_A6CF80_COINIT_FLAGS_RETRY);
}

extern "C" uint32_t isaac_manager_poll_a6cf80_notify_filter_bytes(void) {
  return static_cast<uint32_t>(ISAAC_A6CF80_NOTIFY_FILTER_BYTES);
}

extern "C" uint32_t isaac_manager_poll_a6cf80_notify_filter_cbsize(void) {
  return static_cast<uint32_t>(ISAAC_A6CF80_NOTIFY_FILTER_CBSIZE);
}

/* --- ABI v19: Manager shell body after the poll prefix (FUN_00954cd0) --- */

extern "C" uint32_t isaac_manager_shell_receiver_ofs(int32_t recv_id) {
  switch (recv_id) {
    case ISAAC_MANAGER_SHELL_RECV_SELF:
      return 0u; /* mov ecx, edi @ 0x00954f82 */
    case ISAAC_MANAGER_SHELL_RECV_9C34F0:
      return static_cast<uint32_t>(ISAAC_MANAGER_SHELL_OFF_SUB_9C34F0);
    case ISAAC_MANAGER_SHELL_RECV_APPROACH:
      return static_cast<uint32_t>(ISAAC_MANAGER_SHELL_OFF_APPROACH);
    case ISAAC_MANAGER_SHELL_RECV_90B150:
      return static_cast<uint32_t>(ISAAC_MANAGER_SHELL_OFF_SUB_90B150);
    default:
      return 0xffffffffu;
  }
}

extern "C" uint32_t isaac_manager_shell_receiver_addr(uint32_t manager,
                                                      int32_t recv_id) {
  const uint32_t ofs = isaac_manager_shell_receiver_ofs(recv_id);
  if (ofs == 0xffffffffu) {
    return 0xffffffffu;
  }
  return manager + ofs;
}

extern "C" uint32_t isaac_manager_approach_slot_addr(uint32_t approach_base,
                                                     uint32_t slot) {
  /* lea esi,[ecx+0x114] then `add esi,0x130` per iteration. */
  return approach_base +
         static_cast<uint32_t>(ISAAC_MANAGER_APPROACH_FIRST_OFS) +
         slot * static_cast<uint32_t>(ISAAC_MANAGER_APPROACH_SLOT_STRIDE);
}

extern "C" int32_t isaac_manager_approach_slot_continue(uint32_t slot) {
  const uint32_t next = slot + 1u; /* inc edi (wrap) */
  return next < static_cast<uint32_t>(ISAAC_MANAGER_APPROACH_SLOT_COUNT) ? 1
                                                                        : 0;
}

extern "C" int32_t isaac_manager_approach_uses_add_path(float current,
                                                        float target) {
  /* jbe is CF|ZF; comiss sets both on unordered, so NaN takes the add path. */
  return !(current > target) ? 1 : 0;
}

extern "C" int32_t isaac_manager_approach_host_call_needed(uint32_t mode_10) {
  return mode_10 != static_cast<uint32_t>(ISAAC_MANAGER_APPROACH_MODE_SKIP_HOST)
             ? 1
             : 0;
}

extern "C" uint32_t isaac_manager_approach_host_arg_slot(uint32_t slot) {
  return slot;
}

extern "C" uint32_t isaac_manager_shell_flag_b_after_loop(void) {
  return 0u;
}

extern "C" int32_t isaac_manager_shell_probe_needed(uint32_t probe_a_4c610,
                                                    int32_t probe_b_4c658) {
  if (probe_a_4c610 != 0u) {
    return 0; /* jne skip */
  }
  return probe_b_4c658 <= 0 ? 1 : 0; /* signed jg skip */
}

extern "C" int32_t isaac_manager_shell_sub_90b150_blocks(uint32_t al) {
  return (al & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_manager_shell_state_uses_game(int32_t state_8) {
  return (state_8 == 2 || state_8 == 5) ? 1 : 0;
}

extern "C" int32_t isaac_manager_shell_game_present(uint32_t game_c71678) {
  return game_c71678 != 0u ? 1 : 0;
}

extern "C" int32_t isaac_manager_shell_silent_return(uint32_t flag_a_4abc4,
                                                     uint32_t flag_b_4abc5) {
  /* PE 0x00955134/0x0095513d: `cmp byte ptr [edi+0x4abc4],0` — byte tests. */
  if ((flag_a_4abc4 & 0xffu) == 0u) {
    return 0;
  }
  return (flag_b_4abc5 & 0xffu) == 0u ? 1 : 0;
}

extern "C" uint32_t isaac_manager_shell_state_index(int32_t state_8) {
  return static_cast<uint32_t>(state_8) - 1u; /* dec eax (wrap) */
}

extern "C" int32_t isaac_manager_shell_state_in_table(int32_t state_8) {
  /* cmp eax,4 / ja default — unsigned, so state 0 wraps out of range. */
  return isaac_manager_shell_state_index(state_8) <= 4u ? 1 : 0;
}

extern "C" uint32_t isaac_manager_shell_state_target_va(int32_t state_8) {
  if (isaac_manager_shell_state_in_table(state_8) == 0) {
    return static_cast<uint32_t>(ISAAC_MANAGER_SHELL_STATE_DEFAULT_VA);
  }
  switch (isaac_manager_shell_state_index(state_8)) {
    case 0u:
      return 0x009553a6u;
    case 1u:
      return 0x009551a3u;
    case 2u:
      return 0x009553d7u;
    case 3u:
      return 0x009553efu;
    default:
      return 0x009553e4u;
  }
}

extern "C" uint32_t isaac_manager_shell_state_table_va(void) {
  return static_cast<uint32_t>(ISAAC_MANAGER_SHELL_STATE_TABLE_VA);
}

extern "C" uint32_t isaac_manager_shell_state_default_va(void) {
  return static_cast<uint32_t>(ISAAC_MANAGER_SHELL_STATE_DEFAULT_VA);
}

extern "C" uint32_t isaac_manager_approach_slot_count(void) {
  return static_cast<uint32_t>(ISAAC_MANAGER_APPROACH_SLOT_COUNT);
}

extern "C" uint32_t isaac_manager_approach_slot_stride(void) {
  return static_cast<uint32_t>(ISAAC_MANAGER_APPROACH_SLOT_STRIDE);
}

/* --- ABI v20: post-opaque-call recapture (F10 / F11) + state-2 arm --- */

extern "C" int32_t isaac_manager_poll_a6dd30_x_cb_ran(float new_x, float old_x,
                                                      uint32_t cb_before) {
  return isaac_manager_poll_a6dd30_cb_needed(new_x, old_x, cb_before);
}

extern "C" uint32_t isaac_manager_poll_a6dd30_y_axis_base(
    int32_t x_cb_ran, uint32_t base_before, uint32_t base_after) {
  /* PE re-reads [edi+0x18] at 0x00a6dddf only on the callback-taken path. */
  return x_cb_ran != 0 ? base_after : base_before;
}

extern "C" uint32_t isaac_manager_poll_a6dd30_y_cb_ptr(int32_t x_cb_ran,
                                                       uint32_t cb_before,
                                                       uint32_t cb_after) {
  /* PE re-reads DAT_00c78d70 at 0x00a6dde5 under the same condition. */
  return x_cb_ran != 0 ? cb_after : cb_before;
}

extern "C" int32_t isaac_manager_poll_a6dd30_y_cb_needed(float new_y,
                                                         float old_y,
                                                         int32_t x_cb_ran,
                                                         uint32_t cb_before,
                                                         uint32_t cb_after) {
  const uint32_t cb =
      isaac_manager_poll_a6dd30_y_cb_ptr(x_cb_ran, cb_before, cb_after);
  return isaac_manager_poll_a6dd30_cb_needed(new_y, old_y, cb);
}

extern "C" int32_t isaac_manager_poll_a6dd30_timestamp_is_stable(void) {
  /* xmm3 spilled @ 0x00a6dd3d, reloaded from [ebp-0xc] @ 0x00a6ddeb. */
  return 1;
}

extern "C" uint32_t isaac_manager_poll_a1f280_action_slot_mode_cc(
    uint32_t mode_cc_after_vcall) {
  /* The offset uses the 0x00a1f4e4 read, not the 0x00a1f4c9 gate read. */
  return mode_cc_after_vcall;
}

extern "C" uint32_t isaac_manager_poll_a1f280_action_store_base(
    int32_t oor_log_ran, uint32_t begin_before, uint32_t begin_after) {
  return oor_log_ran != 0 ? begin_after : begin_before;
}

extern "C" uint32_t isaac_manager_poll_a1f280_action_store_addr(
    uint32_t store_base, uint32_t mode_cc, uint32_t index) {
  return store_base +
         isaac_manager_poll_a1f280_buffer_slot_offset(mode_cc, index);
}

extern "C" int32_t isaac_manager_poll_a1f280_action_count_is_prelog(void) {
  return 1;
}

extern "C" int32_t isaac_manager_state2_blocked(uint32_t flag_4b130) {
  return (flag_4b130 & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_manager_state2_parity_alt(
    uint32_t counter_low_4abbc) {
  return ((counter_low_4abbc & 0xffu) & 1u) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_manager_state2_sweep_needed(uint32_t entity_count) {
  /* cmp [container+0x1264], esi(0) / jbe skip → runs only when count != 0. */
  return entity_count != 0u ? 1 : 0;
}

extern "C" int32_t isaac_manager_state2_sweep_step(
    uint32_t index, uint32_t entity_count_reloaded) {
  const uint32_t next = index + 1u; /* inc esi (wrap) */
  return next < entity_count_reloaded ? 1 : 0;
}

extern "C" uint32_t isaac_manager_state2_entity_slot_addr(
    uint32_t array_base_reloaded, uint32_t index) {
  return array_base_reloaded + index * 4u;
}

extern "C" int32_t isaac_manager_state2_entity_needs_fixup(uint32_t flag_175) {
  return (flag_175 & 0xffu) != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_manager_state2_fixup_src_ofs(int32_t pair_id) {
  switch (pair_id) {
    case ISAAC_STATE2_FIXUP_A:
      return static_cast<uint32_t>(ISAAC_STATE2_OFF_ENTITY_SRC_A);
    case ISAAC_STATE2_FIXUP_B:
      return static_cast<uint32_t>(ISAAC_STATE2_OFF_ENTITY_SRC_B);
    default:
      return 0xffffffffu;
  }
}

extern "C" uint32_t isaac_manager_state2_fixup_dst_ofs(int32_t pair_id) {
  switch (pair_id) {
    case ISAAC_STATE2_FIXUP_A:
      return static_cast<uint32_t>(ISAAC_STATE2_OFF_ENTITY_DST_A);
    case ISAAC_STATE2_FIXUP_B:
      return static_cast<uint32_t>(ISAAC_STATE2_OFF_ENTITY_DST_B);
    default:
      return 0xffffffffu;
  }
}

extern "C" uint32_t isaac_manager_state2_entity_flag_after_fixup(void) {
  return 0u;
}

/* --- ABI v21: complete state table + FUN_009505e0 + pre-dispatch ladder --- */

extern "C" int32_t isaac_manager_9505e0_gate(uint32_t dword_1918,
                                             uint32_t byte_1928,
                                             uint32_t dword_1b6c,
                                             uint32_t byte_1b7c) {
  /* 0x009505e0 `cmp dword [ecx+0x1918],0 / je 0x9505f2` — full-word test. */
  if (dword_1918 != 0u) {
    /* 0x009505e9 `cmp byte [ecx+0x1928],0 / jne 0x950604` — LOW BYTE only. */
    if ((byte_1928 & 0xffu) != 0u) {
      return 1; /* mov al,1 */
    }
  }
  /* 0x009505f2 `cmp dword [ecx+0x1b6c],0 / je 0x950607` — full-word test. */
  if (dword_1b6c == 0u) {
    return 0; /* xor al,al */
  }
  /* 0x009505fb `cmp byte [ecx+0x1b7c],0 / je 0x950607` — LOW BYTE only. */
  return (byte_1b7c & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_manager_9505e0_reads_b_pair(uint32_t dword_1918,
                                                     uint32_t byte_1928) {
  /* The B pair is skipped exactly when the A pair already returned 1. */
  if (dword_1918 != 0u && (byte_1928 & 0xffu) != 0u) {
    return 0;
  }
  return 1;
}

extern "C" uint32_t isaac_manager_9505e0_field_ofs(int32_t field_id) {
  switch (field_id) {
    case ISAAC_9505E0_FIELD_A_DWORD:
      return static_cast<uint32_t>(ISAAC_9505E0_OFF_A_DWORD);
    case ISAAC_9505E0_FIELD_A_BYTE:
      return static_cast<uint32_t>(ISAAC_9505E0_OFF_A_BYTE);
    case ISAAC_9505E0_FIELD_B_DWORD:
      return static_cast<uint32_t>(ISAAC_9505E0_OFF_B_DWORD);
    case ISAAC_9505E0_FIELD_B_BYTE:
      return static_cast<uint32_t>(ISAAC_9505E0_OFF_B_BYTE);
    default:
      return 0xffffffffu;
  }
}

extern "C" uint32_t isaac_manager_9505e0_manager_ofs(int32_t field_id) {
  const uint32_t ofs = isaac_manager_9505e0_field_ofs(field_id);
  if (ofs == 0xffffffffu) {
    return 0xffffffffu;
  }
  return static_cast<uint32_t>(ISAAC_9505E0_RECV_OFS) + ofs;
}

extern "C" int32_t isaac_manager_9c3990_node_matches(uint32_t flags_byte_24) {
  /* 0x009c39b3 `test byte [edx+0x24],4 / jne found`. */
  return ((flags_byte_24 & 0xffu) &
          static_cast<uint32_t>(ISAAC_9C3990_MATCH_BIT)) != 0u
             ? 1
             : 0;
}

extern "C" int32_t isaac_manager_9c3990_walk_continue(uint32_t node,
                                                      uint32_t head) {
  return node != head ? 1 : 0;
}

extern "C" uint32_t isaac_manager_9c3990_scanned(const uint8_t* flag_bytes,
                                                 uint32_t n) {
  if (flag_bytes == nullptr) {
    return 0u;
  }
  for (uint32_t i = 0u; i < n; ++i) {
    if (isaac_manager_9c3990_node_matches(flag_bytes[i]) != 0) {
      return i + 1u; /* `jne 0x9c39ce` leaves the loop at the first match */
    }
  }
  return n;
}

extern "C" int32_t isaac_manager_9c3990_result(const uint8_t* flag_bytes,
                                               uint32_t n) {
  if (flag_bytes == nullptr) {
    return 0; /* bl stays 0 through the empty-list exit at 0x009c39d0 */
  }
  for (uint32_t i = 0u; i < n; ++i) {
    if (isaac_manager_9c3990_node_matches(flag_bytes[i]) != 0) {
      return 1;
    }
  }
  return 0;
}

extern "C" int32_t isaac_manager_9c3990_unlock_always(void) {
  return 1;
}

extern "C" int32_t isaac_manager_9c3990_lock_arg(void) {
  return static_cast<int32_t>(ISAAC_9C3990_LOCK_ARG);
}

extern "C" uint32_t isaac_manager_9c3990_lock_vtbl_slot(void) {
  return static_cast<uint32_t>(ISAAC_9C3990_LOCK_VTBL);
}

extern "C" uint32_t isaac_manager_9c3990_unlock_vtbl_slot(void) {
  return static_cast<uint32_t>(ISAAC_9C3990_UNLOCK_VTBL);
}

extern "C" int32_t isaac_manager_state1_second_gate_needed(uint32_t probe_al,
                                                           uint32_t mode_40) {
  /* `je 0x9553c5` on the mode match wins outright; only when it fails does the
     `sete cl` result (probe_al == 0) decide. */
  if (mode_40 == static_cast<uint32_t>(ISAAC_STATE1_MODE_MATCH)) {
    return 1;
  }
  return (probe_al & 0xffu) == 0u ? 1 : 0;
}

extern "C" int32_t isaac_manager_state1_mode_read_unconditional(void) {
  return 1;
}

extern "C" int32_t isaac_manager_state1_terminal_needed(uint32_t probe_al,
                                                        uint32_t mode_40,
                                                        uint32_t gate_al) {
  if (isaac_manager_state1_second_gate_needed(probe_al, mode_40) == 0) {
    return 0;
  }
  /* 0x009553ce `jne 0x9553ef` — a set predicate skips FUN_009897d0. */
  return (gate_al & 0xffu) == 0u ? 1 : 0;
}

extern "C" int32_t isaac_manager_state1_terminal_needed_from_fields(
    uint32_t probe_al, uint32_t mode_40, uint32_t dword_1918,
    uint32_t byte_1928, uint32_t dword_1b6c, uint32_t byte_1b7c) {
  if (isaac_manager_state1_second_gate_needed(probe_al, mode_40) == 0) {
    return 0; /* FUN_009505e0 is not even called on this path */
  }
  const uint32_t gate = static_cast<uint32_t>(
      isaac_manager_9505e0_gate(dword_1918, byte_1928, dword_1b6c, byte_1b7c));
  return isaac_manager_state1_terminal_needed(probe_al, mode_40, gate);
}

extern "C" int32_t isaac_manager_state2_head_gate_needed(uint32_t probe_al) {
  /* 0x009551b0 `jne 0x9551c2` — entry needs a clear probe result. */
  return (probe_al & 0xffu) == 0u ? 1 : 0;
}

extern "C" int32_t isaac_manager_state2_head_terminal_needed(
    uint32_t probe_al, uint32_t gate_al) {
  if (isaac_manager_state2_head_gate_needed(probe_al) == 0) {
    return 0;
  }
  return (gate_al & 0xffu) == 0u ? 1 : 0;
}

extern "C" int32_t isaac_manager_state2_head_terminal_needed_from_fields(
    uint32_t probe_al, uint32_t dword_1918, uint32_t byte_1928,
    uint32_t dword_1b6c, uint32_t byte_1b7c) {
  if (isaac_manager_state2_head_gate_needed(probe_al) == 0) {
    return 0;
  }
  const uint32_t gate = static_cast<uint32_t>(
      isaac_manager_9505e0_gate(dword_1918, byte_1928, dword_1b6c, byte_1b7c));
  return isaac_manager_state2_head_terminal_needed(probe_al, gate);
}

extern "C" uint32_t isaac_manager_shell_arm_recv_ofs(int32_t state_8) {
  switch (state_8) {
    case 1:
    case 2:
      return static_cast<uint32_t>(ISAAC_STATE_ARM_PROBE_RECV_OFS);
    case 3:
      return static_cast<uint32_t>(ISAAC_STATE3_RECV_OFS);
    case 5:
      return static_cast<uint32_t>(ISAAC_STATE5_RECV_OFS);
    default:
      return 0xffffffffu; /* state 4 has no arm body */
  }
}

extern "C" uint32_t isaac_manager_shell_arm_call_va(int32_t state_8) {
  switch (state_8) {
    case 1:
    case 2:
      return static_cast<uint32_t>(ISAAC_STATE_ARM_PROBE_VA);
    case 3:
      return static_cast<uint32_t>(ISAAC_STATE3_CALL_VA);
    case 5:
      return static_cast<uint32_t>(ISAAC_STATE5_CALL_VA);
    default:
      return 0xffffffffu;
  }
}

extern "C" uint32_t isaac_manager_state1_terminal_va(void) {
  return static_cast<uint32_t>(ISAAC_STATE1_TERMINAL_VA);
}

extern "C" uint32_t isaac_manager_state2_head_terminal_va(void) {
  return static_cast<uint32_t>(ISAAC_STATE2_TERMINAL_VA);
}

extern "C" int32_t isaac_manager_predispatch_call_needed(
    uint32_t obj_21c38, uint32_t suppress_29fb8) {
  if (obj_21c38 == 0u) {
    return 0; /* 0x00955158 je dispatch */
  }
  /* 0x00955161 `jne 0x95516e` skips both the call and the reload. */
  return (suppress_29fb8 & 0xffu) == 0u ? 1 : 0;
}

extern "C" uint32_t isaac_manager_predispatch_obj_after(int32_t call_ran,
                                                        uint32_t obj_before,
                                                        uint32_t obj_after) {
  return call_ran != 0 ? obj_after : obj_before;
}

extern "C" uint32_t isaac_manager_predispatch_suppress_after(
    int32_t call_ran, uint32_t suppress_before, uint32_t suppress_after) {
  return call_ran != 0 ? suppress_after : suppress_before;
}

extern "C" int32_t isaac_manager_predispatch_queue_gate_reached(
    uint32_t obj_before, uint32_t suppress_before, uint32_t obj_after,
    uint32_t suppress_after, uint32_t mode_2a378) {
  if (obj_before == 0u) {
    return 0; /* never reaches 0x0095516e */
  }
  const int32_t call_ran =
      isaac_manager_predispatch_call_needed(obj_before, suppress_before);
  const uint32_t obj =
      isaac_manager_predispatch_obj_after(call_ran, obj_before, obj_after);
  if (obj == 0u) {
    return 0; /* 0x00955170 je dispatch */
  }
  const uint32_t suppress = isaac_manager_predispatch_suppress_after(
      call_ran, suppress_before, suppress_after);
  if ((suppress & 0xffu) != 0u) {
    return 0; /* 0x00955179 jne dispatch */
  }
  /* 0x0095517b `cmp dword [edi+0x2a378],1 / jne dispatch` — full word. */
  return mode_2a378 == static_cast<uint32_t>(ISAAC_PREDISPATCH_MODE_MATCH) ? 1
                                                                           : 0;
}

extern "C" int32_t isaac_manager_predispatch_forces_default(
    uint32_t queue_begin, uint32_t queue_end) {
  return queue_begin == queue_end ? 1 : 0;
}

extern "C" int32_t isaac_manager_predispatch_dispatches(
    uint32_t obj_before, uint32_t suppress_before, uint32_t obj_after,
    uint32_t suppress_after, uint32_t mode_2a378, uint32_t queue_begin,
    uint32_t queue_end) {
  if (isaac_manager_predispatch_queue_gate_reached(
          obj_before, suppress_before, obj_after, suppress_after,
          mode_2a378) == 0) {
    return 1; /* every earlier exit lands on the dispatch */
  }
  return isaac_manager_predispatch_forces_default(queue_begin, queue_end) == 0
             ? 1
             : 0;
}

extern "C" uint32_t isaac_manager_predispatch_field_ofs(int32_t field_id) {
  switch (field_id) {
    case ISAAC_PREDISPATCH_FIELD_OBJ:
      return static_cast<uint32_t>(ISAAC_PREDISPATCH_OFF_OBJ);
    case ISAAC_PREDISPATCH_FIELD_RECV:
      return static_cast<uint32_t>(ISAAC_PREDISPATCH_OFF_RECV);
    case ISAAC_PREDISPATCH_FIELD_SUPPRESS:
      return static_cast<uint32_t>(ISAAC_PREDISPATCH_OFF_SUPPRESS);
    case ISAAC_PREDISPATCH_FIELD_MODE:
      return static_cast<uint32_t>(ISAAC_PREDISPATCH_OFF_MODE);
    default:
      return 0xffffffffu;
  }
}

extern "C" int32_t isaac_manager_state2_game_null_guarded(void) {
  return 0;
}

/* --- ABI v22: state-2 arm remainder + angle wrap + approach tail --- */

extern "C" int32_t isaac_manager_state2_mid_parity_gate_needed(
    uint32_t flag_2a3c0) {
  /* 0x00955238 `cmp byte ptr [edi+0x2a3c0],0 / je 0x955246`. */
  return (flag_2a3c0 & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_manager_state2_mid_dispatch_needed(
    uint32_t paused_al, uint32_t dword_1b83c, uint32_t dword_1b858) {
  /* 0x00955271 `test al,al / je 0x955285`: not paused always dispatches. */
  if ((paused_al & 0xffu) == 0u) {
    return 1;
  }
  /* Both g_Game dwords are read AFTER the IsPaused call (0x00955273/…7c), so
   * a driver must pass POST-call recaptures, never pre-call snapshots. */
  if (dword_1b83c == 0u) {
    return 0; /* 0x0095527a je 0x9552c4 */
  }
  if (dword_1b858 != static_cast<uint32_t>(ISAAC_STATE2_MID_GAME_B_MATCH)) {
    return 0; /* 0x00955283 jne 0x9552c4 */
  }
  return 1;
}

extern "C" int32_t isaac_manager_state2_mid_mode_is_two(uint32_t mode_2a380) {
  /* 0x00955290 `sub eax,1 / je 0x9552ae`; 0x00955295 `sub eax,1 / jne
   * 0x9552ae`. NOT a 1-then-2 dispatch: mode 1 and every mode != 2 take the
   * parity call; only mode == 2 reaches the 0x9446e0 call. Full dword. */
  return mode_2a380 == static_cast<uint32_t>(ISAAC_STATE2_MID_MODE_V2) ? 1 : 0;
}

extern "C" uint32_t isaac_manager_state2_mid_parity_bit(
    uint32_t counter_4abbc) {
  /* 0x0095525e `mov al, byte [edi+0x4abbc]`; 0x00955264 `and al,1`. */
  return (counter_4abbc & 0xffu) & 1u;
}

extern "C" int32_t isaac_manager_state2_mid_write_byte_needed(
    uint32_t mode_2a380, uint32_t parity_byte) {
  if (isaac_manager_state2_mid_mode_is_two(mode_2a380) != 0) {
    /* 0x009552a5 `cmp byte ptr [esp+0x10],0 / je 0x9552c4`. The delayed
     * `mov byte [esi+0x8c],0` at 0x009552bd is reached only when set. */
    return (parity_byte & 0xffu) != 0u ? 1 : 0;
  }
  /* Path B: call 0x9439d0 then the byte write unconditionally. */
  return 1;
}

extern "C" uint32_t isaac_manager_state2_mid_call_a_va(void) {
  return static_cast<uint32_t>(ISAAC_STATE2_MID_CALL_A_VA);
}

extern "C" uint32_t isaac_manager_state2_mid_call_b_va(void) {
  return static_cast<uint32_t>(ISAAC_STATE2_MID_CALL_B_VA);
}

extern "C" uint32_t isaac_manager_state2_mid_parity_call_va(void) {
  return static_cast<uint32_t>(ISAAC_STATE2_MID_PARITY_CALL_VA);
}

extern "C" uint32_t isaac_manager_state2_mid_is_paused_va(void) {
  return static_cast<uint32_t>(ISAAC_STATE2_MID_IS_PAUSED_VA);
}

extern "C" uint32_t isaac_manager_state2_mid_obj_inner_ofs(void) {
  return static_cast<uint32_t>(ISAAC_STATE2_MID_OFF_OBJ_INNER);
}

extern "C" uint32_t isaac_manager_state2_mid_obj_byte_ofs(void) {
  return static_cast<uint32_t>(ISAAC_STATE2_MID_OFF_OBJ_BYTE);
}

extern "C" uint32_t isaac_manager_state2_mid_mode_ofs(void) {
  return static_cast<uint32_t>(ISAAC_STATE2_MID_OFF_MODE);
}

extern "C" int32_t isaac_manager_shell_angle_wrap_count(
    uint32_t end_1bb1c, uint32_t begin_1bb18) {
  /* 0x009552f9 `mov eax,[esi+0x1bb1c]`; 0x009552ff `sub eax,[esi+0x1bb18]`;
   * 0x0095530f `sar eax,2`. The pair is re-read on EVERY iteration — never
   * fold the count while porting the caller. */
  const uint32_t diff = end_1bb1c - begin_1bb18; /* 32-bit wrap */
  return static_cast<int32_t>(diff) >> 2;        /* SAR32 */
}

extern "C" int32_t isaac_manager_shell_angle_wrap_active(int32_t dword_0) {
  /* 0x009552f3 `jl 0x955398` — signed skip (no store). */
  return dword_0 < 0 ? 0 : 1;
}

extern "C" float isaac_manager_shell_angle_wrap_slot(
    int32_t dword_0, int32_t dword_8, float value, uint32_t end_1bb1c,
    uint32_t begin_1bb18) {
  if (dword_0 < 0) {
    return value;
  }
  /* 0x00955312 `cvtdq2ps xmm4,xmm4` — int32 -> float32, round-to-nearest. */
  const float i = static_cast<float>(dword_8);
  /* 0x00955319…0x00955330: `cvtdq2pd`, the `[eax*8+0xbacb00]` unsigned
   * fixup, then `cvtpd2ps` — the count is treated as UNSIGNED 32-bit and
   * rounded ONCE to float32 by the final convert. */
  const int32_t count = isaac_manager_shell_angle_wrap_count(end_1bb1c,
                                                             begin_1bb18);
  const float c = count >= 0
                      ? static_cast<float>(count)
                      : static_cast<float>(static_cast<double>(count) +
                                           4294967296.0);
  /* 0x00955337 `mulss xmm0, 0.5f`. */
  const float half = c * 0.5f;
  /* 0x0095532c `subss xmm1,xmm5` -> w = i - value; wrap down while w >= half.
   * 0x0095533e `jb` exits on w < half OR unordered; 0x00955347 `jae` loops
   * back only when ordered — so the ordinary ordered loop is `w >= half`. */
  float w = i - value;
  while (w >= half) {
    w -= c;
  }
  /* 0x0095534c/0x00955353: `xorps SIGN_MASK`, `mulss 0.5f` = -c * 0.5.
   * 0x0095535a `jbe` exits on -half <= w OR unordered; 0x00955367 `ja` loops
   * back only when ordered. */
  const float nhalf = -half;
  while (nhalf > w) {
    w += c;
  }
  /* 0x0095536c `andps ABS_MASK`; 0x00955373 `comiss 0.25,|w| / jbe`: snap to
   * the index when 0.25 > |w| ordered; a NaN |w| is unordered, so it does
   * NOT land here — it takes the step branch. */
  if (0.25f > __builtin_fabsf(w)) {
    return i;
  }
  /* 0x00955382 `comiss w,0 / jbe` picks the -0.25 arm on w <= 0 OR unordered. */
  const float step = (w <= 0.0f || w != w) ? -0.25f : 0.25f;
  /* 0x0095538f `addss xmm0,xmm5`: the ORIGINAL value, not the wrapped w. */
  return value + step;
}

extern "C" int32_t isaac_manager_shell_approach_tail_needed(
    uint32_t game_c71678, uint32_t paused_al) {
  /* 0x009553f5 `test esi,esi / je 0x955463`; 0x00955400 `test al,al / jne
   * 0x955463`. */
  if (game_c71678 == 0u) {
    return 0;
  }
  return (paused_al & 0xffu) == 0u ? 1 : 0;
}

extern "C" int32_t isaac_manager_shell_approach_tail_store_needed(
    float value_2a334, float step_2a338) {
  /* 0x0095541a/…1e: ucomiss + lahf + test ah,0x44 + jnp — the jump is taken
   * EXACTLY for ordered equality (value == 1.0f). NaN leaves ZF/PF=1/1, so it
   * falls through. Same idiom on the step at 0x0095542b/…32. -0.0 compares
   * equal to +0.0, so a -0.0 step skips too. Skip = no store AND no host call. */
  if (value_2a334 == 1.0f) {
    return 0;
  }
  if (step_2a338 == 0.0f) {
    return 0;
  }
  return 1;
}

extern "C" float isaac_manager_shell_approach_tail_next(float value_2a334,
                                                        float step_2a338) {
  /* 0x00955437/…3b: `subss xmm0,xmm3` then `andps ABS_MASK` -> |v - 1.0|. */
  const float d = __builtin_fabsf(value_2a334 - 1.0f);
  /* 0x00955442 `comiss step,d / jae`: ordered only — a NaN step falls through
   * to the +-step arms. */
  if (step_2a338 >= d) {
    return 1.0f;
  }
  /* 0x00955447 `comiss 1.0,value / jbe`: the subtract arm is taken when
   * 1.0 <= value AND on unordered, so the add arm is exactly ordered
   * 1.0 > value; a NaN value produces NaN on either arm, so this condition
   * is exact in the result. */
  if (1.0f <= value_2a334) {
    return value_2a334 - step_2a338;
  }
  return value_2a334 + step_2a338;
}

extern "C" uint32_t isaac_manager_shell_approach_tail_host_va(void) {
  return static_cast<uint32_t>(ISAAC_SHELL_APPROACH_HOST_VA);
}

extern "C" uint32_t isaac_manager_shell_approach_tail_recv_ofs(void) {
  return static_cast<uint32_t>(ISAAC_SHELL_APPROACH_RECV_OFS);
}

extern "C" uint32_t isaac_manager_shell_approach_tail_value_ofs(void) {
  return static_cast<uint32_t>(ISAAC_SHELL_APPROACH_VALUE_OFS);
}

extern "C" uint32_t isaac_manager_shell_approach_tail_step_ofs(void) {
  return static_cast<uint32_t>(ISAAC_SHELL_APPROACH_STEP_OFS);
}

/* ---------------------------------------------------------------------------
 * ABI v23 — state-2 arm tail call sites (0x00955463…0x009554a0).
 * Two typed host events with the exact PE argument order; the only pure
 * gate is the byte test at 0x0095546e. See the header section for the full
 * annotated instruction stream and the ANM2::Play cross-family gate fact.
 * ------------------------------------------------------------------------- */

extern "C" uint32_t isaac_manager_state2_tail_call_a_va(void) {
  return static_cast<uint32_t>(ISAAC_STATE2_TAIL_CALL_A_VA);
}

extern "C" uint32_t isaac_manager_state2_tail_call_a_recv_ofs(void) {
  return static_cast<uint32_t>(ISAAC_STATE2_TAIL_OFF_CALL_A_RECV);
}

extern "C" int32_t isaac_manager_state2_tail_call_b_needed(
    uint32_t byte_2a3a6) {
  /* 0x0095546e `cmp byte ptr [edi+0x2a3a6],0` / 0x00955475 `je 0x955580` —
   * a BYTE test (uint32_t parameter re-narrowed in the body, per the repo
   * toolchain-defect rule). */
  return nonzero_u8(byte_2a3a6);
}

extern "C" uint32_t isaac_manager_state2_tail_call_b_va(void) {
  return static_cast<uint32_t>(ISAAC_STATE2_TAIL_CALL_B_VA);
}

extern "C" uint32_t isaac_manager_state2_tail_call_b_recv_global_va(void) {
  return static_cast<uint32_t>(ISAAC_STATE2_TAIL_CALL_B_RECV_GLOBAL_VA);
}

extern "C" uint32_t isaac_manager_state2_tail_call_b_arg_edx(void) {
  return static_cast<uint32_t>(ISAAC_STATE2_TAIL_CALL_B_EDX_ARG);
}

extern "C" uint32_t isaac_manager_state2_tail_anim_va(uint32_t result) {
  /* 0x00955488 `test eax,eax` tests the FULL dword: ZF=1 exactly when
   * result == 0; 0x00955494 `cmove edx,ecx` then picks Idle on ZF, Clicked
   * otherwise. */
  return result == 0u ? static_cast<uint32_t>(ISAAC_STATE2_TAIL_ANIM_IDLE_VA)
                      : static_cast<uint32_t>(
                            ISAAC_STATE2_TAIL_ANIM_CLICKED_VA);
}

extern "C" uint32_t isaac_manager_state2_tail_play_va(void) {
  return static_cast<uint32_t>(ISAAC_STATE2_TAIL_PLAY_VA);
}

extern "C" uint32_t isaac_manager_state2_tail_play_recv_ofs(void) {
  return static_cast<uint32_t>(ISAAC_STATE2_TAIL_OFF_PLAY_RECV);
}

extern "C" uint32_t isaac_manager_state2_tail_play_anim_idle_va(void) {
  return static_cast<uint32_t>(ISAAC_STATE2_TAIL_ANIM_IDLE_VA);
}

extern "C" uint32_t isaac_manager_state2_tail_play_anim_clicked_va(void) {
  return static_cast<uint32_t>(ISAAC_STATE2_TAIL_ANIM_CLICKED_VA);
}

extern "C" uint32_t isaac_manager_state2_tail_play_reset_arg(void) {
  return static_cast<uint32_t>(ISAAC_STATE2_TAIL_PLAY_RESET_ARG);
}

/* ---------------------------------------------------------------------------
 * ABI v24 — Manager shell tail (see header). The following peels stay PURE;
 * host edges (_wassert IAT 0xb18884, FUN_00a69f60, (*DAT_00c736a0)) keep
 * their pinned args on the host side of the boundary.
 * ------------------------------------------------------------------------- */

extern "C" int32_t isaac_manager_shell_tail_win_assert_needed(uint32_t win) {
  /* 0x009554ab `test esi,esi / jne` — full 32-bit null test on the window. */
  return win == 0u ? 1 : 0;
}

extern "C" uint32_t isaac_manager_shell_tail_wassert_msg_va(void) {
  return static_cast<uint32_t>(ISAAC_SHELL_TAIL_WASSERT_MSG_VA);
}
extern "C" uint32_t isaac_manager_shell_tail_wassert_file_va(void) {
  return static_cast<uint32_t>(ISAAC_SHELL_TAIL_WASSERT_FILE_VA);
}
extern "C" uint32_t isaac_manager_shell_tail_wassert_line(void) {
  return static_cast<uint32_t>(ISAAC_SHELL_TAIL_WASSERT_LINE);
}
extern "C" uint32_t isaac_manager_shell_tail_wassert_iat_va(void) {
  return static_cast<uint32_t>(ISAAC_SHELL_TAIL_WASSERT_IAT_VA);
}
extern "C" uint32_t isaac_manager_shell_tail_win_global_va(void) {
  return static_cast<uint32_t>(ISAAC_SHELL_TAIL_WIN_GLOBAL_VA);
}

extern "C" int32_t isaac_manager_shell_tail_uses_platform_poll(uint32_t flag) {
  /* 0x009554c7 `cmp dword ptr [0xc73680],0 / jne` — full dword == 0 */
  return flag == 0u ? 1 : 0;
}
extern "C" uint32_t isaac_manager_shell_tail_platform_poll_va(void) {
  return static_cast<uint32_t>(ISAAC_SHELL_TAIL_PLATFORM_POLL_VA);
}
extern "C" uint32_t isaac_manager_shell_tail_platform_poll_arg0(void) {
  return static_cast<uint32_t>(ISAAC_SHELL_TAIL_PLATFORM_POLL_ARG0);
}
extern "C" uint32_t isaac_manager_shell_tail_platform_poll_arg1(void) {
  return static_cast<uint32_t>(ISAAC_SHELL_TAIL_PLATFORM_POLL_ARG1);
}
extern "C" uint32_t isaac_manager_shell_tail_platform_flag_va(void) {
  return static_cast<uint32_t>(ISAAC_SHELL_TAIL_PLATFORM_FLAG_VA);
}

extern "C" int32_t isaac_manager_shell_tail_direct_copy_needed(uint32_t kind) {
  /* 0x009554f0 `cmp dword ptr [esi+0x70],0x34003 / jne` — full-dword eq */
  return kind == ISAAC_SHELL_TAIL_WIN_KIND_DIRECT_COPY ? 1 : 0;
}
extern "C" uint32_t isaac_manager_shell_tail_kind_ofs(void) {
  return static_cast<uint32_t>(ISAAC_SHELL_TAIL_WIN_KIND_OFS);
}
extern "C" uint32_t isaac_manager_shell_tail_kind_magic(void) {
  return static_cast<uint32_t>(ISAAC_SHELL_TAIL_WIN_KIND_DIRECT_COPY);
}
extern "C" uint32_t isaac_manager_shell_tail_d0_ofs(void) {
  return static_cast<uint32_t>(ISAAC_SHELL_TAIL_WIN_D0_OFS);
}
extern "C" uint32_t isaac_manager_shell_tail_d1_ofs(void) {
  return static_cast<uint32_t>(ISAAC_SHELL_TAIL_WIN_D1_OFS);
}
extern "C" uint32_t isaac_manager_shell_tail_platform_query_va(void) {
  return static_cast<uint32_t>(ISAAC_SHELL_TAIL_PLATFORM_QUERY_VA);
}

extern "C" float isaac_manager_shell_tail_float_of_f64(double d) {
  /* cvtpd2ps: round-to-nearest-even double -> float32 */
  return static_cast<float>(d);
}

extern "C" int32_t isaac_manager_shell_tail_lane_ordered_equal(float a,
                                                              float b) {
  /* ucomiss + lahf + test ah,0x44 + jp: fall-through ONLY on ordered equal.
   * float == implements ordered equality: NaN != NaN, -0 == +0. */
  return a == b ? 1 : 0;
}

extern "C" int32_t isaac_manager_shell_tail_both_lanes_equal(float f0, float s0,
                                                            float f1,
                                                            float s1) {
  return (f0 == s0 && f1 == s1) ? 1 : 0;
}

extern "C" int32_t isaac_manager_shell_tail_timer_next(int32_t timer,
                                                       int32_t both_equal) {
  /* 0x00955553/…5b `test eax,eax / jle` is SIGNED: dec only when timer > 0.
   * 0x00955566 `mov dword ptr [edi+0x4b3c4],0x12c` on any mismatch/NaN */
  if (both_equal == 0) {
    return static_cast<int32_t>(ISAAC_SHELL_TAIL_TIMER_RESET);
  }
  return timer > 0 ? timer - 1 : timer;
}
extern "C" uint32_t isaac_manager_shell_tail_timer_ofs(void) {
  return static_cast<uint32_t>(ISAAC_SHELL_TAIL_TIMER_OFS);
}
extern "C" uint32_t isaac_manager_shell_tail_timer_reset_value(void) {
  return static_cast<uint32_t>(ISAAC_SHELL_TAIL_TIMER_RESET);
}
extern "C" uint32_t isaac_manager_shell_tail_store_f0_ofs(void) {
  return static_cast<uint32_t>(ISAAC_SHELL_TAIL_STORE_F0_OFS);
}
extern "C" uint32_t isaac_manager_shell_tail_store_f1_ofs(void) {
  return static_cast<uint32_t>(ISAAC_SHELL_TAIL_STORE_F1_OFS);
}

extern "C" int32_t isaac_manager_shell_tail_parity_next(int32_t counter) {
  /* 0x00955580 `inc dword ptr [edi+0x4abbc]` — 32-bit wrap. */
  return static_cast<int32_t>(static_cast<uint32_t>(counter) + 1u);
}
extern "C" uint32_t isaac_manager_shell_tail_parity_ofs(void) {
  return static_cast<uint32_t>(ISAAC_SHELL_TAIL_PARITY_OFS);
}



/* ===========================================================================
 * ABI v25 -- pre-poll state-machine block 0x00954d4d..0x00954f46.
 * All gates narrow raw 32-bit args to the low byte exactly like the PE
 * `cmp byte ptr [...]`; callers must NEVER pre-mask (uint8_t-param class).
 * =========================================================================== */

extern "C" int32_t isaac_manager_prepoll_state4_store_needed(uint32_t byte0) {
  /* 0x00954d4d cmp byte ptr [edi],0 / je 0x954d5c */
  return nonzero_u8(byte0) != 0 ? 1 : 0;
}

extern "C" int32_t isaac_manager_prepoll_g1_needed(uint32_t byte21618) {
  /* 0x00954d6a cmp byte ptr [edi + 0x21618],0 */
  return nonzero_u8(byte21618) != 0 ? 1 : 0;
}

extern "C" int32_t isaac_manager_prepoll_g2_needed(uint32_t byte21620) {
  /* 0x00954d73 cmp byte ptr [edi + 0x21620],0 */
  return nonzero_u8(byte21620) != 0 ? 1 : 0;
}

extern "C" int32_t isaac_manager_prepoll_host_c_needed(uint32_t g1,
                                                       uint32_t g2) {
  /* 0x00954d7a fall-through: G1 && G2 -> byte [0x4b284]=0 + host C 0x959670 */
  return (nonzero_u8(g1) != 0 && nonzero_u8(g2) != 0) ? 1 : 0;
}

extern "C" int32_t isaac_manager_prepoll_state3_transition_needed(
    uint32_t g1) {
  /* 0x00954d71 fall-through -> host D 0x95e7c0 + history=[state]; state=3;
   * byte [Manager+0x21618]=0.  The store-side contract is host-applied on
   * this SAME edge. */
  return nonzero_u8(g1) != 0 ? 1 : 0;
}

extern "C" int32_t isaac_manager_prepoll_g3_needed(uint32_t byte4b2a4) {
  /* 0x00954db9 cmp byte ptr [edi + 0x4b2a4],0 */
  return nonzero_u8(byte4b2a4) != 0 ? 1 : 0;
}

extern "C" int32_t isaac_manager_prepoll_state5_transition_needed(
    uint32_t g3) {
  /* 0x00954dc0 fall-through -> host E 0x921ce0 + history=[state]; state=5;
   * byte [Manager+0x4b2a4]=0 on the SAME edge. */
  return nonzero_u8(g3) != 0 ? 1 : 0;
}

extern "C" int32_t isaac_manager_prepoll_arm_select(
    int32_t state, uint32_t g3, int32_t dword21628, int32_t dword20dd0) {
  /* 0x00954df0..0x00954e13.  G3 wins (eax forced 5 on that path); dword
   * receiver tests are full 32-bit zeros (`cmp dword ptr,0`). */
  if (nonzero_u8(g3) != 0) {
    return dword21628 == 0 ? ISAAC_PREPOLL_ARM_STATE5 : ISAAC_PREPOLL_ARM_POLL;
  }
  if (state == ISAAC_PREPOLL_STATE3_VALUE) {
    return dword20dd0 == 0 ? ISAAC_PREPOLL_ARM_STATE3 : ISAAC_PREPOLL_ARM_POLL;
  }
  if (state == ISAAC_PREPOLL_STATE5_VALUE) {
    return dword21628 == 0 ? ISAAC_PREPOLL_ARM_STATE5 : ISAAC_PREPOLL_ARM_POLL;
  }
  return ISAAC_PREPOLL_ARM_POLL;
}

extern "C" int32_t isaac_manager_prepoll_copy_block_needed(uint32_t arm_eax,
                                                           uint32_t byte21620) {
  /* 0x00954e20 cmp eax,3 / jne 0x954e76; 0x00954e25 cmp byte [edi+0x21620],0
   * Only the state-3 arm may copy (state-5 eax skips to the G4 gate). */
  return (static_cast<int32_t>(arm_eax) == ISAAC_PREPOLL_STATE3_VALUE &&
          nonzero_u8(byte21620) != 0)
             ? 1
             : 0;
}

extern "C" int32_t isaac_manager_prepoll_g4_needed(uint32_t byte4b428) {
  /* 0x00954e76 cmp byte ptr [edi + 0x4b428],0 */
  return nonzero_u8(byte4b428) != 0 ? 1 : 0;
}

extern "C" float isaac_manager_prepoll_game_b0_next(float old_b0) {
  /* 0x00954efd movss xmm0,[eax+0x265b0]; 0x00954f05 addss xmm0,[0xbaa454];
   * 0x00954f0d movss [eax+0x265b0],xmm0.  Single f32 add of the 1.0f literal;
   * the old value is the pre-movups read from 0x00954eb3. */
  return static_cast<float>(old_b0 + 1.0f);
}

extern "C" int32_t isaac_manager_prepoll_log_needed(int32_t history) {
  /* 0x00954f18 sub eax,1 / 0x00954f1b jne 0x954f46: FULL-dword history == 1
   * (eax is [edi+0xc] on the G4-clear path and [edi+8] == history on the
   * G4 path). */
  return history == 1 ? 1 : 0;
}

extern "C" uint32_t isaac_manager_prepoll_nightmare_arg(uint32_t byte4b2a5) {
  /* 0x00954dc2 movzx eax, byte ptr [edi + 0x4b2a5] -- bool for host E. */
  return byte4b2a5 & 0xffu;
}

extern "C" uint32_t isaac_manager_prepoll_copy_src_ofs(uint32_t slot_index) {
  /* 0x00954e3a imul eax,dword ptr [edi + 0x215d8],0x4c + 0x20e00, 32-bit
   * wrap on both the multiply and the add (PE address arithmetic). */
  return static_cast<uint32_t>(slot_index * ISAAC_PREPOLL_COPY_STRIDE +
                               ISAAC_PREPOLL_COPY_SRC_BASE);
}

extern "C" uint32_t isaac_manager_prepoll_copy_src_dword_ofs(
    uint32_t slot_index) {
  /* 0x00954e49 mov eax,dword ptr [eax + edi + 0x20e10] */
  return static_cast<uint32_t>(slot_index * ISAAC_PREPOLL_COPY_STRIDE +
                               ISAAC_PREPOLL_COPY_SRC_DW);
}

extern "C" uint32_t isaac_manager_prepoll_state_ofs(void) {
  return static_cast<uint32_t>(ISAAC_PREPOLL_STATE_OFS);
}
extern "C" uint32_t isaac_manager_prepoll_history_ofs(void) {
  return static_cast<uint32_t>(ISAAC_PREPOLL_HISTORY_OFS);
}
extern "C" uint32_t isaac_manager_prepoll_g1_ofs(void) {
  return static_cast<uint32_t>(ISAAC_PREPOLL_G1_OFS);
}
extern "C" uint32_t isaac_manager_prepoll_cutscene_id_ofs(void) {
  return static_cast<uint32_t>(ISAAC_PREPOLL_CUTSCENE_ID_OFS);
}
extern "C" uint32_t isaac_manager_prepoll_g2_ofs(void) {
  return static_cast<uint32_t>(ISAAC_PREPOLL_G2_OFS);
}
extern "C" uint32_t isaac_manager_prepoll_copy_slot_index_ofs(void) {
  return static_cast<uint32_t>(ISAAC_PREPOLL_COPY_SLOT_INDEX_OFS);
}
extern "C" uint32_t isaac_manager_prepoll_copy_src_base(void) {
  return static_cast<uint32_t>(ISAAC_PREPOLL_COPY_SRC_BASE);
}
extern "C" uint32_t isaac_manager_prepoll_copy_src_dword(void) {
  return static_cast<uint32_t>(ISAAC_PREPOLL_COPY_SRC_DW);
}
extern "C" uint32_t isaac_manager_prepoll_copy_stride(void) {
  return static_cast<uint32_t>(ISAAC_PREPOLL_COPY_STRIDE);
}
extern "C" uint32_t isaac_manager_prepoll_copy_dst_core_ofs(void) {
  return static_cast<uint32_t>(ISAAC_PREPOLL_COPY_DST_CORE);
}
extern "C" uint32_t isaac_manager_prepoll_copy_dst_dword_ofs(void) {
  return static_cast<uint32_t>(ISAAC_PREPOLL_COPY_DST_DW);
}
extern "C" uint32_t isaac_manager_prepoll_copy_dst_ext_ofs(void) {
  return static_cast<uint32_t>(ISAAC_PREPOLL_COPY_DST_EXT);
}
extern "C" uint32_t isaac_manager_prepoll_copy_ext_from_ofs(void) {
  return static_cast<uint32_t>(ISAAC_PREPOLL_COPY_EXT_FROM_OFS);
}
extern "C" uint32_t isaac_manager_prepoll_copy_flag_ofs(void) {
  return static_cast<uint32_t>(ISAAC_PREPOLL_COPY_FLAG_OFS);
}
extern "C" uint32_t isaac_manager_prepoll_copy_flag_value(void) {
  return static_cast<uint32_t>(ISAAC_PREPOLL_COPY_FLAG_VALUE);
}
extern "C" uint32_t isaac_manager_prepoll_g3_ofs(void) {
  return static_cast<uint32_t>(ISAAC_PREPOLL_G3_OFS);
}
extern "C" uint32_t isaac_manager_prepoll_nightmare_arg_ofs(void) {
  return static_cast<uint32_t>(ISAAC_PREPOLL_NIGHTMARE_ARG_OFS);
}
extern "C" uint32_t isaac_manager_prepoll_g4_ofs(void) {
  return static_cast<uint32_t>(ISAAC_PREPOLL_G4_OFS);
}
extern "C" uint32_t isaac_manager_prepoll_state3arm_byte_ofs(void) {
  return static_cast<uint32_t>(ISAAC_PREPOLL_STATE3ARM_BYTE_OFS);
}
extern "C" uint32_t isaac_manager_prepoll_predispatch_recv_ofs(void) {
  return static_cast<uint32_t>(ISAAC_PREPOLL_PREDISPATCH_RECV_OFS);
}
extern "C" uint32_t isaac_manager_prepoll_state5_recv_ofs(void) {
  return static_cast<uint32_t>(ISAAC_PREPOLL_STATE5_RECV_OFS);
}
extern "C" uint32_t isaac_manager_prepoll_game_store_base_ofs(void) {
  return static_cast<uint32_t>(ISAAC_PREPOLL_GAME_STORE_BASE_OFS);
}
extern "C" uint32_t isaac_manager_prepoll_game_store_b4_ofs(void) {
  return static_cast<uint32_t>(ISAAC_PREPOLL_GAME_STORE_B4_OFS);
}
extern "C" uint32_t isaac_manager_prepoll_game_store_b8_ofs(void) {
  return static_cast<uint32_t>(ISAAC_PREPOLL_GAME_STORE_B8_OFS);
}
extern "C" uint32_t isaac_manager_prepoll_game_store_bc_ofs(void) {
  return static_cast<uint32_t>(ISAAC_PREPOLL_GAME_STORE_BC_OFS);
}
extern "C" uint32_t isaac_manager_prepoll_game_store_b8_bits(void) {
  return static_cast<uint32_t>(ISAAC_PREPOLL_GAME_STORE_B8_BITS);
}
extern "C" uint32_t isaac_manager_prepoll_game_store_bc_value(void) {
  return static_cast<uint32_t>(ISAAC_PREPOLL_GAME_STORE_BC_VALUE);
}
extern "C" uint32_t isaac_manager_prepoll_crossfade_recv_ofs(void) {
  return static_cast<uint32_t>(ISAAC_PREPOLL_CROSSFADE_RECV_OFS);
}
extern "C" uint32_t isaac_manager_prepoll_crossfade_music_id(void) {
  return static_cast<uint32_t>(ISAAC_PREPOLL_CROSSFADE_MUSIC_ID);
}
extern "C" uint32_t isaac_manager_prepoll_crossfade_rate_bits(void) {
  return static_cast<uint32_t>(ISAAC_PREPOLL_CROSSFADE_RATE_BITS);
}
extern "C" uint32_t isaac_manager_prepoll_host_a_va(void) {
  return static_cast<uint32_t>(ISAAC_PREPOLL_HOST_A_VA);
}
extern "C" uint32_t isaac_manager_prepoll_host_b_va(void) {
  return static_cast<uint32_t>(ISAAC_PREPOLL_HOST_B_VA);
}
extern "C" uint32_t isaac_manager_prepoll_host_c_va(void) {
  return static_cast<uint32_t>(ISAAC_PREPOLL_HOST_C_VA);
}
extern "C" uint32_t isaac_manager_prepoll_host_d_va(void) {
  return static_cast<uint32_t>(ISAAC_PREPOLL_HOST_D_VA);
}
extern "C" uint32_t isaac_manager_prepoll_host_e_va(void) {
  return static_cast<uint32_t>(ISAAC_PREPOLL_HOST_E_VA);
}
extern "C" uint32_t isaac_manager_prepoll_host_f_va(void) {
  return static_cast<uint32_t>(ISAAC_PREPOLL_HOST_F_VA);
}
extern "C" uint32_t isaac_manager_prepoll_host_g_va(void) {
  return static_cast<uint32_t>(ISAAC_PREPOLL_HOST_G_VA);
}
extern "C" uint32_t isaac_manager_prepoll_host_g_arg(void) {
  return static_cast<uint32_t>(ISAAC_PREPOLL_HOST_G_ARG);
}
extern "C" uint32_t isaac_manager_prepoll_log_va(void) {
  return static_cast<uint32_t>(ISAAC_PREPOLL_LOG_VA);
}
extern "C" uint32_t isaac_manager_prepoll_log_level(void) {
  return static_cast<uint32_t>(ISAAC_PREPOLL_LOG_LEVEL);
}
extern "C" uint32_t isaac_manager_prepoll_log_msg_va(void) {
  return static_cast<uint32_t>(ISAAC_PREPOLL_LOG_MSG_VA);
}
extern "C" uint32_t isaac_manager_prepoll_host_h_va(void) {
  return static_cast<uint32_t>(ISAAC_PREPOLL_HOST_H_VA);
}
extern "C" uint32_t isaac_manager_prepoll_state4_value(void) {
  return static_cast<uint32_t>(ISAAC_PREPOLL_STATE4_VALUE);
}

/* ===========================================================================
 * ABI v26 -- depth on FUN_00954b40 (host F of the v25 G4 arm).  PE flow and
 * host edges are documented in the header; every byte gate below narrows a
 * raw uint32_t in the body (uint8_t-parameter defect class), and the dword
 * gates are full 32-bit compares exactly like the PE.
 * =========================================================================== */

extern "C" int32_t isaac_manager_playerscan_count_from_bounds(int32_t end,
                                                              int32_t begin) {
  /* 0x00954b85 sub esi,[0xc57b20]; 0x00954b8b sar esi,3 -- 8-byte {ptr,ctrl}
   * elements.  SAR of the 32-bit-wrapped difference; the loop's `jae` is
   * unsigned, but count < 2^29 here so signed/unsigned agree on negatives
   * (both run zero iterations). */
  const int32_t diff = static_cast<int32_t>(static_cast<uint32_t>(end) -
                                            static_cast<uint32_t>(begin));
  return diff >> 3;
}

extern "C" uint32_t isaac_manager_playerscan_element_ptr(uint32_t begin,
                                                         uint32_t index) {
  /* 0x00a202ae lea eax,[ecx+edx*8] -- slot address of element index,
   * 32-bit wrap (PE address arithmetic). */
  return static_cast<uint32_t>(begin + index * 8u);
}

extern "C" int32_t isaac_manager_playerscan_match_needed(int32_t vcall_result) {
  /* 0x00954bde cmp eax,-1 / jne 0x954c1b -- FULL dword compare. */
  return vcall_result != -1 ? 1 : 0;
}

extern "C" int32_t isaac_manager_playerscan_state2_gate(int32_t state) {
  /* 0x00954c2c cmp dword ptr [ebx+8],2 / jne -- full dword, state field of
   * the [0xc7169c] Manager (same field as ISAAC_PREPOLL_STATE_OFS). */
  return state == ISAAC_PLAYERSCAN_STATE2_VALUE ? 1 : 0;
}

extern "C" int32_t isaac_manager_playerscan_player_count_from_bounds(
    int32_t end, int32_t begin) {
  /* 0x00954c44 sub eax,ecx; sar eax,2 -- g_Game player-pointer vector
   * (4-byte elements).  Signed SAR of the wrapped difference. */
  const int32_t diff = static_cast<int32_t>(static_cast<uint32_t>(end) -
                                            static_cast<uint32_t>(begin));
  return diff >> 2;
}

extern "C" int32_t isaac_manager_playerscan_log_needed(int32_t player_count) {
  /* 0x00954c49 test eax,eax / jne 0x954c62 -- full dword zero test. */
  return player_count == 0 ? 1 : 0;
}

extern "C" int32_t isaac_manager_playerscan_release_gate(uint32_t ctrl) {
  /* 0x00954bea test ecx,ecx / je 0x954c0e -- full dword; the release vcall
   * runs only when the pair's ctrl half is non-null. */
  return ctrl != 0u ? 1 : 0;
}

extern "C" int32_t isaac_manager_playerscan_callback_needed(
    uint32_t vcall_al, uint32_t callback) {
  /* 0x00954bf8 test al,al -- BYTE test of the release vcall result; then
   * 0x00954c01 test eax,eax -- full dword test of [0xc7e814]. */
  return ((vcall_al & 0xffu) != 0u && callback != 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_manager_playerscan_element_ctrl_ofs(void) {
  return static_cast<uint32_t>(ISAAC_PLAYERSCAN_ELEMENT_CTRL_OFS);
}
extern "C" uint32_t isaac_manager_playerscan_manager_store_ofs(void) {
  return static_cast<uint32_t>(ISAAC_PLAYERSCAN_MANAGER_STORE_OFS);
}
extern "C" uint32_t isaac_manager_playerscan_player_list_begin_ofs(void) {
  return static_cast<uint32_t>(ISAAC_PLAYERSCAN_PLAYER_LIST_BEGIN_OFS);
}
extern "C" uint32_t isaac_manager_playerscan_player_list_end_ofs(void) {
  return static_cast<uint32_t>(ISAAC_PLAYERSCAN_PLAYER_LIST_END_OFS);
}
extern "C" uint32_t isaac_manager_playerscan_vector_this_va(void) {
  return static_cast<uint32_t>(ISAAC_PLAYERSCAN_VECTOR_THIS_VA);
}
extern "C" uint32_t isaac_manager_playerscan_vector_begin_va(void) {
  return static_cast<uint32_t>(ISAAC_PLAYERSCAN_VECTOR_BEGIN_VA);
}
extern "C" uint32_t isaac_manager_playerscan_vector_end_va(void) {
  return static_cast<uint32_t>(ISAAC_PLAYERSCAN_VECTOR_END_VA);
}
extern "C" uint32_t isaac_manager_playerscan_vector_lock_va(void) {
  return static_cast<uint32_t>(ISAAC_PLAYERSCAN_VECTOR_LOCK_VA);
}
extern "C" uint32_t isaac_manager_playerscan_vector_stride(void) {
  return static_cast<uint32_t>(ISAAC_PLAYERSCAN_VECTOR_STRIDE);
}
extern "C" uint32_t isaac_manager_playerscan_player_list_stride(void) {
  return static_cast<uint32_t>(ISAAC_PLAYERSCAN_PLAYER_LIST_STRIDE);
}
extern "C" uint32_t isaac_manager_playerscan_last_index_global_va(void) {
  return static_cast<uint32_t>(ISAAC_PLAYERSCAN_LAST_INDEX_GLOBAL_VA);
}
extern "C" uint32_t isaac_manager_playerscan_release_callback_global_va(void) {
  return static_cast<uint32_t>(ISAAC_PLAYERSCAN_RELEASE_CALLBACK_GLOBAL_VA);
}
extern "C" uint32_t isaac_manager_playerscan_manager_global_va(void) {
  return static_cast<uint32_t>(ISAAC_PLAYERSCAN_MANAGER_GLOBAL_VA);
}
extern "C" uint32_t isaac_manager_playerscan_game_global_va(void) {
  return static_cast<uint32_t>(ISAAC_PLAYERSCAN_GAME_GLOBAL_VA);
}
extern "C" uint32_t isaac_manager_playerscan_accessor_va(void) {
  return static_cast<uint32_t>(ISAAC_PLAYERSCAN_ACCESSOR_VA);
}
extern "C" uint32_t isaac_manager_playerscan_set_controller_va(void) {
  return static_cast<uint32_t>(ISAAC_PLAYERSCAN_SET_CONTROLLER_VA);
}
extern "C" uint32_t isaac_manager_playerscan_set_controller_arg(void) {
  return static_cast<uint32_t>(ISAAC_PLAYERSCAN_SET_CONTROLLER_ARG);
}
extern "C" uint32_t isaac_manager_playerscan_match_vcall_slot(void) {
  return static_cast<uint32_t>(ISAAC_PLAYERSCAN_MATCH_VCALL_SLOT);
}
extern "C" uint32_t isaac_manager_playerscan_match_vcall_arg(void) {
  return static_cast<uint32_t>(ISAAC_PLAYERSCAN_MATCH_VCALL_ARG);
}
extern "C" uint32_t isaac_manager_playerscan_match_sentinel(void) {
  return static_cast<uint32_t>(ISAAC_PLAYERSCAN_MATCH_SENTINEL);
}
extern "C" uint32_t isaac_manager_playerscan_release_vcall_slot(void) {
  return static_cast<uint32_t>(ISAAC_PLAYERSCAN_RELEASE_VCALL_SLOT);
}
extern "C" uint32_t isaac_manager_playerscan_log_level(void) {
  return static_cast<uint32_t>(ISAAC_PLAYERSCAN_LOG_LEVEL);
}
extern "C" uint32_t isaac_manager_playerscan_log_msg_va(void) {
  return static_cast<uint32_t>(ISAAC_PLAYERSCAN_LOG_MSG_VA);
}
extern "C" uint32_t isaac_manager_playerscan_state2_value(void) {
  return static_cast<uint32_t>(ISAAC_PLAYERSCAN_STATE2_VALUE);
}

/* ===========================================================================
 * ABI v27 -- complete body of FUN_00a0f550 (host G).  Render-shell P40
 * owns the packed-ARGB law; this peel consumes it by reference.  Every
 * byte extract / channel_f32 argument is a raw uint32_t narrowed in the
 * body (uint8_t-parameter defect class).
 * =========================================================================== */

extern "C" uint32_t isaac_manager_a0f550_r(uint32_t packed) {
  /* 0x00a0f558 shr eax, 0x10; 0x00a0f55b movzx eax, al */
  return (packed >> 16) & 0xffu;
}
extern "C" uint32_t isaac_manager_a0f550_g(uint32_t packed) {
  /* 0x00a0f583 shr eax, 8; 0x00a0f586 movzx eax, al */
  return (packed >> 8) & 0xffu;
}
extern "C" uint32_t isaac_manager_a0f550_b(uint32_t packed) {
  /* 0x00a0f5a9 movzx eax, dl */
  return packed & 0xffu;
}
extern "C" uint32_t isaac_manager_a0f550_a(uint32_t packed) {
  /* 0x00a0f5ac shr edx, 0x18 -- edx still holds the full packed dword */
  return (packed >> 24) & 0xffu;
}

extern "C" float isaac_manager_a0f550_channel_f32(uint32_t byte) {
  /* 0x00a0f56d movd / cvtdq2pd / addsd [0xbacb00+eax*8] / cvtpd2ps /
   * divss xmm1=DAT_00baaae4 (255.0f).  movzx input is 0..255 so the
   * signed-table add is always +0.0; equivalent to float(byte)/255.0f.
   * The parameter is deliberately wider than the PE byte: mask here. */
  const uint32_t b = byte & 0xffu;
  return static_cast<float>(b) / 255.0f;
}

extern "C" float isaac_manager_a0f550_f0(uint32_t packed) {
  /* 0x00a0f591 movss [ecx], xmm0 -- R */
  return isaac_manager_a0f550_channel_f32(isaac_manager_a0f550_r(packed));
}
extern "C" float isaac_manager_a0f550_f1(uint32_t packed) {
  /* 0x00a0f5b7 movss [ecx+4], xmm0 -- G */
  return isaac_manager_a0f550_channel_f32(isaac_manager_a0f550_g(packed));
}
extern "C" float isaac_manager_a0f550_f2(uint32_t packed) {
  /* 0x00a0f5da movss [ecx+8], xmm0 -- B; last lane the G4 arm consumes */
  return isaac_manager_a0f550_channel_f32(isaac_manager_a0f550_b(packed));
}
extern "C" float isaac_manager_a0f550_f3(uint32_t packed) {
  /* 0x00a0f5fb movss [ecx+0xc], xmm0 -- A */
  return isaac_manager_a0f550_channel_f32(isaac_manager_a0f550_a(packed));
}
extern "C" uint32_t isaac_manager_a0f550_tail_store(void) {
  /* 0x00a0f566 mov dword ptr [ecx+0x10], 0 */
  return static_cast<uint32_t>(ISAAC_A0F550_TAIL_STORE);
}
extern "C" uint32_t isaac_manager_a0f550_f0_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A0F550_F0_OFS);
}
extern "C" uint32_t isaac_manager_a0f550_f1_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A0F550_F1_OFS);
}
extern "C" uint32_t isaac_manager_a0f550_f2_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A0F550_F2_OFS);
}
extern "C" uint32_t isaac_manager_a0f550_f3_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A0F550_F3_OFS);
}
extern "C" uint32_t isaac_manager_a0f550_tail_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A0F550_TAIL_OFS);
}
extern "C" uint32_t isaac_manager_a0f550_denom_bits(void) {
  return static_cast<uint32_t>(ISAAC_A0F550_DENOM_BITS);
}
extern "C" uint32_t isaac_manager_a0f550_denom_va(void) {
  return static_cast<uint32_t>(ISAAC_A0F550_DENOM_VA);
}
extern "C" uint32_t isaac_manager_a0f550_signed_table_va(void) {
  return static_cast<uint32_t>(ISAAC_A0F550_SIGNED_TABLE_VA);
}
extern "C" uint32_t isaac_manager_a0f550_va(void) {
  return static_cast<uint32_t>(ISAAC_A0F550_VA);
}
extern "C" uint32_t isaac_manager_a0f550_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_A0F550_RET_VA);
}
extern "C" uint32_t isaac_manager_a0f550_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_A0F550_BODY_BYTES);
}
extern "C" uint32_t isaac_manager_a0f550_next_va(void) {
  return static_cast<uint32_t>(ISAAC_A0F550_NEXT_VA);
}

/* ===========================================================================
 * ABI v28 -- FUN_00959d00 (host B) decision table.  Byte gate takes a
 * raw uint32_t and narrows in the body.  0x26630 compare is UNSIGNED
 * jbe vs 0.  Every CALL stays a typed host leaf.
 * =========================================================================== */

extern "C" int32_t isaac_manager_959d00_body_needed(uint32_t flag_byte) {
  /* 0x00959d29 cmp byte [esi+0x4b288], 0 / je 0x959e56 */
  return ((flag_byte & 0xffu) != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_manager_959d00_state2_needed(int32_t state) {
  /* 0x00959d36 cmp dword [esi+8], 2 / jne 0x959da3 */
  return (state == ISAAC_959D00_STATE2_VALUE) ? 1 : 0;
}

extern "C" int32_t isaac_manager_959d00_queue_nonempty(uint32_t begin,
                                                      uint32_t end) {
  /* 0x00959d42/48: [Manager+0x4b3d8] != [Manager+0x4b3dc] */
  return (begin != end) ? 1 : 0;
}

extern "C" int32_t isaac_manager_959d00_state2_island_needed(
    uint32_t flag_byte, int32_t state, uint32_t begin, uint32_t end) {
  return (isaac_manager_959d00_body_needed(flag_byte) != 0 &&
          isaac_manager_959d00_state2_needed(state) != 0 &&
          isaac_manager_959d00_queue_nonempty(begin, end) != 0)
             ? 1
             : 0;
}

extern "C" int32_t isaac_manager_959d00_quiet_arg(uint32_t mode_26584,
                                                 uint32_t dword_26630) {
  /* 0x00959d55 cmp dword [eax+0x26584], 0 / jne set0
   * 0x00959d5e cmp dword [eax+0x26630], 0
   * 0x00959d65 mov byte [ebp-0x10], 1
   * 0x00959d69 jbe keep          -- UNSIGNED <= 0, i.e. == 0
   * set0: mov byte [ebp-0x10], 0
   * 0xffffffff / 0x80000000 FAIL the jbe (signed jle would take them). */
  if (mode_26584 != 0u) {
    return 0;
  }
  return (dword_26630 <= 0u) ? 1 : 0;
}

extern "C" int32_t isaac_manager_959d00_host_907690_needed(uint32_t ext) {
  /* 0x00959d8c cmp dword [esi+0x4b28c], 0x11 / je skip */
  return (ext != static_cast<uint32_t>(ISAAC_959D00_EXT_SKIP)) ? 1 : 0;
}
extern "C" int32_t isaac_manager_959d00_menu_alloc_needed(uint32_t menu_ptr) {
  /* 0x00959dbc test ecx,ecx / jne skip alloc.  FULL dword. */
  return (menu_ptr == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_manager_959d00_menu_ctor_needed(uint32_t alloc) {
  /* 0x00959dd7 test eax,eax / je skip ctor.  FULL dword. */
  return (alloc != 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_manager_959d00_flag_ofs(void) {
  return static_cast<uint32_t>(ISAAC_959D00_FLAG_OFS);
}
extern "C" uint32_t isaac_manager_959d00_state_ofs(void) {
  return static_cast<uint32_t>(ISAAC_959D00_STATE_OFS);
}
extern "C" uint32_t isaac_manager_959d00_state2_value(void) {
  return static_cast<uint32_t>(ISAAC_959D00_STATE2_VALUE);
}
extern "C" uint32_t isaac_manager_959d00_queue_begin_ofs(void) {
  return static_cast<uint32_t>(ISAAC_959D00_QUEUE_BEGIN_OFS);
}
extern "C" uint32_t isaac_manager_959d00_queue_end_ofs(void) {
  return static_cast<uint32_t>(ISAAC_959D00_QUEUE_END_OFS);
}
extern "C" uint32_t isaac_manager_959d00_game_mode_ofs(void) {
  return static_cast<uint32_t>(ISAAC_959D00_GAME_MODE_OFS);
}
extern "C" uint32_t isaac_manager_959d00_game_26630_ofs(void) {
  return static_cast<uint32_t>(ISAAC_959D00_GAME_26630_OFS);
}
extern "C" uint32_t isaac_manager_959d00_ext_ofs(void) {
  return static_cast<uint32_t>(ISAAC_959D00_EXT_OFS);
}
extern "C" uint32_t isaac_manager_959d00_ext_skip(void) {
  return static_cast<uint32_t>(ISAAC_959D00_EXT_SKIP);
}
extern "C" uint32_t isaac_manager_959d00_core_ofs(void) {
  return static_cast<uint32_t>(ISAAC_959D00_CORE_OFS);
}
extern "C" uint32_t isaac_manager_959d00_f0_ofs(void) {
  return static_cast<uint32_t>(ISAAC_959D00_F0_OFS);
}
extern "C" uint32_t isaac_manager_959d00_f1_ofs(void) {
  return static_cast<uint32_t>(ISAAC_959D00_F1_OFS);
}
extern "C" uint32_t isaac_manager_959d00_f2_ofs(void) {
  return static_cast<uint32_t>(ISAAC_959D00_F2_OFS);
}
extern "C" uint32_t isaac_manager_959d00_dw_ofs(void) {
  return static_cast<uint32_t>(ISAAC_959D00_DW_OFS);
}
extern "C" uint32_t isaac_manager_959d00_menu_global_va(void) {
  return static_cast<uint32_t>(ISAAC_959D00_MENU_GLOBAL_VA);
}
extern "C" uint32_t isaac_manager_959d00_menu_alloc_size(void) {
  return static_cast<uint32_t>(ISAAC_959D00_MENU_ALLOC_SIZE);
}
extern "C" uint32_t isaac_manager_959d00_menu_store_core_ofs(void) {
  return static_cast<uint32_t>(ISAAC_959D00_MENU_STORE_CORE_OFS);
}
extern "C" uint32_t isaac_manager_959d00_menu_store_f0_ofs(void) {
  return static_cast<uint32_t>(ISAAC_959D00_MENU_STORE_F0_OFS);
}
extern "C" uint32_t isaac_manager_959d00_menu_store_f1_ofs(void) {
  return static_cast<uint32_t>(ISAAC_959D00_MENU_STORE_F1_OFS);
}
extern "C" uint32_t isaac_manager_959d00_menu_store_f2_ofs(void) {
  return static_cast<uint32_t>(ISAAC_959D00_MENU_STORE_F2_OFS);
}
extern "C" uint32_t isaac_manager_959d00_menu_store_dw_ofs(void) {
  return static_cast<uint32_t>(ISAAC_959D00_MENU_STORE_DW_OFS);
}
extern "C" uint32_t isaac_manager_959d00_menu_store_flag_ofs(void) {
  return static_cast<uint32_t>(ISAAC_959D00_MENU_STORE_FLAG_OFS);
}
extern "C" uint32_t isaac_manager_959d00_menu_store_flag_value(void) {
  return static_cast<uint32_t>(ISAAC_959D00_MENU_STORE_FLAG_VALUE);
}
extern "C" uint32_t isaac_manager_959d00_state_after(void) {
  return static_cast<uint32_t>(ISAAC_959D00_STATE_AFTER);
}
extern "C" uint32_t isaac_manager_959d00_flag_clear(void) {
  return static_cast<uint32_t>(ISAAC_959D00_FLAG_CLEAR);
}
extern "C" uint32_t isaac_manager_959d00_manager_global_va(void) {
  return static_cast<uint32_t>(ISAAC_959D00_MANAGER_GLOBAL_VA);
}
extern "C" uint32_t isaac_manager_959d00_game_global_va(void) {
  return static_cast<uint32_t>(ISAAC_959D00_GAME_GLOBAL_VA);
}
extern "C" uint32_t isaac_manager_959d00_host_90cd10_va(void) {
  return static_cast<uint32_t>(ISAAC_959D00_HOST_90CD10_VA);
}
extern "C" uint32_t isaac_manager_959d00_host_90a8a0_va(void) {
  return static_cast<uint32_t>(ISAAC_959D00_HOST_90A8A0_VA);
}
extern "C" uint32_t isaac_manager_959d00_host_907690_va(void) {
  return static_cast<uint32_t>(ISAAC_959D00_HOST_907690_VA);
}
extern "C" uint32_t isaac_manager_959d00_host_959670_va(void) {
  return static_cast<uint32_t>(ISAAC_959D00_HOST_959670_VA);
}
extern "C" uint32_t isaac_manager_959d00_host_91c770_va(void) {
  return static_cast<uint32_t>(ISAAC_959D00_HOST_91C770_VA);
}
extern "C" uint32_t isaac_manager_959d00_host_a0f4c0_va(void) {
  return static_cast<uint32_t>(ISAAC_959D00_HOST_A0F4C0_VA);
}
extern "C" uint32_t isaac_manager_959d00_host_986450_va(void) {
  return static_cast<uint32_t>(ISAAC_959D00_HOST_986450_VA);
}
extern "C" uint32_t isaac_manager_959d00_host_987450_va(void) {
  return static_cast<uint32_t>(ISAAC_959D00_HOST_987450_VA);
}
extern "C" uint32_t isaac_manager_959d00_host_98aa30_va(void) {
  return static_cast<uint32_t>(ISAAC_959D00_HOST_98AA30_VA);
}
extern "C" uint32_t isaac_manager_959d00_va(void) {
  return static_cast<uint32_t>(ISAAC_959D00_VA);
}
extern "C" uint32_t isaac_manager_959d00_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_959D00_RET_VA);
}
extern "C" uint32_t isaac_manager_959d00_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_959D00_BODY_BYTES);
}
extern "C" uint32_t isaac_manager_959d00_sites(void) {
  return static_cast<uint32_t>(ISAAC_959D00_SITES);
}
extern "C" uint32_t isaac_manager_959d00_next_va(void) {
  return static_cast<uint32_t>(ISAAC_959D00_NEXT_VA);
}

/* ===========================================================================
 * ABI v29 -- FUN_00959720 (host A) entry/join decision table.  Byte
 * gates take raw uint32_t and narrow in the body.  Entry parity is
 * test al,1; join parity is peSignedMod2Eq1.  0x4b1c0 compare is
 * UNSIGNED jbe vs 0.  Every CALL stays a typed host leaf.
 * =========================================================================== */

extern "C" int32_t isaac_manager_959720_body_needed(uint32_t flag_4b130) {
  /* 0x00959756 cmp byte [ebx+0x4b130], 0 / je 0x959cdd */
  return nonzero_u8(flag_4b130) ? 1 : 0;
}

extern "C" int32_t isaac_manager_959720_probe_needed(uint32_t flag_4b274) {
  /* 0x00959763 cmp byte [ebx+0x4b274], 0 / je 0x95977f */
  return nonzero_u8(flag_4b274) ? 1 : 0;
}

extern "C" int32_t isaac_manager_959720_probe_ok(uint32_t probe_al) {
  /* 0x00959777 test al,al / je 0x959cdd */
  return nonzero_u8(probe_al) ? 1 : 0;
}

extern "C" int32_t isaac_manager_959720_body_continue(uint32_t flag_4b130,
                                                     uint32_t flag_4b274,
                                                     uint32_t probe_al) {
  if (isaac_manager_959720_body_needed(flag_4b130) == 0) {
    return 0;
  }
  if (isaac_manager_959720_probe_needed(flag_4b274) == 0) {
    return 1;
  }
  return isaac_manager_959720_probe_ok(probe_al);
}

extern "C" int32_t isaac_manager_959720_parity_inc_needed(uint32_t counter) {
  /* 0x00959785 test al,1 / je 0x959790.  Bit0 of the FULL dword. */
  return ((counter & 1u) != 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_manager_959720_parity_next(uint32_t counter) {
  /* 0x00959789 inc eax */
  return counter + 1u;
}

extern "C" int32_t isaac_manager_959720_game_alloc_needed(uint32_t game_ptr) {
  /* 0x00959797 cmp dword [0xc71678], 0 / jne skip.  FULL dword. */
  return (game_ptr == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_manager_959720_game_ctor_needed(uint32_t alloc) {
  /* 0x009597ba test eax,eax / je skip ctor.  FULL dword. */
  return (alloc != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_manager_959720_queue_nonempty(uint32_t begin,
                                                      uint32_t end) {
  /* 0x009597da/e6: [this+0x4b3d8] != [this+0x4b3dc] */
  return (begin != end) ? 1 : 0;
}

extern "C" int32_t isaac_manager_959720_host_6eef20_needed(
    uint32_t flag_4b274, uint32_t ptr_4b140, uint32_t dword_4b3e4) {
  /* 0x00959984..0xa4: flag274 && ptr && dword==0 */
  return (nonzero_u8(flag_4b274) != 0 && ptr_4b140 != 0u &&
          dword_4b3e4 == 0u)
             ? 1
             : 0;
}

extern "C" int32_t isaac_manager_959720_host_923450_needed(
    uint32_t flag_4b274, uint32_t flag_4b131) {
  /* 0x009599bd..0xc9: skip when flag274 && flag131 */
  return (nonzero_u8(flag_4b274) != 0 && nonzero_u8(flag_4b131) != 0)
             ? 0
             : 1;
}

extern "C" int32_t isaac_manager_959720_join_arm(uint32_t flag_4b274,
                                                uint32_t flag_4b131,
                                                uint32_t flag_4b132,
                                                uint32_t dword_4b1c0,
                                                uint32_t flag_4b19c) {
  const int32_t f274 = nonzero_u8(flag_4b274) ? 1 : 0;
  const int32_t f131 = nonzero_u8(flag_4b131) ? 1 : 0;
  if (f274 != 0 && f131 != 0) {
    return ISAAC_959720_ARM_SEED_THEN;
  }
  if (f274 != 0) {
    return ISAAC_959720_ARM_HOST_6F5850;
  }
  if (f131 != 0) {
    return ISAAC_959720_ARM_SEED_ELSE;
  }
  if (nonzero_u8(flag_4b132) != 0) {
    return ISAAC_959720_ARM_4B132;
  }
  /* 0x00959c22 cmp dword [ebx+0x4b1c0], 0 / jbe  — UNSIGNED */
  if (dword_4b1c0 > 0u) {
    return ISAAC_959720_ARM_DAILY;
  }
  if (nonzero_u8(flag_4b19c) != 0) {
    return ISAAC_959720_ARM_DEBUG;
  }
  return ISAAC_959720_ARM_START;
}

extern "C" int32_t isaac_manager_959720_join_parity_inc_needed(
    int32_t counter) {
  /* 0x00959cab and eax,0x80000001 + js fixup / cmp eax,1 */
  return pe_signed_mod2_eq1(counter);
}

extern "C" uint32_t isaac_manager_959720_flag_ofs(void) {
  return static_cast<uint32_t>(ISAAC_959720_FLAG_OFS);
}
extern "C" uint32_t isaac_manager_959720_probe_ofs(void) {
  return static_cast<uint32_t>(ISAAC_959720_PROBE_OFS);
}
extern "C" uint32_t isaac_manager_959720_parity_ofs(void) {
  return static_cast<uint32_t>(ISAAC_959720_PARITY_OFS);
}
extern "C" uint32_t isaac_manager_959720_queue_begin_ofs(void) {
  return static_cast<uint32_t>(ISAAC_959720_QUEUE_BEGIN_OFS);
}
extern "C" uint32_t isaac_manager_959720_queue_end_ofs(void) {
  return static_cast<uint32_t>(ISAAC_959720_QUEUE_END_OFS);
}
extern "C" uint32_t isaac_manager_959720_state_ofs(void) {
  return static_cast<uint32_t>(ISAAC_959720_STATE_OFS);
}
extern "C" uint32_t isaac_manager_959720_state_after(void) {
  return static_cast<uint32_t>(ISAAC_959720_STATE_AFTER);
}
extern "C" uint32_t isaac_manager_959720_flag_4b131_ofs(void) {
  return static_cast<uint32_t>(ISAAC_959720_FLAG_4B131_OFS);
}
extern "C" uint32_t isaac_manager_959720_flag_4b132_ofs(void) {
  return static_cast<uint32_t>(ISAAC_959720_FLAG_4B132_OFS);
}
extern "C" uint32_t isaac_manager_959720_ptr_4b140_ofs(void) {
  return static_cast<uint32_t>(ISAAC_959720_PTR_4B140_OFS);
}
extern "C" uint32_t isaac_manager_959720_dword_4b3e4_ofs(void) {
  return static_cast<uint32_t>(ISAAC_959720_DWORD_4B3E4_OFS);
}
extern "C" uint32_t isaac_manager_959720_recv_923450_ofs(void) {
  return static_cast<uint32_t>(ISAAC_959720_RECV_923450_OFS);
}
extern "C" uint32_t isaac_manager_959720_dword_4b1c0_ofs(void) {
  return static_cast<uint32_t>(ISAAC_959720_DWORD_4B1C0_OFS);
}
extern "C" uint32_t isaac_manager_959720_flag_4b19c_ofs(void) {
  return static_cast<uint32_t>(ISAAC_959720_FLAG_4B19C_OFS);
}
extern "C" uint32_t isaac_manager_959720_word_4b284_ofs(void) {
  return static_cast<uint32_t>(ISAAC_959720_WORD_4B284_OFS);
}
extern "C" uint32_t isaac_manager_959720_word_4b284_value(void) {
  return static_cast<uint32_t>(ISAAC_959720_WORD_4B284_VALUE);
}
extern "C" uint32_t isaac_manager_959720_flag_clear(void) {
  return static_cast<uint32_t>(ISAAC_959720_FLAG_CLEAR);
}
extern "C" uint32_t isaac_manager_959720_game_alloc_size(void) {
  return static_cast<uint32_t>(ISAAC_959720_GAME_ALLOC_SIZE);
}
extern "C" uint32_t isaac_manager_959720_manager_global_va(void) {
  return static_cast<uint32_t>(ISAAC_959720_MANAGER_GLOBAL_VA);
}
extern "C" uint32_t isaac_manager_959720_game_global_va(void) {
  return static_cast<uint32_t>(ISAAC_959720_GAME_GLOBAL_VA);
}
extern "C" uint32_t isaac_manager_959720_host_90c400_va(void) {
  return static_cast<uint32_t>(ISAAC_959720_HOST_90C400_VA);
}
extern "C" uint32_t isaac_manager_959720_host_959670_va(void) {
  return static_cast<uint32_t>(ISAAC_959720_HOST_959670_VA);
}
extern "C" uint32_t isaac_manager_959720_host_a0f4c0_va(void) {
  return static_cast<uint32_t>(ISAAC_959720_HOST_A0F4C0_VA);
}
extern "C" uint32_t isaac_manager_959720_host_6f1020_va(void) {
  return static_cast<uint32_t>(ISAAC_959720_HOST_6F1020_VA);
}
extern "C" uint32_t isaac_manager_959720_host_6f4740_va(void) {
  return static_cast<uint32_t>(ISAAC_959720_HOST_6F4740_VA);
}
extern "C" uint32_t isaac_manager_959720_host_90a8a0_va(void) {
  return static_cast<uint32_t>(ISAAC_959720_HOST_90A8A0_VA);
}
extern "C" uint32_t isaac_manager_959720_host_6eef20_va(void) {
  return static_cast<uint32_t>(ISAAC_959720_HOST_6EEF20_VA);
}
extern "C" uint32_t isaac_manager_959720_host_91c770_va(void) {
  return static_cast<uint32_t>(ISAAC_959720_HOST_91C770_VA);
}
extern "C" uint32_t isaac_manager_959720_host_923450_va(void) {
  return static_cast<uint32_t>(ISAAC_959720_HOST_923450_VA);
}
extern "C" uint32_t isaac_manager_959720_host_6f6dd0_va(void) {
  return static_cast<uint32_t>(ISAAC_959720_HOST_6F6DD0_VA);
}
extern "C" uint32_t isaac_manager_959720_host_6f7750_va(void) {
  return static_cast<uint32_t>(ISAAC_959720_HOST_6F7750_VA);
}
extern "C" uint32_t isaac_manager_959720_host_6f5320_va(void) {
  return static_cast<uint32_t>(ISAAC_959720_HOST_6F5320_VA);
}
extern "C" uint32_t isaac_manager_959720_arm_seed_then(void) {
  return static_cast<uint32_t>(ISAAC_959720_ARM_SEED_THEN);
}
extern "C" uint32_t isaac_manager_959720_arm_host_6f5850(void) {
  return static_cast<uint32_t>(ISAAC_959720_ARM_HOST_6F5850);
}
extern "C" uint32_t isaac_manager_959720_arm_seed_else(void) {
  return static_cast<uint32_t>(ISAAC_959720_ARM_SEED_ELSE);
}
extern "C" uint32_t isaac_manager_959720_arm_4b132(void) {
  return static_cast<uint32_t>(ISAAC_959720_ARM_4B132);
}
extern "C" uint32_t isaac_manager_959720_arm_daily(void) {
  return static_cast<uint32_t>(ISAAC_959720_ARM_DAILY);
}
extern "C" uint32_t isaac_manager_959720_arm_debug(void) {
  return static_cast<uint32_t>(ISAAC_959720_ARM_DEBUG);
}
extern "C" uint32_t isaac_manager_959720_arm_start(void) {
  return static_cast<uint32_t>(ISAAC_959720_ARM_START);
}
extern "C" uint32_t isaac_manager_959720_va(void) {
  return static_cast<uint32_t>(ISAAC_959720_VA);
}
extern "C" uint32_t isaac_manager_959720_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_959720_RET_VA);
}
extern "C" uint32_t isaac_manager_959720_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_959720_BODY_BYTES);
}
extern "C" uint32_t isaac_manager_959720_sites(void) {
  return static_cast<uint32_t>(ISAAC_959720_SITES);
}
extern "C" uint32_t isaac_manager_959720_site_va(void) {
  return static_cast<uint32_t>(ISAAC_959720_SITE_VA);
}
extern "C" uint32_t isaac_manager_959720_next_va(void) {
  return static_cast<uint32_t>(ISAAC_959720_NEXT_VA);
}


/* ===========================================================================
 * ABI v30 -- Manager::cleanup_current_state (0x00959670) pure islands.
 * State id / empty-menu / flag tests.  Host Exit/SFX/free/0x429170 stay host.
 * =========================================================================== */

extern "C" int32_t isaac_manager_959670_state_id(int32_t state) {
  /* 0x00959673 mov eax,[esi+8]; sub eax,1 / je state1; sub eax,1 / jne epilog */
  if (state == ISAAC_959670_STATE_MENU) {
    return ISAAC_959670_STATE_MENU;
  }
  if (state == ISAAC_959670_STATE_GAME) {
    return ISAAC_959670_STATE_GAME;
  }
  return ISAAC_959670_STATE_OTHER;
}

extern "C" int32_t isaac_manager_959670_state1_needed(int32_t state) {
  return (state == ISAAC_959670_STATE_MENU) ? 1 : 0;
}

extern "C" int32_t isaac_manager_959670_state2_needed(int32_t state) {
  return (state == ISAAC_959670_STATE_GAME) ? 1 : 0;
}

extern "C" int32_t isaac_manager_959670_game_present(uint32_t game_ptr) {
  /* 0x0095968a test ecx,ecx.  FULL dword. */
  return (game_ptr != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_manager_959670_game_body_needed(int32_t state,
                                                        uint32_t game_ptr) {
  return (isaac_manager_959670_state2_needed(state) != 0 &&
          isaac_manager_959670_game_present(game_ptr) != 0)
             ? 1
             : 0;
}

extern "C" int32_t isaac_manager_959670_menu_present(uint32_t menu_ptr) {
  /* 0x009596f3 test esi,esi — empty-menu, not a 4b3d8/4b3dc queue. */
  return (menu_ptr != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_manager_959670_menu_body_needed(int32_t state,
                                                        uint32_t menu_ptr) {
  return (isaac_manager_959670_state1_needed(state) != 0 &&
          isaac_manager_959670_menu_present(menu_ptr) != 0)
             ? 1
             : 0;
}

extern "C" uint32_t isaac_manager_959670_exit_save_arg(uint32_t flag_4b284) {
  /* 0x0095968e movzx eax, byte [esi+0x4b284].  RAW uint32, low byte. */
  return flag_4b284 & 0xffu;
}

extern "C" uint32_t isaac_manager_959670_flag_4b285_clear(void) {
  /* 0x0095969b mov byte [esi+0x4b285], 0 */
  return static_cast<uint32_t>(ISAAC_959670_FLAG_4B285_CLEAR);
}

extern "C" int32_t isaac_manager_959670_value_store_needed(float value_2a334) {
  /* 0x009596aa ucomiss vs DAT_00baa454 (1.0f); lahf / test ah,0x44 / jnp
   * skips ONLY ordered-equal.  NaN takes the store+host arm. */
  return (value_2a334 == 1.0f) ? 0 : 1;
}

extern "C" uint32_t isaac_manager_959670_host_429170_recv(uint32_t game_ptr) {
  /* 0x009596dc add ecx, 0x26614.  Runs even when game_ptr == 0. */
  return game_ptr + static_cast<uint32_t>(ISAAC_959670_HOST_429170_OFS);
}

extern "C" uint32_t isaac_manager_959670_state_ofs(void) {
  return static_cast<uint32_t>(ISAAC_959670_STATE_OFS);
}
extern "C" uint32_t isaac_manager_959670_state_other(void) {
  return static_cast<uint32_t>(ISAAC_959670_STATE_OTHER);
}
extern "C" uint32_t isaac_manager_959670_state_menu(void) {
  return static_cast<uint32_t>(ISAAC_959670_STATE_MENU);
}
extern "C" uint32_t isaac_manager_959670_state_game(void) {
  return static_cast<uint32_t>(ISAAC_959670_STATE_GAME);
}
extern "C" uint32_t isaac_manager_959670_flag_4b284_ofs(void) {
  return static_cast<uint32_t>(ISAAC_959670_FLAG_4B284_OFS);
}
extern "C" uint32_t isaac_manager_959670_flag_4b285_ofs(void) {
  return static_cast<uint32_t>(ISAAC_959670_FLAG_4B285_OFS);
}
extern "C" uint32_t isaac_manager_959670_recv_ofs(void) {
  return static_cast<uint32_t>(ISAAC_959670_RECV_OFS);
}
extern "C" uint32_t isaac_manager_959670_value_ofs(void) {
  return static_cast<uint32_t>(ISAAC_959670_VALUE_OFS);
}
extern "C" uint32_t isaac_manager_959670_step_ofs(void) {
  return static_cast<uint32_t>(ISAAC_959670_STEP_OFS);
}
extern "C" uint32_t isaac_manager_959670_value_store_bits(void) {
  return static_cast<uint32_t>(ISAAC_959670_VALUE_STORE_BITS);
}
extern "C" uint32_t isaac_manager_959670_step_store_bits(void) {
  return static_cast<uint32_t>(ISAAC_959670_STEP_STORE_BITS);
}
extern "C" uint32_t isaac_manager_959670_target_va(void) {
  return static_cast<uint32_t>(ISAAC_959670_TARGET_VA);
}
extern "C" uint32_t isaac_manager_959670_game_global_va(void) {
  return static_cast<uint32_t>(ISAAC_959670_GAME_GLOBAL_VA);
}
extern "C" uint32_t isaac_manager_959670_menu_global_va(void) {
  return static_cast<uint32_t>(ISAAC_959670_MENU_GLOBAL_VA);
}
extern "C" uint32_t isaac_manager_959670_menu_free_size(void) {
  return static_cast<uint32_t>(ISAAC_959670_MENU_FREE_SIZE);
}
extern "C" uint32_t isaac_manager_959670_menu_clear(void) {
  return static_cast<uint32_t>(ISAAC_959670_MENU_CLEAR);
}
extern "C" uint32_t isaac_manager_959670_host_429170_ofs(void) {
  return static_cast<uint32_t>(ISAAC_959670_HOST_429170_OFS);
}
extern "C" uint32_t isaac_manager_959670_host_6fa0c0_va(void) {
  return static_cast<uint32_t>(ISAAC_959670_HOST_6FA0C0_VA);
}
extern "C" uint32_t isaac_manager_959670_host_92e430_va(void) {
  return static_cast<uint32_t>(ISAAC_959670_HOST_92E430_VA);
}
extern "C" uint32_t isaac_manager_959670_host_429170_va(void) {
  return static_cast<uint32_t>(ISAAC_959670_HOST_429170_VA);
}
extern "C" uint32_t isaac_manager_959670_host_986f30_va(void) {
  return static_cast<uint32_t>(ISAAC_959670_HOST_986F30_VA);
}
extern "C" uint32_t isaac_manager_959670_host_aef15c_va(void) {
  return static_cast<uint32_t>(ISAAC_959670_HOST_AEF15C_VA);
}
extern "C" uint32_t isaac_manager_959670_epilog_va(void) {
  return static_cast<uint32_t>(ISAAC_959670_EPILOG_VA);
}
extern "C" uint32_t isaac_manager_959670_manager_global_va(void) {
  return static_cast<uint32_t>(ISAAC_959670_MANAGER_GLOBAL_VA);
}
extern "C" uint32_t isaac_manager_959670_va(void) {
  return static_cast<uint32_t>(ISAAC_959670_VA);
}
extern "C" uint32_t isaac_manager_959670_int3_va(void) {
  return static_cast<uint32_t>(ISAAC_959670_INT3_VA);
}
extern "C" uint32_t isaac_manager_959670_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_959670_BODY_BYTES);
}
extern "C" uint32_t isaac_manager_959670_first_ret_trap_bytes(void) {
  return static_cast<uint32_t>(ISAAC_959670_FIRST_RET_TRAP_BYTES);
}
extern "C" uint32_t isaac_manager_959670_sites(void) {
  return static_cast<uint32_t>(ISAAC_959670_SITES);
}
extern "C" uint32_t isaac_manager_959670_site0_va(void) {
  return static_cast<uint32_t>(ISAAC_959670_SITE0_VA);
}
extern "C" uint32_t isaac_manager_959670_site1_va(void) {
  return static_cast<uint32_t>(ISAAC_959670_SITE1_VA);
}
extern "C" uint32_t isaac_manager_959670_site2_va(void) {
  return static_cast<uint32_t>(ISAAC_959670_SITE2_VA);
}
extern "C" uint32_t isaac_manager_959670_next_va(void) {
  return static_cast<uint32_t>(ISAAC_959670_NEXT_VA);
}

/* ===========================================================================
 * ABI v31 -- Cutscene::Show (0x0095e7c0) pure islands.
 * Id range / empty-id / empty-queue / flag tests.  Host Unload / log /
 * Random / 0xa0f550 stay host.
 * =========================================================================== */

extern "C" int32_t isaac_cutscene_95e7c0_id_in_range(uint32_t id) {
  /* 0x0095e7d1 cmp ebx, 0x1a / ja OOB.  UNSIGNED. */
  return (id <= static_cast<uint32_t>(ISAAC_95E7C0_ID_MAX)) ? 1 : 0;
}

extern "C" int32_t isaac_cutscene_95e7c0_unload_needed(uint32_t state) {
  /* 0x0095e814 cmp dword [esi], 0 / je skip.  FULL dword. */
  return (state != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_cutscene_95e7c0_id_nonzero(uint32_t id) {
  /* 0x0095e83f test ebx,ebx / je epilog.  FULL dword. */
  return (id != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_cutscene_95e7c0_show_body_needed(uint32_t id) {
  return (isaac_cutscene_95e7c0_id_in_range(id) != 0 &&
          isaac_cutscene_95e7c0_id_nonzero(id) != 0)
             ? 1
             : 0;
}

extern "C" uint32_t isaac_cutscene_95e7c0_entry_ofs(uint32_t index) {
  /* 0x0095e819 imul 0x4c; lea +4.  32-bit wrap. */
  return static_cast<uint32_t>(ISAAC_95E7C0_ENTRIES_OFS) +
         index * static_cast<uint32_t>(ISAAC_95E7C0_ENTRY_STRIDE);
}

extern "C" int32_t isaac_cutscene_95e7c0_queue_gt1(uint32_t begin,
                                                  uint32_t end) {
  /* 0x0095ead0: SAR32(end-begin, 2); jbe vs 1 is UNSIGNED. */
  int32_t count = static_cast<int32_t>(end - begin) >> 2;
  return (static_cast<uint32_t>(count) > 1u) ? 1 : 0;
}

extern "C" int32_t isaac_cutscene_95e7c0_sso_inline(uint32_t capacity) {
  /* 0x0095e84f cmp [eax+0x14], 0x10 / jb.  UNSIGNED. */
  return (capacity < static_cast<uint32_t>(ISAAC_95E7C0_SSO_CAP)) ? 1 : 0;
}

extern "C" int32_t isaac_cutscene_95e7c0_id_is_2(uint32_t id) {
  /* 0x0095e933 cmp dword [ebp+8], 2 / jne. */
  return (id == static_cast<uint32_t>(ISAAC_95E7C0_ID_SPECIAL)) ? 1 : 0;
}

extern "C" int32_t isaac_cutscene_95e7c0_game_present(uint32_t game_ptr) {
  /* 0x0095e97c test ecx,ecx.  FULL dword. */
  return (game_ptr != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_cutscene_95e7c0_game_1bb88_needed(uint32_t game_ptr,
                                                          uint32_t dword_1bb88) {
  /* 0x0095e97c / 0x0095e980: both FULL dword != 0. */
  return (game_ptr != 0u && dword_1bb88 != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_cutscene_95e7c0_flag_e5_continue(uint32_t flag_e5) {
  /* 0x0095e9ab cmp byte [esi+0xe5], 0 / jne skip.  RAW uint32, low byte. */
  return ((flag_e5 & 0xffu) == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_cutscene_95e7c0_vec_count(uint32_t begin,
                                                  uint32_t end) {
  /* 0x0095e9c6 sub / sar 2. */
  return static_cast<int32_t>(end - begin) >> 2;
}

extern "C" int32_t isaac_cutscene_95e7c0_vec_loop_needed(uint32_t begin,
                                                        uint32_t end) {
  /* 0x0095e9ce test eax,eax / je skip.  Only exact 0 skips. */
  return (isaac_cutscene_95e7c0_vec_count(begin, end) != 0) ? 1 : 0;
}

extern "C" uint32_t isaac_cutscene_95e7c0_id_max(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_ID_MAX);
}
extern "C" uint32_t isaac_cutscene_95e7c0_entry_count(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_ENTRY_COUNT);
}
extern "C" uint32_t isaac_cutscene_95e7c0_entry_stride(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_ENTRY_STRIDE);
}
extern "C" uint32_t isaac_cutscene_95e7c0_entries_ofs(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_ENTRIES_OFS);
}
extern "C" uint32_t isaac_cutscene_95e7c0_state_ofs(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_STATE_OFS);
}
extern "C" uint32_t isaac_cutscene_95e7c0_queued_ofs(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_QUEUED_OFS);
}
extern "C" uint32_t isaac_cutscene_95e7c0_sso_cap(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_SSO_CAP);
}
extern "C" uint32_t isaac_cutscene_95e7c0_id_special(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_ID_SPECIAL);
}
extern "C" uint32_t isaac_cutscene_95e7c0_flag_e5_ofs(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_FLAG_E5_OFS);
}
extern "C" uint32_t isaac_cutscene_95e7c0_vec_begin_ofs(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_VEC_BEGIN_OFS);
}
extern "C" uint32_t isaac_cutscene_95e7c0_vec_end_ofs(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_VEC_END_OFS);
}
extern "C" uint32_t isaac_cutscene_95e7c0_game_1bb88_ofs(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_GAME_1BB88_OFS);
}
extern "C" uint32_t isaac_cutscene_95e7c0_queue_begin_ofs(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_QUEUE_BEGIN_OFS);
}
extern "C" uint32_t isaac_cutscene_95e7c0_queue_end_ofs(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_QUEUE_END_OFS);
}
extern "C" uint32_t isaac_cutscene_95e7c0_queue_helper_va(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_QUEUE_HELPER_VA);
}
extern "C" uint32_t isaac_cutscene_95e7c0_recv_ofs(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_RECV_OFS);
}
extern "C" uint32_t isaac_cutscene_95e7c0_arg_ofs(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_ARG_OFS);
}
extern "C" uint32_t isaac_cutscene_95e7c0_music_index_ofs(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_MUSIC_INDEX_OFS);
}
extern "C" uint32_t isaac_cutscene_95e7c0_music_stride(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_MUSIC_STRIDE);
}
extern "C" uint32_t isaac_cutscene_95e7c0_music_vol_ofs(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_MUSIC_VOL_OFS);
}
extern "C" uint32_t isaac_cutscene_95e7c0_music_rate_ofs(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_MUSIC_RATE_OFS);
}
extern "C" uint32_t isaac_cutscene_95e7c0_music_rate_bits(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_MUSIC_RATE_BITS);
}
extern "C" uint32_t isaac_cutscene_95e7c0_music_2a2cc_ofs(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_MUSIC_2A2CC_OFS);
}
extern "C" uint32_t isaac_cutscene_95e7c0_store_828_ofs(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_STORE_828_OFS);
}
extern "C" uint32_t isaac_cutscene_95e7c0_store_838_ofs(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_STORE_838_OFS);
}
extern "C" uint32_t isaac_cutscene_95e7c0_store_838_value(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_STORE_838_VALUE);
}
extern "C" uint32_t isaac_cutscene_95e7c0_state_after(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_STATE_AFTER);
}
extern "C" uint32_t isaac_cutscene_95e7c0_manager_global_va(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_MANAGER_GLOBAL_VA);
}
extern "C" uint32_t isaac_cutscene_95e7c0_game_global_va(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_GAME_GLOBAL_VA);
}
extern "C" uint32_t isaac_cutscene_95e7c0_host_960840_va(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_HOST_960840_VA);
}
extern "C" uint32_t isaac_cutscene_95e7c0_host_40e910_va(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_HOST_40E910_VA);
}
extern "C" uint32_t isaac_cutscene_95e7c0_host_a112c0_va(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_HOST_A112C0_VA);
}
extern "C" uint32_t isaac_cutscene_95e7c0_host_95ead0_va(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_HOST_95EAD0_VA);
}
extern "C" uint32_t isaac_cutscene_95e7c0_host_91c7e0_va(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_HOST_91C7E0_VA);
}
extern "C" uint32_t isaac_cutscene_95e7c0_host_8fd750_va(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_HOST_8FD750_VA);
}
extern "C" uint32_t isaac_cutscene_95e7c0_host_4239b0_va(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_HOST_4239B0_VA);
}
extern "C" uint32_t isaac_cutscene_95e7c0_host_6eef60_va(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_HOST_6EEF60_VA);
}
extern "C" uint32_t isaac_cutscene_95e7c0_va(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_VA);
}
extern "C" uint32_t isaac_cutscene_95e7c0_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_RET_VA);
}
extern "C" uint32_t isaac_cutscene_95e7c0_oob_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_OOB_RET_VA);
}
extern "C" uint32_t isaac_cutscene_95e7c0_int3_va(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_INT3_VA);
}
extern "C" uint32_t isaac_cutscene_95e7c0_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_BODY_BYTES);
}
extern "C" uint32_t isaac_cutscene_95e7c0_first_ret_trap_bytes(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_FIRST_RET_TRAP_BYTES);
}
extern "C" uint32_t isaac_cutscene_95e7c0_sites(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_SITES);
}
extern "C" uint32_t isaac_cutscene_95e7c0_site_va(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_SITE_VA);
}
extern "C" uint32_t isaac_cutscene_95e7c0_next_va(void) {
  return static_cast<uint32_t>(ISAAC_95E7C0_NEXT_VA);
}

/* ===========================================================================
 * ABI v32 -- NightmareScene::Show (0x00921ce0) pure islands.
 * Players empty-log / map / SSO / dogma / bool / music id.  Host Unload /
 * log / Random / 0xa0f550 / ANM2 / Music::Play / FirstCollectibleOwner /
 * free / strncmp stay host.
 * =========================================================================== */

extern "C" int32_t isaac_nightmare_921ce0_players_count(uint32_t begin,
                                                       uint32_t end) {
  /* 0x00921d3d sub / sar 2.  SAME as v26 player-list count. */
  return static_cast<int32_t>(end - begin) >> 2;
}

extern "C" int32_t isaac_nightmare_921ce0_players_log_needed(uint32_t begin,
                                                            uint32_t end) {
  /* 0x00921d40 test eax,eax / jne skip.  Only exact 0 logs. */
  return (isaac_nightmare_921ce0_players_count(begin, end) == 0) ? 1 : 0;
}

extern "C" int32_t isaac_nightmare_921ce0_map_present(uint32_t isnil_0d,
                                                     uint32_t key_10) {
  /* 0x00921db8 BYTE isnil; 0x00921dbe SIGNED jle vs 0x4f. */
  return isaac_input_map_node_present(isnil_0d, static_cast<int32_t>(key_10),
                                      ISAAC_921CE0_MAP_KEY);
}

extern "C" int32_t isaac_nightmare_921ce0_map_found(uint32_t node,
                                                   uint32_t end) {
  /* 0x00921dca cmp eax, [esi+0x1bbd8] / je skip.  FULL dword. */
  return (node != end) ? 1 : 0;
}

extern "C" int32_t isaac_nightmare_921ce0_strncmp_ok(uint32_t result) {
  /* 0x00921df8 test eax,eax / jne skip_gfx.  FULL dword. */
  return (result == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_nightmare_921ce0_gfx_needed(uint32_t isnil_0d,
                                                    uint32_t key_10,
                                                    uint32_t node, uint32_t end,
                                                    uint32_t strncmp_result) {
  return (isaac_nightmare_921ce0_map_present(isnil_0d, key_10) != 0 &&
          isaac_nightmare_921ce0_map_found(node, end) != 0 &&
          isaac_nightmare_921ce0_strncmp_ok(strncmp_result) != 0)
             ? 1
             : 0;
}

extern "C" int32_t isaac_nightmare_921ce0_sso_inline(uint32_t capacity) {
  /* 0x00921dd6 cmp [ebp-0x80], 0x10 / cmovae.  UNSIGNED. */
  return (capacity < static_cast<uint32_t>(ISAAC_921CE0_SSO_CAP)) ? 1 : 0;
}

extern "C" uint32_t isaac_nightmare_921ce0_sprite_ofs(uint32_t index) {
  /* 0x00921d6d lea ecx,[eax+eax*2]; lea eax,[base+ecx*8].  32-bit wrap. */
  return index * static_cast<uint32_t>(ISAAC_921CE0_SPRITE_STRIDE);
}

extern "C" int32_t isaac_nightmare_921ce0_dogma(uint32_t flag_5e8) {
  /* 0x0092207f cmp byte [edi+0x5e8], 0.  RAW uint32, low byte. */
  return ((flag_5e8 & 0xffu) != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_nightmare_921ce0_collectible_path_needed(
    uint32_t flag_5e8) {
  return (isaac_nightmare_921ce0_dogma(flag_5e8) == 0) ? 1 : 0;
}

extern "C" int32_t isaac_nightmare_921ce0_flag_4b1_continue(uint32_t flag_4b1) {
  /* 0x009220c4 cmp byte [edi+0x4b1], 0 / jne skip.  RAW uint32, low byte. */
  return ((flag_4b1 & 0xffu) == 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_nightmare_921ce0_bool_arg(uint32_t unk) {
  /* 0x00923288 mov al, byte [ebx+8].  RAW uint32, low byte. */
  return unk & 0xffu;
}

extern "C" uint32_t isaac_nightmare_921ce0_music_id(uint32_t flag_5e8) {
  /* 0x009232a4 mov eax,0x60 / cmovne eax,edx=0x41.  RAW uint32, low byte. */
  return (isaac_nightmare_921ce0_dogma(flag_5e8) != 0)
             ? static_cast<uint32_t>(ISAAC_921CE0_MUSIC_ID_DOGMA)
             : static_cast<uint32_t>(ISAAC_921CE0_MUSIC_ID_NORMAL);
}

extern "C" int32_t isaac_nightmare_921ce0_stage_is_c(uint32_t stage) {
  /* 0x009232ca cmp dword [eax], 0xc.  FULL dword. */
  return (stage == static_cast<uint32_t>(ISAAC_921CE0_STAGE_C)) ? 1 : 0;
}

extern "C" int32_t isaac_nightmare_921ce0_stage_is_d(uint32_t stage) {
  /* 0x009220bb cmp dword [edx], 0xd.  FULL dword. */
  return (stage == static_cast<uint32_t>(ISAAC_921CE0_STAGE_D)) ? 1 : 0;
}

extern "C" int32_t isaac_nightmare_921ce0_owner_present(uint32_t eax) {
  /* 0x009220ad test eax,eax / je skip.  FULL dword. */
  return (eax != 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_nightmare_921ce0_map_key(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_MAP_KEY);
}
extern "C" uint32_t isaac_nightmare_921ce0_map_isnil_ofs(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_MAP_ISNIL_OFS);
}
extern "C" uint32_t isaac_nightmare_921ce0_map_key_ofs(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_MAP_KEY_OFS);
}
extern "C" uint32_t isaac_nightmare_921ce0_map_ofs(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_MAP_OFS);
}
extern "C" uint32_t isaac_nightmare_921ce0_players_begin_ofs(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_PLAYERS_BEGIN_OFS);
}
extern "C" uint32_t isaac_nightmare_921ce0_players_end_ofs(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_PLAYERS_END_OFS);
}
extern "C" uint32_t isaac_nightmare_921ce0_sso_cap(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_SSO_CAP);
}
extern "C" uint32_t isaac_nightmare_921ce0_strncmp_n(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_STRNCMP_N);
}
extern "C" uint32_t isaac_nightmare_921ce0_sprite_stride(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_SPRITE_STRIDE);
}
extern "C" uint32_t isaac_nightmare_921ce0_index_ofs(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_INDEX_OFS);
}
extern "C" uint32_t isaac_nightmare_921ce0_table_ofs(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_TABLE_OFS);
}
extern "C" uint32_t isaac_nightmare_921ce0_base_ofs(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_BASE_OFS);
}
extern "C" uint32_t isaac_nightmare_921ce0_dogma_ofs(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_DOGMA_OFS);
}
extern "C" uint32_t isaac_nightmare_921ce0_bool_store_ofs(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_BOOL_STORE_OFS);
}
extern "C" uint32_t isaac_nightmare_921ce0_flag_4b1_ofs(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_FLAG_4B1_OFS);
}
extern "C" uint32_t isaac_nightmare_921ce0_flag_4bc_ofs(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_FLAG_4BC_OFS);
}
extern "C" uint32_t isaac_nightmare_921ce0_flag_4bc_clear(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_FLAG_4BC_CLEAR);
}
extern "C" uint32_t isaac_nightmare_921ce0_flag_4bc_set(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_FLAG_4BC_SET);
}
extern "C" uint32_t isaac_nightmare_921ce0_music_id_normal(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_MUSIC_ID_NORMAL);
}
extern "C" uint32_t isaac_nightmare_921ce0_music_id_dogma(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_MUSIC_ID_DOGMA);
}
extern "C" uint32_t isaac_nightmare_921ce0_music_recv_ofs(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_MUSIC_RECV_OFS);
}
extern "C" uint32_t isaac_nightmare_921ce0_music_vol_ofs(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_MUSIC_VOL_OFS);
}
extern "C" uint32_t isaac_nightmare_921ce0_stage_c(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_STAGE_C);
}
extern "C" uint32_t isaac_nightmare_921ce0_stage_d(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_STAGE_D);
}
extern "C" uint32_t isaac_nightmare_921ce0_collectible_id(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_COLLECTIBLE_ID);
}
extern "C" uint32_t isaac_nightmare_921ce0_laz_tag(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_LAZ_TAG);
}
extern "C" uint32_t isaac_nightmare_921ce0_anm2_load_graphics(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_ANM2_LOAD_GRAPHICS);
}
extern "C" uint32_t isaac_nightmare_921ce0_store_3a4_ofs(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_STORE_3A4_OFS);
}
extern "C" uint32_t isaac_nightmare_921ce0_store_3a4_value(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_STORE_3A4_VALUE);
}
extern "C" uint32_t isaac_nightmare_921ce0_log_level(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_LOG_LEVEL);
}
extern "C" uint32_t isaac_nightmare_921ce0_log_msg_va(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_LOG_MSG_VA);
}
extern "C" uint32_t isaac_nightmare_921ce0_path_va(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_PATH_VA);
}
extern "C" uint32_t isaac_nightmare_921ce0_iat_strncmp_va(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_IAT_STRNCMP_VA);
}
extern "C" uint32_t isaac_nightmare_921ce0_game_global_va(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_GAME_GLOBAL_VA);
}
extern "C" uint32_t isaac_nightmare_921ce0_manager_global_va(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_MANAGER_GLOBAL_VA);
}
extern "C" uint32_t isaac_nightmare_921ce0_recv_ofs(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_RECV_OFS);
}
extern "C" uint32_t isaac_nightmare_921ce0_arg_ofs(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_ARG_OFS);
}
extern "C" uint32_t isaac_nightmare_921ce0_g3_ofs(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_G3_OFS);
}
extern "C" uint32_t isaac_nightmare_921ce0_host_a112c0_va(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_HOST_A112C0_VA);
}
extern "C" uint32_t isaac_nightmare_921ce0_host_4288a0_va(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_HOST_4288A0_VA);
}
extern "C" uint32_t isaac_nightmare_921ce0_host_4074c0_va(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_HOST_4074C0_VA);
}
extern "C" uint32_t isaac_nightmare_921ce0_host_40bd50_va(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_HOST_40BD50_VA);
}
extern "C" uint32_t isaac_nightmare_921ce0_host_407f10_va(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_HOST_407F10_VA);
}
extern "C" uint32_t isaac_nightmare_921ce0_host_9be080_va(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_HOST_9BE080_VA);
}
extern "C" uint32_t isaac_nightmare_921ce0_host_7e1d50_va(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_HOST_7E1D50_VA);
}
extern "C" uint32_t isaac_nightmare_921ce0_host_aef15c_va(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_HOST_AEF15C_VA);
}
extern "C" uint32_t isaac_nightmare_921ce0_host_a0f4c0_va(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_HOST_A0F4C0_VA);
}
extern "C" uint32_t isaac_nightmare_921ce0_va(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_VA);
}
extern "C" uint32_t isaac_nightmare_921ce0_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_RET_VA);
}
extern "C" uint32_t isaac_nightmare_921ce0_int3_va(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_INT3_VA);
}
extern "C" uint32_t isaac_nightmare_921ce0_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_BODY_BYTES);
}
extern "C" uint32_t isaac_nightmare_921ce0_first_ret_trap_bytes(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_FIRST_RET_TRAP_BYTES);
}
extern "C" uint32_t isaac_nightmare_921ce0_sites(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_SITES);
}
extern "C" uint32_t isaac_nightmare_921ce0_site_va(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_SITE_VA);
}
extern "C" uint32_t isaac_nightmare_921ce0_sibling_va(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_SIBLING_VA);
}
extern "C" uint32_t isaac_nightmare_921ce0_next_va(void) {
  return static_cast<uint32_t>(ISAAC_921CE0_NEXT_VA);
}

/* ===========================================================================
 * ABI v33 -- PlayerManager::FirstCollectibleOwner (0x009be080) pure islands.
 * arg2 RNG** is UNUSED by this PE body (never read; RandomCollectibleOwner
 * sibling uses it).  Host GetCollectible (0x72fd10) + HasCollectible-shaped
 * 0x007706e0 stay host.  Cross-family: HUD v13 / Room own FCO under their
 * own names; separate wasm modules, no symbol overlap.
 * =========================================================================== */

static_assert(ISAAC_PROCESS_INPUT_PURE_HELPERS_ABI_VERSION == 52,
              "ProcessInput pure helpers ABI v50 (0x009ba980 PURE CoopBabiesOnly bit-0x10 getter)");
static_assert(ISAAC_FCO9BE080_TWIN_BIT == 0x80000000u,
              "FCO laz shared-global tag is bit31");
static_assert(ISAAC_FCO9BE080_LIST_STRIDE == 4u,
              "FCO player vector stride is 4");
static_assert(ISAAC_FCO9BE080_SITES == 175,
              "FCO rel32 E8 caller census (full .text scan)");

extern "C" int32_t isaac_fco_9be080_twin_walk_flag(uint32_t laz_byte,
                                                   uint32_t item_ptr,
                                                   uint32_t item_flags_b8) {
  /* 0x009be0a7 cmp byte [ebp+0x10],0 / je 0x9be0c8; test eax,eax / je;
     0x009be0b1 mov eax,[eax+0xb8]; and eax,0x80000000; or eax,0; je. */
  if ((laz_byte & 0xffu) == 0u || item_ptr == 0u) {
    return 0;
  }
  return ((item_flags_b8 & ISAAC_FCO9BE080_TWIN_BIT) != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_fco_9be080_list_empty(uint32_t list_begin,
                                               uint32_t list_end) {
  /* 0x009be0ce mov esi,[edi]; cmp esi,[edi+4] / je not_found.  FULL dword. */
  return (list_begin == list_end) ? 1 : 0;
}

extern "C" int32_t isaac_fco_9be080_slot_checkable(uint32_t player_field_2c) {
  /* 0x009be0d9 cmp dword [edi+0x2c],0 / jne step.  FULL dword. */
  return (player_field_2c == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_fco_9be080_has_collectible_hit(uint32_t al_byte) {
  /* 0x009be0e9 / 0x009be105 test al,al.  RAW uint32, low byte. */
  return ((al_byte & 0xffu) != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_fco_9be080_twin_present(uint32_t twin_ptr) {
  /* 0x009be0f3 mov ecx,[edi+0x1e6c]; test ecx,ecx / je step.  FULL dword. */
  return (twin_ptr != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_fco_9be080_twin_check_needed(uint32_t shared_flag,
                                                      uint32_t twin_ptr) {
  /* 0x009be0ed cmp byte [esp+0x13],al (shared byte); 0x009be0f9 test ecx,ecx.
     Shared byte checked BEFORE the twin pointer, both must be nonzero. */
  return (shared_flag != 0u && twin_ptr != 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_fco_9be080_walk_next(uint32_t iter) {
  /* 0x009be10d add esi,4.  32-bit wrap. */
  return iter + static_cast<uint32_t>(ISAAC_FCO9BE080_LIST_STRIDE);
}

extern "C" int32_t isaac_fco_9be080_walk_continue(uint32_t next_iter,
                                                  uint32_t list_end) {
  /* 0x009be110 cmp esi,[this+4] / jne loop.  FULL dword. */
  return (next_iter != list_end) ? 1 : 0;
}

extern "C" uint32_t isaac_fco_9be080_result_player(uint32_t player_ptr) {
  /* 0x009be12f mov eax,edi -- primary hit returns the player ptr. */
  return player_ptr;
}

extern "C" uint32_t isaac_fco_9be080_result_twin(uint32_t twin_ptr) {
  /* 0x009be120 mov eax,[edi+0x1e6c] -- twin hit returns the shared holder. */
  return twin_ptr;
}

extern "C" uint32_t isaac_fco_9be080_result_not_found(void) {
  /* 0x009be115 xor eax,eax -- no owner. */
  return 0;
}

extern "C" uint32_t isaac_fco_9be080_item_config_ofs(void) {
  return static_cast<uint32_t>(ISAAC_FCO9BE080_ITEM_CONFIG_OFS);
}
extern "C" uint32_t isaac_fco_9be080_get_collectible_va(void) {
  return static_cast<uint32_t>(ISAAC_FCO9BE080_HOST_GET_COLLECTIBLE_VA);
}
extern "C" uint32_t isaac_fco_9be080_has_collectible_va(void) {
  return static_cast<uint32_t>(ISAAC_FCO9BE080_HOST_HAS_COLLECTIBLE_VA);
}
extern "C" uint32_t isaac_fco_9be080_item_flags_ofs(void) {
  return static_cast<uint32_t>(ISAAC_FCO9BE080_ITEM_FLAGS_OFS);
}
extern "C" uint32_t isaac_fco_9be080_twin_bit(void) {
  return static_cast<uint32_t>(ISAAC_FCO9BE080_TWIN_BIT);
}
extern "C" uint32_t isaac_fco_9be080_list_begin_ofs(void) {
  return static_cast<uint32_t>(ISAAC_FCO9BE080_LIST_BEGIN_OFS);
}
extern "C" uint32_t isaac_fco_9be080_list_end_ofs(void) {
  return static_cast<uint32_t>(ISAAC_FCO9BE080_LIST_END_OFS);
}
extern "C" uint32_t isaac_fco_9be080_list_stride(void) {
  return static_cast<uint32_t>(ISAAC_FCO9BE080_LIST_STRIDE);
}
extern "C" uint32_t isaac_fco_9be080_slot_flag_ofs(void) {
  return static_cast<uint32_t>(ISAAC_FCO9BE080_SLOT_FLAG_OFS);
}
extern "C" uint32_t isaac_fco_9be080_twin_ptr_ofs(void) {
  return static_cast<uint32_t>(ISAAC_FCO9BE080_TWIN_PTR_OFS);
}
extern "C" uint32_t isaac_fco_9be080_laz_arg_ofs(void) {
  return static_cast<uint32_t>(ISAAC_FCO9BE080_LAZ_ARG_OFS);
}
extern "C" uint32_t isaac_fco_9be080_manager_global_va(void) {
  return static_cast<uint32_t>(ISAAC_FCO9BE080_MANAGER_GLOBAL_VA);
}
extern "C" uint32_t isaac_fco_9be080_va(void) {
  return static_cast<uint32_t>(ISAAC_FCO9BE080_VA);
}
extern "C" uint32_t isaac_fco_9be080_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_FCO9BE080_RET_VA);
}
extern "C" uint32_t isaac_fco_9be080_first_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_FCO9BE080_FIRST_RET_VA);
}
extern "C" uint32_t isaac_fco_9be080_int3_va(void) {
  return static_cast<uint32_t>(ISAAC_FCO9BE080_INT3_VA);
}
extern "C" uint32_t isaac_fco_9be080_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_FCO9BE080_BODY_BYTES);
}
extern "C" uint32_t isaac_fco_9be080_sites(void) {
  return static_cast<uint32_t>(ISAAC_FCO9BE080_SITES);
}
extern "C" uint32_t isaac_fco_9be080_site_va(void) {
  return static_cast<uint32_t>(ISAAC_FCO9BE080_SITE_VA);
}
extern "C" uint32_t isaac_fco_9be080_site2_va(void) {
  return static_cast<uint32_t>(ISAAC_FCO9BE080_SITE2_VA);
}
extern "C" uint32_t isaac_fco_9be080_next_va(void) {
  return static_cast<uint32_t>(ISAAC_FCO9BE080_NEXT_VA);
}

/* ===========================================================================
 * ABI v34 -- PlayerManager::RandomCollectibleOwner (0x009be140) pure islands.
 * Exact ZHL 10 B; 17 rel32 E8 callers all use this = g_Game+0x1baa8; arg2
 * seed is BY VALUE (ZHL says RNG** — the PE tests and scrambles the raw
 * dword), arg3 out ptr (16/17 callers push 0).  Host HasCollectible leaf
 * 0x007706e0 and the two a112c0 assert logs stay host.  Cross-family: the
 * shared walk gates are the same PE code as FCO 0x009be080 (HUD v13 / Room
 * own their copies); agreement laws are asserted in the family tests.
 * =========================================================================== */

static_assert(ISAAC_PROCESS_INPUT_PURE_HELPERS_ABI_VERSION == 52,
              "ProcessInput pure helpers ABI v50 (0x009ba980 PURE CoopBabiesOnly bit-0x10 getter)");
static_assert(ISAAC_RCO9BE140_COLLECT_STRIDE == 0x10u,
              "RCO player collectible entries are 16 bytes");
static_assert(ISAAC_RCO9BE140_SCALE_BITS == 0x2f7ffffeu,
              "RCO draw scale @ 0xba9ff0 is the VERIFIED PE dword 0x2f7ffffe");
static_assert(ISAAC_RCO9BE140_BEST_INIT_BITS == 0xbf800000u,
              "RCO best init is -1.0f");
static_assert(ISAAC_RCO9BE140_SITES == 17,
              "RCO rel32 E8 caller census (full .text scan)");
static_assert(static_cast<int32_t>(ISAAC_RCO9BE140_LOG_LEVEL) ==
              static_cast<int32_t>(ISAAC_A112C0_LEVEL_ASSERT),
              "RCO assert logs use the v11 ASSERT level 0x10");

extern "C" int32_t isaac_rco_9be140_list_empty(uint32_t list_begin,
                                               uint32_t list_end) {
  /* 0x009be16f cmp esi,[this+4] / je tail.  FULL dword. */
  return (list_begin == list_end) ? 1 : 0;
}

extern "C" int32_t isaac_rco_9be140_slot_checkable(uint32_t player_field_2c) {
  /* 0x009be187 cmp dword [player+0x2c],0 / jne skip.  FULL dword. */
  return (player_field_2c == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_rco_9be140_has_collectible_hit(uint32_t al_byte) {
  /* 0x009be197 test al,al / je skip.  RAW uint32, low byte. */
  return ((al_byte & 0xffu) != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_rco_9be140_seed_assert_needed(uint32_t seed) {
  /* 0x009be19e test edx,edx / jne 0x9be1b5.  FULL dword; seed==0 falls into
     the a112c0(0x10, 0xb6bf54) assert + int3 trap @ 0x009be1b1. */
  return (seed == 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_rco_9be140_xorshift_state(uint32_t seed,
                                                    uint32_t shift1,
                                                    uint32_t shift2,
                                                    uint32_t shift3) {
  /* 0x009be1b5..0x009be1ce: t1 = s ^ (s >> s1); t2 = t1 ^ (t1 << s2);
     r = t2 ^ (t2 >> s3).  Shift counts are cl = LOW BYTE of the table
     dword, masked to 5 bits by the hardware (shr/shl reg, cl). */
  const uint32_t s1 = (shift1 & 0xffu) & 0x1fu;
  const uint32_t s2 = (shift2 & 0xffu) & 0x1fu;
  const uint32_t s3 = (shift3 & 0xffu) & 0x1fu;
  const uint32_t t1 = seed ^ (seed >> s1);
  const uint32_t t2 = t1 ^ (t1 << s2);
  return t2 ^ (t2 >> s3);
}

extern "C" double isaac_rco_9be140_state_as_f64(uint32_t state) {
  /* 0x009be1d3 cvtdq2pd + 0x009be1de addsd [sign*8 + 0xbacb00] — the
     sign-correction makes this exactly (double)u32 for every state. */
  return static_cast<double>(state);
}

extern "C" float isaac_rco_9be140_next_float(uint32_t state) {
  /* 0x009be1ea cvtpd2ps (round-half-even) then 0x009be1ee mulss 2^-32f. */
  return static_cast<float>(static_cast<double>(state)) *
         __builtin_bit_cast(float, ISAAC_RCO9BE140_SCALE_BITS);
}

extern "C" int32_t isaac_rco_9be140_best_update_needed(float candidate,
                                                       float best) {
  /* 0x009be1f6 comiss candidate,best / 0x009be1fa jbe 0x9be209 keeps OLD
     best.  jbe is taken on unordered AND on candidate <= best (ordered), so
     the update runs iff ordered && candidate > best.  `>` is false when
     either operand is NaN — exactly the jbe-taken (keep-old) case. */
  return (candidate > best) ? 1 : 0;
}

extern "C" uint32_t isaac_rco_9be140_walk_next(uint32_t iter) {
  /* 0x009be20c add esi,4.  32-bit wrap. */
  return iter + static_cast<uint32_t>(ISAAC_RCO9BE140_LIST_STRIDE);
}

extern "C" int32_t isaac_rco_9be140_walk_continue(uint32_t next_iter,
                                                  uint32_t list_end) {
  /* 0x009be20f cmp esi,[this+4] / jne 0x9be185.  The bound is re-read every
     iteration ([ebp-0xc] hold of this feeds [eax+4]).  FULL dword. */
  return (next_iter != list_end) ? 1 : 0;
}

extern "C" int32_t isaac_rco_9be140_out_present(uint32_t out_ptr) {
  /* 0x009be21b test esi,esi / je 0x9be28d (skip out).  FULL dword. */
  return (out_ptr != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_rco_9be140_winner_present(uint32_t best_player) {
  /* 0x009be21f test ebx,ebx / je 0x9be289 (*out=0).  FULL dword. */
  return (best_player != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_rco_9be140_id_negative(int32_t collectible_id) {
  /* 0x009be223 test edi,edi / jns 0x9be23a.  SIGNED: id<0 takes the
     fixed-out path (*out = [player+0x1770]). */
  return (collectible_id < 0) ? 1 : 0;
}

extern "C" int32_t isaac_rco_9be140_collectible_count(int32_t end,
                                                      int32_t begin) {
  /* 0x009be240 sub eax,[player+0x1770]; 0x009be248 sar eax,4.  32-bit wrap
     then arithmetic shift (16-byte entries). */
  const int32_t diff =
      static_cast<int32_t>(static_cast<uint32_t>(end) -
                           static_cast<uint32_t>(begin));
  return diff >> 4;
}

extern "C" int32_t isaac_rco_9be140_collectible_id_oob(int32_t id,
                                                       int32_t count) {
  /* 0x009be24b cmp edi,eax / jl 0x9be264.  SIGNED: the assert log runs when
     id >= count (then the flow CONTINUES with the clamp, no trap). */
  return (id >= count) ? 1 : 0;
}

extern "C" uint32_t isaac_rco_9be140_collectible_count_minus1(int32_t count) {
  /* 0x009be26f lea eax,[edx-1] -- the clamp bound, count-1 (wrap-safe). */
  return static_cast<uint32_t>(count) - 1u;
}

extern "C" uint32_t isaac_rco_9be140_collectible_index_clamp(
    uint32_t id, uint32_t count_minus1) {
  /* 0x009be272 cmp eax,edi / cmovb edi,eax.  UNSIGNED below: the result is
     min(id, count-1) with a 32-bit compare, NOT the signed jl gate above. */
  return (count_minus1 < id) ? count_minus1 : id;
}

extern "C" uint32_t isaac_rco_9be140_collectible_entry_ptr(uint32_t base,
                                                           uint32_t index) {
  /* 0x009be279 shl edi,4; 0x009be27c add edi,ecx.  base + index*16, wrap. */
  return base + (index << 4u);
}

extern "C" uint32_t isaac_rco_9be140_result_player(uint32_t best_player) {
  /* 0x009be22d / 0x009be277 / 0x009be28d: mov eax,ebx. */
  return best_player;
}

extern "C" uint32_t isaac_rco_9be140_list_begin_ofs(void) {
  return static_cast<uint32_t>(ISAAC_RCO9BE140_LIST_BEGIN_OFS);
}
extern "C" uint32_t isaac_rco_9be140_list_end_ofs(void) {
  return static_cast<uint32_t>(ISAAC_RCO9BE140_LIST_END_OFS);
}
extern "C" uint32_t isaac_rco_9be140_list_stride(void) {
  return static_cast<uint32_t>(ISAAC_RCO9BE140_LIST_STRIDE);
}
extern "C" uint32_t isaac_rco_9be140_slot_flag_ofs(void) {
  return static_cast<uint32_t>(ISAAC_RCO9BE140_SLOT_FLAG_OFS);
}
extern "C" uint32_t isaac_rco_9be140_collect_begin_ofs(void) {
  return static_cast<uint32_t>(ISAAC_RCO9BE140_COLLECT_BEGIN_OFS);
}
extern "C" uint32_t isaac_rco_9be140_collect_end_ofs(void) {
  return static_cast<uint32_t>(ISAAC_RCO9BE140_COLLECT_END_OFS);
}
extern "C" uint32_t isaac_rco_9be140_collect_stride(void) {
  return static_cast<uint32_t>(ISAAC_RCO9BE140_COLLECT_STRIDE);
}
extern "C" uint32_t isaac_rco_9be140_seed_assert_msg_va(void) {
  return static_cast<uint32_t>(ISAAC_RCO9BE140_SEED_ASSERT_MSG_VA);
}
extern "C" uint32_t isaac_rco_9be140_oob_assert_msg_va(void) {
  return static_cast<uint32_t>(ISAAC_RCO9BE140_OOB_ASSERT_MSG_VA);
}
extern "C" uint32_t isaac_rco_9be140_log_level(void) {
  return static_cast<uint32_t>(ISAAC_RCO9BE140_LOG_LEVEL);
}
extern "C" uint32_t isaac_rco_9be140_assert_trap_va(void) {
  return static_cast<uint32_t>(ISAAC_RCO9BE140_ASSERT_TRAP_VA);
}
extern "C" uint32_t isaac_rco_9be140_has_collectible_va(void) {
  return static_cast<uint32_t>(ISAAC_RCO9BE140_HOST_HAS_COLLECTIBLE_VA);
}
extern "C" uint32_t isaac_rco_9be140_host_log_va(void) {
  return static_cast<uint32_t>(ISAAC_RCO9BE140_HOST_LOG_VA);
}
extern "C" uint32_t isaac_rco_9be140_game_global_va(void) {
  return static_cast<uint32_t>(ISAAC_RCO9BE140_GAME_GLOBAL_VA);
}
extern "C" uint32_t isaac_rco_9be140_receiver_ofs(void) {
  return static_cast<uint32_t>(ISAAC_RCO9BE140_RECEIVER_OFS);
}
extern "C" uint32_t isaac_rco_9be140_rng_shift_table_va(void) {
  return static_cast<uint32_t>(ISAAC_RCO9BE140_RNG_SHIFT_TABLE_VA);
}
extern "C" uint32_t isaac_rco_9be140_rng_shift1(void) {
  return static_cast<uint32_t>(ISAAC_RCO9BE140_RNG_SHIFT1);
}
extern "C" uint32_t isaac_rco_9be140_rng_shift2(void) {
  return static_cast<uint32_t>(ISAAC_RCO9BE140_RNG_SHIFT2);
}
extern "C" uint32_t isaac_rco_9be140_rng_shift3(void) {
  return static_cast<uint32_t>(ISAAC_RCO9BE140_RNG_SHIFT3);
}
extern "C" uint32_t isaac_rco_9be140_best_init_bits(void) {
  return static_cast<uint32_t>(ISAAC_RCO9BE140_BEST_INIT_BITS);
}
extern "C" uint32_t isaac_rco_9be140_scale_bits(void) {
  return static_cast<uint32_t>(ISAAC_RCO9BE140_SCALE_BITS);
}
extern "C" uint32_t isaac_rco_9be140_sign_corr_table_va(void) {
  return static_cast<uint32_t>(ISAAC_RCO9BE140_SIGN_CORR_TABLE_VA);
}
extern "C" float isaac_rco_9be140_best_init_value(void) {
  /* 0x009be146 movss xmm0,[0xbaad50]. */
  return -1.0f;
}
extern "C" float isaac_rco_9be140_scale_value(void) {
  /* 0x009be1ee mulss [0xba9ff0]. */
  return __builtin_bit_cast(float, ISAAC_RCO9BE140_SCALE_BITS);
}
extern "C" uint32_t isaac_rco_9be140_va(void) {
  return static_cast<uint32_t>(ISAAC_RCO9BE140_VA);
}
extern "C" uint32_t isaac_rco_9be140_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_RCO9BE140_RET_VA);
}
extern "C" uint32_t isaac_rco_9be140_first_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_RCO9BE140_FIRST_RET_VA);
}
extern "C" uint32_t isaac_rco_9be140_int3_va(void) {
  return static_cast<uint32_t>(ISAAC_RCO9BE140_INT3_VA);
}
extern "C" uint32_t isaac_rco_9be140_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_RCO9BE140_BODY_BYTES);
}
extern "C" uint32_t isaac_rco_9be140_sites(void) {
  return static_cast<uint32_t>(ISAAC_RCO9BE140_SITES);
}
extern "C" uint32_t isaac_rco_9be140_next_va(void) {
  return static_cast<uint32_t>(ISAAC_RCO9BE140_NEXT_VA);
}

/* ===========================================================================
 * ABI v35 -- address-stable RNG**-variant sibling 0x009be2a0 pure islands.
 * Body 0x009be2a0 .. ret 0xc @ 0x009be3d8 / 0x009be356, int3 @ 0x009be3db.
 * Single documented rel32 E8 caller 0x006eca9d (this = g_Game + 0x1baa8;
 * no data pointers).  Direct-index head into the Manager player list
 * ([0xc7169c]+0x2a410/+0x2a414, stride 4) with id & 0x7fff and a SIGNED
 * jge range check; then the FCO/RCO twin-aware walk with host
 * HasCollectible 0x00771550 x2, twin-get 0x0065cf80 for *out, and the
 * a112c0 OOB log (level ASSERT 0x10, msg 0xb64a88) when SIGNED id<0 or
 * id>=count.  The player-hit index clamp is the sbb/and idiom == UNSIGNED
 * min(id, count-1); *out = cbegin + index*16 with the collect vector at
 * player+0x177c/+0x1780.  Not a ProcessInput pin; address-stable name.
 * =========================================================================== */

static_assert(ISAAC_PROCESS_INPUT_PURE_HELPERS_ABI_VERSION == 52,
              "ProcessInput pure helpers ABI v50 (0x009ba980 PURE CoopBabiesOnly bit-0x10 getter)");
static_assert(ISAAC_A9BE2A0_ID_MASK == 0x7fffu,
              "9be2a0 direct-index id mask is 15 bits");
static_assert(ISAAC_A9BE2A0_COLLECT_STRIDE == 0x10u,
              "9be2a0 collectible entries are 16 bytes");
static_assert(ISAAC_A9BE2A0_SITES == 1,
              "9be2a0 rel32 E8 caller census (full .text scan)");
static_assert(static_cast<int32_t>(ISAAC_A9BE2A0_LOG_LEVEL) ==
              static_cast<int32_t>(ISAAC_A112C0_LEVEL_ASSERT),
              "9be2a0 OOB log uses the v11 ASSERT level 0x10");

extern "C" int32_t isaac_a9be2a0_players_count(uint32_t end, uint32_t begin) {
  /* 0x009be2bf sub eax,edx; 0x009be2c3 sar eax,2.  Signed SAR, wrap. */
  const int32_t diff =
      static_cast<int32_t>(end - begin);
  return diff >> 2;
}

extern "C" uint32_t isaac_a9be2a0_id_mask15(uint32_t id) {
  /* 0x009be2c6 and ecx,0x7fff -- 15-bit mask on the collectible id. */
  return id & static_cast<uint32_t>(ISAAC_A9BE2A0_ID_MASK);
}

extern "C" int32_t isaac_a9be2a0_direct_index_oor(int32_t masked_id,
                                                  int32_t count) {
  /* 0x009be2cf cmp ecx,eax / 0x009be2d1 jge 0x9be2d8.  SIGNED: the xor eax
     (direct player = 0) arm runs when masked_id >= count. */
  return (masked_id >= count) ? 1 : 0;
}

extern "C" uint32_t isaac_a9be2a0_direct_player_ptr(uint32_t begin,
                                                    uint32_t masked_id) {
  /* 0x009be2d3 mov eax,[edx+ecx*4].  begin + masked_id*4, 32-bit wrap. */
  return begin + (masked_id << 2u);
}

extern "C" int32_t isaac_a9be2a0_twin_flag(uint32_t arg3_byte,
                                           uint32_t player_present,
                                           uint32_t flags_b8) {
  /* 0x009be2da cmp byte [ebp+0x10],0 / je set0; 0x009be2e0 test eax,eax /
     je set0; 0x009be2ea and eax,0x80000000; 0x009be2f6 jne done.  The
     [ebp+0x13] store is 1 iff arg3 byte && player && bit31. */
  return (((arg3_byte & 0xffu) != 0u) && (player_present != 0u) &&
          ((flags_b8 & ISAAC_A9BE2A0_TWIN_BIT) != 0u))
             ? 1
             : 0;
}

extern "C" int32_t isaac_a9be2a0_list_empty(uint32_t list_begin,
                                            uint32_t list_end) {
  /* 0x009be2fc mov esi,[edi]; 0x009be2fe cmp esi,[edi+4] / je 0x9be341.
     FULL dword. */
  return (list_begin == list_end) ? 1 : 0;
}

extern "C" int32_t isaac_a9be2a0_slot_checkable(uint32_t player_field_2c) {
  /* 0x009be307 cmp dword [edi+0x2c],0 / jne 0x9be339.  FULL dword. */
  return (player_field_2c == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_a9be2a0_has_collectible_hit(uint32_t al_byte) {
  /* 0x009be317 test al,al / jne 0x9be37d.  RAW uint32, low byte. */
  return ((al_byte & 0xffu) != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_a9be2a0_twin_check_needed(uint32_t twin_flag,
                                                   uint32_t twin_ptr) {
  /* 0x009be31b cmp byte [ebp+0x13],al / je 0x9be336; 0x009be320 mov
     ecx,[edi+0x1e6c]; 0x009be326 test ecx,ecx / je 0x9be336.  The stored
     flag byte (al==0 there) AND the twin ptr, both FULL dword. */
  return ((twin_flag != 0u) && (twin_ptr != 0u)) ? 1 : 0;
}

extern "C" uint32_t isaac_a9be2a0_walk_next(uint32_t iter) {
  /* 0x009be339 add esi,4.  32-bit wrap. */
  return iter + static_cast<uint32_t>(ISAAC_A9BE2A0_LIST_STRIDE);
}

extern "C" int32_t isaac_a9be2a0_walk_continue(uint32_t next_iter,
                                               uint32_t list_end) {
  /* 0x009be33c cmp esi,[eax+4] / jne 0x9be305.  this re-read from
     [ebp-4] each iteration ([eax+4]).  FULL dword. */
  return (next_iter != list_end) ? 1 : 0;
}

extern "C" int32_t isaac_a9be2a0_out_present(uint32_t out_ptr) {
  /* 0x009be341 / 0x009be35c / 0x009be380: test out / je skip-store.
     FULL dword. */
  return (out_ptr != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_a9be2a0_id_negative(int32_t collectible_id) {
  /* 0x009be384 test ebx,ebx / 0x009be386 js 0x9be39b.  SIGNED: id<0 runs
     the OOB assert log. */
  return (collectible_id < 0) ? 1 : 0;
}

extern "C" int32_t isaac_a9be2a0_collect_count(int32_t end, int32_t begin) {
  /* 0x009be38e sub eax,[edi+0x177c]; 0x009be394 sar eax,4.  Signed SAR,
     16-byte entries, 32-bit wrap. */
  const int32_t diff =
      static_cast<int32_t>(static_cast<uint32_t>(end) -
                           static_cast<uint32_t>(begin));
  return diff >> 4;
}

extern "C" int32_t isaac_a9be2a0_id_oob(int32_t id, int32_t count) {
  /* 0x009be397 cmp ebx,eax / 0x009be399 jl 0x9be3aa.  SIGNED: the assert
     log runs when id >= count (flow then continues to the clamp). */
  return (id >= count) ? 1 : 0;
}

extern "C" int32_t isaac_a9be2a0_log_needed(int32_t id, int32_t count) {
  /* 0x009be386 js 0x9be39b (id<0) OR 0x009be399 jl not-taken (id>=count):
     the a112c0(0x10, 0xb64a88) OOB log gate in the player-hit arm. */
  return ((id < 0) || (id >= count)) ? 1 : 0;
}

extern "C" uint32_t isaac_a9be2a0_collect_count_minus1(int32_t count) {
  /* 0x009be3bd dec edx.  Wrap-safe count-1. */
  return static_cast<uint32_t>(count) - 1u;
}

extern "C" uint32_t isaac_a9be2a0_collect_index_clamp(
    uint32_t id, uint32_t count_minus1) {
  /* 0x009be3be cmp eax,ebx / sbb eax,eax / and eax,ebx / 0x009be3c4 cmp
     eax,edx / 0x009be3c6 cmovb edx,eax.  The idiom collapses to UNSIGNED
     min(id, count-1) for every id: id==0 -> 0 -> min is 0; id!=0 -> id
     -> min.  NOT the signed jl gate above. */
  return (count_minus1 < id) ? count_minus1 : id;
}

extern "C" uint32_t isaac_a9be2a0_collect_entry_ptr(uint32_t base,
                                                    uint32_t index) {
  /* 0x009be3c9 shl edx,4; 0x009be3cc add edx,ecx.  base + index*16, wrap. */
  return base + (index << 4u);
}

extern "C" uint32_t isaac_a9be2a0_twin_result(uint32_t twin_ptr) {
  /* 0x009be36e mov eax,[edi+0x1e6c] -- twin-hit return value. */
  return twin_ptr;
}

extern "C" uint32_t isaac_a9be2a0_result_not_found(void) {
  /* 0x009be34e xor eax,eax -- not-found tail return. */
  return 0u;
}

extern "C" uint32_t isaac_a9be2a0_result_player(uint32_t player) {
  /* 0x009be3d0 mov eax,edi -- player-hit return value. */
  return player;
}

extern "C" uint32_t isaac_a9be2a0_store_zero_value(void) {
  /* 0x009be348 mov dword [eax],0 -- not-found *out store value. */
  return 0u;
}

extern "C" uint32_t isaac_a9be2a0_players_begin_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE2A0_PLAYERS_BEGIN_OFS);
}
extern "C" uint32_t isaac_a9be2a0_players_end_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE2A0_PLAYERS_END_OFS);
}
extern "C" uint32_t isaac_a9be2a0_list_begin_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE2A0_LIST_BEGIN_OFS);
}
extern "C" uint32_t isaac_a9be2a0_list_end_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE2A0_LIST_END_OFS);
}
extern "C" uint32_t isaac_a9be2a0_list_stride(void) {
  return static_cast<uint32_t>(ISAAC_A9BE2A0_LIST_STRIDE);
}
extern "C" uint32_t isaac_a9be2a0_slot_flag_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE2A0_SLOT_FLAG_OFS);
}
extern "C" uint32_t isaac_a9be2a0_item_flags_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE2A0_ITEM_FLAGS_OFS);
}
extern "C" uint32_t isaac_a9be2a0_twin_bit(void) {
  return static_cast<uint32_t>(ISAAC_A9BE2A0_TWIN_BIT);
}
extern "C" uint32_t isaac_a9be2a0_twin_ptr_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE2A0_TWIN_PTR_OFS);
}
extern "C" uint32_t isaac_a9be2a0_collect_begin_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE2A0_COLLECT_BEGIN_OFS);
}
extern "C" uint32_t isaac_a9be2a0_collect_end_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE2A0_COLLECT_END_OFS);
}
extern "C" uint32_t isaac_a9be2a0_collect_stride(void) {
  return static_cast<uint32_t>(ISAAC_A9BE2A0_COLLECT_STRIDE);
}
extern "C" uint32_t isaac_a9be2a0_id_mask(void) {
  return static_cast<uint32_t>(ISAAC_A9BE2A0_ID_MASK);
}
extern "C" uint32_t isaac_a9be2a0_manager_global_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE2A0_MANAGER_GLOBAL_VA);
}
extern "C" uint32_t isaac_a9be2a0_game_global_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE2A0_GAME_GLOBAL_VA);
}
extern "C" uint32_t isaac_a9be2a0_receiver_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE2A0_RECEIVER_OFS);
}
extern "C" uint32_t isaac_a9be2a0_has_collectible_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE2A0_HOST_HAS_COLLECTIBLE_VA);
}
extern "C" uint32_t isaac_a9be2a0_twin_get_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE2A0_HOST_TWIN_GET_VA);
}
extern "C" uint32_t isaac_a9be2a0_host_log_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE2A0_HOST_LOG_VA);
}
extern "C" uint32_t isaac_a9be2a0_oob_msg_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE2A0_OOB_MSG_VA);
}
extern "C" uint32_t isaac_a9be2a0_log_level(void) {
  return static_cast<uint32_t>(ISAAC_A9BE2A0_LOG_LEVEL);
}
extern "C" uint32_t isaac_a9be2a0_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE2A0_VA);
}
extern "C" uint32_t isaac_a9be2a0_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE2A0_RET_VA);
}
extern "C" uint32_t isaac_a9be2a0_first_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE2A0_FIRST_RET_VA);
}
extern "C" uint32_t isaac_a9be2a0_int3_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE2A0_INT3_VA);
}
extern "C" uint32_t isaac_a9be2a0_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_A9BE2A0_BODY_BYTES);
}
extern "C" uint32_t isaac_a9be2a0_sites(void) {
  return static_cast<uint32_t>(ISAAC_A9BE2A0_SITES);
}
extern "C" uint32_t isaac_a9be2a0_site_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE2A0_SITE_VA);
}
extern "C" uint32_t isaac_a9be2a0_next_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE2A0_NEXT_VA);
}

/* ===========================================================================
 * ABI v36 -- 0x009be3e0 RandomTrinketOwner pure islands (exact ZHL 10 B).
 * Body 0x009be3e0 .. ret 0xc @ 0x009be52a / 0x009be51b, int3 @ 0x009be52d.
 * Full rel32 E8 census = 10 sites (this = g_Game + 0x1baa8; arg2 BY-VALUE
 * seed; arg3 optional out ptr -> collectible ENTRY pointer).  v34 RCO walk +
 * xorshift draw with the v35 leaf 0x00771550 and the v35 collect vector
 * 0x177c/0x1780; the drawn state is stored back to the LOCAL arg copy only.
 * Tail is v35-shaped: id<0 (js 0x009be4c7) logs, NO v34 fixed-out arm; the
 * clamp is the sbb/and/cmovb idiom == UNSIGNED min(id, count-1).
 * =========================================================================== */
static_assert(ISAAC_PROCESS_INPUT_PURE_HELPERS_ABI_VERSION == 52,
              "ProcessInput pure helpers ABI v50 (0x009ba980 PURE CoopBabiesOnly bit-0x10 getter)");
static_assert(ISAAC_RTO9BE3E0_COLLECT_STRIDE == 0x10u,
              "RTO player collectible entries are 16 bytes");
static_assert(ISAAC_RTO9BE3E0_SCALE_BITS == 0x2f7ffffeu,
              "RTO draw scale @ 0xba9ff0 is the VERIFIED PE dword 0x2f7ffffe");
static_assert(ISAAC_RTO9BE3E0_BEST_INIT_BITS == 0xbf800000u,
              "RTO best init is -1.0f");
static_assert(ISAAC_RTO9BE3E0_RNG_SHIFT1 == 3u &&
                  ISAAC_RTO9BE3E0_RNG_SHIFT2 == 5u &&
                  ISAAC_RTO9BE3E0_RNG_SHIFT3 == 20u,
              "RTO/ RCO xorshift table 0xb1f5d0 = 3 / 5 / 20 (PE-verified)");

extern "C" int32_t isaac_rto_9be3e0_list_empty(uint32_t list_begin,
                                               uint32_t list_end) {
  /* 0x009be3f9 cmp esi,[this+4] / 0x009be418 je 0x9be4ba.  FULL dword. */
  return (list_begin == list_end) ? 1 : 0;
}

extern "C" int32_t isaac_rto_9be3e0_slot_checkable(uint32_t player_field_2c) {
  /* 0x009be423 cmp dword [player+0x2c],0 / 0x009be427 jne skip.  FULL dword. */
  return (player_field_2c == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_rto_9be3e0_has_collectible_hit(uint32_t al_byte) {
  /* 0x009be437 test al,al / 0x009be439 je advance.  RAW uint32, low byte. */
  return ((al_byte & 0xffu) != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_rto_9be3e0_seed_assert_needed(uint32_t seed) {
  /* 0x009be43e test edx,edx / 0x009be440 jne 0x9be455.  FULL dword; seed==0
     falls into the a112c0(0x10, 0xb6bf54) assert + int3 trap @ 0x009be451
     (the 0x009be452 reload is dead code). */
  return (seed == 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_rto_9be3e0_xorshift_state(uint32_t seed,
                                                    uint32_t shift1,
                                                    uint32_t shift2,
                                                    uint32_t shift3) {
  /* 0x009be455..0x009be46e: t1 = s ^ (s >> s1); t2 = t1 ^ (t1 << s2);
     r = t2 ^ (t2 >> s3).  Shift counts are cl = LOW BYTE of the table
     dword, masked to 5 bits by the hardware (shr/shl reg, cl).  Same
     table as RCO (3/5/20 @ 0xb1f5d0, PE-verified). */
  const uint32_t s1 = (shift1 & 0xffu) & 0x1fu;
  const uint32_t s2 = (shift2 & 0xffu) & 0x1fu;
  const uint32_t s3 = (shift3 & 0xffu) & 0x1fu;
  const uint32_t t1 = seed ^ (seed >> s1);
  const uint32_t t2 = t1 ^ (t1 << s2);
  return t2 ^ (t2 >> s3);
}

extern "C" double isaac_rto_9be3e0_state_as_f64(uint32_t state) {
  /* 0x009be476 cvtdq2pd + 0x009be481 addsd [sign*8 + 0xbacb00] — the
     sign-correction makes this exactly (double)u32 for every state. */
  return static_cast<double>(state);
}

extern "C" float isaac_rto_9be3e0_next_float(uint32_t state) {
  /* 0x009be48d cvtpd2ps (round-half-even) then 0x009be491 mulss [0xba9ff0];
     scale dword VERIFIED = 0x2f7ffffe, not the handy 2^-32f spelling. */
  return static_cast<float>(static_cast<double>(state)) *
         __builtin_bit_cast(float, ISAAC_RTO9BE3E0_SCALE_BITS);
}

extern "C" int32_t isaac_rto_9be3e0_best_update_needed(float candidate,
                                                       float best) {
  /* 0x009be499 comiss candidate,best / 0x009be49d jbe keeps OLD best.
     jbe is taken on unordered AND on candidate <= best (ordered), so the
     update runs iff ordered && candidate > best.  `>` is false when either
     operand is NaN — exactly the jbe-taken (keep-old) case. */
  return (candidate > best) ? 1 : 0;
}

extern "C" uint32_t isaac_rto_9be3e0_walk_next(uint32_t iter) {
  /* 0x009be4ae add esi,4.  32-bit wrap. */
  return iter + static_cast<uint32_t>(ISAAC_RTO9BE3E0_LIST_STRIDE);
}

extern "C" int32_t isaac_rto_9be3e0_walk_continue(uint32_t next_iter,
                                                  uint32_t list_end) {
  /* 0x009be4b1 cmp esi,[eax+4] / 0x009be4b4 jne 0x9be421.  The bound is
     re-read every iteration ([ebp-8] hold of this feeds [eax+4]).  FULL
     dword. */
  return (next_iter != list_end) ? 1 : 0;
}

extern "C" int32_t isaac_rto_9be3e0_out_present(uint32_t out_ptr) {
  /* 0x009be4bd test edi,edi / 0x009be4bf je 0x9be522 (return best, no
     store).  FULL dword. */
  return (out_ptr != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_rto_9be3e0_winner_present(uint32_t best_player) {
  /* 0x009be4c1 test ebx,ebx / 0x009be4c3 je 0x9be51e (*out=0).  FULL dword. */
  return (best_player != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_rto_9be3e0_id_negative(int32_t trinket_id) {
  /* 0x009be4c5 test ecx,ecx / 0x009be4c7 js 0x9be4dc.  SIGNED: id<0 runs
     the OOB log; unlike v34 there is NO fixed-out arm — the flow continues
     into the clamp (ecx = id, reloaded at 0x009be470 / 0x009be4a8). */
  return (trinket_id < 0) ? 1 : 0;
}

extern "C" int32_t isaac_rto_9be3e0_collectible_count(int32_t end,
                                                      int32_t begin) {
  /* 0x009be4cf sub eax,[ebx+0x1780]-[ebx+0x177c]; 0x009be4d5 sar eax,4.
     Signed SAR, 16-byte entries, 32-bit wrap. */
  const int32_t diff =
      static_cast<int32_t>(static_cast<uint32_t>(end) -
                           static_cast<uint32_t>(begin));
  return diff >> 4;
}

extern "C" int32_t isaac_rto_9be3e0_collectible_id_oob(int32_t id,
                                                       int32_t count) {
  /* 0x009be4d8 cmp ecx,eax / 0x009be4da jl 0x9be4eb.  SIGNED: the assert
     log runs when id >= count (then the flow CONTINUES with the clamp, no
     trap). */
  return (id >= count) ? 1 : 0;
}

extern "C" int32_t isaac_rto_9be3e0_log_needed(int32_t id, int32_t count) {
  /* 0x009be4c7 js 0x9be4dc (id<0) OR 0x009be4da jl not-taken (id>=count):
     the a112c0(0x10, 0xb64a88 "Trinket ID out of bounds!") OOB log gate in
     the player-hit arm. */
  return ((id < 0) || (id >= count)) ? 1 : 0;
}

extern "C" uint32_t isaac_rto_9be3e0_collectible_count_minus1(int32_t count) {
  /* 0x009be4fb sar edx,4; 0x009be4fe dec edx.  Wrap-safe count-1. */
  return static_cast<uint32_t>(count) - 1u;
}

extern "C" uint32_t isaac_rto_9be3e0_collectible_index_clamp(
    uint32_t id, uint32_t count_minus1) {
  /* 0x009be4ff xor eax,eax / cmp eax,[ebp+8] / sbb eax,eax / and eax,[ebp+8]
     / 0x009be507 cmp eax,edx / 0x009be509 cmovb edx,eax.  The sbb/and part
     is identity on id (0 stays 0), so the idiom collapses to UNSIGNED
     min(id, count-1) — NOT the signed jl gate above; 0xffffffff clamps to
     count-1. */
  return (count_minus1 < id) ? count_minus1 : id;
}

extern "C" uint32_t isaac_rto_9be3e0_collectible_entry_ptr(uint32_t base,
                                                           uint32_t index) {
  /* 0x009be50e shl edx,4; 0x009be511 add edx,ecx.  base + index*16, wrap. */
  return base + (index << 4u);
}

extern "C" uint32_t isaac_rto_9be3e0_result_player(uint32_t best_player) {
  /* 0x009be50c / 0x009be524: mov eax,ebx. */
  return best_player;
}

extern "C" uint32_t isaac_rto_9be3e0_store_zero_value(void) {
  /* 0x009be51e xor edx,edx / 0x009be520 mov [edi],edx. */
  return 0u;
}

extern "C" uint32_t isaac_rto_9be3e0_list_begin_ofs(void) {
  return static_cast<uint32_t>(ISAAC_RTO9BE3E0_LIST_BEGIN_OFS);
}
extern "C" uint32_t isaac_rto_9be3e0_list_end_ofs(void) {
  return static_cast<uint32_t>(ISAAC_RTO9BE3E0_LIST_END_OFS);
}
extern "C" uint32_t isaac_rto_9be3e0_list_stride(void) {
  return static_cast<uint32_t>(ISAAC_RTO9BE3E0_LIST_STRIDE);
}
extern "C" uint32_t isaac_rto_9be3e0_slot_flag_ofs(void) {
  return static_cast<uint32_t>(ISAAC_RTO9BE3E0_SLOT_FLAG_OFS);
}
extern "C" uint32_t isaac_rto_9be3e0_collect_begin_ofs(void) {
  return static_cast<uint32_t>(ISAAC_RTO9BE3E0_COLLECT_BEGIN_OFS);
}
extern "C" uint32_t isaac_rto_9be3e0_collect_end_ofs(void) {
  return static_cast<uint32_t>(ISAAC_RTO9BE3E0_COLLECT_END_OFS);
}
extern "C" uint32_t isaac_rto_9be3e0_collect_stride(void) {
  return static_cast<uint32_t>(ISAAC_RTO9BE3E0_COLLECT_STRIDE);
}
extern "C" uint32_t isaac_rto_9be3e0_seed_assert_msg_va(void) {
  return static_cast<uint32_t>(ISAAC_RTO9BE3E0_SEED_ASSERT_MSG_VA);
}
extern "C" uint32_t isaac_rto_9be3e0_oob_assert_msg_va(void) {
  return static_cast<uint32_t>(ISAAC_RTO9BE3E0_OOB_ASSERT_MSG_VA);
}
extern "C" uint32_t isaac_rto_9be3e0_log_level(void) {
  return static_cast<uint32_t>(ISAAC_RTO9BE3E0_LOG_LEVEL);
}
extern "C" uint32_t isaac_rto_9be3e0_assert_trap_va(void) {
  return static_cast<uint32_t>(ISAAC_RTO9BE3E0_ASSERT_TRAP_VA);
}
extern "C" uint32_t isaac_rto_9be3e0_has_collectible_va(void) {
  return static_cast<uint32_t>(ISAAC_RTO9BE3E0_HOST_HAS_COLLECTIBLE_VA);
}
extern "C" uint32_t isaac_rto_9be3e0_host_log_va(void) {
  return static_cast<uint32_t>(ISAAC_RTO9BE3E0_HOST_LOG_VA);
}
extern "C" uint32_t isaac_rto_9be3e0_game_global_va(void) {
  return static_cast<uint32_t>(ISAAC_RTO9BE3E0_GAME_GLOBAL_VA);
}
extern "C" uint32_t isaac_rto_9be3e0_receiver_ofs(void) {
  return static_cast<uint32_t>(ISAAC_RTO9BE3E0_RECEIVER_OFS);
}
extern "C" uint32_t isaac_rto_9be3e0_rng_shift_table_va(void) {
  return static_cast<uint32_t>(ISAAC_RTO9BE3E0_RNG_SHIFT_TABLE_VA);
}
extern "C" uint32_t isaac_rto_9be3e0_rng_shift1(void) {
  return static_cast<uint32_t>(ISAAC_RTO9BE3E0_RNG_SHIFT1);
}
extern "C" uint32_t isaac_rto_9be3e0_rng_shift2(void) {
  return static_cast<uint32_t>(ISAAC_RTO9BE3E0_RNG_SHIFT2);
}
extern "C" uint32_t isaac_rto_9be3e0_rng_shift3(void) {
  return static_cast<uint32_t>(ISAAC_RTO9BE3E0_RNG_SHIFT3);
}
extern "C" uint32_t isaac_rto_9be3e0_best_init_bits(void) {
  return static_cast<uint32_t>(ISAAC_RTO9BE3E0_BEST_INIT_BITS);
}
extern "C" uint32_t isaac_rto_9be3e0_scale_bits(void) {
  return static_cast<uint32_t>(ISAAC_RTO9BE3E0_SCALE_BITS);
}
extern "C" uint32_t isaac_rto_9be3e0_sign_corr_table_va(void) {
  return static_cast<uint32_t>(ISAAC_RTO9BE3E0_SIGN_CORR_TABLE_VA);
}
extern "C" float isaac_rto_9be3e0_best_init_value(void) {
  /* 0x009be3e6 movss xmm0,[0xbaad50]. */
  return -1.0f;
}
extern "C" float isaac_rto_9be3e0_scale_value(void) {
  /* 0x009be491 mulss [0xba9ff0]. */
  return __builtin_bit_cast(float, ISAAC_RTO9BE3E0_SCALE_BITS);
}
extern "C" uint32_t isaac_rto_9be3e0_va(void) {
  return static_cast<uint32_t>(ISAAC_RTO9BE3E0_VA);
}
extern "C" uint32_t isaac_rto_9be3e0_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_RTO9BE3E0_RET_VA);
}
extern "C" uint32_t isaac_rto_9be3e0_first_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_RTO9BE3E0_FIRST_RET_VA);
}
extern "C" uint32_t isaac_rto_9be3e0_int3_va(void) {
  return static_cast<uint32_t>(ISAAC_RTO9BE3E0_INT3_VA);
}
extern "C" uint32_t isaac_rto_9be3e0_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_RTO9BE3E0_BODY_BYTES);
}
extern "C" uint32_t isaac_rto_9be3e0_sites(void) {
  return static_cast<uint32_t>(ISAAC_RTO9BE3E0_SITES);
}
extern "C" uint32_t isaac_rto_9be3e0_next_va(void) {
  return static_cast<uint32_t>(ISAAC_RTO9BE3E0_NEXT_VA);
}

/* ===========================================================================
 * ABI v37 -- 0x009be530, address-stable RCO/RTO-family sibling (no exact
 * ZHL; 7-site rel32 E8 census 0x506e07 / 0x50f3ce / 0x53bb1d / 0x5400f0 /
 * 0x54101a / 0x54ae57 / 0x54bce3; this = g_Game + 0x1baa8; arg2 BY-VALUE
 * seed; arg1 pushed receiver UNUSED; ret 8, single epilogue @ 0x009be62d,
 * int3 trap @ 0x009be5be).  Same walk + xorshift draw as v36 (shifts
 * 3/5/20, scale 0x2f7ffffe, best init -1.0f) with FOUR candidate gates and
 * NO collect/id/out arm at all: the tail is the RTO draw WITHOUT the
 * collect tail.  Every gate checked from THIS instruction stream (v36 tail
 * is v35-shaped doctrine applies to RTO's collect arm; 9be530 has none).
 * =========================================================================== */
static_assert(ISAAC_A9BE530_SCALE_BITS == 0x2f7ffffeu,
              "9be530 draw scale @ 0xba9ff0 is the VERIFIED PE dword 0x2f7ffffe");
static_assert(ISAAC_A9BE530_BEST_INIT_BITS == 0xbf800000u,
              "9be530 best init is -1.0f");
static_assert(ISAAC_A9BE530_RNG_SHIFT1 == 3u &&
                  ISAAC_A9BE530_RNG_SHIFT2 == 5u &&
                  ISAAC_A9BE530_RNG_SHIFT3 == 20u,
              "9be530 xorshift table 0xb1f5d0 = 3 / 5 / 20 (PE-verified)");
static_assert(ISAAC_A9BE530_CHARGE_MIN == 3u,
              "9be530 charge gate is SIGNED [player+0x17e0] >= 3");
static_assert(ISAAC_A9BE530_LIST_STRIDE == 4u,
              "9be530 players vector stride is 4");
static_assert(ISAAC_A9BE530_SITES == 7,
              "9be530 rel32 E8 census = 7, all verified this unit");

extern "C" int32_t isaac_a9be530_list_empty(uint32_t list_begin,
                                            uint32_t list_end) {
  /* 0x009be56b cmp esi,[this+4] / 0x009be56e je 0x9be627.  FULL dword. */
  return (list_begin == list_end) ? 1 : 0;
}

extern "C" int32_t isaac_a9be530_slot_checkable(uint32_t player_field_2c) {
  /* 0x009be582 cmp dword [player+0x2c],0 / 0x009be586 jne skip.  FULL dword. */
  return (player_field_2c == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_a9be530_flag202c_checkable(uint32_t player_field_202c) {
  /* 0x009be58c cmp byte [player+0x202c],0 / 0x009be593 jne skip.  RAW
     uint32_t narrowed to the LOW byte in the body. */
  return ((player_field_202c & 0xffu) == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_a9be530_flag20a9_checkable(uint32_t player_field_20a9) {
  /* 0x009be599 cmp byte [player+0x20a9],0 / 0x009be5a0 jne skip.  RAW
     uint32_t narrowed to the LOW byte in the body. */
  return ((player_field_20a9 & 0xffu) == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_a9be530_charge_ok(uint32_t player_field_17e0) {
  /* 0x009be5a2 cmp dword [player+0x17e0],3 / 0x009be5a9 jl skip.  SIGNED:
     passes iff (int32)[player+0x17e0] >= 3; 0xffffffff FAILS (-1 < 3). */
  return (static_cast<int32_t>(player_field_17e0) >=
          static_cast<int32_t>(ISAAC_A9BE530_CHARGE_MIN))
             ? 1
             : 0;
}

extern "C" int32_t isaac_a9be530_seed_assert_needed(uint32_t seed) {
  /* 0x009be5ab test ebx,ebx / 0x009be5ad jne 0x9be5c4.  FULL dword; seed==0
     (state==0) falls into the a112c0(0x10, 0xb6bf54) assert + int3 trap @
     0x009be5be (the 0x009be5bf reload is dead code).  Runs INSIDE the loop,
     once per gate-passing candidate. */
  return (seed == 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_a9be530_xorshift_state(uint32_t seed,
                                                 uint32_t shift1,
                                                 uint32_t shift2,
                                                 uint32_t shift3) {
  /* 0x009be5c4..0x009be5dd: t1 = s ^ (s >> s1); t2 = t1 ^ (t1 << s2);
     r = t2 ^ (t2 >> s3).  Shift counts are cl = LOW BYTE of the table
     dword, masked to 5 bits by the hardware (shr/shl reg, cl).  Same
     table as RCO/RTO (3/5/20 @ 0xb1f5d0, PE-verified); state advances in
     ebx across candidates and is never written back. */
  const uint32_t s1 = (shift1 & 0xffu) & 0x1fu;
  const uint32_t s2 = (shift2 & 0xffu) & 0x1fu;
  const uint32_t s3 = (shift3 & 0xffu) & 0x1fu;
  const uint32_t t1 = seed ^ (seed >> s1);
  const uint32_t t2 = t1 ^ (t1 << s2);
  return t2 ^ (t2 >> s3);
}

extern "C" double isaac_a9be530_state_as_f64(uint32_t state) {
  /* 0x009be5e7 cvtdq2pd + 0x009be5ef addsd [sign*8 + 0xbacb00] — the
     sign-correction makes this exactly (double)u32 for every state. */
  return static_cast<double>(state);
}

extern "C" float isaac_a9be530_next_float(uint32_t state) {
  /* 0x009be5f8 cvtpd2ps (round-half-even) then 0x009be5fc mulss [0xba9ff0];
     scale dword VERIFIED = 0x2f7ffffe, not the handy 2^-32f spelling. */
  return static_cast<float>(static_cast<double>(state)) *
         __builtin_bit_cast(float, ISAAC_A9BE530_SCALE_BITS);
}

extern "C" int32_t isaac_a9be530_best_update_needed(float candidate,
                                                    float best) {
  /* 0x009be604 comiss candidate,best / 0x009be607 jbe keeps OLD best.
     jbe is taken on unordered AND on candidate <= best (ordered), so the
     update runs iff ordered && candidate > best.  `>` is false when either
     operand is NaN — exactly the jbe-taken (keep-old) case. */
  return (candidate > best) ? 1 : 0;
}

extern "C" uint32_t isaac_a9be530_walk_next(uint32_t iter) {
  /* 0x009be61b add esi,4.  32-bit wrap. */
  return iter + static_cast<uint32_t>(ISAAC_A9BE530_LIST_STRIDE);
}

extern "C" int32_t isaac_a9be530_walk_continue(uint32_t next_iter,
                                               uint32_t list_end) {
  /* 0x009be61e cmp esi,[ecx+4] / 0x009be621 jne 0x9be580.  The bound is
     re-read from [this+4] each iteration (ecx = this reloaded @ 0x009be5df
     on the draw path; [ebp-4] hold otherwise — same value either way).
     FULL dword. */
  return (next_iter != list_end) ? 1 : 0;
}

extern "C" uint32_t isaac_a9be530_result_player(uint32_t best_player) {
  /* 0x009be60c mov eax,edi (new winner) / 0x009be618 mov eax,[ebp-0xc]
     (kept winner).  Winner local init 0 (xor eax,eax @ 0x009be53e). */
  return best_player;
}

extern "C" uint32_t isaac_a9be530_list_begin_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE530_LIST_BEGIN_OFS);
}
extern "C" uint32_t isaac_a9be530_list_end_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE530_LIST_END_OFS);
}
extern "C" uint32_t isaac_a9be530_list_stride(void) {
  return static_cast<uint32_t>(ISAAC_A9BE530_LIST_STRIDE);
}
extern "C" uint32_t isaac_a9be530_slot_flag_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE530_SLOT_FLAG_OFS);
}
extern "C" uint32_t isaac_a9be530_flag202c_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE530_FLAG_202C_OFS);
}
extern "C" uint32_t isaac_a9be530_flag20a9_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE530_FLAG_20A9_OFS);
}
extern "C" uint32_t isaac_a9be530_charge_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE530_CHARGE_OFS);
}
extern "C" uint32_t isaac_a9be530_charge_min(void) {
  return static_cast<uint32_t>(ISAAC_A9BE530_CHARGE_MIN);
}
extern "C" uint32_t isaac_a9be530_seed_assert_msg_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE530_SEED_ASSERT_MSG_VA);
}
extern "C" uint32_t isaac_a9be530_log_level(void) {
  return static_cast<uint32_t>(ISAAC_A9BE530_LOG_LEVEL);
}
extern "C" uint32_t isaac_a9be530_assert_trap_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE530_ASSERT_TRAP_VA);
}
extern "C" uint32_t isaac_a9be530_host_log_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE530_HOST_LOG_VA);
}
extern "C" uint32_t isaac_a9be530_rng_shift_table_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE530_RNG_SHIFT_TABLE_VA);
}
extern "C" uint32_t isaac_a9be530_rng_shift1(void) {
  return static_cast<uint32_t>(ISAAC_A9BE530_RNG_SHIFT1);
}
extern "C" uint32_t isaac_a9be530_rng_shift2(void) {
  return static_cast<uint32_t>(ISAAC_A9BE530_RNG_SHIFT2);
}
extern "C" uint32_t isaac_a9be530_rng_shift3(void) {
  return static_cast<uint32_t>(ISAAC_A9BE530_RNG_SHIFT3);
}
extern "C" uint32_t isaac_a9be530_best_init_bits(void) {
  return static_cast<uint32_t>(ISAAC_A9BE530_BEST_INIT_BITS);
}
extern "C" uint32_t isaac_a9be530_scale_bits(void) {
  return static_cast<uint32_t>(ISAAC_A9BE530_SCALE_BITS);
}
extern "C" uint32_t isaac_a9be530_sign_corr_table_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE530_SIGN_CORR_TABLE_VA);
}
extern "C" float isaac_a9be530_best_init_value(void) {
  /* 0x009be536 movss xmm1,[0xbaad50]. */
  return -1.0f;
}
extern "C" float isaac_a9be530_scale_value(void) {
  /* 0x009be5fc mulss [0xba9ff0]. */
  return __builtin_bit_cast(float, ISAAC_A9BE530_SCALE_BITS);
}
extern "C" uint32_t isaac_a9be530_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE530_VA);
}
extern "C" uint32_t isaac_a9be530_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE530_RET_VA);
}
extern "C" uint32_t isaac_a9be530_first_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE530_FIRST_RET_VA);
}
extern "C" uint32_t isaac_a9be530_int3_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE530_INT3_VA);
}
extern "C" uint32_t isaac_a9be530_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_A9BE530_BODY_BYTES);
}
extern "C" uint32_t isaac_a9be530_sites(void) {
  return static_cast<uint32_t>(ISAAC_A9BE530_SITES);
}
extern "C" uint32_t isaac_a9be530_next_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE530_NEXT_VA);
}

/* ===========================================================================
 * ABI v38 -- 0x009be630, address-stable slot-match sibling (no exact ZHL;
 * 23-site rel32 E8 census, all `add esi,0x1baa8 / push <slot> / mov
 * ecx,esi / call`; this = g_Game + 0x1baa8; arg1 BY-VALUE needle slot;
 * ret 4, TWO epilogues @ 0x009be664 (not-found) / 0x009be66b (found),
 * int3 pad @ 0x009be66e).  PURE linear search — NO xorshift / float /
 * seed assert in this body (v37 draw laws do NOT carry over; every gate
 * re-derived from THIS instruction stream).
 * =========================================================================== */
static_assert(ISAAC_A9BE630_SITES == 23,
              "9be630 rel32 E8 census = 23, all verified this unit");
static_assert(ISAAC_A9BE630_LIST_STRIDE == 4u,
              "9be630 players vector stride is 4");
static_assert(ISAAC_A9BE630_BODY_BYTES == 0x3eu,
              "9be630 body is 0x3e bytes through the int3 pad");

extern "C" int32_t isaac_a9be630_list_empty(uint32_t list_begin,
                                            uint32_t list_end) {
  /* 0x009be639 cmp eax,ecx / 0x009be63b je 0x9be660.  FULL dword; the
     empty path never reads arg1 (esi loaded @ 0x009be63d AFTER the je). */
  return (list_begin == list_end) ? 1 : 0;
}

extern "C" int32_t isaac_a9be630_slot_checkable(uint32_t player_field_2c) {
  /* 0x009be642 cmp dword [player+0x2c],0 / 0x009be646 jne skip.  FULL dword. */
  return (player_field_2c == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_a9be630_flag20a9_checkable(uint32_t player_field_20a9) {
  /* 0x009be648 cmp byte [player+0x20a9],0 / 0x009be64f jne skip.  RAW
     uint32_t narrowed to the LOW byte in the body. */
  return ((player_field_20a9 & 0xffu) == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_a9be630_slot_matches(uint32_t player_slot_value,
                                              uint32_t needle_slot) {
  /* 0x009be651 cmp dword [player+0x13c0],esi / 0x009be657 je found.
     FULL dword equality with the BY-VALUE needle arg. */
  return (player_slot_value == needle_slot) ? 1 : 0;
}

extern "C" uint32_t isaac_a9be630_walk_next(uint32_t iter) {
  /* 0x009be659 add eax,4.  32-bit wrap. */
  return iter + static_cast<uint32_t>(ISAAC_A9BE630_LIST_STRIDE);
}

extern "C" int32_t isaac_a9be630_walk_continue(uint32_t next_iter,
                                               uint32_t list_end) {
  /* 0x009be65c cmp eax,ecx / 0x009be65e jne 0x9be640.  The end was
     captured ONCE into ecx @ 0x009be635 (before the loop) — NOT re-read
     per iteration (differs from v37's `cmp esi,[ecx+4]` re-read).  FULL
     dword. */
  return (next_iter != list_end) ? 1 : 0;
}

extern "C" uint32_t isaac_a9be630_result_notfound(void) {
  /* 0x009be660 xor eax,eax (not-found epilogue @ 0x009be660-0x009be664). */
  return 0u;
}

extern "C" uint32_t isaac_a9be630_result_found(uint32_t player_ptr) {
  /* 0x009be667 mov eax,edx (found epilogue @ 0x009be667-0x009be66b);
     edx held the player ptr loaded @ 0x009be640. */
  return player_ptr;
}

extern "C" uint32_t isaac_a9be630_list_begin_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE630_LIST_BEGIN_OFS);
}
extern "C" uint32_t isaac_a9be630_list_end_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE630_LIST_END_OFS);
}
extern "C" uint32_t isaac_a9be630_list_stride(void) {
  return static_cast<uint32_t>(ISAAC_A9BE630_LIST_STRIDE);
}
extern "C" uint32_t isaac_a9be630_slot_flag_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE630_SLOT_FLAG_OFS);
}
extern "C" uint32_t isaac_a9be630_flag20a9_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE630_FLAG_20A9_OFS);
}
extern "C" uint32_t isaac_a9be630_slot_value_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE630_SLOT_VALUE_OFS);
}
extern "C" uint32_t isaac_a9be630_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE630_VA);
}
extern "C" uint32_t isaac_a9be630_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE630_RET_VA);
}
extern "C" uint32_t isaac_a9be630_first_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE630_FIRST_RET_VA);
}
extern "C" uint32_t isaac_a9be630_int3_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE630_INT3_VA);
}
extern "C" uint32_t isaac_a9be630_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_A9BE630_BODY_BYTES);
}
extern "C" uint32_t isaac_a9be630_sites(void) {
  return static_cast<uint32_t>(ISAAC_A9BE630_SITES);
}
extern "C" uint32_t isaac_a9be630_next_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE630_NEXT_VA);
}

/* ===========================================================================
 * ABI v39 -- 0x009be670, address-stable PURE slot-0x19 predicate (no exact
 * ZHL; 3-site rel32 E8 census 0x6df8ba 0x6e07c4 0x9a44a7; this = g_Game +
 * 0x1baa8; body NEVER reads arg1 -- no ebp frame, ret 4 pops the caller's
 * dummy; ret 4, TWO epilogues @ 0x009be6a3 (TRUE) / 0x009be6a8 (FALSE),
 * int3 pad @ 0x009be6ab).  PURE predicate: return 0 iff a CHECKABLE
 * candidate's slot dword [p+0x13c0] != 0x19 (IMMEDIATE needle); the empty
 * list returns 1 (TRUE arm).  Bound captured ONCE pre-loop (ecx @
 * 0x009be672).  No xorshift/float/seed assert in this body.
 * =========================================================================== */
static_assert(ISAAC_A9BE670_SITES == 3,
              "9be670 rel32 E8 census = 3, all verified this unit");
static_assert(ISAAC_A9BE670_LIST_STRIDE == 4u,
              "9be670 players vector stride is 4");
static_assert(ISAAC_A9BE670_BODY_BYTES == 0x3bu,
              "9be670 body is 0x3b bytes through the int3 pad");
static_assert(ISAAC_A9BE670_SLOT_NEEDLE == 0x19u,
              "9be670 slot needle is the IMMEDIATE 0x19 (not an arg)");

extern "C" int32_t isaac_a9be670_list_empty(uint32_t list_begin,
                                            uint32_t list_end) {
  /* 0x009be675 cmp eax,ecx / 0x009be677 je 0x9be6a1 (TRUE arm).  FULL
     dword; the EMPTY list returns 1 -- the inverse of v38's not-found 0. */
  return (list_begin == list_end) ? 1 : 0;
}

extern "C" int32_t isaac_a9be670_slot_checkable(uint32_t player_field_2c) {
  /* 0x009be682 cmp dword [player+0x2c],0 / 0x009be686 jne skip.  FULL dword. */
  return (player_field_2c == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_a9be670_flag20a9_checkable(uint32_t player_field_20a9) {
  /* 0x009be688 cmp byte [player+0x20a9],0 / 0x009be68f jne skip.  RAW
     uint32_t narrowed to the LOW byte in the body. */
  return ((player_field_20a9 & 0xffu) == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_a9be670_slot_equals_needle(uint32_t player_slot_value) {
  /* 0x009be691 cmp dword [player+0x13c0],0x19 / 0x009be698 jne 0x9be6a6.
     FULL dword == IMMEDIATE 0x19; != 0x19 returns 0, == 0x19 continues
     the walk.  The needle is NOT a stack arg (body never reads arg1). */
  return (player_slot_value == ISAAC_A9BE670_SLOT_NEEDLE) ? 1 : 0;
}

extern "C" uint32_t isaac_a9be670_walk_next(uint32_t iter) {
  /* 0x009be69a add eax,4.  32-bit wrap. */
  return iter + static_cast<uint32_t>(ISAAC_A9BE670_LIST_STRIDE);
}

extern "C" int32_t isaac_a9be670_walk_continue(uint32_t next_iter,
                                               uint32_t list_end) {
  /* 0x009be69d cmp eax,ecx / 0x009be69f jne 0x9be680.  The end was
     captured ONCE into ecx @ 0x009be672 (pre-loop) — NOT re-read per
     iteration.  FULL dword. */
  return (next_iter != list_end) ? 1 : 0;
}

extern "C" uint32_t isaac_a9be670_result_true(void) {
  /* 0x009be6a1 mov al,1 (TRUE arm @ 0x009be6a1..0x009be6a3): empty OR all
     checkable candidates have slot == 0x19. */
  return 1u;
}

extern "C" uint32_t isaac_a9be670_result_false(void) {
  /* 0x009be6a6 xor al,al (FALSE arm @ 0x009be6a6..0x009be6a8): a checkable
     candidate's slot != 0x19. */
  return 0u;
}

extern "C" uint32_t isaac_a9be670_list_begin_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE670_LIST_BEGIN_OFS);
}
extern "C" uint32_t isaac_a9be670_list_end_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE670_LIST_END_OFS);
}
extern "C" uint32_t isaac_a9be670_list_stride(void) {
  return static_cast<uint32_t>(ISAAC_A9BE670_LIST_STRIDE);
}
extern "C" uint32_t isaac_a9be670_slot_flag_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE670_SLOT_FLAG_OFS);
}
extern "C" uint32_t isaac_a9be670_flag20a9_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE670_FLAG_20A9_OFS);
}
extern "C" uint32_t isaac_a9be670_slot_value_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE670_SLOT_VALUE_OFS);
}
extern "C" uint32_t isaac_a9be670_slot_needle(void) {
  return static_cast<uint32_t>(ISAAC_A9BE670_SLOT_NEEDLE);
}
extern "C" uint32_t isaac_a9be670_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE670_VA);
}
extern "C" uint32_t isaac_a9be670_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE670_RET_VA);
}
extern "C" uint32_t isaac_a9be670_first_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE670_FIRST_RET_VA);
}
extern "C" uint32_t isaac_a9be670_int3_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE670_INT3_VA);
}
extern "C" uint32_t isaac_a9be670_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_A9BE670_BODY_BYTES);
}
extern "C" uint32_t isaac_a9be670_sites(void) {
  return static_cast<uint32_t>(ISAAC_A9BE670_SITES);
}
extern "C" uint32_t isaac_a9be670_next_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE670_NEXT_VA);
}

/* ===========================================================================
 * ABI v39 -- 0x009be6b0, address-stable owner/quality player select (no
 * exact ZHL; 41-site rel32 E8 census verified this unit; caller 0x004e7b7d
 * `mov ecx,[0xc71678] / push 0x97 / lea ecx,[ecx+0x1baa8] / call` -> this =
 * g_Game + 0x1baa8, arg1 BY-VALUE needle; ret 4, TWO epilogues @
 * 0x009be73c (early accept) / 0x009be747 (winner), int3 pad @ 0x009be74a).
 * NARROWED: pure walk + path selection + arg values + accept/winner CF
 * AROUND host 0x7cb6e0 (status; thiscall player, needle-by-value) and
 * 0x7706e0 (query; cdecl 0x1b7/0; HUD-family, body stays host residual).
 * Path A (field!=0 == needle && byte2ef0!=0): bl FORCED 1, no status call.
 * Path B (field matches && byte2ef0==0): status, bl = SIGNED(status)>1.
 * Path C (field==0 || != needle):       status, bl = SIGNED(status)>0.
 * accept = bl && LOW byte(query result); winner = first bl-set candidate.
 * Bound RE-READ per iteration (this reloaded from the local [esp+0xc] @
 * 0x009be72b) — matches v37, differs from v38.
 * =========================================================================== */
static_assert(ISAAC_A9BE6B0_SITES == 41,
              "9be6b0 rel32 E8 census = 41, all verified this unit");
static_assert(ISAAC_A9BE6B0_LIST_STRIDE == 4u,
              "9be6b0 players vector stride is 4");
static_assert(ISAAC_A9BE6B0_BODY_BYTES == 0x9au,
              "9be6b0 body is 0x9a bytes through the int3 pad");
static_assert(ISAAC_A9BE6B0_QUERY_ARG1 == 0x1b7u,
              "9be6b0 host 0x7706e0 cdecl arg1 = 0x1b7");
static_assert(ISAAC_A9BE6B0_QUERY_ARG2 == 0u,
              "9be6b0 host 0x7706e0 cdecl arg2 = 0");

extern "C" int32_t isaac_a9be6b0_list_empty(uint32_t list_begin,
                                            uint32_t list_end) {
  /* 0x009be6c4 cmp esi,[eax+4] / 0x009be6c7 je 0x9be73f (epilogue A).
     FULL dword.  The bound is RE-READ each iteration (eax = this
     reloaded @ 0x009be72b), but the entry gate is begin == end. */
  return (list_begin == list_end) ? 1 : 0;
}

extern "C" int32_t isaac_a9be6b0_field_nonzero(uint32_t player_field_2ef8) {
  /* 0x009be6ce test eax,eax / 0x009be6d6 je 0x9be700 (path C).  FULL dword
     [player+0x2ef8] != 0. */
  return (player_field_2ef8 != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_a9be6b0_field_eq_needle(uint32_t player_field_2ef8,
                                                 uint32_t needle) {
  /* 0x009be6d8 cmp eax,edx / 0x009be6da jne 0x9be700 (path C).  FULL dword
     equality with the BY-VALUE needle arg1 ([ebp+8] loaded @ 0x009be6cb). */
  return (player_field_2ef8 == needle) ? 1 : 0;
}

extern "C" int32_t isaac_a9be6b0_flag2ef0_set(uint32_t player_flag_2ef0) {
  /* 0x009be6dc cmp byte [p+0x2ef0],0 / 0x009be6e3 je 0x9be6f5 (path B).
     RAW uint32_t narrowed to the LOW byte (path A iff byte != 0). */
  return ((player_flag_2ef0 & 0xffu) != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_a9be6b0_status_gt1(uint32_t status_result) {
  /* 0x009be6f5..0x9be6fb (path B): status = 0x7cb6e0(player, needle) then
     `cmp eax,1` / 0x009be70a setg bl.  SIGNED: bl = 1 iff (int32)status
     > 1; 0xffffffff (-1) FAILS, 0/1 FAIL, 2 PASSES. */
  return (static_cast<int32_t>(status_result) > 1) ? 1 : 0;
}

extern "C" int32_t isaac_a9be6b0_status_gt0(uint32_t status_result) {
  /* 0x009be700..0x9be706 (path C): status = 0x7cb6e0(player, needle) then
     `test eax,eax` / 0x009be70a setg bl.  SIGNED: bl = 1 iff (int32)status
     > 0; 0 FAILS (non-strict), 0xffffffff (-1) FAILS, 1 PASSES. */
  return (static_cast<int32_t>(status_result) > 0) ? 1 : 0;
}

extern "C" uint32_t isaac_a9be6b0_bl_forced(void) {
  /* 0x009be6ec mov bl,1 (path A) — the accept bit is FORCED 1; the setg
     @ 0x009be70a is skipped (jmp @ 0x009be6f3 to merge_accept). */
  return 1u;
}

extern "C" int32_t isaac_a9be6b0_accept_needed(uint32_t bl,
                                               uint32_t query_result) {
  /* 0x009be719 test bl,bl / 0x009be71b je 0x9be721 (skip store);
     0x009be71d test al,al / 0x009be71f jne 0x9be734 (epilogue B).  Accept
     iff bl != 0 && LOW byte of the host 0x7706e0 result != 0, which
     returns the player immediately.  RAW uint32s. */
  return (bl != 0u && (query_result & 0xffu) != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_a9be6b0_winner_store_needed(uint32_t winner,
                                                     uint32_t bl) {
  /* 0x009be721 test edi,edi / 0x009be723 jne 0x9be72b; 0x009be725 test
     bl,bl / 0x009be727 je 0x9be72b; 0x009be729 mov edi,[esi].  Store iff
     winner==0 && bl!=0 — the FIRST bl-set candidate becomes the fallback
     winner returned by epilogue A. */
  return (winner == 0u && bl != 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_a9be6b0_walk_next(uint32_t iter) {
  /* 0x009be72f add esi,4.  32-bit wrap. */
  return iter + static_cast<uint32_t>(ISAAC_A9BE6B0_LIST_STRIDE);
}

extern "C" int32_t isaac_a9be6b0_walk_continue(uint32_t next_iter,
                                               uint32_t list_end) {
  /* 0x009be6c4 cmp esi,[eax+4] / 0x009be6c7 je 0x9be73f (epilogue A).
     The end is RE-READ from [this+4] each iteration (eax = this
     RELOADED from the local [esp+0xc] @ 0x009be72b) — matches v37,
     DIFFERS from v38's captured bound.  FULL dword. */
  return (next_iter != list_end) ? 1 : 0;
}

extern "C" uint32_t isaac_a9be6b0_result_player(uint32_t player_ptr) {
  /* 0x009be734 mov eax,[esi] (epilogue B @ 0x009be734..0x009be73c):
     early-accept result = player ptr at the current iterator. */
  return player_ptr;
}

extern "C" uint32_t isaac_a9be6b0_result_winner(uint32_t winner) {
  /* 0x009be73f mov eax,edi (epilogue A @ 0x009be73f..0x009be747):
     loop-exhausted result = winner (0 if no winner was stored). */
  return winner;
}

extern "C" uint32_t isaac_a9be6b0_list_begin_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE6B0_LIST_BEGIN_OFS);
}
extern "C" uint32_t isaac_a9be6b0_list_end_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE6B0_LIST_END_OFS);
}
extern "C" uint32_t isaac_a9be6b0_list_stride(void) {
  return static_cast<uint32_t>(ISAAC_A9BE6B0_LIST_STRIDE);
}
extern "C" uint32_t isaac_a9be6b0_field_2ef8_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE6B0_FIELD_2EF8_OFS);
}
extern "C" uint32_t isaac_a9be6b0_flag_2ef0_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE6B0_FLAG_2EF0_OFS);
}
extern "C" uint32_t isaac_a9be6b0_query_arg1(void) {
  return static_cast<uint32_t>(ISAAC_A9BE6B0_QUERY_ARG1);
}
extern "C" uint32_t isaac_a9be6b0_query_arg2(void) {
  return static_cast<uint32_t>(ISAAC_A9BE6B0_QUERY_ARG2);
}
extern "C" uint32_t isaac_a9be6b0_status_call_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE6B0_STATUS_CALL_VA);
}
extern "C" uint32_t isaac_a9be6b0_query_call_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE6B0_QUERY_CALL_VA);
}
extern "C" uint32_t isaac_a9be6b0_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE6B0_VA);
}
extern "C" uint32_t isaac_a9be6b0_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE6B0_RET_VA);
}
extern "C" uint32_t isaac_a9be6b0_first_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE6B0_FIRST_RET_VA);
}
extern "C" uint32_t isaac_a9be6b0_int3_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE6B0_INT3_VA);
}
extern "C" uint32_t isaac_a9be6b0_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_A9BE6B0_BODY_BYTES);
}
extern "C" uint32_t isaac_a9be6b0_sites(void) {
  return static_cast<uint32_t>(ISAAC_A9BE6B0_SITES);
}
extern "C" uint32_t isaac_a9be6b0_next_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE6B0_NEXT_VA);
}

/* ---- ABI v40: 0x009be750 PlayerManager::GetNumCollectibles (exact ZHL
   19 B; NARROWED around host 0x0072fd10 / 0x00770ca0) -------------------- */
extern "C" int32_t isaac_gnc_9be750_twin_flag(uint32_t twin_present,
                                              uint32_t flags_b8) {
  /* 0x009be778 test eax,eax / je 0x9be790; 0x009be77c mov eax,[eax+0xb8];
     0x009be782 and eax,0x80000000; 0x009be787 mov byte [esp+0x13],1;
     0x009be78c or eax,ebx (ebx==0 pre-walk) / jne keeps 1;
     0x009be790 mov byte [esp+0x13],bl.  FULL dword bit31 of [twin+0xb8],
     gated on the twin ptr != 0. */
  return ((twin_present != 0u) &&
          ((flags_b8 & static_cast<uint32_t>(ISAAC_GNC9BE750_TWIN_BIT)) != 0u))
             ? 1
             : 0;
}

extern "C" int32_t isaac_gnc_9be750_list_empty(uint32_t list_begin,
                                               uint32_t list_end) {
  /* 0x009be796 mov esi,[edi]; 0x009be796..0x009be799 cmp esi,[edi+4]
     / je 0x9be7df.  FULL dword begin==end -> skip the walk. */
  return (list_begin == list_end) ? 1 : 0;
}

extern "C" int32_t isaac_gnc_9be750_slot_checkable(uint32_t player_field_2c) {
  /* 0x009be7a2 cmp dword [edi+0x2c],0 / jne 0x9be7d7.  FULL dword. */
  return (player_field_2c == 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_gnc_9be750_count_add(uint32_t acc,
                                               uint32_t host_count) {
  /* 0x009be7b4 / 0x009be7d1: add ebx,eax.  32-bit wrap. */
  return acc + host_count;
}

extern "C" int32_t isaac_gnc_9be750_twin_call_needed(uint32_t flag,
                                                     uint32_t twin_ptr) {
  /* 0x009be7b6 cmp byte [esp+0x13],0 / je 0x9be7d3; 0x009be7bd mov ecx,
     [edi+0x1e6c]; 0x009be7c3 test ecx,ecx / je 0x9be7d3.  flag LOW byte
     != 0 AND twin ptr != 0 (FULL dword). */
  return (((flag & 0xffu) != 0u) && (twin_ptr != 0u)) ? 1 : 0;
}

extern "C" uint32_t isaac_gnc_9be750_walk_next(uint32_t iter) {
  /* 0x009be7d7 add esi,4.  32-bit wrap. */
  return iter + static_cast<uint32_t>(ISAAC_GNC9BE750_LIST_STRIDE);
}

extern "C" int32_t isaac_gnc_9be750_walk_continue(uint32_t next_iter,
                                                  uint32_t list_end) {
  /* 0x009be7d3 mov eax,[esp+0x14] (this re-loaded); 0x009be7da cmp esi,
     [eax+4] / jne 0x9be7a0.  End RE-READ from this each iteration.
     FULL dword. */
  return (next_iter != list_end) ? 1 : 0;
}

extern "C" uint32_t isaac_gnc_9be750_result_sum(uint32_t sum) {
  /* 0x009be7e1 mov eax,ebx -- return the accumulated sum. */
  return sum;
}

extern "C" uint32_t isaac_gnc_9be750_list_begin_ofs(void) {
  return static_cast<uint32_t>(ISAAC_GNC9BE750_LIST_BEGIN_OFS);
}
extern "C" uint32_t isaac_gnc_9be750_list_end_ofs(void) {
  return static_cast<uint32_t>(ISAAC_GNC9BE750_LIST_END_OFS);
}
extern "C" uint32_t isaac_gnc_9be750_list_stride(void) {
  return static_cast<uint32_t>(ISAAC_GNC9BE750_LIST_STRIDE);
}
extern "C" uint32_t isaac_gnc_9be750_slot_flag_ofs(void) {
  return static_cast<uint32_t>(ISAAC_GNC9BE750_SLOT_FLAG_OFS);
}
extern "C" uint32_t isaac_gnc_9be750_twin_ptr_ofs(void) {
  return static_cast<uint32_t>(ISAAC_GNC9BE750_TWIN_PTR_OFS);
}
extern "C" uint32_t isaac_gnc_9be750_twin_flags_ofs(void) {
  return static_cast<uint32_t>(ISAAC_GNC9BE750_TWIN_FLAGS_OFS);
}
extern "C" uint32_t isaac_gnc_9be750_twin_bit(void) {
  return static_cast<uint32_t>(ISAAC_GNC9BE750_TWIN_BIT);
}
extern "C" uint32_t isaac_gnc_9be750_manager_global_va(void) {
  return static_cast<uint32_t>(ISAAC_GNC9BE750_MANAGER_GLOBAL_VA);
}
extern "C" uint32_t isaac_gnc_9be750_game_global_va(void) {
  return static_cast<uint32_t>(ISAAC_GNC9BE750_GAME_GLOBAL_VA);
}
extern "C" uint32_t isaac_gnc_9be750_receiver_ofs(void) {
  return static_cast<uint32_t>(ISAAC_GNC9BE750_RECEIVER_OFS);
}
extern "C" uint32_t isaac_gnc_9be750_twin_container_ofs(void) {
  return static_cast<uint32_t>(ISAAC_GNC9BE750_TWIN_CONTAINER_OFS);
}
extern "C" uint32_t isaac_gnc_9be750_host_twin_get_va(void) {
  return static_cast<uint32_t>(ISAAC_GNC9BE750_HOST_TWIN_GET_VA);
}
extern "C" uint32_t isaac_gnc_9be750_host_count_va(void) {
  return static_cast<uint32_t>(ISAAC_GNC9BE750_HOST_COUNT_VA);
}
extern "C" uint32_t isaac_gnc_9be750_va(void) {
  return static_cast<uint32_t>(ISAAC_GNC9BE750_VA);
}
extern "C" uint32_t isaac_gnc_9be750_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_GNC9BE750_RET_VA);
}
extern "C" uint32_t isaac_gnc_9be750_int3_va(void) {
  return static_cast<uint32_t>(ISAAC_GNC9BE750_INT3_VA);
}
extern "C" uint32_t isaac_gnc_9be750_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_GNC9BE750_BODY_BYTES);
}
extern "C" uint32_t isaac_gnc_9be750_sites(void) {
  return static_cast<uint32_t>(ISAAC_GNC9BE750_SITES);
}
extern "C" uint32_t isaac_gnc_9be750_site_va(void) {
  return static_cast<uint32_t>(ISAAC_GNC9BE750_SITE_VA);
}
extern "C" uint32_t isaac_gnc_9be750_next_va(void) {
  return static_cast<uint32_t>(ISAAC_GNC9BE750_NEXT_VA);
}

/* ---- ABI v41: 0x009be7f0 PlayerManager::HasTemporaryEffect (exact ZHL
   8-B prologue pattern 558bec8b11568b71; PURE, 0 E8 / 0 stores) ---------- */
extern "C" int32_t isaac_hte_9be7f0_list_empty(uint32_t list_begin,
                                              uint32_t list_end) {
  /* 0x009be7fa cmp edx,esi / je 0x9be834.  FULL dword begin==end ->
     NOT-FOUND arm (needle never read; 0 — v38 polarity, NOT v39 9be670). */
  return (list_begin == list_end) ? 1 : 0;
}

extern "C" int32_t isaac_hte_9be7f0_slot_checkable(uint32_t player_field_2c) {
  /* 0x009be803 cmp dword [ecx+0x2c],0 / jne 0x9be82d.  FULL dword. */
  return (player_field_2c == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_hte_9be7f0_flag1519_checkable(uint32_t flag_1519) {
  /* 0x009be809 cmp byte [ecx+0x1519],0 / jne 0x9be82d.  LOW byte (raw arg). */
  return ((flag_1519 & 0xffu) == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_hte_9be7f0_vec_not_empty(uint32_t vec_begin,
                                                  uint32_t vec_end) {
  /* 0x009be81e cmp eax,ecx / je 0x9be82d.  FULL dword begin != end is
     REQUIRED to scan the temp-effect vector. */
  return (vec_begin != vec_end) ? 1 : 0;
}

extern "C" int32_t isaac_hte_9be7f0_entry_hit(uint32_t entry_value,
                                              uint32_t needle) {
  /* 0x009be822 cmp dword [eax],edi / je 0x9be83c.  FULL dword
     [entry] == needle -> FOUND. */
  return (entry_value == needle) ? 1 : 0;
}

extern "C" uint32_t isaac_hte_9be7f0_vec_walk_next(uint32_t iter) {
  /* 0x009be826 add eax,0x10.  32-bit wrap, stride 16. */
  return iter + static_cast<uint32_t>(ISAAC_HTE9BE7F0_VEC_STRIDE);
}

extern "C" int32_t isaac_hte_9be7f0_vec_walk_continue(uint32_t next_iter,
                                                      uint32_t vec_end) {
  /* 0x009be829 cmp eax,ecx / jne 0x9be822.  FULL dword next != vec end;
     end captured per candidate @ 0x009be818. */
  return (next_iter != vec_end) ? 1 : 0;
}

extern "C" uint32_t isaac_hte_9be7f0_walk_next(uint32_t iter) {
  /* 0x009be82d add edx,4.  32-bit wrap. */
  return iter + static_cast<uint32_t>(ISAAC_HTE9BE7F0_LIST_STRIDE);
}

extern "C" int32_t isaac_hte_9be7f0_walk_continue(uint32_t next_iter,
                                                  uint32_t list_end) {
  /* 0x009be830 cmp edx,esi / jne 0x9be801.  FULL dword next != end; END
     CAPTURED ONCE (esi @ 0x009be7f6 — differs from 9be6b0/9be750). */
  return (next_iter != list_end) ? 1 : 0;
}

extern "C" int32_t isaac_hte_9be7f0_result_found(void) {
  /* 0x009be83d mov al,1 -- FOUND epilogue (ret 4 @ 0x009be841). */
  return 1;
}

extern "C" int32_t isaac_hte_9be7f0_result_not_found(void) {
  /* 0x009be835 xor al,al -- NOT-FOUND epilogue (ret 4 @ 0x009be839). */
  return 0;
}

extern "C" uint32_t isaac_hte_9be7f0_list_begin_ofs(void) {
  return static_cast<uint32_t>(ISAAC_HTE9BE7F0_LIST_BEGIN_OFS);
}
extern "C" uint32_t isaac_hte_9be7f0_list_end_ofs(void) {
  return static_cast<uint32_t>(ISAAC_HTE9BE7F0_LIST_END_OFS);
}
extern "C" uint32_t isaac_hte_9be7f0_list_stride(void) {
  return static_cast<uint32_t>(ISAAC_HTE9BE7F0_LIST_STRIDE);
}
extern "C" uint32_t isaac_hte_9be7f0_slot_flag_ofs(void) {
  return static_cast<uint32_t>(ISAAC_HTE9BE7F0_SLOT_FLAG_OFS);
}
extern "C" uint32_t isaac_hte_9be7f0_flag1519_ofs(void) {
  return static_cast<uint32_t>(ISAAC_HTE9BE7F0_FLAG1519_OFS);
}
extern "C" uint32_t isaac_hte_9be7f0_vec_begin_ofs(void) {
  return static_cast<uint32_t>(ISAAC_HTE9BE7F0_VEC_BEGIN_OFS);
}
extern "C" uint32_t isaac_hte_9be7f0_vec_end_ofs(void) {
  return static_cast<uint32_t>(ISAAC_HTE9BE7F0_VEC_END_OFS);
}
extern "C" uint32_t isaac_hte_9be7f0_vec_stride(void) {
  return static_cast<uint32_t>(ISAAC_HTE9BE7F0_VEC_STRIDE);
}
extern "C" uint32_t isaac_hte_9be7f0_va(void) {
  return static_cast<uint32_t>(ISAAC_HTE9BE7F0_VA);
}
extern "C" uint32_t isaac_hte_9be7f0_first_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_HTE9BE7F0_FIRST_RET_VA);
}
extern "C" uint32_t isaac_hte_9be7f0_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_HTE9BE7F0_RET_VA);
}
extern "C" uint32_t isaac_hte_9be7f0_int3_va(void) {
  return static_cast<uint32_t>(ISAAC_HTE9BE7F0_INT3_VA);
}
extern "C" uint32_t isaac_hte_9be7f0_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_HTE9BE7F0_BODY_BYTES);
}
extern "C" uint32_t isaac_hte_9be7f0_sites(void) {
  return static_cast<uint32_t>(ISAAC_HTE9BE7F0_SITES);
}
extern "C" uint32_t isaac_hte_9be7f0_site_va(void) {
  return static_cast<uint32_t>(ISAAC_HTE9BE7F0_SITE_VA);
}
extern "C" uint32_t isaac_hte_9be7f0_site2_va(void) {
  return static_cast<uint32_t>(ISAAC_HTE9BE7F0_SITE2_VA);
}
extern "C" uint32_t isaac_hte_9be7f0_next_va(void) {
  return static_cast<uint32_t>(ISAAC_HTE9BE7F0_NEXT_VA);
}

/* ---- ABI v42: 0x009be850 slot-accumulator gates (address-stable;
   NARROWED — the 2 host calls to 0x930220 stay host) --------------- */
extern "C" int32_t isaac_a9be850_list_count(uint32_t list_end,
                                            uint32_t list_begin) {
  /* 0x009be865 sub eax,edx / 0x009be867 sar eax,2.  SIGNED arithmetic
     shift of the 32-bit-wrapped difference: count = (end-begin)>>2. */
  return static_cast<int32_t>(list_end - list_begin) >> 2;
}

extern "C" int32_t isaac_a9be850_loop_needed(int32_t count) {
  /* 0x009be86a test eax,eax / 0x009be86c je 0x9be979.  FULL dword
     count != 0 -> body runs (early return when the list is empty). */
  return (count != 0) ? 1 : 0;
}

extern "C" int32_t isaac_a9be850_host_gate_needed(uint32_t vec_end,
                                                  uint32_t vec_begin) {
  /* 0x009be88c sub eax,ebx / 0x009be88e and eax,0xfffffffc /
     0x009be891 cmp eax,0x1c0 / 0x009be896 jle 0x9be8cd.  SIGNED: the
     masked delta is compared with jle (signed <=), so the gate fires
     only when ((vec_end - vec_begin) & ~3) as int32 > 0x1c0.  IDENTICAL
     predicate gates both host calls (0x009be88c host1 / 0x009be925
     host2). */
  const uint32_t masked =
      (vec_end - vec_begin) & static_cast<uint32_t>(
          ISAAC_A9BE850_HOST_GATE_MASK);
  return (static_cast<int32_t>(masked) >
          static_cast<int32_t>(ISAAC_A9BE850_HOST_GATE_THRESHOLD)) ? 1 : 0;
}

extern "C" int32_t isaac_a9be850_slot_present(uint32_t slot) {
  /* 0x009be898 mov eax,[vec_begin+0x1c0] / 0x009be89e test eax,eax /
     0x009be8a0 je 0x9be8cd.  FULL dword slot != 0 (both host gates). */
  return (slot != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_a9be850_twin_present(uint32_t twin) {
  /* 0x009be8d0 mov ecx,[player+0x1e6c] / 0x009be8d6 test ecx,ecx /
     0x009be8d8 je 0x9be966.  FULL dword [player+0x1e6c] != 0. */
  return (twin != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_a9be850_flag1519_clear(uint32_t flag_1519) {
  /* 0x009be8de cmp byte [ecx+0x1519],0 / 0x009be8eb jne 0x9be914.  RAW
     uint32, LOW byte == 0 -> marker scan allowed. */
  return ((flag_1519 & 0xffu) == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_a9be850_twin_vec_not_empty(uint32_t vec_begin,
                                                    uint32_t vec_end) {
  /* 0x009be8f9 cmp eax,ecx / 0x009be8fb je 0x9be914.  FULL dword begin
     != end REQUIRED to scan markers (host2 still runs when empty). */
  return (vec_begin != vec_end) ? 1 : 0;
}

extern "C" int32_t isaac_a9be850_marker_hit(uint32_t entry_field0,
                                            uint32_t entry_field4) {
  /* 0x009be902 cmp dword [edx],0 / 0x009be905 jne 0x9be90d /
     0x009be907 cmp dword [edx+4],0x70 / 0x009be90b je 0x9be966.  FULL
     dwords: [entry+0] == 0 && [entry+4] == 0x70 -> marker -> SKIP
     host2 (jump to the loop tail). */
  return (entry_field0 == static_cast<uint32_t>(
                              ISAAC_A9BE850_MARKER_FIELD0_VALUE) &&
          entry_field4 == static_cast<uint32_t>(
                              ISAAC_A9BE850_MARKER_FIELD4_VALUE)) ? 1 : 0;
}

extern "C" uint32_t isaac_a9be850_vec_walk_next(uint32_t iter) {
  /* 0x009be90d add eax,0x10.  32-bit wrap, stride 16. */
  return iter + static_cast<uint32_t>(ISAAC_A9BE850_TWIN_VEC_STRIDE);
}

extern "C" int32_t isaac_a9be850_vec_walk_continue(uint32_t next_iter,
                                                   uint32_t vec_end) {
  /* 0x009be910 cmp eax,ecx / 0x009be912 jne 0x009be900.  FULL dword
     next != twin vec end (end captured per candidate @ 0x009be8f3). */
  return (next_iter != vec_end) ? 1 : 0;
}

extern "C" uint32_t isaac_a9be850_walk_next(uint32_t index) {
  /* 0x009be969 inc esi.  32-bit wrap, index += 1. */
  return index + 1u;
}

extern "C" int32_t isaac_a9be850_walk_continue(uint32_t next_index,
                                               int32_t count) {
  /* 0x009be966..0x009be973: end/begin RE-READ + sar + cmp esi,eax / jb.
     UNSIGNED next_index < count; count RE-DERIVED per iteration. */
  return (static_cast<uint32_t>(next_index) <
          static_cast<uint32_t>(count)) ? 1 : 0;
}

extern "C" uint32_t isaac_a9be850_list_begin_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE850_LIST_BEGIN_OFS);
}
extern "C" uint32_t isaac_a9be850_list_end_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE850_LIST_END_OFS);
}
extern "C" uint32_t isaac_a9be850_list_stride(void) {
  return static_cast<uint32_t>(ISAAC_A9BE850_LIST_STRIDE);
}
extern "C" uint32_t isaac_a9be850_manager_global_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE850_MANAGER_GLOBAL_VA);
}
extern "C" uint32_t isaac_a9be850_vec_a_begin_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE850_VEC_A_BEGIN_OFS);
}
extern "C" uint32_t isaac_a9be850_vec_a_end_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE850_VEC_A_END_OFS);
}
extern "C" uint32_t isaac_a9be850_vec_a_slot_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE850_VEC_A_SLOT_OFS);
}
extern "C" uint32_t isaac_a9be850_host_gate_threshold(void) {
  return static_cast<uint32_t>(ISAAC_A9BE850_HOST_GATE_THRESHOLD);
}
extern "C" uint32_t isaac_a9be850_host_gate_mask(void) {
  return static_cast<uint32_t>(ISAAC_A9BE850_HOST_GATE_MASK);
}
extern "C" uint32_t isaac_a9be850_slot_field_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE850_SLOT_FIELD_OFS);
}
extern "C" uint32_t isaac_a9be850_host_receiver_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE850_HOST_RECEIVER_OFS);
}
extern "C" uint32_t isaac_a9be850_twin_field_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE850_TWIN_FIELD_OFS);
}
extern "C" uint32_t isaac_a9be850_flag1519_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE850_FLAG1519_OFS);
}
extern "C" uint32_t isaac_a9be850_twin_vec_begin_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE850_TWIN_VEC_BEGIN_OFS);
}
extern "C" uint32_t isaac_a9be850_twin_vec_end_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE850_TWIN_VEC_END_OFS);
}
extern "C" uint32_t isaac_a9be850_twin_vec_stride(void) {
  return static_cast<uint32_t>(ISAAC_A9BE850_TWIN_VEC_STRIDE);
}
extern "C" uint32_t isaac_a9be850_marker_field0_value(void) {
  return static_cast<uint32_t>(ISAAC_A9BE850_MARKER_FIELD0_VALUE);
}
extern "C" uint32_t isaac_a9be850_marker_field4_value(void) {
  return static_cast<uint32_t>(ISAAC_A9BE850_MARKER_FIELD4_VALUE);
}
extern "C" uint32_t isaac_a9be850_host_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE850_HOST_VA);
}
extern "C" uint32_t isaac_a9be850_host_arg2(void) {
  return static_cast<uint32_t>(ISAAC_A9BE850_HOST_ARG2);
}
extern "C" uint32_t isaac_a9be850_host_arg3(void) {
  return static_cast<uint32_t>(ISAAC_A9BE850_HOST_ARG3);
}
extern "C" uint32_t isaac_a9be850_game_global_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE850_GAME_GLOBAL_VA);
}
extern "C" uint32_t isaac_a9be850_receiver_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE850_RECEIVER_OFS);
}
extern "C" uint32_t isaac_a9be850_caller_arg1(void) {
  return static_cast<uint32_t>(ISAAC_A9BE850_CALLER_ARG1);
}
extern "C" uint32_t isaac_a9be850_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE850_VA);
}
extern "C" uint32_t isaac_a9be850_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE850_RET_VA);
}
extern "C" uint32_t isaac_a9be850_int3_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE850_INT3_VA);
}
extern "C" uint32_t isaac_a9be850_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_A9BE850_BODY_BYTES);
}
extern "C" uint32_t isaac_a9be850_sites(void) {
  return static_cast<uint32_t>(ISAAC_A9BE850_SITES);
}
extern "C" uint32_t isaac_a9be850_site_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE850_SITE_VA);
}
extern "C" uint32_t isaac_a9be850_next_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE850_NEXT_VA);
}

/* ---------------------------------------------------------------------------
 * ABI v43 -- 0x009be990 PURE bool scan (address-stable; NO exact ZHL).
 * __thiscall ret 0; NO stack args; this = g_Game + 0x1baa8 (both callers).
 * PURE-complete: 0 E8 / 0 indirect / 0 mem-stores.  FOUND al=1 (ret
 * 0x009be9bd) / NOT-FOUND al=0 (ret 0x009be9ba); consumers test only AL.
 * ------------------------------------------------------------------------- */
extern "C" int32_t isaac_a9be990_hit(uint32_t code) {
  /* 0x009be9a8 test edx,edx / 0x009be9aa je advance /
     0x009be9ac cmp edx,3 / 0x009be9af jne FOUND.  FULL dword on
     [player+0x3fc]: code==0 or code==3 -> ADVANCE; else FOUND. */
  return (code != ISAAC_A9BE990_SKIP_CODE_ZERO &&
          code != ISAAC_A9BE990_SKIP_CODE_THREE) ? 1 : 0;
}

extern "C" int32_t isaac_a9be990_list_empty(uint32_t list_begin,
                                            uint32_t list_end) {
  /* 0x009be995 cmp eax,ecx / 0x009be997 je 0x9be9b8.  FULL dword
     begin==end -> NOT-FOUND (loop never runs). */
  return (list_begin == list_end) ? 1 : 0;
}

extern "C" uint32_t isaac_a9be990_walk_next(uint32_t iter) {
  /* 0x009be9b1 add eax,4.  32-bit wrap, stride 4. */
  return iter + static_cast<uint32_t>(ISAAC_A9BE990_LIST_STRIDE);
}

extern "C" int32_t isaac_a9be990_walk_continue(uint32_t next_iter,
                                               uint32_t list_end) {
  /* 0x009be9b4 cmp eax,ecx / 0x009be9b6 jne 0x9be9a0.  FULL dword
     next != end; END CAPTURED ONCE pre-loop (ecx @ 0x009be992), NEVER
     re-read — differs from a9be850 re-derive, matches 9be630/9be670. */
  return (next_iter != list_end) ? 1 : 0;
}

extern "C" uint32_t isaac_a9be990_list_begin_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE990_LIST_BEGIN_OFS);
}
extern "C" uint32_t isaac_a9be990_list_end_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE990_LIST_END_OFS);
}
extern "C" uint32_t isaac_a9be990_list_stride(void) {
  return static_cast<uint32_t>(ISAAC_A9BE990_LIST_STRIDE);
}
extern "C" uint32_t isaac_a9be990_slot_field_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE990_SLOT_FIELD_OFS);
}
extern "C" uint32_t isaac_a9be990_skip_code_zero(void) {
  return static_cast<uint32_t>(ISAAC_A9BE990_SKIP_CODE_ZERO);
}
extern "C" uint32_t isaac_a9be990_skip_code_three(void) {
  return static_cast<uint32_t>(ISAAC_A9BE990_SKIP_CODE_THREE);
}
extern "C" uint32_t isaac_a9be990_manager_global_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE990_MANAGER_GLOBAL_VA);
}
extern "C" uint32_t isaac_a9be990_receiver_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE990_RECEIVER_OFS);
}
extern "C" uint32_t isaac_a9be990_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE990_VA);
}
extern "C" uint32_t isaac_a9be990_first_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE990_FIRST_RET_VA);
}
extern "C" uint32_t isaac_a9be990_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE990_RET_VA);
}
extern "C" uint32_t isaac_a9be990_int3_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE990_INT3_VA);
}
extern "C" uint32_t isaac_a9be990_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_A9BE990_BODY_BYTES);
}
extern "C" uint32_t isaac_a9be990_sites(void) {
  return static_cast<uint32_t>(ISAAC_A9BE990_SITES);
}
extern "C" uint32_t isaac_a9be990_site_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE990_SITE_VA);
}
extern "C" uint32_t isaac_a9be990_site2_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE990_SITE2_VA);
}
extern "C" uint32_t isaac_a9be990_next_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE990_NEXT_VA);
}

/* ---------------------------------------------------------------------------
 * ABI v44 -- 0x009be9c0 PURE bool scan (address-stable, NO exact ZHL).
 * 0 E8 / 0 indirect / 0 mem-stores.  FOUND iff a player with byte
 * [p+0x20a9]==0 AND FULL dword [p+0x184] IN {0,1,2,3} exists in
 * [this+0..this+4) stride 4; begin/end captured ONCE at entry.
 * ------------------------------------------------------------------------- */
extern "C" int32_t isaac_a9be9c0_list_empty(uint32_t list_begin,
                                            uint32_t list_end) {
  /* 0x009be9c5 cmp eax,ecx / 0x009be9c7 je 0x9be9fb.  FULL dword
     begin==end -> NOT-FOUND (loop never runs). */
  return (list_begin == list_end) ? 1 : 0;
}

extern "C" int32_t isaac_a9be9c0_flag20a9_checkable(uint32_t player_flag_20a9) {
  /* 0x009be9d2 cmp byte [edx+0x20a9],0 / 0x009be9d9 jne advance.  RAW
     uint32 LOW byte: flag==0 -> candidate examined; !=0 -> ADVANCE. */
  return ((player_flag_20a9 & 0xffu) == 0) ? 1 : 0;
}

extern "C" int32_t isaac_a9be9c0_field184_found(uint32_t player_field_184) {
  /* 0x009be9e1 test edx,edx / je FOUND; 0x009be9e5 cmp edx,3 / je FOUND;
     0x009be9ea cmp edx,1 / je FOUND; 0x009be9ef cmp edx,2 / je FOUND.
     FULL dword on [player+0x184]: FOUND iff code IN {0,1,2,3} (test
     order 0,3,1,2 irrelevant: every arm je-to-FOUND). */
  return (player_field_184 == ISAAC_A9BE9C0_FOUND_CODE_ZERO ||
          player_field_184 == ISAAC_A9BE9C0_FOUND_CODE_ONE ||
          player_field_184 == ISAAC_A9BE9C0_FOUND_CODE_TWO ||
          player_field_184 == ISAAC_A9BE9C0_FOUND_CODE_THREE) ? 1 : 0;
}

extern "C" uint32_t isaac_a9be9c0_walk_next(uint32_t iter) {
  /* 0x009be9f4 add eax,4.  32-bit wrap, stride 4. */
  return iter + static_cast<uint32_t>(ISAAC_A9BE9C0_LIST_STRIDE);
}

extern "C" int32_t isaac_a9be9c0_walk_continue(uint32_t next_iter,
                                               uint32_t list_end) {
  /* 0x009be9f7 cmp eax,ecx / 0x009be9f9 jne 0x9be9d0.  FULL dword
     next != end; END CAPTURED ONCE pre-loop (ecx @ 0x009be9c2), NEVER
     re-read per iteration. */
  return (next_iter != list_end) ? 1 : 0;
}

extern "C" uint32_t isaac_a9be9c0_list_begin_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE9C0_LIST_BEGIN_OFS);
}
extern "C" uint32_t isaac_a9be9c0_list_end_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE9C0_LIST_END_OFS);
}
extern "C" uint32_t isaac_a9be9c0_list_stride(void) {
  return static_cast<uint32_t>(ISAAC_A9BE9C0_LIST_STRIDE);
}
extern "C" uint32_t isaac_a9be9c0_flag20a9_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE9C0_FLAG20A9_OFS);
}
extern "C" uint32_t isaac_a9be9c0_field184_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE9C0_FIELD184_OFS);
}
extern "C" uint32_t isaac_a9be9c0_found_code_zero(void) {
  return static_cast<uint32_t>(ISAAC_A9BE9C0_FOUND_CODE_ZERO);
}
extern "C" uint32_t isaac_a9be9c0_found_code_one(void) {
  return static_cast<uint32_t>(ISAAC_A9BE9C0_FOUND_CODE_ONE);
}
extern "C" uint32_t isaac_a9be9c0_found_code_two(void) {
  return static_cast<uint32_t>(ISAAC_A9BE9C0_FOUND_CODE_TWO);
}
extern "C" uint32_t isaac_a9be9c0_found_code_three(void) {
  return static_cast<uint32_t>(ISAAC_A9BE9C0_FOUND_CODE_THREE);
}
extern "C" uint32_t isaac_a9be9c0_manager_global_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE9C0_MANAGER_GLOBAL_VA);
}
extern "C" uint32_t isaac_a9be9c0_receiver_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BE9C0_RECEIVER_OFS);
}
extern "C" uint32_t isaac_a9be9c0_receiver_getter_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE9C0_RECEIVER_GETTER_VA);
}
extern "C" uint32_t isaac_a9be9c0_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE9C0_VA);
}
extern "C" uint32_t isaac_a9be9c0_first_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE9C0_FIRST_RET_VA);
}
extern "C" uint32_t isaac_a9be9c0_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE9C0_RET_VA);
}
extern "C" uint32_t isaac_a9be9c0_int3_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE9C0_INT3_VA);
}
extern "C" uint32_t isaac_a9be9c0_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_A9BE9C0_BODY_BYTES);
}
extern "C" uint32_t isaac_a9be9c0_sites(void) {
  return static_cast<uint32_t>(ISAAC_A9BE9C0_SITES);
}
extern "C" uint32_t isaac_a9be9c0_site_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE9C0_SITE_VA);
}
extern "C" uint32_t isaac_a9be9c0_next_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BE9C0_NEXT_VA);
}

/* ---------------------------------------------------------------------------
 * ABI v45 -- 0x009bea40 PURE f32-sum walk (address-stable, NO exact ZHL).
 * 0 E8 / 0 indirect / 0 mem-stores.  sum = +0.0f; per player in
 * [this+0..this+4) stride 4 (begin/end captured ONCE): FULL dword
 * [p+0x2c]==0 AND byte [p+0x20a9]==0 -> sum += f32 [p+0x156c] (addss);
 * empty list -> ret +0.0f.  Returns f32 in xmm0.
 * ------------------------------------------------------------------------- */
extern "C" int32_t isaac_a9bea40_list_empty(uint32_t list_begin,
                                            uint32_t list_end) {
  /* 0x009bea48 cmp eax,ecx / 0x009bea4a je 0x9bea70.  FULL dword
     begin==end -> loop never runs. */
  return (list_begin == list_end) ? 1 : 0;
}

extern "C" int32_t isaac_a9bea40_slot_checkable(uint32_t player_field_2c) {
  /* 0x009bea52 cmp dword [edx+0x2c],0 / 0x009bea56 jne advance.  FULL
     dword: == 0 -> candidate may add. */
  return (player_field_2c == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_a9bea40_flag20a9_checkable(uint32_t player_flag_20a9) {
  /* 0x009bea58 cmp byte [edx+0x20a9],0 / 0x009bea5f jne advance.  RAW
     uint32 LOW byte: flag==0 -> may add; !=0 -> ADVANCE. */
  return ((player_flag_20a9 & 0xffu) == 0) ? 1 : 0;
}

extern "C" float isaac_a9bea40_field156c_add_ss(float sum, float field_156c) {
  /* 0x009bea61 addss xmm0,[edx+0x156c].  f32 + f32 -> f32, round-to-
     nearest-even per add; NaN propagates.  xmm0 stays f32 across the
     loop, so no double rounding. */
  return sum + field_156c;
}

extern "C" uint32_t isaac_a9bea40_walk_next(uint32_t iter) {
  /* 0x009bea69 add eax,4.  32-bit wrap, stride 4. */
  return iter + static_cast<uint32_t>(ISAAC_A9BEA40_LIST_STRIDE);
}

extern "C" int32_t isaac_a9bea40_walk_continue(uint32_t next_iter,
                                               uint32_t list_end) {
  /* 0x009bea6c cmp eax,ecx / 0x009bea6e jne 0x9bea50.  FULL dword
     next != end; END CAPTURED ONCE pre-loop (ecx @ 0x009bea45), NEVER
     re-read per iteration. */
  return (next_iter != list_end) ? 1 : 0;
}

extern "C" uint32_t isaac_a9bea40_list_begin_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BEA40_LIST_BEGIN_OFS);
}
extern "C" uint32_t isaac_a9bea40_list_end_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BEA40_LIST_END_OFS);
}
extern "C" uint32_t isaac_a9bea40_list_stride(void) {
  return static_cast<uint32_t>(ISAAC_A9BEA40_LIST_STRIDE);
}
extern "C" uint32_t isaac_a9bea40_slot_flag_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BEA40_SLOT_FLAG_OFS);
}
extern "C" uint32_t isaac_a9bea40_flag20a9_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BEA40_FLAG20A9_OFS);
}
extern "C" uint32_t isaac_a9bea40_field156c_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BEA40_FIELD156C_OFS);
}
extern "C" uint32_t isaac_a9bea40_manager_global_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BEA40_MANAGER_GLOBAL_VA);
}
extern "C" uint32_t isaac_a9bea40_receiver_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BEA40_RECEIVER_OFS);
}
extern "C" uint32_t isaac_a9bea40_receiver_getter_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BEA40_RECEIVER_GETTER_VA);
}
extern "C" uint32_t isaac_a9bea40_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BEA40_VA);
}
extern "C" uint32_t isaac_a9bea40_first_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BEA40_FIRST_RET_VA);
}
extern "C" uint32_t isaac_a9bea40_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BEA40_RET_VA);
}
extern "C" uint32_t isaac_a9bea40_int3_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BEA40_INT3_VA);
}
extern "C" uint32_t isaac_a9bea40_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_A9BEA40_BODY_BYTES);
}
extern "C" uint32_t isaac_a9bea40_sites(void) {
  return static_cast<uint32_t>(ISAAC_A9BEA40_SITES);
}
extern "C" uint32_t isaac_a9bea40_site0_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BEA40_SITE0_VA);
}
extern "C" uint32_t isaac_a9bea40_site1_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BEA40_SITE1_VA);
}
extern "C" uint32_t isaac_a9bea40_site2_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BEA40_SITE2_VA);
}
extern "C" uint32_t isaac_a9bea40_next_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BEA40_NEXT_VA);
}

/* ---------------------------------------------------------------------------
 * ABI v46 -- 0x009bea80 GetTrinketMultiplier (EXACT ZHL 18 B:
 * `__thiscall int PlayerManager::GetTrinketMultiplier(int TrinketID);`).
 * NARROWED: 2 E8s to host 0x007cb6e0 (HUD-family count resolver, helpers
 * ABI v19; typed host event, body outside this family), 0 indirect, 3
 * mem-stores ALL [esp+N] locals (zero observable stores).  Pure slot-flag
 * gates + walk + 32-bit wrap sum compose the two host status results.
 * Slot flag byte [esp+0x13]: 1 iff SIGNED ((id & 0x7fff) < SAR32(end-
 * begin,2)) && slotArray[id&0x7fff] != 0 && bit31([slot+0xb8]); computed
 * ONCE pre-walk.  Per player FULL dword [p+0x2c]==0 -> host1 0x7cb6e0(p,
 * RAW id), sum += eax; flag LOW byte != 0 && [p+0x1e6c] != 0 -> host2
 * 0x7cb6e0(twin, RAW id), sum += eax.  End RE-READ per iteration (this
 * reloaded from local [esp+0x14]; matches 9be6b0/9be750).  Return sum
 * (SIGNED int32 consumer cvtdq2ps).  NO uint8_t scalar params.
 * ------------------------------------------------------------------------- */
extern "C" uint32_t isaac_gtm_9bea80_id_mask(uint32_t id) {
  /* 0x009beaa3 and edx,0x7fff.  RAW id & 0x7fff (15-bit trinket id). */
  return id & static_cast<uint32_t>(ISAAC_GTM9BEA80_ID_MASK);
}

extern "C" int32_t isaac_gtm_9bea80_list_count(uint32_t slot_end,
                                               uint32_t slot_begin) {
  /* 0x009beaa9 sub eax,esi / 0x009beaaf sar eax,2.  SIGNED arithmetic
     shift of the 32-bit-wrapped difference: count = (end-begin)>>2. */
  return static_cast<int32_t>(slot_end - slot_begin) >> 2;
}

extern "C" int32_t isaac_gtm_9bea80_range_gate(uint32_t id_masked,
                                               uint32_t count) {
  /* 0x009beab3 cmp edx,eax / 0x009beab5 jge 0x9bead3.  SIGNED jge:
     slot lookup runs iff (int32)id_masked < (int32)count. */
  return (static_cast<int32_t>(id_masked) < static_cast<int32_t>(count)) ? 1
                                                                         : 0;
}

extern "C" int32_t isaac_gtm_9bea80_slot_present(uint32_t slot) {
  /* 0x009beaba test eax,eax / 0x009beabc je 0x9bead3.  FULL dword
     slot != 0. */
  return (slot != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_gtm_9bea80_slot_flag(uint32_t flags_b8) {
  /* 0x009beac4 and eax,0x80000000 / 0x009beace or eax,0 /
     0x009bead1 jne keep.  FULL dword bit31([slot+0xb8]) set -> flag 1. */
  return ((flags_b8 & static_cast<uint32_t>(ISAAC_GTM9BEA80_TWIN_FLAG_BIT)) !=
          0u)
             ? 1
             : 0;
}

extern "C" int32_t isaac_gtm_9bea80_list_empty(uint32_t list_begin,
                                               uint32_t list_end) {
  /* 0x009beadc cmp esi,[ebx+4] / 0x009beadf je 0x9beb1f.  FULL dword
     begin==end -> sum stays 0, loop never runs. */
  return (list_begin == list_end) ? 1 : 0;
}

extern "C" int32_t isaac_gtm_9bea80_slot_checkable(uint32_t player_field_2c) {
  /* 0x009beae5 cmp dword [ebx+0x2c],0 / 0x009beae9 jne advance.  FULL
     dword: == 0 -> candidate may call host1. */
  return (player_field_2c == 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_gtm_9bea80_sum_add(uint32_t acc,
                                             uint32_t host_status) {
  /* 0x009beaf3 / 0x009beb0e: add edi,eax.  32-bit wrap. */
  return acc + host_status;
}

extern "C" int32_t isaac_gtm_9bea80_twin_call_needed(uint32_t flag,
                                                     uint32_t twin_ptr) {
  /* 0x009beaf5 cmp byte [esp+0x13],0 / je 0x9beb10; 0x009beafc mov ecx,
     [ebx+0x1e6c]; 0x009beb02 test ecx,ecx / je 0x9beb10.  flag LOW byte
     != 0 AND twin ptr != 0 (FULL dword). */
  return (((flag & 0xffu) != 0u) && (twin_ptr != 0u)) ? 1 : 0;
}

extern "C" uint32_t isaac_gtm_9bea80_walk_next(uint32_t iter) {
  /* 0x009beb17 add esi,4.  32-bit wrap, stride 4. */
  return iter + static_cast<uint32_t>(ISAAC_GTM9BEA80_LIST_STRIDE);
}

extern "C" int32_t isaac_gtm_9bea80_walk_continue(uint32_t next_iter,
                                                  uint32_t list_end) {
  /* 0x009beb1a cmp esi,[eax+4] / 0x009beb1d jne 0x9beae3.  FULL dword
     next != end; END RE-READ per iteration (this reloaded from the local
     save [esp+0x14] @ 0x009beb13) — matches 9be6b0/9be750. */
  return (next_iter != list_end) ? 1 : 0;
}

extern "C" uint32_t isaac_gtm_9bea80_result_sum(uint32_t sum) {
  /* 0x009beb1f mov eax,edi -- return the accumulated sum (SIGNED int32
     consumer: cvtdq2ps @ caller 0x007fb90f). */
  return sum;
}

extern "C" uint32_t isaac_gtm_9bea80_list_begin_ofs(void) {
  return static_cast<uint32_t>(ISAAC_GTM9BEA80_LIST_BEGIN_OFS);
}
extern "C" uint32_t isaac_gtm_9bea80_list_end_ofs(void) {
  return static_cast<uint32_t>(ISAAC_GTM9BEA80_LIST_END_OFS);
}
extern "C" uint32_t isaac_gtm_9bea80_list_stride(void) {
  return static_cast<uint32_t>(ISAAC_GTM9BEA80_LIST_STRIDE);
}
extern "C" uint32_t isaac_gtm_9bea80_slot_flag_ofs(void) {
  return static_cast<uint32_t>(ISAAC_GTM9BEA80_SLOT_FLAG_OFS);
}
extern "C" uint32_t isaac_gtm_9bea80_twin_ptr_ofs(void) {
  return static_cast<uint32_t>(ISAAC_GTM9BEA80_TWIN_PTR_OFS);
}
extern "C" uint32_t isaac_gtm_9bea80_slot_array_begin_ofs(void) {
  return static_cast<uint32_t>(ISAAC_GTM9BEA80_SLOT_ARRAY_BEGIN_OFS);
}
extern "C" uint32_t isaac_gtm_9bea80_slot_array_end_ofs(void) {
  return static_cast<uint32_t>(ISAAC_GTM9BEA80_SLOT_ARRAY_END_OFS);
}
extern "C" uint32_t isaac_gtm_9bea80_mask(void) {
  return static_cast<uint32_t>(ISAAC_GTM9BEA80_ID_MASK);
}
extern "C" uint32_t isaac_gtm_9bea80_twin_flags_ofs(void) {
  return static_cast<uint32_t>(ISAAC_GTM9BEA80_TWIN_FLAGS_OFS);
}
extern "C" uint32_t isaac_gtm_9bea80_twin_flag_bit(void) {
  return static_cast<uint32_t>(ISAAC_GTM9BEA80_TWIN_FLAG_BIT);
}
extern "C" uint32_t isaac_gtm_9bea80_manager_global_va(void) {
  return static_cast<uint32_t>(ISAAC_GTM9BEA80_MANAGER_GLOBAL_VA);
}
extern "C" uint32_t isaac_gtm_9bea80_game_global_va(void) {
  return static_cast<uint32_t>(ISAAC_GTM9BEA80_GAME_GLOBAL_VA);
}
extern "C" uint32_t isaac_gtm_9bea80_receiver_ofs(void) {
  return static_cast<uint32_t>(ISAAC_GTM9BEA80_RECEIVER_OFS);
}
extern "C" uint32_t isaac_gtm_9bea80_host_status_va(void) {
  return static_cast<uint32_t>(ISAAC_GTM9BEA80_HOST_STATUS_VA);
}
extern "C" uint32_t isaac_gtm_9bea80_va(void) {
  return static_cast<uint32_t>(ISAAC_GTM9BEA80_VA);
}
extern "C" uint32_t isaac_gtm_9bea80_first_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_GTM9BEA80_FIRST_RET_VA);
}
extern "C" uint32_t isaac_gtm_9bea80_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_GTM9BEA80_RET_VA);
}
extern "C" uint32_t isaac_gtm_9bea80_int3_va(void) {
  return static_cast<uint32_t>(ISAAC_GTM9BEA80_INT3_VA);
}
extern "C" uint32_t isaac_gtm_9bea80_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_GTM9BEA80_BODY_BYTES);
}
extern "C" uint32_t isaac_gtm_9bea80_sites(void) {
  return static_cast<uint32_t>(ISAAC_GTM9BEA80_SITES);
}
extern "C" uint32_t isaac_gtm_9bea80_next_va(void) {
  return static_cast<uint32_t>(ISAAC_GTM9BEA80_NEXT_VA);
}

/* ---------------------------------------------------------------------------
 * ABI v47: 0x009beb30 all/any instant-death-curse walk laws.  NARROWED:
 * pure walk + byte/full-word gates + 32-bit wrap charge arithmetic +
 * AND/OR byte combine around ONE typed host event 0x007db6b0
 * (Entity_Player::HasInstantDeathCurse, exact ZHL 14 B).  No uint8_t
 * scalar params — byte gates take uint32_t and re-narrow with &0xff in
 * the body (Wasm ABI does not narrow i32 args; WIDE drives legal).
 * ------------------------------------------------------------------------- */
extern "C" uint32_t isaac_a9beb30_arg_byte(uint32_t arg) {
  /* 0x009beb34 mov bh,byte [ebp+8].  RAW arg & 0xff (LOW byte only). */
  return arg & 0xffu;
}

extern "C" int32_t isaac_a9beb30_mode_and(uint32_t arg) {
  /* 0x009beb74 test bh,bh / 0x009beb76 je OR-path.  LOW byte != 0. */
  return ((arg & 0xffu) != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_a9beb30_list_empty(uint32_t list_begin,
                                            uint32_t list_end) {
  /* 0x009beb40 cmp esi,edi / 0x009beb42 je ret.  FULL dword begin==end
     -> ret bl (= arg&0xff ECHO, NOT 0/1). */
  return (list_begin == list_end) ? 1 : 0;
}

extern "C" int32_t isaac_a9beb30_slot_checkable(uint32_t player_field_2c) {
  /* 0x009beb46 cmp dword [ecx+0x2c],0 / 0x009beb4a jne advance.  FULL
     dword [p+0x2c]==0 -> candidate. */
  return (player_field_2c == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_a9beb30_flag20a9_checkable(uint32_t player_field_20a9) {
  /* 0x009beb4c cmp byte [ecx+0x20a9],0 / 0x009beb53 jne advance.  RAW
     uint32, LOW byte == 0 -> candidate. */
  return ((player_field_20a9 & 0xffu) == 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_a9beb30_charge_sum(uint32_t field_134c,
                                             uint32_t field_1344) {
  /* 0x009beb55 mov eax,[ecx+0x134c] / 0x009beb5b add eax,[ecx+0x1344].
     32-bit wrap. */
  return field_134c + field_1344;
}

extern "C" int32_t isaac_a9beb30_charge_gate(uint32_t charge,
                                             uint32_t charge_max) {
  /* 0x009beb61 cmp eax,[ecx+0x1340] / 0x009beb67 jge 0x9beb72.  SIGNED
     (int32)a >= (int32)[p+0x1340] -> al=1 WITHOUT the host. */
  return (static_cast<int32_t>(charge) >= static_cast<int32_t>(charge_max))
             ? 1
             : 0;
}

extern "C" int32_t isaac_a9beb30_host_match(uint32_t host_al) {
  /* 0x009beb6e test al,al / 0x009beb70 je 0x9beb74 / 0x009beb72 mov
     al,1.  (host_al & 0xff) != 0 ? 1 : 0. */
  return ((host_al & 0xffu) != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_a9beb30_combine(uint32_t mode, uint32_t bl,
                                         uint32_t al) {
  /* 0x009beb74..0x009beb8c.  mode = bh (arg LOW byte).  mode != 0 ->
     AND bl = (bl != 0 && al != 0) ? 1 : 0 (all candidates must match;
     once 0 stays 0).  mode == 0 -> OR bl = (bl != 0 || al != 0) ? 1 :
     0 (any candidate matches; once 1 stays 1).  bl/al LOW bytes. */
  const uint32_t m = mode & 0xffu;
  const uint32_t b = bl & 0xffu;
  const uint32_t a = al & 0xffu;
  if (m != 0u) {
    return ((b != 0u) && (a != 0u)) ? 1 : 0;
  }
  return ((b != 0u) || (a != 0u)) ? 1 : 0;
}

extern "C" uint32_t isaac_a9beb30_walk_next(uint32_t iter) {
  /* 0x009beb8e add esi,4.  32-bit wrap, stride 4. */
  return iter + static_cast<uint32_t>(ISAAC_A9BEB30_LIST_STRIDE);
}

extern "C" int32_t isaac_a9beb30_walk_continue(uint32_t next_iter,
                                               uint32_t list_end) {
  /* 0x009beb91 cmp esi,edi / 0x009beb93 jne 0x9beb44.  FULL dword next
     != end; END CAPTURED ONCE at entry (edi) — matches a9bea40/9be9c0/
     9be990, DIFFERS from 9bea80/9be6b0/9be750 re-read style. */
  return (next_iter != list_end) ? 1 : 0;
}

extern "C" uint32_t isaac_a9beb30_result_byte(uint32_t bl) {
  /* 0x009beb97 mov al,bl -- byte result (0/1, or arg&0xff echo when no
     candidate was processed). */
  return bl & 0xffu;
}

extern "C" uint32_t isaac_a9beb30_list_begin_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BEB30_LIST_BEGIN_OFS);
}
extern "C" uint32_t isaac_a9beb30_list_end_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BEB30_LIST_END_OFS);
}
extern "C" uint32_t isaac_a9beb30_list_stride(void) {
  return static_cast<uint32_t>(ISAAC_A9BEB30_LIST_STRIDE);
}
extern "C" uint32_t isaac_a9beb30_slot_flag_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BEB30_SLOT_FLAG_OFS);
}
extern "C" uint32_t isaac_a9beb30_flag20a9_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BEB30_FLAG20A9_OFS);
}
extern "C" uint32_t isaac_a9beb30_charge_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BEB30_CHARGE_OFS);
}
extern "C" uint32_t isaac_a9beb30_charge_addend_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BEB30_CHARGE_ADDEND_OFS);
}
extern "C" uint32_t isaac_a9beb30_charge_max_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BEB30_CHARGE_MAX_OFS);
}
extern "C" uint32_t isaac_a9beb30_manager_global_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BEB30_MANAGER_GLOBAL_VA);
}
extern "C" uint32_t isaac_a9beb30_receiver_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BEB30_RECEIVER_OFS);
}
extern "C" uint32_t isaac_a9beb30_host_curse_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BEB30_HOST_CURSE_VA);
}
extern "C" uint32_t isaac_a9beb30_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BEB30_VA);
}
extern "C" uint32_t isaac_a9beb30_first_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BEB30_FIRST_RET_VA);
}
extern "C" uint32_t isaac_a9beb30_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BEB30_RET_VA);
}
extern "C" uint32_t isaac_a9beb30_int3_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BEB30_INT3_VA);
}
extern "C" uint32_t isaac_a9beb30_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_A9BEB30_BODY_BYTES);
}
extern "C" uint32_t isaac_a9beb30_sites(void) {
  return static_cast<uint32_t>(ISAAC_A9BEB30_SITES);
}
extern "C" uint32_t isaac_a9beb30_site0_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BEB30_SITE0_VA);
}
extern "C" uint32_t isaac_a9beb30_site1_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BEB30_SITE1_VA);
}
extern "C" uint32_t isaac_a9beb30_site2_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BEB30_SITE2_VA);
}
extern "C" uint32_t isaac_a9beb30_next_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BEB30_NEXT_VA);
}

/* ---------------------------------------------------------------------------
 * ABI v48: 0x009beba0 avg-player-position walk laws.  NARROWED (NOT
 * PURE-removed): pure walk + slot/watch/flag20a9 gates + gobj scan + f32
 * accumulate/average math; the 2 INDIRECT host predicates (vtable slot
 * [[gitem+0x370]+0x14], byte result) and the 2 E8 assert calls 0x00a112c0
 * stay typed host events; the observable stores (*out float2 + cache
 * 0xc9436c/0xc94370 + cacheTs 0xc5c4d4) are POST events — the laws
 * compute the VALUES, the slice applies the stores.  arg1 = uint32 out
 * ptr, arg2 = uint32 mode (LOW byte gate); __thiscall ret 8.  No uint8_t
 * scalar params — byte gates take uint32_t and re-narrow with &0xff in
 * the body (Wasm ABI does not narrow i32 args; WIDE drives legal).
 * ------------------------------------------------------------------------- */
extern "C" int32_t isaac_a9beba0_mode_fast(uint32_t arg) {
  /* 0x009beba6 cmp byte [ebp+0xc],0 / 0x009bebb2 je slow.  LOW byte
     != 0 -> fast path (cache eligible). */
  return ((arg & 0xffu) != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_a9beba0_cache_fresh(uint32_t gobj_ts,
                                             uint32_t cache_ts) {
  /* 0x009bebbf cmp eax,[0xc5c4d4] / 0x009bebc5 jne slow.  FULL dword
     ts == cacheTs -> use cached float2. */
  return (gobj_ts == cache_ts) ? 1 : 0;
}

extern "C" int32_t isaac_a9beba0_list_count(uint32_t list_begin,
                                            uint32_t list_end) {
  /* 0x009bec12..14 (also 0x009bece8, 0x009bed07..09, 0x009bee22..24):
     sub eax,[esi] / sar eax,2.  SIGNED SAR32(end-begin,2). */
  return static_cast<int32_t>(list_end - list_begin) >> 2;
}

extern "C" int32_t isaac_a9beba0_idx_in_range(uint32_t idx, uint32_t count) {
  /* 0x009bec53..55: cmp ebx,ecx / jae guard.  FULL dword idx < count. */
  return (idx < count) ? 1 : 0;
}

extern "C" int32_t isaac_a9beba0_slot_eligible(uint32_t player_field_2c) {
  /* 0x009bec5c..60: cmp dword [edi+0x2c],0 / jne advance.  FULL dword
     [p+0x2c]==0 -> candidate eligible. */
  return (player_field_2c == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_a9beba0_watch_gate(uint32_t player_field_13c0) {
  /* 0x009bec62..69: cmp dword [edi+0x13c0],0x23 / jne scan.  FULL dword
     != 0x23 -> candidate passes the watch gate. */
  return (player_field_13c0 != static_cast<uint32_t>(ISAAC_A9BEBA0_WATCH_VALUE))
             ? 1
             : 0;
}

extern "C" int32_t isaac_a9beba0_flag20a9_gate(uint32_t player_field_20a9) {
  /* 0x009bec6b..72: cmp byte [edi+0x20a9],0 / je advance.  LOW byte
     [p+0x20a9] != 0 -> candidate passes. */
  return ((player_field_20a9 & 0xffu) != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_a9beba0_player_candidate(uint32_t field_2c,
                                                  uint32_t field_13c0,
                                                  uint32_t field_20a9) {
  /* composed eligibility: [p+0x2c]==0 && ([p+0x13c0]!=0x23 ||
     byte[p+0x20a9]!=0) -> gobj scan + accumulate allowed. */
  if (field_2c != 0u) {
    return 0;
  }
  if (field_13c0 == static_cast<uint32_t>(ISAAC_A9BEBA0_WATCH_VALUE) &&
      (field_20a9 & 0xffu) == 0u) {
    return 0;
  }
  return 1;
}

extern "C" int32_t isaac_a9beba0_lookup_match(uint32_t item_tag_c,
                                              uint32_t want) {
  /* 0x009beca2 / 0x009bed42: cmp [item+0xc],want / je found.  FULL dword
     [gitem+0xc] == want -> scan hit. */
  return (item_tag_c == want) ? 1 : 0;
}

extern "C" int32_t isaac_a9beba0_scan_empty(uint32_t list_begin,
                                            uint32_t list_end) {
  /* 0x009bec85..87 / 0x009bed27..29: cmp ecx,edx / je accumulate.  FULL
     dword gobj begin==end -> accumulate WITHOUT predicate. */
  return (list_begin == list_end) ? 1 : 0;
}

extern "C" int32_t isaac_a9beba0_scan_continue(uint32_t index,
                                               uint32_t count) {
  /* 0x009becaf..b1 / 0x009bed4f..51: cmp eax,edx / jb loop.  FULL dword
     index < count -> keep scanning. */
  return (index < count) ? 1 : 0;
}

extern "C" int32_t isaac_a9beba0_accum_gate(uint32_t found,
                                            uint32_t pred_ok) {
  /* found && !pred -> skip; else accumulate.  found/pred FULL dword
     nonzero = set (PE je/jne CF facts). */
  if (found != 0u && pred_ok == 0u) {
    return 0;
  }
  return 1;
}

extern "C" int32_t isaac_a9beba0_pred_match(uint32_t host_al) {
  /* 0x009bedd5 / 0x009bee00: test al,al.  (host_al & 0xff) != 0 -> pred
     ok (2 INDIRECT host predicates, same vtable slot, byte result). */
  return ((host_al & 0xffu) != 0u) ? 1 : 0;
}

extern "C" float isaac_a9beba0_accum_x(float sum_x, float pos_x) {
  /* 0x009becbe / 0x009bed61: addss xmm2,[elem+0x33c].  f32 x accum. */
  return sum_x + pos_x;
}

extern "C" float isaac_a9beba0_accum_y(float sum_y, float pos_y) {
  /* 0x009becb6 / 0x009bed59: addss xmm1,[elem+0x340].  f32 y accum. */
  return sum_y + pos_y;
}

extern "C" uint32_t isaac_a9beba0_count_inc(uint32_t count) {
  /* 0x009becc6 / 0x009bed69: inc dword [ebp-8].  count + 1 (32-bit wrap). */
  return count + 1u;
}

extern "C" int32_t isaac_a9beba0_has_avg(uint32_t count) {
  /* 0x009bed9f..a1: test edx,edx / jle fallback.  SIGNED count > 0 ->
     use average; else fallback to first player pos. */
  return (static_cast<int32_t>(count) > 0) ? 1 : 0;
}

extern "C" float isaac_a9beba0_avg_x(float sum_x, float count) {
  /* 0x009bedae: divss xmm2,(float)count.  f32 x average. */
  return sum_x / count;
}

extern "C" float isaac_a9beba0_avg_y(float sum_y, float count) {
  /* 0x009bedaa: divss xmm1,(float)count.  f32 y average. */
  return sum_y / count;
}

extern "C" float isaac_a9beba0_fallback_x(float pos_x) {
  /* 0x009bee42: movss xmm2,[player0+0x33c].  f32 fallback x. */
  return pos_x;
}

extern "C" float isaac_a9beba0_fallback_y(float pos_y) {
  /* 0x009bee4a: movss xmm1,[player0+0x340].  f32 fallback y. */
  return pos_y;
}

extern "C" int32_t isaac_a9beba0_assert_needed(uint32_t count) {
  /* 0x009bec2c..2e / 0x009bee27..29: test eax,eax / jne ok.  FULL dword
     count==0 -> HOST assert 0x00a112c0 ("Gamestate corrupted..."). */
  return (count == 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_a9beba0_list_begin_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BEBA0_LIST_BEGIN_OFS);
}
extern "C" uint32_t isaac_a9beba0_list_end_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BEBA0_LIST_END_OFS);
}
extern "C" uint32_t isaac_a9beba0_list_stride(void) {
  return static_cast<uint32_t>(ISAAC_A9BEBA0_LIST_STRIDE);
}
extern "C" uint32_t isaac_a9beba0_second_list_begin_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BEBA0_SECOND_LIST_BEGIN_OFS);
}
extern "C" uint32_t isaac_a9beba0_second_list_end_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BEBA0_SECOND_LIST_END_OFS);
}
extern "C" uint32_t isaac_a9beba0_slot_flag_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BEBA0_SLOT_FLAG_OFS);
}
extern "C" uint32_t isaac_a9beba0_watch_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BEBA0_WATCH_OFS);
}
extern "C" uint32_t isaac_a9beba0_watch_value(void) {
  return static_cast<uint32_t>(ISAAC_A9BEBA0_WATCH_VALUE);
}
extern "C" uint32_t isaac_a9beba0_flag20a9_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BEBA0_FLAG20A9_OFS);
}
extern "C" uint32_t isaac_a9beba0_lookup_key_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BEBA0_LOOKUP_KEY_OFS);
}
extern "C" uint32_t isaac_a9beba0_lookup_tag_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BEBA0_LOOKUP_TAG_OFS);
}
extern "C" uint32_t isaac_a9beba0_pos_x_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BEBA0_POS_X_OFS);
}
extern "C" uint32_t isaac_a9beba0_pos_y_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BEBA0_POS_Y_OFS);
}
extern "C" uint32_t isaac_a9beba0_pred_obj_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BEBA0_PRED_OBJ_OFS);
}
extern "C" uint32_t isaac_a9beba0_pred_slot_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BEBA0_PRED_SLOT_OFS);
}
extern "C" uint32_t isaac_a9beba0_gobj_ts_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BEBA0_GOBJ_TS_OFS);
}
extern "C" uint32_t isaac_a9beba0_gobj_list_begin_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BEBA0_GOBJ_LIST_BEGIN_OFS);
}
extern "C" uint32_t isaac_a9beba0_gobj_list_end_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BEBA0_GOBJ_LIST_END_OFS);
}
extern "C" uint32_t isaac_a9beba0_cache_ts_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BEBA0_CACHE_TS_VA);
}
extern "C" uint32_t isaac_a9beba0_cache_x_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BEBA0_CACHE_X_VA);
}
extern "C" uint32_t isaac_a9beba0_cache_y_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BEBA0_CACHE_Y_VA);
}
extern "C" uint32_t isaac_a9beba0_gobj_global_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BEBA0_GOBJ_GLOBAL_VA);
}
extern "C" uint32_t isaac_a9beba0_manager_global_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BEBA0_MANAGER_GLOBAL_VA);
}
extern "C" uint32_t isaac_a9beba0_receiver_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BEBA0_RECEIVER_OFS);
}
extern "C" uint32_t isaac_a9beba0_assert_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BEBA0_ASSERT_VA);
}
extern "C" uint32_t isaac_a9beba0_assert_msg_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BEBA0_ASSERT_MSG_VA);
}
extern "C" uint32_t isaac_a9beba0_assert_code(void) {
  return static_cast<uint32_t>(ISAAC_A9BEBA0_ASSERT_CODE);
}
extern "C" uint32_t isaac_a9beba0_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BEBA0_VA);
}
extern "C" uint32_t isaac_a9beba0_first_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BEBA0_FIRST_RET_VA);
}
extern "C" uint32_t isaac_a9beba0_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BEBA0_RET_VA);
}
extern "C" uint32_t isaac_a9beba0_int3_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BEBA0_INT3_VA);
}
extern "C" uint32_t isaac_a9beba0_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_A9BEBA0_BODY_BYTES);
}
extern "C" uint32_t isaac_a9beba0_sites(void) {
  return static_cast<uint32_t>(ISAAC_A9BEBA0_SITES);
}
extern "C" uint32_t isaac_a9beba0_site0_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BEBA0_SITE0_VA);
}
extern "C" uint32_t isaac_a9beba0_site1_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BEBA0_SITE1_VA);
}
extern "C" uint32_t isaac_a9beba0_site2_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BEBA0_SITE2_VA);
}
extern "C" uint32_t isaac_a9beba0_site3_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BEBA0_SITE3_VA);
}
extern "C" uint32_t isaac_a9beba0_site4_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BEBA0_SITE4_VA);
}
extern "C" uint32_t isaac_a9beba0_site5_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BEBA0_SITE5_VA);
}
extern "C" uint32_t isaac_a9beba0_site6_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BEBA0_SITE6_VA);
}
extern "C" uint32_t isaac_a9beba0_site7_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BEBA0_SITE7_VA);
}
extern "C" uint32_t isaac_a9beba0_site8_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BEBA0_SITE8_VA);
}
extern "C" uint32_t isaac_a9beba0_next_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BEBA0_NEXT_VA);
}

/* =========================================================================
 * ABI v49: 0x009bfa70 PURE bool-walk counter (PURE: 0 E8, 0 indirect,
 * 0 observable stores — the single [ebp-4] store is a local save).
 * 4-site rel32 census; this = g_Game + 0x1baa8; ret plain.
 * ------------------------------------------------------------------------- */
extern "C" int32_t isaac_a9bfa70_list_count(uint32_t list_begin,
                                            uint32_t list_end) {
  /* 0x009bfa82: sar ebx,2.  SIGNED SAR32(end-begin,2); begin/end
     captured once at entry (begin re-read from the local each
     iteration — value-identical). */
  return static_cast<int32_t>(list_end - list_begin) >> 2;
}

extern "C" int32_t isaac_a9bfa70_idx_continue(uint32_t idx, uint32_t count) {
  /* 0x009bfad1..d3: cmp ecx,ebx / jb loop.  FULL dword idx < count. */
  return (idx < count) ? 1 : 0;
}

extern "C" int32_t isaac_a9bfa70_slot_free(uint32_t player_field_2c) {
  /* 0x009bfa93..97: cmp dword [eax+0x2c],0 / jne skip.  FULL dword
     [p+0x2c]==0 -> slot free. */
  return (player_field_2c == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_a9bfa70_state_idle(uint32_t player_field_3bc) {
  /* 0x009bfa99..a0: cmp dword [eax+0x3bc],0 / jne skip.  FULL dword
     [p+0x3bc]==0 -> state idle. */
  return (player_field_3bc == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_a9bfa70_link_null(uint32_t link) {
  /* 0x009bfaa2..aa: mov edx,[eax+0x1e68] / test edx,edx / je
     flagcheck.  FULL dword link==0 -> flag check (count-eligible). */
  return (link == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_a9bfa70_link_index_neg1(uint32_t link_index) {
  /* 0x009bfaac..b5: mov edi,[edx+0x161c] / cmp edi,-1 / je flagcheck.
     FULL dword linkIdx == 0xffffffff -> flag check. */
  return (link_index == 0xffffffffu) ? 1 : 0;
}

extern "C" int32_t isaac_a9bfa70_index_ge(uint32_t link_index,
                                          uint32_t own_index) {
  /* 0x009bfab7..bd: cmp edi,[eax+0x161c] / jge flagcheck.  SIGNED
     int32 linkIdx >= ownIdx -> flag check (jge). */
  return (static_cast<int32_t>(link_index) >=
          static_cast<int32_t>(own_index))
             ? 1
             : 0;
}

extern "C" int32_t isaac_a9bfa70_link_is_self(uint32_t link,
                                              uint32_t player) {
  /* 0x009bfabf..c1: cmp edx,eax / jne skip.  FULL dword link ==
     player ptr -> flag check. */
  return (link == player) ? 1 : 0;
}

extern "C" int32_t isaac_a9bfa70_flag20a9_set(uint32_t player_field_20a9) {
  /* 0x009bfac3..ca: cmp byte [eax+0x20a9],0 / je skip.  LOW byte
     [p+0x20a9] != 0 -> counted. */
  return ((player_field_20a9 & 0xffu) != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_a9bfa70_count_gate(uint32_t slot_free,
                                            uint32_t state_idle,
                                            uint32_t link_null,
                                            uint32_t link_index_neg1,
                                            uint32_t index_ge,
                                            uint32_t link_is_self,
                                            uint32_t flag20a9_set) {
  /* composed `inc esi` gate (0x009bfacc): slot_free && state_idle &&
     (link_null || link_index_neg1 || index_ge || link_is_self) &&
     flag20a9_set.  Each param is the corresponding LAW VALUE (0/1). */
  if (slot_free == 0u || state_idle == 0u) {
    return 0;
  }
  if (link_null == 0u && link_index_neg1 == 0u && index_ge == 0u &&
      link_is_self == 0u) {
    return 0;
  }
  if (flag20a9_set == 0u) {
    return 0;
  }
  return 1;
}

extern "C" uint32_t isaac_a9bfa70_count_result(uint32_t res, uint32_t gate) {
  /* 0x009bfacc: inc esi.  res + (gate ? 1 : 0), 32-bit wrap. */
  return res + ((gate != 0u) ? 1u : 0u);
}

extern "C" uint32_t isaac_a9bfa70_list_begin_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BFA70_LIST_BEGIN_OFS);
}
extern "C" uint32_t isaac_a9bfa70_list_end_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BFA70_LIST_END_OFS);
}
extern "C" uint32_t isaac_a9bfa70_list_stride(void) {
  return static_cast<uint32_t>(ISAAC_A9BFA70_LIST_STRIDE);
}
extern "C" uint32_t isaac_a9bfa70_slot_flag_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BFA70_SLOT_FLAG_OFS);
}
extern "C" uint32_t isaac_a9bfa70_state_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BFA70_STATE_OFS);
}
extern "C" uint32_t isaac_a9bfa70_link_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BFA70_LINK_OFS);
}
extern "C" uint32_t isaac_a9bfa70_index_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BFA70_INDEX_OFS);
}
extern "C" uint32_t isaac_a9bfa70_flag20a9_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BFA70_FLAG20A9_OFS);
}
extern "C" uint32_t isaac_a9bfa70_manager_global_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BFA70_MANAGER_GLOBAL_VA);
}
extern "C" uint32_t isaac_a9bfa70_receiver_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9BFA70_RECEIVER_OFS);
}
extern "C" uint32_t isaac_a9bfa70_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BFA70_VA);
}
extern "C" uint32_t isaac_a9bfa70_first_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BFA70_FIRST_RET_VA);
}
extern "C" uint32_t isaac_a9bfa70_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BFA70_RET_VA);
}
extern "C" uint32_t isaac_a9bfa70_int3_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BFA70_INT3_VA);
}
extern "C" uint32_t isaac_a9bfa70_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_A9BFA70_BODY_BYTES);
}
extern "C" uint32_t isaac_a9bfa70_sites(void) {
  return static_cast<uint32_t>(ISAAC_A9BFA70_SITES);
}
extern "C" uint32_t isaac_a9bfa70_site0_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BFA70_SITE0_VA);
}
extern "C" uint32_t isaac_a9bfa70_site1_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BFA70_SITE1_VA);
}
extern "C" uint32_t isaac_a9bfa70_site2_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BFA70_SITE2_VA);
}
extern "C" uint32_t isaac_a9bfa70_site3_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BFA70_SITE3_VA);
}
extern "C" uint32_t isaac_a9bfa70_next_va(void) {
  return static_cast<uint32_t>(ISAAC_A9BFA70_NEXT_VA);
}

/* =========================================================================
 * ABI v50: 0x009ba980 PURE bit-0x10 getter (PlayerManager::
 * CoopBabiesOnly, EXACT ZHL 14 B).  PURE: 0 E8, 0 indirect, 0 stores.
 * static bool — body IGNORES ecx (no receiver); reads g_Game
 * [0xc71678] + 0x26548 (challenge bitset; bit 4 = Coop Babies).
 * 3-site rel32 census; 2 rets.  Mask gate: FULL dword & 0x10.
 * ------------------------------------------------------------------------- */
extern "C" int32_t isaac_cbo9ba980_flag_bit4_set(uint32_t field_26548) {
  /* 0x009ba98b: and eax,0x10 / 0x009ba98e: or eax,0 / 0x009ba991: je.
     Bit 4 of the raw dword -> al=1, else al=0.  The `or eax,0` only
     sets flags; the value is unchanged. */
  return ((field_26548 & ISAAC_CBO9BA980_BITSET_MASK) != 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_cbo9ba980_result_true(void) {
  /* 0x009ba993: mov al,1.  TRUE result 1 (bit set). */
  return 1u;
}

extern "C" uint32_t isaac_cbo9ba980_result_false(void) {
  /* 0x009ba996: xor al,al.  FALSE result 0 (bit clear). */
  return 0u;
}

extern "C" uint32_t isaac_cbo9ba980_bitset_ofs(void) {
  return static_cast<uint32_t>(ISAAC_CBO9BA980_BITSET_OFS);
}
extern "C" uint32_t isaac_cbo9ba980_bitset_mask(void) {
  return static_cast<uint32_t>(ISAAC_CBO9BA980_BITSET_MASK);
}
extern "C" uint32_t isaac_cbo9ba980_manager_global_va(void) {
  return static_cast<uint32_t>(ISAAC_CBO9BA980_MANAGER_GLOBAL_VA);
}
extern "C" uint32_t isaac_cbo9ba980_va(void) {
  return static_cast<uint32_t>(ISAAC_CBO9BA980_VA);
}
extern "C" uint32_t isaac_cbo9ba980_first_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_CBO9BA980_FIRST_RET_VA);
}
extern "C" uint32_t isaac_cbo9ba980_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_CBO9BA980_RET_VA);
}
extern "C" uint32_t isaac_cbo9ba980_int3_va(void) {
  return static_cast<uint32_t>(ISAAC_CBO9BA980_INT3_VA);
}
extern "C" uint32_t isaac_cbo9ba980_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_CBO9BA980_BODY_BYTES);
}
extern "C" uint32_t isaac_cbo9ba980_sites(void) {
  return static_cast<uint32_t>(ISAAC_CBO9BA980_SITES);
}
extern "C" uint32_t isaac_cbo9ba980_site0_va(void) {
  return static_cast<uint32_t>(ISAAC_CBO9BA980_SITE0_VA);
}
extern "C" uint32_t isaac_cbo9ba980_site1_va(void) {
  return static_cast<uint32_t>(ISAAC_CBO9BA980_SITE1_VA);
}
extern "C" uint32_t isaac_cbo9ba980_site2_va(void) {
  return static_cast<uint32_t>(ISAAC_CBO9BA980_SITE2_VA);
}
extern "C" uint32_t isaac_cbo9ba980_next_va(void) {
  return static_cast<uint32_t>(ISAAC_CBO9BA980_NEXT_VA);
}

/* ---- ABI v52: 0x009c6110 pure out-state decision island (see the
   header block): FULL-DWORD state==1 gate, sbb/and/add field8-nonzero
   value chain (2/4), whole-body next_state.  Zero uint8_t, zero byte
   masks. ---- */
static_assert(ISAAC_PROCESS_INPUT_PURE_HELPERS_ABI_VERSION == 52,
              "ABI v52 0x9c6110 pure out-state decision island");
static_assert(ISAAC_A9C6110_VA == 0x009c6110u &&
              ISAAC_A9C6110_RET_VA == 0x009c612eu &&
              ISAAC_A9C6110_FIRST_RET_VA == 0x009c612eu &&
              ISAAC_A9C6110_INT3_VA == 0x009c612fu &&
              ISAAC_A9C6110_BODY_BYTES == 0x1fu,
              "v52 0x9c6110 body 0x9c6110..0x9c612e, single ret @0x9c612e");
static_assert(ISAAC_A9C6110_SITES == 0 &&
              ISAAC_A9C6110_POINTER_REF_VA == 0x009c60c4u &&
              ISAAC_A9C6110_HOST_WALK_VA == 0x00a51c60u &&
              ISAAC_A9C6110_WALK_OWNER_VA == 0x009c60a0u,
              "v52 0x9c6110 zero direct E8 callers; address-taken @0x9c60c4 "
              "(callback arg to host walk 0xa51c60, picker owner 0x9c60a0)");
static_assert(ISAAC_A9C6110_STATE_OFS == 0u &&
              ISAAC_A9C6110_FIELD8_OFS == 8u &&
              ISAAC_A9C6110_MATCH_STATE == 1u &&
              ISAAC_A9C6110_VALUE_TWO == 2u &&
              ISAAC_A9C6110_VALUE_FOUR == 4u &&
              ISAAC_A9C6110_NEXT_VA == 0x009c6130u,
              "v52 0x9c6110 out-param +0 / in-param +8, gate ==1, values 2/4");

extern "C" int32_t isaac_a9c6110_gate(uint32_t state) {
  /* 0x009c6116 cmp dword [ecx],1 / 0x009c6119 jne 0x9c612d — FULL-DWORD
     equality (0x100/0x1ff/0xffffffff do NOT gate). */
  return (state == ISAAC_A9C6110_MATCH_STATE) ? 1 : 0;
}
extern "C" uint32_t isaac_a9c6110_value(uint32_t field8) {
  /* 0x009c611e xor edx,edx / 0x009c6120 cmp edx,[eax+8] (flags of
     0 - field8) / 0x009c6123 sbb eax,eax (-CF) / 0x009c6125 and
     eax,0xfffffffe / 0x009c6128 add eax,4 -> CF=1 -> 2, CF=0 -> 4.
     CF = borrow of (0 - field8) unsigned = (field8 != 0u). */
  return (field8 != 0u) ? ISAAC_A9C6110_VALUE_TWO
                        : ISAAC_A9C6110_VALUE_FOUR;
}
extern "C" uint32_t isaac_a9c6110_next_state(uint32_t state, uint32_t field8) {
  /* Whole body: the store @0x9c612b fires ONLY under the gate; the
     gate-miss arm returns with the state byte-for-byte unchanged. */
  if (isaac_a9c6110_gate(state) == 0) {
    return state;
  }
  return isaac_a9c6110_value(field8);
}
extern "C" uint32_t isaac_a9c6110_field8_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9C6110_FIELD8_OFS);
}
extern "C" uint32_t isaac_a9c6110_state_ofs(void) {
  return static_cast<uint32_t>(ISAAC_A9C6110_STATE_OFS);
}
extern "C" uint32_t isaac_a9c6110_match_state(void) {
  return static_cast<uint32_t>(ISAAC_A9C6110_MATCH_STATE);
}
extern "C" uint32_t isaac_a9c6110_value_two(void) {
  return static_cast<uint32_t>(ISAAC_A9C6110_VALUE_TWO);
}
extern "C" uint32_t isaac_a9c6110_value_four(void) {
  return static_cast<uint32_t>(ISAAC_A9C6110_VALUE_FOUR);
}
extern "C" uint32_t isaac_a9c6110_va(void) {
  return static_cast<uint32_t>(ISAAC_A9C6110_VA);
}
extern "C" uint32_t isaac_a9c6110_first_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_A9C6110_FIRST_RET_VA);
}
extern "C" uint32_t isaac_a9c6110_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_A9C6110_RET_VA);
}
extern "C" uint32_t isaac_a9c6110_int3_va(void) {
  return static_cast<uint32_t>(ISAAC_A9C6110_INT3_VA);
}
extern "C" uint32_t isaac_a9c6110_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_A9C6110_BODY_BYTES);
}
extern "C" uint32_t isaac_a9c6110_sites(void) {
  return static_cast<uint32_t>(ISAAC_A9C6110_SITES);
}
extern "C" uint32_t isaac_a9c6110_pointer_ref_va(void) {
  return static_cast<uint32_t>(ISAAC_A9C6110_POINTER_REF_VA);
}
extern "C" uint32_t isaac_a9c6110_host_walk_va(void) {
  return static_cast<uint32_t>(ISAAC_A9C6110_HOST_WALK_VA);
}
extern "C" uint32_t isaac_a9c6110_walk_owner_va(void) {
  return static_cast<uint32_t>(ISAAC_A9C6110_WALK_OWNER_VA);
}
extern "C" uint32_t isaac_a9c6110_next_va(void) {
  return static_cast<uint32_t>(ISAAC_A9C6110_NEXT_VA);
}

extern "C" uint32_t isaac_process_input_pure_helpers_abi_version(void) {
  return static_cast<uint32_t>(ISAAC_PROCESS_INPUT_PURE_HELPERS_ABI_VERSION);
}
