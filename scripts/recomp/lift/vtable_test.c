/* End-to-end dynamic dispatch through a REAL vtable from .rdata.
 *
 * Guest VAs are wasm linear-memory offsets (identity addressing), so the
 * PE image regions are copied to their real addresses and a C++ virtual
 * call in lifted code reads a genuine .rdata vtable, resolves the slot to
 * a wasm function through the dispatch table, and runs the right override.
 *
 * Two different real vtables are pointed at the same call site; the test
 * only passes if the dispatch actually selects on vtable contents.
 */
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "recomp_state.h"
#include "recomp_rt.h"
#include "lifted_decls.h"
#include "image_slices.h"     /* generated: g_slices[], G_NSLICES */
#include "dispatch_tbl.h"     /* generated: g_dva[], g_dfn[], G_NDISPATCH */

/* ---- dispatch: VA -> wasm function (direct-mapped over .text) ---- */
#define TEXT_LO 0x00401000u
#define TEXT_HI 0x00b17134u
static uint16_t *g_map;
static int g_unresolved;

static void dispatch_init(void) {
  size_t n = (size_t)(TEXT_HI - TEXT_LO);
  g_map = (uint16_t *)malloc(n * sizeof(uint16_t));
  memset(g_map, 0xFF, n * sizeof(uint16_t));
  for (uint32_t i = 0; i < G_NDISPATCH; ++i)
    g_map[g_dva[i] - TEXT_LO] = (uint16_t)i;
}

void recomp_call_indirect(CpuState *s, uint32_t target) {
  uint32_t off = target - TEXT_LO;
  if (off < (uint32_t)(TEXT_HI - TEXT_LO)) {
    uint16_t id = g_map[off];
    if (id != 0xFFFFu) { g_dfn[id](s); return; }   /* wasm call_indirect */
  }
  ++g_unresolved;
  fprintf(stderr, "  unresolved indirect target %#x\n", target);
}
void recomp_jump_indirect(CpuState *s, uint32_t t) { recomp_call_indirect(s, t); }

/* ---- boundary ---------------------------------------------------- */
static int g_tail_called;
void sub_006acb00(CpuState *restrict s) {   /* the dispatcher's tail jmp */
  g_tail_called = 1;
  s->EIP = MEMR32(s->ESP);
  s->ESP += 4;
}

/* ---- guest stack ------------------------------------------------- */
#define GS 0x10000
static uint8_t *g_stack;
#define FAKE_RET 0x00deadbeu
static void cpu_reset(CpuState *s) {
  memset(s, 0, sizeof(*s));
  s->ESP = (uint32_t)(uintptr_t)(g_stack + GS - 0x100);
  s->EBP = s->ESP;
}
static void gpush(CpuState *s, uint32_t v) { s->ESP -= 4; MEMW32(s->ESP, v); }

/* ---- the test ---------------------------------------------------- */
#define VTBL_A 0x00b81270u   /* slot +0x28 -> 0x009f3140  xor eax,eax; ret   */
#define VTBL_B 0x00b812b8u   /* slot +0x28 -> 0x009f3160  mov eax,[ecx+0x48] */
#define DISPATCHER 0x006ee110u
#define INNER_OFF 0x590u

static int run_case(uint32_t vtbl, uint32_t magic, uint32_t expect,
                    const char *what) {
  /* outer object at 0x02000000, inner at 0x02001000 - plain guest memory */
  uint32_t outer = 0x02000000u, inner = 0x02001000u;
  memset((void *)(uintptr_t)outer, 0, 0x600 + 8);
  memset((void *)(uintptr_t)inner, 0, 0x100);
  MEMW32(outer + INNER_OFF, inner);
  MEMW32(inner, vtbl);              /* the vptr, pointing at real .rdata */
  MEMW32(inner + 0x48, magic);

  CpuState st;
  cpu_reset(&st);
  st.ECX = outer;
  gpush(&st, FAKE_RET);
  g_tail_called = 0;
  int before = g_unresolved;
  sub_006ee110(&st);

  int ok = (st.EAX == expect) && (g_unresolved == before) && g_tail_called;
  printf("  vtbl %#010x -> slot[+0x28] : EAX=%#010x expect=%#010x  "
         "tail=%d  %s   [%s]\n", vtbl, st.EAX, expect, g_tail_called,
         ok ? "PASS" : "FAIL", what);
  return ok ? 0 : 1;
}

int main(void) {
  /* map the PE regions the test touches to their real VAs */
  for (uint32_t i = 0; i < G_NSLICES; ++i)
    memcpy((void *)(uintptr_t)g_slices[i].va, g_slices[i].data,
           g_slices[i].len);
  dispatch_init();
  g_stack = (uint8_t *)malloc(GS);

  printf("dynamic dispatch through real .rdata vtables\n");
  printf("  dispatch entries: %u   direct map: %.1f MB\n",
         G_NDISPATCH, (TEXT_HI - TEXT_LO) * 2.0 / 1048576.0);
  printf("  vtable bytes read from linear memory at their real VAs\n");
  /* prove the vtable really is the image's, not something we wrote */
  printf("  [%#010x+0x28] = %#010x   [%#010x+0x28] = %#010x\n",
         VTBL_A, MEMR32(VTBL_A + 0x28), VTBL_B, MEMR32(VTBL_B + 0x28));

  int bad = 0;
  bad += run_case(VTBL_A, 0xCAFEBABEu, 0x00000000u, "override A: xor eax,eax");
  bad += run_case(VTBL_B, 0xCAFEBABEu, 0xCAFEBABEu, "override B: mov eax,[ecx+0x48]");
  bad += run_case(VTBL_B, 0x12345678u, 0x12345678u, "override B, second value");
  printf("%s\n", bad ? "RESULT: FAIL" : "RESULT: ALL PASS");
  return bad ? 1 : 0;
}
