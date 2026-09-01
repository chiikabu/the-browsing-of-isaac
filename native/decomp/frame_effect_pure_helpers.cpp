#include "frame_effect_pure_helpers.h"

#include <stddef.h>

/* Pure islands from FrameEffect_6fd7c0 (VA 0x006fd7c0). Control flow and
   immediates recovered from PE bytes at raw 0x2fcbc0 (image base 0x400000)
   and the hash-bound decompile; not derived from a mechanical decompiler dump
   into tracked source. */

extern "C" int32_t isaac_frame_effect_6fd7c0_args_valid(int32_t room_index,
                                                        uint32_t anim,
                                                        int32_t dimension) {
  /* lea eax,[ebx+0x14]; cmp eax,0xbc; ja invalid */
  const uint32_t room_biased = (uint32_t)(room_index + 0x14);
  if (room_biased > 0xbcu) {
    return 0;
  }
  /* cmp edi,0x16; ja invalid — unsigned */
  if (anim > 0x16u) {
    return 0;
  }
  /* cmp esi,3; jl ok — signed dimension must be < 3 */
  if (dimension >= 3) {
    return 0;
  }
  return 1;
}

extern "C" int32_t isaac_frame_effect_6fd7c0_mode4_sfx_early(
    int32_t timed_transition_cleanup_mode) {
  return timed_transition_cleanup_mode == 4 ? 1 : 0;
}

extern "C" void isaac_frame_effect_6fd7c0_force_dim_room_neg2(
    int32_t room_index, int32_t* dimension) {
  if (dimension == nullptr) {
    return;
  }
  if (room_index == -2) {
    *dimension = 0;
  }
}

extern "C" void isaac_frame_effect_6fd7c0_greed_rewrite_neg2_anim3(
    int32_t* room_index, uint32_t* anim) {
  if (room_index == nullptr || anim == nullptr) {
    return;
  }
  /* lea ebx,[edi-0xe]; lea edi,[ebx+5] with edi==0xc → room=-2, anim=3 */
  *room_index = -2;
  *anim = 3u;
}

extern "C" int32_t isaac_frame_effect_6fd7c0_needs_705ee0_null_player(
    uint32_t anim,
    int32_t room_indices_equal,
    int32_t room_byte1_nonzero) {
  if (anim == 3u || anim == 0x10u) {
    return 1;
  }
  if (room_indices_equal != 0 && room_byte1_nonzero != 0 && anim != 0xcu) {
    return 1;
  }
  return 0;
}

extern "C" int32_t isaac_frame_effect_6fd7c0_blue_room_eligible(
    uint32_t anim,
    int32_t dimension,
    int32_t room_transition_mode_1830c) {
  if (anim != 0u) {
    return 0;
  }
  if (dimension < 0 || dimension == room_transition_mode_1830c) {
    return 1;
  }
  return 0;
}

extern "C" void isaac_frame_effect_6fd7c0_apply_blue_room_index(
    int32_t* room_index) {
  if (room_index == nullptr) {
    return;
  }
  *room_index = -0x10;
}

extern "C" void isaac_frame_effect_6fd7c0_player_timer_floor_3c(
    int32_t* player_field_13bc) {
  if (player_field_13bc == nullptr) {
    return;
  }
  /* mov ecx,0x3c; cmp eax,ecx; cmovl eax,ecx */
  if (*player_field_13bc < 0x3c) {
    *player_field_13bc = 0x3c;
  }
}

extern "C" void isaac_frame_effect_6fd7c0_apply_terminals(
    int32_t* counter_265c0,
    int32_t dual_gate_nonzero,
    uint8_t* byte_67744) {
  if (counter_265c0 != nullptr && dual_gate_nonzero != 0) {
    *counter_265c0 = 0;
  }
  if (byte_67744 != nullptr) {
    *byte_67744 = 0;
  }
}

/* ---- ABI v2 peels (PE 0x006fd7c0…0x006fdbfd) ---- */

static_assert(offsetof(IsaacFrameEffect6fd7c0EntryPlan, fail_kind) == 0,
              "6fd7c0 entry plan fail_kind");
static_assert(offsetof(IsaacFrameEffect6fd7c0EntryPlan, host_fatal) == 4,
              "6fd7c0 entry plan host_fatal");
static_assert(offsetof(IsaacFrameEffect6fd7c0EntryPlan, fatal_string_va) == 8,
              "6fd7c0 entry plan fatal_string_va");
static_assert(offsetof(IsaacFrameEffect6fd7c0EntryPlan, mode4_sfx_early) == 12,
              "6fd7c0 entry plan mode4_sfx_early");
static_assert(offsetof(IsaacFrameEffect6fd7c0EntryPlan, host_956780) == 16,
              "6fd7c0 entry plan host_956780");
static_assert(offsetof(IsaacFrameEffect6fd7c0EntryPlan, host_sfx_play) == 20,
              "6fd7c0 entry plan host_sfx_play");
static_assert(offsetof(IsaacFrameEffect6fd7c0EntryPlan, sfx_id_seed) == 24,
              "6fd7c0 entry plan sfx_id_seed");
static_assert(offsetof(IsaacFrameEffect6fd7c0EntryPlan, host_id_remap) == 28,
              "6fd7c0 entry plan host_id_remap");
static_assert(offsetof(IsaacFrameEffect6fd7c0EntryPlan, host_is_alt_path) == 32,
              "6fd7c0 entry plan host_is_alt_path");
static_assert(offsetof(IsaacFrameEffect6fd7c0EntryPlan, reaches_body) == 36,
              "6fd7c0 entry plan reaches_body");
static_assert(offsetof(IsaacFrameEffect6fd7c0EntryPlan, pure_cf_ok) == 40,
              "6fd7c0 entry plan pure_cf_ok");
static_assert(sizeof(IsaacFrameEffect6fd7c0EntryPlan) == 44,
              "6fd7c0 entry plan size");

static_assert(offsetof(IsaacFrameEffect6fd7c0ShellPlan, force_dim_zero) == 0,
              "6fd7c0 shell plan force_dim_zero");
static_assert(offsetof(IsaacFrameEffect6fd7c0ShellPlan, effective_dim) == 4,
              "6fd7c0 shell plan effective_dim");
static_assert(offsetof(IsaacFrameEffect6fd7c0ShellPlan, host_705ee0) == 8,
              "6fd7c0 shell plan host_705ee0");
static_assert(offsetof(IsaacFrameEffect6fd7c0ShellPlan, blue_room_eligible) == 12,
              "6fd7c0 shell plan blue_room_eligible");
static_assert(offsetof(IsaacFrameEffect6fd7c0ShellPlan, host_try_blue_room) == 16,
              "6fd7c0 shell plan host_try_blue_room");
static_assert(offsetof(IsaacFrameEffect6fd7c0ShellPlan, host_engine) == 20,
              "6fd7c0 shell plan host_engine");
static_assert(offsetof(IsaacFrameEffect6fd7c0ShellPlan, apply_terminals) == 24,
              "6fd7c0 shell plan apply_terminals");
static_assert(offsetof(IsaacFrameEffect6fd7c0ShellPlan, pure_cf_ok) == 28,
              "6fd7c0 shell plan pure_cf_ok");
static_assert(sizeof(IsaacFrameEffect6fd7c0ShellPlan) == 32,
              "6fd7c0 shell plan size");

extern "C" int32_t isaac_frame_effect_6fd7c0_validate_fail_kind(
    int32_t room_index, uint32_t anim, int32_t dimension) {
  /* PE 0x006fd7f3: lea eax,[ebx+0x14]; cmp eax,0xbc; ja  → room fatal. */
  if ((uint32_t)(room_index + ISAAC_FRAME_EFFECT_ROOM_BIAS) >
      (uint32_t)ISAAC_FRAME_EFFECT_ROOM_MAX_BIASED) {
    return ISAAC_FRAME_EFFECT_VALIDATE_FAIL_ROOM;
  }
  /* PE 0x006fd801: cmp edi,0x16; ja → anim fatal. */
  if (anim > (uint32_t)ISAAC_FRAME_EFFECT_ANIM_MAX) {
    return ISAAC_FRAME_EFFECT_VALIDATE_FAIL_ANIM;
  }
  /* PE 0x006fd80d: cmp esi,3; jl ok — signed. */
  if (dimension >= ISAAC_FRAME_EFFECT_DIM_LIMIT) {
    return ISAAC_FRAME_EFFECT_VALIDATE_FAIL_DIM;
  }
  return ISAAC_FRAME_EFFECT_VALIDATE_OK;
}

extern "C" uint32_t isaac_frame_effect_6fd7c0_fatal_string_va(
    int32_t fail_kind) {
  switch (fail_kind) {
    case ISAAC_FRAME_EFFECT_VALIDATE_FAIL_ROOM:
      return (uint32_t)ISAAC_FRAME_EFFECT_FATAL_ROOM_STR_VA;
    case ISAAC_FRAME_EFFECT_VALIDATE_FAIL_ANIM:
      return (uint32_t)ISAAC_FRAME_EFFECT_FATAL_ANIM_STR_VA;
    case ISAAC_FRAME_EFFECT_VALIDATE_FAIL_DIM:
      return (uint32_t)ISAAC_FRAME_EFFECT_FATAL_DIM_STR_VA;
    default:
      return 0u;
  }
}

extern "C" int32_t isaac_frame_effect_6fd7c0_fatal_level(void) {
  return ISAAC_FRAME_EFFECT_FATAL_LEVEL;
}

extern "C" int32_t isaac_frame_effect_6fd7c0_mode4_sfx_seed(void) {
  /* PE 0x006fd825: mov dword [ebp+0x14], 0xbb — pre-call seed only. */
  return ISAAC_FRAME_EFFECT_SFX_SEED_MODE4;
}

extern "C" int32_t isaac_frame_effect_6fd7c0_special_sfx_seed(void) {
  /* PE 0x006fd8e4: mov dword [ebp+0x14], 0xd7 — pre-call seed only. */
  return ISAAC_FRAME_EFFECT_SFX_SEED_SPECIAL;
}

extern "C" int32_t isaac_frame_effect_6fd7c0_sfx_rare_hit(
    uint32_t mixed_counter) {
  /* PE 0x00956859…0x0095686c: divide by 20, rebuild, subtract, jne skip. */
  return ((mixed_counter % (uint32_t)ISAAC_FRAME_EFFECT_SFX_RARE_MODULUS) == 0u)
             ? 1
             : 0;
}

extern "C" int32_t isaac_frame_effect_6fd7c0_sfx_play_id(
    int32_t seed_id, int32_t remap_gate_open, int32_t rare_hit) {
  /* 0x00956780 never reads the incoming value; a closed gate simply returns
     and the shell re-reads its own seed at 0x006fd85e. */
  if (remap_gate_open == 0) {
    return seed_id;
  }
  if (rare_hit != 0) {
    return ISAAC_FRAME_EFFECT_SFX_REMAP_RARE;
  }
  return ISAAC_FRAME_EFFECT_SFX_REMAP_COMMON;
}

extern "C" int32_t isaac_frame_effect_6fd7c0_alt_path_probe_needed(
    uint32_t anim, int32_t game_field0) {
  /* PE 0x006fd87a: cmp edi,0xc; jne skip; 0x006fd87f: cmp [edx],1; jne skip. */
  if (anim != (uint32_t)ISAAC_FRAME_EFFECT_ANIM_SPECIAL) {
    return 0;
  }
  return (game_field0 == 1) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_6fd7c0_anim0xc_special_gate(
    uint32_t anim,
    int32_t game_field0,
    int32_t is_alt_path,
    int32_t room_indices_equal,
    int32_t room_byte1_nonzero) {
  if (isaac_frame_effect_6fd7c0_alt_path_probe_needed(anim, game_field0) == 0) {
    return 0;
  }
  /* PE 0x006fd889: test al,al; jne skip (alt path → no special). */
  if (is_alt_path != 0) {
    return 0;
  }
  /* PE 0x006fd88d / 0x006fd89b: index equality then Room+1 nonzero. */
  if (room_indices_equal == 0 || room_byte1_nonzero == 0) {
    return 0;
  }
  return 1;
}

extern "C" int32_t isaac_frame_effect_6fd7c0_greed_room_rewrite(uint32_t anim) {
  /* PE 0x006fd8b9: lea ebx,[edi-0xe] — 32-bit wrap. */
  return (int32_t)(uint32_t)(anim + (uint32_t)ISAAC_FRAME_EFFECT_GREED_ROOM_DELTA);
}

extern "C" int32_t isaac_frame_effect_6fd7c0_greed_anim_rewrite(uint32_t anim) {
  /* PE 0x006fd8bc: lea edi,[ebx+5] on the rewritten room. */
  const uint32_t room =
      (uint32_t)isaac_frame_effect_6fd7c0_greed_room_rewrite(anim);
  return (int32_t)(uint32_t)(room + (uint32_t)ISAAC_FRAME_EFFECT_GREED_ANIM_DELTA);
}

extern "C" int32_t isaac_frame_effect_6fd7c0_player_present(uint32_t player) {
  /* PE 0x006fd8fa: cmp dword [ebp+0x14],0; je null-player shell. */
  return (player != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_6fd7c0_player_anim_gate(uint32_t anim) {
  /* PE 0x006fd904 / 0x006fd909: anim 3 or 0xc enter the player body. */
  if (anim == 3u) {
    return 1;
  }
  return (anim == (uint32_t)ISAAC_FRAME_EFFECT_ANIM_SPECIAL) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_6fd7c0_player_needs_425ac0(
    int32_t room_type, int32_t room_desc_flag_44) {
  /* PE 0x006fdae0 / 0x006fdaf0: types 0xb and 0x11 consult desc[0x44] bit 0. */
  if (room_type == 0xb || room_type == 0x11) {
    return ((room_desc_flag_44 & 1) == 0) ? 1 : 0;
  }
  /* PE 0x006fdb00 / 0x006fdb05: types 0xa and 3 go straight to 0x425ac0. */
  if (room_type == 0xa || room_type == 3) {
    return 1;
  }
  return 0;
}

extern "C" float isaac_frame_effect_6fd7c0_camera_limit(
    float room_field_20, float player_field_370) {
  /* PE 0x006fd973…0x006fd984, applied in machine order as f32:
       xmm0 = room[0x20]; xmm0 -= 30.0f; xmm0 -= player[0x370]; xmm0 -= 20.0f */
  float acc = room_field_20;
  acc = acc - 30.0f;
  acc = acc - player_field_370;
  acc = acc - 20.0f;
  return acc;
}

extern "C" int32_t isaac_frame_effect_6fd7c0_camera_probe_continue(
    float probe, float limit) {
  /* PE 0x006fd98c: comiss xmm1,xmm0; jae skip. Unordered sets CF so jae is
     not taken — NaN continues into the capsule block. */
  if (probe != probe || limit != limit) {
    return 1;
  }
  return (probe >= limit) ? 0 : 1;
}

extern "C" float isaac_frame_effect_6fd7c0_camera_bias(float player_field_370) {
  /* PE 0x006fd995: addss xmm2, [0x00baa904] (40.0f). */
  return player_field_370 + 40.0f;
}

extern "C" int32_t isaac_frame_effect_6fd7c0_blue_room_apply_cmov(
    int32_t room_index, int32_t probe_result) {
  /* PE 0x006fdb7f: mov ecx,0xfffffff0; cmovne ebx,ecx. */
  return (probe_result != 0) ? ISAAC_FRAME_EFFECT_BLUE_ROOM_INDEX : room_index;
}

extern "C" uint32_t isaac_frame_effect_6fd7c0_engine_args(int32_t* out_args,
                                                          uint32_t len,
                                                          int32_t room_index,
                                                          int32_t arg2,
                                                          uint32_t anim,
                                                          uint32_t player,
                                                          int32_t dimension) {
  const int32_t args[ISAAC_FRAME_EFFECT_ENGINE_ARG_COUNT] = {
      room_index, arg2, (int32_t)anim, (int32_t)player, dimension};
  if (out_args != nullptr) {
    uint32_t n = len;
    if (n > (uint32_t)ISAAC_FRAME_EFFECT_ENGINE_ARG_COUNT) {
      n = (uint32_t)ISAAC_FRAME_EFFECT_ENGINE_ARG_COUNT;
    }
    for (uint32_t i = 0u; i < n; ++i) {
      out_args[i] = args[i];
    }
  }
  return (uint32_t)ISAAC_FRAME_EFFECT_ENGINE_ARG_COUNT;
}

extern "C" int32_t isaac_frame_effect_6fd7c0_engine_this_off(void) {
  return ISAAC_FRAME_EFFECT_ENGINE_THIS_OFF;
}

extern "C" void isaac_frame_effect_6fd7c0_entry_plan(
    IsaacFrameEffect6fd7c0EntryPlan* out,
    int32_t room_index,
    uint32_t anim,
    int32_t dimension,
    int32_t timed_transition_cleanup_mode,
    int32_t game_field0) {
  if (out == nullptr) {
    return;
  }
  const int32_t kind =
      isaac_frame_effect_6fd7c0_validate_fail_kind(room_index, anim, dimension);
  const int32_t fatal = (kind != ISAAC_FRAME_EFFECT_VALIDATE_OK) ? 1 : 0;
  const int32_t mode4 =
      (fatal == 0)
          ? isaac_frame_effect_6fd7c0_mode4_sfx_early(
                timed_transition_cleanup_mode)
          : 0;
  out->fail_kind = kind;
  out->host_fatal = fatal;
  out->fatal_string_va = isaac_frame_effect_6fd7c0_fatal_string_va(kind);
  out->mode4_sfx_early = mode4;
  out->host_956780 = mode4;
  out->host_sfx_play = mode4;
  out->sfx_id_seed =
      (mode4 != 0) ? isaac_frame_effect_6fd7c0_mode4_sfx_seed() : 0;
  out->host_id_remap = mode4; /* 0x00956780 overwrites the slot before Play */
  out->host_is_alt_path =
      (fatal == 0 && mode4 == 0)
          ? isaac_frame_effect_6fd7c0_alt_path_probe_needed(anim, game_field0)
          : 0;
  out->reaches_body = (fatal == 0 && mode4 == 0) ? 1 : 0;
  out->pure_cf_ok = 1;
}

extern "C" void isaac_frame_effect_6fd7c0_shell_plan(
    IsaacFrameEffect6fd7c0ShellPlan* out,
    int32_t room_index,
    uint32_t anim,
    int32_t dimension,
    int32_t room_indices_equal,
    int32_t room_byte1_nonzero,
    int32_t room_transition_mode_1830c) {
  if (out == nullptr) {
    return;
  }
  int32_t dim = dimension;
  isaac_frame_effect_6fd7c0_force_dim_room_neg2(room_index, &dim);
  const int32_t forced = (room_index == -2) ? 1 : 0;
  const int32_t blue = isaac_frame_effect_6fd7c0_blue_room_eligible(
      anim, dim, room_transition_mode_1830c);
  out->force_dim_zero = forced;
  out->effective_dim = dim;
  out->host_705ee0 = isaac_frame_effect_6fd7c0_needs_705ee0_null_player(
      anim, room_indices_equal, room_byte1_nonzero);
  out->blue_room_eligible = blue;
  out->host_try_blue_room = blue;
  out->host_engine = 1;
  out->apply_terminals = 1;
  out->pure_cf_ok = 1;
}

/* ---- FUN_006fdc10 nested stage host (ABI v3) ---- */

static_assert(offsetof(IsaacFrameEffect6fdc10Plan, kind_valid) == 0, "6fdc10 kind_valid");
static_assert(offsetof(IsaacFrameEffect6fdc10Plan, host_fatal) == 4, "6fdc10 host_fatal");
static_assert(offsetof(IsaacFrameEffect6fdc10Plan, fatal_string_va) == 8, "6fdc10 fatal_string_va");
static_assert(offsetof(IsaacFrameEffect6fdc10Plan, stage_block) == 12, "6fdc10 stage_block");
static_assert(offsetof(IsaacFrameEffect6fdc10Plan, stage_mode) == 16, "6fdc10 stage_mode");
static_assert(offsetof(IsaacFrameEffect6fdc10Plan, host_705ee0) == 20, "6fdc10 host_705ee0");
static_assert(offsetof(IsaacFrameEffect6fdc10Plan, host_log) == 24, "6fdc10 host_log");
static_assert(offsetof(IsaacFrameEffect6fdc10Plan, pure_cf_ok) == 28, "6fdc10 pure_cf_ok");
static_assert(offsetof(IsaacFrameEffect6fdc10Plan, pure_complete) == 32, "6fdc10 pure_complete");
static_assert(sizeof(IsaacFrameEffect6fdc10Plan) == 36, "6fdc10 plan size");

extern "C" int32_t isaac_frame_effect_6fdc10_kind_valid(uint32_t kind) {
  /* PE 0x006fdc40: cmp esi,6; ja fatal — unsigned. */
  return (kind <= (uint32_t)ISAAC_FRAME_EFFECT_6FDC10_KIND_MAX) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_6fdc10_stage_block_gate(
    uint32_t this_count_26630,
    uint32_t global_count_26630,
    int32_t global_flag_26638) {
  /* PE 0x006fdc49 / 0x006fdc5c: cmp dword ...,0; jbe — unsigned <= 0 is == 0. */
  if (this_count_26630 == 0u || global_count_26630 == 0u) {
    return 0;
  }
  /* PE 0x006fdc69: cmp byte [edx+0x26638],0; jne skip — LOW BYTE only. */
  return ((global_flag_26638 & 0xff) == 0) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_6fdc10_stage_mode(uint32_t mp_begin,
                                                         uint32_t mp_end) {
  /* PE 0x006fdc96: cmp ecx,eax; cmovne edi,[ebp-0x30] (which holds 2). */
  return (mp_begin != mp_end) ? ISAAC_FRAME_EFFECT_6FDC10_MODE_OPEN : 0;
}

extern "C" int32_t isaac_frame_effect_6fdc10_string_needs_free(
    uint32_t capacity) {
  /* PE 0x006fdcfc: cmp edx,0x10; jb skip — unsigned. */
  return (capacity >= (uint32_t)ISAAC_FRAME_EFFECT_6FDC10_SSO_BYTES) ? 1 : 0;
}

extern "C" void isaac_frame_effect_6fdc10_string_reset(
    uint32_t* size_field, uint32_t* capacity_field, uint8_t* inline_buffer) {
  if (size_field != nullptr) {
    *size_field = 0u; /* PE 0x006fdd2f */
  }
  if (capacity_field != nullptr) {
    *capacity_field = (uint32_t)ISAAC_FRAME_EFFECT_6FDC10_SSO_CAPACITY; /* 0x006fdd36 */
  }
  if (inline_buffer != nullptr) {
    inline_buffer[0] = 0u; /* PE 0x006fdd3d */
  }
}

extern "C" int32_t isaac_frame_effect_6fdc10_flag_arg_zero(uint32_t flag_arg) {
  /* PE 0x006fdd92: cmp byte [ebp+8], al with al == 0. */
  return ((flag_arg & 0xffu) == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_6fdc10_flag_bit(uint32_t field_2654c) {
  /* PE 0x006fdd8c: and ecx,0x10000. */
  return ((field_2654c & (uint32_t)ISAAC_FRAME_EFFECT_6FDC10_FLAG_BIT) != 0u)
             ? 1
             : 0;
}

extern "C" int32_t isaac_frame_effect_6fdc10_mask_bit(uint32_t field_26550,
                                                       uint32_t field_0c,
                                                       uint32_t probe_a,
                                                       uint32_t probe_b) {
  /* PE 0x006fddbd…0x006fddd8: or / or / not / and / test al,2. */
  const uint32_t base = field_26550 | field_0c;
  const uint32_t combined = (probe_a | base) & (uint32_t)(~probe_b);
  return ((combined & 0xffu) & (uint32_t)ISAAC_FRAME_EFFECT_6FDC10_MASK_BIT) != 0u
             ? 1
             : 0;
}

extern "C" int32_t isaac_frame_effect_6fdc10_inline_push_ok(
    uint32_t end_ptr, uint32_t limit_ptr) {
  /* PE 0x006fde1c: cmp ecx,[edx+0x48]; je slow path. */
  return (end_ptr != limit_ptr) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_6fdc10_push_stride(void) {
  return ISAAC_FRAME_EFFECT_6FDC10_PUSH_STRIDE;
}

extern "C" int32_t isaac_frame_effect_6fdc10_partner_blocks(
    uint32_t partner_ptr,
    int32_t partner_id,
    int32_t own_id,
    uint32_t player_ptr) {
  /* PE 0x006fde6a: test eax,eax; je continue. */
  if (partner_ptr == 0u) {
    return 0;
  }
  /* PE 0x006fde74: cmp edx,-1; je continue. */
  if (partner_id == -1) {
    return 0;
  }
  /* PE 0x006fde7f: cmp edx,[ecx+0x161c]; jge continue — SIGNED. */
  if (partner_id >= own_id) {
    return 0;
  }
  /* PE 0x006fde81: cmp eax,ecx; jne skip-body. */
  return (partner_ptr != player_ptr) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_6fdc10_vector_count(uint32_t begin,
                                                           uint32_t end) {
  /* PE: sub eax,ecx; sar eax,2 — signed arithmetic shift. */
  return (int32_t)((int32_t)(uint32_t)(end - begin) >> 2);
}

extern "C" uint32_t isaac_frame_effect_6fdc10_slot_addr_clamped(
    uint32_t begin, uint32_t count, uint32_t index) {
  /* PE 0x006fe12b: cmp edi,ecx; jae skip the lea — the base pointer survives,
     so an out-of-range index addresses element 0. Original defect, preserved. */
  if (index < count) {
    return (uint32_t)(begin + index * 4u);
  }
  return begin;
}

extern "C" int32_t isaac_frame_effect_6fdc10_registry_span(uint32_t begin,
                                                            uint32_t end) {
  /* PE 0x006fe193: sub eax,edx; and eax,0xfffffffc. */
  return (int32_t)(uint32_t)((end - begin) & 0xfffffffcu);
}

extern "C" int32_t isaac_frame_effect_6fdc10_registry_has_slot(int32_t span) {
  /* PE 0x006fe198: cmp eax,0x1d4; jg — SIGNED. */
  return (span > ISAAC_FRAME_EFFECT_6FDC10_REGISTRY_SLOT) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_6fdc10_stage_index_gate(
    int32_t stage, uint32_t field_2654c) {
  /* PE 0x006fe051: cmp esi,1; jl skip — signed. */
  if (stage < ISAAC_FRAME_EFFECT_6FDC10_STAGE_MIN) {
    return 0;
  }
  /* PE 0x006fe056: cmp esi,6; jg skip — signed. */
  if (stage > ISAAC_FRAME_EFFECT_6FDC10_STAGE_MAX) {
    return 0;
  }
  return isaac_frame_effect_6fdc10_flag_bit(field_2654c);
}

extern "C" int32_t isaac_frame_effect_6fdc10_stage_bump(int32_t stage,
                                                         int32_t field_4) {
  /* PE 0x006fe070: cmp eax,4; je inc. 0x006fe075: cmp eax,5; jne skip. */
  if (field_4 == 4 || field_4 == 5) {
    return (int32_t)(uint32_t)((uint32_t)stage + 1u);
  }
  return stage;
}

extern "C" int32_t isaac_frame_effect_6fdc10_stage_sets_timer(
    int32_t bumped_stage) {
  /* PE 0x006fe07b: cmp esi,1; je skip the store. */
  return (bumped_stage != 1) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_6fdc10_timer_value(void) {
  return ISAAC_FRAME_EFFECT_6FDC10_TIMER_VALUE;
}

extern "C" int32_t isaac_frame_effect_6fdc10_kind_needs_705ee0(
    uint32_t kind) {
  /* PE 0x006fdd5c: cmp esi,5; je skip — the 0x705ee0(-1) call is skipped
     only for kind 5, and only non-fatal kinds (<= 6) reach the test. */
  return (kind <= (uint32_t)ISAAC_FRAME_EFFECT_6FDC10_KIND_MAX && kind != 5u)
             ? 1
             : 0;
}

extern "C" uint32_t isaac_frame_effect_6fdc10_stage_record_field_off(
    uint32_t mode) {
  /* PE 0x006fdc9f: jne 0x6fdcb5 (mode != 0 consults +0x240); the fallthrough
     (mode == 0) consults +0x238 at 0x006fdca1. */
  return (mode == 0u) ? (uint32_t)ISAAC_FRAME_EFFECT_6FDC10_STAGE_KEY_EMPTY_FIELD
                      : (uint32_t)ISAAC_FRAME_EFFECT_6FDC10_STAGE_KEY_OPEN_FIELD;
}

extern "C" int32_t isaac_frame_effect_6fdc10_stage_record_needs_key(
    uint32_t mode, int32_t has_empty_field, int32_t has_open_field) {
  /* PE 0x006fdca1: cmp [esi+0x238],0; je 0x6fdcc2 (mode==0, empty).
     PE 0x006fdcb5: cmp [esi+0x240],0; jne 0x6fdd43 (mode!=0, non-empty);
     falling through to 0x6fdcc2 means the open field is empty. */
  if (mode == 0u) {
    return (has_empty_field == 0) ? 1 : 0;
  }
  return (has_open_field == 0) ? 1 : 0;
}

extern "C" uint32_t isaac_frame_effect_6fdc10_registry_slot_addr(
    uint32_t begin, int32_t span) {
  /* PE 0x006fe198: cmp eax,0x1d4; jg 0x6fe1a3; xor edi,edi; jmp 0x6fe1a9;
     else edi = [edi+0x1d4]. Consumes registry_has_slot by reference; the
     load of [begin+0x1d4] is the caller's. */
  if (isaac_frame_effect_6fdc10_registry_has_slot(span) != 0) {
    return (uint32_t)(begin + (uint32_t)ISAAC_FRAME_EFFECT_6FDC10_REGISTRY_SLOT);
  }
  return 0u;
}

extern "C" int32_t isaac_frame_effect_6fdc10_prize_entry_bump_gate(
    uint32_t byte_d, int32_t field_10, uint32_t obj_ptr, uint32_t base_ptr) {
  /* PE 0x006fe1ff: cmp byte [eax+0xd],0; jne skip — LOW BYTE.
     PE 0x006fe209: cmp dword [eax+0x10],0x10; jg skip — SIGNED.
     PE 0x006fe213: cmp eax,[ebx+0x1bbd8]; je skip.
     Only then does 0x006fe21f inc dword [ebx+0x269c4]. */
  if ((byte_d & 0xffu) != 0u) {
    return 0;
  }
  if (field_10 > ISAAC_FRAME_EFFECT_6FDC10_PRIZE_MAX_SIZE) {
    return 0;
  }
  return (obj_ptr == base_ptr) ? 0 : 1;
}

extern "C" uint32_t isaac_frame_effect_6fdc10_string_data_ptr(
    uint32_t obj, uint32_t heap_ptr, uint32_t capacity) {
  /* PE 0x006fdcdc: cmp dword [eax+0x14],0x10; jb 0x6fdce4 — capacity below
     the SSO threshold keeps the object as the inline buffer; at or above it
     the data pointer is the heap pointer in [obj] (caller-resolved). */
  if (capacity >= (uint32_t)ISAAC_FRAME_EFFECT_6FDC10_SSO_BYTES) {
    return heap_ptr;
  }
  return obj;
}

/* ABI v20 — pure decision seams around the still-host leaf calls. */

extern "C" int32_t isaac_frame_effect_6fdc10_player_body_mode_gate(
    int32_t mode_26614) {
  /* PE 0x006fde8e: cmp dword [eax+0x26614],2; 0x006fde95 jge skip — SIGNED.
     Repeated identically at 0x006fdeb3/0x006fdeba after 0x4264c0. */
  return (mode_26614 < 2) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_6fdc10_player_body_ret_gate(
    int32_t ret_4264c0, int32_t partner_id) {
  /* PE 0x006fdea6: and ecx,eax; 0x006fdea8: cmp ecx,-1; 0x006fdeab: je
     skip. The body survives only while (ret & partner_id) != -1. */
  return ((ret_4264c0 & partner_id) != -1) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_6fdc10_player_body_flag_gate(
    uint32_t flag_1c030) {
  /* PE 0x006fdebc: cmp byte [ebx+0x1c030],0; 0x006fdec3: jne skip — LOW
     BYTE. */
  return ((flag_1c030 & 0xffu) == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_6fdc10_player_body_needs_4259b0(
    uint32_t ret_425a70) {
  /* PE 0x006fded2: test al,al; 0x006fded4: jne skip — LOW BYTE of 0x425a70's
     return. 0x4259b0 runs only when AL was zero. */
  return ((ret_425a70 & 0xffu) == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_6fdc10_player_body_float_add_ok(
    int32_t ret_426560) {
  /* PE 0x006fdef4: test eax,eax; 0x006fdef6: je skip — FULL dword. The
     movss/addss [0xbaa454] runs only on a nonzero 0x426560 result. */
  return (ret_426560 != 0) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_6fdc10_record_417870_gate(
    uint32_t arg_10) {
  /* PE 0x006fdf32: test eax,eax (eax = [ebp+0x10], third argument);
     0x006fdf34: jne skip — FULL dword. 0x417870 runs only when the
     argument is zero (the real callsite passes 0). */
  return (arg_10 == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_6fdc10_record_9be080_ret_ne_zero(
    int32_t ret_9be080) {
  /* PE 0x006fdf89: test eax,eax; 0x006fdf95: setne al; 0x006fdf98: mov byte
     [ebx+0x1ba8c],al — the stored byte is (ret != 0) ? 1 : 0. FULL dword
     test, byte result. */
  return (ret_9be080 != 0) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_6fdc10_camera_walk_enter(
    uint32_t begin, uint32_t end) {
  /* PE 0x006fdfc4: cmp esi,[edx+0x1baac]; 0x006fdfca: je skip (loop exit
     0x006fe047: jne). Pointer inequality — NOT the vector count. */
  return (begin != end) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_6fdc10_camera_elem_gate(
    uint32_t elem_0, int32_t elem_2c) {
  /* PE 0x006fdfda: test ecx,ecx; je skip; 0x006fdfde: cmp dword
     [ecx+0x2c],0; 0x006fdfe2: jne skip — both FULL dword. The camera-scale
     block runs only for non-null entries whose [0x2c] is zero. */
  return (elem_0 != 0u && elem_2c == 0) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_6fdc10_registry_scan_gate(
    uint32_t byte_1519) {
  /* PE 0x006fe1a9: cmp byte [ecx+0x1519],0; 0x006fe1b0: jne skip — LOW
     BYTE. The registry slot scan (stride 0x10 over [0x150c..0x1510)) runs
     only while the byte is clear. */
  return ((byte_1519 & 0xffu) == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_6fdc10_registry_head_log_needed(
    int32_t count) {
  /* PE 0x006fe107 / 0x006fe153 / 0x006fe230: test; jne skip-log — FULL
     dword. The "no players" log 0xa112c0(0x10, 0xb7e6bc) runs exactly
     when the sar'd count is zero. */
  return (count == 0) ? 1 : 0;
}

/* ABI v21 — FUN_0081fd60 (Lua-bound Room:RespawnEnemies) decision seams.
   Body: 0x0081fd60..0x0082016d, 341 insns / 0 resyncs / 1038 bytes, SEH
   security-cookie prologue, 19 direct + 4 indirect calls, 50 data stores
   (census-81fd60-body.json in the frame-effect-v21-81fd60 NOTES dir). */

extern "C" int32_t isaac_frame_effect_81fd60_spawn_loop_runs(
    uint32_t count_44) {
  /* PE 0x0081fe53: cmp dx,word [eax+0x44]; 0x0081fe57: jae skip — the
     spawn slot loop runs only while the u16 slot count is nonzero (loop
     bound re-derived as movzx word at 0x0081ff8f). */
  return ((count_44 & 0xffffu) != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_81fd60_seed_valid(uint32_t seed) {
  /* PE 0x0081fe60: test esi,esi; 0x0081fe62: jne continue — FULL dword.
     A zero seed trips the fatal log "RNG Seed is zero!" 0xa112c0(0x10,
     0xb6bf54) + int3 at 0x0081fe73. */
  return (seed != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_81fd60_slot_open_gate(
    uint32_t byte_8) {
  /* PE 0x0081fea7: cmp byte [edx+8],0; 0x0081feae: jbe skip — LOW BYTE.
     The per-slot spawn block runs only while the slot record's byte at +8
     is set. */
  return ((byte_8 & 0xffu) != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_81fd60_respawn_skip_gate(
    uint32_t byte_d, int32_t pos, int32_t field_10, uint32_t rec_ptr,
    uint32_t out_ptr) {
  /* PE 0x0081ff04: cmp byte [ecx+0xd],0; 0x0081ff08: jne proceed — LOW
     BYTE. PE 0x0081ff0a: cmp eax,[ecx+0x10]; 0x0081ff0d: jl proceed —
     SIGNED. PE 0x0081ff12: cmp ecx,[edx]; 0x0081ff14: jne skip. The
     0x7ed310 respawn call is SKIPPED only when all three hold:
     byte clear AND pos >= field_10 AND rec == *out ([ebp-0x10]). */
  if ((byte_d & 0xffu) != 0u) {
    return 0;
  }
  if (pos < field_10) {
    return 0;
  }
  return (rec_ptr == out_ptr) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_81fd60_respawn_return_gate(
    uint32_t ret_7ed310) {
  /* PE 0x0081ff2f: test al,al (0x7ed310 return); 0x0081ff31: je skip —
     LOW BYTE. The block continues only on a nonzero AL. */
  return ((ret_7ed310 & 0xffu) != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_81fd60_respawn_out_gate(
    uint32_t out_ptr) {
  /* PE 0x0081ff33: cmp dword [ebp-0x10],0; 0x0081ff37: je skip — FULL
     dword of the 0x7ed310 out pointer. */
  return (out_ptr != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_81fd60_walk1_enter(int32_t count) {
  /* PE 0x0081ffab: test edi,edi (sar'd count); 0x0081ffad: je skip — FULL
     dword. The vtable walk of the pushed respawns runs only for a nonzero
     count. */
  return (count != 0) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_81fd60_walk1_flag_gate(
    uint32_t ret_vtbl48) {
  /* PE 0x0081ffc3: test al,al (vtable+0x48 return); 0x0081ffc5: je skip —
     LOW BYTE. The two flag-clear stores [data+0x44] &= ~2 (0x0081ffca)
     and &= ~0x80 (0x0081ffd1) run only on a nonzero AL. */
  return ((ret_vtbl48 & 0xffu) != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_81fd60_list2_enter(
    uint32_t tail_30) {
  /* PE 0x0081ffe6: cmp dword [ebp-0x30],0; 0x0081ffea: jbe skip — FULL
     dword. The five-door-slot loop region is entered only while the list-1
     tail slot (written by the host 0x4e45c0 push) is nonzero. */
  return (tail_30 != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_81fd60_loop2_enter(
    uint32_t count_1264) {
  /* PE 0x0081fff2: cmp dword [ebx+0x1264],edi (edi = 0); 0x0081fff8: jbe
     skip — FULL dword array count (array base [this+0x125c] at
     0x00820000). */
  return (count_1264 != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_81fd60_door_open_gate(
    uint32_t byte_d, uint32_t slot, int32_t field_10, uint32_t rec_ptr,
    uint32_t node_ptr) {
  /* PE 0x0082001f: cmp byte [eax+0xd],0; 0x00820023: jne proceed — LOW
     BYTE. PE 0x00820025: cmp esi,[eax+0x10]; 0x00820028: jb proceed —
     UNSIGNED. PE 0x0082002a: cmp eax,[ebp-0x3c]; 0x0082002d: jne skip.
     The door-slot block is SKIPPED only when byte clear AND slot >=u
     field_10 AND rec != the list-1 node. */
  if ((byte_d & 0xffu) != 0u) {
    return 0;
  }
  if (slot < (uint32_t)field_10) {
    return 0;
  }
  return (rec_ptr != node_ptr) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_81fd60_vtbl28_gate(
    uint32_t byte_d, int32_t seed_32c, int32_t field_10, uint32_t rec_ptr,
    uint32_t node_ptr) {
  /* PE 0x0082004b: cmp byte [eax+0xd],0; 0x0082004f: jne skip — LOW BYTE.
     PE 0x00820057: cmp ecx,[eax+0x10] (ecx = [esi+0x32c]); 0x0082005a: jl
     skip — SIGNED. PE 0x0082005c: cmp eax,[ebp-0x34]; 0x0082005f: je skip.
     The vtable+0x28 call runs only when byte clear AND seed_32c >=
     field_10 AND rec != the list-1 node. */
  if ((byte_d & 0xffu) != 0u) {
    return 0;
  }
  if (seed_32c < field_10) {
    return 0;
  }
  return (rec_ptr != node_ptr) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_81fd60_slot_needs_reset(
    int32_t mode_c) {
  /* PE 0x00820086: cmp dword [esi+0xc],1; 0x0082008a: je skip — FULL
     dword. The door slot reset (store [slot+0xc] = 1 at 0x0082008e and
     the 0x70ee40 call at 0x00820095) runs only when the slot mode is not
     1. */
  return (mode_c != 1) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_81fd60_slot_type_open(
    int32_t type_15c, int32_t type_160) {
  /* PE 0x0082009a..0x008200c2: six cmp/je pairs on the two loaded types
     ([esi+0x15c] / [esi+0x160]): 7, 8, 0x1d — the "Open" string assign
     0x40ccd0(…, 0xb1d644, len 4) at 0x008200d1 runs when any matches. */
  return (type_15c == 7 || type_160 == 7 || type_15c == 8 || type_160 == 8 ||
          type_15c == 0x1d || type_160 == 0x1d)
             ? 1
             : 0;
}

extern "C" int32_t isaac_frame_effect_81fd60_free_invalid_param(
    uint32_t size_and3, uint32_t delta) {
  /* PE 0x008200f8: cmp edx,0x1000; 0x008200fe: jb skip — UNSIGNED (edx =
     (end - begin) & ~3). PE 0x0082010b: cmp eax,0x1f; 0x0082010e: jbe skip
     — UNSIGNED (eax = begin - header - 4). The invalid-param host call
     [0xb18894] at 0x00820110 runs only when both hold. */
  if (size_and3 < 0x1000u) {
    return 0;
  }
  return (delta > 0x1fu) ? 1 : 0;
}

/* ABI v22 — FUN_0081fb70 LRoomTileDesc::GetRandomTile remaining decision
   seams (0x0081fb70..0x0081fd51, census-81fb70-body.json in the
   frame-effect-v22-next NOTES dir). All FULL-dword zero-tests; the body
   has no byte-width tests. */

extern "C" int32_t isaac_frame_effect_81fb70_seed_valid(uint32_t seed) {
  /* PE 0x0081fbd2: test esi,esi; 0x0081fbd4: jne continue — FULL dword.
     A zero seed trips the fatal "RNG Seed is zero!" log 0xa112c0(0x10,
     0xb6bf54) + int3 at 0x0081fbe5; mix / XY never run. */
  return (seed != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_81fb70_mixed_valid(uint32_t mixed) {
  /* PE 0x0081fc19 / 0x0081fcc1 (draw 1) and 0x0081fc59 / 0x0081fd00
     (draw 2): test esi,esi; jne continue — FULL dword. A zero chain draw
     trips the same fatal. mix(0)=0, so only reachable via a zero seed. */
  return (mixed != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_81fb70_total_gate(uint32_t total) {
  /* PE 0x0081fc08: test ecx,ecx (ecx = [ebp-8] = abs1+abs2, 32-bit wrap);
     0x0081fc0a: je skip-div — FULL dword. total==0 ⇒ rem=0 ⇒ the
     UNSIGNED pick (cmp edx,[ebp-0xc]; jb rect A) falls to rect B. */
  return (total != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_81fb70_delta_gate(uint32_t delta) {
  /* PE 0x0081fc4c (dx2) / 0x0081fcf4 (dx1) test ecx,ecx; je skip-div;
     0x0081fc82 (dy2) / 0x0081fd29 (dy1) test esi,esi; jne continue — FULL
     dword of the RAW delta bit pattern (negative delta = huge unsigned
     divisor — original defect). The dy gates also drop the third chain
     draw (partial mix discarded, edx cleared); the observable remainder
     is 0 either way. */
  return (delta != 0u) ? 1 : 0;
}

/* ABI v23 — FUN_00820170 Lua Room:TrySpawnBlueWombDoor pure decision
   seams (0x00820170..0x00820445 `ret 0xc`; region incl. the CS re-check
   tail 0x008204ae; census-820170-body.json in the frame-effect-v23-820170
   NOTES dir: 224 insns / 831 bytes / 14 E8 / 3 callers / Lua binder
   0x86c719). The body is a C++ EH + GS host (stub 0xb01801, FuncInfo
   0xbc2460, unwind handler 0xb017f0 = the 0xc8108c CS wrapper); the
   protected scope 0x8203a4..0x8204aa (fs:[0x2c] TLS + CS enter/recheck/
   leave) stays host. Every law below is an SEH-free captured-value test;
   byte decisions are LOW BYTE on uint32_t scalars. */

extern "C" int32_t isaac_frame_effect_820170_arg3_gate(uint32_t arg3) {
  /* PE 0x008201a4 test bl,bl (bl = [ebp+0x10]&0xff) / 0x008201a6 jne;
     same byte re-tested at 0x00820262/0x00820266 (jne) and 0x008202d0/
     0x008202d4 (je -> return 0) — LOW BYTE. */
  return ((arg3 & 0xffu) != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_820170_stage_gate(uint32_t stage_26584) {
  /* PE 0x008201a8 cmp [ecx+0x26584],0x2c; 0x008201af je -> return 0 —
     FULL dword equality. */
  return (stage_26584 != 0x2cu) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_820170_level_flag_gate(uint32_t byte_136) {
  /* PE 0x008201ba cmp byte [eax+0x136],0; 0x008201c1 jne — LOW BYTE. */
  return ((byte_136 & 0xffu) != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_820170_level_type_gate(uint32_t type_8) {
  /* PE 0x008201c3 cmp [eax+8],2; 0x008201c7 jne -> return 0 — FULL
     dword equality. */
  return (type_8 != 2u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_820170_queue_gate(uint32_t count_26630) {
  /* PE 0x008201cd cmp [ecx+0x26630],0; 0x008201d4 ja — UNSIGNED
     (0x80000000 > 0 proceeds). */
  return (count_26630 > 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_820170_game_flag_gate(uint32_t byte_26589) {
  /* PE 0x008201d6 cmp byte [ecx+0x26589],0; 0x008201dd je -> return 0 —
     LOW BYTE. */
  return ((byte_26589 & 0xffu) != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_820170_arg2_norm(uint32_t arg2,
                                                       uint32_t f) {
  /* PE 0x008201f7 test al,al (al = 0x44bfb0 AnyoneHasTrinket ret);
     0x008201fe cmovne ecx,edx: stored arg2 = (f != 0) ? 1 : (arg2 & 0xff);
     the low byte feeds arg2_gate. */
  return (f != 0u) ? 1 : (int32_t)(arg2 & 0xffu);
}

extern "C" int32_t isaac_frame_effect_820170_room_sync_gate(uint32_t ret8,
                                                           uint32_t stage_18314) {
  /* PE 0x00820224 cmp eax,[ecx+0x18314]; 0x0082022a jne -> return 0 —
     FULL dword equality ([0x740bc0 GetRoomByIdx ret + 8] vs [g+0x18314]). */
  return (ret8 == stage_18314) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_820170_probe_bit2_gate(uint32_t mask_a,
                                                             uint32_t mask_b) {
  /* PE 0x00820256 test al,2 (al = low byte of ~mask_b & mask_a);
     0x0082025a cmove esi,ebx — LOW BYTE bit 2: set -> base+1 (probe next
     slot), clear -> base. */
  return (((~mask_b & mask_a) & 2u) != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_820170_room_byte_gate(uint32_t byte_7f) {
  /* PE 0x00820268 cmp byte [eax+0x7f],0; 0x0082026c je skips the bound
     check — LOW BYTE ([0x706940ret]+0x7f). */
  return ((byte_7f & 0xffu) != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_820170_room_bound_gate(uint32_t idx,
                                                             uint32_t limit_40) {
  /* PE 0x0082026e cmp esi,[eax+0x40]; 0x00820271 jge -> return 0 —
     SIGNED. */
  return ((int32_t)idx < (int32_t)limit_40) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_820170_slot8_gate(uint32_t idx) {
  /* PE 0x00820277 cmp esi,8; 0x0082027a jne -> return 0 — FULL dword
     equality. */
  return (idx == 8u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_820170_room_kind_gate(uint32_t kind_4) {
  /* PE 0x00820283 cmp eax,4; 0x00820286 je; 0x0082028c cmp eax,5;
     0x0082028f je -> return 0 — FULL dword, kind not in {4,5}. */
  return ((kind_4 != 4u) && (kind_4 != 5u)) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_820170_slot_free_gate(uint32_t slot,
                                                            uint32_t state_394) {
  /* PE 0x008202a2 test edx,edx; 0x008202a4 je continues; 0x008202a6 cmp
     [edx+0x394],-8; 0x008202ad je -> return 0 — the 8-slot busy scan
     (0x8202a0..0x8202ba). Proceeds iff slot==0 OR state != 0xfffffff8. */
  return ((slot == 0u) || (state_394 != 0xfffffff8u)) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_820170_overflow_gate(uint32_t count_264fc,
                                                           uint32_t limit_26504) {
  /* PE 0x008202bc mov eax,[edi+0x264fc]; 0x008202c2 cmp [edi+0x26504];
     0x008202c8 jle skips the arg2/arg3 chain — SIGNED. */
  return ((int32_t)count_264fc > (int32_t)limit_26504) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_820170_arg2_gate(uint32_t arg2n) {
  /* PE 0x008202ca cmp byte [ebp+0xc],0; 0x008202ce jne — LOW BYTE of the
     NORMALIZED arg2 (arg2_norm output). */
  return ((arg2n & 0xffu) != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_820170_tick_state_gate(uint32_t state_18308) {
  /* PE 0x008202e1 cmp [edi+0x18308],-8; 0x008202e7 jne skips the fast
     path — FULL dword equality with 0xfffffff8. */
  return (state_18308 == 0xfffffff8u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_820170_tick_idx_gate(uint32_t idx_1831c) {
  /* PE 0x008202e9 test esi,esi; 0x008202eb js skips — SIGNED (idx >= 0
     eligible for the fast path). */
  return ((int32_t)idx_1831c >= 0) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_820170_slot_null_gate(uint32_t slot) {
  /* PE 0x008202ed cmp [ebx+esi*4+0x724],0; 0x008202f5 je fast-forward;
     0x00820389/0x00820391 je loop-exit candidate; 0x008203c4/0x008203c6
     jne skips the 0x7eea90 create — FULL dword ptr == 0. */
  return (slot == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_820170_rng_valid_gate(uint32_t state) {
  /* PE 0x00820316 test edi,edi (edi = [[this+4]+0x58] RNG state);
     0x00820318 jne continue — FULL dword. Zero trips the fatal log
     0xa112c0(0x10, 0xb6bf54 "RNG Seed is zero!\n") + int3 at 0x00820329
     (the v21/v22 seed-valid analog). */
  return (state != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_820170_bit_probe_gate(uint32_t word,
                                                            uint32_t mask) {
  /* PE 0x00820384 test [ecx+eax*4],edx; 0x00820387 je loops on — FULL
     dword (word & mask) != 0 checks the candidate slot; word =
     bitmap[esi>>5] (always 0), mask = 1 << (esi & 0x1f), esi = (i+base)&7
     (the signed mod-8 fixup at 0x820363..0x82036f is dead: edi+base
     never sets bit 31). */
  return ((word & mask) != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_820170_arg1_gate(uint32_t arg1) {
  /* PE 0x00820404 cmp byte [ebp+8],0; 0x00820408 je skips 0x70f810 —
     LOW BYTE. */
  return ((arg1 & 0xffu) != 0u) ? 1 : 0;
}

/* ABI v24 — FUN_008204b0 Lua Room:TrySpawnTheVoidDoor pure decision
   seams (0x008204b0..0x0082061e `ret 4` first_ret; region incl. the
   CS-protected tail to 0x008206dd; census-8204b0-body.json in the
   frame-effect-v24-8204b0 NOTES dir: 150 insns / 557 bytes / 11 E8 /
   2 callers 0x73ed62 0x806a60 / Lua binder 0x86c72a). The body is a
   C++ EH + GS host (stub 0xb01831, FuncInfo 0xbc248c, unwind handler
   0xb01820 = the 0xc8108c CS wrapper; cookie [ebp-0x24]); the protected
   scope 0x820621..0x8206d8 (fs:[0x2c] TLS + CS enter/recheck/leave +
   the spawn work) stays host. Every law below is an SEH-free
   captured-value test up to (exclusive) 0x820621; byte decisions are
   LOW BYTE on uint32_t scalars. */

extern "C" int32_t isaac_frame_effect_8204b0_arg1_gate(uint32_t arg1) {
  /* PE 0x008204db cmp byte [ebp+8],0; 0x008204e4 jne skips the entry
     gates; 0x00820518/0x0082051c jne skips the slot checks;
     0x008205f0/0x008205f4 jne jumps to the spawn tail — LOW BYTE. */
  return ((arg1 & 0xffu) != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_8204b0_stage_gate(uint32_t stage_26584) {
  /* PE 0x008204e6 cmp [eax+0x26584],0x2c; 0x008204ed je -> return 0 —
     FULL dword equality. */
  return (stage_26584 != 0x2cu) ? 1 : 0;
}

extern "C" uint32_t isaac_frame_effect_8204b0_probe_candidate(
    uint32_t base_g0, uint32_t gmask_26550, uint32_t gmask_c,
    uint32_t mask_6f9400ret, uint32_t mask_6f95a0ret) {
  /* PE 0x008204f3..0x00820515 straight-line island: merged =
     0x6f9400ret | [g+0x26550] | [g+0xc]; test al,2 on (~0x6f95a0ret &
     merged) @ 0x00820513 / cmove @ 0x00820515 — bit set -> base+1
     (probe next), clear -> base; base = *g_Game (0x008204f9). */
  const uint32_t merged = mask_6f9400ret | gmask_26550 | gmask_c;
  const uint32_t bit2 = (~mask_6f95a0ret & merged) & 2u;
  return base_g0 + ((bit2 != 0u) ? 1u : 0u);
}

extern "C" int32_t isaac_frame_effect_8204b0_slot9_gate(uint32_t candidate) {
  /* PE 0x00820522 cmp edi,9; 0x00820525 jne -> return 0 — FULL dword
     equality (the 0x820170 slot8_gate analog, fence 9). */
  return (candidate == 9u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_8204b0_descriptor_kind_gate(uint32_t kind8) {
  /* PE 0x00820534 cmp [eax+8],5 (eax = [[this+4]+0x10]); 0x00820538
     jne -> return 0 — FULL dword equality. */
  return (kind8 == 5u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_8204b0_dim_gate(uint32_t dim_18304) {
  /* PE 0x00820544 cmp [ebx+0x18304],0; 0x0082054b jl -> return 0 —
     SIGNED (dimension id >= 0). */
  return ((int32_t)dim_18304 >= 0) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_8204b0_kind23_gate(uint32_t kind_269c8) {
  /* PE 0x00820557 cmp eax,2; 0x0082055a je 0x820601; 0x00820560 cmp
     eax,3; 0x00820563 je 0x820601 — FULL dword: kind in {2,3} takes the
     flag tail (the 0x820601 store stays host). */
  return ((kind_269c8 == 2u) || (kind_269c8 == 3u)) ? 1 : 0;
}

extern "C" uint32_t isaac_frame_effect_8204b0_bound_select(
    uint32_t slot_40, uint32_t stage_26584, uint32_t queue_26630,
    uint32_t lv_flag_18c, uint32_t lv_type_8, uint32_t game_flag_26589) {
  /* PE 0x00820572..0x008205ae — ORDER-SENSITIVE chain selecting 0xc vs
     0xb: (a) [0x706940ret]+0x40 == 0xc keeps 0xc; (b) stage != 0 -> 0xb;
     (c) queue > 0 (UNSIGNED ja) -> 0xb; (d) g_Level+0x18c byte != 0
     keeps 0xc; (e) g_Level+8 != 2 -> 0xb; (f) g_Game+0x26589 byte != 0
     keeps 0xc; else 0xb. */
  if (slot_40 == 0xcu) return 0xcu;
  if (stage_26584 != 0u) return 0xbu;
  if (queue_26630 > 0u) return 0xbu;
  if ((lv_flag_18c & 0xffu) != 0u) return 0xcu;
  if (lv_type_8 != 2u) return 0xbu;
  if ((game_flag_26589 & 0xffu) != 0u) return 0xcu;
  return 0xbu;
}

extern "C" int32_t isaac_frame_effect_8204b0_room_byte_gate(uint32_t byte_7f) {
  /* PE 0x008205b0 cmp byte [edx+0x7f],0; 0x008205b7 je skips the
     bound-recalc arm — LOW BYTE ([0x706940ret]+0x7f). */
  return ((byte_7f & 0xffu) != 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_frame_effect_8204b0_bound_recalc(uint32_t bound,
                                                           uint32_t slot_40) {
  /* PE 0x008205b9 mov eax,[edx+0x40]; 0x008205bc test eax,eax;
     0x008205c0 cmove ecx,[ebp-0x10] — VALUE: (slot_40 != 0) ? slot_40 :
     bound. */
  return (slot_40 != 0u) ? slot_40 : bound;
}

extern "C" int32_t isaac_frame_effect_8204b0_room_type3_gate(uint32_t type_80) {
  /* PE 0x008205c4 cmp [edx+0x80],3; 0x008205cb je 0x820601 — FULL dword
     equality. */
  return (type_80 == 3u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_8204b0_bound_min_gate(uint32_t bound) {
  /* PE 0x008205cd cmp ecx,0xc; 0x008205d0 jl 0x820601 — SIGNED. */
  return ((int32_t)bound < 0xc) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_8204b0_flag_bit_gate(uint32_t flag_1839c) {
  /* PE 0x008205d2 test [ebx+0x1839c],0x200000; 0x008205dc jne 0x820601 —
     FULL dword bit test. */
  return ((flag_1839c & 0x200000u) != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_8204b0_room_byte0_gate(uint32_t byte_7f) {
  /* PE 0x008205f6 cmp byte [eax+0x7f],0; 0x008205fa je 0x820621 — LOW
     BYTE: ZERO takes the spawn tail (the byte-0 twin of room_byte_gate;
     eax = the second 0x706940 ret). */
  return ((byte_7f & 0xffu) == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_8204b0_bound_spawn_gate(uint32_t candidate,
                                                              uint32_t limit_40) {
  /* PE 0x008205fc cmp edi,[eax+0x40]; 0x008205ff jl 0x820621 — SIGNED:
     the probe candidate < [0x706940ret]+0x40 takes the spawn tail. */
  return ((int32_t)candidate < (int32_t)limit_40) ? 1 : 0;
}

/* ABI v25 — FUN_0044bfb0 PlayerManager::AnyoneHasTrinket pure decision
   seams (0x0044bfb0..0x0044c06d, two `ret 4` epilogues; census-v24-leaves.json
   in the frame-effect-v24-leaves NOTES dir: 75 insns / 192 bytes / 2 E8 to
   the ZHL-empty item query 0x771550 / 0 field stores / 106 callers). Pure
   query body — plain frame, no SEH/GS; every law is a captured-value test.
   Byte decisions are LOW BYTE on uint32_t scalars. */

extern "C" int32_t isaac_frame_effect_44bfb0_trinket_index(uint32_t trinket) {
  /* PE 0x0044bfd6 and ecx,0x7fff — the 15-bit index mask. */
  return (int32_t)(trinket & 0x7fffu);
}

extern "C" int32_t isaac_frame_effect_44bfb0_bound_gate(uint32_t idx,
                                                        uint32_t count) {
  /* PE 0x0044bfdf cmp ecx,eax; 0x0044bfe1 jge -> not-found — SIGNED. */
  return ((int32_t)idx < (int32_t)count) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_44bfb0_slot_null_gate(uint32_t slot) {
  /* PE 0x0044bfe6 test eax,eax; 0x0044bfe8 je -> not-found — FULL dword. */
  return (slot != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_44bfb0_has_flag_gate(uint32_t flag_b8) {
  /* PE 0x0044bff0 and eax,0x80000000; 0x0044bff5 or eax,0; 0x0044bff8 je
     -> not-found — FULL dword bit 31. */
  return ((flag_b8 & 0x80000000u) != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_44bfb0_walk_enter(uint32_t head,
                                                        uint32_t tail) {
  /* PE 0x0044c007 cmp esi,[edi+4]; 0x0044c00a je -> empty — FULL dword. */
  return (head != tail) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_44bfb0_active_gate(uint32_t elem_2c) {
  /* PE 0x0044c012 cmp dword [edi+0x2c],0; 0x0044c016 jne skips — FULL
     dword: zero is active (proceeds). */
  return (elem_2c == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_44bfb0_match_gate(uint32_t al) {
  /* PE 0x0044c022 test al,al; 0x0044c024 jne -> found — LOW BYTE
     (0x771550 return). */
  return ((al & 0xffu) != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_44bfb0_second_probe_gate(uint32_t found,
                                                               uint32_t al) {
  /* PE 0x0044c026 cmp byte [ebp+0xb],al; 0x0044c029 je -> continue — LOW
     BYTE pair: the +0x1e6c probe runs iff found != 0 && al == 0. */
  return (((found & 0xffu) != 0u) && ((al & 0xffu) == 0u)) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_44bfb0_alt_null_gate(uint32_t alt) {
  /* PE 0x0044c031 test ecx,ecx; 0x0044c033 je -> continue — FULL dword. */
  return (alt != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_44bfb0_walk_continue(uint32_t node_addr,
                                                           uint32_t tail) {
  /* PE 0x0044c047 cmp esi,[eax+4]; 0x0044c04a jne -> loop — FULL dword. */
  return (node_addr != tail) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_44bfb0_result_gate(uint32_t found_node) {
  /* PE 0x0044c04e test edi,edi; 0x0044c050 setne al (main arm);
     second-match arm 0x0044c05c..0x0044c066: mov edi,[edi+0x1e6c];
     test edi,edi; setne al — setne BETWEEN the pops, flags pre-pop —
     FULL dword. */
  return (found_node != 0u) ? 1 : 0;
}

extern "C" void isaac_frame_effect_6fdc10_entry_plan(
    IsaacFrameEffect6fdc10Plan* out,
    uint32_t kind,
    uint32_t this_count_26630,
    uint32_t global_count_26630,
    int32_t global_flag_26638,
    uint32_t mp_begin,
    uint32_t mp_end) {
  if (out == nullptr) {
    return;
  }
  const int32_t valid = isaac_frame_effect_6fdc10_kind_valid(kind);
  const int32_t block =
      (valid != 0) ? isaac_frame_effect_6fdc10_stage_block_gate(
                         this_count_26630, global_count_26630, global_flag_26638)
                   : 0;
  out->kind_valid = valid;
  out->host_fatal = (valid == 0) ? 1 : 0;
  out->fatal_string_va =
      (valid == 0) ? (uint32_t)ISAAC_FRAME_EFFECT_6FDC10_FATAL_STR_VA : 0u;
  out->stage_block = block;
  out->stage_mode =
      (block != 0) ? isaac_frame_effect_6fdc10_stage_mode(mp_begin, mp_end) : 0;
  /* PE 0x006fdd5c: cmp esi,5; je skip the 0x705ee0 call — v19 law consumed
     by reference. */
  out->host_705ee0 = isaac_frame_effect_6fdc10_kind_needs_705ee0(kind);
  out->host_log = valid;
  out->pure_cf_ok = 1;
  out->pure_complete = 0;
}

/* ABI v26 — FUN_007ee7e0 Room grid-cell setter pure decision seams
   (0x007ee7e0..0x007eea8f; census-7ee7e0-body.json in the
   frame-effect-v26-7ee7e0 NOTES dir: 197 insns / 0 resyncs / 687 bytes /
   19 calls (15 direct + 4 indirect) / 30 stores / 24 direct callers (all
   inside 0x81ee20) / 0 raw dword hits / identify-zhl EMPTY / SEH + GS
   frame). Every law is a FULL-dword captured-value test — the body has
   ZERO byte gates (no cmp byte / movzx), so the family low-byte rule has
   no new surface here. Arm-B crash seams are reproduced, not repaired. */

extern "C" uint32_t isaac_frame_effect_7ee7e0_grid_index(uint32_t x,
                                                         uint32_t y,
                                                         uint32_t width) {
  /* PE 0x007ee813 imul eax,esi (y*width); 0x007ee816 lea edi,[eax+ecx]
     (idx = x + width*y) — 32-bit wrap. */
  return (uint32_t)(x + (uint32_t)(width * y));
}

extern "C" int32_t isaac_frame_effect_7ee7e0_index_oob_log(
    uint32_t idx, uint32_t width, uint32_t height) {
  /* PE 0x007ee819 test edi,edi; js LOG; 0x007ee823 cmp edi,height*width;
     0x007ee825 jl skip — SIGNED: log 0xa112c0(0x10,0xb6c190) when idx < 0
     or idx >= width*height; the log path CONTINUES into the cell gate. */
  const int32_t product = (int32_t)(width * height);
  return (((int32_t)idx < 0) || ((int32_t)idx >= product)) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_7ee7e0_cell_occupied(uint32_t cell) {
  /* PE 0x007ee839 cmp [ebx+edi*4+0x24],0; 0x007ee83e jne 0x7ee91f —
     FULL dword. */
  return (cell != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_7ee7e0_mode_open(uint32_t mode8) {
  /* PE 0x007ee844 cmp [ebx+8],0x10; 0x007ee848 jne 0x7eea21. */
  return (mode8 == 0x10u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_7ee7e0_type_default_arm(uint32_t type10) {
  /* PE 0x007ee84e mov eax,[ebx+4]; 0x007ee851 mov eax,[eax+0x10];
     0x007ee854 mov edx,[eax+0x10]; 0x007ee857 cmp edx,2; je 0x7eea21;
     0x007ee860 cmp edx,3; je 0x7eea21 — the setter's [cfg+0x10] member,
     NOT the 0x81fb20/81ecc0 [cfg+0x48] family TYPE_OFF. */
  return ((type10 == 2u) || (type10 == 3u)) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_7ee7e0_arm_a_selected(uint32_t x,
                                                            uint32_t y) {
  /* PE 0x007ee869 test esi,esi (y); jne arm-B check; 0x007ee871 cmp ecx,2
     (x); jne 0x7eea21 — y==0 with x==2 is arm A. */
  return ((x == 2u) && (y == 0u)) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_7ee7e0_arm_b_selected(uint32_t x,
                                                            uint32_t y,
                                                            uint32_t type_c) {
  /* PE 0x007ee935 cmp esi,3; je 0x7ee943; 0x007ee93a cmp esi,4; jne
     0x7eea21; 0x007ee943 cmp ecx,0xe; jne 0x7eea21; 0x007ee94c cmp
     [eax+0xc],1; jne 0x7eea21 — y∈{3,4} + x==0xe + [type10+0xc]==1. */
  return (((y == 3u) || (y == 4u)) && (x == 0xeu) && (type_c == 1u)) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_7ee7e0_arm_ab_bounds_log(uint32_t idx) {
  /* PE 0x007ee882 (arm A) / 0x007ee95e (arm B): test edi,edi; js LOG;
     cmp edi,0x1c0; jl skip — SIGNED idx < 0 or idx >= 0x1c0. */
  return (((int32_t)idx < 0) || ((int32_t)idx >= (int32_t)0x1c0)) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_7ee7e0_arm_a_skip(uint32_t idx,
                                                        int32_t marker) {
  /* PE 0x007ee89d cmp edi,0x1bf; ja 0x7ee91f — UNSIGNED cap; 0x007ee8a5
     cmp [ebx+edi*4+0x76c],0x384; jg 0x7ee91f — SIGNED marker — arm A's
     silent skip. */
  if (idx > 0x1bfu) {
    return 1;
  }
  return (marker > (int32_t)0x384) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_7ee7e0_arm_b_crash_oob(uint32_t idx) {
  /* PE 0x007ee979 test edi,edi; js 0x7eea15; 0x007ee981 cmp edi,0x1c0;
     jge 0x7eea15 — SIGNED re-check; 0x7eea15 is xor ecx,ecx; mov eax,
     [ecx]; call [eax+4] — NULL-vtbl deref, reproduced not repaired. Arm B
     agrees with the log cap (SIGNED 0x1c0) where arm A disagrees (UNSIGNED
     0x1bf). */
  return (((int32_t)idx < 0) || ((int32_t)idx >= (int32_t)0x1c0)) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_7ee7e0_arm_b_crash_marker(int32_t marker) {
  /* PE 0x007ee98d cmp [ebx+edi*4+0x76c],0x384; jg 0x7eea07 — SIGNED;
     0x7eea07 reads the still-EMPTY cell and calls [vtbl+4] — NULL deref,
     reproduced not repaired (arm A returns 0 on the same marker law). */
  return (marker > (int32_t)0x384) ? 1 : 0;
}

/* ABI v27 — FUN_007eece0 Room::GetRoomConfigStage (PURE-OPEN) and
   FUN_007eed10 the captured-value filter (PURE-OPEN), the sibling run
   resumed after the v26 0x7ee7e0 landing (census-v27-siblings.json in
   the frame-effect-v27-siblings NOTES dir: 14 insns / 35 B and 124 insns /
   409 B, 0 resyncs; 0x7eece0 EXACT ZHL Room::GetRoomConfigStage;
   0x7eed10 ZHL EMPTY). 0x7eeeb0 (the SEH effect-copy body after the
   filter) stays HOST — written evidence in the NOTES record, no laws. */

extern "C" int32_t isaac_frame_effect_7eece0_config_gate(uint32_t cfg,
                                                         uint32_t cfg10) {
  /* PE 0x007eece3 test eax,eax; 0x007eece5 je 0x7eecf1 — cfg null —
     then 0x007eecea test eax,eax; 0x007eecec je 0x7eecf1 — cfg10 null.
     The false arm is the shared LOG tail 0x7eecf1..0x7eed02 (push
     0xb6c2a8; push 4; call 0xa112c0; add esp,8; xor eax,eax; ret): the
     null chains RETURN 0 and the log emission stays host (same class as
     the v26 index_oob_log seam — log calls never enter the value laws). */
  return (cfg != 0u && cfg10 != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_7eece0_config_stage(uint32_t cfg,
                                                          uint32_t cfg10,
                                                          uint32_t stage) {
  /* PE 0x007eecee mov eax,[eax]; ret @ 0x7eecf0 — the stage value is
     read only when both chain links are non-null; both null arms land in
     the LOG tail and return 0 (xor eax,eax @ 0x7eed00). */
  if (cfg == 0u || cfg10 == 0u) {
    return 0;
  }
  return (int32_t)stage;
}

extern "C" int32_t isaac_frame_effect_7eed10_audio_gate(uint32_t gate_a,
                                                        uint32_t gate_b) {
  /* PE 0x007eed18 cmp byte [eax+0x20dcc],0; jne 0x7eed33 — sfx mgr
     [0xc7169c]+0x20dcc — then 0x007eed26 cmp byte [eax+0x269ea],0;
     jne 0x7eed33 — g_Game [0xc71678]+0x269ea; else xor al,al. BYTE
     gates: the low byte of either global makes al = 1. */
  return (((gate_a & 0xffu) != 0u) || ((gate_b & 0xffu) != 0u)) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_7eed10_filter(
    uint32_t type, uint32_t subtype, uint32_t arg_a, uint32_t arg_b,
    uint32_t flag, uint32_t gate_a, uint32_t gate_b) {
  /* PE 0x007eed10..0x007eeea8 — the full captured-value decision tree
     (0 calls / 0 stores in the body; 8 plain `ret`, caller cleans 0xc).
     Conventions: ecx = type, edx = subtype, [ebp+8] = arg_a, [ebp+0xc] =
     arg_b, [ebp+0x10] = flag byte. Byte gates mask & 0xff (family rule);
     jae/jb compares are UNSIGNED. */
  const int32_t or_gate =
      isaac_frame_effect_7eed10_audio_gate(gate_a, gate_b);
  const uint32_t flag_b = flag & 0xffu;
  if (type == 5u) {
    /* 0x007eed35 cmp ecx,5; jne 0x7eed47; 0x007eed3a cmp edx,0x29;
       je 0x7eeea5 (shared false exit) — type 5: subtype 0x29 is false,
       everything else hits the shared al=1 epilogue 0x7eed43. */
    return (subtype == 0x29u) ? 0 : 1;
  }
  if (type == 4u) {
    /* 0x007eed47 cmp ecx,4; jne 0x7eed67; subtypes 0xd @ 0x7eed4f and
       0x13 @ 0x7eed58 je 0x7eeea5; 0x14 @ 0x7eed61 jne 0x7eed43 else
       xor al,al; ret @ 0x7eed66 — {0xd,0x13,0x14} false, rest true. */
    if (subtype == 0xdu || subtype == 0x13u || subtype == 0x14u) {
      return 0;
    }
    return 1;
  }
  if (type == 6u) {
    /* 0x007eed67 cmp ecx,6; je 0x7eed43 — unconditional true. */
    return 1;
  }
  if (type == 0x3e8u) {
    /* 0x007eed6c cmp ecx,0x3e8; jne 0x7eee33; 0x007eed78 mov ecx,
       [ebp+0xc] — arg_b REPLACES type for the 0x8d / 0x3c0 arms. */
    /* 9-set pre-arm 0x007eed7b..0x007eedac: subtype in {0x15, 0x21,
       0x44, 0x3f, 0x41, 0x40, 0x45, 0x9e, 0x9f} -> flag byte != 0
       (0x007eedae cmp byte [ebp+0x10],0; jne 0x7eed43) OR arg_b == 0
       (0x007eedb4 test ecx,ecx; je 0x7eed43) returns 1, then FALLS into
       the 6-set checks. */
    const int32_t in_pre =
        (subtype == 0x15u || subtype == 0x21u || subtype == 0x44u ||
         subtype == 0x3fu || subtype == 0x41u || subtype == 0x40u ||
         subtype == 0x45u || subtype == 0x9eu || subtype == 0x9fu);
    if (in_pre != 0 && (flag_b != 0u || arg_b == 0u)) {
      return 1;
    }
    /* 6-set 0x007eedb8..0x007eede3: {0x4a, 0x4c, 0x27, 0x74, 0x78,
       0xc0} -> 1. */
    if (subtype == 0x4au || subtype == 0x4cu || subtype == 0x27u ||
        subtype == 0x74u || subtype == 0x78u || subtype == 0xc0u) {
      return 1;
    }
    if (subtype == 0x8du) {
      /* 0x007eede9 cmp edx,0x8d; 0x007eedf1 test ecx,ecx; jmp 0x7eee9f
         (je 0x7eed43) — arg_b == 0, then 0x007eee99 cmp ecx,0x3c0;
         je 0x7eed43 — arg_b == 0x3c0: either is true. */
      return (arg_b == 0u || arg_b == 0x3c0u) ? 1 : 0;
    }
    if (subtype == 0xa1u) {
      /* 0x007eee00 cmp dword [ebp+8],0x384; jae 0x7eed43 — UNSIGNED
         arg_a >= 0x384 — then 0x007eee0d test al,al; jne 0x7eed43 —
         the audio gate ORs in. */
      if (arg_a >= 0x384u || or_gate != 0) {
        return 1;
      }
      return 0;
    }
    if (subtype == 0x9cu) {
      /* 0x007eee23 cmp dword [ebp+8],1; jne 0x7eeea5 (0); 0x007eee29
         test al,al; jne 0x7eed43 (1) — arg_a == 1 AND audio gate. */
      return (arg_a == 1u && or_gate != 0) ? 1 : 0;
    }
    return 0;
  }
  if (type == 0x11u) {
    /* 0x007eee33 cmp ecx,0x11; je 0x7eed43. */
    return 1;
  }
  if (type == 0x21u) {
    /* 0x007eee41 cmp edx,0xa; jb 0x7eed43 — UNSIGNED subtype < 0xa. */
    return (subtype < 0xau) ? 1 : 0;
  }
  if (type == 0x124u) {
    /* 0x007eee4e cmp ecx,0x124; je 0x7eed43. */
    return 1;
  }
  if (type == 0x123u) {
    /* 0x007eee62 cmp dword [ebp+0xc],0; jmp 0x7eee9f — arg_b == 0 is
       true; ecx is 0x123 there so the 0x3c0 compare at 0x7eee99 never
       fires and the false exit 0x7eeea5 follows otherwise. */
    return (arg_b == 0u) ? 1 : 0;
  }
  if (type == 0x3c5u) {
    /* 0x007eee70 cmp edx,0xa; jne 0x7eed43 — subtype != 0xa is true. */
    return (subtype != 0xau) ? 1 : 0;
  }
  if (type == 0x38bu) {
    /* 0x007eee85 cmp dword [ebp+8],1; jne 0x7eeea5 (0); 0x007eee8b cmp
       byte [ebp+0x10],0; jne 0x7eed43 (1) — arg_a == 1 AND flag byte
       != 0 is true. */
    return (arg_a == 1u && flag_b != 0u) ? 1 : 0;
  }
  if (type == 0x3c0u) {
    /* 0x007eee99 cmp ecx,0x3c0; je 0x7eed43. */
    return 1;
  }
  /* 0x007eeea5 xor al,al; pop ebp; ret — the shared false exit. */
  return 0;
}

/* ABI v28 — FUN_008206e0 the stage-id selector (PURE-OPEN), the recorded
   next VA of the v24 0x8204b0 landing, unassessed through v27 (those
   units worked the 0x7ee band). census-8206e0-body.json in the
   frame-effect-v28-8206e0 NOTES dir: 16 insns / 49 B / 0 resyncs /
   0 calls / 2 plain `ret` / 0 stores / 1 caller 0x7eb4ce / 0 raw hits /
   identify-zhl EMPTY. */

extern "C" int32_t isaac_frame_effect_8206e0_chapter_41_gate(
    uint32_t chapter) {
  /* PE 0x008206e8 cmp eax,4 ; je 0x82070b / 0x008206ed cmp eax,5 ; je 0x82070b
     — FULL dword equality; equality tests, so signedness cannot matter
     (0x100 / 0xffffffff / 0x80000000 compare by value). */
  return (chapter == 4u || chapter == 5u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_8206e0_desc_bit6(
    uint32_t desc_flags_44) {
  /* PE 0x008206fd shr eax,6 (LOGICAL) / 0x00820700 test al,1 /
     0x00820707 cmovne eax,ecx — bit 0 of AL after the logical shift is
     bit 6 of the ORIGINAL flags dword. The read is FULL dword; the
     byte-width op is register AL only (no cmp byte [mem], no movzx). */
  return ((desc_flags_44 >> (uint32_t)ISAAC_FRAME_EFFECT_8206E0_FLAG_BIT) &
          1u)
             ? 1
             : 0;
}

extern "C" uint32_t isaac_frame_effect_8206e0_result(
    uint32_t chapter, uint32_t desc_flags_44) {
  /* Whole body: the chapter arm (0x0082070b mov eax,0x29; ret @ 0x820710)
     wins for chapters 4 and 5; otherwise mov eax,9 @ 0x820702 then
     cmovne eax,ecx (0x1a) @ 0x820707 keeps 9 when bit 6 is clear. */
  if (isaac_frame_effect_8206e0_chapter_41_gate(chapter) != 0) {
    return (uint32_t)ISAAC_FRAME_EFFECT_8206E0_RESULT_CHAPTER;
  }
  if (isaac_frame_effect_8206e0_desc_bit6(desc_flags_44) != 0) {
    return (uint32_t)ISAAC_FRAME_EFFECT_8206E0_RESULT_BIT6;
  }
  return (uint32_t)ISAAC_FRAME_EFFECT_8206E0_RESULT_CLEAR;
}

extern "C" void isaac_frame_effect_8206e0_entry_plan(
    IsaacFrameEffect8206e0Plan* out, uint32_t chapter,
    uint32_t desc_flags_44) {
  if (out == nullptr) {
    return;
  }
  const int32_t chapter_41 =
      isaac_frame_effect_8206e0_chapter_41_gate(chapter);
  out->deref_game = 1;    /* [0xc71678] read unconditional @ 0x8206e0 */
  out->deref_chapter = 1; /* [eax+4] read unconditional @ 0x8206e5 */
  out->chapter_41 = chapter_41;
  out->desc_deref = chapter_41 == 0 ? 1 : 0; /* [ecx+4] ONLY off the arm */
  out->flag_deref = out->desc_deref;         /* [desc+0x44] likewise */
  out->desc_bit6 = isaac_frame_effect_8206e0_desc_bit6(desc_flags_44);
  out->result = isaac_frame_effect_8206e0_result(chapter, desc_flags_44);
  out->host_calls = 0;
  out->pure_complete = 1;
}

static_assert(sizeof(IsaacFrameEffect8206e0Plan) == 36, "8206e0 plan size");
static_assert(offsetof(IsaacFrameEffect8206e0Plan, deref_game) == 0,
              "8206e0 plan deref_game");
static_assert(offsetof(IsaacFrameEffect8206e0Plan, deref_chapter) == 4,
              "8206e0 plan deref_chapter");
static_assert(offsetof(IsaacFrameEffect8206e0Plan, chapter_41) == 8,
              "8206e0 plan chapter_41");
static_assert(offsetof(IsaacFrameEffect8206e0Plan, desc_deref) == 12,
              "8206e0 plan desc_deref");
static_assert(offsetof(IsaacFrameEffect8206e0Plan, flag_deref) == 16,
              "8206e0 plan flag_deref");
static_assert(offsetof(IsaacFrameEffect8206e0Plan, desc_bit6) == 20,
              "8206e0 plan desc_bit6");
static_assert(offsetof(IsaacFrameEffect8206e0Plan, result) == 24,
              "8206e0 plan result");
static_assert(offsetof(IsaacFrameEffect8206e0Plan, host_calls) == 28,
              "8206e0 plan host_calls");
static_assert(offsetof(IsaacFrameEffect8206e0Plan, pure_complete) == 32,
              "8206e0 plan pure_complete");

/* ABI v29 — FUN_00820720 Room::GetBossVictoryJingle (ZHL-promoted in
   comments only; exact 13-byte pattern 56 8b 35 ?? ?? ?? ?? 57 8b f9
   83 3e 0d, Room.zhl), the v28-recorded sibling (int3 pad
   0x82079c..0x82079f, next fn 0x8207a0). census-820720-body.json in the
   frame-effect-v29-820720 NOTES dir: 46 insns / 124 B / 0 resyncs /
   1 call (0x74bae0, HOST) / 0 indirect / 4 plain `ret` / 0 stores /
   2 callers 0x7fee72 + 0x7ff7fe / 0 raw hits / thiscall, ecx = Room,
   ZERO stack args, uint32_t music-id result. */

extern "C" int32_t isaac_frame_effect_820720_zero_gate(
    uint32_t game_0, uint32_t chapter) {
  /* PE 0x0082072a cmp dword [esi],0xd ; jne 0x820735 / 0x0082072f
     cmp [esi+4],1 ; je 0x82074a — FULL dword equality; equality tests,
     so signedness cannot matter (0x100 / 0x80000000 compare by value). */
  return (game_0 == (uint32_t)ISAAC_FRAME_EFFECT_820720_GAME_0_EXPECT &&
          chapter == (uint32_t)ISAAC_FRAME_EFFECT_820720_CHAPTER_1_EXPECT)
             ? 1
             : 0;
}

extern "C" int32_t isaac_frame_effect_820720_host_zero_gate(
    int32_t host_result, int32_t game_18304) {
  /* PE 0x0082073c cmp eax,4 ; jne 0x82074f / 0x00820741 cmp
     [esi+0x18304],-0xa ; jne 0x82074f — FULL dword equality on the
     0x74bae0 host result and [g_Game+0x18304]; -0xa == 0xfffffff6,
     compared by value. */
  return (host_result == ISAAC_FRAME_EFFECT_820720_HOST_RESULT_EXPECT &&
          game_18304 == ISAAC_FRAME_EFFECT_820720_GAME_18304_EXPECT)
             ? 1
             : 0;
}

extern "C" int32_t isaac_frame_effect_820720_room_5c_gate(
    int32_t room_type_8, uint32_t room_byte_7228) {
  /* PE 0x00820755 cmp [eax+8],6 ; je 0x820794 — FULL dword / 0x0082075b
     cmp byte [eax+0x7228],0 ; jne 0x820794 — BYTE zero-test on the room
     byte flag (written at 0x7f3006 from ([desc2+0x44]>>4)&1). The byte
     is masked here so an out-of-range argument cannot read as set. */
  return (room_type_8 == ISAAC_FRAME_EFFECT_820720_ROOM_TYPE_5C ||
          (room_byte_7228 & 0xffu) != 0u)
             ? 1
             : 0;
}

extern "C" int32_t isaac_frame_effect_820720_chapter_42_gate(
    uint32_t chapter) {
  /* PE 0x00820767 cmp eax,4 ; je 0x82078c / 0x0082076c cmp eax,5 ;
     je 0x82078c — FULL dword equality. */
  return (chapter == 4u || chapter == 5u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_820720_desc_bit6(
    uint32_t desc_flags_44) {
  /* PE 0x0082077e shr eax,6 (LOGICAL) / 0x00820781 test al,1 /
     0x00820788 cmovne eax,ecx — bit 0 of AL after the logical shift is
     bit 6 of the ORIGINAL flags dword (the read is FULL dword; the
     byte-width op is register AL only). */
  return ((desc_flags_44 >> (uint32_t)ISAAC_FRAME_EFFECT_820720_FLAG_BIT) &
          1u)
             ? 1
             : 0;
}

extern "C" uint32_t isaac_frame_effect_820720_result(
    uint32_t game_0, uint32_t chapter, int32_t host_result,
    int32_t game_18304, int32_t room_type_8, uint32_t room_byte_7228,
    uint32_t desc_flags_44) {
  /* Whole body, arm order as compiled: ret 0 (game_0==0xd && chapter==1),
     ret 0 (host==4 && [g+0x18304]==-10), ret 0x5c (room type==6 || byte
     0x7228 != 0), ret 0x2a (chapter 4/5), ret 0x61 : 0x53 (desc bit 6). */
  if (isaac_frame_effect_820720_zero_gate(game_0, chapter) != 0) {
    return (uint32_t)ISAAC_FRAME_EFFECT_820720_RESULT_ZERO;
  }
  if (isaac_frame_effect_820720_host_zero_gate(host_result, game_18304) !=
      0) {
    return (uint32_t)ISAAC_FRAME_EFFECT_820720_RESULT_ZERO;
  }
  if (isaac_frame_effect_820720_room_5c_gate(room_type_8, room_byte_7228) !=
      0) {
    return (uint32_t)ISAAC_FRAME_EFFECT_820720_RESULT_5C;
  }
  if (isaac_frame_effect_820720_chapter_42_gate(chapter) != 0) {
    return (uint32_t)ISAAC_FRAME_EFFECT_820720_RESULT_2A;
  }
  if (isaac_frame_effect_820720_desc_bit6(desc_flags_44) != 0) {
    return (uint32_t)ISAAC_FRAME_EFFECT_820720_RESULT_BIT6;
  }
  return (uint32_t)ISAAC_FRAME_EFFECT_820720_RESULT_CLEAR;
}

extern "C" void isaac_frame_effect_820720_entry_plan(
    IsaacFrameEffect820720Plan* out, uint32_t game_0, uint32_t chapter,
    int32_t host_result, int32_t game_18304, int32_t room_type_8,
    uint32_t room_byte_7228, uint32_t desc_flags_44) {
  if (out == nullptr) {
    return;
  }
  const int32_t zero_gate =
      isaac_frame_effect_820720_zero_gate(game_0, chapter);
  const int32_t host_zero =
      isaac_frame_effect_820720_host_zero_gate(host_result, game_18304);
  const int32_t room_5c =
      isaac_frame_effect_820720_room_5c_gate(room_type_8, room_byte_7228);
  const int32_t chapter_42 =
      isaac_frame_effect_820720_chapter_42_gate(chapter);
  const int32_t on_final_arm =
      zero_gate == 0 && host_zero == 0 && room_5c == 0 && chapter_42 == 0
          ? 1
          : 0;
  out->deref_game = 1; /* [0xc71678] + [g_Game+0] read @0x820721/0x82072a */
  out->deref_chapter = 1; /* re-read @0x820764 UNCONDITIONAL; the FIRST
                             read @0x82072f is gated on game_0==0xd */
  out->zero_gate = zero_gate;
  out->host_74bae0_fires = zero_gate == 0 ? 1 : 0; /* call @0x820737 only
                                                      off the first arm */
  out->deref_18304 = (zero_gate == 0 && host_result == 4) ? 1 : 0; /* read
      @0x820741 runs only when the host result == 4 */
  out->host_zero = host_zero;
  out->deref_room = (zero_gate == 0 && host_zero == 0) ? 1 : 0; /* [g+
      0x18300] @0x82074f only when both ret-0 arms miss */
  out->room_5c = room_5c;
  out->chapter_42 = chapter_42;
  out->desc_deref = on_final_arm; /* [this+4] @0x820771 only on the arm */
  out->flag_deref = on_final_arm; /* [desc+0x44] @0x82077b likewise */
  out->desc_bit6 = isaac_frame_effect_820720_desc_bit6(desc_flags_44);
  out->result =
      isaac_frame_effect_820720_result(game_0, chapter, host_result,
                                       game_18304, room_type_8,
                                       room_byte_7228, desc_flags_44);
  out->host_calls = 1;
  out->pure_complete = 0;
}

static_assert(sizeof(IsaacFrameEffect820720Plan) == 60, "820720 plan size");
static_assert(offsetof(IsaacFrameEffect820720Plan, deref_game) == 0,
              "820720 plan deref_game");
static_assert(offsetof(IsaacFrameEffect820720Plan, deref_chapter) == 4,
              "820720 plan deref_chapter");
static_assert(offsetof(IsaacFrameEffect820720Plan, zero_gate) == 8,
              "820720 plan zero_gate");
static_assert(offsetof(IsaacFrameEffect820720Plan, host_74bae0_fires) == 12,
              "820720 plan host_74bae0_fires");
static_assert(offsetof(IsaacFrameEffect820720Plan, deref_18304) == 16,
              "820720 plan deref_18304");
static_assert(offsetof(IsaacFrameEffect820720Plan, host_zero) == 20,
              "820720 plan host_zero");
static_assert(offsetof(IsaacFrameEffect820720Plan, deref_room) == 24,
              "820720 plan deref_room");
static_assert(offsetof(IsaacFrameEffect820720Plan, room_5c) == 28,
              "820720 plan room_5c");
static_assert(offsetof(IsaacFrameEffect820720Plan, chapter_42) == 32,
              "820720 plan chapter_42");
static_assert(offsetof(IsaacFrameEffect820720Plan, desc_deref) == 36,
              "820720 plan desc_deref");
static_assert(offsetof(IsaacFrameEffect820720Plan, flag_deref) == 40,
              "820720 plan flag_deref");
static_assert(offsetof(IsaacFrameEffect820720Plan, desc_bit6) == 44,
              "820720 plan desc_bit6");
static_assert(offsetof(IsaacFrameEffect820720Plan, result) == 48,
              "820720 plan result");
static_assert(offsetof(IsaacFrameEffect820720Plan, host_calls) == 52,
              "820720 plan host_calls");
static_assert(offsetof(IsaacFrameEffect820720Plan, pure_complete) == 56,
              "820720 plan pure_complete");

/* ABI v30 — FUN_008207a0 (the SEH intro-action body; decision-seams class)
   and FUN_008208c0 (the next pure sibling, PURE-OPEN). census-8207a0-body.json
   in the frame-effect-v30-8207a0 NOTES dir: 86 insns / 275 B / 0 resyncs /
   5 calls (all HOST) / 0 indirect / 1 plain `ret` / 4 stores + 1 RMW /
   2 callers 0x5fa76f + 0x70088f / 0 raw hits / thiscall, ecx = Room,
   ZERO stack args, result ALWAYS 0. 8208c0: 4 insns / 19 B / 0 calls /
   2 callers / 1 raw hit (push-imm32 callback registration @ 0x86c8c2). */

extern "C" int32_t isaac_frame_effect_8207a0_entry_gate(
    uint32_t game_0, uint32_t mode_flags_1839c, int32_t game_18304,
    int32_t game_182d0, uint32_t flag_byte_44) {
  /* PE 0x008207d0 cmp dword [esi],1 ; jne 0x82089f — FULL dword equality
     (equality, signedness cannot matter). 0x008207d9 test dword
     [esi+0x1839c],0x10000 ; je — FULL dword bit test (law bit 16 of the
     whole dword). 0x008207e9/0x008207ef mov eax,[esi+0x18304];
     cmp eax,[esi+0x182d0] ; jne — FULL dword equality of the two
     caller-resolved Game fields. 0x008207fb/0x00820801 mov
     edi,[esi+0x1adbc]; test byte [edi+0x44],0x40 ; jne — BYTE gate, the
     flag bit must be CLEAR (the machine tests the low byte only; masked
     & 0xff per the family low-byte rule). */
  if (game_0 != (uint32_t)ISAAC_FRAME_EFFECT_8207A0_GAME_0_EXPECT) {
    return 0;
  }
  if (((mode_flags_1839c >>
        (uint32_t)ISAAC_FRAME_EFFECT_8207A0_MODE_FLAG_BIT) &
       1u) == 0u) {
    return 0;
  }
  if (game_18304 != game_182d0) {
    return 0;
  }
  if ((((flag_byte_44 & 0xffu) >>
        (uint32_t)ISAAC_FRAME_EFFECT_8207A0_FLAG_BIT) &
       1u) != 0u) {
    return 0;
  }
  return 1;
}

extern "C" uint32_t isaac_frame_effect_8207a0_desc_value(
    uint32_t desc_ptr, uint32_t desc_5c) {
  /* PE 0x00820818 mov eax,[ebx+4] ; test eax,eax ; je 0x820822 ; 0x0082081f
     mov eax,[eax+0x5c] — when the desc pointer is zero the machine keeps
     the tested value (0); otherwise the load of [desc+0x5c] replaces it.
     Forms arg 7 of the 0x6fe410 pack. */
  return (desc_ptr != 0u) ? desc_5c : 0u;
}

extern "C" int32_t isaac_frame_effect_8207a0_post_loop_gate(
    uint32_t out_byte_24) {
  /* PE 0x00820884 cmp byte [ebp-0x24],0 ; jne 0x82089f — BYTE zero-test
     on the 0x41af60 out struct's first byte; 1 means the 0xa648b0
     allocator call runs. Masked & 0xff. */
  return (out_byte_24 & 0xffu) == 0u ? 1 : 0;
}

extern "C" uint32_t isaac_frame_effect_8207a0_result(void) {
  /* PE 0x0082089f xor al,al — the single merge point; every normal path
     returns 0. Only the side effects (flag store, dispatcher call pack,
     allocator call) vary. */
  return (uint32_t)ISAAC_FRAME_EFFECT_8207A0_RESULT;
}

extern "C" void isaac_frame_effect_8207a0_entry_plan(
    IsaacFrameEffect8207a0Plan* out, uint32_t game_0,
    uint32_t mode_flags_1839c, int32_t game_18304, int32_t game_182d0,
    uint32_t flag_byte_44, uint32_t desc_ptr, uint32_t desc_5c,
    uint32_t out_byte_24) {
  if (out == nullptr) {
    return;
  }
  const int32_t gate_a = (game_0 == (uint32_t)ISAAC_FRAME_EFFECT_8207A0_GAME_0_EXPECT) ? 1 : 0;
  const int32_t gate_b =
      (((mode_flags_1839c >>
         (uint32_t)ISAAC_FRAME_EFFECT_8207A0_MODE_FLAG_BIT) &
        1u) != 0u)
          ? 1
          : 0;
  const int32_t gate_c = (game_18304 == game_182d0) ? 1 : 0;
  const int32_t gate_d =
      ((((flag_byte_44 & 0xffu) >>
         (uint32_t)ISAAC_FRAME_EFFECT_8207A0_FLAG_BIT) &
        1u) == 0u)
          ? 1
          : 0;
  const int32_t entry = gate_a && gate_b && gate_c && gate_d ? 1 : 0;
  out->deref_game = 1; /* [0xc71678] + [g_Game+0] @0x8207ca/0x8207d0 */
  out->deref_mode_flags = gate_a; /* [g+0x1839c] @0x8207d9 — only after A */
  out->deref_transition =
      (gate_a && gate_b) ? 1 : 0; /* [g+0x18304]/[g+0x182d0] @0x8207e9/ef */
  out->deref_flag_obj = (gate_a && gate_b && gate_c) ? 1 : 0; /* [g+0x1adbc] */
  out->deref_flag_byte = out->deref_flag_obj; /* [obj+0x44] @0x820801 */
  out->entry_gate = entry;
  out->desc_deref = entry; /* [this+4] @0x820818 — action block only */
  out->desc_5c_deref =
      (entry && desc_ptr != 0u) ? 1 : 0; /* [desc+0x5c] @0x82081f */
  out->desc_value = isaac_frame_effect_8207a0_desc_value(desc_ptr, desc_5c);
  out->post_loop_gate = isaac_frame_effect_8207a0_post_loop_gate(out_byte_24);
  out->result = isaac_frame_effect_8207a0_result();
  out->host_calls = 5; /* 812d00 / 6fe410 / 703670 / 41af60 / a648b0 */
  out->pure_complete = 0;
}

static_assert(sizeof(IsaacFrameEffect8207a0Plan) == 52, "8207a0 plan size");
static_assert(offsetof(IsaacFrameEffect8207a0Plan, deref_game) == 0,
              "8207a0 plan deref_game");
static_assert(offsetof(IsaacFrameEffect8207a0Plan, deref_mode_flags) == 4,
              "8207a0 plan deref_mode_flags");
static_assert(offsetof(IsaacFrameEffect8207a0Plan, deref_transition) == 8,
              "8207a0 plan deref_transition");
static_assert(offsetof(IsaacFrameEffect8207a0Plan, deref_flag_obj) == 12,
              "8207a0 plan deref_flag_obj");
static_assert(offsetof(IsaacFrameEffect8207a0Plan, deref_flag_byte) == 16,
              "8207a0 plan deref_flag_byte");
static_assert(offsetof(IsaacFrameEffect8207a0Plan, entry_gate) == 20,
              "8207a0 plan entry_gate");
static_assert(offsetof(IsaacFrameEffect8207a0Plan, desc_deref) == 24,
              "8207a0 plan desc_deref");
static_assert(offsetof(IsaacFrameEffect8207a0Plan, desc_5c_deref) == 28,
              "8207a0 plan desc_5c_deref");
static_assert(offsetof(IsaacFrameEffect8207a0Plan, desc_value) == 32,
              "8207a0 plan desc_value");
static_assert(offsetof(IsaacFrameEffect8207a0Plan, post_loop_gate) == 36,
              "8207a0 plan post_loop_gate");
static_assert(offsetof(IsaacFrameEffect8207a0Plan, result) == 40,
              "8207a0 plan result");
static_assert(offsetof(IsaacFrameEffect8207a0Plan, host_calls) == 44,
              "8207a0 plan host_calls");
static_assert(offsetof(IsaacFrameEffect8207a0Plan, pure_complete) == 48,
              "8207a0 plan pure_complete");

extern "C" int32_t isaac_frame_effect_8208c0_above(float room_field_7240) {
  /* PE 0x008208c0 movss xmm0,[ecx+0x7240] ; 0x008208c8 comiss
     xmm0,[0xba9fe4] (+0.0f — CORRECTED v31, measured bits 0x00000000;
     the v30 "-18.0f (0xc1900000)" text mis-mapped the .rdata read) ;
     0x008208cf seta al — CF==0 && ZF==0, i.e. ORDERED and strictly
     greater; NaN (unordered, CF set) and the equal value both give 0.
     Plain IEEE `>` is the exact law. */
  return (room_field_7240 > 0.0f) ? 1 : 0;
}

extern "C" void isaac_frame_effect_8208c0_entry_plan(
    IsaacFrameEffect8208c0Plan* out, float room_field_7240) {
  if (out == nullptr) {
    return;
  }
  out->deref_field = 1; /* f32 [this+0x7240] read @0x8208c0, FULL dword */
  out->above = isaac_frame_effect_8208c0_above(room_field_7240);
  out->host_calls = 0;
  out->pure_complete = 1; /* zero calls, four instructions, whole body */
}

static_assert(sizeof(IsaacFrameEffect8208c0Plan) == 16, "8208c0 plan size");
static_assert(offsetof(IsaacFrameEffect8208c0Plan, deref_field) == 0,
              "8208c0 plan deref_field");
static_assert(offsetof(IsaacFrameEffect8208c0Plan, above) == 4,
              "8208c0 plan above");
static_assert(offsetof(IsaacFrameEffect8208c0Plan, host_calls) == 8,
              "8208c0 plan host_calls");
static_assert(offsetof(IsaacFrameEffect8208c0Plan, pure_complete) == 12,
              "8208c0 plan pure_complete");

/* ABI v31 — FUN_008208e0 (Room::IsCurrentRoomLastBoss, PURE-OPEN) and
   FUN_00820910 (Room::MamaMegaExplosion, decision seams). census +
   full streams in the frame-effect-v31-8208e0 NOTES dir: 8 insns /
   37 B / 1 call (0x740bc0 EXACT ZHL GetRoomByIdx, HOST) / 0 stores /
   2 callers 0x7fbd1f + 0x80df46 / 1 raw hit @0x86c8e5; 64 insns /
   393 B / 5 direct + 1 indirect calls / 3 stores / 2 callers
   0x74baa7 + 0x8053be / 2 raw hits (0x86c918, 0x8911ea). */

extern "C" int32_t isaac_frame_effect_8208e0_sync_gate(uint32_t ret8,
                                                       uint32_t game_18314) {
  /* PE 0x008208f3 mov ecx,[eax+8] (eax = the 0x740bc0 result) ;
     0x008208fb cmp ecx,[eax+0x18314] ; 0x00820901 sete al — FULL dword
     equality. The host call (Game::GetRoomByIdx([g_Game+0x18304], -1))
     stays host; ret8 = caller-resolved [host_ret+8], game_18314 =
     caller-resolved [g_Game+0x18314]. Same value shape as the v23
     820170 probe_bit2_gate (PE 0x820224). */
  return (ret8 == game_18314) ? 1 : 0;
}

extern "C" void isaac_frame_effect_8208e0_entry_plan(
    IsaacFrameEffect8208e0Plan* out, uint32_t ret8, uint32_t game_18314) {
  if (out == nullptr) {
    return;
  }
  out->deref_game = 1;   /* [0xc71678] @0x8208e0 and @0x8208f6 */
  out->deref_18304 = 1;  /* [g_Game+0x18304] pre-call arg @0x8208e8 */
  out->host_740bc0 = 1;  /* GetRoomByIdx call @0x8208ee */
  out->deref_ret8 = 1;   /* [host_ret+8] @0x8208f3 */
  out->deref_18314 = 1;  /* [g_Game+0x18314] @0x8208fb */
  out->sync_gate = isaac_frame_effect_8208e0_sync_gate(ret8, game_18314);
  out->host_calls = 1;   /* the single 0x740bc0 call */
  out->pure_complete = 1; /* zero stores, one host result lawed as input */
}

static_assert(sizeof(IsaacFrameEffect8208e0Plan) == 32, "8208e0 plan size");
static_assert(offsetof(IsaacFrameEffect8208e0Plan, deref_game) == 0,
              "8208e0 plan deref_game");
static_assert(offsetof(IsaacFrameEffect8208e0Plan, deref_18304) == 4,
              "8208e0 plan deref_18304");
static_assert(offsetof(IsaacFrameEffect8208e0Plan, host_740bc0) == 8,
              "8208e0 plan host_740bc0");
static_assert(offsetof(IsaacFrameEffect8208e0Plan, deref_ret8) == 12,
              "8208e0 plan deref_ret8");
static_assert(offsetof(IsaacFrameEffect8208e0Plan, deref_18314) == 16,
              "8208e0 plan deref_18314");
static_assert(offsetof(IsaacFrameEffect8208e0Plan, sync_gate) == 20,
              "8208e0 plan sync_gate");
static_assert(offsetof(IsaacFrameEffect8208e0Plan, host_calls) == 24,
              "8208e0 plan host_calls");
static_assert(offsetof(IsaacFrameEffect8208e0Plan, pure_complete) == 28,
              "8208e0 plan pure_complete");

extern "C" uint32_t isaac_frame_effect_820910_desc_flags_rewrite(
    uint32_t flags) {
  /* PE 0x00820921 or dword [eax+0x44],0x4000 — the unconditional
     [desc+0x44] store VALUE (the store stays stateful/host; the dword
     is a pure OR of the caller-resolved flags). */
  return flags | ISAAC_FRAME_EFFECT_820910_DESC_FLAG_BITS;
}

extern "C" int32_t isaac_frame_effect_820910_getplayer_gate(uint32_t arg2) {
  /* PE 0x0082092f mov eax,[ebp+0xc] ; test eax,eax ; jne 0x820942 — the
     FIRST Game::GetPlayer call (0x417870, ecx = g_Game, pushed arg2)
     fires exactly when arg2 == 0. FULL dword zero-test. */
  return (arg2 == 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_frame_effect_820910_pack_arg(
    uint32_t arg2, uint32_t host_player) {
  /* PE 0x0082093c/0x00820950 — the 0x6fe410 pack's arg4: arg2 when
     nonzero, else the Game::GetPlayer result (caller-resolved). */
  return (arg2 != 0u) ? arg2 : host_player;
}

extern "C" int32_t isaac_frame_effect_820910_sentinel_match(
    uint32_t x0_bits, uint32_t x1_bits) {
  /* PE 0x00820969/0x0082097f ucomiss + 0x00820971/0x00820987 lahf ;
     test ah,0x44 ; jp — the normalize path runs iff BOTH probes are
     ORDERED-EQUAL (lahf/jp parity algebra in the header block); the
     law is (x0 == c0) && (x1 == c1) f32 IEEE equality, which for the
     constants equals PURE BIT equality: c0 = 0x3760371c and
     c1 = 0x37873770 are positive normal floats (neither zero nor
     NaN), so a NaN or +-0.0 input disagrees with them under both
     semantics. */
  return (x0_bits == ISAAC_FRAME_EFFECT_820910_SENTINEL_X0_BITS &&
          x1_bits == ISAAC_FRAME_EFFECT_820910_SENTINEL_X1_BITS)
             ? 1 : 0;
}

/* Portable uint32 -> float bitcast via the object representation
   (freestanding build: no <string.h>/<bit>). */
static float fe_820910_bits_to_f32(uint32_t v) {
  float f;
  unsigned char* b = reinterpret_cast<unsigned char*>(&f);
  b[0] = static_cast<unsigned char>(v & 0xffu);
  b[1] = static_cast<unsigned char>((v >> 8) & 0xffu);
  b[2] = static_cast<unsigned char>((v >> 16) & 0xffu);
  b[3] = static_cast<unsigned char>((v >> 24) & 0xffu);
  return f;
}

static int32_t fe_820910_res_gt_zero(uint32_t sqrt_res_bits) {
  return (fe_820910_bits_to_f32(sqrt_res_bits) > 0.0f) ? 1 : 0;
}

extern "C" float isaac_frame_effect_820910_dist_scale(uint32_t sqrt_res_bits) {
  /* PE 0x00820a12 comiss xmm0,[0xba9fe4] (+0.0f — measured, the same
     corrected constant as 8208c0) ; 0x00820a1f jbe 0x820a3d — the
     200.0f/sqrt_res scale (0xbaaa94 = 200.0f, `divss xmm1,xmm0`
     @0x820a29) runs only when the host sqrt result (0x435a50 output,
     caller-resolved) is ORDERED > 0.0f; NaN and -0.0 keep 1.0f. f32
     IEEE division — wasm f32.div matches divss under the default
     MXCSR. */
  if (fe_820910_res_gt_zero(sqrt_res_bits) != 0) {
    return 200.0f / fe_820910_bits_to_f32(sqrt_res_bits);
  }
  return 1.0f;
}

extern "C" void isaac_frame_effect_820910_entry_plan(
    IsaacFrameEffect820910Plan* out, uint32_t arg2, uint32_t x0_bits,
    uint32_t x1_bits, uint32_t sqrt_res_bits) {
  if (out == nullptr) {
    return;
  }
  out->deref_desc = 1;  /* [this+4] @0x82091e (unconditional) */
  out->store_flags = 1; /* [desc+0x44] |= 0x4000 @0x820921 */
  out->getplayer_gate = isaac_frame_effect_820910_getplayer_gate(arg2);
  out->draw = 1;        /* 0x6eef60 @0x820928 (one stream draw) */
  out->deref_param1 = 1; /* the float2 probe [arg1]/[arg1+4] @0x820963/0x82097a */
  out->sentinel_match =
      isaac_frame_effect_820910_sentinel_match(x0_bits, x1_bits);
  out->deref_player = out->sentinel_match; /* 2nd GetPlayer + [+0x33c]/
                                              [+0x340] @0x820990/0x8209a7 */
  out->dist_gate = fe_820910_res_gt_zero(sqrt_res_bits);
  out->host_calls = 6; /* 5 direct (6eef60/417870x2/6fe410/435a50)
                          + 1 indirect [vt+0xc] */
  out->pure_complete = 0; /* RNG draw + stores + vtable call stay host */
}

static_assert(sizeof(IsaacFrameEffect820910Plan) == 40, "820910 plan size");
static_assert(offsetof(IsaacFrameEffect820910Plan, deref_desc) == 0,
              "820910 plan deref_desc");
static_assert(offsetof(IsaacFrameEffect820910Plan, store_flags) == 4,
              "820910 plan store_flags");
static_assert(offsetof(IsaacFrameEffect820910Plan, getplayer_gate) == 8,
              "820910 plan getplayer_gate");
static_assert(offsetof(IsaacFrameEffect820910Plan, draw) == 12,
              "820910 plan draw");
static_assert(offsetof(IsaacFrameEffect820910Plan, deref_param1) == 16,
              "820910 plan deref_param1");
static_assert(offsetof(IsaacFrameEffect820910Plan, sentinel_match) == 20,
              "820910 plan sentinel_match");
static_assert(offsetof(IsaacFrameEffect820910Plan, deref_player) == 24,
              "820910 plan deref_player");
static_assert(offsetof(IsaacFrameEffect820910Plan, dist_gate) == 28,
              "820910 plan dist_gate");
static_assert(offsetof(IsaacFrameEffect820910Plan, host_calls) == 32,
              "820910 plan host_calls");
static_assert(offsetof(IsaacFrameEffect820910Plan, pure_complete) == 36,
              "820910 plan pure_complete");

/* ABI v32 — FUN_00820aa0 (Lua Room::GetDungeonRockIdx, PURE-OPEN) and
   FUN_00820ac0 (Lua Room::TurnGold, decision seams). census + full
   streams in the frame-effect-v32-820aa0 NOTES dir: 7 insns / 28 B /
   0 calls / 0 stores / 0 direct callers / 1 raw hit @0x86c84c; 79
   insns / 319 B / 1 call (0x7ebd50 EXACT ZHL Room::
   SpawnGridEntityDesc, HOST) / 11 stores / 2 callers 0x5a11af +
   0x7f76fe / 1 raw hit @0x86c93a. SEH assessment: NO handler install —
   the v31 "SEH-heavy" label is corrected (plain frame, no fs:[0], no
   GS cookie). */

extern "C" int32_t isaac_frame_effect_820aa0_bit_gate(
    uint32_t flags_1839c) {
  /* PE 0x00820aa5 test dword [eax+0x1839c],0x2000 ; 0x00820aaf je —
     FULL dword bit probe: the -1 path runs iff the bit is set. */
  return (flags_1839c & ISAAC_FRAME_EFFECT_820AA0_FLAG_BIT) != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_frame_effect_820aa0_result(
    uint32_t flags_1839c, uint32_t rock768) {
  /* PE 0x00820ab1 or eax,0xffffffff — ALWAYS -1 (eax held g_Game at
     that point, so the OR is value-independent); 0x00820ab5 mov
     eax,[ecx+0x768] is the clear-bit fallback (caller-resolved). */
  if (isaac_frame_effect_820aa0_bit_gate(flags_1839c) != 0) {
    return ISAAC_FRAME_EFFECT_820AA0_RESULT_NEG1;
  }
  return rock768;
}

extern "C" void isaac_frame_effect_820aa0_entry_plan(
    IsaacFrameEffect820aa0Plan* out, uint32_t flags_1839c) {
  if (out == nullptr) {
    return;
  }
  out->deref_game = 1;   /* [0xc71678] @0x820aa0 */
  out->deref_1839c = 1;  /* test dword [g_Game+0x1839c],0x2000 @0x820aa5 */
  out->bit_gate = isaac_frame_effect_820aa0_bit_gate(flags_1839c);
  out->deref_768 = (out->bit_gate == 0) ? 1 : 0; /* fallback @0x820ab5 */
  out->host_calls = 0;   /* zero host calls in the body */
  out->pure_complete = 1; /* whole body translated */
}

static_assert(sizeof(IsaacFrameEffect820aa0Plan) == 24, "820aa0 plan size");
static_assert(offsetof(IsaacFrameEffect820aa0Plan, deref_game) == 0,
              "820aa0 plan deref_game");
static_assert(offsetof(IsaacFrameEffect820aa0Plan, deref_1839c) == 4,
              "820aa0 plan deref_1839c");
static_assert(offsetof(IsaacFrameEffect820aa0Plan, bit_gate) == 8,
              "820aa0 plan bit_gate");
static_assert(offsetof(IsaacFrameEffect820aa0Plan, deref_768) == 12,
              "820aa0 plan deref_768");
static_assert(offsetof(IsaacFrameEffect820aa0Plan, host_calls) == 16,
              "820aa0 plan host_calls");
static_assert(offsetof(IsaacFrameEffect820aa0Plan, pure_complete) == 20,
              "820aa0 plan pure_complete");

extern "C" int32_t isaac_frame_effect_820ac0_copy_gate(uint32_t dst,
                                                       uint32_t tmp) {
  /* PE 0x00820aeb/0x00820b52/0x00820bcc cmp dst,tmp ; je skip — FULL
     dword pointer inequality: the copy/rewrite runs iff dst != tmp
     (JIT-unreachable in practice, translated as the machine has it). */
  return (dst != tmp) ? 1 : 0;
}

extern "C" void isaac_frame_effect_820ac0_init_block_a(uint32_t out[11]) {
  /* PE 0x00820b36..0x00820b41 — the [this+0x72a4] default-init VALUE:
     1.0f x4 (0xbac7b0), 5.0f, 3.0f, 0.0f, 0.8f (0xbabe60), 0, 0, 0.
     The trailing zeros come from the zeroed stack locals
     [esp+0x2c..0x34]; the store itself stays stateful/host. */
  if (out == nullptr) {
    return;
  }
  const uint32_t block[11] = {
      ISAAC_FRAME_EFFECT_820AC0_ONE_BITS,
      ISAAC_FRAME_EFFECT_820AC0_ONE_BITS,
      ISAAC_FRAME_EFFECT_820AC0_ONE_BITS,
      ISAAC_FRAME_EFFECT_820AC0_ONE_BITS,
      ISAAC_FRAME_EFFECT_820AC0_BLOCK_A_D4,     /* 5.0f */
      ISAAC_FRAME_EFFECT_820AC0_THREE_BITS,     /* 3.0f */
      0u,
      ISAAC_FRAME_EFFECT_820AC0_EIGHT_TENTHS_BITS, /* 0.8f */
      0u,
      0u,
      0u};
  for (int i = 0; i < ISAAC_FRAME_EFFECT_820AC0_BLOCK_DWORDS; ++i) {
    out[i] = block[i];
  }
}

extern "C" void isaac_frame_effect_820ac0_init_block_b(uint32_t out[11]) {
  /* PE 0x00820b56..0x00820b61 — the [this+0x72d0] default-init VALUE:
     1.0f x4 (0xbac7b0), 3.0f, 1.8f, 0.0f, 0.8f (0xbabe50), 0, 0, 0. */
  if (out == nullptr) {
    return;
  }
  const uint32_t block[11] = {
      ISAAC_FRAME_EFFECT_820AC0_ONE_BITS,
      ISAAC_FRAME_EFFECT_820AC0_ONE_BITS,
      ISAAC_FRAME_EFFECT_820AC0_ONE_BITS,
      ISAAC_FRAME_EFFECT_820AC0_ONE_BITS,
      ISAAC_FRAME_EFFECT_820AC0_THREE_BITS,     /* 3.0f */
      ISAAC_FRAME_EFFECT_820AC0_BLOCK_B_D5,     /* 1.8f */
      0u,
      ISAAC_FRAME_EFFECT_820AC0_EIGHT_TENTHS_BITS, /* 0.8f */
      0u,
      0u,
      0u};
  for (int i = 0; i < ISAAC_FRAME_EFFECT_820AC0_BLOCK_DWORDS; ++i) {
    out[i] = block[i];
  }
}

extern "C" int32_t isaac_frame_effect_820ac0_loop_entry_open(
    uint32_t index) {
  /* PE 0x00820b70 cmp esi,0x1bf ; 0x00820b76 ja skip — UNSIGNED: the
     loop body runs iff index <=u 0x1bf. */
  return (index <= (uint32_t)ISAAC_FRAME_EFFECT_820AC0_BOUND_UNSIGNED) ? 1
                                                                       : 0;
}

extern "C" int32_t isaac_frame_effect_820ac0_loop_continue(
    int32_t index_next) {
  /* PE 0x00820bed cmp esi,0x1c0 ; 0x00820bf3 jl loop — SIGNED: the
     back-edge runs iff index_next < 0x1c0. */
  return (index_next < (int32_t)ISAAC_FRAME_EFFECT_820AC0_GRID_COUNT) ? 1
                                                                      : 0;
}

extern "C" int32_t isaac_frame_effect_820ac0_entry_nonzero(uint32_t p) {
  /* PE 0x00820b78 mov eax,[edi] ; 0x00820b7a test eax,eax ; je skip —
     FULL dword zero-test on the grid-cell pointer. */
  return (p != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_820ac0_kind_gate(uint32_t kind) {
  /* PE 0x00820b7e cmp dword [eax+4],0xe ; 0x00820b82 jne rewrite —
     FULL dword: equal opens the SpawnGridEntityDesc arm. */
  return (kind == (uint32_t)ISAAC_FRAME_EFFECT_820AC0_KIND_VALUE) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_820ac0_anim_skip(uint32_t anim) {
  /* PE 0x00820b84 cmp dword [eax+8],3 ; 0x00820b88 je skip — FULL
     dword: equal to 3 skips the host call. */
  return (anim == (uint32_t)ISAAC_FRAME_EFFECT_820AC0_ANIM_VALUE) ? 1 : 0;
}

extern "C" void isaac_frame_effect_820ac0_grid_pack(
    uint32_t d0, uint32_t d_c, uint32_t d_10, const uint32_t tail[4],
    uint32_t out[8]) {
  /* PE 0x00820b8e..0x00820ba5 — the 8 deterministic Desc dwords:
     [p+4], 3, [p+0xc], [p+0x10] then [p+0x14..0x23] (slot 1 FORCED 3,
     the [esp+0x14]=3 store @0x820b93). The machine leaves the
     +0x10..0x1f Desc window uninitialized and places the tail at
     +0x20 — reproduced, not corrected; the law covers the
     deterministic dwords only. */
  if (out == nullptr) {
    return;
  }
  out[0] = d0;
  out[1] = (uint32_t)ISAAC_FRAME_EFFECT_820AC0_PACK_SLOT1;
  out[2] = d_c;
  out[3] = d_10;
  for (int i = 0; i < 4; ++i) {
    out[4 + i] = (tail != nullptr) ? tail[i] : 0u;
  }
}

extern "C" void isaac_frame_effect_820ac0_entry_plan(
    IsaacFrameEffect820ac0Plan* out, uint32_t dst_a, uint32_t tmp_a,
    uint32_t dst_b, uint32_t tmp_b, uint32_t entry_ptr, uint32_t kind,
    uint32_t anim) {
  if (out == nullptr) {
    return;
  }
  out->init_a = 1;  /* [this+0x72a4] block A @0x820b36 */
  out->init_b = 1;  /* [this+0x72d0] block B @0x820b56 */
  out->copy_gate_a = isaac_frame_effect_820ac0_copy_gate(dst_a, tmp_a);
  out->copy_gate_b = isaac_frame_effect_820ac0_copy_gate(dst_b, tmp_b);
  out->entry_nonzero = isaac_frame_effect_820ac0_entry_nonzero(entry_ptr);
  out->kind_gate = isaac_frame_effect_820ac0_kind_gate(kind);
  out->anim_skip = isaac_frame_effect_820ac0_anim_skip(anim);
  out->rewrite_arm = (out->kind_gate == 0) ? 1 : 0;
  out->host_calls = 1; /* one site (0x7ebd50), <= 0x1c0 fires */
  out->pure_complete = 0; /* loop + host call stay host */
}

static_assert(sizeof(IsaacFrameEffect820ac0Plan) == 40, "820ac0 plan size");
static_assert(offsetof(IsaacFrameEffect820ac0Plan, init_a) == 0,
              "820ac0 plan init_a");
static_assert(offsetof(IsaacFrameEffect820ac0Plan, init_b) == 4,
              "820ac0 plan init_b");
static_assert(offsetof(IsaacFrameEffect820ac0Plan, copy_gate_a) == 8,
              "820ac0 plan copy_gate_a");
static_assert(offsetof(IsaacFrameEffect820ac0Plan, copy_gate_b) == 12,
              "820ac0 plan copy_gate_b");
static_assert(offsetof(IsaacFrameEffect820ac0Plan, entry_nonzero) == 16,
              "820ac0 plan entry_nonzero");
static_assert(offsetof(IsaacFrameEffect820ac0Plan, kind_gate) == 20,
              "820ac0 plan kind_gate");
static_assert(offsetof(IsaacFrameEffect820ac0Plan, anim_skip) == 24,
              "820ac0 plan anim_skip");
static_assert(offsetof(IsaacFrameEffect820ac0Plan, rewrite_arm) == 28,
              "820ac0 plan rewrite_arm");
static_assert(offsetof(IsaacFrameEffect820ac0Plan, host_calls) == 32,
              "820ac0 plan host_calls");
static_assert(offsetof(IsaacFrameEffect820ac0Plan, pure_complete) == 36,
              "820ac0 plan pure_complete");

/* ABI v33 — FUN_00820c00 (Lua Room::WorldToScreenPosition, straight-line
   f32 camera-to-screen math; census + full stream in the
   frame-effect-v33-820c00 NOTES dir: 60 insns / 296 B / 2 calls (BOTH
   0xaf0917, the IAT thunk `jmp [0xb18840]` = MSVCRT floor — HOST CRT
   primitive, caller-resolved like 820910's sqrt) / 0 direct-call stores
   beyond the out vector / 1 caller 0x5fde52 / 2 imm hits 0x86c96d +
   0x8912b5). The floor law boundary: `fld dword ; fstp qword [esp] ;
   call ; fstp dword` = f32->f64 exact, host floor on the f64, f64->f32
   RNE store — the laws consume the caller-resolved floored bits and
   never see the x87 lane. */

/* Portable uint32 -> float bitcast via the object representation
   (freestanding build: no <string.h>/<bit>). */
static float fe_820c00_bits_to_f32(uint32_t v) {
  float f;
  unsigned char* b = reinterpret_cast<unsigned char*>(&f);
  b[0] = static_cast<unsigned char>(v & 0xffu);
  b[1] = static_cast<unsigned char>((v >> 8) & 0xffu);
  b[2] = static_cast<unsigned char>((v >> 16) & 0xffu);
  b[3] = static_cast<unsigned char>((v >> 24) & 0xffu);
  return f;
}

extern "C" float isaac_frame_effect_820c00_zoom_mul(uint32_t a_bits,
                                                    uint32_t b_bits) {
  /* PE @0x820c2b mulss xmm3,[0xbf93e8] (movss load @0x820c23) —
     zoom = zoom_a * zoom_b, ONE f32 rounding; the two
     .data globals are NOT folded. */
  return fe_820c00_bits_to_f32(a_bits) * fe_820c00_bits_to_f32(b_bits);
}

extern "C" float isaac_frame_effect_820c00_cam_delta_x(
    uint32_t cam_x_bits) {
  /* PE 0x00820c06 movss xmm1,[0xc78dc4] ; 0x00820c0e subss
     xmm1,[0xbaab20] — cam_x - 338.0f, one f32 rounding. */
  return fe_820c00_bits_to_f32(cam_x_bits) -
         fe_820c00_bits_to_f32(ISAAC_FRAME_EFFECT_820C00_338_BITS);
}

extern "C" float isaac_frame_effect_820c00_cam_delta_y(
    uint32_t cam_y_bits) {
  /* PE 0x00820c81 movss xmm1,[0xc78edc] ; 0x00820c89 subss
     xmm1,[0xbaaa7c] — cam_y - 182.0f. */
  return fe_820c00_bits_to_f32(cam_y_bits) -
         fe_820c00_bits_to_f32(ISAAC_FRAME_EFFECT_820C00_182_BITS);
}

extern "C" float isaac_frame_effect_820c00_world_delta_x(
    uint32_t x_bits) {
  /* PE 0x00820c16 movss xmm0,[ebp+0xc] ; 0x00820c1b subss
     xmm0,[0xbaa950] — X - 60.0f. */
  return fe_820c00_bits_to_f32(x_bits) -
         fe_820c00_bits_to_f32(ISAAC_FRAME_EFFECT_820C00_60_BITS);
}

extern "C" float isaac_frame_effect_820c00_world_delta_y(
    uint32_t y_bits) {
  /* PE 0x00820c96 movss xmm0,[ebp+0x10] ; 0x00820c9b subss
     xmm0,[0xbaaa30] — Y - 140.0f. */
  return fe_820c00_bits_to_f32(y_bits) -
         fe_820c00_bits_to_f32(ISAAC_FRAME_EFFECT_820C00_140_BITS);
}

extern "C" float isaac_frame_effect_820c00_screen_lane(
    float cam_delta, float world_delta, float zoom) {
  /* PE 0x00820c34..0x00820c56 (X lane) / 0x00820ca3..0x00820cbc (Y
     lane, same shape): ((cam_delta*0.5f + world_delta*0.65f) * zoom)
     + 0.5f — THREE separate f32 roundings (mulss x2, addss, mulss,
     addss); the +0.5f is INSIDE the lane, BEFORE the floor call. */
  const float half_lane = fe_820c00_bits_to_f32(ISAAC_FRAME_EFFECT_820C00_HALF_BITS) *
                          cam_delta;                 /* mulss [0xbaa2d0] */
  const float sixtyfive_lane =
      fe_820c00_bits_to_f32(ISAAC_FRAME_EFFECT_820C00_065_BITS) *
      world_delta;                                   /* mulss [0xbaa324] */
  const float sum = half_lane + sixtyfive_lane;      /* addss */
  const float scaled = sum * zoom;                   /* mulss xmm3 */
  return scaled + fe_820c00_bits_to_f32(ISAAC_FRAME_EFFECT_820C00_HALF_BITS);
}

extern "C" float isaac_frame_effect_820c00_divide_zoom(
    uint32_t floored_bits, float zoom) {
  /* PE @0x820c7c divss xmm0,[ebp-4] (X lane; movss load @0x820c77,
     Y lane @0x820ce5) — the host
     floor result (0xaf0917 output, caller-resolved) divided by zoom,
     one f32 rounding; divss by +0.0f zoom yields +inf. */
  return fe_820c00_bits_to_f32(floored_bits) / zoom;
}

extern "C" float isaac_frame_effect_820c00_compose_x(
    float sx, uint32_t room_1204_bits, uint32_t game_2650c_bits) {
  /* PE 0x00820cf8 addss xmm1,[esi+0x1204] ; 0x00820d09 addss
     xmm1,[ecx+0x2650c] — TWO sequential f32 adds: (sx + Room+0x1204)
     then + Game+0x2650c (ecx = g_Game re-read @0x820cea). A folded
     single add would round differently. */
  float acc = sx + fe_820c00_bits_to_f32(room_1204_bits);
  acc = acc + fe_820c00_bits_to_f32(game_2650c_bits);
  return acc;
}

extern "C" float isaac_frame_effect_820c00_compose_y(
    float sy, uint32_t room_1208_bits, uint32_t game_26510_bits) {
  /* PE @0x820d11 addss xmm0,[ecx+0x26510] (room add @0x820d00) —
     (sy + Room+0x1208) then + Game+0x26510. */
  float acc = sy + fe_820c00_bits_to_f32(room_1208_bits);
  acc = acc + fe_820c00_bits_to_f32(game_26510_bits);
  return acc;
}

extern "C" void isaac_frame_effect_820c00_entry_plan(
    IsaacFrameEffect820c00Plan* out) {
  if (out == nullptr) {
    return;
  }
  out->x_floor = 1;       /* floor call in the X lane @0x820c69 */
  out->y_floor = 1;       /* floor call in the Y lane @0x820ccf */
  out->compose_game = 1;  /* g_Game read @0x820cea + the [+0x2650c]/
                             [+0x26510] adds @0x820d09/0x820d11 */
  out->host_calls = 2;    /* the floor thunk 0xaf0917, once per lane */
  out->pure_complete = 0; /* the CRT floor stays host */
}

static_assert(sizeof(IsaacFrameEffect820c00Plan) == 20, "820c00 plan size");
static_assert(offsetof(IsaacFrameEffect820c00Plan, x_floor) == 0,
              "820c00 plan x_floor");
static_assert(offsetof(IsaacFrameEffect820c00Plan, y_floor) == 4,
              "820c00 plan y_floor");
static_assert(offsetof(IsaacFrameEffect820c00Plan, compose_game) == 8,
              "820c00 plan compose_game");
static_assert(offsetof(IsaacFrameEffect820c00Plan, host_calls) == 12,
              "820c00 plan host_calls");
static_assert(offsetof(IsaacFrameEffect820c00Plan, pure_complete) == 16,
              "820c00 plan pure_complete");

/* ABI v34 — FUN_00820d30 type/subtype skip prefix (PE 0x820d6d..0x820df9).
   SEH/cookie/host tail not modelled. */

extern "C" int32_t isaac_frame_effect_820d30_type_gt_d8(uint32_t type) {
  /* v34: cmp eax,0xd8 ; jg — SIGNED */
  return ((int64_t)(int32_t)type > (int64_t)0xd8) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_820d30_table_skip(uint32_t type) {
  /* v34: type-0x13 <= 0x46 UNSIGNED then byte table 0 → skip */
  const uint32_t eax = type - 0x13u;
  if (eax > 0x46u) {
    return 0;
  }
  return (type == 0x13u || type == 0x1cu || type == 0x23u || type == 0x3eu ||
          type == 0x59u)
             ? 1
             : 0;
}

extern "C" int32_t isaac_frame_effect_820d30_skip_gate(uint32_t type,
                                                      uint32_t subtype) {
  /* v34: PE CFG 0x820d75..0x820df9 — skip=1 early epilogue */
  if (isaac_frame_effect_820d30_type_gt_d8(type) != 0) {
    if ((int64_t)(int32_t)type > (int64_t)0x38d) {
      if (type == 0x390u || type == 0x396u) {
        return 1;
      }
    } else if (type == 0x38du || type == 0xefu) {
      return 1;
    } else if (type == 0xf4u) {
      /* v34: type 0xf4 && subtype==2 → skip */
      if (subtype == 2u) {
        return 1;
      }
    } else if (type == 0x194u) {
      if (subtype == 1u) {
        return 1;
      }
      return 0;
    } else {
      /* fall L_de7 */
    }
  } else if (type == 0xd8u) {
    return 1;
  } else if (isaac_frame_effect_820d30_table_skip(type) != 0) {
    return 1;
  }
  /* L_de7 */
  if (type == 0x199u && subtype == 1u) {
    return 1;
  }
  return 0;
}

/* ABI v35 — FUN_00821940 LOW-BYTE store 0 at this+0x72a1, ret 4. */

extern "C" uint32_t isaac_frame_effect_821940_store_off(void) {
  return (uint32_t)ISAAC_FRAME_EFFECT_821940_STORE_OFF;
}

extern "C" uint32_t isaac_frame_effect_821940_store_value(void) {
  /* v35: mov byte imm 0 — LOW-BYTE, not a dword 0 */
  return (uint32_t)ISAAC_FRAME_EFFECT_821940_STORE_VALUE;
}

extern "C" uint32_t isaac_frame_effect_821940_ret_args(void) {
  return (uint32_t)ISAAC_FRAME_EFFECT_821940_RET_ARGS;
}

extern "C" uint32_t isaac_frame_effect_821940_apply_slot(uint32_t pre) {
  /* v35: mov byte [ecx+0x72a1],0 — zero bits 0..7 of the LE dword */
  return (pre & (uint32_t)ISAAC_FRAME_EFFECT_821940_SLOT_KEEP) |
         (uint32_t)ISAAC_FRAME_EFFECT_821940_STORE_VALUE;
}

/* ABI v36 — FUN_00822cf0 UNSIGNED index gate + slot addr; 0x4e45c0 stays host. */

extern "C" uint32_t isaac_frame_effect_822cf0_index_ok(uint32_t index) {
  /* v36: cmp eax,9 ; ja skip — UNSIGNED */
  return (index > (uint32_t)ISAAC_FRAME_EFFECT_822CF0_INDEX_MAX) ? 0u : 1u;
}

extern "C" uint32_t isaac_frame_effect_822cf0_needs_host(uint32_t index) {
  return isaac_frame_effect_822cf0_index_ok(index);
}

extern "C" uint32_t isaac_frame_effect_822cf0_slot_addr(uint32_t this_ptr,
                                                       uint32_t index) {
  /* v36: lea ecx,[ecx+eax*8] ; add ecx,0x7328 — 32-bit wrap */
  return this_ptr + (index << (uint32_t)ISAAC_FRAME_EFFECT_822CF0_SLOT_SHIFT) +
         (uint32_t)ISAAC_FRAME_EFFECT_822CF0_SLOT_OFF;
}

extern "C" uint32_t isaac_frame_effect_822cf0_ret_args(void) {
  return (uint32_t)ISAAC_FRAME_EFFECT_822CF0_RET_ARGS;
}

extern "C" uint32_t isaac_frame_effect_822cf0_host_va(void) {
  return (uint32_t)ISAAC_FRAME_EFFECT_822CF0_HOST_4E45C0_VA;
}

/* ABI v37 — FUN_00822d20 SIGNED in-bounds; 0x812e60 + 0x822cf0 stay host. */

extern "C" uint32_t isaac_frame_effect_822d20_in_bounds(uint32_t x, uint32_t y,
                                                       uint32_t width,
                                                       uint32_t height) {
  /* v37: test/js then cmp/jge — SIGNED on both axes */
  if ((int32_t)x < 0 || (int32_t)y < 0) {
    return 0u;
  }
  if ((int32_t)x >= (int32_t)width || (int32_t)y >= (int32_t)height) {
    return 0u;
  }
  return 1u;
}

extern "C" uint32_t isaac_frame_effect_822d20_needs_host(uint32_t x, uint32_t y,
                                                        uint32_t width,
                                                        uint32_t height) {
  return isaac_frame_effect_822d20_in_bounds(x, y, width, height);
}

extern "C" uint32_t isaac_frame_effect_822d20_ret_args(void) {
  return (uint32_t)ISAAC_FRAME_EFFECT_822D20_RET_ARGS;
}

extern "C" uint32_t isaac_frame_effect_822d20_host_812e60_va(void) {
  return (uint32_t)ISAAC_FRAME_EFFECT_822D20_HOST_812E60_VA;
}

extern "C" uint32_t isaac_frame_effect_822d20_host_822cf0_va(void) {
  return (uint32_t)ISAAC_FRAME_EFFECT_822CF0_VA;
}

/* ABI v38 — FUN_00820fd0 pure skip prefix (PE 0x00820ff3..0x0082100c).
   The rest of the giant stays host: first host call 0x683680 @0x82105b,
   Game float swap-back writes [g_Game+0x2650c]/[+0x26510] @0x82191c /
   0x821929. Both gates jump to the early epilogue 0x821931, which skips
   every one of those effects. */

extern "C" int32_t isaac_frame_effect_820fd0_gate_zero(uint32_t f_bits) {
  /* v38: comiss xmm0(0.0),[esi+0x7240]; jae 0x821931 — ORDERED 0.0f >= f */
  if ((f_bits & 0x7f800000u) == 0x7f800000u && (f_bits & 0x007fffffu) != 0u) {
    return 0; /* NaN is unordered — CF set, jae NOT taken */
  }
  /* v38: 0.0f >= f  <=>  f is +0.0 or the sign bit is set (-0.0 included) */
  return (f_bits == 0u || (f_bits & 0x80000000u) != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_820fd0_mgr_byte_zero(uint32_t mgr_byte) {
  /* v38: cmp byte ptr [eax+0x2a3c9],0; je 0x821931 — LOW-BYTE only.
     eax = [0xc7169c] @0x821000, no null check. */
  return ((mgr_byte & 0xffu) == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_820fd0_skip_gate(uint32_t f_bits,
                                                      uint32_t mgr_byte) {
  /* v38: either gate alone reaches the early epilogue 0x821931 */
  if (isaac_frame_effect_820fd0_gate_zero(f_bits) != 0) {
    return 1;
  }
  return isaac_frame_effect_820fd0_mgr_byte_zero(mgr_byte);
}

/* ABI v39 — FUN_00823370 law set (PE 0x00823370..0x00823539).
   Everything except the gated Level::HasAbandonedMineshaft predicate
   (0x74efd0 @0x8233c7, captured as pred_al) is pure f32/int math on the
   caller's out blob. Step-split locals keep one wasm f32 op per PE
   mulss/addss — no contraction. */

static float fe_823370_bits_to_f32(uint32_t v) {
  float f;
  unsigned char* b = reinterpret_cast<unsigned char*>(&f);
  b[0] = static_cast<unsigned char>(v & 0xffu);
  b[1] = static_cast<unsigned char>((v >> 8) & 0xffu);
  b[2] = static_cast<unsigned char>((v >> 16) & 0xffu);
  b[3] = static_cast<unsigned char>((v >> 24) & 0xffu);
  return f;
}

static uint32_t fe_823370_f32_to_bits(float f) {
  const unsigned char* b = reinterpret_cast<const unsigned char*>(&f);
  return (uint32_t)b[0] | ((uint32_t)b[1] << 8) | ((uint32_t)b[2] << 16) |
         ((uint32_t)b[3] << 24);
}

extern "C" int32_t isaac_frame_effect_823370_type_fast(uint32_t type8) {
  /* v39: cmp eax,7/8/0x1d ; je 0x8233e6 — FULL dword equality */
  const uint32_t t = type8;
  return (t == (uint32_t)ISAAC_FRAME_EFFECT_823370_TYPE_FAST_A ||
          t == (uint32_t)ISAAC_FRAME_EFFECT_823370_TYPE_FAST_B ||
          t == (uint32_t)ISAAC_FRAME_EFFECT_823370_TYPE_FAST_C)
             ? 1
             : 0;
}

extern "C" int32_t isaac_frame_effect_823370_lerp_arm(uint32_t fast,
                                                      uint32_t pred_al,
                                                      uint32_t flag1830c) {
  /* v39: je 0x8233e6 fast path; else test al,al @0x8233cc +
     cmp [Game+0x1830c],1 @0x8233d9 — both must hold */
  return (fast != 0u || (pred_al != 0u && flag1830c == 1u)) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_823370_flag_bit9(uint32_t flag) {
  /* v39: shr eax,9 @0x82347c ; test al,1 @0x82347f */
  return ((flag >> (uint32_t)ISAAC_FRAME_EFFECT_823370_FLAG_BIT9) & 1u) ? 1
                                                                        : 0;
}

extern "C" int32_t isaac_frame_effect_823370_grid_gate(uint32_t dim18,
                                                       uint32_t flag) {
  /* v39: cmp [edi+0x1d18],0x20 @0x823495 ; shr ecx,5 ; test cl,1
     @0x8234a2/0x8234a5 — both must hold */
  if (dim18 != (uint32_t)ISAAC_FRAME_EFFECT_823370_DIM_EXPECT) {
    return 0;
  }
  return ((flag >> (uint32_t)ISAAC_FRAME_EFFECT_823370_FLAG_BIT5) & 1u) ? 1
                                                                        : 0;
}

extern "C" uint32_t isaac_frame_effect_823370_lerp_const(uint32_t v_bits) {
  /* v39: subss(C454-v) @0x8233fc ; mulss(*C380) @0x823405 ;
     addss(+v) @0x82340d — three f32 roundings, machine order */
  const float v = fe_823370_bits_to_f32(v_bits);
  const float target =
      fe_823370_bits_to_f32((uint32_t)ISAAC_FRAME_EFFECT_823370_LERP_TARGET_BITS);
  const float factor =
      fe_823370_bits_to_f32((uint32_t)ISAAC_FRAME_EFFECT_823370_LERP_FACTOR_BITS);
  const float d = target - v;
  const float m = d * factor;
  return fe_823370_f32_to_bits(m + v);
}

extern "C" uint32_t isaac_frame_effect_823370_lerp_zero(uint32_t v_bits) {
  /* v39: xorps @0x8233ee/0x823459 ; subss(0-v) ; mulss(*C380) ;
     addss(+v) — slots +0xc and +0x10 ease toward zero */
  const float v = fe_823370_bits_to_f32(v_bits);
  const float factor =
      fe_823370_bits_to_f32((uint32_t)ISAAC_FRAME_EFFECT_823370_LERP_FACTOR_BITS);
  const float d = 0.0f - v;
  const float m = d * factor;
  return fe_823370_f32_to_bits(m + v);
}

extern "C" uint32_t isaac_frame_effect_823370_grid_scale(uint32_t raw54_bits,
                                                         uint32_t w,
                                                         uint32_t h,
                                                         uint32_t k_bits) {
  /* v39: sub 2 twice @0x8234b4/0x8234bc ; imul low32 @0x8234bf ;
     movd [edx+0x54] + cvtdq2ps @0x8234b7/0x8234c2 — the RAW dword is
     converted as an INT32 VALUE, not bit-reinterpreted ; divss
     @0x8234cc ; mulss [edi+0x7740] @0x8234d4 */
  const int32_t wi = (int32_t)w - (int32_t)ISAAC_FRAME_EFFECT_823370_GRID_SUB;
  const int32_t hi = (int32_t)h - (int32_t)ISAAC_FRAME_EFFECT_823370_GRID_SUB;
  const int32_t ni = wi * hi;
  const float num = (float)(int32_t)raw54_bits;
  const float den = (float)ni;
  const float q = num / den;
  const float k = fe_823370_bits_to_f32(k_bits);
  return fe_823370_f32_to_bits(q * k);
}

extern "C" void isaac_frame_effect_823370_apply_stage01(
    const uint32_t* src6, uint32_t* out6) {
  if (src6 == 0 || out6 == 0) {
    return;
  }
  const float target =
      fe_823370_bits_to_f32((uint32_t)ISAAC_FRAME_EFFECT_823370_LERP_TARGET_BITS);
  const float factor =
      fe_823370_bits_to_f32((uint32_t)ISAAC_FRAME_EFFECT_823370_LERP_FACTOR_BITS);
  /* slot order +0x0..+0x14; slots 3(+0xc) and 4(+0x10) ease toward 0.0f */
  for (uint32_t i = 0; i < (uint32_t)ISAAC_FRAME_EFFECT_823370_COPY_COUNT;
       ++i) {
    const float v = fe_823370_bits_to_f32(src6[i]);
    if (i == 3u || i == 4u) {
      const float dz = 0.0f - v;
      const float mz = dz * factor;
      out6[i] = fe_823370_f32_to_bits(mz + v);
    } else {
      const float dt = target - v;
      const float mt = dt * factor;
      out6[i] = fe_823370_f32_to_bits(mt + v);
    }
  }
}

extern "C" void isaac_frame_effect_823370_apply_a0a0(uint32_t* out6) {
  if (out6 == 0) {
    return;
  }
  /* v39: addss [esi+0x10], [0xbaa0a0] @0x823488 — one f32 add */
  const float add =
      fe_823370_bits_to_f32((uint32_t)ISAAC_FRAME_EFFECT_823370_ADD_A0A0_BITS);
  const float v = fe_823370_bits_to_f32(out6[4]);
  out6[4] = fe_823370_f32_to_bits(v + add);
}

extern "C" void isaac_frame_effect_823370_apply_grid(uint32_t* out6,
                                                     uint32_t scale_bits) {
  if (out6 == 0) {
    return;
  }
  const float s = fe_823370_bits_to_f32(scale_bits);
  const float k280 =
      fe_823370_bits_to_f32((uint32_t)ISAAC_FRAME_EFFECT_823370_K280_BITS);
  const float k198 =
      fe_823370_bits_to_f32((uint32_t)ISAAC_FRAME_EFFECT_823370_K198_BITS);
  const float k2b8 =
      fe_823370_bits_to_f32((uint32_t)ISAAC_FRAME_EFFECT_823370_K2B8_BITS);
  const float m280 = s * k280;
  const float m198 = s * k198;
  const float m2b8 = s * k2b8;
  /* PE store order 0x8234eb..0x82352c */
  const float v0 = fe_823370_bits_to_f32(out6[0]);
  out6[0] = fe_823370_f32_to_bits(v0 - s);
  const float v2 = fe_823370_bits_to_f32(out6[2]);
  out6[2] = fe_823370_f32_to_bits(m280 + v2);
  const float v1 = fe_823370_bits_to_f32(out6[1]);
  out6[1] = fe_823370_f32_to_bits(m280 + v1);
  const float v5 = fe_823370_bits_to_f32(out6[5]);
  out6[5] = fe_823370_f32_to_bits(m198 + v5);
  const float v3 = fe_823370_bits_to_f32(out6[3]);
  out6[3] = fe_823370_f32_to_bits(v3 - m2b8);
}

extern "C" void isaac_frame_effect_823370_entry_plan(
    IsaacFrameEffect823370Plan* out, uint32_t type8, uint32_t pred_al,
    uint32_t flag1830c, uint32_t dim18, uint32_t flag) {
  if (out == 0) {
    return;
  }
  out->copy_slots = (int32_t)ISAAC_FRAME_EFFECT_823370_COPY_COUNT;
  out->fast = isaac_frame_effect_823370_type_fast(type8);
  out->lerp_runs =
      isaac_frame_effect_823370_lerp_arm((uint32_t)out->fast, pred_al,
                                         flag1830c);
  out->add_a0a0 = isaac_frame_effect_823370_flag_bit9(flag);
  out->grid_path = isaac_frame_effect_823370_grid_gate(dim18, flag);
}

static_assert(offsetof(IsaacFrameEffect823370Plan, copy_slots) == 0, "823370 copy_slots");
static_assert(offsetof(IsaacFrameEffect823370Plan, fast) == 4, "823370 fast");
static_assert(offsetof(IsaacFrameEffect823370Plan, lerp_runs) == 8, "823370 lerp_runs");
static_assert(offsetof(IsaacFrameEffect823370Plan, add_a0a0) == 12, "823370 add_a0a0");
static_assert(offsetof(IsaacFrameEffect823370Plan, grid_path) == 16, "823370 grid_path");

/* ABI v40 — FUN_00823540 SetColorModifier wrapper law set
   (PE 0x00823540..0x00823586). The blob fill is the landed v39 easing
   helper 0x823370; the tail is host Game::SetColorModifier. */

extern "C" int32_t isaac_frame_effect_823540_flag_pair(uint32_t b183a0,
                                                       uint32_t b269e9) {
  /* v40: cmp byte [eax+0x183a0],0 @0x823557 ; jne al=0 ;
     cmp byte [eax+0x269e9],0 @0x823560 ; jne al=0 ; else mov al,1.
     Both compares inspect ONLY bits 0..7. */
  return ((b183a0 & 0xffu) == 0u && (b269e9 & 0xffu) == 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_frame_effect_823540_rate_bits(void) {
  /* v40: movss xmm3,[0xbaa078] @0x82356f — rate = 0.015f in xmm3 */
  return (uint32_t)ISAAC_FRAME_EFFECT_823540_RATE_BITS;
}

extern "C" uint32_t isaac_frame_effect_823540_host_va(void) {
  /* v40: call 0x7067c0 @0x82357d — Game::SetColorModifier(&slot,lerp) */
  return (uint32_t)ISAAC_FRAME_EFFECT_823540_HOST_7067C0_VA;
}

extern "C" uint32_t isaac_frame_effect_823540_blob_helper_va(void) {
  /* v40: call 0x823370 @0x82354d — v39 easing fills the local blob */
  return (uint32_t)ISAAC_FRAME_EFFECT_823540_BLOB_HELPER_VA;
}

extern "C" uint32_t isaac_frame_effect_823540_ret_bytes(void) {
  /* v40: plain `ret` @0x823585 — caller cleans the pushed args */
  return (uint32_t)ISAAC_FRAME_EFFECT_823540_RET_BYTES;
}

extern "C" void isaac_frame_effect_823540_entry_plan(
    IsaacFrameEffect823540Plan* out, uint32_t b183a0, uint32_t b269e9) {
  if (out == 0) {
    return;
  }
  out->blob_helper_calls = 1;
  out->lerp = isaac_frame_effect_823540_flag_pair(b183a0, b269e9);
  out->host_calls = 1; /* SetColorModifier runs on BOTH bool arms */
}

static_assert(offsetof(IsaacFrameEffect823540Plan, blob_helper_calls) == 0, "823540 blob_helper_calls");
static_assert(offsetof(IsaacFrameEffect823540Plan, lerp) == 4, "823540 lerp");
static_assert(offsetof(IsaacFrameEffect823540Plan, host_calls) == 8, "823540 host_calls");

/* ABI v41 (A) — FUN_008242d0 pure leaf. */

extern "C" int32_t isaac_frame_effect_8242d0_gate(uint32_t dim18,
                                                  uint32_t flag) {
  /* v41: cmp [ecx+0x1d18],0x20 @0x8242d0 ; mov eax,[ecx+4] ;
     mov eax,[eax+0x44] @0x8242dc ; shr eax,5 @0x8242df ;
     test al,1 @0x8242e2 — al=1 arm @0x8242e6, else xor al,al */
  if (dim18 != (uint32_t)ISAAC_FRAME_EFFECT_8242D0_DIM_EXPECT) {
    return 0;
  }
  return ((flag >> (uint32_t)ISAAC_FRAME_EFFECT_8242D0_FLAG_BIT5) & 1u)
             ? 1
             : 0;
}

/* ABI v41 (B) — FUN_00824800 pure prefix laws. */

extern "C" int32_t isaac_frame_effect_824800_count_gate(uint32_t count) {
  /* v41: cmp dword [esi+0x7454],0 ; jle 0x824a61 — SIGNED gate */
  return ((int32_t)count > 0) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_824800_gate_zero(uint32_t f_bits) {
  /* v41: comiss xmm0(0),xmm1(f) @0x824826 ; jae 0x824a61 — ORDERED.
     NaN raises CF → jae NOT taken → continue. */
  if ((f_bits & 0x7f800000u) == 0x7f800000u && (f_bits & 0x007fffffu) != 0u) {
    return 0; /* NaN unordered — continue into the body */
  }
  return (f_bits == 0u || (f_bits & 0x80000000u) != 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_frame_effect_824800_decay_apply(uint32_t f_bits) {
  /* v41: subss xmm1,[0xbaa08c](0.02f) @0x824838 ; maxss xmm1,xmm0(+0)
     @0x824840 ; store @0x824844 — maxss returns the SECOND operand
     (+0.0f) when the first is NaN. Two f32 roundings, machine order. */
  const float f = fe_823370_bits_to_f32(f_bits);
  const float decay =
      fe_823370_bits_to_f32((uint32_t)ISAAC_FRAME_EFFECT_824800_DECAY_BITS);
  const float d = f - decay;
  /* maxss returns the second operand (+0.0f) when the first is NaN */
  const uint32_t db = fe_823370_f32_to_bits(d);
  const float m = ((((db & 0x7f800000u) == 0x7f800000u) &&
                    ((db & 0x007fffffu) != 0u))
                       ? 0.0f
                       : ((d > 0.0f) ? d : 0.0f));
  return fe_823370_f32_to_bits(m);
}


extern "C" int32_t
isaac_frame_effect_824800_clamp_needs_host(uint32_t f_bits) {
  /* v41: movss xmm0,[0xbaa06c](0.01f) @0x82484c ; comiss xmm0,xmm1
     @0x824854 ; jbe 0x82486a @0x824857 — ordered 0.01f <= f continues
     into the host tail; below-threshold takes the zero-store-ret arm
     ([esi+0x7458] = 0 @0x824859, plain ret @0x824869).
     translated exactly as the machine has it. */
  const bool f_nan = ((f_bits & 0x7f800000u) == 0x7f800000u) &&
                     ((f_bits & 0x007fffffu) != 0u);
  if (f_nan) {
    return 1; /* unordered -> jbe TAKEN -> host tail */
  }
  const float thresh = fe_823370_bits_to_f32(
      (uint32_t)ISAAC_FRAME_EFFECT_824800_THRESH_BITS);
  const float f = fe_823370_bits_to_f32(f_bits);
  return (thresh <= f) ? 1 : 0;
}

/* ABI v42 — FUN_00824ee0 pure skip-gate peel (PE 0x00824ef6..0x00824f16).
   The giant (Room spawn-effect loop) stays host. */

extern "C" int32_t isaac_frame_effect_824ee0_ucomiss_ne(uint32_t x_bits,
                                                        uint32_t c_bits) {
  /* v42: ucomiss; lahf; test ah,0x44; jnp — jnp taken iff NOT
     ordered-equal. ucomiss equality: unordered -> not-equal (jnp),
     +0.0f == -0.0f -> EQUAL (jnp not taken). */
  const uint32_t x_exp = x_bits & 0x7f800000u;
  const uint32_t c_exp = c_bits & 0x7f800000u;
  const uint32_t x_man = x_bits & 0x007fffffu;
  const uint32_t c_man = c_bits & 0x007fffffu;
  const bool x_nan = (x_exp == 0x7f800000u) && (x_man != 0u);
  const bool c_nan = (c_exp == 0x7f800000u) && (c_man != 0u);
  if (x_nan || c_nan) {
    return 1; /* unordered — jnp taken */
  }
  /* value equality with +0/-0 folded together */
  return ((x_bits & 0x7fffffffu) == (c_bits & 0x7fffffffu)) ? 0 : 1;
}

extern "C" int32_t isaac_frame_effect_824ee0_skip_gate(uint32_t a_bits,
                                                       uint32_t b_bits) {
  /* v42: gate A @0x824ef6 (jp continue when a == C0) then gate B
     @0x824f0b (jnp 0x8253cd when b != C1) — skip needs BOTH ne. */
  if (isaac_frame_effect_824ee0_ucomiss_ne(
          a_bits, (uint32_t)ISAAC_FRAME_EFFECT_824EE0_C0_BITS) == 0) {
    return 0;
  }
  return isaac_frame_effect_824ee0_ucomiss_ne(
      b_bits, (uint32_t)ISAAC_FRAME_EFFECT_824EE0_C1_BITS);
}

/* ABI v43 — FUN_00825730 exact-ZHL Room::CanPickupGridEntity law set
   (PE 0x00825730..0x00825799, pure thiscall leaf). */

extern "C" int32_t isaac_frame_effect_825730_type_ok(uint32_t etype,
                                                     uint32_t sub_field) {
  /* v43: cmp chain {2,4,5,6,0x1a,0x16,0x1b} -> yes @0x825751..0x825772;
     type 0xc @0x825774: [e+0xc] <u 4 (jb) -> yes @0x825793;
     type 0xe @0x825785: [e+0xc] == 0x3e8 (pause field) -> no;
     anything else -> no. */
  const uint32_t t = etype;
  if (t == 2u || t == 4u || t == 5u || t == 6u || t == 0x1au ||
      t == 0x16u || t == 0x1bu) {
    return 1;
  }
  if (t == (uint32_t)ISAAC_FRAME_EFFECT_825730_TYPE_0C) {
    /* v43: cmp dword [ecx+0xc],4 ; jb 0x825793 — UNSIGNED */
    return (sub_field < (uint32_t)ISAAC_FRAME_EFFECT_825730_SUB_MIN) ? 1
                                                                     : 0;
  }
  if (t == (uint32_t)ISAAC_FRAME_EFFECT_825730_TYPE_0E) {
    /* v43: cmp dword [ecx+0xc],0x3e8 ; je al=0 — pause value blocks */
    return (sub_field ==
            (uint32_t)ISAAC_FRAME_EFFECT_825730_PAUSE_FIELD)
               ? 0
               : 1;
  }
  return 0;
}

extern "C" int32_t isaac_frame_effect_825730_gate(uint32_t idx,
                                                  uint32_t has_entity,
                                                  uint32_t flag_nonzero,
                                                  uint32_t etype,
                                                  uint32_t sub_field) {
  /* v43: idx >u 0x1bf (ja) @0x825738 ; entity null @0x825744 ;
     flag [e+0x3c]==0 @0x825748 — each -> al=0 */
  if (idx > (uint32_t)ISAAC_FRAME_EFFECT_825730_IDX_MAX) {
    return 0;
  }
  if (has_entity == 0u) {
    return 0;
  }
  if (flag_nonzero == 0u) {
    return 0;
  }
  return isaac_frame_effect_825730_type_ok(etype, sub_field);
}



/* ABI v44 — FUN_00827180 nearest-slot scan (PE 0x00827180..0x008271d7,
   `ret 4` @0x008271d5; pure thiscall leaf: 0 calls, no global writes,
   computed/virtual reach only). */

static_assert(offsetof(IsaacFrameEffect827180Slot, present) == 0,
              "827180 present");
static_assert(offsetof(IsaacFrameEffect827180Slot, px_bits) == 4,
              "827180 px");
static_assert(offsetof(IsaacFrameEffect827180Slot, py_bits) == 8,
              "827180 py");

extern "C" int32_t isaac_frame_effect_827180_dist_lt(uint32_t x_bits,
                                                     uint32_t y_bits,
                                                     uint32_t px_bits,
                                                     uint32_t py_bits,
                                                     uint32_t t_bits) {
  /* v44: xmm0=[esi+4]-[edx+0x340]; xmm1=[esi]-[edx+0x33c];
     xmm0*=xmm0; xmm1*=xmm1; xmm0+=xmm1 — sum = dy^2 + dx^2 with dy^2
     as the addss DEST. comiss T,sum ; ja: STRICT ORDERED T > sum —
     NaN never matches (unordered sets CF=ZF=PF=1, ja not taken) and
     equality does not match. Step-split locals keep one wasm f32 op
     per PE subss/mulss/addss. */
  const float x = fe_823370_bits_to_f32(x_bits);
  const float y = fe_823370_bits_to_f32(y_bits);
  const float px = fe_823370_bits_to_f32(px_bits);
  const float py = fe_823370_bits_to_f32(py_bits);
  const float t = fe_823370_bits_to_f32(t_bits);
  float dy = y - py;
  float dx = x - px;
  dy = dy * dy;
  dx = dx * dx;
  const float sum = dy + dx;
  return (t > sum) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_827180_nearest(
    uint32_t x_bits, uint32_t y_bits, uint32_t t_bits,
    const IsaacFrameEffect827180Slot* slots) {
  /* v44: 8 rows at [ecx+0x7744 + i*4]; null row skipped BEFORE any
     math (PE 0x827199 test edx,edx; je next); FIRST match returns i;
     exhausted -> or eax,-1. */
  for (uint32_t i = 0u;
       i < (uint32_t)ISAAC_FRAME_EFFECT_827180_SLOT_COUNT; ++i) {
    const IsaacFrameEffect827180Slot* s = &slots[i];
    if (s->present == 0u) {
      continue;
    }
    if (isaac_frame_effect_827180_dist_lt(x_bits, y_bits, s->px_bits,
                                          s->py_bits, t_bits) == 1) {
      return (int32_t)i;
    }
  }
  return (int32_t)(uint32_t)ISAAC_FRAME_EFFECT_827180_RET_NONE_BITS;
}

/* ABI v45 — FUN_008279c0 field+0x20 getter (PE 0x008279c0..0x008279cd,
   `ret` @0x008279cd; pure thiscall micro-leaf, 6 direct callers). */

extern "C" float isaac_frame_effect_8279c0_field20_sub30(
    uint32_t base_bits) {
  /* v45: movss xmm0,[ecx+0x20]; subss xmm0,[0xbaa8d0] (30.0f);
     ret. ONE f32 subtraction — step-split, no contraction. */
  return fe_823370_bits_to_f32(base_bits) - 30.0f;
}

/* ABI v46 — FUN_00827b70 special-quest-door window gate (PE
   0x00827b70..0x00827ba3, `ret` @0x00827ba3; frameless bool helper,
   host result captured as a parameter per the v39 precedent). */

extern "C" int32_t isaac_frame_effect_827b70_gate(uint32_t transition_mode,
                                                  uint32_t mode,
                                                  uint32_t stage,
                                                  int32_t host_bit1_set) {
  /* v46: cmp [Game+0x1830c],1 -> jne fail; mode [Game+4] in {4,5} ->
     else fail; stage [Game+0]==2 -> pass; stage != 1 -> fail; else
     pass iff host 0x748490 (ecx=Game) returned bit 1 of al set
     (test al,2). FULL-dword compares, PE order. */
  if (transition_mode != 1u) {
    return 0;
  }
  if (mode != 4u && mode != 5u) {
    return 0;
  }
  if (stage == 2u) {
    return 1;
  }
  if (stage != 1u) {
    return 0;
  }
  return (host_bit1_set != 0) ? 1 : 0;
}

/* ABI v47 — FUN_00827bb0 Room::HasCurseMist (PE 0x00827bb0..0x00827bbb,
   `ret` @0x00827bbb; pure thiscall micro-leaf, 1 direct caller). */

extern "C" int32_t isaac_frame_effect_827bb0_flag_bit13(
    uint32_t desc_flags) {
  /* v47: mov eax,[ecx+4]; mov eax,[eax+0x44]; shr eax,13; and al,1;
     ret. FULL-dword input; LOGICAL shift. */
  return (int32_t)((desc_flags >> 13u) & 1u);
}

/* ABI v48 — FUN_00827bc0 door-variant spawn window (PE
   0x00827bc0..0x00827be3, `ret` @0x00827be3; frameless predicate,
   host result captured as a parameter per the v39/v46 precedent). */

extern "C" int32_t isaac_frame_effect_827bc0_gate(uint32_t field8,
                                                  uint32_t desc_type10,
                                                  int32_t host_pass) {
  /* v48: cmp [ecx+8],5 -> jne fail; d = [[ecx+4]+0x10];
     cmp [d+0x10],0x59 -> jne fail; host 0x74ea50 (ecx=Game) test
     al,al -> pass iff set. FULL-dword compares, PE order. */
  if (field8 != 5u) {
    return 0;
  }
  if (desc_type10 != (uint32_t)ISAAC_FRAME_EFFECT_827BC0_TYPE_VALUE) {
    return 0;
  }
  return (host_pass != 0) ? 1 : 0;
}

/* ABI v49 — FUN_00829920 record move-copy (PE 0x00829920..0x008299da,
   `ret 4` @0x008299da; pure thiscall leaf, dst=ecx, src=[esp+4],
   returns eax=dst). First post-band pure body past the MSVC CRT
   container close. Zero calls; no SEH/GS/fs; no global writes. */

extern "C" int32_t isaac_frame_effect_829920_record_move(
    int32_t *dst, const int32_t *src) {
  /* v49: FULL PE store order — the dst zero-stores precede the
     movups/movq reloads, so self-move (dst == src) zeroes then
     re-reads. No memcpy: aliasing-visible order is part of the law. */
  if (dst == nullptr || src == nullptr) {
    return (int32_t)(uintptr_t)dst;
  }
  dst[0] = src[0];
  dst[1] = src[1];
  dst[2] = src[2];
  dst[3] = src[3];
  dst[4] = src[4];
  dst[5] = 0;  /* +0x14 dword zeroed before the reload below */
  dst[9] = 0;  /* +0x24 */
  dst[10] = 0; /* +0x28 */
  /* movups xmm0, [src+0x14]; movups [dst+0x14], xmm0 (16 B) */
  dst[5] = src[5];
  dst[6] = src[6];
  dst[7] = src[7];
  dst[8] = src[8];
  /* movq xmm0, [src+0x24]; movq [dst+0x24], xmm0 (8 B) */
  dst[9] = src[9];
  dst[10] = src[10];
  /* src SSO string reset: size = 0, cap = 0xf, buf[0] = 0 */
  ((int32_t *)src)[9] = 0;
  ((int32_t *)src)[10] =
      (int32_t)ISAAC_FRAME_EFFECT_829920_SSO_CAP_RESET;
  ((unsigned char *)src)[ISAAC_FRAME_EFFECT_829920_STRING_OFF] = 0;
  /* scalar POD tail: +0x2c..+0x40 dwords */
  dst[11] = src[11];
  dst[12] = src[12];
  dst[13] = src[13];
  dst[14] = src[14];
  dst[15] = src[15];
  dst[16] = src[16];
  /* word +0x44, bytes +0x46/+0x47 (one dword in PE, split stores) */
  ((uint16_t *)&dst[17])[0] = ((const uint16_t *)&src[17])[0];
  ((unsigned char *)&dst[17])[2] =
      ((const unsigned char *)&src[17])[2];
  ((unsigned char *)&dst[17])[3] =
      ((const unsigned char *)&src[17])[3];
  /* +0x48..+0x58 dwords */
  dst[18] = src[18];
  dst[19] = src[19];
  dst[20] = src[20];
  dst[21] = src[21];
  dst[22] = src[22];
  return (int32_t)(uintptr_t)dst;
}

/* ABI v50 — FUN_008299e0 signed-word pair strict-less (PE
   0x008299e0..0x00829a0b; pure frameless cdecl leaf; zero calls,
   zero callers-by-E8, one by-pointer raw ref @0x00429c39). */

extern "C" int32_t isaac_frame_effect_829a10_stage_mode_map(
    int32_t stage, int32_t mode, int32_t variant) {
  /* v51: FULL PE branch shape incl. the shared or-eax,-1 default
     and the redundant second stage {-1,12}/{13,26} re-tests (kept
     for machine-faithfulness). */
  int32_t result = -1;
  if (stage == -1 || stage == 12) {
    if (mode == 3) {
      return 0;
    }
    if (stage == -1 || stage == 12) {
      if (mode == 10) {
        result = mode - 6;
      }
      return result;
    }
  }
  if (stage == 6) {
    if (mode == -1 || mode == 14) {
      if (mode == -1) {
        return 1;
      }
      if (variant != 11) {
        return 3;
      }
      return 1;
    }
    if (mode == 6) {
      if (variant != 9) {
        return result;
      }
      return mode - 5;
    }
    if (mode == 7) {
      return 3;
    }
    return result;
  }
  if (stage == 19) {
    if (mode == -1 || mode == 14) {
      if (mode == -1) {
        return 5;
      }
      if (variant != 12) {
        return 7;
      }
      return 5;
    }
    if (mode == 6) {
      if (variant != 10) {
        return result;
      }
      return mode - 1;
    }
    if (mode == 7) {
      return 7;
    }
    return result;
  }
  if (stage == 13 || stage == 26) {
    if (mode == 3) {
      return mode - 1;
    }
    if (stage == 13 || stage == 26) {
      if (mode == 10) {
        return mode - 4;
      }
    }
  }
  return result;
}

extern "C" int32_t isaac_frame_effect_8299e0_pair_less(uint32_t a,
                                                       uint32_t b) {
  /* v50: cmp word[a+2],word[b+2] SIGNED jl -> true;
     jne -> false; else cmp word[a],word[b] SIGNED jl -> true;
     else false. movzx halves compared with 16-bit SIGNED jl. */
  int16_t a_hi = (int16_t)(a >> 16);
  int16_t b_hi = (int16_t)(b >> 16);
  if (a_hi < b_hi) {
    return 1;
  }
  if (a_hi != b_hi) {
    return 0;
  }
  return ((int16_t)a < (int16_t)b) ? 1 : 0;
}

/* ---- FUN_006fe2f0 player walk + room change tail (ABI v5) ---- */
/* ---- FUN_006fe2f0 player walk + room change tail (ABI v5) ---- */

static_assert(offsetof(IsaacFrameEffect6fe2f0Plan, initial_count) == 0, "6fe2f0 initial_count");
static_assert(offsetof(IsaacFrameEffect6fe2f0Plan, walk_entered) == 4, "6fe2f0 walk_entered");
static_assert(offsetof(IsaacFrameEffect6fe2f0Plan, host_walk_call) == 8, "6fe2f0 host_walk_call");
static_assert(offsetof(IsaacFrameEffect6fe2f0Plan, host_change_room) == 12, "6fe2f0 host_change_room");
static_assert(offsetof(IsaacFrameEffect6fe2f0Plan, host_802980) == 16, "6fe2f0 host_802980");
static_assert(offsetof(IsaacFrameEffect6fe2f0Plan, host_genrand) == 20, "6fe2f0 host_genrand");
static_assert(offsetof(IsaacFrameEffect6fe2f0Plan, host_7ebe20) == 24, "6fe2f0 host_7ebe20");
static_assert(offsetof(IsaacFrameEffect6fe2f0Plan, store_result) == 28, "6fe2f0 store_result");
static_assert(offsetof(IsaacFrameEffect6fe2f0Plan, pure_cf_ok) == 32, "6fe2f0 pure_cf_ok");
static_assert(offsetof(IsaacFrameEffect6fe2f0Plan, pure_complete) == 36, "6fe2f0 pure_complete");
static_assert(sizeof(IsaacFrameEffect6fe2f0Plan) == 40, "6fe2f0 plan size");

extern "C" int32_t isaac_frame_effect_6fe2f0_vector_count(uint32_t begin,
                                                           uint32_t end) {
  /* PE 0x006fe309: sub edx,ebx; sar edx,2 — signed arithmetic shift; the
     same law the FUN_006fdc10 walk uses. */
  return (int32_t)((int32_t)(uint32_t)(end - begin) >> 2);
}

extern "C" int32_t isaac_frame_effect_6fe2f0_walk_enter(int32_t count) {
  /* PE 0x006fe30e: test edx,edx; je tail — a zero-only test; negative
     counts fall through into the walk. */
  return (count != 0) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_6fe2f0_head_log_needed(int32_t count) {
  /* PE 0x006fe31b: test ecx,ecx; jne skip-log. */
  return (count == 0) ? 1 : 0;
}

extern "C" uint32_t isaac_frame_effect_6fe2f0_slot_addr_clamped(
    uint32_t begin, uint32_t count, uint32_t index) {
  /* PE 0x006fe33f: cmp esi,eax; jae skips `lea edx,[edx+esi*4]` — the base
     pointer survives, so an out-of-range index addresses element 0.
     Original defect, preserved; identical to the FUN_006fdc10 clamp. */
  if (index < count) {
    return (uint32_t)(begin + index * 4u);
  }
  return begin;
}

extern "C" int32_t isaac_frame_effect_6fe2f0_walk_continue(uint32_t index_next,
                                                            int32_t count) {
  /* PE 0x006fe365: cmp esi,ecx; jb — UNSIGNED over the signed sar result. */
  return (index_next < (uint32_t)count) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_6fe2f0_result_normalize(int32_t result) {
  /* PE 0x006fe3ab: cmp eax,-1; jne keep; mov [edi+0x1ad90],0. */
  return (result == -1) ? 0 : result;
}

extern "C" uint32_t isaac_frame_effect_6fe2f0_walk_from_samples(
    uint32_t* out_slots, uint8_t* out_flags, uint32_t out_len,
    const uint32_t* begins, const uint32_t* ends, uint32_t samples_len) {
  if (begins == nullptr || ends == nullptr || samples_len == 0u) {
    return 0u;
  }
  /* Prologue: count0 from sample 0; test/je skips the walk on zero only. */
  const int32_t count0 =
      isaac_frame_effect_6fe2f0_vector_count(begins[0], ends[0]);
  if (isaac_frame_effect_6fe2f0_walk_enter(count0) == 0) {
    return 0u;
  }
  uint32_t calls = 0u;
  uint32_t index = 0u;
  uint32_t k = 0u;
  for (;;) {
    /* Loop head re-derives the count from the bounds re-read after the
       previous call (sample k). The dead-in-practice empty log re-reads the
       same memory, so the base below is sample k's begin either way. */
    const int32_t head_count =
        isaac_frame_effect_6fe2f0_vector_count(begins[k], ends[k]);
    const int32_t log = isaac_frame_effect_6fe2f0_head_log_needed(head_count);
    const uint32_t slot = isaac_frame_effect_6fe2f0_slot_addr_clamped(
        begins[k], (uint32_t)isaac_frame_effect_6fe2f0_vector_count(
                       begins[k], ends[k]),
        index);
    const int32_t defect =
        (index < (uint32_t)isaac_frame_effect_6fe2f0_vector_count(
                     begins[k], ends[k]))
            ? 0
            : 1;
    if (calls < out_len) {
      if (out_slots != nullptr) {
        out_slots[calls] = slot;
      }
      if (out_flags != nullptr) {
        out_flags[calls] =
            (uint8_t)((defect != 0 ? 1u : 0u) | (log != 0 ? 2u : 0u));
      }
    }
    calls += 1u;
    /* FUN_007a6680 runs here; the host recaptures the bounds → sample k+1.
       Running out of samples stops the walk (the caller must sample). */
    k += 1u;
    if (k >= samples_len) {
      return calls;
    }
    index += 1u;
    const int32_t next_count =
        isaac_frame_effect_6fe2f0_vector_count(begins[k], ends[k]);
    if (isaac_frame_effect_6fe2f0_walk_continue(index, next_count) == 0) {
      return calls;
    }
  }
}

extern "C" void isaac_frame_effect_6fe2f0_entry_plan(
    IsaacFrameEffect6fe2f0Plan* out, uint32_t begin, uint32_t end) {
  if (out == nullptr) {
    return;
  }
  const int32_t count0 = isaac_frame_effect_6fe2f0_vector_count(begin, end);
  const int32_t entered = isaac_frame_effect_6fe2f0_walk_enter(count0);
  out->initial_count = count0;
  out->walk_entered = entered;
  out->host_walk_call = entered;
  out->host_change_room = 1;
  out->host_802980 = 1;
  out->host_genrand = 1;
  out->host_7ebe20 = 1;
  out->store_result = 1;
  out->pure_cf_ok = 1;
  out->pure_complete = 0;
}

/* ---- FUN_0085afb0 stage-record key builder (ABI v6) ---- */

static_assert(offsetof(IsaacFrameEffect85afb0Plan, sprintf_needed) == 0, "85afb0 sprintf_needed");
static_assert(offsetof(IsaacFrameEffect85afb0Plan, fmt_string_va) == 4, "85afb0 fmt_string_va");
static_assert(offsetof(IsaacFrameEffect85afb0Plan, host_sprintf) == 8, "85afb0 host_sprintf");
static_assert(offsetof(IsaacFrameEffect85afb0Plan, stale_buffer) == 12, "85afb0 stale_buffer");
static_assert(offsetof(IsaacFrameEffect85afb0Plan, host_assign) == 16, "85afb0 host_assign");
static_assert(offsetof(IsaacFrameEffect85afb0Plan, pure_cf_ok) == 20, "85afb0 pure_cf_ok");
static_assert(offsetof(IsaacFrameEffect85afb0Plan, pure_complete) == 24, "85afb0 pure_complete");
static_assert(sizeof(IsaacFrameEffect85afb0Plan) == 28, "85afb0 plan size");

extern "C" int32_t isaac_frame_effect_85afb0_sprintf_needed(uint32_t selector) {
  /* PE 0x0085afbd: cmp eax,3; ja 0x0085aff6 — unsigned; the jump table only
     dispatches at or below 3. */
  return (selector <= (uint32_t)ISAAC_FRAME_EFFECT_85AFB0_SELECTOR_MAX) ? 1
                                                                         : 0;
}

extern "C" uint32_t isaac_frame_effect_85afb0_fmt_va(uint32_t selector) {
  /* Jump table at 0x0085b034 = {0x0085afc9, 0x0085afd9, 0x0085afd1,
     0x0085afe1} — table-verified; the arms sit in a DIFFERENT textual
     order, so cases 1 and 2 cross. Compare chain by design: no linear-
     memory table for the helper itself. */
  if (selector == 0u) {
    return (uint32_t)ISAAC_FRAME_EFFECT_85AFB0_FMT_SCORES_SOLO_VA;
  }
  if (selector == 1u) {
    return (uint32_t)ISAAC_FRAME_EFFECT_85AFB0_FMT_TIMES_SOLO_VA;
  }
  if (selector == 2u) {
    return (uint32_t)ISAAC_FRAME_EFFECT_85AFB0_FMT_SCORES_COOP_VA;
  }
  if (selector == 3u) {
    return (uint32_t)ISAAC_FRAME_EFFECT_85AFB0_FMT_TIMES_COOP_VA;
  }
  return 0u;
}

extern "C" void isaac_frame_effect_85afb0_apply_init(uint32_t* buf_word0,
                                                     uint32_t* size_field,
                                                     uint32_t* cap_field,
                                                     uint8_t* first_byte) {
  /* PE 0x0085affb: mov dword [esi],0 — the whole first word, not one byte. */
  if (buf_word0 != nullptr) {
    *buf_word0 = 0u;
  }
  /* PE 0x0085b001 / 0x0085b008. */
  if (size_field != nullptr) {
    *size_field = 0u;
  }
  if (cap_field != nullptr) {
    *cap_field = (uint32_t)ISAAC_FRAME_EFFECT_85AFB0_INIT_CAPACITY;
  }
  /* PE 0x0085b00f: mov byte [esi],0 — re-clears the first byte last. */
  if (first_byte != nullptr) {
    *first_byte = 0u;
  }
}

extern "C" uint32_t isaac_frame_effect_85afb0_strlen(const uint8_t* s) {
  /* PE 0x0085b012…0x0085b01c: lea edx,[ecx+1]; mov al,[ecx]; inc ecx;
     test al,al; jne — counts to the NUL, terminator excluded. */
  if (s == nullptr) {
    return 0u;
  }
  uint32_t n = 0u;
  while (s[n] != 0u) {
    n += 1u;
  }
  return n;
}

extern "C" void isaac_frame_effect_85afb0_entry_plan(
    IsaacFrameEffect85afb0Plan* out, uint32_t selector) {
  if (out == nullptr) {
    return;
  }
  const int32_t wanted = isaac_frame_effect_85afb0_sprintf_needed(selector);
  out->sprintf_needed = wanted;
  out->fmt_string_va =
      (wanted != 0) ? isaac_frame_effect_85afb0_fmt_va(selector) : 0u;
  out->host_sprintf = wanted;
  out->stale_buffer = (wanted != 0) ? 0 : 1;
  out->host_assign = 1;
  out->pure_cf_ok = 1;
  out->pure_complete = 0;
}

/* ---- FUN_006fe3d0 Game::MoveToRandomRoom forwarder (ABI v7) ---- */

static_assert(offsetof(IsaacFrameEffect6fe3d0Plan, host_740860) == 0,
              "6fe3d0 plan host_740860");
static_assert(offsetof(IsaacFrameEffect6fe3d0Plan, pack_skips_specials) == 4,
              "6fe3d0 plan pack_skips_specials");
static_assert(offsetof(IsaacFrameEffect6fe3d0Plan, host_6fd7c0) == 8,
              "6fe3d0 plan host_6fd7c0");
static_assert(offsetof(IsaacFrameEffect6fe3d0Plan, seed_store) == 12,
              "6fe3d0 plan seed_store");
static_assert(offsetof(IsaacFrameEffect6fe3d0Plan, seed_store_first) == 16,
              "6fe3d0 plan seed_store_first");
static_assert(offsetof(IsaacFrameEffect6fe3d0Plan, error_forwarded) == 20,
              "6fe3d0 plan error_forwarded");
static_assert(offsetof(IsaacFrameEffect6fe3d0Plan, seed_forwarded) == 24,
              "6fe3d0 plan seed_forwarded");
static_assert(offsetof(IsaacFrameEffect6fe3d0Plan, room_from_host) == 28,
              "6fe3d0 plan room_from_host");
static_assert(offsetof(IsaacFrameEffect6fe3d0Plan, arg2_const) == 32,
              "6fe3d0 plan arg2_const");
static_assert(offsetof(IsaacFrameEffect6fe3d0Plan, anim_const) == 36,
              "6fe3d0 plan anim_const");
static_assert(offsetof(IsaacFrameEffect6fe3d0Plan, player_forwarded) == 40,
              "6fe3d0 plan player_forwarded");
static_assert(offsetof(IsaacFrameEffect6fe3d0Plan, dim_const) == 44,
              "6fe3d0 plan dim_const");
static_assert(offsetof(IsaacFrameEffect6fe3d0Plan, pure_cf_ok) == 48,
              "6fe3d0 plan pure_cf_ok");
static_assert(offsetof(IsaacFrameEffect6fe3d0Plan, pure_complete) == 52,
              "6fe3d0 plan pure_complete");
static_assert(sizeof(IsaacFrameEffect6fe3d0Plan) == 56,
              "6fe3d0 plan size");

extern "C" uint32_t isaac_frame_effect_6fe3d0_game_global_va(void) {
  /* PE 0x006fe3d7: mov eax, dword ptr [0xc71678]. */
  return (uint32_t)ISAAC_FRAME_EFFECT_GAME_GLOBAL_VA;
}

extern "C" uint32_t isaac_frame_effect_6fe3d0_seed_offset(void) {
  /* PE 0x006fe3e4: dword ptr [eax + 0x18318]. */
  return (uint32_t)ISAAC_FRAME_EFFECT_6FE3D0_SEED_OFF;
}

extern "C" int32_t isaac_frame_effect_6fe3d0_seed_value(void) {
  /* PE 0x006fe3e4: 0xffffffff. */
  return ISAAC_FRAME_EFFECT_6FE3D0_SEED_VALUE;
}

extern "C" void isaac_frame_effect_6fe3d0_apply_seed(uint8_t* game_ptr) {
  /* PE 0x006fe3e4: mov dword ptr [eax + 0x18318], 0xffffffff — a full dword
     store through the g_Game read, executed before the pack call. */
  if (game_ptr == nullptr) {
    return;
  }
  *(int32_t*)(game_ptr + (uint32_t)ISAAC_FRAME_EFFECT_6FE3D0_SEED_OFF) =
      ISAAC_FRAME_EFFECT_6FE3D0_SEED_VALUE;
}

extern "C" int32_t isaac_frame_effect_6fe3d0_pack_skips_specials(
    uint32_t i_am_error_room) {
  /* PE 0x007408b2 (host pack body): cmp byte ptr [ebp+8],0; je 0x740951
     — the special candidates (-2/-6) are skipped when the LOW BYTE of the
     caller's bool is zero. A full-word test would disagree for 0x100+. */
  return ((i_am_error_room & 0xffu) == 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_frame_effect_6fe3d0_shell_args(int32_t* out_args,
                                                         uint32_t len,
                                                         int32_t room_from_host,
                                                         uint32_t player) {
  /* PE pushes in chronological order: -1 (dim, 0x006fe3dd), [ebp+0x10]
     (player, 0x006fe3df), 3 (anim, 0x006fe3ee), -1 (arg2, 0x006fe3f0),
     then the pack result (push eax, 0x006fe3fd) becomes the FIRST shell
     argument. Callee order: room, arg2, anim, player, dim. */
  const int32_t args[ISAAC_FRAME_EFFECT_6FE3D0_SHELL_ARG_COUNT] = {
      room_from_host,
      ISAAC_FRAME_EFFECT_6FE3D0_SHELL_ARG2,
      ISAAC_FRAME_EFFECT_6FE3D0_SHELL_ANIM,
      (int32_t)player,
      ISAAC_FRAME_EFFECT_6FE3D0_SHELL_DIM};
  if (out_args != nullptr) {
    uint32_t n = len;
    if (n > (uint32_t)ISAAC_FRAME_EFFECT_6FE3D0_SHELL_ARG_COUNT) {
      n = (uint32_t)ISAAC_FRAME_EFFECT_6FE3D0_SHELL_ARG_COUNT;
    }
    for (uint32_t i = 0u; i < n; ++i) {
      out_args[i] = args[i];
    }
  }
  return (uint32_t)ISAAC_FRAME_EFFECT_6FE3D0_SHELL_ARG_COUNT;
}

extern "C" void isaac_frame_effect_6fe3d0_entry_plan(
    IsaacFrameEffect6fe3d0Plan* out,
    uint32_t i_am_error_room,
    int32_t seed,
    uint32_t player) {
  if (out == nullptr) {
    return;
  }
  out->host_740860 = 1; /* GetRandomRoomIndex-shaped host call */
  out->pack_skips_specials =
      isaac_frame_effect_6fe3d0_pack_skips_specials(i_am_error_room);
  out->host_6fd7c0 = 1; /* the shell tail-call */
  out->seed_store = 1;
  out->seed_store_first = 1; /* PE order: store precedes the pack call */
  out->error_forwarded = 1;  /* [ebp+8] reaches the pack as its arg0 */
  out->seed_forwarded = 1;   /* [ebp+0xc] reaches the pack as its arg1 */
  out->room_from_host = 1;   /* the shell room is the host pack result */
  out->arg2_const = 1;
  out->anim_const = 1;
  out->player_forwarded = 1;
  out->dim_const = 1;
  out->pure_cf_ok = 1;
  out->pure_complete = 0; /* pack and shell stay host */
  /* seed/player are mirrored inputs of the machine signature; the plan
     only flags their forwarding (the values themselves go to the host). */
  (void)seed;
  (void)player;
}

/* ---- ABI v8: FrameEffect_6fd7c0 special tail, SFX pack, position search ----
   Everything below was transcribed branch-by-branch from a linear decode of
   0x006fd7c0…0x006fdbfd (capstone 5.0.7, CS_MODE_32, 0 resyncs from the
   function start), not from a decompiler body. */

namespace {

inline float bits_to_f32(uint32_t bits) {
  return __builtin_bit_cast(float, bits);
}

}  // namespace

extern "C" uint32_t isaac_frame_effect_6fd7c0_sfx_play_args(uint32_t* out_args,
                                                            uint32_t len,
                                                            int32_t sfx_id) {
  /* 0x006fd83a sub esp,8            ; pitch / pan slots
     0x006fd83d mov [esp+4],0        ; pan  = 0
     0x006fd845 mov [esp],0x3f800000 ; pitch= 1.0f
     0x006fd84c push 0               ; loop = 0
     0x006fd84e push 2               ; frame delay = 2
     0x006fd850 push ecx             ; reservation only …
     0x006fd851 mov [esp],0x3f800000 ; … immediately overwritten with volume
     0x006fd85e push [ebp+0x14]      ; id (post-remap, re-read from the slot)
     0x006fd861 call 0x0092dc30 */
  const uint32_t packed[ISAAC_FRAME_EFFECT_SFX_PLAY_ARG_COUNT] = {
      (uint32_t)sfx_id,
      (uint32_t)ISAAC_FRAME_EFFECT_SFX_PLAY_VOLUME_BITS,
      (uint32_t)ISAAC_FRAME_EFFECT_SFX_PLAY_FRAME_DELAY,
      (uint32_t)ISAAC_FRAME_EFFECT_SFX_PLAY_LOOP,
      (uint32_t)ISAAC_FRAME_EFFECT_SFX_PLAY_PITCH_BITS,
      (uint32_t)ISAAC_FRAME_EFFECT_SFX_PLAY_PAN_BITS,
  };
  if (out_args != nullptr) {
    uint32_t n = len;
    if (n > (uint32_t)ISAAC_FRAME_EFFECT_SFX_PLAY_ARG_COUNT) {
      n = (uint32_t)ISAAC_FRAME_EFFECT_SFX_PLAY_ARG_COUNT;
    }
    for (uint32_t i = 0u; i < n; ++i) {
      out_args[i] = packed[i];
    }
  }
  return (uint32_t)ISAAC_FRAME_EFFECT_SFX_PLAY_ARG_COUNT;
}

extern "C" uint32_t isaac_frame_effect_6fd7c0_sfx_base_global_va(void) {
  /* 0x006fd82c mov esi, dword ptr [0x00c7169c] — distinct from the g_Game
     global this same body reads at 0x006fd8a7 / 0x006fd912 / 0x006fd9e1. */
  return (uint32_t)ISAAC_FRAME_EFFECT_SFX_BASE_GLOBAL_VA;
}

extern "C" int32_t isaac_frame_effect_6fd7c0_sfx_manager_off(void) {
  /* 0x006fd858 lea ecx, [esi + 0x2a324] — the SFXManager receiver
     displacement shared by BOTH sound paths (mode-4 seed 0xbb at 0x006fd825
     and the anim-0xc special seed 0xd7 at 0x006fd8e4 jump to 0x006fd82c,
     the same receiver build). esi is the 0x00c7169c global load. */
  return ISAAC_FRAME_EFFECT_SFX_MANAGER_OFF;
}

extern "C" uint32_t isaac_frame_effect_6fd7c0_sfx_manager_receiver(
    uint32_t base) {
  /* 0x006fd858 lea ecx, [esi + 0x2a324] — 32-bit wrap add of the manager
     offset onto the SFX-base global load. */
  return base + (uint32_t)ISAAC_FRAME_EFFECT_SFX_MANAGER_OFF;
}

extern "C" void isaac_frame_effect_6fd7c0_special_tail_plan(
    IsaacFrameEffect6fd7c0SpecialTailPlan* out, uint32_t player) {
  if (out == nullptr) {
    return;
  }
  /* 0x006fd8c1 mov ecx,[ebp-0x10]; push 0; push 6; push 0; call 0x006fdc10
     0x006fd8cf mov ecx,[ebp+0x14]; test ecx,ecx; je 0x006fdbec */
  const int32_t null_player = (player == 0u) ? 1 : 0;
  out->host_6fdc10 = 1;
  out->player_null_return = null_player;
  out->host_7abe20 = null_player != 0 ? 0 : 1;
  out->sfx_seed =
      null_player != 0 ? 0 : (int32_t)ISAAC_FRAME_EFFECT_SFX_SEED_SPECIAL;
  out->host_956780 = out->host_7abe20;
  out->host_sfx_play = out->host_7abe20;
  /* 0x006fdbec is the epilogue AFTER the 0x00a112c0 call at 0x006fdbe4. */
  out->host_log = 0;
  /* Both sub-branches return: the null player through 0x006fdbec, the
     present player through the shared SFX epilogue at 0x006fd866. */
  out->reaches_engine = 0;
  out->applies_terminals = 0;
  out->host_705ee0 = 0;
  out->host_blue_room = 0;
  out->pure_cf_ok = 1;
  out->pure_complete = 0;
}

extern "C" int32_t isaac_frame_effect_6fd7c0_probe_blocks(
    int32_t mode, int32_t ent_type, uint32_t ent_flags_168,
    uint32_t ent_flags_438) {
  int32_t check_168 = 0;
  /* 0x006fd9f5 cmp eax,2; jl 0x006fda02 — SIGNED mode test. */
  if (mode >= (int32_t)ISAAC_FRAME_EFFECT_SEARCH_MODE_MIN) {
    /* 0x006fd9fa mov ecx,[edx+0x28]; cmp ecx,1; je 0x006fda0f */
    if (ent_type == (int32_t)ISAAC_FRAME_EFFECT_SEARCH_TYPE_SHORTCUT) {
      check_168 = 1;
    }
  }
  if (check_168 == 0) {
    /* 0x006fda05 lea eax,[ecx-0xa]; cmp eax,0x3dd; ja 0x006fda1f
       — UNSIGNED window test on the biased type. */
    const uint32_t biased =
        (uint32_t)ent_type - (uint32_t)ISAAC_FRAME_EFFECT_SEARCH_TYPE_RANGE_BIAS;
    if (biased <= (uint32_t)ISAAC_FRAME_EFFECT_SEARCH_TYPE_RANGE_MAX) {
      check_168 = 1;
    }
  }
  if (check_168 != 0) {
    /* 0x006fda0f and eax,0x20000000; or eax,0; je BLOCKED. The `or eax,0`
       only re-sets the flags; it does not change the value. */
    if ((ent_flags_168 & (uint32_t)ISAAC_FRAME_EFFECT_SEARCH_ENT_MASK_168) ==
        0u) {
      return 1;
    }
    /* Set bit falls THROUGH into the type-9 test below. */
  }
  /* 0x006fda1f cmp ecx,9; jne next-entity */
  if (ent_type != (int32_t)ISAAC_FRAME_EFFECT_SEARCH_TYPE_FLAGGED) {
    return 0;
  }
  /* 0x006fda24 and eax,0x80000000; or eax,0; je BLOCKED */
  if ((ent_flags_438 & (uint32_t)ISAAC_FRAME_EFFECT_SEARCH_ENT_MASK_438) == 0u) {
    return 1;
  }
  return 0;
}

extern "C" int32_t isaac_frame_effect_6fd7c0_free_inline_needed(
    uint32_t query_flag) {
  /* 0x006fda3e cmp byte ptr [ebp-0x30],0; jne skip. Re-narrowed here on
     purpose: the parameter is 32-bit so the Wasm ABI cannot hide a value
     above 0xff (AGENTS.md uint8_t defect). */
  return ((query_flag & 0xffu) == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_6fd7c0_search_attempt_limit(void) {
  return (int32_t)ISAAC_FRAME_EFFECT_SEARCH_ATTEMPT_LIMIT;
}

extern "C" int32_t isaac_frame_effect_6fd7c0_search_continue(
    int32_t next_attempt) {
  /* 0x006fda6f cmp eax,0x32; jl loop — SIGNED. */
  return (next_attempt < (int32_t)ISAAC_FRAME_EFFECT_SEARCH_ATTEMPT_LIMIT) ? 1
                                                                          : 0;
}

extern "C" uint32_t isaac_frame_effect_6fd7c0_position_search(
    IsaacFrameEffect6fd7c0SearchResult* out,
    uint32_t orig_x_bits,
    uint32_t orig_y_bits,
    int32_t timer_in,
    const IsaacFrameEffect6fd7c0SearchSample* samples,
    uint32_t samples_len,
    const IsaacFrameEffect6fd7c0SearchEntity* entities,
    uint32_t entities_len) {
  /* 0x006fd934/0x006fd93a: the ORIGINAL position is read ONCE, before the
     loop. The back-edge is 0x006fd946, so it is never re-read. */
  uint32_t cur_x = orig_x_bits;
  uint32_t cur_y = orig_y_bits;
  int32_t attempts = 0;
  int32_t host_capsule = 0;
  int32_t host_query = 0;
  int32_t host_free_inline = 0;
  int32_t host_dtor = 0;
  int32_t accepted = 0;
  int32_t accept_attempt = -1;
  int32_t exhausted = 0;
  int32_t samples_exhausted = 0;
  int32_t from_candidate = 0;

  if (samples == nullptr || samples_len == 0u) {
    samples_exhausted = 1;
  } else {
    int32_t attempt = 0; /* [ebp+0x18], initialised to 0 at 0x006fd92d */
    for (;;) {
      if ((uint32_t)attempt >= samples_len) {
        samples_exhausted = 1;
        break;
      }
      const IsaacFrameEffect6fd7c0SearchSample s = samples[attempt];
      attempts += 1; /* FUN_0081e9d0 at 0x006fd958 */

      /* 0x006fd960/0x006fd973: player+0x370 and room+0x20 are re-read AFTER
         the candidate call, so the limit is re-derived every attempt. */
      const float limit = isaac_frame_effect_6fd7c0_camera_limit(
          bits_to_f32(s.room_20_bits), bits_to_f32(s.player_370_bits));
      /* 0x006fd98c comiss xmm1,xmm0; jae next-attempt (unordered continues). */
      if (isaac_frame_effect_6fd7c0_camera_probe_continue(
              bits_to_f32(s.cand_y_bits), limit) != 0) {
        /* 0x006fd995 addss xmm2,40.0 — the capsule size argument. */
        (void)isaac_frame_effect_6fd7c0_camera_bias(
            bits_to_f32(s.player_370_bits));
        host_capsule += 1; /* Capsule::constructor at 0x006fd9b1 */
        host_query += 1;   /* FUN_0041ab50 at 0x006fd9cf */

        /* 0x006fd9d4 mov ebx,[ebp-0x24] — the count is read once per
           attempt and folded across the inner scan. */
        const int32_t count = s.query_count;
        int32_t blocked = 0;
        int32_t ran_out = 0;
        if (count == 0) {
          /* 0x006fd9d9 test ebx,ebx; je ACCEPT */
        } else {
          /* 0x006fd9e9: the mode is sampled AFTER the query, once. */
          const int32_t mode = s.mode;
          int32_t j = 0;
          for (;;) {
            const int64_t row = (int64_t)s.query_first + (int64_t)j;
            if (entities == nullptr || row < 0 ||
                (uint64_t)row >= (uint64_t)entities_len) {
              ran_out = 1;
              break;
            }
            const IsaacFrameEffect6fd7c0SearchEntity e =
                entities[(uint32_t)row];
            if (isaac_frame_effect_6fd7c0_probe_blocks(mode, e.type,
                                                       e.flags_168,
                                                       e.flags_438) != 0) {
              blocked = 1;
              break;
            }
            /* 0x006fda34 inc esi; cmp esi,ebx; jae ACCEPT — UNSIGNED over
               the folded count, so a negative count scans indefinitely. */
            j += 1;
            if ((uint32_t)j >= (uint32_t)count) {
              break;
            }
          }
        }
        if (ran_out != 0) {
          samples_exhausted = 1;
          break;
        }
        if (blocked == 0) {
          /* 0x006fda7d: adopt the candidate with raw movss copies, then
             0x006fda94 destroys the query vector. */
          cur_x = s.cand_x_bits;
          cur_y = s.cand_y_bits;
          from_candidate = 1;
          accepted = 1;
          accept_attempt = attempt;
          host_dtor += 1;
          break;
        }
        /* 0x006fda3e: the inline free is conditional on the flag byte. */
        if (isaac_frame_effect_6fd7c0_free_inline_needed(
                (uint32_t)s.query_flag) != 0) {
          host_free_inline += 1; /* FUN_00a648b0 at 0x006fda53 */
        }
      }
      /* 0x006fda68 inc; 0x006fda6f cmp eax,0x32; jl loop */
      attempt += 1;
      if (isaac_frame_effect_6fd7c0_search_continue(attempt) == 0) {
        /* 0x006fda78 jmp 0x006fda99 — the ORIGINAL snapshot is kept and the
           query-vector destructor is NOT run. Reproduced, not repaired. */
        exhausted = 1;
        break;
      }
    }
  }

  int32_t timer_out = timer_in;
  isaac_frame_effect_6fd7c0_player_timer_floor_3c(&timer_out);

  if (out != nullptr) {
    out->attempts = attempts;
    out->host_capsule = host_capsule;
    out->host_query = host_query;
    out->host_free_inline = host_free_inline;
    out->host_dtor = host_dtor;
    out->accepted = accepted;
    out->accept_attempt = accept_attempt;
    out->exhausted = exhausted;
    out->samples_exhausted = samples_exhausted;
    out->out_x_bits = cur_x;
    out->out_y_bits = cur_y;
    out->from_candidate = from_candidate;
    out->host_set_position = 1; /* 0x006fdaa3, always reached */
    out->timer_out = timer_out;
  }
  return (uint32_t)attempts;
}

extern "C" void isaac_frame_effect_6fd7c0_player_branch_plan(
    IsaacFrameEffect6fd7c0PlayerBranchPlan* out, uint32_t player, uint32_t anim,
    uint32_t gate_result) {
  if (out == nullptr) {
    return;
  }
  /* 0x006fd8fa cmp dword [ebp+0x14],0; je null-player shell — FULL word. */
  const int32_t present = isaac_frame_effect_6fd7c0_player_present(player);
  /* 0x006fd904 cmp edi,3; je / 0x006fd909 cmp edi,0xc; jne */
  const int32_t gate = isaac_frame_effect_6fd7c0_player_anim_gate(anim);
  /* 0x006fd922 test al,al; je 0x006fdad2 — LOW BYTE of the host result. */
  const int32_t gate_open = ((gate_result & 0xffu) != 0u) ? 1 : 0;
  const int32_t reaches = (present != 0 && gate != 0) ? 1 : 0;
  out->player_present = present;
  out->anim_gate = gate;
  out->host_8279a0 = reaches;
  out->runs_search = (reaches != 0 && gate_open != 0) ? 1 : 0;
  out->falls_to_room_type = (reaches != 0 && gate_open == 0) ? 1 : 0;
  /* The search path ends at its own epilogue (0x006fdacf), so it never
     reaches the room-transition engine. */
  out->reaches_engine = 0;
  out->pure_cf_ok = 1;
  out->pure_complete = 0;
}

/* ---- FUN_008279a0 room-config gate (ABI v9) ----
   0x008279a0…0x008279ba, 12 instructions / 27 bytes, thiscall, ZERO calls.
   `cfg_ptr` is the value the machine loaded from [[Room+4]+0x10]; the two
   dereferences are the caller's because this translation cannot walk guest
   memory. No null guard is invented for the descriptor — the PE has none. */

/* Shared arm selection so the three exports cannot drift apart. */
static int32_t frame_effect_8279a0_arm(uint32_t cfg_ptr,
                                       int32_t cfg_field_8,
                                       int32_t cfg_field_0) {
  /* 0x008279a6 test eax,eax; 0x008279a8 je 0x008279b8 — FULL 32-bit word. */
  if (cfg_ptr == 0u) {
    return ISAAC_FRAME_EFFECT_8279A0_EXIT_NULL_CFG;
  }
  /* 0x008279aa cmp dword ptr [eax+8],0x10 — DWORD load, imm8 sign-extended
     to 0x00000010; 0x008279ae jne 0x008279b8. */
  if (cfg_field_8 != (int32_t)ISAAC_FRAME_EFFECT_8279A0_FIELD8_VALUE) {
    return ISAAC_FRAME_EFFECT_8279A0_EXIT_FIELD8;
  }
  /* 0x008279b0 cmp dword ptr [eax],0x23 — DWORD load, imm8 sign-extended
     to 0x00000023; 0x008279b3 jne 0x008279b8. */
  if (cfg_field_0 != (int32_t)ISAAC_FRAME_EFFECT_8279A0_FIELD0_VALUE) {
    return ISAAC_FRAME_EFFECT_8279A0_EXIT_FIELD0;
  }
  return ISAAC_FRAME_EFFECT_8279A0_EXIT_TRUE;
}

extern "C" int32_t isaac_frame_effect_8279a0_exit_arm(uint32_t cfg_ptr,
                                                      int32_t cfg_field_8,
                                                      int32_t cfg_field_0) {
  return frame_effect_8279a0_arm(cfg_ptr, cfg_field_8, cfg_field_0);
}

extern "C" uint32_t isaac_frame_effect_8279a0_eax(uint32_t cfg_ptr,
                                                  int32_t cfg_field_8,
                                                  int32_t cfg_field_0) {
  /* Both terminals write AL only, so EAX keeps the pointer's upper 24 bits:
     0x008279b5 mov al,1  → (cfg & 0xffffff00) | 1
     0x008279b8 xor al,al →  cfg & 0xffffff00
     The je arm arrives with eax already 0, which the same expression gives. */
  const uint32_t upper = cfg_ptr & 0xffffff00u;
  return frame_effect_8279a0_arm(cfg_ptr, cfg_field_8, cfg_field_0) ==
                 ISAAC_FRAME_EFFECT_8279A0_EXIT_TRUE
             ? (upper | 1u)
             : upper;
}

extern "C" int32_t isaac_frame_effect_8279a0_gate(uint32_t cfg_ptr,
                                                  int32_t cfg_field_8,
                                                  int32_t cfg_field_0) {
  /* AL, re-narrowed explicitly from the full return word. */
  return (int32_t)(isaac_frame_effect_8279a0_eax(cfg_ptr, cfg_field_8,
                                                 cfg_field_0) &
                   0xffu);
}

extern "C" void isaac_frame_effect_8279a0_plan(IsaacFrameEffect8279a0Plan* out,
                                               uint32_t cfg_ptr,
                                               int32_t cfg_field_8,
                                               int32_t cfg_field_0) {
  if (out == nullptr) {
    return;
  }
  const int32_t arm = frame_effect_8279a0_arm(cfg_ptr, cfg_field_8,
                                              cfg_field_0);
  /* Both loads are unconditional: the machine has no null check on [ecx+4]
     and none on the descriptor before [desc+0x10]. */
  out->deref_desc = 1;
  out->deref_cfg = 1;
  out->cfg_present = cfg_ptr != 0u ? 1 : 0;
  /* Reported only when the machine actually evaluates the compare; the je at
     0x008279a8 skips both, and the jne at 0x008279ae skips the second. */
  out->field8_match =
      (arm == ISAAC_FRAME_EFFECT_8279A0_EXIT_FIELD0 ||
       arm == ISAAC_FRAME_EFFECT_8279A0_EXIT_TRUE)
          ? 1
          : 0;
  out->field0_match = arm == ISAAC_FRAME_EFFECT_8279A0_EXIT_TRUE ? 1 : 0;
  out->exit_arm = arm;
  out->result_al =
      isaac_frame_effect_8279a0_gate(cfg_ptr, cfg_field_8, cfg_field_0);
  out->result_eax =
      isaac_frame_effect_8279a0_eax(cfg_ptr, cfg_field_8, cfg_field_0);
  out->host_calls = 0;
  out->pure_complete = 1;
}

extern "C" uint32_t isaac_frame_effect_8279a0_receiver_global_va(void) {
  return (uint32_t)ISAAC_FRAME_EFFECT_8279A0_RECEIVER_GLOBAL_VA;
}

extern "C" uint32_t isaac_frame_effect_8279a0_receiver_room_off(void) {
  return (uint32_t)ISAAC_FRAME_EFFECT_8279A0_RECEIVER_ROOM_OFF;
}

extern "C" void isaac_frame_effect_6fd7c0_player_branch_from_fields(
    IsaacFrameEffect6fd7c0PlayerBranchPlan* out, uint32_t player, uint32_t anim,
    uint32_t cfg_ptr, int32_t cfg_field_8, int32_t cfg_field_0) {
  /* The gate is only CALLED on the player-present anim-3/0xc edge, so the
     fields are irrelevant otherwise; the composed plan derives the same
     32-bit return the host used to supply and hands it to the v8 plan. */
  isaac_frame_effect_6fd7c0_player_branch_plan(
      out, player, anim,
      isaac_frame_effect_8279a0_eax(cfg_ptr, cfg_field_8, cfg_field_0));
}


/* ---- ABI v11: FUN_006fe410 result!=0 continuation (0x006fe510..0x006fec17)
   See the header doc for the full machine flow. All eight exports are
   freestanding; every host leaf stays host. ---- */

namespace {

inline uint32_t mul_lo(uint32_t a, uint32_t b) {
  return (uint32_t)((uint64_t)a * (uint64_t)b);
}

inline uint32_t mul_hi(uint32_t a, uint32_t b) {
  return (uint32_t)(((uint64_t)a * (uint64_t)b) >> 32);
}

/* The 64x64->128 product's high 64 bits, via the machine's own four limb
   products: b*d, b*c, a*d, a*c with the carry chain
   (add/adc pairs, exactly as 0x006fe522..0x006fe57a). */
inline uint64_t mul_hi_64(uint32_t a_lo, uint32_t a_hi,
                          uint32_t b_lo, uint32_t b_hi) {
  const uint32_t bd_hi = mul_hi(a_lo, b_lo);
  const uint32_t bc_lo = mul_lo(a_lo, b_hi);
  const uint32_t bc_hi = mul_hi(a_lo, b_hi);
  const uint32_t ad_lo = mul_lo(a_hi, b_lo);
  const uint32_t ad_hi = mul_hi(a_hi, b_lo);
  const uint32_t ac_lo = mul_lo(a_hi, b_hi);
  const uint32_t ac_hi = mul_hi(a_hi, b_hi);
  uint32_t c1, c2, c3;
  const uint32_t mid1 = ad_lo + bc_lo;              /* add ecx,esi */
  c1 = (mid1 < ad_lo) ? 1u : 0u;
  const uint32_t mid2 = mid1 + bd_hi;               /* add edi,ecx */
  c2 = (mid2 < mid1) ? 1u : 0u;
  const uint32_t hi1 = bc_hi + ad_hi + c1;          /* add ebx,ecx */
  c3 = (hi1 < bc_hi || (hi1 == bc_hi && c1 != 0u)) ? 1u : 0u;
  const uint32_t hi2 = ac_lo + hi1 + c2;            /* add ecx,ebx */
  const uint32_t carry = (hi2 < ac_lo || (hi2 == ac_lo && c2 != 0u)) ? 1u : 0u;
  const uint32_t hi3 = ac_hi + c3 + carry;          /* adc edx,eax */
  return ((uint64_t)hi3 << 32) | hi2;
}

}  // namespace

extern "C" void isaac_frame_effect_6fe410_hash64(uint32_t v_lo, uint32_t v_hi,
                                                 uint32_t* out_lo,
                                                 uint32_t* out_hi) {
  /* (V * 0x431bde82d7b634db) >> 82: the machine keeps bits 64..127 of the
     128-bit product (edx:ecx) and shifts that 64-bit word right by 0x12
     (shrd/shr at 0x006fe57c/0x006fe580). P >> 82 == (P >> 64) >> 18. */
  const uint64_t hi = mul_hi_64(
      v_lo, v_hi, (uint32_t)ISAAC_FRAME_EFFECT_6FE410_HASH_K_LO,
      (uint32_t)ISAAC_FRAME_EFFECT_6FE410_HASH_K_HI);
  const uint64_t r = hi >> ISAAC_FRAME_EFFECT_6FE410_HASH_SHIFT;
  if (out_lo != nullptr) {
    *out_lo = (uint32_t)r;
  }
  if (out_hi != nullptr) {
    *out_hi = (uint32_t)(r >> 32);
  }
}

extern "C" void isaac_frame_effect_6fe410_effect_flags(uint32_t arg1,
                                                       uint32_t flags_168_in,
                                                       uint32_t flags_16c_in,
                                                       uint32_t* out_168,
                                                       uint32_t* out_16c) {
  /* 0x006fe66a: ecx = effect+0x16c; or ecx,0x10000000
     0x006fe68c/0x006fe691: cmp eax,9/7 (full dword) ; je skip the 0x20
     0x006fe696: or ecx,0x20
     0x006fe680/0x006fe699: effect+0x168 = effect+0x168 (self-store) */
  uint32_t f16c = flags_16c_in | (uint32_t)ISAAC_FRAME_EFFECT_6FE410_PLAYER_GATE_16C;
  if (arg1 != (uint32_t)ISAAC_FRAME_EFFECT_6FE410_ARG1_SPECIAL_A &&
      arg1 != (uint32_t)ISAAC_FRAME_EFFECT_6FE410_ARG1_SPECIAL_B) {
    f16c |= (uint32_t)ISAAC_FRAME_EFFECT_6FE410_FLAG_20;
  }
  if (out_168 != nullptr) {
    *out_168 = flags_168_in;
  }
  if (out_16c != nullptr) {
    *out_16c = f16c;
  }
}

extern "C" void isaac_frame_effect_6fe410_head_stores(uint32_t player_nonzero,
                                                      uint32_t player_field_28,
                                                      uint32_t player_field_2c,
                                                      uint32_t* effect_34,
                                                      uint32_t* effect_38) {
  /* 0x006fe58b test edi,edi; je 0x006fe59a — effect+0x34 = player ?
     [p+0x28] : 0; effect+0x38 = player ? [p+0x2c] : 0. FULL word test. */
  const uint32_t v34 = (player_nonzero != 0u) ? player_field_28 : 0u;
  const uint32_t v38 = (player_nonzero != 0u) ? player_field_2c : 0u;
  if (effect_34 != nullptr) {
    *effect_34 = v34;
  }
  if (effect_38 != nullptr) {
    *effect_38 = v38;
  }
}

extern "C" void isaac_frame_effect_6fe410_room_counter(uint32_t old_counter,
                                                       uint32_t* room_field_1214,
                                                       uint32_t* effect_field_20) {
  /* 0x006fe624 lea eax,[ecx+1]; mov [edx+0x1214],eax; mov [ebx+0x20],ecx */
  if (room_field_1214 != nullptr) {
    *room_field_1214 = old_counter + 1u;
  }
  if (effect_field_20 != nullptr) {
    *effect_field_20 = old_counter;
  }
}

extern "C" void isaac_frame_effect_6fe410_scale_fields(
    IsaacFrameEffect6fe410ScaleOut* out,
    float a_f48,
    float b_c38,
    float b_3b4,
    float b_f48,
    float b_f44,
    float b_384,
    float b_380,
    float a_f44) {
  /* 0x006fe9a8..0x006fea46, f32 ops in machine order. The two constants
     0xc3793c/0xc37940 are 1.0f (0x3f800000, verified from .data raw). */
  if (out == nullptr) {
    return;
  }
  const float t1 = a_f48 * b_c38;          /* mulss xmm1,[esi+0xc38] */
  const float t2 = t1 * b_3b4;             /* mulss xmm1,[esi+0x3b4] */
  out->b_c38 = t1;
  out->b_e8 = t2 * 1.0f;                   /* mulss xmm1,[0xc37940] */
  out->b_e4 = t2 * 1.0f;                   /* mulss xmm0,[0xc3793c] */
  out->b_f48 = b_f48 * a_f48;
  out->b_f44 = b_f44 * a_f44;
  out->b_384 = b_384 * a_f44;
  out->b_380 = b_380 * a_f44;
}

extern "C" void isaac_frame_effect_6fe410_acc_delta(
    uint32_t hash1_lo, uint32_t hash1_hi,
    uint32_t hash2_lo, uint32_t hash2_hi,
    uint32_t acc_lo, uint32_t acc_hi,
    uint32_t* out_lo, uint32_t* out_hi) {
  /* 0x006febff sub ecx,[esp+0x10]; sbb edx,[esp+0x2c] (R2-R1);
     0x006fec08 add [0xc7b630],ecx; adc [0xc7b634],edx */
  const uint64_t r1 = ((uint64_t)hash1_hi << 32) | hash1_lo;
  const uint64_t r2 = ((uint64_t)hash2_hi << 32) | hash2_lo;
  const uint64_t acc = ((uint64_t)acc_hi << 32) | acc_lo;
  const uint64_t next = acc + (r2 - r1);
  if (out_lo != nullptr) {
    *out_lo = (uint32_t)next;
  }
  if (out_hi != nullptr) {
    *out_hi = (uint32_t)(next >> 32);
  }
}

extern "C" uint32_t isaac_frame_effect_6fe410_walk_receiver(uint32_t slot) {
  /* 0x006feb66: add ecx,0x1fc8 */
  return slot + (uint32_t)ISAAC_FRAME_EFFECT_6FE410_WALK_RECV_OFF;
}

extern "C" void isaac_frame_effect_6fe410_player_path_plan(
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
    uint32_t f54_differ) {
  if (out == nullptr) {
    return;
  }
  const uint32_t sp = (status_path != 0u) ? 1u : 0u;
  const uint32_t gate1 = (sp != 0u && (gate1_16c & (uint32_t)ISAAC_FRAME_EFFECT_6FE410_PLAYER_GATE_16C) != 0u) ? 1u : 0u;
  const uint32_t skip =
      (sp == 0u || a_nonzero == 0u || b_nonzero == 0u || al_b_417430 != 0u)
          ? 1u
          : 0u;
  const uint32_t shield =
      (skip == 0u && b_field_23c > 0) ? 1u : 0u; /* 0x006fe975 jle SIGNED */
  uint32_t e168 = effect_168_in;
  uint32_t e16c = effect_16c_in;
  if (gate1 != 0u) {
    isaac_frame_effect_6fe410_effect_flags(arg1, e168, e16c, &e168, &e16c);
  }
  out->player_path = (int32_t)sp;
  out->host_is_active_enemy = (int32_t)sp;
  out->gate1_16c = (int32_t)gate1;
  out->effect_flag_store = (int32_t)gate1;
  out->effect_168_out = e168;
  out->effect_16c_out = e16c;
  out->host_addcharmed =
      (sp != 0u && (gate1 != 0u || al_gate1_417430 != 0u)) ? 1 : 0;
  out->host_435c70 =
      (sp != 0u && gate1 == 0u && al_gate1_417430 != 0u) ? 1 : 0;
  out->host_af08b1 = (int32_t)sp;
  out->status_skip = (int32_t)skip;
  out->host_417430_b = (skip == 0u) ? 1 : 0;
  out->host_brimstone = (skip == 0u && player_al_1 != 0u) ? 1 : 0;
  out->host_shrink = (skip == 0u && player_al_2 != 0u) ? 1 : 0;
  out->b_shield_store = (int32_t)shield;
  /* 0x006fe984: or [esi+0x168],0x1000000 ; 0x006fe994/0x006fe99a:
     [esi+0x3b4] = [esi+0x3b8]. Both stores run only when shield is set. */
  out->b_168_out =
      (shield != 0u) ? (b_168_in | (uint32_t)ISAAC_FRAME_EFFECT_6FE410_B_SHIELD_168)
                     : b_168_in;
  out->b_3b4_out = (shield != 0u) ? b_3b8 : 0u;
  out->host_virtual_4c = (skip == 0u) ? 1 : 0;
  out->host_list_relink2 =
      (skip == 0u && virtual_4c_al != 0u && f54_differ != 0u) ? 1 : 0;
  out->pure_cf_ok = 1;
  out->pure_complete = 0;
}

extern "C" void isaac_frame_effect_6fe410_tail_plan(
    IsaacFrameEffect6fe410TailPlan* out,
    uint32_t v1_lo, uint32_t v1_hi,
    uint32_t v2_lo, uint32_t v2_hi,
    uint32_t begin, uint32_t end,
    uint32_t tail_byte_172,
    uint32_t game_eq_67758_6775c,
    uint32_t al_7078f0,
    uint32_t second_9e24a0) {
  if (out == nullptr) {
    return;
  }
  uint32_t r1_lo, r1_hi, r2_lo, r2_hi;
  isaac_frame_effect_6fe410_hash64(v1_lo, v1_hi, &r1_lo, &r1_hi);
  isaac_frame_effect_6fe410_hash64(v2_lo, v2_hi, &r2_lo, &r2_hi);
  uint32_t d_lo, d_hi;
  isaac_frame_effect_6fe410_acc_delta(r1_lo, r1_hi, r2_lo, r2_hi, 0u, 0u,
                                      &d_lo, &d_hi);
  /* Walk enter law, identical to FUN_006fe2f0 (v5): sar-2 count from the
     bounds, zero-only enter test (0x006feb26). */
  const int32_t count0 =
      isaac_frame_effect_6fe2f0_vector_count(begin, end);
  const int32_t entered = isaac_frame_effect_6fe2f0_walk_enter(count0);
  const uint32_t t172 = (tail_byte_172 != 0u) ? 1u : 0u;
  const uint32_t eq = (game_eq_67758_6775c != 0u) ? 1u : 0u;
  const uint32_t gate = (t172 != 0u && eq == 0u) ? 1u : 0u;
  out->hash1_lo = r1_lo;
  out->hash1_hi = r1_hi;
  out->hash2_lo = r2_lo;
  out->hash2_hi = r2_hi;
  out->delta_lo = d_lo;
  out->delta_hi = d_hi;
  out->host_hash1 = 1;
  out->host_hash2 = 1;
  out->host_7078f0 = 1;
  out->host_7079c0 = (al_7078f0 != 0u) ? 1 : 0;
  out->tail_byte_172 = (int32_t)t172;
  out->tail_eq = (int32_t)eq;
  out->tail_walk_gate = (int32_t)gate;
  out->host_9e24a0 = (int32_t)gate;
  out->host_9e24a0_second =
      (gate != 0u && second_9e24a0 != 0u) ? 1 : 0;
  out->walk_entered = entered;
  out->host_acc_add = 1;
  out->pure_cf_ok = 1;
  out->pure_complete = 0;
}

extern "C" uint32_t isaac_frame_effect_pure_helpers_abi_version(void) {
  return ISAAC_FRAME_EFFECT_PURE_HELPERS_ABI_VERSION;
}

/* ---- ABI v10: FUN_006fe410 entry dispatcher (0x006fe410..0x006fec17) ----
 * Transcribed from the linear decode; see the header doc for the machine
 * flow and the measured dead-store census. */

extern "C" int32_t isaac_frame_effect_6fe410_mode_ge2(uint32_t mode) {
  /* 0x006fe45b cmp dword ptr [eax+0x26614],2
     0x006fe462 jl  0x006fe47f -- SIGNED */
  return (int32_t)mode >= 2 ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_6fe410_switch_gate(
    uint32_t arg1, uint32_t player_nonzero, uint32_t player_flags_168) {
  /* 0x006fe47f test esi,esi ; je 0x006fe4e3
     0x006fe483 mov eax,[esi+0x168] ; and eax,0x20000000 ; je 0x006fe4e3
     0x006fe493 cmp ecx,0x3e8 ; jne 0x006fe4e3 */
  if (player_nonzero == 0u) {
    return 0;
  }
  if ((player_flags_168 & 0x20000000u) == 0u) {
    return 0;
  }
  if (arg1 != 0x3e8u) {
    return 0;
  }
  return 1;
}

extern "C" uint32_t isaac_frame_effect_6fe410_case_value(uint32_t arg2) {
  /* 0x006fe49b mov ebx,[ebp+0xc]
     0x006fe4a2 add ebx,-0x16            (32-bit wrap)
     0x006fe4a5 cmp ebx,4 ; 0x006fe4a8 ja 0x006fe4ea   (UNSIGNED)
     0x006fe4aa jmp [ebx*4+0x006fec1c] */
  const uint32_t idx = arg2 - 0x16u;
  if (idx <= 4u) {
    switch (idx) {
      case 0:
        return 0x2eu; /* 0x006fe4b1 */
      case 1:
        return 0x35u; /* 0x006fe4bb */
      case 2:
        return 0xccu; /* 0x006fe4c5 */
      case 3:
        return 0x2cu; /* 0x006fe4cf */
      default:
        return 0x2du; /* 0x006fe4d9 */
    }
  }
  return arg2;
}

extern "C" uint32_t isaac_frame_effect_6fe410_call_flag(uint32_t arg8) {
  /* 0x006fe4ea mov al,[ebp+0x24]
     0x006fe4ed and al,1
     0x006fe4ef movzx eax,al -- low-byte bit 0 only */
  return arg8 & 1u;
}

extern "C" void isaac_frame_effect_6fe410_entry_plan(
    IsaacFrameEffect6fe410EntryPlan* out, uint32_t mode, uint32_t arg1,
    uint32_t arg2, uint32_t player_nonzero, uint32_t player_flags_168,
    uint32_t arg8) {
  if (out == nullptr) {
    return;
  }
  const int32_t mode_ge2 = isaac_frame_effect_6fe410_mode_ge2(mode);
  const int32_t gate = isaac_frame_effect_6fe410_switch_gate(
      arg1, player_nonzero, player_flags_168);
  const uint32_t idx = arg2 - 0x16u;
  const int32_t in_table = (gate != 0 && idx <= 4u) ? 1 : 0;
  out->mode_ge2 = mode_ge2;
  out->host_42b560 = mode_ge2;
  out->player_present = player_nonzero != 0u ? 1 : 0;
  out->player_flag = (player_flags_168 & 0x20000000u) != 0u ? 1 : 0;
  out->reaches_switch = gate;
  out->switch_index = in_table != 0 ? (int32_t)idx : -1;
  /* The machine stores the case constant only when the gate is open AND
     idx <= 4; every other path stores arg2 (0x006fe49e / 0x006fe4e6). */
  out->slot_value =
      in_table != 0 ? isaac_frame_effect_6fe410_case_value(arg2) : arg2;
  out->slot_reaches_reader = 0; /* measured dead store; see the header doc */
  out->call_6f0090 = 1;         /* 0x006fe4fa on every path past the dispatch */
  out->call_arg1 = arg1;        /* the pre-0x42b560 copy the machine forwards */
  out->call_flag = isaac_frame_effect_6fe410_call_flag(arg8);
  out->receiver_off = ISAAC_FRAME_EFFECT_6FE410_RECEIVER_OFF;
  out->early_return_on_zero = 1; /* 0x006fe503 test eax,eax; 0x006fe505 jne */
  out->continue_va = ISAAC_FRAME_EFFECT_6FE410_CONTINUE_VA;
  out->pure_cf_ok = 1;
  out->pure_complete = 0;
}

/* 6fe410 entry plan layout, pinned. */
static_assert(offsetof(IsaacFrameEffect6fe410EntryPlan, mode_ge2) == 0,
              "6fe410 plan mode_ge2");
static_assert(offsetof(IsaacFrameEffect6fe410EntryPlan, host_42b560) == 4,
              "6fe410 plan host_42b560");
static_assert(offsetof(IsaacFrameEffect6fe410EntryPlan, player_present) == 8,
              "6fe410 plan player_present");
static_assert(offsetof(IsaacFrameEffect6fe410EntryPlan, player_flag) == 12,
              "6fe410 plan player_flag");
static_assert(offsetof(IsaacFrameEffect6fe410EntryPlan, reaches_switch) == 16,
              "6fe410 plan reaches_switch");
static_assert(offsetof(IsaacFrameEffect6fe410EntryPlan, switch_index) == 20,
              "6fe410 plan switch_index");
static_assert(offsetof(IsaacFrameEffect6fe410EntryPlan, slot_value) == 24,
              "6fe410 plan slot_value");
static_assert(offsetof(IsaacFrameEffect6fe410EntryPlan, slot_reaches_reader) == 28,
              "6fe410 plan slot_reaches_reader");
static_assert(offsetof(IsaacFrameEffect6fe410EntryPlan, call_6f0090) == 32,
              "6fe410 plan call_6f0090");
static_assert(offsetof(IsaacFrameEffect6fe410EntryPlan, call_arg1) == 36,
              "6fe410 plan call_arg1");
static_assert(offsetof(IsaacFrameEffect6fe410EntryPlan, call_flag) == 40,
              "6fe410 plan call_flag");
static_assert(offsetof(IsaacFrameEffect6fe410EntryPlan, receiver_off) == 44,
              "6fe410 plan receiver_off");
static_assert(offsetof(IsaacFrameEffect6fe410EntryPlan, early_return_on_zero) == 48,
              "6fe410 plan early_return_on_zero");
static_assert(offsetof(IsaacFrameEffect6fe410EntryPlan, continue_va) == 52,
              "6fe410 plan continue_va");
static_assert(offsetof(IsaacFrameEffect6fe410EntryPlan, pure_cf_ok) == 56,
              "6fe410 plan pure_cf_ok");
static_assert(offsetof(IsaacFrameEffect6fe410EntryPlan, pure_complete) == 60,
              "6fe410 plan pure_complete");
static_assert(sizeof(IsaacFrameEffect6fe410EntryPlan) == 64,
              "6fe410 plan size");

/* ---- ABI v12: FUN_0081e9d0 candidate position (0x0081e9d0..0x0081ecb7)
   Freestanding peels. 0x81f8b0 / 0x812f50 / 0x6eef60 stay host. ---- */

namespace {

inline uint32_t f32_to_bits(float value) {
  return __builtin_bit_cast(uint32_t, value);
}

}  // namespace

extern "C" int32_t isaac_frame_effect_81e9d0_lroom_type(uint32_t type48) {
  /* 0x0081e9e6 add eax,-9 ; 0x0081e9e9 cmp eax,3 ; 0x0081e9ec ja AABB.
     UNSIGNED: type-9 >u 3 skips. Window is [9,12]. */
  return ((type48 - (uint32_t)ISAAC_FRAME_EFFECT_81E9D0_TYPE_BIAS) >
          (uint32_t)ISAAC_FRAME_EFFECT_81E9D0_TYPE_SPAN)
             ? 0
             : 1;
}

extern "C" float isaac_frame_effect_81e9d0_unit_float(uint32_t genrand) {
  /* L-room: xorps; cvtsi2sd eax; shr 31; addsd [eax*8+0xbacb00]; cvtpd2ps;
     mulss [0xba9ff4]. AABB uses movd/cvtdq2pd for the same signed-i32→f64
     plus 2^32 when the sign bit is set. */
  const int32_t as_signed = (int32_t)genrand;
  double d = (double)as_signed;
  if ((genrand >> 31) != 0u) {
    d += 4294967296.0; /* DAT_00bacb00[1], .rdata, section-table verified */
  }
  const float as_f32 = (float)d;
  const float unit_scale = __builtin_bit_cast(
      float, (uint32_t)ISAAC_FRAME_EFFECT_81E9D0_UNIT_SCALE_BITS);
  return as_f32 * unit_scale;
}

extern "C" float isaac_frame_effect_81e9d0_aabb_lerp(float lo, float hi,
                                                    float unit) {
  /* 0x0081ec79..0x0081ec9a: (hi-lo)*unit + lo, f32 machine order. */
  const float span = hi - lo;
  return span * unit + lo;
}

extern "C" uint32_t isaac_frame_effect_81e9d0_fabs_bits(uint32_t bits) {
  /* 0x0081eaae andps xmm0, [0xbacb40] — mask 0x7fffffff, in-body. */
  return bits & (uint32_t)ISAAC_FRAME_EFFECT_81E9D0_ABS_MASK_BITS;
}

extern "C" int32_t isaac_frame_effect_81e9d0_comiss_jb(float a, float b) {
  /* 0x0081eb00 comiss xmm1,xmm2 ; 0x0081eb03 jb arm-A.
     Unordered (NaN) sets CF so jb is taken. */
  if (a != a || b != b) {
    return 1;
  }
  return a < b ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_81e9d0_comiss_jbe(float a, float b) {
  /* 0x0081ea77 comiss xmm1,xmm4 ; 0x0081ea80 jbe keep-yB0=b3+m.
     Unordered sets CF+ZF so jbe is taken. */
  if (a != a || b != b) {
    return 1;
  }
  return a <= b ? 1 : 0;
}

extern "C" void isaac_frame_effect_81e9d0_lroom_geom(
    IsaacFrameEffect81e9d0LRoomGeom* out, const float* desc8, float margin) {
  if (out == nullptr || desc8 == nullptr) {
    return;
  }
  const float b0 = desc8[0];
  const float b1 = desc8[1];
  const float b2 = desc8[2];
  const float b3 = desc8[3];
  const float b4 = desc8[4];
  const float b5 = desc8[5];
  const float b6 = desc8[6];
  const float b7 = desc8[7];
  const float ax = b0 - margin;
  const float ay = b1 - margin;
  const float a_x1 = b2 + margin;
  const float a_y1 = b3 + margin;
  const float bx = b4 - margin;
  const float b_x1 = b6 + margin;
  const float b_y1 = b7 + margin;
  const float w_a = a_x1 - ax;
  const float w_b = b_x1 - bx;
  /* comiss wB, wA ; jbe → keep yB0 = a_y1. ja (wB > wA ordered) swaps. */
  const int32_t b_gt_a = isaac_frame_effect_81e9d0_comiss_jbe(w_b, w_a) ? 0 : 1;
  const float y_b0 = (b_gt_a != 0) ? (b5 - margin) : a_y1;
  const float h_a = y_b0 - ay;
  const float h_b = b_y1 - y_b0;
  const float area_a = h_a * w_a;
  const float area_b = h_b * w_b;
  const float abs_a = bits_to_f32(
      isaac_frame_effect_81e9d0_fabs_bits(f32_to_bits(area_a)));
  const float abs_b = bits_to_f32(
      isaac_frame_effect_81e9d0_fabs_bits(f32_to_bits(area_b)));
  out->width_a = w_a;
  out->width_b = w_b;
  out->height_a = h_a;
  out->height_b = h_b;
  out->origin_ax = ax;
  out->origin_ay = ay;
  out->origin_bx = bx;
  out->origin_by = y_b0;
  out->abs_area_a = abs_a;
  out->abs_area_b = abs_b;
  out->weight = abs_a / (abs_a + abs_b); /* 0/0 → NaN, reproduced */
  out->b_gt_a = b_gt_a;
}

extern "C" int32_t isaac_frame_effect_81e9d0_lroom_arm(
    const IsaacFrameEffect81e9d0LRoomGeom* geom, float unit0) {
  if (geom == nullptr) {
    return ISAAC_FRAME_EFFECT_81E9D0_ARM_A;
  }
  return isaac_frame_effect_81e9d0_comiss_jb(unit0, geom->weight)
             ? ISAAC_FRAME_EFFECT_81E9D0_ARM_A
             : ISAAC_FRAME_EFFECT_81E9D0_ARM_B;
}

extern "C" void isaac_frame_effect_81e9d0_lroom_sample(
    float* out_x, float* out_y, const IsaacFrameEffect81e9d0LRoomGeom* geom,
    int32_t arm, float unit1, float unit2) {
  if (geom == nullptr) {
    return;
  }
  float x;
  float y;
  if (arm == ISAAC_FRAME_EFFECT_81E9D0_ARM_A) {
    /* 0x0081ebcc..0x0081ebec: wA*u1 + origin_ax ; u2*hA + origin_ay */
    x = geom->width_a * unit1 + geom->origin_ax;
    y = unit2 * geom->height_a + geom->origin_ay;
  } else {
    /* 0x0081eb4d..0x0081eb6d: wB*u1 + origin_bx ; u2*hB + origin_by */
    x = geom->width_b * unit1 + geom->origin_bx;
    y = unit2 * geom->height_b + geom->origin_by;
  }
  if (out_x != nullptr) {
    *out_x = x;
  }
  if (out_y != nullptr) {
    *out_y = y;
  }
}

extern "C" void isaac_frame_effect_81e9d0_entry_plan(
    IsaacFrameEffect81e9d0Plan* out, uint32_t type48, float margin,
    float room_14, float room_18, float room_1c, float room_20,
    const float* desc8, uint32_t g0, uint32_t g1, uint32_t g2) {
  if (out == nullptr) {
    return;
  }
  const int32_t lroom = isaac_frame_effect_81e9d0_lroom_type(type48);
  out->deref_desc = 1;
  out->deref_cfg = 1;
  out->deref_type = 1;
  out->lroom_path = lroom;
  out->aabb_path = lroom == 0 ? 1 : 0;
  out->host_81f8b0 = lroom;
  out->host_812f50 = lroom == 0 ? 1 : 0;
  out->pure_cf_ok = 1;
  out->pure_complete = 0;
  if (lroom != 0) {
    IsaacFrameEffect81e9d0LRoomGeom geom;
    isaac_frame_effect_81e9d0_lroom_geom(&geom, desc8, margin);
    const float u0 = isaac_frame_effect_81e9d0_unit_float(g0);
    const float u1 = isaac_frame_effect_81e9d0_unit_float(g1);
    const float u2 = isaac_frame_effect_81e9d0_unit_float(g2);
    const int32_t arm = (desc8 == nullptr)
                            ? ISAAC_FRAME_EFFECT_81E9D0_ARM_A
                            : isaac_frame_effect_81e9d0_lroom_arm(&geom, u0);
    float x = 0.0f;
    float y = 0.0f;
    if (desc8 != nullptr) {
      isaac_frame_effect_81e9d0_lroom_sample(&x, &y, &geom, arm, u1, u2);
    }
    out->host_genrand = 3;
    out->pick_arm_a = arm == ISAAC_FRAME_EFFECT_81E9D0_ARM_A ? 1 : 0;
    out->pick_arm_b = arm == ISAAC_FRAME_EFFECT_81E9D0_ARM_B ? 1 : 0;
    out->out_x_bits = f32_to_bits(x);
    out->out_y_bits = f32_to_bits(y);
    out->host_calls = 1 + 3; /* 81f8b0 + three genrand */
    return;
  }
  const float u0 = isaac_frame_effect_81e9d0_unit_float(g0);
  const float u1 = isaac_frame_effect_81e9d0_unit_float(g1);
  out->host_genrand = 2;
  out->pick_arm_a = 0;
  out->pick_arm_b = 0;
  out->out_x_bits =
      f32_to_bits(isaac_frame_effect_81e9d0_aabb_lerp(room_14, room_1c, u0));
  out->out_y_bits =
      f32_to_bits(isaac_frame_effect_81e9d0_aabb_lerp(room_18, room_20, u1));
  out->host_calls = 1 + 2; /* 812f50 + two genrand */
}

static_assert(sizeof(IsaacFrameEffect81e9d0LRoomGeom) == 48,
              "81e9d0 geom size");
static_assert(offsetof(IsaacFrameEffect81e9d0LRoomGeom, width_a) == 0,
              "81e9d0 geom width_a");
static_assert(offsetof(IsaacFrameEffect81e9d0LRoomGeom, weight) == 40,
              "81e9d0 geom weight");
static_assert(offsetof(IsaacFrameEffect81e9d0LRoomGeom, b_gt_a) == 44,
              "81e9d0 geom b_gt_a");
static_assert(sizeof(IsaacFrameEffect81e9d0Plan) == 60, "81e9d0 plan size");
static_assert(offsetof(IsaacFrameEffect81e9d0Plan, deref_desc) == 0,
              "81e9d0 plan deref_desc");
static_assert(offsetof(IsaacFrameEffect81e9d0Plan, lroom_path) == 12,
              "81e9d0 plan lroom_path");
static_assert(offsetof(IsaacFrameEffect81e9d0Plan, host_genrand) == 28,
              "81e9d0 plan host_genrand");
static_assert(offsetof(IsaacFrameEffect81e9d0Plan, out_x_bits) == 40,
              "81e9d0 plan out_x_bits");
static_assert(offsetof(IsaacFrameEffect81e9d0Plan, host_calls) == 48,
              "81e9d0 plan host_calls");
static_assert(offsetof(IsaacFrameEffect81e9d0Plan, pure_complete) == 56,
              "81e9d0 plan pure_complete");

/* ---- ABI v13: FUN_0081ecc0 random grid index (0x0081ecc0..0x0081edca)
   Freestanding peels. 0x81fb70 / 0x7e9020 stay host. Type gate is the
   v12 81e9d0 helper, called by reference. ---- */

extern "C" int32_t isaac_frame_effect_81ecc0_lroom_type(uint32_t type48) {
  return isaac_frame_effect_81e9d0_lroom_type(type48);
}

extern "C" uint32_t isaac_frame_effect_81ecc0_table_row_va(uint32_t type48) {
  /* 0x0081ecda shl edx,5 ; 0x0081ecdd add edx,0xc35b80 */
  return (type48 << 5) + (uint32_t)ISAAC_FRAME_EFFECT_81ECC0_TABLE_BASE;
}

extern "C" void isaac_frame_effect_81ecc0_copy_row(int32_t* out8,
                                                  const int32_t* row8) {
  if (out8 == nullptr || row8 == nullptr) {
    return;
  }
  for (uint32_t i = 0; i < (uint32_t)ISAAC_FRAME_EFFECT_81ECC0_ROW_DWORDS;
       ++i) {
    out8[i] = row8[i];
  }
}

extern "C" int32_t isaac_frame_effect_81ecc0_grid_in_bounds(int32_t x,
                                                           int32_t y,
                                                           int32_t width,
                                                           int32_t height) {
  /* test / js ; cmp / jge — SIGNED on both axes. */
  if (x < 0 || y < 0) {
    return 0;
  }
  if (x >= width || y >= height) {
    return 0;
  }
  return 1;
}

extern "C" int32_t isaac_frame_effect_81ecc0_grid_index(int32_t x, int32_t y,
                                                       int32_t width) {
  /* 0x0081ed48 / 0x0081edb3 imul eax, (width), y ; add x */
  return width * y + x;
}

extern "C" int32_t isaac_frame_effect_81ecc0_result(int32_t x, int32_t y,
                                                   int32_t width,
                                                   int32_t height) {
  if (isaac_frame_effect_81ecc0_grid_in_bounds(x, y, width, height) == 0) {
    return ISAAC_FRAME_EFFECT_81ECC0_FAIL;
  }
  return isaac_frame_effect_81ecc0_grid_index(x, y, width);
}

extern "C" void isaac_frame_effect_81ecc0_aabb_span(int32_t* dx, int32_t* dy,
                                                   int32_t x0, int32_t y0,
                                                   int32_t x1, int32_t y1) {
  /* 0x0081ed7a sub eax,esi (x1-x0) ; 0x0081ed8c sub edi,ebx (y1-y0) */
  if (dx != nullptr) {
    *dx = x1 - x0;
  }
  if (dy != nullptr) {
    *dy = y1 - y0;
  }
}

extern "C" void isaac_frame_effect_81ecc0_aabb_sample(int32_t* x, int32_t* y,
                                                     int32_t x0, int32_t y0,
                                                     int32_t rx, int32_t ry) {
  /* 0x0081ed87 add eax,esi ; 0x0081ed9a add eax,ebx */
  if (x != nullptr) {
    *x = x0 + rx;
  }
  if (y != nullptr) {
    *y = y0 + ry;
  }
}

extern "C" void isaac_frame_effect_81ecc0_entry_plan(
    IsaacFrameEffect81ecc0Plan* out, uint32_t type48, int32_t width,
    int32_t height, int32_t x0, int32_t y0, int32_t x1, int32_t y1,
    int32_t host_a, int32_t host_b) {
  if (out == nullptr) {
    return;
  }
  (void)x1;
  (void)y1;
  const int32_t lroom = isaac_frame_effect_81ecc0_lroom_type(type48);
  int32_t x;
  int32_t y;
  if (lroom != 0) {
    x = host_a;
    y = host_b;
    out->host_81fb70 = 1;
    out->host_7e9020 = 0;
    out->host_calls = 1;
  } else {
    x = x0 + host_a;
    y = y0 + host_b;
    out->host_81fb70 = 0;
    out->host_7e9020 = 2;
    out->host_calls = 2;
  }
  out->deref_desc = 1;
  out->deref_cfg = 1;
  out->deref_type = 1;
  out->lroom_path = lroom;
  out->aabb_path = lroom == 0 ? 1 : 0;
  out->in_bounds =
      isaac_frame_effect_81ecc0_grid_in_bounds(x, y, width, height);
  out->result = isaac_frame_effect_81ecc0_result(x, y, width, height);
  out->out_x = x;
  out->out_y = y;
  out->pure_cf_ok = 1;
  out->pure_complete = 0;
}

static_assert(sizeof(IsaacFrameEffect81ecc0Plan) == 56, "81ecc0 plan size");
static_assert(offsetof(IsaacFrameEffect81ecc0Plan, deref_desc) == 0,
              "81ecc0 plan deref_desc");
static_assert(offsetof(IsaacFrameEffect81ecc0Plan, lroom_path) == 12,
              "81ecc0 plan lroom_path");
static_assert(offsetof(IsaacFrameEffect81ecc0Plan, host_7e9020) == 24,
              "81ecc0 plan host_7e9020");
static_assert(offsetof(IsaacFrameEffect81ecc0Plan, result) == 36,
              "81ecc0 plan result");
static_assert(offsetof(IsaacFrameEffect81ecc0Plan, out_x) == 40,
              "81ecc0 plan out_x");
static_assert(offsetof(IsaacFrameEffect81ecc0Plan, pure_complete) == 52,
              "81ecc0 plan pure_complete");

/* ---- ABI v14: FUN_0081edd0 Room::GetBrokenWatchState
   (0x0081edd0..0x0081ede9). Zero calls. v12 type-gate / v13 unit-float
   unused here; consumed by reference, not re-derived. ---- */

extern "C" int32_t isaac_frame_effect_81edd0_mode_slow(uint32_t mode_26584) {
  /* 0x0081edd5 cmp dword [eax+0x26584],0x16 ; 0x0081ede1 je
     FULL dword, equality — signedness cannot matter. */
  return mode_26584 == (uint32_t)ISAAC_FRAME_EFFECT_81EDD0_MODE_SLOW ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_81edd0_exit_arm(uint32_t mode_26584) {
  return isaac_frame_effect_81edd0_mode_slow(mode_26584) != 0
             ? ISAAC_FRAME_EFFECT_81EDD0_EXIT_SLOW
             : ISAAC_FRAME_EFFECT_81EDD0_EXIT_FIELD;
}

extern "C" uint32_t isaac_frame_effect_81edd0_result(uint32_t mode_26584,
                                                    uint32_t room_1210) {
  /* 0x0081eddc mov eax,2 runs first; je keeps it. Else [ecx+0x1210]. */
  if (isaac_frame_effect_81edd0_mode_slow(mode_26584) != 0) {
    return (uint32_t)ISAAC_FRAME_EFFECT_81EDD0_SLOW_RESULT;
  }
  return room_1210;
}

extern "C" void isaac_frame_effect_81edd0_entry_plan(
    IsaacFrameEffect81edd0Plan* out, uint32_t mode_26584, uint32_t room_1210) {
  if (out == nullptr) {
    return;
  }
  const int32_t slow = isaac_frame_effect_81edd0_mode_slow(mode_26584);
  out->deref_game = 1;
  out->deref_mode = 1;
  out->mode_slow = slow;
  out->field_path = slow == 0 ? 1 : 0;
  out->deref_field = out->field_path;
  out->result = isaac_frame_effect_81edd0_result(mode_26584, room_1210);
  out->host_calls = 0;
  out->pure_complete = 1;
}

static_assert(sizeof(IsaacFrameEffect81edd0Plan) == 32, "81edd0 plan size");
static_assert(offsetof(IsaacFrameEffect81edd0Plan, deref_game) == 0,
              "81edd0 plan deref_game");
static_assert(offsetof(IsaacFrameEffect81edd0Plan, mode_slow) == 8,
              "81edd0 plan mode_slow");
static_assert(offsetof(IsaacFrameEffect81edd0Plan, result) == 20,
              "81edd0 plan result");
static_assert(offsetof(IsaacFrameEffect81edd0Plan, pure_complete) == 28,
              "81edd0 plan pure_complete");

/* ---- ABI v15: FUN_0081edf0 Lua SetBrokenWatchState
   (0x0081edf0..0x0081ee12). One host call (0x007ea2d0). v14 field
   unused here; consumed by reference, not re-derived. ---- */

extern "C" void isaac_frame_effect_81edf0_apply_store(uint32_t* room_1210,
                                                      uint32_t state) {
  if (room_1210 == nullptr) {
    return;
  }
  /* 0x0081edf3 mov eax,[ebp+8] ; 0x0081edfd mov [ecx+0x1210],eax
     FULL dword. */
  *room_1210 = state;
}

extern "C" uint32_t isaac_frame_effect_81edf0_scale_addr(uint32_t mgr) {
  /* 0x0081ee08 movss [esi+0x2a2d4],xmm0 — esi snapshotted at
     0x0081edf7 from [0xc7169c], BEFORE the host call. 32-bit wrap. */
  return mgr + (uint32_t)ISAAC_FRAME_EFFECT_81EDF0_SCALE_OFF;
}

extern "C" void isaac_frame_effect_81edf0_apply_scale(uint32_t* dest_bits,
                                                      uint32_t xmm0_bits) {
  if (dest_bits == nullptr) {
    return;
  }
  /* movss is a raw bit move, not an arithmetic convert. */
  *dest_bits = xmm0_bits;
}

extern "C" void isaac_frame_effect_81edf0_entry_plan(
    IsaacFrameEffect81edf0Plan* out, uint32_t state, uint32_t mgr,
    uint32_t xmm0_bits) {
  if (out == nullptr) {
    return;
  }
  out->store_field = 1;
  out->stored_state = state;
  out->deref_mgr = 1;
  out->host_7ea2d0 = 1;
  out->store_scale = 1;
  out->scale_bits = xmm0_bits;
  out->scale_addr = isaac_frame_effect_81edf0_scale_addr(mgr);
  out->host_calls = 1;
  out->pure_complete = 0;
}

static_assert(sizeof(IsaacFrameEffect81edf0Plan) == 36, "81edf0 plan size");
static_assert(offsetof(IsaacFrameEffect81edf0Plan, store_field) == 0,
              "81edf0 plan store_field");
static_assert(offsetof(IsaacFrameEffect81edf0Plan, stored_state) == 4,
              "81edf0 plan stored_state");
static_assert(offsetof(IsaacFrameEffect81edf0Plan, host_7ea2d0) == 12,
              "81edf0 plan host_7ea2d0");
static_assert(offsetof(IsaacFrameEffect81edf0Plan, scale_bits) == 20,
              "81edf0 plan scale_bits");
static_assert(offsetof(IsaacFrameEffect81edf0Plan, scale_addr) == 24,
              "81edf0 plan scale_addr");
static_assert(offsetof(IsaacFrameEffect81edf0Plan, pure_complete) == 32,
              "81edf0 plan pure_complete");

/* ---- NOTES: FUN_0081ee20 IRREDUCIBLE (unit stays host; v16 peels a callee) ----
   Complete dump 0081ee20.txt: shared ret 0x0081f128, first_ret
   0x0081eebf is the type-0xb epilogue only, 25 E8 (24× 0x007ee7e0 +
   1× 0x0081fb20), 0 ZHL. identify-zhl empty. Not a
   Get/SetBrokenWatchState wrapper (no 0x81edd0 / 0x81edf0).
   Multi-arm [cfg+0x48] dispatcher. Not a complete small helper.
   v16 peels callee 0x0081fb20. NEXT_VA after that peel is 0x0081fb70. */

/* ---- ABI v16: FUN_0081fb20 Room::GetLRoomTileDesc
   (0x0081fb20..0x0081fb6b). Zero calls. v13 table_row_va / copy_row
   consumed by reference, not re-derived. ---- */

extern "C" uint32_t isaac_frame_effect_81fb20_table_row_va(uint32_t type48) {
  /* 0x0081fb30 shl esi,5 ; 0x0081fb33 add esi,0xc35b80 */
  return isaac_frame_effect_81ecc0_table_row_va(type48);
}

extern "C" void isaac_frame_effect_81fb20_copy_row(int32_t* out8,
                                                   const int32_t* row8) {
  isaac_frame_effect_81ecc0_copy_row(out8, row8);
}

extern "C" uint32_t isaac_frame_effect_81fb20_return_out(uint32_t out_ptr) {
  /* 0x0081fb55 mov eax,edx — identity of [ebp+8]. */
  return out_ptr;
}

extern "C" void isaac_frame_effect_81fb20_entry_plan(
    IsaacFrameEffect81fb20Plan* out, uint32_t type48, uint32_t out_ptr) {
  if (out == nullptr) {
    return;
  }
  out->deref_desc = 1;
  out->deref_cfg = 1;
  out->deref_type = 1;
  out->table_row_va = isaac_frame_effect_81fb20_table_row_va(type48);
  out->copy_row = 1;
  out->return_out = out_ptr;
  out->host_calls = 0;
  out->pure_complete = 1;
}

static_assert(sizeof(IsaacFrameEffect81fb20Plan) == 32, "81fb20 plan size");
static_assert(offsetof(IsaacFrameEffect81fb20Plan, deref_desc) == 0,
              "81fb20 plan deref_desc");
static_assert(offsetof(IsaacFrameEffect81fb20Plan, table_row_va) == 12,
              "81fb20 plan table_row_va");
static_assert(offsetof(IsaacFrameEffect81fb20Plan, copy_row) == 16,
              "81fb20 plan copy_row");
static_assert(offsetof(IsaacFrameEffect81fb20Plan, return_out) == 20,
              "81fb20 plan return_out");
static_assert(offsetof(IsaacFrameEffect81fb20Plan, pure_complete) == 28,
              "81fb20 plan pure_complete");

/* ---- ABI v17: FUN_0081fb70 LRoomTileDesc::GetRandomTile
   (0x0081fb70..0x0081fd51). Five host log+int3 sites. v13 RNG
   shifts / aabb_span consumed by reference, not re-derived. ---- */

extern "C" uint32_t isaac_frame_effect_81fb70_seed_mix(uint32_t seed) {
  /* 0x0081fbed shr edx,cl ; xor ; shl eax,cl ; xor ; shr esi,cl ; xor
     cl from .rdata 0xb1f4ec=1, 0xb1f4f0=9, 0xb1f4f4=29. LOGICAL. */
  uint32_t x = seed;
  x ^= x >> (uint32_t)ISAAC_FRAME_EFFECT_81ECC0_RNG_SHIFT1;
  x ^= x << (uint32_t)ISAAC_FRAME_EFFECT_81ECC0_RNG_SHIFT2;
  x ^= x >> (uint32_t)ISAAC_FRAME_EFFECT_81ECC0_RNG_SHIFT3;
  return x;
}

extern "C" int32_t isaac_frame_effect_81fb70_iabs(int32_t x) {
  /* cdq ; xor eax,edx ; sub eax,edx. INT_MIN stays INT_MIN. */
  const int32_t sign = x >> 31;
  return (int32_t)((uint32_t)(x ^ sign) - (uint32_t)sign);
}

extern "C" int32_t isaac_frame_effect_81fb70_area_abs(int32_t dx, int32_t dy) {
  /* 0x0081fbaa / 0x0081fbbb imul (low 32) then iabs. */
  const int32_t prod = (int32_t)((uint32_t)dx * (uint32_t)dy);
  return isaac_frame_effect_81fb70_iabs(prod);
}

extern "C" uint32_t isaac_frame_effect_81fb70_umod(uint32_t n, uint32_t d) {
  /* xor edx,edx ; test ecx,ecx ; je skip ; div ecx. UNSIGNED. */
  if (d == 0u) {
    return 0u;
  }
  return n % d;
}

extern "C" int32_t isaac_frame_effect_81fb70_pick_a(uint32_t rem,
                                                   uint32_t area1) {
  /* 0x0081fc10 cmp edx,[ebp-0xc] ; 0x0081fc13 jb 0x81fcc1 — UNSIGNED. */
  return rem < area1 ? 1 : 0;
}

extern "C" int32_t isaac_frame_effect_81fb70_index(int32_t origin,
                                                  uint32_t rem) {
  /* 0x0081fc57 / 0x0081fcfe / 0x0081fc8e add origin, rem. 32-bit wrap. */
  return (int32_t)((uint32_t)origin + rem);
}

extern "C" void isaac_frame_effect_81fb70_bounds(int32_t* dx1, int32_t* dy1,
                                                int32_t* dx2, int32_t* dy2,
                                                const int32_t* desc8) {
  if (desc8 == nullptr) {
    return;
  }
  /* v13 aabb_span BY REFERENCE. */
  isaac_frame_effect_81ecc0_aabb_span(dx1, dy1, desc8[0], desc8[1], desc8[2],
                                      desc8[3]);
  isaac_frame_effect_81ecc0_aabb_span(dx2, dy2, desc8[4], desc8[5], desc8[6],
                                      desc8[7]);
}

extern "C" void isaac_frame_effect_81fb70_apply_xy(int32_t* out_xy, int32_t x,
                                                   int32_t y) {
  if (out_xy == nullptr) {
    return;
  }
  /* [eax]=ebx (x) ; [eax+4]=ecx (y). Paths differ in store order. */
  out_xy[0] = x;
  out_xy[1] = y;
}

extern "C" void isaac_frame_effect_81fb70_entry_plan(
    IsaacFrameEffect81fb70Plan* out, uint32_t seed, const int32_t* desc8) {
  if (out == nullptr) {
    return;
  }
  int32_t dx1 = 0;
  int32_t dy1 = 0;
  int32_t dx2 = 0;
  int32_t dy2 = 0;
  isaac_frame_effect_81fb70_bounds(&dx1, &dy1, &dx2, &dy2, desc8);
  const int32_t area1 = isaac_frame_effect_81fb70_area_abs(dx1, dy1);
  const int32_t area2 = isaac_frame_effect_81fb70_area_abs(dx2, dy2);
  const uint32_t total = (uint32_t)area1 + (uint32_t)area2;
  const int32_t x0 = desc8 != nullptr ? desc8[0] : 0;
  const int32_t y0 = desc8 != nullptr ? desc8[1] : 0;
  const int32_t x2 = desc8 != nullptr ? desc8[4] : 0;
  const int32_t y2 = desc8 != nullptr ? desc8[5] : 0;
  out->pure_complete = 0;
  out->seed_zero = seed == 0u ? 1 : 0;
  if (seed == 0u) {
    out->fatal = 1;
    out->mixed0 = 0;
    out->pick_a = 0;
    out->out_x = 0;
    out->out_y = 0;
    out->apply_xy = 0;
    out->host_calls = 1;
    return;
  }
  const uint32_t mixed0 = isaac_frame_effect_81fb70_seed_mix(seed);
  const uint32_t rem0 = isaac_frame_effect_81fb70_umod(mixed0, total);
  const int32_t pick_a =
      isaac_frame_effect_81fb70_pick_a(rem0, (uint32_t)area1);
  const int32_t dx = pick_a != 0 ? dx1 : dx2;
  const int32_t dy = pick_a != 0 ? dy1 : dy2;
  const int32_t ox = pick_a != 0 ? x0 : x2;
  const int32_t oy = pick_a != 0 ? y0 : y2;
  out->mixed0 = mixed0;
  out->pick_a = pick_a;
  if (mixed0 == 0u) {
    out->fatal = 1;
    out->out_x = 0;
    out->out_y = 0;
    out->apply_xy = 0;
    out->host_calls = 1;
    return;
  }
  const uint32_t mixed1 = isaac_frame_effect_81fb70_seed_mix(mixed0);
  const uint32_t rem_x =
      isaac_frame_effect_81fb70_umod(mixed1, (uint32_t)dx);
  out->out_x = isaac_frame_effect_81fb70_index(ox, rem_x);
  if (mixed1 == 0u) {
    out->fatal = 1;
    out->out_y = 0;
    out->apply_xy = 0;
    out->host_calls = 1;
    return;
  }
  if (dy == 0) {
    out->out_y = oy;
  } else {
    const uint32_t mixed2 = isaac_frame_effect_81fb70_seed_mix(mixed1);
    const uint32_t rem_y =
        isaac_frame_effect_81fb70_umod(mixed2, (uint32_t)dy);
    out->out_y = isaac_frame_effect_81fb70_index(oy, rem_y);
  }
  out->fatal = 0;
  out->apply_xy = 1;
  out->host_calls = 0;
}

static_assert(sizeof(IsaacFrameEffect81fb70Plan) == 36, "81fb70 plan size");
static_assert(offsetof(IsaacFrameEffect81fb70Plan, seed_zero) == 0,
              "81fb70 plan seed_zero");
static_assert(offsetof(IsaacFrameEffect81fb70Plan, mixed0) == 8,
              "81fb70 plan mixed0");
static_assert(offsetof(IsaacFrameEffect81fb70Plan, out_x) == 16,
              "81fb70 plan out_x");
static_assert(offsetof(IsaacFrameEffect81fb70Plan, apply_xy) == 24,
              "81fb70 plan apply_xy");
static_assert(offsetof(IsaacFrameEffect81fb70Plan, pure_complete) == 32,
              "81fb70 plan pure_complete");
