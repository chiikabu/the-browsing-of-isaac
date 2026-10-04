#include "frame_opaque_pure_helpers.h"

#include <stddef.h>

/* PE wrappers 0x0041d540 / 0x0041d520 call CRT cos/sin via double. Declare
   without <cmath> so host clang -fsyntax-only (no full libstdc++) still passes;
   em++ STANDALONE_WASM links soft-float cos/sin/floor with zero imports.
   FUN_00409030 residual uses the same CRT floor path as IAT 0x00af0917. */
extern "C" double cos(double);
extern "C" double sin(double);
extern "C" double floor(double);

namespace {
inline uint32_t fo_f32_bits(float v) {
  uint32_t bits = 0;
  __builtin_memcpy(&bits, &v, sizeof(bits));
  return bits;
}
inline float fo_bits_f32(uint32_t bits) {
  float v = 0.0f;
  __builtin_memcpy(&v, &bits, sizeof(v));
  return v;
}
}  // namespace


static_assert(offsetof(IsaacFrameOpaque409030Plan, path) == 0, "409030 plan path");
static_assert(offsetof(IsaacFrameOpaque409030Plan, host_advance) == 4,
              "409030 plan host_advance");
static_assert(offsetof(IsaacFrameOpaque409030Plan, host_rewind) == 8,
              "409030 plan host_rewind");
static_assert(offsetof(IsaacFrameOpaque409030Plan, advance_frame) == 12,
              "409030 plan advance_frame");
static_assert(offsetof(IsaacFrameOpaque409030Plan, sum) == 16, "409030 plan sum");
static_assert(offsetof(IsaacFrameOpaque409030Plan, floored_sum) == 20,
              "409030 plan floored_sum");
static_assert(offsetof(IsaacFrameOpaque409030Plan, trunc_sum) == 24,
              "409030 plan trunc_sum");
static_assert(offsetof(IsaacFrameOpaque409030Plan, store_float_10) == 28,
              "409030 plan store_float_10");
static_assert(offsetof(IsaacFrameOpaque409030Plan, clear_flag_14) == 32,
              "409030 plan clear_flag_14");
static_assert(sizeof(IsaacFrameOpaque409030Plan) == 36, "409030 plan size");

static_assert(offsetof(IsaacFrameOpaque408d00Plan, trunc_cur) == 0,
              "408d00 plan trunc_cur");
static_assert(offsetof(IsaacFrameOpaque408d00Plan, floored_cur) == 4,
              "408d00 plan floored_cur");
static_assert(offsetof(IsaacFrameOpaque408d00Plan, target_f) == 8,
              "408d00 plan target_f");
static_assert(offsetof(IsaacFrameOpaque408d00Plan, host_assert) == 12,
              "408d00 plan host_assert");
static_assert(offsetof(IsaacFrameOpaque408d00Plan, clear_mask18) == 16,
              "408d00 plan clear_mask18");
static_assert(offsetof(IsaacFrameOpaque408d00Plan, advance_loop) == 20,
              "408d00 plan advance_loop");
static_assert(offsetof(IsaacFrameOpaque408d00Plan, step_count) == 24,
              "408d00 plan step_count");
static_assert(offsetof(IsaacFrameOpaque408d00Plan, host_408c90) == 28,
              "408d00 plan host_408c90");
static_assert(offsetof(IsaacFrameOpaque408d00Plan, host_layer_loop) == 32,
              "408d00 plan host_layer_loop");
static_assert(offsetof(IsaacFrameOpaque408d00Plan, host_null_loop) == 36,
              "408d00 plan host_null_loop");
static_assert(offsetof(IsaacFrameOpaque408d00Plan, final_frame) == 40,
              "408d00 plan final_frame");
static_assert(offsetof(IsaacFrameOpaque408d00Plan, pure_complete_ok) == 44,
              "408d00 plan pure_complete_ok");
static_assert(sizeof(IsaacFrameOpaque408d00Plan) == 48, "408d00 plan size");

static_assert(offsetof(IsaacFrameOpaque98dba0State, mode) == 0, "98dba0 mode");
static_assert(offsetof(IsaacFrameOpaque98dba0State, flag) == 4, "98dba0 flag");
static_assert(offsetof(IsaacFrameOpaque98dba0State, counter) == 8, "98dba0 counter");
static_assert(offsetof(IsaacFrameOpaque98dba0State, float_170) == 12, "98dba0 float_170");
static_assert(offsetof(IsaacFrameOpaque98dba0State, float_2d0) == 16, "98dba0 float_2d0");
static_assert(sizeof(IsaacFrameOpaque98dba0State) == 20, "98dba0 state size");
static_assert(offsetof(IsaacFrameOpaque98dba0TimerState, timer) == 0, "98dba0 timer");
static_assert(offsetof(IsaacFrameOpaque98dba0TimerState, x) == 4, "98dba0 timer x");
static_assert(offsetof(IsaacFrameOpaque98dba0TimerState, y) == 8, "98dba0 timer y");
static_assert(sizeof(IsaacFrameOpaque98dba0TimerState) == 12, "98dba0 timer size");

/* Pure-complete shell for FrameOpaque_4212c0 (VA 0x004212c0), recovered from
   machine control flow (decompiler + prolog bytes at raw PE mapping).

   Exact outer structure:
     if (*mode == 0) return;
     // mode==1 pure clear (conditions on +0x3c / +0x4c / slot byte)
     // if flag_111: host FUN_00409030 twice (subobjects +0x38, +0x58)
     // if secondary==3: host path when +0x3c!=0, else pure clear both fields

   This helper only commits pure terminal stores when no host residual is
   reachable, so it is safe as a skip-host predicate without a residual event.
   flag_111 residual may further pure-skip each 409030 via
   isaac_frame_opaque_409030_needs_host when subobject +4/+0x14 are known;
   try_pure still treats flag_111 as host-required so Update does not need
   those sparse fields. */
extern "C" int32_t isaac_frame_opaque_4212c0_try_pure(
    int32_t* mode,
    int32_t* secondary,
    int32_t field_3c,
    uint32_t flag_4c,
    uint32_t slot_char,
    uint32_t flag_111) {
  if (mode == nullptr || secondary == nullptr) {
    return 1;
  }

  if (*mode == 0) {
    return 0;
  }

  /* Opaque residual reachable → leave state untouched for full host body.
     PE 0x00421300 `cmp byte ptr [esi+0x111],0` + je: LOW-BYTE zero test.
     The explicit mask is load-bearing — an int8_t parameter let -O2 drop
     it and the shipped v28 module answered HOST at 0x100 where the PE
     takes the pure no-op path (measured divergence, not hypothetical). */
  if ((flag_111 & 0xffu) != 0u) {
    return 1;
  }
  if (*secondary == 3 && field_3c != 0) {
    return 1;
  }

  /* Pure mode==1 clear (machine: cmp eax,1; field_3c / flag_4c / slot).
     PE 0x004212df / 0x004212f4 are byte cmps vs 0 — low-byte zero tests. */
  if (*mode == 1) {
    if (field_3c == 0 || (flag_4c & 0xffu) == 0u) {
      if ((slot_char & 0xffu) == 0u) {
        *mode = 0;
      }
    }
  }

  /* Pure secondary==3 clear when field_3c==0 (host branch skipped above). */
  if (*secondary == 3) {
    *mode = 0;
    *secondary = 0;
  }

  return 0;
}

/* FUN_00409030 pure early-out (VA 0x00409030). PE raw:
     mov edi, [esi+4]; test edi,edi; je 0x4090eb
     cmp byte [esi+0x14], 0; je 0x4090eb
   Zero field_4 or zero low-byte flag_14 → pure no-op (no stores). */
extern "C" int32_t isaac_frame_opaque_409030_needs_host(uint32_t field_4,
                                                         int32_t flag_14) {
  if (field_4 == 0u) {
    return 0;
  }
  /* PE byte cmp: only low 8 bits matter (Wasm-safe vs narrow int8 param). */
  if ((static_cast<uint32_t>(flag_14) & 0xffu) == 0u) {
    return 0;
  }
  return 1;
}

/* 4212c0 flag_111: sequential 409030 on subobjects A then B. Pair needs host
   iff either call enters residual body. */
extern "C" int32_t isaac_frame_opaque_409030_pair_needs_host(
    uint32_t field4_a,
    int32_t flag14_a,
    uint32_t field4_b,
    int32_t flag14_b) {
  if (isaac_frame_opaque_409030_needs_host(field4_a, flag14_a) != 0) {
    return 1;
  }
  if (isaac_frame_opaque_409030_needs_host(field4_b, flag14_b) != 0) {
    return 1;
  }
  return 0;
}

/* FUN_00409030 residual body pure islands (VA 0x0040904f…0x004090f0). */

extern "C" float isaac_frame_opaque_409030_sum(float float_10, float layer_104) {
  /* PE addss: float32 addition. */
  return float_10 + layer_104;
}

extern "C" float isaac_frame_opaque_409030_floor_f32(float x) {
  /* PE: fld f32 → floor(double) IAT → fstp f32. */
  return static_cast<float>(floor(static_cast<double>(x)));
}

extern "C" int32_t isaac_frame_opaque_409030_trunc_f32(float x) {
  /* PE cvttss2si: convert toward zero. Normal animation-frame range. */
  return static_cast<int32_t>(x);
}

extern "C" int32_t isaac_frame_opaque_409030_path(int32_t trunc_sum,
                                                   int32_t frame_bound,
                                                   int32_t loop_flag) {
  /* PE: cmp eax,ecx; jl advance_mid; cmp byte [edi+0x34],0; je no_loop. */
  if (trunc_sum < frame_bound) {
    return ISAAC_FRAME_OPAQUE_409030_PATH_ADVANCE_MID;
  }
  if ((static_cast<uint32_t>(loop_flag) & 0xffu) != 0u) {
    return ISAAC_FRAME_OPAQUE_409030_PATH_REWIND;
  }
  return ISAAC_FRAME_OPAQUE_409030_PATH_NO_LOOP;
}

extern "C" int32_t isaac_frame_opaque_409030_no_loop_target_frame(
    int32_t frame_bound) {
  /* PE: lea edi, [ecx - 1] with ecx = frame_bound (32-bit wrap). */
  return frame_bound - 1;
}

extern "C" int32_t isaac_frame_opaque_409030_no_loop_advance_needed(
    int32_t frame_bound,
    int32_t trunc_orig) {
  /* PE: cmp edi,eax; jl skip — host when last >= trunc_orig (signed). */
  const int32_t last = isaac_frame_opaque_409030_no_loop_target_frame(frame_bound);
  return (last >= trunc_orig) ? 1 : 0;
}

extern "C" void isaac_frame_opaque_409030_apply_mid_store(float* float_10,
                                                           float sum) {
  if (float_10 == nullptr) {
    return;
  }
  /* PE ADVANCE_MID: movss [esi+0x10], xmm0 with xmm0 = pre-floor sum. */
  *float_10 = sum;
}

extern "C" void isaac_frame_opaque_409030_apply_no_loop_clear(int32_t* flag_14) {
  if (flag_14 == nullptr) {
    return;
  }
  /* PE: mov byte [esi+0x14], 0 — clear low byte only. */
  *flag_14 = static_cast<int32_t>(static_cast<uint32_t>(*flag_14) & ~0xffu);
}

extern "C" void isaac_frame_opaque_409030_residual_plan(
    IsaacFrameOpaque409030Plan* out,
    float float_10,
    float layer_104,
    int32_t frame_bound,
    int32_t loop_flag) {
  if (out == nullptr) {
    return;
  }

  const float sum = isaac_frame_opaque_409030_sum(float_10, layer_104);
  const float floored_sum = isaac_frame_opaque_409030_floor_f32(sum);
  const int32_t trunc_sum = isaac_frame_opaque_409030_trunc_f32(floored_sum);
  const int32_t path =
      isaac_frame_opaque_409030_path(trunc_sum, frame_bound, loop_flag);

  out->path = path;
  out->sum = fo_f32_bits(sum);
  out->floored_sum = fo_f32_bits(floored_sum);
  out->trunc_sum = trunc_sum;
  out->host_advance = 0;
  out->host_rewind = 0;
  out->advance_frame = 0;
  out->store_float_10 = 0;
  out->clear_flag_14 = 0;

  if (path == ISAAC_FRAME_OPAQUE_409030_PATH_ADVANCE_MID) {
    out->host_advance = 1;
    out->advance_frame = trunc_sum;
    out->store_float_10 = 1;
    return;
  }
  if (path == ISAAC_FRAME_OPAQUE_409030_PATH_REWIND) {
    out->host_rewind = 1;
    return;
  }

  /* NO_LOOP: optional AdvancePosition(bound-1) then pure clear flag_14. */
  out->clear_flag_14 = 1;
  const float floored_orig = isaac_frame_opaque_409030_floor_f32(float_10);
  const int32_t trunc_orig = isaac_frame_opaque_409030_trunc_f32(floored_orig);
  if (isaac_frame_opaque_409030_no_loop_advance_needed(frame_bound, trunc_orig) !=
      0) {
    out->host_advance = 1;
    out->advance_frame =
        isaac_frame_opaque_409030_no_loop_target_frame(frame_bound);
  }
}

/* AnimationState::AdvancePosition pure islands (VA 0x00408d00, ABI v11).
   DAT_00baa454 = 1.0f (same pool constant as 98dba0 clamp ceiling). */

namespace {

constexpr float kFrameOpaque408d00One = 1.0f; /* DAT_00baa454 bits 0x3f800000 */

}  // namespace

extern "C" float isaac_frame_opaque_408d00_target_f32(int32_t target_frame) {
  /* PE @ 0x00408d57–0x00408d5b: movd xmm0,edi; cvtdq2ps xmm0,xmm0. */
  return static_cast<float>(target_frame);
}

extern "C" int32_t isaac_frame_opaque_408d00_assert_needed(int32_t target_frame,
                                                             int32_t trunc_cur) {
  /* PE @ 0x00408d36–0x00408d38: cmp edi,eax; jge skip_assert. */
  return (target_frame < trunc_cur) ? 1 : 0;
}

extern "C" void isaac_frame_opaque_408d00_clear_mask18(uint32_t* mask18) {
  if (mask18 == nullptr) {
    return;
  }
  /* PE @ 0x00408d5e: mov dword [esi+0x18], 0. */
  *mask18 = 0u;
}

extern "C" int32_t isaac_frame_opaque_408d00_advance_loop_needed(
    float target_f, float current) {
  /* PE @ 0x00408d65–0x00408d6d: comiss xmm0,xmm1; jbe skip.
     Enter loop only on ordered greater (comiss ja). NaN → skip. */
  return (target_f > current) ? 1 : 0;
}

extern "C" float isaac_frame_opaque_408d00_step_frame(float current) {
  /* PE @ 0x00408d70–0x00408d99: floor(current) + DAT_00baa454 (1.0f). */
  const float floored = isaac_frame_opaque_409030_floor_f32(current);
  return floored + kFrameOpaque408d00One;
}

extern "C" void isaac_frame_opaque_408d00_apply_step(float* frame) {
  if (frame == nullptr) {
    return;
  }
  *frame = isaac_frame_opaque_408d00_step_frame(*frame);
}

extern "C" int32_t isaac_frame_opaque_408d00_layer_loop_needed(
    uint32_t layer_count) {
  /* PE @ 0x00408db3–0x00408db6: cmp [eax+0x1c], edi; jbe skip. */
  return (layer_count != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_408d00_null_loop_needed(
    uint32_t null_count) {
  /* PE @ 0x00408dd3–0x00408dd6: cmp [eax+0x24], edi; jbe skip. */
  return (null_count != 0u) ? 1 : 0;
}

extern "C" void isaac_frame_opaque_408d00_residual_plan(
    IsaacFrameOpaque408d00Plan* out,
    float current_frame,
    int32_t target_frame,
    uint32_t layer_count,
    uint32_t null_count) {
  if (out == nullptr) {
    return;
  }

  const float floored_cur = isaac_frame_opaque_409030_floor_f32(current_frame);
  const int32_t trunc_cur = isaac_frame_opaque_409030_trunc_f32(floored_cur);
  const float target_f = isaac_frame_opaque_408d00_target_f32(target_frame);
  const int32_t host_assert =
      isaac_frame_opaque_408d00_assert_needed(target_frame, trunc_cur);
  /* Compare base is original current (assert path reloads live +0x10 which
     is unchanged by the assert log for normal single-thread PE). */
  const int32_t advance_loop =
      isaac_frame_opaque_408d00_advance_loop_needed(target_f, current_frame);

  float cur = current_frame;
  int32_t steps = 0;
  if (advance_loop != 0) {
    /* Cap steps for pathological huge target gaps (animation frames are small;
       PE has no cap — keep a large bound so pure plan cannot hang Wasm). */
    constexpr int32_t kMaxSteps = 1 << 20;
    while (isaac_frame_opaque_408d00_advance_loop_needed(target_f, cur) != 0 &&
           steps < kMaxSteps) {
      cur = isaac_frame_opaque_408d00_step_frame(cur);
      steps += 1;
    }
  }

  const int32_t host_layer =
      isaac_frame_opaque_408d00_layer_loop_needed(layer_count);
  const int32_t host_null =
      isaac_frame_opaque_408d00_null_loop_needed(null_count);

  out->trunc_cur = trunc_cur;
  out->floored_cur = fo_f32_bits(floored_cur);
  out->target_f = fo_f32_bits(target_f);
  out->host_assert = host_assert;
  out->clear_mask18 = 1;
  out->advance_loop = advance_loop;
  out->step_count = steps;
  out->host_408c90 = (steps > 0) ? 1 : 0;
  out->host_layer_loop = host_layer;
  out->host_null_loop = host_null;
  out->final_frame = fo_f32_bits(cur);
  out->pure_complete_ok =
      (host_assert == 0 && advance_loop == 0 && host_layer == 0 &&
       host_null == 0)
          ? 1
          : 0;
}

/* Nested residual 0x00408c90 event-mask pure body (ABI v12) —
   v109 dedupe: law exports REMOVED, OWNED by the Exit family
   (isaac_exit_animstate_408c90_*, ABI v18; the same split as the
   0x40c7f0 twin: Exit holds the law contract, frame-opaque pins the
   host VA). See section-notes/update-v109-dupva-dedupe/. */

/* Nested residual 0x00408b90 layer-position pure CF (ABI v13). */

static_assert(offsetof(IsaacFrameOpaque408b90Plan, anim_present) == 0,
              "408b90 plan anim_present");
static_assert(offsetof(IsaacFrameOpaque408b90Plan, log_needed) == 4,
              "408b90 plan log_needed");
static_assert(offsetof(IsaacFrameOpaque408b90Plan, layer_in_range) == 8,
              "408b90 plan layer_in_range");
static_assert(offsetof(IsaacFrameOpaque408b90Plan, pos_walk_needed) == 12,
              "408b90 plan pos_walk_needed");
static_assert(offsetof(IsaacFrameOpaque408b90Plan, pure_complete_ok) == 16,
              "408b90 plan pure_complete_ok");
static_assert(offsetof(IsaacFrameOpaque408b90Plan, layer_index) == 20,
              "408b90 plan layer_index");
static_assert(offsetof(IsaacFrameOpaque408b90Plan, layer_count) == 24,
              "408b90 plan layer_count");
static_assert(offsetof(IsaacFrameOpaque408b90Plan, current_pos) == 28,
              "408b90 plan current_pos");
static_assert(sizeof(IsaacFrameOpaque408b90Plan) == 32, "408b90 plan size");

extern "C" int32_t isaac_frame_opaque_408b90_anim_present(uint32_t anim_ptr) {
  /* PE @ 0x00408ba6: test edx, edx. */
  return (anim_ptr != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_408b90_layer_in_range(
    int32_t layer_index, int32_t layer_count) {
  /* PE @ 0x00408baa–0x00408bb1: test esi,esi; js fail; cmp esi,[anim+0x1c]; jl ok.
     Signed: index >= 0 && index < count. */
  return (layer_index >= 0 && layer_index < layer_count) ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_408b90_log_needed(uint32_t anim_ptr,
                                                          int32_t layer_index,
                                                          int32_t layer_count) {
  /* PE: anim==0 || index out of range → host log "id out of bounds". */
  if (isaac_frame_opaque_408b90_anim_present(anim_ptr) == 0) {
    return 1;
  }
  if (isaac_frame_opaque_408b90_layer_in_range(layer_index, layer_count) == 0) {
    return 1;
  }
  return 0;
}

extern "C" int32_t isaac_frame_opaque_408b90_pos_walk_needed(
    int32_t current_pos) {
  /* PE @ 0x00408bd9: test ecx,ecx; js skip. */
  return (current_pos >= 0) ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_408b90_entry_offset(int32_t pos) {
  /* PE @ 0x00408bdd: imul edx, ecx, 0x6c — 32-bit wrap. */
  return pos * static_cast<int32_t>(ISAAC_FRAME_OPAQUE_LAYER_ENTRY_STRIDE);
}

extern "C" uint32_t isaac_frame_opaque_408b90_layer_desc_offset(
    int32_t layer_index) {
  /* PE @ 0x00408bd3: shl esi, 4. */
  return static_cast<uint32_t>(layer_index) << 4;
}

extern "C" float isaac_frame_opaque_408b90_entry_frame_f32(
    int32_t entry_frame_i32) {
  /* PE @ 0x00408be9–0x00408bef: movd + cvtdq2ps. */
  return static_cast<float>(entry_frame_i32);
}

extern "C" int32_t isaac_frame_opaque_408b90_target_ge_entry(float target_f,
                                                               float entry_f) {
  /* PE @ 0x00408bf2–0x00408bf5: comiss xmm1,xmm0; jb stop.
     Continue only when NOT (target < entry or unordered). */
  return (target_f >= entry_f) ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_408b90_step_can_advance(
    int32_t candidate,
    int32_t frame_count,
    float target_f,
    int32_t entry_frame_i32) {
  /* PE loop body CF @ 0x00408be0…0x00408bf5. */
  if (candidate >= frame_count) {
    return 0;
  }
  const float entry_f = isaac_frame_opaque_408b90_entry_frame_f32(entry_frame_i32);
  return isaac_frame_opaque_408b90_target_ge_entry(target_f, entry_f);
}

extern "C" int32_t isaac_frame_opaque_408b90_apply_from_entry_frames(
    int32_t current_pos,
    int32_t frame_count,
    float target_f,
    const int32_t* entry_frames,
    uint32_t entry_frames_len) {
  /* Pure body of 0x00408b90 walk when host supplies entry frame times.
     PE loads entry[pos].frame_i32 (+0x68) to gate advance to pos+1. */
  if (current_pos < 0) {
    return current_pos;
  }
  if (entry_frames == nullptr) {
    return current_pos;
  }

  int32_t pos = current_pos;
  /* Cap steps: PE has no bound; avoid Wasm hang on pathological tables. */
  constexpr int32_t kMaxSteps = 1 << 20;
  int32_t steps = 0;
  while (steps < kMaxSteps) {
    const int32_t candidate = pos + 1;
    if (static_cast<uint32_t>(pos) >= entry_frames_len) {
      /* Missing sample for this index — stop without advancing. */
      break;
    }
    const int32_t entry_frame = entry_frames[static_cast<size_t>(pos)];
    if (isaac_frame_opaque_408b90_step_can_advance(candidate, frame_count,
                                                     target_f, entry_frame) ==
        0) {
      break;
    }
    pos = candidate;
    steps += 1;
    if (pos < 0) {
      break; /* PE jns fail (pathological wrap) */
    }
  }
  return pos;
}

extern "C" void isaac_frame_opaque_408b90_residual_plan(
    IsaacFrameOpaque408b90Plan* out,
    uint32_t anim_ptr,
    int32_t layer_index,
    int32_t layer_count,
    int32_t current_pos) {
  if (out == nullptr) {
    return;
  }
  const int32_t present = isaac_frame_opaque_408b90_anim_present(anim_ptr);
  const int32_t in_range =
      isaac_frame_opaque_408b90_layer_in_range(layer_index, layer_count);
  const int32_t log_needed =
      isaac_frame_opaque_408b90_log_needed(anim_ptr, layer_index, layer_count);
  out->anim_present = present;
  out->log_needed = log_needed;
  out->layer_in_range = in_range;
  out->pos_walk_needed = isaac_frame_opaque_408b90_pos_walk_needed(current_pos);
  /* pure walk runnable without host log side effect */
  out->pure_complete_ok = (present != 0 && log_needed == 0) ? 1 : 0;
  out->layer_index = layer_index;
  out->layer_count = layer_count;
  out->current_pos = current_pos;
}

/* Nested residual 0x00408c10 null-layer-position pure CF (ABI v14). */

static_assert(offsetof(IsaacFrameOpaque408c10Plan, anim_present) == 0,
              "408c10 plan anim_present");
static_assert(offsetof(IsaacFrameOpaque408c10Plan, log_needed) == 4,
              "408c10 plan log_needed");
static_assert(offsetof(IsaacFrameOpaque408c10Plan, null_in_range) == 8,
              "408c10 plan null_in_range");
static_assert(offsetof(IsaacFrameOpaque408c10Plan, pos_walk_needed) == 12,
              "408c10 plan pos_walk_needed");
static_assert(offsetof(IsaacFrameOpaque408c10Plan, pure_complete_ok) == 16,
              "408c10 plan pure_complete_ok");
static_assert(offsetof(IsaacFrameOpaque408c10Plan, null_index) == 20,
              "408c10 plan null_index");
static_assert(offsetof(IsaacFrameOpaque408c10Plan, null_count) == 24,
              "408c10 plan null_count");
static_assert(offsetof(IsaacFrameOpaque408c10Plan, current_pos) == 28,
              "408c10 plan current_pos");
static_assert(sizeof(IsaacFrameOpaque408c10Plan) == 32, "408c10 plan size");

extern "C" int32_t isaac_frame_opaque_408c10_anim_present(uint32_t anim_ptr) {
  /* PE @ 0x00408c26: test edx, edx. */
  return (anim_ptr != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_408c10_null_in_range(int32_t null_index,
                                                             int32_t null_count) {
  /* PE @ 0x00408c2a–0x00408c31: test esi,esi; js fail; cmp esi,[anim+0x24]; jl ok.
     Signed: index >= 0 && index < count. */
  return (null_index >= 0 && null_index < null_count) ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_408c10_log_needed(uint32_t anim_ptr,
                                                          int32_t null_index,
                                                          int32_t null_count) {
  /* PE: anim==0 || index out of range → host log "id out of bounds". */
  if (isaac_frame_opaque_408c10_anim_present(anim_ptr) == 0) {
    return 1;
  }
  if (isaac_frame_opaque_408c10_null_in_range(null_index, null_count) == 0) {
    return 1;
  }
  return 0;
}

extern "C" int32_t isaac_frame_opaque_408c10_pos_walk_needed(
    int32_t current_pos) {
  /* PE @ 0x00408c59: test ecx,ecx; js skip. */
  return (current_pos >= 0) ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_408c10_entry_offset(int32_t pos) {
  /* PE @ 0x00408c5d: imul edx, ecx, 0x54 — 32-bit wrap. */
  return pos * static_cast<int32_t>(ISAAC_FRAME_OPAQUE_NULL_ENTRY_STRIDE);
}

extern "C" uint32_t isaac_frame_opaque_408c10_null_desc_offset(
    int32_t null_index) {
  /* PE @ 0x00408c53: shl esi, 4. */
  return static_cast<uint32_t>(null_index) << 4;
}

extern "C" float isaac_frame_opaque_408c10_entry_frame_f32(
    int32_t entry_frame_i32) {
  /* PE @ 0x00408c69–0x00408c6f: movd + cvtdq2ps. */
  return static_cast<float>(entry_frame_i32);
}

extern "C" int32_t isaac_frame_opaque_408c10_target_ge_entry(float target_f,
                                                               float entry_f) {
  /* PE @ 0x00408c72–0x00408c75: comiss xmm1,xmm0; jb stop.
     Continue only when NOT (target < entry or unordered). */
  return (target_f >= entry_f) ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_408c10_step_can_advance(
    int32_t candidate,
    int32_t frame_count,
    float target_f,
    int32_t entry_frame_i32) {
  /* PE loop body CF @ 0x00408c60…0x00408c75. */
  if (candidate >= frame_count) {
    return 0;
  }
  const float entry_f = isaac_frame_opaque_408c10_entry_frame_f32(entry_frame_i32);
  return isaac_frame_opaque_408c10_target_ge_entry(target_f, entry_f);
}

extern "C" int32_t isaac_frame_opaque_408c10_apply_from_entry_frames(
    int32_t current_pos,
    int32_t frame_count,
    float target_f,
    const int32_t* entry_frames,
    uint32_t entry_frames_len) {
  /* Pure body of 0x00408c10 walk when host supplies entry frame times.
     PE loads entry[pos].frame_i32 (+0x50) to gate advance to pos+1. */
  if (current_pos < 0) {
    return current_pos;
  }
  if (entry_frames == nullptr) {
    return current_pos;
  }

  int32_t pos = current_pos;
  /* Cap steps: PE has no bound; avoid Wasm hang on pathological tables. */
  constexpr int32_t kMaxSteps = 1 << 20;
  int32_t steps = 0;
  while (steps < kMaxSteps) {
    const int32_t candidate = pos + 1;
    if (static_cast<uint32_t>(pos) >= entry_frames_len) {
      /* Missing sample for this index — stop without advancing. */
      break;
    }
    const int32_t entry_frame = entry_frames[static_cast<size_t>(pos)];
    if (isaac_frame_opaque_408c10_step_can_advance(candidate, frame_count,
                                                     target_f, entry_frame) ==
        0) {
      break;
    }
    pos = candidate;
    steps += 1;
    if (pos < 0) {
      break; /* PE jns fail (pathological wrap) */
    }
  }
  return pos;
}

extern "C" void isaac_frame_opaque_408c10_residual_plan(
    IsaacFrameOpaque408c10Plan* out,
    uint32_t anim_ptr,
    int32_t null_index,
    int32_t null_count,
    int32_t current_pos) {
  if (out == nullptr) {
    return;
  }
  const int32_t present = isaac_frame_opaque_408c10_anim_present(anim_ptr);
  const int32_t in_range =
      isaac_frame_opaque_408c10_null_in_range(null_index, null_count);
  const int32_t log_needed =
      isaac_frame_opaque_408c10_log_needed(anim_ptr, null_index, null_count);
  out->anim_present = present;
  out->log_needed = log_needed;
  out->null_in_range = in_range;
  out->pos_walk_needed = isaac_frame_opaque_408c10_pos_walk_needed(current_pos);
  /* pure walk runnable without host log side effect */
  out->pure_complete_ok = (present != 0 && log_needed == 0) ? 1 : 0;
  out->null_index = null_index;
  out->null_count = null_count;
  out->current_pos = current_pos;
}

/* ANM2::Update (VA 0x00409100 exact ZHL) pure early-out on [this+0x109]==0. */
extern "C" int32_t isaac_anm2_update_needs_host(int32_t flag_109) {
  return ((static_cast<uint32_t>(flag_109) & 0xffu) != 0u) ? 1 : 0;
}

/* FUN_0040add0 pure empty-list gate (VA 0x0040add0). PE:
     cmp [this+4], 0; je assert_log (host 0xa112c0)
     count = [*this + 0x90]; test count; je return_false
   Host when field_4==0 (assert side effect) or list_count!=0 (string walk).
   Pure false when field_4!=0 && list_count==0 (no stores). */
extern "C" int32_t isaac_frame_opaque_40add0_needs_host(uint32_t field_4,
                                                         uint32_t list_count) {
  if (field_4 == 0u) {
    return 1;
  }
  if (list_count != 0u) {
    return 1;
  }
  return 0;
}

/* FUN_0040add0 match-path bit test (VA 0x0040ae4e…0x0040ae6a). PE:
     test edi,edi; js return_false
     eax = 1; shl eax, cl (cl = match_index low 5 bits on x86)
     test [this+0x18], eax; setne al */
extern "C" int32_t isaac_frame_opaque_40add0_bit_result(uint32_t bitfield_18,
                                                          int32_t match_index) {
  if (match_index < 0) {
    return 0;
  }
  const uint32_t shift = static_cast<uint32_t>(match_index) & 31u;
  const uint32_t mask = 1u << shift;
  return (bitfield_18 & mask) != 0u ? 1 : 0;
}

/* FUN_0040add0 list-walk pure stride/index/SSO (VA 0x0040ae05…0x0040ae41). */
extern "C" uint32_t isaac_frame_opaque_40add0_entry_stride(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_40ADD0_ENTRY_STRIDE);
}

extern "C" int32_t isaac_frame_opaque_40add0_sso_inline(uint32_t capacity_14) {
  /* PE: cmp dword [esi+0x14], 0x10; jb → inline buffer at entry. */
  return (capacity_14 < static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_40ADD0_SSO_CAPACITY))
             ? 1
             : 0;
}

extern "C" uint32_t isaac_frame_opaque_40add0_entry_data_addr(uint32_t entry_addr,
                                                               uint32_t capacity_14,
                                                               uint32_t dword0) {
  if (capacity_14 < static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_40ADD0_SSO_CAPACITY)) {
    return entry_addr;
  }
  return dword0;
}

extern "C" int32_t isaac_frame_opaque_40add0_walk_in_range(uint32_t index,
                                                            uint32_t list_count) {
  /* PE: cmp edi, ebx; jb loop — unsigned. */
  return (index < list_count) ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_40add0_walk_after_miss(uint32_t* index,
                                                              uint32_t* entry_addr,
                                                              uint32_t list_count) {
  if (index == nullptr || entry_addr == nullptr) {
    return 0;
  }
  /* PE: inc edi; add esi, 0x18; cmp edi, ebx; jb 0x40ae05 */
  *index = *index + 1u;
  *entry_addr =
      *entry_addr + static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_40ADD0_ENTRY_STRIDE);
  return (*index < list_count) ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_40add0_first_match_index(
    const uint8_t* equal_flags,
    uint32_t list_count) {
  if (equal_flags == nullptr || list_count == 0u) {
    return -1;
  }
  /* PE walk: edi=0..count-1; first strcmp equal → match_path. */
  for (uint32_t i = 0; i < list_count; ++i) {
    if (equal_flags[i] != 0u) {
      return static_cast<int32_t>(i);
    }
  }
  return -1;
}

/* FUN_0040add0 inlined strcmp (VA 0x0040ae12…0x0040ae37). PE two-byte pair
   loop + sbb/or unequal result. Not a CRT call. */
extern "C" int32_t isaac_frame_opaque_40add0_strcmp(const uint8_t* a,
                                                      const uint8_t* b) {
  if (a == nullptr || b == nullptr) {
    /* Guest would fault; freestanding treats null as unequal (+1). */
    return 1;
  }
  /* Exact PE pair loop (entry in eax, needle in ecx after SSO resolve):
       mov dl,[eax]; cmp dl,[ecx]; jne uneq
       test dl,dl; je eq
       mov dl,[eax+1]; cmp dl,[ecx+1]; jne uneq
       add eax,2; add ecx,2; test dl,dl; jne loop
     eq: xor eax,eax
     uneq: sbb eax,eax; or eax,1 */
  for (;;) {
    const uint8_t da0 = a[0];
    const uint8_t db0 = b[0];
    if (da0 != db0) {
      /* sbb eax,eax from CF of (da0 - db0): CF set when da0 < db0 → -1;
         CF clear when da0 > db0 → 0; then or 1 → -1 or +1. */
      return (da0 < db0) ? -1 : 1;
    }
    if (da0 == 0u) {
      return 0;
    }
    const uint8_t da1 = a[1];
    const uint8_t db1 = b[1];
    if (da1 != db1) {
      return (da1 < db1) ? -1 : 1;
    }
    a += 2;
    b += 2;
    if (da1 == 0u) {
      return 0;
    }
  }
}

extern "C" int32_t isaac_frame_opaque_40add0_strcmp_equal(const uint8_t* a,
                                                            const uint8_t* b) {
  /* PE: test eax,eax; je match_path */
  return (isaac_frame_opaque_40add0_strcmp(a, b) == 0) ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_40add0_probe_from_equal_flags(
    const uint8_t* equal_flags,
    uint32_t list_count,
    uint32_t bitfield_18) {
  /* Equality-pack pure probe: first match then bit test. No match → al=0. */
  const int32_t match =
      isaac_frame_opaque_40add0_first_match_index(equal_flags, list_count);
  if (match < 0) {
    return 0;
  }
  return isaac_frame_opaque_40add0_bit_result(bitfield_18, match);
}

extern "C" int32_t isaac_frame_opaque_40add0_needs_host_with_flags(
    uint32_t field_4,
    uint32_t list_count,
    int32_t equal_flags_ready) {
  if (field_4 == 0u) {
    return 1; /* assert log always host */
  }
  if (equal_flags_ready != 0) {
    /* Walk pure via probe_from_equal_flags; no live guest string loads. */
    return 0;
  }
  return isaac_frame_opaque_40add0_needs_host(field_4, list_count);
}

/* 4212c0 secondary==3 pure terminal after false probe (VA 0x004213de). */
extern "C" void isaac_frame_opaque_4212c0_secondary3_after_probe_false(
    int32_t* mode,
    int32_t* secondary,
    int32_t field_3c,
    uint32_t flag_4c) {
  if (mode == nullptr || secondary == nullptr) {
    return;
  }
  /* PE: cmp [esi+0x3c],0; je clear; cmp byte [esi+0x4c],0; jne ret.
     The +0x4c test is a LOW-BYTE zero test — the mask is load-bearing
     (the v28 int8_t form skipped the clear-both at 0x100 on the shipped
     module where the PE performs it). */
  if (field_3c != 0 && (flag_4c & 0xffu) != 0u) {
    return;
  }
  *mode = 0;
  *secondary = 0;
}

/* Compile-time pin of the widened signatures: no by-value 8-bit scalar
   parameter may ever return to these exports (the Wasm ABI does not
   narrow i32 arguments; -O2 deletes the in-body mask behind an 8-bit
   parameter type). The multi-line-aware header census in the test file
   is the family-wide guard; these asserts make the two once-broken
   prototypes unrevertable at compile time. */
namespace {
template <class T, class U> struct IsaacFoSameType { enum { value = 0 }; };
template <class T> struct IsaacFoSameType<T, T> { enum { value = 1 }; };
}  // namespace
static_assert(
    IsaacFoSameType<decltype(isaac_frame_opaque_4212c0_try_pure),
                    int32_t(int32_t*, int32_t*, int32_t, uint32_t, uint32_t,
                            uint32_t)>::value,
    "4212c0 try_pure must take uint32_t byte params (wide, masked in body)");
static_assert(
    IsaacFoSameType<decltype(isaac_frame_opaque_4212c0_secondary3_after_probe_false),
                    void(int32_t*, int32_t*, int32_t, uint32_t)>::value,
    "4212c0 secondary3 must take a uint32_t byte param (wide, masked in body)");

/* FrameOpaque_4257b0 prologue: cmp [Game+0x26614], 2; jge early-return. */
extern "C" int32_t isaac_frame_opaque_4257b0_needs_host(
    int32_t timed_transition_cleanup_mode) {
  return timed_transition_cleanup_mode < 2 ? 1 : 0;
}

/* Pass A: if (FUN_009b9480() == 0) skip entire ID-ensure loop (no writes). */
extern "C" int32_t isaac_frame_opaque_4257b0_pass_a_needs_host(uint32_t id_count) {
  return id_count != 0u ? 1 : 0;
}

/* Pass B: list walk when non-empty after possible Pass A inserts.
   id_count!=0 → Pass A may append → always run Pass B when open-gate.
   id_count==0 → list length is stable; skip when list_count==0. */
extern "C" int32_t isaac_frame_opaque_4257b0_pass_b_needs_host(uint32_t id_count,
                                                                uint32_t list_count) {
  return (id_count != 0u || list_count != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_4257b0_pass_b_needs_host_recaptured(
    uint32_t post_pass_a_list_count) {
  /* PE @ 0x00425894: je 0x004259a2 when the re-derived count is zero. */
  return (post_pass_a_list_count != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_4257b0_pass_a_id_considered(int32_t lo,
                                                                   int32_t hi) {
  /* PE @ 0x00425810: and ecx,eax; cmp ecx,-1; je skip-this-id. */
  return ((lo & hi) != -1) ? 1 : 0;
}

extern "C" uint32_t isaac_frame_opaque_4257b0_post_pass_a_count(
    uint32_t pre_list_count, uint32_t inserted) {
  /* Each 0x004259b0 append adds one 0x68 element; 32-bit wrap. */
  return (uint32_t)(pre_list_count + inserted);
}

/* ---- FUN_004257b0 Pass A count law + F4 capture contract (ABI v27) ---- */

namespace {
inline uint32_t fo_4257b0_load_u32(const uint8_t* p) {
  uint32_t v;
  __builtin_memcpy(&v, p, sizeof(v));
  return v;
}
inline void fo_4257b0_store_u32(uint8_t* p, uint32_t v) {
  __builtin_memcpy(p, &v, sizeof(v));
}
}  // namespace

extern "C" uint32_t isaac_frame_opaque_4257b0_list_count_from_bounds(
    uint32_t begin_ptr, uint32_t end_ptr) {
  /* 0x00425886 sub ecx,esi          — 32-bit wrapping delta
     0x00425888 imul ecx             — SIGNED widening, eax = 0x4ec4ec4f
     0x0042588a sar edx,5            — arithmetic shift of the high dword
     0x0042588d mov eax,edx
     0x0042588f shr eax,0x1f         — logical: isolates the sign bit
     0x00425892 add eax,edx          — quotient truncated toward zero */
  const uint32_t delta = end_ptr - begin_ptr;
  const int64_t prod =
      (int64_t)(int32_t)delta *
      (int64_t)(int32_t)ISAAC_FRAME_OPAQUE_4257B0_DIV_MAGIC;
  int32_t high = (int32_t)((uint64_t)prod >> 32);
  high >>= ISAAC_FRAME_OPAQUE_4257B0_DIV_SHIFT; /* C++20: arithmetic */
  return (uint32_t)high + (((uint32_t)high) >> 31);
}

extern "C" int32_t isaac_frame_opaque_4257b0_pass_a_scan_found(
    const uint8_t* list_base, uint32_t count, uint32_t lo, uint32_t hi) {
  if (list_base == nullptr) {
    return 0;
  }
  /* 0x00425835 je: a zero count skips the scan (straight to the append).
     The loop bound compare is UNSIGNED (0x00425846 jb). */
  const uint8_t* entry = list_base;
  for (uint32_t i = 0; i < count;
       ++i, entry += ISAAC_FRAME_OPAQUE_4257B0_ELEM_STRIDE) {
    /* 0x00425837 cmp [ecx],ebx — lo first; 0x0042583b cmp [ecx+4],edx —
       hi second; 0x0042583e je — first match wins. */
    if (fo_4257b0_load_u32(entry) == lo &&
        fo_4257b0_load_u32(entry + 4) == hi) {
      return 1;
    }
  }
  return 0;
}

extern "C" int32_t isaac_frame_opaque_4257b0_pass_a_insert_decision(
    const uint8_t* list_base, uint32_t count, uint32_t lo, uint32_t hi) {
  /* 0x00425810 and ecx,eax; 0x00425812 cmp ecx,-1; 0x00425815 je skip. */
  if ((lo & hi) == 0xffffffffu) {
    return 0;
  }
  /* 0x0042583e je found → 0x00425857 skip; fall-out → 0x00425848 append. */
  return isaac_frame_opaque_4257b0_pass_a_scan_found(list_base, count, lo,
                                                     hi) != 0
             ? 0
             : 1;
}

extern "C" uint32_t isaac_frame_opaque_4257b0_pass_a_apply_append(
    uint8_t* list_base, uint32_t count, uint32_t lo, uint32_t hi) {
  if (list_base == nullptr) {
    return count;
  }
  uint8_t* elem =
      list_base + (size_t)count * ISAAC_FRAME_OPAQUE_4257B0_ELEM_STRIDE;
  /* Template dwords 0x00425a04/0x00425a07/0x00425a0a copied by the
     0x00425a20 rep movsd; +8 re-stored at 0x00425a47 mov [esi-0x60],1. */
  fo_4257b0_store_u32(elem + 0, lo);
  fo_4257b0_store_u32(elem + 4, hi);
  fo_4257b0_store_u32(elem + 8, (uint32_t)ISAAC_FRAME_OPAQUE_4257B0_ELEM_TIMER_INIT);
  /* 0x00425a3f memset(new_end - 0x5c, 0, 0x58) → +0xc..+0x63. */
  for (uint32_t i = 0; i < (uint32_t)ISAAC_FRAME_OPAQUE_4257B0_ELEM_ZERO_BYTES;
       ++i) {
    elem[(uint32_t)ISAAC_FRAME_OPAQUE_4257B0_ELEM_ZERO_OFF + i] = 0;
  }
  /* Bytes +0x64..+0x67 deliberately untouched: the PE copies uninitialized
     stack there and the pure model must not invent a value. */
  /* 0x00425a22 add [ebx+4],0x68 (or the 0x00426640 grow): count + 1. */
  return count + 1u;
}

extern "C" uint32_t isaac_frame_opaque_4257b0_pass_a_count_evolution(
    uint8_t* list_base, uint32_t initial_count, const uint32_t* id_pairs,
    uint32_t id_count) {
  if (list_base == nullptr || id_pairs == nullptr) {
    return initial_count;
  }
  uint32_t count = initial_count;
  /* 0x0042586a cmp eax,[esp+0x20]; 0x0042586e jb — the id bound was
     captured ONCE before the loop; the scan bound below is re-derived
     from the evolving list on EVERY id (0x00425817…0x0042582f). */
  for (uint32_t j = 0; j < id_count; ++j) {
    const uint32_t lo = id_pairs[2u * j];
    const uint32_t hi = id_pairs[2u * j + 1u];
    if (isaac_frame_opaque_4257b0_pass_a_insert_decision(list_base, count, lo,
                                                         hi) != 0) {
      count = isaac_frame_opaque_4257b0_pass_a_apply_append(list_base, count,
                                                            lo, hi);
    }
  }
  return count;
}

/* ---- FUN_004257b0 Pass B per-element walk interior (ABI v28) ---- */

extern "C" int32_t isaac_frame_opaque_90abf0_pair_matches(uint32_t sub_ptr,
                                                           uint32_t sub_lo,
                                                           uint32_t sub_hi,
                                                           uint32_t entry_lo,
                                                           uint32_t entry_hi) {
  /* 0x0090ac28 test eax,eax; je — null sub takes the xorps/movlpd (0,0)
     pair at 0x0090ac34. Full 32-bit pointer test. */
  const uint32_t pair_lo = (sub_ptr != 0u) ? sub_lo : 0u;
  const uint32_t pair_hi = (sub_ptr != 0u) ? sub_hi : 0u;
  /* 0x0090ac42 cmp edi,[ebp+8] (lo first); 0x0090ac47 cmp eax,[ebp-4]. */
  if (pair_lo != entry_lo) {
    return 0;
  }
  return (pair_hi == entry_hi) ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_90abf0_match_index(
    const uint32_t* sub_ptrs, const uint32_t* sub_lo, const uint32_t* sub_hi,
    uint32_t count, uint32_t entry_lo, uint32_t entry_hi) {
  if (sub_ptrs == nullptr || sub_lo == nullptr || sub_hi == nullptr) {
    return -1;
  }
  /* 0x0090ac05 test ecx,ecx; je — only an EXACT zero skips the walk;
     0x0090ac52 jb — unsigned bound; first match wins (0x0090ac4a je). */
  for (uint32_t i = 0; i < count; ++i) {
    if (isaac_frame_opaque_90abf0_pair_matches(sub_ptrs[i], sub_lo[i],
                                               sub_hi[i], entry_lo,
                                               entry_hi) != 0) {
      return static_cast<int32_t>(i);
    }
  }
  return -1;
}

namespace {
/* The 0x00b2415c character table keys, read off the PE .rdata bytes
   (section READ-ONLY 0x40000040; sole absolute reference image-wide is
   the mov edx,imm32 at 0x00949bcd). Row-major in PE scan order: block 0
   rows 0..16, block 1 rows 0..16. The 18th row of each block exists in
   the data (block 0 row 17 = 0x15, block 1 row 17 = 0xd) but is NEVER
   compared — the inner bound is `cmp esi,0x12; jb` with esi starting
   at 1. */
const uint32_t k949bc0Keys[2][17] = {
    {0x00u, 0x01u, 0x02u, 0x03u, 0x04u, 0x05u, 0x06u, 0x07u, 0x08u, 0x09u,
     0x0au, 0x0du, 0x0eu, 0x0fu, 0x10u, 0x12u, 0x13u},
    {0x15u, 0x16u, 0x17u, 0x18u, 0x19u, 0x1au, 0x1bu, 0x1cu, 0x1du, 0x1eu,
     0x1fu, 0x20u, 0x21u, 0x22u, 0x23u, 0x24u, 0x25u},
};
}  // namespace

extern "C" uint32_t isaac_frame_opaque_949bc0_key_at(uint32_t block,
                                                      uint32_t row) {
  if (block >= (uint32_t)ISAAC_FRAME_OPAQUE_949BC0_BLOCKS ||
      row >= (uint32_t)ISAAC_FRAME_OPAQUE_949BC0_ROWS_SCANNED) {
    return 0xffffffffu;
  }
  return k949bc0Keys[block][row];
}

extern "C" void isaac_frame_opaque_949bc0_lookup(
    IsaacFrameOpaque949bc0Lookup* out, uint32_t char_id) {
  if (out == nullptr) {
    return;
  }
  /* Outer 0x00949bd3…0x00949c00: blocks 0 and 1 (cmp edi,0x360; jb).
     Inner 0x00949be0…0x00949beb: esi = 1..0x11 over rows 0..16
     (cmp esi,0x12; jb). Found: *slot = esi (1-based row) and
     *byte = sete(block == 1) — 0x00949c0c cmp ebx,1 / 0x00949c10. */
  for (uint32_t block = 0; block < (uint32_t)ISAAC_FRAME_OPAQUE_949BC0_BLOCKS;
       ++block) {
    for (uint32_t row = 0;
         row < (uint32_t)ISAAC_FRAME_OPAQUE_949BC0_ROWS_SCANNED; ++row) {
      if (k949bc0Keys[block][row] == char_id) {
        out->found = 1;
        out->row = row + 1u;
        out->block1 = (block == 1u) ? 1 : 0;
        return;
      }
    }
  }
  /* NOT-FOUND (0x00949c02…0x00949c08): the PE writes NEITHER out-param.
     found=0 with row/block1 pinned 0 is a model convenience; consumers
     must take the stale-channel law instead. */
  out->found = 0;
  out->row = 0u;
  out->block1 = 0;
}

static_assert(sizeof(IsaacFrameOpaque949bc0Lookup) == 12,
              "949bc0 lookup size");

extern "C" void isaac_frame_opaque_4257b0_pass_b_store_plan(
    IsaacFrameOpaque4257b0PassBStorePlan* out, int32_t lookup_found,
    uint32_t lookup_row, int32_t lookup_block1, uint32_t stale_slot_value,
    uint32_t stale_byte13) {
  if (out == nullptr) {
    return;
  }
  /* The byte slot holds 8 bits — re-narrow the wide parameter exactly as
     the PE byte cmp at 0x00425915 sees it. */
  uint32_t slot = stale_slot_value;
  uint32_t byte13 = stale_byte13 & 0xffu;
  if (lookup_found != 0) {
    /* Found path 0x00949c09…0x00949c1f: mov [eax],esi then mov [eax],cl
       — the ONLY writers of the two channels. */
    slot = lookup_row;
    byte13 = (lookup_block1 != 0) ? 1u : 0u;
  }
  /* 0x0042591e mov eax,[esp+0x20]; 0x00425924 store; 0x00425915 byte cmp
     decides the 0x0042592c add dword +0x11 (32-bit RMW). */
  const int32_t boost = (byte13 != 0u) ? 1 : 0;
  out->store_value = slot;
  out->boost = boost;
  out->final_value =
      slot + (boost != 0 ? (uint32_t)ISAAC_FRAME_OPAQUE_4257B0_PASS_B_BOOST
                         : 0u);
  out->slot_out = slot;
  out->byte13_out = byte13;
}

static_assert(offsetof(IsaacFrameOpaque4257b0PassBStorePlan, store_value) == 0,
              "passb store store_value");
static_assert(offsetof(IsaacFrameOpaque4257b0PassBStorePlan, boost) == 4,
              "passb store boost");
static_assert(offsetof(IsaacFrameOpaque4257b0PassBStorePlan, final_value) == 8,
              "passb store final_value");
static_assert(offsetof(IsaacFrameOpaque4257b0PassBStorePlan, slot_out) == 12,
              "passb store slot_out");
static_assert(offsetof(IsaacFrameOpaque4257b0PassBStorePlan, byte13_out) == 16,
              "passb store byte13_out");
static_assert(sizeof(IsaacFrameOpaque4257b0PassBStorePlan) == 20,
              "passb store plan size");

extern "C" void isaac_frame_opaque_4257b0_pass_b_entry_plan(
    IsaacFrameOpaque4257b0PassBEntryPlan* out, int32_t container_empty,
    int32_t obj_match_found, uint32_t obj_field_c, uint32_t entry_lo,
    int32_t player_match_index, uint32_t player_char_13c0,
    uint32_t stale_slot_value, uint32_t stale_byte13) {
  if (out == nullptr) {
    return;
  }
  const int32_t empty = (container_empty != 0) ? 1 : 0;
  out->container_empty = empty;
  /* 0x004258b8 je 0x00425933: the empty arm never reaches the 0x004258ba
     call site. */
  out->probe_90abf0 = (empty == 0) ? 1 : 0;
  int32_t have_id = 0;
  uint32_t id = 0u;
  if (empty != 0) {
    /* 0x00425943 mov edi,[edi] — the entry's own lo dword. */
    have_id = 1;
    id = entry_lo;
  } else if (obj_match_found != 0) {
    /* 0x004258c8 mov edi,[eax+0xc] — the matched element's id field;
       0x004258c2 je skips the whole entry when the walk returned null. */
    have_id = 1;
    id = obj_field_c;
  }
  out->have_id = have_id;
  out->id = id;
  const int32_t player_match =
      (have_id != 0 && player_match_index >= 0) ? 1 : 0;
  out->player_match = player_match;
  out->lookup_949bc0 = player_match;
  out->store_entry8 = player_match;
  if (player_match != 0) {
    IsaacFrameOpaque949bc0Lookup lk;
    isaac_frame_opaque_949bc0_lookup(&lk, player_char_13c0);
    IsaacFrameOpaque4257b0PassBStorePlan sp;
    isaac_frame_opaque_4257b0_pass_b_store_plan(&sp, lk.found, lk.row,
                                                lk.block1, stale_slot_value,
                                                stale_byte13);
    out->lookup_found = lk.found;
    out->store_value = sp.store_value;
    out->boost = sp.boost;
    out->final_value = sp.final_value;
    out->slot_out = sp.slot_out;
    out->byte13_out = sp.byte13_out;
    return;
  }
  /* No lookup: both stale channels pass through unchanged (the byte slot
     still physically holds 8 bits). */
  out->lookup_found = 0;
  out->store_value = 0u;
  out->boost = 0;
  out->final_value = 0u;
  out->slot_out = stale_slot_value;
  out->byte13_out = stale_byte13 & 0xffu;
}

static_assert(offsetof(IsaacFrameOpaque4257b0PassBEntryPlan,
                       container_empty) == 0,
              "passb entry container_empty");
static_assert(offsetof(IsaacFrameOpaque4257b0PassBEntryPlan, probe_90abf0) ==
                  4,
              "passb entry probe_90abf0");
static_assert(offsetof(IsaacFrameOpaque4257b0PassBEntryPlan, have_id) == 8,
              "passb entry have_id");
static_assert(offsetof(IsaacFrameOpaque4257b0PassBEntryPlan, id) == 12,
              "passb entry id");
static_assert(offsetof(IsaacFrameOpaque4257b0PassBEntryPlan, player_match) ==
                  16,
              "passb entry player_match");
static_assert(offsetof(IsaacFrameOpaque4257b0PassBEntryPlan, lookup_949bc0) ==
                  20,
              "passb entry lookup_949bc0");
static_assert(offsetof(IsaacFrameOpaque4257b0PassBEntryPlan, lookup_found) ==
                  24,
              "passb entry lookup_found");
static_assert(offsetof(IsaacFrameOpaque4257b0PassBEntryPlan, store_entry8) ==
                  28,
              "passb entry store_entry8");
static_assert(offsetof(IsaacFrameOpaque4257b0PassBEntryPlan, store_value) ==
                  32,
              "passb entry store_value");
static_assert(offsetof(IsaacFrameOpaque4257b0PassBEntryPlan, boost) == 36,
              "passb entry boost");
static_assert(offsetof(IsaacFrameOpaque4257b0PassBEntryPlan, final_value) ==
                  40,
              "passb entry final_value");
static_assert(offsetof(IsaacFrameOpaque4257b0PassBEntryPlan, slot_out) == 44,
              "passb entry slot_out");
static_assert(offsetof(IsaacFrameOpaque4257b0PassBEntryPlan, byte13_out) == 48,
              "passb entry byte13_out");
static_assert(sizeof(IsaacFrameOpaque4257b0PassBEntryPlan) == 52,
              "passb entry plan size");

extern "C" uint32_t isaac_frame_opaque_4257b0_pass_b_apply(
    uint8_t* list_base, uint32_t list_begin_va, uint32_t list_end_va,
    uint32_t ctr_begin, uint32_t ctr_end, const uint32_t* ctr_sub_ptrs,
    const uint32_t* ctr_sub_lo, const uint32_t* ctr_sub_hi,
    const uint32_t* ctr_field_c, uint32_t ctr_samples_len,
    uint32_t idvec_begin, uint32_t idvec_end, const int32_t* player_ids_1618,
    const uint32_t* player_chars_13c0, uint32_t player_samples_len,
    uint32_t pass_a_id_count, uint32_t initial_byte13) {
  if (list_base == nullptr) {
    return 0u;
  }
  /* 0x00425894 je 0x004259a2 — the v27 recaptured gate: a zero count
     never enters the do-while. */
  uint32_t bound = isaac_frame_opaque_4257b0_list_count_from_bounds(
      list_begin_va, list_end_va);
  if (bound == 0u) {
    return 0u;
  }
  /* 0x004258b5 je — POINTER equality selects the arm, never a count. */
  const int32_t ctr_empty =
      isaac_frame_opaque_98dba0_mp_range_empty(ctr_begin, ctr_end);
  /* Stale channels: F+0x20 still holds Pass A's id_count; F+0x13 is
     uninitialized stack until the first found lookup (supplied, not
     invented). */
  uint32_t slot = pass_a_id_count;
  uint32_t byte13 = initial_byte13 & 0xffu;
  uint32_t stores = 0u;
  uint32_t offset = 0u; /* F+0x14 */
  uint32_t index = 0u;  /* F+0x1c */
  do {
    uint8_t* entry = list_base + offset;
    int32_t have_id = 0;
    uint32_t id = 0u;
    if (ctr_empty != 0) {
      /* 0x00425943 mov edi,[edi]: id = dw[entry+0]. */
      have_id = 1;
      id = fo_4257b0_load_u32(entry);
    } else {
      /* 0x004258ba push edi; call 0x0090abf0 — read-only leaf. The callee
         re-derives (end-begin) SAR 2 itself (0x0090abfb/0x0090abfd);
         clamped here to the supplied samples. */
      uint32_t walk_bound = (uint32_t)isaac_frame_opaque_98dba0_vector_count(
          ctr_begin, ctr_end);
      if (walk_bound > ctr_samples_len) {
        walk_bound = ctr_samples_len;
      }
      const int32_t obj_idx = isaac_frame_opaque_90abf0_match_index(
          ctr_sub_ptrs, ctr_sub_lo, ctr_sub_hi, walk_bound,
          fo_4257b0_load_u32(entry), fo_4257b0_load_u32(entry + 4));
      if (obj_idx >= 0 && ctr_field_c != nullptr) {
        /* 0x004258c8 mov edi,[eax+0xc]. */
        have_id = 1;
        id = ctr_field_c[obj_idx];
      }
    }
    if (have_id != 0) {
      /* Player walk (0x004258cd / 0x00425933 arms — same template): the
         bound is re-read from Game+0x1baa8/+0x1baac per outer iteration
         in the PE; nothing in Pass B writes them. */
      uint32_t pbound = (uint32_t)isaac_frame_opaque_98dba0_vector_count(
          idvec_begin, idvec_end);
      if (pbound > player_samples_len) {
        pbound = player_samples_len;
      }
      const int32_t pidx = isaac_frame_opaque_98dba0_mp_first_match_index(
          player_ids_1618, pbound, (int32_t)id);
      if (pidx >= 0 && player_chars_13c0 != nullptr) {
        IsaacFrameOpaque949bc0Lookup lk;
        isaac_frame_opaque_949bc0_lookup(&lk, player_chars_13c0[pidx]);
        IsaacFrameOpaque4257b0PassBStorePlan sp;
        isaac_frame_opaque_4257b0_pass_b_store_plan(&sp, lk.found, lk.row,
                                                    lk.block1, slot, byte13);
        /* 0x00425924 store + optional 0x0042592c RMW with no observer
           between — the net dword is the final value. The PE re-reads the
           live begin for the address; the buffer cannot move here. */
        fo_4257b0_store_u32(entry + ISAAC_FRAME_OPAQUE_4257B0_ENTRY_VALUE_OFF,
                            sp.final_value);
        slot = sp.slot_out;
        byte13 = sp.byte13_out;
        stores += 1u;
      }
    }
    /* 0x0042596a add edx,0x68; 0x00425975 inc edi; recount from the LIVE
       pointer pair every iteration (0x0042597a…0x00425994) — invariant
       here (no writer inside Pass B), re-derived structurally. */
    offset += (uint32_t)ISAAC_FRAME_OPAQUE_4257B0_ELEM_STRIDE;
    index += 1u;
    bound = isaac_frame_opaque_4257b0_list_count_from_bounds(list_begin_va,
                                                             list_end_va);
  } while (index < bound); /* 0x0042599c jb — unsigned */
  return stores;
}

/* MenuGate_Update pure early-out: *menu==0 OR dual-gate (1b83c && 1ba74). */
extern "C" int32_t isaac_menu_gate_update_needs_host(
    int32_t menu_state_23a74,
    int32_t gate_1b83c,
    int32_t predicate_1ba74) {
  if (menu_state_23a74 == 0) {
    return 0;
  }
  if (gate_1b83c != 0 && predicate_1ba74 != 0) {
    return 0;
  }
  return 1;
}

/* FUN_0098dba0 pure islands. PE float32 bits from hash-bound constant pool
   (Ghidra DAT_00baa* labels; values match room pure helpers):
     DAT_00baa120 = 0.1f  (0x3dcccccd)
     DAT_00baa198 = 0.2f  (0x3e4ccccd)
     DAT_00baa3e0 = 0.9f  (0x3f666666)
     DAT_00baa454 = 1.0f  (0x3f800000)
   Machine order recovered from prolog bytes at VA 0x0098df1e…0x0098e16a. */

extern "C" int32_t isaac_frame_opaque_98dba0_bvar2_counter_step(
    int32_t* counter,
    int32_t bVar2) {
  if (counter == nullptr) {
    return 0;
  }
  if (bVar2 == 0) {
    return 0;
  }
  /* PE: param_1[2] = param_1[2] + 1; if == 10 then FUN_00746560(1). */
  const int32_t next = *counter + 1;
  *counter = next;
  return next == 10 ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_98dba0_mode_float_step(
    IsaacFrameOpaque98dba0State* state,
    int32_t bVar2,
    float manager_2a35c) {
  if (state == nullptr) {
    return 0;
  }

  const float step_0_1 = __builtin_bit_cast(float, 0x3dcccccdu);  /* DAT_00baa120 */
  const float step_0_2 = __builtin_bit_cast(float, 0x3e4ccccdu);  /* DAT_00baa198 */
  const float thr_0_9 = __builtin_bit_cast(float, 0x3f666666u);   /* DAT_00baa3e0 */
  const float one = __builtin_bit_cast(float, 0x3f800000u);       /* DAT_00baa454 */
  const float zero = 0.0f;
  const int32_t bv = bVar2 != 0 ? 1 : 0;

  const int32_t mode = state->mode;
  if (mode == 0) {
    /* mode 0: ramp float_170 toward 1.0; decay float_2d0 by 0.2. */
    float f170 = fo_bits_f32(state->float_170);
    if (f170 < thr_0_9) {
      f170 = f170 + step_0_1;
    } else {
      f170 = one;
    }
    state->float_170 = fo_f32_bits(f170);

    float f2d0 = fo_bits_f32(state->float_2d0);
    if (f2d0 <= step_0_2) {
      f2d0 = zero;
    } else {
      f2d0 = f2d0 - step_0_2;
    }
    state->float_2d0 = fo_f32_bits(f2d0);

    /* LAB_0098e157 */
    if (bv != 0) {
      state->mode = 1;
      return 0; /* direct to clamp */
    }
    state->counter = 0;
    return 1; /* fallthrough */
  }

  if (mode == 1) {
    if (state->flag == 0) {
      float f170 = fo_bits_f32(state->float_170);
      if (f170 <= step_0_2) {
        f170 = zero;
      } else {
        f170 = f170 - step_0_2;
      }
      state->float_170 = fo_f32_bits(f170);

      if (static_cast<uint32_t>(state->counter) < 9u) {
        if (bv != 0) {
          /* LAB_0098e0cd */
          state->float_2d0 = fo_f32_bits(fo_bits_f32(state->float_2d0) + step_0_1);
          return 0;
        }
        /* PE 0x0098e0be/0x0098e0c4 then jmp 0x0098df47 (FALLTHROUGH). */
        state->mode = 2;
        state->flag = 1;
        state->counter = 0;
        return 1;
      }
      state->float_2d0 = fo_f32_bits(one);
      if (bv != 0) {
        return 0; /* PE 0x0098e0f6: jne 0x0098df73 (clamp-direct). */
      }
      /* PE 0x0098e0fc then jmp 0x0098df47 (FALLTHROUGH). */
      state->mode = 0;
      state->counter = 0;
      return 1;
    }

    /* flag != 0 */
    state->float_170 = fo_f32_bits(zero);
    if (static_cast<uint32_t>(state->counter) < 9u) {
      if (bv != 0) {
        state->float_2d0 = fo_f32_bits(fo_bits_f32(state->float_2d0) + step_0_1);
        return 0;
      }
      /* PE 0x0098e063/0x0098e069 then jmp 0x0098df47 (FALLTHROUGH). */
      state->mode = 0;
      state->flag = 0; /* PE writes bl, which is 0 on this path */
      state->counter = 0;
      return 1;
    }
    state->float_2d0 = fo_f32_bits(one);
    if (bv != 0) {
      return 0; /* PE 0x0098e07d: jne 0x0098df73 (clamp-direct). */
    }
    /* PE 0x0098e083 then jmp 0x0098df47 (FALLTHROUGH). */
    state->mode = 2;
    state->counter = 0;
    return 1;
  }

  if (mode == 2) {
    state->counter = 0;
    float f170 = fo_bits_f32(state->float_170);
    if (f170 <= step_0_2) {
      f170 = zero;
    } else {
      f170 = f170 - step_0_2;
    }
    state->float_170 = fo_f32_bits(f170);

    /* Approach manager_2a35c within ±0.1. */
    float f2d0 = fo_bits_f32(state->float_2d0);
    const float target = manager_2a35c;
    if (f2d0 <= target + step_0_1) {
      if (target - step_0_1 <= f2d0) {
        f2d0 = target;
      } else {
        f2d0 = f2d0 + step_0_1;
      }
    } else {
      f2d0 = f2d0 - step_0_1;
    }
    state->float_2d0 = fo_f32_bits(f2d0);

    /* LAB_0098e157 */
    if (bv != 0) {
      state->mode = 1;
      return 0;
    }
    state->counter = 0; /* already 0; keep exact fallthrough store */
    return 1;
  }

  /* mode not in {0,1,2} */
  if (bv != 0) {
    return 0; /* direct clamp, no mode write */
  }
  state->counter = 0;
  return 1;
}

extern "C" void isaac_frame_opaque_98dba0_clamp_floats(
    float* float_170,
    float* float_2d0) {
  const float one = __builtin_bit_cast(float, 0x3f800000u); /* DAT_00baa454 */
  const float zero = 0.0f;
  if (float_170 != nullptr) {
    float f = *float_170;
    if (f <= zero) {
      f = zero;
    }
    if (one <= f) {
      f = one;
    }
    *float_170 = f;
  }
  if (float_2d0 != nullptr) {
    float f = *float_2d0;
    if (f <= zero) {
      f = zero;
    }
    if (one <= f) {
      f = one;
    }
    *float_2d0 = f;
  }
}

/* FUN_0098dba0 timer block pure islands (VA 0x0098de4a…0x0098df1e).
   PE constants (hash-bound .rdata):
     DAT_00ba9ff4 = 0x2f800000 (2^-32)
     DAT_00baa704 = 0x4048f5c3 (~π)
     DAT_00baa81c = 0x41200000 (10.0)
     DAT_00baa2d0 = 0x3f000000 (0.5)
     DAT_00bacb00[0]=0.0, [1]=2^32 as f64 (signed u32→f32 path)
   Wrappers: 0x0041d540 = (float)cos((double)a); 0x0041d520 = (float)sin((double)a). */

extern "C" int32_t isaac_frame_opaque_98dba0_timer_needs_host(int32_t timer_61c) {
  /* PE: test eax,eax; jle skip — signed compare, zero and negative pure skip. */
  return timer_61c > 0 ? 1 : 0;
}

extern "C" float isaac_frame_opaque_98dba0_timer_unit_float(uint32_t genrand) {
  /* Identical control flow to isaac_room_ambient_824a70_body_unit_float. */
  const int32_t as_signed = static_cast<int32_t>(genrand);
  double d = static_cast<double>(as_signed);
  if ((genrand >> 31) != 0u) {
    d += 4294967296.0; /* DAT_00bacb00[1] */
  }
  const float as_f32 = static_cast<float>(d);
  const float unit_scale = __builtin_bit_cast(float, 0x2f800000u); /* DAT_00ba9ff4 */
  return as_f32 * unit_scale;
}

extern "C" int32_t isaac_frame_opaque_98dba0_timer_step(
    IsaacFrameOpaque98dba0TimerState* state,
    uint32_t genrand) {
  if (state == nullptr) {
    return 0;
  }
  const int32_t timer = (int32_t)state->timer;
  if (timer <= 0) {
    return 0; /* PE test eax,eax / jle — signed; zero and negative skip */
  }

  /* PE: dec eax; mov [edi+0x61c], eax */
  const int32_t post = timer - 1;
  state->timer = (uint32_t)post;

  const float unit = isaac_frame_opaque_98dba0_timer_unit_float(genrand);
  const float pi = __builtin_bit_cast(float, 0x4048f5c3u);    /* DAT_00baa704 */
  const float ten = __builtin_bit_cast(float, 0x41200000u);   /* DAT_00baa81c */
  const float half = __builtin_bit_cast(float, 0x3f000000u);  /* DAT_00baa2d0 */

  /* angle = unit * π; angle = angle + angle → unit * 2π in [0, 2π) */
  float angle = unit * pi;
  angle = angle + angle;

  /* t = (float)(int32)post_timer / 10.0  (PE movd + cvtdq2ps, signed) */
  const float t = static_cast<float>(post) / ten;

  /* FUN_0041d540 / FUN_0041d520: cvtss2sd → cos/sin → cvtsd2ss */
  const float cos_a = static_cast<float>(cos(static_cast<double>(angle)));
  const float sin_a = static_cast<float>(sin(static_cast<double>(angle)));

  const float x = fo_bits_f32(state->x);
  const float y = fo_bits_f32(state->y);
  state->x = fo_f32_bits(cos_a * t + x * half);
  state->y = fo_f32_bits(sin_a * t + y * half);
  return 1;
}

/* FUN_0098dba0 player-walk pure CF (VA 0x0098dba0…0x0098de4a, ABI v15). */

static_assert(offsetof(IsaacFrameOpaque98dba0WalkPlan, empty_fatal) == 0,
              "98dba0 walk empty_fatal");
static_assert(offsetof(IsaacFrameOpaque98dba0WalkPlan, walk_needed) == 4,
              "98dba0 walk walk_needed");
static_assert(offsetof(IsaacFrameOpaque98dba0WalkPlan, pure_cf_ok) == 8,
              "98dba0 walk pure_cf_ok");
static_assert(offsetof(IsaacFrameOpaque98dba0WalkPlan, host_body) == 12,
              "98dba0 walk host_body");
static_assert(offsetof(IsaacFrameOpaque98dba0WalkPlan, player_count) == 16,
              "98dba0 walk player_count");
static_assert(sizeof(IsaacFrameOpaque98dba0WalkPlan) == 20, "98dba0 walk plan size");

extern "C" int32_t isaac_frame_opaque_98dba0_vector_count(uint32_t begin,
                                                            uint32_t end) {
  /* PE @ 0x0098dbd8–0x0098dbde: sub edx,eax; sar edx,2 (signed). */
  const int32_t delta = static_cast<int32_t>(end - begin);
  return delta >> 2;
}

extern "C" int32_t isaac_frame_opaque_98dba0_empty_fatal_needed(
    int32_t player_count) {
  /* PE @ 0x0098dbe1–0x0098dbe3: test edx,edx; je fatal. */
  return (player_count == 0) ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_98dba0_walk_needed(int32_t player_count) {
  /* PE @ 0x0098dc11–0x0098dc13: test eax,eax; je timer (skip walk). */
  return (player_count != 0) ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_98dba0_index_in_range(uint32_t index,
                                                             uint32_t count) {
  /* PE unsigned cmp; jb (player loop + mp walks). */
  return (index < count) ? 1 : 0;
}

extern "C" uint32_t isaac_frame_opaque_98dba0_player_slot_addr(uint32_t base,
                                                                uint32_t index) {
  /* PE @ 0x0098dc50: lea edx, [edx + eax*4]. */
  return base + index * 4u;
}

extern "C" int32_t isaac_frame_opaque_98dba0_mp_range_empty(uint32_t begin,
                                                             uint32_t end) {
  /* PE @ 0x0098dc6d: cmp ecx,edx; je skip. */
  return (begin == end) ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_98dba0_mp_id_eq(int32_t entry_id,
                                                       int32_t player_id) {
  /* PE @ 0x0098dc84: cmp [esi+0xc], ebx. */
  return (entry_id == player_id) ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_98dba0_mp_first_match_index(
    const int32_t* entry_ids,
    uint32_t count,
    int32_t player_id) {
  if (entry_ids == nullptr || count == 0u) {
    return -1;
  }
  for (uint32_t i = 0; i < count; ++i) {
    if (entry_ids[i] == player_id) {
      return static_cast<int32_t>(i);
    }
  }
  return -1;
}

extern "C" int32_t isaac_frame_opaque_98dba0_mp_walk_after_miss(
    uint32_t* index, uint32_t count) {
  /* PE @ 0x0098dc89–0x0098dc8f: inc eax; add ecx,4; cmp eax,edx; jb. */
  if (index == nullptr) {
    return 0;
  }
  const uint32_t next = *index + 1u;
  *index = next;
  return (next < count) ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_98dba0_bvar2_phase1_sticky(int32_t bVar2) {
  /* PE @ 0x0098dc58: test bl,bl; jne force-true. */
  return (bVar2 != 0) ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_98dba0_bvar2_phase1_result(
    int32_t sticky,
    int32_t mp_hit_vtable_zero,
    int32_t fun_956110_nz) {
  /* sticky → LAB_0098dcbe (bl=1);
     mp match + vtable al==0 → LAB_0098dd0a (bl=0);
     else FUN_00956110 → bl = (al!=0). */
  if (sticky != 0) {
    return 1;
  }
  if (mp_hit_vtable_zero != 0) {
    return 0;
  }
  return (fun_956110_nz != 0) ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_98dba0_phase2_rtti_needed(
    int32_t mp_empty,
    int32_t mp_hit_vtable_zero) {
  /* Phase-2 early exit to LAB_0098de0e when mp empty OR matched vtable==0.
     RTTI block at 0x0098dd3f only when neither. */
  if (mp_empty != 0) {
    return 0;
  }
  if (mp_hit_vtable_zero != 0) {
    return 0;
  }
  return 1;
}

extern "C" int32_t isaac_frame_opaque_98dba0_bvar2_phase3_result(
    int32_t sticky,
    int32_t mp_list_empty,
    int32_t is_idx_local,
    int32_t fun_956110_nz) {
  /* PE @ 0x0098dd8b…0x0098dddd after RTTI object present. */
  if (sticky != 0) {
    return 1;
  }
  if (mp_list_empty != 0 || is_idx_local != 0) {
    return (fun_956110_nz != 0) ? 1 : 0;
  }
  return 0;
}

extern "C" int32_t isaac_frame_opaque_98dba0_bvar2_player_step(
    int32_t bvar2_in,
    int32_t p1_mp_hit_vtable_zero,
    int32_t p1_fun_956110_nz,
    int32_t phase2_rtti_skip,
    int32_t p3_rtti_active,
    int32_t p3_mp_list_empty,
    int32_t p3_is_idx_local,
    int32_t p3_fun_956110_nz) {
  int32_t bv = isaac_frame_opaque_98dba0_bvar2_phase1_result(
      bvar2_in, p1_mp_hit_vtable_zero, p1_fun_956110_nz);
  if (phase2_rtti_skip != 0 || p3_rtti_active == 0) {
    return bv;
  }
  return isaac_frame_opaque_98dba0_bvar2_phase3_result(
      bv, p3_mp_list_empty, p3_is_idx_local, p3_fun_956110_nz);
}

extern "C" int32_t isaac_frame_opaque_98dba0_walk_after_player(
    uint32_t* index, uint32_t count) {
  /* PE @ 0x0098de25–0x0098de2e: inc ecx; cmp ecx,eax; jb loop. */
  if (index == nullptr) {
    return 0;
  }
  const uint32_t next = *index + 1u;
  *index = next;
  return (next < count) ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_98dba0_bvar2_apply_from_probes(
    const int32_t* probes,
    uint32_t player_count) {
  if (player_count == 0u) {
    return 0;
  }
  if (probes == nullptr) {
    return 0;
  }
  int32_t bv = 0;
  for (uint32_t i = 0; i < player_count; ++i) {
    const size_t base = static_cast<size_t>(i) * 8u;
    bv = isaac_frame_opaque_98dba0_bvar2_player_step(
        bv,
        probes[base + 0u],
        probes[base + 1u],
        probes[base + 2u],
        probes[base + 3u],
        probes[base + 4u],
        probes[base + 5u],
        probes[base + 6u]);
  }
  return bv;
}

extern "C" void isaac_frame_opaque_98dba0_walk_residual_plan(
    IsaacFrameOpaque98dba0WalkPlan* out,
    int32_t player_count) {
  if (out == nullptr) {
    return;
  }
  const int32_t fatal = isaac_frame_opaque_98dba0_empty_fatal_needed(player_count);
  const int32_t walk = isaac_frame_opaque_98dba0_walk_needed(player_count);
  out->empty_fatal = fatal;
  out->walk_needed = walk;
  out->pure_cf_ok = (fatal == 0) ? 1 : 0;
  out->host_body = walk; /* vtables / 956110 / RTTI always host when walk runs */
  out->player_count = player_count;
}

/* ---- FUN_00956110 walk-probe pure CF (ABI v16) ---- */

static_assert(offsetof(IsaacFrameOpaque956110Plan, net_gate) == 0,
              "956110 plan net_gate");
static_assert(offsetof(IsaacFrameOpaque956110Plan, path) == 4,
              "956110 plan path");
static_assert(offsetof(IsaacFrameOpaque956110Plan, host_864c30) == 8,
              "956110 plan host_864c30");
static_assert(offsetof(IsaacFrameOpaque956110Plan, host_vtable_walk) == 12,
              "956110 plan host_vtable_walk");
static_assert(offsetof(IsaacFrameOpaque956110Plan, host_general) == 16,
              "956110 plan host_general");
static_assert(offsetof(IsaacFrameOpaque956110Plan, pure_cf_ok) == 20,
              "956110 plan pure_cf_ok");
static_assert(offsetof(IsaacFrameOpaque956110Plan, host_body) == 24,
              "956110 plan host_body");
static_assert(sizeof(IsaacFrameOpaque956110Plan) == 28, "956110 plan size");

extern "C" int32_t isaac_frame_opaque_956110_net_gate(int32_t manager_mode,
                                                       uint32_t global_c71690) {
  /* PE @ 0x00956120–0x0095612d: cmp [edi+8],2; jne; cmp [c71690],0; je. */
  if (manager_mode != 2) {
    return 0;
  }
  if (global_c71690 == 0u) {
    return 0;
  }
  return 1;
}

extern "C" int32_t isaac_frame_opaque_956110_id_is_neg1(int32_t id) {
  /* PE @ 0x00956161: cmp edx,-1. */
  return (id == -1) ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_956110_path(int32_t mp_empty,
                                                   int32_t id) {
  /* PE @ 0x0095615d–0x00956164: empty → GENERAL; id!=-1 → GENERAL;
     else ID_NEG1_WALK. */
  if (mp_empty != 0) {
    return ISAAC_FRAME_OPAQUE_956110_PATH_GENERAL;
  }
  if (id != -1) {
    return ISAAC_FRAME_OPAQUE_956110_PATH_GENERAL;
  }
  return ISAAC_FRAME_OPAQUE_956110_PATH_ID_NEG1_WALK;
}

extern "C" int32_t isaac_frame_opaque_956110_net_early_result(
    int32_t net_out_byte) {
  /* PE @ 0x00956142: mov al, [ebp+0xb]; low-byte nonzero test via al return. */
  return ((net_out_byte & 0xff) != 0) ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_956110_apply_from_vtable_results(
    const uint8_t* results,
    uint32_t count) {
  /* PE id==-1 walk @ 0x00956171…0x00956194: first vtbl+0x30 al!=0 → 1. */
  if (results == nullptr || count == 0u) {
    return 0;
  }
  for (uint32_t i = 0; i < count; ++i) {
    if (results[i] != 0u) {
      return 1;
    }
  }
  return 0;
}

extern "C" int32_t isaac_frame_opaque_956110_result_from_samples(
    int32_t net_gate_open,
    int32_t net_host_ok,
    int32_t net_out_byte,
    int32_t mp_empty,
    int32_t id,
    const uint8_t* vtable_results,
    uint32_t vtable_count,
    int32_t general_result) {
  /* PE full CF with host-supplied nested outcomes. */
  if (net_gate_open != 0 && net_host_ok != 0) {
    return isaac_frame_opaque_956110_net_early_result(net_out_byte);
  }
  if (isaac_frame_opaque_956110_path(mp_empty, id) ==
      ISAAC_FRAME_OPAQUE_956110_PATH_ID_NEG1_WALK) {
    return isaac_frame_opaque_956110_apply_from_vtable_results(vtable_results,
                                                               vtable_count);
  }
  return (general_result != 0) ? 1 : 0;
}

extern "C" void isaac_frame_opaque_956110_residual_plan(
    IsaacFrameOpaque956110Plan* out,
    int32_t manager_mode,
    uint32_t global_c71690,
    int32_t mp_empty,
    int32_t id) {
  if (out == nullptr) {
    return;
  }
  const int32_t net = isaac_frame_opaque_956110_net_gate(manager_mode,
                                                         global_c71690);
  const int32_t path = isaac_frame_opaque_956110_path(mp_empty, id);
  out->net_gate = net;
  out->path = path;
  out->host_864c30 = net;
  out->host_vtable_walk =
      (path == ISAAC_FRAME_OPAQUE_956110_PATH_ID_NEG1_WALK) ? 1 : 0;
  out->host_general =
      (path == ISAAC_FRAME_OPAQUE_956110_PATH_GENERAL) ? 1 : 0;
  out->pure_cf_ok = 1;
  out->host_body = 1; /* nested 864c30 / vtbl / general always residual */
}

/* ---- FUN_00864c30 net-early pure CF (ABI v17) ---- */

static_assert(offsetof(IsaacFrameOpaque864c30Plan, capability) == 0,
              "864c30 plan capability");
static_assert(offsetof(IsaacFrameOpaque864c30Plan, pure_early) == 4,
              "864c30 plan pure_early");
static_assert(offsetof(IsaacFrameOpaque864c30Plan, host_body) == 8,
              "864c30 plan host_body");
static_assert(offsetof(IsaacFrameOpaque864c30Plan, host_874910) == 12,
              "864c30 plan host_874910");
static_assert(offsetof(IsaacFrameOpaque864c30Plan, host_6a80f0) == 16,
              "864c30 plan host_6a80f0");
static_assert(offsetof(IsaacFrameOpaque864c30Plan, host_lua_iat) == 20,
              "864c30 plan host_lua_iat");
static_assert(offsetof(IsaacFrameOpaque864c30Plan, host_seh_log) == 24,
              "864c30 plan host_seh_log");
static_assert(offsetof(IsaacFrameOpaque864c30Plan, pure_cf_ok) == 28,
              "864c30 plan pure_cf_ok");
static_assert(sizeof(IsaacFrameOpaque864c30Plan) == 32, "864c30 plan size");

extern "C" int32_t isaac_frame_opaque_864c30_capability_gate(
    uint32_t flag_dword) {
  /* PE @ 0x00864c7b–0x00864c81: test dword [eax], 0x2000; je early. */
  return ((flag_dword & ISAAC_FRAME_OPAQUE_864C30_CAPABILITY_BIT) != 0u) ? 1
                                                                         : 0;
}

extern "C" int32_t isaac_frame_opaque_864c30_needs_host(int32_t capability) {
  /* Capability open → host lua/SEH body; closed → pure early al=0. */
  return (capability != 0) ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_864c30_result_from_samples(
    int32_t capability,
    int32_t host_lua_ok) {
  /* PE: al = bh; bh stays 0 unless capability open and lua type-nz path. */
  if (capability == 0) {
    return 0;
  }
  return (host_lua_ok != 0) ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_864c30_pack_kind_imm(void) {
  /* PE @ 0x00864c66: mov dword [ebp-0x28], 0xd. */
  return (int32_t)ISAAC_FRAME_OPAQUE_864C30_PACK_KIND_IMM;
}

extern "C" void isaac_frame_opaque_864c30_residual_plan(
    IsaacFrameOpaque864c30Plan* out,
    int32_t capability) {
  if (out == nullptr) {
    return;
  }
  const int32_t cap = (capability != 0) ? 1 : 0;
  out->capability = cap;
  out->pure_early = (cap == 0) ? 1 : 0;
  out->host_body = cap;
  out->host_874910 = cap;
  out->host_6a80f0 = cap;
  out->host_lua_iat = cap;
  out->host_seh_log = cap;
  out->pure_cf_ok = 1;
}

/* ---- FUN_00864c30 SEH vtbl-dispatch peel (ABI v18) ---- */

static_assert(offsetof(IsaacFrameOpaque864c30SehPlan, host_name_vcall) == 0,
              "864c30 seh plan host_name_vcall");
static_assert(offsetof(IsaacFrameOpaque864c30SehPlan, host_assert_log) == 4,
              "864c30 seh plan host_assert_log");
static_assert(offsetof(IsaacFrameOpaque864c30SehPlan, side_log_needed) == 8,
              "864c30 seh plan side_log_needed");
static_assert(offsetof(IsaacFrameOpaque864c30SehPlan, host_side_vcall) == 12,
              "864c30 seh plan host_side_vcall");
static_assert(offsetof(IsaacFrameOpaque864c30SehPlan, host_side_log) == 16,
              "864c30 seh plan host_side_log");
static_assert(offsetof(IsaacFrameOpaque864c30SehPlan, side_receiver) == 20,
              "864c30 seh plan side_receiver");
static_assert(offsetof(IsaacFrameOpaque864c30SehPlan, result_al) == 24,
              "864c30 seh plan result_al");
static_assert(offsetof(IsaacFrameOpaque864c30SehPlan, pure_cf_ok) == 28,
              "864c30 seh plan pure_cf_ok");
static_assert(sizeof(IsaacFrameOpaque864c30SehPlan) == 32, "864c30 seh plan size");

extern "C" int32_t isaac_frame_opaque_864c30_seh_side_log_needed(
    uint32_t global_c71678) {
  /* PE @ 0x00864d36–0x00864d38: test esi,esi; je skip side log. */
  return (global_c71678 != 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_frame_opaque_864c30_seh_side_receiver(
    uint32_t global_c71678) {
  /* PE @ 0x00864d3e: add esi, 0x68d78 — 32-bit wrap. Guarded by the
     nonzero test, so a zero global never forms a receiver. */
  if (global_c71678 == 0u) {
    return 0u;
  }
  return (uint32_t)(global_c71678 +
                    (uint32_t)ISAAC_FRAME_OPAQUE_864C30_SEH_SIDE_RECEIVER_OFF);
}

extern "C" int32_t isaac_frame_opaque_864c30_seh_name_vtbl_slot_off(void) {
  /* PE @ 0x00864d1d and 0x00864d44: call dword [eax+4]. */
  return (int32_t)ISAAC_FRAME_OPAQUE_864C30_SEH_VTBL_NAME_OFF;
}

extern "C" int32_t isaac_frame_opaque_864c30_seh_result(void) {
  /* PE @ 0x00864c61 xor bh,bh; 0x00864c78 mov [ebp-0x11],bh; no other write.
     0x00864d61 restores bh from that byte, 0x00864d64 mov al,bh. */
  return 0;
}

extern "C" void isaac_frame_opaque_864c30_seh_plan(
    IsaacFrameOpaque864c30SehPlan* out,
    uint32_t global_c71678) {
  if (out == nullptr) {
    return;
  }
  const int32_t side =
      isaac_frame_opaque_864c30_seh_side_log_needed(global_c71678);
  out->host_name_vcall = 1;
  out->host_assert_log = 1;
  out->side_log_needed = side;
  out->host_side_vcall = side;
  out->host_side_log = side;
  out->side_receiver =
      isaac_frame_opaque_864c30_seh_side_receiver(global_c71678);
  out->result_al = isaac_frame_opaque_864c30_seh_result();
  out->pure_cf_ok = 1;
}

extern "C" int32_t isaac_frame_opaque_864c30_result_from_samples_ex(
    int32_t capability,
    int32_t seh_unwound,
    int32_t host_lua_ok) {
  if (capability == 0) {
    return 0;
  }
  if (seh_unwound != 0) {
    return isaac_frame_opaque_864c30_seh_result();
  }
  return (host_lua_ok != 0) ? 1 : 0;
}

/* ---- FUN_006a80f0 LuaRef push (ABI v18) ---- */

static_assert(offsetof(IsaacFrameOpaque6a80f0Plan, host_rawgeti) == 0,
              "6a80f0 plan host_rawgeti");
static_assert(offsetof(IsaacFrameOpaque6a80f0Plan, arg_lo) == 4,
              "6a80f0 plan arg_lo");
static_assert(offsetof(IsaacFrameOpaque6a80f0Plan, arg_hi) == 8,
              "6a80f0 plan arg_hi");
static_assert(offsetof(IsaacFrameOpaque6a80f0Plan, registry_index) == 12,
              "6a80f0 plan registry_index");
static_assert(offsetof(IsaacFrameOpaque6a80f0Plan, pure_cf_ok) == 16,
              "6a80f0 plan pure_cf_ok");
static_assert(offsetof(IsaacFrameOpaque6a80f0Plan, pure_complete) == 20,
              "6a80f0 plan pure_complete");
static_assert(sizeof(IsaacFrameOpaque6a80f0Plan) == 24, "6a80f0 plan size");

extern "C" int32_t isaac_frame_opaque_6a80f0_ref_arg_lo(int32_t ref) {
  /* PE @ 0x006a80f6/0x006a80fb: mov eax,[ecx+4]; push eax. */
  return ref;
}

extern "C" int32_t isaac_frame_opaque_6a80f0_ref_arg_hi(int32_t ref) {
  /* PE @ 0x006a80f9: cdq — arithmetic shift of the sign bit. */
  return (ref < 0) ? -1 : 0;
}

extern "C" uint32_t isaac_frame_opaque_6a80f0_registry_index(void) {
  /* PE @ 0x006a80fc: push 0xfff0b9d8. */
  return (uint32_t)ISAAC_FRAME_OPAQUE_864C30_LUA_REGISTRYINDEX;
}

extern "C" void isaac_frame_opaque_6a80f0_residual_plan(
    IsaacFrameOpaque6a80f0Plan* out,
    int32_t ref) {
  if (out == nullptr) {
    return;
  }
  out->host_rawgeti = 1;
  out->arg_lo = isaac_frame_opaque_6a80f0_ref_arg_lo(ref);
  out->arg_hi = isaac_frame_opaque_6a80f0_ref_arg_hi(ref);
  out->registry_index = isaac_frame_opaque_6a80f0_registry_index();
  out->pure_cf_ok = 1;
  out->pure_complete = 0;
}

/* ---- FUN_00874910 lua pack/push pure CF (ABI v18) ---- */

static_assert(offsetof(IsaacFrameOpaque874910Plan, object_present) == 0,
              "874910 plan object_present");
static_assert(offsetof(IsaacFrameOpaque874910Plan, push_userdata) == 4,
              "874910 plan push_userdata");
static_assert(offsetof(IsaacFrameOpaque874910Plan, push_nil) == 8,
              "874910 plan push_nil");
static_assert(offsetof(IsaacFrameOpaque874910Plan, host_rawgeti) == 12,
              "874910 plan host_rawgeti");
static_assert(offsetof(IsaacFrameOpaque874910Plan, host_pushinteger) == 16,
              "874910 plan host_pushinteger");
static_assert(offsetof(IsaacFrameOpaque874910Plan, host_newuserdata) == 20,
              "874910 plan host_newuserdata");
static_assert(offsetof(IsaacFrameOpaque874910Plan, host_85bff0) == 24,
              "874910 plan host_85bff0");
static_assert(offsetof(IsaacFrameOpaque874910Plan, host_pcall) == 28,
              "874910 plan host_pcall");
static_assert(offsetof(IsaacFrameOpaque874910Plan, pcall_failed) == 32,
              "874910 plan pcall_failed");
static_assert(offsetof(IsaacFrameOpaque874910Plan, host_throw) == 36,
              "874910 plan host_throw");
static_assert(offsetof(IsaacFrameOpaque874910Plan, host_lual_ref) == 40,
              "874910 plan host_lual_ref");
static_assert(offsetof(IsaacFrameOpaque874910Plan, pure_cf_ok) == 44,
              "874910 plan pure_cf_ok");
static_assert(offsetof(IsaacFrameOpaque874910Plan, pure_complete) == 48,
              "874910 plan pure_complete");
static_assert(sizeof(IsaacFrameOpaque874910Plan) == 52, "874910 plan size");

extern "C" int32_t isaac_frame_opaque_874910_object_present(uint32_t object) {
  /* PE @ 0x00874953: test esi,esi; je pushnil. */
  return (object != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_874910_int_arg_hi(int32_t value) {
  /* PE cdq at 0x00874923 / 0x0087493b / 0x00874948 / 0x00874998. */
  return (value < 0) ? -1 : 0;
}

extern "C" int32_t isaac_frame_opaque_874910_kind_arg_hi(void) {
  /* PE @ 0x0085bff6: push 0 — zero extension, no cdq. */
  return 0;
}

extern "C" int32_t isaac_frame_opaque_874910_pcall_failed(
    int32_t pcall_status) {
  /* PE @ 0x008749bf: test eax,eax; jne 0x008749f7 (throw tail). */
  return (pcall_status != 0) ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_874910_pcall_nargs(void) {
  return (int32_t)ISAAC_FRAME_OPAQUE_874910_PCALL_NARGS;
}

extern "C" int32_t isaac_frame_opaque_874910_pcall_nresults(void) {
  return (int32_t)ISAAC_FRAME_OPAQUE_874910_PCALL_NRESULTS;
}

extern "C" int32_t isaac_frame_opaque_874910_userdata_size(void) {
  return (int32_t)ISAAC_FRAME_OPAQUE_874910_USERDATA_SIZE;
}

extern "C" uint32_t isaac_frame_opaque_874910_userdata_tag(void) {
  return (uint32_t)ISAAC_FRAME_OPAQUE_874910_USERDATA_TAG;
}

extern "C" uint32_t isaac_frame_opaque_874910_metatable_key(void) {
  return (uint32_t)ISAAC_FRAME_OPAQUE_874910_METATABLE_KEY;
}

extern "C" uint32_t isaac_frame_opaque_874910_push_sequence(int32_t* out_kinds,
                                                             uint32_t len,
                                                             uint32_t object) {
  const int32_t seq[ISAAC_FRAME_OPAQUE_874910_PUSH_SEQUENCE_LEN] = {
      ISAAC_FRAME_OPAQUE_874910_PUSH_CALLBACK_REF,
      ISAAC_FRAME_OPAQUE_874910_PUSH_INT_PACK4,
      ISAAC_FRAME_OPAQUE_874910_PUSH_INT_PACK8,
      isaac_frame_opaque_874910_object_present(object)
          ? ISAAC_FRAME_OPAQUE_874910_PUSH_USERDATA
          : ISAAC_FRAME_OPAQUE_874910_PUSH_NIL,
      ISAAC_FRAME_OPAQUE_874910_PUSH_INT_SUB,
      ISAAC_FRAME_OPAQUE_874910_PUSH_INT_KIND,
  };
  if (out_kinds != nullptr) {
    uint32_t n = len;
    if (n > (uint32_t)ISAAC_FRAME_OPAQUE_874910_PUSH_SEQUENCE_LEN) {
      n = (uint32_t)ISAAC_FRAME_OPAQUE_874910_PUSH_SEQUENCE_LEN;
    }
    for (uint32_t i = 0; i < n; ++i) {
      out_kinds[i] = seq[i];
    }
  }
  return (uint32_t)ISAAC_FRAME_OPAQUE_874910_PUSH_SEQUENCE_LEN;
}

extern "C" void isaac_frame_opaque_874910_apply_userdata_init(
    uint32_t* userdata,
    uint32_t object) {
  if (userdata == nullptr) {
    return;
  }
  /* PE @ 0x0087496b: mov [eax], 0xb753c8; 0x00874971: mov [eax+4], esi. */
  userdata[0] = (uint32_t)ISAAC_FRAME_OPAQUE_874910_USERDATA_TAG;
  userdata[1] = object;
}

extern "C" void isaac_frame_opaque_874910_apply_out(uint32_t* out_l_ref,
                                                     uint32_t lua_state,
                                                     int32_t luaL_ref_result) {
  if (out_l_ref == nullptr) {
    return;
  }
  /* PE @ 0x008749d5: mov [esi], edi; 0x008749e0: mov [esi+4], eax. */
  out_l_ref[0] = lua_state;
  out_l_ref[1] = (uint32_t)luaL_ref_result;
}

extern "C" void isaac_frame_opaque_874910_residual_plan(
    IsaacFrameOpaque874910Plan* out,
    uint32_t object,
    int32_t pcall_status) {
  if (out == nullptr) {
    return;
  }
  const int32_t present = isaac_frame_opaque_874910_object_present(object);
  const int32_t failed = isaac_frame_opaque_874910_pcall_failed(pcall_status);
  out->object_present = present;
  out->push_userdata = present;
  out->push_nil = (present == 0) ? 1 : 0;
  out->host_rawgeti = 1;
  out->host_pushinteger = 1;
  out->host_newuserdata = present;
  out->host_85bff0 = 1;
  out->host_pcall = 1;
  out->pcall_failed = failed;
  out->host_throw = failed; /* 0x85c080 record build + no-return 0x8727d0 */
  out->host_lual_ref = (failed == 0) ? 1 : 0;
  out->pure_cf_ok = 1;
  out->pure_complete = 0;
}

/* ---- FUN_00956110 id==-1 walk with PE-exact recomputed count (ABI v18) ---- */

extern "C" int32_t isaac_frame_opaque_956110_walk_from_recounts(
    const uint8_t* results,
    const int32_t* counts,
    uint32_t counts_len) {
  if (results == nullptr || counts == nullptr || counts_len == 0u) {
    return 0;
  }
  /* PE @ 0x0095616d: test eax,eax; je 0x00956196 — pre-loop count gate. */
  if (counts[0] == 0) {
    return 0;
  }
  uint32_t i = 0u;
  for (;;) {
    if (results[i] != 0u) {
      return 1; /* PE @ 0x0095617e: jne 0x009561a1 (al=1). */
    }
    i += 1u;
    if (i >= counts_len) {
      return 0; /* caller ran out of observed counts */
    }
    /* PE @ 0x00956180–0x00956194: bounds reloaded, sar 2, unsigned cmp/jb. */
    if (i >= (uint32_t)counts[i]) {
      return 0;
    }
  }
}

/* ---- FUN_0085c080 error-record builder (ABI v19) ---- */

static_assert(offsetof(IsaacFrameOpaque85c080Plan, path) == 0,
              "85c080 plan path");
static_assert(offsetof(IsaacFrameOpaque85c080Plan, host_gettop) == 4,
              "85c080 plan host_gettop");
static_assert(offsetof(IsaacFrameOpaque85c080Plan, host_tolstring) == 8,
              "85c080 plan host_tolstring");
static_assert(offsetof(IsaacFrameOpaque85c080Plan, host_assign) == 12,
              "85c080 plan host_assign");
static_assert(offsetof(IsaacFrameOpaque85c080Plan, tostring_null) == 16,
              "85c080 plan tostring_null");
static_assert(offsetof(IsaacFrameOpaque85c080Plan, message_ptr) == 20,
              "85c080 plan message_ptr");
static_assert(offsetof(IsaacFrameOpaque85c080Plan, literal_needs_grow) == 24,
              "85c080 plan literal_needs_grow");
static_assert(offsetof(IsaacFrameOpaque85c080Plan, host_alloc) == 28,
              "85c080 plan host_alloc");
static_assert(offsetof(IsaacFrameOpaque85c080Plan, host_memcpy) == 32,
              "85c080 plan host_memcpy");
static_assert(offsetof(IsaacFrameOpaque85c080Plan, dst_is_heap) == 36,
              "85c080 plan dst_is_heap");
static_assert(offsetof(IsaacFrameOpaque85c080Plan, grow_capacity) == 40,
              "85c080 plan grow_capacity");
static_assert(offsetof(IsaacFrameOpaque85c080Plan, entry_capacity_is_sso) == 44,
              "85c080 plan entry_capacity_is_sso");
static_assert(offsetof(IsaacFrameOpaque85c080Plan, pure_cf_ok) == 48,
              "85c080 plan pure_cf_ok");
static_assert(offsetof(IsaacFrameOpaque85c080Plan, pure_complete) == 52,
              "85c080 plan pure_complete");
static_assert(sizeof(IsaacFrameOpaque85c080Plan) == 56, "85c080 plan size");

extern "C" int32_t isaac_frame_opaque_85c080_message_path(
    int32_t lua_gettop_result) {
  /* PE @ 0x0085c0ed–0x0085c0ef: test eax,eax; jle literal path. */
  return (lua_gettop_result > 0)
             ? ISAAC_FRAME_OPAQUE_85C080_PATH_FROM_LUA_STACK
             : ISAAC_FRAME_OPAQUE_85C080_PATH_MISSING_ERROR;
}

extern "C" uint32_t isaac_frame_opaque_85c080_tostring_fallback(
    uint32_t tostring_ptr) {
  /* PE @ 0x0085c101–0x0085c108: mov ecx,0xb1a4ec; test eax,eax; cmovne ecx,eax. */
  if (tostring_ptr == 0u) {
    return (uint32_t)ISAAC_FRAME_OPAQUE_85C080_FALLBACK_STR_VA;
  }
  return tostring_ptr;
}

extern "C" uint32_t isaac_frame_opaque_85c080_strlen(const uint8_t* s) {
  if (s == nullptr) {
    return 0u;
  }
  /* PE @ 0x0085c10d: lea ebx,[edx+1]; scan bytes; sub edx,ebx. */
  uint32_t n = 0u;
  while (s[n] != 0u) {
    n += 1u;
  }
  return n;
}

extern "C" void isaac_frame_opaque_85c080_apply_record_init(
    uint32_t* record,
    uint32_t lua_state) {
  if (record == nullptr) {
    return;
  }
  record[0] = (uint32_t)ISAAC_FRAME_OPAQUE_85C080_VTABLE; /* 0x0085c0bd */
  record[1] = 0u;                                         /* movq [edi+4] */
  record[2] = 0u;
  record[3] = lua_state;                                  /* 0x0085c0c3 */
  record[4] = 0u;                                         /* 0x0085c0c6 (+0x10) */
  /* record[5..7] (+0x14/+0x18/+0x1c) intentionally untouched: the PE never
     initialises the rest of the SSO buffer. */
  record[8] = 0u;                                         /* size  (+0x20) */
  record[9] = (uint32_t)ISAAC_FRAME_OPAQUE_85C080_SSO_CAPACITY; /* cap (+0x24) */
}

extern "C" int32_t isaac_frame_opaque_85c080_literal_needs_grow(
    uint32_t capacity) {
  /* PE @ 0x0085c12b–0x0085c12e: cmp ecx,0xd; jb grow. */
  return (capacity < (uint32_t)ISAAC_FRAME_OPAQUE_85C080_LITERAL_LEN) ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_85c080_literal_dst_is_heap(
    uint32_t capacity) {
  /* PE @ 0x0085c133–0x0085c136: cmp ecx,0x10; jb keep inline buffer. */
  return (capacity >= (uint32_t)ISAAC_FRAME_OPAQUE_85C080_SSO_BUF_BYTES) ? 1 : 0;
}

extern "C" uint32_t isaac_frame_opaque_85c080_grow_capacity(uint32_t capacity) {
  /* PE @ 0x0085c158–0x0085c178. All compares unsigned (jbe / cmova). */
  const uint32_t half = capacity >> 1;
  const uint32_t headroom =
      (uint32_t)ISAAC_FRAME_OPAQUE_85C080_MAX_CAPACITY - half;
  if (capacity > headroom) {
    return (uint32_t)ISAAC_FRAME_OPAQUE_85C080_MAX_CAPACITY;
  }
  const uint32_t grown = (uint32_t)(capacity + half);
  const uint32_t floor_cap = (uint32_t)ISAAC_FRAME_OPAQUE_85C080_SSO_CAPACITY;
  return (grown > floor_cap) ? grown : floor_cap;
}

extern "C" uint32_t isaac_frame_opaque_85c080_grow_alloc_bytes(
    uint32_t capacity) {
  /* PE @ 0x0085c17b: lea ecx,[ebx+1] — 32-bit wrap. */
  return (uint32_t)(isaac_frame_opaque_85c080_grow_capacity(capacity) + 1u);
}

extern "C" void isaac_frame_opaque_85c080_apply_literal(
    uint8_t* dst,
    const uint8_t* literal,
    uint32_t* size_field) {
  if (size_field != nullptr) {
    /* PE @ 0x0085c143 / 0x0085c183: mov [edi+0x20], 0xd. */
    *size_field = (uint32_t)ISAAC_FRAME_OPAQUE_85C080_LITERAL_LEN;
  }
  if (dst == nullptr || literal == nullptr) {
    return;
  }
  for (uint32_t i = 0u; i < (uint32_t)ISAAC_FRAME_OPAQUE_85C080_LITERAL_LEN;
       ++i) {
    dst[i] = literal[i];
  }
  /* PE @ 0x0085c152 / 0x0085c1ab: terminator past the 13 copied bytes. */
  dst[(uint32_t)ISAAC_FRAME_OPAQUE_85C080_LITERAL_LEN] = 0u;
}

extern "C" void isaac_frame_opaque_85c080_residual_plan(
    IsaacFrameOpaque85c080Plan* out,
    int32_t lua_gettop_result,
    uint32_t capacity,
    uint32_t tostring_ptr) {
  if (out == nullptr) {
    return;
  }
  const int32_t path = isaac_frame_opaque_85c080_message_path(lua_gettop_result);
  const int32_t from_stack =
      (path == ISAAC_FRAME_OPAQUE_85C080_PATH_FROM_LUA_STACK) ? 1 : 0;
  const int32_t grow =
      (from_stack == 0) ? isaac_frame_opaque_85c080_literal_needs_grow(capacity)
                        : 0;
  out->path = path;
  out->host_gettop = 1;
  out->host_tolstring = from_stack;
  out->host_assign = from_stack;
  out->tostring_null = (from_stack != 0 && tostring_ptr == 0u) ? 1 : 0;
  out->message_ptr =
      (from_stack != 0)
          ? isaac_frame_opaque_85c080_tostring_fallback(tostring_ptr)
          : 0u;
  out->literal_needs_grow = grow;
  out->host_alloc = grow;
  out->host_memcpy = (from_stack == 0 && grow == 0) ? 1 : 0;
  out->dst_is_heap =
      (from_stack == 0 && grow == 0)
          ? isaac_frame_opaque_85c080_literal_dst_is_heap(capacity)
          : 0;
  out->grow_capacity =
      (grow != 0) ? isaac_frame_opaque_85c080_grow_capacity(capacity) : 0u;
  out->entry_capacity_is_sso =
      (capacity == (uint32_t)ISAAC_FRAME_OPAQUE_85C080_SSO_CAPACITY) ? 1 : 0;
  out->pure_cf_ok = 1;
  out->pure_complete = 0;
}

/* ---- FUN_0040ccd0 assign + guest allocator wrapper (ABI v20) ---- */

static_assert(offsetof(IsaacFrameOpaque40ccd0Plan, in_place) == 0, "40ccd0 in_place");
static_assert(offsetof(IsaacFrameOpaque40ccd0Plan, dst_is_heap) == 4, "40ccd0 dst_is_heap");
static_assert(offsetof(IsaacFrameOpaque40ccd0Plan, length_error) == 8, "40ccd0 length_error");
static_assert(offsetof(IsaacFrameOpaque40ccd0Plan, new_capacity) == 12, "40ccd0 new_capacity");
static_assert(offsetof(IsaacFrameOpaque40ccd0Plan, alloc_bytes) == 16, "40ccd0 alloc_bytes");
static_assert(offsetof(IsaacFrameOpaque40ccd0Plan, host_alloc) == 20, "40ccd0 host_alloc");
static_assert(offsetof(IsaacFrameOpaque40ccd0Plan, host_copy) == 24, "40ccd0 host_copy");
static_assert(offsetof(IsaacFrameOpaque40ccd0Plan, host_free) == 28, "40ccd0 host_free");
static_assert(offsetof(IsaacFrameOpaque40ccd0Plan, free_bytes) == 32, "40ccd0 free_bytes");
static_assert(offsetof(IsaacFrameOpaque40ccd0Plan, store_capacity) == 36, "40ccd0 store_capacity");
static_assert(offsetof(IsaacFrameOpaque40ccd0Plan, pure_cf_ok) == 40, "40ccd0 pure_cf_ok");
static_assert(offsetof(IsaacFrameOpaque40ccd0Plan, pure_complete) == 44, "40ccd0 pure_complete");
static_assert(sizeof(IsaacFrameOpaque40ccd0Plan) == 48, "40ccd0 plan size");

static_assert(offsetof(IsaacFrameOpaqueAllocPlan, aligned) == 0, "alloc aligned");
static_assert(offsetof(IsaacFrameOpaqueAllocPlan, overflow) == 4, "alloc overflow");
static_assert(offsetof(IsaacFrameOpaqueAllocPlan, raw_bytes) == 8, "alloc raw_bytes");
static_assert(offsetof(IsaacFrameOpaqueAllocPlan, returns_null) == 12, "alloc returns_null");
static_assert(offsetof(IsaacFrameOpaqueAllocPlan, host_alloc) == 16, "alloc host_alloc");
static_assert(offsetof(IsaacFrameOpaqueAllocPlan, host_oom_abort) == 20, "alloc host_oom_abort");
static_assert(offsetof(IsaacFrameOpaqueAllocPlan, pure_cf_ok) == 24, "alloc pure_cf_ok");
static_assert(offsetof(IsaacFrameOpaqueAllocPlan, pure_complete) == 28, "alloc pure_complete");
static_assert(sizeof(IsaacFrameOpaqueAllocPlan) == 32, "alloc plan size");

extern "C" int32_t isaac_frame_opaque_40ccd0_in_place(uint32_t len,
                                                       uint32_t old_capacity) {
  /* PE @ 0x0040cce2: cmp edi,ecx; ja grow — unsigned, equal stays in place. */
  return (len <= old_capacity) ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_40ccd0_dst_is_heap(uint32_t capacity) {
  /* PE @ 0x0040cce8: cmp ecx,0x10; jb keep inline. */
  return (capacity >= (uint32_t)ISAAC_FRAME_OPAQUE_STRING_SSO_BYTES) ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_40ccd0_length_error(uint32_t len) {
  /* PE @ 0x0040cd0e: cmp edi,0x7fffffff; ja noreturn. */
  return (len > (uint32_t)ISAAC_FRAME_OPAQUE_STRING_MAX_SIZE) ? 1 : 0;
}

extern "C" uint32_t isaac_frame_opaque_40ccd0_grow_capacity(
    uint32_t len, uint32_t old_capacity) {
  /* PE @ 0x0040cd1a: or ebx,0xf. */
  const uint32_t req = len | 0xfu;
  const uint32_t max_cap = (uint32_t)ISAAC_FRAME_OPAQUE_STRING_MAX_SIZE;
  /* PE @ 0x0040cd1f: cmp ebx,0x7fffffff; jbe. */
  if (req > max_cap) {
    return max_cap;
  }
  const uint32_t half = old_capacity >> 1;
  /* PE @ 0x0040cd39: cmp ecx,eax; jbe. */
  if (old_capacity > (uint32_t)(max_cap - half)) {
    return max_cap;
  }
  const uint32_t geom = (uint32_t)(old_capacity + half);
  /* PE @ 0x0040cd47: cmp ebx,eax; cmovb ebx,eax — unsigned. */
  return (req < geom) ? geom : req;
}

extern "C" uint32_t isaac_frame_opaque_40ccd0_alloc_bytes(
    uint32_t new_capacity) {
  /* PE @ 0x0040cd4c: lea ecx,[ebx+1] — 32-bit wrap. */
  return (uint32_t)(new_capacity + 1u);
}

extern "C" void isaac_frame_opaque_40ccd0_apply_in_place(uint32_t* size_field,
                                                          uint8_t* dst,
                                                          const uint8_t* src,
                                                          uint32_t len) {
  if (size_field != nullptr) {
    /* PE @ 0x0040ccf3: mov [esi+0x10], edi. */
    *size_field = len;
  }
  if (dst == nullptr || src == nullptr) {
    return;
  }
  for (uint32_t i = 0u; i < len; ++i) {
    dst[i] = src[i];
  }
  /* PE @ 0x0040ccff: mov byte [ebx+edi], 0. */
  dst[len] = 0u;
}

extern "C" void isaac_frame_opaque_40ccd0_residual_plan(
    IsaacFrameOpaque40ccd0Plan* out, uint32_t len, uint32_t old_capacity) {
  if (out == nullptr) {
    return;
  }
  const int32_t in_place = isaac_frame_opaque_40ccd0_in_place(len, old_capacity);
  const int32_t too_long =
      (in_place == 0) ? isaac_frame_opaque_40ccd0_length_error(len) : 0;
  const int32_t grow = (in_place == 0 && too_long == 0) ? 1 : 0;
  const uint32_t new_cap =
      (grow != 0) ? isaac_frame_opaque_40ccd0_grow_capacity(len, old_capacity)
                  : 0u;
  out->in_place = in_place;
  out->dst_is_heap =
      (in_place != 0) ? isaac_frame_opaque_40ccd0_dst_is_heap(old_capacity) : 0;
  out->length_error = too_long;
  out->new_capacity = new_cap;
  out->alloc_bytes =
      (grow != 0) ? isaac_frame_opaque_40ccd0_alloc_bytes(new_cap) : 0u;
  out->host_alloc = grow;
  out->host_copy = (too_long == 0) ? 1 : 0;
  out->host_free =
      (grow != 0 && isaac_frame_opaque_40ccd0_dst_is_heap(old_capacity) != 0)
          ? 1
          : 0;
  out->free_bytes = (out->host_free != 0) ? (uint32_t)(old_capacity + 1u) : 0u;
  out->store_capacity = grow;
  out->pure_cf_ok = 1;
  out->pure_complete = 0;
}

extern "C" int32_t isaac_frame_opaque_alloc_is_aligned(uint32_t bytes) {
  /* PE @ 0x0040cf01: cmp ecx,0x1000; jb small path. */
  return (bytes >= (uint32_t)ISAAC_FRAME_OPAQUE_ALLOC_ALIGN_THRESHOLD) ? 1 : 0;
}

extern "C" uint32_t isaac_frame_opaque_alloc_raw_bytes(uint32_t bytes) {
  /* PE @ 0x0040cf09: lea eax,[ecx+0x23] — 32-bit wrap. */
  return (uint32_t)(bytes + (uint32_t)ISAAC_FRAME_OPAQUE_ALLOC_HEADER_BIAS);
}

extern "C" int32_t isaac_frame_opaque_alloc_overflow(uint32_t bytes) {
  /* PE @ 0x0040cf0c: cmp eax,ecx; jbe noreturn — unsigned wrap detection. */
  return (isaac_frame_opaque_alloc_raw_bytes(bytes) <= bytes) ? 1 : 0;
}

extern "C" uint32_t isaac_frame_opaque_alloc_payload(uint32_t raw_ptr) {
  /* PE @ 0x0040cf1f: lea eax,[ecx+0x23]; and eax,0xffffffe0. */
  return (uint32_t)((raw_ptr + (uint32_t)ISAAC_FRAME_OPAQUE_ALLOC_HEADER_BIAS) &
                    (uint32_t)ISAAC_FRAME_OPAQUE_ALLOC_ALIGN_MASK);
}

extern "C" uint32_t isaac_frame_opaque_alloc_header_addr(uint32_t payload) {
  /* PE @ 0x0040cf25: mov [eax-4], ecx. */
  return (uint32_t)(payload - 4u);
}

extern "C" int32_t isaac_frame_opaque_alloc_small_is_null(uint32_t bytes) {
  /* PE @ 0x0040cf30: test ecx,ecx; je return 0 without any raw call. */
  return (bytes == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_free_adjust_needed(uint32_t bytes) {
  /* PE @ 0x0040cd7e: cmp ecx,0x1000; jb — unsigned. */
  return (bytes >= (uint32_t)ISAAC_FRAME_OPAQUE_ALLOC_ALIGN_THRESHOLD) ? 1 : 0;
}

extern "C" uint32_t isaac_frame_opaque_free_adjust_bytes(uint32_t bytes) {
  /* PE @ 0x0040cd89: add ecx,0x23 — 32-bit wrap. */
  return (uint32_t)(bytes + (uint32_t)ISAAC_FRAME_OPAQUE_ALLOC_HEADER_BIAS);
}

extern "C" uint32_t isaac_frame_opaque_free_delta(uint32_t payload,
                                                   uint32_t header) {
  /* PE @ 0x0040cd8c: sub eax,edx; add eax,-4 — 32-bit wrap. */
  return (uint32_t)(payload - header - 4u);
}

extern "C" int32_t isaac_frame_opaque_free_delta_valid(uint32_t delta) {
  /* PE @ 0x0040cd91: cmp eax,0x1f; ja noreturn — unsigned. */
  return (delta <= (uint32_t)ISAAC_FRAME_OPAQUE_ALLOC_DELTA_MAX) ? 1 : 0;
}

extern "C" void isaac_frame_opaque_alloc_plan(IsaacFrameOpaqueAllocPlan* out,
                                               uint32_t bytes) {
  if (out == nullptr) {
    return;
  }
  const int32_t aligned = isaac_frame_opaque_alloc_is_aligned(bytes);
  const int32_t overflow =
      (aligned != 0) ? isaac_frame_opaque_alloc_overflow(bytes) : 0;
  const int32_t null_small =
      (aligned == 0) ? isaac_frame_opaque_alloc_small_is_null(bytes) : 0;
  out->aligned = aligned;
  out->overflow = overflow;
  out->raw_bytes = (aligned != 0)
                       ? isaac_frame_opaque_alloc_raw_bytes(bytes)
                       : ((null_small != 0) ? 0u : bytes);
  out->returns_null = null_small;
  out->host_alloc =
      (overflow == 0 && null_small == 0) ? 1 : 0;
  out->host_oom_abort = (aligned != 0 && overflow == 0) ? 1 : 0;
  out->pure_cf_ok = 1;
  out->pure_complete = 0;
}

/* ---- FUN_0040cf50 basic_string copy-construct (ABI v22) ---- */

static_assert(offsetof(IsaacFrameOpaque40cf50Plan, src_is_heap) == 0, "40cf50 src_is_heap");
static_assert(offsetof(IsaacFrameOpaque40cf50Plan, sso) == 4, "40cf50 sso");
static_assert(offsetof(IsaacFrameOpaque40cf50Plan, new_capacity) == 8, "40cf50 new_capacity");
static_assert(offsetof(IsaacFrameOpaque40cf50Plan, alloc_bytes) == 12, "40cf50 alloc_bytes");
static_assert(offsetof(IsaacFrameOpaque40cf50Plan, copy_bytes) == 16, "40cf50 copy_bytes");
static_assert(offsetof(IsaacFrameOpaque40cf50Plan, host_alloc) == 20, "40cf50 host_alloc");
static_assert(offsetof(IsaacFrameOpaque40cf50Plan, host_copy) == 24, "40cf50 host_copy");
static_assert(offsetof(IsaacFrameOpaque40cf50Plan, store_ptr_before_copy) == 28, "40cf50 store_ptr_before_copy");
static_assert(offsetof(IsaacFrameOpaque40cf50Plan, pure_cf_ok) == 32, "40cf50 pure_cf_ok");
static_assert(offsetof(IsaacFrameOpaque40cf50Plan, pure_complete) == 36, "40cf50 pure_complete");
static_assert(sizeof(IsaacFrameOpaque40cf50Plan) == 40, "40cf50 plan size");

extern "C" int32_t isaac_frame_opaque_40cf50_src_is_heap(uint32_t src_capacity) {
  /* PE @ 0x0040cf6f: cmp dword [edi+0x14],0x10; jb keeps the inline buffer —
     unsigned; at or above 0x10 the data pointer is loaded from *src. */
  return (src_capacity >= (uint32_t)ISAAC_FRAME_OPAQUE_40CF50_SSO_LIMIT) ? 1
                                                                          : 0;
}

extern "C" int32_t isaac_frame_opaque_40cf50_sso(uint32_t len) {
  /* PE @ 0x0040cf7d: cmp eax,0x10; jae grow — unsigned, on the source SIZE
     word (not its capacity); strictly below stays inline. */
  return (len < (uint32_t)ISAAC_FRAME_OPAQUE_40CF50_SSO_LIMIT) ? 1 : 0;
}

extern "C" uint32_t isaac_frame_opaque_40cf50_grow_capacity(uint32_t len) {
  /* PE @ 0x0040cfa3: or ebx,0xf. */
  const uint32_t req = len | (uint32_t)ISAAC_FRAME_OPAQUE_40CF50_ROUND_MASK;
  const uint32_t max_cap = (uint32_t)ISAAC_FRAME_OPAQUE_40CF50_CAPACITY_MAX;
  /* PE @ 0x0040cfa6: cmp ebx,eax; cmova ebx,eax — unsigned clamp; there is
     no _Xlength_error edge here, unlike the 0x0040ccd0 assign, and no
     geometric term (the destination was just zero-initialised). */
  return (req > max_cap) ? max_cap : req;
}

extern "C" uint32_t isaac_frame_opaque_40cf50_alloc_bytes(
    uint32_t new_capacity) {
  /* PE @ 0x0040cfab: lea ecx,[ebx+1] — 32-bit wrap. */
  return (uint32_t)(new_capacity + 1u);
}

extern "C" uint32_t isaac_frame_opaque_40cf50_copy_bytes(uint32_t len) {
  /* PE @ 0x0040cfb3: mov ecx,[ebp+8]; inc ecx — the spilled source size plus
     one, 32-bit wrap: a 0xffffffff size copies zero bytes. */
  return (uint32_t)(len + 1u);
}

extern "C" void isaac_frame_opaque_40cf50_apply_init(uint32_t* buf_word0,
                                                      uint32_t* size_field,
                                                      uint32_t* cap_field) {
  /* PE @ 0x0040cf5b/0x0040cf61/0x0040cf68: three dword stores of zero. Only
     the first dword of the inline buffer is cleared — +4…+0xf are not. */
  if (buf_word0 != nullptr) {
    *buf_word0 = 0u;
  }
  if (size_field != nullptr) {
    *size_field = 0u;
  }
  if (cap_field != nullptr) {
    *cap_field = 0u;
  }
}

extern "C" void isaac_frame_opaque_40cf50_apply_sso(uint8_t* dst,
                                                     const uint8_t* src,
                                                     uint32_t* size_field,
                                                     uint32_t* cap_field,
                                                     uint32_t len) {
  /* PE @ 0x0040cf82/0x0040cf8b: movups xmm0,[edi]; movups [esi],xmm0 — a
     fixed 16-byte copy whatever the size says. */
  if (dst != nullptr && src != nullptr) {
    for (uint32_t i = 0u; i < (uint32_t)ISAAC_FRAME_OPAQUE_40CF50_SSO_COPY_BYTES;
         ++i) {
      dst[i] = src[i];
    }
  }
  /* PE @ 0x0040cf8e: mov [esi+0x10],eax. */
  if (size_field != nullptr) {
    *size_field = len;
  }
  /* PE @ 0x0040cf85/0x0040cf93: mov ebx,0xf; mov [esi+0x14],ebx. */
  if (cap_field != nullptr) {
    *cap_field = (uint32_t)ISAAC_FRAME_OPAQUE_40CF50_SSO_CAPACITY;
  }
}

extern "C" void isaac_frame_opaque_40cf50_apply_grow_stores(
    uint32_t* buf_word0, uint32_t* size_field, uint32_t* cap_field,
    uint32_t buf_ptr, uint32_t len) {
  /* PE @ 0x0040cfb7: mov [esi],eax — the buffer pointer word is written
     first (before the CRT copy runs). */
  if (buf_word0 != nullptr) {
    *buf_word0 = buf_ptr;
  }
  /* PE @ 0x0040cfc7: mov [esi+0x10],eax. */
  if (size_field != nullptr) {
    *size_field = len;
  }
  /* PE @ 0x0040cfcc: mov [esi+0x14],ebx — ebx still holds the clamped
     capacity computed before the wrapper call; the same pure law re-derives
     it here. */
  if (cap_field != nullptr) {
    *cap_field = isaac_frame_opaque_40cf50_grow_capacity(len);
  }
}

/* ---- FUN_00874a10 lua pack/push sibling (ABI v23) ---- */

static_assert(offsetof(IsaacFrameOpaque874a10Plan, host_rawgeti) == 0, "874a10 host_rawgeti");
static_assert(offsetof(IsaacFrameOpaque874a10Plan, host_pushinteger) == 4, "874a10 host_pushinteger");
static_assert(offsetof(IsaacFrameOpaque874a10Plan, host_pushboolean) == 8, "874a10 host_pushboolean");
static_assert(offsetof(IsaacFrameOpaque874a10Plan, host_pcall) == 12, "874a10 host_pcall");
static_assert(offsetof(IsaacFrameOpaque874a10Plan, pcall_failed) == 16, "874a10 pcall_failed");
static_assert(offsetof(IsaacFrameOpaque874a10Plan, host_throw) == 20, "874a10 host_throw");
static_assert(offsetof(IsaacFrameOpaque874a10Plan, host_lual_ref) == 24, "874a10 host_lual_ref");
static_assert(offsetof(IsaacFrameOpaque874a10Plan, byte_arg) == 28, "874a10 byte_arg");
static_assert(offsetof(IsaacFrameOpaque874a10Plan, pure_cf_ok) == 32, "874a10 pure_cf_ok");
static_assert(offsetof(IsaacFrameOpaque874a10Plan, pure_complete) == 36, "874a10 pure_complete");
static_assert(sizeof(IsaacFrameOpaque874a10Plan) == 40, "874a10 plan size");

extern "C" int32_t isaac_frame_opaque_874a10_byte_arg(uint32_t raw) {
  /* PE @ 0x00874a4d: movzx eax, byte ptr [ebp+0x10] — the LOW BYTE of the
     stack slot, zero-extended. Explicit mask on a deliberately wide
     parameter: the Wasm ABI does not narrow i32 arguments and -O2 would
     delete the mask behind a uint8_t parameter. */
  return (int32_t)(raw & (uint32_t)ISAAC_FRAME_OPAQUE_874A10_BYTE_ARG_MASK);
}

extern "C" int32_t isaac_frame_opaque_874a10_pcall_nargs(void) {
  /* PE @ 0x00874a64: push 3 — the sibling difference from the v18 packer's
     push 5. */
  return ISAAC_FRAME_OPAQUE_874A10_PCALL_NARGS;
}

extern "C" uint32_t isaac_frame_opaque_874a10_push_sequence(
    int32_t* out_kinds, uint32_t len) {
  /* PE order: rawgeti @ 0x00874a2c, pushinteger @ 0x00874a3f / 0x00874a4b,
     pushboolean @ 0x00874a56. No branch — the sequence is fixed. */
  const int32_t kinds[4] = {
      ISAAC_FRAME_OPAQUE_874910_PUSH_CALLBACK_REF,
      ISAAC_FRAME_OPAQUE_874910_PUSH_INT_PACK4,
      ISAAC_FRAME_OPAQUE_874910_PUSH_INT_PACK8,
      ISAAC_FRAME_OPAQUE_874A10_PUSH_BOOL_BYTE,
  };
  const uint32_t total = (uint32_t)ISAAC_FRAME_OPAQUE_874A10_PUSH_SEQUENCE_LEN;
  if (out_kinds != nullptr) {
    const uint32_t n = (len < total) ? len : total;
    for (uint32_t i = 0u; i < n; ++i) {
      out_kinds[i] = kinds[i];
    }
  }
  return total;
}

extern "C" void isaac_frame_opaque_874a10_residual_plan(
    IsaacFrameOpaque874a10Plan* out, uint32_t byte_arg_raw,
    int32_t pcall_status) {
  if (out == nullptr) {
    return;
  }
  /* PE @ 0x00874a70: test eax,eax; jne throw — the v18 predicate reused. */
  const int32_t failed = isaac_frame_opaque_874910_pcall_failed(pcall_status);
  out->host_rawgeti = 1;
  out->host_pushinteger = 1;
  out->host_pushboolean = 1;
  out->host_pcall = 1;
  out->pcall_failed = failed;
  out->host_throw = failed;
  out->host_lual_ref = (failed != 0) ? 0 : 1;
  out->byte_arg = isaac_frame_opaque_874a10_byte_arg(byte_arg_raw);
  out->pure_cf_ok = 1;
  out->pure_complete = 0;
}

/* ---- FUN_0040cfe0 MSVC basic_string default-init (ABI v24) ---- */

static_assert(offsetof(IsaacFrameOpaque40cfe0Plan, pure_cf_ok) == 0,
              "40cfe0 pure_cf_ok");
static_assert(offsetof(IsaacFrameOpaque40cfe0Plan, pure_complete) == 4,
              "40cfe0 pure_complete");
static_assert(offsetof(IsaacFrameOpaque40cfe0Plan, default_capacity) == 8,
              "40cfe0 default_capacity");
static_assert(sizeof(IsaacFrameOpaque40cfe0Plan) == 12, "40cfe0 plan size");

extern "C" int32_t isaac_frame_opaque_40cfe0_default_capacity(void) {
  /* PE @ 0x0040cfe7: mov dword ptr [ecx+0x14],0xf. */
  return (int32_t)ISAAC_FRAME_OPAQUE_40CFE0_DEFAULT_CAPACITY;
}

extern "C" void isaac_frame_opaque_40cfe0_apply_init(
    uint8_t* buf0, uint32_t* size_field, uint32_t* cap_field) {
  /* PE @ 0x0040cfe0: mov dword ptr [ecx+0x10],0 — size first. */
  if (size_field != nullptr) {
    *size_field = 0u;
  }
  /* PE @ 0x0040cfe7: mov dword ptr [ecx+0x14],0xf — capacity second. */
  if (cap_field != nullptr) {
    *cap_field = (uint32_t)ISAAC_FRAME_OPAQUE_40CFE0_DEFAULT_CAPACITY;
  }
  /* PE @ 0x0040cfee: mov byte ptr [ecx],0 — a BYTE store, the first
     inline byte only. Bytes +1…+0xf of the inline buffer are NOT written
     (the zero-init sibling 0x0040cca0 and the 0x0040cf50 prologue clear
     the first DWORD instead; tests pin all three forms apart). */
  if (buf0 != nullptr) {
    *buf0 = 0u;
  }
}

extern "C" void isaac_frame_opaque_40cfe0_residual_plan(
    IsaacFrameOpaque40cfe0Plan* out) {
  if (out == nullptr) {
    return;
  }
  /* No branches, no calls: the whole body is three pure stores. */
  out->pure_cf_ok = 1;
  out->pure_complete = 1;
  out->default_capacity = (uint32_t)ISAAC_FRAME_OPAQUE_40CFE0_DEFAULT_CAPACITY;
}

/* ---- FUN_0040cca0 MSVC basic_string zero-init (ABI v25) ---- */

static_assert(offsetof(IsaacFrameOpaque40cca0Plan, pure_cf_ok) == 0,
              "40cca0 pure_cf_ok");
static_assert(offsetof(IsaacFrameOpaque40cca0Plan, pure_complete) == 4,
              "40cca0 pure_complete");
static_assert(offsetof(IsaacFrameOpaque40cca0Plan, zero_capacity) == 8,
              "40cca0 zero_capacity");
static_assert(sizeof(IsaacFrameOpaque40cca0Plan) == 12, "40cca0 plan size");

extern "C" void isaac_frame_opaque_40cca0_apply_zero(
    uint8_t* buf, uint32_t* size_field, uint32_t* cap_field) {
  /* PE @ 0x0040cca0: mov dword ptr [ecx],0 — the first DWORD of the inline
     buffer (bytes 0..3). Bytes 4..0xf are NOT written (the default-init
     0x0040cfe0 writes only byte 0; the tests pin both forms apart). Store
     order is buffer word first, then size (0x0040cca8), then capacity
     (0x0040ccaf). The `mov eax,ecx` return-value side effect is documented
     in the header and not re-exported. */
  if (buf != nullptr) {
    buf[0] = 0u;
    buf[1] = 0u;
    buf[2] = 0u;
    buf[3] = 0u;
  }
  if (size_field != nullptr) {
    *size_field = 0u;
  }
  if (cap_field != nullptr) {
    *cap_field = (uint32_t)ISAAC_FRAME_OPAQUE_40CCA0_ZERO_CAPACITY;
  }
}

extern "C" void isaac_frame_opaque_40cca0_residual_plan(
    IsaacFrameOpaque40cca0Plan* out) {
  if (out == nullptr) {
    return;
  }
  /* No branches, no calls: the whole body is pure stores. */
  out->pure_cf_ok = 1;
  out->pure_complete = 1;
  out->zero_capacity = (uint32_t)ISAAC_FRAME_OPAQUE_40CCA0_ZERO_CAPACITY;
}

extern "C" void isaac_frame_opaque_40cf50_residual_plan(
    IsaacFrameOpaque40cf50Plan* out, uint32_t src_size,
    uint32_t src_capacity) {
  if (out == nullptr) {
    return;
  }
  const int32_t sso = isaac_frame_opaque_40cf50_sso(src_size);
  const uint32_t new_cap =
      (sso != 0) ? (uint32_t)ISAAC_FRAME_OPAQUE_40CF50_SSO_CAPACITY
                 : isaac_frame_opaque_40cf50_grow_capacity(src_size);
  out->src_is_heap = isaac_frame_opaque_40cf50_src_is_heap(src_capacity);
  out->sso = sso;
  out->new_capacity = new_cap;
  out->alloc_bytes =
      (sso != 0) ? 0u : isaac_frame_opaque_40cf50_alloc_bytes(new_cap);
  out->copy_bytes = (sso != 0)
                        ? (uint32_t)ISAAC_FRAME_OPAQUE_40CF50_SSO_COPY_BYTES
                        : isaac_frame_opaque_40cf50_copy_bytes(src_size);
  out->host_alloc = (sso != 0) ? 0 : 1;
  out->host_copy = 1;
  out->store_ptr_before_copy = (sso != 0) ? 0 : 1;
  out->pure_cf_ok = 1;
  out->pure_complete = 0;
}

/* ---- FUN_0040d000 release wrapper + FUN_0040d040 string tidy (ABI v26) ---- */

static_assert(offsetof(IsaacFrameOpaque40d000Plan, aligned) == 0,
              "40d000 aligned");
static_assert(offsetof(IsaacFrameOpaque40d000Plan, invalid) == 4,
              "40d000 invalid");
static_assert(offsetof(IsaacFrameOpaque40d000Plan, free_bytes) == 8,
              "40d000 free_bytes");
static_assert(offsetof(IsaacFrameOpaque40d000Plan, free_ptr) == 12,
              "40d000 free_ptr");
static_assert(offsetof(IsaacFrameOpaque40d000Plan, host_free) == 16,
              "40d000 host_free");
static_assert(offsetof(IsaacFrameOpaque40d000Plan, host_invalid) == 20,
              "40d000 host_invalid");
static_assert(offsetof(IsaacFrameOpaque40d000Plan, pure_cf_ok) == 24,
              "40d000 pure_cf_ok");
static_assert(offsetof(IsaacFrameOpaque40d000Plan, pure_complete) == 28,
              "40d000 pure_complete");
static_assert(sizeof(IsaacFrameOpaque40d000Plan) == 32, "40d000 plan size");

extern "C" void isaac_frame_opaque_40d000_release_plan(
    IsaacFrameOpaque40d000Plan* out, uint32_t payload, uint32_t header,
    uint32_t bytes) {
  if (out == nullptr) {
    return;
  }
  /* PE @ 0x0040d009: cmp ecx,0x1000; jb small — unsigned. The v20 free
     adjustment law, standalone form (same arithmetic as the inlined
     0x0040cd74 / 0x006fdcfc sites). */
  const int32_t aligned = isaac_frame_opaque_free_adjust_needed(bytes);
  const uint32_t delta = isaac_frame_opaque_free_delta(payload, header);
  const int32_t delta_valid = isaac_frame_opaque_free_delta_valid(delta);
  const int32_t invalid =
      (aligned != 0) ? ((delta_valid == 0) ? 1 : 0) : 0;
  out->aligned = aligned;
  out->invalid = invalid;
  /* PE @ 0x0040d014: add ecx,0x23 — only on the aligned path; the small
     path hands the raw bytes straight to the platform. 32-bit wrap. */
  out->free_bytes = (aligned != 0)
                        ? isaac_frame_opaque_free_adjust_bytes(bytes)
                        : bytes;
  /* PE @ 0x0040d021: mov eax,edx — the release pointer is the stored
     header on the valid aligned path, the payload otherwise. The invalid
     branch (noreturn IAT 0xb18894) never reaches the free: the host must
     abort when host_invalid is set, not free. */
  out->free_ptr = (aligned != 0 && invalid == 0) ? header : payload;
  out->host_free = 1;      /* the raw release 0xaef15c is always platform */
  out->host_invalid = invalid;
  out->pure_cf_ok = 1;
  out->pure_complete = 0;
}

static_assert(offsetof(IsaacFrameOpaque40d040Plan, heap_used) == 0,
              "40d040 heap_used");
static_assert(offsetof(IsaacFrameOpaque40d040Plan, aligned) == 4,
              "40d040 aligned");
static_assert(offsetof(IsaacFrameOpaque40d040Plan, invalid) == 8,
              "40d040 invalid");
static_assert(offsetof(IsaacFrameOpaque40d040Plan, free_bytes) == 12,
              "40d040 free_bytes");
static_assert(offsetof(IsaacFrameOpaque40d040Plan, free_ptr) == 16,
              "40d040 free_ptr");
static_assert(offsetof(IsaacFrameOpaque40d040Plan, host_free) == 20,
              "40d040 host_free");
static_assert(offsetof(IsaacFrameOpaque40d040Plan, host_invalid) == 24,
              "40d040 host_invalid");
static_assert(offsetof(IsaacFrameOpaque40d040Plan, reset_size) == 28,
              "40d040 reset_size");
static_assert(offsetof(IsaacFrameOpaque40d040Plan, reset_capacity) == 32,
              "40d040 reset_capacity");
static_assert(offsetof(IsaacFrameOpaque40d040Plan, pure_complete) == 36,
              "40d040 pure_complete");
static_assert(offsetof(IsaacFrameOpaque40d040Plan, pure_cf_ok) == 40,
              "40d040 pure_cf_ok");
static_assert(sizeof(IsaacFrameOpaque40d040Plan) == 44, "40d040 plan size");

extern "C" void isaac_frame_opaque_40d040_tidy_plan(
    IsaacFrameOpaque40d040Plan* out, uint32_t capacity, uint32_t payload,
    uint32_t header) {
  if (out == nullptr) {
    return;
  }
  /* PE @ 0x0040d046: cmp ecx,0x10; jb skip-free — unsigned. The family's
     SSO capacity limit (ISAAC_FRAME_OPAQUE_40CF50_SSO_LIMIT == 0x10). */
  const int32_t heap_used =
      (capacity >= (uint32_t)ISAAC_FRAME_OPAQUE_40CF50_SSO_LIMIT) ? 1 : 0;
  uint32_t free_bytes = 0u;
  uint32_t free_ptr = 0u;
  int32_t aligned = 0;
  int32_t invalid = 0;
  if (heap_used != 0) {
    /* PE @0x0040d04d: inc ecx — free size is capacity + 1, 32-bit wrap
       (capacity 0xffffffff wraps to 0 and takes the small path). */
    const uint32_t bytes = (uint32_t)(capacity + 1u);
    aligned = isaac_frame_opaque_free_adjust_needed(bytes);
    const uint32_t delta = isaac_frame_opaque_free_delta(payload, header);
    const int32_t delta_valid = isaac_frame_opaque_free_delta_valid(delta);
    invalid = (aligned != 0) ? ((delta_valid == 0) ? 1 : 0) : 0;
    free_bytes = (aligned != 0)
                     ? isaac_frame_opaque_free_adjust_bytes(bytes)
                     : bytes;
    free_ptr = (aligned != 0 && invalid == 0) ? header : payload;
  }
  out->heap_used = heap_used;
  out->aligned = aligned;
  out->invalid = invalid;
  out->free_bytes = free_bytes;
  out->free_ptr = free_ptr;
  out->host_free = heap_used;
  out->host_invalid = invalid;
  /* PE @0x40d072..0x40d080 — the reset stores run unconditionally. */
  out->reset_size = 0;
  out->reset_capacity = (uint32_t)ISAAC_FRAME_OPAQUE_40D040_RESET_CAPACITY;
  /* SSO string: no free, no host action — the whole body is the reset. */
  out->pure_complete = (heap_used == 0) ? 1 : 0;
  out->pure_cf_ok = 1;
}

extern "C" void isaac_frame_opaque_40d040_apply_reset(
    uint8_t* buf0, uint32_t* size_field, uint32_t* cap_field) {
  /* PE @0x0040d072..0x0040d080 — the v26 tidy reset law: size := 0,
     capacity := 0xf, then the first inline byte := 0. Store order and
     widths are byte-for-byte the v24 default-init (0x0040cfe0); the v25
     zero-init law (DWORD store, capacity 0) stays pinned apart by tests. */
  if (size_field != nullptr) {
    *size_field = 0u;
  }
  if (cap_field != nullptr) {
    *cap_field = (uint32_t)ISAAC_FRAME_OPAQUE_40D040_RESET_CAPACITY;
  }
  if (buf0 != nullptr) {
    *buf0 = 0u;
  }
}

/* ---- FUN_004257b0 Pass A host-edge closure (ABI v29) ---- */

static_assert(offsetof(IsaacFrameOpaque90ac70Plan, subject_null) == 0,
              "90ac70 plan subject_null");
static_assert(offsetof(IsaacFrameOpaque90ac70Plan, found) == 4,
              "90ac70 plan found");
static_assert(offsetof(IsaacFrameOpaque90ac70Plan, elem_index) == 8,
              "90ac70 plan elem_index");
static_assert(offsetof(IsaacFrameOpaque90ac70Plan, host_null_log) == 12,
              "90ac70 plan host_null_log");
static_assert(offsetof(IsaacFrameOpaque90ac70Plan, host_burst) == 16,
              "90ac70 plan host_burst");
static_assert(offsetof(IsaacFrameOpaque90ac70Plan, burst_log_count) == 20,
              "90ac70 plan burst_log_count");
static_assert(offsetof(IsaacFrameOpaque90ac70Plan, pure_cf_ok) == 24,
              "90ac70 plan pure_cf_ok");
static_assert(offsetof(IsaacFrameOpaque90ac70Plan, pure_complete) == 28,
              "90ac70 plan pure_complete");
static_assert(sizeof(IsaacFrameOpaque90ac70Plan) == 32, "90ac70 plan size");

static_assert(offsetof(IsaacFrameOpaque4264c0Plan, arm) == 0,
              "4264c0 plan arm");
static_assert(offsetof(IsaacFrameOpaque4264c0Plan, lo) == 4, "4264c0 plan lo");
static_assert(offsetof(IsaacFrameOpaque4264c0Plan, hi) == 8, "4264c0 plan hi");
static_assert(offsetof(IsaacFrameOpaque4264c0Plan, subject_ptr) == 12,
              "4264c0 plan subject_ptr");
static_assert(offsetof(IsaacFrameOpaque4264c0Plan, host_90ac70) == 16,
              "4264c0 plan host_90ac70");
static_assert(offsetof(IsaacFrameOpaque4264c0Plan, host_burst) == 20,
              "4264c0 plan host_burst");
static_assert(offsetof(IsaacFrameOpaque4264c0Plan, pure_cf_ok) == 24,
              "4264c0 plan pure_cf_ok");
static_assert(sizeof(IsaacFrameOpaque4264c0Plan) == 28, "4264c0 plan size");

extern "C" int32_t isaac_frame_opaque_9b9480_player_counted(uint32_t q_ptr,
                                                             uint32_t p_ptr,
                                                             int32_t q_161c,
                                                             int32_t p_161c) {
  /* PE 0x009b9493..0x009b94bc: cl := 1 only when ALL of q != 0
     (0x009b949b test/je), q_161c != -1 (0x009b94a5 cmp/je exact
     equality), q_161c < p_161c (0x009b94b0 SIGNED jge skips), and
     q != p (0x009b94b2 pointer cmp/je) hold; counted is the cl == 0
     arm (0x009b94c1 cmovne keeps the old count when cl != 0). */
  if (q_ptr != 0u && q_161c != -1 && q_161c < p_161c && q_ptr != p_ptr) {
    return 0;
  }
  return 1;
}

extern "C" uint32_t isaac_frame_opaque_9b9480_count(const uint32_t* q_ptrs,
                                                     const uint32_t* p_ptrs,
                                                     const int32_t* q_161cs,
                                                     const int32_t* p_161cs,
                                                     uint32_t count) {
  /* PE decrement loop (0x009b94c9 sub ebx,1 / jne); bounds read once.
     q_161c is only read by the PE when q != 0 — the sample array may
     carry anything at those indices without affecting the count. */
  if (q_ptrs == nullptr || p_ptrs == nullptr || q_161cs == nullptr ||
      p_161cs == nullptr) {
    return 0;
  }
  uint32_t result = 0;
  for (uint32_t i = 0; i < count; i++) {
    if (isaac_frame_opaque_9b9480_player_counted(q_ptrs[i], p_ptrs[i],
                                                 q_161cs[i], p_161cs[i]) != 0) {
      result = (uint32_t)(result + 1u);
    }
  }
  return result;
}

extern "C" int32_t isaac_frame_opaque_9b9310_fetch_index(
    const uint32_t* q_ptrs,
    const uint32_t* p_ptrs,
    const int32_t* q_161cs,
    const int32_t* p_161cs,
    uint32_t count,
    uint32_t wanted) {
  /* PE 0x009b9333..0x009b9363: i walks ALL elements (bound captured
     once, unsigned jb); k advances only on counted elements
     (0x009b9356 cmp edx,[ebp+8] / je found BEFORE the k increment);
     found returns begin[i] (0x009b9376) — the element index, not the
     counted ordinal. Exhaustion returns 0 (modeled as -1). */
  if (q_ptrs == nullptr || p_ptrs == nullptr || q_161cs == nullptr ||
      p_161cs == nullptr) {
    return -1;
  }
  uint32_t k = 0;
  for (uint32_t i = 0; i < count; i++) {
    if (isaac_frame_opaque_9b9480_player_counted(q_ptrs[i], p_ptrs[i],
                                                 q_161cs[i], p_161cs[i]) != 0) {
      if (k == wanted) {
        return (int32_t)i;
      }
      k = (uint32_t)(k + 1u);
    }
  }
  return -1;
}

extern "C" uint32_t isaac_frame_opaque_417800_subject(uint32_t p_ptr,
                                                       uint32_t q_ptr,
                                                       int32_t q_161c,
                                                       int32_t p_161c) {
  /* PE 0x00417800..0x0041781f (and the inline copy at 0x004264de..
     0x004264fb): q when q != 0, q_161c != -1, q_161c < p_161c (SIGNED
     jl), else p. NO q != p condition — deliberately weaker than the
     counted predicate; do not harmonize. */
  if (q_ptr != 0u && q_161c != -1 && q_161c < p_161c) {
    return q_ptr;
  }
  return p_ptr;
}

extern "C" int32_t isaac_frame_opaque_90ac70_player_for_id(
    const int32_t* player_ids_1618,
    uint32_t player_count,
    int32_t id) {
  /* PE 0x0090acf1..0x0090ad03: first match wins; exhaustion → esi = 0
     (modeled as -1); count == 0 skips the walk (0x0090aced test/je). */
  if (player_ids_1618 == nullptr) {
    return -1;
  }
  for (uint32_t i = 0; i < player_count; i++) {
    if (player_ids_1618[i] == id) {
      return (int32_t)i;
    }
  }
  return -1;
}

extern "C" int32_t isaac_frame_opaque_90ac70_elem_matches(
    uint32_t resolved_player_ptr,
    uint32_t subj2_ptr,
    int32_t elem_id,
    int32_t subject_id_1618) {
  /* PE 0x0090ad0f cmp esi,eax / je (pointer equality: the resolved
     player — 0 on a miss — against the 0x00417800 subject), then
     0x0090ad17 cmp ebx,[ecx+0x1618] / je. */
  if (resolved_player_ptr == subj2_ptr) {
    return 1;
  }
  if (elem_id == subject_id_1618) {
    return 1;
  }
  return 0;
}

extern "C" int32_t isaac_frame_opaque_90ac70_match_index(
    const uint32_t* elem_ids,
    uint32_t elem_count,
    const uint32_t* player_ptrs,
    const int32_t* player_ids_1618,
    uint32_t player_count,
    uint32_t subject_ptr,
    uint32_t subject_q_ptr,
    int32_t subject_q_161c,
    int32_t subject_161c,
    int32_t subject_id_1618) {
  /* Main walk 0x0090ace2..0x0090ad3f: container bound and player-vector
     bounds captured ONCE before the loop; the per-element player
     resolution re-walks the same captured player range. subj2 is loop
     invariant in effect (recomputed per iteration by the PE via the
     0x0090ad0a call — same inputs, same result; hoisted here). */
  if (elem_ids == nullptr) {
    return -1;
  }
  const uint32_t subj2 = isaac_frame_opaque_417800_subject(
      subject_ptr, subject_q_ptr, subject_q_161c, subject_161c);
  for (uint32_t k = 0; k < elem_count; k++) {
    const int32_t pidx = isaac_frame_opaque_90ac70_player_for_id(
        player_ids_1618, player_count, (int32_t)elem_ids[k]);
    uint32_t resolved = 0u;
    if (pidx >= 0 && player_ptrs != nullptr) {
      resolved = player_ptrs[pidx];
    }
    if (isaac_frame_opaque_90ac70_elem_matches(resolved, subj2,
                                               (int32_t)elem_ids[k],
                                               subject_id_1618) != 0) {
      return (int32_t)k;
    }
  }
  return -1;
}

extern "C" void isaac_frame_opaque_90ac70_residual_plan(
    IsaacFrameOpaque90ac70Plan* out,
    const uint32_t* elem_ids,
    uint32_t elem_count,
    const uint32_t* player_ptrs,
    const int32_t* player_ids_1618,
    uint32_t player_count,
    uint32_t subject_ptr,
    uint32_t subject_q_ptr,
    int32_t subject_q_161c,
    int32_t subject_161c,
    int32_t subject_id_1618) {
  if (out == nullptr) {
    return;
  }
  const int32_t subject_null = (subject_ptr == 0u) ? 1 : 0;
  int32_t found = 0;
  int32_t elem_index = -1;
  int32_t host_burst = 0;
  uint32_t burst_log_count = 0;
  if (subject_null == 0) {
    elem_index = isaac_frame_opaque_90ac70_match_index(
        elem_ids, elem_count, player_ptrs, player_ids_1618, player_count,
        subject_ptr, subject_q_ptr, subject_q_161c, subject_161c,
        subject_id_1618);
    found = (elem_index >= 0) ? 1 : 0;
    if (found == 0) {
      /* NOT-FOUND burst: 4 headers + per elem (entry log + dev-type or
         no-assoc) + final divider. The PE re-derives the per-elem bound
         from the live container every iteration (0x0090ae47..0x0090ae53)
         — invariant during the burst (nothing in it writes the bounds),
         so the captured count is exact. */
      host_burst = 1;
      burst_log_count = (uint32_t)(
          (uint32_t)ISAAC_FRAME_OPAQUE_90AC70_BURST_BASE_LOGS +
          (uint32_t)ISAAC_FRAME_OPAQUE_90AC70_BURST_PER_ELEM_LOGS *
              elem_count);
    }
  }
  out->subject_null = subject_null;
  out->found = found;
  out->elem_index = elem_index;
  out->host_null_log = subject_null;
  out->host_burst = host_burst;
  out->burst_log_count = burst_log_count;
  out->pure_cf_ok = 1;
  out->pure_complete = (found != 0 && subject_null == 0) ? 1 : 0;
}

extern "C" void isaac_frame_opaque_4264c0_pair_plan(
    IsaacFrameOpaque4264c0Plan* out,
    int32_t container_empty,
    uint32_t player_ptr,
    int32_t player_id_1618,
    int32_t player_161c,
    uint32_t q_ptr,
    int32_t q_161c,
    int32_t obj_found,
    uint32_t obj_sub_ptr,
    uint32_t obj_sub_lo,
    uint32_t obj_sub_hi) {
  if (out == nullptr) {
    return;
  }
  /* The subject is computed even on the empty arm order-wise? NO — the
     PE takes the 0x004264d9 je BEFORE reading [player+0x1e68]; the
     empty arm reads only [player+0x1618]. The plan still reports the
     law's value for consumers, computed from the supplied scalars —
     harmless because the inputs are host-captured samples, not live
     loads. */
  const uint32_t subject = isaac_frame_opaque_417800_subject(
      player_ptr, q_ptr, q_161c, player_161c);
  int32_t arm;
  uint32_t lo;
  uint32_t hi;
  int32_t host_burst = 0;
  if (container_empty != 0) {
    arm = ISAAC_FRAME_OPAQUE_4264C0_ARM_EMPTY;
    lo = (uint32_t)player_id_1618;
    hi = 0u;
  } else if (obj_found == 0) {
    arm = ISAAC_FRAME_OPAQUE_4264C0_ARM_NOT_FOUND;
    lo = 0xffffffffu;
    hi = 0xffffffffu;
    host_burst = 1;
  } else if (obj_sub_ptr == 0u) {
    arm = ISAAC_FRAME_OPAQUE_4264C0_ARM_SUB_NULL;
    lo = 0u;
    hi = 0u;
  } else {
    arm = ISAAC_FRAME_OPAQUE_4264C0_ARM_SUB_PAIR;
    lo = obj_sub_lo;
    hi = obj_sub_hi;
  }
  out->arm = arm;
  out->lo = lo;
  out->hi = hi;
  out->subject_ptr = subject;
  out->host_90ac70 = (container_empty == 0) ? 1 : 0;
  out->host_burst = host_burst;
  out->pure_cf_ok = 1;
}

extern "C" uint32_t isaac_frame_opaque_4257b0_pass_a_pairs_from_samples(
    uint32_t* out_pairs,
    uint32_t out_len,
    const uint32_t* p_ptrs,
    const int32_t* p_ids_1618,
    const int32_t* p_161cs,
    const uint32_t* q_ptrs,
    const int32_t* q_161cs,
    const int32_t* q_ids_1618,
    const uint32_t* qq_ptrs,
    const int32_t* qq_161cs,
    uint32_t player_count,
    int32_t container_empty,
    const uint32_t* elem_ids,
    const uint32_t* elem_sub_ptrs,
    const uint32_t* elem_sub_los,
    const uint32_t* elem_sub_his,
    uint32_t elem_count,
    uint32_t id_count) {
  if (out_pairs == nullptr || p_ptrs == nullptr || p_ids_1618 == nullptr ||
      p_161cs == nullptr || q_ptrs == nullptr || q_161cs == nullptr ||
      q_ids_1618 == nullptr || qq_ptrs == nullptr || qq_161cs == nullptr) {
    return 0;
  }
  uint32_t resolved = 0;
  for (uint32_t j = 0; j < id_count; j++) {
    if ((uint32_t)(resolved * 2u + 2u) > out_len) {
      break;
    }
    const int32_t pi = isaac_frame_opaque_9b9310_fetch_index(
        q_ptrs, p_ptrs, q_161cs, p_161cs, player_count, j);
    if (pi < 0) {
      /* Unreachable live (the vector cannot change between the count and
         the fetch inside one 4257b0 call); inconsistent samples stop. */
      break;
    }
    const uint32_t p_ptr = p_ptrs[pi];
    IsaacFrameOpaque4264c0Plan plan;
    if (container_empty != 0) {
      isaac_frame_opaque_4264c0_pair_plan(
          &plan, 1, p_ptr, p_ids_1618[pi], p_161cs[pi], q_ptrs[pi],
          q_161cs[pi], 0, 0u, 0u, 0u);
    } else {
      /* The 0x0090ac70 walk takes the SUBJECT as its argument and applies
         the 0x00417800 law to it again / gates on [subject+0x1618] — so
         when the law selects q, the walk runs over the q object's own
         fields (q_ids_1618 / qq_ptrs / qq_161cs samples). */
      const int32_t sel_q =
          (q_ptrs[pi] != 0u && q_161cs[pi] != -1 &&
           q_161cs[pi] < p_161cs[pi])
              ? 1
              : 0;
      const uint32_t subj_ptr = (sel_q != 0) ? q_ptrs[pi] : p_ptr;
      const uint32_t subj_q = (sel_q != 0) ? qq_ptrs[pi] : q_ptrs[pi];
      const int32_t subj_q_161c = (sel_q != 0) ? qq_161cs[pi] : q_161cs[pi];
      const int32_t subj_161c = (sel_q != 0) ? q_161cs[pi] : p_161cs[pi];
      const int32_t subj_id = (sel_q != 0) ? q_ids_1618[pi] : p_ids_1618[pi];
      const int32_t obj = isaac_frame_opaque_90ac70_match_index(
          elem_ids, elem_count, p_ptrs, p_ids_1618, player_count, subj_ptr,
          subj_q, subj_q_161c, subj_161c, subj_id);
      const int32_t obj_found = (obj >= 0) ? 1 : 0;
      uint32_t sub_ptr = 0u;
      uint32_t sub_lo = 0u;
      uint32_t sub_hi = 0u;
      if (obj_found != 0 && elem_sub_ptrs != nullptr) {
        sub_ptr = elem_sub_ptrs[obj];
        if (sub_ptr != 0u && elem_sub_los != nullptr &&
            elem_sub_his != nullptr) {
          sub_lo = elem_sub_los[obj];
          sub_hi = elem_sub_his[obj];
        }
      }
      isaac_frame_opaque_4264c0_pair_plan(
          &plan, 0, p_ptr, p_ids_1618[pi], p_161cs[pi], q_ptrs[pi],
          q_161cs[pi], obj_found, sub_ptr, sub_lo, sub_hi);
    }
    out_pairs[resolved * 2u] = plan.lo;
    out_pairs[resolved * 2u + 1u] = plan.hi;
    resolved = (uint32_t)(resolved + 1u);
  }
  return resolved;
}


/* ---- FUN_00421b50 bit-vector merge (ABI v30) ---- */

static_assert(offsetof(IsaacFrameOpaque421b50Plan, pure_cf_ok) == 0,
              "421b50 pure_cf_ok");
static_assert(offsetof(IsaacFrameOpaque421b50Plan, pure_complete) == 4,
              "421b50 pure_complete");
static_assert(offsetof(IsaacFrameOpaque421b50Plan, words) == 8,
              "421b50 words");
static_assert(sizeof(IsaacFrameOpaque421b50Plan) == 12, "421b50 plan size");

extern "C" uint32_t isaac_frame_opaque_421b50_words(uint32_t count) {
  /* PE loop bound 0x00421b64 `cmp [edi+0x8b8],ebx ; jbe` + 0x00421bd3
     `jb` — unsigned bit count; count==0 touches NO word. ceil(count/32)
     written wrap-safe: (count-1)>>5 + 1, never count+31 (which wraps to
     0 at count == 0xffffffff). */
  return (count == 0u) ? 0u : ((count - 1u) >> 5) + 1u;
}

extern "C" uint32_t isaac_frame_opaque_421b50_partial_mask(uint32_t count) {
  /* PE tail word: 0x00421b80 `and edx,0x1f`, 0x00421b90 `shl eax,cl`,
     bts/btr touch exactly one bit each — only bits below (count&31) of
     the last word participate; a word-aligned count is a FULL word
     (mask 0xffffffff), and upper bits of a partial word are preserved
     in BOTH arrays. */
  const uint32_t k = count & 31u;
  return (k == 0u) ? 0xffffffffu : ((1u << k) - 1u);
}

extern "C" uint32_t isaac_frame_opaque_421b50_merged_a(uint32_t a, uint32_t b,
                                                       uint32_t mask) {
  /* PE per bit: A bit set (0x00421b9c test; 0x00421ba0 jne bts) stays
     set; else set iff B bit set (0x00421bac test; bts), else cleared
     (0x00421bb5 btr). Accumulates per word to a | (b & mask): bits
     outside the mask are untouched (the word is re-stored after each
     one-bit op). */
  return a | (b & mask);
}

extern "C" uint32_t isaac_frame_opaque_421b50_cleared_b(uint32_t b,
                                                        uint32_t mask) {
  /* PE 0x00421bcd `btr eax,edx` + 0x00421bd0 store: every bit below the
     count is cleared once; bits above the count keep their value. */
  return b & ~mask;
}

extern "C" uint32_t isaac_frame_opaque_421b50_apply(uint32_t* a_arr,
                                                    uint32_t* b_arr,
                                                    uint32_t count) {
  const uint32_t words = isaac_frame_opaque_421b50_words(count);
  if (a_arr == nullptr && b_arr == nullptr) {
    return words;
  }
  for (uint32_t w = 0u; w < words; ++w) {
    /* The PE has no separate "last word" test — the mask IS the loop's
       residual (bits < count); a word-aligned count makes the last word
       full. */
    const uint32_t mask =
        (w + 1u == words) ? isaac_frame_opaque_421b50_partial_mask(count)
                          : 0xffffffffu;
    if (a_arr != nullptr && b_arr != nullptr) {
      /* Both arrays live: PE order A-store (0x00421bc2) then B-store
         (0x00421bd0). */
      const uint32_t a = a_arr[w];
      const uint32_t b = b_arr[w];
      a_arr[w] = isaac_frame_opaque_421b50_merged_a(a, b, mask);
      b_arr[w] = isaac_frame_opaque_421b50_cleared_b(b, mask);
    } else if (a_arr != nullptr) {
      /* Family null-skip contract mirror: the absent side's store is
         skipped. */
      const uint32_t a = a_arr[w];
      const uint32_t b = 0u;
      a_arr[w] = isaac_frame_opaque_421b50_merged_a(a, b, mask);
    } else {
      const uint32_t b = b_arr[w];
      b_arr[w] = isaac_frame_opaque_421b50_cleared_b(b, mask);
    }
  }
  return words;
}

extern "C" void isaac_frame_opaque_421b50_plan(
    IsaacFrameOpaque421b50Plan* out, uint32_t count) {
  if (out == nullptr) {
    return;
  }
  /* No branches beyond the loop bound, no calls, no guest reads: the
     whole body is pure. */
  out->pure_cf_ok = 1;
  out->pure_complete = 1;
  out->words = isaac_frame_opaque_421b50_words(count);
}

extern "C" int32_t isaac_frame_opaque_list6772c_sweep(
    const int32_t* timers, int32_t count, int32_t* timers_out,
    int32_t* evict_out) {
  /* PE 0x006fbb2f..0x006fbb36: `cmp dword [game+0x67730],0 / je` — a
     zero _Mysize skips the whole walk. Negative counts are out of the
     blob contract ([1, NODE_MAX]); the no-op answer is the PE-equivalent
     skip for the only in-contract zero value and mutates nothing. */
  if (count <= 0) {
    return 0;
  }
  /* Out of contract: the Update slice gates the blob path on
     count in [1, ISAAC_UPDATE_LIST_MAX_NODES] (32) and falls back to the
     monolithic residual otherwise; -1 reports that condition so a caller
     can keep that fallback byte-for-byte without re-deriving the gate. */
  if (count > ISAAC_FRAME_OPAQUE_LIST6772C_NODE_MAX) {
    return -1;
  }
  int32_t evicted = 0;
  for (int32_t i = 0; i < count; ++i) {
    const int32_t timer = timers[i];
    int32_t next = timer;
    int32_t evict = 0;
    if (timer == 0) {
      /* Zero-countdown node: evict. timers_out keeps 0 (the storage is
         freed by the host; the slice's update_list_sweep writes the same
         0). */
      evict = 1;
      next = 0;
      evicted += 1;
    } else if (timer > 0) {
      /* PE 0x006fbb95 jle runs on flags from `test eax,eax` (OF clear),
         so the taken edge is strictly negative; only strictly positive
         countdowns reach `dec eax` (0x006fbb97) and cannot wrap. */
      next = timer - 1;
    } else {
      /* Strictly negative countdowns are untouched. */
      next = timer;
    }
    if (timers_out != nullptr) {
      timers_out[i] = next;
    }
    if (evict_out != nullptr) {
      evict_out[i] = evict;
    }
  }
  return evicted;
}



static_assert(offsetof(IsaacFrameOpaque4212c0TrueProbePlan, mgr_f18) == 0,
              "4212c0 true-probe mgr_f18");
static_assert(offsetof(IsaacFrameOpaque4212c0TrueProbePlan, mgr_flag14) == 4,
              "4212c0 true-probe mgr_flag14");
static_assert(offsetof(IsaacFrameOpaque4212c0TrueProbePlan, mgr_ebc) == 8,
              "4212c0 true-probe mgr_ebc");
static_assert(offsetof(IsaacFrameOpaque4212c0TrueProbePlan, mgr_21618) == 12,
              "4212c0 true-probe mgr_21618");
static_assert(offsetof(IsaacFrameOpaque4212c0TrueProbePlan, mgr_21620) == 16,
              "4212c0 true-probe mgr_21620");
static_assert(offsetof(IsaacFrameOpaque4212c0TrueProbePlan, mgr_21624) == 20,
              "4212c0 true-probe mgr_21624");
static_assert(offsetof(IsaacFrameOpaque4212c0TrueProbePlan, mgr_2161c) == 24,
              "4212c0 true-probe mgr_2161c");
static_assert(offsetof(IsaacFrameOpaque4212c0TrueProbePlan, mgr_29fb8) == 28,
              "4212c0 true-probe mgr_29fb8");
static_assert(offsetof(IsaacFrameOpaque4212c0TrueProbePlan, volume_bits) == 32,
              "4212c0 true-probe volume_bits");
static_assert(offsetof(IsaacFrameOpaque4212c0TrueProbePlan, host_92e430) == 36,
              "4212c0 true-probe host_92e430");
static_assert(offsetof(IsaacFrameOpaque4212c0TrueProbePlan, next_va) == 40,
              "4212c0 true-probe next_va");
static_assert(offsetof(IsaacFrameOpaque4212c0TrueProbePlan, pure_cf_ok) == 44,
              "4212c0 true-probe pure_cf_ok");
static_assert(sizeof(IsaacFrameOpaque4212c0TrueProbePlan) == 48,
              "4212c0 true-probe plan size");

/* FUN_004212c0 true-probe interior 0x00421343..0x004213ab (ABI v32).
   Manager stores, then volume ucomiss vs DAT_00baa454 (1.0f).
   0x00421397 lahf; 0x00421398 test ah,0x44; 0x0042139b jnp 0x4213ab.
   JNP taken on ordered-equal (skip store + host). Fallthrough is not
   ordered-equal (or NaN): store 0x3f800000, then host
   SoundEffects::ClearVolumeModifier (0x0092e430). Later calls at
   0x004213ab stay host (0x006fd7c0 / 0x008318a0). */

extern "C" int32_t isaac_frame_opaque_4212c0_volume_eq_one(float volume) {
  return (volume == 1.0f) ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_4212c0_host_92e430_needed(float volume) {
  return isaac_frame_opaque_4212c0_volume_eq_one(volume) == 0 ? 1 : 0;
}

extern "C" float isaac_frame_opaque_4212c0_volume_after_gate(float volume) {
  if (isaac_frame_opaque_4212c0_volume_eq_one(volume) != 0) {
    return volume;
  }
  return 1.0f;
}

extern "C" void isaac_frame_opaque_4212c0_true_probe_plan(
    IsaacFrameOpaque4212c0TrueProbePlan* out, int32_t mgr_f18, int32_t mgr_ebc,
    float volume) {
  if (out == nullptr) {
    return;
  }
  const int32_t eq = isaac_frame_opaque_4212c0_volume_eq_one(volume);
  out->mgr_f18 = (uint32_t)((int32_t)((uint32_t)mgr_f18 + 1u));
  out->mgr_flag14 = 1u;
  out->mgr_ebc = (uint32_t)((int32_t)((uint32_t)mgr_ebc + 1u));
  out->mgr_21618 = 1u;
  out->mgr_21620 = 0u;
  out->mgr_21624 = 1u;
  out->mgr_2161c = (uint32_t)ISAAC_FRAME_OPAQUE_4212C0_TIMER_IMM;
  out->mgr_29fb8 = 1u;
  out->volume_bits =
      fo_f32_bits(isaac_frame_opaque_4212c0_volume_after_gate(volume));
  out->host_92e430 = (eq == 0) ? 1u : 0u;
  out->next_va = ISAAC_FRAME_OPAQUE_4212C0_TRUE_PROBE_END_VA;
  out->pure_cf_ok = 1u;
}

/* ---- FUN_00424cd0 0x40c7f0-TWIN CTOR SEAMS (ABI v57) ----
   PE 0x00424cd0..0x00424d69 ret (thiscall this=ecx; straight-line, no
   branches; SEH filter 0xaf0b40, GS cookie [0xbf93b4]; 58 insns, 2 E8
   (both -> 0x40c7f0 — IRREDUCIBLE-PROVEN v71 pair ctor, HOST), 4
   indirect (2x virtual release + 2x [0xc7163c] callback), 4 stores
   (2x fs:[0] + [ebp-4] 0/1); 5 direct callers 0x6f355a/0x6f3565
   (monster-class ctor band at 0x6f35xx)/0x83c535 (class dtor
   0x83c4xx..0x83c5e2)/0x8d1d38/0x8d1d43 (the 0x8d1d20 reset helper —
   the SAME +0x7dc/+0x808 pair members the v56 424c40 callers attach)).
   Body: two 0x40c7f0 attach calls (ecx=this @0x424cf8 and ecx=this+8 via
   lea edi,[esi+8] @0x424d04, both push 0), then the INLINE double
   IRREDUCIBLE release chain: chain 0 on the this+8 pair's object
   ([edi+4] @0x424d10; virtual [[ecx]+0xc] @0x424d1c; test al;
   [0xc7163c] gate @0x424d22; callback(push edi) @0x424d2c), chain 1 on
   the this pair's object ([esi+4] @0x424d38; release @0x424d44; gate
   @0x424d4a; callback(push esi) @0x424d54). DELTAS vs 0x424c40: NO
   zero-dword table (no zeroed_at/zero_store_index) and NO return-this
   (no mov eax,esi — eax at ret is the last chain's leftover, NOT this).
   The pair geometry + release-chain geometry + the gate law are the
   pure scalar seams; both attach calls and both chains stay host. */
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_424CD0_VA == 0x00424cd0u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424CD0_END_VA == 0x00424d6au &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424CD0_CALL_SITES == 5u,
              "424cd0 twin ctor 0x424cd0..0x424d69 ret, 5 callers");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_424CD0_CALLER1_VA == 0x006f355au &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424CD0_CALLER2_VA == 0x006f3565u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424CD0_CALLER3_VA == 0x0083c535u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424CD0_CALLER4_VA == 0x008d1d38u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424CD0_CALLER5_VA == 0x008d1d43u,
              "424cd0 callers: 0x6f355a/0x6f3565 ctor band + 0x83c535 dtor + 0x8d1d38/0x8d1d43 reset");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_424CD0_SEH_HANDLER_VA == 0x00af0b40u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424CD0_COOKIE_VA == 0x00bf93b4u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424CD0_PAIR_HOST_VA == 0x0040c7f0u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424CD0_PAIR0_OFF == 0u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424CD0_PAIR1_OFF == 8u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424CD0_PAIR_ARG == 0u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424CD0_PAIR0_CALL_VA == 0x00424cf8u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424CD0_PAIR1_CALL_VA == 0x00424d04u,
              "424cd0 pair attach: ecx=this/this+8, push 0, call 0x40c7f0");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_424CD0_RELEASE_RECEIVER_OFF == 4u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424CD0_RELEASE_VTBL_SLOT_OFF == 0xcu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424CD0_RELEASE_CALLBACK_VA == 0x00c7163cu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424CD0_RELEASE_CHAIN_COUNT == 2u,
              "424cd0 release chain: [pair+4] obj, [[obj]+0xc] virtual, [0xc7163c] registry");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_424CD0_CHAIN0_GATE_VA == 0x00424d10u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424CD0_CHAIN1_GATE_VA == 0x00424d38u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424CD0_CHAIN0_RELEASE_CALL_VA == 0x00424d1cu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424CD0_CHAIN1_RELEASE_CALL_VA == 0x00424d44u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424CD0_CHAIN0_CALLBACK_CALL_VA == 0x00424d2cu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424CD0_CHAIN1_CALLBACK_CALL_VA == 0x00424d54u,
              "424cd0 chains: 0 on this+8 pair (0x424d10..0x424d2c), 1 on this pair (0x424d38..0x424d54)");

extern "C" uint32_t isaac_frame_opaque_424cd0_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424CD0_VA);
}
extern "C" uint32_t isaac_frame_opaque_424cd0_end_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424CD0_END_VA);
}
extern "C" uint32_t isaac_frame_opaque_424cd0_call_sites(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424CD0_CALL_SITES);
}
extern "C" uint32_t isaac_frame_opaque_424cd0_seh_handler_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424CD0_SEH_HANDLER_VA);
}
extern "C" uint32_t isaac_frame_opaque_424cd0_cookie_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424CD0_COOKIE_VA);
}
extern "C" uint32_t isaac_frame_opaque_424cd0_pair_host_va(void) {
  /* The pair-attach callee (2x, ecx=this/this+8) stays HOST:
     IRREDUCIBLE-PROVEN v71 (exit-40c7f0 v12 peels isaac_exit_40c7f0_*;
     anm2-v51 census: KAGE smart-handle pair ctor, alloc 0xa0f4c0(0x18) +
     0x40cc10 + vtable 0xb1a6e0 + the [0xc7163c] registry gate + virtual
     release; update slice opaque_call_0040c7f0). */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424CD0_PAIR_HOST_VA);
}
extern "C" uint32_t isaac_frame_opaque_424cd0_pair0_off(void) {
  /* @0x424cf4 mov esi,ecx; @0x424cf8 call — first attach receiver is
     `this` itself (offset 0). */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424CD0_PAIR0_OFF);
}
extern "C" uint32_t isaac_frame_opaque_424cd0_pair1_off(void) {
  /* @0x424cfd lea edi,[esi+8]; @0x424d02 mov ecx,edi — second attach
     receiver is this+8. */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424CD0_PAIR1_OFF);
}
extern "C" uint32_t isaac_frame_opaque_424cd0_pair_arg(void) {
  /* @0x424cf6 / @0x424d00 `push 0` — BOTH attach calls pass the pair
     VALUE 0 (the pair stores value=arg at [pair+0], obj at [pair+4]). */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424CD0_PAIR_ARG);
}
extern "C" uint32_t isaac_frame_opaque_424cd0_pair0_call_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424CD0_PAIR0_CALL_VA);
}
extern "C" uint32_t isaac_frame_opaque_424cd0_pair1_call_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424CD0_PAIR1_CALL_VA);
}
extern "C" uint32_t isaac_frame_opaque_424cd0_release_receiver_off(void) {
  /* The chains read the pair's OBJECT half: mov ecx,[edi+4] @0x424d10 /
     mov ecx,[esi+4] @0x424d38 — receiver offset 4 inside each pair. */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424CD0_RELEASE_RECEIVER_OFF);
}
extern "C" uint32_t isaac_frame_opaque_424cd0_release_vtbl_slot_off(void) {
  /* mov eax,[ecx]; mov eax,[eax+0xc] — the virtual release slot
     [[obj]+0xc] (the IRREDUCIBLE pattern's slot). */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424CD0_RELEASE_VTBL_SLOT_OFF);
}
extern "C" uint32_t isaac_frame_opaque_424cd0_release_callback_va(void) {
  /* mov eax,[0xc7163c] — the IRREDUCIBLE listener registry global
     (same gate the 0x40c7f0/0x40c4a0 bodies use; stays host). */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424CD0_RELEASE_CALLBACK_VA);
}
extern "C" uint32_t isaac_frame_opaque_424cd0_release_chain_count(void) {
  /* Two inline chains: chain 0 releases the this+8 pair's object
     (0x424d10..0x424d2e), chain 1 the this pair's object
     (0x424d38..0x424d56). */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424CD0_RELEASE_CHAIN_COUNT);
}
extern "C" uint32_t isaac_frame_opaque_424cd0_release_chain_gate(
    uint32_t obj_present, uint32_t release_result, uint32_t callback_present) {
  /* The 3-branch lattice, transcribed WITHOUT the virtual call:
     test obj,obj -> je skip; virtual release; test al,al -> je skip;
     test [0xc7163c], -> je skip; callback(pair). The callback fires
     iff obj != 0 AND release-result != 0 AND callback != 0.
     Byte-gated: byte-width result. */
  uint32_t gate = (obj_present != 0u && release_result != 0u &&
                   callback_present != 0u) ? 1u : 0u;
  return gate & 0xffu;
}
extern "C" uint32_t isaac_frame_opaque_424cd0_chain0_gate_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424CD0_CHAIN0_GATE_VA);
}
extern "C" uint32_t isaac_frame_opaque_424cd0_chain1_gate_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424CD0_CHAIN1_GATE_VA);
}
extern "C" uint32_t isaac_frame_opaque_424cd0_chain0_release_call_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424CD0_CHAIN0_RELEASE_CALL_VA);
}
extern "C" uint32_t isaac_frame_opaque_424cd0_chain1_release_call_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424CD0_CHAIN1_RELEASE_CALL_VA);
}
extern "C" uint32_t isaac_frame_opaque_424cd0_chain0_callback_call_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424CD0_CHAIN0_CALLBACK_CALL_VA);
}
extern "C" uint32_t isaac_frame_opaque_424cd0_chain1_callback_call_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424CD0_CHAIN1_CALLBACK_CALL_VA);
}

/* ---- FUN_00424d70 FLOAT-GATE SEAMS (ABI v57) ----
   PE 0x00424d70..0x00424e55 ret 0x10 (thiscall; plain frame — NO
   SEH/cookie; 68 insns, 1 E8 (0x424de8 -> 0x4248a0 — recorded v55,
   HOST), 1 indirect ([[ecx]+0x20] @0x424e4f), 10 stores; 3 direct
   callers 0x8d24e9/0x8d2541/0x8d26ab, all inside the 0x8d2450 host
   state body (receivers this+0x7dc / this+0x808 / this+0x7dc; the
   0x8d2450 body uses the v33-recorded BSS numerators
   [0xc78dc4]/[0xc78edc] and the 360.0f imm 0x43b40000 — host game
   state). Entry: xmm3 = f1, xmm2 = f2, [ebp+0x10] = f2stack, [ebp+0x14]
   = f3; this float fields +0x10..+0x1c, +0x28 (f28). Four
   ucomiss+lahf+test ah,0x44 ordered-equality gates (f10 vs f28, f14 vs
   f1, f18 vs f2, f1c vs f3): gates 1-3 `jp` to the update path on
   ordered-NOT-equal (equal AND NaN fall through), gate 4 `jnp` to the
   tail on equal OR NaN (ordered-not-equal falls into the update path) —
   net law: the update path runs iff ANY pair is ordered-not-equal; NaN
   NEVER counts as NE (NaN on gates 1-3 falls through without triggering
   the update by itself; NaN on gate 4 skips). Update path:
   cvttss2si(f28) + `add ax,ax` @0x424dde (16-bit doubling of the low
   half only) pushed TWICE + 3 float stack args to FUN_004248a0
   (receiver this+8) + the four float field stores (PE order +0x14,
   +0x18, +0x10, +0x1c). Both paths then run the virtual [[[this+8]]+0x20]
   call with &local-vec2 + arg2. Body stays HOST; the gate law, the
   cvtt/doubling law, the store order and the call geometry are the pure
   scalar seams. */
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_424D70_VA == 0x00424d70u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424D70_END_VA == 0x00424e56u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424D70_CALL_SITES == 3u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424D70_RET_BYTES == 0x10u,
              "424d70 float-gate 0x424d70..0x424e55 ret 0x10, 3 callers");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_424D70_CALLER1_VA == 0x008d24e9u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424D70_CALLER2_VA == 0x008d2541u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424D70_CALLER3_VA == 0x008d26abu,
              "424d70 callers all inside the 0x8d2450 host state body");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_424D70_HOST_4248A0_VA == 0x004248a0u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424D70_CALL_4248A0_VA == 0x00424de8u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424D70_CALL_4248A0_RECEIVER_OFF == 8u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424D70_CALL_4248A0_FLOAT_ARGS == 3u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424D70_CALL_4248A0_INT_DUP_VA == 0x00424ddeu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424D70_CVTT_VA == 0x00424dc8u,
              "424d70 update path: cvttss2si @0x424dc8, add ax,ax @0x424dde, call 0x4248a0 @0x424de8 (ecx=this+8, 2x dup int + 3 float args)");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_424D70_VIRTUAL_RECEIVER_OFF == 8u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424D70_VIRTUAL_VTBL_SLOT_OFF == 0x20u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424D70_VIRTUAL_CALL_VA == 0x00424e4fu,
              "424d70 tail: virtual [[[this+8]]+0x20] @0x424e4f with &local-vec2 + arg2");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_424D70_FIELD_COUNT == 4u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424D70_NO_STORE_BYTE == 0xffu,
              "424d70 4 float field stores + 0xff no-store sentinel");

extern "C" uint32_t isaac_frame_opaque_424d70_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424D70_VA);
}
extern "C" uint32_t isaac_frame_opaque_424d70_end_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424D70_END_VA);
}
extern "C" uint32_t isaac_frame_opaque_424d70_call_sites(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424D70_CALL_SITES);
}
extern "C" uint32_t isaac_frame_opaque_424d70_ret_bytes(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424D70_RET_BYTES);
}
extern "C" uint32_t isaac_frame_opaque_424d70_host_4248a0_va(void) {
  /* The update-path callee FUN_004248a0 (0x4248a0..0x424c32) stays HOST
     (recorded v55; 1 direct caller 0x424de8 — THIS body's call). */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424D70_HOST_4248A0_VA);
}
extern "C" uint32_t isaac_frame_opaque_424d70_call_4248a0_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424D70_CALL_4248A0_VA);
}
extern "C" uint32_t isaac_frame_opaque_424d70_call_4248a0_receiver_off(void) {
  /* @0x424dcf lea ecx,[esi+8] — the 4248a0 receiver is this+8. */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424D70_CALL_4248A0_RECEIVER_OFF);
}
extern "C" uint32_t isaac_frame_opaque_424d70_call_4248a0_float_args(void) {
  /* @0x424dd2/0x424dd8/0x424de1 — xmm4/xmm3/xmm2 stacked at
     [esp+8]/[esp+4]/[esp+0]: the 3 float args (f3, f2, f1). */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424D70_CALL_4248A0_FLOAT_ARGS);
}
extern "C" uint32_t isaac_frame_opaque_424d70_call_4248a0_int_dup_va(void) {
  /* @0x424dde `add ax,ax` — the 16-bit doubling of the cvttss2si
     result; the doubled eax is then pushed TWICE (0x424de6/0x424de7)
     as the two leading int args. */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424D70_CALL_4248A0_INT_DUP_VA);
}
extern "C" uint32_t isaac_frame_opaque_424d70_cvtt_va(void) {
  /* @0x424dc8 `cvttss2si eax,xmm1` — f28 (this->+0x28) to int32,
     truncating; NaN/out-of-range -> 0x80000000 (INT_MIN indefinite). */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424D70_CVTT_VA);
}
extern "C" uint32_t isaac_frame_opaque_424d70_virtual_receiver_off(void) {
  /* @0x424e18 mov ecx,[esi+8] — the virtual call receiver is
     [this+8] (this->+8 as an object pointer). */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424D70_VIRTUAL_RECEIVER_OFF);
}
extern "C" uint32_t isaac_frame_opaque_424d70_virtual_vtbl_slot_off(void) {
  /* @0x424e27 mov eax,[ecx]; @0x424e29 mov edx,[eax+0x20] — the virtual
     slot is [[obj]+0x20]. */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424D70_VIRTUAL_VTBL_SLOT_OFF);
}
extern "C" uint32_t isaac_frame_opaque_424d70_virtual_call_va(void) {
  /* @0x424e4f call edx — fires on BOTH paths with &local-vec2 + arg2. */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424D70_VIRTUAL_CALL_VA);
}
extern "C" uint32_t isaac_frame_opaque_424d70_field_count(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424D70_FIELD_COUNT);
}
extern "C" uint32_t isaac_frame_opaque_424d70_field_store_index(
    uint32_t off) {
  /* PE STORE ORDER of the update-path float field stores
     (@0x424dfa movss [esi+0x14],xmm0 / @0x424e04 [esi+0x18] /
     @0x424e0e [esi+0x10] / @0x424e13 [esi+0x1c]): +0x14, +0x18, +0x10,
     +0x1c — the PE stores +0x10 THIRD, after +0x18. Byte-gated:
     byte-width result, 0xff when the offset has no store. */
  switch (off) {
    case 0x14u: return 0u;
    case 0x18u: return 1u;
    case 0x10u: return 2u;
    case 0x1cu: return 3u;
    default:    return ISAAC_FRAME_OPAQUE_424D70_NO_STORE_BYTE;
  }
}
extern "C" uint32_t isaac_frame_opaque_424d70_needs_update(
    uint32_t f10, uint32_t f28, uint32_t f14, uint32_t f1, uint32_t f18,
    uint32_t f2, uint32_t f1c, uint32_t f3) {
  /* The four ucomiss+lahf+test ah,0x44 ordered-equality gates, bit-level:
     gate k is "ordered-not-equal" iff NEITHER operand is NaN AND the
     f32 values differ (ucomiss +0/-0 compare EQUAL). The PE net law:
     update path iff ANY gate is NE — gates 1-3 `jp` (jp taken exactly
     on ordered-not-equal; equal AND NaN fall through), gate 4 `jnp`
     (equal OR NaN skips; NE falls into the update). NaN NEVER counts
     as NE. Byte-gated: byte-width result. */
  auto ne = [](uint32_t a, uint32_t b) -> bool {
    if ((a & 0x7fffffffu) > 0x7f800000u) return false;
    if ((b & 0x7fffffffu) > 0x7f800000u) return false;
    if (a == b) return false;
    if ((a == 0u && b == 0x80000000u) || (a == 0x80000000u && b == 0u)) {
      return false;
    }
    return true;
  };
  uint32_t r = (ne(f10, f28) || ne(f14, f1) || ne(f18, f2) || ne(f1c, f3))
                   ? 1u
                   : 0u;
  return r & 0xffu;
}
extern "C" uint32_t isaac_frame_opaque_424d70_doubled_arg(uint32_t f28_bits) {
  /* `cvttss2si eax,xmm1` @0x424dc8 then `add ax,ax` @0x424dde, bit-level:
     cvttss2si = trunc-toward-zero to int32; NaN/Inf/|v| >= 2^31 (incl.
     exactly -2^31, which yields the same indefinite) -> 0x80000000.
     The 16-bit `add ax,ax` doubles ONLY the low half with 16-bit wrap;
     the high 16 bits pass through UNCHANGED. This eax is pushed twice
     (0x424de6/0x424de7) as the two leading int args of FUN_004248a0. */
  const uint32_t bits = f28_bits;
  const uint32_t sign = bits >> 31u;
  const uint32_t exp = (bits >> 23u) & 0xffu;
  const uint32_t mant = bits & 0x7fffffu;
  uint32_t v;
  if (exp == 0xffu) {
    v = 0x80000000u;  /* NaN / +/-Inf -> INT_MIN indefinite */
  } else if (exp == 0u && mant == 0u) {
    v = 0u;  /* +/-0 -> 0 */
  } else if (exp < 127u) {
    v = 0u;  /* |value| < 1 -> trunc 0 (subnormals included) */
  } else if (exp >= 158u) {
    v = 0x80000000u;  /* |value| >= 2^31 (out of int32 range) */
  } else {
    const uint32_t full = (1u << 23u) | mant;
    const uint32_t shift = exp - 127u;  /* 0..30 */
    uint32_t iv = (shift >= 23u) ? (full << (shift - 23u))
                                 : (full >> (23u - shift));
    if (sign != 0u) iv = (uint32_t)(0u - iv);  /* negate (iv != 0) */
    v = iv;
  }
  const uint32_t low = ((v & 0xffffu) << 1u) & 0xffffu;  /* add ax,ax */
  return (v & 0xffff0000u) | low;
}

/* ---- FUN_00424e60 indexed dword getter (ABI v58) ----
   PE 0x00424e60..0x00424e70 `ret 4` (thiscall this=ecx, 1 stack arg;
   PLAIN frame — NO SEH/cookie; 7 insns, 0 E8, 0 indirect, 0 stores).
   Body: mov eax,[ebp+8] (index, FULL dword no movzx); mov eax,
   [ecx+eax*4+0x2bc] @0x424e66 (scale-index eax*4 + disp32 0x2bc,
   both 32-bit wrap); ret 4. 2 direct rel32 callers 0x0066158c
   (`push 0x14` — index 20) / 0x00661b9b (`push 0x73` — index 115),
   both inside a big host state body (receiver [esi+0x548]; the value
   feeds `xor edx,edx; mov ecx,0x3e8; div ecx` = % 1000 + threshold
   compares 2/0xe/0x21/0x44/0x3e7 — awards/achievement logic). The
   read VALUE is game state (host); the pure seam is the ADDRESS
   geometry. */
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_424E60_VA == 0x00424e60u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424E60_END_VA == 0x00424e71u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424E60_CALL_SITES == 2u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424E60_RET_BYTES == 4u,
              "424e60 getter 0x424e60..0x424e70 ret 4, 2 callers");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_424E60_CALLER1_VA == 0x0066158cu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424E60_CALLER2_VA == 0x00661b9bu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424E60_ARRAY_BASE_OFF == 0x2bcu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424E60_ELEMENT_STRIDE == 4u,
              "424e60 callers + 0x2bc base + dword stride");

extern "C" uint32_t isaac_frame_opaque_424e60_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424E60_VA);
}
extern "C" uint32_t isaac_frame_opaque_424e60_end_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424E60_END_VA);
}
extern "C" uint32_t isaac_frame_opaque_424e60_call_sites(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424E60_CALL_SITES);
}
extern "C" uint32_t isaac_frame_opaque_424e60_caller1_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424E60_CALLER1_VA);
}
extern "C" uint32_t isaac_frame_opaque_424e60_caller2_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424E60_CALLER2_VA);
}
extern "C" uint32_t isaac_frame_opaque_424e60_ret_bytes(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424E60_RET_BYTES);
}
extern "C" uint32_t isaac_frame_opaque_424e60_array_base_off(void) {
  /* @0x424e66 `mov eax,[ecx+eax*4+0x2bc]` — the disp32 0x2bc: the
     dword array this->+0x2bc the getter indexes. */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424E60_ARRAY_BASE_OFF);
}
extern "C" uint32_t isaac_frame_opaque_424e60_element_stride(void) {
  /* The eax*4 scale — dword elements. */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424E60_ELEMENT_STRIDE);
}
extern "C" uint32_t isaac_frame_opaque_424e60_element_off(uint32_t index) {
  /* PE @0x424e66 scale-index: offset-from-this = 0x2bc + index*4 with
     32-bit wrap on BOTH the eax*4 scale and the +0x2bc add (index
     0x40000000 -> 0x2bc). FULL dword result (not byte-gated). */
  return index * 4u + 0x2bcu;
}

/* ---- FUN_00424e80 string-teardown dtor GEOMETRY (ABI v58) ----
   PE 0x00424e80..0x00424ee3 ret (thiscall this=ecx; SEH filter
   0xaf09f0 @0x424e85, GS cookie [0xbf93b4] @0x424e93; 46 insns, 5
   E8, 0 indirect, 3 scratch stores). Body: lea esi,[ecx+4]; mov
   ecx,esi; call 0x407f10 (@0x424eb0 — this+4 first string); lea
   ecx,[esi+0x50]; call 0x4087a0 (@0x424eb8 — this+0x54); lea ecx,
   [esi+0x30]; call 0x4087a0 (@0x424ec0 — this+0x34); lea ecx,
   [esi+0x18]; call 0x40d040 (@0x424ec8 — this+0x1c); mov ecx,esi;
   call 0x40d040 (@0x424ecf — this+4 SECOND pass: the same offset is
   torn down twice, 0x407f10 then 0x40d040). CENSUS: ZERO direct
   rel32 callers AND zero dword data refs (binary scan for LE
   80 4e 42 00: NONE) — runtime dispatch or dead; the 0 is the pin.
   Callees stay HOST: 0x40d040 = the v26 string tidy
   (ISAAC_FRAME_OPAQUE_40D040_VA, 1321 callers); 0x407f10/0x4087a0 =
   the v57 0x83c4xx-dtor teardown block (both NEW pins). */
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_424E80_VA == 0x00424e80u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424E80_END_VA == 0x00424ee4u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424E80_CALL_SITES == 0u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424E80_DTOR_COUNT == 5u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424E80_NO_DTOR_BYTE == 0xffu,
              "424e80 dtor 0x424e80..0x424ee3, 0 direct callers, 5 teardowns");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_424E80_SEH_HANDLER_VA == 0x00af09f0u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424E80_COOKIE_VA == 0x00bf93b4u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424E80_HOST_407F10_VA == 0x00407f10u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424E80_HOST_4087A0_VA == 0x004087a0u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424E80_HOST_40D040_VA == 0x0040d040u,
              "424e80 SEH/cookie + the three teardown callees (all HOST)");

extern "C" uint32_t isaac_frame_opaque_424e80_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424E80_VA);
}
extern "C" uint32_t isaac_frame_opaque_424e80_end_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424E80_END_VA);
}
extern "C" uint32_t isaac_frame_opaque_424e80_call_sites(void) {
  /* Census: zero direct rel32 callers AND zero dword data refs. */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424E80_CALL_SITES);
}
extern "C" uint32_t isaac_frame_opaque_424e80_seh_handler_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424E80_SEH_HANDLER_VA);
}
extern "C" uint32_t isaac_frame_opaque_424e80_cookie_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424E80_COOKIE_VA);
}
extern "C" uint32_t isaac_frame_opaque_424e80_dtor_count(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424E80_DTOR_COUNT);
}
extern "C" uint32_t isaac_frame_opaque_424e80_host_407f10_va(void) {
  /* The v57 0x83c4xx-dtor teardown block callees, recorded HOST here:
     0x407f10 (first string pass of this+4) — NEW family pin. */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424E80_HOST_407F10_VA);
}
extern "C" uint32_t isaac_frame_opaque_424e80_host_4087a0_va(void) {
  /* 0x4087a0 (string teardown of this+0x54 and this+0x34) — NEW
     family pin. */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424E80_HOST_4087A0_VA);
}
extern "C" uint32_t isaac_frame_opaque_424e80_host_40d040_va(void) {
  /* 0x40d040 (string tidy of this+0x1c and the this+4 SECOND pass) —
     the v26-recorded HOST leaf (1321 callers). */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424E80_HOST_40D040_VA);
}
extern "C" uint32_t isaac_frame_opaque_424e80_dtor_callee_va(
    uint32_t index) {
  /* PE teardown callee per index 0..4 (off table: 4 -> 0x407f10,
     0x54 -> 0x4087a0, 0x34 -> 0x4087a0, 0x1c -> 0x40d040, 4 ->
     0x40d040 second pass); 0 for invalid index. */
  switch (index) {
    case 0u:  return 0x00407f10u;
    case 1u: case 2u: return 0x004087a0u;
    case 3u: case 4u: return 0x0040d040u;
    default:  return 0u;
  }
}
extern "C" uint32_t isaac_frame_opaque_424e80_dtor_receiver_off(
    uint32_t index) {
  /* Byte-gated receiver offsets (PE order): 4, 0x54, 0x34, 0x1c, 4;
     NO_DTOR_BYTE (0xff) for invalid index. */
  switch (index) {
    case 0u:  return 4u;
    case 1u:  return 0x54u;
    case 2u:  return 0x34u;
    case 3u:  return 0x1cu;
    case 4u:  return 4u;
    default:  return ISAAC_FRAME_OPAQUE_424E80_NO_DTOR_BYTE;
  }
}
extern "C" uint32_t isaac_frame_opaque_424e80_dtor_call_va(
    uint32_t index) {
  /* The five call sites (PE order): 0x424eb0 / 0x424eb8 / 0x424ec0 /
     0x424ec8 / 0x424ecf; 0 for invalid index. */
  switch (index) {
    case 0u:  return 0x00424eb0u;
    case 1u:  return 0x00424eb8u;
    case 2u:  return 0x00424ec0u;
    case 3u:  return 0x00424ec8u;
    case 4u:  return 0x00424ecfu;
    default:  return 0u;
  }
}
extern "C" uint32_t isaac_frame_opaque_424e80_dtor_index(uint32_t off) {
  /* FIRST-match teardown index for a receiver offset: 4 -> 0 (the
     0x407f10 string pass — the SECOND +4 pass is recovered via
     dtor_receiver_off(4) + dtor_callee_va(4) = 0x40d040); 0x54 -> 1;
     0x34 -> 2; 0x1c -> 3; NO_DTOR_BYTE (0xff) otherwise. Byte-gated. */
  switch (off) {
    case 4u:    return 0u;
    case 0x54u: return 1u;
    case 0x34u: return 2u;
    case 0x1cu: return 3u;
    default:    return ISAAC_FRAME_OPAQUE_424E80_NO_DTOR_BYTE;
  }
}

/* ---- FUN_00424ef0 attach-loop SIGNED GATE (ABI v58) ----
   PE 0x00424ef0..0x0042512b `ret 4` (thiscall this=ecx + 1 stack
   arg; SEH filter 0xaf19c5 @0x424f08, GS cookie [0xbf93b4]; 178
   insns, 10 E8 + 1 indirect IAT (0xb18894) + 30 stores; 2 direct
   rel32 callers 0x009480d4 / 0x009b58b5). Body stays HOST (2x raw
   alloc 0x40cf00 + string assembly 0x40bd50/0x40bf30/0x40c000 +
   inline strcmp vs literal 0xb1bc54 + 0x40a5d0/0x40a1b0 + [this+
   0x118]=0). Pure seam: the 12-iteration attach loop gate
   @0x425083..0x425086 (`cmp esi,0xc` / `jl 0x424ff5`) — the loop
   re-runs the 0x40bf30 attach (@0x425042) while SIGNED iter < 12.
   wasm32 compare-flip class: em++ compiles int32-cast signed
   compares as UNSIGNED on wasm32, so 0xffffffff (= -1, continue)
   would flip to stop; the explicit (int64_t)(int32_t) sign-extend
   form keeps the comparison signed (precedent: hud 770a7e_open /
   770915_tail_gate). */
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_424EF0_VA == 0x00424ef0u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424EF0_END_VA == 0x0042512cu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424EF0_CALL_SITES == 2u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424EF0_RET_BYTES == 4u,
              "424ef0 ctor 0x424ef0..0x42512b ret 4, 2 callers");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_424EF0_CALLER1_VA == 0x009480d4u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424EF0_CALLER2_VA == 0x009b58b5u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424EF0_SEH_HANDLER_VA == 0x00af19c5u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424EF0_COOKIE_VA == 0x00bf93b4u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424EF0_ATTACH_LOOP_CONTINUE_VA == 0x00425086u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424EF0_ATTACH_CALL_VA == 0x00425042u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424EF0_ATTACH_COUNT == 0xcu,
              "424ef0 SEH/cookie + the 12-iter attach loop 0x425042..0x425086");

extern "C" uint32_t isaac_frame_opaque_424ef0_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424EF0_VA);
}
extern "C" uint32_t isaac_frame_opaque_424ef0_end_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424EF0_END_VA);
}
extern "C" uint32_t isaac_frame_opaque_424ef0_call_sites(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424EF0_CALL_SITES);
}
extern "C" uint32_t isaac_frame_opaque_424ef0_caller1_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424EF0_CALLER1_VA);
}
extern "C" uint32_t isaac_frame_opaque_424ef0_caller2_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424EF0_CALLER2_VA);
}
extern "C" uint32_t isaac_frame_opaque_424ef0_ret_bytes(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424EF0_RET_BYTES);
}
extern "C" uint32_t isaac_frame_opaque_424ef0_seh_handler_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424EF0_SEH_HANDLER_VA);
}
extern "C" uint32_t isaac_frame_opaque_424ef0_cookie_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424EF0_COOKIE_VA);
}
extern "C" uint32_t isaac_frame_opaque_424ef0_attach_loop_continue_va(void) {
  /* @0x425086 `jl 0x424ff5` — the SIGNED loop-continue branch itself. */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424EF0_ATTACH_LOOP_CONTINUE_VA);
}
extern "C" uint32_t isaac_frame_opaque_424ef0_attach_call_va(void) {
  /* @0x425042 `call 0x40bf30` — the attach re-run gated by the loop. */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424EF0_ATTACH_CALL_VA);
}
extern "C" uint32_t isaac_frame_opaque_424ef0_attach_count(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424EF0_ATTACH_COUNT);
}
extern "C" int32_t isaac_frame_opaque_424ef0_attach_loop_continue(
    uint32_t iter) {
  /* PE @0x425083 cmp esi,0xc; @0x425086 jl 0x424ff5 — the attach
     loop re-runs 0x40bf30 iff SIGNED (int32)iter < 12. i64
     sign-extend form (wasm32 compare-flip class): 0xffffffff = -1
     CONTINUES; 12 stops. Byte-gated. */
  return ((int64_t)(int32_t)iter < (int64_t)12) ? 1 : 0;
}

/* ---- FUN_00425130 CompletionWidget::Update pure seams (ABI v59) ----
   PE 0x00425130..0x004252e5 plain ret x2 (thiscall this=ecx, no
   stack args; GS cookie [0xbf93b4] @0x425136; NO SEH; 116 insns,
   4 E8: 2x 0x409030 AdvancePosition pair (this+0x34 @0x4251b1 /
   this+0x54 @0x4251b9), 0x40a7e0 ANM2::SetLayerFrame loop call
   @0x425293 (family pin REUSED: ISAAC_FRAME_OPAQUE_423CC0_HOST_
   LAYER_ASSIGN_VA) + 2x cookie check 0xaef12b; 2 window-verified
   direct rel32 callers 0x0094de41 / 0x009b68fb). Body stays HOST
   (SetLayerFrame x12 stores the layer frames). Pure seams: the
   409030 pair gate (mgr byte bit0 + this byte 0x10d), the THREE
   mode compares (UNSIGNED ja 0x28 @0x4251e3 early exit; SIGNED
   jge 0x29 @0x425215 index fallback and SIGNED jl 0x15 @0x425289
   +5 gate — wasm32 compare-flip class, i64 sign-extend form), the
   12-lane constant tables (rdata 0xbab240/0xbab510/0xbab280/
   0xbab3c0/0xbab4a0), the index/address geometry (0xc35ed0 per-
   mode table + the 0x2bc lane array, u32 wraps), the score
   transform (LOW-BYTE bit tests on v; FULL-dword lane2 zero test)
   and the [this+0x118] counter law. */
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_425130_VA == 0x00425130u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425130_END_VA == 0x004252e6u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425130_CALL_SITES == 2u,
              "425130 CompletionWidget::Update 0x425130..0x4252e5, 2 callers");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_425130_CALLER1_VA == 0x0094de41u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425130_CALLER2_VA == 0x009b68fbu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425130_COOKIE_VA == 0x00bf93b4u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425130_PAIR_CALL1_VA == 0x004251b1u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425130_PAIR_CALL2_VA == 0x004251b9u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425130_SET_LAYER_VA == 0x00425293u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425130_EARLY_EXIT_VA == 0x004252bfu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425130_FALLBACK_LOOP_VA == 0x004252c1u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425130_FALLBACK_COUNT == 0xcu,
              "425130 callers/cookie + pair/SetLayer/early-exit seams");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_425130_MGR_FLAG_OFF == 0x4abbcu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425130_MGR_FLAG_BIT == 1u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425130_BYTE_10D_OFF == 0x10du &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425130_COUNTER_OFF == 0x118u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425130_MP_BEGIN_OFF == 0x4b3d8u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425130_MP_END_OFF == 0x4b3dcu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425130_MP_BASE_NONEMPTY_OFF == 0x4b434u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425130_MP_BASE_EMPTY_OFF == 0x14u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425130_ELEM_ARRAY_OFF == 0x2bcu,
              "425130 manager/this offsets");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_425130_MODE_TABLE_VA == 0x00c35ed0u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425130_MODE_TABLE_STRIDE == 0x90u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425130_LANE_COUNT == 0xcu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425130_VEC_A_VA == 0x00bab240u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425130_VEC_B_VA == 0x00bab510u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425130_VEC_C_VA == 0x00bab280u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425130_VEC_D_VA == 0x00bab3c0u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425130_VEC_E_VA == 0x00bab4a0u,
              "425130 mode table + rdata vec constants");

namespace {

constexpr uint32_t kFrameOpaque425130Lane1[12] = {
    0u, 1u, 2u, 3u, 4u, 5u, 6u, 7u, 9u, 12u, 13u, 14u};
constexpr uint32_t kFrameOpaque425130Lane2[12] = {
    1u, 2u, 3u, 4u, 5u, 6u, 7u, 8u, 9u, 0u, 10u, 11u};

}  // namespace

extern "C" uint32_t isaac_frame_opaque_425130_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425130_VA);
}
extern "C" uint32_t isaac_frame_opaque_425130_end_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425130_END_VA);
}
extern "C" uint32_t isaac_frame_opaque_425130_call_sites(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425130_CALL_SITES);
}
extern "C" uint32_t isaac_frame_opaque_425130_caller1_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425130_CALLER1_VA);
}
extern "C" uint32_t isaac_frame_opaque_425130_caller2_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425130_CALLER2_VA);
}
extern "C" uint32_t isaac_frame_opaque_425130_cookie_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425130_COOKIE_VA);
}
extern "C" uint32_t isaac_frame_opaque_425130_pair_call1_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425130_PAIR_CALL1_VA);
}
extern "C" uint32_t isaac_frame_opaque_425130_pair_call2_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425130_PAIR_CALL2_VA);
}
extern "C" uint32_t isaac_frame_opaque_425130_set_layer_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425130_SET_LAYER_VA);
}
extern "C" uint32_t isaac_frame_opaque_425130_early_exit_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425130_EARLY_EXIT_VA);
}
extern "C" uint32_t isaac_frame_opaque_425130_fallback_loop_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425130_FALLBACK_LOOP_VA);
}
extern "C" uint32_t isaac_frame_opaque_425130_fallback_count(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425130_FALLBACK_COUNT);
}
extern "C" uint32_t isaac_frame_opaque_425130_mgr_flag_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425130_MGR_FLAG_OFF);
}
extern "C" uint32_t isaac_frame_opaque_425130_mgr_flag_bit(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425130_MGR_FLAG_BIT);
}
extern "C" uint32_t isaac_frame_opaque_425130_byte_10d_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425130_BYTE_10D_OFF);
}
extern "C" uint32_t isaac_frame_opaque_425130_counter_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425130_COUNTER_OFF);
}
extern "C" uint32_t isaac_frame_opaque_425130_mp_begin_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425130_MP_BEGIN_OFF);
}
extern "C" uint32_t isaac_frame_opaque_425130_mp_end_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425130_MP_END_OFF);
}
extern "C" uint32_t isaac_frame_opaque_425130_mp_base_nonempty_off(void) {
  return static_cast<uint32_t>(
      ISAAC_FRAME_OPAQUE_425130_MP_BASE_NONEMPTY_OFF);
}
extern "C" uint32_t isaac_frame_opaque_425130_mp_base_empty_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425130_MP_BASE_EMPTY_OFF);
}
extern "C" uint32_t isaac_frame_opaque_425130_elem_array_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425130_ELEM_ARRAY_OFF);
}
extern "C" uint32_t isaac_frame_opaque_425130_mode_table_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425130_MODE_TABLE_VA);
}
extern "C" uint32_t isaac_frame_opaque_425130_mode_table_stride(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425130_MODE_TABLE_STRIDE);
}
extern "C" uint32_t isaac_frame_opaque_425130_lane_count(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425130_LANE_COUNT);
}
extern "C" uint32_t isaac_frame_opaque_425130_vec_a_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425130_VEC_A_VA);
}
extern "C" uint32_t isaac_frame_opaque_425130_vec_b_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425130_VEC_B_VA);
}
extern "C" uint32_t isaac_frame_opaque_425130_vec_c_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425130_VEC_C_VA);
}
extern "C" uint32_t isaac_frame_opaque_425130_vec_d_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425130_VEC_D_VA);
}
extern "C" uint32_t isaac_frame_opaque_425130_vec_e_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425130_VEC_E_VA);
}
extern "C" int32_t isaac_frame_opaque_425130_pair_gate(uint32_t mgr_flag_byte,
                                                        uint32_t byte_10d) {
  /* PE @0x425182 `test byte ptr [ecx+0x4abbc],1; jne skip` and
     @0x4251a5 `cmp byte ptr [edi+0x10d],0; je skip` — the 409030
     pair runs iff the manager flag bit0 is CLEAR and the this
     byte 0x10d is NON-ZERO. Byte-gate discipline: `& 0xffu`
     everywhere (NO uint8_t) — the 0x10d zero test is a byte
     compare, so 0x100 must answer 0. */
  if (((mgr_flag_byte & 0xffu) & 1u) != 0u) {
    return 0;
  }
  if ((byte_10d & 0xffu) == 0u) {
    return 0;
  }
  return 1;
}
extern "C" int32_t isaac_frame_opaque_425130_mode_gt_0x28(uint32_t mode) {
  /* PE @0x4251e3 `cmp [edi],0x28; ja 0x4252bf` — UNSIGNED: the
     whole-body early exit when mode > 0x28 (0xffffffff exits to
     the fallback loop). */
  return (mode > 0x28u) ? 1 : 0;
}
extern "C" int32_t isaac_frame_opaque_425130_mode_ge_0x29(uint32_t mode) {
  /* PE @0x425215 `cmp edx,0x29; jge 0x42522e` — SIGNED: the per-
     lane index-0 fallback when mode >= 0x29. wasm32 compare-flip
     class: em++ compiles int32-cast signed compares as UNSIGNED
     on wasm32, so 0xffffffff (= -1) would flip to 1; the explicit
     (int64_t)(int32_t) sign-extend keeps the comparison signed
     (precedent: v58 424ef0 attach_loop_continue, hud 770a7e_open /
     770915_tail_gate). */
  return ((int64_t)(int32_t)mode >= (int64_t)0x29) ? 1 : 0;
}
extern "C" int32_t isaac_frame_opaque_425130_mode_lt_0x15(uint32_t mode) {
  /* PE @0x425289 `cmp edx,0x15; jl 0x42528e` — SIGNED: the +5 is
     skipped when mode < 0x15. wasm32 compare-flip class, i64
     sign-extend form (0xffffffff = -1 -> 1). */
  return ((int64_t)(int32_t)mode < (int64_t)0x15) ? 1 : 0;
}
extern "C" uint32_t isaac_frame_opaque_425130_lane1(uint32_t index) {
  /* The 12 dwords read at [ebp+esi-0x64] (esi = index*4): vec A
     (0xbab240) lanes 0..3 splatted with the loop offset (0 then 4,
     stores @0x42515d), then vec B (0xbab510) lanes 0..3 (store
     @0x425177). Out-of-range -> 0. */
  if (index >= 12u) {
    return 0u;
  }
  return kFrameOpaque425130Lane1[index];
}
extern "C" uint32_t isaac_frame_opaque_425130_lane2(uint32_t index) {
  /* The 12 dwords read at [ebp+esi-0x34]: vec C (0xbab280),
     vec D (0xbab3c0), vec E (0xbab4a0) lane groups (stores
     @0x425189/0x425194/0x42519f). Out-of-range -> 0. */
  if (index >= 12u) {
    return 0u;
  }
  return kFrameOpaque425130Lane2[index];
}
extern "C" uint32_t isaac_frame_opaque_425130_elem_base_off(
    uint32_t mp_nonempty) {
  /* PE @0x4251f7..0x425205: the 0x2bc lane-array base is
     manager+0x4b434 when the mp dword vec (begin [mgr+0x4b3d8] !=
     end [mgr+0x4b3dc]) is non-empty, else manager+0x14 (lea
     [ecx+0x14]). */
  if (mp_nonempty != 0u) {
    return static_cast<uint32_t>(
        ISAAC_FRAME_OPAQUE_425130_MP_BASE_NONEMPTY_OFF);
  }
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425130_MP_BASE_EMPTY_OFF);
}
extern "C" uint32_t isaac_frame_opaque_425130_elem_off(uint32_t index) {
  /* PE @0x425238 `mov ebx,[eax+ebx*4+0x2bc]` — dword array offset
     from the elected base; 32-bit wrap on index*4 (mirror of the
     v58 424e60 element_off law). */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425130_ELEM_ARRAY_OFF) +
         index * 4u;
}
extern "C" uint32_t isaac_frame_opaque_425130_table_elem_off(uint32_t mode,
                                                              uint32_t lane) {
  /* PE @0x425217..0x425229: lea [edx+edx*8]; shl 4 (mode*144, u32
     wrap); add 0xc35ed0; then mov [ecx+eax*8] (lane*8, u32 wrap)
     — the ADDRESS of the per-mode record dword (the read itself is
     game data -> host). The add-zero je @0x425223 (table ptr == 0)
     is algebraically unreachable for u32 mode (mode*144 ==
     -0xc35ed0 mod 2^32 has no solution); NOT modeled. */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425130_MODE_TABLE_VA) +
         mode * static_cast<uint32_t>(
                    ISAAC_FRAME_OPAQUE_425130_MODE_TABLE_STRIDE) +
         lane * 8u;
}
extern "C" uint32_t isaac_frame_opaque_425130_score_base(uint32_t v) {
  /* PE @0x42523f..0x425247: `and eax,1` (FULL-dword bit0) then
     `test bl,2; cmovne eax,ecx` — LOW-BYTE bit1 gate picks 2. */
  if (((v & 0xffu) & 2u) != 0u) {
    return 2u;
  }
  return v & 1u;
}
extern "C" uint32_t isaac_frame_opaque_425130_score_adj(uint32_t v,
                                                         uint32_t mp_nonempty) {
  /* PE @0x42524a..0x42527c: when the mp vec is EMPTY and the base
     != 0, the 0x425254 jne KEEPS the base (the bit4/bit8 chain is
     skipped entirely); otherwise bit8 @0x42526a..0x425277 wins
     over bit4 @0x425256..0x425263, and the 3/1 (bit4) and 4/2
     (bit8) split is the `setne al` of the SNAPSHOTTED begin/end
     (nonempty -> 3/4, empty -> 1/2). LOW-BYTE gates on v. */
  const uint32_t base = isaac_frame_opaque_425130_score_base(v);
  if (mp_nonempty == 0u && base != 0u) {
    return base;
  }
  if (((v & 0xffu) & 8u) != 0u) {
    return mp_nonempty != 0u ? 4u : 2u;
  }
  if (((v & 0xffu) & 4u) != 0u) {
    return mp_nonempty != 0u ? 3u : 1u;
  }
  return base;
}
extern "C" uint32_t isaac_frame_opaque_425130_score_final(uint32_t score,
                                                           uint32_t lane2,
                                                           uint32_t mode) {
  /* PE @0x42527e..0x42528b: `test ecx,ecx; jne skip` — FULL-dword
     lane2 zero test; `cmp edx,0x15; jl skip` — SIGNED mode < 0x15
     skips the +5 (wasm32 compare-flip class, i64 sign-extend). */
  if (lane2 == 0u && !isaac_frame_opaque_425130_mode_lt_0x15(mode)) {
    return score + 5u;
  }
  return score;
}
extern "C" int32_t isaac_frame_opaque_425130_counter_inc(uint32_t v) {
  /* PE @0x425298 `test ebx,ebx; je skip` then `inc dword ptr
     [edi+0x118]` — FULL-dword v test. */
  return (v != 0u) ? 1 : 0;
}

/* ---- FUN_004252f0 CompletionWidget::Render pure seams (ABI v60) ----
   PE 0x004252f0..0x425357 `ret 8` @0x425357 (thiscall this=ecx,
   arg1 Vector* [ebp+8], arg2 Vector* [ebp+0xc]; plain prologue
   push ebp/mov ebp,esp; NO GS cookie, NO SEH; 32 insns, 3 E8 all
   0x40a030 AnimationState::Render (host, ret 0xc — pin REUSED:
   HOST_40A030_VA; overlay-clamp Vector& 0xc7b640 x2 — pin REUSED:
   421400_RENDER_ARG_VA; render-shell owns the 40a030 pure CF).
   2 window-verified direct rel32 callers 0x0094ae79 (Awards band,
   this=[edi+0x490]) / 0x009b7451 (this=[esi+0xe90]). Body stays
   HOST: the only stores are the pair-copy dwords and the render
   side-effects are the host leaves; the pure seams are the copy
   geometry + the two byte gates. */
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4252F0_VA == 0x004252f0u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4252F0_END_VA == 0x0042535au &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4252F0_RET_BYTES == 8u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4252F0_CALL_SITES == 2u,
              "4252f0 CompletionWidget::Render 0x4252f0..0x425357, ret 8, 2 callers");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4252F0_CALLER1_VA == 0x0094ae79u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4252F0_CALLER2_VA == 0x009b7451u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4252F0_PAIR_X_OFF == 0xa0u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4252F0_PAIR_Y_OFF == 0xa4u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4252F0_GATE_OFF == 0x10du &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4252F0_ORDER_OFF == 0x74u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4252F0_SUB0_OFF == 0x34u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4252F0_SUB1_OFF == 0x54u,
              "4252f0 callers + pair/gate/order offsets");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4252F0_FIRST0_CALL_VA == 0x0042533bu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4252F0_FIRST1_CALL_VA == 0x00425330u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4252F0_SECOND_CALL_VA == 0x0042534du,
              "4252f0 render call-site seams");

extern "C" uint32_t isaac_frame_opaque_4252f0_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4252F0_VA);
}
extern "C" uint32_t isaac_frame_opaque_4252f0_end_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4252F0_END_VA);
}
extern "C" uint32_t isaac_frame_opaque_4252f0_ret_bytes(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4252F0_RET_BYTES);
}
extern "C" uint32_t isaac_frame_opaque_4252f0_call_sites(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4252F0_CALL_SITES);
}
extern "C" uint32_t isaac_frame_opaque_4252f0_caller1_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4252F0_CALLER1_VA);
}
extern "C" uint32_t isaac_frame_opaque_4252f0_caller2_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4252F0_CALLER2_VA);
}
extern "C" uint32_t isaac_frame_opaque_4252f0_pair_x_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4252F0_PAIR_X_OFF);
}
extern "C" uint32_t isaac_frame_opaque_4252f0_pair_y_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4252F0_PAIR_Y_OFF);
}
extern "C" uint32_t isaac_frame_opaque_4252f0_gate_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4252F0_GATE_OFF);
}
extern "C" uint32_t isaac_frame_opaque_4252f0_order_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4252F0_ORDER_OFF);
}
extern "C" uint32_t isaac_frame_opaque_4252f0_sub0_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4252F0_SUB0_OFF);
}
extern "C" uint32_t isaac_frame_opaque_4252f0_sub1_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4252F0_SUB1_OFF);
}
extern "C" uint32_t isaac_frame_opaque_4252f0_first0_call_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4252F0_FIRST0_CALL_VA);
}
extern "C" uint32_t isaac_frame_opaque_4252f0_first1_call_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4252F0_FIRST1_CALL_VA);
}
extern "C" uint32_t isaac_frame_opaque_4252f0_second_call_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4252F0_SECOND_CALL_VA);
}
extern "C" int32_t isaac_frame_opaque_4252f0_render_gate(uint32_t byte_10d) {
  /* PE @0x42530b `cmp byte ptr [ecx+0x10d],0; je 0x425352` — a
     LOW-BYTE compare: the renders run iff the low byte is non-zero
     (0x100 must answer 0). Byte-gate discipline: & 0xffu on a
     uint32 arg (NO uint8_t). */
  return ((byte_10d & 0xffu) != 0u) ? 1 : 0;
}
extern "C" int32_t isaac_frame_opaque_4252f0_render_order(uint32_t byte_74) {
  /* PE @0x425314 `cmp byte ptr [ecx+0x74],0; je 0x425339` — the
     LOW-BYTE order select: low byte 0 -> this+0x34 renders FIRST
     (order 0), non-zero -> this+0x54 first (order 1). */
  return ((byte_74 & 0xffu) == 0u) ? 0 : 1;
}
extern "C" uint32_t isaac_frame_opaque_4252f0_pair_dest_off(uint32_t index) {
  /* PE @0x4252fc `mov [ecx+0xa0],eax` (from [arg2]) and @0x425305
     `mov [ecx+0xa4],eax` (from [arg2+4]) — the UNCONDITIONAL pair
     copy (runs before the gate). Destination dword offsets; out of
     range -> 0. */
  switch (index) {
    case 0u: return static_cast<uint32_t>(
        ISAAC_FRAME_OPAQUE_4252F0_PAIR_X_OFF);
    case 1u: return static_cast<uint32_t>(
        ISAAC_FRAME_OPAQUE_4252F0_PAIR_Y_OFF);
    default: return 0u;
  }
}

/* ---- FUN_00425360 array element default ctor + init-store table
        (ABI v61) ----
   PE 0x00425360..0x4253a6 ret (thiscall this=ecx, NO stack args;
   straight-line, NO branch, NO E8, NO indirect, NO SEH, NO GS
   cookie; 12 insns). 10 mem stores (9 FULL-dword `c7` + ONE 16-bit
   `66 c7`): [ecx+0x00]=0 @0x425360, [ecx+0x10]=0 @0x425368,
   [ecx+0x14]=0xf @0x42536f, [ecx+0x18]=0x16 @0x425376, word
   [ecx+0x1c]=0x101 @0x42537d, [ecx+0x20..0x30]=0 @0x425383..0x42539f;
   `mov eax,ecx` @0x425366 (returns this); ret c3 @0x4253a6. END
   0x004253a7 (the v59/v60 0x4253a6-vs-0x4253a7 discrepancy resolved:
   the ret IS at 0x4253a6); 9-byte int3 pad 0x4253a7..0x4253af; next
   body 0x4253b0 (v42 char getter). REACHABILITY (refines the v59/v60
   "DEAD/runtime-only" label): 0 direct rel32 E8 callers (both
   scanners) but ONE dword function-pointer cookie in the whole image
   — `push 0x00425360` @0x006f174c inside the big enclosing 0x6f17xx
   ctor (EH states 0x13/0x14), feeding the __ehvec-style array
   dispatcher 0xaef5c4 (HOST; loop `call dword ptr [ebp+0x14]`
   @0xaef5ec; ret 0x14). FUN_00425360 is the ELEMENT DEFAULT CTOR of
   the 21-element/0x34-stride object array at this+0xc (count 0x15,
   stride 0x34; dtor cookie 0x425410 = the v43 425430_INIT_COOKIE pin
   REUSED) — the SAME geometry as the v43 0x425430 copy-ctor and the
   v44 FINAL_BYTE_OFF 0x450. The body is PURE (no calls, no loads);
   the init-store table + return-this are the laws. */
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_425360_VA == 0x00425360u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425360_END_VA == 0x004253a7u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425360_CALL_SITES == 0u,
              "425360 element ctor 0x425360..0x4253a6, ret, 0 direct callers");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_425360_COOKIE_VA == 0x006f174cu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425360_DISPATCHER_VA == 0x00aef5c4u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425360_STORE_COUNT == 10u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425360_NO_STORE_BYTE == 0xffu,
              "425360 dispatcher cookie 0x6f174c -> 0xaef5c4, 10 stores");

extern "C" uint32_t isaac_frame_opaque_425360_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425360_VA);
}
extern "C" uint32_t isaac_frame_opaque_425360_end_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425360_END_VA);
}
extern "C" uint32_t isaac_frame_opaque_425360_call_sites(void) {
  /* Direct rel32 E8 caller count = 0 (both scanners) — the census
     fact; the REAL inbound edge is the dispatcher cookie
     (COOKIE_VA/DISPATCHER_VA pins). */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425360_CALL_SITES);
}
extern "C" uint32_t isaac_frame_opaque_425360_cookie_va(void) {
  /* `push 0x00425360` @0x6f174c — the ONLY dword ref to the body in
     the whole image (LE 60 53 42 00 scan, 1 hit); the element-ctor
     cookie of the 0xaef5c4 dispatcher. */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425360_COOKIE_VA);
}
extern "C" uint32_t isaac_frame_opaque_425360_dispatcher_va(void) {
  /* The __ehvec-style array dispatcher (HOST): loop
     `call dword ptr [ebp+0x14]` @0xaef5ec over count iterations,
     dest += stride each pass; ret 0x14. */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425360_DISPATCHER_VA);
}
extern "C" uint32_t isaac_frame_opaque_425360_store_count(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425360_STORE_COUNT);
}
extern "C" uint32_t isaac_frame_opaque_425360_no_store_byte(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425360_NO_STORE_BYTE);
}
extern "C" uint32_t isaac_frame_opaque_425360_init_store_off(
    uint32_t index) {
  /* PE store stream offsets per index 0..9 (order-exact): 0x00,
     0x10, 0x14, 0x18, 0x1c, 0x20, 0x24, 0x28, 0x2c, 0x30 — the
     0x1c store is the WORD store; 0x04/0x08 are NOT written by the
     ctor. Byte-width result, NO_STORE_BYTE (0xff) for invalid. */
  switch (index) {
    case 0u: return 0x00u & 0xffu;
    case 1u: return 0x10u & 0xffu;
    case 2u: return 0x14u & 0xffu;
    case 3u: return 0x18u & 0xffu;
    case 4u: return 0x1cu & 0xffu;
    case 5u: return 0x20u & 0xffu;
    case 6u: return 0x24u & 0xffu;
    case 7u: return 0x28u & 0xffu;
    case 8u: return 0x2cu & 0xffu;
    case 9u: return 0x30u & 0xffu;
    default: return ISAAC_FRAME_OPAQUE_425360_NO_STORE_BYTE;
  }
}
extern "C" uint32_t isaac_frame_opaque_425360_init_store_value(
    uint32_t index) {
  /* The immediate values written per PE store index 0..9: 0, 0, 0xf,
     0x16, 0x101 (the WORD imm), 0, 0, 0, 0, 0. Full 32-bit values
     (0x101 needs the bits); invalid -> 0. */
  switch (index) {
    case 0u: case 1u:
    case 5u: case 6u: case 7u: case 8u: case 9u:
      return 0u;
    case 2u: return 0xfu;
    case 3u: return 0x16u;
    case 4u: return 0x101u;
    default: return 0u;
  }
}
extern "C" uint32_t isaac_frame_opaque_425360_init_store_width(
    uint32_t index) {
  /* Store widths per PE index: 4 (dword `c7`) for all EXCEPT
     index 4 -> 2 (the ONLY 16-bit `66 c7` store @0x42537d). */
  switch (index) {
    case 4u: return 2u;
    case 0u: case 1u: case 2u: case 3u:
    case 5u: case 6u: case 7u: case 8u: case 9u:
      return 4u;
    default: return 0u;
  }
}
extern "C" uint32_t isaac_frame_opaque_425360_init_store_index(
    uint32_t off) {
  /* FIRST-match store index for the ten offsets (0x00->0, 0x10->1,
     0x14->2, 0x18->3, 0x1c->4, 0x20->5, 0x24->6, 0x28->7, 0x2c->8,
     0x30->9); NO_STORE_BYTE (0xff) for absent. Byte-gated. */
  switch (off & 0xffu) {
    case 0x00u: return 0u;
    case 0x10u: return 1u;
    case 0x14u: return 2u;
    case 0x18u: return 3u;
    case 0x1cu: return 4u;
    case 0x20u: return 5u;
    case 0x24u: return 6u;
    case 0x28u: return 7u;
    case 0x2cu: return 8u;
    case 0x30u: return 9u;
    default:    return ISAAC_FRAME_OPAQUE_425360_NO_STORE_BYTE;
  }
}
extern "C" uint32_t isaac_frame_opaque_425360_init_store_va(
    uint32_t index) {
  /* The instruction VA of each store (PE order): 0x425360, 0x425368,
     0x42536f, 0x425376, 0x42537d, 0x425383, 0x42538a, 0x425391,
     0x425398, 0x42539f; invalid -> 0. */
  switch (index) {
    case 0u: return 0x00425360u;
    case 1u: return 0x00425368u;
    case 2u: return 0x0042536fu;
    case 3u: return 0x00425376u;
    case 4u: return 0x0042537du;
    case 5u: return 0x00425383u;
    case 6u: return 0x0042538au;
    case 7u: return 0x00425391u;
    case 8u: return 0x00425398u;
    case 9u: return 0x0042539fu;
    default: return 0u;
  }
}
extern "C" int32_t isaac_frame_opaque_425360_init_has_store(
    uint32_t off) {
  /* 1 iff `off` is one of the ten store offsets, else 0. */
  switch (off) {
    case 0x00u: case 0x10u: case 0x14u: case 0x18u: case 0x1cu:
    case 0x20u: case 0x24u: case 0x28u: case 0x2cu: case 0x30u:
      return 1;
    default:
      return 0;
  }
}
extern "C" uint32_t isaac_frame_opaque_425360_return_this(
    uint32_t this_ptr) {
  /* PE @0x425366 `mov eax,ecx` — the body returns the FULL 32-bit
     `this` (element-ctor convention; eax untouched between @0x425366
     and ret @0x4253a6). NOT a truncated low byte. */
  return this_ptr;
}
/* ---- FUN_00425b70 coop-award sub-object ctor: 21 seed strings +
        21 record store streams (ABI v62) ----
   PE 0x00425b70..0x4264b0 ret (thiscall this=ecx; 611 insns; straight-
   line + 21 lookup/strlen/assign runs; NO SEH, NO GS cookie, NO int3
   pad inside — the only `cc` bytes are immediates: `push 0xb1c3cc`
   @0x425c00 and the `cmp [0xc790cc]` mem-operand byte @0x42639f).
   Phase A (0x425b70..0x425cd5): 21 static string-slot seeds, triad
   `push len_i; push seed_i; mov ecx, slot_i; call 0x40ccd0`, slot_i =
   0xc78f08 + i*0x18, seeds = `#Online/COOP_AWARD_*` rdata constants
   (0xb1c2e4..0xb1c534, lens 0x19..0x20, ASCII-verified).
   Phase B (0x425cda..0x4264b0): 21 member records base R_i = i*0x34,
   string field at this+0xc+i*0x34: per record — SSO-select `cmp
   [slot+0x14],0x10; cmovae ecx,[slot]` (UNSIGNED cap >= 0x10 -> heap
   ptr [slot], else the slot ADDRESS), host lookup `mov eax,[0xc7169c];
   add eax,0x4a920; push ecx; push eax; call 0x9586f0` (ret 8), pure
   inline strlen, `lea ecx,[this+0xc+i*0x34]` + `push len; push str;
   call 0x40ccd0` (ret 8), then the 4-store stream: dword [R_i+0x24] A,
   WORD [R_i+0x28] B (the ONLY 16-bit store, `66 c7`), dword [R_i+0x2c]
   C, dword [R_i+0x30] D. END 0x4264b1 (first byte after `ret` c3
   @0x4264b0); 15-byte int3 pad; next body 0x4264c0 (HOST-pinned).
   1 direct rel32 caller @0x6f176f (census-callers-fixed; the big
   0x6f17xx monster ctor, ecx = Game sub-object). 63 E8 calls:
   42 x host 0x40ccd0 (string assign, ISAAC_FRAME_OPAQUE_HOST_40CCD0_VA
   REUSED) + 21 x host 0x9586f0 (NEW HOST_9586F0_VA pin); both callees
   `ret 8` — the 2-push/2-push call sites stay stack-balanced. The
   body stays host-coupled; the LAWS are the seed/member tables, the
   census pins and the sso_uses_heap decision. */
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_425B70_VA == 0x00425b70u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425B70_END_VA == 0x004264b1u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425B70_CALL_SITES == 1u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425B70_CALLSITE_VA == 0x006f176fu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425B70_INSNS == 611u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425B70_RET_VA == 0x004264b0u,
              "425b70 sub-ctor 0x425b70..0x4264b0, ret, 1 direct caller");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_425B70_RECORD_COUNT == 21u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425B70_RECORD_STRIDE == 0x34u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425B70_STRING_FIELD_OFF == 0xcu,
              "425b70 record geometry: 21 x 0x34, string at +0xc");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_425B70_STORE_A_OFF == 0x24u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425B70_STORE_B_OFF == 0x28u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425B70_STORE_C_OFF == 0x2cu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425B70_STORE_D_OFF == 0x30u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425B70_SLOT_BASE_VA == 0x00c78f08u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425B70_SLOT_STRIDE == 0x18u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425B70_SLOT_CAP_OFF == 0x14u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425B70_SSO_CAP == 0x10u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425B70_SOURCE_OFF == 0x4a920u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_HOST_9586F0_VA == 0x009586f0u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425B70_STRING_CALLS == 42u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425B70_LOOKUP_CALLS == 21u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425B70_NO_INDEX == 0xffu,
              "425b70 store/slot/source/call-count pins");

extern "C" uint32_t isaac_frame_opaque_425b70_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425B70_VA);
}
extern "C" uint32_t isaac_frame_opaque_425b70_end_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425B70_END_VA);
}
extern "C" uint32_t isaac_frame_opaque_425b70_call_sites(void) {
  /* Direct rel32 caller count = 1 (census fact): @0x6f176f. */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425B70_CALL_SITES);
}
extern "C" uint32_t isaac_frame_opaque_425b70_callsite_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425B70_CALLSITE_VA);
}
extern "C" uint32_t isaac_frame_opaque_425b70_insn_count(void) {
  /* 611 insns (capstone linear, first-byte resync; 0 undecodable). */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425B70_INSNS);
}
extern "C" uint32_t isaac_frame_opaque_425b70_ret_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425B70_RET_VA);
}
extern "C" uint32_t isaac_frame_opaque_425b70_record_count(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425B70_RECORD_COUNT);
}
extern "C" uint32_t isaac_frame_opaque_425b70_record_stride(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425B70_RECORD_STRIDE);
}
extern "C" uint32_t isaac_frame_opaque_425b70_string_field_off(void) {
  /* The string field sits at record base + 0xc (0xc + i*0x34 member
     dests; the v61 425360 element ctor zeros the 0x00/0x10/0x14/0x18
     fields of the SAME array before this ctor fills the records). */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425B70_STRING_FIELD_OFF);
}
extern "C" uint32_t isaac_frame_opaque_425b70_store_a_off(void) {
  /* dword store at record + 0x24 (`c7 46 24` @0x425d20 for record 0). */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425B70_STORE_A_OFF) & 0xffu;
}
extern "C" uint32_t isaac_frame_opaque_425b70_store_b_off(void) {
  /* WORD store at record + 0x28 (`66 c7 46 28` @0x425d27) — the ONLY
     16-bit store of the four (A/C/D are dwords). */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425B70_STORE_B_OFF) & 0xffu;
}
extern "C" uint32_t isaac_frame_opaque_425b70_store_c_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425B70_STORE_C_OFF) & 0xffu;
}
extern "C" uint32_t isaac_frame_opaque_425b70_store_d_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425B70_STORE_D_OFF) & 0xffu;
}
extern "C" uint32_t isaac_frame_opaque_425b70_static_slot_va(uint32_t index) {
  /* slot_i = 0xc78f08 + i*0x18 (the BSS std::string seeds, 21 slots;
     the machine encodes each as `mov ecx, imm` — the progression is
     the machine's own linear form). 0 for index out of 0..20. */
  if (index < static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425B70_RECORD_COUNT)) {
    return ISAAC_FRAME_OPAQUE_425B70_SLOT_BASE_VA +
           index * static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425B70_SLOT_STRIDE);
  }
  return 0u;
}
extern "C" uint32_t isaac_frame_opaque_425b70_static_seed_va(
    uint32_t index) {
  /* The rdata seed constant per slot (order-exact, 21 rows): the
     `#Online/COOP_AWARD_*` literals; 0 for invalid index. */
  switch (index) {
    case 0u: return 0x00b1c2e4u;
    case 1u: return 0x00b1c300u;
    case 2u: return 0x00b1c320u;
    case 3u: return 0x00b1c33cu;
    case 4u: return 0x00b1c35cu;
    case 5u: return 0x00b1c378u;
    case 6u: return 0x00b1c394u;
    case 7u: return 0x00b1c3b0u;
    case 8u: return 0x00b1c3ccu;
    case 9u: return 0x00b1c3e8u;
    case 10u: return 0x00b1c408u;
    case 11u: return 0x00b1c428u;
    case 12u: return 0x00b1c444u;
    case 13u: return 0x00b1c468u;
    case 14u: return 0x00b1c484u;
    case 15u: return 0x00b1c4a0u;
    case 16u: return 0x00b1c4bcu;
    case 17u: return 0x00b1c4dcu;
    case 18u: return 0x00b1c4fcu;
    case 19u: return 0x00b1c518u;
    case 20u: return 0x00b1c534u;
    default:  return 0u;
  }
}
extern "C" uint32_t isaac_frame_opaque_425b70_static_seed_len(
    uint32_t index) {
  /* The seed byte length per slot (the `push` imm before each assign);
     0 for invalid index. */
  switch (index) {
    case 0u: return 0x1au;
    case 1u: return 0x1cu;
    case 2u: return 0x1au;
    case 3u: return 0x1du;
    case 4u: return 0x1bu;
    case 5u: return 0x19u;
    case 6u: return 0x1bu;
    case 7u: return 0x1bu;
    case 8u: return 0x1bu;
    case 9u: return 0x1du;
    case 10u: return 0x1du;
    case 11u: return 0x1bu;
    case 12u: return 0x20u;
    case 13u: return 0x1au;
    case 14u: return 0x19u;
    case 15u: return 0x19u;
    case 16u: return 0x1eu;
    case 17u: return 0x1eu;
    case 18u: return 0x1au;
    case 19u: return 0x1au;
    case 20u: return 0x1bu;
    default:  return 0u;
  }
}
extern "C" uint32_t isaac_frame_opaque_425b70_member_string_off(
    uint32_t index) {
  /* String dest offset per record = 0xc + i*0x34 (the machine's own
     linear progression: 20 `lea` immediates + `add esi,0x41c` @0x426437
     for the last). 0 for invalid index. */
  if (index < static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425B70_RECORD_COUNT)) {
    return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425B70_STRING_FIELD_OFF) +
           index * static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425B70_RECORD_STRIDE);
  }
  return 0u;
}
extern "C" uint32_t isaac_frame_opaque_425b70_member_value_a(
    uint32_t index) {
  /* dword store [R_i+0x24] per record (order-exact, 21 rows); 0 for
     invalid index. */
  switch (index) {
    case 0u: return 0x15u;
    case 1u: return 7u;
    case 2u: return 4u;
    case 3u: return 0xau;
    case 4u: return 2u;
    case 5u: return 0xcu;
    case 6u: return 0xfu;
    case 7u: return 0x14u;
    case 8u: return 0x13u;
    case 9u: return 8u;
    case 10u: return 0x12u;
    case 11u: return 0x10u;
    case 12u: return 9u;
    case 13u: return 0xbu;
    case 14u: return 1u;
    case 15u: return 5u;
    case 16u: return 6u;
    case 17u: return 0xdu;
    case 18u: return 0xeu;
    case 19u: return 3u;
    case 20u: return 0x11u;
    default:  return 0u;
  }
}
extern "C" uint32_t isaac_frame_opaque_425b70_member_value_b(
    uint32_t index) {
  /* WORD store [R_i+0x28] per record (the `66 c7` immediate; the only
     16-bit store of the four); 0 for invalid index. */
  switch (index) {
    case 1u: return 1u;
    case 4u: return 0u;
    case 19u: return 0x101u;
    case 20u: return 1u;
    case 0u: case 2u: case 3u: case 5u: case 6u: case 7u: case 8u:
    case 9u: case 10u: case 11u: case 12u: case 13u: case 14u:
    case 15u: case 16u: case 17u: case 18u:
      return 0x101u;
    default:  return 0u;
  }
}
extern "C" uint32_t isaac_frame_opaque_425b70_member_value_c(
    uint32_t index) {
  /* dword store [R_i+0x2c] per record — float immediates as raw bits;
     0 for invalid index. */
  switch (index) {
    case 0u: case 1u: case 2u: case 19u:
      return 0x3f800000u;
    case 3u: case 12u:
      return 0x40000000u;
    case 4u: return 0x41400000u;
    case 5u: case 10u: case 11u: case 14u:
      return 0x40400000u;
    case 6u: case 13u:
      return 0x41a00000u;
    case 7u: case 8u: case 15u: case 16u:
      return 0x40a00000u;
    case 9u: case 18u:
      return 0x41200000u;
    case 17u: return 0x41f80000u;
    case 20u: return 0x447a0000u;
    default:  return 0u;
  }
}
extern "C" uint32_t isaac_frame_opaque_425b70_member_value_d(
    uint32_t index) {
  /* dword store [R_i+0x30] per record; 0 for invalid index. */
  switch (index) {
    case 1u: case 4u:
      return 2u;
    case 19u: case 20u:
      return 1u;
    default:  return 0u;
  }
}
extern "C" int32_t isaac_frame_opaque_425b70_sso_uses_heap(uint32_t cap) {
  /* PE @0x425cda / 0x425d3b / ...: `cmp [slot+0x14],0x10; cmovae
     ecx,[slot]` — cmovae = UNSIGNED above-or-equal (CF=0): the HEAP
     pointer [slot] is selected iff cap >= 0x10; else the slot ADDRESS
     (SSO inline). 0x100/0x1ff/0xffffffff -> 1; 0/0xf -> 0. */
  return (cap >= static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425B70_SSO_CAP))
             ? 1
             : 0;
}
extern "C" uint32_t isaac_frame_opaque_425b70_source_base_va(void) {
  /* `mov eax,[0xc7169c]` per record — the Manager slot; the existing
     ISAAC_FRAME_OPAQUE_MANAGER_SLOT_VA pin is REUSED (no duplicate). */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_MANAGER_SLOT_VA);
}
extern "C" uint32_t isaac_frame_opaque_425b70_source_off(void) {
  /* `add eax,0x4a920` per record — the lookup offset within the
     manager sub-object. */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425B70_SOURCE_OFF);
}
extern "C" uint32_t isaac_frame_opaque_425b70_host_lookup_va(void) {
  /* `call 0x9586f0` per record (21 sites) — the SEH/GS award lookup
     (ret 8); stays host, pinned NEW here. */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_HOST_9586F0_VA);
}
extern "C" uint32_t isaac_frame_opaque_425b70_host_string_va(void) {
  /* `call 0x40ccd0` 42 times (21 seeds + 21 member assigns) — the
     family v20 string-assign model; the existing
     ISAAC_FRAME_OPAQUE_HOST_40CCD0_VA pin is REUSED. */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_HOST_40CCD0_VA);
}

/* ---- FUN_00425a70 0x68-stride pair finder: DUPLICATE-SEAM ROW (ABI v63) ----
   PE 0x425a70..0x425ab5, TWO `ret 8` (miss-exit 0x425aad, found-exit
   0x425ab5; END 0x00425ab8 = first int3 of the 8-byte pad 0x425ab8..
   0x425abf; next body 0x425ac0 = frame_effect HOST-pinned
   ISAAC_FRAME_EFFECT_HOST_425AC0_VA, NOT FO-open), 35 insns, 0 E8,
   0 stores, NO SEH / NO GS (plain ebp frame; the GS-cookie epilogue at
   0x425a4e..0x425a56 belongs to the PREVIOUS body 0x4259b0 HOST).
   Body: push ebp; mov ebp,esp; push esi; mov esi,[ecx] (begin); mov
   eax,0x4ec4ec4f; mov ecx,[ecx+4] (end); sub ecx,esi; imul ecx; push
   edi; sar edx,5; xor edi,edi; mov eax,edx; shr eax,0x1f; add eax,edx
   (count, SIGNED magic div — the SAME divider as the landed 4257b0
   laws: FRAME_OPAQUE_4257B0_DIV_MAGIC / _DIV_SHIFT / _ELEM_STRIDE
   REUSED, no duplicate pins); je miss (count 0); loop: cmp [esi],edx
   (lo ARG0 = [ebp+8]); jne next; cmp [esi+4],ecx (hi ARG1 =
   [ebp+0xc]); je found (FIRST match wins); next: inc edi; add esi,0x68;
   cmp edi,eax; jb loop (UNSIGNED bound); miss: xor al,al; ret 8;
   found: mov al,1; ret 8. This is EXACTLY
   `isaac_frame_opaque_4257b0_list_count_from_bounds` composed with
   `isaac_frame_opaque_4257b0_pass_a_scan_found` (strict duplicate).
   Per the v62 handoff the row is PINNED (census + the composition
   law), the body is NOT re-landed (duplicate-seam rule). 3 direct
   rel32 callers (lea-corrected whole-.text census, this unit):
   0x425b24 (inside the 0x425ac0 accumulator), 0x6fdecd, 0x78ffe9;
   frame_effect's 6fdc10/6fd7c0 bodies already consume its AL byte
   (`ret_425a70` gate). */
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_425A70_VA == 0x00425a70u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425A70_END_VA == 0x00425ab8u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425A70_CALL_SITES == 3u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425A70_INSNS == 35u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425A70_RET_BYTES == 8u,
              "425a70 duplicate-seam finder 0x425a70..0x425ab5, ret 8 x2, 3 callers, 35 insns");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_425A70_CALLER1_VA == 0x00425b24u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425A70_CALLER2_VA == 0x006fdecdu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425A70_CALLER3_VA == 0x0078ffe9u,
              "425a70 callers 0x425b24 (in 425ac0) / 0x6fdecd / 0x78ffe9");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_425A70_PAIR_LO_OFF == 0u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_425A70_PAIR_HI_OFF == 4u,
              "425a70 pair at entry +0 (lo) / +4 (hi)");

extern "C" uint32_t isaac_frame_opaque_425a70_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425A70_VA);
}
extern "C" uint32_t isaac_frame_opaque_425a70_end_va(void) {
  /* First byte after the LAST `ret 8` (found-exit @0x425ab5); the miss
     exit is @0x425aad — END covers BOTH exits. */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425A70_END_VA);
}
extern "C" uint32_t isaac_frame_opaque_425a70_call_sites(void) {
  /* Direct rel32 caller count = 3 (lea-corrected census this unit). */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425A70_CALL_SITES);
}
extern "C" uint32_t isaac_frame_opaque_425a70_caller1_va(void) {
  /* @0x425b24 — inside the 0x425ac0 accumulator body (the `call
     0x425a70` @0x425b24 feeding the 0x4259b0 fallback at 0x425b34). */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425A70_CALLER1_VA);
}
extern "C" uint32_t isaac_frame_opaque_425a70_caller2_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425A70_CALLER2_VA);
}
extern "C" uint32_t isaac_frame_opaque_425a70_caller3_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425A70_CALLER3_VA);
}
extern "C" uint32_t isaac_frame_opaque_425a70_insn_count(void) {
  /* 35 insns (capstone linear, first-byte resync; the 0x60-byte window
     0x425a70..0x425ac0 exact — both exits included). */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425A70_INSNS);
}
extern "C" uint32_t isaac_frame_opaque_425a70_ret_bytes(void) {
  /* BOTH exits `ret 8` (two stack args: lo [ebp+8], hi [ebp+0xc]). */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425A70_RET_BYTES);
}
extern "C" uint32_t isaac_frame_opaque_425a70_pair_lo_off(void) {
  /* `cmp [esi],edx` @0x425a97 — the LOW member of the pair sits at
     entry + 0. Byte-width result. */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425A70_PAIR_LO_OFF) &
         0xffu;
}
extern "C" uint32_t isaac_frame_opaque_425a70_pair_hi_off(void) {
  /* `cmp [esi+4],ecx` @0x425a9b — the HIGH member at entry + 4.
     Byte-width result. */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425A70_PAIR_HI_OFF) &
         0xffu;
}
extern "C" int32_t isaac_frame_opaque_425a70_find(
    const uint8_t* list_base, uint32_t list_begin_va, uint32_t list_end_va,
    uint32_t lo, uint32_t hi) {
  /* The exact machine law: count = SIGNED magic div of (end-begin), then
     a stride-0x68 FIRST-MATCH scan with FULL-dword equality on both
     members (NO masking — cmp [esi],edx / cmp [esi+4],ecx). count 0 or
     miss -> AL 0; first match -> AL 1. The 0xffffffff pair is matched
     normally (this body has NO (lo&hi)==-1 skip — that gate belongs to
     the 4257b0 Pass-A insert decision, not to this finder). */
  if (list_base == nullptr) {
    return 0;
  }
  const uint32_t count = isaac_frame_opaque_4257b0_list_count_from_bounds(
      list_begin_va, list_end_va);
  const uint8_t* entry = list_base;
  for (uint32_t i = 0; i < count;
       ++i, entry += ISAAC_FRAME_OPAQUE_4257B0_ELEM_STRIDE) {
    if (fo_4257b0_load_u32(entry) == lo &&
        fo_4257b0_load_u32(entry + 4) == hi) {
      return 1;
    }
  }
  return 0;
}
extern "C" uint32_t isaac_frame_opaque_pure_helpers_abi_version(void) {
  return ISAAC_FRAME_OPAQUE_PURE_HELPERS_ABI_VERSION;
}

/* FUN_00421400 pose-recompute + AnimState Render pair shell (ABI v33).
   0x00421400..0x004214a0, sole caller 0x006fc3ce (Game subobject +0x1d2ec).
   0x00421406 cmp dword [ecx],0 mode probe (FULL 32-bit); je 0x42149b -> the
   function is a no-op (guard byte untouched, no stores).
   0x00421411..0x00421440: movss [0xc78dc4]; divss [0xbaab74] (480.0f) ->
   [ecx+0xa4]; movss [0xc78edc]; divss [0xbaaaf4] (270.0f) -> [ecx+0xa8].
   Numerators are runtime BSS floats; divisors are rdata constants.
   0x00421429 / 0x00421494: byte [0xc33910] = 0 then 1 around the render
   pair (render guard; the 0x409efc camera-base select reads it).
   0x00421448 cmp byte [ecx+0x111],0 (LOW-BYTE gate); je -> skip the pair.
   0x00421451 cmp byte [ecx+0x78],0 (LOW-BYTE order); je -> +0x38 first.
   Two runtime calls into host AnimationState::Render (0x0040a030, ret 0xc,
   three Vector& args all = overlay clamp 0xc7b640). The render-shell family
   owns the 40a030 pure CF; this family keeps the calls host. */

static_assert(offsetof(IsaacFrameOpaque421400Plan, mode_active) == 0,
              "421400 mode_active");
static_assert(offsetof(IsaacFrameOpaque421400Plan, pos_a_bits) == 4,
              "421400 pos_a_bits");
static_assert(offsetof(IsaacFrameOpaque421400Plan, pos_b_bits) == 8,
              "421400 pos_b_bits");
static_assert(offsetof(IsaacFrameOpaque421400Plan, render_needed) == 12,
              "421400 render_needed");
static_assert(offsetof(IsaacFrameOpaque421400Plan, render_first) == 16,
              "421400 render_first");
static_assert(offsetof(IsaacFrameOpaque421400Plan, render_va) == 20,
              "421400 render_va");
static_assert(offsetof(IsaacFrameOpaque421400Plan, render_arg_va) == 24,
              "421400 render_arg_va");
static_assert(offsetof(IsaacFrameOpaque421400Plan, guard_va) == 28,
              "421400 guard_va");
static_assert(offsetof(IsaacFrameOpaque421400Plan, next_va) == 32,
              "421400 next_va");
static_assert(offsetof(IsaacFrameOpaque421400Plan, pure_cf_ok) == 36,
              "421400 pure_cf_ok");
static_assert(sizeof(IsaacFrameOpaque421400Plan) == 40,
              "421400 plan size");

extern "C" int32_t isaac_frame_opaque_421400_mode_active(int32_t mode) {
  return mode != 0 ? 1 : 0;
}

extern "C" uint32_t isaac_frame_opaque_421400_pos_a_bits(float num_a) {
  /* divss [0xc78dc4] / [0xbaab74] = 480.0f (0x43f00000). */
  return fo_f32_bits(num_a / 480.0f);
}

extern "C" uint32_t isaac_frame_opaque_421400_pos_b_bits(float num_b) {
  /* divss [0xc78edc] / [0xbaaaf4] = 270.0f (0x43870000). */
  return fo_f32_bits(num_b / 270.0f);
}

extern "C" int32_t isaac_frame_opaque_421400_render_needed(uint32_t flag111) {
  /* LOW-BYTE test (PE cmp byte [ecx+0x111],0). */
  return (flag111 & 0xffu) != 0u ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_421400_render_first(uint32_t field78) {
  /* LOW-BYTE test (PE cmp byte [ecx+0x78],0); 0 -> +0x38 first, 1 -> +0x58. */
  return (field78 & 0xffu) != 0u ? 1 : 0;
}

extern "C" void isaac_frame_opaque_421400_plan(
    IsaacFrameOpaque421400Plan* out, int32_t mode, float num_a, float num_b,
    uint32_t flag111, uint32_t field78) {
  if (out == nullptr) {
    return;
  }
  out->mode_active = (uint32_t)isaac_frame_opaque_421400_mode_active(mode);
  out->pos_a_bits = isaac_frame_opaque_421400_pos_a_bits(num_a);
  out->pos_b_bits = isaac_frame_opaque_421400_pos_b_bits(num_b);
  out->render_needed =
      (uint32_t)isaac_frame_opaque_421400_render_needed(flag111);
  out->render_first =
      (uint32_t)isaac_frame_opaque_421400_render_first(field78);
  out->render_va = ISAAC_FRAME_OPAQUE_HOST_40A030_VA;
  out->render_arg_va = ISAAC_FRAME_OPAQUE_421400_RENDER_ARG_VA;
  out->guard_va = ISAAC_FRAME_OPAQUE_421400_GUARD_VA;
  out->next_va = ISAAC_FRAME_OPAQUE_421400_END_VA;
  out->pure_cf_ok = 1u;
}

/* ===========================================================================
 * FUN_004214b0 set-overlay-animation-by-mode — ABI v34
 *
 * Body VA 0x004214b0..0x00421591, ret 4 (this in ecx, arg = mode), plain
 * prologue (no SEH); no exact ZHL. The v33 receipt named "next function
 * 0x004214c0" — anchor correction: int3 pad runs 0x004214a1..0x004214af
 * and the real entry is 0x004214b0 (0x4214c0 is mid-body). Sole callers:
 * 0x4afef5 / 0x4aff6e (the 0x4afe40 dispatch family) and 0x592758
 * (`mov ecx,[0xc71678]; lea ecx,[ecx+0x1d2ec]` — the Game manager
 * subobject shared with 4212c0/421400, mode=4 pushed at the site).
 * Recovered structure (PE VAs in each comment):
 *   1. mode > 4 UNSIGNED (@ 0x4214bf cmp esi,4; ja 0x42158b) -> epilogue
 *      with NO stores ([this]=1 and [this+4]=mode are both gated)
 *   2. record = this + mode*0x38 (0x4214c8..0x4214d6: lea eax,[esi*8];
 *      sub eax,esi; lea ebx,[ecx+eax*8] = mode*7*8); anim = this+8
 *   3. ANM2::Load(anim, record+0x120, 1) 0x40bd50 + LoadGraphics(anim)
 *      0x40c000 by reference (anm2 v7/v8 store lanes)
 *   4. [this+4] = mode (0x4214f2, store, gated)
 *   5. mode==2 || mode==3 -> GetLayer(4) 0x40b220 + or [layer+0x8c],0x20
 *      (0x421508, OR store, only on the 2/3 arm)
 *   6. SSO key decode @ record+0x138 (cap record+0x14c jb 0x10 strict):
 *      cap<0x10 -> inline +0x138 else heap [record+0x138] (0x42150f..0x42151e)
 *   7. [anim+0x34] != 0 FULL dword -> SSO anim-name compare vs key
 *      (anm2 pins +0x34 = ANIM_DATA_PTR); have_eq (0x42155a test eax,eax):
 *      equal -> cmp_result 0; mismatch -> sbb/or nonzero. equal AND
 *      [key+0x34]==0 AND [anim+0x44]==0 -> SKIP the SetOverlay block
 *      (0x42155e/0x421563, LOW-BYTE zero tests)
 *   8. else SetOverlayFrame 0x40a5d0(anim, key, 1) (ANM2_PLAY_APPLY);
 *      al != 0 LOW-BYTE -> Rewind 0x40a1b0(anim+0x30) + [anim+0x44]=1
 *      (0x42157e, mov byte,1 assignment)
 *   9. [this] = 1 (0x421585, mov dword,1, gated)
 * Host leaves: the 5 ANM2-family calls by reference. Exported laws are
 * pure scalars — none reads host memory. NARROWED not removed.
 * Evidence: section-notes/frame-opaque-v34/.
 * =========================================================================== */

extern "C" int32_t isaac_frame_opaque_4214b0_mode_allowed(int32_t mode) {
  /* VA 0x004214bf: `cmp esi,4; ja 0x42158b` — UNSIGNED gate. Negative
     modes (huge u32) and 0x100 are NOT allowed; 0..4 are. */
  return static_cast<uint32_t>(mode) <=
                 static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4214B0_MAX_MODE)
             ? 1
             : 0;
}

extern "C" uint32_t isaac_frame_opaque_4214b0_record_off(int32_t mode) {
  /* VA 0x004214c8..0x004214d6: lea eax,[esi*8]; sub eax,esi; lea
     ebx,[ecx+eax*8] -> record offset = mode*7*8 = mode*0x38 (u32 wrap). */
  const uint32_t m = static_cast<uint32_t>(mode) & 0xffffffffu;
  return (uint32_t)(m * (uint32_t)ISAAC_FRAME_OPAQUE_4214B0_RECORD_STRIDE);
}

extern "C" int32_t isaac_frame_opaque_4214b0_mode_2or3(int32_t mode) {
  /* VA 0x004214f5..0x004214fd: `cmp esi,2; je; cmp esi,3; jne skip`. */
  return (mode == 2 || mode == 3) ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_4214b0_cmp_needed(
    uint32_t anim_data_ptr) {
  /* VA 0x00421520: `cmp dword ptr [edi+0x34],0; je 0x421568` — FULL
     dword gate: null anim-data ptr -> straight to the SetOverlay block
     (no string compare). 0x100 IS a compare. */
  return anim_data_ptr != 0u ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_4214b0_have_eq(int32_t cmp_result) {
  /* VA 0x00421551..0x0042155a: equal path `xor eax,eax` -> 0; mismatch
     `sbb eax,eax; or eax,1` -> nonzero. have_eq == (result == 0). */
  return cmp_result == 0 ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_4214b0_skip_setoverlay_needed(
    int32_t have_eq, uint32_t key_flag, uint32_t playing_flag) {
  /* VA 0x0042155e..0x00421566: on the EQUAL path only —
     `cmp byte [ebx+0x34],al; je 0x421582` (key flag zero -> skip) and
     `cmp byte [edi+0x44],al; jne 0x421582` (playing flag nonzero ->
     skip). LOW-BYTE zero tests. skip iff have_eq && key_flag_low==0 &&
     playing_flag_low==0. */
  if (have_eq == 0) {
    return 0;
  }
  if ((key_flag & 0xffu) != 0u) {
    return 0;
  }
  if ((playing_flag & 0xffu) != 0u) {
    return 0;
  }
  return 1;
}

extern "C" int32_t isaac_frame_opaque_4214b0_setoverlay_ran(uint32_t al) {
  /* VA 0x00421572: `test al,al; je 0x421582` — LOW-BYTE test: the
     SetOverlayFrame return byte gates Rewind + the flag store. */
  return (al & 0xffu) != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_frame_opaque_4214b0_layer_flags_after(
    uint32_t flags) {
  /* VA 0x00421508: `or dword ptr [eax+0x8c],0x20` — OR store, only on
     the mode 2/3 arm. */
  return flags | static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4214B0_LAYER_FLAGS_OR);
}

extern "C" int32_t isaac_frame_opaque_4214b0_sso_inline_needed(
    uint32_t cap) {
  /* VA 0x0042150f..0x0042151e: `cmp [ebx+0x14c],0x10; jb 0x421520` —
     STRICT jb: cap == 0x10 is HEAP, cap < 0x10 is inline. */
  return cap < static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4214B0_SSO_CAP)
             ? 1
             : 0;
}

extern "C" uint32_t isaac_frame_opaque_4214b0_max_mode(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4214B0_MAX_MODE);
}

extern "C" uint32_t isaac_frame_opaque_4214b0_record_stride(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4214B0_RECORD_STRIDE);
}

extern "C" uint32_t isaac_frame_opaque_4214b0_load_path_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4214B0_LOAD_PATH_OFF);
}

extern "C" uint32_t isaac_frame_opaque_4214b0_load_graphics(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4214B0_LOAD_GRAPHICS);
}

extern "C" uint32_t isaac_frame_opaque_4214b0_mode_store_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4214B0_MODE_STORE_OFF);
}

extern "C" uint32_t isaac_frame_opaque_4214b0_open_store_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4214B0_OPEN_STORE_OFF);
}

extern "C" uint32_t isaac_frame_opaque_4214b0_open_store(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4214B0_OPEN_STORE);
}

extern "C" uint32_t isaac_frame_opaque_4214b0_get_layer_arg(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4214B0_GET_LAYER_ARG);
}

extern "C" uint32_t isaac_frame_opaque_4214b0_layer_flags_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4214B0_LAYER_FLAGS_OFF);
}

extern "C" uint32_t isaac_frame_opaque_4214b0_layer_flags_or(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4214B0_LAYER_FLAGS_OR);
}

extern "C" uint32_t isaac_frame_opaque_4214b0_key_data_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4214B0_KEY_DATA_OFF);
}

extern "C" uint32_t isaac_frame_opaque_4214b0_key_cap_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4214B0_KEY_CAP_OFF);
}

extern "C" uint32_t isaac_frame_opaque_4214b0_sso_cap(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4214B0_SSO_CAP);
}

extern "C" uint32_t isaac_frame_opaque_4214b0_anim_data_ptr_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4214B0_ANIM_DATA_PTR_OFF);
}

extern "C" uint32_t isaac_frame_opaque_4214b0_playing_flag_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4214B0_PLAYING_FLAG_OFF);
}

extern "C" uint32_t isaac_frame_opaque_4214b0_rewind_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4214B0_REWIND_OFF);
}

extern "C" uint32_t isaac_frame_opaque_4214b0_key_flag_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4214B0_KEY_FLAG_OFF);
}

extern "C" uint32_t isaac_frame_opaque_4214b0_playing_flag_set(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4214B0_PLAYING_FLAG_SET);
}

extern "C" uint32_t isaac_frame_opaque_4214b0_anm2_load_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4214B0_ANM2_LOAD_VA);
}

extern "C" uint32_t isaac_frame_opaque_4214b0_anm2_load_graphics_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4214B0_ANM2_LOAD_GRAPHICS_VA);
}

extern "C" uint32_t isaac_frame_opaque_4214b0_anm2_get_layer_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4214B0_ANM2_GET_LAYER_VA);
}

extern "C" uint32_t isaac_frame_opaque_4214b0_anm2_set_overlay_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4214B0_ANM2_SET_OVERLAY_VA);
}

extern "C" uint32_t isaac_frame_opaque_4214b0_anm2_rewind_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4214B0_ANM2_REWIND_VA);
}

extern "C" uint32_t isaac_frame_opaque_4214b0_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4214B0_HOST_VA);
}

extern "C" uint32_t isaac_frame_opaque_4214b0_end_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4214B0_END_VA);
}

extern "C" uint32_t isaac_frame_opaque_4214b0_next_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4214B0_NEXT_VA);
}

/* Layout invariants recovered from the PE body. */
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4214B0_HOST_VA <
                  (uint32_t)ISAAC_FRAME_OPAQUE_4214B0_END_VA,
              "4214b0 body ret follows entry");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4214B0_NEXT_VA -
                      (uint32_t)ISAAC_FRAME_OPAQUE_4214B0_END_VA ==
                  0xf,
              "ret @ 0x421591 then int3 pad (0x421594..0x42159f) to 0x4215a0");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4214B0_MAX_MODE == 4u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4214B0_RECORD_STRIDE == 0x38u,
              "mode 0..4 records at stride 0x38 (mode*7*8)");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4214B0_ANIM_OFF == 0x08u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4214B0_LOAD_PATH_OFF == 0x120u,
              "anim subobject at this+8; load path at record+0x120");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4214B0_KEY_DATA_OFF == 0x138u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4214B0_KEY_CAP_OFF == 0x14cu,
              "SSO key at record+0x138 with cap +0x14c");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4214B0_ANIM_DATA_PTR_OFF == 0x34u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4214B0_PLAYING_FLAG_OFF == 0x44u,
              "anm2 +0x34 data ptr / +0x44 playing flag match the anm2 family");

/* ===========================================================================
 * FUN_004215a0 std::string move-assign (self-alias guarded) — ABI v35
 *
 * Body VA 0x004215a0..0x004215d9, ret 4 (this in ecx, src = [ebp+8]),
 * plain 2-push prologue (no SEH); no exact ZHL. 28 direct E8 callers
 * image-wide (0x687b2d..0x689bcd); zero address-taken. Recorded
 * NEXT_VA of v34 (rule-11 verified open before implementing).
 * Recovered structure (PE VAs in each comment):
 *   1. self-alias (0x4215aa cmp esi,edi / je 0x4215d4) -> PURE no-op
 *      (no dtor, no copy, no reset); return *this
 *   2. host string-dtor 0x40d040(ecx=this) (0x4215ae) — shared MSVC
 *      helper, 1288 direct callers, used by exit/playerhud as host leaf
 *   3. SSO block copy 0x18 B (0x4215b3..0x4215be): movups 16 B
 *      [src+0..0xf]->[this+0..0xf], then movq 8 B [src+0x10..0x17]->
 *      [this+0x10..0x17] (data +0x00, size +0x10, cap +0x14) PE order
 *   4. source steal-reset (0x4215c3..0x4215d1): [src+0x10]=0 (size),
 *      [src+0x14]=0xf (cap — CONSTANT, never echoes src_cap),
 *      byte[src]=0 (empty)
 *   5. eax = this; ret 4
 * The copy is SSO-UNCONDITIONAL: only the dtor branches on heap-vs-
 * inline, and the dtor is a host leaf. Exported laws pure scalars.
 * NARROWED not removed. NEXT_VA 0x004215e0.
 * Evidence: section-notes/frame-opaque-v35/.
 * =========================================================================== */

extern "C" int32_t isaac_frame_opaque_4215a0_self_alias(uint32_t this_ptr,
                                                        uint32_t src_ptr) {
  /* VA 0x004215aa: `cmp esi,edi; je 0x4215d4` — FULL dword equality. */
  return this_ptr == src_ptr ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_4215a0_dtor_needed(int32_t alias) {
  /* VA 0x004215ac: the je skips the dtor call; non-alias runs the host
     string-dtor 0x40d040 on this. */
  return alias == 0 ? 1 : 0;
}

extern "C" uint32_t isaac_frame_opaque_4215a0_copy_sso_hi(void) {
  /* VA 0x004215b3: `movups xmm0,[edi]; movups [esi],xmm0` — 16 B. */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4215A0_COPY_SSO_HI);
}

extern "C" uint32_t isaac_frame_opaque_4215a0_copy_sso_lo(void) {
  /* VA 0x004215b9..0x004215be: `movq xmm0,[edi+0x10]; movq
     [esi+0x10],xmm0` — 8 B. */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4215A0_COPY_SSO_LO);
}

extern "C" uint32_t isaac_frame_opaque_4215a0_copy_total(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4215A0_COPY_TOTAL);
}

extern "C" uint32_t isaac_frame_opaque_4215a0_src_size_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4215A0_SRC_SIZE_OFF);
}

extern "C" uint32_t isaac_frame_opaque_4215a0_src_cap_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4215A0_SRC_CAP_OFF);
}

extern "C" uint32_t isaac_frame_opaque_4215a0_src_cap_empty(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4215A0_SRC_CAP_EMPTY);
}

extern "C" uint32_t isaac_frame_opaque_4215a0_src_data_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4215A0_SRC_DATA_OFF);
}

extern "C" uint32_t isaac_frame_opaque_4215a0_steal_reset_size(void) {
  /* VA 0x004215c3: `mov dword ptr [edi+0x10],0` — size reset is the
     CONSTANT 0, never the copied size. */
  return 0u;
}

extern "C" uint32_t isaac_frame_opaque_4215a0_steal_reset_cap(
    uint32_t src_cap) {
  /* VA 0x004215ca: `mov dword ptr [edi+0x14],0xf` — the stored cap is
     the CONSTANT 0xf, never src_cap (a src_cap-echoing mutant fails). */
  (void)src_cap;
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4215A0_SRC_CAP_EMPTY);
}

extern "C" uint32_t isaac_frame_opaque_4215a0_steal_reset_data_byte(void) {
  /* VA 0x004215d1: `mov byte ptr [edi],0` — empty-string data byte. */
  return 0u;
}

extern "C" uint32_t isaac_frame_opaque_4215a0_dtor_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4215A0_DTOR_VA);
}

extern "C" uint32_t isaac_frame_opaque_4215a0_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4215A0_HOST_VA);
}

extern "C" uint32_t isaac_frame_opaque_4215a0_end_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4215A0_END_VA);
}

extern "C" uint32_t isaac_frame_opaque_4215a0_next_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4215A0_NEXT_VA);
}

/* Layout invariants recovered from the PE body. */
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4215A0_HOST_VA <
                  (uint32_t)ISAAC_FRAME_OPAQUE_4215A0_END_VA,
              "4215a0 body ret follows entry");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4215A0_NEXT_VA -
                      (uint32_t)ISAAC_FRAME_OPAQUE_4215A0_END_VA ==
                  0x7,
              "ret @ 0x4215d9 then int3 pad (0x4215dc..0x4215df) to 0x4215e0");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4215A0_COPY_SSO_HI == 0x10u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4215A0_COPY_SSO_LO == 0x08u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4215A0_COPY_TOTAL == 0x18u,
              "SSO block copy: 16 B movups + 8 B movq = 0x18 total");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4215A0_SRC_SIZE_OFF == 0x10u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4215A0_SRC_CAP_OFF == 0x14u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4215A0_SRC_DATA_OFF == 0x00u,
              "std::string SSO layout: data +0, size +0x10, cap +0x14");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4215A0_SRC_CAP_EMPTY == 0x0fu,
              "steal-reset stores cap 0xf (empty-string SSO cap)");

/* ===========================================================================
 * FUN_004215e0 std::string copy-assign (user-assign, NO self-alias guard) — ABI v36
 *
 * Body VA 0x004215e0..0x00421611, ret 8 (this in ecx, src = [ebp+8],
 * second stack arg NEVER read); plain 1-push prologue (no SEH); no exact
 * ZHL. 1 direct E8 caller image-wide (0x68d320); zero address-taken.
 * The v35 move-assign twin WITHOUT the guard — the host string-dtor and
 * the SSO copy/steal-reset are byte-identical to v35's non-alias path.
 * Recovered structure (PE VAs in each comment):
 *   1. host string-dtor 0x40d040(ecx=this) at 0x4215e6 — UNCONDITIONAL
 *      (this body has NO self-alias check; contrast v35's 0x4215aa je)
 *   2. SSO block copy 0x18 B (0x4215ee..0x4215f9): movups 16 B
 *      [src+0..0xf]->[this+0..0xf], movq 8 B [src+0x10..0x17]->
 *      [this+0x10..0x17] (data +0x00, size +0x10, cap +0x14)
 *   3. source steal-reset (0x4215fe..0x42160c): [src+0x10]=0,
 *      [src+0x14]=0xf (CONSTANT, never echoes src_cap), byte[src]=0
 *   4. eax = this; ret 8 (2 stack args, the second is DEAD)
 * Exported laws pure scalars. NARROWED not removed. NEXT_VA 0x00421618.
 * Evidence: section-notes/frame-opaque-v36/.
 * =========================================================================== */

extern "C" uint32_t isaac_frame_opaque_4215e0_copy_sso_hi(void) {
  /* VA 0x004215ee: movups 16 B. */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4215E0_COPY_SSO_HI);
}

extern "C" uint32_t isaac_frame_opaque_4215e0_copy_sso_lo(void) {
  /* VA 0x004215f4: movq 8 B. */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4215E0_COPY_SSO_LO);
}

extern "C" uint32_t isaac_frame_opaque_4215e0_copy_total(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4215E0_COPY_TOTAL);
}

extern "C" uint32_t isaac_frame_opaque_4215e0_src_size_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4215E0_SRC_SIZE_OFF);
}

extern "C" uint32_t isaac_frame_opaque_4215e0_src_cap_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4215E0_SRC_CAP_OFF);
}

extern "C" uint32_t isaac_frame_opaque_4215e0_src_cap_empty(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4215E0_SRC_CAP_EMPTY);
}

extern "C" uint32_t isaac_frame_opaque_4215e0_src_data_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4215E0_SRC_DATA_OFF);
}

extern "C" uint32_t isaac_frame_opaque_4215e0_steal_reset_size(void) {
  /* VA 0x004215fe: mov dword [src+0x10],0 — CONSTANT 0. */
  return 0u;
}

extern "C" uint32_t isaac_frame_opaque_4215e0_steal_reset_cap(
    uint32_t src_cap) {
  /* VA 0x00421605: mov dword [src+0x14],0xf — CONSTANT, not src_cap. */
  (void)src_cap;
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4215E0_SRC_CAP_EMPTY);
}

extern "C" uint32_t isaac_frame_opaque_4215e0_steal_reset_data_byte(void) {
  /* VA 0x0042160c: mov byte [src],0. */
  return 0u;
}

extern "C" uint32_t isaac_frame_opaque_4215e0_dtor_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4215E0_DTOR_VA);
}

extern "C" uint32_t isaac_frame_opaque_4215e0_ret_args(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4215E0_RET_ARGS);
}

extern "C" int32_t isaac_frame_opaque_4215e0_has_guard(void) {
  /* The defining law vs v35: this body has NO self-alias je; the dtor is
     unconditional. Returns 0 (no guard). */
  return 0;
}

extern "C" uint32_t isaac_frame_opaque_4215e0_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4215E0_HOST_VA);
}

extern "C" uint32_t isaac_frame_opaque_4215e0_end_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4215E0_END_VA);
}

extern "C" uint32_t isaac_frame_opaque_4215e0_next_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4215E0_NEXT_VA);
}

/* Layout invariants recovered from the PE body. */
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4215E0_HOST_VA <
                  (uint32_t)ISAAC_FRAME_OPAQUE_4215E0_END_VA,
              "4215e0 body ret follows entry");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4215E0_NEXT_VA -
                      (uint32_t)ISAAC_FRAME_OPAQUE_4215E0_END_VA ==
                  0x7,
              "ret @ 0x421611 then int3 pad (0x421614..0x421617) to 0x421618");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4215E0_COPY_SSO_HI == 0x10u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4215E0_COPY_SSO_LO == 0x08u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4215E0_COPY_TOTAL == 0x18u,
              "SSO block copy: 16 B movups + 8 B movq = 0x18 total");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4215E0_SRC_SIZE_OFF == 0x10u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4215E0_SRC_CAP_OFF == 0x14u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4215E0_SRC_DATA_OFF == 0x00u,
              "std::string SSO layout: data +0, size +0x10, cap +0x14");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4215E0_SRC_CAP_EMPTY == 0x0fu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4215E0_RET_ARGS == 8u,
              "steal-reset cap 0xf; ret 8 (2 stack args)");

/* ===========================================================================
 * FUN_00421620 std::string::assign(const char*) + 0x00421680 grow core — ABI v37
 *
 * 0x00421620 (ret, this=ecx, src=[ebp+8]; old_len=[edx+0x10],
 * cap=[edx+0x14]): user-assign wrapper — strlen(src), max-cap gate
 * \`0x7fffffff - old_len < len\` -> throw 0x40ccc0, SSO source decode
 * (cap<0x10 inline : heap [edx]), then the grow core 0x421680. 18 direct
 * E8 callers (0x687b0c..0x689ec7).
 * 0x00421680 (ret 0x18, this=ecx): request = existing-len + add-len;
 * growth: request <= 0xf (jbe) -> SSO inline (cap 0xf, no alloc); else
 * cap = request|0xf, clamp 0x7fffffff (jbe), min 0x16 (cmovb); alloc
 * 0x40cf00(cap+1); memcpy x2 via IAT 0xaf05df; NUL at [buf+request].
 * 109 direct E8 callers (0x420e44..0x695d64). Host leaves: alloc
 * 0x40cf00, memcpy IAT 0xaf05df, throw 0x40ccc0.
 * Evidence: section-notes/frame-opaque-v37/.
 * =========================================================================== */

extern "C" int32_t isaac_frame_opaque_421620_max_cap_exceeded(int32_t len,
                                                              uint32_t old_cap) {
  /* VA 0x0042164a..0x00421653: \`mov eax,0x7fffffff; sub eax,ecx(old_cap);
     cmp eax,esi(len); jb 0x421676\` — signed UNSIGNED?? sub then jb is an
     UNSIGNED compare of (0x7fffffff - old_cap) vs len. len is strlen
     (never negative); old_cap u32. throw when (0x7fffffff - old_cap) < len. */
  const uint32_t room = 0x7fffffffu - old_cap;
  return ((len < 0) || (static_cast<uint32_t>(len) > room)) ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_421620_sso_inline_needed(
    uint32_t cap) {
  /* VA 0x00421655: \`cmp [edx+0x14],0x10; jb 0x42165d\` — STRICT jb:
     cap == 0x10 is HEAP, cap < 0x10 is inline. */
  return cap < static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_421620_SSO_CAP)
             ? 1
             : 0;
}

extern "C" int32_t isaac_frame_opaque_421620_growth_needed(
    uint32_t request) {
  /* VA 0x004216ad: \`cmp eax( request),esi(0xf); jbe 0x4216de\` —
     request <= 0xf -> SSO inline (no alloc); > 0xf -> grow. */
  return request > static_cast<uint32_t>(0x0f) ? 1 : 0;
}

extern "C" uint32_t isaac_frame_opaque_421620_grow_cap(uint32_t request) {
  /* VA 0x004216b1..0x004216cc: cap = request|0xf; if cap > 0x7fffffff
     (jbe to 0x4216c5 means cap <= 0x7fffffff continues) cap = 0x7fffffff;
     if cap < 0x16 cmovb cap = 0x16. On the inline arm (request <= 0xf)
     cap stays 0xf. For request > 0xf ONLY:
       c = request | 0xf
       if c < 0x16: c = 0x16
       if c > 0x7fffffff: c = 0x7fffffff
     The PE order is: or -> compare 0x7fffffff (clamp first) -> then
     cmovb min 0x16 — a request that already clamps is never < 0x16.
     Return the final cap. */
  if (request <= 0x0fu) {
    return 0x0fu;
  }
  uint32_t cap = request | 0x0fu;
  if (cap > static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_421620_MAX_CAP)) {
    cap = static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_421620_MAX_CAP);
  }
  if (cap < static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_421620_MIN_GROW)) {
    cap = static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_421620_MIN_GROW);
  }
  return cap;
}

extern "C" uint32_t isaac_frame_opaque_421620_src_len_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_421620_SRC_LEN_OFF);
}

extern "C" uint32_t isaac_frame_opaque_421620_src_cap_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_421620_SRC_CAP_OFF);
}

extern "C" uint32_t isaac_frame_opaque_421620_src_data_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_421620_SRC_DATA_OFF);
}

extern "C" uint32_t isaac_frame_opaque_421620_alloc_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_421620_ALLOC_VA);
}

extern "C" uint32_t isaac_frame_opaque_421620_memcpy_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_421620_MEMCPY_IAT_VA);
}

extern "C" uint32_t isaac_frame_opaque_421620_throw_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_421620_THROW_VA);
}

extern "C" uint32_t isaac_frame_opaque_421620_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_421620_HOST_VA);
}

extern "C" uint32_t isaac_frame_opaque_421620_end_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_421620_END_VA);
}

extern "C" uint32_t isaac_frame_opaque_421680_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_421680_HOST_VA);
}

extern "C" uint32_t isaac_frame_opaque_421680_end_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_421680_END_VA);
}

extern "C" uint32_t isaac_frame_opaque_421680_next_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_421680_NEXT_VA);
}

/* Layout invariants recovered from the PE bodies. */
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_421620_HOST_VA <
                  (uint32_t)ISAAC_FRAME_OPAQUE_421620_END_VA,
              "421620 wrapper ret follows entry");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_421680_HOST_VA <
                  (uint32_t)ISAAC_FRAME_OPAQUE_421680_END_VA,
              "421680 grow core ret follows entry");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_421680_NEXT_VA -
                      (uint32_t)ISAAC_FRAME_OPAQUE_421680_END_VA ==
                  0xe,
              "ret @ 0x421712 then int3 pad (0x421715..0x42171f) to 0x421720");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_421620_SSO_CAP == 0x10u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_421620_MIN_GROW == 0x16u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_421620_MAX_CAP == 0x7fffffffu,
              "string growth constants (SSO 0x10 / min 0x16 / max 0x7fffffff)");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_421620_SRC_LEN_OFF == 0x10u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_421620_SRC_CAP_OFF == 0x14u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_421620_SRC_DATA_OFF == 0x00u,
              "src std::string layout: data +0, size +0x10, cap +0x14");

/* ===========================================================================
 * FUN_00421720 bitset membership test (+0x8ac/+0x8bc bitmap pair) — ABI v38
 *
 * Body VA 0x00421720..0x00421767, ret 4 (this in ecx, id = [ebp+8]),
 * plain prologue; no exact ZHL. 6 direct E8 callers (0x422b19..0x422cb8).
 * FULLY PURE (zero calls, zero stores).
 * Recovered structure (PE VAs in each comment):
 *   idx = (id >> 5) * 4        (0x421734 shr edx,5; 0x42173a shl edx,2)
 *   bit = 1 << (id & 0x1f)     (0x421737 and ecx,0x1f; 0x421743 shl esi,cl)
 *   hit = ([+0x8ac+idx] & bit) | ([+0x8bc+idx] & bit)
 *   al = hit ? 1 : 0
 * Receiver layout matches the v30 421b50 contract. Exported laws pure.
 * NARROWED not removed. NEXT_VA 0x00421770.
 * Evidence: section-notes/frame-opaque-v38/.
 * =========================================================================== */

extern "C" uint32_t isaac_frame_opaque_421720_word_off(uint32_t id) {
  /* VA 0x00421734..0x0042173a: \`shr edx,5; shl edx,2\` = (id>>5)*4 —
     dword index into the bitmap array (wrap-free: id>>5 then *4). */
  return (id >> 5u) << 2u;
}

extern "C" uint32_t isaac_frame_opaque_421720_bit_mask(uint32_t id) {
  /* VA 0x00421737..0x00421743: \`and ecx,0x1f; shl esi,cl\` with
     esi=1 — bit = 1 << (id & 0x1f). */
  return 1u << (id & 0x1fu);
}

extern "C" int32_t isaac_frame_opaque_421720_membership(uint32_t word_a,
                                                        uint32_t word_b,
                                                        uint32_t bit_mask) {
  /* VA 0x00421745..0x00421754: test each bitmap word against the mask;
     either set -> al=1. */
  return (((word_a & bit_mask) != 0u) || ((word_b & bit_mask) != 0u)) ? 1
                                                                      : 0;
}

extern "C" uint32_t isaac_frame_opaque_421720_bitmap_a_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_421720_BITMAP_A_OFF);
}

extern "C" uint32_t isaac_frame_opaque_421720_bitmap_b_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_421720_BITMAP_B_OFF);
}

extern "C" uint32_t isaac_frame_opaque_421720_word_shift(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_421720_WORD_SHIFT);
}

extern "C" uint32_t isaac_frame_opaque_421720_bit_mask_const(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_421720_BIT_MASK);
}

extern "C" uint32_t isaac_frame_opaque_421720_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_421720_HOST_VA);
}

extern "C" uint32_t isaac_frame_opaque_421720_end_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_421720_END_VA);
}

extern "C" uint32_t isaac_frame_opaque_421720_next_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_421720_NEXT_VA);
}

/* Layout invariants recovered from the PE body. */
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_421720_HOST_VA <
                  (uint32_t)ISAAC_FRAME_OPAQUE_421720_END_VA,
              "421720 body ret follows entry");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_421720_NEXT_VA -
                      (uint32_t)ISAAC_FRAME_OPAQUE_421720_END_VA ==
                  0x9,
              "ret @ 0x421767 then int3 pad (0x42176a..0x42176f) to 0x421770");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_421720_BITMAP_A_OFF == 0x8acu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_421720_BITMAP_B_OFF == 0x8bcu,
              "bitmap pair offsets match the v30 421b50 contract");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_421720_WORD_SHIFT == 5u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_421720_BIT_MASK == 0x1fu,
              "word index id>>5 and bit mask id&0x1f");

/* ===========================================================================
 * FUN_00421770 / 00421780 / 00421790 getters + 004217a0 bitset-set — ABI v39
 *
 * 0x00421770 field getter [this+0x26584] (37 callers); 0x00421780 /
 * 0x00421790 Game pointer adders (+0x26630 / +0x18910 over [0xc71678]);
 * 0x004217a0 64-bit bitmap membership (29 callers) with BTS mod-32 wrap.
 * Exported laws pure. NARROWED not removed. NEXT 0x4217f3.
 * Evidence: section-notes/frame-opaque-v39/.
 * =========================================================================== */

extern "C" uint32_t isaac_frame_opaque_421770_field_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_421770_FIELD_OFF);
}

extern "C" uint32_t isaac_frame_opaque_421770_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_421770_HOST_VA);
}

extern "C" uint32_t isaac_frame_opaque_421770_end_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_421770_END_VA);
}

extern "C" uint32_t isaac_frame_opaque_421780_game_add(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_421780_GAME_ADD);
}

extern "C" uint32_t isaac_frame_opaque_421780_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_421780_HOST_VA);
}

extern "C" uint32_t isaac_frame_opaque_421780_end_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_421780_END_VA);
}

extern "C" uint32_t isaac_frame_opaque_421790_game_add(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_421790_GAME_ADD);
}

extern "C" uint32_t isaac_frame_opaque_421790_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_421790_HOST_VA);
}

extern "C" uint32_t isaac_frame_opaque_421790_end_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_421790_END_VA);
}

extern "C" int32_t isaac_frame_opaque_4217a0_clamp_id(int32_t id) {
  /* VA 0x004217b5..0x004217bc: test eax,eax; cmovle eax,ecx(0);
     cmp eax,0x34; cmovl esi,eax — clamp id to [0, 0x34]. */
  if (id < 0) {
    return 0;
  }
  return id > (int32_t)ISAAC_FRAME_OPAQUE_4217A0_MAX_ID
             ? (int32_t)ISAAC_FRAME_OPAQUE_4217A0_MAX_ID
             : id;
}

extern "C" uint32_t isaac_frame_opaque_4217a0_pair_off(uint32_t clamped) {
  /* VA 0x004217d7..0x004217da: shr esi,6 then [edi + esi*8] — pair
     offset = (clamped >> 6) * 8. clamped <= 0x34 so this is 0 in
     practice, but the law is exact. */
  return ((clamped >> 6u) << 3u) & 0xffffffffu;
}

extern "C" uint32_t isaac_frame_opaque_4217a0_lo_bit(uint32_t clamped) {
  /* VA 0x004217c3..0x004217c6: and eax,0x3f; bts edx,eax — the BTS
     index WRAPS MOD 32 (1 << (clamped & 0x1f)); the 0x20..0x3f class
     lands on the SECOND dword of the pair at bit (lo-0x20). */
  return 1u << (clamped & 0x1fu);
}

extern "C" int32_t isaac_frame_opaque_4217a0_lo_is_hi(uint32_t clamped) {
  /* VA 0x004217c9..0x004217cc: cmp eax,0x20; cmovae ecx,edx — lo >=
     0x20 selects the second dword. */
  return (clamped & 0x3fu) >= 0x20u ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_4217a0_membership(uint32_t word_a,
                                                        uint32_t word_b,
                                                        uint32_t lo_bit,
                                                        int32_t lo_is_hi) {
  /* VA 0x004217da..0x004217e1: and edx,[pair]; and ecx,[pair+4]; or —
     hit iff the chosen dword has the bit. lo<0x20 -> word A;
     lo>=0x20 -> word B (lo_bit already mod-32 wrapped). */
  const uint32_t mask = lo_bit & 0xffffffffu;
  const uint32_t a = (lo_is_hi == 0) ? (word_a & mask) : 0u;
  const uint32_t b = (lo_is_hi != 0) ? (word_b & mask) : 0u;
  return ((a | b) != 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_frame_opaque_4217a0_bitmap_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4217A0_BITMAP_OFF);
}

extern "C" uint32_t isaac_frame_opaque_4217a0_max_id(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4217A0_MAX_ID);
}

extern "C" uint32_t isaac_frame_opaque_4217a0_lo_mask(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4217A0_LO_MASK);
}

extern "C" uint32_t isaac_frame_opaque_4217a0_dword_shift(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4217A0_DWORD_SHIFT);
}

extern "C" uint32_t isaac_frame_opaque_4217a0_pair_stride(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4217A0_PAIR_STRIDE);
}

extern "C" uint32_t isaac_frame_opaque_4217a0_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4217A0_HOST_VA);
}

extern "C" uint32_t isaac_frame_opaque_4217a0_end_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4217A0_END_VA);
}

extern "C" uint32_t isaac_frame_opaque_4217a0_next_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4217A0_NEXT_VA);
}

/* Layout invariants recovered from the PE bodies. */
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_421770_HOST_VA <
                  (uint32_t)ISAAC_FRAME_OPAQUE_421770_END_VA,
              "421770 getter ret follows entry");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_421780_HOST_VA <
                  (uint32_t)ISAAC_FRAME_OPAQUE_421780_END_VA,
              "421780 adder ret follows entry");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_421790_HOST_VA <
                  (uint32_t)ISAAC_FRAME_OPAQUE_421790_END_VA,
              "421790 adder ret follows entry");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4217A0_HOST_VA <
                  (uint32_t)ISAAC_FRAME_OPAQUE_4217A0_END_VA,
              "4217a0 bitset ret follows entry");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4217A0_NEXT_VA -
                      (uint32_t)ISAAC_FRAME_OPAQUE_4217A0_END_VA ==
                  0x3,
              "ret @ 0x4217f0 then int3 pad (0x4217f3..0x4217ff)");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4217A0_MAX_ID == 0x34u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4217A0_LO_MASK == 0x3fu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4217A0_PAIR_STRIDE == 0x08u,
              "clamp 0x34 / lo mask 0x3f / 8-byte pair stride");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_421780_GAME_ADD !=
                  (uint32_t)ISAAC_FRAME_OPAQUE_421790_GAME_ADD,
              "the two Game pointer adders have distinct offsets");

/* ===========================================================================
 * FUN_004218e0 delegate-table bitmap constructor — ABI v40
 *
 * 0x004218e0 builds a 0x25-record xorshift(3,13,7) hash chain from the
 * input id into this+0x28 + i*0x3c, then fills the +0x8ac/+0x8bc bitmap
 * arrays (0x423090 BY REFERENCE) and transfers membership bits between
 * them. 8 callers. Exported laws pure scalars.
 * Evidence: section-notes/frame-opaque-v40/.
 * =========================================================================== */

extern "C" uint32_t isaac_frame_opaque_4218e0_hash_step(uint32_t x) {
  /* PE 0x43218e0 0x421944..0x421973 xorshift(3,13,7):
     edx = (x >> 3) ^ x; eax = (edx << 13) ^ edx; x' = (eax >> 7) ^ eax.
     The shift counts are register cl values (3/13/7) reloaded per step
     from the rdata constant words 0xb1f600 / 0xb1f600+4 / 0xb1f608. */
  uint32_t t = (x >> 3u) ^ x;
  t = (t << 13u) ^ t;
  t = (t >> 7u) ^ t;
  return t;
}

extern "C" uint32_t isaac_frame_opaque_4218e0_chain_value(uint32_t id,
                                                          uint32_t i) {
  /* record[i] = hash^i(id): apply hash_step i times to the seed, each
     step feeding the prior output (ESI feedback in the PE loop). The
     i-th record stores the i-th iterate. i is the caller's loop index
     in [0, 0x25). */
  uint32_t x = id;
  for (uint32_t k = 0; k < i; ++k) {
    x = isaac_frame_opaque_4218e0_hash_step(x);
  }
  return x;
}

extern "C" uint32_t isaac_frame_opaque_4218e0_record_count(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4218E0_RECORD_COUNT);
}

extern "C" uint32_t isaac_frame_opaque_4218e0_record_stride(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4218E0_RECORD_STRIDE);
}

extern "C" uint32_t isaac_frame_opaque_4218e0_records_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4218E0_RECORDS_OFF);
}

extern "C" uint32_t isaac_frame_opaque_4218e0_bitmap_a_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4218E0_BITMAP_A_OFF);
}

extern "C" uint32_t isaac_frame_opaque_4218e0_bitmap_b_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4218E0_BITMAP_B_OFF);
}

extern "C" uint32_t isaac_frame_opaque_4218e0_bitmap_count_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4218E0_BITMAP_COUNT_OFF);
}

extern "C" uint32_t isaac_frame_opaque_4218e0_bitmap_count(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4218E0_BITMAP_COUNT);
}

extern "C" uint32_t isaac_frame_opaque_4218e0_fill_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4218E0_FILL_VA);
}

extern "C" int32_t isaac_frame_opaque_4218e0_bit_transfer_a(uint32_t word_a,
                                                            uint32_t bit) {
  /* PE 0x4219d8..0x4219f6: btr edx,ebx (test bit, clear it); if the bit
     WAS set (test edx, eax -> je 0x4219fd), B gets it (bts -> 1).
     transfer_a returns 1 if A had the bit (so B must set it). */
  return ((word_a & bit) != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_4218e0_bit_transfer_b(uint32_t word_b,
                                                            uint32_t bit) {
  /* PE 0x4219f8 / 0x4219fd: when A had the bit, B[word] |= bit (bts,
     returns 1); else B[word] &= ~bit (btr, returns 0). */
  return ((word_b & bit) != 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_frame_opaque_4218e0_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4218E0_HOST_VA);
}

/* Layout invariants recovered from the PE body. */
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4218E0_RECORD_COUNT == 0x25u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4218E0_RECORD_STRIDE == 0x3cu,
              "0x25 records at stride 0x3c");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4218E0_BITMAP_A_OFF == 0x8acu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4218E0_BITMAP_B_OFF == 0x8bcu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4218E0_BITMAP_COUNT_OFF == 0x8b8u,
              "bitmap pair + count match the shared 421b50/421720 contract");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4218E0_BITMAP_COUNT == 0x68u,
              "bitmap count 0x68");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4218E0_SHIFT_1 == 3u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4218E0_SHIFT_2 == 13u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4218E0_SHIFT_3 == 7u,
              "xorshift(3,13,7) hash mix");

/* ===========================================================================
 * FUN_004218e0 tail — Fisher-Yates delegate-table shuffle — ABI v41
 *
 * The shuffle loop (0x421a50..0x421b43) of the v40 constructor: per
 * 0x3c-stride collection, if non-empty (begin != end), init the PRNG
 * with the seed ([group+0x10]) and Fisher-Yates the records by PRNG %
 * count with 0x14-byte slice swaps. PRNG (0x8fd3c0/0x8fd410) stays host;
 * the exported laws are pure scalar math on the PRNG word + indices.
 * Evidence: section-notes/frame-opaque-v41/.
 * =========================================================================== */

extern "C" int32_t isaac_frame_opaque_shuffle_count(int32_t span) {
  /* PE 0x421a73..0x421a85: \`mov eax,0x66666667; sub ecx,[ebx];
     imul ecx; sar edx,3; mov esi,edx; shr esi,0x1f; dec esi; add
     esi,edx\` — signed magic division by 5 (C-truncation), i.e.
     floor((end-begin)/5) with the signed fixup. */
  /* Exact 32-bit-register transcription (verified against an
     independent python transcription over 500k draws, 0 mismatches):
     imul edx:eax; edx = hi 32 of the SIGNED 64 product; sar edx,3 on
     that 32-bit register; mov esi,edx; shr esi,0x1f; dec esi; add. */
  const int64_t prod =
      static_cast<int64_t>(span) * static_cast<int64_t>(0x66666667LL);
  const uint32_t hi = static_cast<uint32_t>(
      static_cast<uint64_t>(prod >> 32) & 0xffffffffull);
  uint32_t a;
  if ((hi & 0x80000000u) != 0u) {
    a = (hi >> 3u) | 0xe0000000u; /* sar 3 (arithmetic) on 32 bits */
  } else {
    a = hi >> 3u;
  }
  const uint32_t esi = (a >> 31u) - 1u; /* shr 0x1f; dec esi */
  return static_cast<int32_t>(esi + a); /* add esi,edx(a) */
  /* note: the result is what the PE really computes — NOT a simple
     signed /5; the 32-bit-high quantization shows as a 0/1 variance
     vs any closed-form division for large spans. Pinned as-is. */
}

extern "C" uint32_t isaac_frame_opaque_shuffle_slot_off(uint32_t idx) {
  /* PE 0x421abf: \`lea eax,[edx+edx*4]; ... [ecx+eax*4]\` = idx*5*4
     = idx*0x14 (the record stride). */
  return idx * static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_SHUFFLE_RECORD_SIZE);
}

extern "C" uint32_t isaac_frame_opaque_shuffle_word_to_index(uint32_t word,
                                                             uint32_t divisor) {
  /* PE 0x421aab..0x421ab1: \`xor edx,edx; test ebx,ebx; je; div ebx\`
     — j = word % divisor, UNSIGNED (edx pre-zeroed), divisor==0 guard ->
     keep the word (remainder 0). In the shuffle loop the divisor is the
     CURRENT step's ebx = esi+1 (\`lea ebx,[esi+1]\` @0x421a95, dec ebx
     @0x421b04) and descends count+1, count, ..., 2 per iteration. */
  if (divisor == 0u) {
    return 0u;
  }
  return word % divisor;
}

extern "C" int32_t isaac_frame_opaque_shuffle_needs_swap(uint32_t idx,
                                                          uint32_t j) {
  /* PE 0x421ab3..0x421ab5: \`cmp esi,edx; je skip-swap\` — when
     j == idx the slice swap is skipped (self-swap). */
  return idx != j ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_shuffle_collection_nonempty(
    uint32_t begin, uint32_t end) {
  /* PE 0x421a50..0x421a55: \`mov eax,[ebx]; cmp eax,[ebx+4]; je
     skip\` — begin != end (non-empty vector) enters the shuffle. */
  return begin != end ? 1 : 0;
}

extern "C" uint32_t isaac_frame_opaque_shuffle_collection_stride(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_SHUFFLE_COLLECTION_STRIDE);
}

extern "C" uint32_t isaac_frame_opaque_shuffle_record_size(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_SHUFFLE_RECORD_SIZE);
}

extern "C" uint32_t isaac_frame_opaque_shuffle_prng_init_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_SHUFFLE_PRNG_INIT_VA);
}

extern "C" uint32_t isaac_frame_opaque_shuffle_prng_next_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_SHUFFLE_PRNG_NEXT_VA);
}

extern "C" uint32_t isaac_frame_opaque_shuffle_prng_bound(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_SHUFFLE_PRNG_BOUND);
}

extern "C" uint32_t isaac_frame_opaque_shuffle_loop_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_SHUFFLE_LOOP_VA);
}

extern "C" uint32_t isaac_frame_opaque_shuffle_end_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_SHUFFLE_END_VA);
}

/* Layout invariants recovered from the PE body. */
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_SHUFFLE_COLLECTION_STRIDE == 0x3cu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_SHUFFLE_RECORD_SIZE == 0x14u,
              "0x3c collection stride / 0x14 record size (5*4)");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_SHUFFLE_MAGIC == 0x66666667u,
              "the /5 magic division constant");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_SHUFFLE_PRNG_BOUND == 0x270u,
              "PRNG next() output bound (0x270)");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_SHUFFLE_LOOP_VA <
                  (uint32_t)ISAAC_FRAME_OPAQUE_SHUFFLE_END_VA,
              "shuffle loop body ret follows entry");

/* ===========================================================================
 * FUN_004253b0 / 004253c0 / 004253d0 — pure id-vector getter/walk trio
 * (ABI v42). The three tiny bodies sit between the 4257b0 gates and the
 * Pass B player scans; all are FULLY PURE (zero calls, zero stores).
 *
 *   0x004253b0 (14 E8 callers): mov eax,[ecx+0x13c0]; ret — the player
 *     char field getter (4257B0_PLAYER_CHAR_OFF).
 *   0x004253c0 (1 E8 caller): mov eax,[0xc7169c]; add eax,0x4a920; ret —
 *     manager global + 0x4a920 (32-bit wrap add).
 *   0x004253d0 (24 E8 callers): walk Game+0x1baa8 id-vector (pointer
 *     array, stride 4): count = (end-begin)>>2 ARITHMETIC; for each
 *     elem [ptr], match [elem+0x1618] == key([this+0xc]); first match
 *     wins -> return elem ptr; miss/count0 -> 0. PE loop bound is
 *     UNSIGNED (jb); the count0 gate is test esi,esi; je (exact zero).
 *
 * Evidence: section-notes/frame-opaque-v42/.
 * =========================================================================== */

extern "C" uint32_t isaac_frame_opaque_4253b0_char_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4253B0_CHAR_OFF);
}

extern "C" uint32_t isaac_frame_opaque_4253b0_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4253B0_VA);
}

extern "C" uint32_t isaac_frame_opaque_4253b0_end_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4253B0_END_VA);
}

extern "C" uint32_t isaac_frame_opaque_4253c0_manager_add(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4253C0_MANAGER_ADD);
}

extern "C" uint32_t isaac_frame_opaque_4253c0_add_result(uint32_t manager_ptr) {
  /* PE 0x4253c5: add eax,0x4a920 — 32-bit wrap add over the manager
     global value read from [0xc7169c]. */
  return manager_ptr + static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4253C0_MANAGER_ADD);
}

extern "C" uint32_t isaac_frame_opaque_4253c0_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4253C0_VA);
}

extern "C" uint32_t isaac_frame_opaque_4253c0_end_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4253C0_END_VA);
}

extern "C" uint32_t isaac_frame_opaque_4253d0_vec_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4253D0_ID_VEC_OFF);
}

extern "C" uint32_t isaac_frame_opaque_4253d0_vec_end_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4253D0_ID_VEC_END_OFF);
}

extern "C" uint32_t isaac_frame_opaque_4253d0_key_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4253D0_KEY_OFF);
}

extern "C" uint32_t isaac_frame_opaque_4253d0_elem_id_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4253D0_ELEM_ID_OFF);
}

extern "C" int32_t isaac_frame_opaque_4253d0_count(uint32_t end, uint32_t begin) {
  /* PE 0x4253e9..0x4253eb: sub esi,eax; sar esi,2 — the span is the
     32-bit wrapping delta and the shift is ARITHMETIC (signed). */
  return static_cast<int32_t>(end - begin) >> 2;
}

extern "C" int32_t isaac_frame_opaque_4253d0_in_range(uint32_t idx,
                                                       uint32_t count) {
  /* PE 0x425400 cmp edx,esi; 0x425402 jb — UNSIGNED loop bound. */
  return idx < count ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_4253d0_match(uint32_t elem_id,
                                                    uint32_t key) {
  /* PE 0x4253f4 cmp [ecx+0x1618],edi; 0x4253fa je — FULL dword equality
     on the element's +0x1618 player id vs the entry's +0xc key. */
  return elem_id == key ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_4253d0_first_match_index(
    const uint32_t* elem_ids, uint32_t count, uint32_t key) {
  if (elem_ids == nullptr) {
    return -1;
  }
  /* PE 0x4253ee test esi,esi; je — exact-zero count gate; the walk
     bound is the unsigned jb. First match wins (je @ 0x4253fa). */
  for (uint32_t i = 0; i < count; ++i) {
    if (elem_ids[i] == key) {
      return static_cast<int32_t>(i);
    }
  }
  return -1;
}

extern "C" uint32_t isaac_frame_opaque_4253d0_result(const uint32_t* elems,
                                                      uint32_t count,
                                                      int32_t match_index) {
  if (elems == nullptr || match_index < 0 ||
      static_cast<uint32_t>(match_index) >= count) {
    return 0u;
  }
  /* PE 0x425409: mov eax,ecx — the walk returns the matched ELEMENT
     pointer (the deref of the id-vector slot), not the slot itself. */
  return elems[static_cast<uint32_t>(match_index)];
}

extern "C" uint32_t isaac_frame_opaque_4253d0_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4253D0_VA);
}

extern "C" uint32_t isaac_frame_opaque_4253d0_end_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4253D0_END_VA);
}

/* Layout invariants recovered from the PE bodies. */
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4253B0_VA <
                  (uint32_t)ISAAC_FRAME_OPAQUE_4253B0_END_VA,
              "4253b0 getter ret follows entry");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4253C0_VA <
                  (uint32_t)ISAAC_FRAME_OPAQUE_4253C0_END_VA,
              "4253c0 adder ret follows entry");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4253D0_VA <
                  (uint32_t)ISAAC_FRAME_OPAQUE_4253D0_END_VA,
              "4253d0 walk ret follows entry");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4253D0_ID_VEC_OFF == 0x1baa8u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4253D0_KEY_OFF == 0xcu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4253D0_ELEM_ID_OFF == 0x1618u,
              "id-vector walk contract: Game+0x1baa8, key +0xc, id +0x1618");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4253B0_CHAR_OFF == 0x13c0u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4253C0_MANAGER_ADD == 0x4a920u,
              "getter char offset 0x13c0 / manager add 0x4a920");

/* ===========================================================================
 * ABI v43: FUN_00421800 / 00424530 / 00423950 / 00423960 / 00423970 pure
 * getter/gate band + FUN_00425430 narrowed copy-constructor.
 *
 *  0x00421800 (47 E8 callers): lea eax,[ecx+0x14]; ret — pointer-field
 *     getter (pure add, NO memory read).
 *  0x00424530 (184 E8 callers): mov eax,ecx; ret — identity.
 *  0x00423950 (3 E8 callers): mov eax,[ecx+0x1618]; ret — player-id
 *     getter (same +0x1618 field as the 4253d0 walk's ELEM_ID_OFF).
 *  0x00423960 (3 E8 callers): mov eax,[ecx+0x4b3d8]; cmp eax,
 *     [ecx+0x4b3dc]; setne al; ret — MP-vec nonempty. eax returns the
 *     BEGIN value with only al overlaid by the != flag (LOW-BYTE law).
 *  0x00423970 (2 E8 callers): mov eax,[ecx+0x378]; test eax,eax; je
 *     DEADBEEF; mov eax,[eax+0xc]; ret — RTTI subobject (+0x378, same
 *     as RTTI_FIELD_378_OFF) entry getter (+0xc, MP_ENTRY_ID_OFF);
 *     null subobject -> 0xdeadbeef.
 *  0x00425430 (1 E8 caller 0x6f365d): SEH+GS copy-constructor. Pure
 *     parts: copy prologue+loop (k = 0..0x15, dword [base+0x34k+4] =
 *     [base+0x34k] — src/dst dwords never overlap, forward order
 *     irrelevant), byte-zero store [this+0x450] = dl (dl is the
 *     post-countdown edx = 0), and the 0xaef638 init-call contract
 *     (cdecl args dest=this+0xc, elem 0x34, count 0x15, cookie
 *     0x425410). HOST remains: call 0xaef638 (runtime array-init
 *     helper) + call 0x4265d0 (subobject init). NARROWED.
 * ======================================================================== */

extern "C" uint32_t isaac_frame_opaque_421800_field_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_421800_FIELD_OFF);
}

extern "C" uint32_t isaac_frame_opaque_421800_result(uint32_t obj) {
  /* PE 0x421800: lea eax,[ecx+0x14] — 32-bit wrap add, no deref. */
  return obj + static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_421800_FIELD_OFF);
}

extern "C" uint32_t isaac_frame_opaque_421800_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_421800_VA);
}

extern "C" uint32_t isaac_frame_opaque_421800_end_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_421800_END_VA);
}

extern "C" uint32_t isaac_frame_opaque_424530_identity(uint32_t obj) {
  /* PE 0x424530: mov eax,ecx — identity. */
  return obj;
}

extern "C" uint32_t isaac_frame_opaque_424530_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424530_VA);
}

extern "C" uint32_t isaac_frame_opaque_424530_end_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424530_END_VA);
}

extern "C" uint32_t isaac_frame_opaque_423950_id_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_PLAYER_ID_OFF);
}

extern "C" uint32_t isaac_frame_opaque_423950_read_id(uint32_t obj) {
  /* PE 0x423950: mov eax,[ecx+0x1618] — full dword read of the
     +0x1618 player id (PLAYER_ID_OFF). */
  return *reinterpret_cast<const uint32_t*>(
      obj + static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_PLAYER_ID_OFF));
}

extern "C" uint32_t isaac_frame_opaque_423950_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_423950_VA);
}

extern "C" uint32_t isaac_frame_opaque_423950_end_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_423950_END_VA);
}

extern "C" uint32_t isaac_frame_opaque_423960_vec_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_423960_VEC_OFF);
}

extern "C" uint32_t isaac_frame_opaque_423960_vec_end_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_423960_VEC_END_OFF);
}

extern "C" uint32_t isaac_frame_opaque_423960_result(uint32_t begin,
                                                     uint32_t end) {
  /* PE 0x423960..0x42396f: mov eax,[ecx+0x4b3d8]; cmp eax,
     [ecx+0x4b3dc]; setne al; ret. eax is the BEGIN dword; ONLY al is
     replaced by the != flag — the upper 24 bits of begin survive
     (LOW-BYTE overlay, not a zero-extended bool). */
  const uint32_t flag = begin != end ? 1u : 0u;
  return (begin & 0xffffff00u) | flag;
}

extern "C" uint32_t isaac_frame_opaque_423960_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_423960_VA);
}

extern "C" uint32_t isaac_frame_opaque_423960_end_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_423960_END_VA);
}

extern "C" uint32_t isaac_frame_opaque_423970_rtti_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_423970_RTTI_OFF);
}

extern "C" uint32_t isaac_frame_opaque_423970_entry_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_423970_ENTRY_OFF);
}

extern "C" uint32_t isaac_frame_opaque_423970_null_marker(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_423970_NULL_MARKER);
}

extern "C" uint32_t isaac_frame_opaque_423970_result(uint32_t subobj) {
  /* PE 0x423970..0x423983: mov eax,[ecx+0x378]; test eax,eax; je
     DEADBEEF; mov eax,[eax+0xc]; ret. Null subobject -> 0xdeadbeef
     (NOT 0); else full dword [subobj+0xc]. */
  if (subobj == 0u) {
    return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_423970_NULL_MARKER);
  }
  return *reinterpret_cast<const uint32_t*>(
      subobj + static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_423970_ENTRY_OFF));
}

extern "C" uint32_t isaac_frame_opaque_423970_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_423970_VA);
}

extern "C" uint32_t isaac_frame_opaque_423970_end_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_423970_END_VA);
}

extern "C" uint32_t isaac_frame_opaque_425430_array_count(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425430_COUNT);
}

extern "C" uint32_t isaac_frame_opaque_425430_elem_stride(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425430_STRIDE);
}

extern "C" uint32_t isaac_frame_opaque_425430_copy_src_off(uint32_t k) {
  /* PE loop iteration k reads dword at base + 0x34k (k = 0..0x15;
     k=0 is the prologue mov eax,[esi]). 32-bit wrap multiply. */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425430_STRIDE) * k;
}

extern "C" uint32_t isaac_frame_opaque_425430_copy_dst_off(uint32_t k) {
  /* PE writes dword at base + 0x34k + 4 (lea eax,[eax+0x34]; mov
     [eax-0x30],ecx; prologue mov [esi+4],eax). */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425430_STRIDE) * k +
         static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425430_COPY_SHIFT);
}

extern "C" void isaac_frame_opaque_425430_copy_apply(uint32_t base) {
  /* Prologue (k=0) + loop (k=1..0x15): 22 independent dword copies
     [base+0x34k+4] = [base+0x34k]. src(k) = 0x34k, dst(k) = 0x34k+4:
     every dst is strictly below the NEXT src and above the previous
     dst, so the forward order reads pristine memory. */
  const uint32_t stride = static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425430_STRIDE);
  const uint32_t shift = static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425430_COPY_SHIFT);
  for (uint32_t k = 0; k <= static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425430_COUNT);
       ++k) {
    const uint32_t src_off = stride * k;
    uint32_t* dst = reinterpret_cast<uint32_t*>(base + src_off + shift);
    const uint32_t* src = reinterpret_cast<const uint32_t*>(base + src_off);
    *dst = *src;
  }
}

extern "C" uint32_t isaac_frame_opaque_425430_zero_byte_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425430_ZERO_BYTE_OFF);
}

extern "C" uint32_t isaac_frame_opaque_425430_zero_value(void) {
  /* PE 0x42547b: mov byte [esi+0x450],dl — dl is edx AFTER the
     countdown loop (0x15 -> 0), so the byte store is 0. */
  return 0u;
}

extern "C" uint32_t isaac_frame_opaque_425430_init_dest_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425430_INIT_DEST_OFF);
}

extern "C" uint32_t isaac_frame_opaque_425430_init_cookie(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425430_INIT_COOKIE);
}

extern "C" uint32_t isaac_frame_opaque_425430_helper_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425430_HELPER_VA);
}

extern "C" uint32_t isaac_frame_opaque_425430_sub_call_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425430_SUB_CALL_VA);
}

extern "C" uint32_t isaac_frame_opaque_425430_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425430_VA);
}

extern "C" uint32_t isaac_frame_opaque_425430_end_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_425430_END_VA);
}

/* ---- ABI v44: FUN_004254b0 narrowed frame-opaque filter (2 callers
   0x90cffc / 0x8ca67c; this = Game+0x1bbe0). Memory host-owned: the MP
   vec (manager+0x4b3d8), this->vec (stride 0x68), the 21-row table
   (this+0x28, stride 0x34), the scratch pair container, and the
   0x4267f0 / 0xaf08bd / 0xaef15c / invalid_parameter host leaves stay
   host. Scalar decision laws exported below. ---- */

extern "C" int32_t isaac_frame_opaque_4254b0_pass_a_gate(uint32_t mp_begin,
                                                         uint32_t mp_end) {
  /* PE @0x4254ec: mov eax,[ecx]; cmp eax,[ecx+4]; je 0x425580 — the
     whole Pass A (trailing pop) is skipped when the MP vector is
     empty. POINTER-EQUALITY gate, not a count. */
  return (mp_begin != mp_end) ? 1 : 0;
}

extern "C" uint32_t isaac_frame_opaque_4254b0_range_count(uint32_t begin,
                                                          uint32_t end) {
  /* PE @0x425503 / 0x42555c (and the Pass-B recount @0x4255d1):
     mov ecx,esi; sub ecx,edi (32-bit wrapping delta)
     imul ecx — SIGNED widening, eax = 0x4ec4ec4f
     sar edx,5 — arithmetic shift of the high dword
     mov eax,edx; shr eax,0x1f; add eax,edx — quotient (/0x68). */
  const uint32_t delta = end - begin;
  const int64_t prod =
      (int64_t)(int32_t)delta *
      (int64_t)(int32_t)ISAAC_FRAME_OPAQUE_4254B0_DIV_MAGIC;
  int32_t high = (int32_t)((uint64_t)prod >> 32);
  high >>= ISAAC_FRAME_OPAQUE_4254B0_DIV_SHIFT; /* C++20: arithmetic */
  return (uint32_t)high + (((uint32_t)high) >> 31);
}

extern "C" uint32_t isaac_frame_opaque_4254b0_trailing_pop_count(
    uint32_t start_count, const uint32_t* gate_flags, uint32_t flags_len) {
  /* Pass-A walk @0x425511..0x42557b. c starts as the range_count of
     this->vec. For j = 0,1,2,... the element at position
     (start_count-1-j) is examined; gate_flags[j] != 0 keeps it,
     == 0 pops it (c -= 1, mirroring this->end -= 0x68). Machine exit
     conditions, in order, every iteration:
       - c <= 4 (cmp eax,4; jbe @0x425514 / @0x42556d)
       - walk bound (dec ebx; cmp ebx,eax; jb @0x42557b): continue
         only while (start_count-1-j) < c (UNSIGNED); the element
         before begin (start_count-1-j == -1) is never examined.
     flags beyond flags_len (or a null flags array) read as 0 -> pop. */
  uint32_t c = start_count;
  uint32_t j = 0;
  for (;;) {
    if (c <= (uint32_t)ISAAC_FRAME_OPAQUE_4254B0_TRAILING_MIN_COUNT) {
      break; /* jbe — before the gate (entry) and after the pop */
    }
    if (j >= flags_len || gate_flags[j] == 0u) {
      c = c - 1u; /* gate == 0 -> pop the last element */
    }
    j = j + 1u; /* dec ebx */
    if ((start_count - 1u - j) >= c) {
      break; /* jb: continue only while count-1-j < c (unsigned) */
    }
  }
  return c;
}

extern "C" int32_t isaac_frame_opaque_4254b0_cvttss2si(uint32_t bits) {
  /* PE cvttss2si eax, dword ptr [ecx+0xc]: convert float toward zero.
     NaN / +-Inf / out-of-range saturate to INT32_MIN (0x80000000). */
  const float f = __builtin_bit_cast(float, bits);
  if (f != f || f >= 2147483648.0f || f < -2147483648.0f) {
    return INT32_MIN;
  }
  return static_cast<int32_t>(f);
}

extern "C" int32_t isaac_frame_opaque_4254b0_row_skip(uint32_t kind) {
  /* PE @0x4255b8: cmp dword ptr [edi-4], 0x16; je 0x425750 — FULL-DWORD
     compare gating the whole row (not a byte gate). */
  return (kind == (uint32_t)ISAAC_FRAME_OPAQUE_4254B0_ROW_SKIP_KIND) ? 1 : 0;
}

extern "C" uint32_t isaac_frame_opaque_4254b0_row_xmm1(uint32_t b1) {
  /* PE @0x4255a0: cmp byte ptr [edi+1], 0; je -> movss xmm1,
     dword ptr [0xbaacbc] (0x4f000000 = 2147483648.0f) — else
     xorps xmm1,xmm1. LOW-BYTE zero test (wide drives masked). */
  return ((b1 & 0xffu) == 0u)
             ? (uint32_t)ISAAC_FRAME_OPAQUE_4254B0_XMM1_DEFAULT_BITS
             : 0u;
}

/* Pass-B float compare helpers — exact comiss/ucomiss flag semantics.
   comiss a,b; jb: ordered less (NaN never jumps). comiss ja: ordered
   greater. ucomiss a,b; lahf; test ah,0x44; jp: unordered (either
   operand NaN -> ZF|PF parity). */
static int32_t frame_opaque_4254b0_f_lt(uint32_t a_bits, uint32_t b_bits) {
  const float a = __builtin_bit_cast(float, a_bits);
  const float b = __builtin_bit_cast(float, b_bits);
  return (a < b) ? 1 : 0;
}
static int32_t frame_opaque_4254b0_f_gt(uint32_t a_bits, uint32_t b_bits) {
  const float a = __builtin_bit_cast(float, a_bits);
  const float b = __builtin_bit_cast(float, b_bits);
  return (a > b) ? 1 : 0;
}
static int32_t frame_opaque_4254b0_f_unordered(uint32_t a_bits,
                                               uint32_t b_bits) {
  const float a = __builtin_bit_cast(float, a_bits);
  const float b = __builtin_bit_cast(float, b_bits);
  return (a != a || b != b) ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_4254b0_elem_filter(
    uint32_t b0, uint32_t b1, uint32_t f_row_bits, int32_t d_row,
    uint32_t f_elem_bits, uint32_t prev_f_bits) {
  /* Pass-B per-element decision @0x4255f0..0x4256dc. Transcribed
     branch-by-branch from the machine (both b1 directions):
       rejects: comiss f,f_row jb / comiss f,prev_f jb (direction
         flips when b1==0: f_row<f / prev_f<f) and the SIGNED
         cmp trunc,[row+8] jl.
       reset cursor to out_list: ordered (f > prev_f) when b1!=0,
         ordered (prev_f > f) when b1==0, OR ordered && b0==0
         (that arm ends in NO_COPY — the reset still lands).
       NaN (ucomiss jp): straight to COPYCHECK (never NO_COPY, never
         reset).
       b0==0 ordered: ACCEPT_NO_COPY (cursor := out_list).
     Returns: 0=REJECT (cursor, prev_f unchanged), 1=NO_COPY
     (cursor := out_list; prev_f := f), 2=COPY (cursor += 8; prev_f
     := f), 3=COPY_RESET (cursor := out_list, then +8; prev_f := f).
     b0/b1 are LOW-BYTE gates (u32 params re-narrowed in-body). */
  const uint32_t b0b = b0 & 0xffu;
  const uint32_t b1b = b1 & 0xffu;
  const int32_t trunc = isaac_frame_opaque_4254b0_cvttss2si(f_elem_bits);
  int32_t reset = 0;
  if (b1b != 0u) {
    /* path A @0x4255f4 (je @0x4255f0 skips to path B) */
    if (frame_opaque_4254b0_f_lt(f_elem_bits, f_row_bits) != 0) {
      return ISAAC_FRAME_OPAQUE_4254B0_FILTER_REJECT;
    }
    if (frame_opaque_4254b0_f_lt(f_elem_bits, prev_f_bits) != 0) {
      return ISAAC_FRAME_OPAQUE_4254B0_FILTER_REJECT;
    }
    if (trunc < d_row) { /* cmp eax,[edi+8]; jl — signed */
      return ISAAC_FRAME_OPAQUE_4254B0_FILTER_REJECT;
    }
    if (frame_opaque_4254b0_f_gt(f_elem_bits, prev_f_bits) != 0) {
      reset = 1; /* comiss ja @0x42562f -> 0x42563f */
    } else if (frame_opaque_4254b0_f_unordered(f_elem_bits,
                                               prev_f_bits) == 0) {
      /* ucomiss jp @0x425638 skips the b0 reset */
      if (b0b == 0u) {
        reset = 1;
      }
    }
    /* U1B @0x425645 */
    if (frame_opaque_4254b0_f_unordered(f_elem_bits, prev_f_bits) != 0) {
      return reset ? ISAAC_FRAME_OPAQUE_4254B0_FILTER_COPY_RESET
                   : ISAAC_FRAME_OPAQUE_4254B0_FILTER_COPY;
    }
    if (b0b == 0u) {
      return ISAAC_FRAME_OPAQUE_4254B0_FILTER_NO_COPY;
    }
    return reset ? ISAAC_FRAME_OPAQUE_4254B0_FILTER_COPY_RESET
                 : ISAAC_FRAME_OPAQUE_4254B0_FILTER_COPY;
  }
  /* path B @0x42566e (b1 == 0; compares reversed) */
  if (frame_opaque_4254b0_f_lt(f_row_bits, f_elem_bits) != 0) {
    return ISAAC_FRAME_OPAQUE_4254B0_FILTER_REJECT;
  }
  if (frame_opaque_4254b0_f_lt(prev_f_bits, f_elem_bits) != 0) {
    return ISAAC_FRAME_OPAQUE_4254B0_FILTER_REJECT;
  }
  if (trunc < d_row) {
    return ISAAC_FRAME_OPAQUE_4254B0_FILTER_REJECT;
  }
  if (frame_opaque_4254b0_f_gt(prev_f_bits, f_elem_bits) != 0) {
    reset = 1; /* comiss ja @0x425680 -> 0x425690 */
  } else if (frame_opaque_4254b0_f_unordered(f_elem_bits,
                                             prev_f_bits) == 0) {
    if (b0b == 0u) {
      reset = 1;
    }
  }
  /* U1B @0x425696 */
  if (frame_opaque_4254b0_f_unordered(f_elem_bits, prev_f_bits) != 0) {
    return reset ? ISAAC_FRAME_OPAQUE_4254B0_FILTER_COPY_RESET
                 : ISAAC_FRAME_OPAQUE_4254B0_FILTER_COPY;
  }
  if (b0b == 0u) {
    return ISAAC_FRAME_OPAQUE_4254B0_FILTER_NO_COPY;
  }
  return reset ? ISAAC_FRAME_OPAQUE_4254B0_FILTER_COPY_RESET
               : ISAAC_FRAME_OPAQUE_4254B0_FILTER_COPY;
}

extern "C" int32_t isaac_frame_opaque_4254b0_flush_count(uint32_t cursor,
                                                         uint32_t out_list) {
  /* PE @0x42570f: mov ecx,[ebp-0x14]; sub esi,ecx; sar esi,3 —
     (cursor - out_list) arithmetic shift by 3 (pair count). */
  return (int32_t)(cursor - out_list) >> 3;
}

extern "C" uint32_t isaac_frame_opaque_4254b0_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4254B0_VA);
}

extern "C" uint32_t isaac_frame_opaque_4254b0_end_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4254B0_END_VA);
}

/* ---- FUN_004239b0 pure state initializer (ABI v45) ---- */

extern "C" uint32_t isaac_frame_opaque_4239b0_clear_value(uint32_t arg) {
  /* PE @0x4239b3: mov al, byte [ebp+8]; @0x423a19/0x423a62: test al,al;
     je keep. LOW-BYTE gate: the body re-narrows the pushed dword arg
     (ret 4 pops it); (arg & 0xff) != 0 -> +0x118/+0x248 = 0, else the
     keep-default 0x42c00000 (96.0f). */
  return ((arg & 0xffu) != 0u) ? 0u
                               : (uint32_t)ISAAC_FRAME_OPAQUE_4239B0_CLEAR_DEFAULT;
}

extern "C" uint32_t isaac_frame_opaque_4239b0_store_value(uint32_t off,
                                                          uint32_t arg) {
  /* The 17 unique store offsets of the machine body, in machine order
     (0x4239b6..0x423a84). +0x120/+0x250 are BYTE stores (c6 81 —
     value 1, masked 0xff); all others dword. +0x118/+0x248 carry the
     byte-gate decision (0x42c00000 vs 0); the block-B rewrite lands
     AFTER +0x244 in the PE — net final value is what we return. */
  const uint32_t gated = isaac_frame_opaque_4239b0_clear_value(arg);
  switch (off) {
    case ISAAC_FRAME_OPAQUE_4239B0_OFF_11C:
      return 1u;
    case ISAAC_FRAME_OPAQUE_4239B0_OFF_24C:
      return 0u;
    case ISAAC_FRAME_OPAQUE_4239B0_OFF_124:
      return (uint32_t)ISAAC_FRAME_OPAQUE_4239B0_COUNT_15;
    case ISAAC_FRAME_OPAQUE_4239B0_OFF_254:
      return (uint32_t)ISAAC_FRAME_OPAQUE_4239B0_COUNT_14;
    case ISAAC_FRAME_OPAQUE_4239B0_OFF_120:
      return (uint32_t)ISAAC_FRAME_OPAQUE_4239B0_BYTE_ONE;
    case ISAAC_FRAME_OPAQUE_4239B0_OFF_128:
      return (uint32_t)ISAAC_FRAME_OPAQUE_4239B0_F32_0_BITS;
    case ISAAC_FRAME_OPAQUE_4239B0_OFF_12C:
      return (uint32_t)ISAAC_FRAME_OPAQUE_4239B0_F32_1_BITS;
    case ISAAC_FRAME_OPAQUE_4239B0_OFF_118:
      return gated;
    case ISAAC_FRAME_OPAQUE_4239B0_OFF_114:
      return (uint32_t)ISAAC_FRAME_OPAQUE_4239B0_DEFAULT_96_BITS;
    case ISAAC_FRAME_OPAQUE_4239B0_OFF_250:
      return (uint32_t)ISAAC_FRAME_OPAQUE_4239B0_BYTE_ONE;
    case ISAAC_FRAME_OPAQUE_4239B0_OFF_258:
      return (uint32_t)ISAAC_FRAME_OPAQUE_4239B0_F32_0_BITS;
    case ISAAC_FRAME_OPAQUE_4239B0_OFF_25C:
      return (uint32_t)ISAAC_FRAME_OPAQUE_4239B0_F32_1_BITS;
    case ISAAC_FRAME_OPAQUE_4239B0_OFF_248:
      return gated;
    case ISAAC_FRAME_OPAQUE_4239B0_OFF_244:
      return (uint32_t)ISAAC_FRAME_OPAQUE_4239B0_DEFAULT_96_BITS;
    case ISAAC_FRAME_OPAQUE_4239B0_OFF_260:
      return (uint32_t)ISAAC_FRAME_OPAQUE_4239B0_ONE_BITS;
    case ISAAC_FRAME_OPAQUE_4239B0_OFF_264:
      return 0u;
    case ISAAC_FRAME_OPAQUE_4239B0_OFF_268:
      return 0u;
    default:
      return 0xffffffffu; /* out-of-table offset: no store site */
  }
}

extern "C" uint32_t isaac_frame_opaque_4239b0_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4239B0_VA);
}

extern "C" uint32_t isaac_frame_opaque_4239b0_end_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4239B0_END_VA);
}

/* ---- FUN_00423990 wrapper + FUN_00423aa0 SEH/GS band (ABI v46) ---- */

extern "C" uint32_t isaac_frame_opaque_423990_seh_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_423990_SEH_VA);
}

extern "C" uint32_t isaac_frame_opaque_423990_init_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_423990_INIT_VA);
}

extern "C" uint32_t isaac_frame_opaque_423990_init_arg(void) {
  /* PE @0x42399f: 6a00 push 0 before call 0x4239b0 — the wrapper's
     arg-conduct is the CONSTANT 0 (low byte 0 -> v45 init KEEPS 96.0f
     in +0x118/+0x248). */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_423990_INIT_ARG);
}

extern "C" uint32_t isaac_frame_opaque_423990_clear_after(void) {
  /* Composition law: after the SEH body, the wrapper runs the v45 init
     with arg 0. Net +0x118/+0x248 state = 4239b0_clear_value(0). */
  return isaac_frame_opaque_4239b0_clear_value(
      ISAAC_FRAME_OPAQUE_423990_INIT_ARG);
}

extern "C" uint32_t isaac_frame_opaque_423990_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_423990_VA);
}

extern "C" uint32_t isaac_frame_opaque_423990_end_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_423990_END_VA);
}

extern "C" uint32_t isaac_frame_opaque_423aa0_iterations(void) {
  /* PE @0x423ae1 xor esi,esi / @0x423ba6 cmp esi,2; jb loop. */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_423AA0_ITERATIONS);
}

extern "C" uint32_t isaac_frame_opaque_423aa0_stride(void) {
  /* PE @0x423ba0 add edi,0x130 — receiver walks this + 0x130*i. */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_423AA0_STRIDE);
}

extern "C" uint32_t isaac_frame_opaque_423aa0_local_cap(void) {
  /* PE @0x423b23 mov dword [ebp-0x18],0x1f — the temp string's cap. */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_423AA0_LOCAL_CAP);
}

extern "C" uint32_t isaac_frame_opaque_423aa0_local_size(void) {
  /* PE @0x423b1c mov dword [ebp-0x1c],0x1e — 30 chars copied from
     0xb1c210 (gfx/ui/ButtonPromptWidget.anm2) + NUL at +0x1e. */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_423AA0_LOCAL_SIZE);
}

extern "C" uint32_t isaac_frame_opaque_423aa0_alloc_arg(void) {
  /* PE @0x423af7 mov ecx,0x20 before call 0x40cf00 (HOST alloc). */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_423AA0_ALLOC_ARG);
}

extern "C" uint32_t isaac_frame_opaque_423aa0_push_arg(void) {
  /* PE @0x423b54 push 1 / lea eax,[ebp-0x2c] / push eax; mov ecx,edi;
     call 0x40bd50 — pushed args are (str, 1). */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_423AA0_PUSH_ARG);
}

extern "C" int32_t isaac_frame_opaque_423aa0_free_needed(uint32_t cap) {
  /* PE @0x423b72 cmp edx,0x10; jb skip-free — UNSIGNED `below`.
     cap < 0x10 -> no free; else free via 0xaef15c (HOST). */
  return (cap >= static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_423AA0_FREE_MIN_CAP))
             ? 1
             : 0;
}

extern "C" int32_t isaac_frame_opaque_423aa0_big_header_path(uint32_t cap) {
  /* PE @0x423b7a inc edx (cap+1, 32-bit wrap) / @0x423b7d
     cmp edx,0x1000; jb small. BIG iff (cap+1 mod 2^32) >= 0x1000
     (unsigned). cap = 0xffffffff -> cap+1 = 0 -> SMALL. */
  const uint32_t cap_plus = cap + 1u;
  return (cap_plus >= static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_423AA0_BIG_THRESHOLD))
             ? 1
             : 0;
}

extern "C" uint32_t isaac_frame_opaque_423aa0_header_delta(uint32_t buf,
                                                            uint32_t header) {
  /* PE @0x423b8b sub eax,ecx (buf - header) / @0x423b8d add eax,-4.
     delta = (buf - header - 4) mod 2^32 (eax is 32-bit). */
  return (buf - header - 4u);
}

extern "C" int32_t isaac_frame_opaque_423aa0_header_sane(uint32_t delta) {
  /* PE @0x423b90 cmp eax,0x1f; ja invalid_parameter (0x423be8 INDIRECT
     0xb18894, HOST). SANE iff delta <= 0x1f (UNSIGNED above). */
  return (delta <= static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_423AA0_DELTA_MAX))
             ? 1
             : 0;
}

extern "C" int32_t isaac_frame_opaque_423aa0_sso_inline(uint32_t cap) {
  /* PE @0x423bb9 cmp [esi+0x14],0x10; mov eax,esi; jb 0x423bc3 —
     cap < 0x10 (unsigned) keeps eax = obj (SSO data at obj start);
     else eax = [obj] (heap data ptr at offset 0). */
  return (cap < static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_423AA0_FREE_MIN_CAP))
             ? static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_423AA0_SSO_INLINE)
             : static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_423AA0_SSO_HEAP);
}

extern "C" int32_t isaac_frame_opaque_423aa0_insert_left(
    uint32_t obj_null, uint32_t str_eq, uint32_t obj_byte34,
    uint32_t this_byte44) {
  /* LEFT prompt gate (this->str obj ptr @ +0x34):
       test esi,esi; je INSERT      (obj NULL -> insert)
       strcmp(eax, 0xb1c230); test eax,eax; jne INSERT  (mismatch -> insert)
       cmp byte [obj+0x34],al; je SKIP     (byte34 == 0 -> skip)
       cmp byte [this+0x44],al; jne SKIP   (byte44 != 0 -> skip)
       fall -> INSERT
     Byte gates narrow 0xff (cmp byte ptr); obj_null / str_eq are
     full-dword zero tests. */
  if (obj_null != 0u) {
    return 1;
  }
  if (str_eq == 0u) {
    return 1;
  }
  if ((obj_byte34 & 0xffu) == 0u) {
    return 0;
  }
  if ((this_byte44 & 0xffu) != 0u) {
    return 0;
  }
  return 1;
}

extern "C" int32_t isaac_frame_opaque_423aa0_insert_right(
    uint32_t obj_null, uint32_t str_eq, uint32_t obj_byte34,
    uint32_t this_byte174) {
  /* RIGHT prompt gate — same shape, str obj ptr @ +0x164, strcmp vs
     0xb1c23c, skip gates byte [obj+0x34]==0 / byte [this+0x174]!=0. */
  if (obj_null != 0u) {
    return 1;
  }
  if (str_eq == 0u) {
    return 1;
  }
  if ((obj_byte34 & 0xffu) == 0u) {
    return 0;
  }
  if ((this_byte174 & 0xffu) != 0u) {
    return 0;
  }
  return 1;
}

extern "C" int32_t isaac_frame_opaque_423aa0_flag_result(uint32_t host_result) {
  /* PE @0x423c0f test al,al; je skip; @0x423c1b mov byte [edi+0x44],1
     (and mirror @0x423c80/@0x423c8f -> +0x174). LOW-BYTE gate: host
     result nonzero low byte sets the flag byte to 1. */
  return ((host_result & 0xffu) != 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_frame_opaque_423aa0_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_423AA0_VA);
}

extern "C" uint32_t isaac_frame_opaque_423aa0_end_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_423AA0_END_VA);
}

/* ---- FUN_00423cc0 slot band + PURE 0x424130 vec leaf (ABI v47) ---- */

extern "C" uint32_t isaac_frame_opaque_423cc0_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_423CC0_VA);
}

extern "C" uint32_t isaac_frame_opaque_423cc0_end_va(void) {
  /* PE ret @0x4240ad; end 0x4240ae (int3 pad to 0x4240b0 next fn). */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_423CC0_END_VA);
}

extern "C" uint32_t isaac_frame_opaque_423cc0_iterations(void) {
  /* PE @0x42404d cmp esi,2; jb 0x423d90 — 2 iterations. */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_423CC0_ITERATIONS);
}

extern "C" uint32_t isaac_frame_opaque_423cc0_stride(void) {
  /* PE @0x424043 add edi,0x130 — slot walk this + 0x130*i. */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_423CC0_STRIDE);
}

extern "C" uint32_t isaac_frame_opaque_423cc0_slot_base_off(void) {
  /* PE @0x423d78 add edi,0x11c — slot 0 base this+0x11c. */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_423CC0_SLOT_BASE_OFF);
}

extern "C" int32_t isaac_frame_opaque_423cc0_mode_select(uint32_t bit_set) {
  /* PE @0x423d3f test byte [0xc798e4],4 / mov eax,1 / mov ecx,6 /
     cmove eax,ecx — cmove = CMOVZ moves ecx=6 into eax only when ZF=1,
     i.e. when the tested bit is CLEAR. Bit SET -> 1, clear -> 6.
     Input is the (byte & 4)!=0 truth; only bit 0 matters. */
  return ((bit_set & 1u) != 0u)
             ? static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_423CC0_MODE_OFF)
             : static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_423CC0_MODE_ON);
}

extern "C" uint32_t isaac_frame_opaque_423cc0_scale_f32(uint32_t f260) {
  /* PE @0x423eaf mulss xmm0,[0xbaa528] (1.5f) with xmm0 = f32(this+0x260).
     mulss rounds the product to f32. */
  float in;
  __builtin_memcpy(&in, &f260, 4);
  const float out = in * 1.5f;
  uint32_t bits;
  __builtin_memcpy(&bits, &out, 4);
  return bits;
}

extern "C" int32_t isaac_frame_opaque_423cc0_slot_skip(uint32_t type,
                                                       uint32_t byte4) {
  /* PE @0x423e37 cmp [edi+8],0x20; je skip — FULL-DWORD eq.
     PE @0x423e41 cmp byte [edi+4],0; je skip — LOW-BYTE zero test. */
  if (type == static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_423CC0_SKIP_TYPE)) {
    return 1;
  }
  if ((byte4 & 0xffu) == 0u) {
    return 1;
  }
  return 0;
}

extern "C" int32_t isaac_frame_opaque_423cc0_render_needed(uint32_t gate_a) {
  /* PE @0x423de7 cmp byte [edi-0x13],0; je 0x423e37 — LOW-BYTE nonzero
     gate on the render path. */
  return ((gate_a & 0xffu) != 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_frame_opaque_423cc0_render_first_off(
    uint32_t order) {
  /* PE @0x423def cmp byte [edi-0xac],0; lea ecx,[edi-0xcc]; je 0x423e16
     — byte==0 -> first receiver edi-0xec (this+0x30); byte!=0 ->
     edi-0xcc (this+0x50). Returns the FIRST receiver offset from this. */
  return ((order & 0xffu) != 0u)
             ? static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_423CC0_RENDER_A_OFF)
             : static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_423CC0_RENDER_B_OFF);
}

extern "C" int32_t isaac_frame_opaque_423cc0_bounds_ok(uint32_t index,
                                                       uint32_t begin,
                                                       uint32_t end) {
  /* PE @0x423fba: ecx=[esi+0x14] end / edx=[esi+0x10] begin;
     sub ecx,edx; sar ecx,4 (SIGNED arithmetic shift);
     @0x423fc5 cmp eax,ecx; jb 0x423fde — UNSIGNED below.
     ok iff (uint32)index < (uint32)(sar4(end-begin)). */
  const int32_t diff = static_cast<int32_t>(end - begin) >> 4;
  return (index < static_cast<uint32_t>(diff)) ? 1 : 0;
}

extern "C" uint32_t isaac_frame_opaque_423cc0_entry_offset(uint32_t index) {
  /* PE @0x423fde add eax,eax / @0x423fe0 mov ecx,[edx+eax*8] —
     entry = base + index*16, 32-bit wrap (index 0x80000000 -> 0). */
  return (index * 16u);
}

extern "C" int32_t isaac_frame_opaque_423cc0_entry_is_none(uint32_t entry) {
  /* PE @0x423fe3 cmp ecx,-1; jne 0x423fef — sentinel -1 selects the
     default pointer 0xb6d124 ("None"). */
  return (entry == static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_423CC0_NONE_SENTINEL))
             ? 1
             : 0;
}

/* PURE sibling 0x424130 (0 E8 / 0 indirect): thiscall(out, iter).
   iter==0 -> caseA (movups [this+0x128]); iter==1 -> caseB; else the
   default vec2 (raw dword copies of 0xc7b640/0xc7b644). Every mulss/
   subss/addss rounds f32 (sub eax,0/je then sub eax,1/je dispatch). */
static uint32_t frame_opaque_424130_round_f32(float v) {
  uint32_t bits;
  __builtin_memcpy(&bits, &v, 4);
  return bits;
}

extern "C" uint32_t isaac_frame_opaque_424130_vec_x(
    uint32_t iter, uint32_t f260, uint32_t f128, uint32_t f114,
    uint32_t f12c, uint32_t f244, uint32_t f258, uint32_t f25c,
    uint32_t bss_x, uint32_t bss_y, uint32_t def_x, uint32_t def_y) {
  (void)bss_y;
  (void)def_y;
  float v260, v128, v114, v12c, v244, v258, v25c, vbx, vby;
  __builtin_memcpy(&v260, &f260, 4);
  __builtin_memcpy(&v128, &f128, 4);
  __builtin_memcpy(&v114, &f114, 4);
  __builtin_memcpy(&v12c, &f12c, 4);
  __builtin_memcpy(&v244, &f244, 4);
  __builtin_memcpy(&v258, &f258, 4);
  __builtin_memcpy(&v25c, &f25c, 4);
  __builtin_memcpy(&vbx, &bss_x, 4);
  __builtin_memcpy(&vby, &bss_y, 4);
  if (iter == static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424130_ITER_CASE_A)) {
    /* caseA out.x: f32(f32(f32(this+0x128) - f32(f32(this+0x260)*8.0f)))
       — xmm1 = movups [this+0x128]; xmm0 = xmm2*8.0f; xmm1 -= xmm0. */
    const float t0 = v260 * 8.0f;   /* mulss rounds */
    return frame_opaque_424130_round_f32(v128 - t0);
  }
  if (iter == static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424130_ITER_CASE_B)) {
    /* caseB out.x: f32(f32(f32(0xc78dc4) - f32(f32(this+0x260)*88.0f))
       + f32(this+0x258)). */
    const float t0 = v260 * 88.0f;
    return frame_opaque_424130_round_f32(vbx - t0 + v258);
  }
  /* default (iter>=2): raw dword copy of the 0xc7b640 vec2 x. */
  return def_x;
}

extern "C" uint32_t isaac_frame_opaque_424130_vec_y(
    uint32_t iter, uint32_t f260, uint32_t f128, uint32_t f114,
    uint32_t f12c, uint32_t f244, uint32_t f258, uint32_t f25c,
    uint32_t bss_x, uint32_t bss_y, uint32_t def_x, uint32_t def_y) {
  (void)f128;
  (void)f114;
  (void)f12c;
  (void)f244;
  (void)bss_x;
  (void)def_x;
  float v260, v128, v114, v12c, v244, v258, v25c, vbx, vby;
  __builtin_memcpy(&v260, &f260, 4);
  __builtin_memcpy(&v128, &f128, 4);
  __builtin_memcpy(&v114, &f114, 4);
  __builtin_memcpy(&v12c, &f12c, 4);
  __builtin_memcpy(&v244, &f244, 4);
  __builtin_memcpy(&v258, &f258, 4);
  __builtin_memcpy(&v25c, &f25c, 4);
  __builtin_memcpy(&vbx, &bss_x, 4);
  __builtin_memcpy(&vby, &bss_y, 4);
  if (iter == static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424130_ITER_CASE_A)) {
    /* caseA out.y: f32(f32(f32(f32(0xc78edc) - f32(f32(this+0x260)*76.0f))
       + f32(f32(this+0x260)*f32(this+0x114))) + f32(this+0x12c)). */
    const float t0 = v260 * 76.0f;          /* mulss xmm0 */
    const float t1 = v260 * v114;           /* mulss xmm2 */
    return frame_opaque_424130_round_f32(vby - t0 + t1 + v12c);
  }
  if (iter == static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424130_ITER_CASE_B)) {
    /* caseB out.y: f32(f32(f32(f32(0xc78edc) - f32(f32(this+0x260)*76.0f))
       + f32(f32(this+0x260)*f32(this+0x244))) + f32(this+0x25c)). */
    const float t0 = v260 * 76.0f;          /* mulss xmm0 */
    const float t1 = v260 * v244;           /* mulss xmm2 */
    return frame_opaque_424130_round_f32(vby - t0 + t1 + v25c);
  }
  /* default (iter>=2): raw dword copy of the 0xc7b640 vec2 y. */
  return def_y;
}

/* Layout invariants recovered from the PE bodies. */
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_421800_VA <
                  (uint32_t)ISAAC_FRAME_OPAQUE_421800_END_VA,
              "421800 getter ret follows entry");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_424530_VA <
                  (uint32_t)ISAAC_FRAME_OPAQUE_424530_END_VA,
              "424530 identity ret follows entry");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_423950_VA <
                  (uint32_t)ISAAC_FRAME_OPAQUE_423950_END_VA,
              "423950 id getter ret follows entry");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_423960_VA <
                  (uint32_t)ISAAC_FRAME_OPAQUE_423960_END_VA,
              "423960 nonempty ret follows entry");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_423970_VA <
                  (uint32_t)ISAAC_FRAME_OPAQUE_423970_END_VA,
              "423970 rtti getter ret follows entry");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_425430_VA <
                  (uint32_t)ISAAC_FRAME_OPAQUE_425430_END_VA,
              "425430 ctor ret follows entry");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_425430_STRIDE *
                      (uint32_t)ISAAC_FRAME_OPAQUE_425430_COUNT +
                  (uint32_t)ISAAC_FRAME_OPAQUE_425430_COPY_SHIFT ==
              0x448u,
              "copy loop last dst offset is 0x34*0x15+4 = 0x448");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_425430_ZERO_BYTE_OFF == 0x450u,
              "byte-zero store offset 0x450 follows the 0x448 copy tail");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_423960_VEC_OFF == 0x4b3d8u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423960_VEC_END_OFF == 0x4b3dcu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423970_RTTI_OFF == 0x378u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423970_NULL_MARKER == 0xdeadbeefu,
              "band getter contract: MP vec 0x4b3d8/0x4b3dc, RTTI 0x378, 0xdeadbeef");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4254B0_VA == 0x004254b0u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4254B0_END_VA == 0x004257acu,
              "4254b0 body 0x4254b0..0x4257ab ret, end 0x4257ac");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4254B0_CALL_SITES == 2u,
              "4254b0 direct rel32 callers 0x90cffc / 0x8ca67c");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4254B0_ROW_BASE_OFF == 0x28u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4254B0_ROW_STRIDE == 0x34u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4254B0_ROW_COUNT == 0x15u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4254B0_ROW_SKIP_KIND == 0x16u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4254B0_FINAL_BYTE_OFF == 0x450u,
              "4254b0 table geometry: 21 rows at this+0x28 (0x34 apart), kind 0x16 skip, final byte 0x450");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4254B0_XMM1_DEFAULT_BITS == 0x4f000000u,
              "4254b0 row default float is 2147483648.0f (0x4f000000 @0xbaacbc)");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4254B0_TRAILING_MIN_COUNT == 4u,
              "4254b0 Pass A stops popping at count <= 4");
static_assert(ISAAC_FRAME_OPAQUE_4254B0_FILTER_REJECT == 0 &&
                  ISAAC_FRAME_OPAQUE_4254B0_FILTER_NO_COPY == 1 &&
                  ISAAC_FRAME_OPAQUE_4254B0_FILTER_COPY == 2 &&
                  ISAAC_FRAME_OPAQUE_4254B0_FILTER_COPY_RESET == 3,
              "4254b0 filter action enum stable");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4239B0_VA == 0x004239b0u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4239B0_END_VA == 0x00423a92u,
              "4239b0 body 0x4239b0..0x423a8f ret4, end 0x423a92");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4239B0_CALL_SITES == 5u,
              "4239b0 direct rel32 callers 0x4239a3/0x8ca647/0x95e8b9/0x987502/0x99981e");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4239B0_OFF_COUNT == 17u,
              "4239b0 has 17 unique store offsets (19 machine stores, +0x118/+0x248 double-write)");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4239B0_F32_0_BITS == 0x3760371cu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4239B0_F32_1_BITS == 0x37873770u,
              "4239b0 f32 pool 0xc7b640/0xc7b644 (raw .data 0x879640/0x879644)");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4239B0_CLEAR_DEFAULT == 0x42c00000u,
              "4239b0 keep-default is 96.0f (0x42c00000)");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_423990_VA == 0x00423990u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423990_END_VA == 0x004239adu,
              "423990 wrapper 0x423990..0x4239ac ret, end 0x4239ad");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_423990_CALL_SITES == 1u,
              "423990 direct rel32 caller 0x952783");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_423990_SEH_VA == 0x00423aa0u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423990_INIT_VA == 0x004239b0u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423990_INIT_ARG == 0u,
              "423990 conduct: SEH 0x423aa0 first, v45 init 0x4239b0 arg 0");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_423AA0_VA == 0x00423aa0u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423AA0_END_VA == 0x00423cb4u,
              "423aa0 SEH body 0x423aa0..0x423cb3 ret, end 0x423cb4");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_423AA0_CALL_SITES == 2u,
              "423aa0 direct rel32 callers 0x42399a / 0x954739");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_423AA0_ITERATIONS == 2u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423AA0_STRIDE == 0x130u,
              "423aa0 2-iteration loop, receiver stride 0x130");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_423AA0_LOCAL_CAP == 0x1fu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423AA0_LOCAL_SIZE == 0x1eu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423AA0_ALLOC_ARG == 0x20u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423AA0_PUSH_ARG == 1u,
              "423aa0 temp string cap 0x1f/size 0x1e, alloc 0x20, push 1");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_423AA0_FREE_MIN_CAP == 0x10u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423AA0_BIG_THRESHOLD == 0x1000u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423AA0_HEADER_BIAS == 0x23u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423AA0_DELTA_MAX == 0x1fu,
              "423aa0 allocator free gates 0x10/0x1000/0x23/0x1f");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_423AA0_LEFT_STR_OFF == 0x34u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423AA0_RIGHT_STR_OFF == 0x164u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423AA0_STR_CAP_OFF == 0x14u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423AA0_STR_BYTE_OFF == 0x34u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423AA0_LEFT_FLAG_OFF == 0x44u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423AA0_RIGHT_FLAG_OFF == 0x174u,
              "423aa0 prompt string object + flag offsets");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_423AA0_LEFT_AFTER_OFF == 0x30u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423AA0_RIGHT_RECV_OFF == 0x130u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423AA0_RIGHT_AFTER_OFF == 0x160u,
              "423aa0 0x40a1b0 receivers this+0x30 / this+0x160, 0x40a5d0 recv this+0x130");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_423AA0_LOCAL_POOL_VA == 0x00b1c210u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423AA0_LEFT_POOL_VA == 0x00b1c230u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423AA0_RIGHT_POOL_VA == 0x00b1c23cu,
              "423aa0 .rdata pools: local anm2 path 0xb1c210, LeftPrompt 0xb1c230, RightPrompt 0xb1c23c");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_423AA0_GS_COOKIE == 0xaf18adu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423AA0_GS_COOKIE_GLOBAL_VA == 0x00bf93b4u,
              "423aa0 SEH cookie 0xaf18ad, GS global 0xbf93b4");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_423CC0_VA == 0x00423cc0u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423CC0_END_VA == 0x004240aeu,
              "423cc0 slot band 0x423cc0..0x4240ad ret, end 0x4240ae");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_423CC0_CALL_SITES == 1u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423CC0_CALLER1_VA == 0x00955c85u,
              "423cc0 direct rel32 caller 0x955c85");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_423CC0_SEH_COOKIE == 0xaf1900u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423CC0_GS_COOKIE_GLOBAL_VA == 0x00bf93b4u,
              "423cc0 SEH cookie 0xaf1900, GS global 0xbf93b4");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_423CC0_ITERATIONS == 2u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423CC0_STRIDE == 0x130u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423CC0_SLOT_BASE_OFF == 0x11cu,
              "423cc0 2-slot loop, stride 0x130, base this+0x11c");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_423CC0_FLOAT_SRC_OFF == 0x260u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423CC0_SCALE_F32_BITS == 0x3fc00000u,
              "423cc0 float source this+0x260, mulss 1.5f (0xbaa528 = 0x3fc00000)");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_423CC0_MODE_BIT_GLOBAL_VA == 0x00c798e4u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423CC0_MODE_BIT_MASK == 4u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423CC0_MODE_OFF == 1u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423CC0_MODE_ON == 6u,
              "423cc0 mode select: test byte [0xc798e4],4 -> cmove 1/6");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_423CC0_SLOT_TYPE_OFF == 8u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423CC0_SKIP_TYPE == 0x20u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423CC0_SLOT_BYTE4_OFF == 4u,
              "423cc0 slot skip: [edi+8]==0x20 dword eq, byte [edi+4]==0");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_423CC0_RENDER_GATE_OFF == 0x109u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423CC0_ORDER_GATE_OFF == 0x70u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423CC0_RENDER_A_OFF == 0x50u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423CC0_RENDER_B_OFF == 0x30u,
              "423cc0 render gates this+0x109/0x70, receivers +0x50/+0x30");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_423CC0_LAYER_POOL_VA == 0x00b1c208u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423CC0_WARN_MSG_VA == 0x00b1a634u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423CC0_ASSERT_LEVEL == 4u,
              "423cc0 layer lookup pool 0xb1c208 (Text), warn 0xb1a634");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_423CC0_BEGIN_OFF == 0x10u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423CC0_END_OFF == 0x14u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423CC0_ENTRY_STRIDE == 0x10u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423CC0_NONE_SENTINEL == 0xffffffffu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423CC0_NONE_PTR_VA == 0x00b6d124u,
              "423cc0 table law: sar4 signed, jb unsigned, stride 16, sentinel -1 -> 0xb6d124");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_423CC0_F32_ONE_BITS == 0x3f800000u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423CC0_ONES_FLOAT_DWORDS == 4u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423CC0_ONES_ZERO_BASE == 0x10u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423CC0_ONES_ZERO_DWORDS == 7u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423CC0_ONES_SIZE == 0x2cu,
              "423cc0 ones struct: 4x 1.0f @0..0xc, zeros 0x10..0x28, size 0x2c");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_423CC0_ALT_0 == 4u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423CC0_ALT_1 == 0xffffu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423CC0_ALT_3 == 0x3f800000u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423CC0_ALT_4 == 0xffffffffu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423CC0_ALT_BYTES == 0x1cu,
              "423cc0 alt struct {4,0xffff,0,1.0f,-1,0,0} (0x1c bytes)");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_423CC0_HOST_VEC_HELPER_VA == 0x004240b0u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423CC0_HOST_MODE_DISPATCH_VA == 0x00424220u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423CC0_HOST_RENDER_VA == 0x0040a030u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423CC0_HOST_POPUP_VA == 0x00af08b1u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423CC0_HOST_FLUSH_VA == 0x0095af30u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423CC0_HOST_STRINGIFY_VA == 0x00a0f550u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_423CC0_HOST_COMBINE_VA == 0x00a1b050u,
              "423cc0 host leaves 0x4240b0/0x424220/0x40a030/0xaf08b1/0x95af30/0xa0f550/0xa1b050");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_424130_VA == 0x00424130u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424130_END_VA == 0x0042420fu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424130_ITER_CASE_A == 0u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424130_ITER_CASE_B == 1u,
              "424130 pure vec leaf 0x424130..0x42420e ret8, iter 0/1 dispatch");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_424130_RDATA_A1_VA == 0x00baa7e8u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424130_RDATA_A2_VA == 0x00baa960u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424130_RDATA_B1_VA == 0x00baa9b0u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424130_RDATA_B2_VA == 0x00baa990u,
              "424130 rdata scales 0xbaa7e8/0xbaa960/0xbaa9b0/0xbaa990");

/* ---- FUN_004240b0 icon-pos composer (ABI v48) ----
   PE 0x004240b0..0x00411f ret 8 (thiscall this=ecx; args out[ebp+8],
   idx[ebp+0xc]); 5 callers. Body:
     call 0x424130(&local, idx)             PURE base vec (sibling law)
     ecx = idx*0x130; ebx = &local
     cmp [this + idx*0x130 + 0x34], 0       GATE (FULL DWORD)
     jne walk
     xor ecx,ecx                            gate==0 -> ecx=0
     jmp join
   walk: ecx = this + idx*0x130 + 0x30; push 0xb1c248 "IconPos";
         call 0x40ace0 (HOST extras walk) -> ecx = eax (ptr or 0)
   join: scale = [this+0x260]
         xmm0 = scale*[ecx];   xmm1 = scale*[ecx+4]
         xmm0 += [ebx];        xmm1 += [ebx+4]
         out[0]=xmm0; out[1]=xmm1
   Pure laws: walk_needed(gate) = gate!=0 (full dword); result_x/y =
   f32(f32(scale*vec)+base). vec0/vec1 are HOST-sampled from the walk
   result ptr (gate==0 -> PE derefs [0] — latent null-path quirk,
   selection law only; vec sampled from host either way). */

static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4240B0_VA == 0x004240b0u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4240B0_END_VA == 0x00424120u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4240B0_CALL_SITES == 5u,
              "4240b0 icon-pos composer identity + 5 callers");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4240B0_CALLER1_VA == 0x00423ed1u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4240B0_CALLER2_VA == 0x00423fa9u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4240B0_CALLER3_VA == 0x008cb2a3u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4240B0_CALLER4_VA == 0x0095ec83u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4240B0_CALLER5_VA == 0x0095ecf4u,
              "4240b0 callers 0x423ed1/0x423fa9/0x8cb2a3/0x95ec83/0x95ecf4");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4240B0_CALLEE_VA == 0x00424130u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4240B0_WALK_VA == 0x0040ace0u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4240B0_NAME_VA == 0x00b1c248u,
              "4240b0 callee 0x424130 pure, walk 0x40ace0, name 0xb1c248 IconPos");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4240B0_STRIDE == 0x130u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4240B0_GATE_OFF == 0x34u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4240B0_RECV_OFF == 0x30u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4240B0_SCALE_OFF == 0x260u,
              "4240b0 offsets stride 0x130 / gate +0x34 / recv +0x30 / scale +0x260");

extern "C" int32_t isaac_frame_opaque_4240b0_walk_needed(uint32_t gate_dword) {
  /* PE @0x004240d4 cmp dword [ecx+edi+0x34],0; jne walk — FULL-DWORD. */
  return (gate_dword != 0u) ? 1 : 0;
}

namespace {
inline uint32_t fo_4240b0_round_f32(float v) {
  uint32_t bits = 0;
  __builtin_memcpy(&bits, &v, sizeof(bits));
  return bits;
}
}  // namespace

extern "C" uint32_t isaac_frame_opaque_4240b0_result_x(uint32_t scale_bits,
                                                        uint32_t base0_bits,
                                                        uint32_t vec0_bits) {
  /* PE @0x4240fe mulss xmm0,[ecx]; @0x424109 addss xmm0,[ebx]:
     f32(f32(scale*vec0) + base0). */
  float scale = 0.0f, base0 = 0.0f, vec0 = 0.0f;
  __builtin_memcpy(&scale, &scale_bits, sizeof(scale));
  __builtin_memcpy(&base0, &base0_bits, sizeof(base0));
  __builtin_memcpy(&vec0, &vec0_bits, sizeof(vec0));
  const float t = scale * vec0; /* mulss rounds */
  return fo_4240b0_round_f32(t + base0); /* addss rounds */
}

extern "C" uint32_t isaac_frame_opaque_4240b0_result_y(uint32_t scale_bits,
                                                        uint32_t base1_bits,
                                                        uint32_t vec1_bits) {
  /* PE @0x424103 mulss xmm1,[ecx+4]; @0x42410d addss xmm1,[ebx+4]:
     f32(f32(scale*vec1) + base1). */
  float scale = 0.0f, base1 = 0.0f, vec1 = 0.0f;
  __builtin_memcpy(&scale, &scale_bits, sizeof(scale));
  __builtin_memcpy(&base1, &base1_bits, sizeof(base1));
  __builtin_memcpy(&vec1, &vec1_bits, sizeof(vec1));
  const float t = scale * vec1; /* mulss rounds */
  return fo_4240b0_round_f32(t + base1); /* addss rounds */
}

extern "C" uint32_t isaac_frame_opaque_4240b0_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4240B0_VA);
}
extern "C" uint32_t isaac_frame_opaque_4240b0_end_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4240B0_END_VA);
}
extern "C" uint32_t isaac_frame_opaque_4240b0_callee_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4240B0_CALLEE_VA);
}
extern "C" uint32_t isaac_frame_opaque_4240b0_walk_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4240B0_WALK_VA);
}
extern "C" uint32_t isaac_frame_opaque_4240b0_name_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4240B0_NAME_VA);
}

/* ---- FUN_00424220 mode dispatch (ABI v49) ----
   PE 0x00424220..0x00429a ret (plain ret; thiscall none — ecx only from
   the [0xc7169c] global read). 2 callers 0x423d03 (423cc0 band host leaf
   site) + 0x954f9e. Body:
     idx = [obj+8]-1 (dec, 32-bit wrap); cmp eax,4; ja DEFAULT;
     jmp [idx*4+0x42429c] (table[0]=CASE_A, table[1/2/4]=CASE_B,
     table[3]=DEFAULT)
     CASE_A: eax=[0xbf9444]; ret              (host-sampled dword)
     DEFAULT: eax=-1; ret                     (0xffffffff)
     CASE_B: cmp [obj+0x4b3d8],[obj+0x4b3dc]; je PATH2
       PATH1: HOST 0x90b070(obj+0x4b3d8) -> res; [res+0x378] rtti
              (host-sampled); rtti==0 -> 0xdeadbeef; else [rtti+0xc]
       PATH2: q=[0xc71678] (host-sampled); q==0 -> DEFAULT;
              delta=[q+0x1baac]-[q+0x1baa8] (wrap);
              test delta,0xfffffffc; je DEFAULT;
              HOST 0x417870 Game::GetPlayer(0) -> res; [res+0x1618]
   Pure laws: dispatch selection; b_gate full-dword eq; b1_entry null/entry
   (same instruction shape as v43 0x423970); b2_delta wrap sub; b2_gate
   full-dword mask test; b2_result [obj+0x1618] (same shape as v43 423950).
   Host leaves: 0x90b070 + 0x417870; all address-dynamic derefs host-side. */
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_424220_VA == 0x00424220u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424220_END_VA == 0x0042429bu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424220_TABLE_VA == 0x0042429cu,
              "424220 dispatch 0x424220..0x42429a ret, table 0x42429c");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_424220_CALL_SITES == 2u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424220_CALLER1_VA == 0x00423d03u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424220_CALLER2_VA == 0x00954f9eu,
              "424220 callers 0x423d03 (423cc0 band) + 0x954f9e");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_424220_OBJ_GLOBAL_VA == 0x00c7169cu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424220_MODE_OFF == 8u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424220_CASE_A_GLOBAL_VA == 0x00bf9444u,
              "424220 obj [0xc7169c] +8 mode, CASE_A dword [0xbf9444]");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_424220_MP_VEC_OFF == 0x4b3d8u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424220_MP_VEC_END_OFF == 0x4b3dcu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424220_RTTI_OFF == 0x378u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424220_RTTI_ENTRY_OFF == 0xcu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424220_NULL_MARKER == 0xdeadbeefu,
              "424220 CASE_B layout: MP vec 0x4b3d8/0x4b3dc, rtti 0x378, entry 0xc, 0xdeadbeef");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_424220_NET_GLOBAL_VA == 0x00c71678u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424220_DELTA_LO_OFF == 0x1baa8u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424220_DELTA_HI_OFF == 0x1baacu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424220_DELTA_MASK == 0xfffffffcu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424220_RESULT_ID_OFF == 0x1618u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424220_DEFAULT_RESULT == 0xffffffffu,
              "424220 PATH2: net [0xc71678], delta 0x1baa8/0x1baac, mask 0xfffffffc, id +0x1618, default -1");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_424220_HOST1_VA == 0x0090b070u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424220_HOST2_VA == 0x00417870u,
              "424220 host leaves 0x90b070 (PATH1) + 0x417870 Game::GetPlayer(0)");

extern "C" int32_t isaac_frame_opaque_424220_dispatch(uint32_t mode) {
  /* PE @0x42422a dec eax; @0x42422b cmp eax,4; @0x42422e ja DEFAULT;
     @0x424230 jmp [eax*4+0x42429c]. table[0]->CASE_A, table[1/2/4]->
     CASE_B, table[3]->DEFAULT. idx is mode-1 mod 2^32; the >4 compare
     is UNSIGNED (ja). */
  const uint32_t idx = mode - 1u; /* dec eax wraps */
  if (idx > 4u) {                /* ja 0x424296 */
    return static_cast<int32_t>(ISAAC_FRAME_OPAQUE_424220_DISPATCH_DEFAULT);
  }
  switch (idx) {                 /* jmp table 0x42429c */
    case 0u:
      return static_cast<int32_t>(ISAAC_FRAME_OPAQUE_424220_DISPATCH_CASE_A);
    case 1u:
    case 2u:
    case 4u:
      return static_cast<int32_t>(ISAAC_FRAME_OPAQUE_424220_DISPATCH_CASE_B);
    case 3u: /* table[3] = 0x424296 (DEFAULT), same as the ja target */
    default:
      return static_cast<int32_t>(ISAAC_FRAME_OPAQUE_424220_DISPATCH_DEFAULT);
  }
}

extern "C" int32_t isaac_frame_opaque_424220_b_gate(uint32_t lo, uint32_t hi) {
  /* PE @0x42424a cmp eax,[ecx+4]; @0x42424d je 0x42426a — FULL-DWORD
     equality selects PATH2 (gate 1) vs PATH1 (0). */
  return (lo == hi) ? 1 : 0;
}

extern "C" uint32_t isaac_frame_opaque_424220_b1_entry(uint32_t subobj) {
  /* PE PATH1 tail: mov eax,[res+0x378]; test eax,eax; je 0x424263;
     mov eax,[eax+0xc]; ret — same instruction shape as v43 0x423970. */
  if (subobj == 0u) {
    return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424220_NULL_MARKER);
  }
  return *reinterpret_cast<const uint32_t*>(
      subobj + static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424220_RTTI_ENTRY_OFF));
}

extern "C" uint32_t isaac_frame_opaque_424220_b2_delta(uint32_t hi,
                                                       uint32_t lo) {
  /* PE @0x424274 mov eax,[ecx+0x1baac]; @0x42427a sub eax,[ecx+0x1baa8]
     — 32-bit wrap difference (hi - lo mod 2^32). */
  return hi - lo;
}

extern "C" int32_t isaac_frame_opaque_424220_b2_gate(uint32_t delta) {
  /* PE @0x424280 test eax,0xfffffffc; @0x424285 je 0x424296 — FULL-DWORD
     mask test: (delta & 0xfffffffc)==0 selects DEFAULT. */
  return ((delta & static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424220_DELTA_MASK)) == 0u)
             ? 1
             : 0;
}

extern "C" uint32_t isaac_frame_opaque_424220_b2_result(uint32_t obj) {
  /* PE PATH2 tail: push 0; call 0x417870 (Game::GetPlayer(0)); mov
     eax,[eax+0x1618]; ret — same shape as v43 0x423950 read_id. */
  return *reinterpret_cast<const uint32_t*>(
      obj + static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424220_RESULT_ID_OFF));
}

extern "C" uint32_t isaac_frame_opaque_424220_case_a_global_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424220_CASE_A_GLOBAL_VA);
}
extern "C" uint32_t isaac_frame_opaque_424220_null_marker(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424220_NULL_MARKER);
}
extern "C" uint32_t isaac_frame_opaque_424220_default_result(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424220_DEFAULT_RESULT);
}
extern "C" uint32_t isaac_frame_opaque_424220_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424220_VA);
}
extern "C" uint32_t isaac_frame_opaque_424220_end_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424220_END_VA);
}
extern "C" uint32_t isaac_frame_opaque_424220_host1_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424220_HOST1_VA);
}
extern "C" uint32_t isaac_frame_opaque_424220_host2_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424220_HOST2_VA);
}

/* ---- FUN_004242b0 SEH dispatch peel (ABI v50) ----
   PE 0x004242b0..0x424305 ret (SEH prologue, handler 0xaf0d10, cookie
   [0xbf93b4]; thiscall this=ecx; 0 E8, 2 INDIRECT calls). 8 callers
   0x68b361/0x691fc9/0x692059/0x69211d/0x783285/0x783359/0x8d2263/
   0x989b52. Body:
     esi = this; sub = [esi+4]
     if (sub != 0):                   @0x4242d8 test ecx,ecx / je 0x4242f6
        eax = [sub]; eax = [eax+0xc]  ; vtbl slot +0xc
        call eax                       @0x4242e1 INDIRECT HOST vcall
                                       ;   (thiscall receiver = sub) -> al
        if (al != 0):                  @0x4242e3 test al,al / je 0x4242f6
                                       ;   LOW-BYTE test
           cb = [0xc7e814]             @0x4242e7
           if (cb != 0):               @0x4242ec test eax,eax / je 0x4242f6
              push esi; call cb; add esp,4  @0x4242f1 INDIRECT HOST cdecl
   Pure laws: sub_gate (FULL-DWORD); al_gate (LOW-BYTE test al,al —
   0x100 -> 0); cb_gate (FULL-DWORD); fire_cb chain (sub!=0 &&
   (al&0xff)!=0 && cb!=0, order kept). Host leaves: vtable call 0x4242e1
   + callback call 0x4242f1. Shared indirect global 0xc7e814 (same pin
   as the 423cc0 block). */
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4242B0_VA == 0x004242b0u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4242B0_END_VA == 0x00424306u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4242B0_CALL_SITES == 8u,
              "4242b0 dispatch 0x4242b0..0x424305 ret, 8 callers");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4242B0_CALLER1_VA == 0x0068b361u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4242B0_CALLER2_VA == 0x00691fc9u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4242B0_CALLER3_VA == 0x00692059u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4242B0_CALLER4_VA == 0x0069211du &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4242B0_CALLER5_VA == 0x00783285u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4242B0_CALLER6_VA == 0x00783359u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4242B0_CALLER7_VA == 0x008d2263u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4242B0_CALLER8_VA == 0x00989b52u,
              "4242b0 callers 0x68b361/0x691fc9/0x692059/0x69211d/0x783285/0x783359/0x8d2263/0x989b52");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4242B0_SUB_OFF == 4u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4242B0_VTBL_CALL_OFF == 0xcu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4242B0_CB_GLOBAL_VA == 0x00c7e814u,
              "4242b0 layout: sub +4, vtbl slot +0xc, callback [0xc7e814]");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4242B0_SEH_HANDLER_VA == 0x00af0d10u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4242B0_COOKIE_VA == 0x00bf93b4u,
              "4242b0 SEH handler 0xaf0d10 + cookie [0xbf93b4]");

extern "C" int32_t isaac_frame_opaque_4242b0_sub_gate(uint32_t sub) {
  /* PE @0x4242d8 test ecx,ecx; @0x4242da je 0x4242f6 — FULL-DWORD. */
  return (sub != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_4242b0_al_gate(uint32_t al) {
  /* PE @0x4242e3 test al,al; @0x4242e5 je 0x4242f6 — the vcall returns
     in al and ONLY its LOW byte is tested: 0x100 -> 0, 0x1ff -> 1. */
  return ((al & 0xffu) != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_4242b0_cb_gate(uint32_t fnptr) {
  /* PE @0x4242ec test eax,eax; @0x4242ee je 0x4242f6 — FULL-DWORD. */
  return (fnptr != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_frame_opaque_4242b0_fire_cb(uint32_t sub,
                                                     uint32_t al,
                                                     uint32_t fnptr) {
  /* PE chain: sub!=0 -> vcall -> test al,al -> cb load -> test cb:
     the callback fires only when ALL THREE gates pass, in order. */
  if (sub == 0u) {
    return 0;
  }
  if ((al & 0xffu) == 0u) {
    return 0;
  }
  if (fnptr == 0u) {
    return 0;
  }
  return 1;
}

extern "C" uint32_t isaac_frame_opaque_4242b0_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4242B0_VA);
}
extern "C" uint32_t isaac_frame_opaque_4242b0_end_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4242B0_END_VA);
}
extern "C" uint32_t isaac_frame_opaque_4242b0_cb_global_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4242B0_CB_GLOBAL_VA);
}
extern "C" uint32_t isaac_frame_opaque_4242b0_seh_handler_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4242B0_SEH_HANDLER_VA);
}
extern "C" uint32_t isaac_frame_opaque_4242b0_cookie_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4242B0_COOKIE_VA);
}
extern "C" uint32_t isaac_frame_opaque_4242b0_call_sites(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4242B0_CALL_SITES);
}

/* ---- FUN_00424310 SEH ctor peel (ABI v51) ----
   PE 0x00424310..0x42441b ret (SEH prologue: handler 0xaf192d, cookie
   [0xbf93b4]; thiscall this=ecx; straight-line, no branches; 7 callers
   0x6f1ba6/0x857000/0x950d7a/0x956b44/0x956c36/0x95c4f3/0x95c5d7 —
   `lea ecx,[x+0x10]; call` ctor pattern). Body:
     this+0x00 = 0 (dword @0x42433c); this+0x10 = 0 (@0x424342);
     this+0x14 = 0xf (@0x424349 capacity); byte this+0x00 = 0
     (@0x424350 LOW-BYTE store); esi = this+0x18; [esi]=0 (@0x424362);
     [esi+4]=0 (@0x424368); push 0x14; call 0xa0f4c0 (@0x42436f HOST
     alloc, NO null test); mov ecx,edi (@0x424377 thiscall receiver);
     [eax]=eax (@0x424379); [eax+4]=eax (@0x42437b); [eax+8]=eax
     (@0x42437e node self-links); word [eax+0xc] = 0x101 (@0x424381
     WORD magic store); [esi]=eax (@0x424387 this+0x18 = node);
     this+0x20..0x34 = 0 (6 dwords), this+0x48..0x50 = 0 (3 dwords),
     this+0x8c..0xa0 = 0 (6 dwords); call 0x424440 (@0x424404 HOST
     sub-init, thiscall this); eax = this; ret @0x42441b.
   Final-state dword-zero offsets (18): 0x00, 0x10, 0x1c, 0x20, 0x24,
   0x28, 0x2c, 0x30, 0x34, 0x48, 0x4c, 0x50, 0x8c, 0x90, 0x94, 0x98,
   0x9c, 0xa0 (+0x18 = node, +0x14 = 0xf — NOT zero). */
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_424310_VA == 0x00424310u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424310_END_VA == 0x0042441cu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424310_CALL_SITES == 7u,
              "424310 ctor 0x424310..0x42441b ret, 7 callers");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_424310_CALLER1_VA == 0x006f1ba6u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424310_CALLER2_VA == 0x00857000u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424310_CALLER3_VA == 0x00950d7au &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424310_CALLER4_VA == 0x00956b44u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424310_CALLER5_VA == 0x00956c36u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424310_CALLER6_VA == 0x0095c4f3u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424310_CALLER7_VA == 0x0095c5d7u,
              "424310 callers 0x6f1ba6/0x857000/0x950d7a/0x956b44/0x956c36/0x95c4f3/0x95c5d7");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_424310_SEH_HANDLER_VA == 0x00af192du &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424310_COOKIE_VA == 0x00bf93b4u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424310_ALLOC_SIZE == 0x14u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424310_ALLOC_HOST_VA == 0x00a0f4c0u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424310_SUBINIT_HOST_VA == 0x00424440u,
              "424310 SEH handler 0xaf192d + cookie [0xbf93b4] + alloc 0x14 @0xa0f4c0 + sub-init 0x424440");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_424310_CAPACITY_OFF == 0x14u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424310_CAPACITY_INIT == 0xfu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424310_NODE_OFF == 0x18u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424310_NODE_SIZE == 0x14u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424310_NODE_SELF_LINK_COUNT == 3u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424310_NODE_WORD_OFF == 0xcu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424310_NODE_MAGIC == 0x101u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424310_ZERO_DWORD_COUNT == 18u,
              "424310 layout: cap +0x14=0xf, node +0x18 size 0x14, self-links 0/4/8, word magic 0x101, 18 zero dwords");

extern "C" uint32_t isaac_frame_opaque_424310_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424310_VA);
}
extern "C" uint32_t isaac_frame_opaque_424310_end_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424310_END_VA);
}
extern "C" uint32_t isaac_frame_opaque_424310_call_sites(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424310_CALL_SITES);
}
extern "C" uint32_t isaac_frame_opaque_424310_seh_handler_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424310_SEH_HANDLER_VA);
}
extern "C" uint32_t isaac_frame_opaque_424310_cookie_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424310_COOKIE_VA);
}
extern "C" uint32_t isaac_frame_opaque_424310_alloc_size(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424310_ALLOC_SIZE);
}
extern "C" uint32_t isaac_frame_opaque_424310_alloc_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424310_ALLOC_HOST_VA);
}
extern "C" uint32_t isaac_frame_opaque_424310_subinit_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424310_SUBINIT_HOST_VA);
}
extern "C" uint32_t isaac_frame_opaque_424310_capacity_init(void) {
  /* PE @0x424349 mov dword ptr [edi+0x14], 0xf — FULL-DWORD constant. */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424310_CAPACITY_INIT);
}
extern "C" uint32_t isaac_frame_opaque_424310_node_word_magic(void) {
  /* PE @0x424381 `66 c7 40 0c 01 01` — WORD store of 0x101 at node+0xc.
     The 16-bit width is the law: 0x101 fits, high 16 bits of any wider
     value would be dropped. */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424310_NODE_MAGIC);
}
extern "C" uint32_t isaac_frame_opaque_424310_zero_dword_count(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424310_ZERO_DWORD_COUNT);
}
extern "C" uint32_t isaac_frame_opaque_424310_node_self_link(uint32_t node) {
  /* PE @0x424379/0x42437b/0x42437e: [eax]=eax; [eax+4]=eax; [eax+8]=eax —
     the FULL node address is stored at node+0/+4/+8 (3 self-links). The
     stored value is the full 32-bit node, NOT a truncated low byte. */
  return node;
}
extern "C" int32_t isaac_frame_opaque_424310_zeroed_at(uint32_t off) {
  /* Final-state dword-zero store table (18 offsets, from the PE store
     stream): 0x00,0x10,0x1c,0x20,0x24,0x28,0x2c,0x30,0x34,0x48,0x4c,
     0x50,0x8c,0x90,0x94,0x98,0x9c,0xa0. +0x18 is the NODE (not zero),
     +0x14 is the CAPACITY 0xf (not zero). */
  switch (off) {
    case 0x00u: case 0x10u: case 0x1cu: case 0x20u: case 0x24u:
    case 0x28u: case 0x2cu: case 0x30u: case 0x34u: case 0x48u:
    case 0x4cu: case 0x50u: case 0x8cu: case 0x90u: case 0x94u:
    case 0x98u: case 0x9cu: case 0xa0u:
      return 1;
    default:
      return 0;
  }
}

/* ---- FUN_00424440 sub-init peel (ABI v52) ----
   PE 0x00424440..0x424501 ret (thiscall this=ecx; straight-line, no
   branches; 14 callers 0x424404 (inside the v51 424310 ctor!)/0x426a83/
   0x6f1bc6/0x6f446f/0x857020/0x8e547c/0x8e56e2/0x8e5752/0x8eba12/
   0x950d9a/0x958b66/0x981284/0x9812d4/0x9ab185; callee 0x424540 = _Tree
   erase — HOST, pinned in room/render-shell/game-render). Body:
     esi = node = [this+0x18]; lea edi,[this+0x18]; mov ecx,edi
     (receiver = &this+0x18, the tree head holder);
     push [node+4] (@0x42444d — the erase arg read is node's +4 dword);
     push edi; call 0x424540 (@0x424451 HOST _Tree erase)
     node RE-self-links: [node]=node (@0x424459); [node+4]=node
     (@0x424456); [node+8]=node (@0x42445b) — FULL 32-bit node address,
     the after-erase relink (v51's 424310 self-links the FRESH node,
     this body re-links the SAME node after the erase);
     [this+0x1c]=0 (@0x42445e dword);
     copy pairs: [this+0x24]=[this+0x20] (@0x424465/68);
     [this+0x30]=[this+0x2c] (@0x42446b/6f);
     eax=[this+0x98] (@0x424472 SNAPSHOT read BEFORE the zero storm);
     [this+0x9c]=eax (@0x4244fa written LAST, after all 16 zeroes);
     16 dword-zero stores: +0x1c,+0x3c,+0x40,+0x44,+0x54,+0x58,+0x5c,
     +0x60,+0x64,+0x68,+0x70,+0x78,+0x7c,+0x80,+0x84,+0x88;
     DWORD +0x38=0xffffffff (@0x42449b — NOT zero);
     BYTE +0x6c=1 (@0x4244be `c6 43 6c 01` LOW-BYTE);
     BYTE +0x74=0 (@0x4244e5 `c6 43 74 00` LOW-BYTE, not a dword-zero);
     ret @0x424501; END 0x424502; next function 0x424510. */
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_424440_VA == 0x00424440u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424440_END_VA == 0x00424502u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424440_CALL_SITES == 14u,
              "424440 sub-init 0x424440..0x424501 ret, 14 callers");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_424440_CALLER1_VA == 0x00424404u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424440_CALLER2_VA == 0x00426a83u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424440_CALLER3_VA == 0x006f1bc6u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424440_CALLER4_VA == 0x006f446fu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424440_CALLER5_VA == 0x00857020u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424440_CALLER6_VA == 0x008e547cu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424440_CALLER7_VA == 0x008e56e2u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424440_CALLER8_VA == 0x008e5752u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424440_CALLER9_VA == 0x008eba12u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424440_CALLER10_VA == 0x00950d9au &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424440_CALLER11_VA == 0x00958b66u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424440_CALLER12_VA == 0x00981284u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424440_CALLER13_VA == 0x009812d4u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424440_CALLER14_VA == 0x009ab185u,
              "424440 callers incl. the v51 424310 ctor @0x424404");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_424440_ERASE_HOST_VA == 0x00424540u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424440_NODE_OFF == 0x18u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424440_ERASE_ARG_OFF == 4u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424440_ZERO_DWORD_COUNT == 16u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424440_COPY_COUNT == 3u,
              "424440 layout: tree head this+0x18, erase arg [node+4], 16 zero dwords, 3 copy pairs");

extern "C" uint32_t isaac_frame_opaque_424440_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424440_VA);
}
extern "C" uint32_t isaac_frame_opaque_424440_end_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424440_END_VA);
}
extern "C" uint32_t isaac_frame_opaque_424440_call_sites(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424440_CALL_SITES);
}
extern "C" uint32_t isaac_frame_opaque_424440_erase_host_va(void) {
  /* @0x424451 call rel32 -> 0x424540 (_Tree erase) stays HOST: pinned in
     room/render-shell/game-render families. The exit family calls whole
     0x424440 as ITS residual host; we only transcribe the prefix laws. */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424440_ERASE_HOST_VA);
}
extern "C" uint32_t isaac_frame_opaque_424440_node_off(void) {
  /* The tree head holder = this+0x18 (RE-LOADED @0x424444 mov esi,[ebx+0x18]
     and receiver lea edi,[ebx+0x18] @0x424448). */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424440_NODE_OFF);
}
extern "C" uint32_t isaac_frame_opaque_424440_erase_arg_off(void) {
  /* @0x42444d push dword ptr [esi+4] — the erase argument is the +4 dword
     of the node POINTED TO by this+0x18 (NOT node+0 or node+8). */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424440_ERASE_ARG_OFF);
}
extern "C" uint32_t isaac_frame_opaque_424440_node_self_link(uint32_t node) {
  /* PE @0x424456/0x424459/0x42445b: [esi+4]=esi; [esi]=esi; [esi+8]=esi —
     the FULL 32-bit node address is the stored value (after-erase relink),
     NOT a truncated low byte. */
  return node;
}
extern "C" uint32_t isaac_frame_opaque_424440_zero_dword_count(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424440_ZERO_DWORD_COUNT);
}
extern "C" int32_t isaac_frame_opaque_424440_zeroed_at(uint32_t off) {
  /* Final-state DWORD-zero store table (16 offsets, from the PE store
     stream): 0x1c,0x3c,0x40,0x44,0x54,0x58,0x5c,0x60,0x64,0x68,0x70,0x78,
     0x7c,0x80,0x84,0x88. +0x18 is the NODE (not zero), +0x38 is 0xffffffff
     (not zero), +0x9c is the copy DEST (not zero), +0x74 is a BYTE-zero
     (c6 form — NOT a dword-zero). */
  switch (off) {
    case 0x1cu: case 0x3cu: case 0x40u: case 0x44u: case 0x54u:
    case 0x58u: case 0x5cu: case 0x60u: case 0x64u: case 0x68u:
    case 0x70u: case 0x78u: case 0x7cu: case 0x80u: case 0x84u:
    case 0x88u:
      return 1;
    default:
      return 0;
  }
}
extern "C" uint32_t isaac_frame_opaque_424440_copy_count(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424440_COPY_COUNT);
}
extern "C" uint32_t isaac_frame_opaque_424440_copy_src_off(uint32_t k) {
  /* Copy-source offsets: k=0 -> 0x20 (read @0x424465), k=1 -> 0x2c (read
     @0x42446b), k=2 -> 0x98 (SNAPSHOT read @0x424472 BEFORE the zero
     storm). Out-of-range k -> 0xffffffff sentinel. */
  switch (k) {
    case 0u: return 0x20u;
    case 1u: return 0x2cu;
    case 2u: return 0x98u;
    default: return ISAAC_FRAME_OPAQUE_424440_OUT_OF_RANGE;
  }
}
extern "C" uint32_t isaac_frame_opaque_424440_copy_dst_off(uint32_t k) {
  /* Copy-destination offsets: k=0 -> 0x24 (store @0x424468), k=1 -> 0x30
     (store @0x42446f), k=2 -> 0x9c (store @0x4244fa, written LAST after
     all 16 zero stores + specials). Out-of-range k -> sentinel. */
  switch (k) {
    case 0u: return 0x24u;
    case 1u: return 0x30u;
    case 2u: return 0x9cu;
    default: return ISAAC_FRAME_OPAQUE_424440_OUT_OF_RANGE;
  }
}
extern "C" int32_t isaac_frame_opaque_424440_copy_snapshot(uint32_t k) {
  /* Only k==2 is a SNAPSHOT copy: its +0x98 source is read @0x424472
     BEFORE the zero-storm (0x424479..0x4244f0) and its +0x9c dest is
     written LAST @0x4244fa. k=0/1 are read-then-write immediately. */
  return (k == 2u) ? 1 : 0;
}
extern "C" uint32_t isaac_frame_opaque_424440_minus_one_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424440_MINUS_ONE_OFF);
}
extern "C" uint32_t isaac_frame_opaque_424440_minus_one_value(void) {
  /* PE @0x42449b `c7 43 38 ff ff ff ff` — FULL-DWORD 0xffffffff store at
     +0x38 (the ONLY non-zero dword store). NOT a byte -1, NOT zero. */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424440_MINUS_ONE_VALUE);
}
extern "C" uint32_t isaac_frame_opaque_424440_byte_one_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424440_BYTE_ONE_OFF);
}
extern "C" uint32_t isaac_frame_opaque_424440_byte_one_value(void) {
  /* PE @0x4244be `c6 43 6c 01` — BYTE store of 1 (LOW-BYTE width law; the
     upper 3 bytes of +0x6c are NOT written). NOT a dword-zero member. */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424440_BYTE_ONE_VALUE);
}
extern "C" uint32_t isaac_frame_opaque_424440_byte_zero_off(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424440_BYTE_ZERO_OFF);
}

/* ---- FUN_00424510 zero-ctor (ABI v53) ----
   PE 0x00424510..0x00424526 ret (thiscall this=ecx; straight-line, 5
   insns: 3 FULL-DWORD zero stores + mov eax,ecx + ret; 0 E8 calls, 0
   loads; 39 direct E8 callers; int3 pads 0x424502..0x42450f before /
   0x424527..0x42452f after; next fn 0x424530 = the v43 identity pin).
     [ecx]=0 (@0x424510 `c7 01` — FULL-DWORD zero store)
     eax=ecx (@0x424516 `8b c1` — body RETURNS this, full 32-bit)
     [ecx+4]=0 (@0x424518 `c7 41 04` — FULL-DWORD zero store)
     [ecx+8]=0 (@0x42451f `c7 41 08` — FULL-DWORD zero store)
     ret @0x424526; END 0x424527.
   PURE — the WHOLE body is transcribed; the boundary is REMOVED for
   these 39 call sites (no host call remains inside 0x424510). */
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_424510_VA == 0x00424510u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424510_END_VA == 0x00424527u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424510_CALL_SITES == 39u,
              "424510 zero-ctor 0x424510..0x424526 ret, 39 callers");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_424510_ZERO_DWORD_COUNT == 3u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424510_ZERO0_OFF == 0x00u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424510_ZERO1_OFF == 0x04u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424510_ZERO2_OFF == 0x08u,
              "424510 zero stores at +0/+4/+8 (FULL-DWORD c7)");

extern "C" uint32_t isaac_frame_opaque_424510_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424510_VA);
}
extern "C" uint32_t isaac_frame_opaque_424510_end_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424510_END_VA);
}
extern "C" uint32_t isaac_frame_opaque_424510_call_sites(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424510_CALL_SITES);
}
extern "C" uint32_t isaac_frame_opaque_424510_zero_dword_count(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424510_ZERO_DWORD_COUNT);
}
extern "C" int32_t isaac_frame_opaque_424510_zeroed_at(uint32_t off) {
  /* Final-state DWORD-zero store table (3 offsets, from the PE store
     stream @0x424510/0x424518/0x42451f): 0x00, 0x04, 0x08 — ALL `c7`
     FULL-DWORD zeros (NOT c6 byte stores). +0 elsewhere is untouched. */
  switch (off) {
    case 0x00u: case 0x04u: case 0x08u:
      return 1;
    default:
      return 0;
  }
}
extern "C" uint32_t isaac_frame_opaque_424510_zero_width_bytes(
    uint32_t off) {
  /* Store-width law: each of the 3 zero stores is a FULL-DWORD `c7`
     (4 bytes written), NOT a low-byte `c6` store (1 byte). Any other
     offset has NO store -> 0. */
  switch (off) {
    case 0x00u: case 0x04u: case 0x08u:
      return 4u;
    default:
      return 0u;
  }
}
extern "C" uint32_t isaac_frame_opaque_424510_return_this(
    uint32_t this_ptr) {
  /* PE @0x424516 `mov eax,ecx` — the body returns the FULL 32-bit `this`
     (receiver passthrough), NOT a truncated low byte. Drive wide. */
  return this_ptr;
}

/* ---- FUN_00424580 light-quad renderer NARROWED laws (ABI v54) ----
   PE 0x00424580..0x0042489b ret (thiscall this=ecx; 4 float xmm args +
   4 stack floats arg0=[ebp+8] min=[ebp+0xc] max=[ebp+0x10]
   r=[ebp+0x14]). 8 E8: 4x 0x499d60 (atan2 wrapper: cvtss2sd x2, fld x2,
   call CRT 0xaf08c3, cvtpd2ps — HOST) + 4x 0xa0f550 (packed ARGB → 4
   float channels /255, tail store; ALREADY LANDED in process_input
   v27 as isaac_manager_a0f550_* — recorded as host-edge reference,
   NOT re-transcribed). 2 callers 0x424a2f/0x424b3f (both inside
   FUN_004248a0). Body: entry bound = cvttss2si(xmm2) SIGNED (js ->
   0 iterations; loop counter 0..bound jle -> bound+1); xIdx16 =
   (uint16)(int)(xmm1+xmm3) (movzx ax LOW-16); dx = (float)xIdx16 -
   xmm3; ybase = xmm2 + arg0; per row: y16 = (uint16)(int)(ybase -
   (float)i); dy = (float)y16 - arg0; dist2 = f32(dy*dy + dx*dx) vs
   r2 = f32(r*r) comiss/jb -> radius gate; angle = atan2(dy,dx) ×
   57.2958 (0x42652ee0); jbe 0<=deg skips +360 (0x43b40000) — wrap only
   when deg<0 ordered; comiss/jb deg<min | max<deg -> window gate;
   byte k = (uint8)(int)(ch_k × 255.0 (0x437f0000)) stored at
   [base + (stride16*y16 + x16)*4 + 4 + k] (stride16=(uint16)[this+8],
   base=[this], k=0..3). All laws below are PURE scalar transcriptions
   (no host callee inside); atan2 + unpack stay host leaves. */
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_424580_VA == 0x00424580u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424580_END_VA == 0x0042489cu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424580_CALL_SITES == 2u,
              "424580 light-quad 0x424580..0x42489b ret, 2 callers");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_424580_ATAN_VA == 0x00499d60u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424580_UNPACK_VA == 0x00a0f550u,
              "424580 host leaves atan2 0x499d60 + ARGB unpack 0xa0f550");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_424580_DEG_RAD_BITS == 0x42652ee0u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424580_DEG_ADD_BITS == 0x43b40000u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424580_BYTE_SCALE_BITS == 0x437f0000u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424580_CELL_WRITE_OFF == 4u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424580_CHANNEL_COUNT == 4u,
              "424580 .rdata f32 consts (0xbaa948/0xbaab30/0xbaaae4) + cell");

extern "C" uint32_t isaac_frame_opaque_424580_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424580_VA);
}
extern "C" uint32_t isaac_frame_opaque_424580_end_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424580_END_VA);
}
extern "C" uint32_t isaac_frame_opaque_424580_call_sites(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424580_CALL_SITES);
}
extern "C" uint32_t isaac_frame_opaque_424580_atan_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424580_ATAN_VA);
}
extern "C" uint32_t isaac_frame_opaque_424580_unpack_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424580_UNPACK_VA);
}
extern "C" uint32_t isaac_frame_opaque_424580_iteration_count(
    uint32_t xmm2_bits) {
  /* PE @0x424586 cvttss2si eax,xmm2; test eax,eax; js 0x424895 (skip all)
     then loop counter 0..bound with SIGNED jle @0x42488f -> bound+1
     iterations when bound >= 0, else 0. cvttss2si saturates NaN/±Inf/
     out-of-range to INT32_MIN -> 0 iterations. */
  const int32_t bound =
      isaac_frame_opaque_4254b0_cvttss2si(xmm2_bits);
  if (bound < 0) {
    return 0u;
  }
  return static_cast<uint32_t>(bound) + 1u;
}
extern "C" int32_t isaac_frame_opaque_424580_radius_ok(
    uint32_t dx_bits, uint32_t dy_bits, uint32_t r_bits) {
  /* PE @0x42462c comiss xmm0(dist2), xmm5(r2); jb 0x424880 (skip) —
     process iff ORDERED dist2 >= r2; unordered (NaN) -> skip.
     dist2 = f32(f32(dy*dy) + dx2) with dx2 = f32(dx*dx) precomputed
     @0x4245ef; r2 = f32(r*r) @0x4245c0. */
  const float dx = __builtin_bit_cast(float, dx_bits);
  const float dy = __builtin_bit_cast(float, dy_bits);
  const float r = __builtin_bit_cast(float, r_bits);
  const float dx2 = dx * dx;              /* mulss rounds */
  const float dy2 = dy * dy;              /* mulss rounds */
  const float dist2 = dy2 + dx2;          /* addss rounds */
  const float r2 = r * r;                 /* mulss rounds */
  if (dist2 != dist2 || r2 != r2) {
    return 0;                             /* comiss unordered -> jb taken */
  }
  return (dist2 >= r2) ? 1 : 0;
}
extern "C" uint32_t isaac_frame_opaque_424580_x_idx16(
    uint32_t x1_bits, uint32_t x3_bits) {
  /* PE @0x4245b7 addss xmm0(xmm1),xmm4(xmm3); @0x4245c4 cvttss2si;
     @0x4245cd movzx eax,ax — LOW-16 truncation of the truncated sum.
     NaN/±Inf -> cvttss2si INT32_MIN -> (uint16)0. */
  const float x1 = __builtin_bit_cast(float, x1_bits);
  const float x3 = __builtin_bit_cast(float, x3_bits);
  const float sum = x1 + x3;              /* addss rounds */
  const int32_t t =
      isaac_frame_opaque_4254b0_cvttss2si(__builtin_bit_cast(uint32_t, sum));
  return static_cast<uint32_t>(static_cast<uint16_t>(t));
}
extern "C" uint32_t isaac_frame_opaque_424580_dy_f32(
    uint32_t ybase_bits, uint32_t arg0_bits, uint32_t counter) {
  /* PE loop head @0x424600: xmm1=(float)i (cvtdq2ps); xmm0 = ybase -
     (float)i (subss); cvttss2si; movzx edi,ax -> y16; then dy =
     (float)y16 - arg0 (subss @0x424615). ybase = f32(xmm2 + arg0)
     @0x4245e3. */
  const float ybase = __builtin_bit_cast(float, ybase_bits);
  const float arg0 = __builtin_bit_cast(float, arg0_bits);
  const float diff = ybase - static_cast<float>(counter); /* subss */
  const int32_t t =
      isaac_frame_opaque_4254b0_cvttss2si(__builtin_bit_cast(uint32_t, diff));
  const uint16_t y16 = static_cast<uint16_t>(t);
  const float dy = static_cast<float>(y16) - arg0; /* subss rounds */
  return __builtin_bit_cast(uint32_t, dy);
}
extern "C" uint32_t isaac_frame_opaque_424580_angle_deg(
    uint32_t atan_bits) {
  /* PE @0x424644 mulss xmm0,[0xbaa948] (57.2958 rad->deg); @0x42464f
     comiss xmm1(0),xmm0; jbe 0x42465c — skip add iff 0 <= deg OR
     unordered; @0x424654 addss +360.0 (0xbaab30). So wrap iff
     deg < 0 ORDERED; NaN deg stays NaN (no wrap). */
  const float atan = __builtin_bit_cast(float, atan_bits);
  const float deg_rad =
      __builtin_bit_cast(float, ISAAC_FRAME_OPAQUE_424580_DEG_RAD_BITS);
  const float deg_add =
      __builtin_bit_cast(float, ISAAC_FRAME_OPAQUE_424580_DEG_ADD_BITS);
  float deg = atan * deg_rad;             /* mulss rounds */
  if (deg < 0.0f) {                       /* ordered negative only */
    deg = deg + deg_add;                  /* addss rounds */
  }
  return __builtin_bit_cast(uint32_t, deg);
}
extern "C" int32_t isaac_frame_opaque_424580_angle_ok(
    uint32_t deg_bits, uint32_t min_bits, uint32_t max_bits) {
  /* PE @0x42465c comiss deg,[ebp+0xc] jb skip; @0x424667 comiss
     [ebp+0x10],deg jb skip — process iff ORDERED min <= deg <= max;
     NaN any operand -> jb taken -> 0. */
  const float deg = __builtin_bit_cast(float, deg_bits);
  const float min = __builtin_bit_cast(float, min_bits);
  const float max = __builtin_bit_cast(float, max_bits);
  if (deg != deg || min != min || max != max) {
    return 0;
  }
  return (min <= deg && deg <= max) ? 1 : 0;
}
extern "C" uint32_t isaac_frame_opaque_424580_byte_scale(
    uint32_t ch_bits) {
  /* PE write loop @0x424691: mulss xmm0,[0xbaaae4] (255.0); @0x42469a
     cvttss2si eax,xmm0; @0x42469e mov [..],al — LOW-BYTE of the
     saturating int32 (2.0 -> 510 -> 0xfe, NOT a clamp to 255). */
  const float ch = __builtin_bit_cast(float, ch_bits);
  const float scale =
      __builtin_bit_cast(float, ISAAC_FRAME_OPAQUE_424580_BYTE_SCALE_BITS);
  const int32_t t =
      isaac_frame_opaque_4254b0_cvttss2si(
          __builtin_bit_cast(uint32_t, ch * scale)); /* mulss rounds */
  return static_cast<uint32_t>(static_cast<uint8_t>(t));
}
extern "C" uint32_t isaac_frame_opaque_424580_cell_off(
    uint32_t stride, uint32_t y16, uint32_t x16) {
  /* PE @0x424676 movzx edx,word [ebx+8] (stride16); @0x424686 imul
     edx,edi (y16); @0x424689 add edx,[ebp-0x14] (x16); @0x42468c lea
     edx,[ecx+edx*4] -> byte cell = base + (stride16*y16 + x16)*4,
     32-bit wrap. Bytes k=0..3 stored at cell + 4 + k. */
  const uint32_t s16 = stride & 0xffffu;
  const uint32_t y = y16 & 0xffffu;
  const uint32_t x = x16 & 0xffffu;
  return (s16 * y + x) * 4u;              /* 32-bit wrap imul/lea */
}

/* ---- FUN_00499d60 atan2 wrapper LAW (ABI v55) ----
   PE 0x00499d60..0x00499d98 ret (28 insns, 1 E8, 0 indirect, 2 scratch
   stores). xmm0=y, xmm1=x (float args). cvtss2sd y -> [esp] -> fld y
   (st0=y); cvtss2sd x -> [esp] -> fld x (st0=x, st1=y); call 0xaf08c3
   = jmp [IAT 0xb187f8] = CRT _CIatan2 (x87 register atan2: st1=y,
   st0=x -> st0); fstp [esp]; movsd xmm0; cvtpd2ps -> FLOAT result.
   179 direct rel32 callers (game-wide float angle primitive). CRT
   _CIatan2 is pinned as a KNOWN PLATFORM PRIMITIVE (fdlibm-derived
   double atan2; wasm f64.atan2 = same algorithm family in the same
   engine). The law widens BEFORE atan2 (cvtss2sd is exact) and narrows
   AFTER (cvtpd2ps) — double rounding is part of the transcription. */
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_499D60_VA == 0x00499d60u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_499D60_END_VA == 0x00499d99u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_499D60_CALL_SITES == 179u,
              "499d60 atan2 wrapper 0x499d60..0x499d98 ret, 179 callers");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_499D60_CRT_VA == 0x00af08c3u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_499D60_IAT_VA == 0x00b187f8u,
              "499d60 CRT leaf 0xaf08c3 = IAT _CIatan2 0xb187f8");

extern "C" uint32_t isaac_frame_opaque_499d60_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_499D60_VA);
}
extern "C" uint32_t isaac_frame_opaque_499d60_end_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_499D60_END_VA);
}
extern "C" uint32_t isaac_frame_opaque_499d60_call_sites(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_499D60_CALL_SITES);
}
extern "C" uint32_t isaac_frame_opaque_499d60_crt_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_499D60_CRT_VA);
}
extern "C" uint32_t isaac_frame_opaque_499d60_iat_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_499D60_IAT_VA);
}
extern "C" uint32_t isaac_frame_opaque_499d60_atan2(
    uint32_t y_bits, uint32_t x_bits) {
  /* PE @0x499d69 cvtss2sd xmm0(y); @0x499d78 cvtss2sd xmm0,xmm1(x);
     @0x499d84 call _CIatan2 (atan2(y,x) double); @0x499d91 cvtpd2ps —
     float result. Widen-then-atan2-then-narrow: double rounding. */
  const float y = __builtin_bit_cast(float, y_bits);
  const float x = __builtin_bit_cast(float, x_bits);
  const double yd = static_cast<double>(y);   /* cvtss2sd exact widen */
  const double xd = static_cast<double>(x);   /* cvtss2sd exact widen */
  const double r = __builtin_atan2(yd, xd);   /* CRT _CIatan2 primitive */
  const float rf = static_cast<float>(r);     /* cvtpd2ps rounds */
  return __builtin_bit_cast(uint32_t, rf);
}

/* ---- FUN_004248a0 transitional SEAMS (ABI v55) ----
   PE 0x004248a0..0x00424c32 ret (SEH + GS cookie; 5 E8: 0xa230b0 /
   0xaf05e5 / 0xa0f4c0 / FUN_00424580 x2 / ... + 2 indirect virtual
   release @0x424bfe + [0xc7163c] registry @0x424c11 — ALL host; the
   function stays HOST). Peeled pure scalar seams, P1=[ebp+8],
   P2=[ebp+0xc]: cell geometry (width16=(uint16)(P1+1) @0x4248d6,
   height16=(uint16)(P2+1) @0x4248cb; cell_bytes=(w*h)*4+4 imul/lea
   @0x4248e0..0x4248e9; sx=(uint16)P1>>1 / sy=(uint16)P2>>1 shr-ax
   @0x424942..0x424957); prologue float island (sx2 @0x424970, sy2
   @0x424974, two_sx2 @0x424983, two_sy2 @0x424992, t1=sy*two_sx2
   @0x42499b, t2s=two_sy2*+0.0 @0x4249a4 (xorps xmm0 @0x424978 —
   faithful slot), t3=sy*sx2 @0x4249b2, acc0=(sy2-t3)+sx2*0.25
   @0x4249c3..0x4249dc); gate1 comiss t1,t2s / jbe 0x424ab3 @0x4249af/
   0x4249e5; mid island (acc2 @0x424ab3..0x424aed: a+0.5, b-1.0, squares,
   x sy2/sx2, - sy2*sx2); gate2 comiss b,0.0 / jb 0x424bbc @0x424ab3/
   0x424af2. .rdata consts: 1.0f [0xbaa454], 0.25f [0xbaa1d4], 0.0f
   [0xba9fe4], 0.5f [0xbaa2d0]. 1 caller 0x424de8. */
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4248A0_VA == 0x004248a0u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4248A0_END_VA == 0x00424c33u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4248A0_CALL_SITES == 1u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4248A0_BAND_A_VA == 0x00424580u,
              "4248a0 host body 0x4248a0..0x424c32 ret, 1 caller 0x424de8");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_4248A0_Q025_BITS == 0x3e800000u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4248A0_ONE_BITS == 0x3f800000u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4248A0_ZERO_BITS == 0x00000000u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_4248A0_HALF_BITS == 0x3f000000u,
              "4248a0 .rdata f32 consts 0xbaa454/0xbaa1d4/0xba9fe4/0xbaa2d0");

extern "C" uint32_t isaac_frame_opaque_4248a0_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4248A0_VA);
}
extern "C" uint32_t isaac_frame_opaque_4248a0_end_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4248A0_END_VA);
}
extern "C" uint32_t isaac_frame_opaque_4248a0_call_sites(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4248A0_CALL_SITES);
}
extern "C" uint32_t isaac_frame_opaque_4248a0_band_a_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_4248A0_BAND_A_VA);
}
extern "C" uint32_t isaac_frame_opaque_4248a0_cell_bytes(
    uint32_t p1, uint32_t p2) {
  /* PE @0x4248cb eax=[ebp+0xc]; inc; movzx edi,ax (height16);
     @0x4248d6 eax=[ebp+8]; inc; movzx ebx,ax (width16); @0x4248e0
     movzx edx,bx; imul edx,edi; @0x4248e9 lea eax,[edx*4+4] — 32-bit
     wrap, feeds 0xa230b0 + memset + [ebx+4]. */
  const uint32_t w = (p1 + 1u) & 0xffffu;
  const uint32_t h = (p2 + 1u) & 0xffffu;
  return (w * h) * 4u + 4u;               /* 32-bit wrap imul/lea */
}
extern "C" uint32_t isaac_frame_opaque_4248a0_half_x(uint32_t p1) {
  /* PE @0x424942 mov eax,[ebp+8]; shr ax,1; movzx esi — 16-bit shift of
     the TRUNCATED (uint16) value: p1=0x10000 -> (uint16)0 -> 0. */
  return (p1 & 0xffffu) >> 1u;
}
extern "C" uint32_t isaac_frame_opaque_4248a0_half_y(uint32_t p2) {
  /* PE @0x42494e mov eax,[ebp+0xc]; shr ax,1; movzx edi — same law. */
  return (p2 & 0xffffu) >> 1u;
}
extern "C" uint32_t isaac_frame_opaque_4248a0_sx2(uint32_t sx) {
  /* PE @0x424957 movd xmm0,esi; cvtdq2ps xmm0 ((float)sx); @0x424970
     mulss xmm7,xmm0 -> f32((float)sx * (float)sx). */
  const float f = static_cast<float>(sx);
  return __builtin_bit_cast(uint32_t, f * f);   /* mulss rounds */
}
extern "C" uint32_t isaac_frame_opaque_4248a0_sy2(uint32_t sy) {
  /* PE @0x42495e movd xmm2,edi; cvtdq2ps; @0x424974 mulss xmm3,xmm2. */
  const float f = static_cast<float>(sy);
  return __builtin_bit_cast(uint32_t, f * f);   /* mulss rounds */
}
extern "C" uint32_t isaac_frame_opaque_4248a0_two_sx2(uint32_t sx2_bits) {
  /* PE @0x424983 addss xmm6,xmm7 (two_sx2) — single addss round. */
  const float x = __builtin_bit_cast(float, sx2_bits);
  return __builtin_bit_cast(uint32_t, x + x);
}
extern "C" uint32_t isaac_frame_opaque_4248a0_two_sy2(uint32_t sy2_bits) {
  /* PE @0x424992 addss xmm1,xmm3 (two_sy2). */
  const float x = __builtin_bit_cast(float, sy2_bits);
  return __builtin_bit_cast(uint32_t, x + x);
}
extern "C" uint32_t isaac_frame_opaque_4248a0_t1(
    uint32_t sy, uint32_t two_sx2_bits) {
  /* PE @0x42499b mulss xmm2(sy float),xmm6(two_sx2) -> t1. */
  const float syf = static_cast<float>(sy);
  const float t = __builtin_bit_cast(float, two_sx2_bits);
  return __builtin_bit_cast(uint32_t, syf * t);
}
extern "C" uint32_t isaac_frame_opaque_4248a0_t3(
    uint32_t sy, uint32_t sx2_bits) {
  /* PE @0x4249b2 mulss xmm0(sy float),xmm7(sx2) -> t3. */
  const float syf = static_cast<float>(sy);
  const float s = __builtin_bit_cast(float, sx2_bits);
  return __builtin_bit_cast(uint32_t, syf * s);
}
extern "C" uint32_t isaac_frame_opaque_4248a0_acc0(
    uint32_t sy2_bits, uint32_t t3_bits, uint32_t sx2_bits) {
  /* PE @0x4249c3 subss xmm3(sy2),xmm0(t3); @0x4249d4 mulss
     xmm0(sx2),[0xbaa1d4]=0.25f; @0x4249dc addss xmm3,xmm0 ->
     acc0 = f32(f32(sy2-t3) + f32(sx2*0.25f)). */
  const float sy2 = __builtin_bit_cast(float, sy2_bits);
  const float t3 = __builtin_bit_cast(float, t3_bits);
  const float sx2 = __builtin_bit_cast(float, sx2_bits);
  const float q = __builtin_bit_cast(float,
      ISAAC_FRAME_OPAQUE_4248A0_Q025_BITS);
  const float d = sy2 - t3;               /* subss rounds */
  const float m = sx2 * q;                /* mulss rounds */
  return __builtin_bit_cast(uint32_t, d + m); /* addss rounds */
}
extern "C" int32_t isaac_frame_opaque_4248a0_loop1_enter(
    uint32_t t1_bits, uint32_t two_sy2_bits) {
  /* PE @0x4249a4 mulss xmm1,xmm0 with xmm0=+0 (xorps @0x424978) ->
     t2s = f32(two_sy2 * +0.0f); @0x4249af comiss xmm2(t1),xmm1(t2s);
     @0x4249e5 jbe 0x424ab3 — loop 1 RUNS iff ORDERED t1 > t2s (NaN
     any side: comiss CF=ZF=PF=1 -> jbe taken -> skip). */
  const float t1 = __builtin_bit_cast(float, t1_bits);
  const float two_sy2 = __builtin_bit_cast(float, two_sy2_bits);
  const float t2s = two_sy2 * 0.0f;       /* mulss by +0.0 */
  if (t1 != t1 || t2s != t2s) {
    return 0;                             /* comiss unordered -> jbe */
  }
  return (t1 > t2s) ? 1 : 0;
}
extern "C" uint32_t isaac_frame_opaque_4248a0_mid_acc(
    uint32_t a_bits, uint32_t b_bits, uint32_t sx2_bits,
    uint32_t sy2_bits) {
  /* PE @0x424abf..0x424aed: a=[ebp+8] (xmm5), b=[ebp+0xc] (xmm4);
     acc2 = f32( f32(f32(a+0.5f)^2)*sy2 + f32(f32(b-1.0f)^2)*sx2
     - f32(sy2*sx2) ) with 0.5f=[0xbaa2d0], 1.0f=[0xbaa454]. */
  const float a = __builtin_bit_cast(float, a_bits);
  const float b = __builtin_bit_cast(float, b_bits);
  const float sx2 = __builtin_bit_cast(float, sx2_bits);
  const float sy2 = __builtin_bit_cast(float, sy2_bits);
  const float half = __builtin_bit_cast(float,
      ISAAC_FRAME_OPAQUE_4248A0_HALF_BITS);
  const float one = __builtin_bit_cast(float,
      ISAAC_FRAME_OPAQUE_4248A0_ONE_BITS);
  const float ap = a + half;              /* addss @0x424ac2 */
  const float bm = b - one;               /* subss @0x424acd */
  const float ap2 = ap * ap;              /* mulss @0x424ad1 */
  const float bm2 = bm * bm;              /* mulss @0x424ad5 */
  const float t = ap2 * sy2;              /* mulss @0x424ad9 */
  const float u = bm2 * sx2;              /* mulss @0x424add */
  const float v = sy2 * sx2;              /* mulss @0x424ae1 */
  const float w = t + u;                  /* addss @0x424ae5 */
  const float r = w - v;                  /* subss @0x424ae9 */
  return __builtin_bit_cast(uint32_t, r);
}
extern "C" int32_t isaac_frame_opaque_4248a0_loop2_enter(
    uint32_t b_bits) {
  /* PE @0x424ab3 comiss xmm4(b),[0xba9fe4]=0.0f; @0x424af2 jb
     0x424bbc — loop 2 RUNS iff ORDERED b >= 0.0f (jb = b<0.0 CF=1;
     NaN: comiss CF=1 -> jb taken -> skip). */
  const float b = __builtin_bit_cast(float, b_bits);
  if (b != b) {
    return 0;                             /* comiss unordered -> jb */
  }
  return (b >= 0.0f) ? 1 : 0;
}

/* ---- FUN_00424c40 pair-ctor SEAMS (ABI v56) ----
   PE 0x00424c40..0x00424cc3 ret (thiscall this=ecx; straight-line, no
   branches; SEH filter 0xaf198d, GS cookie [0xbf93b4]; 36 insns, 2 E8
   (both -> 0x40c4a0), 0 indirect, 11 stores; 3 direct callers
   0x6f190b (`lea ecx,[esi+0x7dc]`)/0x6f191a (`lea ecx,[esi+0x808]`) in
   the big ctor that holds v51 424310 / v52 424440 callers, + 0x6f2358
   (`lea ecx,[esi+0x238]`) in a second ctor — both enclosing ctors stay
   HOST). Body: push 0; call 0x40c4a0 (ecx=this @0x424c6b — pair attach
   member 0); push 0; lea ecx,[esi+8]; [ebp-4]=0 (SEH state); call
   0x40c4a0 (@0x424c7c — pair attach member 8); 7 FULL-DWORD zero
   stores +0x10,+0x14,+0x18,+0x1c,+0x24,+0x20,+0x28 @0x424c81..0x424cad
   — the PE stores +0x24 BEFORE +0x20; eax=esi @0x424c88 -> returns
   `this`; ret @0x424cc3. 0x40c4a0 = pair ctor, HOST: SEH 0xaf0d44 +
   raw alloc 0x18 0xa0f4c0 + sub-ctor 0x40cc10 (vtables 0xb1a6fc/
   0xb81c0c) + vtable 0xb1a6e0 + [new+0x14]=arg + the [0xc7163c]
   IRREDUCIBLE registry gate + virtual release (pattern PROVEN at
   0x40c7f0 v71; exit family pins 0x40c4a0 as the 0x40c7f0 sibling
   pair ctor; anm2 lists it as a LoadGraphics host leaf). */
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_424C40_VA == 0x00424c40u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424C40_END_VA == 0x00424cc4u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424C40_CALL_SITES == 3u,
              "424c40 pair-ctor 0x424c40..0x424cc3 ret, 3 callers");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_424C40_CALLER1_VA == 0x006f190bu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424C40_CALLER2_VA == 0x006f191au &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424C40_CALLER3_VA == 0x006f2358u,
              "424c40 callers in the two enclosing ctors (0x6f19xx/0x6f2358)");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_424C40_SEH_HANDLER_VA == 0x00af198du &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424C40_COOKIE_VA == 0x00bf93b4u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424C40_PAIR_HOST_VA == 0x0040c4a0u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424C40_PAIR0_OFF == 0u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424C40_PAIR1_OFF == 8u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424C40_PAIR_ARG == 0u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424C40_PAIR0_CALL_VA == 0x00424c6bu &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424C40_PAIR1_CALL_VA == 0x00424c7cu,
              "424c40 pair attach: ecx=this/this+8, push 0, call 0x40c4a0");
static_assert((uint32_t)ISAAC_FRAME_OPAQUE_424C40_ZERO_DWORD_COUNT == 7u &&
                  (uint32_t)ISAAC_FRAME_OPAQUE_424C40_NO_STORE_BYTE == 0xffu,
              "424c40 7 dword-zero stores + 0xff no-store sentinel");

extern "C" uint32_t isaac_frame_opaque_424c40_host_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424C40_VA);
}
extern "C" uint32_t isaac_frame_opaque_424c40_end_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424C40_END_VA);
}
extern "C" uint32_t isaac_frame_opaque_424c40_call_sites(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424C40_CALL_SITES);
}
extern "C" uint32_t isaac_frame_opaque_424c40_seh_handler_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424C40_SEH_HANDLER_VA);
}
extern "C" uint32_t isaac_frame_opaque_424c40_cookie_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424C40_COOKIE_VA);
}
extern "C" uint32_t isaac_frame_opaque_424c40_pair_host_va(void) {
  /* The pair-attach callee (2x, ecx=this/this+8) stays HOST: alloc +
     sub-ctor 0x40cc10 + vtable + the [0xc7163c] IRREDUCIBLE registry
     gate + virtual release (pattern PROVEN at 0x40c7f0 v71; exit
     family pins the same pair record; anm2 lists it as a LoadGraphics
     host leaf). */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424C40_PAIR_HOST_VA);
}
extern "C" uint32_t isaac_frame_opaque_424c40_pair0_off(void) {
  /* @0x424c64 mov esi,ecx; @0x424c6b call — first attach receiver is
     `this` itself (offset 0). */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424C40_PAIR0_OFF);
}
extern "C" uint32_t isaac_frame_opaque_424c40_pair1_off(void) {
  /* @0x424c72 lea ecx,[esi+8] — second attach receiver is this+8. */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424C40_PAIR1_OFF);
}
extern "C" uint32_t isaac_frame_opaque_424c40_pair_arg(void) {
  /* @0x424c69 / @0x424c70 `push 0` — BOTH attach calls pass the pair
     VALUE 0 (the pair stores value=arg at [pair+0], obj at [pair+4]). */
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424C40_PAIR_ARG);
}
extern "C" uint32_t isaac_frame_opaque_424c40_pair0_call_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424C40_PAIR0_CALL_VA);
}
extern "C" uint32_t isaac_frame_opaque_424c40_pair1_call_va(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424C40_PAIR1_CALL_VA);
}
extern "C" uint32_t isaac_frame_opaque_424c40_zero_dword_count(void) {
  return static_cast<uint32_t>(ISAAC_FRAME_OPAQUE_424C40_ZERO_DWORD_COUNT);
}
extern "C" int32_t isaac_frame_opaque_424c40_zeroed_at(uint32_t off) {
  /* Final-state DWORD-zero store table (7 offsets, from the PE store
     stream @0x424c81..0x424cad): 0x10, 0x14, 0x18, 0x1c, 0x24, 0x20,
     0x28 — ALL `c7` FULL-DWORD zeros. +0x00/+0x04/+0x08 are the pair
     members (write by 0x40c4a0), NOT zeroed here. +0x28 is the last. */
  switch (off) {
    case 0x10u: case 0x14u: case 0x18u: case 0x1cu:
    case 0x24u: case 0x20u: case 0x28u:
      return 1;
    default:
      return 0;
  }
}
extern "C" uint32_t isaac_frame_opaque_424c40_zero_store_index(
    uint32_t off) {
  /* PE STORE ORDER @0x424c81..0x424cad: +0x10, +0x14, +0x18, +0x1c,
     +0x24, +0x20, +0x28 — the PE stores +0x24 BEFORE +0x20 (the quirk
     is the law). Returns the store index 0..6 for a zeroed offset, or
     NO_STORE_BYTE (0xff) when the offset has no zero store. Byte-gated:
     the result is a byte-width value. */
  switch (off) {
    case 0x10u: return 0u;
    case 0x14u: return 1u;
    case 0x18u: return 2u;
    case 0x1cu: return 3u;
    case 0x24u: return 4u;   /* PE order: +0x24 comes BEFORE +0x20 */
    case 0x20u: return 5u;
    case 0x28u: return 6u;
    default:    return ISAAC_FRAME_OPAQUE_424C40_NO_STORE_BYTE;
  }
}
extern "C" uint32_t isaac_frame_opaque_424c40_return_this(
    uint32_t this_ptr) {
  /* PE @0x424c88 `mov eax,esi` — the body returns the FULL 32-bit
     `this` (receiver passthrough; eax untouched between @0x424c88 and
     ret @0x424cc3). NOT a truncated low byte. */
  return this_ptr;
}
