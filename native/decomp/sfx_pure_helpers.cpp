#include "sfx_pure_helpers.h"

#include <stddef.h>

/* SFX / SoundEffects manager pure helpers.

   Roots:
     0x0092dc30 exact SFXManager::Play (dual with SoundEffects::Play)
     0x0092e430 exact SoundEffects::ClearVolumeModifier
     0x0092df40 / 0x0092e050 / 0x0092e230 address-stable mutators
   Evidence: whole bodies disassembled, see the header and
   output/decomp/5129df723e64/section-notes/sfx-v1/.

   Everything that reaches the audio device (channel vtable slots, the global
   sound system at 0x00c5aaa0, SoundEffect::Load, the 0x00a2ab/ad/ac helpers,
   the 0x00a112c0 logger) stays an address-stable host action.

   v3 splits SoundEffect::Load: the sample-table bookkeeping (the enabled byte,
   the per-voice stream byte, the re-read loop bound, and which entry fields
   the call can touch) is translated; the path redirect, the ".ogg" compare and
   the sound-system create stay host. See the header for the full body.

   v5 splits the tail of 0x0092d140 (the sample-table (re)builder): the two
   attribute-list walks (entry-level id/name, slot-level path/weight), the
   append-vs-replace arm and the id-bounds decision, and the per-slot voice
   count guard. XML reading, the numeric parse, every string assign, the
   vector push and both log calls stay host.

   Helpers ABI v5. */

namespace {

inline float f32_bits(uint32_t bits) {
  return __builtin_bit_cast(float, bits);
}

inline float one() {
  return f32_bits(ISAAC_SFX_F32_ONE_BITS);
}

/* Exact PE sequence shared by all five roots:
     mov eax, 0x94f2095 ; imul span ; sar edx, 4 ;
     mov eax, edx ; shr eax, 0x1f ; add eax, edx. */
inline int32_t entry_count_impl(int32_t span_bytes) {
  const int64_t product =
      static_cast<int64_t>(static_cast<int32_t>(ISAAC_SFX_ENTRY_DIV_MAGIC)) *
      static_cast<int64_t>(span_bytes);
  const int32_t high = static_cast<int32_t>(
      static_cast<uint32_t>(static_cast<uint64_t>(product) >> 32));
  const int32_t shifted = high >> ISAAC_SFX_ENTRY_DIV_SHIFT;
  const uint32_t sign = static_cast<uint32_t>(shifted) >> 31;
  return static_cast<int32_t>(static_cast<uint32_t>(shifted) + sign);
}

inline int32_t entry_offset_impl(int32_t id) {
  return static_cast<int32_t>(static_cast<uint32_t>(id) *
                              static_cast<uint32_t>(ISAAC_SFX_ENTRY_STRIDE));
}

inline int32_t in_range_impl(int32_t id, int32_t span_bytes) {
  /* PE: test id,id ; js miss  /  cmp id,count ; jge miss (signed). */
  if (id < 0) {
    return 0;
  }
  return id < entry_count_impl(span_bytes) ? 1 : 0;
}

/* Low byte of the enable slot: the PE reads `byte ptr [entry + 0x198]`. */
inline uint8_t low_byte(uint32_t slot) {
  return static_cast<uint8_t>(slot & 0xffu);
}

/* v1 took a boolean; v2 takes ISAAC_SFX_GATE_FORM_*. Any non-zero value other
   than PROBE still means Play, so v1 call sites keep working. */
inline int32_t normalize_form(int32_t form) {
  if (form == ISAAC_SFX_GATE_FORM_PROBE) {
    return ISAAC_SFX_GATE_FORM_PROBE;
  }
  return form != 0 ? static_cast<int32_t>(ISAAC_SFX_GATE_FORM_PLAY)
                   : static_cast<int32_t>(ISAAC_SFX_GATE_FORM_MUTATOR);
}

inline int32_t gate_impl(int32_t id,
                         int32_t span_bytes,
                         uint32_t voices_190,
                         uint32_t enabled_198,
                         int32_t form) {
  const int32_t play = normalize_form(form) == ISAAC_SFX_GATE_FORM_PLAY ? 1 : 0;
  if (in_range_impl(id, span_bytes) == 0) {
    return play != 0 ? static_cast<int32_t>(ISAAC_SFX_PLAY_GATE_MISS)
                     : static_cast<int32_t>(ISAAC_SFX_GATE_MISS);
  }
  /* PE: cmp dword [entry+0x190], 0 ; ja live-ish (unsigned above zero). */
  if (voices_190 == 0u) {
    return play != 0 ? static_cast<int32_t>(ISAAC_SFX_PLAY_GATE_NO_SAMPLES)
                     : static_cast<int32_t>(ISAAC_SFX_GATE_NO_SAMPLES);
  }
  /* PE: cmp byte [entry+0x198], 0.
     Mutators and the probe return here; Play preloads and continues. */
  if (low_byte(enabled_198) == 0u) {
    return play != 0 ? static_cast<int32_t>(ISAAC_SFX_PLAY_GATE_PRELOAD)
                     : static_cast<int32_t>(ISAAC_SFX_GATE_DISABLED);
  }
  return play != 0 ? static_cast<int32_t>(ISAAC_SFX_PLAY_GATE_LIVE)
                   : static_cast<int32_t>(ISAAC_SFX_GATE_LIVE);
}

inline float modifier_base_impl(float mgr_volume_modifier) {
  /* PE: xorps xmm1,xmm1 ; comiss mod,xmm1 ; ja keep ; else copy the zero.
     `ja` needs CF=0 and ZF=0, i.e. an ordered strictly-greater compare, so
     NaN, -0.0f and every negative value all collapse to +0.0f. */
  return mgr_volume_modifier > 0.0f ? mgr_volume_modifier : 0.0f;
}

inline float min_one_impl(float x) {
  /* MINSS dst, src -> (dst < src) ? dst : src. NaN in dst yields src. */
  return x < one() ? x : one();
}

inline uint32_t rng_next_impl(uint32_t seed,
                              uint32_t shift1,
                              uint32_t shift2,
                              uint32_t shift3) {
  /* PE VA 0x0092dd51..0x0092dd77; x86 shr/shl mask cl to 5 bits. */
  uint32_t x = seed;
  x ^= x >> (shift1 & 31u);
  x ^= x << (shift2 & 31u);
  x ^= x >> (shift3 & 31u);
  return x;
}

inline uint32_t voice_select_impl(uint32_t seed_out, uint32_t voices) {
  /* PE: xor edx,edx ; test edi,edi ; je skip_div ; div edi. */
  if (voices == 0u) {
    return 0u;
  }
  return seed_out % voices;
}

inline int32_t voice_pick_offset_impl(uint32_t voice_index) {
  /* PE: lea eax,[edx*8] ; sub eax,edx  (== index*7, 32-bit wrap) then an
     *8 address scale (wraps again) == index * 0x38. */
  const uint32_t times_seven = voice_index * 8u - voice_index;
  return static_cast<int32_t>(times_seven * 8u);
}

inline int32_t play_window_open_impl(int32_t clock_4abbc, int32_t entry_end_4) {
  /* PE: sar ecx,1 ; cmp ecx,eax ; jge open ; test eax,eax ; jns return. */
  const int32_t half = clock_4abbc >> 1;
  const bool returns = (half < entry_end_4) && (entry_end_4 >= 0);
  return returns ? 0 : 1;
}

inline void zero_play_plan(IsaacSfxPlayPlan* out) {
  out->gate_kind = ISAAC_SFX_PLAY_GATE_MISS;
  out->entry_count = 0;
  out->entry_offset = 0;
  out->warn_no_samples = 0;
  out->preload_needed = 0;
  out->window_open = 0;
  out->frame_start = 0;
  out->frame_end = 0;
  out->entry_stores_done = 0;
  out->rng_advanced = 0;
  out->rng_seed_out = 0u;
  out->seed_zero_fatal = 0;
  out->voice_index = 0u;
  out->voice_offset = 0;
  out->stream_create_needed = 0;
  out->voice_loop_byte = 0;
  out->voice_loop_arg = 0;
  out->entry_volume = 0.0f;
  out->voice_volume = 0.0f;
  out->voice_pitch = 0.0f;
  out->voice_pan = 0.0f;
  out->pure_complete = 1;
  out->host_needed = 0;
}

}  // namespace

/* ---------- SG: entry-table gate ---------- */

extern "C" int32_t isaac_sfx_entry_count(int32_t span_bytes) {
  return entry_count_impl(span_bytes);
}

extern "C" int32_t isaac_sfx_entry_offset(int32_t id) {
  return entry_offset_impl(id);
}

extern "C" int32_t isaac_sfx_id_in_range(int32_t id, int32_t span_bytes) {
  return in_range_impl(id, span_bytes);
}

extern "C" int32_t isaac_sfx_mutator_gate(int32_t id,
                                          int32_t span_bytes,
                                          uint32_t voices_190,
                                          uint32_t enabled_198) {
  return gate_impl(id, span_bytes, voices_190, enabled_198, /*play_form=*/0);
}

extern "C" int32_t isaac_sfx_play_gate(int32_t id,
                                       int32_t span_bytes,
                                       uint32_t voices_190,
                                       uint32_t enabled_198) {
  return gate_impl(id, span_bytes, voices_190, enabled_198, /*play_form=*/1);
}

extern "C" int32_t isaac_sfx_mutator_no_effect(int32_t gate_kind) {
  return (gate_kind == ISAAC_SFX_GATE_MISS ||
          gate_kind == ISAAC_SFX_GATE_DISABLED)
             ? 1
             : 0;
}

extern "C" int32_t isaac_sfx_gate_no_effect(int32_t gate_kind, int32_t form) {
  const int32_t norm = normalize_form(form);
  if (norm == ISAAC_SFX_GATE_FORM_PLAY) {
    /* PRELOAD (== 2, the same number as DISABLED) still runs
       SoundEffect::Load, the "not preloaded" log, this[0xc]++ and the whole
       playback body. Only MISS is inert. */
    return gate_kind == ISAAC_SFX_PLAY_GATE_MISS ? 1 : 0;
  }
  if (norm == ISAAC_SFX_GATE_FORM_PROBE) {
    return gate_kind != ISAAC_SFX_GATE_LIVE ? 1 : 0;
  }
  return isaac_sfx_mutator_no_effect(gate_kind);
}

extern "C" int32_t isaac_sfx_probe_gate(int32_t id,
                                        int32_t span_bytes,
                                        uint32_t voices_190,
                                        uint32_t enabled_198) {
  return gate_impl(id, span_bytes, voices_190, enabled_198,
                   ISAAC_SFX_GATE_FORM_PROBE);
}

extern "C" int32_t isaac_sfx_gate_warn_log_needed(int32_t gate_kind,
                                                  int32_t form) {
  if (gate_kind != ISAAC_SFX_GATE_NO_SAMPLES) {
    return 0;
  }
  /* PE 0x0092e5a4: the probe's `jbe` targets `xor al,al` directly â€” no log. */
  return normalize_form(form) == ISAAC_SFX_GATE_FORM_PROBE ? 0 : 1;
}

extern "C" void isaac_sfx_gate_plan(int32_t id,
                                    int32_t span_bytes,
                                    uint32_t voices_190,
                                    uint32_t enabled_198,
                                    int32_t form,
                                    IsaacSfxGate* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t norm = normalize_form(form);
  const int32_t kind =
      gate_impl(id, span_bytes, voices_190, enabled_198, norm);
  const int32_t in_range = in_range_impl(id, span_bytes);
  out->kind = kind;
  out->entry_count = entry_count_impl(span_bytes);
  out->entry_offset = in_range != 0 ? entry_offset_impl(id) : 0;
  out->index_in_range = in_range;
  out->warn_log_needed = isaac_sfx_gate_warn_log_needed(kind, norm);
  if (norm == ISAAC_SFX_GATE_FORM_PLAY) {
    /* Play still runs its voice work on the PRELOAD path. */
    out->voice_loop_needed = (kind == ISAAC_SFX_PLAY_GATE_LIVE ||
                              kind == ISAAC_SFX_PLAY_GATE_PRELOAD)
                                 ? 1
                                 : 0;
  } else {
    /* The probe writes nothing and logs nothing outside the voice loop, so
       every non-LIVE exit is completely inert â€” including NO_SAMPLES, which
       a mutator would have logged. That difference lives in no_effect. */
    out->voice_loop_needed = kind == ISAAC_SFX_GATE_LIVE ? 1 : 0;
  }
  out->no_effect = isaac_sfx_gate_no_effect(kind, norm);
}

/* ---------- SV: voice cursor + loop control flow ---------- */

extern "C" int32_t isaac_sfx_voice_base_offset(int32_t index) {
  const uint32_t stride =
      static_cast<uint32_t>(index) * static_cast<uint32_t>(ISAAC_SFX_VOICE_STRIDE);
  return static_cast<int32_t>(stride +
                              static_cast<uint32_t>(ISAAC_SFX_VOICE_BASE_OFF));
}

extern "C" int32_t isaac_sfx_voice_pending_offset(int32_t index) {
  /* PE cursor: lea esi,[entry + 0x29] then add esi, 0x38 per iteration. */
  const uint32_t stride =
      static_cast<uint32_t>(index) * static_cast<uint32_t>(ISAAC_SFX_VOICE_STRIDE);
  return static_cast<int32_t>(
      stride + static_cast<uint32_t>(ISAAC_SFX_VOICE_BASE_OFF) +
      static_cast<uint32_t>(ISAAC_SFX_VOICE_OFF_PENDING_09));
}

extern "C" int32_t isaac_sfx_voice_loop_continue(uint32_t next_index,
                                                 uint32_t voices_reloaded) {
  /* PE: inc ; cmp reg, dword [entry+0x190] ; jb â€” unsigned. */
  return next_index < voices_reloaded ? 1 : 0;
}

/* ---------- SA: per-voice activity decision ---------- */

extern "C" int32_t isaac_sfx_voice_first_probe_needed(int32_t channel_null,
                                                      uint32_t pending_09) {
  /* PE: mov ecx,[voice] ; test ecx,ecx ; je next ; cmp byte [pending],0 ; je */
  if (channel_null != 0) {
    return 0;
  }
  return low_byte(pending_09) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_sfx_voice_pending_after(int32_t channel_null,
                                                 uint32_t pending_09,
                                                 int32_t probe_first) {
  const uint8_t pending = low_byte(pending_09);
  if (isaac_sfx_voice_first_probe_needed(channel_null, pending_09) == 0) {
    return static_cast<int32_t>(pending);
  }
  /* PE: test al,al ; je keep ; mov byte [pending], 0 */
  return probe_first != 0 ? 0 : static_cast<int32_t>(pending);
}

extern "C" int32_t isaac_sfx_voice_act(int32_t channel_null,
                                       uint32_t pending_09,
                                       int32_t probe_first,
                                       int32_t probe_second) {
  if (channel_null != 0) {
    return 0;
  }
  /* PE: test al,al ; jne act ; cmp byte [pending], al ; je skip
     The compare reads the possibly-cleared pending byte against zero. */
  if (probe_second != 0) {
    return 1;
  }
  return isaac_sfx_voice_pending_after(channel_null, pending_09, probe_first) !=
                 0
             ? 1
             : 0;
}

extern "C" void isaac_sfx_voice_decide(int32_t channel_null,
                                       uint32_t pending_09,
                                       int32_t probe_first,
                                       int32_t probe_second,
                                       IsaacSfxVoiceDecision* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t first =
      isaac_sfx_voice_first_probe_needed(channel_null, pending_09);
  const int32_t after =
      isaac_sfx_voice_pending_after(channel_null, pending_09, probe_first);
  out->first_probe_needed = first;
  out->second_probe_needed = channel_null != 0 ? 0 : 1;
  out->pending_cleared =
      (first != 0 && probe_first != 0 && low_byte(pending_09) != 0u) ? 1 : 0;
  out->pending_after = after;
  out->act = isaac_sfx_voice_act(channel_null, pending_09, probe_first,
                                 probe_second);
  out->skip = out->act == 0 ? 1 : 0;
}

extern "C" int32_t isaac_sfx_stop_clears_pending(int32_t act,
                                                 int32_t channel_null_reload) {
  /* PE 0x0092e2d3: mov ecx,[voice] ; test ecx,ecx ; je skip ;
     call [vtbl+0x3c] ; mov byte [pending], 0 */
  if (act == 0) {
    return 0;
  }
  return channel_null_reload != 0 ? 0 : 1;
}

extern "C" int32_t isaac_sfx_stop_frame_end_value(void) {
  return ISAAC_SFX_STOP_FRAME_END_SENTINEL;
}

/* ---------- SM: volume / pitch float arithmetic ---------- */

extern "C" float isaac_sfx_volume_modifier_base(float mgr_volume_modifier) {
  return modifier_base_impl(mgr_volume_modifier);
}

extern "C" float isaac_sfx_min_one(float x) {
  return min_one_impl(x);
}

extern "C" float isaac_sfx_voice_volume_clamped(float mgr_volume_modifier,
                                                float volume,
                                                float master_volume) {
  /* PE: mulss xmm0, [ebp+0xc] ; mulss xmm0, [root+0x2a358] ; minss [1.0f] */
  float x = modifier_base_impl(mgr_volume_modifier);
  x = x * volume;
  x = x * master_volume;
  return min_one_impl(x);
}

extern "C" float isaac_sfx_voice_volume_unclamped(float mgr_volume_modifier,
                                                  float entry_base_volume,
                                                  float master_volume) {
  /* PE 0x0092e4df: mulss xmm0, [entry+0x194] ; mulss xmm0, [root+0x2a358]
     and NO minss â€” the ClearVolumeModifier product is stored raw. */
  float x = modifier_base_impl(mgr_volume_modifier);
  x = x * entry_base_volume;
  x = x * master_volume;
  return x;
}

/* ---------- SP: SFXManager::Play pure islands ---------- */

extern "C" int32_t isaac_sfx_play_frame_half(int32_t clock_4abbc) {
  return clock_4abbc >> 1;
}

extern "C" int32_t isaac_sfx_play_window_open(int32_t clock_4abbc,
                                              int32_t entry_end_4) {
  return play_window_open_impl(clock_4abbc, entry_end_4);
}

extern "C" int32_t isaac_sfx_play_frame_end(int32_t clock_4abbc,
                                            int32_t frame_delay) {
  const uint32_t half = static_cast<uint32_t>(clock_4abbc >> 1);
  return static_cast<int32_t>(half + static_cast<uint32_t>(frame_delay));
}

extern "C" uint32_t isaac_sfx_rng_next(uint32_t seed,
                                       uint32_t shift1,
                                       uint32_t shift2,
                                       uint32_t shift3) {
  return rng_next_impl(seed, shift1, shift2, shift3);
}

extern "C" uint32_t isaac_sfx_voice_select(uint32_t seed_out, uint32_t voices) {
  return voice_select_impl(seed_out, voices);
}

extern "C" int32_t isaac_sfx_voice_pick_offset(uint32_t voice_index) {
  return voice_pick_offset_impl(voice_index);
}

extern "C" int32_t isaac_sfx_play_stream_flag_offset(uint32_t voice_index) {
  /* PE: cmp byte [entry + (v*7)*8 + 0x38], 0 */
  const uint32_t base = static_cast<uint32_t>(voice_pick_offset_impl(voice_index));
  return static_cast<int32_t>(base +
                              static_cast<uint32_t>(ISAAC_SFX_VOICE_STRIDE));
}

extern "C" void isaac_sfx_play_plan(const IsaacSfxPlayInput* in_,
                                    IsaacSfxPlayPlan* out) {
  if (out == nullptr) {
    return;
  }
  zero_play_plan(out);
  if (in_ == nullptr) {
    return;
  }

  const int32_t kind = gate_impl(in_->id, in_->span_bytes, in_->voices_190,
                                 in_->enabled_198, /*play_form=*/1);
  const int32_t in_range = in_range_impl(in_->id, in_->span_bytes);
  out->gate_kind = kind;
  out->entry_count = entry_count_impl(in_->span_bytes);
  out->entry_offset = in_range != 0 ? entry_offset_impl(in_->id) : 0;

  if (kind == ISAAC_SFX_PLAY_GATE_MISS) {
    /* The PE returns immediately; nothing observable happens. */
    return;
  }

  if (kind == ISAAC_SFX_PLAY_GATE_NO_SAMPLES) {
    out->warn_no_samples = 1;
    out->pure_complete = 0;
    out->host_needed = 1;
    return;
  }

  if (kind == ISAAC_SFX_PLAY_GATE_PRELOAD) {
    /* SoundEffect::Load + "[warn] Sound %d was not preloaded." + this[0xc]++,
       then fall through. v3: Load provably stores only entry[0x198] and one
       byte per voice at entry+(i+1)*0x38, so the re-reads of entry[0x190] and
       entry[4] that follow it fold to the values already captured. */
    out->preload_needed = 1;
    out->pure_complete = 0;
    out->host_needed = 1;
  }

  out->window_open = play_window_open_impl(in_->clock_4abbc, in_->entry_end_4);
  if (out->window_open == 0) {
    /* Return before any store; the only host work is a possible preload. */
    return;
  }

  out->pure_complete = 0;
  out->host_needed = 1; /* 0x00a2ac20 is unconditional on this path. */
  out->entry_stores_done = 1;
  out->frame_start = in_->clock_4abbc >> 1;
  out->frame_end = isaac_sfx_play_frame_end(in_->clock_4abbc, in_->frame_delay);
  out->entry_volume = in_->volume;

  if (in_->rng_seed == 0u) {
    /* PE logs "RNG Seed is zero!", re-reads the slot and int3s when it is
       still zero. No pure successor state exists; stop here. */
    out->seed_zero_fatal = 1;
    return;
  }

  const uint32_t seed_out = rng_next_impl(in_->rng_seed, in_->rng_shift1,
                                          in_->rng_shift2, in_->rng_shift3);
  /* VA 0x0092dd1a re-reads entry[0x190]; v3 folds it to the first read. */
  const uint32_t index = voice_select_impl(seed_out, in_->voices_190);
  out->rng_advanced = 1;
  out->rng_seed_out = seed_out;
  out->voice_index = index;
  out->voice_offset = voice_pick_offset_impl(index);
  out->stream_create_needed = low_byte(in_->stream_flag_38) != 0u ? 1 : 0;
  out->voice_loop_byte = static_cast<int32_t>(low_byte(
      static_cast<uint32_t>(in_->loop_arg)));
  out->voice_loop_arg = in_->loop_arg;
  out->voice_pitch = in_->pitch;
  out->voice_pan = in_->pan;
  out->voice_volume = isaac_sfx_voice_volume_clamped(
      in_->mgr_volume_modifier, in_->volume, in_->master_volume);
}

/* ---------- SP-B: Play 0x92dc30 device-LEAF decisions (v26b) ---------- */

extern "C" int32_t isaac_sfx_play_no_samples_host(int32_t gate_kind) {
  /* The NO_SAMPLES arm: warn log + return 0x92dcce — one host leaf. */
  return gate_kind == ISAAC_SFX_PLAY_GATE_NO_SAMPLES ? 1 : 0;
}

extern "C" int32_t isaac_sfx_play_preload_host(int32_t gate_kind) {
  /* The PRELOAD arm: Load 0x92cfb0 + "not preloaded" log + this[0xc]++
     + the continuation body edge — one typed host leaf. */
  return gate_kind == ISAAC_SFX_PLAY_GATE_PRELOAD ? 1 : 0;
}

extern "C" int32_t isaac_sfx_play_body_host(int32_t gate_kind) {
  /* The LIVE arm: the per-voice device body (allocate + set-* + start
     + pan). PRELOAD also reaches the body, but its host edge is the
     preload leaf; consumers that need the body split use the leaf plan. */
  return gate_kind == ISAAC_SFX_PLAY_GATE_LIVE ? 1 : 0;
}

extern "C" int32_t isaac_sfx_play_probe_needed(int32_t channel_null) {
  /* PE 0x92dd98: mov ecx,[voice+0x20] ; test ecx,ecx ; je skip. */
  return channel_null != 0 ? 0 : 1;
}

extern "C" int32_t isaac_sfx_play_reset_needed(int32_t channel_null,
                                               int32_t probe_alive) {
  /* PE 0x92dda3: test al,al ; je skip — the probe result is a device
     boolean; only a live channel that probed true resets the wrapper. */
  if (channel_null != 0) {
    return 0;
  }
  return probe_alive != 0 ? 1 : 0;
}

extern "C" uint32_t isaac_sfx_play_stream_name_ptr(uint32_t name_cap,
                                                   uint32_t inline_base,
                                                   uint32_t heap_ptr) {
  /* PE 0x92ddb3: cmp dword [slot+0x1c], 0x10 ; jb use_inline ;
     mov ecx,[slot+8] — UNSIGNED capacity test, strict below. */
  return name_cap < 0x10u ? inline_base : heap_ptr;
}

extern "C" int32_t isaac_sfx_play_set_loop_needed(int32_t channel_null) {
  /* PE 0x92ddfc: test ecx,ecx ; je skip — FIRST channel read of the
     tail; the loop byte store at [voice+0x28] is unconditional. */
  return channel_null != 0 ? 0 : 1;
}

extern "C" int32_t isaac_sfx_play_set_pitch_needed(int32_t channel_null) {
  /* PE 0x92de13: test ecx,ecx ; je skip. */
  return channel_null != 0 ? 0 : 1;
}

extern "C" int32_t isaac_sfx_play_set_volume_needed(int32_t channel_null) {
  /* PE 0x92de5b: test ecx,ecx ; je skip — the volume STORE at
     [voice+0x2c] happens regardless; only the device set-volume is
     channel-gated. */
  return channel_null != 0 ? 0 : 1;
}

extern "C" int32_t isaac_sfx_play_start_needed(int32_t channel_null) {
  /* PE 0x92de6d: test ecx,ecx ; je skip — the RELOAD of [voice+0x20]
     after the set-volume call. */
  return channel_null != 0 ? 0 : 1;
}

extern "C" int32_t isaac_sfx_play_pending_word(int32_t channel_null) {
  /* PE 0x92de78: mov word [voice+0x29], 1 — inside the start block. The
     word store sets pending (+0x09) = 1 and clears flag (+0x0a). */
  return channel_null != 0 ? 0 : 1;
}

extern "C" void isaac_sfx_play_leaf_plan(const IsaacSfxPlayLeafInput* in_,
                                         IsaacSfxPlayLeafPlan* out) {
  if (out == nullptr) {
    return;
  }
  const IsaacSfxPlayLeafPlan zero = {};
  *out = zero;
  if (in_ == nullptr) {
    return;
  }

  const int32_t gate = in_->gate_kind;
  const int32_t no_samples =
      isaac_sfx_play_no_samples_host(gate);
  const int32_t preload = isaac_sfx_play_preload_host(gate);
  const int32_t live = isaac_sfx_play_body_host(gate);
  const int32_t body =
      (preload != 0 || live != 0) && in_->window_open != 0 ? 1 : 0;
  const int32_t ch_null = in_->channel_null;
  const int32_t allocate = body != 0 && low_byte(in_->stream_flag) != 0u ? 1 : 0;

  out->no_samples_host = no_samples;
  out->preload_host = preload;
  out->body_reached = body;
  out->allocate_needed = allocate;
  out->probe_needed =
      allocate != 0 ? isaac_sfx_play_probe_needed(ch_null) : 0;
  out->reset_needed = allocate != 0
                          ? isaac_sfx_play_reset_needed(ch_null, in_->probe_alive)
                          : 0;
  out->stream_name_ptr =
      allocate != 0
          ? isaac_sfx_play_stream_name_ptr(in_->name_cap, in_->name_inline,
                                           in_->name_heap)
          : 0u;
  out->set_loop_needed =
      body != 0 ? isaac_sfx_play_set_loop_needed(ch_null) : 0;
  out->set_pitch_needed =
      body != 0 ? isaac_sfx_play_set_pitch_needed(ch_null) : 0;
  out->set_volume_needed =
      body != 0 ? isaac_sfx_play_set_volume_needed(ch_null) : 0;
  out->start_needed = body != 0 ? isaac_sfx_play_start_needed(ch_null) : 0;
  out->pending_word = out->start_needed != 0 ? 1 : 0;
  out->pan_action = body != 0
                        ? isaac_sfx_channel_pan_action(ch_null, in_->channel_count,
                                                       in_->pan)
                        : ISAAC_SFX_PAN_ACTION_NONE;

  int32_t calls = 0;
  if (allocate != 0) {
    /* Stream create (0xc5aaa0 vtbl+0x24) + assign 0xa2add0 + release
       0x7e2740 always run on the allocate path, plus the probe and the
       conditional reset. */
    calls += 3;
    calls += out->probe_needed;
    calls += out->reset_needed;
  }
  calls += out->set_loop_needed;
  calls += out->set_pitch_needed;
  calls += out->set_volume_needed;
  calls += out->start_needed;
  if (body != 0) {
    calls += 1; /* 0xa2ac20 pan wrapper, unconditional on the body path */
  }
  out->device_calls = calls;

  out->pure_complete =
      (no_samples == 0 && preload == 0 && calls == 0) ? 1 : 0;
  out->host_needed = out->pure_complete == 0 ? 1 : 0;
}

/* ---------- SC: SoundEffects::ClearVolumeModifier ---------- */

extern "C" int32_t isaac_sfx_clear_volume_walk_enter(int32_t span_bytes) {
  /* PE: the magic divide sets ZF; `je 0x92e555` exits on a zero count. */
  return entry_count_impl(span_bytes) != 0 ? 1 : 0;
}

extern "C" int32_t isaac_sfx_clear_volume_entry_open(uint32_t voices_190) {
  /* PE: cmp dword [entry+0x190], ecx(0) ; jbe skip_entry â€” unsigned. */
  return voices_190 != 0u ? 1 : 0;
}

extern "C" int32_t isaac_sfx_clear_volume_voice_enabled(uint32_t enabled_198) {
  return low_byte(enabled_198) != 0u ? 1 : 0;
}

extern "C" void isaac_sfx_clear_volume_plan(int32_t span_bytes,
                                            uint32_t voices_190,
                                            uint32_t enabled_198,
                                            float mgr_volume_modifier,
                                            float entry_base_volume,
                                            float master_volume,
                                            IsaacSfxClearVolumePlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t enter = isaac_sfx_clear_volume_walk_enter(span_bytes);
  const int32_t open = isaac_sfx_clear_volume_entry_open(voices_190);
  const int32_t enabled = isaac_sfx_clear_volume_voice_enabled(enabled_198);
  out->entry_count = entry_count_impl(span_bytes);
  out->walk_enter = enter;
  out->entry_voices_open = open;
  out->voice_enabled = enabled;
  out->voice_visited = (enter != 0 && open != 0) ? 1 : 0;
  out->voice_gate_open = (out->voice_visited != 0 && enabled != 0) ? 1 : 0;
  if (out->voice_gate_open != 0) {
    out->voice_volume = isaac_sfx_voice_volume_unclamped(
        mgr_volume_modifier, entry_base_volume, master_volume);
  } else {
    out->voice_volume = 0.0f;
  }
}

/* ---------- SQ: is-playing probe 0x0092e560 ---------- */

extern "C" int32_t isaac_sfx_probe_voice_channel_offset(int32_t entry_offset,
                                                        int32_t index) {
  /* PE: ebx = id*0x1b8, then `add ebx, 0x38` per iteration; the load is
     [ebx + begin + 0x20]. Both adds wrap at 32 bits. */
  const uint32_t stride = static_cast<uint32_t>(index) *
                          static_cast<uint32_t>(ISAAC_SFX_VOICE_STRIDE);
  return static_cast<int32_t>(static_cast<uint32_t>(entry_offset) + stride +
                              static_cast<uint32_t>(ISAAC_SFX_VOICE_BASE_OFF));
}

extern "C" int32_t isaac_sfx_probe_voice_pending_offset(int32_t entry_offset,
                                                        int32_t index) {
  const uint32_t stride = static_cast<uint32_t>(index) *
                          static_cast<uint32_t>(ISAAC_SFX_VOICE_STRIDE);
  return static_cast<int32_t>(
      static_cast<uint32_t>(entry_offset) + stride +
      static_cast<uint32_t>(ISAAC_SFX_VOICE_BASE_OFF) +
      static_cast<uint32_t>(ISAAC_SFX_VOICE_OFF_PENDING_09));
}

extern "C" int32_t isaac_sfx_probe_voice_probe_calls(int32_t channel_null,
                                                     uint32_t pending_09) {
  if (channel_null != 0) {
    return 0;
  }
  return low_byte(pending_09) != 0u ? 2 : 1;
}

extern "C" int32_t isaac_sfx_is_playing_known(int32_t gate_kind) {
  return gate_kind != ISAAC_SFX_GATE_LIVE ? 1 : 0;
}

extern "C" int32_t isaac_sfx_is_playing_short_circuit_result(
    int32_t gate_kind) {
  /* Every non-LIVE exit of 0x0092e560 falls to `xor al,al` at 0x0092e5ff. */
  (void)gate_kind;
  return 0;
}

extern "C" void isaac_sfx_is_playing_walk(int32_t gate_kind,
                                          const IsaacSfxVoiceSample* samples,
                                          int32_t count,
                                          IsaacSfxProbePlan* out) {
  if (out == nullptr) {
    return;
  }
  out->gate_kind = gate_kind;
  out->result = 0;
  out->known_without_host = 1;
  out->voices_visited = 0;
  out->probe_calls = 0;
  out->first_active_index = -1;
  out->pending_clear_mask = 0u;
  out->pure_complete = 1;

  if (gate_kind != ISAAC_SFX_GATE_LIVE) {
    out->result = isaac_sfx_is_playing_short_circuit_result(gate_kind);
    return;
  }

  const int32_t n = (samples == nullptr || count < 0) ? 0 : count;
  for (int32_t i = 0; i < n; ++i) {
    const IsaacSfxVoiceSample& s = samples[i];
    ++out->voices_visited;
    out->probe_calls +=
        isaac_sfx_probe_voice_probe_calls(s.channel_null, s.pending_09);
    if (s.channel_null == 0 && low_byte(s.pending_09) != 0u &&
        s.probe_first != 0) {
      if (i < 32) {
        out->pending_clear_mask |= (1u << static_cast<uint32_t>(i));
      }
    }
    if (isaac_sfx_voice_act(s.channel_null, s.pending_09, s.probe_first,
                            s.probe_second) != 0) {
      /* PE: jne 0x0092e608 â€” the walk stops here, later voices are never
         visited and their probe calls are never issued. */
      out->result = 1;
      out->first_active_index = i;
      break;
    }
  }
  out->known_without_host = out->probe_calls == 0 ? 1 : 0;
  /* The pending clears are stores into the entry, so a walk that clears
     anything is not inert even though the probe returns a value. */
  out->pure_complete =
      (out->probe_calls == 0 && out->pending_clear_mask == 0u) ? 1 : 0;
}

/* ---------- SW: 16-bit stores over two byte fields ---------- */

extern "C" int32_t isaac_sfx_word_store_lo(uint32_t word) {
  return static_cast<int32_t>(word & 0xffu);
}

extern "C" int32_t isaac_sfx_word_store_hi(uint32_t word) {
  return static_cast<int32_t>((word >> 8) & 0xffu);
}

/* ---------- SR / SN: channel wrapper reset + assign ---------- */

extern "C" void isaac_sfx_channel_reset_defaults(
    IsaacSfxChannelDefaults* out) {
  if (out == nullptr) {
    return;
  }
  /* PE 0x00a2abda: mov word [+8], 0 â€” one store covering loop and pending. */
  out->loop_08 = isaac_sfx_word_store_lo(
      static_cast<uint32_t>(ISAAC_SFX_CHANNEL_DEFAULT_LOOP_PENDING_WORD));
  out->pending_09 = isaac_sfx_word_store_hi(
      static_cast<uint32_t>(ISAAC_SFX_CHANNEL_DEFAULT_LOOP_PENDING_WORD));
  out->flag_0a = ISAAC_SFX_CHANNEL_DEFAULT_FLAG_0A;
  out->volume_0c = f32_bits(ISAAC_SFX_CHANNEL_DEFAULT_VOLUME_BITS);
  out->pan_10 = f32_bits(ISAAC_SFX_CHANNEL_DEFAULT_PAN_BITS);
  out->pitch_14 = f32_bits(ISAAC_SFX_CHANNEL_DEFAULT_PITCH_BITS);
}

extern "C" int32_t isaac_sfx_channel_reset_release_first(void) {
  /* PE 0x00a2abd1/0x00a2add4: `push 0 ; call 0xa2ae60` before every store. */
  return 1;
}

extern "C" void isaac_sfx_channel_assign_plan(
    int32_t channel_null_after_attach, IsaacSfxChannelAssignPlan* out) {
  if (out == nullptr) {
    return;
  }
  IsaacSfxChannelDefaults defaults;
  isaac_sfx_channel_reset_defaults(&defaults);
  out->release_needed = isaac_sfx_channel_reset_release_first();
  out->attach_needed = 1;
  out->device_calls = channel_null_after_attach != 0 ? 0 : 4;
  /* PE 0x00a2ae0e: movzx eax, byte [wrapper+8] â€” zero-extended, and the byte
     was just cleared, so the loop argument is always 0. */
  out->set_loop_arg = defaults.loop_08;
  out->set_volume_arg = defaults.volume_0c;
  out->set_pan_arg = defaults.pan_10;
  out->set_pitch_arg = defaults.pitch_14;
}

/* ---------- v32: channel/entry ctor + release pair (stream census) ---------- */

extern "C" void isaac_sfx_channel_ctor_defaults(
    IsaacSfxChannelCtorPlan* out) {
  if (out == nullptr) {
    return;
  }
  /* PE 0x00a2a990 (fresh dump cpu-dump/00a2a990.txt):
       0xa2a9bc mov dword [esi], 0     <- CHANNEL = 0 (store 1)
       0xa2a9c2 mov dword [esi+4], 0   <- SECONDARY = 0
       alloc(0x18) -> edi; if non-null: ctor(edi);
         mov dword [edi], 0xb9c430     <- pair-object vtable (.rdata)
         mov dword [edi+0x14], 0
       hook probe on OLD [esi+4] (null at construction)
       0xa2aa24 mov dword [esi+4], edi <- SECONDARY = fresh heap obj
       0xa2aa29 mov dword [esi], 0     <- CHANNEL = 0 AGAIN (store 2)
       0xa2aa2f mov word [esi+8], 0    <- loop AND pending = 0
       0xa2aa35 mov byte [esi+0xa], 0  <- flag
       0xa2aa39 mov dword [esi+0xc], 0x3f800000  <- volume 1.0f
       0xa2aa40 mov dword [esi+0x10], 0          <- pan 0.0f
       0xa2aa47 mov dword [esi+0x14], 0x3f800000 <- pitch 1.0f
     The two dword-zero channel stores are the NULL-BY-CONSTRUCTION
     pin: every wrapper built by the SoundEffect ctor chain (0x92cea0
     -> __ehvec_ctor 0xaef5c4 -> 0x92ce30 -> 0xa2a990) has channel 0. */
  out->channel_00_after = 0;
  out->secondary_04_alloc = 1;
  out->secondary_04_vtable =
      static_cast<uint32_t>(ISAAC_SFX_CHANNEL_CTOR_SECONDARY_VTABLE_B9C430);
  out->loop_pending_08_after =
      isaac_sfx_word_store_lo(static_cast<uint32_t>(
          ISAAC_SFX_CHANNEL_DEFAULT_LOOP_PENDING_WORD));
  out->flag_0a_after = ISAAC_SFX_CHANNEL_DEFAULT_FLAG_0A;
  out->volume_0c_after = f32_bits(ISAAC_SFX_CHANNEL_DEFAULT_VOLUME_BITS);
  out->pan_10_after = f32_bits(ISAAC_SFX_CHANNEL_DEFAULT_PAN_BITS);
  out->pitch_14_after = f32_bits(ISAAC_SFX_CHANNEL_DEFAULT_PITCH_BITS);
}

extern "C" void isaac_sfx_channel_release_plan(
    uint32_t release_arg,
    uint32_t old_secondary_04,
    uint32_t probe_result,
    uint32_t hook_ptr,
    IsaacSfxChannelReleasePlan* out) {
  if (out == nullptr) {
    return;
  }
  /* PE 0x00a2ae60 (fresh dump cpu-dump/00a2ae60.txt):
       alloc(0x18) -> edi; ctor(edi); [edi]=0xb9c430; [edi+0x14]=ebx(=arg)
       hook gate on OLD [esi+4]: non-null (FULL word) && vtbl[0xc]()
         LOW-BYTE probe && hook fn ptr 0xc7f484 (FULL word)
       0xa2aee1 mov dword [esi], ebx    <- CHANNEL = release_arg
       0xa2aee3 mov dword [esi+4], edi  <- SECONDARY = fresh heap obj
     release_arg is a FULL-dword echo (no byte masking); reset 0xa2abd0
     / slot dtor 0xa2ab40 / the dtor sites pass 0, keeping the channel
     null; the assign sites pass the runtime handle. */
  out->channel_00_after = static_cast<int32_t>(release_arg);
  out->secondary_04_alloc = 1;
  out->secondary_04_vtable =
      static_cast<uint32_t>(ISAAC_SFX_RELEASE_SECONDARY_VTABLE_B9C430);
  out->arg_echo_14 = static_cast<int32_t>(release_arg);
  const int32_t old_nonzero = old_secondary_04 != 0u ? 1 : 0;
  const int32_t probe_alive =
      low_byte(probe_result) != 0u ? 1 : 0;
  const int32_t hook_installed = hook_ptr != 0u ? 1 : 0;
  out->hook_probe_runs = old_nonzero;
  out->hook_runs = old_nonzero && probe_alive && hook_installed;
}

extern "C" void isaac_sfx_entry_ctor_defaults(
    IsaacSfxEntryCtorPlan* out) {
  if (out == nullptr) {
    return;
  }
  /* PE 0x0092cea0 (fresh dump cpu-dump/0092cea0.txt):
       0x92cebc mov dword [esi+4], 0xffffffff  <- frame-end DEFAULT -1
       0x92cec3 __ehvec_ctor(base=esi+8, 0x38, 7, ctor=0x92ce30)
       0x92cec8 mov dword [esi+0x190], 0       <- voices = 0
       0x92ced4 mov byte [esi+0x198], 0        <- enabled = 0
       0x92cedb/0x92cee5/0x92ceef/0x92cef9     <- entry string SSO (cap 0xf)
       Voice slot ctor 0x92ce30 per slot: name SSO, wrapper ctor
       0xa2a990 (channel 0), then
       0x92ce7f mov byte [esi+0x30], 0         <- wrapper+0x18 stream byte = 0
       0x92ce85 mov dword [esi+0x34], 1        <- wrapper+0x1c = 1
     The -1 frame-end DEFAULT explains divergence 0 of 0x92e300 vs
     0x92e230: StopAll never writes [entry+4] = -1 because fresh
     entries already carry it. */
  out->frame_end_04_after =
      static_cast<int32_t>(ISAAC_SFX_ENTRY_CTOR_FRAME_END_NEG1);
  out->voices_190_after = ISAAC_SFX_ENTRY_CTOR_VOICES_0;
  out->enabled_198_after = ISAAC_SFX_ENTRY_CTOR_ENABLED_0;
  out->entry_string_cap = ISAAC_SFX_ENTRY_CTOR_STRING_CAP_0F;
  out->voice_slots = ISAAC_SFX_ENTRY_CTOR_VOICE_SLOTS_7;
  out->channels_null = ISAAC_SFX_ENTRY_CTOR_VOICE_SLOTS_7;
  out->stream_bytes_zero = ISAAC_SFX_ENTRY_CTOR_VOICE_SLOTS_7;
}

/* ---------- v33: SoundEffect::Load load-arm gates (0x92cfb0) ---------- */

extern "C" int32_t isaac_sfx_load_entry_gate(uint32_t voices_190) {
  /* PE 0x92cfe0 `cmp dword [esi+0x190], 0` + 0x92cfee `jbe 0x92d10f`.
     UNSIGNED zero-check on the FULL dword: 0 is the only skip value
     (0x100 / 0xffffffff loop). The skip still lands on the enabled:=1
     tail 0x92d10f — the SAME tail as the loop exit (v3 pin). */
  return voices_190 != 0u ? ISAAC_SFX_LOAD_ENTRY_GATE_LOOP
                          : ISAAC_SFX_LOAD_ENTRY_GATE_SKIP;
}

extern "C" void isaac_sfx_load_arm_plan(uint32_t resolved_size,
                                        uint32_t capacity,
                                        int32_t suffix_compare_result,
                                        IsaacSfxLoadArmPlan* out) {
  if (out == nullptr) {
    return;
  }
  /* PE 0x92d023 `lea ecx,[eax-4] ; cmp eax,ecx ; jb 0x92d138`: the
     borrow fires exactly when resolved_size < 4 (size == 4 is NOT
     fatal) — the UNSIGNED fatal arm, composed from the v3 law. */
  const int32_t fatal =
      isaac_sfx_load_path_len_fatal(resolved_size);
  /* PE 0x92d052 the 4-byte ".ogg" compare; 0 result == match. */
  const int32_t ogg_match =
      fatal != 0 ? 0 : (suffix_compare_result == 0 ? 1 : 0);
  /* PE 0x92d05a `test eax,eax ; jne 0x92d062 ; mov al,1`: on a match
     the device arm is skipped ENTIRELY (al=1, stream). On a mismatch
     the device arm runs (vtbl[0x24] open + assign + probe + hook) and
     al=0. On the fatal path nothing below 0x92d138 happens. */
  const int32_t arm =
      fatal != 0 ? ISAAC_SFX_LOAD_ARM_FATAL
                 : (ogg_match != 0 ? ISAAC_SFX_LOAD_ARM_STREAM
                                   : ISAAC_SFX_LOAD_ARM_DEVICE);
  /* PE 0x92d045 `cmp ebx,0x10 ; cmovae eax,esi` — UNSIGNED SSO select,
     boundary 0x10 selects the heap buffer (v3 law). */
  const int32_t heap = isaac_sfx_load_uses_heap_buffer(capacity);
  out->arm_kind = arm;
  out->fatal = fatal;
  out->ogg_match = ogg_match;
  out->file_open_needed = arm == ISAAC_SFX_LOAD_ARM_DEVICE ? 1 : 0;
  /* PE 0x92d0c7 `mov byte [edi+0x18], al` — the stream-needed byte.
     FATAL stores nothing (0x499950 never returns). */
  out->stream_byte_value =
      fatal != 0 ? 0 : (ogg_match != 0
                            ? static_cast<int32_t>(
                                  ISAAC_SFX_LOAD_STREAM_BYTE_STREAM)
                            : static_cast<int32_t>(
                                  ISAAC_SFX_LOAD_STREAM_BYTE_STATIC));
  out->uses_heap_buffer = heap;
  out->heap_free_needed = fatal != 0 ? 0 : heap;
  out->suffix_compare_needed = fatal != 0 ? 0 : 1;
}

extern "C" uint32_t isaac_sfx_load_tail_abort_va(void) {
  return ISAAC_SFX_LOAD_TAIL_ABORT_VA_92D132;
}

extern "C" uint32_t isaac_sfx_load_tail_fatal_va(void) {
  return ISAAC_SFX_LOAD_TAIL_FATAL_VA_92D138;
}

extern "C" uint32_t isaac_sfx_load_tail_abort_iat_va(void) {
  return ISAAC_SFX_LOAD_TAIL_ABORT_IAT_B18894;
}

extern "C" uint32_t isaac_sfx_load_tail_fatal_callee_va(void) {
  return ISAAC_SFX_LOAD_TAIL_FATAL_CALLEE_499950;
}

extern "C" uint32_t isaac_sfx_load_tail_abort_source_va(void) {
  return ISAAC_SFX_LOAD_TAIL_ABORT_SOURCE_D0EA;
}

extern "C" uint32_t isaac_sfx_load_tail_fatal_source_va(void) {
  return ISAAC_SFX_LOAD_TAIL_FATAL_SOURCE_D028;
}

extern "C" uint32_t isaac_sfx_load_tail_enable_va(void) {
  return ISAAC_SFX_LOAD_TAIL_ENABLE_VA_D10F;
}

extern "C" uint32_t isaac_sfx_load_tail_enable_inbounds(void) {
  return ISAAC_SFX_LOAD_TAIL_ENABLE_SOURCES_2;
}

extern "C" uint32_t isaac_sfx_load_tail_count(void) {
  return ISAAC_SFX_LOAD_TAIL_COUNT_2;
}

/* ---------- SX: channel set-pan 0x00a2ac20 ---------- */

extern "C" int32_t isaac_sfx_pan_equals_neutral(float pan) {
  /* PE: ucomiss pan, [0x00ba9fe4] ; lahf ; test ah,0x44 ; jnp set.
     ah bit 6 is ZF and bit 2 is PF. The `test` leaves even parity when both
     or neither are set, so `jnp` fires only for ZF=1, PF=0 â€” an ordered
     equality. Unordered (NaN) sets both and falls through to the warning. */
  const float neutral = f32_bits(ISAAC_SFX_PAN_NEUTRAL_BITS);
  return pan == neutral ? 1 : 0;
}

extern "C" int32_t isaac_sfx_channel_pan_action(int32_t channel_null,
                                                int32_t channel_count,
                                                float pan) {
  /* PE 0x00a2ac36: test ecx,ecx ; je return â€” the store already happened. */
  if (channel_null != 0) {
    return ISAAC_SFX_PAN_ACTION_NONE;
  }
  /* PE 0x00a2ac44: cmp eax,1 ; jle set â€” SIGNED, so a negative count is
     treated as mono. */
  if (channel_count <= ISAAC_SFX_PAN_MONO_MAX_CHANNELS) {
    return ISAAC_SFX_PAN_ACTION_SET;
  }
  if (isaac_sfx_pan_equals_neutral(pan) != 0) {
    return ISAAC_SFX_PAN_ACTION_SET;
  }
  return ISAAC_SFX_PAN_ACTION_WARN;
}

extern "C" void isaac_sfx_channel_pan_plan(int32_t channel_null,
                                           int32_t channel_count,
                                           float pan,
                                           IsaacSfxChannelPanPlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t action =
      isaac_sfx_channel_pan_action(channel_null, channel_count, pan);
  out->action = action;
  /* PE 0x00a2ac31: movss [wrapper+0x10], xmm0 before the null test. */
  out->store_needed = 1;
  out->count_probe_needed = channel_null != 0 ? 0 : 1;
  out->warn_log_needed = action == ISAAC_SFX_PAN_ACTION_WARN ? 1 : 0;
  out->stored_pan = pan;
}

/* ---------- RNG stream identity ---------- */

extern "C" void isaac_sfx_rng_defaults(IsaacSfxRngDefaults* out) {
  if (out == nullptr) {
    return;
  }
  out->seed = static_cast<uint32_t>(ISAAC_SFX_RNG_SEED_DEFAULT);
  out->shift1 = static_cast<uint32_t>(ISAAC_SFX_RNG_SHIFT1_DEFAULT);
  out->shift2 = static_cast<uint32_t>(ISAAC_SFX_RNG_SHIFT2_DEFAULT);
  out->shift3 = static_cast<uint32_t>(ISAAC_SFX_RNG_SHIFT3_DEFAULT);
  out->seed_va = static_cast<uint32_t>(ISAAC_SFX_RNG_SEED_VA);
  out->shift_rdata_va =
      static_cast<uint32_t>(ISAAC_SFX_RNG_SHIFT_TRIPLE_RDATA_VA);
}

/* ---------- SL: SoundEffect::Load bookkeeping split (v3) ---------- */

extern "C" int32_t isaac_sfx_load_voice_name_offset(int32_t index) {
  /* PE 0x0092d006: lea eax,[edi-0x18] with edi = entry+0x20+i*0x38. */
  const uint32_t stride = static_cast<uint32_t>(index) *
                          static_cast<uint32_t>(ISAAC_SFX_VOICE_STRIDE);
  return static_cast<int32_t>(stride +
                              static_cast<uint32_t>(ISAAC_SFX_VOICE_NAME_OFF));
}

extern "C" int32_t isaac_sfx_load_voice_wrapper_offset(int32_t index) {
  return isaac_sfx_voice_base_offset(index);
}

extern "C" int32_t isaac_sfx_load_stream_byte_offset(int32_t index) {
  /* PE 0x0092d0c7: mov byte [edi+0x18], al â€” entry + (i+1)*0x38. */
  const uint32_t stride = static_cast<uint32_t>(index) *
                          static_cast<uint32_t>(ISAAC_SFX_VOICE_STRIDE);
  return static_cast<int32_t>(stride +
                              static_cast<uint32_t>(ISAAC_SFX_VOICE_STRIDE));
}

extern "C" int32_t isaac_sfx_load_path_len_fatal(uint32_t resolved_size) {
  /* PE 0x0092d023: lea ecx,[eax-4] ; cmp eax,ecx ; jb fatal.
     `eax - (eax-4)` borrows exactly when eax < 4, so this is size < 4 and
     nothing else â€” in particular size == 4 is NOT fatal. */
  return resolved_size < static_cast<uint32_t>(ISAAC_SFX_LOAD_MIN_PATH_LEN) ? 1
                                                                           : 0;
}

extern "C" int32_t isaac_sfx_load_compare_length(uint32_t resolved_size) {
  /* PE 0x0092d031: sub eax,ecx with ecx = eax-4 gives exactly 4, so the
     `cmp eax,edx ; cmovb edx,eax` that follows can never lower it. */
  if (isaac_sfx_load_path_len_fatal(resolved_size) != 0) {
    return 0;
  }
  return ISAAC_SFX_LOAD_SUFFIX_LEN;
}

extern "C" int32_t isaac_sfx_load_uses_heap_buffer(uint32_t capacity) {
  /* PE 0x0092d045: cmp ebx,0x10 ; cmovae eax,esi â€” unsigned, and the boundary
     value 0x10 selects the heap pointer. */
  return capacity >= static_cast<uint32_t>(ISAAC_SFX_LOAD_SSO_CAPACITY_LIMIT)
             ? 1
             : 0;
}

extern "C" int32_t isaac_sfx_load_stream_byte(int32_t suffix_compare_result) {
  /* PE 0x0092d05a: test eax,eax ; jne create ; mov al,1. A zero result means
     the resolved path ends in ".ogg", which is the streaming case. */
  return suffix_compare_result == 0
             ? static_cast<int32_t>(ISAAC_SFX_LOAD_STREAM_BYTE_STREAM)
             : static_cast<int32_t>(ISAAC_SFX_LOAD_STREAM_BYTE_STATIC);
}

extern "C" int32_t isaac_sfx_load_voice_slot_in_bounds(int32_t index) {
  /* Voice i owns [0x08 + i*0x38, 0x08 + (i+1)*0x38). It fits below the entry
     header when that end is still <= 0x190. */
  if (index < 0) {
    return 0;
  }
  const int64_t end = static_cast<int64_t>(ISAAC_SFX_VOICE_NAME_OFF) +
                      (static_cast<int64_t>(index) + 1) *
                          static_cast<int64_t>(ISAAC_SFX_VOICE_STRIDE);
  return end <= static_cast<int64_t>(ISAAC_SFX_ENTRY_OFF_VOICE_COUNT_190) ? 1
                                                                          : 0;
}

extern "C" int32_t isaac_sfx_load_voice_aliases_entry_header(int32_t index) {
  if (index < 0) {
    return 0;
  }
  const int64_t lo = static_cast<int64_t>(ISAAC_SFX_VOICE_NAME_OFF) +
                     static_cast<int64_t>(index) *
                         static_cast<int64_t>(ISAAC_SFX_VOICE_STRIDE);
  const int64_t hi = lo + static_cast<int64_t>(ISAAC_SFX_VOICE_STRIDE);
  const int64_t header_lo =
      static_cast<int64_t>(ISAAC_SFX_ENTRY_OFF_VOICE_COUNT_190);
  const int64_t header_hi = static_cast<int64_t>(ISAAC_SFX_ENTRY_STRIDE);
  return (lo < header_hi && hi > header_lo) ? 1 : 0;
}

extern "C" int32_t isaac_sfx_load_writes_entry_field(int32_t offset,
                                                     uint32_t voices) {
  if (offset < 0) {
    return 0;
  }
  const uint32_t lo = static_cast<uint32_t>(offset);
  const uint32_t hi = lo + 4u; /* fields here are far from 2^32; no wrap. */
  /* PE 0x0092d10f: mov byte [entry+0x198], 1 â€” unconditional. */
  const uint32_t enabled =
      static_cast<uint32_t>(ISAAC_SFX_ENTRY_OFF_ENABLED_198);
  if (enabled >= lo && enabled < hi) {
    return 1;
  }
  if (voices == 0u) {
    return 0;
  }
  /* PE 0x0092d0c7: one byte at entry + k*0x38 for k in [1, voices]. Since the
     stride 0x38 is wider than a 4-byte field, at most one k can land in it. */
  const uint32_t stride = static_cast<uint32_t>(ISAAC_SFX_VOICE_STRIDE);
  const uint32_t k = (lo + stride - 1u) / stride; /* ceil(lo / 0x38) */
  if (k == 0u || k > voices) {
    return 0;
  }
  const uint32_t at = k * stride;
  return (at >= lo && at < hi) ? 1 : 0;
}

extern "C" void isaac_sfx_load_voice_plan(int32_t index,
                                          uint32_t resolved_size,
                                          uint32_t capacity,
                                          int32_t suffix_compare_result,
                                          IsaacSfxLoadVoicePlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t fatal = isaac_sfx_load_path_len_fatal(resolved_size);
  const int32_t heap = isaac_sfx_load_uses_heap_buffer(capacity);
  const int32_t stream = isaac_sfx_load_stream_byte(suffix_compare_result);
  out->name_offset = isaac_sfx_load_voice_name_offset(index);
  out->wrapper_offset = isaac_sfx_load_voice_wrapper_offset(index);
  out->stream_byte_offset = isaac_sfx_load_stream_byte_offset(index);
  out->path_len_fatal = fatal;
  out->suffix_compare_needed = fatal != 0 ? 0 : 1;
  out->compare_length = isaac_sfx_load_compare_length(resolved_size);
  out->uses_heap_buffer = heap;
  /* On the fatal path 0x00499950 never returns, so nothing below happens. */
  out->stream_byte_value = fatal != 0 ? 0 : stream;
  out->device_create_needed = (fatal == 0 && stream == 0) ? 1 : 0;
  out->channel_assign_needed = out->device_create_needed;
  out->heap_free_needed = fatal != 0 ? 0 : heap;
  out->aliases_entry_header = isaac_sfx_load_voice_aliases_entry_header(index);
}

extern "C" void isaac_sfx_load_plan(uint32_t voices_190,
                                    int32_t frame_start,
                                    int32_t frame_end,
                                    IsaacSfxLoadPlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t enter = voices_190 != 0u ? 1 : 0;
  out->voice_loop_enter = enter;
  out->voices_visited = voices_190;
  /* Both the `jbe` shortcut and the loop exit land on 0x0092d10f. */
  out->enabled_after = ISAAC_SFX_LOAD_ENABLED_AFTER;
  out->voices_after = voices_190;
  out->frame_start_after = frame_start;
  out->frame_end_after = frame_end;
  out->entry_header_stores = 1;
  out->stream_byte_stores = voices_190;
  out->header_alias_index =
      voices_190 > static_cast<uint32_t>(ISAAC_SFX_LOAD_HEADER_ALIAS_INDEX)
          ? static_cast<int32_t>(ISAAC_SFX_LOAD_HEADER_ALIAS_INDEX)
          : -1;
  out->pure_complete = enter == 0 ? 1 : 0;
}

extern "C" int32_t isaac_sfx_play_recapture_mask(int32_t gate_kind,
                                                 uint32_t voices) {
  int32_t mask = ISAAC_SFX_PLAY_RECAPTURE_NONE;
  if (gate_kind == ISAAC_SFX_PLAY_GATE_PRELOAD) {
    /* Machine evidence, not an assumption: ask the Load model directly. */
    if (isaac_sfx_load_writes_entry_field(ISAAC_SFX_ENTRY_OFF_FRAME_END, voices) !=
        0) {
      mask |= ISAAC_SFX_PLAY_RECAPTURE_ENTRY_END_4;
    }
    if (isaac_sfx_load_writes_entry_field(ISAAC_SFX_ENTRY_OFF_VOICE_COUNT_190,
                                          voices) != 0) {
      mask |= ISAAC_SFX_PLAY_RECAPTURE_VOICES_190;
    }
  }
  if (gate_kind == ISAAC_SFX_PLAY_GATE_PRELOAD ||
      gate_kind == ISAAC_SFX_PLAY_GATE_LIVE) {
    /* The picked voice's stream byte is whatever the last Load wrote for it,
       i.e. a ".ogg" test on a resolved path â€” an IO result either way. */
    mask |= ISAAC_SFX_PLAY_RECAPTURE_STREAM_FLAG;
  }
  return mask;
}

/* ---------- SY: channel-wrapper copy-assign 0x00a2ac90 (v3) ---------- */

extern "C" void isaac_sfx_channel_pointer_swap(
    int32_t dst_00,
    int32_t dst_04,
    int32_t tmp_00,
    int32_t tmp_04,
    IsaacSfxChannelPointerSwap* out) {
  if (out == nullptr) {
    return;
  }
  /* PE 0x00a2ad25..0x00a2ad39, in that exact order:
       ecx = dst[4] ; edx = tmp[4] ; tmp[4] = ecx ; eax = dst[0]
       dst[4] = edx ; ecx = tmp[0] ; tmp[0] = eax ; dst[0] = ecx
     Every read happens before its matching write, so this is a swap. */
  out->dst_00 = tmp_00;
  out->dst_04 = tmp_04;
  out->tmp_00 = dst_00;
  out->tmp_04 = dst_04;
}

extern "C" void isaac_sfx_channel_copy_assign_plan(
    uint32_t src_loop_08,
    uint32_t src_pending_09,
    float src_volume_0c,
    float src_pan_10,
    float src_pitch_14,
    IsaacSfxChannelCopyAssignPlan* out) {
  if (out == nullptr) {
    return;
  }
  IsaacSfxChannelDefaults defaults;
  isaac_sfx_channel_reset_defaults(&defaults);
  out->release_needed = 1;
  out->adopt_calls = ISAAC_SFX_CHANNEL_COPY_ASSIGN_ADOPT_CALLS;
  out->swap_needed = 1;
  /* PE 0x00a2accf..0x00a2acf0 precedes the 0x00a2acf5 release and every
     store, so the source values are read before anything can disturb them. */
  out->snapshot_before_release = 1;
  out->self_assign_safe = 1;
  out->hook_probe_sites = ISAAC_SFX_CHANNEL_COPY_ASSIGN_HOOK_SITES;

  out->transient_loop_08 = defaults.loop_08;
  out->transient_pending_09 = defaults.pending_09;
  out->transient_flag_0a = defaults.flag_0a;
  out->transient_volume_0c = defaults.volume_0c;
  out->transient_pan_10 = defaults.pan_10;
  out->transient_pitch_14 = defaults.pitch_14;

  /* PE 0x00a2acd4/0x00a2acd7: `mov bl,[src+8]` and `mov bh,[src+9]` are two
     byte reads, replayed by two byte stores at 0x00a2ad7c/0x00a2ad7f â€” not a
     word store, so no field bleeds into its neighbour on the way back. */
  out->final_loop_08 = static_cast<int32_t>(low_byte(src_loop_08));
  out->final_pending_09 = static_cast<int32_t>(low_byte(src_pending_09));
  /* +0x0a is written by the pack at 0x00a2ad07 and never restored. */
  out->final_flag_0a = defaults.flag_0a;
  out->final_volume_0c = src_volume_0c;
  out->final_pan_10 = src_pan_10;
  out->final_pitch_14 = src_pitch_14;
}

/* ---------- SZ: channel start 0x00a2ac00 (v3) ---------- */

extern "C" void isaac_sfx_channel_start_plan(int32_t channel_null,
                                             uint32_t pending_09,
                                             uint32_t flag_0a,
                                             IsaacSfxChannelStartPlan* out) {
  if (out == nullptr) {
    return;
  }
  /* PE 0x00a2ac03: mov ecx,[wrapper] ; test ecx,ecx ; je return. */
  const int32_t start = channel_null != 0 ? 0 : 1;
  out->device_start_needed = start;
  out->start_arg = ISAAC_SFX_CHANNEL_START_ARG;
  out->word_store_needed = start;
  if (start == 0) {
    out->pending_09_after = static_cast<int32_t>(low_byte(pending_09));
    out->flag_0a_after = static_cast<int32_t>(low_byte(flag_0a));
    return;
  }
  /* PE 0x00a2ac10 / Play 0x0092de78: `mov word [wrapper+9], 1` covers BOTH
     the pending byte and the +0x0a flag byte. */
  out->pending_09_after =
      isaac_sfx_word_store_lo(static_cast<uint32_t>(ISAAC_SFX_PLAY_STARTED_WORD));
  out->flag_0a_after =
      isaac_sfx_word_store_hi(static_cast<uint32_t>(ISAAC_SFX_PLAY_STARTED_WORD));
}

/* ---------- SD: table clear / destroy walk (v4) ---------- */

extern "C" void isaac_sfx_entry_voice_dtor_args(IsaacSfxVoiceDtorArgs* out) {
  if (out == nullptr) {
    return;
  }
  /* PE 0x0092d24a, right-to-left: push dtor ; push count ; push size ;
     push base, with base = `lea eax,[esi-0x1ac]` and esi = elem+0x1b4. */
  out->base_offset = ISAAC_SFX_ENTRY_VOICE_DTOR_BASE_OFF;
  out->stride = ISAAC_SFX_ENTRY_VOICE_DTOR_STRIDE;
  out->count = ISAAC_SFX_ENTRY_VOICE_DTOR_COUNT;
  out->dtor_va = static_cast<uint32_t>(ISAAC_SFX_HOST_VA_VOICE_SLOT_DTOR);
  out->slot_name_offset = ISAAC_SFX_VOICE_SLOT_OFF_NAME;
  out->slot_wrapper_offset = ISAAC_SFX_VOICE_SLOT_OFF_WRAPPER;
  out->span_end = ISAAC_SFX_ENTRY_VOICE_DTOR_BASE_OFF +
                  ISAAC_SFX_ENTRY_VOICE_DTOR_COUNT *
                      ISAAC_SFX_ENTRY_VOICE_DTOR_STRIDE;
}

namespace {

/* The tail both free sites share, from the point where a byte size is known:
     inc/compute size ; cmp size,0x1000 ; jb plain
     back = ptr[-1] ; size += 0x23 ; slack = (ptr - back) - 4 ;
     cmp slack,0x1f ; ja fatal ; free(back) */
inline void free_tail_impl(uint32_t size,
                           uint32_t ptr_minus_back,
                           int32_t free_needed,
                           IsaacSfxStringFreePlan* out) {
  out->free_needed = free_needed;
  out->reset_size = 0;
  out->reset_capacity = ISAAC_SFX_STRING_RESET_CAPACITY;
  if (free_needed == 0) {
    out->uses_back_pointer = 0;
    out->free_size = 0u;
    out->slack_checked = 0;
    out->corrupt_fatal = 0;
    return;
  }
  const int32_t big =
      size >= static_cast<uint32_t>(ISAAC_SFX_STRING_BIG_ALLOC_LIMIT) ? 1 : 0;
  out->uses_back_pointer = big;
  out->slack_checked = big;
  if (big == 0) {
    out->free_size = size;
    out->corrupt_fatal = 0;
    return;
  }
  out->free_size =
      size + static_cast<uint32_t>(ISAAC_SFX_STRING_BIG_ALLOC_BIAS);
  /* PE: `sub eax,edx ; add eax,-4 ; cmp eax,0x1f ; ja` â€” UNSIGNED, so a
     back pointer above the payload wraps high and trips the fatal path. */
  const uint32_t slack = ptr_minus_back - 4u;
  out->corrupt_fatal =
      slack > static_cast<uint32_t>(ISAAC_SFX_STRING_ALIGN_SLACK_MAX) ? 1 : 0;
}

}  // namespace

extern "C" void isaac_sfx_string_free_plan(uint32_t capacity,
                                           uint32_t ptr_minus_back,
                                           IsaacSfxStringFreePlan* out) {
  if (out == nullptr) {
    return;
  }
  /* PE 0x0092d219: cmp capacity,0x10 ; jb skip â€” an inline buffer is never
     freed. The size handed to the deallocator is capacity + 1 (`inc ecx`). */
  const int32_t free_needed =
      capacity >= static_cast<uint32_t>(ISAAC_SFX_STRING_SSO_LIMIT) ? 1 : 0;
  free_tail_impl(capacity + 1u, ptr_minus_back, free_needed, out);
}

extern "C" void isaac_sfx_block_free_plan(uint32_t block_size,
                                          uint32_t ptr_minus_back,
                                          IsaacSfxStringFreePlan* out) {
  if (out == nullptr) {
    return;
  }
  /* PE 0x0092d2b2 runs the same tail on the element block, whose size is the
     re-multiplied element count rather than a capacity+1, and it always
     reaches the deallocator (the null check happened at 0x0092d1f7). */
  free_tail_impl(block_size, ptr_minus_back, /*free_needed=*/1, out);
}

/* ---------- v22: Load's residual decision islands (0x0092cfb0) ---------- */

extern "C" void isaac_sfx_load_hook_plan(uint32_t probe_target,
                                         uint32_t probe_result,
                                         uint32_t hook_ptr,
                                         IsaacSfxLoadHookPlan* out) {
  if (out == nullptr) {
    return;
  }
  /* PE 0x92d097: test ecx,ecx ; je 0x92d0b8 — FULL-WORD on the probe target
     fed by the device-create arm. */
  const int32_t probe_runs = probe_target != 0u ? 1 : 0;
  /* PE 0x92d0a2: test al,al ; je 0x92d0b8 — LOW-BYTE on the vtbl[0x0c]
     probe result: 0x100 answers "no hook". */
  const int32_t probe_byte =
      static_cast<uint8_t>(probe_result & 0xffu) != 0 ? 1 : 0;
  /* PE 0x92d0ab: test eax,eax ; je 0x92d0b8 — FULL-WORD on the 0x00c7f484
     attach-hook function pointer. */
  const int32_t hook_ptr_nonzero = hook_ptr != 0u ? 1 : 0;
  out->probe_runs = probe_runs;
  out->probe_byte_nonzero = probe_byte;
  out->hook_ptr_nonzero = hook_ptr_nonzero;
  out->hook_runs =
      probe_runs != 0 && probe_byte != 0 && hook_ptr_nonzero != 0 ? 1 : 0;
}

extern "C" void isaac_sfx_load_voice_free_plan(uint32_t capacity,
                                               uint32_t ptr_minus_back,
                                               IsaacSfxLoadVoiceFreePlan* out) {
  if (out == nullptr) {
    return;
  }
  /* PE 0x92d0ca: cmp ebx,0x10 ; jb 0x92d0f6 — the shared SSO skip. The
     size handed to the deallocator is capacity+1 (`lea ecx,[ebx+1]`). */
  const int32_t free_needed =
      capacity >= static_cast<uint32_t>(ISAAC_SFX_STRING_SSO_LIMIT) ? 1 : 0;
  IsaacSfxStringFreePlan tail;
  free_tail_impl(capacity + 1u, ptr_minus_back, free_needed, &tail);
  out->free_needed = tail.free_needed;
  /* 0x92d0d4 `cmp size,0x1000 ; jb plain`: FAST only when the free runs AND
     the size stays below the big-alloc edge. */
  out->free_fast = free_needed != 0 && tail.uses_back_pointer == 0 ? 1 : 0;
  out->free_size = tail.free_size;
  out->slack_checked = tail.slack_checked;
  out->corrupt_fatal = tail.corrupt_fatal;
  /* 0x92d0f6..0x92d109 advance the loop straight on: NO reset stores. The
     entry-string site at 0x0092d217 resets (IsaacSfxStringFreePlan), this
     per-voice site does not — pinned divergence, reproduced not corrected. */
  out->reset_needed = 0;
}

/* ---------- v23: TryRedirectPath probe walk (0x008f5ad0) ---------- */

extern "C" uint32_t isaac_sfx_redirect_probe_start(uint32_t hash) {
  /* 0x8f5b60 `and esi,0x7fff` — first probe index. */
  return (hash & ISAAC_SFX_REDIRECT_PROBE_MASK) & 0x7fffu;
}

extern "C" uint32_t isaac_sfx_redirect_probe_next(uint32_t index) {
  /* 0x8f5b89/8a `inc esi ; and esi,0x7fff` — open addressing. */
  return ((index + 1u) & ISAAC_SFX_REDIRECT_PROBE_MASK) & 0x7fffu;
}

extern "C" int32_t isaac_sfx_redirect_probe_cap(uint32_t count) {
  /* 0x8f5b7c `cmp eax,0x8000 ; jae 0x8f5b9e` — UNSIGNED. */
  return count >= ISAAC_SFX_REDIRECT_PROBE_CAP ? 1 : 0;
}

extern "C" int32_t isaac_sfx_redirect_probe_match(uint32_t k0, uint32_t k1,
                                                  uint32_t slot_key0,
                                                  uint32_t slot_key1) {
  /* 0x8f5b73/77 `cmp [edi],ecx ; cmp [edi+4],edx ; je` — FULL-WORD. */
  return (slot_key0 == k0 && slot_key1 == k1) ? 1 : 0;
}

extern "C" void isaac_sfx_redirect_probe_step(uint32_t count, uint32_t index,
                                              int32_t slot_present,
                                              int32_t keys_match,
                                              IsaacSfxRedirectProbeStep* out) {
  if (out == nullptr) {
    return;
  }
  if (slot_present == 0) {
    /* 0x8f5b6f/71 `test edi,edi ; je 0x8f5bc1` and the 0x8f5b97 fall
       through — an empty slot ends the walk NOT-FOUND. */
    out->outcome = 2;
    out->next_count = count;
    out->next_index = index;
    out->destroy_size = 0;
    return;
  }
  if (keys_match != 0) {
    if (count != ISAAC_SFX_REDIRECT_PROBE_CAP) {
      /* 0x8f5b7a je 0x8f5b99 ; 0x8f5b9e jne 0x8f5bb9 ; 0x8f5bbb
         jne 0x8f608f — FOUND tail, host handles the node. */
      out->outcome = 1;
    } else {
      /* Match exactly AT the cap: 0x8f5ba0 test edi,edi / 0x8f5ba4
         dtor+free — evict the matched node. */
      out->outcome = 3;
    }
    out->next_count = count;
    out->next_index = index;
    out->destroy_size = out->outcome == 3 ? ISAAC_SFX_REDIRECT_FREE_SIZE : 0;
    return;
  }
  if (count >= ISAAC_SFX_REDIRECT_PROBE_CAP) {
    /* 0x8f5b7c cmp eax,0x8000 ; jae 0x8f5b9e. The jae target 0x8f5b9e
       re-tests EQUALITY (`cmp eax,0x8000 ; jne 0x8f5bb9`): only count ==
       0x8000 falls to the evict arm; a count > 0x8000 takes the jne
       (unreachable in the machine — the walk stops at the cap — but the
       shared test edi,edi at 0x8f5bb9 returns FOUND for a present slot,
       transcribed exactly). */
    if (count == ISAAC_SFX_REDIRECT_PROBE_CAP) {
      out->outcome = 3;
      out->destroy_size = ISAAC_SFX_REDIRECT_FREE_SIZE;
    } else {
      out->outcome = 1; /* present slot (we are past the present test) */
      out->destroy_size = 0;
    }
    out->next_count = count;
    out->next_index = index;
    return;
  }
  /* 0x8f5b83..0x8f5b91: advance count and index, probe again. */
  out->outcome = 0;
  out->next_count = count + 1u;
  out->next_index = ((index + 1u) & ISAAC_SFX_REDIRECT_PROBE_MASK) & 0x7fffu;
  out->destroy_size = 0;
}

/* ============================ v24: 0x92d140 callee depth audit ==========
 * The XML-reader block's internal E8 callees â€” the std::string assign
 * (0x0040ccd0, four in-block sites), the concat builder (0x00421680, site
 * 0x92d984), the grow allocator (0x0040cf00), the SoundEntry vector growth
 * (0x0092e900 push-back at 0x92d654, 0x0092ee40 reserve at 0x92d353), the
 * string copy-ctor (0x0040cf50) and the file open (0x00a178d0 at 0x92d1a2).
 * Every law is re-traced from the machine listing (section-notes/sfx-v24/
 * and cpu-dump/); UNSIGNED/lowy-byte/full-word forms are pinned below. */

/* 0x40cce2 `cmp len,cap ; ja 0x40cd0e` â€” UNSIGNED (ja). */
extern "C" int32_t isaac_sfx_string_assign_grow(uint32_t len, uint32_t cap) {
  return len > cap ? 1 : 0;
}

/* 0x40cce8 `cmp cap,0x10 ; jb 0x40ccef` â€” UNSIGNED FULL-WORD cap test:
   cap < 0x10 keeps the SSO in-place buffer at [str+0], else the heap
   buffer [str+0]. */
extern "C" int32_t isaac_sfx_string_assign_sso(uint32_t cap) {
  return cap < ISAAC_SFX_STRING_SSO_LIMIT ? 1 : 0;
}

/* 0x40cd0e `cmp len,0x7fffffff ; ja 0x40cdb5` â€” UNSIGNED: len above the
   clamp throws the length error (0x40ccc0) on the grow arm. */
extern "C" int32_t isaac_sfx_string_grow_len_ok(uint32_t len) {
  return len > ISAAC_SFX_STRING_CAP_CLAMP ? 0 : 1;
}

/* 0x40cd1a..0x40cd49 â€” the assign grow-cap chain:
     ebx = len|0xf ;
     if ebx > 0x7fffffff        -> ebx = 0x7fffffff        (jbe clamp, U)
     else if cap > 0x7fffffff - (cap>>1) -> ebx = 0x7fffffff (jbe clamp, U)
     else ebx = max(ebx, cap + (cap>>1))                   (cmovb, U)
   Alloc size = new_cap+1 via 0x40cf00; old-buffer free tail is v13. */
extern "C" uint32_t isaac_sfx_string_grow_cap(uint32_t cap, uint32_t len) {
  uint32_t start = (len | ISAAC_SFX_STRING_SSO_CAP) & 0xffffffffu;
  if (start > ISAAC_SFX_STRING_CAP_CLAMP) {
    return ISAAC_SFX_STRING_CAP_CLAMP;
  }
  const uint32_t half = cap >> 1;
  if (cap > ISAAC_SFX_STRING_CAP_CLAMP - half) {
    return ISAAC_SFX_STRING_CAP_CLAMP;
  }
  const uint32_t grown = (cap + half) & 0xffffffffu;
  return start < grown ? grown : start;
}

/* 0x421684 `add eax,[ebp+0x1c]` â€” the concat total, 32-bit wrap. */
extern "C" uint32_t isaac_sfx_string_build_total(uint32_t len1,
                                                 uint32_t len2) {
  return (len1 + len2) & 0xffffffffu;
}

/* 0x4216ad `cmp total,0xf ; jbe 0x4216de` â€” UNSIGNED: total <= 0xf stays
   SSO (cap field keeps 0xf, no alloc). */
extern "C" int32_t isaac_sfx_string_build_sso(uint32_t total) {
  return total <= ISAAC_SFX_STRING_SSO_CAP ? 1 : 0;
}

/* 0x4216b1..0x4216cf â€” the builder cap: SSO arm -> 0xf; else
   start = total|0xf ; clamp 0x7fffffff (jbe, U) ; floor max(start, 0x16)
   (cmovb, U). Alloc size = cap+1. The 0x16 floor is unobservable (every
   total >= 0x10 ORs to >= 0x1f) but is transcribed exactly. */
extern "C" uint32_t isaac_sfx_string_build_cap(uint32_t total) {
  if (total <= ISAAC_SFX_STRING_SSO_CAP) {
    return ISAAC_SFX_STRING_SSO_CAP;
  }
  uint32_t cap = (total | ISAAC_SFX_STRING_SSO_CAP) & 0xffffffffu;
  if (cap > ISAAC_SFX_STRING_CAP_CLAMP) {
    return ISAAC_SFX_STRING_CAP_CLAMP;
  }
  return cap < static_cast<uint32_t>(ISAAC_SFX_BUILD_FLOOR_16)
             ? static_cast<uint32_t>(ISAAC_SFX_BUILD_FLOOR_16)
             : cap;
}

/* 0x40cf01 `cmp size,0x1000 ; jb 0x40cf30` â€” UNSIGNED: fast arm. */
extern "C" int32_t isaac_sfx_grow_alloc_fast(uint32_t size) {
  return size < ISAAC_SFX_ALLOC_FAST_LIMIT ? 1 : 0;
}

/* 0x40cf30 `test size,size ; je 0x40cf3f` â€” FULL-WORD zero gate on the
   fast arm (NULL, no malloc). */
extern "C" int32_t isaac_sfx_grow_alloc_zero(uint32_t size) {
  return size == 0u ? 1 : 0;
}

/* 0x40cf09..0x40cf0e: `lea eax,[size+0x23] ; cmp eax,size ; jbe 0x40cf43`
   â€” big-arm alloc size and the UNSIGNED wrap gate (wrapped throws
   0x40cee0). */
extern "C" void isaac_sfx_grow_alloc_big_plan(
    uint32_t size, IsaacSfxGrowAllocBigPlan* out) {
  if (out == nullptr) {
    return;
  }
  const uint32_t alloc_size = (size + ISAAC_SFX_ALLOC_BIG_BIAS) & 0xffffffffu;
  out->alloc_size = alloc_size;
  out->wrapped = alloc_size <= size ? 1 : 0;
}

/* 0x40cf1f/0x40cf22 `lea eax,[raw+0x23] ; and eax,0xffffffe0` â€” the slow
   arm's aligned user pointer; the raw malloc result is stored at
   aligned-4 (back pointer for the free tail). */
extern "C" uint32_t isaac_sfx_grow_alloc_align(uint32_t raw) {
  return (raw + ISAAC_SFX_ALLOC_BIG_BIAS) & ISAAC_SFX_ALLOC_ALIGN_MASK;
}

/* 0x92e990 (push-back) / 0x92eea7 (reserve):
   `edx=ecc>>1 ; eax=0x94f209-edx ; cmp ecc,eax ; jbe in-place` â€” UNSIGNED
   arm gate: alloc-MAX iff ecc > MAX - (ecc>>1). */
extern "C" int32_t isaac_sfx_vec_cap_gate(uint32_t ecc) {
  const uint32_t threshold = ISAAC_SFX_VEC_MAX_COUNT - (ecc >> 1);
  return ecc > threshold ? 1 : 0;
}

/* 0x92e9f6..0x92e9fd (push-back 0x92e900 only):
   `lea eax,[edx+ecx] ; mov edi,ebx(count+1) ; cmp eax,ebx ; cmovae edi,eax`
   â€” new = max(ecc+(ecc>>1), count+1), UNSIGNED; count+1 wraps. The
   reserve 0x92ee40 never takes the count (it floors at 0x443 instead). */
extern "C" uint32_t isaac_sfx_vec_push_grow_new(uint32_t ecc,
                                                uint32_t count) {
  const uint32_t grown = (ecc + (ecc >> 1)) & 0xffffffffu;
  const uint32_t needed = (count + 1u) & 0xffffffffu;
  return grown < needed ? needed : grown;
}

/* 0x92ef24..0x92ef2f (reserve 0x92ee40 only):
   `lea esi,[edx+ecx] ; cmp esi,0x443 ; jae keep ; mov esi,0x443` â€” the
   UNSIGNED 0x443 floor (no count+1 term; the push-back body diverges). */
extern "C" uint32_t isaac_sfx_vec_reserve_grow_new(uint32_t ecc) {
  const uint32_t grown = (ecc + (ecc >> 1)) & 0xffffffffu;
  return grown < ISAAC_SFX_VEC_RESERVE_FLOOR ? ISAAC_SFX_VEC_RESERVE_FLOOR
                                             : grown;
}

/* 0x92ea03 / 0x92ef3c `cmp new_cap,0x94f209 ; ja 0x92ea72/0x92ef68` â€”
   UNSIGNED: above MAX throws 0x40cee0. */
extern "C" int32_t isaac_sfx_vec_cap_overflow(uint32_t new_cap) {
  return new_cap > ISAAC_SFX_VEC_MAX_COUNT ? 1 : 0;
}

/* 0x92e961 `cmp count,0x94f209 ; je 0x92ea6d` â€” EQUALITY ONLY, in the
   push-back body: count == MAX throws 0x415bc0 (the reserve has no such
   test at all). */
extern "C" int32_t isaac_sfx_vec_count_max(uint32_t count) {
  return count == ISAAC_SFX_VEC_MAX_COUNT ? 1 : 0;
}

/* 0x40cf7d `cmp size,0x10 ; jae 0x40cf9c` â€” JAE polarity: the copy-ctor
   copies SSO inline iff size < 0x10. */
extern "C" int32_t isaac_sfx_string_copy_sso(uint32_t size) {
  return size < ISAAC_SFX_STRING_SSO_LIMIT ? 1 : 0;
}

/* 0x40cf9c..0x40cfa8: the copy-ctor heap cap = size|0xf clamped at
   0x7fffffff (cmp ebx,eax ; cmova â€” UNSIGNED). No 1.5x, no floor. */
extern "C" uint32_t isaac_sfx_string_copy_cap(uint32_t size) {
  uint32_t cap = (size | ISAAC_SFX_STRING_SSO_CAP) & 0xffffffffu;
  return cap > ISAAC_SFX_STRING_CAP_CLAMP ? ISAAC_SFX_STRING_CAP_CLAMP : cap;
}

/* 0xa178f9 `test path,path ; je 0xa1799a` (FULL-WORD NULL) then
   0xa17901 `cmp byte [path],0 ; je 0xa1799a` (LOW-BYTE empty) â€” either
   skips the open. */
extern "C" int32_t isaac_sfx_file_open_path_gate(uint32_t path_ptr,
                                                 uint32_t first_byte) {
  if (path_ptr == 0u) {
    return 0;
  }
  return low_byte(first_byte) == 0u ? 0 : 1;
}

/* 0xa1792a `cmp dword ptr [ebp+8],0 ; jne 0xa1794e` â€” FULL-WORD open
   result flag (wide 0x100 drives). */
extern "C" int32_t isaac_sfx_file_open_flag_gate(uint32_t flag) {
  return flag != 0u ? 1 : 0;
}

extern "C" void isaac_sfx_table_clear_plan(int32_t begin_null,
                                           int32_t size_span_bytes,
                                           int32_t cap_span_bytes,
                                           IsaacSfxTableClearPlan* out) {
  if (out == nullptr) {
    return;
  }
  /* PE 0x0092d1c9: the guard compares a local of this frame with the
     caller's `this`; it can never be taken. Modelled, not deleted. */
  out->self_assign_guard_taken = 0;
  /* PE 0x0092d1d7 / 0x0092d1e3 / 0x0092d1f0 â€” all three slots are zeroed
     before the first destructor call, so a re-entrant destructor observes an
     empty vector rather than a half-destroyed one. */
  out->detach_stores = 3;
  out->detach_before_destroy = 1;

  if (begin_null != 0) {
    out->destroy_loop_enter = 0;
    out->elements_destroyed = 0;
    out->free_needed = 0;
    out->free_bytes = 0;
    out->free_span_rounded_down = 0;
    out->pure_complete = 1;
    return;
  }
  /* PE 0x0092d1ff: cmp begin,end ; je 0x0092d297 â€” an empty-but-allocated
     vector skips every destructor and still frees the block. */
  const int32_t enter = size_span_bytes != 0 ? 1 : 0;
  out->destroy_loop_enter = enter;
  out->elements_destroyed = enter != 0 ? entry_count_impl(size_span_bytes) : 0;
  out->free_needed = 1;
  /* PE 0x0092d299 + 0x0092d2aa: the count is divided out and multiplied back,
     so a capacity span that is not a whole number of elements is rounded
     DOWN before it reaches the deallocator. */
  const int32_t cap_count = entry_count_impl(cap_span_bytes);
  const int32_t bytes = static_cast<int32_t>(
      static_cast<uint32_t>(cap_count) *
      static_cast<uint32_t>(ISAAC_SFX_ENTRY_STRIDE));
  out->free_bytes = bytes;
  out->free_span_rounded_down = bytes != cap_span_bytes ? 1 : 0;
  out->pure_complete = 0;
}

/* ---------- SE: resize to 0x443 elements (v4) ---------- */

extern "C" int32_t isaac_sfx_table_target_bytes(void) {
  return static_cast<int32_t>(
      static_cast<uint32_t>(ISAAC_SFX_TABLE_TARGET_COUNT) *
      static_cast<uint32_t>(ISAAC_SFX_ENTRY_STRIDE));
}

extern "C" int32_t isaac_sfx_table_resize_action(uint32_t size_count,
                                                 uint32_t capacity_count) {
  const uint32_t target = static_cast<uint32_t>(ISAAC_SFX_TABLE_TARGET_COUNT);
  /* PE 0x0092d2f2: cmp size,0x443 ; jbe â€” UNSIGNED. */
  if (size_count > target) {
    return ISAAC_SFX_TABLE_RESIZE_SHRINK;
  }
  /* PE 0x0092d320: `jae` on the SAME flags â€” equality falls out here. */
  if (size_count == target) {
    return ISAAC_SFX_TABLE_RESIZE_NONE;
  }
  /* PE 0x0092d33e: cmp capacity,0x443 ; jae â€” UNSIGNED. */
  if (capacity_count >= target) {
    return ISAAC_SFX_TABLE_RESIZE_GROW_INPLACE;
  }
  return ISAAC_SFX_TABLE_RESIZE_GROW_REALLOC;
}

extern "C" void isaac_sfx_table_resize_plan(uint32_t size_count,
                                            uint32_t capacity_count,
                                            IsaacSfxTableResizePlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t action =
      isaac_sfx_table_resize_action(size_count, capacity_count);
  const uint32_t target = static_cast<uint32_t>(ISAAC_SFX_TABLE_TARGET_COUNT);
  out->action = action;
  out->target_count = ISAAC_SFX_TABLE_TARGET_COUNT;
  out->destroy_range_needed = action == ISAAC_SFX_TABLE_RESIZE_SHRINK ? 1 : 0;
  out->append_needed = action == ISAAC_SFX_TABLE_RESIZE_GROW_INPLACE ? 1 : 0;
  out->grow_needed = action == ISAAC_SFX_TABLE_RESIZE_GROW_REALLOC ? 1 : 0;
  /* The capacity load at 0x0092d32d only happens on the size < target arm. */
  out->capacity_read = (action == ISAAC_SFX_TABLE_RESIZE_GROW_INPLACE ||
                        action == ISAAC_SFX_TABLE_RESIZE_GROW_REALLOC)
                           ? 1
                           : 0;
  /* PE 0x0092d360: mov eax,0x443 ; sub eax,size â€” 32-bit wrap, and only the
     in-place arm reaches it. */
  out->append_count = action == ISAAC_SFX_TABLE_RESIZE_GROW_INPLACE
                          ? target - size_count
                          : 0u;
  out->new_end_offset = action == ISAAC_SFX_TABLE_RESIZE_SHRINK
                            ? isaac_sfx_table_target_bytes()
                            : 0;
  out->pure_complete = action == ISAAC_SFX_TABLE_RESIZE_NONE ? 1 : 0;
}

/* ---------- proven-dead branch registry (v4) ---------- */

extern "C" int32_t isaac_sfx_dead_branch_count(void) {
  return ISAAC_SFX_DEAD_BRANCH_COUNT;
}

extern "C" void isaac_sfx_dead_branch(int32_t id, IsaacSfxDeadBranch* out) {
  if (out == nullptr) {
    return;
  }
  out->id = id;
  out->taken = 0;
  out->arithmetic_retained = 1;
  switch (id) {
    case ISAAC_SFX_DEAD_BRANCH_PLAY_VOICE_DIV_GUARD:
      out->va = 0x0092dd7eu;
      return;
    case ISAAC_SFX_DEAD_BRANCH_TABLE_SELF_ASSIGN:
      out->va = 0x0092d1c9u;
      return;
    default:
      out->id = -1;
      out->va = 0u;
      out->arithmetic_retained = 0;
      return;
  }
}

/* ---------- v5: attribute walks + fill control (0x0092d140 C/D) -------- */

namespace {

/* The four attribute constants plus "sample", in constant-table order.
   .rdata reads of this image, hash-bound (see section-notes/sfx-v5/). */
constexpr const char* kAttrConstant[ISAAC_SFX_ATTR_CONSTANT_COUNT] = {
    "id", "name", "path", "weight", "sample"};

constexpr uint32_t kAttrConstantVa[ISAAC_SFX_ATTR_CONSTANT_COUNT] = {
    ISAAC_SFX_ATTR_NAME_ID_VA,
    ISAAC_SFX_ATTR_NAME_NAME_VA,
    ISAAC_SFX_ATTR_NAME_PATH_VA,
    ISAAC_SFX_ATTR_NAME_WEIGHT_VA,
    ISAAC_SFX_XML_SAMPLE_ELEMENT_VA};

static_assert(ISAAC_SFX_XML_SAMPLE_NAME_LEN == 6, "strlen of \"sample\"");

inline uint8_t byte_at(int32_t ptr, int32_t index) {
  const auto* p = reinterpret_cast<const uint8_t*>(
      static_cast<uintptr_t>(static_cast<uint32_t>(ptr)));
  return p[index];
}

/* The PE walks bytes at [name+0], [name+1], ... two per iteration, and
   `cmp dl,[ecx]` compares UNSIGNED bytes. The sbb/or tail maps a first
   differing byte to -1 when name[i] < const[i], else +1. `name_len` must
   include the terminating NUL; a truncated name compares as if it ended at
   name_len (0 vs the constant byte). */
inline int32_t attr_strcmp_impl(int32_t name_null,
                                int32_t name_ptr,
                                int32_t name_len,
                                int32_t constant_index) {
  if (constant_index < 0 || constant_index >= ISAAC_SFX_ATTR_CONSTANT_COUNT) {
    return 1;
  }
  const char* s = kAttrConstant[constant_index];
  const int32_t clen = static_cast<int32_t>(__builtin_strlen(s));
  /* PE: mov eax,<empty> ; test edi,edi ; cmovne eax,edi â€” the name pointer
     test is FULL-WORD, so 0x100 is NOT null. */
  if (name_null != 0) {
    return clen == 0 ? 0 : -1; /* "" < any non-empty constant */
  }
  const int32_t n = name_len < 0 ? 0 : name_len;
  for (int32_t i = 0; i < n; ++i) {
    const uint8_t a = byte_at(name_ptr, i);
    const uint8_t b = static_cast<uint8_t>(i < clen ? s[i] : 0);
    if (a != b) {
      return a < b ? -1 : 1;
    }
    if (a == 0u) {
      return 0;
    }
  }
  /* No NUL inside the provided range: truncated per the caller contract. */
  if (n == clen) {
    return 0;
  }
  return n < clen ? -1 : 1;
}

inline int32_t arm_impl(int32_t cmp_first, int32_t cmp_second) {
  /* PE 0x0092d550: `test eax,eax ; je armA` â€” the second compare is only
     reached when the first did not match. */
  if (cmp_first == 0) {
    return ISAAC_SFX_ATTR_ARM_FIRST;
  }
  if (cmp_second == 0) {
    return ISAAC_SFX_ATTR_ARM_SECOND;
  }
  return ISAAC_SFX_ATTR_ARM_NONE;
}

inline int32_t arm_action_impl(int32_t arm, int32_t site) {
  if (arm == ISAAC_SFX_ATTR_ARM_NONE) {
    return ISAAC_SFX_ATTR_ACTION_NONE;
  }
  const int32_t first_is_parse = site == ISAAC_SFX_ATTR_SITE_SLOT ? 0 : 1;
  const int32_t is_first = arm == ISAAC_SFX_ATTR_ARM_FIRST ? 1 : 0;
  if (first_is_parse == is_first) {
    return ISAAC_SFX_ATTR_ACTION_NUMERIC_PARSE;
  }
  return ISAAC_SFX_ATTR_ACTION_STRING_ASSIGN;
}

inline int32_t walk_continue_impl(int32_t next_flag_nonzero,
                                  int32_t next_null) {
  /* PE 0x0092d59f: cmp dword [esi+0x10],0 ; je end
           0x0092d5a5: mov esi,[esi+0x18] ; test esi,esi ; jne loop */
  if (next_flag_nonzero == 0) {
    return 0;
  }
  return next_null == 0 ? 1 : 0;
}

inline int32_t attr_strlen_impl(int32_t value_null,
                                int32_t value_ptr,
                                int32_t max_len) {
  /* PE: lea edi,[ecx+1] ; loop { al=[ecx] ; inc ; test al,al ; jne } ;
     sub ecx,edi â€” bytes until the NUL. */
  if (value_null != 0) {
    return 0; /* the cmovne empty-string fallback */
  }
  const int32_t n = max_len < 0 ? 0 : max_len;
  for (int32_t i = 0; i < n; ++i) {
    if (byte_at(value_ptr, i) == 0u) {
      return i;
    }
  }
  return n;
}

inline int32_t node_is_sample_impl(int32_t name_len,
                                   int32_t name_ptr,
                                   int32_t name_cap) {
  /* PE 0x0092d859: cmp eax,edi ; jne next  (edi == 6, the strlen of
     "sample") â€” the length gate runs BEFORE the byte compare. */
  if (name_len != ISAAC_SFX_XML_SAMPLE_NAME_LEN) {
    return 0;
  }
  if (name_cap < ISAAC_SFX_XML_SAMPLE_NAME_LEN) {
    return 0; /* caller under-supplied the buffer */
  }
  for (int32_t i = 0; i < ISAAC_SFX_XML_SAMPLE_NAME_LEN; ++i) {
    if (byte_at(name_ptr, i) !=
        static_cast<uint8_t>(kAttrConstant[4][i])) {
      return 0;
    }
  }
  return 1;
}

/* Shared fill-plan core; every arm reaches a host action (the append push
   at 0x92e830/0x92e900, the warn at 0x00a112c0, or the fill copies), so
   pure_complete is 0 by construction. */
inline void table_fill_plan_impl(uint32_t append_flag,
                                 int32_t id,
                                 int32_t id_after_warn,
                                 int32_t span_bytes,
                                 int32_t string_self_assign,
                                 IsaacSfxTableFillPlan* out) {
  if (out == nullptr) {
    return;
  }
  /* PE 0x0092d1ba: cmp byte [ebx+0xc],0 ; jne append â€” LOW-BYTE test. */
  const int32_t append =
      (append_flag & 0xffu) != 0u ? 1 : 0;
  out->append_mode = append;
  out->pure_complete = 0;
  out->entry_string_assign = 0;
  if (append != 0) {
    /* 0x0092d5c0: the shared magic divide over (end-begin); the id read
       before the arm is DISCARDED and replaced by the count. */
    const int32_t count = entry_count_impl(span_bytes);
    out->count_recomputed = 1;
    out->target_index = count;
    out->out_of_bounds_warn = 0;
    out->id_recheck_needed = 0;
    out->fill_skipped = 0;
    out->fill_needed = 1;
  } else {
    out->count_recomputed = 0;
    out->target_index = id;
    /* 0x0092d6c4: test eax,eax ; js fill  (negative id fills directly)
       0x0092d6c8: cmp eax,0x443 ; jl fill â€” SIGNED compares. */
    const int32_t warn = id >= ISAAC_SFX_TABLE_TARGET_COUNT ? 1 : 0;
    out->out_of_bounds_warn = warn;
    out->id_recheck_needed = warn;
    /* 0x0092d6e4: the id RE-READ after the opaque warn call. */
    out->fill_skipped =
        warn != 0 && id_after_warn >= ISAAC_SFX_TABLE_TARGET_COUNT ? 1 : 0;
    out->fill_needed = out->fill_skipped == 0 ? 1 : 0;
  }
  out->target_offset = entry_offset_impl(out->target_index);
  out->slot_copies = out->fill_needed != 0 ? 7 : 0;
  out->header_stores = out->fill_needed != 0 ? 6 : 0;
  out->tail_copies = out->fill_needed != 0 ? 14 : 0;
  out->entry_string_assign =
      out->fill_needed != 0 && string_self_assign == 0 ? 1 : 0;
}

}  // namespace

extern "C" int32_t isaac_sfx_attr_constant_len(int32_t constant_index) {
  if (constant_index < 0 || constant_index >= ISAAC_SFX_ATTR_CONSTANT_COUNT) {
    return 0;
  }
  return static_cast<int32_t>(__builtin_strlen(kAttrConstant[constant_index]));
}

extern "C" uint32_t isaac_sfx_attr_constant_va(int32_t constant_index) {
  if (constant_index < 0 || constant_index >= ISAAC_SFX_ATTR_CONSTANT_COUNT) {
    return 0;
  }
  return kAttrConstantVa[constant_index];
}

extern "C" int32_t isaac_sfx_attr_strcmp(int32_t name_null,
                                         int32_t name_ptr,
                                         int32_t name_len,
                                         int32_t constant_index) {
  return attr_strcmp_impl(name_null, name_ptr, name_len, constant_index);
}

extern "C" int32_t isaac_sfx_attr_arm(int32_t cmp_first, int32_t cmp_second) {
  return arm_impl(cmp_first, cmp_second);
}

extern "C" int32_t isaac_sfx_attr_arm_action(int32_t arm, int32_t site) {
  /* Non-zero site means SLOT, mirroring the normalize_form convention. */
  return arm_action_impl(arm, site != 0 ? ISAAC_SFX_ATTR_SITE_SLOT
                                        : ISAAC_SFX_ATTR_SITE_ENTRY);
}

extern "C" int32_t isaac_sfx_attr_value_strlen(int32_t value_null,
                                               int32_t value_ptr,
                                               int32_t max_len) {
  return attr_strlen_impl(value_null, value_ptr, max_len);
}

extern "C" int32_t isaac_sfx_attr_walk_continue(int32_t next_flag_nonzero,
                                                int32_t next_null) {
  return walk_continue_impl(next_flag_nonzero, next_null);
}

extern "C" int32_t isaac_sfx_xml_node_is_sample(int32_t name_len,
                                                int32_t name_ptr,
                                                int32_t name_cap) {
  return node_is_sample_impl(name_len, name_ptr, name_cap);
}

extern "C" int32_t isaac_sfx_table_append_flag(uint32_t flag) {
  return (flag & 0xffu) != 0u ? 1 : 0;
}

extern "C" void isaac_sfx_attr_walk(int32_t head_null,
                                    const IsaacSfxAttrSample* samples,
                                    int32_t count,
                                    int32_t site,
                                    IsaacSfxAttrWalkPlan* out) {
  if (out == nullptr) {
    return;
  }
  out->attrs_visited = 0;
  out->numeric_count = 0;
  out->string_count = 0;
  out->inert_count = 0;
  out->value_fallback_count = 0;
  out->numeric_mask = 0u;
  out->string_mask = 0u;
  out->fallback_mask = 0u;
  out->host_parse_needed = 0;
  out->host_assign_needed = 0;
  out->pure_complete = 1;
  if (head_null != 0 || samples == nullptr || count <= 0) {
    return;
  }
  /* Non-zero site means SLOT, mirroring the normalize_form convention; the
     same normalized value drives the constants AND the arm-action mapping. */
  const int32_t site_n = site != 0 ? ISAAC_SFX_ATTR_SITE_SLOT
                                   : ISAAC_SFX_ATTR_SITE_ENTRY;
  const int32_t first =
      site_n == ISAAC_SFX_ATTR_SITE_SLOT ? 2 : 0; /* SLOT: path ; ENTRY: id */
  const int32_t second =
      site_n == ISAAC_SFX_ATTR_SITE_SLOT ? 3 : 1; /* SLOT: weight; ENTRY: name */
  const int32_t n = count;
  for (int32_t i = 0; i < n; ++i) {
    const IsaacSfxAttrSample& s = samples[i];
    out->attrs_visited = i + 1;
    const int32_t cmp_first = attr_strcmp_impl(
        s.name_null, s.name_ptr, s.name_len, first);
    int32_t arm;
    if (cmp_first == 0) {
      arm = ISAAC_SFX_ATTR_ARM_FIRST;
    } else {
      /* The PE computes the second compare only when the first missed. */
      const int32_t cmp_second = attr_strcmp_impl(
          s.name_null, s.name_ptr, s.name_len, second);
      arm = cmp_second == 0 ? ISAAC_SFX_ATTR_ARM_SECOND
                            : ISAAC_SFX_ATTR_ARM_NONE;
    }
    const int32_t action = arm_action_impl(arm, site_n);
    if (action == ISAAC_SFX_ATTR_ACTION_NUMERIC_PARSE) {
      out->numeric_count += 1;
      if (i < 32) {
        out->numeric_mask |= 1u << static_cast<uint32_t>(i);
      }
    } else if (action == ISAAC_SFX_ATTR_ACTION_STRING_ASSIGN) {
      out->string_count += 1;
      if (i < 32) {
        out->string_mask |= 1u << static_cast<uint32_t>(i);
      }
    } else {
      out->inert_count += 1;
    }
    if (arm != ISAAC_SFX_ATTR_ARM_NONE && s.value_null != 0) {
      out->value_fallback_count += 1;
      if (i < 32) {
        out->fallback_mask |= 1u << static_cast<uint32_t>(i);
      }
    }
    if (walk_continue_impl(s.next_flag, s.next_null) == 0) {
      break;
    }
  }
  out->host_parse_needed = out->numeric_count > 0 ? 1 : 0;
  out->host_assign_needed = out->string_count > 0 ? 1 : 0;
  out->pure_complete = (out->numeric_count == 0 && out->string_count == 0) ? 1
                                                                           : 0;
}

extern "C" void isaac_sfx_table_fill_plan(uint32_t append_flag,
                                          int32_t id,
                                          int32_t id_after_warn,
                                          int32_t span_bytes,
                                          int32_t string_self_assign,
                                          IsaacSfxTableFillPlan* out) {
  table_fill_plan_impl(append_flag, id, id_after_warn, span_bytes,
                       string_self_assign, out);
}

extern "C" void isaac_sfx_sample_slot_plan(uint32_t voice_count,
                                           IsaacSfxSampleSlotPlan* out) {
  if (out == nullptr) {
    return;
  }
  /* PE 0x0092d8ac: cmp ecx,7 ; jae warn â€” UNSIGNED. */
  const int32_t overflow = voice_count >= ISAAC_SFX_MAX_SAMPLES_PER_SOUND
                               ? 1
                               : 0;
  out->overflow = overflow;
  if (overflow != 0) {
    out->slot_offset = 0;
    out->count_after = static_cast<int32_t>(voice_count); /* unchanged */
    out->attr_walk_needed = 0;
    out->pure_complete = 0; /* the warn log is host */
    return;
  }
  /* PE 0x0092d8b5..0x0092d8c1: lea eax,[count*8] ; sub eax,count ;
     shl eax,3 ; add eax,8 â€” 32-bit wrap at each step, == count*0x38+8. */
  const uint32_t c = voice_count;
  const uint32_t slot =
      ((c * 8u - c) * 8u) + 8u;
  out->slot_offset = static_cast<int32_t>(slot);
  out->count_after = static_cast<int32_t>(c + 1u);
  out->attr_walk_needed = 1;
  /* The count store is pure; attr-driven host actions are reported by the
     walk plan. */
  out->pure_complete = 1;
}

extern "C" int32_t isaac_sfx_slot_weight_offset(int32_t index) {
  /* PE 0x0092da49: mov dword [ecx+0x34],eax â€” the dword at slot+0x34, i.e.
     entry + 0x3c + index*0x38 (slot base is entry+8+index*0x38). The fill
     loop's tail dword copy at 0x0092d79e writes the same entry-relative
     offset, and stream_byte_offset(index)+4 agrees. */
  return static_cast<int32_t>(static_cast<uint32_t>(index) *
                                  static_cast<uint32_t>(ISAAC_SFX_VOICE_STRIDE) +
                              8u + static_cast<uint32_t>(ISAAC_SFX_SLOT_OFF_WEIGHT_34));
}

/* ---------- v6: post-samples tail 0x0092da86..0x0092db29 ---------- */

namespace {

/* The proto name-string teardown (0x92daa4..0x92db09). The free decision is
   the SAME cap-based MSVC string shape v4 isolates in
   isaac_sfx_string_free_plan; the three reset stores run on BOTH paths â€”
   the `jb` at 0x92daad joins at 0x92dade, past the free, and the reset
   stores sit between the arg pushes and the __ehvec_dtor call. */
inline void proto_teardown_impl(uint32_t proto_capacity,
                                uint32_t proto_ptr_minus_back,
                                IsaacSfxTailPlan* out) {
  IsaacSfxStringFreePlan f;
  isaac_sfx_string_free_plan(proto_capacity, proto_ptr_minus_back, &f);
  out->proto_free_needed = f.free_needed;
  out->proto_uses_back_pointer = f.uses_back_pointer;
  out->proto_free_size = f.free_size;
  out->proto_slack_checked = f.slack_checked;
  out->proto_corrupt_fatal = f.corrupt_fatal;
  out->proto_reset_stores = 3;
  /* __ehvec_dtor(base=[ebp-0x103f8], 0x38, 7, 0x92cf10) â€” the identical
     triple v4 isolates from the entry side (0x92d24a). */
  IsaacSfxVoiceDtorArgs d;
  isaac_sfx_entry_voice_dtor_args(&d);
  out->dtor_runs = 1;
  out->dtor_count = d.count;
  out->dtor_stride = d.stride;
  out->dtor_va = d.dtor_va;
  out->free_before_dtor = 1;
  out->reset_before_dtor = 1;
}

constexpr int32_t kFillHeaderOffset[ISAAC_SFX_FILL_HEADER_COUNT] = {
    ISAAC_SFX_FILL_HEADER_OFF_0, ISAAC_SFX_FILL_HEADER_OFF_1,
    ISAAC_SFX_FILL_HEADER_OFF_2, ISAAC_SFX_FILL_HEADER_OFF_3,
    ISAAC_SFX_FILL_HEADER_OFF_4};

}  // namespace

extern "C" uint32_t isaac_sfx_preload_counter_after(uint32_t before) {
  /* PE 0x0092da9d: inc dword ptr [esi+0xc] â€” 32-bit wrap. */
  return before + 1u;
}

extern "C" int32_t isaac_sfx_tail_chain_continue(int32_t next_node_nonzero) {
  /* PE 0x0092db21: test esi,esi ; jne 0x92d470 â€” FULL-WORD null test, so
     a next of 0x100 is a live link, not null. */
  return next_node_nonzero != 0 ? 1 : 0;
}

extern "C" void isaac_sfx_tail_plan(int32_t entry_index,
                                    uint32_t counter_before,
                                    uint32_t proto_capacity,
                                    uint32_t proto_ptr_minus_back,
                                    int32_t next_node,
                                    IsaacSfxTailPlan* out) {
  if (out == nullptr) {
    return;
  }
  /* 0x92da86: imul ecx,[ebp-0x10264],0x1b8 â€” the shared wrap multiply. */
  out->entry_index = entry_index;
  out->entry_offset = entry_offset_impl(entry_index);
  /* 0x92da98: call 0x92cfb0 â€” always runs, always first. */
  out->load_needed = 1;
  /* 0x92da9d: inc dword [mgr+0xc]. */
  out->counter_before = counter_before;
  out->counter_after = counter_before + 1u;
  proto_teardown_impl(proto_capacity, proto_ptr_minus_back, out);
  /* The Load call and the counter step are both BEFORE the proto free â€”
     the free-after-last-use ordering the PE obeys. */
  out->load_before_free = 1;
  /* 0x92db18..0x92db23: next = sound[0x2c]; test; jne 0x92d470. */
  const int32_t loop = next_node != 0 ? 1 : 0;
  out->loop_back = loop;
  out->exit_reached = loop == 0 ? 1 : 0;
  out->pure_complete = 0; /* Load, the free and the dtor are host */
}

extern "C" void isaac_sfx_sound_chain_plan(int32_t head_nonzero,
                                           const uint32_t* next_links,
                                           int32_t count,
                                           IsaacSfxSoundChainPlan* out) {
  if (out == nullptr) {
    return;
  }
  out->head_nonzero = 0;
  out->sounds_visited = 0;
  out->loops_back = 0;
  out->stops_at_null = 0;
  out->truncated = 0;
  out->pure_complete = 1;
  /* 0x92d466: test esi,esi ; je 0x92db29 â€” no head, straight to the
     epilogue. */
  if (head_nonzero == 0) {
    return;
  }
  out->head_nonzero = 1;
  if (next_links == nullptr || count <= 0) {
    /* Nothing walked: the array bound already hid the chain's end. */
    out->truncated = 1;
    return;
  }
  for (int32_t i = 0; i < count; ++i) {
    out->sounds_visited = i + 1;
    /* next_links[i] == 0: sound[i][0x2c] is NULL -> the chain stops after
       this node (the 0x92db21 test does not take the jne). Any non-zero
       value is a LIVE link â€” full-word test, 0x100 included. */
    if (next_links[i] == 0u) {
      out->loops_back = i;
      out->stops_at_null = 1;
      return;
    }
  }
  /* The array ran out before any NULL link: the PE would keep walking.
     Model bound, reported, never silently ended. */
  out->loops_back = count;
  out->truncated = 1;
}

extern "C" int32_t isaac_sfx_fill_header_offset(int32_t index) {
  if (index < 0 || index >= ISAAC_SFX_FILL_HEADER_COUNT) {
    return -1;
  }
  return kFillHeaderOffset[index];
}

extern "C" int32_t isaac_sfx_fill_header_uninitialized(int32_t index) {
  if (index < 0 || index >= ISAAC_SFX_FILL_HEADER_COUNT) {
    return 0;
  }
  /* The proto builder at 0x92d494..0x92d4c3 writes 0x190 / 0x198 / 0x19c
     and the string, but NEVER the movss source [ebp-0x1026c] (0x194) nor
     the byte [ebp-0x10267] (0x199) â€” those copies are garbage. */
  return static_cast<int32_t>(
      (ISAAC_SFX_FILL_HEADER_UNINIT_MASK >> static_cast<uint32_t>(index)) &
      1u);
}

extern "C" void isaac_sfx_warn_stack(int32_t warn_kind,
                                     IsaacSfxWarnStack* out) {
  if (out == nullptr) {
    return;
  }
  if (warn_kind == ISAAC_SFX_WARN_KIND_OUT_OF_BOUNDS) {
    /* 0x92d6cf: push 0xb7b170 ; push 0x10 ; call 0xa112c0 â€” the format's
       "%d" has NO vararg word. Original defect, reproduced. */
    out->arg_count = ISAAC_SFX_OUT_OF_BOUNDS_WARN_ARGS;
    out->vararg_count = ISAAC_SFX_OUT_OF_BOUNDS_WARN_VARARGS;
    out->level = ISAAC_SFX_OUT_OF_BOUNDS_WARN_LEVEL;
    out->format_string_va = ISAAC_SFX_OUT_OF_BOUNDS_WARN_VA;
    return;
  }
  if (warn_kind == ISAAC_SFX_WARN_KIND_MAX_SAMPLES) {
    /* 0x92da76: push index ; push 0xb7b220 ; push 1 â€” the index IS
       supplied here. */
    out->arg_count = ISAAC_SFX_MAX_SAMPLES_WARN_ARGS;
    out->vararg_count = ISAAC_SFX_MAX_SAMPLES_WARN_VARARGS;
    out->level = ISAAC_SFX_MAX_SAMPLES_WARN_LEVEL;
    out->format_string_va = ISAAC_SFX_MAX_SAMPLES_WARN_VA;
    return;
  }
  if (warn_kind == ISAAC_SFX_WARN_KIND_PRELOAD) {
    /* 0x92cf7c..0x92cf89: push id ; push 0xb7b1c4 ; push 1 â€” the third
       shape, WITH its vararg (unlike the out-of-bounds defect). */
    out->arg_count = ISAAC_SFX_PRELOAD_WARN_ARGS;
    out->vararg_count = ISAAC_SFX_PRELOAD_WARN_VARARGS;
    out->level = ISAAC_SFX_PRELOAD_WARN_LEVEL;
    out->format_string_va = ISAAC_SFX_LOG_STR_PRELOAD_VA;
    return;
  }
  out->arg_count = 0;
  out->vararg_count = 0;
  out->level = 0;
  out->format_string_va = 0u;
}

/* ---------- SS: whole body of 0x0092e230 (ABI v7) ---------- */

extern "C" int32_t isaac_sfx_stop_writes_frame_end(int32_t gate_kind) {
  /* 0x0092e2a0 is the first instruction of the loop body and LIVE already
     proved [entry+0x190] != 0 (0x0092e270 `ja`), so the sentinel store runs
     on LIVE and only on LIVE. */
  return gate_kind == ISAAC_SFX_GATE_LIVE ? 1 : 0;
}

extern "C" void isaac_sfx_stop_plan(int32_t id,
                                    int32_t span_bytes,
                                    uint32_t voices_190,
                                    uint32_t enabled_198,
                                    const IsaacSfxStopVoiceSample* samples,
                                    int32_t count,
                                    IsaacSfxStopPlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t gate =
      isaac_sfx_mutator_gate(id, span_bytes, voices_190, enabled_198);

  out->gate_kind = gate;
  out->warn_log_needed =
      isaac_sfx_gate_warn_log_needed(gate, ISAAC_SFX_GATE_FORM_MUTATOR);
  out->frame_end_writes = 0;
  out->frame_end_value = 0;
  out->voices_visited = 0;
  out->probe_calls = 0;
  out->stop_calls = 0;
  out->pending_clear_mask = 0u;
  out->observable_stores = 0;
  out->device_calls = 0;

  if (isaac_sfx_stop_writes_frame_end(gate) != 0) {
    out->frame_end_value = ISAAC_SFX_STOP_FRAME_END_SENTINEL;

    const int32_t bound = (samples == nullptr || count < 0) ? 0 : count;
    for (int32_t i = 0; i < bound; ++i) {
      const IsaacSfxStopVoiceSample& s = samples[i];
      ++out->voices_visited;

      /* 0x0092e2a0 â€” unconditional, BEFORE the channel test. */
      ++out->frame_end_writes;
      ++out->observable_stores;

      if (s.channel_null == 0) {
        out->probe_calls +=
            isaac_sfx_probe_voice_probe_calls(s.channel_null, s.pending_09);

        if (isaac_sfx_voice_first_probe_needed(s.channel_null, s.pending_09) !=
                0 &&
            s.probe_first != 0) {
          /* 0x0092e2be */
          if (i < 32) {
            out->pending_clear_mask |= (1u << static_cast<uint32_t>(i));
          }
          ++out->observable_stores;
        }

        const int32_t act = isaac_sfx_voice_act(s.channel_null, s.pending_09,
                                                s.probe_first, s.probe_second);
        if (isaac_sfx_stop_clears_pending(act, s.channel_null_reload) != 0) {
          /* 0x0092e2dc call [vtbl+0x3c] then 0x0092e2df store. */
          ++out->stop_calls;
          if (i < 32) {
            out->pending_clear_mask |= (1u << static_cast<uint32_t>(i));
          }
          ++out->observable_stores;
        }
      }

      /* 0x0092e2e6 â€” the bound is re-read from the entry every iteration
         through the pointer pinned at 0x0092e267, so it is this sample's
         own value that decides whether the loop goes round again. */
      if (isaac_sfx_voice_loop_continue(static_cast<uint32_t>(i) + 1u,
                                        s.voices_reloaded) == 0) {
        break;
      }
    }
  }

  out->device_calls = out->probe_calls + out->stop_calls;
  out->pure_complete =
      (out->device_calls == 0 && out->observable_stores == 0) ? 1 : 0;
  out->host_is_logger_only = out->device_calls == 0 ? 1 : 0;
}

/* ---------- SQ: whole body of 0x0092e300 (ABI v7) ---------- */

extern "C" int32_t isaac_sfx_stop_all_group_action(uint32_t enabled_198,
                                                   uint32_t voices_190) {
  /* 0x0092e340 cmp byte [grp+0x198],0 ; je â€” a BYTE test, checked before
     the count. 0x0092e352 cmp dword [grp+0x190],ebx ; jbe with ebx just
     zeroed â€” unsigned, so it is exactly "count == 0", full word. */
  if (low_byte(enabled_198) == 0u) {
    return ISAAC_SFX_STOP_ALL_GROUP_DISABLED;
  }
  if (voices_190 == 0u) {
    return ISAAC_SFX_STOP_ALL_GROUP_EMPTY;
  }
  return ISAAC_SFX_STOP_ALL_GROUP_WALK;
}

extern "C" int32_t isaac_sfx_stop_all_group_restores_index(int32_t action) {
  /* An inbound-edge census over all of .text finds exactly TWO jumps into
     this tail â€” 0x0092e34a `je 0x92e3ec` and 0x0092e359 `jbe 0x92e3e9` â€” and
     0x0092e3e6 (the inner-loop exit) FALLS THROUGH into 0x0092e3e9. So the
     `mov ebx,[ebp-8]` restore runs on the EMPTY edge and after a completed
     WALK, and only the DISABLED edge skips it, because its test at
     0x0092e340 precedes the `xor ebx,ebx` at 0x0092e350 and ebx therefore
     still holds the group index. */
  return action == ISAAC_SFX_STOP_ALL_GROUP_DISABLED ? 0 : 1;
}

extern "C" void isaac_sfx_stop_all_voice_decide(
    const IsaacSfxStopAllVoiceSample* sample,
    IsaacSfxStopAllVoiceDecision* out) {
  if (out == nullptr) {
    return;
  }
  out->first_probe_needed = 0;
  out->second_probe_needed = 0;
  out->pending_cleared_early = 0;
  out->act = 0;
  out->query_needed = 0;
  out->query_from_loop_byte = 0;
  out->query_value = 0;
  out->stop_called = 0;
  out->pending_cleared_late = 0;
  out->probe_calls = 0;
  out->device_calls = 0;
  out->observable_stores = 0;
  if (sample == nullptr) {
    return;
  }

  const IsaacSfxStopAllVoiceSample& s = *sample;
  if (s.channel_null != 0) {
    /* 0x0092e365 test ecx,ecx ; je 0x0092e3cb â€” nothing at all happens. */
    return;
  }

  /* Stages 1 and 2 are byte-identical to the sibling, so they are taken
     from the SHARED helpers rather than restated. */
  out->first_probe_needed =
      isaac_sfx_voice_first_probe_needed(s.channel_null, s.pending_09);
  out->second_probe_needed = 1;
  out->probe_calls =
      isaac_sfx_probe_voice_probe_calls(s.channel_null, s.pending_09);
  if (out->first_probe_needed != 0 && s.probe_first != 0) {
    out->pending_cleared_early = 1; /* 0x0092e37b */
    ++out->observable_stores;
  }
  out->act = isaac_sfx_voice_act(s.channel_null, s.pending_09, s.probe_first,
                                 s.probe_second);
  if (out->act == 0) {
    out->device_calls = out->probe_calls;
    return;
  }

  /* Stage 3 â€” 0x0092e395..0x0092e3b5. THIS IS THE DIVERGENCE: the sibling
     has no third stage. The channel pointer is read a THIRD time and, when
     it has gone null, the PE does not skip â€” it substitutes the wrapper's
     +0x08 LOOP byte for the query result (0x0092e3a2 mov cl,[esi+eax+0x28]).
     Both sources are tested with `test cl,cl`, a low-byte test. */
  if (s.channel_null_third != 0) {
    out->query_from_loop_byte = 1;
    out->query_value = static_cast<int32_t>(low_byte(s.loop_08));
  } else {
    out->query_needed = 1;
    out->query_value = static_cast<int32_t>(low_byte(s.query_44));
  }
  if (out->query_value == 0) {
    /* 0x0092e3b5 je 0x0092e3cb â€” no stop, no late clear. */
    out->device_calls = out->probe_calls + out->query_needed;
    return;
  }

  /* Stage 4 â€” 0x0092e3b7 reads the pointer a FOURTH time and re-tests it. */
  if (s.channel_null_fourth == 0) {
    out->stop_called = 1;      /* 0x0092e3c4 call [vtbl+0x3c] */
    out->pending_cleared_late = 1; /* 0x0092e3c7 */
    ++out->observable_stores;
  }
  out->device_calls =
      out->probe_calls + out->query_needed + out->stop_called;
}

extern "C" void isaac_sfx_stop_all_plan(int32_t span_bytes,
                                        const IsaacSfxStopAllGroup* groups,
                                        int32_t group_count_supplied,
                                        const IsaacSfxStopAllVoiceSample*
                                            samples,
                                        int32_t voice_count_supplied,
                                        IsaacSfxStopAllPlan* out) {
  if (out == nullptr) {
    return;
  }
  /* The SAME signed magic divide the sibling and the whole family use. */
  const int32_t count = isaac_sfx_entry_count(span_bytes);

  out->group_count = count;
  out->returns_immediately = count == 0 ? 1 : 0;
  out->groups_visited = 0;
  out->groups_disabled = 0;
  out->groups_empty = 0;
  out->groups_walked = 0;
  out->index_restores = 0;
  out->voices_visited = 0;
  out->probe_calls = 0;
  out->query_calls = 0;
  out->stop_calls = 0;
  out->device_calls = 0;
  out->observable_stores = 0;
  /* 0x0092e300 contains no `mov [entry+4],-1` and no 0x00a112c0 edge at
     all â€” the census found 2 observable stores and 0 direct calls. Both
     are pinned as constants so a merge with the sibling cannot pass. */
  out->frame_end_writes = 0;
  out->logger_calls = 0;

  const int32_t group_bound =
      (groups == nullptr || group_count_supplied < 0) ? 0
                                                      : group_count_supplied;
  const int32_t voice_bound =
      (samples == nullptr || voice_count_supplied < 0) ? 0
                                                       : voice_count_supplied;

  /* 0x0092e32a is `je` on the flags of `add eax,edx`, so ONLY a zero count
     returns early; and the loop-back at 0x0092e416 is an UNSIGNED `jb`, so a
     negative count walks instead of exiting. Reproduced, not corrected â€” the
     supplied array is the model's own bound, not the PE's. */
  /* 0x0092e416 cmp ebx,eax ; jb â€” UNSIGNED, against the count the outer tail
     RE-DERIVES with a fresh divide every pass. It is spelled in the loop
     CONDITION, not as a bottom `break`, because both group-skip edges
     (0x0092e3ec, 0x0092e3e9) fall into that same tail: a `continue` past a
     bottom check would let a disabled group walk off the end of the vector. */
  if (count != 0) {
    for (int32_t g = 0;
         g < group_bound && static_cast<uint32_t>(g) < static_cast<uint32_t>(count);
         ++g) {
      const IsaacSfxStopAllGroup& grp = groups[g];
      ++out->groups_visited;
      const int32_t action =
          isaac_sfx_stop_all_group_action(grp.enabled_198, grp.voices_190);
      out->index_restores += isaac_sfx_stop_all_group_restores_index(action);
      if (action == ISAAC_SFX_STOP_ALL_GROUP_DISABLED) {
        ++out->groups_disabled;
        continue;
      }
      if (action == ISAAC_SFX_STOP_ALL_GROUP_EMPTY) {
        ++out->groups_empty;
        continue;
      }
      ++out->groups_walked;

      for (int32_t i = 0; i < voice_bound; ++i) {
        const int32_t slot = grp.first_voice + i;
        if (slot < 0 || slot >= voice_bound) {
          break;
        }
        const IsaacSfxStopAllVoiceSample& s = samples[slot];
        ++out->voices_visited;

        IsaacSfxStopAllVoiceDecision d;
        isaac_sfx_stop_all_voice_decide(&s, &d);
        out->probe_calls += d.probe_calls;
        out->query_calls += d.query_needed;
        out->stop_calls += d.stop_called;
        out->observable_stores += d.observable_stores;

        /* 0x0092e3d9 â€” the bound is re-read from BOTH a freshly reloaded
           vector base and the saved group offset, so it is per-iteration. */
        if (isaac_sfx_voice_loop_continue(static_cast<uint32_t>(i) + 1u,
                                          s.voices_reloaded) == 0) {
          break;
        }
      }
    }
  }

  out->device_calls = out->probe_calls + out->query_calls + out->stop_calls;
  out->pure_complete =
      (out->device_calls == 0 && out->observable_stores == 0) ? 1 : 0;
  out->host_is_logger_only = out->device_calls == 0 ? 1 : 0;
}

/* ---------- SX: the sibling divergence table (ABI v7) ---------- */

namespace {

struct SfxStopDivergenceRow {
  uint32_t stop_site;
  uint32_t stop_all_site;
  int32_t kind;
};

/* Nine places the two bodies differ, every VA read from the instruction
   stream. A 0 site means the step does not exist in that body at all. */
constexpr SfxStopDivergenceRow kSfxStopDivergences[] = {
    /* 0: the entry[+4] = -1 sentinel exists only in 0x0092e230. */
    {0x0092e2a0u, 0u, ISAAC_SFX_STOP_DIVERGE_ABSENT},
    /* 1: the "has no samples" warn log exists only in 0x0092e230. */
    {0x0092e27au, 0u, ISAAC_SFX_STOP_DIVERGE_ABSENT},
    /* 2: the vtbl[0x44] query stage exists only in 0x0092e300. */
    {0u, 0x0092e3adu, ISAAC_SFX_STOP_DIVERGE_ABSENT},
    /* 3: the null-channel fallback to the wrapper's +0x08 loop byte exists
          only in 0x0092e300 â€” a different FIELD, not just a branch. */
    {0u, 0x0092e3a2u, ISAAC_SFX_STOP_DIVERGE_ABSENT},
    /* 4: empty entry â€” the sibling warns and RETURNS, this one skips to the
          next group. Different disposition of the same test. */
    {0x0092e270u, 0x0092e359u, ISAAC_SFX_STOP_DIVERGE_DIFFERENT},
    /* 5: disabled entry â€” return vs next group. */
    {0x0092e290u, 0x0092e34au, ISAAC_SFX_STOP_DIVERGE_DIFFERENT},
    /* 6: range test â€” a SIGNED `js` on the id vs an equality `je` on the
          group count. 0x0092e300 takes no id at all. */
    {0x0092e23bu, 0x0092e32au, ISAAC_SFX_STOP_DIVERGE_DIFFERENT},
    /* 7: the inner bound â€” the sibling re-reads the count through a pointer
          PINNED at 0x0092e267, this one reloads the vector base first. */
    {0x0092e2e6u, 0x0092e3d5u, ISAAC_SFX_STOP_DIVERGE_DIFFERENT},
    /* 8: the outer group walk (unsigned `jb`) exists only in 0x0092e300. */
    {0u, 0x0092e416u, ISAAC_SFX_STOP_DIVERGE_ABSENT},
};

}  // namespace

extern "C" int32_t isaac_sfx_stop_divergence_count(void) {
  return ISAAC_SFX_STOP_DIVERGENCE_COUNT;
}

extern "C" void isaac_sfx_stop_divergence(int32_t id,
                                          IsaacSfxStopDivergence* out) {
  if (out == nullptr) {
    return;
  }
  out->id = id;
  out->stop_site = 0u;
  out->stop_all_site = 0u;
  out->kind = 0;
  if (id < 0 || id >= ISAAC_SFX_STOP_DIVERGENCE_COUNT) {
    out->id = -1;
    return;
  }
  const SfxStopDivergenceRow& row =
      kSfxStopDivergences[static_cast<unsigned>(id)];
  out->stop_site = row.stop_site;
  out->stop_all_site = row.stop_all_site;
  out->kind = row.kind;
}

/* ---------- toolchain defect guard (ABI v6) ---------- */

/* The Wasm ABI does not narrow i32 arguments, and -O2 deletes an in-body
   mask it can prove redundant for a uint8_t parameter, so a byte-gate
   export with a uint8_t scalar parameter silently disagrees with the PE
   for any argument above 0xff (AGENTS.md "Known toolchain defect").
   Every byte gate in this family takes uint32_t and narrows explicitly
   (low_byte / byte_at). This static check proves no export takes a
   uint8_t/uint16_t scalar parameter, so the guard cannot rot. */

/* Plain structs + the __is_same builtin on purpose: the syntax-check host
   clang++ ships no libc++ include paths, so <type_traits> is unavailable. */
template <typename... Ts>
struct sfx_has_narrow_scalar;
template <>
struct sfx_has_narrow_scalar<> {
  static constexpr bool value = false;
};
template <typename T, typename... Ts>
struct sfx_has_narrow_scalar<T, Ts...> {
  static constexpr bool value =
      (__is_same(T, uint8_t) || __is_same(T, uint16_t)) ||
      sfx_has_narrow_scalar<Ts...>::value;
};
template <typename R, typename... Ps>
struct sfx_has_narrow_scalar<R(Ps...)> {
  static constexpr bool value = sfx_has_narrow_scalar<Ps...>::value;
};

#define ISAAC_SFX_NO_NARROW_PARAMS(FN)                                       \
  static_assert(!sfx_has_narrow_scalar<decltype(FN)>::value,                 \
                #FN " must not take a uint8_t/uint16_t scalar parameter")

ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_entry_count);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_entry_offset);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_id_in_range);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_mutator_gate);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_play_gate);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_mutator_no_effect);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_gate_no_effect);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_probe_gate);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_gate_warn_log_needed);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_gate_plan);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_voice_base_offset);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_voice_pending_offset);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_voice_loop_continue);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_voice_first_probe_needed);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_voice_pending_after);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_voice_act);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_voice_decide);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_stop_clears_pending);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_stop_frame_end_value);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_volume_modifier_base);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_min_one);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_voice_volume_clamped);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_voice_volume_unclamped);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_play_frame_half);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_play_window_open);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_play_frame_end);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_rng_next);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_voice_select);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_voice_pick_offset);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_play_stream_flag_offset);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_play_plan);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_play_no_samples_host);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_play_preload_host);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_play_body_host);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_play_probe_needed);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_play_reset_needed);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_play_stream_name_ptr);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_play_set_loop_needed);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_play_set_pitch_needed);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_play_set_volume_needed);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_play_start_needed);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_play_pending_word);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_play_leaf_plan);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_clear_volume_walk_enter);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_clear_volume_entry_open);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_clear_volume_voice_enabled);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_clear_volume_plan);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_probe_voice_channel_offset);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_probe_voice_pending_offset);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_probe_voice_probe_calls);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_is_playing_known);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_is_playing_short_circuit_result);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_is_playing_walk);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_word_store_lo);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_word_store_hi);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_channel_reset_defaults);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_channel_reset_release_first);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_channel_assign_plan);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_pan_equals_neutral);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_channel_pan_action);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_channel_pan_plan);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_rng_defaults);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_load_voice_name_offset);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_load_voice_wrapper_offset);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_load_stream_byte_offset);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_load_path_len_fatal);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_load_compare_length);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_load_uses_heap_buffer);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_load_stream_byte);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_load_voice_slot_in_bounds);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_load_voice_aliases_entry_header);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_load_writes_entry_field);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_load_voice_plan);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_load_plan);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_play_recapture_mask);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_load_hook_plan);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_load_voice_free_plan);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_channel_pointer_swap);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_channel_copy_assign_plan);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_channel_start_plan);
/* v32 stream-census laws: no uint8_t/uint16_t scalar params (channel
   ctor/entry ctor take only the out pointer; release takes u32 args,
   body re-narrows the probe byte with low_byte). */
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_channel_ctor_defaults);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_channel_release_plan);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_entry_ctor_defaults);
/* v33 load-arm gate laws: uint32_t scalars only (no uint8_t/uint16_t). */
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_load_entry_gate);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_load_arm_plan);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_load_tail_abort_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_load_tail_fatal_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_load_tail_abort_iat_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_load_tail_fatal_callee_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_load_tail_abort_source_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_load_tail_fatal_source_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_load_tail_enable_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_load_tail_enable_inbounds);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_load_tail_count);
/* v34 audio-wrapper laws: uint32_t/int32_t scalars only — the byte
   gates are spelled `& 0xff` on full-width words, NO uint8_t. */
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_wrapper_init_gate);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_wrapper_byte_gate);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_wrapper_chain_gate);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_wrapper_mode);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_wrapper_mode_log_kind);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_wrapper_suffix_match);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_wrapper_suffix_kind);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_wrapper_arm);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_wrapper_arm_plan);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_wrapper_name_copy_needed);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_wrapper_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_wrapper_ret_imm);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_wrapper_body_edges);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_wrapper_direct_callers);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_wrapper_vtable_slot_sites);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_wrapper_fnptr_sites);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_wrapper_fnptr_thunk_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_wrapper_ogg_literal_share_sites);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_wrapper_hook_gates);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_wrapper_pair_move_callers);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_flag_bit_get);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_flag_bit_set);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_manager_flag_set1);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_manager_flag_clear1);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_wrapper_hook_install_plan);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_wrapper_hook_clear_plan);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_dtor_free_gate);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_walk_entry_gate);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_walk_probe_keep);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_wrapper_forward0_const);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_wrapper_forward1_const);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_map_found);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_cluster_direct_callers);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_cluster_body_count);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_flag_family_vtable_rows);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_hook_write_sites);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_hook_install_target);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_dtor_free_size);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_walk_bound_reload);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_init_gate_body_sites);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_init_walk_warn_needed);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_init_walk_body_runs);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_init_walk_step);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_init_walk_island_hook);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_map_construct_island2);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_map_construct_island3);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_map_construct_island1);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_map_construct_plan);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_init_walk_plan);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_map_construct_ret_imm);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_map_construct_stack_args);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_map_construct_arg3_dead);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_map_construct_vtable_rows);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_map_construct_seh_handler_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_map_construct_alloc_size);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_map_construct_node_member_off);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_map_construct_secondary_vtable_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_map_construct_hash_site);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_map_construct_find_site);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_map_construct_adopt1_site);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_map_construct_alloc_site);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_map_construct_ctor_site);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_map_construct_adopt2_site);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_map_construct_vtable_store_site);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_map_construct_field14_store_site);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_map_construct_hash_in_place_site);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_map_island1_site);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_map_island2_site);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_map_island3_site);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_init_walk_ret_imm);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_init_walk_stack_args);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_init_walk_vtable_rows);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_init_walk_seh_handler_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_init_walk_warn_site);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_init_walk_warn_fmt_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_init_walk_warn_level);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_init_walk_warn_stack_args);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_init_walk_member_off);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_init_walk_key_off);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_init_walk_node_b_off);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_init_walk_free_size);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_init_walk_advance_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_init_walk_remove_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_init_walk_find_site);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_init_walk_island_site);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_init_walk_free_site);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_init_walk_tail_site);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_entry_voice_dtor_args);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_string_free_plan);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_block_free_plan);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_table_clear_plan);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_table_resize_action);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_table_resize_plan);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_table_target_bytes);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_dead_branch_count);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_dead_branch);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_attr_walk);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_attr_strcmp);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_attr_arm);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_attr_arm_action);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_attr_value_strlen);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_attr_walk_continue);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_attr_constant_len);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_attr_constant_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_node_is_sample);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_table_append_flag);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_table_fill_plan);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_sample_slot_plan);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_slot_weight_offset);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_tail_plan);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_sound_chain_plan);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_preload_counter_after);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_tail_chain_continue);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_fill_header_offset);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_fill_header_uninitialized);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_warn_stack);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_stop_writes_frame_end);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_stop_plan);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_stop_all_group_action);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_stop_all_group_restores_index);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_stop_all_voice_decide);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_stop_all_plan);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_stop_divergence_count);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_stop_divergence);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_preload_pad_offset);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_preload_gate);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_preload_clears_pad);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_preload_plan);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_table_epilogue_plan);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_table_open_gate);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_table_read_plan);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_table_root_name_plan);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_table_proto_init_plan);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_table_push_plan);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_append_arm_count);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_append_arm_plan);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_doc_ctor_pool_base);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_doc_ctor_pool_end);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_doc_ctor_cursor);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_doc_ctor_align_slack);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_doc_ctor_writes_offset);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_doc_ctor_plan);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_doc_parse_head_live);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_doc_parse_bom_skip);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_doc_parse_is_space);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_doc_parse_gate);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_doc_parse_writes_this_offset);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_doc_parse_plan);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_attr_find_head_off);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_attr_find_next_off);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_child_find_head_off);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_child_find_next_off);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_attr_find_plan);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_child_find_plan);

/* ---------- v7: prove the guard SEES what it claims to check ----------

   ISAAC_SFX_NO_NARROW_PARAMS above is a NEGATIVE assertion, and a negative
   assertion passes when nothing was inspected. If `decltype(FN)` ever fails
   to match the `R(Ps...)` specialization the primary template answers false
   and every line in the block succeeds vacuously â€” the exact shape of
   failure AGENTS.md calls "a green suite can mean nothing was asserted".

   sfx_param_count has NO primary definition, so a type it cannot decompose
   is a hard compile error rather than a silent pass, and pinning the arity
   proves the parameter list the guard walked is the real one. Both halves
   are needed: `is_function` alone would still accept a zero-parameter
   decomposition of a function that actually takes six. */
template <typename T>
struct sfx_param_count;
template <typename R, typename... Ps>
struct sfx_param_count<R(Ps...)> {
  static constexpr bool is_function = true;
  static constexpr int value = static_cast<int>(sizeof...(Ps));
};

#define ISAAC_SFX_GUARD_SEES_PARAMS(FN, N)                                   \
  static_assert(sfx_param_count<decltype(FN)>::is_function,                  \
                #FN " signature was not decomposed â€” the narrowing guard "   \
                    "did not see its parameters");                           \
  static_assert(sfx_param_count<decltype(FN)>::value == (N),                 \
                #FN " parameter count changed â€” re-check the guard")

/* v7 exports. */
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_stop_writes_frame_end, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_stop_plan, 7);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_stop_all_group_action, 2);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_stop_all_group_restores_index, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_stop_all_voice_decide, 2);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_stop_all_plan, 6);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_stop_divergence_count, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_stop_divergence, 2);

/* Pre-v7 byte gates, so the "the guard sees its parameters" property is not
   only true of the newest block. */
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_mutator_gate, 4);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_voice_first_probe_needed, 2);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_voice_act, 4);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_entry_count, 1);

/* v8 exports. */
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_preload_pad_offset, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_preload_gate, 3);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_preload_clears_pad, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_preload_plan, 5);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_table_epilogue_plan, 5);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_append_arm_count, 2);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_append_arm_plan, 5);

/* v9 wave-2 XML-read exports. All params are full-width (no uint8_t). */
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_table_open_gate, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_table_read_plan, 2);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_table_root_name_plan, 4);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_table_proto_init_plan, 2);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_table_push_plan, 3);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_xml_doc_ctor_pool_base, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_xml_doc_ctor_pool_end, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_xml_doc_ctor_cursor, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_xml_doc_ctor_align_slack, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_xml_doc_ctor_writes_offset, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_xml_doc_ctor_plan, 2);

/* v11: 0x004155d0 XML document Parse islands. All params full-width. */
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_xml_doc_parse_head_live, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_xml_doc_parse_bom_skip, 3);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_xml_doc_parse_is_space, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_xml_doc_parse_gate, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_xml_doc_parse_writes_this_offset, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_xml_doc_parse_plan, 9);

/* v12: 0x00413bf0 / 0x00413c70 XML finds. All params full-width. */
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_xml_attr_find_head_off, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_xml_attr_find_next_off, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_xml_child_find_head_off, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_xml_child_find_next_off, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_xml_attr_find_plan, 3);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_xml_child_find_plan, 3);

/* v24: 0x92d140 callee growth/assign/copy/open gates. All params
   full-width, including the byte tests (0x100/0x1ff/0xffffffff drive). */
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_string_assign_grow, 2);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_string_assign_sso, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_string_grow_len_ok, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_string_grow_cap, 2);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_string_build_total, 2);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_string_build_sso, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_string_build_cap, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_grow_alloc_fast, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_grow_alloc_zero, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_grow_alloc_big_plan, 2);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_grow_alloc_align, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_vec_cap_gate, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_vec_push_grow_new, 2);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_vec_reserve_grow_new, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_vec_cap_overflow, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_vec_count_max, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_string_copy_sso, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_string_copy_cap, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_file_open_path_gate, 2);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_file_open_flag_gate, 1);

/* ---------- v8: 0x0092cf40 PreloadSound + the 0x0092d140 epilogue ------- */

extern "C" int32_t isaac_sfx_preload_pad_offset(void) {
  return ISAAC_SFX_PRELOAD_PAD_OFF_199;
}

extern "C" int32_t isaac_sfx_preload_gate(int32_t id,
                                          int32_t span_bytes,
                                          uint32_t enabled_198) {
  if (isaac_sfx_id_in_range(id, span_bytes) == 0) {
    /* 0x0092cf4b test edi,edi ; js / 0x0092cf67 cmp edi,count ; jge â€” both
       signed, shared with every other root. MISS: the entry is never even
       computed. */
    return ISAAC_SFX_PRELOAD_GATE_MISS;
  }
  /* 0x0092cf73 cmp byte [entry+0x198],0 ; jne 0x92cf96 â€” LOW-BYTE test and
     the INVERSE sense of the mutators: the enabled entry skips the load.
     No voice-count test exists anywhere in the body. */
  return low_byte(enabled_198) == 0 ? ISAAC_SFX_PRELOAD_GATE_LOAD
                                    : ISAAC_SFX_PRELOAD_GATE_ENABLED;
}

extern "C" int32_t isaac_sfx_preload_clears_pad(int32_t gate_kind) {
  /* 0x0092cf96 is reached from BOTH in-range arms (the jne target and the
     load path); only the two MISS exits skip it. */
  return gate_kind == ISAAC_SFX_PRELOAD_GATE_MISS ? 0 : 1;
}

extern "C" void isaac_sfx_preload_plan(int32_t id,
                                       int32_t span_bytes,
                                       uint32_t enabled_198,
                                       uint32_t counter_before,
                                       IsaacSfxPreloadPlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t gate =
      isaac_sfx_preload_gate(id, span_bytes, enabled_198);
  const int32_t in_range =
      gate == ISAAC_SFX_PRELOAD_GATE_MISS ? 0 : 1;
  const int32_t load = gate == ISAAC_SFX_PRELOAD_GATE_LOAD ? 1 : 0;

  out->gate_kind = gate;
  out->in_range = in_range;
  out->entry_offset = in_range != 0 ? entry_offset_impl(id) : 0;
  out->pad_cleared = in_range; /* 0x0092cf96, both arms */
  out->warn_log_needed = load; /* 0x0092cf84 */
  out->load_needed = load;     /* 0x0092cf8e */
  out->counter_step = load;    /* 0x0092cf93 */
  out->counter_before = counter_before;
  out->counter_after =
      load != 0 ? isaac_sfx_preload_counter_after(counter_before)
                : counter_before;
  out->host_calls = load != 0 ? 2 : 0; /* logger + SoundEffect::Load */
  out->observable_stores = in_range;   /* the pad byte, once */
  out->pure_complete = in_range != 0 ? 0 : 1;
  out->log_before_load = load;     /* 0x92cf84 -> 0x92cf8e */
  out->load_before_counter = load; /* 0x92cf8e -> 0x92cf93 */
  out->counter_before_pad = load;  /* 0x92cf93 -> 0x92cf96 */
}

extern "C" void isaac_sfx_table_epilogue_plan(uint32_t root_name_capacity,
                                              uint32_t root_name_ptr_minus_back,
                                              int32_t buffer_null,
                                              int32_t heap_state_null,
                                              IsaacSfxEpiloguePlan* out) {
  if (out == nullptr) {
    return;
  }
  /* 0x92db2d..0x92db60 â€” the same MSVC string free shape as the v4/v6
     sites: cap >= 0x10 to free, cap+1 size, >= 0x1000 to the back-pointer
     dance, slack-4 > 0x1f (UNSIGNED) to the abort. NO reset stores: the
     next instruction after `add esp,8` is the doc dtor. */
  IsaacSfxStringFreePlan sfp;
  isaac_sfx_string_free_plan(root_name_capacity, root_name_ptr_minus_back,
                             &sfp);

  out->root_name_free_needed = sfp.free_needed;
  out->root_uses_back_pointer = sfp.uses_back_pointer;
  out->root_free_size = sfp.free_size;
  out->root_slack_checked = sfp.slack_checked;
  out->root_corrupt_fatal = sfp.corrupt_fatal;
  out->root_reset_stores = 0; /* divergence from the v4/v6 sites, pinned */

  /* 0x92db63..0x92db70 â€” unconditional on every path that reaches the
     epilogue. */
  out->doc_dtor_runs = 1;
  out->doc_dtor_va = ISAAC_SFX_HOST_VA_DOC_DTOR_414730;

  /* 0x92db89..0x92db9f â€” the reader-buffer allocator teardown. */
  out->buffer_free_needed = buffer_null == 0 ? 1 : 0;
  out->buffer_free_va = ISAAC_SFX_HOST_VA_FREE_B187DC;
  out->crt_counter_stores = out->buffer_free_needed != 0
                                ? ISAAC_SFX_EPILOGUE_CRT_COUNTER_STORES
                                : 0;
  /* 0x92db75..0x92db84 â€” [0xc7de78] null -> fallback 0xc7f618, else
     +0x30. Both candidates are BSS (zero at load); the pointer value is
     host data, the SELECTION is pure. */
  out->counter_uses_fallback = heap_state_null != 0 ? 1 : 0;
  out->counter_fallback_va = ISAAC_SFX_EPILOGUE_HEAP_COUNTER_FALLBACK_VA;

  out->returns_al_1 = 1; /* 0x92dba8, every path that reaches it */
  /* The abort at 0x92db53 REPLACES the free at 0x92db5b â€” on the corrupt
     path the free is never reached. 0x92db70 doc dtor always runs. */
  out->host_calls =
      (out->root_corrupt_fatal != 0 ? 1
                                    : (out->root_name_free_needed != 0 ? 1
                                                                       : 0)) +
      1 +                      /* 0x92db70 doc dtor */
      out->buffer_free_needed; /* 0x92db9f IAT free */
  out->observable_stores = 0; /* only CRT counter bookkeeping (platform) */
  out->pure_complete = 0;     /* the doc dtor is unconditional */
  out->string_free_before_dtor = 1; /* 0x92db5b before 0x92db70 */
  out->dtor_before_buffer_free = 1; /* 0x92db70 before 0x92db9f */
}


/* ---------- v9: the 0x0092d140 append-arm skip law ---------- */

extern "C" int32_t isaac_sfx_append_arm_count(uint32_t src_begin,
                                              uint32_t src_end) {
  /* 0x92d5d1 mov ecx,[esi+4] ; sub ecx,[esi] -- 32-bit wrap span, then the
     shared magic divide by 0x1b8 (0x094f2095 sar 4 + logical sign add). */
  return entry_count_impl(static_cast<int32_t>(src_end - src_begin));
}

extern "C" void isaac_sfx_append_arm_plan(uint32_t gate_byte,
                                          uint32_t src_begin,
                                          uint32_t src_end,
                                          int32_t prev_count,
                                          IsaacSfxAppendArmPlan* out) {
  if (out == nullptr) {
    return;
  }
  /* 0x0092d5b0 cmp byte [ebx+0xc],0 ; je 0x92d6c4 -- LOW-BYTE test of the
     second stack argument. Skip keeps the pre-arm [ebp-0x10264]. */
  const int32_t skip = low_byte(gate_byte) == 0 ? 1 : 0;
  const int32_t count = skip != 0
                            ? prev_count
                            : isaac_sfx_append_arm_count(src_begin, src_end);
  out->skip = skip;
  out->arm_runs = skip != 0 ? 0 : 1;
  out->count = count;
  /* 0x0092d6c4 test eax,eax ; js 0x92d6f4 / cmp eax,0x443 ; jl 0x92d6f4:
     both signed, so the warn block is reached iff count >= 0x443. */
  out->warn_path = count >= 0x443 ? 1 : 0;
  out->prev_count_carried = skip;
  out->host_mutates_source = skip != 0 ? 0 : 1;
  /* 0x92d620/0x92d6a0 write [ebp-0x4c] = 0xf (SSO capacity) with no other
     store in between, so the 0x92d65d cap < 0x10 test always skips the
     0x92d689 free -- dead on every path through the arm. */
  out->arm_string_free_dead = 1;
  out->host_calls = skip != 0 ? 0 : 3; /* ctor + push_back + bulk append */
}

/* ---------- v9 (wave-2 XML-read half): 0x0092d140 XML/append block ---- */

extern "C" int32_t isaac_sfx_table_open_gate(int32_t file_open_result) {
  /* 0x92d1af test edi,edi ; jne 0x92d1ba — FULL-WORD test on the
     0xa178d0 file-open result; zero returns FALSE straight to the
     epilogue (0x92d1b3 xor al,al ; jmp 0x92dbaa). */
  return file_open_result != 0 ? 1 : 0;
}

extern "C" void isaac_sfx_table_read_plan(int32_t read_size,
                                          IsaacSfxReadPlan* out) {
  if (out == nullptr) {
    return;
  }
  /* 0x92d38a lea ecx,[esi+1] — the allocator size is the probe result
     PLUS ONE (the NUL), wrapping at 32 bits. */
  out->alloc_size =
      static_cast<uint32_t>(read_size) + 1u;
  /* 0x92d3ad mov byte [eax+esi],0 — unconditional NUL right after the
     read call, at buffer[read_size]. */
  out->nul_offset = static_cast<uint32_t>(read_size);
  out->nul_store = 1;
  /* 0x92d3c5 mov dword [eax+0xc],0 — the preload counter reset, also
     unconditional on this path (BOTH the clear and the append reach
     the read prologue). */
  out->counter_reset = 1;
  out->counter_offset = ISAAC_SFX_MGR_OFF_NOT_PRELOADED_COUNT;
  /* vtbl[4] size probe, alloc 0xa0f4e0, vtbl[0x14] read, vtbl[0] close:
     four host edges, in that order, with the NUL store between read and
     close and the counter reset AFTER the close. */
  out->host_edge_count = 4;
}

extern "C" void isaac_sfx_table_root_name_plan(int32_t value_null,
                                               int32_t value_ptr,
                                               int32_t max_len,
                                               IsaacSfxRootNamePlan* out) {
  if (out == nullptr) {
    return;
  }
  /* 0x92d412..0x92d42c — buf=0, size=0, cap=0xf on [ebp-0x2c], and the
     byte [ebp-0x2c]=0 buf[0] store inside the null-test sequence. */
  out->init_store_count = 4;
  out->init_cap = 0xf;
  /* 0x92d427 mov ecx,[eax+4] ; test ecx,ecx ; cmovne edx,ecx — FULL-WORD
     null test with the 0xc71640 empty-string fallback. */
  out->fallback_used = value_null != 0 ? 1 : 0;
  /* The inline strlen (0x92d433..0x92d43f) runs over the SELECTED
     pointer — a null value reads the fallback, so the length is 0. Same
     loop shape as the v5 slot walk; same byte_at bound. */
  out->name_len = attr_strlen_impl(value_null, value_ptr, max_len);
  /* 0x92d446 call 0x40ccd0 — always, with (len, selected, [ebp-0x2c]). */
  out->assign_needed = 1;
  out->assign_va = ISAAC_SFX_HOST_VA_STRING_ASSIGN_40CCD0;
}

extern "C" void isaac_sfx_table_proto_init_plan(
    int32_t site, IsaacSfxProtoInitPlan* out) {
  if (out == nullptr) {
    return;
  }
  /* site 0 = loop head (proto1 at [ebp-0x10400]), nonzero = append arm
     (proto2 at [ebp-0x200]) — the normalize_form convention. */
  const int32_t append = site != 0 ? 1 : 0;
  out->site_valid = 1;
  out->store_count = 7;  /* five header stores + two string-head stores */
  /* 0x92d484 / 0x92d5df: [proto+4] = 0xffffffff BEFORE the __ehvec_ctor.
     The ctor then fills the 7x0x38 voice array at proto+8. */
  out->sentinel_offset = 4;
  out->sentinel_value = 0xffffffffu;
  /* ORDER divergence: loop head writes [0x190] first (0x92d496), the
     append arm writes [0x1a0] first (0x92d600). Same store SET. */
  out->first_store_offset = append != 0 ? 0x1a0 : 0x190;
  /* Bits 1 and 3 over the five header slots: +0x194 (base volume) and
     +0x199 (pad) are NEVER written by the template — the same two fields
     the v6 fill law reports uninitialized. */
  out->uninit_mask = 0xa;
  /* Both sites call 0xaef5c4 with (base=proto+8, 7, 0x38, ctor 0x92ce30,
     dtor 0x92cf10). */
  out->ctor_va = ISAAC_SFX_HOST_VA_EHVEC_CTOR;
  out->ctor_count = ISAAC_SFX_ENTRY_VOICE_DTOR_COUNT;
  out->ctor_stride = ISAAC_SFX_ENTRY_VOICE_DTOR_STRIDE;
  out->ctor_ctor_va = 0x0092ce30u;
  out->ctor_dtor_va = 0x0092cf10u;
  out->voice_base_off = ISAAC_SFX_ENTRY_VOICE_DTOR_BASE_OFF;
}

extern "C" void isaac_sfx_table_push_plan(int32_t end, int32_t cap,
                                          IsaacSfxPushPlan* out) {
  if (out == nullptr) {
    return;
  }
  /* 0x92d639 cmp eax,[esi+8] ; je 0x92d651 — FULL-WORD equality on the
     live end/cap pair. */
  const uint32_t e = static_cast<uint32_t>(end);
  const uint32_t c = static_cast<uint32_t>(cap);
  const int32_t grow = e == c ? 1 : 0;
  out->emplace = grow == 0 ? 1 : 0;
  out->grow = grow;
  /* 0x92d648 add dword [esi+4],0x1b8 — ONE stride on the emplace path.
     On the grow path the end update lives inside 0x92e900 (host), so
     end_after carries the INPUT end there. */
  out->end_after = grow != 0 ? e : e + ISAAC_SFX_ENTRY_STRIDE;
  out->emplace_va = ISAAC_SFX_HOST_VA_VECTOR_EMPLACE;
  out->grow_va = ISAAC_SFX_HOST_VA_VECTOR_GROW_APPEND;
}

/* ---------- v10: 0x00413b90 XML document constructor ---------- */

extern "C" uint32_t isaac_sfx_xml_doc_ctor_pool_base(uint32_t this_ptr) {
  /* 0x413b9f lea ecx,[esi+0x3c] — 32-bit wrap. */
  return this_ptr + static_cast<uint32_t>(ISAAC_SFX_XML_DOC_POOL_BASE_OFF);
}

extern "C" uint32_t isaac_sfx_xml_doc_ctor_pool_end(uint32_t this_ptr) {
  /* 0x413b93 lea edx,[esi+0x1003c] — 32-bit wrap. */
  return this_ptr + static_cast<uint32_t>(ISAAC_SFX_XML_DOC_POOL_END_OFF);
}

extern "C" uint32_t isaac_sfx_xml_doc_ctor_align_slack(uint32_t this_ptr) {
  /* 0x413bb1 neg eax ; 0x413bba and eax,3 — slack is (-pool_base) & 3.
     Independently: 0/3/2/1 for pool_base % 4 = 0/1/2/3. */
  const uint32_t pool = isaac_sfx_xml_doc_ctor_pool_base(this_ptr);
  return (0u - pool) & 3u;
}

extern "C" uint32_t isaac_sfx_xml_doc_ctor_cursor(uint32_t this_ptr) {
  /* 0x413bb1..0x413bc4: eax = -ecx; and 3; add ecx. 32-bit wrap. */
  const uint32_t pool = isaac_sfx_xml_doc_ctor_pool_base(this_ptr);
  return pool + isaac_sfx_xml_doc_ctor_align_slack(this_ptr);
}

extern "C" int32_t isaac_sfx_xml_doc_ctor_writes_offset(uint32_t off) {
  /* The eleven store displacements, in PE order:
     0x1003c, 0x00, 0x04, 0x10, 0x14, 0x18, 0x34, 0x20, 0x10040,
     0x30, 0x38. The pool bytes at +0x3c are NOT stored. */
  switch (off) {
    case 0x00u:
    case 0x04u:
    case 0x10u:
    case 0x14u:
    case 0x18u:
    case 0x20u:
    case 0x30u:
    case 0x34u:
    case 0x38u:
    case 0x1003cu:
    case 0x10040u:
      return 1;
    default:
      return 0;
  }
}

extern "C" void isaac_sfx_xml_doc_ctor_plan(uint32_t this_ptr,
                                            IsaacSfxXmlDocCtorPlan* out) {
  if (out == nullptr) {
    return;
  }
  out->pool_base = isaac_sfx_xml_doc_ctor_pool_base(this_ptr);
  out->pool_end = isaac_sfx_xml_doc_ctor_pool_end(this_ptr);
  out->cursor = isaac_sfx_xml_doc_ctor_cursor(this_ptr);
  out->align_slack = isaac_sfx_xml_doc_ctor_align_slack(this_ptr);
  out->store_count = ISAAC_SFX_XML_DOC_CTOR_STORE_COUNT;
  out->zero_store_count = ISAAC_SFX_XML_DOC_CTOR_ZERO_STORES;
  out->first_store_offset = ISAAC_SFX_XML_DOC_CTOR_FIRST_STORE_OFF;
  out->host_calls = 0; /* no call instruction in the body */
  out->returns_this = 1; /* 0x413bd0 mov eax,esi */
  out->size_bytes = ISAAC_SFX_XML_DOC_CTOR_SIZE_BYTES;
  out->caller_count = ISAAC_SFX_XML_DOC_CTOR_CALLERS;
}


/* ---------- v11: 0x004155d0 XML document Parse islands ----------

   Whole body is host-irreducible (nested parse 0x00416040 + the
   input/whitespace skip). The islands below are the first honest
   PURE gates: FULL-WORD head tests, LOW-BYTE BOM, the 0xb1b060
   space predicate, EMPTY/LT/ERROR, and which this-offsets Parse
   can write. */

extern "C" int32_t isaac_sfx_xml_doc_parse_head_live(uint32_t head) {
  /* 0x4155d9 / 0x4155f8 / 0x41566d / 0x415676: test r,r ; je.
     FULL-WORD. 0x100 is a live head, not null. */
  return head != 0u ? 1 : 0;
}

extern "C" int32_t isaac_sfx_xml_doc_parse_bom_skip(uint32_t b0,
                                                   uint32_t b1,
                                                   uint32_t b2) {
  /* 0x415618 cmp byte [eax], 0xef
     0x41561d cmp byte [eax+1], 0xbb
     0x415623 cmp byte [eax+2], 0xbf
     all three or skip; 0x415629 add eax, 3. LOW BYTE of each. */
  if (low_byte(b0) == static_cast<uint8_t>(ISAAC_SFX_XML_PARSE_BOM0) &&
      low_byte(b1) == static_cast<uint8_t>(ISAAC_SFX_XML_PARSE_BOM1) &&
      low_byte(b2) == static_cast<uint8_t>(ISAAC_SFX_XML_PARSE_BOM2)) {
    return ISAAC_SFX_XML_PARSE_BOM_SKIP;
  }
  return 0;
}

extern "C" int32_t isaac_sfx_xml_doc_parse_is_space(uint32_t byte) {
  /* Table 0xb1b060: 256 bytes, 1 ONLY at TAB/LF/CR/SPACE (9/10/13/32).
     Verified against .rdata of this image. Everything else is 0. */
  const uint8_t b = low_byte(byte);
  return (b == static_cast<uint8_t>(ISAAC_SFX_XML_PARSE_SPACE_TAB) ||
          b == static_cast<uint8_t>(ISAAC_SFX_XML_PARSE_SPACE_LF) ||
          b == static_cast<uint8_t>(ISAAC_SFX_XML_PARSE_SPACE_CR) ||
          b == static_cast<uint8_t>(ISAAC_SFX_XML_PARSE_SPACE_SP))
             ? 1
             : 0;
}

extern "C" int32_t isaac_sfx_xml_doc_parse_gate(uint32_t byte) {
  /* 0x415651 test cl,cl ; je 0x4156b0  EMPTY (silent ret)
     0x415657 cmp cl, 0x3c ; jne 0x4156a6  else ERROR ("expected <")
     else LT -> call 0x00416040. LOW BYTE. */
  const uint8_t c = low_byte(byte);
  if (c == 0u) {
    return ISAAC_SFX_XML_PARSE_GATE_EMPTY;
  }
  if (c == static_cast<uint8_t>(ISAAC_SFX_XML_PARSE_LT)) {
    return ISAAC_SFX_XML_PARSE_GATE_LT;
  }
  return ISAAC_SFX_XML_PARSE_GATE_ERROR;
}

extern "C" int32_t isaac_sfx_xml_doc_parse_writes_this_offset(uint32_t off) {
  /* Parse this-stores: +0x18 and +0x20 (always detach) and +0x1c
     (link last-pointer). The v10 ctor writes +0x18/+0x20 too; +0x1c
     is the discriminator (ctor does NOT write it). */
  switch (off) {
    case static_cast<uint32_t>(ISAAC_SFX_XML_DOC_OFF_18):
    case static_cast<uint32_t>(ISAAC_SFX_XML_DOC_OFF_20):
    case static_cast<uint32_t>(ISAAC_SFX_XML_DOC_OFF_LAST_1C):
      return 1;
    default:
      return 0;
  }
}

extern "C" void isaac_sfx_xml_doc_parse_plan(uint32_t children_head,
                                            uint32_t attrs_head,
                                            uint32_t b0,
                                            uint32_t b1,
                                            uint32_t b2,
                                            uint32_t after_ws_byte,
                                            uint32_t parsed_node,
                                            uint32_t first_child_re,
                                            IsaacSfxXmlDocParsePlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t gate = isaac_sfx_xml_doc_parse_gate(after_ws_byte);
  const int32_t nested =
      gate == ISAAC_SFX_XML_PARSE_GATE_LT ? 1 : 0;
  /* 0x41566d test ecx,ecx — FULL-WORD. Nested is still CALLED on
     the LT arm even when the recaptured node is null; link is not. */
  const int32_t link =
      (nested != 0 && parsed_node != 0u) ? 1 : 0;
  out->children_walk = isaac_sfx_xml_doc_parse_head_live(children_head);
  out->attrs_walk = isaac_sfx_xml_doc_parse_head_live(attrs_head);
  out->detach_children = 1; /* 0x4155f1 [esi+0x18] = 0, always */
  out->detach_attrs = 1;    /* 0x415611 [esi+0x20] = 0, always */
  out->bom_skip = isaac_sfx_xml_doc_parse_bom_skip(b0, b1, b2);
  out->gate_kind = gate;
  out->nested_parse_needed = nested;
  out->nested_parse_va = ISAAC_SFX_HOST_VA_XML_NESTED_PARSE;
  out->error_store = gate == ISAAC_SFX_XML_PARSE_GATE_ERROR ? 1 : 0;
  out->error_slot_va = ISAAC_SFX_HOST_VA_XML_PARSE_ERROR_SLOT;
  out->error_str_va = ISAAC_SFX_XML_PARSE_ERROR_STR_VA;
  out->link_needed = link;
  /* 0x415676 cmp dword [esi+0x18], 0 ; je first-child. Recaptured:
     a later iteration of the host loop may have a live +0x18. */
  out->link_first = (link != 0 && first_child_re == 0u) ? 1 : 0;
  out->host_calls = nested; /* 1 iff LT; ctor host_calls is ALWAYS 0 */
  out->pure_complete = 0;   /* nested parse remains host */
  out->size_bytes = ISAAC_SFX_XML_DOC_PARSE_SIZE_BYTES;
  out->caller_count = ISAAC_SFX_XML_DOC_PARSE_CALLERS;
}

/* ---------- v12: 0x00413bf0 ATTR find / 0x00413c70 CHILD find ----------
 *
 * Byte-identical twins (125/128 over 0x80; 3-byte law head/next/null-arm).
 * Full bodies, 71 insns, 0 E8 / 0 indirect / 0 stores, three `ret 0xc`.
 * FULLY PURE — no device, allocator or logging edge; the plan walks the
 * chain in guest memory exactly like the anm2 three-stage lookup plan:
 * `receiver` is the guest `this` pointer (the ecx the machine keeps),
 * arg_addr / every node pointer are guest addresses read from the chain.
 * Machine law (0x413bf0 side, 0x413c70 in brackets):
 *   arg == 0  -> return [this+head_off]                (0x413c5a [0x413cda])
 *   len = strlen(arg)                                  (0x413bfb..0x413c07)
 *   node = [this+head_off] ; node == 0 -> return 0     (0x413c09 [0x413c89])
 *   per node: buf = [node+0]; buf==0 -> size 0, buf = 0x00c71640
 *             buf!=0 -> size = [node+8]
 *             size != len -> next ; else byte-compare `size` bytes
 *             all equal -> return node                 (0x413c3e [0x413cbe])
 *             next = [node+next_off] ; 0 -> return 0   (0x413c4a [0x413cca])
 *   ATTR  head_off 0x20 next_off 0x18 ; CHILD head_off 0x18 next_off 0x2c.
 * The node name is the family's custom {ptr,len} pair (not std::string);
 * node+0x00/0x08 are ISAAC_SFX_XML_NODE_OFF_NAME_00/_NAME_LEN_08. */

/* Absolute guest-address loads: pointer value == linear-memory address
   (the anm2 plan shape). receiver, arg_addr and every node pointer are
   absolute addresses read straight from the chain. */
static inline uint32_t sfx_xml_load_u32(uint32_t addr) {
  const uint8_t* p =
      reinterpret_cast<const uint8_t*>(static_cast<uintptr_t>(addr));
  return static_cast<uint32_t>(p[0]) |
         (static_cast<uint32_t>(p[1]) << 8) |
         (static_cast<uint32_t>(p[2]) << 16) |
         (static_cast<uint32_t>(p[3]) << 24);
}

static inline uint8_t sfx_xml_load_byte(uint32_t addr) {
  return *reinterpret_cast<const uint8_t*>(static_cast<uintptr_t>(addr));
}

static void sfx_xml_find_impl(const uint8_t* receiver,
                              uint32_t arg_addr,
                              uint32_t head_off,
                              uint32_t next_off,
                              int32_t caller_count,
                              IsaacSfxXmlFindPlan* out) {
  if (out == nullptr) {
    return;
  }
  out->entered = 0;
  out->arg_null = 0;
  out->arg_len = 0u;
  out->head = 0u;
  out->head_null = 0;
  out->kind = ISAAC_SFX_XML_FIND_KIND_MISS;
  out->result = 0u;
  out->visited = 0u;
  out->matched_index = -1;
  out->host_calls = 0;    /* no call instruction in either body */
  out->pure_complete = 1; /* fully pure: 0 E8, 0 indirect, 0 stores */
  out->size_bytes = ISAAC_SFX_XML_FIND_SIZE_BYTES;
  out->caller_count = caller_count;
  if (receiver == nullptr) {
    return;
  }
  out->entered = 1;
  const uint32_t this_addr =
      static_cast<uint32_t>(reinterpret_cast<uintptr_t>(receiver));
  const uint32_t head = sfx_xml_load_u32(this_addr + head_off);
  out->head = head;
  if (arg_addr == 0u) {
    /* 0x413bf7 test esi,esi ; je 0x413c5a -> mov eax,[ecx+0x20]. The
       NULL_ARG arm returns the HEAD, not zero. */
    out->arg_null = 1;
    out->kind = ISAAC_SFX_XML_FIND_KIND_NULL_ARG;
    out->result = head;
    return;
  }
  /* 0x413bfb..0x413c07: strlen(arg) — scan to NUL; ebx = end; sub ebx,esi. */
  uint32_t len = 0u;
  while (sfx_xml_load_byte(arg_addr + len) != 0u) {
    ++len;
  }
  out->arg_len = len;
  if (head == 0u) {
    /* 0x413c0f test edx,edx ; je 0x413c51 -> xor eax,eax. */
    out->head_null = 1;
    out->kind = ISAAC_SFX_XML_FIND_KIND_MISS;
    return;
  }
  uint32_t node = head;
  int32_t idx = 0;
  while (node != 0u) {
    /* 0x413c13 mov eax,[edx] ; test eax,eax ; je 0x413c1e (inline arm). */
    ++out->visited;
    const uint32_t buf = sfx_xml_load_u32(node + ISAAC_SFX_XML_FIND_NAME_OFF);
    uint32_t size;
    uint32_t buf_va;
    if (buf == 0u) {
      size = 0u;
      buf_va = ISAAC_SFX_XML_FIND_EMPTY_STRING_VA;
    } else {
      size = sfx_xml_load_u32(node + ISAAC_SFX_XML_FIND_NAME_LEN_OFF);
      buf_va = buf;
    }
    /* 0x413c25 cmp ecx,ebx ; jne 0x413c4a — size vs arg length, FULL 32-bit. */
    if (size == len) {
      int32_t ok = 1;
      for (uint32_t i = 0u; i < len; ++i) {
        /* 0x413c32 mov cl,[eax] ; cmp cl,[esi+eax] — buf[i] vs arg[i],
           with 0x413c30 sub esi,eax folding arg-buf once. */
        if (sfx_xml_load_byte(buf_va + i) != sfx_xml_load_byte(arg_addr + i)) {
          ok = 0;
          break;
        }
      }
      if (ok != 0) {
        /* 0x413c3e mov eax,edx ; ret 0xc — MATCH returns the node. */
        out->kind = ISAAC_SFX_XML_FIND_KIND_MATCH;
        out->result = node;
        out->matched_index = idx;
        return;
      }
    }
    /* 0x413c4a mov edx,[edx+next_off] ; test ; jne loop. */
    node = sfx_xml_load_u32(node + next_off);
    ++idx;
  }
  out->kind = ISAAC_SFX_XML_FIND_KIND_MISS;
}

extern "C" uint32_t isaac_sfx_xml_attr_find_head_off(void) {
  return ISAAC_SFX_XML_ATTR_FIND_HEAD_OFF;
}

extern "C" uint32_t isaac_sfx_xml_attr_find_next_off(void) {
  return ISAAC_SFX_XML_ATTR_FIND_NEXT_OFF;
}

extern "C" uint32_t isaac_sfx_xml_child_find_head_off(void) {
  return ISAAC_SFX_XML_CHILD_FIND_HEAD_OFF;
}

extern "C" uint32_t isaac_sfx_xml_child_find_next_off(void) {
  return ISAAC_SFX_XML_CHILD_FIND_NEXT_OFF;
}

extern "C" void isaac_sfx_xml_attr_find_plan(uint8_t* receiver,
                                             uint32_t arg_addr,
                                             IsaacSfxXmlFindPlan* out) {
  sfx_xml_find_impl(receiver, arg_addr,
                    ISAAC_SFX_XML_ATTR_FIND_HEAD_OFF,
                    ISAAC_SFX_XML_ATTR_FIND_NEXT_OFF,
                    ISAAC_SFX_XML_ATTR_FIND_CALLERS, out);
}

extern "C" void isaac_sfx_xml_child_find_plan(uint8_t* receiver,
                                              uint32_t arg_addr,
                                              IsaacSfxXmlFindPlan* out) {
  sfx_xml_find_impl(receiver, arg_addr,
                    ISAAC_SFX_XML_CHILD_FIND_HEAD_OFF,
                    ISAAC_SFX_XML_CHILD_FIND_NEXT_OFF,
                    ISAAC_SFX_XML_CHILD_FIND_CALLERS, out);
}

/* ---------- v13: 0x00423480 ".ogg" suffix compare ---------- */

/* 0x423487 `mov esi,edx ; cmp ebx,edx ; cmovb esi,ebx` — UNSIGNED min. */
inline uint32_t cmp_common_len_impl(uint32_t len_a, uint32_t len_b) {
  return len_b < len_a ? len_b : len_a;
}

/* 0x4234e8..0x4234f6: `cmp len_b,len_a ; jbe` then the `or eax,-1` /
   `sbb eax,eax ; neg eax` fold. The PE compares len_b against len_a; the
   borrow is set exactly when len_b < len_a, i.e. len_a > len_b. */
inline int32_t cmp_length_tie_impl(uint32_t len_a, uint32_t len_b) {
  if (len_a < len_b) {
    return -1;
  }
  return len_a > len_b ? 1 : 0;
}

/* 0x4234db `sbb eax,eax ; or eax,1`: the borrow of the last byte compare is
   set exactly when a_byte < b_byte (UNSIGNED), so the fold yields +1 for
   a_byte > b_byte and -1 for a_byte < b_byte. */
inline int32_t cmp_byte_resolve_impl(uint32_t a, uint32_t b) {
  const uint8_t av = low_byte(a);
  const uint8_t bv = low_byte(b);
  return av > bv ? 1 : -1;
}

/* The body's comparison over the first n of the four slots (n in 0..4):
   the dword pass at 0x423498 plus the byte tail at 0x4234ae decide the
   common prefix exactly as the machine does — the first differing byte
   resolves by unsigned value; an all-equal prefix resolves to 0. */
inline int32_t cmp4_prefix_impl(uint32_t a0, uint32_t a1, uint32_t a2,
                                uint32_t a3, uint32_t b0, uint32_t b1,
                                uint32_t b2, uint32_t b3, uint32_t n) {
  const uint8_t a[4] = {low_byte(a0), low_byte(a1), low_byte(a2),
                        low_byte(a3)};
  const uint8_t b[4] = {low_byte(b0), low_byte(b1), low_byte(b2),
                        low_byte(b3)};
  const uint32_t m = n < 4u ? n : 4u;
  for (uint32_t i = 0; i < m; ++i) {
    if (a[i] != b[i]) {
      return cmp_byte_resolve_impl(a[i], b[i]);
    }
  }
  return 0;
}

/* The LE dword the dword pass compares (`mov eax,[ecx]`). */
inline uint32_t cmp_dword_le_impl(uint32_t b0, uint32_t b1, uint32_t b2,
                                  uint32_t b3) {
  return static_cast<uint32_t>(low_byte(b0)) |
         (static_cast<uint32_t>(low_byte(b1)) << 8u) |
         (static_cast<uint32_t>(low_byte(b2)) << 16u) |
         (static_cast<uint32_t>(low_byte(b3)) << 24u);
}

extern "C" uint32_t isaac_sfx_cmp_common_len(uint32_t len_a, uint32_t len_b) {
  return cmp_common_len_impl(len_a, len_b);
}

extern "C" int32_t isaac_sfx_cmp_length_tie(uint32_t len_a, uint32_t len_b) {
  return cmp_length_tie_impl(len_a, len_b);
}

extern "C" int32_t isaac_sfx_cmp4_three_way(uint32_t a0, uint32_t a1,
                                            uint32_t a2, uint32_t a3,
                                            uint32_t b0, uint32_t b1,
                                            uint32_t b2, uint32_t b3) {
  /* The SFX site always compares exactly four bytes, so the body is one
     dword pass (`cmp eax,[edi] ; jne` at 0x42349a/0x42349c) followed by the
     byte resolution at 0x4234ae. */
  if (cmp_dword_le_impl(a0, a1, a2, a3) != cmp_dword_le_impl(b0, b1, b2, b3)) {
    return cmp4_prefix_impl(a0, a1, a2, a3, b0, b1, b2, b3, 4);
  }
  return 0;
}

extern "C" int32_t isaac_sfx_ogg_suffix_compare(uint32_t b0, uint32_t b1,
                                                uint32_t b2, uint32_t b3) {
  /* The Load call at 0x0092d052: a-side = the resolved tail, b-side =
     0x00b7b1bc (2e 6f 67 67). */
  return isaac_sfx_cmp4_three_way(b0, b1, b2, b3, ISAAC_SFX_OGG_BYTE0,
                                  ISAAC_SFX_OGG_BYTE1, ISAAC_SFX_OGG_BYTE2,
                                  ISAAC_SFX_OGG_BYTE3);
}

extern "C" int32_t isaac_sfx_ogg_suffix_match(uint32_t b0, uint32_t b1,
                                              uint32_t b2, uint32_t b3) {
  /* 0x0092d05a test eax,eax ; jne create ; mov al,1 — zero result streams. */
  return isaac_sfx_ogg_suffix_compare(b0, b1, b2, b3) == 0 ? 1 : 0;
}

extern "C" int32_t isaac_sfx_load_stream_byte_from_tail(uint32_t b0,
                                                        uint32_t b1,
                                                        uint32_t b2,
                                                        uint32_t b3) {
  return isaac_sfx_ogg_suffix_match(b0, b1, b2, b3) != 0
             ? static_cast<int32_t>(ISAAC_SFX_LOAD_STREAM_BYTE_STREAM)
             : static_cast<int32_t>(ISAAC_SFX_LOAD_STREAM_BYTE_STATIC);
}

extern "C" void isaac_sfx_suffix_compare_plan(uint32_t a0, uint32_t a1,
                                              uint32_t a2, uint32_t a3,
                                              uint32_t b0, uint32_t b1,
                                              uint32_t b2, uint32_t b3,
                                              uint32_t len_a, uint32_t len_b,
                                              IsaacSfxSuffixComparePlan* out) {
  if (out == nullptr) {
    return;
  }
  const uint32_t common = cmp_common_len_impl(len_a, len_b);
  const uint32_t n = common < 4u ? common : 4u;
  const int32_t prefix = cmp4_prefix_impl(a0, a1, a2, a3, b0, b1, b2, b3, n);
  const int32_t three =
      prefix != 0 ? prefix : cmp_length_tie_impl(len_a, len_b);
  out->common_len = common;
  out->dword_loop = common >= 4u ? 1 : 0;
  out->prefix_equal = prefix == 0 ? 1 : 0;
  out->three_way = three;
  out->match = three == 0 ? 1 : 0;
  out->tail_bytes = common % 4u;
}

extern "C" uint32_t isaac_sfx_pure_helpers_abi_version(void) {
  return ISAAC_SFX_PURE_HELPERS_ABI_VERSION;
}

/* ---------- v34: audio-wrapper 0xa2b1e0 suffix/arm gates ----------
   (wave-27 F14; notes sfx-v34-wrapper; census-sfx-wrapper.py)

   All decision inputs are uint32_t / int32_t scalars; the machine's
   byte reads are spelled `& 0xff` (NO uint8_t anywhere). The fn-ptr
   compare slot 0xb18770 is a runtime-resolved audio-API slot (typed
   host; its RESULT BIT is the lawed decision). */

extern "C" int32_t isaac_sfx_wrapper_init_gate(uint32_t flags) {
  /* PE 0xa2b217 / 0xa2b231 `mov eax,[this+4] ; test al,1 ; jne
     0xa2b2bf` — the LOW BYTE of the flags dword is read (al), bit 0
     tested. 0x100 has low byte 0 -> NOT initialized; the flag's bit 0
     is inside the low byte, so the mask is exactly (flags & 0xff) & 1.
     The same gate runs a SECOND time after the 'not initialized' warn
     (0xa2b231) — two reads of the same dword, one decision. */
  return ((flags & 0xffu) & ISAAC_SFX_WRAPPER_FLAG_BIT_INIT) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_sfx_wrapper_byte_gate(uint32_t a4) {
  /* PE 0xa2b2e3 `cmp byte ptr [ebp+0x14], 0 ; jne 0xa2b347` — the a4
     word's LOW BYTE decides whether the suffix chain runs. 0x100 ->
     low byte 0 -> gate 0. */
  return (a4 & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_sfx_wrapper_chain_gate(uint32_t vtbl28_result,
                                                uint32_t a4) {
  /* PE 0xa2b2df `test eax,eax ; je 0xa2b340` (FULL dword zero test on
     the vtbl28 result; 0xa2b340 zeroes [ebp+0x10] and falls INTO the
     suffix chain) OR the 0xa2b2e3 byte gate. Either enters the chain;
     both zero -> the normal-return path (0xa2b2e9, adopt + hook). */
  return (vtbl28_result == 0u || isaac_sfx_wrapper_byte_gate(a4) != 0)
             ? 1
             : 0;
}

extern "C" int32_t isaac_sfx_wrapper_mode(int32_t mode) {
  /* PE 0xa2b360 `sub eax,0 ; je 0xa2b3a0` / 0xa2b367 `sub eax,1 ;
     jne 0xa2b5c2` — FULL dword compares: 0 -> sample, 1 -> stream,
     anything else (incl. 0x100) -> the error tail. */
  if (mode == 0) {
    return ISAAC_SFX_WRAPPER_MODE_SAMPLE;
  }
  if (mode == 1) {
    return ISAAC_SFX_WRAPPER_MODE_STREAM;
  }
  return ISAAC_SFX_WRAPPER_MODE_OTHER;
}

extern "C" uint32_t isaac_sfx_wrapper_mode_log_kind(int32_t mode) {
  /* PE 0xa2b5ff `test ebx,ebx` / 0xa2b607 `cmovne eax,ecx` with
     eax=0xb7b168 ('sample'), ecx=0xb9c4d0 ('stream'): mode != 0 ->
     'stream', else 'sample'. (The error tail is only reachable with
     mode != 0, so 'stream' is the live answer; the dead 'sample' arm
     is kept machine-faithful.) */
  return mode != 0 ? static_cast<uint32_t>(ISAAC_SFX_WRAPPER_LIT_STREAM)
                   : static_cast<uint32_t>(ISAAC_SFX_WRAPPER_LIT_SAMPLE);
}

extern "C" int32_t isaac_sfx_wrapper_suffix_match(int32_t compare_result) {
  /* PE 0xa2b358 `test eax,eax ; je next-stage` — NON-ZERO = the
     literal is present in the name (the stage's arms run); zero
     continues the chain. The compare itself is the runtime-resolved
     slot 0xb18770 (typed host); this is its decision bit. */
  return compare_result != 0 ? 1 : 0;
}

extern "C" int32_t isaac_sfx_wrapper_suffix_kind(uint32_t has_wav,
                                                 uint32_t has_ogg,
                                                 uint32_t has_org) {
  /* PE chain: stage 1 (".wav" 0xa2b353) dispatches BEFORE the ".ogg"
     compare (0xa2b3e9) ever runs; stage 2 before ".org" (0xa2b4f1);
     all-zero falls to the unknown arm (0xa2b741). First non-zero
     stage wins even when multiple bits are set. */
  if (has_wav != 0u) {
    return ISAAC_SFX_WRAPPER_SUFFIX_WAV;
  }
  if (has_ogg != 0u) {
    return ISAAC_SFX_WRAPPER_SUFFIX_OGG;
  }
  if (has_org != 0u) {
    return ISAAC_SFX_WRAPPER_SUFFIX_ORG;
  }
  return ISAAC_SFX_WRAPPER_SUFFIX_NONE;
}

extern "C" int32_t isaac_sfx_wrapper_arm(uint32_t has_wav,
                                         uint32_t has_ogg,
                                         uint32_t has_org,
                                         int32_t mode) {
  const int32_t kind =
      isaac_sfx_wrapper_suffix_kind(has_wav, has_ogg, has_org);
  if (kind == ISAAC_SFX_WRAPPER_SUFFIX_NONE) {
    return ISAAC_SFX_WRAPPER_ARM_UNKNOWN;
  }
  const int32_t mode_kind = isaac_sfx_wrapper_mode(mode);
  if (mode_kind == ISAAC_SFX_WRAPPER_MODE_OTHER) {
    return ISAAC_SFX_WRAPPER_ARM_INVALID_MODE;
  }
  /* kind*2 + mode: WAV_SAMPLE(0) WAV_STREAM(1) OGG_SAMPLE(2)
     OGG_STREAM(3) ORG_SAMPLE(4) ORG_STREAM(5) — the dispatch order
     matches the six construction arms (0xa2b3a0/0xa2b370/0xa2b4b6/
     0xa2b410/0xa2b57f/0xa2b514). */
  return kind * 2 + mode_kind;
}

extern "C" void isaac_sfx_wrapper_arm_plan(uint32_t has_wav,
                                           uint32_t has_ogg,
                                           uint32_t has_org,
                                           int32_t mode,
                                           uint32_t name,
                                           IsaacSfxWrapperArmPlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t kind =
      isaac_sfx_wrapper_suffix_kind(has_wav, has_ogg, has_org);
  const int32_t mode_kind = isaac_sfx_wrapper_mode(mode);
  const int32_t arm =
      isaac_sfx_wrapper_arm(has_wav, has_ogg, has_org, mode);
  uint32_t alloc_size = 0u;
  uint32_t ctor_va = 0u;
  uint32_t vtable_va = 0u;
  uint32_t log_level = 0u;
  uint32_t log_format_va = 0u;
  uint32_t log_kind_va = 0u;
  int32_t log_needed = 0;
  switch (arm) {
    case ISAAC_SFX_WRAPPER_ARM_WAV_SAMPLE:
      alloc_size = ISAAC_SFX_WRAPPER_ARM_WAV_SAMPLE_ALLOC;
      ctor_va = ISAAC_SFX_WRAPPER_CTOR_SAMPLE_A9FA20;
      vtable_va = ISAAC_SFX_WRAPPER_VTABLE_WAV_SAMPLE_BA2974;
      break;
    case ISAAC_SFX_WRAPPER_ARM_WAV_STREAM:
      alloc_size = ISAAC_SFX_WRAPPER_ARM_WAV_STREAM_ALLOC;
      ctor_va = ISAAC_SFX_WRAPPER_CTOR_STREAM_AA0110;
      vtable_va = ISAAC_SFX_WRAPPER_VTABLE_WAV_STREAM_BA29E4;
      break;
    case ISAAC_SFX_WRAPPER_ARM_OGG_SAMPLE:
      alloc_size = ISAAC_SFX_WRAPPER_ARM_OGG_SAMPLE_ALLOC;
      ctor_va = ISAAC_SFX_WRAPPER_CTOR_SAMPLE_A9FA20;
      vtable_va = ISAAC_SFX_WRAPPER_VTABLE_OGG_SAMPLE_BAAAA4;
      break;
    case ISAAC_SFX_WRAPPER_ARM_OGG_STREAM:
      alloc_size = ISAAC_SFX_WRAPPER_ARM_OGG_STREAM_ALLOC;
      ctor_va = ISAAC_SFX_WRAPPER_CTOR_STREAM_AA0110;
      vtable_va = ISAAC_SFX_WRAPPER_VTABLE_OGG_STREAM_BA2B50;
      break;
    case ISAAC_SFX_WRAPPER_ARM_ORG_SAMPLE:
      alloc_size = ISAAC_SFX_WRAPPER_ARM_ORG_SAMPLE_ALLOC;
      ctor_va = ISAAC_SFX_WRAPPER_CTOR_SAMPLE_A9FA20;
      vtable_va = ISAAC_SFX_WRAPPER_VTABLE_ORG_SAMPLE_BA2BEC;
      break;
    case ISAAC_SFX_WRAPPER_ARM_ORG_STREAM:
      alloc_size = ISAAC_SFX_WRAPPER_ARM_ORG_STREAM_ALLOC;
      ctor_va = ISAAC_SFX_WRAPPER_CTOR_STREAM_AA0110;
      vtable_va = ISAAC_SFX_WRAPPER_VTABLE_ORG_STREAM_BA2C5C;
      break;
    case ISAAC_SFX_WRAPPER_ARM_UNKNOWN:
      /* PE 0xa2b741: log(8, 0xb9c478, name) then adopt + dtor. */
      log_needed = 1;
      log_level = ISAAC_SFX_WRAPPER_LOG_LEVEL_UNKNOWN_TYPE;
      log_format_va = ISAAC_SFX_WRAPPER_LIT_UNKNOWN_TYPE;
      break;
    case ISAAC_SFX_WRAPPER_ARM_INVALID_MODE:
      /* PE 0xa2b5c2: log(1, 0xb9c4b8, 'sample'/'stream' by mode, name). */
      log_needed = 1;
      log_level = ISAAC_SFX_WRAPPER_LOG_LEVEL_FAILED_OPEN;
      log_format_va = ISAAC_SFX_WRAPPER_LIT_FAILED_OPEN;
      log_kind_va = isaac_sfx_wrapper_mode_log_kind(mode);
      break;
    default:
      break;
  }
  /* The compare stages executed before the decision: stage 1 decides
     WAV after ONE compare; OGG after TWO; ORG and NONE after THREE
     (all three compares run, then the je-chain falls through). */
  const int32_t stages =
      kind == ISAAC_SFX_WRAPPER_SUFFIX_WAV
          ? 1
          : kind == ISAAC_SFX_WRAPPER_SUFFIX_OGG
                ? 2
                : 3;
  out->arm = arm;
  out->suffix_kind = kind;
  out->mode_kind = mode_kind;
  out->valid_mode = mode_kind != ISAAC_SFX_WRAPPER_MODE_OTHER ? 1 : 0;
  out->compare_stages = stages;
  out->alloc_needed = alloc_size != 0u ? 1 : 0;
  out->alloc_size = alloc_size;
  out->ctor_va = ctor_va;
  out->vtable_va = vtable_va;
  out->log_needed = log_needed;
  out->log_level = log_level;
  out->log_format_va = log_format_va;
  out->log_kind_va = log_kind_va;
  /* PE 0xa2b625 `test edi,edi ; jne copy` — NULL name skips
     strlen/alloc/strcpy (IAT 0xb1893c) AND the 0xa159d0 hash call
     (PE 0xa2b667 `mov ecx,[local+0xc] ; call 0xa159d0`). The attach
     tail runs for every arm that reaches it. */
  out->name_copy_needed = name != 0u ? 1 : 0;
  out->hash_call_runs = name != 0u ? 1 : 0;
}

extern "C" int32_t isaac_sfx_wrapper_name_copy_needed(uint32_t name) {
  return name != 0u ? 1 : 0;
}

/* v34 census pins (corrected tooling; see notes sfx-v34-wrapper). */

extern "C" uint32_t isaac_sfx_wrapper_va(void) {
  return ISAAC_SFX_WRAPPER_VA_A2B1E0;
}

extern "C" uint32_t isaac_sfx_wrapper_ret_imm(void) {
  return ISAAC_SFX_WRAPPER_RET_IMM;
}

extern "C" uint32_t isaac_sfx_wrapper_body_edges(void) {
  return ISAAC_SFX_WRAPPER_BODY_EDGES;
}

extern "C" uint32_t isaac_sfx_wrapper_direct_callers(void) {
  /* 0 E8 callers image-wide; the caller surface is the three vtable
     slot-+0x28 sites (0xb9c4d8 / 0xba3068 / 0xba30ac). */
  return ISAAC_SFX_WRAPPER_DIRECT_CALLERS;
}

extern "C" uint32_t isaac_sfx_wrapper_vtable_slot_sites(void) {
  return ISAAC_SFX_WRAPPER_VTABLE_SLOT_SITES;
}

extern "C" uint32_t isaac_sfx_wrapper_fnptr_sites(void) {
  return ISAAC_SFX_WRAPPER_FNPTR_SITES;
}

extern "C" uint32_t isaac_sfx_wrapper_fnptr_thunk_va(void) {
  return ISAAC_SFX_WRAPPER_FNPTR_THUNK_AF05D9;
}

extern "C" uint32_t isaac_sfx_wrapper_ogg_literal_share_sites(void) {
  return ISAAC_SFX_WRAPPER_OGG_LITERAL_SHARE_SITES;
}

extern "C" uint32_t isaac_sfx_wrapper_hook_gates(void) {
  return ISAAC_SFX_WRAPPER_HOOK_GATES;
}

extern "C" uint32_t isaac_sfx_wrapper_pair_move_callers(void) {
  return ISAAC_SFX_WRAPPER_PAIR_MOVE_A2BD60_CALLERS;
}

/* ---------- v35: audio-wrapper cluster rest (wave-28 F11;
   notes sfx-v35-cluster; census-sfx-cluster.py) ----------

   Sibling slot methods of the SAME three manager vtables the v34
   wrapper sits in (0xb9c4d8 / 0xba3068 / 0xba30ac), plus the shared
   flag-bit family. All 17 bodies: 0 E8 callers, 0 imm32 refs —
   vtable-borne. The flags dword at [this+4] is the word the v34 init
   gate tests; the cluster mutates bits 0/1 (install/clear + set1/
   clear1) and bits 2..4 (byte-gated setters). Every machine byte read
   is spelled `& 0xff` on a uint32_t (NO uint8_t anywhere). */

extern "C" int32_t isaac_sfx_flag_bit_get(uint32_t flags, uint32_t bit) {
  /* PE 0xa135c0/0xa13600/0xa13640/0xa13680: `mov eax,[ecx+4] ; shr
     eax,imm ; and al,1 ; ret`. The shr is a FULL-dword logical shift
     (imm 1..4); `and al,1` keeps bit 0 of the shifted value, which is
     bit `imm` of the original — the result is (flags >> bit) & 1.
     The al-mask is the return width, not an input byte gate: wide
     flags (0x10000 with bit 4) still report bit 4. */
  return static_cast<int32_t>((flags >> (bit & 31u)) & 1u);
}

extern "C" int32_t isaac_sfx_flag_bit_set(uint32_t flags, uint32_t bit,
                                          uint32_t arg) {
  /* PE 0xa135d0/0xa13610/0xa13650: `cmp byte ptr [ebp+8], 0 ; je
     clear` then bts/btr on the loaded dword and store back. The arg's
     LOW BYTE decides: non-zero -> set the bit, zero -> clear it.
     0x100 -> low byte 0 -> CLEAR arm (byte gate). */
  const uint32_t mask = 1u << (bit & 31u);
  return static_cast<int32_t>((arg & 0xffu) != 0u ? flags | mask
                                                  : flags & ~mask);
}

extern "C" uint32_t isaac_sfx_manager_flag_set1(uint32_t flags) {
  /* PE 0xa2b1c0 `or dword ptr [ecx+4], 2 ; ret` — unconditional
     bit1 set on the manager flags dword. */
  return flags | 2u;
}

extern "C" uint32_t isaac_sfx_manager_flag_clear1(uint32_t flags) {
  /* PE 0xa2b1d0 `and dword ptr [ecx+4], 0xfffffffd ; ret` —
     unconditional bit1 clear. */
  return flags & ~2u;
}

extern "C" void isaac_sfx_wrapper_hook_install_plan(
    uint32_t flags,
    IsaacSfxHookInstallPlan* out) {
  if (out == nullptr) {
    return;
  }
  /* PE 0xa2afd0: after two host vtbl[0x4] calls, `or dword [esi+4],1`
     (bit0 SET — the v34 initialized bit), `mov al,1` (return 1),
     `mov dword [0xc7f484], 0xa2bb10` (hook := install target). The
     hook-global store is ONE of exactly TWO write sites image-wide
     (census-sfx-cluster.py: 0xa2afeb + 0xa2b004). */
  out->flags_after = flags | 1u;
  out->hook_value = ISAAC_SFX_HOOK_INSTALL_TARGET;
  out->returns_one = 1;
}

extern "C" void isaac_sfx_wrapper_hook_clear_plan(
    uint32_t flags,
    IsaacSfxHookClearPlan* out) {
  if (out == nullptr) {
    return;
  }
  /* PE 0xa2b000: `mov dword [0xc7f484], 0` (hook cleared — the OTHER
     write site), list clear 0xa2bcb0 + vtbl[0x8] x2 (host), then
     `and dword [ebx+4], 0xfffffffe` (bit0 CLEAR), plain ret. */
  out->flags_after = flags & ~1u;
  out->hook_value = 0u;
}

extern "C" int32_t isaac_sfx_dtor_free_gate(uint32_t arg) {
  /* PE 0xa2af00: after the nested dtor (0xa2af30, host), `test byte
     ptr [ebp+8], 1 ; je 0xa2af1c` — the scalar-deleting free
     free(this, 0x34) runs iff bit0 of the arg's LOW BYTE is set.
     0x100 -> low byte 0 -> no free (byte gate). */
  return static_cast<int32_t>((arg & 0xffu) & 1u);
}

extern "C" int32_t isaac_sfx_walk_entry_gate(uint32_t flags) {
  /* PE 0xa2b080 `test al,1 ; je 0xa2b16c` AND 0xa2b088 `test al,2 ;
     jne 0xa2b16c` — the collect walk runs iff the flags dword's LOW
     BYTE has bit0 SET and bit1 CLEAR. Both are byte reads (al). */
  const uint32_t low = flags & 0xffu;
  return (low & ISAAC_SFX_WALK_ENTRY_BIT0) != 0u &&
                 (low & ISAAC_SFX_WALK_ENTRY_BIT1) == 0u
             ? 1
             : 0;
}

extern "C" int32_t isaac_sfx_walk_probe_keep(uint32_t probe_al) {
  /* PE 0xa2b0d9 `test al,al ; je 0xa2b0fd` — the per-element vtbl[0x74]
     probe result's LOW BYTE decides whether the pointer is collected.
     0x100 -> low byte 0 -> skip (byte gate). */
  return (probe_al & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_sfx_wrapper_forward0_const(void) {
  /* PE 0xa2b188 `push 0` — the vtbl[0x24] forwarder's constant arg
     (slot +0x14). The call and the [ebp+8] echo are host. */
  return 0;
}

extern "C" int32_t isaac_sfx_wrapper_forward1_const(void) {
  /* PE 0xa2b1a8 `push 1` — the vtbl[0x24] forwarder's constant arg
     (slot +0x18). */
  return 1;
}

extern "C" int32_t isaac_sfx_map_found(uint32_t result, uint32_t end) {
  /* PE 0xa2b853 (0xa2b7f0) / 0xa2b9fe (0xa2b990): `cmp eax,[esi+8]
     ; je not-found` — the map find result equals the stored end
     sentinel -> NOT FOUND; any other value is a match. FULL-dword
     compare (0x100 result vs end 0x100: found). */
  return result != end ? 1 : 0;
}

/* v35 census pins (corrected tooling; see notes sfx-v35-cluster). */

extern "C" uint32_t isaac_sfx_cluster_direct_callers(void) {
  return ISAAC_SFX_CLUSTER_DIRECT_CALLERS;
}

extern "C" uint32_t isaac_sfx_cluster_body_count(void) {
  return ISAAC_SFX_CLUSTER_BODY_COUNT;
}

extern "C" uint32_t isaac_sfx_flag_family_vtable_rows(void) {
  return ISAAC_SFX_FLAG_FAMILY_VTABLE_ROWS;
}

extern "C" uint32_t isaac_sfx_hook_write_sites(void) {
  return ISAAC_SFX_HOOK_WRITE_SITES;
}

extern "C" uint32_t isaac_sfx_hook_install_target(void) {
  return ISAAC_SFX_HOOK_INSTALL_TARGET;
}

extern "C" uint32_t isaac_sfx_dtor_free_size(void) {
  return ISAAC_SFX_DTOR_FREE_SIZE_34;
}

extern "C" uint32_t isaac_sfx_walk_bound_reload(void) {
  return ISAAC_SFX_WALK_BOUND_RELOAD;
}

extern "C" uint32_t isaac_sfx_init_gate_body_sites(void) {
  return ISAAC_SFX_INIT_GATE_BODY_SITES;
}

/* ---------- v36: map find/construct 0xa2b7f0 + init walk 0xa2b990
   full-body peels (wave-29 F4; notes sfx-v36-mapwalk) ----------

   Both bodies are vtable-borne (0 E8 callers, v35 census). The hash
   0xa159d0, map find 0xa12280, adopt 0x8f2d20, alloc 0xa0f4c0,
   secondary ctor 0x40cc10, walk advance 0x414a80, remove 0x415d20,
   free 0xaef15c and logger 0xa112c0 stay host edges; the decision
   layer below is translated. 0xa2b7f0 RETURNS ret 0xc (THREE stack
   args; the v35 NOTES' "ret 4" came from the truncated dump — the
   fresh full-body dump cpu-dump/00a2b7f0.txt proves `ret 0xc` at
   0xa2b98d); arg3 [ebp+0x10] is never referenced. 0xa2b990 is ret 4
   (ONE stack arg). */

extern "C" int32_t isaac_sfx_init_walk_warn_needed(uint32_t flags) {
  /* PE 0xa2b9b8 `test byte [edi+4],1 ; jne 0xa2b9cd`: the "not
     initialized" warn (log 0xa112c0, level 0x10, fmt 0xb9c450) runs
     iff byte bit0 of the flags dword is CLEAR; the walk then
     continues either way (no early exit). */
  return (flags & 0xffu) & 1u ? 0 : 1;
}

extern "C" int32_t isaac_sfx_init_walk_body_runs(uint32_t arg1) {
  /* PE 0xa2b9d0 `test esi,esi ; je 0xa2ba73`: a NULL arg1 skips the
     vtbl[0xc] call, the map find, the whole walk and even the tail
     vtbl[0x10] call. FULL-dword zero test, not byte-gated. */
  return arg1 != 0 ? 1 : 0;
}

extern "C" int32_t isaac_sfx_init_walk_step(uint32_t node_is_sentinel,
                                            uint32_t node_member_ptr,
                                            uint32_t node_member_key,
                                            uint32_t arg1,
                                            uint32_t key) {
  /* PE 0xa2ba03..0xa2ba20. Order of the machine's tests:
       head == [this+8]            -> exit (MISS, no member deref)
       [node+0x14]->[0x10] != key  -> exit (MISMATCH, FULL dword)
       [node+0x14] == arg1         -> FOUND arm (FULL dword)
       else                        -> advance via 0x414a80 (host)   */
  if (node_is_sentinel != 0) {
    return ISAAC_SFX_INIT_WALK_STEP_MISS;
  }
  if (node_member_key != key) {
    return ISAAC_SFX_INIT_WALK_STEP_MISMATCH;
  }
  if (node_member_ptr == arg1) {
    return ISAAC_SFX_INIT_WALK_STEP_FOUND;
  }
  return ISAAC_SFX_INIT_WALK_STEP_ADVANCE;
}

extern "C" int32_t isaac_sfx_init_walk_island_hook(int32_t found_arm_runs,
                                                   uint32_t node_b,
                                                   uint32_t probe_al,
                                                   uint32_t hook) {
  /* PE 0xa2ba39: `test ecx,ecx ; je` on [node+0x18], then the
     vtbl[0xc] result `test al,al ; je`, then the hook pointer
     `test eax,eax ; je`; only then hook(&node+0x14). All byte-ish
     gates masked & 0xff; the walk header itself is a full dword. */
  if (found_arm_runs == 0) {
    return 0;
  }
  if (node_b == 0 || (probe_al & 0xffu) == 0 || hook == 0) {
    return 0;
  }
  return 1;
}

extern "C" int32_t isaac_sfx_map_construct_island2(uint32_t alloc_nonnull,
                                                   uint32_t probe_al,
                                                   uint32_t hook) {
  /* PE 0xa2b919..0xa2b938 (construct arm): probe target is the new
     secondary ([ebp-0x18] stored at 0xa2b8dd), gate stack is the v22
     island shape (ptr != 0 && byte probe != 0 && hook != 0). */
  if (alloc_nonnull == 0 || (probe_al & 0xffu) == 0 || hook == 0) {
    return 0;
  }
  return 1;
}

extern "C" int32_t isaac_sfx_map_construct_island3(uint32_t pair1,
                                                   uint32_t probe_al,
                                                   uint32_t hook) {
  /* PE 0xa2b956..0xa2b975 (found arm): probe target [ebp-0x20] is the
     adopt pair's SECOND dword — host-written by 0x8f2d20, hence a
     recapture input here. Same v22 island gate stack. */
  if (pair1 == 0 || (probe_al & 0xffu) == 0 || hook == 0) {
    return 0;
  }
  return 1;
}

extern "C" int32_t isaac_sfx_map_construct_island1(void) {
  /* PE 0xa2b8b9: the island probes [ebp-0x18], which is zero-
     initialized at 0xa2b87e and NOT written again until the store at
     0xa2b8dd (just AFTER the island). Dead-by-construction: the hook
     can never run on this path. */
  return 0;
}

extern "C" void isaac_sfx_map_construct_plan(uint32_t find_result,
                                             uint32_t map_end,
                                             uint32_t alloc_nonnull,
                                             uint32_t pair1,
                                             uint32_t probe2_al,
                                             uint32_t probe3_al,
                                             uint32_t hook,
                                             IsaacSfxMapConstructPlan* out) {
  if (out == nullptr) {
    return;
  }
  /* PE 0xa2b853 `cmp eax,[esi+8] ; je construct`: found iff the map
     find result differs from the end sentinel (v35 map-found law). */
  const int32_t found =
      isaac_sfx_map_found(find_result, map_end) != 0 ? 1 : 0;
  const int32_t arm = found != 0 ? ISAAC_SFX_MAP_CONSTRUCT_ARM_FOUND
                                 : ISAAC_SFX_MAP_CONSTRUCT_ARM_CONSTRUCT;
  /* Construct arm: alloc(0x18); iff non-NULL ctor 0x40cc10 + the two
     const stores [obj+0]=0xb9c430, [obj+0x14]=0. Found arm: adopt1
     (node+0x14 -> pair) then island3; adopt2 runs on BOTH arms
     (arg1 receiver). */
  const int32_t ctor = (arm == ISAAC_SFX_MAP_CONSTRUCT_ARM_CONSTRUCT &&
                        alloc_nonnull != 0)
                           ? 1
                           : 0;
  const int32_t island2 =
      arm == ISAAC_SFX_MAP_CONSTRUCT_ARM_CONSTRUCT
          ? isaac_sfx_map_construct_island2(alloc_nonnull, probe2_al, hook)
          : 0;
  const int32_t island3 =
      arm == ISAAC_SFX_MAP_CONSTRUCT_ARM_FOUND
          ? isaac_sfx_map_construct_island3(pair1, probe3_al, hook)
          : 0;
  out->arm = static_cast<uint32_t>(arm);
  out->found = static_cast<uint32_t>(found);
  out->adopt_calls = static_cast<uint32_t>(found != 0 ? 2 : 1);
  out->alloc_call_runs = static_cast<uint32_t>(arm == ISAAC_SFX_MAP_CONSTRUCT_ARM_CONSTRUCT ? 1 : 0);
  out->ctor_call_runs = static_cast<uint32_t>(ctor);
  out->secondary_vtable_va =
      ctor != 0 ? ISAAC_SFX_MAP_CONSTRUCT_SECONDARY_VTABLE_VA : 0;
  out->secondary_field14_zero = static_cast<uint32_t>(ctor);
  out->island1_hook_runs = 0;
  out->island2_hook_runs = static_cast<uint32_t>(island2);
  out->island3_hook_runs = static_cast<uint32_t>(island3);
  out->returns_arg1 = 1;
  out->ret_imm = ISAAC_SFX_MAP_CONSTRUCT_RET_IMM;
  out->stack_args = ISAAC_SFX_MAP_CONSTRUCT_STACK_ARGS;
  out->arg3_dead = ISAAC_SFX_MAP_CONSTRUCT_ARG3_DEAD;
  out->alloc_size = ISAAC_SFX_MAP_CONSTRUCT_ALLOC_SIZE;
  out->node_member_offset = ISAAC_SFX_MAP_CONSTRUCT_NODE_MEMBER_OFF;
}

extern "C" void isaac_sfx_init_walk_plan(uint32_t flags,
                                         uint32_t arg1,
                                         uint32_t node_is_sentinel,
                                         uint32_t node_member_ptr,
                                         uint32_t node_member_key,
                                         uint32_t key,
                                         uint32_t node_b,
                                         uint32_t probe_al,
                                         uint32_t hook,
                                         IsaacSfxInitWalkPlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t warn = isaac_sfx_init_walk_warn_needed(flags);
  const int32_t body = isaac_sfx_init_walk_body_runs(arg1);
  const int32_t step =
      body != 0 ? isaac_sfx_init_walk_step(node_is_sentinel, node_member_ptr,
                                           node_member_key, arg1, key)
                : ISAAC_SFX_INIT_WALK_STEP_MISS;
  const int32_t found_arm = step == ISAAC_SFX_INIT_WALK_STEP_FOUND ? 1 : 0;
  const int32_t island = isaac_sfx_init_walk_island_hook(found_arm, node_b,
                                                         probe_al, hook);
  out->warn_needed = static_cast<uint32_t>(warn);
  out->body_runs = static_cast<uint32_t>(body);
  out->step = static_cast<uint32_t>(step);
  out->found_arm_runs = static_cast<uint32_t>(found_arm);
  out->advance_calls =
      static_cast<uint32_t>(step == ISAAC_SFX_INIT_WALK_STEP_ADVANCE ? 1 : 0);
  out->remove_call_runs = static_cast<uint32_t>(found_arm);
  out->free_runs = static_cast<uint32_t>(found_arm);
  out->free_size = ISAAC_SFX_INIT_WALK_FREE_SIZE;
  out->island_hook_runs = static_cast<uint32_t>(island);
  out->tail_sub10_call_runs = static_cast<uint32_t>(body);
  out->member_offset = ISAAC_SFX_INIT_WALK_MEMBER_OFF;
  out->key_offset_in_member = ISAAC_SFX_INIT_WALK_KEY_OFF;
  out->key_offset_in_arg = ISAAC_SFX_INIT_WALK_KEY_OFF;
  out->node_b_offset = ISAAC_SFX_INIT_WALK_NODE_B_OFF;
  out->ret_imm = ISAAC_SFX_INIT_WALK_RET_IMM;
  out->stack_args = ISAAC_SFX_INIT_WALK_STACK_ARGS;
  out->warn_level = ISAAC_SFX_INIT_WALK_WARN_LEVEL;
  out->warn_fmt_va = ISAAC_SFX_INIT_WALK_WARN_FMT_VA;
  out->warn_stack_args = ISAAC_SFX_INIT_WALK_WARN_STACK_ARGS;
}

/* v36 census pins (fresh full-body dumps; see notes sfx-v36-mapwalk). */

extern "C" uint32_t isaac_sfx_map_construct_ret_imm(void) {
  return ISAAC_SFX_MAP_CONSTRUCT_RET_IMM;
}

extern "C" uint32_t isaac_sfx_map_construct_stack_args(void) {
  return ISAAC_SFX_MAP_CONSTRUCT_STACK_ARGS;
}

extern "C" uint32_t isaac_sfx_map_construct_arg3_dead(void) {
  return ISAAC_SFX_MAP_CONSTRUCT_ARG3_DEAD;
}

extern "C" uint32_t isaac_sfx_map_construct_vtable_rows(void) {
  return ISAAC_SFX_MAP_CONSTRUCT_VTABLE_ROWS;
}

extern "C" uint32_t isaac_sfx_map_construct_seh_handler_va(void) {
  return ISAAC_SFX_MAP_CONSTRUCT_SEH_HANDLER_VA;
}

extern "C" uint32_t isaac_sfx_map_construct_alloc_size(void) {
  return ISAAC_SFX_MAP_CONSTRUCT_ALLOC_SIZE;
}

extern "C" uint32_t isaac_sfx_map_construct_node_member_off(void) {
  return ISAAC_SFX_MAP_CONSTRUCT_NODE_MEMBER_OFF;
}

extern "C" uint32_t isaac_sfx_map_construct_secondary_vtable_va(void) {
  return ISAAC_SFX_MAP_CONSTRUCT_SECONDARY_VTABLE_VA;
}

extern "C" uint32_t isaac_sfx_map_construct_hash_site(void) {
  return ISAAC_SFX_MAP_CONSTRUCT_HASH_SITE;
}

extern "C" uint32_t isaac_sfx_map_construct_find_site(void) {
  return ISAAC_SFX_MAP_CONSTRUCT_FIND_SITE;
}

extern "C" uint32_t isaac_sfx_map_construct_adopt1_site(void) {
  return ISAAC_SFX_MAP_CONSTRUCT_ADOPT1_SITE;
}

extern "C" uint32_t isaac_sfx_map_construct_alloc_site(void) {
  return ISAAC_SFX_MAP_CONSTRUCT_ALLOC_SITE;
}

extern "C" uint32_t isaac_sfx_map_construct_ctor_site(void) {
  return ISAAC_SFX_MAP_CONSTRUCT_CTOR_SITE;
}

extern "C" uint32_t isaac_sfx_map_construct_adopt2_site(void) {
  return ISAAC_SFX_MAP_CONSTRUCT_ADOPT2_SITE;
}

extern "C" uint32_t isaac_sfx_map_construct_vtable_store_site(void) {
  return ISAAC_SFX_MAP_CONSTRUCT_VTABLE_STORE_SITE;
}

extern "C" uint32_t isaac_sfx_map_construct_field14_store_site(void) {
  return ISAAC_SFX_MAP_CONSTRUCT_FIELD14_STORE_SITE;
}

extern "C" uint32_t isaac_sfx_map_construct_hash_in_place_site(void) {
  return ISAAC_SFX_MAP_CONSTRUCT_HASH_IN_PLACE_SITE;
}

extern "C" uint32_t isaac_sfx_map_island1_site(void) {
  return ISAAC_SFX_MAP_ISLAND1_SITE;
}

extern "C" uint32_t isaac_sfx_map_island2_site(void) {
  return ISAAC_SFX_MAP_ISLAND2_SITE;
}

extern "C" uint32_t isaac_sfx_map_island3_site(void) {
  return ISAAC_SFX_MAP_ISLAND3_SITE;
}

extern "C" uint32_t isaac_sfx_init_walk_ret_imm(void) {
  return ISAAC_SFX_INIT_WALK_RET_IMM;
}

extern "C" uint32_t isaac_sfx_init_walk_stack_args(void) {
  return ISAAC_SFX_INIT_WALK_STACK_ARGS;
}

extern "C" uint32_t isaac_sfx_init_walk_vtable_rows(void) {
  return ISAAC_SFX_INIT_WALK_VTABLE_ROWS;
}

extern "C" uint32_t isaac_sfx_init_walk_seh_handler_va(void) {
  return ISAAC_SFX_INIT_WALK_SEH_HANDLER_VA;
}

extern "C" uint32_t isaac_sfx_init_walk_warn_site(void) {
  return ISAAC_SFX_INIT_WALK_WARN_SITE;
}

extern "C" uint32_t isaac_sfx_init_walk_warn_fmt_va(void) {
  return ISAAC_SFX_INIT_WALK_WARN_FMT_VA;
}

extern "C" uint32_t isaac_sfx_init_walk_warn_level(void) {
  return ISAAC_SFX_INIT_WALK_WARN_LEVEL;
}

extern "C" uint32_t isaac_sfx_init_walk_warn_stack_args(void) {
  return ISAAC_SFX_INIT_WALK_WARN_STACK_ARGS;
}

extern "C" uint32_t isaac_sfx_init_walk_member_off(void) {
  return ISAAC_SFX_INIT_WALK_MEMBER_OFF;
}

extern "C" uint32_t isaac_sfx_init_walk_key_off(void) {
  return ISAAC_SFX_INIT_WALK_KEY_OFF;
}

extern "C" uint32_t isaac_sfx_init_walk_node_b_off(void) {
  return ISAAC_SFX_INIT_WALK_NODE_B_OFF;
}

extern "C" uint32_t isaac_sfx_init_walk_free_size(void) {
  return ISAAC_SFX_INIT_WALK_FREE_SIZE;
}

extern "C" uint32_t isaac_sfx_init_walk_advance_va(void) {
  return ISAAC_SFX_INIT_WALK_ADVANCE_VA;
}

extern "C" uint32_t isaac_sfx_init_walk_remove_va(void) {
  return ISAAC_SFX_INIT_WALK_REMOVE_VA;
}

extern "C" uint32_t isaac_sfx_init_walk_find_site(void) {
  return ISAAC_SFX_INIT_WALK_FIND_SITE;
}

extern "C" uint32_t isaac_sfx_init_walk_island_site(void) {
  return ISAAC_SFX_INIT_WALK_ISLAND_SITE;
}

extern "C" uint32_t isaac_sfx_init_walk_free_site(void) {
  return ISAAC_SFX_INIT_WALK_FREE_SITE;
}

extern "C" uint32_t isaac_sfx_init_walk_tail_site(void) {
  return ISAAC_SFX_INIT_WALK_TAIL_SITE;
}

/* ---------- v37: 0xb9c4dc dtor-forest vtable chain census + pure
   dtor laws (wave-30 F4; notes sfx-v37-dtorforest) ----------

   The dtor-forest rows reachable from the cluster vtables (fresh
   dumps cpu-dump/00a156e0.txt .. 00a2bb10.txt; whole-.text census):
   manager 0xb9c4dc[0]=0xa2af00, secondaries 0xba306c[0]=0xa7d260 /
   0xba30b0[0]=0xa7dac0 (foreign wrappers that CALL the shared nested
   dtor 0xa2af30 — E8 callers 0xa2af06/0xa7d276/0xa7dad6), manager
   base 0xb9fdcc[0]=0xa61a80, member 0xb81c0c[0]=0xa156e0, member
   base 0xba04b4[0]=0xa68440, pair 0xb9c430[0]=0x40cb50, pair base
   0xb1a6fc[0]=0x40cbb0. EVERY dtor body is HOST (reaches free
   0xaef15c / the IAT release 0xb18274 / the list clear 0xa2bcb0 /
   the block free 0x4149d0) — 0 pure leaves; the decision layers
   below are the laws. The v35 `isaac_sfx_dtor_free_gate` byte gate
   now covers EIGHT bodies (0x34/8/8/0x18/0x14/0xc/0x4c/0x64). */

extern "C" int32_t isaac_sfx_dtor_owned_free_gate(uint32_t ptr) {
  /* PE 0xa2af44/0xa2af7e (nested dtor, the member1/member2 owned
     ptrs this[0x18]/this[0x30]) and the member/pair dtor rows:
     0xa156f0, 0xa1573d, 0xa157c7, 0x40cb67, 0x40cbc7 — `test esi,esi
     ; je skip`: the release (IAT [0xb18274]) + free(ptr, 0x1c) +
     zero-store runs iff the ptr is NON-NULL. FULL dword test —
     0x100 is a live pointer; the gate is NOT byte-narrowed. */
  return ptr != 0 ? 1 : 0;
}

extern "C" int32_t isaac_sfx_dtor_lock_bit_clear(uint32_t byte) {
  /* PE `and byte [m+4], 0xfe` — 8 sites: 0xa2af61 (this[0x2c]),
     0xa2af9b (this[0x14]), 0xa1570d/0xa1575a/0xa157e4 (member dtor
     rows), 0x40cb84/0x40cbe4 (pair dtor rows), 0xa68480 (the
     0xba04b4[2] virtual itself). Unconditional byte bit0 clear on
     the destroy path; the machine reads and writes a BYTE. */
  return static_cast<int32_t>((byte & 0xffu) & 0xfeu);
}

extern "C" uint32_t isaac_sfx_dtor_flags_put0(uint32_t flags) {
  /* PE `and dword [this+4], 0xfffffffe` — 3 sites: 0xa2afbf (nested
     dtor tail), 0xa2b040 (hook-clear tail; the v35 hook-clear plan's
     flags_after consumes this op BY REFERENCE), 0xa61a86 (manager
     base dtor 0xa61a80). FULL dword op. */
  return flags & ~1u;
}

/* v37 census pins (fresh dumps + whole-.text census; see notes
   sfx-v37-dtorforest). */

extern "C" uint32_t isaac_sfx_nested_dtor_va(void) {
  return ISAAC_SFX_NESTED_DTOR_VA;
}

extern "C" uint32_t isaac_sfx_nested_dtor_shared_bodies(void) {
  return ISAAC_SFX_NESTED_DTOR_SHARED_BODIES;
}

extern "C" uint32_t isaac_sfx_nested_dtor_e8_callers(void) {
  return ISAAC_SFX_NESTED_DTOR_E8_CALLERS;
}

extern "C" uint32_t isaac_sfx_manager_vftable_va(void) {
  return ISAAC_SFX_MANAGER_VFTABLE_VA;
}

extern "C" uint32_t isaac_sfx_secondary1_vftable_va(void) {
  return ISAAC_SFX_SECONDARY1_VFTABLE_VA;
}

extern "C" uint32_t isaac_sfx_secondary2_vftable_va(void) {
  return ISAAC_SFX_SECONDARY2_VFTABLE_VA;
}

extern "C" uint32_t isaac_sfx_manager_base_vftable_va(void) {
  return ISAAC_SFX_MANAGER_BASE_VFTABLE_VA;
}

extern "C" uint32_t isaac_sfx_member_vftable_va(void) {
  return ISAAC_SFX_MEMBER_VFTABLE_VA;
}

extern "C" uint32_t isaac_sfx_member_base_vftable_va(void) {
  return ISAAC_SFX_MEMBER_BASE_VFTABLE_VA;
}

extern "C" uint32_t isaac_sfx_pair_vftable_va(void) {
  return ISAAC_SFX_PAIR_VFTABLE_VA;
}

extern "C" uint32_t isaac_sfx_pair_base_vftable_va(void) {
  return ISAAC_SFX_PAIR_BASE_VFTABLE_VA;
}

extern "C" uint32_t isaac_sfx_flag_bit1_setter_va(void) {
  return ISAAC_SFX_FLAG_BIT1_SETTER_VA;
}

extern "C" uint32_t isaac_sfx_dtor_forest_vtables(void) {
  return ISAAC_SFX_DTOR_FOREST_VTABLES;
}

extern "C" uint32_t isaac_sfx_dtor_delete_gate_bodies(void) {
  return ISAAC_SFX_DTOR_DELETE_GATE_BODIES;
}

extern "C" uint32_t isaac_sfx_dtor_owned_free_gate_sites(void) {
  return ISAAC_SFX_DTOR_OWNED_FREE_GATE_SITES;
}

extern "C" uint32_t isaac_sfx_dtor_lock_clear_sites(void) {
  return ISAAC_SFX_DTOR_LOCK_CLEAR_SITES;
}

extern "C" uint32_t isaac_sfx_dtor_flags_put0_sites(void) {
  return ISAAC_SFX_DTOR_FLAGS_PUT0_SITES;
}

extern "C" uint32_t isaac_sfx_dtor_owned_free_size(void) {
  return ISAAC_SFX_DTOR_OWNED_FREE_SIZE;
}

extern "C" uint32_t isaac_sfx_dtor_block_free_va(void) {
  return ISAAC_SFX_DTOR_BLOCK_FREE_VA;
}

extern "C" uint32_t isaac_sfx_dtor_block_free_site(void) {
  return ISAAC_SFX_DTOR_BLOCK_FREE_SITE;
}

extern "C" uint32_t isaac_sfx_list_clear_va(void) {
  return ISAAC_SFX_LIST_CLEAR_VA;
}

extern "C" uint32_t isaac_sfx_list_clear_callers(void) {
  return ISAAC_SFX_LIST_CLEAR_CALLERS;
}

extern "C" uint32_t isaac_sfx_hook_callable_va(void) {
  return ISAAC_SFX_HOOK_CALLABLE_VA;
}

extern "C" uint32_t isaac_sfx_release_fnptr_va(void) {
  return ISAAC_SFX_RELEASE_FNPTR_VA;
}

extern "C" uint32_t isaac_sfx_dtor_vptr_store1_va(void) {
  return ISAAC_SFX_DTOR_VPTR_STORE1_VA;
}

extern "C" uint32_t isaac_sfx_dtor_vptr_store2_va(void) {
  return ISAAC_SFX_DTOR_VPTR_STORE2_VA;
}

extern "C" uint32_t isaac_sfx_hook_install_lock_sites(void) {
  return ISAAC_SFX_HOOK_INSTALL_LOCK_SITES;
}

extern "C" uint32_t isaac_sfx_hook_clear_lock_sites(void) {
  return ISAAC_SFX_HOOK_CLEAR_LOCK_SITES;
}

extern "C" uint32_t isaac_sfx_hook_clear_reinit_stores(void) {
  return ISAAC_SFX_HOOK_CLEAR_REINIT_STORES;
}

/* ---------- v14: 0x00416040 the nested XML node parse ---------- */

/* 0x416051..0x41605d: `cmp al,0x21 ; je MARKUP ; cmp al,0x3f ; je PI`.
   LOW BYTE of the head byte. */
extern "C" int32_t isaac_sfx_xml_nested_parse_head_gate(uint32_t head_byte) {
  const uint8_t h = low_byte(head_byte);
  if (h == static_cast<uint8_t>(ISAAC_SFX_XML_NESTED_HEAD_BANG)) {
    return ISAAC_SFX_XML_NESTED_HEAD_MARKUP;
  }
  if (h == static_cast<uint8_t>(ISAAC_SFX_XML_NESTED_HEAD_QMARK)) {
    return ISAAC_SFX_XML_NESTED_HEAD_PI;
  }
  return ISAAC_SFX_XML_NESTED_HEAD_ELEMENT;
}

/* Table 0xb1ae60 — 248 of 256 bytes are 1; the eight zeros are NUL, TAB,
   LF, CR, SPACE, '/', '>', '?' (0, 9, 10, 13, 32, 47, 62, 63). Verified
   against .rdata of this image. LOW BYTE. */
extern "C" int32_t isaac_sfx_xml_nested_parse_name_char(uint32_t byte) {
  const uint8_t b = low_byte(byte);
  return (b == 0u || b == 9u || b == 10u || b == 13u || b == 32u ||
          b == 47u || b == 62u || b == 63u)
             ? 0
             : 1;
}

/* 0x41617f..0x4161aa: the "?xml " gate. x/X m/M l/L are case-insensitive
   pairs; byte4 uses the v11 space predicate (`cmp byte [eax+0xb1b060],0`).
   LOW BYTES each. */
extern "C" int32_t isaac_sfx_xml_nested_parse_pi_decl_gate(uint32_t b1,
                                                           uint32_t b2,
                                                           uint32_t b3,
                                                           uint32_t b4) {
  const uint8_t x = low_byte(b1), m = low_byte(b2), l = low_byte(b3);
  const int32_t x_ok =
      (x == 'x' || x == 'X') ? 1 : 0;
  const int32_t m_ok =
      (m == 'm' || m == 'M') ? 1 : 0;
  const int32_t l_ok =
      (l == 'l' || l == 'L') ? 1 : 0;
  if (x_ok == 0 || m_ok == 0 || l_ok == 0) {
    return 0;
  }
  /* 0x41619f movzx eax, byte [ecx+3]; cmp byte [eax+0xb1b060],0 ; je
     generic — the fourth byte must be a table space. */
  return isaac_sfx_xml_doc_parse_is_space(b4) != 0 ? 1 : 0;
}

/* 0x41620e..0x416261: the "<!" markup kind. Order is the machine's:
   '-' '-' -> COMMENT, 'D' "OCTYPE" + space -> DOCTYPE, '[' "CDATA" '['
   -> CDATA, else GENERIC. The CDATA last byte (b7) is compared against
   the FIRST byte (b1, `cmp byte [ecx+7], al` with al == b1 == '['), so
   the gate spells b7 == b1. LOW BYTES. */
extern "C" int32_t isaac_sfx_xml_nested_parse_markup_kind(uint32_t b1,
                                                          uint32_t b2,
                                                          uint32_t b3,
                                                          uint32_t b4,
                                                          uint32_t b5,
                                                          uint32_t b6,
                                                          uint32_t b7,
                                                          uint32_t b8) {
  const uint8_t c1 = low_byte(b1), c2 = low_byte(b2);
  const uint8_t c3 = low_byte(b3), c4 = low_byte(b4);
  const uint8_t c5 = low_byte(b5), c6 = low_byte(b6);
  const uint8_t c7 = low_byte(b7);
  if (c1 == static_cast<uint8_t>(ISAAC_SFX_XML_NESTED_MARKUP_DASH_BYTE) &&
      c2 == static_cast<uint8_t>(ISAAC_SFX_XML_NESTED_MARKUP_DASH_BYTE)) {
    /* 0x416214 cmp al,0x2d ; je 0x4163ae ; 0x4163ae cmp byte [ecx+2],0x2d */
    return ISAAC_SFX_XML_NESTED_MARKUP_COMMENT;
  }
  if (c1 == 'D' && c2 == 'O' && c3 == 'C' && c4 == 'T' && c5 == 'Y' &&
      c6 == 'P' && c7 == 'E') {
    /* 0x4162f2..0x416324 "OCTYPE", then the space predicate on byte 8. */
    if (isaac_sfx_xml_doc_parse_is_space(b8) != 0) {
      return ISAAC_SFX_XML_NESTED_MARKUP_DOCTYPE;
    }
    return ISAAC_SFX_XML_NESTED_MARKUP_GENERIC;
  }
  if (c1 == '[' && c2 == 'C' && c3 == 'D' && c4 == 'A' && c5 == 'T' &&
      c6 == 'A' && c7 == c1) {
    /* 0x416224 cmp al,0x5b and the "CDATA[" spell: the last byte must
       equal the first ('['). */
    return ISAAC_SFX_XML_NESTED_MARKUP_CDATA;
  }
  return ISAAC_SFX_XML_NESTED_MARKUP_GENERIC;
}

/* 0x4160d0 `sub ecx,edx` — name_len = end - start, 32-bit wrap. */
extern "C" uint32_t isaac_sfx_xml_nested_parse_name_len(uint32_t name_start,
                                                        uint32_t name_end) {
  return name_end - name_start;
}

/* 0x4160be `cmp ecx,edx` FULL-WORD, then `cmovne eax,[0xc7de4c]` with
   eax = 0xb1b690: name_len == 0 -> "expected element name", else prev. */
extern "C" uint32_t isaac_sfx_xml_nested_parse_name_error(uint32_t prev_error,
                                                          uint32_t name_len) {
  return name_len == 0u ? ISAAC_SFX_XML_NESTED_ERR_NAME_VA : prev_error;
}

/* 0x41612d `cmp byte [ecx],0x3e ; cmove eax,[0xc7de4c]` with
   eax = 0xb1b6a8: close byte '>' (LOW BYTE) -> prev, else "expected >". */
extern "C" uint32_t isaac_sfx_xml_nested_parse_tail_error(
    uint32_t prev_error, uint32_t close_byte) {
  return low_byte(close_byte) ==
                 static_cast<uint8_t>(ISAAC_SFX_XML_NESTED_TAIL_GT_BYTE)
             ? prev_error
             : ISAAC_SFX_XML_NESTED_ERR_GT_VA;
}

/* 0x4161c4 etc. `test dl,dl ; mov eax,0xb1b678 ; cmovne eax,edi` — the
   scan NUL latch shared by every scan path. byte == 0 (LOW BYTE) latches
   "unexpected end of data", else the previous slot value survives. */
extern "C" uint32_t isaac_sfx_xml_nested_parse_scan_error(uint32_t prev_error,
                                                          uint32_t byte) {
  return low_byte(byte) == 0u ? ISAAC_SFX_XML_NESTED_ERR_UNEXPECTED_VA
                              : prev_error;
}

/* Node type at node+0x14: ELEMENT -> 1, CDATA -> 3, else 0. */
extern "C" int32_t isaac_sfx_xml_nested_parse_node_type(int32_t head_gate,
                                                        int32_t markup_kind) {
  if (head_gate == ISAAC_SFX_XML_NESTED_HEAD_ELEMENT) {
    return ISAAC_SFX_XML_NESTED_NODE_TYPE_ELEMENT;
  }
  if (head_gate == ISAAC_SFX_XML_NESTED_HEAD_MARKUP &&
      markup_kind == ISAAC_SFX_XML_NESTED_MARKUP_CDATA) {
    return ISAAC_SFX_XML_NESTED_NODE_TYPE_CDATA;
  }
  return 0;
}

/* The six node init store displacements: 0x00, 0x04, 0x10, 0x14, 0x18,
   0x20. All 16-bit+ offsets pass a dword store in the PE; 0x14 is the
   type. NOTE the offsets are the byte displacements of the mem operands
   (node base + off). */
extern "C" int32_t isaac_sfx_xml_nested_parse_node_writes_offset(
    uint32_t off) {
  switch (off) {
    case 0x00u:
    case 0x04u:
    case 0x10u:
    case 0x14u:
    case 0x18u:
    case 0x20u:
      return 1;
    default:
      return 0;
  }
}

/* 0x416156 `mov byte [eax+ecx],0` with eax = [node+0x00] (name ptr) and
   ecx = [node+0x08] (name len) — the free low-32 result. */
extern "C" uint32_t isaac_sfx_xml_nested_parse_nul_position(uint32_t name_ptr,
                                                            uint32_t name_len) {
  return name_ptr + name_len;
}

/* 0x4162db `sub ecx,ebx` — cdata text length, found_pos - text_start,
   32-bit wrap. */
extern "C" uint32_t isaac_sfx_xml_nested_parse_cdata_text_len(
    uint32_t text_start, uint32_t found) {
  return found - text_start;
}

/* The per-path cursor arithmetic:
   ELEMENT: post_attrs (the value the HOST attrs call leaves) then
            +1 (GT) / +2 (CLOSE) / +0 (OTHER).
   PI:      found_pos + 2 ("?>")
   COMMENT: found_pos + 3 ("-->")
   CDATA:   found_pos + 3 ("]]>")
   DOCTYPE: found_pos + 1 (">")
   GENERIC: found_pos + 1 (">")
   Everything wraps at 32 bits like the PE's `lea/add`. */
extern "C" uint32_t isaac_sfx_xml_nested_parse_cursor_after(
    int32_t head_gate, int32_t markup_kind, int32_t tail_gate,
    uint32_t post_attrs, uint32_t found_pos) {
  if (head_gate == ISAAC_SFX_XML_NESTED_HEAD_ELEMENT) {
    uint32_t c = post_attrs;
    if (tail_gate == ISAAC_SFX_XML_NESTED_TAIL_GT) {
      c += 1u;
    } else if (tail_gate == ISAAC_SFX_XML_NESTED_TAIL_CLOSE) {
      c += 2u;
    }
    return c;
  }
  switch (markup_kind) {
    case ISAAC_SFX_XML_NESTED_MARKUP_COMMENT:
      return found_pos + 3u;
    case ISAAC_SFX_XML_NESTED_MARKUP_CDATA:
      return found_pos + 3u;
    case ISAAC_SFX_XML_NESTED_MARKUP_DOCTYPE:
      return found_pos + 1u;
    default:
      /* PI (head_gate PI or markup GENERIC): "?>" adds 2, ">" adds 1. */
      return head_gate == ISAAC_SFX_XML_NESTED_HEAD_PI ? found_pos + 2u
                                                       : found_pos + 1u;
  }
}

extern "C" void isaac_sfx_xml_nested_parse_plan(uint32_t cursor_base,
                                                uint32_t post_attrs,
                                                int32_t head_gate,
                                                int32_t markup_kind,
                                                uint32_t name_len,
                                                uint32_t ws_skip,
                                                int32_t tail_gate,
                                                uint32_t close_byte,
                                                uint32_t found_pos,
                                                int32_t scan_latched,
                                                uint32_t prev_error,
                                                IsaacSfxXmlNestedParsePlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t node_type =
      isaac_sfx_xml_nested_parse_node_type(head_gate, markup_kind);
  const int32_t allocator_call = node_type != 0 ? 1 : 0;
  const int32_t attrs_call =
      head_gate == ISAAC_SFX_XML_NESTED_HEAD_ELEMENT ? 1 : 0;
  const int32_t children_call =
      (head_gate == ISAAC_SFX_XML_NESTED_HEAD_ELEMENT &&
       tail_gate == ISAAC_SFX_XML_NESTED_TAIL_GT)
          ? 1
          : 0;

  out->entered = 1;
  out->head_gate = head_gate;
  out->markup_kind = markup_kind;
  out->node_type = node_type;
  out->allocator_call = allocator_call;
  out->allocator_va = ISAAC_SFX_XML_NESTED_ALLOC_VA;
  out->allocator_target = ISAAC_SFX_XML_NESTED_ALLOC_TARGET;
  out->node_size = ISAAC_SFX_XML_NESTED_NODE_SIZE;
  out->attrs_call = attrs_call;
  out->attrs_va = ISAAC_SFX_XML_NESTED_ATTRS_VA;
  out->children_call = children_call;
  out->children_va = ISAAC_SFX_XML_NESTED_CHILDREN_VA;

  out->name_ptr = 0u;
  out->name_len = 0u;
  out->name_empty = 0;
  out->name_error = prev_error;
  out->ws_skip = 0;
  out->tail_gate = tail_gate;
  out->close_error = 0u;
  out->error_slot = prev_error;
  out->error_store = 0;
  out->scan_latched = scan_latched != 0 ? 1 : 0;
  out->text_ptr = 0u;
  out->text_len = 0u;
  out->nul_pos = 0u;

  if (head_gate == ISAAC_SFX_XML_NESTED_HEAD_ELEMENT) {
    /* Name ptr/len stores + the FULL-WORD empty test (0x4160be/0x4160c7/
       0x4160d2). name_ptr == cursor_base (edx = [esi] at 0x416098). */
    out->name_ptr = cursor_base;
    out->name_len = name_len;
    out->name_empty = name_len == 0u ? 1 : 0;
    out->name_error =
        isaac_sfx_xml_nested_parse_name_error(prev_error, name_len);
    out->ws_skip = static_cast<int32_t>(ws_skip);
    /* The slot IS stored (0x4160d7) on every element arm. */
    out->error_slot = out->name_error;
    out->error_store = 1;

    if (tail_gate == ISAAC_SFX_XML_NESTED_TAIL_GT) {
      /* No further slot store; the children call leaves it. */
    } else if (tail_gate == ISAAC_SFX_XML_NESTED_TAIL_CLOSE) {
      /* 0x416137: `mov eax,0xb1b6a8 ; cmp byte [ecx],0x3e ; cmove
         eax,[0xc7de4c]` — the close law, whose "prev" is the JUST-STORED
         name error (the cmove re-reads the slot). */
      out->close_error =
          isaac_sfx_xml_nested_parse_tail_error(out->name_error, close_byte);
      out->error_slot = out->close_error;
    } else {
      /* 0x416143: `mov [0xc7de4c],0xb1b6a8` — unconditional. */
      out->error_slot = ISAAC_SFX_XML_NESTED_ERR_GT_VA;
    }
    /* 0x416156: the in-place NUL at name_ptr + name_len. The 0x416165
       empty-arm zeroes the shared empty string at 0xc71640 (same byte
       value 0; this law reports the ADDRESS: name+len, or the empty
       string when the machine takes the je at 0x416151). */
    out->nul_pos = out->name_ptr != 0u
                       ? isaac_sfx_xml_nested_parse_nul_position(
                             out->name_ptr, out->name_len)
                       : ISAAC_SFX_ATTR_EMPTY_STRING_VA;
    /* The element body runs 2 host calls (allocator + attrs) and a third
       (children) exactly when the tail is GT. */
    out->host_calls = allocator_call + attrs_call + children_call;
  } else if (head_gate == ISAAC_SFX_XML_NESTED_HEAD_PI ||
             head_gate == ISAAC_SFX_XML_NESTED_HEAD_MARKUP) {
    /* Scan paths: the error slot is the latched value — a NUL seen before
       the terminator forces 0xb1b678, otherwise prev survives. */
    out->error_slot = out->scan_latched != 0
                          ? static_cast<uint32_t>(
                                ISAAC_SFX_XML_NESTED_ERR_UNEXPECTED_VA)
                          : prev_error;
    if (head_gate == ISAAC_SFX_XML_NESTED_HEAD_MARKUP &&
        markup_kind == ISAAC_SFX_XML_NESTED_MARKUP_DOCTYPE) {
      /* DOCTYPE stores the slot only when a NUL is seen (0x416378 /
         0x41638b, immediate during the scan); a clean '>' at depth 0
         stores nothing. */
      out->error_store = out->scan_latched;
    } else if (head_gate == ISAAC_SFX_XML_NESTED_HEAD_MARKUP &&
               markup_kind == ISAAC_SFX_XML_NESTED_MARKUP_GENERIC) {
      /* GENERIC: 0x4163fa `cmp cl,0x3e ; je 0x416421` — when the byte
         right after '!' is already '>', the body jumps to the done exit
         WITHOUT touching the slot (0x4163ff reads the slot only after
         that je). Otherwise 0x41641b stores the accumulated latch. */
      out->error_store =
          (found_pos != cursor_base + 1u) ? 1 : 0;
    } else {
      /* PI / COMMENT / CDATA: the found exit always stores the latch. */
      out->error_store = 1;
    }
    if (head_gate == ISAAC_SFX_XML_NESTED_HEAD_MARKUP &&
        markup_kind == ISAAC_SFX_XML_NESTED_MARKUP_CDATA) {
      /* CDATA: text ptr = cursor+8, text len = found - text_start
         (0x4162d8..0x4162dd), NUL in place at found (0x4162e2). */
      out->text_ptr = cursor_base + 8u;
      out->text_len = isaac_sfx_xml_nested_parse_cdata_text_len(
          out->text_ptr, found_pos);
      out->nul_pos = found_pos;
    }
    out->host_calls = allocator_call; /* CDATA only */
  } else {
    out->host_calls = 0;
  }

  out->cursor_after = isaac_sfx_xml_nested_parse_cursor_after(
      head_gate, markup_kind, tail_gate, post_attrs, found_pos);
  out->pure_complete = 0; /* allocator/attrs/children remain host */
  out->size_bytes = ISAAC_SFX_XML_NESTED_PARSE_SIZE_BYTES;
  out->caller_count = ISAAC_SFX_XML_NESTED_PARSE_CALLERS;
}

ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_nested_parse_head_gate);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_nested_parse_name_char);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_nested_parse_pi_decl_gate);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_nested_parse_markup_kind);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_nested_parse_name_len);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_nested_parse_name_error);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_nested_parse_tail_error);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_nested_parse_scan_error);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_nested_parse_node_type);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_nested_parse_node_writes_offset);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_nested_parse_nul_position);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_nested_parse_cdata_text_len);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_nested_parse_cursor_after);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_nested_parse_plan);

/* ============================ v15: pool + attrs ===========================
 * 0x416510 the XML node allocator's pool arithmetic and 0x4165a0 the
 * attrs parse's pure decision laws (see the header's v15 block). */

/* 0x41651a..0x416522 `mov edx,[pool+4] ; neg edx ; and edx,3 ; add
   edx,[pool+4]` — x + ((-x) & 3), the align-up to 4, 32-bit wrap. The
   same neg/and/add repeats on the grow arm (0x416571..0x416576 and
   0x416587..0x41658c). */
extern "C" uint32_t isaac_sfx_xml_pool_align4(uint32_t x) {
  const uint32_t neg = static_cast<uint32_t>(0u - x);
  return x + (neg & 3u);
}

/* 0x416525..0x41652b `lea eax,[edx+ebx] ; cmp eax,[pool+8] ; jbe fast` —
   the UNSIGNED cap compare: grow iff align4(free) + size > end. */
extern "C" int32_t isaac_sfx_xml_pool_need_grow(uint32_t free, uint32_t end,
                                                uint32_t size) {
  const uint32_t claimed = isaac_sfx_xml_pool_align4(free) + size;
  return claimed > end ? 1 : 0;
}

/* 0x416533..0x416540 `mov eax,0x10000 ; cmp ebx,eax ; mov esi,ebx ;
   cmovbe esi,eax ; add esi,0xa` — (size <= 0x10000 ? 0x10000 : size)
   UNSIGNED, then + 0xa with wrap. Computed on the grow arm only. */
extern "C" uint32_t isaac_sfx_xml_pool_grow_request(uint32_t size) {
  const uint32_t cap = size <= ISAAC_SFX_XML_POOL_CAP ? ISAAC_SFX_XML_POOL_CAP
                                                      : size;
  return cap + ISAAC_SFX_XML_POOL_GROW_OVERHEAD;
}

/* 0x41656d..0x416594: given the host alloc result r — ecx = align4(r);
   [ecx] = prev base (host write); base = r; end = r + request; ecx += 4;
   r2 = ecx; node_ptr = align4(r2); [pool+4] = node_ptr + size; return
   node_ptr. The link dword and the base write are host memory; the
   ADDRESSES are pure. */
extern "C" void isaac_sfx_xml_pool_grow_tail(uint32_t alloc_ptr,
                                             uint32_t request,
                                             uint32_t size,
                                             IsaacSfxXmlPoolGrowTail* out) {
  if (out == nullptr) {
    return;
  }
  const uint32_t link_slot = isaac_sfx_xml_pool_align4(alloc_ptr);
  const uint32_t node_ptr =
      isaac_sfx_xml_pool_align4(link_slot + 4u);
  out->link_slot = link_slot;
  out->node_ptr = node_ptr;
  out->new_base = alloc_ptr;
  out->new_end = alloc_ptr + request;
  out->new_free = node_ptr + size;
}

extern "C" void isaac_sfx_xml_pool_plan(uint32_t free, uint32_t end,
                                        uint32_t size,
                                        IsaacSfxXmlPoolPlan* out) {
  if (out == nullptr) {
    return;
  }
  const uint32_t aligned_free = isaac_sfx_xml_pool_align4(free);
  const int32_t grow =
      isaac_sfx_xml_pool_need_grow(free, end, size);
  out->aligned_free = aligned_free;
  out->fast_bump = aligned_free + size;
  out->grow = grow;
  /* The cap/grow arithmetic runs only on the grow arm (after the jbe);
     the fast arm never computes it. */
  out->grow_request = grow != 0 ? isaac_sfx_xml_pool_grow_request(size) : 0u;
  out->pool_slots = 4;
  out->alloc_va = ISAAC_SFX_XML_POOL_ALLOC_VA;
  out->alloc_target = ISAAC_SFX_XML_POOL_DIRECT_TARGET;
  out->grow_fn_offset = ISAAC_SFX_XML_POOL_OFF_GROW_FN_1000C;
  out->host_calls = grow; /* 1 iff the alloc call runs */
  out->pure_complete = 0; /* the 0xa0f4e0 / indirect call stays host */
}

/* ============================ v20: allocator arm + OOM ====================
 * The audit of the v15 claim "OOM slot stays host" found TWO pure gates
 * the v15 unit had skipped: the grow-arm SELECT and the direct-arm OOM
 * slot VALUE. Both are FULL-WORD zero tests (the SAME cmovne direction
 * family as attr_name_error). The alloc call (0xa0f4e0 / [pool+0x1000c])
 * and every memory store stay host; these laws are the VALUES fed to
 * those edges. */

/* 0x416543..0x416545 `test eax,eax ; je 0x416551` — eax = [pool+0x1000c]
   (the pool mark / grow fn). FULL-WORD: grow_fn == 0 -> DIRECT arm
   (0xa0f4e0), else INDIRECT (call eax). */
extern "C" int32_t isaac_sfx_xml_pool_grow_arm(uint32_t grow_fn) {
  return grow_fn == 0u ? ISAAC_SFX_XML_POOL_ARM_DIRECT
                       : ISAAC_SFX_XML_POOL_ARM_INDIRECT;
}

/* 0x41655a..0x416561 `mov eax,0xb1b6b4 ; test edx,edx ; cmovne
   eax,[0xc7de4c]` — r == 0 -> 0xb1b6b4 (OOM), else the PREV slot value
   (recaptured at cmovne time). FULL-WORD; the store is host. */
extern "C" uint32_t isaac_sfx_xml_pool_oom_slot(uint32_t alloc_r,
                                                uint32_t prev_slot) {
  return alloc_r == 0u ? ISAAC_SFX_XML_POOL_ERR_OOM_VA : prev_slot;
}

/* ============================ v21: parent XML reader dispatch ==============
 * 0x0092d140's element-dispatch grammar + the single explicit gate
 * (0x92d3ec..0x92d470). The find primitives are v12-pure and the root
 * name law is v9; these exports are the reader's own name table, the
 * FULL-WORD sound-element gate, and the composed pipeline wiring. */

/* The dispatch-name table — "sounds" / "root" / "sound" (.rdata VAs
   0xb7b1b4 / 0xb66f40 / 0xb7b1ac, pushed at 0x92d3f2 / 0x92d403 /
   0x92d454). -1 out of range. */
extern "C" int32_t isaac_sfx_xml_dispatch_elem_va(int32_t index) {
  static const uint32_t kElemVa[ISAAC_SFX_XML_SOUND_DISPATCH_COUNT] = {
      ISAAC_SFX_XML_ELEM_SOUNDS_VA, ISAAC_SFX_XML_ELEM_ROOT_VA,
      ISAAC_SFX_XML_ELEM_SOUND_VA};
  if (index < 0 || index >= ISAAC_SFX_XML_SOUND_DISPATCH_COUNT) {
    return -1;
  }
  return static_cast<int32_t>(kElemVa[index]);
}

extern "C" int32_t isaac_sfx_xml_dispatch_elem_len(int32_t index) {
  static const int32_t kElemLen[ISAAC_SFX_XML_SOUND_DISPATCH_COUNT] = {
      ISAAC_SFX_XML_ELEM_SOUNDS_LEN, ISAAC_SFX_XML_ELEM_ROOT_LEN,
      ISAAC_SFX_XML_ELEM_SOUND_LEN};
  if (index < 0 || index >= ISAAC_SFX_XML_SOUND_DISPATCH_COUNT) {
    return -1;
  }
  return kElemLen[index];
}

/* 0x92d466 `test esi,esi ; je 0x92db29` on the find("sound") result —
   FULL-WORD zero test (the 0x100 family): no "sound" child skips the
   whole per-sound pipeline to the TRUE epilogue. */
extern "C" int32_t isaac_sfx_xml_sound_gate(uint32_t node_nonzero) {
  return node_nonzero != 0u ? 1 : 0;
}

/* The composed dispatch record. The three results are the reader-find
   return values (CHILD find on the doc / ATTR find on the sounds node /
   CHILD find on the sounds node). The gate is ONLY the sound find: the
   machine branches nowhere on the first two, so sounds_found and
   root_attr_found are reported, never used as gates. */
extern "C" void isaac_sfx_xml_sound_dispatch_plan(
    int32_t find_sounds_result, int32_t find_root_result,
    int32_t find_sound_result, IsaacSfxXmlSoundDispatchPlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t sounds_found = find_sounds_result != 0 ? 1 : 0;
  const int32_t root_found = find_root_result != 0 ? 1 : 0;
  const int32_t sound_found = find_sound_result != 0 ? 1 : 0;
  out->sounds_found = sounds_found;
  out->root_attr_found = root_found;
  out->sound_found = sound_found;
  out->loop_entered = sound_found;
  out->epilogue_skip = sound_found == 0 ? 1 : 0;
  out->stages_mask =
      sound_found != 0 ? static_cast<uint32_t>(ISAAC_SFX_SOUND_PIPE_ALL) : 0u;
  out->dispatch_host_calls = ISAAC_SFX_XML_SOUND_DISPATCH_HOST_CALLS;
  out->per_sound_host_calls = sound_found != 0 ? 1 : 0;
  out->seh_state_parse = ISAAC_SFX_XML_SEH_STATE_PARSE;
  out->seh_state_sound = ISAAC_SFX_XML_SEH_STATE_SOUND;
  out->root_name_read_off = ISAAC_SFX_XML_ROOT_NAME_READ_OFF;
  out->sounds_find_kind = ISAAC_SFX_XML_FIND_VARIANT_CHILD;
  out->root_find_kind = ISAAC_SFX_XML_FIND_VARIANT_ATTR;
  out->sound_find_kind = ISAAC_SFX_XML_FIND_VARIANT_CHILD;
  out->sounds_elem_va = ISAAC_SFX_XML_ELEM_SOUNDS_VA;
  out->root_elem_va = ISAAC_SFX_XML_ELEM_ROOT_VA;
  out->sound_elem_va = ISAAC_SFX_XML_ELEM_SOUND_VA;
  out->size_bytes = ISAAC_SFX_XML_SOUND_DISPATCH_SIZE_BYTES;
  out->caller_count = ISAAC_SFX_XML_SOUND_DISPATCH_CALLERS;
}

ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_dispatch_elem_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_dispatch_elem_len);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_sound_gate);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_sound_dispatch_plan);

/* Table 0xb1af60 — 245 of 256 bytes are 1; the eleven zeros are NUL, TAB,
   LF, CR, SPACE, '!', '/', '<', '=', '>', '?' (0, 9, 10, 13, 32, 33,
   47, 60, 61, 62, 63). Verified against .rdata of this image; stricter
   than the element table 0xb1ae60. LOW BYTE. */
extern "C" int32_t isaac_sfx_xml_attr_name_char(uint32_t byte) {
  const uint8_t b = low_byte(byte);
  return (b == 0u || b == 9u || b == 10u || b == 13u || b == 32u ||
          b == 33u || b == 47u || b == 60u || b == 61u || b == 62u ||
          b == 63u)
             ? 0
             : 1;
}

/* 0x4165ee..0x4165f9 `cmp ecx,esi ; mov eax,0xb1b6c4 ; cmovne eax,edx` —
   FULL-WORD: name_len == 0 -> "expected attribute name", else prev. */
extern "C" uint32_t isaac_sfx_xml_attr_name_error(uint32_t prev_error,
                                                  uint32_t name_len) {
  return name_len == 0u ? ISAAC_SFX_XML_ATTR_ERR_NAME_VA : prev_error;
}

/* 0x416678..0x41667b `cmp byte [ecx],0x3d ; cmove eax,[0xc7de4c]` with
   eax = 0xb1b6dc: byte == '=' (LOW BYTE) -> prev, else "expected =". */
extern "C" uint32_t isaac_sfx_xml_attr_eq_error(uint32_t prev_error,
                                                uint32_t byte) {
  return low_byte(byte) ==
                 static_cast<uint8_t>(ISAAC_SFX_XML_ATTR_EQ_BYTE)
             ? prev_error
             : ISAAC_SFX_XML_ATTR_ERR_EQ_VA;
}

/* 0x4166c5..0x4166cb `cmp al,0x27 ; je quoted ; cmp al,0x22 ; je quoted` —
   the LOW-BYTE quote dispatch, 0x27 first (machine order). */
extern "C" int32_t isaac_sfx_xml_attr_quote_kind(uint32_t byte) {
  const uint8_t b = low_byte(byte);
  if (b == static_cast<uint8_t>(ISAAC_SFX_XML_ATTR_QUOTE_SINGLE_BYTE)) {
    return ISAAC_SFX_XML_ATTR_QUOTE_SINGLE;
  }
  if (b == static_cast<uint8_t>(ISAAC_SFX_XML_ATTR_QUOTE_DOUBLE_BYTE)) {
    return ISAAC_SFX_XML_ATTR_QUOTE_DOUBLE;
  }
  return ISAAC_SFX_XML_ATTR_QUOTE_NONE;
}

/* 0x4166f3..0x4166f7 `mov edx,0xb1b6e8 ; cmp byte [ecx],cl ; cmove
   edx,[0xc7de4c]` — end_byte == quote_byte (LOW BYTE) -> prev (the
   CURRENT slot: 0xb1b6e8 on the unquoted arm, the '=' gate value on the
   quoted arms), else "expected ' or \"". */
extern "C" uint32_t isaac_sfx_xml_attr_value_error(uint32_t prev_error,
                                                   uint32_t quote_byte,
                                                   uint32_t end_byte) {
  return low_byte(end_byte) == low_byte(quote_byte)
             ? prev_error
             : ISAAC_SFX_XML_ATTR_ERR_VALUE_VA;
}

/* 0x4166e6 `sub eax,esi` — value length, 32-bit wrap. */
extern "C" uint32_t isaac_sfx_xml_attr_value_len(uint32_t value_start,
                                                 uint32_t value_end) {
  return value_end - value_start;
}

/* The seven attr-node store displacements 0x00/0x04/0x08/0x0c/0x10/0x14/
   0x18. Note the attr node ALSO stores 0x08 and 0x0c (name/value lens)
   that the element init template does not. */
extern "C" int32_t isaac_sfx_xml_attr_node_writes_offset(uint32_t off) {
  switch (off) {
    case 0x00u:
    case 0x04u:
    case 0x08u:
    case 0x0cu:
    case 0x10u:
    case 0x14u:
    case 0x18u:
      return 1;
    default:
      return 0;
  }
}

extern "C" void isaac_sfx_xml_attr_plan(uint32_t prev_error,
                                        uint32_t first_byte,
                                        uint32_t name_len,
                                        uint32_t eq_byte,
                                        uint32_t quote_byte,
                                        uint32_t end_byte,
                                        uint32_t value_start,
                                        uint32_t value_end,
                                        IsaacSfxXmlAttrPlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t entered =
      isaac_sfx_xml_attr_name_char(first_byte) != 0 ? 1 : 0;
  if (entered == 0) {
    /* 0x4165b5 arm: the body returns WITHOUT reading [0xc7de4c], without
       computing any law and without allocating — every decision field
       below is "not computed"; the slot keeps its entry value. */
    out->entered = 0;
    out->name_empty = 0;
    out->name_error = prev_error;
    out->quote_kind = ISAAC_SFX_XML_ATTR_QUOTE_NONE;
    out->eq_error = prev_error;
    out->value_error = prev_error;
    out->error_slot = prev_error;
    out->value_len = 0;
    out->allocator_va = ISAAC_SFX_XML_POOL_ALLOC_VA;
    out->node_size = ISAAC_SFX_XML_ATTR_NODE_SIZE;
    out->node_stores = 0;
    out->host_calls = 0;
    out->pure_complete = 0;
    out->size_bytes = ISAAC_SFX_XML_ATTRS_SIZE_BYTES;
    out->caller_count = ISAAC_SFX_XML_ATTRS_CALLERS;
    return;
  }
  const uint32_t name_error =
      isaac_sfx_xml_attr_name_error(prev_error, name_len);
  const int32_t quote_kind = isaac_sfx_xml_attr_quote_kind(quote_byte);
  const uint32_t eq_error = isaac_sfx_xml_attr_eq_error(name_error, eq_byte);
  /* 0x4166d0 stores 0xb1b6e8 to the slot BEFORE the unquoted scan; the
     cmove at 0x4166f7 re-reads that slot, so the quoted arms keep the
     '=' gate value. */
  const uint32_t value_error =
      isaac_sfx_xml_attr_value_error(
          quote_kind == ISAAC_SFX_XML_ATTR_QUOTE_NONE
              ? static_cast<uint32_t>(ISAAC_SFX_XML_ATTR_ERR_VALUE_VA)
              : eq_error,
          quote_byte, end_byte);
  out->entered = 1;
  out->name_empty = name_len == 0u ? 1 : 0;
  out->name_error = name_error;
  out->quote_kind = quote_kind;
  out->eq_error = eq_error;
  out->value_error = value_error;
  out->error_slot = value_error;
  out->value_len =
      isaac_sfx_xml_attr_value_len(value_start, value_end);
  out->allocator_va = ISAAC_SFX_XML_POOL_ALLOC_VA;
  out->node_size = ISAAC_SFX_XML_ATTR_NODE_SIZE;
  out->node_stores = ISAAC_SFX_XML_ATTR_NODE_STORE_OFFSETS_COUNT;
  out->host_calls = 2; /* alloc + value scan */
  out->pure_complete = 0;                 /* the 3 E8 stay host */
  out->size_bytes = ISAAC_SFX_XML_ATTRS_SIZE_BYTES;
  out->caller_count = ISAAC_SFX_XML_ATTRS_CALLERS;
}

ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_pool_align4);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_pool_need_grow);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_pool_grow_request);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_pool_grow_tail);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_pool_plan);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_pool_grow_arm);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_pool_oom_slot);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_attr_name_char);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_attr_name_error);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_attr_eq_error);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_attr_quote_kind);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_attr_value_error);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_attr_value_len);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_attr_node_writes_offset);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_attr_plan);

/* ---------- v19: 0x004165a0 the attrs parse-loop DECISION LAYER ----------
   The decisions BETWEEN the v15 per-attr laws: cursor +1 arithmetic,
   link-append, NUL-in-place addresses, the once-per-loop error-slot
   capture and the per-attr continuation gate. The two ws walks, the
   name walk, the allocator and the two value scanners stay host (their
   ENDS/returns are recaptures below). All re-traced from the listing
   cpu-dump/004165a0.txt; see the header's v19 block. */

/* 0x416687..0x41668a `lea eax,[ecx+1] ; mov [ebx],eax` — ws1_end + 1,
   wrap. */
extern "C" uint32_t isaac_sfx_xml_attr_cursor_after_eq(uint32_t ws1_end) {
  return ws1_end + 1u;
}

/* 0x4166cd (unquoted) / 0x416713 (quoted) `lea esi,[ecx+1]` — ws2_end +
   1, wrap, BOTH arms. */
extern "C" uint32_t isaac_sfx_xml_attr_value_start(uint32_t ws2_end) {
  return ws2_end + 1u;
}

/* 0x4166fe..0x4166ff `inc eax ; mov [ebx],eax` — value_end + 1, wrap. */
extern "C" uint32_t isaac_sfx_xml_attr_cursor_after_value(
    uint32_t value_end) {
  return value_end + 1u;
}

/* 0x41662a `cmp dword ptr [ecx+0x20], 0 ; je` — FULL-WORD head gate. */
extern "C" int32_t isaac_sfx_xml_attr_link_first(uint32_t parent_head) {
  return parent_head == 0u ? 1 : 0;
}

/* 0x416630 / 0x41663e — node+0x14 store: head == 0 -> 0, else tail. */
extern "C" uint32_t isaac_sfx_xml_attr_link_prev(uint32_t parent_head,
                                                 uint32_t parent_tail) {
  return parent_head == 0u ? 0u : parent_tail;
}

/* 0x416639 / 0x41664e — the previous tail's +0x18 store: head == 0 -> 0
   (no tail exists), else node. */
extern "C" uint32_t isaac_sfx_xml_attr_link_tail_next(uint32_t parent_head,
                                                      uint32_t node) {
  return parent_head == 0u ? 0u : node;
}

/* 0x416645 — the parent head store: head == 0 -> node (first arm), else
   the head is untouched (append arm stores nothing). */
extern "C" uint32_t isaac_sfx_xml_attr_link_new_head(uint32_t parent_head,
                                                     uint32_t node) {
  return parent_head == 0u ? node : parent_head;
}

/* 0x41668c..0x41669e / 0x416701..0x41672c — NUL-in-place address:
   ptr != 0 (FULL-WORD) -> ptr + len (wrap), else 0xc71640 + 0 (the
   machine xors the offset on the fallback arm). Byte 0 is stored. */
extern "C" uint32_t isaac_sfx_xml_attr_nul_addr(uint32_t ptr,
                                                uint32_t len) {
  return ptr != 0u ? ptr + len
                   : static_cast<uint32_t>(ISAAC_SFX_XML_ATTR_NUL_DEFAULT_VA);
}

extern "C" void isaac_sfx_xml_attrs_iter_plan(
    uint32_t entry_slot, uint32_t first_byte, uint32_t name_start,
    uint32_t name_end, uint32_t ws1_end, uint32_t eq_byte,
    uint32_t ws2_end, uint32_t quote_byte, uint32_t value_start,
    uint32_t value_end, uint32_t end_byte, uint32_t parent_head,
    uint32_t parent_tail, uint32_t node, uint32_t name_ptr,
    uint32_t value_ptr, uint32_t cont_byte,
    IsaacSfxXmlAttrsIterPlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t entered =
      isaac_sfx_xml_attr_name_char(first_byte) != 0 ? 1 : 0;
  if (entered == 0) {
    /* 0x4165b5 arm: the body returns WITHOUT touching the cursor, the
       slot, the parent or the pool — every decision field is "not
       computed". */
    out->entered = 0;
    out->name_empty = 0;
    out->name_error = entry_slot;
    out->quote_kind = ISAAC_SFX_XML_ATTR_QUOTE_NONE;
    out->eq_error = entry_slot;
    out->value_error = entry_slot;
    out->error_slot = entry_slot;
    out->value_len = 0;
    out->cursor_after_eq = 0;
    out->value_start_pos = 0;
    out->cursor_after_value = 0;
    out->link_first = 0;
    out->node_prev = 0;
    out->tail_next = 0;
    out->new_head = 0;
    out->name_nul_addr = 0;
    out->value_nul_addr = 0;
    out->parent_off_head = ISAAC_SFX_XML_ATTR_PARENT_OFF_HEAD_20;
    out->parent_off_tail = ISAAC_SFX_XML_ATTR_PARENT_OFF_TAIL_24;
    out->node_off_parent = ISAAC_SFX_XML_ATTR_OFF_PARENT_10;
    out->node_off_prev = ISAAC_SFX_XML_ATTR_OFF_PREV_14;
    out->node_off_next = ISAAC_SFX_XML_ATTR_OFF_NEXT_18;
    out->nul_default_va = ISAAC_SFX_XML_ATTR_NUL_DEFAULT_VA;
    out->iterate = 0;
    out->node_size = ISAAC_SFX_XML_ATTR_NODE_SIZE;
    out->node_stores = 0;
    out->host_calls = 0;
    out->pure_complete = 0;
    out->size_bytes = ISAAC_SFX_XML_ATTRS_SIZE_BYTES;
    out->caller_count = ISAAC_SFX_XML_ATTRS_CALLERS;
    return;
  }
  const uint32_t name_len = name_end - name_start; /* 0x416620, wrap */
  /* The once-per-loop capture law (0x4165bb): the name-empty cmovne
     reads the ENTRY slot on EVERY iteration — the slot never
     accumulates, so prev here is entry_slot, NOT a previous iteration's
     result. */
  const uint32_t name_error =
      isaac_sfx_xml_attr_name_error(entry_slot, name_len);
  const int32_t quote_kind = isaac_sfx_xml_attr_quote_kind(quote_byte);
  /* The '=' gate re-reads the slot JUST stored (the name value). */
  const uint32_t eq_error =
      isaac_sfx_xml_attr_eq_error(name_error, eq_byte);
  /* The value-close reads the CURRENT slot: 0xb1b6e8 pre-stored on the
     unquoted arm (0x4166d0), the '=' gate value on the quoted arms
     (clean-scan bound). */
  const uint32_t value_error = isaac_sfx_xml_attr_value_error(
      quote_kind == ISAAC_SFX_XML_ATTR_QUOTE_NONE
          ? static_cast<uint32_t>(ISAAC_SFX_XML_ATTR_ERR_VALUE_VA)
          : eq_error,
      quote_byte, end_byte);
  const uint32_t value_len =
      isaac_sfx_xml_attr_value_len(value_start, value_end);
  out->entered = 1;
  out->name_empty = name_len == 0u ? 1 : 0;
  out->name_error = name_error;
  out->quote_kind = quote_kind;
  out->eq_error = eq_error;
  out->value_error = value_error;
  out->error_slot = value_error; /* the 4th slot write (0x416704) */
  out->value_len = value_len;
  out->cursor_after_eq =
      isaac_sfx_xml_attr_cursor_after_eq(ws1_end);
  out->value_start_pos = isaac_sfx_xml_attr_value_start(ws2_end);
  out->cursor_after_value =
      isaac_sfx_xml_attr_cursor_after_value(value_end);
  out->link_first = isaac_sfx_xml_attr_link_first(parent_head);
  out->node_prev =
      isaac_sfx_xml_attr_link_prev(parent_head, parent_tail);
  out->tail_next =
      isaac_sfx_xml_attr_link_tail_next(parent_head, node);
  out->new_head = isaac_sfx_xml_attr_link_new_head(parent_head, node);
  out->name_nul_addr = isaac_sfx_xml_attr_nul_addr(name_ptr, name_len);
  out->value_nul_addr = isaac_sfx_xml_attr_nul_addr(value_ptr,
                                                     value_len);
  out->parent_off_head = ISAAC_SFX_XML_ATTR_PARENT_OFF_HEAD_20;
  out->parent_off_tail = ISAAC_SFX_XML_ATTR_PARENT_OFF_TAIL_24;
  out->node_off_parent = ISAAC_SFX_XML_ATTR_OFF_PARENT_10;
  out->node_off_prev = ISAAC_SFX_XML_ATTR_OFF_PREV_14;
  out->node_off_next = ISAAC_SFX_XML_ATTR_OFF_NEXT_18;
  out->nul_default_va = ISAAC_SFX_XML_ATTR_NUL_DEFAULT_VA;
  out->iterate = isaac_sfx_xml_attr_name_char(cont_byte) != 0 ? 1 : 0;
  out->node_size = ISAAC_SFX_XML_ATTR_NODE_SIZE;
  out->node_stores = ISAAC_SFX_XML_ATTR_NODE_STORE_OFFSETS_COUNT;
  out->host_calls = 2; /* alloc + value scan */
  out->pure_complete = 0;                 /* the 3 E8 stay host */
  out->size_bytes = ISAAC_SFX_XML_ATTRS_SIZE_BYTES;
  out->caller_count = ISAAC_SFX_XML_ATTRS_CALLERS;
}

ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_attr_cursor_after_eq);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_attr_value_start);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_attr_cursor_after_value);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_attr_link_first);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_attr_link_prev);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_attr_link_tail_next);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_attr_link_new_head);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_attr_nul_addr);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_attrs_iter_plan);

ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_cmp_common_len);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_cmp_length_tie);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_cmp4_three_way);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_ogg_suffix_compare);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_ogg_suffix_match);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_load_stream_byte_from_tail);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_suffix_compare_plan);
/* ---------- v16: 0x00416770 the children parse ---------- */

/* 0x4167a2..0x4167a8 `test al,al ; je 0x4167ef ; cmp al,0x3c ; jne
   0x4167f9` — the top-of-loop byte gate, LOW BYTE (al was loaded from
   the cursor): 0 -> END (the 0xb1b678 slot store), '<' -> TAG, else
   TEXT. */
extern "C" int32_t isaac_sfx_xml_children_top_gate(uint32_t byte) {
  const uint8_t b = low_byte(byte);
  if (b == 0u) {
    return ISAAC_SFX_XML_CHILDREN_TOP_END;
  }
  if (b == static_cast<uint8_t>('<')) {
    return ISAAC_SFX_XML_CHILDREN_TOP_TAG;
  }
  return ISAAC_SFX_XML_CHILDREN_TOP_TEXT;
}

/* 0x4167ac `cmp byte [ecx + 1], 0x2f ; je 0x4168af` — the close-tag
   gate on the TAG arm, LOW BYTE. */
extern "C" int32_t isaac_sfx_xml_children_close_open(uint32_t byte) {
  return low_byte(byte) ==
                 static_cast<uint8_t>(ISAAC_SFX_XML_CHILDREN_CLOSE_OPEN_BYTE)
             ? 1
             : 0;
}

/* 0x4167c6 `test ecx,ecx ; je 0x416780` — the nested-parse RETURN gate,
   FULL-WORD: node == 0 continues the loop WITHOUT linking. */
extern "C" int32_t isaac_sfx_xml_children_nested_live(uint32_t node) {
  return node != 0u ? 1 : 0;
}

/* 0x4167ca / 0x416841 `cmp dword ptr [esi + 0x18], 0 ; je FIRST` —
   FULL-WORD children head: 0 -> the first-child arm. Shared by the
   element link and the text link. */
extern "C" int32_t isaac_sfx_xml_children_link_first(uint32_t children_head) {
  return children_head == 0u ? 1 : 0;
}

/* 0x4167d7 / 0x416855 — the node+0x28 (prev sibling) store value: the
   FIRST arm stores the constant 0, the append arm stores [esi+0x1c]
   (parent->last, re-read at 0x4167da). */
extern "C" uint32_t isaac_sfx_xml_children_link_prev(uint32_t children_head,
                                                     uint32_t last_child) {
  return children_head == 0u ? 0u : last_child;
}

/* 0x416817 `sub edx, ebx` — text_len = text_end - text_start, 32-bit
   wrap. */
extern "C" uint32_t isaac_sfx_xml_children_text_len(uint32_t text_start,
                                                    uint32_t text_end) {
  return text_end - text_start;
}

/* 0x41686c..0x416881 `mov ecx,0xc71640 ; mov eax,[esi+4] ; test eax,eax ;
   cmovne ecx,eax ; cmp byte [ecx],0 ; jne skip` — store the text span
   iff parent->text != 0 (FULL-WORD) AND *parent->text == 0 (LOW BYTE).
   With parent_text == 0 the machine tests byte[0xc71640] == 0xed, so
   the default arm NEVER stores. */
extern "C" int32_t isaac_sfx_xml_children_text_accum(uint32_t parent_text,
                                                     uint32_t first_byte) {
  if (parent_text == 0u) {
    return 0;
  }
  return low_byte(first_byte) == 0u ? 1 : 0;
}

/* The TEXT-arm node ctor store displacements: {0x00,0x04,0x0c,0x10,0x14,
   0x18,0x20,0x28,0x2c} (0x416819..0x416865). */
extern "C" int32_t isaac_sfx_xml_children_text_node_writes_offset(
    uint32_t off) {
  switch (off) {
    case 0x00u:
    case 0x04u:
    case 0x0cu:
    case 0x10u:
    case 0x14u:
    case 0x18u:
    case 0x20u:
    case 0x28u:
    case 0x2cu:
      return 1;
    default:
      return 0;
  }
}

/* The per-arm cursor continuation: END/TEXT leave *cursor at the scanner
   end; TAG element stores cursor+1 (0x4167bd); TAG close stores
   name_end+1 (0x416904). 32-bit wrap. */
extern "C" uint32_t isaac_sfx_xml_children_cursor_after(uint32_t top_gate,
                                                        uint32_t close_open,
                                                        uint32_t tag_pos,
                                                        uint32_t text_end,
                                                        uint32_t name_end) {
  if (top_gate == static_cast<uint32_t>(ISAAC_SFX_XML_CHILDREN_TOP_TAG)) {
    return close_open != 0u ? name_end + 1u : tag_pos + 1u;
  }
  return text_end;
}

extern "C" void isaac_sfx_xml_children_plan(
    uint32_t top_byte, uint32_t close_byte, uint32_t tag_pos,
    uint32_t nested_node, uint32_t children_head, uint32_t last_child,
    uint32_t text_start, uint32_t text_end, uint32_t parent_text,
    uint32_t text_first_byte, uint32_t name_end, uint32_t close_tail_byte,
    uint32_t prev_error, IsaacSfxXmlChildrenPlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t top = isaac_sfx_xml_children_top_gate(top_byte);
  const int32_t tag = top == ISAAC_SFX_XML_CHILDREN_TOP_TAG ? 1 : 0;
  /* END falls through into the TEXT arm (0x4167ef -> 0x4167f9): both run
     the scanner, the allocator, the ctor, the link and the accum law. */
  const int32_t text_arm = tag == 0 ? 1 : 0;
  const int32_t close = tag != 0
                            ? isaac_sfx_xml_children_close_open(close_byte)
                            : 0;
  const int32_t recurses = (tag != 0 && close == 0) ? 1 : 0;
  const int32_t live = recurses != 0
                           ? isaac_sfx_xml_children_nested_live(nested_node)
                           : (text_arm != 0 ? 1 : 0);
  const int32_t link = (text_arm != 0 || recurses != 0) ? live : 0;
  out->top_gate = top;
  out->end_error = top == ISAAC_SFX_XML_CHILDREN_TOP_END
                       ? static_cast<uint32_t>(ISAAC_SFX_XML_CHILDREN_ERR_END_VA)
                       : prev_error;
  out->close_open = close;
  out->nested_recurses = recurses;
  out->nested_live = live;
  out->link_needed = link;
  out->link_first =
      link != 0 ? isaac_sfx_xml_children_link_first(children_head) : 0;
  out->link_prev =
      link != 0 ? isaac_sfx_xml_children_link_prev(children_head,
                                                   last_child)
                : 0u;
  out->text_len = text_arm != 0
                      ? isaac_sfx_xml_children_text_len(text_start, text_end)
                      : 0u;
  out->text_type =
      text_arm != 0 ? static_cast<uint32_t>(ISAAC_SFX_XML_CHILDREN_TEXT_TYPE)
                    : 0u;
  out->text_accum = text_arm != 0
                        ? isaac_sfx_xml_children_text_accum(parent_text,
                                                            text_first_byte)
                        : 0;
  out->cursor_undo = text_arm; /* 0x4167fb restores *cursor = ebx */
  out->close_error =
      close != 0 ? isaac_sfx_xml_nested_parse_tail_error(prev_error,
                                                         close_tail_byte)
                 : prev_error;
  out->cursor_after = isaac_sfx_xml_children_cursor_after(
      static_cast<uint32_t>(top), static_cast<uint32_t>(close), tag_pos,
      text_end, name_end);
  out->nested_va = ISAAC_SFX_XML_CHILDREN_NESTED_VA;
  out->scanner_va = ISAAC_SFX_XML_CHILDREN_SCANNER_VA;
  out->allocator_va = ISAAC_SFX_XML_CHILDREN_ALLOC_VA;
  out->host_calls = close != 0 ? 0 : (text_arm != 0 ? 2 : 1);
  out->pure_complete = 0; /* the 3 E8 stay host */
  out->size_bytes = ISAAC_SFX_XML_CHILDREN_SIZE_BYTES;
  out->insns = ISAAC_SFX_XML_CHILDREN_INSNS;
  out->stores = ISAAC_SFX_XML_CHILDREN_STORES;
  out->caller_count = ISAAC_SFX_XML_CHILDREN_CALLERS;
}

ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_children_top_gate);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_children_close_open);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_children_nested_live);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_children_link_first);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_children_link_prev);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_children_text_len);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_children_text_accum);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_children_text_node_writes_offset);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_children_cursor_after);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_children_plan);

/* ---------- v17: 0x00416e80 the text scanner ---------- */

/* 0x416e8b..0x416eac `movzx eax, byte[esi] ; cmp byte[eax+0xb1a760],0 ;
   je done ; loop: movzx eax, byte[esi+1] ; inc esi ; cmp
   byte[eax+0xb1a760],0 ; jne loop` — the ENTRY skip-until-special gate
   (table 0xb1a760, LOW BYTE): 1 for plain text (the walk advances), 0
   at the specials {NUL, '&', '<'}. */
extern "C" int32_t isaac_sfx_xml_scan_skip_char(uint32_t byte) {
  const uint8_t b = low_byte(byte);
  if (b == static_cast<uint8_t>(ISAAC_SFX_XML_SCAN_AMP_BYTE) ||
      b == static_cast<uint8_t>('<')) {
    return 0;
  }
  return b == 0u ? 0 : 1;
}

/* 0x416eba / 0x417044 `cmp byte[eax+0xb1aa60],0` — the TEXT-continue
   gate (table 0xb1aa60, LOW BYTE): 1 for text INCLUDING '&' and '>',
   0 at {NUL, '<'} (the scan's end-of-text boundary). */
extern "C" int32_t isaac_sfx_xml_scan_text_char(uint32_t byte) {
  const uint8_t b = low_byte(byte);
  return (b == 0u || b == static_cast<uint8_t>('<')) ? 0 : 1;
}

/* 0x416fcc / 0x416ff4 `mov al, byte[eax+0xb1ad60] ; cmp al,0xff ; je` —
   the digit nibble (table 0xb1ad60): '0'..'9' -> 0..9, 'A'..'F' and
   'a'..'f' -> 10..15, else 0xff = "not a digit". Gates BOTH numeric
   paths. */
extern "C" uint32_t isaac_sfx_xml_scan_hex_nibble(uint32_t byte) {
  const uint8_t b = low_byte(byte);
  if (b >= static_cast<uint8_t>('0') && b <= static_cast<uint8_t>('9')) {
    return static_cast<uint32_t>(b - '0');
  }
  if (b >= static_cast<uint8_t>('A') && b <= static_cast<uint8_t>('F')) {
    return static_cast<uint32_t>(b - 'A' + 10);
  }
  if (b >= static_cast<uint8_t>('a') && b <= static_cast<uint8_t>('f')) {
    return static_cast<uint32_t>(b - 'a' + 10);
  }
  return 0xffu;
}

/* 0x416ed0..0x416ee7 `movsx eax, byte[esi+1] ; add eax,-0x23 ; cmp
   eax,0x4e ; ja default ; movzx eax, byte[eax+0x417074] ; jmp
   [eax*4+0x41705c]` — the entity dispatch: (int8)b - 0x23 inside the
   UNSIGNED window [0,0x4e] -> case table 0x417074 ('#', 'a', 'g', 'l',
   'q' special, in-window rest CASE_NONE); out of window CASE_NONE. */
extern "C" int32_t isaac_sfx_xml_scan_entity_case(uint32_t byte) {
  const int32_t s = static_cast<int8_t>(low_byte(byte)); /* movsx */
  const uint32_t idx = static_cast<uint32_t>(
      s - static_cast<int32_t>(ISAAC_SFX_XML_SCAN_DISPATCH_RANGE_LO));
  if (idx > ISAAC_SFX_XML_SCAN_DISPATCH_RANGE_HI) {
    return ISAAC_SFX_XML_SCAN_CASE_NONE;
  }
  switch (s) {
    case 0x23: /* '#' */
      return ISAAC_SFX_XML_SCAN_CASE_NUM;
    case 0x61: /* 'a' */
      return ISAAC_SFX_XML_SCAN_CASE_AMP;
    case 0x67: /* 'g' */
      return ISAAC_SFX_XML_SCAN_CASE_GT;
    case 0x6c: /* 'l' */
      return ISAAC_SFX_XML_SCAN_CASE_LT;
    case 0x71: /* 'q' */
      return ISAAC_SFX_XML_SCAN_CASE_QUOT;
    default:
      return ISAAC_SFX_XML_SCAN_CASE_NONE;
  }
}

/* 0x416eee..0x416f76 — the named full-match laws, packed (skip<<8)|
   emit, 0 = no match (the literal '&' arm). The a-case COMMITS: 'm'
   is tested FIRST (0x416ef1) and a later mismatch never retries
   "apos;". All compares LOW BYTE. */
extern "C" uint32_t isaac_sfx_xml_scan_named_entity(uint32_t case_id,
                                                    uint32_t b2,
                                                    uint32_t b3,
                                                    uint32_t b4,
                                                    uint32_t b5) {
  const uint8_t c2 = low_byte(b2);
  const uint8_t c3 = low_byte(b3);
  const uint8_t c4 = low_byte(b4);
  const uint8_t c5 = low_byte(b5);
  switch (case_id) {
    case ISAAC_SFX_XML_SCAN_CASE_AMP:
      if (c2 == static_cast<uint8_t>('m')) {
        return (c3 == static_cast<uint8_t>('p') &&
                c4 == static_cast<uint8_t>(ISAAC_SFX_XML_SCAN_SEMI_BYTE))
                   ? (ISAAC_SFX_XML_SCAN_AMP_SKIP << 8) |
                         ISAAC_SFX_XML_SCAN_AMP_EMIT
                   : 0u;
      }
      return (c2 == static_cast<uint8_t>('p') &&
              c3 == static_cast<uint8_t>('o') &&
              c4 == static_cast<uint8_t>('s') &&
              c5 == static_cast<uint8_t>(ISAAC_SFX_XML_SCAN_SEMI_BYTE))
                 ? (ISAAC_SFX_XML_SCAN_APOS_SKIP << 8) |
                       ISAAC_SFX_XML_SCAN_APOS_EMIT
                 : 0u;
    case ISAAC_SFX_XML_SCAN_CASE_GT:
      return (c2 == static_cast<uint8_t>('t') &&
              c3 == static_cast<uint8_t>(ISAAC_SFX_XML_SCAN_SEMI_BYTE))
                 ? (ISAAC_SFX_XML_SCAN_GT_SKIP << 8) |
                       ISAAC_SFX_XML_SCAN_GT_EMIT
                 : 0u;
    case ISAAC_SFX_XML_SCAN_CASE_LT:
      return (c2 == static_cast<uint8_t>('t') &&
              c3 == static_cast<uint8_t>(ISAAC_SFX_XML_SCAN_SEMI_BYTE))
                 ? (ISAAC_SFX_XML_SCAN_LT_SKIP << 8) |
                       ISAAC_SFX_XML_SCAN_LT_EMIT
                 : 0u;
    case ISAAC_SFX_XML_SCAN_CASE_QUOT:
      return (c2 == static_cast<uint8_t>('u') &&
              c3 == static_cast<uint8_t>('o') &&
              c4 == static_cast<uint8_t>('t') &&
              c5 == static_cast<uint8_t>(ISAAC_SFX_XML_SCAN_SEMI_BYTE))
                 ? (ISAAC_SFX_XML_SCAN_QUOT_SKIP << 8) |
                       ISAAC_SFX_XML_SCAN_QUOT_EMIT
                 : 0u;
    default:
      return 0u;
  }
}

/* 0x416fda / 0x417007 — per-digit fold, 32-bit wrap: hex `shl edx,4 ;
   add edx,eax` -> (value<<4)+nibble; decimal `lea ecx,[edx+edx*4] ;
   lea edx,[eax+ecx*2]` -> value*10+nibble. */
extern "C" uint32_t isaac_sfx_xml_scan_num_value(uint32_t value,
                                                 uint32_t nibble,
                                                 uint32_t is_hex) {
  if (is_hex != 0u) {
    return (value << 4) + nibble;
  }
  return value * 10u + nibble;
}

/* 0x41701f..0x417034 `cmp byte[esi],0x3b ; jne err ; inc esi ;
   mov [0xc7de4c],0xb1b6f8` — the numeric ';' law, LOW BYTE: ';' ->
   prev_error (slot KEPT, cursor advances); else -> 0xb1b6f8
   (UNCONDITIONAL store of the "expected ;" constant, cursor NOT
   advanced). */
extern "C" uint32_t isaac_sfx_xml_scan_num_error(uint32_t prev_error,
                                                 uint32_t byte) {
  return low_byte(byte) ==
                 static_cast<uint8_t>(ISAAC_SFX_XML_SCAN_SEMI_BYTE)
             ? prev_error
             : static_cast<uint32_t>(ISAAC_SFX_XML_SCAN_ERR_SEMI_VA);
}

/* 0x417051 `mov [edi], esi` — the *cursor write = READ pos at exit =
   start + skip_len + consumed, 32-bit wrap. */
extern "C" uint32_t isaac_sfx_xml_scan_cursor_after(uint32_t start,
                                                    uint32_t skip_len,
                                                    uint32_t consumed) {
  return start + skip_len + consumed;
}

/* 0x417053 `mov eax, edx` — the RETURN = OUT pos at exit = start +
   skip_len + written, 32-bit wrap (the children TEXT arm's text_len
   end; differs from the cursor exactly when entities shrink). */
extern "C" uint32_t isaac_sfx_xml_scan_end_pos(uint32_t start,
                                               uint32_t skip_len,
                                               uint32_t written) {
  return start + skip_len + written;
}

ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_scan_skip_char);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_scan_text_char);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_scan_hex_nibble);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_scan_entity_case);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_scan_named_entity);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_scan_num_value);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_scan_num_error);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_scan_cursor_after);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_scan_end_pos);

/* ---------- v18: 0x00416dc0 the utf8-append helper ---------- */

/* 0x416dc3..0x416e2a `cmp edx,0x80 ; jae ... ; cmp edx,0x800 ; jae ... ;
   cmp edx,0x10000 ; jae ... ; cmp edx,0x110000 ; jae error` — the
   length ladder, ALL UNSIGNED: 1 / 2 / 3 / 4 bytes, 0 = the error arm
   (v >= 0x110000 -> NO write, *out NOT advanced). */
extern "C" uint32_t isaac_sfx_xml_utf8_len(uint32_t value) {
  if (value < ISAAC_SFX_XML_UTF8_L1) {
    return 1u;
  }
  if (value < ISAAC_SFX_XML_UTF8_L2) {
    return 2u;
  }
  if (value < ISAAC_SFX_XML_UTF8_L3) {
    return 3u;
  }
  return value < ISAAC_SFX_XML_UTF8_MAX ? 4u : 0u;
}

/* 0x416dcb..0x416e5a — the per-index byte of the encoding for `value`.
   Continuation bytes: `al = x ; and al,0x3f ; or al,0x80`. Lead bytes:
   `dl |= 0xc0/0xe0/0xf0` where dl = LOW BYTE of the FULL 32-bit shr
   (x = v >> 6/12/18). Index >= len (or value >= 0x110000) ->
   ISAAC_SFX_XML_UTF8_NO_BYTE: the machine writes nothing there. */
extern "C" uint32_t isaac_sfx_xml_utf8_byte(uint32_t value,
                                            uint32_t index) {
  const uint32_t len = isaac_sfx_xml_utf8_len(value);
  if (index >= len) {
    return ISAAC_SFX_XML_UTF8_NO_BYTE;
  }
  if (len == 1u) {
    return value & 0xffu; /* mov [eax], dl */
  }
  if (len == 2u) {
    if (index == 0u) {
      return ISAAC_SFX_XML_UTF8_LEAD_L2 | ((value >> 6) & 0xffu);
    }
    return ISAAC_SFX_XML_UTF8_CONT | (value & ISAAC_SFX_XML_UTF8_CONT_MASK);
  }
  if (len == 3u) {
    switch (index) {
      case 0u:
        return ISAAC_SFX_XML_UTF8_LEAD_L3 | ((value >> 12) & 0xffu);
      case 1u:
        return ISAAC_SFX_XML_UTF8_CONT |
               ((value >> 6) & ISAAC_SFX_XML_UTF8_CONT_MASK);
      default:
        return ISAAC_SFX_XML_UTF8_CONT |
               (value & ISAAC_SFX_XML_UTF8_CONT_MASK);
    }
  }
  switch (index) {
    case 0u:
      return ISAAC_SFX_XML_UTF8_LEAD_L4 | ((value >> 18) & 0xffu);
    case 1u:
      return ISAAC_SFX_XML_UTF8_CONT |
             ((value >> 12) & ISAAC_SFX_XML_UTF8_CONT_MASK);
    case 2u:
      return ISAAC_SFX_XML_UTF8_CONT |
             ((value >> 6) & ISAAC_SFX_XML_UTF8_CONT_MASK);
    default:
      return ISAAC_SFX_XML_UTF8_CONT |
             (value & ISAAC_SFX_XML_UTF8_CONT_MASK);
  }
}

/* 0x416e5e `mov dword ptr [0xc7de4c], 0xb1b704` — the error-slot law:
   v < 0x110000 keeps prev_error; else the slot is UNCONDITIONALLY
   written with 0xb1b704 ("invalid numeric character entity") and the
   helper wrote NO bytes. */
extern "C" uint32_t isaac_sfx_xml_utf8_error(uint32_t prev_error,
                                             uint32_t value) {
  return value < ISAAC_SFX_XML_UTF8_MAX
             ? prev_error
             : static_cast<uint32_t>(ISAAC_SFX_XML_UTF8_ERR_VA);
}

/* 0x416b7b..0x416b9c `movzx eax, byte[esi] ; cmp byte[eax+0xb1a860],0 ;
   je done ; loop: movzx eax, byte[esi+1] ; inc esi ; cmp
   byte[eax+0xb1a860],0 ; jne loop` — the dquote attrs VALUE entry
   skip-until-special gate (table 0xb1a860, LOW BYTE): 1 for plain
   value bytes, 0 at {NUL, '"', '&'}. */
extern "C" int32_t isaac_sfx_xml_attr_dquote_skip_char(uint32_t byte) {
  const uint8_t b = low_byte(byte);
  if (b == static_cast<uint8_t>('"') ||
      b == static_cast<uint8_t>(ISAAC_SFX_XML_SCAN_AMP_BYTE)) {
    return 0;
  }
  return b == 0u ? 0 : 1;
}

/* 0x416baa / 0x416d34 `cmp byte[eax+0xb1ab60],0` — the dquote attrs
   value TEXT-continue gate (table 0xb1ab60, LOW BYTE): 1 for value
   bytes INCLUDING '&', 0 at {NUL, '"'}. */
extern "C" int32_t isaac_sfx_xml_attr_dquote_text_char(uint32_t byte) {
  const uint8_t b = low_byte(byte);
  return (b == 0u || b == static_cast<uint8_t>('"')) ? 0 : 1;
}

/* 0x41692e..0x41694d `cmp byte[eax+0xb1a960],0` — the squote attrs
   value ENTRY skip-until-special gate (table 0xb1a960, LOW BYTE): 1
   for plain value bytes, 0 at {NUL, '&', '\''}. */
extern "C" int32_t isaac_sfx_xml_attr_squote_skip_char(uint32_t byte) {
  const uint8_t b = low_byte(byte);
  if (b == static_cast<uint8_t>('\'') ||
      b == static_cast<uint8_t>(ISAAC_SFX_XML_SCAN_AMP_BYTE)) {
    return 0;
  }
  return b == 0u ? 0 : 1;
}

/* 0x41695a / 0x416ae4 `cmp byte[eax+0xb1ac60],0` — the squote attrs
   value TEXT-continue gate (table 0xb1ac60, LOW BYTE): 1 for value
   bytes INCLUDING '&', 0 at {NUL, '\''}. */
extern "C" int32_t isaac_sfx_xml_attr_squote_text_char(uint32_t byte) {
  const uint8_t b = low_byte(byte);
  return (b == 0u || b == static_cast<uint8_t>('\'')) ? 0 : 1;
}

ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_utf8_len);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_utf8_byte);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_utf8_error);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_attr_dquote_skip_char);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_attr_dquote_text_char);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_attr_squote_skip_char);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_attr_squote_text_char);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_redirect_probe_start);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_redirect_probe_next);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_redirect_probe_cap);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_redirect_probe_match);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_redirect_probe_step);

/* v24: string/alloc/vector growth + file-open gates. */
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_string_assign_grow);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_string_assign_sso);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_string_grow_len_ok);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_string_grow_cap);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_string_build_total);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_string_build_sso);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_string_build_cap);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_grow_alloc_fast);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_grow_alloc_zero);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_grow_alloc_big_plan);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_grow_alloc_align);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_vec_cap_gate);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_vec_push_grow_new);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_vec_reserve_grow_new);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_vec_cap_overflow);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_vec_count_max);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_string_copy_sso);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_string_copy_cap);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_file_open_path_gate);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_file_open_flag_gate);

/* ---------- v25f: 0xa178d0 file-open POST-GATE decision body + the
   0x92d140 call-site arg-prep (wave-16; NO ABI bump — the coordinator
   merges). v24 landed laws 19/20 (path NULL/empty + result flag) and v9
   landed the 0x92d1af open-result gate (isaac_sfx_table_open_gate). This
   block lands the REMAINING path-selection/result-test islands of the
   open body: the attempt-#2 retry gate (0xa1792a), the arg2 OUT-store
   gate (0xa1793d/0xa17951), the esi ALLOC-arm gate (0xa17941/0xa17955),
   the SEH guard select (0xa17945 vs 0xa17959) and the call-site arg
   prep pins (0x92d190 this=0xc37a10, 0x92d195 arg2=0). Callee bodies
   (0xa17180 build, 0xa17f40/0xa17ea0 attempts, 0xa648b0 alloc) stay HOST. */

/* 0xa1792a `cmp dword ptr [ebp+8],0 ; jne 0xa1794e` — FULL-WORD result
   slot test: attempt #2 (0xa17ea0) runs iff the slot is ZERO. A low-byte
   test would wrongly retry on 0x100. Complement of the v24 flag gate. */
extern "C" int32_t isaac_sfx_file_open_retry_gate(uint32_t result1) {
  return result1 == 0u ? 1 : 0;
}

/* 0xa1793d / 0xa17951 `test [ebp+0xc],eax ; jne 0xa17982` — FULL-WORD
   arg2 test: arg2 != 0 stores the handle (*arg2 = esi at 0xa17982). */
extern "C" int32_t isaac_sfx_file_open_out_gate(uint32_t arg2) {
  return arg2 != 0u ? 1 : 0;
}

/* 0xa17941 / 0xa17955 `test esi,esi ; je 0xa17984` — FULL-WORD handle
   test: the guard write + the 0xa648b0 alloc arm are reached only when
   the handle is non-zero. */
extern "C" int32_t isaac_sfx_file_open_alloc_gate(uint32_t handle) {
  return handle != 0u ? 1 : 0;
}

/* 0xa17945 writes 1 (attempt-#2-skipped arm) / 0xa17959 writes eax==0
   (retry arm); the out-store and esi==0 tails leave the SEH state at
   its initial -1 (NONE). arg2 and handle are FULL-WORD tests. */
extern "C" uint32_t isaac_sfx_file_open_guard_select(uint32_t result1,
                                                     uint32_t arg2,
                                                     uint32_t handle) {
  if (arg2 != 0u || handle == 0u) {
    return ISAAC_SFX_OPEN_GUARD_NONE;
  }
  return result1 != 0u ? static_cast<uint32_t>(ISAAC_SFX_OPEN_GUARD_SKIP)
                       : static_cast<uint32_t>(ISAAC_SFX_OPEN_GUARD_RETRY);
}

/* 0x92d195 `push 0` — the open call's arg2 prep (NULL out-ptr). */
extern "C" int32_t isaac_sfx_open_call_arg2(void) {
  return ISAAC_SFX_OPEN_CALL_ARG2;
}

/* 0x92d190 `mov ecx,0xc37a10` — the open call's this prep. */
extern "C" int32_t isaac_sfx_open_call_this(void) {
  return static_cast<int32_t>(ISAAC_SFX_OPEN_CALL_THIS_C37A10);
}

ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_file_open_retry_gate, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_file_open_out_gate, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_file_open_alloc_gate, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_file_open_guard_select, 3);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_open_call_arg2, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_open_call_this, 0);

ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_file_open_retry_gate);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_file_open_out_gate);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_file_open_alloc_gate);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_file_open_guard_select);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_open_call_arg2);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_open_call_this);

/* ============================ v25a: 0x92d93a..0x92d984 "path" dispatch
 * arm caller-side (wave-16, NO ABI bump — coordinator merges).
 *
 * The frame's own tag-dispatch decision islands NOT covered by v5/v9/v21/
 * v24: the "path" attr arm of the per-sample slot walk (FIRST arm, slot
 * site; constant "path" 0xb66e0c). v5 landed the arm/strcmp/action law,
 * v24 the CONCAT CALLEE growth math (0x421680); this body is the caller
 * side standing between them: the value-length scan prep, the concat
 * TOTAL gate 0x92d963 `cmp eax,ecx ; jb 0x92dbca` (UNSIGNED, wrap limit
 * 0x7fffffff-root_len, throw 0x40ccc0), the cmovae root-buffer select
 * 0x92d96b (`cmp cap,0x10 ; lea eax,SSO ; cmovae eax,[heap]` — UNSIGNED,
 * boundary 0x10 picks the heap), and the concat-call flag. All FULL-WORD. */

extern "C" uint32_t isaac_sfx_sample_path_limit(uint32_t root_len) {
  /* 0x92d959 mov eax,0x7fffffff ; 0x92d961 sub eax,esi — 32-bit wrap. */
  return ISAAC_SFX_STRING_CAP_CLAMP - root_len;
}

extern "C" int32_t isaac_sfx_sample_path_overflow(uint32_t root_len,
                                                  uint32_t value_len) {
  /* 0x92d963 cmp eax,ecx ; jb 0x92dbca — UNSIGNED: value_len > limit
     (the strict jb; a jbe mutant flips the equality row). */
  return (ISAAC_SFX_STRING_CAP_CLAMP - root_len) < value_len ? 1 : 0;
}

extern "C" uint32_t isaac_sfx_sample_path_root_buf(uint32_t root_cap,
                                                   uint32_t sso_ptr,
                                                   uint32_t heap_ptr) {
  /* 0x92d96b cmp [ebp-0x18],0x10 ; lea eax,[ebp-0x2c] ;
     cmovae eax,[ebp-0x2c] — UNSIGNED; the boundary 0x10 picks the HEAP
     (cmovae, not cmova; a low-byte read flips 0x100). */
  return root_cap >= ISAAC_SFX_SAMPLE_PATH_SSO_LIMIT ? heap_ptr : sso_ptr;
}

extern "C" void isaac_sfx_sample_path_plan(
    uint32_t root_len, uint32_t root_cap, uint32_t root_sso,
    uint32_t root_heap, uint32_t value_null, uint32_t value_ptr,
    uint32_t value_max, uint32_t throw_va, IsaacSfxSamplePathPlan* out) {
  if (out == nullptr) {
    return;
  }
  /* 0x92d93d..0x92d942 mov edx,EMPTY ; test eax,eax ; cmovne edx,eax —
     FULL-WORD null test, then 0x92d947..0x92d957 strlen scan. */
  const uint32_t value_len = static_cast<uint32_t>(
      attr_strlen_impl(value_null != 0u ? 1 : 0,
                       value_null != 0u ? 0 : static_cast<int32_t>(value_ptr),
                       static_cast<int32_t>(value_max)));
  const uint32_t limit = ISAAC_SFX_STRING_CAP_CLAMP - root_len;
  /* 0x92d963 jb — UNSIGNED strict. */
  const int32_t overflow = limit < value_len ? 1 : 0;
  /* 0x92d96b..0x92d973 cmovae — UNSIGNED, boundary 0x10 -> heap. */
  const uint32_t root_buf = root_cap >= ISAAC_SFX_SAMPLE_PATH_SSO_LIMIT
                                ? root_heap
                                : root_sso;
  out->value_len = static_cast<int32_t>(value_len);
  out->limit = limit;
  out->overflow = overflow;
  out->root_buf = root_buf;
  /* 0x92d984 call 0x421680 runs iff no overflow; 0x92d989 or-flag. */
  out->concat_called = overflow == 0 ? 1 : 0;
  out->throw_va = overflow != 0 ? throw_va : 0u;
  out->host_calls = overflow != 0 ? 1 : 1; /* concat OR throw, always host */
  out->pure_complete = 0;
}

ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_sample_path_limit);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_sample_path_overflow);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_sample_path_root_buf);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_sample_path_plan);

/* ============================ v25c: 0x00416e80 numeric/amp entity scan
 * gates (wave-16, banner v25c, NO ABI bump — coordinator merges).
 *
 * The LAST decision islands of the text scanner's CASE 0 ('#') numeric
 * entity arm and the amp named-entity consumption: v17 landed the
 * per-byte gates/dispatch/named-match/fold/';'/position laws; this body
 * is the run WALK layer between them — the hex/decimal path select
 * (0x416fc0 `cmp cl,0x78 ; jne dec`), the digit-run entry arithmetic
 * (0x416fc5 add esi,3 / 0x416ff1 add esi,2), the run gate (0x416fd2 /
 * 0x416ffa / 0x416fe8 / 0x417013 `cmp al,0xff`), the digit-run fold walk
 * (hex shl4 / decimal *10, 32-bit wrap, one esi advance per consumed
 * digit), the read-pos offset at the utf8/';' point (= entry + run_len),
 * and the amp commit/literal consume/emit split (skip = packed>>8 with
 * 0 -> 1; emit = packed&0xff with 0 -> 0x26). The utf8-append call
 * 0x416dc0 and the walks' memory reads stay HOST; the scanner boundary
 * stays (this unit narrows it to removal-ready). */

/* 0x416fc0 `cmp cl,0x78 ; jne 0x416fee` — LOW-BYTE 'x' test: hex path
   (first digit at '&'+3) vs decimal path (first digit = the byte at
   '&'+2). A FULL-WORD test would misroute 0x178/0x10000078. */
extern "C" int32_t isaac_sfx_xml_scan_num_hex_path(uint32_t cl) {
  return low_byte(cl) ==
                 static_cast<uint8_t>(ISAAC_SFX_XML_SCAN_NUM_X_BYTE)
             ? 1
             : 0;
}

/* 0x416fc5 `add esi,3` (hex) / 0x416ff1 `add esi,2` (decimal) — the
   digit-run entry skip from the '&': is_hex != 0 -> 3, else 2. */
extern "C" int32_t isaac_sfx_xml_scan_num_entry_digits(uint32_t is_hex) {
  return is_hex != 0u
             ? static_cast<int32_t>(ISAAC_SFX_XML_SCAN_NUM_ENTRY_HEX)
             : static_cast<int32_t>(ISAAC_SFX_XML_SCAN_NUM_ENTRY_DEC);
}

/* 0x416fd2 / 0x416ffa / 0x416fe8 / 0x417013 `cmp al,0xff ; je/jne` —
   the digit-run gate, LOW BYTE (al = the table's nibble): 0xff -> 0
   (run STOPS; the machine does not fold the failing byte), else 1.
   The SAME gate runs at the run entry (first digit) and at the loop
   bottom (next digit). */
extern "C" int32_t isaac_sfx_xml_scan_num_digit_gate(uint32_t nibble) {
  return low_byte(nibble) ==
                 static_cast<uint8_t>(ISAAC_SFX_XML_SCAN_NUM_NOT_DIGIT)
             ? 0
             : 1;
}

/* 0x41701f read-pos offset = entry + run_len, 32-bit wrap: the esi
   offset from the '&' at the utf8-append call / ';' test. */
extern "C" int32_t isaac_sfx_xml_scan_num_end_digits(uint32_t is_hex,
                                                     uint32_t run_len) {
  const uint32_t entry =
      is_hex != 0u ? ISAAC_SFX_XML_SCAN_NUM_ENTRY_HEX
                   : ISAAC_SFX_XML_SCAN_NUM_ENTRY_DEC;
  return static_cast<int32_t>(entry + run_len);
}

/* 0x416fd6..0x416fdd (hex) / 0x417000..0x417007 (decimal) — the
   digit-run fold walk over the NIBBLE sequence (table-decoded bytes):
   each nibble is gated by the SAME 0xff low-byte gate; a passing
   nibble is folded with isaac_sfx_xml_scan_num_value (hex (v<<4)+n,
   decimal v*10+n, 32-bit wrap after every add) and consumes one run
   position; the first failing nibble ends the run (not folded, not
   consumed). The utf8-append edge (0x416dc0) and the digit-table lookups
   (0xb1ad60) are the scanner frame's host content (v18/v17 laws cover
   their decisions) — this law's own decisions are pure. */
extern "C" void isaac_sfx_xml_scan_num_run(
    uint32_t is_hex, const uint8_t* nibbles, uint32_t count,
    IsaacSfxXmlScanNumRunPlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t hex_path = is_hex != 0u ? 1 : 0;
  const uint32_t entry =
      hex_path != 0 ? ISAAC_SFX_XML_SCAN_NUM_ENTRY_HEX
                    : ISAAC_SFX_XML_SCAN_NUM_ENTRY_DEC;
  uint32_t run_len = 0;
  uint32_t value = 0;
  if (nibbles != nullptr) {
    for (uint32_t i = 0; i < count; ++i) {
      if (low_byte(nibbles[i]) ==
          static_cast<uint8_t>(ISAAC_SFX_XML_SCAN_NUM_NOT_DIGIT)) {
        break;
      }
      value = isaac_sfx_xml_scan_num_value(value, nibbles[i], is_hex);
      ++run_len;
    }
  }
  out->hex_path = hex_path;
  out->entry_digits = static_cast<int32_t>(entry);
  out->first_digit_ok =
      (count > 0u && nibbles != nullptr &&
       low_byte(nibbles[0]) !=
           static_cast<uint8_t>(ISAAC_SFX_XML_SCAN_NUM_NOT_DIGIT))
          ? 1
          : 0;
  out->run_len = static_cast<int32_t>(run_len);
  out->value = value;
  out->end_digits = static_cast<int32_t>(entry + run_len);
  out->utf8_va = ISAAC_SFX_XML_UTF8_VA;
  out->pure_complete = 1;
  out->scan_va = ISAAC_SFX_XML_SCAN_VA;
}

/* 0x416f09..0x416fb6 (commits: add esi,5/6/6/4/4) / 0x417036 (literal
   arm: inc esi) — the amp consumption law: skip = packed>>8, and a
   packed 0 (no match) consumes exactly 1 (the literal '&'). */
extern "C" int32_t isaac_sfx_xml_scan_amp_consumed(uint32_t packed) {
  const uint32_t skip = packed >> 8u;
  return skip != 0u ? static_cast<int32_t>(skip)
                    : ISAAC_SFX_XML_SCAN_AMP_LITERAL_CONSUMED;
}

/* 0x416f09/0x416f3b/0x416f6f/0x416f8f/0x416faf (emit stores 0x26/0x27/
   0x22/0x3e/0x3c) / 0x417039 (literal: mov [edx],al with al = '&') —
   the amp emit law: emit = packed&0xff, and a packed 0 emits the
   literal '&' 0x26. */
extern "C" int32_t isaac_sfx_xml_scan_amp_emit(uint32_t packed) {
  if (packed == 0u) {
    return ISAAC_SFX_XML_SCAN_AMP_LITERAL_EMIT;
  }
  return static_cast<int32_t>(packed & 0xffu);
}

ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_scan_num_hex_path);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_scan_num_entry_digits);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_scan_num_digit_gate);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_scan_num_end_digits);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_scan_num_run);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_scan_amp_consumed);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_scan_amp_emit);

ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_xml_scan_num_hex_path, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_xml_scan_num_entry_digits, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_xml_scan_num_digit_gate, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_xml_scan_num_end_digits, 2);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_xml_scan_num_run, 4);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_xml_scan_amp_consumed, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_xml_scan_amp_emit, 1);

/* ============================ v25d: 0x92d528/0x92da3a numeric-scan
 * gates at the atoi IAT (wave-16, banner v25d, NO ABI bump — the
 * coordinator merges).
 *
 * The v24 census classified the reader's numeric parse as "IAT strtoul
 * (numeric parse) HOST". The IAT slot 0xb187a8 is VERIFIED **atoi**
 * (hint 80, name "atoi") — SINGLE arg, `push ecx ; call [0xb187a8] ;
 * add esp,4`, full eax result. This landable layer is the DECISION
 * surface around that call (the call itself stays host):
 *
 *   Island A — 0x92d51a..0x92d537: the `id` attr arm of the SOUND walk.
 *     value = [esi+4] (0x92d51a) ; ecx = 0xc71640 (0x92d51d) ;
 *     test eax,eax ; cmovne ecx,eax (0x92d522..0x92d524) — FULL-WORD
 *     NULL test: value_ptr != 0 -> value_ptr, else the 0xc71640 empty
 *     string. push ecx ; call atoi (0x92d527..0x92d528) ;
 *     add esp,4 (0x92d52e) ; [ebp-0x10264] = eax (0x92d531) — the count
 *     field = the atoi result, FULL 32-bit eax (later range-checked
 *     SIGNED at 0x92d6c4 test/js + cmp/jl — v9 landed those gates).
 *
 *   Island B — 0x92da2c..0x92da49: the `weight` attr arm of the SAMPLE
 *     slot walk. value = [edi+4] ; ecx = 0xc71640 ; test ; cmovne
 *     (0x92da2c..0x92da36 — SAME FULL-WORD select) ; push ; call atoi
 *     (0x92da39..0x92da3a) ; add esp,4 (0x92da46) ; ecx = [ebp-0x1040c]
 *     (0x92da40) — the slot pointer is RE-READ **AFTER** the call
 *     (defect-class-1 trap: capture post-call, never the pre-call
 *     fold); [ecx+0x34] = eax (0x92da49) — slot->weight = atoi result,
 *     FULL 32-bit.
 *
 * The attr-name compare gates (0x92d4f1/0x92da03 strcmp vs
 * "id"/"name"/"path"/"weight") were landed v5 (attr_strcmp) and the
 * arm/action route (which attr -> numeric vs string) landed v5 too
 * (attr_arm/attr_arm_action). This block lands the atoi-ARG select +
 * the TWO store laws + the post-call slot re-read. */

/* 0x92d51d..0x92d524 / 0x92da2f..0x92da36 `mov ecx,0xc71640 ; mov eax,
 * [node+4] ; test eax,eax ; cmovne ecx,eax` — FULL-WORD NULL select for
 * the atoi ARG: value_ptr != 0 -> value_ptr, else 0xc71640. A LOW-BYTE
 * test would wrongly fall back on 0x100. */
extern "C" uint32_t isaac_sfx_numeric_atoi_arg(uint32_t value_ptr) {
  return value_ptr != 0u ? value_ptr
                         : static_cast<uint32_t>(ISAAC_SFX_ATTR_EMPTY_STRING_VA);
}

/* 0x92d527/0x92da39 `push ecx ; call [0xb187a8] ; add esp,4` — the IAT
 * slot is atoi (hint 80), ONE argument. Pin the VA so the coordinator's
 * removal work keys on the verified identity. */
extern "C" uint32_t isaac_sfx_numeric_atoi_iat_va(void) {
  return static_cast<uint32_t>(ISAAC_SFX_ATTR_PARSE_IAT_VA);
}

/* 0x92d531 `mov dword [ebp-0x10264],eax` — the count field = the atoi
 * result, FULL 32-bit eax. The reader range-checks it SIGNED later
 * (0x92d6c4 js / cmp 0x443 jl — v9); a byte-store mutant truncates
 * 0x100/0x1ff/0xffffffff. */
extern "C" int32_t isaac_sfx_numeric_id_count(uint32_t atoi_result) {
  return static_cast<int32_t>(atoi_result);
}

/* 0x92da40 `mov ecx,[ebp-0x1040c]` — the slot pointer is re-read AFTER
 * the atoi call. The store uses the POST-call value; folding a pre-call
 * slot (the defect-class-1 trap) is a translation bug. The law takes
 * both and always selects the post value. */
extern "C" uint32_t isaac_sfx_numeric_weight_slot_after(uint32_t slot_pre,
                                                        uint32_t slot_post) {
  (void)slot_pre; /* defect-1: the pre-call slot is deliberately unused */
  return slot_post;
}

/* 0x92da49 `mov dword [ecx+0x34],eax` — slot->weight = the atoi result,
 * FULL 32-bit at offset +0x34 (ISAAC_SFX_SLOT_OFF_WEIGHT_34). */
extern "C" int32_t isaac_sfx_numeric_weight_value(uint32_t atoi_result) {
  return static_cast<int32_t>(atoi_result);
}

ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_numeric_atoi_arg, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_numeric_atoi_iat_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_numeric_id_count, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_numeric_weight_slot_after, 2);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_numeric_weight_value, 1);

ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_numeric_atoi_arg);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_numeric_atoi_iat_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_numeric_id_count);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_numeric_weight_slot_after);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_numeric_weight_value);

/* ============================ v25b: 0x00416b70/0x00416920 attr-value
 * scanner site identity + composed decode layer (wave-16, banner v25b,
 * NO ABI bump — the coordinator merges). The two ATTR-VALUE entity
 * decoders of the attrs parse (dquote "..." 0x416b70 called at 0x4166de,
 * squote '...' 0x416920 called at 0x41671e). v15 landed the four per-char
 * gate tables; v17/v18/v25c the SHARED entity laws. This block lands the
 * attr-SITE identity (case content is byte-identical to the text site
 * 0x417074 — verified raw; the VAs differ) and the composed per-iteration
 * decode record. The walks' memory reads + the utf8-append call stay
 * HOST; the two scanner boundaries stay. */

/* 0x416bd0/0x416980 `movzx eax, byte[eax+<tbl>]` — the dispatch window:
   movsx eax,(int8)b1 ; sub 0x23 ; cmp eax,0x4e ; ja literal. So the
   valid window is ((int8)b1 - 0x23) unsigned in [0,0x4e]. LOW BYTE of
   b1 (movsx); 0x80..0xff values are negative -> OUT. */
extern "C" int32_t isaac_sfx_xml_attr_value_dispatch_ok(uint32_t b1) {
  const int32_t s = static_cast<int8_t>(static_cast<uint8_t>(b1 & 0xffu));
  const uint32_t idx = static_cast<uint32_t>(s) - 0x23u;
  return idx <= 0x4eu ? 1 : 0;
}

/* 0x416d0f..0x416d24 `cmp byte[esi],0x3b ; jne -> [0xc7de4c]=0xb1b6f8`
   — the numeric ';' error law: on the numeric arm the byte AFTER the
   utf8 call decides; ';' keeps the PREVIOUS slot (and consumes), else
   the slot is UNCONDITIONALLY 0xb1b6f8. LOW BYTE of semi_byte. */
extern "C" uint32_t isaac_sfx_xml_attr_value_semi_error(int32_t numeric,
                                                        uint32_t semi_byte,
                                                        uint32_t prev_error) {
  if (numeric == 0) {
    return prev_error;
  }
  return low_byte(semi_byte) ==
                 static_cast<uint8_t>(ISAAC_SFX_XML_SCAN_SEMI_BYTE)
             ? prev_error
             : ISAAC_SFX_XML_ATTR_VALUE_ERR_SEMI_VA;
}

/* 0x416d26 literal arm (inc esi / inc edx), the named commits (skip
   packed>>8, 0->1) and the numeric end (entry digits + run + semi?1:0)
   — one iteration's cursor advance. */
extern "C" int32_t isaac_sfx_xml_attr_value_consumed(uint32_t named_packed,
                                                     int32_t numeric,
                                                     int32_t num_end_digits,
                                                     int32_t num_semi_ok,
                                                     int32_t literal) {
  if (numeric != 0) {
    return static_cast<int32_t>(static_cast<uint32_t>(num_end_digits) +
                                (num_semi_ok != 0 ? 1u : 0u));
  }
  if (literal != 0) {
    return 1;
  }
  return isaac_sfx_xml_scan_amp_consumed(named_packed);
}

/* 0x416d29..0x416d2b literal store, named emit stores (ONE byte each),
   the utf8-append writes (v18 law) — one iteration's OUT advance. The
   named arms each store exactly 1 byte (0x26/0x27/0x22/0x3e/0x3c), so
   the count is 1, NOT the emit byte value. */
extern "C" int32_t isaac_sfx_xml_attr_value_emitted(uint32_t named_packed,
                                                    int32_t numeric,
                                                    uint32_t num_value,
                                                    int32_t utf8_len,
                                                    int32_t literal) {
  (void)named_packed;
  (void)num_value;
  (void)literal;
  if (numeric != 0) {
    return utf8_len;
  }
  return 1; /* literal OR named: every non-numeric path stores 1 byte */
}

/* 0x416b7b..0x416b9c the entry-skip walk gate — SITE-select: dquote uses
   0xb1a860 (attr_dquote_skip_char), squote 0xb1a960
   (attr_squote_skip_char). LOW BYTE. */
extern "C" int32_t isaac_sfx_xml_attr_value_entry_char(uint32_t site,
                                                       uint32_t byte) {
  if (site == ISAAC_SFX_XML_ATTR_VALUE_SITE_SQUOTE) {
    return isaac_sfx_xml_attr_squote_skip_char(byte);
  }
  return isaac_sfx_xml_attr_dquote_skip_char(byte);
}

/* 0x416baa/0x416d34 the text-continue gate — SITE-select: dquote
   0xb1ab60 (attr_dquote_text_char), squote 0xb1ac60
   (attr_squote_text_char). LOW BYTE. */
extern "C" int32_t isaac_sfx_xml_attr_value_text_char(uint32_t site,
                                                      uint32_t byte) {
  if (site == ISAAC_SFX_XML_ATTR_VALUE_SITE_SQUOTE) {
    return isaac_sfx_xml_attr_squote_text_char(byte);
  }
  return isaac_sfx_xml_attr_dquote_text_char(byte);
}

/* Composed per-iteration decode record for the attr-value scanner sites.
   site 0 = dquote 0x416b70, site 1 = squote 0x416920. entry_byte is the
   byte under the cursor BEFORE the entry skip walk; first_byte is
   byte[skip_end] (or byte[*cursor] when the walk does not advance); b1..
   b5 are the five bytes after a '&' (dispatch byte, then the named ladder
   / numeric select bytes); semi_byte is the byte at the numeric ';'
   check; prev_error is [0xc7de4c] at iteration entry; num_run_len /
   num_value are the host digit-run results (v25c law) when numeric. */
extern "C" void isaac_sfx_xml_attr_value_scan_plan(
    uint32_t site, uint32_t entry_byte, uint32_t first_byte, uint32_t b1,
    uint32_t b2, uint32_t b3, uint32_t b4, uint32_t b5, uint32_t semi_byte,
    uint32_t prev_error, uint32_t num_run_len, uint32_t num_value,
    IsaacSfxXmlAttrValueScanPlan* out) {
  if (out == nullptr) {
    return;
  }
  const uint32_t dquote = site == ISAAC_SFX_XML_ATTR_VALUE_SITE_DQUOTE ? 1u
                                                                        : 0u;
  const int32_t known = site < ISAAC_SFX_XML_ATTR_VALUE_SITE_COUNT ? 1 : 0;
  /* entry + text gate tables are the SITE's (0xb1a860/0xb1ab60 dquote;
     0xb1a960/0xb1ac60 squote). LOW-BYTE gates. */
  const uint32_t entry_tbl =
      known != 0
          ? (dquote != 0 ? ISAAC_SFX_XML_ATTR_VALUE_DQUOTE_ENTRY_VA
                         : ISAAC_SFX_XML_ATTR_VALUE_SQUOTE_ENTRY_VA)
          : 0u;
  const uint32_t text_tbl =
      known != 0
          ? (dquote != 0 ? ISAAC_SFX_XML_ATTR_VALUE_DQUOTE_TEXT_VA
                         : ISAAC_SFX_XML_ATTR_VALUE_SQUOTE_TEXT_VA)
          : 0u;
  const int32_t entry_advances =
      known != 0 && isaac_sfx_xml_attr_value_entry_char(site, entry_byte) != 0
          ? 1
          : 0;
  const int32_t text_open =
      known != 0 && isaac_sfx_xml_attr_value_text_char(site, first_byte) != 0
          ? 1
          : 0;
  const int32_t entity =
      text_open != 0 &&
              static_cast<uint8_t>(first_byte & 0xffu) ==
                  static_cast<uint8_t>(ISAAC_SFX_XML_ATTR_VALUE_AMP_BYTE)
          ? 1
          : 0;
  /* 0x416bc0..0x416bd7: dispatch on b1 (the byte after '&'). */
  const int32_t dispatch_ok =
      entity != 0 ? isaac_sfx_xml_attr_value_dispatch_ok(b1) : 0;
  int32_t case_id = ISAAC_SFX_XML_SCAN_CASE_NONE;
  if (dispatch_ok != 0) {
    const int32_t s = static_cast<int8_t>(static_cast<uint8_t>(b1 & 0xffu));
    switch (s) {
      case 0x23:
        case_id = ISAAC_SFX_XML_SCAN_CASE_NUM;
        break;
      case 0x61:
        case_id = ISAAC_SFX_XML_SCAN_CASE_AMP;
        break;
      case 0x67:
        case_id = ISAAC_SFX_XML_SCAN_CASE_GT;
        break;
      case 0x6c:
        case_id = ISAAC_SFX_XML_SCAN_CASE_LT;
        break;
      case 0x71:
        case_id = ISAAC_SFX_XML_SCAN_CASE_QUOT;
        break;
      default:
        case_id = ISAAC_SFX_XML_SCAN_CASE_NONE;
        break;
    }
  }
  const uint32_t named_packed =
      case_id == ISAAC_SFX_XML_SCAN_CASE_NONE
          ? 0u
          : static_cast<uint32_t>(
                isaac_sfx_xml_scan_named_entity(
                    static_cast<uint32_t>(case_id), b2, b3, b4, b5));
  const int32_t numeric = case_id == ISAAC_SFX_XML_SCAN_CASE_NUM ? 1 : 0;
  /* 0x416cab..0x416cdc: cl=[esi+2]; cmp cl,0x78 ; jne dec — LOW BYTE. */
  const int32_t num_hex =
      numeric != 0 &&
              static_cast<uint8_t>(b2 & 0xffu) ==
                  static_cast<uint8_t>(ISAAC_SFX_XML_SCAN_NUM_X_BYTE)
          ? 1
          : 0;
  /* First digit byte: hex [esi+3]=b3, dec [esi+2]=b2 (gate 0xb1ad60). */
  const uint32_t first_digit = num_hex != 0 ? b3 : b2;
  const int32_t num_first_digit_ok =
      numeric != 0 &&
              static_cast<uint8_t>(isaac_sfx_xml_scan_hex_nibble(first_digit) &
                                  0xffu) !=
                  static_cast<uint8_t>(ISAAC_SFX_XML_SCAN_NUM_NOT_DIGIT)
          ? 1
          : 0;
  const int32_t num_end_digits =
      numeric != 0
          ? static_cast<int32_t>(
                static_cast<uint32_t>(num_hex != 0
                                          ? ISAAC_SFX_XML_SCAN_NUM_ENTRY_HEX
                                          : ISAAC_SFX_XML_SCAN_NUM_ENTRY_DEC) +
                static_cast<uint32_t>(num_run_len))
          : 0;
  const uint32_t error_after =
      isaac_sfx_xml_attr_value_semi_error(numeric, semi_byte, prev_error);
  /* The literal arm runs when: no text gate, no entity, dispatch miss, or
     a named case whose ladder did NOT match (named_packed == 0). The
     numeric arm is NOT a literal even with zero digits. */
  /* The literal arm: no text, no entity, dispatch miss, the NONE case
     (in-window, no name), or a NAMED case whose ladder did NOT match.
     The NUMERIC arm is never literal (utf8 runs even with zero digits). */
  const int32_t named_miss =
      case_id == ISAAC_SFX_XML_SCAN_CASE_NONE ||
              (numeric == 0 && named_packed == 0u)
          ? 1
          : 0;
  const int32_t text_closed = text_open == 0 ? 1 : 0;
  const int32_t literal =
      text_closed == 0 && (entity == 0 || dispatch_ok == 0 || named_miss != 0)
          ? 1
          : 0;
  const int32_t utf8_len =
      numeric != 0
          ? static_cast<int32_t>(
                isaac_sfx_xml_utf8_len(num_value))
          : 0;
  const int32_t consumed = text_closed != 0
                               ? 0
                               : isaac_sfx_xml_attr_value_consumed(
                                     named_packed, numeric, num_end_digits,
                                     static_cast<uint8_t>(semi_byte & 0xffu) ==
                                             static_cast<uint8_t>(
                                                 ISAAC_SFX_XML_SCAN_SEMI_BYTE)
                                         ? 1
                                         : 0,
                                     literal);
  const int32_t emitted = text_closed != 0
                              ? 0
                              : isaac_sfx_xml_attr_value_emitted(
                                    named_packed, numeric, num_value, utf8_len,
                                    literal);
  out->scanner_va =
      known != 0 ? (dquote != 0 ? ISAAC_SFX_XML_ATTR_DQUOTE_VA
                                : ISAAC_SFX_XML_ATTR_SQUOTE_VA)
                 : 0u;
  out->entry_table_va = entry_tbl;
  out->text_table_va = text_tbl;
  out->dispatch_table_va =
      known != 0 ? (dquote != 0 ? ISAAC_SFX_XML_ATTR_VALUE_DQUOTE_DISPATCH_VA
                                : ISAAC_SFX_XML_ATTR_VALUE_SQUOTE_DISPATCH_VA)
                 : 0u;
  out->jump_table_va =
      known != 0 ? (dquote != 0 ? ISAAC_SFX_XML_ATTR_VALUE_DQUOTE_JUMP_VA
                                : ISAAC_SFX_XML_ATTR_VALUE_SQUOTE_JUMP_VA)
                 : 0u;
  out->entry_advances = entry_advances;
  out->text_open = text_open;
  out->entity = entity;
  out->dispatch_ok = dispatch_ok;
  out->case_id = case_id;
  out->named_packed = named_packed;
  out->named_skip = isaac_sfx_xml_scan_amp_consumed(named_packed);
  out->named_emit = isaac_sfx_xml_scan_amp_emit(named_packed);
  out->numeric = numeric;
  out->num_hex = num_hex;
  out->num_first_digit_ok = num_first_digit_ok;
  out->num_run_len = static_cast<int32_t>(num_run_len);
  out->num_value = num_value;
  out->num_end_digits = num_end_digits;
  out->num_semi_ok =
      static_cast<uint8_t>(semi_byte & 0xffu) ==
              static_cast<uint8_t>(ISAAC_SFX_XML_SCAN_SEMI_BYTE)
          ? 1
          : 0;
  out->error_after = error_after;
  out->consumed = consumed;
  out->emitted = emitted;
  out->utf8_called = numeric;
  out->literal = literal;
  out->host_calls = numeric;
  out->pure_complete = 0;
  out->size_bytes = ISAAC_SFX_XML_ATTR_DQUOTE_SIZE_BYTES;
  out->caller_count = 1;
}

ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_xml_attr_value_dispatch_ok, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_xml_attr_value_semi_error, 3);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_xml_attr_value_consumed, 5);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_xml_attr_value_emitted, 5);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_xml_attr_value_scan_plan, 13);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_xml_attr_value_entry_char, 2);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_xml_attr_value_text_char, 2);

ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_attr_value_dispatch_ok);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_attr_value_semi_error);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_attr_value_consumed);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_attr_value_emitted);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_attr_value_scan_plan);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_attr_value_entry_char);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_xml_attr_value_text_char);

/* ---------- v26: 0x92d140 sibling callee bodies — emplace / destroy-range /
   resize-n decision layers (lost v25e unit; ABI 25->26) ----------
   Machine truth from cpu-dump/0092e830.txt, 0092ea80.txt, 0092edc0.txt.
   Host edges stay host: 0xaef956 (0x38 mover), 0x40d040 (string dtor),
   0xaef638 (__ehvec_dtor), 0x92cea0 (element ctor). All params uint32_t. */

static const uint32_t SFX_EMPLACE_RUN_TABLE[8][2] = {
    {0x000, 8}, {0x008, 0x38}, {0x190, 4}, {0x194, 4},
    {0x198, 1}, {0x199, 1}, {0x19c, 4}, {0x1a0, 0x20},
};

extern "C" uint32_t isaac_sfx_emplace_copy_run_start(uint32_t k) {
  if (k >= ISAAC_SFX_EMPLACE_RUNS) return ISAAC_SFX_GUARD_SENTINEL_FFFFFFFF;
  return SFX_EMPLACE_RUN_TABLE[k][0];
}

extern "C" uint32_t isaac_sfx_emplace_copy_run_width(uint32_t k) {
  if (k >= ISAAC_SFX_EMPLACE_RUNS) return ISAAC_SFX_GUARD_SENTINEL_FFFFFFFF;
  return SFX_EMPLACE_RUN_TABLE[k][1];
}

extern "C" uint32_t isaac_sfx_emplace_write_kind(uint32_t step) {
  if (step >= ISAAC_SFX_EMPLACE_RUNS) return ISAAC_SFX_GUARD_SENTINEL_FFFFFFFF;
  if (step < 3) return 0;  /* 0x92e89d/0x92e8a7/0x92e8b1 dest pre-zero */
  if (step < 5) return 1;  /* 0x92e8bb movups + 0x92e8c9 movq */
  return 2;                /* 0x92e8d9/0x92e8e3/0x92e8ed source reset */
}

/* The 8-write ORDER of the emplace body: [target(0=dest,1=src), offset,
   width, value|0xffffffff-for-copy]. */
static const uint32_t SFX_EMPLACE_WRITE_TABLE[8][4] = {
    {0, 0x1a0, 4, 0},
    {0, 0x1b0, 4, 0},
    {0, 0x1b4, 4, 0},
    {0, 0x1a0, 16, static_cast<uint32_t>(ISAAC_SFX_GUARD_SENTINEL_FFFFFFFF)},
    {0, 0x1b0, 8, static_cast<uint32_t>(ISAAC_SFX_GUARD_SENTINEL_FFFFFFFF)},
    {1, 0x1b0, 4, 0},
    {1, 0x1b4, 4, ISAAC_SFX_EMPLACE_RESET_SSO_TAG},
    {1, 0x1a0, 1, 0},
};

extern "C" uint32_t isaac_sfx_emplace_write_info(uint32_t step,
                                                 uint32_t field) {
  if (step >= ISAAC_SFX_EMPLACE_RUNS) return ISAAC_SFX_GUARD_SENTINEL_FFFFFFFF;
  if (field > 3) return ISAAC_SFX_GUARD_SENTINEL_FFFFFFFF;
  return SFX_EMPLACE_WRITE_TABLE[step][field];
}

extern "C" uint32_t isaac_sfx_destroy_range_iters(uint32_t begin,
                                                  uint32_t end) {
  if (begin == end) return 0; /* 0x92eaa6 cmp/je trivial arm */
  if (end < begin) return ISAAC_SFX_GUARD_SENTINEL_FFFFFFFF;
  const uint32_t span = end - begin;
  if (span % ISAAC_SFX_ENTRY_STRIDE != 0) {
    return ISAAC_SFX_GUARD_SENTINEL_FFFFFFFF;
  }
  return span / ISAAC_SFX_ENTRY_STRIDE;
}

extern "C" uint32_t isaac_sfx_destroy_range_slot_string_off(uint32_t i) {
  return i * ISAAC_SFX_ENTRY_STRIDE + ISAAC_SFX_DESTROY_STR_OFF_1A0;
}

extern "C" uint32_t isaac_sfx_destroy_range_slot_sub_off(uint32_t i) {
  return i * ISAAC_SFX_ENTRY_STRIDE + ISAAC_SFX_DESTROY_SUB_OFF_8;
}

extern "C" uint32_t isaac_sfx_destroy_range_funclet_state(uint32_t t) {
  return (t & 1u) == 0 ? 0 : ISAAC_SFX_FUNCLET_STATE_AFTER;
}

extern "C" int32_t isaac_sfx_destroy_range_stack_dummy(void) {
  return 1;
}

extern "C" uint32_t isaac_sfx_resize_n_ctor_count(uint32_t n) {
  return n; /* sub edi,1 ; jne down-count: exactly n iterations */
}

extern "C" uint32_t isaac_sfx_resize_n_end(uint32_t begin, uint32_t n) {
  return begin + n * ISAAC_SFX_ENTRY_STRIDE; /* per-step 32-bit wrap */
}

extern "C" uint32_t isaac_sfx_resize_n_ctor_off(uint32_t begin, uint32_t i) {
  return begin + i * ISAAC_SFX_ENTRY_STRIDE;
}

extern "C" uint32_t isaac_sfx_resize_n_tail_iters(uint32_t begin,
                                                  uint32_t n) {
  /* 0x92ee16 destroy_range(new_end, new_end) — always the trivial arm. */
  (void)begin;
  (void)n;
  return 0;
}

extern "C" int32_t isaac_sfx_resize_n_stack_args(void) {
  return 3; /* ret 0xc */
}

ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_emplace_copy_run_start, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_emplace_copy_run_width, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_emplace_write_kind, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_emplace_write_info, 2);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_destroy_range_iters, 2);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_destroy_range_slot_string_off, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_destroy_range_slot_sub_off, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_destroy_range_funclet_state, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_destroy_range_stack_dummy, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_resize_n_ctor_count, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_resize_n_end, 2);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_resize_n_ctor_off, 2);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_resize_n_tail_iters, 2);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_resize_n_stack_args, 0);

ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_emplace_copy_run_start);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_emplace_copy_run_width);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_emplace_write_kind);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_emplace_write_info);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_destroy_range_iters);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_destroy_range_slot_string_off);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_destroy_range_slot_sub_off);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_destroy_range_funclet_state);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_destroy_range_stack_dummy);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_resize_n_ctor_count);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_resize_n_end);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_resize_n_ctor_off);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_resize_n_tail_iters);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_resize_n_stack_args);

/* ---------- v26: 0xa17f40 / 0xa17ea0 attempt bodies of the 0xa178d0
   file-open retry gate (wave-18; ABI 26 -> 27 after v25e landed). The
   open calls attempt #1 (0xa17f40) with (this, handle, &result_slot);
   the retry gate (v25f law) runs attempt #2 (0xa17ea0) iff the CALLER's
   slot is ZERO after attempt #1 (0xa1792a cmp [ebp+8],0). BOTH attempts
   write the caller slot ONLY through the out pointer (*out write laws
   below); their own [ebp+8] writes (0xa17f8a hash1, 0xa1800a alloc1,
   0xa17eca alloc2) are MSVC arg-slot reuse spills, NOT the caller slot
   (defect-class guard: post-call value must NOT be folded to the
   callee-local [ebp+8]). Host stays: 0xa159d0/0xa15ab0 string hashes,
   the slot-table reads, 0xa0f4c0 alloc, 0xa68a50 ctor, 0xa524b0/0xa52540
   + vtbl[0x24] loaders, vtbl[0] dtor. Sites: 0xa17f40 span
   0xa17f40..0xa18057 ret 8; 0xa17ea0 span 0xa17ea0..0xa17f3b ret 8. */

/* 0xa17f8d `and esi,0x7fff` — probe start = hash1 & 0x7fff (15-bit
   index into the 0x8000-slot table at this+0x108, stride 4). FULL-WORD
   mask; hash1=0x8000 must give 0. */
extern "C" uint32_t isaac_sfx_open_attempt1_probe_start(uint32_t hash1) {
  return hash1 & ISAAC_SFX_OPEN_ATTEMPT_PROBE_MASK;
}

/* 0xa17fcf/d0 `inc esi ; and esi,0x7fff` — probe advance wraps
   0x7fff -> 0 (32-bit inc then 15-bit mask). */
extern "C" uint32_t isaac_sfx_open_attempt1_probe_next(uint32_t idx) {
  return (idx + 1u) & ISAAC_SFX_OPEN_ATTEMPT_PROBE_MASK;
}

/* 0xa17fc5 / 0xa17fee `cmp counter,0x8000 ; jae` — UNSIGNED probe
   bound: counter >= 0x8000 exhausts all 0x8000 slots (stop walk). */
extern "C" int32_t isaac_sfx_open_attempt1_probe_done(uint32_t counter) {
  return counter >= ISAAC_SFX_OPEN_ATTEMPT_PROBE_LIMIT ? 1 : 0;
}

/* 0xa17fb8 `cmp [edi+4],ebx ; jne next` + 0xa17fbd `cmp [edi+8],eax ;
   je found` — FULL-WORD pair compare: entry->key1 == hash1 AND
   entry->key2 == hash2. */
extern "C" int32_t isaac_sfx_open_attempt1_slot_match(uint32_t key1,
                                                      uint32_t key2,
                                                      uint32_t hash1,
                                                      uint32_t hash2) {
  return (key1 == hash1 && key2 == hash2) ? 1 : 0;
}

/* 0xa17fe1 `cmp [this+idx*4+0x108],0 ; je ret0` (slot nonzero) AND
   0xa17fee `cmp counter,0x8000 ; jae ret0` (counter < 0x8000, UNSIGNED)
   — the found verdict after the walk. */
extern "C" int32_t isaac_sfx_open_attempt1_found(uint32_t slot_nonzero,
                                                 uint32_t counter) {
  return (slot_nonzero != 0u && counter < ISAAC_SFX_OPEN_ATTEMPT_PROBE_LIMIT)
             ? 1
             : 0;
}

/* 0xa18027/0xa18041 al=1 (found tails) vs 0xa18057 al=0 (path-bad or
   miss). Return = name_ok && found. */
extern "C" int32_t isaac_sfx_open_attempt1_ret(uint32_t name_ok,
                                               uint32_t found) {
  return (name_ok != 0u && found != 0u) ? 1 : 0;
}

/* Result-slot write law #1. 0xa17ff9 `test out,out ; je 0xa18041`
   (out==0 -> ret TRUE, NO *out store), 0xa18014 `test alloc,alloc ;
   je 0xa1803d` (alloc==0 -> *out = 0), 0xa18025 `[esi] = ctor_result`
   (alloc ok -> *out = ctor result), 0xa1803f `[esi] = 0`. NONE
   (0xffffffff) = no write (slot stays 0 at the caller's pre-reset). */
extern "C" uint32_t isaac_sfx_open_attempt1_out_plan(uint32_t name_ok,
                                                     uint32_t found,
                                                     uint32_t out,
                                                     uint32_t alloc_ok,
                                                     uint32_t ctor_result) {
  if (name_ok == 0u || found == 0u || out == 0u) {
    return ISAAC_SFX_OPEN_OUT_NONE;
  }
  return alloc_ok != 0u ? ctor_result : 0u;
}

/* 0xa17eba `test ebx,ebx ; je host-arm` — FULL-WORD out gate: out != 0
   keeps the alloc/load path; out == 0 goes to the HOST 0xa524b0 arm. */
extern "C" int32_t isaac_sfx_open_attempt2_out_gate(uint32_t out) {
  return out != 0u ? 1 : 0;
}

/* 0xa17ecd `test esi,esi ; je 0xa17eee` — FULL-WORD alloc gate:
   alloc != 0 initializes the object. The alloc==0 arm (esi=0) derefs
   [0] at 0xa17ef0 in the PE (NULL read — crash in practice); typed-
   host note, the gate decision still lands. */
extern "C" int32_t isaac_sfx_open_attempt2_alloc_gate(uint32_t alloc) {
  return alloc != 0u ? 1 : 0;
}

/* 0xa17ef8 `cmp eax,0xa52540 ; jne indirect` — direct-call select:
   the vtbl[0x24] loader pointer equals the 0xa52540 constant. */
extern "C" int32_t isaac_sfx_open_attempt2_dispatch_direct(uint32_t fn) {
  return fn == ISAAC_SFX_OPEN_ATTEMPT2_LOADER_VA_A52540 ? 1 : 0;
}

/* 0xa17f08 `test al,al ; jne keep` — LOW-BYTE: the loader's al return
   nonzero keeps the object; 0x100/0x1ff must NOT keep (wide drive). */
extern "C" int32_t isaac_sfx_open_attempt2_keep(uint32_t load_result) {
  return (load_result & 0xffu) != 0u ? 1 : 0;
}

/* 0xa17f1a `setne al` — ret = alloc_ok && keep (obj != NULL). */
extern "C" int32_t isaac_sfx_open_attempt2_ret(uint32_t alloc_ok,
                                               uint32_t keep) {
  return (alloc_ok != 0u && keep != 0u) ? 1 : 0;
}

/* Result-slot write law #2. 0xa17f18 `[ebx] = esi` — *out = kept ?
   alloc : NULL; NONE when the main path is not reached (name fail or
   out==0 host arms — no caller-slot write). */
extern "C" uint32_t isaac_sfx_open_attempt2_out_plan(uint32_t name_ok,
                                                     uint32_t out,
                                                     uint32_t alloc_ok,
                                                     uint32_t keep,
                                                     uint32_t alloc_ptr) {
  if (name_ok == 0u || out == 0u) {
    return ISAAC_SFX_OPEN_OUT_NONE;
  }
  return (alloc_ok != 0u && keep != 0u) ? alloc_ptr : 0u;
}

ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_open_attempt1_probe_start, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_open_attempt1_probe_next, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_open_attempt1_probe_done, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_open_attempt1_slot_match, 4);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_open_attempt1_found, 2);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_open_attempt1_ret, 2);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_open_attempt1_out_plan, 5);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_open_attempt2_out_gate, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_open_attempt2_alloc_gate, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_open_attempt2_dispatch_direct, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_open_attempt2_keep, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_open_attempt2_ret, 2);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_open_attempt2_out_plan, 5);

ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_open_attempt1_probe_start);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_open_attempt1_probe_next);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_open_attempt1_probe_done);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_open_attempt1_slot_match);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_open_attempt1_found);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_open_attempt1_ret);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_open_attempt1_out_plan);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_open_attempt2_out_gate);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_open_attempt2_alloc_gate);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_open_attempt2_dispatch_direct);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_open_attempt2_keep);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_open_attempt2_ret);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_open_attempt2_out_plan);

/* ---------- v27: 0xa17180 build body (the 0xa178d0 file-open's
   canonical-key builder; wave-19; ABI 26 -> 27). The open calls it at
   0xa17917 and feeds the result to attempt #1 (0xa17f40) / attempt #2
   (0xa17ea0); 56 direct rel32 callers overall (census 2026-08-17).
   Pure decision layer of the body span 0xa17180..0xa172d3 (ret 4, ONE
   dword arg; ecx/this never read — dead-this callsite pattern):
   ABS arm iff (name!=0 FULL-WORD) && (strlen>2 UNSIGNED jbe) &&
   (name[1]==':' BYTE) && (name[2]=='\\' || name[2]=='/' BYTE);
   ABS tail keep (LOW-BYTE al of the validator), return = keep ? s1 : 0,
   dispose edge iff !keep && s1!=0; FAIL arm resolve-result gate
   (FULL-WORD), variant select (BYTE flag: 0 -> A), variant-A dispose
   edge (FULL-WORD s2!=0). Host stays: 0xa5a7a0 canonicalizer, 0xa524b0
   validator (registered as ISAAC_SFX_OPEN_ATTEMPT2_LOADER_VA_A524B0),
   0xa16c60 relative resolver, 0xa68790 join, 0xa648b0 dispose, the
   inline strlen scan (CRT), and every final return value (canonicalizer
   result). SEH guard writes (0/1/0xffffffff) at the two dispose sites
   are deterministic glue — typed host. */

/* 0xa171a5..0xa171ce — drive-absolute prefix test selecting the ABS
   arm: name!=0 (FULL-WORD 0xa171a8), strlen>2 (UNSIGNED jbe
   0xa171ba), name[1]==':' (BYTE 0xa171bf), name[2]=='\\' or '/'
   (BYTE 0xa171c8/0xa171cc). Any failure -> FAIL arm. */
extern "C" int32_t isaac_sfx_build_abs_gate(uint32_t name_nonzero,
                                            uint32_t len, uint32_t c1,
                                            uint32_t c2) {
  if (name_nonzero == 0u) return 0;
  if (len <= ISAAC_SFX_BUILD_MIN_ABS_LEN) return 0; /* UNSIGNED jbe */
  if ((c1 & 0xffu) != ISAAC_SFX_BUILD_CHAR_COLON) return 0;
  const uint32_t c2b = c2 & 0xffu;
  return (c2b == ISAAC_SFX_BUILD_CHAR_BACKSLASH ||
          c2b == ISAAC_SFX_BUILD_CHAR_SLASH)
             ? 1
             : 0;
}

/* 0xa171e9 `test al,al ; jne RET` — LOW-BYTE: the validator's al
   nonzero keeps s1; 0x100/0x1ff drive must NOT keep (al only). */
extern "C" int32_t isaac_sfx_build_abs_keep(uint32_t ok_result) {
  return (ok_result & 0xffu) != 0u ? 1 : 0;
}

/* 0xa1720a `mov eax,esi` — ABS-arm return: keep ? s1 : 0. The dispose
   arm (0xa171f1..0xa17208) xors esi to 0; the s1==0 arm is already 0. */
extern "C" uint32_t isaac_sfx_build_abs_out(uint32_t keep, uint32_t s1) {
  return keep != 0u ? s1 : 0u;
}

/* 0xa171ed `test esi,esi ; je RET` (FULL-WORD) + 0xa171f1..0xa17208
   dispose — the 0xa648b0 edge fires iff NOT keep AND s1 != 0. */
extern "C" int32_t isaac_sfx_build_abs_dispose(uint32_t keep,
                                               uint32_t s1) {
  return (keep == 0u && s1 != 0u) ? 1 : 0;
}

/* 0xa17230 `test edi,edi ; je RET0` — FULL-WORD gate on the FAIL-arm
   resolve result (0xa16c60): r==0 -> RET 0, else variant select. */
extern "C" int32_t isaac_sfx_build_resolve_gate(uint32_t r) {
  return r != 0u ? 1 : 0;
}

/* 0xa17238 `cmp byte[ebp+0xb],0 ; je A` — LOW-BYTE flag test: flag
   byte 0 -> VARIANT A (1); nonzero byte -> VARIANT B (0). Wide
   drives (0x100/0x1ff) read the LOW byte. */
extern "C" int32_t isaac_sfx_build_variant_select(uint32_t flag) {
  return (flag & 0xffu) == 0u ? 1 : 0;
}

/* 0xa17279 `test esi,esi ; je skip` — FULL-WORD: variant-A's second
   canonicalizer result s2 != 0 runs the 0xa648b0 dispose edge. */
extern "C" int32_t isaac_sfx_build_variant_a_dispose(uint32_t s2) {
  return s2 != 0u ? 1 : 0;
}

ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_build_abs_gate, 4);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_build_abs_keep, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_build_abs_out, 2);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_build_abs_dispose, 2);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_build_resolve_gate, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_build_variant_select, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_build_variant_a_dispose, 1);

ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_build_abs_gate);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_build_abs_keep);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_build_abs_out);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_build_abs_dispose);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_build_resolve_gate);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_build_variant_select);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_build_variant_a_dispose);
/* ---------- v28: 0xa159d0 / 0xa15ab0 string-hash pair (wave-20; ABI
   27 -> 28). The file-open canonical-key hashes: hash #1 (0xa159d0,
   djb2-style h = h*33 + norm(byte), 23 direct rel32 callers) and hash
   #2 (0xa15ab0, FNV-1a h = (h ^ norm(byte)) * 0x1000193, 2 direct
   callers). Both bodies are self-contained folds (0 E8 / 0 indirect /
   0 mem-stores); the string POINTER/BYTES are the host input stream,
   the fold arithmetic is pure (supersedes the v26/v27 "stay HOST"
   note - the pointer read stays host, the fold lands). Shared
   per-byte layer: norm + loop-continue; per-hash layer: FULL-WORD
   null gate, seed init, fold step. Consumers unchanged: v26
   probe_start (hash1 & 0x7fff) / slot_match (hash1+hash2 pair).
   All params uint32_t; byte discipline = & 0xff inside the laws. */

/* 0xa159f7..0xa15a11 == 0xa15ad7..0xa15aee - the SHARED per-byte
   normalize: b = c&0xff; d = (b-0x41)&0xff (8-bit wrap); lo =
   (b+0x20)&0xff; n = d > 0x19 (UNSIGNED cmova) ? b : lo; n == 0x5c ->
   0x2f (cmove). BYTE in/out. */
extern "C" uint32_t isaac_sfx_hash_byte_norm(uint32_t c) {
  const uint32_t b = c & 0xffu;
  const uint32_t d = (b + 0x100u - ISAAC_SFX_HASH_NORM_A) & 0xffu;
  const uint32_t lo =
      (b + ISAAC_SFX_HASH_NORM_CASE_SHIFT) & 0xffu;
  uint32_t n = d > ISAAC_SFX_HASH_NORM_LOWER_DELTA ? b : lo;
  if (n == ISAAC_SFX_HASH_NORM_BACKSLASH) {
    n = ISAAC_SFX_HASH_NORM_SLASH;
  }
  return n;
}

/* 0xa159e3/0xa15a21 + 0xa15ac0/0xa15aff `test ch,ch ; jne` - LOW-BYTE
   loop-continue: the NUL terminator (byte 0) ends the fold; 0x100
   must NOT continue (ch/ah only). */
extern "C" int32_t isaac_sfx_hash_byte_continue(uint32_t c) {
  return (c & 0xffu) != 0u ? 1 : 0;
}

/* 0xa159d5 `test esi,esi ; jne body` - FULL-WORD: hash1(s==0) = 0
   (xor eax,eax ; ret arm). */
extern "C" int32_t isaac_sfx_hash1_null_gate(uint32_t s) {
  return s != 0u ? 1 : 0;
}

/* 0xa159dd `mov eax,0x1505` - hash #1 seed. */
extern "C" uint32_t isaac_sfx_hash1_init(void) {
  return ISAAC_SFX_HASH1_SEED;
}

/* 0xa15a14..0xa15a1c - the djb2 fold step: `shl eax,5 ; add eax,ecx`
   = h*33 (mod 2^32), then `add eax,dl` = + norm. */
extern "C" uint32_t isaac_sfx_hash1_step(uint32_t h, uint32_t c) {
  return h * 33u + isaac_sfx_hash_byte_norm(c);
}

/* 0xa15ab2 `test ecx,ecx ; jne body` - FULL-WORD: hash2(s==0) = 0. */
extern "C" int32_t isaac_sfx_hash2_null_gate(uint32_t s) {
  return s != 0u ? 1 : 0;
}

/* 0xa15abb `mov esi,0x5bb2220e` - hash #2 seed. */
extern "C" uint32_t isaac_sfx_hash2_init(void) {
  return ISAAC_SFX_HASH2_SEED;
}

/* 0xa15af4..0xa15af6 - the FNV-1a fold step: `xor eax,esi ;
   imul esi,eax,0x1000193` (mod 2^32). */
extern "C" uint32_t isaac_sfx_hash2_step(uint32_t h, uint32_t c) {
  return (h ^ isaac_sfx_hash_byte_norm(c)) * ISAAC_SFX_HASH2_PRIME;
}

ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_hash_byte_norm, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_hash_byte_continue, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_hash1_null_gate, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_hash1_init, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_hash1_step, 2);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_hash2_null_gate, 1);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_hash2_init, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_hash2_step, 2);

ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_hash_byte_norm);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_hash_byte_continue);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_hash1_null_gate);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_hash1_init);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_hash1_step);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_hash2_null_gate);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_hash2_init);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_hash2_step);

/* ---------- v29: 0x92dbd0 SoundEffect entry destructor (ABI 29) ----------
   See sfx_pure_helpers.h v29 block for the machine trace and census.
   All 14 exports are 0-arg layout/plan getters; no gates (the body is
   straight-line: 0 conditional branches). The two callees
   (0x0040d040 std::string dtor, 0x00aef638 __ehvec_dtor) stay host with
   exact ordering. */

extern "C" uint32_t isaac_sfx_entry_dtor_va(void) {
  return ISAAC_SFX_ENTRY_DTOR_VA_92DBD0;
}

extern "C" uint32_t isaac_sfx_entry_dtor_end_va(void) {
  return ISAAC_SFX_ENTRY_DTOR_END_VA_92DC21;
}

extern "C" uint32_t isaac_sfx_entry_dtor_next_va(void) {
  return ISAAC_SFX_ENTRY_DTOR_NEXT_VA_92DC30;
}

extern "C" uint32_t isaac_sfx_entry_dtor_caller_count(void) {
  return ISAAC_SFX_ENTRY_DTOR_CALLER_COUNT;
}

extern "C" uint32_t isaac_sfx_entry_dtor_string_off(void) {
  return ISAAC_SFX_ENTRY_DTOR_STRING_OFF_1A0;
}

extern "C" uint32_t isaac_sfx_entry_dtor_string_dtor_va(void) {
  return ISAAC_SFX_ENTRY_DTOR_STRING_DTOR_VA_40D040;
}

extern "C" uint32_t isaac_sfx_entry_dtor_voices_off(void) {
  return ISAAC_SFX_ENTRY_DTOR_VOICES_OFF_8;
}

extern "C" uint32_t isaac_sfx_entry_dtor_stride(void) {
  return ISAAC_SFX_ENTRY_DTOR_STRIDE_38;
}

extern "C" uint32_t isaac_sfx_entry_dtor_count(void) {
  return ISAAC_SFX_ENTRY_DTOR_COUNT_7;
}

extern "C" uint32_t isaac_sfx_entry_dtor_slot_dtor_va(void) {
  return ISAAC_SFX_ENTRY_DTOR_SLOT_DTOR_VA_92CF10;
}

extern "C" uint32_t isaac_sfx_entry_dtor_ehvec_va(void) {
  return ISAAC_SFX_ENTRY_DTOR_EHVEC_VA_AEF638;
}

extern "C" uint32_t isaac_sfx_entry_dtor_string_first(void) {
  return ISAAC_SFX_ENTRY_DTOR_ORDER_STRING_FIRST;
}

extern "C" uint32_t isaac_sfx_entry_dtor_guard_initial(void) {
  return ISAAC_SFX_ENTRY_DTOR_SEH_GUARD_INITIAL;
}

extern "C" uint32_t isaac_sfx_entry_dtor_branches(void) {
  return ISAAC_SFX_ENTRY_DTOR_BRANCH_COUNT;
}

ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_entry_dtor_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_entry_dtor_end_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_entry_dtor_next_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_entry_dtor_caller_count, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_entry_dtor_string_off, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_entry_dtor_string_dtor_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_entry_dtor_voices_off, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_entry_dtor_stride, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_entry_dtor_count, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_entry_dtor_slot_dtor_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_entry_dtor_ehvec_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_entry_dtor_string_first, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_entry_dtor_guard_initial, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_entry_dtor_branches, 0);

ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_entry_dtor_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_entry_dtor_end_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_entry_dtor_next_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_entry_dtor_caller_count);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_entry_dtor_string_off);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_entry_dtor_string_dtor_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_entry_dtor_voices_off);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_entry_dtor_stride);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_entry_dtor_count);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_entry_dtor_slot_dtor_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_entry_dtor_ehvec_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_entry_dtor_string_first);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_entry_dtor_guard_initial);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_entry_dtor_branches);

/* ---------- v30: 0x92e620 Play-ducking wrapper (ABI 30) ----------
   See sfx_pure_helpers.h v30 block for the machine trace, decision tree
   and census. All 37 exports are 0-arg uint32_t getters (no byte gates:
   the body's only gates are the comiss float compare vs the 0.01f
   threshold and the is_playing AL result). The five arm callees stay
   host with exact arities (is_playing/stop ret 4, set_volume/set_pitch
   ret 8, pre-play C3, Play ret 0x18). */

extern "C" uint32_t isaac_sfx_duck_va(void) {
  return ISAAC_SFX_DUCK_VA_92E620;
}

extern "C" uint32_t isaac_sfx_duck_end_va(void) {
  return ISAAC_SFX_DUCK_END_VA_92E6D3;
}

extern "C" uint32_t isaac_sfx_duck_first_ret_va(void) {
  return ISAAC_SFX_DUCK_FIRST_RET_VA_92E653;
}

extern "C" uint32_t isaac_sfx_duck_next_va(void) {
  return ISAAC_SFX_DUCK_NEXT_VA_92E6E0;
}

extern "C" uint32_t isaac_sfx_duck_caller_count(void) {
  return ISAAC_SFX_DUCK_CALLER_COUNT;
}

extern "C" uint32_t isaac_sfx_duck_imm32_ref1_va(void) {
  return ISAAC_SFX_DUCK_IMM32_REF1_VA_86DAF1;
}

extern "C" uint32_t isaac_sfx_duck_imm32_ref2_va(void) {
  return ISAAC_SFX_DUCK_IMM32_REF2_VA_89564A;
}

extern "C" uint32_t isaac_sfx_duck_threshold_va(void) {
  return ISAAC_SFX_DUCK_THRESHOLD_VA_BAA06C;
}

extern "C" uint32_t isaac_sfx_duck_threshold_bits(void) {
  return ISAAC_SFX_DUCK_THRESHOLD_BITS_3C23D70A;
}

extern "C" uint32_t isaac_sfx_duck_id_arg_off(void) {
  return ISAAC_SFX_DUCK_ID_ARG_OFF_8;
}

extern "C" uint32_t isaac_sfx_duck_vol_arg_off(void) {
  return ISAAC_SFX_DUCK_VOL_ARG_OFF_C;
}

extern "C" uint32_t isaac_sfx_duck_pitch_arg_off(void) {
  return ISAAC_SFX_DUCK_PITCH_ARG_OFF_10;
}

extern "C" uint32_t isaac_sfx_duck_stack_args(void) {
  return ISAAC_SFX_DUCK_STACK_ARGS_3;
}

extern "C" uint32_t isaac_sfx_duck_arm_silent_va(void) {
  return ISAAC_SFX_DUCK_ARM_SILENT_VA_92E63A;
}

extern "C" uint32_t isaac_sfx_duck_arm_audible_va(void) {
  return ISAAC_SFX_DUCK_ARM_AUDIBLE_VA_92E656;
}

extern "C" uint32_t isaac_sfx_duck_arm_play_va(void) {
  return ISAAC_SFX_DUCK_ARM_PLAY_VA_92E68C;
}

extern "C" uint32_t isaac_sfx_duck_gate_audible_gt(void) {
  return ISAAC_SFX_DUCK_GATE_AUDIBLE_GT;
}

extern "C" uint32_t isaac_sfx_duck_shared_id_push_va(void) {
  return ISAAC_SFX_DUCK_SHARED_ID_PUSH_VA_92E637;
}

extern "C" uint32_t isaac_sfx_duck_silent_stop_when_playing(void) {
  return ISAAC_SFX_DUCK_SILENT_STOP_WHEN_PLAYING;
}

extern "C" uint32_t isaac_sfx_duck_silent_idle_exit_va(void) {
  return ISAAC_SFX_DUCK_SILENT_IDLE_EXIT_VA_92E6CF;
}

extern "C" uint32_t isaac_sfx_duck_audible_adjust_when_playing(void) {
  return ISAAC_SFX_DUCK_AUDIBLE_ADJUST_WHEN_PLAYING;
}

extern "C" uint32_t isaac_sfx_duck_volume_before_pitch(void) {
  return ISAAC_SFX_DUCK_VOLUME_BEFORE_PITCH;
}

extern "C" uint32_t isaac_sfx_duck_audible_play_when_idle(void) {
  return ISAAC_SFX_DUCK_AUDIBLE_PLAY_WHEN_IDLE;
}

extern "C" uint32_t isaac_sfx_duck_pre_play_va(void) {
  return ISAAC_SFX_DUCK_PRE_PLAY_VA_956780;
}

extern "C" uint32_t isaac_sfx_duck_pre_slot_off(void) {
  return ISAAC_SFX_DUCK_PRE_SLOT_OFF_8;
}

extern "C" uint32_t isaac_sfx_duck_play_root_va(void) {
  return ISAAC_SFX_DUCK_PLAY_ROOT_VA_C7169C;
}

extern "C" uint32_t isaac_sfx_duck_play_recv_off(void) {
  return ISAAC_SFX_DUCK_PLAY_RECV_OFF_2A324;
}

extern "C" uint32_t isaac_sfx_duck_play_va(void) {
  return ISAAC_SFX_DUCK_PLAY_VA_92DC30;
}

extern "C" uint32_t isaac_sfx_duck_play_arg3(void) {
  return ISAAC_SFX_DUCK_PLAY_ARG3_IMM_2;
}

extern "C" uint32_t isaac_sfx_duck_play_arg4(void) {
  return ISAAC_SFX_DUCK_PLAY_ARG4_IMM_1;
}

extern "C" uint32_t isaac_sfx_duck_play_arg6(void) {
  return ISAAC_SFX_DUCK_PLAY_ARG6_IMM_0;
}

extern "C" uint32_t isaac_sfx_duck_play_stack_args(void) {
  return ISAAC_SFX_DUCK_PLAY_STACK_ARGS_6;
}

extern "C" uint32_t isaac_sfx_duck_is_playing_va(void) {
  return ISAAC_SFX_DUCK_IS_PLAYING_VA_92E560;
}

extern "C" uint32_t isaac_sfx_duck_stop_va(void) {
  return ISAAC_SFX_DUCK_STOP_VA_92E230;
}

extern "C" uint32_t isaac_sfx_duck_set_volume_va(void) {
  return ISAAC_SFX_DUCK_SET_VOLUME_VA_92DF40;
}

extern "C" uint32_t isaac_sfx_duck_set_pitch_va(void) {
  return ISAAC_SFX_DUCK_SET_PITCH_VA_92E050;
}

extern "C" uint32_t isaac_sfx_duck_branches(void) {
  return ISAAC_SFX_DUCK_BRANCH_COUNT_3;
}

ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_duck_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_duck_end_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_duck_first_ret_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_duck_next_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_duck_caller_count, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_duck_imm32_ref1_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_duck_imm32_ref2_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_duck_threshold_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_duck_threshold_bits, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_duck_id_arg_off, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_duck_vol_arg_off, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_duck_pitch_arg_off, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_duck_stack_args, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_duck_arm_silent_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_duck_arm_audible_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_duck_arm_play_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_duck_gate_audible_gt, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_duck_shared_id_push_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_duck_silent_stop_when_playing, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_duck_silent_idle_exit_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_duck_audible_adjust_when_playing, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_duck_volume_before_pitch, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_duck_audible_play_when_idle, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_duck_pre_play_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_duck_pre_slot_off, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_duck_play_root_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_duck_play_recv_off, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_duck_play_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_duck_play_arg3, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_duck_play_arg4, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_duck_play_arg6, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_duck_play_stack_args, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_duck_is_playing_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_duck_stop_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_duck_set_volume_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_duck_set_pitch_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_duck_branches, 0);

ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_duck_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_duck_end_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_duck_first_ret_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_duck_next_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_duck_caller_count);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_duck_imm32_ref1_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_duck_imm32_ref2_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_duck_threshold_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_duck_threshold_bits);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_duck_id_arg_off);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_duck_vol_arg_off);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_duck_pitch_arg_off);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_duck_stack_args);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_duck_arm_silent_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_duck_arm_audible_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_duck_arm_play_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_duck_gate_audible_gt);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_duck_shared_id_push_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_duck_silent_stop_when_playing);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_duck_silent_idle_exit_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_duck_audible_adjust_when_playing);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_duck_volume_before_pitch);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_duck_audible_play_when_idle);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_duck_pre_play_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_duck_pre_slot_off);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_duck_play_root_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_duck_play_recv_off);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_duck_play_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_duck_play_arg3);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_duck_play_arg4);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_duck_play_arg6);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_duck_play_stack_args);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_duck_is_playing_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_duck_stop_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_duck_set_volume_va);
/* ---------- v31: 0x92e120 manager SetPan / 0x92e6e0 GetVolume /
   0x92e750 vector clear+dealloc (wave-23 F14 handoff; ABI 30 -> 31;
   see the header's v31 block for the full machine bodies). All byte
   tests below mask & 0xff on uint32_t inputs - no uint8_t scalars. */

extern "C" uint32_t isaac_sfx_setpan_va(void) {
  return ISAAC_SFX_SETPAN_VA_92E120;
}

extern "C" uint32_t isaac_sfx_setpan_first_ret_va(void) {
  return ISAAC_SFX_SETPAN_FIRST_RET_VA_92E178;
}

extern "C" uint32_t isaac_sfx_setpan_end_va(void) {
  return ISAAC_SFX_SETPAN_END_VA_92E221;
}

extern "C" uint32_t isaac_sfx_setpan_next_va(void) {
  return ISAAC_SFX_SETPAN_NEXT_VA_92E230;
}

extern "C" uint32_t isaac_sfx_setpan_caller_count(void) {
  return ISAAC_SFX_SETPAN_CALLER_COUNT;
}

extern "C" uint32_t isaac_sfx_setpan_caller1_va(void) {
  return ISAAC_SFX_SETPAN_CALLER1_VA_7089BE;
}

extern "C" uint32_t isaac_sfx_setpan_caller2_va(void) {
  return ISAAC_SFX_SETPAN_CALLER2_VA_801D44;
}

extern "C" uint32_t isaac_sfx_setpan_id_arg_off(void) {
  return ISAAC_SFX_SETPAN_ID_ARG_OFF_8;
}

extern "C" uint32_t isaac_sfx_setpan_stack_args(void) {
  return ISAAC_SFX_SETPAN_STACK_ARGS_1;
}

extern "C" uint32_t isaac_sfx_setpan_pan_spill_va(void) {
  return ISAAC_SFX_SETPAN_PAN_SPILL_VA_92E134;
}

extern "C" uint32_t isaac_sfx_setpan_pan_reload_va(void) {
  return ISAAC_SFX_SETPAN_PAN_RELOAD_VA_92E1D2;
}

extern "C" uint32_t isaac_sfx_setpan_pan_store_site(void) {
  return ISAAC_SFX_SETPAN_PAN_STORE_SITE_92E1C4;
}

extern "C" uint32_t isaac_sfx_setpan_pan_field_off(void) {
  return ISAAC_SFX_SETPAN_PAN_FIELD_OFF_10;
}

extern "C" uint32_t isaac_sfx_setpan_probe_slot(void) {
  return ISAAC_SFX_SETPAN_PROBE_SLOT_38;
}

extern "C" uint32_t isaac_sfx_setpan_count_slot(void) {
  return ISAAC_SFX_SETPAN_COUNT_SLOT_60;
}

extern "C" uint32_t isaac_sfx_setpan_set_slot(void) {
  return ISAAC_SFX_SETPAN_SET_SLOT_50;
}

extern "C" uint32_t isaac_sfx_setpan_warn_site(void) {
  return ISAAC_SFX_SETPAN_WARN_SITE_92E1F4;
}

extern "C" uint32_t isaac_sfx_setpan_warn_level(void) {
  return ISAAC_SFX_SETPAN_WARN_LOG_LEVEL_4;
}

extern "C" uint32_t isaac_sfx_setpan_warn_str_va(void) {
  return ISAAC_SFX_SETPAN_WARN_STR_VA_B9C3E0;
}

extern "C" uint32_t isaac_sfx_setpan_warn_arg_off(void) {
  return ISAAC_SFX_SETPAN_WARN_ARG_OFF_C;
}

extern "C" uint32_t isaac_sfx_setpan_neutral_xorps_va(void) {
  return ISAAC_SFX_SETPAN_NEUTRAL_XORPS_VA_92E1DC;
}

extern "C" uint32_t isaac_sfx_setpan_lacks_floor(void) {
  return ISAAC_SFX_SETPAN_LACKS_FLOOR;
}

extern "C" uint32_t isaac_sfx_setpan_voice_bound_reload(void) {
  return ISAAC_SFX_SETPAN_VOICE_BOUND_RELOAD;
}

extern "C" uint32_t isaac_sfx_setpan_branches(void) {
  return ISAAC_SFX_SETPAN_BRANCH_COUNT_13;
}

extern "C" int32_t isaac_sfx_setpan_voice_enter(int32_t channel_null,
                                                uint32_t pending09,
                                                uint32_t probe1,
                                                uint32_t probe2) {
  /* 0x92e190..0x92e1bb: `test ecx,ecx ; je skip` (full word), then the
     two vtbl[0x38] probes - BOTH `test al,al` LOW-BYTE gates - and the
     `cmp byte [esi+9],al` pending-after compare. Same decision as the
     v2 is-playing per-voice law; the byte masks are pinned here (a
     0x100 probe drive answers "no", matching `test al,al`). */
  if (channel_null != 0) {
    return 0;
  }
  if ((probe2 & 0xffu) != 0u) {
    return 1;
  }
  const uint32_t pending = static_cast<uint32_t>(pending09 & 0xffu);
  if (pending == 0u) {
    return 0;
  }
  return (probe1 & 0xffu) != 0u ? 0 : 1;
}

extern "C" int32_t isaac_sfx_setpan_pending_clear(int32_t channel_null,
                                                  uint32_t pending09,
                                                  uint32_t probe1) {
  /* 0x92e196 `cmp byte [esi+9],0 ; je 0x92e1ab` + 0x92e1a3 `test al,al
     ; je 0x92e1ab` + 0x92e1a7 `mov byte [esi+9],0`. LOW-BYTE gates. */
  if (channel_null != 0) {
    return 0;
  }
  if ((pending09 & 0xffu) == 0u) {
    return 0;
  }
  return (probe1 & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_sfx_setpan_pan_action(int32_t channel_count,
                                               uint32_t pan_bits) {
  /* Island 0x92e1d7..0x92e1e6: `cmp eax,1 ; jle` (SIGNED count <= 1),
     then xorps +0.0 / ucomiss / lahf / test ah,0x44 / jnp - SET iff
     pan (from its spill-slot dword) is ORDERED EQUAL to +0.0 (+/-0.0);
     NaN and every nonzero ordered pan WARN. Decision-identical to
     isaac_sfx_channel_pan_action(0, count, pan) - the v2 wrapper
     island re-verified on this body; consumed by reference with
     channel_null = 0 (the null arm lives in the loop dispatch). */
  return isaac_sfx_channel_pan_action(0, channel_count, f32_bits(pan_bits));
}

extern "C" void isaac_sfx_setpan_voice_plan(int32_t channel_null,
                                            uint32_t pending09,
                                            uint32_t probe1,
                                            uint32_t probe2,
                                            int32_t channel_count,
                                            uint32_t pan_bits,
                                            IsaacSfxSetPanVoicePlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t enter =
      isaac_sfx_setpan_voice_enter(channel_null, pending09, probe1, probe2);
  out->enter = enter;
  out->pending_clear =
      isaac_sfx_setpan_pending_clear(channel_null, pending09, probe1);
  /* The wrapper pan store (0x92e1c4 movss [esi+0x10],xmm0) runs ONLY
     on the enter path - unlike the v2 wrapper 0x00a2ac20 which stores
     BEFORE the null test (store_skips_inactive divergence, pinned). */
  out->pan_stored = enter;
  out->stored_pan_bits = pan_bits;
  if (enter != 0) {
    const int32_t action =
        isaac_sfx_setpan_pan_action(channel_count, pan_bits);
    out->action = action;
    out->warn_log_needed = action == ISAAC_SFX_PAN_ACTION_WARN ? 1 : 0;
    out->device_call_needed = action == ISAAC_SFX_PAN_ACTION_SET ? 1 : 0;
  } else {
    out->action = ISAAC_SFX_PAN_ACTION_NONE;
    out->warn_log_needed = 0;
    out->device_call_needed = 0;
  }
}

extern "C" uint32_t isaac_sfx_getvolume_va(void) {
  return ISAAC_SFX_GETVOLUME_VA_92E6E0;
}

extern "C" uint32_t isaac_sfx_getvolume_first_ret_va(void) {
  return ISAAC_SFX_GETVOLUME_FIRST_RET_VA_92E72C;
}

extern "C" uint32_t isaac_sfx_getvolume_end_va(void) {
  return ISAAC_SFX_GETVOLUME_END_VA_92E74B;
}

extern "C" uint32_t isaac_sfx_getvolume_next_va(void) {
  return ISAAC_SFX_GETVOLUME_NEXT_VA_92E750;
}

extern "C" uint32_t isaac_sfx_getvolume_caller_count(void) {
  return ISAAC_SFX_GETVOLUME_CALLER_COUNT;
}

extern "C" uint32_t isaac_sfx_getvolume_imm32_ref1_va(void) {
  return ISAAC_SFX_GETVOLUME_IMM32_REF1_VA_86DB02;
}

extern "C" uint32_t isaac_sfx_getvolume_imm32_ref2_va(void) {
  return ISAAC_SFX_GETVOLUME_IMM32_REF2_VA_8956AA;
}

extern "C" uint32_t isaac_sfx_getvolume_id_arg_off(void) {
  return ISAAC_SFX_GETVOLUME_ID_ARG_OFF_8;
}

extern "C" uint32_t isaac_sfx_getvolume_stack_args(void) {
  return ISAAC_SFX_GETVOLUME_STACK_ARGS_1;
}

extern "C" uint32_t isaac_sfx_getvolume_zero_ret_va(void) {
  return ISAAC_SFX_GETVOLUME_ZERO_RET_VA_92E727;
}

extern "C" uint32_t isaac_sfx_getvolume_value_ret_va(void) {
  return ISAAC_SFX_GETVOLUME_VALUE_RET_VA_92E742;
}

extern "C" uint32_t isaac_sfx_getvolume_base_off(void) {
  return ISAAC_SFX_GETVOLUME_BASE_OFF_194;
}

extern "C" uint32_t isaac_sfx_getvolume_is_playing_site(void) {
  return ISAAC_SFX_GETVOLUME_IS_PLAYING_SITE_92E739;
}

extern "C" uint32_t isaac_sfx_getvolume_branches(void) {
  return ISAAC_SFX_GETVOLUME_BRANCH_COUNT_5;
}

extern "C" void isaac_sfx_getvolume_plan(int32_t id,
                                         int32_t span_bytes,
                                         uint32_t voices_190,
                                         uint32_t enabled_198,
                                         uint32_t playing_al,
                                         IsaacSfxGetVolumePlan* out) {
  if (out == nullptr) {
    return;
  }
  out->base_volume_off = ISAAC_SFX_GETVOLUME_BASE_OFF_194;
  /* 0x92e6e8 test edi,edi ; js 0x92e727 + 0x92e702 cmp edi,count ;
     jge 0x92e727: BOTH bounds silent (no warn) - the getter DOES have
     the floor the SetPan gate lacks. */
  if (id < 0 || id >= entry_count_impl(span_bytes)) {
    out->gate_kind = ISAAC_SFX_GATE_MISS;
    out->warn_log_needed = 0;
    out->is_playing_gate_ran = 0;
    out->returns_base_volume = 0;
    return;
  }
  /* 0x92e70e cmp dword [esi+0x190],0 ; ja 0x92e72f - UNSIGNED voices
     > 0, else the NO_SAMPLES warn (fmt 0xb7b1fc, level 1, arg id) THEN
     the +0.0 return. */
  if (voices_190 == 0u) {
    out->gate_kind = ISAAC_SFX_GATE_NO_SAMPLES;
    out->warn_log_needed = 1;
    out->is_playing_gate_ran = 0;
    out->returns_base_volume = 0;
    return;
  }
  /* 0x92e72f cmp byte [esi+0x198],0 ; je 0x92e727 - LOW-BYTE, silent. */
  if (low_byte(enabled_198) == 0u) {
    out->gate_kind = ISAAC_SFX_GATE_DISABLED;
    out->warn_log_needed = 0;
    out->is_playing_gate_ran = 0;
    out->returns_base_volume = 0;
    return;
  }
  out->gate_kind = ISAAC_SFX_GATE_LIVE;
  out->warn_log_needed = 0;
  /* 0x92e739 call 0x92e560 (is_playing, ret 4) then 0x92e73e test
     al,al ; je 0x92e727 - LOW-BYTE gate: false -> +0.0, true -> fld
     [esi+0x194]. */
  out->is_playing_gate_ran = 1;
  out->returns_base_volume = low_byte(playing_al) != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_sfx_clearvec_va(void) {
  return ISAAC_SFX_CLEARVEC_VA_92E750;
}

extern "C" uint32_t isaac_sfx_clearvec_end_va(void) {
  return ISAAC_SFX_CLEARVEC_END_VA_92E7BE;
}

extern "C" uint32_t isaac_sfx_clearvec_next_va(void) {
  return ISAAC_SFX_CLEARVEC_NEXT_VA_92E7D0;
}

extern "C" uint32_t isaac_sfx_clearvec_caller_count(void) {
  return ISAAC_SFX_CLEARVEC_CALLER_COUNT;
}

extern "C" uint32_t isaac_sfx_clearvec_call_site_va(void) {
  return ISAAC_SFX_CLEARVEC_CALL_SITE_VA_951686;
}

extern "C" uint32_t isaac_sfx_clearvec_jmp_stub_va(void) {
  return ISAAC_SFX_CLEARVEC_JMP_STUB_VA_92CF30;
}

extern "C" uint32_t isaac_sfx_clearvec_stub_inbound_va(void) {
  return ISAAC_SFX_CLEARVEC_STUB_INBOUND_VA_B0BB1D;
}

extern "C" uint32_t isaac_sfx_clearvec_begin_gate_va(void) {
  return ISAAC_SFX_CLEARVEC_BEGIN_GATE_VA_92E755;
}

extern "C" uint32_t isaac_sfx_clearvec_stack_args(void) {
  return ISAAC_SFX_CLEARVEC_STACK_ARGS_0;
}

extern "C" uint32_t isaac_sfx_clearvec_dead_push_arg(void) {
  return ISAAC_SFX_CLEARVEC_DEAD_PUSH_ARG;
}

extern "C" uint32_t isaac_sfx_clearvec_destroy_site(void) {
  return ISAAC_SFX_CLEARVEC_DESTROY_SITE_92E75E;
}

extern "C" uint32_t isaac_sfx_clearvec_zero_stores(void) {
  return ISAAC_SFX_CLEARVEC_ZERO_STORES_3;
}

extern "C" uint32_t isaac_sfx_clearvec_branches(void) {
  return ISAAC_SFX_CLEARVEC_BRANCH_COUNT_3;
}

extern "C" uint32_t isaac_sfx_clear_vec_size(uint32_t cap_bytes,
                                             uint32_t begin_bytes) {
  /* 0x92e770 sub ecx,esi (cap - begin, 32-bit wrap), the shared
     0x094f2095/sar-4 divide, 0x92e77e imul ecx,eax,0x1b8 - the count
     RE-MULTIPLIED (down-rounded, 32-bit wrap). The span is the
     ALLOCATED extent (CAP-begin), not end-begin. */
  const int32_t span = static_cast<int32_t>(cap_bytes - begin_bytes);
  const int32_t count = entry_count_impl(span);
  return static_cast<uint32_t>(count) * ISAAC_SFX_ENTRY_STRIDE;
}

extern "C" void isaac_sfx_clear_vec_free_plan(int32_t begin_nonzero,
                                              uint32_t cap_bytes,
                                              uint32_t begin_bytes,
                                              uint32_t ptr_minus_back,
                                              IsaacSfxClearVecFreePlan* out) {
  if (out == nullptr) {
    return;
  }
  /* 0x92e755 test ecx,ecx ; je 0x92e7bd - FULL-WORD begin==0 gate:
     NOTHING runs (no destroy, no free, no zero stores). */
  if (begin_nonzero == 0) {
    out->destroy_runs = 0;
    out->block_size = 0u;
    out->uses_back_pointer = 0;
    out->free_size = 0u;
    out->slack_checked = 0;
    out->corrupt_fatal = 0;
    out->zero_stores = 0;
    return;
  }
  /* 0x92e75e call 0x92ea80 destroy-range(ecx=begin, edx=end) FIRST
     (host walk; the pushed begin is the DEAD stack arg the plain-ret
     callee ignores, popped at 0x92e76d). */
  out->destroy_runs = 1;
  const uint32_t block_size =
      isaac_sfx_clear_vec_size(cap_bytes, begin_bytes);
  out->block_size = block_size;
  /* The v4 element-block free tail (0x92d2b2 shape; free_needed = 1:
     the begin-null gate already ran): size >= 0x1000 UNSIGNED ->
     back pointer, +0x23 bias, slack = (ptr_minus_back) - 4 > 0x1f
     UNSIGNED -> abort IAT 0xb18894 @ 0x92e7bf. */
  IsaacSfxStringFreePlan tail;
  free_tail_impl(block_size, ptr_minus_back, /*free_needed=*/1, &tail);
  out->uses_back_pointer = tail.uses_back_pointer;
  out->free_size = tail.free_size;
  out->slack_checked = tail.slack_checked;
  out->corrupt_fatal = tail.corrupt_fatal;
  /* 0x92e7a8/ae/b5 mov dword [edi+k],0 - begin := end := cap := 0,
     only on the destroy path. */
  out->zero_stores = ISAAC_SFX_CLEARVEC_ZERO_STORES_3;
}

/* v31 guard rows. */
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_setpan_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_setpan_first_ret_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_setpan_end_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_setpan_next_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_setpan_caller_count, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_setpan_caller1_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_setpan_caller2_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_setpan_id_arg_off, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_setpan_stack_args, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_setpan_pan_spill_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_setpan_pan_reload_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_setpan_pan_store_site, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_setpan_pan_field_off, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_setpan_probe_slot, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_setpan_count_slot, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_setpan_set_slot, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_setpan_warn_site, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_setpan_warn_level, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_setpan_warn_str_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_setpan_warn_arg_off, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_setpan_neutral_xorps_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_setpan_lacks_floor, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_setpan_voice_bound_reload, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_setpan_branches, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_setpan_voice_enter, 4);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_setpan_pending_clear, 3);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_setpan_pan_action, 2);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_setpan_voice_plan, 7);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_getvolume_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_getvolume_first_ret_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_getvolume_end_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_getvolume_next_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_getvolume_caller_count, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_getvolume_imm32_ref1_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_getvolume_imm32_ref2_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_getvolume_id_arg_off, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_getvolume_stack_args, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_getvolume_zero_ret_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_getvolume_value_ret_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_getvolume_base_off, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_getvolume_is_playing_site, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_getvolume_branches, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_getvolume_plan, 6);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_clearvec_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_clearvec_end_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_clearvec_next_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_clearvec_caller_count, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_clearvec_call_site_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_clearvec_jmp_stub_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_clearvec_stub_inbound_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_clearvec_begin_gate_va, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_clearvec_stack_args, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_clearvec_dead_push_arg, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_clearvec_destroy_site, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_clearvec_zero_stores, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_clearvec_branches, 0);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_clear_vec_size, 2);
ISAAC_SFX_GUARD_SEES_PARAMS(isaac_sfx_clear_vec_free_plan, 5);

ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_setpan_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_setpan_first_ret_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_setpan_end_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_setpan_next_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_setpan_caller_count);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_setpan_caller1_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_setpan_caller2_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_setpan_id_arg_off);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_setpan_stack_args);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_setpan_pan_spill_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_setpan_pan_reload_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_setpan_pan_store_site);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_setpan_pan_field_off);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_setpan_probe_slot);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_setpan_count_slot);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_setpan_set_slot);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_setpan_warn_site);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_setpan_warn_level);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_setpan_warn_str_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_setpan_warn_arg_off);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_setpan_neutral_xorps_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_setpan_lacks_floor);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_setpan_voice_bound_reload);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_setpan_branches);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_setpan_voice_enter);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_setpan_pending_clear);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_setpan_pan_action);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_setpan_voice_plan);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_getvolume_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_getvolume_first_ret_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_getvolume_end_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_getvolume_next_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_getvolume_caller_count);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_getvolume_imm32_ref1_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_getvolume_imm32_ref2_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_getvolume_id_arg_off);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_getvolume_stack_args);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_getvolume_zero_ret_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_getvolume_value_ret_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_getvolume_base_off);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_getvolume_is_playing_site);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_getvolume_branches);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_getvolume_plan);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_clearvec_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_clearvec_end_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_clearvec_next_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_clearvec_caller_count);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_clearvec_call_site_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_clearvec_jmp_stub_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_clearvec_stub_inbound_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_clearvec_begin_gate_va);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_clearvec_stack_args);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_clearvec_dead_push_arg);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_clearvec_destroy_site);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_clearvec_zero_stores);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_clearvec_branches);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_clear_vec_size);
ISAAC_SFX_NO_NARROW_PARAMS(isaac_sfx_clear_vec_free_plan);


/* ---------- v38: 0xa2bb10 hook-callable decision layer (wave-31 F4;
   notes sfx-v38-hook) ----------

   The v22 attach-hook BODY: installed into the 0xc7f484 global by
   the wrapper cluster (2 imm32 install sites: 0xa2afeb + 0xa7d53a)
   and dispatched by the family's own islands (28 further flat reads
   of 0xc7f484 image-wide; 0 E8/E9 direct callers). Body
   0xa2bb10..0xa2bc9d, plain ret, ONE stack arg = the pair pointer
   ([pair+0] key, [pair+4] member2). SEH 0xaf12f0. The v35
   map_found / v36 step+island+warn laws are consumed BY REFERENCE at
   their 2nd/3rd bodies; the new laws are the hook body's own gates. */

extern "C" int32_t isaac_sfx_hook_gate_pair1(uint32_t pair1) {
  /* PE 0xa2bb3b `test esi,esi ; je 0xa2bc8d` on [pair+4]: a NULL
     member2 makes the body do NOTHING (no walk/warn/map). FULL
     dword test — 0x100 is a live member2 pointer. */
  return pair1 != 0 ? 1 : 0;
}

extern "C" int32_t isaac_sfx_hook_lock_word_gate(uint32_t b4, uint32_t b5) {
  /* PE 0xa2bb54 `movzx esi, WORD [member2+4]` (re-read AFTER the
     child lock acquire, BEFORE its release) + 0xa2bb5b `cmp esi,1 ;
     jne 0xa2bc8d`: the machine compares SIXTEEN bits to 1 — byte4
     (the v37 lock byte) set AND byte5 clear. The gate is NOT a byte
     gate; both bytes enter through & 0xff as the machine reads them. */
  const uint32_t word = (b4 & 0xffu) | ((b5 & 0xffu) << 8u);
  return word == 1u ? 1 : 0;
}

extern "C" int32_t isaac_sfx_hook_gate_key(uint32_t key) {
  /* PE 0xa2bb69 `test edi,edi ; je 0xa2bbc2` (walk skip; warn still
     runs) and 0xa2bbda `test edi,edi ; je 0xa2bc8d` (map skip). The
     SAME FULL dword test at TWO sites; 0x100 is a live key. */
  return key != 0 ? 1 : 0;
}

extern "C" int32_t isaac_sfx_hook_walk_match(uint32_t entry8, uint32_t key) {
  /* PE 0xa2bb79 `cmp eax,edi ; jne next-entry` on [base+i+8] vs the
     key: FULL dword ==. A match clears [match+0x34] and [entry+8]
     and runs the IAT release pair (0xb18540 + 0xb1854c(entry[0],
     0x1009, 0), host); the walk then CONTINUES (no early exit). */
  return entry8 == key ? 1 : 0;
}

extern "C" int32_t isaac_sfx_hook_walk_continue(uint32_t index) {
  /* PE 0xa2bbb7 `add esi,0xc ; cmp esi,0x300 ; jb 0xa2bb70`: UNSIGNED
     (index + 0xc) < 0x300 with 32-bit wrap. In-reach runs: index
     0,0xc,...,0x2f4 (exactly 64 iterations); index 0x2f4 is the only
     in-reach stop (next == 0x300). The bound is a CONSTANT — not a
     re-read (contrast the Play bound). */
  return (index + 0xcu) < 0x300u ? 1 : 0;
}

extern "C" int32_t isaac_sfx_hook_warn_needed(uint32_t flags) {
  /* PE 0xa2bbc2 `test byte ptr [0xc5aaa4],1 ; jne 0xa2bbda`: warn
     (0xa112c0, level 0x10, fmt 0xb9c450 — the v36 init-walk warn
     consts) runs iff BYTE bit0 of the flags GLOBAL is clear. Same
     semantics as isaac_sfx_init_walk_warn_needed at its second
     body/site/global. */
  return (flags & 0xffu) & 1u ? 0 : 1;
}

extern "C" void isaac_sfx_hook_plan(uint32_t pair1, uint32_t lock_b4,
                                    uint32_t lock_b5, uint32_t key,
                                    uint32_t walk_match_found,
                                    uint32_t flags_global,
                                    uint32_t map_result, uint32_t map_end,
                                    uint32_t node_member_ptr,
                                    uint32_t node_member_key,
                                    uint32_t node_b, uint32_t probe_al,
                                    uint32_t hook,
                                    IsaacSfxHookPlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t pair1_gate = isaac_sfx_hook_gate_pair1(pair1);
  const int32_t lock_word_gate =
      isaac_sfx_hook_lock_word_gate(lock_b4, lock_b5);
  const int32_t body_runs = pair1_gate != 0 && lock_word_gate != 0 ? 1 : 0;
  const int32_t key_gate = isaac_sfx_hook_gate_key(key);
  const int32_t walk_runs = body_runs != 0 && key_gate != 0 ? 1 : 0;
  const int32_t map_runs = walk_runs; /* G6 repeats the key gate */
  const int32_t step = isaac_sfx_init_walk_step(
      map_result == map_end ? 1 : 0, node_member_ptr, node_member_key,
      key, key);
  const int32_t found = step == ISAAC_SFX_INIT_WALK_STEP_FOUND ? 1 : 0;
  const int32_t island = isaac_sfx_init_walk_island_hook(found, node_b,
                                                         probe_al, hook);
  out->pair1_gate = static_cast<uint32_t>(pair1_gate);
  out->lock_word_gate = static_cast<uint32_t>(lock_word_gate);
  out->body_runs = static_cast<uint32_t>(body_runs);
  out->key_gate = static_cast<uint32_t>(key_gate);
  out->walk_runs = static_cast<uint32_t>(walk_runs);
  out->walk_iterations = walk_runs != 0
                             ? ISAAC_SFX_HOOK_TABLE_ITERATIONS
                             : 0u;
  out->walk_match_found = walk_match_found & 1u;
  out->warn_runs = body_runs != 0 && isaac_sfx_hook_warn_needed(flags_global)
                       ? 1u
                       : 0u;
  out->map_runs = static_cast<uint32_t>(map_runs);
  out->map_step = map_runs != 0 ? static_cast<uint32_t>(step)
                                : static_cast<uint32_t>(ISAAC_SFX_HOOK_STEP_MISS);
  out->found_arm_runs = static_cast<uint32_t>(found);
  out->advance_calls =
      step == ISAAC_SFX_INIT_WALK_STEP_ADVANCE ? 1u : 0u;
  out->remove_call_runs = static_cast<uint32_t>(found);
  out->free_runs = static_cast<uint32_t>(found);
  out->island_hook_runs = static_cast<uint32_t>(island);
  out->tail_unlock_runs = static_cast<uint32_t>(map_runs);
  out->map_find_call_runs = static_cast<uint32_t>(map_runs);
}

/* v38 census pins (lea-corrected tooling; see notes sfx-v38-hook). */

extern "C" uint32_t isaac_sfx_hook_end_va(void) {
  return ISAAC_SFX_HOOK_END_VA_A2BC9D;
}

extern "C" uint32_t isaac_sfx_hook_next_va(void) {
  return ISAAC_SFX_HOOK_NEXT_VA_A2BCB0;
}

extern "C" uint32_t isaac_sfx_hook_direct_callers(void) {
  return ISAAC_SFX_HOOK_DIRECT_CALLERS;
}

extern "C" uint32_t isaac_sfx_hook_imm32_refs(void) {
  return ISAAC_SFX_HOOK_IMM32_REFS;
}

extern "C" uint32_t isaac_sfx_hook_install2_site(void) {
  return ISAAC_SFX_HOOK_INSTALL2_SITE;
}

extern "C" uint32_t isaac_sfx_hook_body_insns(void) {
  return ISAAC_SFX_HOOK_BODY_INSNS;
}

extern "C" uint32_t isaac_sfx_hook_seh_handler_va(void) {
  return ISAAC_SFX_HOOK_SEH_HANDLER_VA;
}

extern "C" uint32_t isaac_sfx_hook_stack_args(void) {
  return ISAAC_SFX_HOOK_STACK_ARGS;
}

extern "C" uint32_t isaac_sfx_hook_pair_member2_off(void) {
  return ISAAC_SFX_HOOK_PAIR_MEMBER2_OFF;
}

extern "C" uint32_t isaac_sfx_hook_pair_key_off(void) {
  return ISAAC_SFX_HOOK_PAIR_KEY_OFF;
}

extern "C" uint32_t isaac_sfx_hook_member_lock_word_off(void) {
  return ISAAC_SFX_HOOK_MEMBER_LOCK_WORD_OFF;
}

extern "C" uint32_t isaac_sfx_hook_lock_word_gate_value(void) {
  return ISAAC_SFX_HOOK_LOCK_WORD_GATE_VALUE;
}

extern "C" uint32_t isaac_sfx_hook_key_gate_sites(void) {
  return ISAAC_SFX_HOOK_KEY_GATE_SITES;
}

extern "C" uint32_t isaac_sfx_hook_key_gate_walk_site(void) {
  return ISAAC_SFX_HOOK_KEY_GATE_WALK_SITE;
}

extern "C" uint32_t isaac_sfx_hook_key_gate_map_site(void) {
  return ISAAC_SFX_HOOK_KEY_GATE_MAP_SITE;
}

extern "C" uint32_t isaac_sfx_hook_table_global(void) {
  return ISAAC_SFX_HOOK_TABLE_GLOBAL;
}

extern "C" uint32_t isaac_sfx_hook_table_stride(void) {
  return ISAAC_SFX_HOOK_TABLE_STRIDE;
}

extern "C" uint32_t isaac_sfx_hook_table_bound(void) {
  return ISAAC_SFX_HOOK_TABLE_BOUND;
}

extern "C" uint32_t isaac_sfx_hook_table_iterations(void) {
  return ISAAC_SFX_HOOK_TABLE_ITERATIONS;
}

extern "C" uint32_t isaac_sfx_hook_table_key_off(void) {
  return ISAAC_SFX_HOOK_TABLE_KEY_OFF;
}

extern "C" uint32_t isaac_sfx_hook_table_handle_off(void) {
  return ISAAC_SFX_HOOK_TABLE_HANDLE_OFF;
}

extern "C" uint32_t isaac_sfx_hook_table_reload(void) {
  return ISAAC_SFX_HOOK_TABLE_RELOAD;
}

extern "C" uint32_t isaac_sfx_hook_match_field34_off(void) {
  return ISAAC_SFX_HOOK_MATCH_FIELD34_OFF;
}

extern "C" uint32_t isaac_sfx_hook_match_clears(void) {
  return ISAAC_SFX_HOOK_MATCH_CLEARS;
}

extern "C" uint32_t isaac_sfx_hook_iat_release(void) {
  return ISAAC_SFX_HOOK_IAT_RELEASE_18540;
}

extern "C" uint32_t isaac_sfx_hook_iat_kill(void) {
  return ISAAC_SFX_HOOK_IAT_KILL_1854C;
}

extern "C" uint32_t isaac_sfx_hook_kill_arg1(void) {
  return ISAAC_SFX_HOOK_KILL_ARG1;
}

extern "C" uint32_t isaac_sfx_hook_kill_arg2(void) {
  return ISAAC_SFX_HOOK_KILL_ARG2;
}

extern "C" uint32_t isaac_sfx_hook_iat_call_site1(void) {
  return ISAAC_SFX_HOOK_IAT_CALL_SITE1;
}

extern "C" uint32_t isaac_sfx_hook_iat_call_site2(void) {
  return ISAAC_SFX_HOOK_IAT_CALL_SITE2;
}

extern "C" uint32_t isaac_sfx_hook_flags_global(void) {
  return ISAAC_SFX_HOOK_FLAGS_GLOBAL;
}

extern "C" uint32_t isaac_sfx_hook_warn_site(void) {
  return ISAAC_SFX_HOOK_WARN_SITE;
}

extern "C" uint32_t isaac_sfx_hook_warn_fmt_va(void) {
  return ISAAC_SFX_HOOK_WARN_FMT_VA;
}

extern "C" uint32_t isaac_sfx_hook_warn_level(void) {
  return ISAAC_SFX_HOOK_WARN_LEVEL;
}

extern "C" uint32_t isaac_sfx_hook_map_global(void) {
  return ISAAC_SFX_HOOK_MAP_GLOBAL;
}

extern "C" uint32_t isaac_sfx_hook_map_lock_global(void) {
  return ISAAC_SFX_HOOK_MAP_LOCK_GLOBAL;
}

extern "C" uint32_t isaac_sfx_hook_map_find_site(void) {
  return ISAAC_SFX_HOOK_MAP_FIND_SITE;
}

extern "C" uint32_t isaac_sfx_hook_map_found_site(void) {
  return ISAAC_SFX_HOOK_MAP_FOUND_SITE;
}

extern "C" uint32_t isaac_sfx_hook_map_loop_site(void) {
  return ISAAC_SFX_HOOK_MAP_LOOP_SITE;
}

extern "C" uint32_t isaac_sfx_hook_map_member_off(void) {
  return ISAAC_SFX_HOOK_MAP_MEMBER_OFF;
}

extern "C" uint32_t isaac_sfx_hook_map_key_off(void) {
  return ISAAC_SFX_HOOK_MAP_KEY_OFF;
}

extern "C" uint32_t isaac_sfx_hook_map_remove_site(void) {
  return ISAAC_SFX_HOOK_MAP_REMOVE_SITE;
}

extern "C" uint32_t isaac_sfx_hook_island_site(void) {
  return ISAAC_SFX_HOOK_ISLAND_SITE;
}

extern "C" uint32_t isaac_sfx_hook_island_probe_off(void) {
  return ISAAC_SFX_HOOK_ISLAND_PROBE_OFF;
}

extern "C" uint32_t isaac_sfx_hook_island_target_off(void) {
  return ISAAC_SFX_HOOK_ISLAND_TARGET_OFF;
}

extern "C" uint32_t isaac_sfx_hook_free_size(void) {
  return ISAAC_SFX_HOOK_FREE_SIZE;
}

extern "C" uint32_t isaac_sfx_hook_free_site(void) {
  return ISAAC_SFX_HOOK_FREE_SITE;
}

extern "C" uint32_t isaac_sfx_hook_tail_site(void) {
  return ISAAC_SFX_HOOK_TAIL_SITE;
}

extern "C" uint32_t isaac_sfx_hook_lock_acquire_site(void) {
  return ISAAC_SFX_HOOK_LOCK_ACQUIRE_SITE;
}

extern "C" uint32_t isaac_sfx_hook_lock_release_site(void) {
  return ISAAC_SFX_HOOK_LOCK_RELEASE_SITE;
}

extern "C" uint32_t isaac_sfx_hook_island_self_site(void) {
  return ISAAC_SFX_HOOK_ISLAND_SELF_SITE;
}

/* ---------- v39: 0xa2bcb0 list-clear decision seams + the
   0x92e7d0/0x92e7f0 declared destroy/free wrappers (wave-32 F4;
   notes sfx-v39-listclear) ----------

   The v38 handoff's two open rows. List clear 0xa2bcb0..0xa2bd4c
   (ret 8, thiscall this + TWO stack args; SEH 0xaf1380; 5 E8
   callers re-censused incl. the SELF recursion 0xa2bcec): the byte
   gate on node[0xd] == 0 (TWO sites), the recursion on node[8]
   FIRST with the original arg1, the island = the v36 island law at
   body #4 (probe node+0x18 FULL dword, vtbl[0xc] LOW-BYTE result,
   hook 0xc7f484 FULL dword -> hook(&node+0x14)) and the
   UNCONDITIONAL free(node, 0x1c). Wrappers: 0x92e7d0 forwards
   UNCONDITIONALLY to the v4 host destroy-range 0x92ea80; 0x92e7f0
   is the v4 sfxBlockFreePlan tail at its next body fed size =
   imul(count, 0x1b8). */

extern "C" int32_t isaac_sfx_list_clear_entry_gate(uint32_t flag_byte) {
  /* PE 0xa2bcde `cmp byte [esi+0xd],0 ; jne 0xa2bd3b` and, on the
     loop, 0xa2bd35 `cmp byte [esi+0xd],0 ; je 0xa2bce4`: the node's
     [0xd] flag byte == 0 walks the node, != 0 skips straight to the
     tail. BYTE read — wide inputs are masked & 0xff as `cmp byte`
     does; 0x100 is the byte 0 and gates 1. */
  return (flag_byte & 0xffu) == 0u ? 1 : 0;
}

extern "C" int32_t isaac_sfx_list_clear_island_hook(uint32_t probe_ptr,
                                                    uint32_t probe_al,
                                                    uint32_t hook) {
  /* PE 0xa2bcff: probe ptr = [ebx+4] = pair[4] = node+0x18;
     `test ecx,ecx ; je` (FULL dword), `call [vtbl+0xc]` then
     `test al,al ; je` (LOW-BYTE), `mov eax,[0xc7f484] ;
     test eax,eax ; je` (FULL dword) -> hook(&node+0x14). The v36
     island law at its FOURTH body; same shape and offsets as the
     v38 hook island (body #3). */
  if (probe_ptr == 0 || (probe_al & 0xffu) == 0 || hook == 0) {
    return 0;
  }
  return 1;
}

extern "C" void isaac_sfx_list_clear_plan(uint32_t flag_byte,
                                          uint32_t next_flag_byte,
                                          uint32_t probe_ptr,
                                          uint32_t probe_al,
                                          uint32_t hook,
                                          IsaacSfxListClearPlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t entry_gate = isaac_sfx_list_clear_entry_gate(flag_byte);
  const int32_t walk_runs = entry_gate;
  const int32_t island =
      walk_runs != 0 ? isaac_sfx_list_clear_island_hook(probe_ptr, probe_al,
                                                        hook)
                     : 0;
  out->entry_gate = static_cast<uint32_t>(entry_gate);
  out->walk_runs = static_cast<uint32_t>(walk_runs);
  out->recursion_runs = static_cast<uint32_t>(walk_runs);
  out->probe_ptr_gate =
      walk_runs != 0 && probe_ptr != 0 ? 1u : 0u;
  out->probe_al_gate =
      walk_runs != 0 && (probe_al & 0xffu) != 0 ? 1u : 0u;
  out->hook_gate = walk_runs != 0 && hook != 0 ? 1u : 0u;
  out->island_hook_runs = static_cast<uint32_t>(island);
  /* free(node, 0x1c) at 0xa2bd20 is UNCONDITIONAL for every walked
     node — NOT gated by the island. */
  out->free_runs = static_cast<uint32_t>(walk_runs);
  out->free_size = ISAAC_SFX_LIST_CLEAR_FREE_SIZE;
  out->next_continue = walk_runs != 0 &&
                               isaac_sfx_list_clear_entry_gate(next_flag_byte)
                           ? 1u
                           : 0u;
  out->stack_args = ISAAC_SFX_LIST_CLEAR_STACK_ARGS;
  out->ret_imm = ISAAC_SFX_LIST_CLEAR_RET_IMM;
}

extern "C" void isaac_sfx_destroy_wrapper_plan(uint32_t begin,
                                               uint32_t end,
                                               IsaacSfxDestroyWrapperPlan* out) {
  if (out == nullptr) {
    return;
  }
  /* PE 0x92e7d3 mov edx,[ebp+0xc] ; 0x92e7d7 mov ecx,[ebp+8] ;
     0x92e7da call 0x92ea80 ; add esp,4 ; ret 8. No branch at all:
     the wrapper is an UNCONDITIONAL forward (the begin==end gate is
     inside 0x92ea80 at 0x92eaa6). destroy_runs is the constant 1. */
  out->destroy_runs = 1u;
  out->begin_passthrough = begin;
  out->end_passthrough = end;
  out->forward_target = ISAAC_SFX_DESTROY_WRAP_FORWARD_TARGET_92EA80;
  out->stack_args = ISAAC_SFX_DESTROY_WRAP_STACK_ARGS;
  out->ret_imm = ISAAC_SFX_DESTROY_WRAP_RET_IMM;
}

extern "C" uint32_t isaac_sfx_free_wrapper_size(uint32_t count) {
  /* PE 0x92e7f3 `imul ecx,[ebp+0xc],0x1b8`: size = count * 0x1b8,
     32-bit wrap (the v4 entry stride). */
  return count * ISAAC_SFX_FREE_WRAP_STRIDE_1B8;
}

extern "C" void isaac_sfx_free_wrapper_plan(uint32_t count,
                                            uint32_t ptr_minus_back,
                                            IsaacSfxFreeWrapperPlan* out) {
  if (out == nullptr) {
    return;
  }
  /* PE 0x92e7f0: the v4 sfxBlockFreePlan tail at its NEXT body, fed
     the imul'd size: `cmp size,0x1000 ; jb` UNSIGNED -> free(begin,
     size) directly (0x92e819); big arm: back = [begin-4], size +=
     0x23, slack = (begin-back)-4, `cmp slack,0x1f ; ja` UNSIGNED ->
     abort [0xb18894] at 0x92e825, else eax = back and free(back,
     size'). isaac_sfx_block_free_plan is consumed BY REFERENCE. */
  const uint32_t size = isaac_sfx_free_wrapper_size(count);
  IsaacSfxStringFreePlan sfp;
  isaac_sfx_block_free_plan(size, ptr_minus_back, &sfp);
  out->size = size;
  out->big = sfp.uses_back_pointer;
  out->uses_back_pointer = static_cast<uint32_t>(sfp.uses_back_pointer);
  out->slack_checked = static_cast<uint32_t>(sfp.slack_checked);
  out->corrupt_fatal = static_cast<uint32_t>(sfp.corrupt_fatal);
  out->free_size = sfp.free_size;
  out->free_needed = static_cast<uint32_t>(sfp.free_needed);
  out->stack_args = ISAAC_SFX_FREE_WRAP_STACK_ARGS;
  out->ret_imm = ISAAC_SFX_FREE_WRAP_RET_IMM;
}

/* v39 census pins (lea-corrected tooling; see notes sfx-v39-listclear). */

extern "C" uint32_t isaac_sfx_list_clear_end_va(void) {
  return ISAAC_SFX_LIST_CLEAR_END_VA_A2BD4C;
}

extern "C" uint32_t isaac_sfx_list_clear_next_va(void) {
  return ISAAC_SFX_LIST_CLEAR_NEXT_VA_A2BD60;
}

/* the 5-caller census getter is the v37 export
   isaac_sfx_list_clear_callers (defined at 0x4782) — no duplicate. */
extern "C" uint32_t isaac_sfx_list_clear_caller1_va(void) {
  return ISAAC_SFX_LIST_CLEAR_CALLER1_VA_A2AFB1;
}

extern "C" uint32_t isaac_sfx_list_clear_caller2_va(void) {
  return ISAAC_SFX_LIST_CLEAR_CALLER2_VA_A2B01B;
}

extern "C" uint32_t isaac_sfx_list_clear_self_site(void) {
  return ISAAC_SFX_LIST_CLEAR_SELF_SITE_A2BCEC;
}

extern "C" uint32_t isaac_sfx_list_clear_caller4_va(void) {
  return ISAAC_SFX_LIST_CLEAR_CALLER4_VA_A7D599;
}

extern "C" uint32_t isaac_sfx_list_clear_caller5_va(void) {
  return ISAAC_SFX_LIST_CLEAR_CALLER5_VA_A9E61E;
}

extern "C" uint32_t isaac_sfx_list_clear_imm32_refs(void) {
  return ISAAC_SFX_LIST_CLEAR_IMM32_REFS;
}

extern "C" uint32_t isaac_sfx_list_clear_body_insns(void) {
  return ISAAC_SFX_LIST_CLEAR_BODY_INSNS;
}

extern "C" uint32_t isaac_sfx_list_clear_seh_handler_va(void) {
  return ISAAC_SFX_LIST_CLEAR_SEH_HANDLER_VA;
}

extern "C" uint32_t isaac_sfx_list_clear_stack_args(void) {
  return ISAAC_SFX_LIST_CLEAR_STACK_ARGS;
}

extern "C" uint32_t isaac_sfx_list_clear_ret_imm(void) {
  return ISAAC_SFX_LIST_CLEAR_RET_IMM;
}

extern "C" uint32_t isaac_sfx_list_clear_node_next_off(void) {
  return ISAAC_SFX_LIST_CLEAR_NODE_NEXT_OFF;
}

extern "C" uint32_t isaac_sfx_list_clear_node_child_off(void) {
  return ISAAC_SFX_LIST_CLEAR_NODE_CHILD_OFF;
}

extern "C" uint32_t isaac_sfx_list_clear_node_flag_byte_off(void) {
  return ISAAC_SFX_LIST_CLEAR_NODE_FLAG_BYTE_OFF;
}

extern "C" uint32_t isaac_sfx_list_clear_pair_off(void) {
  return ISAAC_SFX_LIST_CLEAR_PAIR_OFF;
}

extern "C" uint32_t isaac_sfx_list_clear_probe_off(void) {
  return ISAAC_SFX_LIST_CLEAR_PROBE_OFF;
}

extern "C" uint32_t isaac_sfx_list_clear_entry_gate_sites(void) {
  return ISAAC_SFX_LIST_CLEAR_ENTRY_GATE_SITES;
}

extern "C" uint32_t isaac_sfx_list_clear_entry_gate_site1(void) {
  return ISAAC_SFX_LIST_CLEAR_ENTRY_GATE_SITE_1;
}

extern "C" uint32_t isaac_sfx_list_clear_entry_gate_site2(void) {
  return ISAAC_SFX_LIST_CLEAR_ENTRY_GATE_SITE_2;
}

extern "C" uint32_t isaac_sfx_list_clear_recursion_site(void) {
  return ISAAC_SFX_LIST_CLEAR_RECURSION_SITE;
}

extern "C" uint32_t isaac_sfx_list_clear_island_site(void) {
  return ISAAC_SFX_LIST_CLEAR_ISLAND_SITE;
}

extern "C" uint32_t isaac_sfx_list_clear_hook_read_site(void) {
  return ISAAC_SFX_LIST_CLEAR_HOOK_READ_SITE;
}

extern "C" uint32_t isaac_sfx_list_clear_free_size(void) {
  return ISAAC_SFX_LIST_CLEAR_FREE_SIZE;
}

extern "C" uint32_t isaac_sfx_list_clear_free_site(void) {
  return ISAAC_SFX_LIST_CLEAR_FREE_SITE;
}

extern "C" uint32_t isaac_sfx_list_clear_loop_site(void) {
  return ISAAC_SFX_LIST_CLEAR_LOOP_SITE;
}

extern "C" uint32_t isaac_sfx_destroy_wrap_end_va(void) {
  return ISAAC_SFX_DESTROY_WRAP_END_VA_92E7E3;
}

extern "C" uint32_t isaac_sfx_destroy_wrap_next_va(void) {
  return ISAAC_SFX_DESTROY_WRAP_NEXT_VA_92E7F0;
}

extern "C" uint32_t isaac_sfx_destroy_wrap_callers(void) {
  return ISAAC_SFX_DESTROY_WRAP_CALLERS;
}

extern "C" uint32_t isaac_sfx_destroy_wrap_caller1_va(void) {
  return ISAAC_SFX_DESTROY_WRAP_CALLER1_VA_92EA54;
}

extern "C" uint32_t isaac_sfx_destroy_wrap_caller2_va(void) {
  return ISAAC_SFX_DESTROY_WRAP_CALLER2_VA_92EF4F;
}

extern "C" uint32_t isaac_sfx_destroy_wrap_imm32_refs(void) {
  return ISAAC_SFX_DESTROY_WRAP_IMM32_REFS;
}

extern "C" uint32_t isaac_sfx_destroy_wrap_body_insns(void) {
  return ISAAC_SFX_DESTROY_WRAP_BODY_INSNS;
}

extern "C" uint32_t isaac_sfx_destroy_wrap_forward_target(void) {
  return ISAAC_SFX_DESTROY_WRAP_FORWARD_TARGET_92EA80;
}

extern "C" uint32_t isaac_sfx_destroy_wrap_stack_args(void) {
  return ISAAC_SFX_DESTROY_WRAP_STACK_ARGS;
}

extern "C" uint32_t isaac_sfx_destroy_wrap_ret_imm(void) {
  return ISAAC_SFX_DESTROY_WRAP_RET_IMM;
}

extern "C" uint32_t isaac_sfx_destroy_range_callers(void) {
  return ISAAC_SFX_DESTROY_RANGE_CALLERS;
}

extern "C" uint32_t isaac_sfx_free_wrap_end_va(void) {
  return ISAAC_SFX_FREE_WRAP_END_VA_92E822;
}

extern "C" uint32_t isaac_sfx_free_wrap_abort_site(void) {
  return ISAAC_SFX_FREE_WRAP_ABORT_SITE_92E825;
}

extern "C" uint32_t isaac_sfx_free_wrap_next_va(void) {
  return ISAAC_SFX_FREE_WRAP_NEXT_VA_92E830;
}

extern "C" uint32_t isaac_sfx_free_wrap_callers(void) {
  return ISAAC_SFX_FREE_WRAP_CALLERS;
}

extern "C" uint32_t isaac_sfx_free_wrap_caller1_va(void) {
  return ISAAC_SFX_FREE_WRAP_CALLER1_VA_92EA5F;
}

extern "C" uint32_t isaac_sfx_free_wrap_caller2_va(void) {
  return ISAAC_SFX_FREE_WRAP_CALLER2_VA_92EF5A;
}

extern "C" uint32_t isaac_sfx_free_wrap_imm32_refs(void) {
  return ISAAC_SFX_FREE_WRAP_IMM32_REFS;
}

extern "C" uint32_t isaac_sfx_free_wrap_body_insns(void) {
  return ISAAC_SFX_FREE_WRAP_BODY_INSNS;
}

extern "C" uint32_t isaac_sfx_free_wrap_stack_args(void) {
  return ISAAC_SFX_FREE_WRAP_STACK_ARGS;
}

extern "C" uint32_t isaac_sfx_free_wrap_ret_imm(void) {
  return ISAAC_SFX_FREE_WRAP_RET_IMM;
}

extern "C" uint32_t isaac_sfx_free_wrap_stride(void) {
  return ISAAC_SFX_FREE_WRAP_STRIDE_1B8;
}

extern "C" uint32_t isaac_sfx_free_wrap_big_threshold(void) {
  return ISAAC_SFX_FREE_WRAP_BIG_THRESHOLD;
}

extern "C" uint32_t isaac_sfx_free_wrap_big_bias(void) {
  return ISAAC_SFX_FREE_WRAP_BIG_BIAS;
}

extern "C" uint32_t isaac_sfx_free_wrap_slack_max(void) {
  return ISAAC_SFX_FREE_WRAP_SLACK_MAX;
}

extern "C" uint32_t isaac_sfx_free_wrap_abort_iat_va(void) {
  return ISAAC_SFX_FREE_WRAP_ABORT_IAT_VA;
}

/* ---------- v40: 0xa2bd60 copy-pair helper (+ its 0xa2bd90 insert
   body) and the 0x92e900 vector grow body's decision seams (wave-33
   F4; notes sfx-v40-pairgrow; fresh dumps cpu-dump/00a2bd60.txt,
   00a2bd90.txt, 0092e900.txt) ----------

   The v39 handoff's two open rows. Copy-pair wrapper 0xa2bd60..0xa2bd81
   (13 insns, ret 8): UNCONDITIONALLY calls the insert body
   0xa2bd90(out, src) with thiscall this passed through, then copies
   the callee's out-pair FIRST dword into *dst (0xa2bd7c). The insert
   body 0xa2bd90..0xa2bf51 (152 insns, SEH 0xb1227d): ordered-tree
   insert — alloc 0x1c node (0xa0f4c0), key dword src[0] ->
   node[0x10], 8-byte pair {src[4], src[8]} -> node[0x14] via
   0x8f2d20, links [0]/[4]/[8] := head + word [0xc] := 0, walk (BYTE
   [x+0xd] gate; UNSIGNED jae key compare -> right ([x+8]) else left
   ([x])), count gate this[4] == 0x9249249 -> throw 0x4170d0,
   linkage (parent == head -> head arm; sbb/neg side bit -> left
   ([parent]) / right ([parent+8]) with the head-most updates), fixup
   (BYTE [parent+0xc] == 0 -> run; uncle color == 0 -> recolor arm,
   else rotate arm with pre-rotate — the rotations 0x415f80/0x415fe0
   are host), out pair {node, byte 1}. Grow body 0x92e900..0x92ea4b
   (117 insns, ret 8) + SEH cleanup arm 0x92ea4e..0x92ea6b (9 insns,
   SEH 0xb0ac10): the v24 growth laws consumed by reference (count==MAX
   @0x92e961, cap gate @0x92e990, push-grow-new @0x92e9f6, cap
   overflow @0x92ea03); this unit's seams: size_count/cur_count (the
   family entry-count model), alloc_size = new_cap*0x1b8 (imul wrap),
   spot = block + size_count*0x1b8, new_end = spot + 0x1b8, emplace
   0x92e830 (host), G 0x92e9e7 arm gate (== -> ONE 0x92ec30 move call;
   extended -> TWO 0x92ed30 calls), relink 0x92eba0 (host), and the
   SEH cleanup arm = the v39 wrapper forward edges consumed by
   reference (0x92ea54 -> 0x92e7d0 destroy wrapper, 0x92ea5f ->
   0x92e7f0 free wrapper, 0x92ea68 -> 0xaf05eb unwind) with the
   constructed-so-far boundary [ebp-0x14] derived from the failure
   stage (1 = emplace threw -> new_end; 2 = first move threw -> spot;
   3 = later -> block on the extended arm, spot on the == arm). */

extern "C" void isaac_sfx_copy_pair_wrapper_plan(
    IsaacSfxCopyPairWrapperPlan* out) {
  if (out == nullptr) {
    return;
  }
  /* PE 0xa2bd71 (call, unconditional) + 0xa2bd7c (the 4-byte out
     copy, unconditional): the wrapper has NO branch. */
  out->call_runs = 1u;
  out->out_dword_copy_runs = 1u;
  out->out_flag_off = ISAAC_SFX_COPY_PAIR_OUT_FLAG_OFF;
  out->forward_target = ISAAC_SFX_COPY_PAIR_FORWARD_VA_A2BD90;
  out->stack_args = ISAAC_SFX_COPY_PAIR_STACK_ARGS;
  out->ret_imm = ISAAC_SFX_COPY_PAIR_RET_IMM;
}

extern "C" int32_t isaac_sfx_copy_pair_walk_step(uint32_t new_key,
                                                 uint32_t node_key,
                                                 uint32_t node_flag) {
  /* PE 0xa2be16/0xa2be35: `cmp byte [x+0xd], 0` — the BYTE gate stops
     the walk first. Then 0xa2be25 `cmp [ebx+0x10], ecx ; jae
     0xa2be2e` — UNSIGNED: new >= node -> right ([x+8]), else left
     ([x]). */
  if (low_byte(node_flag) != 0u) {
    return ISAAC_SFX_COPY_PAIR_STEP_SITE;
  }
  return static_cast<uint32_t>(new_key) >= static_cast<uint32_t>(node_key)
             ? ISAAC_SFX_COPY_PAIR_STEP_RIGHT
             : ISAAC_SFX_COPY_PAIR_STEP_LEFT;
}

extern "C" int32_t isaac_sfx_copy_pair_count_fatal(uint32_t count) {
  /* PE 0xa2be3e `cmp eax, 0x9249249 ; je 0xa2bf54` — EQUALITY only
     (the reserve has an analogous > gate elsewhere; this one is the
     equality sentinel of the ordered tree). */
  return count == ISAAC_SFX_INSERT_COUNT_SENTINEL ? 1 : 0;
}

extern "C" int32_t isaac_sfx_copy_pair_side(uint32_t new_key,
                                            uint32_t parent_key) {
  /* PE 0xa2be31..0xa2be33: `sbb ecx,ecx ; neg ecx` right after the
     walk's last `cmp [ebx+0x10], ecx` (0xa2be25) — ecx := CF, i.e.
     1 iff new_key < parent_key; the 0xa2be65 `test ecx,ecx ; jne`
     picks the LEFT arm ([parent] := node), else RIGHT ([parent+8]). */
  return static_cast<uint32_t>(new_key) < static_cast<uint32_t>(parent_key)
             ? ISAAC_SFX_COPY_PAIR_STEP_LEFT
             : ISAAC_SFX_COPY_PAIR_STEP_RIGHT;
}

extern "C" void isaac_sfx_copy_pair_insert_plan(
    uint32_t count,
    uint32_t head_parent_flag,
    uint32_t new_key,
    uint32_t parent_key,
    uint32_t parent_is_head,
    uint32_t parent_is_head_left,
    uint32_t parent_is_head_right,
    uint32_t parent_color,
    uint32_t uncle_color,
    uint32_t node_is_inner,
    uint32_t walk_steps,
    uint32_t fixup_steps,
    uint32_t rotation_calls,
    IsaacSfxCopyPairInsertPlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t walk_entry = low_byte(head_parent_flag) == 0u ? 1 : 0;
  const int32_t count_fatal = isaac_sfx_copy_pair_count_fatal(count);
  const int32_t side = isaac_sfx_copy_pair_side(new_key, parent_key);
  const int32_t head_arm = parent_is_head != 0u ? 1 : 0;
  const int32_t head_left =
      (parent_is_head_left != 0u && head_arm == 0) ? 1 : 0;
  const int32_t head_right =
      (parent_is_head_right != 0u && head_arm == 0) ? 1 : 0;
  const int32_t fixup_entry = low_byte(parent_color) == 0u ? 1 : 0;
  const int32_t fixup_recolor = low_byte(uncle_color) == 0u ? 1 : 0;
  out->alloc_call_runs = 1u;
  out->node_size = ISAAC_SFX_INSERT_NODE_SIZE;
  out->key_dword_off = ISAAC_SFX_INSERT_NODE_KEY_DWORD_OFF;
  out->pair_off = ISAAC_SFX_INSERT_NODE_PAIR_OFF;
  out->pair_copy_runs = 1u;
  out->walk_entry = static_cast<uint32_t>(walk_entry);
  out->walk_steps = walk_steps; /* host chain input */
  out->count_fatal = static_cast<uint32_t>(count_fatal);
  out->count_inc_store = static_cast<uint32_t>(count_fatal == 0 ? 1 : 0);
  out->parent_link_store = 1u;
  out->side = static_cast<uint32_t>(side);
  out->head_arm = static_cast<uint32_t>(head_arm);
  out->head_leftmost_update = static_cast<uint32_t>(head_left);
  out->head_rightmost_update = static_cast<uint32_t>(head_right);
  out->fixup_entry = static_cast<uint32_t>(fixup_entry);
  out->fixup_steps = fixup_steps; /* host chain input */
  out->fixup_recolor = static_cast<uint32_t>(fixup_recolor);
  out->fixup_rotate = static_cast<uint32_t>(fixup_recolor == 0 ? 1 : 0);
  /* PE 0xa2bea5/0xa2bef4: the pre-rotate gate is the node being on
     the parent's INNER side (== [parent+8] left-side / == [parent]
     right-side). */
  out->pre_rotate_left = node_is_inner != 0u ? 1u : 0u;
  out->rotation_calls = rotation_calls; /* host tally input */
  out->out_store_runs = 1u;
  out->throw_runs = static_cast<uint32_t>(count_fatal);
  out->stack_args = ISAAC_SFX_INSERT_STACK_ARGS;
  out->ret_imm = ISAAC_SFX_INSERT_RET_IMM;
}

extern "C" int32_t isaac_sfx_grow_extended(uint32_t new_end,
                                           uint32_t old_end) {
  /* PE 0x92e9e7 `cmp edx, ecx ; jne 0x92ea0d` — FULL dword: the
     extended arm runs TWO 0x92ed30 move calls (0x92ea11 + 0x92ea24);
     the == arm falls into ONE 0x92ec30 call (0x92e9ef). */
  return new_end != old_end ? 1 : 0;
}

extern "C" uint32_t isaac_sfx_grow_alloc_size(uint32_t new_cap) {
  /* PE 0x92e99c `imul ecx, edi, 0x1b8` — the 0x40cf00 size input,
     32-bit wrap. */
  return new_cap * ISAAC_SFX_FREE_WRAP_STRIDE_1B8;
}

extern "C" uint32_t isaac_sfx_grow_spot_offset(uint32_t size_count) {
  /* PE 0x92e9b3 `imul eax, [ebp-0x1c], 0x1b8` — the emplace spot
     offset from the new block, 32-bit wrap. */
  return size_count * ISAAC_SFX_FREE_WRAP_STRIDE_1B8;
}

extern "C" void isaac_sfx_grow_cleanup_plan(uint32_t fail_stage,
                                            uint32_t extended,
                                            uint32_t block,
                                            uint32_t spot,
                                            uint32_t new_end,
                                            uint32_t new_cap,
                                            IsaacSfxGrowPlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t cleanup = fail_stage != 0u ? 1 : 0;
  uint32_t destroy_begin;
  if (cleanup == 0) {
    destroy_begin = 0u;
  } else if (fail_stage == 1u) {
    /* [ebp-0x14] := new_end at 0x92e9cd — BEFORE the emplace
       construct: the destroy range is empty (the host's 0x92eaa6
       begin==end gate skips). */
    destroy_begin = new_end;
  } else if (fail_stage == 2u) {
    /* [ebp-0x14] := spot at 0x92e9e1 — the emplaced element only. */
    destroy_begin = spot;
  } else {
    /* [ebp-0x14] := block at 0x92ea1b (extended arm, after the first
       move call); the == arm keeps spot. */
    destroy_begin = extended != 0u ? block : spot;
  }
  out->destroy_wrapper_runs = static_cast<uint32_t>(cleanup);
  out->free_wrapper_runs = static_cast<uint32_t>(cleanup);
  out->unwind_runs = static_cast<uint32_t>(cleanup);
  out->cleanup_destroy_begin = destroy_begin;
  out->cleanup_destroy_end = new_end; /* [ebp-0x1c], constant */
  out->cleanup_free_count = new_cap;  /* [ebp-0x20], constant */
  out->cleanup_free_begin = block;    /* [ebp-0x28], constant */
}

extern "C" void isaac_sfx_grow_plan(uint32_t new_end,
                                    uint32_t begin,
                                    uint32_t old_end,
                                    uint32_t cap,
                                    uint32_t block,
                                    uint32_t fail_stage,
                                    IsaacSfxGrowPlan* out) {
  if (out == nullptr) {
    return;
  }
  /* PE 0x92e940/0x92e954: both divides are the family's shared count
     model (standard form). */
  const int32_t size_count = entry_count_impl(static_cast<int32_t>(
      static_cast<uint32_t>(new_end) - static_cast<uint32_t>(begin)));
  const int32_t cur_count = entry_count_impl(static_cast<int32_t>(
      static_cast<uint32_t>(old_end) - static_cast<uint32_t>(begin)));
  const int32_t cap_count = entry_count_impl(static_cast<int32_t>(
      static_cast<uint32_t>(cap) - static_cast<uint32_t>(begin)));
  /* The v24 laws, consumed by reference at their exact sites. */
  const int32_t count_max_fatal =
      isaac_sfx_vec_count_max(static_cast<uint32_t>(cur_count));
  const int32_t cap_gate =
      isaac_sfx_vec_cap_gate(static_cast<uint32_t>(cap_count));
  const uint32_t new_cap =
      cap_gate != 0
          ? static_cast<uint32_t>(ISAAC_SFX_VEC_MAX_COUNT)
          : isaac_sfx_vec_push_grow_new(static_cast<uint32_t>(cap_count),
                                        static_cast<uint32_t>(cur_count));
  const int32_t new_cap_overflow = isaac_sfx_vec_cap_overflow(new_cap);
  const uint32_t alloc_size = isaac_sfx_grow_alloc_size(new_cap);
  const int32_t alloc_fast = isaac_sfx_grow_alloc_fast(alloc_size);
  const uint32_t spot_offset = isaac_sfx_grow_spot_offset(
      static_cast<uint32_t>(size_count));
  const uint32_t new_end_offset = spot_offset + ISAAC_SFX_FREE_WRAP_STRIDE_1B8;
  const int32_t extended = isaac_sfx_grow_extended(new_end, old_end);
  const uint32_t spot =
      static_cast<uint32_t>(block) + spot_offset;
  const uint32_t new_end_abs =
      static_cast<uint32_t>(block) + new_end_offset;
  out->size_count = static_cast<uint32_t>(size_count);
  out->cur_count = static_cast<uint32_t>(cur_count);
  out->count_max_fatal = static_cast<uint32_t>(count_max_fatal);
  out->cap_gate_max_alloc = static_cast<uint32_t>(cap_gate);
  out->new_cap = new_cap;
  out->new_cap_overflow = static_cast<uint32_t>(new_cap_overflow);
  out->alloc_size = alloc_size;
  out->alloc_fast = static_cast<uint32_t>(alloc_fast);
  out->spot_offset = spot_offset;
  out->new_end_offset = new_end_offset;
  out->extended = static_cast<uint32_t>(extended);
  out->move_calls = extended != 0
                        ? static_cast<uint32_t>(
                              ISAAC_SFX_GROW_ARM_EXTENDED_MOVE_CALLS)
                        : static_cast<uint32_t>(
                              ISAAC_SFX_GROW_ARM_EQUAL_MOVE_CALLS);
  out->emplace_runs = 1u;
  out->relink_runs = 1u;
  isaac_sfx_grow_cleanup_plan(fail_stage, static_cast<uint32_t>(extended),
                              block, spot, new_end_abs, new_cap, out);
}

/* v40 census pins (lea-corrected tooling; see notes sfx-v40-pairgrow). */

extern "C" uint32_t isaac_sfx_copy_pair_end_va(void) {
  return ISAAC_SFX_COPY_PAIR_END_VA_A2BD81;
}

extern "C" uint32_t isaac_sfx_copy_pair_next_va(void) {
  return ISAAC_SFX_COPY_PAIR_NEXT_VA_A2BD90;
}

extern "C" uint32_t isaac_sfx_copy_pair_callers(void) {
  return ISAAC_SFX_COPY_PAIR_CALLERS;
}

extern "C" uint32_t isaac_sfx_copy_pair_caller1_va(void) {
  return ISAAC_SFX_COPY_PAIR_CALLER1_VA_A2B6A4;
}

extern "C" uint32_t isaac_sfx_copy_pair_imm32_refs(void) {
  return ISAAC_SFX_COPY_PAIR_IMM32_REFS;
}

extern "C" uint32_t isaac_sfx_copy_pair_body_insns(void) {
  return ISAAC_SFX_COPY_PAIR_BODY_INSNS;
}

extern "C" uint32_t isaac_sfx_copy_pair_stack_args(void) {
  return ISAAC_SFX_COPY_PAIR_STACK_ARGS;
}

extern "C" uint32_t isaac_sfx_copy_pair_ret_imm(void) {
  return ISAAC_SFX_COPY_PAIR_RET_IMM;
}

extern "C" uint32_t isaac_sfx_copy_pair_forward_va(void) {
  return ISAAC_SFX_COPY_PAIR_FORWARD_VA_A2BD90;
}

extern "C" uint32_t isaac_sfx_copy_pair_call_site(void) {
  return ISAAC_SFX_COPY_PAIR_CALL_SITE;
}

extern "C" uint32_t isaac_sfx_copy_pair_out_copy_site(void) {
  return ISAAC_SFX_COPY_PAIR_OUT_COPY_SITE;
}

extern "C" uint32_t isaac_sfx_copy_pair_out_flag_off(void) {
  return ISAAC_SFX_COPY_PAIR_OUT_FLAG_OFF;
}

extern "C" uint32_t isaac_sfx_insert_end_va(void) {
  return ISAAC_SFX_INSERT_END_VA_A2BF51;
}

extern "C" uint32_t isaac_sfx_insert_next_va(void) {
  return ISAAC_SFX_INSERT_NEXT_VA_A2BF60;
}

extern "C" uint32_t isaac_sfx_insert_callers(void) {
  return ISAAC_SFX_INSERT_CALLERS;
}

extern "C" uint32_t isaac_sfx_insert_caller1_va(void) {
  return ISAAC_SFX_INSERT_CALLER1_VA_A2BD71;
}

extern "C" uint32_t isaac_sfx_insert_imm32_refs(void) {
  return ISAAC_SFX_INSERT_IMM32_REFS;
}

extern "C" uint32_t isaac_sfx_insert_body_insns(void) {
  return ISAAC_SFX_INSERT_BODY_INSNS;
}

extern "C" uint32_t isaac_sfx_insert_seh_handler_va(void) {
  return ISAAC_SFX_INSERT_SEH_HANDLER_VA;
}

extern "C" uint32_t isaac_sfx_insert_stack_args(void) {
  return ISAAC_SFX_INSERT_STACK_ARGS;
}

extern "C" uint32_t isaac_sfx_insert_ret_imm(void) {
  return ISAAC_SFX_INSERT_RET_IMM;
}

extern "C" uint32_t isaac_sfx_insert_node_size(void) {
  return ISAAC_SFX_INSERT_NODE_SIZE;
}

extern "C" uint32_t isaac_sfx_insert_node_left_off(void) {
  return ISAAC_SFX_INSERT_NODE_LEFT_OFF;
}

extern "C" uint32_t isaac_sfx_insert_node_parent_off(void) {
  return ISAAC_SFX_INSERT_NODE_PARENT_OFF;
}

extern "C" uint32_t isaac_sfx_insert_node_right_off(void) {
  return ISAAC_SFX_INSERT_NODE_RIGHT_OFF;
}

extern "C" uint32_t isaac_sfx_insert_node_color_byte_off(void) {
  return ISAAC_SFX_INSERT_NODE_COLOR_BYTE_OFF;
}

extern "C" uint32_t isaac_sfx_insert_node_flag_byte_off(void) {
  return ISAAC_SFX_INSERT_NODE_FLAG_BYTE_OFF;
}

extern "C" uint32_t isaac_sfx_insert_node_key_dword_off(void) {
  return ISAAC_SFX_INSERT_NODE_KEY_DWORD_OFF;
}

extern "C" uint32_t isaac_sfx_insert_node_pair_off(void) {
  return ISAAC_SFX_INSERT_NODE_PAIR_OFF;
}

extern "C" uint32_t isaac_sfx_insert_tree_head_off(void) {
  return ISAAC_SFX_INSERT_TREE_HEAD_OFF;
}

extern "C" uint32_t isaac_sfx_insert_tree_count_off(void) {
  return ISAAC_SFX_INSERT_TREE_COUNT_OFF;
}

extern "C" uint32_t isaac_sfx_insert_walk_start_off(void) {
  return ISAAC_SFX_INSERT_WALK_START_OFF;
}

extern "C" uint32_t isaac_sfx_insert_count_sentinel(void) {
  return ISAAC_SFX_INSERT_COUNT_SENTINEL;
}

extern "C" uint32_t isaac_sfx_insert_walk_gate_site(void) {
  return ISAAC_SFX_INSERT_WALK_GATE_SITE;
}

extern "C" uint32_t isaac_sfx_insert_walk_loop_site(void) {
  return ISAAC_SFX_INSERT_WALK_LOOP_SITE;
}

extern "C" uint32_t isaac_sfx_insert_walk_cmp_site(void) {
  return ISAAC_SFX_INSERT_WALK_CMP_SITE;
}

extern "C" uint32_t isaac_sfx_insert_walk_retest_site(void) {
  return ISAAC_SFX_INSERT_WALK_RETEST_SITE;
}

extern "C" uint32_t isaac_sfx_insert_count_cmp_site(void) {
  return ISAAC_SFX_INSERT_COUNT_CMP_SITE;
}

extern "C" uint32_t isaac_sfx_insert_count_inc_site(void) {
  return ISAAC_SFX_INSERT_COUNT_INC_SITE;
}

extern "C" uint32_t isaac_sfx_insert_side_detect_site(void) {
  return ISAAC_SFX_INSERT_SIDE_DETECT_SITE;
}

extern "C" uint32_t isaac_sfx_insert_head_arm_site(void) {
  return ISAAC_SFX_INSERT_HEAD_ARM_SITE;
}

extern "C" uint32_t isaac_sfx_insert_head_color_store(void) {
  return ISAAC_SFX_INSERT_HEAD_COLOR_STORE;
}

extern "C" uint32_t isaac_sfx_insert_link_right_site(void) {
  return ISAAC_SFX_INSERT_LINK_RIGHT_SITE;
}

extern "C" uint32_t isaac_sfx_insert_link_left_site(void) {
  return ISAAC_SFX_INSERT_LINK_LEFT_SITE;
}

extern "C" uint32_t isaac_sfx_insert_fixup_entry_site(void) {
  return ISAAC_SFX_INSERT_FIXUP_ENTRY_SITE;
}

extern "C" uint32_t isaac_sfx_insert_fixup_loop_site(void) {
  return ISAAC_SFX_INSERT_FIXUP_LOOP_SITE;
}

extern "C" uint32_t isaac_sfx_insert_recolor_site(void) {
  return ISAAC_SFX_INSERT_RECOLOR_SITE;
}

extern "C" uint32_t isaac_sfx_insert_fixup_retest_site(void) {
  return ISAAC_SFX_INSERT_FIXUP_RETEST_SITE;
}

extern "C" uint32_t isaac_sfx_insert_out_store_site(void) {
  return ISAAC_SFX_INSERT_OUT_STORE_SITE;
}

extern "C" uint32_t isaac_sfx_insert_out_flag_site(void) {
  return ISAAC_SFX_INSERT_OUT_FLAG_SITE;
}

extern "C" uint32_t isaac_sfx_insert_throw_site(void) {
  return ISAAC_SFX_INSERT_THROW_SITE;
}

extern "C" uint32_t isaac_sfx_insert_alloc_site(void) {
  return ISAAC_SFX_INSERT_ALLOC_SITE;
}

extern "C" uint32_t isaac_sfx_insert_adopt_site(void) {
  return ISAAC_SFX_INSERT_ADOPT_SITE;
}

extern "C" uint32_t isaac_sfx_insert_rotate_sites(void) {
  return ISAAC_SFX_INSERT_ROTATE_SITES;
}

extern "C" uint32_t isaac_sfx_insert_rotate_site1(void) {
  return ISAAC_SFX_INSERT_ROTATE_SITE_1;
}

extern "C" uint32_t isaac_sfx_insert_rotate_site2(void) {
  return ISAAC_SFX_INSERT_ROTATE_SITE_2;
}

extern "C" uint32_t isaac_sfx_insert_rotate_site3(void) {
  return ISAAC_SFX_INSERT_ROTATE_SITE_3;
}

extern "C" uint32_t isaac_sfx_insert_rotate_site4(void) {
  return ISAAC_SFX_INSERT_ROTATE_SITE_4;
}

extern "C" uint32_t isaac_sfx_adopt_callee_census(void) {
  return ISAAC_SFX_ADOPT_CALLEE_CENSUS;
}

extern "C" uint32_t isaac_sfx_rotate_fe0_census(void) {
  return ISAAC_SFX_ROTATE_FE0_CENSUS;
}

extern "C" uint32_t isaac_sfx_rotate_f80_census(void) {
  return ISAAC_SFX_ROTATE_F80_CENSUS;
}

extern "C" uint32_t isaac_sfx_grow_end_va(void) {
  return ISAAC_SFX_GROW_END_VA_92EA4B;
}

extern "C" uint32_t isaac_sfx_grow_seh_arm_end(void) {
  return ISAAC_SFX_GROW_SEH_ARM_END;
}

extern "C" uint32_t isaac_sfx_grow_next_va(void) {
  return ISAAC_SFX_GROW_NEXT_VA_92EA80;
}

extern "C" uint32_t isaac_sfx_grow_callers(void) {
  return ISAAC_SFX_GROW_CALLERS;
}

extern "C" uint32_t isaac_sfx_grow_caller1_va(void) {
  return ISAAC_SFX_GROW_CALLER1_VA_92D654;
}

extern "C" uint32_t isaac_sfx_grow_imm32_refs(void) {
  return ISAAC_SFX_GROW_IMM32_REFS;
}

extern "C" uint32_t isaac_sfx_grow_body_insns(void) {
  return ISAAC_SFX_GROW_BODY_INSNS;
}

extern "C" uint32_t isaac_sfx_grow_seh_arm_insns(void) {
  return ISAAC_SFX_GROW_SEH_ARM_INSNS;
}

extern "C" uint32_t isaac_sfx_grow_seh_handler_va(void) {
  return ISAAC_SFX_GROW_SEH_HANDLER_VA;
}

extern "C" uint32_t isaac_sfx_grow_stack_args(void) {
  return ISAAC_SFX_GROW_STACK_ARGS;
}

extern "C" uint32_t isaac_sfx_grow_ret_imm(void) {
  return ISAAC_SFX_GROW_RET_IMM;
}

extern "C" uint32_t isaac_sfx_grow_gate_site(void) {
  return ISAAC_SFX_GROW_GATE_SITE;
}

extern "C" uint32_t isaac_sfx_grow_arm_equal_site(void) {
  return ISAAC_SFX_GROW_ARM_EQUAL_SITE;
}

extern "C" uint32_t isaac_sfx_grow_arm_extended_site(void) {
  return ISAAC_SFX_GROW_ARM_EXTENDED_SITE;
}

extern "C" uint32_t isaac_sfx_grow_emplace_site(void) {
  return ISAAC_SFX_GROW_EMPLACE_SITE;
}

extern "C" uint32_t isaac_sfx_grow_move1_site(void) {
  return ISAAC_SFX_GROW_MOVE1_SITE;
}

extern "C" uint32_t isaac_sfx_grow_move2_site(void) {
  return ISAAC_SFX_GROW_MOVE2_SITE;
}

extern "C" uint32_t isaac_sfx_grow_move3_site(void) {
  return ISAAC_SFX_GROW_MOVE3_SITE;
}

extern "C" uint32_t isaac_sfx_grow_relink_site(void) {
  return ISAAC_SFX_GROW_RELINK_SITE;
}

extern "C" uint32_t isaac_sfx_grow_alloc_site(void) {
  return ISAAC_SFX_GROW_ALLOC_SITE;
}

extern "C" uint32_t isaac_sfx_grow_throw_max_site(void) {
  return ISAAC_SFX_GROW_THROW_MAX_SITE;
}

extern "C" uint32_t isaac_sfx_grow_throw_over_site(void) {
  return ISAAC_SFX_GROW_THROW_OVER_SITE;
}

extern "C" uint32_t isaac_sfx_grow_destroy_wrap_site(void) {
  return ISAAC_SFX_GROW_DESTROY_WRAP_SITE;
}

extern "C" uint32_t isaac_sfx_grow_free_wrap_site(void) {
  return ISAAC_SFX_GROW_FREE_WRAP_SITE;
}

extern "C" uint32_t isaac_sfx_grow_unwind_site(void) {
  return ISAAC_SFX_GROW_UNWIND_SITE;
}

extern "C" uint32_t isaac_sfx_grow_arm_equal_move_calls(void) {
  return ISAAC_SFX_GROW_ARM_EQUAL_MOVE_CALLS;
}

extern "C" uint32_t isaac_sfx_grow_arm_extended_move_calls(void) {
  return ISAAC_SFX_GROW_ARM_EXTENDED_MOVE_CALLS;
}

/* ---------- v41: 0xa2bf60 leaf/node destroy ---------- */

extern "C" void isaac_sfx_leaf_destroy_plan(uint32_t node,
                                            uint32_t pair_obj,
                                            uint32_t probe_bit,
                                            uint32_t hook_present,
                                            IsaacSfxLeafDestroyPlan* out) {
  if (out == nullptr) {
    return;
  }
  /* PE G1 0xa2bf89 `test edi,edi` — the FULL-dword node gate
     skips the probe chain AND the free when it trips. */
  const int32_t node_live = node != 0u ? 1 : 0;
  /* PE G2 0xa2bf9c `test ecx,ecx` on [pair+4] — FULL dword. */
  const int32_t probe_runs =
      (node_live != 0 && pair_obj != 0u) ? 1 : 0;
  /* PE G3 0xa2bfa7 `test al,al` — the probe RESULT is a host edge
     consumed by its LOW BYTE only; G4 0xa2bfb0 is the hook null
     test. */
  const int32_t hook_runs =
      (probe_runs != 0 && low_byte(probe_bit) != 0u &&
       hook_present != 0u)
          ? 1
          : 0;
  out->node_loaded = static_cast<uint32_t>(node_live);
  out->pair_offset = ISAAC_SFX_LEAF_DESTROY_PAIR_OFF_14;
  out->probe_call_runs = static_cast<uint32_t>(probe_runs);
  out->probe_vtbl_slot = ISAAC_SFX_LEAF_DESTROY_PROBE_VTBL_SLOT_0C;
  out->hook_call_runs = static_cast<uint32_t>(hook_runs);
  out->hook_arg =
      hook_runs != 0
          ? static_cast<uint32_t>(node +
                                  ISAAC_SFX_LEAF_DESTROY_PAIR_OFF_14)
          : 0u;
  /* PE R1 0xa2bfb8: EVERY path — fall-through and all four skip
     arms alike — lands on the reload. */
  out->reload_runs = 1u;
  /* PE G5 0xa2bfbb gates the free on the RELOADED node, not on
     the probe chain (free still runs when obj == 0 / probe false /
     hook null). */
  out->free_runs = static_cast<uint32_t>(node_live);
  out->free_size = ISAAC_SFX_LEAF_DESTROY_FREE_SIZE_1C;
  out->seh_handler_va = ISAAC_SFX_LEAF_DESTROY_SEH_HANDLER_VA_AF09F0;
  out->stack_args = 0u;
  out->ret_imm = 0u;
}

/* v41 census pins (lea-corrected tooling; see notes
   sfx-v41-frontier). */

extern "C" uint32_t isaac_sfx_leaf_destroy_end_va(void) {
  return ISAAC_SFX_LEAF_DESTROY_END_VA_A2BFDA;
}

extern "C" uint32_t isaac_sfx_leaf_destroy_next_va(void) {
  return ISAAC_SFX_LEAF_DESTROY_NEXT_VA_A2BFE0;
}

extern "C" uint32_t isaac_sfx_leaf_destroy_e8_callers(void) {
  return ISAAC_SFX_LEAF_DESTROY_E8_CALLERS;
}

extern "C" uint32_t isaac_sfx_leaf_destroy_e9_cold_va(void) {
  return ISAAC_SFX_LEAF_DESTROY_E9_COLD_VA_B12273;
}

extern "C" uint32_t isaac_sfx_leaf_destroy_imm32_refs(void) {
  return ISAAC_SFX_LEAF_DESTROY_IMM32_REFS;
}

extern "C" uint32_t isaac_sfx_leaf_destroy_body_insns(void) {
  return ISAAC_SFX_LEAF_DESTROY_BODY_INSNS;
}

extern "C" uint32_t isaac_sfx_leaf_destroy_seh_handler_va(void) {
  return ISAAC_SFX_LEAF_DESTROY_SEH_HANDLER_VA_AF09F0;
}

extern "C" uint32_t isaac_sfx_leaf_destroy_node_load_site(void) {
  return ISAAC_SFX_LEAF_DESTROY_NODE_LOAD_SITE;
}

extern "C" uint32_t isaac_sfx_leaf_destroy_pair_add_site(void) {
  return ISAAC_SFX_LEAF_DESTROY_PAIR_ADD_SITE;
}

extern "C" uint32_t isaac_sfx_leaf_destroy_obj_load_site(void) {
  return ISAAC_SFX_LEAF_DESTROY_OBJ_LOAD_SITE;
}

extern "C" uint32_t isaac_sfx_leaf_destroy_probe_call_site(void) {
  return ISAAC_SFX_LEAF_DESTROY_PROBE_CALL_SITE;
}

extern "C" uint32_t isaac_sfx_leaf_destroy_hook_read_site(void) {
  return ISAAC_SFX_LEAF_DESTROY_HOOK_READ_SITE;
}

extern "C" uint32_t isaac_sfx_leaf_destroy_hook_call_site(void) {
  return ISAAC_SFX_LEAF_DESTROY_HOOK_CALL_SITE;
}

extern "C" uint32_t isaac_sfx_leaf_destroy_reload_site(void) {
  return ISAAC_SFX_LEAF_DESTROY_RELOAD_SITE;
}

extern "C" uint32_t isaac_sfx_leaf_destroy_free_site(void) {
  return ISAAC_SFX_LEAF_DESTROY_FREE_SITE;
}

extern "C" uint32_t isaac_sfx_leaf_destroy_node_off(void) {
  return ISAAC_SFX_LEAF_DESTROY_NODE_OFF_4;
}

extern "C" uint32_t isaac_sfx_leaf_destroy_pair_off(void) {
  return ISAAC_SFX_LEAF_DESTROY_PAIR_OFF_14;
}

extern "C" uint32_t isaac_sfx_leaf_destroy_obj_off(void) {
  return ISAAC_SFX_LEAF_DESTROY_OBJ_OFF_4;
}

extern "C" uint32_t isaac_sfx_leaf_destroy_probe_vtbl_slot(void) {
  return ISAAC_SFX_LEAF_DESTROY_PROBE_VTBL_SLOT_0C;
}

extern "C" uint32_t isaac_sfx_leaf_destroy_free_size(void) {
  return ISAAC_SFX_LEAF_DESTROY_FREE_SIZE_1C;
}

extern "C" uint32_t isaac_sfx_leaf_destroy_free_callee_va(void) {
  return ISAAC_SFX_LEAF_DESTROY_FREE_CALLEE_AEF15C;
}