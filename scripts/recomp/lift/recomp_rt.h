/* Runtime support for the x86-32 -> C static recompiler prototype.
 *
 * This file is the HAND-WRITTEN part of the pipeline.  Everything else is
 * mechanically generated from SLEIGH p-code.
 *
 * Memory model: identity addressing.  A guest virtual address IS a
 * wasm linear-memory offset.  That matches the model the existing
 * hand-translated helpers in native/decomp already use
 * (`reinterpret_cast<uint8_t*>(addr)`), so lifted and hand-written code
 * can share one address space with no translation.
 */
#ifndef RECOMP_RT_H

#define RECOMP_RT_H

#include <math.h>
#include <stdint.h>
#include <string.h>
#include <stdio.h>

#ifdef __cplusplus
extern "C" {
#endif

/* ---- guest memory ------------------------------------------------ */

#ifndef RECOMP_MEM_IDENTITY
#define RECOMP_MEM_IDENTITY 1
#endif

#if RECOMP_MEM_IDENTITY
#define RECOMP_PTR(a) ((void *)(uintptr_t)(uint32_t)(a))
#else
extern uint8_t *recomp_mem_base;
#define RECOMP_PTR(a) ((void *)(recomp_mem_base + (uint32_t)(a)))
#endif

/* Optional bounds check.  Off by default -- a wasm OOB trap names only a
 * function, and finding WHICH guest access faulted otherwise means
 * bisecting by hand.  Build the suspect TU with -DRECOMP_MEM_CHECK=1 and
 * the access reports its guest address and width before aborting. */
#ifndef RECOMP_MEM_CHECK
#define RECOMP_MEM_CHECK 0
#endif

#if RECOMP_MEM_CHECK
extern uint32_t recomp_cur_va;   /* set by --trace-va emission */
struct CpuState;
extern volatile uint32_t recomp_va_trace[512];
extern struct CpuState *recomp_last_cpu; /* set by shim dispatch; for fault reg dump */
extern volatile uint32_t recomp_va_trace_idx;
/* Mid-function re-entry contract (see mkdispatch.py / patch_reentry.py):
 * isaac_lifted_dispatch sets this before calling a function at a block
 * target; each lifted function's prologue consumes it and jumps to the
 * matching L_ label.  Defined in dispatch_tbl.c. */
extern uint32_t g_reentry_eip;

#define RECOMP_VA(v)                                                       \
  do {                                                                     \
    recomp_cur_va = (uint32_t)(v);                                         \
    recomp_va_trace[(recomp_va_trace_idx++) & 511u] = recomp_cur_va;       \
  } while (0)
void recomp_mem_fault(uint32_t addr, unsigned bytes, int write);
/* Everything the guest may legitimately touch lives below the host base. */
#ifndef RECOMP_GUEST_LIMIT
#define RECOMP_GUEST_LIMIT 0x10000000u
#endif
#define RECOMP_CHECK(a, n, w)                                            \
  do {                                                                   \
    if ((a) < 0x1000u || (uint64_t)(a) + (n) > RECOMP_GUEST_LIMIT)       \
      recomp_mem_fault((a), (n), (w));                                   \
  } while (0)
/* Guest-memory watch. The window is RUNTIME state (recomp_rt.c reads
 * ISAAC_WATCH=0xLO:0xHI[:w] once; w = writes only) so a new address never
 * costs a lifted recompile. Writes print the value. Empty window = off. */
extern uint32_t recomp_watch_lo, recomp_watch_hi;
extern int recomp_watch_wonly;
#define RECOMP_WATCH_R(a, n)                                             \
  do {                                                                   \
    if (!recomp_watch_wonly && (uint64_t)(a) >= recomp_watch_lo &&       \
        (uint64_t)(a) + (n) <= recomp_watch_hi)                          \
      fprintf(stderr, "[recomp][PW] R @%#x n=%u va=%#x\n", (a), (n), recomp_cur_va); \
  } while (0)
#define RECOMP_WATCH_W(a, n, v)                                          \
  do {                                                                   \
    if ((uint64_t)(a) >= recomp_watch_lo && (uint64_t)(a) + (n) <= recomp_watch_hi) \
      fprintf(stderr, "[recomp][PW] W @%#x n=%u v=%#llx va=%#x\n", (a), (n), \
              (unsigned long long)(v), recomp_cur_va);                   \
  } while (0)
#else
#define RECOMP_CHECK(a, n, w) ((void)0)
#define RECOMP_WATCH_R(a, n) ((void)0)
#define RECOMP_WATCH_W(a, n, v) ((void)0)
#define RECOMP_VA(v) ((void)0)
#endif

/* x86 permits unaligned access; wasm loads are unaligned-tolerant, but C
 * type punning is not, so go through memcpy (clang folds it away). */
#define RECOMP_DEF_MEM(BITS, TY)                                         \
  static inline TY MEMR##BITS(uint32_t a) {                              \
    TY v;                                                                \
    RECOMP_CHECK(a, sizeof(TY), 0); RECOMP_WATCH_R(a, sizeof(TY));       \
    memcpy(&v, RECOMP_PTR(a), sizeof(v));                                \
    return v;                                                            \
  }                                                                      \
  static inline void MEMW##BITS(uint32_t a, TY v) {                      \
    RECOMP_CHECK(a, sizeof(TY), 1); RECOMP_WATCH_W(a, sizeof(TY), v);    \
    memcpy(RECOMP_PTR(a), &v, sizeof(v));                                \
  }

RECOMP_DEF_MEM(8, uint8_t)
RECOMP_DEF_MEM(16, uint16_t)
RECOMP_DEF_MEM(32, uint32_t)
RECOMP_DEF_MEM(64, uint64_t)

/* ---- wide (SSE / x87) varnode access ------------------------------ */

#define RECOMP_DEF_RW(BITS, TY)                                          \
  static inline TY recomp_rd##BITS(const uint8_t *p) {                   \
    TY v; memcpy(&v, p, sizeof(v)); return v;                            \
  }                                                                      \
  static inline void recomp_wr##BITS(uint8_t *p, TY v) {                 \
    memcpy(p, &v, sizeof(v));                                            \
  }

RECOMP_DEF_RW(8, uint8_t)
RECOMP_DEF_RW(16, uint16_t)
RECOMP_DEF_RW(32, uint32_t)
RECOMP_DEF_RW(64, uint64_t)

static inline void recomp_piece(uint8_t *dst, const uint8_t *lo, int nlo,
                                const uint8_t *hi, int nhi) {
  memcpy(dst, lo, (size_t)nlo);
  memcpy(dst + nlo, hi, (size_t)nhi);
}

static inline void recomp_zext(uint8_t *dst, int ndst, const uint8_t *src,
                               int nsrc) {
  memcpy(dst, src, (size_t)nsrc);
  memset(dst + nsrc, 0, (size_t)(ndst - nsrc));
}

static inline void recomp_wide_shl(uint8_t *d, const uint8_t *a, int n,
                                   uint64_t bits) {
  uint64_t by = bits >> 3, bo = bits & 7;
  for (int i = n - 1; i >= 0; --i) {
    uint64_t si = (uint64_t)i - by;
    uint32_t v = (si < (uint64_t)n) ? a[si] : 0u;
    uint32_t w = (bo && si - 1 < (uint64_t)n) ? a[si - 1] : 0u;
    d[i] = (uint8_t)((v << bo) | (bo ? (w >> (8 - bo)) : 0u));
  }
}

static inline void recomp_wide_shr(uint8_t *d, const uint8_t *a, int n,
                                   uint64_t bits) {
  uint64_t by = bits >> 3, bo = bits & 7;
  for (int i = 0; i < n; ++i) {
    uint64_t si = (uint64_t)i + by;
    uint32_t v = (si < (uint64_t)n) ? a[si] : 0u;
    uint32_t w = (bo && si + 1 < (uint64_t)n) ? a[si + 1] : 0u;
    d[i] = (uint8_t)((v >> bo) | (bo ? (w << (8 - bo)) : 0u));
  }
}

static inline void recomp_wide_not(uint8_t *dst, const uint8_t *a, int n) {
  for (int i = 0; i < n; ++i) dst[i] = (uint8_t)~a[i];
}

static inline void recomp_wide_2comp(uint8_t *dst, const uint8_t *a, int n) {
  unsigned carry = 1u;
  for (int i = 0; i < n; ++i) {
    unsigned v = (unsigned)(uint8_t)~a[i] + carry;
    dst[i] = (uint8_t)v;
    carry = v >> 8;
  }
}

/* kind: 0 = xor, 1 = and, 2 = or */
static inline void recomp_bitop(uint8_t *dst, const uint8_t *a,
                                const uint8_t *b, int n, int kind) {
  for (int i = 0; i < n; ++i) {
    dst[i] = (uint8_t)(kind == 0 ? (a[i] ^ b[i])
                                 : kind == 1 ? (a[i] & b[i]) : (a[i] | b[i]));
  }
}

/* ---- p-code helper ops ------------------------------------------- */

#define RECOMP_DEF_INT(BITS, UTY, STY)                                     \
  static inline uint8_t recomp_scarry##BITS(UTY a, UTY b) {                \
    UTY r = (UTY)(a + b);                                                  \
    return (uint8_t)((((a ^ r) & (b ^ r)) >> (BITS - 1)) & 1u);            \
  }                                                                        \
  static inline uint8_t recomp_sborrow##BITS(UTY a, UTY b) {               \
    UTY r = (UTY)(a - b);                                                  \
    return (uint8_t)((((a ^ b) & (a ^ r)) >> (BITS - 1)) & 1u);            \
  }                                                                        \
  static inline UTY recomp_shl##BITS(UTY a, UTY n) {                       \
    return (n >= (UTY)BITS) ? (UTY)0 : (UTY)(a << n);                      \
  }                                                                        \
  static inline UTY recomp_shr##BITS(UTY a, UTY n) {                       \
    return (n >= (UTY)BITS) ? (UTY)0 : (UTY)(a >> n);                      \
  }                                                                        \
  static inline UTY recomp_sar##BITS(UTY a, UTY n) {                       \
    STY s = (STY)a;                                                        \
    if (n >= (UTY)BITS) return (UTY)(s < 0 ? (STY)-1 : (STY)0);            \
    return (UTY)(STY)(s >> n);                                             \
  }                                                                        \
  static inline UTY recomp_divu##BITS(UTY a, UTY b) {                      \
    return b ? (UTY)(a / b) : (UTY)0;                                      \
  }                                                                        \
  static inline UTY recomp_remu##BITS(UTY a, UTY b) {                      \
    return b ? (UTY)(a % b) : (UTY)0;                                      \
  }                                                                        \
  static inline UTY recomp_divs##BITS(UTY a, UTY b) {                      \
    return b ? (UTY)((STY)a / (STY)b) : (UTY)0;                            \
  }                                                                        \
  static inline UTY recomp_rems##BITS(UTY a, UTY b) {                      \
    return b ? (UTY)((STY)a % (STY)b) : (UTY)0;                            \
  }                                                                        \
  static inline uint32_t recomp_popcount##BITS(UTY a) {                    \
    uint32_t n = 0;                                                        \
    while (a) { n += (uint32_t)(a & 1u); a >>= 1; }                        \
    return n;                                                              \
  }                                                                        \
  static inline uint32_t recomp_lzcount##BITS(UTY a) {                     \
    uint32_t n = 0;                                                        \
    for (int i = BITS - 1; i >= 0; --i) {                                  \
      if ((a >> i) & 1u) break;                                            \
      ++n;                                                                 \
    }                                                                      \
    return n;                                                              \
  }

RECOMP_DEF_INT(8, uint8_t, int8_t)
RECOMP_DEF_INT(16, uint16_t, int16_t)
RECOMP_DEF_INT(32, uint32_t, int32_t)
RECOMP_DEF_INT(64, uint64_t, int64_t)

/* ---- float helpers (bit-pattern in, bit-pattern out) -------------- */

static inline float recomp_bits2f32(uint32_t b) { float f; memcpy(&f, &b, 4); return f; }
static inline uint32_t recomp_f322bits(float f) { uint32_t b; memcpy(&b, &f, 4); return b; }
static inline double recomp_bits2f64(uint64_t b) { double d; memcpy(&d, &b, 8); return d; }
static inline uint64_t recomp_f642bits(double d) { uint64_t b; memcpy(&b, &d, 8); return b; }

#define RECOMP_DEF_FLT(SFX, FTY, UTY, B2F, F2B)                                \
  static inline UTY recomp_fadd_##SFX(UTY a, UTY b) { return F2B(B2F(a) + B2F(b)); } \
  static inline UTY recomp_fsub_##SFX(UTY a, UTY b) { return F2B(B2F(a) - B2F(b)); } \
  static inline UTY recomp_fmul_##SFX(UTY a, UTY b) { return F2B(B2F(a) * B2F(b)); } \
  static inline UTY recomp_fdiv_##SFX(UTY a, UTY b) { return F2B(B2F(a) / B2F(b)); } \
  static inline uint8_t recomp_feq_##SFX(UTY a, UTY b) { return (uint8_t)(B2F(a) == B2F(b)); } \
  static inline uint8_t recomp_fne_##SFX(UTY a, UTY b) { return (uint8_t)(B2F(a) != B2F(b)); } \
  static inline uint8_t recomp_flt_##SFX(UTY a, UTY b) { return (uint8_t)(B2F(a) < B2F(b)); }  \
  static inline uint8_t recomp_fle_##SFX(UTY a, UTY b) { return (uint8_t)(B2F(a) <= B2F(b)); } \
  static inline UTY recomp_fneg_##SFX(UTY a) { return F2B(-B2F(a)); }                 \
  static inline UTY recomp_fabsv_##SFX(UTY a) { FTY v = B2F(a); return F2B(v < 0 ? -v : v); } \
  static inline uint8_t recomp_fnan_##SFX(UTY a) { FTY v = B2F(a); return (uint8_t)(v != v); }

RECOMP_DEF_FLT(f32, float, uint32_t, recomp_bits2f32, recomp_f322bits)
RECOMP_DEF_FLT(f64, double, uint64_t, recomp_bits2f64, recomp_f642bits)

double recomp_fsqrt_f64(double);           /* provided by recomp_rt.c */
uint32_t recomp_fsqrt_f32(uint32_t);
uint32_t recomp_fceil_f32(uint32_t);
uint64_t recomp_fceil_f64(uint64_t);
uint32_t recomp_ffloor_f32(uint32_t);
uint64_t recomp_ffloor_f64(uint64_t);
uint32_t recomp_fround_f32(uint32_t);
uint64_t recomp_fround_f64(uint64_t);

/* x87 80-bit is modelled as a double stored in the low 8 bytes, the same
 * precision tradeoff remill makes (`typedef double native_float80_t`).
 * Documented lossy: 64-bit mantissa -> 53-bit. */
static inline double recomp_get80(const uint8_t *p) {
  double d; memcpy(&d, p, 8); return d;
}
static inline void recomp_set80(uint8_t *p, double d) {
  memcpy(p, &d, 8);
  p[8] = 0; p[9] = 0;
}
static inline uint32_t recomp_f64_to_f32(double d) {
  return recomp_f322bits((float)d);
}
static inline uint64_t recomp_f64_to_f64(double d) {
  return recomp_f642bits(d);
}

static inline uint32_t recomp_float2float_f32_f64(uint64_t a) {
  return recomp_f322bits((float)recomp_bits2f64(a));
}
static inline uint64_t recomp_float2float_f64_f32(uint32_t a) {
  return recomp_f642bits((double)recomp_bits2f32(a));
}
static inline uint32_t recomp_int2float_f32_32(uint32_t a) {
  return recomp_f322bits((float)(int32_t)a);
}
static inline uint64_t recomp_int2float_f64_32(uint32_t a) {
  return recomp_f642bits((double)(int32_t)a);
}
static inline uint32_t recomp_int2float_f32_64(uint64_t a) {
  return recomp_f322bits((float)(int64_t)a);
}
static inline uint64_t recomp_int2float_f64_64(uint64_t a) {
  return recomp_f642bits((double)(int64_t)a);
}
static inline uint32_t recomp_trunc_f32_32(uint32_t a) {
  return (uint32_t)(int32_t)recomp_bits2f32(a);
}
static inline uint64_t recomp_trunc_f32_64(uint32_t a) {
  return (uint64_t)(int64_t)recomp_bits2f32(a);
}
static inline uint32_t recomp_trunc_f64_32(uint64_t a) {
  return (uint32_t)(int32_t)recomp_bits2f64(a);
}
static inline uint64_t recomp_trunc_f64_64(uint64_t a) {
  return (uint64_t)(int64_t)recomp_bits2f64(a);
}

/* ---- boundary hooks (hand-written / generated stubs) -------------- */

struct CpuState;
void recomp_call_indirect(struct CpuState *s, uint32_t target);
void recomp_jump_indirect(struct CpuState *s, uint32_t target);
void recomp_unreachable(struct CpuState *s, uint32_t va);

#ifdef __cplusplus
}
#endif
#endif /* RECOMP_RT_H */
