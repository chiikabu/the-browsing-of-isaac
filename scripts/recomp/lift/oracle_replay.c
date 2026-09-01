/* Replay oracle ground-truth vectors against the lifted wasm.
 *
 * One vector per exported call, so the JS driver can catch a wasm trap
 * (out-of-bounds guest access) and score it as a failure instead of
 * killing the whole run.
 *
 * File format (little-endian), written by oracle_replay.py:
 *   u32 magic 'ORCL'  u32 n_funcs  u32 n_vectors
 *   per vector, flat and self-delimiting:
 *     u32 rec_len (including these 8 bytes)   u32 va
 *     u32 ecx  u32 edx  u32 n_stack  u32 stack[n_stack]
 *     u32 n_mem     (u32 addr, u32 len, u8 bytes[len]) * n_mem
 *     u32 eax edx ecx ebx esi edi ebp esp_delta
 *     u32 n_writes  (u32 addr, u32 len, u8 bytes[len]) * n_writes
 *
 * The record length makes the walk drift-proof.  A field-by-field parser
 * that disagreed with the writer by one dword silently misread every
 * later record; that is the bug this format removes.
 */
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include "recomp_state.h"
#include "recomp_rt.h"
#include "lifted_decls.h"
#include "dispatch_tbl.h"

#define TEXT_LO 0x00401000u
#define TEXT_HI 0x00b17134u

/* The oracle's guest stack: top 0x30001000, entry ESP = 0x30000FFC (the
 * return-address slot), stack args at ESP+4, ESP+8, ... left to right. */
#define ORACLE_ESP 0x30000ffcu
#define GUEST_HI   0x34000000ull

static uint16_t *g_map;
static int g_unresolved;
static int g_strict = 1;

void recomp_call_indirect(CpuState *s, uint32_t t) {
  uint32_t off = t - TEXT_LO;
  if (off < (uint32_t)(TEXT_HI - TEXT_LO)) {
    uint16_t id = g_map[off];
    if (id != 0xFFFFu) { g_dfn[id](s); return; }
  }
  ++g_unresolved;
}
void recomp_jump_indirect(CpuState *s, uint32_t t) { recomp_call_indirect(s, t); }

static const uint8_t **g_vec;
static uint32_t *g_vec_len;
static uint32_t g_nvec, g_nfn;

int orc_load_image(const char *path) {
  FILE *f = fopen(path, "rb");
  if (!f) return -1;
  uint32_t magic, n;
  if (fread(&magic, 4, 1, f) != 1 || magic != 0x474D4941u) { fclose(f); return -2; }
  if (fread(&n, 4, 1, f) != 1) { fclose(f); return -3; }
  for (uint32_t i = 0; i < n; ++i) {
    uint32_t va, len;
    if (fread(&va, 4, 1, f) != 1 || fread(&len, 4, 1, f) != 1) { fclose(f); return -4; }
    if (fread((void *)(uintptr_t)va, 1, len, f) != len) { fclose(f); return -5; }
  }
  fclose(f);
  return (int)n;
}

int orc_load(const char *path) {
  FILE *f = fopen(path, "rb");
  if (!f) return -1;
  fseek(f, 0, SEEK_END);
  long sz = ftell(f);
  fseek(f, 0, SEEK_SET);
  uint8_t *buf = (uint8_t *)malloc((size_t)sz);
  if (!buf || fread(buf, 1, (size_t)sz, f) != (size_t)sz) return -2;
  fclose(f);
  const uint8_t *p = buf, *end = buf + sz;
  uint32_t magic;
  memcpy(&magic, p, 4); p += 4;
  if (magic != 0x4C43524Fu) return -3;
  memcpy(&g_nfn, p, 4); p += 4;
  uint32_t claimed;
  memcpy(&claimed, p, 4); p += 4;

  size_t mn = (size_t)(TEXT_HI - TEXT_LO);
  g_map = (uint16_t *)malloc(mn * sizeof(uint16_t));
  if (!g_map) return -6;
  memset(g_map, 0xFF, mn * sizeof(uint16_t));
  for (uint32_t i = 0; i < G_NDISPATCH; ++i)
    g_map[g_dva[i] - TEXT_LO] = (uint16_t)i;

  g_vec = (const uint8_t **)malloc((claimed + 1) * sizeof(*g_vec));
  g_vec_len = (uint32_t *)malloc((claimed + 1) * sizeof(uint32_t));
  g_nvec = 0;
  while (p + 8 <= end && g_nvec < claimed) {
    uint32_t rl;
    memcpy(&rl, p, 4);
    if (rl < 8 || p + rl > end) break;
    g_vec[g_nvec] = p;
    g_vec_len[g_nvec] = rl;
    ++g_nvec;
    p += rl;
  }
  return (p == end && g_nvec == claimed) ? 0 : -7;
}

/* strict=1 compares every register; strict=0 compares only what the
   oracle vector contract actually defines as an input (ECX, EDX, stack,
   memory) plus the ABI return path: EAX, esp_delta and memory writes.
   EBX/ESI/EDI/EBP are callee-saved: their expected value is the oracle's
   own entry value, which the stable schema does not expose. */
void orc_set_strict(int v) { g_strict = v; }
uint32_t orc_nvec(void) { return g_nvec; }
uint32_t orc_nfn(void) { return g_nfn; }
uint32_t orc_vec_va(uint32_t i) {
  uint32_t va;
  memcpy(&va, g_vec[i] + 4, 4);
  return va;
}

/* 0 = pass, >0 = which check failed */
int orc_run(uint32_t vi) {
  const uint8_t *p = g_vec[vi];
  const uint8_t *end = p + g_vec_len[vi];
  uint32_t va;
  memcpy(&va, p + 4, 4);
  p += 8;

  uint32_t off = va - TEXT_LO;
  uint16_t id = (off < (uint32_t)(TEXT_HI - TEXT_LO)) ? g_map[off] : 0xFFFFu;
  if (id == 0xFFFFu) return 99;

#define NEED(k) do { if (p + (k) > end) return 90; } while (0)
#define GUEST_OK(a, l) ((a) >= 0x1000u && (uint64_t)(a) + (l) <= GUEST_HI)

  uint32_t ecx, edx, nst;
  NEED(12);
  memcpy(&ecx, p, 4); memcpy(&edx, p + 4, 4); p += 8;
  memcpy(&nst, p, 4); p += 4;
  if (nst > 64) return 91;
  NEED(4 * nst + 4);
  const uint8_t *stk = p;
  p += 4 * nst;
  uint32_t nmem;
  memcpy(&nmem, p, 4); p += 4;
  for (uint32_t k = 0; k < nmem; ++k) {
    uint32_t a, len;
    NEED(8);
    memcpy(&a, p, 4); memcpy(&len, p + 4, 4); p += 8;
    NEED(len);
    if (!GUEST_OK(a, len)) return 93;
    memcpy((void *)(uintptr_t)a, p, len);
    p += len;
  }
  uint32_t exp[8];
  NEED(36);
  memcpy(exp, p, 32); p += 32;
  uint32_t nw;
  memcpy(&nw, p, 4); p += 4;
  const uint8_t *wp = p;

  CpuState st;
  memset(&st, 0, sizeof(st));
  st.ESP = ORACLE_ESP;
  MEMW32(st.ESP, 0x00deadbeu);
  for (uint32_t k = 0; k < nst; ++k) {
    uint32_t v;
    memcpy(&v, stk + 4 * k, 4);
    MEMW32(st.ESP + 4 + 4 * k, v);
  }
  uint32_t entry_esp = st.ESP;
  st.ECX = ecx;
  st.EDX = edx;
  g_unresolved = 0;
  g_dfn[id](&st);

  if (g_unresolved) return 1;
  if (st.EAX != exp[0]) return 2;
  if (g_strict) {
    if (st.EDX != exp[1]) return 3;
    if (st.ECX != exp[2]) return 4;
    if (st.EBX != exp[3]) return 5;
    if (st.ESI != exp[4]) return 6;
    if (st.EDI != exp[5]) return 7;
  }
  if ((st.ESP - entry_esp) != exp[7]) return 8;
  const uint8_t *q = wp;
  for (uint32_t k = 0; k < nw; ++k) {
    uint32_t a, len;
    if (q + 8 > end) return 95;
    memcpy(&a, q, 4); memcpy(&len, q + 4, 4); q += 8;
    if (q + len > end) return 96;
    if (!GUEST_OK(a, len)) return 97;
    if (memcmp((void *)(uintptr_t)a, q, len) != 0) return 9;
    q += len;
  }
  return 0;
}
