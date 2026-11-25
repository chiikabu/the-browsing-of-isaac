/* host_snd_lazy.c -- a sound sample's PCM is read when it is first played (round 98).
 *
 * The game preloads its whole sound catalogue at boot: KAGE::Sound::
 * SampleSourceWav's loader (0x00a7b6a0) opens each WAV, parses its header
 * (0x00a9f630, pass 1: header only), allocates the data chunk's size from the
 * game heap (0x00a230b0, malloc underneath) and reads the PCM into it (pass 2).
 * The bytes then sit in the guest heap -- most of its 236 MiB live after
 * boot -- and are used in one place only: alBufferData (0x00a9fcb4 in
 * 0x00a9fb80) on every play, until 0x00a9f980 frees them with the last
 * reference (evidence: docs/recomp-architecture.md 21.129).
 *
 * So pass 2 reads the header only (lift patch 0x00a7b7f0) and the buffer is
 * recorded here, unwritten: wasm pages nobody writes stay out of a phone's
 * RAM. The first alBufferData whose data overlaps a recorded buffer fills it
 * by calling the game's own loader again in fill mode: its allocation returns
 * the recorded buffer (patch 0x00a7b7dc), pass 2 reads the PCM into it, and
 * it returns right after (patch 0x00a7b806). The game's archive lookup, loose
 * files and stream decode are all reused, unchanged.
 *
 * A buffer freed while still unwritten is forgotten (guest_free), since the
 * heap hands its address out again. Several sound objects may share one
 * buffer; the record is the buffer, so it is filled once.
 * ISAAC_SND_LAZY=0 reads every sample at load, as the game does.
 *
 * Round 127: an unwritten buffer is still address space in the 384 MiB arena --
 * 249 MB of it after a long run, two thirds of everything live. When the arena
 * is full the heap takes a segment from the host and the wasm memory grows; a
 * device short of memory refuses that, and the next allocation the game does not
 * check stops it (late runs, Mother, Delirium: GitHub issue 27). So a recorded
 * buffer is now detached: its heap block is cut down to a 16-byte stub at the
 * same address (isaac_guest_shrink) and the rest is free for anything else. At
 * its first upload the PCM is read into a block of its own (`real`), and every
 * upload whose data starts in the stub is given that block's bytes instead
 * (isaac_snd_lazy_source, from the alBufferData shim). The game frees the stub,
 * and `real` goes with it. Nothing but alBufferData reads the bytes (round 98's
 * census of the pointer field), and an upload of another buffer is never taken
 * for a detached one: only the stub's 16 bytes are its. ISAAC_SND_DETACH=0
 * keeps the whole buffer, as round 98 did. */
#include "isaac_host.h"

#include <stdint.h>
#include <stdlib.h>
#include <string.h>

#define SND_LOADER_VA 0x00a7b6a0u          /* SampleSourceWav's loader, thiscall, ret 4 */

/* real: a detached buffer's PCM, once read (0 before its first upload); detached: the
 * record's own bytes are the stub's SND_STUB, not size */
typedef struct { uint32_t ptr, size; char *path; uint32_t real; uint8_t detached; } snd_pending;
#define SND_STUB 16u

static snd_pending *g_snd;                 /* sorted by ptr; the records' own bytes never overlap */
static uint32_t g_snd_n, g_snd_cap;
static int g_snd_mode = -1;
static int g_snd_detach = -1;
static uint32_t g_snd_detached, g_snd_attached_late, g_snd_not_detached;
static uint64_t g_snd_bytes_given_back;
static uint32_t g_release[64], g_release_n; /* filled buffers whose stubs were freed, freed after the free */
static uint32_t rec_len(const snd_pending *r) { return r->detached ? SND_STUB : r->size; }
static uint32_t g_snd_fill_target;         /* nonzero while a fill runs: the buffer it fills */
static uint32_t g_snd_deferred, g_snd_filled, g_snd_forgotten, g_snd_failed, g_snd_refused;
static uint64_t g_snd_bytes_deferred, g_snd_bytes_filled;

int isaac_snd_lazy_enabled(void) {
    if (g_snd_mode < 0) {
        const char *e = getenv("ISAAC_SND_LAZY");
        g_snd_mode = (e && *e == '0') ? 0 : 1;
    }
    return g_snd_mode;
}
/* the selftest switches it */
void isaac_snd_lazy_set_mode(int on) { g_snd_mode = on ? 1 : 0; }
static int snd_detach_on(void) {
    if (g_snd_detach < 0) {
        const char *e = getenv("ISAAC_SND_DETACH");
        g_snd_detach = (e && *e == '0') ? 0 : 1;
    }
    return g_snd_detach;
}
void isaac_snd_lazy_set_detach(int on) { g_snd_detach = on ? 1 : 0; }
uint32_t isaac_snd_lazy_detached(void) { return g_snd_detached; }

/* the first record whose ptr is >= va */
static uint32_t snd_lower(uint32_t va) {
    uint32_t lo = 0, hi = g_snd_n;
    while (lo < hi) {
        uint32_t mid = lo + (hi - lo) / 2u;
        if (g_snd[mid].ptr < va) lo = mid + 1u; else hi = mid;
    }
    return lo;
}
static void snd_remove(uint32_t i) {
    free(g_snd[i].path);
    memmove(g_snd + i, g_snd + i + 1, (size_t)(g_snd_n - i - 1u) * sizeof *g_snd);
    --g_snd_n;
}

uint32_t isaac_snd_lazy_pending(void) { return g_snd_n; }
/* 1 if a recorded buffer starts at ptr (its size into *size) */
int isaac_snd_lazy_find(uint32_t ptr, uint32_t *size) {
    uint32_t i = snd_lower(ptr);
    if (i < g_snd_n && g_snd[i].ptr == ptr) { if (size) *size = g_snd[i].size; return 1; }
    return 0;
}

/* Lift patches 0x00a7b7dc / 0x00a7b806: the buffer a fill reads into (0: no fill). */
uint32_t isaac_snd_fill_target(void) { return g_snd_fill_target; }

/* Record an unwritten buffer. 1 if recorded. */
int isaac_snd_lazy_record(uint32_t ptr, uint32_t size, const char *path) {
    if (!ptr || !size || !path || !*path) { ++g_snd_refused; return 0; }
    uint32_t i = snd_lower(ptr);
    if ((i < g_snd_n && g_snd[i].ptr < ptr + size) || (i > 0 && g_snd[i - 1u].ptr + rec_len(&g_snd[i - 1u]) > ptr)) {
        ++g_snd_refused;                   /* overlaps a recorded buffer: a heap bookkeeping slip, not a sample */
        return 0;
    }
    if (g_snd_n == g_snd_cap) {
        uint32_t cap = g_snd_cap ? g_snd_cap * 2u : 256u;
        snd_pending *grown = (snd_pending *)realloc(g_snd, (size_t)cap * sizeof *grown);
        if (!grown) { ++g_snd_refused; return 0; }
        g_snd = grown; g_snd_cap = cap;
    }
    char *copy = strdup(path);
    if (!copy) { ++g_snd_refused; return 0; }
    memmove(g_snd + i + 1, g_snd + i, (size_t)(g_snd_n - i) * sizeof *g_snd);
    g_snd[i].ptr = ptr; g_snd[i].size = size; g_snd[i].path = copy; g_snd[i].real = 0u; g_snd[i].detached = 0u;
    ++g_snd_n;
    ++g_snd_deferred; g_snd_bytes_deferred += size;
    if (g_snd_deferred == 1u)
        isaac_log("[isaac][snd] a sound's samples are read when it is first played (ISAAC_SND_LAZY=0 reads them at load)");
    return 1;
}

/* Lift patch 0x00a7b7f0, pass 2's header-only flag: pass 1 has sized the data
 * chunk (`size`), the buffer is allocated at [this + 0x50], the path is the
 * loader's argument. 1 (header only) when the buffer is recorded; 0 (read the
 * PCM now, as the game does) when lazy is off, in a fill, or not recorded. */
/* ISAAC_SND_VERIFY=1: every sample's buffer is remembered, recorded or not, and
 * the first alBufferData after a heap report (window.isaacHeapReport) fills
 * every recorded buffer, then logs each sample's size, hash and path -- two
 * runs, lazy and not, compared sample by sample. */
typedef struct { uint32_t ptr, size; char *path; } snd_seen;
static snd_seen *g_seen;
static uint32_t g_seen_n, g_seen_cap;
static int g_verify = -1, g_verify_armed;
static int snd_verify_on(void) {
    if (g_verify < 0) { const char *e = getenv("ISAAC_SND_VERIFY"); g_verify = (e && *e == '1') ? 1 : 0; }
    return g_verify;
}
void isaac_snd_verify_arm(void) { if (snd_verify_on()) g_verify_armed = 1; }
/* the selftest switches it */
void isaac_snd_verify_set_mode(int on) { g_verify = on ? 1 : 0; }
static void snd_seen_add(uint32_t ptr, uint32_t size, const char *path) {
    if (g_seen_n == g_seen_cap) {
        uint32_t cap = g_seen_cap ? g_seen_cap * 2u : 256u;
        snd_seen *grown = (snd_seen *)realloc(g_seen, (size_t)cap * sizeof *grown);
        if (!grown) return;
        g_seen = grown; g_seen_cap = cap;
    }
    g_seen[g_seen_n].ptr = ptr; g_seen[g_seen_n].size = size; g_seen[g_seen_n].path = strdup(path);
    if (g_seen[g_seen_n].path) ++g_seen_n;
}

uint32_t isaac_snd_lazy_begin(uint32_t this_va, uint32_t path_va, uint32_t size) {
    if (g_snd_fill_target) return 0u;                     /* a fill reads the PCM */
    if (!isaac_snd_lazy_enabled() && !snd_verify_on()) return 0u;
    if (!isaac_is_guest_va(this_va) || !isaac_is_guest_va(this_va + 0x53u) || !isaac_is_guest_va(path_va)) return 0u;
    uint32_t ptr = isaac_r32(this_va + 0x50u);
    if (!ptr || !size || !isaac_is_guest_va(ptr) || !isaac_is_guest_va(ptr + size - 1u)) return 0u;
    char path[1024];
    uint32_t k = 0;
    for (; k + 1u < sizeof path && isaac_is_guest_va(path_va + k); ++k) {
        char c = (char)*(const uint8_t *)isaac_g(path_va + k);
        path[k] = c;
        if (!c) break;
    }
    if (k + 1u >= sizeof path || !isaac_is_guest_va(path_va + k)) { ++g_snd_refused; return 0u; }  /* no terminator in reach */
    path[k] = 0;
    if (snd_verify_on()) snd_seen_add(ptr, size, path);
    if (!isaac_snd_lazy_enabled()) return 0u;
    if (!isaac_snd_lazy_record(ptr, size, path)) return 0u;
    /* round 127: the buffer's space goes back to the heap until it is played (not
     * under ISAAC_SND_VERIFY, which hashes every buffer where the game put it) */
    if (snd_detach_on() && !snd_verify_on() && size > SND_STUB) {
        const uint32_t i = snd_lower(ptr);                /* the record first: never a shrunk buffer without one */
        if (i < g_snd_n && g_snd[i].ptr == ptr && !g_snd[i].detached) {
            if (isaac_guest_shrink(ptr, SND_STUB)) {
                g_snd[i].detached = 1u;
                ++g_snd_detached;
                g_snd_bytes_given_back += size - SND_STUB;
            } else if (++g_snd_not_detached <= 4u) {
                isaac_log("[isaac][snd] not detached: buffer 0x%08x (%u bytes) is in no block of the heap the "
                          "allocator can cut; the words before it: %08x %08x %08x %08x %08x %08x", ptr, size,
                          isaac_r32(ptr - 24u), isaac_r32(ptr - 20u), isaac_r32(ptr - 16u), isaac_r32(ptr - 12u),
                          isaac_r32(ptr - 8u), isaac_r32(ptr - 4u));
            }
        }
    }
    return 1u;
}

/* guest_free: the block [p, p + n) is free again; a buffer recorded in it was never written */
void isaac_snd_lazy_freed(uint32_t p, uint32_t n) {
    if (!n) return;
    if (g_snd_n) {
        uint32_t i = snd_lower(p);
        while (i < g_snd_n && g_snd[i].ptr < p + n) {
            /* a detached one's PCM block goes with it, once this free is done */
            if (g_snd[i].real) {
                if (g_release_n < sizeof g_release / sizeof g_release[0]) g_release[g_release_n++] = g_snd[i].real;
                else isaac_guest_free(g_snd[i].real);
            } else ++g_snd_forgotten;
            snd_remove(i);
        }
    }
    for (uint32_t i = 0; i < g_seen_n; ) {               /* ISAAC_SND_VERIFY's list, in load order */
        if (g_seen[i].ptr >= p && g_seen[i].ptr < p + n) {
            free(g_seen[i].path);
            g_seen[i] = g_seen[--g_seen_n];
        } else ++i;
    }
}

/* the guest call that fills one record (the selftest replaces it) */
static int snd_fill_guest(CpuState *cpu, uint32_t ptr, uint32_t size, const char *path);
static isaac_snd_filler g_snd_filler = snd_fill_guest;
void isaac_snd_lazy_set_filler(isaac_snd_filler f) { g_snd_filler = f ? f : snd_fill_guest; }

/* The game's loader again, on a scratch object, in fill mode. The scratch
 * object and the path sit between the caller's frame and the call's stack,
 * which grows down from below them. 1 if the buffer got the file's PCM. */
static int snd_fill_guest(CpuState *cpu, uint32_t ptr, uint32_t size, const char *path) {
    if (!cpu) return 0;
    uint32_t base = (cpu->ESP - 0x4000u) & ~0xFu, self = base + 0x100u, path_va = base + 0x200u;
    size_t len = strlen(path);
    if (len > 0x1000u) return 0;
    memset(isaac_g(self), 0, 0x80);
    memcpy(isaac_g(path_va), path, len + 1u);
    CpuState sub = *cpu;
    sub.ECX = self;
    sub.ESP = base;
    sub.ESP -= 4u; isaac_w32(sub.ESP, path_va);     /* the path */
    sub.ESP -= 4u; isaac_w32(sub.ESP, 0u);          /* return address */
    isaac_guest_call(SND_LOADER_VA, &sub);
    return isaac_r32(self + 0x50u) == ptr && isaac_r32(self + 0x4cu) == size;
}

/* The alBufferData shim, before the bytes are used: every recorded buffer
 * overlapping [va, va + n) is filled. A fill that fails leaves silence. */
static void snd_fill_one(CpuState *cpu, uint32_t i);
static void snd_verify_all(CpuState *cpu) {
    g_verify_armed = 0;
    uint32_t filled = g_snd_filled;
    while (g_snd_n) snd_fill_one(cpu, 0);
    isaac_log("[isaac][snd] verify: %u recorded buffers filled now; %u samples follow", g_snd_filled - filled, g_seen_n);
    for (uint32_t i = 0; i < g_seen_n; ++i) {
        uint32_t h = 2166136261u;
        const uint8_t *p = (const uint8_t *)isaac_g(g_seen[i].ptr);
        for (uint32_t k = 0; k < g_seen[i].size; ++k) h = (h ^ p[k]) * 16777619u;
        isaac_log("[isaac][snd] verify %u %08x %s", g_seen[i].size, h, g_seen[i].path);
    }
}

/* guest_free, when it is done: the PCM blocks of the detached buffers it freed */
void isaac_snd_lazy_release(void) {
    while (g_release_n) isaac_guest_free(g_release[--g_release_n]);
}

/* fill record i (removed first, so a failure is not tried again) */
static void snd_fill_one(CpuState *cpu, uint32_t i) {
    if (g_snd[i].detached) return;                        /* read where it is played (isaac_snd_lazy_source) */
    snd_pending r = g_snd[i];
    g_snd[i].path = NULL;
    snd_remove(i);
    g_snd_fill_target = r.ptr;
    int ok = g_snd_filler(cpu, r.ptr, r.size, r.path);
    g_snd_fill_target = 0;
    if (ok) { ++g_snd_filled; g_snd_bytes_filled += r.size; }
    else {
        ++g_snd_failed;
        memset(isaac_g(r.ptr), 0, r.size);
        isaac_log("[isaac][snd] %s: its samples could not be read when first played (%u bytes of silence)", r.path, r.size);
    }
    free(r.path);
}

void isaac_snd_lazy_fill(CpuState *cpu, uint32_t va, uint32_t n) {
    if (g_verify_armed && !g_snd_fill_target) snd_verify_all(cpu);
    if (!g_snd_n || g_snd_fill_target || !n) return;
    uint32_t i = snd_lower(va);
    if (i > 0 && g_snd[i - 1u].ptr + rec_len(&g_snd[i - 1u]) > va) --i;
    while (i < g_snd_n && g_snd[i].ptr < va + n) {
        if (g_snd[i].detached) { ++i; continue; }         /* its bytes are elsewhere: isaac_snd_lazy_source */
        snd_fill_one(cpu, i);
        i = snd_lower(va);
        if (i > 0 && g_snd[i - 1u].ptr + rec_len(&g_snd[i - 1u]) > va) --i;
    }
}

/* A detached buffer's first upload: its PCM into a block of its own. The record
 * is looked up again afterwards (the loader is guest code, and a free in it may
 * move the table). The block, or 0 when there was no room (the upload is then
 * silent, and the next one tries again). */
static uint32_t snd_fill_detached(CpuState *cpu, uint32_t ptr) {
    static uint32_t no_room_said;
    uint32_t i = snd_lower(ptr);
    if (i >= g_snd_n || g_snd[i].ptr != ptr) return 0u;
    const uint32_t size = g_snd[i].size;
    char *path = strdup(g_snd[i].path);
    if (!path) return 0u;
    uint32_t real = isaac_guest_alloc(size);
    if (!real) {
        if (no_room_said++ < 8u) isaac_log("[isaac][snd] %s: no room for its %u bytes of samples; it plays silent this time", path, size);
        free(path);
        return 0u;
    }
    g_snd_fill_target = real;
    const int ok = g_snd_filler(cpu, real, size, path);
    g_snd_fill_target = 0;
    if (ok) { ++g_snd_filled; g_snd_bytes_filled += size; }
    else {
        ++g_snd_failed;
        memset(isaac_g(real), 0, size);
        isaac_log("[isaac][snd] %s: its samples could not be read when first played (%u bytes of silence)", path, size);
    }
    free(path);
    i = snd_lower(ptr);
    if (i < g_snd_n && g_snd[i].ptr == ptr && g_snd[i].detached && !g_snd[i].real) {
        g_snd[i].real = real;
        ++g_snd_attached_late;
        return real;
    }
    isaac_guest_free(real);                               /* the stub went while it was read */
    return 0u;
}

/* The alBufferData shim: where the bytes of an upload of [va, va + n) are. A
 * recorded buffer is filled first (round 98); an upload that starts in a detached
 * buffer's stub reads that buffer's own block, read on its first upload. 0: the
 * upload has no bytes to give (no room for them). */
uint32_t isaac_snd_lazy_source(CpuState *cpu, uint32_t va, uint32_t n) {
    isaac_snd_lazy_fill(cpu, va, n);
    if (!g_snd_n || g_snd_fill_target || !n) return va;
    uint32_t i = snd_lower(va);
    if (!(i < g_snd_n && g_snd[i].ptr == va)) {
        if (i == 0u) return va;
        --i;
    }
    const snd_pending *r = &g_snd[i];
    if (!r->detached || va - r->ptr >= SND_STUB) return va;
    const uint32_t ptr = r->ptr, off = va - r->ptr;
    uint32_t real = r->real;
    if (!real) real = snd_fill_detached(cpu, ptr);
    return real ? real + off : 0u;
}

void isaac_snd_lazy_stats(uint32_t *pending, uint32_t *deferred, uint32_t *filled, uint32_t *forgotten,
                          uint32_t *failed, uint64_t *bytes_pending, uint64_t *bytes_filled) {
    /* unwritten: a record with no PCM yet; held: the heap bytes such records still take
     * (a detached one takes its stub only) */
    uint64_t held = 0;
    uint32_t unwritten = 0;
    for (uint32_t i = 0; i < g_snd_n; ++i) {
        if (g_snd[i].real) continue;
        ++unwritten;
        held += g_snd[i].detached ? SND_STUB : g_snd[i].size;
    }
    if (pending) *pending = unwritten;
    if (deferred) *deferred = g_snd_deferred;
    if (filled) *filled = g_snd_filled;
    if (forgotten) *forgotten = g_snd_forgotten;
    if (failed) *failed = g_snd_failed;
    if (bytes_pending) *bytes_pending = held;
    if (bytes_filled) *bytes_filled = g_snd_bytes_filled;
}

void isaac_snd_lazy_report(void) {
    if (!g_snd_deferred) return;
    uint32_t pending; uint64_t held;
    isaac_snd_lazy_stats(&pending, NULL, NULL, NULL, NULL, &held, NULL);
    isaac_log("[isaac][snd] lazy samples: %u read header-only (%.1f MB of PCM), %u filled on first play (%.1f MB), "
              "%u still unwritten (%.1f MB), %u freed unwritten, %u failed, %u not recorded",
              g_snd_deferred, g_snd_bytes_deferred / 1048576.0, g_snd_filled, g_snd_bytes_filled / 1048576.0,
              pending, held / 1048576.0, g_snd_forgotten, g_snd_failed, g_snd_refused);
    if (g_snd_detached || g_snd_not_detached)
        isaac_log("[isaac][snd] detached (round 127): %u buffers gave %.1f MB back to the heap until played; %u of them read "
                  "into a block of their own since; %u could not be detached", g_snd_detached,
                  g_snd_bytes_given_back / 1048576.0, g_snd_attached_late, g_snd_not_detached);
}
