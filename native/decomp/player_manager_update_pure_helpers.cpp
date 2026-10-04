#include "player_manager_update_pure_helpers.h"

#include <stddef.h>

/* PlayerManager::Update pure helpers (VA 0x009bb5d0).
   Evidence: PE at VA 0x009bb5d0..0x009bb78a; decompile
   output/decomp/5129df723e64/player-manager-update/decompiled/
   009bb5d0_PlayerManager_Update.c
   section-notes/player-manager-update/NOTES.md
   section-notes/player-manager-update/PM2-INTENSITY-PEEL.md
   section-notes/pm-v4/

   PM0 dual-zero + PM1 death eligibility pure CF (v4) +
   PM2 pure island + PM3 residual plan + freestanding wire_decide (v3 retained).
   TriggerDeath body and PM3 audio manager state stay host.

   v5 adds PMW (player-vector walk CF), PMS (SFX entry-table gate shared by
   0x0092e560 / 0x0092e230 / 0x0092df40 / 0x0092e050) and PMP (pre-play
   0x00956780 heartbeat id + global xorshift). See section-notes/pm-hud-v5/.

   v6 adds TD: pure islands of exact Entity_Player::TriggerDeath(bool)
   @ 0x007a1090 (checkOnly early-out, magic-static guard protocol, self/twin
   scratch-vector ordering, pocket slot clamp, pocket scan + compaction).
   The ~4.4 KB body stays host. See section-notes/pm-hud-v6/.
   Helpers ABI v6. */

namespace {

inline float f32_bits(uint32_t bits) {
  return __builtin_bit_cast(float, bits);
}

/* SSE maxss: if a > b (ordered) keep a, else b (NaN or a <= b → b). */
inline float sse_maxss(float a, float b) {
  return a > b ? a : b;
}

/* SSE minss: if a < b (ordered) keep a, else b (NaN or a >= b → b). */
inline float sse_minss(float a, float b) {
  return a < b ? a : b;
}

inline float scale_20() {
  return f32_bits(ISAAC_PM_INTENSITY_F32_SCALE_20_BITS);
}

inline float one() {
  return f32_bits(ISAAC_PM_INTENSITY_F32_ONE_BITS);
}

inline float threshold() {
  return f32_bits(ISAAC_PM_INTENSITY_F32_THRESHOLD_BITS);
}

inline float play_pitch() {
  return f32_bits(ISAAC_PM_INTENSITY_PLAY_PITCH_BITS);
}

inline float play_pan() {
  return f32_bits(ISAAC_PM_INTENSITY_PLAY_PAN_BITS);
}

inline float clamp_raw_impl(int32_t raw_1ea8) {
  /* PE: movd xmm0, esi; cvtdq2ps xmm0, xmm0; divss /20; maxss 0; minss 1 */
  float x = static_cast<float>(raw_1ea8) / scale_20();
  x = sse_maxss(x, 0.0f);
  x = sse_minss(x, one());
  return x;
}

inline void fill_intensity_plan(float max_vol,
                                IsaacPlayerManagerIntensityPlan* out) {
  if (out == nullptr) {
    return;
  }
  out->max_vol = max_vol;
  out->sfx_start_needed = isaac_pm_intensity_sfx_start_needed(max_vol);
  out->sfx_stop_candidate = out->sfx_start_needed == 0 ? 1 : 0;
}

inline void fill_host_arg_constants(IsaacPlayerManagerHeartbeatPlan* out) {
  out->sfx_id = static_cast<uint32_t>(ISAAC_PM_INTENSITY_SFX_ID);
  out->play_frame_delay = ISAAC_PM_INTENSITY_PLAY_FRAME_DELAY;
  out->play_loop = ISAAC_PM_INTENSITY_PLAY_LOOP;
  out->play_pitch = play_pitch();
  out->play_pan = play_pan();
}

inline void fill_heartbeat_from_kind(float max_vol,
                                     int32_t residual_kind,
                                     int32_t pm2_pure,
                                     IsaacPlayerManagerHeartbeatPlan* out) {
  if (out == nullptr) {
    return;
  }
  out->max_vol = max_vol;
  out->residual_kind = residual_kind;
  out->pure_complete =
      residual_kind == ISAAC_PM_INTENSITY_SFX_RESIDUAL_NONE ? 1 : 0;
  out->host_needed = out->pure_complete == 0 ? 1 : 0;
  out->pm2_pure = pm2_pure != 0 ? 1 : 0;
  fill_host_arg_constants(out);
}

inline void fill_death_host_constants(IsaacPlayerManagerDeathPlan* out) {
  out->trigger_death_va =
      static_cast<uint32_t>(ISAAC_PM_DEATH_HOST_VA_TRIGGER_DEATH);
  out->trigger_arg = ISAAC_PM_DEATH_TRIGGER_ARG_CHECK_ONLY;
}

inline void fill_death_from_kind(int32_t residual_kind,
                                 int32_t death_walk_gate,
                                 int32_t pm1_pure,
                                 int32_t eligible_count,
                                 uint32_t eligible_mask,
                                 IsaacPlayerManagerDeathPlan* out) {
  if (out == nullptr) {
    return;
  }
  out->residual_kind = residual_kind;
  out->pure_complete =
      residual_kind == ISAAC_PM_DEATH_RESIDUAL_NONE ? 1 : 0;
  out->host_needed = out->pure_complete == 0 ? 1 : 0;
  out->death_walk_gate = death_walk_gate != 0 ? 1 : 0;
  out->pm1_pure = pm1_pure != 0 ? 1 : 0;
  out->eligible_count = eligible_count;
  out->eligible_mask = eligible_mask;
  fill_death_host_constants(out);
}

}  // namespace

/* ---------- PM0 / PM1 death pure CF ---------- */

extern "C" int32_t isaac_pm_death_dual_zero_gate(int32_t gate1b83c,
                                                 int32_t gate1ba78) {
  /* PE: cmp [Game+0x1b83c],0; jnz skip; cmp [Game+0x1ba78],0; jnz skip */
  return (gate1b83c == 0 && gate1ba78 == 0) ? 1 : 0;
}

extern "C" int32_t isaac_pm_death_anim_idle(int32_t anim_7c, uint32_t anim_8c) {
  /* PE: cmp dword [+0x7c],0; jz idle; cmp byte [+0x8c],0; jnz not-idle.
     anim_8c is a byte test: widened parameter, explicit low-byte mask. */
  if (anim_7c == 0) {
    return 1;
  }
  if ((anim_8c & 0xffu) == 0u) {
    return 1;
  }
  return 0;
}

extern "C" int32_t isaac_pm_death_player_eligible(uint32_t dead_173,
                                                  int32_t anim_7c,
                                                  uint32_t anim_8c,
                                                  uint32_t twin_null,
                                                  int32_t twin_anim_7c,
                                                  uint32_t twin_anim_8c) {
  /* PE 0x009bb648..0x009bb677:
       dead != 0
       && (anim_7c == 0 || anim_8c == 0)
       && (twin_ptr == 0 || twin_7c == 0 || twin_8c == 0)
     dead/anim_8c/twin_anim_8c are byte tests; twin_null models a 32-bit
     pointer-null test collapsed to one flag byte by the pack layout, so its
     low byte is what the pack stores — all four masked explicitly. */
  if ((dead_173 & 0xffu) == 0u) {
    return 0;
  }
  if (isaac_pm_death_anim_idle(anim_7c, anim_8c) == 0) {
    return 0;
  }
  if ((twin_null & 0xffu) != 0u) {
    return 1;
  }
  return isaac_pm_death_anim_idle(twin_anim_7c, twin_anim_8c);
}

extern "C" int32_t isaac_pm_death_player_eligible_pack(
    const IsaacPlayerManagerDeathPlayer* player) {
  if (player == nullptr) {
    return 0;
  }
  return isaac_pm_death_player_eligible(player->dead_173, player->anim_7c,
                                        player->anim_8c, player->twin_null,
                                        player->twin_anim_7c,
                                        player->twin_anim_8c);
}

extern "C" int32_t isaac_pm_death_eligible_count(
    const IsaacPlayerManagerDeathPlayer* players, int32_t count) {
  if (players == nullptr || count <= 0) {
    return 0;
  }
  int32_t n = 0;
  for (int32_t i = 0; i < count; ++i) {
    if (isaac_pm_death_player_eligible_pack(&players[i]) != 0) {
      ++n;
    }
  }
  return n;
}

extern "C" uint32_t isaac_pm_death_eligible_mask(
    const IsaacPlayerManagerDeathPlayer* players, int32_t count) {
  uint32_t mask = 0;
  if (players == nullptr || count <= 0) {
    return mask;
  }
  const int32_t n = count > 32 ? 32 : count;
  for (int32_t i = 0; i < n; ++i) {
    if (isaac_pm_death_player_eligible_pack(&players[i]) != 0) {
      mask |= (1u << static_cast<uint32_t>(i));
    }
  }
  return mask;
}

extern "C" int32_t isaac_pm_death_walk_pure_complete(int32_t residual_kind) {
  return residual_kind == ISAAC_PM_DEATH_RESIDUAL_NONE ? 1 : 0;
}

extern "C" void isaac_pm_death_plan_from_players(
    int32_t gate1b83c,
    int32_t gate1ba78,
    const IsaacPlayerManagerDeathPlayer* players,
    int32_t count,
    IsaacPlayerManagerDeathPlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t gate = isaac_pm_death_dual_zero_gate(gate1b83c, gate1ba78);
  if (gate == 0) {
    fill_death_from_kind(ISAAC_PM_DEATH_RESIDUAL_NONE, /*gate=*/0,
                         /*pm1_pure=*/1, /*elig=*/0, /*mask=*/0, out);
    return;
  }
  const int32_t n = count < 0 ? 0 : count;
  const int32_t elig = isaac_pm_death_eligible_count(players, n);
  const uint32_t mask = isaac_pm_death_eligible_mask(players, n);
  if (elig == 0) {
    fill_death_from_kind(ISAAC_PM_DEATH_RESIDUAL_NONE, /*gate=*/1,
                         /*pm1_pure=*/1, /*elig=*/0, /*mask=*/0, out);
    return;
  }
  fill_death_from_kind(ISAAC_PM_DEATH_RESIDUAL_WALK, /*gate=*/1,
                       /*pm1_pure=*/1, elig, mask, out);
}

extern "C" void isaac_pm_death_wire_decide(
    int32_t gate1b83c,
    int32_t gate1ba78,
    int32_t player_count,
    int32_t blob_ready,
    const IsaacPlayerManagerDeathPlayer* players,
    int32_t pack_count,
    IsaacPlayerManagerDeathPlan* out) {
  if (out == nullptr) {
    return;
  }

  const int32_t gate = isaac_pm_death_dual_zero_gate(gate1b83c, gate1ba78);
  if (gate == 0) {
    fill_death_from_kind(ISAAC_PM_DEATH_RESIDUAL_NONE, /*gate=*/0,
                         /*pm1_pure=*/1, /*elig=*/0, /*mask=*/0, out);
    return;
  }

  const int32_t count = player_count < 0 ? 0 : player_count;
  /* PE outer: if count==0 skip loop — no empty-vector fatal. Pure-complete. */
  if (count == 0) {
    fill_death_from_kind(ISAAC_PM_DEATH_RESIDUAL_NONE, /*gate=*/1,
                         /*pm1_pure=*/1, /*elig=*/0, /*mask=*/0, out);
    return;
  }

  const int32_t ready = blob_ready != 0 ? 1 : 0;
  if (ready == 0) {
    fill_death_from_kind(ISAAC_PM_DEATH_RESIDUAL_MONOLITHIC, /*gate=*/1,
                         /*pm1_pure=*/0, /*elig=*/0, /*mask=*/0, out);
    return;
  }
  if (count > ISAAC_PM_DEATH_PLAYER_MAX) {
    fill_death_from_kind(ISAAC_PM_DEATH_RESIDUAL_MONOLITHIC, /*gate=*/1,
                         /*pm1_pure=*/0, /*elig=*/0, /*mask=*/0, out);
    return;
  }
  if (players == nullptr || pack_count < count) {
    fill_death_from_kind(ISAAC_PM_DEATH_RESIDUAL_MONOLITHIC, /*gate=*/1,
                         /*pm1_pure=*/0, /*elig=*/0, /*mask=*/0, out);
    return;
  }

  int32_t n = pack_count;
  if (n < 0) {
    n = 0;
  }
  if (n > count) {
    n = count;
  }
  if (n > ISAAC_PM_DEATH_PLAYER_MAX) {
    n = ISAAC_PM_DEATH_PLAYER_MAX;
  }

  const int32_t elig = isaac_pm_death_eligible_count(players, n);
  const uint32_t mask = isaac_pm_death_eligible_mask(players, n);
  if (elig == 0) {
    fill_death_from_kind(ISAAC_PM_DEATH_RESIDUAL_NONE, /*gate=*/1,
                         /*pm1_pure=*/1, /*elig=*/0, /*mask=*/0, out);
    return;
  }
  fill_death_from_kind(ISAAC_PM_DEATH_RESIDUAL_WALK, /*gate=*/1,
                       /*pm1_pure=*/1, elig, mask, out);
}

extern "C" uint32_t isaac_pm_death_trigger_va(void) {
  return static_cast<uint32_t>(ISAAC_PM_DEATH_HOST_VA_TRIGGER_DEATH);
}

extern "C" int32_t isaac_pm_death_trigger_arg(void) {
  return ISAAC_PM_DEATH_TRIGGER_ARG_CHECK_ONLY;
}

/* ---------- PM2 intensity pure CF ---------- */

extern "C" int32_t isaac_pm_intensity_player_eligible(int32_t raw_1ea8,
                                                      uint32_t flags_168,
                                                      uint32_t dead_173) {
  /* PE: test esi,esi; jle skip; and eax,0x40; jnz skip; cmp dead,0; jnz skip.
     dead_173 is a byte test: widened parameter, explicit low-byte mask. */
  if (raw_1ea8 <= 0) {
    return 0;
  }
  if ((flags_168 & static_cast<uint32_t>(ISAAC_PM_INTENSITY_FLAG_BIT_40)) !=
      0u) {
    return 0;
  }
  if ((dead_173 & 0xffu) != 0u) {
    return 0;
  }
  return 1;
}

extern "C" float isaac_pm_intensity_clamp_raw(int32_t raw_1ea8) {
  return clamp_raw_impl(raw_1ea8);
}

extern "C" float isaac_pm_intensity_player_contrib(int32_t raw_1ea8,
                                                   uint32_t flags_168,
                                                   uint32_t dead_173) {
  if (isaac_pm_intensity_player_eligible(raw_1ea8, flags_168, dead_173) == 0) {
    return 0.0f;
  }
  return clamp_raw_impl(raw_1ea8);
}

extern "C" float isaac_pm_intensity_max_over_players(
    const IsaacPlayerManagerIntensityPlayer* players, int32_t count) {
  /* PE: xorps xmm1, xmm1; loop maxss; empty count → leave 0 */
  float max_vol = 0.0f;
  if (players == nullptr || count <= 0) {
    return max_vol;
  }
  for (int32_t i = 0; i < count; ++i) {
    const IsaacPlayerManagerIntensityPlayer& p = players[i];
    const float contrib = isaac_pm_intensity_player_contrib(
        p.raw_1ea8, p.flags_168, p.dead_173);
    max_vol = sse_maxss(max_vol, contrib);
  }
  return max_vol;
}

extern "C" float isaac_pm_intensity_max_over_arrays(const int32_t* raw_1ea8,
                                                    const uint32_t* flags_168,
                                                    const uint8_t* dead_173,
                                                    int32_t count) {
  float max_vol = 0.0f;
  if (raw_1ea8 == nullptr || flags_168 == nullptr || dead_173 == nullptr ||
      count <= 0) {
    return max_vol;
  }
  for (int32_t i = 0; i < count; ++i) {
    const float contrib = isaac_pm_intensity_player_contrib(
        raw_1ea8[i], flags_168[i], dead_173[i]);
    max_vol = sse_maxss(max_vol, contrib);
  }
  return max_vol;
}

extern "C" void isaac_pm_intensity_plan_from_players(
    const IsaacPlayerManagerIntensityPlayer* players,
    int32_t count,
    IsaacPlayerManagerIntensityPlan* out) {
  fill_intensity_plan(isaac_pm_intensity_max_over_players(players, count), out);
}

extern "C" void isaac_pm_intensity_plan_from_arrays(
    const int32_t* raw_1ea8,
    const uint32_t* flags_168,
    const uint8_t* dead_173,
    int32_t count,
    IsaacPlayerManagerIntensityPlan* out) {
  fill_intensity_plan(
      isaac_pm_intensity_max_over_arrays(raw_1ea8, flags_168, dead_173, count),
      out);
}

extern "C" int32_t isaac_pm_intensity_sfx_start_needed(float max_vol) {
  /* PE: comiss [0.01], maxVol; jb play
     CF=1 when threshold < maxVol or unordered. C: !(threshold >= maxVol)
     is true for NaN and for maxVol > threshold. */
  const float thr = threshold();
  return !(thr >= max_vol) ? 1 : 0;
}

extern "C" int32_t isaac_pm_intensity_sfx_stop_candidate(float max_vol) {
  /* Else branch of the same comiss/jb — ordered maxVol <= 0.01f. */
  return isaac_pm_intensity_sfx_start_needed(max_vol) == 0 ? 1 : 0;
}

extern "C" int32_t isaac_pm_intensity_sfx_residual_kind(float max_vol,
                                                        int32_t is_playing) {
  const int32_t playing = is_playing != 0 ? 1 : 0;
  if (isaac_pm_intensity_sfx_start_needed(max_vol) != 0) {
    return playing != 0 ? ISAAC_PM_INTENSITY_SFX_RESIDUAL_UPDATE
                        : ISAAC_PM_INTENSITY_SFX_RESIDUAL_PLAY;
  }
  return playing != 0 ? ISAAC_PM_INTENSITY_SFX_RESIDUAL_STOP
                      : ISAAC_PM_INTENSITY_SFX_RESIDUAL_NONE;
}

extern "C" int32_t isaac_pm_intensity_heartbeat_pure_complete(
    float max_vol, int32_t is_playing) {
  return isaac_pm_intensity_sfx_residual_kind(max_vol, is_playing) ==
                 ISAAC_PM_INTENSITY_SFX_RESIDUAL_NONE
             ? 1
             : 0;
}

extern "C" void isaac_pm_intensity_heartbeat_plan(
    float max_vol, int32_t is_playing, IsaacPlayerManagerHeartbeatPlan* out) {
  const int32_t kind =
      isaac_pm_intensity_sfx_residual_kind(max_vol, is_playing);
  fill_heartbeat_from_kind(max_vol, kind, /*pm2_pure=*/1, out);
}

extern "C" void isaac_pm_intensity_wire_decide(
    int32_t player_count,
    int32_t blob_ready,
    int32_t sfx_playing,
    const IsaacPlayerManagerIntensityPlayer* players,
    int32_t pack_count,
    IsaacPlayerManagerHeartbeatPlan* out) {
  if (out == nullptr) {
    return;
  }

  const int32_t count = player_count < 0 ? 0 : player_count;
  const int32_t ready = blob_ready != 0 ? 1 : 0;

  /* count > 0 without pack → host keeps whole PM2+PM3. */
  if (count > 0 && ready == 0) {
    fill_heartbeat_from_kind(
        0.0f, ISAAC_PM_INTENSITY_SFX_RESIDUAL_MONOLITHIC, /*pm2_pure=*/0, out);
    return;
  }

  /* Pack ready but vector longer than MAX → refuse partial pure max. */
  if (ready != 0 && count > ISAAC_PM_INTENSITY_PLAYER_MAX) {
    fill_heartbeat_from_kind(
        0.0f, ISAAC_PM_INTENSITY_SFX_RESIDUAL_MONOLITHIC, /*pm2_pure=*/0, out);
    return;
  }

  float max_vol = 0.0f;
  if (ready != 0) {
    int32_t n = pack_count;
    if (n < 0) {
      n = 0;
    }
    if (n > count) {
      n = count;
    }
    if (n > ISAAC_PM_INTENSITY_PLAYER_MAX) {
      n = ISAAC_PM_INTENSITY_PLAYER_MAX;
    }
    /* Incomplete pack for non-empty vector → monolithic (no silent under-max). */
    if (count > 0 && (players == nullptr || pack_count < count)) {
      fill_heartbeat_from_kind(0.0f, ISAAC_PM_INTENSITY_SFX_RESIDUAL_MONOLITHIC,
                               /*pm2_pure=*/0, out);
      return;
    }
    max_vol = isaac_pm_intensity_max_over_players(players, n);
  }
  /* else count == 0: PE empty loop leaves maxVol = 0; no pack required. */

  const int32_t kind =
      isaac_pm_intensity_sfx_residual_kind(max_vol, sfx_playing);
  fill_heartbeat_from_kind(max_vol, kind, /*pm2_pure=*/1, out);
}

extern "C" uint32_t isaac_pm_intensity_sfx_id(void) {
  return static_cast<uint32_t>(ISAAC_PM_INTENSITY_SFX_ID);
}

extern "C" int32_t isaac_pm_intensity_play_frame_delay(void) {
  return ISAAC_PM_INTENSITY_PLAY_FRAME_DELAY;
}

extern "C" int32_t isaac_pm_intensity_play_loop(void) {
  return ISAAC_PM_INTENSITY_PLAY_LOOP;
}

extern "C" float isaac_pm_intensity_play_pitch(void) {
  return play_pitch();
}

extern "C" float isaac_pm_intensity_play_pan(void) {
  return play_pan();
}

/* ---------- PMW: player-vector walk CF ---------- */

extern "C" int32_t isaac_pm_player_count_from_span(int32_t span_bytes) {
  /* PE: sub eax, [begin] ; sar eax, 2 — arithmetic shift keeps the sign. */
  return span_bytes >> ISAAC_PM_PLAYER_PTR_SHIFT;
}

extern "C" int32_t isaac_pm_player_index_select(uint32_t index,
                                                int32_t count) {
  /* PE: cmp edi, ecx ; jae skip_lea — unsigned. The skip path leaves eax at
     begin, i.e. element 0. */
  if (index < static_cast<uint32_t>(count)) {
    return static_cast<int32_t>(index);
  }
  return 0;
}

extern "C" int32_t isaac_pm_walk_enter(int32_t count) {
  /* PE: test eax, eax ; je past_loop. */
  return count != 0 ? 1 : 0;
}

extern "C" int32_t isaac_pm_walk_needs_empty_fatal(int32_t count_now) {
  /* PE: test eax, eax ; jne skip_fatal. */
  return count_now == 0 ? 1 : 0;
}

extern "C" int32_t isaac_pm_walk_continue(uint32_t next_index,
                                          int32_t count_reloaded) {
  /* PE: inc edi ; cmp edi, eax ; jb loop_top — unsigned. */
  return next_index < static_cast<uint32_t>(count_reloaded) ? 1 : 0;
}

/* ---------- PMS: SFX entry-table gate ---------- */

namespace {

/* Exact PE sequence: mov eax, 0x94f2095 ; imul span ; sar edx, 4 ;
   mov eax, edx ; shr eax, 0x1f ; add eax, edx. */
inline int32_t sfx_entry_count_impl(int32_t span_bytes) {
  const int64_t product =
      static_cast<int64_t>(static_cast<int32_t>(ISAAC_PM_SFX_ENTRY_DIV_MAGIC)) *
      static_cast<int64_t>(span_bytes);
  const int32_t high = static_cast<int32_t>(
      static_cast<uint32_t>(static_cast<uint64_t>(product) >> 32));
  const int32_t shifted = high >> ISAAC_PM_SFX_ENTRY_DIV_SHIFT;
  const uint32_t sign = static_cast<uint32_t>(shifted) >> 31;
  return static_cast<int32_t>(static_cast<uint32_t>(shifted) + sign);
}

inline int32_t sfx_gate_impl(int32_t id,
                             int32_t span_bytes,
                             uint32_t voices_190,
                             uint32_t enabled_198) {
  /* PE: test id, id ; js miss. */
  if (id < 0) {
    return ISAAC_PM_SFX_GATE_MISS;
  }
  /* PE: cmp id, count ; jge miss (signed). */
  if (id >= sfx_entry_count_impl(span_bytes)) {
    return ISAAC_PM_SFX_GATE_MISS;
  }
  /* PE: cmp dword [entry+0x190], 0 ; jbe / ja (unsigned vs 0). */
  if (voices_190 == 0u) {
    return ISAAC_PM_SFX_GATE_NO_SAMPLES;
  }
  /* PE: cmp byte [entry+0x198], 0 ; je — byte test, low byte masked. */
  if ((enabled_198 & 0xffu) == 0u) {
    return ISAAC_PM_SFX_GATE_DISABLED;
  }
  return ISAAC_PM_SFX_GATE_LIVE;
}

}  // namespace

extern "C" int32_t isaac_pm_sfx_entry_count_from_span(int32_t span_bytes) {
  return sfx_entry_count_impl(span_bytes);
}

extern "C" int32_t isaac_pm_sfx_entry_byte_offset(int32_t id) {
  /* PE: imul reg, id, 0x1b8 — 32-bit wrap, no range check. */
  return static_cast<int32_t>(static_cast<uint32_t>(id) *
                              static_cast<uint32_t>(ISAAC_PM_SFX_ENTRY_STRIDE));
}

extern "C" int32_t isaac_pm_sfx_entry_index_in_range(int32_t id,
                                                     int32_t span_bytes) {
  if (id < 0) {
    return 0;
  }
  return id < sfx_entry_count_impl(span_bytes) ? 1 : 0;
}

extern "C" int32_t isaac_pm_sfx_entry_gate(int32_t id,
                                           int32_t span_bytes,
                                           uint32_t voices_190,
                                           uint32_t enabled_198) {
  return sfx_gate_impl(id, span_bytes, voices_190, enabled_198);
}

extern "C" void isaac_pm_sfx_entry_gate_plan(int32_t id,
                                             int32_t span_bytes,
                                             uint32_t voices_190,
                                             uint32_t enabled_198,
                                             IsaacPlayerManagerSfxGate* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t kind = sfx_gate_impl(id, span_bytes, voices_190, enabled_198);
  const int32_t in_range = isaac_pm_sfx_entry_index_in_range(id, span_bytes);
  out->kind = kind;
  out->entry_count = sfx_entry_count_impl(span_bytes);
  out->entry_offset = in_range != 0 ? isaac_pm_sfx_entry_byte_offset(id) : 0;
  out->index_in_range = in_range;
  out->probe_known = isaac_pm_sfx_is_playing_known(kind);
  out->probe_result = isaac_pm_sfx_is_playing_pure_result(kind);
  out->warn_log_needed = kind == ISAAC_PM_SFX_GATE_NO_SAMPLES ? 1 : 0;
  out->voice_loop_needed = kind == ISAAC_PM_SFX_GATE_LIVE ? 1 : 0;
}

extern "C" int32_t isaac_pm_sfx_is_playing_known(int32_t gate_kind) {
  return gate_kind != ISAAC_PM_SFX_GATE_LIVE ? 1 : 0;
}

extern "C" int32_t isaac_pm_sfx_is_playing_pure_result(int32_t gate_kind) {
  /* Every non-LIVE gate falls through to `xor al,al` at VA 0x0092e5ff. */
  (void)gate_kind;
  return 0;
}

extern "C" int32_t isaac_pm_sfx_mutator_pure_complete(int32_t gate_kind) {
  return (gate_kind == ISAAC_PM_SFX_GATE_MISS ||
          gate_kind == ISAAC_PM_SFX_GATE_DISABLED)
             ? 1
             : 0;
}

extern "C" uint32_t isaac_pm_sfx_manager_receiver(uint32_t global_c7169c) {
  return static_cast<uint32_t>(global_c7169c +
                               static_cast<uint32_t>(ISAAC_PM_SFX_MANAGER_OFF));
}

/* ---------- PMP: pre-play 0x00956780 heartbeat id ---------- */

extern "C" uint32_t isaac_pm_pre_play_rng_next(uint32_t seed,
                                               uint32_t shift1,
                                               uint32_t shift2,
                                               uint32_t shift3) {
  /* PE VA 0x00956830..0x00956857; x86 shr/shl mask cl to 5 bits. */
  uint32_t x = seed;
  x ^= x >> (shift1 & 31u);
  x ^= x << (shift2 & 31u);
  x ^= x >> (shift3 & 31u);
  return x;
}

extern "C" int32_t isaac_pm_pre_play_rare_hit(uint32_t seed_out) {
  /* PE: mul 0xcccccccd ; shr edx,4 ; lea/shl *20 ; sub ; jne keep. */
  return (seed_out % static_cast<uint32_t>(ISAAC_PM_PRE_PLAY_RARE_MODULUS)) ==
                 0u
             ? 1
             : 0;
}

extern "C" void isaac_pm_pre_play_plan(int32_t game_null,
                                       int32_t entry_found,
                                       uint32_t seed,
                                       uint32_t shift1,
                                       uint32_t shift2,
                                       uint32_t shift3,
                                       IsaacPlayerManagerPrePlayPlan* out) {
  if (out == nullptr) {
    return;
  }

  /* PE: mov eax,[0xc71678]; test eax,eax; je done — id untouched. */
  if (game_null != 0) {
    out->sound_id = ISAAC_PM_PRE_PLAY_ID_DEFAULT;
    out->rng_seed_out = seed;
    out->rng_advanced = 0;
    out->host_lookup_needed = 0;
    out->seed_zero_fatal = 0;
    out->pure_complete = 1;
    return;
  }

  /* The container lookup at 0x004288a0 always runs once the Game pointer is
     live, so the host must supply entry_found even on the reject path. */
  if (entry_found == 0) {
    out->sound_id = ISAAC_PM_PRE_PLAY_ID_DEFAULT;
    out->rng_seed_out = seed;
    out->rng_advanced = 0;
    out->host_lookup_needed = 1;
    out->seed_zero_fatal = 0;
    out->pure_complete = 0;
    return;
  }

  /* PE: mov dword [edi], 0x25 before the RNG step. */
  int32_t id = ISAAC_PM_PRE_PLAY_ID_FOUND;

  if (seed == 0u) {
    /* PE logs "RNG Seed is zero!" then re-reads and int3s if still zero.
       No pure successor state exists; leave the seed and stop at 0x25. */
    out->sound_id = id;
    out->rng_seed_out = 0u;
    out->rng_advanced = 0;
    out->host_lookup_needed = 1;
    out->seed_zero_fatal = 1;
    out->pure_complete = 0;
    return;
  }

  const uint32_t next =
      isaac_pm_pre_play_rng_next(seed, shift1, shift2, shift3);
  if (isaac_pm_pre_play_rare_hit(next) != 0) {
    id = ISAAC_PM_PRE_PLAY_ID_RARE;
  }
  out->sound_id = id;
  out->rng_seed_out = next;
  out->rng_advanced = 1;
  out->host_lookup_needed = 1;
  out->seed_zero_fatal = 0;
  out->pure_complete = 0;
}

extern "C" int32_t isaac_pm_pre_play_sound_id(int32_t game_null,
                                              int32_t entry_found,
                                              uint32_t seed,
                                              uint32_t shift1,
                                              uint32_t shift2,
                                              uint32_t shift3) {
  IsaacPlayerManagerPrePlayPlan plan = {};
  isaac_pm_pre_play_plan(game_null, entry_found, seed, shift1, shift2, shift3,
                         &plan);
  return plan.sound_id;
}

extern "C" int32_t isaac_pm_intensity_play_id(int32_t game_null,
                                              int32_t entry_found,
                                              uint32_t seed,
                                              uint32_t shift1,
                                              uint32_t shift2,
                                              uint32_t shift3) {
  /* VA 0x009bb827 pushes the same local 0x00956780 was handed. */
  return isaac_pm_pre_play_sound_id(game_null, entry_found, seed, shift1,
                                    shift2, shift3);
}

/* ---- TD: Entity_Player::TriggerDeath pure islands (ABI v6) ---- */

extern "C" int32_t isaac_pm_td_early_kind(int32_t state_2c,
                                          uint32_t check_only) {
  /* PE 0x007a10ad: cmp dword [ebx+0x2c], 1 ; jne 0x007a10f0 */
  if (state_2c != 1) {
    return ISAAC_PM_TD_EARLY_NONE;
  }
  /* PE 0x007a10b3: cmp byte [ebp+8], 0 ; jne 0x007a1ca1
     The argument occupies a 4-byte stack slot but only its low byte is
     tested, so mask explicitly — the Wasm ABI does not narrow the i32
     parameter for us. */
  if ((check_only & 0xffu) != 0u) {
    return ISAAC_PM_TD_EARLY_CHECK_ONLY;
  }
  return ISAAC_PM_TD_EARLY_REMOVE;
}

extern "C" int32_t isaac_pm_td_early_pure_complete(int32_t early_kind) {
  return early_kind == ISAAC_PM_TD_EARLY_CHECK_ONLY ? 1 : 0;
}

extern "C" int32_t isaac_pm_td_early_returns_false(int32_t early_kind) {
  return (early_kind == ISAAC_PM_TD_EARLY_CHECK_ONLY ||
          early_kind == ISAAC_PM_TD_EARLY_REMOVE)
             ? 1
             : 0;
}

extern "C" int32_t isaac_pm_td_static_guard_slow(int32_t guard,
                                                 int32_t tls_epoch) {
  /* PE 0x007a10fd: cmp eax, [ecx+0xc] ; jg 0x007a21dd — signed. */
  return guard > tls_epoch ? 1 : 0;
}

extern "C" int32_t isaac_pm_td_static_guard_runs_init(
    int32_t guard_after_header) {
  /* PE 0x007a21ea: cmp dword [0x00c8129c], -1 ; jne 0x007a1109 */
  return guard_after_header == -1 ? 1 : 0;
}

extern "C" int32_t isaac_pm_td_static_guard_game_effect(void) {
  /* 0x007a21f7 pushes 0x00b15b90 (a thunk that only loads the vector address)
     into the CRT registration helper; nothing else is written. */
  return 0;
}

extern "C" int32_t isaac_pm_td_twin_first(uint32_t twin_ptr,
                                          uint32_t self_ptr,
                                          int32_t twin_order_161c,
                                          int32_t self_order_161c) {
  /* PE 0x007a1123: cmp edx, -1  ; je  self_first
     PE 0x007a1128: cmp edx, [ebx+0x161c] ; jge self_first  (signed)
     PE 0x007a1130: cmp ecx, ebx ; je  self_first */
  if (twin_order_161c == -1) {
    return 0;
  }
  if (twin_order_161c >= self_order_161c) {
    return 0;
  }
  if (twin_ptr == self_ptr) {
    return 0;
  }
  return 1;
}

extern "C" void isaac_pm_td_order_plan(
    uint32_t twin_ptr,
    uint32_t self_ptr,
    int32_t twin_order_161c,
    int32_t self_order_161c,
    IsaacPlayerTriggerDeathOrderPlan* out) {
  if (out == nullptr) {
    return;
  }
  /* PE 0x007a1119: test ecx,ecx ; je 0x007a114f (push self only). */
  if (twin_ptr == 0u) {
    out->count = 1;
    out->first_is_twin = 0;
    out->second_is_twin = 0;
    out->twin_present = 0;
    return;
  }
  const int32_t twin_first = isaac_pm_td_twin_first(
      twin_ptr, self_ptr, twin_order_161c, self_order_161c);
  out->count = 2;
  out->first_is_twin = twin_first;
  out->second_is_twin = twin_first != 0 ? 0 : 1;
  out->twin_present = 1;
}

extern "C" int32_t isaac_pm_td_push_needs_grow(uint32_t vec_end,
                                               uint32_t vec_cap) {
  /* PE: cmp eax, [0x00c812a8] ; je grow_path */
  return vec_end == vec_cap ? 1 : 0;
}

extern "C" int32_t isaac_pm_td_pocket_slot_clamp(int32_t index) {
  /* PE 0x007a1294: xor ecx,ecx ; test edi,edi ; mov eax,edi ; cmovle eax,ecx
     PE 0x007a129b: mov ecx,3   ; cmp eax,ecx ; cmovl ecx,eax */
  int32_t lo = index;
  if (index <= 0) {
    lo = 0;
  }
  int32_t slot = ISAAC_PM_TD_POCKET_CLAMP_MAX;
  if (lo < ISAAC_PM_TD_POCKET_CLAMP_MAX) {
    slot = lo;
  }
  return slot;
}

extern "C" int32_t isaac_pm_td_pocket_slot_offset(int32_t slot) {
  /* PE addressing: [ebx + ecx*8 + 0x17a0]. */
  const uint32_t off =
      static_cast<uint32_t>(ISAAC_PM_TD_OFF_POCKET_BASE_17A0) +
      static_cast<uint32_t>(slot) *
          static_cast<uint32_t>(ISAAC_PM_TD_POCKET_STRIDE);
  return static_cast<int32_t>(off);
}

extern "C" int32_t isaac_pm_td_pocket_match(int32_t id, int32_t type) {
  /* PE 0x007a1630: cmp dword [eax+4],1 ; jne next
     PE 0x007a1636: cmp dword [eax],0x59 ; je found */
  if (type != ISAAC_PM_TD_POCKET_MATCH_TYPE) {
    return 0;
  }
  return id == ISAAC_PM_TD_POCKET_MATCH_ID ? 1 : 0;
}

extern "C" int32_t isaac_pm_td_pocket_find(
    const IsaacPlayerPocketSlot* slots) {
  if (slots == nullptr) {
    return ISAAC_PM_TD_POCKET_SLOTS;
  }
  for (int32_t k = 0; k < ISAAC_PM_TD_POCKET_SLOTS; ++k) {
    if (isaac_pm_td_pocket_match(slots[k].id, slots[k].type) != 0) {
      return k;
    }
  }
  return ISAAC_PM_TD_POCKET_SLOTS;
}

extern "C" int32_t isaac_pm_td_pocket_compact_dwords(int32_t found_index) {
  /* PE 0x007a1646: cmp ecx,3 ; jae 0x007a166f (skip the copy entirely). */
  if (found_index >= ISAAC_PM_TD_POCKET_CLAMP_MAX) {
    return 0;
  }
  if (found_index < 0) {
    return 0;
  }
  /* PE: mov eax,3 ; sub eax,ecx ; add eax,eax ; and eax,0x3ffffffe */
  const uint32_t doubled = static_cast<uint32_t>(
      (ISAAC_PM_TD_POCKET_CLAMP_MAX - found_index) * 2);
  return static_cast<int32_t>(
      doubled & static_cast<uint32_t>(ISAAC_PM_TD_COMPACT_DWORD_MASK));
}

extern "C" void isaac_pm_td_pocket_compact(
    IsaacPlayerPocketSlot* slots,
    IsaacPlayerTriggerDeathPocketPlan* out) {
  const int32_t found_index = isaac_pm_td_pocket_find(slots);
  const int32_t found = found_index < ISAAC_PM_TD_POCKET_SLOTS ? 1 : 0;
  const int32_t dwords =
      found != 0 ? isaac_pm_td_pocket_compact_dwords(found_index) : 0;

  if (found != 0 && slots != nullptr) {
    /* PE: rep movsd from slot k+1 into slot k, `dwords` dwords, forward.
       Destination is 8 bytes below the source, so a forward copy is safe. */
    int32_t* dst = reinterpret_cast<int32_t*>(&slots[found_index]);
    const int32_t* src = reinterpret_cast<const int32_t*>(&slots[found_index]) +
                         (ISAAC_PM_TD_POCKET_STRIDE / 4);
    for (int32_t i = 0; i < dwords; ++i) {
      dst[i] = src[i];
    }
    /* PE 0x007a166f / 0x007a1679: both stores run for every found index. */
    slots[ISAAC_PM_TD_POCKET_SLOTS - 1].id = ISAAC_PM_TD_POCKET_LAST_ID_VALUE;
    slots[ISAAC_PM_TD_POCKET_SLOTS - 1].type =
        ISAAC_PM_TD_POCKET_LAST_TYPE_VALUE;
  }

  if (out == nullptr) {
    return;
  }
  out->found_index = found_index;
  out->found = found;
  out->shift_dwords = dwords;
  out->last_slot_id = found != 0 ? ISAAC_PM_TD_POCKET_LAST_ID_VALUE : 0;
  out->last_slot_type = found != 0 ? ISAAC_PM_TD_POCKET_LAST_TYPE_VALUE : 0;
  out->stores_applied = found;
}

extern "C" int32_t isaac_pm_td_list_scan_skipped(uint32_t skip_1519) {
  /* PE 0x007a1232: cmp byte [ebx+0x1519],0 ; jne next_player — byte test. */
  return (skip_1519 & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_pm_td_list_elem_match(int32_t elem_tag,
                                               int32_t elem_id) {
  /* PE 0x007a1252: cmp dword [edx],0 ; jne next
     PE 0x007a1257: cmp dword [edx+4],0x71 ; je found */
  if (elem_tag != ISAAC_PM_TD_LIST_MATCH_TAG) {
    return 0;
  }
  return elem_id == ISAAC_PM_TD_LIST_MATCH_ID ? 1 : 0;
}

extern "C" int32_t isaac_pm_td_list_walk_terminates(uint32_t list_begin,
                                                    uint32_t list_end) {
  const int32_t span = static_cast<int32_t>(list_end - list_begin);
  if (span < 0) {
    return 0;
  }
  return (span % ISAAC_PM_TD_LIST_ELEM_STRIDE) == 0 ? 1 : 0;
}

extern "C" int32_t isaac_pm_td_list_walk_steps(uint32_t list_begin,
                                               uint32_t list_end) {
  if (isaac_pm_td_list_walk_terminates(list_begin, list_end) == 0) {
    return -1;
  }
  const int32_t span = static_cast<int32_t>(list_end - list_begin);
  return span / ISAAC_PM_TD_LIST_ELEM_STRIDE;
}

/* ---- PRA/PRB/CAS: revive-item cascade (ABI v7) ---- */

namespace {

/* PE order of the revive-item cascade starting at 0x007a12d4. The PE tests
   these stages as a straight compare chain with immediate operands, so the
   accessors below are compare chains too: a const table would live in linear
   memory, which a freestanding pure-helper module should not depend on. */
inline int32_t cascade_in_range(int32_t stage_index) {
  return (stage_index >= 0 && stage_index < ISAAC_PM_TD_CASCADE_STAGES) ? 1 : 0;
}

}  // namespace

extern "C" int32_t isaac_pm_td_probe_a_player_match(
    uint32_t has_collectible) {
  /* PE 0x007a0ffc: test al,al ; jne found — low byte only. */
  return (has_collectible & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_pm_td_probe_a_scan(const uint8_t* has_flags,
                                            int32_t count) {
  if (has_flags == nullptr || count <= 0) {
    return -1;
  }
  for (int32_t i = 0; i < count; ++i) {
    if (isaac_pm_td_probe_a_player_match(has_flags[i]) != 0) {
      return i;
    }
  }
  return -1;
}

extern "C" int32_t isaac_pm_td_probe_b_path(int32_t pending_2ef8,
                                            int32_t id,
                                            uint32_t pending_flag_2ef0) {
  /* PE 0x007a1042: mov eax,[ecx+0x2ef8] ; test eax,eax ; je plain
     PE 0x007a104c: cmp eax, edi          ; jne plain
     PE 0x007a1050: cmp byte [ecx+0x2ef0],0 ; jne found */
  if (pending_2ef8 == 0 || pending_2ef8 != id) {
    return ISAAC_PM_TD_PROBE_B_PATH_COUNT_GT0;
  }
  if ((pending_flag_2ef0 & 0xffu) != 0u) {
    return ISAAC_PM_TD_PROBE_B_PATH_IMMEDIATE;
  }
  return ISAAC_PM_TD_PROBE_B_PATH_COUNT_GT1;
}

extern "C" int32_t isaac_pm_td_probe_b_needs_count_probe(int32_t path) {
  return path == ISAAC_PM_TD_PROBE_B_PATH_IMMEDIATE ? 0 : 1;
}

extern "C" int32_t isaac_pm_td_probe_b_player_match(int32_t path,
                                                    int32_t count) {
  /* PE: `cmp eax,1 ; setg` on the pending path, `test eax,eax ; setg`
     otherwise — both signed. */
  if (path == ISAAC_PM_TD_PROBE_B_PATH_IMMEDIATE) {
    return 1;
  }
  if (path == ISAAC_PM_TD_PROBE_B_PATH_COUNT_GT1) {
    return count > 1 ? 1 : 0;
  }
  return count > 0 ? 1 : 0;
}

extern "C" int32_t isaac_pm_td_probe_b_scan(const int32_t* pending_2ef8,
                                            const uint8_t* pending_flag_2ef0,
                                            const int32_t* counts,
                                            int32_t id,
                                            int32_t count) {
  if (pending_2ef8 == nullptr || pending_flag_2ef0 == nullptr ||
      counts == nullptr || count <= 0) {
    return -1;
  }
  for (int32_t i = 0; i < count; ++i) {
    const int32_t path =
        isaac_pm_td_probe_b_path(pending_2ef8[i], id, pending_flag_2ef0[i]);
    if (isaac_pm_td_probe_b_player_match(path, counts[i]) != 0) {
      return i;
    }
  }
  return -1;
}

extern "C" int32_t isaac_pm_td_cascade_stage_count(void) {
  return ISAAC_PM_TD_CASCADE_STAGES;
}

extern "C" int32_t isaac_pm_td_cascade_stage_id(int32_t stage_index) {
  switch (stage_index) {
    case 0: return 0x0b;   /* 0x007a12d4 */
    case 1: return 0x00;   /* 0x007a1848 — character-type stage, no id */
    case 2: return 0x51;   /* 0x007a1878 */
    case 3: return 0x2b0;  /* 0x007a1936 */
    case 4: return 0xd4;   /* 0x007a199d */
    case 5: return 0x14c;  /* 0x007a1a09 */
    case 6: return 0xa1;   /* 0x007a1a70 */
    case 7: return 0x1c;   /* 0x007a1ab3 */
    case 8: return 0x137;  /* 0x007a1b66 */
    case 9: return 0x17;   /* 0x007a1ba9 */
    default: return -1;
  }
}

extern "C" int32_t isaac_pm_td_cascade_probe_kind(int32_t stage_index) {
  if (cascade_in_range(stage_index) == 0) {
    return -1;
  }
  if (stage_index == 1) {
    return ISAAC_PM_TD_PROBE_KIND_NONE;
  }
  if (stage_index == 7 || stage_index == 9) {
    return ISAAC_PM_TD_PROBE_KIND_B;
  }
  return ISAAC_PM_TD_PROBE_KIND_A;
}

extern "C" int32_t isaac_pm_td_cascade_guard_kind(int32_t stage_index) {
  if (cascade_in_range(stage_index) == 0) {
    return -1;
  }
  if (stage_index == 1) {
    return ISAAC_PM_TD_GUARD_CHAR_TYPE;
  }
  if (stage_index == 4) {
    return ISAAC_PM_TD_GUARD_RNG_BIT;
  }
  if (stage_index == 9) {
    return ISAAC_PM_TD_GUARD_STAGE17;
  }
  return ISAAC_PM_TD_GUARD_NONE;
}

extern "C" uint32_t isaac_pm_td_cascade_stage_va(int32_t stage_index) {
  switch (stage_index) {
    case 0: return 0x007a12d4u;
    case 1: return 0x007a1848u;
    case 2: return 0x007a1878u;
    case 3: return 0x007a1936u;
    case 4: return 0x007a199du;
    case 5: return 0x007a1a09u;
    case 6: return 0x007a1a70u;
    case 7: return 0x007a1ab3u;
    case 8: return 0x007a1b66u;
    case 9: return 0x007a1ba9u;
    default: return 0u;
  }
}

extern "C" int32_t isaac_pm_td_cascade_first_match(const uint8_t* matched,
                                                   int32_t count) {
  if (matched == nullptr || count <= 0) {
    return -1;
  }
  int32_t n = count;
  if (n > ISAAC_PM_TD_CASCADE_STAGES) {
    n = ISAAC_PM_TD_CASCADE_STAGES;
  }
  for (int32_t i = 0; i < n; ++i) {
    if ((matched[i] & 0xffu) != 0u) {
      return i;
    }
  }
  return -1;
}

extern "C" int32_t isaac_pm_td_stage_d4_guard(uint32_t rng_first_byte) {
  /* PE 0x007a19b9: test byte ptr [eax], 1 ; je skip */
  return (rng_first_byte & 1u) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_pm_td_stage_1c_value(int32_t count1, int32_t count2) {
  /* PE 0x007a1ad0: cmp eax,1 ; jne alt ; lea edi,[eax+0x15]  (eax == 1) */
  if (count1 == 1) {
    return 1 + 0x15;
  }
  /* PE 0x007a1ae3: cmp eax,2 ; mov edi,0x32 ; mov ecx,0x21 ; cmove edi,ecx */
  return count2 == 2 ? 0x21 : 0x32;
}

extern "C" int32_t isaac_pm_td_stage_1c_second_probe_needed(int32_t count1) {
  return count1 == 1 ? 0 : 1;
}

extern "C" int32_t isaac_pm_td_stage17_path(uint32_t mgr_9e,
                                            int32_t mgr_8,
                                            uint32_t game_ptr,
                                            uint32_t game_26630,
                                            uint32_t game_26589) {
  /* PE 0x007a1bc2: cmp byte [eax+0x9e],0 ; jne 0x007a1c10 */
  if ((mgr_9e & 0xffu) != 0u) {
    return ISAAC_PM_TD_STAGE17_PATH_X;
  }
  /* PE 0x007a1bcb: cmp dword [eax+8],2 ; jne 0x007a1bec */
  if (mgr_8 != ISAAC_PM_TD_STAGE17_MGR_8_MATCH) {
    return ISAAC_PM_TD_STAGE17_PATH_Y;
  }
  /* PE 0x007a1bd6: test eax,eax ; je 0x007a1bec */
  if (game_ptr == 0u) {
    return ISAAC_PM_TD_STAGE17_PATH_Y;
  }
  /* PE 0x007a1bda: cmp dword [eax+0x26630],0 ; ja 0x007a1c10 (unsigned) */
  if (game_26630 != 0u) {
    return ISAAC_PM_TD_STAGE17_PATH_X;
  }
  /* PE 0x007a1be3: cmp byte [eax+0x26589],0 ; jne 0x007a1c10 */
  if ((game_26589 & 0xffu) != 0u) {
    return ISAAC_PM_TD_STAGE17_PATH_X;
  }
  return ISAAC_PM_TD_STAGE17_PATH_Y;
}

extern "C" int32_t isaac_pm_td_stage17_result(int32_t path,
                                              uint32_t check_only,
                                              int32_t game_18300_field8) {
  const int32_t co = (check_only & 0xffu) != 0u ? 1 : 0;
  if (path == ISAAC_PM_TD_STAGE17_PATH_X) {
    /* PE 0x007a1c10: cmp byte [ebp+8],0 ; jne 0x007a21c4 */
    return co != 0 ? ISAAC_PM_TD_STAGE17_RESULT_TRUE
                   : ISAAC_PM_TD_STAGE17_RESULT_HOST;
  }
  /* PE 0x007a1bec: cmp byte [ebp+8],0 ; je 0x007a1335 (host) */
  if (co == 0) {
    return ISAAC_PM_TD_STAGE17_RESULT_HOST;
  }
  /* PE 0x007a1c01: cmp dword [Game[0x18300] + 8], 0xd ; jne 0x007a1ca1 */
  return game_18300_field8 == ISAAC_PM_TD_STAGE17_ACCEPT_VALUE
             ? ISAAC_PM_TD_STAGE17_RESULT_TRUE
             : ISAAC_PM_TD_STAGE17_RESULT_FALSE;
}

extern "C" int32_t isaac_pm_td_cascade_check_only_returns_true(
    int32_t stage_index) {
  if (cascade_in_range(stage_index) == 0) {
    return 0;
  }
  /* Stage 9 has its own rule (isaac_pm_td_stage17_result). */
  if (isaac_pm_td_cascade_guard_kind(stage_index) ==
      ISAAC_PM_TD_GUARD_STAGE17) {
    return 0;
  }
  return 1;
}

/* ---- RVH: head of the shared revive helper 0x007a23a0 (ABI v8) ---- */

extern "C" int32_t isaac_pm_td_rvh_revive_called(int32_t order_161c) {
  /* PE 0x007a23e9: cmp dword [edi+0x161c], 0 ; jl skip_call. */
  return order_161c >= 0 ? 1 : 0;
}

extern "C" int32_t isaac_pm_td_rvh_chain_flag(uint32_t chain_ptr,
                                              int32_t chain_field8,
                                              int32_t chain_field0) {
  /* PE 0x007a240b: test eax,eax ; je clear
     PE 0x007a240f: cmp [eax+8], 0x10 ; jne clear
     PE 0x007a2415: cmp [eax], 0x23   ; je set */
  if (chain_ptr == 0u) {
    return 0;
  }
  if (chain_field8 != ISAAC_PM_TD_RVH_CHAIN_FIELD8_MATCH) {
    return 0;
  }
  return chain_field0 == ISAAC_PM_TD_RVH_CHAIN_FIELD0_MATCH ? 1 : 0;
}

extern "C" int32_t isaac_pm_td_rvh_region(int32_t id) {
  /* PE order: signed jg, then je, then an unsigned biased range test. */
  if (id > ISAAC_PM_TD_RVH_ID_HIGH_BOUND) {
    return ISAAC_PM_TD_RVH_REGION_HIGH;
  }
  if (id == ISAAC_PM_TD_RVH_ID_HIGH_BOUND) {
    return ISAAC_PM_TD_RVH_REGION_EQ137;
  }
  const uint32_t idx = static_cast<uint32_t>(id) -
                       static_cast<uint32_t>(ISAAC_PM_TD_RVH_TABLE_BIAS);
  if (idx > static_cast<uint32_t>(ISAAC_PM_TD_RVH_TABLE_LIMIT)) {
    return ISAAC_PM_TD_RVH_REGION_DEFAULT;
  }
  return ISAAC_PM_TD_RVH_REGION_TABLE;
}

extern "C" int32_t isaac_pm_td_rvh_table_index(int32_t id) {
  if (isaac_pm_td_rvh_region(id) != ISAAC_PM_TD_RVH_REGION_TABLE) {
    return -1;
  }
  return static_cast<int32_t>(static_cast<uint32_t>(id) -
                              static_cast<uint32_t>(ISAAC_PM_TD_RVH_TABLE_BIAS));
}

extern "C" uint32_t isaac_pm_td_rvh_region_va(int32_t region) {
  switch (region) {
    case ISAAC_PM_TD_RVH_REGION_EQ137: return 0x007a28e9u;
    case ISAAC_PM_TD_RVH_REGION_HIGH: return 0x007a2a11u;
    case ISAAC_PM_TD_RVH_REGION_DEFAULT: return 0x007a2a32u;
    default: return 0u;
  }
}

extern "C" int32_t isaac_pm_td_rvh_table_case(int32_t id) {
  /* Literal contents of the 202-byte table at 0x007a335c, expressed as a
     compare chain so the helper needs no linear memory. Only four indices
     hold a value other than 4. */
  if (isaac_pm_td_rvh_region(id) != ISAAC_PM_TD_RVH_REGION_TABLE) {
    return -1;
  }
  switch (id) {
    case ISAAC_PM_TD_RVH_ID_CASE0: return 0;
    case ISAAC_PM_TD_RVH_ID_CASE1: return 1;
    case ISAAC_PM_TD_RVH_ID_CASE2: return 2;
    case ISAAC_PM_TD_RVH_ID_CASE3: return 3;
    default: return ISAAC_PM_TD_RVH_TABLE_CASE_DEFAULT;
  }
}

extern "C" uint32_t isaac_pm_td_rvh_dispatch_va(int32_t id) {
  const int32_t region = isaac_pm_td_rvh_region(id);

  if (region == ISAAC_PM_TD_RVH_REGION_EQ137) {
    return ISAAC_PM_TD_RVH_VA_EQ137;
  }

  if (region == ISAAC_PM_TD_RVH_REGION_HIGH) {
    /* PE 0x007a2a11: three cumulative `sub`/`je` steps, then fallthrough
       lands exactly on 0x007a2a32 (the shared DEFAULT). */
    switch (id) {
      case ISAAC_PM_TD_RVH_ID_HIGH0: return ISAAC_PM_TD_RVH_VA_HIGH0;
      case ISAAC_PM_TD_RVH_ID_HIGH1: return ISAAC_PM_TD_RVH_VA_HIGH1;
      case ISAAC_PM_TD_RVH_ID_HIGH2: return ISAAC_PM_TD_RVH_VA_HIGH2;
      default: return ISAAC_PM_TD_RVH_VA_DEFAULT;
    }
  }

  if (region == ISAAC_PM_TD_RVH_REGION_DEFAULT) {
    return ISAAC_PM_TD_RVH_VA_DEFAULT;
  }

  /* REGION_TABLE: resolve the byte-table case to its jump-table target. */
  switch (isaac_pm_td_rvh_table_case(id)) {
    case 0: return ISAAC_PM_TD_RVH_VA_CASE0;
    case 1: return ISAAC_PM_TD_RVH_VA_CASE1;
    case 2: return ISAAC_PM_TD_RVH_VA_CASE2;
    case 3: return ISAAC_PM_TD_RVH_VA_CASE3;
    default: return ISAAC_PM_TD_RVH_VA_DEFAULT;
  }
}

extern "C" int32_t isaac_pm_td_rvh_is_default(int32_t id) {
  return isaac_pm_td_rvh_dispatch_va(id) == ISAAC_PM_TD_RVH_VA_DEFAULT ? 1 : 0;
}


/* ---- TD-MID: TriggerDeath middle/tail pure gates (ABI v10) ----
   PE evidence: section-notes/pm-hud-v6/disasm-7a1090-7a2400.txt and
   section-notes/pm-v5/NOTES.md. All byte-tested inputs are widened with an
   explicit low-byte mask (v9 rule). */

extern "C" int32_t isaac_pm_td_heart_gate(uint32_t check_only,
                                          uint32_t stop_probe,
                                          int32_t game_18300_field8) {
  /* PE 0x007a11dc: cmp byte [ebp+8],0 ; jne skip            (check_only)
     PE 0x007a11ed: test al,al ; je skip                     (probe low byte)
     PE 0x007a11fc: cmp dword [eax+8],0xd ; jne skip         (full dword) */
  if ((check_only & 0xffu) != 0u) {
    return 0;
  }
  if ((stop_probe & 0xffu) == 0u) {
    return 0;
  }
  return game_18300_field8 == ISAAC_PM_TD_HEART_ACCEPT ? 1 : 0;
}

extern "C" int32_t isaac_pm_td_tail_hold(int32_t char_type_13c0,
                                         uint32_t has_26b) {
  /* PE 0x007a1c47: cmp dword [ebx+0x13c0],0x1f ; jne 0x007a1c97
     PE 0x007a1c5e: test al,al ; je 0x007a1c97 (low byte) */
  if (char_type_13c0 != ISAAC_PM_TD_TAIL_CHAR_MATCH) {
    return 0;
  }
  return (has_26b & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_pm_td_tail_check_only_result(int32_t char_type_13c0,
                                                      uint32_t has_26b) {
  /* PE 0x007a1c62: cmp byte [ebp+8],0 ; jne 0x007a21c4 (TRUE)
     PE 0x007a1c97: cmp byte [ebp+8],0 ; je 0x007a1335 ; 0x007a1ca1 FALSE */
  return isaac_pm_td_tail_hold(char_type_13c0, has_26b) != 0 ? 1 : 0;
}

extern "C" int32_t isaac_pm_td_tail_host_revive_needed(uint32_t check_only,
                                                       int32_t char_type_13c0,
                                                       uint32_t has_26b) {
  /* 0x007a1c6c..0x007a1c92: !checkOnly && hold -> 0x0078f840 + rvh. */
  if ((check_only & 0xffu) != 0u) {
    return 0;
  }
  return isaac_pm_td_tail_hold(char_type_13c0, has_26b) != 0 ? 1 : 0;
}

extern "C" int32_t isaac_pm_td_check_only_termination(int32_t first_match,
                                                      int32_t stage17_result,
                                                      int32_t tail_hold) {
  /* Cascade matched: every stage returns TRUE at 0x007a21c4 except stage 9,
     whose isaac_pm_td_stage17_result can be FALSE (0x007a1ca1). Cascade
     fell through (first_match == -1): the tail decides. */
  if (first_match == -1) {
    return tail_hold != 0 ? 1 : 0;
  }
  return stage17_result == ISAAC_PM_TD_STAGE17_RESULT_FALSE ? 0 : 1;
}

extern "C" int32_t isaac_pm_td_vec_span_aligned(int32_t span) {
  /* PE 0x007a1b01 / 0x007a20a8 / 0x007a212b: and eax, 0xfffffff0 */
  return static_cast<int32_t>(static_cast<uint32_t>(span) & 0xfffffff0u);
}

extern "C" int32_t isaac_pm_td_vec_warn_needed(int32_t span_aligned,
                                               int32_t limit_bytes) {
  /* PE 0x007a1b04 / 0x007a20ab / 0x007a212e: cmp eax, limit ; jg skip_log.
     The log runs when the aligned span is NOT greater than the limit
     (SIGNED compare). */
  return span_aligned > limit_bytes ? 0 : 1;
}

extern "C" int32_t isaac_pm_td_vec_slot_index(int32_t span,
                                              int32_t limit_entries) {
  /* PE 0x007a1b2b / 0x007a20d2: sub; sar edx,4 ; lea eax,[edx-1] ;
     cmp eax, limit ; cmovb (UNSIGNED) -> slot index in [0, limit]. */
  const int32_t count = span >> 4;
  const int32_t last = count - 1;
  if (static_cast<uint32_t>(last) < static_cast<uint32_t>(limit_entries)) {
    return last;
  }
  return limit_entries;
}

extern "C" int32_t isaac_pm_td_vec_slot_offset(int32_t span,
                                               int32_t limit_entries) {
  /* PE: shl edi, 4 — the byte offset added to the record vector begin. */
  return isaac_pm_td_vec_slot_index(span, limit_entries) << 4;
}

extern "C" uint32_t isaac_pm_td_rng_record_next(uint32_t seed,
                                                uint32_t shift1,
                                                uint32_t shift2,
                                                uint32_t shift3) {
  /* PE 0x007a2100..0x007a211b — the same three-step xorshift as the PMP
     global (0x00956830..0x00956857). Shift counts mask to 5 bits like the
     x86 shr/shl cl encoding. */
  uint32_t s = seed;
  const uint32_t c1 = shift1 & 31u;
  const uint32_t c2 = shift2 & 31u;
  const uint32_t c3 = shift3 & 31u;
  uint32_t a = s >> c1;
  a ^= s;
  uint32_t b = a << c2;
  b ^= a;
  uint32_t out = b >> c3;
  out ^= b;
  return out;
}

extern "C" int32_t isaac_pm_td_rng_seed_zero(int32_t seed) {
  /* PE 0x007a20e4: mov edx,[edi] ; test edx,edx ; jne skip */
  return seed == 0 ? 1 : 0;
}

extern "C" int32_t isaac_pm_td_rng_seed_still_zero(int32_t seed_reloaded) {
  /* PE 0x007a20fb: test edx,edx ; jne skip ; int3 */
  return seed_reloaded == 0 ? 1 : 0;
}

extern "C" int32_t isaac_pm_td_char_death_path(int32_t char_type_13c0) {
  /* PE 0x007a14f6 / 0x007a1df0: full-dword compares. */
  switch (char_type_13c0) {
    case 0x10:
    case 0x23:
      return ISAAC_PM_TD_CHAR_PATH_0;
    case 0xa:
    case 0x1f:
    case 0x27:
      return ISAAC_PM_TD_CHAR_PATH_1;
    default:
      return ISAAC_PM_TD_CHAR_PATH_2;
  }
}

extern "C" int32_t isaac_pm_td_death_seq_kind(uint32_t dead_173,
                                              uint32_t fatal_null,
                                              int32_t state_2c,
                                              int32_t fatal_state_28,
                                              uint32_t has_effect_29b) {
  /* PE 0x007a13dd: cmp byte [edi+0x173],0 ; je 0x007a1f74
     PE 0x007a13f0: test esi,esi ; je 0x007a1f56
     PE 0x007a13f8: cmp dword [edi+0x2c],0 ; jne 0x007a1f56
     PE 0x007a1402: cmp dword [esi+0x28],1 ; jne 0x007a1f56
     PE 0x007a1422: test al,al ; je 0x007a1de7 (low byte) */
  if ((dead_173 & 0xffu) == 0u) {
    return ISAAC_PM_TD_SEQ_NOT_DEAD;
  }
  if (fatal_null != 0u || state_2c != 0 ||
      fatal_state_28 != 1) {
    return ISAAC_PM_TD_SEQ_REMOVE;
  }
  return (has_effect_29b & 0xffu) != 0u ? ISAAC_PM_TD_SEQ_FULL
                                        : ISAAC_PM_TD_SEQ_ALT;
}

extern "C" int32_t isaac_pm_td_ghost_morph_gate(uint32_t dead_173,
                                                uint32_t fatal_null,
                                                uint32_t is_coop,
                                                uint32_t coop_count,
                                                uint32_t flag_20a9) {
  /* PE 0x007a1376: cmp byte [edi+0x173],0 ; je skip        (dead)
     PE 0x007a137f: cmp dword [edi+0x3bc],0 ; jne skip      (fatal)
     PE 0x007a139d: test al,al ; je skip                   (is_coop low byte)
     PE 0x007a13aa: cmp eax,1 ; jbe skip                   (UNSIGNED)
     PE 0x007a13af: cmp byte [edi+0x20a9],0 ; jne skip     (flag low byte) */
  if ((dead_173 & 0xffu) == 0u) {
    return 0;
  }
  if (fatal_null != 0u) {
    return 0;
  }
  if ((is_coop & 0xffu) == 0u) {
    return 0;
  }
  if (coop_count <= 1u) {
    return 0;
  }
  return (flag_20a9 & 0xffu) == 0u ? 1 : 0;
}

extern "C" int32_t isaac_pm_td_reset_revive_needed(int32_t order_161c) {
  /* PE 0x007a169f: cmp dword [edi+0x161c],0 ; jl skip_call ; call 0x7a2220.
     Same predicate as isaac_pm_td_rvh_revive_called (0x007a23e9) — tests
     assert agreement. */
  return order_161c >= 0 ? 1 : 0;
}

extern "C" int32_t isaac_pm_td_reset_health_branch(int32_t fatal_1340,
                                                   int32_t health_type1,
                                                   int32_t health_type2,
                                                   int32_t char_type_13c0) {
  /* PE 0x007a16f4: cmp dword [edi+0x1340],0 ; jle 0x007a1716
     PE 0x007a1705: cmp eax,3 (probe 1) ; jne done
     PE 0x007a171d: cmp eax,4 (probe 1) ; jne 0x007a1735
     PE 0x007a173a: cmp eax,3 (probe 2, re-issued) ; jne 0x007a1755
     PE 0x007a1755: cmp dword [edi+0x13c0],0x12 ; jne 0x007a1774 */
  if (fatal_1340 > 0) {
    return health_type1 == 3 ? ISAAC_PM_TD_RESET_BRANCH_GT0_HT1_EQ3
                             : ISAAC_PM_TD_RESET_BRANCH_GT0_HT1_NE3;
  }
  if (health_type1 == 4) {
    return ISAAC_PM_TD_RESET_BRANCH_LE0_HT1_EQ4;
  }
  if (health_type2 == 3) {
    return ISAAC_PM_TD_RESET_BRANCH_LE0_HT2_EQ3;
  }
  return char_type_13c0 == ISAAC_PM_TD_RESET_CHAR_MATCH
             ? ISAAC_PM_TD_RESET_BRANCH_CHAR_12
             : ISAAC_PM_TD_RESET_BRANCH_ELSE;
}

extern "C" int32_t isaac_pm_td_reset_bone_hearts(int32_t branch) {
  return branch == ISAAC_PM_TD_RESET_BRANCH_LE0_HT1_EQ4 ? 1 : 0;
}

extern "C" int32_t isaac_pm_td_reset_probe_count(int32_t branch) {
  return branch <= ISAAC_PM_TD_RESET_BRANCH_LE0_HT1_EQ4 ? 1 : 2;
}

/* ---- RVB: RVH per-id body pure layer (ABI v11) ----
   PE evidence: section-notes/pm-v12/disasm-7a23a0-7a3350.txt, re-verified
   instruction-for-instruction against the image at v11 (byte table census
   202/202, 0 mismatches). All byte-tested inputs take uint32_t with an
   explicit low-byte mask (v9 rule). */

extern "C" int32_t isaac_pm_td_rvb_body_from_id(int32_t id) {
  /* Same classifier order as the PE head (0x007a2428..0x007a244f), then
     the byte-table/HIGH-chain resolution. Must agree with
     isaac_pm_td_rvh_dispatch_va on every int32 (census test). */
  if (id > ISAAC_PM_TD_RVH_ID_HIGH_BOUND) {
    /* HIGH compare chain 0x007a2a11: sub 0x14c / sub 0x11f / sub 0x45. */
    switch (id) {
      case ISAAC_PM_TD_RVH_ID_HIGH0: return ISAAC_PM_TD_RVB_BODY_HIGH0;
      case ISAAC_PM_TD_RVH_ID_HIGH1: return ISAAC_PM_TD_RVB_BODY_HIGH1;
      case ISAAC_PM_TD_RVH_ID_HIGH2: return ISAAC_PM_TD_RVB_BODY_HIGH2;
      default: return ISAAC_PM_TD_RVB_BODY_DEFAULT;
    }
  }
  if (id == ISAAC_PM_TD_RVH_ID_HIGH_BOUND) {
    return ISAAC_PM_TD_RVB_BODY_EQ137;
  }
  const uint32_t idx = static_cast<uint32_t>(id) -
                       static_cast<uint32_t>(ISAAC_PM_TD_RVH_TABLE_BIAS);
  if (idx > static_cast<uint32_t>(ISAAC_PM_TD_RVH_TABLE_LIMIT)) {
    return ISAAC_PM_TD_RVB_BODY_DEFAULT;
  }
  /* Byte table 0x007a335c: only four indices hold a case other than 4. */
  switch (id) {
    case ISAAC_PM_TD_RVH_ID_CASE0: return ISAAC_PM_TD_RVB_BODY_CASE0;
    case ISAAC_PM_TD_RVH_ID_CASE1: return ISAAC_PM_TD_RVB_BODY_CASE1;
    case ISAAC_PM_TD_RVH_ID_CASE2: return ISAAC_PM_TD_RVB_BODY_CASE2;
    case ISAAC_PM_TD_RVH_ID_CASE3: return ISAAC_PM_TD_RVB_BODY_CASE3;
    default: return ISAAC_PM_TD_RVB_BODY_DEFAULT;
  }
}

extern "C" int32_t isaac_pm_td_rvb_has_flag_gate(int32_t body) {
  /* Only CASE0/CASE1/CASE2/CASE3/EQ137 test [ebx+0xc]; the HIGH bodies and
     DEFAULT never read the flag argument. */
  return body >= ISAAC_PM_TD_RVB_BODY_CASE0 &&
                 body <= ISAAC_PM_TD_RVB_BODY_EQ137
             ? 1
             : 0;
}

extern "C" int32_t isaac_pm_td_rvb_flag_arm(uint32_t flag,
                                            uint32_t fatal_3bc,
                                            uint32_t chain_flag) {
  /* PE (CASE0 site) 0x007a2590: cmp byte [ebx+0xc],0 ; je 0x007a3292
     PE 0x007a259a: cmp dword [edi+0x3bc],0 ; je 0x007a25cc
     PE 0x007a25cc: cmp byte [ebp-0x9d],0 ; jne 0x007a3292 */
  if ((flag & 0xffu) == 0u) {
    return ISAAC_PM_TD_RVB_ARM_SKIP;
  }
  if (fatal_3bc != 0u) {
    return ISAAC_PM_TD_RVB_ARM_FATAL;
  }
  if ((chain_flag & 0xffu) != 0u) {
    return ISAAC_PM_TD_RVB_ARM_CHAIN_SKIP;
  }
  return ISAAC_PM_TD_RVB_ARM_NOTIFY;
}

extern "C" int32_t isaac_pm_td_rvb_notify_stage(int32_t id) {
  /* mov edx, N sites: 0x007a25d9 (7), 0x007a26da (6), 0x007a2807 (8),
     0x007a28df (5), 0x007a29be (9). */
  switch (id) {
    case ISAAC_PM_TD_RVH_ID_CASE0: return ISAAC_PM_TD_RVB_STAGE_CASE0;
    case ISAAC_PM_TD_RVH_ID_CASE1: return ISAAC_PM_TD_RVB_STAGE_CASE1;
    case ISAAC_PM_TD_RVH_ID_CASE2: return ISAAC_PM_TD_RVB_STAGE_CASE2;
    case ISAAC_PM_TD_RVH_ID_CASE3: return ISAAC_PM_TD_RVB_STAGE_CASE3;
    case ISAAC_PM_TD_RVH_ID_HIGH_BOUND: return ISAAC_PM_TD_RVB_STAGE_EQ137;
    default: return -1;
  }
}

extern "C" int32_t isaac_pm_td_rvb_notify_clamp(int32_t game_1831c) {
  /* PE 0x007a29ce: cmp eax,-1 ; jle -> or esi,0xffffffff
     PE 0x007a29d5: cmp eax,7 ; jl keep ; mov esi,7 */
  if (game_1831c <= -1) {
    return -1;
  }
  return game_1831c < ISAAC_PM_TD_RVB_NOTIFY_CLAMP_MAX
             ? game_1831c
             : ISAAC_PM_TD_RVB_NOTIFY_CLAMP_MAX;
}

extern "C" int32_t isaac_pm_td_rvb_notify_mod4(int32_t game_1831c) {
  /* PE 0x007a29f4: and eax,0x80000003 ; jns done ; dec eax ;
     or eax,0xfffffffc ; inc eax — MSVC signed %4, applied to the
     UNCLAMPED value. */
  uint32_t a = static_cast<uint32_t>(game_1831c) & 0x80000003u;
  if (static_cast<int32_t>(a) >= 0) {
    return static_cast<int32_t>(a);
  }
  a -= 1u;
  a |= 0xfffffffcu;
  a += 1u;
  return static_cast<int32_t>(a);
}

extern "C" uint32_t isaac_pm_td_rvb_exit_route_va(int32_t arm) {
  /* Notify ends `jmp 0x7a32b9` (0x007a2a0c); the other arms rejoin the
     floor block at 0x007a3292. */
  return arm == ISAAC_PM_TD_RVB_ARM_NOTIFY
             ? static_cast<uint32_t>(ISAAC_PM_TD_RVB_VA_EXIT_NOTIFY)
             : static_cast<uint32_t>(ISAAC_PM_TD_RVB_VA_EXIT_FLOOR);
}

extern "C" int32_t isaac_pm_td_rvb_timer_floor(int32_t cur_13bc) {
  /* PE 0x007a329f: cmp dword [ecx],0x5a ; cmovge eax,ecx — keep the
     current value only when it is >= 0x5a (signed). */
  return cur_13bc >= ISAAC_PM_TD_RVB_TIMER_5A ? cur_13bc
                                              : ISAAC_PM_TD_RVB_TIMER_5A;
}

extern "C" int32_t isaac_pm_td_rvb_heal_gate(int32_t game_26614,
                                             uint32_t dead_173,
                                             int32_t red_194c) {
  /* PE 0x007a32c5: cmp dword [eax+0x26614],2 ; jge done   (signed)
     PE 0x007a32ce: cmp byte [edi+0x173],0 ; jne done      (low byte)
     PE 0x007a32d7: cmp dword [edi+0x194c],0 ; jle done    (signed) */
  if (game_26614 >= ISAAC_PM_TD_RVB_HEAL_LIMIT) {
    return 0;
  }
  if ((dead_173 & 0xffu) != 0u) {
    return 0;
  }
  return red_194c > 0 ? 1 : 0;
}

namespace {

/* cdq ; sub eax,edx ; sar eax,1 — trunc-toward-zero halving of a value
   that has already been incremented (or not) by the caller. */
inline int32_t rvb_sar_half(int32_t v) {
  const int32_t adj =
      static_cast<int32_t>(static_cast<uint32_t>(v) +
                           (static_cast<uint32_t>(v) >> 31));
  return adj >> 1;
}

}  // namespace

extern "C" int32_t isaac_pm_td_rvb_heal_capacity(int32_t v1340,
                                                 int32_t v1344,
                                                 int32_t v134c,
                                                 int32_t v1d88) {
  /* PE 0x007a32e0..0x007a3313: min signed (cmovl); inc (32-bit wrap);
     cdq/sub/sar halves; adds wrap. */
  const int32_t m = v1340 < v1344 ? v1340 : v1344;
  const int32_t h1 =
      rvb_sar_half(static_cast<int32_t>(static_cast<uint32_t>(m) + 1u));
  const int32_t h2 =
      rvb_sar_half(static_cast<int32_t>(static_cast<uint32_t>(v134c) + 1u));
  return static_cast<int32_t>(static_cast<uint32_t>(h1) +
                              static_cast<uint32_t>(h2) +
                              static_cast<uint32_t>(v1d88));
}

extern "C" int32_t isaac_pm_td_rvb_heal_applies(int32_t red_194c,
                                                int32_t capacity) {
  /* PE 0x007a3313: cmp eax,esi ; jle done (signed). */
  return red_194c > capacity ? 1 : 0;
}

extern "C" int32_t isaac_pm_td_rvb_heal_excess(int32_t red_194c,
                                               int32_t capacity) {
  /* PE 0x007a3317: sub eax,esi ; push eax — the raw wrapped difference. */
  if (red_194c <= capacity) {
    return 0;
  }
  return static_cast<int32_t>(static_cast<uint32_t>(red_194c) -
                              static_cast<uint32_t>(capacity));
}

extern "C" int32_t isaac_pm_td_rvb_case0_branch(int32_t health_type,
                                                int32_t fatal_1340,
                                                int32_t char_type_13c0) {
  /* PE 0x007a2499: cmp eax,1 ; jne 0x7a24f7
     PE 0x007a24f7: cmp eax,4 ; jne 0x7a2532
     PE 0x007a2532: cmp dword [edi+0x1340],0 ; jne 0x7a2589   (ANY nonzero)
     PE 0x007a253b: cmp eax,3 ; jne 0x7a2556
     PE 0x007a2556: cmp dword [edi+0x13c0],0x12 ; jne 0x7a2575
     One GetHealthType probe serves all three compares — unlike CASE3,
     which re-probes on the low path. */
  if (health_type == 1) {
    return ISAAC_PM_TD_RVB_CASE0_BRANCH_HT1;
  }
  if (health_type == 4) {
    return ISAAC_PM_TD_RVB_CASE0_BRANCH_HT4;
  }
  if (fatal_1340 != 0) {
    return ISAAC_PM_TD_RVB_CASE0_BRANCH_KEEP;
  }
  if (health_type == 3) {
    return ISAAC_PM_TD_RVB_CASE0_BRANCH_HT3;
  }
  if (char_type_13c0 == ISAAC_PM_TD_RESET_CHAR_MATCH) {
    return ISAAC_PM_TD_RVB_CASE0_BRANCH_CHAR12;
  }
  return ISAAC_PM_TD_RVB_CASE0_BRANCH_ELSE;
}

extern "C" int32_t isaac_pm_td_rvb_case0_bone_arg(int32_t cfg_b0) {
  /* PE 0x007a2525: cdq ; sub eax,edx ; sar eax,1 — signed /2 trunc, no
     increment (contrast the heal halves). */
  return rvb_sar_half(cfg_b0);
}

extern "C" int32_t isaac_pm_td_rvb_case0_cfg_probes(int32_t branch) {
  /* HT1 calls 0x0069bd10 at 0x007a24bb AND again at 0x007a24d9 (the PE
     re-issues the config lookup; folding it is the per-iteration-reload
     defect class). HT4 calls it once at 0x007a2518. */
  if (branch == ISAAC_PM_TD_RVB_CASE0_BRANCH_HT1) {
    return 2;
  }
  return branch == ISAAC_PM_TD_RVB_CASE0_BRANCH_HT4 ? 1 : 0;
}

extern "C" int32_t isaac_pm_td_rvb_case1_branch(int32_t health_type) {
  /* PE 0x007a261c: cmp eax,1 ; 0x007a2637: cmp eax,4 ;
     0x007a264f: cmp eax,2 ; else. Single probe. */
  if (health_type == 1) {
    return ISAAC_PM_TD_RVB_CASE1_BRANCH_HT1;
  }
  if (health_type == 4) {
    return ISAAC_PM_TD_RVB_CASE1_BRANCH_HT4;
  }
  if (health_type == 2) {
    return ISAAC_PM_TD_RVB_CASE1_BRANCH_HT2;
  }
  return ISAAC_PM_TD_RVB_CASE1_BRANCH_ELSE;
}

extern "C" int32_t isaac_pm_td_rvb_case1_soul2(int32_t branch) {
  /* HT4 jumps to 0x007a2674 and ELSE falls through to it: both store
     [0x1344]=2. HT1/HT2 jump past it to 0x007a267e. */
  return branch == ISAAC_PM_TD_RVB_CASE1_BRANCH_HT4 ||
                 branch == ISAAC_PM_TD_RVB_CASE1_BRANCH_ELSE
             ? 1
             : 0;
}

extern "C" int32_t isaac_pm_td_rvb_case1_recurse(uint32_t twin_1d98) {
  /* PE 0x007a2684: test ecx,ecx ; je — full dword. */
  return twin_1d98 != 0u ? 1 : 0;
}

extern "C" int32_t isaac_pm_td_rvb_case3_branch(int32_t fatal_1340,
                                                int32_t health_type1,
                                                int32_t health_type2,
                                                int32_t char_type_13c0) {
  /* PE 0x007a26e4 cmp / 0x007a2729 jle split; 0x007a273a cmp eax,3 on the
     gt0 arm; 0x007a2750 cmp eax,4; RE-PROBE 0x007a2768 then cmp eax,3;
     0x007a2788 cmp [0x13c0],0x12. Same shape as RESET 0x007a16af..0x1788;
     implemented from its own range, agreement pinned by test. */
  if (fatal_1340 > 0) {
    return health_type1 == 3 ? ISAAC_PM_TD_RESET_BRANCH_GT0_HT1_EQ3
                             : ISAAC_PM_TD_RESET_BRANCH_GT0_HT1_NE3;
  }
  if (health_type1 == 4) {
    return ISAAC_PM_TD_RESET_BRANCH_LE0_HT1_EQ4;
  }
  if (health_type2 == 3) {
    return ISAAC_PM_TD_RESET_BRANCH_LE0_HT2_EQ3;
  }
  return char_type_13c0 == ISAAC_PM_TD_RESET_CHAR_MATCH
             ? ISAAC_PM_TD_RESET_BRANCH_CHAR_12
             : ISAAC_PM_TD_RESET_BRANCH_ELSE;
}

extern "C" int32_t isaac_pm_td_rvb_high2_branch(int32_t fatal_1340,
                                                int32_t health_type1,
                                                int32_t health_type2,
                                                int32_t char_type_13c0) {
  /* PE 0x007a2acb cmp / 0x007a2b10 jle; 0x007a2b21 cmp eax,3;
     0x007a2b3a cmp eax,4; RE-PROBE 0x007a2b4f then cmp eax,3;
     0x007a2b76 cmp [0x13c0],0x12. Third sibling of the RESET machine. */
  if (fatal_1340 > 0) {
    return health_type1 == 3 ? ISAAC_PM_TD_RESET_BRANCH_GT0_HT1_EQ3
                             : ISAAC_PM_TD_RESET_BRANCH_GT0_HT1_NE3;
  }
  if (health_type1 == 4) {
    return ISAAC_PM_TD_RESET_BRANCH_LE0_HT1_EQ4;
  }
  if (health_type2 == 3) {
    return ISAAC_PM_TD_RESET_BRANCH_LE0_HT2_EQ3;
  }
  return char_type_13c0 == ISAAC_PM_TD_RESET_CHAR_MATCH
             ? ISAAC_PM_TD_RESET_BRANCH_CHAR_12
             : ISAAC_PM_TD_RESET_BRANCH_ELSE;
}

extern "C" int32_t isaac_pm_td_rvb_case2_new_char(int32_t char_type_13c0) {
  /* PE 0x007a2818 cmp [0x13c0],0x19 ; 0x007a286f je keep ;
     0x007a2871 mov [0x13c0],4. */
  return char_type_13c0 == ISAAC_PM_TD_RVB_CASE2_CHAR_KEEP
             ? char_type_13c0
             : ISAAC_PM_TD_RVB_CASE2_CHAR_NEW;
}

extern "C" int32_t isaac_pm_td_rvb_eq137_new_char(int32_t char_type_13c0) {
  /* PE 0x007a28f0 cmp [0x13c0],0x18 ; 0x007a2933 je ; mov [0x13c0],0xc. */
  return char_type_13c0 == ISAAC_PM_TD_RVB_EQ137_CHAR_KEEP
             ? char_type_13c0
             : ISAAC_PM_TD_RVB_EQ137_CHAR_NEW;
}

extern "C" int32_t isaac_pm_td_rvb_high0_new_char(int32_t char_type_13c0) {
  /* PE 0x007a318e cmp eax,0x1d ; je ; cmp eax,0x26 ; je ;
     mov [0x13c0],0xb. */
  if (char_type_13c0 == ISAAC_PM_TD_RVB_HIGH0_CHAR_KEEP_A ||
      char_type_13c0 == ISAAC_PM_TD_RVB_HIGH0_CHAR_KEEP_B) {
    return char_type_13c0;
  }
  return ISAAC_PM_TD_RVB_HIGH0_CHAR_NEW;
}

extern "C" int32_t isaac_pm_td_rvb_high2_char_path(int32_t char_type_13c0) {
  /* PE 0x007a2be3: cmp 0x10 / cmp 0x23 -> 0x7a2da3; cmp 0xa / 0x1f / 0x27
     -> 0x7a2d29; else fallthrough 0x7a2c10. Same sets as the v10 CHAR
     dispatch; agreement pinned by test. */
  if (char_type_13c0 == 0x10 || char_type_13c0 == 0x23) {
    return ISAAC_PM_TD_CHAR_PATH_0;
  }
  if (char_type_13c0 == 0xa || char_type_13c0 == 0x1f ||
      char_type_13c0 == 0x27) {
    return ISAAC_PM_TD_CHAR_PATH_1;
  }
  return ISAAC_PM_TD_CHAR_PATH_2;
}

extern "C" int32_t isaac_pm_td_rvb_high2_first_sfx(int32_t path) {
  /* Path 0 plays 0x1b at 0x007a2daf; path 1 plays only 0x50 at
     0x007a2d35; path 2 plays 0x1c at 0x007a2c1c. NOT the v10 CHAR site's
     0x1e default — different site, different id. */
  switch (path) {
    case ISAAC_PM_TD_CHAR_PATH_0: return ISAAC_PM_TD_RVB_SFX_1B;
    case ISAAC_PM_TD_CHAR_PATH_1: return ISAAC_PM_TD_RVB_SFX_50;
    default: return ISAAC_PM_TD_RVB_SFX_1C;
  }
}

extern "C" uint32_t isaac_pm_td_rvb_high2_first_sfx_vol_bits(int32_t path) {
  /* 0x3fa00000 (1.25f) for paths 0/2 (0x007a2dd5 / 0x007a2c42);
     0x3f800000 (1.0f) for path 1 (0x007a2d5b). */
  return path == ISAAC_PM_TD_CHAR_PATH_1
             ? static_cast<uint32_t>(ISAAC_PM_TD_RVB_SFX_VOL_1_0_BITS)
             : static_cast<uint32_t>(ISAAC_PM_TD_RVB_SFX_VOL_1_25_BITS);
}

extern "C" int32_t isaac_pm_td_rvb_high2_sfx_count(int32_t path) {
  /* Paths 0/2 follow with 0x50 at 1.0 (0x007a2e03 / 0x007a2c66);
     path 1 plays a single SFX. */
  return path == ISAAC_PM_TD_CHAR_PATH_1 ? 1 : 2;
}

extern "C" int32_t isaac_pm_td_rvb_high0_costume_kind(int32_t char_type_13c0) {
  /* PE 0x007a30ac: cmp eax,8 ; je 0x7a30ee (skip the whole block)
     PE 0x007a30b1: cmp eax,0x23 ; je 0x7a30bd (skip only 0x007c3620). */
  if (char_type_13c0 == ISAAC_PM_TD_RVB_HIGH0_CHAR_SKIP_ALL) {
    return ISAAC_PM_TD_RVB_HIGH0_COSTUME_SKIP;
  }
  return char_type_13c0 == ISAAC_PM_TD_RVB_HIGH0_CHAR_NO_PRE
             ? ISAAC_PM_TD_RVB_HIGH0_COSTUME_NO_PRE
             : ISAAC_PM_TD_RVB_HIGH0_COSTUME_FULL;
}

extern "C" int32_t isaac_pm_td_rvb_high0_cfg_in_bounds(uint32_t begin,
                                                       uint32_t end) {
  /* PE 0x007a30ce: sub eax,ecx ; and eax,0xfffffffc ; cmp eax,0x530 ;
     jg read — signed compare of the dword-aligned byte span. */
  const int32_t span = static_cast<int32_t>((end - begin) & 0xfffffffcu);
  return span > ISAAC_PM_TD_RVB_HIGH0_CFG_ELEM_OFF ? 1 : 0;
}

extern "C" int32_t isaac_pm_td_rvb_high0_item_gate(uint32_t begin,
                                                   uint32_t end,
                                                   uint32_t elem_c4) {
  /* PE 0x007a31bd: sub ; and 0xfffffffc ; cmp eax,0xc4 ; jle skip
     PE 0x007a31cf: test eax,eax ; je skip. */
  const int32_t span = static_cast<int32_t>((end - begin) & 0xfffffffcu);
  if (span <= ISAAC_PM_TD_RVB_HIGH0_ITEM_ELEM_OFF) {
    return 0;
  }
  return elem_c4 != 0u ? 1 : 0;
}

extern "C" int32_t isaac_pm_td_rvb_high0_fatal_update(int32_t v1340) {
  /* PE 0x007a30fa: add eax,-2 (32-bit wrap) ; mov ecx,2 ; cmp ; cmovg
     ecx,eax ; mov [0x1340],ecx. */
  const int32_t t = static_cast<int32_t>(static_cast<uint32_t>(v1340) - 2u);
  return t > 2 ? t : 2;
}

extern "C" int32_t isaac_pm_td_rvb_high0_soul_update(int32_t v1340) {
  /* PE 0x007a3131: cmp ecx,2 ; cmovle eax,edx ; mov eax,[eax] ;
     mov [0x1344],eax. ecx = max(v1340-2, 2) >= 2, so both arms produce
     2 — the faithful expression is kept, not folded. */
  const int32_t c = isaac_pm_td_rvb_high0_fatal_update(v1340);
  return c <= 2 ? c : 2;
}

extern "C" int32_t isaac_pm_td_rvb_high0_extra_lives_gate(
    uint32_t has_26b, int32_t char_type_13c0) {
  /* PE 0x007a3171: test al,al ; je (low byte of the 0x007706e0 probe,
     char re-read AFTER the call at 0x007a3175)
     PE 0x007a3175: cmp dword [edi+0x13c0],8 ; jne. */
  if ((has_26b & 0xffu) == 0u) {
    return 0;
  }
  return char_type_13c0 == ISAAC_PM_TD_RVB_HIGH0_CHAR_SKIP_ALL ? 1 : 0;
}

extern "C" int32_t isaac_pm_td_rvb_twin_pos_adopt(uint32_t twin_1d9c) {
  /* PE 0x007a2bb9 / 0x007a3218: test reg,reg ; je — full dword. */
  return twin_1d9c != 0u ? 1 : 0;
}

extern "C" int32_t isaac_pm_td_rvb_zero_mask(int32_t body) {
  switch (body) {
    case ISAAC_PM_TD_RVB_BODY_CASE0: return ISAAC_PM_TD_RVB_ZERO_MASK_CASE0;
    case ISAAC_PM_TD_RVB_BODY_CASE1: return ISAAC_PM_TD_RVB_ZERO_MASK_CASE1;
    case ISAAC_PM_TD_RVB_BODY_CASE2: return ISAAC_PM_TD_RVB_ZERO_MASK_CASE2;
    case ISAAC_PM_TD_RVB_BODY_CASE3: return ISAAC_PM_TD_RVB_ZERO_MASK_CASE3;
    case ISAAC_PM_TD_RVB_BODY_EQ137: return ISAAC_PM_TD_RVB_ZERO_MASK_EQ137;
    case ISAAC_PM_TD_RVB_BODY_HIGH0: return ISAAC_PM_TD_RVB_ZERO_MASK_HIGH0;
    case ISAAC_PM_TD_RVB_BODY_HIGH1: return ISAAC_PM_TD_RVB_ZERO_MASK_HIGH1;
    case ISAAC_PM_TD_RVB_BODY_HIGH2: return ISAAC_PM_TD_RVB_ZERO_MASK_HIGH2;
    case ISAAC_PM_TD_RVB_BODY_DEFAULT:
      return ISAAC_PM_TD_RVB_ZERO_MASK_DEFAULT;
    default: return -1;
  }
}

extern "C" int32_t isaac_pm_td_rvb_const_134c(int32_t body) {
  switch (body) {
    case ISAAC_PM_TD_RVB_BODY_CASE2: return ISAAC_PM_TD_RVB_CASE2_CONST_134C;
    case ISAAC_PM_TD_RVB_BODY_EQ137: return ISAAC_PM_TD_RVB_EQ137_CONST_134C;
    case ISAAC_PM_TD_RVB_BODY_HIGH1: return ISAAC_PM_TD_RVB_HIGH1_CONST_134C;
    default: return -1;
  }
}

/* ====================================================================== */
/* v12 CFG — VA 0x0069bd10, the CASE0 config probe, translated whole.     */
/* ====================================================================== */

extern "C" uint32_t isaac_pm_td_rvb_cfg_receiver(uint32_t manager_ptr) {
  /* Callsites build the receiver three ways for the same value:
     0x007a24b5 lea ecx,[esi+0x2a670]; 0x008ecb81 add ecx,0x2a670;
     0x00417910 mov eax,[0xc7169c] / add eax,0x2a670 / ret. 32-bit wrap. */
  return static_cast<uint32_t>(
      manager_ptr + static_cast<uint32_t>(ISAAC_PM_TD_RVB_CFG_VEC_OFF));
}

extern "C" int32_t isaac_pm_td_rvb_cfg_count(uint32_t begin, uint32_t end) {
  /* 0x0069bd27 sub ecx,edi — 32-bit wrapping subtraction, then read as a
     SIGNED dword by the one-operand imul. */
  const int32_t span = static_cast<int32_t>(
      static_cast<uint32_t>(end - begin));
  /* 0x0069bd29 imul ecx — signed 64-bit product in EDX:EAX. Modelled as
     the machine sequence, never as `span / 0x148`. */
  const int64_t product =
      static_cast<int64_t>(
          static_cast<int32_t>(ISAAC_PM_TD_RVB_CFG_DIV_MAGIC)) *
      static_cast<int64_t>(span);
  /* EDX = high dword of the product. */
  const int32_t high = static_cast<int32_t>(
      static_cast<uint32_t>(static_cast<uint64_t>(product) >> 32));
  /* 0x0069bd2b sar edx,7 — arithmetic, so it floors for negatives. */
  const int32_t shifted = high >> ISAAC_PM_TD_RVB_CFG_DIV_SHIFT;
  /* 0x0069bd30 shr eax,0x1f — the sign fix that turns the floor into a
     truncation toward zero. Dropping it breaks every negative span. */
  const uint32_t sign_fix = static_cast<uint32_t>(shifted) >> 31;
  /* 0x0069bd33 add eax,edx — 32-bit wrap. */
  return static_cast<int32_t>(static_cast<uint32_t>(shifted) + sign_fix);
}

extern "C" int32_t isaac_pm_td_rvb_cfg_in_range(int32_t id, uint32_t begin,
                                                uint32_t end) {
  /* 0x0069bd18 test esi,esi ; 0x0069bd1a js — SIGNED sign test. An
     unsigned model can never take this branch and inverts the result for
     every id with bit 31 set. */
  if (id < 0) {
    return 0;
  }
  /* 0x0069bd35 cmp esi,eax ; 0x0069bd37 jge — SIGNED. With a negative
     count (negative span) this is always true, so every id falls back. */
  return id >= isaac_pm_td_rvb_cfg_count(begin, end) ? 0 : 1;
}

extern "C" uint32_t isaac_pm_td_rvb_cfg_entry(int32_t id, uint32_t begin,
                                              uint32_t end) {
  if (isaac_pm_td_rvb_cfg_in_range(id, begin, end) == 0) {
    /* 0x0069bd47 pop edi ; 0x0069bd48 xor eax,eax — the recovered
       fallback tail returns NULL and does nothing else. */
    return 0u;
  }
  /* 0x0069bd39 imul eax,esi,0x148 then 0x0069bd3f add eax,edi — both
     32-bit wrapping. */
  const uint32_t scaled = static_cast<uint32_t>(id) *
                          static_cast<uint32_t>(ISAAC_PM_TD_RVB_CFG_STRIDE);
  return static_cast<uint32_t>(scaled + begin);
}

extern "C" uint32_t isaac_pm_td_rvb_cfg_exit_va(int32_t id, uint32_t begin,
                                                uint32_t end) {
  return isaac_pm_td_rvb_cfg_in_range(id, begin, end) != 0
             ? static_cast<uint32_t>(ISAAC_PM_TD_RVB_CFG_VA_RET_IN_RANGE)
             : static_cast<uint32_t>(ISAAC_PM_TD_RVB_CFG_VA_RET_FALLBACK);
}

extern "C" int32_t isaac_pm_td_rvb_case0_cfg_field_off(int32_t branch,
                                                       int32_t probe_index) {
  /* 0x007a24c7 mov eax,[eax+0xb4] (HT1 slot 0);
     0x007a24e6 mov eax,[eax+0xb8] (HT1 slot 1);
     0x007a251f mov eax,[eax+0xb0] (HT4 slot 0). */
  if (branch == ISAAC_PM_TD_RVB_CASE0_BRANCH_HT1) {
    if (probe_index == ISAAC_PM_TD_RVB_CFG_PROBE_0) {
      return ISAAC_PM_TD_RVB_CFG_OFF_B4;
    }
    if (probe_index == ISAAC_PM_TD_RVB_CFG_PROBE_1) {
      return ISAAC_PM_TD_RVB_CFG_OFF_B8;
    }
    return -1;
  }
  if (branch == ISAAC_PM_TD_RVB_CASE0_BRANCH_HT4 &&
      probe_index == ISAAC_PM_TD_RVB_CFG_PROBE_0) {
    return ISAAC_PM_TD_RVB_CFG_OFF_B0;
  }
  return -1;
}

extern "C" uint32_t isaac_pm_td_rvb_case0_cfg_field_va(int32_t branch,
                                                       int32_t probe_index,
                                                       int32_t char_type_13c0,
                                                       uint32_t begin,
                                                       uint32_t end) {
  const int32_t field = isaac_pm_td_rvb_case0_cfg_field_off(branch,
                                                            probe_index);
  if (field < 0) {
    return 0u;
  }
  /* Both HT1 probes read [p+0x13c0] ONCE at 0x007a24ae into edi, which
     0x0069bd10 preserves (push edi / pop edi), so slot 1 re-issues the
     probe with the identical id and receiver. The pointer is the same;
     only the field differs. The issuance COUNT stays 2 (v11). */
  const uint32_t entry = isaac_pm_td_rvb_cfg_entry(char_type_13c0, begin,
                                                   end);
  if (entry == 0u) {
    return 0u;
  }
  return static_cast<uint32_t>(entry + static_cast<uint32_t>(field));
}

extern "C" int32_t isaac_pm_td_rvb_cfg_site_null_checked(
    uint32_t callsite_va) {
  switch (callsite_va) {
    /* 0x005be4a9 test eax,eax ; je 0x005be4fe. */
    case static_cast<uint32_t>(ISAAC_PM_TD_RVB_CFG_SITE_5BE49E):
    /* 0x0065d7d3 test eax,eax ; je 0x0065d8c2. */
    case static_cast<uint32_t>(ISAAC_PM_TD_RVB_CFG_SITE_65D7CE):
    /* 0x008ecb90 test eax,eax ; je 0x008ecbd8. */
    case static_cast<uint32_t>(ISAAC_PM_TD_RVB_CFG_SITE_8ECB88):
      return ISAAC_PM_TD_RVB_CFG_SITE_CHECKED;
    /* 0x007a24c7 / 0x007a24e6 / 0x007a251f / 0x009a2e35 all dereference
       the returned pointer immediately. Original defect: reproduced. */
    case static_cast<uint32_t>(ISAAC_PM_TD_RVB_CFG_SITE_CASE0_HT1_A):
    case static_cast<uint32_t>(ISAAC_PM_TD_RVB_CFG_SITE_CASE0_HT1_B):
    case static_cast<uint32_t>(ISAAC_PM_TD_RVB_CFG_SITE_CASE0_HT4):
    case static_cast<uint32_t>(ISAAC_PM_TD_RVB_CFG_SITE_9A2E30):
      return ISAAC_PM_TD_RVB_CFG_SITE_UNCHECKED;
    default:
      return ISAAC_PM_TD_RVB_CFG_SITE_UNKNOWN;
  }
}

/* ====================================================================== */
/* v13 C0T — VA 0x007791f0 (the CASE0 tail host), translated whole.      */
/* ====================================================================== */

namespace {

/* Guest-shaped scratch access for the memory-level exports. On wasm32 a
   uint32_t address IS the linear-memory pointer; the host -fsyntax-only
   pass never executes these. */
inline uint32_t c0t_load_u32(uint32_t addr) {
  return *reinterpret_cast<const uint32_t*>(static_cast<uintptr_t>(addr));
}

inline void c0t_store_u32(uint32_t addr, uint32_t value) {
  *reinterpret_cast<uint32_t*>(static_cast<uintptr_t>(addr)) = value;
}

inline void c0t_store_u8(uint32_t addr, uint8_t value) {
  *reinterpret_cast<uint8_t*>(static_cast<uintptr_t>(addr)) = value;
}

/* inc eax ; cdq ; sub eax,edx ; sar eax,1 — signed halve of (v+1) with
   truncation toward zero, 32-bit wrap on the increment. Written from the
   0x007792ae..0x007792c0 instances of the idiom (NOT shared with the v11
   helper, which models its own range). */
inline int32_t c0t_half_of_inc(int32_t v) {
  const int32_t inc = static_cast<int32_t>(static_cast<uint32_t>(v) + 1u);
  const int32_t adj = static_cast<int32_t>(
      static_cast<uint32_t>(inc) + (inc < 0 ? 1u : 0u));
  return adj >> 1;
}

}  // namespace

extern "C" int32_t isaac_pm_ep_get_health_type(int32_t char_type_13c0) {
  /* 0x007cafe6 add eax,-4 — 32-bit wrap; 0x007cafe9 cmp eax,0x24 ;
     0x007cafec ja — UNSIGNED, so any char < 4 (including negatives)
     wraps huge and takes the default return 0 at 0x007cb014. */
  const uint32_t index =
      static_cast<uint32_t>(char_type_13c0) -
      static_cast<uint32_t>(ISAAC_PM_EP_HT_CHAR_MIN);
  if (index > static_cast<uint32_t>(ISAAC_PM_EP_HT_INDEX_MAX)) {
    return 0;
  }
  /* 0x007cafee movzx from the byte table, 0x007caff5 jmp through the
     5-entry table at 0x007cb018 into constant returns {1,2,3,4,0}. */
  switch (isaac_pm_ep_health_type_table_byte(static_cast<int32_t>(index))) {
    case 0: return 1;   /* 0x007caffc mov eax,1 */
    case 1: return 2;   /* 0x007cb002 mov eax,2 */
    case 2: return 3;   /* 0x007cb008 mov eax,3 */
    case 3: return 4;   /* 0x007cb00e mov eax,4 */
    default: return 0;  /* 0x007cb014 xor eax,eax */
  }
}

extern "C" int32_t isaac_pm_ep_health_type_table_byte(int32_t index) {
  /* The 0x25 bytes at 0x007cb02c, index = char - 4. Zero .text writes
     into [0x007cb018,0x007cb051) — constant for the process lifetime.
     Spelled as a compare chain (freestanding-module convention): jump
     index 0 (-> ht 1) for chars 4,0xc,0x11,0x18,0x19,0x23,0x24; 1 (-> 2)
     for 0xa,0x1f,0x28; 2 (-> 3) for 0xe,0x21; 3 (-> 4) for 0x10; else 4
     (-> 0). */
  if (index < 0 || index > ISAAC_PM_EP_HT_INDEX_MAX) {
    return -1;
  }
  switch (index + ISAAC_PM_EP_HT_CHAR_MIN) {
    case 0x04: case 0x0c: case 0x11: case 0x18: case 0x19:
    case 0x23: case 0x24:
      return 0;
    case 0x0a: case 0x1f: case 0x28:
      return 1;
    case 0x0e: case 0x21:
      return 2;
    case 0x10:
      return 3;
    default:
      return 4;
  }
}

extern "C" int32_t isaac_pm_c0t_getter_7cb060(int32_t char_type_13c0,
                                              int32_t v1340,
                                              int32_t v1d88) {
  /* 0x007cb060 mov edx,ecx / call 0x007cafe0 / cmp eax,1 / cmp eax,2 /
     the same select as the C0T recompute, RETURNED not stored. */
  const int32_t ht = isaac_pm_ep_get_health_type(char_type_13c0);
  return isaac_pm_c0t_new_1344(ht, v1340, v1d88);
}

extern "C" int32_t isaac_pm_c0t_walk_engaged(uint32_t char_type_13c0) {
  /* 0x007791fc cmp dword [esi+0x13c0],0x11 — FULL 32-bit compare; a
     low-byte model would walk for char 0x111. */
  return char_type_13c0 == static_cast<uint32_t>(ISAAC_PM_C0T_WALK_CHAR)
             ? 1
             : 0;
}

extern "C" int32_t isaac_pm_c0t_walk_continue(uint32_t char_type_13c0,
                                              uint32_t twin_1d98) {
  /* PE test order: char first (0x00779203 jne), then the twin NULL test
     (0x0077920d je). */
  if (isaac_pm_c0t_walk_engaged(char_type_13c0) == 0) {
    return 0;
  }
  return twin_1d98 != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_pm_c0t_twin_walk(uint32_t player_addr,
                                           int32_t step_cap) {
  /* 0x007791fc..0x00779218. The adopted twin's char only decides whether
     to CONTINUE: once the current char is 0x11 and the twin is non-NULL
     the walk lands on the twin unconditionally. The PE has NO hop bound
     (a walker cycle hangs the original — pinned defect); step_cap is the
     harness affordance that reports non-termination as 0. */
  uint32_t cur = player_addr;
  if (c0t_load_u32(cur + static_cast<uint32_t>(ISAAC_PM_C0T_OFF_CHAR_13C0)) !=
      static_cast<uint32_t>(ISAAC_PM_C0T_WALK_CHAR)) {
    return cur;
  }
  int32_t hops = 0;
  for (;;) {
    const uint32_t twin = c0t_load_u32(
        cur + static_cast<uint32_t>(ISAAC_PM_TD_RVB_OFF_TWIN_1D98));
    if (twin == 0u) {
      return cur;
    }
    if (hops >= step_cap) {
      return 0u; /* cap exhausted while the PE would keep walking */
    }
    hops += 1;
    cur = twin; /* 0x0077920f mov esi,eax — unconditional adoption */
    if (c0t_load_u32(cur +
                     static_cast<uint32_t>(ISAAC_PM_C0T_OFF_CHAR_13C0)) !=
        static_cast<uint32_t>(ISAAC_PM_C0T_WALK_CHAR)) {
      return cur;
    }
  }
}

extern "C" int32_t isaac_pm_c0t_new_1344(int32_t health_type,
                                         int32_t v1340,
                                         int32_t v1d88) {
  /* 0x00779227 cmp eax,1 ; 0x0077922c cmp eax,2 — full-dword equality.
     The {1,2} arm takes [0x1340] ALONE; the bone term is on the ELSE
     arm. 0x0077923d lea eax,[eax+ecx*2] wraps at 32 bits. */
  if (health_type == 1 || health_type == 2) {
    return v1340;
  }
  return static_cast<int32_t>(
      static_cast<uint32_t>(v1340) + 2u * static_cast<uint32_t>(v1d88));
}

extern "C" int32_t isaac_pm_c0t_recompute_uses_bone(int32_t health_type) {
  return (health_type == 1 || health_type == 2) ? 0 : 1;
}

extern "C" int32_t isaac_pm_c0t_scan_gate(int32_t new_1344,
                                          int32_t pre_1344) {
  /* 0x0077924e cmp eax,edx ; 0x00779250 jl — SIGNED, and the jl SKIPS
     the scan, so the scan runs on new >= pre. An unsigned model inverts
     the common wrap cases (INT_MIN vs small positive). */
  return new_1344 >= pre_1344 ? 1 : 0;
}

extern "C" uint32_t isaac_pm_c0t_scan_slot_va(uint32_t game_addr,
                                              int32_t slot_index) {
  /* 0x00779257 add eax,0x1da04 then per-iteration 0x00779265 add
     eax,0x6dc — all 32-bit wrapping adds. */
  return static_cast<uint32_t>(
      game_addr + static_cast<uint32_t>(ISAAC_PM_C0T_SCAN_BASE_OFF) +
      static_cast<uint32_t>(slot_index) *
          static_cast<uint32_t>(ISAAC_PM_C0T_SCAN_STRIDE));
}

extern "C" int32_t isaac_pm_c0t_scan_find(uint32_t game_addr,
                                          uint32_t player_addr) {
  /* The base pointer is materialised ONCE before the loop (g_Game READ A
     at 0x00779252); the loop advances by stride and re-compares the
     bound each iteration (cmp ecx,8 ; jb — unsigned). FIRST match only
     (je 0x00779271 leaves the loop). */
  uint32_t slot = game_addr + static_cast<uint32_t>(ISAAC_PM_C0T_SCAN_BASE_OFF);
  for (uint32_t i = 0; i < static_cast<uint32_t>(ISAAC_PM_C0T_SCAN_SLOTS);
       i += 1) {
    if (c0t_load_u32(slot) == player_addr) {
      return static_cast<int32_t>(i);
    }
    slot = static_cast<uint32_t>(
        slot + static_cast<uint32_t>(ISAAC_PM_C0T_SCAN_STRIDE));
  }
  return ISAAC_PM_C0T_SCAN_NO_MATCH;
}

extern "C" int32_t isaac_pm_c0t_scan_apply(uint32_t game_addr,
                                           uint32_t player_addr) {
  const int32_t found = isaac_pm_c0t_scan_find(game_addr, player_addr);
  if (found != ISAAC_PM_C0T_SCAN_NO_MATCH) {
    /* 0x00779271 mov byte [eax+0xc],4 — one byte, first match only. */
    c0t_store_u8(
        static_cast<uint32_t>(
            isaac_pm_c0t_scan_slot_va(game_addr, found) +
            static_cast<uint32_t>(ISAAC_PM_C0T_SCAN_BYTE_OFF)),
        static_cast<uint8_t>(ISAAC_PM_C0T_SCAN_BYTE_VALUE));
  }
  return found;
}

extern "C" int32_t isaac_pm_c0t_heal_gate(int32_t game_26614,
                                          uint32_t dead_173,
                                          int32_t red_194c) {
  /* 0x00779281 cmp dword,2 ; jge skip — SIGNED. */
  if (game_26614 >= ISAAC_PM_TD_RVB_HEAL_LIMIT) {
    return 0;
  }
  /* 0x0077928a cmp byte [esi+0x173],0 — LOW BYTE ONLY; the parameter is
     widened and re-narrowed here (v9 rule). */
  if ((dead_173 & 0xffu) != 0u) {
    return 0;
  }
  /* 0x00779299 test edi,edi ; jle — SIGNED, zero also skips. */
  return red_194c > 0 ? 1 : 0;
}

extern "C" int32_t isaac_pm_c0t_heal_capacity(int32_t v1340, int32_t v1344,
                                              int32_t v134c,
                                              int32_t v1d88) {
  /* 0x007792a9 cmp ecx,eax ; 0x007792ab cmovl — min_signed of the two
     post-host heart fields, then the two halve idioms and the wrapping
     adds (0x007792c2 / 0x007792c4). */
  const int32_t min_hearts = v1340 < v1344 ? v1340 : v1344;
  const int32_t half_a = c0t_half_of_inc(min_hearts);
  const int32_t half_b = c0t_half_of_inc(v134c);
  return static_cast<int32_t>(static_cast<uint32_t>(half_a) +
                              static_cast<uint32_t>(half_b) +
                              static_cast<uint32_t>(v1d88));
}

extern "C" int32_t isaac_pm_c0t_heal_applies(int32_t red_194c,
                                             int32_t capacity) {
  /* 0x007792ca cmp edi,ebx ; jle skip — SIGNED strict. */
  return red_194c > capacity ? 1 : 0;
}

extern "C" int32_t isaac_pm_c0t_heal_excess(int32_t red_194c,
                                            int32_t capacity) {
  /* 0x007792ce sub edi,ebx — 32-bit wrap; pushed as-is. */
  if (red_194c <= capacity) {
    return 0;
  }
  return static_cast<int32_t>(static_cast<uint32_t>(red_194c) -
                              static_cast<uint32_t>(capacity));
}

extern "C" void isaac_pm_c0t_run_pre(uint32_t player_addr,
                                     uint32_t game_addr, int32_t walk_cap,
                                     IsaacPmC0tPrePlan* plan) {
  if (plan == nullptr) {
    return;
  }
  plan->next_host_va =
      static_cast<uint32_t>(ISAAC_PM_TD_RVB_VA_UPDATE_RED_HEARTS);
  const uint32_t walked = isaac_pm_c0t_twin_walk(player_addr, walk_cap);
  if (walked == 0u) {
    /* Harness cap expired: the PE would still be walking. Nothing after
       the walk runs and NOTHING is stored. */
    plan->walked_addr = 0u;
    plan->walk_terminated = 0;
    plan->pre_1344 = 0;
    plan->health_type = 0;
    plan->new_1344 = 0;
    plan->scan_runs = 0;
    plan->scan_index = ISAAC_PM_C0T_SCAN_SKIPPED;
    plan->scan_store_applied = 0;
    return;
  }
  plan->walked_addr = walked;
  plan->walk_terminated = 1;
  /* 0x0077921a — the pre-call snapshot. GetHealthType is a proven pure
     leaf, so no recapture is needed across it; the snapshot is still
     taken BEFORE the probe exactly as the PE orders it. */
  const int32_t pre = static_cast<int32_t>(c0t_load_u32(
      walked + static_cast<uint32_t>(ISAAC_PM_C0T_OFF_SOUL_1344)));
  plan->pre_1344 = pre;
  const int32_t ht = isaac_pm_ep_get_health_type(static_cast<int32_t>(
      c0t_load_u32(walked +
                   static_cast<uint32_t>(ISAAC_PM_C0T_OFF_CHAR_13C0))));
  plan->health_type = ht;
  const int32_t nv = isaac_pm_c0t_new_1344(
      ht,
      static_cast<int32_t>(c0t_load_u32(
          walked + static_cast<uint32_t>(ISAAC_PM_C0T_OFF_FATAL_1340))),
      static_cast<int32_t>(c0t_load_u32(
          walked + static_cast<uint32_t>(ISAAC_PM_TD_RVB_OFF_BONE_1D88))));
  plan->new_1344 = nv;
  /* 0x00779248 — the recomputed value is STORED before the gate. */
  c0t_store_u32(walked + static_cast<uint32_t>(ISAAC_PM_C0T_OFF_SOUL_1344),
                static_cast<uint32_t>(nv));
  const int32_t runs = isaac_pm_c0t_scan_gate(nv, pre);
  plan->scan_runs = runs;
  if (runs == 0) {
    plan->scan_index = ISAAC_PM_C0T_SCAN_SKIPPED;
    plan->scan_store_applied = 0;
    return;
  }
  const int32_t found = isaac_pm_c0t_scan_apply(game_addr, walked);
  plan->scan_index = found;
  plan->scan_store_applied = found != ISAAC_PM_C0T_SCAN_NO_MATCH ? 1 : 0;
}

extern "C" void isaac_pm_c0t_heal_plan(int32_t game_26614, uint32_t dead_173,
                                       int32_t red_194c, int32_t v1340,
                                       int32_t v1344, int32_t v134c,
                                       int32_t v1d88,
                                       IsaacPmC0tHealPlan* plan) {
  if (plan == nullptr) {
    return;
  }
  plan->tail_host_va =
      static_cast<uint32_t>(ISAAC_PM_C0T_VA_UPDATE_BONE_HEARTS);
  plan->gate = isaac_pm_c0t_heal_gate(game_26614, dead_173, red_194c);
  if (plan->gate == 0) {
    plan->capacity = 0;
    plan->applies = 0;
    plan->excess = 0;
    plan->store_194c_after_host = 0;
    plan->heal_host_va = 0u;
    return;
  }
  plan->capacity = isaac_pm_c0t_heal_capacity(v1340, v1344, v134c, v1d88);
  plan->applies = isaac_pm_c0t_heal_applies(red_194c, plan->capacity);
  plan->excess = isaac_pm_c0t_heal_excess(red_194c, plan->capacity);
  /* 0x007792d8 retires only after the 0x007ca2d0 burst ran. v16 translates
     that burst itself (isaac_pm_heal_plan), so the record carries no host
     VA any more — the heal edge is a pure plan in this family. */
  plan->store_194c_after_host = plan->applies;
  plan->heal_host_va = 0u;
}

/* ====================================================================== */
/* v14 — UBH exact update_bone_hearts 0x007cabc0 + GHL exact             */
/* GetHealthLimit(bool) 0x007cae60, translated whole.                    */
/* ====================================================================== */

namespace {

/* rol/ror with the x86 5-bit count mask for 32-bit operands. The n == 0
   guard keeps the C++ shift counts in range (x86 rotates by 0 are
   no-ops). */
inline uint32_t ubh_rol32(uint32_t x, uint32_t n) {
  n &= 31u;
  if (n == 0u) {
    return x;
  }
  return (x << n) | (x >> (32u - n));
}

inline uint32_t ubh_ror32(uint32_t x, uint32_t n) {
  n &= 31u;
  if (n == 0u) {
    return x;
  }
  return (x >> n) | (x << (32u - n));
}

/* cdq / sub / sar 1 — trunc-toward-zero halve (0x007cabeb/0x007cac2b).
   Written from THIS range; the v13 c0t_half_of_inc models its own. */
inline int32_t ubh_trunc_half(int32_t v) {
  const int32_t adj =
      static_cast<int32_t>(static_cast<uint32_t>(v) + (v < 0 ? 1u : 0u));
  return adj >> 1;
}

/* Loop 1 (0x007cac4d..0x007cac63) — both outputs in one pass. */
struct UbhLoop1Out {
  uint32_t bits;
  int32_t budget;
};

inline UbhLoop1Out ubh_loop1(uint32_t bits, int32_t total_slots,
                             int32_t budget) {
  UbhLoop1Out out{bits, budget};
  if (total_slots <= 0) {
    return out; /* jle 0x007cac6b — loop and write-back skipped */
  }
  uint32_t probe = 1u; /* mov ecx,1 */
  for (int32_t idx = 0; idx < total_slots;
       idx = static_cast<int32_t>(static_cast<uint32_t>(idx) + 1u)) {
    if ((out.bits & probe) != 0u) { /* test ecx,eax ; je */
      /* sub esi,1 — the jns consumes SF of THIS wrap. */
      out.budget = static_cast<int32_t>(
          static_cast<uint32_t>(out.budget) - 1u);
      if (out.budget < 0) { /* jns skips when SF clear */
        /* btr eax,edx — register form indexes MOD 32. */
        out.bits &= ~(1u << (static_cast<uint32_t>(idx) & 31u));
      }
    }
    probe = ubh_rol32(probe, 1u); /* rol ecx,1 */
  }
  return out;
}

/* Loop 2 (0x007cac72..0x007cac9d). */
inline uint32_t ubh_loop2(uint32_t bits, int32_t total_slots,
                          int32_t budget) {
  int32_t idx = static_cast<int32_t>(
      static_cast<uint32_t>(total_slots) - 1u); /* lea edx,[ebx-1] */
  if (idx < 0) {
    return bits; /* js 0x007cac9f */
  }
  uint32_t probe = ubh_rol32(1u, static_cast<uint32_t>(idx)); /* rol eax,cl */
  for (;;) {
    if (budget <= 0) { /* test esi,esi ; jle — at the TOP */
      return bits;
    }
    /* mov ecx,[edi+0x1d8c] — reload every iteration; scalar form keeps
       the running word. */
    if ((bits & probe) == 0u) { /* test eax,ecx ; jne */
      bits |= 1u << (static_cast<uint32_t>(idx) & 31u); /* bts ecx,edx */
      budget -= 1;                                      /* dec esi */
    }
    probe = ubh_ror32(probe, 1u); /* ror eax,1 */
    idx = static_cast<int32_t>(static_cast<uint32_t>(idx) - 1u);
    if (idx < 0) { /* sub edx,1 ; jns */
      return bits;
    }
  }
}

}  // namespace

extern "C" int32_t isaac_pm_ubh_gate(int32_t game_26614) {
  /* 0x007cabc8 cmp dword [eax+0x26614],2 ; 0x007cabd1 jge — SIGNED, so
     INT_MIN opens the gate and 2 closes it. */
  return game_26614 < ISAAC_PM_UBH_GATE_LIMIT ? 1 : 0;
}

extern "C" int32_t isaac_pm_ubh_new_bone(int32_t limit, int32_t v1340,
                                         int32_t v134c, int32_t v1d88) {
  /* 0x007cabf6 sar eax,1 carries the 0x007cabeb cdq/sub trunc fix;
     0x007cabf8 sar ecx,1 does NOT — the sum half is a FLOOR. The sum
     itself wraps at 32 bits (inc + add). */
  const int32_t half_limit = ubh_trunc_half(limit);
  const int32_t sum = static_cast<int32_t>(
      static_cast<uint32_t>(v1340) + 1u + static_cast<uint32_t>(v134c));
  const int32_t floor_half = sum >> 1; /* bare sar */
  const int32_t avail = static_cast<int32_t>(
      static_cast<uint32_t>(half_limit) - static_cast<uint32_t>(floor_half));
  /* 0x007cabfc cmp ; 0x007cabfe cmovl — min_signed. */
  return avail < v1d88 ? avail : v1d88;
}

extern "C" int32_t isaac_pm_ubh_early_zero(int32_t new_bone) {
  /* 0x007cac07 test esi,esi ; 0x007cac09 jg — the zero-store path runs
     on new_bone <= 0 signed. */
  return new_bone <= 0 ? 1 : 0;
}

extern "C" int32_t isaac_pm_ubh_total_slots(int32_t v134c,
                                            int32_t new_bone) {
  /* 0x007cac23 lea eax,[edx+1] (wrap) ; trunc half ; 0x007cac35 add
     ebx,esi (wrap). */
  const int32_t inc = static_cast<int32_t>(
      static_cast<uint32_t>(v134c) + 1u);
  return static_cast<int32_t>(
      static_cast<uint32_t>(ubh_trunc_half(inc)) +
      static_cast<uint32_t>(new_bone));
}

extern "C" uint32_t isaac_pm_ubh_mask_1d8c(int32_t total_slots) {
  /* 0x007cac37 sub ecx,ebx (wrap) ; 0x007cac39 shr edx,cl — the shift
     count is CL & 31 (386 rule), which IS the behaviour for slots
     outside [1,31]: 0 and 32 keep everything, 33 keeps bit 0 only. */
  const uint32_t count =
      (static_cast<uint32_t>(ISAAC_PM_UBH_WORD_BITS) -
       static_cast<uint32_t>(total_slots)) & 31u;
  return 0xffffffffu >> count;
}

extern "C" int32_t isaac_pm_ubh_loop1_runs(int32_t total_slots) {
  /* 0x007cac49 test ebx,ebx ; 0x007cac4b jle. */
  return total_slots > 0 ? 1 : 0;
}

extern "C" int32_t isaac_pm_ubh_loop2_enters(int32_t total_slots) {
  /* 0x007cac6b lea edx,[ebx-1] (WRAP) ; 0x007cac70 js — INT_MIN - 1
     wraps to 0x7fffffff and ENTERS. Original corner, reproduced. */
  const int32_t idx = static_cast<int32_t>(
      static_cast<uint32_t>(total_slots) - 1u);
  return idx >= 0 ? 1 : 0;
}

extern "C" uint32_t isaac_pm_ubh_loop1_bits(uint32_t bits,
                                            int32_t total_slots,
                                            int32_t budget) {
  return ubh_loop1(bits, total_slots, budget).bits;
}

extern "C" int32_t isaac_pm_ubh_loop1_budget(uint32_t bits,
                                             int32_t total_slots,
                                             int32_t budget) {
  return ubh_loop1(bits, total_slots, budget).budget;
}

extern "C" uint32_t isaac_pm_ubh_loop2_bits(uint32_t bits,
                                            int32_t total_slots,
                                            int32_t budget) {
  return ubh_loop2(bits, total_slots, budget);
}

extern "C" void isaac_pm_ubh_run(int32_t game_26614, int32_t limit,
                                 int32_t v1340, int32_t v134c,
                                 int32_t v1d88, uint32_t bits_1d8c,
                                 IsaacPmUbhPlan* plan) {
  if (plan == nullptr) {
    return;
  }
  plan->gate_open = isaac_pm_ubh_gate(game_26614);
  plan->new_bone = 0;
  plan->early_zero = 0;
  plan->total_slots = 0;
  plan->mask = 0u;
  plan->mask_applied = 0;
  plan->loop1_ran = 0;
  plan->loop2_entered = 0;
  plan->budget_after_loop1 = 0;
  if (plan->gate_open == 0) {
    /* jge 0x007cac9f — NOTHING is stored; fields keep their inputs. */
    plan->final_1d88 = v1d88;
    plan->final_1d8c = bits_1d8c;
    plan->ret_va = static_cast<uint32_t>(ISAAC_PM_UBH_VA_RET_TAIL);
    return;
  }
  const int32_t nb = isaac_pm_ubh_new_bone(limit, v1340, v134c, v1d88);
  plan->new_bone = nb;
  if (isaac_pm_ubh_early_zero(nb) != 0) {
    /* 0x007cac0b / 0x007cac15 — both fields zeroed, RET EARLY. */
    plan->early_zero = 1;
    plan->final_1d88 = 0;
    plan->final_1d8c = 0u;
    plan->ret_va = static_cast<uint32_t>(ISAAC_PM_UBH_VA_RET_EARLY);
    return;
  }
  const int32_t slots = isaac_pm_ubh_total_slots(v134c, nb);
  plan->total_slots = slots;
  const uint32_t mask = isaac_pm_ubh_mask_1d8c(slots);
  plan->mask = mask;
  plan->mask_applied = 1; /* the and-store retires on every jg path */
  uint32_t bits = bits_1d8c & mask;
  int32_t budget = nb; /* esi survives from the min */
  plan->loop1_ran = isaac_pm_ubh_loop1_runs(slots);
  if (plan->loop1_ran != 0) {
    const UbhLoop1Out l1 = ubh_loop1(bits, slots, budget);
    bits = l1.bits;
    budget = l1.budget;
  }
  plan->budget_after_loop1 = budget;
  plan->loop2_entered = isaac_pm_ubh_loop2_enters(slots);
  if (plan->loop2_entered != 0) {
    bits = ubh_loop2(bits, slots, budget);
  }
  plan->final_1d88 = nb;
  plan->final_1d8c = bits;
  plan->ret_va = static_cast<uint32_t>(ISAAC_PM_UBH_VA_RET_TAIL);
}

extern "C" void isaac_pm_ubh_apply(uint32_t player_addr, uint32_t game_addr,
                                   int32_t limit, IsaacPmUbhPlan* plan) {
  if (plan == nullptr) {
    return;
  }
  const int32_t game_26614 = static_cast<int32_t>(c0t_load_u32(
      static_cast<uint32_t>(game_addr +
                            static_cast<uint32_t>(
                                ISAAC_PM_TD_RVB_HEAL_OFF_26614))));
  const uint32_t bone_va =
      player_addr + static_cast<uint32_t>(ISAAC_PM_TD_RVB_OFF_BONE_1D88);
  const uint32_t bits_va =
      player_addr + static_cast<uint32_t>(ISAAC_PM_UBH_OFF_BITS_1D8C);
  isaac_pm_ubh_run(
      game_26614, limit,
      static_cast<int32_t>(c0t_load_u32(
          player_addr + static_cast<uint32_t>(ISAAC_PM_C0T_OFF_FATAL_1340))),
      static_cast<int32_t>(c0t_load_u32(
          player_addr + static_cast<uint32_t>(ISAAC_PM_C0T_OFF_134C))),
      static_cast<int32_t>(c0t_load_u32(bone_va)), c0t_load_u32(bits_va),
      plan);
  if (plan->gate_open == 0) {
    return; /* the gate-closed path stores NOTHING */
  }
  /* The PE's intermediate 0x007cac01 store is not observable once the
     function returns; the final field values land here. */
  c0t_store_u32(bone_va, static_cast<uint32_t>(plan->final_1d88));
  c0t_store_u32(bits_va, plan->final_1d8c);
}

extern "C" int32_t isaac_pm_ghl_gate_lt2(int32_t game_26614) {
  /* 0x007cae6f cmp / 0x007cae78 jl — SIGNED < 2 continues. */
  return game_26614 < ISAAC_PM_UBH_GATE_LIMIT ? 1 : 0;
}

extern "C" int32_t isaac_pm_ghl_base(int32_t v2c, int32_t char_2) {
  /* v2c == 1 jumps straight to the 0xc arm (0x007caeda je 0x007caef3);
     otherwise the JOIN tests char_2 against 0x10/0x11 full-dword. */
  if (v2c == 1) {
    return ISAAC_PM_GHL_BASE_SMALL;
  }
  if (char_2 == 0x10 || char_2 == 0x11) {
    return ISAAC_PM_GHL_BASE_SMALL;
  }
  return ISAAC_PM_GHL_BASE_DEFAULT;
}

extern "C" int32_t isaac_pm_ghl_keeper_family(int32_t char_3) {
  return (char_3 == ISAAC_PM_GHL_KEEPER_CHAR_E ||
          char_3 == ISAAC_PM_GHL_KEEPER_CHAR_21)
             ? 1
             : 0;
}

extern "C" int32_t isaac_pm_ghl_keeper_skips(uint32_t keeper) {
  /* cmp byte [ebp+8],0 — LOW BYTE ONLY (v9 rule: widened parameter,
     explicit in-body mask; 0x100 reads as false). */
  return (keeper & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_pm_ghl_keeper_sel(int32_t char_3) {
  /* xor ecx,ecx ; cmp esi,0x21 ; setne cl ; lea ecx,[ecx*2+4]. */
  return ISAAC_PM_GHL_KEEPER_SEL_BASE +
         2 * (char_3 != ISAAC_PM_GHL_KEEPER_CHAR_21 ? 1 : 0);
}

extern "C" int32_t isaac_pm_ghl_keeper_base(int32_t char_3,
                                            int32_t gullet) {
  /* mov ebx,0x18 ; lea eax,[ecx+eax*2] (wrap) ; cmp ; cmovl. */
  const int32_t cand = static_cast<int32_t>(
      static_cast<uint32_t>(isaac_pm_ghl_keeper_sel(char_3)) +
      2u * static_cast<uint32_t>(gullet));
  return cand < ISAAC_PM_GHL_KEEPER_CAP ? cand : ISAAC_PM_GHL_KEEPER_CAP;
}

extern "C" int32_t isaac_pm_ghl_coin_bonus_q(int32_t coins_1368) {
  /* mov eax,0x51eb851f ; imul esi — SIGNED 64-bit product; sar edx,3 ;
     shr/add sign fix; cmovne keeps q+1 only at coins == 0x63. */
  const int64_t product =
      static_cast<int64_t>(coins_1368) *
      static_cast<int64_t>(ISAAC_PM_GHL_COIN_DIV_MAGIC);
  const int32_t high = static_cast<int32_t>(
      static_cast<uint64_t>(product) >> 32);
  const int32_t shifted = high >> ISAAC_PM_GHL_COIN_DIV_SHIFT;
  const int32_t q = static_cast<int32_t>(
      static_cast<uint32_t>(shifted) +
      (static_cast<uint32_t>(shifted) >> 31));
  return coins_1368 == ISAAC_PM_GHL_COIN_SPECIAL_63
             ? static_cast<int32_t>(static_cast<uint32_t>(q) + 1u)
             : q;
}

extern "C" int32_t isaac_pm_ghl_clamp(int32_t base, int32_t v1da0) {
  /* add eax,eax (wrap) ; sub ecx,eax (wrap) ; cmovg — max_signed(0, d). */
  const int32_t doubled = static_cast<int32_t>(
      2u * static_cast<uint32_t>(v1da0));
  const int32_t diff = static_cast<int32_t>(
      static_cast<uint32_t>(base) - static_cast<uint32_t>(doubled));
  return diff > 0 ? diff : 0;
}

extern "C" void isaac_pm_ghl_plan(const IsaacPmGhlInputs* in,
                                  IsaacPmGhlPlan* plan) {
  if (plan == nullptr) {
    return;
  }
  plan->result = 0;
  plan->ret_va = 0u;
  plan->base = 0;
  plan->keeper_skip = 0;
  plan->clamp_applied = 0;
  plan->probe78_issued = 0;
  plan->probe79_issued = 0;
  plan->has26b_char1_issued = 0;
  plan->gullet_issued = 0;
  plan->has26b_charE_issued = 0;
  plan->has1f5_issued = 0;
  plan->coin_bonus = 0;
  if (in == nullptr) {
    return;
  }
  if (isaac_pm_ghl_gate_lt2(in->game_26614) == 0) {
    /* 0x007cae7a mov eax,0xa0 — RET A; ebx never holds it. */
    plan->result = ISAAC_PM_GHL_RESULT_GATE_CLOSED;
    plan->ret_va = static_cast<uint32_t>(ISAAC_PM_GHL_VA_RET_A0);
    return;
  }
  if (in->v2c == 0) {
    /* char READ 1 arms; the 0x14 test reuses the SAME read 1 register,
       so a hit on 0x10 can never fall into the 0x79 probe. */
    if (in->char_1 == 0x10) {
      plan->probe78_issued = 1;
      if ((in->null78 & 0xffu) != 0u) { /* test al,al */
        plan->result = ISAAC_PM_GHL_CHAR_10_RESULT; /* lea eax,[ebx-0xa] */
        plan->ret_va = static_cast<uint32_t>(ISAAC_PM_GHL_VA_RET_NULL78);
        return;
      }
    }
    if (in->char_1 == 0x14) {
      plan->probe79_issued = 1;
      if ((in->null79 & 0xffu) != 0u) {
        plan->result = ISAAC_PM_GHL_CHAR_14_RESULT; /* lea eax,[ebx-0x10] */
        plan->ret_va = static_cast<uint32_t>(ISAAC_PM_GHL_VA_RET_NULL79);
        return;
      }
    }
  }
  /* v2c != 0 paths issue no null-effect probe: v2c == 1 jumps straight
     to the 0xc arm, any other nonzero joins at 0x007caedc. */
  int32_t base = isaac_pm_ghl_base(in->v2c, in->char_2);
  /* 0x007caefe cmp eax,1 — eax is char READ 2 on every path here. */
  if (in->char_2 == 1) {
    plan->has26b_char1_issued = 1;
    if ((in->has26b_char1 & 0xffu) != 0u) {
      base = static_cast<int32_t>(
          static_cast<uint32_t>(base) +
          static_cast<uint32_t>(ISAAC_PM_GHL_CHAR1_BONUS));
    }
  }
  if (isaac_pm_ghl_keeper_family(in->char_3) == 0) {
    if (isaac_pm_ghl_keeper_skips(in->keeper) != 0) {
      plan->keeper_skip = 1;
      plan->base = base;
      plan->result = base; /* mov eax,ebx at 0x007cafcc — NO clamp */
      plan->ret_va = static_cast<uint32_t>(ISAAC_PM_GHL_VA_RET_COMMON);
      return;
    }
  } else {
    if (isaac_pm_ghl_keeper_skips(in->keeper) != 0) {
      plan->keeper_skip = 1;
      plan->base = base;
      plan->result = base;
      plan->ret_va = static_cast<uint32_t>(ISAAC_PM_GHL_VA_RET_COMMON);
      return;
    }
    plan->gullet_issued = 1;
    /* 0x007caf4a mov ebx,0x18 — the reset DISCARDS any char==1 bonus. */
    base = isaac_pm_ghl_keeper_base(in->char_3, in->gullet_7ce390);
    /* 0x007caf64 — char READ 4, a fresh memory load after the call. */
    if (in->char_4 == ISAAC_PM_GHL_KEEPER_CHAR_E) {
      plan->has26b_charE_issued = 1;
      if ((in->has26b_charE & 0xffu) != 0u) {
        base = static_cast<int32_t>(
            static_cast<uint32_t>(base) +
            static_cast<uint32_t>(ISAAC_PM_GHL_KEEPER_26B_BONUS));
      }
    }
    plan->has1f5_issued = 1;
    if ((in->has1f5 & 0xffu) != 0u) {
      const int32_t q = isaac_pm_ghl_coin_bonus_q(in->coins_1368);
      plan->coin_bonus = static_cast<int32_t>(2u * static_cast<uint32_t>(q));
      base = static_cast<int32_t>(
          static_cast<uint32_t>(base) + 2u * static_cast<uint32_t>(q));
    }
  }
  plan->clamp_applied = 1;
  plan->base = base;
  plan->result = isaac_pm_ghl_clamp(base, in->v1da0);
  plan->ret_va = static_cast<uint32_t>(ISAAC_PM_GHL_VA_RET_COMMON);
}

extern "C" void isaac_pm_ubh_full_apply(uint32_t player_addr,
                                        uint32_t game_addr, uint32_t null78,
                                        uint32_t null79,
                                        uint32_t has26b_char1,
                                        int32_t gullet,
                                        uint32_t has26b_charE,
                                        uint32_t has1f5,
                                        IsaacPmGhlPlan* ghl_plan,
                                        IsaacPmUbhPlan* ubh_plan) {
  if (ghl_plan == nullptr || ubh_plan == nullptr) {
    return;
  }
  const int32_t game_26614 = static_cast<int32_t>(c0t_load_u32(
      static_cast<uint32_t>(game_addr +
                            static_cast<uint32_t>(
                                ISAAC_PM_TD_RVB_HEAL_OFF_26614))));
  if (isaac_pm_ubh_gate(game_26614) == 0) {
    /* GetHealthLimit is inside the gate: never called. */
    isaac_pm_ghl_plan(nullptr, ghl_plan);
    isaac_pm_ubh_apply(player_addr, game_addr, 0, ubh_plan);
    return;
  }
  const int32_t char_uniform = static_cast<int32_t>(c0t_load_u32(
      player_addr + static_cast<uint32_t>(ISAAC_PM_C0T_OFF_CHAR_13C0)));
  IsaacPmGhlInputs in;
  in.game_26614 = game_26614; /* straight-line between the two loads */
  in.v2c = static_cast<int32_t>(c0t_load_u32(
      player_addr + static_cast<uint32_t>(ISAAC_PM_GHL_OFF_STATE_2C)));
  in.char_1 = char_uniform;
  in.char_2 = char_uniform;
  in.char_3 = char_uniform;
  in.char_4 = char_uniform;
  in.keeper = 0u; /* 0x007cabd7 push 0 */
  in.null78 = null78;
  in.null79 = null79;
  in.has26b_char1 = has26b_char1;
  in.gullet_7ce390 = gullet;
  in.has26b_charE = has26b_charE;
  in.has1f5 = has1f5;
  in.coins_1368 = static_cast<int32_t>(c0t_load_u32(
      player_addr + static_cast<uint32_t>(ISAAC_PM_GHL_OFF_COINS_1368)));
  in.v1da0 = static_cast<int32_t>(c0t_load_u32(
      player_addr + static_cast<uint32_t>(ISAAC_PM_GHL_OFF_CLAMP_1DA0)));
  isaac_pm_ghl_plan(&in, ghl_plan);
  isaac_pm_ubh_apply(player_addr, game_addr, ghl_plan->result, ubh_plan);
}

/* ====================================================================== */
/* v15 — URH exact Entity_Player::update_red_hearts() @ 0x007c9ea0,      */
/* translated whole as a decision layer, plus the 0x006dacd0 pure leaf.  */
/* ====================================================================== */

namespace {

inline uint32_t urh_load_u8(uint32_t addr) {
  return static_cast<uint32_t>(
      *reinterpret_cast<const uint8_t*>(static_cast<uintptr_t>(addr)));
}

/* cvtdq2ps + divss: int32 -> f32 (round-to-nearest) on BOTH operands,
   then a single correctly-rounded f32 division. Ordered results are
   bit-exact; a 0/0 NaN is canonicalized by Wasm (payload differs from
   the x86 0xffc00000), and only the UNORDERED fact is observable in
   the PE (no ratio store exists in the body). */
inline float urh_ratio(int32_t red, int32_t max) {
  return static_cast<float>(red) / static_cast<float>(max);
}

}  // namespace

extern "C" int32_t isaac_pm_urh_fold_gate(int32_t game_26614) {
  /* 0x007c9eae cmp dword [eax+0x26614],2 ; 0x007c9eba jge — SIGNED;
     the fold runs on < 2 (INT_MIN folds, 2 skips). */
  return game_26614 < ISAAC_PM_UBH_GATE_LIMIT ? 1 : 0;
}

extern "C" int32_t isaac_pm_urh_fold_half(int32_t red) {
  /* 0x007c9ec8 lea eax,[esi+1] wraps FIRST; then 0x007c9ecb cdq /
     sub / sar — the trunc runs on the WRAPPED value (red 0x7fffffff
     halves as INT_MIN/2 = -0x40000000). */
  const int32_t inc = static_cast<int32_t>(
      static_cast<uint32_t>(red) + 1u);
  const int32_t adj = static_cast<int32_t>(
      static_cast<uint32_t>(inc) + (inc < 0 ? 1u : 0u));
  return adj >> 1;
}

extern "C" int32_t isaac_pm_urh_fold_1da4(int32_t red, int32_t v1da4) {
  /* 0x007c9ed0 cmp eax,ecx ; 0x007c9ed2 cmovl ecx,eax — min_signed. */
  const int32_t half = isaac_pm_urh_fold_half(red);
  return half < v1da4 ? half : v1da4;
}

extern "C" int32_t isaac_pm_urh_fold_red(int32_t red, int32_t v1da4) {
  /* 0x007c9edb lea eax,[ecx+ecx] (wrap) ; 0x007c9ede cmp esi,eax ;
     0x007c9ee0 cmovl esi,eax — max_signed(red, doubled). */
  const int32_t doubled = static_cast<int32_t>(
      2u * static_cast<uint32_t>(isaac_pm_urh_fold_1da4(red, v1da4)));
  return red < doubled ? doubled : red;
}

extern "C" int32_t isaac_pm_urh_fg_gate(uint32_t dead_1, int32_t char_1) {
  /* 0x007c9ef0 cmp byte [edi+0x173],0 — LOW BYTE (widened input,
     masked here); 0x007c9efd cmp dword [edi+0x13c0],0x1a — FULL
     DWORD. */
  if ((dead_1 & 0xffu) != 0u) {
    return 0;
  }
  return char_1 == ISAAC_PM_URH_CHAR_1A ? 1 : 0;
}

extern "C" int32_t isaac_pm_urh_fg_sum(int32_t bone_1d88, int32_t red_194c,
                                       int32_t soul_134c,
                                       int32_t eternal_1348,
                                       int32_t red_b) {
  /* 0x007c9f0a..0x007c9f22 — four adds, every one wrapping. */
  return static_cast<int32_t>(
      static_cast<uint32_t>(bone_1d88) + static_cast<uint32_t>(red_194c) +
      static_cast<uint32_t>(soul_134c) + static_cast<uint32_t>(eternal_1348) +
      static_cast<uint32_t>(red_b));
}

extern "C" int32_t isaac_pm_urh_fg_sum_is_one(int32_t sum) {
  /* 0x007c9f28 cmp eax,1 ; 0x007c9f2b jne — EXACT equality. */
  return sum == 1 ? 1 : 0;
}

extern "C" int32_t isaac_pm_urh_room_gate_fg(uint32_t room_byte,
                                             int32_t frame,
                                             int32_t room_11f0) {
  /* 0x007c9f3d cmp byte [ebx],0 / je ; 0x007c9f4c sub (wrap) ;
     0x007c9f52 cmp eax,1 / jle — SIGNED > 1 passes. */
  if ((room_byte & 0xffu) == 0u) {
    return 0;
  }
  const int32_t diff = static_cast<int32_t>(
      static_cast<uint32_t>(frame) - static_cast<uint32_t>(room_11f0));
  return diff > ISAAC_PM_URH_ROOM_RECENT_MIN ? 1 : 0;
}

extern "C" int32_t isaac_pm_urh_room_gate_c5(uint32_t room_byte,
                                             int32_t frame,
                                             int32_t room_11f0) {
  /* 0x007ca09a cmp byte [ecx],0 / je ; 0x007ca0a5 sub (wrap) ;
     0x007ca0ab cmp eax,1 / jle — transcribed from ITS range; tests
     pin agreement with the FG instance. */
  if ((room_byte & 0xffu) == 0u) {
    return 0;
  }
  const int32_t diff = static_cast<int32_t>(
      static_cast<uint32_t>(frame) - static_cast<uint32_t>(room_11f0));
  return diff > ISAAC_PM_URH_ROOM_RECENT_MIN ? 1 : 0;
}

extern "C" int32_t isaac_pm_urh_scan_entity_match(uint32_t ent_addr,
                                                  int32_t type_28,
                                                  uint32_t parent_410,
                                                  uint32_t player_addr,
                                                  int32_t variant_2c,
                                                  int32_t subtype_30,
                                                  uint32_t dead_173) {
  /* PE compare order (0x007c9f8a..0x007c9fb2): null skips first and
     the fields are never read for a null slot. */
  if (ent_addr == 0u) {
    return 0;
  }
  if (type_28 != ISAAC_PM_URH_ENT_TYPE_3) {
    return 0;
  }
  if (parent_410 != player_addr) {
    return 0;
  }
  if (variant_2c != ISAAC_PM_URH_ENT_VARIANT_EE) {
    return 0;
  }
  if (subtype_30 == ISAAC_PM_URH_ENT_SUBTYPE_SKIP_7) {
    return 0; /* je — subtype 7 SKIPS counting */
  }
  if ((dead_173 & 0xffu) != 0u) {
    return 0; /* LOW BYTE dead skips */
  }
  return 1;
}

extern "C" int32_t isaac_pm_urh_scan_count(uint32_t list_base,
                                           uint32_t ent_count,
                                           uint32_t player_addr) {
  /* 0x007c9f88..0x007c9fbb verbatim: exactly ent_count iterations
     (`sub ebx,1 / jne` — the FULL 32-bit count; no early exit, no
     cap), slot advances 4 bytes EVERY iteration, edx counts ALL
     matches. */
  int32_t matches = 0;
  uint32_t slot = list_base;
  for (uint32_t left = ent_count; left != 0u; left -= 1u) {
    const uint32_t ent = c0t_load_u32(slot);
    if (ent != 0u) {
      const int32_t type = static_cast<int32_t>(c0t_load_u32(
          ent + static_cast<uint32_t>(ISAAC_PM_URH_ENT_OFF_TYPE_28)));
      if (type == ISAAC_PM_URH_ENT_TYPE_3) {
        const uint32_t parent = c0t_load_u32(
            ent + static_cast<uint32_t>(ISAAC_PM_URH_ENT_OFF_PARENT_410));
        if (parent == player_addr) {
          const int32_t variant = static_cast<int32_t>(c0t_load_u32(
              ent + static_cast<uint32_t>(ISAAC_PM_URH_ENT_OFF_VARIANT_2C)));
          if (variant == ISAAC_PM_URH_ENT_VARIANT_EE) {
            const int32_t subtype = static_cast<int32_t>(c0t_load_u32(
                ent +
                static_cast<uint32_t>(ISAAC_PM_URH_ENT_OFF_SUBTYPE_30)));
            if (subtype != ISAAC_PM_URH_ENT_SUBTYPE_SKIP_7 &&
                urh_load_u8(ent + static_cast<uint32_t>(
                                      ISAAC_PM_URH_ENT_OFF_DEAD_173)) == 0u) {
              matches = static_cast<int32_t>(
                  static_cast<uint32_t>(matches) + 1u);
            }
          }
        }
      }
    }
    slot += 4u;
  }
  return matches;
}

extern "C" int32_t isaac_pm_urh_itemvec_span(uint32_t begin, uint32_t end) {
  /* 0x007c9fe3 sub (wrap) ; 0x007c9fe5 and eax,0xfffffffc. */
  return static_cast<int32_t>((end - begin) & 0xfffffffcu);
}

extern "C" int32_t isaac_pm_urh_itemvec_gate(uint32_t begin, uint32_t end,
                                             uint32_t elem_1b8) {
  /* 0x007c9fe8 cmp eax,0x1b8 ; 0x007c9fed jle — SIGNED (a negative
     masked span never passes); then 0x007c9ff5 test/je on the elem.
     Same masked-span idiom as the v11 HIGH0 item gate. */
  if (isaac_pm_urh_itemvec_span(begin, end) <= ISAAC_PM_URH_ITEMVEC_SPAN_MIN) {
    return 0;
  }
  return elem_1b8 != 0u ? 1 : 0;
}

extern "C" int32_t isaac_pm_urh_w_thr0(int32_t game_26614_2) {
  /* 0x007ca034 xor / cmp / setge / inc, then 0x007ca04f shl eax,3 on
     the g >= 2 arm only — kept as the faithful sequence. */
  int32_t t = 1 + (game_26614_2 >= ISAAC_PM_UBH_GATE_LIMIT ? 1 : 0);
  if (game_26614_2 >= ISAAC_PM_UBH_GATE_LIMIT) {
    t <<= 3;
  }
  return t;
}

extern "C" int32_t isaac_pm_urh_w_thr2(int32_t game_26614_2) {
  /* 0x007ca069 mov ebx,2 / mov eax,0x10 / cmp ecx,ebx / cmovl. */
  return game_26614_2 < ISAAC_PM_UBH_GATE_LIMIT ? ISAAC_PM_URH_THR2_LOW
                                                : ISAAC_PM_URH_THR_HIGH;
}

extern "C" uint32_t isaac_pm_urh_ratio_bits(int32_t red, int32_t max) {
  return __builtin_bit_cast(uint32_t, urh_ratio(red, max));
}

extern "C" int32_t isaac_pm_urh_c_high(int32_t red, int32_t max) {
  /* 0x007ca144 comiss xmm1,[0.8f] ; 0x007ca14b jb — CF is set on
     LESS or UNORDERED, so HIGH is the ordered ratio >= 0.8 (a 0/0
     NaN takes LOW; +inf takes HIGH). */
  const float r = urh_ratio(red, max);
  return r >= f32_bits(ISAAC_PM_URH_F32_08_BITS) ? 1 : 0;
}

extern "C" int32_t isaac_pm_urh_d_add_band(int32_t red, int32_t max) {
  /* 0x007ca20c comiss ratio,[0.1f] / jb -> REMOVE (less OR
     UNORDERED); 0x007ca21d comiss [0.3f],ratio / jb -> REMOVE
     (0.3 < ratio); ADD only on ordered 0.1 <= ratio <= 0.3. */
  const float r = urh_ratio(red, max);
  if (!(r >= f32_bits(ISAAC_PM_URH_F32_01_BITS))) {
    return 0; /* jb 1: NaN lands here, exactly like the PE */
  }
  if (f32_bits(ISAAC_PM_URH_F32_03_BITS) < r) {
    return 0; /* jb 2 */
  }
  return 1;
}

extern "C" int32_t isaac_pm_urh_probe_6dacd0(int32_t char_13c0,
                                             int32_t v1340, int32_t v1d88,
                                             int32_t v1344) {
  /* 0x006dacd0 whole body: mov edx,ecx / call 0x007cafe0 (the v13
     GetHealthType leaf) / cmp eax,1 / je ; cmp eax,2 / je ; the
     NOT-{1,2} arm threshold is [0x1340] + 2*[0x1d88] (lea, wrap),
     the {1,2} arm is [0x1340] alone; setge — SIGNED [0x1344] >=
     threshold. Only AL is consumed at the 0x007ca15a callsite. */
  const int32_t ht = isaac_pm_ep_get_health_type(char_13c0);
  int32_t threshold;
  if (ht == 1 || ht == 2) {
    threshold = v1340;
  } else {
    threshold = static_cast<int32_t>(
        static_cast<uint32_t>(v1340) + 2u * static_cast<uint32_t>(v1d88));
  }
  return v1344 >= threshold ? 1 : 0;
}

extern "C" void isaac_pm_urh_plan(const IsaacPmUrhInputs* in,
                                  IsaacPmUrhPlan* plan) {
  if (plan == nullptr) {
    return;
  }
  plan->fold_ran = 0;
  plan->store_1da4 = 0;
  plan->store_1344 = 0;
  plan->host_gullet = 0;
  plan->fg_gate = 0;
  plan->fg_sum = 0;
  plan->fg_sum_is_one = 0;
  plan->fg_room_gate = 0;
  plan->probe_null6e_issued = 0;
  plan->scan_ran = 0;
  plan->scan_matches = 0;
  plan->spawn_reached = 0;
  plan->host_show1 = 0;
  plan->itemvec_gate = 0;
  plan->host_effect_930220 = 0;
  plan->pair_elem = 0u;
  plan->pair_elem78 = 0u;
  plan->g_reread_j1 = 0;
  plan->w_thr0 = 0;
  plan->w_low = 0;
  plan->w_char5 = 0;
  plan->w_thr2 = 0;
  plan->probe_has26b_issued = 0;
  plan->w_g_reload = 0;
  plan->w_room_gate = 0;
  plan->probe_has7a_issued = 0;
  plan->probe_eff7a_issued = 0;
  plan->host_show2 = 0;
  plan->host_add_7a = 0;
  plan->probe_has19f_issued = 0;
  plan->c_ran = 0;
  plan->c_alt = 0;
  plan->probe_6dacd0_issued = 0;
  plan->probe_6dacd0_result = 0;
  plan->c_high = 0;
  plan->probe_eff19f_high_issued = 0;
  plan->probe_eff19f_low_issued = 0;
  plan->host_add_19f = 0;
  plan->host_remove_19f = 0;
  plan->play_530_str_va = 0u;
  plan->host_play_530 = 0;
  plan->probe_has1ba_issued = 0;
  plan->d_ran = 0;
  plan->d_alt = 0;
  plan->d_add_side = 0;
  plan->probe_eff1ba_rm_issued = 0;
  plan->probe_eff1ba_add_issued = 0;
  plan->host_add_1ba = 0;
  plan->host_remove_1ba = 0;
  plan->play_644_str_va = 0u;
  plan->host_play_644 = 0;
  plan->probe_has1ed_issued = 0;
  plan->probe_eff1ed_issued = 0;
  plan->store_1574_or1 = 0;
  plan->host_763570 = 0;
  plan->ret_va = 0u;
  if (in == nullptr) {
    return;
  }
  plan->ret_va = static_cast<uint32_t>(ISAAC_PM_URH_VA_RET);
  /* FOLD — the only pre-host stores. */
  plan->fold_ran = isaac_pm_urh_fold_gate(in->game_26614_1);
  if (plan->fold_ran != 0) {
    plan->store_1da4 = isaac_pm_urh_fold_1da4(in->red_a, in->v1da4);
    plan->store_1344 = isaac_pm_urh_fold_red(in->red_a, in->v1da4);
  }
  plan->host_gullet = 1; /* 0x007c9eeb — unconditional host boundary */
  /* FG — decides which g_Game pointer feeds the 0x007ca02e read. */
  int32_t j1 = 0;
  plan->fg_gate = isaac_pm_urh_fg_gate(in->dead_1, in->char_1);
  if (plan->fg_gate == 0) {
    j1 = 1;
  } else {
    plan->fg_sum = isaac_pm_urh_fg_sum(in->bone_1d88, in->red_194c,
                                       in->soul_134c, in->eternal_1348,
                                       in->red_b);
    plan->fg_sum_is_one = isaac_pm_urh_fg_sum_is_one(plan->fg_sum);
    if (plan->fg_sum_is_one == 0) {
      j1 = 1;
    } else {
      plan->fg_room_gate = isaac_pm_urh_room_gate_fg(
          in->room_byte_1, in->frame_1, in->room_11f0_1);
      if (plan->fg_room_gate != 0) {
        plan->probe_null6e_issued = 1;
        if ((in->null6e & 0xffu) == 0u) {
          plan->scan_ran = in->ent_count != 0u ? 1 : 0;
          plan->scan_matches = plan->scan_ran != 0 ? in->scan_matches : 0;
          if (plan->scan_ran == 0 || plan->scan_matches == 0) {
            /* SPAWN block: Show #1 then the record add behind the
               item-vector gate; both routes rejoin at J1. */
            plan->spawn_reached = 1;
            plan->host_show1 = 1;
            plan->itemvec_gate = isaac_pm_urh_itemvec_gate(
                in->ivec_begin, in->ivec_end, in->elem_1b8);
            if (plan->itemvec_gate != 0) {
              plan->host_effect_930220 = 1;
              plan->pair_elem = in->elem_1b8;
              plan->pair_elem78 = in->elem_78;
            }
            j1 = 1;
          }
          /* matches != 0 -> J2 with the LOAD-2 snapshot. */
        }
        /* null6e truthy -> J2 holding esi ACROSS the host call. */
      }
      /* room gate closed -> J2 (snapshot, no host call crossed). */
    }
  }
  plan->g_reread_j1 = j1;
  /* W — the soul-heart / char-5 section. */
  int32_t to_bprime = 0;
  if ((in->dead_2 & 0xffu) == 0u) {
    plan->w_thr0 = isaac_pm_urh_w_thr0(in->game_26614_2);
    if (in->red_c <= plan->w_thr0) {
      plan->w_low = 1; /* jle 0x007ca0b0 — straight to B' */
      to_bprime = 1;
    } else if (in->char_2 == ISAAC_PM_URH_CHAR_5) {
      plan->w_char5 = 1;
      plan->w_thr2 = isaac_pm_urh_w_thr2(in->game_26614_2);
      int32_t reach_room = 0;
      if (in->red_c <= plan->w_thr2) {
        reach_room = 1; /* jle 0x007ca094 — STALE esi, no reload */
      } else {
        plan->probe_has26b_issued = 1;
        if ((in->has26b & 0xffu) != 0u) {
          plan->w_g_reload = 1; /* 0x007ca08e — this path ONLY */
          reach_room = 1;
        }
      }
      if (reach_room != 0) {
        plan->w_room_gate = isaac_pm_urh_room_gate_c5(
            in->room_byte_2, in->frame_2, in->room_11f0_2);
        if (plan->w_room_gate != 0) {
          to_bprime = 1;
        }
      }
    }
  }
  if (to_bprime != 0) {
    plan->probe_has7a_issued = 1;
    if ((in->has7a & 0xffu) != 0u) {
      plan->probe_eff7a_issued = 1;
      if ((in->eff7a & 0xffu) == 0u) {
        /* cmp byte [edi+0x1824],al with AL == 0 — LOW BYTE gate on
           the Show; the effect add runs regardless. */
        if ((in->byte_1824 & 0xffu) != 0u) {
          plan->host_show2 = 1;
        }
        plan->host_add_7a = 1;
      }
    }
  }
  /* C — the 0x19f block. */
  plan->probe_has19f_issued = 1;
  if ((in->has19f & 0xffu) != 0u) {
    plan->c_ran = 1;
    int32_t high = 0;
    if (in->game_26614_3 < ISAAC_PM_UBH_GATE_LIMIT) {
      plan->c_alt = 1;
      if ((in->byte_13b5 & 0xffu) == 0u) {
        plan->probe_6dacd0_issued = 1;
        plan->probe_6dacd0_result = isaac_pm_urh_probe_6dacd0(
            in->char_3, in->p1340, in->p1d88, in->p1344);
        high = plan->probe_6dacd0_result;
      }
      /* byte_13b5 set -> LOW join directly, probe never issued. */
    } else {
      high = isaac_pm_urh_c_high(in->red_d, in->max_d);
    }
    plan->c_high = high;
    if (high != 0) {
      plan->probe_eff19f_high_issued = 1;
      if ((in->eff19f_high & 0xffu) == 0u) {
        plan->host_add_19f = 1;
        plan->play_530_str_va =
            static_cast<uint32_t>(ISAAC_PM_URH_STR_FLOATGLOW_VA);
        plan->host_play_530 = 1;
      }
    } else {
      plan->probe_eff19f_low_issued = 1;
      if ((in->eff19f_low & 0xffu) != 0u) {
        plan->host_remove_19f = 1;
        plan->play_530_str_va =
            static_cast<uint32_t>(ISAAC_PM_URH_STR_FLOATNOGLOW_VA);
        plan->host_play_530 = 1;
      }
    }
  }
  /* D — the 0x1ba block. */
  plan->probe_has1ba_issued = 1;
  if ((in->has1ba & 0xffu) != 0u) {
    plan->d_ran = 1;
    int32_t add = 0;
    if (in->game_26614_4 < ISAAC_PM_UBH_GATE_LIMIT) {
      plan->d_alt = 1;
      add = in->red_e == 2 ? 1 : 0; /* cmp ecx,2 / jne — the register
                                       copy of READ 5 */
    } else {
      add = isaac_pm_urh_d_add_band(in->red_e, in->max_e);
    }
    plan->d_add_side = add;
    if (add != 0) {
      plan->probe_eff1ba_add_issued = 1;
      if ((in->eff1ba_add & 0xffu) == 0u) {
        plan->host_add_1ba = 1;
        plan->play_644_str_va =
            static_cast<uint32_t>(ISAAC_PM_URH_STR_FLOATGLOW_VA);
        plan->host_play_644 = 1;
      }
    } else {
      plan->probe_eff1ba_rm_issued = 1;
      if ((in->eff1ba_rm & 0xffu) != 0u) {
        plan->host_remove_1ba = 1;
        plan->play_644_str_va =
            static_cast<uint32_t>(ISAAC_PM_URH_STR_FLOATNOGLOW_VA);
        plan->host_play_644 = 1;
      }
    }
  }
  /* E — the 0x1ed block: FLAG on owned OR (not-owned AND effect ON);
     eff1ed is probed only when NOT owned. */
  plan->probe_has1ed_issued = 1;
  int32_t flag = 0;
  if ((in->has1ed & 0xffu) != 0u) {
    flag = 1;
  } else {
    plan->probe_eff1ed_issued = 1;
    if ((in->eff1ed & 0xffu) != 0u) {
      flag = 1;
    }
  }
  if (flag != 0) {
    plan->store_1574_or1 = 1;
    plan->host_763570 = 1;
  }
}

extern "C" void isaac_pm_urh_apply(uint32_t player_addr, uint32_t game_addr,
                                   uint32_t mgr_addr,
                                   const IsaacPmUrhProbes* probes,
                                   IsaacPmUrhPlan* plan) {
  if (plan == nullptr) {
    return;
  }
  const IsaacPmUrhProbes zero_probes = {0u, 0u, 0u, 0u, 0u, 0u,
                                        0u, 0u, 0u, 0u, 0u, 0u};
  if (probes == nullptr) {
    probes = &zero_probes;
  }
  IsaacPmUrhInputs in = {};
  in.null6e = probes->null6e;
  in.has26b = probes->has26b;
  in.has7a = probes->has7a;
  in.eff7a = probes->eff7a;
  in.has19f = probes->has19f;
  in.eff19f_high = probes->eff19f_high;
  in.eff19f_low = probes->eff19f_low;
  in.has1ba = probes->has1ba;
  in.eff1ba_rm = probes->eff1ba_rm;
  in.eff1ba_add = probes->eff1ba_add;
  in.has1ed = probes->has1ed;
  in.eff1ed = probes->eff1ed;
  /* Sequential walk in PE read order; loads stay as lazy as the PE so
     scratch the PE would not touch is not touched here either. */
  const uint32_t off_26614 =
      static_cast<uint32_t>(ISAAC_PM_TD_RVB_HEAL_OFF_26614);
  const uint32_t off_1344 =
      static_cast<uint32_t>(ISAAC_PM_C0T_OFF_SOUL_1344);
  in.game_26614_1 =
      static_cast<int32_t>(c0t_load_u32(game_addr + off_26614));
  if (isaac_pm_urh_fold_gate(in.game_26614_1) != 0) {
    in.red_a = static_cast<int32_t>(c0t_load_u32(player_addr + off_1344));
    in.v1da4 = static_cast<int32_t>(c0t_load_u32(
        player_addr + static_cast<uint32_t>(ISAAC_PM_URH_OFF_1DA4)));
    /* Both stores retire BEFORE the gullet boundary, so every later
       [0x1344] re-read below sees the folded value. */
    c0t_store_u32(player_addr + static_cast<uint32_t>(ISAAC_PM_URH_OFF_1DA4),
                  static_cast<uint32_t>(
                      isaac_pm_urh_fold_1da4(in.red_a, in.v1da4)));
    c0t_store_u32(player_addr + off_1344,
                  static_cast<uint32_t>(
                      isaac_pm_urh_fold_red(in.red_a, in.v1da4)));
  }
  /* (gullet host boundary — the caller's residual action) */
  in.dead_1 = urh_load_u8(
      player_addr + static_cast<uint32_t>(ISAAC_PM_DEATH_OFF_DEAD_173));
  in.char_1 = static_cast<int32_t>(c0t_load_u32(
      player_addr + static_cast<uint32_t>(ISAAC_PM_C0T_OFF_CHAR_13C0)));
  if (isaac_pm_urh_fg_gate(in.dead_1, in.char_1) != 0) {
    in.bone_1d88 = static_cast<int32_t>(c0t_load_u32(
        player_addr + static_cast<uint32_t>(ISAAC_PM_TD_RVB_OFF_BONE_1D88)));
    in.red_194c = static_cast<int32_t>(c0t_load_u32(
        player_addr + static_cast<uint32_t>(ISAAC_PM_TD_RVB_OFF_RED_194C)));
    in.soul_134c = static_cast<int32_t>(c0t_load_u32(
        player_addr + static_cast<uint32_t>(ISAAC_PM_C0T_OFF_134C)));
    in.eternal_1348 = static_cast<int32_t>(c0t_load_u32(
        player_addr + static_cast<uint32_t>(ISAAC_PM_URH_OFF_ETERNAL_1348)));
    in.red_b = static_cast<int32_t>(c0t_load_u32(player_addr + off_1344));
    if (isaac_pm_urh_fg_sum_is_one(
            isaac_pm_urh_fg_sum(in.bone_1d88, in.red_194c, in.soul_134c,
                                in.eternal_1348, in.red_b)) != 0) {
      const uint32_t room = c0t_load_u32(
          game_addr + static_cast<uint32_t>(ISAAC_PM_URH_OFF_ROOM_18300));
      in.room_byte_1 = urh_load_u8(room);
      if ((in.room_byte_1 & 0xffu) != 0u) {
        in.frame_1 = static_cast<int32_t>(c0t_load_u32(
            game_addr + static_cast<uint32_t>(ISAAC_PM_URH_OFF_FRAME_264F8)));
        in.room_11f0_1 = static_cast<int32_t>(c0t_load_u32(
            room + static_cast<uint32_t>(ISAAC_PM_URH_OFF_ROOM_11F0)));
        if (isaac_pm_urh_room_gate_fg(in.room_byte_1, in.frame_1,
                                      in.room_11f0_1) != 0 &&
            (in.null6e & 0xffu) == 0u) {
          in.ent_count = c0t_load_u32(
              room + static_cast<uint32_t>(ISAAC_PM_URH_OFF_ROOM_COUNT_1254));
          if (in.ent_count != 0u) {
            /* 0x007c9f7c — the PE reloads the room pointer for the
               list walk. */
            const uint32_t room2 = c0t_load_u32(
                game_addr +
                static_cast<uint32_t>(ISAAC_PM_URH_OFF_ROOM_18300));
            const uint32_t list = c0t_load_u32(
                room2 + static_cast<uint32_t>(ISAAC_PM_URH_OFF_ROOM_LIST_124C));
            in.scan_matches =
                isaac_pm_urh_scan_count(list, in.ent_count, player_addr);
          }
          if (in.ent_count == 0u || in.scan_matches == 0) {
            in.ivec_begin = c0t_load_u32(
                mgr_addr +
                static_cast<uint32_t>(ISAAC_PM_URH_ITEMVEC_BEGIN_OFF));
            in.ivec_end = c0t_load_u32(
                mgr_addr + static_cast<uint32_t>(ISAAC_PM_URH_ITEMVEC_END_OFF));
            if (isaac_pm_urh_itemvec_span(in.ivec_begin, in.ivec_end) >
                ISAAC_PM_URH_ITEMVEC_SPAN_MIN) {
              in.elem_1b8 = c0t_load_u32(
                  in.ivec_begin +
                  static_cast<uint32_t>(ISAAC_PM_URH_ITEMVEC_ELEM_OFF));
              if (in.elem_1b8 != 0u) {
                in.elem_78 = c0t_load_u32(
                    in.elem_1b8 +
                    static_cast<uint32_t>(ISAAC_PM_URH_ELEM_FIELD_78));
              }
            }
          }
        }
      }
    }
  }
  /* J1/J2 — one scratch slot; divergence is scalar-plan territory. */
  in.game_26614_2 =
      static_cast<int32_t>(c0t_load_u32(game_addr + off_26614));
  in.dead_2 = urh_load_u8(
      player_addr + static_cast<uint32_t>(ISAAC_PM_DEATH_OFF_DEAD_173));
  if ((in.dead_2 & 0xffu) == 0u) {
    in.red_c = static_cast<int32_t>(c0t_load_u32(player_addr + off_1344));
    if (in.red_c > isaac_pm_urh_w_thr0(in.game_26614_2)) {
      in.char_2 = static_cast<int32_t>(c0t_load_u32(
          player_addr + static_cast<uint32_t>(ISAAC_PM_C0T_OFF_CHAR_13C0)));
      if (in.char_2 == ISAAC_PM_URH_CHAR_5) {
        const int32_t thr2 = isaac_pm_urh_w_thr2(in.game_26614_2);
        const int32_t probe_path = in.red_c > thr2 ? 1 : 0;
        if (probe_path == 0 || (in.has26b & 0xffu) != 0u) {
          const uint32_t room3 = c0t_load_u32(
              game_addr + static_cast<uint32_t>(ISAAC_PM_URH_OFF_ROOM_18300));
          in.room_byte_2 = urh_load_u8(room3);
          if ((in.room_byte_2 & 0xffu) != 0u) {
            in.frame_2 = static_cast<int32_t>(c0t_load_u32(
                game_addr +
                static_cast<uint32_t>(ISAAC_PM_URH_OFF_FRAME_264F8)));
            in.room_11f0_2 = static_cast<int32_t>(c0t_load_u32(
                room3 + static_cast<uint32_t>(ISAAC_PM_URH_OFF_ROOM_11F0)));
          }
        }
      }
    }
    /* B' byte read happens only past the two probes. */
    const int32_t bprime =
        in.red_c <= isaac_pm_urh_w_thr0(in.game_26614_2) ||
                (in.char_2 == ISAAC_PM_URH_CHAR_5 &&
                 (in.red_c <= isaac_pm_urh_w_thr2(in.game_26614_2) ||
                  (in.has26b & 0xffu) != 0u) &&
                 isaac_pm_urh_room_gate_c5(in.room_byte_2, in.frame_2,
                                           in.room_11f0_2) != 0)
            ? 1
            : 0;
    if (bprime != 0 && (in.has7a & 0xffu) != 0u &&
        (in.eff7a & 0xffu) == 0u) {
      in.byte_1824 = urh_load_u8(
          player_addr + static_cast<uint32_t>(ISAAC_PM_URH_OFF_BYTE_1824));
    }
  }
  /* C reads. */
  if ((in.has19f & 0xffu) != 0u) {
    in.game_26614_3 =
        static_cast<int32_t>(c0t_load_u32(game_addr + off_26614));
    if (in.game_26614_3 < ISAAC_PM_UBH_GATE_LIMIT) {
      in.byte_13b5 = urh_load_u8(
          player_addr + static_cast<uint32_t>(ISAAC_PM_URH_OFF_BYTE_13B5));
      if ((in.byte_13b5 & 0xffu) == 0u) {
        /* The translated probe's own reads, per-arm like the PE. */
        in.char_3 = static_cast<int32_t>(c0t_load_u32(
            player_addr + static_cast<uint32_t>(ISAAC_PM_C0T_OFF_CHAR_13C0)));
        const int32_t ht = isaac_pm_ep_get_health_type(in.char_3);
        in.p1340 = static_cast<int32_t>(c0t_load_u32(
            player_addr + static_cast<uint32_t>(ISAAC_PM_C0T_OFF_FATAL_1340)));
        if (ht != 1 && ht != 2) {
          in.p1d88 = static_cast<int32_t>(c0t_load_u32(
              player_addr +
              static_cast<uint32_t>(ISAAC_PM_TD_RVB_OFF_BONE_1D88)));
        }
        in.p1344 =
            static_cast<int32_t>(c0t_load_u32(player_addr + off_1344));
      }
    } else {
      in.red_d = static_cast<int32_t>(c0t_load_u32(player_addr + off_1344));
      in.max_d = static_cast<int32_t>(c0t_load_u32(
          player_addr + static_cast<uint32_t>(ISAAC_PM_C0T_OFF_FATAL_1340)));
    }
  }
  /* D reads. */
  if ((in.has1ba & 0xffu) != 0u) {
    in.red_e = static_cast<int32_t>(c0t_load_u32(player_addr + off_1344));
    in.game_26614_4 =
        static_cast<int32_t>(c0t_load_u32(game_addr + off_26614));
    if (in.game_26614_4 >= ISAAC_PM_UBH_GATE_LIMIT) {
      in.max_e = static_cast<int32_t>(c0t_load_u32(
          player_addr + static_cast<uint32_t>(ISAAC_PM_C0T_OFF_FATAL_1340)));
    }
  }
  isaac_pm_urh_plan(&in, plan);
  if (plan->store_1574_or1 != 0) {
    const uint32_t flag_va =
        player_addr + static_cast<uint32_t>(ISAAC_PM_URH_OFF_FLAG_1574);
    c0t_store_u32(flag_va,
                  c0t_load_u32(flag_va) |
                      static_cast<uint32_t>(ISAAC_PM_URH_OR_1574_BIT));
  }
}


/* ================= v16 HEAL (burst @ 0x007ca2d0) ===================== */

namespace {

/* cvtdq2pd on the SIGNED int32 + the {0.0, 2^32} sign-fix table
   (0xbacb00), then cvtpd2ps. Each step rounds like the x86. */
inline float heal_u32_to_f32(uint32_t rng) {
  double d = static_cast<double>(static_cast<int32_t>(rng));
  if ((rng & 0x80000000u) != 0u) {
    d += 4294967296.0; /* 2^32 is exact in double */
  }
  return static_cast<float>(d); /* cvtpd2ps round-to-nearest */
}

inline float heal_f2n() { return f32_bits(ISAAC_PM_HEAL_F32_2NEG32_BITS); }
inline float heal_f12() { return f32_bits(ISAAC_PM_HEAL_F32_12_BITS); }
inline float heal_f8() { return f32_bits(ISAAC_PM_HEAL_F32_8_BITS); }
inline float heal_f066() { return f32_bits(ISAAC_PM_HEAL_F32_066_BITS); }
inline float heal_f033() { return f32_bits(ISAAC_PM_HEAL_F32_033_BITS); }

/* mulss/addss chains — each statement is one f32-rounded step. */
inline float heal_f0_from(uint32_t rng) {
  float t = heal_u32_to_f32(rng);
  t = t * heal_f2n();   /* 0x7ca569 */
  t = t * heal_f12();   /* 0x7ca571 */
  t = t + heal_f8();    /* 0x7ca579 */
  return t;
}

inline float heal_v2_from(uint32_t rng) {
  float t = heal_u32_to_f32(rng);
  t = t * heal_f2n();   /* 0x7ca5e8 */
  t = t * heal_f066();  /* 0x7ca5f0 */
  t = t + heal_f033();  /* 0x7ca5f8 */
  return t;
}

/* addss 0.0f + v — the PE scales tmp by v2, the tmp is (0,0) (the
   null-RNG GetRandomPickupVelocity out), so the vec2 component is
   the f32 add of +0.0 to the recaptured base (-0.0 -> +0.0). */

inline float heal_f32_add(float a, float b) { return a + b; }

inline uint32_t heal_f0_bits_impl(uint32_t rng) {
  return __builtin_bit_cast(uint32_t, heal_f0_from(rng));
}
inline uint32_t heal_v2_bits_impl(uint32_t rng) {
  return __builtin_bit_cast(uint32_t, heal_v2_from(rng));
}

/* Suite 0x7ca313: cmp [ebx+8],0 ; jle exit — SIGNED amount > 0. */
inline int32_t heal_applies_impl(int32_t amount) {
  return amount > 0 ? 1 : 0;
}

/* The 0x00956780 slot leave-behind for THIS caller: the slot the
   caller seeded (0x1ab here) is returned on every side-effect-free
   branch; the found/rare ids are the shared laws. */
inline int32_t heal_pre_id_impl(int32_t initial_id, int32_t game_null,
                                int32_t entry_found, uint32_t seed,
                                uint32_t shift1, uint32_t shift2,
                                uint32_t shift3) {
  if (game_null != 0 || entry_found == 0) {
    return initial_id;
  }
  int32_t id = ISAAC_PM_PRE_PLAY_ID_FOUND; /* mov [edi],0x25 */
  if (seed == 0u) {
    return id; /* fatal host follows; slot already 0x25 */
  }
  const uint32_t next =
      isaac_pm_pre_play_rng_next(seed, shift1, shift2, shift3);
  if (isaac_pm_pre_play_rare_hit(next) != 0) {
    id = ISAAC_PM_PRE_PLAY_ID_RARE;
  }
  return id;
}

/* 0x7ca590..0x7ca5a1: xor edx,edx; mov ecx,6; div ecx; add edx,3 —
   UNSIGNED modulo, then +3 (result 3..8). */
inline int32_t heal_inner_count_impl(uint32_t rng) {
  return 3 + static_cast<int32_t>(rng % 6u);
}

/* The four tail gates in PE order:
 *   game+0x26614 >= 2 AND [o+0x28]==1  -> skip ONLY the window check;
 *   window (when reached): (u32)(kind - 0xa) <= 0x3dd (unsigned);
 *   then the o == player check. kind is a full dword read. */
inline int32_t heal_tail_eligible_impl(int32_t game_26614, uint32_t kind,
                                       int32_t is_player) {
  if (is_player != 0) {
    return 0;
  }
  const int32_t skip_window = game_26614 >= 2 && kind == 1u;
  if (skip_window != 0) {
    return 1; /* je 0x7ca6cb bypasses the whole window */
  }
  if ((kind - static_cast<uint32_t>(ISAAC_PM_HEAL_TAIL_KIND_LO)) >
      static_cast<uint32_t>(ISAAC_PM_HEAL_TAIL_KIND_HI)) {
    return 0; /* ja 0x7ca75b */
  }
  return 1;
}

/* The 0x40a5d0 set decision: A+0x34 null OR name mismatch OR
   (match AND state34 != 0 AND [A+0x44] == 0) -> the call runs. */
inline int32_t heal_anm_set_impl(uint32_t state_null, uint32_t name_eq,
                                 uint32_t state34, uint32_t a44) {
  if ((state_null & 0xffu) != 0u) {
    return 1; /* je 0x7ca47b */
  }
  if ((name_eq & 0xffu) == 0u) {
    return 1; /* jne 0x7ca47b (mismatch reaches the set) */
  }
  if ((state34 & 0xffu) == 0u) {
    return 0; /* je 0x7ca49c skips the set */
  }
  if ((a44 & 0xffu) != 0u) {
    return 0; /* jne 0x7ca49c skips the set */
  }
  return 1;
}

}  // namespace

extern "C" int32_t isaac_pm_heal_applies(int32_t amount) {
  return heal_applies_impl(amount);
}

extern "C" int32_t isaac_pm_heal_pre_id(int32_t initial_id, int32_t game_null,
                                        int32_t entry_found, uint32_t seed,
                                        uint32_t shift1, uint32_t shift2,
                                        uint32_t shift3) {
  return heal_pre_id_impl(initial_id, game_null, entry_found, seed, shift1,
                          shift2, shift3);
}

extern "C" int32_t isaac_pm_heal_inner_count(uint32_t rng) {
  return heal_inner_count_impl(rng);
}

extern "C" uint32_t isaac_pm_heal_f0_bits(uint32_t rng) {
  return heal_f0_bits_impl(rng);
}

extern "C" uint32_t isaac_pm_heal_v2_bits(uint32_t rng) {
  return heal_v2_bits_impl(rng);
}

extern "C" int32_t isaac_pm_heal_tail_eligible(int32_t game_26614,
                                               uint32_t kind,
                                               int32_t is_player) {
  return heal_tail_eligible_impl(game_26614, kind, is_player);
}

extern "C" int32_t isaac_pm_heal_anm_set(uint32_t state_null, uint32_t name_eq,
                                         uint32_t state34, uint32_t a44) {
  return heal_anm_set_impl(state_null, name_eq, state34, a44);
}

extern "C" void isaac_pm_heal_plan(const IsaacPmHealInputs* in,
                                   IsaacPmHealPlan* plan) {
  if (in == nullptr || plan == nullptr) {
    return;
  }
  /* The host replays the plan buffer across trials: start from a fully
     deterministic blank (arrays included) so every field is defined even
     when the PE exits before it is reached. */
  __builtin_memset(plan, 0, sizeof(IsaacPmHealPlan));
  plan->applies = heal_applies_impl(in->amount);
  if (plan->applies == 0) {
    /* The PE jumps straight to the epilogue: no event at all. */
    plan->pre_id = 0;
    plan->pre_seed_out = 0u;
    plan->pre_advanced = 0;
    plan->pre_host = 0;
    plan->pre_fatal = 0;
    plan->sfx_play = 0;
    plan->spawn1 = 0;
    plan->anm_load = 0;
    plan->anm_set_ran = 0;
    plan->anm_rewind_ran = 0;
    plan->vcall_a = 0;
    plan->spawn2 = 0;
    plan->vcall_b = 0;
    plan->outer_runs = 0;
    plan->outer_overflow = 0;
    plan->inner_overflow = 0;
    plan->tail_eligible = 0;
    plan->tail_frozen_cnt = 0;
    plan->tail_total = 0;
    plan->tail_overflow = 0;
    plan->list_free_ran = 0;
    plan->host_draws = 0u;
    plan->ret_va = ISAAC_PM_HEAL_VA;
    return;
  }

  plan->pre_id = heal_pre_id_impl(in->pre_initial_id, in->pre_game_null,
                                  in->pre_entry_found, in->pre_seed,
                                  in->pre_shift1, in->pre_shift2,
                                  in->pre_shift3);
  plan->pre_seed_out = in->pre_seed; /* advanced only on the pure branch */
  plan->pre_advanced = 0;
  plan->pre_host = (in->pre_game_null == 0) ? 1 : 0; /* map lookup */
  plan->pre_fatal = 0;
  if (in->pre_game_null == 0 && in->pre_entry_found != 0) {
    if (in->pre_seed == 0u) {
      plan->pre_fatal = 1;
      plan->pre_host = 1; /* the fatal log is a host stop too */
    } else {
      plan->pre_seed_out =
          isaac_pm_pre_play_rng_next(in->pre_seed, in->pre_shift1,
                                     in->pre_shift2, in->pre_shift3);
      plan->pre_advanced = 1;
    }
  }
  plan->sfx_play = 1;
  plan->spawn1 = 1;
  plan->anm_load = 1;
  plan->anm_set_ran =
      heal_anm_set_impl(in->anm_state_null, in->anm_name_eq, in->anm_state34,
                        in->anm_a44);
  plan->anm_rewind_ran =
      plan->anm_set_ran != 0 && (in->anm_set_result & 0xffu) != 0u ? 1 : 0;
  plan->vcall_a = 1;
  plan->spawn2 = 1;
  plan->vcall_b = 1;

  const uint32_t outer_full = static_cast<uint32_t>(in->amount);
  plan->outer_runs = outer_full > ISAAC_PM_HEAL_OUTER_MAX
                         ? ISAAC_PM_HEAL_OUTER_MAX
                         : static_cast<int32_t>(outer_full);
  plan->outer_overflow =
      outer_full > static_cast<uint32_t>(ISAAC_PM_HEAL_OUTER_MAX) ? 1 : 0;
  plan->inner_overflow = 0;
  for (int32_t oi = 0; oi < plan->outer_runs; ++oi) {
    plan->f0[oi] = heal_f0_bits_impl(in->rng_f0[oi]);
    plan->inner_count[oi] = heal_inner_count_impl(in->rng_cnt[oi]);
    const int32_t ic = plan->inner_count[oi];
    if (ic > ISAAC_PM_HEAL_INNER_MAX) {
      plan->inner_overflow = 1;
    }
    const int32_t cap = ic < ISAAC_PM_HEAL_INNER_MAX ? ic : ISAAC_PM_HEAL_INNER_MAX;
    for (int32_t ii = 0; ii < cap; ++ii) {
      plan->v2[oi][ii] = heal_v2_bits_impl(in->rng_v2[oi][ii]);
      plan->spawn_pos_x[oi][ii] = __builtin_bit_cast(
          uint32_t, heal_f32_add(0.0f,
                                 f32_bits(in->anm_pos_x[oi][ii])));
      plan->spawn_pos_y[oi][ii] = __builtin_bit_cast(
          uint32_t, heal_f32_add(0.0f,
                                 f32_bits(in->anm_pos_y[oi][ii])));
    }
    for (int32_t ii = cap; ii < ISAAC_PM_HEAL_INNER_MAX; ++ii) {
      plan->v2[oi][ii] = 0u;
      plan->spawn_pos_x[oi][ii] = 0u;
      plan->spawn_pos_y[oi][ii] = 0u;
    }
  }
  for (int32_t oi = plan->outer_runs; oi < ISAAC_PM_HEAL_OUTER_MAX; ++oi) {
    plan->f0[oi] = 0u;
    plan->inner_count[oi] = 0;
  }

  plan->tail_total = in->tail_count > ISAAC_PM_HEAL_TAIL_MAX
                         ? ISAAC_PM_HEAL_TAIL_MAX
                         : static_cast<int32_t>(in->tail_count);
  plan->tail_overflow =
      in->tail_count > static_cast<uint32_t>(ISAAC_PM_HEAL_TAIL_MAX) ? 1 : 0;
  plan->tail_eligible = 0;
  plan->tail_frozen_cnt = 0;
  for (int32_t ti = 0; ti < plan->tail_total; ++ti) {
    if (heal_tail_eligible_impl(in->tail_game_26614, in->tail_kind[ti],
                                in->tail_is_player[ti]) != 0) {
      ++plan->tail_eligible;
      if ((in->tail_frozen[ti] & ISAAC_PM_HEAL_FROZEN_BIT) != 0u) {
        ++plan->tail_frozen_cnt;
      }
    }
  }
  plan->list_free_ran =
      (in->tail_free_flag & 0xffu) == 0u && in->tail_count > 0u ? 1 : 0;
  /* Host-side MT draws: the burst host 0x00703330 draws 20 per outer
     iteration (its own 10-iteration loop, 2 per iteration). The
     interior velocity helper draws NOTHING here (null RNG branch). */
  plan->host_draws = static_cast<uint32_t>(in->amount) *
                     static_cast<uint32_t>(ISAAC_PM_HEAL_BURST_DRAWS);
  plan->ret_va = ISAAC_PM_HEAL_VA;
}


/* =====================================================================
 * v17 — HEAL-EMIT  0x007ca7c0 (burst-emission clamp wrapper).
 * ---------------------------------------------------------------------
 * PE:
 *   mov eax,[0xc71678]; cmp [eax+0x26614],2 ; jge done      (signed)
 *   cmp byte [esi+0x173],0 ; jne done                       (dead)
 *   mov edi,[esi+0x194c]; test edi,edi ; jle done           (signed)
 *   cap = min_s(0x1340,0x1344); +1 (wrap); cdq/sub; sar;
 *         half(0x134c+1) same idiom; + [0x1d88]  — same law as
 *         isaac_pm_td_rvb_heal_capacity (0x7a32e0 block, identical
 *         instruction sequence) — REUSED and cross-pinned.
 *   cmp edi,ebx ; jle done                                 (signed)
 *   cmp byte [ebp+8],0 ; jne store  (emit_flag low byte)
 *       sub edi,ebx; ecx=this; push; call 0x007ca2d0       (host)
 *   store: mov [esi+0x194c], ebx             (dword, always after emit gate)
 *   done:  pop x3; pop ebp; ret 4
 * Plan: applies = 3-gate pass; cap = capacity law (computed on all rows,
 * unobservable when !applies in the PE — deterministic here); store =
 * applies && signed red > cap; excess = store && flag low byte == 0
 * ? u32-wrap(red - cap) : 0; ret_va = caller-supplied echo. */
extern "C" void isaac_pm_heal_emit_plan(int32_t game_26614, int32_t dead_173,
                                        int32_t red_194c, int32_t v1340,
                                        int32_t v1344, int32_t v134c,
                                        int32_t v1d88, int32_t emit_flag,
                                        int32_t ret_va,
                                        IsaacPmHealEmitPlan* plan) {
  const uint32_t applies =
      isaac_pm_td_rvb_heal_gate(game_26614, static_cast<uint32_t>(dead_173),
                                red_194c) == 1 ? 1u : 0u;
  const int32_t cap =
      isaac_pm_td_rvb_heal_capacity(v1340, v1344, v134c, v1d88);
  const uint32_t store =
      applies != 0u && red_194c > cap ? 1u : 0u;
  int32_t excess = 0;
  if (store != 0u && (static_cast<uint32_t>(emit_flag) & 0xffu) == 0u) {
    excess = static_cast<int32_t>(static_cast<uint32_t>(red_194c) -
                                  static_cast<uint32_t>(cap));
  }
  plan->applies = applies;
  plan->cap = cap;
  plan->store = store;
  plan->excess = excess;
  plan->ret_va = static_cast<uint32_t>(ret_va);
}

/* =====================================================================
 * v18 — PM1 walk per-iteration re-derived bounds law + TriggerDeath
 * REMOVE-arm vector-mutation pin. See the header block for the PE
 * transcription of 0x009bb616..0x009bb69e and 0x007a1090's entry arms.
 * ---------------------------------------------------------------------
 * PE (PlayerManager::Update): the walk re-reads the players vector pair
 * every iteration; the count is NEVER carried across the body. The plan
 * consumes three read-pairs with the PE's per-path semantics:
 *   pair1 (loop top)     -> count_top / fatal_top (fatal log + end
 *                           re-read + Game reload happen on count==0)
 *   pair2 (selector)     -> count_sel; end2 is the fatal-path re-read,
 *                           begin2 is a fresh read on both paths
 *   pair3 (loop back)    -> count_back; MUST be read from the reloaded
 *                           Game when fatal_top or triggered (base_reloaded)
 * The cursor law stops at the element address: the player-pointer load is
 * the eligibility predicate's input, decoded by the host at walk time. */
extern "C" int32_t isaac_pm_walk_count_reloaded(int32_t end_now,
                                                int32_t begin_now) {
  /* sub wraps in 32 bits; sar is arithmetic (C++20 right shift). */
  const uint32_t span = static_cast<uint32_t>(end_now) -
                        static_cast<uint32_t>(begin_now);
  return static_cast<int32_t>(span) >> ISAAC_PM_PLAYER_PTR_SHIFT;
}

extern "C" int32_t isaac_pm_walk_top_fatal(int32_t end_now,
                                           int32_t begin_now) {
  return isaac_pm_walk_count_reloaded(end_now, begin_now) == 0 ? 1 : 0;
}

extern "C" uint32_t isaac_pm_walk_elem_cursor(uint32_t begin_now,
                                              int32_t index,
                                              int32_t count_sel) {
  /* jae: unsigned out-of-range leaves the cursor at the vector base
     (element 0 is dereferenced, never skipped). lea wraps in 32 bits. */
  const int32_t sel = static_cast<uint32_t>(index) <
                              static_cast<uint32_t>(count_sel)
                          ? index
                          : 0;
  return begin_now + static_cast<uint32_t>(sel * 4);
}

extern "C" int32_t isaac_pm_walk_back_continues(int32_t end_back,
                                                int32_t begin_back,
                                                int32_t index) {
  /* inc edi wraps; jb is unsigned against the re-derived count. */
  const int32_t next = static_cast<int32_t>(static_cast<uint32_t>(index) + 1u);
  return static_cast<uint32_t>(next) <
                 static_cast<uint32_t>(
                     isaac_pm_walk_count_reloaded(end_back, begin_back))
             ? 1
             : 0;
}

extern "C" void isaac_pm_walk_iter_plan(int32_t index, int32_t begin1,
                                        int32_t end1, int32_t end2,
                                        int32_t begin2, int32_t begin3,
                                        int32_t end3, int32_t triggered,
                                        IsaacPmWalkIterPlan* plan) {
  if (plan == nullptr) {
    return;
  }
  const int32_t count_top = isaac_pm_walk_count_reloaded(end1, begin1);
  const int32_t fatal_top = count_top == 0 ? 1 : 0;
  const int32_t count_sel = isaac_pm_walk_count_reloaded(end2, begin2);
  const int32_t elem_index = static_cast<uint32_t>(index) <
                                     static_cast<uint32_t>(count_sel)
                                 ? index
                                 : 0;
  const uint32_t cursor = isaac_pm_walk_elem_cursor(
      static_cast<uint32_t>(begin2), index, count_sel);
  const int32_t count_back = isaac_pm_walk_count_reloaded(end3, begin3);
  const int32_t next_index =
      static_cast<int32_t>(static_cast<uint32_t>(index) + 1u);
  const int32_t continues =
      static_cast<uint32_t>(next_index) < static_cast<uint32_t>(count_back)
          ? 1
          : 0;
  const int32_t base_reloaded = (fatal_top != 0 || triggered != 0) ? 1 : 0;

  plan->count_top = count_top;
  plan->fatal_top = fatal_top;
  plan->count_sel = count_sel;
  plan->elem_index = elem_index;
  plan->cursor = cursor;
  plan->count_back = count_back;
  plan->next_index = next_index;
  plan->continues = continues;
  plan->base_reloaded = base_reloaded;
}

extern "C" void isaac_pm_walk_tick_plan(
    int32_t index, int32_t begin1, int32_t end1, int32_t end2,
    int32_t begin2, int32_t begin3, int32_t end3, int32_t triggered,
    uint32_t dead_173, int32_t anim_7c, uint32_t anim_8c,
    uint32_t twin_null, int32_t twin_anim_7c, uint32_t twin_anim_8c,
    IsaacPmWalkTickPlan* plan) {
  if (plan == nullptr) {
    return;
  }
  /* First 9 fields: the v18 bounds law, byte-identical to
     isaac_pm_walk_iter_plan (cross-pinned in the tests). */
  IsaacPmWalkIterPlan it;
  isaac_pm_walk_iter_plan(index, begin1, end1, end2, begin2, begin3,
                          end3, triggered, &it);
  plan->count_top = it.count_top;
  plan->fatal_top = it.fatal_top;
  plan->count_sel = it.count_sel;
  plan->elem_index = it.elem_index;
  plan->cursor = it.cursor;
  plan->count_back = it.count_back;
  plan->next_index = it.next_index;
  plan->continues = it.continues;
  plan->base_reloaded = it.base_reloaded;
  /* PE 0x009bb64a loads the cursor element (element 0 on the OOB clamp)
     and tests its LIVE fields at 0x009bb64c..0x009bb67b; the trigger
     call at 0x009bb67d runs whenever the chain reaches it - the clamp
     never skips eligibility, so trigger == eligible unconditionally. */
  plan->cursor_eligible =
      isaac_pm_death_player_eligible(dead_173, anim_7c, anim_8c,
                                     twin_null, twin_anim_7c,
                                     twin_anim_8c);
  plan->should_trigger = plan->cursor_eligible;
}

/* ---------- v20: PM3 pre-play chain 0x009bb78e..0x009bb82b ---------- */

extern "C" int32_t isaac_pm_chain_playing(uint32_t is_playing) {
  /* PE 0x009bb793 / 0x009bb7b2: test al,al. Wide param, low-byte mask. */
  return (is_playing & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_pm_chain_receiver_reloaded(int32_t residual_kind) {
  /* Only the PLAY arm at 0x009bb7e8 re-reads [0xc7169c]. */
  return residual_kind == ISAAC_PM_INTENSITY_SFX_RESIDUAL_PLAY ? 1 : 0;
}

extern "C" uint32_t isaac_pm_chain_receiver(uint32_t global_pre,
                                            uint32_t global_now,
                                            int32_t residual_kind) {
  const uint32_t base =
      isaac_pm_chain_receiver_reloaded(residual_kind) != 0 ? global_now
                                                           : global_pre;
  return isaac_pm_sfx_manager_receiver(base);
}

extern "C" void isaac_pm_pre_play_chain_plan(
    float max_vol, uint32_t is_playing, uint32_t global_pre,
    uint32_t global_now, int32_t game_null, int32_t entry_found,
    uint32_t seed, uint32_t shift1, uint32_t shift2, uint32_t shift3,
    IsaacPmPrePlayChainPlan* plan) {
  if (plan == nullptr) {
    return;
  }
  const int32_t playing = isaac_pm_chain_playing(is_playing);
  const int32_t loud = isaac_pm_intensity_sfx_start_needed(max_vol);
  /* Residual kind uses the LOW-BYTE playing flag, not the wide dword. */
  const int32_t kind =
      isaac_pm_intensity_sfx_residual_kind(max_vol, playing);
  const int32_t reloaded = isaac_pm_chain_receiver_reloaded(kind);
  uint32_t call0 = 0;
  uint32_t call1 = 0;
  int32_t play_id = ISAAC_PM_INTENSITY_SFX_ID;
  int32_t play_id_from_pre = 0;
  if (kind == ISAAC_PM_INTENSITY_SFX_RESIDUAL_STOP) {
    call0 = ISAAC_PM_INTENSITY_HOST_VA_STOP;
  } else if (kind == ISAAC_PM_INTENSITY_SFX_RESIDUAL_UPDATE) {
    call0 = ISAAC_PM_INTENSITY_HOST_VA_SET_VOLUME;
    call1 = ISAAC_PM_INTENSITY_HOST_VA_SET_PITCH;
  } else if (kind == ISAAC_PM_INTENSITY_SFX_RESIDUAL_PLAY) {
    call0 = ISAAC_PM_INTENSITY_HOST_VA_PRE_PLAY;
    call1 = ISAAC_PM_INTENSITY_HOST_VA_PLAY;
    play_id = isaac_pm_pre_play_sound_id(game_null, entry_found, seed,
                                         shift1, shift2, shift3);
    play_id_from_pre = 1;
  }
  plan->residual_kind = kind;
  plan->playing = playing;
  plan->loud = loud;
  plan->host_needed = kind != ISAAC_PM_INTENSITY_SFX_RESIDUAL_NONE ? 1 : 0;
  plan->probe_id = static_cast<uint32_t>(ISAAC_PM_INTENSITY_SFX_ID);
  plan->probe_va =
      static_cast<uint32_t>(ISAAC_PM_INTENSITY_HOST_VA_IS_PLAYING);
  plan->receiver = isaac_pm_chain_receiver(global_pre, global_now, kind);
  plan->receiver_reloaded = reloaded;
  plan->call0_va = call0;
  plan->call1_va = call1;
  plan->play_id = play_id;
  plan->play_id_from_pre = play_id_from_pre;
}

static_assert(sizeof(IsaacPmPrePlayChainPlan) == 48,
              "v20 chain plan ABI changed");
static_assert(offsetof(IsaacPmPrePlayChainPlan, play_id_from_pre) == 44,
              "v20 chain plan ABI changed");




/* ---------- v21: ABH prefix/gate 0x007ca840..0x007ca9f8 ---------- */

static uint32_t abh_load_u32(uint32_t addr) {
  return *reinterpret_cast<const uint32_t*>(static_cast<uintptr_t>(addr));
}

extern "C" int32_t isaac_pm_abh_walk_engaged(uint32_t char_type_13c0) {
  /* 0x007ca856 cmp edx,0x28 — FULL DWORD. */
  return char_type_13c0 == static_cast<uint32_t>(ISAAC_PM_ABH_WALK_CHAR) ? 1
                                                                        : 0;
}

extern "C" int32_t isaac_pm_abh_walk_continue(uint32_t char_type_13c0,
                                              uint32_t twin_1e68) {
  if (isaac_pm_abh_walk_engaged(char_type_13c0) == 0) {
    return 0;
  }
  return twin_1e68 != 0u ? 1 : 0;
}

extern "C" int32_t isaac_pm_abh_esau_engaged(uint32_t char_type_13c0) {
  /* 0x007ca887 cmp edx,0x11 — FULL DWORD. Cross-pinned to C0T 0x11. */
  return char_type_13c0 == static_cast<uint32_t>(ISAAC_PM_ABH_ESAU_CHAR) ? 1
                                                                        : 0;
}

extern "C" int32_t isaac_pm_abh_esau_continue(uint32_t char_type_13c0,
                                              uint32_t twin_1d98) {
  if (isaac_pm_abh_esau_engaged(char_type_13c0) == 0) {
    return 0;
  }
  return twin_1d98 != 0u ? 1 : 0;
}

extern "C" int32_t isaac_pm_abh_ht2_early(int32_t health_type) {
  return health_type == 2 ? 1 : 0;
}

extern "C" int32_t isaac_pm_abh_ht3_soul(int32_t health_type) {
  return health_type == 3 ? 1 : 0;
}

extern "C" int32_t isaac_pm_abh_ht3_applies(int32_t health_type, int32_t amount) {
  /* ht==3 AND amount > 0 SIGNED (0x007ca9d8 jle skips the host). */
  return (health_type == 3 && amount > 0) ? 1 : 0;
}

extern "C" int32_t isaac_pm_abh_game_hard(int32_t game_26614) {
  /* SIGNED [g+0x26614] >= 2. Consumes isaac_pm_ghl_gate_lt2 by reference. */
  return isaac_pm_ghl_gate_lt2(game_26614) == 0 ? 1 : 0;
}

extern "C" int32_t isaac_pm_abh_amount_neg(int32_t amount) {
  /* 0x007ca8cf test / jns — SIGNED amount < 0. */
  return amount < 0 ? 1 : 0;
}

extern "C" uint32_t isaac_pm_abh_walk_28(uint32_t player_addr, int32_t step_cap) {
  /* 0x007ca850 loop: char 0x28 + twin +0x1e68. No cycle guard in the PE. */
  uint32_t cur = player_addr;
  int32_t hops = 0;
  for (;;) {
    const uint32_t ch = abh_load_u32(
        cur + static_cast<uint32_t>(ISAAC_PM_ABH_OFF_CHAR_13C0));
    if (ch != static_cast<uint32_t>(ISAAC_PM_ABH_WALK_CHAR)) {
      return cur;
    }
    const uint32_t twin = abh_load_u32(
        cur + static_cast<uint32_t>(ISAAC_PM_ABH_OFF_TWIN_1E68));
    if (twin == 0u) {
      return cur;
    }
    if (hops >= step_cap) {
      return 0u;
    }
    hops += 1;
    cur = twin;
  }
}

static void abh_fill_plan(IsaacPmAbhPlan* plan, uint32_t walked, int32_t term,
                          int32_t hops28, int32_t hops11, int32_t ht,
                          int32_t probes, int32_t kind) {
  if (plan == nullptr) {
    return;
  }
  const int32_t early =
      (kind == ISAAC_PM_ABH_RESIDUAL_EARLY_HT2 ||
       kind == ISAAC_PM_ABH_RESIDUAL_EARLY_HT3 ||
       kind == ISAAC_PM_ABH_RESIDUAL_EARLY_TWIN)
          ? 1
          : 0;
  uint32_t ret_va = 0;
  uint32_t next_va = 0;
  if (kind == ISAAC_PM_ABH_RESIDUAL_EARLY_HT2 ||
      kind == ISAAC_PM_ABH_RESIDUAL_EARLY_HT3) {
    ret_va = static_cast<uint32_t>(ISAAC_PM_ABH_VA_RET_HT2);
  } else if (kind == ISAAC_PM_ABH_RESIDUAL_EARLY_TWIN) {
    ret_va = static_cast<uint32_t>(ISAAC_PM_ABH_VA_RET_TWIN);
  } else if (kind == ISAAC_PM_ABH_RESIDUAL_HOST_HT3) {
    next_va = static_cast<uint32_t>(ISAAC_PM_ABH_VA_HOST_599D0);
  } else if (kind == ISAAC_PM_ABH_RESIDUAL_HOST_HARD) {
    next_va = static_cast<uint32_t>(ISAAC_PM_ABH_VA_HOST_CACB0);
  } else if (kind == ISAAC_PM_ABH_RESIDUAL_HOST_NEG) {
    next_va = (ht == 4) ? static_cast<uint32_t>(ISAAC_PM_ABH_VA_HOST_58850)
                        : static_cast<uint32_t>(ISAAC_PM_ABH_VA_HOST_GETTER);
  } else if (kind == ISAAC_PM_ABH_RESIDUAL_HOST_POS) {
    next_va = static_cast<uint32_t>(ISAAC_PM_ABH_VA_HOST_GHL);
  }
  plan->walked_addr = walked;
  plan->walk_terminated = term;
  plan->hops_28 = hops28;
  plan->hops_11 = hops11;
  plan->health_type = ht;
  plan->ht_probes = probes;
  plan->residual_kind = kind;
  plan->pure_complete = early;
  plan->host_needed = early == 0 && kind != ISAAC_PM_ABH_RESIDUAL_WALK_CAP &&
                              kind != ISAAC_PM_ABH_RESIDUAL_ESAU_HOP
                          ? 1
                          : 0;
  plan->ret_va = ret_va;
  plan->next_host_va = next_va;
}

extern "C" void isaac_pm_abh_prefix_plan(uint32_t char_type_13c0,
                                         uint32_t twin_1d98,
                                         int32_t game_26614, int32_t amount,
                                         IsaacPmAbhPlan* plan) {
  if (plan == nullptr) {
    return;
  }
  const int32_t ht = isaac_pm_ep_get_health_type(static_cast<int32_t>(char_type_13c0));
  if (isaac_pm_abh_ht2_early(ht) != 0) {
    abh_fill_plan(plan, 0, 1, 0, 0, ht, 1,
                  ISAAC_PM_ABH_RESIDUAL_EARLY_HT2);
    return;
  }
  if (isaac_pm_abh_ht3_soul(ht) != 0) {
    if (amount <= 0) {
      abh_fill_plan(plan, 0, 1, 0, 0, ht, 2,
                    ISAAC_PM_ABH_RESIDUAL_EARLY_HT3);
    } else {
      abh_fill_plan(plan, 0, 1, 0, 0, ht, 2,
                    ISAAC_PM_ABH_RESIDUAL_HOST_HT3);
    }
    return;
  }
  if (isaac_pm_abh_esau_engaged(char_type_13c0) != 0) {
    if (twin_1d98 == 0u) {
      abh_fill_plan(plan, 0, 1, 0, 0, ht, 2,
                    ISAAC_PM_ABH_RESIDUAL_EARLY_TWIN);
    } else {
      abh_fill_plan(plan, 0, 1, 0, 0, ht, 2,
                    ISAAC_PM_ABH_RESIDUAL_ESAU_HOP);
    }
    return;
  }
  if (isaac_pm_abh_game_hard(game_26614) != 0) {
    abh_fill_plan(plan, 0, 1, 0, 0, ht, 2,
                  ISAAC_PM_ABH_RESIDUAL_HOST_HARD);
    return;
  }
  if (isaac_pm_abh_amount_neg(amount) != 0) {
    abh_fill_plan(plan, 0, 1, 0, 0, ht, 2,
                  ISAAC_PM_ABH_RESIDUAL_HOST_NEG);
    return;
  }
  abh_fill_plan(plan, 0, 1, 0, 0, ht, 2, ISAAC_PM_ABH_RESIDUAL_HOST_POS);
}

extern "C" void isaac_pm_abh_run_pre(uint32_t player_addr, int32_t game_26614,
                                     int32_t amount, int32_t walk_cap,
                                     IsaacPmAbhPlan* plan) {
  if (plan == nullptr) {
    return;
  }
  int32_t hops28 = 0;
  int32_t hops11 = 0;
  uint32_t cur = player_addr;
  int32_t steps = 0;
  for (;;) {
    const uint32_t ch = abh_load_u32(
        cur + static_cast<uint32_t>(ISAAC_PM_ABH_OFF_CHAR_13C0));
    if (ch == static_cast<uint32_t>(ISAAC_PM_ABH_WALK_CHAR)) {
      const uint32_t twin = abh_load_u32(
          cur + static_cast<uint32_t>(ISAAC_PM_ABH_OFF_TWIN_1E68));
      if (twin != 0u) {
        if (steps >= walk_cap) {
          abh_fill_plan(plan, 0, 0, hops28, hops11, 0, 0,
                        ISAAC_PM_ABH_RESIDUAL_WALK_CAP);
          return;
        }
        hops28 += 1;
        steps += 1;
        cur = twin;
        continue;
      }
    }
    const int32_t ht = isaac_pm_ep_get_health_type(static_cast<int32_t>(ch));
    if (isaac_pm_abh_ht2_early(ht) != 0) {
      abh_fill_plan(plan, cur, 1, hops28, hops11, ht, 1,
                    ISAAC_PM_ABH_RESIDUAL_EARLY_HT2);
      return;
    }
    if (isaac_pm_abh_ht3_soul(ht) != 0) {
      if (amount <= 0) {
        abh_fill_plan(plan, cur, 1, hops28, hops11, ht, 2,
                      ISAAC_PM_ABH_RESIDUAL_EARLY_HT3);
      } else {
        abh_fill_plan(plan, cur, 1, hops28, hops11, ht, 2,
                      ISAAC_PM_ABH_RESIDUAL_HOST_HT3);
      }
      return;
    }
    if (ch == static_cast<uint32_t>(ISAAC_PM_ABH_ESAU_CHAR)) {
      const uint32_t twin11 = abh_load_u32(
          cur + static_cast<uint32_t>(ISAAC_PM_ABH_OFF_TWIN_1D98));
      if (twin11 == 0u) {
        abh_fill_plan(plan, cur, 1, hops28, hops11, ht, 2,
                      ISAAC_PM_ABH_RESIDUAL_EARLY_TWIN);
        return;
      }
      if (steps >= walk_cap) {
        abh_fill_plan(plan, 0, 0, hops28, hops11, ht, 2,
                      ISAAC_PM_ABH_RESIDUAL_WALK_CAP);
        return;
      }
      hops11 += 1;
      steps += 1;
      cur = twin11;
      continue;
    }
    if (isaac_pm_abh_game_hard(game_26614) != 0) {
      abh_fill_plan(plan, cur, 1, hops28, hops11, ht, 2,
                    ISAAC_PM_ABH_RESIDUAL_HOST_HARD);
      return;
    }
    if (isaac_pm_abh_amount_neg(amount) != 0) {
      abh_fill_plan(plan, cur, 1, hops28, hops11, ht, 2,
                    ISAAC_PM_ABH_RESIDUAL_HOST_NEG);
      return;
    }
    abh_fill_plan(plan, cur, 1, hops28, hops11, ht, 2,
                  ISAAC_PM_ABH_RESIDUAL_HOST_POS);
    return;
  }
}

static_assert(sizeof(IsaacPmAbhPlan) == 44, "v21 ABH plan ABI changed");
static_assert(offsetof(IsaacPmAbhPlan, next_host_va) == 40,
              "v21 ABH plan ABI changed");

/* ===================================================================== */
/* v22 — GHT: VA 0x007caa00 GetHeartLimit sibling (address-stable;      */
/* "GetHeartLimit" registration evidence only). PURE predicate.         */
/* ===================================================================== */

extern "C" int32_t isaac_pm_ght_hard_gate(int32_t game_26614) {
  /* 0x007caa0f cmp dword [eax+0x26614],2 ; 0x007caa16 jge 0x7caa8c —
     SIGNED >= 2 takes the hard path. */
  return game_26614 >= 2 ? 1 : 0;
}

extern "C" int32_t isaac_pm_ght_hard_result(int32_t v1340) {
  /* 0x007caa8c cmp dword [esi+0x1340],0xa0 ; 0x007caa97 setl al —
     SIGNED less-than. */
  return v1340 < static_cast<int32_t>(ISAAC_PM_GHT_HARD_CAP_A0) ? 1 : 0;
}

extern "C" int32_t isaac_pm_ght_walk_engaged_28(uint32_t char_type_13c0) {
  /* 0x007caa26 cmp edx,0x28 — FULL DWORD; 0x128 is not a walker. */
  return char_type_13c0 == static_cast<uint32_t>(ISAAC_PM_GHT_WALK_CHAR_28)
             ? 1
             : 0;
}

extern "C" int32_t isaac_pm_ght_walk_continue_28(uint32_t char_type_13c0,
                                                 uint32_t twin_1e68) {
  /* 0x007caa26 jne 0x7caa39 (char first), 0x007caa31 je 0x7caa4c (twin
     null -> settle). PE test order: char then twin. */
  if (isaac_pm_ght_walk_engaged_28(char_type_13c0) == 0) {
    return 0;
  }
  return twin_1e68 != 0u ? 1 : 0;
}

extern "C" int32_t isaac_pm_ght_walk_engaged_11(uint32_t char_type_13c0) {
  /* 0x007caa39 cmp edx,0x11 — FULL DWORD; 0x111 is not Esau. */
  return char_type_13c0 == static_cast<uint32_t>(ISAAC_PM_GHT_WALK_CHAR_11)
             ? 1
             : 0;
}

extern "C" int32_t isaac_pm_ght_walk_continue_11(uint32_t char_type_13c0,
                                                 uint32_t twin_1d98) {
  if (isaac_pm_ght_walk_engaged_11(char_type_13c0) == 0) {
    return 0;
  }
  return twin_1d98 != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_pm_ght_walk(uint32_t player_addr, int32_t step_cap) {
  /* 0x007caa20..0x007caa4c: ONE loop, BOTH hop kinds. Order: 0x28
     checked first; on 0x28-with-null-twin the je settles DIRECTLY (does
     not fall into the 0x11 check). char 0x11 hop uses twin +0x1d98.
     No cycle guard in the PE; step_cap is the harness affordance that
     reports non-termination as 0 (ABH walk_28 precedent). */
  uint32_t cur = player_addr;
  int32_t hops = 0;
  for (;;) {
    const uint32_t ch = abh_load_u32(
        cur + static_cast<uint32_t>(ISAAC_PM_GHT_OFF_CHAR_13C0));
    if (ch == static_cast<uint32_t>(ISAAC_PM_GHT_WALK_CHAR_28)) {
      const uint32_t twin = abh_load_u32(
          cur + static_cast<uint32_t>(ISAAC_PM_GHT_OFF_TWIN_1E68));
      if (twin == 0u) {
        return cur; /* settle on 0x28 with null twin */
      }
      if (hops >= step_cap) {
        return 0u;
      }
      hops += 1;
      cur = twin;
      continue;
    }
    if (ch == static_cast<uint32_t>(ISAAC_PM_GHT_WALK_CHAR_11)) {
      const uint32_t twin = abh_load_u32(
          cur + static_cast<uint32_t>(ISAAC_PM_GHT_OFF_TWIN_1D98));
      if (twin == 0u) {
        return cur; /* settle on 0x11 with null twin */
      }
      if (hops >= step_cap) {
        return 0u;
      }
      hops += 1;
      cur = twin;
      continue;
    }
    return cur; /* other char settles */
  }
}

extern "C" int32_t isaac_pm_ght_ht2_block(int32_t health_type) {
  /* 0x007caa53 cmp eax,2 ; je 0x7caa85 — ht == 2 returns 0. */
  return health_type == 2 ? 1 : 0;
}

extern "C" int32_t isaac_pm_ght_char11_block(uint32_t char_type_13c0) {
  /* 0x007caa58 cmp edx,0x11 ; je 0x7caa85 — edx survives the
     GetHealthType call (that leaf touches eax only), so this is the
     SETTLED char == 0x11 gate. FULL DWORD. */
  return char_type_13c0 == static_cast<uint32_t>(ISAAC_PM_GHT_WALK_CHAR_11)
             ? 1
             : 0;
}

extern "C" int32_t isaac_pm_ght_trunc_half(int32_t limit) {
  /* 0x007caa6a cdq ; 0x007caa6b sub eax,edx ; 0x007caa73 sar eax,1 —
     trunc-toward-zero halve (the v14 ubh_trunc_half idiom). */
  return ubh_trunc_half(limit);
}

extern "C" int32_t isaac_pm_ght_half_left(int32_t v1340, int32_t v1d88) {
  /* 0x007caa75 lea ecx,[ecx+edx*2] ; 0x007caa78 sar ecx,1 — 32-bit
     wrap sum, ARITHMETIC shift (floor for negatives; NOT trunc-half). */
  return static_cast<int32_t>(
             static_cast<uint32_t>(v1340) +
             2u * static_cast<uint32_t>(v1d88)) >>
         1;
}

extern "C" int32_t isaac_pm_ght_room_lt(int32_t half_left,
                                        int32_t half_right) {
  /* 0x007caa7a cmp ecx,eax ; 0x007caa7c jge 0x7caa85 — SIGNED
     less-than keeps al=1. */
  return half_left < half_right ? 1 : 0;
}

static void ght_fill_plan(IsaacPmGhtPlan* plan, uint32_t walked,
                          int32_t terminated, int32_t hops28, int32_t hops11,
                          int32_t ht, int32_t char11_gate, int32_t limit,
                          int32_t half_left, int32_t half_right,
                          int32_t result, uint32_t ret_va) {
  if (plan == nullptr) {
    return;
  }
  plan->walked_addr = walked;
  plan->walk_terminated = terminated;
  plan->hops_28 = hops28;
  plan->hops_11 = hops11;
  plan->health_type = ht;
  plan->char_11_gate = char11_gate;
  plan->limit = limit;
  plan->half_left = half_left;
  plan->half_right = half_right;
  plan->result = result;
  plan->ret_va = ret_va;
}

extern "C" void isaac_pm_ght_plan(uint32_t player_addr, uint32_t game_addr,
                                  int32_t walk_cap, uint32_t null78,
                                  uint32_t null79, uint32_t has26b_char1,
                                  int32_t gullet, uint32_t has26b_charE,
                                  uint32_t has1f5, IsaacPmGhtPlan* plan) {
  if (plan == nullptr) {
    return;
  }
  const int32_t game_26614 = static_cast<int32_t>(abh_load_u32(
      game_addr + static_cast<uint32_t>(ISAAC_PM_GHT_OFF_GAME_26614)));
  if (isaac_pm_ght_hard_gate(game_26614) != 0) {
    /* 0x007caa16 jge 0x7caa8c: NO walk, NO ht, NO GHL — the ORIGINAL
       player's v1340 vs 0xa0, signed. */
    const int32_t v1340 = static_cast<int32_t>(abh_load_u32(
        player_addr + static_cast<uint32_t>(ISAAC_PM_GHT_OFF_V1340)));
    const int32_t hard = isaac_pm_ght_hard_result(v1340);
    ght_fill_plan(plan, player_addr, 1, 0, 0, 0, 0, 0, 0, 0, hard,
                  static_cast<uint32_t>(ISAAC_PM_GHT_VA_RET_HARD));
    return;
  }
  /* Soft path: walk both hop kinds, settle. */
  uint32_t cur = player_addr;
  int32_t hops28 = 0;
  int32_t hops11 = 0;
  int32_t steps = 0;
  int32_t walked = 1;
  for (;;) {
    const uint32_t ch = abh_load_u32(
        cur + static_cast<uint32_t>(ISAAC_PM_GHT_OFF_CHAR_13C0));
    if (ch == static_cast<uint32_t>(ISAAC_PM_GHT_WALK_CHAR_28)) {
      const uint32_t twin = abh_load_u32(
          cur + static_cast<uint32_t>(ISAAC_PM_GHT_OFF_TWIN_1E68));
      if (twin == 0u) {
        break;
      }
      if (steps >= walk_cap) {
        walked = 0;
        break;
      }
      hops28 += 1;
      steps += 1;
      cur = twin;
      continue;
    }
    if (ch == static_cast<uint32_t>(ISAAC_PM_GHT_WALK_CHAR_11)) {
      const uint32_t twin = abh_load_u32(
          cur + static_cast<uint32_t>(ISAAC_PM_GHT_OFF_TWIN_1D98));
      if (twin == 0u) {
        break;
      }
      if (steps >= walk_cap) {
        walked = 0;
        break;
      }
      hops11 += 1;
      steps += 1;
      cur = twin;
      continue;
    }
    break;
  }
  if (walked == 0) {
    ght_fill_plan(plan, 0, 0, hops28, hops11, 0, 0, 0, 0, 0, 0, 0u);
    return;
  }
  const uint32_t ch = abh_load_u32(
      cur + static_cast<uint32_t>(ISAAC_PM_GHT_OFF_CHAR_13C0));
  const int32_t ht =
      isaac_pm_ep_get_health_type(static_cast<int32_t>(ch));
  if (isaac_pm_ght_ht2_block(ht) != 0) {
    ght_fill_plan(plan, cur, 1, hops28, hops11, ht, 0, 0, 0, 0, 0,
                  static_cast<uint32_t>(ISAAC_PM_GHT_VA_RET_ZERO));
    return;
  }
  const int32_t char11 = isaac_pm_ght_char11_block(ch);
  if (char11 != 0) {
    ght_fill_plan(plan, cur, 1, hops28, hops11, ht, 1, 0, 0, 0, 0,
                  static_cast<uint32_t>(ISAAC_PM_GHT_VA_RET_ZERO));
    return;
  }
  /* GetHealthLimit(false) on the settled player (0x007caa5d push 0 ;
     0x007caa5f call 0x7cae60). Composes the already-pure GHL law by
     reference, keeper=false. */
  IsaacPmGhlInputs in;
  in.game_26614 = game_26614;
  in.v2c = static_cast<int32_t>(abh_load_u32(
      cur + static_cast<uint32_t>(ISAAC_PM_GHL_OFF_STATE_2C)));
  in.char_1 = static_cast<int32_t>(ch);
  in.char_2 = static_cast<int32_t>(ch);
  in.char_3 = static_cast<int32_t>(ch);
  in.char_4 = static_cast<int32_t>(ch);
  in.keeper = 0u;
  in.null78 = null78;
  in.null79 = null79;
  in.has26b_char1 = has26b_char1;
  in.gullet_7ce390 = gullet;
  in.has26b_charE = has26b_charE;
  in.has1f5 = has1f5;
  in.coins_1368 = static_cast<int32_t>(abh_load_u32(
      cur + static_cast<uint32_t>(ISAAC_PM_GHL_OFF_COINS_1368)));
  in.v1da0 = static_cast<int32_t>(abh_load_u32(
      cur + static_cast<uint32_t>(ISAAC_PM_GHL_OFF_CLAMP_1DA0)));
  IsaacPmGhlPlan ghl;
  isaac_pm_ghl_plan(&in, &ghl);
  const int32_t limit = ghl.result;
  /* 0x007caa64..0x007caa7c: half-compare, signed. */
  const int32_t v1340 = static_cast<int32_t>(abh_load_u32(
      cur + static_cast<uint32_t>(ISAAC_PM_GHT_OFF_V1340)));
  const int32_t v1d88 = static_cast<int32_t>(abh_load_u32(
      cur + static_cast<uint32_t>(ISAAC_PM_GHT_OFF_V1D88)));
  const int32_t half_left = isaac_pm_ght_half_left(v1340, v1d88);
  const int32_t half_right = isaac_pm_ght_trunc_half(limit);
  const int32_t result = isaac_pm_ght_room_lt(half_left, half_right);
  ght_fill_plan(plan, cur, 1, hops28, hops11, ht, 0, limit, half_left,
                half_right, result,
                static_cast<uint32_t>(result != 0 ? ISAAC_PM_GHT_VA_RET_ONE
                                                  : ISAAC_PM_GHT_VA_RET_ZERO));
}

static_assert(sizeof(IsaacPmGhtPlan) == 44, "v22 GHT plan ABI changed");
static_assert(offsetof(IsaacPmGhtPlan, ret_va) == 40,
              "v22 GHT plan ABI changed");

/* ===================================================================== */
/* v23 — BTT: VA 0x007caaa0 bit-test sibling (address-stable, NO exact   */
/* ZHL). PURE: 0 stores, 0 indirect, 0 E8. Signed count gate on          */
/* [player+0x1d88], then bit-test [player+0x1d8c] with 1 << (bit & 31).  */
/* ret 4 (__thiscall, one 4-byte stack arg). Bool in al — both direct    */
/* callers (0x777013 / 0x7da98d) consume it with `test al,al`.           */
/* ===================================================================== */

extern "C" int32_t isaac_pm_btt_count_gate(int32_t v1d88) {
  /* 0x007caaa5 cmp dword [edx+0x1d88],0 ; 0x007caaac jle 0x7caac6 —
     SIGNED: the bit test runs only while the count is > 0. 0 and every
     negative (including INT_MIN) jump to the xor-al return. */
  return v1d88 > 0 ? 1 : 0;
}

extern "C" uint32_t isaac_pm_btt_mask(uint32_t bit_index) {
  /* 0x007caab1 mov eax,1 ; 0x007caab6 shl eax,cl — x86 masks the shift
     count to CL & 31 (frame-opaque precedent 1u << (bit & 31u)); bit 32
     wraps to bit 0, and 0xffffffff (& 0x1f = 31) selects 0x80000000. */
  return 1u << (bit_index & static_cast<uint32_t>(ISAAC_PM_BTT_SHIFT_MOD));
}

extern "C" int32_t isaac_pm_btt_bit_hit(uint32_t bits_1d8c,
                                        uint32_t bit_index) {
  /* 0x007caab8 test dword [edx+0x1d8c],eax ; 0x007caabe je 0x7caac6 ;
     0x007caac0 mov al,1 — bool in al only. */
  const uint32_t mask = isaac_pm_btt_mask(bit_index);
  return (bits_1d8c & mask) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_pm_btt_result(int32_t v1d88, uint32_t bits_1d8c,
                                       uint32_t bit_index) {
  /* Whole 0x007caaa0 predicate: signed count gate first, then the bit
     test on [player+0x1d8c]. The jle at 0x007caaac skips the shl/test
     entirely, so a zero/negative count forces 0 regardless of the bits. */
  if (isaac_pm_btt_count_gate(v1d88) == 0) {
    return 0;
  }
  return isaac_pm_btt_bit_hit(bits_1d8c, bit_index);
}

/* ===================================================================== */
/* v24 — TPD: VA 0x007caad0 TryPreventDeath pure dispatch (gate + switch */
/* selection + per-case pure scalar guards). Case bodies stay host:      */
/* 0x7588a0 VERIFIED IMPURE (4 E8, host HasCollectibleEffect) -> host    */
/* leaf; 0x758a70 apply host; DEFAULT [0x134c]=1 store host. Pure law    */
/* transcribed from the instruction stream (dump 007caad0.txt + payload  */
/* 007cab14.txt + jump table @ 0x7caba8).                               */
/* ===================================================================== */

extern "C" int32_t isaac_pm_tpd_gate(int32_t v1d88, int32_t v1344,
                                     int32_t v134c) {
  /* 0x007caada mov eax,[esi+0x1d88] ; 0x007caae0 add eax,[esi+0x1344] ;
     0x007caae6 add eax,[esi+0x134c] ; 0x007caaec jne 0x7cab9e —
     ZF comes from the LAST add only: dispatch proceeds iff the wrapped
     32-bit sum of bone+soul+eternal hearts is exactly 0. */
  const uint32_t sum = static_cast<uint32_t>(v1d88) +
                       static_cast<uint32_t>(v1344) +
                       static_cast<uint32_t>(v134c);
  return sum == 0u ? 1 : 0;
}

extern "C" int32_t isaac_pm_tpd_case(uint32_t health_type) {
  /* 0x007caaf2 call 0x7cafe0 ; 0x007caaf7 cmp eax,4 ; 0x007caafa
     ja 0x7cab8d (UNSIGNED over-range -> DEFAULT) ; 0x007cab00
     jmp dword [eax*4+0x7caba8]. Table 0..4: 0x7cab3b (CASE0),
     0x7cab8d (DEFAULT), 0x7cab8d (DEFAULT), 0x7cab15 (CASE3),
     0x7cab07 (CASE4). A negative health type wraps unsigned (>4) and
     takes DEFAULT, exactly like ja. */
  static const uint8_t kTable[5] = {
      static_cast<uint8_t>(ISAAC_PM_TPD_CASE0),
      static_cast<uint8_t>(ISAAC_PM_TPD_CASE_DEFAULT),
      static_cast<uint8_t>(ISAAC_PM_TPD_CASE_DEFAULT),
      static_cast<uint8_t>(ISAAC_PM_TPD_CASE3),
      static_cast<uint8_t>(ISAAC_PM_TPD_CASE4)};
  if (health_type > 4u) {
    return ISAAC_PM_TPD_CASE_DEFAULT;
  }
  return kTable[health_type];
}

extern "C" int32_t isaac_pm_tpd_case0_is_char12(uint32_t v13c0) {
  /* 0x007cab3b cmp dword [esi+0x13c0],0x12 ; 0x007cab48 jne 0x7cab6c —
     FULL-DWORD compare; only == 0x12 takes the CASE0 char-12 branch. */
  return v13c0 == static_cast<uint32_t>(ISAAC_PM_TPD_CHAR_12) ? 1 : 0;
}

extern "C" int32_t isaac_pm_tpd_fatal_lt2(int32_t fatal1340) {
  /* Shared by CASE3 (0x007cab1c cmp [esi+0x1340],2 ; jge 0x7cab27) and
     CASE0-char12 (0x007cab4d jge 0x7cab58) — SIGNED: the host half-heart
     call 0x7588a0 runs only while fatal hearts < 2. */
  return fatal1340 < ISAAC_PM_TPD_FATAL_CMP ? 1 : 0;
}

extern "C" int32_t isaac_pm_tpd_case0_fatal_le0(int32_t fatal1340) {
  /* CASE0-else: 0x007cab6c test eax,eax ; 0x007cab6e jle 0x7cab8d —
     SIGNED: fatal <= 0 falls straight to the DEFAULT body. */
  return fatal1340 <= 0 ? 1 : 0;
}

extern "C" int32_t isaac_pm_tpd_case0_else_fatal(int32_t game26614) {
  /* CASE0-else: 0x007cab70 push 0 ; push 1 ; mov ecx,1 ;
     0x007cab79 call 0x7dd380 ; ... call 0x758a70. 0x7dd380 is a PURE
     leaf (17 insns, 0 stores, 0 E8): mov eax,[0xc71678] ;
     cmp [eax+0x26614],2 ; lea eax,[ecx*8] ; jge ret ; mov eax,ecx ; ret.
     The lea runs unconditionally; the SIGNED jge (game >= 2) skips the
     mov. Callsite folds ecx = 1 -> arg1 is 8 (game >= 2) or 1 (game < 2). */
  return game26614 >= ISAAC_PM_TPD_FATAL_CMP
             ? ISAAC_PM_TPD_C0_ELSE_GE2
             : ISAAC_PM_TPD_C0_ELSE_LT2;
}

/* ===================================================================== */
/* v25 — GF: VA 0x007dd380 global-fatal scale leaf WHOLE (general-ecx). */
/* PURE: 17 insns, 0 E8, 0 indirect, 0 mem-stores. mov eax,[0xc71678] ; */
/* cmp [eax+0x26614],2 ; lea eax,[ecx*8] (UNCONDITIONAL, 32-bit wrap) ; */
/* jge ret ; mov eax,ecx ; ret. Law: game[0x26614] >= 2 (SIGNED jge) ?   */
/* ecx*8 : ecx. 21 direct E8 callers (dump 007dd380.txt + E8 rel32      */
/* scan of .text). ecx is a genuine variable input (0x7ce5a1 add        */
/* ecx,ecx ; 0x7da944 lea ecx,[edi+1]).                                */
/* ===================================================================== */

extern "C" int32_t isaac_pm_global_fatal_scale(int32_t game26614,
                                               int32_t ecx) {
  /* 0x007dd385 cmp dword ptr [eax+0x26614],2 ; 0x007dd393 jge 0x7dd397 :
     SIGNED game >= 2 keeps the lea result (eax = ecx*8, wrapped
     32-bit via unsigned math); 0x007dd395 mov eax,ecx covers game < 2.
     The lea executes BEFORE the branch, so the *8 wrap applies exactly
     like lea (mod 2^32), not as a signed-UB `ecx * 8`. */
  if (game26614 >= ISAAC_PM_GF_CMP) {
    return static_cast<int32_t>(static_cast<uint32_t>(ecx) *
                                static_cast<uint32_t>(ISAAC_PM_GF_SCALE));
  }
  return ecx;
}

/* ===================================================================== */
/* v26 — BF: VA 0x007db0a0 flag/effect decision island (NARROWED).      */
/* thiscall, ret plain; 73 insns, 2 E8 (0x7cb6e0 count resolver +        */
/* 0x930220 effect add — BOTH stay host), 1 observable store             */
/* (byte [this+0x1eec]). Pure laws transcribed from the instruction      */
/* stream (dump 007db0a0.txt); the count sample, the queue walk, and     */
/* the store stay host by contract.                                      */
/* ===================================================================== */

extern "C" int32_t isaac_pm_7db0a0_map_count(int32_t count) {
  /* 0x007db0b1 sub eax,0 ; je 0x7db0c9 (count==0 -> 0) ;
     0x007db0b6 sub eax,1 ; je 0x7db0c2 (count==1 -> 1) ; else 2. */
  if (count == 0) return 0;
  if (count == 1) return 1;
  return 2;
}

extern "C" uint32_t isaac_pm_7db0a0_delta(int32_t count, uint32_t flag) {
  /* 0x007db0cb mov cl,byte [esi+0x1eec] ; movzx eax,cl ; and eax,0xf ;
     0x007db0d7 sub edx,eax ; 0x007db0d9 mov eax,0 ;
     0x007db0de cmovs edx,eax — SIGNED clamp: delta < 0 -> 0.  Input
     flag is the BYTE value (uint32 passed wide; only bits 0-3 are
     used, matching the byte load + and 0xf). */
  const int32_t mapped = isaac_pm_7db0a0_map_count(count);
  const int32_t low = static_cast<int32_t>(flag & 0xfu);
  const int32_t delta = mapped - low;
  return delta < 0 ? 0u : static_cast<uint32_t>(delta);
}

extern "C" int32_t isaac_pm_7db0a0_proceed(int32_t count, uint32_t flag) {
  /* 0x007db0e1 test edx,edx ; 0x007db0e3 je 0x7db14d — delta == 0
     returns WITHOUT the flag store or the host call. */
  return isaac_pm_7db0a0_delta(count, flag) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_pm_7db0a0_size_gate(uint32_t begin, uint32_t end) {
  /* 0x007db0f6 sub eax,edx (32-bit wrap) ; 0x007db0f8 and eax,~3 ;
     0x007db0fb cmp eax,0x4e4 ; 0x007db100 jle 0x7db13c — SIGNED <=
     skips the effect call, so the gate is SIGNED size > 0x4e4. */
  const uint32_t size = (end - begin) & 0xfffffffcu;
  return static_cast<int32_t>(size) > ISAAC_PM_BF_SIZE_CMP ? 1 : 0;
}

extern "C" int32_t isaac_pm_7db0a0_host_needed(uint32_t begin, uint32_t end,
                                               uint32_t slot) {
  /* 0x007db102 mov eax,[edx+0x4e4] ; 0x007db108 test eax,eax ;
     0x007db10a je 0x7db13c — the effect call runs iff SIGNED size
     > 0x4e4 AND slot = [begin + 0x4e4] != 0. */
  return isaac_pm_7db0a0_size_gate(begin, end) != 0 && slot != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_pm_7db0a0_flag_next(uint32_t flag) {
  /* 0x007db13c..0x007db145: al = cl ; cl &= 0xf ; al &= 0xf0 ;
     al += 0x10 (8-BIT add: 0xf0 + 0x10 wraps to 0x00) ; al |= cl.
     new_flag = ((flag & 0xf0) + 0x10) | (flag & 0xf), byte-rounded
     (the PE stores a byte; the +0x10 is an 8-bit add). Input flag is
     the byte the PE uses at the store site (post-call reload on the
     host path, pre-call load on the skip path). */
  const uint32_t high = (flag & 0xf0u) + ISAAC_PM_BF_FLAG_INC;
  return (high & 0xffu) | (flag & 0xfu);
}

/* ===================================================================== */
/* v27 — BQ: VA 0x007db160 small-host decision island (NARROWED).        */
/* thiscall, ret plain; 124 insns, 4 E8 (0x7cb6e0 count resolver,        */
/* 0x9303f0 effect add, 0x75d850 RemoveCostume x2 — ALL stay host),      */
/* 1 observable store (byte [this+0x1eec]). Pure laws transcribed from   */
/* the instruction stream (disasm-007db160.txt); the count sample, the   */
/* slot reads, the guest-memory walk, and the store stay host.           */
/* ===================================================================== */

extern "C" int32_t isaac_pm_7db160_map_count(int32_t count) {
  /* 0x007db172 sub eax,0 ; je 0x7db18a (count==0 -> 0) ;
     0x007db177 sub eax,1 ; je 0x7db183 (count==1 -> 1) ; else 2.
     Same shape as the 0x7db0a0 chain, this body's own copy. */
  if (count == 0) return 0;
  return count == 1 ? 1 : 2;
}

extern "C" uint32_t isaac_pm_7db160_delta(int32_t count, uint32_t flag) {
  /* 0x007db18c mov cl,byte [edi+0x1eec] ; movzx ebx,cl ; and eax,0xf ;
     0x007db19a sub edx,eax ; 0x007db19c mov eax,0 ;
     0x007db1a1 cmovs edx,eax — SIGNED clamp: delta < 0 -> 0.  flag is
     byte-truncated by the machine (movzx from the byte load) so the
     low nibble reads (flag & 0xf) on the full dword argument. */
  const int32_t mapped = isaac_pm_7db160_map_count(count);
  const int32_t low = static_cast<int32_t>(flag & 0xfu);
  const int32_t delta = mapped - low;
  return delta < 0 ? 0u : static_cast<uint32_t>(delta);
}

extern "C" int32_t isaac_pm_7db160_run_loop(uint32_t flag, uint32_t delta) {
  /* 0x007db1a4 shr ebx,4 (high = flag >> 4 after the byte movzx) ;
     0x007db1a7 cmp ebx,edx ; 0x007db1a9 jbe 0x7db2ac — UNSIGNED
     high <= delta skips the loop. So the loop runs iff
     ((flag & 0xff) >> 4) > delta. */
  const uint32_t high = (flag & 0xffu) >> 4;
  return high > delta ? 1 : 0;
}

extern "C" uint32_t isaac_pm_7db160_loop_count(uint32_t flag, uint32_t delta) {
  /* 0x007db1af mov esi,ebx ; 0x007db1b1 sub esi,edx ;
     0x007db1b3 mov [ebp-4],esi — loopCount = high - delta with 32-bit
     wrap. Only reached when run_loop (high > delta), so the machine
     value is >= 1; the export returns the raw difference so callers
     gate on run_loop first. */
  return ((flag & 0xffu) >> 4) - delta;
}

extern "C" int32_t isaac_pm_7db160_size_gate(uint32_t begin, uint32_t end) {
  /* ONE law, TWO call sites:
     0x007db1d2 sub eax,ecx (32-bit wrap) ; and eax,~3 ;
       0x007db1d7 cmp eax,0x4e4 ; 0x007db1dc jle 0x7db210 — SIGNED <=
       skips the 0x9303f0 effect call;
     0x007db26f same size ; 0x007db274 cmp eax,0x4e4 ;
       0x007db279 jg 0x7db287 — SIGNED > selects the 0x75d850 slot arg.
     Both evaluate SIGNED ((end - begin) & ~3) > 0x4e4. */
  const uint32_t size = (end - begin) & 0xfffffffcu;
  return static_cast<int32_t>(size) > ISAAC_PM_BQ_SIZE_CMP ? 1 : 0;
}

extern "C" int32_t isaac_pm_7db160_effect_host_needed(uint32_t begin,
                                                       uint32_t end,
                                                       uint32_t slot) {
  /* 0x007db1de mov eax,[ecx+0x4e4] ; 0x007db1e4 test eax,eax ;
     0x007db1e6 je 0x7db210 — the 0x9303f0 effect call runs iff the
     SIGNED size gate AND slot = [begin + 0x4e4] != 0 (slot is a
     host-read; the pure decision takes the host-provided value). */
  return isaac_pm_7db160_size_gate(begin, end) != 0 && slot != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_pm_7db160_flag_store(int32_t count, uint32_t flag,
                                               uint32_t reloaded_flag) {
  /* 0x007db2ac shl bl,4 ; 0x007db2af and cl,0xf ; 0x007db2b2 or cl,bl ;
     0x007db2b4 mov [edi+0x1eec],cl.  bl after the loop is delta (high
     decremented once per loopCount = high - delta iteration); on the
     SKIP path (high <= delta) bl stays high and cl is the PRE-LOOP
     flag, so the byte stored is (high<<4)|(flag&0xf) == flag — a
     no-op store of the original value.  On the run path cl is the
     flag byte RELOADED at 0x7db2a6 AFTER all host calls (post-call
     recapture; the hosts may rewrite [this+0x1eec]).  The export
     takes whichever byte the PE would use (caller contract). */
  const uint32_t high = (flag & 0xffu) >> 4;
  const uint32_t delta = isaac_pm_7db160_delta(count, flag);
  if (high <= delta) {
    /* Skip path: store == original flag byte (pre-loop load). */
    return flag & 0xffu;
  }
  /* Run path: high nibble = delta, low nibble from the reload. */
  return ((delta & 0xfu) << 4) | (reloaded_flag & 0xfu);
}

/* ===================================================================== */
/* v28 — BR: VA 0x007db2d0 small-host advance island (NARROWED).         */
/* thiscall, ret plain; 41 insns, 1 E8 (0x7cb6e0 count resolver — host), */
/* 1 observable store (byte [this+0x1eec]). Pure laws transcribed from   */
/* the instruction stream (disasm-007db2d0.txt); the count sample and    */
/* the store stay host by contract.                                     */
/* ===================================================================== */

extern "C" int32_t isaac_pm_7db2d0_map_count(int32_t count) {
  /* 0x007db2da sub eax,0 ; je 0x7db2f2 (count==0 -> 0) ;
     0x007db2df sub eax,1 ; je 0x7db2eb (count==1 -> 1) ; else 2.
     Same shape as the 0x7db0a0/0x7db160 chains, this body's own copy. */
  if (count == 0) return 0;
  return count == 1 ? 1 : 2;
}

extern "C" uint32_t isaac_pm_7db2d0_delta(int32_t count, uint32_t flag) {
  /* 0x007db2f4 mov dl,byte [esi+0x1eec] ; movzx eax,dl ; and eax,0xf ;
     0x007db300 sub ecx,eax ; 0x007db302 mov eax,0 ;
     0x007db307 cmovs ecx,eax — SIGNED clamp: delta < 0 -> 0.  flag is
     byte-truncated by the machine (movzx from the byte load) so the
     low nibble reads (flag & 0xf) on the full dword argument. */
  const int32_t mapped = isaac_pm_7db2d0_map_count(count);
  const int32_t low = static_cast<int32_t>(flag & 0xfu);
  const int32_t delta = mapped - low;
  return delta < 0 ? 0u : static_cast<uint32_t>(delta);
}

extern "C" int32_t isaac_pm_7db2d0_proceed(int32_t count, uint32_t flag) {
  /* 0x007db30a test ecx,ecx ; 0x007db30c je 0x7db329 — delta == 0
     returns 0 WITHOUT the flag store; delta != 0 stores the advanced
     flag and returns 1 (mov al,1 at 0x7db325).  The export is the
     return value in al, which ALSO gates the store. */
  return isaac_pm_7db2d0_delta(count, flag) != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_pm_7db2d0_flag_advance(uint32_t flag) {
  /* 0x007db30e mov al,dl (al = flag byte) ; 0x007db310 inc dl ;
     0x007db312 shr al,4 ; 0x007db315 and dl,0xf ; 0x007db318 dec al ;
     0x007db31a shl al,4 ; 0x007db31d or al,dl — new byte = (((flag>>4)
     - 1) & 0xf) << 4 | ((flag + 1) & 0xf), all 8-BIT register ops
     (dec al from high 0 wraps to 0xff then shl 4 -> 0xf0; inc dl from
     0xff wraps to 0x00 then & 0xf -> 0).  NO recapture: the flag is
     loaded once at 0x7db2f4 and no host call runs before the store. */
  const uint32_t high = (flag & 0xffu) >> 4;
  const uint32_t low = flag & 0xffu;
  return ((((high - 1u) & 0xfu) << 4) | ((low + 1u) & 0xfu)) & 0xffu;
}

extern "C" uint32_t isaac_pm_7db2d0_flag_store(int32_t count, uint32_t flag) {
  /* Composition: the store at 0x7db31f happens iff proceed (delta !=
     0) and writes flag_advance(flag); on delta == 0 the epilogue
     (0x7db329) returns WITHOUT touching [this+0x1eec] — the effective
     byte after the call is the original flag. */
  if (isaac_pm_7db2d0_proceed(count, flag) == 0) {
    return flag & 0xffu;
  }
  return isaac_pm_7db2d0_flag_advance(flag);
}

/* ===================================================================== */
/* v29 — BS: VA 0x007db330 scale island (NARROWED).                      */
/* __stdcall ret 4; 19 insns, 0 E8, 0 indirect, 0 mem-stores.            */
/* g_Game = [0xc71678] + [Game+0x26614] stay host (typed `mode` scalar); */
/* the decision (SIGNED mode gate, SIGNED arg select, LOGICAL shift)     */
/* is the pure law. NO byte loads anywhere — full-dword compares and     */
/* shift (no uint8_t risk, no & 0xff narrow).                            */
/* ===================================================================== */

extern "C" int32_t isaac_pm_7db330_mode_ge2(uint32_t mode) {
  /* 0x007db33b cmp dword ptr [eax + 0x26614], 2 ; 0x007db342 jl
     0x7db358 — SIGNED: mode < 2 returns the arg unchanged on the raw
     epilogue. Same gate sense as isaac_pm_ght_hard_gate /
     isaac_pm_global_fatal_scale (family-wide Game+0x26614 field). */
  return static_cast<int32_t>(mode) >= 2 ? 1 : 0;
}

extern "C" uint32_t isaac_pm_7db330_scale(uint32_t arg) {
  /* 0x007db344 mov ecx,edx ; 0x007db346 mov eax,1 ; 0x007db34b shr
     ecx,3 ; 0x007db34e cmp edx,0x10 ; 0x007db351 cmovge eax,ecx.
     shr is LOGICAL (unsigned shift, zero-fill); cmovge is SIGNED
     (SF==OF after the cmp): (int32)arg >= 0x10 ? (arg >> 3u) : 1. */
  return static_cast<int32_t>(arg) >= 0x10 ? (arg >> 3u) : 1u;
}

extern "C" uint32_t isaac_pm_7db330_value(uint32_t arg, uint32_t mode) {
  /* Whole body: mode < 2 (SIGNED jl at 0x7db342) -> epilogue 0x7db358
     mov eax,edx (arg untouched); mode >= 2 -> epilogue 0x7db355 with
     the scale result. The arg is read unconditionally (mov edx,
     [ebp+8] before the cmp). */
  if (isaac_pm_7db330_mode_ge2(mode) == 0) {
    return arg;
  }
  return isaac_pm_7db330_scale(arg);
}

/* ===================================================================== */
/* v30 — BT: VA 0x007db360 soul/fatal ratio-window island (NARROWED).    */
/* thiscall, plain ret, ZERO stack args, bool in al. 26 insns, 0 E8,     */
/* 0 indirect, 0 mem-stores, 3 rets (0x7db3a2 ONE, 0x7db3a5 ZERO,        */
/* 0x7db3ac EQ2). g_Game = [0xc71678] + [Game+0x26614] and the Player    */
/* [0x1344] (soul) / [0x1340] (fatal) dwords stay host (typed scalars);  */
/* the decision (SIGNED mode gate, SIGNED int32->f32 converts, divss     */
/* rounding, ordered 0.1f..0.3f window with NaN/inf -> 0, full-dword     */
/* soul == 2 fallback) is the pure law. NO byte loads anywhere — zero    */
/* uint8_t risk, zero & 0xff narrow. Same comiss pair + same constants   */
/* as isaac_pm_urh_d_add_band (URH F32_01/F32_03 pins).                  */
/* ===================================================================== */

extern "C" int32_t isaac_pm_7db360_mode_ge2(uint32_t mode) {
  /* 0x007db36b cmp dword ptr [eax + 0x26614], 2 ; 0x007db372 jl
     0x7db3a6 — SIGNED: mode < 2 chains to the EQ2 epilogue. Same
     gate sense as isaac_pm_7db330_mode_ge2 / isaac_pm_ght_hard_gate
     (family-wide Game+0x26614 field). */
  return static_cast<int32_t>(mode) >= 2 ? 1 : 0;
}

extern "C" uint32_t isaac_pm_7db360_ratio_bits(uint32_t soul, uint32_t fatal) {
  /* 0x007db37c movd xmm1,edx ; 0x007db380 cvtdq2ps xmm1,xmm1 ;
     0x007db383 cvtdq2ps xmm0,xmm0 ; 0x007db386 divss xmm1,xmm0 —
     SIGNED int32->f32 converts (cvtdq2ps), single-precision
     round-to-nearest division. Same computation as
     isaac_pm_urh_ratio_bits (urh_ratio), operand order soul/fatal. */
  return __builtin_bit_cast(uint32_t,
                            urh_ratio(static_cast<int32_t>(soul),
                                      static_cast<int32_t>(fatal)));
}

extern "C" int32_t isaac_pm_7db360_window(uint32_t soul, uint32_t fatal) {
  /* 0x007db38a comiss r,[0xbaa120=0.1f] / jb -> 0 (LESS OR UNORDERED —
     a 0/0 NaN lands here, exactly like the PE); 0x007db39b comiss
     [0xbaa1f8=0.3f],r / jb -> 0 (0.3f < r, so +inf exits here); only
     the ordered INCLUSIVE 0.1f <= r <= 0.3f keeps al=1. Same comiss
     pair + same constants as isaac_pm_urh_d_add_band. */
  const float r = urh_ratio(static_cast<int32_t>(soul),
                            static_cast<int32_t>(fatal));
  if (!(r >= f32_bits(ISAAC_PM_BT_F32_LO_BITS))) {
    return 0; /* jb 1: NaN lands here, exactly like the PE */
  }
  if (f32_bits(ISAAC_PM_BT_F32_HI_BITS) < r) {
    return 0; /* jb 2 */
  }
  return 1;
}

extern "C" int32_t isaac_pm_7db360_eq2(uint32_t soul) {
  /* 0x007db3a6 cmp edx,2 ; 0x007db3a9 sete al — FULL-DWORD equality
     (signed/unsigned agree), the mode < 2 fallback epilogue. */
  return soul == ISAAC_PM_BT_EQ2 ? 1 : 0;
}

extern "C" int32_t isaac_pm_7db360_value(uint32_t soul, uint32_t fatal,
                                         uint32_t mode) {
  /* Whole body: mode < 2 (SIGNED jl at 0x7db372) -> epilogue 0x7db3a6
     (EQ2); mode >= 2 -> the window epilogues 0x7db3a2/0x7db3a5. soul
     is read ONCE (mov edx,[ecx+0x1344] before the mode cmp) and feeds
     BOTH paths — no recapture. */
  if (isaac_pm_7db360_mode_ge2(mode) == 0) {
    return isaac_pm_7db360_eq2(soul);
  }
  return isaac_pm_7db360_window(soul, fatal);
}

/* ===================================================================== */
/* v31 — BU: VA 0x007db3b0 revive-queue body (NARROWED). thiscall,     */
/* plain ret, ZERO stack args, VOID return. 245 insns, 1 ret           */
/* (0x007db699); MSVC SEH frame + cookie; unwind tail [0xb18894]       */
/* @0x7db69a; int3 pad 0x7db6a0..0x7db6ad; next function 0x7db6b0.     */
/* 1 direct E8 caller (0x73f3c6 — per-player loop in a room-wide       */
/* teardown/revive pass, PM-band host). g_Game [0xc71678] +            */
/* Game+0x18300 + 0x1218 container + the 0x41af60 fill stay host; the  */
/* five decision laws below are in-module. The 0x170/0x172 byte entry  */
/* gates are the ONLY byte gates in the body — engage() masks & 0xff;  */
/* the other four laws are FULL-DWORD (zero masking). The [edi+0x13c0] */
/* char stores (0x25/0x1d) are the char_next law applied; the 0x171    */
/* clears, the [0x16b4] store, and the twin/own node-triple cuts +     */
/* transfer stay host.                                                 */
/* ===================================================================== */

extern "C" int32_t isaac_pm_7db3b0_engage(uint32_t flag_172,
                                          uint32_t flag_170) {
  /* 0x007db3da cmp byte ptr [edi + 0x172], 0 ; je 0x7db688 ; 0x7db3e7
     cmp byte ptr [edi + 0x170], 0 ; je 0x7db688 — BYTE compares, both
     gates must be non-zero to proceed past the prologue (the 0x7db688
     epilogue returns void). */
  if ((flag_172 & 0xffu) == 0u) {
    return 0;
  }
  if ((flag_170 & 0xffu) == 0u) {
    return 0;
  }
  return 1;
}

extern "C" int32_t isaac_pm_7db3b0_entry_match(uint32_t entry,
                                               uint32_t type_28,
                                               uint32_t owner_410,
                                               uint32_t self) {
  /* 0x007db437 test ecx,ecx ; je ; 0x007db43b cmp dword [ecx + 0x28],
     3 ; jne ; 0x007db441 cmp dword [ecx + 0x410], edi ; jne — FULL
     DWORD entry != 0 && type == 3 && owner == this (then the walk-hit
     virtual [eax+0x28] runs — host). */
  if (entry == 0u) {
    return 0;
  }
  if (type_28 != ISAAC_PM_BU_TYPE_CMP) {
    return 0;
  }
  if (owner_410 != self) {
    return 0;
  }
  return 1;
}

extern "C" uint32_t isaac_pm_7db3b0_char_next(uint32_t cur) {
  /* 0x007db4b9 mov eax,[edi + 0x13c0] ; 0x007db4c2 sub eax,0x26 ; je
     -> store 0x1d (0x7db4e1) ; 0x007db4c7 sub eax,1 ; jne -> unchanged
     ; else store 0x25 (0x7db4cc) — FULL-DWORD dispatch, exact 0x26 /
     0x27 only. The stored value IS this law applied: no host call
     between the read and the store. */
  if (cur == static_cast<uint32_t>(ISAAC_PM_BU_CHAR_26)) {
    return static_cast<uint32_t>(ISAAC_PM_BU_CHAR_26_NEW);
  }
  if (cur == static_cast<uint32_t>(ISAAC_PM_BU_CHAR_27)) {
    return static_cast<uint32_t>(ISAAC_PM_BU_CHAR_27_NEW);
  }
  return cur;
}

extern "C" uint32_t isaac_pm_7db3b0_node_addr(uint32_t twin_a,
                                              uint32_t twin_b) {
  /* 0x007db470 mov eax,[edi + 0x1e68] ; test / jne pick A ; 0x7db47f
     mov eax,[edi + 0x1e6c] ; test / je none ; 0x007db48c add eax,
     0x20dc — twinA-first pick, +0x20dc 32-bit wrap; both null -> 0
     (the je skips the add). */
  uint32_t picked = twin_a;
  if (picked == 0u) {
    picked = twin_b;
  }
  if (picked == 0u) {
    return 0u;
  }
  return picked + static_cast<uint32_t>(ISAAC_PM_BU_NODE_OFF);
}

extern "C" int32_t isaac_pm_7db3b0_loop_needed(uint32_t local0,
                                               uint32_t local1) {
  /* 0x007db57f mov eax,[ebp-0x18] ; 0x007db584 cmp eax,[ebp-0x10] ;
     0x007db587 je 0x7db61a — FULL-DWORD local0 != local1 runs the
     transfer loop + sized delete + node reviver; equal skips all of
     it (no-twin / not-0x26 leaves {0,0} -> skip). */
  return local0 != local1 ? 1 : 0;
}

extern "C" int32_t isaac_pm_7da770_char_gate(uint32_t char_13c0) {
  /* 0x007da776 cmp eax,3 ; 0x007da779 je 0x7da780 (host path) ;
     0x007da77b cmp eax,0xc ; 0x007da77e jne 0x7da793 (ret ZERO) —
     FULL-DWORD equality dispatch on dword [this+0x13c0]: exact 3
     or 0xc, high bits never match (0x103/0x10c fall to ZERO). */
  return (char_13c0 == ISAAC_PM_BV_CHAR_A ||
          char_13c0 == ISAAC_PM_BV_CHAR_B)
      ? 1
      : 0;
}

extern "C" int32_t isaac_pm_7da770_value(uint32_t char_13c0,
                                         uint32_t has) {
  /* 0x007da787 call 0x7706e0 (HasCollectible(this, 0x26b, false) —
     host sample); 0x007da78c test al,al ; 0x007da78e je 0x7da793 ;
     0x007da790 mov al,1 — the ONLY byte gate in the body (the PE
     tests the AL register), so `has` is narrowed with & 0xff in
     the module (v9 rule: uint32_t param, explicit low-byte mask). */
  if (isaac_pm_7da770_char_gate(char_13c0) == 0) {
    return 0;
  }
  return (has & 0xffu) != 0 ? 1 : 0;
}

extern "C" int32_t isaac_pm_7db6b0_scan_skipped(uint32_t flag_1519) {
  /* PE 0x007db6b3: cmp byte ptr [esi + 0x1519], 0 ; 0x007db6ba jne
     0x7db6e4 (skip the scan) — BYTE test; the body's only byte gate.
     The flag is a uint32_t sample narrowed & 0xff in-module (v9). */
  return (flag_1519 & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_pm_7db6b0_elem_match(uint32_t elem_tag,
                                              uint32_t elem_id) {
  /* PE 0x007db6d2: cmp dword ptr [ecx], 0 ; jne 0x7db6dd (next)
     PE 0x007db6d7: cmp dword ptr [ecx + 4], 0x70 ; je 0x7db6f1
     (return ONE) — FULL-DWORD exact compares on the pointed object:
     tag 0 + sentinel id 0x70 (0x100/0x170 never match; TD's sibling
     scan of the same list field uses the 0x71 sentinel). */
  if (elem_tag != ISAAC_PM_BW_LIST_MATCH_TAG) {
    return 0;
  }
  return elem_id == ISAAC_PM_BW_LIST_MATCH_ID ? 1 : 0;
}

extern "C" int32_t isaac_pm_7db6b0_walk_terminates(uint32_t list_begin,
                                                    uint32_t list_end) {
  /* PE 0x007db6c8 cmp eax,edx (loop guard: walk while eax != edx,
     eax += 0x10 at 0x7db6dd). A wrapped span (end < begin) can never
     converge with +0x10 steps, and a non-multiple-of-0x10 span can
     never land exactly on end — both are treated as no finite walk
     (TD list_walk_terminates discipline, same fields). */
  const int32_t span = static_cast<int32_t>(list_end - list_begin);
  if (span < 0) {
    return 0;
  }
  return (span % ISAAC_PM_BW_LIST_ELEM_STRIDE) == 0 ? 1 : 0;
}

extern "C" int32_t isaac_pm_7db6b0_walk_steps(uint32_t list_begin,
                                               uint32_t list_end) {
  /* Element count of the 0x10-stride walk (the loop body runs once per
     entry); -1 when the span cannot terminate. */
  if (isaac_pm_7db6b0_walk_terminates(list_begin, list_end) == 0) {
    return -1;
  }
  const int32_t span = static_cast<int32_t>(list_end - list_begin);
  return span / ISAAC_PM_BW_LIST_ELEM_STRIDE;
}

extern "C" int32_t isaac_pm_7db6b0_scan_found(const uint32_t* elem_tags,
                                               const uint32_t* elem_ids,
                                               int32_t count) {
  /* The list scan accumulation (PE 0x007db6d0..0x007db6e2): the early
     exit `je 0x7db6f1` fires on the FIRST matching element, so the
     accumulation is an order-independent OR of elem_match over the
     entry objects' tag/id dwords. Empty list (count 0) contributes 0
     — the PE's begin==end `je 0x7db6e4` skips the scan without
     matching. Null arrays are a host contract error -> -1. */
  if (elem_tags == nullptr || elem_ids == nullptr || count <= 0) {
    return -1;
  }
  for (int32_t i = 0; i < count; ++i) {
    if (isaac_pm_7db6b0_elem_match(elem_tags[i], elem_ids[i]) != 0) {
      return 1;
    }
  }
  return 0;
}

extern "C" int32_t isaac_pm_7db6b0_char_gate(uint32_t char_13c0) {
  /* PE 0x007db6e4: cmp dword ptr [esi + 0x13c0], 0x27 ; 0x007db6eb je
     0x7db6f1 (return ONE) — FULL-DWORD equality on the player char
     (+0x13c0 family pin): exact 0x27, high bits never match
     (0x127 falls to ZERO). */
  return char_13c0 == ISAAC_PM_BW_CHAR_CMP ? 1 : 0;
}

extern "C" int32_t isaac_pm_7db6b0_value(uint32_t flag_1519,
                                          uint32_t char_13c0,
                                          const uint32_t* elem_tags,
                                          const uint32_t* elem_ids,
                                          int32_t count) {
  /* Whole-body composition (0x007db6b0..0x007db6f4): the skip byte
     gates the list scan (`jne 0x7db6e4` at 0x7db6ba); the char check
     is POST-MERGE (0x7db6e4) — reached from skip, empty-begin/end,
     and scan-not-found alike, so it runs in EVERY case. A scan_found
     == 1 is the ONLY scan-side ONE path (the -1 contract sentinel
     never counts as a match — invalid lists behave like an empty
     scan, exactly like the PE's begin==end skip). */
  if (isaac_pm_7db6b0_scan_skipped(flag_1519) == 0 &&
      isaac_pm_7db6b0_scan_found(elem_tags, elem_ids, count) == 1) {
    return 1;
  }
  return isaac_pm_7db6b0_char_gate(char_13c0);
}

extern "C" int32_t isaac_pm_7da7a0_arg_gate(uint32_t arg) {
  /* 0x007da7a7 cmp eax,3 ; 0x007da7aa ja 0x7da803 (ONE) — UNSIGNED
     bound: arg > 3 returns ONE BEFORE the slot array read (the body
     indexes [this + (arg+0xac)<<5] only for arg <= 3). FULL-DWORD
     compare, zero masking. */
  return arg > static_cast<uint32_t>(ISAAC_PM_B3_ARG_MAX) ? 1 : 0;
}

extern "C" int32_t isaac_pm_7da7a0_value(uint32_t arg, uint32_t slot,
                                         uint32_t size, uint32_t cfg) {
  /* 0x007da7b7 test esi,esi ; je ONE — FULL-DWORD slot == 0;
     0x007da7cf cmp esi,eax ; jge ONE — SIGNED slot >= size (size =
     (end-begin)>>2 sar, the derived span sample);
     0x007da7d3/0x7da7db/0x7da7e0 cmp slot,0xeb/0x2b/0x3d ; je ONE;
     0x007da7eb test eax,eax ; je ONE — the host cfg sample
     (0x72fd10 GetCollectible) is FULL-DWORD tested;
     0x007da7ef/0x7da7f7 cmp slot,0x248/0x3b ; je ONE; else ZERO.
     The body has ZERO byte gates — nothing is masked here (v9 rule
     applies only to byte-gated inputs). */
  if (isaac_pm_7da7a0_arg_gate(arg) != 0) {
    return 1;
  }
  if (slot == 0u) {
    return 1;
  }
  if (static_cast<int32_t>(slot) >= static_cast<int32_t>(size)) {
    return 1;
  }
  if (slot == static_cast<uint32_t>(ISAAC_PM_B3_ID_SKIP_A) ||
      slot == static_cast<uint32_t>(ISAAC_PM_B3_ID_SKIP_B) ||
      slot == static_cast<uint32_t>(ISAAC_PM_B3_ID_SKIP_C)) {
    return 1;
  }
  if (cfg == 0u) {
    return 1;
  }
  if (slot == static_cast<uint32_t>(ISAAC_PM_B3_ID_SKIP_D) ||
      slot == static_cast<uint32_t>(ISAAC_PM_B3_ID_SKIP_E)) {
    return 1;
  }
  return 0;
}

extern "C" int32_t isaac_pm_7dac30_value(uint32_t v194c, uint32_t v1348,
                                         uint32_t v1344, uint32_t v1d88,
                                         uint32_t v134c, uint32_t v1da4) {
  /* 0x007dac30 cmp dword [this+0x194c],0 ; jg ONE ;
     0x007dac39 cmp dword [this+0x1348],0 ; jg ONE — SIGNED > 0;
     0x007dac48 test edx,edx ; jle 0x7dac5c — v1344 <= 0 skips the mid
     gate; 0x007dac52 add eax,[this+0x134c] — 32-bit WRAP sum ;
     0x007dac58 test eax,eax ; jg ONE — SIGNED > 0;
     0x007dac5c sub edx,[this+0x1da4] — wrapped sub ; 0x007dac62 cmp
     edx,1 ; jg ONE — SIGNED > 1;
     0x007dac6d add — fresh loads of the SAME samples (no store
     between) ; 0x007dac73 cmp eax,1 ; jg ONE — SIGNED > 1; else
     ZERO. Every gate FULL-DWORD SIGNED — zero byte gates. */
  if (static_cast<int32_t>(v194c) > 0) {
    return 1;
  }
  if (static_cast<int32_t>(v1348) > 0) {
    return 1;
  }
  if (static_cast<int32_t>(v1344) > 0 &&
      static_cast<int32_t>(v1d88 + v134c) > 0) {
    return 1;
  }
  if (static_cast<int32_t>(v1344 - v1da4) > 1) {
    return 1;
  }
  if (static_cast<int32_t>(v1d88 + v134c) > 1) {
    return 1;
  }
  return 0;
}

/* ===================================================================== */
/* v35 — B9: VA 0x007daff0 flag/effect decision island (NARROWED).      */
/* thiscall, ret plain, void; 67 insns, 2 E8 (0x7cb6e0 count resolver + */
/* 0x930220 effect add — BOTH stay host), 2 observable stores (byte     */
/* [this+0x1eec] at 0x7db01f and 0x7db089 — unconditional overwrite,    */
/* unlike B10/B11/B12). Pure laws transcribed from the instruction      */
/* stream (disasm-007daff0.txt); the count sample, the effect call,     */
/* and the store stay host by contract.                                 */
/* ===================================================================== */

extern "C" int32_t isaac_pm_7daff0_flag_value(int32_t count) {
  /* 0x007db005 sub eax,0 ; je 0x7db087 (count==0 -> store 0x00) ;
     0x007db00a sub eax,1 ; je 0x7db018 (count==1 -> al=0x10) ;
     else al=0x20 (0x7db014). FULL-DWORD equality dispatch. */
  if (count == 0) return ISAAC_PM_B9_FLAG_NONE;
  if (count == 1) return ISAAC_PM_B9_FLAG_SINGLE;
  return ISAAC_PM_B9_FLAG_MULTI;
}

extern "C" int32_t isaac_pm_7daff0_loop_iters(int32_t count) {
  /* 0x007db00f mov esi,2 (count>=2) / 0x007db018 mov esi,1 (count==1) ;
     0x007db07b sub esi,1 / 0x007db07e jne 0x7db025 — the effect loop
     runs esi times; count==0 never reaches the loop. */
  if (count == 0) return 0;
  if (count == 1) return ISAAC_PM_B9_LOOP_SINGLE;
  return ISAAC_PM_B9_LOOP_MULTI;
}

extern "C" int32_t isaac_pm_7daff0_size_gate(uint32_t begin, uint32_t end) {
  /* 0x007db036 sub eax,ecx (32-bit wrap) ; 0x007db038 and eax,~3 ;
     0x007db03b cmp eax,0x4e4 ; 0x007db040 jle 0x7db07b — SIGNED <=
     skips the effect call, so the gate is SIGNED size > 0x4e4.
     wasm32 compare-flip class: the (int32_t) cast makes the wasm
     build emit the i64 sign-extend compare (precedent: the v26 BF
     size_gate, the room-v73 rule). */
  const uint32_t size = (end - begin) & 0xfffffffcu;
  return static_cast<int32_t>(size) > ISAAC_PM_B9_SIZE_CMP ? 1 : 0;
}

extern "C" int32_t isaac_pm_7daff0_host_needed(uint32_t begin, uint32_t end,
                                               uint32_t slot) {
  /* 0x007db042 mov eax,[ecx+0x4e4] ; 0x007db048 test eax,eax ;
     0x007db04a je 0x7db07b — the effect call runs iff SIGNED size
     > 0x4e4 AND slot = [begin + 0x4e4] != 0 (FULL-DWORD). */
  return isaac_pm_7daff0_size_gate(begin, end) != 0 && slot != 0u ? 1 : 0;
}

/* ---------- v37 FB: PlayerManager::FirstBirthrightOwner 0x009bf930
   owner-walk decisions (EXACT ZHL 14 B; 1 E8 -> 0x7706e0 HUD-family
   HasCollectible-shaped host sample, stays host; 0 stores; ret 4;
   8 callers; the returned player pointer stays host data). ---------- */

extern "C" int32_t isaac_pm_9bf930_walk_terminates(uint32_t list_begin,
                                                    uint32_t list_end) {
  /* PE 0x009bf93e cmp esi,[ebx+4] (loop guard: walk while esi != end,
     esi += 4 at 0x9bf968; end RE-READ every iteration at 0x9bf96b).
     A wrapped span (end < begin) can never converge with +4 steps,
     and a non-multiple-of-4 span can never land exactly on end —
     both are treated as no finite walk (TD/BW list_walk_terminates
     discipline, stride 4). */
  const int32_t span = static_cast<int32_t>(list_end - list_begin);
  if (span < 0) {
    return 0;
  }
  return (span % ISAAC_PM_FB_LIST_ELEM_STRIDE) == 0 ? 1 : 0;
}

extern "C" int32_t isaac_pm_9bf930_walk_steps(uint32_t list_begin,
                                               uint32_t list_end) {
  /* Slot count of the 4-stride walk (the loop body runs once per
     player); -1 when the span cannot terminate. */
  if (isaac_pm_9bf930_walk_terminates(list_begin, list_end) == 0) {
    return -1;
  }
  const int32_t span = static_cast<int32_t>(list_end - list_begin);
  return span / ISAAC_PM_FB_LIST_ELEM_STRIDE;
}

extern "C" int32_t isaac_pm_9bf930_slot_eligible(uint32_t state_2c,
                                                 int32_t char_13c0,
                                                 int32_t type) {
  /* PE 0x009bf945: cmp dword ptr [edi + 0x2c], 0 ; jne 0x9bf968 (next)
     PE 0x009bf94e: cmp dword ptr [edi + 0x13c0], eax ; jne 0x9bf968 —
     BOTH FULL-DWORD equality gates (eax = [ebp+8], the `unsigned int
     type` arg; high bits never match: 0x127 != 0x27). */
  if (state_2c != 0u) {
    return 0;
  }
  return char_13c0 == type ? 1 : 0;
}

extern "C" int32_t isaac_pm_9bf930_probe_match(uint32_t has_26b) {
  /* PE 0x009bf964: test al,al ; 0x009bf966 jne 0x9bf97b (FOUND) — the
     body's ONLY byte gate: the low byte of the 0x7706e0 host sample
     (HasCollectible(this, 0x26b, false) — HUD-family
     HasCollectible-shaped leaf, typed host sample, stays host). v9:
     uint32_t param with an explicit & 0xff mask, zero uint8_t. */
  return (has_26b & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_pm_9bf930_scan_found(const uint32_t* states,
                                               const uint32_t* chars,
                                               const uint32_t* has,
                                               int32_t type,
                                               int32_t count) {
  /* The owner-walk accumulation (PE 0x009bf943..0x009bf966): the
     early exit `jne 0x9bf97b` (FOUND) fires on the FIRST winning
     player, so the accumulation is an order-independent OR of
     (slot_eligible && probe_match) over the player-list slots — the
     probe sample for an ineligible slot is never consulted, exactly
     like the PE (the call runs only after both gates pass). Empty
     list (count 0) contributes 0 — the PE's begin==end `je 0x9bf970`
     skips the scan without matching. Null arrays are a host contract
     error -> -1 (BW scan_found discipline). */
  if (states == nullptr || chars == nullptr || has == nullptr ||
      count <= 0) {
    return -1;
  }
  for (int32_t i = 0; i < count; ++i) {
    if (isaac_pm_9bf930_slot_eligible(states[i], chars[i], type) == 0) {
      continue;
    }
    if (isaac_pm_9bf930_probe_match(has[i]) != 0) {
      return 1;
    }
  }
  return 0;
}

extern "C" int32_t isaac_pm_9bf930_owner_found(uint32_t list_begin,
                                                uint32_t list_end,
                                                const uint32_t* states,
                                                const uint32_t* chars,
                                                const uint32_t* has,
                                                int32_t type,
                                                int32_t count) {
  /* Whole-body composition (0x009bf930..0x009bf983): the walked slot
     count comes from the bounds — begin==end (steps 0) skips the
     walk (`je 0x9bf970` -> NULL, no probe runs, regardless of the
     arrays); a non-terminating span (steps -1) never converges; the
     scan covers min(count, steps) sampled slots — a scan_found == 1
     is the ONLY FOUND-side ONE path (the -1 contract sentinel never
     counts as a match — invalid lists behave like an empty scan,
     exactly like the PE's begin==end skip). */
  const int32_t steps = isaac_pm_9bf930_walk_steps(list_begin, list_end);
  if (steps < 0 || steps == 0) {
    return 0;
  }
  const int32_t n = count < steps ? count : steps;
  return isaac_pm_9bf930_scan_found(states, chars, has, type, n) == 1 ? 1
                                                                     : 0;
}

/* ===================================================================== */
/* v38 — B18: VA 0x007db8d0 mode-dispatch resolver (NARROWED — the      */
/* mode-scan chain 0x7db860 -> 0x4288a0 and the GetPlayer-style fatal   */
/* 0xa112c0 stay host; g_Game [0xc71678] / count [Game+0x1bb88] stay    */
/* host samples). thiscall, ret plain, int32 result consumed as a       */
/* full-dword value (14 direct rel32 callers). 152 insns, 13 E8 (1 real */
/* edge 0x7db860 + 7 cookie checks 0xaef12b + 2 fatals 0xa112c0 + 3 in  */
/* the next function), 1 indirect (jump table 0x7dba10), 2 mem-stores   */
/* (BOTH stack locals — ZERO observable). Pure laws transcribed from    */
/* the instruction stream (disasm-007db8d0.txt); the mode sample, the   */
/* count sample, and the fatal stay host by contract.                   */
/* ===================================================================== */

extern "C" int32_t isaac_pm_7db8d0_fast_gate(uint32_t mode) {
  /* 0x007db8e9 cmp esi,7 ; 0x007db8ec ja 0x7db987 — UNSIGNED mode > 7
     takes the slow path, so the fast gate is mode <= 7u (the wasm32
     unsigned compare; this body has NO signed compare class). */
  return mode <= ISAAC_PM_B18_FAST_MAX ? 1 : 0;
}

extern "C" int32_t isaac_pm_7db8d0_fast_value(uint32_t mode) {
  /* 0x007db8f2 jmp dword ptr [esi*4 + 0x7dba10] — the 8-entry jump
     table {0x7db8f9,0x7db8f9,0x7db90c,0x7db91e,0x7db933,0x7db948,
     0x7db95d,0x7db972} returns -1,-1,0,1,2,3,4,5 (entries 0 AND 1
     BOTH -> -1). Meaningful only when fast_gate(mode); totalized to 0
     for mode > 7 (the table is never indexed there). */
  switch (mode) {
    case 0:
    case 1:
      return ISAAC_PM_B18_TABLE_0;
    case 2:
      return ISAAC_PM_B18_TABLE_2;
    case 3:
      return ISAAC_PM_B18_TABLE_3;
    case 4:
      return ISAAC_PM_B18_TABLE_4;
    case 5:
      return ISAAC_PM_B18_TABLE_5;
    case 6:
      return ISAAC_PM_B18_TABLE_6;
    case 7:
      return ISAAC_PM_B18_TABLE_7;
    default:
      return 0;
  }
}

extern "C" int32_t isaac_pm_7db8d0_slow_fatal(uint32_t count) {
  /* 0x007db993 test eax,eax ; 0x007db995 jne 0x7db9ac — slow path only:
     count == 0 pushes 0xb1c640 ("Error: Game Start Seed was not
     set.\n") + 0x10 and calls the GetPlayer-style fatal 0xa112c0 (stays
     host by contract; the count is RE-READ at 0x7db9a3 after the
     call). FULL-DWORD zero test (0x80000000 is NOT fatal). */
  return count == 0u ? 1 : 0;
}

extern "C" int32_t isaac_pm_7db8d0_slow_hash(uint32_t count, uint32_t mode) {
  /* 0x007db9b4 add eax,esi (32-bit wrap) ; 0x007db9c1 cmp eax,1 ;
     0x007db9c8 cmova esi,eax — v = (count+mode > 1u) ? count+mode : 1
     (UNSIGNED cmova; max(1, sum)). Then the xor-shift chain with the
     TRUE constants at [0xb1f57c..0xb1f584] = 2, 15, 17 (x86 masks the
     shift counts to 5 bits):
       t = (v >> 2) ^ v ; u = (t << 15) ^ t ; w = (u >> 17) ^ u ;
       result = (w & 3) + 2         (0x7db9df..0x7dba06 fold arm)
     The 0x7db9cb..0x7db9de arm (test esi,esi ; "RNG Seed is zero!"
     fatal ; int3) is DEAD — max(1,·) >= 1 — recorded, not wired. */
  const uint32_t sum = count + mode;
  const uint32_t v = sum > 1u ? sum : 1u;
  const uint32_t t = (v >> 2) ^ v;
  const uint32_t u = (t << 15) ^ t;
  const uint32_t w = (u >> 17) ^ u;
  return (int32_t)((w & 3u) + 2u);
}

extern "C" int32_t isaac_pm_7db8d0_value(uint32_t mode, uint32_t count) {
  /* Whole-body composition: the fast dispatch (0x7db8f2) happens
     BEFORE any Game access — the fast path NEVER reads the count; the
     slow path folds the count sample (the count==0 fatal stays host
     and the count is re-read at 0x7db9a3). 0x7db987..0x7dba0e. */
  return isaac_pm_7db8d0_fast_gate(mode) != 0
             ? isaac_pm_7db8d0_fast_value(mode)
             : isaac_pm_7db8d0_slow_hash(count, mode);
}

extern "C" int32_t isaac_pm_7db8d0_host_needed(uint32_t mode, uint32_t count) {
  /* The Game-Start-Seed fatal 0xa112c0 runs iff the slow path is taken
     AND count == 0 (test eax,eax / jne — FULL-DWORD). The composed
     host-fatal decision; the call itself stays host. */
  return mode > ISAAC_PM_B18_FAST_MAX && count == 0u ? 1 : 0;
}

/* ===================================================================== */
/* v40 — B20: VA 0x007dbba0 RNG-item-pick + EffectAdd (NARROWED — the   */
/* lazy-init "RNG Seed is zero!" log 0xa112c0, GetCollectible 0x72fd10, */
/* EffectAdd 0x930220 and the cookie check 0xaef12b stay host; g_Game   */
/* [0xc71678]/[0xc7169c], mode [Game+0x26614], and the RNG struct       */
/* dwords at [*(this+0x177c) + 0x840 + {0,4,8,0xc}] stay host samples). */
/* thiscall, ret plain, SIDE-EFFECT call (2 direct rel32 callers,       */
/* 0x7a848b + 0x7ad962, return unused). 68 insns, 4 E8, 0 indirect,     */
/* 9 mem-stores (7 stack locals + 2 OBSERVABLE: dword [esi] new RNG     */
/* state 0x7dbc13, dword [edi+0x2edc] sampled id 0x7dbc60 iff mode>=2). */
/* Pure laws transcribed from the instruction stream                    */
/* (disasm-007dbba0.txt); the RNG samples, the mode sample, and the     */
/* host calls stay host by contract.                                    */
/* ===================================================================== */

extern "C" int32_t isaac_pm_7dbba0_rng_needs_init(uint32_t state) {
  /* 0x007dbbd8 test edx,edx ; 0x007dbbda jne 0x7dbbf2 — FULL-DWORD
     zero test: state == 0 runs the lazy-init fail path (0xa112c0 log
     "RNG Seed is zero!" with 0x10, then the state is RE-READ at
     0x7dbbe8; still 0 -> int3). The log + int3 stay host by
     contract. 0x80000000 is NOT init-needed. */
  return state == 0u ? 1 : 0;
}

extern "C" uint32_t isaac_pm_7dbba0_rng_next(uint32_t state, uint32_t c1,
                                             uint32_t c2, uint32_t c3) {
  /* 0x007dbbf2..0x007dbc11 — the family three-step xorshift (SAME
     chain as the PMP global 0x956830 / TD record 0x7a2100):
       x ^= x >> (c1 & 31); x ^= x << (c2 & 31); x ^= x >> (c3 & 31)
     x86 shr/shl mask cl to 5 bits, so the (c & 31) masks are the
     hardware behavior, not a narrowing choice. state == 0 is a fixed
     point of the chain but the PE never executes it on a zero state
     (rng_needs_init precedes it) — recorded, not special-cased.
     The result is stored at 0x7dbc13 [p] = new state. */
  return isaac_pm_pre_play_rng_next(state, c1, c2, c3);
}

extern "C" int32_t isaac_pm_7dbba0_sample_index(uint32_t state) {
  /* 0x007dbc15 and eax,7 — the BYTE-gate class (mask width 3 bits;
     v9 rule: uint32_t param, explicit low-bit mask in the body).
     Applies to the NEW state (the and runs after the store). */
  return static_cast<int32_t>(state & ISAAC_PM_B20_IDX_MASK);
}

extern "C" uint32_t isaac_pm_7dbba0_sample_value(const uint32_t* table8,
                                                 int32_t index) {
  /* 0x007dbc1e mov esi,[ebp+eax*4-0x24] — the 8 dwords of the two
     16-byte .rdata constants at [0xbab750]/{0xd,0xe,0xf0,0x46} and
     [0xbab8f0]/{0x8f,0x159,0x1ed,0x1f0} (TRUE bytes; the exe reads
     them via movaps/movups into the locals). The PE index is always
     sample_index(new) in 0..7 (and eax,7); null table8 -> 0 (host
     contract) and out-of-range index -> 0 (totalized, mirror B18
     fast_value). */
  if (table8 == nullptr) {
    return 0u;
  }
  if (index < 0 || index > 7) {
    return 0u;
  }
  return table8[index];
}

extern "C" int32_t isaac_pm_7dbba0_store_gate(uint32_t mode) {
  /* 0x007dbc57 cmp dword ptr [eax + 0x26614],2 ; 0x007dbc5e jl
     0x7dbc66 — SIGNED mode < 2 skips the store. Same gate sense as
     isaac_pm_7db330_mode_ge2 / isaac_pm_ght_hard_gate /
     isaac_pm_global_fatal_scale (the family-wide Game+0x26614 field);
     wasm32 signed compare. mode = [g_Game + 0x26614] host sample. */
  return static_cast<int32_t>(mode) >= ISAAC_PM_B20_MODE_CMP ? 1 : 0;
}

extern "C" uint32_t isaac_pm_7dbba0_update(uint32_t state, uint32_t c1,
                                           uint32_t c2, uint32_t c3,
                                           const uint32_t* table8) {
  /* Whole-body composition — the sampled collectible id v: on
     state == 0 rows the PE runs the host lazy-init path and the
     chain never executes (the 0 return is a documented totalization;
     rng_needs_init is the authoritative branch decision). Otherwise
     v = table8[sample_index(rng_next(state, c1, c2, c3))]. mode does
     NOT feed v — the conditional [this+0x2edc] = v store decision is
     store_gate(mode); the GetCollectible(v) / EffectAdd host calls
     stay host. */
  if (isaac_pm_7dbba0_rng_needs_init(state) != 0) {
    return 0u;
  }
  const uint32_t next = isaac_pm_7dbba0_rng_next(state, c1, c2, c3);
  return isaac_pm_7dbba0_sample_value(
      table8, isaac_pm_7dbba0_sample_index(next));
}

/* =====================================================================
 * v39 — B19 0x7dba30 (item-278 flag gate) — 7 exports.
 * Byte-level oracle: emulate-b19.py (38,213 rows, 0 mismatches).
 */

static const uint8_t kPmB19ByteTable[ISAAC_PM_B19_TABLE_BYTES] = {
  0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x01,
  0x01, 0x01, 0x01, 0x00, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00,
  0x00, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01,
  0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
  0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x01, 0x01, 0x01,
  0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x01, 0x01, 0x01,
  0x00, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
  0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
  0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
  0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00,
  0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
  0x01, 0x00, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
  0x01, 0x01, 0x01, 0x00, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
  0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
  0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01,
  0x01, 0x01, 0x00
};

extern "C" int32_t isaac_pm_7dba30_has_item(uint32_t has_278,
                                            uint32_t has_278_effect) {
  /* 0x7dba45 test al,al / jne skip ; 0x7dba59 test al,al / je ZERO —
     TWO byte gates on the host samples (0x7706e0 / 0x9305f0), v9
     rule: & 0xff. */
  return ((has_278 & 0xffu) != 0u || (has_278_effect & 0xffu) != 0u)
             ? 1
             : 0;
}

extern "C" int32_t isaac_pm_7dba30_effect_probe_runs(uint32_t has_278) {
  /* 0x7dba47 jne 0x7dba5d — the 0x9305f0 sample runs ONLY when the
     0x7706e0 sample is false (byte gate). */
  return (has_278 & 0xffu) == 0u ? 1 : 0;
}

extern "C" int32_t isaac_pm_7dba30_special_case(uint32_t arg0) {
  /* 0x7dba60 cmp eax,0x21 ; 0x7dba65 je 0x7dbad7 — FULL-DWORD; the
     immediate-ONE dispatch (no store, no state read on this path). */
  return arg0 == static_cast<uint32_t>(ISAAC_PM_B19_CASE_21) ? 1 : 0;
}

extern "C" int32_t isaac_pm_7dba30_table_index(uint32_t arg1) {
  /* 0x7dbaa8 mov eax,[ebp+0xc] ; add eax,-0x16 ; cmp eax,0xb6 ;
     ja 0x7dba7a (UNSIGNED) ; movzx eax, byte [eax+0x7dbae8]. The
     sampled movzx value; -1 outside the 183-entry domain. */
  const uint32_t t = static_cast<uint32_t>(arg1) -
                     static_cast<uint32_t>(ISAAC_PM_B19_CASE_3E8_ID_BASE);
  if (t > static_cast<uint32_t>(ISAAC_PM_B19_TABLE_BOUND)) {
    return -1;
  }
  return kPmB19ByteTable[t];
}

extern "C" int32_t isaac_pm_7dba30_bl(uint32_t arg0, uint32_t arg1) {
  /* The dispatch bl decision:
       (int32)arg0 > 0x21 (SIGNED jg — wasm32 compare-flip class;
         NOTE: the signed/unsigned choice is behaviorally EQUIVALENT
         here — negative arg0 lands on the default in both variants,
         the oracle verified — the law keeps the PE's SIGNED form)
         -> arg0 == 0x3e8 ? byte-table-bl : 0
       arg0 == 0 -> (arg1 == 0x2710); arg0 == 9 -> (arg1 == 2)
       else 0.
     byte-table-bl: t = (arg1 - 0x16) u32; t <= 0xb6u -> (table[t]==0);
     the {0x7dba78, 0x7dba7a} jump table maps 0 -> bl=1, 1 -> bl=0. */
  const uint32_t a = static_cast<uint32_t>(arg0);
  const uint32_t b = static_cast<uint32_t>(arg1);
  if (static_cast<int32_t>(a) > static_cast<int32_t>(ISAAC_PM_B19_CASE_21)) {
    if (a == 0x3e8u) {
      const uint32_t t = b - static_cast<uint32_t>(ISAAC_PM_B19_CASE_3E8_ID_BASE);
      if (t <= static_cast<uint32_t>(ISAAC_PM_B19_TABLE_BOUND)) {
        return kPmB19ByteTable[t] == 0u ? 1 : 0;
      }
    }
    return 0;
  }
  if (a == 0u) {
    return b == static_cast<uint32_t>(ISAAC_PM_B19_CASE_0_ID) ? 1 : 0;
  }
  if (a == 9u) {
    return b == static_cast<uint32_t>(ISAAC_PM_B19_CASE_9_ID) ? 1 : 0;
  }
  return 0;
}

extern "C" int32_t isaac_pm_7dba30_flag_store(uint32_t has_278,
                                              uint32_t has_278_effect,
                                              uint32_t arg0, uint32_t arg1,
                                              uint32_t state_26d4) {
  /* The value written to [this+0x26d4] (-1 = no store). STORE 1 runs
     iff the flag byte is nonzero OR bl is set (0x7dba81 jne /
     0x7dba85 jne); otherwise the STORE-0 path writes bl==0. No store
     when !has_item or arg0 == 0x21. The store itself stays host. */
  if (isaac_pm_7dba30_has_item(has_278, has_278_effect) == 0) {
    return -1;
  }
  if (static_cast<uint32_t>(arg0) == static_cast<uint32_t>(ISAAC_PM_B19_CASE_21)) {
    return -1;
  }
  const int32_t bl = isaac_pm_7dba30_bl(arg0, arg1);
  if ((state_26d4 & 0xffu) != 0u || bl != 0) {
    return 1;
  }
  return 0;
}

extern "C" int32_t isaac_pm_7dba30_result(uint32_t has_278,
                                          uint32_t has_278_effect,
                                          uint32_t arg0, uint32_t arg1,
                                          uint32_t state_26d4,
                                          int32_t state_26d0) {
  /* Whole-body bool: !has_item -> ZERO; arg0 == 0x21 -> ONE; else bl
     dispatch; flag gate (byte [0x26d4] != 0 or bl) -> STORE 1, then
     bl == 0 -> ZERO, (int32)[0x26d0] >= 0x1e (SIGNED jge) -> ZERO,
     ONE; the STORE-0 path returns ZERO. */
  if (isaac_pm_7dba30_has_item(has_278, has_278_effect) == 0) {
    return 0;
  }
  if (static_cast<uint32_t>(arg0) == static_cast<uint32_t>(ISAAC_PM_B19_CASE_21)) {
    return 1;
  }
  const int32_t bl = isaac_pm_7dba30_bl(arg0, arg1);
  if ((state_26d4 & 0xffu) == 0u && bl == 0) {
    return 0;
  }
  if (bl == 0) {
    return 0;
  }
  if (state_26d0 >= static_cast<int32_t>(ISAAC_PM_B19_COUNT_CMP)) {
    return 0;
  }
  return 1;
}

/* =====================================================================
 * v39 — B21 0x7dbc80 (RNG 13-slot pick) — 7 exports.
 * Byte-level oracle: emulate-b21.py (23,000 rows, 0 mismatches).
 */

extern "C" int32_t isaac_pm_7dbc80_rng_seed_zero(uint32_t seed) {
  /* 0x7dbcca test edx,edx ; jne skip — FULL-DWORD; the 0xa112c0
     fatal decision (td_rng_seed_zero precedent). */
  return seed == 0u ? 1 : 0;
}

extern "C" int32_t isaac_pm_7dbc80_rng_seed_still_zero(
    uint32_t seed_reloaded) {
  /* 0x7dbcdd test edx,edx ; jne skip ; int3 — the int3 arm after the
     fatal re-read (recorded, not wired; td_rng_seed_still_zero
     precedent). */
  return seed_reloaded == 0u ? 1 : 0;
}

extern "C" uint32_t isaac_pm_7dbc80_rng_next(uint32_t seed,
                                             uint32_t shift1,
                                             uint32_t shift2,
                                             uint32_t shift3) {
  /* The three-step xorshift128 chain (shr/shl mask cl to 5 bits —
     the x86 hardware mask; same kernel as the PMP/TD rng_next laws):
     a = (seed >> s1) ^ seed; a = (a << s2) ^ a; a = (a >> s3) ^ a. */
  uint32_t a = seed;
  a ^= a >> (shift1 & static_cast<uint32_t>(ISAAC_PM_B21_SHIFT_MASK));
  a ^= a << (shift2 & static_cast<uint32_t>(ISAAC_PM_B21_SHIFT_MASK));
  a ^= a >> (shift3 & static_cast<uint32_t>(ISAAC_PM_B21_SHIFT_MASK));
  return a;
}

extern "C" int32_t isaac_pm_7dbc80_pick_index(uint32_t state_next) {
  /* 0x7dbd08 div ecx with ecx = 0xd — UNSIGNED remainder; the ONLY
     selection arithmetic (13 slots). */
  return static_cast<int32_t>(state_next %
                              static_cast<uint32_t>(ISAAC_PM_B21_PICK_DIVISOR));
}

extern "C" int32_t isaac_pm_7dbc80_pick_value(uint32_t index) {
  /* The 13-slot pick table: 12 .rdata dwords (0xbab6f0/0xbab810/
     0xbab900) + the [ebp-8] = 0x2dc slot; totalized 0 outside the
     domain (the table is never indexed there). */
  static const uint32_t kTable[ISAAC_PM_B21_PICK_SLOTS] = {
      0x1d, 0x1e, 0x1f, 0x37, 0x6e, 0x72, 0xc7,
      0xc8, 0xd9, 0xe4, 0x163, 0x1fc, 0x2dc};
  if (index >= static_cast<uint32_t>(ISAAC_PM_B21_PICK_SLOTS)) {
    return 0;
  }
  return static_cast<int32_t>(kTable[index]);
}

extern "C" int32_t isaac_pm_7dbc80_store_gate(int32_t game_26614) {
  /* 0x7dbd4f cmp [eax+0x26614],2 ; 0x7dbd56 jl skip — SIGNED (the
     family-wide timedTransitionCleanupMode gate, BS/BT/GF precedent)
     deciding the [this+0x2ee0] = pick store. */
  return game_26614 >= static_cast<int32_t>(ISAAC_PM_B21_MODE_CMP) ? 1 : 0;
}

extern "C" int32_t isaac_pm_7dbc80_pick(uint32_t seed, uint32_t shift1,
                                        uint32_t shift2, uint32_t shift3) {
  /* Whole-body composition: pick_value(rng_next(...) % 13). */
  return isaac_pm_7dbc80_pick_value(static_cast<uint32_t>(
      isaac_pm_7dbc80_pick_index(
          isaac_pm_7dbc80_rng_next(seed, shift1, shift2, shift3))));
}

/* =====================================================================
 * v39 — B22 0x7dbd70 (RNG revive tail) — 7 exports.
 * Byte-level oracle: emulate-b22.py (21,552 rows, 0 mismatches).
 */

extern "C" int32_t isaac_pm_7dbd70_rng_seed_zero(uint32_t seed) {
  /* 0x7dbdbc test edx,edx ; jne skip — FULL-DWORD fatal decision. */
  return seed == 0u ? 1 : 0;
}

extern "C" int32_t isaac_pm_7dbd70_rng_seed_still_zero(
    uint32_t seed_reloaded) {
  /* 0x7dbdd1 test edx,edx ; jne skip ; int3 — int3 arm, recorded. */
  return seed_reloaded == 0u ? 1 : 0;
}

extern "C" uint32_t isaac_pm_7dbd70_rng_next(uint32_t seed,
                                             uint32_t shift1,
                                             uint32_t shift2,
                                             uint32_t shift3) {
  /* Same xorshift128 kernel as B21 (shift counts masked & 31). */
  uint32_t a = seed;
  a ^= a >> (shift1 & static_cast<uint32_t>(ISAAC_PM_B22_SHIFT_MASK));
  a ^= a << (shift2 & static_cast<uint32_t>(ISAAC_PM_B22_SHIFT_MASK));
  a ^= a >> (shift3 & static_cast<uint32_t>(ISAAC_PM_B22_SHIFT_MASK));
  return a;
}

extern "C" int32_t isaac_pm_7dbd70_push_grow(uint32_t vec_end,
                                             uint32_t vec_cap) {
  /* 0x7dbd8e mov eax,[ecx+4] ; cmp eax,[ecx+8] ; je grow — FULL-DWORD
     end == cap decides the 0x428590 grow call vs the inline slot push
     (the pushed value is the CONSTANT 0x7dbe70). */
  return vec_end == vec_cap ? 1 : 0;
}

extern "C" int32_t isaac_pm_7dbd70_cfg_gate(uint32_t cfg) {
  /* 0x7dbe26 test eax,eax ; je skip — FULL-DWORD; the 0x72fd10 result
     gate for the whole tail (or-flag store, 0x1518 store, AddCostume,
     game scan). */
  return cfg != 0u ? 1 : 0;
}

extern "C" int32_t isaac_pm_7dbd70_costume_gate(uint32_t cfg_b2) {
  /* 0x7dbe3a cmp byte [eax+0xb2],0 ; je skip — the body's ONLY byte
     gate (v9 rule: & 0xff), deciding the 0x75d1d0 AddCostume call. */
  return (cfg_b2 & 0xffu) != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_pm_7dbd70_flag_1574(uint32_t flag_1574,
                                              uint32_t cfg_54) {
  /* 0x7dbe2a mov ecx,[eax+0x54] ; 0x7dbe2d or [esi+0x1574],ecx — the
     OR-store exported as the stored value (B5/B11 precedent; the
     field is the family URH FLAG_1574 pin). */
  return static_cast<uint32_t>(flag_1574) |
         static_cast<uint32_t>(cfg_54);
}

/* ===================================================================== */
/* v41 — B23: VA 0x007dbe70 revive-queue predicate (FULLY PURE — the   */
/* band closer: 0x7dba30..0x7dbe70 is now closed end-to-end; the only  */
/* remaining 0x7dbe70 refs elsewhere are B22's vec-slot VALUE pin).    */
/* cdecl callback, ONE stack arg at [ebp+8] (object pointer), plain    */
/* ret, bool in al; 0 direct rel32 callers — the room-container vec    */
/* {begin,end} at [0xc7169c+0x2a508..0x2a50c] carries the address      */
/* (B22 pushes the CONSTANT 0x7dbe70) and the 0x7301xx consumer calls  */
/* slot(obj) with `push ebx; call eax; add esp,4`, testing al, aborting */
/* the walk on FALSE. 23 insns, 2 rets, 0 E8, 0 indirect, 0 mem-stores */
/* — the whole body lands in-module (the first fully-pure body since   */
/* v34 B5 / v33 BW). Laws transcribed from the instruction stream      */
/* (disasm-007dbe70.txt); the object pointer stays host data — only    */
/* its two dwords enter the laws as scalar samples.                    */
/* ===================================================================== */

extern "C" int32_t isaac_pm_7dbe70_type_special(uint32_t type) {
  /* 0x007dbe7b cmp eax,1 ; 0x007dbe7e je 0x7dbe8a ; 0x007dbe80 cmp
     eax,3 ; 0x007dbe83 je 0x7dbe8a ; 0x007dbe85 cmp eax,4 ;
     0x007dbe88 jne 0x7dbea0 — FULL-DWORD exact-equality dispatch
     (the ONLY branch class in the body; the B19 jg equivalence
     finding does not apply — there is no range compare). */
  const uint32_t t = static_cast<uint32_t>(type);
  return (t == static_cast<uint32_t>(ISAAC_PM_B23_TYPE_CMP_1) ||
          t == static_cast<uint32_t>(ISAAC_PM_B23_TYPE_CMP_3) ||
          t == static_cast<uint32_t>(ISAAC_PM_B23_TYPE_CMP_4))
             ? 1
             : 0;
}

extern "C" int32_t isaac_pm_7dbe70_flags_bit(uint32_t flags) {
  /* 0x007dbe90 and eax,0x1000000 ; 0x007dbe95 or eax,0 (MSVC
     flag-recompute) ; 0x007dbe98 jne 0x7dbea0 — the body's ONLY
     gate: FULL-DWORD bit-24 mask test, NOT a byte gate (the & 0xff
     v9 rule has nothing to widen here — documented). */
  return (static_cast<uint32_t>(flags) &
          static_cast<uint32_t>(ISAAC_PM_B23_FLAGS_BIT)) != 0u
             ? 1
             : 0;
}

extern "C" int32_t isaac_pm_7dbe70_result(uint32_t type, uint32_t flags) {
  /* Whole-body composition: special types pass iff the bit-24 flag
     is set; all other types always pass. The flags dword at [obj+0xb8]
     is NOT read on non-special types in the PE (the read at 0x7dbe8a
     is on the special path only) — the law models exactly that
     reachability (probe-count contract). */
  if (isaac_pm_7dbe70_type_special(type) == 0) {
    return 1;
  }
  return isaac_pm_7dbe70_flags_bit(flags);
}

/* ===================================================================== */
/* v42 — VEC: outlined container-cursor leaves (both FULLY PURE).        */
/* V42-A 0x007dc610: mov eax,[ecx] ; mov [ecx+4],eax ; ret — the store   */
/* SITE [this+4] stays host; the retired VALUE is decided by this law.   */
/* ===================================================================== */

extern "C" uint32_t isaac_pm_7dc610_end_after_reset(uint32_t begin_now) {
  /* 0x007dc610 mov eax,dword ptr [ecx] ; 0x007dc612 mov dword ptr
     [ecx+4],eax — the dword read at [this+0] is retired verbatim into
     [this+4] (u32 copy; no masking, no branches). */
  return static_cast<uint32_t>(begin_now);
}

extern "C" int32_t isaac_pm_7dc610_store_off(void) {
  /* 0x007dc612 mov dword ptr [ecx+4],eax — store site offset 4. */
  return static_cast<int32_t>(ISAAC_PM_V42A_STORE_OFF);
}

extern "C" uint32_t isaac_pm_7dc650_end_after_pop(uint32_t end_now) {
  /* 0x007dc650 add dword ptr [ecx+4],-4 — u32 wrap (end 0 -> 0xfffffffc). */
  return static_cast<uint32_t>(
      static_cast<uint32_t>(end_now) +
      static_cast<uint32_t>(ISAAC_PM_V42B_POP_DELTA_U32));
}

extern "C" int32_t isaac_pm_7dc650_pop_delta(void) {
  /* 0x007dc650 add dword ptr [ecx+4],-4 — the signed delta. */
  return -4;
}

/* ===================================================================== */
/* v43 — SEL: byte-min select leaf + record-assembler copy (both         */
/* FULLY PURE). A's compare is BYTE-WIDTH in the PE (mov al / cmp al)    */
/* -> v9 rule: uint32_t params masked & 0xff in-body.                    */
/* ===================================================================== */

extern "C" uint32_t isaac_pm_7dd3a0_min_byte(uint32_t a_byte, uint32_t b_byte) {
  /* 0x007dd3a0 mov al,byte ptr [edx] ; 0x007dd3a2 cmp al,byte ptr
     [ecx] ; 0x007dd3a4 cmovb ecx,edx — UNSIGNED below (CF): the
     smaller low BYTE wins; the returned pointer's byte value is this
     law. High bytes never participate (byte-width compare). */
  const uint32_t a =
      static_cast<uint32_t>(a_byte) &
      static_cast<uint32_t>(ISAAC_PM_V43A_BYTE_MASK);
  const uint32_t b =
      static_cast<uint32_t>(b_byte) &
      static_cast<uint32_t>(ISAAC_PM_V43A_BYTE_MASK);
  return b < a ? b : a;
}

extern "C" int32_t isaac_pm_7dd3a0_selects_b(uint32_t a_byte, uint32_t b_byte) {
  /* 0x007dd3a4 cmovb ecx,edx — 1 iff the b-pointer wins
     (byte[b] <u byte[a]); the cmov is the body's ONLY decision. */
  const uint32_t a =
      static_cast<uint32_t>(a_byte) &
      static_cast<uint32_t>(ISAAC_PM_V43A_BYTE_MASK);
  const uint32_t b =
      static_cast<uint32_t>(b_byte) &
      static_cast<uint32_t>(ISAAC_PM_V43A_BYTE_MASK);
  return b < a ? 1 : 0;
}

extern "C" void isaac_pm_7dd490_copy_plan(uint32_t src1_0, uint32_t src2_0,
                                          uint32_t src2_1,
                                          IsaacPmV43CopyPlan* out) {
  /* Whole-body plan of 0x007dd490: this[0] <- src1[0]
     (0x007dd493 mov eax,[edx] / 0x007dd495 mov [ecx],eax);
     this[4] <- src2[0], this[8] <- src2[1] (0x007dd49a..0x007dd4a4,
     note the MSVC store order retires this[8] FIRST). The store SITES
     stay host; the retired VALUES are decided by this plan. */
  out->field0 = static_cast<uint32_t>(src1_0);
  out->field1 = static_cast<uint32_t>(src2_0);
  out->field2 = static_cast<uint32_t>(src2_1);
}

/* ===================================================================== */
/* v44 — FILL: zero-fill leaf 0x007de2f0 (FULLY PURE). count elements    */
/* of 7 FULL-DWORD zeros at stride 0x1c; the store SITES stay host, the  */
/* geometry and skip decision are decided by these laws.                 */
/* ===================================================================== */

extern "C" uint32_t isaac_pm_7de2f0_store_count(uint32_t count) {
  /* do-while runs exactly count times when count != 0 (0x7de319 sub
     ecx,1 / jne), 7 stores per iteration (0x7de302..0x7de313); u32
     wrap like lea/imul arithmetic. */
  const uint32_t n = static_cast<uint32_t>(count);
  return n == 0u
             ? 0u
             : n * static_cast<uint32_t>(ISAAC_PM_V44_DWORDS_PER_ELEM);
}

extern "C" int32_t isaac_pm_7de2f0_skips_zero_count(uint32_t count) {
  /* 0x007de2f9 test ecx,ecx ; 0x007de2fb je 0x7de31e — equality-to-
     zero skip; no range compare exists, so no signed/unsigned class. */
  return static_cast<uint32_t>(count) == 0u ? 1 : 0;
}

extern "C" int32_t isaac_pm_7de2f0_stride(void) {
  /* 0x007de316 add eax,0x1c — element stride. */
  return static_cast<int32_t>(ISAAC_PM_V44_STRIDE);
}

extern "C" int32_t isaac_pm_7de2f0_dwords_per_elem(void) {
  /* 0x007de302..0x7de313 — seven dword zero-stores per element. */
  return static_cast<int32_t>(ISAAC_PM_V44_DWORDS_PER_ELEM);
}

/* ===================================================================== */
/* v45 — INIT: constant initializer 0x007df200 (FULLY PURE). Whole-body  */
/* geometry + value pins: the store SITES stay host; counts and retired  */
/* values are decided by these laws.                                     */
/* ===================================================================== */

extern "C" int32_t isaac_pm_7df200_store_count(void) {
  /* 0x007df200..0x7df262: fourteen dword stores + one exact WORD
     store (0x007df247 mov word ptr [ecx+0x4c],0x100). */
  return static_cast<int32_t>(ISAAC_PM_V45_DWORD_STORES +
                              ISAAC_PM_V45_WORD_STORES);
}

extern "C" uint32_t isaac_pm_7df200_string_cap(void) {
  /* 0x007df216 / 0x007df22b / 0x007df240 — the three std::string
     capacity headers all retire 0xf. */
  return static_cast<uint32_t>(ISAAC_PM_V45_STRING_CAP);
}

extern "C" int32_t isaac_pm_7df200_cap_site_count(void) {
  /* cap-header sites @0x18 / 0x30 / 0x48. */
  return static_cast<int32_t>(ISAAC_PM_V45_CAP_SITE_COUNT);
}

extern "C" uint32_t isaac_pm_7df200_scale_f32_bits(void) {
  /* 0x007df254 mov dword ptr [ecx+0x54],0x3ca3d70a — f32 bit pattern
     retired verbatim (0.02f); no float arithmetic in the body. */
  return static_cast<uint32_t>(ISAAC_PM_V45_SCALE_F32_BITS);
}

extern "C" uint32_t isaac_pm_7df200_word_4c_init(void) {
  /* 0x007df247 — the body's only sub-dword store: exact WORD 0x100. */
  return static_cast<uint32_t>(ISAAC_PM_V45_WORD_4C_INIT);
}

extern "C" uint32_t isaac_pm_7df200_unity_f32_bits(void) {
  /* 0x007df24d mov dword ptr [ecx+0x50],0x3f800000 — f32 bit pattern
     retired verbatim (1.0f). */
  return static_cast<uint32_t>(ISAAC_PM_V45_UNITY_F32_BITS);
}

extern "C" int32_t isaac_pm_td_remove_mutations_vector(int32_t early_kind) {
  return early_kind == ISAAC_PM_TD_EARLY_REMOVE ? 1 : 0;
}

extern "C" uint32_t isaac_player_manager_update_pure_helpers_abi_version(void) {
  return ISAAC_PLAYER_MANAGER_UPDATE_PURE_HELPERS_ABI_VERSION;
}
