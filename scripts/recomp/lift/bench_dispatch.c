/* Cost of VA -> wasm function dispatch, measured in wasm.
 *
 * With identity addressing a guest code pointer IS a VA, so every dynamic
 * indirect call has to turn a 32-bit VA into a wasm function index.  This
 * measures the three plausible ways to do that against the real function
 * entry set, plus the call_indirect that follows.
 *
 * A  sorted binary search        O(log n), 4n bytes
 * B  direct-mapped byte table    O(1), (text_size) bytes of uint16
 * C  open-addressed hash         O(1) expected, 6 * 2^k bytes
 */
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

#include "dispatch_data.h"   /* generated: g_va[], G_N, TEXT_LO, TEXT_HI */

static double now_ms(void) {
  struct timespec ts;
  clock_gettime(CLOCK_MONOTONIC, &ts);
  return ts.tv_sec * 1000.0 + ts.tv_nsec / 1e6;
}

/* ---- A: binary search ------------------------------------------- */
static uint32_t lookup_bsearch(uint32_t va) {
  uint32_t lo = 0, hi = G_N;
  while (lo < hi) {
    uint32_t mid = (lo + hi) >> 1;
    if (g_va[mid] < va) lo = mid + 1; else hi = mid;
  }
  return (lo < G_N && g_va[lo] == va) ? lo : 0xFFFFFFFFu;
}

/* ---- B: direct-mapped ------------------------------------------- */
static uint16_t *g_direct;         /* TEXT_HI-TEXT_LO entries */
static void build_direct(void) {
  size_t n = (size_t)(TEXT_HI - TEXT_LO);
  g_direct = (uint16_t *)malloc(n * sizeof(uint16_t));
  memset(g_direct, 0xFF, n * sizeof(uint16_t));
  for (uint32_t i = 0; i < G_N; ++i) g_direct[g_va[i] - TEXT_LO] = (uint16_t)i;
}
static uint32_t lookup_direct(uint32_t va) {
  uint32_t off = va - TEXT_LO;
  if (off >= (uint32_t)(TEXT_HI - TEXT_LO)) return 0xFFFFFFFFu;
  uint16_t v = g_direct[off];
  return v == 0xFFFFu ? 0xFFFFFFFFu : v;
}

/* ---- C: open-addressed hash ------------------------------------- */
#define HBITS 15
#define HSIZE (1u << HBITS)
static uint32_t g_hk[HSIZE];
static uint16_t g_hv[HSIZE];
static inline uint32_t hash_va(uint32_t va) {
  uint32_t h = va * 2654435761u;          /* Knuth */
  return h >> (32 - HBITS);
}
static uint32_t g_max_probe;
static void build_hash(void) {
  memset(g_hk, 0, sizeof(g_hk));
  for (uint32_t i = 0; i < G_N; ++i) {
    uint32_t h = hash_va(g_va[i]), p = 0;
    while (g_hk[h] != 0) { h = (h + 1) & (HSIZE - 1); ++p; }
    g_hk[h] = g_va[i]; g_hv[h] = (uint16_t)i;
    if (p > g_max_probe) g_max_probe = p;
  }
}
static uint32_t lookup_hash(uint32_t va) {
  uint32_t h = hash_va(va);
  for (;;) {
    uint32_t k = g_hk[h];
    if (k == va) return g_hv[h];
    if (k == 0) return 0xFFFFFFFFu;
    h = (h + 1) & (HSIZE - 1);
  }
}

/* ---- the call that follows -------------------------------------- */
typedef uint32_t (*fn_t)(uint32_t);
#define NFN 256
static uint32_t f0(uint32_t x){return x+1;}   static uint32_t f1(uint32_t x){return x+2;}
static uint32_t f2(uint32_t x){return x+3;}   static uint32_t f3(uint32_t x){return x+5;}
static fn_t g_tbl[NFN];

int main(int argc, char **argv) {
  int reps = argc > 1 ? atoi(argv[1]) : 40;
  build_direct();
  build_hash();
  for (int i = 0; i < NFN; ++i)
    g_tbl[i] = (i & 3) == 0 ? f0 : (i & 3) == 1 ? f1 : (i & 3) == 2 ? f2 : f3;

  /* Access pattern: VAs drawn from the real entry set, xorshift order, so
     the branch predictor and cache see something like real vtable traffic. */
  enum { NP = 65536 };
  static uint32_t probe[NP];
  uint32_t rs = 0x2545F491u;
  for (int i = 0; i < NP; ++i) {
    rs ^= rs << 13; rs ^= rs >> 17; rs ^= rs << 5;
    probe[i] = g_va[rs % G_N];
  }

  printf("entries=%u  text=%u bytes  direct table=%.1f MB  hash=%u slots "
         "(max probe %u)\n", G_N, (unsigned)(TEXT_HI - TEXT_LO),
         (TEXT_HI - TEXT_LO) * 2.0 / 1048576.0, HSIZE, g_max_probe);

  volatile uint32_t sink = 0;
  long calls = (long)reps * NP;
  double t;

#define RUN(NAME, EXPR)                                                   \
  do {                                                                    \
    for (int i = 0; i < NP; ++i) sink += (EXPR);                          \
    t = now_ms();                                                         \
    for (int r = 0; r < reps; ++r)                                        \
      for (int i = 0; i < NP; ++i) sink += (EXPR);                        \
    t = now_ms() - t;                                                     \
    printf("  %-26s %8.2f ms   %6.2f ns/lookup\n", NAME, t,               \
           t * 1e6 / calls);                                              \
  } while (0)

  RUN("A binary search", lookup_bsearch(probe[i]));
  RUN("B direct-mapped", lookup_direct(probe[i]));
  RUN("C open-addressed hash", lookup_hash(probe[i]));
  RUN("  baseline (array read)", probe[i]);
  RUN("C hash + call_indirect", g_tbl[lookup_hash(probe[i]) & (NFN - 1)](i));
  RUN("  call_indirect alone", g_tbl[i & (NFN - 1)](i));

  printf("sink=%u\n", (unsigned)sink);
  return 0;
}
