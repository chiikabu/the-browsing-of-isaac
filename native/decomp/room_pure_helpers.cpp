#include "room_pure_helpers.h"

#include <stddef.h>

static_assert(sizeof(IsaacRoomCameraFxState) == 32, "camera FX ABI changed");
static_assert(sizeof(IsaacRoomClearDelayState) == 28, "clear-delay ABI changed");
static_assert(sizeof(IsaacRoomWaterLavaState) == 20, "water/lava ABI changed");
static_assert(offsetof(IsaacRoomWaterLavaState, room_desc_flags_44) == 16, "water/lava ABI changed");
static_assert(sizeof(IsaacRoomTriggerClearEntry) == 8, "TriggerClear entry ABI changed");
static_assert(offsetof(IsaacRoomTriggerClearEntry, room_desc_clear_count_4a) == 4,
              "TriggerClear entry ABI changed");
static_assert(sizeof(IsaacRoomAmbient824800State) == 12, "ambient 824800 ABI changed");
static_assert(offsetof(IsaacRoomAmbient824800State, intensity_7458) == 4,
              "ambient 824800 ABI changed");
static_assert(offsetof(IsaacRoomAmbient824800State, flag_745c) == 8,
              "ambient 824800 ABI changed");
static_assert(sizeof(IsaacRoomB1Corners) == 16, "B1 corners ABI changed");
static_assert(offsetof(IsaacRoomB1Corners, c3) == 12, "B1 corners ABI changed");
static_assert(sizeof(IsaacRoomB1CornerWorld) == 8, "B1 corner world ABI changed");
static_assert(offsetof(IsaacRoomB1CornerWorld, y) == 4, "B1 corner world ABI changed");
/* IsaacRoomB1ResidualPlan: 11×int32/uint32 + 3×float = 56 bytes, sfx_pan @52. */
static_assert(sizeof(IsaacRoomB1ResidualPlan) == 56, "B1 residual plan ABI changed");
static_assert(offsetof(IsaacRoomB1ResidualPlan, sfx_pan) == 52,
              "B1 residual plan ABI changed");
/* IsaacRoomB1SpawnIterPlan: 10×i32/u32 + 3×f32 + 2×i32 = 60 bytes, continue @56. */
static_assert(sizeof(IsaacRoomB1SpawnIterPlan) == 60, "B1 spawn iter plan ABI changed");
static_assert(offsetof(IsaacRoomB1SpawnIterPlan, continue_loop) == 56,
              "B1 spawn iter plan ABI changed");
static_assert(offsetof(IsaacRoomB1SpawnIterPlan, world_x) == 40,
              "B1 spawn iter plan ABI changed");
static_assert(sizeof(IsaacRoomAmbient824a70BodyBounds) == 28,
              "824a70 body bounds ABI changed");
static_assert(offsetof(IsaacRoomAmbient824a70BodyBounds, loop_count) == 24,
              "824a70 body bounds ABI changed");
static_assert(sizeof(IsaacRoomAmbient824a70Color) == 12, "824a70 color ABI changed");
static_assert(offsetof(IsaacRoomAmbient824a70Color, b) == 8, "824a70 color ABI changed");
/* IsaacRoomAmbient824a70ResidualPlan: 6×int32 = 24 bytes, age @20. */
static_assert(sizeof(IsaacRoomAmbient824a70ResidualPlan) == 24,
              "824a70 residual plan ABI changed");
static_assert(offsetof(IsaacRoomAmbient824a70ResidualPlan, age) == 20,
              "824a70 residual plan ABI changed");
/* IsaacRoomAmbient824a70AnimFramePosts: i32 + u32 + f32 = 12 bytes. */
static_assert(sizeof(IsaacRoomAmbient824a70AnimFramePosts) == 12,
              "824a70 anim frame posts ABI changed");
static_assert(offsetof(IsaacRoomAmbient824a70AnimFramePosts, frame_f32) == 8,
              "824a70 anim frame posts ABI changed");
/* IsaacRoomAmbient824a70LayerColorPads: 3×u32 = 12 bytes. */
static_assert(sizeof(IsaacRoomAmbient824a70LayerColorPads) == 12,
              "824a70 layer color pads ABI changed");
static_assert(offsetof(IsaacRoomAmbient824a70LayerColorPads, dword) == 8,
              "824a70 layer color pads ABI changed");
/* IsaacRoomAmbient824a70LayerColorPlan: 13×4 = 52 bytes, pad_dword_off @48. */
static_assert(sizeof(IsaacRoomAmbient824a70LayerColorPlan) == 52,
              "824a70 layer color plan ABI changed");
static_assert(offsetof(IsaacRoomAmbient824a70LayerColorPlan, pad_dword_off) == 48,
              "824a70 layer color plan ABI changed");
static_assert(offsetof(IsaacRoomAmbient824a70LayerColorPlan, color_off) == 36,
              "824a70 layer color plan ABI changed");
/* IsaacRoomAmbient824a70CreateArgsPlan: 7×u32 = 28 bytes, game_ptr_global @24. */
static_assert(sizeof(IsaacRoomAmbient824a70CreateArgsPlan) == 28,
              "824a70 create args plan ABI changed");
static_assert(offsetof(IsaacRoomAmbient824a70CreateArgsPlan, game_ptr_global) == 24,
              "824a70 create args plan ABI changed");
static_assert(offsetof(IsaacRoomAmbient824a70CreateArgsPlan, seed) == 16,
              "824a70 create args plan ABI changed");
/* IsaacRoomAmbient824a70CreateHostGates: 18×4 = 72 bytes, host_v0 @68. */
static_assert(sizeof(IsaacRoomAmbient824a70CreateHostGates) == 72,
              "824a70 create host gates ABI changed");
static_assert(offsetof(IsaacRoomAmbient824a70CreateHostGates, host_v0) == 68,
              "824a70 create host gates ABI changed");
static_assert(offsetof(IsaacRoomAmbient824a70CreateHostGates, a2_clear_needed) == 8,
              "824a70 create host gates ABI changed");

/* Dual camera/FX float lerp recovered from FrameOpaque_802980 (VA 0x00802980) block B14:
   if (Room+0x70d8 < Room+0x70dc) { ++counter; value += step; }
   if (Room+0x70f4 < Room+0x70f8) { value += step; ++counter; }
   Complete pure block: no callees, no globals. */
extern "C" void isaac_room_camera_fx_lerp_step(IsaacRoomCameraFxState* state) {
  if (state == nullptr) return;
  if (state->counter_70d8 < state->limit_70dc) {
    state->counter_70d8 += 1;
    state->value_70cc = state->value_70cc + state->step_70d4;
  }
  if (state->counter_70f4 < state->limit_70f8) {
    state->value_70e8 = state->value_70e8 + state->step_70f0;
    state->counter_70f4 += 1;
  }
}

/* Clear-delay pure shell recovered from FrameOpaque_802980 block B12 arithmetic:
   alive = max(0, a + b)
   if enemies or greed wave timer: set delay to 10 (or 20 for boss subtype 3)
   else if delay > 0: decrement
   Host clear/transition side effects remain outside this helper. */
extern "C" void isaac_room_clear_delay_step(IsaacRoomClearDelayState* state) {
  if (state == nullptr) return;
  int32_t alive = state->alive_a + state->alive_b;
  if (alive < 0) alive = 0;
  const int32_t enemies = (int32_t)(state->enemies_present != 0);
  if (enemies != 0 || state->greed_wave_timer != 0) {
    int32_t delay = 10;
    if (state->room_type == 0x10 && state->room_subtype == 3) {
      delay = 20;
    }
    state->room_clear_delay = delay;
  } else if (state->room_clear_delay > 0) {
    state->room_clear_delay -= 1;
  }
}

/* B0 pure write recovered from FrameOpaque_802980 entry:
   mov byte ptr [edi+0x7220], 0  (exact machine at VA ~0x008029d0). */
extern "C" void isaac_room_entry_clear_7220(uint8_t* field_7220) {
  if (field_7220 == nullptr) return;
  *field_7220 = 0;
}

/* B6 _waterLerpColorCountdown and B17 Room+0x722c pure countdown:
   if (0 < *counter) *counter = *counter + -1; signed int32. */
extern "C" void isaac_room_countdown_dec_if_positive(int32_t* counter) {
  if (counter == nullptr) return;
  if (*counter > 0) {
    *counter -= 1;
  }
}

/* B2 collectible timer pure countdown (VA ~0x00803318 after host special case):
   if (-1 < *counter) *counter = *counter + -1;  // i.e. >= 0 then --
   Zero becomes -1. Host pool/spawn and empty-weight set-to-60 stay residual. */
extern "C" void isaac_room_countdown_dec_if_nonnegative(int32_t* counter) {
  if (counter == nullptr) return;
  if (*counter >= 0) {
    *counter -= 1;
  }
}

/* Mid-tail Room+0x706c pure countdown (VA ~0x00804xxx after FUN_00801ee0/800500):
   if (0 < *counter) {
     iVar = *counter + -1;
     *counter = iVar;
     if (iVar < 1) *counter = -1;   // byte-wise writes of 0xffffffff
   }
   Host FUN_008158a0 on the expire path stays residual. */
extern "C" void isaac_room_countdown_dec_expire_neg1(int32_t* counter) {
  if (counter == nullptr) return;
  if (*counter > 0) {
    const int32_t next = *counter - 1;
    *counter = next < 1 ? -1 : next;
  }
}

/* B10 boss deathspawn bookkeeping pure assign (VA ~0x00803e70):
   sum = Room+0x12c8 + Room+0x12cc  (signed int32 wrap)
   Room+0x7224 = (0 < sum) ? sum : 0   // max(0, sum)
   Pre-assign fatal when (sum < 1 && old 7224 > 0) remains host residual. */
extern "C" void isaac_room_boss_count_snapshot(int32_t* out_7224, int32_t count_12c8,
                                               int32_t count_12cc) {
  if (out_7224 == nullptr) return;
  const int32_t sum = count_12c8 + count_12cc;
  *out_7224 = sum > 0 ? sum : 0;
}

/* B16 pure float shell (VA ~0x008050d0 after rain block):
   if (challenge_0x123 && room_type != 0x10) {
     water += DAT_00baa120 (0.1f);
     // pure: band DAT_00baa3d8 < water < DAT_00baa3e8 → desc|0x100
     // host residual: (flags>>5)&1 type-7 grid walk after pure |0x100
     if (DAT_00baa454 < water) water = 1.0f;
   }
   if (0.0f < water && 0.0f < lava) {
     lava *= DAT_00baa3f4 (0.92f);
     // host: band old/new vs DAT_00baa198 → grid + FUN_00714610
     if (lava < DAT_00baa020 (0.001f)) lava = 0.0f;
     // host: FUN_00823540
   }
   PE bits verified from hash-bound exe: 0x3dcccccd / 0x3f800000 / 0x3f6b851f /
   0x3a83126f / 0x3f63d70a / 0x3f68f5c3. */
extern "C" void isaac_room_water_lava_float_step(IsaacRoomWaterLavaState* state) {
  if (state == nullptr) return;
  /* Exact PE float32 bit patterns (not decimal approximations). */
  const float water_step = __builtin_bit_cast(float, 0x3dcccccdu);     /* DAT_00baa120 */
  const float water_ceiling = __builtin_bit_cast(float, 0x3f800000u);  /* DAT_00baa454 */
  const float lava_decay = __builtin_bit_cast(float, 0x3f6b851fu);     /* DAT_00baa3f4 */
  const float lava_zero = __builtin_bit_cast(float, 0x3a83126fu);      /* DAT_00baa020 */
  const float water_band_lo = __builtin_bit_cast(float, 0x3f63d70au);  /* DAT_00baa3d8 */
  const float water_band_hi = __builtin_bit_cast(float, 0x3f68f5c3u);  /* DAT_00baa3e8 */
  const float zero = 0.0f;

  if (state->challenge_0x123 != 0 && state->room_type_8 != 0x10) {
    float water = state->water_amount_7240 + water_step;
    /* Band test uses post-add, pre-clamp water (exact PE order). */
    if (water_band_lo < water && water < water_band_hi) {
      state->room_desc_flags_44 |= 0x100u;
    }
    if (water_ceiling < water) {
      water = water_ceiling;
    }
    state->water_amount_7240 = water;
  }

  if (zero < state->water_amount_7240 && zero < state->lava_intensity_7740) {
    float lava = state->lava_intensity_7740 * lava_decay;
    if (lava < lava_zero) {
      lava = zero;
    }
    state->lava_intensity_7740 = lava;
  }
}

/* Room::TriggerClear pure entry (VA 0x008068f0 machine):
   or dword ptr [desc+0x44], 1
   inc word ptr [desc+0x4a]
   Exact ZHL: Room::TriggerClear(bool playSound); RoomDescriptor::Flags /
   ClearCount. Host residual room_trigger_clear starts at first call
   FUN_009e5960 (must not re-run this entry). Wired from clear-path when
   (flags & 9) == 0. */
extern "C" void isaac_room_trigger_clear_entry(IsaacRoomTriggerClearEntry* state) {
  if (state == nullptr) return;
  state->room_desc_flags_44 |= 1u;
  /* Exact machine: inc word ptr [desc+0x4a] (unsigned 16-bit wrap). */
  state->room_desc_clear_count_4a =
      (int16_t)(uint16_t)((uint16_t)state->room_desc_clear_count_4a + 1u);
}

/* FUN_00710dd0 pure early-out prologue (machine at VA 0x00710dd0):
   if ((field_3a0 & 0x10) && field_8 != 8) return 1;
   if ((field_3a0 & 0x20) && field_8 == 4) return 1;
   if (field_c == 2) return 1;
   if (field_8 == 7) return 1;
   return 0;  // fall through to host residual body
   No callees; complete pure gate. */
extern "C" uint32_t isaac_door_helper_710dd0_early_out(uint32_t field_3a0, int32_t field_8,
                                                      int32_t field_c) {
  if ((field_3a0 & 0x10u) != 0u && field_8 != 8) return 1u;
  if ((field_3a0 & 0x20u) != 0u && field_8 == 4) return 1u;
  if (field_c == 2) return 1u;
  if (field_8 == 7) return 1u;
  return 0u;
}

extern "C" int32_t isaac_door_slots_710dd0_any_needs_host(
    const IsaacDoorSlotFields* slots) {
  if (slots == nullptr) return 0;
  for (int i = 0; i < ISAAC_ROOM_DOOR_SLOT_COUNT; ++i) {
    if (slots[i].present == 0u) continue;
    if (isaac_door_helper_710dd0_early_out(slots[i].field_3a0, slots[i].field_8,
                                           slots[i].field_c) == 0u) {
      return 1;
    }
  }
  return 0;
}

extern "C" int32_t isaac_door_slots_710dd0_any_type5_needs_host(
    const IsaacDoorSlotFields* slots) {
  if (slots == nullptr) return 0;
  for (int i = 0; i < ISAAC_ROOM_DOOR_SLOT_COUNT; ++i) {
    if (slots[i].present == 0u) continue;
    if (slots[i].field_c != 5) continue;
    if (isaac_door_helper_710dd0_early_out(slots[i].field_3a0, slots[i].field_8,
                                           slots[i].field_c) == 0u) {
      return 1;
    }
  }
  return 0;
}

/* B16 residual gates. PE DAT_00baa120 / band / DAT_00baa198 from hash-bound exe. */
extern "C" int32_t isaac_room_b16_needs_type7_grid(uint32_t challenge_0x123,
                                                   int32_t room_type_8, float water_pre,
                                                   uint32_t room_desc_flags_44_post) {
  if (challenge_0x123 == 0u || room_type_8 == 0x10) return 0;
  const float water_step = __builtin_bit_cast(float, 0x3dcccccdu);    /* DAT_00baa120 */
  const float water_band_lo = __builtin_bit_cast(float, 0x3f63d70au); /* DAT_00baa3d8 */
  const float water_band_hi = __builtin_bit_cast(float, 0x3f68f5c3u); /* DAT_00baa3e8 */
  const float water_post_add = water_pre + water_step;
  /* Type-7 grid only inside pure |0x100 band block, then (flags>>5)&1. */
  if (!(water_band_lo < water_post_add && water_post_add < water_band_hi)) return 0;
  return ((room_desc_flags_44_post >> 5) & 1u) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_room_b16_needs_lava_band_grid(float lava_pre, float lava_post_mul) {
  const float lava_band = __builtin_bit_cast(float, 0x3e4ccccdu); /* DAT_00baa198 = 0.2f */
  const float zero = 0.0f;
  if (!(zero < lava_pre)) return 0;
  return (lava_post_mul < lava_band && !(lava_pre < lava_band)) ? 1 : 0;
}

extern "C" int32_t isaac_room_b16_needs_823540(float water_post_step, float lava_pre) {
  const float zero = 0.0f;
  return (zero < water_post_step && zero < lava_pre) ? 1 : 0;
}

extern "C" int32_t isaac_room_b16_needs_grid_host(uint32_t challenge_0x123,
                                                  int32_t room_type_8, float water_pre,
                                                  float lava_pre,
                                                  uint32_t room_desc_flags_44_post) {
  /* Recompute post-step water the same way as the pure float shell (no clamp
     needed for the lava-block outer gate beyond the pure helper's path). */
  const float water_step = __builtin_bit_cast(float, 0x3dcccccdu);
  const float water_ceiling = __builtin_bit_cast(float, 0x3f800000u);
  float water_post = water_pre;
  if (challenge_0x123 != 0u && room_type_8 != 0x10) {
    water_post = water_pre + water_step;
    if (water_ceiling < water_post) water_post = water_ceiling;
  }
  if (isaac_room_b16_needs_type7_grid(challenge_0x123, room_type_8, water_pre,
                                      room_desc_flags_44_post) != 0) {
    return 1;
  }
  /* Lava block owns band grid + FUN_00823540; band is nested inside it. */
  return isaac_room_b16_needs_823540(water_post, lava_pre);
}

/* FUN_0074efd0 room-callsite gate (machine VA 0x0074efd0..0x0074f02e, this=Game
   at the 0x8233c7 grid site). Returns the AL byte 0/1. Every PE branch pinned:
   - 0x74efdf/0x74efe4: difficulty 2/3 -> AL=0
   - 0x74efeb lea eax,[stage-1]; 0x74efee cmp eax,5; 0x74eff1 ja skip: UNSIGNED
     (u32)(stage-1) > 5 skips the flag test (stage 1..6 gets tested)
   - 0x74eff3/0x74effb: [Game+0x2654c] & 0x10000 -> AL=0
   - 0x74f005..0x74f010: stage_type not 4/5 -> AL=0
   - 0x74f012: stage == 4 -> AL=1; 0x74f017: stage != 3 -> AL=0
   - 0x74f01e call 0x748490 (poll combine); 0x74f023 test al,2 -> bit1 decides.
   The 0x748490 combine result is a TYPED-HOST input (0x6f9400/0x6f95a0 walk the
   action map via host residuals 0x4288a0). */
extern "C" uint32_t isaac_room_b16_mineshaft_gate(uint32_t difficulty_269c8,
                                                  uint32_t stage_0,
                                                  uint32_t stage_type_4,
                                                  uint32_t flags_2654c,
                                                  uint32_t poll_combine_byte) {
  if (difficulty_269c8 == 2u || difficulty_269c8 == 3u) return 0u;
  if (stage_0 - 1u <= 5u) {
    if ((flags_2654c & 0x10000u) != 0u) return 0u;
  }
  if (stage_type_4 != 4u && stage_type_4 != 5u) return 0u;
  if (stage_0 == 4u) return 1u;
  if (stage_0 != 3u) return 0u;
  return (poll_combine_byte & 0x2u) != 0u ? 1u : 0u;
}

/* FUN_00823370 grid math (machine VA 0x00823370..0x00823536, this=Room, arg =
   out[6 floats]). Pure over captured fields; the 0x74efd0 gate result +
   Game+0x1830c are passed in as typed inputs. PE float32 constants extracted
   from the hash-bound exe: 1.0f / 0.75f / 0.03f / 0.4f / 0.45f / 0.2f. */
extern "C" void isaac_room_b16_grid_step(float* out, const float* in,
                                         int32_t room_type_8,
                                         uint32_t desc_flags_44,
                                         int32_t desc_54,
                                         uint32_t room_1d18,
                                         int32_t grid_w_c,
                                         int32_t grid_h_10,
                                         float lava_7740,
                                         uint32_t mineshaft_al,
                                         int32_t transition_1830c) {
  if (out == nullptr || in == nullptr) return;
  /* Copy 6 floats (Room+0x1b10..0x1b28; +0x1b20 skipped by the PE). */
  for (int i = 0; i < 6; ++i) out[i] = in[i];
  const float lerp_target = __builtin_bit_cast(float, 0x3f800000u); /* 1.0f */
  const float lerp_factor = __builtin_bit_cast(float, 0x3f400000u); /* 0.75f */
  const float zero = 0.0f;
  const int32_t gate_open =
      room_type_8 == 7 || room_type_8 == 8 || room_type_8 == 0x1d ||
      (mineshaft_al != 0u && transition_1830c == 1);
  if (gate_open != 0) {
    /* 0x8233f9..0x82346f: out[i] = out[i] + (A - out[i]) * B, per-element f32. */
    for (int i = 0; i < 4; ++i) {
      const float d0 = lerp_target - out[i];
      const float m0 = d0 * lerp_factor;
      out[i] = m0 + out[i];
    }
    const float d4 = zero - out[4]; /* xorps 0.0: (0 - out[4]) * B + out[4] */
    const float m4 = d4 * lerp_factor;
    out[4] = m4 + out[4];
    const float d5 = lerp_target - out[5];
    const float m5 = d5 * lerp_factor;
    out[5] = m5 + out[5];
  }
  /* 0x82347c shr eax,9 / test al,1: bit 9 of desc_flags_44 -> out[4] += 0.03f. */
  if (((desc_flags_44 >> 9) & 1u) != 0u) {
    out[4] = out[4] + __builtin_bit_cast(float, 0x3cf5c28fu); /* 0.03f */
  }
  /* 0x823495..0x8234a8: room_1d18 == 0x20 && bit 5 of desc_flags_44. */
  if (room_1d18 == 0x20u && ((desc_flags_44 >> 5) & 1u) != 0u) {
    /* 0x8234ae: prod = (h-2)*(w-2) INT32 wrap (w=Room+0xc, h=Room+0x10). */
    const int32_t prod = (grid_h_10 - 2) * (grid_w_c - 2);
    /* 0x8234c2 divss float(desc+0x54) / float(prod); 0x8234d4 * lava. */
    const float v = (static_cast<float>(desc_54) / static_cast<float>(prod)) *
                    lava_7740;
    out[0] = out[0] - v;
    const float vc2 = v * __builtin_bit_cast(float, 0x3ecccccdU); /* 0.4f */
    out[1] = out[1] + vc2;
    out[2] = out[2] + vc2;
    const float vc3 = v * __builtin_bit_cast(float, 0x3ee66666u); /* 0.45f */
    out[3] = out[3] - vc3;
    const float vc4 = v * __builtin_bit_cast(float, 0x3e4ccccdu); /* 0.2f */
    out[5] = out[5] + vc4;
  }
}

/* FUN_00823540 wrapper al gate (machine VA 0x00823557..0x0082356d): the wrapper
   calls FUN_007067c0 with al = (byte[Game+0x183a0]==0 && byte[Game+0x269e9]==0).
   Both bytes are typed params (host-captured). */
extern "C" uint32_t isaac_room_b16_spray_gate_al(uint32_t byte_183a0,
                                                 uint32_t byte_269e9) {
  return ((byte_183a0 & 0xffu) == 0u && (byte_269e9 & 0xffu) == 0u) ? 1u : 0u;
}

/* FUN_007067c0 water-spray vector state math (machine VA 0x007067c0..0x007068be,
   no callees). Pure over caller-owned arrays; the Game+0x676xx access is the
   caller's. Returns the gate byte the PE stores at Game+0x676b4.
   - inactive (low byte of `active` == 0): prev[0..3] = cur[0..3] (16-byte copy;
     prev[4..5] untouched, gate byte NOT written), returns 0.
   - active: vel_out[i] = |cur[i] - prev[i]| * factor (f32, andps 0x7fffffff abs),
     returns 1. */
extern "C" uint32_t isaac_room_b16_spray_step(float* prev, const float* cur,
                                              float factor, uint32_t active,
                                              float* vel_out) {
  if (prev == nullptr || cur == nullptr || vel_out == nullptr) return 0u;
  if ((active & 0xffu) == 0u) {
    prev[0] = cur[0];
    prev[1] = cur[1];
    prev[2] = cur[2];
    prev[3] = cur[3];
    return 0u;
  }
  for (int i = 0; i < 6; ++i) {
    const float d = cur[i] - prev[i];
    const uint32_t abs_bits = __builtin_bit_cast(uint32_t, d) & 0x7fffffffu;
    const float abs_d = __builtin_bit_cast(float, abs_bits);
    vel_out[i] = abs_d * factor;
  }
  return 1u;
}

/* FUN_0070ee40 pure early-out (machine at VA 0x0070ee40):
   cmp byte [door+0x149], 0; je epilog
   Returns 1 to skip residual body, 0 to continue (entry clear + ANM2/host). */
extern "C" uint32_t isaac_door_helper_70ee40_early_out(uint32_t field_149_byte) {
  return (field_149_byte & 0xffu) == 0u ? 1u : 0u;
}

/* Room::TriggerClear residual pure gates (VA 0x008068f0 after entry).
   PE: if ((Game[0x9a72] != 2) && (Game[0x9a72] != 3)) non-greed path;
       if ((flags >> 7 & 1) == 0) awards bit7 walk. */
extern "C" int32_t isaac_room_trigger_clear_is_greed_mode(int32_t difficulty_269c8) {
  return (difficulty_269c8 == 2 || difficulty_269c8 == 3) ? 1 : 0;
}

extern "C" int32_t isaac_room_trigger_clear_needs_non_greed_host(
    int32_t difficulty_269c8) {
  return isaac_room_trigger_clear_is_greed_mode(difficulty_269c8) == 0 ? 1 : 0;
}

extern "C" int32_t isaac_room_trigger_clear_needs_awards_bit7_walk(
    uint32_t room_desc_flags_44) {
  return ((room_desc_flags_44 >> 7) & 1u) == 0u ? 1 : 0;
}

/* Mid-tail Room+0x706c: FUN_008158a0 only when pre>0 and post-dec < 1. */
extern "C" int32_t isaac_room_706c_needs_expire_host(int32_t pre_timer_706c) {
  if (!(pre_timer_706c > 0)) return 0;
  const int32_t next = pre_timer_706c - 1;
  return next < 1 ? 1 : 0;
}

/* Mid-tail Room+0x7230: spawn residual when pre>0 and pre % 5 == 0 (signed). */
extern "C" int32_t isaac_room_7230_needs_spawn_host(int32_t pre_timer_7230) {
  if (!(pre_timer_7230 > 0)) return 0;
  return (pre_timer_7230 % 5) == 0 ? 1 : 0;
}

/* B18: entity walk only when pre-clear flag byte nonzero. */
extern "C" int32_t isaac_room_b18_needs_entity_walk_host(uint32_t room_flag_7894) {
  return (room_flag_7894 & 0xffu) != 0u ? 1 : 0;
}

/* ---- B18 entity residual pure islands (helpers ABI v29 freestanding). ---- */

extern "C" uint32_t isaac_room_b18_entity_type5(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_B18_ENTITY_TYPE5);
}
extern "C" uint32_t isaac_room_b18_entity_type1(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_B18_ENTITY_TYPE1);
}
extern "C" uint32_t isaac_room_b18_type_range_base(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_B18_TYPE_RANGE_BASE);
}
extern "C" uint32_t isaac_room_b18_type_range_span(void) {
  return ISAAC_ROOM_B18_TYPE_RANGE_SPAN;
}
extern "C" uint32_t isaac_room_b18_mode_gate(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_B18_MODE_GATE);
}
extern "C" uint32_t isaac_room_b18_rtti_src_ptr(void) {
  return ISAAC_ROOM_B18_RTTI_SRC_PTR;
}
extern "C" uint32_t isaac_room_b18_rtti_dst_ptr(void) {
  return ISAAC_ROOM_B18_RTTI_DST_PTR;
}
extern "C" uint32_t isaac_room_b18_room_vec_offset(void) {
  return ISAAC_ROOM_B18_ROOM_VEC_OFF;
}
extern "C" uint32_t isaac_room_b18_room_count_offset(void) {
  return ISAAC_ROOM_B18_ROOM_COUNT_OFF;
}
extern "C" uint32_t isaac_room_b18_entity_type_offset(void) {
  return ISAAC_ROOM_B18_ENTITY_TYPE_OFF;
}
extern "C" uint32_t isaac_room_b18_room_flag_offset(void) {
  return ISAAC_ROOM_B18_ROOM_FLAG_OFF;
}
extern "C" uint32_t isaac_room_b18_game_mode_offset(void) {
  return ISAAC_ROOM_B18_GAME_MODE_OFF;
}

extern "C" uint32_t isaac_room_b18_host_va_flag_test(void) {
  return ISAAC_ROOM_B18_HOST_VA_FLAG_TEST;
}
extern "C" uint32_t isaac_room_b18_host_va_walk_start(void) {
  return ISAAC_ROOM_B18_HOST_VA_WALK_START;
}
extern "C" uint32_t isaac_room_b18_host_va_type5(void) {
  return ISAAC_ROOM_B18_HOST_VA_TYPE5;
}
extern "C" uint32_t isaac_room_b18_host_va_rtti(void) {
  return ISAAC_ROOM_B18_HOST_VA_RTTI;
}
extern "C" uint32_t isaac_room_b18_host_va_path_b(void) {
  return ISAAC_ROOM_B18_HOST_VA_PATH_B;
}
extern "C" uint32_t isaac_room_b18_host_va_flag_clear(void) {
  return ISAAC_ROOM_B18_HOST_VA_FLAG_CLEAR;
}
extern "C" uint32_t isaac_room_b18_host_va_next(void) {
  return ISAAC_ROOM_B18_HOST_VA_NEXT;
}

/* PE: xor esi,esi; cmp [Room+0x1264],esi; jbe flag_clear. */
extern "C" int32_t isaac_room_b18_list_empty(uint32_t entity_count_1264) {
  return entity_count_1264 == 0u ? 1 : 0;
}

/* PE: inc esi; cmp esi,[count]; jb loop. */
extern "C" int32_t isaac_room_b18_list_continue(uint32_t index,
                                                uint32_t entity_count_1264) {
  const uint32_t next = index + 1u;
  return next < entity_count_1264 ? 1 : 0;
}

extern "C" int32_t isaac_room_b18_entity_is_type5(int32_t entity_type_28) {
  return entity_type_28 == ISAAC_ROOM_B18_ENTITY_TYPE5 ? 1 : 0;
}

/* PE: cmp [Game+0x26614],2; jl range_check; cmp type,1; je rtti. */
extern "C" int32_t isaac_room_b18_entity_type1_mode_gate(
    int32_t timed_transition_cleanup_mode, int32_t entity_type_28) {
  if (!(timed_transition_cleanup_mode >= ISAAC_ROOM_B18_MODE_GATE)) return 0;
  return entity_type_28 == ISAAC_ROOM_B18_ENTITY_TYPE1 ? 1 : 0;
}

/* PE: lea eax,[type-0xa]; cmp eax,0x3dd; ja skip → (type-10U) < 0x3de. */
extern "C" int32_t isaac_room_b18_entity_type_in_range(int32_t entity_type_28) {
  const uint32_t delta =
      static_cast<uint32_t>(entity_type_28) -
      static_cast<uint32_t>(ISAAC_ROOM_B18_TYPE_RANGE_BASE);
  return delta < ISAAC_ROOM_B18_TYPE_RANGE_SPAN ? 1 : 0;
}

extern "C" int32_t isaac_room_b18_entity_path_b_candidate(
    int32_t timed_transition_cleanup_mode, int32_t entity_type_28) {
  if (isaac_room_b18_entity_type1_mode_gate(timed_transition_cleanup_mode,
                                            entity_type_28) != 0) {
    return 1;
  }
  return isaac_room_b18_entity_type_in_range(entity_type_28);
}

extern "C" int32_t isaac_room_b18_entity_action(
    int32_t timed_transition_cleanup_mode, int32_t entity_type_28) {
  if (isaac_room_b18_entity_is_type5(entity_type_28) != 0) {
    return ISAAC_ROOM_B18_ACTION_TYPE5;
  }
  if (isaac_room_b18_entity_path_b_candidate(timed_transition_cleanup_mode,
                                             entity_type_28) != 0) {
    return ISAAC_ROOM_B18_ACTION_RTTI_CANDIDATE;
  }
  return ISAAC_ROOM_B18_ACTION_SKIP;
}

/* PE: test eax,eax after RTTI; je skip; mov ecx,eax; call 0x6da530. */
extern "C" int32_t isaac_room_b18_path_b_needs_host(uint32_t rtti_cast_result) {
  return rtti_cast_result != 0u ? 1 : 0;
}

extern "C" void isaac_room_b18_residual_plan(uint32_t room_flag_7894,
                                             uint32_t entity_count_1264,
                                             IsaacRoomB18ResidualPlan* out) {
  if (out == nullptr) return;
  const int32_t outer = isaac_room_b18_needs_entity_walk_host(room_flag_7894);
  out->needs_host = outer;
  out->entity_count = static_cast<int32_t>(entity_count_1264);
  if (outer == 0) {
    out->residual_kind = ISAAC_ROOM_B18_RESIDUAL_NONE;
    out->pure_complete = 1;
    out->host_needed = 0;
    out->entity_count = 0;
    return;
  }
  if (isaac_room_b18_list_empty(entity_count_1264) != 0) {
    out->residual_kind = ISAAC_ROOM_B18_RESIDUAL_PURE_COMPLETE;
    out->pure_complete = 1;
    out->host_needed = 0;
    return;
  }
  out->residual_kind = ISAAC_ROOM_B18_RESIDUAL_HOST_WALK;
  out->pure_complete = 0;
  out->host_needed = 1;
}

extern "C" void isaac_room_b18_wire_decide(int32_t flag_ready, int32_t count_ready,
                                           uint32_t room_flag_7894,
                                           uint32_t entity_count_1264,
                                           IsaacRoomB18ResidualPlan* out) {
  if (out == nullptr) return;
  if (flag_ready == 0) {
    out->needs_host = 0;
    out->residual_kind = ISAAC_ROOM_B18_RESIDUAL_MONOLITHIC;
    out->pure_complete = 0;
    out->host_needed = 1;
    out->entity_count = 0;
    return;
  }
  const int32_t outer = isaac_room_b18_needs_entity_walk_host(room_flag_7894);
  if (outer == 0) {
    out->needs_host = 0;
    out->residual_kind = ISAAC_ROOM_B18_RESIDUAL_NONE;
    out->pure_complete = 1;
    out->host_needed = 0;
    out->entity_count = 0;
    return;
  }
  if (count_ready == 0) {
    out->needs_host = 1;
    out->residual_kind = ISAAC_ROOM_B18_RESIDUAL_MONOLITHIC;
    out->pure_complete = 0;
    out->host_needed = 1;
    out->entity_count = 0;
    return;
  }
  isaac_room_b18_residual_plan(room_flag_7894, entity_count_1264, out);
}

/* ---- B19 path-rebuild residual pure islands (helpers ABI v30 freestanding). ---- */

extern "C" int32_t isaac_room_b19_needs_path_rebuild_host(uint32_t room_flag_7769) {
  return (room_flag_7769 & 0xffu) != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_room_b19_entity_type5(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_B19_ENTITY_TYPE5);
}
extern "C" uint32_t isaac_room_b19_entity_variant_100(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_B19_ENTITY_VARIANT_100);
}
extern "C" uint32_t isaac_room_b19_entity_flag_bit(void) {
  return ISAAC_ROOM_B19_ENTITY_FLAG_BIT;
}
extern "C" uint32_t isaac_room_b19_query_imm_8000(void) {
  return ISAAC_ROOM_B19_QUERY_IMM_8000;
}
extern "C" uint32_t isaac_room_b19_cell_buf_size(void) {
  return ISAAC_ROOM_B19_CELL_BUF_SIZE;
}
extern "C" uint32_t isaac_room_b19_tree_node_size(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_B19_TREE_NODE_SIZE);
}
extern "C" uint32_t isaac_room_b19_grid_cell_bits(void) {
  return ISAAC_ROOM_B19_GRID_CELL_BITS;
}
extern "C" uint32_t isaac_room_b19_grid_y0_bits(void) {
  return ISAAC_ROOM_B19_GRID_Y0_BITS;
}
extern "C" uint32_t isaac_room_b19_grid_half_bits(void) {
  return ISAAC_ROOM_B19_GRID_HALF_BITS;
}
extern "C" uint32_t isaac_room_b19_room_w_offset(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_B19_ROOM_W_OFF);
}
extern "C" uint32_t isaac_room_b19_room_h_offset(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_B19_ROOM_H_OFF);
}
extern "C" uint32_t isaac_room_b19_room_vec_offset(void) {
  return ISAAC_ROOM_B19_ROOM_VEC_OFF;
}
extern "C" uint32_t isaac_room_b19_room_count_offset(void) {
  return ISAAC_ROOM_B19_ROOM_COUNT_OFF;
}
extern "C" uint32_t isaac_room_b19_room_flag_offset(void) {
  return ISAAC_ROOM_B19_ROOM_FLAG_OFF;
}
extern "C" uint32_t isaac_room_b19_entity_type_offset(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_B19_ENTITY_TYPE_OFF);
}
extern "C" uint32_t isaac_room_b19_entity_variant_offset(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_B19_ENTITY_VARIANT_OFF);
}
extern "C" uint32_t isaac_room_b19_entity_pos_x_offset(void) {
  return ISAAC_ROOM_B19_ENTITY_POS_X_OFF;
}
extern "C" uint32_t isaac_room_b19_entity_pos_y_offset(void) {
  return ISAAC_ROOM_B19_ENTITY_POS_Y_OFF;
}
extern "C" uint32_t isaac_room_b19_entity_dead_offset(void) {
  return ISAAC_ROOM_B19_ENTITY_DEAD_OFF;
}
extern "C" uint32_t isaac_room_b19_entity_field_534_offset(void) {
  return ISAAC_ROOM_B19_ENTITY_FIELD_534_OFF;
}
extern "C" uint32_t isaac_room_b19_entity_flags_168_offset(void) {
  return ISAAC_ROOM_B19_ENTITY_FLAGS_168_OFF;
}
extern "C" uint32_t isaac_room_b19_refcount_va(void) {
  return ISAAC_ROOM_B19_REFCOUNT_VA;
}

extern "C" uint32_t isaac_room_b19_host_va_flag_test(void) {
  return ISAAC_ROOM_B19_HOST_VA_FLAG_TEST;
}
extern "C" uint32_t isaac_room_b19_host_va_rebuild_start(void) {
  return ISAAC_ROOM_B19_HOST_VA_REBUILD_START;
}
extern "C" uint32_t isaac_room_b19_host_va_memset(void) {
  return ISAAC_ROOM_B19_HOST_VA_MEMSET;
}
extern "C" uint32_t isaac_room_b19_host_va_get_grid_collision(void) {
  return ISAAC_ROOM_B19_HOST_VA_GET_GRID_COLLISION;
}
extern "C" uint32_t isaac_room_b19_host_va_entity_walk(void) {
  return ISAAC_ROOM_B19_HOST_VA_ENTITY_WALK;
}
extern "C" uint32_t isaac_room_b19_host_va_query_8000(void) {
  return ISAAC_ROOM_B19_HOST_VA_QUERY_8000;
}
extern "C" uint32_t isaac_room_b19_host_va_tree_alloc(void) {
  return ISAAC_ROOM_B19_HOST_VA_TREE_ALLOC;
}
extern "C" uint32_t isaac_room_b19_host_va_pos_finish(void) {
  return ISAAC_ROOM_B19_HOST_VA_POS_FINISH;
}
extern "C" uint32_t isaac_room_b19_host_va_spawn(void) {
  return ISAAC_ROOM_B19_HOST_VA_SPAWN;
}
extern "C" uint32_t isaac_room_b19_host_va_get_alt_pedestal(void) {
  return ISAAC_ROOM_B19_HOST_VA_GET_ALT_PEDESTAL;
}
extern "C" uint32_t isaac_room_b19_host_va_set_alt_pedestal(void) {
  return ISAAC_ROOM_B19_HOST_VA_SET_ALT_PEDESTAL;
}
extern "C" uint32_t isaac_room_b19_host_va_flag_clear(void) {
  return ISAAC_ROOM_B19_HOST_VA_FLAG_CLEAR;
}
extern "C" uint32_t isaac_room_b19_host_va_next(void) {
  return ISAAC_ROOM_B19_HOST_VA_NEXT;
}

/* PE: mov eax,[edi+0x10]; imul eax,[edi+0xc]. */
extern "C" int32_t isaac_room_b19_cell_count(int32_t width_c, int32_t height_10) {
  return width_c * height_10;
}

/* PE: test eax,eax; jle skip_loop. */
extern "C" int32_t isaac_room_b19_cell_loop_enter(int32_t cell_count) {
  return cell_count > 0 ? 1 : 0;
}

/* PE: inc esi; cmp esi,cell_count; jl loop. */
extern "C" int32_t isaac_room_b19_cell_loop_continue(int32_t index,
                                                     int32_t cell_count) {
  const int32_t next = index + 1;
  return next < cell_count ? 1 : 0;
}

extern "C" int32_t isaac_room_b19_list_empty(uint32_t entity_count_1264) {
  return entity_count_1264 == 0u ? 1 : 0;
}

extern "C" int32_t isaac_room_b19_list_continue(uint32_t index,
                                                uint32_t entity_count_1264) {
  const uint32_t next = index + 1u;
  return next < entity_count_1264 ? 1 : 0;
}

extern "C" int32_t isaac_room_b19_entity_is_mark_candidate(
    int32_t entity_type_28, int32_t entity_variant_2c) {
  if (entity_type_28 != ISAAC_ROOM_B19_ENTITY_TYPE5) return 0;
  return entity_variant_2c == ISAAC_ROOM_B19_ENTITY_VARIANT_100 ? 1 : 0;
}

/* PE: cmp byte +0x173,0; jne skip; cmp dword +0x534,0; jne skip;
   and flags,0x80000; or eax,0; je skip. */
extern "C" int32_t isaac_room_b19_entity_secondary_eligible(uint32_t dead_173_byte,
                                                            uint32_t field_534,
                                                            uint32_t flags_168) {
  if ((dead_173_byte & 0xffu) != 0u) return 0;
  if (field_534 != 0u) return 0;
  return (flags_168 & ISAAC_ROOM_B19_ENTITY_FLAG_BIT) != 0u ? 1 : 0;
}

/* PE after GetGridCollision: neg eax; sbb al,al → 0x00 or 0xFF. */
extern "C" uint32_t isaac_room_b19_collision_byte(uint32_t grid_collision_result) {
  return grid_collision_result != 0u ? 0xffu : 0u;
}

namespace {

inline float b19_f32_bits(uint32_t bits) {
  return __builtin_bit_cast(float, bits);
}

/* PE: (pos - base) / cell + 0.5 → cvttss2si (trunc toward zero). */
inline int32_t b19_world_axis(float pos, float base, float cell, float half) {
  const float t0 = pos - base;
  const float t1 = t0 / cell;
  const float t2 = t1 + half;
  return static_cast<int32_t>(t2);
}

}  // namespace

extern "C" int32_t isaac_room_b19_world_to_grid_x(float pos_x) {
  const float cell = b19_f32_bits(ISAAC_ROOM_B19_GRID_CELL_BITS);
  const float half = b19_f32_bits(ISAAC_ROOM_B19_GRID_HALF_BITS);
  return b19_world_axis(pos_x, cell, cell, half);
}

extern "C" int32_t isaac_room_b19_world_to_grid_y(float pos_y) {
  const float cell = b19_f32_bits(ISAAC_ROOM_B19_GRID_CELL_BITS);
  const float y0 = b19_f32_bits(ISAAC_ROOM_B19_GRID_Y0_BITS);
  const float half = b19_f32_bits(ISAAC_ROOM_B19_GRID_HALF_BITS);
  return b19_world_axis(pos_y, y0, cell, half);
}

extern "C" int32_t isaac_room_b19_world_to_grid_index(float pos_x, float pos_y,
                                                      int32_t width_c,
                                                      int32_t height_10) {
  const int32_t gx = isaac_room_b19_world_to_grid_x(pos_x);
  const int32_t gy = isaac_room_b19_world_to_grid_y(pos_y);
  if (gx < 0) return -1;
  if (!(gx < width_c)) return -1;
  if (gy < 0) return -1;
  if (!(gy < height_10)) return -1;
  const int32_t index = gy * width_c + gx;
  if (index < 0) return -1;
  return index;
}

extern "C" int32_t isaac_room_b19_grid_index_valid(int32_t grid_index) {
  return grid_index >= 0 ? 1 : 0;
}

extern "C" void isaac_room_b19_residual_plan(uint32_t room_flag_7769,
                                             int32_t width_c, int32_t height_10,
                                             IsaacRoomB19ResidualPlan* out) {
  if (out == nullptr) return;
  const int32_t outer = isaac_room_b19_needs_path_rebuild_host(room_flag_7769);
  out->needs_host = outer;
  out->cell_count = isaac_room_b19_cell_count(width_c, height_10);
  if (outer == 0) {
    out->residual_kind = ISAAC_ROOM_B19_RESIDUAL_NONE;
    out->pure_complete = 1;
    out->host_needed = 0;
    out->cell_count = 0;
    return;
  }
  /* Flag-on always hosts (refcount / memset / tree alloc / free). */
  out->residual_kind = ISAAC_ROOM_B19_RESIDUAL_HOST_REBUILD;
  out->pure_complete = 0;
  out->host_needed = 1;
}

extern "C" void isaac_room_b19_wire_decide(int32_t flag_ready,
                                           uint32_t room_flag_7769,
                                           int32_t width_c, int32_t height_10,
                                           IsaacRoomB19ResidualPlan* out) {
  if (out == nullptr) return;
  if (flag_ready == 0) {
    out->needs_host = 0;
    out->residual_kind = ISAAC_ROOM_B19_RESIDUAL_MONOLITHIC;
    out->pure_complete = 0;
    out->host_needed = 1;
    out->cell_count = 0;
    return;
  }
  isaac_room_b19_residual_plan(room_flag_7769, width_c, height_10, out);
}

/* ---- B20 trail-list residual pure islands (helpers ABI v31 outer / v32 body). ---- */

extern "C" int32_t isaac_room_b20_needs_trail_host(uint32_t list_begin_c82674,
                                                   uint32_t list_end_c82678) {
  return list_begin_c82674 != list_end_c82678 ? 1 : 0;
}

extern "C" uint32_t isaac_room_b20_pass1_type_a(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_B20_PASS1_TYPE_A);
}
extern "C" uint32_t isaac_room_b20_pass1_type_b(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_B20_PASS1_TYPE_B);
}
extern "C" uint32_t isaac_room_b20_pass1_type_c(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_B20_PASS1_TYPE_C);
}
extern "C" uint32_t isaac_room_b20_pass1_type_d(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_B20_PASS1_TYPE_D);
}
extern "C" uint32_t isaac_room_b20_pair_y_type(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_B20_PAIR_Y_TYPE);
}
extern "C" uint32_t isaac_room_b20_flag_bit_4000(void) {
  return ISAAC_ROOM_B20_FLAG_BIT_4000;
}
extern "C" uint32_t isaac_room_b20_flag_clear_mask(void) {
  return ISAAC_ROOM_B20_FLAG_CLEAR_MASK;
}
extern "C" uint32_t isaac_room_b20_spawn_flag_bit_80(void) {
  return ISAAC_ROOM_B20_SPAWN_FLAG_BIT_80;
}
extern "C" uint32_t isaac_room_b20_collect_flag_bits(void) {
  return ISAAC_ROOM_B20_COLLECT_FLAG_BITS;
}
extern "C" uint32_t isaac_room_b20_pair_x_offset_bits(void) {
  return ISAAC_ROOM_B20_PAIR_X_OFFSET_BITS;
}
extern "C" uint32_t isaac_room_b20_pair_y_offset_bits(void) {
  return ISAAC_ROOM_B20_PAIR_Y_OFFSET_BITS;
}
extern "C" uint32_t isaac_room_b20_grid_cell_bits(void) {
  return ISAAC_ROOM_B20_GRID_CELL_BITS;
}
extern "C" uint32_t isaac_room_b20_rng_span_bits(void) {
  return ISAAC_ROOM_B20_RNG_SPAN_BITS;
}
extern "C" uint32_t isaac_room_b20_unit_scale_bits(void) {
  return ISAAC_ROOM_B20_UNIT_SCALE_BITS;
}
extern "C" uint32_t isaac_room_b20_rng_radius_bits(void) {
  return ISAAC_ROOM_B20_RNG_RADIUS_BITS;
}
extern "C" uint32_t isaac_room_b20_type_range_base(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_B20_TYPE_RANGE_BASE);
}
extern "C" uint32_t isaac_room_b20_type_range_span(void) {
  return ISAAC_ROOM_B20_TYPE_RANGE_SPAN;
}
extern "C" uint32_t isaac_room_b20_mode_gate(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_B20_MODE_GATE);
}
extern "C" uint32_t isaac_room_b20_default_field184_gate(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_B20_DEFAULT_FIELD184_GATE);
}
extern "C" uint32_t isaac_room_b20_entity_type_offset(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_B20_ENTITY_TYPE_OFF);
}
extern "C" uint32_t isaac_room_b20_entity_variant_offset(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_B20_ENTITY_VARIANT_OFF);
}
extern "C" uint32_t isaac_room_b20_entity_subtype_offset(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_B20_ENTITY_SUBTYPE_OFF);
}
extern "C" uint32_t isaac_room_b20_entity_pos_x_offset(void) {
  return ISAAC_ROOM_B20_ENTITY_POS_X_OFF;
}
extern "C" uint32_t isaac_room_b20_entity_pos_y_offset(void) {
  return ISAAC_ROOM_B20_ENTITY_POS_Y_OFF;
}
extern "C" uint32_t isaac_room_b20_entity_flags_168_offset(void) {
  return ISAAC_ROOM_B20_ENTITY_FLAGS_168_OFF;
}
extern "C" uint32_t isaac_room_b20_entity_flags_16c_offset(void) {
  return ISAAC_ROOM_B20_ENTITY_FLAGS_16C_OFF;
}
extern "C" uint32_t isaac_room_b20_entity_field_184_offset(void) {
  return ISAAC_ROOM_B20_ENTITY_FIELD_184_OFF;
}
extern "C" uint32_t isaac_room_b20_entity_field_32c_offset(void) {
  return ISAAC_ROOM_B20_ENTITY_FIELD_32C_OFF;
}
extern "C" uint32_t isaac_room_b20_entity_field_370_offset(void) {
  return ISAAC_ROOM_B20_ENTITY_FIELD_370_OFF;
}
extern "C" uint32_t isaac_room_b20_entity_field_3bc_offset(void) {
  return ISAAC_ROOM_B20_ENTITY_FIELD_3BC_OFF;
}
extern "C" uint32_t isaac_room_b20_entity_field_3c0_offset(void) {
  return ISAAC_ROOM_B20_ENTITY_FIELD_3C0_OFF;
}
extern "C" uint32_t isaac_room_b20_entity_field_3ec_offset(void) {
  return ISAAC_ROOM_B20_ENTITY_FIELD_3EC_OFF;
}
extern "C" uint32_t isaac_room_b20_list_begin_va(void) {
  return ISAAC_ROOM_B20_LIST_BEGIN_VA;
}
extern "C" uint32_t isaac_room_b20_list_end_va(void) {
  return ISAAC_ROOM_B20_LIST_END_VA;
}
extern "C" uint32_t isaac_room_b20_list_cap_va(void) {
  return ISAAC_ROOM_B20_LIST_CAP_VA;
}
extern "C" uint32_t isaac_room_b20_spawn_pos_vec_ptr(void) {
  return ISAAC_ROOM_B20_SPAWN_POS_VEC_PTR;
}
extern "C" uint32_t isaac_room_b20_game_mode_offset(void) {
  return ISAAC_ROOM_B20_GAME_MODE_OFF;
}

extern "C" uint32_t isaac_room_b20_host_va_list_test(void) {
  return ISAAC_ROOM_B20_HOST_VA_LIST_TEST;
}
extern "C" uint32_t isaac_room_b20_host_va_pass1(void) {
  return ISAAC_ROOM_B20_HOST_VA_PASS1;
}
extern "C" uint32_t isaac_room_b20_host_va_pass2(void) {
  return ISAAC_ROOM_B20_HOST_VA_PASS2;
}
extern "C" uint32_t isaac_room_b20_host_va_flagged_genrand(void) {
  return ISAAC_ROOM_B20_HOST_VA_FLAGGED_GENRAND;
}
extern "C" uint32_t isaac_room_b20_host_va_multispawn(void) {
  return ISAAC_ROOM_B20_HOST_VA_MULTISPAWN;
}
extern "C" uint32_t isaac_room_b20_host_va_collect_or_4080(void) {
  return ISAAC_ROOM_B20_HOST_VA_COLLECT_OR_4080;
}
extern "C" uint32_t isaac_room_b20_host_va_pair_y(void) {
  return ISAAC_ROOM_B20_HOST_VA_PAIR_Y;
}
extern "C" uint32_t isaac_room_b20_host_va_default_field184(void) {
  return ISAAC_ROOM_B20_HOST_VA_DEFAULT_FIELD184;
}
extern "C" uint32_t isaac_room_b20_host_va_default_rng(void) {
  return ISAAC_ROOM_B20_HOST_VA_DEFAULT_RNG;
}
extern "C" uint32_t isaac_room_b20_host_va_pair_x(void) {
  return ISAAC_ROOM_B20_HOST_VA_PAIR_X;
}
extern "C" uint32_t isaac_room_b20_host_va_vector_push(void) {
  return ISAAC_ROOM_B20_HOST_VA_VECTOR_PUSH;
}
extern "C" uint32_t isaac_room_b20_host_va_spawn(void) {
  return ISAAC_ROOM_B20_HOST_VA_SPAWN;
}
extern "C" uint32_t isaac_room_b20_host_va_genrand(void) {
  return ISAAC_ROOM_B20_HOST_VA_GENRAND;
}
extern "C" uint32_t isaac_room_b20_host_va_sin(void) {
  return ISAAC_ROOM_B20_HOST_VA_SIN;
}
extern "C" uint32_t isaac_room_b20_host_va_cos(void) {
  return ISAAC_ROOM_B20_HOST_VA_COS;
}
extern "C" uint32_t isaac_room_b20_host_va_pos_pack(void) {
  return ISAAC_ROOM_B20_HOST_VA_POS_PACK;
}
extern "C" uint32_t isaac_room_b20_host_va_deallocate(void) {
  return ISAAC_ROOM_B20_HOST_VA_DEALLOCATE;
}
extern "C" uint32_t isaac_room_b20_host_va_flag_clear(void) {
  return ISAAC_ROOM_B20_HOST_VA_FLAG_CLEAR;
}
extern "C" uint32_t isaac_room_b20_host_va_free(void) {
  return ISAAC_ROOM_B20_HOST_VA_FREE;
}
extern "C" uint32_t isaac_room_b20_host_va_epilogue(void) {
  return ISAAC_ROOM_B20_HOST_VA_EPILOGUE;
}

/* PE: sub eax,edx; sar eax,2. */
extern "C" int32_t isaac_room_b20_list_count(uint32_t list_begin,
                                             uint32_t list_end) {
  const int32_t delta =
      static_cast<int32_t>(list_end) - static_cast<int32_t>(list_begin);
  return delta >> 2;
}

extern "C" int32_t isaac_room_b20_list_empty(int32_t list_count) {
  return list_count == 0 ? 1 : 0;
}

/* PE: inc; cmp; jb — index/count treated as unsigned for the jb. */
extern "C" int32_t isaac_room_b20_list_continue(uint32_t index,
                                                int32_t list_count) {
  const uint32_t next = index + 1u;
  return next < static_cast<uint32_t>(list_count) ? 1 : 0;
}

extern "C" int32_t isaac_room_b20_pass1_type_match(int32_t entity_type_28) {
  if (entity_type_28 == ISAAC_ROOM_B20_PASS1_TYPE_A) return 1;
  if (entity_type_28 == ISAAC_ROOM_B20_PASS1_TYPE_B) return 1;
  if (entity_type_28 == ISAAC_ROOM_B20_PASS1_TYPE_C) return 1;
  if (entity_type_28 == ISAAC_ROOM_B20_PASS1_TYPE_D) return 1;
  return 0;
}

extern "C" uint32_t isaac_room_b20_flag_or_4000(uint32_t flags_16c) {
  return flags_16c | ISAAC_ROOM_B20_FLAG_BIT_4000;
}

extern "C" uint32_t isaac_room_b20_flag_clear_4000(uint32_t flags_16c) {
  return flags_16c & ISAAC_ROOM_B20_FLAG_CLEAR_MASK;
}

extern "C" int32_t isaac_room_b20_entity_is_flagged(uint32_t flags_16c) {
  return (flags_16c & ISAAC_ROOM_B20_FLAG_BIT_4000) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_room_b20_entity_is_pair_x(int32_t entity_type_28) {
  if (entity_type_28 == ISAAC_ROOM_B20_PAIR_X_TYPE_A) return 1;
  if (entity_type_28 == ISAAC_ROOM_B20_PAIR_X_TYPE_B) return 1;
  if (entity_type_28 == ISAAC_ROOM_B20_PAIR_X_TYPE_C) return 1;
  if (entity_type_28 == ISAAC_ROOM_B20_PAIR_X_TYPE_D) return 1;
  if (entity_type_28 == ISAAC_ROOM_B20_PAIR_X_TYPE_E) return 1;
  if (entity_type_28 == ISAAC_ROOM_B20_PAIR_X_TYPE_F) return 1;
  if (entity_type_28 == ISAAC_ROOM_B20_PAIR_X_TYPE_G) return 1;
  return 0;
}

extern "C" int32_t isaac_room_b20_entity_is_pair_y(int32_t entity_type_28) {
  return entity_type_28 == ISAAC_ROOM_B20_PAIR_Y_TYPE ? 1 : 0;
}

extern "C" int32_t isaac_room_b20_pass2_action(uint32_t flags_16c,
                                               int32_t entity_type_28) {
  if (isaac_room_b20_entity_is_flagged(flags_16c) != 0) {
    return ISAAC_ROOM_B20_ACTION_FLAGGED;
  }
  if (isaac_room_b20_entity_is_pair_x(entity_type_28) != 0) {
    return ISAAC_ROOM_B20_ACTION_PAIR_X;
  }
  if (isaac_room_b20_entity_is_pair_y(entity_type_28) != 0) {
    return ISAAC_ROOM_B20_ACTION_PAIR_Y;
  }
  return ISAAC_ROOM_B20_ACTION_DEFAULT;
}

extern "C" int32_t isaac_room_b20_flagged_multispawn_enter(uint32_t field_3c0) {
  return field_3c0 == 0u ? 1 : 0;
}

/* PE: child!=0 && ((mode>=2 && type==1) || (type-10u) < 0x3de). */
extern "C" int32_t isaac_room_b20_chain_continue(
    uint32_t child_ptr_3bc, int32_t timed_transition_cleanup_mode,
    int32_t child_type_28) {
  if (child_ptr_3bc == 0u) return 0;
  if (timed_transition_cleanup_mode >= ISAAC_ROOM_B20_MODE_GATE &&
      child_type_28 == 1) {
    return 1;
  }
  const uint32_t range =
      static_cast<uint32_t>(child_type_28) -
      static_cast<uint32_t>(ISAAC_ROOM_B20_TYPE_RANGE_BASE);
  return range < ISAAC_ROOM_B20_TYPE_RANGE_SPAN ? 1 : 0;
}

extern "C" uint32_t isaac_room_b20_spawn_flag_or_80(uint32_t flags_16c) {
  return flags_16c | ISAAC_ROOM_B20_SPAWN_FLAG_BIT_80;
}

extern "C" uint32_t isaac_room_b20_collect_flag_or_4080(uint32_t flags_16c) {
  /* PE 0x008063f0: or dword ptr [ecx+0x16c], 0x4080 */
  return flags_16c | ISAAC_ROOM_B20_COLLECT_FLAG_BITS;
}

extern "C" int32_t isaac_room_b20_default_field184_is_special(int32_t field_184) {
  /* PE 0x008065a5: cmp dword ptr [esi+0x184], 5; jne default-alt */
  return field_184 == ISAAC_ROOM_B20_DEFAULT_FIELD184_GATE ? 1 : 0;
}

extern "C" int32_t isaac_room_b20_vector_needs_free(uint32_t vector_begin_ptr) {
  /* PE 0x0080686e: test esi,esi; je epilogue */
  return vector_begin_ptr != 0u ? 1 : 0;
}

extern "C" int32_t isaac_room_b20_collect_loop_enter(int32_t collect_count) {
  /* PE 0x008063b7 / 0x00806840: test count; je skip */
  return collect_count != 0 ? 1 : 0;
}

namespace {

inline float b20_f32_bits(uint32_t bits) {
  return __builtin_bit_cast(float, bits);
}

}  // namespace

extern "C" float isaac_room_b20_unit_float(uint32_t genrand) {
  /* PE after genrand @ 0x0080620b…0x00806223 (also default @ 0x008065c7):
     MSVC u32→f32 + DAT_00ba9ff4. B20-named (no ambient/7230 symbol reuse). */
  const int32_t as_signed = static_cast<int32_t>(genrand);
  double d = static_cast<double>(as_signed);
  if ((genrand >> 31) != 0u) {
    d += 4294967296.0; /* DAT_00bacb00[1] = 2^32 as f64 */
  }
  const float as_f32 = static_cast<float>(d);
  return as_f32 * b20_f32_bits(ISAAC_ROOM_B20_UNIT_SCALE_BITS);
}

extern "C" float isaac_room_b20_angle_from_unit(float unit) {
  /* PE: mulss DAT_00baa704 (π); addss self → unit * 2π */
  float angle = unit * b20_f32_bits(ISAAC_ROOM_B20_RNG_SPAN_BITS);
  angle = angle + angle;
  return angle;
}

extern "C" float isaac_room_b20_angle_from_genrand(uint32_t genrand) {
  return isaac_room_b20_angle_from_unit(isaac_room_b20_unit_float(genrand));
}

extern "C" float isaac_room_b20_dir_scale_grid(float dir) {
  /* PE 0x0080626b / 0x00806273: mulss DAT_00baa904 (40.0) */
  return dir * b20_f32_bits(ISAAC_ROOM_B20_GRID_CELL_BITS);
}

extern "C" float isaac_room_b20_dir_scale_radius(float dir) {
  /* PE 0x00806600 / 0x00806625: mulss DAT_00baa87c (20.0) */
  return dir * b20_f32_bits(ISAAC_ROOM_B20_RNG_RADIUS_BITS);
}

extern "C" void isaac_room_b20_pair_x_left(float pos_x, float pos_y,
                                           IsaacRoomB20Pos2* out) {
  if (out == nullptr) return;
  const float off = b20_f32_bits(ISAAC_ROOM_B20_PAIR_X_OFFSET_BITS);
  out->x = pos_x - off;
  out->y = pos_y - 0.0f; /* PE subss with xorps zero */
}

extern "C" void isaac_room_b20_pair_x_right(float pos_x, float pos_y,
                                            IsaacRoomB20Pos2* out) {
  if (out == nullptr) return;
  const float off = b20_f32_bits(ISAAC_ROOM_B20_PAIR_X_OFFSET_BITS);
  out->x = pos_x + off;
  out->y = pos_y + 0.0f;
}

extern "C" void isaac_room_b20_pair_y_up(float pos_x, float pos_y,
                                         IsaacRoomB20Pos2* out) {
  if (out == nullptr) return;
  const float off = b20_f32_bits(ISAAC_ROOM_B20_PAIR_Y_OFFSET_BITS);
  out->x = pos_x + 0.0f;
  out->y = pos_y + off;
}

extern "C" void isaac_room_b20_pair_y_down(float pos_x, float pos_y,
                                           IsaacRoomB20Pos2* out) {
  if (out == nullptr) return;
  const float off = b20_f32_bits(ISAAC_ROOM_B20_PAIR_Y_OFFSET_BITS);
  out->x = pos_x - 0.0f;
  out->y = pos_y - off;
}

extern "C" void isaac_room_b20_flagged_spawn_offset(float pos_x, float pos_y,
                                                    float sin_a, float cos_a,
                                                    IsaacRoomB20Pos2* out) {
  /* PE 0x008062a1…0x008062b9: x += cos*40; y += sin*40 */
  if (out == nullptr) return;
  out->x = pos_x + isaac_room_b20_dir_scale_grid(cos_a);
  out->y = pos_y + isaac_room_b20_dir_scale_grid(sin_a);
}

extern "C" void isaac_room_b20_default_spawn_offset(float pos_x, float pos_y,
                                                    float sin_a, float cos_a,
                                                    IsaacRoomB20Pos2* out) {
  /* PE 0x00806600…0x00806641: x += cos*20; y += sin*20 */
  if (out == nullptr) return;
  out->x = pos_x + isaac_room_b20_dir_scale_radius(cos_a);
  out->y = pos_y + isaac_room_b20_dir_scale_radius(sin_a);
}

extern "C" void isaac_room_b20_residual_plan(uint32_t list_begin_c82674,
                                             uint32_t list_end_c82678,
                                             IsaacRoomB20ResidualPlan* out) {
  if (out == nullptr) return;
  const int32_t outer =
      isaac_room_b20_needs_trail_host(list_begin_c82674, list_end_c82678);
  out->needs_host = outer;
  out->list_count =
      isaac_room_b20_list_count(list_begin_c82674, list_end_c82678);
  if (outer == 0) {
    out->residual_kind = ISAAC_ROOM_B20_RESIDUAL_NONE;
    out->pure_complete = 1;
    out->host_needed = 0;
    out->list_count = 0;
    return;
  }
  /* begin!=end always hosts (SEH/local vector/free even when count==0). */
  out->residual_kind = ISAAC_ROOM_B20_RESIDUAL_HOST_TRAIL;
  out->pure_complete = 0;
  out->host_needed = 1;
}

extern "C" void isaac_room_b20_wire_decide(int32_t list_ready,
                                           uint32_t list_begin_c82674,
                                           uint32_t list_end_c82678,
                                           IsaacRoomB20ResidualPlan* out) {
  if (out == nullptr) return;
  if (list_ready == 0) {
    out->needs_host = 0;
    out->residual_kind = ISAAC_ROOM_B20_RESIDUAL_MONOLITHIC;
    out->pure_complete = 0;
    out->host_needed = 1;
    out->list_count = 0;
    return;
  }
  isaac_room_b20_residual_plan(list_begin_c82674, list_end_c82678, out);
}

/* B8: (int)Game+0x264f8 % 3 == 0 && cell_count > 0. Signed % matches PE idiv. */
extern "C" int32_t isaac_room_b8_needs_path_cost_host(int32_t frame_counter_264f8,
                                                      int32_t cell_count) {
  if (!(cell_count > 0)) return 0;
  return (frame_counter_264f8 % 3) == 0 ? 1 : 0;
}

/* B13 ambient: FUN_00824800 pure float shell (PE DAT_00baa08c / DAT_00baa06c). */
extern "C" void isaac_room_ambient_824800_float_step(
    IsaacRoomAmbient824800State* state) {
  if (state == nullptr) return;
  if (!(state->count_7454 > 0)) return;
  /* PE: xorps xmm0; comiss xmm0, intensity; jae epilog → skip when !(0 < i). */
  if (!(0.0f < state->intensity_7458)) return;

  const float decay = __builtin_bit_cast(float, 0x3ca3d70au);   /* DAT_00baa08c */
  const float threshold = __builtin_bit_cast(float, 0x3c23d70au); /* DAT_00baa06c */
  float intensity = state->intensity_7458;
  if ((state->flag_745c & 0xffu) != 0u) {
    intensity = intensity - decay;
    if (intensity < 0.0f) intensity = 0.0f; /* maxss with +0.0 */
    state->intensity_7458 = intensity;
  }
  intensity = state->intensity_7458;
  /* PE: comiss threshold, intensity; jbe host_spawn; else intensity=0; ret */
  if (threshold > intensity) {
    state->intensity_7458 = 0.0f;
  }
}

extern "C" int32_t isaac_room_ambient_824800_needs_spawn_host(
    const IsaacRoomAmbient824800State* state_post) {
  if (state_post == nullptr) return 0;
  if (!(state_post->count_7454 > 0)) return 0;
  const float threshold = __builtin_bit_cast(float, 0x3c23d70au);
  /* Host when threshold <= intensity (PE jbe into spawn body). */
  return !(threshold > state_post->intensity_7458) ? 1 : 0;
}

/* FUN_007f01c0: host when gate==0 && not special 0x10/0x23 && players>0. */
extern "C" int32_t isaac_room_ambient_7f01c0_needs_host(int32_t gate_1b83c,
                                                        uint32_t desc_present,
                                                        int32_t desc_type_8,
                                                        int32_t desc_id_0,
                                                        int32_t player_count) {
  if (gate_1b83c != 0) return 0;
  if (desc_present != 0u && desc_type_8 == 0x10 && desc_id_0 == 0x23) return 0;
  if (player_count == 0) return 0;
  return 1;
}

/* FUN_00824ee0: host when velocity != PE zero vector (exact equality). */
extern "C" int32_t isaac_room_ambient_24ee0_needs_host(float vel_x_7460,
                                                       float vel_y_7464) {
  const float zx = __builtin_bit_cast(float, 0x3760371cu); /* DAT_00c7b640 */
  const float zy = __builtin_bit_cast(float, 0x37873770u); /* DAT_00c7b644 */
  if (vel_x_7460 == zx && vel_y_7464 == zy) return 0;
  return 1;
}

/* FUN_008024f0: (flags >> 1) & 1 → early-out skip body. */
extern "C" uint32_t isaac_room_ambient_8024f0_flags_early_out(
    uint32_t room_desc_flags_44) {
  return ((room_desc_flags_44 >> 1) & 1u) != 0u ? 1u : 0u;
}

extern "C" int32_t isaac_room_ambient_special_1023_needs_host(
    uint32_t desc_present, int32_t desc_type_8, int32_t desc_id_0) {
  if (desc_present == 0u) return 0;
  if (desc_type_8 != 0x10) return 0;
  if (desc_id_0 != 0x23) return 0;
  return 1;
}

extern "C" void isaac_room_ambient_greed_stage_remap(int32_t difficulty_269c8,
                                                     int32_t* stage,
                                                     int32_t* stage_type) {
  if (stage == nullptr || stage_type == nullptr) return;
  if (!(difficulty_269c8 == 2 || difficulty_269c8 == 3)) return;
  const int32_t s = *stage;
  if (s <= 4) {
    *stage = s * 2 - 1;
  } else {
    *stage = (s == 5) ? 10 : 0;
  }
  *stage_type = 0;
}

extern "C" int32_t isaac_room_ambient_stage_spawn_may_rng(int32_t stage,
                                                          int32_t stage_type) {
  const int32_t s = stage;
  const int32_t t = stage_type;
  /* Outer spawn path (variant 0x29) entry predicates before RNG. */
  if ((s == 3 || s == 4) && t == 0) return 1;
  if ((s == 7 || s == 8) && t == 0) return 1;
  if ((s == 5 || s == 6) && t == 2) return 1;
  /* Else-branch RNG gates (still may call genrand / spawn 0x29 or 0x57). */
  if ((s == 3 || s == 4) && t == 2) return 1;
  if ((s == 7 || s == 8) && t == 2) return 1;
  if ((s == 1 || s == 2) && (t == 2 || t == 4 || t == 5)) return 1;
  return 0;
}

/* H3: pure-complete skip when not mode-44 and dim==2. */
extern "C" int32_t isaac_room_ambient_mode_sfx_needs_host(int32_t mode_26584,
                                                          int32_t dim_1830c) {
  if (mode_26584 != 0x2c && dim_1830c == 2) return 0;
  return 1;
}

/* PE signed remainder for power-of-two 4 (and 0x80000003 sequence).
   Uses uint32 intermediates so INT_MIN-1 is well-defined (matches idiv). */
static int32_t pe_signed_mod4(int32_t value) {
  uint32_t eax = static_cast<uint32_t>(value) & 0x80000003u;
  if (static_cast<int32_t>(eax) >= 0) return static_cast<int32_t>(eax);
  eax = eax - 1u;
  eax = eax | 0xfffffffcu;
  eax = eax + 1u;
  return static_cast<int32_t>(eax);
}

extern "C" int32_t isaac_room_ambient_mode_sfx_may_play(int32_t stage_id,
                                                        int32_t frame_264f8) {
  if (stage_id != 0x1b) return 0;
  return pe_signed_mod4(frame_264f8) == 0 ? 1 : 0;
}

/* H7 FUN_0074e9b0 pure-false without host callees. */
extern "C" int32_t isaac_room_ambient_74e9b0_pure_false(int32_t difficulty_269c8,
                                                        int32_t stage_0,
                                                        uint32_t flags_2654c) {
  if (difficulty_269c8 == 2 || difficulty_269c8 == 3) return 1;
  /* PE: dec stage; cmp 5; ja skip_curse — unsigned, so stage in [1,6]. */
  const uint32_t dec = static_cast<uint32_t>(stage_0) - 1u;
  if (dec <= 5u) {
    if ((flags_2654c & 0x10000u) != 0u) return 1;
  }
  return 0;
}

/* FUN_004217a0 pure bit test (low 64-bit word covers clamped id 0..0x34). */
extern "C" int32_t isaac_game_challenge_bitset_test_low(uint64_t word0,
                                                        int32_t challenge_id) {
  int32_t eax = challenge_id;
  if (eax <= 0) eax = 0;
  int32_t esi = 0x34;
  if (eax < esi) esi = eax;
  const uint32_t bit = static_cast<uint32_t>(esi) & 0x3fu;
  const uint64_t mask = uint64_t{1} << bit;
  return (word0 & mask) != 0 ? 1 : 0;
}

/* Level::HasAbandonedMineshaft pure classify (exact ZHL VA 0x0074efd0). */
extern "C" int32_t isaac_level_has_abandoned_mineshaft_pure(
    int32_t difficulty_269c8, int32_t stage_0, int32_t stage_type_4,
    uint32_t flags_2654c) {
  if (difficulty_269c8 == 2 || difficulty_269c8 == 3) return 0;
  const uint32_t dec = static_cast<uint32_t>(stage_0) - 1u;
  if (dec <= 5u) {
    if ((flags_2654c & 0x10000u) != 0u) return 0;
  }
  if (!(stage_type_4 == 4 || stage_type_4 == 5)) return 0;
  if (stage_0 == 4) return 1;
  if (stage_0 != 3) return 0;
  return -1; /* host FUN_00748490; test al&2 */
}

/* H5 body cadence after force-entry. */
extern "C" int32_t isaac_room_ambient_824a70_cadence_may_body(
    uint32_t room_active_byte0, int32_t frame_264f8, int32_t room_entry_11f0) {
  if ((room_active_byte0 & 0xffu) != 0u) {
    const int32_t age = frame_264f8 - room_entry_11f0;
    if (age == 0) return 1;
  }
  /* PE: cdq; idiv 0xd2; test edx. C++ % matches toward-zero for typical
     non-negative frame counters. */
  return (frame_264f8 % 0xd2) == 0 ? 1 : 0;
}

extern "C" int32_t isaac_room_ambient_824a70_needs_host(
    int32_t mode_26584, int32_t dim_1830c, int32_t stage_id_resolved,
    int32_t room_type_8, int32_t room_subtype_1bb0, int32_t game_18304,
    int32_t difficulty_269c8, int32_t stage_0, int32_t stage_type_4,
    uint32_t flags_2654c, uint32_t room_active_byte0, int32_t frame_264f8,
    int32_t room_entry_11f0) {
  /* Mode 44 always hosts FUN_0074f690 before stage resolution. */
  if (mode_26584 == 0x2c) return 1;

  const int32_t sid = (dim_1830c == 2) ? 0x23 : stage_id_resolved;
  int32_t force = 0;
  if (sid == 0x21 || sid == 0x1c) force = 1;
  if (room_type_8 == 5 && room_subtype_1bb0 == 0x5b) force = 1;
  if (game_18304 == -16) force = 1;

  if (force == 0) {
    const int32_t mh = isaac_level_has_abandoned_mineshaft_pure(
        difficulty_269c8, stage_0, stage_type_4, flags_2654c);
    if (mh < 0) return 1; /* host FUN_00748490 */
    if (mh == 1 && dim_1830c == 1) force = 1;
    if (force == 0 && dim_1830c == 0) return 0; /* pure epilog */
  }

  return isaac_room_ambient_824a70_cadence_may_body(room_active_byte0, frame_264f8,
                                                    room_entry_11f0);
}

/* Mid-tail restock outer gate (PE after FUN_00800500 / before Room+0x7230).
   Residual inventory called this "challenge 0x209"; exact ZHL at 0x009be080 is
   PlayerManager::FirstCollectibleOwner(0x209, …). Body peels: helpers ABI v23. */
extern "C" int32_t isaac_room_mid_restock_needs_host(
    int32_t room_type_8, uint32_t collectible_owner_0x209_nonzero,
    uint32_t room_active_byte0, int32_t frame_264f8, int32_t room_entry_11f0) {
  if (room_type_8 != 2) return 0;
  if (collectible_owner_0x209_nonzero == 0u) return 0;
  if ((room_active_byte0 & 0xffu) == 0u) return 0;
  /* PE: 1 < (int)frame - entry  ⇔  signed age > 1. */
  const int32_t age = frame_264f8 - room_entry_11f0;
  if (!(1 < age)) return 0;
  return 1;
}

/* Mid-restock body: signed int16 short gate @ 0x0080544a…0x00805469. */
extern "C" int32_t isaac_room_mid_restock_desc_gate(int32_t desc_short_ac,
                                                    int32_t desc_short_ae) {
  const int16_t ac = static_cast<int16_t>(desc_short_ac & 0xffff);
  const int16_t ae = static_cast<int16_t>(desc_short_ae & 0xffff);
  /* PE: test cx,cx; jle skip  →  !(ac > 0) skip  ⇔  need ac > 0. */
  if (!(ac > 0)) return 0;
  /* PE: cmp dx,cx; jge body; cmp dx,-1; jne skip. */
  if (ae >= ac) return 1;
  if (ae == static_cast<int16_t>(-1)) return 1;
  return 0;
}

extern "C" uint32_t isaac_room_mid_restock_collectible_id(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_MID_RESTOCK_COLLECTIBLE_ID);
}
extern "C" uint32_t isaac_room_mid_restock_rng_shift1(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_MID_RESTOCK_RNG_SHIFT1);
}
extern "C" uint32_t isaac_room_mid_restock_rng_shift2(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_MID_RESTOCK_RNG_SHIFT2);
}
extern "C" uint32_t isaac_room_mid_restock_rng_shift3(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_MID_RESTOCK_RNG_SHIFT3);
}

extern "C" uint32_t isaac_room_mid_restock_host_va_outer(void) {
  return 0x00805408u;
}
extern "C" uint32_t isaac_room_mid_restock_host_va_owner(void) {
  return 0x009be080u; /* exact ZHL FirstCollectibleOwner */
}
extern "C" uint32_t isaac_room_mid_restock_host_va_body(void) {
  return 0x0080544au;
}
extern "C" uint32_t isaac_room_mid_restock_host_va_random_int(void) {
  return 0x007e9020u; /* exact ZHL RNG::RandomInt */
}
extern "C" uint32_t isaac_room_mid_restock_host_va_write(void) {
  return 0x0080549eu;
}
extern "C" uint32_t isaac_room_mid_restock_host_va_next(void) {
  return 0x008054abu; /* Room+0x7230 countdown */
}

/* PE RNG::Next body embedded in RandomInt (0x007e9042…0x007e9060). */
extern "C" uint32_t isaac_room_mid_restock_rng_next(uint32_t* seed_inout,
                                                    uint32_t shift1,
                                                    uint32_t shift2,
                                                    uint32_t shift3) {
  if (seed_inout == nullptr) return 0u;
  uint32_t seed = *seed_inout;
  /* eax = (seed >> shift1) ^ seed */
  uint32_t eax = (seed >> (shift1 & 31u)) ^ seed;
  /* edx = (eax << shift2) ^ eax */
  uint32_t edx = (eax << (shift2 & 31u)) ^ eax;
  /* eax = (edx >> shift3) ^ edx; store */
  eax = (edx >> (shift3 & 31u)) ^ edx;
  *seed_inout = eax;
  return eax;
}

/* Pure RNG::RandomInt (exact ZHL 0x007e9020) without zero-seed fatal. */
extern "C" uint32_t isaac_room_mid_restock_random_int(uint32_t* seed_inout,
                                                      uint32_t shift1,
                                                      uint32_t shift2,
                                                      uint32_t shift3,
                                                      uint32_t max) {
  if (seed_inout == nullptr) return 0u;
  if (*seed_inout == 0u) {
    /* PE: FUN_00a112c0("RNG Seed is zero!") then int3 — host fatal. */
    return 0u;
  }
  const uint32_t next =
      isaac_room_mid_restock_rng_next(seed_inout, shift1, shift2, shift3);
  if (max == 0u) return 0u;
  return next % max;
}

/* Full mid-restock body after outer gate (PE 0x0080544a…0x008054a4). */
extern "C" int32_t isaac_room_mid_restock_body_apply(int32_t desc_short_ac,
                                                     int32_t desc_short_ae,
                                                     uint32_t desc_seed_58,
                                                     int32_t* out_ae) {
  if (isaac_room_mid_restock_desc_gate(desc_short_ac, desc_short_ae) == 0) {
    return 0;
  }
  if (desc_seed_58 == 0u) {
    return -1; /* host fatal FUN_00a112c0 */
  }
  /* Stack RNG: seed=desc+0x58; shifts from DAT_00b1f528/530 = {1,0x1b,0x1b}. */
  uint32_t seed = desc_seed_58;
  /* PE: movsx eax, cx  (cx holds signed ac short). */
  const int16_t ac = static_cast<int16_t>(desc_short_ac & 0xffff);
  const uint32_t max = static_cast<uint32_t>(static_cast<int32_t>(ac));
  const uint32_t rolled = isaac_room_mid_restock_random_int(
      &seed, static_cast<uint32_t>(ISAAC_ROOM_MID_RESTOCK_RNG_SHIFT1),
      static_cast<uint32_t>(ISAAC_ROOM_MID_RESTOCK_RNG_SHIFT2),
      static_cast<uint32_t>(ISAAC_ROOM_MID_RESTOCK_RNG_SHIFT3), max);
  /* PE: movzx ecx, ax; mov word [desc+0xae], cx — low 16 of RandomInt. */
  if (out_ae != nullptr) {
    *out_ae = static_cast<int32_t>(static_cast<int16_t>(rolled & 0xffffu));
  }
  return 1;
}

extern "C" void isaac_room_mid_restock_wire_decide(
    int32_t outer_ready, int32_t desc_ready, int32_t room_type_8,
    uint32_t collectible_owner_0x209_nonzero, uint32_t room_active_byte0,
    int32_t frame_264f8, int32_t room_entry_11f0, int32_t desc_short_ac,
    int32_t desc_short_ae, uint32_t desc_seed_58, int32_t* out_residual_kind,
    int32_t* out_ae, int32_t* out_applied) {
  auto set_kind = [&](int32_t kind) {
    if (out_residual_kind != nullptr) *out_residual_kind = kind;
  };
  auto set_applied = [&](int32_t v) {
    if (out_applied != nullptr) *out_applied = v;
  };

  set_applied(0);
  if (outer_ready == 0) {
    /* Missing outer inputs → keep monolithic host residual. */
    set_kind(ISAAC_ROOM_MID_RESTOCK_RESIDUAL_MONOLITHIC);
    return;
  }
  if (isaac_room_mid_restock_needs_host(room_type_8, collectible_owner_0x209_nonzero,
                                        room_active_byte0, frame_264f8,
                                        room_entry_11f0) == 0) {
    set_kind(ISAAC_ROOM_MID_RESTOCK_RESIDUAL_NONE);
    return;
  }
  if (desc_ready == 0) {
    set_kind(ISAAC_ROOM_MID_RESTOCK_RESIDUAL_MONOLITHIC);
    return;
  }
  const int32_t rc =
      isaac_room_mid_restock_body_apply(desc_short_ac, desc_short_ae, desc_seed_58,
                                        out_ae);
  if (rc < 0) {
    set_kind(ISAAC_ROOM_MID_RESTOCK_RESIDUAL_HOST_FATAL);
    return;
  }
  if (rc == 0) {
    set_kind(ISAAC_ROOM_MID_RESTOCK_RESIDUAL_NONE);
    return;
  }
  set_applied(1);
  set_kind(ISAAC_ROOM_MID_RESTOCK_RESIDUAL_PURE_COMPLETE);
}

/* ---- Mid-restock residual HOST pure islands (helpers ABI v27 freestanding).
   FirstCollectibleOwner call-site imms + pure CF around nested host callees.
   Body pure-complete remains v23; Update wire remains v46. ---- */

extern "C" uint32_t isaac_room_mid_restock_owner_laz_shared_tag(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_MID_RESTOCK_OWNER_LAZ_SHARED_TAG);
}
extern "C" uint32_t isaac_room_mid_restock_owner_rng_game_offset(void) {
  return ISAAC_ROOM_MID_RESTOCK_OWNER_RNG_GAME_OFF;
}
extern "C" uint32_t isaac_room_mid_restock_desc_off_ac(void) {
  return ISAAC_ROOM_MID_RESTOCK_DESC_OFF_AC;
}
extern "C" uint32_t isaac_room_mid_restock_desc_off_ae(void) {
  return ISAAC_ROOM_MID_RESTOCK_DESC_OFF_AE;
}
extern "C" uint32_t isaac_room_mid_restock_desc_off_seed58(void) {
  return ISAAC_ROOM_MID_RESTOCK_DESC_OFF_SEED58;
}
extern "C" uint32_t isaac_room_mid_restock_host_va_seed_fatal(void) {
  return 0x00a112c0u; /* FUN_00a112c0 inside RNG::RandomInt seed==0 */
}
extern "C" uint32_t isaac_room_mid_restock_host_va_get_collectible(void) {
  return 0x0072fd10u; /* exact ItemConfig::GetCollectible */
}
extern "C" uint32_t isaac_room_mid_restock_host_va_has_collectible(void) {
  return 0x007706e0u; /* address-stable HasCollectible-shaped walk */
}

extern "C" int32_t isaac_room_mid_restock_frame_age(int32_t frame_264f8,
                                                     int32_t room_entry_11f0) {
  /* PE signed int32 sub @ 0x0080543f. */
  return frame_264f8 - room_entry_11f0;
}

extern "C" int32_t isaac_room_mid_restock_age_opens_body(int32_t age) {
  /* PE: cmp eax,1; jle skip  →  need 1 < age. */
  return (1 < age) ? 1 : 0;
}

extern "C" int32_t isaac_room_mid_restock_owner_twin_walk_flag(
    uint32_t laz_shared_tag, uint32_t config_ptr_nonzero, uint32_t config_field_b8) {
  /* PE FCO @ 0x009be0a7…0x009be0ce. */
  if ((laz_shared_tag & 0xffu) == 0u) return 0;
  if (config_ptr_nonzero == 0u) return 0;
  if ((config_field_b8 & ISAAC_ROOM_MID_RESTOCK_OWNER_CONFIG_TWIN_BIT) == 0u) {
    return 0;
  }
  return 1;
}

extern "C" int32_t isaac_room_mid_restock_owner_list_empty(uint32_t list_begin,
                                                           uint32_t list_end) {
  /* PE: cmp esi, [edi+4]; je empty. */
  return list_begin == list_end ? 1 : 0;
}

extern "C" int32_t isaac_room_mid_restock_owner_player_slot_active(
    uint32_t player_field_2c) {
  /* PE: cmp dword [player+0x2c], 0; jne skip → active when zero. */
  return player_field_2c == 0u ? 1 : 0;
}

extern "C" int32_t isaac_room_mid_restock_owner_twin_present(uint32_t twin_ptr) {
  /* PE: test ecx,ecx; je skip twin HasCollectible. */
  return twin_ptr != 0u ? 1 : 0;
}

extern "C" int32_t isaac_room_mid_restock_owner_has_collectible_hit(
    uint32_t al_byte) {
  /* PE: test al,al / jne return player. */
  return (al_byte & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_room_mid_restock_owner_list_continue(uint32_t list_cur,
                                                              uint32_t list_end) {
  /* PE: add esi,4; cmp esi, [eax+4]; jne loop.
     list_cur is the pre-advance cursor; continue when cur+4 != end. */
  const uint32_t next =
      list_cur + ISAAC_ROOM_MID_RESTOCK_OWNER_LIST_STRIDE;
  return next != list_end ? 1 : 0;
}

/* ---- Room+0x7230 spawn residual pure islands (helpers ABI v28 freestanding).
   Type/variant imms + opaque_call_00813460 genrand consumer posts. Host still
   owns genrand×2, 813520, 428b20, RTTI. ---- */

extern "C" uint32_t isaac_room_7230_spawn_type(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_7230_SPAWN_TYPE);
}
extern "C" uint32_t isaac_room_7230_spawn_variant(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_7230_SPAWN_VARIANT);
}
extern "C" uint32_t isaac_room_7230_spawn_pos_vec_ptr(void) {
  return ISAAC_ROOM_7230_SPAWN_POS_VEC_PTR;
}
extern "C" uint32_t isaac_room_7230_spawn_arg_ptr_a(void) {
  return ISAAC_ROOM_7230_SPAWN_ARG_PTR_A;
}
extern "C" uint32_t isaac_room_7230_spawn_arg_ptr_b(void) {
  return ISAAC_ROOM_7230_SPAWN_ARG_PTR_B;
}
extern "C" uint32_t isaac_room_7230_spawn_game_room_offset(void) {
  return ISAAC_ROOM_7230_SPAWN_GAME_ROOM_OFF;
}
extern "C" uint32_t isaac_room_7230_spawn_pos_zero_arg(void) {
  /* PE push edx (remainder 0) twice before call 0x813460. */
  return 0u;
}

extern "C" uint32_t isaac_room_7230_host_va_countdown(void) {
  return ISAAC_ROOM_7230_HOST_VA_COUNTDOWN;
}
extern "C" uint32_t isaac_room_7230_host_va_spawn_body(void) {
  return ISAAC_ROOM_7230_HOST_VA_SPAWN_BODY;
}
extern "C" uint32_t isaac_room_7230_host_va_pos(void) {
  return ISAAC_ROOM_7230_HOST_VA_POS;
}
extern "C" uint32_t isaac_room_7230_host_va_pos_finish(void) {
  return ISAAC_ROOM_7230_HOST_VA_POS_FINISH;
}
extern "C" uint32_t isaac_room_7230_host_va_genrand(void) {
  return ISAAC_ROOM_7230_HOST_VA_GENRAND;
}
extern "C" uint32_t isaac_room_7230_host_va_spawn(void) {
  return ISAAC_ROOM_7230_HOST_VA_SPAWN;
}
extern "C" uint32_t isaac_room_7230_host_va_rtti(void) {
  return ISAAC_ROOM_7230_HOST_VA_RTTI;
}
extern "C" uint32_t isaac_room_7230_host_va_next(void) {
  return ISAAC_ROOM_7230_HOST_VA_NEXT;
}

extern "C" void isaac_room_7230_spawn_spans(float room_f14, float room_f18,
                                            float room_f1c, float room_f20,
                                            IsaacRoom7230SpawnSpans* out) {
  if (out == nullptr) return;
  /* PE 0x0048e0c..0x00813486 (v47 axis fix, hash 5129DF72…):
     0x0081346c movss xmm0,[edi+0x1c]; 0x00813471 subss xmm0,[edi+0x14]
       → [esp+8] = f1c − f14 is the X span
     0x0081347c movss xmm0,[edi+0x20]; 0x00813481 subss xmm0,[edi+0x18]
       → [esp+4] = f20 − f18 is the Y span
     Center consumers: xmm3 = [esp+4] (Y) → +[edi+0x18]; xmm2 = [esp+8] (X)
     → +[edi+0x14] (0x008134c4..0x008134ec). Kept byte-for-byte. */
  out->span_x = room_f1c - room_f14;
  out->span_y = room_f20 - room_f18;
}

extern "C" float isaac_room_7230_spawn_unit_float(uint32_t genrand) {
  /* PE 0x008134a2…0x008134cf inside 813460: same MSVC u32→unit as H5 R0 path.
     7230-named to avoid ambient_824a70 symbol collision. */
  const int32_t as_signed = static_cast<int32_t>(genrand);
  double d = static_cast<double>(as_signed);
  if ((genrand >> 31) != 0u) {
    d += 4294967296.0; /* DAT_00bacb00[1] = 2^32 as f64 */
  }
  const float as_f32 = static_cast<float>(d);
  const float unit_scale =
      __builtin_bit_cast(float, ISAAC_ROOM_7230_SPAWN_UNIT_SCALE_BITS);
  return as_f32 * unit_scale;
}

extern "C" float isaac_room_7230_spawn_center_x(float room_f14, float span_x) {
  /* PE 0x008134c7 (v47 axis fix): mulss span_x, DAT_00baa2d0; addss
     room+0x14 — X centre = x0 + (x1-x0)*0.5, feeds 813520 local[0]. */
  const float half = __builtin_bit_cast(float, ISAAC_ROOM_7230_SPAWN_HALF_BITS);
  return room_f14 + span_x * half;
}

extern "C" float isaac_room_7230_spawn_center_y(float room_f18, float span_y) {
  /* PE 0x008134db: mulss span_y, DAT_00baa2d0; addss room+0x18 — Y centre =
     y0 + (y1-y0)*0.5, feeds 813520 local[4]. */
  const float half = __builtin_bit_cast(float, ISAAC_ROOM_7230_SPAWN_HALF_BITS);
  return room_f18 + span_y * half;
}

extern "C" float isaac_room_7230_spawn_max_span(float span_x, float span_y) {
  /* PE maxss xmm0, xmm2 with xmm0=span_x, xmm2=span_y:
     return span_y unless span_x is strictly greater. */
  return (span_x > span_y) ? span_x : span_y;
}

extern "C" float isaac_room_7230_spawn_radius_arg(float unit, float max_span) {
  /* PE: mulss unit, max_span → first float arg toward 813520. */
  return unit * max_span;
}

extern "C" void isaac_room_7230_spawn_pos_posts(uint32_t genrand, float room_f14,
                                                float room_f18, float room_f1c,
                                                float room_f20,
                                                IsaacRoom7230SpawnPosPosts* out) {
  if (out == nullptr) return;
  IsaacRoom7230SpawnSpans spans{};
  isaac_room_7230_spawn_spans(room_f14, room_f18, room_f1c, room_f20, &spans);
  const float unit = isaac_room_7230_spawn_unit_float(genrand);
  const float max_span =
      isaac_room_7230_spawn_max_span(spans.span_x, spans.span_y);
  out->span_x = spans.span_x;
  out->span_y = spans.span_y;
  out->unit = unit;
  /* v47 axis fix: X centre uses +0x14 (x0), Y centre uses +0x18 (y0). */
  out->center_x = isaac_room_7230_spawn_center_x(room_f14, spans.span_x);
  out->center_y = isaac_room_7230_spawn_center_y(room_f18, spans.span_y);
  out->max_span = max_span;
  out->radius_arg = isaac_room_7230_spawn_radius_arg(unit, max_span);
}

/* H5 body pure setup (VA 0x00824b4c…0x00824bad). */
extern "C" void isaac_room_ambient_824a70_body_bounds(
    uint32_t room_active_byte0, int32_t frame_264f8, int32_t room_entry_11f0,
    float room_f14, float room_f18, float room_f1c, float room_f20,
    IsaacRoomAmbient824a70BodyBounds* out) {
  if (out == nullptr) return;

  int32_t age;
  if ((room_active_byte0 & 0xffu) == 0u) {
    age = -1; /* PE: or ecx, 0xffffffff */
  } else {
    age = frame_264f8 - room_entry_11f0;
  }

  /* PE: test ecx,ecx; sete al; lea eax,[eax*4+1] → age==0 ? 5 : 1 */
  const int32_t loop_count = (age == 0) ? 5 : 1;

  const float pad = __builtin_bit_cast(float, 0x42200000u);   /* DAT_00baa904=40 */
  const float y_ext = __builtin_bit_cast(float, 0x43fa0000u); /* DAT_00baab7c=500 */

  const float min_x = room_f18 - pad;
  const float max_x = room_f20 + pad;
  const float span_x = max_x - min_x;
  const float base_y = room_f14;
  const float span_y = (room_f1c + y_ext) - base_y;

  out->min_x = min_x;
  out->span_x = span_x;
  out->base_y = base_y;
  out->span_y = span_y;
  out->room_y_1c = room_f1c;
  out->age = age;
  out->loop_count = loop_count;
}

/* H5 body pure color (VA 0x00824d50…0x00824e50). Bits-exact PE immediates. */
extern "C" void isaac_room_ambient_824a70_body_color(
    int32_t stage_id, int32_t room_1d18, int32_t dim_1830c,
    IsaacRoomAmbient824a70Color* out) {
  if (out == nullptr) return;

  float r, g, b;
  if (stage_id == 0x1b) {
    r = __builtin_bit_cast(float, 0x3f60e0e2u);
    g = __builtin_bit_cast(float, 0x3f75f5f7u);
    b = __builtin_bit_cast(float, 0x3f79f9fbu);
  } else if (room_1d18 == 0x2c || room_1d18 == 0x2b) {
    r = __builtin_bit_cast(float, 0x3f0c8c8du);
    g = __builtin_bit_cast(float, 0x3e28a8a9u);
    b = __builtin_bit_cast(float, 0x3e28a8a9u);
  } else if (room_1d18 == 0xd) {
    r = __builtin_bit_cast(float, 0x3f56d6d8u);
    g = __builtin_bit_cast(float, 0x3f6aeaecu);
    b = __builtin_bit_cast(float, 0x3f79f9fbu);
  } else if (stage_id == 0x1c) {
    r = __builtin_bit_cast(float, 0x3e60e0e2u);
    g = __builtin_bit_cast(float, 0x3e8c8c8du);
    b = __builtin_bit_cast(float, 0x3db0b0b1u);
  } else if (stage_id == 0x1d || stage_id == 0x1e) {
    r = __builtin_bit_cast(float, 0x3ec8c8cau);
    g = __builtin_bit_cast(float, 0x3ea0a0a1u);
    b = __builtin_bit_cast(float, 0x3f028283u);
  } else if (dim_1830c == 2) {
    r = __builtin_bit_cast(float, 0x3ef0f0f2u);
    g = __builtin_bit_cast(float, 0x3ef0f0f2u);
    b = __builtin_bit_cast(float, 0x3ef0f0f2u);
  } else {
    r = __builtin_bit_cast(float, 0x3ee0e0e2u);
    g = __builtin_bit_cast(float, 0x3f0c8c8du);
    b = __builtin_bit_cast(float, 0x3e34b4b5u);
  }
  out->r = r;
  out->g = g;
  out->b = b;
}

extern "C" int32_t isaac_room_ambient_824a70_body_y_override_applies(int32_t age) {
  /* PE 0x00824c3a: je skip_override when age==0 (ZF from cmp [esp+0x10],0). */
  return age != 0 ? 1 : 0;
}

extern "C" float isaac_room_ambient_824a70_body_y_override(float room_y_1c) {
  const float add = __builtin_bit_cast(float, 0x44160000u); /* DAT_00baab98=600 */
  return room_y_1c + add;
}

/* ---- H5 body residual pure post-RNG unit-float posts (helpers ABI v21) ---- */

extern "C" float isaac_room_ambient_824a70_body_unit_float(uint32_t genrand) {
  /* PE after Isaac::genrand_int32: MSVC u32→f32 via signed double +
     DAT_00bacb00 bias table, then * DAT_00ba9ff4 (0x2f800000). */
  const int32_t as_signed = static_cast<int32_t>(genrand);
  double d = static_cast<double>(as_signed);
  if ((genrand >> 31) != 0u) {
    d += 4294967296.0; /* DAT_00bacb00[1] = 2^32 as f64 */
  }
  const float as_f32 = static_cast<float>(d);
  const float unit_scale = __builtin_bit_cast(float, 0x2f800000u); /* DAT_00ba9ff4 */
  return as_f32 * unit_scale;
}

extern "C" float isaac_room_ambient_824a70_body_pos_axis(float base, float unit,
                                                         float span) {
  /* PE R0/R1: mulss span, unit; addss base. */
  return base + unit * span;
}

extern "C" float isaac_room_ambient_824a70_body_z(float unit) {
  /* PE R2: movss DAT_00baad10; mulss unit, DAT_00baa2d0; subss. */
  const float z_base = __builtin_bit_cast(float, 0xbe800000u); /* −0.25 */
  const float z_span = __builtin_bit_cast(float, 0x3f000000u); /* 0.5 */
  return z_base - unit * z_span;
}

extern "C" float isaac_room_ambient_824a70_body_scale(float unit) {
  /* PE R7: mulss DAT_00baa1f8; addss DAT_00baa354. */
  const float mul = __builtin_bit_cast(float, 0x3e99999au); /* 0.3 */
  const float add = __builtin_bit_cast(float, 0x3f333333u); /* 0.7 */
  return unit * mul + add;
}

/* ---- H5 body residual pure posts beyond unit-float (helpers ABI v22) ---- */

extern "C" uint32_t isaac_room_ambient_824a70_body_flag_bit(uint32_t genrand) {
  /* PE R5/R6: and al, 1 → entity+0x148 / +0x149. */
  return genrand & 1u;
}

extern "C" int32_t isaac_room_ambient_824a70_body_anim_frame_genrand_needed(
    uint32_t anim_count) {
  /* PE 0x00824cd8: test edi, edi; je skip genrand. */
  return anim_count != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_room_ambient_824a70_body_anim_frame(
    uint32_t genrand, uint32_t anim_count) {
  /* PE R4: xor edx,edx; div edi; mov edi, edx (unsigned remainder).
     count==0 path keeps frame 0 without dividing. */
  if (anim_count == 0u) return 0u;
  return genrand % anim_count;
}

extern "C" float isaac_room_ambient_824a70_body_anim_frame_f32(
    int32_t frame_index) {
  /* PE A2: movd xmm1, edi; cvtdq2ps xmm1, xmm1. */
  return static_cast<float>(frame_index);
}

/* ---- H5 create residual pure CF (helpers ABI v25; shipped as part of v26) ---- */

extern "C" int32_t isaac_room_ambient_824a70_body_anim_frame_apply_needed(
    uint32_t a1_ok, uint32_t field_34) {
  /* PE 0x00824cf5…0x00824cfe: test al,al; je skip; test [esi+0x34]; je skip. */
  return (a1_ok != 0u && field_34 != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_room_ambient_824a70_body_anim_frame_clear_needed(
    uint32_t field_34_post) {
  /* PE 0x00824d0f…0x00824d16: re-test [esi+0x34] after host 0x408e00. */
  return field_34_post != 0u ? 1 : 0;
}

extern "C" void isaac_room_ambient_824a70_body_anim_frame_posts(
    uint32_t genrand, uint32_t anim_count,
    IsaacRoomAmbient824a70AnimFramePosts* out) {
  if (out == nullptr) return;
  const int32_t needed =
      isaac_room_ambient_824a70_body_anim_frame_genrand_needed(anim_count);
  const uint32_t frame =
      isaac_room_ambient_824a70_body_anim_frame(genrand, anim_count);
  out->genrand_needed = needed;
  out->frame = frame;
  /* PE cvtdq2ps of the frame dword (edi after R4 / 0 when skipped). */
  out->frame_f32 = isaac_room_ambient_824a70_body_anim_frame_f32(
      static_cast<int32_t>(frame));
}

/* ---- H5 create residual LC pure CF (helpers ABI v33 create-only) ---- */

extern "C" int32_t isaac_room_ambient_824a70_body_layer_color_write_needed(
    uint32_t layer_ptr, uint32_t stack_color_ptr) {
  /* PE 0x00824e94…0x00824e9d:
     lea ecx, [eax+0x48]; lea eax, [esp+0x44]; cmp ecx,eax; je skip. */
  const uint32_t dest =
      layer_ptr + (uint32_t)ISAAC_ROOM_AMBIENT_824A70_LAYER_COLOR_OFF;
  return dest != stack_color_ptr ? 1 : 0;
}

extern "C" void isaac_room_ambient_824a70_body_layer_color_pads(
    IsaacRoomAmbient824a70LayerColorPads* out) {
  if (out == nullptr) return;
  /* PE zeros at [esp+0x64/0x68/0x6c] written @ 0x00824d32…0x00824d48. */
  out->qword_lo = 0u;
  out->qword_hi = 0u;
  out->dword = 0u;
}

extern "C" void isaac_room_ambient_824a70_body_layer_color_plan(
    uint32_t layer_ptr, uint32_t stack_color_ptr, float r, float g, float b,
    uint32_t alpha_defined, float alpha,
    IsaacRoomAmbient824a70LayerColorPlan* out) {
  if (out == nullptr) return;
  out->write_needed = isaac_room_ambient_824a70_body_layer_color_write_needed(
      layer_ptr, stack_color_ptr);
  out->r = r;
  out->g = g;
  out->b = b;
  out->alpha_defined = alpha_defined != 0u ? 1u : 0u;
  out->alpha = alpha;
  out->pad_qword_lo = 0u;
  out->pad_qword_hi = 0u;
  out->pad_dword = 0u;
  out->color_off = (uint32_t)ISAAC_ROOM_AMBIENT_824A70_LAYER_COLOR_OFF;
  out->zero16_off = (uint32_t)ISAAC_ROOM_AMBIENT_824A70_LAYER_COLOR_ZERO16_OFF;
  out->pad_qword_off =
      (uint32_t)ISAAC_ROOM_AMBIENT_824A70_LAYER_COLOR_PAD_QWORD_OFF;
  out->pad_dword_off =
      (uint32_t)ISAAC_ROOM_AMBIENT_824A70_LAYER_COLOR_PAD_DWORD_OFF;
}

/* ---- H5 create residual deepen C0/A0/A1/A2/GetLayer (helpers ABI 39 create-only) ---- */

extern "C" uint32_t isaac_room_ambient_824a70_effect_type(void) {
  return (uint32_t)ISAAC_ROOM_AMBIENT_824A70_EFFECT_TYPE;
}
extern "C" uint32_t isaac_room_ambient_824a70_effect_variant(void) {
  return (uint32_t)ISAAC_ROOM_AMBIENT_824A70_EFFECT_VARIANT;
}
extern "C" uint32_t isaac_room_ambient_824a70_layer_index(void) {
  return (uint32_t)ISAAC_ROOM_AMBIENT_824A70_LAYER_INDEX;
}
extern "C" uint32_t isaac_room_ambient_824a70_anm_data_ptr(void) {
  return ISAAC_ROOM_AMBIENT_824A70_ANM_DATA_PTR;
}
extern "C" uint32_t isaac_room_ambient_824a70_a1_arg(void) {
  return (uint32_t)ISAAC_ROOM_AMBIENT_824A70_A1_ARG;
}
extern "C" uint32_t isaac_room_ambient_824a70_entity_anm2_off(void) {
  return ISAAC_ROOM_AMBIENT_824A70_ENTITY_ANM2_OFF;
}
extern "C" uint32_t isaac_room_ambient_824a70_anim_count_off(void) {
  return ISAAC_ROOM_AMBIENT_824A70_ANIM_COUNT_OFF;
}
extern "C" uint32_t isaac_room_ambient_824a70_anm2_field_34_off(void) {
  return ISAAC_ROOM_AMBIENT_824A70_ANM2_FIELD_34_OFF;
}
extern "C" uint32_t isaac_room_ambient_824a70_anm2_field_44_off(void) {
  return ISAAC_ROOM_AMBIENT_824A70_ANM2_FIELD_44_OFF;
}
extern "C" uint32_t isaac_room_ambient_824a70_a2_this_off(void) {
  return ISAAC_ROOM_AMBIENT_824A70_A2_THIS_OFF;
}
extern "C" uint32_t isaac_room_ambient_824a70_vcall_off(void) {
  return ISAAC_ROOM_AMBIENT_824A70_VCALL_OFF;
}
extern "C" uint32_t isaac_room_ambient_824a70_create_arg_zero(void) {
  return ISAAC_ROOM_AMBIENT_824A70_CREATE_ARG_ZERO;
}
extern "C" uint32_t isaac_room_ambient_824a70_game_ptr_global(void) {
  return ISAAC_ROOM_AMBIENT_824A70_GAME_PTR_GLOBAL;
}

extern "C" uint32_t isaac_room_ambient_824a70_host_va_create(void) {
  return ISAAC_ROOM_AMBIENT_824A70_HOST_VA_CREATE;
}
extern "C" uint32_t isaac_room_ambient_824a70_host_va_create_site(void) {
  return ISAAC_ROOM_AMBIENT_824A70_HOST_VA_CREATE_SITE;
}
extern "C" uint32_t isaac_room_ambient_824a70_host_va_create_start(void) {
  return ISAAC_ROOM_AMBIENT_824A70_HOST_VA_CREATE_START;
}
extern "C" uint32_t isaac_room_ambient_824a70_host_va_a0(void) {
  return ISAAC_ROOM_AMBIENT_824A70_HOST_VA_A0;
}
extern "C" uint32_t isaac_room_ambient_824a70_host_va_a0_site(void) {
  return ISAAC_ROOM_AMBIENT_824A70_HOST_VA_A0_SITE;
}
extern "C" uint32_t isaac_room_ambient_824a70_host_va_a1(void) {
  return ISAAC_ROOM_AMBIENT_824A70_HOST_VA_A1;
}
extern "C" uint32_t isaac_room_ambient_824a70_host_va_a1_site(void) {
  return ISAAC_ROOM_AMBIENT_824A70_HOST_VA_A1_SITE;
}
extern "C" uint32_t isaac_room_ambient_824a70_host_va_a2(void) {
  return ISAAC_ROOM_AMBIENT_824A70_HOST_VA_A2;
}
extern "C" uint32_t isaac_room_ambient_824a70_host_va_a2_site(void) {
  return ISAAC_ROOM_AMBIENT_824A70_HOST_VA_A2_SITE;
}
extern "C" uint32_t isaac_room_ambient_824a70_host_va_getlayer(void) {
  return ISAAC_ROOM_AMBIENT_824A70_HOST_VA_GETLAYER;
}
extern "C" uint32_t isaac_room_ambient_824a70_host_va_getlayer_site(void) {
  return ISAAC_ROOM_AMBIENT_824A70_HOST_VA_GETLAYER_SITE;
}
extern "C" uint32_t isaac_room_ambient_824a70_host_va_vcall_site(void) {
  return ISAAC_ROOM_AMBIENT_824A70_HOST_VA_VCALL_SITE;
}

extern "C" uint32_t isaac_room_ambient_824a70_entity_anm2_ptr(uint32_t entity_ptr) {
  /* PE 0x00824ccb: lea esi, [eax+0x48] (entity* in eax). */
  return entity_ptr + ISAAC_ROOM_AMBIENT_824A70_ENTITY_ANM2_OFF;
}

extern "C" uint32_t isaac_room_ambient_824a70_a2_this_ptr(uint32_t anm2_ptr) {
  /* PE 0x00824d04: lea ecx, [esi+0x30] before host 0x408e00. */
  return anm2_ptr + ISAAC_ROOM_AMBIENT_824A70_A2_THIS_OFF;
}

extern "C" void isaac_room_ambient_824a70_create_args_plan(
    uint32_t seed, IsaacRoomAmbient824a70CreateArgsPlan* out) {
  if (out == nullptr) return;
  /* PE 0x00824c9c…0x00824cbd: type/variant + three zero pads around R3 seed. */
  out->effect_type = (uint32_t)ISAAC_ROOM_AMBIENT_824A70_EFFECT_TYPE;
  out->effect_variant = (uint32_t)ISAAC_ROOM_AMBIENT_824A70_EFFECT_VARIANT;
  out->arg4_zero = ISAAC_ROOM_AMBIENT_824A70_CREATE_ARG_ZERO;
  out->arg5_zero = ISAAC_ROOM_AMBIENT_824A70_CREATE_ARG_ZERO;
  out->seed = seed;
  out->arg7_zero = ISAAC_ROOM_AMBIENT_824A70_CREATE_ARG_ZERO;
  out->game_ptr_global = ISAAC_ROOM_AMBIENT_824A70_GAME_PTR_GLOBAL;
}

extern "C" void isaac_room_ambient_824a70_create_host_gates(
    uint32_t anim_count, uint32_t a1_ok, uint32_t field_34,
    uint32_t field_34_post, IsaacRoomAmbient824a70CreateHostGates* out) {
  if (out == nullptr) return;
  const int32_t r4 =
      isaac_room_ambient_824a70_body_anim_frame_genrand_needed(anim_count);
  const int32_t apply =
      isaac_room_ambient_824a70_body_anim_frame_apply_needed(a1_ok, field_34);
  /* PE-accurate: clear never reached when dual gate closed. */
  const int32_t clear =
      apply == 0
          ? 0
          : isaac_room_ambient_824a70_body_anim_frame_clear_needed(field_34_post);
  out->r4_genrand_needed = r4;
  out->a2_apply_needed = apply;
  out->a2_clear_needed = clear;
  out->layer_index = (uint32_t)ISAAC_ROOM_AMBIENT_824A70_LAYER_INDEX;
  out->a1_arg = (uint32_t)ISAAC_ROOM_AMBIENT_824A70_A1_ARG;
  out->anm_data_ptr = ISAAC_ROOM_AMBIENT_824A70_ANM_DATA_PTR;
  out->entity_anm2_off = ISAAC_ROOM_AMBIENT_824A70_ENTITY_ANM2_OFF;
  out->anim_count_off = ISAAC_ROOM_AMBIENT_824A70_ANIM_COUNT_OFF;
  out->a2_this_off = ISAAC_ROOM_AMBIENT_824A70_A2_THIS_OFF;
  out->field_34_off = ISAAC_ROOM_AMBIENT_824A70_ANM2_FIELD_34_OFF;
  out->field_44_off = ISAAC_ROOM_AMBIENT_824A70_ANM2_FIELD_44_OFF;
  out->vcall_off = ISAAC_ROOM_AMBIENT_824A70_VCALL_OFF;
  out->host_c0 = 1;
  out->host_a0 = 1;
  out->host_a1 = 1;
  out->host_a2 = apply;
  out->host_l0 = 1;
  out->host_v0 = 1;
}

/* ---- H5 residual plan / wire matrix (helpers ABI v24 freestanding) ---- */

namespace {

void ambient_824a70_fill_plan(int32_t needs, int32_t residual_kind,
                              int32_t loop_count, int32_t age,
                              IsaacRoomAmbient824a70ResidualPlan* out) {
  out->needs_host = needs != 0 ? 1 : 0;
  out->residual_kind = residual_kind;
  out->pure_complete =
      residual_kind == ISAAC_ROOM_AMBIENT_824A70_RESIDUAL_NONE ? 1 : 0;
  out->host_needed = out->pure_complete == 0 ? 1 : 0;
  out->loop_count = loop_count;
  out->age = age;
}

/* Cadence age/loop_count only (same as body_bounds; no room floats needed). */
void ambient_824a70_cadence_age_loop(uint32_t room_active_byte0,
                                     int32_t frame_264f8,
                                     int32_t room_entry_11f0, int32_t* out_age,
                                     int32_t* out_loop) {
  int32_t age;
  if ((room_active_byte0 & 0xffu) == 0u) {
    age = -1;
  } else {
    age = frame_264f8 - room_entry_11f0;
  }
  *out_age = age;
  *out_loop = (age == 0) ? 5 : 1;
}

}  // namespace

extern "C" void isaac_room_ambient_824a70_residual_plan(
    int32_t mode_26584, int32_t dim_1830c, int32_t stage_id_resolved,
    int32_t room_type_8, int32_t room_subtype_1bb0, int32_t game_18304,
    int32_t difficulty_269c8, int32_t stage_0, int32_t stage_type_4,
    uint32_t flags_2654c, uint32_t room_active_byte0, int32_t frame_264f8,
    int32_t room_entry_11f0, IsaacRoomAmbient824a70ResidualPlan* out) {
  if (out == nullptr) return;
  const int32_t needs = isaac_room_ambient_824a70_needs_host(
      mode_26584, dim_1830c, stage_id_resolved, room_type_8, room_subtype_1bb0,
      game_18304, difficulty_269c8, stage_0, stage_type_4, flags_2654c,
      room_active_byte0, frame_264f8, room_entry_11f0);
  if (needs == 0) {
    ambient_824a70_fill_plan(0, ISAAC_ROOM_AMBIENT_824A70_RESIDUAL_NONE, 0, 0,
                             out);
    return;
  }
  int32_t age = 0;
  int32_t loop_count = 0;
  ambient_824a70_cadence_age_loop(room_active_byte0, frame_264f8,
                                  room_entry_11f0, &age, &loop_count);
  ambient_824a70_fill_plan(1, ISAAC_ROOM_AMBIENT_824A70_RESIDUAL_BODY,
                           loop_count, age, out);
}

extern "C" void isaac_room_ambient_824a70_wire_decide(
    int32_t gate_ready, int32_t blob_ready, int32_t mode_26584,
    int32_t dim_1830c, int32_t stage_id_resolved, int32_t room_type_8,
    int32_t room_subtype_1bb0, int32_t game_18304, int32_t difficulty_269c8,
    int32_t stage_0, int32_t stage_type_4, uint32_t flags_2654c,
    uint32_t room_active_byte0, int32_t frame_264f8, int32_t room_entry_11f0,
    IsaacRoomAmbient824a70ResidualPlan* out) {
  if (out == nullptr) return;
  /* Without gate inputs, cannot prove skip → monolithic host. */
  if (gate_ready == 0) {
    ambient_824a70_fill_plan(0, ISAAC_ROOM_AMBIENT_824A70_RESIDUAL_MONOLITHIC, 0,
                             0, out);
    return;
  }
  const int32_t needs = isaac_room_ambient_824a70_needs_host(
      mode_26584, dim_1830c, stage_id_resolved, room_type_8, room_subtype_1bb0,
      game_18304, difficulty_269c8, stage_0, stage_type_4, flags_2654c,
      room_active_byte0, frame_264f8, room_entry_11f0);
  if (needs == 0) {
    ambient_824a70_fill_plan(0, ISAAC_ROOM_AMBIENT_824A70_RESIDUAL_NONE, 0, 0,
                             out);
    return;
  }
  /* needs true: blob holds room floats / color for pure prep. */
  if (blob_ready == 0) {
    ambient_824a70_fill_plan(1, ISAAC_ROOM_AMBIENT_824A70_RESIDUAL_MONOLITHIC, 0,
                             0, out);
    return;
  }
  int32_t age = 0;
  int32_t loop_count = 0;
  ambient_824a70_cadence_age_loop(room_active_byte0, frame_264f8,
                                  room_entry_11f0, &age, &loop_count);
  ambient_824a70_fill_plan(1, ISAAC_ROOM_AMBIENT_824A70_RESIDUAL_BODY,
                           loop_count, age, out);
}

/* ---- B1 first-frame pure islands (helpers ABI v20 + v22 freestanding) ---- */

extern "C" int32_t isaac_room_b1_frame_in_room_gate(uint32_t room_active_byte0,
                                                    int32_t frame_264f8,
                                                    int32_t room_entry_11f0) {
  if ((room_active_byte0 & 0xffu) == 0u) return 0;
  return ((frame_264f8 - room_entry_11f0) == 1) ? 1 : 0;
}

extern "C" int32_t isaac_room_b1_once_flag_clear(uint32_t flags_60e7) {
  return ((flags_60e7 & 0x80000u) == 0u) ? 1 : 0;
}

extern "C" void isaac_room_b1_flag_or_80000(uint32_t* flags_60e7) {
  if (flags_60e7 == nullptr) return;
  /* PE: if ((flags & 0x80000) == 0) flags |= 0x80000; idempotent as always-OR. */
  *flags_60e7 = *flags_60e7 | 0x80000u;
}

/* PE corner table local_1f8[4] from Room+0xc / +0x10 after once-flag OR. */
extern "C" void isaac_room_b1_corner_indices(int32_t width_c, int32_t height_10,
                                             IsaacRoomB1Corners* out_corners) {
  if (out_corners == nullptr) return;
  const int32_t w = width_c;
  const int32_t h = height_10;

  if (w < 2 || h < 2) {
    out_corners->c0 = -1;
  } else {
    out_corners->c0 = w + 1;
  }

  const int32_t col_inner = w - 2;
  if (col_inner < 0 || w <= col_inner || h < 2) {
    out_corners->c1 = -1;
    if (w > 1) {
      const int32_t row_inner = h - 2;
      if (row_inner < 0 || h <= row_inner) {
        out_corners->c2 = -1;
      } else {
        out_corners->c2 = row_inner * w + 1;
      }
    } else {
      out_corners->c2 = -1;
    }
  } else {
    out_corners->c1 = w + col_inner;
    {
      const int32_t row_inner = h - 2;
      if (row_inner < 0 || h <= row_inner) {
        out_corners->c2 = -1;
      } else {
        out_corners->c2 = row_inner * w + 1;
      }
    }
  }

  {
    const int32_t row_inner = h - 2;
    if (col_inner < 0 || w <= col_inner || row_inner < 0 || h <= row_inner) {
      out_corners->c3 = -1;
    } else {
      out_corners->c3 = row_inner * w + w - 2;
    }
  }
}

extern "C" int32_t isaac_room_b1_sfx_needs_host(int32_t room_type_8,
                                                int32_t desc_field_40,
                                                int32_t difficulty_269c8,
                                                int32_t stage_0,
                                                int32_t nested_field_10,
                                                uint32_t flags_60e7,
                                                int32_t boss_id_1bb0) {
  if (room_type_8 != 5) return 0;
  if (desc_field_40 != 1) return 0;
  if (boss_id_1bb0 == 0) return 0;
  /* Third conjunct: (diff not in {2,3}) || stage!=7 || nested!=0 || bit0x1000.
     False only for greed/greedier stage-7 empty-nested without bit 0x1000. */
  const int32_t greed =
      (difficulty_269c8 == 2 || difficulty_269c8 == 3) ? 1 : 0;
  if (greed != 0 && stage_0 == 7 && nested_field_10 == 0 &&
      (flags_60e7 & 0x1000u) == 0u) {
    return 0;
  }
  return 1;
}

extern "C" int32_t isaac_room_b1_spawn_buffer_nonempty(float begin_60e9,
                                                       float end_60ea) {
  /* Legacy float reinterp; PE gate is dword cmp (see nonempty_bits). */
  return (begin_60e9 != end_60ea) ? 1 : 0;
}

extern "C" int32_t isaac_room_b1_spawn_buffer_nonempty_bits(uint32_t begin_183a4,
                                                            uint32_t end_183a8) {
  /* PE ~0x00802b4e: cmp [Game+0x183a4], [Game+0x183a8]; je skip. */
  return (begin_183a4 != end_183a8) ? 1 : 0;
}

extern "C" int32_t isaac_room_b1_once_path_needs_spawn_host(uint32_t flags_60e7,
                                                            uint32_t begin_183a4,
                                                            uint32_t end_183a8) {
  if (isaac_room_b1_once_flag_clear(flags_60e7) == 0) return 0;
  return isaac_room_b1_spawn_buffer_nonempty_bits(begin_183a4, end_183a8);
}

extern "C" int32_t isaac_room_b1_spawn_base_count(int32_t owner_nonzero,
                                                   int32_t quality) {
  /* PE: esi=4; if owner: q-=2 →0 ⇒6; q-=1→0 ⇒8; else keep 4. */
  int32_t base = 4;
  if (owner_nonzero == 0) return base;
  int32_t q = quality - 2;
  if (q == 0) return 6;
  q = q - 1;
  if (q == 0) return 8;
  return base;
}

extern "C" int32_t isaac_room_b1_spawn_count_clamp(int32_t base_count,
                                                    int32_t buffer_byte_len) {
  /* PE signed idiv-by-0x78 via magic 0x88888889, then cmovb min. */
  const int32_t buffer_count = buffer_byte_len / 0x78;
  const uint32_t b = static_cast<uint32_t>(base_count);
  const uint32_t c = static_cast<uint32_t>(buffer_count);
  return static_cast<int32_t>(b < c ? b : c);
}

extern "C" uint32_t isaac_room_b1_rng_xorshift(uint32_t seed) {
  /* DAT_00b1f4ec = {1, 9}; DAT_00b1f4f4 = 0x1d. */
  uint32_t a = (seed >> 1) ^ seed;
  uint32_t b = (a << 9) ^ a;
  return (b >> 29) ^ b;
}

extern "C" int32_t isaac_room_b1_corner_pick(const IsaacRoomB1Corners* corners,
                                             uint32_t rng_state) {
  if (corners == nullptr) return -1;
  const int32_t* table = &corners->c0;
  return table[rng_state & 3u];
}

extern "C" void isaac_room_b1_corner_world_xy(int32_t corner_index, int32_t width_c,
                                              IsaacRoomB1CornerWorld* out_xy) {
  if (out_xy == nullptr) return;
  /* PE idiv width (precondition width != 0). DAT_00baa904=40, DAT_00baaa00=120. */
  const int32_t w = width_c;
  const int32_t quot = corner_index / w;
  const int32_t rem = corner_index % w;
  const float cell = __builtin_bit_cast(float, 0x42200000u); /* 40.0 */
  const float y0 = __builtin_bit_cast(float, 0x42f00000u);   /* 120.0 */
  out_xy->x = static_cast<float>(rem) * cell + cell;
  out_xy->y = static_cast<float>(quot) * cell + y0;
}

extern "C" void isaac_room_b1_entity_post_spawn_mark(int32_t* entity_field_32c) {
  if (entity_field_32c == nullptr) return;
  *entity_field_32c = static_cast<int32_t>(0xffffffffu);
}

/* ---- B1 SFX Play imms + shuffle islands + residual plan (helpers ABI v22) ---- */

namespace {

inline float b1_f32_bits(uint32_t bits) {
  return __builtin_bit_cast(float, bits);
}

inline void b1_fill_sfx_play_imms(IsaacRoomB1ResidualPlan* out) {
  out->sfx_id = static_cast<uint32_t>(ISAAC_ROOM_B1_SFX_ID);
  out->sfx_volume = b1_f32_bits(ISAAC_ROOM_B1_SFX_VOLUME_BITS);
  out->sfx_frame_delay = ISAAC_ROOM_B1_SFX_PLAY_FRAME_DELAY;
  out->sfx_loop = ISAAC_ROOM_B1_SFX_PLAY_LOOP;
  out->sfx_pitch = b1_f32_bits(ISAAC_ROOM_B1_SFX_PLAY_PITCH_BITS);
  out->sfx_pan = b1_f32_bits(ISAAC_ROOM_B1_SFX_PLAY_PAN_BITS);
}

inline void b1_fill_plan_from_kind(int32_t outer_gate, int32_t sfx_needs,
                                   int32_t once_clear, int32_t spawn_needs,
                                   int32_t residual_kind,
                                   IsaacRoomB1ResidualPlan* out) {
  out->outer_gate = outer_gate != 0 ? 1 : 0;
  out->sfx_needs_host = sfx_needs != 0 ? 1 : 0;
  out->once_flag_clear = once_clear != 0 ? 1 : 0;
  out->spawn_needs_host = spawn_needs != 0 ? 1 : 0;
  out->residual_kind = residual_kind;
  out->pure_complete =
      residual_kind == ISAAC_ROOM_B1_RESIDUAL_NONE ? 1 : 0;
  out->host_needed = out->pure_complete == 0 ? 1 : 0;
  out->pure_once_flag_apply =
      (outer_gate != 0 && once_clear != 0) ? 1 : 0;
  b1_fill_sfx_play_imms(out);
}

inline int32_t b1_kind_from_sfx_spawn(int32_t sfx, int32_t spawn) {
  if (sfx != 0 && spawn != 0) return ISAAC_ROOM_B1_RESIDUAL_SFX_SPAWN;
  if (sfx != 0) return ISAAC_ROOM_B1_RESIDUAL_SFX;
  if (spawn != 0) return ISAAC_ROOM_B1_RESIDUAL_SPAWN;
  return ISAAC_ROOM_B1_RESIDUAL_NONE;
}

}  // namespace

extern "C" uint32_t isaac_room_b1_sfx_id(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_B1_SFX_ID);
}

extern "C" float isaac_room_b1_sfx_play_volume(void) {
  return b1_f32_bits(ISAAC_ROOM_B1_SFX_VOLUME_BITS);
}

extern "C" int32_t isaac_room_b1_sfx_play_frame_delay(void) {
  return ISAAC_ROOM_B1_SFX_PLAY_FRAME_DELAY;
}

extern "C" int32_t isaac_room_b1_sfx_play_loop(void) {
  return ISAAC_ROOM_B1_SFX_PLAY_LOOP;
}

extern "C" float isaac_room_b1_sfx_play_pitch(void) {
  return b1_f32_bits(ISAAC_ROOM_B1_SFX_PLAY_PITCH_BITS);
}

extern "C" float isaac_room_b1_sfx_play_pan(void) {
  return b1_f32_bits(ISAAC_ROOM_B1_SFX_PLAY_PAN_BITS);
}

extern "C" uint32_t isaac_room_b1_host_va_sfx(void) {
  return ISAAC_ROOM_B1_HOST_VA_SFX;
}

extern "C" uint32_t isaac_room_b1_host_va_sfx_pre(void) {
  return ISAAC_ROOM_B1_HOST_VA_SFX_PRE;
}

extern "C" uint32_t isaac_room_b1_host_va_sfx_play(void) {
  return ISAAC_ROOM_B1_HOST_VA_SFX_PLAY;
}

extern "C" uint32_t isaac_room_b1_host_va_spawn_setup(void) {
  return ISAAC_ROOM_B1_HOST_VA_SPAWN_SETUP;
}

extern "C" uint32_t isaac_room_b1_host_va_position(void) {
  return ISAAC_ROOM_B1_HOST_VA_POSITION;
}

extern "C" uint32_t isaac_room_b1_host_va_spawn(void) {
  return ISAAC_ROOM_B1_HOST_VA_SPAWN;
}

extern "C" uint32_t isaac_room_b1_host_va_cleanup(void) {
  return ISAAC_ROOM_B1_HOST_VA_CLEANUP;
}

extern "C" uint32_t isaac_room_b1_shuffle_remainder(uint32_t rng_state,
                                                     int32_t remaining) {
  /* PE ~0x00802c6e: test ecx,ecx; je zero; div ecx → edx remainder. */
  if (remaining == 0) return 0u;
  return rng_state % static_cast<uint32_t>(remaining);
}

extern "C" int32_t isaac_room_b1_shuffle_needs_swap(uint32_t remainder) {
  /* PE: lea ecx,[edx+eax]; cmp ecx,eax; je skip_swap. Equivalent: rem!=0. */
  return (remainder != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_room_b1_buffer_elem_stride(void) {
  return ISAAC_ROOM_B1_BUFFER_ELEM_STRIDE;
}

extern "C" int32_t isaac_room_b1_buffer_elem_offset(int32_t index) {
  /* PE: index * 0x78 via (index<<4 - index)*8 = index*0x78. */
  return index * ISAAC_ROOM_B1_BUFFER_ELEM_STRIDE;
}

extern "C" float isaac_room_b1_spawn_radius(void) {
  return b1_f32_bits(ISAAC_ROOM_B1_SPAWN_RADIUS_BITS);
}

extern "C" void isaac_room_b1_fill_sfx_play_imms(IsaacRoomB1ResidualPlan* out) {
  if (out == nullptr) return;
  b1_fill_sfx_play_imms(out);
}

extern "C" void isaac_room_b1_residual_plan(
    uint32_t room_active_byte0, int32_t frame_264f8, int32_t room_entry_11f0,
    int32_t room_type_8, int32_t desc_field_40, int32_t difficulty_269c8,
    int32_t stage_0, int32_t nested_field_10, uint32_t flags_60e7,
    int32_t boss_id_1bb0, uint32_t begin_183a4, uint32_t end_183a8,
    IsaacRoomB1ResidualPlan* out) {
  if (out == nullptr) return;
  const int32_t outer = isaac_room_b1_frame_in_room_gate(
      room_active_byte0, frame_264f8, room_entry_11f0);
  if (outer == 0) {
    b1_fill_plan_from_kind(0, 0, 0, 0, ISAAC_ROOM_B1_RESIDUAL_NONE, out);
    return;
  }
  const int32_t sfx = isaac_room_b1_sfx_needs_host(
      room_type_8, desc_field_40, difficulty_269c8, stage_0, nested_field_10,
      flags_60e7, boss_id_1bb0);
  const int32_t once = isaac_room_b1_once_flag_clear(flags_60e7);
  const int32_t spawn = isaac_room_b1_once_path_needs_spawn_host(
      flags_60e7, begin_183a4, end_183a8);
  b1_fill_plan_from_kind(1, sfx, once, spawn, b1_kind_from_sfx_spawn(sfx, spawn),
                         out);
}

extern "C" void isaac_room_b1_wire_decide(
    int32_t outer_ready, int32_t sfx_ready, int32_t buffer_ready,
    uint32_t room_active_byte0, int32_t frame_264f8, int32_t room_entry_11f0,
    int32_t room_type_8, int32_t desc_field_40, int32_t difficulty_269c8,
    int32_t stage_0, int32_t nested_field_10, uint32_t flags_60e7,
    int32_t boss_id_1bb0, uint32_t begin_183a4, uint32_t end_183a8,
    IsaacRoomB1ResidualPlan* out) {
  if (out == nullptr) return;
  /* Without outer gate inputs, cannot prove skip → monolithic host. */
  if (outer_ready == 0) {
    b1_fill_plan_from_kind(0, 0, 0, 0, ISAAC_ROOM_B1_RESIDUAL_MONOLITHIC, out);
    return;
  }
  const int32_t outer = isaac_room_b1_frame_in_room_gate(
      room_active_byte0, frame_264f8, room_entry_11f0);
  if (outer == 0) {
    b1_fill_plan_from_kind(0, 0, 0, 0, ISAAC_ROOM_B1_RESIDUAL_NONE, out);
    return;
  }
  /* Outer open: need SFX gate inputs; once-path needs buffer ends when clear. */
  const int32_t once = isaac_room_b1_once_flag_clear(flags_60e7);
  if (sfx_ready == 0 || (once != 0 && buffer_ready == 0)) {
    b1_fill_plan_from_kind(1, 0, once, 0, ISAAC_ROOM_B1_RESIDUAL_MONOLITHIC,
                           out);
    /* still mark pure_once_flag_apply when once clear (OR is dual-safe). */
    out->pure_once_flag_apply = once != 0 ? 1 : 0;
    return;
  }
  const int32_t sfx = isaac_room_b1_sfx_needs_host(
      room_type_8, desc_field_40, difficulty_269c8, stage_0, nested_field_10,
      flags_60e7, boss_id_1bb0);
  int32_t spawn = 0;
  if (once != 0) {
    spawn = isaac_room_b1_spawn_buffer_nonempty_bits(begin_183a4, end_183a8);
  }
  b1_fill_plan_from_kind(1, sfx, once, spawn, b1_kind_from_sfx_spawn(sfx, spawn),
                         out);
}

/* ---- B1 spawn-loop pure CF (helpers ABI v26 freestanding) ---- */

extern "C" uint32_t isaac_room_b1_collectible_id(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_B1_COLLECTIBLE_0x89);
}

extern "C" int32_t isaac_room_b1_buffer_byte_len(uint32_t begin_183a4,
                                                  uint32_t end_183a8) {
  /* PE ~0x00802bb6: sub end, begin (x86 dword subtract → signed length). */
  return static_cast<int32_t>(end_183a8 - begin_183a4);
}

extern "C" int32_t isaac_room_b1_spawn_loop_enter(int32_t spawn_count) {
  /* PE ~0x00802c0a: test eax,eax; jle skip. */
  return (spawn_count > 0) ? 1 : 0;
}

extern "C" int32_t isaac_room_b1_loop_remaining(int32_t spawn_count,
                                                 int32_t index) {
  /* PE ~0x00802c20: sub eax, ecx → spawn_count - i. */
  return spawn_count - index;
}

extern "C" int32_t isaac_room_b1_seed_nonzero(uint32_t seed) {
  return (seed != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_room_b1_shuffle_swap_index(int32_t index,
                                                     uint32_t remainder) {
  /* PE ~0x00802c7c: lea ecx, [edx+eax] with edx=rem, eax=i. */
  return index + static_cast<int32_t>(remainder);
}

extern "C" int32_t isaac_room_b1_loop_continue(int32_t next_index,
                                                int32_t spawn_count) {
  /* PE ~0x00802dfe: cmp ecx,eax; jge exit → continue when next < count. */
  return (next_index < spawn_count) ? 1 : 0;
}

extern "C" int32_t isaac_room_b1_spawn_count_resolved(int32_t owner_nonzero,
                                                       int32_t quality,
                                                       uint32_t begin_183a4,
                                                       uint32_t end_183a8) {
  const int32_t base = isaac_room_b1_spawn_base_count(owner_nonzero, quality);
  const int32_t len = isaac_room_b1_buffer_byte_len(begin_183a4, end_183a8);
  return isaac_room_b1_spawn_count_clamp(base, len);
}

extern "C" int32_t isaac_room_b1_position_zero_pad(void) {
  /* PE three push 0 after radius into FUN_00813520. */
  return 0;
}

extern "C" uint32_t isaac_room_b1_host_va_owner(void) {
  return ISAAC_ROOM_B1_HOST_VA_OWNER;
}

extern "C" uint32_t isaac_room_b1_host_va_quality(void) {
  return ISAAC_ROOM_B1_HOST_VA_QUALITY;
}

extern "C" uint32_t isaac_room_b1_host_va_post_bind(void) {
  return ISAAC_ROOM_B1_HOST_VA_POST_BIND;
}

extern "C" uint32_t isaac_room_b1_host_va_shuffle_copy(void) {
  return ISAAC_ROOM_B1_HOST_VA_SHUFFLE_COPY;
}

extern "C" uint32_t isaac_room_b1_host_va_shuffle_assign(void) {
  return ISAAC_ROOM_B1_HOST_VA_SHUFFLE_ASSIGN;
}

extern "C" uint32_t isaac_room_b1_host_va_shuffle_dtor(void) {
  return ISAAC_ROOM_B1_HOST_VA_SHUFFLE_DTOR;
}

extern "C" void isaac_room_b1_spawn_iter_plan(
    uint32_t seed_in, int32_t index, int32_t spawn_count,
    const IsaacRoomB1Corners* corners, int32_t width_c,
    IsaacRoomB1SpawnIterPlan* out) {
  if (out == nullptr) return;
  /* Zero-fill so fatal early-outs leave stable zeros. */
  out->seed_fatal = ISAAC_ROOM_B1_SEED_OK;
  out->remaining = isaac_room_b1_loop_remaining(spawn_count, index);
  out->seed_shuffle = 0u;
  out->shuffle_rem = 0u;
  out->needs_swap = 0;
  out->swap_index = index;
  out->elem_offset = isaac_room_b1_buffer_elem_offset(index);
  out->swap_offset = out->elem_offset;
  out->seed_corner = 0u;
  out->corner_index = -1;
  out->world_x = 0.0f;
  out->world_y = 0.0f;
  out->spawn_radius = isaac_room_b1_spawn_radius();
  out->next_i = index + 1;
  out->continue_loop =
      isaac_room_b1_loop_continue(out->next_i, spawn_count);

  if (isaac_room_b1_seed_nonzero(seed_in) == 0) {
    out->seed_fatal = ISAAC_ROOM_B1_SEED_FATAL_PRE_SHUFFLE;
    return;
  }

  const uint32_t seed_shuffle = isaac_room_b1_rng_xorshift(seed_in);
  out->seed_shuffle = seed_shuffle;
  const uint32_t rem =
      isaac_room_b1_shuffle_remainder(seed_shuffle, out->remaining);
  out->shuffle_rem = rem;
  out->needs_swap = isaac_room_b1_shuffle_needs_swap(rem);
  out->swap_index = isaac_room_b1_shuffle_swap_index(index, rem);
  out->swap_offset = isaac_room_b1_buffer_elem_offset(out->swap_index);

  if (isaac_room_b1_seed_nonzero(seed_shuffle) == 0) {
    out->seed_fatal = ISAAC_ROOM_B1_SEED_FATAL_PRE_CORNER;
    return;
  }

  const uint32_t seed_corner = isaac_room_b1_rng_xorshift(seed_shuffle);
  out->seed_corner = seed_corner;
  out->corner_index = isaac_room_b1_corner_pick(corners, seed_corner);
  if (width_c != 0) {
    IsaacRoomB1CornerWorld world = {};
    isaac_room_b1_corner_world_xy(out->corner_index, width_c, &world);
    out->world_x = world.x;
    out->world_y = world.y;
  }
}

/* B8 pure cell: PE block at ~0x00803cf0…0x00803d50 (no external calls). */
extern "C" void isaac_room_b8_path_cost_cell_step(int32_t* cost_int,
                                                  int16_t* trail_short) {
  if (cost_int != nullptr) {
    const int32_t cost = *cost_int;
    int32_t rem = cost % 1000;
    if (cost == 3999) {
      *cost_int = 900;
    } else if (rem < 0x385) {
      if (100 < rem) {
        rem = 100;
      }
      *cost_int = cost - rem;
    }
  }
  if (trail_short != nullptr) {
    const int16_t trail = *trail_short;
    /* (uint16_t)(trail - 1) < 99  ⇔  trail ∈ [1, 99] */
    if ((uint16_t)(trail - 1) < 99u) {
      const int32_t next = (int32_t)trail - 1;
      int16_t out = 0;
      if (0 < next) {
        out = (int16_t)next;
      }
      *trail_short = out;
    }
  }
}

extern "C" void isaac_room_b8_path_cost_grid_step(int32_t* costs, int16_t* trails,
                                                  int32_t cell_count) {
  if (costs == nullptr || trails == nullptr || !(cell_count > 0)) {
    return;
  }
  for (int32_t i = 0; i < cell_count; ++i) {
    isaac_room_b8_path_cost_cell_step(&costs[i], &trails[i]);
  }
}

/* ---- H5 genrand residual pure CF + sample-stream consumers (helpers ABI v33) ---- */

extern "C" uint32_t isaac_room_ambient_824a70_host_va_r0(void) {
  return ISAAC_ROOM_AMBIENT_824A70_HOST_VA_R0;
}
extern "C" uint32_t isaac_room_ambient_824a70_host_va_r1(void) {
  return ISAAC_ROOM_AMBIENT_824A70_HOST_VA_R1;
}
extern "C" uint32_t isaac_room_ambient_824a70_host_va_r2(void) {
  return ISAAC_ROOM_AMBIENT_824A70_HOST_VA_R2;
}
extern "C" uint32_t isaac_room_ambient_824a70_host_va_r3(void) {
  return ISAAC_ROOM_AMBIENT_824A70_HOST_VA_R3;
}
extern "C" uint32_t isaac_room_ambient_824a70_host_va_r4(void) {
  return ISAAC_ROOM_AMBIENT_824A70_HOST_VA_R4;
}
extern "C" uint32_t isaac_room_ambient_824a70_host_va_r5(void) {
  return ISAAC_ROOM_AMBIENT_824A70_HOST_VA_R5;
}
extern "C" uint32_t isaac_room_ambient_824a70_host_va_r6(void) {
  return ISAAC_ROOM_AMBIENT_824A70_HOST_VA_R6;
}
extern "C" uint32_t isaac_room_ambient_824a70_host_va_r7(void) {
  return ISAAC_ROOM_AMBIENT_824A70_HOST_VA_R7;
}
extern "C" uint32_t isaac_room_ambient_824a70_host_va_genrand(void) {
  return ISAAC_ROOM_AMBIENT_824A70_HOST_VA_GENRAND;
}
extern "C" uint32_t isaac_room_ambient_824a70_host_va_loop(void) {
  return ISAAC_ROOM_AMBIENT_824A70_HOST_VA_LOOP;
}

extern "C" float isaac_room_ambient_824a70_body_pos_y_final(float rng_y,
                                                           int32_t age,
                                                           float room_y_1c) {
  /* PE 0x00824c3a: je skip when age==0; else y = room_y_1c + 600. */
  if (isaac_room_ambient_824a70_body_y_override_applies(age) == 0) {
    return rng_y;
  }
  return isaac_room_ambient_824a70_body_y_override(room_y_1c);
}

extern "C" void isaac_room_ambient_824a70_body_loop_step(
    int32_t loop_count, IsaacRoomAmbient824a70LoopStep* out) {
  if (out == nullptr) return;
  /* PE 0x00824ec7: sub [esp+0x14], 1; jne 0x00824bb3 */
  const int32_t remaining = loop_count - 1;
  out->remaining = remaining;
  out->continue_loop = remaining != 0 ? 1 : 0;
}

extern "C" void isaac_room_ambient_824a70_body_genrand_loop_posts(
    uint32_t g0, uint32_t g1, uint32_t g2, uint32_t g3, uint32_t g5,
    uint32_t g6, uint32_t g7, float min_x, float span_x, float base_y,
    float span_y, int32_t age, float room_y_1c,
    IsaacRoomAmbient824a70GenrandLoopPosts* out) {
  if (out == nullptr) return;

  const float u0 = isaac_room_ambient_824a70_body_unit_float(g0);
  const float u1 = isaac_room_ambient_824a70_body_unit_float(g1);
  const float u2 = isaac_room_ambient_824a70_body_unit_float(g2);
  const float u7 = isaac_room_ambient_824a70_body_unit_float(g7);

  const float x = isaac_room_ambient_824a70_body_pos_axis(min_x, u0, span_x);
  const float y_rng =
      isaac_room_ambient_824a70_body_pos_axis(base_y, u1, span_y);
  const int32_t y_applies =
      isaac_room_ambient_824a70_body_y_override_applies(age);
  const float y =
      isaac_room_ambient_824a70_body_pos_y_final(y_rng, age, room_y_1c);

  out->x = x;
  out->y_rng = y_rng;
  out->y = y;
  out->z = isaac_room_ambient_824a70_body_z(u2);
  out->vel_pad = 0.0f; /* PE dword [esp+0x40] = 0 @ 0x00824c55 */
  out->seed = g3;
  out->flag_148 = isaac_room_ambient_824a70_body_flag_bit(g5);
  out->flag_149 = isaac_room_ambient_824a70_body_flag_bit(g6);
  out->scale = isaac_room_ambient_824a70_body_scale(u7);
  out->y_override_applies = y_applies;
  /* R1 pure: movss [esp+0x38], [esp+0x28] (copy x into create Vector slot). */
  out->pos_x_copy = x;
  /* R6 pure stack pads @ 0x00824d32/40/48 — same zeros as layer_color_pads. */
  {
    IsaacRoomAmbient824a70LayerColorPads pads;
    isaac_room_ambient_824a70_body_layer_color_pads(&pads);
    out->pad_qword_lo = pads.qword_lo;
    out->pad_qword_hi = pads.qword_hi;
    out->pad_dword = pads.dword;
  }
}

/* Genrand residual sample-stream plan (freestanding; ships under helpers ABI 39).
   Shape frozen at ABI 40; superseded for new work by
   isaac_room_ambient_824a70_genrand_mt_plan. */
extern "C" void isaac_room_ambient_824a70_genrand_stream_plan(
    int32_t loop_count, int32_t sample_count,
    IsaacRoomAmbient824a70GenrandStreamPlan* out) {
  if (out == nullptr) return;
  const int32_t lc = loop_count > 0 ? loop_count : 0;
  const int32_t sc = sample_count > 0 ? sample_count : 0;
  out->loop_count = lc;
  out->samples_per_loop =
      static_cast<int32_t>(ISAAC_ROOM_AMBIENT_824A70_GENRAND_SAMPLES_PER_LOOP);
  out->max_genrand_per_loop =
      static_cast<int32_t>(ISAAC_ROOM_AMBIENT_824A70_GENRAND_MAX_PER_LOOP);
  out->samples_needed = lc * out->samples_per_loop;
  out->sample_count = sc;
  if (lc == 0) {
    /* No genrand residual open — vacuous pure-complete. */
    out->samples_ready = 1;
    out->pure_posts_ready = 1;
    out->pure_complete = 1;
    out->host_needed = 0;
    out->requires_sample_stream = 0;
    return;
  }
  /* Host residual open: CALL sites still host; pure posts need sample stream. */
  out->host_needed = 1;
  out->requires_sample_stream = 1; /* pureCompleteRequires host_genrand_sample_stream */
  out->samples_ready = sc >= out->samples_needed ? 1 : 0;
  out->pure_posts_ready = out->samples_ready;
  out->pure_complete = 0; /* never — Isaac::genrand_int32 stays host */
}

/* ---- B9–B11 residual pure peels (helpers ABI v36 freestanding). ---- */

static_assert(sizeof(IsaacRoomB3B7ResidualPlan) == 40,
              "B3B7 residual plan ABI changed");
static_assert(offsetof(IsaacRoomB3B7ResidualPlan, host_needed) == 36,
              "B3B7 residual plan ABI changed");
static_assert(offsetof(IsaacRoomB3B7ResidualPlan, needs_b7_grid_update_host) == 24,
              "B3B7 residual plan ABI changed");
static_assert(sizeof(IsaacRoomB9B11ResidualPlan) == 48,
              "B9B11 residual plan ABI changed");
static_assert(offsetof(IsaacRoomB9B11ResidualPlan, host_needed) == 44,
              "B9B11 residual plan ABI changed");
static_assert(offsetof(IsaacRoomB9B11ResidualPlan, b10_enemies) == 12,
              "B9B11 residual plan ABI changed");

extern "C" int32_t isaac_room_b9b11_frame_age(int32_t frame_264f8,
                                              int32_t room_entry_11f0) {
  return (frame_264f8 - room_entry_11f0);
}

extern "C" int32_t isaac_room_b9b11_challenge_body_needs_host(
    int32_t challenge_result_nonzero, uint32_t room_active_byte0,
    int32_t frame_264f8, int32_t room_entry_11f0, int32_t room_type_8,
    uint32_t room_desc_flags_44) {
  /* PE 0x00803cfe…0x00803d45 after FirstCollectibleOwner. */
  if (challenge_result_nonzero == 0) return 0;
  if ((room_active_byte0 & 0xffu) == 0) return 0;
  if (isaac_room_b9b11_frame_age(frame_264f8, room_entry_11f0) !=
      ISAAC_ROOM_B9B11_CHALLENGE_FRAME_AGE) {
    return 0;
  }
  if (room_type_8 != (int32_t)ISAAC_ROOM_B9B11_CHALLENGE_ROOM_TYPE) return 0;
  if (((room_desc_flags_44 >> 3) & 1u) != 0) return 0;
  return 1;
}

extern "C" int32_t isaac_room_b9b11_mode_hooks_needs_host(
    int32_t room_type_8, uint32_t game_997a_byte) {
  /* PE 0x00803dd9…0x00803ded. */
  if (room_type_8 != (int32_t)ISAAC_ROOM_B9B11_MODE_TYPE_B &&
      room_type_8 != (int32_t)ISAAC_ROOM_B9B11_MODE_TYPE_11) {
    return 0;
  }
  if ((game_997a_byte & 0xffu) == 0) return 0;
  return 1;
}

extern "C" int32_t isaac_room_b9b11_flag_11f4_needs_host(
    uint32_t room_byte_11f4) {
  return (room_byte_11f4 & 0xffu) != 0 ? 1 : 0;
}

extern "C" int32_t isaac_room_b9b11_b10_enemies(int32_t count_12c8,
                                                int32_t count_12cc) {
  /* Same pure max(0, sum) as isaac_room_boss_count_snapshot. */
  const int32_t sum = count_12c8 + count_12cc;
  return sum > 0 ? sum : 0;
}

extern "C" int32_t isaac_room_b9b11_b10_fatal_needs_host(int32_t enemies,
                                                         int32_t old_7224) {
  /* PE 0x00803e1d…0x00803e28: enemies < 1 && old_7224 > 0. */
  if (!(enemies < 1)) return 0;
  if (!(old_7224 > 0)) return 0;
  return 1;
}

extern "C" int32_t isaac_room_b9b11_double_409030_needs_host(
    uint32_t room_byte_1d0d) {
  return (room_byte_1d0d & 0xffu) != 0 ? 1 : 0;
}

extern "C" int32_t isaac_room_b9b11_stage_1a_needs_host(int32_t room_1d18) {
  return room_1d18 == (int32_t)ISAAC_ROOM_B9B11_STAGE_ID_1A ? 1 : 0;
}

extern "C" int32_t isaac_room_b9b11_frame_age1_needs_host(
    uint32_t room_active_byte0, int32_t frame_264f8, int32_t room_entry_11f0) {
  if ((room_active_byte0 & 0xffu) == 0) return 0;
  return isaac_room_b9b11_frame_age(frame_264f8, room_entry_11f0) ==
                 ISAAC_ROOM_B9B11_FRAME_AGE1
             ? 1
             : 0;
}

extern "C" int32_t isaac_room_b9b11_tempfx_flag_clear(uint32_t room_byte_7321) {
  return (room_byte_7321 & 0xffu) == 0 ? 1 : 0;
}

extern "C" int32_t isaac_room_b9b11_tempfx_list_empty(uint32_t list_begin_7314,
                                                      uint32_t list_end_7318) {
  return list_begin_7314 == list_end_7318 ? 1 : 0;
}

extern "C" int32_t isaac_room_b9b11_tempfx_walk_needs_host(
    uint32_t room_byte_7321, uint32_t list_begin_7314,
    uint32_t list_end_7318) {
  if (isaac_room_b9b11_tempfx_flag_clear(room_byte_7321) == 0) return 0;
  if (isaac_room_b9b11_tempfx_list_empty(list_begin_7314, list_end_7318) != 0) {
    return 0;
  }
  return 1;
}

extern "C" int32_t isaac_room_b9b11_tempfx_list_continue(uint32_t cur,
                                                         uint32_t end) {
  return cur != end ? 1 : 0;
}

extern "C" int32_t isaac_room_b9b11_tempfx_is_candidate(int32_t effect_type,
                                                        int32_t effect_variant) {
  /* PE 0x00803f68…0x00803f7e: type ∈ {1,3,4} && variant == 0x1e1. */
  if (!(effect_type == 1 || effect_type == 3 || effect_type == 4)) return 0;
  if (effect_variant != (int32_t)ISAAC_ROOM_B9B11_TEMPFX_VARIANT) return 0;
  return 1;
}

extern "C" uint32_t isaac_room_b9b11_challenge_id(void) {
  return ISAAC_ROOM_B9B11_CHALLENGE_ID;
}
extern "C" uint32_t isaac_room_b9b11_challenge_room_type(void) {
  return ISAAC_ROOM_B9B11_CHALLENGE_ROOM_TYPE;
}
extern "C" int32_t isaac_room_b9b11_challenge_frame_age(void) {
  return ISAAC_ROOM_B9B11_CHALLENGE_FRAME_AGE;
}
extern "C" uint32_t isaac_room_b9b11_free_entity_type(void) {
  return ISAAC_ROOM_B9B11_FREE_ENTITY_TYPE;
}
extern "C" uint32_t isaac_room_b9b11_free_entity_variant(void) {
  return ISAAC_ROOM_B9B11_FREE_ENTITY_VARIANT;
}
extern "C" uint32_t isaac_room_b9b11_tempfx_variant(void) {
  return ISAAC_ROOM_B9B11_TEMPFX_VARIANT;
}
extern "C" int32_t isaac_room_b9b11_tempfx_stride(void) {
  return ISAAC_ROOM_B9B11_TEMPFX_STRIDE;
}
extern "C" uint32_t isaac_room_b9b11_stage_id_1a(void) {
  return ISAAC_ROOM_B9B11_STAGE_ID_1A;
}

extern "C" uint32_t isaac_room_b9b11_host_va_b9_start(void) {
  return ISAAC_ROOM_B9B11_HOST_VA_B9_START;
}
extern "C" uint32_t isaac_room_b9b11_host_va_query(void) {
  return ISAAC_ROOM_B9B11_HOST_VA_QUERY;
}
extern "C" uint32_t isaac_room_b9b11_host_va_free_lookup(void) {
  return ISAAC_ROOM_B9B11_HOST_VA_FREE_LOOKUP;
}
extern "C" uint32_t isaac_room_b9b11_host_va_free_helper(void) {
  return ISAAC_ROOM_B9B11_HOST_VA_FREE_HELPER;
}
extern "C" uint32_t isaac_room_b9b11_host_va_mode_hooks(void) {
  return ISAAC_ROOM_B9B11_HOST_VA_MODE_HOOKS;
}
extern "C" uint32_t isaac_room_b9b11_host_va_flag_11f4(void) {
  return ISAAC_ROOM_B9B11_HOST_VA_FLAG_11F4;
}
extern "C" uint32_t isaac_room_b9b11_host_va_b10_start(void) {
  return ISAAC_ROOM_B9B11_HOST_VA_B10_START;
}
extern "C" uint32_t isaac_room_b9b11_host_va_fatal(void) {
  return ISAAC_ROOM_B9B11_HOST_VA_FATAL;
}
extern "C" uint32_t isaac_room_b9b11_host_va_b11_start(void) {
  return ISAAC_ROOM_B9B11_HOST_VA_B11_START;
}
extern "C" uint32_t isaac_room_b9b11_host_va_manager_a(void) {
  return ISAAC_ROOM_B9B11_HOST_VA_MANAGER_A;
}
extern "C" uint32_t isaac_room_b9b11_host_va_manager_b(void) {
  return ISAAC_ROOM_B9B11_HOST_VA_MANAGER_B;
}
extern "C" uint32_t isaac_room_b9b11_host_va_409030(void) {
  return ISAAC_ROOM_B9B11_HOST_VA_409030;
}
extern "C" uint32_t isaac_room_b9b11_host_va_40a5d0(void) {
  return ISAAC_ROOM_B9B11_HOST_VA_40A5D0;
}
extern "C" uint32_t isaac_room_b9b11_host_va_rewind(void) {
  return ISAAC_ROOM_B9B11_HOST_VA_REWIND;
}
extern "C" uint32_t isaac_room_b9b11_host_va_83a080(void) {
  return ISAAC_ROOM_B9B11_HOST_VA_83A080;
}
extern "C" uint32_t isaac_room_b9b11_host_va_7eb870(void) {
  return ISAAC_ROOM_B9B11_HOST_VA_7EB870;
}
extern "C" uint32_t isaac_room_b9b11_host_va_genrand(void) {
  return ISAAC_ROOM_B9B11_HOST_VA_GENRAND;
}
extern "C" uint32_t isaac_room_b9b11_host_va_camera(void) {
  return ISAAC_ROOM_B9B11_HOST_VA_CAMERA;
}
extern "C" uint32_t isaac_room_b9b11_host_va_930820(void) {
  return ISAAC_ROOM_B9B11_HOST_VA_930820;
}
extern "C" uint32_t isaac_room_b9b11_host_va_8020d0(void) {
  return ISAAC_ROOM_B9B11_HOST_VA_8020D0;
}
extern "C" uint32_t isaac_room_b9b11_host_va_b12_start(void) {
  return ISAAC_ROOM_B9B11_HOST_VA_B12_START;
}

extern "C" void isaac_room_b9b11_residual_plan(
    int32_t challenge_result_nonzero, uint32_t room_active_byte0,
    int32_t frame_264f8, int32_t room_entry_11f0, int32_t room_type_8,
    uint32_t room_desc_flags_44, uint32_t game_997a_byte,
    uint32_t room_byte_11f4, int32_t count_12c8, int32_t count_12cc,
    int32_t old_7224, uint32_t room_byte_1d0d, int32_t room_1d18,
    uint32_t room_byte_7321, uint32_t list_begin_7314, uint32_t list_end_7318,
    IsaacRoomB9B11ResidualPlan* out) {
  if (out == nullptr) return;
  const int32_t enemies = isaac_room_b9b11_b10_enemies(count_12c8, count_12cc);
  out->challenge_body_needs_host = isaac_room_b9b11_challenge_body_needs_host(
      challenge_result_nonzero, room_active_byte0, frame_264f8, room_entry_11f0,
      room_type_8, room_desc_flags_44);
  out->mode_hooks_needs_host =
      isaac_room_b9b11_mode_hooks_needs_host(room_type_8, game_997a_byte);
  out->flag_11f4_needs_host =
      isaac_room_b9b11_flag_11f4_needs_host(room_byte_11f4);
  out->b10_enemies = enemies;
  out->b10_fatal_needs_host =
      isaac_room_b9b11_b10_fatal_needs_host(enemies, old_7224);
  out->double_409030_needs_host =
      isaac_room_b9b11_double_409030_needs_host(room_byte_1d0d);
  out->stage_1a_needs_host = isaac_room_b9b11_stage_1a_needs_host(room_1d18);
  out->frame_age1_needs_host = isaac_room_b9b11_frame_age1_needs_host(
      room_active_byte0, frame_264f8, room_entry_11f0);
  out->tempfx_walk_needs_host = isaac_room_b9b11_tempfx_walk_needs_host(
      room_byte_7321, list_begin_7314, list_end_7318);
  /* Manager/camera chain always hosts on fallthrough. */
  out->residual_kind = ISAAC_ROOM_B9B11_RESIDUAL_ALWAYS_HOST;
  out->pure_complete = 0;
  out->host_needed = 1;
}

extern "C" void isaac_room_b9b11_wire_decide(
    int32_t inputs_ready, int32_t challenge_result_nonzero,
    uint32_t room_active_byte0, int32_t frame_264f8, int32_t room_entry_11f0,
    int32_t room_type_8, uint32_t room_desc_flags_44, uint32_t game_997a_byte,
    uint32_t room_byte_11f4, int32_t count_12c8, int32_t count_12cc,
    int32_t old_7224, uint32_t room_byte_1d0d, int32_t room_1d18,
    uint32_t room_byte_7321, uint32_t list_begin_7314, uint32_t list_end_7318,
    IsaacRoomB9B11ResidualPlan* out) {
  if (out == nullptr) return;
  if (inputs_ready == 0) {
    out->challenge_body_needs_host = 0;
    out->mode_hooks_needs_host = 0;
    out->flag_11f4_needs_host = 0;
    out->b10_enemies = 0;
    out->b10_fatal_needs_host = 0;
    out->double_409030_needs_host = 0;
    out->stage_1a_needs_host = 0;
    out->frame_age1_needs_host = 0;
    out->tempfx_walk_needs_host = 0;
    out->residual_kind = ISAAC_ROOM_B9B11_RESIDUAL_MONOLITHIC;
    out->pure_complete = 0;
    out->host_needed = 1;
    return;
  }
  isaac_room_b9b11_residual_plan(
      challenge_result_nonzero, room_active_byte0, frame_264f8, room_entry_11f0,
      room_type_8, room_desc_flags_44, game_997a_byte, room_byte_11f4,
      count_12c8, count_12cc, old_7224, room_byte_1d0d, room_1d18,
      room_byte_7321, list_begin_7314, list_end_7318, out);
}

/* ---- TailMid residual pure islands (helpers freestanding; package ABI v36). ---- */

extern "C" int32_t isaac_room_tailmid_game_has_curse_bit(
    uint32_t game_flags_1839c) {
  return (game_flags_1839c & ISAAC_ROOM_TAILMID_CURSE_FLAG_BIT) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_room_tailmid_desc_lacks_curse_bit(
    uint32_t room_desc_flags_44) {
  return (room_desc_flags_44 & ISAAC_ROOM_TAILMID_CURSE_FLAG_BIT) == 0u ? 1 : 0;
}

extern "C" int32_t isaac_room_tailmid_room_is_active(
    uint32_t room_active_byte0) {
  return (room_active_byte0 & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_room_tailmid_frame_age_is_one(int32_t frame_264f8,
                                                      int32_t room_entry_11f0) {
  return (frame_264f8 - room_entry_11f0) == 1 ? 1 : 0;
}

extern "C" int32_t isaac_room_tailmid_needs_curse_host(
    uint32_t game_flags_1839c, uint32_t room_desc_flags_44,
    uint32_t room_active_byte0, int32_t frame_264f8, int32_t room_entry_11f0,
    uint32_t is_paused) {
  if (isaac_room_tailmid_game_has_curse_bit(game_flags_1839c) == 0) return 0;
  if (isaac_room_tailmid_desc_lacks_curse_bit(room_desc_flags_44) == 0) return 0;
  if (isaac_room_tailmid_room_is_active(room_active_byte0) == 0) return 0;
  if (isaac_room_tailmid_frame_age_is_one(frame_264f8, room_entry_11f0) == 0) {
    return 0;
  }
  /* PE: call Game::IsPaused; test al; jne skip — host when al==0. */
  if ((is_paused & 0xffu) != 0u) return 0;
  return 1;
}

extern "C" uint32_t isaac_room_tailmid_curse_flag_or_4000(
    uint32_t room_desc_flags_44) {
  return room_desc_flags_44 | ISAAC_ROOM_TAILMID_CURSE_FLAG_BIT;
}

extern "C" uint32_t isaac_room_tailmid_curse_effect_type(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_TAILMID_CURSE_EFFECT_TYPE);
}
extern "C" uint32_t isaac_room_tailmid_curse_effect_variant(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_TAILMID_CURSE_EFFECT_VARIANT);
}
extern "C" uint32_t isaac_room_tailmid_curse_pos_vec_ptr(void) {
  return ISAAC_ROOM_TAILMID_CURSE_POS_VEC_PTR;
}
extern "C" uint32_t isaac_room_tailmid_curse_arg_zero(void) { return 0u; }

extern "C" void isaac_room_tailmid_curse_centers(float room_f14, float room_f18,
                                                 float room_f1c, float room_f20,
                                                 IsaacRoomTailmidCenters* out) {
  if (out == nullptr) return;
  const float half = __builtin_bit_cast(float, ISAAC_ROOM_TAILMID_CURSE_HALF_BITS);
  out->span_y = room_f1c - room_f14;
  out->span_x = room_f20 - room_f18;
  out->center_y = room_f14 + out->span_y * half;
  out->center_x = room_f18 + out->span_x * half;
}

extern "C" void isaac_room_tailmid_curse_deltas(float player_x, float player_y,
                                                float center_x, float center_y,
                                                IsaacRoomTailmidDeltas* out) {
  if (out == nullptr) return;
  /* PE subss order: dx = player_x - center_y; dy = player_y - center_x. */
  out->dx = player_x - center_y;
  out->dy = player_y - center_x;
}

extern "C" int32_t isaac_room_tailmid_curse_pos_is_zero_vec(float pos_x,
                                                            float pos_y,
                                                            float zero_x,
                                                            float zero_y) {
  /* PE ucomiss + lahf + test ah,0x44; jp → not equal (unordered or !=).
     Exact equality including +0/-0 via bit-identical compare is not required;
     match IEEE equality for normal finite zeros used at site. */
  return (pos_x == zero_x && pos_y == zero_y) ? 1 : 0;
}

extern "C" float isaac_room_tailmid_curse_vel_scale(float dist) {
  /* PE: comiss dist, 0; jbe skip; scale = 200 / dist. */
  if (!(dist > 0.0f)) return 0.0f;
  const float scale200 =
      __builtin_bit_cast(float, ISAAC_ROOM_TAILMID_CURSE_VEL_SCALE_BITS);
  return scale200 / dist;
}

extern "C" uint32_t isaac_room_tailmid_host_va_gate(void) {
  return ISAAC_ROOM_TAILMID_HOST_VA_GATE;
}
extern "C" uint32_t isaac_room_tailmid_host_va_ispaused(void) {
  return ISAAC_ROOM_TAILMID_HOST_VA_ISPAUSED;
}
extern "C" uint32_t isaac_room_tailmid_host_va_curse(void) {
  return ISAAC_ROOM_TAILMID_HOST_VA_CURSE;
}
extern "C" uint32_t isaac_room_tailmid_host_va_curse_genrand(void) {
  return ISAAC_ROOM_TAILMID_HOST_VA_CURSE_GENRAND;
}
extern "C" uint32_t isaac_room_tailmid_host_va_curse_getplayer(void) {
  return ISAAC_ROOM_TAILMID_HOST_VA_CURSE_GETPLAYER;
}
extern "C" uint32_t isaac_room_tailmid_host_va_curse_create(void) {
  return ISAAC_ROOM_TAILMID_HOST_VA_CURSE_CREATE;
}
extern "C" uint32_t isaac_room_tailmid_host_va_curse_sqrt(void) {
  return ISAAC_ROOM_TAILMID_HOST_VA_CURSE_SQRT;
}
extern "C" uint32_t isaac_room_tailmid_host_va_801ee0(void) {
  return ISAAC_ROOM_TAILMID_HOST_VA_801EE0;
}
extern "C" uint32_t isaac_room_tailmid_host_va_spawn_wave(void) {
  return ISAAC_ROOM_TAILMID_HOST_VA_SPAWN_WAVE;
}
extern "C" uint32_t isaac_room_tailmid_host_va_music(void) {
  return ISAAC_ROOM_TAILMID_HOST_VA_MUSIC;
}
extern "C" uint32_t isaac_room_tailmid_host_va_trigger_output(void) {
  return ISAAC_ROOM_TAILMID_HOST_VA_TRIGGER_OUTPUT;
}
extern "C" uint32_t isaac_room_tailmid_host_va_sfx_pre(void) {
  return ISAAC_ROOM_TAILMID_HOST_VA_SFX_PRE;
}
extern "C" uint32_t isaac_room_tailmid_host_va_sfx_play(void) {
  return ISAAC_ROOM_TAILMID_HOST_VA_SFX_PLAY;
}
extern "C" uint32_t isaac_room_tailmid_host_va_800500(void) {
  return ISAAC_ROOM_TAILMID_HOST_VA_800500;
}
extern "C" uint32_t isaac_room_tailmid_host_va_next(void) {
  return ISAAC_ROOM_TAILMID_HOST_VA_NEXT;
}

extern "C" int32_t isaac_room_tailmid_801ee0_is_greed_mode(
    int32_t difficulty_269c8) {
  return (difficulty_269c8 == 2 || difficulty_269c8 == 3) ? 1 : 0;
}

extern "C" int32_t isaac_room_tailmid_801ee0_boss_count(int32_t count_12c0,
                                                        int32_t count_12c4) {
  const int32_t sum = count_12c0 + count_12c4;
  return sum > 0 ? sum : 0;
}

extern "C" int32_t isaac_room_tailmid_801ee0_needs_timer_reset_host(
    int32_t post_timer_723c, int32_t boss_count) {
  if (boss_count > 0) return 0;
  return post_timer_723c >= ISAAC_ROOM_TAILMID_WAVE_TIMER_GATE ? 1 : 0;
}

extern "C" int32_t isaac_room_tailmid_801ee0_needs_spawn_wave_host(
    int32_t post_timer_723c, int32_t pre_timer_723c) {
  /* PE only decrements when pre>0; spawn when post==0 after that path. */
  if (!(pre_timer_723c > 0)) return 0;
  return post_timer_723c == 0 ? 1 : 0;
}

extern "C" int32_t isaac_room_tailmid_801ee0_needs_special_host(
    int32_t stage0, int32_t room_type_8, uint32_t game_flags_1839c,
    int32_t player_count) {
  if (stage0 != ISAAC_ROOM_TAILMID_SPECIAL_STAGE) return 0;
  if (room_type_8 != ISAAC_ROOM_TAILMID_SPECIAL_ROOM_TYPE) return 0;
  if ((game_flags_1839c & ISAAC_ROOM_TAILMID_SPECIAL_FLAG_BIT) != 0u) return 0;
  return player_count != 0 ? 1 : 0;
}

extern "C" int32_t isaac_room_tailmid_801ee0_timer_set_13(void) {
  return ISAAC_ROOM_TAILMID_WAVE_TIMER_SET;
}

extern "C" uint32_t isaac_room_tailmid_801ee0_desc_clear_bit40(
    uint32_t room_desc_flags_44) {
  return room_desc_flags_44 & ~static_cast<uint32_t>(ISAAC_ROOM_TAILMID_DESC_CLEAR_BIT40);
}

extern "C" uint32_t isaac_room_tailmid_801ee0_game_flag_or_1000(
    uint32_t game_flags_1839c) {
  return game_flags_1839c | ISAAC_ROOM_TAILMID_SPECIAL_FLAG_BIT;
}

extern "C" uint32_t isaac_room_tailmid_special_effect_type(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_TAILMID_SPECIAL_EFFECT_TYPE);
}
extern "C" uint32_t isaac_room_tailmid_special_effect_variant(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_TAILMID_SPECIAL_EFFECT_VARIANT);
}
extern "C" uint32_t isaac_room_tailmid_sfx_id(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_TAILMID_SFX_ID);
}
extern "C" float isaac_room_tailmid_sfx_volume(void) {
  return __builtin_bit_cast(float, ISAAC_ROOM_TAILMID_SFX_VOLUME_BITS);
}
extern "C" int32_t isaac_room_tailmid_sfx_frame_delay(void) {
  return ISAAC_ROOM_TAILMID_SFX_FRAME_DELAY;
}
extern "C" int32_t isaac_room_tailmid_sfx_loop(void) {
  return ISAAC_ROOM_TAILMID_SFX_LOOP;
}
extern "C" float isaac_room_tailmid_sfx_pitch(void) {
  return __builtin_bit_cast(float, ISAAC_ROOM_TAILMID_SFX_PITCH_BITS);
}
extern "C" float isaac_room_tailmid_sfx_pan(void) {
  return __builtin_bit_cast(float, ISAAC_ROOM_TAILMID_SFX_PAN_BITS);
}
extern "C" uint32_t isaac_room_tailmid_music_id(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_TAILMID_MUSIC_ID);
}

extern "C" int32_t isaac_room_tailmid_800500_early_skip(uint32_t is_paused,
                                                        int32_t gate_1b83c) {
  if ((is_paused & 0xffu) == 0u) return 0;
  return gate_1b83c == 0 ? 1 : 0;
}

/* ---- FUN_00800500 body pure islands (package ABI v37). ---- */

extern "C" int32_t isaac_room_tailmid_800500_entity_list_empty(
    uint32_t count_1264) {
  /* PE: cmp [Room+0x1264], 0; jbe empty. */
  return count_1264 == 0u ? 1 : 0;
}

extern "C" float isaac_room_tailmid_800500_default_intensity(void) {
  return __builtin_bit_cast(float, ISAAC_ROOM_TAILMID_800500_DEFAULT_INTENSITY_BITS);
}

extern "C" float isaac_room_tailmid_800500_avg_intensity(float sum,
                                                         int32_t count) {
  if (count <= 0) {
    return isaac_room_tailmid_800500_default_intensity();
  }
  /* PE: movd/cvtdq2ps on signed count, then divss. */
  return sum / static_cast<float>(count);
}

extern "C" int32_t isaac_room_tailmid_800500_type_in_threat_band(
    int32_t type_28) {
  /* PE: lea eax, [type-10]; cmp eax, 0x3dd; ja → out of band. */
  return static_cast<uint32_t>(type_28 - ISAAC_ROOM_TAILMID_800500_TYPE_BAND_BASE) <=
                 static_cast<uint32_t>(ISAAC_ROOM_TAILMID_800500_TYPE_BAND_SPAN)
             ? 1
             : 0;
}

extern "C" int32_t isaac_room_tailmid_800500_outer_include_candidate(
    int32_t game_dim_26614, int32_t type_28) {
  if (game_dim_26614 >= 2 &&
      type_28 == ISAAC_ROOM_TAILMID_800500_TYPE_PLAYER) {
    return 1;
  }
  return isaac_room_tailmid_800500_type_in_threat_band(type_28);
}

extern "C" int32_t isaac_room_tailmid_800500_outer_is_tear_type(
    int32_t type_28) {
  return type_28 == ISAAC_ROOM_TAILMID_800500_TYPE_TEAR ? 1 : 0;
}

extern "C" int32_t isaac_room_tailmid_800500_outer_is_effect_type(
    int32_t type_28) {
  return type_28 == ISAAC_ROOM_TAILMID_800500_TYPE_EFFECT ? 1 : 0;
}

extern "C" int32_t isaac_room_tailmid_800500_entity_include(
    int32_t entity_nonzero, int32_t game_dim_26614, int32_t type_28,
    uint32_t flag_byte_173, int32_t short_c74, float float_39c, int32_t int_31c,
    uint32_t flags_168, uint32_t flags_16c) {
  /* PE include multi-gate @ 0x008007ad…0x0080081f after outer candidate. */
  if (entity_nonzero == 0) return 0;
  if (isaac_room_tailmid_800500_outer_include_candidate(game_dim_26614,
                                                        type_28) == 0) {
    return 0;
  }
  if ((flag_byte_173 & 0xffu) != 0u) return 0;
  if (short_c74 > 0) return 0;
  /* comiss float_39c, 0; jbe skip */
  if (!(float_39c > 0.0f)) return 0;
  if (int_31c > 0) return 0;
  const uint32_t masked =
      (flags_168 & ISAAC_ROOM_TAILMID_800500_FLAG_168_MASK) |
      (flags_16c & ISAAC_ROOM_TAILMID_800500_FLAG_16C_MASK);
  if (masked != 0u) return 0;
  return 1;
}

extern "C" float isaac_room_tailmid_800500_abs_diff(float a, float b) {
  const float delta = a - b;
  const uint32_t bits =
      __builtin_bit_cast(uint32_t, delta) & ISAAC_ROOM_TAILMID_800500_ABS_MASK;
  return __builtin_bit_cast(float, bits);
}

extern "C" float isaac_room_tailmid_800500_approach(float curr, float target,
                                                    float step) {
  /* PE LAB_00801544: if step >= |curr-target| keep target; else step from
     curr toward target. */
  const float absdiff = isaac_room_tailmid_800500_abs_diff(curr, target);
  if (!(step < absdiff)) {
    return target;
  }
  if (target <= curr) {
    return curr - step;
  }
  return curr + step;
}

extern "C" float isaac_room_tailmid_800500_step_half(void) {
  return __builtin_bit_cast(float, ISAAC_ROOM_TAILMID_800500_STEP_HALF_BITS);
}
extern "C" float isaac_room_tailmid_800500_step_small(void) {
  return __builtin_bit_cast(float, ISAAC_ROOM_TAILMID_800500_STEP_SMALL_BITS);
}
extern "C" float isaac_room_tailmid_800500_dist_scale(void) {
  return __builtin_bit_cast(float, ISAAC_ROOM_TAILMID_800500_DIST_SCALE_BITS);
}

extern "C" int32_t isaac_room_tailmid_800500_timer_72fc_needs_host(
    int32_t timer_72fc) {
  /* PE: test eax,eax; js skip — host residual only when timer >= 0. */
  return timer_72fc >= 0 ? 1 : 0;
}

extern "C" int32_t isaac_room_tailmid_800500_timer_72fc_inc(int32_t timer_72fc) {
  return timer_72fc + 1;
}

extern "C" int32_t isaac_room_tailmid_800500_timer_72fc_needs_sfx_play(
    int32_t post_inc) {
  return post_inc == ISAAC_ROOM_TAILMID_800500_TIMER_SFX_GATE ? 1 : 0;
}

extern "C" int32_t isaac_room_tailmid_800500_timer_72fc_needs_isplaying_host(
    int32_t post_inc) {
  /* PE: cmp eax, 0xa; jne; jle skip — only >10 enters IsPlaying path. */
  return post_inc > ISAAC_ROOM_TAILMID_800500_TIMER_SFX_GATE ? 1 : 0;
}

extern "C" int32_t isaac_room_tailmid_800500_timer_72fc_clear_neg1(void) {
  return static_cast<int32_t>(ISAAC_ROOM_TAILMID_800500_TIMER_CLEAR);
}

extern "C" uint32_t isaac_room_tailmid_800500_room_entity_count_off(void) {
  return ISAAC_ROOM_TAILMID_800500_ROOM_ENTITY_COUNT_OFF;
}
extern "C" uint32_t isaac_room_tailmid_800500_room_entity_list_off(void) {
  return ISAAC_ROOM_TAILMID_800500_ROOM_ENTITY_LIST_OFF;
}
extern "C" uint32_t isaac_room_tailmid_800500_room_timer_72fc_off(void) {
  return ISAAC_ROOM_TAILMID_800500_ROOM_TIMER_72FC_OFF;
}
extern "C" uint32_t isaac_room_tailmid_800500_timer_sfx_id(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_TAILMID_800500_TIMER_SFX_ID);
}
extern "C" uint32_t isaac_room_tailmid_800500_timer_sfx_gate(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_TAILMID_800500_TIMER_SFX_GATE);
}
extern "C" uint32_t isaac_room_tailmid_800500_ch_7084(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_TAILMID_800500_CH_7084);
}
extern "C" uint32_t isaac_room_tailmid_800500_ch_7088(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_TAILMID_800500_CH_7088);
}
extern "C" uint32_t isaac_room_tailmid_800500_ch_708c(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_TAILMID_800500_CH_708C);
}
extern "C" uint32_t isaac_room_tailmid_800500_ch_70c0(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_TAILMID_800500_CH_70C0);
}

extern "C" uint32_t isaac_room_tailmid_host_va_800500_player_pos(void) {
  return ISAAC_ROOM_TAILMID_HOST_VA_800500_PLAYER_POS;
}
extern "C" uint32_t isaac_room_tailmid_host_va_800500_islocal(void) {
  return ISAAC_ROOM_TAILMID_HOST_VA_800500_ISLOCAL;
}
extern "C" uint32_t isaac_room_tailmid_host_va_800500_body(void) {
  return ISAAC_ROOM_TAILMID_HOST_VA_800500_BODY;
}
extern "C" uint32_t isaac_room_tailmid_host_va_800500_empty(void) {
  return ISAAC_ROOM_TAILMID_HOST_VA_800500_EMPTY;
}
extern "C" uint32_t isaac_room_tailmid_host_va_800500_epilogue(void) {
  return ISAAC_ROOM_TAILMID_HOST_VA_800500_EPILOGUE;
}
extern "C" uint32_t isaac_room_tailmid_host_va_800500_intensity(void) {
  return ISAAC_ROOM_TAILMID_HOST_VA_800500_INTENSITY;
}
extern "C" uint32_t isaac_room_tailmid_host_va_800500_isplaying(void) {
  return ISAAC_ROOM_TAILMID_HOST_VA_800500_ISPLAYING;
}
extern "C" uint32_t isaac_room_tailmid_host_va_800500_timer(void) {
  return ISAAC_ROOM_TAILMID_HOST_VA_800500_TIMER;
}

extern "C" int32_t isaac_room_tailmid_801ee0_fragment_kind(
    int32_t difficulty_269c8) {
  return isaac_room_tailmid_801ee0_is_greed_mode(difficulty_269c8) != 0
             ? ISAAC_ROOM_TAILMID_FRAG_HOST
             : ISAAC_ROOM_TAILMID_FRAG_NONE;
}

extern "C" int32_t isaac_room_tailmid_800500_fragment_kind(uint32_t is_paused,
                                                           int32_t gate_1b83c) {
  return isaac_room_tailmid_800500_early_skip(is_paused, gate_1b83c) != 0
             ? ISAAC_ROOM_TAILMID_FRAG_NONE
             : ISAAC_ROOM_TAILMID_FRAG_HOST;
}

extern "C" int32_t isaac_room_tailmid_curse_fragment_kind(
    uint32_t game_flags_1839c, uint32_t room_desc_flags_44,
    uint32_t room_active_byte0, int32_t frame_264f8, int32_t room_entry_11f0,
    uint32_t is_paused) {
  return isaac_room_tailmid_needs_curse_host(
             game_flags_1839c, room_desc_flags_44, room_active_byte0,
             frame_264f8, room_entry_11f0, is_paused) != 0
             ? ISAAC_ROOM_TAILMID_FRAG_HOST
             : ISAAC_ROOM_TAILMID_FRAG_NONE;
}

extern "C" void isaac_room_tailmid_residual_plan(
    uint32_t game_flags_1839c, uint32_t room_desc_flags_44,
    uint32_t room_active_byte0, int32_t frame_264f8, int32_t room_entry_11f0,
    uint32_t is_paused_curse, int32_t difficulty_269c8,
    uint32_t is_paused_800500, int32_t gate_1b83c,
    IsaacRoomTailmidResidualPlan* out) {
  if (out == nullptr) return;
  out->needs_curse_host = isaac_room_tailmid_needs_curse_host(
      game_flags_1839c, room_desc_flags_44, room_active_byte0, frame_264f8,
      room_entry_11f0, is_paused_curse);
  out->curse_kind = out->needs_curse_host != 0 ? ISAAC_ROOM_TAILMID_FRAG_HOST
                                               : ISAAC_ROOM_TAILMID_FRAG_NONE;
  out->kind_801ee0 = isaac_room_tailmid_801ee0_fragment_kind(difficulty_269c8);
  out->needs_801ee0_host =
      out->kind_801ee0 == ISAAC_ROOM_TAILMID_FRAG_HOST ? 1 : 0;
  out->kind_800500 =
      isaac_room_tailmid_800500_fragment_kind(is_paused_800500, gate_1b83c);
  out->needs_800500_host =
      out->kind_800500 == ISAAC_ROOM_TAILMID_FRAG_HOST ? 1 : 0;
  if (out->needs_curse_host == 0 && out->needs_801ee0_host == 0 &&
      out->needs_800500_host == 0) {
    out->residual_kind = ISAAC_ROOM_TAILMID_RESIDUAL_NONE;
    out->pure_complete = 1;
    out->host_needed = 0;
    return;
  }
  out->residual_kind = ISAAC_ROOM_TAILMID_RESIDUAL_HOST;
  out->pure_complete = 0;
  out->host_needed = 1;
}

extern "C" void isaac_room_tailmid_wire_decide(
    int32_t inputs_ready, uint32_t game_flags_1839c,
    uint32_t room_desc_flags_44, uint32_t room_active_byte0, int32_t frame_264f8,
    int32_t room_entry_11f0, uint32_t is_paused_curse, int32_t difficulty_269c8,
    uint32_t is_paused_800500, int32_t gate_1b83c,
    IsaacRoomTailmidResidualPlan* out) {
  if (out == nullptr) return;
  if (inputs_ready == 0) {
    out->curse_kind = ISAAC_ROOM_TAILMID_FRAG_MONOLITHIC;
    out->kind_801ee0 = ISAAC_ROOM_TAILMID_FRAG_MONOLITHIC;
    out->kind_800500 = ISAAC_ROOM_TAILMID_FRAG_MONOLITHIC;
    out->residual_kind = ISAAC_ROOM_TAILMID_RESIDUAL_MONOLITHIC;
    out->pure_complete = 0;
    out->host_needed = 1;
    out->needs_curse_host = 0;
    out->needs_801ee0_host = 0;
    out->needs_800500_host = 0;
    return;
  }
  isaac_room_tailmid_residual_plan(
      game_flags_1839c, room_desc_flags_44, room_active_byte0, frame_264f8,
      room_entry_11f0, is_paused_curse, difficulty_269c8, is_paused_800500,
      gate_1b83c, out);
}


/* ---- B3–B7 residual pure islands (helpers ABI v36 freestanding). ---- */

extern "C" uint32_t isaac_room_b3_collectible_id(void) {
  return ISAAC_ROOM_B3_COLLECTIBLE_ID;
}
extern "C" uint32_t isaac_room_b3_challenge_id(void) {
  return ISAAC_ROOM_B3_CHALLENGE_ID;
}
extern "C" uint32_t isaac_room_b3_te_type(void) { return ISAAC_ROOM_B3_TE_TYPE; }
extern "C" uint32_t isaac_room_b3_te_variant(void) {
  return ISAAC_ROOM_B3_TE_VARIANT;
}
extern "C" uint32_t isaac_room_b3_te_stride(void) {
  return ISAAC_ROOM_B3_TE_STRIDE;
}
extern "C" uint32_t isaac_room_b3_te_push_ptr(void) {
  return ISAAC_ROOM_B3_TE_PUSH_PTR;
}
extern "C" uint32_t isaac_room_b3_flag_offset(void) {
  return ISAAC_ROOM_B3_FLAG_OFF;
}
extern "C" uint32_t isaac_room_b3_te_gate_offset(void) {
  return ISAAC_ROOM_B3_TE_GATE_OFF;
}
extern "C" uint32_t isaac_room_b3_te_begin_offset(void) {
  return ISAAC_ROOM_B3_TE_BEGIN_OFF;
}
extern "C" uint32_t isaac_room_b3_te_end_offset(void) {
  return ISAAC_ROOM_B3_TE_END_OFF;
}
extern "C" uint32_t isaac_room_b3_game_owner_offset(void) {
  return ISAAC_ROOM_B3_GAME_OWNER_OFF;
}

extern "C" uint32_t isaac_room_b3_host_va_start(void) {
  return ISAAC_ROOM_B3_HOST_VA_START;
}
extern "C" uint32_t isaac_room_b3_host_va_owner(void) {
  return ISAAC_ROOM_B3_HOST_VA_OWNER;
}
extern "C" uint32_t isaac_room_b3_host_va_challenge(void) {
  return ISAAC_ROOM_B3_HOST_VA_CHALLENGE;
}
extern "C" uint32_t isaac_room_b3_host_va_challenge_body(void) {
  return ISAAC_ROOM_B3_HOST_VA_CHALLENGE_BODY;
}
extern "C" uint32_t isaac_room_b3_host_va_te_call(void) {
  return ISAAC_ROOM_B3_HOST_VA_TE_CALL;
}
extern "C" uint32_t isaac_room_b4_host_va_gate(void) {
  return ISAAC_ROOM_B4_HOST_VA_GATE;
}
extern "C" uint32_t isaac_room_b4_host_va_lookup(void) {
  return ISAAC_ROOM_B4_HOST_VA_LOOKUP;
}
extern "C" uint32_t isaac_room_b4_host_va_pos_a(void) {
  return ISAAC_ROOM_B4_HOST_VA_POS_A;
}
extern "C" uint32_t isaac_room_b4_host_va_pos_finish(void) {
  return ISAAC_ROOM_B4_HOST_VA_POS_FINISH;
}
extern "C" uint32_t isaac_room_b4_host_va_genrand(void) {
  return ISAAC_ROOM_B4_HOST_VA_GENRAND;
}
extern "C" uint32_t isaac_room_b4_host_va_spawn(void) {
  return ISAAC_ROOM_B4_HOST_VA_SPAWN;
}
extern "C" uint32_t isaac_room_b4_host_va_cleanup(void) {
  return ISAAC_ROOM_B4_HOST_VA_CLEANUP;
}
extern "C" uint32_t isaac_room_b5_host_va_start(void) {
  return ISAAC_ROOM_B5_HOST_VA_START;
}
extern "C" uint32_t isaac_room_b5_host_va_pass1(void) {
  return ISAAC_ROOM_B5_HOST_VA_PASS1;
}
extern "C" uint32_t isaac_room_b5_host_va_count(void) {
  return ISAAC_ROOM_B5_HOST_VA_COUNT;
}
extern "C" uint32_t isaac_room_b5_host_va_pass2(void) {
  return ISAAC_ROOM_B5_HOST_VA_PASS2;
}
extern "C" uint32_t isaac_room_b5_host_va_vector_push(void) {
  return ISAAC_ROOM_B5_HOST_VA_VECTOR_PUSH;
}
extern "C" uint32_t isaac_room_b6_host_va_countdown(void) {
  return ISAAC_ROOM_B6_HOST_VA_COUNTDOWN;
}
extern "C" uint32_t isaac_room_b6_host_va_tree(void) {
  return ISAAC_ROOM_B6_HOST_VA_TREE;
}
extern "C" uint32_t isaac_room_b6_host_va_tree_inc(void) {
  return ISAAC_ROOM_B6_HOST_VA_TREE_INC;
}
extern "C" uint32_t isaac_room_b6_host_va_tree_erase(void) {
  return ISAAC_ROOM_B6_HOST_VA_TREE_ERASE;
}
extern "C" uint32_t isaac_room_b7_host_va_start(void) {
  return ISAAC_ROOM_B7_HOST_VA_START;
}
extern "C" uint32_t isaac_room_b3b7_host_va_next(void) {
  return ISAAC_ROOM_B3B7_HOST_VA_NEXT;
}

extern "C" uint8_t isaac_room_b3_flag_from_owner_result(uint32_t owner_result) {
  return owner_result != 0 ? 1u : 0u;
}

extern "C" int32_t isaac_room_b3_temp_effects_gate(uint32_t byte_7321) {
  return (byte_7321 & 0xffu) == 0 ? 1 : 0;
}

extern "C" int32_t isaac_room_b3_temp_effects_list_empty(uint32_t begin_7314,
                                                         uint32_t end_7318) {
  return begin_7314 == end_7318 ? 1 : 0;
}

extern "C" int32_t isaac_room_b3_temp_effects_entry_match(int32_t type0,
                                                          int32_t variant4) {
  return (type0 == (int32_t)ISAAC_ROOM_B3_TE_TYPE &&
          variant4 == (int32_t)ISAAC_ROOM_B3_TE_VARIANT)
             ? 1
             : 0;
}

extern "C" int32_t isaac_room_b3_temp_effects_list_continue(uint32_t cur,
                                                            uint32_t end_7318) {
  const uint32_t next = cur + ISAAC_ROOM_B3_TE_STRIDE;
  return next != end_7318 ? 1 : 0;
}

extern "C" int32_t isaac_room_b3_temp_effects_needs_host(uint32_t byte_7321,
                                                         uint32_t begin_7314,
                                                         uint32_t end_7318) {
  if (isaac_room_b3_temp_effects_gate(byte_7321) == 0) return 0;
  if (isaac_room_b3_temp_effects_list_empty(begin_7314, end_7318) != 0) return 0;
  return 1;
}

extern "C" int32_t isaac_room_b4_desc_type_gate(int32_t desc_type0) {
  return desc_type0 == ISAAC_ROOM_B4_DESC_TYPE_GATE ? 1 : 0;
}

extern "C" int32_t isaac_room_b4_frame_in_room_gate(uint32_t room_byte1,
                                                   int32_t entry_11f0,
                                                   int32_t frame_264f8) {
  if ((room_byte1 & 0xffu) == 0) return 0;
  return entry_11f0 == frame_264f8 ? 1 : 0;
}

extern "C" uint32_t isaac_room_b4_xorshift(uint32_t seed, uint32_t shift1,
                                           uint32_t shift2, uint32_t shift3) {
  uint32_t a = (seed >> (shift1 & 31u)) ^ seed;
  uint32_t b = (a << (shift2 & 31u)) ^ a;
  return (b >> (shift3 & 31u)) ^ b;
}

extern "C" uint32_t isaac_room_b4_xorshift_imm(uint32_t seed) {
  return isaac_room_b4_xorshift(seed, ISAAC_ROOM_B4_XOR_SHIFT1,
                                ISAAC_ROOM_B4_XOR_SHIFT2,
                                ISAAC_ROOM_B4_XOR_SHIFT3);
}

extern "C" uint32_t isaac_room_b4_mod100(uint32_t value) {
  /* PE: mul 0x51eb851f; shr edx,5; imul edx,100; sub */
  const uint64_t prod =
      static_cast<uint64_t>(value) * static_cast<uint64_t>(ISAAC_ROOM_B4_MOD100_MAGIC);
  const uint32_t q = static_cast<uint32_t>(prod >> 32) >> 5;
  return value - q * 100u;
}

extern "C" uint32_t isaac_room_b4_pickup_variant_from_rem(uint32_t rem100) {
  if (rem100 < 4u) return ISAAC_ROOM_B4_PICKUP_T0;
  if (rem100 < 9u) return ISAAC_ROOM_B4_PICKUP_T1;
  if (rem100 < 0x13u) return ISAAC_ROOM_B4_PICKUP_T2;
  if (rem100 < 0x1du) return ISAAC_ROOM_B4_PICKUP_T3;
  if (rem100 < 0x36u) return ISAAC_ROOM_B4_PICKUP_T4;
  return ISAAC_ROOM_B4_PICKUP_DEFAULT;
}

extern "C" int32_t isaac_room_b4_second_band_kind(uint32_t rem100) {
  if (rem100 < ISAAC_ROOM_B4_BAND_A_REM) return ISAAC_ROOM_B4_BAND_A;
  if (rem100 < ISAAC_ROOM_B4_BAND_B_REM) return ISAAC_ROOM_B4_BAND_B;
  if (rem100 < ISAAC_ROOM_B4_BAND_C_REM) return ISAAC_ROOM_B4_BAND_C;
  if (rem100 < ISAAC_ROOM_B4_BAND_D_REM) return ISAAC_ROOM_B4_BAND_D;
  return ISAAC_ROOM_B4_BAND_NONE;
}

extern "C" int32_t isaac_room_b4_option_gate(uint32_t option_byte, int32_t mgr_field8,
                                             uint32_t game_nonnull,
                                             uint32_t game_dword_26630,
                                             uint32_t game_byte_26589) {
  if ((option_byte & 0xffu) != 0) return 1;
  if (mgr_field8 != 2) return 0;
  if (game_nonnull == 0) return 0;
  if (game_dword_26630 != 0) return 1;
  return (game_byte_26589 & 0xffu) != 0 ? 1 : 0;
}

extern "C" int32_t isaac_room_b4_second_band_needs_host(
    uint32_t rem100, uint32_t option_byte, int32_t mgr_field8,
    uint32_t game_nonnull, uint32_t game_dword_26630, uint32_t game_byte_26589) {
  const int32_t kind = isaac_room_b4_second_band_kind(rem100);
  if (kind == ISAAC_ROOM_B4_BAND_NONE) return 0;
  if (kind == ISAAC_ROOM_B4_BAND_A) return 1;
  return isaac_room_b4_option_gate(option_byte, mgr_field8, game_nonnull,
                                   game_dword_26630, game_byte_26589);
}

extern "C" int32_t isaac_room_b4_third_spawn_gate(uint32_t xorshift_result) {
  return (xorshift_result & 3u) == 0 ? 1 : 0;
}

extern "C" float isaac_room_b4_pos_y_offset(float room_y_20) {
  const float off = __builtin_bit_cast(float, ISAAC_ROOM_B4_Y_OFFSET_BITS);
  return room_y_20 + off;
}

extern "C" uint32_t isaac_room_b4_xor_shift1(void) {
  return ISAAC_ROOM_B4_XOR_SHIFT1;
}
extern "C" uint32_t isaac_room_b4_xor_shift2(void) {
  return ISAAC_ROOM_B4_XOR_SHIFT2;
}
extern "C" uint32_t isaac_room_b4_xor_shift3(void) {
  return ISAAC_ROOM_B4_XOR_SHIFT3;
}
extern "C" uint32_t isaac_room_b4_y_offset_bits(void) {
  return ISAAC_ROOM_B4_Y_OFFSET_BITS;
}
extern "C" int32_t isaac_room_b4_desc_type_imm(void) {
  return ISAAC_ROOM_B4_DESC_TYPE_GATE;
}

/* ---- B4 deepen genrand-consumer pure posts (helpers ABI v37). ---- */

extern "C" uint32_t isaac_room_b4_entity_type5(void) {
  return ISAAC_ROOM_B4_ENTITY_TYPE5;
}
extern "C" uint32_t isaac_room_b4_spawn_type_1000(void) {
  return ISAAC_ROOM_B4_SPAWN_TYPE_1000;
}
extern "C" uint32_t isaac_room_b4_spawn_variant_a1(void) {
  return ISAAC_ROOM_B4_SPAWN_VARIANT_A1;
}
extern "C" uint32_t isaac_room_b4_pickup_subtype(void) {
  return ISAAC_ROOM_B4_PICKUP_SUBTYPE;
}
extern "C" uint32_t isaac_room_b4_third_variant(void) {
  return ISAAC_ROOM_B4_THIRD_VARIANT;
}
extern "C" uint32_t isaac_room_b4_spawn_arg_ptr(void) {
  return ISAAC_ROOM_B4_SPAWN_ARG_PTR;
}
extern "C" uint32_t isaac_room_b4_seed_add(void) {
  return ISAAC_ROOM_B4_SEED_ADD;
}
extern "C" uint32_t isaac_room_b4_game_seed_off(void) {
  return ISAAC_ROOM_B4_GAME_SEED_OFF;
}
extern "C" uint32_t isaac_room_b4_entity_seed_off(void) {
  return ISAAC_ROOM_B4_ENTITY_SEED_OFF;
}
extern "C" uint32_t isaac_room_b4_desc_seed_off(void) {
  return ISAAC_ROOM_B4_DESC_SEED_OFF;
}
extern "C" uint32_t isaac_room_b4_band_a_variant(void) {
  return ISAAC_ROOM_B4_BAND_A_VARIANT;
}
extern "C" uint32_t isaac_room_b4_band_a_sub(void) {
  return ISAAC_ROOM_B4_BAND_A_SUB;
}
extern "C" uint32_t isaac_room_b4_band_b_variant(void) {
  return ISAAC_ROOM_B4_BAND_B_VARIANT;
}
extern "C" uint32_t isaac_room_b4_band_b_sub(void) {
  return ISAAC_ROOM_B4_BAND_B_SUB;
}
extern "C" uint32_t isaac_room_b4_band_c_variant(void) {
  return ISAAC_ROOM_B4_BAND_C_VARIANT;
}
extern "C" uint32_t isaac_room_b4_band_c_sub(void) {
  return ISAAC_ROOM_B4_BAND_C_SUB;
}
extern "C" uint32_t isaac_room_b4_band_d_variant(void) {
  return ISAAC_ROOM_B4_BAND_D_VARIANT;
}
extern "C" uint32_t isaac_room_b4_band_d_sub(void) {
  return ISAAC_ROOM_B4_BAND_D_SUB;
}
extern "C" uint32_t isaac_room_b4_band_b_option_off(void) {
  return ISAAC_ROOM_B4_BAND_B_OPTION_OFF;
}
extern "C" uint32_t isaac_room_b4_band_c_option_off(void) {
  return ISAAC_ROOM_B4_BAND_C_OPTION_OFF;
}
extern "C" uint32_t isaac_room_b4_band_d_option_off(void) {
  return ISAAC_ROOM_B4_BAND_D_OPTION_OFF;
}
extern "C" uint32_t isaac_room_b4_pos_pad_bits(void) {
  return ISAAC_ROOM_B4_POS_PAD_BITS;
}
extern "C" uint32_t isaac_room_b4_band_option_off(int32_t band_kind) {
  if (band_kind == ISAAC_ROOM_B4_BAND_B) return ISAAC_ROOM_B4_BAND_B_OPTION_OFF;
  if (band_kind == ISAAC_ROOM_B4_BAND_C) return ISAAC_ROOM_B4_BAND_C_OPTION_OFF;
  if (band_kind == ISAAC_ROOM_B4_BAND_D) return ISAAC_ROOM_B4_BAND_D_OPTION_OFF;
  return 0u;
}

extern "C" uint32_t isaac_room_b4_host_va_reward_body(void) {
  return ISAAC_ROOM_B4_HOST_VA_REWARD_BODY;
}
extern "C" uint32_t isaac_room_b4_host_va_g0(void) {
  return ISAAC_ROOM_B4_HOST_VA_G0;
}
extern "C" uint32_t isaac_room_b4_host_va_frame_gate(void) {
  return ISAAC_ROOM_B4_HOST_VA_FRAME_GATE;
}
extern "C" uint32_t isaac_room_b4_host_va_g1(void) {
  return ISAAC_ROOM_B4_HOST_VA_G1;
}
extern "C" uint32_t isaac_room_b4_host_va_g2a(void) {
  return ISAAC_ROOM_B4_HOST_VA_G2A;
}
extern "C" uint32_t isaac_room_b4_host_va_g2b(void) {
  return ISAAC_ROOM_B4_HOST_VA_G2B;
}
extern "C" uint32_t isaac_room_b4_host_va_g2c(void) {
  return ISAAC_ROOM_B4_HOST_VA_G2C;
}
extern "C" uint32_t isaac_room_b4_host_va_g2d(void) {
  return ISAAC_ROOM_B4_HOST_VA_G2D;
}
extern "C" uint32_t isaac_room_b4_host_va_g3(void) {
  return ISAAC_ROOM_B4_HOST_VA_G3;
}
extern "C" uint32_t isaac_room_b4_host_va_cleanup_site(void) {
  return ISAAC_ROOM_B4_HOST_VA_CLEANUP_SITE;
}
extern "C" uint32_t isaac_room_b4_host_va_next(void) {
  return ISAAC_ROOM_B4_HOST_VA_NEXT;
}

extern "C" int32_t isaac_room_b4_seed_present(uint32_t seed_desc_5c) {
  return seed_desc_5c != 0u ? 1 : 0;
}

extern "C" int32_t isaac_room_b4_lookup_empty(uint32_t lookup_count) {
  return lookup_count == 0u ? 1 : 0;
}

extern "C" int32_t isaac_room_b4_cleanup_needed(uint32_t lookup_result_byte) {
  return (lookup_result_byte & 0xffu) == 0u ? 1 : 0;
}

extern "C" uint32_t isaac_room_b4_seed_offset(uint32_t game_18308) {
  return game_18308 + ISAAC_ROOM_B4_SEED_ADD;
}

extern "C" float isaac_room_b4_pos_pad(void) {
  return __builtin_bit_cast(float, ISAAC_ROOM_B4_POS_PAD_BITS);
}

extern "C" void isaac_room_b4_reward_pos(float room_x_1c, float room_y_20,
                                         IsaacRoomB4RewardPos* out) {
  if (out == nullptr) return;
  /* PE 0x008035a6…0x008035c9: xmm1 = room+0x1c + 0; xmm0 = room+0x20 + 32. */
  out->x = room_x_1c + 0.0f;
  out->y = isaac_room_b4_pos_y_offset(room_y_20);
}

extern "C" void isaac_room_b4_seed_step(uint32_t seed, IsaacRoomB4SeedStep* out) {
  if (out == nullptr) return;
  const uint32_t next = isaac_room_b4_xorshift_imm(seed);
  out->next_seed = next;
  out->rem100 = isaac_room_b4_mod100(next);
}

extern "C" void isaac_room_b4_pickup_from_seed(uint32_t seed,
                                               IsaacRoomB4PickupFromSeed* out) {
  if (out == nullptr) return;
  IsaacRoomB4SeedStep step{};
  isaac_room_b4_seed_step(seed, &step);
  out->next_seed = step.next_seed;
  out->rem100 = step.rem100;
  out->variant = isaac_room_b4_pickup_variant_from_rem(step.rem100);
}

extern "C" void isaac_room_b4_band_imms(int32_t band_kind,
                                        IsaacRoomB4BandImms* out) {
  if (out == nullptr) return;
  out->kind = band_kind;
  out->valid = 0;
  out->variant = 0u;
  out->subtype = 0u;
  if (band_kind == ISAAC_ROOM_B4_BAND_A) {
    out->valid = 1;
    out->variant = ISAAC_ROOM_B4_BAND_A_VARIANT;
    out->subtype = ISAAC_ROOM_B4_BAND_A_SUB;
  } else if (band_kind == ISAAC_ROOM_B4_BAND_B) {
    out->valid = 1;
    out->variant = ISAAC_ROOM_B4_BAND_B_VARIANT;
    out->subtype = ISAAC_ROOM_B4_BAND_B_SUB;
  } else if (band_kind == ISAAC_ROOM_B4_BAND_C) {
    out->valid = 1;
    out->variant = ISAAC_ROOM_B4_BAND_C_VARIANT;
    out->subtype = ISAAC_ROOM_B4_BAND_C_SUB;
  } else if (band_kind == ISAAC_ROOM_B4_BAND_D) {
    out->valid = 1;
    out->variant = ISAAC_ROOM_B4_BAND_D_VARIANT;
    out->subtype = ISAAC_ROOM_B4_BAND_D_SUB;
  }
}

extern "C" void isaac_room_b4_effect_spawn_posts(
    uint32_t genrand, uint32_t game_18308, IsaacRoomB4EffectSpawnPosts* out) {
  if (out == nullptr) return;
  /* PE G0 0x0080341f…0x00803450 after host genrand. */
  out->entity_type = ISAAC_ROOM_B4_SPAWN_TYPE_1000;
  out->variant = ISAAC_ROOM_B4_SPAWN_VARIANT_A1;
  out->seed = genrand;
  out->seed_offset = isaac_room_b4_seed_offset(game_18308);
  out->null_arg = 0u;
  out->arg_ptr = ISAAC_ROOM_B4_SPAWN_ARG_PTR;
}

extern "C" void isaac_room_b4_pickup_spawn_posts(
    uint32_t genrand, uint32_t rem100, IsaacRoomB4PickupSpawnPosts* out) {
  if (out == nullptr) return;
  /* PE G1 0x0080357d…0x008035a1: type5 + pickup variant + subtype 1. */
  out->entity_type = ISAAC_ROOM_B4_ENTITY_TYPE5;
  out->variant = isaac_room_b4_pickup_variant_from_rem(rem100);
  out->subtype = ISAAC_ROOM_B4_PICKUP_SUBTYPE;
  out->seed = genrand;
  out->null_arg = 0u;
  out->arg_ptr = ISAAC_ROOM_B4_SPAWN_ARG_PTR;
}

extern "C" void isaac_room_b4_band_spawn_posts(
    uint32_t genrand, uint32_t rem100, uint32_t option_byte, int32_t mgr_field8,
    uint32_t game_nonnull, uint32_t game_dword_26630, uint32_t game_byte_26589,
    IsaacRoomB4BandSpawnPosts* out) {
  if (out == nullptr) return;
  const int32_t kind = isaac_room_b4_second_band_kind(rem100);
  const int32_t needs = isaac_room_b4_second_band_needs_host(
      rem100, option_byte, mgr_field8, game_nonnull, game_dword_26630,
      game_byte_26589);
  out->needs_spawn = needs;
  out->band_kind = kind;
  out->entity_type = needs != 0 ? ISAAC_ROOM_B4_ENTITY_TYPE5 : 0u;
  out->variant = 0u;
  out->subtype = 0u;
  out->seed = needs != 0 ? genrand : 0u;
  out->null_arg = 0u;
  out->arg_ptr = needs != 0 ? ISAAC_ROOM_B4_SPAWN_ARG_PTR : 0u;
  if (needs != 0) {
    IsaacRoomB4BandImms imms{};
    isaac_room_b4_band_imms(kind, &imms);
    out->variant = imms.variant;
    out->subtype = imms.subtype;
  }
}

extern "C" void isaac_room_b4_third_spawn_posts(
    uint32_t genrand, uint32_t xorshift_result,
    IsaacRoomB4ThirdSpawnPosts* out) {
  if (out == nullptr) return;
  const int32_t needs = isaac_room_b4_third_spawn_gate(xorshift_result);
  out->needs_spawn = needs;
  out->entity_type = needs != 0 ? ISAAC_ROOM_B4_ENTITY_TYPE5 : 0u;
  out->variant = needs != 0 ? ISAAC_ROOM_B4_THIRD_VARIANT : 0u;
  out->subtype = 0u;
  out->seed = needs != 0 ? genrand : 0u;
  out->null_arg0 = 0u;
  out->null_arg1 = 0u;
  out->arg_ptr = needs != 0 ? ISAAC_ROOM_B4_SPAWN_ARG_PTR : 0u;
}

extern "C" void isaac_room_b4_reward_seed_chain(
    uint32_t seed_desc_5c, IsaacRoomB4RewardSeedChain* out) {
  if (out == nullptr) return;
  /* PE 0x008034ee…0x008037c4: three chained xorshift steps on RoomDesc+0x5c.
     Genrand CALL sites G1–G3 still host between pure tables. */
  IsaacRoomB4SeedStep s1{};
  isaac_room_b4_seed_step(seed_desc_5c, &s1);
  out->seed1 = s1.next_seed;
  out->rem1 = s1.rem100;
  out->pickup_variant = isaac_room_b4_pickup_variant_from_rem(s1.rem100);

  IsaacRoomB4SeedStep s2{};
  isaac_room_b4_seed_step(s1.next_seed, &s2);
  out->seed2 = s2.next_seed;
  out->rem2 = s2.rem100;
  out->band_kind = isaac_room_b4_second_band_kind(s2.rem100);

  IsaacRoomB4SeedStep s3{};
  isaac_room_b4_seed_step(s2.next_seed, &s3);
  out->seed3 = s3.next_seed;
  out->third_gate = isaac_room_b4_third_spawn_gate(s3.next_seed);
}

/* ---- B4 host-deepen2: spawn/pos/cleanup pure posts (ABI v39 freestanding). ---- */

extern "C" int32_t isaac_room_b4_lookup_subtype(void) {
  return ISAAC_ROOM_B4_LOOKUP_SUBTYPE;
}
extern "C" uint32_t isaac_room_b4_lookup_this_off(void) {
  return ISAAC_ROOM_B4_LOOKUP_THIS_OFF;
}
extern "C" uint32_t isaac_room_b4_lookup_count_off(void) {
  return ISAAC_ROOM_B4_LOOKUP_COUNT_OFF;
}
extern "C" uint32_t isaac_room_b4_lookup_entity_ptr_off(void) {
  return ISAAC_ROOM_B4_LOOKUP_ENTITY_PTR_OFF;
}
extern "C" uint32_t isaac_room_b4_room_pos_base_off(void) {
  return ISAAC_ROOM_B4_ROOM_POS_BASE_OFF;
}
extern "C" uint32_t isaac_room_b4_room_pos_x_off(void) {
  return ISAAC_ROOM_B4_ROOM_POS_X_OFF;
}
extern "C" uint32_t isaac_room_b4_room_pos_y_off(void) {
  return ISAAC_ROOM_B4_ROOM_POS_Y_OFF;
}
extern "C" uint32_t isaac_room_b4_room_entry_off(void) {
  return ISAAC_ROOM_B4_ROOM_ENTRY_OFF;
}
extern "C" uint32_t isaac_room_b4_room_byte1_off(void) {
  return ISAAC_ROOM_B4_ROOM_BYTE1_OFF;
}
extern "C" uint32_t isaac_room_b4_pos_flag0(void) {
  return ISAAC_ROOM_B4_POS_FLAG0;
}
extern "C" uint32_t isaac_room_b4_pos_flag1(void) {
  return ISAAC_ROOM_B4_POS_FLAG1;
}
extern "C" uint32_t isaac_room_b4_pos_flag2(void) {
  return ISAAC_ROOM_B4_POS_FLAG2;
}
extern "C" uint32_t isaac_room_b4_cleanup_cl(void) {
  return ISAAC_ROOM_B4_CLEANUP_CL;
}

extern "C" uint32_t isaac_room_b4_host_va_pos_a_site(void) {
  return ISAAC_ROOM_B4_HOST_VA_POS_A_SITE;
}
extern "C" uint32_t isaac_room_b4_host_va_entity_seed(void) {
  return ISAAC_ROOM_B4_HOST_VA_ENTITY_SEED;
}
extern "C" uint32_t isaac_room_b4_host_va_seed_check(void) {
  return ISAAC_ROOM_B4_HOST_VA_SEED_CHECK;
}
extern "C" uint32_t isaac_room_b4_host_va_seed_fatal(void) {
  return ISAAC_ROOM_B4_HOST_VA_SEED_FATAL;
}
extern "C" uint32_t isaac_room_b4_host_va_reward_pos(void) {
  return ISAAC_ROOM_B4_HOST_VA_REWARD_POS;
}
extern "C" uint32_t isaac_room_b4_host_va_third_pos(void) {
  return ISAAC_ROOM_B4_HOST_VA_THIRD_POS;
}

extern "C" void isaac_room_b4_lookup_args(IsaacRoomB4LookupArgs* out) {
  if (out == nullptr) return;
  /* PE 0x008033c2…0x008033df before host 0x41af60. */
  out->entity_type = ISAAC_ROOM_B4_SPAWN_TYPE_1000;
  out->variant = ISAAC_ROOM_B4_SPAWN_VARIANT_A1;
  out->subtype = ISAAC_ROOM_B4_LOOKUP_SUBTYPE;
  out->null_arg0 = 0u;
  out->null_arg1 = 0u;
  out->this_off = ISAAC_ROOM_B4_LOOKUP_THIS_OFF;
}

extern "C" void isaac_room_b4_lookup_route(uint32_t lookup_count,
                                           IsaacRoomB4LookupRoute* out) {
  if (out == nullptr) return;
  /* PE 0x008033eb: cmp [lookup+0xc], 0 → G0 empty vs entity seed write. */
  const int32_t empty = isaac_room_b4_lookup_empty(lookup_count);
  if (empty != 0) {
    out->path = ISAAC_ROOM_B4_LOOKUP_PATH_G0;
    out->needs_g0_path = 1;
    out->needs_entity_seed = 0;
    out->needs_pos_a_host = 1;
    out->needs_pos_finish_host = 1;
    out->needs_genrand_host = 1;
    out->needs_spawn_host = 1;
  } else {
    out->path = ISAAC_ROOM_B4_LOOKUP_PATH_ENTITY_SEED;
    out->needs_g0_path = 0;
    out->needs_entity_seed = 1;
    out->needs_pos_a_host = 0;
    out->needs_pos_finish_host = 0;
    out->needs_genrand_host = 0;
    out->needs_spawn_host = 0;
  }
}

extern "C" void isaac_room_b4_g0_pos_posts(IsaacRoomB4G0PosPosts* out) {
  if (out == nullptr) return;
  /* PE 0x008033f4…0x0080341a: push 0,0,1; [esp]=40.0f; call pos_a then finish. */
  out->pad = isaac_room_b4_pos_pad();
  out->flag0 = ISAAC_ROOM_B4_POS_FLAG0;
  out->flag1 = ISAAC_ROOM_B4_POS_FLAG1;
  out->flag2 = ISAAC_ROOM_B4_POS_FLAG2;
  out->needs_pos_a_host = 1;
  out->needs_pos_finish_host = 1;
}

extern "C" void isaac_room_b4_entity_seed_write_posts(
    uint32_t game_18308, uint32_t lookup_count,
    IsaacRoomB4EntitySeedWritePosts* out) {
  if (out == nullptr) return;
  /* PE 0x00803457…0x0080346f when lookup count != 0. */
  const int32_t needs = isaac_room_b4_lookup_empty(lookup_count) == 0 ? 1 : 0;
  out->needs_write = needs;
  out->seed_value = needs != 0 ? isaac_room_b4_seed_offset(game_18308) : 0u;
  out->dest_off = needs != 0 ? ISAAC_ROOM_B4_ENTITY_SEED_OFF : 0u;
}

extern "C" void isaac_room_b4_frame_path_enter(
    uint32_t room_byte1, int32_t entry_11f0, int32_t frame_264f8,
    uint32_t seed_desc_5c, IsaacRoomB4FramePathEnter* out) {
  if (out == nullptr) return;
  /* PE 0x00803472…0x008034ee: frame gate then seed present vs fatal. */
  const int32_t frame =
      isaac_room_b4_frame_in_room_gate(room_byte1, entry_11f0, frame_264f8);
  const int32_t seed = isaac_room_b4_seed_present(seed_desc_5c);
  out->frame_gate = frame;
  out->seed_present = seed;
  out->needs_seed_fatal = (frame != 0 && seed == 0) ? 1 : 0;
  out->needs_rng_chain = (frame != 0 && seed != 0) ? 1 : 0;
  out->needs_pos_finish_host = frame != 0 ? 1 : 0;
  out->pos_base_off = ISAAC_ROOM_B4_ROOM_POS_BASE_OFF;
}

extern "C" void isaac_room_b4_third_pos(float room_x_14, float room_y_20,
                                        IsaacRoomB4ThirdPos* out) {
  if (out == nullptr) return;
  /* PE 0x008037c6…0x008037ef: xmm0=[Room+0x14], xmm1=[Room+0x20] — no +32. */
  out->x = room_x_14 + 0.0f;
  out->y = room_y_20 + 0.0f;
}

extern "C" void isaac_room_b4_pos_finish_copy(float host_x, float host_y,
                                              IsaacRoomB4PosFinishCopy* out) {
  if (out == nullptr) return;
  /* PE 0x008035f2…0x00803603: movss from host pos_finish result. */
  out->x = host_x;
  out->y = host_y;
}

extern "C" void isaac_room_b4_reward_pos_posts(float room_x_1c, float room_y_20,
                                               IsaacRoomB4RewardPosPosts* out) {
  if (out == nullptr) return;
  /* PE 0x008035a6…0x008035ed: pure x/y then host 813520. */
  IsaacRoomB4RewardPos pos{};
  isaac_room_b4_reward_pos(room_x_1c, room_y_20, &pos);
  out->x = pos.x;
  out->y = pos.y;
  out->needs_pos_finish_host = 1;
  out->flag0 = ISAAC_ROOM_B4_POS_FLAG0;
  out->flag1 = ISAAC_ROOM_B4_POS_FLAG1;
  out->flag2 = ISAAC_ROOM_B4_POS_FLAG2;
}

extern "C" void isaac_room_b4_third_path_posts(
    uint32_t xorshift_result, float room_x_14, float room_y_20,
    IsaacRoomB4ThirdPathPosts* out) {
  if (out == nullptr) return;
  /* PE 0x008037c1…0x0080381d: gate, third pos, host pos_finish + genrand + spawn. */
  const int32_t needs = isaac_room_b4_third_spawn_gate(xorshift_result);
  out->needs_spawn = needs;
  if (needs != 0) {
    IsaacRoomB4ThirdPos pos{};
    isaac_room_b4_third_pos(room_x_14, room_y_20, &pos);
    out->pos_x = pos.x;
    out->pos_y = pos.y;
    out->needs_pos_finish_host = 1;
    out->needs_genrand_host = 1;
    out->needs_spawn_host = 1;
    out->entity_type = ISAAC_ROOM_B4_ENTITY_TYPE5;
    out->variant = ISAAC_ROOM_B4_THIRD_VARIANT;
    out->subtype = 0u;
    out->arg_ptr = ISAAC_ROOM_B4_SPAWN_ARG_PTR;
  } else {
    out->pos_x = 0.0f;
    out->pos_y = 0.0f;
    out->needs_pos_finish_host = 0;
    out->needs_genrand_host = 0;
    out->needs_spawn_host = 0;
    out->entity_type = 0u;
    out->variant = 0u;
    out->subtype = 0u;
    out->arg_ptr = 0u;
  }
}

extern "C" void isaac_room_b4_cleanup_posts(uint32_t lookup_result_byte,
                                            IsaacRoomB4CleanupPosts* out) {
  if (out == nullptr) return;
  /* PE 0x00803829…0x00803845: byte==0 → cl=1, push 0,0, call a648b0. */
  const int32_t needs = isaac_room_b4_cleanup_needed(lookup_result_byte);
  out->needs_cleanup = needs;
  out->cl_imm = needs != 0 ? ISAAC_ROOM_B4_CLEANUP_CL : 0u;
  out->null_arg0 = 0u;
  out->null_arg1 = 0u;
  out->host_va = needs != 0 ? ISAAC_ROOM_B4_HOST_VA_CLEANUP : 0u;
}

extern "C" int32_t isaac_room_b4_seed_fatal_needed(uint32_t seed_desc_5c) {
  return isaac_room_b4_seed_present(seed_desc_5c) == 0 ? 1 : 0;
}

extern "C" uint32_t isaac_room_b5_list_reset_end(uint32_t begin_c82674,
                                                uint32_t end_c82678) {
  (void)end_c82678;
  return begin_c82674;
}

extern "C" int32_t isaac_room_b5_list_needs_reset(uint32_t begin_c82674,
                                                  uint32_t end_c82678) {
  return begin_c82674 != end_c82678 ? 1 : 0;
}

extern "C" int32_t isaac_room_b5_outer_gate(uint32_t room_active_byte0,
                                            int32_t frame_264f8,
                                            int32_t entry_11f0) {
  if ((room_active_byte0 & 0xffu) == 0) return 0;
  return (frame_264f8 - entry_11f0) == 0 ? 1 : 0;
}

extern "C" int32_t isaac_room_b5_pass1_mode_gate(int32_t mode_26584) {
  return mode_26584 == (int32_t)ISAAC_ROOM_B5_PASS1_MODE ? 1 : 0;
}

extern "C" int32_t isaac_room_b5_entity_type_candidate(int32_t mode_26614,
                                                       int32_t entity_type_28) {
  if (mode_26614 >= (int32_t)ISAAC_ROOM_B5_MODE_GATE && entity_type_28 == 1) {
    return 1;
  }
  const uint32_t delta =
      static_cast<uint32_t>(entity_type_28) - ISAAC_ROOM_B5_TYPE_RANGE_BASE;
  return delta < ISAAC_ROOM_B5_TYPE_RANGE_SPAN ? 1 : 0;
}

extern "C" int32_t isaac_room_b5_entity_flag_clear(uint32_t flags_168) {
  return (flags_168 & ISAAC_ROOM_B5_FLAG_BIT) == 0 ? 1 : 0;
}

extern "C" int32_t isaac_room_b5_entity_type_excluded(int32_t entity_type_28,
                                                      int32_t entity_variant_2c) {
  if (entity_type_28 == (int32_t)ISAAC_ROOM_B5_TYPE_EXCLUDE_A) return 1;
  if (entity_type_28 == (int32_t)ISAAC_ROOM_B5_TYPE_EXCLUDE_B) return 1;
  if (entity_type_28 == (int32_t)ISAAC_ROOM_B5_TYPE_EXCLUDE_C) return 1;
  if (entity_type_28 == (int32_t)ISAAC_ROOM_B5_TYPE_EXCLUDE_D) return 1;
  if (entity_type_28 == (int32_t)ISAAC_ROOM_B5_TYPE_EXCLUDE_E &&
      entity_variant_2c == (int32_t)ISAAC_ROOM_B5_VARIANT_EXCLUDE_E) {
    return 1;
  }
  return 0;
}

extern "C" int32_t isaac_room_b5_pass1_entity_pre_vcall(
    uint32_t entity_nonnull, int32_t mode_26614, int32_t entity_type_28,
    uint32_t flags_168, int32_t field_32c, int32_t entity_variant_2c) {
  if (entity_nonnull == 0) return 0;
  if (isaac_room_b5_entity_type_candidate(mode_26614, entity_type_28) == 0) {
    return 0;
  }
  if (isaac_room_b5_entity_flag_clear(flags_168) == 0) return 0;
  if (field_32c < 0) return 0;
  if (isaac_room_b5_entity_type_excluded(entity_type_28, entity_variant_2c) != 0) {
    return 0;
  }
  return 1;
}

extern "C" int32_t isaac_room_b5_pass2_count_gate(int32_t count_708250) {
  return count_708250 > (int32_t)ISAAC_ROOM_B5_PASS2_COUNT_MIN ? 1 : 0;
}

extern "C" int32_t isaac_room_b5_list_empty(uint32_t entity_count_1264) {
  return entity_count_1264 == 0 ? 1 : 0;
}

extern "C" int32_t isaac_room_b5_list_continue(uint32_t index,
                                               uint32_t entity_count_1264) {
  const uint32_t next = index + 1u;
  return next < entity_count_1264 ? 1 : 0;
}

extern "C" uint32_t isaac_room_b5_entity_rng_step(uint32_t seed_3dc,
                                                  uint32_t shift_3e0,
                                                  uint32_t shift_3e4,
                                                  uint32_t shift_3e8) {
  return isaac_room_b4_xorshift(seed_3dc, shift_3e0, shift_3e4, shift_3e8);
}

extern "C" int32_t isaac_room_b5_entity_rng_append_gate(uint32_t rng_result) {
  return (rng_result & 1u) == 0 ? 1 : 0;
}

extern "C" uint32_t isaac_room_b5_list_begin_va(void) {
  return ISAAC_ROOM_B5_LIST_BEGIN_VA;
}
extern "C" uint32_t isaac_room_b5_list_end_va(void) {
  return ISAAC_ROOM_B5_LIST_END_VA;
}
extern "C" uint32_t isaac_room_b5_list_cap_va(void) {
  return ISAAC_ROOM_B5_LIST_CAP_VA;
}
extern "C" uint32_t isaac_room_b5_pass1_mode_imm(void) {
  return ISAAC_ROOM_B5_PASS1_MODE;
}
extern "C" uint32_t isaac_room_b5_flag_bit(void) { return ISAAC_ROOM_B5_FLAG_BIT; }

/* ---- B5/B7 deepen pure peels (helpers ABI v39 freestanding). ---- */

static_assert(sizeof(IsaacRoomB5ListAppendRoute) == 12,
              "B5 list append route ABI changed");
static_assert(sizeof(IsaacRoomB5Pass1AppendPosts) == 16,
              "B5 pass1 append posts ABI changed");
static_assert(sizeof(IsaacRoomB5Pass2EntityPosts) == 16,
              "B5 pass2 entity posts ABI changed");
static_assert(sizeof(IsaacRoomB5Pass2RngTryPosts) == 28,
              "B5 pass2 rng try posts ABI changed");
static_assert(sizeof(IsaacRoomB7CellStepPosts) == 16,
              "B7 cell step posts ABI changed");

extern "C" uint32_t isaac_room_b5_vcall_off_48(void) {
  return ISAAC_ROOM_B5_VCALL_OFF_48;
}
extern "C" uint32_t isaac_room_b5_vcall_off_4c(void) {
  return ISAAC_ROOM_B5_VCALL_OFF_4C;
}
extern "C" uint32_t isaac_room_b5_list_ptr_stride(void) {
  return ISAAC_ROOM_B5_LIST_PTR_STRIDE;
}
extern "C" uint32_t isaac_room_b5_entity_rng_shift0_off(void) {
  return ISAAC_ROOM_B5_ENTITY_RNG_SHIFT0_OFF;
}
extern "C" uint32_t isaac_room_b5_entity_rng_shift1_off(void) {
  return ISAAC_ROOM_B5_ENTITY_RNG_SHIFT1_OFF;
}
extern "C" uint32_t isaac_room_b5_entity_rng_shift2_off(void) {
  return ISAAC_ROOM_B5_ENTITY_RNG_SHIFT2_OFF;
}

extern "C" uint32_t isaac_room_b5_host_va_outer(void) {
  return ISAAC_ROOM_B5_HOST_VA_OUTER;
}
extern "C" uint32_t isaac_room_b5_host_va_pass1_vcall48(void) {
  return ISAAC_ROOM_B5_HOST_VA_PASS1_VCALL48;
}
extern "C" uint32_t isaac_room_b5_host_va_pass1_append(void) {
  return ISAAC_ROOM_B5_HOST_VA_PASS1_APPEND;
}
extern "C" uint32_t isaac_room_b5_host_va_pass1_grow(void) {
  return ISAAC_ROOM_B5_HOST_VA_PASS1_GROW;
}
extern "C" uint32_t isaac_room_b5_host_va_pass2_vcall48(void) {
  return ISAAC_ROOM_B5_HOST_VA_PASS2_VCALL48;
}
extern "C" uint32_t isaac_room_b5_host_va_pass2_vcall4c(void) {
  return ISAAC_ROOM_B5_HOST_VA_PASS2_VCALL4C;
}
extern "C" uint32_t isaac_room_b5_host_va_pass2_rng(void) {
  return ISAAC_ROOM_B5_HOST_VA_PASS2_RNG;
}
extern "C" uint32_t isaac_room_b5_host_va_pass2_grow(void) {
  return ISAAC_ROOM_B5_HOST_VA_PASS2_GROW;
}
extern "C" uint32_t isaac_room_b5_host_va_next(void) {
  return ISAAC_ROOM_B5_HOST_VA_NEXT;
}

extern "C" int32_t isaac_room_b5_entity_field_32c_ok(int32_t field_32c) {
  return field_32c >= 0 ? 1 : 0;
}

extern "C" int32_t isaac_room_b5_pass1_entity_pre_vcall48(uint32_t entity_nonnull,
                                                          int32_t mode_26614,
                                                          int32_t entity_type_28,
                                                          uint32_t flags_168) {
  if (entity_nonnull == 0) return 0;
  if (isaac_room_b5_entity_type_candidate(mode_26614, entity_type_28) == 0) {
    return 0;
  }
  if (isaac_room_b5_entity_flag_clear(flags_168) == 0) return 0;
  return 1;
}

extern "C" int32_t isaac_room_b5_pass1_entity_post_vcall48(
    uint32_t vcall48_nonzero, int32_t field_32c, int32_t entity_type_28,
    int32_t entity_variant_2c) {
  if (vcall48_nonzero == 0) return 0;
  if (isaac_room_b5_entity_field_32c_ok(field_32c) == 0) return 0;
  if (isaac_room_b5_entity_type_excluded(entity_type_28, entity_variant_2c) != 0) {
    return 0;
  }
  return 1;
}

extern "C" int32_t isaac_room_b5_list_at_capacity(uint32_t end_c82678,
                                                  uint32_t cap_c8267c) {
  return end_c82678 == cap_c8267c ? 1 : 0;
}

extern "C" int32_t isaac_room_b5_list_can_direct_store(uint32_t end_c82678,
                                                       uint32_t cap_c8267c) {
  return end_c82678 != cap_c8267c ? 1 : 0;
}

extern "C" uint32_t isaac_room_b5_list_end_after_store(uint32_t end_c82678) {
  return end_c82678 + ISAAC_ROOM_B5_LIST_PTR_STRIDE;
}

extern "C" int32_t isaac_room_b5_list_needs_grow_host(uint32_t end_c82678,
                                                      uint32_t cap_c8267c) {
  return isaac_room_b5_list_at_capacity(end_c82678, cap_c8267c);
}

extern "C" void isaac_room_b5_list_append_route(uint32_t end_c82678,
                                                uint32_t cap_c8267c,
                                                IsaacRoomB5ListAppendRoute* out) {
  if (out == nullptr) return;
  out->can_direct_store =
      isaac_room_b5_list_can_direct_store(end_c82678, cap_c8267c);
  out->needs_grow_host =
      isaac_room_b5_list_needs_grow_host(end_c82678, cap_c8267c);
  out->next_end = isaac_room_b5_list_end_after_store(end_c82678);
}

extern "C" void isaac_room_b5_pass1_append_posts(
    uint32_t vcall48_nonzero, int32_t field_32c, int32_t entity_type_28,
    int32_t entity_variant_2c, uint32_t end_c82678, uint32_t cap_c8267c,
    IsaacRoomB5Pass1AppendPosts* out) {
  if (out == nullptr) return;
  const int32_t needs =
      isaac_room_b5_pass1_entity_post_vcall48(vcall48_nonzero, field_32c,
                                              entity_type_28, entity_variant_2c);
  out->needs_append = needs;
  if (needs == 0) {
    out->can_direct_store = 0;
    out->needs_grow_host = 0;
    out->next_end = end_c82678;
    return;
  }
  IsaacRoomB5ListAppendRoute route{};
  isaac_room_b5_list_append_route(end_c82678, cap_c8267c, &route);
  out->can_direct_store = route.can_direct_store;
  out->needs_grow_host = route.needs_grow_host;
  out->next_end = route.next_end;
}

extern "C" int32_t isaac_room_b5_pass2_entity_pre_vcall48(uint32_t entity_nonnull,
                                                          int32_t mode_26614,
                                                          int32_t entity_type_28,
                                                          uint32_t flags_168) {
  /* Pass2 shares the same pre-vcall48 pure CF as pass1 (no excludes). */
  return isaac_room_b5_pass1_entity_pre_vcall48(entity_nonnull, mode_26614,
                                                entity_type_28, flags_168);
}

extern "C" int32_t isaac_room_b5_pass2_entity_mid_vcall48(uint32_t vcall48_nonzero,
                                                          int32_t field_32c) {
  if (vcall48_nonzero == 0) return 0;
  return isaac_room_b5_entity_field_32c_ok(field_32c);
}

extern "C" int32_t isaac_room_b5_pass2_entity_needs_rng(uint32_t vcall4c_nonzero) {
  /* PE: call [vtable+0x4c]; test al,al; jne skip → continue only when al==0. */
  return vcall4c_nonzero == 0 ? 1 : 0;
}

extern "C" int32_t isaac_room_b5_pass2_append_budget(int32_t count_708250) {
  return count_708250 - (int32_t)ISAAC_ROOM_B5_PASS2_COUNT_MIN;
}

extern "C" int32_t isaac_room_b5_entity_rng_seed_present(uint32_t seed_3dc) {
  return seed_3dc != 0 ? 1 : 0;
}

extern "C" int32_t isaac_room_b5_pass2_budget_dec(int32_t budget) {
  return budget - 1;
}

extern "C" int32_t isaac_room_b5_pass2_budget_continue(int32_t budget) {
  return budget > 0 ? 1 : 0;
}

extern "C" void isaac_room_b5_pass2_entity_posts(
    uint32_t entity_nonnull, int32_t mode_26614, int32_t entity_type_28,
    uint32_t flags_168, uint32_t vcall48_nonzero, int32_t field_32c,
    uint32_t vcall4c_nonzero, int32_t count_708250,
    IsaacRoomB5Pass2EntityPosts* out) {
  if (out == nullptr) return;
  out->needs_vcall48_host = isaac_room_b5_pass2_entity_pre_vcall48(
      entity_nonnull, mode_26614, entity_type_28, flags_168);
  if (out->needs_vcall48_host == 0) {
    out->needs_vcall4c_host = 0;
    out->needs_rng_loop = 0;
    out->append_budget = 0;
    return;
  }
  out->needs_vcall4c_host =
      isaac_room_b5_pass2_entity_mid_vcall48(vcall48_nonzero, field_32c);
  if (out->needs_vcall4c_host == 0) {
    out->needs_rng_loop = 0;
    out->append_budget = 0;
    return;
  }
  out->needs_rng_loop = isaac_room_b5_pass2_entity_needs_rng(vcall4c_nonzero);
  out->append_budget =
      out->needs_rng_loop != 0 ? isaac_room_b5_pass2_append_budget(count_708250)
                               : 0;
}

extern "C" void isaac_room_b5_pass2_rng_try_posts(
    uint32_t seed_3dc, uint32_t shift_3e0, uint32_t shift_3e4, uint32_t shift_3e8,
    uint32_t end_c82678, uint32_t cap_c8267c, int32_t budget,
    IsaacRoomB5Pass2RngTryPosts* out) {
  if (out == nullptr) return;
  const uint32_t next =
      isaac_room_b5_entity_rng_step(seed_3dc, shift_3e0, shift_3e4, shift_3e8);
  out->next_seed = next;
  out->needs_append = isaac_room_b5_entity_rng_append_gate(next);
  if (out->needs_append != 0) {
    IsaacRoomB5ListAppendRoute route{};
    isaac_room_b5_list_append_route(end_c82678, cap_c8267c, &route);
    out->can_direct_store = route.can_direct_store;
    out->needs_grow_host = route.needs_grow_host;
    out->next_end = route.next_end;
  } else {
    out->can_direct_store = 0;
    out->needs_grow_host = 0;
    out->next_end = end_c82678;
  }
  out->next_budget = isaac_room_b5_pass2_budget_dec(budget);
  out->budget_continue = isaac_room_b5_pass2_budget_continue(out->next_budget);
}

extern "C" int32_t isaac_room_b6_destroy_tree_gate(uint32_t count_7238) {
  return count_7238 != 0 ? 1 : 0;
}

extern "C" int32_t isaac_room_b6_grid_index_valid(int32_t index, int32_t width_c,
                                                  int32_t height_10) {
  if (index < 0) return 0;
  const int32_t cells = width_c * height_10;
  return index < cells ? 1 : 0;
}

extern "C" int32_t isaac_room_b6_slot_present(uint32_t slot_ptr) {
  return slot_ptr != 0 ? 1 : 0;
}

extern "C" int32_t isaac_room_b7_slot_present(uint32_t slot_ptr) {
  return slot_ptr != 0 ? 1 : 0;
}

extern "C" int32_t isaac_room_b7_cell_count(int32_t width_c, int32_t height_10) {
  return width_c * height_10;
}

extern "C" int32_t isaac_room_b7_cell_loop_enter(int32_t cell_count) {
  return cell_count > 0 ? 1 : 0;
}

extern "C" int32_t isaac_room_b7_cell_loop_continue(int32_t index,
                                                    int32_t cell_count) {
  const int32_t next = index + 1;
  return next < cell_count ? 1 : 0;
}

extern "C" int32_t isaac_room_b7_needs_grid_update_host(int32_t width_c,
                                                        int32_t height_10) {
  return isaac_room_b7_cell_loop_enter(isaac_room_b7_cell_count(width_c, height_10));
}

extern "C" uint32_t isaac_room_b7_grid_base_off(void) {
  return ISAAC_ROOM_B7_GRID_BASE_OFF;
}
extern "C" uint32_t isaac_room_b7_slot_stride(void) {
  return ISAAC_ROOM_B7_SLOT_STRIDE;
}
extern "C" uint32_t isaac_room_b7_vcall_off(void) {
  return ISAAC_ROOM_B7_VCALL_OFF;
}
extern "C" uint32_t isaac_room_b7_host_va_loop(void) {
  return ISAAC_ROOM_B7_HOST_VA_LOOP;
}
extern "C" uint32_t isaac_room_b7_host_va_vcall(void) {
  return ISAAC_ROOM_B7_HOST_VA_VCALL;
}

extern "C" uint32_t isaac_room_b7_grid_slot_off(int32_t index) {
  /* Room+0x24 + index*4 — PE lea esi,[edi+0x24]; add esi,4 each step. */
  return ISAAC_ROOM_B7_GRID_BASE_OFF +
         static_cast<uint32_t>(index) * ISAAC_ROOM_B7_SLOT_STRIDE;
}

extern "C" int32_t isaac_room_b7_cell_needs_vcall(uint32_t slot_ptr) {
  return isaac_room_b7_slot_present(slot_ptr);
}

extern "C" void isaac_room_b7_cell_step_posts(int32_t index, int32_t width_c,
                                              int32_t height_10, uint32_t slot_ptr,
                                              IsaacRoomB7CellStepPosts* out) {
  if (out == nullptr) return;
  out->needs_vcall_host = isaac_room_b7_cell_needs_vcall(slot_ptr);
  out->next_index = index + 1;
  out->cell_count = isaac_room_b7_cell_count(width_c, height_10);
  out->continue_loop =
      isaac_room_b7_cell_loop_continue(index, out->cell_count);
}

extern "C" void isaac_room_b3b7_residual_plan(
    uint32_t te_byte_7321, uint32_t te_begin, uint32_t te_end, int32_t desc_type0,
    uint32_t room_active_byte0, int32_t frame_264f8, int32_t entry_11f0,
    uint32_t tree_count_7238, int32_t width_c, int32_t height_10,
    IsaacRoomB3B7ResidualPlan* out) {
  if (out == nullptr) return;
  out->needs_b3_owner_host = 1;
  out->needs_b3_challenge_host = 1;
  out->needs_b3_temp_effects_host =
      isaac_room_b3_temp_effects_needs_host(te_byte_7321, te_begin, te_end);
  out->needs_b4_reward_host = isaac_room_b4_desc_type_gate(desc_type0);
  out->needs_b5_candidate_host =
      isaac_room_b5_outer_gate(room_active_byte0, frame_264f8, entry_11f0);
  out->needs_b6_destroy_host = isaac_room_b6_destroy_tree_gate(tree_count_7238);
  out->needs_b7_grid_update_host =
      isaac_room_b7_needs_grid_update_host(width_c, height_10);
  out->residual_kind = ISAAC_ROOM_B3B7_RESIDUAL_HOST;
  out->pure_complete = 0;
  out->host_needed = 1;
}

extern "C" void isaac_room_b3b7_wire_decide(
    int32_t sparse_ready, uint32_t te_byte_7321, uint32_t te_begin, uint32_t te_end,
    int32_t desc_type0, uint32_t room_active_byte0, int32_t frame_264f8,
    int32_t entry_11f0, uint32_t tree_count_7238, int32_t width_c, int32_t height_10,
    IsaacRoomB3B7ResidualPlan* out) {
  if (out == nullptr) return;
  if (sparse_ready == 0) {
    out->needs_b3_owner_host = 0;
    out->needs_b3_challenge_host = 0;
    out->needs_b3_temp_effects_host = 0;
    out->needs_b4_reward_host = 0;
    out->needs_b5_candidate_host = 0;
    out->needs_b6_destroy_host = 0;
    out->needs_b7_grid_update_host = 0;
    out->residual_kind = ISAAC_ROOM_B3B7_RESIDUAL_MONOLITHIC;
    out->pure_complete = 0;
    out->host_needed = 1;
    return;
  }
  isaac_room_b3b7_residual_plan(te_byte_7321, te_begin, te_end, desc_type0,
                                room_active_byte0, frame_264f8, entry_11f0,
                                tree_count_7238, width_c, height_10, out);
}

/* ---- B3 host residual body pure CF (helpers ABI v39 freestanding). ---- */

extern "C" uint32_t isaac_room_b3_owner_laz_shared_tag(void) {
  return ISAAC_ROOM_B3_OWNER_LAZ_SHARED_TAG;
}
extern "C" uint32_t isaac_room_b3_owner_config_twin_bit(void) {
  return ISAAC_ROOM_B3_OWNER_CONFIG_TWIN_BIT;
}
extern "C" uint32_t isaac_room_b3_owner_list_stride(void) {
  return ISAAC_ROOM_B3_OWNER_LIST_STRIDE;
}
extern "C" uint32_t isaac_room_b3_owner_player_off_2c(void) {
  return ISAAC_ROOM_B3_OWNER_PLAYER_OFF_2C;
}
extern "C" uint32_t isaac_room_b3_owner_player_off_twin(void) {
  return ISAAC_ROOM_B3_OWNER_PLAYER_OFF_TWIN;
}
extern "C" uint32_t isaac_room_b3_host_va_get_collectible(void) {
  return ISAAC_ROOM_B3_HOST_VA_GET_COLLECTIBLE;
}
extern "C" uint32_t isaac_room_b3_host_va_has_collectible(void) {
  return ISAAC_ROOM_B3_HOST_VA_HAS_COLLECTIBLE;
}
extern "C" uint32_t isaac_room_b3_host_va_get_collectible_effect(void) {
  return ISAAC_ROOM_B3_HOST_VA_GET_COLLECTIBLE_EFFECT;
}
extern "C" uint32_t isaac_room_b3_host_va_count(void) {
  return ISAAC_ROOM_B3_HOST_VA_COUNT;
}

extern "C" int32_t isaac_room_b3_owner_twin_walk_flag(uint32_t laz_shared_tag,
                                                      uint32_t config_ptr_nonzero,
                                                      uint32_t config_field_b8) {
  /* PE FCO @ 0x009be0a7…0x009be0ce (B3-named; same CF as mid-restock owner). */
  if ((laz_shared_tag & 0xffu) == 0u) return 0;
  if (config_ptr_nonzero == 0u) return 0;
  if ((config_field_b8 & ISAAC_ROOM_B3_OWNER_CONFIG_TWIN_BIT) == 0u) return 0;
  return 1;
}

extern "C" int32_t isaac_room_b3_owner_list_empty(uint32_t list_begin,
                                                  uint32_t list_end) {
  return list_begin == list_end ? 1 : 0;
}

extern "C" int32_t isaac_room_b3_owner_player_slot_active(
    uint32_t player_field_2c) {
  return player_field_2c == 0u ? 1 : 0;
}

extern "C" int32_t isaac_room_b3_owner_twin_present(uint32_t twin_ptr) {
  return twin_ptr != 0u ? 1 : 0;
}

extern "C" int32_t isaac_room_b3_owner_has_collectible_hit(uint32_t al_byte) {
  return (al_byte & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_room_b3_owner_list_continue(uint32_t list_cur,
                                                     uint32_t list_end) {
  const uint32_t next = list_cur + ISAAC_ROOM_B3_OWNER_LIST_STRIDE;
  return next != list_end ? 1 : 0;
}

extern "C" uint32_t isaac_room_b3_hce_gate_off(void) {
  return ISAAC_ROOM_B3_HCE_GATE_OFF;
}
extern "C" uint32_t isaac_room_b3_hce_list_begin_off(void) {
  return ISAAC_ROOM_B3_HCE_LIST_BEGIN_OFF;
}
extern "C" uint32_t isaac_room_b3_hce_list_end_off(void) {
  return ISAAC_ROOM_B3_HCE_LIST_END_OFF;
}
extern "C" uint32_t isaac_room_b3_hce_stride(void) {
  return ISAAC_ROOM_B3_HCE_STRIDE;
}
extern "C" uint32_t isaac_room_b3_hce_type_a(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_B3_HCE_TYPE_A);
}
extern "C" uint32_t isaac_room_b3_hce_type_b(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_B3_HCE_TYPE_B);
}
extern "C" uint32_t isaac_room_b3_hce_type_c(void) {
  return static_cast<uint32_t>(ISAAC_ROOM_B3_HCE_TYPE_C);
}
extern "C" uint32_t isaac_room_b3_hce_cooldown_off(void) {
  return ISAAC_ROOM_B3_HCE_COOLDOWN_OFF;
}

extern "C" int32_t isaac_room_b3_hce_gate_open(uint32_t byte_11) {
  /* PE: cmp byte [ecx+0x11], 0; jne return false → open when zero. */
  return (byte_11 & 0xffu) == 0u ? 1 : 0;
}

extern "C" int32_t isaac_room_b3_hce_list_empty(uint32_t begin, uint32_t end) {
  return begin == end ? 1 : 0;
}

extern "C" int32_t isaac_room_b3_hce_type_eligible(int32_t item_type0) {
  /* PE: type ∈ {1, 3, 4} before id compare. */
  if (item_type0 == ISAAC_ROOM_B3_HCE_TYPE_A) return 1;
  if (item_type0 == ISAAC_ROOM_B3_HCE_TYPE_B) return 1;
  if (item_type0 == ISAAC_ROOM_B3_HCE_TYPE_C) return 1;
  return 0;
}

extern "C" int32_t isaac_room_b3_hce_entry_match(int32_t item_type0,
                                                 int32_t item_id4,
                                                 int32_t coltype) {
  if (isaac_room_b3_hce_type_eligible(item_type0) == 0) return 0;
  return item_id4 == coltype ? 1 : 0;
}

extern "C" int32_t isaac_room_b3_hce_list_continue(uint32_t cur, uint32_t end) {
  const uint32_t next = cur + ISAAC_ROOM_B3_HCE_STRIDE;
  return next != end ? 1 : 0;
}

extern "C" int32_t isaac_room_b3_hce_bool_from_match(int32_t matched) {
  return matched != 0 ? 1 : 0;
}

extern "C" int32_t isaac_room_b3_challenge_body_needs_host(uint32_t hce_al) {
  /* PE call site 0x0080335b: test al,al; je skip 7ea2d0. */
  return (hce_al & 0xffu) != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_room_b3_cb_col_e8(void) {
  return ISAAC_ROOM_B3_CB_COL_E8;
}
extern "C" uint32_t isaac_room_b3_cb_col_42(void) {
  return ISAAC_ROOM_B3_CB_COL_42;
}
extern "C" uint32_t isaac_room_b3_cb_mode_16(void) {
  return ISAAC_ROOM_B3_CB_MODE_16;
}
extern "C" uint32_t isaac_room_b3_cb_room_field_off(void) {
  return ISAAC_ROOM_B3_CB_ROOM_FIELD_OFF;
}
extern "C" uint32_t isaac_room_b3_cb_store_off(void) {
  return ISAAC_ROOM_B3_CB_STORE_OFF;
}
extern "C" uint32_t isaac_room_b3_cb_te_this_off(void) {
  return ISAAC_ROOM_B3_CB_TE_THIS_OFF;
}
extern "C" uint32_t isaac_room_b3_cb_f_default_bits(void) {
  return ISAAC_ROOM_B3_CB_F_DEFAULT_BITS;
}
extern "C" uint32_t isaac_room_b3_cb_f_div_bits(void) {
  return ISAAC_ROOM_B3_CB_F_DIV_BITS;
}
extern "C" uint32_t isaac_room_b3_cb_f_mul_bits(void) {
  return ISAAC_ROOM_B3_CB_F_MUL_BITS;
}
extern "C" uint32_t isaac_room_b3_cb_f_floor_bits(void) {
  return ISAAC_ROOM_B3_CB_F_FLOOR_BITS;
}
extern "C" uint32_t isaac_room_b3_cb_f_owner_bits(void) {
  return ISAAC_ROOM_B3_CB_F_OWNER_BITS;
}
extern "C" uint32_t isaac_room_b3_cb_f_mode_bits(void) {
  return ISAAC_ROOM_B3_CB_F_MODE_BITS;
}
extern "C" uint32_t isaac_room_b3_cb_f_hce_bits(void) {
  return ISAAC_ROOM_B3_CB_F_HCE_BITS;
}
extern "C" uint32_t isaac_room_b3_cb_f_count_scale_bits(void) {
  return ISAAC_ROOM_B3_CB_F_COUNT_SCALE_BITS;
}

extern "C" int32_t isaac_room_b3_cb_gce_hit(uint32_t gce_ptr) {
  return gce_ptr != 0u ? 1 : 0;
}
extern "C" int32_t isaac_room_b3_cb_hce_hit(uint32_t al_byte) {
  return (al_byte & 0xffu) != 0u ? 1 : 0;
}
extern "C" int32_t isaac_room_b3_cb_mode_is_16(int32_t mode_26584) {
  return mode_26584 == static_cast<int32_t>(ISAAC_ROOM_B3_CB_MODE_16) ? 1 : 0;
}
extern "C" int32_t isaac_room_b3_cb_room_is_1(int32_t room_1210) {
  return room_1210 == 1 ? 1 : 0;
}
extern "C" int32_t isaac_room_b3_cb_room_is_2(int32_t room_1210) {
  return room_1210 == 2 ? 1 : 0;
}
extern "C" int32_t isaac_room_b3_cb_owner_hit(uint32_t owner_ptr) {
  return owner_ptr != 0u ? 1 : 0;
}

extern "C" float isaac_room_b3_cb_scale_from_cooldown(int32_t cooldown8) {
  /* PE 0x007ea2fb…0x007ea336 after GetCollectibleEffect hit:
       cvtdq2ps(cooldown); /90; max 0; min 1; *0.8; 1-x; max 0.5 */
  const float zero = 0.0f;
  const float one = __builtin_bit_cast(float, ISAAC_ROOM_B3_CB_F_DEFAULT_BITS);
  const float div90 = __builtin_bit_cast(float, ISAAC_ROOM_B3_CB_F_DIV_BITS);
  const float mul08 = __builtin_bit_cast(float, ISAAC_ROOM_B3_CB_F_MUL_BITS);
  const float floor05 = __builtin_bit_cast(float, ISAAC_ROOM_B3_CB_F_FLOOR_BITS);
  float xmm1 = static_cast<float>(cooldown8);
  xmm1 = xmm1 - zero;
  xmm1 = xmm1 / div90;
  if (xmm1 < zero) xmm1 = zero;
  if (xmm1 > one) xmm1 = one;
  xmm1 = xmm1 * mul08;
  float xmm0 = one - xmm1;
  if (xmm0 < floor05) xmm0 = floor05;
  return xmm0;
}

extern "C" void isaac_room_b3_cb_select_base(
    uint32_t gce_ptr, int32_t cooldown8, uint32_t hce_e8_al, uint32_t hce_42_al,
    int32_t mode_26584, int32_t room_1210, uint32_t owner_e8_ptr,
    IsaacRoomB3CbBaseSelect* out) {
  if (out == nullptr) return;
  const float def = __builtin_bit_cast(float, ISAAC_ROOM_B3_CB_F_DEFAULT_BITS);
  const float hce = __builtin_bit_cast(float, ISAAC_ROOM_B3_CB_F_HCE_BITS);
  const float mode = __builtin_bit_cast(float, ISAAC_ROOM_B3_CB_F_MODE_BITS);
  const float owner = __builtin_bit_cast(float, ISAAC_ROOM_B3_CB_F_OWNER_BITS);

  if (isaac_room_b3_cb_gce_hit(gce_ptr) != 0) {
    out->kind = ISAAC_ROOM_B3_CB_BASE_COOLDOWN;
    out->base = isaac_room_b3_cb_scale_from_cooldown(cooldown8);
    return;
  }
  if (isaac_room_b3_cb_hce_hit(hce_e8_al) != 0 ||
      isaac_room_b3_cb_hce_hit(hce_42_al) != 0) {
    out->kind = ISAAC_ROOM_B3_CB_BASE_HCE;
    out->base = hce;
    return;
  }
  if (isaac_room_b3_cb_mode_is_16(mode_26584) != 0) {
    out->kind = ISAAC_ROOM_B3_CB_BASE_MODE;
    out->base = mode;
    return;
  }
  if (isaac_room_b3_cb_room_is_1(room_1210) != 0) {
    out->kind = ISAAC_ROOM_B3_CB_BASE_HCE;
    out->base = hce;
    return;
  }
  if (isaac_room_b3_cb_room_is_2(room_1210) != 0) {
    out->kind = ISAAC_ROOM_B3_CB_BASE_MODE;
    out->base = mode;
    return;
  }
  if (isaac_room_b3_cb_owner_hit(owner_e8_ptr) != 0) {
    out->kind = ISAAC_ROOM_B3_CB_BASE_OWNER;
    out->base = owner;
    return;
  }
  out->kind = ISAAC_ROOM_B3_CB_BASE_DEFAULT;
  out->base = def;
}

extern "C" float isaac_room_b3_cb_count_post(int32_t count_result, float base) {
  /* PE 0x007ea3b4…0x007ea3d2: dec; cmovg max(0,count-1); cvtdq2ps; *0.1; +base */
  const int32_t dec = count_result - 1;
  const int32_t clamped = dec > 0 ? dec : 0;
  const float scale =
      __builtin_bit_cast(float, ISAAC_ROOM_B3_CB_F_COUNT_SCALE_BITS);
  return base + static_cast<float>(clamped) * scale;
}

extern "C" uint32_t isaac_room_b3_te_call_this_off(void) {
  return ISAAC_ROOM_B3_TE_CALL_THIS_OFF;
}
extern "C" uint32_t isaac_room_b3_te_call_copy_dst_off(void) {
  return ISAAC_ROOM_B3_TE_CALL_COPY_DST_OFF;
}
extern "C" uint32_t isaac_room_b3_te_call_copy_size(void) {
  return ISAAC_ROOM_B3_TE_CALL_COPY_SIZE;
}
extern "C" uint32_t isaac_room_b3_te_call_timer_off(void) {
  return ISAAC_ROOM_B3_TE_CALL_TIMER_OFF;
}
extern "C" uint32_t isaac_room_b3_te_call_timer_max(void) {
  return ISAAC_ROOM_B3_TE_CALL_TIMER_MAX;
}
extern "C" uint32_t isaac_room_b3_te_call_timer_init(void) {
  return ISAAC_ROOM_B3_TE_CALL_TIMER_INIT;
}
extern "C" uint32_t isaac_room_b3_te_call_byte71_off(void) {
  return ISAAC_ROOM_B3_TE_CALL_BYTE71_OFF;
}
extern "C" uint32_t isaac_room_b3_te_call_field50(void) {
  return ISAAC_ROOM_B3_TE_CALL_FIELD50;
}
extern "C" uint32_t isaac_room_b3_te_call_field54_bits(void) {
  return ISAAC_ROOM_B3_TE_CALL_FIELD54_BITS;
}
extern "C" uint32_t isaac_room_b3_te_call_field58_bits(void) {
  return ISAAC_ROOM_B3_TE_CALL_FIELD58_BITS;
}
extern "C" uint32_t isaac_room_b3_te_call_field5c_bits(void) {
  return ISAAC_ROOM_B3_TE_CALL_FIELD5C_BITS;
}
extern "C" uint32_t isaac_room_b3_te_call_field60_bits(void) {
  return ISAAC_ROOM_B3_TE_CALL_FIELD60_BITS;
}
extern "C" uint32_t isaac_room_b3_te_call_f_180_bits(void) {
  return ISAAC_ROOM_B3_TE_CALL_F_180_BITS;
}
extern "C" uint32_t isaac_room_b3_te_call_f_150_bits(void) {
  return ISAAC_ROOM_B3_TE_CALL_F_150_BITS;
}
extern "C" uint32_t isaac_room_b3_te_call_f_30_bits(void) {
  return ISAAC_ROOM_B3_TE_CALL_F_30_BITS;
}
extern "C" uint32_t isaac_room_b3_te_call_image_field_off(void) {
  return ISAAC_ROOM_B3_TE_CALL_IMAGE_FIELD_OFF;
}

extern "C" int32_t isaac_room_b3_te_call_timer_positive(int32_t timer34) {
  /* PE: test eax,eax; jle init path. */
  return timer34 > 0 ? 1 : 0;
}

extern "C" int32_t isaac_room_b3_te_call_timer_in_scale_range(int32_t timer34) {
  /* PE: >0 && <0x96 → float recompute path. */
  if (timer34 <= 0) return 0;
  if (timer34 >= static_cast<int32_t>(ISAAC_ROOM_B3_TE_CALL_TIMER_MAX)) return 0;
  return 1;
}

extern "C" int32_t isaac_room_b3_te_call_timer_at_or_above_max(int32_t timer34) {
  return timer34 >= static_cast<int32_t>(ISAAC_ROOM_B3_TE_CALL_TIMER_MAX) ? 1
                                                                          : 0;
}

extern "C" int32_t isaac_room_b3_te_call_needs_init_path(int32_t timer34) {
  return timer34 <= 0 ? 1 : 0;
}

extern "C" int32_t isaac_room_b3_te_call_scale_timer(int32_t timer34) {
  /* PE 0x0099612a…0x00996159:
       cvtdq2ps; sub 0; /150; *30; 180 - x; cvttss2si */
  const float f180 = __builtin_bit_cast(float, ISAAC_ROOM_B3_TE_CALL_F_180_BITS);
  const float f150 = __builtin_bit_cast(float, ISAAC_ROOM_B3_TE_CALL_F_150_BITS);
  const float f30 = __builtin_bit_cast(float, ISAAC_ROOM_B3_TE_CALL_F_30_BITS);
  const float zero = 0.0f;
  float xmm1 = static_cast<float>(timer34);
  xmm1 = xmm1 - zero;
  xmm1 = xmm1 / f150;
  xmm1 = xmm1 * f30;
  const float xmm0 = f180 - xmm1;
  return static_cast<int32_t>(xmm0);
}

extern "C" int32_t isaac_room_b3_te_call_needs_image_host(uint32_t field_3c) {
  /* PE: cmp [esi+0x3c],0; jne skip LoadImage path. */
  return field_3c == 0u ? 1 : 0;
}

extern "C" int32_t isaac_room_b3_te_call_image_present(uint32_t field_3c) {
  return field_3c != 0u ? 1 : 0;
}

extern "C" int32_t isaac_room_b3_te_call_seed_present(uint32_t seed) {
  return seed != 0u ? 1 : 0;
}

extern "C" int32_t isaac_room_b3_te_call_loop_enter(int32_t field50) {
  /* PE: cmp [esi+0x50],0; jle skip loop. */
  return field50 > 0 ? 1 : 0;
}

extern "C" int32_t isaac_room_b3_te_call_loop_continue(int32_t index,
                                                       int32_t field50) {
  const int32_t next = index + 1;
  return next < field50 ? 1 : 0;
}

extern "C" void isaac_room_b3_te_call_init_posts(IsaacRoomB3TeCallInitPosts* out) {
  if (out == nullptr) return;
  out->timer = static_cast<int32_t>(ISAAC_ROOM_B3_TE_CALL_TIMER_INIT);
  out->byte71 = 0;
  out->field50 = static_cast<int32_t>(ISAAC_ROOM_B3_TE_CALL_FIELD50);
  out->field54_bits = ISAAC_ROOM_B3_TE_CALL_FIELD54_BITS;
  out->field58_bits = ISAAC_ROOM_B3_TE_CALL_FIELD58_BITS;
  out->field5c_bits = ISAAC_ROOM_B3_TE_CALL_FIELD5C_BITS;
  out->field60_bits = ISAAC_ROOM_B3_TE_CALL_FIELD60_BITS;
}

/* ---- B9 free-body residual pure CF after FCO(0x226) (helpers ABI v39
   freestanding; B9-only symbols). Host owns 0x41af60 / 0x833420 / free IAT. ---- */

static_assert(sizeof(IsaacRoomB9FreeHeapAccount) == 12,
              "B9 free heap account ABI changed");
static_assert(sizeof(IsaacRoomB9FreeBodyPlan) == 24,
              "B9 free body plan ABI changed");
static_assert(sizeof(IsaacRoomB9FreeLookupArgs) == 28,
              "B9 free lookup args ABI changed");
static_assert(offsetof(IsaacRoomB9FreeBodyPlan, free_block_ptr) == 20,
              "B9 free body plan ABI changed");

extern "C" uint32_t isaac_room_b9_free_entity_type(void) {
  return ISAAC_ROOM_B9_FREE_ENTITY_TYPE;
}
extern "C" uint32_t isaac_room_b9_free_entity_variant(void) {
  return ISAAC_ROOM_B9_FREE_ENTITY_VARIANT;
}
extern "C" int32_t isaac_room_b9_free_entity_subtype(void) {
  return ISAAC_ROOM_B9_FREE_ENTITY_SUBTYPE;
}
extern "C" uint32_t isaac_room_b9_free_arg_pad0(void) {
  return ISAAC_ROOM_B9_FREE_ARG_PAD0;
}
extern "C" uint32_t isaac_room_b9_free_arg_pad1(void) {
  return ISAAC_ROOM_B9_FREE_ARG_PAD1;
}
extern "C" uint32_t isaac_room_b9_free_this_off(void) {
  return ISAAC_ROOM_B9_FREE_THIS_OFF;
}
extern "C" uint32_t isaac_room_b9_free_result_byte_off(void) {
  return ISAAC_ROOM_B9_FREE_RESULT_BYTE_OFF;
}
extern "C" uint32_t isaac_room_b9_free_result_ptr_off(void) {
  return ISAAC_ROOM_B9_FREE_RESULT_PTR_OFF;
}
extern "C" uint32_t isaac_room_b9_free_result_count_off(void) {
  return ISAAC_ROOM_B9_FREE_RESULT_COUNT_OFF;
}
extern "C" uint32_t isaac_room_b9_free_helper_this_off(void) {
  return ISAAC_ROOM_B9_FREE_HELPER_THIS_OFF;
}
extern "C" int32_t isaac_room_b9_free_seh_in(void) {
  return ISAAC_ROOM_B9_FREE_SEH_IN;
}
extern "C" uint32_t isaac_room_b9_free_seh_out(void) {
  return ISAAC_ROOM_B9_FREE_SEH_OUT;
}
extern "C" uint32_t isaac_room_b9_free_heap_stats_global(void) {
  return ISAAC_ROOM_B9_FREE_HEAP_STATS_GLOBAL;
}
extern "C" uint32_t isaac_room_b9_free_heap_stats_delta(void) {
  return ISAAC_ROOM_B9_FREE_HEAP_STATS_DELTA;
}
extern "C" uint32_t isaac_room_b9_free_heap_stats_fallback(void) {
  return ISAAC_ROOM_B9_FREE_HEAP_STATS_FALLBACK;
}
extern "C" uint32_t isaac_room_b9_free_iat_va(void) {
  return ISAAC_ROOM_B9_FREE_IAT_VA;
}
extern "C" uint32_t isaac_room_b9_free_host_va_body(void) {
  return ISAAC_ROOM_B9_FREE_HOST_VA_BODY;
}
extern "C" uint32_t isaac_room_b9_free_host_va_lookup(void) {
  return ISAAC_ROOM_B9_FREE_HOST_VA_LOOKUP;
}
extern "C" uint32_t isaac_room_b9_free_host_va_helper(void) {
  return ISAAC_ROOM_B9_FREE_HOST_VA_HELPER;
}
extern "C" uint32_t isaac_room_b9_free_host_va_free_site(void) {
  return ISAAC_ROOM_B9_FREE_HOST_VA_FREE_SITE;
}
extern "C" uint32_t isaac_room_b9_free_host_va_next(void) {
  return ISAAC_ROOM_B9_FREE_HOST_VA_NEXT;
}

extern "C" int32_t isaac_room_b9_free_helper_needed(uint32_t lookup_count) {
  /* PE @ 0x00803d6e: cmp dword [ebp-0xa3c], 0; jne skip helper. */
  return lookup_count == 0u ? 1 : 0;
}

extern "C" int32_t isaac_room_b9_free_path_needed(uint32_t result_byte) {
  /* PE @ 0x00803d8f: cmp byte [ebp-0xa48], 0; jne skip free. */
  return (result_byte & 0xffu) == 0u ? 1 : 0;
}

extern "C" int32_t isaac_room_b9_free_ptr_needed(uint32_t buf_ptr) {
  /* PE @ 0x00803db2: test ecx; je skip free call. */
  return buf_ptr != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_room_b9_free_heap_stats_base(
    uint32_t heap_stats_global) {
  /* PE @ 0x00803d98…0x00803dac:
     mov edx,[0xc7de78]; test edx; je fallback;
     add edx,0x30; else mov edx,0xc7f618. */
  if (heap_stats_global != 0u) {
    return heap_stats_global + ISAAC_ROOM_B9_FREE_HEAP_STATS_DELTA;
  }
  return ISAAC_ROOM_B9_FREE_HEAP_STATS_FALLBACK;
}

extern "C" uint32_t isaac_room_b9_free_block_ptr(uint32_t buf_ptr) {
  /* PE @ 0x00803db9: add ecx, -4. */
  return buf_ptr - 4u;
}

extern "C" int32_t isaac_room_b9_free_iat_needed(uint32_t result_byte,
                                                 uint32_t buf_ptr) {
  if (isaac_room_b9_free_path_needed(result_byte) == 0) return 0;
  return isaac_room_b9_free_ptr_needed(buf_ptr);
}

extern "C" void isaac_room_b9_free_heap_account(
    uint32_t old_lo, uint32_t old_hi, uint32_t size_header,
    IsaacRoomB9FreeHeapAccount* out) {
  /* PE @ 0x00803db6…0x00803dbf:
     eax = [ecx-4]; sub [edx], eax; sbb [edx+4], 0
     (decomp: base[1] -= (old_lo < size)). */
  if (out == nullptr) return;
  const uint32_t size = size_header;
  const uint32_t borrow = (old_lo < size) ? 1u : 0u;
  out->new_lo = old_lo - size;
  out->new_hi = old_hi - borrow;
  out->borrow = borrow;
}

extern "C" void isaac_room_b9_free_body_plan(uint32_t lookup_count,
                                              uint32_t result_byte,
                                              uint32_t buf_ptr,
                                              uint32_t heap_stats_global,
                                              IsaacRoomB9FreeBodyPlan* out) {
  if (out == nullptr) return;
  const int32_t helper = isaac_room_b9_free_helper_needed(lookup_count);
  const int32_t free_path = isaac_room_b9_free_path_needed(result_byte);
  const int32_t free_ptr = isaac_room_b9_free_ptr_needed(buf_ptr);
  const int32_t free_iat =
      (free_path != 0 && free_ptr != 0) ? 1 : 0;
  out->helper_needed = helper;
  out->free_path_needed = free_path;
  out->free_ptr_needed = free_ptr;
  out->free_iat_needed = free_iat;
  out->heap_stats_base =
      isaac_room_b9_free_heap_stats_base(heap_stats_global);
  out->free_block_ptr =
      free_iat != 0 ? isaac_room_b9_free_block_ptr(buf_ptr) : 0u;
}

extern "C" void isaac_room_b9_free_lookup_args(
    IsaacRoomB9FreeLookupArgs* out) {
  if (out == nullptr) return;
  out->entity_type = ISAAC_ROOM_B9_FREE_ENTITY_TYPE;
  out->entity_variant = ISAAC_ROOM_B9_FREE_ENTITY_VARIANT;
  out->entity_subtype = ISAAC_ROOM_B9_FREE_ENTITY_SUBTYPE;
  out->arg_pad0 = ISAAC_ROOM_B9_FREE_ARG_PAD0;
  out->arg_pad1 = ISAAC_ROOM_B9_FREE_ARG_PAD1;
  out->this_off = ISAAC_ROOM_B9_FREE_THIS_OFF;
  out->host_va = ISAAC_ROOM_B9_FREE_HOST_VA_LOOKUP;
}

/* ---- Isaac::genrand_int32 generator core (helpers ABI v40). ---- */

static_assert(sizeof(IsaacRoomGenrandStep) == 32, "genrand step ABI changed");
static_assert(offsetof(IsaacRoomGenrandStep, index_oob) == 28,
              "genrand step ABI changed");
static_assert(offsetof(IsaacRoomGenrandStep, index_in) == 8,
              "genrand step ABI changed");
static_assert(sizeof(IsaacRoomGenrandFill) == 16, "genrand fill ABI changed");
static_assert(offsetof(IsaacRoomGenrandFill, reloads) == 12,
              "genrand fill ABI changed");
static_assert(sizeof(IsaacRoomGenrandCallResidual) == 44,
              "genrand call residual ABI changed");
static_assert(offsetof(IsaacRoomGenrandCallResidual, host_va_ret) == 40,
              "genrand call residual ABI changed");
static_assert(sizeof(IsaacRoomAmbient824a70GenrandMtPlan) == 48,
              "824a70 genrand MT plan ABI changed");
static_assert(offsetof(IsaacRoomAmbient824a70GenrandMtPlan,
                       requires_sample_stream) == 44,
              "824a70 genrand MT plan ABI changed");
static_assert(sizeof(IsaacRoom7230SpawnPosMt) == 44,
              "7230 spawn pos MT ABI changed");
static_assert(offsetof(IsaacRoom7230SpawnPosMt, genrand) == 28,
              "7230 spawn pos MT ABI changed");
static_assert(offsetof(IsaacRoom7230SpawnPosMt, genrand_pure) == 40,
              "7230 spawn pos MT ABI changed");

static_assert(sizeof(IsaacRoomGenrandConstants) == 96,
              "genrand constants ABI changed");
static_assert(offsetof(IsaacRoomGenrandConstants, mode_flag_va) == 92,
              "genrand constants ABI changed");

extern "C" void isaac_room_genrand_constants(IsaacRoomGenrandConstants* out) {
  if (out == nullptr) return;
  out->n = static_cast<int32_t>(ISAAC_ROOM_GENRAND_N);
  out->m = static_cast<int32_t>(ISAAC_ROOM_GENRAND_M);
  out->loop1_end = static_cast<int32_t>(ISAAC_ROOM_GENRAND_LOOP1_END);
  out->state_bytes = static_cast<int32_t>(ISAAC_ROOM_GENRAND_STATE_BYTES);
  out->init_index = static_cast<int32_t>(ISAAC_ROOM_GENRAND_INIT_INDEX);
  out->unseeded_index =
      static_cast<int32_t>(ISAAC_ROOM_GENRAND_UNSEEDED_INDEX);
  out->upper_mask = uint32_t(ISAAC_ROOM_GENRAND_UPPER_MASK);
  out->lower_mask = uint32_t(ISAAC_ROOM_GENRAND_LOWER_MASK);
  out->matrix_a = uint32_t(ISAAC_ROOM_GENRAND_MATRIX_A);
  out->init_mult = uint32_t(ISAAC_ROOM_GENRAND_INIT_MULT);
  out->init_shift = uint32_t(ISAAC_ROOM_GENRAND_INIT_SHIFT);
  out->default_seed = uint32_t(ISAAC_ROOM_GENRAND_DEFAULT_SEED);
  out->temper_shift_u = uint32_t(ISAAC_ROOM_GENRAND_TEMPER_SHIFT_U);
  out->temper_shift_s = uint32_t(ISAAC_ROOM_GENRAND_TEMPER_SHIFT_S);
  out->temper_shift_t = uint32_t(ISAAC_ROOM_GENRAND_TEMPER_SHIFT_T);
  out->temper_shift_l = uint32_t(ISAAC_ROOM_GENRAND_TEMPER_SHIFT_L);
  out->temper_pre_mask_b = uint32_t(ISAAC_ROOM_GENRAND_TEMPER_PRE_MASK_B);
  out->temper_pre_mask_c = uint32_t(ISAAC_ROOM_GENRAND_TEMPER_PRE_MASK_C);
  out->temper_mask_b = uint32_t(ISAAC_ROOM_GENRAND_TEMPER_MASK_B);
  out->temper_mask_c = uint32_t(ISAAC_ROOM_GENRAND_TEMPER_MASK_C);
  out->mag01_va = uint32_t(ISAAC_ROOM_GENRAND_MAG01_VA);
  out->state_va = uint32_t(ISAAC_ROOM_GENRAND_STATE_VA);
  out->index_va = uint32_t(ISAAC_ROOM_GENRAND_INDEX_VA);
  out->mode_flag_va = uint32_t(ISAAC_ROOM_GENRAND_MODE_FLAG_VA);
}

extern "C" int32_t isaac_room_genrand_index_action(int32_t index) {
  /* PE @0x006eefaf: cmp eax,0x270; jl emit   (signed) */
  if (index < static_cast<int32_t>(ISAAC_ROOM_GENRAND_N)) {
    return ISAAC_ROOM_GENRAND_ACTION_EMIT;
  }
  /* PE @0x006eefba: cmp eax,0x271; jne twist (exact equality seeds) */
  if (index == static_cast<int32_t>(ISAAC_ROOM_GENRAND_UNSEEDED_INDEX)) {
    return ISAAC_ROOM_GENRAND_ACTION_SEED_RELOAD;
  }
  return ISAAC_ROOM_GENRAND_ACTION_RELOAD;
}

extern "C" uint32_t isaac_room_genrand_mag01(uint32_t index) {
  /* PE @0x006eeff2: xor edx,[ecx*4+0xb67f8c] with ecx = y & 1.
     .rdata table = { 0x00000000, 0x9908b0df }. */
  return (index & 1u) != 0u ? uint32_t(ISAAC_ROOM_GENRAND_MATRIX_A) : 0u;
}

extern "C" uint32_t isaac_room_genrand_mix_bits(uint32_t cur, uint32_t next) {
  /* PE @0x006eefd0…0x006eefea, literal operation order:
       edx = mt[k+1]; edx ^= mt[k]; edx &= 0x7fffffff; edx ^= mt[k]. */
  uint32_t y = next;
  y ^= cur;
  y &= uint32_t(ISAAC_ROOM_GENRAND_LOWER_MASK);
  y ^= cur;
  return y;
}

extern "C" uint32_t isaac_room_genrand_twist_word(uint32_t cur, uint32_t next,
                                                  uint32_t far) {
  /* PE @0x006eefeb…0x006ef000: ecx=y&1; edx=y>>1 (shr, logical);
     edx ^= mag01[ecx]; edx ^= mt[k+M]; mt[k] = edx. */
  const uint32_t y = isaac_room_genrand_mix_bits(cur, next);
  uint32_t out = y >> 1;
  out ^= isaac_room_genrand_mag01(y & 1u);
  out ^= far;
  return out;
}

extern "C" uint32_t isaac_room_genrand_temper(uint32_t value) {
  uint32_t y = value;
  /* @0x006ef08e */ y ^= y >> ISAAC_ROOM_GENRAND_TEMPER_SHIFT_U;
  /* @0x006ef095/0x006ef09a: mask BEFORE the shift, as the PE encodes it. */
  y ^= static_cast<uint32_t>((y & uint32_t(ISAAC_ROOM_GENRAND_TEMPER_PRE_MASK_B))
                             << ISAAC_ROOM_GENRAND_TEMPER_SHIFT_S);
  /* @0x006ef0a1/0x006ef0a6 */
  y ^= static_cast<uint32_t>((y & uint32_t(ISAAC_ROOM_GENRAND_TEMPER_PRE_MASK_C))
                             << ISAAC_ROOM_GENRAND_TEMPER_SHIFT_T);
  /* @0x006ef0ad */ y ^= y >> ISAAC_ROOM_GENRAND_TEMPER_SHIFT_L;
  return y;
}

extern "C" void isaac_room_genrand_init(uint32_t seed, uint32_t* state) {
  if (state == nullptr) return;
  /* FUN_006eef20: mt[0] = ecx; then i = 1…623. */
  state[0] = seed;
  for (int32_t i = 1; i < static_cast<int32_t>(ISAAC_ROOM_GENRAND_N); ++i) {
    const uint32_t prev = state[i - 1];
    const uint32_t mixed = prev ^ (prev >> ISAAC_ROOM_GENRAND_INIT_SHIFT);
    /* imul is a 32-bit low multiply; add eax wraps at 32 bits. */
    state[i] = static_cast<uint32_t>(
        mixed * uint32_t(ISAAC_ROOM_GENRAND_INIT_MULT) +
        static_cast<uint32_t>(i));
  }
}

extern "C" void isaac_room_genrand_reload(uint32_t* state) {
  if (state == nullptr) return;
  const int32_t n = static_cast<int32_t>(ISAAC_ROOM_GENRAND_N);
  const int32_t m = static_cast<int32_t>(ISAAC_ROOM_GENRAND_M);
  /* Loop 1 @0x006eefd0…0x006ef00d: kk = 0…226, far = mt[kk+397]. */
  for (int32_t kk = 0; kk < static_cast<int32_t>(ISAAC_ROOM_GENRAND_LOOP1_END);
       ++kk) {
    state[kk] = isaac_room_genrand_twist_word(state[kk], state[kk + 1],
                                              state[kk + m]);
  }
  /* Loop 2 @0x006ef018…0x006ef049: kk = 227…622, far = mt[kk+397-624]. */
  for (int32_t kk = static_cast<int32_t>(ISAAC_ROOM_GENRAND_LOOP1_END);
       kk < n - 1; ++kk) {
    state[kk] = isaac_room_genrand_twist_word(state[kk], state[kk + 1],
                                              state[kk + m - n]);
  }
  /* Wrap @0x006ef04b…0x006ef079: next = mt[0], far = mt[396]. */
  state[n - 1] = isaac_room_genrand_twist_word(state[n - 1], state[0],
                                               state[m - 1]);
}

extern "C" void isaac_room_genrand_next(uint32_t* state, int32_t index,
                                        IsaacRoomGenrandStep* out) {
  if (out == nullptr) return;
  const int32_t action = isaac_room_genrand_index_action(index);
  out->index_in = index;
  out->action = action;
  out->seeded = action == ISAAC_ROOM_GENRAND_ACTION_SEED_RELOAD ? 1 : 0;
  out->reloaded = action == ISAAC_ROOM_GENRAND_ACTION_EMIT ? 0 : 1;
  int32_t slot = index;
  if (action != ISAAC_ROOM_GENRAND_ACTION_EMIT) {
    if (state != nullptr) {
      if (action == ISAAC_ROOM_GENRAND_ACTION_SEED_RELOAD) {
        isaac_room_genrand_init(uint32_t(ISAAC_ROOM_GENRAND_DEFAULT_SEED),
                                state);
      }
      isaac_room_genrand_reload(state);
    }
    /* PE @0x006ef077: xor eax,eax before the emit block. */
    slot = 0;
  }
  /* PE emits mt[slot] with a signed index; slot < 0 is an out-of-bounds read
     that this peel refuses to model. */
  const int32_t oob = slot < 0 ? 1 : 0;
  out->index_oob = oob;
  const uint32_t raw =
      (oob != 0 || state == nullptr) ? 0u : state[slot];
  out->raw = raw;
  out->value = isaac_room_genrand_temper(raw);
  out->index_out = slot + 1; /* inc eax; mov [0xc34f04],eax */
}

extern "C" void isaac_room_genrand_fill(uint32_t* state, int32_t index,
                                        int32_t count, uint32_t* out_values,
                                        IsaacRoomGenrandFill* out) {
  int32_t written = 0;
  int32_t reloads = 0;
  int32_t cursor = index;
  const int32_t want = count > 0 ? count : 0;
  for (int32_t i = 0; i < want; ++i) {
    IsaacRoomGenrandStep step = {};
    isaac_room_genrand_next(state, cursor, &step);
    if (step.reloaded != 0) ++reloads;
    if (out_values != nullptr) out_values[i] = step.value;
    cursor = step.index_out;
    ++written;
  }
  if (out == nullptr) return;
  out->count = written;
  out->index_in = index;
  out->index_out = cursor;
  out->reloads = reloads;
}

extern "C" void isaac_room_genrand_call_residual(
    uint32_t mode_flag, IsaacRoomGenrandCallResidual* out) {
  if (out == nullptr) return;
  /* PE @0x006eef8a: cmp byte ptr [0xc7ac68],0 — low byte only. */
  const int32_t crt = (mode_flag & 0xffu) != 0u ? 1 : 0;
  out->crt_rand_active = crt;
  out->value_pure = crt != 0 ? 0 : 1;
  out->log_ring_host = 1; /* unconditional heap + backtrace tail */
  out->state_bytes = static_cast<int32_t>(ISAAC_ROOM_GENRAND_STATE_BYTES);
  out->state_va = uint32_t(ISAAC_ROOM_GENRAND_STATE_VA);
  out->index_va = uint32_t(ISAAC_ROOM_GENRAND_INDEX_VA);
  out->mode_flag_va = uint32_t(ISAAC_ROOM_GENRAND_MODE_FLAG_VA);
  out->host_va_call = uint32_t(ISAAC_ROOM_GENRAND_HOST_VA_CALL);
  out->host_va_crt_rand = uint32_t(ISAAC_ROOM_GENRAND_IAT_CRT_RAND);
  out->host_va_log_start = uint32_t(ISAAC_ROOM_GENRAND_HOST_VA_LOG_START);
  out->host_va_ret = uint32_t(ISAAC_ROOM_GENRAND_HOST_VA_RET);
}

extern "C" void isaac_room_ambient_824a70_genrand_mt_plan(
    int32_t loop_count, int32_t mt_state_ready, uint32_t mode_flag,
    IsaacRoomAmbient824a70GenrandMtPlan* out) {
  if (out == nullptr) return;
  const int32_t lc = loop_count > 0 ? loop_count : 0;
  const int32_t ready = mt_state_ready != 0 ? 1 : 0;
  const int32_t crt = (mode_flag & 0xffu) != 0u ? 1 : 0;
  const int32_t per_loop =
      static_cast<int32_t>(ISAAC_ROOM_AMBIENT_824A70_GENRAND_SAMPLES_PER_LOOP);
  const int32_t pure = (ready != 0 && crt == 0) ? 1 : 0;
  out->loop_count = lc;
  out->samples_per_loop = per_loop;
  out->max_genrand_per_loop =
      static_cast<int32_t>(ISAAC_ROOM_AMBIENT_824A70_GENRAND_MAX_PER_LOOP);
  out->samples_needed = lc * per_loop;
  out->mt_state_ready = ready;
  out->crt_rand_active = crt;
  out->genrand_pure = pure;
  if (lc == 0) {
    /* No body this frame: nothing to draw, nothing to host. */
    out->pure_posts_ready = 1;
    out->genrand_host_needed = 0;
    out->body_host_needed = 0;
    out->requires_mt_state = 0;
    out->requires_sample_stream = 0;
    return;
  }
  out->pure_posts_ready = pure;
  out->genrand_host_needed = pure != 0 ? 0 : 1;
  /* create / ANM2 / GetLayer / entity vcall are untouched by this unit. */
  out->body_host_needed = 1;
  out->requires_mt_state = (crt == 0 && ready == 0) ? 1 : 0;
  out->requires_sample_stream = crt;
}

extern "C" void isaac_room_ambient_824a70_genrand_mt_samples(
    uint32_t* state, int32_t index, int32_t loop_count, uint32_t mode_flag,
    uint32_t* out_samples, IsaacRoomGenrandFill* out) {
  const int32_t lc = loop_count > 0 ? loop_count : 0;
  const int32_t crt = (mode_flag & 0xffu) != 0u ? 1 : 0;
  const int32_t per_loop =
      static_cast<int32_t>(ISAAC_ROOM_AMBIENT_824A70_GENRAND_SAMPLES_PER_LOOP);
  if (crt != 0) {
    /* PE takes the CRT rand IAT; mt[] is not touched at all. */
    if (out != nullptr) {
      out->count = 0;
      out->index_in = index;
      out->index_out = index;
      out->reloads = 0;
    }
    return;
  }
  isaac_room_genrand_fill(state, index, lc * per_loop, out_samples, out);
}

extern "C" void isaac_room_7230_spawn_pos_mt(
    uint32_t* state, int32_t index, uint32_t mode_flag, float room_f14,
    float room_f18, float room_f1c, float room_f20,
    IsaacRoom7230SpawnPosMt* out) {
  if (out == nullptr) return;
  const int32_t crt = (mode_flag & 0xffu) != 0u ? 1 : 0;
  if (crt != 0) {
    out->span_x = 0.0f;
    out->span_y = 0.0f;
    out->unit = 0.0f;
    out->center_x = 0.0f;
    out->center_y = 0.0f;
    out->max_span = 0.0f;
    out->radius_arg = 0.0f;
    out->genrand = 0u;
    out->index_in = index;
    out->index_out = index;
    out->genrand_pure = 0;
    return;
  }
  /* PE order @0x00813460: the two span subtractions happen BEFORE the genrand
     CALL @0x0081348c, so the spans never observe the RNG. */
  IsaacRoomGenrandStep step = {};
  isaac_room_genrand_next(state, index, &step);
  IsaacRoom7230SpawnPosPosts posts = {};
  isaac_room_7230_spawn_pos_posts(step.value, room_f14, room_f18, room_f1c,
                                  room_f20, &posts);
  out->span_x = posts.span_x;
  out->span_y = posts.span_y;
  out->unit = posts.unit;
  out->center_x = posts.center_x;
  out->center_y = posts.center_y;
  out->max_span = posts.max_span;
  out->radius_arg = posts.radius_arg;
  out->genrand = step.value;
  out->index_in = index;
  out->index_out = step.index_out;
  out->genrand_pure = 1;
}

/* ---- v41: genrand debug ring + CRT-rand override + 7230 finish islands ---- */

static_assert(sizeof(IsaacRoomGenrandLogLayout) == 48, "genrand log layout ABI changed");
static_assert(offsetof(IsaacRoomGenrandLogLayout, max_nodes) == 44,
              "genrand log layout ABI changed");
static_assert(sizeof(IsaacRoomGenrandLogLink) == 20, "genrand log link ABI changed");
static_assert(offsetof(IsaacRoomGenrandLogLink, size_after) == 16,
              "genrand log link ABI changed");
static_assert(sizeof(IsaacRoomGenrandLogRecord) == 12, "genrand log record ABI changed");
static_assert(offsetof(IsaacRoomGenrandLogRecord, depth) == 8,
              "genrand log record ABI changed");
static_assert(sizeof(IsaacRoomGenrandLogTrimStep) == 32, "genrand trim ABI changed");
static_assert(offsetof(IsaacRoomGenrandLogTrimStep, continue_loop) == 28,
              "genrand trim ABI changed");
static_assert(sizeof(IsaacRoomGenrandCallPlan) == 68, "genrand call plan ABI changed");
static_assert(offsetof(IsaacRoomGenrandCallPlan, host_va_alloc) == 40,
              "genrand call plan ABI changed");
static_assert(offsetof(IsaacRoomGenrandCallPlan, host_va_ret) == 64,
              "genrand call plan ABI changed");
static_assert(sizeof(IsaacRoomGenrandCrtOverride) == 60, "crt override ABI changed");
static_assert(offsetof(IsaacRoomGenrandCrtOverride, iat_crt_rand) == 56,
              "crt override ABI changed");
static_assert(sizeof(IsaacRoom7230FinishGrid) == 24, "7230 finish grid ABI changed");
static_assert(offsetof(IsaacRoom7230FinishGrid, valid) == 20,
              "7230 finish grid ABI changed");
static_assert(sizeof(IsaacRoom7230FinishWorld) == 20, "7230 finish world ABI changed");
static_assert(offsetof(IsaacRoom7230FinishWorld, div_ok) == 16,
              "7230 finish world ABI changed");
static_assert(sizeof(IsaacRoom7230FinishStep) == 32, "7230 finish step ABI changed");
static_assert(offsetof(IsaacRoom7230FinishStep, radius) == 28,
              "7230 finish step ABI changed");

extern "C" void isaac_room_genrand_log_layout(IsaacRoomGenrandLogLayout* out) {
  if (out == nullptr) return;
  out->node_bytes = static_cast<int32_t>(ISAAC_ROOM_GENRAND_LOG_NODE_BYTES);
  out->payload_bytes =
      static_cast<int32_t>(ISAAC_ROOM_GENRAND_LOG_PAYLOAD_BYTES);
  out->next_off = static_cast<int32_t>(ISAAC_ROOM_GENRAND_LOG_NEXT_OFF);
  out->prev_off = static_cast<int32_t>(ISAAC_ROOM_GENRAND_LOG_PREV_OFF);
  out->value_off = static_cast<int32_t>(ISAAC_ROOM_GENRAND_LOG_VALUE_OFF);
  out->frame_off = static_cast<int32_t>(ISAAC_ROOM_GENRAND_LOG_FRAME_OFF);
  out->backtrace_off =
      static_cast<int32_t>(ISAAC_ROOM_GENRAND_LOG_BACKTRACE_OFF);
  out->depth_off = static_cast<int32_t>(ISAAC_ROOM_GENRAND_LOG_DEPTH_OFF);
  out->backtrace_frames = static_cast<int32_t>(ISAAC_ROOM_GENRAND_LOG_FRAMES);
  out->zero2_off = static_cast<int32_t>(ISAAC_ROOM_GENRAND_LOG_ZERO2_OFF);
  out->zero2_bytes = static_cast<int32_t>(ISAAC_ROOM_GENRAND_LOG_ZERO2_BYTES);
  out->max_nodes = static_cast<int32_t>(ISAAC_ROOM_GENRAND_LOG_MAX_NODES);
}

extern "C" int32_t isaac_room_genrand_log_overflow_throw(uint32_t size) {
  /* PE @0x006ef0d0: cmp dword [0xc79868],0xed7303; jne skip — equality only. */
  return size == uint32_t(ISAAC_ROOM_GENRAND_LOG_MAX_NODES) ? 1 : 0;
}

extern "C" void isaac_room_genrand_log_link(uint32_t head, uint32_t head_prev,
                                            uint32_t node, int32_t size,
                                            IsaacRoomGenrandLogLink* out) {
  if (out == nullptr) return;
  /* PE @0x006ef12b…0x006ef136:
       eax = [head+4]      (old tail)
       [node]   = head     ; [node+4] = eax
       [head+4] = node     ; [eax]    = node
     with `inc dword [0xc79868]` already executed at 0x006ef125. */
  out->node_next = head;
  out->node_prev = head_prev;
  out->head_prev = node;
  out->old_prev_next = node;
  out->size_after =
      static_cast<int32_t>(static_cast<uint32_t>(size) + 1u);
}

extern "C" void isaac_room_genrand_log_record(uint32_t value, uint32_t frame,
                                              uint32_t backtrace_ret,
                                              IsaacRoomGenrandLogRecord* out) {
  if (out == nullptr) return;
  out->value = value; /* mov [esi+8],edi @0x006ef154 */
  out->frame = frame; /* mov [esi+0xc],eax @0x006ef15f */
  /* movzx eax,ax @0x006ef170 — the USHORT return is zero-extended. */
  out->depth = static_cast<int32_t>(backtrace_ret & 0xffffu);
}

extern "C" uint32_t isaac_room_genrand_log_trim_cutoff(uint32_t frame,
                                                       uint32_t factor) {
  /* PE: add ecx,ecx; sub eax,ecx; sub eax,2 — all 32-bit wrapping. */
  return static_cast<uint32_t>(frame - (factor + factor) - 2u);
}

extern "C" void isaac_room_genrand_log_trim_step(
    int32_t size, uint32_t front, uint32_t front_next, uint32_t front_prev,
    uint32_t front_frame, uint32_t frame, uint32_t factor,
    IsaacRoomGenrandLogTrimStep* out) {
  if (out == nullptr) return;
  const uint32_t cutoff = isaac_room_genrand_log_trim_cutoff(frame, factor);
  out->cutoff = cutoff;
  /* `cmp dword [0xc79868],0; je 0x006ef1d2` gates entry and the back edge. */
  const int32_t nonzero = size != 0 ? 1 : 0;
  out->size_nonzero = nonzero;
  /* `cmp [edx+0xc],eax; jae 0x006ef1d2` — UNSIGNED, so trim iff below. */
  const int32_t needed = (nonzero != 0 && front_frame < cutoff) ? 1 : 0;
  out->trim_needed = needed;
  if (needed == 0) {
    out->prev_next = 0u;
    out->next_prev = 0u;
    out->free_ptr = 0u;
    out->size_after = size;
    out->continue_loop = 0;
    return;
  }
  out->prev_next = front_next; /* mov [ecx],eax   @0x006ef1b1 */
  out->next_prev = front_prev; /* mov [ecx+4],eax @0x006ef1b8 */
  out->free_ptr = front;       /* push edx before 0x00aef15c */
  const int32_t after = static_cast<int32_t>(
      static_cast<uint32_t>(size) - 1u); /* dec [0xc79868] */
  out->size_after = after;
  out->continue_loop = after != 0 ? 1 : 0; /* cmp …,0; jne 0x006ef182 */
}

extern "C" void isaac_room_genrand_call_plan(uint32_t mode_flag, uint32_t size,
                                             IsaacRoomGenrandCallPlan* out) {
  if (out == nullptr) return;
  const int32_t crt = (mode_flag & 0xffu) != 0u ? 1 : 0;
  out->crt_rand_active = crt;
  out->value_pure = crt != 0 ? 0 : 1;
  /* No branch reaches the epilogue without passing 0x006ef0b2. */
  out->ring_reachable = 1;
  out->ring_structure_pure = 1;
  out->overflow_throw_needed = isaac_room_genrand_log_overflow_throw(size);
  out->host_alloc_calls = 1;
  out->host_backtrace_calls = 1;
  out->host_free_calls_min = 0;
  out->host_free_unbounded = 1;
  out->call_pure = 0;
  out->host_va_alloc = uint32_t(ISAAC_ROOM_GENRAND_HOST_VA_ALLOC);
  out->host_va_free = uint32_t(ISAAC_ROOM_GENRAND_HOST_VA_FREE);
  out->host_va_backtrace = uint32_t(ISAAC_ROOM_GENRAND_IAT_BACKTRACE);
  out->host_va_throw = uint32_t(ISAAC_ROOM_GENRAND_IAT_XLENGTH);
  out->host_va_memset = uint32_t(ISAAC_ROOM_GENRAND_HOST_VA_MEMSET);
  out->host_va_ring_start = uint32_t(ISAAC_ROOM_GENRAND_HOST_VA_LOG_START);
  out->host_va_ret = uint32_t(ISAAC_ROOM_GENRAND_HOST_VA_RET);
}

extern "C" void isaac_room_genrand_crt_override(
    uint32_t mode_flag, IsaacRoomGenrandCrtOverride* out) {
  if (out == nullptr) return;
  out->active = (mode_flag & 0xffu) != 0u ? 1 : 0;
  out->default_value = 0; /* 0xc7ac68 has no .data initializer */
  out->writer_count = 2;
  out->reader_count = 1;
  out->reachable_from_room_update = 0;
  out->flag_va = uint32_t(ISAAC_ROOM_GENRAND_MODE_FLAG_VA);
  out->reader_va = uint32_t(ISAAC_ROOM_GENRAND_CRT_READ_VA);
  out->writer_set_va = uint32_t(ISAAC_ROOM_GENRAND_CRT_SET_VA);
  out->writer_clear_va = uint32_t(ISAAC_ROOM_GENRAND_CRT_CLEAR_VA);
  out->bracket_site_va = uint32_t(ISAAC_ROOM_GENRAND_CRT_BRACKET_SITE_VA);
  out->bracket_callee_va = uint32_t(ISAAC_ROOM_GENRAND_CRT_BRACKET_CALLEE_VA);
  out->owner_fn_va = uint32_t(ISAAC_ROOM_GENRAND_CRT_OWNER_VA);
  out->owner_caller_va = uint32_t(ISAAC_ROOM_GENRAND_CRT_OWNER_CALLER_VA);
  out->proven_site_va = uint32_t(ISAAC_ROOM_GENRAND_CRT_PROVEN_SITE_VA);
  out->iat_crt_rand = uint32_t(ISAAC_ROOM_GENRAND_IAT_CRT_RAND);
}

/* ---- 7230 spawn finish (FUN_00813520) pure islands ---- */

extern "C" int32_t isaac_room_7230_finish_threshold(int32_t counter) {
  /* Sequential cmovs — a later one overrides an earlier one. */
  int32_t t = static_cast<int32_t>(ISAAC_ROOM_7230_FINISH_THRESH_BASE);
  if (counter >= 0x3c) t = static_cast<int32_t>(ISAAC_ROOM_7230_FINISH_THRESH_GE60);
  if (counter < 0x28) t = static_cast<int32_t>(ISAAC_ROOM_7230_FINISH_THRESH_LT40);
  if (counter < 0x14) t = static_cast<int32_t>(ISAAC_ROOM_7230_FINISH_THRESH_LT20);
  if (counter < 0x05) t = static_cast<int32_t>(ISAAC_ROOM_7230_FINISH_THRESH_LT5);
  return t;
}

extern "C" int32_t isaac_room_7230_finish_loop_continue(int32_t counter) {
  /* mov eax,[ebp-0xc]; test eax,eax; jg 0x00813570 — signed. */
  return counter > 0 ? 1 : 0;
}

extern "C" uint32_t isaac_room_7230_finish_rng_next(uint32_t seed) {
  uint32_t x = seed;
  x ^= x >> ISAAC_ROOM_7230_FINISH_SHIFT_A;
  x ^= static_cast<uint32_t>(x << ISAAC_ROOM_7230_FINISH_SHIFT_B);
  x ^= x >> ISAAC_ROOM_7230_FINISH_SHIFT_C;
  return x;
}

extern "C" int32_t isaac_room_7230_finish_seed_fatal(uint32_t seed) {
  return seed == 0u ? 1 : 0;
}

static float isaac_room_pe_f32_bits_v41(uint32_t bits) {
  float f = 0.0f;
  const uint8_t* src = reinterpret_cast<const uint8_t*>(&bits);
  uint8_t* dst = reinterpret_cast<uint8_t*>(&f);
  dst[0] = src[0];
  dst[1] = src[1];
  dst[2] = src[2];
  dst[3] = src[3];
  return f;
}

extern "C" float isaac_room_7230_finish_angle(uint32_t seed_out) {
  /* cvtdq2pd of the SIGNED dword, then + 2^32 when bit 31 is set. */
  double wide = static_cast<double>(static_cast<int32_t>(seed_out));
  if ((seed_out >> 31) != 0u) wide += 4294967296.0;
  float f = static_cast<float>(wide); /* cvtpd2ps */
  f = f * isaac_room_pe_f32_bits_v41(ISAAC_ROOM_7230_FINISH_RANDF_BITS);
  f = f * isaac_room_pe_f32_bits_v41(ISAAC_ROOM_7230_FINISH_DEG_BITS);
  f = f * isaac_room_pe_f32_bits_v41(ISAAC_ROOM_7230_FINISH_RAD_BITS);
  return f;
}

extern "C" float isaac_room_7230_finish_radius(float radius_in) {
  const float cap =
      isaac_room_pe_f32_bits_v41(ISAAC_ROOM_7230_FINISH_RADIUS_CAP_BITS);
  const float add =
      isaac_room_pe_f32_bits_v41(ISAAC_ROOM_7230_FINISH_RADIUS_ADD_BITS);
  /* comiss r,500.0; jbe keep — an unordered (NaN) compare also clears the
     zeroing path only when it is *not* above, so NaN keeps the value. */
  float r = radius_in;
  if (r > cap) r = 0.0f;
  return r + add;
}

/* cvttss2si: truncate toward zero; anything not representable yields
   0x80000000 (the x86 "integer indefinite"). */
static int32_t isaac_room_cvttss2si_v41(float value) {
  if (!(value == value)) return static_cast<int32_t>(0x80000000u); /* NaN */
  if (value >= 2147483648.0f || value <= -2147483649.0f) {
    return static_cast<int32_t>(0x80000000u);
  }
  return static_cast<int32_t>(value);
}

extern "C" void isaac_room_7230_finish_grid_index(float x, float y,
                                                  int32_t width, int32_t height,
                                                  IsaacRoom7230FinishGrid* out) {
  if (out == nullptr) return;
  const float grid =
      isaac_room_pe_f32_bits_v41(ISAAC_ROOM_7230_FINISH_GRID_BITS);
  const float y0 =
      isaac_room_pe_f32_bits_v41(ISAAC_ROOM_7230_FINISH_GRID_Y0_BITS);
  const float half =
      isaac_room_pe_f32_bits_v41(ISAAC_ROOM_7230_FINISH_HALF_BITS);
  const int32_t gx = isaac_room_cvttss2si_v41((x - grid) / grid + half);
  const int32_t gy = isaac_room_cvttss2si_v41((y - y0) / grid + half);
  const int32_t xv = (gx >= 0 && gx < width) ? 1 : 0;
  const int32_t yv = (gy >= 0 && gy < height) ? 1 : 0;
  out->grid_x = gx;
  out->grid_y = gy;
  out->x_valid = xv;
  out->y_valid = yv;
  out->valid = (xv != 0 && yv != 0) ? 1 : 0;
  /* imul esi,eax; add esi,ecx — 32-bit wrapping multiply-add. */
  out->index = out->valid != 0
                   ? static_cast<int32_t>(
                         static_cast<uint32_t>(width) *
                             static_cast<uint32_t>(gy) +
                         static_cast<uint32_t>(gx))
                   : -1;
}

extern "C" void isaac_room_7230_finish_grid_world(
    int32_t index, int32_t width, IsaacRoom7230FinishWorld* out) {
  if (out == nullptr) return;
  const float grid =
      isaac_room_pe_f32_bits_v41(ISAAC_ROOM_7230_FINISH_GRID_BITS);
  const float y0 =
      isaac_room_pe_f32_bits_v41(ISAAC_ROOM_7230_FINISH_GRID_Y0_BITS);
  /* cdq + idiv faults on width 0 and on INT_MIN / -1. */
  const int32_t ok =
      (width == 0 || (index == static_cast<int32_t>(0x80000000u) && width == -1))
          ? 0
          : 1;
  if (ok == 0) {
    out->x = 0.0f;
    out->y = 0.0f;
    out->quot = 0;
    out->rem = 0;
    out->div_ok = 0;
    return;
  }
  const int32_t quot = index / width;
  const int32_t rem = index % width;
  out->quot = quot;
  out->rem = rem;
  out->div_ok = 1;
  /* cvtdq2ps then mul/add — note the X term adds 40 and the Y term adds 120. */
  out->x = static_cast<float>(rem) * grid + grid;
  out->y = static_cast<float>(quot) * grid + y0;
}

extern "C" void isaac_room_7230_finish_step(uint32_t seed, int32_t counter,
                                            float radius_in,
                                            IsaacRoom7230FinishStep* out) {
  if (out == nullptr) return;
  out->counter = counter;
  out->continue_loop = isaac_room_7230_finish_loop_continue(counter);
  out->threshold = isaac_room_7230_finish_threshold(counter);
  out->seed_in = seed;
  out->seed_fatal = isaac_room_7230_finish_seed_fatal(seed);
  /* The fatal is noreturn, so no post-fatal state is modelled. */
  const uint32_t next =
      out->seed_fatal != 0 ? 0u : isaac_room_7230_finish_rng_next(seed);
  out->seed_out = next;
  out->angle = out->seed_fatal != 0 ? 0.0f
                                    : isaac_room_7230_finish_angle(next);
  out->radius = isaac_room_7230_finish_radius(radius_in);
}

/* ---- v42: Room::GetGridCollision + the FUN_00813520 host set ---- */

static_assert(sizeof(IsaacRoomGridCollisionQuery) == 28,
              "grid collision query ABI changed");
static_assert(offsetof(IsaacRoomGridCollisionQuery, grid_cost) == 24,
              "grid collision query ABI changed");
static_assert(sizeof(IsaacRoomGridCollisionResult) == 16,
              "grid collision result ABI changed");
static_assert(offsetof(IsaacRoomGridCollisionResult, index_unchecked_high) == 12,
              "grid collision result ABI changed");
static_assert(sizeof(IsaacRoom7230FinishSqrt) == 8, "7230 sqrt ABI changed");
static_assert(offsetof(IsaacRoom7230FinishSqrt, crt_host_needed) == 4,
              "7230 sqrt ABI changed");
static_assert(sizeof(IsaacRoom7230FinishMathResidual) == 40,
              "7230 math residual ABI changed");
static_assert(offsetof(IsaacRoom7230FinishMathResidual, iat_sqrt) == 36,
              "7230 math residual ABI changed");
static_assert(sizeof(IsaacRoom7230FinishRecurseStep) == 12,
              "7230 recurse step ABI changed");
static_assert(offsetof(IsaacRoom7230FinishRecurseStep, enter) == 8,
              "7230 recurse step ABI changed");
static_assert(sizeof(IsaacRoomClamp812f50Simple) == 24,
              "812f50 simple clamp ABI changed");
static_assert(offsetof(IsaacRoomClamp812f50Simple, hi_y) == 20,
              "812f50 simple clamp ABI changed");

extern "C" int32_t isaac_room_grid_collision_config_zero(int32_t data_present,
                                                         int32_t cfg_type,
                                                         int32_t cfg_field8) {
  /* PE @0x007f0809…0x007f0816, all three must hold to reach `je 0x007f085e`. */
  if (data_present == 0) return 0;
  if (cfg_field8 !=
      static_cast<int32_t>(ISAAC_ROOM_GRID_COLLISION_CFG_FIELD8_MATCH)) {
    return 0;
  }
  return cfg_type ==
                 static_cast<int32_t>(ISAAC_ROOM_GRID_COLLISION_CFG_TYPE_MATCH)
             ? 1
             : 0;
}

extern "C" uint32_t isaac_room_grid_collision_from_cost(int32_t cost) {
  /* All three compares are signed (jl / jg / jl). */
  if (cost < static_cast<int32_t>(ISAAC_ROOM_GRID_COLLISION_COST_MID)) {
    if (cost < static_cast<int32_t>(ISAAC_ROOM_GRID_COLLISION_COST_LO)) {
      return uint32_t(ISAAC_ROOM_GRID_COLLISION_VALUE_ZERO);
    }
    return uint32_t(ISAAC_ROOM_GRID_COLLISION_VALUE_HIGH);
  }
  if (cost > static_cast<int32_t>(ISAAC_ROOM_GRID_COLLISION_COST_HI)) {
    return uint32_t(ISAAC_ROOM_GRID_COLLISION_VALUE_HIGH);
  }
  return uint32_t(ISAAC_ROOM_GRID_COLLISION_VALUE_MID_BAND);
}

extern "C" void isaac_room_get_grid_collision(
    const IsaacRoomGridCollisionQuery* query,
    IsaacRoomGridCollisionResult* out) {
  if (out == nullptr) return;
  out->index_unchecked_high = 1; /* the PE never tests the high side */
  if (query == nullptr) {
    out->value = 0u;
    out->path = ISAAC_ROOM_GRID_COLLISION_PATH_CONFIG;
    out->index_negative = 0;
    return;
  }
  const int32_t neg = query->index < 0 ? 1 : 0; /* jns @0x007f081d, signed */
  out->index_negative = neg;

  /* The config early-out is tested BEFORE the index is even loaded. */
  if (isaac_room_grid_collision_config_zero(query->data_present, query->cfg_type,
                                            query->cfg_field8) != 0) {
    out->value = uint32_t(ISAAC_ROOM_GRID_COLLISION_VALUE_ZERO);
    out->path = ISAAC_ROOM_GRID_COLLISION_PATH_CONFIG;
    return;
  }
  if (neg != 0) {
    out->value = uint32_t(ISAAC_ROOM_GRID_COLLISION_VALUE_NEG_INDEX);
    out->path = ISAAC_ROOM_GRID_COLLISION_PATH_NEG_INDEX;
    return;
  }
  if (query->grid_entity_present != 0) {
    out->value = static_cast<uint32_t>(query->grid_entity_field3c);
    out->path = ISAAC_ROOM_GRID_COLLISION_PATH_ENTITY;
    return;
  }
  const int32_t cost = query->grid_cost;
  out->value = isaac_room_grid_collision_from_cost(cost);
  if (cost < static_cast<int32_t>(ISAAC_ROOM_GRID_COLLISION_COST_MID)) {
    out->path = cost < static_cast<int32_t>(ISAAC_ROOM_GRID_COLLISION_COST_LO)
                    ? ISAAC_ROOM_GRID_COLLISION_PATH_COST_LOW
                    : ISAAC_ROOM_GRID_COLLISION_PATH_COST_HIGH;
    return;
  }
  out->path = cost > static_cast<int32_t>(ISAAC_ROOM_GRID_COLLISION_COST_HI)
                  ? ISAAC_ROOM_GRID_COLLISION_PATH_COST_HIGH
                  : ISAAC_ROOM_GRID_COLLISION_PATH_MID_BAND;
}

extern "C" void isaac_room_7230_finish_sqrt(float x,
                                            IsaacRoom7230FinishSqrt* out) {
  if (out == nullptr) return;
  /* PE @0x00435a5d: ucomisd 0.0, x; ja error. `ja` needs CF=0 and ZF=0, so an
     unordered compare (NaN) does NOT branch and -0.0 does not either. */
  const int32_t host = (x < 0.0f) ? 1 : 0;
  out->crt_host_needed = host;
  if (host != 0) {
    out->value = 0.0f; /* the CRT owns this result; nothing is invented here */
    return;
  }
  /* cvtss2sd → sqrtsd → cvtsd2ss: widen, exact sqrt, round once. */
  const double wide = static_cast<double>(x);
  out->value = static_cast<float>(__builtin_sqrt(wide));
}

extern "C" void isaac_room_7230_finish_math_residual(
    float sqrt_arg, IsaacRoom7230FinishMathResidual* out) {
  if (out == nullptr) return;
  IsaacRoom7230FinishSqrt s = {};
  isaac_room_7230_finish_sqrt(sqrt_arg, &s);
  out->cos_host_needed = 1;
  out->sin_host_needed = 1;
  out->sqrt_host_needed = s.crt_host_needed;
  out->sqrt_pure = s.crt_host_needed != 0 ? 0 : 1;
  out->host_va_cos = uint32_t(ISAAC_ROOM_7230_FINISH_HOST_VA_COS);
  out->host_va_sin = uint32_t(ISAAC_ROOM_7230_FINISH_HOST_VA_SIN);
  out->host_va_sqrt = uint32_t(ISAAC_ROOM_7230_FINISH_HOST_VA_SQRT);
  out->iat_cos = uint32_t(ISAAC_ROOM_7230_FINISH_IAT_COS);
  out->iat_sin = uint32_t(ISAAC_ROOM_7230_FINISH_IAT_SIN);
  out->iat_sqrt = uint32_t(ISAAC_ROOM_7230_FINISH_IAT_SQRT);
}

extern "C" void isaac_room_7230_finish_recurse_step(
    int32_t budget, IsaacRoom7230FinishRecurseStep* out) {
  if (out == nullptr) return;
  /* `mov eax,ebx; dec ebx; test eax,eax; jle` — the decrement happens before
     the test on the PRE-decrement value, so the budget always drops. */
  out->budget_in = budget;
  out->budget_out = static_cast<int32_t>(static_cast<uint32_t>(budget) - 1u);
  out->enter = budget > 0 ? 1 : 0;
}

extern "C" int32_t isaac_room_clamp_812f50_path(int32_t desc_present,
                                                int32_t data_present,
                                                int32_t shape) {
  if (desc_present == 0 || data_present == 0) {
    return ISAAC_ROOM_CLAMP_812F50_PATH_PASSTHROUGH;
  }
  /* `add eax,-9; cmp eax,3; ja simple` — the subtraction wraps and the
     compare is UNSIGNED, so only 9,10,11,12 stay on the L-room path. */
  const uint32_t rebased = static_cast<uint32_t>(shape) -
                           uint32_t(ISAAC_ROOM_CLAMP_812F50_SHAPE_LO);
  if (rebased > uint32_t(ISAAC_ROOM_CLAMP_812F50_SHAPE_SPAN)) {
    return ISAAC_ROOM_CLAMP_812F50_PATH_SIMPLE;
  }
  return ISAAC_ROOM_CLAMP_812F50_PATH_LROOM;
}

/* MAXSS dst,src → (dst > src) ? dst : src; MINSS dst,src → (dst < src) ? dst
   : src. Written out so the unordered case keeps `src`, exactly as x86 does. */
static float isaac_room_maxss_v42(float dst, float src) {
  return (dst > src) ? dst : src;
}
static float isaac_room_minss_v42(float dst, float src) {
  return (dst < src) ? dst : src;
}

extern "C" void isaac_room_clamp_812f50_simple(
    float in_x, float in_y, float margin, float f10, float f14, float f18,
    float room_x0, float room_y0, float room_x1, float room_y1,
    IsaacRoomClamp812f50Simple* out) {
  if (out == nullptr) return;
  /* PE @0x00813168…0x008131b7. Note the X axis uses the register margin and
     Room+0x14/0x1c, while the Y axis uses f10 and Room+0x18/0x20. */
  const float lo_x = margin + room_x0;
  const float hi_x = room_x1 - f14;
  const float lo_y = f10 + room_y0;
  const float hi_y = room_y1 - f18;
  out->lo_x = lo_x;
  out->hi_x = hi_x;
  out->lo_y = lo_y;
  out->hi_y = hi_y;
  out->x = isaac_room_minss_v42(isaac_room_maxss_v42(in_x, lo_x), hi_x);
  out->y = isaac_room_minss_v42(isaac_room_maxss_v42(in_y, lo_y), hi_y);
}

/* ---- v43: the 0x00956780 pre-Play sound-id rewrite (correctness fix) ---- */

static_assert(sizeof(IsaacRoomPrePlayPlan) == 28, "pre-play plan ABI changed");
static_assert(offsetof(IsaacRoomPrePlayPlan, id_rewritten) == 24,
              "pre-play plan ABI changed");

extern "C" uint32_t isaac_room_pre_play_rng_next(uint32_t seed, uint32_t shift1,
                                                 uint32_t shift2,
                                                 uint32_t shift3) {
  /* PE 0x00956830…0x00956857. The counts come from CL, so x86 masks them to
     5 bits; C++ would be UB past 31, so mask explicitly. */
  uint32_t x = seed;
  x = (x >> (shift1 & 31u)) ^ x;
  x = static_cast<uint32_t>(x << (shift2 & 31u)) ^ x;
  x = (x >> (shift3 & 31u)) ^ x;
  return x;
}

extern "C" int32_t isaac_room_pre_play_rare_hit(uint32_t seed_out) {
  /* PE: mul 0xcccccccd; shr edx,4; eax = q*5; eax <<= 2; sub esi,eax; jne. */
  return (seed_out % uint32_t(ISAAC_ROOM_PRE_PLAY_RARE_MODULUS)) == 0u ? 1 : 0;
}

extern "C" void isaac_room_pre_play_plan(int32_t seed_literal, int32_t game_null,
                                         int32_t entry_found, uint32_t seed,
                                         uint32_t shift1, uint32_t shift2,
                                         uint32_t shift3,
                                         IsaacRoomPrePlayPlan* out) {
  if (out == nullptr) return;
  out->rng_seed_out = seed;
  out->rng_advanced = 0;
  out->seed_zero_fatal = 0;
  out->rare_hit = 0;
  /* Game == 0 exits at 0x009567b0 without even the lookup. */
  if (game_null != 0) {
    out->host_lookup_needed = 0;
    out->sound_id = seed_literal; /* the local is left untouched */
    out->id_rewritten = 0;
    return;
  }
  out->host_lookup_needed = 1;
  if (entry_found == 0) {
    /* Any of the three node rejections jumps to 0x00956874; no store runs. */
    out->sound_id = seed_literal;
    out->id_rewritten = 0;
    return;
  }
  /* 0x00956806 stores 0x25 unconditionally once the gate passes. */
  int32_t id = static_cast<int32_t>(ISAAC_ROOM_PRE_PLAY_ID_GATED);
  out->seed_zero_fatal = seed == 0u ? 1 : 0;
  const uint32_t next =
      isaac_room_pre_play_rng_next(seed, shift1, shift2, shift3);
  /* The seed is written back at 0x0095685b BEFORE the modulo test. */
  out->rng_seed_out = next;
  out->rng_advanced = 1;
  const int32_t rare = isaac_room_pre_play_rare_hit(next);
  out->rare_hit = rare;
  if (rare != 0) id = static_cast<int32_t>(ISAAC_ROOM_PRE_PLAY_ID_RARE);
  out->sound_id = id;
  out->id_rewritten = id != seed_literal ? 1 : 0;
}

extern "C" int32_t isaac_room_pre_play_sound_id(int32_t seed_literal,
                                                int32_t game_null,
                                                int32_t entry_found,
                                                uint32_t seed, uint32_t shift1,
                                                uint32_t shift2,
                                                uint32_t shift3) {
  IsaacRoomPrePlayPlan plan = {};
  isaac_room_pre_play_plan(seed_literal, game_null, entry_found, seed, shift1,
                           shift2, shift3, &plan);
  return plan.sound_id;
}

extern "C" int32_t isaac_room_b1_sfx_play_id(int32_t game_null,
                                             int32_t entry_found, uint32_t seed,
                                             uint32_t shift1, uint32_t shift2,
                                             uint32_t shift3) {
  /* 0x00802a7c pushes the same local 0x00956780 was handed. */
  return isaac_room_pre_play_sound_id(
      static_cast<int32_t>(ISAAC_ROOM_B1_SFX_ID), game_null, entry_found, seed,
      shift1, shift2, shift3);
}

extern "C" int32_t isaac_room_tailmid_sfx_play_id(int32_t game_null,
                                                  int32_t entry_found,
                                                  uint32_t seed,
                                                  uint32_t shift1,
                                                  uint32_t shift2,
                                                  uint32_t shift3) {
  /* 0x008020be pushes the same local 0x00956780 was handed. */
  return isaac_room_pre_play_sound_id(
      static_cast<int32_t>(ISAAC_ROOM_TAILMID_SFX_ID), game_null, entry_found,
      seed, shift1, shift2, shift3);
}

extern "C" int32_t isaac_room_b1_sfx_id_is_remapped(void) { return 1; }
extern "C" int32_t isaac_room_tailmid_sfx_id_is_remapped(void) { return 1; }
extern "C" int32_t isaac_room_tailmid_800500_timer_sfx_id_is_remapped(void) {
  /* FUN_00800500 makes no 0x00956780 call; 0x00801c37 pushes 0x1cc straight
     into SFXManager::Play at 0x00801c42. */
  return 0;
}

/* ---- v44: FUN_00812f50 L-room clamp body (pure after GetLRoomAreaDesc) --- */

static_assert(sizeof(IsaacRoomClamp812f50LRoom) == 36,
              "lroom clamp ABI changed");
static_assert(offsetof(IsaacRoomClamp812f50LRoom, limit) == 32,
              "lroom clamp ABI changed");

/* xorps with DAT_00bacb70 (0x80000000): a raw sign-bit flip, applied to every
   bit pattern including NaN and zero exactly as the PE does. */
static float isaac_room_negss_v44(float v) {
  return __builtin_bit_cast(
      float, __builtin_bit_cast(uint32_t, v) ^ 0x80000000u);
}

extern "C" void isaac_room_clamp_812f50_lroom(float in_x, float in_y,
                                              float margin, float f10,
                                              float f14, float f18,
                                              const float* lroom_desc7,
                                              int32_t shape_after,
                                              float room_x0, float room_y0,
                                              float room_x1, float room_y1,
                                              IsaacRoomClamp812f50LRoom* out) {
  if (out == nullptr || lroom_desc7 == nullptr) return;
  /* Post-call derived values in the PE's operand order: subss dst,(-x) and
     addss (-x),src — both reduce to the same float32 sum. buf[1] is dead. */
  const float lim9 = lroom_desc7[0] - isaac_room_negss_v44(margin);
  const float lim10 = isaac_room_negss_v44(f14) + lroom_desc7[2];
  const float lim11 = lroom_desc7[4] - isaac_room_negss_v44(margin);
  const float lim12 = isaac_room_negss_v44(f14) + lroom_desc7[6];
  const float sel_a = isaac_room_negss_v44(f18) + lroom_desc7[3];
  const float sel_b = lroom_desc7[5] - isaac_room_negss_v44(f10);
  /* 0x00813025 comiss xmm0,xmm1; ja skips the sel_a reload — ordered strict
     greater keeps sel_b; <=, == and UNORDERED all take sel_a. */
  const int32_t took_b = (lim12 - lim11) > (lim10 - lim9) ? 1 : 0;
  const float sel = took_b != 0 ? sel_b : sel_a;
  /* 0x00813030…0x00813074: the same maxss/minss chain as the simple clamp,
     over Room fields RE-READ after the host call. */
  const float x2 = isaac_room_minss_v42(
      isaac_room_maxss_v42(in_x, margin + room_x0), room_x1 - f14);
  const float y2 = isaac_room_minss_v42(
      isaac_room_maxss_v42(in_y, f10 + room_y0), room_y1 - f18);
  out->x_simple = x2;
  out->y_simple = y2;
  out->sel = sel;
  out->select_took_b = took_b;
  float out_x = x2;
  float out_y = y2;
  float limit = 0.0f;
  int32_t arm = 0;
  int32_t store_path = ISAAC_ROOM_CLAMP_812F50_LROOM_STORE_SIMPLE;
  /* Ladder on the POST-call shape. Every gate is comiss+jbe, so an arm is
     entered only on an ordered strict compare; NaN falls to the simple store.
     The in-arm diff compare is comiss+jbe the OTHER way: <= or unordered
     replaces y with sel, only ordered strict greater stores the limit. */
  if (shape_after == 9) {
    arm = 9;
    limit = lim9;
    if (lim9 > x2 && sel > y2) {
      if (!((sel - y2) > (lim9 - x2))) {
        store_path = ISAAC_ROOM_CLAMP_812F50_LROOM_STORE_SEL_Y;
        out_y = sel;
      } else {
        store_path = ISAAC_ROOM_CLAMP_812F50_LROOM_STORE_LIMIT;
        out_x = lim9;
      }
    }
  } else if (shape_after == 0xa) {
    arm = 0xa;
    limit = lim10;
    if (x2 > lim10 && sel > y2) {
      if (!((sel - y2) > (x2 - lim10))) {
        store_path = ISAAC_ROOM_CLAMP_812F50_LROOM_STORE_SEL_Y;
        out_y = sel;
      } else {
        store_path = ISAAC_ROOM_CLAMP_812F50_LROOM_STORE_LIMIT;
        out_x = lim10;
      }
    }
  } else if (shape_after == 0xb) {
    arm = 0xb;
    limit = lim11;
    /* gate2 operands are FLIPPED relative to arms 9/0xa (comiss xmm2,xmm4). */
    if (lim11 > x2 && y2 > sel) {
      if (!((y2 - sel) > (lim11 - x2))) {
        store_path = ISAAC_ROOM_CLAMP_812F50_LROOM_STORE_SEL_Y;
        out_y = sel;
      } else {
        store_path = ISAAC_ROOM_CLAMP_812F50_LROOM_STORE_LIMIT;
        out_x = lim11;
      }
    }
  } else if (shape_after == 0xc) {
    arm = 0xc;
    limit = lim12;
    if (x2 > lim12 && y2 > sel) {
      if (!((y2 - sel) > (x2 - lim12))) {
        store_path = ISAAC_ROOM_CLAMP_812F50_LROOM_STORE_SEL_Y;
        out_y = sel;
      } else {
        store_path = ISAAC_ROOM_CLAMP_812F50_LROOM_STORE_LIMIT;
        out_x = lim12;
      }
    }
  }
  out->x = out_x;
  out->y = out_y;
  out->shape_arm = arm;
  out->store_path = store_path;
  out->limit = limit;
}

/* ---- v45: FUN_00813520 clamp sites A/B post-clamp continuations ---------- */

static_assert(sizeof(IsaacRoom7230SiteAProbe) == 24, "site A probe ABI changed");
static_assert(sizeof(IsaacRoom7230SiteACost) == 28, "site A cost ABI changed");
static_assert(sizeof(IsaacRoom7230SiteBSnap) == 44, "site B snap ABI changed");
static_assert(offsetof(IsaacRoom7230SiteBSnap, y) == 40,
              "site B snap ABI changed");

extern "C" int32_t isaac_room_7230_site_a_identity_accept(float clamped_x,
                                                          float cand_x,
                                                          float clamped_y,
                                                          float cand_y) {
  /* ucomiss + lahf + test ah,0x44 + jp: the jump is taken on NOT-EQUAL and
     on UNORDERED (parity of ZF|PF is even for 0x00 and 0x44, odd for the
     equal case 0x40). Survive only on ordered equality; x first. */
  if (!(clamped_x == cand_x)) {
    return 0;
  }
  if (!(clamped_y == cand_y)) {
    return 0;
  }
  return 1;
}

extern "C" void isaac_room_7230_site_a_probe(float clamped_x, float cand_x,
                                             float clamped_y, float cand_y,
                                             int32_t width, int32_t height,
                                             IsaacRoom7230SiteAProbe* out) {
  if (out == nullptr) return;
  const int32_t accept = isaac_room_7230_site_a_identity_accept(
      clamped_x, cand_x, clamped_y, cand_y);
  out->identity_accept = accept;
  out->grid_x = 0;
  out->grid_y = 0;
  out->index = 0;
  out->best_index = 0;
  if (accept == 0) {
    /* jp taken → the PE jumps to the loop test; nothing else is computed. */
    out->phase = ISAAC_ROOM_7230_SITE_A_REJECT_IDENTITY;
    return;
  }
  IsaacRoom7230FinishGrid grid = {};
  isaac_room_7230_finish_grid_index(clamped_x, clamped_y, width, height, &grid);
  out->grid_x = grid.grid_x;
  out->grid_y = grid.grid_y;
  out->index = grid.index;
  if (grid.valid == 0) {
    /* 0x0081389f: or esi,-1. */
    out->phase = ISAAC_ROOM_7230_SITE_A_RANGE_FAIL;
    out->best_index = -1;
    return;
  }
  if (grid.index < 0) {
    /* `add esi,ecx; js` — the wrapped-negative sum becomes best as-is. */
    out->phase = ISAAC_ROOM_7230_SITE_A_INDEX_NEGATIVE;
    out->best_index = grid.index;
    return;
  }
  out->phase = ISAAC_ROOM_7230_SITE_A_NEED_COST;
  out->best_index = grid.index;
}

extern "C" void isaac_room_7230_site_a_cost_apply(int32_t index,
                                                  int32_t cost_at_index,
                                                  int32_t threshold,
                                                  int32_t width,
                                                  int32_t entity_count,
                                                  IsaacRoom7230SiteACost* out) {
  if (out == nullptr) return;
  /* 0x008137ab cmp [ebx+esi*4+0x76c],edi; jge — SIGNED, and the new index
     stays in esi on BOTH outcomes. */
  const int32_t pass = cost_at_index < threshold ? 1 : 0;
  out->pass = pass;
  out->best_index = index;
  out->snapped = 0;
  out->div_ok = 1;
  out->snap_x = 0.0f;
  out->snap_y = 0.0f;
  out->entity_walk_needed = 0;
  if (pass == 0) {
    /* Raw candidate coords survive in [ebp-4/-8]; nothing else runs. */
    return;
  }
  IsaacRoom7230FinishWorld world = {};
  isaac_room_7230_finish_grid_world(index, width, &world);
  out->snapped = 1;
  out->div_ok = world.div_ok;
  out->snap_x = world.x;
  out->snap_y = world.y;
  /* 0x008137ec test ebx,ebx; je — the walk itself is host (live entities,
     sqrt, cmova best=-1 when dist < 20.0f). */
  out->entity_walk_needed = entity_count != 0 ? 1 : 0;
}

extern "C" int32_t isaac_room_7230_exit_counter(int32_t accepted,
                                                int32_t counter_stored) {
  /* Accept paths load the stored counter; exhaustion decs 0 to -1. */
  return accepted != 0 ? counter_stored : -1;
}

extern "C" int32_t isaac_room_7230_site_b_taken(int32_t exit_eax) {
  /* 0x008138bd test eax,eax; jg skip — signed; 0 and negatives take site B,
     so an accept on the 125th iteration is overwritten (original quirk). */
  return exit_eax > 0 ? 0 : 1;
}

extern "C" void isaac_room_7230_site_b_snap(float clamped_x, float clamped_y,
                                            int32_t width, int32_t height,
                                            IsaacRoom7230SiteBSnap* out) {
  if (out == nullptr) return;
  /* Both cvttss2si conversions run BEFORE any range test (0x0081391a /
     0x00813933); the arithmetic is the site-A grid transform. */
  IsaacRoom7230FinishGrid grid = {};
  isaac_room_7230_finish_grid_index(clamped_x, clamped_y, width, height, &grid);
  out->grid_x = grid.grid_x;
  out->grid_y = grid.grid_y;
  out->x_valid = grid.x_valid;
  out->y_valid = grid.y_valid;
  out->valid = grid.valid;
  /* grid.index is already the funnel: wrapped sum when valid, -1 otherwise
     (0x00813954/57). The idiv then runs UNCONDITIONALLY. */
  out->index = grid.index;
  IsaacRoom7230FinishWorld world = {};
  isaac_room_7230_finish_grid_world(grid.index, width, &world);
  out->div_ok = world.div_ok;
  out->quot = world.quot;
  out->rem = world.rem;
  out->x = world.x;
  out->y = world.y;
}


/* -------------------------------------------------------------------------
   v46 — FUN_00813520 spawn-search loop pure core.
   See room_pure_helpers.h v46 block for the PE order and capture contract.
   ------------------------------------------------------------------------ */

extern "C" void isaac_room_7230_spawn_pre_accept(
    int32_t best_index, int32_t cost_at_best, int32_t gridcoll_result,
    int32_t entity_present_captured, int32_t entity_type_captured,
    int32_t arg5_byte, int32_t threshold, IsaacRoom7230SpawnPreAccept* out) {
  if (out == nullptr) return;
  /* 0x008135b2 test esi,esi; js 0x00813618 — no best yet. */
  if (best_index < 0) {
    out->accept = 0;
    out->reason = ISAAC_ROOM_7230_SPAWN_PRE_NO_BEST;
    return;
  }
  /* 0x008135bd cmp edx,edi; jl 0x008135d6 — signed cost < threshold. */
  if (cost_at_best < threshold) {
    goto entity_check;
  }
  /* 0x008135c1 cmp byte [ebp+0x18],0; je continue. */
  if ((static_cast<uint32_t>(arg5_byte) & 0xffu) == 0u) {
    out->accept = 0;
    out->reason = ISAAC_ROOM_7230_SPAWN_PRE_COST_ARG5;
    return;
  }
  /* 0x008135c7 cmp ecx,1; jne continue — gridcoll must be exactly 1. */
  if (gridcoll_result != 1) {
    out->accept = 0;
    out->reason = ISAAC_ROOM_7230_SPAWN_PRE_COST_GRID;
    return;
  }
  /* 0x008135cc lea eax,[edi+0xbb8]; cmp edx,eax; jge continue. */
  if (cost_at_best >= threshold + ISAAC_ROOM_7230_SPAWN_COST_EXTRA) {
    out->accept = 0;
    out->reason = ISAAC_ROOM_7230_SPAWN_PRE_COST_EXTRA;
    return;
  }
entity_check:
  /* 0x008135e6 test ecx,ecx; je 0x008135f5 — gridcoll==0 skips the re-gate
     (this re-gate runs on BOTH accept paths). */
  if (gridcoll_result != 0) {
    /* 0x008135ea cmp byte [ebp+0x18],0; je continue. */
    if ((static_cast<uint32_t>(arg5_byte) & 0xffu) == 0u) {
      out->accept = 0;
      out->reason = ISAAC_ROOM_7230_SPAWN_PRE_ENTITY_ARG5;
      return;
    }
    /* 0x008135f0 cmp ecx,1; jne continue. */
    if (gridcoll_result != 1) {
      out->accept = 0;
      out->reason = ISAAC_ROOM_7230_SPAWN_PRE_ENTITY_GRID;
      return;
    }
  }
  /* 0x008135d6 cmp esi,0x1c0; jge 0x008135e4 → eax = 0. */
  const int32_t present =
      (best_index < ISAAC_ROOM_7230_SPAWN_BEST_ENTITY_BOUND &&
       entity_present_captured != 0)
          ? 1
          : 0;
  /* 0x008135f5 test eax,eax; je 0x008138a4 — ACCEPT with no entity. */
  if (present == 0) {
    out->accept = 1;
    out->reason = ISAAC_ROOM_7230_SPAWN_PRE_ACCEPT_NO_ENTITY;
    return;
  }
  /* 0x008135fd mov eax,[eax+4]; type ladder: 0x11/0x12/0x14/0x17 reject
     (the 0x17 case falls through to 0x00813618 via `jne accept`), any
     other type ACCEPTS. */
  const int32_t t = entity_type_captured;
  if (t == ISAAC_ROOM_7230_SPAWN_REJECT_TYPE_11 ||
      t == ISAAC_ROOM_7230_SPAWN_REJECT_TYPE_12 ||
      t == ISAAC_ROOM_7230_SPAWN_REJECT_TYPE_14 ||
      t == ISAAC_ROOM_7230_SPAWN_REJECT_TYPE_17) {
    out->accept = 0;
    out->reason = ISAAC_ROOM_7230_SPAWN_PRE_TYPE_REJECT;
    return;
  }
  out->accept = 1;
  out->reason = ISAAC_ROOM_7230_SPAWN_PRE_ACCEPT_TYPE_OK;
}

extern "C" void isaac_room_7230_spawn_candidate(uint32_t seed, float radius_in,
                                                float in_x, float in_y,
                                                float cos_value, float sin_value,
                                                IsaacRoom7230SpawnCandidate* out) {
  if (out == nullptr) return;
  /* 0x00813618 comiss+addss: radius is written back to the arg slot, so the
     next iteration sees the +5 (or reset) value. */
  out->radius = isaac_room_7230_finish_radius(radius_in);
  /* 0x00813639 test edx,edx; jne — seed 0 is the fatal (noreturn). */
  out->seed_fatal = isaac_room_7230_finish_seed_fatal(seed);
  const uint32_t next =
      out->seed_fatal != 0 ? 0u : isaac_room_7230_finish_rng_next(seed);
  out->seed_out = next;
  out->angle =
      out->seed_fatal != 0 ? 0.0f : isaac_room_7230_finish_angle(next);
  /* 0x008136a3 call 0x41d540 → X; 0x008136b9 call 0x41d520 → Y. Both
     results are mulss by the radius then addss by the in component. */
  out->cand_x = static_cast<float>(static_cast<float>(cos_value) *
                                   static_cast<float>(out->radius)) +
                static_cast<float>(in_x);
  out->cand_y = static_cast<float>(static_cast<float>(sin_value) *
                                   static_cast<float>(out->radius)) +
                static_cast<float>(in_y);
}

extern "C" void isaac_room_7230_clamp_site_a(
    int32_t desc_present, int32_t data_present, float in_x, float in_y,
    const float* lroom_desc7, int32_t shape_after, float room_x0, float room_y0,
    float room_x1, float room_y1, IsaacRoom7230ClampSite* out) {
  if (out == nullptr) return;
  const int32_t path =
      isaac_room_clamp_812f50_path(desc_present, data_present, shape_after);
  out->lroom_needed = (path == ISAAC_ROOM_CLAMP_812F50_PATH_LROOM) ? 1 : 0;
  if (path == ISAAC_ROOM_CLAMP_812F50_PATH_PASSTHROUGH) {
    /* 0x008131ba: bit-copy of the in pos. */
    out->clamped_x = in_x;
    out->clamped_y = in_y;
    return;
  }
  /* SITE A constants: margin 0 (xorps @0x008136d5), f10=f14=f18=0
     (three zero stores @0x008136dd/ea/f5). */
  IsaacRoomClamp812f50LRoom clamp = {};
  isaac_room_clamp_812f50_lroom(in_x, in_y, 0.0f, 0.0f, 0.0f, 0.0f,
                                lroom_desc7, shape_after, room_x0, room_y0,
                                room_x1, room_y1, &clamp);
  out->clamped_x = clamp.x;
  out->clamped_y = clamp.y;
}

extern "C" void isaac_room_7230_clamp_site_b(
    int32_t desc_present, int32_t data_present, float in_x, float in_y,
    const float* lroom_desc7, int32_t shape_after, float room_x0, float room_y0,
    float room_x1, float room_y1, IsaacRoom7230ClampSite* out) {
  if (out == nullptr) return;
  const int32_t path =
      isaac_room_clamp_812f50_path(desc_present, data_present, shape_after);
  out->lroom_needed = (path == ISAAC_ROOM_CLAMP_812F50_PATH_LROOM) ? 1 : 0;
  if (path == ISAAC_ROOM_CLAMP_812F50_PATH_PASSTHROUGH) {
    out->clamped_x = in_x;
    out->clamped_y = in_y;
    return;
  }
  /* SITE B constants: margin 20 (xmm3=[0xbaa87c]), f10=f14=f18=20
     (three 0x41a00000 stores @0x008138d5/dd/e5). */
  const float pad = isaac_room_pe_f32_bits_v41(ISAAC_ROOM_7230_SPAWN_SITE_B_PAD_BITS);
  IsaacRoomClamp812f50LRoom clamp = {};
  isaac_room_clamp_812f50_lroom(in_x, in_y, pad, pad, pad, pad, lroom_desc7,
                                shape_after, room_x0, room_y0, room_x1, room_y1,
                                &clamp);
  out->clamped_x = clamp.x;
  out->clamped_y = clamp.y;
}

extern "C" void isaac_room_7230_spawn_step(
    int32_t counter, int32_t best_index, int32_t cost_at_best,
    int32_t gridcoll_result, int32_t entity_present_captured,
    int32_t entity_type_captured, int32_t arg5_byte, uint32_t seed,
    float radius_in, float in_x, float in_y, int32_t desc_present,
    int32_t data_present, int32_t shape_after, const float* lroom_desc7,
    float cos_value, float sin_value, int32_t width, int32_t height,
    float room_x0, float room_y0, float room_x1, float room_y1,
    int32_t cost_at_index, int32_t entity_count, IsaacRoom7230SpawnStep* out) {
  if (out == nullptr) return;
  const int32_t threshold = isaac_room_7230_finish_threshold(counter);
  const int32_t continue_loop = isaac_room_7230_finish_loop_continue(counter);
  out->continue_loop = continue_loop;
  out->counter_next = static_cast<int32_t>(
      static_cast<uint32_t>(counter) - 1u); /* dec @0x00813570 */
  out->threshold = threshold;
  IsaacRoom7230SpawnPreAccept pre = {};
  isaac_room_7230_spawn_pre_accept(best_index, cost_at_best, gridcoll_result,
                                   entity_present_captured,
                                   entity_type_captured, arg5_byte, threshold,
                                   &pre);
  out->accept = pre.accept;
  out->pre_reason = pre.reason;
  out->probe_phase = ISAAC_ROOM_7230_SITE_A_REJECT_IDENTITY;
  out->identity_accept = 0;
  out->best_index = best_index;
  out->cost_pass = 0;
  out->snapped = 0;
  out->div_ok = 1;
  out->snap_x = 0.0f;
  out->snap_y = 0.0f;
  out->walk_needed = 0;
  if (pre.accept != 0) {
    /* 0x008138a4: exit with the stored counter; site B runs iff the signed
       jg @0x008138bf is not taken (0 and negatives). */
    out->exit_counter = counter;
    out->site_b_taken = counter <= 0 ? 1 : 0;
    out->radius = 0.0f;
    out->seed_out = 0u;
    out->angle = 0.0f;
    out->cand_x = 0.0f;
    out->cand_y = 0.0f;
    out->clamp_lroom_needed = 0;
    out->clamped_x = 0.0f;
    out->clamped_y = 0.0f;
    return;
  }
  /* Candidate + SITE A clamp. */
  IsaacRoom7230SpawnCandidate cand = {};
  isaac_room_7230_spawn_candidate(seed, radius_in, in_x, in_y, cos_value,
                                  sin_value, &cand);
  out->radius = cand.radius;
  out->seed_out = cand.seed_out;
  out->angle = cand.angle;
  out->cand_x = cand.cand_x;
  out->cand_y = cand.cand_y;
  IsaacRoom7230ClampSite clamp = {};
  isaac_room_7230_clamp_site_a(desc_present, data_present, cand.cand_x,
                               cand.cand_y, lroom_desc7, shape_after, room_x0,
                               room_y0, room_x1, room_y1, &clamp);
  out->clamp_lroom_needed = clamp.lroom_needed;
  out->clamped_x = clamp.clamped_x;
  out->clamped_y = clamp.clamped_y;
  /* Identity + probe + cost + snap (site A continuation). */
  IsaacRoom7230SiteAProbe probe = {};
  isaac_room_7230_site_a_probe(clamp.clamped_x, cand.cand_x, clamp.clamped_y,
                               cand.cand_y, width, height, &probe);
  out->identity_accept = probe.identity_accept;
  out->probe_phase = probe.phase;
  if (probe.identity_accept != 0) {
    if (probe.phase == ISAAC_ROOM_7230_SITE_A_RANGE_FAIL) {
      /* 0x0081389f: or esi,-1. */
      out->best_index = -1;
    } else if (probe.phase == ISAAC_ROOM_7230_SITE_A_INDEX_NEGATIVE) {
      /* js quirk: the wrapped sum becomes best as-is. */
      out->best_index = probe.best_index;
    } else {
      out->best_index = probe.best_index; /* kept on BOTH cost outcomes */
      IsaacRoom7230SiteACost cost = {};
      isaac_room_7230_site_a_cost_apply(probe.index, cost_at_index, threshold,
                                        width, entity_count, &cost);
      out->cost_pass = cost.pass;
      out->snapped = cost.snapped;
      out->div_ok = cost.div_ok;
      out->snap_x = cost.snap_x;
      out->snap_y = cost.snap_y;
      out->walk_needed = cost.entity_walk_needed;
    }
  }
  /* Loop test: counter > 0 re-enters; else dec → -1 → site B. */
  if (continue_loop != 0) {
    out->exit_counter = 0; /* not meaningful */
    out->site_b_taken = 0;
  } else {
    out->exit_counter = -1;
    out->site_b_taken = 1;
  }
}

extern "C" void isaac_room_7230_door_proximity_gate(
    float out_x, float out_y, int32_t door_index_captured, int32_t width,
    IsaacRoom7230DoorProximity* out) {
  if (out == nullptr) return;
  /* idiv width; the world pos feeds the diffs CROSSWISE: the PE's xmm0 holds
     quot*40+120 (the model's world_y) and is subtracted from out_y; xmm1
     holds rem*40+40 (world_x) subtracted from out_x. */
  IsaacRoom7230FinishWorld world = {};
  isaac_room_7230_finish_grid_world(door_index_captured, width, &world);
  out->door_x = world.x;
  out->door_y = world.y;
  out->quot = world.quot;
  out->rem = world.rem;
  out->div_ok = world.div_ok;
  const float dx = static_cast<float>(world.y) - static_cast<float>(out_y);
  const float dy = static_cast<float>(world.x) - static_cast<float>(out_x);
  out->dist2 = static_cast<float>(static_cast<float>(dx * dx) +
                                  static_cast<float>(dy * dy));
  /* 0x00813a11 comiss xmm2,dist2; ja — only an ordered STRICT
     limit > dist2 recurses; equality and NaN (unordered) do not. */
  const float limit = isaac_room_pe_f32_bits_v41(ISAAC_ROOM_7230_SPAWN_DOOR_DIST2_BITS);
  out->recurse_needed = out->dist2 < limit ? 1 : 0;
}

extern "C" int32_t isaac_room_7230_door_loop_enter(int32_t arg6_byte) {
  /* 0x00813996 cmp byte [ebp+0x1c],0; je 0x00813b21. */
  return (static_cast<uint32_t>(arg6_byte) & 0xffu) != 0u ? 1 : 0;
}

/* ------------------------------------------------------------------ v50 - */
/* FUN_00813520 door-proximity block (0x00813996..0x00813b1b) + walk list CF
   (0x008137ec..0x00813888) as typed continuations. The recursion body (the
   nested FUN_00813520 call @0x00813a99) stays host; every control law is
   pure. Budget head law reused: isaac_room_7230_finish_recurse_step (v42). */

extern "C" int32_t isaac_room_7230_door_slot_present(uint32_t slot_ptr) {
  /* 0x008139b4 mov eax,[ecx+edi*4+0x724]; 0x008139bb test eax,eax;
     0x008139bd je 0x00813a16 — null slot continues the loop. */
  return slot_ptr != 0u ? 1 : 0;
}

extern "C" int32_t isaac_room_7230_door_loop_next(int32_t index) {
  /* 0x00813a16 inc edi — signed int32 wrap. */
  return static_cast<int32_t>(static_cast<uint32_t>(index) + 1u);
}

extern "C" int32_t isaac_room_7230_door_loop_continue(int32_t next_index) {
  /* 0x00813a17 cmp edi,8; 0x00813a1a jl — SIGNED. next = -1 (post-wrap)
     still continues; an unsigned compare would not. */
  return next_index < ISAAC_ROOM_7230_DOOR_SLOT_COUNT ? 1 : 0;
}

extern "C" int32_t isaac_room_7230_door_recurse_enter(float enter_dist2) {
  /* 0x00813a6d comiss xmm2,dist2; 0x00813a70 jbe exit — the recursion body
     runs only when 4900.0 > dist2 in the ORDERED sense; NaN and equality
     exit (comiss sets CF/ZF for unordered, so jbe is taken). */
  const float limit =
      isaac_room_pe_f32_bits_v41(ISAAC_ROOM_7230_DOOR_DIST2_LIMIT_BITS);
  return enter_dist2 < limit ? 1 : 0;
}

extern "C" int32_t isaac_room_7230_door_recurse_retry(float post_dist2) {
  /* 0x00813b18 comiss xmm1,post_dist2; 0x00813b1b ja 0x00813a76 — the loop
     head re-enters only when 4900.0 > post_dist2 ordered strict; NaN and
     equality fall to the epilogue. */
  const float limit =
      isaac_room_pe_f32_bits_v41(ISAAC_ROOM_7230_DOOR_DIST2_LIMIT_BITS);
  return limit > post_dist2 ? 1 : 0;
}

extern "C" void isaac_room_7230_door_block_plan(
    uint32_t arg6_byte, float out_x, float out_y, int32_t width,
    const IsaacRoom7230DoorSlotSnapshot* slots,
    IsaacRoom7230DoorBlockPlan* out) {
  if (out == nullptr || slots == nullptr) return;
  out->kind = ISAAC_ROOM_7230_DOOR_PLAN_NONE;
  out->slot_index = -1;
  /* 0x00813996 cmp byte [ebp+0x1c],0; je 0x00813b21. */
  if ((arg6_byte & 0xffu) == 0u) return;
  /* Slot scan 0..7 (inc/cmp/jl signed); FIRST present slot decides:
     an idiv fault (width 0 or INT_MIN/-1) is MONOLITHIC; a strict
     dist2 < 4900.0 (door proximity gate law) is RECURSE. */
  for (int32_t i = 0; i < ISAAC_ROOM_7230_DOOR_SLOT_COUNT; ++i) {
    if (slots[i].present == 0u) continue;
    IsaacRoom7230DoorProximity gate = {};
    isaac_room_7230_door_proximity_gate(out_x, out_y, slots[i].door_index,
                                        width, &gate);
    if (gate.div_ok == 0) {
      /* The PE idiv would fault here — never invent a result. */
      out->kind = ISAAC_ROOM_7230_DOOR_PLAN_MONOLITHIC;
      out->slot_index = i;
      return;
    }
    if (gate.recurse_needed != 0) {
      out->kind = ISAAC_ROOM_7230_DOOR_PLAN_RECURSE;
      out->slot_index = i;
      return;
    }
  }
}

extern "C" int32_t isaac_room_7230_walk_list_enter(uint32_t entity_count_1264) {
  /* 0x008137ec test ebx,ebx; 0x008137ee je 0x0081388e — count==0 jumps past
     the whole walk, so the walk body runs only for a nonzero entity count. */
  return entity_count_1264 != 0u ? 1 : 0;
}

extern "C" int32_t isaac_room_7230_walk_list_step(uint32_t remaining) {
  /* 0x00813885 sub ebx,1 — unsigned wrap; the PE counts down to 0. */
  return static_cast<int32_t>(remaining - 1u);
}

extern "C" int32_t isaac_room_7230_walk_list_continue(
    uint32_t next_remaining) {
  /* 0x00813888 jne 0x00813800 — continue iff the decremented count != 0. */
  return next_remaining != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_room_7230_walk_node_next(uint32_t node_addr) {
  /* 0x00813882 add edi,4 — flat entity-pointer array slot stride; u32 wrap
     (0xfffffffc + 4 = 0). The walk span 0x008137ec..0x00813888 has ZERO
     next-pointer loads, so this is array advance, not a linked-list
     follow; no saturation guard exists in the machine. */
  return node_addr + 4u;
}

extern "C" void isaac_room_7230_walk_list_next(
    uint32_t node_addr, uint32_t remaining, IsaacRoom7230WalkListNext* out) {
  if (out == nullptr) return;
  /* 0x00813882 add edi,4; 0x00813885 sub ebx,1; 0x00813888 jne — the PE
     advances slot pointer and count together and re-tests the count. */
  out->node_addr = isaac_room_7230_walk_node_next(node_addr);
  out->remaining = remaining - 1u;
  out->loop_continue = out->remaining != 0u ? 1 : 0;
}

extern "C" void isaac_room_7230_spawn_exit_position(
    int32_t site_b_taken, float cell_x, float cell_y, float site_b_x,
    float site_b_y, float* out2) {
  if (out2 == nullptr) return;
  /* 0x008138b4/b8 store the snapped cell centre to out; when site B runs
     (site_b_taken = v46 site_b_taken, `jg 0x008138bf` NOT taken) the
     0x0081397b/7f store of the site-B snap result OVERWRITES it. */
  out2[0] = site_b_taken != 0 ? site_b_x : cell_x;
  out2[1] = site_b_taken != 0 ? site_b_y : cell_y;
}


static_assert(sizeof(IsaacRoom7230SpawnPreAccept) == 8, "spawn pre-accept ABI changed");
static_assert(sizeof(IsaacRoom7230SpawnCandidate) == 24, "spawn candidate ABI changed");
static_assert(sizeof(IsaacRoom7230ClampSite) == 12, "clamp site ABI changed");
static_assert(sizeof(IsaacRoom7230SpawnStep) == 96, "spawn step ABI changed");
static_assert(offsetof(IsaacRoom7230SpawnStep, site_b_taken) == 92,
              "spawn step site_b_taken offset changed");
static_assert(sizeof(IsaacRoom7230DoorProximity) == 28, "door proximity ABI changed");
static_assert(sizeof(IsaacRoom7230DoorSlotSnapshot) == 8,
              "door slot snapshot ABI changed");
static_assert(sizeof(IsaacRoom7230WalkListNext) == 12,
              "walk list next ABI changed");
static_assert(offsetof(IsaacRoom7230WalkListNext, node_addr) == 0,
              "walk list next node_addr offset changed");
static_assert(offsetof(IsaacRoom7230WalkListNext, remaining) == 4,
              "walk list next remaining offset changed");
static_assert(offsetof(IsaacRoom7230WalkListNext, loop_continue) == 8,
              "walk list next loop_continue offset changed");
static_assert(sizeof(IsaacRoom7230DoorBlockPlan) == 8,
              "door block plan ABI changed");


/* ------------------------------------------------------------------ v47 - */
extern "C" void isaac_room_7230_spawn_position_plan(
    uint32_t* mt_state, int32_t index, uint32_t mode_flag, float room_f14,
    float room_f18, float room_f1c, float room_f20, uint32_t handoff_arg4,
    uint32_t handoff_arg5, IsaacRoom7230SpawnPositionPlan* out) {
  if (out == nullptr) return;
  if (mt_state == nullptr) return;
  /* The pure re-read draw + the v44 posts (same 813460 consumers). */
  IsaacRoom7230SpawnPosMt mt = {};
  isaac_room_7230_spawn_pos_mt(mt_state, index, mode_flag, room_f14, room_f18,
                               room_f1c, room_f20, &mt);
  out->draw_pure = mt.genrand_pure;
  /* Byte mode gate: mirror the PE `test al,al` (wide inputs by AL). */
  out->crt_override = (mode_flag & 0xffu) != 0u ? 1 : 0;
  out->ring_host_needed = 1; /* new/backtrace/free tail stays host */
  out->genrand = mt.genrand;
  out->index_in = mt.index_in;
  out->index_out = mt.index_out;
  out->span_x = mt.span_x;
  out->span_y = mt.span_y;
  out->unit = mt.unit;
  out->center_x = mt.center_x;
  out->center_y = mt.center_y;
  out->max_span = mt.max_span;
  out->radius_arg = mt.radius_arg;
  out->handoff_radius = mt.radius_arg;
  out->handoff_arg4 = handoff_arg4;
  out->handoff_arg5 = handoff_arg5;
  out->handoff_arg6 = ISAAC_ROOM_7230_SPAWN_HANDOFF_ARG6;
  out->host_finish = 1;
  out->iterations = ISAAC_ROOM_7230_SPAWN_SEARCH_ITERS;
  out->first_counter = ISAAC_ROOM_7230_SPAWN_FIRST_COUNTER;
  out->first_threshold = isaac_room_7230_finish_threshold(out->first_counter);
  out->search_seed = static_cast<uint32_t>(ISAAC_ROOM_7230_SPAWN_SEARCH_SEED);
}

extern "C" void isaac_room_7230_spawn_search_vas(IsaacRoom7230SpawnSearchVas* out) {
  if (out == nullptr) return;
  out->grid = 0x007f0800u;
  out->best_cost_site = 0x008135b6u;
  out->best_entity_site = 0x008135d6u;
  out->cos = 0x0041d540u;
  out->sin = 0x0041d520u;
  out->clamp_site_a = 0x0081370bu;
  out->lroom = 0x0081f8b0u;
  out->probe_cost_site = 0x008137abu;
  out->walk_site = 0x008137ecu;
  out->site_b_site = 0x008138f0u;
  out->door_site = 0x00813996u;
  out->recurse_site = 0x00813a99u;
}

extern "C" int32_t isaac_room_7230_spawn_search_next(
    int32_t kind, int32_t best_index, int32_t accept, int32_t identity_accept,
    int32_t probe_phase, int32_t cost_pass, int32_t entity_count,
    int32_t loop_continue, int32_t exit_le0, uint32_t arg6_byte) {
  switch (kind) {
    case ISAAC_ROOM_7230_SPAWN_SEARCH_GRID:
      return best_index < 0 ? ISAAC_ROOM_7230_SPAWN_SEARCH_SIN_COS
                            : ISAAC_ROOM_7230_SPAWN_SEARCH_BEST_COST;
    case ISAAC_ROOM_7230_SPAWN_SEARCH_BEST_COST:
      return ISAAC_ROOM_7230_SPAWN_SEARCH_BEST_ENTITY;
    case ISAAC_ROOM_7230_SPAWN_SEARCH_BEST_ENTITY:
      return accept != 0 ? ISAAC_ROOM_7230_SPAWN_SEARCH_EXIT
                         : ISAAC_ROOM_7230_SPAWN_SEARCH_SIN_COS;
    case ISAAC_ROOM_7230_SPAWN_SEARCH_SIN_COS:
      return ISAAC_ROOM_7230_SPAWN_SEARCH_CLAMP_A;
    case ISAAC_ROOM_7230_SPAWN_SEARCH_CLAMP_A:
      if (identity_accept == 0) return ISAAC_ROOM_7230_SPAWN_SEARCH_LOOP;
      if (probe_phase != ISAAC_ROOM_7230_SITE_A_NEED_COST) {
        return ISAAC_ROOM_7230_SPAWN_SEARCH_LOOP;
      }
      return ISAAC_ROOM_7230_SPAWN_SEARCH_PROBE_COST;
    case ISAAC_ROOM_7230_SPAWN_SEARCH_PROBE_COST:
      return (cost_pass != 0 && entity_count > 0)
                 ? ISAAC_ROOM_7230_SPAWN_SEARCH_WALK
                 : ISAAC_ROOM_7230_SPAWN_SEARCH_LOOP;
    case ISAAC_ROOM_7230_SPAWN_SEARCH_WALK:
      return ISAAC_ROOM_7230_SPAWN_SEARCH_LOOP;
    case ISAAC_ROOM_7230_SPAWN_SEARCH_LOOP:
      return loop_continue != 0 ? ISAAC_ROOM_7230_SPAWN_SEARCH_GRID
                                : ISAAC_ROOM_7230_SPAWN_SEARCH_EXIT;
    case ISAAC_ROOM_7230_SPAWN_SEARCH_EXIT:
      return exit_le0 != 0 ? ISAAC_ROOM_7230_SPAWN_SEARCH_SITE_B
                           : ISAAC_ROOM_7230_SPAWN_SEARCH_DONE;
    case ISAAC_ROOM_7230_SPAWN_SEARCH_SITE_B:
      /* arg6 byte gate @0x00813996 — explicit mask, wide value by AL. */
      return (arg6_byte & 0xffu) != 0u ? ISAAC_ROOM_7230_SPAWN_SEARCH_DOOR
                                       : ISAAC_ROOM_7230_SPAWN_SEARCH_DONE;
    case ISAAC_ROOM_7230_SPAWN_SEARCH_DOOR:
      return ISAAC_ROOM_7230_SPAWN_SEARCH_RECURSE;
    case ISAAC_ROOM_7230_SPAWN_SEARCH_RECURSE:
    case ISAAC_ROOM_7230_SPAWN_SEARCH_DONE:
    default:
      return ISAAC_ROOM_7230_SPAWN_SEARCH_DONE;
  }
}

static_assert(sizeof(IsaacRoom7230SpawnPositionPlan) == 88,
              "spawn position plan ABI changed");
static_assert(sizeof(IsaacRoom7230SpawnSearchVas) == 48,
              "spawn search VA table ABI changed");
static_assert(offsetof(IsaacRoom7230SpawnPositionPlan, first_threshold) == 84,
              "plan first_threshold offset changed");
static_assert(offsetof(IsaacRoom7230SpawnSearchVas, recurse_site) == 44,
              "search VA recurse offset changed");

/* ------------------------------------------------------------------ v48 - */
extern "C" void isaac_room_7230_spawn_search_iteration(
    int32_t counter, int32_t best_index, uint32_t seed, int32_t gridcoll_result,
    int32_t cost_at_best, int32_t entity_present_captured,
    int32_t entity_type_captured, uint32_t arg5_byte,
    IsaacRoom7230SpawnSearchIteration* out) {
  if (out == nullptr) return;
  /* Signed cmov ladder 0x0081357e..0x008135af — cmovge then three cmovl;
     a later match overrides an earlier one. */
  out->threshold = isaac_room_7230_finish_threshold(counter);
  /* 0x008135b2 test esi,esi; js 0x00813618 — SIGNED; only best >= 0 reads
     cost. */
  out->cost_read_needed = best_index >= 0 ? 1 : 0;
  /* 0x008135d6 cmp esi,0x1c0; jge 0x008135e4 — eax forced to 0 for best at
     or above the bound. */
  out->entity_read_needed =
      (best_index >= 0 && best_index < ISAAC_ROOM_7230_SPAWN_BEST_ENTITY_BOUND)
          ? 1
          : 0;
  /* arg5 is a byte gate: the PE tests AL ([ebp+0x18]); narrow explicitly so
     wide draws (0x100/0x1ff/…) behave by the low byte. */
  const int32_t arg5_al = static_cast<int32_t>(arg5_byte & 0xffu);
  IsaacRoom7230SpawnPreAccept pre = {};
  isaac_room_7230_spawn_pre_accept(best_index, cost_at_best, gridcoll_result,
                                   entity_present_captured,
                                   entity_type_captured, arg5_al,
                                   out->threshold, &pre);
  out->accept = pre.accept;
  out->reason = pre.reason;
  /* 0x00813894 test eax,eax; jg 0x00813570 — SIGNED loop re-entry test on
     [ebp-0xc]. */
  out->loop_continue = isaac_room_7230_finish_loop_continue(counter);
  /* Next head dec @0x00813570 (32-bit wrap). */
  out->counter_next = static_cast<int32_t>(
      static_cast<uint32_t>(counter) - 1u);
  /* 0x00813639 test edx,edx; jne 0x00813650 — the xorshift block is on the
     REJECT path only; accept jumps to 0x008138a4 without advancing seed. */
  out->seed_fatal = isaac_room_7230_finish_seed_fatal(seed);
  if (pre.accept != 0) {
    out->seed_out = seed; /* unchanged — [ebp-0x10] untouched on accept */
  } else {
    out->seed_out = out->seed_fatal != 0
                        ? 0u
                        : isaac_room_7230_finish_rng_next(seed);
  }
  /* esi is never written by the GRID step itself; the probe/walk stages of
     the reject continuation produce the next iteration's GetGridCollision
     input (spawn_step reports it as best_index out). */
  out->next_best = best_index;
}

static_assert(sizeof(IsaacRoom7230SpawnSearchIteration) == 40,
              "spawn search iteration ABI changed");
static_assert(offsetof(IsaacRoom7230SpawnSearchIteration, next_best) == 36,
              "spawn search iteration next_best offset changed");

/* ------------------------------------------------------------------ v52 - */
/* FUN_00813520 function-head init 0x00813520..0x00813570 + first GRID skip
   0x00813561..0x008135f0. Assigned "site-B clamp at 0x00813561" is a VA
   misread: that span is GRID + pre-accept (v46/v48), not FUN_00812f50.
   Real site-B clamp is 0x008138f0 (v46 clamp_site_b). The wrapper
   FUN_00813460 call @0x00813506 always enters this head: esi=-1, seed
   0x441c1dfd, counter after dec = 0x7c, first kind GRID, js-skip to
   SIN_COS, no cost/entity reads. Recursion @0x00813a99 stays host. */

extern "C" void isaac_room_7230_spawn_search_head(
    IsaacRoom7230SpawnSearchHead* out) {
  if (out == nullptr) return;
  /* 0x0081354c or esi,0xffffffff — signed best_index init. */
  out->best_index = ISAAC_ROOM_7230_SPAWN_BEST_INDEX_INIT;
  /* 0x0081355e mov [ebp-0x10],0x441c1dfd */
  out->seed = static_cast<uint32_t>(ISAAC_ROOM_7230_SPAWN_SEARCH_SEED);
  /* 0x0081352e mov eax,0x7d; 0x00813570 dec eax -> first_counter 0x7c */
  out->iterations = ISAAC_ROOM_7230_SPAWN_SEARCH_ITERS;
  out->first_counter = ISAAC_ROOM_7230_SPAWN_FIRST_COUNTER;
  out->first_threshold = isaac_room_7230_finish_threshold(out->first_counter);
  /* 0x00813544 movq xmm0,[0xb1f4ec]; 0x0081354f mov ecx,[0xb1f4f4] */
  out->shift_a = ISAAC_ROOM_7230_FINISH_SHIFT_A;
  out->shift_b = ISAAC_ROOM_7230_FINISH_SHIFT_B;
  out->shift_c = ISAAC_ROOM_7230_FINISH_SHIFT_C;
  out->shift_table_va = ISAAC_ROOM_7230_FINISH_SHIFT_TABLE_VA;
  /* 0x00813526/33 load [0xc7b640]/[0xc7b644] into work pos (overwritten
     by the first candidate; capture contract only). */
  out->pos_vec_ptr = ISAAC_ROOM_7230_SPAWN_POS_VEC_PTR;
  out->first_kind = ISAAC_ROOM_7230_SPAWN_SEARCH_GRID;
  /* 0x008135b2 test esi,esi; js 0x00813618 — best < 0 skips BEST_COST. */
  out->after_grid_kind = isaac_room_7230_spawn_search_next(
      ISAAC_ROOM_7230_SPAWN_SEARCH_GRID, out->best_index, 0, 0, 0, 0, 0, 1,
      0, 0u);
  out->cost_read_needed = out->best_index >= 0 ? 1 : 0;
  out->entity_read_needed =
      (out->best_index >= 0 &&
       out->best_index < ISAAC_ROOM_7230_SPAWN_BEST_ENTITY_BOUND)
          ? 1
          : 0;
  /* 0x00813577 call 0x7f0800 always runs with the init best. */
  out->grid_host_needed = 1;
  out->loop_continue = isaac_room_7230_finish_loop_continue(out->first_counter);
}

extern "C" void isaac_room_7230_spawn_search_head_pre(
    int32_t gridcoll_result, int32_t cost_at_best,
    int32_t entity_present_captured, int32_t entity_type_captured,
    uint32_t arg5_byte, IsaacRoom7230SpawnSearchIteration* out) {
  /* 0x00813561..0x008135f0 at function entry: GRID + pre-accept with the
     head's esi=-1. Host captures (gridcoll/cost/entity) cannot accept;
     reason is always PRE_NO_BEST. This is the v48 iteration law, not the
     v47 clamp-site law. */
  isaac_room_7230_spawn_search_iteration(
      ISAAC_ROOM_7230_SPAWN_FIRST_COUNTER,
      ISAAC_ROOM_7230_SPAWN_BEST_INDEX_INIT,
      static_cast<uint32_t>(ISAAC_ROOM_7230_SPAWN_SEARCH_SEED),
      gridcoll_result, cost_at_best, entity_present_captured,
      entity_type_captured, arg5_byte, out);
}

static_assert(sizeof(IsaacRoom7230SpawnSearchHead) == 64,
              "spawn search head ABI changed");
static_assert(offsetof(IsaacRoom7230SpawnSearchHead, after_grid_kind) == 44,
              "spawn search head after_grid_kind offset changed");
static_assert(offsetof(IsaacRoom7230SpawnSearchHead, loop_continue) == 60,
              "spawn search head loop_continue offset changed");

/* ------------------------------------------------------------------ v53 - */
/* FUN_00813520 recursion body (0x00813a27..0x00813b29): the door-proximity
   gate that selected the slot jumps here (ja @0x00813a14) and re-enters the
   WHOLE function at 0x00813a99 (host). Every instruction around the call is
   now a typed law: the slot-index js guard + the entry dist2 gate (both the
   v50 door_recurse_enter law), the budget head (v42 finish_recurse_step),
   the nested-call arg pack (constants), the post-call result copy, and the
   retry gate (v50 door_recurse_retry). Header block documents the span. */

extern "C" void isaac_room_7230_door_recurse_result(
    float result_x, float result_y, float* out2) {
  if (out2 == nullptr) return;
  /* 0x00813ab5 movss xmm0,[eax]; 0x00813ab9 movss [esi],xmm0;
     0x00813abd movss xmm2,[eax+4]; 0x00813ac5 movss [esi+4],xmm2 — the
     nested call's result (eax = returned tmp buffer) is copied into the
     caller's out unconditionally, both floats. */
  out2[0] = result_x;
  out2[1] = result_y;
}

extern "C" void isaac_room_7230_door_recurse_plan(
    int32_t slot_index, int32_t budget, int32_t door_index, int32_t width,
    float out_x, float out_y, float result_x, float result_y,
    IsaacRoom7230DoorRecursePlan* out) {
  if (out == nullptr) return;
  /* 0x00813a27 test edi,edi; 0x00813a29 js 0x00813b21 — SIGNED slot-index
     guard; the scan loop yields 0..7 so this is defensive but typed. */
  const int32_t slot_ok = slot_index >= 0 ? 1 : 0;
  /* 0x00813a41..0x00813a69 door-cell world pos (idiv floor) + crosswise
     dist2 vs out; 0x00813a6d comiss xmm2,dist2; 0x00813a70 jbe exit — the
     v50 door proximity gate law (recurse_needed = 4900 > dist2). */
  IsaacRoom7230DoorProximity enter = {};
  isaac_room_7230_door_proximity_gate(out_x, out_y, door_index, width,
                                      &enter);
  out->div_ok = enter.div_ok;
  out->enter_dist2 = enter.dist2;
  out->enter = (slot_ok != 0 && enter.div_ok != 0 &&
                enter.recurse_needed != 0)
                   ? 1
                   : 0;
  /* 0x00813a76 mov eax,ebx; 0x00813a78 dec ebx; 0x00813a79 test eax,eax;
     0x00813a7b jle exit — v42 finish_recurse_step law: dec always, body
     runs iff PRE-decrement budget > 0; the retry ja returns to THIS head,
     so the next pass re-tests budget_out. */
  IsaacRoom7230FinishRecurseStep step = {};
  isaac_room_7230_finish_recurse_step(budget, &step);
  out->budget_in = step.budget_in;
  out->budget_out = step.budget_out;
  out->budget_enter = step.enter;
  /* 0x00813a81..0x00813a96 nested-call pack: radius 0x42200000 (40.0f),
     args 0,0,0, arg2 = out, arg1 = &tmp; 0x00813a99 call 0x00813520 — the
     whole function, stays host. */
  out->nested_host_needed = 1;
  out->call_va = ISAAC_ROOM_7230_DOOR_RECURSE_CALL_VA;
  out->radius_bits = ISAAC_ROOM_7230_DOOR_RECURSE_RADIUS_BITS;
  out->arg4 = ISAAC_ROOM_7230_DOOR_RECURSE_ARG4;
  out->arg5 = ISAAC_ROOM_7230_DOOR_RECURSE_ARG5;
  out->arg6 = ISAAC_ROOM_7230_DOOR_RECURSE_ARG6;
  /* 0x00813ab5..0x00813ac5 — post-call result copy (two adjacent floats). */
  isaac_room_7230_door_recurse_result(result_x, result_y, &out->copy_x);
  /* 0x00813aca..0x00813b10 retry recompute: same door cell, dist2 vs the
     NEW out (the result); slot ptr / field_24 / width re-reads stay host,
     captured as inputs here. 0x00813b18 comiss xmm1,post_dist2;
     0x00813b1b ja 0x00813a76 — v50 door_recurse_retry law. */
  IsaacRoom7230DoorProximity post = {};
  isaac_room_7230_door_proximity_gate(result_x, result_y, door_index, width,
                                      &post);
  out->post_dist2 = post.dist2;
  out->retry = (post.div_ok != 0 &&
                isaac_room_7230_door_recurse_retry(post.dist2) != 0)
                   ? 1
                   : 0;
  /* The retry jumps to the budget head which re-tests the DECREMENTED
     budget: next pass runs iff retry && budget_out > 0 (strict; the jle
     @0x00813a7b exits on 0). */
  out->loop_continue =
      (out->retry != 0 && out->budget_out > 0) ? 1 : 0;
}

static_assert(sizeof(IsaacRoom7230DoorRecursePlan) == 68,
              "door recurse plan ABI changed");
static_assert(offsetof(IsaacRoom7230DoorRecursePlan, enter_dist2) == 44,
              "door recurse plan enter_dist2 offset changed");
static_assert(offsetof(IsaacRoom7230DoorRecursePlan, loop_continue) == 64,
              "door recurse plan loop_continue offset changed");

/* ------------------------------------------------------------------ v49 - */
/* FUN_00813520 entity-proximity walk (0x008137ec..0x00813888): pure
   per-entity decisions. The loop stays host (live entity list, gate on
   [Room+0x1264]); each entity's type gate and distance verdict are laws
   below. Header block documents the PE branch addresses. */

extern "C" int32_t isaac_room_7230_walk_type_eligible(int32_t entity_type,
                                                      uint32_t arg4_byte,
                                                      int32_t mode_26614) {
  /* 0x00813805/0a/0f: cmp ecx,{5,4,6}; je distance-test — always checked. */
  if (entity_type == 5 || entity_type == 4 || entity_type == 6) return 1;
  /* 0x00813814 cmp byte ptr [ebp+0x14],0; je skip — LOW BYTE of arg4. */
  if ((arg4_byte & 0xffu) == 0u) return 0;
  /* 0x0081381f cmp [Game+0x26614],2; jl — SIGNED; 0x00813828 cmp ecx,1; je. */
  if (mode_26614 >= 2 && entity_type == 1) return 1;
  /* 0x0081382d lea eax,[ecx-0xa]; 0x00813830 cmp eax,0x3dd; jbe — UNSIGNED
     band [10, 0x3e7] inclusive. */
  if (static_cast<uint32_t>(entity_type - 10) <= 0x3ddu) return 1;
  /* 0x00813837 cmp ecx,1; jne skip — the mode-<2 fallthrough: type 1 is
     eligible whenever arg4_byte is nonzero. */
  if (entity_type == 1) return 1;
  return 0;
}

extern "C" void isaac_room_7230_walk_proximity(float cell_x, float cell_y,
                                               float ent_x, float ent_y,
                                               IsaacRoom7230WalkProximity* out) {
  if (out == nullptr) return;
  /* 0x0081383c/44 movss ent.x/ent.y; 0x0081384c/50 subss against the cell
     centre; 0x00813854/58 mulss; 0x0081385c addss — all f32. */
  const float dx = ent_x - cell_x;
  const float dy = ent_y - cell_y;
  const float dist2 = dx * dx + dy * dy;
  out->dx = dx;
  out->dy = dy;
  out->dist2 = dist2;
  /* 0x00813860 call 0x435a50 — the CRT sqrt, same law as finish_sqrt. */
  IsaacRoom7230FinishSqrt s = {};
  isaac_room_7230_finish_sqrt(dist2, &s);
  out->sqrt_host_needed = s.crt_host_needed;
  out->dist = s.crt_host_needed != 0 ? 0.0f : s.value;
  /* 0x00813865 movss xmm1,[0xbaa87c]=20.0f; 0x0081387c comiss xmm1,xmm0;
     0x0081387f cmova esi,eax — strictly-above ORDERED; NaN never rejects. */
  out->reject = (s.crt_host_needed == 0 && 20.0f > s.value) ? 1 : 0;
}

extern "C" int32_t isaac_room_7230_walk_entity_reject(
    int32_t entity_type, uint32_t arg4_byte, int32_t mode_26614, float cell_x,
    float cell_y, float ent_x, float ent_y) {
  if (isaac_room_7230_walk_type_eligible(entity_type, arg4_byte,
                                         mode_26614) == 0) {
    return 0;
  }
  IsaacRoom7230WalkProximity p = {};
  isaac_room_7230_walk_proximity(cell_x, cell_y, ent_x, ent_y, &p);
  return p.reject;
}

extern "C" int32_t isaac_room_7230_walk_reject_latch(int32_t any_reject,
                                                     int32_t entity_reject) {
  /* esi is only ever written by the cmova (best := -1) and never reset
     inside 0x00813882..0x00813888 — the reject latches. */
  return (any_reject != 0 || entity_reject != 0) ? 1 : 0;
}

extern "C" int32_t isaac_room_7230_walk_best_index(int32_t best_index,
                                                   int32_t any_reject) {
  return any_reject != 0 ? -1 : best_index;
}

static_assert(sizeof(IsaacRoom7230WalkProximity) == 24,
              "walk proximity ABI changed");
static_assert(offsetof(IsaacRoom7230WalkProximity, sqrt_host_needed) == 20,
              "walk proximity sqrt_host offset changed");

/* ------------------------------------------------------------------ v54 - */
/* FUN_00428b20 (B15 rain spawn relay; also the prefix B1 shuffle/spawn,
   B2 pedestal, B4 reward and tail B20 trail spawn paths). Pure stdcall
   arg-relayout shim — the ONLY thing the body does is push a leading 0 and
   the seven args R->L, then call the opaque create 0x006fe410:

       0x00428b20 55                push ebp
       0x00428b21 8bec              mov ebp,esp
       0x00428b23 83e4f8            and esp,0xfffffff8
       0x00428b26 6a00              push 0
       0x00428b28 ff7520            push dword [ebp+0x20]   ; a7
       0x00428b2b ff751c            push dword [ebp+0x1c]   ; a6
       0x00428b2e ff7518            push dword [ebp+0x18]   ; a5
       0x00428b31 ff7514            push dword [ebp+0x14]   ; a4
       0x00428b34 ff7510            push dword [ebp+0x10]   ; a3
       0x00428b37 ff750c            push dword [ebp+0xc]    ; a2
       0x00428b3a ff7508            push dword [ebp+8]      ; a1
       0x00428b3d e8ce582d00        call 0x006fe410
       0x00428b42 8be5              mov esp,ebp
       0x00428b44 5d                pop ebp
       0x00428b45 c21c00            ret 0x1c                ; 7 dword args

   The last push (a1) sits at the lowest address, so the callee's ordered
   stack frame is {a1,a2,a3,a4,a5,a6,a7,0}. ecx is never written — the
   caller's thiscall receiver passes through untouched. No branches, no
   state, no memory reads beyond the args: the entire function is the
   relayout law below. The create itself stays host (0x006fe410, opaque). */

extern "C" uint32_t isaac_room_spawn_428b20_frame_at(
    uint32_t index, uint32_t a1, uint32_t a2, uint32_t a3, uint32_t a4,
    uint32_t a5, uint32_t a6, uint32_t a7) {
  /* Index selects the ordered callee frame slot 0..7 (8 = the leading 0).
     Out-of-contract indices (>= 8) read nothing in PE — defined 0 here.
     Args are forwarded verbatim, never masked. */
  switch (index) {
    case 0:
      return a1;
    case 1:
      return a2;
    case 2:
      return a3;
    case 3:
      return a4;
    case 4:
      return a5;
    case 5:
      return a6;
    case 6:
      return a7;
    case 7:
      return static_cast<uint32_t>(ISAAC_ROOM_SPAWN_428B20_LEADING_ZERO);
    default:
      return 0u;
  }
}

extern "C" int32_t isaac_room_spawn_428b20_arity(void) {
  /* 0x00428b45 c2 1c 00 — stdcall ret 0x1c = 7 dword args. */
  return ISAAC_ROOM_SPAWN_428B20_ARITY;
}

extern "C" int32_t isaac_room_spawn_428b20_frame_depth(void) {
  /* 0x00428b26..0x00428b3a: eight pushes before the call. */
  return ISAAC_ROOM_SPAWN_428B20_FRAME_DEPTH;
}

extern "C" int32_t isaac_room_spawn_428b20_relays_ecx(void) {
  /* No ecx write anywhere in 0x00428b20..0x00428b45 — the thiscall receiver
     set by the caller reaches 0x006fe410 unchanged. */
  return 1;
}

extern "C" uint32_t isaac_room_spawn_428b20_host_callee_va(void) {
  /* 0x00428b3d e8 ce 58 2d 00 -> 0x006fe410 (opaque create, stays host). */
  return ISAAC_ROOM_SPAWN_428B20_CALLEE_VA;
}

extern "C" int32_t isaac_room_spawn_428b20_leading_zero(void) {
  /* 0x00428b26 6a00 — the first push, landing at frame slot 7. */
  return ISAAC_ROOM_SPAWN_428B20_LEADING_ZERO;
}

extern "C" void isaac_room_spawn_428b20_relayout(
    uint32_t a1, uint32_t a2, uint32_t a3, uint32_t a4, uint32_t a5,
    uint32_t a6, uint32_t a7, IsaacRoomSpawn428b20* out) {
  if (out == nullptr) return;
  out->frame[0] = a1;
  out->frame[1] = a2;
  out->frame[2] = a3;
  out->frame[3] = a4;
  out->frame[4] = a5;
  out->frame[5] = a6;
  out->frame[6] = a7;
  out->frame[7] =
      static_cast<uint32_t>(ISAAC_ROOM_SPAWN_428B20_LEADING_ZERO);
  out->arity = static_cast<uint32_t>(ISAAC_ROOM_SPAWN_428B20_ARITY);
  out->frame_depth = static_cast<uint32_t>(ISAAC_ROOM_SPAWN_428B20_FRAME_DEPTH);
  out->host_callee_va = ISAAC_ROOM_SPAWN_428B20_CALLEE_VA;
  out->relays_ecx = 1;
  out->va = ISAAC_ROOM_SPAWN_428B20_VA;
  out->ret_va = ISAAC_ROOM_SPAWN_428B20_RET_VA;
  out->call_va = ISAAC_ROOM_SPAWN_428B20_CALL_VA;
}

extern "C" uint32_t isaac_room_pure_helpers_abi_version(void) {
  return ISAAC_ROOM_PURE_HELPERS_ABI_VERSION;
}

/* ------------------------------------------------------------------ v55 - */
/* B15 rain shuffle/spawn loop CF (0x00802c20..0x00802e0d) + spawn-site arg
   provenance (0x00802daf..0x00802dc4). PE listings cpu-dump/00802a80.txt
   (loop-head half 0x00802a80..0x00802c80) + cpu-dump/00802c80.txt (rain
   tail 0x00802c80..0x00802e20). Fisher-Yates over 0x78-byte buffer slots
   (slot i at begin + i*0x78; swap target begin + swap_i*0x78 via
   shl4/sub/lea*8); the seed lives in esi and is carried across iterations
   (0x00802e02 mov esi,[ebp-0x998] = seed_corner); two xorshift steps per
   iteration (shifts from DAT_00b1f4ec {1,9} + 0x1d @0x00802bbe/0x00802bf3 —
   the same law as isaac_room_b1_rng_xorshift):

       0x00802c20 sub eax,ecx             ; remaining = spawn_count - index
       0x00802c28 test esi,esi / jne      ; seed==0 -> fatal assert
       0x00802c3c..64 xorshift(seed_in)   ; -> seed_shuffle (esi)
       0x00802c66 xor edx,edx
       0x00802c6e test ecx,ecx / je       ; remaining==0 -> rem = 0 (div guard)
       0x00802c72 div ecx                 ; UNSIGNED rem = seed_shuffle % remaining
       0x00802c7c lea ecx,[edx+eax]       ; swap_index = index + rem
       0x00802c7f cmp ecx,eax / je        ; rem==0 -> no swap (host copy)
       0x00802c8b..99 swap_offset = swap_index*0x78
       0x00802d02..2f xorshift(seed_shuffle) -> seed_corner (corner RNG)
       0x00802dda..e02 carry seed_corner into esi for the next iteration
       0x00802de0 add [ebp-0x98c],0x78    ; slot_offset accumulator
       0x00802de7 inc ecx                 ; next_index = index + 1
       0x00802dfe cmp ecx,eax / jge exit  ; continue iff next_index < spawn_count

   Spawn-site relay args at 0x00802daf..0x00802dc4 (FUN_00428b20, v54 law):
       a7 = *(slot+0x34)  a6 = *(slot+8)  a5 = 0  a4 = 0xc7b640
       a3 = search_result (0x00813520, host)  a2 = *(slot+4)  a1 = *(slot)
   ecx = Game global 0xc71678 (loaded 0x00802da9) relays through the spawn
   thunk untouched; entity = relay return is bound by FUN_007ef420 with
   this=owner, stack args (entity, slot) at 0x00802dd5 (stays host) and
   marked entity+0x32c = -1 at 0x00802dee. All inputs blob-gated: host
   supplies seed0 / spawn_count / the slot-field values. */

extern "C" int32_t isaac_room_b15_rain_stride(void) {
  /* 0x00802de0 add dword ptr [ebp-0x98c], 0x78 (offset accumulator). */
  return ISAAC_ROOM_B15_RAIN_STRIDE;
}

extern "C" uint32_t isaac_room_b15_rain_pos_vec_ptr(void) {
  /* 0x00802db9 push 0xc7b640 — the pos-vec pointer relay arg a4. */
  return ISAAC_ROOM_B15_RAIN_POS_VEC_PTR;
}

extern "C" uint32_t isaac_room_b15_rain_game_global(void) {
  /* 0x00802da9 mov ecx,[0xc71678] — the thiscall receiver relayed through
     FUN_00428b20 into the opaque create. */
  return ISAAC_ROOM_B15_RAIN_GAME_GLOBAL;
}

extern "C" uint32_t isaac_room_b15_rain_entity_mark_field(void) {
  /* 0x00802dee mov dword ptr [esi+0x32c], 0xffffffff. */
  return ISAAC_ROOM_B15_RAIN_ENTITY_MARK_FIELD;
}

extern "C" uint32_t isaac_room_b15_rain_entity_mark_value(void) {
  return ISAAC_ROOM_B15_RAIN_ENTITY_MARK_VALUE;
}

extern "C" uint32_t isaac_room_b15_rain_host_va_bind(void) {
  /* 0x00802dd5 call 0x007ef420 — rain per-entity bind, stays host. */
  return ISAAC_ROOM_B15_RAIN_HOST_VA_BIND;
}

extern "C" uint32_t isaac_room_b15_rain_host_va_position(void) {
  /* 0x00802da4 call 0x00813520 — spawn-position search, stays host. */
  return ISAAC_ROOM_B15_RAIN_HOST_VA_POSITION;
}

extern "C" uint32_t isaac_room_b15_rain_host_va_spawn_site(void) {
  return ISAAC_ROOM_B15_RAIN_SPAWN_SITE_VA;
}

extern "C" void isaac_room_b15_rain_loop_step(
    uint32_t seed_in, int32_t index, int32_t spawn_count,
    IsaacRoomB15RainLoopStep* out) {
  if (out == nullptr) return;
  /* Zero-fill defaults so fatal early-outs leave stable zeros (mirrors the
     B1 iter-plan convention). */
  out->remaining = spawn_count - index;  /* 0x00802c20 */
  out->seed_in = seed_in;
  out->seed_shuffle = 0u;
  out->shuffle_rem = 0u;
  out->needs_swap = 0;
  out->swap_index = index;
  out->slot_offset = index * ISAAC_ROOM_B15_RAIN_STRIDE;
  out->swap_offset = out->slot_offset;
  out->seed_corner = 0u;
  out->seed_out = 0u;
  out->next_index = index + 1;  /* 0x00802de7 */
  out->continue_loop =
      (out->next_index < spawn_count) ? 1 : 0;  /* 0x00802dfe signed jge */
  out->seed_fatal = ISAAC_ROOM_B15_RAIN_SEED_OK;

  if (isaac_room_b1_seed_nonzero(seed_in) == 0) {
    /* 0x00802c28 test esi,esi; jne — PE fatal assert on zero seed. */
    out->seed_fatal = ISAAC_ROOM_B15_RAIN_SEED_FATAL_PRE_SHUFFLE;
    return;
  }

  const uint32_t seed_shuffle = isaac_room_b1_rng_xorshift(seed_in);
  out->seed_shuffle = seed_shuffle;
  out->shuffle_rem =
      isaac_room_b1_shuffle_remainder(seed_shuffle, out->remaining);
  out->needs_swap = isaac_room_b1_shuffle_needs_swap(out->shuffle_rem);
  out->swap_index =
      isaac_room_b1_shuffle_swap_index(index, out->shuffle_rem);
  out->swap_offset = out->swap_index * ISAAC_ROOM_B15_RAIN_STRIDE;

  if (isaac_room_b1_seed_nonzero(seed_shuffle) == 0) {
    /* 0x00802cee test esi,esi; jne — PE fatal assert on zero shuffled seed. */
    out->seed_fatal = ISAAC_ROOM_B15_RAIN_SEED_FATAL_PRE_CORNER;
    return;
  }

  const uint32_t seed_corner = isaac_room_b1_rng_xorshift(seed_shuffle);
  out->seed_corner = seed_corner;
  out->seed_out = seed_corner;  /* 0x00802e02 carry into esi */
}

extern "C" int32_t isaac_room_b15_rain_loop_walk(
    uint32_t seed0, int32_t spawn_count,
    IsaacRoomB15RainLoopStep* steps, uint32_t capacity) {
  /* 0x00802c04..0x00802c0c: enter only when spawn_count > 0, else direct
     exit @0x00802e0d. Runs exactly spawn_count iterations; each step's
     seed_out feeds the next step's seed_in (esi carry @0x00802e02). A fatal
     zero-seed step stops the walk (PE would have asserted). Returns the
     number of steps written (<= min(spawn_count, capacity)). */
  if (steps == nullptr || capacity == 0u) return 0;
  const uint32_t count =
      spawn_count > 0 ? static_cast<uint32_t>(spawn_count) : 0u;
  const uint32_t n = count < capacity ? count : capacity;
  uint32_t seed = seed0;
  uint32_t written = 0u;
  for (uint32_t i = 0u; i < n; ++i) {
    IsaacRoomB15RainLoopStep* s = &steps[i];
    isaac_room_b15_rain_loop_step(seed, static_cast<int32_t>(i),
                                  spawn_count, s);
    written = i + 1u;
    if (s->seed_fatal != ISAAC_ROOM_B15_RAIN_SEED_OK) break;
    seed = s->seed_out;
  }
  return static_cast<int32_t>(written);
}

extern "C" void isaac_room_b15_rain_spawn_args(
    uint32_t slot_f0, uint32_t slot_f4, uint32_t slot_f8, uint32_t slot_f34,
    uint32_t search_result, IsaacRoomB15RainSpawnArgs* out) {
  if (out == nullptr) return;
  out->relay_va = ISAAC_ROOM_B15_RAIN_SPAWN_SITE_VA;
  out->a1 = slot_f0;           /* 0x00802dc2 push [edi]       */
  out->a2 = slot_f4;           /* 0x00802dbf push [edi+4]     */
  out->a3 = search_result;     /* 0x00802dbe push eax (host)  */
  out->a4 = ISAAC_ROOM_B15_RAIN_POS_VEC_PTR;  /* 0x00802db9   */
  out->a5 = 0u;                /* 0x00802db7 push 0           */
  out->a6 = slot_f8;           /* 0x00802db0 push edi (pre-reload) */
  out->a7 = slot_f34;          /* 0x00802daf push esi         */
  out->relays_ecx = 1;         /* 0x00802da9 mov ecx,[0xc71678] */
  out->bind_va = ISAAC_ROOM_B15_RAIN_HOST_VA_BIND;
  out->bind_entity_first = 1;  /* 0x00802dd0 mov esi,eax; 0x00802dd2 push esi */
  out->bind_slot_second = 1;   /* 0x00802dc9 push edi (slot ptr) */
  out->entity_mark_field = ISAAC_ROOM_B15_RAIN_ENTITY_MARK_FIELD;
  out->entity_mark_value = ISAAC_ROOM_B15_RAIN_ENTITY_MARK_VALUE;
}

/* ---- v56: 0x007ef420 B15 rain bind pure laws ----------------------------- */

extern "C" uint32_t isaac_room_b15_bind_va(void) {
  return ISAAC_ROOM_B15_BIND_VA;
}
extern "C" uint32_t isaac_room_b15_bind_ret_va(void) {
  return ISAAC_ROOM_B15_BIND_RET_VA;
}
extern "C" int32_t isaac_room_b15_bind_pos_unordered(uint32_t field_bits,
                                                     uint32_t vec_bits) {
  /* ucomiss xmm0,[0xc7b640] ; lahf ; test ah,0x44 ; jp 0x7ef49f — PF set
     iff UNORDERED (either operand NaN) -> skip the re-derive. */
  const float f = b19_f32_bits(field_bits);
  const float v = b19_f32_bits(vec_bits);
  return (f != f || v != v) ? 1u : 0u;
}
extern "C" int32_t isaac_room_b15_bind_pos_rederive_needed(uint32_t fx,
                                                           uint32_t vx,
                                                           uint32_t fy,
                                                           uint32_t vy) {
  /* Both jp tests NOT taken -> ordered -> the 0x81e9d0+0x813520 re-derive
     runs (host). */
  const float fx_f = b19_f32_bits(fx);
  const float vx_f = b19_f32_bits(vx);
  const float fy_f = b19_f32_bits(fy);
  const float vy_f = b19_f32_bits(vy);
  if (fx_f != fx_f || vx_f != vx_f) return 0;
  if (fy_f != fy_f || vy_f != vy_f) return 0;
  return 1;
}
extern "C" int32_t isaac_room_b15_bind_clamp_val(int32_t v) {
  /* cmp eax,-2 ; jle -> -2 ; cmp eax,7 ; jl -> val ; else 7. SIGNED. */
  if (v <= ISAAC_ROOM_B15_BIND_CLAMP_MIN) return ISAAC_ROOM_B15_BIND_CLAMP_MIN;
  if (v < ISAAC_ROOM_B15_BIND_CLAMP_MAX) return v;
  return ISAAC_ROOM_B15_BIND_CLAMP_MAX;
}
extern "C" void isaac_room_b15_bind_scale_pair(uint32_t v_bits,
                                               uint32_t* out_x_bits,
                                               uint32_t* out_y_bits) {
  /* movss xmm1,[ebx+0x54]; movaps xmm0,xmm1; mulss xmm1,[0xc37940] ->
     [edi+0xe8](Y); mulss xmm0,[0xc3793c] -> [edi+0xe4](X). Both scale
     constants 1.0f (0x3f800000). Two f32 multiplies, each single-rounding,
     sampled from the same source value (movaps copy, no reload). */
  const uint32_t one_bits = ISAAC_ROOM_B15_BIND_SCALE_X_BITS;
  const float one = b19_f32_bits(one_bits);
  const float f = b19_f32_bits(v_bits);
  const float x = f * one; /* mulss xmm0,[0xc3793c] -> +0xe4 (X) */
  const float y = f * one; /* mulss xmm1,[0xc37940] -> +0xe8 (Y) */
  if (out_x_bits != nullptr) {
    *out_x_bits = __builtin_bit_cast(uint32_t, x);
  }
  if (out_y_bits != nullptr) {
    *out_y_bits = __builtin_bit_cast(uint32_t, y);
  }
}
extern "C" int32_t isaac_room_b15_bind_tail_gate(int32_t game18304,
                                                 uint32_t byte269e9,
                                                 int32_t field2c,
                                                 int32_t field32c) {
  /* 0x7ef63c: [Game+0x18304]==-0xc && byte[Game+0x269e9]!=0 &&
     [edi+0x2c]==0x64 && SIGNED [edi+0x32c]>=0 -> pure writes:
     [edi+0x168]|=0x40000 + [recv+0x7764]=-1. */
  if (game18304 != -0xc) return 0;
  if ((byte269e9 & 0xffu) == 0u) return 0;
  if (field2c != 0x64) return 0;
  if (field32c < 0) return 0;
  return 1;
}

extern "C" uint32_t isaac_room_b15_bind_sub_list_copy(
    uint32_t sub_list_ptr, uint32_t count_in, uint32_t* out_list) {
  /* v57: [ebx+0x64] sub-list copy (PE 0x7ef5d5..0x7ef60f). cmp [ebx+0x64],0
     ; je 0x7ef611 -> ptr==0: count [edi+0x5c0] UNTOUCHED (no reset, no
     copy). Else mov [edi+0x5c0],0; xor ecx,ecx; loop while ecx<0x20
     (stride 4, 8 dwords): mov edx,[ecx+eax]; test edx,edx; je 0x7ef611
     (entry==0 breaks); mov eax,[edi+0x5c0]; cmp eax,8; jae 0x7ef609 (cap:
     count>=8 skips the store, iteration continues); store
     [edi+eax*4+0x5a0]=edx; inc [edi+0x5c0]. */
  if (sub_list_ptr == 0u) return count_in;
    /* ptr==0: count UNTOUCHED */
  const uint32_t* src = reinterpret_cast<const uint32_t*>(sub_list_ptr);
  uint32_t count = 0u;
  for (uint32_t i = 0u; i < ISAAC_ROOM_B15_BIND_SUB_MAX; ++i) {
    const uint32_t e = src[i];
    if (e == 0u) break;
    if (count < ISAAC_ROOM_B15_BIND_SUB_MAX) {
      if (out_list != nullptr) out_list[count] = e;
      count += 1u;
    }
  }
  return count;
}

/* ---- v58: 0x007ef4a2..0x007ef5d5 type-5 bind store-pack relayout ------ */

extern "C" uint32_t isaac_room_b15_bind_store_pack_va(void) {
  return ISAAC_ROOM_B15_BIND_STORE_PACK_VA;
}
extern "C" uint32_t isaac_room_b15_bind_store_type5_head_va(void) {
  return ISAAC_ROOM_B15_BIND_STORE_TYPE5_HEAD_VA;
}
extern "C" uint32_t isaac_room_b15_bind_store_sub_list_va(void) {
  return ISAAC_ROOM_B15_BIND_STORE_SUB_LIST_VA;
}

extern "C" void isaac_room_b15_bind_store_pack(
    const IsaacRoomB15BindSrc* src, uint32_t type_28, uint32_t old_52e,
    uint32_t field_2c, uint32_t field_30, IsaacRoomB15BindStorePack* out) {
  if (out == nullptr) return;

  /* ---- COMMON stores (run for ALL types, BEFORE the type gate) ---- */
  out->dst_3dc = src->f38;                      /* 0x7ef4ad */
  out->dst_3e0_lo = ISAAC_ROOM_B15_BIND_STORE_QWORD_LO;  /* 4   0x7ef4b8 */
  out->dst_3e0_hi = ISAAC_ROOM_B15_BIND_STORE_QWORD_HI;  /* 3   0x7ef4b8 */
  out->dst_3e8 = ISAAC_ROOM_B15_BIND_STORE_DWORD_CONST;  /* 0x11 0x7ef4c0 */
  /* movsx eax, word ptr [ebx+0x20] -> SIGN-EXTENDED 16-bit. */
  out->dst_32c = static_cast<uint32_t>(static_cast<int32_t>(
      static_cast<int16_t>(src->f20 & 0xffffu)));        /* 0x7ef4cd */
  out->dst_404 = src->f58;                      /* 0x7ef4d6 */

  /* ---- TYPE GATE 0x7ef4dc: cmp esi,5 ; jne 0x7ef69a ---- */
  const int32_t type5 = (static_cast<int32_t>(type_28) ==
                         ISAAC_ROOM_B15_BIND_STORE_TYPE5) ? 1 : 0;
  out->type5 = static_cast<uint32_t>(type5);

  /* ---- TYPE-5 block 0x7ef4e5..0x7ef5d5 ---- */
  /* 0x7ef4e5 cmp [ebx+8],0 ; je 0x7ef4f4 — full-dword gate. */
  out->store_524 = (src->f8 != 0u) ? 1u : 0u;
  out->dst_524 = src->f10;                      /* 0x7ef4ee (gated) */
  out->dst_538 = src->f60 & 0xffu;              /* byte 0x7ef501 */
  out->dst_53c = static_cast<uint32_t>(
      isaac_room_b15_bind_clamp_val(static_cast<int32_t>(src->f18)));
  out->dst_52c = src->f22 & 0xffu;              /* byte 0x7ef529 */
  out->dst_588 = src->f24;                      /* 0x7ef532 */
  /* 0x7ef538 test eax,eax; je 0x7ef54b ; 0x7ef53c cmp eax,-1; je — src
     f24 not in {0, 0xffffffff} -> [edi+0x5c0]=0. Full-dword tests. */
  const uint32_t f24 = src->f24;
  out->reset_5c0 = (f24 != 0u && f24 != 0xffffffffu) ? 1u : 0u;
  out->dst_528 = src->f30;                      /* 0x7ef554 */
  out->dst_34 = src->f3c;                       /* 0x7ef55d */
  out->dst_38 = src->f40;                       /* 0x7ef563 */
  out->dst_540 = src->f1c;                      /* 0x7ef569 */
  /* scale pair: movss xmm1,[ebx+0x54]; movaps xmm0,xmm1; mulss xmm1,
     [0xc37940] -> +0xe8 (Y); mulss xmm0,[0xc3793c] -> +0xe4 (X). Both
     consts 1.0f; two f32 multiplies, single-rounding, one source load. */
  {
    const float one = b19_f32_bits(ISAAC_ROOM_B15_BIND_SCALE_X_BITS);
    const float f = b19_f32_bits(src->f54);
    out->dst_e4_bits = __builtin_bit_cast(uint32_t, f * one); /* X */
    out->dst_e8_bits = __builtin_bit_cast(uint32_t, f * one); /* Y */
  }
  out->dst_52e = src->f23 & 0xffu;              /* byte NEW 0x7ef59e */
  out->dst_59c = src->f5c;                      /* 0x7ef5c6 */
  out->dst_530 = src->f50;                      /* 0x7ef5cf */

  /* ---- host call sites (stays host) ---- */
  out->call_a_va = ISAAC_ROOM_B15_BIND_STORE_HOST_A_VA;   /* 0x6e2570 */
  out->call_a_arg = src->f14;
  out->call_b_va = ISAAC_ROOM_B15_BIND_STORE_HOST_B_VA;   /* 0x6e21f0 */
  /* 0x7ef597 cmp [edi+0x2c],0x64 ; jne ; 0x7ef5a6 cmp [edi+0x30],0 ; je ;
     0x7ef5ac cmp cl,al ; je — cl = OLD byte [edi+0x52e] captured at
     0x7ef54e, al = NEW byte stored at 0x7ef59e. */
  const uint32_t old_byte = old_52e & 0xffu;
  const uint32_t new_byte = src->f23 & 0xffu;
  out->call_b_fire = (type5 &&
                      static_cast<int32_t>(field_2c) == 0x64 &&
                      static_cast<int32_t>(field_30) != 0 &&
                      old_byte != new_byte) ? 1u : 0u;
  out->call_b_arg = 0u;                         /* 0x7ef5b0 push 0 */
  out->call_c_va = ISAAC_ROOM_B15_BIND_STORE_HOST_C_VA;   /* 0x6e1a80 */
  out->call_c_arg = src->f0c;
  out->qword_const_va = ISAAC_ROOM_B15_BIND_STORE_QWORD_CONST_VA;
  out->dword_const_va = ISAAC_ROOM_B15_BIND_STORE_DWORD_CONST_VA;
}

/* ---- v59: type-6 dispatch tail (0x7ef69a..0x7ef6c7) + 0x6c-stride
   ANM2 chain (0x7ef611..0x7ef62f) ---------------------------------- */

extern "C" uint32_t isaac_room_b15_bind_chain_va(void) {
  return ISAAC_ROOM_B15_BIND_CHAIN_VA;
}
extern "C" uint32_t isaac_room_b15_bind_chain_epilogue_va(void) {
  return ISAAC_ROOM_B15_BIND_CHAIN_EPILOGUE_VA;
}
extern "C" void isaac_room_b15_bind_chain_step(
    const IsaacRoomB15BindChainSrc* src, IsaacRoomB15BindChainOut* out) {
  if (out == nullptr) return;
  /* 0x7ef611 add ebx,0x6c — u32 wrap. */
  out->stride = ISAAC_ROOM_B15_BIND_CHAIN_STRIDE;
  out->next_base = src->base + ISAAC_ROOM_B15_BIND_CHAIN_STRIDE;
  /* 0x7ef614 cmp dword ptr [ebx],0 ; 0x7ef617 je 0x7ef630 — FULL-dword
     zero test; zero skips BOTH host calls. */
  out->skip = (src->item_dword == 0u) ? 1u : 0u;
  const uint32_t fire = (out->skip == 0u) ? 1u : 0u;
  /* 0x7ef619 push ebx (POST-add call A arg); lea ecx,[edi+0x5c8];
     call 0x4d74a0 (HOST). */
  out->fire_a = fire;
  out->call_a_va = ISAAC_ROOM_B15_BIND_CHAIN_HOST_A_VA;
  out->call_a_this_off = ISAAC_ROOM_B15_BIND_CHAIN_THIS_A_OFF;
  out->call_a_arg = out->next_base;
  /* 0x7ef625 lea ecx,[edi+0x5d0]; call 0x407f10 (HOST = ANM2::Reset). */
  out->fire_b = fire;
  out->call_b_va = ISAAC_ROOM_B15_BIND_CHAIN_HOST_B_VA;
  out->call_b_this_off = ISAAC_ROOM_B15_BIND_CHAIN_THIS_B_OFF;
  out->chain_va = ISAAC_ROOM_B15_BIND_CHAIN_VA;
  out->epilogue_va = ISAAC_ROOM_B15_BIND_CHAIN_EPILOGUE_VA;
}

extern "C" uint32_t isaac_room_b15_bind_type6_va(void) {
  return ISAAC_ROOM_B15_BIND_TYPE6_VA;
}
extern "C" uint32_t isaac_room_b15_bind_type6_ret_va(void) {
  return ISAAC_ROOM_B15_BIND_TYPE6_RET_VA;
}
extern "C" void isaac_room_b15_bind_type6(
    const IsaacRoomB15BindType6Src* src, uint32_t type_28, uint32_t field_2c,
    IsaacRoomB15BindType6Out* out) {
  if (out == nullptr) return;
  /* 0x7ef69a cmp esi,6 ; jne 0x7ef6ca — FULL-dword type gate
     (esi = [edi+0x28] read @0x7ef4ca; type != 6 -> next dispatch). */
  const int32_t type6 = (static_cast<int32_t>(type_28) ==
                         ISAAC_ROOM_B15_BIND_TYPE6) ? 1 : 0;
  out->type6 = static_cast<uint32_t>(type6);
  /* 0x7ef69f cmp [edi+0x2c],0xa ; 0x7ef6a3 mov eax,[ebx+0xc] ;
     0x7ef6a6 mov [edi+0x420],eax — the mov/mov do NOT touch flags, so
     the jne @0x7ef6ac still tests the cmp's ZF: the 0x420 store runs
     for EVERY type-6 body entry; only the 0x424 store is gated. */
  out->dst_420 = src->f0c;
  out->store_424 =
      (type6 != 0u &&
       static_cast<int32_t>(field_2c) ==
                    ISAAC_ROOM_B15_BIND_TYPE6_FIELD_2C_GATE) ? 1u : 0u;
  out->dst_424 = src->f10;   /* 0x7ef6b1 (gated by jne 0x7ef6ac) */
  /* 0x7ef6b7 push [ebx+0x30]; mov ecx,edi; call 0x665500 (HOST D) —
     unconditional within the type-6 body. */
  out->call_d_fire = static_cast<uint32_t>(type6);
  out->call_d_va = ISAAC_ROOM_B15_BIND_TYPE6_HOST_D_VA;
  out->call_d_arg = src->f30;
  out->head_va = ISAAC_ROOM_B15_BIND_TYPE6_VA;
  out->ret_va = ISAAC_ROOM_B15_BIND_TYPE6_RET_VA;
}

/* ---- v60: type-1000 dispatch head (0x7ef6ca..0x7ef817) --------------
   cmp esi,0x3e8 ; jne 0x7ef817 (FULL-dword type gate; esi=[edi+0x28] read
   @0x7ef4ca; type != 1000 -> NEXT dispatch 0x7ef817, still host). Then
   mov eax,[edi+0x2c] (mode) drives every branch. Mode compares are FULL
   dword (cmp eax,imm8 sign-extended / imm32). POS set -> 0x7ef745
   position-model path (2 HOST genrand 0x6eef60, u32->f32 via the
   0xbacb00 sign-add bias, mulss 2^-32 scale @0xba9ff4, lerp stores
   [edi+0x33c]=X / [edi+0x340]=Y). Mode 0x44 -> INDIRECT vtable call
   dword ptr [eax+0xc] (eax=[edi], ecx=edi; HOST, 1 indirect call) then
   ret 8. Mode 0x74 -> 0x7ef733 shared store [edi+0x450]=[ebx+0xc].
   Mode 0x78 -> [edi+0x420]=[ebx+0x18] ; [edi+0x424]=[ebx+0x10] ; FALLS
   INTO 0x7ef733 -> [edi+0x450]=[ebx+0xc] ; ret 8. Default -> jne
   0x7efa3d common epilogue, NO stores. */

extern "C" uint32_t isaac_room_b15_bind_type1000_va(void) {
  return ISAAC_ROOM_B15_BIND_TYPE1000_VA;
}
extern "C" uint32_t isaac_room_b15_bind_type1000_next_va(void) {
  return ISAAC_ROOM_B15_BIND_TYPE1000_NEXT_VA;
}
extern "C" uint32_t isaac_room_b15_bind_type1000_default_va(void) {
  return ISAAC_ROOM_B15_BIND_TYPE1000_DEFAULT_VA;
}
extern "C" void isaac_room_b15_bind_type1000(
    const IsaacRoomB15BindType1000Src* src, uint32_t type_28,
    uint32_t field_2c, IsaacRoomB15BindType1000Out* out) {
  if (out == nullptr) return;
  /* 0x7ef6ca cmp esi,0x3e8 ; 0x7ef6d0 jne 0x7ef817 — FULL-dword type
     gate (esi = [edi+0x28] read @0x7ef4ca; != 1000 -> next dispatch). */
  const int32_t t1000 =
      (static_cast<int32_t>(type_28) == ISAAC_ROOM_B15_BIND_TYPE1000_TYPE) ? 1 : 0;
  out->type1000 = static_cast<uint32_t>(t1000);
  /* 0x7ef6d6 mov eax,[edi+0x2c] — the mode; each compare FULL dword. */
  const int32_t m = static_cast<int32_t>(field_2c);
  const int32_t pos =
      (m == ISAAC_ROOM_B15_BIND_TYPE1000_POS_A ||
       m == ISAAC_ROOM_B15_BIND_TYPE1000_POS_B ||
       m == ISAAC_ROOM_B15_BIND_TYPE1000_POS_C ||
       m == ISAAC_ROOM_B15_BIND_TYPE1000_POS_D ||
       m == ISAAC_ROOM_B15_BIND_TYPE1000_POS_E ||
       m == ISAAC_ROOM_B15_BIND_TYPE1000_POS_F ||
       m == ISAAC_ROOM_B15_BIND_TYPE1000_POS_G) ? 1 : 0;
  const int32_t m44 = (m == ISAAC_ROOM_B15_BIND_TYPE1000_MODE_44) ? 1 : 0;
  const int32_t m74 = (m == ISAAC_ROOM_B15_BIND_TYPE1000_MODE_74) ? 1 : 0;
  const int32_t m78 = (m == ISAAC_ROOM_B15_BIND_TYPE1000_MODE_78) ? 1 : 0;
  const int32_t mdef = (pos || m44 || m74 || m78) ? 0 : 1;
  out->mode_pos = static_cast<uint32_t>(pos);
  out->mode_44 = static_cast<uint32_t>(m44);
  out->mode_74 = static_cast<uint32_t>(m74);
  out->mode_78 = static_cast<uint32_t>(m78);
  out->mode_default = static_cast<uint32_t>(mdef);
  /* 0x7ef721..0x7ef736: mode 0x78 stores 0x420=[ebx+0x18] +
     0x424=[ebx+0x10] then FALLS INTO 0x7ef733; 0x7ef733 stores
     0x450=[ebx+0x0c] for BOTH 0x74 and 0x78 (je 0x7ef733 @0x7ef716). */
  out->store_420 = (m78 != 0) ? 1u : 0u;
  out->dst_420 = src->f18;
  out->store_424 = (m78 != 0) ? 1u : 0u;
  out->dst_424 = src->f10;
  out->store_450 = ((m74 != 0) || (m78 != 0)) ? 1u : 0u;
  out->dst_450 = src->f0c;
  /* 0x7ef6fe cmp eax,0x44 ; jne 0x7ef713 ; mov eax,[edi] (vtable) ;
     mov ecx,edi ; call dword ptr [eax+0xc] — INDIRECT, HOST. */
  out->indirect_fire = (m44 != 0) ? 1u : 0u;
  out->indirect_slot = ISAAC_ROOM_B15_BIND_TYPE1000_VTABLE_SLOT;
  /* 0x7ef745 position-model path — host genrand x2 + pure lerp (the
     lerp itself is the pos export below). */
  out->pos_fire = (pos != 0) ? 1u : 0u;
  out->pos_genrand_va = ISAAC_ROOM_B15_BIND_TYPE1000_GENRAND_VA;
  out->pos_scale_va = ISAAC_ROOM_B15_BIND_TYPE1000_SCALE_VA;
  out->pos_scale_bits = ISAAC_ROOM_B15_BIND_TYPE1000_SCALE_BITS;
  out->pos_sign_tbl_va = ISAAC_ROOM_B15_BIND_TYPE1000_SIGN_TABLE_VA;
  out->pos_game_global = ISAAC_ROOM_B15_BIND_TYPE1000_GAME_GLOBAL;
  out->pos_game_off = ISAAC_ROOM_B15_BIND_TYPE1000_GAME_18300_OFF;
  out->head_va = ISAAC_ROOM_B15_BIND_TYPE1000_VA;
  out->next_va = ISAAC_ROOM_B15_BIND_TYPE1000_NEXT_VA;
  out->default_va = ISAAC_ROOM_B15_BIND_TYPE1000_DEFAULT_VA;
}

extern "C" void isaac_room_b15_bind_type1000_pos(
    const IsaacRoomB15BindType1000PosSrc* src, uint32_t genrand0,
    uint32_t genrand1, IsaacRoomB15BindType1000PosOut* out) {
  if (out == nullptr) return;
  /* 0x7ef745..0x7ef806: a0=[G18300+0x14], a1=[G18300+0x18],
     a2=[G18300+0x1c], a3=[G18300+0x20] (host blob). HOST genrand #1
     (0x7ef77c) -> u32_1; HOST genrand #2 (0x7ef7bd) -> u32_2. MSVC
     u32->f32: cvtdq2pd signed + DAT_00bacb00 bias (0.0 / 2^32 as f64) +
     cvtpd2ps, then mulss DAT_00ba9ff4 (0x2f800000 = 2^-32) -> unit.
     First lerp: y = a1 + unit0*(a3-a1) -> [esp+0x14] -> [edi+0x340].
     Second lerp: x = a0 + unit1*(a2-a0) -> [edi+0x33c]. mulss/addss/
     subss each single-rounding f32. */
  const auto u32_unit = [](uint32_t u) -> float {
    const int32_t as_signed = static_cast<int32_t>(u);
    double d = static_cast<double>(as_signed);
    if ((u >> 31) != 0u) {
      d += 4294967296.0; /* DAT_00bacb00[1] = 2^32 as f64 */
    }
    const float as_f32 = static_cast<float>(d);
    const float unit_scale = __builtin_bit_cast(float, 0x2f800000u);
    return as_f32 * unit_scale;
  };
  const float a0 = __builtin_bit_cast(float, src->v0_bits);
  const float a1 = __builtin_bit_cast(float, src->v1_bits);
  const float a2 = __builtin_bit_cast(float, src->v2_bits);
  const float a3 = __builtin_bit_cast(float, src->v3_bits);
  const float unit0 = u32_unit(genrand0);   /* genrand #1 -> Y */
  const float unit1 = u32_unit(genrand1);   /* genrand #2 -> X */
  /* 0x7ef799..0x7ef7b7: xmm0=a3; subss a3-a1; mulss unit0; addss a1. */
  const float y = a1 + unit0 * (a3 - a1);
  /* 0x7ef7c2..0x7ef7f2: xmm1=a2; subss a2-a0; mulss unit1; addss a0. */
  const float x = a0 + unit1 * (a2 - a0);
  out->dst_33c_bits = __builtin_bit_cast(uint32_t, x);
  out->dst_340_bits = __builtin_bit_cast(uint32_t, y);
  out->genrand_va = ISAAC_ROOM_B15_BIND_TYPE1000_GENRAND_VA;
  out->scale_bits = ISAAC_ROOM_B15_BIND_TYPE1000_SCALE_BITS;
}

/* ---- v61: B15 bind dispatch tail (0x7ef817..0x7efa43) ----------------
   cmp esi,0x21 ; je 0x7efa1a ; cmp esi,0x124 ; je 0x7efa1a (FULL dword;
   esi=[edi+0x28] @0x7ef4ca) -> PATH A: dst 0x380 = f32(u32 src.f0c) via
   the 0xbacb00 sign-add bias (NO 2^-32 scale), then falls into the
   0x7efa3d common epilogue — PURE, no host. cmp esi,4 ; jne 0x7ef924 ->
   PATH B (type==4): 12-store pack 0x7ef835..0x7ef8ac (scale pair = f32
   (f54)*1.0f each axis, mulss 0xc37940->0xe8 Y / 0xc3793c->0xe4 X),
   chain byte [ebx+0x60] SIGNED: (int8)f60<0 -> js 0x7efa3d (NO chain);
   else count=(Game[0x1baac]-Game[0x1baa8])>>2 (u32 wrap + SAR),
   edx=movsx f60, chain_arg = UNSIGNED (uint32)edx < (uint32)count ?
   edx : 0 (jae -> push 0); HOST 0x417870(arg) -> 0x4cf210 (gated
   [this+0x3c8]!=0, this=f3c8+0x3cc) -> [this+0x3c8]=host result ->
   0x4cdcf0 (gated result!=0) -> ret 0x7ef921 / 0x7efa3d. PATH C
   (0x7ef924, other types): HOST 0x6ac530 gate (al!=0); 0x11/0x38b ->
   je 0x7efa3d DEFAULT; else dst 0x380=src.f50 + f18 SIGNED test (js
   skips 0x6d03e0) + HOST 0x6d03e0/0xa10600/0x812d00/0x813520/0x67f070
   (-> result vec ptr) + HOST genrand 0x6eef60 + PURE lerp (0x7ef9b4..):
   unit=f32(u32)*2^-32, x=(unit*vec[0])*20.0f+base_x -> 0x33c, y=
   (unit*vec[1])*20.0f+base_y -> 0x340; 20.0f @0xbaa87c=0x41a00000,
   vec/base are host blobs (f32 bit patterns). */

extern "C" uint32_t isaac_room_b15_bind_tail_dispatch_va(void) {
  return ISAAC_ROOM_B15_BIND_TAIL_VA;
}

extern "C" void isaac_room_b15_bind_tail_dispatch(
    const IsaacRoomB15BindTailSrc* src, uint32_t type_28,
    uint32_t this_f3c8, uint32_t game_1baa8, uint32_t game_1baac,
    IsaacRoomB15BindTailOut* out) {
  if (out == nullptr) return;
  const int32_t t = static_cast<int32_t>(type_28);
  /* 0x7ef817..0x7ef82f — FULL-dword type gates. */
  const int32_t type21 = (t == ISAAC_ROOM_B15_BIND_TAIL_TYPE_21) ? 1 : 0;
  const int32_t type124 = (t == ISAAC_ROOM_B15_BIND_TAIL_TYPE_124) ? 1 : 0;
  const int32_t type4 = (t == ISAAC_ROOM_B15_BIND_TAIL_TYPE_4) ? 1 : 0;
  const int32_t type11 = (t == ISAAC_ROOM_B15_BIND_TAIL_TYPE_11) ? 1 : 0;
  const int32_t type38b = (t == ISAAC_ROOM_B15_BIND_TAIL_TYPE_38B) ? 1 : 0;
  const int32_t path_a = (type21 || type124) ? 1 : 0;
  const int32_t path_b = type4;
  const int32_t path_c = (path_a || path_b) ? 0 : 1;
  out->type21 = static_cast<uint32_t>(type21);
  out->type124 = static_cast<uint32_t>(type124);
  out->type4 = static_cast<uint32_t>(type4);
  out->type11 = static_cast<uint32_t>(type11);
  out->type38b = static_cast<uint32_t>(type38b);
  out->path_a = static_cast<uint32_t>(path_a);
  out->path_b = static_cast<uint32_t>(path_b);
  out->path_c = static_cast<uint32_t>(path_c);
  /* 0x7ef841..0x7ef8ac — type-4 store pack (all gated on type4). */
  out->store_438 = static_cast<uint32_t>(path_b);
  out->dst_438 = src->f10;
  out->store_43c = static_cast<uint32_t>(path_b);
  out->dst_43c = src->f14;
  out->store_440 = static_cast<uint32_t>(path_b);
  out->dst_440 = src->f18;
  out->store_444 = static_cast<uint32_t>(path_b);
  out->dst_444 = src->f1c;
  out->store_463 = static_cast<uint32_t>(path_b);
  out->dst_463 = 1u;                       /* mov byte [edi+0x463],1 */
  out->store_448 = static_cast<uint32_t>(path_b);
  out->dst_448 = src->f23 & 0xffu;         /* byte store, low byte */
  out->store_418 = static_cast<uint32_t>(path_b);
  out->dst_418 = src->f50;
  out->store_44c = static_cast<uint32_t>(path_b);
  out->dst_44c = src->f54;
  /* 0x7ef87b..0x7ef89b — scale pair: f32(f54)*1.0f each axis. */
  uint32_t sx_bits = 0, sy_bits = 0;
  isaac_room_b15_bind_scale_pair(src->f54, &sx_bits, &sy_bits);
  out->store_e4 = static_cast<uint32_t>(path_b);
  out->dst_e4_bits = sx_bits;              /* X (mulss 0xc3793c) */
  out->store_e8 = static_cast<uint32_t>(path_b);
  out->dst_e8_bits = sy_bits;              /* Y (mulss 0xc37940) */
  out->store_34 = static_cast<uint32_t>(path_b);
  out->dst_34 = src->f3c;
  out->store_434 = static_cast<uint32_t>(path_b);
  out->dst_434 = src->f0c;
  /* 0x7ef8b2 mov al,[ebx+0x60]; test al,al; js 0x7efa3d — SIGNED byte.
     edx = movsx (sign-extended byte); count = (hi-lo)>>2 SAR; jae is
     UNSIGNED: chain_arg = 0 when (uint32)edx >= (uint32)count. */
  const int8_t f60_signed = static_cast<int8_t>(src->f60 & 0xffu);
  const int32_t chain_fire = (f60_signed < 0) ? 0 : 1;
  const int32_t edx = static_cast<int32_t>(f60_signed);
  const int32_t diff = static_cast<int32_t>(game_1baac - game_1baa8);
  const int32_t count = diff >> 2;         /* SAR */
  const int32_t chain_arg =
      (static_cast<uint32_t>(edx) < static_cast<uint32_t>(count)) ? edx : 0;
  out->chain_fire = static_cast<uint32_t>(chain_fire);
  out->chain_arg = static_cast<uint32_t>(chain_arg);
  out->chain_count = static_cast<uint32_t>(count);
  out->chain_host_va = ISAAC_ROOM_B15_BIND_TAIL_CHAIN_HOST_VA;
  /* 0x7ef8e3 mov ecx,[edi+0x3c8] PRE-call; test ecx,ecx; je skip. */
  out->subcall_fire = (this_f3c8 != 0u) ? 1u : 0u;
  out->subcall_va = ISAAC_ROOM_B15_BIND_TAIL_SUBCALL_VA;
  out->subcall_this_off = ISAAC_ROOM_B15_BIND_TAIL_SUBCALL_THIS_OFF;
  out->chain_this_off = ISAAC_ROOM_B15_BIND_TAIL_CHAIN_THIS_OFF;
  out->chain_ret_va = ISAAC_ROOM_B15_BIND_TAIL_TYPE4_RET_VA;
  out->final_va = ISAAC_ROOM_B15_BIND_TAIL_FINAL_VA;
  /* 0x7efa1a..0x7efa35 — path A: dst 0x380 = f32(u32 src.f0c).
     cvtdq2pd + 0xbacb00 bias + cvtpd2ps (NO 2^-32 scale). */
  {
    const uint32_t u = src->f0c;
    const int32_t as_signed = static_cast<int32_t>(u);
    double d = static_cast<double>(as_signed);
    if ((u >> 31) != 0u) {
      d += 4294967296.0;
    }
    const float f = static_cast<float>(d);
    out->store_380_v21 = static_cast<uint32_t>(path_a);
    out->dst_380_v21_bits = __builtin_bit_cast(uint32_t, f);
  }
  /* 0x7ef933..0x7ef94b — path C: 0x11/0x38b -> default; else dst
     0x380 = src.f50 (caller ANDs the host 0x6ac530 gate). */
  const int32_t tail_fire = (path_c && !type11 && !type38b) ? 1 : 0;
  out->store_380 = static_cast<uint32_t>(tail_fire);
  out->dst_380 = src->f50;
  /* 0x7ef951 test eax ([ebx+0x18]) SIGNED; js 0x7ef965 -> skip 0x6d03e0. */
  out->call_6d03e0_fire =
      (static_cast<int32_t>(src->f18) >= 0) ? 1u : 0u;
  out->call_6d03e0_va = ISAAC_ROOM_B15_BIND_TAIL_6D03E0_VA;
  out->call_6d03e0_arg = src->f18;
  out->call_6d03e0_arg2 = src->f34;
  out->call_a10600_va = ISAAC_ROOM_B15_BIND_TAIL_A10600_VA;
  out->call_a10600_arg = ISAAC_ROOM_B15_BIND_TAIL_A10600_ARG;
  out->call_a10600_this_off = ISAAC_ROOM_B15_BIND_TAIL_A10600_THIS_OFF;
  out->call_812d00_va = ISAAC_ROOM_B15_BIND_TAIL_812D00_VA;
  out->call_813520_va = ISAAC_ROOM_B15_BIND_TAIL_813520_VA;
  out->call_67f070_va = ISAAC_ROOM_B15_BIND_TAIL_67F070_VA;
  out->gate_va = ISAAC_ROOM_B15_BIND_TAIL_GATE_VA;
  out->lerp_fire = static_cast<uint32_t>(tail_fire);
  out->genrand_va = ISAAC_ROOM_B15_BIND_TAIL_GENRAND_VA;
  out->scale20_va = ISAAC_ROOM_B15_BIND_TAIL_SCALE20_VA;
  out->scale20_bits = ISAAC_ROOM_B15_BIND_TAIL_SCALE20_BITS;
  out->scale2_va = ISAAC_ROOM_B15_BIND_TYPE1000_SCALE_VA;
  out->scale2_bits = ISAAC_ROOM_B15_BIND_TYPE1000_SCALE_BITS;
  out->sign_tbl_va = ISAAC_ROOM_B15_BIND_TYPE1000_SIGN_TABLE_VA;
  out->game_global = ISAAC_ROOM_B15_BIND_TAIL_GAME_GLOBAL;
  out->game_count_lo_off = ISAAC_ROOM_B15_BIND_TAIL_GAME_COUNT_LO_OFF;
  out->game_count_hi_off = ISAAC_ROOM_B15_BIND_TAIL_GAME_COUNT_HI_OFF;
  out->f80_bits = ISAAC_ROOM_B15_BIND_TAIL_F80_BITS;
  out->head_va = ISAAC_ROOM_B15_BIND_TAIL_VA;
  out->default_va = ISAAC_ROOM_B15_BIND_TAIL_DEFAULT_VA;
}

extern "C" void isaac_room_b15_bind_tail_lerp(
    const IsaacRoomB15BindTailLerpSrc* src, uint32_t genrand,
    IsaacRoomB15BindTailLerpOut* out) {
  if (out == nullptr) return;
  /* 0x7ef9b4..0x7efa09: unit = f32(u32 genrand)*2^-32 (sign trick +
     mulss 0xba9ff4). x = (unit*vec[0])*20.0f + base_x -> [edi+0x33c];
     y = (unit*vec[1])*20.0f + base_y -> [edi+0x340]. mulss/addss each
     single-rounding f32. vec[0]/vec[1] = [esi+0]/[esi+4] (host result
     blob), bases = [esp+0x20]/[esp+0x24] (frame locals, blob-gated). */
  const auto u32_unit = [](uint32_t u) -> float {
    const int32_t as_signed = static_cast<int32_t>(u);
    double d = static_cast<double>(as_signed);
    if ((u >> 31) != 0u) {
      d += 4294967296.0;
    }
    const float as_f32 = static_cast<float>(d);
    const float unit_scale = __builtin_bit_cast(float, 0x2f800000u);
    return as_f32 * unit_scale;
  };
  const float unit = u32_unit(genrand);
  const float v0 = __builtin_bit_cast(float, src->vec0_bits);
  const float v1 = __builtin_bit_cast(float, src->vec1_bits);
  const float bx = __builtin_bit_cast(float, src->base_x_bits);
  const float by = __builtin_bit_cast(float, src->base_y_bits);
  const float scale20 = __builtin_bit_cast(float, 0x41a00000u);
  /* mulss unit*v0 ; mulss *20.0f ; addss +base — each rounds f32. */
  const float x = (unit * v0) * scale20 + bx;
  const float y = (unit * v1) * scale20 + by;
  out->dst_33c_bits = __builtin_bit_cast(uint32_t, x);
  out->dst_340_bits = __builtin_bit_cast(uint32_t, y);
  out->genrand_va = ISAAC_ROOM_B15_BIND_TAIL_GENRAND_VA;
  out->scale2_va = ISAAC_ROOM_B15_BIND_TYPE1000_SCALE_VA;
  out->scale2_bits = ISAAC_ROOM_B15_BIND_TYPE1000_SCALE_BITS;
  out->scale20_va = ISAAC_ROOM_B15_BIND_TAIL_SCALE20_VA;
  out->scale20_bits = ISAAC_ROOM_B15_BIND_TAIL_SCALE20_BITS;
  out->sign_tbl_va = ISAAC_ROOM_B15_BIND_TYPE1000_SIGN_TABLE_VA;
  out->host_vec_va = ISAAC_ROOM_B15_BIND_TAIL_67F070_VA;
  out->lerp_va = ISAAC_ROOM_B15_BIND_TAIL_LERP_VA;
}

/* ---- v62: FUN_007efa50 Room::Update-style body (0x7efa50..0x7eff48) ---
   RESTOCK GATE (SIGNED jle) -> STAGE/SLOT gates (FULL-dword -3 /
   FULL-dword 0) -> BOMB BLOCK (UNSIGNED ja (u32)(f11ec-1) > 7 skip,
   byte bit0 gate; pure stores [esi+0x11ec]=0, [this4+0x44]|=1 DWORD,
   word [this4+0x4a]++ 16-bit) + HOST args 0x9e5960 (this Game+0x266e4)
   -> HOST 0x6f8120 greed (FRESH call each) -> HOST 0x9bb840 (fired iff
   greed1==0 || this_f8!=1; this Game+0x1baa8) -> HOST 0x7fb250 (this=
   esi, unconditional in bomb block) -> PURE store [Game+0x18368]=
   [Game+0x18334] (iff greed2!=0 && this_f8==1) -> HOST 0x571170
   (this=this4+0x74, unconditional when stage/slot pass) -> GRID COPY
   (total = SIGNED imul (int32)[esi+0xc]*(int32)[esi+0x10] 32-bit wrap,
   RE-derived per iter; SIGNED jle/jl; src array [esi+0x24] stride 4 ->
   dst [[esi+4]+0x68] byte off stride 0x20; src==0 -> default slot:
   [0..16)=0, [16..20)=0x16a9de81, [20..24)=0, byte[24]=0,
   bytes[25..27]=garbage bits 8..31, [28..32)=0x16a9de81; 32B) -> ENTITY
   WALK (count [esi+0x1264] UNSIGNED jbe skip; list [[esi+0x125c]+i*4];
   path_a = FULL-dword type==0x3c5 && subtype==0; loop UNSIGNED jb +
   next index). The 16 E8s + 8 indirect stay HOST. */

extern "C" uint32_t isaac_room_706c_head_va(void) {
  return ISAAC_ROOM_706C_HEAD_VA;
}
extern "C" uint32_t isaac_room_706c_head_ret_va(void) {
  return ISAAC_ROOM_706C_HEAD_RET_VA;
}

extern "C" void isaac_room_706c_head_gates(
    const IsaacRoom706cHeadSrc* src, IsaacRoom706cHeadOut* out) {
  if (out == nullptr) return;
  /* 0x7efa7f cmp dword [esi+0x706c],0 ; jle 0x7efa97 — SIGNED. */
  const int32_t restock_fire = (src->f706c > 0) ? 1 : 0;
  out->restock_fire = static_cast<uint32_t>(restock_fire);
  out->restock_store_706c = (restock_fire != 0) ? 0xffffffffu : 0u;
  out->restock_host_va = ISAAC_ROOM_706C_RESTOCK_HOST_VA;
  /* 0x7efa9d cmp [edi+0x18304],-3 ; je 0x7eff38 — FULL dword. */
  const int32_t stage_early =
      (src->game_18304 == ISAAC_ROOM_706C_STAGE_EXPECT) ? 1 : 0;
  out->stage_early = static_cast<uint32_t>(stage_early);
  /* 0x7efaaa ecx=[esi+4] ; cmp [ecx+0x40],0 ; je 0x7eff38 — FULL dword. */
  const int32_t slot_early = (src->this4_40 == 0u) ? 1 : 0;
  out->slot_early = static_cast<uint32_t>(slot_early);
  /* --- BOMB BLOCK (only when !stage_early && !slot_early) --- */
  if (stage_early == 0 && slot_early == 0) {
    /* 0x7efab7 eax=[esi+0x11ec]; dec eax; cmp eax,7; ja skip —
       UNSIGNED. byte gate 0x7efac7: test byte [ecx+0x44],1 ; jne skip.
       Law: (u32)(f11ec-1) <= 7 && (this4_44 & 1) == 0. bit0 lives in the
       low byte, so a plain & 1 test matches the byte test exactly. */
    const uint32_t timer_minus_1 = src->f11ec - 1u;
    const uint32_t bomb_fire =
        (timer_minus_1 <= ISAAC_ROOM_706C_BOMB_TIMER_MAX &&
         (src->this4_44 & 1u) == 0u) ? 1u : 0u;
    out->bomb_fire = bomb_fire;
    /* The pure stores + arg reads run only when the bomb block actually
       FIRES (after the unsigned ja gate 0x7efac1 AND the byte bit0 gate
       0x7efacb). */
    if (bomb_fire != 0u) {
      out->store_11ec = 1u;       /* [esi+0x11ec] = 0 */
      /* 0x7efadb or dword ptr [ecx+0x44],1 — 32-bit OR with imm 1. */
      const uint32_t post44 = src->this4_44 | 1u;
      out->store_44 = post44;
      /* 0x7efae2 inc word ptr [eax+0x4a] — 16-bit wrap. */
      out->store_4a = static_cast<uint32_t>(
          static_cast<uint16_t>(src->this4_4a + 1u));
      /* re-reads: 0x7efae9 mov ecx,[edx+0x44] (POST-or dword) ;
         0x7efaec movzx esi,word [edx+0x4a] (post-inc, zero-extend) ;
         0x7efaf0 eax=[edx+0x10]. push R->L: 0x7efaf9 ecx (bit10) first,
         0x7efafa esi (word4a), 0x7efb04 [eax+0x48], 0x7efb07 [esi+8]
         last. */
      out->arg_bit10 = (post44 >> 0xa) & 1u;
      out->arg_word4a = static_cast<uint32_t>(
          static_cast<uint16_t>(src->this4_4a + 1u));
      out->arg_10_48 = src->this4_10_48;
      out->arg_f8 = src->this_f8;
      out->call_9e5960_fire = 1u;
      out->call_9e5960_va = ISAAC_ROOM_706C_9E5960_VA;
      out->call_9e5960_this_off = ISAAC_ROOM_706C_9E5960_THIS_OFF;
      out->greed_va = ISAAC_ROOM_706C_GREED_VA;
      /* 0x7efb1c test al,al ; je 0x7efb26 (fire) ; 0x7efb20 cmp
         [esi+8],1 ; je 0x7efb31 (skip) — INVERTED vs the store: fire iff
         greed1==0 || this_f8!=1. */
      out->fire_9bb840 =
          (src->greed1 == 0u || src->this_f8 != 1u) ? 1u : 0u;
      out->call_9bb840_va = ISAAC_ROOM_706C_9BB840_VA;
      out->call_9bb840_this_off = ISAAC_ROOM_706C_9BB840_THIS_OFF;
      out->fire_7fb250 = 1u;
      out->call_7fb250_va = ISAAC_ROOM_706C_7FB250_VA;
      /* 0x7efb38 FRESH greed call; 0x7efb45 test al,al ; je skip ;
         0x7efb49 cmp [esi+8],1 ; jne skip — store only if
         (greed2!=0 && this_f8==1). */
      out->store_18368_fire =
          (src->greed2 != 0u && src->this_f8 == 1u) ? 1u : 0u;
      out->dst_18368 = src->game_18334;
    } else {
      out->store_11ec = 0u;
      out->store_44 = 0u;
      out->store_4a = 0u;
      out->arg_bit10 = 0u;
      out->arg_word4a = 0u;
      out->arg_10_48 = 0u;
      out->arg_f8 = 0u;
      out->call_9e5960_fire = 0u;
      out->fire_9bb840 = 0u;
      out->fire_7fb250 = 0u;
      out->store_18368_fire = 0u;
      out->dst_18368 = 0u;
    }
  } else {
    out->bomb_fire = 0u;
    out->store_11ec = 0u;
    out->store_44 = 0u;
    out->store_4a = 0u;
    out->arg_bit10 = 0u;
    out->arg_word4a = 0u;
    out->arg_10_48 = 0u;
    out->arg_f8 = 0u;
    out->call_9e5960_fire = 0u;
    out->call_9e5960_va = ISAAC_ROOM_706C_9E5960_VA;
    out->call_9e5960_this_off = ISAAC_ROOM_706C_9E5960_THIS_OFF;
    out->greed_va = ISAAC_ROOM_706C_GREED_VA;
    out->fire_9bb840 = 0u;
    out->call_9bb840_va = ISAAC_ROOM_706C_9BB840_VA;
    out->call_9bb840_this_off = ISAAC_ROOM_706C_9BB840_THIS_OFF;
    out->fire_7fb250 = 0u;
    out->call_7fb250_va = ISAAC_ROOM_706C_7FB250_VA;
    out->store_18368_fire = 0u;
    out->dst_18368 = 0u;
  }
  /* 0x7efb5b ecx=[esi+4]; add ecx,0x74; call 0x571170 — unconditional
     when stage/slot pass (bomb skip lands here too). */
  out->call_571170_fire =
      (stage_early == 0 && slot_early == 0) ? 1u : 0u;
  out->call_571170_va = ISAAC_ROOM_706C_571170_VA;
  out->call_571170_this_off = ISAAC_ROOM_706C_571170_THIS_OFF;
  out->store_18368_src_off = 0x18334u;
  out->store_18368_dst_off = 0x18368u;
  out->game_global = ISAAC_ROOM_706C_GAME_GLOBAL;
  out->game_18304_expect = static_cast<uint32_t>(ISAAC_ROOM_706C_STAGE_EXPECT);
  out->f706c_off = ISAAC_ROOM_706C_F706C_OFF;
  out->f11ec_off = ISAAC_ROOM_706C_F11EC_OFF;
  out->n44_off = ISAAC_ROOM_706C_N44_OFF;
  out->n4a_off = ISAAC_ROOM_706C_N4A_OFF;
  out->bomb_timer_max = ISAAC_ROOM_706C_BOMB_TIMER_MAX;
  out->head_va = ISAAC_ROOM_706C_HEAD_VA;
  out->ret_va = ISAAC_ROOM_706C_HEAD_RET_VA;
}

extern "C" void isaac_room_706c_grid_copy(
    const IsaacRoom706cGridSrc* src, IsaacRoom706cGridOut* out) {
  if (out == nullptr) return;
  /* 0x7efb66..0x7efbfd. total = (int32)[esi+0xc] * (int32)[esi+0x10]
     — SIGNED imul, 32-bit wrap; RE-derived every iteration in the loop
     tail (mov eax,[esi+0xc]; imul eax,[esi+0x10]). Entry test eax,eax;
     jle done (SIGNED). Loop cmp edi,eax ; jl (SIGNED). */
  const auto total_for = [src]() -> int32_t {
    const int32_t a = src->f0c;
    const int32_t b = src->f10;
    return static_cast<int32_t>(static_cast<uint32_t>(a) *
                                static_cast<uint32_t>(b));
  };
  int32_t total = total_for();
  if (total <= 0) {
    out->total = total;
    out->iterations = 0u;
    out->copies = 0u;
    out->defaults = 0u;
  } else {
    const uint8_t* src_array =
        reinterpret_cast<const uint8_t*>(src->src_array_ptr);
    uint8_t* dst_base = reinterpret_cast<uint8_t*>(src->dst_ptr);
    uint32_t iterations = 0u;
    uint32_t copies = 0u;
    uint32_t defaults = 0u;
    uint32_t byte_off = 0u;
    int32_t index = 0;
    while (index < total) {          /* jl, SIGNED */
      const uint32_t src_ptr = *reinterpret_cast<const uint32_t*>(
          src_array + static_cast<uint32_t>(index) * 4u);
      uint8_t* slot_dst = dst_base + byte_off;
      if (src_ptr != 0u) {
        /* 0x7efb86..0x7efb98: copy [src+4..src+0x23] (32 bytes) to
           [dst+byte_off]. */
        const uint8_t* cs = reinterpret_cast<const uint8_t*>(src_ptr + 4u);
        for (uint32_t k = 0u; k < 32u; ++k) slot_dst[k] = cs[k];
        copies += 1u;
      } else {
        /* DEFAULT SLOT 0x7efb9f..0x7efbe6 (32 bytes):
           [0..16)=0 (xmm0 zero from 4 dwords) ; [16..20)=0x16a9de81 ;
           [20..24)=0 ; byte[24]=0 (mov byte [ebp-0x18],0) ;
           bytes[25..27]=garbage bits 8..31 (dword G only byte-0'd) ;
           [28..32)=0x16a9de81. */
        for (uint32_t k = 0u; k < 16u; ++k) slot_dst[k] = 0u;
        uint32_t low = ISAAC_ROOM_706C_GRID_MAGIC;
        for (uint32_t k = 0u; k < 4u; ++k) {
          slot_dst[16u + k] = static_cast<uint8_t>(low & 0xffu);
          low >>= 8;
        }
        for (uint32_t k = 0u; k < 4u; ++k) slot_dst[20u + k] = 0u;
        slot_dst[24u] = 0u;
        const uint32_t g = src->garbage;
        slot_dst[25u] = static_cast<uint8_t>((g >> 8) & 0xffu);
        slot_dst[26u] = static_cast<uint8_t>((g >> 16) & 0xffu);
        slot_dst[27u] = static_cast<uint8_t>((g >> 24) & 0xffu);
        uint32_t hi = ISAAC_ROOM_706C_GRID_MAGIC;
        for (uint32_t k = 0u; k < 4u; ++k) {
          slot_dst[28u + k] = static_cast<uint8_t>(hi & 0xffu);
          hi >>= 8;
        }
        defaults += 1u;
      }
      byte_off += ISAAC_ROOM_706C_GRID_STRIDE;
      index += 1;
      iterations = static_cast<uint32_t>(index);
      total = total_for();         /* re-derived every iteration */
    }
    out->total = total_for();
    out->iterations = iterations;
    out->copies = copies;
    out->defaults = defaults;
  }
  out->stride = ISAAC_ROOM_706C_GRID_STRIDE;
  out->src_off = ISAAC_ROOM_706C_GRID_SRC_OFF;
  out->dst_off = ISAAC_ROOM_706C_GRID_DST_OFF;
  out->magic = ISAAC_ROOM_706C_GRID_MAGIC;
  out->slot_size = ISAAC_ROOM_706C_GRID_SLOT_SIZE;
  out->copy_src_off = 4u;
  out->head_va = ISAAC_ROOM_706C_HEAD_VA;
  out->ret_va = ISAAC_ROOM_706C_HEAD_RET_VA;
  out->grid_head_va = 0x7efb66u;
  out->grid_done_va = 0x7efbfdu;
}

extern "C" void isaac_room_706c_walk_step(
    uint32_t count, uint32_t index, uint32_t type_28, uint32_t subtype_2c,
    IsaacRoom706cWalkStepOut* out) {
  if (out == nullptr) return;
  /* 0x7efbfd xor ecx,ecx ; [ebp-0x10]=ecx ; cmp [esi+0x1264],ecx ;
     jbe 0x7eff38 — UNSIGNED jbe: count 0 skips. count=0xffffffff fires. */
  out->loop_fire = (count != 0u) ? 1u : 0u;
  /* 0x7efcba cmp [edi+0x28],0x3c5 ; jne 0x7efccc ; 0x7efcc3 cmp
     [edi+0x2c],eax (eax==0) ; jne 0x7efccc — FULL dword both. */
  out->path_a =
      (static_cast<int32_t>(type_28) == ISAAC_ROOM_706C_WALK_TYPE_GATE &&
       static_cast<int32_t>(subtype_2c) == ISAAC_ROOM_706C_WALK_SUB_GATE)
          ? 1u : 0u;
  /* 0x7eff1e..0x7eff32: ecx=[ebp-0x10]; inc ecx; [ebp-0x10]=ecx;
     cmp ecx,[esi+0x1264] ; jb 0x7efc10 — UNSIGNED jb, count RE-READ. */
  const uint32_t next = index + 1u;
  out->continue_loop = (next < count) ? 1u : 0u;
  out->next_index = next;
  out->type_gate = static_cast<uint32_t>(ISAAC_ROOM_706C_WALK_TYPE_GATE);
  out->subtype_gate = static_cast<uint32_t>(ISAAC_ROOM_706C_WALK_SUB_GATE);
  out->list_off = ISAAC_ROOM_706C_WALK_LIST_BASE_OFF;
  out->count_off = ISAAC_ROOM_706C_WALK_COUNT_OFF;
  out->stride = ISAAC_ROOM_706C_WALK_STRIDE;
  out->magic16_0 = ISAAC_ROOM_706C_WALK_MAGIC16_0;
  out->magic16_1 = ISAAC_ROOM_706C_WALK_MAGIC16_1;
  out->magic16_2 = ISAAC_ROOM_706C_WALK_MAGIC16_2;
  out->magic16_3 = ISAAC_ROOM_706C_WALK_MAGIC16_3;
  out->pos_vec_va = ISAAC_ROOM_706C_WALK_POS_VEC_VA;
  out->f60_bits = ISAAC_ROOM_706C_WALK_F60_BITS;
  out->f1_bits = ISAAC_ROOM_706C_WALK_F1_BITS;
  out->byte1 = 1u;
  out->host_7eeeb0_va = ISAAC_ROOM_706C_WALK_HOST_7EEEB0_VA;
  out->vec_ctor_va = ISAAC_ROOM_706C_WALK_VEC_CTOR_VA;
  out->vec_grow_va = ISAAC_ROOM_706C_WALK_VEC_GROW_VA;
  out->vec_stride = ISAAC_ROOM_706C_WALK_VEC_STRIDE;
  out->vec_list_off = ISAAC_ROOM_706C_WALK_VEC_LIST_OFF;
  out->vec_end_off = ISAAC_ROOM_706C_WALK_VEC_END_OFF;
  out->vec_head_off = ISAAC_ROOM_706C_WALK_VEC_HEAD_OFF;
  out->vtable_slot = ISAAC_ROOM_706C_WALK_VTABLE_SLOT;
  out->global_a = ISAAC_ROOM_706C_WALK_GLOBAL_A;
  out->global_b = ISAAC_ROOM_706C_WALK_GLOBAL_B;
  out->entity_type_off = ISAAC_ROOM_706C_WALK_TYPE_OFF;
  out->entity_sub_off = ISAAC_ROOM_706C_WALK_SUB_OFF;
  out->entity_f3c0_off = ISAAC_ROOM_706C_WALK_F3C0_OFF;
  out->head_va = ISAAC_ROOM_706C_HEAD_VA;
  out->ret_va = ISAAC_ROOM_706C_HEAD_RET_VA;
}

/* ---------- toolchain defect guard (v62: no narrow scalar params) ----- */
/* The Wasm ABI never narrows i32 args; -O2 deletes an in-body mask a
   uint8_t/uint16_t scalar parameter would make redundant. Every byte-gate
   export takes uint32_t and re-narrows explicitly. Prove the v62 exports
   keep 32-bit scalars only. */
template <typename... Ts>
struct room706c_has_narrow_scalar;
template <>
struct room706c_has_narrow_scalar<> {
  static constexpr bool value = false;
};
template <typename T, typename... Ts>
struct room706c_has_narrow_scalar<T, Ts...> {
  static constexpr bool value =
      (__is_same(T, uint8_t) || __is_same(T, uint16_t)) ||
      room706c_has_narrow_scalar<Ts...>::value;
};
template <typename R, typename... Ps>
struct room706c_has_narrow_scalar<R(Ps...)> {
  static constexpr bool value = room706c_has_narrow_scalar<Ps...>::value;
};

#define ISAAC_ROOM_706C_NO_NARROW_PARAMS(FN)                                  \
  static_assert(!room706c_has_narrow_scalar<decltype(FN)>::value,             \
                #FN " must not take a uint8_t/uint16_t scalar parameter")

ISAAC_ROOM_706C_NO_NARROW_PARAMS(isaac_room_706c_head_va);
ISAAC_ROOM_706C_NO_NARROW_PARAMS(isaac_room_706c_head_ret_va);
ISAAC_ROOM_706C_NO_NARROW_PARAMS(isaac_room_706c_head_gates);
ISAAC_ROOM_706C_NO_NARROW_PARAMS(isaac_room_706c_grid_copy);
ISAAC_ROOM_706C_NO_NARROW_PARAMS(isaac_room_706c_walk_step);

/* ---- v63: FUN_007eff50 Room::RestoreState (0x7eff50..0x7f01b8) ----
   COUNTER GUARD -> LIST1 WALK (stride 0x78, pointer EQUALITY continue;
   path_a FULL-dword 0x3c5/0; PATH_A args from the ADVANCED element +
   0x6fe410/0x7ef420/0x41d540/0x41d520/0x6b7be0 host chain + float
   localA= f32(f50)*deg2rad (0x3c8efa35 @0xbaa088 — verified .rdata,
   NOT 22.5f), quot/rem = (int16)w20 / room_f0c SIGNED idiv, localD =
   f32(rem)*40+40, localE = f32(quot)*40+120; GiveMinecart position=
   &localD velocity=&cosR) -> LIST2 CLEAR (dtor 0x4d6ee0 + end:=begin)
   -> GATES (f4.f0==-10 FULL dword && Game.f0==8 && byte [f4+0x44]&1;
   early ret 0x7f01b8) -> GRID FIX (SIGNED (rows-1)>1/(cols-1)>1 gates,
   signed bounds, index=cols*i+j signed wrap+js, src!=0/type 0xf,
   (u32)target<=0x1bf UNSIGNED ja, dst!=0/type!=1; stores
   [grid+target*4+0x76c]=0x384 + [grid+target*4]=0; INDIRECT vtable[0]
   (dst,1)) -> LOOP8 (8x HOST 0x8167e0, UNSIGNED jb). All 9 E8 + the 1
   indirect stay HOST. */

static inline uint32_t room_restore_bits_to_f32_bits(float v) {
  return __builtin_bit_cast(uint32_t, v);
}
static inline float room_restore_f32_from_bits(uint32_t b) {
  return __builtin_bit_cast(float, b);
}

extern "C" uint32_t isaac_room_restore_va(void) {
  return ISAAC_ROOM_RESTORE_VA;
}
extern "C" uint32_t isaac_room_restore_ret_va(void) {
  return ISAAC_ROOM_RESTORE_RET_VA;
}

extern "C" void isaac_room_restore_counters(
    uint32_t counter_in, IsaacRoomRestoreCountersOut* out) {
  if (out == nullptr) return;
  /* 0x7eff5c mov ecx,[0xc71674] ; inc ecx ; 0x7eff6c [0xc71674]=ecx. */
  out->entry_store = counter_in + 1u;
  /* 0x7f019e dec dword [0xc71674] (normal) ; 0x7f01ab..0x7f01ae dec
     ecx (the entry-inc value, reloaded @0x7f00b4/0x7f00d6) + store.
     Both net-restore the original counter. */
  out->exit_store = counter_in;
  out->exit_early_store = counter_in;
  out->global_va = ISAAC_ROOM_RESTORE_COUNTER_GLOBAL_VA;
  out->head_va = ISAAC_ROOM_RESTORE_VA;
  out->ret_va = ISAAC_ROOM_RESTORE_RET_VA;
  out->ret_early_va = ISAAC_ROOM_RESTORE_RET_EARLY_VA;
}

extern "C" void isaac_room_restore_list1_step(
    const IsaacRoomRestoreList1Src* src, IsaacRoomRestoreList1Out* out) {
  if (out == nullptr) return;
  /* 0x7eff90..0x7effa1: path_a = FULL-dword cur.f0==0x3c5 &&
     FULL-dword cur.f4==0. */
  const uint32_t next_ptr = src->cur_ptr + ISAAC_ROOM_RESTORE_LIST_STRIDE;
  out->next_ptr = next_ptr;
  /* 0x7eff82 lea ecx,[edi+0x28] ; +0x78 per iteration: saved_ptr =
     cur_ptr + 0x28. */
  out->saved_ptr = src->cur_ptr + 0x28u;
  /* 0x7f0096..0x7f00ae: cmp edi,[eax+0x78] ; jne loop — EQUALITY
     pointer gate on the advanced iterator. */
  out->continue_loop = (next_ptr != src->end_ptr) ? 1u : 0u;
  const int32_t path_a =
      (static_cast<int32_t>(src->cur_f0) == ISAAC_ROOM_RESTORE_WALK_TYPE_GATE &&
       static_cast<int32_t>(src->cur_f4) == ISAAC_ROOM_RESTORE_WALK_SUB_GATE)
          ? 1 : 0;
  out->path_a = static_cast<uint32_t>(path_a);
  out->create_host_va = ISAAC_ROOM_RESTORE_CREATE_HOST_VA;
  out->create_this_va = ISAAC_ROOM_RESTORE_GAME_GLOBAL;
  if (path_a != 0) {
    /* 0x7effa7..0x7effd4: 8 pushes R->L: a1=next.f0 a2=next.f4
       a3=next+0x28 a4=0xc7b640 a5=0 a6=cur.f80 a7=cur.fac a8=0. */
    out->create_a1 = src->next_f0;
    out->create_a2 = src->next_f4;
    out->create_a3 = next_ptr + 0x28u;
    out->create_a4 = ISAAC_ROOM_RESTORE_POS_VEC_VA;
    out->create_a5 = 0u;
    out->create_a6 = src->cur_f80;
    out->create_a7 = src->cur_fac;
    out->create_a8 = 0u;
    /* 0x7effdf push edi (next) ; push ebx (result) ; 0x7effe1 call
       0x7ef420 (this=room). */
    out->bind_arg2 = next_ptr;
    /* FLOAT 0x7effe6..0x7f005d: mulss [0xbaa088] = 0x3c8efa35
       (deg2rad, PE-verified — the handoff's "22.5f" label was wrong).
       cvtdq2ps rem/quot; mulss/addss 40.0f/120.0f roundings. */
    const float local_a = room_restore_f32_from_bits(src->cur_f50_bits) *
                          room_restore_f32_from_bits(
                              ISAAC_ROOM_RESTORE_DEG2RAD_BITS);
    out->local_a_bits = room_restore_bits_to_f32_bits(local_a);
    /* 0x7f0013 movsx eax,word [esi+0x20] ; cdq ; 0x7f0020 idiv
       [room+0xc] — SIGNED, divisor = room_f0c. */
    const int32_t w20 = static_cast<int32_t>(static_cast<int16_t>(src->cur_w20));
    const int32_t divisor = src->room_f0c;
    int32_t quot = 0;
    int32_t rem = 0;
    if (divisor != 0) {   /* PE faults on 0; never exercised in-law */
      quot = w20 / divisor;
      rem = w20 % divisor;
    }
    out->quot = quot;
    out->rem = rem;
    /* 0x7f002f cvtdq2ps rem -> mulss 40.0f -> addss 40.0f. */
    const float local_d =
        static_cast<float>(rem) *
            room_restore_f32_from_bits(ISAAC_ROOM_RESTORE_F40_BITS) +
        room_restore_f32_from_bits(ISAAC_ROOM_RESTORE_F40_BITS);
    out->local_d_bits = room_restore_bits_to_f32_bits(local_d);
    /* 0x7f0048 cvtdq2ps quot -> mulss 40.0f -> addss 120.0f
       (position y; [esp+0x24] — NOT dead). */
    const float local_e =
        static_cast<float>(quot) *
            room_restore_f32_from_bits(ISAAC_ROOM_RESTORE_F40_BITS) +
        room_restore_f32_from_bits(ISAAC_ROOM_RESTORE_F120_BITS);
    out->local_e_bits = room_restore_bits_to_f32_bits(local_e);
  } else {
    /* 0x7f006e..0x7f0088: a1=cur.f0 a2=cur.f4 a3=cur+0x28 a4=0xc7b640
       a5=0 a6=cur.f8 a7=cur.f34 a8=0. */
    out->create_a1 = src->cur_f0;
    out->create_a2 = src->cur_f4;
    out->create_a3 = src->cur_ptr + 0x28u;
    out->create_a4 = ISAAC_ROOM_RESTORE_POS_VEC_VA;
    out->create_a5 = 0u;
    out->create_a6 = src->cur_f8;
    out->create_a7 = src->cur_f34;
    out->create_a8 = 0u;
    /* 0x7f008d push edi (cur) ; push eax (result) ; 0x7f0091 call
       0x7ef420. */
    out->bind_arg2 = src->cur_ptr;
    /* PATH_B has no float section; locals stay 0. */
    out->local_a_bits = 0u;
    out->quot = 0;
    out->rem = 0;
    out->local_d_bits = 0u;
    out->local_e_bits = 0u;
  }
  out->bind_host_va = ISAAC_ROOM_RESTORE_BIND_HOST_VA;
  out->bind_arg1_fire = 1u; /* both paths call 0x7ef420 with create result */
  out->minecart_va = ISAAC_ROOM_RESTORE_MINECART_HOST_VA;
  out->minecart_this_passthru = 1u; /* this = create result (ebx) */
  out->pos_ptr_off = ISAAC_ROOM_RESTORE_POS_BASE_OFF;
  out->vel_ptr_off = ISAAC_ROOM_RESTORE_VEL_BASE_OFF;
  out->cos_va = ISAAC_ROOM_RESTORE_COS_HOST_VA;
  out->sin_va = ISAAC_ROOM_RESTORE_SIN_HOST_VA;
  out->cos_r_bits = src->cos_r_bits;  /* host results passthrough input */
  out->sin_r_bits = src->sin_r_bits;
  out->stride = ISAAC_ROOM_RESTORE_LIST_STRIDE;
  out->type_gate = static_cast<uint32_t>(ISAAC_ROOM_RESTORE_WALK_TYPE_GATE);
  out->sub_gate = static_cast<uint32_t>(ISAAC_ROOM_RESTORE_WALK_SUB_GATE);
  out->deg2rad_bits = ISAAC_ROOM_RESTORE_DEG2RAD_BITS;
  out->f40_bits = ISAAC_ROOM_RESTORE_F40_BITS;
  out->f120_bits = ISAAC_ROOM_RESTORE_F120_BITS;
  out->head_va = ISAAC_ROOM_RESTORE_VA;
  out->ret_va = ISAAC_ROOM_RESTORE_RET_VA;
}

extern "C" void isaac_room_restore_list2_clear(
    uint32_t begin_ptr, uint32_t end_ptr, IsaacRoomRestoreList2ClearOut* out) {
  if (out == nullptr) return;
  /* 0x7f00c0 cmp esi,edi ; je 0x7f00df ; loop 0x4d6ee0 dtor stride
     0x78 ; then eax=[esp+0x14] (f4 RE-read), esi=[eax+0x74] (begin
     RE-read); 0x7f00df [f4+0x78]=esi (end:=begin). */
  const uint32_t count =
      (begin_ptr != end_ptr) ? ((end_ptr - begin_ptr) / ISAAC_ROOM_RESTORE_LIST_STRIDE) : 0u;
  out->dtor_count = count;
  out->store_end = begin_ptr;
  out->dtor_host_va = ISAAC_ROOM_RESTORE_DTOR_HOST_VA;
  out->stride = ISAAC_ROOM_RESTORE_LIST_STRIDE;
  out->head_va = ISAAC_ROOM_RESTORE_VA;
}

extern "C" void isaac_room_restore_gates(
    int32_t f4_f0, int32_t game_f0, uint32_t f4_44_byte,
    IsaacRoomRestoreGatesOut* out) {
  if (out == nullptr) return;
  /* 0x7f00e5 cmp [edx],-0xa ; jne EARLY ; 0x7f00f3 cmp [eax],8 ; jne
     EARLY ; 0x7f00fc test byte [edx+0x44],1 ; je EARLY. */
  const uint32_t fire =
      (f4_f0 == ISAAC_ROOM_RESTORE_F4_0_EXPECT &&
       game_f0 == ISAAC_ROOM_RESTORE_GAME_0_EXPECT &&
       (f4_44_byte & ISAAC_ROOM_RESTORE_F4_44_BIT) != 0u)
          ? 1u : 0u;
  out->fire = fire;
  out->f4_0_expect = static_cast<uint32_t>(ISAAC_ROOM_RESTORE_F4_0_EXPECT);
  out->game_0_expect = static_cast<uint32_t>(ISAAC_ROOM_RESTORE_GAME_0_EXPECT);
  out->f4_44_off = ISAAC_ROOM_RESTORE_F4_44_OFF;
  out->byte_bit = ISAAC_ROOM_RESTORE_F4_44_BIT;
  out->early_ret_va = ISAAC_ROOM_RESTORE_RET_EARLY_VA;
  out->head_va = ISAAC_ROOM_RESTORE_VA;
  out->ret_va = ISAAC_ROOM_RESTORE_RET_VA;
  out->grid_head_va = ISAAC_ROOM_RESTORE_GRID_HEAD_VA;
  out->grid_done_va = ISAAC_ROOM_RESTORE_GRID_DONE_VA;
}

extern "C" void isaac_room_restore_grid_step(
    const IsaacRoomRestoreGridSrc* src, IsaacRoomRestoreGridOut* out) {
  if (out == nullptr) return;
  /* 0x7f0109..0x7f0120: rows/cols -> eax-1 (dec, u32 wrap) ; cmp
     eax,1 ; jle skip — SIGNED entry gates on the wrapped value: fire
     iff (s32)(u32(rows)-1) > 1 / (s32)(u32(cols)-1) > 1. */
  const int32_t rows_m1 =
      static_cast<int32_t>(static_cast<uint32_t>(src->rows) - 1u);
  const int32_t cols_m1 =
      static_cast<int32_t>(static_cast<uint32_t>(src->cols) - 1u);
  out->outer_fire = (rows_m1 > 1) ? 1u : 0u;
  out->inner_fire = (cols_m1 > 1) ? 1u : 0u;
  /* 0x7f0122..0x7f0138 guards: test j,js ; cmp j,cols ; jge ; test i,js
     ; cmp i,rows ; jge ; imul ecx,edi (cols*i SIGNED wrap) ; add ;
     js on the wrapped sum. */
  const int32_t i_ok = (src->i >= 0 && src->i < src->rows) ? 1 : 0;
  const int32_t j_ok = (src->j >= 0 && src->j < src->cols) ? 1 : 0;
  const int32_t index = static_cast<int32_t>(
      static_cast<uint32_t>(src->cols) * static_cast<uint32_t>(src->i) +
      static_cast<uint32_t>(src->j));
  out->i_ok = static_cast<uint32_t>(i_ok);
  out->j_ok = static_cast<uint32_t>(j_ok);
  out->index = index;
  out->index_ok = (index >= 0) ? 1u : 0u;
  /* 0x7f013a..0x7f0158: src = grid[index]; test ; je ; cmp [eax+4],0xf
     ; jne ; target=[eax+0x24]. */
  out->src_ok = (src->src_ptr != 0u) ? 1u : 0u;
  out->src_type_ok = (src->src_f4 == ISAAC_ROOM_RESTORE_GRID_TYPE_EXPECT)
                         ? 1u : 0u;
  out->target = src->src_f24;
  /* 0x7f014b cmp eax,0x1bf ; ja skip — UNSIGNED (u32 target <= 0x1bf). */
  out->target_ok = (src->src_f24 <= ISAAC_ROOM_RESTORE_GRID_TARGET_MAX)
                       ? 1u : 0u;
  /* 0x7f0152..0x7f015e: dst = grid[target]; test ; je ; cmp [ecx+4],1
     ; je skip — fire iff dst_f4 != 1. */
  out->dst_ok = (src->dst_ptr != 0u) ? 1u : 0u;
  out->dst_type_ok = (src->dst_f4 != 1u) ? 1u : 0u;
  const uint32_t fire =
      (out->outer_fire != 0u && out->inner_fire != 0u && i_ok != 0 &&
       j_ok != 0 && out->index_ok != 0u && out->src_ok != 0u &&
       out->src_type_ok != 0u && out->target_ok != 0u && out->dst_ok != 0u &&
       out->dst_type_ok != 0u)
          ? 1u : 0u;
  out->fire = fire;
  /* 0x7f0160 [ebx+eax*4+0x76c]=0x384 ; 0x7f016b [ebx+eax*4+0x24]=0 ;
     0x7f0173 eax=[ecx] ; push 1 ; call [eax] — INDIRECT vtable[0]. */
  out->store_76c_value = (fire != 0u) ? ISAAC_ROOM_RESTORE_GRID_F76C_VALUE : 0u;
  out->indirect_fire = fire;
  out->indirect_arg = (fire != 0u) ? 1u : 0u;
  out->vtable_slot = ISAAC_ROOM_RESTORE_GRID_VTABLE_SLOT;
  /* 0x7f017c..0x7f018b tails: inc ; cmp x,(bound-1) ; jl — SIGNED
     on the wrapped increments, bounds RE-read (cols/rows inputs). */
  out->continue_j =
      (static_cast<int32_t>(static_cast<uint32_t>(src->j) + 1u) < cols_m1)
          ? 1u : 0u;
  out->continue_i =
      (static_cast<int32_t>(static_cast<uint32_t>(src->i) + 1u) < rows_m1)
          ? 1u : 0u;
  out->grid_base_off = ISAAC_ROOM_RESTORE_GRID_BASE_OFF;
  out->cell_stride = ISAAC_ROOM_RESTORE_GRID_CELL_STRIDE;
  out->type_gate = ISAAC_ROOM_RESTORE_GRID_TYPE_EXPECT;
  out->target_max = ISAAC_ROOM_RESTORE_GRID_TARGET_MAX;
  out->f76c_off = ISAAC_ROOM_RESTORE_GRID_F76C_OFF;
  out->head_va = ISAAC_ROOM_RESTORE_VA;
  out->ret_va = ISAAC_ROOM_RESTORE_RET_VA;
}

extern "C" void isaac_room_restore_loop8_step(
    uint32_t k, IsaacRoomRestoreLoop8Out* out) {
  if (out == nullptr) return;
  /* 0x7f0190..0x7f019c: push k ; call 0x8167e0 ; inc esi ; cmp esi,8 ;
     jb loop — UNSIGNED jb: continue iff (u32)(k+1) < 8. */
  const uint32_t next = k + 1u;
  out->continue_loop = (next < ISAAC_ROOM_RESTORE_LOOP8_COUNT) ? 1u : 0u;
  out->host_va = ISAAC_ROOM_RESTORE_LOOP8_HOST_VA;
  out->arg = k;
  out->count = ISAAC_ROOM_RESTORE_LOOP8_COUNT;
}

/* ---------- toolchain defect guard (v63: no narrow scalar params) ----- */
template <typename... Ts>
struct room_restore_has_narrow_scalar;
template <>
struct room_restore_has_narrow_scalar<> {
  static constexpr bool value = false;
};
template <typename T, typename... Ts>
struct room_restore_has_narrow_scalar<T, Ts...> {
  static constexpr bool value =
      (__is_same(T, uint8_t) || __is_same(T, uint16_t)) ||
      room_restore_has_narrow_scalar<Ts...>::value;
};
template <typename R, typename... Ps>
struct room_restore_has_narrow_scalar<R(Ps...)> {
  static constexpr bool value = room_restore_has_narrow_scalar<Ps...>::value;
};

#define ISAAC_ROOM_RESTORE_NO_NARROW_PARAMS(FN)                               \
  static_assert(!room_restore_has_narrow_scalar<decltype(FN)>::value,         \
                #FN " must not take a uint8_t/uint16_t scalar parameter")

ISAAC_ROOM_RESTORE_NO_NARROW_PARAMS(isaac_room_restore_va);
ISAAC_ROOM_RESTORE_NO_NARROW_PARAMS(isaac_room_restore_ret_va);
ISAAC_ROOM_RESTORE_NO_NARROW_PARAMS(isaac_room_restore_counters);
ISAAC_ROOM_RESTORE_NO_NARROW_PARAMS(isaac_room_restore_list1_step);
ISAAC_ROOM_RESTORE_NO_NARROW_PARAMS(isaac_room_restore_list2_clear);
ISAAC_ROOM_RESTORE_NO_NARROW_PARAMS(isaac_room_restore_gates);
ISAAC_ROOM_RESTORE_NO_NARROW_PARAMS(isaac_room_restore_grid_step);
ISAAC_ROOM_RESTORE_NO_NARROW_PARAMS(isaac_room_restore_loop8_step);

/* ---- v64: FUN_007f01c0 ambient body PURE ISLANDS (0x7f01c0..0x7f072e)
   SEH-framed thiscall; landed laws: slot position math (SIGNED idiv
   [slot+0x24]/room_f0c, quot*40+120+laneA, rem*40+40+laneB, lane=edi&3
   — lane tables UNPACKED by the PE displacement indexing, see header),
   main distance (CROSSED slot_x-p340 / slot_y-p33c, dist2, CRT sqrt
   0x435a50 primitive), special step (s13c0==0x23, len2>4.0f, dir law
   comiss/cmov/setbe), adj distance (crossed vs p340+2b / p33c+2a),
   tail decision (flag byte 0x3a0&0x10, 25.0f range gate, type{1..5},
   byte f4+0x44&1, 60.0f bind gate, ecx provenance = dir when
   special&&gt else player_f1624, bind 0x710480), bounds chain
   (this.f8==0x10, 120/110/100/140 + f1c/f20+20 gates, dest VAs). */

static inline uint32_t room_ambient_7f01c0_bits_to_f32_bits(float v) {
  return __builtin_bit_cast(uint32_t, v);
}
static inline float room_ambient_7f01c0_f32_from_bits(uint32_t b) {
  return __builtin_bit_cast(float, b);
}
/* FUN_00435a50: cvtss2sd ; xorps x1 ; ucomisd 0,x ; ja error(0xaf090b) ;
   sqrtsd ; cvtsd2ss. CRT platform primitive (same law as 7230
   finish_sqrt): only an ORDERED x<0 takes the CRT error path; NaN and
   -0.0 stay inline. dist2 (sum of f32 squares) is never <0. */
static inline uint32_t room_ambient_7f01c0_sqrt_bits(float x) {
  if (x < 0.0f) {
    return 0u; /* CRT error path owns the result; unreachable in-law */
  }
  const float v =
      static_cast<float>(__builtin_sqrt(static_cast<double>(x)));
  return room_ambient_7f01c0_bits_to_f32_bits(v);
}

extern "C" uint32_t isaac_room_ambient_7f01c0_va(void) {
  return ISAAC_ROOM_AMBIENT_7F01C0_VA;
}
extern "C" uint32_t isaac_room_ambient_7f01c0_ret_va(void) {
  return ISAAC_ROOM_AMBIENT_7F01C0_RET_VA;
}
extern "C" float isaac_room_ambient_7f01c0_lane_off_quot(uint32_t lane) {
  return room_ambient_7f01c0_f32_from_bits(
      ISAAC_ROOM_AMBIENT_7F01C0_LANE_OFF_QUOT[lane & 3u]);
}
extern "C" float isaac_room_ambient_7f01c0_lane_off_rem(uint32_t lane) {
  return room_ambient_7f01c0_f32_from_bits(
      ISAAC_ROOM_AMBIENT_7F01C0_LANE_OFF_REM[lane & 3u]);
}

extern "C" void isaac_room_ambient_7f01c0_pos_step(
    const IsaacRoomAmbientPos7f01c0Src* src,
    IsaacRoomAmbientPos7f01c0Out* out) {
  if (out == nullptr) return;
  /* 0x7f02cb mov eax,[esi+0x24] ; cdq ; 0x7f02d2 idiv ecx — SIGNED
     toward zero; divisor = [Game+0x18300]->room+0xc. PE faults on
     divisor 0 and INT_MIN/-1 (never exercised in-law). */
  const int32_t dividend = src->slot_f24;
  const int32_t divisor = src->room_f0c;
  int32_t quot = 0;
  int32_t rem = 0;
  const uint32_t div_ok =
      (divisor != 0 && !(dividend == INT32_MIN && divisor == -1)) ? 1u : 0u;
  if (div_ok != 0u) {
    quot = dividend / divisor;
    rem = dividend % divisor;
  }
  out->quot = quot;
  out->rem = rem;
  out->div_ok = div_ok;
  /* 0x7f0297 mov eax,edi ; 0x7f029b and eax,3 — lane = edi & 3. */
  const uint32_t lane = src->lane & 3u;
  out->lane = lane;
  /* 0x7f02e5 mulss 40.0f ; 0x7f02ed addss 120.0f ; 0x7f02f9 addss
     [ebp+eax*8-0x30] (laneA). Each step rounds to f32. */
  const float f40 =
      room_ambient_7f01c0_f32_from_bits(ISAAC_ROOM_AMBIENT_7F01C0_F40_BITS);
  const float f120 =
      room_ambient_7f01c0_f32_from_bits(ISAAC_ROOM_AMBIENT_7F01C0_F120_BITS);
  const float lane_a = isaac_room_ambient_7f01c0_lane_off_quot(lane);
  const float lane_b = isaac_room_ambient_7f01c0_lane_off_rem(lane);
  float x0 = static_cast<float>(quot) * f40;
  x0 = x0 + f120;
  x0 = x0 + lane_a;
  out->slot_x_bits = room_ambient_7f01c0_bits_to_f32_bits(x0);
  float y0 = static_cast<float>(rem) * f40;
  y0 = y0 + f40;
  y0 = y0 + lane_b;
  out->slot_y_bits = room_ambient_7f01c0_bits_to_f32_bits(y0);
  out->f40_bits = ISAAC_ROOM_AMBIENT_7F01C0_F40_BITS;
  out->f120_bits = ISAAC_ROOM_AMBIENT_7F01C0_F120_BITS;
  out->lane_quot_va = ISAAC_ROOM_AMBIENT_7F01C0_LANE_QUOT_VA;
  out->lane_rem_va = ISAAC_ROOM_AMBIENT_7F01C0_LANE_REM_VA;
}

extern "C" void isaac_room_ambient_7f01c0_dist(
    const IsaacRoomAmbientDist7f01c0Src* src,
    IsaacRoomAmbientDist7f01c0Out* out) {
  if (out == nullptr) return;
  /* 0x7f030a subss xmm0,xmm3 (slot_x - p340) ; 0x7f0313 subss
     xmm1,xmm2 (slot_y - p33c) — CROSSED axes. */
  const float sx = room_ambient_7f01c0_f32_from_bits(src->slot_x_bits);
  const float sy = room_ambient_7f01c0_f32_from_bits(src->slot_y_bits);
  const float p0 = room_ambient_7f01c0_f32_from_bits(src->p33c_bits);
  const float p1 = room_ambient_7f01c0_f32_from_bits(src->p340_bits);
  float d0 = sx - p1;
  float d1 = sy - p0;
  out->d0_bits = room_ambient_7f01c0_bits_to_f32_bits(d0);
  out->d1_bits = room_ambient_7f01c0_bits_to_f32_bits(d1);
  /* 0x7f0317/0x7f031b mulss xmm0,xmm0 / xmm1,xmm1 ; 0x7f031f addss. */
  float dist2 = d0 * d0;
  dist2 = dist2 + d1 * d1;
  out->dist2_bits = room_ambient_7f01c0_bits_to_f32_bits(dist2);
  /* 0x7f0323 call 0x435a50 — CRT sqrt primitive (in-law). */
  out->dist_bits = room_ambient_7f01c0_sqrt_bits(dist2);
  out->sqrt_va = ISAAC_ROOM_AMBIENT_7F01C0_SQRT_VA;
  out->sqrt_primitive = 1u;
}

extern "C" void isaac_room_ambient_7f01c0_special_step(
    const IsaacRoomAmbientSpecial7f01c0Src* src,
    IsaacRoomAmbientSpecial7f01c0Out* out) {
  if (out == nullptr) return;
  /* 0x7f032e cmp [edx+0x13c0],0x23 ; jne skip — full dword. */
  const uint32_t special =
      (src->s13c0 == ISAAC_ROOM_AMBIENT_7F01C0_SPECIAL_TYPE) ? 1u : 0u;
  out->special_active = special;
  const float a = room_ambient_7f01c0_f32_from_bits(src->a_bits);
  const float b = room_ambient_7f01c0_f32_from_bits(src->b_bits);
  /* 0x7f0357 mulss xmm1,xmm3 ; 0x7f035b mulss xmm0,xmm2 ; 0x7f035f
     addss xmm1,xmm0 — len2 = a*a + b*b f32. */
  float len2 = a * a;
  len2 = len2 + b * b;
  out->len2_bits = room_ambient_7f01c0_bits_to_f32_bits(len2);
  /* 0x7f0363 comiss xmm1,4.0f ; 0x7f036a jbe skip — ORDERED > (NaN
     does not pass). */
  const uint32_t len2_gt =
      (len2 > room_ambient_7f01c0_f32_from_bits(
                  ISAAC_ROOM_AMBIENT_7F01C0_GATE4_BITS))
          ? 1u : 0u;
  out->len2_gt_4 = len2_gt;
  /* DIR law 0x7f0370..0x7f03a3: andps abs mask (0x7fffffff x4
     @0xbacb40); comiss |a|,|b| ; jbe -> arm B (also on NaN);
     arm A: comiss 0,a ; cmova -> 0 iff ORDERED 0>a else 2;
     arm B: comiss 0,b ; setbe -> 1 iff (0<=b) OR NaN(b); dir=2*cl+1. */
  const float ax = __builtin_fabsf(a);
  const float by = __builtin_fabsf(b);
  uint32_t dir;
  if (ax > by) {
    dir = (0.0f > a) ? 0u : 2u;
  } else {
    const uint32_t cl = (0.0f > b) ? 0u : 1u; /* !(0>b): 0<=b OR NaN */
    dir = cl * 2u + 1u;
  }
  out->dir = dir;
  /* dir only feeds the bind ecx when special && len2>4 (0x7f0335
     loads [player+0x1624] into ecx on ALL paths; the dir computation
     overwrites ecx only on this path — provenance law below). */
  out->dir_ok = (special != 0u && len2_gt != 0u) ? 1u : 0u;
  out->gate4_bits = ISAAC_ROOM_AMBIENT_7F01C0_GATE4_BITS;
  out->gate4_va = ISAAC_ROOM_AMBIENT_7F01C0_GATE4_VA;
  out->sqrt_va = ISAAC_ROOM_AMBIENT_7F01C0_SQRT_VA;
  out->head_va = ISAAC_ROOM_AMBIENT_7F01C0_VA;
  out->epilogue_va = ISAAC_ROOM_AMBIENT_7F01C0_EPILOGUE_VA;
}

extern "C" void isaac_room_ambient_7f01c0_adj_dist(
    const IsaacRoomAmbientAdjDist7f01c0Src* src,
    IsaacRoomAmbientAdjDist7f01c0Out* out) {
  if (out == nullptr) return;
  /* 0x7f03c9..0x7f03df: 2a (xmm3+xmm3), 2b (xmm2+xmm2); ny=p33c+2a
     (xmm0), nx=p340+2b (xmm1). 0x7f03e3: d1=slot_y-ny ; 0x7f03ec:
     d0=slot_x-nx — CROSSED. 0x7f03f5..0x7f03fd: dist2=d0*d0+d1*d1. */
  const float sx = room_ambient_7f01c0_f32_from_bits(src->slot_x_bits);
  const float sy = room_ambient_7f01c0_f32_from_bits(src->slot_y_bits);
  const float p0 = room_ambient_7f01c0_f32_from_bits(src->p33c_bits);
  const float p1 = room_ambient_7f01c0_f32_from_bits(src->p340_bits);
  const float a = room_ambient_7f01c0_f32_from_bits(src->a_bits);
  const float b = room_ambient_7f01c0_f32_from_bits(src->b_bits);
  float a2 = a + a;
  float b2 = b + b;
  float ny = p0 + a2;
  float nx = p1 + b2;
  float d1 = sy - ny;
  float d0 = sx - nx;
  out->d0_bits = room_ambient_7f01c0_bits_to_f32_bits(d0);
  out->d1_bits = room_ambient_7f01c0_bits_to_f32_bits(d1);
  float dist2 = d0 * d0;
  dist2 = dist2 + d1 * d1;
  out->dist2_bits = room_ambient_7f01c0_bits_to_f32_bits(dist2);
  /* 0x7f0401 call 0x435a50 — CRT sqrt primitive (in-law). */
  out->dist_bits = room_ambient_7f01c0_sqrt_bits(dist2);
  out->sqrt_va = ISAAC_ROOM_AMBIENT_7F01C0_SQRT_VA;
}

extern "C" void isaac_room_ambient_7f01c0_tail_decision(
    const IsaacRoomAmbientTail7f01c0Src* src,
    IsaacRoomAmbientTail7f01c0Out* out) {
  if (out == nullptr) return;
  /* 0x7f040f test byte [esi+0x3a0],0x10 ; je 0x7f0423 :
     flag set -> 0x7f041b cmp [esi+0xc],2 ; setne al (f0c != 2);
     flag clear -> 0x7f0426 cmp [esi+0xc],2 ; sete al (f0c == 2). */
  const uint32_t flag_set =
      ((src->slot_f3a0_byte & ISAAC_ROOM_AMBIENT_7F01C0_SLOT_F3A0_BIT) != 0u)
          ? 1u : 0u;
  out->flag_bit_set = flag_set;
  const uint32_t compare_enable =
      flag_set != 0u ? ((src->slot_f0c != 2) ? 1u : 0u)
                     : ((src->slot_f0c == 2) ? 1u : 0u);
  out->compare_enable = compare_enable;
  /* 0x7f0438 comiss 25.0f,dist ; ja 0x7f0544 — ORDERED >. */
  const float dist = room_ambient_7f01c0_f32_from_bits(src->dist_bits);
  const uint32_t range_dest =
      (room_ambient_7f01c0_f32_from_bits(ISAAC_ROOM_AMBIENT_7F01C0_RANGE_BITS) >
       dist)
          ? 1u : 0u;
  out->range_dest = range_dest;
  /* 0x7f043e..0x7f0458 mov eax,[esi+8] RE-READ ; cmp 1 ; je ; cmp 4 ;
     cmp 3 ; cmp 2 ; cmp 5 ; jne — full-dword family {1,2,3,4,5}. */
  const int32_t t = static_cast<int32_t>(src->slot_type8);
  const uint32_t type_ok = (t == 1 || t == 4 || t == 3 || t == 2 || t == 5)
                               ? 1u : 0u;
  out->type_ok = type_ok;
  /* 0x7f0460 test byte [eax+0x44],1 (this.f4+0x44) — byte bit0. */
  const uint32_t this_gate_ok =
      ((src->this_f4_44_byte & ISAAC_ROOM_AMBIENT_7F01C0_F4_44_BIT) != 0u)
          ? 1u : 0u;
  out->this_gate_ok = this_gate_ok;
  /* 0x7f046e comiss 60.0f,dist ; jbe skip — ORDERED >. */
  const uint32_t dist60_ok =
      (room_ambient_7f01c0_f32_from_bits(ISAAC_ROOM_AMBIENT_7F01C0_BIND60_BITS) >
       dist)
          ? 1u : 0u;
  out->dist60_ok = dist60_ok;
  /* 0x7f0473 cmp ecx,[ebp-0x48] ; jne — ecx provenance: 0x7f0335 mov
     ecx,[player+0x1624] runs on ALL paths; dir overwrites ecx only when
     special && len2>4 (incl. the type-gate-fail path where the
     register keeps dir); [ebp-0x4c] stays stale on other paths. */
  const uint32_t ecx_is_dir =
      (src->special_active != 0u && src->len2_gt_4 != 0u) ? 1u : 0u;
  out->ecx_is_dir = ecx_is_dir;
  const uint32_t ecx_gate = ecx_is_dir != 0u ? src->dir : src->player_f1624;
  out->ecx_gate = ecx_gate;
  const uint32_t dir_eq_lane = (ecx_gate == src->lane) ? 1u : 0u;
  out->dir_eq_lane = dir_eq_lane;
  /* 0x7f0478 push 0 ; push edx ; ecx=esi ; 0x7f047d call 0x710480. */
  const uint32_t bind_fire =
      (compare_enable != 0u && range_dest == 0u && type_ok != 0u &&
       this_gate_ok != 0u && dist60_ok != 0u && dir_eq_lane != 0u)
          ? 1u : 0u;
  out->bind_fire = bind_fire;
  out->bind_host_va = ISAAC_ROOM_AMBIENT_7F01C0_BIND_HOST_VA;
  out->bind_arg0 = static_cast<uint32_t>(ISAAC_ROOM_AMBIENT_7F01C0_BIND_ARG0);
  out->range_gate_bits = ISAAC_ROOM_AMBIENT_7F01C0_RANGE_BITS;
  out->bind_gate_bits = ISAAC_ROOM_AMBIENT_7F01C0_BIND60_BITS;
  out->dest_544_va = ISAAC_ROOM_AMBIENT_7F01C0_RANGE_TAIL_VA;
  out->dest_485_va = ISAAC_ROOM_AMBIENT_7F01C0_TAIL_CONTINUE_VA;
  out->head_va = ISAAC_ROOM_AMBIENT_7F01C0_VA;
  out->epilogue_va = ISAAC_ROOM_AMBIENT_7F01C0_EPILOGUE_VA;
}

extern "C" void isaac_room_ambient_7f01c0_bounds(
    const IsaacRoomAmbientBounds7f01c0Src* src,
    IsaacRoomAmbientBounds7f01c0Out* out) {
  if (out == nullptr) return;
  /* 0x7f04a5 cmp [esi+8],0x10 ; jne 0x7f051b — full dword gate. */
  const uint32_t chain_active =
      (src->this_f8 == ISAAC_ROOM_AMBIENT_7F01C0_THIS_TYPE_GATE) ? 1u : 0u;
  out->chain_active = chain_active;
  const float p0 = room_ambient_7f01c0_f32_from_bits(src->p33c_bits);
  const float p1 = room_ambient_7f01c0_f32_from_bits(src->p340_bits);
  const float froom1c = room_ambient_7f01c0_f32_from_bits(src->room_f1c_bits);
  const float froom20 = room_ambient_7f01c0_f32_from_bits(src->room_f20_bits);
  const float f120 =
      room_ambient_7f01c0_f32_from_bits(ISAAC_ROOM_AMBIENT_7F01C0_F120_BITS);
  const float f110 =
      room_ambient_7f01c0_f32_from_bits(ISAAC_ROOM_AMBIENT_7F01C0_B110_BITS);
  const float f100 =
      room_ambient_7f01c0_f32_from_bits(ISAAC_ROOM_AMBIENT_7F01C0_B100_BITS);
  const float f140 =
      room_ambient_7f01c0_f32_from_bits(ISAAC_ROOM_AMBIENT_7F01C0_B140_BITS);
  const float f20 =
      room_ambient_7f01c0_f32_from_bits(ISAAC_ROOM_AMBIENT_7F01C0_B20_BITS);
  /* E/G bounds are addss: fround(this.f1c + 20.0f) — 0x7f04e8 addss
     xmm0,xmm1 then comiss. */
  const float bound_e = froom1c + f20;
  const float bound_g = froom20 + f20;
  const uint32_t gate_a = (f120 > p1) ? 1u : 0u;        /* 0x7f04b3 ja */
  const uint32_t gate_b = (f110 > p1) ? 1u : 0u;        /* 0x7f04bc jbe */
  const uint32_t gate_c = (p0 > f100) ? 1u : 0u;        /* 0x7f04c9 jbe */
  const uint32_t gate_d = (f140 > p0) ? 1u : 0u;        /* 0x7f04da ja */
  const uint32_t gate_e = (p0 > bound_e) ? 1u : 0u;     /* 0x7f04f4 ja */
  const uint32_t gate_f = (0.0f > p0) ? 1u : 0u;        /* 0x7f0500 ja */
  const uint32_t gate_g = (p1 > bound_g) ? 1u : 0u;     /* 0x7f0512 ja */
  out->gate_a = gate_a;
  out->gate_b = gate_b;
  out->gate_c = gate_c;
  out->gate_d = gate_d;
  out->gate_e = gate_e;
  out->gate_f = gate_f;
  out->gate_g = gate_g;
  /* Destination precedence matches the ja/jbe fall-through order:
     A -> 6f4 ; (B pass && C pass) -> D?6f4 ; E -> 6ac ; F -> 692 ;
     G -> 678 ; else continue 0x7f051b. */
  uint32_t dest = 0u;
  uint32_t dest_va = ISAAC_ROOM_AMBIENT_7F01C0_CONTINUE_VA;
  if (chain_active != 0u) {
    if (gate_a != 0u) {
      dest = 1u;
      dest_va = ISAAC_ROOM_AMBIENT_7F01C0_DEST_6F4_VA;
    } else if (gate_b != 0u && gate_c != 0u && gate_d != 0u) {
      dest = 1u;
      dest_va = ISAAC_ROOM_AMBIENT_7F01C0_DEST_6F4_VA;
    } else if (gate_e != 0u) {
      dest = 2u;
      dest_va = ISAAC_ROOM_AMBIENT_7F01C0_DEST_6AC_VA;
    } else if (gate_f != 0u) {
      dest = 3u;
      dest_va = ISAAC_ROOM_AMBIENT_7F01C0_DEST_692_VA;
    } else if (gate_g != 0u) {
      dest = 4u;
      dest_va = ISAAC_ROOM_AMBIENT_7F01C0_DEST_678_VA;
    }
  }
  out->dest = dest;
  out->dest_va = dest_va;
  out->cont_va = ISAAC_ROOM_AMBIENT_7F01C0_CONTINUE_VA;
  out->f120_bits = ISAAC_ROOM_AMBIENT_7F01C0_F120_BITS;
  out->f120_va = ISAAC_ROOM_AMBIENT_7F01C0_F120_VA;
  out->f110_bits = ISAAC_ROOM_AMBIENT_7F01C0_B110_BITS;
  out->f110_va = ISAAC_ROOM_AMBIENT_7F01C0_B110_VA;
  out->f100_bits = ISAAC_ROOM_AMBIENT_7F01C0_B100_BITS;
  out->f100_va = ISAAC_ROOM_AMBIENT_7F01C0_B100_VA;
  out->f140_bits = ISAAC_ROOM_AMBIENT_7F01C0_B140_BITS;
  out->f140_va = ISAAC_ROOM_AMBIENT_7F01C0_B140_VA;
  out->f20_bits = ISAAC_ROOM_AMBIENT_7F01C0_B20_BITS;
  out->f20_va = ISAAC_ROOM_AMBIENT_7F01C0_B20_VA;
  out->sqrt_va = ISAAC_ROOM_AMBIENT_7F01C0_SQRT_VA;
}

/* ---------- toolchain defect guard (v64: no narrow scalar params) ----- */
template <typename... Ts>
struct room_ambient_7f01c0_has_narrow_scalar;
template <>
struct room_ambient_7f01c0_has_narrow_scalar<> {
  static constexpr bool value = false;
};
template <typename T, typename... Ts>
struct room_ambient_7f01c0_has_narrow_scalar<T, Ts...> {
  static constexpr bool value =
      (__is_same(T, uint8_t) || __is_same(T, uint16_t)) ||
      room_ambient_7f01c0_has_narrow_scalar<Ts...>::value;
};
template <typename R, typename... Ps>
struct room_ambient_7f01c0_has_narrow_scalar<R(Ps...)> {
  static constexpr bool value =
      room_ambient_7f01c0_has_narrow_scalar<Ps...>::value;
};

#define ISAAC_ROOM_AMBIENT_7F01C0_NO_NARROW_PARAMS(FN)                       \
  static_assert(!room_ambient_7f01c0_has_narrow_scalar<decltype(FN)>::value, \
                #FN " must not take a uint8_t/uint16_t scalar parameter")

ISAAC_ROOM_AMBIENT_7F01C0_NO_NARROW_PARAMS(isaac_room_ambient_7f01c0_va);
ISAAC_ROOM_AMBIENT_7F01C0_NO_NARROW_PARAMS(isaac_room_ambient_7f01c0_ret_va);
ISAAC_ROOM_AMBIENT_7F01C0_NO_NARROW_PARAMS(isaac_room_ambient_7f01c0_lane_off_quot);
ISAAC_ROOM_AMBIENT_7F01C0_NO_NARROW_PARAMS(isaac_room_ambient_7f01c0_lane_off_rem);
ISAAC_ROOM_AMBIENT_7F01C0_NO_NARROW_PARAMS(isaac_room_ambient_7f01c0_pos_step);
ISAAC_ROOM_AMBIENT_7F01C0_NO_NARROW_PARAMS(isaac_room_ambient_7f01c0_dist);
ISAAC_ROOM_AMBIENT_7F01C0_NO_NARROW_PARAMS(isaac_room_ambient_7f01c0_special_step);
ISAAC_ROOM_AMBIENT_7F01C0_NO_NARROW_PARAMS(isaac_room_ambient_7f01c0_adj_dist);
ISAAC_ROOM_AMBIENT_7F01C0_NO_NARROW_PARAMS(isaac_room_ambient_7f01c0_tail_decision);
ISAAC_ROOM_AMBIENT_7F01C0_NO_NARROW_PARAMS(isaac_room_ambient_7f01c0_bounds);

/* ---------- v25r (0x007f01c0 ambient body): OUTER-LOOP count/continue
   law (PE 0x7f022f..0x7f0245 player count; 0x7f051b..0x7f053f continue
   tail). Game::GetPlayer 0x417870 STAYS HOST — the Update wrapper calls
   it and feeds the observed [player+0x2c] into the gate law. The tail
   RE-READS [Game+0x1baac]/[Game+0x1baa8] on EVERY iteration; the entry
   gate is ZERO-ONLY (test/jz). ABI UNCHANGED (64). -------------------- */
extern "C" void isaac_room_ambient_7f01c0_outer_count(
    const IsaacRoomAmbientOuterCount7f01c0Src* src,
    IsaacRoomAmbientOuterCount7f01c0Out* out) {
  if (out == nullptr) return;
  /* 0x7f022f mov eax,[ecx+0x1baac] ; 0x7f0237 sub eax,[ecx+0x1baa8]
     (s32 wrap) ; 0x7f023d sar eax,2 (ARITHMETIC shift, sign kept) —
     same (hi-lo)>>2 SAR idiom as the v61 bind-tail chain law. */
  const int32_t diff = static_cast<int32_t>(src->g1baac - src->g1baa8);
  const int32_t count = diff >> 2; /* SAR */
  out->count_s32 = count;
  out->count_u32 = static_cast<uint32_t>(count);
  /* 0x7f0243 test eax,eax ; 0x7f0245 je 0x7f0711 — ZERO-ONLY gate:
     a negative count (diff<0) ENTERS the loop. */
  out->entry = (count != 0) ? 1u : 0u;
}

extern "C" void isaac_room_ambient_7f01c0_outer_continue(
    const IsaacRoomAmbientOuterCont7f01c0Src* src,
    IsaacRoomAmbientOuterCont7f01c0Out* out) {
  if (out == nullptr) return;
  /* 0x7f0521 mov edx,[ebp-0x54] ; 0x7f0524 inc edx ; 0x7f0525 store —
     idx_next = idx+1 (u32 wrap; inc edx). */
  const uint32_t idx_next = src->idx + 1u;
  out->idx_next = idx_next;
  /* 0x7f0528..0x7f0534 RE-READS [Game+0x1baac]/[Game+0x1baa8] EVERY
     iteration (after the body ran) and re-derives the count — never
     fold the entry count across iterations (Defect class: loop bound
     re-derived per iteration). */
  const int32_t diff = static_cast<int32_t>(src->g1baac - src->g1baa8);
  (void)diff; /* build unblock: count re-derivation still FOLDED by owner */
  const int32_t count = diff >> 2; /* SAR */
  out->count_fresh_s32 = count;
  const uint32_t count_u32 = static_cast<uint32_t>(count);
  out->count_fresh_u32 = count_u32;
  /* 0x7f0537 cmp edx,eax ; 0x7f0539 jb 0x7f0250 — UNSIGNED
     (u32)idx_next < (u32)count_fresh. Negative count_fresh is a huge
     u32 bound. */
  out->continue_loop = (idx_next < count_u32) ? 1u : 0u;
}

extern "C" void isaac_room_ambient_7f01c0_outer_player_gate(
    const IsaacRoomAmbientOuterGate7f01c0Src* src,
    IsaacRoomAmbientOuterGate7f01c0Out* out) {
  if (out == nullptr) return;
  /* 0x7f025b cmp dword ptr [edx+0x2c],0 ; 0x7f025f jne 0x7f051b —
     FULL dword; !=0 -> outer continue (skip the inner slot loop).
     GetPlayer (0x417870, HOST) produced the value; the law observes
     it post-call only. */
  out->skip_inner = (src->player_f2c != 0) ? 1u : 0u;
}

ISAAC_ROOM_AMBIENT_7F01C0_NO_NARROW_PARAMS(isaac_room_ambient_7f01c0_outer_count);
ISAAC_ROOM_AMBIENT_7F01C0_NO_NARROW_PARAMS(isaac_room_ambient_7f01c0_outer_continue);
ISAAC_ROOM_AMBIENT_7F01C0_NO_NARROW_PARAMS(isaac_room_ambient_7f01c0_outer_player_gate);

/* ---------- v25s (0x007f01c0 ambient body): PAYLOAD-SHAPE TAIL arg-prep
   (0x7f0673..0x7f072e). The four bounds-dest shapes 0x7f0678 (G),
   0x7f0692 (F), 0x7f06ac (E), 0x7f06f4 (A/D) push the exact 5-arg
   stdcall frame for host 0x6fd7c0 (ret 0x14; thiscall ecx=Game) at
   call site 0x7f070c. dest = v64 bounds enum (0 none, 1=6f4, 2=6ac,
   3=692, 4=678). edx_in = host live edx (loop leftover) echoed as
   arg4. dest-2 tail arg1: [this.f4] tag == -0xe (FULL dword) -> -0xf;
   else bit2 of [[f4+0x10]+0x38] (shr 2 ; test al,1 — low byte of the
   shifted dword) -> -6 set / -2 clear. [Game+0x18318] stores: 3/0/2/
   none. ecx = Game global on EVERY fired shape (0x7f070a or 0x7f06de).
   ABI UNCHANGED (64). ---------------------------------------------- */
extern "C" void isaac_room_ambient_7f01c0_payload_bounds(
    const IsaacRoomAmbientPayload7f0673Src* src,
    IsaacRoomAmbientPayload7f0673Out* out) {
  if (out == nullptr) return;
  const uint32_t dest = src->dest;
  const uint32_t edx = src->edx_in;
  out->fired = (dest != 0u) ? 1u : 0u;
  out->shape = dest;
  uint32_t a1 = 0u, a2 = 0u, a3 = 0u, a4 = 0u, a5 = 0u;
  uint32_t store_val = 0u, store_off = 0u;
  switch (dest) {
    case 4: /* 0x7f0678 (bounds gate G): push -1,edx,0,3,-2 ; store 3 */
      a1 = static_cast<uint32_t>(ISAAC_ROOM_AMBIENT_7F01C0_PAYLOAD_678_ARG1);
      a2 = ISAAC_ROOM_AMBIENT_7F01C0_PAYLOAD_678_STORE;
      a3 = 0u;
      a4 = edx;
      a5 = static_cast<uint32_t>(ISAAC_ROOM_AMBIENT_7F01C0_PAYLOAD_ARG5);
      store_val = ISAAC_ROOM_AMBIENT_7F01C0_PAYLOAD_678_STORE;
      store_off = ISAAC_ROOM_AMBIENT_7F01C0_GAME_18318_OFF;
      break;
    case 3: /* 0x7f0692 (bounds gate F): push -1,edx,0,0,-2 ; store 0 */
      a1 = static_cast<uint32_t>(ISAAC_ROOM_AMBIENT_7F01C0_PAYLOAD_692_ARG1);
      a2 = ISAAC_ROOM_AMBIENT_7F01C0_PAYLOAD_692_STORE;
      a3 = 0u;
      a4 = edx;
      a5 = static_cast<uint32_t>(ISAAC_ROOM_AMBIENT_7F01C0_PAYLOAD_ARG5);
      store_val = ISAAC_ROOM_AMBIENT_7F01C0_PAYLOAD_692_STORE;
      store_off = ISAAC_ROOM_AMBIENT_7F01C0_GAME_18318_OFF;
      break;
    case 2: /* 0x7f06ac (bounds gate E): f4 tag gate + bit2 sub-branch */
      {
        /* 0x7f06b4 cmp [eax],-0xe ; jne 0x7f06ce — FULL-dword tag. */
        uint32_t tail_arg;
        if (src->f4_f0 == ISAAC_ROOM_AMBIENT_7F01C0_F4_F0_NEG14) {
          tail_arg = static_cast<uint32_t>(
              ISAAC_ROOM_AMBIENT_7F01C0_PAYLOAD_6AC_ARG1_EQ); /* -0xf */
        } else {
          /* 0x7f06ce..0x7f06d7: [[f4+0x10]+0x38], shr 2, test al,1 — the
             LOW BYTE of the shifted dword => bit2 of f4_10_38. */
          const uint32_t bit = (src->f4_10_38 >> 2u) & 1u;
          tail_arg = (bit != 0u)
                         ? static_cast<uint32_t>(
                               ISAAC_ROOM_AMBIENT_7F01C0_PAYLOAD_6AC_ARG1_BIT)
                         : static_cast<uint32_t>(
                               ISAAC_ROOM_AMBIENT_7F01C0_PAYLOAD_6AC_ARG1_NOBIT);
        }
        a1 = tail_arg;
        a2 = ISAAC_ROOM_AMBIENT_7F01C0_PAYLOAD_6AC_ARG2;
        a3 = 0u;
        a4 = edx;
        a5 = static_cast<uint32_t>(ISAAC_ROOM_AMBIENT_7F01C0_PAYLOAD_ARG5);
        store_val = ISAAC_ROOM_AMBIENT_7F01C0_PAYLOAD_6AC_STORE;
        store_off = ISAAC_ROOM_AMBIENT_7F01C0_GAME_18318_OFF;
      }
      break;
    case 1: /* 0x7f06f4 (bounds gates A/D): push -1,edx,2,[G+1831c],
               [G+18328]; NO [Game+0x18318] store (0x7f06f4 block). */
      a1 = src->game_18328;
      a2 = src->game_1831c;
      a3 = ISAAC_ROOM_AMBIENT_7F01C0_PAYLOAD_6F4_ARG3;
      a4 = edx;
      a5 = static_cast<uint32_t>(ISAAC_ROOM_AMBIENT_7F01C0_PAYLOAD_ARG5);
      store_val = 0u;
      store_off = 0u; /* no store on this shape */
      break;
    default: /* dest 0: continue 0x7f051b — no payload call */
      break;
  }
  out->arg1 = a1;
  out->arg2 = a2;
  out->arg3 = a3;
  out->arg4 = a4;
  out->arg5 = a5;
  out->store_val = store_val;
  out->store_off = store_off;
  out->call_va = ISAAC_ROOM_AMBIENT_7F01C0_PAYLOAD_CALL_VA;    /* 0x7f070c */
  out->host_va = ISAAC_ROOM_AMBIENT_7F01C0_PAYLOAD_HOST_VA;    /* 0x6fd7c0 */
  out->cont_va = ISAAC_ROOM_AMBIENT_7F01C0_CONTINUE_VA;        /* 0x7f051b */
  out->epilogue_va = ISAAC_ROOM_AMBIENT_7F01C0_EPILOGUE_VA;    /* 0x7f0711 */
  out->ret_va = ISAAC_ROOM_AMBIENT_7F01C0_RET_VA;              /* 0x7f072e */
}

ISAAC_ROOM_AMBIENT_7F01C0_NO_NARROW_PARAMS(isaac_room_ambient_7f01c0_payload_bounds);

/* ---- v65r: Game::GetPlayer 0x00417870 BODY (thiscall, index stack arg,
   ret 4; 1 E8 -> HOST fatal 0xa112c0; 0 stores) ----
   count = SAR((u32)(end-begin),2); empty (count==0) -> HOST fatal
   0xa112c0 then RE-READ begin/end (defect-class-1: post-call recapture —
   NEVER fold the pre-call read into the post-fatal path); count2
   re-derived from the recaptured pair; (u32)index < (u32)count2 ?
   [begin_used + index*4] : [begin_used] (0x4178b4 jae UNSIGNED). */

extern "C" uint32_t isaac_room_get_player_417870_va(void) {
  return ISAAC_ROOM_GET_PLAYER_417870_VA;
}
extern "C" uint32_t isaac_room_get_player_417870_ret_va(void) {
  return ISAAC_ROOM_GET_PLAYER_417870_RET_VA;
}
extern "C" uint32_t isaac_room_get_player_417870_clamp_ret_va(void) {
  return ISAAC_ROOM_GET_PLAYER_417870_CLAMP_RET_VA;
}
extern "C" uint32_t isaac_room_get_player_417870_game_begin_off(void) {
  return ISAAC_ROOM_GET_PLAYER_417870_GAME_BEGIN_OFF;
}
extern "C" uint32_t isaac_room_get_player_417870_game_end_off(void) {
  return ISAAC_ROOM_GET_PLAYER_417870_GAME_END_OFF;
}
extern "C" uint32_t isaac_room_get_player_417870_fatal_va(void) {
  return ISAAC_ROOM_GET_PLAYER_417870_FATAL_VA;
}
extern "C" uint32_t isaac_room_get_player_417870_fatal_arg0(void) {
  return ISAAC_ROOM_GET_PLAYER_417870_FATAL_ARG0;
}
extern "C" uint32_t isaac_room_get_player_417870_fatal_arg1_va(void) {
  return ISAAC_ROOM_GET_PLAYER_417870_FATAL_ARG1_VA;
}

extern "C" int32_t isaac_room_get_player_417870_count(uint32_t begin,
                                                      uint32_t end) {
  /* 0x417886 sub eax,esi ; 0x417888 sar eax,2 — u32 wrap + SAR. */
  return static_cast<int32_t>(end - begin) >> 2;
}

extern "C" int32_t isaac_room_get_player_417870_empty(int32_t count) {
  /* 0x41788b test eax,eax ; 0x41788d jne 0x4178aa — fatal iff count==0. */
  return count == 0 ? 1 : 0;
}

extern "C" int32_t isaac_room_get_player_417870_in_bounds(uint32_t index,
                                                          int32_t count) {
  /* 0x4178b2 cmp eax,edx ; 0x4178b4 jae clamp — UNSIGNED. */
  return index < static_cast<uint32_t>(count) ? 1 : 0;
}

extern "C" uint32_t isaac_room_get_player_417870_slot_addr(
    uint32_t begin, uint32_t index, int32_t count) {
  /* In-bounds: [begin + index*4] (0x4178b6 lea-free scaled load);
     clamp: [begin] (0x4178c0) — slot 0. UNSIGNED jae. */
  if (index < static_cast<uint32_t>(count)) {
    return begin + index * 4u;
  }
  return begin;
}

extern "C" void isaac_room_get_player_417870_plan(
    uint32_t begin, uint32_t end, uint32_t index, uint32_t re_read_begin,
    uint32_t re_read_end, uint32_t slot0_sample, uint32_t slot_idx_sample,
    IsaacRoomGetPlayer417870Out* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t count_pre = isaac_room_get_player_417870_count(begin, end);
  const int32_t empty = isaac_room_get_player_417870_empty(count_pre);
  out->count_pre = count_pre;
  out->empty = static_cast<uint32_t>(empty);
  out->host_fatal = static_cast<uint32_t>(empty);
  /* Post-call recapture: 0x41789b mov edx,[edi+0x1baac]; 0x4178a4 mov
     esi,[edi+0x1baa8] run ONLY on the fatal path. Non-empty keeps the
     ORIGINAL reads (no re-read site on that path). */
  const uint32_t begin_used = empty != 0 ? re_read_begin : begin;
  const uint32_t end_used = empty != 0 ? re_read_end : end;
  out->begin_used = begin_used;
  out->end_used = end_used;
  const int32_t count_used =
      isaac_room_get_player_417870_count(begin_used, end_used);
  out->count_used = count_used;
  const int32_t in_bounds =
      isaac_room_get_player_417870_in_bounds(index, count_used);
  out->in_bounds = static_cast<uint32_t>(in_bounds);
  out->slot_addr = isaac_room_get_player_417870_slot_addr(
      begin_used, index, count_used);
  out->result = in_bounds != 0 ? slot_idx_sample : slot0_sample;
  out->result_known = 1u;
  out->ret_va = in_bounds != 0 ? ISAAC_ROOM_GET_PLAYER_417870_RET_VA
                               : ISAAC_ROOM_GET_PLAYER_417870_CLAMP_RET_VA;
  out->head_va = ISAAC_ROOM_GET_PLAYER_417870_VA;
  out->clamp_ret_va = ISAAC_ROOM_GET_PLAYER_417870_CLAMP_RET_VA;
  out->fatal_va = ISAAC_ROOM_GET_PLAYER_417870_FATAL_VA;
}

/* ---------- toolchain defect guard (v65r: no narrow scalar params) ----- */
template <typename... Ts>
struct room_get_player_417870_has_narrow_scalar;
template <>
struct room_get_player_417870_has_narrow_scalar<> {
  static constexpr bool value = false;
};
template <typename T, typename... Ts>
struct room_get_player_417870_has_narrow_scalar<T, Ts...> {
  static constexpr bool value =
      (__is_same(T, uint8_t) || __is_same(T, uint16_t)) ||
      room_get_player_417870_has_narrow_scalar<Ts...>::value;
};
template <typename R, typename... Ps>
struct room_get_player_417870_has_narrow_scalar<R(Ps...)> {
  static constexpr bool value =
      room_get_player_417870_has_narrow_scalar<Ps...>::value;
};

#define ISAAC_ROOM_GET_PLAYER_417870_NO_NARROW_PARAMS(FN)                   \
  static_assert(!room_get_player_417870_has_narrow_scalar<decltype(FN)>::value, \
                #FN " must not take a uint8_t/uint16_t scalar parameter")

ISAAC_ROOM_GET_PLAYER_417870_NO_NARROW_PARAMS(isaac_room_get_player_417870_va);
ISAAC_ROOM_GET_PLAYER_417870_NO_NARROW_PARAMS(isaac_room_get_player_417870_ret_va);
ISAAC_ROOM_GET_PLAYER_417870_NO_NARROW_PARAMS(isaac_room_get_player_417870_clamp_ret_va);
ISAAC_ROOM_GET_PLAYER_417870_NO_NARROW_PARAMS(isaac_room_get_player_417870_game_begin_off);
ISAAC_ROOM_GET_PLAYER_417870_NO_NARROW_PARAMS(isaac_room_get_player_417870_game_end_off);
ISAAC_ROOM_GET_PLAYER_417870_NO_NARROW_PARAMS(isaac_room_get_player_417870_fatal_va);
ISAAC_ROOM_GET_PLAYER_417870_NO_NARROW_PARAMS(isaac_room_get_player_417870_fatal_arg0);
ISAAC_ROOM_GET_PLAYER_417870_NO_NARROW_PARAMS(isaac_room_get_player_417870_fatal_arg1_va);
ISAAC_ROOM_GET_PLAYER_417870_NO_NARROW_PARAMS(isaac_room_get_player_417870_count);
ISAAC_ROOM_GET_PLAYER_417870_NO_NARROW_PARAMS(isaac_room_get_player_417870_empty);
ISAAC_ROOM_GET_PLAYER_417870_NO_NARROW_PARAMS(isaac_room_get_player_417870_in_bounds);
ISAAC_ROOM_GET_PLAYER_417870_NO_NARROW_PARAMS(isaac_room_get_player_417870_slot_addr);
ISAAC_ROOM_GET_PLAYER_417870_NO_NARROW_PARAMS(isaac_room_get_player_417870_plan);

/* ---- v25q: 0x7f0544 range-hit tail (PE 0x7f0544..0x7f0673, INSIDE
   FUN_007f01c0; reached from the v64 tail-decision ja 0x7f0544 when
   25.0f > dist; peer v25s owns 0x7f0673..0x7f072e) ----
   Head host 0x705ee0(lane) ret 4 (result discarded, edi preserved);
   clamp(edi,-1,7) SIGNED -> [Game+0x18318] (ALWAYS); slot.f394 == -1
   FULL-dword gate (jne 0x7f060e skips devil block); fs:[0x2c] TLS
   check: (s32)[0xc8108c] > (s32)[[fs:0x2c]+0xc] (jg SIGNED) -> host
   fail 0x7f072f; sel gate (u32)[Game+0x1830c] >= 3 (jae UNSIGNED) ?
   0xc810a0 : Game+0x16c8c, *sel == 0 FULL dword -> devil block;
   devil/angel 0x7499a0(ecx=Game, ForceAngel=(f160==0xf) sete,
   ForceDevil=(f160!=0xf) setne); [Game+0x2654c] self-store + cmp f160
   jne -> [Game+0x26548] |= 1 : |= 0x20. JOIN: push -1 (hoisted);
   f394_split = [slot+0x394]; cmp -0x64 jg SIGNED:
   > -100 -> SHAPE B 0x6fd7c0(a1=f394_split a2=lane&3 a3=0 a4=player
   a5=-1 dangling); <= -100 -> SHAPE A: Game::GetRoomByIdx(f394_split,
   -1) 0x740bc0 (ret 8 consumes -1+f394) -> room; slot RE-READ
   (defect-class-1); cmov (POST-call [slot+0x394]==-100) ? 0x12 : 0;
   0x6fd7c0(a1=[room+0] a2=lane&3 a3=cmov a4=player a5=[room+0xc]).
   Byte store [Game+0x68d70] = 0 both shapes (0x7f066c); jmp 0x7f0711.
   ABI UNCHANGED (64). */

extern "C" uint32_t isaac_room_range_hit_7f0544_va(void) {
  return ISAAC_ROOM_RANGE_HIT_7F0544_VA;
}

extern "C" void isaac_room_range_hit_7f0544_eval(
    const IsaacRoomRangeHit7f0544Src* src, IsaacRoomRangeHit7f0544Out* out) {
  if (out == nullptr) return;
  /* 0x7f0552 cmp edi,-1 ; 0x7f0555 jle (SIGNED); 0x7f0559 cmp edi,7 ;
     0x7f055c jl (SIGNED): clamp(lane, -1, 7) — the -1 and 7 stores
     are reached by the SIGNED compares (jle / jl). */
  const int32_t lane_s = static_cast<int32_t>(src->lane);
  int32_t clamp_value;
  if (lane_s <= ISAAC_ROOM_RANGE_HIT_7F0544_CLAMP_MIN) {
    clamp_value = ISAAC_ROOM_RANGE_HIT_7F0544_CLAMP_MIN; /* or eax,-1 */
  } else if (lane_s < ISAAC_ROOM_RANGE_HIT_7F0544_CLAMP_MAX) {
    clamp_value = lane_s;
  } else {
    clamp_value = ISAAC_ROOM_RANGE_HIT_7F0544_CLAMP_MAX;
  }
  out->clamp_value = clamp_value; /* -> [Game+0x18318] */
  /* 0x7f0578 cmp [slot+0x394],-1 ; 0x7f057f jne — FULL dword. */
  const uint32_t gate_minus1 =
      (src->f394_gate == -1) ? 1u : 0u;
  out->gate_minus1 = gate_minus1;
  /* 0x7f0585 fs:[0x2c] ; 0x7f0592 cmp ; 0x7f0598 jg SIGNED. */
  const uint32_t tls_fail =
      (src->tls_global > src->tls_peb) ? 1u : 0u;
  out->tls_fail = tls_fail;
  out->fail_va = ISAAC_ROOM_RANGE_HIT_7F0544_FAIL_VA;
  /* 0x7f05a6 cmp [G+0x1830c],3 ; 0x7f05b2 jae UNSIGNED >= 3. */
  const uint32_t sel_low =
      (src->game_1830c >= ISAAC_ROOM_RANGE_HIT_7F0544_SEL_GE) ? 1u : 0u;
  out->sel_low = sel_low;
  /* 0x7f05ba cmp [sel],0 ; 0x7f05bd jne — FULL dword. */
  const uint32_t chosen = (sel_low != 0u) ? src->sel_a : src->sel_b;
  const uint32_t sel_zero = (chosen == 0u) ? 1u : 0u;
  out->sel_zero = sel_zero;
  /* Devil block entry: gate && !tls_fail && *sel == 0. */
  const uint32_t devil_fire =
      (gate_minus1 != 0u && tls_fail == 0u && sel_zero != 0u) ? 1u : 0u;
  out->devil_fire = devil_fire;
  /* 0x7f05d1 cmp esi,0xf ; 0x7f05d4 setne / 0x7f05db sete — FULL
     dword; pushed (setne FIRST = arg2 ForceDevil, sete = arg1
     ForceAngel) for host Level::InitializeDevilAngelRoom. */
  const uint32_t f160_eq =
      (src->slot_f160 == ISAAC_ROOM_RANGE_HIT_7F0544_F160_GATE) ? 1u : 0u;
  out->force_angel = f160_eq;  /* sete: f160 == 0xf */
  out->force_devil = (f160_eq == 0u) ? 1u : 0u; /* setne */
  out->devil_va = ISAAC_ROOM_RANGE_HIT_7F0544_HOST_7499A0_VA;
  /* 0x7f05ed..0x7f05f3 [G+0x2654c] SELF-store; 0x7f05f9 cmp esi,0xf
     (esi = f160 preserved across the call); jne -> |0x20 else |1. */
  out->st2654c_flag = devil_fire;
  out->st26548_mask = devil_fire != 0u
      ? ((f160_eq != 0u) ? ISAAC_ROOM_RANGE_HIT_7F0544_OR_MASK_1
                         : ISAAC_ROOM_RANGE_HIT_7F0544_OR_MASK_20)
      : 0u;
  /* 0x7f0613 push -1 (hoisted); 0x7f0615..0x7f061c slot RE-READ
     f394_split; 0x7f0622 cmp -0x64 ; 0x7f0625 jg SIGNED. */
  const uint32_t split_direct =
      (src->f394_split > ISAAC_ROOM_RANGE_HIT_7F0544_SPLIT) ? 1u : 0u;
  out->split_direct = split_direct;
  const uint32_t shape_a = (split_direct == 0u) ? 1u : 0u;
  out->shape_a = shape_a;
  out->getroom_va = ISAAC_ROOM_RANGE_HIT_7F0544_HOST_740BC0_VA;
  out->getroom_arg1 = static_cast<uint32_t>(src->f394_split); /* push eax @0x7f0627 */
  out->getroom_arg2 = 0xffffffffu;       /* hoisted push -1 @0x7f0613 */
  /* 0x7f063e cmp [ecx+0x394],-0x64 AFTER 0x7f062d slot RE-READ
     (POST-GetRoom; defect-class-1: never fold f394_split); 0x7f064e
     cmovne edx,esi: edx=0x12 stays iff equal. */
  const uint32_t cmov_arg3 =
      (src->f394_post == ISAAC_ROOM_RANGE_HIT_7F0544_SPLIT)
          ? static_cast<uint32_t>(ISAAC_ROOM_RANGE_HIT_7F0544_CMOV_TRUE)
          : 0u;
  out->cmov_arg3 = cmov_arg3;
  out->payload_va = ISAAC_ROOM_RANGE_HIT_7F0544_HOST_6FD7C0_VA;
  out->payload_count = ISAAC_ROOM_RANGE_HIT_7F0544_PAYLOAD_ARITY;
  const uint32_t lane3 = src->lane & 3u; /* [ebp-0x48] = edi & 3 */
  out->payload_a2 = lane3;
  out->payload_a4 = src->player;         /* [ebp-0x44] */
  if (shape_a != 0u) {
    out->payload_a1 = src->room_f00;     /* [eax] */
    out->payload_a3 = cmov_arg3;
    out->payload_a5 = src->room_f0c;     /* [eax+0xc] */
  } else {
    out->payload_a1 = static_cast<uint32_t>(src->f394_split); /* push eax @0x7f0661 */
    out->payload_a3 = 0u;
    out->payload_a5 = 0xffffffffu;       /* dangling hoisted push */
  }
  /* 0x7f066c byte [Game+0x68d70] = 0 — reached on both payload
     shapes; the TLS-fail path jumps host 0x7f072f BEFORE the call and
     the store (gate==-1 && tls_fail suppresses it). */
  out->st68d70_flag =
      (gate_minus1 != 0u && tls_fail != 0u) ? 0u : 1u;
  out->head_va = ISAAC_ROOM_RANGE_HIT_7F0544_HOST_705EE0_VA;
  out->head_arg = src->lane;             /* push edi @0x7f0544 (FULL) */
  out->end_va = ISAAC_ROOM_RANGE_HIT_7F0544_END_VA;
  out->epilogue_va = ISAAC_ROOM_RANGE_HIT_7F0544_EPILOGUE_VA;
}

/* ---------- toolchain defect guard (v25q: no narrow scalar params) ----- */
template <typename... Ts>
struct room_range_hit_7f0544_has_narrow_scalar;
template <>
struct room_range_hit_7f0544_has_narrow_scalar<> {
  static constexpr bool value = false;
};
template <typename T, typename... Ts>
struct room_range_hit_7f0544_has_narrow_scalar<T, Ts...> {
  static constexpr bool value =
      (__is_same(T, uint8_t) || __is_same(T, uint16_t)) ||
      room_range_hit_7f0544_has_narrow_scalar<Ts...>::value;
};
template <typename R, typename... Ps>
struct room_range_hit_7f0544_has_narrow_scalar<R(Ps...)> {
  static constexpr bool value =
      room_range_hit_7f0544_has_narrow_scalar<Ps...>::value;
};

#define ISAAC_ROOM_RANGE_HIT_7F0544_NO_NARROW_PARAMS(FN)                  \
  static_assert(!room_range_hit_7f0544_has_narrow_scalar<decltype(FN)>::value, \
                #FN " must not take a uint8_t/uint16_t scalar parameter")

ISAAC_ROOM_RANGE_HIT_7F0544_NO_NARROW_PARAMS(isaac_room_range_hit_7f0544_va);
ISAAC_ROOM_RANGE_HIT_7F0544_NO_NARROW_PARAMS(isaac_room_range_hit_7f0544_eval);

/* ---- v25t: FUN_007f01c0 TLS-fail RE-ENTRY body (PE 0x7f072f..0x7f077b;
   entered from the v25q TLS check `jg 0x7f072f`). The fail path runs a
   TLS claim/sync + a static RoomDescriptor ctor + a release, bracketing
   the SEH funclet state stores. All four calls stay HOST (thunks); this
   law lands the DECISIONS (claim/pass of the 0xc8108c == -1 re-check)
   and the fail-tail STORE laws (state_enter/state_exit) reported for the
   typed-host SEH transport. ABI 66. */
extern "C" uint32_t isaac_room_ambient_7f01c0_fail_reentry_va(void) {
  return ISAAC_ROOM_AMBIENT_7F01C0_FAIL_REENTRY_VA;
}

extern "C" void isaac_room_ambient_7f01c0_fail_reentry(
    const IsaacRoomAmbientFailReentry7f072fSrc* src,
    IsaacRoomAmbientFailReentry7f072fOut* out) {
  if (out == nullptr) return;
  /* 0xaef29d contract (host): *arg == 0 -> *arg = -1 (CLAIM, then the
     re-check sees -1); *arg == -1 -> spin; else sync [TLS+0xc] and
     return unchanged. cmp [0xc8108c],0 ; jne — FULL dword. */
  const uint32_t claim = (src->tls_pre == 0) ? 1u : 0u;
  out->claim = claim;
  /* 0x7f073c cmp [0xc8108c],-1 ; 0x7f0743 jne 0x7f05a0 — FULL dword on
     the POST-call snapshot (defect-class-1: never the pre-call value). */
  const uint32_t fail_tail = (src->tls_post == -1) ? 1u : 0u;
  out->fail_tail = fail_tail;
  /* 0x7f074e [ebp-4] = 0 (funclet ENTER store; fires iff fail_tail). */
  out->state_enter = 0u;
  /* 0x7f0767 [ebp-4] = 0xffffffff (funclet LEAVE store; fires only when
     the tail runs). */
  out->state_exit = (fail_tail != 0u) ? 0xffffffffu : 0u;
  out->fail_va = ISAAC_ROOM_AMBIENT_7F01C0_FAIL_REENTRY_VA;
  out->recheck_va = ISAAC_ROOM_AMBIENT_7F01C0_FAIL_RECHECK_VA;
  out->claim_va = ISAAC_ROOM_AMBIENT_7F01C0_FAIL_CLAIM_VA;
  out->claim_arg = ISAAC_ROOM_AMBIENT_7F01C0_FAIL_TLS_GLOBAL_VA;
  out->ctor_va = ISAAC_ROOM_AMBIENT_7F01C0_FAIL_CTOR_VA;
  out->ctor_ecx = ISAAC_ROOM_AMBIENT_7F01C0_FAIL_CTOR_ECX;
  out->validate_va = ISAAC_ROOM_AMBIENT_7F01C0_FAIL_VALIDATE_VA;
  out->validate_arg = ISAAC_ROOM_AMBIENT_7F01C0_FAIL_VALIDATE_ARG_VA;
  out->release_va = ISAAC_ROOM_AMBIENT_7F01C0_FAIL_RELEASE_VA;
  out->cont_va = ISAAC_ROOM_AMBIENT_7F01C0_FAIL_CONT_VA;
  out->rejoin_edx_game_va = ISAAC_ROOM_AMBIENT_7F01C0_FAIL_REJOIN_GAME_VA;
  out->end_va = ISAAC_ROOM_AMBIENT_7F01C0_FAIL_END_VA;
}

ISAAC_ROOM_AMBIENT_7F01C0_NO_NARROW_PARAMS(isaac_room_ambient_7f01c0_fail_reentry_va);
ISAAC_ROOM_AMBIENT_7F01C0_NO_NARROW_PARAMS(isaac_room_ambient_7f01c0_fail_reentry);

/* ---- v67a: FUN_007f7a40 (record 26 roomTriggerClearAudioNonGreed;
   PE 0x7f7a40..0x7f8189, ret 8, thiscall, 2 stack args a1=[ebx+8]
   a2=[ebx+0xc], BOTH byte-gated). Callers: TriggerClear non-greed
   0x8069cf (a1=1,a2=0, this=room) + 0x73ed37 (a1=0,a2=0). All sound
   calls stay HOST (typed arg records below); this law lands the pure
   DECISION SURFACE: early aborts, play flag, stage-5/6 al, the
   success/PLAY gate, the fail-path gate chain (incl. the 0x740bc0
   POST-call snapshot), the PURE slot-hash search, PLAY2 + door
   branch decisions, and the a1 tail gate. ABI 67. */
extern "C" uint32_t isaac_room_trigger_clear_audio_7f7a40_va(void) {
  return ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_VA;
}

extern "C" void isaac_room_trigger_clear_audio_7f7a40_gates(
    const IsaacRoomTriggerClearAudio7f7a40GatesSrc* src,
    IsaacRoomTriggerClearAudio7f7a40GatesOut* out) {
  if (out == nullptr) return;
  /* 0x7f7a59 cmp byte [ebx+0xc],0 ; 0x7f7a71 jne 0x7f7ac9 — LOW-BYTE
     gate on a2 (re-narrow explicitly; Wasm i32 does not narrow). */
  const uint32_t a2_byte = src->a2 & 0xffu;
  const uint32_t skip_early = (a2_byte != 0u) ? 1u : 0u;
  out->skip_early = skip_early;
  /* EARLY aborts (only when a2_byte == 0): 0x7f7a73 cmp dword
     [Game+0x26584], 0x2c ; je 0x7f817f — FULL dword against the
     literal 0x2c. */
  out->abort_2c = (a2_byte == 0u && src->game_26584 == 0x2cu) ? 1u : 0u;
  /* 0x7f7a80 cmp [this+8],5 ; jne skip ; [[this+4]+0x10]+0x10 == 0x59
     -> fire HOST 0x74ea50(Game); test al,al ; jne 0x7f817f (abort if
     the host result is nonzero). */
  const uint32_t type5_59 =
      (a2_byte == 0u &&
       src->room_type_8 == ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_TYPE5_GATE &&
       src->desc_f10_f10 == ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_SUBTYPE59_GATE)
          ? 1u : 0u;
  out->type5_59 = type5_59;
  out->fire_74ea50 = type5_59;
  out->abort_74ea50 = (type5_59 != 0u && src->h_74ea50 != 0u) ? 1u : 0u;
  /* 0x7f7aa7 stage in [1,6] (jl/jg skip) + bit-0x10000 of
     Game[0x2654c] (jne abort) — FULL dword. */
  const int32_t stage_s = (int32_t)src->game_stage_0;
  const uint32_t stage_gate =
      (a2_byte == 0u && stage_s >= 1 && stage_s <= 6) ? 1u : 0u;
  out->stage_gate = stage_gate;
  out->abort_stage_bit =
      (stage_gate != 0u &&
       (src->game_2654c & ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_STAGE_BIT_MASK) != 0u)
          ? 1u : 0u;
  /* PLAY flag (0x7f7ac9..0x7f7b1d): [r706940+0x80]==3 -> play=1; else
     [0xc7169c] obj chain: (obj_2c7 byte != 0) || (obj_8==2 && Game!=0
     && (Game[0x26630] > 0u (ja) || byte Game[0x26589] != 0)) then at
     0x7f7b03 require Game[0x26584]==0 && Game[0x26630] <= 0u (jbe).
     UNSIGNED on 0x26630; byte tests on 0x2c7/0x26589. */
  const uint32_t obj_at_b03 =
      ((src->obj_2c7 & 0xffu) != 0u) ||
      (src->obj_8 == 2u && src->game_present != 0u &&
       ((src->game_26630 > 0u) || ((src->game_26589 & 0xffu) != 0u)))
          ? 1u : 0u;
  const uint32_t play =
      (src->h_706940_80 == 3u) ||
      (obj_at_b03 != 0u && src->game_26584 == 0u && src->game_26630 <= 0u)
          ? 1u : 0u;
  out->play = play;
  /* AL (0x7f7b1f..0x7f7b57): stage==6 -> 1; stage==5 -> bit-2 of
     (~h6f95a0 & (h6f9400 | Game[0x26550] | Game[0xc])) (test al,2 —
     bit 2 of the LOW byte, same as (x & 2)); else 0. */
  uint32_t al = 0u;
  if (src->game_stage_0 == 6u) {
    al = 1u;
  } else if (src->game_stage_0 == 5u) {
    const uint32_t x = (~src->h_6f95a0) &
                       (src->h_6f9400 | src->game_26550 | src->game_c);
    al = ((x & 2u) != 0u) ? 1u : 0u;
  }
  out->al = al;
  /* SUCCESS gate (0x7f7b59..0x7f7b85): play && al &&
     Game[0x18304]==Game[0x182d0] && Game[4] not in {4,5} &&
     room[0x728]==0 -> PLAY; room[0x728]!=0 -> HARD ABORT (0x7f817f
     ret 0); gate-fail -> FAIL path 0x7f7bd8. */
  const uint32_t gate_main =
      (play != 0u && al != 0u && src->game_18304 == src->game_182d0 &&
       src->game_4 != 4u && src->game_4 != 5u)
          ? 1u : 0u;
  out->success = (gate_main != 0u && src->room_728 == 0u) ? 1u : 0u;
  out->abort_728 = (gate_main != 0u && src->room_728 != 0u) ? 1u : 0u;
  out->fail_path = (play == 0u || al == 0u ||
                    src->game_18304 != src->game_182d0 ||
                    src->game_4 == 4u || src->game_4 == 5u)
                       ? 1u : 0u;
  out->play_fire = out->success;
  out->exit_kind = (out->abort_2c != 0u || out->abort_74ea50 != 0u ||
                    out->abort_stage_bit != 0u || out->abort_728 != 0u)
                       ? 0u
                       : (out->play_fire != 0u ? 1u : 2u);
  /* Typed-host PLAY records (fire iff play_fire): 0x7eea90(this=room,
     arg 1) ; 0x74bba0(this=Game, arg 3) ; [room_728+0x394]=
     0xfffffff6 ; 0x710fa0(this=room_728, arg1=[[room+4]+0x10]+8,
     arg2=[[r74bba0]+0x10]+8). */
  out->call_7eea90_va = ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_7EEA90_VA;
  out->call_7eea90_arg = ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_PLAY_7EEA90_ARG;
  out->call_74bba0_va = ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_74BBA0_VA;
  out->call_74bba0_arg = ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_PLAY_74BBA0_ARG;
  out->store_394_value = ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_SLOT_394_VALUE;
  out->call_710fa0_va = ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_710FA0_VA;
  out->call_710fa0_arg1 = src->room_f10_f8;
  out->call_710fa0_arg2 = src->r74bba0_f10_f8;
  out->ret_va = ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_RET_VA;
  out->fail_va = ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_FAIL_VA;
  out->end_va = ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_END_VA;
}

extern "C" void isaac_room_trigger_clear_audio_7f7a40_fail(
    const IsaacRoomTriggerClearAudio7f7a40FailSrc* src,
    IsaacRoomTriggerClearAudio7f7a40FailOut* out) {
  if (out == nullptr) return;
  const uint32_t a2_byte = src->a2 & 0xffu;
  const uint32_t a1_byte = src->a1 & 0xffu;
  /* 0x7f7bd8 a2==0 -> push -1; push [Game+0x18304]; ecx=Game; call
     0x740bc0; POST-call snapshot [eax+8] must == Game[0x18314]
     (0x7f7bf6 cmp eax,[edi+0x18314]; jne return 0) — defect-class-1:
     the compare reads the RESULT, never the pre-call arg. FULL dword. */
  const uint32_t fire_740bc0 = (a2_byte == 0u) ? 1u : 0u;
  out->fire_740bc0 = fire_740bc0;
  out->call_740bc0_va = ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_740BC0_VA;
  out->abort_740bc0 =
      (fire_740bc0 != 0u && src->h_740bc0_ret_8 != src->game_18314) ? 1u : 0u;
  /* 0x7f7c02 second 0x706940(Game) -> [ebp-0x24]; 0x7f7c12/0x7f7c24:
     if a2==0 && (Game[0x26584]!=0 || Game[0x26630]>0u) require
     [r706940b+0x80] == 2 else return 0. */
  const uint32_t gate_706940b =
      (a2_byte == 0u && (src->game_26584 != 0u || src->game_26630 > 0u))
          ? 1u : 0u;
  out->gate_706940b = gate_706940b;
  out->abort_706940b = (gate_706940b != 0u && src->h_706940b_80 != 2u) ? 1u : 0u;
  /* 0x7f7c31 [0xc7169c] obj chain: byte [obj+0x1e3]!=0 -> skip; else
     obj_8==2 && (Game[0x26630]>0u || byte Game[0x26589]!=0) else
     return 0 (je 0x7f817f). */
  const uint32_t gate_obj = (a2_byte == 0u && (src->obj_1e3 & 0xffu) == 0u)
                                ? 1u : 0u;
  out->gate_obj = gate_obj;
  out->abort_obj =
      (gate_obj != 0u &&
       (src->obj_8 != 2u || (src->game_26630 <= 0u && (src->game_26589 & 0xffu) == 0u)))
          ? 1u : 0u;
  /* 0x7f7c5f 0x74bae0(Game): result==0 -> return 0. */
  out->abort_74bae0_zero = (src->h_74bae0 == 0u) ? 1u : 0u;
  /* 0x7f7c71 a2==0 && r74bae0==4 -> 0x74e9b0(Game); al!=0 -> return 0. */
  const uint32_t gate_74e9b0 = (a2_byte == 0u && src->h_74bae0 == 4u) ? 1u : 0u;
  out->gate_74e9b0 = gate_74e9b0;
  out->abort_74e9b0 = (gate_74e9b0 != 0u && src->h_74e9b0 != 0u) ? 1u : 0u;
  /* SLOT HASH (0x7f7c8b..0x7f7d57, PURE): seed=[desc+0x5c]; seed==0 ->
     HOST FATAL 0xa112c0 (args 0xb6bf54, 0x10) + int3. hash =
     xorshift(seed, 2, 9, 15) u32 wrap:
       t = seed ^ (seed >> 2); u = t ^ (t << 9); hash = u ^ (u >> 15)
     slot = hash & 7. Scan up to 8 (count), signed mod-8 advance:
     FOUND iff bitmap1 word0 bit slot set && room[0x724+slot*4]==0 &&
     bitmap2 word0 bit slot clear. (word = slot>>5 = 0 since slot<8;
     mask = 1 << (slot&31).) */
  const uint32_t seed_fatal = (src->slot_seed == 0u) ? 1u : 0u;
  out->seed_fatal = seed_fatal;
  out->fatal_va = ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_FATAL_VA;
  const uint32_t t0 = src->slot_seed ^ (src->slot_seed >> 2u);
  const uint32_t u0 = t0 ^ (t0 << 9u);
  const uint32_t hash = u0 ^ (u0 >> 15u);
  out->slot_hash = hash;
  uint32_t slot = hash & ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HASH_MASK;
  uint32_t found = 0u;
  uint32_t loop_count = 0u;
  for (uint32_t i = 0; i < 8u && found == 0u; ++i) {
    const uint32_t mask = 1u << (slot & 31u);
    /* bitmap1 = [desc[0x10] + 0x38 + word*4] ; word = slot>>5 = 0. */
    const uint32_t bm1_bit = (src->bm1 & mask) != 0u ? 1u : 0u;
    const uint32_t slot_occ =
        ((uint32_t*)&src->slot_occ0)[slot & 7u];
    const uint32_t bm2_bit = (src->bm2 & mask) != 0u ? 1u : 0u;
    if (bm1_bit != 0u && slot_occ == 0u && bm2_bit == 0u) {
      found = 1u;
      break;
    }
    /* signed mod 8 advance (0x7f7d40 and 0x80000007 / jns / dec / or
       0xfffffff8 / inc): slot stays 0..7 for slot in [0,7]. */
    slot = (uint32_t)(((int32_t)slot + 1) & 7);
    ++loop_count;
  }
  out->slot = slot;
  out->found = found;
  out->loop_count = loop_count;
  out->slot_negative = (slot >= 0x80000000u) ? 1u : 0u; /* dead (0..7) */
  /* PLAY2 (0x7f7d61..0x7f7e19): 0x74bba0(Game, r74bae0) ; slot ptr =
     [this+(slot+0x1c9)*4] (= [this+0x724+slot*4]); ==0 -> HOST
     0x7eea90(this, slot) create; [slot+0x394] = 0xfffffff6;
     0x710fa0(this=slot, 1, [[r74bba0b]+0x10+8]). All fire once the
     fail gates survive (no aborts). */
  const uint32_t fail_alive =
      (out->abort_740bc0 == 0u && out->abort_706940b == 0u &&
       out->abort_obj == 0u && out->abort_74bae0_zero == 0u &&
       out->abort_74e9b0 == 0u && seed_fatal == 0u && found == 1u)
          ? 1u : 0u;
  out->fire_74bba0b = fail_alive;
  out->call_74bba0b_arg = src->h_74bae0;
  const uint32_t slot_occ_final =
      ((uint32_t*)&src->slot_occ0)[slot & 7u];
  out->fire_7eea90b = (fail_alive != 0u && slot_occ_final == 0u) ? 1u : 0u;
  out->call_7eea90b_arg = slot;
  out->store_394_value = ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_SLOT_394_VALUE;
  out->fire_710fa0b = fail_alive;
  out->call_710fa0b_arg1 = ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_PLAY2_ARG1;
  out->call_710fa0b_arg2 = src->r74bba0b_f10_f8;
  /* DOOR BRANCH (0x7f7db3..0x7f7e19): [r706940b+0x80]==2 && slot_8!=8
     -> 0x70d360(slot) != 4 -> slot_8 in {1,4,2} -> PATH B (0x417870
     GetPlayer(0) + 0x710480) else PATH A (+ 0x710dd0 + 0x70fb60). */
  const uint32_t gate_80 = (src->h_706940b_80 == 2u) ? 1u : 0u;
  out->gate_80 = gate_80;
  const uint32_t slot8_gate = (gate_80 != 0u && src->slot_8 != 8u) ? 1u : 0u;
  out->slot8_gate = slot8_gate;
  out->fire_70d360 = slot8_gate;
  const uint32_t gate_70d360_4 = (slot8_gate != 0u && src->h_70d360 != 4u)
                                     ? 1u : 0u;
  out->gate_70d360_4 = gate_70d360_4;
  const uint32_t path_b =
      (gate_70d360_4 != 0u &&
       (src->slot_8 == 1u || src->slot_8 == 4u || src->slot_8 == 2u))
          ? 1u : 0u;
  out->path_b = path_b;
  out->fire_417870 = gate_70d360_4;
  out->call_417870_arg = ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_GETPLAYER_ARG;
  out->fire_710480 = gate_70d360_4;
  out->fire_710dd0 = (gate_70d360_4 != 0u && path_b == 0u) ? 1u : 0u;
  out->fire_70fb60 = (gate_70d360_4 != 0u && path_b == 0u) ? 1u : 0u;
  /* a1 gate (0x7f7e34 cmp byte [ebx+8],0 ; je 0x7f8172 return 1):
     a1==0 -> skip the music tail, still return 1. a1!=0 -> tail
     typed-host block (0x67f1d0 / cos / sin / genrand / 0x428b20 /
     indirect vtable [eax+0xc]; loop count (genrand&3)+5). */
  const uint32_t a1_gate = (a1_byte == 0u) ? 1u : 0u;
  out->a1_gate = a1_gate;
  out->tail_fire = (a1_byte != 0u) ? 1u : 0u;
  out->tail_loop_count = (src->genrand_tail & 3u) + 5u;
  /* Final ret law: 0 iff any abort OR slot-search failed; else 1. */
  const uint32_t any_abort =
      out->abort_740bc0 | out->abort_706940b | out->abort_obj |
      out->abort_74bae0_zero | out->abort_74e9b0 | seed_fatal |
      out->slot_negative | (1u - out->found);
  out->ret = (any_abort != 0u) ? 0u : 1u;
}

template <typename... Ts>
struct room_tca_7f7a40_has_narrow_scalar;
template <>
struct room_tca_7f7a40_has_narrow_scalar<> {
  static constexpr bool value = false;
};
template <typename T, typename... Ts>
struct room_tca_7f7a40_has_narrow_scalar<T, Ts...> {
  static constexpr bool value =
      (__is_same(T, uint8_t) || __is_same(T, uint16_t)) ||
      room_tca_7f7a40_has_narrow_scalar<Ts...>::value;
};
template <typename R, typename... Ps>
struct room_tca_7f7a40_has_narrow_scalar<R(Ps...)> {
  static constexpr bool value =
      room_tca_7f7a40_has_narrow_scalar<Ps...>::value;
};

#define ISAAC_ROOM_TCA_7F7A40_NO_NARROW_PARAMS(FN)                         \
  static_assert(!room_tca_7f7a40_has_narrow_scalar<decltype(FN)>::value,   \
                #FN " must not take a uint8_t/uint16_t scalar parameter")

ISAAC_ROOM_TCA_7F7A40_NO_NARROW_PARAMS(isaac_room_trigger_clear_audio_7f7a40_va);
ISAAC_ROOM_TCA_7F7A40_NO_NARROW_PARAMS(isaac_room_trigger_clear_audio_7f7a40_gates);
ISAAC_ROOM_TCA_7F7A40_NO_NARROW_PARAMS(isaac_room_trigger_clear_audio_7f7a40_fail);

/* ---- v68: FUN_007f8190 (PE 0x7f8190..0x7f83a3, ret 4; decision laws) ---
   HEAD GATE (LOW-BYTE arg [ebp+8]; FULL-dword this8; owner = HOST
   0x9be080 blob) -> SLOT LAW (ALL signed) -> SPAWN/SLOT PATH (SIGNED
   [*this4]) -> SPAWN: SIGNED idiv slot/width + tile pos f32 +
   8-arg create frame; SLOT: bounds/range/collision gates + alloc/ctor/
   vtable/store laws. All E8s stay HOST with typed arg records. The
   byte-gate arg is re-narrowed in the body (no narrow scalar params). */

extern "C" uint32_t isaac_room_8190_va(void) {
  return ISAAC_ROOM_8190_VA;
}
extern "C" uint32_t isaac_room_8190_ret_va(void) {
  return ISAAC_ROOM_8190_RET_VA;
}
extern "C" uint32_t isaac_room_8190_next_va(void) {
  return ISAAC_ROOM_8190_NEXT_VA;
}

extern "C" uint32_t isaac_room_8190_head_ret0(uint32_t arg, uint32_t this8,
                                              uint32_t owner_25a,
                                              int32_t this4_0) {
  /* 0x7f81ba cmp byte [ebp+8],0 ; jne 0x7f8201 — LOW-BYTE test. */
  const uint32_t arg_byte = arg & 0xffu;
  if (arg_byte != 0u) return 0u;          /* byte != 0 -> proceed */
  /* 0x7f81c0 cmp [this+8],2 ; jne ret0 */
  if (this8 != 2u) return 1u;
  /* owner = FirstCollectibleOwner(Game, 0x25a, &Game+0x1baa8, 1):
     blob input (HOST). owner != 0 -> proceed (0x7f81e1 jne). */
  if (owner_25a != 0u) return 0u;
  /* 0x7f81e3 [*this4]; cmp [eax],0 ; jl proceed. */
  return (this4_0 >= 0) ? 1u : 0u;
}

extern "C" int32_t isaac_room_8190_slot_law(int32_t c, int32_t f10,
                                            uint32_t raw48) {
  /* 0x7f8201..0x7f823b. All compares SIGNED (jle/jle/jne/jle/jle). */
  int32_t slot = (c > 0xa && f10 > 1) ? c + 0xa : -1;
  if (raw48 == 6u) {
    if (c > 0x14 && f10 > 2) {
      /* 0x7f8233 lea edi,[edx+edx] where edx = c+0xa; int32 wrap. */
      slot = static_cast<int32_t>(static_cast<uint32_t>(c + 0xa) * 2u);
    } else {
      /* 0x7f8238 or edi,0xffffffff — OVERWRITES the c+0xa value. */
      slot = -1;
    }
  }
  return slot;
}

extern "C" uint32_t isaac_room_8190_spawn_path(int32_t this4_0) {
  /* 0x7f823b cmp [esi],0 ; jge 0x7f82ab — SIGNED. */
  return (this4_0 < 0) ? 1u : 0u;
}

extern "C" void isaac_room_8190_tile_divmod(int32_t slot, int32_t width,
                                            IsaacRoom8190DivmodOut* out) {
  if (out == nullptr) return;
  /* 0x7f824f mov eax,edi ; cdq ; idiv [this+0xc] — SIGNED. width must
     be != 0 (PE faults otherwise; contract excludes 0). */
  out->quot = slot / width;
  out->rem = slot % width;
}

extern "C" float isaac_room_8190_tile_pos_x(int32_t rem) {
  /* 0x7f8260 movd/cvtdq2ps ; mulss xmm1(40.0f) ; addss xmm1 — f32. */
  const float scale = __builtin_bit_cast(float, 0x42200000u); /* 40.0f */
  return static_cast<float>(static_cast<float>(rem) * scale) + scale;
}

extern "C" float isaac_room_8190_tile_pos_y(int32_t quot) {
  /* 0x7f827b movd/cvtdq2ps ; mulss 40.0f ; addss [0xbaaa00] 120.0f. */
  const float scale = __builtin_bit_cast(float, 0x42200000u);
  const float base = __builtin_bit_cast(float, 0x42f00000u); /* 120.0f */
  return static_cast<float>(static_cast<float>(quot) * scale) + base;
}

extern "C" void isaac_room_8190_create_frame(uint32_t index, uint32_t rng,
                                             IsaacRoom8190CreateFrameOut* out) {
  if (out == nullptr) return;
  /* 0x7f8255..0x7f828b push R->L: 0, rng, 0, 0, 0xc7b640, &pos, 0x9c,
     0x3e8; ecx=Game. Frame (arg0 = last pushed): constants + a6=rng. */
  out->a0_type = ISAAC_ROOM_8190_CREATE_TYPE;
  out->a1_variant = ISAAC_ROOM_8190_CREATE_VARIANT;
  out->a2_pos_ptr = 0u; /* runtime frame local (lea [ebp-0x14]) */
  out->a3_posvec = ISAAC_ROOM_8190_CREATE_POS_VEC_VA;
  out->a4_zero = 0u;
  out->a5_zero = 0u;
  out->a6_rng = rng;
  out->a7_zero = 0u;
  out->arity = ISAAC_ROOM_8190_CREATE_ARITY;
  out->host_va = ISAAC_ROOM_8190_CREATE_HOST_VA;
  (void)index; /* out-of-contract index pin kept for the frame-at law */
}

extern "C" void isaac_room_8190_slot_gates(int32_t slot, int32_t gridcoll,
                                           IsaacRoom8190SlotGatesOut* out) {
  if (out == nullptr) return;
  /* 0x7f82f4 test edi,edi; js fatal ; 0x7f82f8 cmp edi,0x1c0 ; jl skip-
     fatal — bounds: (int32)slot<0 || (u32)slot>=0x1c0 -> 0xa112c0 (then
     FALLS THROUGH to the ja, i.e. a logged warning, not a terminating
     fatal). */
  const uint32_t fatal_bounds =
      (slot < 0 || (static_cast<uint32_t>(slot) >= ISAAC_ROOM_8190_SLOT_FATAL_MAX))
          ? 1u : 0u;
  out->fatal_bounds = fatal_bounds;
  /* 0x7f830f cmp edi,0x1bf ; ja 0x7f8390 — UNSIGNED range skip. */
  const uint32_t skip_range =
      (static_cast<uint32_t>(slot) > ISAAC_ROOM_8190_SLOT_SKIP_MAX) ? 1u : 0u;
  out->skip_range = skip_range;
  /* 0x7f831f test eax,eax ; jg 0x7f8390 — SIGNED collision skip. */
  const uint32_t skip_collision = (gridcoll > 0) ? 1u : 0u;
  out->skip_collision = skip_collision;
  /* alloc 0xa0f4c0(0x154) runs iff neither range nor collision skips;
     a null alloc result then skips (test esi,esi; je) — law: needed. */
  out->alloc_needed =
      (skip_range == 0u && skip_collision == 0u) ? 1u : 0u;
  out->grid_host_va = ISAAC_ROOM_8190_GRID_HOST_VA;
  out->alloc_host_va = ISAAC_ROOM_8190_ALLOC_HOST_VA;
  out->alloc_arg = ISAAC_ROOM_8190_ALLOC_ARG;
  out->ctor_host_va = ISAAC_ROOM_8190_CTOR_HOST_VA;
  out->init_host_va = ISAAC_ROOM_8190_INIT_HOST_VA;
  out->vtable = ISAAC_ROOM_8190_VTABLE;
  out->subtype = ISAAC_ROOM_8190_SUBTYPE;
  out->slot_off = ISAAC_ROOM_8190_SLOT_ARR_OFF;
  out->slot_stride = ISAAC_ROOM_8190_SLOT_STRIDE;
  out->obj_f8_val = ISAAC_ROOM_8190_OBJ_F8_VAL;
  out->obj_f18_val = ISAAC_ROOM_8190_OBJ_F18_VAL;
}

/* ---------- toolchain defect guard (v68: no narrow scalar params) ----- */
template <typename... Ts>
struct room_8190_has_narrow_scalar;
template <>
struct room_8190_has_narrow_scalar<> {
  static constexpr bool value = false;
};
template <typename T, typename... Ts>
struct room_8190_has_narrow_scalar<T, Ts...> {
  static constexpr bool value =
      (__is_same(T, uint8_t) || __is_same(T, uint16_t)) ||
      room_8190_has_narrow_scalar<Ts...>::value;
};
template <typename R, typename... Ps>
struct room_8190_has_narrow_scalar<R(Ps...)> {
  static constexpr bool value = room_8190_has_narrow_scalar<Ps...>::value;
};

#define ISAAC_ROOM_8190_NO_NARROW_PARAMS(FN)                               \
  static_assert(!room_8190_has_narrow_scalar<decltype(FN)>::value,         \
                #FN " must not take a uint8_t/uint16_t scalar parameter")

ISAAC_ROOM_8190_NO_NARROW_PARAMS(isaac_room_8190_va);
ISAAC_ROOM_8190_NO_NARROW_PARAMS(isaac_room_8190_ret_va);
ISAAC_ROOM_8190_NO_NARROW_PARAMS(isaac_room_8190_next_va);
ISAAC_ROOM_8190_NO_NARROW_PARAMS(isaac_room_8190_head_ret0);
ISAAC_ROOM_8190_NO_NARROW_PARAMS(isaac_room_8190_slot_law);
ISAAC_ROOM_8190_NO_NARROW_PARAMS(isaac_room_8190_spawn_path);
ISAAC_ROOM_8190_NO_NARROW_PARAMS(isaac_room_8190_tile_divmod);
ISAAC_ROOM_8190_NO_NARROW_PARAMS(isaac_room_8190_tile_pos_x);
ISAAC_ROOM_8190_NO_NARROW_PARAMS(isaac_room_8190_tile_pos_y);
ISAAC_ROOM_8190_NO_NARROW_PARAMS(isaac_room_8190_create_frame);
ISAAC_ROOM_8190_NO_NARROW_PARAMS(isaac_room_8190_slot_gates);

/* ------------------------------------------------------------------ v69 ---
   FUN_007f83b0 record-27 trigger-clear audio "always" body pure decision
   laws (PE 0x7f83b0..0x7f92ab). L1 music (xorshift32 {2,0x15,9} + u32->
   double sign-fix + cvtpd2ps + mulss 0x2f7ffffe + comiss ja/jae, NaN ->
   NOT music), L2 rnd f32, L3 flag store, L4 skip gate, L5 seed fatal,
   L6..L8 item vol/pitch/speed, L9 noise direction comiss, L10 signed
   mod (pow2), L11 chapter cap clamp. Host leaves stay typed (census in
   section-notes/room-v69-7f83b0/NOTES.md §4). No narrow scalar params;
   byte-gate args re-narrowed in the body only. */

static inline float isaac_room_trigger_clear_audio_u32_to_f32(
    uint32_t bits) {
  /* movd xmm0,edx; cvtdq2pd (SIGNED); shr edx,0x1f; addsd
     [edx*8+0xbacb00] ({0.0, 2^32}); cvtpd2ps. Exact u32->f32. */
  const int32_t s = static_cast<int32_t>(bits);
  double d = static_cast<double>(s);
  if (s < 0) {
    d += 4294967296.0;
  }
  return static_cast<float>(d);
}

static inline uint32_t isaac_room_tca40_f32_bits(float v) {
  return __builtin_bit_cast(uint32_t, v);
}

static inline float isaac_room_tca40_bits_f32(uint32_t bts) {
  return __builtin_bit_cast(float, bts);
}

extern "C" uint32_t isaac_room_trigger_clear_audio_83b0_va(void) {
  return ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_VA;
}
extern "C" uint32_t isaac_room_trigger_clear_audio_83b0_ret_va(void) {
  return ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_RET_VA;
}
extern "C" uint32_t isaac_room_trigger_clear_audio_83b0_end_va(void) {
  return ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_END_VA;
}

extern "C" float isaac_room_trigger_clear_audio_rnd_f32(uint32_t seed) {
  /* 0x7f8495..0x7f84cd: shr 2 / shl 0x15 / shr 9 (cl regs from qword
     0xb1f594 {2,0x15} + dword 0xb1f59c {9}); movd/cvtdq2pd; sign-fix
     addsd [edx*8+0xbacb00]; cvtpd2ps; mulss [0xba9ff0] = 0x2f7ffffe. */
  uint32_t t = seed;
  t ^= t >> ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_SHIFT_LO;
  t ^= t << ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_SHIFT_MID;
  t ^= t >> ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_SHIFT_HI;
  const float rnd =
      isaac_room_trigger_clear_audio_u32_to_f32(t) *
      __builtin_bit_cast(float, ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_SCALE_BITS);
  return rnd;
}

extern "C" uint32_t isaac_room_trigger_clear_audio_music(
    uint32_t arg2, uint32_t value_bits, uint32_t seed) {
  /* 0x7f8446 cmp byte [ebx+0xc],0 ; 0x7f8453 jne 0x7f8509 — arg2 forces
     the music path (LOW-BYTE test). */
  if ((arg2 & 0xffu) != 0u) return 1u;
  const float value =
      __builtin_bit_cast(float, value_bits);
  const float rnd = isaac_room_trigger_clear_audio_rnd_f32(seed);
  /* 0x7f84d5 comiss value,rnd ; 0x7f84d8 ja 0x7f8509 — ORDERED >. NaN:
     comiss sets CF (unordered) -> ja NOT taken. */
  if (value > rnd) return 1u;
  /* 0x7f84da comiss value,[0xbaa454]=1.0f ; 0x7f84e1 jae 0x7f8509. */
  const float one = __builtin_bit_cast(
      float, ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_ONE_BITS);
  if (value >= one) return 1u;
  return 0u;
}

extern "C" uint32_t isaac_room_trigger_clear_audio_flag_store(
    uint32_t arg2, uint32_t value_bits, uint32_t seed) {
  /* 0x7f84e3 mov byte ptr [edi+9],1 — fires iff NOT music && arg2==0
     (falls to the 0x7f84e7 al=0 epilogue). */
  if ((arg2 & 0xffu) != 0u) return 0u;
  return isaac_room_trigger_clear_audio_music(0u, value_bits, seed) == 0u
             ? 1u : 0u;
}

extern "C" uint32_t isaac_room_trigger_clear_audio_skip(
    uint32_t arg2, uint32_t gate749830, uint32_t room_match) {
  /* 0x7f8407 je 0x7f84e7 (gate749830 == 0) / 0x7f8439 jne 0x7f84e7
     (room_match == 0): pure skip with NO stores, both arg2==0-only. */
  if ((arg2 & 0xffu) != 0u) return 0u;
  if (gate749830 == 0u) return 1u;
  if (room_match == 0u) return 1u;
  return 0u;
}

extern "C" uint32_t isaac_room_trigger_clear_audio_seed_fatal(
    uint32_t seed) {
  /* 0x7f8478 test eax,eax ; 0x7f847a jne 0x7f8495: seed==0 -> HOST fatal
     0xa112c0(0x10, 0xb6bf54) + int3, then the body CONTINUES (rnd 0). */
  return (seed == 0u) ? 1u : 0u;
}

extern "C" float isaac_room_trigger_clear_audio_item_vol(
    uint32_t rnd_bits) {
  /* 0x7f876d..0x7f8795: u32ToF32 * 2^-32 (0xba9ff4) * 5.0f (0xbaa784),
     stored [ebp-0x34]. */
  const float unit = isaac_room_trigger_clear_audio_u32_to_f32(rnd_bits);
  const float scale = __builtin_bit_cast(
      float, ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_SCALE_POW2M32_BITS);
  const float five = __builtin_bit_cast(
      float, ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_VOL_MUL_BITS);
  return (unit * scale) * five;
}

extern "C" float isaac_room_trigger_clear_audio_item_pitch(
    uint32_t rnd_bits) {
  /* 0x7f8821..0x7f884d: u32ToF32 * 2^-32 * pi (0xbaa704), then DOUBLED
     by ADDSS xmm0,xmm0 @0x7f8849 (x + x, not mulss 2.0f). */
  const float unit = isaac_room_trigger_clear_audio_u32_to_f32(rnd_bits);
  const float scale = __builtin_bit_cast(
      float, ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_SCALE_POW2M32_BITS);
  const float pi = __builtin_bit_cast(
      float, ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_PITCH_MUL_BITS);
  const float p = (unit * scale) * pi;
  return p + p;
}

extern "C" float isaac_room_trigger_clear_audio_item_speed(
    uint32_t rnd_bits) {
  /* 0x7f8857..0x7f887f: u32ToF32 * 2^-32 * 20.0f (0xbaa87c), stored
     [ebp-0x34] (overwrites vol; drives cos/sin velocity). */
  const float unit = isaac_room_trigger_clear_audio_u32_to_f32(rnd_bits);
  const float scale = __builtin_bit_cast(
      float, ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_SCALE_POW2M32_BITS);
  const float twenty = __builtin_bit_cast(
      float, ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_SPEED_MUL_BITS);
  return (unit * scale) * twenty;
}

extern "C" float isaac_room_trigger_clear_audio_noise_dir(
    uint32_t vel_bits) {
  /* 0x7f8938 default [ebp-0x34]=1.0f; 0x7f899f comiss xmm0(0.0f),vel;
     0x7f89a2 jbe 0x7f89b1 keep; 0x7f89a4 dir=-1.0f (0xbaad50). NaN:
     unordered sets CF -> jbe TAKEN -> keep +1.0f. -0.0f/0.0f: not < ->
     keep. */
  const float vel = __builtin_bit_cast(float, vel_bits);
  const float one = __builtin_bit_cast(
      float, ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_ONE_BITS);
  const float neg_one = __builtin_bit_cast(
      float, ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_NEG1_BITS);
  return (vel < 0.0f) ? neg_one : one;
}

extern "C" int32_t isaac_room_trigger_clear_audio_signed_mod(
    uint32_t value, uint32_t mod_pow2) {
  /* 0x7f85c5..0x7f85d1 (mod 8) / 0x7f86fc..0x7f8708 (mod 4):
     and 0x80000000|(mod-1); jns done; dec; or ~(mod-1); inc.
     == (int32)value % (int32)mod for power-of-two mod. */
  const uint32_t mask = 0x80000000u | (mod_pow2 - 1u);
  uint32_t t = value & mask;
  if (t & 0x80000000u) {
    t = (t - 1u) | (~(mod_pow2 - 1u));
    t = t + 1u;
  }
  return static_cast<int32_t>(t);
}

extern "C" uint32_t isaac_room_trigger_clear_audio_chapter_cap(
    uint32_t chapter, int32_t base) {
  /* 0x7f8ac4..0x7f8aef: eax=[game+4]; 4/5 -> ecx=[game]+1 else [game];
     test ecx,ecx; cmovle ecx,0; mov eax,0xd; cmp ecx,0xd; cmovl
     eax,ecx; [game+0x26554]=eax. Signed clamp 0..13. */
  int32_t v = base;
  const int32_t ch = static_cast<int32_t>(chapter);
  if (ch == ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_CHAPTER_4 ||
      ch == ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_CHAPTER_5) {
    v = v + 1;
  }
  if (v <= 0) v = 0;
  if (v >= ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_CHAPTER_CAP) {
    v = ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_CHAPTER_CAP;
  }
  return static_cast<uint32_t>(v);
}

/* ---------- toolchain defect guard (v69: no narrow scalar params) ----- */
template <typename... Ts>
struct room_tca83b0_has_narrow_scalar;
template <>
struct room_tca83b0_has_narrow_scalar<> {
  static constexpr bool value = false;
};
template <typename T, typename... Ts>
struct room_tca83b0_has_narrow_scalar<T, Ts...> {
  static constexpr bool value =
      (__is_same(T, uint8_t) || __is_same(T, uint16_t)) ||
      room_tca83b0_has_narrow_scalar<Ts...>::value;
};
template <typename R, typename... Ps>
struct room_tca83b0_has_narrow_scalar<R(Ps...)> {
  static constexpr bool value = room_tca83b0_has_narrow_scalar<Ps...>::value;
};

#define ISAAC_ROOM_TCA83B0_NO_NARROW_PARAMS(FN)                            \
  static_assert(!room_tca83b0_has_narrow_scalar<decltype(FN)>::value,      \
                #FN " must not take a uint8_t/uint16_t scalar parameter")

ISAAC_ROOM_TCA83B0_NO_NARROW_PARAMS(isaac_room_trigger_clear_audio_83b0_va);
ISAAC_ROOM_TCA83B0_NO_NARROW_PARAMS(isaac_room_trigger_clear_audio_83b0_ret_va);
ISAAC_ROOM_TCA83B0_NO_NARROW_PARAMS(isaac_room_trigger_clear_audio_83b0_end_va);
ISAAC_ROOM_TCA83B0_NO_NARROW_PARAMS(isaac_room_trigger_clear_audio_music);
ISAAC_ROOM_TCA83B0_NO_NARROW_PARAMS(isaac_room_trigger_clear_audio_rnd_f32);
ISAAC_ROOM_TCA83B0_NO_NARROW_PARAMS(isaac_room_trigger_clear_audio_flag_store);
ISAAC_ROOM_TCA83B0_NO_NARROW_PARAMS(isaac_room_trigger_clear_audio_skip);
ISAAC_ROOM_TCA83B0_NO_NARROW_PARAMS(isaac_room_trigger_clear_audio_seed_fatal);
ISAAC_ROOM_TCA83B0_NO_NARROW_PARAMS(isaac_room_trigger_clear_audio_item_vol);
ISAAC_ROOM_TCA83B0_NO_NARROW_PARAMS(isaac_room_trigger_clear_audio_item_pitch);
ISAAC_ROOM_TCA83B0_NO_NARROW_PARAMS(isaac_room_trigger_clear_audio_item_speed);
ISAAC_ROOM_TCA83B0_NO_NARROW_PARAMS(isaac_room_trigger_clear_audio_noise_dir);
ISAAC_ROOM_TCA83B0_NO_NARROW_PARAMS(isaac_room_trigger_clear_audio_signed_mod);
ISAAC_ROOM_TCA83B0_NO_NARROW_PARAMS(isaac_room_trigger_clear_audio_chapter_cap);

/* ------------------------------------------------------------------ v70 - */
/* FUN_007f92b0 value leaf (PE 0x7f92b0..0x7f96e6, ret ST0 float) +
   the v69 ALT-tail laws (door magic 0xe/0xf flag stores 0x7f8d94..
   0x7f8dc6, tail-RNG advance 0x7f91dd..0x7f9201 with store-back
   [game+0x182e4]). Census in section-notes/room-v70-7f92b0/NOTES.md
   §4. Host leaves (FCO 0x9be080, counts 0x9be750/0x9be6b0, lookup
   0x7cb6e0, GetRoomByIdx 0x740bc0, list leaves 0x41b770/0x9305f0)
   stay typed; every byte gate re-narrows in the body (no narrow
   scalar params). */

extern "C" uint32_t isaac_room_value_92b0_va(void) {
  return ISAAC_ROOM_VALUE_92B0_VA;
}
extern "C" uint32_t isaac_room_value_92b0_ret_va(void) {
  return ISAAC_ROOM_VALUE_92B0_RET_VA;
}
extern "C" uint32_t isaac_room_value_92b0_end_va(void) {
  return ISAAC_ROOM_VALUE_92B0_END_VA;
}

extern "C" uint32_t isaac_room_value_92b0_stage_scale(
    uint32_t stage, uint32_t chapter4, uint32_t chapter) {
  /* 0x7f95dc test ecx,ecx / je 0x7f961d: stage==0 -> no scale.
     chapter_adj = ([game+4]==4||5) ? [game]+1 : [game] (u32);
     d = chapter_adj - stage (u32 wrap); d==0||1 -> 1 (0.25f);
     d==2 -> 2 (0.5f); else 0. */
  if (stage == 0u) return 0u;
  uint32_t adj = chapter;
  const uint32_t ch4 = chapter4;
  if (ch4 == ISAAC_ROOM_VALUE_92B0_CHAPTER_4 ||
      ch4 == ISAAC_ROOM_VALUE_92B0_CHAPTER_5) {
    adj = adj + 1u;
  }
  const uint32_t d = adj - stage;
  if (d == 0u || d == 1u) return 1u;
  if (d == 2u) return 2u;
  return 0u;
}

extern "C" float isaac_room_value_92b0(
    uint32_t owner33, uint32_t owner104, uint32_t count33, uint32_t owner22,
    uint32_t owner3b, uint32_t owner4e, uint32_t flags1839c,
    uint32_t room_match, uint32_t room120c, uint32_t owner259,
    uint32_t owner259b, uint32_t trinket_ae_count, uint32_t trinket_ae_t,
    uint32_t trinket_7_count, uint32_t trinket_7_t, uint32_t owner29d,
    uint32_t count124, uint32_t stage, uint32_t chapter4, uint32_t chapter,
    uint32_t music_flag9, uint32_t owner_d7, uint32_t room_has_d7,
    uint32_t mode2663c, uint32_t flags26548, uint32_t owner_1f3,
    uint32_t mode269c8, uint32_t count18334) {
  const float init = __builtin_bit_cast(
      float, ISAAC_ROOM_VALUE_92B0_INIT_BITS); /* 0.01f @0x7f92b9 */
  float acc = init;

  /* A1 (0x7f92dc): REPLACE, not add (movss [0xbaa12c] @0x7f92e5). */
  if (owner33 != 0u) {
    acc = __builtin_bit_cast(float, ISAAC_ROOM_VALUE_92B0_A1_BITS);
  }
  /* A2 (0x7f9307): acc += 0.15f. */
  if (owner104 != 0u) {
    acc = acc + __builtin_bit_cast(float, ISAAC_ROOM_VALUE_92B0_A2_BITS);
  }
  /* A3 (0x7f9332): count33 > 1 SIGNED (cmp eax,1 / jle @0x7f9337). */
  if (static_cast<int32_t>(count33) > 1) {
    acc = acc + __builtin_bit_cast(float, ISAAC_ROOM_VALUE_92B0_A3_BITS);
  }
  /* A4 (0x7f9361/0x7f937b): FCO22 short-circuits the FCO3b call. */
  if (owner22 != 0u || owner3b != 0u) {
    acc = acc + __builtin_bit_cast(float, ISAAC_ROOM_VALUE_92B0_A4_BITS);
  }
  /* A5 (0x7f93a9). */
  if (owner4e != 0u) {
    acc = acc + __builtin_bit_cast(float, ISAAC_ROOM_VALUE_92B0_A5_BITS);
  }
  /* A6 (0x7f93cc): test byte [game+0x1839c],1 -> bit gate. */
  if (flags1839c & ISAAC_ROOM_VALUE_92B0_FLAGS_BIT_1) {
    acc = acc + __builtin_bit_cast(float, ISAAC_ROOM_VALUE_92B0_A6_BITS);
  }
  /* A7 (0x7f93eb..0x7f944b): !match || byte [room+0x120c]==0 ->
     acc += 0.35f; else FCO(0x259) -> acc += 0.15f. FULL-dword match;
     BYTE gate on room120c (cmp byte ptr @0x7f9407). */
  if (room_match == 0u || (room120c & 0xffu) == 0u) {
    acc = acc + __builtin_bit_cast(float, ISAAC_ROOM_VALUE_92B0_A7_BITS);
  } else if (owner259 != 0u) {
    acc = acc + __builtin_bit_cast(float, ISAAC_ROOM_VALUE_92B0_A7B_BITS);
  }
  /* A8 (0x7f9451): !(flags&4) -> += 0.99f; else FCO(0x259) 2nd ->
     += 0.4f. */
  if (!(flags1839c & ISAAC_ROOM_VALUE_92B0_FLAGS_BIT_4)) {
    acc = acc + __builtin_bit_cast(float, ISAAC_ROOM_VALUE_92B0_A8_BITS);
  } else if (owner259b != 0u) {
    acc = acc + __builtin_bit_cast(float, ISAAC_ROOM_VALUE_92B0_A8B_BITS);
  }
  /* A9 (0x7f9495): flags & 0x40 -> += 0.1f. NOTE: the literal 0.1f is
     used instead of __builtin_bit_cast(float, 0x3dcccccdu) because the
     emsdk LLVM wasm backend mis-materializes that named-constexpr bit
     pattern to 0xdccccccd when identical constants merge (verified
     minimal repro; the bits of 0.1f are exactly 0x3dcccccd). */
  if (flags1839c & ISAAC_ROOM_VALUE_92B0_FLAGS_BIT_40) {
    acc = acc + 0.1f;
  }
  /* A10 (0x7f94b7..0x7f9509): trinket 0xae count gate (FULL dword) +
     sub-chain switch on the 0x7cb6e0 result: 1 -> 0.1f, 2 -> 0.15f,
     3 -> 0.2f. */
  if (trinket_ae_count != 0u) {
    if (trinket_ae_t == 1u) {
      acc = acc + 0.1f; /* literal: see the A9 0x3dcccccd toolchain note */
    } else if (trinket_ae_t == 2u) {
      acc = acc + __builtin_bit_cast(float, ISAAC_ROOM_VALUE_92B0_A10_2_BITS);
    } else if (trinket_ae_t == 3u) {
      acc = acc + __builtin_bit_cast(float, ISAAC_ROOM_VALUE_92B0_A10_3_BITS);
    }
  }
  /* A11 (0x7f951d..0x7f9557): trinket 7: 2 -> 0.05f, 3 -> 0.1f. */
  if (trinket_7_count != 0u) {
    if (trinket_7_t == 2u) {
      acc = acc + __builtin_bit_cast(float, ISAAC_ROOM_VALUE_92B0_A11_2_BITS);
    } else if (trinket_7_t == 3u) {
      acc = acc + 0.1f; /* literal: see the A9 0x3dcccccd toolchain note */
    }
  }
  /* A12 (0x7f9571). */
  if (owner29d != 0u) {
    acc = acc + __builtin_bit_cast(float, ISAAC_ROOM_VALUE_92B0_A12_BITS);
  }
  /* A13 (0x7f95a5..0x7f9617): f = u32ToF32(count124) * 0.1f; acc += f;
     stage scale on (acc_old + f) — the addss @0x7f95d0 clobbers xmm1
     BEFORE the stage block, so the multiply applies to the SUM. */
  {
    const float f = isaac_room_trigger_clear_audio_u32_to_f32(count124) *
                    0.1f; /* literal: see the A9 0x3dcccccd toolchain note */
    const float summed = acc + f;
    const uint32_t sel =
        isaac_room_value_92b0_stage_scale(stage, chapter4, chapter);
    if (sel == 1u) {
      acc = summed *
            __builtin_bit_cast(float, ISAAC_ROOM_VALUE_92B0_SCALE_Q_BITS);
    } else if (sel == 2u) {
      acc = summed *
            __builtin_bit_cast(float, ISAAC_ROOM_VALUE_92B0_SCALE_H_BITS);
    } else {
      acc = summed;
    }
  }
  /* A14 (0x7f961d): byte [game+9] != 0 -> acc = 0. */
  if ((music_flag9 & 0xffu) != 0u) {
    acc = 0.0f;
  }
  /* A15 (0x7f962b..0x7f9656): FCO(0xd7) FULL-dword test; the 0x9305f0
     result is AL (byte). Either -> acc = 66.4f. */
  if (owner_d7 != 0u || (room_has_d7 & 0xffu) != 0u) {
    acc = __builtin_bit_cast(float, ISAAC_ROOM_VALUE_92B0_A15_BITS);
  }
  /* A16 (0x7f9664): mode FULL dword == 0x11 && !(flags26548 &
     0x20000000) -> acc = 1.0f. */
  if (mode2663c == ISAAC_ROOM_VALUE_92B0_MODE_2663C &&
      !(flags26548 & ISAAC_ROOM_VALUE_92B0_FLAGS26548_BIT)) {
    acc = __builtin_bit_cast(float, ISAAC_ROOM_VALUE_92B0_ONE_BITS);
  }
  /* A17 (0x7f9693): FCO(0x1f3) FULL-dword test -> acc = 1.0f. */
  if (owner_1f3 != 0u) {
    acc = __builtin_bit_cast(float, ISAAC_ROOM_VALUE_92B0_ONE_BITS);
  }
  /* A18 (0x7f96aa..0x7f96d5): mode FULL dword 2/3 -> acc = 1.0f;
     e = (mode==3) ? 0xc : 0xb; UNSIGNED [game+0x18334] < e -> acc = 0
     (jae keeps 1.0f). */
  if (mode269c8 == ISAAC_ROOM_VALUE_92B0_MODE_2 ||
      mode269c8 == ISAAC_ROOM_VALUE_92B0_MODE_3) {
    acc = __builtin_bit_cast(float, ISAAC_ROOM_VALUE_92B0_ONE_BITS);
    const uint32_t e = (mode269c8 == ISAAC_ROOM_VALUE_92B0_MODE_3)
                           ? ISAAC_ROOM_VALUE_92B0_MODE_3_E
                           : ISAAC_ROOM_VALUE_92B0_MODE_2_E;
    if (count18334 < e) {
      acc = 0.0f;
    }
  }
  return acc; /* fld [esp+0xc] -> ST0 @0x7f96dd */
}

extern "C" uint32_t isaac_room_trigger_clear_audio_83b0_door_flag_store(
    uint32_t flags, uint32_t door_magic) {
  /* 0x7f8d94 cmp eax,0xe / jne 0x7f8da8; 0x7f8da8 cmp eax,0xf / jne
     0x7f8dc6 — FULL-dword compares on [slot+8]. 0xe -> [game+0x26548]
     |= 0x20 @0x7f8d9f; 0xf -> |= 1 @0x7f8db3; else no store. The
     [game+0x2654c] self-store @0x7f8dba/0x7f8dc0 is a no-op identity. */
  uint32_t out = flags;
  if (door_magic == ISAAC_ROOM_VALUE_92B0_DOOR_MAGIC_E) {
    out = out | ISAAC_ROOM_VALUE_92B0_DOOR_FLAG_20;
  } else if (door_magic == ISAAC_ROOM_VALUE_92B0_DOOR_MAGIC_F) {
    out = out | ISAAC_ROOM_VALUE_92B0_DOOR_FLAG_1;
  }
  return out;
}

extern "C" uint32_t isaac_room_trigger_clear_audio_83b0_tail_rng_fatal(
    uint32_t seed) {
  /* 0x7f91bf test edx,edx / jne 0x7f91dd: seed==0 -> HOST fatal
     0xa112c0(0x10, 0xb6bf54) + int3, body resumes with the 0 seed. */
  return (seed == 0u) ? 1u : 0u;
}

extern "C" uint32_t isaac_room_trigger_clear_audio_83b0_tail_rng_next(
    uint32_t seed, uint32_t s1, uint32_t s2, uint32_t s3) {
  /* 0x7f91dd..0x7f9201: dynamic-register xorshift. Each shift register
     is a DWORD read but only CL feeds shr/shl, so the effective count
     is ((sN & 0xff) & 31) — byte gate + CPU mod-32 mask. Store-back
     [game+0x182e4] = out @0x7f9201. */
  const uint32_t c1 = (s1 & 0xffu) & 31u;
  const uint32_t c2 = (s2 & 0xffu) & 31u;
  const uint32_t c3 = (s3 & 0xffu) & 31u;
  uint32_t t1 = seed ^ (seed >> c1);
  uint32_t t2 = t1 ^ (t1 << c2);
  const uint32_t out = t2 ^ (t2 >> c3);
  return out;
}

/* ---------- toolchain defect guard (v70: no narrow scalar params) ----- */
template <typename... Ts>
struct room_value_92b0_has_narrow_scalar;
template <>
struct room_value_92b0_has_narrow_scalar<> {
  static constexpr bool value = false;
};
template <typename T, typename... Ts>
struct room_value_92b0_has_narrow_scalar<T, Ts...> {
  static constexpr bool value =
      (__is_same(T, uint8_t) || __is_same(T, uint16_t)) ||
      room_value_92b0_has_narrow_scalar<Ts...>::value;
};
template <typename R, typename... Ps>
struct room_value_92b0_has_narrow_scalar<R(Ps...)> {
  static constexpr bool value =
      room_value_92b0_has_narrow_scalar<Ps...>::value;
};

#define ISAAC_ROOM_VALUE_92B0_NO_NARROW_PARAMS(FN)                          \
  static_assert(!room_value_92b0_has_narrow_scalar<decltype(FN)>::value,    \
                #FN " must not take a uint8_t/uint16_t scalar parameter")

ISAAC_ROOM_VALUE_92B0_NO_NARROW_PARAMS(isaac_room_value_92b0_va);
ISAAC_ROOM_VALUE_92B0_NO_NARROW_PARAMS(isaac_room_value_92b0_ret_va);
ISAAC_ROOM_VALUE_92B0_NO_NARROW_PARAMS(isaac_room_value_92b0_end_va);
ISAAC_ROOM_VALUE_92B0_NO_NARROW_PARAMS(isaac_room_value_92b0);
ISAAC_ROOM_VALUE_92B0_NO_NARROW_PARAMS(isaac_room_value_92b0_stage_scale);
ISAAC_ROOM_VALUE_92B0_NO_NARROW_PARAMS(
    isaac_room_trigger_clear_audio_83b0_door_flag_store);
ISAAC_ROOM_VALUE_92B0_NO_NARROW_PARAMS(
    isaac_room_trigger_clear_audio_83b0_tail_rng_fatal);
ISAAC_ROOM_VALUE_92B0_NO_NARROW_PARAMS(
    isaac_room_trigger_clear_audio_83b0_tail_rng_next);

/* ------------------------------------------------------------------ v71 - */
/* 0x7f96f0 StatHUD luck/chance leaf (plain `ret` ST0 float, NO args/receiver)
   + FUN_007f83b0 ALT-tail door-walk selection 0x7f8c0f..0x7f8d81 +
   the StatHUD clamp/gate recipe 0x84cb4d..0x84cb86 / 0x84d18e..0x84d1c7.
   Census in section-notes/room-v71-7f96f0/NOTES.md §4. Host leaves
   (FCO 0x9be080 x6, 0xa112c0 door-seed fatal) stay typed; NO narrow
   scalar params (all byte gates re-narrow in the body). */

extern "C" uint32_t isaac_room_luck_96f0_va(void) {
  return ISAAC_ROOM_LUCK_96F0_VA;
}
extern "C" uint32_t isaac_room_luck_96f0_ret_va(void) {
  return ISAAC_ROOM_LUCK_96F0_RET_VA;
}
extern "C" uint32_t isaac_room_luck_96f0_end_va(void) {
  return ISAAC_ROOM_LUCK_96F0_END_VA;
}

/* SSE MAXSS/MINSS helpers: MAXSS xmm1,xmm2 -> (xmm1 >= xmm2) ? xmm1 :
   xmm2 (equal INCLUDING -0.0 keeps xmm1; NaN -> xmm2). MINSS -> (xmm1
   <= xmm2) ? xmm1 : xmm2. Do NOT use std::max/std::min (they fold the
   -0.0/NaN edges differently). */
static inline float room_luck_96f0_sse_maxss(float a, float b) {
  return (a >= b) ? a : b;
}
static inline float room_luck_96f0_sse_minss(float a, float b) {
  return (a <= b) ? a : b;
}

extern "C" float isaac_room_luck_96f0(
    uint32_t flags26548, uint32_t owner_ee, uint32_t owner_ef,
    uint32_t owner_248, uint32_t count26570, uint32_t flags1839c,
    uint32_t f182f4_bits, uint32_t owner_259, uint32_t owner_248b,
    uint32_t game26568, uint32_t owner_1f3) {
  /* PE 0x7f96f0..0x7f9955. acc init 0.5f (movss [0xbaa2d0] @0x7f96fc).
     All lerps acc + (1-acc)*k with per-op f32 rounding (addss/mulss). */
  const float init = __builtin_bit_cast(
      float, ISAAC_ROOM_LUCK_96F0_INIT_BITS); /* 0.5f @0x7f96fc */
  float acc = init;
  /* G0 (0x7f9717..0x7f9733): flags&0x40 jne skip; flags&1 jne skip;
     both clear -> acc = 1.0f (movss [0xbaa454]). FULL-dword bit tests. */
  if ((flags26548 & ISAAC_ROOM_LUCK_96F0_FLAGS_BIT_40) == 0u &&
      (flags26548 & ISAAC_ROOM_LUCK_96F0_FLAGS_BIT_1) == 0u) {
    acc = __builtin_bit_cast(float, ISAAC_ROOM_LUCK_96F0_ONE_BITS);
  }
  /* G1/G2/G3 (0x7f9746/0x7f9785/0x7f97c1): FCO owners 0xee/0xef/0x248
     FULL-dword tests; each lerp 0.25f. */
  if (owner_ee != 0u) {
    acc = acc + (1.0f - acc) *
                    __builtin_bit_cast(float, ISAAC_ROOM_LUCK_96F0_Q_BITS);
  }
  if (owner_ef != 0u) {
    acc = acc + (1.0f - acc) *
                    __builtin_bit_cast(float, ISAAC_ROOM_LUCK_96F0_Q_BITS);
  }
  if (owner_248 != 0u) {
    acc = acc + (1.0f - acc) *
                    __builtin_bit_cast(float, ISAAC_ROOM_LUCK_96F0_Q_BITS);
  }
  /* G4 (0x7f97f9): cmp [game+0x26570],9 / jle SIGNED -> (int32) > 9;
     lerp 0.5f. */
  if (static_cast<int32_t>(count26570) > 9) {
    acc = acc + (1.0f - acc) *
                    __builtin_bit_cast(float, ISAAC_ROOM_LUCK_96F0_H_BITS);
  }
  /* G5 (0x7f9820): flags1839c bit 2 -> lerp 0.25f. */
  if (flags1839c & ISAAC_ROOM_LUCK_96F0_1839C_BIT_2) {
    acc = acc + (1.0f - acc) *
                    __builtin_bit_cast(float, ISAAC_ROOM_LUCK_96F0_Q_BITS);
  }
  /* G6 (0x7f9839..0x7f9881): bit3 = (flags>>3)&1, bit4 = bit 0x10
     (shr/setne/cmp cl,al -> XOR gate). If differ: bit 8 -> += 0.1f;
     bit 0x10 -> -= 0.1f (SUBSS @0x7f987d). Literal 0.1f: see the v70
     A9 0x3dcccccd toolchain note (bits are exactly 0x3dcccccd). */
  const uint32_t bit3 = (flags1839c >> 3) & 1u;
  const uint32_t bit4 = (flags1839c >> 4) & 1u;
  if (bit3 != bit4) {
    if (flags1839c & ISAAC_ROOM_LUCK_96F0_1839C_BIT_8) {
      acc = acc + (1.0f - acc) * 0.1f;
    }
    if (flags1839c & ISAAC_ROOM_LUCK_96F0_1839C_BIT_10) {
      acc = acc - (1.0f - acc) * 0.1f;
    }
  }
  /* G7 (0x7f9886..0x7f9915): f = [game+0x182f4]; comiss f,0.0 / ja
     0x7f98fb -> LERP iff f > 0.0 ORDERED (NaN -> block entered). Block:
     FCO(0x259): owner259 && flags26548&0x20 -> LERP; FCO(0x248) 2nd:
     owner248b -> LERP; else acc = 0 unless (flags26548&0x20 &&
     [game+0x26568]==0) keeps acc UNCHANGED (je 0x7f991a skips the
     acc store @0x7f98f4). */
  const float f = __builtin_bit_cast(float, f182f4_bits);
  if (f > 0.0f) {
    acc = acc + (1.0f - acc) * f;
  } else if ((owner_259 != 0u &&
              (flags26548 & ISAAC_ROOM_LUCK_96F0_FLAGS_BIT_20) != 0u) ||
             owner_248b != 0u) {
    acc = acc + (1.0f - acc) * f;
  } else {
    if ((flags26548 & ISAAC_ROOM_LUCK_96F0_FLAGS_BIT_20) == 0u ||
        game26568 != 0u) {
      acc = 0.0f;
    }
  }
  /* G8 (0x7f9928..0x7f994a): FCO(0x1f3) FULL-dword -> result = 77.0f
     (0xbaa994) else acc; maxss 0.0 / minss 1.0 clamp. */
  float result = (owner_1f3 != 0u)
                     ? __builtin_bit_cast(
                           float, ISAAC_ROOM_LUCK_96F0_1F3_RESULT_BITS)
                     : acc;
  result = room_luck_96f0_sse_maxss(
      result, __builtin_bit_cast(float, ISAAC_ROOM_LUCK_96F0_ZERO_BITS));
  result = room_luck_96f0_sse_minss(
      result, __builtin_bit_cast(float, ISAAC_ROOM_LUCK_96F0_ONE_BITS));
  return result; /* ST0 @0x7f9955 */
}

extern "C" uint32_t isaac_room_trigger_clear_audio_83b0_door_walk_seed_fatal(
    uint32_t seed) {
  /* 0x7f8c4e test eax,eax / jne 0x7f8c6b: seed==0 -> HOST fatal
     0xa112c0(0x10, 0xb6bf54) + int3, body resumes with the 0 seed
     (sel = 0 & 7 = 0). */
  return (seed == 0u) ? 1u : 0u;
}

/* Bitmap bit test: the PE indexes dwords at [base + (idx>>5)*4 + 0x38]
   with ARITHMETIC idx>>5. p0 = the dword for esi==0 (offset +0x38),
   p1 = the dword for esi odd (bm1: +0x3c for idx>=32; bm2: +0x34 for
   idx2<0). */
static inline int32_t room_tca83b0_dw_bitmap_bit(uint32_t p0, uint32_t p1,
                                                 int32_t idx) {
  const int32_t esi = idx >> 5;
  const uint32_t word = ((esi & 1) != 0) ? p1 : p0;
  return ((word & (1u << (idx & 0x1f))) != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_room_trigger_clear_audio_83b0_door_walk_select(
    uint32_t game18308, uint32_t game1831c, uint32_t fixed_slot_free,
    uint32_t bm1_38, uint32_t bm1_3c, uint32_t bm2_38, uint32_t bm2_34,
    uint32_t seed, uint32_t mode269c8, uint32_t slot_free_mask) {
  /* 0x7f8be4..0x7f8d81 (law span 0x7f8c0f..0x7f8d81). FIXED path iff
     [game+0x18308]==-1 && (int32)[game+0x1831c] >= 0 (jne/js 0x7f8c29):
     bm1 bit + [room+idx*4+0x724]==0 (fixed_slot_free capture) ->
     jmp 0x7f8d89 success. */
  if (game18308 == 0xffffffffu &&
      static_cast<int32_t>(game1831c) >= 0) {
    const int32_t idx = static_cast<int32_t>(game1831c);
    if (room_tca83b0_dw_bitmap_bit(bm1_38, bm1_3c, idx) != 0 &&
        fixed_slot_free != 0u) {
      return idx;
    }
  }
  /* RANDOM: xorshift32 {2,5,0x15} (0x7f8c6b..0x7f8c8b; shifts from
     qword 0xb1f540 + dword 0xb1f548) -> sel = x & 7; mode FULL-dword
     2/3 -> sel = 4 REPLACE (0x7f8c91..0x7f8ca6). */
  uint32_t t = seed;
  t ^= t >> ISAAC_ROOM_TCA83B0_DOOR_WALK_SHIFT_LO;
  t ^= t << ISAAC_ROOM_TCA83B0_DOOR_WALK_SHIFT_MID;
  t ^= t >> ISAAC_ROOM_TCA83B0_DOOR_WALK_SHIFT_HI;
  int32_t sel = static_cast<int32_t>(t & 7u);
  if (mode269c8 == ISAAC_ROOM_TCA83B0_DOOR_WALK_MODE_2 ||
      mode269c8 == ISAAC_ROOM_TCA83B0_DOOR_WALK_MODE_3) {
    sel = static_cast<int32_t>(ISAAC_ROOM_TCA83B0_DOOR_WALK_SEL_GREED);
  }
  /* PASS1 (0x7f8cb0..0x7f8d29): idx = smod8(sel+i); bm1 bit AND bm2 bit
     smod4(idx+2) AND slot free -> success if idx >= 0 (jns 0x7f8d89),
     else fall into PASS2 (i reset). */
  for (int32_t i = 0; i < ISAAC_ROOM_TCA83B0_DOOR_WALK_MOD_8; ++i) {
    const int32_t idx = isaac_room_trigger_clear_audio_signed_mod(
        static_cast<uint32_t>(sel + i),
        static_cast<uint32_t>(ISAAC_ROOM_TCA83B0_DOOR_WALK_MOD_8));
    if (room_tca83b0_dw_bitmap_bit(bm1_38, bm1_3c, idx) != 0) {
      const int32_t idx2 = isaac_room_trigger_clear_audio_signed_mod(
          static_cast<uint32_t>(idx + 2),
          static_cast<uint32_t>(ISAAC_ROOM_TCA83B0_DOOR_WALK_MOD_4));
      if (room_tca83b0_dw_bitmap_bit(bm2_38, bm2_34, idx2) != 0) {
        if (((slot_free_mask >> (idx & 7)) & 1u) != 0u) {
          if (idx >= 0) {
            return idx;
          }
          break; /* negative idx -> PASS2 entry (i reset) */
        }
      }
    }
  }
  /* PASS2 (0x7f8d2f..0x7f8d81): idx = smod8(sel+i); bm1 bit AND slot
     free -> success if idx >= 0 (js 0x7f84e7 fail), else fail. */
  for (int32_t i = 0; i < ISAAC_ROOM_TCA83B0_DOOR_WALK_MOD_8; ++i) {
    const int32_t idx = isaac_room_trigger_clear_audio_signed_mod(
        static_cast<uint32_t>(sel + i),
        static_cast<uint32_t>(ISAAC_ROOM_TCA83B0_DOOR_WALK_MOD_8));
    if (room_tca83b0_dw_bitmap_bit(bm1_38, bm1_3c, idx) != 0) {
      if (((slot_free_mask >> (idx & 7)) & 1u) != 0u) {
        if (idx >= 0) {
          return idx;
        }
        return -1;
      }
    }
  }
  return -1; /* jmp 0x7f84e7 fail */
}

extern "C" float isaac_room_value_92b0_hud_clamp_gate(
    uint32_t value_bits, uint32_t gate749830) {
  /* 0x84cb4d..0x84cb86 + 0x84d18e..0x84d1c7 (identical): maxss 0.0
     (0xba9fe4); minss 1.0 (0xbaa454); call 0x749830; test al,al / jne
     -> keep; else xorps -> value = 0.0. SSE MAXSS/MINSS semantics
     (see the v71 luck clamp). */
  float v = __builtin_bit_cast(float, value_bits);
  v = room_luck_96f0_sse_maxss(
      v, __builtin_bit_cast(float, ISAAC_ROOM_VALUE_92B0_HUD_MAX_BITS));
  v = room_luck_96f0_sse_minss(
      v, __builtin_bit_cast(float, ISAAC_ROOM_VALUE_92B0_HUD_MIN_BITS));
  if (gate749830 == 0u) {
    v = 0.0f;
  }
  return v;
}

extern "C" uint32_t
isaac_room_trigger_clear_audio_83b0_door_walk_music_count(
    uint32_t rnd, uint32_t bm1_38, uint32_t bm1_3c,
    uint32_t slot_free_mask) {
  /* 0x7f85c0..0x7f8634 (MUSIC-path collect walk, INSIDE the v69 body;
     packed entry 0x7f8509). Per i in 0..7 (SIGNED jl @0x7f8631/
     0x7f8634): idx = smod8(rnd+i) (0x7f85c0..0x7f85d1, u32 add
     0x7f85c3); bm1 bit idx (0x7f85f3 FULL-dword test, word idx>>5
     ARITHMETIC — idx 0..7 -> word 0 = bm1_38); slot
     [room+idx*4+0x724]==0 (0x7f85ff FULL dword). count =
     SAR(end-begin,2) @0x7f863d == number of qualifying residues
     (the vec host 0x42c880/0x42c920 is bookkeeping: smod8 over 8
     consecutive ints yields 8 DISTINCT residues, no duplicates). */
  uint32_t count = 0u;
  for (int32_t i = 0; i < ISAAC_ROOM_TCA83B0_DOOR_WALK_MUSIC_ITER; ++i) {
    const int32_t idx = isaac_room_trigger_clear_audio_signed_mod(
        rnd + static_cast<uint32_t>(i),
        static_cast<uint32_t>(ISAAC_ROOM_TCA83B0_DOOR_WALK_MOD_8));
    if (room_tca83b0_dw_bitmap_bit(bm1_38, bm1_3c, idx) != 0) {
      if (((slot_free_mask >> (idx & 7)) & 1u) != 0u) {
        ++count;
      }
    }
  }
  return count; /* SAR (end-begin)>>2 @0x7f863d */
}

extern "C" uint32_t
isaac_room_trigger_clear_audio_83b0_door_walk_music_continue(
    uint32_t count) {
  /* 0x7f8640 cmp eax,2 / 0x7f8643 jb 0x7f8b2f — UNSIGNED: the body
     continues iff (u32)count >= 2 (count=0xffffffff CONTINUES); skip
     exit 0x7f8b2f stores [ebp-4]=-1 + vec dtor then falls into the
     ALT door-walk label 0x7f8b80. */
  return (count >= ISAAC_ROOM_TCA83B0_DOOR_WALK_MUSIC_MIN_COUNT) ? 1u : 0u;
}

/* ------------------------------------------------------------------ v73 - */
/* 0x7f9960..0x7f9de6 devil/angel room selection + door-create tail (SEH,
   ret 8, 2 byte args; ROOM-side twin of Level::InitializeDevilAngelRoom
   0x7499a0; returns bool; 19 E8 + 1 indirect vtable @0x7f9d56; 5 direct
   callers — census in section-notes/room-v73-devilangel/NOTES.md §4).
   ALL SIGNED compares use explicit int32 casts (wasm32 compare-flip
   class: the wasm build must emit the i64 sign-extend compare form);
   byte gates are & 0xff on u32 params; no byte-width params. */

extern "C" uint32_t isaac_room_devil_angel_9960_init_gates(
    uint32_t force_devil, uint32_t game26584, uint32_t room_type,
    uint32_t bm1base_10, uint32_t host74ea50, uint32_t game_state,
    uint32_t game2654c, uint32_t game1830c, uint32_t host_room8_740bc0,
    uint32_t game18314, uint32_t host74e9b0) {
  /* Phase A 0x7f998a..0x7f9a28 (skipped entirely when ForceDevil:
     cmp byte [ebp+0xc],0 / jne 0x7f9a2e). A1 [G+0x26584]==0x2c (je);
     A2 [room+8]==5 && [[room4+0x10]+0x10]==0x59 && HOST 0x74ea50
     al!=0; A3 state (s32) in [1,6] (jl/jg SIGNED) && [G+0x2654c] &
     0x10000 (xor/or/jne); A4 [G+0x1830c]!=0; A5 HOST GetRoomByIdx
     0x740bc0 [ret+8] != [G+0x18314]; A6 HOST 0x74e9b0 al != 0. */
  if ((force_devil & 0xffu) != 0u) {
    return 1u;
  }
  if (game26584 == ISAAC_ROOM_DEVIL_ANGEL_9960_GAME_26584_GATE) {
    return 0u;
  }
  if (room_type == ISAAC_ROOM_DEVIL_ANGEL_9960_ROOM_TYPE_GATE &&
      bm1base_10 == ISAAC_ROOM_DEVIL_ANGEL_9960_BM1BASE_10_GATE &&
      (host74ea50 & 0xffu) != 0u) {
    return 0u;
  }
  const int32_t state = static_cast<int32_t>(game_state);
  if (state >= static_cast<int32_t>(ISAAC_ROOM_DEVIL_ANGEL_9960_STATE_MIN) &&
      state <= static_cast<int32_t>(ISAAC_ROOM_DEVIL_ANGEL_9960_STATE_MAX)) {
    if ((game2654c & ISAAC_ROOM_DEVIL_ANGEL_9960_2654C_BIT_10000) != 0u) {
      return 0u;
    }
  }
  if (game1830c != 0u) {
    return 0u;
  }
  if (host_room8_740bc0 != game18314) {
    return 0u;
  }
  if ((host74e9b0 & 0xffu) != 0u) {
    return 0u;
  }
  return 1u;
}

extern "C" uint32_t isaac_room_devil_angel_9960_state_inc(
    uint32_t force_devil, uint32_t game_state, uint32_t host6f9400,
    uint32_t host6f95a0, uint32_t game26550, uint32_t game_c) {
  /* Phase B 0x7f9a2e..0x7f9a64: t = (~h2) & (h1 | [G+0x26550] |
     [G+0xc]) (not eax / and eax,edi); test al,2 (BYTE gate bit 1) ->
     state = [G] + 1 (inc @0x7f9a5a, u32 wrap); ForceDevil byte ->
     ok; else cmp eax,6 / jne -> fail. */
  const uint32_t t =
      (~host6f95a0) & (host6f9400 | game26550 | game_c);
  const uint32_t state2 =
      game_state + (((t & 2u) != 0u) ? 1u : 0u);
  if ((force_devil & 0xffu) != 0u) {
    return 1u;
  }
  return (state2 == 6u) ? 1u : 0u;
}

extern "C" uint32_t isaac_room_devil_angel_9960_slot_mark_pass(
    uint32_t slot_f394_neg5_mask) {
  /* Phase C 0x7f9a6a..0x7f9a8c: per slot i in 0..7 (SIGNED jl):
     [room+i*4+0x724] != 0 && (s32)[slot+0x394] == -5 (cmp / je
     0x7f9b14) -> return 0. Mask = 8-slot capture (bit i). */
  return ((slot_f394_neg5_mask & 0xffu) == 0u) ? 1u : 0u;
}

extern "C" uint32_t isaac_room_devil_angel_9960_force_angel_combine(
    uint32_t force_angel, uint32_t owner226) {
  /* 0x7f9aa1 movzx ecx, byte [ebp+8]; test eax,eax (FCO 0x226 result
     @0x7f9a9c); mov edx,1; cmovne ecx,edx @0x7f9ab1; store dword
     [ebp+8] @0x7f9ab4. fa' nonzero iff owner226 != 0 || (fa & 0xff)
     != 0; both later uses are byte tests. */
  return ((owner226 != 0u) || ((force_angel & 0xffu) != 0u)) ? 1u : 0u;
}

extern "C" uint32_t isaac_room_devil_angel_9960_proceed(
    uint32_t force_angel, uint32_t force_devil, uint32_t game264fc,
    uint32_t game26500) {
  /* Phase D1..D3 0x7f9aeb..0x7f9b03: (s32)[G+0x264fc] <=
     (s32)[G+0x26500] (jle SIGNED @0x7f9af7) || byte fa' != 0 ||
     byte ForceDevil != 0 -> select tail; else host fatal
     0xb6c634 + return 0. */
  if (static_cast<int32_t>(game264fc) <= static_cast<int32_t>(game26500)) {
    return 1u;
  }
  if ((force_angel & 0xffu) != 0u || (force_devil & 0xffu) != 0u) {
    return 1u;
  }
  return 0u;
}

extern "C" uint32_t isaac_room_devil_angel_9960_seed_fatal(uint32_t seed) {
  /* 0x7f9b7a..0x7f9b8d: test edi,edi / jne — seed==0 -> HOST fatal
     0xa112c0(0x10, 0xb6bf54) @0x7f9b85 + int3 @0x7f9b8d, body resumes
     with the 0 seed (sel = 0 & 7 = 0). Same law shape as the v71 V8
     door-walk seed fatal, NEW site. */
  return (seed == 0u) ? 1u : 0u;
}

extern "C" int32_t isaac_room_devil_angel_9960_select(
    uint32_t game18308, uint32_t game1831c, uint32_t fixed_slot_free,
    uint32_t bm1_38, uint32_t slot_free_mask, uint32_t seed) {
  /* Phase E 0x7f9b3e..0x7f9bfc. FIXED iff [G+0x18308]==-5 (cmp / jne
     0x7f9b5f) && (s32)[G+0x1831c] >= 0 (js) && [room+idx*4+0x724]==0
     (je 0x7f9c04; fixed_slot_free capture, idx UNBOUNDED — no bm1
     test, no smod8): idx = [G+0x1831c]. RANDOM: xorshift32 {1,0xb,
     0x10} (qword 0xb1f504 + dword 0xb1f50c — NOT the 83b0
     {2,5,0x15}) -> sel = x & 7; ONE pass i in 0..7 (SIGNED jl):
     idx = smod8(sel+i) (v69 L10 helper); bm1 bit (logical idx>>5 ==
     0 -> word +0x38 only; NO bm2, NO mode override) AND slot free
     (mask bit idx&7) -> idx; NO match -> idx = smod8(sel+7) LAST
     TRIED (the js @0x7f9bfc guard is dead for sel 0..7; the body
     NEVER fails — no -1 path). */
  if (game18308 == ISAAC_ROOM_DEVIL_ANGEL_9960_MARK_NEG5 &&
      static_cast<int32_t>(game1831c) >= 0 && fixed_slot_free != 0u) {
    return static_cast<int32_t>(game1831c);
  }
  uint32_t t = seed;
  t ^= t >> ISAAC_ROOM_DEVIL_ANGEL_9960_SHIFT_LO;
  t ^= t << ISAAC_ROOM_DEVIL_ANGEL_9960_SHIFT_MID;
  t ^= t >> ISAAC_ROOM_DEVIL_ANGEL_9960_SHIFT_HI;
  const int32_t sel = static_cast<int32_t>(t & 7u);
  for (int32_t i = 0; i < ISAAC_ROOM_DEVIL_ANGEL_9960_ITER; ++i) {
    const int32_t idx = isaac_room_trigger_clear_audio_signed_mod(
        static_cast<uint32_t>(sel + i),
        static_cast<uint32_t>(ISAAC_ROOM_TCA83B0_DOOR_WALK_MOD_8));
    if (room_tca83b0_dw_bitmap_bit(bm1_38, 0u, idx) != 0) {
      if (((slot_free_mask >> (idx & 7)) & 1u) != 0u) {
        return idx; /* je 0x7f9bfc success (idx 0..7) */
      }
    }
  }
  /* Loop exhausted: last tried idx (esi at 0x7f9bfc). */
  return isaac_room_trigger_clear_audio_signed_mod(
      static_cast<uint32_t>(sel + (ISAAC_ROOM_DEVIL_ANGEL_9960_ITER - 1)),
      static_cast<uint32_t>(ISAAC_ROOM_TCA83B0_DOOR_WALK_MOD_8));
}

extern "C" uint32_t isaac_room_devil_angel_9960_angel_proximity(
    uint32_t slot_24, uint32_t room_c, uint32_t roomv_28,
    uint32_t roomv_2c, uint32_t roomv_33c, uint32_t roomv_340) {
  /* Phase F3 0x7f9cf3..0x7f9d50 (per member of the [room+0x125c] vec,
     UNSIGNED jb loop @0x7f9d76 host-side): gate = roomv_28 == 0x2d
     && roomv_2c == 0 && 2500.0f > dist2 ORDERED (comiss xmm1,xmm0 /
     jbe 0x7f9d61 skip; NaN dist2 -> skip) -> HOST vtable call
     roomv->vt[0x28] @0x7f9d56 (result ignored). q = (s32)slot->0x24
     / (s32)[curRoom+0xc] IDIV SIGNED (0x7f9d09 cdq / 0x7f9d0a idiv;
     law contract: room_c != 0 and NOT (slot_24 == INT_MIN &&
     room_c == -1) else the PE #DEs). dy = f32(f32((float)r * 40.0f
     + 40.0f) - (float)roomv_33c); dx = f32(f32((float)q * 40.0f +
     120.0f) - (float)roomv_340); dist2 = f32(f32(dx*dx) +
     f32(dy*dy)) — per-op f32 rounding (mulss/addss/subss/
     cvtsi2ss; 40.0f/120.0f/2500.0f = 0xbaa904/0xbaaa00/0xbaabf0). */
  if (roomv_28 != ISAAC_ROOM_DEVIL_ANGEL_9960_ANGEL_ATTR ||
      roomv_2c != 0u) {
    return 0u;
  }
  const int32_t a = static_cast<int32_t>(slot_24);
  const int32_t d = static_cast<int32_t>(room_c);
  const int32_t q = a / d;
  const int32_t r = a % d;
  const float k = __builtin_bit_cast(float, ISAAC_ROOM_DEVIL_ANGEL_9960_K40_BITS);
  /* Statement-per-op f32 rounding (mulss/addss/subss @0x7f9d15..0x7f9d31);
     no fp-contraction across statements. */
  float dy = static_cast<float>(r) * k;
  dy += k;
  dy -= __builtin_bit_cast(float, roomv_33c);
  float dx = static_cast<float>(q) * k;
  dx += __builtin_bit_cast(float, ISAAC_ROOM_DEVIL_ANGEL_9960_ADD120_BITS);
  dx -= __builtin_bit_cast(float, roomv_340);
  float dist2 = dx * dx;
  dist2 += dy * dy; /* addss xmm0,xmm1: dx*dx rounded, dy*dy rounded */
  const float thresh =
      __builtin_bit_cast(float, ISAAC_ROOM_DEVIL_ANGEL_9960_THRESH_BITS);
  return (thresh > dist2) ? 1u : 0u; /* comiss / jbe NOT taken */
}

/* ---------- toolchain defect guard (v71: no narrow scalar params) ----- */
template <typename... Ts>
struct room_v71_has_narrow_scalar;
template <>
struct room_v71_has_narrow_scalar<> {
  static constexpr bool value = false;
};
template <typename T, typename... Ts>
struct room_v71_has_narrow_scalar<T, Ts...> {
  static constexpr bool value =
      (__is_same(T, uint8_t) || __is_same(T, uint16_t)) ||
      room_v71_has_narrow_scalar<Ts...>::value;
};
template <typename R, typename... Ps>
struct room_v71_has_narrow_scalar<R(Ps...)> {
  static constexpr bool value = room_v71_has_narrow_scalar<Ps...>::value;
};

#define ISAAC_ROOM_V71_NO_NARROW_PARAMS(FN)                               \
  static_assert(!room_v71_has_narrow_scalar<decltype(FN)>::value,         \
                #FN " must not take a uint8_t/uint16_t scalar parameter")

ISAAC_ROOM_V71_NO_NARROW_PARAMS(isaac_room_luck_96f0_va);
ISAAC_ROOM_V71_NO_NARROW_PARAMS(isaac_room_luck_96f0_ret_va);
ISAAC_ROOM_V71_NO_NARROW_PARAMS(isaac_room_luck_96f0_end_va);
ISAAC_ROOM_V71_NO_NARROW_PARAMS(isaac_room_luck_96f0);
ISAAC_ROOM_V71_NO_NARROW_PARAMS(
    isaac_room_trigger_clear_audio_83b0_door_walk_seed_fatal);
ISAAC_ROOM_V71_NO_NARROW_PARAMS(
    isaac_room_trigger_clear_audio_83b0_door_walk_select);
ISAAC_ROOM_V71_NO_NARROW_PARAMS(
    isaac_room_value_92b0_hud_clamp_gate);

/* ---------- toolchain defect guard (v72: no narrow scalar params) ----- */
template <typename... Ts>
struct room_v72_has_narrow_scalar;
template <>
struct room_v72_has_narrow_scalar<> {
  static constexpr bool value = false;
};
template <typename T, typename... Ts>
struct room_v72_has_narrow_scalar<T, Ts...> {
  static constexpr bool value =
      (__is_same(T, uint8_t) || __is_same(T, uint16_t)) ||
      room_v72_has_narrow_scalar<Ts...>::value;
};
template <typename R, typename... Ps>
struct room_v72_has_narrow_scalar<R(Ps...)> {
  static constexpr bool value = room_v72_has_narrow_scalar<Ps...>::value;
};

#define ISAAC_ROOM_V72_NO_NARROW_PARAMS(FN)                               \
  static_assert(!room_v72_has_narrow_scalar<decltype(FN)>::value,         \
                #FN " must not take a uint8_t/uint16_t scalar parameter")

ISAAC_ROOM_V72_NO_NARROW_PARAMS(
    isaac_room_trigger_clear_audio_83b0_door_walk_music_count);
ISAAC_ROOM_V72_NO_NARROW_PARAMS(
    isaac_room_trigger_clear_audio_83b0_door_walk_music_continue);

/* ---------- toolchain defect guard (v73: no narrow scalar params) ----- */
template <typename... Ts>
struct room_v73_has_narrow_scalar;
template <>
struct room_v73_has_narrow_scalar<> {
  static constexpr bool value = false;
};
template <typename T, typename... Ts>
struct room_v73_has_narrow_scalar<T, Ts...> {
  static constexpr bool value =
      (__is_same(T, uint8_t) || __is_same(T, uint16_t)) ||
      room_v73_has_narrow_scalar<Ts...>::value;
};
template <typename R, typename... Ps>
struct room_v73_has_narrow_scalar<R(Ps...)> {
  static constexpr bool value = room_v73_has_narrow_scalar<Ps...>::value;
};

#define ISAAC_ROOM_V73_NO_NARROW_PARAMS(FN)                               \
  static_assert(!room_v73_has_narrow_scalar<decltype(FN)>::value,         \
                #FN " must not take a uint8_t/uint16_t scalar parameter")

ISAAC_ROOM_V73_NO_NARROW_PARAMS(isaac_room_devil_angel_9960_init_gates);
ISAAC_ROOM_V73_NO_NARROW_PARAMS(isaac_room_devil_angel_9960_state_inc);
ISAAC_ROOM_V73_NO_NARROW_PARAMS(isaac_room_devil_angel_9960_slot_mark_pass);
ISAAC_ROOM_V73_NO_NARROW_PARAMS(
    isaac_room_devil_angel_9960_force_angel_combine);
ISAAC_ROOM_V73_NO_NARROW_PARAMS(isaac_room_devil_angel_9960_proceed);
ISAAC_ROOM_V73_NO_NARROW_PARAMS(isaac_room_devil_angel_9960_seed_fatal);
ISAAC_ROOM_V73_NO_NARROW_PARAMS(isaac_room_devil_angel_9960_select);
ISAAC_ROOM_V73_NO_NARROW_PARAMS(isaac_room_devil_angel_9960_angel_proximity);

/* ===== v74-v77 law bodies restored (room-v80-7fec00 unit; canonical
   tail lost, re-derived 1:1 from room-pure-model.mjs + header decls;
   PE anchors: room-v74-7f9df0 / room-v75-grid / room-v76-a2a0 /
   room-v77-7fa7d0 notes). Byte gates = uint32_t + &0xff
   (roomDoorCreate9df0InitGates G1..G6; no byte-width params). ===== */

/* v74 W1 init gates (0x7f9e05..0x7f9e6d; whole chain skipped when
   the chain argument is nonzero -> return 1 = reached the pass log
   0x7f9e6f). */
extern "C" uint32_t isaac_room_door_create_9df0_init_gates(
    uint32_t arg, uint32_t host706940_74, uint32_t game18304,
    uint32_t game182d0, uint32_t game_state, uint32_t game1830c,
    uint32_t obj_e7, uint32_t obj_8, uint32_t game26630,
    uint32_t game26589, uint32_t host6dae20) {
  if ((arg & 0xffu) != 0u) {
    return 1u;
  }
  if (game18304 != game182d0) return 0u;      /* G1 */
  if (game_state != 0xbu) return 0u;          /* G2 */
  if (game1830c != 0u) return 0u;             /* G3 */
  if ((obj_e7 & 0xffu) == 0u) {
    if (obj_8 != ISAAC_ROOM_DOOR_CREATE_9DF0_OBJ_8_GATE) {
      return 0u; /* G4b */
    }
  }
  if (game26630 > 0u) {
    /* G5a UNSIGNED ja @0x7f9e55 (compare-flip class) */
  } else if ((game26589 & 0xffu) == 0u) {
    return 0u;                                /* G5b */
  }
  if ((host6dae20 & 0xffu) != 0u) {
    if ((host706940_74 & 0xffu) == 0u) {
      return 0u; /* G6b (dl byte) */
    }
  }
  return 1u;
}

/* v74 W2 slot gate (0x7f9e7e cmp dword [edi+0x728],0 / jne fail):
   slot-1 cell free (FULL dword) -> create proceeds + ret 1. */
extern "C" uint32_t isaac_room_door_create_9df0_slot_gate(uint32_t slot728) {
  return (slot728 == 0u) ? 1u : 0u;
}

/* PE f32 -> int32 cvttss2si parity: trunc toward zero; NaN and
   out-of-int32 -> 0x80000000 indefinite (mirrors the model). */
static int32_t roomGridCvttss2si_s(float v) {
  if (v != v) return (int32_t)(uint32_t)0x80000000u;
  if (v >= 2147483648.0f) return (int32_t)(uint32_t)0x80000000u;
  if (v < -2147483648.0f) return (int32_t)(uint32_t)0x80000000u;
  return (int32_t)v;
}

/* v75 L1 pos->idx: col = trunc((x-40)/40+0.5), row =
   trunc((y-120)/40+0.5), SIGNED bounds, idx = (u32)(w*row+col)
   32-bit wrap; 0xffffffff OOB. */
extern "C" uint32_t isaac_room_grid_pos_index(float x, float y,
                                              uint32_t room_w,
                                              uint32_t room_h) {
  const int32_t col = roomGridCvttss2si_s((x - 40.0f) / 40.0f + 0.5f);
  const int32_t row = roomGridCvttss2si_s((y - 120.0f) / 40.0f + 0.5f);
  if (col < 0 || col >= static_cast<int32_t>(room_w) ||   /* js / jge SIGNED */
      row < 0 || row >= static_cast<int32_t>(room_h)) {
    return 0xffffffffu;
  }
  return static_cast<uint32_t>(static_cast<uint32_t>(room_w) *
                                   static_cast<uint32_t>(row) +
                               static_cast<uint32_t>(col));
}

/* v75 L2 grid-body gate (five ja sites): (u32)idx <= 0x1bf. */
extern "C" uint32_t isaac_room_grid_index_gate(uint32_t idx) {
  return (idx <= ISAAC_ROOM_GRID_INDEX_MAX) ? 1u : 0u;
}

/* v75 L3 9ee0 observable-effect bitmask (bit0 E1 host 0x81e6e0,
   bit1 E2a vtable[0x14] call, bit2 E2b mark [cell_b+4]=2, bit3 E3
   0x384 store + 0x4e45c0, bit4 E4 snap via collision). */
extern "C" uint32_t isaac_room_grid_9ee0_effects(
    uint32_t idx, uint32_t cell_a, uint32_t cell_a_type, uint32_t edi,
    uint32_t edi_type, uint32_t cell_b, uint32_t cell_b_type,
    uint32_t cell_c, uint32_t cell_c_type, uint32_t collision) {
  const uint32_t g = idx <= 0x1bfu ? 1u : 0u;
  uint32_t bits = 0u;
  if (g != 0u && cell_a != 0u && cell_a_type == ISAAC_ROOM_GRID_TYPE_7) {
    bits |= 1u;
  }
  if (g != 0u && cell_b != 0u) {
    bits |= 2u;
    if (cell_b_type == ISAAC_ROOM_GRID_TYPE_5) {
      bits |= 4u;
    }
  }
  if (g != 0u && edi != 0u &&
      edi_type == ISAAC_ROOM_GRID_TYPE_E && cell_c != 0u &&
      cell_c_type != ISAAC_ROOM_GRID_TYPE_SKIP) {
    bits |= 8u;
  }
  if (collision != 0u) {
    bits |= 0x10u;
  }
  return bits;
}

/* v75 L4 a0e0 observable-effect bitmask (bit0 vtable[0x14] call,
   bit1 mark [cell_b+4]=2, bit2 0x384 store + 0x4e45c0, bit3 snap
   flow; idx2 = *arg re-read after the cell_b block's host calls). */
extern "C" uint32_t isaac_room_grid_a0e0_effects(
    uint32_t idx, uint32_t cell_b, uint32_t cell_b_type, uint32_t idx2,
    uint32_t cell_c, uint32_t cell_c_type, uint32_t collision) {
  const uint32_t g1 = (idx <= ISAAC_ROOM_GRID_INDEX_MAX) ? 1u : 0u;
  const uint32_t g2 = (idx2 <= ISAAC_ROOM_GRID_INDEX_MAX) ? 1u : 0u;
  uint32_t bits = 0u;
  if (g1 != 0u && cell_b != 0u) {
    bits |= 1u;
    if (cell_b_type == ISAAC_ROOM_GRID_TYPE_5) {
      bits |= 2u;
    }
  }
  if (g2 != 0u && cell_c != 0u && cell_c_type == ISAAC_ROOM_GRID_TYPE_E &&
      cell_c_type != ISAAC_ROOM_GRID_TYPE_SKIP) {
    bits |= 4u;
  }
  if (collision != 0u) {
    bits |= 8u;
  }
  return bits;
}

/* v76 L2a idx->pos: SIGNED idiv by w (q = trunc(idx/w), r =
   remainder, dividend-sign — x86 idiv parity), x = f32(r)*40+40,
   y = f32(q)*40+120 (cvtdq2ps/mulss/addss f32-exact chain). */
extern "C" void isaac_room_grid_a2a0_idx_to_pos(int32_t idx,
                                                uint32_t room_w,
                                                IsaacRoomGridA2A0Pos* out) {
  const int32_t w = static_cast<int32_t>(room_w);
  const int32_t q = idx / w; /* idiv SIGNED (w != 0; not INT32_MIN/-1) */
  const int32_t r = idx % w;
  const float scale = 40.0f;
  const float base = 120.0f;
  out->x = static_cast<float>(static_cast<float>(r) * scale) + scale;
  out->y = static_cast<float>(static_cast<float>(q) * scale) + base;
}

/* v77 L-A scale pair: cvtdq2ps of the SIGNED int32 bits then mulss
   0.5f (0x3f000000 @0xbaa2d0). */
extern "C" void isaac_room_grid_half_scale(uint32_t w, uint32_t h,
                                           IsaacRoomGridHalfScale* out) {
  out->x = (float)(int32_t)w * 0.5f;
  out->y = (float)(int32_t)h * 0.5f;
}

/* v77 L-B col-major idx: (u32)(w*col + row) 32-bit wrap. The
   (u32)idx <= 0x1bf gate reuses isaac_room_grid_index_gate. */
extern "C" uint32_t isaac_room_grid_half_idx(uint32_t w, uint32_t col,
                                             uint32_t row) {
  const uint32_t idx = w * col + row;
  return idx;
}

/* u32trunc law (0x00aefca0): quality >= 6 -> vcvttss2usi
   (trunc toward zero, saturating: <=0/NaN -> 0, >= 2^32 ->
   0xFFFFFFFF); else manual fallback 0xaefcb0..0xaefce5
   (bit-exact; NaN/negative-large -> 0xFFFFFFFF). */
static uint32_t roomGridF32ToU32Trunc_s(float v, uint32_t quality) {
  if (quality >= 6u) {
    /* vcvttss2usi path */
    if (!(v > 0.0f)) return 0u; /* NaN and negatives -> 0 */
    if (v >= 4294967296.0f) return 0xffffffffu; /* saturate */
    return (uint32_t)v; /* 0 <= v < 2^32: exact trunc */
  }
  /* manual fallback (bit-exact) */
  const uint32_t bits = __builtin_bit_cast(uint32_t, v);
  const uint32_t t = bits << 1; /* shl eax,1 */
  if ((bits & 0x80000000u) != 0u) {
    if (t < 0x7f000000u) return 0u; /* |x| < 1.0f -> trunc 0 */
    return 0xffffffffu;
  }
  if (t < 0x9e000000u) {
    return (uint32_t)(int32_t)v; /* 0 <= x < 2^31: cvttss2si */
  }
  if (t < 0x9f000000u) {
    return ((t << 7) | 0x80000000u);
  }
  return 0xffffffffu;
}

/* v77 L-C dist2: d2 = (scale_x - f32(row))^2 + (scale_y -
   f32(col))^2 (subss/mulss/addss f32-exact) then R2 = 2 *
   u32trunc(d2) (u32 wrap). scale_*_bits = f32 bit patterns. */
extern "C" uint32_t isaac_room_grid_half_dist2(
    uint32_t scale_x_bits, uint32_t scale_y_bits, uint32_t col,
    uint32_t row, uint32_t quality) {
  const float sx = __builtin_bit_cast(float, scale_x_bits);
  const float sy = __builtin_bit_cast(float, scale_y_bits);
  const float r = (float)(int32_t)row;
  const float c = (float)(int32_t)col;
  const float dx = sx - r; /* subss xmm3, xmm0 (row) */
  const float dy = sy - c; /* subss xmm2, xmm1 (col) */
  const float d2 = (dx * dx) + (dy * dy); /* mulss/mulss/addss */
  const uint32_t v = roomGridF32ToU32Trunc_s(d2, quality);
  return v * 2u; /* add eax, eax */
}

/* v77 L-D store law: returns action 0 (no store), 1 ([0x18]=r2,
   [0xc]=1), 2 ([0xc]=2 + HOST 0x714610); field_c == 0 gate. */
extern "C" uint32_t isaac_room_grid_half_cell_store(uint32_t* ent_field_c,
                                                    uint32_t* ent_field_18,
                                                    uint32_t r2) {
  const uint32_t c = *ent_field_c;
  const uint32_t v = r2;
  if (c != 0u) return 0u;
  if (v != 0u) {
    *ent_field_18 = v;
    *ent_field_c = 1u;
    return 1u;
  }
  *ent_field_c = 2u;
  return 2u;
}

/* Host gate: 0x714610 fires iff the store law takes action 2. */
extern "C" uint32_t isaac_room_grid_half_cell_action(uint32_t ent_field_c,
                                                     uint32_t r2) {
  return (ent_field_c == 0u && r2 == 0u) ? 1u : 0u;
}

/* v80 A — Room::Update(Entity*) entity skip gate (PE 0x7fec21..0x7fec9b):
   skip = (type==0x19b && (sub==1 || sub==2))     @0x7fec21/0x7fec30/0x7fec39
        || (flags & 0x80100000) != 0              @0x7fec73 (and eax,0x80100000)
        || (flags & 0x20000000) != 0              @0x7fec93 (and ecx,0x20000000)
   The flags |= 0x100000 store (@0x7fec81/0x7fec8d) happens BEFORE the
   0x20000000 test (PE order) — a 0x20000000 skip DOES store 0x100000.
   Returns 1 = prefix exits (entity update skipped), 0 = prefix passed.
   The [ent+0x16c] reload-store @0x7fec87 is a no-op (not modeled).
   FULL dword cmps; no byte gates. */
extern "C" uint32_t isaac_room_update_entity_skip_gate(
    uint32_t type_28, uint32_t subtype_2c, uint32_t* flags_168) {
  if (type_28 == ISAAC_ROOM_UPDATE_7FEC00_SKIP_TYPE && 
      (subtype_2c == ISAAC_ROOM_UPDATE_7FEC00_SKIP_SUB_A ||
       subtype_2c == ISAAC_ROOM_UPDATE_7FEC00_SKIP_SUB_B)) {
    return 1u;
  }
  const uint32_t f = *flags_168;
  if ((f & ISAAC_ROOM_UPDATE_7FEC00_FLAG_SKIP_A) != 0u) return 1u;
  *flags_168 = f | ISAAC_ROOM_UPDATE_7FEC00_FLAG_SET;
  return (f & ISAAC_ROOM_UPDATE_7FEC00_FLAG_SKIP_B) != 0u ? 1u : 0u;
}

/* v80 B — Room::Update(Entity*) diet flag (PE 0x7fec42..0x7fec64):
   diet = (Game[0x269c8] == 2 || Game[0x269c8] == 3) && Room[8] == 1
   Machine sets byte local [ebp-0x1d] to 1 then 0 @0x7fec5b/0x7fec61
   (single observable value = the AND); consumed at 0x7ff1d8/0x7ff861.
   FULL dword cmps both; result modeled uint32_t 0/1. */
extern "C" uint32_t isaac_room_update_diet_flag(uint32_t game_269c8,
                                                uint32_t room_type_8) {
  if (game_269c8 != ISAAC_ROOM_UPDATE_7FEC00_GAME_269C8_GREED &&
      game_269c8 != ISAAC_ROOM_UPDATE_7FEC00_GAME_269C8_GREEDIER) {
    return 0u;
  }
  return room_type_8 == ISAAC_ROOM_UPDATE_7FEC00_DIET_ROOM_TYPE ? 1u : 0u;
}
/* ---- v81 (ABI bump 80 -> 81): FUN_007f7a40 a1 TAIL (PE 0x7f7e34..
   0x7f817c) + greed-probe band (0x009bf990/9bfa00/9bfa70/9bfae0). The
   tail mirrors: ROT (sign-bit flip + fixed pi/2 with host cos/sin fed
   back), BASE (SIGNED idiv; y = rem*40+40, x = q*40+120), and the
   per-iteration ITEM PLAN (7 genrand draws, u32->f32 via cvtdq2pd(SIGNED)
   + sign-fix addsd, crossed-bases d2, comiss/seta select, lahf/jnp f474
   select, UNSIGNED %10 timer). Probes share the qualifying predicate;
   the parent-frame compare is SIGNED jl. ABI 81. */

namespace {

/* cvtdq2pd treats the dword SIGNED; negatives add 2^32 (addd [eax*8 +
   0xbacb00]); cvtpd2ps rounds once. */
inline float room_tca40_u32_to_f32(uint32_t v) {
  return static_cast<float>(static_cast<double>(static_cast<int64_t>(v)));
}

inline uint32_t greed_probe_qual(const IsaacRoomGreedProbeElem* e) {
  if (e->f2c != 0u || e->f3bc != 0u) return 0u;
  if (e->has_parent == 0u) return 1u;
  if (e->parent_161c == static_cast<int32_t>(ISAAC_ROOM_GREED_PROBE_FRAME_NONE)) {
    return 1u;
  }
  if (!(e->parent_161c < e->self_161c)) return 1u; /* jge -> count */
  return (e->parent_is_self != 0u) ? 1u : 0u;
}

}  // namespace

extern "C" void isaac_room_trigger_clear_audio_7f7a40_tail_rot(
    uint32_t vec0_bits, uint32_t vec4_bits, float cos_angle, float sin_angle,
    IsaacRoomTca40TailRotOut* out) {
  if (out == nullptr) return;
  /* 0x7f7e55..0x7f7ec8: xorps 0xbacb70 SIGN-BIT flip (NOT arithmetic
     negate), then r0 = f32(a*c) - f32(b*s); r1 = f32(a*s) + f32(b*c). */
  const float a = __builtin_bit_cast(float, 
      vec0_bits ^ ISAAC_ROOM_TCA40_SIGN_MASK_BITS);
  const float b = __builtin_bit_cast(float, 
      vec4_bits ^ ISAAC_ROOM_TCA40_SIGN_MASK_BITS);
  out->r0 = (a * cos_angle) - (b * sin_angle);
  out->r1 = (a * sin_angle) + (b * cos_angle);
}

extern "C" void isaac_room_trigger_clear_audio_7f7a40_tail_base(
    int32_t door_f24, int32_t game_c, IsaacRoomTca40TailBaseOut* out) {
  if (out == nullptr) return;
  /* 0x7f7eec..0x7f7f21: SIGNED idiv([door+0x24], [[Game]+0xc]); game_c
     == 0 faults in the PE — div_ok 0, no invented values. */
  if (game_c == 0) {
    out->div_ok = 0u;
    out->x = 0.0f;
    out->y = 0.0f;
    out->quotient = 0;
    out->remainder = 0;
    return;
  }
  const int32_t q = door_f24 / game_c;
  const int32_t r = door_f24 % game_c;
  const float tile = __builtin_bit_cast(float, ISAAC_ROOM_TCA40_TILE_BITS);
  const float tile_add = __builtin_bit_cast(float, ISAAC_ROOM_TCA40_TILE_ADD_BITS);
  /* cvtdq2ps rounds the INT to f32 FIRST, then mulss/addss round the f32
     product; BOTH components scale by 40, only the ADD differs. */
  const float fq = static_cast<float>(q);
  const float fr = static_cast<float>(r);
  out->div_ok = 1u;
  out->y = (fr * tile) + tile;
  out->x = (fq * tile) + tile_add;
  out->quotient = q;
  out->remainder = r;
}

extern "C" void isaac_room_trigger_clear_audio_7f7a40_tail_item_plan(
    const IsaacRoomTca40TailItemSrc* src, IsaacRoomTca40TailItemOut* out) {
  if (out == nullptr) return;
  const float scale = __builtin_bit_cast(float, 
      ISAAC_ROOM_TCA40_SCALE_POW2M32_BITS);
  const float vol_mul = __builtin_bit_cast(float, ISAAC_ROOM_TCA40_VOL_MUL_BITS);
  const float pitch_mul = __builtin_bit_cast(float, ISAAC_ROOM_TCA40_PITCH_MUL_BITS);
  const float thr_mul = __builtin_bit_cast(float, ISAAC_ROOM_TCA40_THR_MUL_BITS);
  const float speed_mul = __builtin_bit_cast(float, ISAAC_ROOM_TCA40_SPEED_MUL_BITS);
  const float one_f = __builtin_bit_cast(float, ISAAC_ROOM_TCA40_ONE_BITS);
  const float two_f = __builtin_bit_cast(float, ISAAC_ROOM_TCA40_TWO_BITS);
  const float a = __builtin_bit_cast(float, src->a_bits);
  const float b = __builtin_bit_cast(float, src->b_bits);
  const float r0 = __builtin_bit_cast(float, src->r0_bits);
  const float r1 = __builtin_bit_cast(float, src->r1_bits);
  const float base_x = __builtin_bit_cast(float, src->base_x_bits);
  const float base_y = __builtin_bit_cast(float, src->base_y_bits);
  const float cos_h = __builtin_bit_cast(float, src->cos_h_bits);
  const float sin_h = __builtin_bit_cast(float, src->sin_h_bits);
  const float px = __builtin_bit_cast(float, src->ent_px_bits);
  const float py = __builtin_bit_cast(float, src->ent_py_bits);
  /* 0x7f7f30..0x7f816c, one loop iteration (PE op order): */
  const float f1 = room_tca40_u32_to_f32(src->r_b) * scale;
  const float m = ((room_tca40_u32_to_f32(src->r_c) * scale) * 2.0f) - one_f;
  const float vel_x = ((f1 * vol_mul) * a) + (r0 * m);
  const float vel_y = ((f1 * vol_mul) * b) + (r1 * m);
  const float height_pre = (room_tca40_u32_to_f32(src->r_d) * scale) * pitch_mul;
  const float speed = room_tca40_u32_to_f32(src->r_e) * scale;
  const float pos_y = base_y + ((cos_h * speed) * speed_mul);
  const float pos_x = base_x + ((sin_h * speed) * speed_mul);
  const float d2 = ((px - base_y) * a) + ((py - base_x) * b);
  const float thr = ((room_tca40_u32_to_f32(src->r_f) * scale) * thr_mul) + two_f;
  /* comiss xmm3(0.0), xmm2(d2) ; seta — CF=0 && ZF=0; NaN -> CF=1 -> 0. */
  const float zero = 0.0f;
  const uint32_t sel = __builtin_isgreater(zero, d2) ? 1u : 0u;
  const float thr_sel = thr * static_cast<float>(sel);
  /* lahf/test ah,0x44/jnp: ONLY exact +-0 jumps to the +1.0 arm. */
  const uint32_t f474_bits =
      (thr_sel == 0.0f) ? ISAAC_ROOM_TCA40_ONE_BITS : ISAAC_ROOM_TCA40_NEG1_BITS;
  const uint32_t timer_value =
      (src->r_g % ISAAC_ROOM_TCA40_TIMER_DIV) + ISAAC_ROOM_TCA40_TIMER_BASE;
  out->f1_bits = __builtin_bit_cast(uint32_t, f1);
  out->m_bits = __builtin_bit_cast(uint32_t, m);
  out->height_pre_bits = __builtin_bit_cast(uint32_t, height_pre);
  out->speed_bits = __builtin_bit_cast(uint32_t, speed);
  out->vel_x_bits = __builtin_bit_cast(uint32_t, vel_x);
  out->vel_y_bits = __builtin_bit_cast(uint32_t, vel_y);
  out->pos_x_bits = __builtin_bit_cast(uint32_t, pos_x);
  out->pos_y_bits = __builtin_bit_cast(uint32_t, pos_y);
  out->d2_bits = __builtin_bit_cast(uint32_t, d2);
  out->thr_bits = __builtin_bit_cast(uint32_t, thr);
  out->sel = sel;
  out->f474_bits = f474_bits;
  out->timer_value = timer_value;
  out->create_type = ISAAC_ROOM_TCA40_CREATE_TYPE;
  out->create_variant = ISAAC_ROOM_TCA40_CREATE_VARIANT;
  out->call_428b20_va = ISAAC_ROOM_TCA40_HOST_SPAWN_428B20_VA;
  out->spawn_arg7 = src->r_a;
  out->vcall_off = ISAAC_ROOM_TCA40_VCALL_OFF;
  out->timer_off_a = ISAAC_ROOM_TCA40_ITEM_TIMER_OFF_A;
  out->timer_off_b = ISAAC_ROOM_TCA40_ITEM_TIMER_OFF_B;
  out->item_px_off = ISAAC_ROOM_TCA40_ITEM_PX_OFF;
  out->item_py_off = ISAAC_ROOM_TCA40_ITEM_PY_OFF;
}

extern "C" int32_t isaac_room_greed_probe_9bf990(const IsaacRoomGreedProbeElem* elems,
                                                 uint32_t count) {
  /* `cmp ebx,1 / ja` gate is UNSIGNED — count 0 or 1 returns al=0 at
     once; otherwise seta(count_qual > 1) after cmp esi,1. */
  if (count <= 1u) return 0;
  uint32_t qual_count = 0u;
  for (uint32_t i = 0u; i < count; ++i) {
    qual_count += greed_probe_qual(&elems[i]);
  }
  return (qual_count > 1u) ? 1 : 0;
}

extern "C" uint32_t isaac_room_greed_probe_9bfa00(const IsaacRoomGreedProbeElem* elems,
                                                  uint32_t count) {
  /* No gate: COUNT of qual(e) && byte[e+0x20a9] LOW BYTE == 0. */
  uint32_t n = 0u;
  for (uint32_t i = 0u; i < count; ++i) {
    if (greed_probe_qual(&elems[i]) == 1u && (elems[i].f20a9 & 0xffu) == 0u) {
      ++n;
    }
  }
  return n;
}

extern "C" uint32_t isaac_room_greed_probe_9bfa70(const IsaacRoomGreedProbeElem* elems,
                                                  uint32_t count) {
  /* Mirror counting byte[e+0x20a9] LOW BYTE != 0. */
  uint32_t n = 0u;
  for (uint32_t i = 0u; i < count; ++i) {
    if (greed_probe_qual(&elems[i]) == 1u && (elems[i].f20a9 & 0xffu) != 0u) {
      ++n;
    }
  }
  return n;
}

extern "C" void isaac_room_greed_fire_9bfae0_plan(const IsaacRoomGreedProbeElem* elems,
                                                  uint32_t count,
                                                  IsaacRoomGreedFire9bfae0PlanOut* out) {
  if (out == nullptr) return;
  /* Fires typed-host 0x7d93b0(this=e) iff the low byte differs from
     zero; the loop bound is re-derived EVERY iteration (PE reloads
     begin/end at 0x9bfb07..12) — bound_rederived=1 marker. */
  uint32_t fire_count = 0u;
  uint32_t fire_mask = 0u;
  for (uint32_t i = 0u; i < count; ++i) {
    if ((elems[i].f20a9 & 0xffu) != 0u) {
      ++fire_count;
      if (i < 32u) fire_mask |= (1u << i);
    }
  }
  out->elem_count = count;
  out->fire_count = fire_count;
  out->fire_mask = fire_mask;
  out->call_7d93b0_va = ISAAC_ROOM_GREED_FIRE_CALL_7D93B0_VA;
  out->bound_rederived = 1u;
}

/* ---- v82 (ABI bump 79 -> 80): FUN_007f83b0 MAIN-path per-iteration
   spawn-tail item plan (PE 0x7f8760..0x7f8a24). Differences vs the v81
   7f7a40 tail: f1 is PRE-multiplied by 5.0; velocity mixes A/B/C where
   C = +vec0 (double negation cancels); BOTH base components multiply by
   40 (only the ADD differs); dir keeps +1 on NaN (comiss unordered ->
   CF=1 -> jbe TAKEN); [item+0x474] stores thr*dir DIRECTLY (no ==0
   select); UNSIGNED %10 + 0x1e timer; idiv re-derived after the spawn. */

extern "C" void isaac_room_trigger_clear_audio_83b0_tail_item_plan(
    const IsaacRoomTca83B0TailItemSrc* src, IsaacRoomTca83B0TailItemOut* out) {
  if (out == nullptr) return;
  const float scale = __builtin_bit_cast(float, 
      ISAAC_ROOM_TCA40_SCALE_POW2M32_BITS);
  const float vol_mul = __builtin_bit_cast(float, ISAAC_ROOM_TCA40_VOL_MUL_BITS);
  const float pitch_mul = __builtin_bit_cast(float, ISAAC_ROOM_TCA40_PITCH_MUL_BITS);
  const float speed_mul = __builtin_bit_cast(float, ISAAC_ROOM_TCA40_SPEED_MUL_BITS);
  const float ten_f = __builtin_bit_cast(float, ISAAC_ROOM_TCA40_THR_MUL_BITS);
  const float two_f = __builtin_bit_cast(float, ISAAC_ROOM_TCA40_TWO_BITS);
  const float one_f = __builtin_bit_cast(float, ISAAC_ROOM_TCA40_ONE_BITS);
  /* xorps sign work: A = -vec0, B = -vec1, C = +vec0 (bit flips). */
  const float a = __builtin_bit_cast(float, 
      src->vec0_bits ^ ISAAC_ROOM_TCA40_SIGN_MASK_BITS);
  const float b = __builtin_bit_cast(float, 
      src->vec1_bits ^ ISAAC_ROOM_TCA40_SIGN_MASK_BITS);
  const float c = __builtin_bit_cast(float, src->vec0_bits);
  /* f1 PRE-multiplied by 5.0 (mulss VOL_MUL right after 2^-32). */
  const float f1 = (room_tca40_u32_to_f32(src->r_b) * scale) * vol_mul;
  const float fs_c = room_tca40_u32_to_f32(src->r_c) * scale;
  const float m = (fs_c + fs_c) - one_f;
  const float af1 = a * f1;
  const float bf1 = b * f1;
  const float vel_x = (m * b) + af1;
  const float vel_y = (m * c) + bf1;
  const float height_pre = (room_tca40_u32_to_f32(src->r_d) * scale) * pitch_mul;
  const float height = height_pre + height_pre; /* consumed by HOST cos/sin */
  const float speed = (room_tca40_u32_to_f32(src->r_e) * scale) * speed_mul;
  if (src->game_c == 0) {
    /* idiv would fault in the PE — never invent a quotient. */
    out->div_ok = 0u;
    return;
  }
  const int32_t q = src->door_f24 / src->game_c;
  const int32_t r = src->door_f24 % src->game_c;
  const float fq = static_cast<float>(q);
  const float fr = static_cast<float>(r);
  const float tile = __builtin_bit_cast(float, ISAAC_ROOM_TCA40_TILE_BITS);
  const float tile_add = __builtin_bit_cast(float, ISAAC_ROOM_TCA40_TILE_ADD_BITS);
  const float base_x = (fq * tile) + tile_add; /* quot*40 + 120 */
  const float base_y = (fr * tile) + tile;     /* rem*40 + 40 */
  const float zero = 0.0f;
  const float cos_h = __builtin_bit_cast(float, src->cos_h_bits);
  const float sin_h = __builtin_bit_cast(float, src->sin_h_bits);
  const float pos_y = (cos_h * speed) + base_y;
  const float pos_x = (sin_h * speed) + base_x;
  /* PE reloads and divides again after the spawn (idiv RE-DERIVED). */
  const int32_t q2 = src->door_f24 / src->game_c;
  const int32_t r2 = src->door_f24 % src->game_c;
  (void)q2;
  (void)r2;
  const float item_px = __builtin_bit_cast(float, src->item_px_bits);
  const float item_py = __builtin_bit_cast(float, src->item_py_bits);
  const float d2 = ((item_py - base_x) * c) + ((item_px - base_y) * b);
  /* comiss 0,d2 ; jbe keep: -1 only when ORDERED 0 > d2; NaN KEEPS +1.
     Same law family as the v69 noise_dir gate. */
  const uint32_t dir_bits = (__builtin_isgreater(zero, d2))
                                ? ISAAC_ROOM_TCA40_NEG1_BITS
                                : ISAAC_ROOM_TCA40_ONE_BITS;
  const float dir = __builtin_bit_cast(float, dir_bits);
  const float thr = ((room_tca40_u32_to_f32(src->r_f) * scale) * ten_f) + two_f;
  const float f474 = thr * dir; /* NO ==0 select in this body */
  /* timer @0x7f89f8..0x7f8a0e: UNSIGNED div-by-10 remainder + 0x1e. */
  const uint32_t timer_value = (src->r_g % ISAAC_ROOM_TCA40_TIMER_DIV) +
                               ISAAC_ROOM_TCA40_TIMER_BASE;
  out->f1_bits = __builtin_bit_cast(uint32_t, f1);
  out->m_bits = __builtin_bit_cast(uint32_t, m);
  out->height_bits = __builtin_bit_cast(uint32_t, height);
  out->speed_bits = __builtin_bit_cast(uint32_t, speed);
    out->vel_x_bits = __builtin_bit_cast(uint32_t, vel_x);
  out->vel_y_bits = __builtin_bit_cast(uint32_t, vel_y);
  out->div_ok = 1u; out->quotient = q;
  out->remainder = r;
  out->base_x_bits = __builtin_bit_cast(uint32_t, base_x);
  out->base_y_bits = __builtin_bit_cast(uint32_t, base_y);
  out->pos_x_bits = __builtin_bit_cast(uint32_t, pos_x);
  out->pos_y_bits = __builtin_bit_cast(uint32_t, pos_y);
  out->d2_bits = __builtin_bit_cast(uint32_t, d2);
  out->dir_bits = dir_bits;
  out->thr_bits = __builtin_bit_cast(uint32_t, thr);
  out->f474_bits = __builtin_bit_cast(uint32_t, f474);
  out->timer_value = timer_value;
  out->create_type = ISAAC_ROOM_TCA40_CREATE_TYPE;
  out->create_variant = ISAAC_ROOM_TCA40_CREATE_VARIANT;
  out->call_428b20_va = ISAAC_ROOM_TCA40_HOST_SPAWN_428B20_VA;
  out->spawn_arg7 = src->r_a;
  out->first_iter_echo = src->first_iter;
  out->vcall_off = ISAAC_ROOM_TCA40_VCALL_OFF;
  out->timer_off_a = ISAAC_ROOM_TCA40_ITEM_TIMER_OFF_A;
  out->timer_off_b = ISAAC_ROOM_TCA40_ITEM_TIMER_OFF_B;
  out->item_px_off = ISAAC_ROOM_TCA40_ITEM_PX_OFF;
  out->item_py_off = ISAAC_ROOM_TCA40_ITEM_PY_OFF;
}

/* ---- v83 (ABI bump 80 -> 81): FUN_007fb250 record-29 award-spawner HEAD
   decision plan (PE 0x7fb250..0x7fb7a3). Exit table verbatim: 0 LUA_TAIL,
   3 GREED_ARM (fresh mode re-read), 1 SFX_ARM, 6 RT_ALT, 2 RT_END,
   5 GATE_END, then the count law and exits 7 NO_SPAWNS (SIGNED jle),
   8 ID_ZERO, 4 SPAWN_LOOP. Host results arrive as plain inputs; key
   signed/unsigned pins: comiss/cmova above zeroes the count (NaN keeps
   c2), cmp/sbb/and zeroes count when rnd64 >= 64 UNSIGNED, fco max() is
   UNSIGNED cmova after cmp eax,1, loop-entry gate SIGNED jle. */
extern "C" void isaac_room_award_spawn_7fb250_head_plan(
    const IsaacRoomAwardSpawn7fb250Src* src,
    IsaacRoomAwardSpawn7fb250Out* out) {
  if (out == nullptr) return;
  out->exit_kind = 4u;
  out->sfx_arm = 0u;
  out->byte_6d = 0u;
  out->variant_local = -1;
  out->count = 1u;
  out->id_final = src->picked_id;
  out->flag_66 = 0u;
  out->planned_spawns = 0u;
  /* 0 LUA_TAIL: lua_gate != 0 (jne 0x7fe099). */
  if (src->lua_gate != 0u) {
    out->exit_kind = 0u;
    return;
  }
  /* VARIANT LOCAL [ebp-0x6c]: -2 iff Game[0x1839c] bit17 && room[8]==5
     @0x7fb3d8 (requires h_9be630 == 0); byte_6d arms on either probe. */
  const uint32_t bit17 =
      (src->flags_1839c & 0x20000u) != 0u ? 1u : 0u;
  if (src->h_9be630 == 0u && bit17 != 0u &&
      src->room_type_8 == 5u) {
    out->variant_local = -2;
  }
  out->byte_6d = (src->h_9be630 != 0u ||
                  (bit17 != 0u && src->room_type_8 == 5u))
                     ? 1u : 0u;
  /* 3 GREED_ARM: Game[0x269c8] in {2,3} (je 0x7fd8e2; FRESH mode re-read
     @0x7fb3f7 — not cached from the caller). */
  if (src->mode_269c8 == 2u || src->mode_269c8 == 3u) {
    out->exit_kind = 3u;
    return;
  }
  /* 1 SFX_ARM: [[room+4]+0x10] non-null && [+8]==0x10 && [+0]==0x23. */
  if (src->desc_f10_present != 0u && src->desc_type_8 == 0x10u &&
      src->desc_type_00 == 0x23u) {
    out->sfx_arm = 1u;
    out->exit_kind = 1u;
    return;
  }
  /* 6 RT_ALT / 2 RT_END room[8] dispatch. */
  if (src->room_type_8 == 5u || src->room_type_8 == 0x11u) {
    out->exit_kind = 6u;
    return;
  }
  if (src->room_type_8 == 0x10u) {
    out->exit_kind = 2u;
    return;
  }
  /* 5 GATE_END: h_74efd0 && Game[0x1830c]==1. */
  if (src->h_74efd0 != 0u && src->game_1830c == 1u) {
    out->exit_kind = 5u;
    return;
  }
  /* COUNT LAW (0x7fb4ab..0x7fb7a3). */
  uint32_t count = 1u;
  uint32_t id = src->picked_id;
  if (src->gate_f1 != 0u && id != 0x15eu) {
    const uint32_t c2 = src->h_9be750 + 1u;
    /* comiss/cmovA above: ORDERED lhs > rnd zeroes the count; NaN keeps
       c2 (unordered -> cmova NOT taken). lhs = h_4e4690 * bits[0xbaa2d0]
       = 0.5f. */
    const float half = __builtin_bit_cast(float, 0x3f000000u);
    const float lhs =
        __builtin_bit_cast(float, src->h_4e4690_bits) * half;
    const float rnd_f =
        __builtin_bit_cast(float, src->h_7e9080_bits);
    count = __builtin_isgreater(lhs, rnd_f) ? 0u : c2;
  }
  if (src->mode_269c8 == 1u && id == 0xau) {
    /* cmp/sbb/and: count zeroed when rnd >= 0x42 UNSIGNED. */
    if (src->h_rnd64 >= 0x42u) count = 0u;
  }
  if (src->h_6ee340 == 0u && src->h_9be140 != 0u) {
    id = src->xform_id;
  }
  if (src->desc_f0 == -0x10 && src->h_9be6b0 != 0u) {
    count *= src->h_7cb6e0; /* u32 wrap */
  }
  if (src->gate_202 != 0u && src->h_rnd4 == 0u &&
      static_cast<int32_t>(count) >= 1 &&
      (id == 0x14u || id == 0xau || id == 0x1eu || id == 0x45u ||
       id == 0x28u)) {
    out->flag_66 = 1u;
  }
  if ((id == 0x14u || id == 0u) && src->h_9be080_1a0 != 0u) {
    const uint32_t sum = count + src->h_rnd3;
    count = (sum > 1u) ? sum : 1u; /* cmova after cmp eax,1 */
    id = 0x14u; /* FORCED @0x7fb683 */
  }
  out->count = count;
  out->id_final = id;
  /* Exits 7 / 8 / 4: SIGNED jle on the final count, then id==0. */
  if (static_cast<int32_t>(count) <= 0) {
    out->exit_kind = 7u;
  } else if (id == 0u) {
    out->exit_kind = 8u;
  } else {
    out->exit_kind = 4u;
    out->planned_spawns = count;
  }
}

/* ------------------------------------------------------------------ v84 ---
   FUN_007f83b0 ALT-tail item plan (PE 0x7f8ec7..0x7f9209; record-27
   closure). See the v84 header block + section-notes/room-v84-alt-tail/
   NOTES.md for the full transcription. Differences vs the v82 MAIN-tail
   carrier: C is re-flipped EVERY iteration from vecA (not a prologue
   value), B is used UNflipped, the spawn flag slot carries the door
   magic==0xe latch (constant) and the echo draw is r_b. */
extern "C" void isaac_room_trigger_clear_audio_83b0_tail_alt_item_plan(
    const IsaacRoomTca83B0AltItemSrc* src,
    IsaacRoomTca83B0AltItemOut* out) {
  if (out == nullptr || src == nullptr) return;
  const float scale = isaac_room_tca40_bits_f32(
      ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_SCALE_POW2M32_BITS);
  const float vol_mul = isaac_room_tca40_bits_f32(
      ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_VOL_MUL_BITS);
  const float pitch_mul = isaac_room_tca40_bits_f32(
      ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_PITCH_MUL_BITS);
  const float speed_mul = isaac_room_tca40_bits_f32(
      ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_SPEED_MUL_BITS);
  const float ten = isaac_room_tca40_bits_f32(
      ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_FLOAT10_BITS);
  const float two = isaac_room_tca40_bits_f32(
      ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_FLOAT2_BITS);
  const float one = isaac_room_tca40_bits_f32(
      ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_ONE_BITS);

  /* in-loop xorps flip: C = -vecA @0x7f8edb..f0. */
  const float c_val = isaac_room_tca40_bits_f32(
      src->vec_a_bits ^ ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_SIGN_MASK_BITS);
  const float a = isaac_room_tca40_bits_f32(src->vec_a_bits);
  const float b = isaac_room_tca40_bits_f32(src->vec_b_bits);
  const uint32_t flag_e = (src->magic_eq_e != 0u) ? 1u : 0u;

  /* f1 @0x7f8f05..2d ; m @0x7f8f4a..78. */
  const float f1 = (isaac_room_trigger_clear_audio_u32_to_f32(src->r_c) *
                    scale) * vol_mul;
  const float fs_d = isaac_room_trigger_clear_audio_u32_to_f32(src->r_d) *
                     scale;
  const float m = (fs_d + fs_d) - one;

  /* velocity @0x7f8f45..9e:
     vel_x = f1*A + m*B ; vel_y = C*m + f1*B. */
  const float fa = f1 * a;
  const float fb = f1 * b;
  const float vel_x = fa + (m * b);
  const float vel_y = (c_val * m) + fb;

  /* base idiv @0x7f8fa3..b0. */
  if (src->game_c == 0) {
    out->div_ok = 0u;
    out->quotient = 0;
    out->remainder = 0;
    out->base_x_bits = 0u;
    out->base_y_bits = 0u;
    out->pos_x_bits = 0u;
    out->pos_y_bits = 0u;
    out->d2_bits = 0u;
    out->dir_bits = ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_ONE_BITS;
    out->thr_bits = 0u;
    out->f474_bits = 0u;
    out->timer_value = 0u;
    return;
  }
  const int32_t q = src->door_f24 / src->game_c;
  const int32_t r = src->door_f24 % src->game_c;
  const float tile = 40.0f;      /* [0xbaa904] */
  const float tile_add = 120.0f; /* [0xbaaa00] */
  const float base_y = (static_cast<float>(r) * tile) + tile;
  const float base_x = (static_cast<float>(q) * tile) + tile_add;

  /* height @0x7f8fc6..e7 + speed @0x7f9009..19. */
  const float hpre = (isaac_room_trigger_clear_audio_u32_to_f32(src->r_e) *
                      scale) * pitch_mul;
  const float height = hpre + hpre; /* consumed by HOST cos/sin */
  const float speed = (isaac_room_trigger_clear_audio_u32_to_f32(src->r_f) *
                       scale) * speed_mul;
  (void)height; /* consumed by the HOST cos/sin leaves */

  /* pos @0x7f9028..7e with HOST cos/sin fed back. */
  const float cos_h = isaac_room_tca40_bits_f32(src->cos_h_bits);
  const float sin_h = isaac_room_tca40_bits_f32(src->sin_h_bits);
  const float pos_y = (cos_h * speed) + base_y;
  const float pos_x = (sin_h * speed) + base_x;

  /* distance @0x7f90cf..31: idiv RE-DERIVED after the spawn.
     d2 = (px - rem_term)*B + (py - quot_term)*C — same crossed pairing
     as the main tail; the PE adds px-term first, exact either way. */
  const float px = isaac_room_tca40_bits_f32(src->item_px_bits);
  const float py = isaac_room_tca40_bits_f32(src->item_py_bits);
  const float d2 = ((px - base_y) * b) + ((py - base_x) * c_val);
  /* dir @0x7f9131..43 jbe: -1 only when ORDERED 0 > d2; NaN keeps +1. */
  const float zero = 0.0f;
  const uint32_t dir_bits = (__builtin_isgreater(zero, d2))
                                ? ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_NEG1_BITS
                                : ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_ONE_BITS;

  /* threshold + f474 @0x7f9148..7d: NO ==0 select in this body. */
  const float thr = ((isaac_room_trigger_clear_audio_u32_to_f32(src->r_g) *
                      scale) * ten) + two;
  const float dir = isaac_room_tca40_bits_f32(dir_bits);
  const float f474 = thr * dir;

  /* timer @0x7f9185..a0: UNSIGNED div-by-10 remainder + 0x1e. */
  const uint32_t timer_value = (src->r_h % ISAAC_ROOM_TCA40_TIMER_DIV) +
                               ISAAC_ROOM_TCA40_TIMER_BASE;

  out->c_bits = isaac_room_tca40_f32_bits(c_val);
  out->flag_e = flag_e;
  out->f1_bits = isaac_room_tca40_f32_bits(f1);
  out->m_bits = isaac_room_tca40_f32_bits(m);
  out->vel_x_bits = isaac_room_tca40_f32_bits(vel_x);
  out->vel_y_bits = isaac_room_tca40_f32_bits(vel_y);
  out->div_ok = 1u;
  out->quotient = q;
  out->remainder = r;
  out->base_y_bits = isaac_room_tca40_f32_bits(base_y);
  out->base_x_bits = isaac_room_tca40_f32_bits(base_x);
  out->pos_x_bits = isaac_room_tca40_f32_bits(pos_x);
  out->pos_y_bits = isaac_room_tca40_f32_bits(pos_y);
  out->d2_bits = isaac_room_tca40_f32_bits(d2);
  out->dir_bits = dir_bits;
  out->thr_bits = isaac_room_tca40_f32_bits(thr);
  out->f474_bits = isaac_room_tca40_f32_bits(f474);
  out->timer_value = timer_value;
  out->create_type = ISAAC_ROOM_TCA40_CREATE_TYPE;
  out->create_variant = ISAAC_ROOM_TCA40_CREATE_VARIANT;
  out->call_428b20_va = ISAAC_ROOM_TCA40_HOST_SPAWN_428B20_VA;
  out->spawn_arg_rb = src->r_b;
  out->spawn_flag = flag_e;
  out->vcall_off = ISAAC_ROOM_TCA40_VCALL_OFF;
  out->timer_off_a = ISAAC_ROOM_TCA40_ITEM_TIMER_OFF_A;
  out->timer_off_b = ISAAC_ROOM_TCA40_ITEM_TIMER_OFF_B;
  out->item_px_off = ISAAC_ROOM_TCA40_ITEM_PX_OFF;
  out->item_py_off = ISAAC_ROOM_TCA40_ITEM_PY_OFF;
}

/* ------------------------------------------------------------------ v85 ---
   SPAWN-LOOP continuation laws (PE 0x007fb7be..0x007fe087). See the v85
   header block for the full transcription + callee classification. */

/* 0x007e90f0 xorshift step: t = x ^ (x>>a); r = t ^ (t<<b);
   nx = r ^ (r>>c); store; return nx. x86 shift counts mask &31 in
   hardware — the C shift would be UB, so mask explicitly (the JS
   oracle's >>>/<< already mask). x==0 is the PE debug-fatal arm
   0x7e90f9..0x7e910e (host assert, not modeled here). */
extern "C" uint32_t isaac_room_rng_7e90f0_step(IsaacRoomRng7e90f0State* st) {
  if (st == nullptr) return 0u;
  uint32_t t = st->x ^ (st->x >> (st->shr_a & 31u));
  uint32_t r = t ^ (t << (st->shl_b & 31u));
  const uint32_t nx = r ^ (r >> (st->shr_c & 31u));
  st->x = nx;
  return nx;
}

/* 0x006ee340 per-entity re-dispatch gate: ordered cmp chain
   {0x32,0x3c,0x168,0x33,0x35,0x34,0x36,0x186,0x37,0x38,0x39,0x3a} ->
   al=1 else al=0 (FULL dword compares). */
extern "C" uint32_t isaac_room_award_spawn_6ee340_gate(uint32_t variant) {
  switch (variant) {
    case 0x32u: case 0x3cu: case 0x168u: case 0x33u: case 0x35u:
    case 0x34u: case 0x36u: case 0x186u: case 0x37u: case 0x38u:
    case 0x39u: case 0x3au:
      return 1u;
    default:
      return 0u;
  }
}

/* Per-iteration law 0x007fb7be..0x007fb8d1. Host leaves arrive as
   inputs (pos walk f32 pair, door-gate al, sfx owner); every decision
   below is transcribed from the dump. Grid idx reuses the v75 L1 law
   (identical chain to isaac_room_grid_pos_index). */
static int32_t roomIterCvttss2si_s(float v) {
  if (v != v) return (int32_t)(uint32_t)0x80000000u;
  if (v >= 2147483648.0f) return (int32_t)(uint32_t)0x80000000u;
  if (v < -2147483648.0f) return (int32_t)(uint32_t)0x80000000u;
  return (int32_t)v;
}

extern "C" void isaac_room_award_spawn_7fb250_iter_plan(
    const IsaacRoomAwardSpawn7fb250IterSrc* src,
    IsaacRoomAwardSpawn7fb250IterOut* out) {
  if (out == nullptr || src == nullptr) return;
  const uint32_t gate = isaac_room_award_spawn_6ee340_gate(
      src->entity_variant_2c);
  out->redispatch_gate = gate;
  /* al==0 -> [-0x8c] = [edi+0x30] @0x7fb81a..8d. */
  uint32_t variant_next =
      (gate == 0u) ? src->entity_field_30 : src->variant_cur;
  /* DOOR ARM @0x7fb823..31 (ecx held [edi+0x2c] across the call). */
  const uint32_t door_arm =
      (src->entity_type_28 == ISAAC_ROOM_AWARD_SPAWN_DOOR_ARM_TYPE &&
       (src->entity_variant_2c == (uint32_t)ISAAC_ROOM_AWARD_SPAWN_DOOR_ARM_A ||
        src->entity_variant_2c == (uint32_t)ISAAC_ROOM_AWARD_SPAWN_DOOR_ARM_B))
          ? 1u : 0u;
  /* Grid idx law (0x00812c90 == v75 L1): trunc((x-40)/40+.5) /
     trunc((y-120)/40+.5), SIGNED bounds, u32 wrap; 0xffffffff OOB.
     The PE computes it only under the arm; inputs make it total. */
  const float cell = __builtin_bit_cast(float, 0x42200000u); /* [0xbaa904] */
  const float half = __builtin_bit_cast(float, 0x3f000000u); /* [0xbaa2d0] */
  const float org_y = __builtin_bit_cast(float, 0x42f00000u);/* [0xbaaa00] */
  const float px = __builtin_bit_cast(float, src->pos_x_bits);
  const float py = __builtin_bit_cast(float, src->pos_y_bits);
  const int32_t col = roomIterCvttss2si_s(((px - cell) / cell) + half);
  const int32_t row = roomIterCvttss2si_s(((py - org_y) / cell) + half);
  uint32_t grid_idx = 0xffffffffu;
  if (col >= 0 && col < static_cast<int32_t>(src->room_w) &&
      row >= 0 && row < static_cast<int32_t>(src->room_h)) {
    grid_idx = static_cast<uint32_t>(
        static_cast<uint32_t>(src->room_w) * static_cast<uint32_t>(row) +
        static_cast<uint32_t>(col));
  }
  out->door_arm = door_arm;
  out->grid_idx = grid_idx;
  /* Gate HOST 0x822820 al==0 -> door spawn + variant := 1
     @0x7fb84b..62. */
  const uint32_t fired =
      (door_arm != 0u && src->h_door_gate == 0u) ? 1u : 0u;
  if (fired != 0u) variant_next = 1u;
  out->door_spawn_fired = fired;
  out->variant_next = variant_next;
  /* FLAG RMW @0x7fb86c..8b: flag66 && counter==0 -> reload
     [edi+0x168], or [edi+0x16c],0x100, store back. */
  out->flag_rmw = (src->flag_66 != 0u && src->counter == 0) ? 1u : 0u;
  out->sfx_chase = (src->h_sfx_owner != 0u) ? 1u : 0u;
  /* counter++ @0x7fb8bc..c3 ; continue SIGNED jl count_limit. */
  out->counter_next = src->counter + 1;
  out->continue_loop =
      (out->counter_next < src->count_limit) ? 1u : 0u;
  out->create_relay_va = ISAAC_ROOM_AWARD_SPAWN_HOST_CREATE_VA;
  out->spawn_type = ISAAC_ROOM_AWARD_SPAWN_DOOR_ARM_TYPE;
  out->spawn_arg_a6 = src->variant_cur;
}

/* B1 luck gate 0x007fb8d1..0x007fb95b. val =
   (q_f32*[0xbaa0a0]=0.03f + [0xbaa198]=0.2f)*f32(q_int); m =
   minss(val,[0xbaa220]=0.33f): dst < src -> dst, else (and on NaN)
   src2 — the SMALLER operand wins, NaN val lands on cap. */
extern "C" void isaac_room_award_spawn_7fb250_b1_luck_gate(
    const IsaacRoomAwardSpawn7fb250B1LuckSrc* src,
    IsaacRoomAwardSpawn7fb250B1LuckOut* out) {
  if (out == nullptr || src == nullptr) return;
  const float mul03 = __builtin_bit_cast(float,
      ISAAC_ROOM_AWARD_SPAWN_B1_MUL03_BITS);
  const float add02 = __builtin_bit_cast(float,
      ISAAC_ROOM_AWARD_SPAWN_B1_ADD02_BITS);
  const float cap33 = __builtin_bit_cast(float,
      ISAAC_ROOM_AWARD_SPAWN_B1_CAP33_BITS);
  const float qf = __builtin_bit_cast(float, src->h_quality_f_bits);
  const float qi = static_cast<float>(src->h_quality_int);
  const float val = ((qf * mul03) + add02) * qi;
  const float m =
      (!__builtin_isunordered(val, cap33) && val < cap33) ? val : cap33;
  const float rnd = __builtin_bit_cast(float, src->h_rnd_f_bits);
  const uint32_t pass = __builtin_isgreater(m, rnd) ? 1u : 0u;
  out->val_bits = __builtin_bit_cast(uint32_t, val);
  out->min_bits = __builtin_bit_cast(uint32_t, m);
  out->pass = pass;
  out->spawn_variant = ISAAC_ROOM_AWARD_SPAWN_B1_SITE_VARIANT;
}

/* ------------------------------------------------------------------ v86 ---
   idx29 SPAWN-LOOP probe callees (PE 0x009b92c0 / 0x007cb6e0 /
   0x007c3980). See the v86 header block for the full transcription +
   host classification. */

/* Probe A — 0x009b92c0 vector-at fetch. */
extern "C" void isaac_room_idx29_at_9b92c0(uint32_t begin, uint32_t end,
                                           uint32_t index,
                                           IsaacRoomIdx29AtOut* out) {
  if (out == nullptr) return;
  const int32_t count = static_cast<int32_t>(end - begin) >> 2; /* sar */
  const uint32_t fatal = (count == 0) ? 1u : 0u;
  /* Fatal arm @0x009b92d7: HOST 0xa112c0 then RE-LOAD of end/begin;
     in the pure law the reload observes the same values. */
  const uint32_t oob =
      (static_cast<uint32_t>(index) >= static_cast<uint32_t>(count))
          ? 1u
          : 0u; /* jae 0x009b92f5 UNSIGNED */
  out->fatal_host = fatal;
  out->oob_defect = oob;
  if (oob != 0u) {
    /* ORIGINAL DEFECT (ret 0x009b9300): out-of-range returns *begin. */
    out->value = *reinterpret_cast<const uint32_t*>(begin);
  } else {
    out->value = reinterpret_cast<const uint32_t*>(begin)[index];
  }
}

/* Probe B primitives. */

/* Head walk step 0x7cb6fb..0x7cb733. */
extern "C" void isaac_room_count_7cb6e0_head_step(
    uint32_t field_2c, uint32_t parent_ptr, uint32_t parent_field_28,
    uint32_t cand_field_2c, uint32_t host_known, uint32_t host_result,
    IsaacRoomCountHeadStepOut* out) {
  if (out == nullptr) return;
  out->player_next = 0u;
  out->host_edge = 0u;
  out->cont = 0u;
  out->exit_stored = 0u;
  if (field_2c != 1u) {
    out->exit_stored = 1u; /* jne 0x7cb733 skips the walk entirely */
    return;
  }
  if (parent_ptr != 0u && parent_field_28 == 1u) {
    /* je 0x7cb728 with eax=parent: edi := parent, loop on [parent+0x2c]. */
    out->player_next = parent_ptr;
    out->cont = (cand_field_2c == 1u) ? 1u : 0u;
    out->exit_stored = (out->cont != 0u) ? 0u : 1u;
    return;
  }
  /* Fallthrough 0x7cb711: re-test, then HOST 0x417870(Game, 0). */
  if (field_2c != 1u) {
    out->exit_stored = 1u;
    return;
  }
  out->host_edge = (host_known != 0u) ? 1u : 0u;
  if (host_result == 0u) {
    out->player_next = 0u; /* je 0x7cb730 keeps the current edi */
    out->exit_stored = 1u;
    return;
  }
  out->player_next = host_result;
  out->cont = (cand_field_2c == 1u) ? 1u : 0u;
  out->exit_stored = (out->cont != 0u) ? 0u : 1u;
}

extern "C" uint32_t isaac_room_count_7cb6e0_boost(uint32_t f13c0,
                                                  uint32_t id) {
  /* 0x7cb735 cmp ebx,0x56 / 0x7cb73a cmp [edi+0x13c0],4 / cmove esi. */
  return (id == (uint32_t)ISAAC_ROOM_COUNT_ID_56 && f13c0 == 4u) ? 1u : 0u;
}
extern "C" uint32_t isaac_room_count_7cb6e0_gate_202c(uint32_t flag) {
  /* 0x7cb749 cmp byte [edi+0x202c],0 / jne 0x7cba0d. */
  return (flag & 0xffu) != 0u ? 1u : 0u;
}
extern "C" uint32_t isaac_room_count_7cb6e0_gate_20a9(uint32_t flag) {
  /* 0x7cb756 cmp byte [edi+0x20a9],0 / jne 0x7cba0d. */
  return (flag & 0xffu) != 0u ? 1u : 0u;
}
extern "C" uint32_t isaac_room_count_7cb6e0_id_mask(uint32_t id) {
  /* 0x7cb768 and ebx,0x7fff. */
  return id & ISAAC_ROOM_COUNT_MASK;
}
extern "C" uint32_t isaac_room_count_7cb6e0_table_value(uint32_t index) {
  if (index >= (uint32_t)ISAAC_ROOM_COUNT_TABLE_SIZE) return 0u;
  return (uint32_t)ISAAC_ROOM_COUNT_TABLE[index];
}
extern "C" uint32_t isaac_room_count_7cb6e0_table_hit(uint32_t mode_2663c,
                                                      uint32_t id_masked) {
  /* 0x7cb76e cmp [Game+0x2663c],0x1c; scan 10 dwords UNSIGNED bound
     (cmp eax,0x28 / jb). */
  if (mode_2663c != (uint32_t)ISAAC_ROOM_COUNT_MODE_GATE) return 0u;
  for (uint32_t i = 0; i < (uint32_t)ISAAC_ROOM_COUNT_TABLE_SIZE; ++i) {
    if ((uint32_t)ISAAC_ROOM_COUNT_TABLE[i] == id_masked) return 1u;
  }
  return 0u;
}
extern "C" uint32_t isaac_room_count_7cb6e0_special_id(uint32_t id_masked) {
  /* 0x7cb793..0x7cb7a8: id in {0x15,0x40,0x4b} -> jmp sampling. */
  switch (id_masked) {
    case 0x15u:
    case 0x40u:
    case 0x4bu:
      return 1u;
    default:
      return 0u;
  }
}
extern "C" int32_t isaac_room_count_7cb6e0_seed_mod4(uint32_t mgr_seed) {
  /* 0x7cb7c7 and ecx,0x80000003; jns skip; dec; or -4; inc -> C % 4. */
  int32_t ecx = static_cast<int32_t>(mgr_seed &
                                    ISAAC_ROOM_COUNT_MOD4_MASK);
  if (ecx >= 0) return ecx;
  ecx -= 1;
  ecx |= -4;
  return ecx + 1;
}
extern "C" uint32_t isaac_room_count_7cb6e0_seed_index(uint32_t mgr_seed) {
  /* 0x7cb80d..0x7cb833: signed div-by-90 magic 0xb60b60b7
     (imul high + add + sar 6 + shr31 sign fix), then UNSIGNED mod 10. */
  const int64_t prod = static_cast<int64_t>(
      static_cast<int32_t>(mgr_seed)) *
      static_cast<int64_t>(
          static_cast<int32_t>(ISAAC_ROOM_COUNT_SEED_DIV_MAGIC));
  uint32_t edx = static_cast<uint32_t>(
      static_cast<uint64_t>(prod) >> 32);
  edx += mgr_seed; /* add edx,ecx */
  int32_t sar = static_cast<int32_t>(edx) >>
                ISAAC_ROOM_COUNT_SEED_DIV_SHIFT;
  uint32_t q = static_cast<uint32_t>((sar >> 31) + sar); /* shr/add fix */
  return q % (uint32_t)ISAAC_ROOM_COUNT_SEED_IDX_MOD; /* UNSIGNED div */
}
extern "C" uint32_t isaac_room_count_7cb6e0_id30_gate(uint32_t id_masked,
                                                      int32_t count15,
                                                      int32_t seed_mod4) {
  /* 0x7cb7d4..0x7cb7e6: ebx==0x30 && (mod4==2 || (count15>1 SIGNED &&
     mod4==3)) -> early ret count15+esi. */
  if (id_masked != (uint32_t)ISAAC_ROOM_COUNT_ID_30) return 0u;
  if (count15 <= 0) return 0u; /* outer jle already skipped */
  if (seed_mod4 == 2) return 1u;
  if (count15 <= 1) return 0u;
  return (seed_mod4 == 3) ? 1u : 0u;
}
extern "C" uint32_t isaac_room_count_7cb6e0_seed40_gate(
    uint32_t id_masked, int32_t count40, uint32_t mgr_seed) {
  /* 0x7cb809..0x7cb83e: count40>0 && TABLE[seed_index(seed)]==id ->
     esi += count40. */
  if (count40 <= 0) return 0u;
  const uint32_t idx = isaac_room_count_7cb6e0_seed_index(mgr_seed);
  return ((uint32_t)ISAAC_ROOM_COUNT_TABLE[idx] == id_masked) ? 1u : 0u;
}
extern "C" uint32_t isaac_room_count_7cb6e0_7a29_skip(
    uint32_t id_masked, uint32_t mode_26584) {
  /* 0x7cb857..0x7cb863: id==0x7a && [Game+0x26584]==0x29 -> jmp
     sampling (skips the 0xbd RNG arm AND ids 0x17/0x18/0x13). */
  return (id_masked == (uint32_t)ISAAC_ROOM_COUNT_ID_7A &&
          mode_26584 == (uint32_t)ISAAC_ROOM_COUNT_MODE_7A_GATE)
             ? 1u
             : 0u;
}
extern "C" uint32_t isaac_room_count_7cb6e0_bd_compare(uint32_t rng_raw,
                                                       uint32_t id_masked) {
  /* 0x7cb89e..0x7cb8a1: inc eax; cmp ebx,eax -> id == rng+1 (u32
     wrap). */
  return (id_masked == rng_raw + 1u) ? 1u : 0u;
}
extern "C" uint32_t isaac_room_count_7cb6e0_scan_width(uint32_t has_8b,
                                                       uint32_t has_1ca) {
  /* 0x7cb8e8..0x7cb90a: has-8b al!=0 -> 2 else has-1ca al!=0 -> 2
     else 1. Bytes via al (&0xff). */
  if ((has_8b & 0xffu) != 0u) return 2u;
  if ((has_1ca & 0xffu) != 0u) return 2u;
  return 1u;
}
extern "C" uint32_t isaac_room_count_7cb6e0_slot_match(uint32_t slot_dword,
                                                       uint32_t id_masked) {
  /* 0x7cb913..0x7cb92a: NESTED increments. jne 0x7cb92a skips BOTH;
     the bit-15 second inc only fires under an id match. */
  if ((slot_dword & ISAAC_ROOM_COUNT_MASK) != id_masked) return 0u;
  return ((slot_dword & 0x8000u) != 0u) ? 2u : 1u;
}
extern "C" uint32_t isaac_room_count_7cb6e0_block_17c4(
    uint32_t block_nonnull, uint32_t block0, uint32_t block4,
    uint32_t f2ef8, uint32_t id_masked) {
  /* 0x7cb932..0x7cb957: ptr!=0 && [ptr]==2 && [ptr+4]==id &&
     ([edi+0x2ef8]==0 || ==id). */
  if (block_nonnull == 0u) return 0u;
  if (block0 != 2u) return 0u;
  if (block4 != id_masked) return 0u;
  if (f2ef8 != 0u && f2ef8 != id_masked) return 0u;
  return 1u;
}
extern "C" uint32_t isaac_room_count_7cb6e0_flag_17cc(uint32_t flag_byte) {
  /* 0x7cb958 test byte [edi+0x17cc],2 — INDEPENDENT of block_17c4. */
  return (flag_byte & 0x02u) != 0u ? 1u : 0u;
}
extern "C" int32_t isaac_room_count_7cb6e0_item_add(uint32_t id_masked,
                                                    uint32_t item_begin,
                                                    uint32_t item_end,
                                                    int32_t w0,
                                                    int32_t w1) {
  /* 0x7cb962..0x7cb982: span = sar((int32)(end-begin),2); UNSIGNED
     jae bound; adds movsx w0 + lea 2*movsx w1. */
  const int32_t span = static_cast<int32_t>(item_end - item_begin) >> 2;
  if (id_masked >= static_cast<uint32_t>(span)) return 0; /* jae */
  return w0 + w1 * 2;
}
extern "C" int32_t isaac_room_count_7cb6e0_byte_add(uint32_t id_masked,
                                                    uint32_t byte_begin,
                                                    uint32_t byte_end,
                                                    uint32_t byte_val) {
  /* 0x7cb985..0x7cb99b: span raw dword diff, SIGNED jge bound; +1 iff
     the byte is non-zero (zero-extended load). */
  const int32_t span = static_cast<int32_t>(byte_end - byte_begin);
  if (static_cast<int32_t>(id_masked) >= span) return 0;
  return ((byte_val & 0xffu) != 0u) ? 1 : 0;
}
extern "C" int32_t isaac_room_count_7cb6e0_adjust_2ef8(int32_t esi,
                                                       uint32_t f2ef8,
                                                       uint32_t byte_2ef0,
                                                       uint32_t id_masked) {
  /* 0x7cb99f..0x7cb9f5. ecx = esi + (byte-buffer add), then:
     f2ef8==0 or low15 mismatch -> esi := ecx; byte[edi+0x2ef0]!=0 ->
     esi = ecx + 1 + (bit15?1:0) (neg/sbb/neg/inc chain); else
     esi = max(0, ecx-1) SIGNED cmovg, repeated under bit15. */
  if (f2ef8 == 0u) return esi;
  if ((f2ef8 & ISAAC_ROOM_COUNT_MASK) != id_masked) return esi;
  if ((byte_2ef0 & 0xffu) != 0u) {
    const int32_t t = ((f2ef8 & 0x8000u) != 0u) ? 1 : 0;
    return esi + t + 1;
  }
  int32_t s = esi - 1;
  if (s <= 0) s = 0; /* cmovg max(0, .) SIGNED */
  if ((f2ef8 & 0x8000u) != 0u) {
    s = s - 1;
    if (s <= 0) s = 0;
  }
  return s;
}
extern "C" int32_t isaac_room_count_7cb6e0_final_gate(int32_t esi,
                                                      uint32_t has_1b7) {
  /* 0x7cb9f6..0x7cba0c: SIGNED jle; +1 iff HOST has-1b7 byte set. */
  if (esi <= 0) return esi;
  return ((has_1b7 & 0xffu) != 0u) ? esi + 1 : esi;
}
extern "C" uint32_t isaac_room_count_7cb6e0_field_gate(uint32_t id,
                                                       uint32_t value) {
  /* 0x7cb8a6..0x7cb8d7: id 0x18 / 0x13 -> SIGNED field>0 adds 1.
     (id 0x17 is the HOST 0x930aa0 adder — typed host.) */
  if (id != (uint32_t)ISAAC_ROOM_COUNT_ID_18 &&
      id != (uint32_t)ISAAC_ROOM_COUNT_ID_13) {
    return 0u;
  }
  return (static_cast<int32_t>(value) > 0) ? 1u : 0u;
}

/* Composed body AFTER the head walk (edi fields arrive as scalars).
   Faithful PE order: boost -> byte gates -> mask -> table hit ->
   special-id jump -> count(0x15)/0x30 gate -> count(0x40) seed gate ->
   count(0x4b) 0x7a/0xbd arms -> 0x17/0x18/0x13 -> sampling. */
extern "C" void isaac_room_count_7cb6e0_plan(const IsaacRoomCountSrc* src,
                                             IsaacRoomCountOut* out) {
  if (out == nullptr || src == nullptr) return;
  out->early_gate = 0u;
  out->early_ret_30 = 0u;
  out->sampling_reached = 0u;
  out->recurse_15_fired = 0u;
  out->recurse_40_fired = 0u;
  out->recurse_4b_fired = 0u;
  out->host_740bc0_fired = 0u;
  out->host_rng_fired = 0u;
  out->host_17_fired = 0u;
  out->host_8b_fired = 0u;
  out->host_1ca_fired = 0u;
  out->host_1b7_fired = 0u;

  int32_t esi = static_cast<int32_t>(isaac_room_count_7cb6e0_boost(
      src->f13c0, src->id)); /* 0x7cb735 */
  /* Byte gates BEFORE the mask (0x7cb749 / 0x7cb756). */
  if (isaac_room_count_7cb6e0_gate_202c(src->gate_202c) != 0u ||
      isaac_room_count_7cb6e0_gate_20a9(src->gate_20a9) != 0u) {
    out->early_gate = 1u;
    out->result = esi;
    return;
  }
  const uint32_t idm = isaac_room_count_7cb6e0_id_mask(src->id);
  esi += static_cast<int32_t>(isaac_room_count_7cb6e0_table_hit(
      src->mode_2663c, idm)); /* 0x7cb76e..0x7cb792 */

  if (isaac_room_count_7cb6e0_special_id(idm) != 0u) {
    /* Special ids {0x15,0x40,0x4b} jump straight to sampling
       (0x7cb796/0x7cb79f/0x7cb7a8): no recursions, no 0x17/0x18/0x13. */
  } else {
    /* count(0x15) recursion + 0x30 gate (0x7cb7ae..0x7cb7fa). */
    out->recurse_15_fired = 1u;
    const int32_t count15 = src->h_count15;
    if (count15 > 0) { /* SIGNED jle 0x7cb7fd */
      const int32_t mod4 =
          isaac_room_count_7cb6e0_seed_mod4(src->mgr_seed_264f8);
      if (isaac_room_count_7cb6e0_id30_gate(idm, count15, mod4) != 0u) {
        out->early_ret_30 = 1u;
        out->result = count15 + esi; /* add eax,esi @0x7cb7e9 */
        return;
      }
    }
    /* count(0x40) recursion + seed-index gate (0x7cb7fd..0x7cb83e). */
    out->recurse_40_fired = 1u;
    const int32_t count40 = src->h_count40;
    if (isaac_room_count_7cb6e0_seed40_gate(idm, count40,
                                            src->mgr_seed_264f8) != 0u) {
      esi += count40;
    }
    /* count(0x4b) recursion (0x7cb841..0x7cb8a3). */
    out->recurse_4b_fired = 1u;
    const int32_t count4b = src->h_count4b;
    const uint32_t skip_7a29 =
        (count4b > 0)
            ? isaac_room_count_7cb6e0_7a29_skip(idm, src->mode_26584)
            : 0u;
    if (count4b > 0 && skip_7a29 != 0u) {
      /* je 0x7cb8d8: skips the 0xbd arm AND ids 0x17/0x18/0x13. */
    } else {
      if (count4b > 0) { /* SIGNED jle 0x7cb8a6 */
        out->host_740bc0_fired = 1u; /* 0x7cb86d unconditional here */
        if (src->h_bd_r != 0u) {     /* [ret+0x5c] gate 0x7cb877 */
          out->host_rng_fired = 1u;  /* HOST RNG 0x7e9020(., 0xbd) */
          if (isaac_room_count_7cb6e0_bd_compare(src->h_rng_raw,
                                                 idm) != 0u) {
            esi += count4b; /* add esi,[ebp-0x18] @0x7cb8a3 */
          }
        }
      }
      /* ids 0x17 / 0x18 / 0x13 (0x7cb8a6..0x7cb8d7). */
      if (idm == (uint32_t)ISAAC_ROOM_COUNT_ID_17) {
        out->host_17_fired = 1u; /* HOST 0x930aa0(this+0x1508, id) */
        esi += static_cast<int32_t>(src->h_adder_17);
      } else {
        esi += static_cast<int32_t>(isaac_room_count_7cb6e0_field_gate(
            idm, idm == (uint32_t)ISAAC_ROOM_COUNT_ID_18 ? src->f18dc
                                                         : src->f18e0));
      }
    }
  }

  /* Sampling region 0x007cb8d8..0x007cba0d. */
  out->sampling_reached = 1u;
  /* Scan width from the two HOST bytes (0x7cb8e8..0x7cb90a). */
  out->host_8b_fired = 1u; /* always sampled */
  if ((src->has_8b & 0xffu) == 0u) out->host_1ca_fired = 1u;
  const uint32_t width =
      isaac_room_count_7cb6e0_scan_width(src->has_8b, src->has_1ca);
  for (uint32_t i = 0; i < width; ++i) {
    esi += static_cast<int32_t>(isaac_room_count_7cb6e0_slot_match(
        i == 0u ? src->slot0 : src->slot1, idm));
  }
  esi += static_cast<int32_t>(isaac_room_count_7cb6e0_block_17c4(
      src->block_nonnull, src->block0, src->block4, src->f2ef8, idm));
  esi += static_cast<int32_t>(isaac_room_count_7cb6e0_flag_17cc(
      src->flag_17cc));
  esi += isaac_room_count_7cb6e0_item_add(
      idm, src->item_begin, src->item_end,
      static_cast<int32_t>(src->item_w0),
      static_cast<int32_t>(src->item_w1));
  esi += isaac_room_count_7cb6e0_byte_add(
      idm, src->byte_begin, src->byte_end, src->byte_val);
  esi = isaac_room_count_7cb6e0_adjust_2ef8(esi, src->f2ef8,
                                            src->byte_2ef0, idm);
  out->result = isaac_room_count_7cb6e0_final_gate(esi, src->has_1b7);
  if (out->result > 0) out->host_1b7_fired = 1u;
}

/* Probe C — 0x007c3980 roll core. */
extern "C" void isaac_room_roll_7c3980_core(uint32_t s0, uint32_t s1,
                                            uint32_t s2, uint32_t s3,
                                            IsaacRoomRollOut* out) {
  if (out == nullptr) return;
  out->fatal = (s0 == 0u) ? 1u : 0u; /* fatal arm 0x7c39cf..0x7cb39e8 */
  /* x86 cl shifts mask &31 in hardware; wasm32 does the same, so the
     explicit mask is semantics-preserving. */
  const uint32_t t = s0 ^ (s0 >> (s1 & 31u));            /* shr/shr-class */
  const uint32_t u = (t << (s2 & 31u)) ^ t;              /* shl/xor */
  const uint32_t w = u ^ (u >> (s3 & 31u));              /* shr/xor */
  out->new_s0 = w;                                       /* mov [edi],eax */
  out->index = w % ISAAC_ROOM_ROLL_DIVISOR; /* xor edx,edx; div ecx */
}
extern "C" uint32_t isaac_room_roll_7c3980_flags_or(uint32_t old_flags) {
  /* 0x7c3a17 or dword [esi+0x1574],0x41f. */
  return old_flags | ISAAC_ROOM_ROLL_FLAGS_MASK;
}
extern "C" uint32_t isaac_room_roll_7c3980_followup_gate(uint32_t f3fc,
                                                         uint32_t byte_173) {
  /* 0x7c3a26..0x7c3a3a: fire HOST 0x7abd30 iff both gates zero. */
  return (f3fc == 0u && (byte_173 & 0xffu) == 0u) ? 1u : 0u;
}

/* idx29 caller glue 0x7fbab2..0x7fbadb (SIGNED jle skips). */
extern "C" void isaac_room_idx29_roll_plan(
    int32_t q, IsaacRoomIdx29RollPlanOut* out) {
  if (out == nullptr) return;
  out->roll_first = (q > 1) ? 1u : 0u;   /* cmp eax,1 / jle 0x7fbab2 */
  out->roll_second = (q > 2) ? 1u : 0u;  /* cmp eax,2 / jle 0x7fbacc */
}

/* ------------------------------------------------------------------ v87 ---
   B3B7 small GridEntity Update leaves (D5 slot-2 dispatch @0x00803bd8
   over cells [Room+idx*4+0x24], base vtbl 0xb686e8). Fresh PE dumps
   cpu-dump/0040c200.txt + 00838520.txt + 00983330.txt + 0071f090.txt;
   evidence pack section-notes/update-boundary-evidence/b3b7-leaves/. */

/* Wall — folded trivial body (PE 0x0040c200..0x0040c203, `ret 0`). */
extern "C" uint32_t isaac_room_wall_update_40c200(void) {
  return ISAAC_ROOM_WALL_UPDATE_RET;
}

/* Statue — 0x00838520..0x0083855e. */
extern "C" void isaac_room_statue_838520_plan(uint32_t flag_149,
                                              int32_t state_c,
                                              IsaacRoomStatueUpdateOut* out) {
  if (out == nullptr) return;
  /* 0x838523 cmp byte [esi+0x149],0; je 0x83853f skips BOTH teardown
     calls (WIDE byte mask: only the low 8 bits are tested). */
  out->host_calls = ((flag_149 & 0xffu) != 0u) ? 2u : 0u;
  /* State dispatch 0x83853f..0x83855c: EXACT matches only; any other
     state stores nothing (the body just falls through to its ret). */
  if (state_c == ISAAC_ROOM_STATUE_STATE_STORE3) {
    out->store_fired = 1u; /* mov dword [esi+0x3c],3 @0x838547 */
    out->store_value = 3;
  } else if (state_c == ISAAC_ROOM_STATUE_STATE_STORE0) {
    out->store_fired = 1u; /* mov dword [esi+0x3c],0 @0x838555 */
    out->store_value = 0;
  } else {
    out->store_fired = 0u;
    out->store_value = 0;
  }
}

/* PressurePlate timer gate 0x983383..0x98338e: SIGNED jge skip. */
extern "C" uint32_t isaac_room_pressureplate_983330_timer_gate(
    int32_t elem_cur) {
  return (elem_cur < ISAAC_ROOM_PLATE_TIMER_SET) ? 1u : 0u;
}

/* PressurePlate — 0x00983330..0x009833b4. */
extern "C" void isaac_room_pressureplate_983330_plan(
    uint32_t flag_149, uint32_t type_8, int32_t state_c, uint32_t idx_24,
    int32_t elem_cur, IsaacRoomPlateUpdateOut* out) {
  if (out == nullptr) return;
  /* 0x98333a byte gate -> HOST 0x409030 pair (sites 0x983346/0x983351). */
  out->host_calls = ((flag_149 & 0xffu) != 0u) ? 2u : 0u;
  /* 0x983356 mov eax,[esi+8]; sub eax,2; je 0x983367 -> HOST 0x9839f0,
     else HOST 0x9833c0 (both thiscall this=esi). EXACT ==2 match. */
  out->dispatch_va = (type_8 == 2u) ? ISAAC_ROOM_PLATE_HOST_DISPATCH2_VA
                                    : ISAAC_ROOM_PLATE_HOST_DISPATCH1_VA;
  /* Clear-delay tail 0x98336c..0x9833af. First bound is UNSIGNED ja. */
  const uint32_t idx_in_range =
      (idx_24 <= (uint32_t)ISAAC_ROOM_PLATE_IDX_BOUND) ? 1u : 0u;
  const uint32_t timer_open =
      isaac_room_pressureplate_983330_timer_gate(elem_cur);
  if (idx_in_range != 0u && timer_open == 0u) {
    /* jge 0x9833af taken: timer word already >= 0x12c -> no store. */
    out->store_fired = 0u;
  } else if (state_c != 0) { /* 0x983390 cmp [esi+0xc],0 / jne */
    out->store_fired = 0u;
  } else if (idx_in_range == 0u) { /* SECOND unsigned bound 0x98339c */
    out->store_fired = 0u;
  } else {
    out->store_fired = 1u; /* mov [eax+ecx*4+0x76c],0x12c @0x9833a4 */
  }
  out->elem_new =
      (out->store_fired != 0u) ? ISAAC_ROOM_PLATE_TIMER_SET : elem_cur;
}

/* TNT jump-table read (dwords at 0x71f238, verified against the PE). */
extern "C" uint32_t isaac_room_tnt_table_value(uint32_t index) {
  return (index < (uint32_t)ISAAC_ROOM_TNT_TABLE_SIZE)
             ? (uint32_t)ISAAC_ROOM_TNT_TABLE[index]
             : 0u;
}

/* TNT head — 0x71f090..0x71f237 CFG head + dispatch classification. */
extern "C" void isaac_room_tnt_71f090_head(uint32_t state_c,
                                           IsaacRoomTntHeadOut* out) {
  if (out == nullptr) return;
  /* 0x71f0a4 mov ecx,[edi+0xc]; 0x71f0a7 cmp ecx,4; 0x71f0aa cmovge
     eax,edx (SIGNED): >=4 -> edx=0 else eax=2; store @0x71f0ad. */
  out->stored_3c = (static_cast<int32_t>(state_c) >= ISAAC_ROOM_TNT_CMP_BOUND)
                       ? 0
                       : 2;
  /* The SAME cmp flags feed 0x71f0b0 `ja 0x71f231` (UNSIGNED above):
     taken -> plain epilogue ret, no arm dispatch at all. */
  if (state_c > (uint32_t)ISAAC_ROOM_TNT_CMP_BOUND) {
    out->default_taken = 1u;
    out->dispatch_va = ISAAC_ROOM_TNT_DEFAULT_RET_VA;
    return;
  }
  /* 0x71f0b6 jmp dword ptr [ecx*4 + 0x71f238] (in-range by the ja). */
  out->default_taken = 0u;
  out->dispatch_va = isaac_room_tnt_table_value(state_c);
}

/* ------------------------------------------------------------------ v88 ---
   MEDIUM GridEntity Update bodies Gravity 0x0099b980 + Lock 0x00711950
   (evidence pack grid-bodies-large; fresh PE dumps cpu-dump/{0099b980,
   00711950,0040add0,00711af0}.txt). */

/* cvttss2si law shared by both bodies: truncate toward zero; NaN or
   |v| >= 2^31 -> integer-indefinite 0x80000000 (x86 cvttss semantics;
   the range guards keep the final cast in the defined domain). */
static uint32_t isaac_room_v88_cvttss(float v) {
  if (!(v == v)) return 0x80000000u; /* NaN */
  if (!(v < 2147483648.0f)) return 0x80000000u;
  if (!(v >= -2147483648.0f)) return 0x80000000u;
  return (uint32_t)(int32_t)v;
}

/* Gravity per-entity cell-index + flag-RMW law (0x99ba46..0x99ba7c). */
extern "C" void isaac_room_gravity_99b980_iter_plan(
    const IsaacRoomGravity99b980IterSrc* src,
    IsaacRoomGravity99b980IterOut* out) {
  if (src == nullptr || out == nullptr) return;
  const float scale = __builtin_bit_cast(float, ISAAC_ROOM_GRAVITY_SCALE_BITS);
  const float addy = __builtin_bit_cast(float, ISAAC_ROOM_GRAVITY_ADDY_BITS);
  const float half = __builtin_bit_cast(float, ISAAC_ROOM_GRAVITY_HALF_BITS);
  const float px = __builtin_bit_cast(float, src->pos_x_bits);
  const float py = __builtin_bit_cast(float, src->pos_y_bits);
  /* 0x99ba21 subss / 0x99ba2d divss / 0x99ba35 addss (f32 each step). */
  const uint32_t cx = isaac_room_v88_cvttss(((px - scale) / scale) + half);
  const uint32_t cy = isaac_room_v88_cvttss(((py - addy) / scale) + half);
  out->cell_x_bits = cx;
  out->cell_y_bits = cy;
  /* SIGNED js/jge bounds vs [mgr+0xc] / [mgr+0x10]; hit arm is
     imul eax(w), edx(cy) + add eax, esi(cx), all u32 wrap. */
  const int32_t cxs = (int32_t)cx;
  const int32_t cys = (int32_t)cy;
  const int32_t w = (int32_t)src->mgr_w;
  const int32_t h = (int32_t)src->mgr_h;
  int32_t idx = -1;
  if (cxs >= 0 && cxs < w && cys >= 0 && cys < h) {
    idx = (int32_t)((uint32_t)src->mgr_w * (uint32_t)cys + (uint32_t)cxs);
  }
  out->cell_idx = idx;
  /* 0x99ba67 cmp eax,[ebx+0x24] / jne — plain equality. Under match the
     dead RMW pair stores [ent+0x16c] back UNCHANGED while OR-ing
     0x8000 into [ent+0x168]. */
  out->match = (idx == src->this_idx) ? 1u : 0u;
  out->flag_or = (out->match != 0u) ? ISAAC_ROOM_GRAVITY_FLAG_OR : 0u;
}

/* Gravity tail teardown gate 0x99baa2: LOW-8-bit byte test only. */
extern "C" uint32_t isaac_room_gravity_99b980_tail_teardown(uint32_t flag149) {
  return ((flag149 & 0xffu) != 0u) ? 2u : 0u;
}

/* Lock head 0x71195c..0x7119ac: dual gate -> var clear + bounded elem
   store; both paths converge on the loop gate. */
extern "C" void isaac_room_lock_711950_head(
    const IsaacRoomLock711950HeadSrc* src, IsaacRoomLock711950HeadOut* out) {
  if (src == nullptr || out == nullptr) return;
  /* 0x71195c cmp [edx+0x74],0 / je + 0x711977 test al,al / je. */
  const uint32_t armed =
      (src->flag_74 != 0u && src->h_is_type != 0u) ? 1u : 0u;
  /* 0x71197e mov dword [edx+0x3c],0 fires REGARDLESS of the idx bound. */
  out->var3c_cleared = armed;
  /* 0x711985 cmp ecx,0x1bf / ja skips ONLY the elem store (UNSIGNED). */
  out->elem_store_fired =
      (armed != 0u && src->idx_24 <= (uint32_t)ISAAC_ROOM_LOCK_IDX_BOUND)
          ? 1u
          : 0u;
  out->elem_new =
      (out->elem_store_fired != 0u) ? 0 : src->elem_cur;
}

/* Lock per-entity distance law (0x711a22..0x711a94). */
extern "C" void isaac_room_lock_711950_iter_plan(
    const IsaacRoomLock711950IterSrc* src,
    IsaacRoomLock711950IterOut* out) {
  if (src == nullptr || out == nullptr) return;
  /* 0x711a22 cmp [esi+0x2c],0 / jne skips idiv AND the distance chain. */
  out->gate2c_skip = (src->ent_gate_2c != 0u) ? 1u : 0u;
  out->idiv_trap = 0u;
  out->quot = 0;
  out->rem = 0;
  out->host_fired = 0u;
  if (out->gate2c_skip == 0u) {
    /* 0x711a31..0x711a3d SIGNED cdq/idiv by [mgr+0xc]. Divisor 0 or
       INT_MIN over -1 raises #DE in the PE; pinned as trap with
       quot=rem=0 and no downstream fire (unreachable for live widths). */
    if (src->mgr_w == 0 ||
        (src->this_idx == INT32_MIN && src->mgr_w == -1)) {
      out->idiv_trap = 1u;
    } else {
      out->quot = src->this_idx / src->mgr_w;
      out->rem = src->this_idx % src->mgr_w;
    }
    const float scale =
        __builtin_bit_cast(float, ISAAC_ROOM_LOCK_SCALE_BITS);
    const float addy = __builtin_bit_cast(float, ISAAC_ROOM_LOCK_ADDY_BITS);
    const float r2 = __builtin_bit_cast(float, ISAAC_ROOM_LOCK_R2_BITS);
    const float px = __builtin_bit_cast(float, src->pos_x_bits);
    const float py = __builtin_bit_cast(float, src->pos_y_bits);
    /* dx = px - (f32(rem)*40 + 40); dy = py - (f32(quot)*40 + 120);
       every mul/add f32-rounded (0x711a48..0x711a6f); the cvtsi2ss
       loads are VALUE conversions of the signed idiv results. */
    const float dx =
        px - ((float)out->rem * scale + scale);
    const float dy =
        py - ((float)out->quot * scale + addy);
    const float dist2 = dy * dy + dx * dx;
    /* Diagnostic intermediates are pinned CANONICAL +NaN (0x7fc00000)
       when NaN: wasm NaN sign propagation is unspecified and comiss
       consumes orderedness only. */
    out->dx_bits = (dx != dx) ? 0x7fc00000u
                              : __builtin_bit_cast(uint32_t, dx);
    out->dy_bits = (dy != dy) ? 0x7fc00000u
                              : __builtin_bit_cast(uint32_t, dy);
    out->dist2_bits = (dist2 != dist2) ? 0x7fc00000u
                                       : __builtin_bit_cast(uint32_t, dist2);
    /* comiss xmm0(r2), xmm2(dist2) / jbe skip: fire iff ORDERED
       r2 > dist2 (unordered falls into jbe -> no fire). */
    out->host_fired =
        (out->idiv_trap == 0u && r2 > dist2) ? 1u : 0u;
  } else {
    out->dx_bits = 0u;
    out->dy_bits = 0u;
    out->dist2_bits = 0u;
  }
}

/* Lock tail teardown gate 0x711ac0: same LOW-8-bit byte test as Gravity. */
extern "C" uint32_t isaac_room_lock_711950_tail_teardown(uint32_t flag149) {
  return ((flag149 & 0xffu) != 0u) ? 2u : 0u;
}

/* ------------------------------------------------------------------ v89 ---
   MEDIUM GridEntity Update bodies Web 0x00721780 + Decoration 0x0099a8e0
   (evidence pack grid-bodies-large; listings web_00721780.txt +
   decoration_0099a8e0.txt). */

/* Web SIGNED frame%4 idiom 0x72179f..0x7217b3: and eax,0x80000003;
   jns keep; dec/or 0xfffffffc/add 1 sign fixup. */
extern "C" uint32_t isaac_room_web_721780_frame_mod4(int32_t frame) {
  int32_t r = frame & 3;
  if (r != 0 && frame < 0) r -= 4;
  return (uint32_t)r;
}

/* Web type gate 0x72180c..0x721829: four EXACT cmp/je arms over
   {0,1,2,3} == UNSIGNED <4; hit arm jumps to the loop continue. */
extern "C" uint32_t isaac_room_web_721780_type_gate(uint32_t type_184) {
  return (type_184 < 4u) ? 1u : 0u;
}

/* Web body head gates + tail teardown classification
   (0x721789..0x7217ce head, 0x7219e8..0x721a06 tail). */
extern "C" void isaac_room_web_721780_body(
    const IsaacRoomWeb721780BodySrc* src, IsaacRoomWeb721780BodyOut* out) {
  if (src == nullptr || out == nullptr) return;
  /* 0x721789 cmp [ecx+0xc],0 / jne tail; 0x72179f SIGNED %4 / jne tail;
     0x7217c7..0x7217ce test count / je tail (SIGNED zero only — the
     loop bound itself re-derives per iteration under an UNSIGNED jb). */
  out->frame_mod4 = isaac_room_web_721780_frame_mod4(src->frame_264f8);
  const uint32_t early =
      (src->state_c != 0 || out->frame_mod4 != 0u || src->grid_count == 0)
          ? 1u
          : 0u;
  out->loop_entered = early ? 0u : 1u;
  /* Tail runs on EVERY path: LOW-8-bit byte gate fires the pair. */
  out->teardown_pairs = ((src->flag_149 & 0xffu) != 0u) ? 2u : 0u;
}

/* andps abs via bit masking (freestanding: no libc fabs dependency). */
static uint32_t isaac_room_v89_abs_bits(float v) {
  return __builtin_bit_cast(uint32_t, v) & 0x7fffffffu;
}

/* Web per-entity law 0x7217d4..0x721900. */
extern "C" void isaac_room_web_721780_iter_plan(
    const IsaacRoomWeb721780IterSrc* src, IsaacRoomWeb721780IterOut* out) {
  if (src == nullptr || out == nullptr) return;
  out->type_skip = isaac_room_web_721780_type_gate(src->type_184);
  out->query_hosts = 0u;
  out->toggle_fired = 0u;
  out->latch_new = 0u;
  out->prox_checked = 0u;
  out->idiv_trap = 0u;
  out->quot = 0;
  out->rem = 0;
  out->dx_bits = 0u;
  out->dy_bits = 0u;
  out->dist_max_bits = 0u;
  out->spawn_fired = 0u;
  if (out->type_skip != 0u) return;

  /* Query chain 0x72182f..0x721853: direct probe first; on zero al a
     second probe over ent+0x1508. Both al bytes are typed-host inputs.
     Either hit reaches the latch region (0x721855); NEITHER hit jumps
     PAST it straight to the proximity block (je 0x721873). */
  const uint32_t direct = (src->h_query_direct != 0u) ? 1u : 0u;
  const uint32_t alt = (src->h_query_alt != 0u) ? 1u : 0u;
  const uint32_t hit = (direct != 0u || alt != 0u) ? 1u : 0u;
  out->query_hosts = (direct != 0u) ? 1u : 2u;

  /* Latch region 0x721855..0x72186d: [this+4]==0xa `je` continues the
     loop SKIPPING toggle AND proximity; otherwise setne store — sticky
     set to {0,1}, NOT an xor toggle (ORIGINAL DEFECT reproduced). */
  if (hit != 0u && src->kind_4 == (uint32_t)ISAAC_ROOM_WEB_KIND_DISPATCH) {
    return; /* je 0x7219cb */
  }
  if (hit != 0u) {
    out->toggle_fired = 1u;
    out->latch_new = (src->latch_26d4 != 0u) ? 1u : 0u;
  }

  /* Proximity block 0x721873..0x721900. Runs for BOTH the no-hit path
     and the hit-and-kind!=0xa path. */
  out->prox_checked = 1u;
  if (src->mgr_w == 0 ||
      (src->idx_24 == INT32_MIN && src->mgr_w == -1)) {
    /* SIGNED cdq/idiv #DE fault arm pinned like Lock v88. */
    out->idiv_trap = 1u;
    return;
  }
  out->quot = src->idx_24 / src->mgr_w;
  out->rem = src->idx_24 % src->mgr_w;
  const float scale = __builtin_bit_cast(float, ISAAC_ROOM_WEB_SCALE_BITS);
  const float addy = __builtin_bit_cast(float, ISAAC_ROOM_WEB_ADDY_BITS);
  const float thresh =
      __builtin_bit_cast(float, ISAAC_ROOM_WEB_THRESH_BITS);
  const float px = __builtin_bit_cast(float, src->pos_x_bits);
  const float py = __builtin_bit_cast(float, src->pos_y_bits);
  /* dx = px - (f32(rem)*40 + 40); dy = py - (f32(quot)*40 + 120);
     every mul/add f32-rounded (0x7218b9..0x7218d9). */
  const float dx = px - ((float)out->rem * scale + scale);
  const float dy = py - ((float)out->quot * scale + addy);
  /* andps 0xbacb40 abs pair (0x7218dd/0x7218ea), then comiss/cmovbe:
     |dy| <= |dx| (ORDERED-or-unordered; comiss sets CF|ZF on NaN so
     cmovbe TAKES) selects |dx| — i.e. MAX(|dx|,|dy|). */
  const uint32_t adx_b = isaac_room_v89_abs_bits(dx);
  const uint32_t ady_b = isaac_room_v89_abs_bits(dy);
  const float adx = __builtin_bit_cast(float, adx_b);
  const float ady = __builtin_bit_cast(float, ady_b);
  const bool unordered = (adx != adx) || (ady != ady);
  const float sel = (unordered || ady <= adx) ? adx : ady;
  /* Diagnostic intermediates pinned CANONICAL +NaN when NaN (family
     v88 pin; comiss consumes orderedness only). */
  out->dx_bits = (dx != dx) ? 0x7fc00000u
                            : __builtin_bit_cast(uint32_t, dx);
  out->dy_bits = (dy != dy) ? 0x7fc00000u
                            : __builtin_bit_cast(uint32_t, dy);
  out->dist_max_bits =
      (sel != sel) ? 0x7fc00000u : __builtin_bit_cast(uint32_t, sel);
  /* 0x7218fd comiss xmm0(thr),[eax] / jbe continue: spawn iff ORDERED
     thr > max (unordered -> jbe -> skip). */
  out->spawn_fired = (thresh > sel) ? 1u : 0u;
}

/* Web spawn-template dword read (pinned block B+0x00..0x28, verified
   against listing stores 0x72195c..0x72198c). */
extern "C" uint32_t isaac_room_web_spawn_template(uint32_t index) {
  return (index < (uint32_t)ISAAC_ROOM_WEB_SPAWN_TEMPLATE_SIZE)
             ? (uint32_t)ISAAC_ROOM_WEB_SPAWN_TEMPLATE[index]
             : 0u;
}

/* Decoration body gates 0x99a923..0x99a9bf. */
extern "C" void isaac_room_deco_99a8e0_body(
    const IsaacRoomDeco99a8e0BodySrc* src,
    IsaacRoomDeco99a8e0BodyOut* out) {
  if (src == nullptr || out == nullptr) return;
  /* 0x99a923 cmp [edi+8],0x3e8 / je epilogue; 0x99a930 LOW-8-bit flag
     / je epilogue — NO teardown on either early exit. */
  const uint32_t early_ret =
      (src->type_8 == (uint32_t)ISAAC_ROOM_DECO_TYPE_PUDDLE_SKIP ||
       (src->flag_149 & 0xffu) == 0u)
          ? 1u
          : 0u;
  out->early_ret = early_ret;
  out->teardown_pairs = early_ret ? 0u : 2u;
  out->cleared_byte_fired = 0u;
  out->loop_entered = 0u;
  if (early_ret != 0u) return;
  /* 0x99a984 cmp eax,-1 / je cleanup(0x99aba4): a find miss skips BOTH
     the clear-byte store and the scan walk. */
  if (src->h_find_hit == 0u) return;
  out->loop_entered = 1u;
  /* 0x99a98d cmp [edi+0x74],0 / je skip; [this+0x84]=0 @0x99a999 fires
     BEFORE the scan walk. */
  out->cleared_byte_fired = (src->gate_74 != 0u) ? 1u : 0u;
}

/* std::string SSO selection 0x99a963..0x99a970: cmovae picks the heap
   pointer when the capacity field is >= 0x10 UNSIGNED. */
extern "C" uint32_t isaac_room_deco_sso_heap_selected(uint32_t sso_field) {
  return (sso_field >= (uint32_t)ISAAC_ROOM_DECO_SSO_INLINE_CAP) ? 1u : 0u;
}

/* Decoration axis wobble core 0x99a9e1..0x99aad9 (both axes share the
   chain; X/Y differ only in the pinned base/span/phase operands). */
extern "C" void isaac_room_deco_axis_wobble(
    const IsaacRoomDeco99a8e0WobbleSrc* src,
    IsaacRoomDeco99a8e0WobbleOut* out) {
  if (src == nullptr || out == nullptr) return;
  const float pos = __builtin_bit_cast(float, src->pos_bits);
  const float base = __builtin_bit_cast(float, src->base_bits);
  const float pscale = __builtin_bit_cast(float, src->pos_scale_bits);
  const float span_off = __builtin_bit_cast(float, src->span_off_bits);
  const float phase = __builtin_bit_cast(float, src->phase_bss_bits);
  const float scale = __builtin_bit_cast(float, src->scale_bits);
  const float half = __builtin_bit_cast(float, ISAAC_ROOM_DECO_HALF_BITS);
  const float sinr = __builtin_bit_cast(float, src->sin_host_bits);
  /* 0x99aa08 mulss(pos-base)*0.65 ... every op f32-rounded:
     pre_sin = ((phase - span_off) * HALF + (pos - base) * POS_SCALE)
               * scale + HALF */
  const float t_pos = (pos - base) * pscale;
  const float t_phase = (phase - span_off) * half;
  float pre = (t_phase + t_pos) * scale;
  pre = pre + half;
  /* post_div = f32(sin(pre))/scale — sin is the x87 thunk 0xaf0917
     HOST input, f32-rounded by fstp dword before this divide. */
  const float post = sinr / scale;
  out->pre_sin_bits =
      (pre != pre) ? 0x7fc00000u : __builtin_bit_cast(uint32_t, pre);
  out->post_div_bits =
      (post != post) ? 0x7fc00000u : __builtin_bit_cast(uint32_t, post);
}

/* Decoration setter/render phase 0x99ab0c..0x99ab7b. */
extern "C" void isaac_room_deco_render_target(
    uint32_t out_probe_bits, uint32_t vis_byte, uint32_t setter_al,
    IsaacRoomDeco99a8e0RenderOut* out) {
  if (out == nullptr) return;
  out->setter_calls = 0u;
  out->render_pass = 0u;
  out->target_base = 0u;
  /* 0x99ab0c comiss probe,0.0 / jbe next-entity: ORDERED > 0 only
     (NaN unordered sets CF|ZF -> jbe -> nothing). !(probe > 0) skips —
     NaN falls into the skip arm exactly like the unordered jbe. */
  const float probe = __builtin_bit_cast(float, out_probe_bits);
  if (!(probe > 0.0f)) return;
  /* First setter call ALWAYS under a live probe (site 0x0099ab1d). */
  out->setter_calls = 1u;
  /* 0x99ab22 cmp BYTE [ent+0x1570],0 (LOW 8 bits only) -> next entity,
     no second call, no triple copy. */
  if ((vis_byte & 0xffu) != 0u) return;
  out->setter_calls = 2u; /* site 0x0099ab2f */
  out->render_pass = 1u;
  /* 0x99ab39 test al,al / je: al!=0 -> +0x1874 triple, else +0x1848. */
  out->target_base = (setter_al != 0u)
                         ? (uint32_t)ISAAC_ROOM_DECO_RENDER_B_OFF
                         : (uint32_t)ISAAC_ROOM_DECO_RENDER_A_OFF;
}

/* ------------------------------------------------------------------ v88 ---
   GridEntity_Spikes::Update 0x0071e9b0 (exact-ZHL). Fresh dump
   cpu-dump/0071e9b0.txt; 0x71df80 dump cpu-dump/0071df80.txt. */

extern "C" uint32_t isaac_room_spikes_71df80_stage_match(
    uint32_t room_1d18) {
  /* 0x71df80..0x71dfbe: eight EXACT cmp/je on eax = Room+0x1d18, then
     xor al,al / ret else mov al,1 / ret. edx untouched. */
  const int32_t v = (int32_t)room_1d18;
  if (v == 0xa || v == 0xb || v == 0xc || v == 0xd || v == 0x22 ||
      v == 0x2b || v == 0x2c || v == 0x30) {
    return 1u;
  }
  return 0u;
}

extern "C" void isaac_room_spikes_71e9b0_hurt_fire(
    uint32_t room_type, uint32_t type_4, uint32_t variant_8,
    IsaacRoomSpikes71e9b0HurtOut* out) {
  if (out == nullptr) return;
  const int32_t rt = (int32_t)room_type;
  const int32_t ty = (int32_t)type_4;
  /* 0x71e9e0 jae / 0x71e9fe jb: UNSIGNED vs 0x64. */
  const uint32_t vr = variant_8;
  const uint32_t wide =
      (rt == ISAAC_ROOM_SPIKES_ROOM_TYPE_D ||
       vr >= ISAAC_ROOM_SPIKES_VARIANT_WIDE ||
       ty == ISAAC_ROOM_SPIKES_TYPE_COOL)
          ? 1u
          : 0u;
  out->mask = wide ? ISAAC_ROOM_SPIKES_MASK_WIDE
                   : ISAAC_ROOM_SPIKES_MASK_NARROW;
  /* AL ignore: roomType==0xd (mask_wide je) OR (type==8 && variant>=0x64)
     OR type==0x1c. Discriminator: type==5 && variant>=0x64 -> wide mask
     but ignore=0. */
  out->ignore =
      (rt == ISAAC_ROOM_SPIKES_ROOM_TYPE_D ||
       (ty == ISAAC_ROOM_SPIKES_TYPE_SPIKES &&
        vr >= ISAAC_ROOM_SPIKES_VARIANT_WIDE) ||
       ty == ISAAC_ROOM_SPIKES_TYPE_COOL)
          ? 1u
          : 0u;
}

extern "C" void isaac_room_spikes_71e9b0_cost(int32_t state_c,
                                              uint32_t idx_24,
                                              IsaacRoomSpikes71e9b0CostOut* out) {
  if (out == nullptr) return;
  /* 0x71ea25 / 0x71ea51 cmp ecx,0x1bf / ja skip: UNSIGNED. */
  if (idx_24 > ISAAC_ROOM_SPIKES_IDX_BOUND) {
    out->fired = 0u;
    out->value = 0u;
    return;
  }
  out->fired = 1u;
  out->value = (state_c == 0) ? ISAAC_ROOM_SPIKES_COST_DOWN
                              : ISAAC_ROOM_SPIKES_COST_UP;
}

extern "C" uint32_t isaac_room_spikes_71e9b0_anim_va(uint32_t stage_match,
                                                     int32_t state_c) {
  /* 0x71eade test al / 0x71eaf8 test edx,edx / cmovne. edx is the
     PRE-call [this+0xc] — 0x71df80 does not write edx. */
  if (stage_match != 0u) {
    return (state_c != 0) ? ISAAC_ROOM_SPIKES_ANIM_SUMMON_WOMB
                          : ISAAC_ROOM_SPIKES_ANIM_UNSUMMON_WOMB;
  }
  return (state_c != 0) ? ISAAC_ROOM_SPIKES_ANIM_SUMMON
                        : ISAAC_ROOM_SPIKES_ANIM_UNSUMMON;
}

extern "C" void isaac_room_spikes_71e9b0_plan(
    const IsaacRoomSpikes71e9b0PlanSrc* src,
    IsaacRoomSpikes71e9b0PlanOut* out) {
  if (src == nullptr || out == nullptr) return;
  IsaacRoomSpikes71e9b0HurtOut hurt{};
  isaac_room_spikes_71e9b0_hurt_fire(src->room_type, src->type_4,
                                     src->variant_8, &hurt);
  IsaacRoomSpikes71e9b0CostOut cost{};
  isaac_room_spikes_71e9b0_cost(src->state_c, src->idx_24, &cost);
  const uint32_t hurt_fired = (src->state_c == 0) ? 1u : 0u;
  const uint32_t stage =
      isaac_room_spikes_71df80_stage_match(src->room_1d18);
  out->hurt_fired = hurt_fired;
  out->hurt_mask = hurt_fired ? hurt.mask : 0u;
  out->hurt_ignore = hurt_fired ? hurt.ignore : 0u;
  out->cost_fired = cost.fired;
  out->cost_value = cost.value;
  out->eb30_fired = 0u;
  out->timer_dec = 0u;
  out->timer_new = src->timer_154;
  out->state_c_new = src->state_c;
  out->anim_play = 0u;
  out->anim_va = 0u;
  out->stage_match = stage;
  /* 0x71eb03 cmp byte [esi+0x149],0: LOW-8-bit only. */
  out->teardown_pairs =
      ((src->flag_149 & 0xffu) != 0u) ? 2u : 0u; /* spikes 0x149 */
  if (src->pred_al != 0u) {
    /* 0x71ea7a..0x71ea8d: stateC==0 OR (field74!=0 AND flag84 LOW!=0). */
    const uint32_t flag84_on = ((src->flag_84 & 0xffu) != 0u) ? 1u : 0u;
    if (src->state_c == 0 ||
        (src->field_74 != 0u && flag84_on != 0u)) {
      out->eb30_fired = 1u;
    }
    return;
  }
  /* pred AL==0: type-9 SIGNED timer. 0x71eaa6 test eax,eax / jle skip. */
  if (src->type_4 != (uint32_t)ISAAC_ROOM_SPIKES_TYPE_TIMER) return;
  if (src->timer_154 <= 0) return;
  out->timer_dec = 1u;
  const int32_t next = src->timer_154 - 1;
  if (next > 0) {
    out->timer_new = next;
    if (next == 5) {
      out->anim_play = 1u;
      out->anim_va = isaac_room_spikes_71e9b0_anim_va(stage, src->state_c);
    }
    return;
  }
  /* Expire: [this+0x154]=0x3c; sete from [this+0xc]==0. */
  out->timer_new = ISAAC_ROOM_SPIKES_TIMER_RELOAD;
  out->state_c_new = (src->state_c == 0) ? 1 : 0;
}
