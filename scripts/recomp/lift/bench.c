/* Runtime cost: mechanically lifted x86 vs. the hand-written translation,
 * same workload, same wasm module. */
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

#include "recomp_state.h"
#include "recomp_rt.h"
#include "lifted_decls.h"
#include "exit_pure_helpers.h"

#define GSTACK_BYTES 0x10000
static uint8_t *g_stack;
#define FAKE_RET 0x00deadbeu

void sub_00aef15c(CpuState *restrict s) {
  s->EIP = MEMR32(s->ESP);
  s->ESP += 4;
}

static void cpu_reset(CpuState *s) {
  memset(s, 0, sizeof(*s));
  s->ESP = (uint32_t)(uintptr_t)(g_stack + GSTACK_BYTES - 0x100);
  s->EBP = s->ESP;
}
static void gpush(CpuState *s, uint32_t v) { s->ESP -= 4; MEMW32(s->ESP, v); }

#define STR_SIZE_OFF 0x10
#define STR_CAP_OFF  0x14
#define NODE_LEFT 0x00
#define NODE_PARENT 0x04
#define NODE_RIGHT 0x08
#define NODE_ISNIL 0x0d
#define NODE_KEY 0x10
#define NODE_BYTES 0x40
#define NKEYS 512

static uint32_t g_nodes[NKEYS], g_sentinel, g_map, g_probe[64];

static uint32_t build(int lo, int hi, uint32_t parent, uint32_t nil) {
  if (lo > hi) return nil;
  int mid = (lo + hi) / 2;
  uint32_t nd = g_nodes[mid];
  MEMW32(nd + NODE_PARENT, parent);
  MEMW32(nd + NODE_LEFT, build(lo, mid - 1, nd, nil));
  MEMW32(nd + NODE_RIGHT, build(mid + 1, hi, nd, nil));
  return nd;
}

static void mkstr(uint32_t at, const char *t) {
  size_t n = strlen(t);
  memset((void *)(uintptr_t)at, 0, 0x18);
  memcpy((void *)(uintptr_t)at, t, n);
  MEMW32(at + STR_SIZE_OFF, (uint32_t)n);
  MEMW32(at + STR_CAP_OFF, 0xf);
}

static double now_ms(void) {
  struct timespec ts;
  clock_gettime(CLOCK_MONOTONIC, &ts);
  return ts.tv_sec * 1000.0 + ts.tv_nsec / 1e6;
}

int main(int argc, char **argv) {
  int reps = argc > 1 ? atoi(argv[1]) : 200;
  g_stack = (uint8_t *)malloc(GSTACK_BYTES);
  uint8_t *arena = (uint8_t *)malloc(0x40000);
  uint8_t *c = arena;
  g_map = (uint32_t)(uintptr_t)c; c += 0x20;
  g_sentinel = (uint32_t)(uintptr_t)c; c += NODE_BYTES;
  for (int i = 0; i < NKEYS; ++i) { g_nodes[i] = (uint32_t)(uintptr_t)c; c += NODE_BYTES; }
  memset((void *)(uintptr_t)g_sentinel, 0, NODE_BYTES);
  *(uint8_t *)(uintptr_t)(g_sentinel + NODE_ISNIL) = 1;
  char buf[16];
  for (int i = 0; i < NKEYS; ++i) {
    memset((void *)(uintptr_t)g_nodes[i], 0, NODE_BYTES);
    snprintf(buf, sizeof buf, "key%05d", i);
    mkstr(g_nodes[i] + NODE_KEY, buf);
  }
  uint32_t root = build(0, NKEYS - 1, g_sentinel, g_sentinel);
  MEMW32(g_sentinel + NODE_PARENT, root);
  MEMW32(g_map, g_sentinel);
  for (int i = 0; i < 64; ++i) {
    g_probe[i] = (uint32_t)(uintptr_t)c; c += 0x20;
    snprintf(buf, sizeof buf, "key%05d", (i * 7919) % (NKEYS + 40));
    mkstr(g_probe[i], buf);
  }
  uint32_t out = (uint32_t)(uintptr_t)c;

  volatile uint32_t sink = 0;
  CpuState st;

  /* warm */
  for (int i = 0; i < 64; ++i) sink += isaac_exit_map_lower_bound(g_map, out, g_probe[i]);

  double t0 = now_ms();
  for (int r = 0; r < reps; ++r)
    for (int i = 0; i < 64; ++i)
      sink += isaac_exit_map_lower_bound(g_map, out, g_probe[i]);
  double t1 = now_ms();

  for (int r = 0; r < reps; ++r)
    for (int i = 0; i < 64; ++i) {
      cpu_reset(&st);
      st.ECX = g_map;
      gpush(&st, g_probe[i]);
      gpush(&st, out);
      gpush(&st, FAKE_RET);
      sub_00685bc0(&st);
      sink += st.EAX;
    }
  double t2 = now_ms();

  long calls = (long)reps * 64;
  printf("lower_bound  hand-written : %8.2f ms  (%.1f ns/call)\n",
         t1 - t0, (t1 - t0) * 1e6 / calls);
  printf("lower_bound  lifted       : %8.2f ms  (%.1f ns/call)\n",
         t2 - t1, (t2 - t1) * 1e6 / calls);
  printf("ratio lifted/hand         : %.2fx\n", (t2 - t1) / (t1 - t0));

  /* string tidy: lifted vs the reference model is not comparable
   * (the reference is a plan struct), so time the lifted one alone. */
  uint32_t obj = (uint32_t)(uintptr_t)c;
  double t3 = now_ms();
  for (int r = 0; r < reps * 64; ++r) {
    MEMW32(obj + STR_CAP_OFF, 0xf);
    MEMW32(obj + STR_SIZE_OFF, 5);
    cpu_reset(&st);
    st.ECX = obj;
    gpush(&st, FAKE_RET);
    sub_0040d040(&st);
    sink += MEMR32(obj + STR_CAP_OFF);
  }
  double t4 = now_ms();
  printf("tidy(SSO)    lifted       : %8.2f ms  (%.1f ns/call)\n",
         t4 - t3, (t4 - t3) * 1e6 / calls);
  printf("sink=%u\n", (unsigned)sink);
  return 0;
}
