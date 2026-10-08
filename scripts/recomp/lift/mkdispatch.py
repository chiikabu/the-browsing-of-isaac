"""Generate the VA -> wasm function dispatch for a lifted module.

Emits a .h (extern declarations + the entry table) and a .c that provides
the two symbols the host layer expects (see isaac_host.h and
host_trap.c):

    int  isaac_lifted_dispatch(uint32_t va, CpuState *cpu);  -> 1 if handled
    void isaac_guest_call(uint32_t va, CpuState *cpu);        -> loud on miss

Lookup uses a two-level paged uint16 index over the .text VA range, built
once at first use. Only pages containing function entries have storage;
empty directory slots share an all-missing page. Block re-entry uses a
separate, lazy uint32 index with smaller pages. Each index is one allocation
in the host region above ISAAC_GUARD_VA, unreachable by guest wild pointers.

Optionally also emits image_slices.h for tests that need PE bytes at their
real VAs without a full boot.
"""

import argparse
import glob
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pe import PE32                                     # noqa: E402
from split_giants import MARK as SPLIT_MARK, RE_PEND      # noqa: E402

TEXT_LO = 0x00401000
TEXT_HI = 0x00B17134
DPAGE_BITS = 5
BPAGE_BITS = 3
RE_DEFINITION = re.compile(
    r"^void (sub_([0-9a-f]{8})[A-Za-z0-9_]*)\s*"
    r"\(CpuState\s*\*\s*(?:restrict\s+)?[A-Za-z_]\w*\)\s*\{", re.M)
RE_RV = re.compile(r"RECOMP_VA\(0x([0-9a-fA-F]{1,8})u\)")
RE_PART_DEFINITION = re.compile(
    r"^static void (?:__attribute__\(\(noinline\)\) )?"
    r"(sub_[0-9a-f]{8}[A-Za-z0-9_]*)__p[0-9]+"
    r"\(CpuState \*restrict s, uint32_t nb\) \{")
RE_SPLIT_TRAMPOLINE = re.compile(
    re.escape(SPLIT_MARK) + r"(?: v[0-9]+)? (sub_[0-9a-f]{8}[A-Za-z0-9_]*):")


def scan_lifted_sources(paths, continuations):
    """Return definitions and first-owner block targets from generated C.

    Wrapped entries keep their public name, but their continuation labels live
    in sub_X__lifted. Split parts resume through the owning trampoline, never
    directly: its pending/next loop completes cross-part jumps. A prototype
    must never change the current body owner.
    """
    definitions = set()
    blocks = []
    seen = set()
    for path in paths:
        current = None
        split_state = set()
        split_trampolines = {}
        file_blocks = []
        with open(path, encoding="utf8") as source:
            for line in source:
                pending = RE_PEND.match(line)
                if pending:
                    split_state.add(pending.group(1))
                definition = RE_DEFINITION.match(line)
                part = RE_PART_DEFINITION.match(line)
                if definition:
                    current = (definition.group(1), False)
                    definitions.add((definition.group(1), definition.group(2)))
                    trampoline = RE_SPLIT_TRAMPOLINE.search(line)
                    if trampoline:
                        split_trampolines[trampoline.group(1)] = definition.group(1)
                elif part and part.group(1) in split_state:
                    current = (part.group(1), True)
                if current is not None:
                    for marker in RE_RV.finditer(line):
                        va = int(marker.group(1), 16)
                        # Explicit cross-function patch targets are resumable
                        # too, even when they do not follow a CALL instruction.
                        if (va in continuations or "LIFT-PATCH REENTRY" in line) and va not in seen:
                            seen.add(va)
                            file_blocks.append((va, current))
                # Generated bodies close at column zero. Small hand-written
                # bodies may also open and close on their definition line.
                if line.startswith("}") or ((definition or part) and line.rstrip().endswith("}")):
                    current = None
        for va, (owner, is_part) in file_blocks:
            if is_part:
                # The actual definition can have been renamed by a wrapper
                # after splitting; the marker retains the split-state stem.
                if owner not in split_trampolines:
                    raise ValueError("%s: split body %s has no trampoline" % (path, owner))
                owner = split_trampolines[owner]
            blocks.append((va, owner))
    return definitions, sorted(blocks)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", required=True)
    ap.add_argument("--exe", default="tools/isaac-ng.unpacked.exe")
    ap.add_argument("--slice", action="append", default=[],
                    help="VA:LEN region of the image to embed (repeatable)")
    ap.add_argument("--section", action="append", default=[],
                    help="whole section to embed, e.g. .rdata")
    args = ap.parse_args()
    d = args.dir

    # Strong implementations of callees the lifter could not decode
    # (scripts/recomp/host/src/missing_fns.c) must also resolve through the
    # paged index: an indirect call into one of them otherwise traps
    # as "inside the image, function was not lifted".  Measured: 0x00aa9350
    # was reached as `call [0xc736e0]` from the controller-DB parser at
    # 0x00a25b36 and the boot stopped there.
    mf = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                      "..", "host", "src", "missing_fns.c")
    hand_written = set()
    if os.path.exists(mf):
        with open(mf, encoding="utf8") as fh:
            hand_written = {(name, va) for name, va in RE_DEFINITION.findall(fh.read())
                            if name == "sub_" + va}
    # Mid-function re-entry targets: every CALL continuation in the image
    # (computed by patch_reentry.py from the PE with capstone).  A return
    # address is always (call address + size), so this set is the exact
    # universe of legal longjmp / unwind resumption points.
    cont = set()
    cont_path = os.path.join(d, "call_cont.txt")
    if os.path.exists(cont_path):
        with open(cont_path) as fh:
            cont = set(int(l.strip(), 16) for l in fh if l.strip())
    definitions, blocks = scan_lifted_sources(
        sorted(glob.glob(os.path.join(d, "lifted*.c"))), cont)
    names = {(name, va) for name, va in definitions if name == "sub_" + va}
    names.update(hand_written)
    print("re-entry blocks: %d" % len(blocks))

    entries = sorted((int(h, 16), n) for n, h in names)
    lo = min((v for v, _ in entries), default=TEXT_LO)
    hi = max((v for v, _ in entries), default=TEXT_HI) + 1
    if lo < TEXT_LO or hi > TEXT_HI + 1:
        raise SystemExit("entry outside .text: %#x..%#x" % (lo, hi))

    with open(os.path.join(d, "dispatch_tbl.h"), "w") as fh:
        fh.write('#ifndef DISPATCH_TBL_H\n#define DISPATCH_TBL_H\n')
        fh.write('#include <stdint.h>\n#include "lifted_decls.h"\n')
        fh.write('typedef void (*recomp_fn)(CpuState *restrict);\n')
        fh.write('#define G_NDISPATCH %du\n' % len(entries))
        fh.write('#define G_TEXT_LO 0x%08xu\n' % TEXT_LO)
        fh.write('#define G_TEXT_HI 0x%08xu\n' % TEXT_HI)
        fh.write('extern const uint32_t g_dva[G_NDISPATCH];\n')
        fh.write('extern const recomp_fn g_dfn[G_NDISPATCH];\n')
        fh.write('#define G_NBLOCK %du\n' % len(blocks))
        if blocks:
            fh.write('extern const uint32_t g_bva[G_NBLOCK];\n')
            fh.write('extern const recomp_fn g_bfn[G_NBLOCK];\n')
        fh.write('int isaac_lifted_dispatch(uint32_t va, CpuState *restrict cpu);\n')
        fh.write('int isaac_lifted_dispatch_cached(uint32_t va, CpuState *restrict cpu);\n')
        fh.write('int isaac_dispatch_return(uint32_t va, CpuState *restrict cpu);\n')
        fh.write('void isaac_guest_call(uint32_t va, CpuState *restrict cpu);\n')
        fh.write('void isaac_guest_longjmp(CpuState *restrict cpu);\n')
        fh.write('extern uint32_t g_reentry_eip;\n')
        # Hand-written bodies added AFTER the lift (missing_fns.c) are not in
        # lifted_decls.h; declare them here so the table compiles (round 12:
        # the adjustor thunk 0x0069d1f0 was the first).
        for name, _va in sorted(hand_written):
            fh.write('void %s(CpuState *restrict s);\n' % name)
        fh.write('#endif\n')

    with open(os.path.join(d, "dispatch_tbl.c"), "w") as fh:
        fh.write('/* GENERATED by mkdispatch.py */\n')
        fh.write('#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n')
        fh.write('#ifdef __EMSCRIPTEN__\n#include <emscripten.h>\n#else\n'
                 'static double emscripten_get_now(void) { return 0.0; }\n#endif\n')
        fh.write('#include "dispatch_tbl.h"\n\n')
        # Original bodies renamed by WRAP_PATCHES are not public entries and
        # are absent from lifted_decls.h. Keep their declarations local here:
        # changing a block owner must not rebuild every TU through the header.
        entry_names = {name for _, name in entries}
        for owner in sorted({name for _, name in blocks} - entry_names):
            fh.write('extern void %s(CpuState *restrict s);\n' % owner)
        fh.write('const uint32_t g_ndispatch = G_NDISPATCH;   /* linkable count for recomp_rt.c */\n')
        fh.write('const uint32_t g_dva[G_NDISPATCH] = {\n')
        for i in range(0, len(entries), 8):
            fh.write(','.join('0x%08xu' % v for v, _ in entries[i:i + 8]) + ',\n')
        fh.write('};\nconst recomp_fn g_dfn[G_NDISPATCH] = {\n')
        for i in range(0, len(entries), 4):
            fh.write(','.join(n for _, n in entries[i:i + 4]) + ',\n')
        fh.write('};\n\n')
        if blocks:
            fh.write('const uint32_t g_bva[G_NBLOCK] = {\n')
            for i in range(0, len(blocks), 8):
                fh.write(','.join('0x%08xu' % v for v, _ in blocks[i:i + 8]) + ',\n')
            fh.write('};\nconst recomp_fn g_bfn[G_NBLOCK] = {\n')
            for i in range(0, len(blocks), 4):
                fh.write(','.join(n for _, n in blocks[i:i + 4]) + ',\n')
            fh.write('};\n\n')
        fh.write('#define DPAGE_BITS %du\n#define DPAGE_COUNT %du\n' %
                 (DPAGE_BITS, len({(v - TEXT_LO) >> DPAGE_BITS for v, _ in entries})))
        fh.write('#define BPAGE_BITS %du\n#define BPAGE_COUNT %du\n\n' %
                 (BPAGE_BITS, len({(v - TEXT_LO) >> BPAGE_BITS for v, _ in blocks})))
        fh.write('''/* Mid-function re-entry (guest setjmp/longjmp and the unwind after
 * longjmp): return addresses resume at CALL continuations, which are NOT
 * function entries.  The dispatcher sets this to the requested block VA
 * before calling a function; every lifted function's prologue consumes it
 * (see patch_reentry.py) and jumps to the matching L_ label. */
uint32_t g_reentry_eip = 0u;

/* Directory offsets select compact leaf pages. Offset zero selects an
 * all-missing leaf, so absent pages need no branch on the lookup path.
 * Directory and leaves share one allocation per index. */
static uint32_t *g_index_pages;
static uint16_t *g_index;
#if G_NBLOCK
static uint32_t *g_bindex_pages;
static uint32_t *g_bindex;
#endif

static void build_index(void) {
  size_t pages = ((size_t)(G_TEXT_HI - G_TEXT_LO) + (1u << DPAGE_BITS) - 1u) >> DPAGE_BITS;
  size_t directory_bytes = pages * sizeof(uint32_t);
  size_t leaf_bytes = ((size_t)DPAGE_COUNT + 1u) * (1u << DPAGE_BITS) * sizeof(uint16_t);
  g_index_pages = (uint32_t *)malloc(directory_bytes + leaf_bytes);
  if (!g_index_pages) {
    fprintf(stderr, "recomp: cannot allocate %zu-byte dispatch index\\n",
            directory_bytes + leaf_bytes);
    abort();
  }
  g_index = (uint16_t *)(g_index_pages + pages);
  memset(g_index_pages, 0, directory_bytes);
  memset(g_index, 0xFF, leaf_bytes);
  uint32_t next_page = 1u << DPAGE_BITS;
  for (uint32_t i = 0; i < G_NDISPATCH; ++i) {
    uint32_t off = g_dva[i] - G_TEXT_LO;
    uint32_t *page = &g_index_pages[off >> DPAGE_BITS];
    if (!*page) { *page = next_page; next_page += 1u << DPAGE_BITS; }
    g_index[*page + (off & ((1u << DPAGE_BITS) - 1u))] = (uint16_t)i;
  }
}

#if G_NBLOCK
static void build_bindex(void) {
  size_t pages = ((size_t)(G_TEXT_HI - G_TEXT_LO) + (1u << BPAGE_BITS) - 1u) >> BPAGE_BITS;
  size_t directory_bytes = pages * sizeof(uint32_t);
  size_t leaf_bytes = ((size_t)BPAGE_COUNT + 1u) * (1u << BPAGE_BITS) * sizeof(uint32_t);
  g_bindex_pages = (uint32_t *)malloc(directory_bytes + leaf_bytes);
  if (!g_bindex_pages) {
    fprintf(stderr, "recomp: cannot allocate %zu-byte block index\\n",
            directory_bytes + leaf_bytes);
    abort();
  }
  g_bindex = g_bindex_pages + pages;
  memset(g_bindex_pages, 0, directory_bytes);
  memset(g_bindex, 0xFF, leaf_bytes);
  uint32_t next_page = 1u << BPAGE_BITS;
  for (uint32_t i = 0; i < G_NBLOCK; ++i) {
    uint32_t off = g_bva[i] - G_TEXT_LO;
    uint32_t *page = &g_bindex_pages[off >> BPAGE_BITS];
    if (!*page) { *page = next_page; next_page += 1u << BPAGE_BITS; }
    g_bindex[*page + (off & ((1u << BPAGE_BITS) - 1u))] = i;
  }
}
#endif

extern uint32_t recomp_jmp_pending;
void recomp_run_pending(CpuState *restrict cpu);
static int dispatch_block(uint32_t va, CpuState *restrict cpu) {
#if G_NBLOCK
  if (!g_bindex) build_bindex();
  uint32_t off = va - G_TEXT_LO;
  if (off >= (uint32_t)(G_TEXT_HI - G_TEXT_LO)) return 0;
  uint32_t bid = g_bindex[g_bindex_pages[off >> BPAGE_BITS] + (off & ((1u << BPAGE_BITS) - 1u))];
  if (bid == 0xFFFFFFFFu) return 0;
  g_reentry_eip = va;
  g_bfn[bid](cpu);
  return 1;
#else
  (void)va;
  (void)cpu;
  return 0;
#endif
}

/* Dispatcher census (round 14h): how many times each lifted entry is
 * dispatched, plus block re-entries and misses. isaac_dispatch_report()
 * prints the hottest targets; the stub report calls it at exit. */
static uint32_t *g_dcount;
static uint32_t g_dcalls, g_dblocks, g_dmisses;
static int g_hb_every = -1;   /* ISAAC_HEARTBEAT */
static int g_watch_n = -1;    /* ISAAC_DISPATCH_WATCH */
static uint32_t g_watch_va[8], g_watch_hits[8];
/* ISAAC_DISPATCH_TIME=1 (round 14j): wall time INSIDE each dispatched entry,
 * inclusive of everything it calls (a nested dispatch is charged to both), and
 * the time spent in this function around the calls -- the dispatcher's own
 * cost, which a sampling profile cannot separate from the callees. */
static double *g_dtime;
static double g_dself, g_dtotal;
static int g_dtime_on = -1;
/* Two-way cache in front of the paged index. Hits use the callable directly
 * instead of a dependent g_dfn[id] load, but still update the exact census.
 * Off while any dispatch mode (ISAAC_HEARTBEAT, ISAAC_DISPATCH_WATCH,
 * ISAAC_DISPATCH_TIME) is on. */
#define DCACHE_BITS 14           /* 16384 sets x 24 bytes = 384 KiB on wasm32 */
typedef struct { uint32_t va[2]; recomp_fn fn[2]; uint16_t id[2]; uint8_t next; } dcache_set;
static dcache_set g_dcache[1u << DCACHE_BITS];
static int g_dfast;      /* 1 once the modes are read and none is on */
static uint32_t g_dchits, g_dcmiss;
static inline uint32_t dcache_slot(uint32_t va) { return ((va >> 2) ^ (va >> 16)) & ((1u << DCACHE_BITS) - 1u); }
static inline void dcache_fill(uint32_t va, uint16_t id, recomp_fn fn) {
  dcache_set *c = &g_dcache[dcache_slot(va)];
  unsigned w = c->next & 1u;
  c->va[w] = va; c->fn[w] = fn; c->id[w] = id; c->next = (uint8_t)(w ^ 1u);
  ++g_dcmiss;
}
int isaac_lifted_dispatch_cached(uint32_t va, CpuState *restrict cpu) {
  if (!g_dfast || !va) return 0;
  dcache_set *c = &g_dcache[dcache_slot(va)];
  unsigned w;
  if (c->va[0] == va) w = 0;
  else if (c->va[1] == va) w = 1;
  else return 0;
  ++g_dcalls; ++g_dchits;
  g_dcount[c->id[w]]++;
  c->fn[w](cpu);
  return 1;
}

/* Keep initialization, allocation retries and diagnostic bookkeeping out of
 * the ordinary dispatch body even in optimized builds. Modes are still read
 * lazily on the first function entry, never on a miss or block re-entry. */
static __attribute__((noinline,cold)) int dispatch_entry_slow(uint32_t va, uint16_t id, CpuState *restrict cpu) {
  /* ISAAC_HEARTBEAT=<n>: print every n-th dispatch with the wall clock and the
   * target. The room-entry crawl (round 15c) executes NO lifted instruction
   * for minutes -- the RECOMP_VA tick never reaches its interval -- so the
   * question is whether the guest is stopped inside one call or grinding
   * through dispatches that the tick somehow misses. This answers it. */
  if (g_hb_every < 0) {
    const char *e = getenv("ISAAC_HEARTBEAT");
    g_hb_every = (e && *e) ? atoi(e) : 0;
    if (g_hb_every > 0)
      fprintf(stderr, "[isaac][hb] heartbeat every %d dispatches\\n", g_hb_every);
  }
  /* ISAAC_DISPATCH_WATCH=<hex va>[,<hex va>...]: say the first time each of
   * those functions is dispatched, and count them. Round 16 needed to know
   * whether the game's sound-play path (0x00a9fb80) is reached at all, which
   * neither the hottest-16 census nor the heartbeat can answer. */
  if (g_watch_n < 0) {
    g_watch_n = 0;
    const char *w = getenv("ISAAC_DISPATCH_WATCH");
    while (w && *w && g_watch_n < 8) {
      g_watch_va[g_watch_n++] = (uint32_t)strtoul(w, (char **)&w, 16);
      while (*w == ',' || *w == ' ') ++w;
    }
    if (g_watch_n) fprintf(stderr, "[isaac][watch] watching %d dispatch target(s)\\n", g_watch_n);
  }
  for (int wi = 0; wi < g_watch_n; ++wi)
    if (g_watch_va[wi] == va && !g_watch_hits[wi]++)
      fprintf(stderr, "[isaac][watch] sub_%08x dispatched for the first time (after %u dispatches)\\n",
              va, g_dcalls);
  if (g_hb_every > 0 && (g_dcalls % (uint32_t)g_hb_every) == 0u)
    fprintf(stderr, "[isaac][hb] %u dispatches, %.1f s, now sub_%08x\\n",
            g_dcalls, emscripten_get_now() / 1000.0, va);
  if (!g_dcount) g_dcount = (uint32_t *)calloc(G_NDISPATCH, sizeof(uint32_t));
  if (g_dcount) g_dcount[id]++;
  if (g_dtime_on < 0) {
    const char *e = getenv("ISAAC_DISPATCH_TIME");
    g_dtime_on = (e && *e && *e != '0') ? 1 : 0;
    if (g_dtime_on) g_dtime = (double *)calloc(G_NDISPATCH, sizeof(double));
  }
  if (!g_dfast && g_hb_every == 0 && g_watch_n == 0 && g_dtime_on == 0 && g_dcount) g_dfast = 1;
  if (g_dfast) dcache_fill(va, id, g_dfn[id]);
  if (g_dtime_on && g_dtime) {
    double t0 = emscripten_get_now();
    g_dfn[id](cpu);
    double t1 = emscripten_get_now();
    g_dtime[id] += t1 - t0;
    g_dtotal += t1 - t0;
    g_dself += emscripten_get_now() - t1;   /* the bookkeeping after the call */
    return 1;
  }
  g_dfn[id](cpu);
  return 1;
}

int isaac_lifted_dispatch(uint32_t va, CpuState *restrict cpu) {
  if (!g_index) build_index();
  uint32_t off = va - G_TEXT_LO;
  ++g_dcalls;
  if (off >= (uint32_t)(G_TEXT_HI - G_TEXT_LO)) { ++g_dmisses; return 0; }
  uint16_t id = g_index[g_index_pages[off >> DPAGE_BITS] + (off & ((1u << DPAGE_BITS) - 1u))];
  if (id == 0xFFFFu) { ++g_dblocks; return dispatch_block(va, cpu); }
  if (!g_dfast) return dispatch_entry_slow(va, id, cpu);
  recomp_fn fn = g_dfn[id];
  g_dcount[id]++;
  dcache_fill(va, id, fn);
  fn(cpu);
  return 1;
}
/* Monotonic progress signal for recomp_run_pending: unlike the RECOMP_VA
 * trace index this counts in every profile, including --fast, where the
 * trace is compiled out. */
uint32_t isaac_dispatch_calls(void) { return g_dcalls; }
void isaac_dispatch_report(void) {
  fprintf(stderr, "[isaac][dispatch] %u dispatches (%u block re-entries, %u misses; cache %u hits / %u fills); hottest entries:\\n",
          g_dcalls, g_dblocks, g_dmisses, g_dchits, g_dcmiss);
  if (!g_dcount) return;
  for (int round = 0; round < 16; ++round) {
    uint32_t best = 0;
    for (uint32_t i = 1; i < G_NDISPATCH; ++i) if (g_dcount[i] > g_dcount[best]) best = i;
    if (!g_dcount[best]) break;
    fprintf(stderr, "[isaac][dispatch]   %10u x sub_%08x\\n", g_dcount[best], g_dva[best]);
    g_dcount[best] = 0;
  }
  for (int wi = 0; wi < g_watch_n; ++wi)
    fprintf(stderr, "[isaac][watch] sub_%08x dispatched %u time(s)\\n", g_watch_va[wi], g_watch_hits[wi]);
  if (!g_dtime) return;
  fprintf(stderr, "[isaac][dispatch] time inside dispatched entries %.1f ms (inclusive; nested dispatches "
                  "count twice), dispatcher bookkeeping %.1f ms; slowest entries:\\n", g_dtotal, g_dself);
  for (int round = 0; round < 24; ++round) {
    uint32_t best = 0;
    for (uint32_t i = 1; i < G_NDISPATCH; ++i) if (g_dtime[i] > g_dtime[best]) best = i;
    if (g_dtime[best] <= 0.0) break;
    fprintf(stderr, "[isaac][dispatch]   %10.1f ms  sub_%08x\\n", g_dtime[best], g_dva[best]);
    g_dtime[best] = 0.0;
  }
}

/* Return addresses resume mid-function, so the longjmp replay loop
 * prefers the block table; a VA that is simultaneously a function entry
 * and a call continuation must resume as a continuation. */
int isaac_dispatch_return(uint32_t va, CpuState *restrict cpu) {
  if (dispatch_block(va, cpu)) return 1;
  return isaac_lifted_dispatch(va, cpu);
}

#include <setjmp.h>
static jmp_buf g_guest_jmp;

/* Called by imp_vcruntime140__longjmp after restoring the guest registers
 * into cpu: abandon the host call chain and resume in isaac_guest_call,
 * which replays the guest unwind frame by frame. */
void isaac_guest_longjmp(CpuState *restrict cpu) {
  (void)cpu;
  longjmp(g_guest_jmp, 1);
}

/* Round 14d: the tail-jump trampoline. The dispatch path above only calls;
 * a parked jump is run here, in the host entry's frame, so a chain of guest
 * jumps of any length costs a bounded number of native frames. Lifted call
 * sites carry the same check after every call. */
static void isaac_guest_call_inner(uint32_t va, CpuState *restrict cpu) {
  if (setjmp(g_guest_jmp) == 0) {
    if (isaac_lifted_dispatch(va, cpu)) { recomp_run_pending(cpu); return; }
    fprintf(stderr, "recomp: guest call to 0x%08x has no lifted function "
                    "(%u entries cover the lifted set)\\n", va, G_NDISPATCH);
    abort();
  }
  /* Resumed after a guest longjmp: cpu->EIP/ESP already restored.  Replay
   * the abandoned guest frames until the guest stack unwinds out of the
   * lifted image (drivers push a fake return address of 0). */
  for (unsigned guard = 0; guard < (1u << 20); ++guard) {
    if (recomp_jmp_pending) recomp_run_pending(cpu);
    if (!isaac_dispatch_return(cpu->EIP, cpu)) {
      if (cpu->EIP >= G_TEXT_LO && cpu->EIP < G_TEXT_HI)
        fprintf(stderr, "recomp: longjmp replay stopped inside .text at "
                        "0x%08x (no lifted block)\\n", cpu->EIP);
      return;
    }
  }
  fprintf(stderr, "recomp: longjmp replay did not unwind in 2^20 frames "
                  "(EIP 0x%08x)\\n", cpu->EIP);
  abort();
}

/* Nesting (round 24): a frame pump or a thread slice calls the guest from
 * inside main's own guest call, and the one static jmp_buf was overwritten by
 * the inner setjmp -- a guest longjmp on the outer level would then have
 * landed in a dead frame. Save it around every call. A slice that yields
 * skips this restore, so the slice runner saves and restores it itself
 * through the two accessors. */
void isaac_guest_jmp_save(void *dst) { memcpy(dst, g_guest_jmp, sizeof(jmp_buf)); }
void isaac_guest_jmp_restore(const void *src) { memcpy(g_guest_jmp, src, sizeof(jmp_buf)); }
unsigned isaac_guest_jmp_size(void) { return (unsigned)sizeof(jmp_buf); }
void isaac_guest_call(uint32_t va, CpuState *restrict cpu) {
  jmp_buf saved;
  memcpy(saved, g_guest_jmp, sizeof(jmp_buf));
  isaac_guest_call_inner(va, cpu);
  memcpy(g_guest_jmp, saved, sizeof(jmp_buf));
}
''')

    n_slices = 0
    if args.slice or args.section:
        pe = PE32(args.exe)
        slices = []
        for spec in args.slice:
            va, ln = spec.split(":")
            slices.append((int(va, 0), pe.read(int(va, 0), int(ln, 0))))
        for sname in args.section:
            for s in pe.sections:
                if s.name == sname:
                    n = min(s.raw_size, s.vsize)
                    slices.append((s.vaddr, pe.read(s.vaddr, n)))
        n_slices = len(slices)
        with open(os.path.join(d, "image_slices.h"), "w") as fh:
            fh.write('#ifndef IMAGE_SLICES_H\n#define IMAGE_SLICES_H\n')
            fh.write('#include <stdint.h>\n')
            fh.write('typedef struct { uint32_t va; uint32_t len; '
                     'const unsigned char *data; } ImageSlice;\n')
            for i, (va, data) in enumerate(slices):
                fh.write('static const unsigned char s%d_[%d] = {' % (i, len(data)))
                fh.write(','.join(str(b) for b in data))
                fh.write('};\n')
            fh.write('#define G_NSLICES %du\n' % len(slices))
            fh.write('static const ImageSlice g_slices[%d] = {\n'
                     % max(1, len(slices)))
            for i, (va, data) in enumerate(slices):
                fh.write('  {0x%08xu, %du, s%d_},\n' % (va, len(data), i))
            if not slices:
                fh.write('  {0,0,0},\n')
            fh.write('};\n#endif\n')

    print("dispatch entries: %d  (%#x..%#x)  image slices: %d"
          % (len(entries), lo, hi, n_slices))


if __name__ == "__main__":
    main()
