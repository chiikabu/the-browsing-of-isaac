#include "anm2_pure_helpers.h"

#include <stddef.h>

/* ANM2 animation-system pure helpers. ABI v30.

   Guest addresses are wasm32 pointers. load_u32/store_* operate on
   image bytes; load_guest_u32/guest_ptr reach a uint32 guest address. */

namespace {

inline const uint8_t* guest_ptr(uint32_t addr) {
  return reinterpret_cast<const uint8_t*>(static_cast<uintptr_t>(addr));
}

inline uint8_t* guest_mut_ptr(uint32_t addr) {
  return reinterpret_cast<uint8_t*>(static_cast<uintptr_t>(addr));
}

inline uint32_t load_u32(const uint8_t* p) {
  return static_cast<uint32_t>(p[0]) |
         (static_cast<uint32_t>(p[1]) << 8) |
         (static_cast<uint32_t>(p[2]) << 16) |
         (static_cast<uint32_t>(p[3]) << 24);
}

inline uint8_t load_u8(const uint8_t* p) {
  return *p;
}

inline uint32_t load_guest_u32(uint32_t addr) {
  return load_u32(guest_ptr(addr));
}

inline void store_u32(uint8_t* p, uint32_t v) {
  p[0] = static_cast<uint8_t>(v);
  p[1] = static_cast<uint8_t>(v >> 8);
  p[2] = static_cast<uint8_t>(v >> 16);
  p[3] = static_cast<uint8_t>(v >> 24);
}

inline void store_u16(uint8_t* p, uint16_t v) {
  p[0] = static_cast<uint8_t>(v);
  p[1] = static_cast<uint8_t>(v >> 8);
}

inline void store_u8(uint8_t* p, uint8_t v) {
  *p = v;
}

inline uint32_t one_bits() {
  return static_cast<uint32_t>(ISAAC_ANM2_F32_ONE_BITS);
}

inline uint32_t cvtdq2ps_bits(uint32_t raw) {
  const float f = static_cast<float>(static_cast<int32_t>(raw));
  return __builtin_bit_cast(uint32_t, f);
}

inline uint32_t anm2_f32_add_bits(uint32_t a, uint32_t b) {
  const float r =
      __builtin_bit_cast(float, a) + __builtin_bit_cast(float, b);
  return __builtin_bit_cast(uint32_t, r);
}

static const char kShadowName[] = "shadow";
static const char kEmptyLiteral[] = "";

inline const char* sso_data(const uint8_t* str) {
  const uint32_t cap = load_u32(str + ISAAC_ANM2_OFF_FILENAME_CAP_14);
  if (cap < static_cast<uint32_t>(ISAAC_ANM2_SSO_CAPACITY_THRESHOLD)) {
    return reinterpret_cast<const char*>(str);
  }
  return reinterpret_cast<const char*>(guest_ptr(load_u32(str)));
}


void fill_play_sso_plan(uint8_t* anm2,
                        uint32_t str_addr,
                        int32_t reset_flag,
                        IsaacAnm2PlaySsoPlan* out) {
  IsaacAnm2PlaySsoPlan plan;
  plan.entered = 0;
  plan.str_addr = str_addr;
  plan.cap = 0;
  plan.heap_used = 0;
  plan.name_addr = 0;
  plan.reset_flag = reset_flag;
  plan.data_null = 0;
  plan.name_equal = 0;
  plan.data_34_flag = 0;
  plan.state_44_flag = 0;
  plan.skip = 0;
  plan.call_apply = 0;
  plan.apply_va = 0;
  plan.apply_reset_arg = 0;
  plan.rewind_va = 0;
  plan.rewind_ran = 0;
  plan.flag_44_set = 0;
  uint32_t name_addr = 0;
  if (str_addr != 0u) {
    /* v12: cmp [eax+0x14],0x10 ; jb INLINE — UNSIGNED strict below. */
    const uint32_t cap = load_guest_u32(
        str_addr + static_cast<uint32_t>(ISAAC_ANM2_OFF_FILENAME_CAP_14));
    plan.cap = cap;
    if (cap < static_cast<uint32_t>(ISAAC_ANM2_SSO_CAPACITY_THRESHOLD)) {
      plan.heap_used = 0;
      name_addr = str_addr;
    } else {
      plan.heap_used = 1;
      name_addr = load_guest_u32(str_addr);
    }
    plan.name_addr = name_addr;
  }
  IsaacAnm2PlayPlan play;
  isaac_anm2_play_plan(anm2, name_addr, reset_flag, &play);
  plan.entered = anm2 != nullptr ? 1 : 0;
  plan.data_null = play.data_null;
  plan.name_equal = play.name_equal;
  plan.data_34_flag = play.data_34_flag;
  plan.state_44_flag = play.state_44_flag;
  plan.skip = play.skip;
  plan.call_apply = play.call_apply;
  plan.apply_va = play.apply_va;
  plan.apply_reset_arg = play.apply_reset_arg;
  plan.rewind_va = play.rewind_va;
  plan.rewind_ran = play.rewind_ran;
  plan.flag_44_set = play.flag_44_set;
  if (out != nullptr) {
    *out = plan;
  }
}

void fill_overlay_play_sso_plan(uint8_t* anm2,
                                uint32_t str_addr,
                                int32_t reset_flag,
                                IsaacAnm2OverlayPlaySsoPlan* out) {
  IsaacAnm2OverlayPlaySsoPlan plan;
  plan.entered = 0;
  plan.str_addr = str_addr;
  plan.cap = 0;
  plan.heap_used = 0;
  plan.name_addr = 0;
  plan.reset_flag = reset_flag;
  plan.data_null = 0;
  plan.name_equal = 0;
  plan.data_34_flag = 0;
  plan.state_44_flag = 0;
  plan.skip = 0;
  plan.call_apply = 0;
  plan.apply_va = static_cast<uint32_t>(ISAAC_ANM2_OVERLAY_PLAY_APPLY_VA);
  plan.apply_reset_arg = 1;
  plan.rewind_va = static_cast<uint32_t>(ISAAC_ANM2_REWIND_VA);
  plan.rewind_ran = 0;
  plan.flag_44_set = 0;
  uint32_t name_addr = 0;
  if (str_addr != 0u) {
    /* v25 overlay Play SSO: cmp [eax+0x14],0x10 ; jb INLINE — UNSIGNED strict below. */
    const uint32_t cap = load_guest_u32(
        str_addr + static_cast<uint32_t>(ISAAC_ANM2_OFF_FILENAME_CAP_14));
    plan.cap = cap;
    if (cap < static_cast<uint32_t>(ISAAC_ANM2_SSO_CAPACITY_THRESHOLD)) {
      plan.heap_used = 0;
      name_addr = str_addr;
    } else {
      plan.heap_used = 1;
      name_addr = load_guest_u32(str_addr);
    }
    plan.name_addr = name_addr;
  }
  if (anm2 != nullptr) {
    plan.entered = 1;
    const uint32_t data = load_u32(anm2 + ISAAC_ANM2_OVERLAY_PLAY_DATA_OFF);
    /* v25 overlay Play: test esi,esi — FULL dword [this+0x54], so 0x100 is present. */
    plan.data_null = data == 0u ? 1 : 0;
    if (data != 0u) {
      const char* current = sso_data(guest_ptr(data));
      const char* requested = reinterpret_cast<const char*>(guest_ptr(name_addr));
      plan.name_equal = isaac_anm2_strcmp_inline(current, requested) == 0 ? 1 : 0;
      plan.data_34_flag = static_cast<int32_t>(
          guest_ptr(data)[ISAAC_ANM2_DATA_OFF_RESTART_FLAG_34]);
    }
    plan.state_44_flag =
        static_cast<int32_t>(anm2[ISAAC_ANM2_OVERLAY_PLAY_FLAG_OFF]);
  }
  /* v25 overlay Play: cmp byte [ebp+0xc],0 — LOW BYTE, so 0x100 is NOT set. */
  if ((static_cast<uint32_t>(reset_flag) & 0xffu) != 0u) {
    plan.skip = 0;
  } else {
    plan.skip = isaac_anm2_play_gate_skip(0, plan.data_null, plan.name_equal,
                                          plan.data_34_flag, plan.state_44_flag);
  }
  plan.call_apply = plan.skip != 0 ? 0 : 1;
  if (out != nullptr) {
    *out = plan;
  }
}

void fill_set_frame_cstr_plan(uint8_t* anm2,
                              uint32_t name_addr,
                              int32_t frame,
                              IsaacAnm2SetFrameCstrPlan* out) {
  IsaacAnm2SetFrameCstrPlan plan;
  plan.entered = 0;
  plan.name_addr = name_addr;
  plan.frame = frame;
  plan.frame_f_bits = cvtdq2ps_bits(static_cast<uint32_t>(frame));
  plan.found = 0;
  plan.found_index = -1;
  plan.elem_byte_offset = 0;
  plan.warn_log_needed = 0;
  plan.warn_log_va = 0;
  plan.warn_log_level = 0;
  plan.warn_log_str_va = 0;
  plan.apply_va = 0;
  plan.apply_recv_off = 0;
  plan.walk_result = 0;
  plan.data_present = 0;
  plan.data_present_post = 0;
  plan.advance_ran = 0;
  plan.flag_44_cleared = 0;
  plan.host_call_count = 0;
  IsaacAnm2WalkApplyPlan walk;
  isaac_anm2_walk_apply_plan(
      anm2, name_addr,
      static_cast<int32_t>(ISAAC_ANM2_SET_FRAME_CSTR_RESET_IMM), &walk);
  plan.entered = anm2 != nullptr ? 1 : 0;
  plan.found = walk.found;
  plan.found_index = walk.found_index;
  plan.elem_byte_offset = walk.elem_byte_offset;
  plan.warn_log_needed = walk.warn_log_needed;
  plan.warn_log_va = walk.warn_log_va;
  plan.warn_log_level = walk.warn_log_level;
  plan.warn_log_str_va = walk.warn_log_str_va;
  plan.apply_va = walk.apply_va;
  plan.apply_recv_off = walk.apply_recv_off;
  /* v17: test al,al after 0x0040a5d0 — BYTE gate. walk.result is
     already the PE AL (0/1). */
  plan.walk_result = walk.result;
  uint32_t data = 0;
  if (anm2 != nullptr) {
    data = load_u32(anm2 + ISAAC_ANM2_OFF_ANIM_DATA_PTR_34);
  }
  plan.data_present = data != 0u ? 1 : 0;
  /* v17: walk AL && [this+0x34] both required for 0x408e00. */
  plan.advance_ran =
      (plan.walk_result != 0 && plan.data_present != 0) ? 1 : 0;
  uint32_t data_post = 0;
  if (anm2 != nullptr) {
    data_post = load_u32(anm2 + ISAAC_ANM2_OFF_ANIM_DATA_PTR_34);
  }
  plan.data_present_post = data_post != 0u ? 1 : 0;
  plan.flag_44_cleared =
      (plan.advance_ran != 0 && plan.data_present_post != 0) ? 1 : 0;
  plan.host_call_count = walk.host_call_count + plan.advance_ran;
  if (out != nullptr) {
    *out = plan;
  }
}

void fill_set_frame_plan(uint8_t* anm2,
                                uint32_t str_addr,
                                int32_t frame,
                                IsaacAnm2SetFramePlan* out) {
  IsaacAnm2SetFramePlan plan;
  plan.entered = 0;
  plan.str_addr = str_addr;
  plan.cap = 0;
  plan.heap_used = 0;
  plan.name_addr = 0;
  plan.frame = frame;
  plan.frame_f_bits = cvtdq2ps_bits(static_cast<uint32_t>(frame));
  plan.found = 0;
  plan.found_index = -1;
  plan.elem_byte_offset = 0;
  plan.warn_log_needed = 0;
  plan.warn_log_va = 0;
  plan.warn_log_level = 0;
  plan.warn_log_str_va = 0;
  plan.apply_va = 0;
  plan.apply_recv_off = 0;
  plan.walk_result = 0;
  plan.data_present = 0;
  plan.data_present_post = 0;
  plan.advance_ran = 0;
  plan.flag_44_cleared = 0;
  plan.host_call_count = 0;

  uint32_t name_addr = 0;
  if (str_addr != 0u) {
    /* v16: cmp [eax+0x14],0x10 ; jb INLINE — UNSIGNED strict below. */
    const uint32_t cap = load_guest_u32(
        str_addr + static_cast<uint32_t>(ISAAC_ANM2_OFF_FILENAME_CAP_14));
    plan.cap = cap;
    if (cap < static_cast<uint32_t>(ISAAC_ANM2_SSO_CAPACITY_THRESHOLD)) {
      plan.heap_used = 0;
      name_addr = str_addr;
    } else {
      plan.heap_used = 1;
      name_addr = load_guest_u32(str_addr);
    }
    plan.name_addr = name_addr;
  }

  IsaacAnm2WalkApplyPlan walk;
  isaac_anm2_walk_apply_plan(
      anm2, name_addr,
      static_cast<int32_t>(ISAAC_ANM2_SET_FRAME_RESET_IMM), &walk);
  plan.entered = anm2 != nullptr ? 1 : 0;
  plan.found = walk.found;
  plan.found_index = walk.found_index;
  plan.elem_byte_offset = walk.elem_byte_offset;
  plan.warn_log_needed = walk.warn_log_needed;
  plan.warn_log_va = walk.warn_log_va;
  plan.warn_log_level = walk.warn_log_level;
  plan.warn_log_str_va = walk.warn_log_str_va;
  plan.apply_va = walk.apply_va;
  plan.apply_recv_off = walk.apply_recv_off;
  /* `test al,al` after 0x0040a5d0 — BYTE gate. walk.result is already
     the PE AL (0/1). */
  plan.walk_result = walk.result;
  uint32_t data = 0;
  if (anm2 != nullptr) {
    data = load_u32(anm2 + ISAAC_ANM2_OFF_ANIM_DATA_PTR_34);
  }
  plan.data_present = data != 0u ? 1 : 0;
  /* v16: walk AL && [this+0x34] both required for 0x408e00. */
  plan.advance_ran =
      (plan.walk_result != 0 && plan.data_present != 0) ? 1 : 0;
  /* 0x00408e00 does not write ANM2+0x34; the second test is still a
     RE-READ (consumed by reference, not folded). */
  uint32_t data_post = 0;
  if (anm2 != nullptr) {
    data_post = load_u32(anm2 + ISAAC_ANM2_OFF_ANIM_DATA_PTR_34);
  }
  plan.data_present_post = data_post != 0u ? 1 : 0;
  plan.flag_44_cleared =
      (plan.advance_ran != 0 && plan.data_present_post != 0) ? 1 : 0;
  plan.host_call_count = walk.host_call_count + plan.advance_ran;
  if (out != nullptr) {
    *out = plan;
  }
}

}  // namespace

extern "C" {

int32_t isaac_anm2_sso_uses_heap(uint32_t capacity) {
  return capacity < static_cast<uint32_t>(ISAAC_ANM2_SSO_CAPACITY_THRESHOLD)
             ? 0
             : 1;
}

uint32_t isaac_anm2_sso_data_ptr(uint32_t str_base,
                                 uint32_t capacity,
                                 uint32_t heap_ptr) {
  return isaac_anm2_sso_uses_heap(capacity) ? heap_ptr : str_base;
}

int32_t isaac_anm2_strcmp_inline(const char* a, const char* b) {
  /* PE VA 0x0040b470 / 0x0040bcf5 / 0x0040a600: two bytes per iteration, the
     mismatch exit normalised through `sbb eax,eax ; or eax,1`. CF comes from a
     byte cmp, so the ordering is UNSIGNED. */
  const uint8_t* p = reinterpret_cast<const uint8_t*>(a);
  const uint8_t* q = reinterpret_cast<const uint8_t*>(b);
  for (;;) {
    uint8_t d = p[0];
    if (d != q[0]) {
      return d < q[0] ? -1 : 1;
    }
    if (d == 0u) {
      return 0;
    }
    d = p[1];
    if (d != q[1]) {
      return d < q[1] ? -1 : 1;
    }
    p += 2;
    q += 2;
    if (d == 0u) {
      return 0;
    }
  }
}

int32_t isaac_anm2_reset_name_host_needed(int32_t filename_size_10) {
  /* cmp dword ptr [edi+0x10], 0 ; je skip — full 32-bit test. */
  return filename_size_10 != 0 ? 1 : 0;
}

int32_t isaac_anm2_reset_teardown_needed(uint32_t layer_state_7c) {
  return layer_state_7c != 0u ? 1 : 0;
}

uint32_t isaac_anm2_reset_array_header(uint32_t layer_state_7c) {
  /* lea esi,[eax-4] — 32-bit wrap, no null check on this path. */
  return static_cast<uint32_t>(
      layer_state_7c -
      static_cast<uint32_t>(ISAAC_ANM2_ARRAY_HEADER_BIAS));
}

uint32_t isaac_anm2_reset_free_size(uint32_t header_count) {
  /* lea eax,[eax+eax*4] ; shl eax,5 ; add eax,4 */
  const uint32_t scaled = static_cast<uint32_t>(
      (header_count + header_count * 4u) * 32u);
  return static_cast<uint32_t>(
      scaled + static_cast<uint32_t>(ISAAC_ANM2_ARRAY_HEADER_BIAS));
}

void isaac_anm2_reset_teardown_plan(uint32_t layer_state_7c,
                                    uint32_t count_before,
                                    uint32_t count_after,
                                    IsaacAnm2ResetTeardownPlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t needed = isaac_anm2_reset_teardown_needed(layer_state_7c);
  out->teardown_needed = needed;
  out->dtor_elem_size = static_cast<uint32_t>(ISAAC_ANM2_LAYER_STATE_STRIDE);
  out->dtor_elem_va = static_cast<uint32_t>(ISAAC_ANM2_HOST_VA_LAYER_ELEM_DTOR);
  out->ehvec_va = static_cast<uint32_t>(ISAAC_ANM2_HOST_VA_EHVEC_DTOR_ITER);
  out->operator_delete_va =
      static_cast<uint32_t>(ISAAC_ANM2_HOST_VA_OPERATOR_DELETE);
  if (needed == 0) {
    out->header_ptr = 0u;
    out->dtor_array_ptr = 0u;
    out->dtor_count = 0u;
    out->free_count = 0u;
    out->free_size = 0u;
    return;
  }
  out->header_ptr = isaac_anm2_reset_array_header(layer_state_7c);
  out->dtor_array_ptr = layer_state_7c;
  out->dtor_count = count_before;
  /* The size handed to operator delete uses the header dword RE-READ at VA
     0x00407fb1, after the eh-vector destructor ran. */
  out->free_count = count_after;
  out->free_size = isaac_anm2_reset_free_size(count_after);
}

void isaac_anm2_reset_plan(int32_t filename_size_10,
                           uint32_t layer_state_7c,
                           uint32_t count_before,
                           uint32_t count_after,
                           IsaacAnm2ResetPlan* out) {
  if (out == nullptr) {
    return;
  }
  (void)count_before;
  const int32_t name_host =
      isaac_anm2_reset_name_host_needed(filename_size_10);
  const int32_t teardown = isaac_anm2_reset_teardown_needed(layer_state_7c);
  out->name_host_needed = name_host;
  out->name_host_va =
      static_cast<uint32_t>(ISAAC_ANM2_HOST_VA_RESET_NAME_PROLOGUE);
  out->anim_state_calls = 2;
  out->anim_state_va =
      static_cast<uint32_t>(ISAAC_ANM2_HOST_VA_ANIM_STATE_APPLY);
  out->anim_state_recv0 = static_cast<uint32_t>(ISAAC_ANM2_OFF_ANIM_STATE_30);
  out->anim_state_recv1 =
      static_cast<uint32_t>(ISAAC_ANM2_OFF_OVERLAY_STATE_50);
  out->teardown_needed = teardown;
  out->free_size = teardown ? isaac_anm2_reset_free_size(count_after) : 0u;
  /* eh-vector destructor iterator + operator delete are two host calls. */
  out->host_call_count = name_host + 2 + (teardown ? 2 : 0);
  /* The two 0x00408830 calls are unconditional, so Reset never collapses. */
  out->pure_complete = 0;
}

void isaac_anm2_reset_apply_fields(uint8_t* obj,
                                   uint8_t* name_heap,
                                   uint8_t* anim_heap,
                                   uint32_t offset_x_bits,
                                   uint32_t offset_y_bits,
                                   uint32_t scale_x_bits,
                                   uint32_t scale_y_bits) {
  if (obj == nullptr) {
    return;
  }

  /* VA 0x00407f42..0x00407f58 — _filename clear. */
  const uint32_t name_cap = load_u32(obj + ISAAC_ANM2_OFF_FILENAME_CAP_14);
  store_u32(obj + ISAAC_ANM2_OFF_FILENAME_SIZE_10, 0u);
  uint8_t* name_data = isaac_anm2_sso_uses_heap(name_cap)
                           ? name_heap
                           : (obj + ISAAC_ANM2_OFF_FILENAME_STR_00);
  if (name_data != nullptr) {
    store_u8(name_data, 0u);
  }

  /* VA 0x00407f5b / 0x00407f65 — the two 0x00408830 host calls own
     0x030..0x06f and are deliberately not modelled here. */

  /* VA 0x00407f6a..0x00407f7d — _animDefaultName clear. */
  const uint32_t anim_cap = load_u32(obj + ISAAC_ANM2_OFF_ANIM_NAME_CAP_2C);
  store_u32(obj + ISAAC_ANM2_OFF_ANIM_NAME_SIZE_28, 0u);
  uint8_t* anim_data = isaac_anm2_sso_uses_heap(anim_cap)
                           ? anim_heap
                           : (obj + ISAAC_ANM2_OFF_ANIM_NAME_STR_18);
  if (anim_data != nullptr) {
    store_u8(anim_data, 0u);
  }

  /* VA 0x00407f83 / 0x00407f8a. */
  store_u32(obj + ISAAC_ANM2_OFF_ANIM_DATA_74, 0u);
  store_u32(obj + ISAAC_ANM2_OFF_ANIM_COUNT_78, 0u);

  /* VA 0x00407fc6..0x0040814f — the field-write plan, in PE order. */
  store_u32(obj + ISAAC_ANM2_OFF_LAYER_STATE_7C, 0u);
  store_u32(obj + ISAAC_ANM2_OFF_LAYER_COUNT_80, 0u);
  store_u32(obj + 0x84, 0u);
  store_u32(obj + 0x88, 0u);
  store_u32(obj + 0x8c, 0u);
  store_u32(obj + 0x90, 0u);

  /* movss copies: raw 32-bit words out of writable .data, never rounded. */
  store_u32(obj + ISAAC_ANM2_OFF_OFFSET_94, offset_x_bits);
  store_u32(obj + (ISAAC_ANM2_OFF_OFFSET_94 + 4), offset_y_bits);
  store_u32(obj + ISAAC_ANM2_OFF_SCALE_9C, scale_x_bits);
  store_u32(obj + (ISAAC_ANM2_OFF_SCALE_9C + 4), scale_y_bits);

  store_u32(obj + ISAAC_ANM2_OFF_ROTATION_A4, 0u);

  /* _color: four leading components to 1.0f, remaining seven dwords to 0. */
  store_u32(obj + ISAAC_ANM2_OFF_COLOR_A8, one_bits());
  store_u32(obj + 0xac, one_bits());
  store_u32(obj + 0xb0, one_bits());
  store_u32(obj + 0xb4, one_bits());
  store_u32(obj + 0xb8, 0u);
  store_u32(obj + 0xbc, 0u);
  store_u32(obj + 0xc0, 0u);
  store_u32(obj + 0xc4, 0u);
  store_u32(obj + 0xc8, 0u);
  store_u32(obj + 0xcc, 0u);
  store_u32(obj + 0xd0, 0u);

  /* _championColor tail is written BEFORE its head in the PE. */
  store_u32(obj + 0xe4, 0u);
  store_u32(obj + 0xe8, 0u);
  store_u32(obj + 0xec, 0u);
  store_u32(obj + 0xf0, 0u);
  store_u32(obj + 0xf4, 0u);
  store_u32(obj + 0xf8, 0u);
  store_u32(obj + 0xfc, 0u);

  /* Only THREE ones here, and the fourth component is zeroed (defect D5). */
  store_u32(obj + ISAAC_ANM2_OFF_CHAMPION_COLOR_D4, one_bits());
  store_u32(obj + 0xd8, one_bits());
  store_u32(obj + 0xdc, one_bits());
  store_u32(obj + 0xe0, 0u);

  /* 16-bit store: clears _flipX and _flipY only (defect D3). */
  store_u16(obj + ISAAC_ANM2_OFF_FLIP_PAIR_100, 0u);
  store_u32(obj + ISAAC_ANM2_OFF_PLAYBACK_SPEED_104, one_bits());
  /* 16-bit store: clears 0x108 and _loaded only (defect D3). */
  store_u16(obj + ISAAC_ANM2_OFF_LOADED_PAIR_108, 0u);
  /* 8-bit store. */
  store_u8(obj + ISAAC_ANM2_OFF_OVERLAY_FIRST_70, 0u);

  store_u32(obj + ISAAC_ANM2_OFF_UNNAMED_10C,
            static_cast<uint32_t>(ISAAC_ANM2_RESET_UNNAMED_10C_VALUE));
  store_u32(obj + ISAAC_ANM2_OFF_BITFLAGS_110, 0u);
}

int32_t isaac_anm2_layer_index_in_range(int32_t index, int32_t count) {
  /* test esi,esi ; js  → reject negative.
     cmp esi,[edi+0x80] ; jl ok  → SIGNED, strict upper bound. */
  if (index < 0) {
    return 0;
  }
  return index < count ? 1 : 0;
}

uint32_t isaac_anm2_layer_byte_offset(int32_t index) {
  /* lea eax,[eax+eax*4]; shl eax,5 */
  const uint32_t i = static_cast<uint32_t>(index);
  return static_cast<uint32_t>((i + i * 4u) * 32u);
}

void isaac_anm2_get_layer_plan(int32_t index,
                               int32_t count_pre,
                               int32_t count_post,
                               uint32_t base_post,
                               IsaacAnm2GetLayerPlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t pre = isaac_anm2_layer_index_in_range(index, count_pre);
  out->in_range_pre = pre;
  out->log_needed = pre ? 0 : 1;
  out->log_va = static_cast<uint32_t>(ISAAC_ANM2_HOST_VA_LOG);
  out->log_level = static_cast<int32_t>(ISAAC_ANM2_GET_LAYER_LOG_LEVEL);
  out->log_format_va = static_cast<uint32_t>(ISAAC_ANM2_GET_LAYER_LOG_STR_VA);
  out->static_layer_va =
      static_cast<uint32_t>(ISAAC_ANM2_GET_LAYER_STATIC_VA);
  out->static_guard_va = static_cast<uint32_t>(ISAAC_ANM2_GET_LAYER_GUARD_VA);

  /* The in-range path jumps straight to 0x0040b27d; only the logged path
     re-tests against the count reloaded at 0x0040b275. */
  const int32_t post =
      pre ? 1 : isaac_anm2_layer_index_in_range(index, count_post);
  out->in_range_post = post;
  out->uses_static_fallback = post ? 0 : 1;
  if (post) {
    /* add eax,[edi+0x7c] at 0x0040b283 — the base is read after the call. */
    out->result_ptr = static_cast<uint32_t>(
        base_post + isaac_anm2_layer_byte_offset(index));
  } else {
    out->result_ptr = static_cast<uint32_t>(ISAAC_ANM2_GET_LAYER_STATIC_VA);
  }
}

int32_t isaac_anm2_layer_walk_enter(uint32_t count) {
  return count != 0u ? 1 : 0;
}

int32_t isaac_anm2_layer_walk_continue(uint32_t next_index, uint32_t count) {
  /* cmp esi,ebx ; jb — UNSIGNED against the once-folded count. */
  return next_index < count ? 1 : 0;
}

int32_t isaac_anm2_find_layer_index_by_name(const uint8_t* layer_base,
                                            uint32_t count,
                                            const char* name) {
  if (isaac_anm2_layer_walk_enter(count) == 0) {
    return -1; /* count 0 short-circuits before any dereference */
  }
  const uint8_t* cursor = layer_base;
  uint32_t i = 0u;
  for (;;) {
    const uint32_t layer_data =
        load_u32(cursor + ISAAC_ANM2_LAYER_DATA_PTR_OFF);
    const char* candidate;
    if (layer_data == 0u) {
      candidate = kEmptyLiteral;
    } else {
      candidate =
          sso_data(guest_ptr(layer_data) + ISAAC_ANM2_LAYER_DATA_NAME_OFF);
    }
    if (isaac_anm2_strcmp_inline(candidate, name) == 0) {
      return static_cast<int32_t>(i);
    }
    ++i;
    cursor += ISAAC_ANM2_LAYER_STATE_STRIDE;
    if (isaac_anm2_layer_walk_continue(i, count) == 0) {
      return -1;
    }
  }
}

uint32_t isaac_anm2_anim_data_byte_offset(int32_t index) {
  /* imul eax, edi, 0x13c (VA 0x0040bd34 / 0x0040a655) — 32-bit wrap. */
  return static_cast<uint32_t>(index) *
         static_cast<uint32_t>(ISAAC_ANM2_ANIM_DATA_STRIDE);
}

int32_t isaac_anm2_anim_data_index_by_name(const uint8_t* anim_base,
                                           uint32_t count,
                                           const char* name) {
  if (isaac_anm2_layer_walk_enter(count) == 0) {
    return -1; /* count 0 short-circuits before any dereference */
  }
  const uint8_t* cursor = anim_base;
  uint32_t i = 0u;
  for (;;) {
    /* No null guard here: the element's own std::string is at element+0. */
    if (isaac_anm2_strcmp_inline(sso_data(cursor), name) == 0) {
      return static_cast<int32_t>(i);
    }
    ++i;
    cursor += ISAAC_ANM2_ANIM_DATA_STRIDE;
    if (isaac_anm2_layer_walk_continue(i, count) == 0) {
      return -1;
    }
  }
}

void isaac_anm2_anim_apply_plan(int32_t found_index,
                                int32_t reset_flag,
                                IsaacAnm2AnimApplyPlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t found = found_index >= 0 ? 1 : 0;
  out->found = found;
  out->found_index = found ? found_index : -1;
  out->warn_log_va = static_cast<uint32_t>(ISAAC_ANM2_HOST_VA_LOG);
  out->warn_log_level = static_cast<int32_t>(ISAAC_ANM2_ANIM_MISS_LOG_LEVEL);
  out->warn_log_str_va =
      static_cast<uint32_t>(ISAAC_ANM2_ANIM_MISS_LOG_STR_VA);
  if (found == 0) {
    out->elem_byte_offset = 0u;
    out->warn_log_needed = 1;
    out->apply_va = 0u;
    out->apply_recv_off = 0u;
    out->result = 0;
    return;
  }
  out->elem_byte_offset = isaac_anm2_anim_data_byte_offset(found_index);
  out->warn_log_needed = 0;
  /* cmp byte  ptr [ebp+0xc], 0 ; je alt — only the low byte is tested. */
  out->apply_va =
      ((static_cast<uint32_t>(reset_flag) & 0xffu) != 0u)
          ? static_cast<uint32_t>(ISAAC_ANM2_HOST_VA_ANIM_STATE_APPLY)
          : static_cast<uint32_t>(ISAAC_ANM2_HOST_VA_ANIM_STATE_APPLY_ALT);
  out->apply_recv_off = static_cast<uint32_t>(ISAAC_ANM2_OFF_ANIM_STATE_30);
  out->result = 1;
}

void isaac_anm2_walk_apply_plan(const uint8_t* anm2,
                                uint32_t name_addr,
                                int32_t reset_flag,
                                IsaacAnm2WalkApplyPlan* out) {
  IsaacAnm2WalkApplyPlan plan;
  plan.found = 0;
  plan.found_index = -1;
  plan.elem_byte_offset = 0u;
  plan.warn_log_needed = 1;
  plan.warn_log_va = static_cast<uint32_t>(ISAAC_ANM2_HOST_VA_LOG);
  plan.warn_log_level = static_cast<int32_t>(ISAAC_ANM2_ANIM_MISS_LOG_LEVEL);
  plan.warn_log_str_va = static_cast<uint32_t>(ISAAC_ANM2_ANIM_MISS_LOG_STR_VA);
  plan.apply_va = 0u;
  plan.apply_recv_off = 0u;
  plan.result = 0;
  plan.host_call_count = 1; /* the warn log — unconditional on a miss */
  int32_t index = -1;
  if (anm2 != nullptr) {
    const uint32_t base = load_u32(anm2 + ISAAC_ANM2_OFF_ANIM_DATA_74);
    const uint32_t count = load_u32(anm2 + ISAAC_ANM2_OFF_ANIM_COUNT_78);
    if ((count & 0xffu) != 0u) {
      index = isaac_anm2_anim_data_index_by_name(
          guest_ptr(base), count,
          reinterpret_cast<const char*>(guest_ptr(name_addr)));
    }
  }
  if (index < 0) {
    if (out != nullptr) {
      *out = plan;
    }
    return;
  }
  IsaacAnm2AnimApplyPlan hit;
  isaac_anm2_anim_apply_plan(index, reset_flag, &hit);
  plan.found = 1;
  plan.found_index = index;
  plan.elem_byte_offset = hit.elem_byte_offset;
  plan.warn_log_needed = 0;
  plan.apply_va = hit.apply_va;
  plan.apply_recv_off = hit.apply_recv_off;
  plan.result = 1;
  plan.host_call_count = 1;
  if (out != nullptr) {
    *out = plan;
  }
}

void isaac_anm2_load_plan(const uint8_t* anm2,
                          int32_t load_graphics,
                          IsaacAnm2LoadPlan* out) {
  IsaacAnm2LoadPlan plan;
  plan.entered = 0;
  plan.latch_off = static_cast<uint32_t>(ISAAC_ANM2_OFF_LOADED_PAIR_108 + 1);
  plan.latch_value = 1;
  plan.slot10c_uncond = 0;
  plan.slot10c_uncond_value = -1;
  plan.shadow_index = -1;
  plan.shadow_set = 0;
  plan.star_layer_count = 0;
  plan.star_layer_first = -1;
  plan.star_extra_count = 0;
  plan.star_extra_first = -1;
  plan.bitflags_or_400 = 0;
  plan.bitflags_or_800 = 0;
  plan.bitflags_off = static_cast<uint32_t>(ISAAC_ANM2_OFF_BITFLAGS_110);
  plan.star_flag_off = static_cast<uint32_t>(ISAAC_ANM2_LOAD_LAYER_STAR_FLAG_OFF);
  plan.layer_stride = static_cast<uint32_t>(ISAAC_ANM2_LOAD_LAYER_STRIDE);
  plan.extra_stride = static_cast<uint32_t>(ISAAC_ANM2_LOAD_EXTRA_STRIDE);
  plan.layer_count = 0u;
  plan.extra_count = 0u;
  plan.filename_size = 0u;
  plan.graphics_loaded = 0;
  plan.shadow_str_va = static_cast<uint32_t>(ISAAC_ANM2_LOAD_SHADOW_STR_VA);
  plan.host_call_count = 0;
  plan.layers_guest = 0u;
  plan.extras_guest = 0u;
  if (anm2 == nullptr) {
    if (out != nullptr) {
      *out = plan;
    }
    return;
  }
  plan.entered = 1;
  plan.slot10c_uncond = 1;
  plan.filename_size = load_u32(anm2 + ISAAC_ANM2_OFF_FILENAME_SIZE_10);
  plan.layer_count = load_u32(anm2 + ISAAC_ANM2_LOAD_OFF_LAYER_COUNT_80);
  plan.extra_count = load_u32(anm2 + ISAAC_ANM2_LOAD_OFF_EXTRAS_COUNT_88);
  plan.layers_guest = load_u32(anm2 + ISAAC_ANM2_LOAD_OFF_LAYER_STATE_7C);
  plan.extras_guest = load_u32(anm2 + ISAAC_ANM2_LOAD_OFF_EXTRAS_PTR_84);
  plan.graphics_loaded =
      (static_cast<uint32_t>(load_graphics) & 0xffu) != 0u ? 1 : 0;
  plan.host_call_count =
      5 + (plan.filename_size != 0u ? 1 : 0) + plan.graphics_loaded;
  int32_t shadow = -1;
  int32_t star_first = -1;
  int32_t star_count = 0;
  if (plan.layer_count != 0u) {
    for (uint32_t i = 0u; i < plan.layer_count; ++i) {
      const uint32_t layer =
          static_cast<uint32_t>(plan.layers_guest +
                                i * static_cast<uint32_t>(ISAAC_ANM2_LOAD_LAYER_STRIDE));
      const uint32_t data = load_guest_u32(layer);
      const char* name;
      if (data == 0u) {
        name = kEmptyLiteral;
      } else {
        name = sso_data(guest_ptr(data + ISAAC_ANM2_LOAD_OFF_NAME_8));
      }
      if (isaac_anm2_strcmp_inline(name, kShadowName) == 0) {
        shadow = static_cast<int32_t>(i);
      }
      if (static_cast<uint8_t>(name[0]) == ISAAC_ANM2_LOAD_STAR_CHAR) {
        star_count += 1;
        if (star_first < 0) {
          star_first = static_cast<int32_t>(i);
        }
      }
    }
  }
  plan.shadow_index = shadow;
  plan.shadow_set = shadow >= 0 ? 1 : 0;
  plan.star_layer_count = star_count;
  plan.star_layer_first = star_first;
  plan.bitflags_or_400 = star_count > 0 ? 1 : 0;
  int32_t extra_first = -1;
  int32_t extra_star = 0;
  if (plan.extra_count != 0u) {
    for (uint32_t k = 0u; k < plan.extra_count; ++k) {
      const uint32_t elem =
          static_cast<uint32_t>(plan.extras_guest +
                                k * static_cast<uint32_t>(ISAAC_ANM2_LOAD_EXTRA_STRIDE));
      const char* name = sso_data(guest_ptr(elem));
      if (static_cast<uint8_t>(name[0]) == ISAAC_ANM2_LOAD_STAR_CHAR) {
        extra_star += 1;
        if (extra_first < 0) {
          extra_first = static_cast<int32_t>(k);
        }
      }
    }
  }
  plan.star_extra_count = extra_star;
  plan.star_extra_first = extra_first;
  plan.bitflags_or_800 = extra_star > 0 ? 1 : 0;
  if (out != nullptr) {
    *out = plan;
  }
}

void isaac_anm2_load_apply(const uint8_t* anm2,
                           int32_t load_graphics,
                           IsaacAnm2LoadPlan* out) {
  IsaacAnm2LoadPlan plan;
  isaac_anm2_load_plan(anm2, load_graphics, &plan);
  if (out != nullptr) {
    *out = plan;
  }
  if (anm2 == nullptr) {
    return;
  }
  /* S1 + S2 — unconditional, in PE order. */
  store_u8(guest_mut_ptr(reinterpret_cast<uintptr_t>(anm2) +
                         ISAAC_ANM2_OFF_LOADED_PAIR_108 + 1),
           1u);
  store_u32(guest_mut_ptr(
      reinterpret_cast<uintptr_t>(anm2) + ISAAC_ANM2_OFF_UNNAMED_10C),
      0xffffffffu);
  /* S3 — last "shadow" layer wins. */
  if (plan.shadow_index >= 0) {
    store_u32(guest_mut_ptr(
        reinterpret_cast<uintptr_t>(anm2) + ISAAC_ANM2_OFF_UNNAMED_10C),
        static_cast<uint32_t>(plan.shadow_index));
  }
  const uint32_t layers = plan.layers_guest;
  /* S5 (bitflags 0x400) before the per-layer S4 writes, PE order. */
  if (plan.bitflags_or_400 != 0) {
    uint8_t* flags = guest_mut_ptr(
        reinterpret_cast<uintptr_t>(anm2) + ISAAC_ANM2_OFF_BITFLAGS_110);
    store_u32(flags,
              load_u32(flags) | static_cast<uint32_t>(ISAAC_ANM2_LOAD_BITFLAG_400));
    for (uint32_t i = 0; i < plan.layer_count; ++i) {
      const uint32_t layer =
          static_cast<uint32_t>(layers +
                                i * static_cast<uint32_t>(ISAAC_ANM2_LOAD_LAYER_STRIDE));
      const uint32_t data = load_guest_u32(layer);
      const char* name;
      if (data == 0u) {
        name = kEmptyLiteral;
      } else {
        name = sso_data(guest_ptr(data + ISAAC_ANM2_LOAD_OFF_NAME_8));
      }
      if (static_cast<uint8_t>(name[0]) == ISAAC_ANM2_LOAD_STAR_CHAR) {
        uint8_t* slot = guest_mut_ptr(
            layer + static_cast<uint32_t>(ISAAC_ANM2_LOAD_LAYER_STAR_FLAG_OFF));
        store_u32(slot,
                  load_u32(slot) |
                      static_cast<uint32_t>(ISAAC_ANM2_LOAD_LAYER_STAR_OR));
      }
    }
  }
  /* S6 — bitflags 0x800. */
  if (plan.bitflags_or_800 != 0) {
    uint8_t* flags = guest_mut_ptr(
        reinterpret_cast<uintptr_t>(anm2) + ISAAC_ANM2_OFF_BITFLAGS_110);
    store_u32(flags,
              load_u32(flags) | static_cast<uint32_t>(ISAAC_ANM2_LOAD_BITFLAG_800));
  }
}

/* ---- v51: ANM2::Load (0x0040bd50) frame laws (unit anm2-v51-load-depth;
   fresh decode, exact PE gates) ------------------------------------------- */

int32_t isaac_anm2_load_path_present(uint32_t filename_size) {
  /* PE 0x0040bd59 cmp dword ptr [esi+0x10],0 / je — FULL-DWORD: 0x100 /
     0xffffff00 count as present. */
  return filename_size != 0u ? 1 : 0;
}

int32_t isaac_anm2_load_path_is_self(uint32_t this_addr, uint32_t path_addr) {
  /* PE 0x0040bd68 cmp esi,edi / je — ADDRESS equality: self -> the assign
     (0x40ccd0) is skipped. */
  return this_addr == path_addr ? 1 : 0;
}

int32_t isaac_anm2_load_graphics_needed(uint32_t load_graphics) {
  /* PE 0x0040bd8e cmp byte ptr [ebp+0xc],0 / je — LOW-BYTE: 0x1ff /
     0xffffffff run the loader; 0x100 / 0xffffff00 have a CLEAR low byte and
     are skipped (the module owns the narrowing; the uint8_t-param trap is
     the harness pre-mask). */
  return (load_graphics & 0xffu) != 0u ? 1 : 0;
}

int32_t isaac_anm2_load_frame_host_calls(uint32_t filename_size,
                                         uint32_t this_addr,
                                         uint32_t path_addr,
                                         uint32_t load_graphics) {
  /* PE-order composed law: 4 unconditional (H3 cache guard 0x40db90, H4
     cache fetch 0x40e110, H6a/H6b anim applies 0x408830 x2) + H2 assign
     (NOT when path == this) + H1 prologue (filename size != 0) + H5
     graphics loader (loadgraphics low byte != 0). */
  return 4 +
         (isaac_anm2_load_path_is_self(this_addr, path_addr) == 0 ? 1 : 0) +
         (isaac_anm2_load_path_present(filename_size) != 0 ? 1 : 0) +
         (isaac_anm2_load_graphics_needed(load_graphics) != 0 ? 1 : 0);
}

int32_t isaac_anm2_load_latch_ready(uint32_t latch) {
  /* Caller one-shot arm gate 0x0082ee9e cmp byte ptr [edi+0x141],0 / jne:
     latch LOW BYTE set -> the arm is skipped (already-loaded). Ready iff the
     low byte is CLEAR. */
  return (latch & 0xffu) == 0u ? 1 : 0;
}

uint32_t isaac_anm2_load_latch_store_value(uint32_t latch_pre) {
  /* S1 0x0040bdb2 mov byte ptr [esi+0x109],1 — a BYTE store: the high
     bytes of the pre value are preserved (0x100 drive -> 0x101, matching
     the v77 lane (latch_pre & 0xffffff00) | 1). */
  return (latch_pre & 0xffffff00u) | 1u;
}

uint32_t isaac_anm2_load_layer_name_addr(const uint8_t* anm2,
                                         uint32_t layer_index) {
  if (anm2 == nullptr) {
    return 0u;
  }
  /* PE 0x0040bdd4: base [anm2+0x7c] re-read per iteration; element =
     base + i*0xa0 with 32-bit wrap. */
  const uint32_t base = load_u32(anm2 + ISAAC_ANM2_LOAD_OFF_LAYER_STATE_7C);
  const uint32_t layer =
      base + layer_index * static_cast<uint32_t>(ISAAC_ANM2_LOAD_LAYER_STRIDE);
  const uint32_t data = load_guest_u32(layer);
  if (data == 0u) {
    /* PE 0x0040bdef: null LayerData -> empty-name literal 0x00b1a4ec. */
    return static_cast<uint32_t>(ISAAC_ANM2_LOAD_EMPTY_NAME_VA);
  }
  /* PE 0x0040bde2..0x0040bdeb: name std::string at data+8, SSO-select. */
  return static_cast<uint32_t>(
      reinterpret_cast<uintptr_t>(sso_data(guest_ptr(data + ISAAC_ANM2_LOAD_OFF_NAME_8))));
}

uint32_t isaac_anm2_load_extra_name_addr(const uint8_t* anm2,
                                         uint32_t extra_index) {
  if (anm2 == nullptr) {
    return 0u;
  }
  /* PE 0x0040be6d: extras base [anm2+0x84] loaded ONCE (outside the loop,
     count-down `sub edx,1 / jne`); element = base + k*0x18, 32-bit wrap.
     NO null guard — the element itself is the std::string (PE 0x0040be73
     SSO-selects on it directly). */
  const uint32_t base = load_u32(anm2 + ISAAC_ANM2_LOAD_OFF_EXTRAS_PTR_84);
  const uint32_t elem =
      base + extra_index * static_cast<uint32_t>(ISAAC_ANM2_LOAD_EXTRA_STRIDE);
  return static_cast<uint32_t>(
      reinterpret_cast<uintptr_t>(sso_data(guest_ptr(elem))));
}

int32_t isaac_anm2_load_name_is_shadow(uint32_t name_addr) {
  /* PE 0x0040bdf4: two-byte unrolled strcmp vs the literal at 0x00b1a6c0.
     Consumes the exported strcmp primitive BY REFERENCE — never restated;
     the literal is compared as the C++ kShadowName static (the same bytes;
     the guest VA 0xb1a6c0 is carried by plan.shadow_str_va, never
     dereferenced — wasm linear memory does not map it). */
  return isaac_anm2_strcmp_inline(reinterpret_cast<const char*>(guest_ptr(name_addr)),
                                  kShadowName) == 0
             ? 1
             : 0;
}

int32_t isaac_anm2_load_name_is_star(uint32_t name_addr) {
  /* PE 0x0040be31 / 0x0040be7d: cmp byte ptr [...],0x2a — first char
     equals '*'. */
  return static_cast<uint8_t>(guest_ptr(name_addr)[0]) ==
                 static_cast<uint8_t>(ISAAC_ANM2_LOAD_STAR_CHAR)
             ? 1
             : 0;
}

/* ---- v52: 0x0040bc90 state anim-key getter (unit anm2-v52-getters; fresh
   decode, 0 E8 / 0 stores / 2 rets; callers 0x78afd3 + 0x78aff3) ---------- */

int32_t isaac_anm2_state_anim_key_dword(uint32_t state_addr) {
  /* PE 0x0040bc90 mov eax,[ecx+4] / test eax,eax / jne +5 / or eax,-1 / ret
     / mov eax,[eax+0x138] / ret — FULL-DWORD null test on the state's
     _animData (ISAAC_ANM2_STATE_OFF_ANIM_DATA_04; the same field as the
     ANM2+0x34 gate of v4/v19/v21/v24/v25 — 0x100 IS a live anim pointer and
     dereferences, NOT a low-byte fold). Null -> 0xffffffff (or eax,-1).
     Non-null -> the RAW first dword of the anim-record SSO key string at
     +0x138 (no cap test in this body; cap at +0x14c per the frame-opaque
     4214b0 law — KEY_DATA_OFF pins the same field). */
  const uint32_t anim =
      load_guest_u32(state_addr + static_cast<uint32_t>(ISAAC_ANM2_ANIM_KEY_DATA_OFF));
  if (anim == 0u) {
    return -1;
  }
  return static_cast<int32_t>(
      load_guest_u32(anim + static_cast<uint32_t>(ISAAC_ANM2_ANIM_KEY_RECORD_OFF)));
}

/* ---- v53: 0x00407ae0 Isaac::SwapANM2 (unit anm2-v53-swapanm2; fresh
   decode, 933 B / 0 E8 / 0 indirect / 8 branches / 70 mem-store insns /
   ret 0x00407e84; 19 lea-corrected direct callers, all capstone-verified).
   Field-pair exchange of two 0x114-byte ANM2 images in PE order. Byte
   fields are exchanged with the machine's 8-bit stores: the law reads them
   as uint32 masked with 0xff (byte-gate discipline — no uint8_t scalars)
   and stores the masked byte. The ColorMod blocks reproduce the machine's
   self-alias guard (left == right -> no copy) and write the saved left
   block back unconditionally (the PE's second guard compares the right
   block pointer against a frame-internal temp slot no guest address can
   equal). The layer loops re-read BOTH the array pointer and the count on
   every iteration, UNSIGNED bounds (jbe/jb) — the 0x407e30..0x407e7c
   machine shape, same re-read discipline as the v2 D11 advance loop. */

namespace {

inline void swap_anm2_field_dword(uint8_t* l, uint8_t* r, uint32_t off) {
  const uint32_t lv = load_u32(l + off);
  const uint32_t rv = load_u32(r + off);
  store_u32(l + off, rv);
  store_u32(r + off, lv);
}

inline void swap_anm2_field_byte(uint8_t* l, uint8_t* r, uint32_t off) {
  const uint32_t lv = load_u32(l + off) & 0xffu;
  const uint32_t rv = load_u32(r + off) & 0xffu;
  store_u8(l + off, static_cast<uint8_t>(rv));
  store_u8(r + off, static_cast<uint8_t>(lv));
}

inline void swap_anm2_ssos_block(uint8_t* l, uint8_t* r, uint32_t off) {
  /* 24 bytes: movups 16 + movq 8 per side (0x407ae3..0x407b06 / 0x407b0b..
     0x407b2a). Both sides are fully read before any write, like the
     machine's register save order. */
  uint32_t saved[6];
  for (uint32_t k = 0u; k < 6u; ++k) {
    saved[k] = load_u32(l + off + 4u * k);
  }
  for (uint32_t k = 0u; k < 6u; ++k) {
    store_u32(l + off + 4u * k, load_u32(r + off + 4u * k));
  }
  for (uint32_t k = 0u; k < 6u; ++k) {
    store_u32(r + off + 4u * k, saved[k]);
  }
}

inline void swap_anm2_colormod(uint8_t* l, uint8_t* r, uint32_t off) {
  /* 44 bytes (11 dwords) at +0xa8 / +0xd4. PE: saved left held in regs;
     cmp edi,ecx ; je skips the right->left copy (self-swap); the write-back
     guard compares the right pointer against a frame-internal temp slot. */
  uint32_t saved[11];
  for (uint32_t k = 0u; k < 11u; ++k) {
    saved[k] = load_u32(l + off + 4u * k);
  }
  if (l + off != r + off) {
    for (uint32_t k = 0u; k < 11u; ++k) {
      store_u32(l + off + 4u * k, load_u32(r + off + 4u * k));
    }
  }
  for (uint32_t k = 0u; k < 11u; ++k) {
    store_u32(r + off + 4u * k, saved[k]);
  }
}

inline void swap_anm2_layer_owners(uint8_t* img, uint32_t self_addr) {
  /* 0x407e30..0x407e7c: cmp [img+0x80],0 ; jbe exit — UNSIGNED entry; loop
     body re-reads [img+0x7c] (array) and [img+0x80] (count) EVERY
     iteration; store [array + i*0xa0 + 4] = owner; loop-back cmp i,[count]
     ; jb — UNSIGNED. Left loop (ref esi) then right loop (ref edx). */
  uint32_t i = 0u;
  uint32_t n =
      load_u32(img + static_cast<uint32_t>(ISAAC_ANM2_OFF_LAYER_COUNT_80));
  while (i < n) {
    const uint32_t arr =
        load_u32(img + static_cast<uint32_t>(ISAAC_ANM2_OFF_LAYER_STATE_7C));
    ++i;
    /* lea ecx,[ecx+0xa0] / inc edi / mov [eax+ecx-0x9c],esi — element
       (i-1) base + 0x04. */
    store_u32(guest_mut_ptr(arr + (i - 1u) *
                                static_cast<uint32_t>(ISAAC_ANM2_LAYER_STATE_STRIDE) +
                            static_cast<uint32_t>(ISAAC_ANM2_SWAP_LAYER_OWNER_OFF)),
              self_addr);
    n = load_u32(img +
                 static_cast<uint32_t>(ISAAC_ANM2_OFF_LAYER_COUNT_80));
  }
}

}  // namespace

void isaac_anm2_swap_anm2(uint32_t left_addr, uint32_t right_addr) {
  uint8_t* const l = guest_mut_ptr(left_addr);
  uint8_t* const r = guest_mut_ptr(right_addr);

  /* 1. SSO string blocks: _filename (0x00..0x18), _animDefaultName
     (0x18..0x30) — whole 24-byte register-block swaps. */
  swap_anm2_ssos_block(l, r,
                       static_cast<uint32_t>(ISAAC_ANM2_OFF_FILENAME_STR_00));
  swap_anm2_ssos_block(l, r,
                       static_cast<uint32_t>(ISAAC_ANM2_OFF_ANIM_NAME_STR_18));

  /* 2. Primary AnimationState dwords/byte (0x30 header NOT swapped —
     _animation stays with its object). */
  swap_anm2_field_dword(
      l, r, static_cast<uint32_t>(ISAAC_ANM2_OFF_ANIM_DATA_PTR_34));
  swap_anm2_field_dword(
      l, r, static_cast<uint32_t>(ISAAC_ANM2_SWAP_STATE_FRAMES_OFF));
  swap_anm2_field_dword(
      l, r, static_cast<uint32_t>(ISAAC_ANM2_SWAP_STATE_NULL_OFF));
  swap_anm2_field_dword(
      l, r, static_cast<uint32_t>(ISAAC_ANM2_SWAP_STATE_FRAME_OFF));
  swap_anm2_field_byte(
      l, r, static_cast<uint32_t>(ISAAC_ANM2_OFF_PLAYING_FLAG_44));
  swap_anm2_field_dword(
      l, r, static_cast<uint32_t>(ISAAC_ANM2_SWAP_STATE_18_OFF));
  swap_anm2_field_dword(
      l, r, static_cast<uint32_t>(ISAAC_ANM2_SWAP_STATE_1C_OFF));

  /* 3. Overlay AnimationState dwords/byte (0x50 header NOT swapped). */
  swap_anm2_field_dword(
      l, r, static_cast<uint32_t>(ISAAC_ANM2_SWAP_OVERLAY_DATA_OFF));
  swap_anm2_field_dword(
      l, r, static_cast<uint32_t>(ISAAC_ANM2_SWAP_OVERLAY_FRAMES_OFF));
  swap_anm2_field_dword(
      l, r, static_cast<uint32_t>(ISAAC_ANM2_SWAP_OVERLAY_NULL_OFF));
  swap_anm2_field_dword(
      l, r, static_cast<uint32_t>(ISAAC_ANM2_SWAP_OVERLAY_FRAME_OFF));
  swap_anm2_field_byte(
      l, r, static_cast<uint32_t>(ISAAC_ANM2_SWAP_OVERLAY_BYTE_OFF));
  swap_anm2_field_dword(
      l, r, static_cast<uint32_t>(ISAAC_ANM2_SWAP_OVERLAY_18_OFF));
  swap_anm2_field_dword(
      l, r, static_cast<uint32_t>(ISAAC_ANM2_SWAP_OVERLAY_1C_OFF));

  /* 4. AnimationData pointers / counts / extras quads (0x70..0x73 NOT
     swapped — _overlayRenderFirst + padding). */
  swap_anm2_field_dword(
      l, r, static_cast<uint32_t>(ISAAC_ANM2_OFF_ANIM_DATA_74));
  swap_anm2_field_dword(
      l, r, static_cast<uint32_t>(ISAAC_ANM2_OFF_ANIM_COUNT_78));
  swap_anm2_field_dword(
      l, r, static_cast<uint32_t>(ISAAC_ANM2_OFF_LAYER_STATE_7C));
  swap_anm2_field_dword(
      l, r, static_cast<uint32_t>(ISAAC_ANM2_OFF_LAYER_COUNT_80));
  swap_anm2_field_dword(
      l, r, static_cast<uint32_t>(ISAAC_ANM2_SWAP_EXTRAS_PTR_OFF));
  swap_anm2_field_dword(
      l, r, static_cast<uint32_t>(ISAAC_ANM2_SWAP_EXTRAS_COUNT_OFF));
  swap_anm2_field_dword(
      l, r, static_cast<uint32_t>(ISAAC_ANM2_SWAP_EXTRAS_PTR2_OFF));
  swap_anm2_field_dword(
      l, r, static_cast<uint32_t>(ISAAC_ANM2_SWAP_EXTRAS_COUNT2_OFF));

  /* 5. Scale vector + rotation (movss; 0x94/0x98 _offset NOT swapped). */
  swap_anm2_field_dword(
      l, r, static_cast<uint32_t>(ISAAC_ANM2_OFF_SCALE_9C));
  swap_anm2_field_dword(l, r,
                        static_cast<uint32_t>(ISAAC_ANM2_OFF_SCALE_9C) + 4u);
  swap_anm2_field_dword(
      l, r, static_cast<uint32_t>(ISAAC_ANM2_OFF_ROTATION_A4));

  /* 6. ColorMod pair (44-byte guarded blocks). */
  swap_anm2_colormod(
      l, r, static_cast<uint32_t>(ISAAC_ANM2_OFF_COLOR_A8));
  swap_anm2_colormod(
      l, r, static_cast<uint32_t>(ISAAC_ANM2_OFF_CHAMPION_COLOR_D4));

  /* 7. Tail: flip pair (BYTES 0x100/0x101 — pads 0x102..0x103 NOT swapped
     per PE 0x407d7e..0x407d9a), playback speed (movss dword), loaded pair
     (BYTES), unnamed 0x10c dword, bitflags dword. */
  swap_anm2_field_byte(
      l, r, static_cast<uint32_t>(ISAAC_ANM2_OFF_FLIP_PAIR_100));
  swap_anm2_field_byte(
      l, r, static_cast<uint32_t>(ISAAC_ANM2_OFF_FLIP_PAIR_100) + 1u);
  swap_anm2_field_dword(
      l, r, static_cast<uint32_t>(ISAAC_ANM2_OFF_PLAYBACK_SPEED_104));
  swap_anm2_field_byte(
      l, r, static_cast<uint32_t>(ISAAC_ANM2_OFF_LOADED_PAIR_108));
  swap_anm2_field_byte(
      l, r, static_cast<uint32_t>(ISAAC_ANM2_OFF_LOADED_BYTE_109));
  swap_anm2_field_dword(
      l, r, static_cast<uint32_t>(ISAAC_ANM2_OFF_UNNAMED_10C));
  swap_anm2_field_dword(
      l, r, static_cast<uint32_t>(ISAAC_ANM2_OFF_BITFLAGS_110));

  /* 8. Layer owner fix-up: every element's +0x04 back-pointer re-points at
     its own object (left loop first, then right — the PE esi loop at
     0x407e30 then the edx loop at 0x407e59). */
  swap_anm2_layer_owners(l, left_addr);
  swap_anm2_layer_owners(r, right_addr);
}

/* ================= v54-cache: filename-cache family (unit anm2-v54-cache) ===== */

/* 0x00a159d0 — the machine's OWN filename key hash (PURE leaf, 0 calls).
   Per byte: 'A'..'Z' lowered (+0x20), then '\\' -> '/'; h = h*33 + c (u32
   wrap); seed 0x1505; null pointer -> 0 (0xa159d7). Byte reads are
   bit-masked loads (byte-gate discipline, no uint8_t scalars). */
uint32_t isaac_anm2_filename_hash(const uint8_t* name_guest) {
  const uint8_t* p = name_guest;
  if (p == nullptr) {
    return 0u;
  }
  uint32_t h = ISAAC_ANM2_FILENAME_HASH_SEED;
  for (;;) {
    const uint32_t c =
        load_u32(p) & 0xffu; /* raw byte, no sign/zero extension */
    if (c == 0u) {
      break;
    }
    p++; /* the machine keeps a separate pointer and reads [esi-1] */
    uint32_t c1 = c;
    if ((c - static_cast<uint32_t>('A')) <=
        static_cast<uint32_t>('Z' - 'A')) {
      c1 = c + ISAAC_ANM2_FILENAME_HASH_CASE_DELTA;
    }
    if (c1 == ISAAC_ANM2_FILENAME_HASH_BACKSLASH) {
      c1 = ISAAC_ANM2_FILENAME_HASH_SLASH;
    }
    h = h * 33u + c1;
  }
  return h;
}

/* The per-probe found decision (transcribed at 0x40e6fb..0x40e710 /
   0x40ebac..0x40ebbb / 0x40eca6..0x40ecb9): found iff
   node != container_end && byte[node+0xd] == 0 && key >= u32[node+0x10].
   +0xd is the tree _Isnil flag (set on the end sentinel), +0x10 the key
   dword; the >= direction is the machine's `cmp key,[node+0x10] ; jae`
   (lower_bound guarantees node_key >= key, so equality is "not below"). */
int32_t isaac_anm2_cache_probe_found(uint32_t node, uint32_t key,
                                     uint32_t container_end) {
  if (node == container_end) {
    return 0;
  }
  const uint32_t isnil =
      load_guest_u32(node + static_cast<uint32_t>(ISAAC_ANM2_MAP_NODE_ISNIL_OFF)) &
      0xffu;
  if (isnil != 0u) {
    return 0;
  }
  const uint32_t node_key =
      load_guest_u32(node + static_cast<uint32_t>(ISAAC_ANM2_MAP_NODE_KEY_OFF));
  return key >= node_key ? 1 : 0;
}

/* 0x0040e5d0 step 3 — the cache slot scan. slot_count = (end-begin)>>2
   (u32; wrapped end<begin yields no slots: the machine's entry compare is
   `cmp esi,edx ; je` and the loop back re-reads [0xc798bc] every
   iteration). Probes in order, stop at the FIRST found slot; probe keys
   and nodes are HOST results (normalize + map walk) fed in slot order.
   probe_avail bounds the scan (documented harness bound; real call sites
   feed one outcome per slot). */
void isaac_anm2_cache_find_scan(uint32_t cache_begin, uint32_t cache_end,
                                const uint32_t* probe_keys,
                                const uint32_t* probe_nodes,
                                uint32_t probe_avail,
                                uint32_t container_end,
                                IsaacAnm2CacheFindScan* out) {
  IsaacAnm2CacheFindScan plan;
  plan.probe_stride = ISAAC_ANM2_CACHE_PROBE_STRIDE;
  plan.slot_count = 0u;
  plan.probed = 0u;
  plan.found = 0;
  plan.found_slot = 0u;
  if (cache_end >= cache_begin) {
    plan.slot_count = (cache_end - cache_begin) >> 2;
  }
  uint32_t probes = plan.slot_count;
  if (probes > probe_avail) {
    probes = probe_avail;
  }
  uint32_t i = 0u;
  while (i < probes) {
    const uint32_t key = probe_keys[i];
    const uint32_t node = probe_nodes[i];
    if (isaac_anm2_cache_probe_found(node, key, container_end) != 0) {
      plan.probed = i + 1u;
      plan.found = 1;
      plan.found_slot = i;
      *out = plan;
      return;
    }
    i++;
  }
  plan.probed = i;
  *out = plan;
}

/* 0x0040e5d0 step 1 / 0x0040ea50 step 2 — the maintenance GATE:
   (end - begin) & 0xfffffffc == 0, i.e. (end - begin) < 4 (u32). The
   FIND body tests `test eax,0xfffffffc ; jne skip`, the LOAD body
   `cmp eax,4 ; jae skip` — instruction-level different, one law. */
int32_t isaac_anm2_cache_maintenance_gate(uint32_t cache_begin,
                                          uint32_t cache_end) {
  const uint32_t span = cache_end - cache_begin; /* u32 wrap */
  return (span & ISAAC_ANM2_CACHE_MAINT_GATE_MASK) == 0u ? 1 : 0;
}

/* The maintenance store-back (0x40e64b..0x40e666 / 0x40eaef..0x40eb0c):
   when the host pop returns a node != the cache-head sentinel 0xc798b8
   (a CONSTANT in the machine), the three cache dwords are copied from
   the popped node and the popped node's three dwords are zeroed. cache
   points at the 12-byte global block 0xc798b8..0xc798c0. The pop node
   itself is a HOST result. */
void isaac_anm2_cache_maintenance_apply(uint32_t pop_node, uint8_t* cache) {
  if (pop_node == ISAAC_ANM2_CACHE_SLOTS_VA) {
    return;
  }
  uint8_t* const node = guest_mut_ptr(pop_node);
  for (uint32_t k = 0u; k < 3u; k++) {
    const uint32_t v = load_u32(node + k * 4u);
    store_u32(cache + k * 4u, v);
  }
  for (uint32_t k = 0u; k < 3u; k++) {
    store_u32(node + k * 4u, 0u);
  }
}

/* 0x0040ea10 — the load-one gate law. FIND(name) runs always (host);
   find_found == 0 -> the host block (query 0x6fd350, LoadImage
   0x9588a0, APPLY_ANIM 0x40e520) runs — the APPLY_ANIM STORE CONDITION.
   All three host VAs are pinned; the receiver global feeds ecx. */
void isaac_anm2_load_one_plan(uint32_t name_addr, int32_t find_found,
                              IsaacAnm2LoadOnePlan* out) {
  IsaacAnm2LoadOnePlan plan;
  plan.entered = 1;
  plan.found = find_found != 0 ? 1 : 0;
  plan.skip = plan.found;
  plan.name_addr = name_addr;
  plan.find_count = 1;
  plan.query_count = plan.skip ? 0 : 1;
  plan.load_count = plan.skip ? 0 : 1;
  plan.apply_count = plan.skip ? 0 : 1;
  plan.find_va = ISAAC_ANM2_CACHE_FIND_VA;
  plan.query_va = 0x006fd350u;
  plan.load_image_va = ISAAC_ANM2_LOADGRAPHICS_LOAD_IMAGE_VA;
  plan.apply_va = ISAAC_ANM2_APPLY_ANIM_VA;
  plan.receiver_global = ISAAC_ANM2_CACHE_RECEIVER_GLOBAL;
  *out = plan;
}

/* 0x0040ea50 — the load-into-map decision law, 0x40ea50..0x40ed47:
   1. byte[name] == 0 -> early exit (byte-gate, cmp byte ptr [eax],0);
   2. maintenance gate ((end-begin) < 4);
   3. slot scan (container end sentinel = [0xc78ee0]);
   4. not found -> INSERT host 0x40ed50 + RE-FIND with the last probe key
      (0 when no slot was probed — D-v54-1: the empty-cache re-find
      misses and the layer loop is skipped that call);
   5. layer loop on the found node: base+0x18 / count+0x1c RE-READ per
      iteration, UNSIGNED bounds, stride 0x38, name SSO slot at +0x20
      (cap at slot+0x14), per-layer FIND flags (host) feed the APPLY
      condition (pair = LoadImage + APPLY_ANIM when the flag is 0). */
void isaac_anm2_load_map_plan(const uint8_t* name,
                              uint32_t cache_begin, uint32_t cache_end,
                              const uint32_t* probe_keys,
                              const uint32_t* probe_nodes,
                              uint32_t probe_avail, uint32_t container_end,
                              uint32_t refind_node, uint32_t refind_key,
                              const uint32_t* layer_found,
                              uint32_t layer_avail,
                              IsaacAnm2LoadMapPlan* out) {
  IsaacAnm2LoadMapPlan plan;
  plan.entered = 1;
  plan.empty_gate = 0;
  plan.maintenance_gate = 0;
  plan.slot_count = 0u;
  plan.probed = 0u;
  plan.cache_found = 0;
  plan.cache_found_slot = 0u;
  plan.insert = 0;
  plan.refind_found = 0;
  plan.refind_node = refind_node;
  plan.refind_key = refind_key;
  plan.container_end = container_end;
  plan.node_base = 0u;
  plan.node_count = 0u;
  plan.layers_scanned = 0u;
  plan.load_pair_count = 0;
  plan.apply_count = 0;
  plan.skipped_layers = 0;
  plan.insert_va = ISAAC_ANM2_INSERT_VA;
  plan.find_va = ISAAC_ANM2_CACHE_FIND_VA;
  plan.load_image_va = ISAAC_ANM2_LOADGRAPHICS_LOAD_IMAGE_VA;
  plan.apply_va = ISAAC_ANM2_APPLY_ANIM_VA;
  plan.query_va = 0x006fd350u;
  plan.receiver_global = ISAAC_ANM2_CACHE_RECEIVER_GLOBAL;
  plan.layer_stride = ISAAC_ANM2_LOADMAP_LAYER_STRIDE;
  plan.layer_name_off = ISAAC_ANM2_LOADMAP_LAYER_NAME_OFF;
  plan.layer_cap_off = ISAAC_ANM2_LOADMAP_LAYER_CAP_OFF;
  plan.cache_slots_va = ISAAC_ANM2_CACHE_SLOTS_VA;

  if (name == nullptr) {
    plan.entered = 0; /* harness convention: null image/name -> entered 0 */
    *out = plan;
    return;
  }
  const uint32_t first =
      load_u32(reinterpret_cast<const uint8_t*>(name)) & 0xffu;
  if (first == 0u) {
    plan.empty_gate = 1; /* early exit: nothing runs */
    *out = plan;
    return;
  }

  plan.maintenance_gate =
      isaac_anm2_cache_maintenance_gate(cache_begin, cache_end);

  /* slot scan — the same law as the FIND scan, container 0xc78ee0. */
  if (cache_end >= cache_begin) {
    plan.slot_count = (cache_end - cache_begin) >> 2;
  }
  uint32_t probes = plan.slot_count;
  if (probes > probe_avail) {
    probes = probe_avail;
  }
  uint32_t i = 0u;
  while (i < probes) {
    if (isaac_anm2_cache_probe_found(probe_nodes[i], probe_keys[i],
                                     container_end) != 0) {
      plan.cache_found = 1;
      plan.cache_found_slot = i;
      plan.probed = i + 1u;
      break;
    }
    i++;
  }
  if (plan.cache_found == 0) {
    plan.probed = i;
  }

  uint32_t node = 0u;
  if (plan.cache_found != 0) {
    node = probe_nodes[plan.cache_found_slot];
  } else {
    /* not found: host INSERT (0x40ed50) then RE-FIND (0x416490 + the same
       decision). refind_node/refind_key are the host outcomes, fed. */
    plan.insert = 1;
    plan.refind_found =
        isaac_anm2_cache_probe_found(refind_node, refind_key,
                                     container_end);
    if (plan.refind_found == 0) {
      *out = plan; /* D-v54-1 / still-missing: nothing applied */
      return;
    }
    node = refind_node;
  }

  /* layer loop — per-iteration re-reads of [node+0x18] / [node+0x1c],
     UNSIGNED bounds (jbe entry / jb loop-back), stride 0x38. */
  uint32_t count = 0u;
  uint32_t base = 0u;
  for (;;) {
    base = load_guest_u32(
        node + static_cast<uint32_t>(ISAAC_ANM2_MAP_NODE_LAYERS_OFF));
    count = load_guest_u32(
        node + static_cast<uint32_t>(ISAAC_ANM2_MAP_NODE_COUNT_OFF));
    if (count == 0u) {
      break; /* `cmp [esi+0x1c],0 ; jbe` — only 0 exits */
    }
    plan.node_base = base;
    plan.node_count = count;
    uint32_t scanned = count;
    if (scanned > layer_avail) {
      scanned = layer_avail;
    }
    plan.layers_scanned = scanned;
    for (uint32_t k = 0u; k < scanned; k++) {
      const uint32_t flag = layer_found[k] != 0u ? 1u : 0u;
      if (flag == 0u) {
        plan.load_pair_count++;
        plan.apply_count++;
      } else {
        plan.skipped_layers++;
      }
    }
    break;
  }
  *out = plan;
}

/* 0x0040ea50 layer loop — the per-layer name SSO-select
   (0x40ecd5..0x40ece3): slot = layers_guest + i*0x38 + 0x20 (u32 wrap);
   cap = u32[slot+0x14]; slot base = cap >= 0x10 ? u32[slot] : slot
   (UNSIGNED jb, strict: cap 0x10 is already heap). */
uint32_t isaac_anm2_loadmap_layer_name_addr(uint32_t layers_guest,
                                            uint32_t layer_index) {
  const uint32_t slot = layers_guest +
      layer_index * static_cast<uint32_t>(ISAAC_ANM2_LOADMAP_LAYER_STRIDE) +
      static_cast<uint32_t>(ISAAC_ANM2_LOADMAP_LAYER_NAME_OFF);
  const uint32_t cap =
      load_guest_u32(slot + static_cast<uint32_t>(ISAAC_ANM2_LOADMAP_LAYER_CAP_OFF));
  if (cap < static_cast<uint32_t>(ISAAC_ANM2_SSO_CAPACITY_THRESHOLD)) {
    return slot;
  }
  return load_guest_u32(slot);
}

/* ================= v55: 0x00407690 ANM2::construct_from_copy ===========
   (unit anm2-v55-407690; the machine transcription is in
   section-notes/anm2-v55-407690/NOTES.md §1 — 258 insns, 10 E8 + 2
   indirect, 75 stores, 11 branches, SEH 0xaf09d3, `ret 4` at 0x407a5d,
   40 windowed-capstone census callers). */

static void copy_anm2_block44(uint8_t* dst, const uint8_t* src) {
  for (unsigned k = 0u; k < 0x2cu; ++k) {
    dst[k] = src[k];
  }
}

/* Stage-3 alloc-size law (PE 0x40786b..0x40789b): size = count*0xa0 + 4
   (u32 wrap); on mul overflow the seto/neg/or chain saturates to
   0xffffffff and the +4 with setb wraps BACK to 0xffffffff (D-family
   defect, reproduced, not corrected). count == 0 -> size 4 (the count
   header alone — the machine's alloc still runs). */
uint32_t isaac_anm2_copyctor_alloc_size(uint32_t layer_count) {
  const uint32_t product = layer_count * 0xa0u;
  if (layer_count != 0u && product / layer_count != 0xa0u) {
    return 0xffffffffu; /* mul overflow: saturate; +4 wraps with setb */
  }
  return product + 4u;
}

/* 0x00407690 decision law. vector_base is the HOST alloc result + 4
   (0 when the allocator failed); alloc_pending := vector_base != 0.
   processed_count = (count != 0 && alloc_pending) ? count : 0 — the
   machine's UNSIGNED jbe fence (0x4078da) plus the alloc-null fold:
   the machine with alloc == 0 && count > 0 enters the layer loop with
   [dst+0x7c] == 0 and faults on the first element store (unobservable;
   folded to 0, v7 null-data family). All scalar values uint32; byte
   reads bit-masked (no uint8_t scalar variables — byte-gate
   discipline). */
void isaac_anm2_copyctor_plan(uint32_t dst_addr, uint32_t src_addr,
                              uint32_t vector_base,
                              IsaacAnm2CopyCtorPlan* out) {
  IsaacAnm2CopyCtorPlan plan;
  plan.entered = 0;
  plan.zeroed_7c = 0;
  plan.zeroed_94 = 0;
  plan.zeroed_98 = 0;
  plan.zeroed_110 = 0;
  plan.src_loaded = 0;
  plan.cache_fetch_count = 0;
  plan.layer_count = 0u;
  plan.alloc_size = 0u;
  plan.alloc_pending = 0;
  plan.vector_base = vector_base;
  plan.processed_count = 0;
  plan.string_ctor_count = 0;
  plan.state_ctor_count = 0;
  plan.alloc_count = 0;
  plan.vector_ctor_count = 0;
  plan.layer_string_assigns = 0;
  plan.layer_getter_count = 0;
  plan.kage_swap_count = 0;
  plan.notify_chain_count = 0;
  plan.cache_fetch_va = ISAAC_ANM2_COPYCTOR_CACHE_FETCH_VA;
  plan.layer_stride = ISAAC_ANM2_COPYCTOR_STRIDE;
  plan.layer_owner_off = ISAAC_ANM2_COPYCTOR_OWNER_OFF;
  plan.layer_sprite_pair_off = ISAAC_ANM2_COPYCTOR_PAIR_OFF;
  plan.layer_sprite_inner_off = ISAAC_ANM2_COPYCTOR_INNER_OFF;
  plan.registry_global_va = ISAAC_ANM2_COPYCTOR_REGISTRY_VA;

  if (dst_addr == 0u || src_addr == 0u) {
    *out = plan;
    return;
  }
  plan.entered = 1;
  plan.zeroed_7c = 1;   /* dword [dst+0x7c] = 0 (0x407724, pre-alloc) */
  plan.zeroed_94 = 1;   /* dword [dst+0x94] = 0 (0x407771) */
  plan.zeroed_98 = 1;   /* dword [dst+0x98] = 0 (0x407767, stored first) */
  plan.zeroed_110 = 1;  /* dword [dst+0x110] = 0 (0x407857) */
  plan.string_ctor_count = 2;  /* 0x40cf50 x2 (filename + animDefaultName) */
  plan.state_ctor_count = 2;   /* 0x4086e0 x2 (primary + overlay states) */
  plan.alloc_count = 1;        /* 0xa0f4e0 — runs even for count == 0 */

  const uint8_t* const src = guest_ptr(src_addr);
  plan.src_loaded =
      (load_u32(src + ISAAC_ANM2_COPYCTOR_LOADED_OFF) & 0xffu) != 0u ? 1 : 0;
  plan.cache_fetch_count = plan.src_loaded; /* host 0x40e110 when loaded */
  plan.layer_count = load_u32(src + ISAAC_ANM2_OFF_LAYER_COUNT_80);
  plan.alloc_size = isaac_anm2_copyctor_alloc_size(plan.layer_count);
  plan.alloc_pending = vector_base != 0u ? 1 : 0;
  plan.vector_ctor_count = plan.alloc_pending; /* 0xaef5c4 __ehvec_ctor */
  if (plan.layer_count != 0u && plan.alloc_pending != 0) {
    plan.processed_count = static_cast<int32_t>(plan.layer_count);
    plan.layer_string_assigns = plan.processed_count; /* 0x40ccd0 */
    plan.layer_getter_count = plan.processed_count;   /* 0x408590 */
    plan.kage_swap_count = plan.processed_count;      /* 0x40c3b0 */
    const uint32_t src_layers =
        load_u32(src + ISAAC_ANM2_OFF_LAYER_STATE_7C);
    for (uint32_t i = 0u; i < plan.layer_count; ++i) {
      const uint32_t sl =
          src_layers + i * static_cast<uint32_t>(ISAAC_ANM2_COPYCTOR_STRIDE);
      if (load_u32(guest_ptr(
              sl + static_cast<uint32_t>(ISAAC_ANM2_COPYCTOR_INNER_OFF))) !=
          0u) {
        ++plan.notify_chain_count; /* vtbl slot 3 + [0xc7163c] (host) */
      }
    }
  }
  *out = plan;
}

/* 0x00407690 pure store lane: Stage-1 scalar block (machine ORDER —
   incl. the pre-alloc [dst+0x7c] = 0 and the 0x98-before-0x94 zero
   pair) + the vector_base store + per-layer field copies for the first
   processed layers (stride 0xa0, u32 wrap; layer count RE-READ from
   [src+0x80] per iteration, UNSIGNED jb). Bytes: 8-bit stores with
   masked reads. Host effects (string/state ctors, cache fetch, string
   assigns, layer getter, KAGE swap, notify/registry chains, alloc) are
   NOT executed — the plan carries their accounting. */
void isaac_anm2_copyctor_apply(uint32_t dst_addr, uint32_t src_addr,
                               uint32_t vector_base) {
  if (dst_addr == 0u || src_addr == 0u) {
    return;
  }
  uint8_t* const dst = guest_mut_ptr(dst_addr);
  const uint8_t* const src = guest_ptr(src_addr);

  store_u8(dst + ISAAC_ANM2_OFF_OVERLAY_FIRST_70,
           static_cast<uint8_t>(
               load_u32(src + ISAAC_ANM2_OFF_OVERLAY_FIRST_70) & 0xffu));
  store_u32(dst + ISAAC_ANM2_OFF_ANIM_DATA_74,
            load_u32(src + ISAAC_ANM2_OFF_ANIM_DATA_74));
  store_u32(dst + ISAAC_ANM2_OFF_ANIM_COUNT_78,
            load_u32(src + ISAAC_ANM2_OFF_ANIM_COUNT_78));
  store_u32(dst + ISAAC_ANM2_OFF_LAYER_STATE_7C, 0u); /* pre-alloc */
  store_u32(dst + ISAAC_ANM2_OFF_LAYER_COUNT_80,
            load_u32(src + ISAAC_ANM2_OFF_LAYER_COUNT_80));
  store_u32(dst + ISAAC_ANM2_SWAP_EXTRAS_PTR_OFF,
            load_u32(src + ISAAC_ANM2_SWAP_EXTRAS_PTR_OFF));
  store_u32(dst + ISAAC_ANM2_SWAP_EXTRAS_COUNT_OFF,
            load_u32(src + ISAAC_ANM2_SWAP_EXTRAS_COUNT_OFF));
  store_u32(dst + ISAAC_ANM2_SWAP_EXTRAS_PTR2_OFF,
            load_u32(src + ISAAC_ANM2_SWAP_EXTRAS_PTR2_OFF));
  store_u32(dst + ISAAC_ANM2_SWAP_EXTRAS_COUNT2_OFF,
            load_u32(src + ISAAC_ANM2_SWAP_EXTRAS_COUNT2_OFF));
  store_u32(dst + ISAAC_ANM2_OFF_OFFSET_94 + 4u, 0u);  /* 0x98 (PE order) */
  store_u32(dst + ISAAC_ANM2_OFF_OFFSET_94, 0u);
  store_u32(dst + ISAAC_ANM2_OFF_SCALE_9C,
            load_u32(src + ISAAC_ANM2_OFF_SCALE_9C));
  store_u32(dst + ISAAC_ANM2_OFF_SCALE_9C + 4u,
            load_u32(src + ISAAC_ANM2_OFF_SCALE_9C + 4u));
  store_u32(dst + ISAAC_ANM2_OFF_ROTATION_A4,
            load_u32(src + ISAAC_ANM2_OFF_ROTATION_A4));
  copy_anm2_block44(dst + ISAAC_ANM2_OFF_COLOR_A8,
                    src + ISAAC_ANM2_OFF_COLOR_A8);
  copy_anm2_block44(dst + ISAAC_ANM2_OFF_CHAMPION_COLOR_D4,
                    src + ISAAC_ANM2_OFF_CHAMPION_COLOR_D4);
  store_u8(dst + ISAAC_ANM2_OFF_FLIP_PAIR_100,
           static_cast<uint8_t>(
               load_u32(src + ISAAC_ANM2_OFF_FLIP_PAIR_100) & 0xffu));
  store_u8(dst + ISAAC_ANM2_OFF_FLIP_PAIR_100 + 1u,
           static_cast<uint8_t>(
               load_u32(src + ISAAC_ANM2_OFF_FLIP_PAIR_100 + 1u) & 0xffu));
  store_u32(dst + ISAAC_ANM2_OFF_PLAYBACK_SPEED_104,
            load_u32(src + ISAAC_ANM2_OFF_PLAYBACK_SPEED_104));
  store_u8(dst + ISAAC_ANM2_OFF_LOADED_PAIR_108,
           static_cast<uint8_t>(
               load_u32(src + ISAAC_ANM2_OFF_LOADED_PAIR_108) & 0xffu));
  store_u8(dst + ISAAC_ANM2_OFF_LOADED_BYTE_109,
           static_cast<uint8_t>(
               load_u32(src + ISAAC_ANM2_OFF_LOADED_BYTE_109) & 0xffu));
  store_u32(dst + ISAAC_ANM2_OFF_UNNAMED_10C,
            load_u32(src + ISAAC_ANM2_OFF_UNNAMED_10C));
  store_u32(dst + ISAAC_ANM2_OFF_BITFLAGS_110, 0u);
  store_u32(dst + ISAAC_ANM2_OFF_LAYER_STATE_7C, vector_base);

  const uint32_t src_layers =
      load_u32(src + ISAAC_ANM2_OFF_LAYER_STATE_7C);
  const uint32_t count0 = load_u32(src + ISAAC_ANM2_OFF_LAYER_COUNT_80);
  if (count0 != 0u && vector_base != 0u) {
    uint32_t i = 0u; /* per-layer byte offset (stride 0xa0, u32 wrap) */
    for (;;) {
      const uint8_t* const sl = guest_ptr(src_layers + i);
      uint8_t* const dl = guest_mut_ptr(vector_base + i);

      store_u32(dl, load_u32(sl));
      store_u8(dl + 0x30u,
               static_cast<uint8_t>(load_u32(sl + 0x30u) & 0xffu));
      store_u8(dl + 0x31u,
               static_cast<uint8_t>(load_u32(sl + 0x31u) & 0xffu));
      store_u8(dl + 0x32u,
               static_cast<uint8_t>(load_u32(sl + 0x32u) & 0xffu));
      store_u8(dl + 0x33u,
               static_cast<uint8_t>(load_u32(sl + 0x33u) & 0xffu));
      store_u32(dl + 0x34u, load_u32(sl + 0x34u));
      store_u32(dl + 0x38u, load_u32(sl + 0x38u));
      store_u32(dl + 0x3cu, load_u32(sl + 0x3cu));
      store_u32(dl + 0x40u, load_u32(sl + 0x40u));
      store_u32(dl + 0x44u, load_u32(sl + 0x44u));
      if (reinterpret_cast<uintptr_t>(dl + 0x48u) !=
          reinterpret_cast<uintptr_t>(sl + 0x48u)) { /* self-guard 0x4079a0 */
        copy_anm2_block44(dl + 0x48u, sl + 0x48u);
      }
      store_u8(dl + 0x74u,
               static_cast<uint8_t>(load_u32(sl + 0x74u) & 0xffu));
      store_u32(dl + 0x78u, load_u32(sl + 0x78u));
      store_u32(dl + 0x7cu, load_u32(sl + 0x7cu));
      store_u32(dl + 0x80u, load_u32(sl + 0x80u));
      store_u32(dl + 0x84u, load_u32(sl + 0x84u));
      store_u32(dl + 0x88u, load_u32(sl + 0x88u));
      store_u32(dl + 0x8cu, load_u32(sl + 0x8cu));
      store_u32(dl + 0x90u, load_u32(sl + 0x90u));
      store_u32(dl + 0x94u, load_u32(sl + 0x94u));
      store_u32(dl + ISAAC_ANM2_COPYCTOR_OWNER_OFF, dst_addr); /* back-ptr */
      i += static_cast<uint32_t>(ISAAC_ANM2_COPYCTOR_STRIDE);
      if (!(i / static_cast<uint32_t>(ISAAC_ANM2_COPYCTOR_STRIDE) <
            load_u32(src + ISAAC_ANM2_OFF_LAYER_COUNT_80))) { /* UNSIGNED */
        break;
      }
    }
  }
}

/* 0x00407690 L2 string SSO-select (PE 0x40790b..0x407918): slot =
   layer + 8; len = u32[slot+0x10]; cap = u32[slot+0x14]; ptr =
   cap >= 0x10 ? u32[slot] : slot (UNSIGNED jb, strict). The assign
   0x40ccd0 that consumes (ptr, len) stays host. */
void isaac_anm2_copyctor_layer_string_src(uint32_t layer_addr,
                                          IsaacAnm2StringSrc* out) {
  IsaacAnm2StringSrc s;
  const uint32_t slot =
      layer_addr + static_cast<uint32_t>(ISAAC_ANM2_COPYCTOR_STR_OFF);
  const uint8_t* const p = guest_ptr(slot);
  s.len = load_u32(p + static_cast<uint32_t>(ISAAC_ANM2_COPYCTOR_STR_LEN_OFF));
  s.cap = load_u32(p + static_cast<uint32_t>(ISAAC_ANM2_COPYCTOR_STR_CAP_OFF));
  s.ptr =
      s.cap >= static_cast<uint32_t>(ISAAC_ANM2_SSO_CAPACITY_THRESHOLD)
          ? load_u32(p)
          : slot;
  *out = s;
}

void isaac_anm2_loadgraphics_plan(const uint8_t* anm2,
                                  IsaacAnm2LoadGraphicsPlan* out) {
  IsaacAnm2LoadGraphicsPlan plan;
  plan.entered = 0;
  plan.layer_count = 0u;
  plan.layers_guest = 0u;
  plan.processed_count = 0;
  plan.processed_first = -1;
  plan.processed_last = -1;
  plan.layer_stride = static_cast<uint32_t>(ISAAC_ANM2_LOAD_LAYER_STRIDE);
  plan.load_flag_off =
      static_cast<uint32_t>(ISAAC_ANM2_LOADGRAPHICS_FLAG_OFF);
  plan.clear_flag_off =
      static_cast<uint32_t>(ISAAC_ANM2_LOADGRAPHICS_CLEAR_OFF);
  plan.load_image_va =
      static_cast<uint32_t>(ISAAC_ANM2_LOADGRAPHICS_LOAD_IMAGE_VA);
  plan.host_call_count = 0;
  if (out != nullptr) {
    *out = plan;
  }
  if (anm2 == nullptr) {
    /* Harness convention (v6 walk plan): linear-0 posture, no reads. */
    return;
  }
  plan.entered = 1;
  const uint32_t count = load_u32(anm2 + ISAAC_ANM2_LOAD_OFF_LAYER_COUNT_80);
  plan.layer_count = count;
  /* The `cmp count,0 ; jbe` fence: only count 0 skips, and then [this+0x7c]
     is never loaded (the base read sits INSIDE the loop). */
  if (count == 0u) {
    if (out != nullptr) {
      *out = plan;
    }
    return;
  }
  uint32_t base = 0u;
  int32_t first = -1;
  int32_t last = -1;
  int32_t processed = 0;
  for (uint32_t i = 0; i < count; ++i) {
    base = load_u32(anm2 + ISAAC_ANM2_LOAD_OFF_LAYER_STATE_7C);
    const uint32_t layer = static_cast<uint32_t>(
        base + i * static_cast<uint32_t>(ISAAC_ANM2_LOAD_LAYER_STRIDE));
    if (load_u8(guest_ptr(layer + ISAAC_ANM2_LOADGRAPHICS_FLAG_OFF)) == 0u) {
      if (first < 0) {
        first = static_cast<int32_t>(i);
      }
      last = static_cast<int32_t>(i);
      processed += 1;
    }
  }
  plan.layers_guest = base;
  plan.processed_first = first;
  plan.processed_last = last;
  plan.processed_count = processed;
  plan.host_call_count = processed;
  if (out != nullptr) {
    *out = plan;
  }
}

void isaac_anm2_loadgraphics_apply(const uint8_t* anm2,
                                   const uint8_t* flags,
                                   IsaacAnm2LoadGraphicsPlan* out) {
  IsaacAnm2LoadGraphicsPlan plan;
  isaac_anm2_loadgraphics_plan(anm2, &plan);
  if (out != nullptr) {
    *out = plan;
  }
  if (anm2 == nullptr) {
    return;
  }
  if (flags == nullptr) {
    /* Harness convention: host load results absent -> no fabricated stores. */
    return;
  }
  const uint32_t count = plan.layer_count;
  uint32_t k = 0u;
  for (uint32_t i = 0; i < count; ++i) {
    const uint32_t base = load_u32(anm2 + ISAAC_ANM2_LOAD_OFF_LAYER_STATE_7C);
    const uint32_t layer = static_cast<uint32_t>(
        base + i * static_cast<uint32_t>(ISAAC_ANM2_LOAD_LAYER_STRIDE));
    if (load_u8(guest_ptr(layer + ISAAC_ANM2_LOADGRAPHICS_FLAG_OFF)) == 0u) {
      uint8_t* slot = guest_mut_ptr(layer);
      /* STORE A: byte[layer+0x30] = flag. The PE's flag is `mov byte
         [ebp-0x11], 1/0` — exactly 0 or 1 (`test al,al` on the host virtual
         result). A nonzero host byte therefore stores 1, never itself. */
      store_u8(slot + ISAAC_ANM2_LOADGRAPHICS_FLAG_OFF,
               load_u8(flags + k) != 0u ? 1u : 0u);
      /* STORE B: byte[layer+0x31] = 0. */
      store_u8(slot + ISAAC_ANM2_LOADGRAPHICS_CLEAR_OFF, 0u);
      k += 1;
    }
  }
}

void isaac_anm2_reload_plan(const uint8_t* anm2, IsaacAnm2ReloadPlan* out) {
  IsaacAnm2ReloadPlan plan;
  plan.entered = 0;
  plan.gate = 0;
  plan.gate_off = static_cast<uint32_t>(ISAAC_ANM2_RELOAD_GATE_OFF);
  plan.call_count = 0;
  plan.host_call_count = 0;
  plan.call0_va = static_cast<uint32_t>(ISAAC_ANM2_RELOAD_CALL0_VA);
  plan.call0_argc = ISAAC_ANM2_RELOAD_CALL0_ARGC;
  plan.call1_va = static_cast<uint32_t>(ISAAC_ANM2_RELOAD_CALL1_VA);
  plan.call1_argc = ISAAC_ANM2_RELOAD_CALL1_ARGC;
  plan.call2_va = static_cast<uint32_t>(ISAAC_ANM2_RELOAD_CALL2_VA);
  plan.call2_argc = ISAAC_ANM2_RELOAD_CALL2_ARGC;
  plan.receivers_anm2 = 1;
  plan.args_anm2 = 1;
  if (anm2 == nullptr) {
    if (out != nullptr) {
      *out = plan;
    }
    return;
  }
  plan.entered = 1;
  const uint32_t filename_size = load_u32(anm2 + ISAAC_ANM2_OFF_FILENAME_SIZE_10);
  plan.gate = filename_size != 0u ? 1 : 0;
  if (filename_size != 0u) {
    /* PE 0x40bea9 cmp dword [esi+0x10],0 ; je 0x40bec6 — size 0 returns
       BEFORE any of the three callee pushes. */
    plan.call_count = ISAAC_ANM2_RELOAD_CALL_COUNT;
    plan.host_call_count = ISAAC_ANM2_RELOAD_CALL_COUNT;
  }
  if (out != nullptr) {
    *out = plan;
  }
}

uint32_t isaac_anm2_next_toward_zero_f32_bits(uint32_t x_bits) {
  /* NaN passes through unchanged — unreachable from the cvtdq2ps callsite
     (harness convention shared with the oracle, see the header contract). */
  const uint32_t mag = x_bits & 0x7fffffffu;
  if (mag > 0x7f800000u) {
    /* NaN — unreachable from the cvtdq2ps callsite. Harness convention. */
    return x_bits;
  }
  if (mag == 0u) {
    /* nextafter returns y when x == y, and -0.0f == +0.0f. */
    return 0u;
  }
  return (x_bits & 0x80000000u) | (mag - 1u);
}

int32_t isaac_anm2_next_toward_zero_domain_ok(uint32_t x_bits) {
  return (x_bits & 0x7fffffffu) <= 0x7f800000u ? 1 : 0;
}

uint32_t isaac_anm2_minss_bits(uint32_t dst_bits, uint32_t mem_bits) {
  /* minss keeps dst ONLY on an ordered strictly-less compare. */
  const float a = __builtin_bit_cast(float, dst_bits);
  const float b = __builtin_bit_cast(float, mem_bits);
  return a < b ? dst_bits : mem_bits;
}

uint32_t isaac_anm2_frame_clamp_bits(int32_t length_30, uint32_t incoming_bits) {
  /* cvtdq2ps: round-to-nearest-even, always finite. */
  const float x = static_cast<float>(length_30);
  const uint32_t na =
      isaac_anm2_next_toward_zero_f32_bits(__builtin_bit_cast(uint32_t, x));
  return isaac_anm2_minss_bits(na, incoming_bits);
}

void isaac_anm2_advance_store_plan(int32_t length_30,
                                   uint32_t incoming_bits,
                                   IsaacAnm2AdvanceStorePlan* out) {
  if (out == nullptr) {
    return;
  }
  out->clamped_bits = isaac_anm2_frame_clamp_bits(length_30, incoming_bits);
  out->cleared_18 = 0;
  out->pre_walk_host_va =
      static_cast<uint32_t>(ISAAC_ANM2_HOST_VA_ADVANCE_PRE);
  out->store_frame_off =
      static_cast<int32_t>(ISAAC_ANM2_STATE_OFF_ANIM_FRAME_10);
  out->store_cleared_off =
      static_cast<int32_t>(ISAAC_ANM2_STATE_OFF_CLEARED_18);
}

int32_t isaac_anm2_advance_walk_enter(uint32_t count) {
  /* `cmp [data+off], esi ; jbe skip` with esi == 0 — unsigned. */
  return count != 0u ? 1 : 0;
}

int32_t isaac_anm2_advance_inner_ok(int32_t anim_data_null,
                                    int32_t index,
                                    int32_t count) {
  if (anim_data_null != 0) {
    return 0;
  }
  if (index < 0) {
    return 0;
  }
  return index < count ? 1 : 0;
}

int32_t isaac_anm2_advance_walk_continue(uint32_t next_index,
                                         uint32_t count_reloaded) {
  return next_index < count_reloaded ? 1 : 0;
}

void isaac_anm2_advance_walk_plan(int32_t which,
                                  int32_t anim_data_null,
                                  int32_t index,
                                  int32_t count,
                                  uint32_t count_reloaded,
                                  IsaacAnm2AdvanceWalkPlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t enter =
      isaac_anm2_advance_walk_enter(static_cast<uint32_t>(count));
  const int32_t inner =
      isaac_anm2_advance_inner_ok(anim_data_null, index, count);
  out->enter = enter;
  out->inner_ok = inner;
  out->log_needed = inner ? 0 : 1;
  /* The log falls through to the slot store and the body call (defect D8). */
  out->body_runs = enter;
  out->log_va = static_cast<uint32_t>(ISAAC_ANM2_HOST_VA_LOG);
  out->log_level = static_cast<int32_t>(ISAAC_ANM2_ADVANCE_LOG_LEVEL);
  out->log_str_va = static_cast<uint32_t>(ISAAC_ANM2_ADVANCE_LOG_STR_VA);
  out->slot_byte_offset =
      static_cast<uint32_t>(index) *
      static_cast<uint32_t>(ISAAC_ANM2_FRAME_SLOT_SIZE);
  out->body_va = which == ISAAC_ANM2_WALK_NULL
                     ? static_cast<uint32_t>(ISAAC_ANM2_HOST_VA_NULL_BODY)
                     : static_cast<uint32_t>(ISAAC_ANM2_HOST_VA_LAYER_BODY);
  out->continue_loop = isaac_anm2_advance_walk_continue(
      static_cast<uint32_t>(index) + 1u, count_reloaded);
}

uint32_t isaac_anm2_state_alloc_size(uint32_t count) {
  /* mul edi (edi == 4): edx:eax = count*4. seto cl ; neg ecx ; or ecx,eax. */
  const uint64_t wide = static_cast<uint64_t>(count) * 4u;
  const uint32_t low = static_cast<uint32_t>(wide);
  const uint32_t high = static_cast<uint32_t>(wide >> 32);
  return high != 0u ? 0xffffffffu : low;
}

uint32_t isaac_anm2_state_memset_size(uint32_t count) {
  /* shl ecx, 2 — plain 32-bit wrap, no saturation. */
  return static_cast<uint32_t>(count << 2);
}

int32_t isaac_anm2_state_size_disagrees(uint32_t count) {
  return isaac_anm2_state_alloc_size(count) !=
                 isaac_anm2_state_memset_size(count)
             ? 1
             : 0;
}

void isaac_anm2_state_apply_plan(int32_t layer_frames_08,
                                 int32_t null_frames_0c,
                                 int32_t data_null_initial,
                                 uint32_t layer_count_alloc,
                                 uint32_t layer_count_memset,
                                 int32_t data_null_after_first,
                                 uint32_t null_count_alloc,
                                 uint32_t null_count_memset,
                                 IsaacAnm2StateApplyPlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t free_layer = layer_frames_08 != 0 ? 1 : 0;
  const int32_t free_null = null_frames_0c != 0 ? 1 : 0;
  out->free_layer_frames = free_layer;
  out->free_null_frames = free_null;
  out->memset_fill = static_cast<int32_t>(ISAAC_ANM2_STATE_MEMSET_FILL);

  const int32_t data_ok = data_null_initial == 0 ? 1 : 0;
  const int32_t alloc_layer =
      (data_ok != 0 && layer_count_alloc != 0u) ? 1 : 0;
  out->alloc_layer = alloc_layer;
  out->alloc_layer_size =
      alloc_layer ? isaac_anm2_state_alloc_size(layer_count_alloc) : 0u;
  out->memset_layer_size =
      alloc_layer ? isaac_anm2_state_memset_size(layer_count_memset) : 0u;

  /* A zero layer count skips the first allocation but still falls into the
     second one; only a null animData ends the function early. The pointer is
     re-read after the first allocation, so its post-call value decides. */
  int32_t second_data_ok;
  if (data_ok == 0) {
    second_data_ok = 0;
  } else if (alloc_layer != 0) {
    second_data_ok = data_null_after_first == 0 ? 1 : 0;
  } else {
    second_data_ok = 1;
  }
  const int32_t alloc_null =
      (second_data_ok != 0 && null_count_alloc != 0u) ? 1 : 0;
  out->alloc_null = alloc_null;
  out->alloc_null_size =
      alloc_null ? isaac_anm2_state_alloc_size(null_count_alloc) : 0u;
  out->memset_null_size =
      alloc_null ? isaac_anm2_state_memset_size(null_count_memset) : 0u;

  out->host_call_count =
      free_layer + free_null + (alloc_layer ? 2 : 0) + (alloc_null ? 2 : 0);
}

void isaac_anm2_state_apply_tail_fields(uint8_t* state) {
  if (state == nullptr) {
    return;
  }
  /* VA 0x00408935..0x0040894e, reached from every path. */
  store_u32(state + ISAAC_ANM2_STATE_OFF_ANIM_FRAME_10,
            static_cast<uint32_t>(ISAAC_ANM2_STATE_APPLY_TAIL_FRAME_BITS));
  /* mov BYTE ptr [esi+0x14], 0 — defect D13: 0x15..0x17 survive. */
  store_u8(state + ISAAC_ANM2_STATE_OFF_TAIL_BYTE_14, 0u);
  store_u32(state + ISAAC_ANM2_STATE_OFF_TAIL_18, 0u);
  store_u32(state + ISAAC_ANM2_STATE_OFF_TAIL_1C, 0u);
}

uint32_t isaac_anm2_alloc_counter_block(uint32_t counter_head) {
  if (counter_head == 0u) {
    return static_cast<uint32_t>(ISAAC_ANM2_ALLOC_COUNTER_FIXED_VA);
  }
  return static_cast<uint32_t>(
      counter_head + static_cast<uint32_t>(ISAAC_ANM2_ALLOC_COUNTER_HEAD_OFF));
}

int32_t isaac_anm2_state_alt_count(int32_t data_null, int32_t raw_count) {
  return data_null != 0 ? 0 : raw_count;
}

int32_t isaac_anm2_state_alt_realloc_path(int32_t new_count) {
  /* test ebx,ebx ; jg — SIGNED greater than zero. */
  return new_count > 0 ? 1 : 0;
}

int32_t isaac_anm2_state_alt_memcpy_needed(int32_t old_count) {
  /* test eax,eax ; jle skip — SIGNED. */
  return old_count > 0 ? 1 : 0;
}

uint32_t isaac_anm2_state_alt_memcpy_size(int32_t old_count) {
  /* shl eax,2 — a 32-bit wrap of the OLD count, never min()'d against the new
     one (defect D15). */
  return static_cast<uint32_t>(old_count) << 2;
}

void isaac_anm2_state_alt_arm_plan(int32_t which,
                                   int32_t old_count,
                                   int32_t new_count,
                                   uint32_t slot_ptr,
                                   uint32_t counter_head,
                                   IsaacAnm2StateApplyAltArm* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t equal = old_count == new_count ? 1 : 0;
  const int32_t realloc_path =
      equal == 0 ? isaac_anm2_state_alt_realloc_path(new_count) : 0;
  const int32_t free_path = (equal == 0 && realloc_path == 0) ? 1 : 0;
  const int32_t slot_live = slot_ptr != 0u ? 1 : 0;

  out->counts_equal = equal;
  out->free_path = free_path;
  out->realloc_path = realloc_path;
  out->wrapper_free_call = (free_path != 0 && slot_live != 0) ? 1 : 0;
  out->release_old = (realloc_path != 0 && slot_live != 0) ? 1 : 0;
  /* The free arm nulls its own slot at 0x00408a12 / 0x00408ada. The realloc
     arm nulls its own slot only in arm 1, at 0x00408b63 — arm 0 has the SEH
     state restore there instead. */
  out->slot_zeroed =
      (out->wrapper_free_call != 0 ||
       (out->release_old != 0 && which == ISAAC_ANM2_ALT_ARM_NULL))
          ? 1
          : 0;
  out->alloc_size =
      realloc_path ? isaac_anm2_state_alloc_size(
                         static_cast<uint32_t>(new_count))
                   : 0u;
  /* lea ecx,[ebx*4] — wraps where the allocation size saturates (D16). */
  out->memset_size =
      realloc_path ? isaac_anm2_state_memset_size(
                         static_cast<uint32_t>(new_count))
                   : 0u;
  out->memcpy_needed =
      (realloc_path != 0 && isaac_anm2_state_alt_memcpy_needed(old_count) != 0)
          ? 1
          : 0;
  out->memcpy_size =
      out->memcpy_needed ? isaac_anm2_state_alt_memcpy_size(old_count) : 0u;
  out->counter_block = isaac_anm2_alloc_counter_block(counter_head);
  out->release_free_ptr =
      out->release_old
          ? static_cast<uint32_t>(
                slot_ptr -
                static_cast<uint32_t>(ISAAC_ANM2_ALLOC_BLOCK_HEADER_BIAS))
          : 0u;
  /* Defect D14: `mov dword ptr [esi+8], ebx` at BOTH 0x00408aa2 and
     0x00408b6a. Arm 1 writes the layer slot. */
  out->store_slot_off =
      realloc_path ? static_cast<uint32_t>(ISAAC_ANM2_ALT_STORE_SLOT_OFF) : 0u;
  out->host_call_count = out->wrapper_free_call +
                         (realloc_path ? 2 : 0) /* wrapper alloc + memset */
                         + out->memcpy_needed + out->release_old;
}

void isaac_anm2_state_apply_alt_plan(int32_t old_data_null,
                                     int32_t old_layer_count_raw,
                                     int32_t old_second_count_raw,
                                     int32_t new_data_null,
                                     int32_t new_layer_count_raw,
                                     int32_t new_second_count_raw,
                                     uint32_t slot_08,
                                     uint32_t slot_0c,
                                     uint32_t alloc0_result,
                                     uint32_t alloc1_result,
                                     uint32_t new_data_ptr,
                                     uint32_t counter_head,
                                     IsaacAnm2StateApplyAltPlan* out) {
  if (out == nullptr) {
    return;
  }
  /* All four counts are observed BEFORE any host call (0x0040899a..0x004089d7),
     so no arm re-reads them. */
  const int32_t old_n0 =
      isaac_anm2_state_alt_count(old_data_null, old_layer_count_raw);
  const int32_t new_n0 =
      isaac_anm2_state_alt_count(new_data_null, new_layer_count_raw);
  const int32_t old_n1 =
      isaac_anm2_state_alt_count(old_data_null, old_second_count_raw);
  const int32_t new_n1 =
      isaac_anm2_state_alt_count(new_data_null, new_second_count_raw);
  out->old_layer_count = old_n0;
  out->new_layer_count = new_n0;
  out->old_second_count = old_n1;
  out->new_second_count = new_n1;

  IsaacAnm2StateApplyAltArm arm0;
  IsaacAnm2StateApplyAltArm arm1;
  isaac_anm2_state_alt_arm_plan(ISAAC_ANM2_ALT_ARM_LAYER, old_n0, new_n0,
                                slot_08, counter_head, &arm0);
  isaac_anm2_state_alt_arm_plan(ISAAC_ANM2_ALT_ARM_NULL, old_n1, new_n1,
                                slot_0c, counter_head, &arm1);

  out->arm0_free_path = arm0.free_path;
  out->arm0_realloc_path = arm0.realloc_path;
  out->arm0_memcpy_needed = arm0.memcpy_needed;
  out->arm0_alloc_size = arm0.alloc_size;
  out->arm0_memset_size = arm0.memset_size;
  out->arm0_memcpy_size = arm0.memcpy_size;
  out->arm0_release_old = arm0.release_old;
  out->arm1_free_path = arm1.free_path;
  out->arm1_realloc_path = arm1.realloc_path;
  out->arm1_memcpy_needed = arm1.memcpy_needed;
  out->arm1_alloc_size = arm1.alloc_size;
  out->arm1_memset_size = arm1.memset_size;
  out->arm1_memcpy_size = arm1.memcpy_size;
  out->arm1_release_old = arm1.release_old;
  out->counter_block = isaac_anm2_alloc_counter_block(counter_head);

  /* Slot writes in PE order: arm 0 first, then arm 1, then state+0x04. */
  uint32_t v08 = slot_08;
  uint32_t v0c = slot_0c;
  if (arm0.wrapper_free_call != 0) {
    v08 = 0u;
  } else if (arm0.realloc_path != 0) {
    v08 = alloc0_result;
  }
  uint32_t clobbered = 0u;
  if (arm1.wrapper_free_call != 0) {
    v0c = 0u;
  } else if (arm1.realloc_path != 0) {
    /* Arm 1 zeroes its own slot only on the release path, but the slot is
       already zero when there is nothing to release, so 0x0c ends up null
       either way. The new buffer lands in 0x08 (defect D14). */
    v0c = 0u;
    clobbered = v08;
    v08 = alloc1_result;
  }
  out->final_08 = v08;
  out->final_0c = v0c;
  out->final_04 = new_data_ptr;
  out->clobbered_layer_ptr = clobbered;
  out->host_call_count = arm0.host_call_count + arm1.host_call_count;
}

uint32_t isaac_anm2_ucomiss_ah_test44(uint32_t a_bits, uint32_t b_bits) {
  const float a = __builtin_bit_cast(float, a_bits);
  const float b = __builtin_bit_cast(float, b_bits);
  /* ucomiss: unordered -> ZF=PF=CF=1; equal -> ZF=1, PF=0; otherwise all 0
     except CF for below. lahf puts ZF in bit 6 and PF in bit 2 of AH. */
  const bool unordered = !(a == a) || !(b == b);
  uint32_t ah = 0u;
  if (unordered) {
    ah |= static_cast<uint32_t>(ISAAC_ANM2_LAHF_ZF_BIT);
    ah |= static_cast<uint32_t>(ISAAC_ANM2_LAHF_PF_BIT);
  } else if (a == b) {
    ah |= static_cast<uint32_t>(ISAAC_ANM2_LAHF_ZF_BIT);
  }
  return ah & static_cast<uint32_t>(ISAAC_ANM2_LAHF_TEST_MASK);
}

int32_t isaac_anm2_ucomiss_eq_bits(uint32_t a_bits, uint32_t b_bits) {
  /* `test ah,0x44 ; jp skip` — jp fires on EVEN parity of the result byte, so
     control falls through only for an odd-popcount result. Of the three states
     ucomiss can produce (0x00, 0x40, 0x44) only 0x40 has odd popcount. */
  const uint32_t masked = isaac_anm2_ucomiss_ah_test44(a_bits, b_bits);
  uint32_t bits = masked;
  uint32_t parity = 0u;
  while (bits != 0u) {
    parity ^= bits & 1u;
    bits >>= 1;
  }
  return parity != 0u ? 1 : 0;
}

int32_t isaac_anm2_comiss_below_bits(uint32_t a_bits, uint32_t b_bits) {
  const float a = __builtin_bit_cast(float, a_bits);
  const float b = __builtin_bit_cast(float, b_bits);
  /* CF is set for "below" AND for unordered, which is exactly `!(a >= b)`. */
  return (a >= b) ? 0 : 1;
}

uint32_t isaac_anm2_bts_mask(uint32_t bit_index) {
  /* bts r32,r32 masks the offset to 5 bits (defect D21). */
  return 1u << (bit_index & static_cast<uint32_t>(ISAAC_ANM2_BTS_SHIFT_MASK));
}

uint32_t isaac_anm2_bts_apply(uint32_t value, uint32_t bit_index) {
  return value | isaac_anm2_bts_mask(bit_index);
}

void isaac_anm2_prewalk_apply(uint8_t* state, IsaacAnm2PreWalkPlan* out) {
  IsaacAnm2PreWalkPlan plan;
  plan.log_needed = 0;
  plan.log_va = static_cast<uint32_t>(ISAAC_ANM2_HOST_VA_LOG);
  plan.log_level = static_cast<int32_t>(ISAAC_ANM2_PREWALK_LOG_LEVEL);
  plan.log_str_va = static_cast<uint32_t>(ISAAC_ANM2_PREWALK_LOG_STR_VA);
  plan.faults_after_log = 0;
  plan.entered = 0;
  plan.count = 0u;
  plan.frame_bits = 0u;
  plan.matches = 0;
  plan.bits_18 = 0u;
  plan.bits_1c = 0u;
  plan.iterations = 0;
  if (state == nullptr) {
    if (out != nullptr) {
      *out = plan;
    }
    return;
  }

  /* mov edi,[esi+4] ; mov ebx,edi ; test edi,edi ; jne */
  uint32_t data = load_u32(state + ISAAC_ANM2_STATE_OFF_ANIM_DATA_04);
  if (data == 0u) {
    plan.log_needed = 1;
    /* The log is a diagnostic BEFORE the crash, not a guard (defect D26): the
       PE re-reads the same slot and then dereferences it unconditionally. */
    data = load_u32(state + ISAAC_ANM2_STATE_OFF_ANIM_DATA_04);
    if (data == 0u) {
      plan.faults_after_log = 1;
      if (out != nullptr) {
        *out = plan;
      }
      return;
    }
  }

  /* xor edx,edx ; cmp [ebx+0x2c],edx ; jbe — UNSIGNED against zero. */
  uint32_t count =
      load_guest_u32(data + static_cast<uint32_t>(
                                ISAAC_ANM2_DATA_OFF_TRIGGER_COUNT_2C));
  plan.count = count;
  if (count == 0u) {
    plan.bits_18 = load_u32(state + ISAAC_ANM2_STATE_OFF_TRIGGER_BITS_18);
    plan.bits_1c = load_u32(state + ISAAC_ANM2_STATE_OFF_TRIGGER_BITS_1C);
    if (out != nullptr) {
      *out = plan;
    }
    return;
  }
  plan.entered = 1;

  /* movss xmm1,[esi+0x10] — loaded ONCE, before the loop. */
  const uint32_t frame_bits =
      load_u32(state + ISAAC_ANM2_STATE_OFF_ANIM_FRAME_10);
  plan.frame_bits = frame_bits;

  uint32_t i = 0u;
  for (;;) {
    /* mov eax,[ebx+0x28] — re-read every iteration (defect D23). */
    const uint32_t list =
        load_guest_u32(data + static_cast<uint32_t>(
                                  ISAAC_ANM2_DATA_OFF_TRIGGER_LIST_28));
    const uint32_t elem =
        list + i * static_cast<uint32_t>(ISAAC_ANM2_TRIGGER_ELEM_STRIDE);
    const uint32_t time_bits = cvtdq2ps_bits(load_guest_u32(
        elem + static_cast<uint32_t>(ISAAC_ANM2_TRIGGER_ELEM_TIME_OFF)));
    if (isaac_anm2_ucomiss_eq_bits(time_bits, frame_bits) != 0) {
      /* Both halves re-read [data+0x28] and the id word independently. */
      const uint32_t list_a =
          load_guest_u32(data + static_cast<uint32_t>(
                                    ISAAC_ANM2_DATA_OFF_TRIGGER_LIST_28));
      const uint32_t id_a = load_guest_u32(
          list_a + i * static_cast<uint32_t>(ISAAC_ANM2_TRIGGER_ELEM_STRIDE) +
          static_cast<uint32_t>(ISAAC_ANM2_TRIGGER_ELEM_ID_OFF));
      store_u32(state + ISAAC_ANM2_STATE_OFF_TRIGGER_BITS_18,
                isaac_anm2_bts_apply(
                    load_u32(state + ISAAC_ANM2_STATE_OFF_TRIGGER_BITS_18),
                    id_a));
      const uint32_t list_b =
          load_guest_u32(data + static_cast<uint32_t>(
                                    ISAAC_ANM2_DATA_OFF_TRIGGER_LIST_28));
      const uint32_t id_b = load_guest_u32(
          list_b + i * static_cast<uint32_t>(ISAAC_ANM2_TRIGGER_ELEM_STRIDE) +
          static_cast<uint32_t>(ISAAC_ANM2_TRIGGER_ELEM_ID_OFF));
      store_u32(state + ISAAC_ANM2_STATE_OFF_TRIGGER_BITS_1C,
                isaac_anm2_bts_apply(
                    load_u32(state + ISAAC_ANM2_STATE_OFF_TRIGGER_BITS_1C),
                    id_b));
      plan.matches += 1;
    }
    plan.iterations += 1;
    i = i + 1u;
    /* cmp edx,[edi+0x2c] ; jb — UNSIGNED, count re-derived per iteration. */
    count = load_guest_u32(
        data + static_cast<uint32_t>(ISAAC_ANM2_DATA_OFF_TRIGGER_COUNT_2C));
    if (i >= count) {
      break;
    }
  }

  plan.bits_18 = load_u32(state + ISAAC_ANM2_STATE_OFF_TRIGGER_BITS_18);
  plan.bits_1c = load_u32(state + ISAAC_ANM2_STATE_OFF_TRIGGER_BITS_1C);
  if (out != nullptr) {
    *out = plan;
  }
}

void isaac_anm2_frame_walk_params(int32_t which,
                                  IsaacAnm2FrameWalkParams* out) {
  if (out == nullptr) {
    return;
  }
  if (which == ISAAC_ANM2_FRAME_WALK_NULL) {
    out->data_count_off = static_cast<uint32_t>(ISAAC_ANM2_W1_DATA_COUNT_OFF);
    out->state_frames_off =
        static_cast<uint32_t>(ISAAC_ANM2_W1_STATE_FRAMES_OFF);
    out->data_list_off = static_cast<uint32_t>(ISAAC_ANM2_W1_DATA_LIST_OFF);
    out->elem_stride = static_cast<uint32_t>(ISAAC_ANM2_W1_ELEM_STRIDE);
    out->elem_time_off = static_cast<uint32_t>(ISAAC_ANM2_W1_ELEM_TIME_OFF);
    out->list_count_off = static_cast<uint32_t>(ISAAC_ANM2_W1_LIST_COUNT_OFF);
    out->list_base_off = static_cast<uint32_t>(ISAAC_ANM2_W1_LIST_BASE_OFF);
  } else {
    out->data_count_off = static_cast<uint32_t>(ISAAC_ANM2_W0_DATA_COUNT_OFF);
    out->state_frames_off =
        static_cast<uint32_t>(ISAAC_ANM2_W0_STATE_FRAMES_OFF);
    out->data_list_off = static_cast<uint32_t>(ISAAC_ANM2_W0_DATA_LIST_OFF);
    out->elem_stride = static_cast<uint32_t>(ISAAC_ANM2_W0_ELEM_STRIDE);
    out->elem_time_off = static_cast<uint32_t>(ISAAC_ANM2_W0_ELEM_TIME_OFF);
    out->list_count_off = static_cast<uint32_t>(ISAAC_ANM2_W0_LIST_COUNT_OFF);
    out->list_base_off = static_cast<uint32_t>(ISAAC_ANM2_W0_LIST_BASE_OFF);
  }
  /* shl esi,4 in both siblings. */
  out->entry_stride = static_cast<uint32_t>(ISAAC_ANM2_FRAME_WALK_ENTRY_STRIDE);
}

void isaac_anm2_frame_walk_apply(int32_t which,
                                 uint8_t* state,
                                 int32_t index,
                                 uint32_t time_bits,
                                 IsaacAnm2FrameWalkPlan* out) {
  IsaacAnm2FrameWalkParams p;
  isaac_anm2_frame_walk_params(which, &p);

  IsaacAnm2FrameWalkPlan plan;
  plan.bound_ok = 0;
  plan.log_needed = 1;
  plan.log_va = static_cast<uint32_t>(ISAAC_ANM2_HOST_VA_LOG);
  plan.log_level = static_cast<int32_t>(ISAAC_ANM2_ADVANCE_LOG_LEVEL);
  plan.log_str_va = static_cast<uint32_t>(ISAAC_ANM2_ADVANCE_LOG_STR_VA);
  plan.recaptured = 0;
  plan.faults_at_list_base = 0;
  plan.frame_slot_ptr = 0u;
  plan.entry_ptr = 0u;
  plan.start_frame = 0;
  plan.final_frame = 0;
  plan.steps = 0;
  plan.stop_reason = static_cast<int32_t>(ISAAC_ANM2_WALK_STOP_NOT_ENTERED);
  if (state == nullptr) {
    if (out != nullptr) {
      *out = plan;
    }
    return;
  }

  uint32_t data = load_u32(state + ISAAC_ANM2_STATE_OFF_ANIM_DATA_04);
  /* test edx,edx ; je / test esi,esi ; js / cmp esi,[edx+off] ; jl — the same
     three-instruction shape 0x00408e00 uses, in a DIFFERENT body. Kept
     separate on purpose; the test asserts the two agree. */
  int32_t bound_ok = 0;
  if (data != 0u) {
    const int32_t count =
        static_cast<int32_t>(load_guest_u32(data + p.data_count_off));
    bound_ok = isaac_anm2_advance_inner_ok(0, index, count);
  }
  plan.bound_ok = bound_ok;
  plan.log_needed = bound_ok != 0 ? 0 : 1;
  if (bound_ok == 0) {
    /* mov edx,[edi+4] — recapture on the LOG PATH ONLY, plus the xmm reload
       from the stack spill (same value; the call clobbers the register). */
    data = load_u32(state + ISAAC_ANM2_STATE_OFF_ANIM_DATA_04);
    plan.recaptured = 1;
  }

  const uint32_t frames = load_u32(state + p.state_frames_off);
  const uint32_t slot =
      frames + static_cast<uint32_t>(index) *
                   static_cast<uint32_t>(ISAAC_ANM2_FRAME_WALK_SLOT_STRIDE);
  plan.frame_slot_ptr = slot;
  int32_t cur = static_cast<int32_t>(load_guest_u32(slot));
  plan.start_frame = cur;
  plan.final_frame = cur;

  /* shl esi,4 ; add esi,[edx+list_off] — index scaled with a 32-bit wrap and
     no clamp, using the (possibly recaptured) descriptor. The dereference is
     unconditional and precedes the `js` early return, so a null descriptor
     faults HERE and the stored frame never gets a chance to matter. */
  if (data == 0u) {
    plan.faults_at_list_base = 1;
    if (out != nullptr) {
      *out = plan;
    }
    return;
  }
  const uint32_t list_base = load_guest_u32(data + p.data_list_off);
  const uint32_t entry =
      list_base + (static_cast<uint32_t>(index) * p.entry_stride);
  plan.entry_ptr = entry;

  if (cur < 0) {
    plan.stop_reason = static_cast<int32_t>(ISAAC_ANM2_WALK_STOP_NOT_ENTERED);
    if (out != nullptr) {
      *out = plan;
    }
    return;
  }

  /* imul edx,ecx,STRIDE — 32-bit wrap. */
  uint32_t off = static_cast<uint32_t>(cur) * p.elem_stride;
  for (;;) {
    cur = static_cast<int32_t>(static_cast<uint32_t>(cur) + 1u); /* inc */
    const int32_t list_count =
        static_cast<int32_t>(load_guest_u32(entry + p.list_count_off));
    if (cur >= list_count) { /* jge — SIGNED */
      plan.stop_reason = static_cast<int32_t>(ISAAC_ANM2_WALK_STOP_COUNT);
      break;
    }
    const uint32_t base = load_guest_u32(entry + p.list_base_off);
    const uint32_t t =
        cvtdq2ps_bits(load_guest_u32(base + off + p.elem_time_off));
    if (isaac_anm2_comiss_below_bits(time_bits, t) != 0) { /* jb */
      plan.stop_reason = static_cast<int32_t>(ISAAC_ANM2_WALK_STOP_TIME);
      break;
    }
    off = off + p.elem_stride;
    /* The store happens BEFORE the negative test (defect D24). */
    store_u32(guest_mut_ptr(slot), static_cast<uint32_t>(cur));
    plan.steps += 1;
    plan.final_frame = cur;
    if (cur < 0) { /* jns failed */
      plan.stop_reason = static_cast<int32_t>(ISAAC_ANM2_WALK_STOP_WRAPPED);
      break;
    }
  }

  if (out != nullptr) {
    *out = plan;
  }
}

uint32_t isaac_anm2_floor_f32_bits(uint32_t x_bits) {
  const uint32_t bits = x_bits;
  const uint32_t sign = bits >> 31;
  const uint32_t exp = (bits >> 23) & 0xffu;
  const uint32_t frac = bits & 0x7fffffu;
  if (exp == 0xffu) {
    return bits;
  }
  if (bits == 0u || bits == 0x80000000u) {
    return bits;
  }
  if (exp >= 150u) {
    return bits;
  }
  if (exp < 127u) {
    return sign != 0u ? 0xbf800000u : 0u;
  }
  const uint32_t shift = 150u - exp;
  const uint32_t mask = (1u << shift) - 1u;
  const uint32_t truncated = bits & ~mask;
  if (sign != 0u && (frac & mask) != 0u) {
    return truncated + (1u << shift);
  }
  return truncated;
}

int32_t isaac_anm2_cvttss2si_bits(uint32_t f_bits) {
  const float f = __builtin_bit_cast(float, f_bits);
  if (!(f == f) || f >= 2147483648.0f || f < -2147483648.0f) {
    return static_cast<int32_t>(ISAAC_ANM2_CVTTSS2SI_INDEFINITE);
  }
  return static_cast<int32_t>(f);
}

int32_t isaac_anm2_comiss_jbe_bits(uint32_t a_bits, uint32_t b_bits) {
  const float a = __builtin_bit_cast(float, a_bits);
  const float b = __builtin_bit_cast(float, b_bits);
  return (a > b) ? 0 : 1;
}

int32_t isaac_anm2_comiss_ja_bits(uint32_t a_bits, uint32_t b_bits) {
  const float a = __builtin_bit_cast(float, a_bits);
  const float b = __builtin_bit_cast(float, b_bits);
  return (a > b) ? 1 : 0;
}

int32_t isaac_anm2_play_gate_skip(int32_t reset_flag,
                                  int32_t data_null,
                                  int32_t name_equal,
                                  int32_t data_34_flag,
                                  int32_t state_44_flag) {
  if ((static_cast<uint32_t>(reset_flag) & 0xffu) != 0u) {
    return 0;
  }
  if (data_null != 0) {
    return 0;
  }
  if (name_equal == 0) {
    return 0;
  }
  if ((static_cast<uint32_t>(data_34_flag) & 0xffu) != 0u &&
      (static_cast<uint32_t>(state_44_flag) & 0xffu) == 0u) {
    return 0;
  }
  return 1;
}

void isaac_anm2_play_plan(uint8_t* anm2,
                          uint32_t name_addr,
                          int32_t reset_flag,
                          IsaacAnm2PlayPlan* out) {
  IsaacAnm2PlayPlan plan;
  plan.reset_flag = reset_flag;
  plan.data_null = 0;
  plan.name_equal = 0;
  plan.data_34_flag = 0;
  plan.state_44_flag = 0;
  plan.skip = 0;
  plan.call_apply = 1;
  plan.apply_va = static_cast<uint32_t>(ISAAC_ANM2_PLAY_APPLY_VA);
  plan.apply_reset_arg = 1;
  plan.rewind_va = static_cast<uint32_t>(ISAAC_ANM2_REWIND_VA);
  plan.rewind_ran = 0;
  plan.flag_44_set = 0;
  if (anm2 != nullptr) {
    const uint32_t data = load_u32(anm2 + ISAAC_ANM2_OFF_ANIM_DATA_PTR_34);
    plan.data_null = data == 0u ? 1 : 0;
    if (data != 0u) {
      const char* current = sso_data(guest_ptr(data));
      const char* requested = reinterpret_cast<const char*>(guest_ptr(name_addr));
      plan.name_equal = isaac_anm2_strcmp_inline(current, requested) == 0 ? 1 : 0;
      plan.data_34_flag = static_cast<uint32_t>(
          guest_ptr(data)[ISAAC_ANM2_DATA_OFF_RESTART_FLAG_34]);
    }
    plan.state_44_flag =
        static_cast<uint32_t>(anm2[ISAAC_ANM2_OFF_PLAYING_FLAG_44]);
  }
  plan.skip = isaac_anm2_play_gate_skip(reset_flag, plan.data_null,
                                        plan.name_equal, plan.data_34_flag,
                                        plan.state_44_flag);
  plan.call_apply = plan.skip != 0 ? 0 : 1;
  if (out != nullptr) {
    *out = plan;
  }
}

void isaac_anm2_play_apply(uint8_t* anm2,
                           uint32_t name_addr,
                           int32_t reset_flag,
                           int32_t host_apply_al,
                           IsaacAnm2PlayPlan* out) {
  IsaacAnm2PlayPlan plan;
  isaac_anm2_play_plan(anm2, name_addr, reset_flag, &plan);
  /* The host 0x0040a5d0 returns in AL and the PE does `test al,al` — a BYTE
     gate. A wide value such as 0x100 must be read as its low byte (0). */
  if (plan.call_apply != 0 &&
      (static_cast<uint32_t>(host_apply_al) & 0xffu) != 0u) {
    plan.rewind_ran = 1;
    plan.flag_44_set = 1;
    if (anm2 != nullptr) {
      isaac_anm2_rewind_apply(anm2 + ISAAC_ANM2_OFF_ANIM_STATE_30, nullptr);
      store_u8(anm2 + ISAAC_ANM2_OFF_PLAYING_FLAG_44, 1u);
    }
  }
  if (out != nullptr) {
    *out = plan;
  }
}

void isaac_anm2_play_index_plan(uint8_t* anm2,
                                int32_t index,
                                IsaacAnm2PlayIndexPlan* out) {
  IsaacAnm2PlayIndexPlan plan;
  plan.index_in_range = 0;
  plan.log_needed = 1;
  plan.log_va = static_cast<uint32_t>(ISAAC_ANM2_HOST_VA_LOG);
  plan.log_level = static_cast<int32_t>(ISAAC_ANM2_INDEX_LOG_LEVEL);
  plan.log_str_va = static_cast<uint32_t>(ISAAC_ANM2_INDEX_LOG_STR_VA);
  plan.data_null = 0;
  plan.name_equal = 0;
  plan.data_34_flag = 0;
  plan.state_44_flag = 0;
  plan.skip = 0;
  plan.call_apply = 0;
  plan.apply_va = static_cast<uint32_t>(ISAAC_ANM2_PLAY_APPLY_VA);
  plan.apply_reset_arg = 1;
  plan.rewind_va = static_cast<uint32_t>(ISAAC_ANM2_REWIND_VA);
  plan.rewind_ran = 0;
  plan.flag_44_set = 0;
  if (anm2 != nullptr) {
    const int32_t count =
        static_cast<int32_t>(load_u32(anm2 + ISAAC_ANM2_OFF_ANIM_COUNT_78));
    /* test eax,eax ; js / cmp eax,[this+0x78] ; jge — SIGNED on both ends. */
    const int32_t in_range = (index >= 0 && index < count) ? 1 : 0;
    plan.index_in_range = in_range;
    plan.log_needed = in_range != 0 ? 0 : 1;
    if (in_range != 0) {
      const uint32_t elem =
          load_u32(anm2 + ISAAC_ANM2_OFF_ANIM_DATA_74) +
          static_cast<uint32_t>(index) * static_cast<uint32_t>(ISAAC_ANM2_ANIM_DATA_STRIDE);
      const char* elem_name = sso_data(guest_ptr(elem));
      const uint32_t data = load_u32(anm2 + ISAAC_ANM2_OFF_ANIM_DATA_PTR_34);
      plan.data_null = data == 0u ? 1 : 0;
      if (data != 0u) {
        const char* current = sso_data(guest_ptr(data));
        plan.name_equal = isaac_anm2_strcmp_inline(current, elem_name) == 0 ? 1 : 0;
        plan.data_34_flag = static_cast<uint32_t>(
            guest_ptr(data)[ISAAC_ANM2_DATA_OFF_RESTART_FLAG_34]);
      }
      plan.state_44_flag =
          static_cast<uint32_t>(anm2[ISAAC_ANM2_OFF_PLAYING_FLAG_44]);
      plan.skip = isaac_anm2_play_gate_skip(0, plan.data_null, plan.name_equal,
                                            plan.data_34_flag,
                                            plan.state_44_flag);
      plan.call_apply = plan.skip != 0 ? 0 : 1;
    }
  }
  if (out != nullptr) {
    *out = plan;
  }
}

void isaac_anm2_play_index_apply(uint8_t* anm2,
                                 int32_t index,
                                 int32_t host_apply_al,
                                 IsaacAnm2PlayIndexPlan* out) {
  IsaacAnm2PlayIndexPlan plan;
  isaac_anm2_play_index_plan(anm2, index, &plan);
  /* `test al,al` after the host call — a BYTE gate, see isaac_anm2_play_apply. */
  if (plan.call_apply != 0 &&
      (static_cast<uint32_t>(host_apply_al) & 0xffu) != 0u) {
    plan.rewind_ran = 1;
    plan.flag_44_set = 1;
    if (anm2 != nullptr) {
      isaac_anm2_rewind_apply(anm2 + ISAAC_ANM2_OFF_ANIM_STATE_30, nullptr);
      store_u8(anm2 + ISAAC_ANM2_OFF_PLAYING_FLAG_44, 1u);
    }
  }
  if (out != nullptr) {
    *out = plan;
  }
}

void isaac_anm2_play_random_plan(uint8_t* anm2,
                                 uint32_t seed,
                                 IsaacAnm2PlayRandomPlan* out) {
  IsaacAnm2PlayRandomPlan plan;
  plan.entered = 0;
  plan.count = 0;
  plan.count_zero = 1;
  plan.log_needed = 1;
  plan.log_va = static_cast<uint32_t>(ISAAC_ANM2_HOST_VA_LOG);
  plan.log_level = static_cast<int32_t>(ISAAC_ANM2_PLAY_RANDOM_LOG_LEVEL);
  plan.log_str_va = static_cast<uint32_t>(ISAAC_ANM2_PLAY_RANDOM_LOG_STR_VA);
  plan.seed = seed;
  plan.remainder = 0;
  plan.data_null = 0;
  plan.name_equal = 0;
  plan.data_34_flag = 0;
  plan.state_44_flag = 0;
  plan.skip = 0;
  plan.call_apply = 0;
  plan.apply_va = static_cast<uint32_t>(ISAAC_ANM2_PLAY_APPLY_VA);
  plan.apply_reset_arg = 1;
  plan.rewind_va = static_cast<uint32_t>(ISAAC_ANM2_REWIND_VA);
  plan.rewind_ran = 0;
  plan.flag_44_set = 0;
  if (anm2 != nullptr) {
    plan.entered = 1;
    /* test ecx,ecx — FULL DWORD. 0x100 is a live count. */
    const uint32_t count =
        load_u32(anm2 + ISAAC_ANM2_OFF_ANIM_COUNT_78);
    plan.count = count;
    if (count != 0u) {
      plan.count_zero = 0;
      plan.log_needed = 0;
      /* xor edx,edx ; div ecx — UNSIGNED remainder. seed is already
         uint32_t so `%` is the PE `div`. Never pre-mask the seed. */
      const uint32_t rem = seed % count;
      plan.remainder = rem;
      const uint32_t elem =
          load_u32(anm2 + ISAAC_ANM2_OFF_ANIM_DATA_74) +
          rem * static_cast<uint32_t>(ISAAC_ANM2_ANIM_DATA_STRIDE);
      const char* elem_name = sso_data(guest_ptr(elem));
      const uint32_t data = load_u32(anm2 + ISAAC_ANM2_OFF_ANIM_DATA_PTR_34);
      plan.data_null = data == 0u ? 1 : 0;
      if (data != 0u) {
        const char* current = sso_data(guest_ptr(data));
        plan.name_equal =
            isaac_anm2_strcmp_inline(current, elem_name) == 0 ? 1 : 0;
        plan.data_34_flag = static_cast<uint32_t>(
            guest_ptr(data)[ISAAC_ANM2_DATA_OFF_RESTART_FLAG_34]);
      }
      plan.state_44_flag =
          static_cast<uint32_t>(anm2[ISAAC_ANM2_OFF_PLAYING_FLAG_44]);
      /* reset implicit 0 — the body has no [ebp+0xc] test. */
      plan.skip = isaac_anm2_play_gate_skip(0, plan.data_null, plan.name_equal,
                                            plan.data_34_flag,
                                            plan.state_44_flag);
      plan.call_apply = plan.skip != 0 ? 0 : 1;
    }
  }
  if (out != nullptr) {
    *out = plan;
  }
}

void isaac_anm2_play_random_apply(uint8_t* anm2,
                                  uint32_t seed,
                                  int32_t host_apply_al,
                                  IsaacAnm2PlayRandomPlan* out) {
  IsaacAnm2PlayRandomPlan plan;
  isaac_anm2_play_random_plan(anm2, seed, &plan);
  /* `test al,al` after the host call — a BYTE gate. */
  if (plan.call_apply != 0 &&
      (static_cast<uint32_t>(host_apply_al) & 0xffu) != 0u) {
    plan.rewind_ran = 1;
    plan.flag_44_set = 1;
    if (anm2 != nullptr) {
      isaac_anm2_rewind_apply(anm2 + ISAAC_ANM2_OFF_ANIM_STATE_30, nullptr);
      store_u8(anm2 + ISAAC_ANM2_OFF_PLAYING_FLAG_44, 1u);
    }
  }
  if (out != nullptr) {
    *out = plan;
  }
}

int32_t isaac_anm2_playing_name_pred(uint8_t* anm2, uint32_t name_addr) {
  if (anm2 == nullptr) {
    return 0;
  }
  const uint32_t data = load_u32(anm2 + ISAAC_ANM2_OFF_ANIM_DATA_PTR_34);
  if (data == 0u) {
    return 0;
  }
  if (anm2[ISAAC_ANM2_OFF_PLAYING_FLAG_44] == 0u) {
    return 0;
  }
  const char* requested = reinterpret_cast<const char*>(guest_ptr(name_addr));
  if (requested[0] == 0) {
    return 1;
  }
  const char* current = sso_data(guest_ptr(data));
  return isaac_anm2_strcmp_inline(current, requested) == 0 ? 1 : 0;
}

int32_t isaac_anm2_playing_name_pred_alt(uint8_t* anm2, uint32_t name_addr) {
  if (anm2 == nullptr) {
    return 0;
  }
  const uint32_t data = load_u32(anm2 + ISAAC_ANM2_OFF_ANIM_DATA_PTR_34);
  if (data == 0u) {
    uint32_t eax = name_addr;
    (void)guest_ptr(eax)[0]; /* the discarded byte read */
    return eax == 0u ? 1 : 0;
  }
  if (anm2[ISAAC_ANM2_OFF_PLAYING_FLAG_44] != 0u) {
    return 0;
  }
  const char* requested = reinterpret_cast<const char*>(guest_ptr(name_addr));
  if (requested[0] == 0) {
    return 1;
  }
  const char* current = sso_data(guest_ptr(data));
  return isaac_anm2_strcmp_inline(current, requested) == 0 ? 1 : 0;
}

void isaac_anm2_rewind_apply(uint8_t* state, IsaacAnm2RewindPlan* out) {
  IsaacAnm2RewindPlan plan;
  plan.prewalk_log_needed = 0;
  plan.prewalk_faulted = 0;
  plan.faults_at_count = 0;
  plan.count0 = 0u;
  plan.count1 = 0u;
  plan.zeros0 = 0;
  plan.zeros1 = 0;
  plan.faults_at_slot = 0;
  if (state == nullptr) {
    if (out != nullptr) {
      *out = plan;
    }
    return;
  }
  store_u32(state + ISAAC_ANM2_STATE_OFF_ANIM_FRAME_10, 0u);
  store_u32(state + ISAAC_ANM2_STATE_OFF_CLEARED_18, 0u);
  store_u32(state + ISAAC_ANM2_STATE_OFF_TAIL_1C, 0u);

  IsaacAnm2PreWalkPlan pw;
  isaac_anm2_prewalk_apply(state, &pw);
  plan.prewalk_log_needed = pw.log_needed;
  if (pw.faults_after_log != 0) {
    plan.prewalk_faulted = 1;
    if (out != nullptr) {
      *out = plan;
    }
    return;
  }

  uint32_t data = load_u32(state + ISAAC_ANM2_STATE_OFF_ANIM_DATA_04);
  if (data == 0u) {
    plan.faults_at_count = 1;
    if (out != nullptr) {
      *out = plan;
    }
    return;
  }
  const uint32_t count0 = load_guest_u32(data + ISAAC_ANM2_DATA_OFF_LAYER_COUNT_1C);
  plan.count0 = count0;
  if (count0 != 0u) { /* cmp [eax+0x1c],ecx ; jbe with ecx == 0 — UNSIGNED */
    uint32_t i = 0u;
    for (;;) {
      const uint32_t frames = load_u32(state + ISAAC_ANM2_STATE_OFF_LAYER_FRAMES_08);
      if (frames == 0u) {
        plan.faults_at_slot = 1;
        if (out != nullptr) {
          *out = plan;
        }
        return;
      }
      store_u32(guest_mut_ptr(frames + i * 4u), 0u);
      plan.zeros0 += 1;
      i += 1u;
      data = load_u32(state + ISAAC_ANM2_STATE_OFF_ANIM_DATA_04); /* RE-READ */
      if (data == 0u) {
        plan.faults_at_count = 1;
        if (out != nullptr) {
          *out = plan;
        }
        return;
      }
      if (!(i < load_guest_u32(data + ISAAC_ANM2_DATA_OFF_LAYER_COUNT_1C))) {
        break; /* jb — UNSIGNED, bound from the RE-READ data */
      }
    }
  }
  const uint32_t count1 = load_guest_u32(data + ISAAC_ANM2_DATA_OFF_SECOND_COUNT_24);
  plan.count1 = count1;
  if (count1 != 0u) {
    uint32_t i = 0u;
    for (;;) {
      const uint32_t frames = load_u32(state + ISAAC_ANM2_STATE_OFF_NULL_FRAMES_0C);
      if (frames == 0u) {
        plan.faults_at_slot = 1;
        break;
      }
      store_u32(guest_mut_ptr(frames + i * 4u), 0u);
      plan.zeros1 += 1u;
      i += 1u;
      data = load_u32(state + ISAAC_ANM2_STATE_OFF_ANIM_DATA_04); /* RE-READ */
      if (data == 0u) {
        plan.faults_at_count = 1;
        break;
      }
      if (!(i < load_guest_u32(data + ISAAC_ANM2_DATA_OFF_SECOND_COUNT_24))) {
        break;
      }
    }
  }
  if (out != nullptr) {
    *out = plan;
  }
}

void isaac_anm2_advance_position_apply(uint8_t* state,
                                       int32_t target,
                                       IsaacAnm2AdvancePositionPlan* out) {
  IsaacAnm2AdvancePositionPlan plan;
  plan.log_needed = 0;
  plan.log_va = static_cast<uint32_t>(ISAAC_ANM2_HOST_VA_LOG);
  plan.log_level = static_cast<int32_t>(ISAAC_ANM2_ADVANCE_BACKWARD_LOG_LEVEL);
  plan.log_str_va = static_cast<uint32_t>(ISAAC_ANM2_ADVANCE_BACKWARD_LOG_STR_VA);
  plan.log_new_arg = target;
  plan.log_cur_arg = 0;
  plan.frame_snapshot_bits = 0u;
  plan.floor_bits = 0u;
  plan.floor_int = 0;
  plan.selected_bits = 0u;
  plan.target_f_bits = 0u;
  plan.loop_entered = 0;
  plan.iterations = 0;
  plan.runaway = 0;
  plan.prewalk_log_needed = 0;
  plan.prewalk_faulted = 0;
  plan.faults_at_walk_entry = 0;
  plan.walk0_iterations = 0;
  plan.walk1_iterations = 0;
  plan.host_call_count = 0;
  if (state == nullptr) {
    if (out != nullptr) {
      *out = plan;
    }
    return;
  }

  const uint32_t frame_bits = load_u32(state + ISAAC_ANM2_STATE_OFF_ANIM_FRAME_10);
  plan.frame_snapshot_bits = frame_bits;
  const uint32_t floor_bits = isaac_anm2_floor_f32_bits(frame_bits);
  const int32_t cur = isaac_anm2_cvttss2si_bits(floor_bits);
  plan.floor_bits = floor_bits;
  plan.floor_int = cur;
  plan.log_cur_arg = cur;
  plan.log_needed = (target < cur) ? 1 : 0; /* cmp edi,eax ; jge — SIGNED */
  const uint32_t selected_bits =
      plan.log_needed != 0 ? load_u32(state + ISAAC_ANM2_STATE_OFF_ANIM_FRAME_10)
                           : frame_bits;
  plan.selected_bits = selected_bits;
  /* movd xmm0,edi ; cvtdq2ps — (float)target. */
  const uint32_t target_f_bits = cvtdq2ps_bits(static_cast<uint32_t>(target));
  plan.target_f_bits = target_f_bits;
  store_u32(state + ISAAC_ANM2_STATE_OFF_CLEARED_18, 0u); /* 0x00408d5e */

  plan.loop_entered = isaac_anm2_comiss_ja_bits(target_f_bits, selected_bits);
  if (plan.loop_entered != 0) {
    for (;;) {
      const uint32_t frame = load_u32(state + ISAAC_ANM2_STATE_OFF_ANIM_FRAME_10);
      const uint32_t stepped =
          anm2_f32_add_bits(isaac_anm2_floor_f32_bits(frame),
                             static_cast<uint32_t>(ISAAC_ANM2_ADVANCE_STEP_BITS));
      store_u32(state + ISAAC_ANM2_STATE_OFF_ANIM_FRAME_10, stepped);
      if (stepped == frame) {
        /* D28: floor(frame)+1.0f rounds back to frame once |frame| >= 2^24;
           the PE spins forever. Stop at the first no-progress iteration. */
        plan.runaway = 1;
        break;
      }
      IsaacAnm2PreWalkPlan pre;
      isaac_anm2_prewalk_apply(state, &pre);
      plan.prewalk_log_needed = pre.log_needed;
      if (pre.faults_after_log != 0) {
        plan.prewalk_faulted = 1;
        break;
      }
      plan.iterations += 1;
      if (!isaac_anm2_comiss_ja_bits(
              target_f_bits, load_u32(state + ISAAC_ANM2_STATE_OFF_ANIM_FRAME_10))) {
        break;
      }
    }
  }

  if (plan.prewalk_faulted != 0 || plan.runaway != 0) {
    if (out != nullptr) {
      *out = plan;
    }
    return;
  }

  /* 0x00408dae: one data read; a null descriptor faults at the first count
     compare (cmp [eax+0x1c], edi). */
  uint32_t data = load_u32(state + ISAAC_ANM2_STATE_OFF_ANIM_DATA_04);
  if (data == 0u) {
    plan.faults_at_walk_entry = 1;
    if (out != nullptr) {
      *out = plan;
    }
    return;
  }
  uint32_t count = load_guest_u32(data + ISAAC_ANM2_DATA_OFF_LAYER_COUNT_1C);
  if (count != 0u) { /* UNSIGNED entry */
    uint32_t i = 0u;
    for (;;) {
      IsaacAnm2FrameWalkPlan fw;
      isaac_anm2_frame_walk_apply(static_cast<int32_t>(ISAAC_ANM2_FRAME_WALK_LAYER),
                                  state, static_cast<int32_t>(i), target_f_bits,
                                  &fw);
      plan.walk0_iterations += 1;
      i += 1u;
      data = load_u32(state + ISAAC_ANM2_STATE_OFF_ANIM_DATA_04); /* RE-READ */
      if (data == 0u) {
        plan.faults_at_walk_entry = 1;
        break;
      }
      if (!(i < load_guest_u32(data + ISAAC_ANM2_DATA_OFF_LAYER_COUNT_1C))) {
        break; /* jb — UNSIGNED, bound against the RE-READ data */
      }
    }
    if (plan.faults_at_walk_entry != 0) {
      if (out != nullptr) {
        *out = plan;
      }
      return;
    }
  }
  /* Second walk entry uses the LAST data read (0x408dc3) or the entry read. */
  const uint32_t count1 = load_guest_u32(data + ISAAC_ANM2_DATA_OFF_SECOND_COUNT_24);
  if (count1 != 0u) {
    uint32_t i = 0u;
    for (;;) {
      IsaacAnm2FrameWalkPlan fw;
      isaac_anm2_frame_walk_apply(static_cast<int32_t>(ISAAC_ANM2_FRAME_WALK_NULL),
                                  state, static_cast<int32_t>(i), target_f_bits,
                                  &fw);
      plan.walk1_iterations += 1;
      i += 1u;
      data = load_u32(state + ISAAC_ANM2_STATE_OFF_ANIM_DATA_04); /* RE-READ */
      if (data == 0u) {
        plan.faults_at_walk_entry = 1;
        break;
      }
      if (!(i < load_guest_u32(data + ISAAC_ANM2_DATA_OFF_SECOND_COUNT_24))) {
        break;
      }
    }
  }
  if (out != nullptr) {
    *out = plan;
  }
}

void isaac_anm2_state_update_apply(uint8_t* state,
                                   IsaacAnm2StateUpdatePlan* out) {
  IsaacAnm2StateUpdatePlan plan;
  plan.entered = 0;
  plan.data_null = 0;
  plan.flag_clear = 0;
  plan.frame_bits = 0u;
  plan.speed_bits = 0u;
  plan.frame_plus_speed_bits = 0u;
  plan.floor_bits = 0u;
  plan.floor_int = 0;
  plan.length = 0;
  plan.below_length = 0;
  plan.data_34_flag = 0;
  plan.rewind_path = 0;
  plan.wrap_path = 0;
  plan.wrap_target = 0u;
  plan.wrap_advance_called = 0;
  plan.advance_path = 0;
  plan.advance_target = 0;
  plan.flag_cleared = 0;
  plan.frame_stored = 0;
  plan.host_call_count = 0;
  if (state == nullptr) {
    if (out != nullptr) {
      *out = plan;
    }
    return;
  }
  const uint32_t data = load_u32(state + ISAAC_ANM2_STATE_OFF_ANIM_DATA_04);
  plan.data_null = data == 0u ? 1 : 0;
  plan.flag_clear =
      static_cast<uint32_t>(state[ISAAC_ANM2_STATE_OFF_TAIL_BYTE_14]) == 0u ? 1 : 0;
  if (data == 0u || state[ISAAC_ANM2_STATE_OFF_TAIL_BYTE_14] == 0u) {
    if (out != nullptr) {
      *out = plan;
    }
    return;
  }
  plan.entered = 1;
  const uint32_t anm2 = load_u32(state + ISAAC_ANM2_STATE_OFF_ANIMATION_00);
  const uint32_t frame_bits = load_u32(state + ISAAC_ANM2_STATE_OFF_ANIM_FRAME_10);
  const uint32_t speed_bits = load_guest_u32(anm2 + ISAAC_ANM2_OFF_PLAYBACK_SPEED_104);
  plan.frame_bits = frame_bits;
  plan.speed_bits = speed_bits;
  const uint32_t fps_bits = anm2_f32_add_bits(frame_bits, speed_bits);
  plan.frame_plus_speed_bits = fps_bits;
  const uint32_t fps_floor_bits = isaac_anm2_floor_f32_bits(fps_bits);
  const int32_t floor_fs = isaac_anm2_cvttss2si_bits(fps_floor_bits);
  const int32_t length =
      static_cast<int32_t>(load_guest_u32(data + ISAAC_ANM2_DATA_OFF_LENGTH_30));
  plan.length = length;
  plan.below_length = (floor_fs < length) ? 1 : 0; /* cmp eax,ecx ; jl — SIGNED */
  if (floor_fs < length) {
    /* ADVANCE path: push eax ; call 0x00408d00 ; then _frame = frame+speed. */
    plan.floor_bits = fps_floor_bits;
    plan.floor_int = floor_fs;
    plan.advance_path = 1;
    plan.advance_target = floor_fs;
    isaac_anm2_advance_position_apply(state, floor_fs, nullptr);
    store_u32(state + ISAAC_ANM2_STATE_OFF_ANIM_FRAME_10, fps_bits);
    plan.frame_stored = 1;
    if (out != nullptr) {
      *out = plan;
    }
    return;
  }
  plan.data_34_flag =
      static_cast<uint32_t>(guest_ptr(data)[ISAAC_ANM2_DATA_OFF_RESTART_FLAG_34]);
  if (plan.data_34_flag != 0) {
    /* REWIND path: flag survives, frame untouched. */
    plan.rewind_path = 1;
    isaac_anm2_rewind_apply(state, nullptr);
    if (out != nullptr) {
      *out = plan;
    }
    return;
  }
  /* WRAP path: target = length-1 (lea edi,[ecx-1], 32-bit wrap); the floor is
     taken on the ORIGINAL frame, NOT frame+speed. */
  plan.wrap_path = 1;
  const uint32_t wrap_target = static_cast<uint32_t>(length) - 1u;
  plan.wrap_target = wrap_target;
  const uint32_t orig_floor_bits = isaac_anm2_floor_f32_bits(frame_bits);
  const int32_t orig_floor_int = isaac_anm2_cvttss2si_bits(orig_floor_bits);
  plan.floor_bits = orig_floor_bits;
  plan.floor_int = orig_floor_int;
  plan.wrap_advance_called =
      (static_cast<int32_t>(wrap_target) >= orig_floor_int) ? 1 : 0; /* jl — SIGNED */
  if (plan.wrap_advance_called != 0) {
    isaac_anm2_advance_position_apply(state,
                                      static_cast<int32_t>(wrap_target), nullptr);
  }
  store_u8(state + ISAAC_ANM2_STATE_OFF_TAIL_BYTE_14, 0u); /* 8-BIT store */
  plan.flag_cleared = 1;
  if (out != nullptr) {
    *out = plan;
  }
}

void isaac_anm2_anm_update_apply(uint8_t* anm2,
                                 IsaacAnm2AnmUpdatePlan* out) {
  IsaacAnm2AnmUpdatePlan plan;
  plan.loaded = 0;
  plan.state0_entered = 0;
  plan.state1_entered = 0;
  plan.host_call_count = 0;
  if (anm2 != nullptr) {
    plan.loaded =
        static_cast<uint32_t>(anm2[ISAAC_ANM2_OFF_LOADED_BYTE_109]) != 0u ? 1 : 0;
    if (plan.loaded != 0) {
      IsaacAnm2StateUpdatePlan s0;
      IsaacAnm2StateUpdatePlan s1;
      isaac_anm2_state_update_apply(anm2 + ISAAC_ANM2_OFF_ANIM_STATE_30, &s0);
      isaac_anm2_state_update_apply(anm2 + ISAAC_ANM2_OFF_OVERLAY_STATE_50, &s1);
      plan.state0_entered = s0.entered;
      plan.state1_entered = s1.entered;
    }
  }
  if (out != nullptr) {
    *out = plan;
  }
}

uint32_t isaac_anm2_layer_frame_plan(uint8_t* state,
                                     int32_t layer_id,
                                     IsaacAnm2LayerFramePlan* out) {
  IsaacAnm2LayerFramePlan plan;
  plan.entered = 0;
  plan.layer_id = layer_id;
  plan.data_null = 0;
  plan.log_null_needed = 0;
  plan.log_null_str_va =
      static_cast<uint32_t>(ISAAC_ANM2_LAYER_FRAME_LOG_NULL_STR_VA);
  plan.log_bound_needed = 0;
  plan.log_bound_str_va =
      static_cast<uint32_t>(ISAAC_ANM2_LAYER_FRAME_LOG_BOUND_STR_VA);
  plan.log_va = static_cast<uint32_t>(ISAAC_ANM2_HOST_VA_LOG);
  plan.log_level = static_cast<int32_t>(ISAAC_ANM2_LAYER_FRAME_LOG_LEVEL);
  plan.anm2_ptr = 0;
  plan.anm2_layer_count = 0;
  plan.data_ptr = 0;
  plan.data_null_post = 0;
  plan.map_index = 0;
  plan.layer_count_1c = 0;
  plan.frame_index = 0;
  plan.frames_ptr = 0;
  plan.entry_ptr = 0;
  plan.list_count = 0;
  plan.result = 0;
  plan.hit = 0;
  plan.host_call_count = 0;
  if (state == nullptr) {
    if (out != nullptr) {
      *out = plan;
    }
    return 0;
  }
  plan.entered = 1;

  /* First [this+4] test — FULL DWORD. The log is advisory. */
  const uint32_t data0 =
      load_u32(state + ISAAC_ANM2_STATE_OFF_ANIM_DATA_04);
  plan.data_null = data0 == 0u ? 1 : 0;
  plan.log_null_needed = plan.data_null;

  /* Bound log: `test esi,esi ; js` skips the [this] load. Else
     unguarded `[this]` then SIGNED `jl` against [anm2+0x80]. */
  if (layer_id < 0) {
    plan.log_bound_needed = 1;
  } else {
    const uint32_t anm2 =
        load_u32(state + ISAAC_ANM2_STATE_OFF_ANIMATION_00);
    plan.anm2_ptr = anm2;
    plan.anm2_layer_count = static_cast<int32_t>(
        load_guest_u32(anm2 + ISAAC_ANM2_OFF_LAYER_COUNT_80));
    if (!(layer_id < plan.anm2_layer_count)) {
      plan.log_bound_needed = 1;
    }
  }

  /* Body. data is RE-READ. [this] is RE-READ after the signed
     layerId<0 test. */
  const uint32_t data =
      load_u32(state + ISAAC_ANM2_STATE_OFF_ANIM_DATA_04);
  plan.data_ptr = data;
  plan.data_null_post = data == 0u ? 1 : 0;
  if (data == 0u || layer_id < 0) {
    if (out != nullptr) {
      *out = plan;
    }
    return 0;
  }
  const uint32_t anm2 =
      load_u32(state + ISAAC_ANM2_STATE_OFF_ANIMATION_00);
  plan.anm2_ptr = anm2;
  const int32_t count80 = static_cast<int32_t>(
      load_guest_u32(anm2 + ISAAC_ANM2_OFF_LAYER_COUNT_80));
  plan.anm2_layer_count = count80;
  /* SIGNED `jg` — layerId == count falls through (D29). */
  if (layer_id > count80) {
    if (out != nullptr) {
      *out = plan;
    }
    return 0;
  }

  const uint32_t map_addr =
      data + static_cast<uint32_t>(layer_id) * 4u +
      static_cast<uint32_t>(ISAAC_ANM2_DATA_OFF_LAYER_MAP_38);
  const int32_t map = static_cast<int32_t>(load_guest_u32(map_addr));
  plan.map_index = map;
  if (map < 0) {
    if (out != nullptr) {
      *out = plan;
    }
    return 0;
  }
  const int32_t count1c = static_cast<int32_t>(
      load_guest_u32(data + ISAAC_ANM2_DATA_OFF_LAYER_COUNT_1C));
  plan.layer_count_1c = count1c;
  if (!(map < count1c)) {
    if (out != nullptr) {
      *out = plan;
    }
    return 0;
  }

  const uint32_t frames =
      load_u32(state + ISAAC_ANM2_STATE_OFF_LAYER_FRAMES_08);
  plan.frames_ptr = frames;
  const int32_t frame = static_cast<int32_t>(
      load_guest_u32(frames + static_cast<uint32_t>(map) * 4u));
  plan.frame_index = frame;
  if (frame < 0) {
    if (out != nullptr) {
      *out = plan;
    }
    return 0;
  }

  const uint32_t entry =
      load_guest_u32(data + ISAAC_ANM2_W0_DATA_LIST_OFF) +
      (static_cast<uint32_t>(map) << 4);
  plan.entry_ptr = entry;
  const int32_t list_count = static_cast<int32_t>(
      load_guest_u32(entry + ISAAC_ANM2_W0_LIST_COUNT_OFF));
  plan.list_count = list_count;
  if (!(frame < list_count)) {
    if (out != nullptr) {
      *out = plan;
    }
    return 0;
  }

  const uint32_t result =
      load_guest_u32(entry + ISAAC_ANM2_W0_LIST_BASE_OFF) +
      static_cast<uint32_t>(frame) *
          static_cast<uint32_t>(ISAAC_ANM2_LAYER_FRAME_ELEM_STRIDE);
  plan.result = result;
  plan.hit = result != 0u ? 1 : 0;
  if (out != nullptr) {
    *out = plan;
  }
  return result;
}

void isaac_anm2_play_sso_plan(uint8_t* anm2,
                              uint32_t str_addr,
                              int32_t reset_flag,
                              IsaacAnm2PlaySsoPlan* out) {
  fill_play_sso_plan(anm2, str_addr, reset_flag, out);
}

void isaac_anm2_play_sso_apply(uint8_t* anm2,
                               uint32_t str_addr,
                               int32_t reset_flag,
                               int32_t host_apply_al,
                               IsaacAnm2PlaySsoPlan* out) {
  IsaacAnm2PlaySsoPlan plan;
  fill_play_sso_plan(anm2, str_addr, reset_flag, &plan);
  IsaacAnm2PlayPlan play;
  isaac_anm2_play_apply(anm2, plan.name_addr, reset_flag, host_apply_al, &play);
  plan.rewind_ran = play.rewind_ran;
  plan.flag_44_set = play.flag_44_set;
  if (out != nullptr) {
    *out = plan;
  }
}

void isaac_anm2_playing_sso_plan(uint8_t* anm2,
                                 uint32_t str_addr,
                                 IsaacAnm2PlayingSsoPlan* out) {
  IsaacAnm2PlayingSsoPlan plan;
  plan.entered = anm2 != nullptr ? 1 : 0;
  plan.str_addr = str_addr;
  plan.cap = 0;
  plan.heap_used = 0;
  plan.name_addr = 0;
  plan.result = 0;

  uint32_t name_addr = 0;
  if (str_addr != 0u) {
    /* v13: cmp [eax+0x14],0x10 ; jb INLINE — UNSIGNED strict below. */
    const uint32_t cap = load_guest_u32(
        str_addr + static_cast<uint32_t>(ISAAC_ANM2_OFF_FILENAME_CAP_14));
    plan.cap = cap;
    if (cap < static_cast<uint32_t>(ISAAC_ANM2_SSO_CAPACITY_THRESHOLD)) {
      plan.heap_used = 0;
      name_addr = str_addr;
    } else {
      plan.heap_used = 1;
      name_addr = load_guest_u32(str_addr);
    }
    plan.name_addr = name_addr;
  }

  plan.result = isaac_anm2_playing_name_pred(anm2, name_addr);
  if (out != nullptr) {
    *out = plan;
  }
}

void isaac_anm2_playing_sso_alt_plan(uint8_t* anm2,
                                     uint32_t str_addr,
                                     IsaacAnm2PlayingSsoAltPlan* out) {
  IsaacAnm2PlayingSsoAltPlan plan;
  plan.entered = anm2 != nullptr ? 1 : 0;
  plan.str_addr = str_addr;
  plan.cap = 0;
  plan.heap_used = 0;
  plan.name_addr = 0;
  plan.result = 0;

  uint32_t name_addr = 0;
  if (str_addr != 0u) {
    /* v14: cmp [eax+0x14],0x10 ; jb INLINE — UNSIGNED strict below. */
    const uint32_t cap = load_guest_u32(
        str_addr + static_cast<uint32_t>(ISAAC_ANM2_OFF_FILENAME_CAP_14));
    plan.cap = cap;
    if (cap < static_cast<uint32_t>(ISAAC_ANM2_SSO_CAPACITY_THRESHOLD)) {
      plan.heap_used = 0;
      name_addr = str_addr;
    } else {
      plan.heap_used = 1;
      name_addr = load_guest_u32(str_addr);
    }
    plan.name_addr = name_addr;
  }

  plan.result = isaac_anm2_playing_name_pred_alt(anm2, name_addr);
  if (out != nullptr) {
    *out = plan;
  }
}

void isaac_anm2_walk_apply_sso_plan(uint8_t* anm2,
                                    uint32_t str_addr,
                                    int32_t reset_flag,
                                    IsaacAnm2WalkApplySsoPlan* out) {
  IsaacAnm2WalkApplySsoPlan plan;
  plan.entered = 0;
  plan.str_addr = str_addr;
  plan.cap = 0;
  plan.heap_used = 0;
  plan.name_addr = 0;
  plan.reset_flag = reset_flag;
  plan.found = 0;
  plan.found_index = -1;
  plan.elem_byte_offset = 0;
  plan.warn_log_needed = 0;
  plan.warn_log_va = 0;
  plan.warn_log_level = 0;
  plan.warn_log_str_va = 0;
  plan.apply_va = 0;
  plan.apply_recv_off = 0;
  plan.result = 0;
  plan.host_call_count = 0;

  uint32_t name_addr = 0;
  if (str_addr != 0u) {
    /* v15: cmp [eax+0x14],0x10 ; jb INLINE — UNSIGNED strict below. */
    const uint32_t cap = load_guest_u32(
        str_addr + static_cast<uint32_t>(ISAAC_ANM2_OFF_FILENAME_CAP_14));
    plan.cap = cap;
    if (cap < static_cast<uint32_t>(ISAAC_ANM2_SSO_CAPACITY_THRESHOLD)) {
      plan.heap_used = 0;
      name_addr = str_addr;
    } else {
      plan.heap_used = 1;
      name_addr = load_guest_u32(str_addr);
    }
    plan.name_addr = name_addr;
  }

  IsaacAnm2WalkApplyPlan walk;
  isaac_anm2_walk_apply_plan(anm2, name_addr, reset_flag, &walk);
  plan.entered = anm2 != nullptr ? 1 : 0;
  plan.found = walk.found;
  plan.found_index = walk.found_index;
  plan.elem_byte_offset = walk.elem_byte_offset;
  plan.warn_log_needed = walk.warn_log_needed;
  plan.warn_log_va = walk.warn_log_va;
  plan.warn_log_level = walk.warn_log_level;
  plan.warn_log_str_va = walk.warn_log_str_va;
  plan.apply_va = walk.apply_va;
  plan.apply_recv_off = walk.apply_recv_off;
  plan.result = walk.result;
  plan.host_call_count = walk.host_call_count;
  if (out != nullptr) {
    *out = plan;
  }
}

void isaac_anm2_set_frame_plan(uint8_t* anm2,
                               uint32_t str_addr,
                               int32_t frame,
                               IsaacAnm2SetFramePlan* out) {
  fill_set_frame_plan(anm2, str_addr, frame, out);
}

void isaac_anm2_set_frame_apply(uint8_t* anm2,
                                uint32_t str_addr,
                                int32_t frame,
                                IsaacAnm2SetFramePlan* out) {
  IsaacAnm2SetFramePlan plan;
  fill_set_frame_plan(anm2, str_addr, frame, &plan);
  if (plan.flag_44_cleared != 0 && anm2 != nullptr) {
    store_u8(anm2 + ISAAC_ANM2_OFF_PLAYING_FLAG_44, 0u);
  }
  if (out != nullptr) {
    *out = plan;
  }
}

void isaac_anm2_set_frame_cstr_plan(uint8_t* anm2,
                                    uint32_t name_addr,
                                    int32_t frame,
                                    IsaacAnm2SetFrameCstrPlan* out) {
  fill_set_frame_cstr_plan(anm2, name_addr, frame, out);
}

void isaac_anm2_set_frame_cstr_apply(uint8_t* anm2,
                                     uint32_t name_addr,
                                     int32_t frame,
                                     IsaacAnm2SetFrameCstrPlan* out) {
  IsaacAnm2SetFrameCstrPlan plan;
  fill_set_frame_cstr_plan(anm2, name_addr, frame, &plan);
  if (plan.flag_44_cleared != 0 && anm2 != nullptr) {
    store_u8(anm2 + ISAAC_ANM2_OFF_PLAYING_FLAG_44, 0u);
  }
  if (out != nullptr) {
    *out = plan;
  }
}

void isaac_anm2_set_frame_cur_plan(uint8_t* anm2,
                                   int32_t frame,
                                   IsaacAnm2SetFrameCurPlan* out) {
  IsaacAnm2SetFrameCurPlan plan;
  plan.entered = 0;
  plan.frame = frame;
  plan.frame_f_bits = cvtdq2ps_bits(static_cast<uint32_t>(frame));
  plan.data_present = 0;
  plan.advance_ran = 0;
  plan.host_call_count = 0;

  if (anm2 != nullptr) {
    plan.entered = 1;
    /* v18: cmp dword [ecx+0x34], 0 ; je SKIP — full dword test. */
    const uint32_t data = load_u32(anm2 + ISAAC_ANM2_OFF_ANIM_DATA_PTR_34);
    plan.data_present = data != 0u ? 1 : 0;
    /* v18: [this+0x34] is the only gate for 0x408e00. */
    plan.advance_ran = plan.data_present;
    plan.host_call_count = plan.advance_ran;
  }
  if (out != nullptr) {
    *out = plan;
  }
}

int32_t isaac_anm2_advance_cur_needed(uint32_t data_dword) {
  /* v19: cmp dword [ecx+0x34], 0 ; je SKIP — FULL dword, so 0x100 is needed. */
  return data_dword != 0u ? 1 : 0;
}

void isaac_anm2_advance_cur_plan(uint8_t* anm2,
                                 IsaacAnm2AdvanceCurPlan* out) {
  IsaacAnm2AdvanceCurPlan plan;
  plan.entered = 0;
  plan.needed = 0;
  plan.data_dword = 0u;
  plan.advance_ran = 0;
  plan.advance_recv_off =
      static_cast<uint32_t>(ISAAC_ANM2_ADVANCE_CUR_ADVANCE_OFF);
  plan.host_or_advance_va =
      static_cast<uint32_t>(ISAAC_ANM2_ADVANCE_CUR_ADVANCE_VA);
  plan.host_call_count = 0;

  if (anm2 != nullptr) {
    plan.entered = 1;
    /* v19: cmp dword [ecx+0x34], 0 ; je SKIP — full dword test. */
    plan.data_dword = load_u32(anm2 + ISAAC_ANM2_OFF_ANIM_DATA_PTR_34);
    plan.needed = isaac_anm2_advance_cur_needed(plan.data_dword);
    /* v19: [this+0x34] is the only gate for 0x408e00. */
    plan.advance_ran = plan.needed;
    plan.host_call_count = plan.advance_ran;
  }
  if (out != nullptr) {
    *out = plan;
  }
}

int32_t isaac_anm2_advance_pos_cur_needed(uint32_t data_dword) {
  /* v20: cmp dword [ecx+0x34], 0 ; je SKIP — FULL dword, so 0x100 is needed. */
  return data_dword != 0u ? 1 : 0;
}

int32_t isaac_anm2_advance_pos_cur_target_from_data(uint32_t data_plus_0x30) {
  /* v20: dec eax after mov eax, [eax+0x30] — 32-bit wrap. */
  return static_cast<int32_t>(data_plus_0x30 - 1u);
}

void isaac_anm2_advance_pos_cur_plan(uint8_t* anm2,
                                     IsaacAnm2AdvancePosCurPlan* out) {
  IsaacAnm2AdvancePosCurPlan plan;
  plan.entered = 0;
  plan.needed = 0;
  plan.data_dword = 0u;
  plan.target = 0;
  plan.advance_ran = 0;
  plan.advance_recv_off =
      static_cast<uint32_t>(ISAAC_ANM2_ADVANCE_POS_CUR_STATE_OFF);
  plan.host_or_advance_va =
      static_cast<uint32_t>(ISAAC_ANM2_HOST_VA_ADVANCE_POSITION);
  plan.host_call_count = 0;

  if (anm2 != nullptr) {
    plan.entered = 1;
    /* v20: cmp dword [ecx+0x34], 0 ; je SKIP — full dword test. */
    plan.data_dword = load_u32(anm2 + ISAAC_ANM2_OFF_ANIM_DATA_PTR_34);
    plan.needed = isaac_anm2_advance_pos_cur_needed(plan.data_dword);
    /* v20: [this+0x34] is the only gate for 0x408d00. */
    if (plan.needed != 0) {
      const uint32_t length = load_guest_u32(
          plan.data_dword +
          static_cast<uint32_t>(ISAAC_ANM2_DATA_OFF_LENGTH_30));
      plan.target = isaac_anm2_advance_pos_cur_target_from_data(length);
      plan.advance_ran = 1;
      plan.host_call_count = 1;
    }
  }
  if (out != nullptr) {
    *out = plan;
  }
}

int32_t isaac_anm2_get_frame_needed(uint32_t data_dword) {
  /* v21: cmp dword [ecx+0x34], 0 ; je SKIP — FULL dword, so 0x100 is needed. */
  return data_dword != 0u ? 1 : 0;
}

int32_t isaac_anm2_get_frame_int_from_bits(uint32_t frame_bits) {
  /* v21: CRT floor then cvttss2si (PE 0x0040a780: floorss -> cvttss2si).
     Reuse v5 primitives BY REFERENCE. */
  const uint32_t floor_bits = isaac_anm2_floor_f32_bits(frame_bits);
  return isaac_anm2_cvttss2si_bits(floor_bits);
}

void isaac_anm2_get_frame_int_plan(uint8_t* anm2,
                                   IsaacAnm2GetFrameIntPlan* out) {
  IsaacAnm2GetFrameIntPlan plan;
  plan.entered = 0;
  plan.needed = 0;
  plan.data_dword = 0u;
  plan.frame_bits = 0u;
  plan.floor_bits = 0u;
  plan.result = -1;

  if (anm2 != nullptr) {
    plan.entered = 1;
    /* v21: cmp dword [ecx+0x34], 0 ; je NULL — full dword test. */
    plan.data_dword = load_u32(anm2 + ISAAC_ANM2_OFF_ANIM_DATA_PTR_34);
    plan.needed = isaac_anm2_get_frame_needed(plan.data_dword);
    if (plan.needed != 0) {
      plan.frame_bits = load_u32(anm2 + ISAAC_ANM2_GET_FRAME_INT_FRAME_OFF);
      plan.floor_bits = isaac_anm2_floor_f32_bits(plan.frame_bits);
      plan.result = isaac_anm2_get_frame_int_from_bits(plan.frame_bits);
    }
  }
  if (out != nullptr) {
    *out = plan;
  }
}

void isaac_anm2_get_frame_f32_plan(uint8_t* anm2,
                                   IsaacAnm2GetFrameF32Plan* out) {
  IsaacAnm2GetFrameF32Plan plan;
  plan.entered = 0;
  plan.needed = 0;
  plan.data_dword = 0u;
  plan.result_bits =
      static_cast<uint32_t>(ISAAC_ANM2_GET_FRAME_F32_NULL_BITS);

  if (anm2 != nullptr) {
    plan.entered = 1;
    /* v21: cmp dword [ecx+0x34], 0 ; je NULL — full dword test. */
    plan.data_dword = load_u32(anm2 + ISAAC_ANM2_OFF_ANIM_DATA_PTR_34);
    plan.needed = isaac_anm2_get_frame_needed(plan.data_dword);
    if (plan.needed != 0) {
      plan.result_bits = load_u32(anm2 + ISAAC_ANM2_GET_FRAME_F32_FRAME_OFF);
    }
  }
  if (out != nullptr) {
    *out = plan;
  }
}

int32_t isaac_anm2_set_layer_frame_needed(uint32_t data_dword) {
  /* v22: cmp dword [ecx+0x34], 0 ; je DONE — FULL dword, so 0x100 is needed. */
  return isaac_anm2_advance_cur_needed(data_dword);
}

int32_t isaac_anm2_set_layer_frame_layer_in_range(int32_t layer,
                                                  int32_t count_80) {
  /* v22: test esi,esi ; js / cmp esi,[anim+0x80] ; jl — SIGNED. */
  return isaac_anm2_layer_index_in_range(layer, count_80);
}

void isaac_anm2_set_layer_frame_plan(uint8_t* anm2,
                                     int32_t layer,
                                     int32_t frame,
                                     IsaacAnm2SetLayerFramePlan* out) {
  IsaacAnm2SetLayerFramePlan plan;
  plan.needed = 0;
  plan.needs_log = 0;
  plan.needs_walk = 0;
  plan.walk_index = 0;
  plan.frame_bits = cvtdq2ps_bits(static_cast<uint32_t>(frame));

  if (anm2 != nullptr) {
    /* v22: cmp dword [ecx+0x34], 0 ; je DONE — full dword test. */
    const uint32_t data = load_u32(anm2 + ISAAC_ANM2_OFF_ANIM_DATA_PTR_34);
    plan.needed = isaac_anm2_set_layer_frame_needed(data);
    if (plan.needed != 0) {
      const uint32_t anim = load_u32(anm2 + ISAAC_ANM2_OFF_ANIM_STATE_30);
      const int32_t count80 = static_cast<int32_t>(
          load_guest_u32(anim + ISAAC_ANM2_OFF_LAYER_COUNT_80));
      const int32_t in_range =
          isaac_anm2_set_layer_frame_layer_in_range(layer, count80);
      plan.needs_log = in_range == 0 ? 1 : 0;
      plan.needs_walk = in_range;
      if (plan.needs_walk != 0) {
        const uint32_t map_addr =
            data + static_cast<uint32_t>(layer) * 4u +
            static_cast<uint32_t>(ISAAC_ANM2_SET_LAYER_FRAME_MAP_OFF);
        plan.walk_index = static_cast<int32_t>(load_guest_u32(map_addr));
      }
    }
  }
  if (out != nullptr) {
    *out = plan;
  }
}

void isaac_anm2_set_layer_frame_name_plan(uint8_t* anm2,
                                          uint32_t name_addr,
                                          int32_t frame,
                                          IsaacAnm2SetLayerFrameNamePlan* out) {
  IsaacAnm2SetLayerFrameNamePlan plan;
  plan.entered = 0;
  plan.name_addr = name_addr;
  plan.frame = frame;
  plan.layer_ptr = 0u;
  plan.needs_log = 0;
  plan.needs_set = 0;
  plan.set_layer = 0;

  if (anm2 != nullptr) {
    plan.entered = 1;
    const uint32_t base = load_u32(anm2 + ISAAC_ANM2_OFF_LAYER_STATE_7C);
    const uint32_t count = load_u32(anm2 + ISAAC_ANM2_OFF_LAYER_COUNT_80);
    const int32_t idx = isaac_anm2_find_layer_index_by_name(
        guest_ptr(base), count,
        reinterpret_cast<const char*>(guest_ptr(name_addr)));
    if (idx < 0) {
      plan.needs_log = 1;
    } else {
      plan.layer_ptr = base + isaac_anm2_layer_byte_offset(idx);
      const uint32_t layer_data = load_guest_u32(plan.layer_ptr);
      plan.set_layer = static_cast<int32_t>(load_guest_u32(layer_data));
      plan.needs_set = 1;
    }
  }
  if (out != nullptr) {
    *out = plan;
  }
}

int32_t isaac_anm2_get_layer_frame_int_needed(uint32_t data_dword) {
  /* v23: cmp dword [this+0x34], 0 ; je → -1 — FULL dword, so 0x100 is needed. */
  return isaac_anm2_set_layer_frame_needed(data_dword);
}

int32_t isaac_anm2_get_layer_frame_int_layer_in_range(int32_t layer,
                                                      int32_t count_80) {
  /* v23: test esi,esi ; js / cmp esi,[anim+0x80] ; jl — SIGNED. */
  return isaac_anm2_set_layer_frame_layer_in_range(layer, count_80);
}

void isaac_anm2_get_layer_frame_int_plan(uint8_t* anm2,
                                         int32_t layer,
                                         IsaacAnm2GetLayerFrameIntPlan* out) {
  IsaacAnm2GetLayerFrameIntPlan plan;
  plan.entered = 0;
  plan.needed = 0;
  plan.data_dword = 0u;
  plan.layer = layer;
  plan.needs_log = 0;
  plan.result = -1;

  if (anm2 != nullptr) {
    plan.entered = 1;
    /* v23: cmp dword [this+0x34], 0 ; je → -1 — full dword test. */
    plan.data_dword = load_u32(anm2 + ISAAC_ANM2_OFF_ANIM_DATA_PTR_34);
    plan.needed = isaac_anm2_get_layer_frame_int_needed(plan.data_dword);
    if (plan.needed != 0) {
      const uint32_t anim = load_u32(anm2 + ISAAC_ANM2_OFF_ANIM_STATE_30);
      const int32_t count80 = static_cast<int32_t>(
          load_guest_u32(anim + ISAAC_ANM2_OFF_LAYER_COUNT_80));
      const int32_t in_range =
          isaac_anm2_get_layer_frame_int_layer_in_range(layer, count80);
      plan.needs_log = in_range == 0 ? 1 : 0;
      if (in_range == 0) {
        plan.result = 0;
      } else {
        const uint32_t map_addr =
            plan.data_dword + static_cast<uint32_t>(layer) * 4u +
            static_cast<uint32_t>(ISAAC_ANM2_GET_LAYER_FRAME_INT_MAP_OFF);
        const int32_t mapped = static_cast<int32_t>(load_guest_u32(map_addr));
        const uint32_t frames =
            load_u32(anm2 + ISAAC_ANM2_GET_LAYER_FRAME_INT_FRAMES_OFF);
        plan.result = static_cast<int32_t>(
            load_guest_u32(frames + static_cast<uint32_t>(mapped) * 4u));
      }
    }
  }
  if (out != nullptr) {
    *out = plan;
  }
}

/* ---- v54-band4: 0x00408ef0 state SetLayerFrame / 0x00408fc0 state
   null-frame setter / 0x00408f70 state getter — decision laws (unit
   anm2-v54-band4; state-receiver twins of v22/v23). All bounds SIGNED;
   byte-gate discipline uint32+&0xff (no byte loads in the bodies). ---- */

int32_t isaac_anm2_state_set_layer_frame_needed(uint32_t data_dword) {
  /* v54: the hit-path map deref at 0x00408f28 is UNGUARDED on the machine
     — a null data with an in-range index faults (unobservable, folded no
     walk). FULL-dword test, same law as v22/v23: 0x100 IS needed. */
  return isaac_anm2_advance_cur_needed(data_dword);
}

int32_t isaac_anm2_state_set_layer_frame_in_range(int32_t index,
                                                  int32_t count) {
  /* v54: test esi,esi ; js / cmp esi,[anim+0x80] ; jl — SIGNED. */
  return isaac_anm2_set_layer_frame_layer_in_range(index, count);
}

void isaac_anm2_state_set_layer_frame_plan(uint8_t* state,
                                           int32_t layer,
                                           int32_t frame,
                                           IsaacAnm2StateSetLayerFramePlan* out) {
  IsaacAnm2StateSetLayerFramePlan plan;
  plan.entered = 0;
  plan.needs_log = 0;
  plan.needs_walk = 0;
  plan.walk_index = 0;
  plan.frame_bits = cvtdq2ps_bits(static_cast<uint32_t>(frame));

  if (state != nullptr) {
    plan.entered = 1;
    const uint32_t anim = load_u32(state + ISAAC_ANM2_STATE_OFF_ANIMATION_00);
    const int32_t count80 = static_cast<int32_t>(
        load_guest_u32(anim + ISAAC_ANM2_STATE_SET_LAYER_FRAME_COUNT_OFF));
    /* log1 fires for ANY out-of-range index — the machine has NO top data
       gate (unlike v22 0x40a7e0). The post-log re-test equals the pre-test
       (the log is a typed-host primitive; no guest mutation), so needs_walk
       is the same predicate ANDed with the [state+4] gate. */
    const int32_t in_range =
        isaac_anm2_state_set_layer_frame_in_range(layer, count80);
    plan.needs_log = in_range == 0 ? 1 : 0;
    const uint32_t data = load_u32(state + ISAAC_ANM2_STATE_OFF_ANIM_DATA_04);
    plan.needs_walk =
        (in_range != 0 &&
         isaac_anm2_state_set_layer_frame_needed(data) != 0)
            ? 1
            : 0;
    if (plan.needs_walk != 0) {
      /* 0x00408f28: mov esi,[eax + esi*4 + 0x38] — u32 wrap. */
      const uint32_t map_addr =
          data + static_cast<uint32_t>(layer) * 4u +
          static_cast<uint32_t>(ISAAC_ANM2_STATE_SET_LAYER_FRAME_MAP_OFF);
      plan.walk_index = static_cast<int32_t>(load_guest_u32(map_addr));
    }
  }
  if (out != nullptr) {
    *out = plan;
  }
}

int32_t isaac_anm2_state_set_null_frame_needed(uint32_t data_dword) {
  /* v54: full-dword [state+4] test, same law as v22/v23. Only feeds the
     log2 data arm — the tail (store + walk) runs even at data==0. */
  return isaac_anm2_advance_cur_needed(data_dword);
}

int32_t isaac_anm2_state_set_null_frame_in_range(int32_t index,
                                                 int32_t count) {
  /* v54: test esi,esi ; js / cmp esi,[anim+0x88] ; jl — SIGNED. */
  return isaac_anm2_set_layer_frame_layer_in_range(index, count);
}

void isaac_anm2_state_set_null_frame_plan(uint8_t* state,
                                          int32_t index,
                                          int32_t frame,
                                          IsaacAnm2StateSetNullFramePlan* out) {
  IsaacAnm2StateSetNullFramePlan plan;
  plan.entered = 0;
  plan.needs_log_1 = 0;
  plan.needs_log_2 = 0;
  plan.needs_walk = 0;
  plan.walk_index = 0;
  plan.frame_bits = cvtdq2ps_bits(static_cast<uint32_t>(frame));

  if (state != nullptr) {
    plan.entered = 1;
    const uint32_t anim = load_u32(state + ISAAC_ANM2_STATE_OFF_ANIMATION_00);
    const int32_t count88 = static_cast<int32_t>(
        load_guest_u32(anim + ISAAC_ANM2_STATE_SET_NULL_FRAME_COUNT_OFF));
    plan.needs_log_1 =
        isaac_anm2_state_set_null_frame_in_range(index, count88) == 0 ? 1 : 0;
    const uint32_t data = load_u32(state + ISAAC_ANM2_STATE_OFF_ANIM_DATA_04);
    if (data != 0u) {
      /* The data==0 test PRECEDES any deref (test eax,eax ; je). */
      const int32_t count24 = static_cast<int32_t>(
          load_guest_u32(data + ISAAC_ANM2_STATE_SET_NULL_FRAME_DATA_COUNT_OFF));
      plan.needs_log_2 =
          isaac_anm2_state_set_null_frame_in_range(index, count24) == 0 ? 1 : 0;
    } else {
      plan.needs_log_2 = 1;
    }
    /* The tail (frames[index]=0 + the 0x00408c10 call) is UNCONDITIONAL
       once entered — even after log1/log2 with a negative index (the walk
       law re-evaluates and faults internally BY REFERENCE). */
    plan.needs_walk = 1;
    plan.walk_index = index;
  }
  if (out != nullptr) {
    *out = plan;
  }
}

int32_t isaac_anm2_state_get_layer_frame_needed(uint32_t data_dword) {
  /* v54: full-dword [state+4] test, same law as v22/v23. The hit-path
     mapped deref is unguarded on the machine (fault, unobservable). */
  return isaac_anm2_advance_cur_needed(data_dword);
}

int32_t isaac_anm2_state_get_layer_frame_in_range(int32_t index,
                                                  int32_t count) {
  /* v54: test esi,esi ; js / cmp esi,[anim+0x80] ; jl — SIGNED. */
  return isaac_anm2_set_layer_frame_layer_in_range(index, count);
}

void isaac_anm2_state_get_layer_frame_plan(uint8_t* state,
                                           int32_t index,
                                           IsaacAnm2StateGetLayerFramePlan* out) {
  IsaacAnm2StateGetLayerFramePlan plan;
  plan.entered = 0;
  plan.needs_log = 0;
  plan.in_range = 0;
  plan.result = 0; /* OOB/miss folds to 0 — harness convention, model twin */

  if (state != nullptr) {
    plan.entered = 1;
    const uint32_t anim = load_u32(state + ISAAC_ANM2_STATE_OFF_ANIMATION_00);
    const int32_t count80 = static_cast<int32_t>(
        load_guest_u32(anim + ISAAC_ANM2_STATE_GET_LAYER_FRAME_COUNT_OFF));
    const int32_t in_range =
        isaac_anm2_state_get_layer_frame_in_range(index, count80);
    plan.needs_log = in_range == 0 ? 1 : 0;
    plan.in_range = in_range;
    if (in_range != 0) {
      /* 0x00408fa5..0x00408faf — no bound checks on the mapped value; the
         machine derefs data/mapped/frames unguarded (faults unobservable;
         folded: result stays 0). */
      const uint32_t data =
          load_u32(state + ISAAC_ANM2_STATE_OFF_ANIM_DATA_04);
      if (isaac_anm2_state_get_layer_frame_needed(data) != 0) {
        const uint32_t map_addr =
            data + static_cast<uint32_t>(index) * 4u +
            static_cast<uint32_t>(ISAAC_ANM2_STATE_GET_LAYER_FRAME_MAP_OFF);
        const int32_t mapped = static_cast<int32_t>(load_guest_u32(map_addr));
        const uint32_t frames = load_u32(
            state + ISAAC_ANM2_STATE_GET_LAYER_FRAME_FRAMES_OFF);
        plan.result = static_cast<int32_t>(load_guest_u32(
            frames + static_cast<uint32_t>(mapped) * 4u));
      }
    }
  }
  if (out != nullptr) {
    *out = plan;
  }
}

void isaac_anm2_overlay_play_sso_plan(uint8_t* anm2,
                                      uint32_t str_addr,
                                      int32_t reset_flag,
                                      IsaacAnm2OverlayPlaySsoPlan* out) {
  fill_overlay_play_sso_plan(anm2, str_addr, reset_flag, out);
}

void isaac_anm2_overlay_play_sso_apply(uint8_t* anm2,
                                       uint32_t str_addr,
                                       int32_t reset_flag,
                                       int32_t host_apply_al,
                                       IsaacAnm2OverlayPlaySsoPlan* out) {
  IsaacAnm2OverlayPlaySsoPlan plan;
  fill_overlay_play_sso_plan(anm2, str_addr, reset_flag, &plan);
  /* Host 0x0040aaf0 returns in AL; PE `test al,al` — BYTE gate. */
  if (plan.call_apply != 0 &&
      (static_cast<uint32_t>(host_apply_al) & 0xffu) != 0u) {
    plan.rewind_ran = 1;
    plan.flag_44_set = 1;
    if (anm2 != nullptr) {
      isaac_anm2_rewind_apply(
          anm2 + ISAAC_ANM2_OVERLAY_PLAY_STATE_OFF, nullptr);
      store_u8(anm2 + ISAAC_ANM2_OVERLAY_PLAY_FLAG_OFF, 1u);
    }
  }
  if (out != nullptr) {
    *out = plan;
  }
}

int32_t isaac_anm2_overlay_stop_needed(uint32_t data_dword) {
  /* v25: cmp dword [ecx+0x54], 0 ; je SKIP — FULL dword, so 0x100 is needed. */
  return isaac_anm2_stop_needed(data_dword);
}

void isaac_anm2_overlay_stop_apply(uint8_t* anm2) {
  if (anm2 == nullptr) {
    return;
  }
  const uint32_t data = load_u32(anm2 + ISAAC_ANM2_OVERLAY_STOP_DATA_OFF);
  if (isaac_anm2_overlay_stop_needed(data) != 0) {
    store_u8(anm2 + ISAAC_ANM2_OVERLAY_STOP_FLAG_OFF, 0u);
  }
}

int32_t isaac_anm2_overlay_playing_name_pred(uint8_t* anm2, uint32_t name_addr) {
  if (anm2 == nullptr) {
    return 0;
  }
  const uint32_t data =
      load_u32(anm2 + ISAAC_ANM2_OVERLAY_PLAYING_DATA_OFF);
  if (data == 0u) {
    return 0;
  }
  /* v26: cmp byte [this+0x64],0 ; je FALSE — LOW BYTE latch, so 0x100 is CLEAR. */
  if (anm2[ISAAC_ANM2_OVERLAY_PLAYING_FLAG_OFF] == 0u) {
    return 0;
  }
  const char* requested = reinterpret_cast<const char*>(guest_ptr(name_addr));
  if (requested[0] == 0) {
    return 1;
  }
  const char* current = sso_data(guest_ptr(data));
  return isaac_anm2_strcmp_inline(current, requested) == 0 ? 1 : 0;
}

void isaac_anm2_overlay_playing_sso_plan(uint8_t* anm2,
                                         uint32_t str_addr,
                                         IsaacAnm2OverlayPlayingSsoPlan* out) {
  IsaacAnm2OverlayPlayingSsoPlan plan;
  plan.entered = anm2 != nullptr ? 1 : 0;
  plan.str_addr = str_addr;
  plan.cap = 0;
  plan.heap_used = 0;
  plan.name_addr = 0;
  plan.result = 0;

  uint32_t name_addr = 0;
  if (str_addr != 0u) {
    /* v26 overlay Playing SSO: cmp [eax+0x14],0x10 ; jb INLINE — UNSIGNED strict below. */
    const uint32_t cap = load_guest_u32(
        str_addr + static_cast<uint32_t>(ISAAC_ANM2_OFF_FILENAME_CAP_14));
    plan.cap = cap;
    if (cap < static_cast<uint32_t>(ISAAC_ANM2_SSO_CAPACITY_THRESHOLD)) {
      plan.heap_used = 0;
      name_addr = str_addr;
    } else {
      plan.heap_used = 1;
      name_addr = load_guest_u32(str_addr);
    }
    plan.name_addr = name_addr;
  }

  plan.result = isaac_anm2_overlay_playing_name_pred(anm2, name_addr);
  if (out != nullptr) {
    *out = plan;
  }
}

int32_t isaac_anm2_overlay_playing_name_pred_alt(uint8_t* anm2,
                                                 uint32_t name_addr) {
  if (anm2 == nullptr) {
    return 0;
  }
  const uint32_t data =
      load_u32(anm2 + ISAAC_ANM2_OVERLAY_PLAYING_ALT_DATA_OFF);
  if (data == 0u) {
    uint32_t eax = name_addr;
    (void)guest_ptr(eax)[0]; /* the discarded byte read (D27) */
    /* The null-data arm folds to the POINTER test: ptr==0 -> 1, live ptr
       -> 0 (model twin anm2OverlayPlayingNamePredAlt; PE xor/eax law). */
    return name_addr == 0u ? 1 : 0;
  }
  /* v27: cmp byte [this+0x64],0 ; jne FALSE — LOW BYTE latch, so 0x100 is CLEAR. */
  if (anm2[ISAAC_ANM2_OVERLAY_PLAYING_ALT_FLAG_OFF] != 0u) {
    return 0;
  }
  const char* requested = reinterpret_cast<const char*>(guest_ptr(name_addr));
  if (requested[0] == 0) {
    return 1;
  }
  const char* current = sso_data(guest_ptr(data));
  return isaac_anm2_strcmp_inline(current, requested) == 0 ? 1 : 0;
}

void isaac_anm2_overlay_playing_sso_alt_plan(uint8_t* anm2,
                                             uint32_t str_addr,
                                             IsaacAnm2OverlayPlayingSsoAltPlan* out) {
  IsaacAnm2OverlayPlayingSsoAltPlan plan;
  plan.entered = anm2 != nullptr ? 1 : 0;
  plan.str_addr = str_addr;
  plan.cap = 0;
  plan.heap_used = 0;
  plan.name_addr = 0;
  plan.result = 0;

  uint32_t name_addr = 0;
  if (str_addr != 0u) {
    /* v27 overlay Playing-alt SSO: cmp [eax+0x14],0x10 ; jb INLINE — UNSIGNED strict below. */
    const uint32_t cap = load_guest_u32(
        str_addr + static_cast<uint32_t>(ISAAC_ANM2_OFF_FILENAME_CAP_14));
    plan.cap = cap;
    if (cap < static_cast<uint32_t>(ISAAC_ANM2_SSO_CAPACITY_THRESHOLD)) {
      plan.heap_used = 0;
      name_addr = str_addr;
    } else {
      plan.heap_used = 1;
      name_addr = load_guest_u32(str_addr);
    }
    plan.name_addr = name_addr;
  }

  plan.result = isaac_anm2_overlay_playing_name_pred_alt(anm2, name_addr);
  if (out != nullptr) {
    *out = plan;
  }
}

void isaac_anm2_overlay_apply_sso_plan(uint8_t* anm2,
                                       uint32_t str_addr,
                                       int32_t reset_flag,
                                       IsaacAnm2OverlayApplySsoPlan* out) {
  IsaacAnm2OverlayApplySsoPlan plan;
  plan.entered = anm2 != nullptr ? 1 : 0;
  plan.str_addr = str_addr;
  plan.cap = 0;
  plan.heap_used = 0;
  plan.name_addr = 0;
  plan.reset_flag = reset_flag;
  plan.host_va = ISAAC_ANM2_OVERLAY_APPLY_SSO_TARGET_VA;
  plan.host_call_count = 1; /* v28: unconditional jmp 0x0040aaf0 HOST */

  uint32_t name_addr = 0;
  if (str_addr != 0u) {
    /* v28 overlay-apply SSO: cmp [eax+0x14],0x10 ; jb INLINE -- UNSIGNED strict below. */
    const uint32_t cap = load_guest_u32(
        str_addr + static_cast<uint32_t>(ISAAC_ANM2_OFF_FILENAME_CAP_14));
    plan.cap = cap;
    if (cap < static_cast<uint32_t>(ISAAC_ANM2_SSO_CAPACITY_THRESHOLD)) {
      plan.heap_used = 0;
      name_addr = str_addr;
    } else {
      plan.heap_used = 1;
      name_addr = load_guest_u32(str_addr);
    }
    plan.name_addr = name_addr;
  }

  if (out != nullptr) {
    *out = plan;
  }
}


void isaac_anm2_overlay_set_frame_plan(uint8_t* anm2,
                                       uint32_t str_addr,
                                       int32_t frame,
                                       IsaacAnm2OverlaySetFramePlan* out) {
  IsaacAnm2OverlaySetFramePlan plan;
  plan.entered = 0;
  plan.str_addr = str_addr;
  plan.cap = 0;
  plan.heap_used = 0;
  plan.name_addr = 0;
  plan.frame = frame;
  plan.frame_f_bits = cvtdq2ps_bits(static_cast<uint32_t>(frame));
  plan.found = 0;
  plan.found_index = -1;
  plan.elem_byte_offset = 0;
  plan.warn_log_needed = 0;
  plan.warn_log_va = 0;
  plan.warn_log_level = 0;
  plan.warn_log_str_va = 0;
  plan.apply_va = 0;
  plan.apply_recv_off = 0;
  plan.walk_result = 0;
  plan.data_present = 0;
  plan.advance_ran = 0;
  plan.host_va = ISAAC_ANM2_OVERLAY_SET_FRAME_HOST_VA;
  plan.host_call_count = 0;

  uint32_t name_addr = 0;
  if (str_addr != 0u) {
    /* v29 overlay SetFrame SSO: cmp [eax+0x14],0x10 ; jb INLINE -- UNSIGNED strict below. */
    const uint32_t cap = load_guest_u32(
        str_addr + static_cast<uint32_t>(ISAAC_ANM2_OFF_FILENAME_CAP_14));
    plan.cap = cap;
    if (cap < static_cast<uint32_t>(ISAAC_ANM2_SSO_CAPACITY_THRESHOLD)) {
      plan.heap_used = 0;
      name_addr = str_addr;
    } else {
      plan.heap_used = 1;
      name_addr = load_guest_u32(str_addr);
    }
    plan.name_addr = name_addr;
  }

  IsaacAnm2WalkApplyPlan walk;
  isaac_anm2_walk_apply_plan(
      anm2, name_addr,
      static_cast<int32_t>(ISAAC_ANM2_OVERLAY_SET_FRAME_RESET_IMM), &walk);
  plan.entered = anm2 != nullptr ? 1 : 0;
  plan.found = walk.found;
  plan.found_index = walk.found_index;
  plan.elem_byte_offset = walk.elem_byte_offset;
  plan.warn_log_needed = walk.warn_log_needed;
  plan.warn_log_va = walk.warn_log_va;
  plan.warn_log_level = walk.warn_log_level;
  plan.warn_log_str_va = walk.warn_log_str_va;
  plan.apply_va = walk.apply_va;
  /* v29: overlay apply recv is this+0x50, not the primary this+0x30. */
  if (walk.found != 0) {
    plan.apply_recv_off = static_cast<uint32_t>(ISAAC_ANM2_OFF_OVERLAY_STATE_50);
  }
  plan.walk_result = walk.result;
  uint32_t data = 0;
  if (anm2 != nullptr) {
    /* v29 overlay SetFrame data gate: cmp dword [esi+0x54],0 -- FULL dword, 0x100 IS present. */
    data = load_u32(anm2 + ISAAC_ANM2_OVERLAY_PLAY_DATA_OFF);
  }
  plan.data_present = data != 0u ? 1 : 0;
  plan.advance_ran = (plan.walk_result != 0 && plan.data_present != 0) ? 1 : 0;
  plan.host_call_count = walk.host_call_count + plan.advance_ran;

  if (out != nullptr) {
    *out = plan;
  }
}

void isaac_anm2_overlay_set_frame_cstr_plan(uint8_t* anm2,
                                            uint32_t name_addr,
                                            int32_t frame,
                                            IsaacAnm2OverlaySetFrameCstrPlan* out) {
  IsaacAnm2OverlaySetFrameCstrPlan plan;
  plan.entered = 0;
  plan.name_addr = name_addr;
  plan.frame = frame;
  plan.frame_f_bits = cvtdq2ps_bits(static_cast<uint32_t>(frame));
  plan.found = 0;
  plan.found_index = -1;
  plan.elem_byte_offset = 0;
  plan.warn_log_needed = 0;
  plan.warn_log_va = 0;
  plan.warn_log_level = 0;
  plan.warn_log_str_va = 0;
  plan.apply_va = 0;
  plan.apply_recv_off = 0;
  plan.walk_result = 0;
  plan.data_present = 0;
  plan.advance_ran = 0;
  plan.host_va = ISAAC_ANM2_OVERLAY_SET_FRAME_CSTR_HOST_VA;
  plan.host_call_count = 0;

  /* v30: the cstr sibling pushes [ebp+8] DIRECTLY -- NO SSO select. */
  IsaacAnm2WalkApplyPlan walk;
  isaac_anm2_walk_apply_plan(
      anm2, name_addr,
      static_cast<int32_t>(ISAAC_ANM2_OVERLAY_SET_FRAME_CSTR_RESET_IMM), &walk);
  plan.entered = anm2 != nullptr ? 1 : 0;
  plan.found = walk.found;
  plan.found_index = walk.found_index;
  plan.elem_byte_offset = walk.elem_byte_offset;
  plan.warn_log_needed = walk.warn_log_needed;
  plan.warn_log_va = walk.warn_log_va;
  plan.warn_log_level = walk.warn_log_level;
  plan.warn_log_str_va = walk.warn_log_str_va;
  plan.apply_va = walk.apply_va;
  /* v30: overlay apply recv is this+0x50 on a hit, like v29. */
  if (walk.found != 0) {
    plan.apply_recv_off = static_cast<uint32_t>(ISAAC_ANM2_OVERLAY_PLAY_STATE_OFF);
  }
  plan.walk_result = walk.result;
  uint32_t data = 0;
  if (anm2 != nullptr) {
    /* v30 overlay SetFrame data gate: cmp dword [esi+0x54],0 -- FULL dword, 0x100 IS present. */
    data = load_u32(anm2 + ISAAC_ANM2_OVERLAY_PLAY_DATA_OFF);
  }
  plan.data_present = data != 0u ? 1 : 0;
  plan.advance_ran = (plan.walk_result != 0 && plan.data_present != 0) ? 1 : 0;
  plan.host_call_count = walk.host_call_count + plan.advance_ran;

  if (out != nullptr) {
    *out = plan;
  }
}

/* ---- v31: 0x0040ac30 SetOverlayFrame(int) + 0x0040ac50 ------------------- */

void isaac_anm2_set_overlay_frame_int_plan(uint8_t* anm2,
                                           int32_t frame,
                                           IsaacAnm2SetOverlayFrameIntPlan* out) {
  IsaacAnm2SetOverlayFrameIntPlan plan;
  plan.entered = 0;
  plan.frame = frame;
  plan.frame_f_bits = cvtdq2ps_bits(static_cast<uint32_t>(frame));
  plan.gate_54 = 0;
  plan.advance_va = ISAAC_ANM2_SET_OVERLAY_FRAME_INT_ADVANCE_VA;
  plan.advance_recv_off = ISAAC_ANM2_SET_OVERLAY_FRAME_INT_RECV_OFF;
  plan.host_call_count = 0;
  plan.pure_complete = 1;

  if (anm2 != nullptr) {
    plan.entered = 1;
    /* PE 0x40ac34 cmp dword [ecx+0x54],0: FULL-dword gate, 0x100 IS set. */
    const uint32_t gate = load_u32(anm2 + ISAAC_ANM2_SET_OVERLAY_FRAME_INT_GATE_OFF);
    plan.gate_54 = gate != 0u ? 1 : 0;
    if (gate != 0u) {
      plan.host_call_count = 1;
      plan.pure_complete = 0;
    }
  }

  if (out != nullptr) {
    *out = plan;
  }
}

void isaac_anm2_get_overlay_frame_int_plan(uint8_t* anm2,
                                           IsaacAnm2GetOverlayFrameIntPlan* out) {
  IsaacAnm2GetOverlayFrameIntPlan plan;
  plan.entered = 0;
  plan.gate_54 = 0;
  plan.result = ISAAC_ANM2_GET_OVERLAY_FRAME_MISS;
  plan.host_call_count = 0;
  plan.pure_complete = 1;

  if (anm2 != nullptr) {
    plan.entered = 1;
    /* PE 0x40ac50 cmp dword [ecx+0x54],0; jne 0x40ac5a: +0x54==0 -> -1. */
    const uint32_t gate = load_u32(anm2 + ISAAC_ANM2_GET_OVERLAY_FRAME_GATE_OFF);
    plan.gate_54 = gate != 0u ? 1 : 0;
    if (gate != 0u) {
      /* PE 0x40ac5a cvttss2si eax,[ecx+0x60]: float->int truncation. */
      const uint32_t cur = load_u32(anm2 + ISAAC_ANM2_GET_OVERLAY_FRAME_CUR_OFF);
      plan.result = isaac_anm2_cvttss2si_bits(cur);
    }
  }

  if (out != nullptr) {
    *out = plan;
  }
}

/* ---- v32: 0x0040ac70 id lookup + 0x0040ac60 forwarder -------------------- */

void isaac_anm2_anim_id_lookup_plan(uint8_t* anm2,
                                    int32_t id,
                                    IsaacAnm2AnimIdLookupPlan* out) {
  IsaacAnm2AnimIdLookupPlan plan;
  plan.entered = 0;
  plan.anim = 0u;
  plan.count = 0u;
  plan.found = 0;
  plan.id_val = 0;
  plan.elem_base = 0u;
  plan.elem_byte_offset = 0;
  plan.result = 0;
  plan.log_needed = 0;
  plan.log_va = ISAAC_ANM2_ANIM_ID_LOOKUP_LOG_VA;
  plan.log_level = ISAAC_ANM2_ANIM_ID_LOOKUP_LOG_LEVEL;
  plan.log_str_va = ISAAC_ANM2_ANIM_ID_LOOKUP_LOG_STR_VA;
  plan.host_call_count = 0;
  plan.pure_complete = 1;

  if (anm2 == nullptr) {
    if (out != nullptr) *out = plan;
    return;
  }
  plan.entered = 1;
  uint32_t anim = load_u32(anm2 + ISAAC_ANM2_ANIM_ID_LOOKUP_ANIM_OFF);
  if (anim == 0u) {
    /* PE 0x40ac7f..0x40ac8c: log then RELOAD [this+4] (defect reproduced). */
    plan.log_needed = 1;
    plan.host_call_count = 1;
    plan.pure_complete = 0;
    anim = load_u32(anm2 + ISAAC_ANM2_ANIM_ID_LOOKUP_ANIM_OFF);
  }
  plan.anim = anim;
  if (anim == 0u) {
    if (out != nullptr) *out = plan;
    return;
  }
  const uint32_t count = load_u32(reinterpret_cast<const uint8_t*>(static_cast<uintptr_t>(anim)) + ISAAC_ANM2_ANIM_ID_LOOKUP_COUNT_OFF);
  plan.count = count;
  if (count == 0u) {
    if (out != nullptr) *out = plan;
    return;
  }
  const uint32_t id_arr = load_u32(anm2 + ISAAC_ANM2_ANIM_ID_LOOKUP_IDS_OFF);
  const uint32_t elems = load_u32(reinterpret_cast<const uint8_t*>(static_cast<uintptr_t>(anim)) + ISAAC_ANM2_ANIM_ID_LOOKUP_ELEMS_OFF);
  for (uint32_t i = 0u; i < count; ++i) {
    const uint32_t elem =
        elems + i * static_cast<uint32_t>(ISAAC_ANM2_ANIM_ID_LOOKUP_ELEM_STRIDE);
    const uint32_t elem_id = load_u32(reinterpret_cast<const uint8_t*>(static_cast<uintptr_t>(elem)) + ISAAC_ANM2_ANIM_ID_LOOKUP_ID_OFF);
    if (static_cast<int32_t>(elem_id) != id) continue;
    /* PE 0x40acab test eax,eax; js — SIGNED idVal >= 0. */
    const int32_t id_val = static_cast<int32_t>(load_u32(reinterpret_cast<const uint8_t*>(static_cast<uintptr_t>(id_arr)) + i * 4u));
    if (id_val < 0) continue;
    /* PE 0x40acaf cmp eax,[ecx+0xc]; jge — SIGNED idVal < [elem+0xc]. */
    const int32_t limit =
        static_cast<int32_t>(load_u32(reinterpret_cast<const uint8_t*>(static_cast<uintptr_t>(elem)) + ISAAC_ANM2_ANIM_ID_LOOKUP_LIMIT_OFF));
    if (id_val >= limit) continue;
    plan.found = 1;
    plan.id_val = id_val;
    plan.elem_base = elem;
    plan.elem_byte_offset =
        id_val * static_cast<int32_t>(ISAAC_ANM2_ANIM_ID_LOOKUP_FOUND_STRIDE);
    plan.result =
        id_val * static_cast<int32_t>(ISAAC_ANM2_ANIM_ID_LOOKUP_FOUND_STRIDE) +
        static_cast<int32_t>(load_u32(reinterpret_cast<const uint8_t*>(static_cast<uintptr_t>(elem)) + ISAAC_ANM2_ANIM_ID_LOOKUP_BASE_OFF));
    break;
  }
  if (out != nullptr) {
    *out = plan;
  }
}

void isaac_anm2_forwarder60_plan(uint8_t* anm2,
                                 IsaacAnm2Forwarder60Plan* out) {
  IsaacAnm2Forwarder60Plan plan;
  plan.entered = 0;
  plan.call_va = ISAAC_ANM2_FORWARDER_60_CALL_VA;
  plan.recv_off = ISAAC_ANM2_FORWARDER_60_RECV_OFF;
  plan.arg_count = ISAAC_ANM2_FORWARDER_60_ARG_COUNT;
  plan.host_call_count = ISAAC_ANM2_FORWARDER_60_HOST_CALL_COUNT;
  plan.pure_complete = 0;

  if (anm2 != nullptr) {
    plan.entered = 1;
  }
  if (out != nullptr) {
    *out = plan;
  }
}

/* ---- v33: 0x0040ace0 extras name->index walk ----------------------------- */

void isaac_anm2_extras_name_index_plan(uint8_t* anm2,
                                       uint32_t name_addr,
                                       IsaacAnm2ExtrasNameIndexPlan* out) {
  IsaacAnm2ExtrasNameIndexPlan plan;
  plan.entered = 0;
  plan.anim = 0u;
  plan.count = 0u;
  plan.found = -1;
  plan.result = 0;
  plan.log_needed = 0;
  plan.log_va = ISAAC_ANM2_EXTRAS_NAME_INDEX_LOG_VA;
  plan.log_level = ISAAC_ANM2_EXTRAS_NAME_INDEX_LOG_LEVEL;
  plan.log_str_va = ISAAC_ANM2_EXTRAS_NAME_INDEX_LOG_STR_VA;
  plan.host_call_count = 0;
  plan.pure_complete = 1;
  plan.anim2 = 0u;
  plan.count2 = 0u;
  plan.elems2 = 0u;
  plan.id_arr = 0u;
  plan.id_val = 0;
  plan.elem_byte_offset = -1;
  plan.found2 = 0;
  plan.stage2_log = 0;

  if (anm2 == nullptr) {
    if (out != nullptr) *out = plan;
    return;
  }
  plan.entered = 1;
  const uint32_t anim = load_u32(anm2 + ISAAC_ANM2_EXTRAS_NAME_INDEX_ANIM_OFF);
  plan.anim = anim;
  if (anim == 0u) {
    /* PE 0x40acf3: [this+4]==0 -> log then FALL THROUGH to the walk — no
       reload, and the walk STILL RUNS (base [this]). v33's early-out was a
       fold; the machine logs and continues. */
    plan.log_needed = 1;
    plan.host_call_count = 1;
    plan.pure_complete = 0;
  }
  /* PE 0x40ad04 mov esi,[edi]: the walk base is [this] (offset 0), NOT the
     null-checked [this+4]. count = [[this]+0x88], list = [[this]+0x84]. */
  const uint8_t* data = reinterpret_cast<const uint8_t*>(
      static_cast<uintptr_t>(load_u32(anm2 + ISAAC_ANM2_EXTRAS_NAME_INDEX_DATA_OFF)));
  const uint32_t count = load_u32(data + ISAAC_ANM2_EXTRAS_NAME_INDEX_COUNT_OFF);
  plan.count = count;
  if (count == 0u) {
    if (out != nullptr) *out = plan;
    return;
  }
  const uint32_t list = load_u32(data + ISAAC_ANM2_EXTRAS_NAME_INDEX_LIST_OFF);
  const uint8_t* list_bytes =
      reinterpret_cast<const uint8_t*>(static_cast<uintptr_t>(list));
  const uint8_t* name_bytes =
      reinterpret_cast<const uint8_t*>(static_cast<uintptr_t>(name_addr));
  int32_t found = -1;
  for (uint32_t i = 0u; i < count; ++i) {
    const uint8_t* elem =
        list_bytes + i * static_cast<uint32_t>(ISAAC_ANM2_EXTRAS_NAME_INDEX_STRIDE);
    const uint32_t cap =
        load_u32(elem + ISAAC_ANM2_EXTRAS_NAME_INDEX_SSO_CAP_OFF);
    const uint8_t* str = cap < ISAAC_ANM2_EXTRAS_NAME_INDEX_SSO_CAP
        ? elem
        : reinterpret_cast<const uint8_t*>(static_cast<uintptr_t>(load_u32(elem)));
    /* SSO inline or heap: strcmp_inline handles both via sso_data(). */
    if (isaac_anm2_strcmp_inline(reinterpret_cast<const char*>(str),
                                 reinterpret_cast<const char*>(name_bytes)) == 0) {
      found = static_cast<int32_t>(i);
      break;
    }
  }
  plan.found = found;
  if (found >= 0) {
    /* v47 stage-2 continuation (PE 0x40ad6d..0x40adcc): the hit path FALLS
       THROUGH to an id-lookup over [anim+0x20] elems (stride 0x10), keyed by
       the extras index (ebx). [this+4] is re-read; null -> log + RELOAD. */
    uint32_t anim2 = load_u32(anm2 + ISAAC_ANM2_EXTRAS_NAME_INDEX_ANIM2_OFF);
    if (anim2 == 0u) {
      /* PE 0x40ad74..0x40ad80: log 0xa112c0(0x10, 0xb1a504) then RELOAD. */
      plan.stage2_log = 1;
      plan.host_call_count += 1;
      plan.pure_complete = 0;
      anim2 = load_u32(anm2 + ISAAC_ANM2_EXTRAS_NAME_INDEX_ANIM2_OFF);
    }
    plan.anim2 = anim2;
    if (anim2 != 0u) {
      const uint8_t* anim_bytes =
          reinterpret_cast<const uint8_t*>(static_cast<uintptr_t>(anim2));
      const uint32_t count2 =
          load_u32(anim_bytes + ISAAC_ANM2_EXTRAS_NAME_INDEX_COUNT2_OFF);
      plan.count2 = count2;
      if (count2 != 0u) {
        const uint32_t elems2 =
            load_u32(anim_bytes + ISAAC_ANM2_EXTRAS_NAME_INDEX_ELEMS2_OFF);
        const uint32_t id_arr =
            load_u32(anm2 + ISAAC_ANM2_EXTRAS_NAME_INDEX_ID_ARR_OFF);
        plan.elems2 = elems2;
        plan.id_arr = id_arr;
        const uint8_t* elems2_bytes =
            reinterpret_cast<const uint8_t*>(static_cast<uintptr_t>(elems2));
        const uint8_t* id_arr_bytes =
            reinterpret_cast<const uint8_t*>(static_cast<uintptr_t>(id_arr));
        for (uint32_t j = 0u; j < count2; ++j) {
          const uint8_t* elem2 = elems2_bytes + j *
              static_cast<uint32_t>(ISAAC_ANM2_EXTRAS_NAME_INDEX_ELEM2_STRIDE);
          const int32_t elem_id = static_cast<int32_t>(
              load_u32(elem2 + ISAAC_ANM2_EXTRAS_NAME_INDEX_ELEM2_ID_OFF));
          if (elem_id != found) continue;
          /* PE 0x40ad9e test ecx,ecx; js — SIGNED id_val >= 0. */
          const int32_t id_val = static_cast<int32_t>(
              load_u32(id_arr_bytes + j * 4u));
          if (id_val < 0) continue;
          /* PE 0x40ada2 cmp ecx,[eax+0xc]; jl — SIGNED strict <. */
          const int32_t limit = static_cast<int32_t>(
              load_u32(elem2 + ISAAC_ANM2_EXTRAS_NAME_INDEX_ELEM2_LIMIT_OFF));
          if (id_val >= limit) continue;
          /* PE 0x40adbf imul ecx,ecx,0x54; add ecx,[eax+8]. */
          plan.found2 = 1;
          plan.id_val = id_val;
          plan.elem_byte_offset = static_cast<int32_t>(
              j * static_cast<uint32_t>(ISAAC_ANM2_EXTRAS_NAME_INDEX_ELEM2_STRIDE));
          plan.result = id_val *
              static_cast<int32_t>(ISAAC_ANM2_EXTRAS_NAME_INDEX_FOUND_STRIDE) +
              static_cast<int32_t>(load_u32(
                  elem2 + ISAAC_ANM2_EXTRAS_NAME_INDEX_ELEM2_BASE_OFF));
          break;
        }
      }
    }
  }
  if (out != nullptr) {
    *out = plan;
  }
}

/* ---- v34: 0x0040af10 GetAnimation two-stage ------------------------------ */

void isaac_anm2_get_anim_two_stage_plan(uint8_t* anm2,
                                        uint32_t name_addr,
                                        IsaacAnm2GetAnimTwoStagePlan* out) {
  IsaacAnm2GetAnimTwoStagePlan plan;
  plan.entered = 0;
  plan.outer = ISAAC_ANM2_GET_ANIM_TWO_STAGE_MISS;
  plan.count = 0u;
  plan.found_outer = 0;
  plan.inner_count = 0u;
  plan.frame_int = 0;
  plan.best_delta = -1;
  plan.best_payload = -1;
  plan.result = ISAAC_ANM2_GET_ANIM_TWO_STAGE_MISS;
  plan.log_needed = 0;
  plan.log_va = ISAAC_ANM2_GET_ANIM_TWO_STAGE_LOG_VA;
  plan.log_level = ISAAC_ANM2_GET_ANIM_TWO_STAGE_LOG_LEVEL;
  plan.log_str_va = ISAAC_ANM2_GET_ANIM_TWO_STAGE_LOG_STR_VA;
  plan.host_call_count = 0;
  plan.pure_complete = 1;

  if (anm2 == nullptr) {
    if (out != nullptr) *out = plan;
    return;
  }
  plan.entered = 1;
  const uint32_t anim = load_u32(anm2 + ISAAC_ANM2_GET_ANIM_TWO_STAGE_ANIM_OFF);
  if (anim == 0u) {
    plan.log_needed = 1;
    plan.host_call_count = 1;
    plan.pure_complete = 0;
    if (out != nullptr) *out = plan;
    return;
  }
  const uint8_t* data = reinterpret_cast<const uint8_t*>(
      static_cast<uintptr_t>(load_u32(anm2 + ISAAC_ANM2_GET_ANIM_TWO_STAGE_DATA_OFF)));
  const uint32_t count = load_u32(data + ISAAC_ANM2_GET_ANIM_TWO_STAGE_COUNT_OFF);
  plan.count = count;
  if (count != 0u) {
    const uint8_t* list = reinterpret_cast<const uint8_t*>(
        static_cast<uintptr_t>(load_u32(data + ISAAC_ANM2_GET_ANIM_TWO_STAGE_LIST_OFF)));
    const uint8_t* name = reinterpret_cast<const uint8_t*>(static_cast<uintptr_t>(name_addr));
    for (uint32_t o = 0u; o < count; ++o) {
      const uint8_t* elem =
          list + o * static_cast<uint32_t>(ISAAC_ANM2_GET_ANIM_TWO_STAGE_STRIDE);
      const uint32_t cap = load_u32(elem + ISAAC_ANM2_GET_ANIM_TWO_STAGE_SSO_CAP_OFF);
      const uint8_t* str = cap < ISAAC_ANM2_GET_ANIM_TWO_STAGE_SSO_CAP
          ? elem
          : reinterpret_cast<const uint8_t*>(static_cast<uintptr_t>(load_u32(elem)));
      if (isaac_anm2_strcmp_inline(reinterpret_cast<const char*>(str),
                                   reinterpret_cast<const char*>(name)) == 0) {
        plan.outer = static_cast<int32_t>(o);
        plan.found_outer = 1;
        break;
      }
    }
  }
  if (plan.found_outer == 0) {
    if (out != nullptr) *out = plan;
    return; /* miss -> -1 */
  }
  const uint8_t* inner = reinterpret_cast<const uint8_t*>(
      static_cast<uintptr_t>(load_u32(anm2 + ISAAC_ANM2_GET_ANIM_TWO_STAGE_ANIM_OFF)));
  const uint32_t inner_count =
      load_u32(inner + ISAAC_ANM2_GET_ANIM_TWO_STAGE_INNER_COUNT_OFF);
  plan.inner_count = inner_count;
  plan.frame_int = isaac_anm2_cvttss2si_bits(
      load_u32(anm2 + ISAAC_ANM2_GET_ANIM_TWO_STAGE_FRAME_FLOAT_OFF));
  if (inner_count != 0u) {
    const uint8_t* elems = reinterpret_cast<const uint8_t*>(
        static_cast<uintptr_t>(load_u32(inner + ISAAC_ANM2_GET_ANIM_TWO_STAGE_INNER_ELEMS_OFF)));
    int32_t best = -1;
    int32_t best_delta = -1;
    for (uint32_t i = 0u; i < inner_count; ++i) {
      const int32_t id = static_cast<int32_t>(load_u32(elems + i * 8u));
      if (id != plan.outer) continue;
      const int32_t payload =
          static_cast<int32_t>(load_u32(elems + i * 8u + 4u));
      const int32_t delta = plan.frame_int - payload;
      if (delta <= 0) continue; /* PE jle skip */
      if (best_delta < 0 || delta < best_delta) {
        best_delta = delta;
        best = payload;
      }
    }
    plan.best_delta = best_delta;
    plan.best_payload = best;
    plan.result = best;
  }
  if (out != nullptr) {
    *out = plan;
  }
}

/* ---- v35: 0x0040b0c0 three-stage index lookup ---------------------------- */

void isaac_anm2_three_stage_lookup_plan(uint8_t* anm2,
                                        uint32_t data_name_addr,
                                        uint32_t extra_name_addr,
                                        int32_t id,
                                        IsaacAnm2ThreeStageLookupPlan* out) {
  IsaacAnm2ThreeStageLookupPlan plan;
  plan.entered = 0;
  plan.data = 0u;
  plan.data_found = 0;
  plan.extra_index = -1;
  plan.extra_found = 0;
  plan.inner_count = 0u;
  plan.inner_id_val = 0;
  plan.elem_byte_offset = 0;
  plan.result = 0;
  plan.fail_log_needed = 0;
  plan.fail_log_va = ISAAC_ANM2_THREE_STAGE_LOOKUP_FAIL_LOG_VA;
  plan.fail_log_level = ISAAC_ANM2_THREE_STAGE_LOOKUP_FAIL_LOG_LEVEL;
  plan.fail_log_str_va = ISAAC_ANM2_THREE_STAGE_LOOKUP_FAIL_LOG_STR_VA;
  plan.host_call_count = 0;
  plan.pure_complete = 1;

  if (anm2 == nullptr) {
    if (out != nullptr) *out = plan;
    return;
  }
  plan.entered = 1;

  /* Stage 1: AD name walk (0x40bcd0) — base [this+0x74], count [this+0x78],
     element stride 0x13c. Consumed by reference. */
  const uint32_t ad_base = load_u32(anm2 + ISAAC_ANM2_OFF_ANIM_DATA_74);
  const uint32_t ad_count = load_u32(anm2 + ISAAC_ANM2_OFF_ANIM_COUNT_78);
  const int32_t data_index = isaac_anm2_anim_data_index_by_name(
      reinterpret_cast<const uint8_t*>(static_cast<uintptr_t>(ad_base)),
      ad_count,
      reinterpret_cast<const char*>(static_cast<uintptr_t>(data_name_addr)));
  if (data_index < 0) {
    if (out != nullptr) *out = plan;
    return; /* miss -> 0 */
  }
  plan.data_found = 1;
  const uint32_t data =
      ad_base + static_cast<uint32_t>(data_index) *
                    static_cast<uint32_t>(ISAAC_ANM2_ANIM_DATA_STRIDE);
  plan.data = data;

  /* Stage 2: extras walk vs extraNameAddr. */
  const uint32_t ex_count =
      load_u32(anm2 + ISAAC_ANM2_THREE_STAGE_LOOKUP_EXTRAS_COUNT_OFF);
  if (ex_count != 0u) {
    const uint8_t* ex_list = reinterpret_cast<const uint8_t*>(
        static_cast<uintptr_t>(load_u32(anm2 + ISAAC_ANM2_THREE_STAGE_LOOKUP_EXTRAS_LIST_OFF)));
    const uint8_t* extra_name =
        reinterpret_cast<const uint8_t*>(static_cast<uintptr_t>(extra_name_addr));
    for (uint32_t i = 0u; i < ex_count; ++i) {
      const uint8_t* elem =
          ex_list + i * static_cast<uint32_t>(ISAAC_ANM2_THREE_STAGE_LOOKUP_EXTRAS_STRIDE);
      const uint32_t cap = load_u32(elem + ISAAC_ANM2_THREE_STAGE_LOOKUP_SSO_CAP_OFF);
      const uint8_t* str = cap < ISAAC_ANM2_THREE_STAGE_LOOKUP_SSO_CAP
          ? elem
          : reinterpret_cast<const uint8_t*>(static_cast<uintptr_t>(load_u32(elem)));
      if (isaac_anm2_strcmp_inline(reinterpret_cast<const char*>(str),
                                   reinterpret_cast<const char*>(extra_name)) == 0) {
        plan.extra_index = static_cast<int32_t>(i);
        plan.extra_found = 1;
        break;
      }
    }
  }
  if (plan.extra_found == 0) {
    plan.fail_log_needed = 1;
    plan.host_call_count = 1;
    plan.pure_complete = 0;
    if (out != nullptr) *out = plan;
    return;
  }

  /* Stage 3: inner id-match on the data block. */
  const uint8_t* data_bytes =
      reinterpret_cast<const uint8_t*>(static_cast<uintptr_t>(data));
  const uint32_t inner_count =
      load_u32(data_bytes + ISAAC_ANM2_THREE_STAGE_LOOKUP_INNER_COUNT_OFF);
  plan.inner_count = inner_count;
  if (inner_count != 0u) {
    const uint8_t* elems = reinterpret_cast<const uint8_t*>(
        static_cast<uintptr_t>(load_u32(data_bytes + ISAAC_ANM2_THREE_STAGE_LOOKUP_INNER_ELEMS_OFF)));
    for (uint32_t i = 0u; i < inner_count; ++i) {
      const uint8_t* elem =
          elems + i * static_cast<uint32_t>(ISAAC_ANM2_THREE_STAGE_LOOKUP_INNER_STRIDE);
      const int32_t elem_id = static_cast<int32_t>(
          load_u32(elem + ISAAC_ANM2_THREE_STAGE_LOOKUP_INNER_ID_OFF));
      if (elem_id != id) continue;
      const int32_t limit = static_cast<int32_t>(
          load_u32(elem + ISAAC_ANM2_THREE_STAGE_LOOKUP_INNER_LIMIT_OFF));
      if (id < 0 || id >= limit) continue; /* signed js / jge */
      plan.inner_id_val = id;
      plan.elem_byte_offset =
          id * static_cast<int32_t>(ISAAC_ANM2_THREE_STAGE_LOOKUP_FOUND_STRIDE);
      plan.result =
          id * static_cast<int32_t>(ISAAC_ANM2_THREE_STAGE_LOOKUP_FOUND_STRIDE) +
          static_cast<int32_t>(load_u32(elem + ISAAC_ANM2_THREE_STAGE_LOOKUP_INNER_BASE_OFF));
      break;
    }
  }
  if (out != nullptr) {
    *out = plan;
  }
}

/* ---- v36: 0x0040b23a bounds-checked element getter ----------------------- */

/* ---- v37: 0x0040b44a layer-array name->index ----------------------------- */

void isaac_anm2_layer_name_index_plan(uint8_t* anm2,
                                      uint32_t name_addr,
                                      IsaacAnm2LayerNameIndexPlan* out) {
  IsaacAnm2LayerNameIndexPlan plan;
  plan.entered = 0;
  plan.count = 0;
  plan.base = 0u;
  plan.found_index = -1;
  plan.elem = 0u;
  plan.result = 0u;
  plan.log_needed = 0;
  plan.log_va = ISAAC_ANM2_LAYER_NAME_INDEX_EMPTY_STR_VA;
  plan.log_level = 0;
  plan.log_str_va = ISAAC_ANM2_LAYER_NAME_INDEX_EMPTY_STR_VA;
  plan.host_call_count = 0;
  plan.pure_complete = 1;

  if (anm2 == nullptr) {
    if (out != nullptr) *out = plan;
    return;
  }
  plan.entered = 1;
  const uint32_t count =
      load_u32(anm2 + ISAAC_ANM2_LAYER_NAME_INDEX_COUNT_OFF);
  const uint32_t base = load_u32(anm2 + ISAAC_ANM2_LAYER_NAME_INDEX_BASE_OFF);
  plan.count = static_cast<int32_t>(count);
  plan.base = base;
  if (count == 0u) {
    if (out != nullptr) *out = plan;
    return;
  }
  for (uint32_t i = 0u; i < count; ++i) {
    const uint32_t slot =
        base + i * static_cast<uint32_t>(ISAAC_ANM2_LAYER_NAME_INDEX_STRIDE);
    const uint32_t elem_ptr =
        load_u32(reinterpret_cast<const uint8_t*>(slot));
    if (elem_ptr == 0u) {
      continue;
    }
    const uint32_t name_at = elem_ptr + ISAAC_ANM2_LAYER_NAME_INDEX_NAME_OFF;
    const uint32_t cap =
        load_u32(reinterpret_cast<const uint8_t*>(name_at + 0x14u));
    const uint32_t str =
        (cap < static_cast<uint32_t>(ISAAC_ANM2_LAYER_NAME_INDEX_SSO_CAP))
            ? name_at
            : load_u32(reinterpret_cast<const uint8_t*>(name_at));
    if (isaac_anm2_strcmp_inline(reinterpret_cast<const char*>(str),
                                  reinterpret_cast<const char*>(name_addr)) == 0) {
      plan.found_index = static_cast<int32_t>(i);
      plan.elem = base + i * static_cast<uint32_t>(ISAAC_ANM2_LAYER_NAME_INDEX_STRIDE);
      plan.result = plan.elem;
      break;
    }
  }
  if (out != nullptr) {
    *out = plan;
  }
}
void isaac_anm2_bounded_elem_get_plan(uint8_t* anm2,
                                      int32_t index,
                                      IsaacAnm2BoundedElemGetPlan* out) {
  IsaacAnm2BoundedElemGetPlan plan;
  plan.entered = 0;
  plan.count = 0;
  plan.base = 0u;
  plan.index = index;
  plan.elem = 0u;
  plan.in_range = 0;
  plan.log_needed = 0;
  plan.log_va = ISAAC_ANM2_BOUNDED_ELEM_GET_LOG_VA;
  plan.log_level = ISAAC_ANM2_BOUNDED_ELEM_GET_LOG_LEVEL;
  plan.log_str_va = ISAAC_ANM2_BOUNDED_ELEM_GET_LOG_STR_VA;
  plan.host_call_count = 0;
  plan.pure_complete = 1;

  if (anm2 == nullptr) {
    if (out != nullptr) *out = plan;
    return;
  }
  plan.entered = 1;
  const int32_t count = static_cast<int32_t>(
      load_u32(anm2 + ISAAC_ANM2_BOUNDED_ELEM_GET_COUNT_OFF));
  const uint32_t base = load_u32(anm2 + ISAAC_ANM2_BOUNDED_ELEM_GET_BASE_OFF);
  plan.count = count;
  plan.base = base;
  /* PE: test esi,esi; js / cmp esi,[this+0x80]; jge — SIGNED bounds. */
  if (index < 0 || index >= count) {
    plan.log_needed = 1;
    plan.host_call_count = 1;
    plan.pure_complete = 0;
    if (out != nullptr) *out = plan;
    return;
  }
  plan.in_range = 1;
  /* PE: lea eax,[esi+esi*4]; shl eax,5 = index*0xa0; add [this+0x7c]. */
  plan.elem = base + static_cast<uint32_t>(index) *
                         static_cast<uint32_t>(ISAAC_ANM2_BOUNDED_ELEM_GET_STRIDE);
  if (out != nullptr) {
    *out = plan;
  }
}
/* Length-bounded byte equality (v38 0x40cae0 semantics: length already
   checked by caller; compare n bytes at a and b). */
/* ---- v39: 0x0040b4d0 +0x84/+0x88 bounded getter -------------------------- */

/* ---- v40: 0x0040b520 +0x84/+0x88 name->index ----------------------------- */

void isaac_anm2_subarray_name_index_plan(uint8_t* anm2,
                                         uint32_t name_addr,
                                         IsaacAnm2SubarrayNameIndexPlan* out) {
  IsaacAnm2SubarrayNameIndexPlan plan;
  plan.entered = 0;
  plan.count = 0;
  plan.base = 0u;
  plan.found_index = -1;
  plan.result = -1;
  plan.name_addr = name_addr;
  plan.heap_count = 0;
  plan.log_needed = 0;
  plan.log_va = 0u;
  plan.log_level = 0;
  plan.host_call_count = 0;
  plan.pure_complete = 1;

  if (anm2 == nullptr || name_addr == 0u) {
    if (out != nullptr) *out = plan;
    return;
  }
  plan.entered = 1;
  const int32_t count = static_cast<int32_t>(
      load_u32(anm2 + ISAAC_ANM2_SUBARRAY_NAME_INDEX_COUNT_OFF));
  const uint32_t base =
      load_u32(anm2 + ISAAC_ANM2_SUBARRAY_NAME_INDEX_BASE_OFF);
  plan.count = count;
  plan.base = base;
  /* PE: test ebx,ebx; jle miss — SIGNED count, <= 0 -> -1. */
  if (count <= 0) {
    if (out != nullptr) *out = plan;
    return;
  }
  const char* const want = reinterpret_cast<const char*>(name_addr);
  for (int32_t i = 0; i < count; ++i) {
    const uint32_t elem =
        base + static_cast<uint32_t>(i) *
                   static_cast<uint32_t>(ISAAC_ANM2_SUBARRAY_NAME_INDEX_STRIDE);
    const uint8_t* const elem_bytes = reinterpret_cast<const uint8_t*>(elem);
    const uint32_t cap =
        load_u32(elem_bytes + ISAAC_ANM2_SUBARRAY_NAME_INDEX_SSO_CAP_OFF);
    uint32_t str = elem;
    if (cap >= static_cast<uint32_t>(ISAAC_ANM2_SUBARRAY_NAME_INDEX_SSO_CAP)) {
      plan.heap_count += 1;
      str = load_u32(elem_bytes);
    }
    if (isaac_anm2_strcmp_inline(reinterpret_cast<const char*>(str), want) == 0) {
      plan.found_index = i;
      plan.result = i;
      break;
    }
  }
  if (out != nullptr) {
    *out = plan;
  }
}
void isaac_anm2_subarray_get_plan(uint8_t* anm2,
                                  int32_t index,
                                  IsaacAnm2SubarrayGetPlan* out) {
  IsaacAnm2SubarrayGetPlan plan;
  plan.entered = 0;
  plan.count = 0;
  plan.base = 0u;
  plan.index = index;
  plan.result = 0u;
  plan.in_range = 0;
  plan.log_needed = 0;
  plan.log_va = ISAAC_ANM2_SUBARRAY_GET_LOG_VA;
  plan.log_level = ISAAC_ANM2_SUBARRAY_GET_LOG_LEVEL;
  plan.log_str_va = ISAAC_ANM2_SUBARRAY_GET_LOG_STR_VA;
  plan.log_name_addr = 0u;
  plan.host_call_count = 0;
  plan.pure_complete = 1;

  if (anm2 == nullptr) {
    if (out != nullptr) *out = plan;
    return;
  }
  plan.entered = 1;
  const int32_t count = static_cast<int32_t>(
      load_u32(anm2 + ISAAC_ANM2_SUBARRAY_GET_COUNT_OFF));
  const uint32_t base =
      load_u32(anm2 + ISAAC_ANM2_SUBARRAY_GET_BASE_OFF);
  plan.count = count;
  plan.base = base;
  /* this-name SSO for the log: cap [this+0x14]; inline this else [this]. */
  const uint32_t name_cap =
      load_u32(anm2 + ISAAC_ANM2_SUBARRAY_GET_NAME_CAP_OFF);
  plan.log_name_addr =
      (name_cap < static_cast<uint32_t>(ISAAC_ANM2_SUBARRAY_GET_SSO_CAP))
          ? reinterpret_cast<uintptr_t>(anm2)
          : load_u32(anm2);
  /* PE: test esi,esi; js / cmp esi,[this+0x88]; jl — SIGNED bounds. */
  if (index < 0 || index >= count) {
    plan.log_needed = 1;
    plan.host_call_count = 1;
    plan.pure_complete = 0;
  } else {
    plan.in_range = 1;
  }
  /* Result computed UNCONDITIONALLY: lea [edi+edi*2]; lea [eax+ecx*4]. */
  plan.result = base + static_cast<uint32_t>(index) *
                           static_cast<uint32_t>(ISAAC_ANM2_SUBARRAY_GET_STRIDE);
  if (out != nullptr) {
    *out = plan;
  }
}
/* ---- v41: 0x0040bbf0 0x6c-byte struct copy ------------------------------- */

void isaac_anm2_struct_copy_6c(uint8_t* dst,
                               const uint8_t* src,
                               IsaacAnm2StructCopy6cPlan* out) {
  IsaacAnm2StructCopy6cPlan plan;
  plan.entered = 0;
  plan.dst_addr = 0u;
  plan.src_addr = 0u;
  plan.byte_count = ISAAC_ANM2_STRUCT_COPY_6C_SIZE;
  plan.log_needed = 0;
  plan.log_va = 0u;
  plan.log_level = 0;
  plan.host_call_count = 0;
  plan.pure_complete = 1;

  if (dst != nullptr && src != nullptr) {
    plan.entered = 1;
    plan.dst_addr = reinterpret_cast<uintptr_t>(dst);
    plan.src_addr = reinterpret_cast<uintptr_t>(src);
    /* PE field-by-field copy order (dword pairs, byte, 16B movups x2, movq,
       dwords, byte, dwords). Offsets/widths are the pinned contract. */
    for (uint32_t off = 0u; off < 0x2cu; off += 4u) {
      store_u32(dst + off, load_u32(src + off));
    }
    dst[0x2c] = src[0x2c];
    for (uint32_t off = 0x30u; off < 0x50u; off += 4u) {
      store_u32(dst + off, load_u32(src + off));
    }
    /* 0x50: movq (8 bytes, two dwords). */
    store_u32(dst + 0x50u, load_u32(src + 0x50u));
    store_u32(dst + 0x54u, load_u32(src + 0x54u));
    store_u32(dst + 0x58u, load_u32(src + 0x58u));
    store_u32(dst + 0x5cu, load_u32(src + 0x5cu));
    dst[0x60] = src[0x60];
    store_u32(dst + 0x64u, load_u32(src + 0x64u));
    store_u32(dst + 0x68u, load_u32(src + 0x68u));
  }
  if (out != nullptr) {
    *out = plan;
  }
}
/* ---- v42: 0x0040c310 self-assign-guarded string assign ------------------- */

void isaac_anm2_string_assign_guard_plan(uint8_t* anm2,
                                         uint32_t src_addr,
                                         IsaacAnm2StringAssignGuardPlan* out) {
  IsaacAnm2StringAssignGuardPlan plan;
  plan.entered = 0;
  plan.this_addr = 0u;
  plan.src_addr = src_addr;
  plan.self_alias = 0;
  plan.src_data = 0u;
  plan.src_size = 0;
  plan.host_needed = 0;
  plan.host_va = ISAAC_ANM2_STRING_ASSIGN_GUARD_HOST_VA;
  plan.log_needed = 0;
  plan.log_va = 0u;
  plan.log_level = 0;
  plan.host_call_count = 0;
  plan.pure_complete = 1;

  if (anm2 == nullptr) {
    if (out != nullptr) *out = plan;
    return;
  }
  plan.entered = 1;
  plan.this_addr = reinterpret_cast<uintptr_t>(anm2);
  /* PE: cmp esi,eax (this vs src); je return — self-alias is a PURE no-op. */
  if (src_addr == reinterpret_cast<uintptr_t>(anm2)) {
    plan.self_alias = 1;
    if (out != nullptr) *out = plan;
    return;
  }
  /* src std::string SSO decode: cap [src+0x14] jb 0x10 inline : heap [src];
     size [src+0x10]. */
  const uint8_t* const src = reinterpret_cast<const uint8_t*>(src_addr);
  const uint32_t cap = load_u32(src + ISAAC_ANM2_STRING_ASSIGN_GUARD_SSO_CAP_OFF);
  plan.src_size = static_cast<int32_t>(
      load_u32(src + ISAAC_ANM2_STRING_ASSIGN_GUARD_SIZE_OFF));
  plan.src_data =
      (cap < static_cast<uint32_t>(ISAAC_ANM2_STRING_ASSIGN_GUARD_SSO_CAP))
          ? src_addr
          : load_u32(src);
  /* Host STRING_ASSIGN continuation (0x40ccd0) on this arm. */
  plan.host_needed = 1;
  plan.host_call_count = 1;
  plan.pure_complete = 0;
  if (out != nullptr) {
    *out = plan;
  }
}
/* ---- v43: 0x0040c340 SSO C-string ctor ---------------------------------- */

void isaac_anm2_sso_cstr_ctor_plan(uint8_t* anm2,
                                   uint32_t cstr_addr,
                                   IsaacAnm2SsoCstrCtorPlan* out) {
  IsaacAnm2SsoCstrCtorPlan plan;
  plan.entered = 0;
  plan.this_addr = 0u;
  plan.cstr_addr = cstr_addr;
  plan.str_len = 0;
  plan.host_needed = 0;
  plan.host_va = ISAAC_ANM2_SSO_CSTR_CTOR_HOST_VA;
  plan.log_needed = 0;
  plan.log_va = 0u;
  plan.log_level = 0;
  plan.host_call_count = 0;
  plan.pure_complete = 0;

  if (anm2 == nullptr || cstr_addr == 0u) {
    if (out != nullptr) *out = plan;
    return;
  }
  plan.entered = 1;
  plan.this_addr = reinterpret_cast<uintptr_t>(anm2);
  /* PE pure strlen: mov cl,[eax]; inc eax; test cl,cl; jne — until NUL;
     length = eax_end - (cstr+1). */
  const uint8_t* p = reinterpret_cast<const uint8_t*>(cstr_addr);
  uint32_t len = 0u;
  while (p[len] != 0u) {
    ++len;
  }
  plan.str_len = static_cast<int32_t>(len);
  /* Host STRING_ASSIGN continuation (0x40ccd0) — always on a ctor. */
  plan.host_needed = 1;
  plan.host_call_count = 1;
  if (out != nullptr) {
    *out = plan;
  }
}
/* ---- v44: 0x0040d0e0 float-vector ctor (7 float inputs) ------------------
   CORRECTED by the v62 unit: body 0x0040d0e0..0x40d13a (`ret 0x10` @
   0x40d138; the old 0x40d11d end pin was mid-instruction). Seven distinct
   float sources: a0/a1/a2/a6 from [ebp+8/0xc/0x10/0x14], x1/x2/x3 from
   xmm1/xmm2/xmm3. Stores: +0x10..+0x1c := 0, a0 -> +0x0c, a1 -> +0x20,
   a2 -> +0x24, x1 -> +0x00, x2 -> +0x04, x3 -> +0x08, a6 -> +0x28. */

void isaac_anm2_floatvec_ctor(uint8_t* anm2,
                              float a0,
                              float a1,
                              float a2,
                              float x1,
                              float x2,
                              float x3,
                              float a6,
                              IsaacAnm2FloatVecCtorPlan* out) {
  IsaacAnm2FloatVecCtorPlan plan;
  plan.entered = 0;
  plan.this_addr = 0u;
  plan.a0_bits = 0u;
  plan.a1_bits = 0u;
  plan.a2_bits = 0u;
  plan.x1_bits = 0u;
  plan.x2_bits = 0u;
  plan.x3_bits = 0u;
  plan.a6_bits = 0u;
  plan.log_needed = 0;
  plan.log_va = 0u;
  plan.log_level = 0;
  plan.host_call_count = 0;
  plan.pure_complete = 1;

  if (anm2 == nullptr) {
    if (out != nullptr) *out = plan;
    return;
  }
  plan.entered = 1;
  plan.this_addr = reinterpret_cast<uintptr_t>(anm2);
  uint32_t b0 = 0u, b1 = 0u, b2 = 0u, b3 = 0u, b4 = 0u, b5 = 0u, b6 = 0u;
  __builtin_memcpy(&b0, &a0, 4);
  __builtin_memcpy(&b1, &a1, 4);
  __builtin_memcpy(&b2, &a2, 4);
  __builtin_memcpy(&b3, &x1, 4);
  __builtin_memcpy(&b4, &x2, 4);
  __builtin_memcpy(&b5, &x3, 4);
  __builtin_memcpy(&b6, &a6, 4);
  plan.a0_bits = b0;
  plan.a1_bits = b1;
  plan.a2_bits = b2;
  plan.x1_bits = b3;
  plan.x2_bits = b4;
  plan.x3_bits = b5;
  plan.a6_bits = b6;

  /* PE store order: zeros first, then a0 -> +0x0c, a1 -> +0x20,
     a2 -> +0x24, then xmm1 -> +0x00 (0x40d124), xmm2 -> +0x04 (0x40d128),
     xmm3 -> +0x08 (0x40d12d), [ebp+0x14] -> +0x28 (0x40d132). */
  store_u32(anm2 + 0x10u, 0u);
  store_u32(anm2 + 0x14u, 0u);
  store_u32(anm2 + 0x18u, 0u);
  store_u32(anm2 + 0x1cu, 0u);
  store_u32(anm2 + 0x0cu, b0);
  store_u32(anm2 + 0x20u, b1);
  store_u32(anm2 + 0x24u, b2);
  store_u32(anm2 + 0x00u, b3);
  store_u32(anm2 + 0x04u, b4);
  store_u32(anm2 + 0x08u, b5);
  store_u32(anm2 + 0x28u, b6);
  if (out != nullptr) {
    *out = plan;
  }
}
/* ---- v45: 0x0040ca70 ORDERED memcmp -------------------------------------- */

int32_t isaac_anm2_ordered_memcmp(uint32_t a_addr,
                                  uint32_t b_addr,
                                  uint32_t n,
                                  IsaacAnm2OrderedMemcmpPlan* out) {
  IsaacAnm2OrderedMemcmpPlan plan;
  plan.entered = 0;
  plan.a_addr = a_addr;
  plan.b_addr = b_addr;
  plan.n = static_cast<int32_t>(n);
  plan.result = 0;
  plan.log_needed = 0;
  plan.log_va = 0u;
  plan.log_level = 0;
  plan.host_call_count = 0;
  plan.pure_complete = 1;
  if (out != nullptr) {
    *out = plan;
  }
  if (a_addr == 0u || b_addr == 0u) {
    return 0;
  }
  plan.entered = 1;
  const uint8_t* const a = reinterpret_cast<const uint8_t*>(a_addr);
  const uint8_t* const b = reinterpret_cast<const uint8_t*>(b_addr);
  /* PE: dword loop while n>=4, then byte tail; order is UNSIGNED (cmp +
     sbb/or -> -1/1). */
  int32_t result = 0;
  for (uint32_t i = 0u; i < n; ++i) {
    const uint8_t da = a[i];
    const uint8_t db = b[i];
    if (da != db) {
      result = da < db ? -1 : 1;
      break;
    }
  }
  plan.result = result;
  if (out != nullptr) {
    *out = plan;
  }
  return result;
}
/* ---- v46: 0x0040c6f0 hash-table probe -------------------------------- */

void isaac_anm2_hash_probe_plan(uint32_t table_base,
                                uint32_t key,
                                uint32_t end_lo,
                                uint32_t end_hi,
                                IsaacAnm2HashProbePlan* out) {
  IsaacAnm2HashProbePlan plan;
  plan.entered = 0;
  plan.table_base = table_base;
  plan.key = key;
  plan.end_lo = end_lo;
  plan.end_hi = end_hi;
  plan.index = 0u;
  plan.result = 0u;
  plan.log_needed = 0;
  plan.log_va = 0u;
  plan.log_level = 0;
  plan.host_call_count = 0;
  plan.pure_complete = 1;

  if (table_base == 0u) {
    if (out != nullptr) *out = plan;
    return;
  }
  const uint32_t end = end_lo + end_hi;
  plan.index = (key - 1u) & (end - 1u);
  plan.entered = 1;
  plan.result =
      load_u32(reinterpret_cast<const uint8_t*>(table_base + plan.index * 4u));
  if (out != nullptr) {
    *out = plan;
  }
}

static bool bytes_equal(uint32_t a, uint32_t b, uint32_t n) {
  const uint8_t* pa = reinterpret_cast<const uint8_t*>(a);
  const uint8_t* pb = reinterpret_cast<const uint8_t*>(b);
  for (uint32_t i = 0u; i < n; ++i) {
    if (pa[i] != pb[i]) return false;
  }
  return true;
}

/* ---- v48: 0x0040c780 float-pointer min + 0x0040c790 SSO sized-eq --------- */

static int32_t f32_bits_is_nan(uint32_t bits) {
  /* Exponent all ones with a non-zero mantissa. */
  return ((bits & 0x7f800000u) == 0x7f800000u &&
          (bits & 0x007fffffu) != 0u)
             ? 1
             : 0;
}

uint32_t isaac_anm2_float_min_plan(uint32_t a_addr,
                                   uint32_t b_addr,
                                   IsaacAnm2FloatMinPlan* out) {
  IsaacAnm2FloatMinPlan plan;
  plan.entered = 0;
  plan.a_addr = a_addr;
  plan.b_addr = b_addr;
  plan.a_bits = 0u;
  plan.b_bits = 0u;
  plan.unordered = 0;
  plan.takes_b = 0;
  plan.result_addr = a_addr;
  plan.pure_complete = 1;
  if (a_addr == 0u || b_addr == 0u) {
    if (out != nullptr) *out = plan;
    return plan.result_addr;
  }
  plan.entered = 1;
  const uint32_t a_bits = load_guest_u32(a_addr);
  const uint32_t b_bits = load_guest_u32(b_addr);
  plan.a_bits = a_bits;
  plan.b_bits = b_bits;
  /* comiss a,b: PF set on unordered. NaN on either side -> NOT cmova. */
  const int32_t unordered =
      f32_bits_is_nan(a_bits) | f32_bits_is_nan(b_bits);
  plan.unordered = unordered;
  /* cmova = CF==0 && ZF==0 -> a > b ORDERED. */
  const float a = __builtin_bit_cast(float, a_bits);
  const float b = __builtin_bit_cast(float, b_bits);
  plan.takes_b = (unordered == 0 && a > b) ? 1 : 0;
  plan.result_addr = plan.takes_b != 0 ? b_addr : a_addr;
  if (out != nullptr) *out = plan;
  return plan.result_addr;
}

int32_t isaac_anm2_sso_sized_eq_plan(uint32_t a_addr,
                                     uint32_t b_addr,
                                     IsaacAnm2SsoSizedEqPlan* out) {
  IsaacAnm2SsoSizedEqPlan plan;
  plan.entered = 0;
  plan.a_addr = a_addr;
  plan.b_addr = b_addr;
  plan.a_cap = 0u;
  plan.a_size = 0u;
  plan.a_heap = 0;
  plan.a_chars = a_addr;
  plan.b_cap = 0u;
  plan.b_size = 0u;
  plan.b_heap = 0;
  plan.b_chars = b_addr;
  plan.result = 0;
  plan.helper_va = static_cast<uint32_t>(ISAAC_ANM2_SSO_SIZED_EQ_HELPER_VA);
  plan.pure_complete = 1;
  if (a_addr == 0u || b_addr == 0u) {
    if (out != nullptr) *out = plan;
    return 0;
  }
  plan.entered = 1;
  /* PE: cmp [edx+0x14],0x10 ; jb INLINE — UNSIGNED strict below. */
  const uint32_t b_cap = load_guest_u32(b_addr + 0x14u);
  const uint32_t b_size = load_guest_u32(b_addr + 0x10u);
  plan.b_cap = b_cap;
  plan.b_size = b_size;
  if (b_cap < static_cast<uint32_t>(ISAAC_ANM2_SSO_SIZED_EQ_SSO_CAP)) {
    plan.b_heap = 0;
    plan.b_chars = b_addr;
  } else {
    plan.b_heap = 1;
    plan.b_chars = load_guest_u32(b_addr);
  }
  const uint32_t a_cap = load_guest_u32(a_addr + 0x14u);
  const uint32_t a_size = load_guest_u32(a_addr + 0x10u);
  plan.a_cap = a_cap;
  plan.a_size = a_size;
  if (a_cap < static_cast<uint32_t>(ISAAC_ANM2_SSO_SIZED_EQ_SSO_CAP)) {
    plan.a_heap = 0;
    plan.a_chars = a_addr;
  } else {
    plan.a_heap = 1;
    plan.a_chars = load_guest_u32(a_addr);
  }
  /* 0x40cae0: cmp edx,[ebp+0xc] ; jne -> 0 (a_size vs b_size), then byte
     compare over a_size bytes. The family bytes_equal law. */
  if (a_size == b_size && bytes_equal(plan.a_chars, plan.b_chars, a_size)) {
    plan.result = 1;
  }
  if (out != nullptr) *out = plan;
  return plan.result;
}

/* ---- v38: 0x0040b310 layer name->slot sized-eq --------------------------- */

void isaac_anm2_layer_slot_sized_eq_plan(uint8_t* anm2,
                                         uint32_t arg_addr,
                                         IsaacAnm2LayerSlotSizedEqPlan* out) {
  IsaacAnm2LayerSlotSizedEqPlan plan;
  plan.entered = 0;
  plan.count = 0;
  plan.base = 0u;
  plan.found_index = -1;
  plan.slot = 0u;
  plan.result = 0u;
  plan.arg_size = 0;
  plan.local_heap_count = 0;
  plan.log_needed = 0;
  plan.log_va = 0u;
  plan.log_level = 0;
  plan.log_str_va = 0u;
  plan.host_call_count = 0;
  plan.pure_complete = 1;

  if (anm2 == nullptr || arg_addr == 0u) {
    if (out != nullptr) *out = plan;
    return;
  }
  plan.entered = 1;
  const uint32_t count =
      load_u32(anm2 + ISAAC_ANM2_LAYER_SLOT_SIZED_EQ_COUNT_OFF);
  const uint32_t base =
      load_u32(anm2 + ISAAC_ANM2_LAYER_SLOT_SIZED_EQ_BASE_OFF);
  plan.count = static_cast<int32_t>(count);
  plan.base = base;

  /* arg std::string at arg_addr: size +0x10, cap +0x14, chars/ptr +0. */
  const uint8_t* const arg = reinterpret_cast<const uint8_t*>(arg_addr);
  const uint32_t arg_size = load_u32(arg + 0x10u);
  const uint32_t arg_cap = load_u32(arg + 0x14u);
  const uint32_t arg_data =
      (arg_cap < static_cast<uint32_t>(ISAAC_ANM2_LAYER_SLOT_SIZED_EQ_SSO_CAP))
          ? arg_addr
          : load_u32(arg);
  plan.arg_size = static_cast<int32_t>(arg_size);

  for (uint32_t i = 0u; i < count; ++i) {
    const uint32_t slot =
        base + i * static_cast<uint32_t>(ISAAC_ANM2_LAYER_SLOT_SIZED_EQ_STRIDE);
    const uint32_t elem_ptr =
        load_u32(reinterpret_cast<const uint8_t*>(slot));
    uint32_t local_size = 0u;
    uint32_t local_data = 0u;
    if (elem_ptr != 0u) {
      const uint32_t name_at =
          elem_ptr + ISAAC_ANM2_LAYER_SLOT_SIZED_EQ_NAME_OFF;
      const uint8_t* const name_bytes =
          reinterpret_cast<const uint8_t*>(name_at);
      const uint32_t cap = load_u32(name_bytes + 0x14u); /* elem+0x1c */
      local_size = load_u32(name_bytes + 0x10u);         /* elem+0x18 */
      if (cap >= static_cast<uint32_t>(ISAAC_ANM2_LAYER_SLOT_SIZED_EQ_SSO_CAP)) {
        plan.local_heap_count += 1;
        local_data = load_u32(name_bytes);
      } else {
        local_data = name_at;
      }
    }
    if (local_size == arg_size && bytes_equal(local_data, arg_data, arg_size)) {
      plan.found_index = static_cast<int32_t>(i);
      plan.slot = slot;
      plan.result = slot;
      break;
    }
  }
  if (out != nullptr) {
    *out = plan;
  }
}
int32_t isaac_anm2_stop_needed(uint32_t data_dword) {
  /* v24: cmp dword [ecx+0x34], 0 ; je SKIP — FULL dword, so 0x100 is needed. */
  return isaac_anm2_advance_cur_needed(data_dword);
}

void isaac_anm2_stop_apply(uint8_t* anm2) {
  if (anm2 == nullptr) {
    return;
  }
  const uint32_t data = load_u32(anm2 + ISAAC_ANM2_OFF_ANIM_DATA_PTR_34);
  if (isaac_anm2_stop_needed(data) != 0) {
    store_u8(anm2 + ISAAC_ANM2_OFF_PLAYING_FLAG_44, 0u);
  }
}

/* ---- v49: 0x0040ae70 SSO name->flag walk (104 callers) ------------------ */

int32_t isaac_anm2_name_flag_assert_needed(uint32_t field_4) {
  /* PE 0x40ae7c: cmp dword [this+4],0 ; je HOST log — FULL-dword test,
     so 0x100 (and 0xffffffff) ARE "empty" and need the host edge. */
  return field_4 == 0u ? 1 : 0;
}

int32_t isaac_anm2_name_flag_sso_inline(uint32_t cap_14) {
  /* PE 0x40aea5: cmp dword [esi+0x14],0x10 ; jb INLINE — UNSIGNED STRICT:
     cap == 0x10 is ALREADY the heap pointer, so 0x10 / 0x100 are NOT inline. */
  return cap_14 < static_cast<uint32_t>(ISAAC_ANM2_NAME_FLAG_SSO_CAP) ? 1 : 0;
}

uint32_t isaac_anm2_name_flag_bit_mask(uint32_t match_index) {
  /* PE 0x40aef4..0x40aef9: mov eax,1 ; shl eax,cl — x86 masks the shift
     count modulo the operand size (32), so index 32 shifts by 0 and index
     0xffffffff would shift by 31 (but the js guard runs first). */
  return static_cast<uint32_t>(1u << (match_index & 31u));
}

int32_t isaac_anm2_name_flag_bit_result(uint32_t bitfield_1c,
                                        uint32_t match_index) {
  /* PE 0x40aeee..0x40af04: test edi,edi ; js -> 0 ; mov eax,1 ; shl eax,cl ;
     test [this+0x1c],eax ; setne al — FULL-dword AND test. */
  if (static_cast<int32_t>(match_index) < 0) {
    return 0;
  }
  const uint32_t bit = isaac_anm2_name_flag_bit_mask(match_index);
  return (bitfield_1c & bit) != 0u ? 1 : 0;
}

int32_t isaac_anm2_name_flag_walk_plan(uint32_t this_addr,
                                       uint32_t name_addr,
                                       IsaacAnm2NameFlagWalkPlan* out) {
  IsaacAnm2NameFlagWalkPlan plan;
  plan.entered = 0;
  plan.this_addr = this_addr;
  plan.name_addr = name_addr;
  plan.owner_addr = 0u;
  plan.count_raw = 0u;
  plan.base_raw = 0u;
  plan.assert_host_needed = 0;
  plan.log_va = static_cast<uint32_t>(ISAAC_ANM2_NAME_FLAG_LOG_VA);
  plan.log_level = static_cast<uint32_t>(ISAAC_ANM2_NAME_FLAG_LOG_LEVEL);
  plan.log_str_va = static_cast<uint32_t>(ISAAC_ANM2_NAME_FLAG_LOG_STR_VA);
  plan.match_index = -1;
  plan.match_cmp = 0;
  plan.match_entry_cap = 0u;
  plan.match_chars_addr = 0u;
  plan.flag_bit = 0u;
  plan.bitfield_raw = 0u;
  plan.result = 0;
  plan.host_call_count = 0;
  plan.pure_complete = 1;
  if (this_addr == 0u || name_addr == 0u) {
    if (out != nullptr) *out = plan;
    return 0;
  }
  plan.entered = 1;
  /* PE 0x40ae7c..0x40ae8e: [this+4]==0 -> HOST 0xa112c0 log, then FALL
     THROUGH — the walk still runs at 0x40ae91 with NO reload of [this+4]. */
  const uint32_t field_4 = load_guest_u32(
      this_addr + static_cast<uint32_t>(ISAAC_ANM2_NAME_FLAG_GATE_OFF));
  plan.assert_host_needed = isaac_anm2_name_flag_assert_needed(field_4);
  /* PE 0x40ae8e log -> FALL THROUGH: the walk still runs after the
     0xa112c0 assert (BandD M5 discriminator). No early return. */
  if (plan.assert_host_needed != 0) {
    plan.host_call_count = 1;
    plan.pure_complete = 0;
    /* FALL THROUGH — PE 0x40ae8e log -> the walk still runs. */
  }
  /* PE 0x40ae91 mov esi,[ebx]: owner = [this]. count read ONCE (0x40ae95);
     the bound stays in ebx for every `cmp edi,ebx ; jb` — no per-iteration
     re-read. */
  const uint32_t owner = load_guest_u32(this_addr);
  plan.owner_addr = owner;
  const uint32_t count = load_guest_u32(
      owner + static_cast<uint32_t>(ISAAC_ANM2_NAME_FLAG_COUNT_OFF));
  plan.count_raw = count;
  if (count == 0u) {
    if (out != nullptr) *out = plan;
    return 0;
  }
  /* PE 0x40ae9f mov esi,[esi+0x8c] — the base is NOT read when count == 0. */
  const uint32_t base = load_guest_u32(
      owner + static_cast<uint32_t>(ISAAC_ANM2_NAME_FLAG_BASE_OFF));
  plan.base_raw = base;
  const char* name = reinterpret_cast<const char*>(guest_ptr(name_addr));
  int32_t match_index = -1;
  for (uint32_t i = 0u; i < count; ++i) { /* jb — UNSIGNED bound */
    const uint32_t entry =
        base + i * static_cast<uint32_t>(ISAAC_ANM2_NAME_FLAG_STRIDE);
    const uint32_t cap = load_guest_u32(
        entry + static_cast<uint32_t>(ISAAC_ANM2_NAME_FLAG_SSO_CAP_OFF));
    const uint32_t chars = isaac_anm2_name_flag_sso_inline(cap) != 0
        ? entry
        : load_guest_u32(entry); /* heap ptr when cap >= 0x10 */
    const int32_t cmp = isaac_anm2_strcmp_inline(
        reinterpret_cast<const char*>(guest_ptr(chars)), name);
    if (cmp == 0) {
      match_index = static_cast<int32_t>(i);
      plan.match_entry_cap = cap;
      plan.match_chars_addr = chars;
      plan.match_cmp = cmp;
      break;
    }
  }
  plan.match_index = match_index;
  if (match_index >= 0) {
    /* PE 0x40aef2..0x40aefb: `mov ecx,[ebp-4]` re-reads this from the SAVED
       slot — the loop clobbered ebx/esi/edi; bitfield at [this+0x1c] (NOT
       the frame-opaque twin's +0x18). */
    const uint32_t bitfield = load_guest_u32(
        this_addr + static_cast<uint32_t>(ISAAC_ANM2_NAME_FLAG_BITFIELD_OFF));
    plan.bitfield_raw = bitfield;
    plan.flag_bit = isaac_anm2_name_flag_bit_mask(
        static_cast<uint32_t>(match_index));
    plan.result = isaac_anm2_name_flag_bit_result(
        bitfield, static_cast<uint32_t>(match_index));
  }
  if (out != nullptr) {
    *out = plan;
  }
  return plan.result;
}

/* ---- v49: 0x0040b000 IsEventTriggered SSO wrapper ------------------------ */

void isaac_anm2_event_trigger_sso_plan(uint8_t* anm2,
                                       uint32_t name_addr,
                                       IsaacAnm2EventTriggerSsoPlan* out) {
  IsaacAnm2EventTriggerSsoPlan plan;
  plan.entered = 0;
  plan.sso = 0;
  plan.chars_addr = name_addr;
  plan.gate_34 = 0;
  plan.call_va = static_cast<uint32_t>(ISAAC_ANM2_EVENT_TRIGGER_SSO_CALL_VA);
  plan.recv_off = static_cast<uint32_t>(ISAAC_ANM2_EVENT_TRIGGER_SSO_STATE_OFF);
  plan.result = 0;
  plan.eax_closed = name_addr & 0xffffff00u;
  plan.host_call_count = 0;
  plan.pure_complete = 1;

  if (anm2 != nullptr) {
    plan.entered = 1;
    /* PE 0x40b007 cmp dword [eax+0x14],0x10 ; jb 0x40b00f — UNSIGNED strict
       below; cap == 0x10 already reads the heap pointer at [name]. */
    const uint32_t cap = load_guest_u32(name_addr + 0x14u);
    const uint32_t chars =
        cap < static_cast<uint32_t>(ISAAC_ANM2_EVENT_TRIGGER_SSO_SSO_CAP)
            ? name_addr
            : load_guest_u32(name_addr);
    plan.sso = cap < static_cast<uint32_t>(ISAAC_ANM2_EVENT_TRIGGER_SSO_SSO_CAP)
        ? 1 : 0;
    plan.chars_addr = chars;
    /* PE 0x40b00f cmp dword [ecx+0x34],0 — FULL-dword gate, 0x100 IS set. */
    const uint32_t gate =
        load_u32(anm2 + static_cast<uint32_t>(ISAAC_ANM2_EVENT_TRIGGER_SSO_GATE_OFF));
    plan.gate_34 = gate != 0u ? 1 : 0;
    /* Closed path: xor al,al — a BYTE clear. EAX upper 3 bytes stay the
       decoded chars address; the observable contract is the AL bool. */
    plan.eax_closed = chars & 0xffffff00u;
    if (gate != 0u) {
      /* Open: push chars; add this,0x30; call 0x40add0 (HOST — frame-opaque-
         owned SSO name->flag walk body, BY REFERENCE). */
      plan.host_call_count = 1;
      plan.pure_complete = 0;
    }
  }

  if (out != nullptr) {
    *out = plan;
  }
}

/* ---- v49 band-b: 0x0040b030 const-char twin ---------------------------- */

void isaac_anm2_event_trigger_cstr_plan(uint8_t* anm2,
                                        uint32_t name_addr,
                                        IsaacAnm2EventTriggerCstrPlan* out) {
  IsaacAnm2EventTriggerCstrPlan plan;
  plan.entered = 0;
  plan.gate_34 = 0;
  plan.chars_addr = name_addr;  /* RAW passthrough — NO SSO decode */
  plan.call_va = static_cast<uint32_t>(ISAAC_ANM2_EVENT_TRIGGER_CSTR_CALL_VA);
  plan.recv_off = static_cast<uint32_t>(ISAAC_ANM2_EVENT_TRIGGER_CSTR_STATE_OFF);
  plan.result = 0;
  plan.host_call_count = 0;
  plan.pure_complete = 1;

  if (anm2 != nullptr) {
    plan.entered = 1;
    /* PE 0x40b034 cmp dword [ecx+0x34],0 — FULL-dword gate, 0x100 IS set. */
    const uint32_t gate =
        load_u32(anm2 + static_cast<uint32_t>(ISAAC_ANM2_EVENT_TRIGGER_CSTR_GATE_OFF));
    plan.gate_34 = gate != 0u ? 1 : 0;
    if (gate != 0u) {
      /* Open: push [ebp+8] RAW (no SSO select — the const-char twin's whole
         difference vs 0x40b000); add this,0x30; call 0x40add0 (HOST — frame-
         opaque-owned SSO name->flag walk body, BY REFERENCE). */
      plan.host_call_count = 1;
      plan.pure_complete = 0;
    }
  }

  if (out != nullptr) {
    *out = plan;
  }
}

/* ---- v50: 0x0040bf30 ReplaceSpritesheet (80 direct e8 callers) ----------- */

int32_t isaac_anm2_replace_spritesheet_bounds(uint32_t layer_id,
                                              uint32_t layer_count) {
  /* PE 0x40bf3e test eax,eax ; js -> false (SIGNED < 0); 0x40bf46
     cmp eax,[ebx+0x80] ; jge -> false (SIGNED >= count). WIDE 0xffffffff
     is -1 -> rejected; a count with bit 31 set rejects every id. */
  const int32_t id = static_cast<int32_t>(layer_id);
  const int32_t count = static_cast<int32_t>(layer_count);
  if (id < 0) return 0;
  return id < count ? 1 : 0;
}

uint32_t isaac_anm2_replace_spritesheet_idx_off(uint32_t layer_id) {
  /* PE 0x40bf55 lea eax,[eax+eax*4] ; 0x40bf58 shl eax,5 = layer_id*5 << 5
     = layer_id*0xa0 mod 2^32. The u32 multiply wraps exactly like the
     machine (no signed intermediate). */
  return layer_id *
         static_cast<uint32_t>(ISAAC_ANM2_REPLACE_SPRITESHEET_LAYER_STRIDE);
}

int32_t isaac_anm2_replace_spritesheet_store_base_source(uint32_t self_alias) {
  /* PE 0x40bf93 cmp edi,esi ; je 0x40bfc0: the SELF arm (0x40bfc0..0x40bfc9)
     stores with the SAVED base [ebp-4]; the ASSIGN arm re-reads [this+0x7c]
     at 0x40bfaa. The pin: self_alias -> BASE_SAVED, else BASE_RE_READ. */
  return self_alias != 0u
      ? static_cast<int32_t>(ISAAC_ANM2_REPLACE_SPRITESHEET_BASE_SAVED)
      : static_cast<int32_t>(ISAAC_ANM2_REPLACE_SPRITESHEET_BASE_RE_READ);
}

int32_t isaac_anm2_replace_spritesheet_plan(
    uint8_t* anm2,
    uint32_t layer_id,
    uint32_t png_addr,
    IsaacAnm2ReplaceSpritesheetPlan* out) {
  IsaacAnm2ReplaceSpritesheetPlan plan;
  plan.entered = 0;
  plan.layer_id = layer_id;
  plan.png_addr = png_addr;
  plan.layer_count_raw = 0u;
  plan.in_bounds = 0;
  plan.base_raw = 0u;
  plan.idx_off = 0u;
  plan.name_addr = 0u;
  plan.name_cap = 0u;
  plan.name_size = 0u;
  plan.name_chars = 0u;
  plan.name_heap = 0;
  plan.png_cap = 0u;
  plan.png_size = 0u;
  plan.png_chars = 0u;
  plan.png_heap = 0;
  plan.names_equal = 0;
  plan.self_alias = 0;
  plan.assign_needed = 0;
  plan.host_va =
      static_cast<uint32_t>(ISAAC_ANM2_REPLACE_SPRITESHEET_HOST_VA);
  plan.host_chars = 0u;
  plan.host_size = 0u;
  plan.store_off = 0u;
  plan.store_value = static_cast<int32_t>(
      ISAAC_ANM2_REPLACE_SPRITESHEET_STORE_VALUE);
  plan.store_base_source = static_cast<int32_t>(
      ISAAC_ANM2_REPLACE_SPRITESHEET_BASE_SAVED);
  plan.store_addr_saved = 0u;
  plan.result = 0;
  plan.host_call_count = 0;
  plan.pure_complete = 1;
  if (anm2 == nullptr || png_addr == 0u) {
    if (out != nullptr) *out = plan;
    return 0;
  }
  plan.entered = 1;
  /* (a) Signed bounds gate; [this+0x80] read at gate time only (0x40bf46). */
  const uint32_t layer_count = load_u32(
      anm2 + static_cast<uint32_t>(ISAAC_ANM2_REPLACE_SPRITESHEET_LAYER_COUNT_OFF));
  plan.layer_count_raw = layer_count;
  plan.in_bounds =
      isaac_anm2_replace_spritesheet_bounds(layer_id, layer_count);
  if (plan.in_bounds == 0) {
    if (out != nullptr) *out = plan;
    return 0; /* js/jge -> 0x40bfd6, return false, no store */
  }
  /* (b) base = [this+0x7c] read AFTER the gate (0x40bf52) and saved to
     [ebp-4]; idx = layer_id*0xa0 saved to [ebp-8]. */
  const uint32_t base = load_u32(
      anm2 + static_cast<uint32_t>(ISAAC_ANM2_REPLACE_SPRITESHEET_LAYER_STATE_OFF));
  plan.base_raw = base;
  const uint32_t idx = isaac_anm2_replace_spritesheet_idx_off(layer_id);
  plan.idx_off = idx;
  /* (c) name std::string object at layer+8 (0x40bf61 lea edi,[eax+8] ;
     0x40bf64 add edi,ecx). */
  const uint32_t name_addr = base + idx +
      static_cast<uint32_t>(ISAAC_ANM2_REPLACE_SPRITESHEET_NAME_OFF);
  plan.name_addr = name_addr;
  const uint32_t name_cap = load_guest_u32(
      name_addr + static_cast<uint32_t>(ISAAC_ANM2_REPLACE_SPRITESHEET_SSO_CAP_OFF));
  plan.name_cap = name_cap;
  plan.name_size = load_guest_u32(
      name_addr + static_cast<uint32_t>(ISAAC_ANM2_REPLACE_SPRITESHEET_SSO_SIZE_OFF));
  if (name_cap < static_cast<uint32_t>(ISAAC_ANM2_REPLACE_SPRITESHEET_SSO_CAP)) {
    plan.name_heap = 0;
    plan.name_chars = name_addr;
  } else {
    plan.name_heap = 1;
    plan.name_chars = load_guest_u32(name_addr);
  }
  /* (d) png decode (0x40bf70..0x40bf81): size read first (edx, saved to
     [ebp+8]), then the chars select. */
  const uint32_t png_cap = load_guest_u32(
      png_addr + static_cast<uint32_t>(ISAAC_ANM2_REPLACE_SPRITESHEET_SSO_CAP_OFF));
  plan.png_cap = png_cap;
  plan.png_size = load_guest_u32(
      png_addr + static_cast<uint32_t>(ISAAC_ANM2_REPLACE_SPRITESHEET_SSO_SIZE_OFF));
  if (png_cap < static_cast<uint32_t>(ISAAC_ANM2_REPLACE_SPRITESHEET_SSO_CAP)) {
    plan.png_heap = 0;
    plan.png_chars = png_addr;
  } else {
    plan.png_heap = 1;
    plan.png_chars = load_guest_u32(png_addr);
  }
  /* (e) 0x40cae0 sized-eq: png in ecx/edx (chars/size), name pushed; the
     family bytes_equal law — sizes EQUAL AND bytes equal over the png-side
     size. Names equal -> jne 0x40bfd6: return false, NO store. */
  if (plan.png_size == plan.name_size &&
      bytes_equal(plan.png_chars, plan.name_chars, plan.png_size)) {
    plan.names_equal = 1;
    if (out != nullptr) *out = plan;
    return 0;
  }
  /* (f) 0x40bf93 cmp edi,esi ; je self — ADDRESS compare of the string
     OBJECTS (name == png). Unreachable through coherent memory (same object
     implies the equality gate hit); transcribed faithfully. */
  plan.self_alias = name_addr == png_addr ? 1 : 0;
  plan.assign_needed = plan.self_alias == 0 ? 1 : 0;
  /* (g) store contract: byte [base' + idx + 0x30] = 0. The base source
     differs per arm (re-read vs saved) — the P1 pin. */
  plan.store_off = idx +
      static_cast<uint32_t>(ISAAC_ANM2_REPLACE_SPRITESHEET_STORE_OFF);
  plan.store_base_source = isaac_anm2_replace_spritesheet_store_base_source(
      static_cast<uint32_t>(plan.self_alias));
  plan.store_addr_saved = base + plan.store_off;
  if (plan.assign_needed != 0) {
    /* HOST STRING_ASSIGN 0x0040ccd0(recv=name, chars=pngChars, size=pngSize)
       — typed host; the frame publishes the contract only. */
    plan.host_chars = plan.png_chars;
    plan.host_size = plan.png_size;
    plan.host_call_count = 1;
    plan.pure_complete = 0;
  }
  plan.result = 1;
  if (out != nullptr) {
    *out = plan;
  }
  return 1;
}

int32_t isaac_anm2_replace_spritesheet_apply(
    uint8_t* anm2,
    uint32_t layer_id,
    uint32_t png_addr,
    uint32_t host_base_post, /* [this+0x7c] re-read AFTER the HOST assign */
    IsaacAnm2ReplaceSpritesheetPlan* out) {
  IsaacAnm2ReplaceSpritesheetPlan plan;
  const int32_t result = isaac_anm2_replace_spritesheet_plan(
      anm2, layer_id, png_addr, &plan);
  if (plan.assign_needed != 0) {
    /* PE 0x40bfaa mov ecx,[ebx+0x7c] — the base is RE-READ AFTER the host
       assign; the host supplies host_base_post. The store MUST land at the
       POST-CALL base, not the pre-call saved base (class-1 fold pin). */
    const uint32_t store_addr = host_base_post + plan.store_off;
    store_u8(guest_mut_ptr(store_addr), 0u);
  } else if (plan.self_alias != 0) {
    /* PE 0x40bfc0..0x40bfc9: the SELF arm stores with the SAVED base
       ([ebp-4]) + saved idx ([ebp-8]). Transcribed faithfully even though
       the arm is unreachable through coherent memory. */
    store_u8(guest_mut_ptr(plan.store_addr_saved), 0u);
  }
  /* bounds-fail and names-equal arms: result 0, no store. */
  if (out != nullptr) {
    *out = plan;
  }
  return result;
}

/* ---- v51: 0x0040cdc0 / 0x0040cdd0 dword-pointer min + 0x0040c7c0 SSO
   sized-INEQ ------------------------------------------------------------ */

uint32_t isaac_anm2_dword_min_plan(uint32_t a_addr,
                                   uint32_t b_addr,
                                   IsaacAnm2DwordMinPlan* out) {
  IsaacAnm2DwordMinPlan plan;
  plan.entered = 0;
  plan.a_addr = a_addr;
  plan.b_addr = b_addr;
  plan.a_bits = 0u;
  plan.b_bits = 0u;
  plan.takes_b = 0;
  plan.result_addr = a_addr;
  plan.pure_complete = 1;
  if (a_addr == 0u || b_addr == 0u) {
    if (out != nullptr) *out = plan;
    return plan.result_addr;
  }
  plan.entered = 1;
  /* PE 0x40cdc0: mov eax,[ecx] ; cmp eax,[edx] ; cmovb ecx,edx ; mov eax,ecx.
     cmp sets CF iff a < b UNSIGNED; cmovb takes b iff CF. Integer cmp is
     TOTAL — no unordered case (contrast the float twin's comiss/PF gate),
     so the plan carries no unordered field. Ties keep the FIRST pointer. */
  const uint32_t a_bits = load_guest_u32(a_addr);
  const uint32_t b_bits = load_guest_u32(b_addr);
  plan.a_bits = a_bits;
  plan.b_bits = b_bits;
  plan.takes_b = a_bits > b_bits ? 1 : 0;
  plan.result_addr = plan.takes_b != 0 ? b_addr : a_addr;
  if (out != nullptr) *out = plan;
  return plan.result_addr;
}

uint32_t isaac_anm2_dword_min_alt_plan(uint32_t a_addr,
                                       uint32_t b_addr,
                                       IsaacAnm2DwordMinAltPlan* out) {
  IsaacAnm2DwordMinAltPlan plan;
  plan.entered = 0;
  plan.a_addr = a_addr;
  plan.b_addr = b_addr;
  plan.a_bits = 0u;
  plan.b_bits = 0u;
  plan.takes_b = 0;
  plan.result_addr = a_addr;
  plan.pure_complete = 1;
  if (a_addr == 0u || b_addr == 0u) {
    if (out != nullptr) *out = plan;
    return plan.result_addr;
  }
  plan.entered = 1;
  /* PE 0x40cdd0: mov eax,[edx] ; cmp eax,[ecx] ; cmovb ecx,edx ; mov eax,ecx.
     The ALTERNATE twin: loads SWAPPED (a from edx, b from ecx) but the same
     unsigned-min law — cmovb takes b iff *edx < *ecx; ties keep ecx (the
     FIRST pointer). Same semantics as 0x40cdc0; separate VA/caller pins. */
  const uint32_t a_bits = load_guest_u32(a_addr);
  const uint32_t b_bits = load_guest_u32(b_addr);
  plan.a_bits = a_bits;
  plan.b_bits = b_bits;
  plan.takes_b = a_bits > b_bits ? 1 : 0;
  plan.result_addr = plan.takes_b != 0 ? b_addr : a_addr;
  if (out != nullptr) *out = plan;
  return plan.result_addr;
}

int32_t isaac_anm2_sso_sized_ineq_plan(uint32_t a_addr,
                                       uint32_t b_addr,
                                       IsaacAnm2SsoSizedIneqPlan* out) {
  IsaacAnm2SsoSizedIneqPlan plan;
  plan.entered = 0;
  plan.a_addr = a_addr;
  plan.b_addr = b_addr;
  plan.a_cap = 0u;
  plan.a_size = 0u;
  plan.a_heap = 0;
  plan.a_chars = a_addr;
  plan.b_cap = 0u;
  plan.b_size = 0u;
  plan.b_heap = 0;
  plan.b_chars = b_addr;
  plan.result = 0;
  plan.helper_va = static_cast<uint32_t>(ISAAC_ANM2_SSO_SIZED_INEQ_HELPER_VA);
  plan.pure_complete = 1;
  if (a_addr == 0u || b_addr == 0u) {
    if (out != nullptr) *out = plan;
    return 0;
  }
  plan.entered = 1;
  /* PE 0x40c7c0: cmp [edx+0x14],0x10 ; jb INLINE — UNSIGNED strict below;
     b is decoded FIRST, exactly like the v48 EQ twin 0x0040c790. */
  const uint32_t b_cap = load_guest_u32(b_addr + 0x14u);
  const uint32_t b_size = load_guest_u32(b_addr + 0x10u);
  plan.b_cap = b_cap;
  plan.b_size = b_size;
  if (b_cap < static_cast<uint32_t>(ISAAC_ANM2_SSO_SIZED_INEQ_SSO_CAP)) {
    plan.b_heap = 0;
    plan.b_chars = b_addr;
  } else {
    plan.b_heap = 1;
    plan.b_chars = load_guest_u32(b_addr);
  }
  const uint32_t a_cap = load_guest_u32(a_addr + 0x14u);
  const uint32_t a_size = load_guest_u32(a_addr + 0x10u);
  plan.a_cap = a_cap;
  plan.a_size = a_size;
  if (a_cap < static_cast<uint32_t>(ISAAC_ANM2_SSO_SIZED_INEQ_SSO_CAP)) {
    plan.a_heap = 0;
    plan.a_chars = a_addr;
  } else {
    plan.a_heap = 1;
    plan.a_chars = load_guest_u32(a_addr);
  }
  /* 0x40cae0 sized-eq -> AL (sizes EQUAL AND bytes equal over a_size), then
     PE `xor al,1`: result 1 iff the strings DIFFER. The discriminator from
     the v48 EQ wrapper 0x0040c790: the SAME mismatching pair yields 0 there,
     1 here; equal pairs (incl. empty==empty) yield 1 there, 0 here. */
  const int32_t eq =
      (a_size == b_size && bytes_equal(plan.a_chars, plan.b_chars, a_size))
          ? 1
          : 0;
  plan.result = eq == 0 ? 1 : 0;
  if (out != nullptr) *out = plan;
  return plan.result;
}

uint32_t isaac_anm2_pure_helpers_abi_version(void) {
  return static_cast<uint32_t>(ISAAC_ANM2_PURE_HELPERS_ABI_VERSION);
}

/* ---- v49: 0x0040b060 WasEventTriggered SSO wrapper ----------------------- */

void isaac_anm2_was_event_triggered_sso_plan(
    uint8_t* anm2,
    uint32_t name_addr,
    IsaacAnm2WasEventTriggeredSsoPlan* out) {
  IsaacAnm2WasEventTriggeredSsoPlan plan;
  plan.entered = 0;
  plan.sso = 0;
  plan.chars_addr = name_addr;
  plan.gate_34 = 0;
  plan.call_va =
      static_cast<uint32_t>(ISAAC_ANM2_WAS_EVENT_TRIGGERED_SSO_CALL_VA);
  plan.recv_off =
      static_cast<uint32_t>(ISAAC_ANM2_WAS_EVENT_TRIGGERED_SSO_STATE_OFF);
  plan.result = 0;
  plan.eax_closed = name_addr & 0xffffff00u;
  plan.host_call_count = 0;
  plan.pure_complete = 1;

  if (anm2 != nullptr) {
    plan.entered = 1;
    /* PE 0x40b067 cmp dword [eax+0x14],0x10 ; jb 0x40b06f — UNSIGNED strict
       below; cap == 0x10 already reads the heap pointer at [name]. */
    const uint32_t cap =
        load_guest_u32(name_addr +
                       ISAAC_ANM2_WAS_EVENT_TRIGGERED_SSO_SSO_CAP_OFF);
    const uint32_t chars =
        cap < static_cast<uint32_t>(ISAAC_ANM2_WAS_EVENT_TRIGGERED_SSO_SSO_CAP)
            ? name_addr
            : load_guest_u32(name_addr);
    plan.sso =
        cap < static_cast<uint32_t>(ISAAC_ANM2_WAS_EVENT_TRIGGERED_SSO_SSO_CAP)
            ? 1
            : 0;
    plan.chars_addr = chars;
    /* PE 0x40b06f cmp dword [ecx+0x34],0 — FULL-dword gate, 0x100 IS set. */
    const uint32_t gate =
        load_u32(anm2 +
                 static_cast<uint32_t>(ISAAC_ANM2_WAS_EVENT_TRIGGERED_SSO_GATE_OFF));
    plan.gate_34 = gate != 0u ? 1 : 0;
    /* Closed path: xor al,al — a BYTE clear. EAX upper 3 bytes stay the
       decoded chars address; the observable contract is the AL bool. */
    plan.eax_closed = chars & 0xffffff00u;
    if (gate != 0u) {
      /* Open: push chars; add this,0x30; call 0x40ae70 (HOST — BandD's
         in-wave ANM2 name->flag walk body, BY REFERENCE). */
      plan.host_call_count = 1;
      plan.pure_complete = 0;
    }
  }

  if (out != nullptr) {
    *out = plan;
  }
}

/* ---- v50: 0x0040b090 WasEventTriggered const-char twin ------------------ */

void isaac_anm2_was_event_triggered_cstr_plan(
    uint8_t* anm2,
    uint32_t name_addr,
    IsaacAnm2WasEventTriggeredCstrPlan* out) {
  IsaacAnm2WasEventTriggeredCstrPlan plan;
  plan.entered = 0;
  plan.gate_34 = 0;
  plan.chars_addr = name_addr; /* RAW passthrough — NO SSO decode
                                  (was-event-triggered twin) */
  plan.call_va =
      static_cast<uint32_t>(ISAAC_ANM2_WAS_EVENT_TRIGGERED_CSTR_CALL_VA);
  plan.recv_off =
      static_cast<uint32_t>(ISAAC_ANM2_WAS_EVENT_TRIGGERED_CSTR_STATE_OFF);
  plan.result = 0;
  plan.host_call_count = 0;
  plan.pure_complete = 1;

  if (anm2 != nullptr) {
    plan.entered = 1;
    /* PE 0x40b094 cmp dword [ecx+0x34],0 — FULL-dword gate, 0x100 IS set.
       NOTE: no SSO cap read at [name+0x14] — the const-char twin pushes
       [ebp+8] verbatim (whole difference vs 0x40b060, band-c). */
    const uint32_t gate =
        load_u32(anm2 + static_cast<uint32_t>(ISAAC_ANM2_WAS_EVENT_TRIGGERED_CSTR_GATE_OFF));
    plan.gate_34 = gate != 0u ? 1 : 0;
    if (gate != 0u) {
      /* Open: push [ebp+8] RAW; add this,0x30; call 0x40ae70 (HOST — ANM2
         band-D SSO name->flag walk body, BY REFERENCE — the +0x1c twin). */
      plan.host_call_count = 1;
      plan.pure_complete = 0;
    }
  }

  if (out != nullptr) {
    *out = plan;
  }
}

void isaac_anm2_anim_id_wrapper_plan(uint8_t* anm2,
                                     uint32_t arg_addr,
                                     IsaacAnm2AnimIdWrapperPlan* out) {
  IsaacAnm2AnimIdWrapperPlan plan;
  plan.entered = 0;
  plan.gate_34 = 0;
  plan.arg_addr = arg_addr; /* RAW passthrough — NO SSO decode */
  plan.call_va = static_cast<uint32_t>(ISAAC_ANM2_ANIM_ID_WRAPPER_CALL_VA);
  plan.recv_off =
      static_cast<uint32_t>(ISAAC_ANM2_ANIM_ID_WRAPPER_STATE_OFF);
  plan.result = 0;
  plan.host_call_count = 0;
  plan.pure_complete = 1;

  if (anm2 != nullptr) {
    plan.entered = 1;
    /* PE 0x40b1a4 cmp dword [ecx+0x34],0 — FULL-dword gate, 0x100 IS set. */
    const uint32_t gate =
        load_u32(anm2 + static_cast<uint32_t>(ISAAC_ANM2_ANIM_ID_WRAPPER_GATE_OFF));
    plan.gate_34 = gate != 0u ? 1 : 0;
    if (gate != 0u) {
      /* Open: push [ebp+8] RAW; add this,0x30; call 0x40ac70 (HOST — the
         v32 anim-id lookup kernel, BY REFERENCE — landed in this family). */
      plan.host_call_count = 1;
      plan.pure_complete = 0;
    }
  }

  if (out != nullptr) {
    *out = plan;
  }
}

void isaac_anm2_extras_name_wrapper_plan(uint8_t* anm2,
                                         uint32_t arg_addr,
                                         IsaacAnm2ExtrasNameWrapperPlan* out) {
  IsaacAnm2ExtrasNameWrapperPlan plan;
  plan.entered = 0;
  plan.gate_34 = 0;
  plan.arg_addr = arg_addr; /* RAW passthrough — NO SSO decode */
  plan.call_va =
      static_cast<uint32_t>(ISAAC_ANM2_EXTRAS_NAME_WRAPPER_CALL_VA);
  plan.recv_off =
      static_cast<uint32_t>(ISAAC_ANM2_EXTRAS_NAME_WRAPPER_STATE_OFF);
  plan.result = 0;
  plan.host_call_count = 0;
  plan.pure_complete = 1;

  if (anm2 != nullptr) {
    plan.entered = 1;
    /* PE 0x40b1d4 cmp dword [ecx+0x34],0 — FULL-dword gate, 0x100 IS set.
       Twin of 0x40b1a0: SAME gate/receiver shape, DIFFERENT callee
       (0x40ace0 extras name->index, v33/v47 kernel BY REFERENCE). */
    const uint32_t gate =
        load_u32(anm2 + static_cast<uint32_t>(ISAAC_ANM2_EXTRAS_NAME_WRAPPER_GATE_OFF));
    plan.gate_34 = gate != 0u ? 1 : 0;
    if (gate != 0u) {
      plan.host_call_count = 1;
      plan.pure_complete = 0;
    }
  }

  if (out != nullptr) {
    *out = plan;
  }
}

void isaac_anm2_get_layer_wrapper_plan(uint8_t* anm2,
                                       uint32_t arg_addr,
                                       IsaacAnm2GetLayerWrapperPlan* out) {
  IsaacAnm2GetLayerWrapperPlan plan;
  plan.entered = 0;
  plan.gate_34 = 0; /* PINNED — 0x40b200 has NO [this+0x34] gate (contrast
                       twin vs 0x40b1a0/0x40b1d0; the gate memory is NEVER
                       read, so even a nonzero [this+0x34] leaves gate_34 0)
                     */
  plan.arg_addr = arg_addr; /* RAW arg passthrough (layer index) */
  plan.call_va =
      static_cast<uint32_t>(ISAAC_ANM2_GET_LAYER_WRAPPER_CALL_VA);
  plan.recv_off =
      static_cast<uint32_t>(ISAAC_ANM2_GET_LAYER_WRAPPER_STATE_OFF);
  plan.result = 0;
  plan.host_call_count = 1; /* ALWAYS — no closed arm exists (PE 0x40b200
                               pushes [ebp+8] and calls 0x40b220 on every
                               path; there is no xor eax,eax exit) */
  plan.pure_complete = 0;   /* ALWAYS — the sole call is unconditional */

  if (anm2 != nullptr) {
    plan.entered = 1;
  }

  if (out != nullptr) {
    *out = plan;
  }
}

}  // extern "C"

/* Plain structs + the __is_same builtin on purpose: the syntax-check host
   clang++ ships no libc++ include paths, so <type_traits> is unavailable. */
template <typename... Ts>
struct anm2_has_narrow_scalar;
template <>
struct anm2_has_narrow_scalar<> {
  static constexpr bool value = false;
};
template <typename T, typename... Ts>
struct anm2_has_narrow_scalar<T, Ts...> {
  static constexpr bool value =
      (__is_same(T, uint8_t) || __is_same(T, uint16_t)) ||
      anm2_has_narrow_scalar<Ts...>::value;
};
template <typename R, typename... Ps>
struct anm2_has_narrow_scalar<R(Ps...)> {
  static constexpr bool value = anm2_has_narrow_scalar<Ps...>::value;
};

#define ISAAC_ANM2_NO_NARROW_PARAMS(FN) \
  static_assert(!anm2_has_narrow_scalar<decltype(FN)>::value, \
                #FN " must not take a uint8_t/uint16_t scalar parameter")

ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_sso_uses_heap);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_sso_data_ptr);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_strcmp_inline);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_reset_name_host_needed);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_reset_teardown_needed);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_reset_array_header);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_reset_free_size);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_reset_teardown_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_reset_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_reset_apply_fields);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_layer_index_in_range);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_layer_byte_offset);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_get_layer_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_layer_walk_enter);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_layer_walk_continue);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_find_layer_index_by_name);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_anim_data_byte_offset);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_anim_data_index_by_name);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_anim_apply_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_walk_apply_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_load_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_load_apply);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_load_path_present);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_load_path_is_self);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_load_graphics_needed);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_load_frame_host_calls);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_load_latch_ready);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_load_latch_store_value);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_load_layer_name_addr);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_load_extra_name_addr);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_load_name_is_shadow);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_load_name_is_star);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_state_anim_key_dword);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_swap_anm2);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_loadgraphics_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_loadgraphics_apply);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_reload_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_name_flag_assert_needed);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_name_flag_sso_inline);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_name_flag_bit_mask);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_name_flag_bit_result);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_name_flag_walk_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_event_trigger_sso_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_event_trigger_cstr_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_was_event_triggered_sso_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_was_event_triggered_cstr_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_anim_id_wrapper_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_extras_name_wrapper_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_get_layer_wrapper_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_next_toward_zero_f32_bits);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_next_toward_zero_domain_ok);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_minss_bits);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_frame_clamp_bits);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_advance_store_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_advance_walk_enter);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_advance_inner_ok);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_advance_walk_continue);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_advance_walk_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_state_alloc_size);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_state_memset_size);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_state_size_disagrees);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_state_apply_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_state_apply_tail_fields);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_alloc_counter_block);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_state_alt_count);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_state_alt_realloc_path);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_state_alt_memcpy_needed);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_state_alt_memcpy_size);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_state_alt_arm_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_state_apply_alt_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_ucomiss_ah_test44);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_ucomiss_eq_bits);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_comiss_below_bits);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_bts_mask);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_bts_apply);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_prewalk_apply);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_frame_walk_params);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_frame_walk_apply);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_floor_f32_bits);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_cvttss2si_bits);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_comiss_jbe_bits);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_comiss_ja_bits);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_play_gate_skip);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_play_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_play_apply);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_play_index_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_play_index_apply);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_play_random_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_play_random_apply);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_playing_name_pred);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_playing_name_pred_alt);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_rewind_apply);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_advance_position_apply);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_state_update_apply);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_anm_update_apply);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_layer_frame_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_play_sso_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_play_sso_apply);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_playing_sso_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_playing_sso_alt_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_walk_apply_sso_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_set_frame_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_set_frame_apply);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_set_frame_cstr_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_set_frame_cstr_apply);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_set_frame_cur_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_advance_cur_needed);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_advance_cur_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_advance_pos_cur_needed);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_advance_pos_cur_target_from_data);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_advance_pos_cur_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_get_frame_needed);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_get_frame_int_from_bits);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_get_frame_int_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_get_frame_f32_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_set_layer_frame_needed);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_set_layer_frame_layer_in_range);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_set_layer_frame_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_set_layer_frame_name_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_get_layer_frame_int_needed);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_get_layer_frame_int_layer_in_range);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_get_layer_frame_int_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_overlay_play_sso_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_overlay_play_sso_apply);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_overlay_stop_needed);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_overlay_stop_apply);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_overlay_playing_name_pred);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_overlay_playing_sso_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_overlay_playing_name_pred_alt);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_overlay_playing_sso_alt_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_overlay_apply_sso_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_overlay_set_frame_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_overlay_set_frame_cstr_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_stop_needed);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_stop_apply);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_pure_helpers_abi_version);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_set_overlay_frame_int_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_get_overlay_frame_int_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_anim_id_lookup_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_forwarder60_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_extras_name_index_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_get_anim_two_stage_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_three_stage_lookup_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_bounded_elem_get_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_layer_name_index_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_layer_slot_sized_eq_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_subarray_get_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_subarray_name_index_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_struct_copy_6c);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_string_assign_guard_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_sso_cstr_ctor_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_floatvec_ctor);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_ordered_memcmp);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_hash_probe_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_float_min_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_sso_sized_eq_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_replace_spritesheet_bounds);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_replace_spritesheet_idx_off);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_replace_spritesheet_store_base_source);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_replace_spritesheet_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_replace_spritesheet_apply);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_dword_min_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_dword_min_alt_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_sso_sized_ineq_plan);

static_assert(sizeof(IsaacAnm2OverlaySetFramePlan) == 84,
              "v29 overlay SetFrame plan is 21 x 4 bytes");
static_assert(sizeof(IsaacAnm2OverlaySetFrameCstrPlan) == 72,
              "v30 overlay SetFrame cstr plan is 18 x 4 bytes");
static_assert(sizeof(IsaacAnm2SetOverlayFrameIntPlan) == 32,
              "v31 SetOverlayFrame(int) plan is 8 x 4 bytes");
static_assert(sizeof(IsaacAnm2GetOverlayFrameIntPlan) == 20,
              "v31 GetOverlayFrame(int) plan is 5 x 4 bytes");
static_assert(sizeof(IsaacAnm2AnimIdLookupPlan) == 56,
              "v32 anim-id lookup plan is 14 x 4 bytes");
static_assert(sizeof(IsaacAnm2Forwarder60Plan) == 24,
              "v32 forwarder60 plan is 6 x 4 bytes");
static_assert(sizeof(IsaacAnm2ExtrasNameIndexPlan) == 76,
              "v47 extras name-index plan is 19 x 4 bytes");
static_assert(sizeof(IsaacAnm2GetAnimTwoStagePlan) == 60,
              "v34 GetAnimation two-stage plan is 15 x 4 bytes");
static_assert(sizeof(IsaacAnm2ThreeStageLookupPlan) == 60,
              "v35 three-stage lookup plan is 15 x 4 bytes");
static_assert(sizeof(IsaacAnm2BoundedElemGetPlan) == 48,
              "v36 bounded-elem get plan is 12 x 4 bytes");
static_assert(sizeof(IsaacAnm2HashProbePlan) == 48,
              "v46 hash-probe plan is 12 x 4 bytes");
static_assert(sizeof(IsaacAnm2FloatMinPlan) == 36,
              "v48 float-min plan is 9 x 4 bytes");
static_assert(sizeof(IsaacAnm2SsoSizedEqPlan) == 56,
              "v48 sso-sized-eq plan is 14 x 4 bytes");
static_assert(sizeof(IsaacAnm2NameFlagWalkPlan) == 76,
              "v49 name-flag walk plan is 19 x 4 bytes");
static_assert(sizeof(IsaacAnm2EventTriggerSsoPlan) == 40,
              "v49 event-trigger SSO plan is 10 x 4 bytes");
static_assert(sizeof(IsaacAnm2EventTriggerCstrPlan) == 32,
              "v49 event-trigger cstr plan is 8 x 4 bytes");
static_assert(sizeof(IsaacAnm2WasEventTriggeredSsoPlan) == 40,
              "v49 was-event-triggered SSO plan is 10 x 4 bytes");
static_assert(sizeof(IsaacAnm2ReplaceSpritesheetPlan) == 116,
              "v50 replace-spritesheet plan is 29 x 4 bytes");
static_assert(sizeof(IsaacAnm2WasEventTriggeredCstrPlan) == 32,
              "v50 was-event-triggered cstr plan is 8 x 4 bytes");
static_assert(sizeof(IsaacAnm2DwordMinPlan) == 32,
              "v51 dword-min plan is 8 x 4 bytes");
static_assert(sizeof(IsaacAnm2DwordMinAltPlan) == 32,
              "v51 dword-min alt plan is 8 x 4 bytes");
static_assert(sizeof(IsaacAnm2SsoSizedIneqPlan) == 56,
              "v51 sso-sized-ineq plan is 14 x 4 bytes");
static_assert(sizeof(IsaacAnm2OrderedMemcmpPlan) == 40,
              "v45 ordered-memcmp plan is 10 x 4 bytes");
static_assert(sizeof(IsaacAnm2FloatVecCtorPlan) == 56,
              "v44 floatvec-ctor plan is 14 x 4 bytes (v62-corrected)");
static_assert(sizeof(IsaacAnm2SsoCstrCtorPlan) == 44,
              "v43 sso-cstr-ctor plan is 11 x 4 bytes");
static_assert(sizeof(IsaacAnm2StringAssignGuardPlan) == 52,
              "v42 string-assign guard plan is 13 x 4 bytes");
static_assert(sizeof(IsaacAnm2StructCopy6cPlan) == 36,
              "v41 struct-copy-6c plan is 9 x 4 bytes");
static_assert(sizeof(IsaacAnm2SubarrayNameIndexPlan) == 48,
              "v40 subarray name-index plan is 12 x 4 bytes");
static_assert(sizeof(IsaacAnm2SubarrayGetPlan) == 52,
              "v39 subarray get plan is 13 x 4 bytes");
static_assert(sizeof(IsaacAnm2LayerSlotSizedEqPlan) == 56,
              "v38 layer-slot sized-eq plan is 14 x 4 bytes");
static_assert(sizeof(IsaacAnm2LayerNameIndexPlan) == 48,
              "v37 layer-name-index plan is 12 x 4 bytes");


ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_filename_hash);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_cache_probe_found);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_cache_find_scan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_cache_maintenance_gate);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_cache_maintenance_apply);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_load_one_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_load_map_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_loadmap_layer_name_addr);

ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_copyctor_alloc_size);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_copyctor_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_copyctor_apply);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_copyctor_layer_string_src);

static_assert(sizeof(IsaacAnm2CopyCtorPlan) == 104,
              "v55 copy-ctor plan is 25 x 4 bytes");
static_assert(sizeof(IsaacAnm2StringSrc) == 12,
              "v55 string source is 3 x 4 bytes");

static_assert(sizeof(IsaacAnm2CacheFindScan) == 20,
              "v54-cache cache-find scan plan is 5 x 4 bytes");
static_assert(sizeof(IsaacAnm2LoadOnePlan) == 52,
              "v54-cache load-one plan is 13 x 4 bytes");
static_assert(sizeof(IsaacAnm2LoadMapPlan) == 112,
              "v54-cache load-map plan is 28 x 4 bytes");

ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_state_set_layer_frame_needed);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_state_set_layer_frame_in_range);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_state_set_layer_frame_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_state_set_null_frame_needed);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_state_set_null_frame_in_range);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_state_set_null_frame_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_state_get_layer_frame_needed);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_state_get_layer_frame_in_range);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_state_get_layer_frame_plan);

static_assert(sizeof(IsaacAnm2StateSetLayerFramePlan) == 20,
              "v54 state set-layer-frame plan is 5 x 4 bytes");
static_assert(sizeof(IsaacAnm2StateSetNullFramePlan) == 24,
              "v54 state set-null-frame plan is 6 x 4 bytes");
static_assert(sizeof(IsaacAnm2StateGetLayerFramePlan) == 16,
              "v54 state get-layer-frame plan is 4 x 4 bytes");

/* ================= v56: 0x0040e470 AnmCache-clear teardown =============== */

/* 0x0040e48b `mov edi,[0xc78ee0]` — the container global read. */
uint32_t isaac_anm2_cache_clear_head(uint32_t container_addr) {
  return load_guest_u32(container_addr);
}

/* 0x0040e491 `mov esi,[edi]` — head->_Next at +0. */
uint32_t isaac_anm2_cache_clear_first_node(uint32_t head_addr) {
  return load_guest_u32(head_addr);
}

/* 0x0040e496 `cmp esi,edi ; je done` — empty iff first == head. */
int32_t isaac_anm2_cache_clear_empty(uint32_t first_addr,
                                     uint32_t head_addr) {
  return first_addr == head_addr ? 1 : 0;
}

/* 0x0040e4a0 `cmp dword ptr [esi+0x50],0 ; jne skip` — FULL-dword gate:
   teardown iff u32[node+0x50] == 0 (0x100 is NOT a skip — not a byte
   gate). */
int32_t isaac_anm2_cache_clear_gate(uint32_t node_addr) {
  const uint32_t gate =
      load_guest_u32(node_addr + static_cast<uint32_t>(ISAAC_ANM2_CACHE_CLEAR_GATE_OFF));
  return gate == 0u ? 1 : 0;
}

/* 0x40e4a6 push [esi+0x10] — the %u cache id for "AnmCache: Clear %u.
". */
uint32_t isaac_anm2_cache_clear_log_id(uint32_t node_addr) {
  return load_guest_u32(
      node_addr + static_cast<uint32_t>(ISAAC_ANM2_CACHE_CLEAR_LOG_ID_OFF));
}

/* 0x40e504 `cmp esi,edi ; jne loop` — terminate iff node == head. */
int32_t isaac_anm2_cache_clear_walk_done(uint32_t node_addr,
                                         uint32_t head_addr) {
  return node_addr == head_addr ? 1 : 0;
}

/* One machine step (the walk advance 0x414a80 is host-fed, v54 find_scan
   precedent). Teardown path (gate): log + string14 + advance + erase +
   tidy38 + delete(0x54) and head RE-READ from u32[container] (0x40e4ee —
   D-family re-read, reproduced). Skip path (gate == 0): advance only,
   head stays stale (the machine's skip path does NOT re-read). */
void isaac_anm2_cache_clear_step_plan(uint32_t container_addr,
                                      uint32_t node_addr,
                                      uint32_t head_addr,
                                      IsaacAnm2CacheClearStepPlan* out) {
  IsaacAnm2CacheClearStepPlan plan;
  plan.entered = node_addr != 0u ? 1 : 0;
  plan.gate = 0;
  plan.log_id = 0u;
  plan.walk_done = 0;
  plan.head_reload_value = head_addr;
  plan.head_reloaded = 0;
  plan.log_count = 0;
  plan.string14_count = 0;
  plan.advance_count = 0;
  plan.erase_count = 0;
  plan.tidy38_count = 0;
  plan.delete_count = 0;
  plan.delete_size = static_cast<uint32_t>(ISAAC_ANM2_CACHE_CLEAR_NODE_SIZE);
  plan.node_size = static_cast<uint32_t>(ISAAC_ANM2_CACHE_CLEAR_NODE_SIZE);
  plan.gate_off = static_cast<uint32_t>(ISAAC_ANM2_CACHE_CLEAR_GATE_OFF);
  plan.log_id_off = static_cast<uint32_t>(ISAAC_ANM2_CACHE_CLEAR_LOG_ID_OFF);
  plan.str_a_off = static_cast<uint32_t>(ISAAC_ANM2_CACHE_CLEAR_STR_A_OFF);
  plan.str_b_off = static_cast<uint32_t>(ISAAC_ANM2_CACHE_CLEAR_STR_B_OFF);
  plan.log_fmt_va = static_cast<uint32_t>(ISAAC_ANM2_CACHE_CLEAR_LOG_FMT_VA);
  plan.log_level = static_cast<uint32_t>(ISAAC_ANM2_CACHE_CLEAR_LOG_LEVEL);
  if (node_addr == 0u) {
    if (out != nullptr) {
      *out = plan;
    }
    return;
  }
  plan.log_id = isaac_anm2_cache_clear_log_id(node_addr);
  plan.walk_done = isaac_anm2_cache_clear_walk_done(node_addr, head_addr);
  plan.gate = isaac_anm2_cache_clear_gate(node_addr);
  plan.advance_count = 1; /* 0x414a80 — both paths */
  if (plan.gate != 0) {
    plan.log_count = 1;        /* 0xa112c0 */
    plan.string14_count = 1;   /* 0x40d850 */
    plan.erase_count = 1;      /* 0x415d20 */
    plan.tidy38_count = 1;     /* 0x40d040 */
    plan.delete_count = 1;     /* 0xaef15c */
    plan.head_reload_value = isaac_anm2_cache_clear_head(container_addr);
    plan.head_reloaded = 1;
  }
  if (out != nullptr) {
    *out = plan;
  }
}

ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_cache_clear_head);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_cache_clear_first_node);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_cache_clear_empty);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_cache_clear_gate);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_cache_clear_log_id);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_cache_clear_walk_done);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_cache_clear_step_plan);

static_assert(sizeof(IsaacAnm2CacheClearStepPlan) == 80,
              "v56 cache-clear step plan is 20 x 4 bytes");

/* ===================== v57: 0x0040c890 hash grow/insert ===================
   Pure hash-decision laws for the global table grow/insert (the alloc
   family's platform-primitive decision lifts the old host fence; all
   alloc/memcpy/memset/free/throw leaves are TYPED-HOST, counted in the
   plans, never executed). Machine references are 0x0040c890 sites; the
   full body transcription is in the v57 NOTES + header block. */

/* 0x40c8a9 `cmp edx,eax ; ja skip` — grow iff cur <= end_hi + 1 (u32). */
uint32_t isaac_anm2_hash_grow_gate(uint32_t cur, uint32_t end_hi) {
  return cur <= end_hi + 1u ? 1u : 0u;
}

/* 0x40c8af..0x40c8e2 doubling loop. eax = cur == 0 ? 1 : cur; loop:
   delta = eax - cur; exit when delta >= 1 && eax >= 8; else throw A when
   (0x5d174d5 - eax) < eax (u32) — the machine throws BEFORE doubling, so
   the published capacity is the pre-double eax on abort. The 0x3fffffff
   cap check is the plan's (0x40c8f2, after the loop). */
uint32_t isaac_anm2_hash_grow_capacity(uint32_t cur) {
  uint32_t eax = cur == 0u ? 1u : cur;
  for (;;) {
    const uint32_t delta = eax - cur;
    if (delta >= 1u && eax >= 8u) {
      return eax;
    }
    if (static_cast<uint32_t>(ISAAC_ANM2_HASH_INSERT_CAP_GUARD) - eax <
        eax) {
      return eax; /* overflow_throw — the plan detects via the guard law */
    }
    eax *= 2u;
  }
}

/* 0x40c9fd..0x40ca06: slot = ((end_lo & (cur-1)) + end_hi) & (cur-1). */
uint32_t isaac_anm2_hash_insert_slot(uint32_t end_lo, uint32_t cur,
                                     uint32_t end_hi) {
  const uint32_t mask = cur - 1u;
  return ((end_lo & mask) + end_hi) & mask;
}

/* 0x40ca0f `cmp dword ptr [edi+esi],0 ; jne reuse` — the probe test. */
int32_t isaac_anm2_hash_slot_empty(uint32_t base, uint32_t slot) {
  return load_guest_u32(base + slot * 4u) == 0u ? 1 : 0;
}

/* 0x40c930..0x40c9ed — the grow data motion (memmove 0xaf08bd spans +
   memset 0xaf05e5 spans) + the old-table release + the two global stores.
   All arithmetic reproduces the machine's u32 adds exactly (the dst of
   the second memmove is the saved [ebp-0x14] = new_base + old_cap*4 +
   tail_bytes = new_base + cur*4). */
void isaac_anm2_hash_grow_motion_plan(uint32_t old_base, uint32_t old_cap,
                                      uint32_t cur, uint32_t delta,
                                      uint32_t new_base,
                                      IsaacAnm2HashGrowMotionPlan* out) {
  IsaacAnm2HashGrowMotionPlan plan;
  plan.entered = 1;
  plan.case_b = old_cap > delta ? 1 : 0; /* 0x40c949 `ja` */
  const uint32_t tail_bytes = (cur - old_cap) * 4u;
  plan.move0_dst = new_base + old_cap * 4u;
  plan.move0_src = old_base + old_cap * 4u;
  plan.move0_count = tail_bytes;
  if (plan.case_b != 0) {
    plan.move_count = 3;
    plan.move1_dst = new_base + cur * 4u;
    plan.move1_src = old_base;
    plan.move1_count = delta * 4u;
    plan.move2_dst = new_base;
    plan.move2_src = old_base + delta * 4u;
    plan.move2_count = (old_cap - delta) * 4u;
    plan.zero_count = 1;
    plan.zero0_dst = new_base + (old_cap - delta) * 4u;
    plan.zero0_count = delta * 4u;
    plan.zero1_dst = 0u;
    plan.zero1_count = 0u;
  } else {
    plan.move_count = 2;
    plan.move1_dst = new_base + cur * 4u;
    plan.move1_src = old_base;
    plan.move1_count = old_cap * 4u;
    plan.move2_dst = 0u;
    plan.move2_src = 0u;
    plan.move2_count = 0u;
    plan.zero_count = 2;
    plan.zero0_dst = new_base + cur * 4u + old_cap * 4u;
    plan.zero0_count = (delta - old_cap) * 4u;
    plan.zero1_dst = new_base;
    plan.zero1_count = old_cap * 4u;
  }
  plan.free_needed = old_base != 0u ? 1 : 0; /* 0x40c9c3 */
  plan.free_size = cur;                      /* 0x40c9c7, ELEMENTS */
  plan.base_store = new_base;                /* 0x40c9db */
  plan.cur_store = cur + delta;              /* 0x40c9e7 (u32 wrap) */
  if (out != nullptr) {
    *out = plan;
  }
}

/* 0x40c890 whole-body decision plan: grow gate -> capacity (doubling with
   the two throw guards) -> alloc 0x40cf00 -> motion -> free 0x40c740 ->
   stores -> slot/probe -> node alloc 0xa0f4c0(0x2c) -> 0x2c copy ->
   end_hi inc. new_base = the HOST alloc result (0 when no grow; the
   machine's new_base comes from 0x40cf00, a platform primitive).
   Aborts: overflow_throw / cap_throw stop before alloc (the machine's
   noreturn throw islands); the post-abort section is zeroed. */
void isaac_anm2_hash_insert_plan(uint32_t base, uint32_t cur,
                                 uint32_t end_lo, uint32_t end_hi,
                                 uint32_t new_base,
                                 IsaacAnm2HashInsertPlan* out) {
  IsaacAnm2HashInsertPlan plan;
  plan.entered = 1;
  plan.base = base;
  plan.cur = cur;
  plan.end_lo = end_lo;
  plan.end_hi = end_hi;
  plan.grow_gate = isaac_anm2_hash_grow_gate(cur, end_hi);
  plan.capacity = 0u;
  plan.delta = 0u;
  plan.overflow_throw = 0;
  plan.cap_throw = 0;
  plan.alloc_bytes = 0u;
  plan.alloc_count = 0;
  plan.case_b = 0;
  plan.move_count = 0;
  plan.zero_count = 0;
  plan.free_needed = 0;
  plan.free_size = 0u;
  plan.free_count = 0;
  plan.base_eff = base;
  plan.base_updated = 0;
  plan.cur_eff = cur;
  plan.cur_updated = 0;
  plan.slot = 0u;
  plan.end_lo_store = 0u;
  plan.slot_empty = 0;
  plan.node_alloc_count = 0;
  plan.node_alloc_size = static_cast<uint32_t>(ISAAC_ANM2_HASH_INSERT_NODE_SIZE);
  plan.copy_size = static_cast<uint32_t>(ISAAC_ANM2_HASH_INSERT_NODE_SIZE);
  plan.end_hi_inc = 1; /* 0x40ca54 — BOTH paths (0 when aborted) */
  plan.memcpy_count = 0;
  plan.memset_count = 0;
  plan.host_call_count = 0;
  plan.pure_complete = 1;
  plan.alloc_va = static_cast<uint32_t>(ISAAC_ANM2_HASH_INSERT_ALLOC_VA);
  plan.node_alloc_va =
      static_cast<uint32_t>(ISAAC_ANM2_HASH_INSERT_NODE_ALLOC_VA);
  plan.memcpy_va = static_cast<uint32_t>(ISAAC_ANM2_HASH_INSERT_MEMCPY_VA);
  plan.memset_va = static_cast<uint32_t>(ISAAC_ANM2_HASH_INSERT_MEMSET_VA);
  plan.free_va = static_cast<uint32_t>(ISAAC_ANM2_HASH_INSERT_FREE_VA);
  plan.throw_a_va =
      static_cast<uint32_t>(ISAAC_ANM2_HASH_INSERT_THROW_A_VA);
  plan.throw_b_va =
      static_cast<uint32_t>(ISAAC_ANM2_HASH_INSERT_THROW_B_VA);
  uint32_t capacity = 0u;
  uint32_t delta = 0u;
  int32_t overflow_throw = 0;
  int32_t cap_throw = 0;
  if (plan.grow_gate != 0) {
    /* 0x40c8af: eax = cur == 0 ? 1 : cur; doubling loop. */
    uint32_t eax = cur == 0u ? 1u : cur;
    for (;;) {
      const uint32_t d = eax - cur;
      if (d >= 1u && eax >= 8u) {
        break;
      }
      if (static_cast<uint32_t>(ISAAC_ANM2_HASH_INSERT_CAP_GUARD) - eax <
          eax) {
        overflow_throw = 1;
        capacity = eax; /* pre-double eax at the throw */
        delta = d;
        break;
      }
      eax *= 2u;
    }
    if (overflow_throw == 0) {
      capacity = eax;
      delta = eax - cur;
      /* 0x40c8ed `cmp eax,0x3fffffff ; ja` — pre-alloc cap. */
      if (capacity >
          static_cast<uint32_t>(ISAAC_ANM2_HASH_INSERT_CAP_MAX)) {
        cap_throw = 1;
      }
    }
  }
  plan.capacity = capacity;
  plan.delta = delta;
  plan.overflow_throw = overflow_throw;
  plan.cap_throw = cap_throw;
  const int32_t aborted = overflow_throw != 0 || cap_throw != 0;
  if (plan.grow_gate != 0 && aborted == 0) {
    const uint32_t alloc_bytes = capacity * 4u; /* 0x40c8f8 lea */
    plan.alloc_bytes = alloc_bytes;
    plan.alloc_count = 1; /* 0x40cf00 — HOST */
    IsaacAnm2HashGrowMotionPlan motion;
    isaac_anm2_hash_grow_motion_plan(base, end_lo, cur, delta, new_base,
                                     &motion);
    plan.case_b = motion.case_b;
    plan.move_count = motion.move_count;
    plan.zero_count = motion.zero_count;
    plan.free_needed = motion.free_needed;
    plan.free_size = motion.free_size;
    plan.free_count = motion.free_needed; /* 0x40c740 — HOST */
    plan.memcpy_count = motion.move_count;
    plan.memset_count = motion.zero_count;
    plan.base_eff = motion.base_store;
    plan.base_updated = 1;
    plan.cur_eff = motion.cur_store;
    plan.cur_updated = 1;
  }
  if (aborted != 0) {
    plan.end_hi_inc = 0; /* the machine throws before the insert tail */
  } else {
    plan.slot = isaac_anm2_hash_insert_slot(plan.end_lo, plan.cur_eff,
                                            plan.end_hi);
    plan.end_lo_store = plan.end_lo & (plan.cur_eff - 1u); /* 0x40c9ff */
    plan.slot_empty = isaac_anm2_hash_slot_empty(plan.base_eff, plan.slot);
    if (plan.slot_empty != 0) {
      plan.node_alloc_count = 1; /* 0xa0f4c0(0x2c) — HOST */
    }
  }
  plan.host_call_count = plan.alloc_count + plan.memcpy_count +
                         plan.memset_count + plan.free_count +
                         plan.node_alloc_count + overflow_throw +
                         cap_throw;
  if (out != nullptr) {
    *out = plan;
  }
}

ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_hash_grow_gate);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_hash_grow_capacity);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_hash_insert_slot);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_hash_slot_empty);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_hash_grow_motion_plan);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_hash_insert_plan);

static_assert(sizeof(IsaacAnm2HashGrowMotionPlan) == 84,
              "v57 hash grow-motion plan is 21 x 4 bytes");
static_assert(sizeof(IsaacAnm2HashInsertPlan) == 160,
              "v57 hash insert plan is 40 x 4 bytes");

/* ================= v58: 0x0040c2d0 string empty + 0x0040c2f0 clear ====== */

/* 0x40c2d0 `cmp dword [ecx+0x10],0 ; sete al ; ret` — FULL-dword size
   test (no byte read anywhere); result 1 iff size == 0. */
int32_t isaac_anm2_string_empty(uint32_t size) {
  return size == 0u ? 1 : 0;
}

/* 0x40c2f0 clear: cap gate (jb @ 0x40c2f4, UNSIGNED) selects the first-
   byte store address; the dword [self+0x10] := 0 size store is shared by
   both exits. All stores are constant 0 — the plan is the decision + the
   two store addresses; no host calls. */
void isaac_anm2_string_clear_plan(uint32_t cap, uint32_t buf, uint32_t self,
                                  IsaacAnm2StringClearPlan* out) {
  IsaacAnm2StringClearPlan plan;
  plan.entered = 1;
  plan.cap = cap;
  plan.buf = buf;
  plan.self = self;
  plan.heap_path =
      cap >= static_cast<uint32_t>(ISAAC_ANM2_SSO_CAPACITY_THRESHOLD) ? 1
                                                                      : 0;
  plan.size_store = 1; /* 0x40c2f8 and 0x40c303 — identical stores */
  plan.size_off = static_cast<uint32_t>(ISAAC_ANM2_STRING_SIZE_OFF);
  plan.size_value = 0u; /* dword [self+0x10] := 0 — the clear store */
  plan.byte_store = 1; /* 0x40c2ff heap / 0x40c30a SSO */
  plan.byte_addr = plan.heap_path != 0 ? buf : self;
  plan.byte_value = 0u;
  plan.pure_complete = 1;
  if (out != nullptr) {
    *out = plan;
  }
}

ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_string_empty);
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_string_clear_plan);

static_assert(sizeof(IsaacAnm2StringClearPlan) == 48,
              "v58 string clear plan is 12 x 4 bytes");

/* ============ v59-gapscan: 0x0040bcb0 SSO AD name-walk wrapper ============
   The wrapper's only logic is the SSO select at 0x40bcb6..0x40bcbe
   (`cmp [eax+0x14],0x10 ; jb` — UNSIGNED strict below; then the arg slot
([ebp+8] is REWRITTEN to the selected chars) and the tail-jump into the
   family's pure v1/v6 walk (0x40bcd0). The select is the standing
   isaac_anm2_sso_uses_heap law (no scalar duplicate exported). Combined:
   zero host calls. */
void isaac_anm2_anim_data_sso_walk_plan(uint8_t* anm2,
                                        uint32_t str_addr,
                                        IsaacAnm2AnimDataSsoWalkPlan* out) {
  IsaacAnm2AnimDataSsoWalkPlan plan;
  plan.entered = 0;
  plan.str_addr = str_addr;
  plan.cap = 0;
  plan.heap_used = 0;
  plan.name_addr = 0;
  plan.count = 0;
  plan.base = 0;
  plan.found = 0;
  plan.found_index = -1;
  plan.elem_byte_offset = 0;
  plan.result_ptr = 0;
  plan.pure_complete = 1; /* ALWAYS — zero host calls in the combined body */

  uint32_t name_addr = 0;
  if (str_addr != 0u) {
    /* cmp dword [eax+0x14],0x10 ; jb INLINE — UNSIGNED strict below. */
    const uint32_t cap = load_guest_u32(
        str_addr + static_cast<uint32_t>(ISAAC_ANM2_OFF_FILENAME_CAP_14));
    plan.cap = cap;
    if (cap < static_cast<uint32_t>(ISAAC_ANM2_SSO_CAPACITY_THRESHOLD)) {
      plan.heap_used = 0;
      name_addr = str_addr;
    } else {
      plan.heap_used = 1;
      name_addr = load_guest_u32(str_addr);
    }
    plan.name_addr = name_addr;
  }

  if (anm2 != nullptr) {
    plan.entered = 1;
    const uint32_t base = load_u32(anm2 + ISAAC_ANM2_OFF_ANIM_DATA_74);
    const uint32_t count = load_u32(anm2 + ISAAC_ANM2_OFF_ANIM_COUNT_78);
    plan.base = base;
    plan.count = count;
    if (count != 0u) {
      const int32_t idx = isaac_anm2_anim_data_index_by_name(
          guest_ptr(base), count,
          reinterpret_cast<const char*>(guest_ptr(name_addr)));
      if (idx >= 0) {
        plan.found = 1;
        plan.found_index = idx;
        plan.elem_byte_offset = isaac_anm2_anim_data_byte_offset(idx);
        /* 0x40bd3d: add eax,[ebp-4] — base + idx*0x13c (element ADDRESS). */
        plan.result_ptr = base + plan.elem_byte_offset;
      }
    }
  }
  if (out != nullptr) {
    *out = plan;
  }
}

ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_anim_data_sso_walk_plan);

static_assert(sizeof(IsaacAnm2AnimDataSsoWalkPlan) == 48,
              "v59-gapscan SSO walk plan is 12 x 4 bytes");

/* ============ v60-c380: 0x0040c380 string SSO default ctor ================
   MSVC std::basic_string SSO default ctor: `mov [ecx],0 ; mov eax,ecx ;
   mov [ecx+0x10],0 ; mov [ecx+0x14],0xf ; ret` — CONSTANT stores only
   (chars dword +0, size +0x10, cap +0x14 = 0xf = BUF_SIZE - 1), zero
   gates, zero host calls. The law mirrors the three machine stores
   verbatim; the family byte-gate rule is vacuous (no byte reads or
   gates anywhere in the body). */
void isaac_anm2_string_default_ctor_plan(uint32_t self,
                                         IsaacAnm2StringDefaultCtorPlan* out) {
  IsaacAnm2StringDefaultCtorPlan plan;
  plan.entered = self != 0u ? 1 : 0;
  plan.self = self;
  plan.store_count = 3;
  plan.result = self; /* mov eax,ecx @ 0x40c386 */
  /* 0x40c380 mov dword [ecx], 0 — chars dword (inline SSO buf at +0). */
  plan.chars_off = 0u;
  plan.chars_value = 0u;
  /* 0x40c388 mov dword [ecx+0x10], 0 — size := 0. */
  plan.size_off = static_cast<uint32_t>(ISAAC_ANM2_STRING_SIZE_OFF);
  plan.size_value = 0u;
  /* 0x40c38f mov dword [ecx+0x14], 0xf — cap := 0xf (BUF_SIZE - 1). */
  plan.cap_off = static_cast<uint32_t>(ISAAC_ANM2_STRING_CAP_OFF);
  plan.cap_value =
      static_cast<uint32_t>(ISAAC_ANM2_STRING_DEFAULT_CTOR_CAP_VALUE);
  plan.pure_complete = 1;
  plan.host_call_count = 0;
  if (out != nullptr) {
    *out = plan;
  }
}

ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_string_default_ctor_plan);

static_assert(sizeof(IsaacAnm2StringDefaultCtorPlan) == 48,
              "v60-c380 string default ctor plan is 12 x 4 bytes");

/* ============ v61-c5b0: 0x0040c5b0 2-dword pair ctor ======================
   `mov dword [ecx],0 ; mov eax,ecx ; mov dword [ecx+4],0 ; ret` — a
   2-dword zero-init ctor (pointer-pair / std::pair / SSO first-8-bytes
   shape) between the v8 CTOR_ANIM pin (0x40c550) and the vtbl-dtor
   cluster (0x40c5c0). CONSTANT stores only ([self+0] := 0 @ 0x40c5b0,
   [self+4] := 0 @ 0x40c5b8), zero gates, zero host calls. The law
   mirrors the two machine stores verbatim; the family byte-gate rule is
   vacuous (no byte reads or gates anywhere in the body). Census: E8=0,
   E9=0, push-imm32 addr-taken = 5 (0x950c73, 0x9df4f0, 0xa1a98f,
   0xa1fa9b, 0xa219fb) — reached only as an address-taken fn pointer. */
void isaac_anm2_pair_ctor_plan(uint32_t self,
                               IsaacAnm2PairCtorPlan* out) {
  IsaacAnm2PairCtorPlan plan;
  plan.entered = self != 0u ? 1 : 0;
  plan.self = self;
  plan.result = plan.entered != 0 ? self : 0u;
  plan.store_count = 2;
  /* 0x40c5b0 mov dword [ecx], 0 — dword [self+0] := 0. */
  plan.first_off = static_cast<uint32_t>(ISAAC_ANM2_PAIR_CTOR_FIRST_OFF);
  plan.first_value = 0u;
  /* 0x40c5b8 mov dword [ecx+4], 0 — dword [self+4] := 0. */
  plan.second_off = static_cast<uint32_t>(ISAAC_ANM2_PAIR_CTOR_SECOND_OFF);
  plan.second_value = 0u;
  plan.pure_complete = 1;
  plan.host_call_count = 0;
  if (out != nullptr) {
    *out = plan;
  }
}

ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_pair_ctor_plan);

static_assert(sizeof(IsaacAnm2PairCtorPlan) == 40,
              "v61-c5b0 pair ctor plan is 10 x 4 bytes");

/* ============ v62 unit: 0x0040d140 / 0x0040d170 / 0x0040d210 ==============
   Three complete small pure bodies in the 0x40d120..0x40d220 gap. All
   plan-only scalar laws (the v61 pair-ctor pattern): the machine stores
   are REPORTED, not performed — the receivers are dead code with zero
   callers of any kind, so there is no apply surface to replay. */

void isaac_anm2_strpair_ctor_plan(uint32_t self,
                                  IsaacAnm2StrPairCtorPlan* out) {
  IsaacAnm2StrPairCtorPlan plan;
  plan.entered = self != 0u ? 1 : 0;
  plan.self = self;
  plan.result = plan.entered != 0 ? self : 0u;
  plan.store_count = 7;
  /* 0x40d140 [self+0x08] = 0 (A data); 0x40d149 [self+0x18] = 0 (A size);
     0x40d150 [self+0x1c] = 0xf (A cap); 0x40d157 [self+0x20] = 0 (B data);
     0x40d15e [self+0x30] = 0 (B size); 0x40d165 [self+0x34] = 0xf
     (B cap) — strings A at +0x8, B at +0x20. */
  plan.a_off = static_cast<uint32_t>(ISAAC_ANM2_STRPAIR_CTOR_A_OFF);
  plan.b_off = static_cast<uint32_t>(ISAAC_ANM2_STRPAIR_CTOR_B_OFF);
  plan.sso_cap = static_cast<uint32_t>(ISAAC_ANM2_STRPAIR_CTOR_SSO_CAP);
  plan.pure_complete = 1;
  plan.host_call_count = 0;
  if (out != nullptr) {
    *out = plan;
  }
}

ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_strpair_ctor_plan);

static_assert(sizeof(IsaacAnm2StrPairCtorPlan) == 36,
              "v62 strpair ctor plan is 9 x 4 bytes");

void isaac_anm2_identity_ctor_plan(uint32_t self,
                                   IsaacAnm2IdentityCtorPlan* out) {
  IsaacAnm2IdentityCtorPlan plan;
  plan.entered = self != 0u ? 1 : 0;
  plan.self = self;
  plan.result = plan.entered != 0 ? self : 0u;
  plan.store_count = 22;
  /* 0x40d1b7..0x40d1cc: dwords +0x30/+0x34/+0x38/+0x3c := 0x3f800000
     (1.0f x4); 0x40d1d3..0x40d1fd: dwords +0x40..+0x58 := 0;
     0x40d204: byte +0x60 := 0. The +0x00..+0x24 dwords are zeroed in the
     PE's pairwise order (+0x28 NOT stored). */
  plan.one_bits = static_cast<uint32_t>(ISAAC_ANM2_IDENTITY_CTOR_ONE_BITS);
  plan.ones_first_off =
      static_cast<uint32_t>(ISAAC_ANM2_IDENTITY_CTOR_ONES_FIRST_OFF);
  plan.byte_off = static_cast<uint32_t>(ISAAC_ANM2_IDENTITY_CTOR_BYTE_OFF);
  plan.pure_complete = 1;
  plan.host_call_count = 0;
  if (out != nullptr) {
    *out = plan;
  }
}

ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_identity_ctor_plan);

static_assert(sizeof(IsaacAnm2IdentityCtorPlan) == 36,
              "v62 identity ctor plan is 9 x 4 bytes");

uint32_t isaac_anm2_global_base_getter(uint32_t loaded) {
  /* 0x40d210 mov eax,[0xc7169c]; 0x40d215 add eax,0x2a6c0; 0x40d21a ret.
     32-bit wrap on the add — the PE dword arithmetic. */
  return loaded + static_cast<uint32_t>(ISAAC_ANM2_GLOBAL_BASE_DELTA);
}

ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_global_base_getter);

/* ============ v64 unit: 0x00413b40 / 0x00413b90 ===========================
   0x00413b40 (SEH wrapper over host container-clear 0x414730) stays HOST
   — census row only, no export. 0x00413b90 lands: plan-only scalar law
   plus the alignment twin. */

void isaac_anm2_aligned_state_ctor_plan(uint32_t self,
                                        IsaacAnm2AlignedStateCtorPlan* out) {
  IsaacAnm2AlignedStateCtorPlan plan;
  plan.entered = self != 0u ? 1 : 0;
  plan.self = self;
  plan.result = plan.entered != 0 ? self : 0u;
  plan.store_count = 11;
  plan.base_off = static_cast<uint32_t>(ISAAC_ANM2_ALIGNED_STATE_CTOR_BASE_OFF);
  plan.sentinel_off =
      static_cast<uint32_t>(ISAAC_ANM2_ALIGNED_STATE_CTOR_SENTINEL_OFF);
  plan.aligned_value = 0u;
  plan.pure_complete = 1;
  plan.host_call_count = 0;
  if (self != 0u) {
    /* 0x413ba8 mov eax,ecx; 0x413bb1 neg eax; 0x413bba and eax,3;
       0x413bc4 add eax,ecx; 0x413bcd mov [esi+0x34],eax.
       base = self + 0x3c. */
    const uint32_t b =
        self + static_cast<uint32_t>(ISAAC_ANM2_ALIGNED_STATE_CTOR_BASE_OFF);
    plan.aligned_value = isaac_anm2_aligned_state_ctor_aligned(b);
  }
  if (out != nullptr) {
    *out = plan;
  }
}

ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_aligned_state_ctor_plan);

static_assert(sizeof(IsaacAnm2AlignedStateCtorPlan) == 36,
              "v64 aligned-state ctor plan is 9 x 4 bytes");

uint32_t isaac_anm2_aligned_state_ctor_aligned(uint32_t base) {
  /* PE 0x413ba8/0x413bb1/0x413bba/0x413bc4: base + ((-base) & 3),
     32-bit wrap — round UP to the next multiple of 4. */
  return base + ((0u - base) &
                 static_cast<uint32_t>(ISAAC_ANM2_ALIGNED_STATE_CTOR_ALIGN_MASK));
}

ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_aligned_state_ctor_aligned);

/* ============ v65 unit: 0x00413bf0 / 0x00413c70 ===========================
   Twin by-name intrusive-list lookups. Shared walk (guest-memory reads
   via guest_ptr, the v6-walk pattern); the twins differ only in
   head_off / next_off. */

namespace {

void anm2_list_find_impl(uint32_t this_addr,
                         uint32_t needle_addr,
                         uint32_t head_off,
                         uint32_t next_off,
                         IsaacAnm2ListFindPlan* out) {
  IsaacAnm2ListFindPlan plan;
  plan.entered = needle_addr != 0u ? 1 : 0;
  plan.this_addr = this_addr;
  plan.needle_addr = needle_addr;
  plan.head = 0u;
  plan.found = 0;
  plan.result = 0u;
  plan.walked_count = 0;
  plan.log_needed = 0;
  plan.log_va = 0u;
  plan.log_level = 0;
  plan.host_call_count = 0;
  plan.pure_complete = 1;

  if (this_addr == 0u) {
    /* v42 zeroed posture: the machine would fault on [this+head_off]. */
    if (out != nullptr) *out = plan;
    return;
  }
  const uint8_t* th = guest_ptr(this_addr);
  plan.head = load_u32(th + head_off);

  if (plan.entered == 0) {
    /* Null needle: the machine returns the RAW head (ret 0xc). */
    plan.result = plan.head;
    if (out != nullptr) *out = plan;
    return;
  }

  /* 0x413bfb..0x413c07: inline strlen of the needle. */
  uint32_t len = 0u;
  while (load_u8(guest_ptr(needle_addr) + len) != 0u) {
    ++len;
  }

  /* 0x413c09..0x413c4f: the node walk. */
  uint32_t node = plan.head;
  while (node != 0u) {
    ++plan.walked_count;
    const uint8_t* np = guest_ptr(node);
    const uint32_t name = load_u32(np);
    uint32_t cmp_len;
    const uint8_t* chars;
    if (name == 0u) {
      /* Empty-name node: the machine substitutes the 0x00c71640 global
         with length 0 (0x413c1e/0x413c20). */
      cmp_len = 0u;
      chars = guest_ptr(static_cast<uint32_t>(ISAAC_ANM2_LIST_FIND_EMPTY_GLOBAL));
    } else {
      cmp_len = load_u32(np + static_cast<uint32_t>(ISAAC_ANM2_LIST_FIND_LEN_OFF));
      chars = guest_ptr(name);
    }
    if (cmp_len == len &&
        __builtin_memcmp(chars, guest_ptr(needle_addr), len) == 0) {
      plan.found = 1;
      plan.result = node;
      if (out != nullptr) *out = plan;
      return;
    }
    node = load_u32(np + next_off);
  }
  plan.result = 0u;
  if (out != nullptr) *out = plan;
}

} /* namespace */

void isaac_anm2_list_find_a_plan(uint32_t this_addr,
                                 uint32_t needle_addr,
                                 IsaacAnm2ListFindPlan* out) {
  anm2_list_find_impl(this_addr, needle_addr,
                      static_cast<uint32_t>(ISAAC_ANM2_LIST_FIND_A_HEAD_OFF),
                      static_cast<uint32_t>(ISAAC_ANM2_LIST_FIND_A_NEXT_OFF),
                      out);
}

ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_list_find_a_plan);

static_assert(sizeof(IsaacAnm2ListFindPlan) == 48,
              "v65 list-find plan is 12 x 4 bytes");

void isaac_anm2_list_find_b_plan(uint32_t this_addr,
                                 uint32_t needle_addr,
                                 IsaacAnm2ListFindPlan* out) {
  anm2_list_find_impl(this_addr, needle_addr,
                      static_cast<uint32_t>(ISAAC_ANM2_LIST_FIND_B_HEAD_OFF),
                      static_cast<uint32_t>(ISAAC_ANM2_LIST_FIND_B_NEXT_OFF),
                      out);
}

ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_list_find_b_plan);

/* ============ v66 unit: 0x00413cf0 manager seek ===========================
   Report-only plan (see the header block): the machine's stores are
   reported, never performed. Guest reads go through guest_ptr/load_u32
   (the v6-walk pattern). */

void isaac_anm2_mgr_seek_plan(uint8_t* th,
                              uint32_t x_lo,
                              uint32_t x_hi,
                              uint32_t y_lo,
                              uint32_t y_hi,
                              uint32_t flags,
                              IsaacAnm2MgrSeekPlan* out) {
  IsaacAnm2MgrSeekPlan plan;
  plan.entered = 0;
  plan.this_addr = 0u;
  plan.x_lo = x_lo; plan.x_hi = x_hi;
  plan.y_lo = y_lo; plan.y_hi = y_hi;
  plan.flags = flags;
  plan.req_lo = 0u; plan.req_hi = 0u;
  plan.pos_lo = 0u; plan.lim_hi = 0u;
  plan.limit_lo = 0u; plan.limit_hi = 0u;
  plan.a_val = 0u; plan.c_val = 0u;
  plan.max_updated = 0;
  plan.ok = 0;
  plan.new_lo = 0u;
  plan.ab_applied = 0;
  plan.ab_a_addr = 0u; plan.ab_a_value = 0u;
  plan.ab_b_addr = 0u; plan.ab_b_value = 0u;
  plan.cd_applied = 0;
  plan.cd_pos_addr = 0u; plan.cd_pos_value = 0u;
  plan.cd_c_addr = 0u; plan.cd_c_value = 0u;
  plan.cd_d_addr = 0u; plan.cd_d_value = 0u;
  plan.out_lo = 0u; plan.out_hi = 0u;
  plan.pure_complete = 1;
  plan.host_call_count = 0;

  if (th == nullptr) {
    if (out != nullptr) *out = plan;
    return;
  }
  plan.entered = 1;
  plan.this_addr = static_cast<uint32_t>(reinterpret_cast<uintptr_t>(th));

  /* 0x413d04 add / 0x413d0a adc: req64 = X + Y (32-bit halves). */
  plan.req_lo = x_lo + y_lo;
  plan.req_hi = x_hi + y_hi + (plan.req_lo < x_lo ? 1u : 0u);

  /* 0x413d07/0x413d11: a_val = *[*[this+0x1c]]. */
  const uint32_t a_ptr = load_u32(th + 0x1cu);
  plan.a_val = a_ptr != 0u ? load_u32(guest_ptr(a_ptr)) : 0u;

  /* 0x413d0d: flag byte [this+0x3c] bit 1. */
  const uint8_t mgr_flag2 = (load_u8(th + 0x3cu) & 2u) != 0u ? 1 : 0;
  if (mgr_flag2 == 0) {
    /* 0x413d1d..0x413d2b: c_val load + UNSIGNED max-update arm. */
    const uint32_t c_ptr = load_u32(th + 0x20u);
    const uint32_t c_val = c_ptr != 0u ? load_u32(guest_ptr(c_ptr)) : 0u;
    plan.c_val = c_val;
    const uint32_t cur_lim = load_u32(th + 0x38u);
    if (c_val != 0u && cur_lim < c_val) {
      plan.max_updated = 1;
      plan.lim_hi = c_val;
    } else {
      plan.lim_hi = cur_lim;
    }
  } else {
    plan.c_val = 0u;
    plan.lim_hi = load_u32(th + 0x38u);
  }

  /* 0x413d2e/0x413d31: pos_lo = *[*[this+0x0c]]. */
  const uint32_t pos_ptr = load_u32(th + 0x0cu);
  plan.pos_lo = pos_ptr != 0u ? load_u32(guest_ptr(pos_ptr)) : 0u;

  /* 0x413d33..0x413d41: limit64 = sext64(lim_hi - pos_lo). */
  const uint32_t diff = plan.lim_hi - plan.pos_lo;
  plan.limit_lo = diff;
  plan.limit_hi = (diff & 0x80000000u) != 0u ? 0xffffffffu : 0u;

  /* 0x413d41..0x413d49: UNSIGNED 64-bit bounds compare. */
  int ok = 1;
  if (plan.req_hi > plan.limit_hi) {
    ok = 0;
  } else if (plan.req_hi == plan.limit_hi && plan.req_lo > plan.limit_lo) {
    ok = 0;
  }

  /* 0x413d50..0x413d67: flag gates, ONLY when req64 != 0. */
  const uint32_t dl = flags & 0xffu;
  if ((plan.req_lo | plan.req_hi) != 0u) {
    if ((dl & 1u) != 0u && plan.a_val == 0u) ok = 0;
    if ((dl & 2u) != 0u && plan.c_val == 0u) ok = 0;
  }
  plan.ok = ok;

  /* 0x413d69/0x413d6d: new_lo = pos_lo + req_lo. */
  plan.new_lo = plan.pos_lo + plan.req_lo;

  if (ok != 0) {
    /* Arm A/B: iff flags&1 && a_val != 0 (0x413d6f..0x413d89). */
    if ((dl & 1u) != 0u && plan.a_val != 0u) {
      plan.ab_applied = 1;
      plan.ab_a_addr = load_u32(th + 0x1cu);
      plan.ab_a_value = plan.new_lo;
      plan.ab_b_addr = load_u32(th + 0x2cu);
      plan.ab_b_value = plan.lim_hi - plan.new_lo;
    }
    /* Arm C/D: iff flags&2 && c_val != 0 (0x413d8e..0x413db6). */
    if ((dl & 2u) != 0u && plan.c_val != 0u) {
      plan.cd_applied = 1;
      plan.cd_pos_addr = load_u32(th + 0x10u);
      plan.cd_pos_value = plan.pos_lo;
      plan.cd_c_addr = load_u32(th + 0x20u);
      plan.cd_c_value = plan.new_lo;
      plan.cd_d_addr = load_u32(th + 0x30u);
      const uint32_t old_c =
          load_u32(guest_ptr(load_u32(th + 0x20u)));
      const uint32_t old_d =
          load_u32(guest_ptr(load_u32(th + 0x30u)));
      plan.cd_d_value = (old_c + old_d) - plan.new_lo;
    }
    plan.out_lo = plan.req_lo;
    plan.out_hi = plan.req_hi;
  } else {
    /* 0x413dc2: fail sentinels. */
    plan.out_lo = 0xffffffffu;
    plan.out_hi = 0xffffffffu;
  }

  if (out != nullptr) *out = plan;
}

ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_mgr_seek_plan);

static_assert(sizeof(IsaacAnm2MgrSeekPlan) == 136,
              "v66 mgr-seek plan is 34 x 4 bytes");

/* ============ v67 unit: 0x00413e00 whence-switch seek =====================
   Report-only plan (see the header block). */

void isaac_anm2_mgr_seek2_plan(uint8_t* th,
                               uint32_t off_lo,
                               uint32_t off_hi,
                               uint32_t whence,
                               uint32_t flags,
                               IsaacAnm2MgrSeek2Plan* out) {
  IsaacAnm2MgrSeek2Plan plan;
  plan.entered = 0;
  plan.this_addr = 0u;
  plan.off_lo = off_lo; plan.off_hi = off_hi;
  plan.whence = whence; plan.flags = flags;
  plan.pos_lo = 0u; plan.lim_hi = 0u;
  plan.a_val = 0u; plan.c_val = 0u;
  plan.max_updated = 0;
  plan.target_lo = 0u; plan.target_hi = 0u;
  plan.req_lo = 0u; plan.req_hi = 0u;
  plan.limit_lo = 0u; plan.limit_hi = 0u;
  plan.invalid_whence = 0;
  plan.align_fail = 0;
  plan.ok = 0;
  plan.new_lo = 0u;
  plan.ab_applied = 0;
  plan.ab_a_addr = 0u; plan.ab_a_value = 0u;
  plan.ab_b_addr = 0u; plan.ab_b_value = 0u;
  plan.cd_applied = 0;
  plan.cd_pos_addr = 0u; plan.cd_pos_value = 0u;
  plan.cd_c_addr = 0u; plan.cd_c_value = 0u;
  plan.cd_d_addr = 0u; plan.cd_d_value = 0u;
  plan.out_lo = 0u; plan.out_hi = 0u;
  plan.pure_complete = 1;
  plan.host_call_count = 0;

  if (th == nullptr) {
    if (out != nullptr) *out = plan;
    return;
  }
  plan.entered = 1;
  plan.this_addr = static_cast<uint32_t>(reinterpret_cast<uintptr_t>(th));

  /* Prologue (0x413e0e..0x413e2f): a_val, c_val, max-update arm. */
  const uint32_t a_ptr = load_u32(th + 0x1cu);
  plan.a_val = a_ptr != 0u ? load_u32(guest_ptr(a_ptr)) : 0u;
  const uint8_t mgr_flag2 = (load_u8(th + 0x3cu) & 2u) != 0u ? 1 : 0;
  if (mgr_flag2 == 0) {
    const uint32_t c_ptr = load_u32(th + 0x20u);
    const uint32_t c_val = c_ptr != 0u ? load_u32(guest_ptr(c_ptr)) : 0u;
    plan.c_val = c_val;
    const uint32_t cur_lim = load_u32(th + 0x38u);
    if (c_val != 0u && cur_lim < c_val) {
      plan.max_updated = 1;
      plan.lim_hi = c_val;
    } else {
      plan.lim_hi = cur_lim;
    }
  } else {
    plan.c_val = 0u;
    plan.lim_hi = load_u32(th + 0x38u);
  }

  /* 0x413e32/0x413e38: pos_lo = *[*[this+0x0c]]. */
  const uint32_t pos_ptr = load_u32(th + 0x0cu);
  plan.pos_lo = pos_ptr != 0u ? load_u32(guest_ptr(pos_ptr)) : 0u;

  /* 0x413e3a/0x413e43: diff = lim_hi - pos_lo (reused as whence-2 base
     and as the limit low word). */
  const uint32_t diff = plan.lim_hi - plan.pos_lo;

  /* Whence switch (0x413e4e..0x413e5b). */
  const uint32_t dl = flags & 0xffu;
  uint32_t tgt_lo = 0u, tgt_hi = 0u;
  int fail = 0;
  if (whence == 0u) {
    tgt_lo = 0u; tgt_hi = 0u;                    /* 0x413eb5 xorps */
  } else if (whence == 1u) {
    /* 0x413e6c: ALIGN GUARD -- (flags & 3) == 3 rejects. */
    if ((flags & 3u) == 3u) {
      plan.align_fail = 1;
      fail = 1;
    } else if ((dl & 1u) != 0u) {
      /* 0x413e7e..93: if (a_val == 0 && pos != 0) FAIL;
         target = sext64(a_val - pos). */
      if (plan.a_val == 0u && plan.pos_lo != 0u) {
        fail = 1;
      } else {
        const uint32_t d = plan.a_val - plan.pos_lo;
        tgt_lo = d;
        tgt_hi = (d & 0x80000000u) != 0u ? 0xffffffffu : 0u;
      }
    } else if ((dl & 2u) != 0u) {
      /* 0x413e9e..b3: if (c_val == 0 && pos != 0) FAIL;
         target = sext64(c_val - pos). */
      if (plan.c_val == 0u && plan.pos_lo != 0u) {
        fail = 1;
      } else {
        const uint32_t d = plan.c_val - plan.pos_lo;
        tgt_lo = d;
        tgt_hi = (d & 0x80000000u) != 0u ? 0xffffffffu : 0u;
      }
    } else {
      fail = 1;                                  /* 0x413e95..9e */
    }
  } else if (whence == 2u) {
    tgt_lo = diff;                               /* 0x413e61..6a */
    tgt_hi = (diff & 0x80000000u) != 0u ? 0xffffffffu : 0u;
  } else {
    plan.invalid_whence = 1;                     /* 0x413e58 */
    fail = 1;
  }
  plan.target_lo = tgt_lo;
  plan.target_hi = tgt_hi;

  /* 0x413ec6/0x413ec9: req64 = target64 + off64 (carry). */
  plan.req_lo = tgt_lo + off_lo;
  plan.req_hi = tgt_hi + off_hi + (plan.req_lo < tgt_lo ? 1u : 0u);

  /* 0x413ed0..e3: limit64 = sext64(diff); u64 bounds compare. */
  plan.limit_lo = diff;
  plan.limit_hi = (diff & 0x80000000u) != 0u ? 0xffffffffu : 0u;
  if (plan.req_hi > plan.limit_hi ||
      (plan.req_hi == plan.limit_hi && plan.req_lo > plan.limit_lo)) {
    fail = 1;
  }

  /* 0x413ee5..f1: gates ONLY when req64 != 0 -- on POS (not a_val). */
  if ((plan.req_lo | plan.req_hi) != 0u) {
    if ((dl & 1u) != 0u && plan.pos_lo == 0u) fail = 1;
    if ((dl & 2u) != 0u && plan.c_val == 0u) fail = 1;
  }
  plan.ok = fail != 0 ? 0 : 1;

  /* 0x413f03/07: new_lo = pos_lo + req_lo. */
  plan.new_lo = plan.pos_lo + plan.req_lo;

  if (plan.ok != 0) {
    /* Arm A/B: iff flags&1 && pos_lo != 0 (0x413f0d..24). */
    if ((dl & 1u) != 0u && plan.pos_lo != 0u) {
      plan.ab_applied = 1;
      plan.ab_a_addr = load_u32(th + 0x1cu);
      plan.ab_a_value = plan.new_lo;
      plan.ab_b_addr = load_u32(th + 0x2cu);
      plan.ab_b_value = plan.lim_hi - plan.new_lo;
    }
    /* Arm C/D: iff flags&2 && c_val != 0 (0x413f26..50). */
    if ((dl & 2u) != 0u && plan.c_val != 0u) {
      plan.cd_applied = 1;
      plan.cd_pos_addr = load_u32(th + 0x10u);
      plan.cd_pos_value = plan.pos_lo;
      plan.cd_c_addr = load_u32(th + 0x20u);
      plan.cd_c_value = plan.new_lo;
      plan.cd_d_addr = load_u32(th + 0x30u);
      const uint32_t old_c =
          load_u32(guest_ptr(load_u32(th + 0x20u)));
      const uint32_t old_d =
          load_u32(guest_ptr(load_u32(th + 0x30u)));
      plan.cd_d_value = (old_c + old_d) - plan.new_lo;
    }
    plan.out_lo = plan.req_lo;
    plan.out_hi = plan.req_hi;
  } else {
    plan.out_lo = 0xffffffffu;
    plan.out_hi = 0xffffffffu;
  }

  if (out != nullptr) *out = plan;
}

ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_mgr_seek2_plan);

static_assert(sizeof(IsaacAnm2MgrSeek2Plan) == 148,
              "v67 mgr-seek2 plan is 37 x 4 bytes");

/* ============ v68-retry: 0x00413ff0 put-char + 0x00413f90 get-byte =======
   Report-only plans. LESSON 1: the mismatch gate evaluates in PE order
   and only on bounds-pass (the machine's fail exits never reach the
   [esi-1] read). LESSON 2: ch_store_addr SIMULATES the post-dec pos
   (the machine decs the cell for real before its byte store). */

void isaac_anm2_mgr_putc_plan(uint8_t* th,
                              uint32_t ch,
                              IsaacAnm2MgrPutcPlan* out) {
  IsaacAnm2MgrPutcPlan plan;
  plan.entered = 0;
  plan.this_addr = 0u;
  plan.ch = ch;
  plan.pos = 0u;
  plan.size_val = 0u;
  plan.mismatch = 0;
  plan.ok = 0;
  plan.end_inc_applied = 0;
  plan.end_inc_addr = 0u; plan.end_inc_value = 0u;
  plan.pos_dec_applied = 0;
  plan.pos_dec_addr = 0u; plan.pos_dec_value = 0u;
  plan.ch_store_applied = 0;
  plan.ch_store_addr = 0u; plan.ch_store_value = 0u;
  plan.result = 0;
  plan.pure_complete = 1;
  plan.host_call_count = 0;

  if (th == nullptr) {
    if (out != nullptr) *out = plan;
    return;
  }
  plan.entered = 1;
  plan.this_addr = static_cast<uint32_t>(reinterpret_cast<uintptr_t>(th));

  const uint32_t pos_ptr = load_u32(th + 0x1cu);
  plan.pos = pos_ptr != 0u ? load_u32(guest_ptr(pos_ptr)) : 0u;
  const uint32_t size_ptr = load_u32(th + 0x0cu);
  plan.size_val = size_ptr != 0u ? load_u32(guest_ptr(size_ptr)) : 0u;

  /* PE ORDER: bounds fails first; each exit jumps past everything after. */
  int ok = 1;
  if (plan.pos == 0u) ok = 0;                     /* je 0x413ff9 */
  if (ok != 0 && plan.pos <= plan.size_val) ok = 0; /* jbe 0x414002 */

  /* Gate reached ONLY when ok (bounds passed) and ch != -1
     (je 0x41400a): cmp dl, byte[pos-1] (3A 56 FF @0x41400c). */
  const uint8_t dl = (uint8_t)(ch & 0xffu);
  int mismatch = 0;
  if (ok != 0 && ch != 0xffffffffu) {
    const uint8_t prev = load_u8(guest_ptr(plan.pos) - 1u);
    if (dl != prev) {
      mismatch = 1;
      if ((load_u8(th + 0x3cu) & 2u) != 0u) ok = 0;  /* 0x414011..15 */
    }
  }
  plan.mismatch = mismatch;
  plan.ok = ok;

  if (ok) {
    /* 0x414017..1f: end++ / pos-- arms (unconditional on success). */
    plan.end_inc_applied = 1;
    plan.end_inc_addr = load_u32(th + 0x2cu);
    plan.end_inc_value = load_u32(guest_ptr(plan.end_inc_addr)) + 1u;
    plan.pos_dec_applied = 1;
    plan.pos_dec_addr = load_u32(th + 0x1cu);
    plan.pos_dec_value = load_u32(guest_ptr(plan.pos_dec_addr)) - 1u;
    /* 0x414021..2b: iff ch != -1 -- the machine decs the cell for real,
       then stores at the NEW pos: simulate the post-dec address. */
    if (ch != 0xffffffffu) {
      plan.ch_store_applied = 1;
      plan.ch_store_addr = plan.pos_dec_value;
      plan.ch_store_value = (uint32_t)dl;
    }
    /* 0x41402d..36: result = ch == -1 ? 0 : ch (full dword). */
    plan.result = ch == 0xffffffffu ? 0 : static_cast<int32_t>(ch);
  } else {
    plan.result = -1;
  }

  if (out != nullptr) *out = plan;
}

ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_mgr_putc_plan);

static_assert(sizeof(IsaacAnm2MgrPutcPlan) == 76,
              "v68 mgr-putc plan is 19 x 4 bytes");

void isaac_anm2_mgr_getc_plan(uint8_t* th,
                              IsaacAnm2MgrGetcPlan* out) {
  IsaacAnm2MgrGetcPlan plan;
  plan.entered = 0;
  plan.this_addr = 0u;
  plan.pos = 0u;
  plan.end_base = 0u; plan.end_val = 0u;
  plan.direct_hit = 0;
  plan.direct_byte = 0u;
  plan.refresh_used = 0;
  plan.e_val = 0u;
  plan.refresh_flag4_fail = 0;
  plan.lim_old = 0u; plan.lim_new = 0u;
  plan.lim_committed = 0;
  plan.end_wr_applied = 0;
  plan.end_wr_addr = 0u; plan.end_wr_value = 0u;
  plan.pos_wr_applied = 0;
  plan.pos_wr_addr = 0u; plan.pos_wr_value = 0u;
  plan.result = 0;
  plan.pure_complete = 1;
  plan.host_call_count = 0;

  if (th == nullptr) {
    if (out != nullptr) *out = plan;
    return;
  }
  plan.entered = 1;
  plan.this_addr = static_cast<uint32_t>(reinterpret_cast<uintptr_t>(th));

  const uint32_t pos_ptr = load_u32(th + 0x1cu);
  plan.pos = pos_ptr != 0u ? load_u32(guest_ptr(pos_ptr)) : 0u;

  int fail = 0;
  if (plan.pos == 0u) fail = 1;              /* 0x413f97 je */

  if (fail == 0) {
    plan.end_base = load_u32(th + 0x2cu);
    const uint32_t end_base_val = plan.end_base != 0u
        ? load_u32(guest_ptr(plan.end_base)) : 0u;
    plan.end_val = end_base_val + plan.pos;  /* 0x413f9e..a0: pos ADDED */
    if (plan.pos < plan.end_val) {
      /* 0x413fa2..ab: DIRECT hit. */
      plan.direct_hit = 1;
      plan.direct_byte = load_u8(guest_ptr(plan.pos));
      plan.result = static_cast<int32_t>(plan.direct_byte);
      if (out != nullptr) *out = plan;
      return;
    }
    /* 0x413fac..df: refresh arm. */
    plan.refresh_used = 1;
    const uint32_t e_ptr = load_u32(th + 0x20u);
    plan.e_val = e_ptr != 0u ? load_u32(guest_ptr(e_ptr)) : 0u;
    if (plan.e_val == 0u) fail = 1;          /* 0x413fb1 je */
    if ((load_u8(th + 0x3cu) & 4u) != 0u) {  /* 0x413fb5..b9 */
      plan.refresh_flag4_fail = 1;
      fail = 1;
    }
    if (fail == 0) {
      plan.lim_old = load_u32(th + 0x38u);
      /* 0x413fbb..c0: cmovb -- lim = max_u32(lim_old, e_val). */
      plan.lim_new = plan.lim_old < plan.e_val ? plan.e_val : plan.lim_old;
      if (plan.lim_new <= plan.pos) fail = 1;   /* 0x413fc3..c5 jbe */
      if (fail == 0) {
        plan.lim_committed = 1;                 /* 0x413fc7 */
        plan.end_wr_applied = 1;                /* 0x413fd0..d4 */
        plan.end_wr_addr = plan.end_base;
        plan.end_wr_value = plan.lim_new - plan.pos;
        plan.pos_wr_applied = 1;                /* 0x413fca..ce */
        plan.pos_wr_addr = load_u32(th + 0x1cu);
        plan.pos_wr_value = plan.pos;           /* SAME-VALUE writeback */
        plan.result = static_cast<int32_t>(
            load_u8(guest_ptr(plan.pos)));      /* 0x413fda..df re-read */
        if (out != nullptr) *out = plan;
        return;
      }
    }
  }

  plan.result = -1;                            /* 0x413fe1 or eax,-1 */
  if (out != nullptr) *out = plan;
}

ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_mgr_getc_plan);

static_assert(sizeof(IsaacAnm2MgrGetcPlan) == 88,
              "v68 mgr-getc plan is 22 x 4 bytes");

/* ============ v71 unit: 0x004143f0 + 0x00414410 tiny getters =============
   Pure scalar laws: the thiscall member reads ([ecx] / [ecx+4]) arrive
   as uint32_t params. */

uint32_t isaac_anm2_stride24_offset(uint32_t base, uint32_t arg) {
  /* 0x4143f6 lea edx,[eax+eax*2]; 0x4143fb lea eax,[eax+edx*8].
     (arg*3)*8 == arg*24, all 32-bit wrap. */
  const uint32_t triple = arg * 3u;
  return base + (triple * 8u);
}

ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_stride24_offset);

int32_t isaac_anm2_diff_div24(uint32_t lo, uint32_t hi) {
  /* 0x414418 sub edx,[ecx]: d = hi - lo (u32 wrap). */
  const int32_t d = static_cast<int32_t>(hi - lo);
  /* 0x41441a imul edx: signed 64-bit product with the magic constant
     0x2aaaaaab = ceil(2^34/24) -- the MSVC SIGNED /24 pattern. */
  const int64_t prod = static_cast<int64_t>(d) *
                       static_cast<int64_t>(0x2aaaaaabu);
  /* 0x41441c sar edx,2: arithmetic shift of the HIGH dword. */
  int32_t high = static_cast<int32_t>(static_cast<uint64_t>(prod) >> 32);
  high >>= 2;
  /* 0x41441f..24: + sign bit -- trunc-toward-zero correction. */
  const uint32_t sign = static_cast<uint32_t>(high) >> 31;
  return static_cast<int32_t>(static_cast<uint32_t>(high) + sign);
}

ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_diff_div24);

/* ============ v73 unit: 0x00414520 string resize-tail setter =============
   SPLIT law: shrink/equal arm reported pure-complete; grow arm reports
   delta + HOST tail 0x00414870. Guest reads via guest_ptr/load_u32. */

void isaac_anm2_str_resize_plan(uint8_t* th,
                                uint32_t new_size,
                                IsaacAnm2StrResizePlan* out) {
  IsaacAnm2StrResizePlan plan;
  plan.entered = 0;
  plan.this_addr = 0u;
  plan.new_size = new_size;
  plan.cur_size = 0u;
  plan.cap = 0u;
  plan.heap_data_used = 0;
  plan.grow = 0;
  plan.delta = 0u;
  plan.size_store_applied = 0;
  plan.size_store_addr = 0u; plan.size_store_value = 0u;
  plan.term_store_applied = 0;
  plan.term_store_addr = 0u; plan.term_store_value = 0u;
  plan.host_tail_va = 0u;
  plan.pure_complete = 1;
  plan.host_call_count = 0;

  if (th == nullptr) {
    if (out != nullptr) *out = plan;
    return;
  }
  plan.entered = 1;
  plan.this_addr = static_cast<uint32_t>(reinterpret_cast<uintptr_t>(th));

  /* 0x00414526/29: cur_size = [th+0x10]; GROW iff arg >u cur. */
  plan.cur_size = load_u32(th + 0x10u);
  const int grow = new_size > plan.cur_size ? 1 : 0;
  plan.grow = grow;

  if (grow != 0) {
    /* 0x0041453f: delta = arg - cur (u32 wrap); HOST tail handoff. */
    plan.delta = new_size - plan.cur_size;
    plan.host_tail_va =
        static_cast<uint32_t>(ISAAC_ANM2_STR_RESIZE_HOST_TAIL_VA);
    if (out != nullptr) *out = plan;
    return;
  }

  /* Shrink/equal arm (pure-complete): SSO select then two stores. */
  plan.cap = load_u32(th + 0x14u);
  const int heap = plan.cap >= 0x10u ? 1 : 0;   /* jb skips the deref */
  plan.heap_data_used = heap;
  plan.size_store_applied = 1;                  /* 0x00414535 */
  plan.size_store_addr = static_cast<uint32_t>(
      reinterpret_cast<uintptr_t>(th + 0x10u));
  plan.size_store_value = new_size;
  plan.term_store_applied = 1;                  /* 0x00414537 */
  {
    const uint32_t base =
        heap != 0 ? load_u32(th) : plan.this_addr;   /* SSO select */
    plan.term_store_addr = base + new_size;
  }
  plan.term_store_value = 0u;

  if (out != nullptr) *out = plan;
}

ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_str_resize_plan);

static_assert(sizeof(IsaacAnm2StrResizePlan) == 68,
              "v73 str-resize plan is 17 x 4 bytes");

/* ============ v76 unit: 0x00414a80 std::_Tree successor ==================
   Pure plan over the guest node graph (reads via guest_ptr). The
   [this] := successor store is REPORTED, never performed. */

void isaac_anm2_tree_next_plan(uint8_t* th,
                               IsaacAnm2TreeNextPlan* out) {
  IsaacAnm2TreeNextPlan plan;
  plan.entered = 0;
  plan.this_addr = 0u;
  plan.node = 0u;
  plan.result_node = 0u;
  plan.path = 0;
  plan.climb_count = 0;
  plan.pure_complete = 1;
  plan.host_call_count = 0;

  if (th == nullptr) {
    if (out != nullptr) *out = plan;
    return;
  }
  plan.entered = 1;
  plan.this_addr = static_cast<uint32_t>(reinterpret_cast<uintptr_t>(th));
  plan.node = load_u32(th);          /* 0x00414a84: node = [esi] */

  if (plan.node == 0u) {
    /* v42 fold: the machine would fault on [node+8]. */
    if (out != nullptr) *out = plan;
    return;
  }

  /* 0x00414a86/89: right = node->+8; _Isnil(right) == 0 -> PATH 0. */
  const uint8_t* np = guest_ptr(plan.node);
  const uint32_t right = load_u32(np + 0x8u);
  const int right_isnil = load_u8(guest_ptr(right) + 0xdu) != 0u ? 1 : 0;

  if (right_isnil == 0) {
    /* 0x00414ab1..cc: descend left chain while NOT nil. */
    uint32_t c = load_u32(guest_ptr(right));
    uint32_t leftmost = right;
    while (load_u8(guest_ptr(c) + 0xdu) == 0u) {
      leftmost = c;
      c = load_u32(guest_ptr(c));
    }
    plan.path = ISAAC_ANM2_TREE_NEXT_PATH_LEFTMOST;
    plan.result_node = leftmost;
    if (out != nullptr) *out = plan;
    return;
  }

  /* 0x00414a8f: parent = node->+4. */
  const uint32_t parent = load_u32(np + 0x4u);
  const int parent_isnil = load_u8(guest_ptr(parent) + 0xdu) != 0u ? 1 : 0;

  if (parent_isnil != 0) {
    /* jne 0x00414aaa: parent IS the nil head -> result = parent. */
    plan.path = ISAAC_ANM2_TREE_NEXT_PATH_PARENT_NIL;
    plan.result_node = parent;
    if (out != nullptr) *out = plan;
    return;
  }

  /* 0x00414a98: node != parent->right -> result = parent. */
  if (plan.node != load_u32(guest_ptr(parent) + 0x8u)) {
    plan.path = ISAAC_ANM2_TREE_NEXT_PATH_PARENT_DIRECT;
    plan.result_node = parent;
    if (out != nullptr) *out = plan;
    return;
  }

  /* 0x00414a9d..a8: climb while parent not-nil AND node == parent's
     right. */
  uint32_t cur = plan.node;
  uint32_t anc = parent;
  for (;;) {
    plan.climb_count++;
    cur = anc;
    anc = load_u32(guest_ptr(anc) + 0x4u);
    if (load_u8(guest_ptr(anc) + 0xdu) != 0u) break;   /* parent nil */
    if (cur != load_u32(guest_ptr(anc) + 0x8u)) break; /* left child */
  }
  plan.path = ISAAC_ANM2_TREE_NEXT_PATH_CLIMB;
  plan.result_node = anc;
  if (out != nullptr) *out = plan;
}

ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_tree_next_plan);

static_assert(sizeof(IsaacAnm2TreeNextPlan) == 32,
              "v76 tree-next plan is 8 x 4 bytes");

/* ============ v82 unit: 0x00415f80 _Tree erase-splice ====================
   Report-only plan over the guest node graph (guest_ptr reads). */

void isaac_anm2_tree_splice_plan(uint32_t container,
                                 uint32_t node,
                                 IsaacAnm2TreeSplicePlan* out) {
  IsaacAnm2TreeSplicePlan plan;
  plan.entered = 0;
  plan.container = 0u;
  plan.node = 0u;
  plan.left_child = 0u;
  plan.parent = 0u;
  plan.node_left_after = 0u;
  plan.path = 0;
  plan.pure_complete = 1;
  plan.host_call_count = 0;

  if (container == 0u || node == 0u) {
    /* v42 fold: the machine would fault on [node] / [[container]]. */
    if (out != nullptr) *out = plan;
    return;
  }
  plan.entered = 1;
  plan.container = container;
  plan.node = node;

  const uint8_t* np = guest_ptr(node);
  plan.left_child = load_u32(np);                 /* 0x00415f87 */
  const uint32_t parent = load_u32(np + 0x4u);    /* 0x00415f9a src */
  plan.parent = parent;

  /* 0x00415f8e..f9: node_left_after = left->right; if that subtree is
     not nil, its parent := node (reported). */
  uint32_t nla = 0u;
  if (plan.left_child != 0u) {
    nla = load_u32(guest_ptr(plan.left_child) + 0x8u);
    if (load_u8(guest_ptr(nla) + 0xdu) == 0u) {
      /* non-nil subtree: machine stores [eax+4] = node */
    }
  }
  plan.node_left_after = nla;

  /* Path selection. */
  int path;
  const uint32_t header = load_u32(guest_ptr(container));
  const uint32_t root = load_u32(guest_ptr(header) + 0x4u);
  if (node == root) {
    path = static_cast<int>(ISAAC_ANM2_TREE_SPLICE_PATH_ROOT);
  } else if (parent != 0u &&
             node == load_u32(guest_ptr(parent) + 0x8u)) {
    path = static_cast<int>(ISAAC_ANM2_TREE_SPLICE_PATH_RIGHT_CHILD);
  } else {
    path = static_cast<int>(ISAAC_ANM2_TREE_SPLICE_PATH_LEFT_CHILD);
  }
  plan.path = path;

  if (out != nullptr) *out = plan;
}

ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_tree_splice_plan);

static_assert(sizeof(IsaacAnm2TreeSplicePlan) == 36,
              "v82 tree-splice plan is 9 x 4 bytes");

/* ============ v83 unit: 0x00415fe0 _Tree erase-splice RIGHT ==============
   Mirror of the v82 left-splice. Report-only plan over the guest node
   graph (guest_ptr reads). */

void isaac_anm2_tree_splice_r_plan(uint32_t container,
                                   uint32_t node,
                                   IsaacAnm2TreeSpliceRPlan* out) {
  IsaacAnm2TreeSpliceRPlan plan;
  plan.entered = 0;
  plan.container = 0u;
  plan.node = 0u;
  plan.right_child = 0u;
  plan.parent = 0u;
  plan.node_right_after = 0u;
  plan.path = 0;
  plan.pure_complete = 1;
  plan.host_call_count = 0;

  if (container == 0u || node == 0u) {
    /* v42 fold: the machine would fault on [node+8] / [[container]]. */
    if (out != nullptr) *out = plan;
    return;
  }
  plan.entered = 1;
  plan.container = container;
  plan.node = node;

  const uint8_t* np = guest_ptr(node);
  plan.right_child = load_u32(np + 0x8u);         /* 0x00415fe7 */
  const uint32_t parent = load_u32(np + 0x4u);
  plan.parent = parent;

  /* 0x00415fea..f7: node_right_after = right->left; if that subtree
     is not nil, its parent := node (reported). */
  uint32_t nra = 0u;
  if (plan.right_child != 0u) {
    nra = load_u32(guest_ptr(plan.right_child));
  }
  plan.node_right_after = nra;

  /* Path selection. */
  int path;
  const uint32_t header = load_u32(guest_ptr(container));
  const uint32_t root = load_u32(guest_ptr(header) + 0x4u);
  if (node == root) {
    path = static_cast<int>(ISAAC_ANM2_TREE_SPLICE_R_PATH_ROOT);
  } else if (parent != 0u &&
             node == load_u32(guest_ptr(parent))) {
    path = static_cast<int>(ISAAC_ANM2_TREE_SPLICE_R_PATH_LEFT_CHILD);
  } else {
    path = static_cast<int>(ISAAC_ANM2_TREE_SPLICE_R_PATH_RIGHT_CHILD);
  }
  plan.path = path;

  if (out != nullptr) *out = plan;
}

ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_tree_splice_r_plan);

static_assert(sizeof(IsaacAnm2TreeSpliceRPlan) == 36,
              "v83 tree-splice-r plan is 9 x 4 bytes");

/* ============ v84-retry: 0x00416440 _Tree lower_bound ====================
   Report-only plan: the caller's out slot is never written. Guest
   reads via guest_ptr. */

void isaac_anm2_tree_lower_bound_plan(uint32_t container,
                                      uint32_t out_slot,
                                      uint32_t key_slot,
                                      IsaacAnm2TreeLowerBoundPlan* out) {
  IsaacAnm2TreeLowerBoundPlan plan;
  plan.entered = 0;
  plan.container = 0u;
  plan.out_slot = 0u;
  plan.key_slot = 0u;
  plan.key = 0u;
  plan.root = 0u;
  plan.iterations = 0;
  plan.y_node = 0u;
  plan.last_flag = 0;
  plan.final_x = 0u;
  plan.root_isnil_early = 0;
  plan.pure_complete = 1;
  plan.host_call_count = 0;

  if (container == 0u) {
    /* v42 fold: the machine would fault on [container]. */
    if (out != nullptr) *out = plan;
    return;
  }
  plan.container = container;
  plan.out_slot = out_slot;
  plan.key_slot = key_slot;

  const uint32_t hdr = load_u32(guest_ptr(container));
  if (hdr == 0u) {
    if (out != nullptr) *out = plan;
    return;
  }
  plan.entered = 1;

  const uint8_t* hp = guest_ptr(hdr);
  plan.root = load_u32(hp + 0x4u);            /* 0x00416448 */

  uint32_t x = plan.root;
  int root_isnil = load_u8(guest_ptr(x) + 0xdu) != 0u ? 1 : 0;
  plan.root_isnil_early = root_isnil;         /* 0x00416457 jne exit */
  int last_flag = 0;
  uint32_t y = 0u;
  uint32_t last_x = x;

  const uint32_t key =
      key_slot != 0u ? load_u32(guest_ptr(key_slot)) : 0u;
  plan.key = key;                             /* 0x00416461: esi = [ecx] */

  while (root_isnil == 0) {
    plan.iterations++;                        /* 0x00416463: [out] := x */
    last_x = x;
    const uint32_t node_key = load_u32(guest_ptr(x) + 0x10u);
    if (node_key >= key) {                    /* 0x00416465 jae */
      y = x;                                  /* 0x00416471: [out+8] := x */
      last_flag = 1;
      x = load_u32(guest_ptr(x));             /* left, 0x0041646a */
    } else {
      last_flag = 0;
      x = load_u32(guest_ptr(x) + 0x8u);      /* right, 0x00416479 */
    }
    root_isnil = load_u8(guest_ptr(x) + 0xdu) != 0u ? 1 : 0;
  }
  plan.y_node = y;
  plan.last_flag = last_flag;
  plan.final_x = last_x;

  if (out != nullptr) *out = plan;
}

ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_tree_lower_bound_plan);

static_assert(sizeof(IsaacAnm2TreeLowerBoundPlan) == 52,
              "v84 tree-lower-bound plan is 13 x 4 bytes");

static_assert(sizeof(IsaacAnm2TreeSpliceRPlan) == 36,
              "v83 tree-splice-r plan is 9 x 4 bytes");

/* Definitions live past the file's closing extern "C" brace; re-open it
   for the v85 exports (anonymous-namespace helpers stay outside). */
extern "C" {
/* ============ v85 unit: XML entity-decode trio + UTF-8 leaf ===============
   See the header block for the full machine contract. Report-only:
   guest stores are REPORTED, never performed. Tables are read through
   guest pointers at caller-supplied base addresses (hash_probe_plan
   precedent); tests seed byte-exact copies of PE tables 0xb1a960/
   0xb1a860/0xb1a760, 0xb1ac60/0xb1ab60/0xb1aa60 and 0xb1ad60. */

void isaac_anm2_xml_utf8_encode_plan(uint8_t* cursor_slot,
                                     uint32_t code_point,
                                     IsaacAnm2XmlUtf8Plan* out) {
  IsaacAnm2XmlUtf8Plan plan;
  plan.entered = 0;
  plan.cursor_slot_addr = 0u;
  plan.out_start = 0u;
  plan.code_point = code_point;
  plan.length = 0u;
  plan.b0 = 0u; plan.b1 = 0u; plan.b2 = 0u; plan.b3 = 0u;
  plan.new_cursor = 0u;
  plan.error_written = 0;
  plan.error_string_va = 0u; /* error VA only lands on the error arm */
  plan.pure_complete = 1;
  plan.host_call_count = 0;

  if (cursor_slot == nullptr) {
    if (out != nullptr) *out = plan;
    return;
  }
  plan.entered = 1;
  plan.cursor_slot_addr = static_cast<uint32_t>(
      reinterpret_cast<uintptr_t>(cursor_slot));
  const uint32_t out_start = load_u32(cursor_slot);   /* 0x00416dcb */
  plan.out_start = out_start;
  const uint32_t cp = code_point;

  /* 0x00416dc3..e5: four encode arms; 0x00416e5e: error arm. */
  if (cp < 0x80u) {
    plan.length = 1u;
    plan.b0 = cp & 0xffu;
  } else if (cp < 0x800u) {
    plan.length = 2u;
    plan.b0 = (0xc0u | (cp >> 6)) & 0xffu;
    plan.b1 = (0x80u | (cp & 0x3fu)) & 0xffu;
  } else if (cp < 0x10000u) {
    plan.length = 3u;
    plan.b0 = (0xe0u | (cp >> 12)) & 0xffu;
    plan.b1 = (0x80u | ((cp >> 6) & 0x3fu)) & 0xffu;
    plan.b2 = (0x80u | (cp & 0x3fu)) & 0xffu;
  } else if (cp < 0x110000u) {
    plan.length = 4u;
    plan.b0 = (0xf0u | (cp >> 18)) & 0xffu;
    plan.b1 = (0x80u | ((cp >> 12) & 0x3fu)) & 0xffu;
    plan.b2 = (0x80u | ((cp >> 6) & 0x3fu)) & 0xffu;
    plan.b3 = (0x80u | (cp & 0x3fu)) & 0xffu;
  } else {
    /* 0x00416e5e: [0xc7de4c] := 0xb1b704; cursor NOT advanced. */
    plan.error_written = 1;
    plan.error_string_va =
        static_cast<uint32_t>(ISAAC_ANM2_XML_UTF8_INVALID_CP_VA);
    plan.new_cursor = out_start;
    if (out != nullptr) *out = plan;
    return;
  }
  plan.new_cursor = out_start + plan.length;          /* 0x00416ded etc */
  if (out != nullptr) *out = plan;
}
ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_xml_utf8_encode_plan);

static_assert(sizeof(IsaacAnm2XmlUtf8Plan) == 56,
              "v85 xml-utf8 plan is 14 x 4 bytes");
}  // extern "C"

namespace {

/* Shared shape of the numeric digit walk (hex + decimal loops):
   hex 0x00416a5b..ac / dec 0x00416a8e..b5 in the site-0 listing.
   First-digit-invalid takes je with acc still 0 (esi pre-advanced). */
inline void xml_decode_digit_walk(const uint8_t* mem_base_unused,
                                  uint32_t esi_in,
                                  uint32_t hex_table,
                                  int hex_mode,
                                  uint32_t* esi_out,
                                  uint32_t* acc_out) {
  (void)mem_base_unused;
  uint32_t esi = esi_in;
  uint32_t v;
  if (hex_mode != 0) {
    v = load_u8(guest_ptr(hex_table) + load_u8(guest_ptr(esi_in + 3u)));
    esi = esi_in + 3u;
  } else {
    v = load_u8(guest_ptr(hex_table) + load_u8(guest_ptr(esi_in + 2u)));
    esi = esi_in + 2u;
  }
  uint32_t acc = 0u;
  if (v == 0xffu) {                     /* je -> encode with edx = 0 */
    *esi_out = esi;
    *acc_out = acc;
    return;
  }
  while (v != 0xffu) {
    esi += 1u;
    if (hex_mode != 0) {
      acc = (acc << 4) + v;             /* shl 4 / add */
    } else {
      acc = ((acc + acc * 4u) << 1) + v;/* lea ecx,[edx+edx*4]; lea edx */
    }
    v = load_u8(guest_ptr(hex_table) + load_u8(guest_ptr(esi)));
  }
  *esi_out = esi;
  *acc_out = acc;
}

/* 0x00416dc0 semantics for the decode trio's inline invocations.
   Returns encoded length, fills b[0..3], or 0 with err set. */
inline uint32_t xml_utf8_encode_bytes(uint32_t cp, uint32_t b[4], int* err) {
  *err = 0;
  if (cp < 0x80u) {
    b[0] = cp & 0xffu;
    return 1u;
  }
  if (cp < 0x800u) {
    b[0] = (0xc0u | (cp >> 6)) & 0xffu;
    b[1] = (0x80u | (cp & 0x3fu)) & 0xffu;
    return 2u;
  }
  if (cp < 0x10000u) {
    b[0] = (0xe0u | (cp >> 12)) & 0xffu;
    b[1] = (0x80u | ((cp >> 6) & 0x3fu)) & 0xffu;
    b[2] = (0x80u | (cp & 0x3fu)) & 0xffu;
    return 3u;
  }
  if (cp < 0x110000u) {
    b[0] = (0xf0u | (cp >> 18)) & 0xffu;
    b[1] = (0x80u | ((cp >> 12) & 0x3fu)) & 0xffu;
    b[2] = (0x80u | ((cp >> 6) & 0x3fu)) & 0xffu;
    b[3] = (0x80u | (cp & 0x3fu)) & 0xffu;
    return 4u;
  }
  *err = 1;
  return 0u;
}

}  // namespace

extern "C" {
void isaac_anm2_xml_decode_text_plan(uint8_t* cursor_slot,
                                     uint32_t skip_table,
                                     uint32_t class_table,
                                     uint32_t hex_table,
                                     IsaacAnm2XmlDecodeTextPlan* out) {
  IsaacAnm2XmlDecodeTextPlan plan;
  plan.entered = 0;
  plan.cursor_slot_addr = 0u;
  plan.scan_in = 0u;
  plan.scan_after_skip = 0u;
  plan.skipped_count = 0u;
  plan.scan_out = 0u;
  plan.decoded_end = 0u;
  plan.out_bytes = 0u;
  plan.verbatim_copies = 0u;
  plan.named_entities = 0u;
  plan.numeric_entities = 0u;
  plan.last_error_string_va = 0u;
  plan.invalid_cp_errors = 0u;
  plan.pure_complete = 1;
  plan.host_call_count = 0;

  if (cursor_slot == nullptr || skip_table == 0u || class_table == 0u ||
      hex_table == 0u) {
    if (out != nullptr) *out = plan;
    return;
  }
  plan.entered = 1;
  plan.cursor_slot_addr = static_cast<uint32_t>(
      reinterpret_cast<uintptr_t>(cursor_slot));

  /* 0x00416929..4c: skip while skip_table[*esi] != 0 (NUL stops it). */
  uint32_t esi = load_u32(cursor_slot);
  plan.scan_in = esi;
  while (load_u8(guest_ptr(skip_table) +
                 load_u8(guest_ptr(esi))) != 0u) {
    esi += 1u;
    plan.skipped_count += 1u;
  }
  plan.scan_after_skip = esi;
  /* 0x0041694e: [edi] := esi (reported via scan_after_skip/scan_out). */

  uint32_t outp = esi;                  /* edx == [ebp-4]: in-place */

  for (;;) {
    const uint32_t bl = load_u8(guest_ptr(esi));
    /* 0x0041695a: exit when class_table[*esi] == 0 (NUL included). */
    if (load_u8(guest_ptr(class_table) + bl) == 0u) break;

    /* 0x00416967..87: '&' dispatch with signed bound check. */
    uint32_t advance = 1u;              /* default copy consumes one */
    uint32_t emit_len = 1u;
    int handled_plain = 1;
    int named = 0;
    if (bl == 0x26u) {
      handled_plain = 0;
      const uint8_t raw = load_u8(guest_ptr(esi + 1u));
      const int32_t sxt =
          raw >= 0x80u ? static_cast<int32_t>(raw) - 0x100
                       : static_cast<int32_t>(raw);
      const uint32_t idx = static_cast<uint32_t>(sxt - 0x23);
      if (idx > static_cast<uint32_t>(ISAAC_ANM2_XML_DECODE_DISPATCH_BOUND)) {
        handled_plain = 1;              /* ja -> default copy of '&' */
      } else {
        advance = 1u;
        emit_len = 1u;
        switch (raw) {
          case 0x23u: {                 /* '#' numeric entity */
            plan.numeric_entities += 1u;
            uint32_t after_digits = esi;
            uint32_t cp = 0u;
            xml_decode_digit_walk(nullptr, esi, hex_table,
                                  load_u8(guest_ptr(esi + 2u)) == 0x78u,
                                  &after_digits, &cp);
            plan.utf8_calls += 1u;
            uint32_t b[4] = {0u, 0u, 0u, 0u};
            int err = 0;
            const uint32_t len =
                xml_utf8_encode_bytes(cp, b, &err);
            if (err != 0) {
              /* 0x00416e5e arm of the callee: no bytes land. */
              plan.invalid_cp_errors += 1u;
              plan.last_error_string_va = static_cast<uint32_t>(
                  ISAAC_ANM2_XML_UTF8_INVALID_CP_VA);
              emit_len = 0u;
            } else {
              emit_len = len;           /* bytes land at outp..outp+len-1 */
            }
            esi = after_digits;
            /* ';' required (0x00416abf..ca): consume or error slot. */
            if (load_u8(guest_ptr(esi)) == 0x3bu) {
              esi += 1u;                /* inc esi past ';' */
            } else {
              plan.semi_errors += 1u;
              plan.last_error_string_va = static_cast<uint32_t>(
                  ISAAC_ANM2_XML_DECODE_EXPECTED_SEMI_VA);
            }
            handled_plain = 2;          /* esi fully advanced in-case */
            break;
          }
          case 0x61u:                   /* 'a' amp / apos */
            if (load_u8(guest_ptr(esi + 2u)) == 0x6du &&
                load_u8(guest_ptr(esi + 3u)) == 0x70u &&
                load_u8(guest_ptr(esi + 4u)) == 0x3bu) {
              named = 1; advance = 5u;  /* &amp; -> '&' */
            } else if (load_u8(guest_ptr(esi + 2u)) == 0x70u &&
                       load_u8(guest_ptr(esi + 3u)) == 0x6fu &&
                       load_u8(guest_ptr(esi + 4u)) == 0x73u &&
                       load_u8(guest_ptr(esi + 5u)) == 0x3bu) {
              named = 1; advance = 6u;  /* &apos; -> '\'' */
            }
            break;
          case 0x67u:                   /* 'g' gt */
            if (load_u8(guest_ptr(esi + 2u)) == 0x74u &&
                load_u8(guest_ptr(esi + 3u)) == 0x3bu) {
              named = 1; advance = 4u;  /* &gt; -> '>' */
            }
            break;
          case 0x6cu:                   /* 'l' lt */
            if (load_u8(guest_ptr(esi + 2u)) == 0x74u &&
                load_u8(guest_ptr(esi + 3u)) == 0x3bu) {
              named = 1; advance = 4u;  /* &lt; -> '<' */
            }
            break;
          case 0x71u:                   /* 'q' quot */
            if (load_u8(guest_ptr(esi + 2u)) == 0x75u &&
                load_u8(guest_ptr(esi + 3u)) == 0x6fu &&
                load_u8(guest_ptr(esi + 4u)) == 0x74u &&
                load_u8(guest_ptr(esi + 5u)) == 0x3bu) {
              named = 1; advance = 6u;  /* &quot; -> '"' */
            }
            break;
          default:
            handled_plain = 1;          /* lookup case 5: copy '&' */
            break;
        }
      }
    }

    if (handled_plain == 1) {
      /* default path 0x00416ad6: al=[esi]; inc esi; *out++=al. */
      plan.verbatim_copies += 1u;
      plan.out_bytes += 1u;
      outp += 1u;
      esi += 1u;
      continue;
    }
    if (handled_plain == 2) {
      /* numeric arm already advanced esi; emit accounted above. */
      plan.out_bytes += emit_len;
      outp += emit_len;
      continue;
    }
    if (named != 0) {
      /* 0x004169a9 etc: mov byte [edx],imm; inc edx; add esi,adv. */
      plan.named_entities += 1u;
      plan.out_bytes += 1u;
      outp += 1u;
      esi += advance;
      continue;
    }
    /* unmatched named-entity key falls back to the default copy */
    plan.verbatim_copies += 1u;
    plan.out_bytes += 1u;
    outp += 1u;
    esi += 1u;
  }

  plan.scan_out = esi;                  /* 0x00416af1: [edi] := esi */
  plan.decoded_end = outp;              /* 0x00416af3: eax = edx */
  if (out != nullptr) *out = plan;
}

ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_xml_decode_text_plan);

static_assert(sizeof(IsaacAnm2XmlDecodeTextPlan) == 68,
              "v85 xml-decode plan is 17 x 4 bytes");

}  // extern "C"
/* ============ v86 unit: 0x00416510 XML arena allocator SPLIT law ========
   See the header block. Report-only; guest stores are REPORTED, never
   performed. The grow arm's allocation call is the HOST edge and is
   described, not resolved. */

extern "C" {
void isaac_anm2_xml_alloc_plan(uint8_t* arena,
                               uint32_t needed,
                               IsaacAnm2XmlAllocPlan* out) {
  IsaacAnm2XmlAllocPlan plan;
  plan.entered = 0;
  plan.arena_addr = 0u;
  plan.needed = needed;
  plan.cur_end = 0u;
  plan.align_pad = 0u;
  plan.aligned_end = 0u;
  plan.req_end = 0u;
  plan.cap = 0u;
  plan.grow = 0;
  plan.grow_blocks = 0u;
  plan.alloc_size = 0u;
  plan.custom_fn = 0u;
  plan.use_custom = 0;
  plan.oom_string_va = 0u;
  plan.pure_complete = 1;
  plan.host_call_count = 0;
  plan.new_end = 0u;
  plan.ret_ptr = 0u;

  if (arena == nullptr) {
    if (out != nullptr) *out = plan;
    return;
  }
  plan.entered = 1;
  plan.arena_addr = static_cast<uint32_t>(
      reinterpret_cast<uintptr_t>(arena));

  /* 0x0041651a..25: pad = (-end)&3; aligned = end+pad; req = aligned+n */
  const uint32_t cur_end = load_u32(arena + 4u);
  const uint32_t align_pad = (0u - cur_end) & 3u;
  const uint32_t aligned_end = cur_end + align_pad;
  const uint32_t req_end = aligned_end + needed;
  plan.cur_end = cur_end;
  plan.align_pad = align_pad;
  plan.aligned_end = aligned_end;
  plan.req_end = req_end;
  plan.cap = load_u32(arena + 8u);

  /* 0x00416528: GROW iff required >u cap (jbe skips the grow arm). */
  const int grow = req_end > plan.cap ? 1 : 0;
  plan.grow = grow;

  if (grow == 0) {
    /* 0x0041658f..94 fast arm: end := required, eax := aligned. */
    plan.pure_complete = 1;
    plan.host_call_count = 0;
    plan.new_end = req_end;
    plan.ret_ptr = aligned_end;
    if (out != nullptr) *out = plan;
    return;
  }

  /* Grow arm 0x41652d..8e: shape only; the alloc call stays host. */
  plan.pure_complete = 0;
  plan.host_call_count = 1;
  plan.grow_blocks =
      needed <= static_cast<uint32_t>(ISAAC_ANM2_XML_ALLOC_GROW_FLOOR)
          ? static_cast<uint32_t>(ISAAC_ANM2_XML_ALLOC_GROW_FLOOR)
          : needed;                       /* cmp/cmovbe @0x416533..37 */
  plan.alloc_size =
      plan.grow_blocks +
      static_cast<uint32_t>(ISAAC_ANM2_XML_ALLOC_HDR_SLACK);
  plan.custom_fn = load_u32(
      arena + static_cast<uint32_t>(ISAAC_ANM2_XML_ALLOC_CUSTOM_FN_OFF));
  plan.use_custom = plan.custom_fn != 0u ? 1 : 0;
  if (plan.use_custom == 0) {
    /* CRT arm rewrites [0xc7de4c]: OOM string iff malloc==0, else the
       old slot value (0x0041655a..68). */
    plan.oom_string_va = static_cast<uint32_t>(
        ISAAC_ANM2_XML_ALLOC_OOM_STRING_VA);
  }
  /* new_end/ret_ptr stay 0: both derive from the unresolved raw block. */
  if (out != nullptr) *out = plan;
}

ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_xml_alloc_plan);

static_assert(sizeof(IsaacAnm2XmlAllocPlan) == 72,
              "v86 xml-alloc plan is 18 x 4 bytes");
}  // extern "C"

/* ============ v87 unit: 0x004165a0 attrs-parser narrow pass =============
   See header block. Report-only; guest stores are REPORTED, never
   performed. Tables via caller-supplied bases (v85/v86 precedent). */

extern "C" {
void isaac_anm2_xml_attr_plan(uint8_t* doc,
                              uint32_t cursor_slot_addr,
                              uint32_t parent_node_addr,
                              uint32_t name_gate_table,
                              uint32_t space_gate_table,
                              IsaacAnm2XmlAttrPlan* out) {
  IsaacAnm2XmlAttrPlan plan;
  plan.entered = 0;
  plan.doc_addr = 0u;
  plan.cursor_slot_addr = cursor_slot_addr;
  plan.parent_node_addr = parent_node_addr;
  plan.scan_in = 0u;
  plan.name_end = 0u;
  plan.name_len = 0u;
  plan.node_addr = 0u;
  plan.name_term_addr = 0u;
  plan.parent_first = 0u;
  plan.parent_last_old = 0u;
  plan.link_prev_value = 0u;
  plan.link_next_addr = 0u;
  plan.saw_equals = 0;
  plan.missing_eq_va = 0u;   /* set after the '=' check; gate-fail exits 0 */
  plan.quote_char = 0u;
  plan.decode_site = -1;
  plan.value_start = 0u;
  plan.value_len = 0u;
  plan.value_term_addr = 0u;
  plan.closing_quote_matched = 0;
  plan.bad_value_va = 0u;
  plan.loop_again = 0;
  plan.pure_complete = 0;
  plan.host_call_count = 1;

  if (doc == nullptr || cursor_slot_addr == 0u || parent_node_addr == 0u ||
      name_gate_table == 0u || space_gate_table == 0u) {
    if (out != nullptr) *out = plan;
    return;
  }
  plan.entered = 1;
  plan.doc_addr = static_cast<uint32_t>(
      reinterpret_cast<uintptr_t>(doc));

  /* 0x004165a9..b5: gate on name class else return (loop_again stays 0
     and every scan field stays 0 -- the machine exits immediately). */
  uint32_t esi = load_u32(guest_ptr(cursor_slot_addr));
  if (load_u8(guest_ptr(name_gate_table) +
              load_u8(guest_ptr(esi))) == 0u) {
    plan.entered = 0;                    /* machine ret before anything */
    if (out != nullptr) *out = plan;
    return;
  }
  plan.scan_in = esi;

  /* 0x004165c8..ee: name skip from cur+1. */
  uint32_t ecx = esi + 1u;
  while (load_u8(guest_ptr(name_gate_table) +
                 load_u8(guest_ptr(ecx))) != 0u) {
    ecx += 1u;
  }
  /* 0x004165ee..f0: [slot] := ecx. */
  plan.name_end = ecx;
  plan.name_len = ecx - esi;             /* gate char included */
  plan.name_term_addr = esi + plan.name_len;

  /* 0x00416627..4e: list-link arithmetic (node addr is host-decided). */
  const uint32_t parent_first =
      load_u32(guest_ptr(parent_node_addr) + 0x20u);
  const uint32_t parent_last_old =
      load_u32(guest_ptr(parent_node_addr) + 0x24u);
  plan.parent_first = parent_first;
  plan.parent_last_old = parent_last_old;
  plan.link_prev_value = parent_first != 0u ? parent_last_old : 0u;
  plan.link_next_addr = parent_first != 0u ? parent_last_old + 0x18u : 0u;

  /* 0x004165ee..f0 stores ecx into [slot]; this report-only helper
     never stores, so the following scans reuse the register value. */
  uint32_t cur = ecx;

  /* 0x00416655..71: skip spaces/equals class after the name. */
  while (load_u8(guest_ptr(space_gate_table) +
                 load_u8(guest_ptr(cur))) != 0u) {
    cur += 1u;
  }
  /* 0x00416673..82: require '=' else slot := 0xb1b6dc. */
  plan.saw_equals = load_u8(guest_ptr(cur)) == 0x3du ? 1 : 0;
  plan.missing_eq_va = plan.saw_equals != 0
      ? 0u : static_cast<uint32_t>(ISAAC_ANM2_XML_ATTR_EXPECTED_EQ_VA);
  cur += 1u;                             /* 0x00416687: past '=' */

  /* 0x004166a2..c5: skip spaces, read quote-position byte. */
  while (load_u8(guest_ptr(space_gate_table) +
                 load_u8(guest_ptr(cur))) != 0u) {
    cur += 1u;
  }
  const uint8_t q = load_u8(guest_ptr(cur));
  plan.quote_char = q;

  /* 0x004166c5..23: decode-callee selection.
     ' -> site0 from cur+1 ; otherwise site1 from cur+1 (unquoted ALSO
     drops the first char and pre-loads slot 0xb1b6e8). */
  uint32_t value_start;
  if (q == 0x27u) {
    plan.decode_site = 0;
    value_start = cur + 1u;
  } else {
    plan.decode_site = 1;
    value_start = cur + 1u;
    if (q != 0x22u) {
      plan.bad_value_va = static_cast<uint32_t>(
          ISAAC_ANM2_XML_ATTR_BAD_VALUE_VA);   /* pre-load, may cmove */
    }
  }
  plan.value_start = value_start;

  /* Decode semantics inline (both callees translated in v85). The
     decode end depends on table contents; recompute with the same
     rules the landed decode law uses: scan until the site terminator
     (site0 ', site1 ") handling entities. For the plan we report the
     SCAN end (class-table walk) which is what the callee returns in
     eax for entity-free tails, and the full decode length otherwise
     matches the landed decode law's decoded_end - start. */
  {
    const uint32_t cls = q == 0x27u ? 0xb1ac60u : 0xb1ab60u;
    uint32_t p = value_start;
    while (load_u8(guest_ptr(cls) + load_u8(guest_ptr(p))) != 0u) {
      p += 1u;
    }
    plan.value_len = p - value_start;
  }
  plan.value_term_addr = value_start + plan.value_len;

  /* 0x004166f3..704: closing-quote check against the saved byte. */
  plan.closing_quote_matched =
      load_u8(guest_ptr(value_start + plan.value_len)) == q ? 1 : 0;
  if (plan.closing_quote_matched == 0 &&
      plan.bad_value_va == 0u && q != 0x22u) {
    plan.bad_value_va = static_cast<uint32_t>(
        ISAAC_ANM2_XML_ATTR_BAD_VALUE_VA);
  }

  /* 0x00416730..5d: trailing space skip then gate for next attr. */
  uint32_t tail = value_start + plan.value_len;
  if (plan.closing_quote_matched != 0) {
    tail += 1u;                           /* consume the quote */
  }
  while (load_u8(guest_ptr(space_gate_table) +
                 load_u8(guest_ptr(tail))) != 0u) {
    tail += 1u;
  }
  plan.loop_again = load_u8(guest_ptr(name_gate_table) +
                            load_u8(guest_ptr(tail))) != 0u ? 1 : 0;

  if (out != nullptr) *out = plan;
}

ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_xml_attr_plan);

static_assert(sizeof(IsaacAnm2XmlAttrPlan) == 100,
              "v87 xml-attr plan is 25 x 4 bytes");
extern "C" {
/* ============ v88 unit: accessor bulk band ==============================
   Trivial pure loads; the pinned site tables carry the machine identity
   (which offsets the original template instantiated at which VAs). */

uint32_t isaac_anm2_u32_field_get(uint8_t* th, uint32_t off) {
  if (th == nullptr) return 0u;
  return load_u32(th + off);          /* mov eax,[ecx+off]; ret */
}

ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_u32_field_get);

uint32_t isaac_anm2_f32_field_get_bits(uint8_t* th, uint32_t off) {
  if (th == nullptr) return 0u;
  /* fld dword [ecx+off]; ret -- value returned in st(0); we report the
     raw 32-bit memory image (no rounding ever touches it). */
  return load_u32(th + off);
}

ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_f32_field_get_bits);

void isaac_anm2_pair_field_get_plan(uint8_t* th, uint32_t off,
                                    IsaacAnm2AccPairGetPlan* out) {
  IsaacAnm2AccPairGetPlan plan;
  plan.entered = 0;
  plan.this_addr = 0u;
  plan.off = off;
  plan.lo = 0u;
  plan.hi = 0u;
  plan.pure_complete = 1;
  plan.host_call_count = 0;

  if (th == nullptr) {
    if (out != nullptr) *out = plan;
    return;
  }
  plan.entered = 1;
  plan.this_addr = static_cast<uint32_t>(
      reinterpret_cast<uintptr_t>(th));
  plan.lo = load_u32(th + off);       /* 0x00417296/9c etc */
  plan.hi = load_u32(th + off + 4u);  /* 0x0041729c/a2 */
  /* The machine stores lo/hi into the caller's buffer; REPORTED here. */
  if (out != nullptr) *out = plan;
}

ISAAC_ANM2_NO_NARROW_PARAMS(isaac_anm2_pair_field_get_plan);

static_assert(sizeof(IsaacAnm2AccPairGetPlan) == 28,
              "v88 pair-get plan is 7 x 4 bytes");
}  // extern "C"

}  // extern "C"
