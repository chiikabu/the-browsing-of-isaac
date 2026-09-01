/* Out-of-line runtime pieces for the lifter prototype (hand-written). */
#include <math.h>
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include "recomp_state.h"
#include "recomp_rt.h"

/* RECOMP_VA(va) writes the guest VA of the instruction currently executing.
 * Emitted by TUs built with -DRECOMP_MEM_CHECK=1 so a bad-pointer report can
 * name the instruction that computed it. Declared in recomp_rt.h; the
 * definition belongs here, not in a generated TU. */
uint32_t recomp_cur_va;
volatile uint32_t recomp_va_trace[512];
volatile uint32_t recomp_va_trace_idx;
struct CpuState *recomp_last_cpu; /* captured by shim dispatch (host_trap.c) */

void recomp_trace_glob(uint32_t va, uint32_t val) {
  fprintf(stderr, "[recomp][GLOB] va=%#x val=%u\n", va, val);
}
void recomp_trace_ebx_va(uint32_t va, uint32_t ebx, uint32_t esp, uint32_t ebp) {
  fprintf(stderr, "[recomp][EBX] va=0x%08x EBX=0x%08x ESP=0x%08x EBP=0x%08x\n",
          va, ebx, esp, ebp);
}


double recomp_fsqrt_f64(double a) { return sqrt(a); }
uint32_t recomp_fsqrt_f32(uint32_t a) { return recomp_f322bits(sqrtf(recomp_bits2f32(a))); }
uint32_t recomp_fceil_f32(uint32_t a) { return recomp_f322bits(ceilf(recomp_bits2f32(a))); }
uint64_t recomp_fceil_f64(uint64_t a) { return recomp_f642bits(ceil(recomp_bits2f64(a))); }
uint32_t recomp_ffloor_f32(uint32_t a) { return recomp_f322bits(floorf(recomp_bits2f32(a))); }
uint64_t recomp_ffloor_f64(uint64_t a) { return recomp_f642bits(floor(recomp_bits2f64(a))); }
uint32_t recomp_fround_f32(uint32_t a) { return recomp_f322bits(nearbyintf(recomp_bits2f32(a))); }
uint64_t recomp_fround_f64(uint64_t a) { return recomp_f642bits(nearbyint(recomp_bits2f64(a))); }

/* ---- boundary --------------------------------------------------- */

void recomp_unreachable(CpuState *s, uint32_t va) {
  (void)s;
  fprintf(stderr, "recomp: fell off the end at %#x\n", va);
  abort();
}

/* Indirect dispatch. A real port replaces this with a sorted VA ->
 * function-pointer table built from the function inventory. */
__attribute__((weak)) void recomp_call_indirect(CpuState *s, uint32_t t) {
  (void)s;
  fprintf(stderr, "recomp: unresolved indirect call to %#x\n", t);
  abort();
}

__attribute__((weak)) void recomp_jump_indirect(CpuState *s, uint32_t t) {
  (void)s;
  fprintf(stderr, "recomp: unresolved indirect jump to %#x\n", t);
  abort();
}

/* ------------------------------------------------------------------ */
/* SLEIGH CALLOTHER intrinsics (recomp_other_*).                       */
/*                                                                     */
/* Implemented against the 32-bit signatures emitted by the current    */
/* lift.  Two known limitations, both tracked:                         */
/*  1. MMX ops here take the pypcode-truncated 32-bit halves.  The     */
/*     real instructions are 64-bit (4 x 16-bit lanes); lane N of the  */
/*     low 32 bits is correct, lanes above are lost.  Sites that use   */
/*     these (UCRT _libm_sse2_* polynomial kernels) are platform       */
/*     primitives, but an exact port must re-lift with size-aware      */
/*     CALLOTHER signatures (uint64_t) and real 4-lane bodies.  The    */
/*     2-lane bodies below are the exact low-half semantics.           */
/*  2. in/out return 0 / drop the write.  The boot path performs no    */
/*     device I/O; any real port I/O must be modelled deliberately.    */
/* ------------------------------------------------------------------ */

uint32_t recomp_other_LOCK(CpuState *s) {
  (void)s;                  /* single-threaded port: LOCK is a barrier */
  return 0;
}

uint32_t recomp_other_UNLOCK(CpuState *s) {
  (void)s;
  return 0;
}

uint32_t recomp_other_in(CpuState *s, uint32_t port) {
  (void)s; (void)port;
  return 0;                 /* no device I/O on the boot path */
}

uint32_t recomp_other_out(CpuState *s, uint32_t port,
                                                uint32_t value) {
  (void)s; (void)port; (void)value;
  return 0;
}

/* Execute cpuid(leaf).  The lift models the instruction as a CALLOTHER
 * returning a pointer to a 16-byte record laid out {eax, ebx, edx, ecx}
 * (the lifted join reads EAX=[p], EBX=[p+4], EDX=[p+8], ECX=[p+0xc]).
 * The record lives in the host-owned guest-visible scratch arena at
 * 0x0e004000 (below ISAAC_GUEST_LIMIT_VA so lifted MEMR32 can read it,
 * above every structure host_boot.c currently plants).  Feature set:
 * a fixed "Haswell-class, no AVX" baseline -- SSE2 is what every lifted
 * code path here relies on, and reporting AVX/OSXSAVE off keeps the
 * CRT on the plain SSE2 paths.  Not derived from the original machine
 * (unknown); documented as a chosen baseline. */
#define ISAAC_CPUID_SCRATCH_VA 0x0e004000u

static uint32_t *recomp_cpuid_record(uint32_t leaf) {
  uint32_t *rec = (uint32_t *)(uintptr_t)ISAAC_CPUID_SCRATCH_VA;
  uint32_t eax = 0, ebx = 0, ecx = 0, edx = 0;
  switch (leaf) {
    case 0x00000000u:
      eax = 0x0du;                              /* max standard leaf */
      ebx = 0x756e6547u;                        /* "Genu" */
      edx = 0x49656e69u;                        /* "ineI" */
      ecx = 0x6c65746eu;                        /* "ntel" */
      break;
    case 0x00000001u:
      eax = 0x000306c3u;                        /* Haswell, no AVX bits used */
      ebx = 0x02100800u;                        /* clflush 8, 8 logical cpus */
      ecx = (1u << 0)  | (1u << 9)  | (1u << 19)
          | (1u << 20) | (1u << 23);            /* SSE3 SSSE3 SSE4.1 SSE4.2 POPCNT */
      edx = (1u << 15) | (1u << 23) | (1u << 24)
          | (1u << 25) | (1u << 26);            /* CMOV MMX FXSR SSE SSE2 */
      break;
    case 0x80000000u:
      eax = 0x80000008u;                        /* max extended leaf */
      break;
    case 0x80000001u:
      edx = (1u << 15) | (1u << 25) | (1u << 26); /* CMOV SSE SSE2 */
      break;
    default:
      break;                                    /* unknown leaves: zeros */
  }
  rec[0] = eax;
  rec[1] = ebx;
  rec[2] = edx;   /* NB: record order matches the lifted join's reads */
  rec[3] = ecx;
  return rec;
}

#define DEF_CPUID(NAME)                                                  \
  uint32_t recomp_other_##NAME(CpuState *s,          \
                                                     uint32_t leaf) {      \
    (void)s;                                                              \
    return (uint32_t)(uintptr_t)recomp_cpuid_record(leaf);                \
  }

DEF_CPUID(cpuid)
DEF_CPUID(cpuid_basic_info)
DEF_CPUID(cpuid_Version_info)
DEF_CPUID(cpuid_cache_tlb_info)
DEF_CPUID(cpuid_serial_info)
DEF_CPUID(cpuid_Deterministic_Cache_Parameters_info)
DEF_CPUID(cpuid_MONITOR_MWAIT_Features_info)
DEF_CPUID(cpuid_Thermal_Power_Management_info)
DEF_CPUID(cpuid_Extended_Feature_Enumeration_info)
DEF_CPUID(cpuid_Extended_Topology_info)
DEF_CPUID(cpuid_Processor_Extended_States_info)
DEF_CPUID(cpuid_Quality_of_Service_info)
DEF_CPUID(cpuid_Direct_Cache_Access_info)
DEF_CPUID(cpuid_Architectural_Performance_Monitoring_info)
DEF_CPUID(cpuid_brand_part1_info)
DEF_CPUID(cpuid_brand_part2_info)
DEF_CPUID(cpuid_brand_part3_info)

/* seg:[off] memory operand.  Flat segmentation: DS/SS/ES/CS base 0;
 * FS/GS use the segment bases planted by host_boot.c. */
uint32_t recomp_other_segment(CpuState *s,
                                                    uint32_t seg,
                                                    uint32_t off) {
  if ((uint16_t)seg == s->FS) return s->FS_OFFSET + off;   /* FS -> TEB */
  if ((uint16_t)seg == s->GS) return s->GS_OFFSET + off;   /* GS */
  return off;                                              /* flat */
}

/* sldt: no LDT is installed in this flat model. */
uint32_t recomp_other_LocalDescriptorTableRegister(
    CpuState *s) {
  (void)s;
  return 0;
}

/* ---- MMX lane helpers (truncated 32-bit view; see file header) ---- */

static __inline int16_t rc_sat16(int32_t v) {
  if (v > 32767) return 32767;
  if (v < -32768) return -32768;
  return (int16_t)v;
}
static __inline uint8_t rc_satu8(int32_t v) {
  if (v > 255) return 255;
  if (v < 0) return 0;
  return (uint8_t)v;
}
static __inline uint16_t rc_satu16(int32_t v) {
  if (v > 65535) return 65535;
  if (v < 0) return 0;
  return (uint16_t)v;
}

uint32_t recomp_other_pmulhw(CpuState *s, uint32_t a,
                                                   uint32_t b) {
  (void)s;
  int16_t la = (int16_t)(a & 0xffffu), ha = (int16_t)(a >> 16);
  int16_t lb = (int16_t)(b & 0xffffu), hb = (int16_t)(b >> 16);
  uint32_t lo = (uint32_t)(uint16_t)((int32_t)la * lb >> 16);
  uint32_t hi = (uint32_t)(uint16_t)((int32_t)ha * hb >> 16);
  return lo | (hi << 16);
}

uint32_t recomp_other_psraw(CpuState *s, uint32_t a,
                                                  uint32_t b) {
  (void)s;
  unsigned c = b & 0x3fu;
  if (c >= 16) c = 15;
  int16_t la = (int16_t)(a & 0xffffu) >> c;
  int16_t ha = (int16_t)(a >> 16) >> c;
  return (uint32_t)(uint16_t)la | ((uint32_t)(uint16_t)ha << 16);
}

uint32_t recomp_other_psllw(CpuState *s, uint32_t a,
                                                  uint32_t b) {
  (void)s;
  unsigned c = b & 0x3fu;
  uint16_t lo = (c >= 16) ? 0u : (uint16_t)((a & 0xffffu) << c);
  uint16_t hi = (c >= 16) ? 0u : (uint16_t)((a >> 16) << c);
  return (uint32_t)lo | ((uint32_t)hi << 16);
}

uint32_t recomp_other_paddsw(CpuState *s, uint32_t a,
                                                   uint32_t b) {
  (void)s;
  int16_t la = (int16_t)(a & 0xffffu), ha = (int16_t)(a >> 16);
  int16_t lb = (int16_t)(b & 0xffffu), hb = (int16_t)(b >> 16);
  uint32_t lo = (uint16_t)rc_sat16((int32_t)la + lb);
  uint32_t hi = (uint16_t)rc_sat16((int32_t)ha + hb);
  return lo | (hi << 16);
}

uint32_t recomp_other_paddusb(CpuState *s, uint32_t a,
                                                    uint32_t b) {
  (void)s;
  uint32_t r = 0;
  for (int k = 0; k < 4; k++)
    r |= (uint32_t)rc_satu8(((a >> (8 * k)) & 0xff) + ((b >> (8 * k)) & 0xff))
         << (8 * k);
  return r;
}

uint32_t recomp_other_psubusb(CpuState *s, uint32_t a,
                                                    uint32_t b) {
  (void)s;
  uint32_t r = 0;
  for (int k = 0; k < 4; k++)
    r |= (uint32_t)rc_satu8(((a >> (8 * k)) & 0xff) - ((b >> (8 * k)) & 0xff))
         << (8 * k);
  return r;
}

uint32_t recomp_other_psubusw(CpuState *s, uint32_t a,
                                                    uint32_t b) {
  (void)s;
  uint32_t lo = rc_satu16((a & 0xffffu) - (b & 0xffffu));
  uint32_t hi = rc_satu16((a >> 16) - (b >> 16));
  return lo | (hi << 16);
}

uint32_t recomp_other_packsswb(CpuState *s, uint32_t a,
                                                     uint32_t b) {
  (void)s;
  /* low-half-of-a lanes first, then low-half-of-b -- the truncated
   * pcode view; see file header for the relift note */
  int16_t lanes[4] = { (int16_t)(a & 0xffffu), (int16_t)(a >> 16),
                       (int16_t)(b & 0xffffu), (int16_t)(b >> 16) };
  uint8_t bytes[4];
  for (int k = 0; k < 4; k++) {
    int32_t v = (int32_t)lanes[k];
    bytes[k] = (uint8_t)(v > 127 ? 127 : (v < -128 ? (uint8_t)0x80 : (uint8_t)v));
  }
  return (uint32_t)bytes[0] | ((uint32_t)bytes[1] << 8)
       | ((uint32_t)bytes[2] << 16) | ((uint32_t)bytes[3] << 24);
}

uint32_t recomp_other_swi(CpuState *s, uint32_t n) {
  (void)s;
  fprintf(stderr, "recomp: software interrupt %u\n", (unsigned)n);
  abort();
  return 0;
}

/* Only referenced by TUs built with -DRECOMP_MEM_CHECK=1. */
void recomp_mem_fault(uint32_t addr, unsigned bytes, int write) {
  fprintf(stderr,
          "[recomp][MEM] guest %s of %u byte(s) at 0x%08x is outside the "
          "guest address space -- the lifted code computed a bad pointer.\n"
          "                 last lifted instruction: 0x%08x\n",
          write ? "write" : "read", bytes, addr, recomp_cur_va);
  /* instruction trace: last 512 executed guest VAs */
  uint32_t n = recomp_va_trace_idx < 512u ? recomp_va_trace_idx : 512u;
  uint32_t start = (recomp_va_trace_idx - n) & 511u;
  fprintf(stderr, "[recomp][MEM] ---- last %u executed guest VAs (oldest -> newest):\n", n);
  for (uint32_t i = 0; i < n; i++)
    fprintf(stderr, "[recomp][MEM]   %08x\n", recomp_va_trace[(start + i) & 511u]);
  /* register image from the last shim dispatch (captured in host_trap.c) */
  {
    extern void isaac_dump_regs(const struct CpuState *s, const char *tag);
    if (recomp_last_cpu)
      isaac_dump_regs(recomp_last_cpu, "register image (from last shim dispatch)");
    else
      fprintf(stderr, "[recomp][MEM]   (no shim dispatch has run - recomp_last_cpu is null)\n");
  }
  /* guest stack top region (stack lives at ISAAC_STACK_TOP_VA - 1MiB .. top) */
  fprintf(stderr, "[recomp][MEM] ---- guest stack top dwords 0x0dff0000-0x40 .. 0x0dff0000 (ESP==top means empty):\n");
  for (int i = 0; i < 16; i++) {
    uint32_t a = 0x0dff0000u - (uint32_t)(i * 16);
    fprintf(stderr, "[recomp][MEM]   %08x: %08x %08x %08x %08x\n", a,
            ((uint32_t *)RECOMP_PTR(a))[0], ((uint32_t *)RECOMP_PTR(a))[1],
            ((uint32_t *)RECOMP_PTR(a))[2], ((uint32_t *)RECOMP_PTR(a))[3]);
  }
  abort();
}
