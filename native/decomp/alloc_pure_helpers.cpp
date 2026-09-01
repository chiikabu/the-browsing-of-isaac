#include "alloc_pure_helpers.h"

#include <stddef.h>

/* Guest allocator WRAPPERS, family ABI v1.

   Roots (all address-stable; no exact ZHL match — see header):
     0x00a648b0 tracked heap wrapper (mode in LOW BYTE of ECX)
     0x00a0f4c0 thin alloc (size from stack)
     0x00a0f4e0 thin alloc (size pushed from FULL ECX before mode clear)
     0x00a0f500 free wrapper (SEH frame stays host)
     0x00aef15c sized operator-delete shim (size DROPPED)
     0x0040cf00 aligned string-buffer alloc (size in ECX)
     0x0040cf50 string copy ctor (v3 AK: SSO/len gates, capacity rounding)
     0x0040d040 string tidy (v3 AL: cap release gate + reset state)
     0x0040c740 out-of-line u32 deallocate (v2: count*4 scaled release)
     0x0040cee0 / 0x004170d0 / 0x0040ccc0 / 0x0040cad0 noreturn throw
                  bodies (stay host; msg VAs pinned)
     0x00a23200 OOM observer broadcast (host callback dispatch)

   Evidence: whole bodies disassembled in
   output/decomp/5129df723e64/section-notes/alloc-v1/disasm-roots.txt and
   disasm-release.txt; exact instruction-by-instruction control flow recorded
   in native/decomp/alloc_pure_helpers.h.

   Raw malloc/free, the IAT [_invalid_parameter_noinfo_noreturn],
   _Xlength_error, _CxxThrowException, the OOM observer broadcast and the
   SEH frames stay address-stable HOST actions. Everything the game reads
   back — header layout, accounting counters, payload bias, alignment
   arithmetic, size clamps, overflow predicates, free ordering, zero-size
   short-circuits — is translated here.

   D-ALLOC-1 is REPRODUCED, never corrected (standing decision): the alloc
   side accounts (clamped_lo + 4) as a 64-bit add, the free side subtracts
   only the 32-bit header with borrow propagation (`sbb [esi+4], 0`), so a
   carried alloc leaves a permanent +0x1'00000000 residue in the accounting
   pair. isaac_alloc_free_subtracts_alloc_carry() returns 0 and the
   round-trip model exposes residue_hi == add_hi. */

namespace {

/* x86 carry of a 32-bit add, as `adc` reads it. */
inline uint32_t add_carry(uint32_t a, uint32_t b) {
  const uint32_t sum = a + b;
  return sum < a ? 1u : 0u;
}

/* x86 borrow of a 32-bit sub, as `sbb` reads it. */
inline uint32_t sub_borrow(uint32_t a, uint32_t b) {
  return a < b ? 1u : 0u;
}

inline uint32_t mode_byte(uint32_t ecx_reg) {
  /* movzx eax, cl — the LOW BYTE ONLY. Real callers leave `this` or other
     junk in the upper 24 bits, so the parameter is WIDE and narrowed here
     (uint8_t-parameter toolchain defect guard). */
  return ecx_reg & 0xffu;
}

inline int32_t action_of(uint32_t ecx_reg) {
  const uint32_t m = mode_byte(ecx_reg);
  if (m == static_cast<uint32_t>(ISAAC_ALLOC_MODE_ALLOC)) {
    return ISAAC_ALLOC_ACTION_ALLOC;
  }
  if (m == static_cast<uint32_t>(ISAAC_ALLOC_MODE_FREE)) {
    return ISAAC_ALLOC_ACTION_FREE;
  }
  if (m == static_cast<uint32_t>(ISAAC_ALLOC_MODE_ACCOUNT)) {
    return ISAAC_ALLOC_ACTION_ACCOUNT;
  }
  /* xor eax, eax ; ret at VA 0x00a64909 — shared with the free null gate. */
  return ISAAC_ALLOC_ACTION_NONE;
}

inline uint32_t clamp_lo(uint32_t size_lo, uint32_t size_hi) {
  /* Only size_hi != 0 clamps. The lo-side `cmp edi,-1 ; jbe` at 0x00a6491a
     is a DEAD branch: no uint32 exceeds 0xffffffff. */
  return size_hi != 0u ? 0u : size_lo;
}

inline uint32_t malloc_arg_impl(uint32_t size_lo, uint32_t size_hi) {
  /* add edi, 4 ; push edi — 32-bit WRAP. DIDOD saturates (0xffffffff, 0) to
     malloc(3). */
  return clamp_lo(size_lo, size_hi) + 4u;
}

inline uint32_t acct_add_hi_impl(uint32_t size_lo, uint32_t size_hi) {
  /* ebx is 0 on both entry paths (size_hi == 0 fall-through, or zeroed by
     the clamp), so `adc ebx, 0` is exactly the carry of clamped_lo + 4. */
  const uint32_t lo = clamp_lo(size_lo, size_hi);
  return add_carry(lo, 4u);
}

inline uint32_t acct_alloc_hi_impl(uint32_t acct_hi,
                                   uint32_t acct_lo,
                                   uint32_t add_lo,
                                   uint32_t add_hi) {
  /* add [esi], edi ; adc [esi+4], ebx — TRUE 64-bit add. */
  return acct_hi + add_hi + add_carry(acct_lo, add_lo);
}

inline uint32_t acct_sub_hi_impl(uint32_t acct_hi,
                                 uint32_t acct_lo,
                                 uint32_t header) {
  /* sub [esi], eax ; sbb [esi+4], 0 — borrow propagation ONLY, the high
     word of the header is never subtracted (D-ALLOC-1). */
  return acct_hi - sub_borrow(acct_lo, header);
}

inline int32_t sb_is_big_impl(uint32_t size) {
  /* cmp ecx, 0x1000 ; jb small — UNSIGNED. */
  return size >= static_cast<uint32_t>(ISAAC_ALLOC_SB_BIG_MIN) ? 1 : 0;
}

inline int32_t sb_overflow_impl(uint32_t size) {
  /* lea eax,[ecx+0x23] ; cmp eax,ecx ; jbe throw — unsigned (size+0x23) <=
     size, i.e. the +0x23 wrapped. First fires at size 0xffffffdd. */
  const uint32_t x = size + static_cast<uint32_t>(ISAAC_ALLOC_SB_PAD);
  return x <= size ? 1 : 0;
}

inline uint32_t sb_payload_impl(uint32_t raw) {
  /* lea eax,[ecx+0x23] ; and eax,0xffffffe0 — alignment round-up. */
  return (raw + static_cast<uint32_t>(ISAAC_ALLOC_SB_PAD)) &
         static_cast<uint32_t>(ISAAC_ALLOC_SB_ALIGN_MASK);
}

inline int32_t sb_kind_impl(uint32_t size) {
  if (sb_is_big_impl(size) != 0) {
    return sb_overflow_impl(size) != 0 ? ISAAC_ALLOC_SB_KIND_THROW
                                       : ISAAC_ALLOC_SB_KIND_BIG;
  }
  return size == 0u ? ISAAC_ALLOC_SB_KIND_ZERO : ISAAC_ALLOC_SB_KIND_SMALL;
}

inline uint32_t sbr_delta_impl(uint32_t payload, uint32_t raw) {
  /* sub eax,edx ; add eax,-4 — (payload - raw) - 4, 32-bit wrap. */
  return payload - raw - 4u;
}

inline int32_t sbr_valid_impl(uint32_t payload, uint32_t raw) {
  /* cmp eax,0x1f ; ja abort — UNSIGNED ABOVE, so delta == 0x1f is valid. */
  return sbr_delta_impl(payload, raw) <=
                 static_cast<uint32_t>(ISAAC_ALLOC_SB_DELTA_MAX)
             ? 1
             : 0;
}

/* AK: 0x0040cf50 string copy ctor. */
inline int32_t str_ctor_sso_impl(uint32_t src_size) {
  /* cmp eax,0x10 ; jae big — UNSIGNED: SSO iff size < 0x10 (0..0xf
     inline, the 16-byte SSO buffer). */
  return src_size < static_cast<uint32_t>(ISAAC_ALLOC_STR_SSO_CAP) ? 1 : 0;
}

inline int32_t str_ctor_src_uses_heap_impl(uint32_t src_cap) {
  /* cmp [edi+0x14],0x10 ; jb keep — the source data sits at [src] iff
     src cap >= 0x10, else at the src object itself (SSO buffer). Same
     select shape as the 0x40d0c0 data-pointer getter. */
  return src_cap >= static_cast<uint32_t>(ISAAC_ALLOC_STR_SSO_CAP) ? 1 : 0;
}

inline uint32_t str_ctor_cap_impl(uint32_t src_size) {
  /* SSO: mov ebx,0xf. Big: or ebx,0xf ; cmp ebx,0x7fffffff ; cmova
     ebx,eax — UNSIGNED saturation at 0x7fffffff. */
  if (str_ctor_sso_impl(src_size) != 0) {
    return static_cast<uint32_t>(ISAAC_ALLOC_STR_SSO_CAP_VALUE);
  }
  const uint32_t r = src_size |
                     static_cast<uint32_t>(ISAAC_ALLOC_STR_SSO_CAP_VALUE);
  return r > static_cast<uint32_t>(ISAAC_ALLOC_STR_CTOR_SAT)
             ? static_cast<uint32_t>(ISAAC_ALLOC_STR_CTOR_SAT)
             : r;
}

inline uint32_t str_ctor_alloc_arg_impl(uint32_t src_size) {
  /* lea ecx,[ebx+1] ; call 0x0040cf00 — the SSO path never allocates;
     big hands cap + 1 (round-up of size to the next 16 multiple). */
  return str_ctor_sso_impl(src_size) != 0
             ? 0u
             : str_ctor_cap_impl(src_size) + 1u;
}

inline uint32_t str_ctor_copy_len_impl(uint32_t src_size) {
  /* SSO: movups xmm0,[edi] — a FIXED 16-byte copy regardless of size;
     big: memcpy(dst, src, size + 1) — the NUL is copied too. */
  return str_ctor_sso_impl(src_size) != 0
             ? static_cast<uint32_t>(ISAAC_ALLOC_STR_SSO_COPY_LEN)
             : src_size + 1u;
}

inline int32_t str_ctor_cap_saturated_impl(uint32_t src_size) {
  /* The cmova fires iff (size|0xf) > 0x7fffffff — i.e. size >=
     0x80000000 (sizes 0x7ffffff1..0x7fffffff still round to exactly
     0x7fffffff, which is NOT saturated). */
  return str_ctor_sso_impl(src_size) == 0 &&
                 (src_size |
                  static_cast<uint32_t>(ISAAC_ALLOC_STR_SSO_CAP_VALUE)) >
                     static_cast<uint32_t>(ISAAC_ALLOC_STR_CTOR_SAT)
             ? 1
             : 0;
}

/* AL: 0x0040d040 string tidy. */
inline int32_t str_tidy_release_impl(uint32_t cap) {
  /* cmp ecx,0x10 ; jb skip — UNSIGNED release gate: cap >= 0x10 frees. */
  return cap >= static_cast<uint32_t>(ISAAC_ALLOC_STR_SSO_CAP) ? 1 : 0;
}

inline uint32_t str_tidy_size_arg_impl(uint32_t cap) {
  /* inc ecx — the release size is cap + 1 (the terminating NUL slot). */
  return cap + 1u;
}

/* AM: 0x0040ccd0 string assign. */
inline int32_t str_assign_grow_impl(uint32_t n, uint32_t cap) {
  /* cmp edi,ecx ; ja grow — UNSIGNED. */
  return n > cap ? 1 : 0;
}

inline int32_t str_assign_throws_impl(uint32_t n) {
  /* cmp edi,0x7fffffff ; ja 0x40cdb5 — the IN-BODY length gate (the body
     reads [ebp+0xc]; unlike 0x40cee0, which reads no stack argument). */
  return n > static_cast<uint32_t>(ISAAC_ALLOC_STR_ASSIGN_MAX_LEN) ? 1 : 0;
}

inline int32_t str_assign_round_sat_impl(uint32_t n) {
  /* or ebx,0xf ; cmp ebx,0x7fffffff ; jbe 0x40cd2e — UNSIGNED: the 16-
     round exceeds max_size for n in 0x7ffffff0..0x7fffffff only. */
  return (n | static_cast<uint32_t>(ISAAC_ALLOC_STR_SSO_CAP_VALUE)) >
                 static_cast<uint32_t>(ISAAC_ALLOC_STR_ASSIGN_MAX_LEN)
             ? 1
             : 0;
}

inline int32_t str_assign_grow_sat_impl(uint32_t cap) {
  /* shr edx,1 ; sub eax,edx ; cmp ecx,eax ; jbe 0x40cd44 — the geometric
     growth cap + (cap>>1) (UNSIGNED half) would exceed max_size. */
  const uint32_t half = cap >> 1; /* shr — logical */
  return cap >
                 static_cast<uint32_t>(ISAAC_ALLOC_STR_ASSIGN_MAX_LEN) - half
             ? 1
             : 0;
}

inline uint32_t str_assign_new_cap_impl(uint32_t n, uint32_t cap) {
  /* 0x40cd1a..0x40cd49: the two clamps fire FIRST; only the non-saturating
     path forms the sums (lea eax,[edx+ecx] cannot wrap there), then the
     cmovb max picks the larger of the 16-round and the 1.5x growth. */
  if (str_assign_round_sat_impl(n) != 0) {
    return static_cast<uint32_t>(ISAAC_ALLOC_STR_ASSIGN_MAX_LEN);
  }
  if (str_assign_grow_sat_impl(cap) != 0) {
    return static_cast<uint32_t>(ISAAC_ALLOC_STR_ASSIGN_MAX_LEN);
  }
  const uint32_t rounded =
      n | static_cast<uint32_t>(ISAAC_ALLOC_STR_SSO_CAP_VALUE);
  const uint32_t geo = cap + (cap >> 1); /* lea eax,[edx+ecx] — no wrap */
  return rounded > geo ? rounded : geo; /* cmp ebx,eax ; cmovb */
}

inline int32_t str_assign_fast_heap_impl(uint32_t cap) {
  /* mov ebx,esi ; cmp ecx,0x10 ; jb keep ; mov ebx,[esi] — the fast-path
     data select; the SAME law shape as the AK src_uses_heap select. */
  return cap >= static_cast<uint32_t>(ISAAC_ALLOC_STR_SSO_CAP) ? 1 : 0;
}

inline uint32_t str_assign_release_size_arg_impl(uint32_t cap) {
  /* lea ecx,[eax+1] — the grow-side release size is old cap + 1. */
  return cap + 1u;
}

}  // namespace

/* ---------- AA: 0x00a648b0 mode dispatch ---------- */

extern "C" int32_t isaac_alloc_a648b0_mode(uint32_t ecx_reg) {
  return static_cast<int32_t>(mode_byte(ecx_reg));
}

extern "C" int32_t isaac_alloc_a648b0_action(uint32_t ecx_reg) {
  return action_of(ecx_reg);
}

/* ---------- AB: accounting block select ---------- */

extern "C" uint32_t isaac_alloc_acct_block_va(uint32_t tracked_c7de78) {
  /* lea esi,[edi+0x30] ; test edi,edi ; jne ; mov esi,0xc7f618. */
  return tracked_c7de78 != 0u ? tracked_c7de78 + 0x30u
                              : static_cast<uint32_t>(
                                    ISAAC_ALLOC_FALLBACK_ACCT_LO_VA);
}

extern "C" int32_t isaac_alloc_acct_is_fallback(uint32_t tracked_c7de78) {
  return tracked_c7de78 == 0u ? 1 : 0;
}

extern "C" uint32_t isaac_alloc_mode2_target_va(uint32_t tracked_c7de78) {
  /* add [edi+0x30], eax — the arm IGNORES the esi fallback select and folds
     into tracked+0x30 unconditionally; tracked == 0 makes the PE store at
     VA 0x30/0x34. Pinned asymmetry. */
  return tracked_c7de78 + 0x30u;
}

extern "C" int32_t isaac_alloc_mode2_selects_fallback(void) {
  return 0; /* PE truth: the fold never uses esi. */
}

extern "C" int32_t isaac_alloc_mode2_clears_fallback(void) {
  return 0; /* PE truth: the fallback pair is never cleared by the arm. */
}

extern "C" uint32_t isaac_alloc_mode2_fold_lo(uint32_t tracked_lo,
                                              uint32_t fb_lo) {
  /* add dword ptr [edi+0x30], eax — 32-bit wrap. */
  return tracked_lo + fb_lo;
}

extern "C" uint32_t isaac_alloc_mode2_fold_hi(uint32_t tracked_hi,
                                              uint32_t fb_hi,
                                              uint32_t tracked_lo,
                                              uint32_t fb_lo) {
  /* adc dword ptr [edi+0x34], eax — true 64-bit fold with the lo carry. */
  return tracked_hi + fb_hi + add_carry(tracked_lo, fb_lo);
}

/* ---------- AC: alloc arm ---------- */

extern "C" int32_t isaac_alloc_clamp_needed(uint32_t size_lo,
                                            uint32_t size_hi) {
  /* test ebx,ebx ; jne clamp. The lo side never clamps (dead jbe). */
  (void)size_lo;
  return size_hi != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_alloc_clamped_lo(uint32_t size_lo,
                                           uint32_t size_hi) {
  return clamp_lo(size_lo, size_hi);
}

extern "C" uint32_t isaac_alloc_clamped_hi(uint32_t size_lo,
                                           uint32_t size_hi) {
  /* ebx = 0 on both paths: size_hi == 0 fall-through, or the clamp zeroes
     both stack dwords (movlpd). */
  (void)size_lo;
  (void)size_hi;
  return 0u;
}

extern "C" uint32_t isaac_alloc_malloc_arg(uint32_t size_lo,
                                           uint32_t size_hi) {
  return malloc_arg_impl(size_lo, size_hi);
}

extern "C" uint32_t isaac_alloc_acct_add_hi(uint32_t size_lo,
                                            uint32_t size_hi) {
  return acct_add_hi_impl(size_lo, size_hi);
}

extern "C" uint32_t isaac_alloc_header_value(uint32_t size_lo,
                                             uint32_t size_hi) {
  /* mov [eax], edi — the header is the malloc arg itself; free's [ptr-4]
     read recovers the full malloc size. */
  return malloc_arg_impl(size_lo, size_hi);
}

extern "C" uint32_t isaac_alloc_result(uint32_t block) {
  /* add eax, 4 — payload bias, 32-bit wrap. */
  return block + 4u;
}

extern "C" int32_t isaac_alloc_oom_observer_needed(int32_t malloc_null) {
  /* test eax,eax ; jne success — only the NULL path broadcasts. */
  return malloc_null != 0 ? 1 : 0;
}

/* ---------- AD: free arm ---------- */

extern "C" int32_t isaac_alloc_free_needed(uint32_t edx_ptr) {
  /* test edx,edx ; je return — a null pointer does nothing at all. */
  return edx_ptr != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_alloc_free_base(uint32_t edx_ptr) {
  /* lea ecx,[edx-4] — both the header read and the free argument. */
  return edx_ptr - 4u;
}

extern "C" uint32_t isaac_alloc_acct_sub_lo(uint32_t acct_lo,
                                            uint32_t header) {
  /* sub dword ptr [esi], eax — 32-bit wrap. */
  return acct_lo - header;
}

extern "C" int32_t isaac_alloc_acct_sub_borrow(uint32_t acct_lo,
                                               uint32_t header) {
  return static_cast<int32_t>(sub_borrow(acct_lo, header));
}

extern "C" uint32_t isaac_alloc_acct_sub_hi(uint32_t acct_hi,
                                            uint32_t acct_lo,
                                            uint32_t header) {
  return acct_sub_hi_impl(acct_hi, acct_lo, header);
}

extern "C" int32_t isaac_alloc_free_subtracts_alloc_carry(void) {
  /* D-ALLOC-1, REPRODUCED never corrected: `sbb [esi+4], 0` subtracts the
     borrow only; the alloc-side high word is never recovered, so every
     carried alloc leaves a permanent +0x1'00000000 residue. */
  return 0;
}

extern "C" uint32_t isaac_alloc_acct_alloc_lo(uint32_t acct_lo,
                                              uint32_t add_lo) {
  /* add dword ptr [esi], edi — 32-bit wrap. */
  return acct_lo + add_lo;
}

extern "C" uint32_t isaac_alloc_acct_alloc_hi(uint32_t acct_hi,
                                              uint32_t acct_lo,
                                              uint32_t add_lo,
                                              uint32_t add_hi) {
  return acct_alloc_hi_impl(acct_hi, acct_lo, add_lo, add_hi);
}

/* ---------- AE: plans ---------- */

extern "C" void isaac_alloc_roundtrip(uint32_t size_lo,
                                      uint32_t size_hi,
                                      IsaacAllocRoundTrip* out) {
  if (out == nullptr) {
    return;
  }
  const uint32_t arg = malloc_arg_impl(size_lo, size_hi);
  const uint32_t carry = acct_add_hi_impl(size_lo, size_hi);
  out->add_lo = arg;
  out->add_hi = carry;
  out->header = arg;
  out->sub_value = arg; /* the 32-bit header is what free subtracts */
  out->residue_lo = 0u;
  /* The borrow of the free-side lo sub cancels the alloc-side lo carry
     exactly, so the pair nets +add_hi — the D-ALLOC-1 residue. */
  out->residue_hi = carry;
  out->residue_nonzero = static_cast<int32_t>(carry);
  out->clamp_applied = isaac_alloc_clamp_needed(size_lo, size_hi);
}

extern "C" void isaac_alloc_a648b0_plan(uint32_t ecx_reg,
                                        uint32_t edx_ptr,
                                        uint32_t size_lo,
                                        uint32_t size_hi,
                                        uint32_t tracked_c7de78,
                                        int32_t malloc_null,
                                        IsaacAllocA648b0Plan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t action = action_of(ecx_reg);
  const uint32_t mode = mode_byte(ecx_reg);
  out->mode = static_cast<int32_t>(mode);
  out->action = action;
  out->acct_va = isaac_alloc_acct_block_va(tracked_c7de78);
  out->acct_is_fallback = isaac_alloc_acct_is_fallback(tracked_c7de78);
  out->clamp_applied = 0;
  out->malloc_arg = 0u;
  out->malloc_called = 0;
  out->acct_add_lo = 0u;
  out->acct_add_hi = 0u;
  out->header_value = 0u;
  out->header_store_needed = 0;
  out->observer_needed = 0;
  out->observer_arg = 0u;
  out->result_bias = 0u;
  out->returns_zero = 1;
  out->free_called = 0;
  out->free_arg = 0u;
  out->header_va = 0u;
  out->mode2_fold_needed = 0;
  out->mode2_target_va = 0u;
  out->no_effect = 0;

  if (action == ISAAC_ALLOC_ACTION_ALLOC) {
    out->clamp_applied = isaac_alloc_clamp_needed(size_lo, size_hi);
    out->malloc_arg = malloc_arg_impl(size_lo, size_hi);
    out->malloc_called = 1;
    if (malloc_null == 0) {
      out->acct_add_lo = out->malloc_arg;
      out->acct_add_hi = acct_add_hi_impl(size_lo, size_hi);
      out->header_value = out->malloc_arg;
      /* The header store sits AFTER `test eax,eax ; jne success`. */
      out->header_store_needed = 1;
      out->result_bias = 4u; /* add eax, 4 */
      out->returns_zero = 0;
    } else {
      /* push 0x7fcb9dd6 ; call 0x00a23200 ; xor eax,eax ; ret. */
      out->observer_needed = 1;
      out->observer_arg = static_cast<uint32_t>(ISAAC_ALLOC_OOM_OBSERVER_ARG);
    }
    return;
  }
  if (action == ISAAC_ALLOC_ACTION_FREE) {
    out->free_called = isaac_alloc_free_needed(edx_ptr);
    if (out->free_called != 0) {
      out->free_arg = isaac_alloc_free_base(edx_ptr);
      out->header_va = out->free_arg; /* [edx-4] read */
    } else {
      out->no_effect = 1; /* the null gate: nothing at all happens */
    }
    return;
  }
  if (action == ISAAC_ALLOC_ACTION_ACCOUNT) {
    out->mode2_fold_needed = 1;
    out->mode2_target_va = isaac_alloc_mode2_target_va(tracked_c7de78);
    return;
  }
  /* NONE: xor eax,eax ; ret — inert. */
  out->no_effect = 1;
}

/* ---------- AF: thin wrapper call shapes ---------- */

extern "C" int32_t isaac_alloc_a0f4c0_mode_cl(void) {
  return 0; /* xor cl, cl at 0x00a0f4cd */
}

extern "C" uint32_t isaac_alloc_a0f4c0_size_hi(void) {
  return 0u; /* push 0 at 0x00a0f4c6 */
}

extern "C" uint32_t isaac_alloc_a0f4c0_edx(void) {
  return 0u; /* xor edx, edx at 0x00a0f4cb */
}

extern "C" uint32_t isaac_alloc_a0f4e0_pushed_lo(uint32_t ecx_reg) {
  /* push ecx at 0x00a0f4e8 happens BEFORE `xor cl, cl` at 0x00a0f4eb, so the
     pushed size_lo is the FULL ECX and keeps its own low byte. Order pin. */
  return ecx_reg;
}

extern "C" int32_t isaac_alloc_a0f500_mode_cl(void) {
  return 1; /* mov cl, 1 at 0x00a0f525 */
}

extern "C" int32_t isaac_alloc_a0f500_stack_zero_words(void) {
  return ISAAC_ALLOC_FREE_STACK_ZERO_WORDS; /* push 0 ; push 0 */
}

extern "C" int32_t isaac_alloc_aef15c_size_dropped(void) {
  /* push [ebp+8] ; call 0xa0f500 — the size argument at [ebp+0xc] is never
     touched. Pinned. */
  return 1;
}

/* ---------- AG: 0x0040cf00 aligned string-buffer alloc ---------- */

extern "C" int32_t isaac_alloc_sb_is_big(uint32_t size) {
  return sb_is_big_impl(size);
}

extern "C" int32_t isaac_alloc_sb_overflow(uint32_t size) {
  return sb_overflow_impl(size);
}

extern "C" uint32_t isaac_alloc_sb_raw_request(uint32_t size) {
  /* lea eax,[ecx+0x23] — 32-bit wrap. */
  return size + static_cast<uint32_t>(ISAAC_ALLOC_SB_PAD);
}

extern "C" uint32_t isaac_alloc_sb_payload(uint32_t raw) {
  return sb_payload_impl(raw);
}

extern "C" uint32_t isaac_alloc_sb_stash_va(uint32_t payload) {
  /* mov [eax-4], ecx — the raw pointer sits 4 bytes below the payload. */
  return payload - 4u;
}

extern "C" int32_t isaac_alloc_sb_alloc_called(uint32_t size) {
  /* The ZERO path (test ecx,ecx ; je NULL) and the THROW path (noreturn
     0x0040cee0) never reach 0x00a0f4c0. */
  if (size == 0u) {
    return 0;
  }
  return sb_is_big_impl(size) != 0 && sb_overflow_impl(size) != 0 ? 0 : 1;
}

extern "C" int32_t isaac_alloc_sb_kind(uint32_t size) {
  return sb_kind_impl(size);
}

extern "C" void isaac_alloc_sb_plan(uint32_t size,
                                    uint32_t raw,
                                    IsaacAllocSbPlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t kind = sb_kind_impl(size);
  out->kind = kind;
  out->alloc_called = isaac_alloc_sb_alloc_called(size);
  out->alloc_arg = 0u;
  out->throw_needed = kind == ISAAC_ALLOC_SB_KIND_THROW ? 1 : 0;
  out->null_aborts = 0;
  out->null_returned = 0;
  out->payload = 0u;
  out->stash_va = 0u;
  out->stash_value = 0u;
  out->stash_needed = 0;
  out->returns_null_immediately = 0;

  if (kind == ISAAC_ALLOC_SB_KIND_ZERO) {
    /* xor eax,eax ; ret — no allocator call at all. */
    out->returns_null_immediately = 1;
    return;
  }
  if (kind == ISAAC_ALLOC_SB_KIND_THROW) {
    return; /* 0x0040cee0 is noreturn; nothing after it is reachable. */
  }
  if (kind == ISAAC_ALLOC_SB_KIND_BIG) {
    out->alloc_arg = isaac_alloc_sb_raw_request(size);
    if (raw == 0u) {
      /* IAT [0x00b18894] _invalid_parameter_noinfo_noreturn — noreturn. */
      out->null_aborts = 1;
      return;
    }
    out->payload = sb_payload_impl(raw);
    out->stash_va = isaac_alloc_sb_stash_va(out->payload);
    out->stash_value = raw;
    out->stash_needed = 1;
    return;
  }
  /* SMALL: the NULL result is returned UNCHECKED. */
  out->alloc_arg = size;
  if (raw == 0u) {
    out->null_returned = 1;
  }
  out->payload = raw;
}

/* ---------- AH: inline aligned-release template ---------- */

extern "C" int32_t isaac_alloc_sbr_is_big(uint32_t size) {
  return sb_is_big_impl(size);
}

extern "C" uint32_t isaac_alloc_sbr_adjusted_size(uint32_t size) {
  /* big: add ecx, 0x23 ; small: the size passes through untouched. */
  return sb_is_big_impl(size) != 0
             ? size + static_cast<uint32_t>(ISAAC_ALLOC_SB_PAD)
             : size;
}

extern "C" uint32_t isaac_alloc_sbr_delta(uint32_t payload, uint32_t raw) {
  return sbr_delta_impl(payload, raw);
}

extern "C" int32_t isaac_alloc_sbr_valid(uint32_t payload, uint32_t raw) {
  return sbr_valid_impl(payload, raw);
}

extern "C" uint32_t isaac_alloc_sbr_free_arg(uint32_t size,
                                             uint32_t payload,
                                             uint32_t raw) {
  /* big: mov eax, edx (raw) after the validation; small: the payload itself
     is freed directly. On the abort path nothing is freed. */
  if (sb_is_big_impl(size) == 0) {
    return payload;
  }
  return sbr_valid_impl(payload, raw) != 0 ? raw : 0u;
}

extern "C" void isaac_alloc_sbr_plan(uint32_t size,
                                     uint32_t payload,
                                     uint32_t raw,
                                     IsaacAllocSbReleasePlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t big = sb_is_big_impl(size);
  out->is_big = big;
  out->adjusted_size = isaac_alloc_sbr_adjusted_size(size);
  /* 0x00aef15c forwards ONLY the pointer; the size arg is dropped. */
  out->size_arg_dropped = 1;
  out->delta = big != 0 ? sbr_delta_impl(payload, raw) : 0u;
  out->valid = big != 0 ? sbr_valid_impl(payload, raw) : 1;
  out->abort_needed = (big != 0 && out->valid == 0) ? 1 : 0;
  out->free_arg = isaac_alloc_sbr_free_arg(size, payload, raw);
  out->header_read_needed = big; /* mov edx,[eax-4] — big path only */
}

extern "C" int32_t isaac_alloc_sb_roundtrip_valid(uint32_t raw) {
  /* PE-truth law: for EVERY raw pointer value, the payload 0x0040cf00
     builds passes the release-side validation. delta =
     0x1f - ((raw + 3) mod 32) is always within [0, 0x1f]. */
  return sbr_valid_impl(sb_payload_impl(raw), raw);
}

/* ---------- AJ: 0x0040c740 out-of-line u32 deallocate (v2) ---------- */

extern "C" uint32_t isaac_alloc_c740_byte_size(uint32_t count) {
  /* lea ecx, [eax*4] — 32-bit wrap; the ONLY new law vs the v1 template
     bodies (0x0040d000 and the 2617 inline sites are unscaled). */
  return count * 4u;
}

extern "C" int32_t isaac_alloc_c740_is_big(uint32_t count) {
  /* cmp ecx, 0x1000 ; jb — UNSIGNED over byte_size, so big iff count >=
     0x400 exactly (count 0x40000000: byte_size wraps to 0, small). */
  return isaac_alloc_c740_byte_size(count) >=
                 static_cast<uint32_t>(ISAAC_ALLOC_SB_BIG_MIN)
             ? 1
             : 0;
}

extern "C" uint32_t isaac_alloc_c740_adjusted_size(uint32_t count) {
  const uint32_t byte_size = isaac_alloc_c740_byte_size(count);
  return isaac_alloc_c740_is_big(count) != 0
             ? byte_size + static_cast<uint32_t>(ISAAC_ALLOC_SB_PAD)
             : byte_size;
}

extern "C" void isaac_alloc_c740_plan(uint32_t count,
                                      uint32_t payload,
                                      uint32_t raw,
                                      IsaacAllocC740Plan* out) {
  if (out == nullptr) {
    return;
  }
  const uint32_t byte_size = isaac_alloc_c740_byte_size(count);
  const int32_t big = sb_is_big_impl(byte_size);
  out->byte_size = byte_size;
  out->is_big = big;
  out->adjusted_size = big != 0
                           ? byte_size +
                                 static_cast<uint32_t>(ISAAC_ALLOC_SB_PAD)
                           : byte_size;
  out->delta = big != 0 ? sbr_delta_impl(payload, raw) : 0u;
  out->valid = big != 0 ? sbr_valid_impl(payload, raw) : 1;
  out->abort_needed = (big != 0 &&
                       sbr_valid_impl(payload, raw) == 0)
                          ? 1
                          : 0;
  /* small: mov eax,[ebp+8] kept; big valid: mov eax,edx (raw); abort is
     noreturn so nothing is freed there. */
  out->free_arg =
      big == 0 ? payload
               : (sbr_valid_impl(payload, raw) != 0 ? raw : 0u);
  /* push ecx ; push eax ; call 0xaef15c — the size is DROPPED (pinned). */
  out->size_arg_dropped = 1;
  /* mov edx, [eax-4] — the big path only. */
  out->header_read_needed = big;
  /* add esp,8 ; ret 8 — two stack args consumed. */
  out->ret_bytes = ISAAC_ALLOC_SB_RELEASE_X4_RET_BYTES;
  /* [ebp+8]=payload (1st), [ebp+0xc]=count (2nd). */
  out->arg_order_ptr_first = 1;
}

/* ---------- AK: 0x0040cf50 string copy ctor (v3) ---------- */

extern "C" int32_t isaac_alloc_str_ctor_sso(uint32_t src_size) {
  return str_ctor_sso_impl(src_size);
}

extern "C" int32_t isaac_alloc_str_ctor_src_uses_heap(uint32_t src_cap) {
  return str_ctor_src_uses_heap_impl(src_cap);
}

extern "C" uint32_t isaac_alloc_str_ctor_cap(uint32_t src_size) {
  return str_ctor_cap_impl(src_size);
}

extern "C" uint32_t isaac_alloc_str_ctor_alloc_arg(uint32_t src_size) {
  return str_ctor_alloc_arg_impl(src_size);
}

extern "C" uint32_t isaac_alloc_str_ctor_copy_len(uint32_t src_size) {
  return str_ctor_copy_len_impl(src_size);
}

extern "C" void isaac_alloc_str_ctor_plan(uint32_t src_cap,
                                          uint32_t src_size,
                                          IsaacAllocStrCtorPlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t sso = str_ctor_sso_impl(src_size);
  out->sso = sso;
  out->src_uses_heap = str_ctor_src_uses_heap_impl(src_cap);
  out->alloc_needed = sso == 0 ? 1 : 0;
  out->alloc_arg = str_ctor_alloc_arg_impl(src_size);
  out->cap = str_ctor_cap_impl(src_size);
  out->cap_saturated = str_ctor_cap_saturated_impl(src_size);
  out->copy_len = str_ctor_copy_len_impl(src_size);
  /* [esi+0x10] = src size on BOTH paths (mov eax,[edi+0x10]). */
  out->size_out = src_size;
  /* ret 4 — thiscall with one stack arg (the source pointer). */
  out->ret_bytes = 4;
}

/* ---------- AL: 0x0040d040 string tidy (v3) ---------- */

extern "C" int32_t isaac_alloc_str_tidy_release_needed(uint32_t cap) {
  return str_tidy_release_impl(cap);
}

extern "C" uint32_t isaac_alloc_str_tidy_size_arg(uint32_t cap) {
  return str_tidy_size_arg_impl(cap);
}

extern "C" void isaac_alloc_str_tidy_plan(uint32_t cap,
                                          uint32_t payload,
                                          uint32_t raw,
                                          IsaacAllocStrTidyPlan* out) {
  if (out == nullptr) {
    return;
  }
  const uint32_t size_arg = str_tidy_size_arg_impl(cap);
  /* big implies release (cap+1 >= 0x1000 => cap >= 0xfff => release). */
  const int32_t big = sb_is_big_impl(size_arg);
  const int32_t release = str_tidy_release_impl(cap);
  const int32_t delta_valid = big != 0 ? sbr_valid_impl(payload, raw) : 1;
  out->release_needed = release;
  out->size_arg = size_arg;
  out->is_big = big;
  out->adjusted_size = big != 0
                           ? size_arg +
                                 static_cast<uint32_t>(ISAAC_ALLOC_SB_PAD)
                           : size_arg;
  out->delta = big != 0 ? sbr_delta_impl(payload, raw) : 0u;
  out->valid = delta_valid;
  out->abort_needed = (big != 0 && delta_valid == 0) ? 1 : 0;
  /* small release (cap in [0x10, 0xfff]): payload freed directly; big
     valid: raw (mov eax,edx); no release / abort: nothing freed. */
  out->free_arg = release == 0
                      ? 0u
                      : big == 0
                            ? payload
                            : delta_valid != 0 ? raw : 0u;
  /* push ecx ; push eax ; call 0x00aef15c — the size is DROPPED (pin). */
  out->size_arg_dropped = 1;
  /* mov edx,[eax-4] — the big path only. */
  out->header_read_needed = big;
  /* The reset block (0x40d072) runs on the skip path AND after the
     release; the abort is noreturn so nothing resets there. */
  out->reset_size = static_cast<uint32_t>(ISAAC_ALLOC_TIDY_RESET_SIZE);
  out->reset_cap = static_cast<uint32_t>(ISAAC_ALLOC_TIDY_RESET_CAP);
  out->reset_first_byte =
      static_cast<uint32_t>(ISAAC_ALLOC_TIDY_RESET_FIRST_BYTE);
  out->reset_applies = out->abort_needed == 0 ? 1 : 0;
}

/* ---------- AM: 0x0040ccd0 string assign (v4) ---------- */

extern "C" int32_t isaac_alloc_str_assign_grow_needed(uint32_t n,
                                                      uint32_t cap) {
  return str_assign_grow_impl(n, cap);
}

extern "C" int32_t isaac_alloc_str_assign_throws(uint32_t n) {
  return str_assign_throws_impl(n);
}

extern "C" int32_t isaac_alloc_str_assign_round_saturated(uint32_t n) {
  return str_assign_round_sat_impl(n);
}

extern "C" int32_t isaac_alloc_str_assign_grow_saturated(uint32_t cap) {
  return str_assign_grow_sat_impl(cap);
}

extern "C" uint32_t isaac_alloc_str_assign_new_cap(uint32_t n,
                                                   uint32_t cap) {
  return str_assign_new_cap_impl(n, cap);
}

extern "C" uint32_t isaac_alloc_str_assign_alloc_arg(uint32_t n,
                                                     uint32_t cap) {
  /* lea ecx,[ebx+1] ; call 0x40cf00 — the SSO/fit path allocates nothing;
     the noreturn throw path never reaches the alloc. */
  if (str_assign_grow_impl(n, cap) == 0) {
    return 0u;
  }
  if (str_assign_throws_impl(n) != 0) {
    return 0u;
  }
  return str_assign_new_cap_impl(n, cap) + 1u;
}

extern "C" int32_t isaac_alloc_str_assign_fast_uses_heap(uint32_t cap) {
  return str_assign_fast_heap_impl(cap);
}

extern "C" uint32_t isaac_alloc_str_assign_copy_len(uint32_t n) {
  /* push edi — n on both paths (memmove fast / memcpy grow). */
  return n;
}

extern "C" uint32_t isaac_alloc_str_assign_fast_helper_va(void) {
  return static_cast<uint32_t>(
      ISAAC_ALLOC_STR_ASSIGN_COPY_FAST_THUNK_VA);
}

extern "C" uint32_t isaac_alloc_str_assign_grow_helper_va(void) {
  return static_cast<uint32_t>(
      ISAAC_ALLOC_STR_ASSIGN_COPY_GROW_THUNK_VA);
}

extern "C" int32_t isaac_alloc_str_assign_release_needed(uint32_t n,
                                                         uint32_t cap) {
  /* cmp eax,0x10 ; jb skip — the grow-side release gate (0x40cd74). */
  return str_assign_grow_impl(n, cap) != 0 &&
                 cap >= static_cast<uint32_t>(ISAAC_ALLOC_STR_SSO_CAP)
             ? 1
             : 0;
}

extern "C" uint32_t isaac_alloc_str_assign_release_size_arg(uint32_t cap) {
  return str_assign_release_size_arg_impl(cap);
}

extern "C" void isaac_alloc_str_assign_plan(uint32_t n,
                                            uint32_t cap,
                                            uint32_t payload,
                                            uint32_t raw,
                                            IsaacAllocStrAssignPlan* out) {
  if (out == nullptr) {
    return;
  }
  const int32_t grow = str_assign_grow_impl(n, cap);
  const int32_t thr = grow != 0 ? str_assign_throws_impl(n) : 0;
  /* The noreturn length throw (0x40cdb5) fires BEFORE the capacity
     calculation, the alloc, the copy AND the release — so the reachable
     grow state is grow && !throws. */
  const int32_t grow_eff = (grow != 0 && thr == 0) ? 1 : 0;
  const uint32_t size_arg = str_assign_release_size_arg_impl(cap);
  /* big implies release iff growing: (cap+1) >= 0x1000 => cap >= 0xfff. */
  const int32_t big = sb_is_big_impl(size_arg);
  const int32_t release = grow_eff != 0 &&
                                  cap >= static_cast<uint32_t>(
                                             ISAAC_ALLOC_STR_SSO_CAP)
                              ? 1
                              : 0;
  const int32_t delta_valid = (release != 0 && big != 0)
                                  ? sbr_valid_impl(payload, raw)
                                  : 1;
  const uint32_t new_cap =
      grow_eff != 0 ? str_assign_new_cap_impl(n, cap) : 0u;
  out->grow_needed = grow;
  out->throws = thr;
  out->alloc_needed = grow_eff;
  out->alloc_arg = grow_eff != 0 ? new_cap + 1u : 0u;
  /* The game reads [esi+0x14]: grow stores new_cap (0x40cd5f); the fit
     path never touches it; the throw never reaches the store. */
  out->cap_out = grow_eff != 0 ? new_cap : cap;
  out->round_saturated =
      grow_eff != 0 ? str_assign_round_sat_impl(n) : 0;
  out->grow_saturated =
      grow_eff != 0 ? str_assign_grow_sat_impl(cap) : 0;
  out->size_out = n; /* mov [esi+0x10],edi — both live paths, before copy */
  /* The data select at 0x40cce6..0x40cced runs on the fit path only. */
  out->fast_uses_heap =
      grow != 0 ? 0 : str_assign_fast_heap_impl(cap);
  out->copy_len = n;
  out->fast_helper_va = static_cast<uint32_t>(
      ISAAC_ALLOC_STR_ASSIGN_COPY_FAST_THUNK_VA);
  out->grow_helper_va = static_cast<uint32_t>(
      ISAAC_ALLOC_STR_ASSIGN_COPY_GROW_THUNK_VA);
  out->nul_offset = n; /* mov byte [ebx+edi],0 */
  out->nul_byte = 0u;
  out->release_needed = release;
  out->release_size_arg = size_arg;
  out->release_is_big = big;
  out->release_delta = (release != 0 && big != 0)
                           ? sbr_delta_impl(payload, raw)
                           : 0u;
  out->release_valid = delta_valid;
  out->release_abort_needed =
      (release != 0 && big != 0 && delta_valid == 0) ? 1 : 0;
  /* small release frees the payload directly; big valid frees raw; the
     abort (noreturn) frees nothing. */
  out->release_free_arg = release == 0
                              ? 0u
                              : big == 0
                                    ? payload
                                    : delta_valid != 0 ? raw : 0u;
  /* The buf swap at 0x40cda3 sits AFTER the release branch; the noreturn
     abort (0x40cdaf) and the noreturn length throw never reach it. */
  out->buf_out_is_new = (grow_eff != 0 && delta_valid != 0) ? 1 : 0;
  /* push ecx ; push eax ; call 0x00aef15c — the size is DROPPED (pin). */
  out->size_arg_dropped = 1;
  out->ret_bytes = 8; /* ret 8 — (src, n) consumed */
  out->returns_this = 1; /* eax = esi, both paths */
}

/* ---------- AI: throw metadata ---------- */

extern "C" uint32_t isaac_alloc_xlength_msg_va(void) {
  return static_cast<uint32_t>(ISAAC_ALLOC_XLENGTH_MSG_VA);
}

extern "C" uint32_t isaac_alloc_xlength_string_msg_va(void) {
  /* 0x0040ccc0: push 0x00b1a714 "string too long" ; call [0x00b184d4]. */
  return static_cast<uint32_t>(ISAAC_ALLOC_XLENGTH_STRING_MSG_VA);
}

extern "C" uint32_t isaac_alloc_xlength_deque_msg_va(void) {
  /* 0x0040cad0: push 0x00b1a6c8 "deque<T> too long" ; call [0x00b184d4]. */
  return static_cast<uint32_t>(ISAAC_ALLOC_XLENGTH_DEQUE_MSG_VA);
}

extern "C" uint32_t isaac_alloc_pure_helpers_abi_version(void) {
  return ISAAC_ALLOC_PURE_HELPERS_ABI_VERSION;
}

/* ---------- toolchain defect guard ---------- */

/* The Wasm ABI does not narrow i32 arguments, and -O2 deletes in-body masks
   it can prove redundant for a uint8_t parameter. Every byte gate above
   takes uint32_t and narrows explicitly. This static check proves no export
   takes a uint8_t/uint16_t scalar parameter, so the guard cannot rot. */
template <typename... Ts>
struct has_narrow_scalar;
template <>
struct has_narrow_scalar<> {
  static constexpr bool value = false;
};
template <typename T, typename... Ts>
struct has_narrow_scalar<T, Ts...> {
  static constexpr bool value =
      (__is_same(T, uint8_t) || __is_same(T, uint16_t)) ||
      has_narrow_scalar<Ts...>::value;
};
template <typename R, typename... Ps>
struct has_narrow_scalar<R(Ps...)> {
  static constexpr bool value = has_narrow_scalar<Ps...>::value;
};

#define ISAAC_ALLOC_NO_NARROW_PARAMS(FN)                                      \
  static_assert(!has_narrow_scalar<decltype(FN)>::value,                      \
                #FN " must not take a uint8_t/uint16_t scalar parameter")

ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_a648b0_mode);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_a648b0_action);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_acct_block_va);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_acct_is_fallback);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_mode2_target_va);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_mode2_selects_fallback);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_mode2_clears_fallback);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_mode2_fold_lo);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_mode2_fold_hi);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_clamp_needed);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_clamped_lo);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_clamped_hi);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_malloc_arg);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_acct_add_hi);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_header_value);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_result);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_oom_observer_needed);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_free_needed);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_free_base);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_acct_sub_lo);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_acct_sub_borrow);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_acct_sub_hi);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_free_subtracts_alloc_carry);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_acct_alloc_lo);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_acct_alloc_hi);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_roundtrip);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_a648b0_plan);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_a0f4c0_mode_cl);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_a0f4c0_size_hi);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_a0f4c0_edx);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_a0f4e0_pushed_lo);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_a0f500_mode_cl);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_a0f500_stack_zero_words);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_aef15c_size_dropped);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_sb_is_big);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_sb_overflow);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_sb_raw_request);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_sb_payload);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_sb_stash_va);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_sb_alloc_called);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_sb_kind);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_sb_plan);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_sbr_is_big);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_sbr_adjusted_size);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_sbr_delta);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_sbr_valid);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_sbr_free_arg);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_sbr_plan);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_sb_roundtrip_valid);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_xlength_msg_va);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_c740_byte_size);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_c740_is_big);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_c740_adjusted_size);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_c740_plan);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_xlength_string_msg_va);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_xlength_deque_msg_va);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_str_ctor_sso);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_str_ctor_src_uses_heap);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_str_ctor_cap);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_str_ctor_alloc_arg);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_str_ctor_copy_len);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_str_ctor_plan);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_str_tidy_release_needed);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_str_tidy_size_arg);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_str_tidy_plan);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_str_assign_grow_needed);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_str_assign_throws);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_str_assign_round_saturated);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_str_assign_grow_saturated);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_str_assign_new_cap);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_str_assign_alloc_arg);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_str_assign_fast_uses_heap);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_str_assign_copy_len);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_str_assign_fast_helper_va);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_str_assign_grow_helper_va);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_str_assign_release_needed);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_str_assign_release_size_arg);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_str_assign_plan);
ISAAC_ALLOC_NO_NARROW_PARAMS(isaac_alloc_pure_helpers_abi_version);

#undef ISAAC_ALLOC_NO_NARROW_PARAMS
