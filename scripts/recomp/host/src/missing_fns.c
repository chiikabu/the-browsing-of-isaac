/* missing_fns.c -- STRONG implementations of lifted callees the lifter could
 * not decode (missing.txt).  Each one is transcribed instruction-by-instruction
 * from the PE and carries the evidence in its comment.  Weak placeholders for
 * these live in gu/stubs.c (they abort); these definitions win at link time.
 *
 * Contract: guest-callee ABI.  On entry [ESP] is the return address and
 * arguments are wherever the original function expected them (registers or
 * stack).  Registers that are not part of the contract must be preserved.
 */

#include "isaac_host.h"
#include "shim_decls.h"

#include <string.h>

/* ---------------------------------------------------------------------- *
 * 0x00aa9350 -- const char *platform_name(void).  Six bytes:
 *
 *     mov eax, 0xb6d10c   ; -> "Windows" (.rdata)
 *     ret
 *
 * The controller-DB parser (sub_00a25770) reaches it INDIRECTLY as
 * `call dword ptr [0xc736e0]` at 0x00a25b36 -- the allocator slot written
 * by the win32-init copy loop at 0x00a812de.  Function recovery never
 * produced it (no direct caller, only a data/pointer reference), so the
 * dispatch table had no entry and the indirect call trapped.  Returns the
 * platform string; writes no flags, touches no stack (naked leaf). */
void sub_00aa9350(CpuState *restrict s) {
    s->EAX = 0x00b6d10cu;
}

/* ---------------------------------------------------------------------- *
 * 0x00aefe80 -- int64 in {edx:ecx} -> double in xmm0.
 *
 *     cmp  dword ptr [0xc7162c], 6        ; SSE4.1 feature gate (BSS, 0)
 *     jl   0xaefe9a                       ; -> x87-style fallback
 *     vmovd xmm0, ecx
 *     vpinsrd xmm0, xmm0, edx, 1
 *     vcvtqq2pd xmm0, xmm0                ; (double)(int64){edx:ecx}
 *     ret
 *   fallback:
 *     xorps xmm1, xmm1
 *     cvtsi2sd xmm1, edx                  ; (double)(int32)hi
 *     xorps xmm0, xmm0
 *     cvtsi2sd xmm0, ecx                  ; (double)(int32)lo
 *     shr   ecx, 0x1f                     ; sign bit of lo
 *     mulsd xmm1, [0xb1a4e0]              ; * 2^32
 *     addsd xmm0, [ecx*8 + 0xb1a4d8]      ; + (lo<0 ? 2^32 : 0)
 *     addsd xmm0, xmm1
 *     ret
 *
 * The two paths are mathematically identical; the gate cell 0xc7162c sits
 * past .data's raw end (zero at load) and has no writer, so the fallback is
 * what runs unless the runtime sets it.  Both are implemented exactly.
 *
 * Returned in xmm0 = CpuState.ZMM0[0..7] (SSE regs map to ZMM0-7, low 16
 * bytes used).  No flags are written by the original. */
void sub_00aefe80(CpuState *restrict s) {
    uint32_t lo = s->ECX, hi = s->EDX;
    double d;
    if ((int32_t)isaac_r32(0x00c7162cu) >= 6) {
        int64_t v = ((int64_t)(uint64_t)(uint32_t)hi << 32) | (uint64_t)lo;
        d = (double)v;
    } else {
        double dlo = (double)(int32_t)lo
                   + ((lo & 0x80000000u) ? 4294967296.0 : 0.0);
        double dhi = (double)(int32_t)hi * 4294967296.0;
        d = dlo + dhi;
    }
    memcpy(&s->ZMM0[0], &d, 8);
    memset(&s->ZMM0[8], 0, 8);
}

/* ---------------------------------------------------------------------- *
 * The CRT conversion family (all gated on the same zero-at-load BSS cell
 * 0xc7162c: 2 reads / 0 writers by linear census -- the fallback paths
 * below are what actually runs in this build).  Every result is bit-exact
 * to the original's fallback arithmetic (and to the SSE4.1 path, which
 * computes the same value).  No C float->int casts are used: wasm i32/i64
 * trunc instructions TRAP out of range, so all integer results are built
 * from the bit fields directly.
 */

static uint32_t rc_feature_gate(void) {
    return (uint32_t)((int32_t)isaac_r32(0x00c7162cu) >= 6);
}

/* 0x00aefca0 -- float (xmm0 low 4) -> uint32 EAX.
 *     feature: vcvttss2usi eax, xmm0
 *     fallback: bit-exact via the FP bit fields (see PE transcription):
 *        neg & |v|>=1   -> 0xFFFFFFFF;   neg & |v|<1 -> 0
 *        0 <= v < 2^31  -> trunc(v)      (cvttss2si)
 *        2^31 <= v<2^32 -> 0x80000000 | mant<<8
 *        v >= 2^32, NaN, inf -> 0xFFFFFFFF */
void sub_00aefca0(CpuState *restrict s) {
    uint32_t bits;
    memcpy(&bits, &s->ZMM0[0], 4);
    uint32_t exp = (bits >> 23) & 0xffu, mant = bits & 0x7fffffu;
    uint32_t eax;
    if (bits & 0x80000000u) {
        eax = (exp < 0x7fu) ? 0u : 0xFFFFFFFFu;
    } else if (exp < 0x9eu) {
        if (exp < 0x7fu) eax = 0;
        else {
            int32_t sh = (int32_t)(23u - (exp - 0x7fu));
            eax = (sh >= 0) ? ((0x800000u | mant) >> sh)
                            : ((0x800000u | mant) << -sh);
        }
    } else if (exp == 0x9eu) {
        eax = 0x80000000u | (mant << 8);
    } else {
        eax = 0xFFFFFFFFu;
    }
    (void)rc_feature_gate();   /* both paths agree; fallback is exact */
    s->EAX = eax;
}

/* 0x00aefcf0 -- double (xmm0 low 8) -> uint32 EAX.
 *     fallback mirrors 0x00aefca0 with 52-bit mantissa and the 0x41e/0x41f
 *     exponent thresholds. */
void sub_00aefcf0(CpuState *restrict s) {
    uint64_t bits;
    memcpy(&bits, &s->ZMM0[0], 8);
    uint32_t exp = (uint32_t)((bits >> 52) & 0x7ffu);
    uint64_t mant = bits & 0xfffffffffffffull;
    uint32_t eax;
    if (bits & (1ull << 63)) {
        eax = (exp < 0x3ffu) ? 0u : 0xFFFFFFFFu;
    } else if (exp < 0x41eu) {
        if (exp < 0x3ffu) eax = 0;
        else {
            int32_t sh = (int32_t)(52u - (exp - 0x3ffu));
            uint64_t one = 0x10000000000000ull;
            eax = (sh >= 0) ? (uint32_t)((one | mant) >> sh)
                            : (uint32_t)((one | mant) << -sh);
        }
    } else if (exp == 0x41eu) {
        eax = 0x80000000u | (uint32_t)(mant >> 21);
    } else {
        eax = 0xFFFFFFFFu;
    }
    s->EAX = eax;
}

/* 0x00aefd70 -- double (xmm0 low 8) -> uint64 {edx:eax}.
 *     fallback: v < 2^31 -> cvttsd2si zero-extended;
 *       2^31..2^64-1 via the 0x433 shift trick over the 53-bit integer
 *       mantissa (right shift by 0x433-exp, left by exp-0x433 below 12);
 *       negative |v|<1 -> 0; negative larger, NaN, inf, overflow -> -1. */
void sub_00aefd70(CpuState *restrict s) {
    uint64_t bits;
    memcpy(&bits, &s->ZMM0[0], 8);
    uint32_t exp = (uint32_t)((bits >> 52) & 0x7ffu);
    uint64_t mant = bits & 0xfffffffffffffull;
    uint64_t r;
    if (bits & (1ull << 63)) {
        r = (exp < 0x3ffu) ? 0ull : 0xFFFFFFFFFFFFFFFFull;
    } else if (exp < 0x41eu) {
        if (exp < 0x3ffu) r = 0;
        else {
            int32_t sh = (int32_t)(52u - (exp - 0x3ffu));
            uint64_t one = 0x10000000000000ull;
            r = (sh >= 0) ? ((one | mant) >> sh) : ((one | mant) << -sh);
        }
    } else if (exp <= 0x433u) {
        r = (0x10000000000000ull | mant) >> (0x433u - exp);
    } else if (exp - 0x433u < 12u) {
        r = (0x10000000000000ull | mant) << (exp - 0x433u);
    } else {
        r = 0xFFFFFFFFFFFFFFFFull;
    }
    s->EAX = (uint32_t)r;
    s->EDX = (uint32_t)(r >> 32);
}

/* 0x00aefe20 -- uint64 {ecx:edx} -> double xmm0 (unsigned twin of 0x00aefe80).
 *     vcvtuqq2pd; fallback: (double)(int32)lo + sgn(lo)*2^32
 *                   + ((double)(int32)hi + sgn(hi)*2^32) * 2^32 */
void sub_00aefe20(CpuState *restrict s) {
    uint32_t lo = s->ECX, hi = s->EDX;
    double d = (double)(int32_t)lo + ((int32_t)lo < 0 ? 4294967296.0 : 0.0);
    if (hi) {
        double dhi = (double)(int32_t)hi + ((int32_t)hi < 0 ? 4294967296.0 : 0.0);
        d += dhi * 4294967296.0;
    }
    memcpy(&s->ZMM0[0], &d, 8);
    memset(&s->ZMM0[8], 0, 8);
}
