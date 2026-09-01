/* host_shims_heap.c -- the guest allocator, and the heap high-water meter.
 *
 * WHY THIS CANNOT BE `PROVIDED` BY musl.
 *
 * The obvious move is to forward the guest's malloc/free onto the host's, and
 * before the address-space split that is what the shim table said. It is now
 * wrong, and wrong in the most dangerous direction: emscripten's malloc returns
 * pointers ABOVE the guard (measured: 0x1010d3e8), because host static data and
 * the host heap live at 0x10000000+. Handing one of those to the guest invites
 * it to write, with full rights, directly into the runtime's own memory --
 * the dispatch table, CpuState, everything the guard exists to protect.
 *
 * So the guest gets its own arena inside the guest range, and the host's
 * allocator is never exposed to it. That is a consequence of the layout, not a
 * preference.
 *
 * THE METER.
 *
 * The guard currently reserves 192 MiB of guest heap. The static analysis in
 * heap_bound.py brackets the real requirement between a measured floor of
 * 64 MiB (the largest single texture decode, which must be contiguous) and a
 * measured ceiling of 262 MiB (every PNG resident as a client RGBA copy), and
 * says honestly that where the peak sits in that band is not decidable from the
 * image. This file closes that gap: it records the high-water mark, so the
 * first integration run that reaches gameplay produces the number for free and
 * the guard can be moved once, on evidence.
 *
 * Allocator shape: first-fit with boundary tags and immediate coalescing.
 * Chosen because it is auditable in one screen, not because it is fast. If it
 * ever shows up in a profile, replace it -- but replace it knowing the real
 * peak, which is the entire point of the meter.
 */

#include "isaac_host.h"
#include "shim_decls.h"

#include <stdio.h>
#include <string.h>

#define HDR_BYTES   8u          /* {size, flags} */
#define ALIGN       8u
#define FLAG_USED   1u

/* Header layout at block VA b:
 *   [b+0] total block size including header, 8-byte aligned
 *   [b+4] flags (bit 0 = in use)
 * Payload starts at b + HDR_BYTES. */

static uint32_t g_arena_lo, g_arena_hi;
static int g_inited;

static struct {
    uint64_t live, peak, total_alloced;
    uint32_t largest_single, allocs, frees, reallocs, failures;
    uint32_t peak_at_alloc;      /* which allocation number hit the peak */
} g_stat;

static void heap_init(void) {
    if (g_inited) return;
    g_arena_lo = ISAAC_HEAP_VA;
    g_arena_hi = ISAAC_HEAP_VA + ISAAC_HEAP_SIZE;
    /* One free block spanning the arena. */
    isaac_w32(g_arena_lo, ISAAC_HEAP_SIZE);
    isaac_w32(g_arena_lo + 4, 0);
    g_inited = 1;
    isaac_log("[isaac][heap] guest arena 0x%08x..0x%08x (%u MiB), separate from "
              "the host allocator by design",
              g_arena_lo, g_arena_hi, ISAAC_HEAP_SIZE >> 20);
}

static uint32_t blk_size(uint32_t b) { return isaac_r32(b) & ~(ALIGN - 1u); }
static int      blk_used(uint32_t b) { return isaac_r32(b + 4) & FLAG_USED; }
static void     blk_set(uint32_t b, uint32_t size, int used) {
    isaac_w32(b, size);
    isaac_w32(b + 4, used ? FLAG_USED : 0u);
}

static uint32_t guest_malloc(uint32_t n) {
    heap_init();
    if (!n) n = 1;
    uint64_t need64 = (uint64_t)n + HDR_BYTES;
    need64 = (need64 + (ALIGN - 1)) & ~(uint64_t)(ALIGN - 1);
    if (need64 > ISAAC_HEAP_SIZE) {
        ++g_stat.failures;
        isaac_log("[isaac][heap] malloc(%u) exceeds the whole arena (%u MiB)",
                  n, ISAAC_HEAP_SIZE >> 20);
        return 0;
    }
    uint32_t need = (uint32_t)need64;

    for (uint32_t b = g_arena_lo; b < g_arena_hi; ) {
        uint32_t sz = blk_size(b);
        if (!sz || sz > (g_arena_hi - b)) break;      /* corrupt: stop */
        if (!blk_used(b) && sz >= need) {
            if (sz - need >= HDR_BYTES + ALIGN) {     /* split */
                blk_set(b + need, sz - need, 0);
                blk_set(b, need, 1);
            } else {
                blk_set(b, sz, 1);
                need = sz;
            }
            g_stat.live += need;
            g_stat.total_alloced += need;
            ++g_stat.allocs;
            if (n > g_stat.largest_single) g_stat.largest_single = n;
            if (g_stat.live > g_stat.peak) {
                g_stat.peak = g_stat.live;
                g_stat.peak_at_alloc = g_stat.allocs;
            }
            return b + HDR_BYTES;
        }
        b += sz;
    }
    ++g_stat.failures;
    isaac_log("[isaac][heap] OUT OF MEMORY: malloc(%u) failed with %llu bytes "
              "live and a %u MiB arena. Peak was %llu. Raise ISAAC_HEAP_SIZE "
              "or move the guard.",
              n, (unsigned long long)g_stat.live, ISAAC_HEAP_SIZE >> 20,
              (unsigned long long)g_stat.peak);
    return 0;
}

static void guest_free(uint32_t p) {
    if (!p) return;
    if (p < g_arena_lo + HDR_BYTES || p >= g_arena_hi) {
        isaac_log("[isaac][heap] free(0x%08x): pointer is outside the guest "
                  "arena 0x%08x..0x%08x -- ignoring rather than corrupting.",
                  p, g_arena_lo, g_arena_hi);
        return;
    }
    uint32_t b = p - HDR_BYTES;
    if (!blk_used(b)) {
        isaac_log("[isaac][heap] double free at 0x%08x", p);
        return;
    }
    uint32_t sz = blk_size(b);
    g_stat.live -= sz;
    ++g_stat.frees;
    blk_set(b, sz, 0);

    /* Coalesce forward. Backward coalescing needs a footer; a first-fit walk
     * plus forward merging keeps fragmentation bounded enough for a meter. */
    uint32_t nxt = b + sz;
    while (nxt < g_arena_hi && !blk_used(nxt)) {
        uint32_t ns = blk_size(nxt);
        if (!ns) break;
        sz += ns;
        blk_set(b, sz, 0);
        nxt += ns;
    }
}

static uint32_t guest_size(uint32_t p) {
    if (!p || p < g_arena_lo + HDR_BYTES || p >= g_arena_hi) return 0;
    uint32_t s = blk_size(p - HDR_BYTES);
    return s > HDR_BYTES ? s - HDR_BYTES : 0;
}

/* Exposed so other shims that must allocate (e.g. _strdup) get GUEST memory.
 * A host-allocated pointer handed to the guest would be above the guard. */
uint32_t isaac_guest_alloc(uint32_t n) { return guest_malloc(n); }
void     isaac_guest_free(uint32_t p)  { guest_free(p); }
uint32_t isaac_guest_realloc(uint32_t p, uint32_t n) {
    if (!p) return guest_malloc(n);
    if (!n) { guest_free(p); return 0; }
    uint32_t old = guest_size(p);
    uint32_t q = guest_malloc(n);
    if (q) { memcpy(isaac_g(q), isaac_g(p), old < n ? old : n); guest_free(p); }
    return q;
}

/* ------------------------------------------------------------- CRT heap -- */
/* cdecl: the caller cleans, so none of these adjust ESP beyond the return. */

void imp_api_ms_win_crt_heap__malloc(CpuState *restrict cpu) {
    cpu->EAX = guest_malloc(isaac_arg(cpu, 0));
}

void imp_api_ms_win_crt_heap__free(CpuState *restrict cpu) {
    guest_free(isaac_arg(cpu, 0));
    cpu->EAX = 0;
}

void imp_api_ms_win_crt_heap__calloc(CpuState *restrict cpu) {
    uint64_t n = (uint64_t)isaac_arg(cpu, 0) * isaac_arg(cpu, 1);
    if (n > 0xFFFFFFFFull) { cpu->EAX = 0; ++g_stat.failures; return; }
    uint32_t p = guest_malloc((uint32_t)n);
    if (p) memset(isaac_g(p), 0, (size_t)n);
    cpu->EAX = p;
}

void imp_api_ms_win_crt_heap__realloc(CpuState *restrict cpu) {
    uint32_t p = isaac_arg(cpu, 0), n = isaac_arg(cpu, 1);
    ++g_stat.reallocs;
    if (!p) { cpu->EAX = guest_malloc(n); return; }
    if (!n) { guest_free(p); cpu->EAX = 0; return; }
    uint32_t old = guest_size(p);
    uint32_t q = guest_malloc(n);
    if (q) {
        memcpy(isaac_g(q), isaac_g(p), old < n ? old : n);
        guest_free(p);
    }
    cpu->EAX = q;
}

/* -------------------------------------------------------- Virtual* ------- */
/* stdcall; the dispatcher applies the purge from the shim table. The engine
 * uses these 8 times total, so a page-granular wrapper over the same arena is
 * enough -- but MEM_RELEASE semantics differ from free(), so it is explicit. */

#define MEM_COMMIT   0x1000u
#define MEM_RESERVE  0x2000u
#define MEM_RELEASE  0x8000u

void imp_kernel32__VirtualAlloc(CpuState *restrict cpu) {
    uint32_t addr = isaac_arg(cpu, 0), size = isaac_arg(cpu, 1);
    uint32_t type = isaac_arg(cpu, 2);
    if (addr && !isaac_is_guest_va(addr)) {
        isaac_log("[isaac][heap] VirtualAlloc at 0x%08x is outside the guest "
                  "range; refusing.", addr);
        cpu->EAX = 0;
        return;
    }
    if (addr) {
        /* MEM_COMMIT on an already-reserved range: the arena is always
         * committed, so this is a no-op that must still succeed. */
        cpu->EAX = (type & MEM_COMMIT) ? addr : 0;
        return;
    }
    uint32_t p = guest_malloc(size);
    if (p) memset(isaac_g(p), 0, size);   /* VirtualAlloc zeroes; malloc does not */
    cpu->EAX = p;
}

void imp_kernel32__VirtualFree(CpuState *restrict cpu) {
    uint32_t addr = isaac_arg(cpu, 0), type = isaac_arg(cpu, 2);
    if (type & MEM_RELEASE) guest_free(addr);
    cpu->EAX = 1;
}

void imp_kernel32__VirtualQuery(CpuState *restrict cpu) {
    uint32_t addr = isaac_arg(cpu, 0), buf = isaac_arg(cpu, 1);
    uint32_t len = isaac_arg(cpu, 2);
    if (!buf || len < 28) { cpu->EAX = 0; return; }
    /* MEMORY_BASIC_INFORMATION, 28 bytes on Win32. Report the whole arena as
     * one committed, readable/writable region. */
    isaac_w32(buf + 0, g_arena_lo);          /* BaseAddress       */
    isaac_w32(buf + 4, g_arena_lo);          /* AllocationBase    */
    isaac_w32(buf + 8, 0x04);                /* AllocationProtect = PAGE_READWRITE */
    isaac_w32(buf + 12, ISAAC_HEAP_SIZE);    /* RegionSize        */
    isaac_w32(buf + 16, MEM_COMMIT);         /* State             */
    isaac_w32(buf + 20, 0x04);               /* Protect           */
    isaac_w32(buf + 24, 0x20000);            /* Type = MEM_PRIVATE */
    (void)addr;
    cpu->EAX = 28;
}

/* ------------------------------------------------------------ the meter -- */

void isaac_heap_report(void) {
    isaac_log("[isaac][heap] ---- guest heap high-water report ----");
    isaac_log("[isaac][heap]   arena          : %u MiB at 0x%08x",
              ISAAC_HEAP_SIZE >> 20, ISAAC_HEAP_VA);
    isaac_log("[isaac][heap]   PEAK live      : %llu bytes (%.1f MiB) at alloc #%u",
              (unsigned long long)g_stat.peak, g_stat.peak / 1048576.0,
              g_stat.peak_at_alloc);
    isaac_log("[isaac][heap]   live now       : %llu bytes",
              (unsigned long long)g_stat.live);
    isaac_log("[isaac][heap]   largest single : %u bytes (%.1f MiB)",
              g_stat.largest_single, g_stat.largest_single / 1048576.0);
    isaac_log("[isaac][heap]   allocs/frees   : %u / %u  (reallocs %u, failures %u)",
              g_stat.allocs, g_stat.frees, g_stat.reallocs, g_stat.failures);
    isaac_log("[isaac][heap]   total churn    : %llu bytes",
              (unsigned long long)g_stat.total_alloced);
    isaac_log("[isaac][heap] Move ISAAC_GUEST_LIMIT_VA / ISAAC_HEAP_SIZE to "
              "PEAK plus deliberate headroom, then GLOBAL_BASE and "
              "INITIAL_MEMORY follow from it.");
}

uint64_t isaac_heap_peak(void) { return g_stat.peak; }
uint32_t isaac_heap_arena_size(void) { return ISAAC_HEAP_SIZE; }
