/* host_fastpath.c -- exact host implementations of the deterministic leaf
 * functions that dominate the boot (round 12 profile: PNG row unfilter 37%,
 * zlib adler32 8.7%, texture premultiply 8% of 6.7 G lifted instructions at
 * ~12 MIPS). Each is a pure function of its inputs with a spec-fixed result
 * (PNG filter algorithms, RFC 1950 Adler-32, a table lookup), so a host
 * implementation is output-identical to the lifted one; the wrapper that
 * lift_patches.py installs around the lifted body (WRAP_PATCHES) can also
 * run both and compare (ISAAC_FASTPATH_VERIFY=1), or fall back to the
 * lifted body entirely (ISAAC_FASTPATH=0).
 *
 * Everything operates on GUEST memory through isaac_g(): the buffers are
 * the game's, in the guest arena, exactly as the lifted code would touch
 * them. */

#include "isaac_host.h"

#include <stdlib.h>
#include <string.h>

static int fastpath_mode(void) {          /* 0 = lifted only, 1 = host, 2 = verify both */
    static int v = -1;
    if (v < 0) {
        const char *e = getenv("ISAAC_FASTPATH");
        const char *vf = getenv("ISAAC_FASTPATH_VERIFY");
        v = (e && *e == '0') ? 0 : 1;
        if (vf && *vf && *vf != '0') v = 2;
    }
    return v;
}
int isaac_fastpath_mode(void) { return fastpath_mode(); }

/* png_read_filter_row: libpng 1.6's png_row_info at row_info_va
 *   +0 width, +4 rowbytes, +8 color_type, +9 bit_depth, +0xa channels,
 *   +0xb pixel_depth.  row/prev point at the first byte after the filter
 * byte, as libpng passes them; filter 0..4 per the PNG spec. */
void isaac_fast_unfilter(uint32_t row_info_va, uint32_t row_va, uint32_t prev_va,
                         uint32_t filter) {
    uint32_t rowbytes = isaac_r32(row_info_va + 4u);
    uint32_t bpp = (uint32_t)(*(const uint8_t *)isaac_g(row_info_va + 0xbu) + 7u) >> 3;
    if (!rowbytes || !isaac_is_guest_va(row_va + rowbytes - 1u)) return;
    uint8_t *row = (uint8_t *)isaac_g(row_va);
    const uint8_t *prev = (prev_va && isaac_is_guest_va(prev_va + rowbytes - 1u))
                              ? (const uint8_t *)isaac_g(prev_va) : NULL;
    uint32_t i;
    switch (filter) {
    case 0: break;
    case 1:                                        /* Sub */
        for (i = bpp; i < rowbytes; i++) row[i] = (uint8_t)(row[i] + row[i - bpp]);
        break;
    case 2:                                        /* Up */
        if (prev) for (i = 0; i < rowbytes; i++) row[i] = (uint8_t)(row[i] + prev[i]);
        break;
    case 3:                                        /* Avg */
        for (i = 0; i < bpp && i < rowbytes; i++)
            row[i] = (uint8_t)(row[i] + ((prev ? prev[i] : 0u) >> 1));
        for (i = bpp; i < rowbytes; i++)
            row[i] = (uint8_t)(row[i] + (((uint32_t)row[i - bpp] + (prev ? prev[i] : 0u)) >> 1));
        break;
    case 4:                                        /* Paeth */
        for (i = 0; i < bpp && i < rowbytes; i++)
            row[i] = (uint8_t)(row[i] + (prev ? prev[i] : 0u));
        for (i = bpp; i < rowbytes; i++) {
            int a = row[i - bpp], b = prev ? prev[i] : 0, c = prev ? prev[i - bpp] : 0;
            int p = a + b - c;
            int pa = abs(p - a), pb = abs(p - b), pc = abs(p - c);
            int pred = (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
            row[i] = (uint8_t)(row[i] + pred);
        }
        break;
    default: break;                                /* the lifted body reports the error */
    }
}

/* zlib adler32(adler, buf, len): RFC 1950, BASE 65521, NMAX 5552. */
uint32_t isaac_fast_adler32(uint32_t adler, uint32_t buf_va, uint32_t len) {
    if (!buf_va) return 1u;
    if (len && !isaac_is_guest_va(buf_va + len - 1u)) return adler;
    const uint8_t *p = (const uint8_t *)isaac_g(buf_va);
    uint32_t s1 = adler & 0xffffu, s2 = adler >> 16;
    while (len) {
        uint32_t n = len < 5552u ? len : 5552u;
        len -= n;
        while (n--) { s1 += *p++; s2 += s1; }
        s1 %= 65521u; s2 %= 65521u;
    }
    return (s2 << 16) | s1;
}

/* The engine's texture premultiply (0x00a663c0): for `count` RGBA8 pixels,
 * alpha 0xff = untouched, alpha 0 = pixel zeroed, otherwise each of R,G,B
 * replaced by table[(alpha << 8) | value] -- the 64 KB table lives in the
 * image (0x00c13640 when [0x00c798e4] & 8, else 0x00c23640). */
void isaac_fast_premultiply(uint32_t pixels_va, uint32_t count, uint32_t table_va) {
    if (!count || !isaac_is_guest_va(pixels_va + count * 4u - 1u) ||
        !isaac_is_guest_va(table_va + 0xffffu)) return;
    uint8_t *p = (uint8_t *)isaac_g(pixels_va);
    const uint8_t *t = (const uint8_t *)isaac_g(table_va);
    for (uint32_t i = 0; i < count; i++, p += 4) {
        uint8_t a = p[3];
        if (a == 0xffu) continue;
        if (a == 0u) { p[0] = p[1] = p[2] = p[3] = 0; continue; }
        uint32_t base = (uint32_t)a << 8;
        p[0] = t[base | p[0]];
        p[1] = t[base | p[1]];
        p[2] = t[base | p[2]];
    }
}

/* Verify-mode support: compare a guest range against a host snapshot. */
int isaac_fast_verify_equal(const void *snapshot, uint32_t va, uint32_t len) {
    if (!isaac_is_guest_va(va + len - 1u)) return 1;
    return memcmp(snapshot, isaac_g(va), len) == 0;
}

static uint32_t g_mismatches;
void isaac_fastpath_mismatch(const char *what, uint32_t a, uint32_t b) {
    ++g_mismatches;
    if (g_mismatches <= 20u)
        isaac_log("[isaac][fastpath] MISMATCH #%u in %s (%u, %u): host result differs from the lifted body",
                  g_mismatches, what, a, b);
}
uint32_t isaac_fastpath_mismatches(void) { return g_mismatches; }

/* The exit census (round 27): per wrapper, how many calls ran the lifted body
 * (ISAAC_FASTPATH=0, or the host path declining: a refill, a contended lock, a
 * count reaching zero) and how many verify compares completed, so that
 * "0 mismatches" comes with the number of calls it was measured over. The
 * host path itself is not counted -- for a dispatched wrapper it is the
 * dispatch census minus the lifted count -- to keep the hot path free of it. */
#define FP_CENSUS_MAX 16
static uint32_t g_fp_va[FP_CENSUS_MAX], g_fp_lifted[FP_CENSUS_MAX], g_fp_verified[FP_CENSUS_MAX];
static unsigned g_fp_n;
void isaac_fastpath_count(uint32_t va, int kind) {
    unsigned i = 0;
    for (; i < g_fp_n; ++i) if (g_fp_va[i] == va) break;
    if (i == g_fp_n) { if (g_fp_n >= FP_CENSUS_MAX) return; g_fp_va[g_fp_n++] = va; }
    if (kind == 2) ++g_fp_verified[i]; else ++g_fp_lifted[i];
}
void isaac_fastpath_report(void) {
    if (!g_fp_n && !g_mismatches) return;
    static const char *const modes[] = { "lifted (ISAAC_FASTPATH=0)", "host", "verify (ISAAC_FASTPATH_VERIFY=1)" };
    isaac_log("[isaac][fastpath] ---- mode %s: %u mismatch(es) ----", modes[fastpath_mode()], g_mismatches);
    for (unsigned i = 0; i < g_fp_n; ++i)
        isaac_log("[isaac][fastpath]   sub_%08x: %u lifted, %u verified", g_fp_va[i], g_fp_lifted[i], g_fp_verified[i]);
}

/* The engine's path hash (FUN_00a159d0): djb2 over the string with ASCII
 * upper-case folded down and '\\' folded to '/', so "GFX\\X.PNG" and
 * "gfx/x.png" hash alike. It is the hot leaf of every resource lookup -- the
 * round-18 stall dump found it and the path normalisation above it dominating
 * the ring while the game resolved one enemy's anm2. Pure: same string, same
 * answer, no state. */
uint32_t isaac_fast_pathhash(uint32_t str_va) {
    if (!str_va) return 0u;
    uint32_t h = 0x1505u;
    for (uint32_t a = str_va;; ++a) {
        if (!isaac_is_guest_va(a)) break;
        uint8_t b = *(const uint8_t *)isaac_g(a);
        if (!b) break;
        uint32_t c = (b >= 'A' && b <= 'Z') ? (uint32_t)(b + 0x20u) : (uint32_t)b;
        if (c == 0x5Cu) c = 0x2Fu;
        h = h * 33u + c;
    }
    return h;
}

/* ---- round 27: the leaves of the dispatch census ---------------------------
 * The fast profile's dispatch census over 3,000 gameplay frames (recomp-
 * architecture.md 21.42) put 71 M of its 93 M dispatches in four fragments of
 * ONE function: the ISAAC CSPRNG core that refills the v2 archive keystream,
 * whose per-iteration `switch (i & 3)` is a jump table the lifter dispatches
 * through, 256 times per call. Next came the engine Mutex's Lock/Unlock
 * (5.07 M each) under the refcount-handle helpers, and ArchivedFile::read
 * (1.18 M, the top inclusive time). Each gets an exact host version here; the
 * wrappers in lift_patches.py decide BEFORE any side effect whether the host
 * version applies and otherwise run the lifted body untouched. */

/* [va, va+len) is guest memory (and does not wrap). */
int isaac_fast_guest_range(uint32_t va, uint32_t len) {
    if (!len) return isaac_is_guest_va(va);
    return va + len >= va && isaac_is_guest_va(va + len - 1u);
}

/* Bob Jenkins' isaac() (0x00aa94a0) on the engine's context layout:
 *   +0x000 the consumer's result index, +0x004 r[256], +0x404 mm[256],
 *   +0x804 a, +0x808 b, +0x80c c.
 * The lifted body reads a and b back from memory every iteration and writes
 * mm[i], r[i], a and b as it goes; no mm/r index can alias the scalars, so
 * keeping a and b in locals and storing them at the end leaves the same bytes.
 * `edx_out` receives what the last iteration leaves in EDX (a after its xor
 * step) so the wrapper hands back the same scratch registers; the last b is
 * EAX and is read back from +0x808. Returns 0 (nothing touched) when the
 * context is not guest memory. */
int isaac_fast_isaac(uint32_t ctx_va, uint32_t *edx_out) {
    if (!isaac_fast_guest_range(ctx_va, 0x810u)) return 0;
    uint32_t *r = (uint32_t *)isaac_g(ctx_va + 4u);
    uint32_t *mm = (uint32_t *)isaac_g(ctx_va + 0x404u);
    uint32_t a = isaac_r32(ctx_va + 0x804u), b = isaac_r32(ctx_va + 0x808u);
    uint32_t c = isaac_r32(ctx_va + 0x80cu) + 1u, axor = a;
    b += c;
    for (uint32_t i = 0; i < 256u; i++) {
        uint32_t x = mm[i], y;
        switch (i & 3u) {
        case 0: a ^= a << 13; break;
        case 1: a ^= a >> 6; break;
        case 2: a ^= a << 2; break;
        default: a ^= a >> 16; break;
        }
        axor = a;
        a += mm[(i + 128u) & 0xffu];
        y = mm[(x >> 2) & 0xffu] + a + b;
        mm[i] = y;
        b = mm[(y >> 10) & 0xffu] + x;
        r[i] = b;
    }
    isaac_w32(ctx_va + 0x804u, a);
    isaac_w32(ctx_va + 0x808u, b);
    isaac_w32(ctx_va + 0x80cu, c);
    if (edx_out) *edx_out = axor;
    return 1;
}

/* The keystream consumer (0x00a89d70; thiscall, [this] -> the context above,
 * stack: buf, len): XORs len bytes with the r[] words, least significant byte
 * first, taking word r[idx] at every fourth byte and refilling through isaac()
 * the moment r[255] has been taken (the index resets to 0). A trailing partial
 * word is dropped: the next call starts on a fresh word. `ok` is the
 * side-effect-free precondition (guest ranges, an index inside r[]); `xor`
 * assumes it. */
int isaac_fast_keystream_ok(uint32_t self_va, uint32_t buf_va, uint32_t len) {
    if (!isaac_fast_guest_range(self_va, 4u)) return 0;
    uint32_t ctx = isaac_r32(self_va);
    if (!isaac_fast_guest_range(ctx, 0x810u) || !isaac_fast_guest_range(buf_va, len)) return 0;
    if (!isaac_is_guest_va(ctx) || isaac_r32(ctx) > 0xffu) return 0;
    return 1;
}
void isaac_fast_keystream_xor(uint32_t self_va, uint32_t buf_va, uint32_t len) {
    uint32_t ctx = isaac_r32(self_va);
    uint32_t *c = (uint32_t *)isaac_g(ctx);
    uint8_t *p = (uint8_t *)isaac_g(buf_va);
    uint32_t w = 0u;
    for (uint32_t k = 0; k < len; k++) {
        if ((k & 3u) == 0u) {
            uint32_t idx = c[0];
            w = c[idx + 1u];
            c[0] = idx + 1u;
            if (idx + 1u > 0xffu) { isaac_fast_isaac(ctx, NULL); c[0] = 0u; }
        } else {
            w >>= 8;
        }
        p[k] ^= (uint8_t)w;
    }
}

/* ArchivedFile::read (0x00a69510; thiscall, stack: buf, size, count; ret 0xc):
 *   +0x018 stream position, +0x81c the 0x400-byte decoded window,
 *   +0xc1c window position, +0xc20 window fill, +0xc28 eof.
 * It serves size*count bytes from the window and refills through 0x00a68cf0
 * when the window runs dry. The host takes only the calls the window can
 * satisfy outright, or that end at eof (the lifted loop returns what it has
 * once eof is set): a refill decodes a piece through the stream, the LZW /
 * deflate state and the keystream above, and stays the lifted body's job.
 * `plan` decides that with no side effect; `window` performs the copy. */
int isaac_fast_read_plan(uint32_t self, uint32_t buf, uint32_t n, uint32_t *take) {
    if (!isaac_fast_guest_range(self, 0xc29u)) return 0;
    uint32_t pos = isaac_r32(self + 0xc1cu), fill = isaac_r32(self + 0xc20u);
    uint32_t avail = pos < fill ? fill - pos : 0u;
    if (n > avail && !isaac_r8(self + 0xc28u)) return 0;      /* a refill: not ours */
    uint32_t t = n < avail ? n : avail;
    if (t && (!isaac_fast_guest_range(buf, t) || !isaac_fast_guest_range(self + 0x81cu + pos, t))) return 0;
    if (!isaac_is_guest_va(buf)) return 0;
    *take = t;
    return 1;
}
void isaac_fast_read_window(uint32_t self, uint32_t buf, uint32_t take) {
    uint32_t pos = isaac_r32(self + 0xc1cu);
    if (take) memmove(isaac_g(buf), isaac_g(self + 0x81cu + pos), take);   /* the CRT memcpy is memmove-safe */
    isaac_w32(self + 0x18u, isaac_r32(self + 0x18u) + take);
    isaac_w32(self + 0xc1cu, pos + take);
}

/* The engine Mutex (0x00a15770 family): +0 vtable, +4 flags (bit 0 =
 * initialised), +8 -> a 0x1c-byte block holding the 24-byte Win32
 * CRITICAL_SECTION and the engine's own 'locked' byte at +0x18. Lock(-1)
 * (0x00a157f0) is EnterCriticalSection, spin on that byte with Sleep(1000),
 * set it, return 1; Unlock (0x00a159a0) clears it and Leaves. In this runtime
 * Enter reports the acquire to the thread slicer (isaac_threads_note_cs: the
 * idle-lap detection, which may yield) and Leave does nothing, so the
 * uncontended Lock is exactly that report plus the byte. The contended case
 * -- the byte already set, i.e. a sliced job holding the mutex -- and every
 * timeout other than INFINITE are left to the lifted body. */
static uint32_t mutex_cs(uint32_t mutex) {   /* the block, or 0 unless initialised and in guest memory */
    if (!isaac_fast_guest_range(mutex, 0xcu)) return 0u;
    if (!(isaac_r8(mutex + 4u) & 1u)) return 0u;
    uint32_t cs = isaac_r32(mutex + 8u);
    if (!cs || !isaac_fast_guest_range(cs, 0x1cu)) return 0u;
    return cs;
}
int isaac_fast_mutex_init(uint32_t mutex) { return mutex_cs(mutex) != 0u; }
int isaac_fast_mutex_free(uint32_t mutex) {
    uint32_t cs = mutex_cs(mutex);
    return cs != 0u && isaac_r8(cs + 0x18u) == 0u;
}
/* The refcount handles reach their (embedded) mutex through its vtable, +0xc
 * Lock and +0x10 Unlock; the host stands in for the engine's own pair only. */
int isaac_fast_mutex_std(uint32_t mutex) {
    if (!isaac_fast_mutex_free(mutex)) return 0;
    uint32_t vt = isaac_r32(mutex);
    if (!isaac_is_guest_va(vt) || !isaac_fast_guest_range(vt, 0x14u)) return 0;
    return isaac_r32(vt + 0xcu) == 0x00a157f0u && isaac_r32(vt + 0x10u) == 0x00a159a0u;
}
extern void isaac_threads_note_cs(uint32_t cs);          /* host_shims_module.c */
void isaac_fast_mutex_take(uint32_t mutex) {             /* Lock(INFINITE), uncontended */
    uint32_t cs = isaac_r32(mutex + 8u);
    isaac_threads_note_cs(cs);                           /* what EnterCriticalSection does here; may yield */
    *(uint8_t *)isaac_g(cs + 0x18u) = 1u;
}
void isaac_fast_mutex_drop(uint32_t mutex) {             /* Unlock: the byte, then a LeaveCriticalSection that is a no-op */
    uint32_t cs = isaac_r32(mutex + 8u);
    *(uint8_t *)isaac_g(cs + 0x18u) = 0u;
}

/* ---- probes (lift_patches.py PROBE_PATCHES) ------------------------------
 * ISAAC_PROBE=1: log the first calls of a lifted function that the dispatch
 * watch cannot see because its callers reach it directly. `tag` is the
 * function's VA; the three values are whatever the probe wants to show. */
int isaac_probe_on(void) {
    static int v = -1;
    if (v < 0) { const char *e = getenv("ISAAC_PROBE"); v = (e && *e && *e != '0') ? 1 : 0; }
    return v;
}
void isaac_probe_hit(uint32_t tag, uint32_t a, uint32_t b, uint32_t c) {
    static uint32_t tags[16];
    static unsigned hits[16], n;
    unsigned i = 0;
    for (; i < n; ++i) if (tags[i] == tag) break;
    if (i == n) { if (n >= 16u) return; tags[n] = tag; hits[n] = 0u; n++; }
    if (++hits[i] > 64u) return;    /* 64, like isaac_probe_str: the boot alone opens dozens of streams */
    isaac_log("[isaac][probe] sub_%08x #%u: %08x %08x %08x", tag, hits[i], a, b, c);
}
/* A probe value that is a guest C string (round 24d: the sound path an ogg
 * stream is asked to open). Same first-8-per-tag budget as isaac_probe_hit;
 * a null or non-guest pointer prints as such instead of faulting. */
void isaac_probe_str(uint32_t tag, const char *label, uint32_t p) {
    static uint32_t tags[16];
    static unsigned hits[16], n;
    unsigned i = 0;
    char buf[96];
    for (; i < n; ++i) if (tags[i] == tag) break;
    if (i == n) { if (n >= 16u) return; tags[n] = tag; hits[n] = 0u; n++; }
    if (++hits[i] > 64u) return;    /* 64: the resource resolver is hit ~10 times during boot alone */
    if (!p) { isaac_log("[isaac][probe] sub_%08x %s: (null)", tag, label); return; }
    if (!isaac_is_guest_va(p)) { isaac_log("[isaac][probe] sub_%08x %s: 0x%08x (not a guest address)", tag, label, p); return; }
    { unsigned k = 0; const char *s = (const char *)isaac_g(p);
      while (k < sizeof buf - 1u && isaac_is_guest_va(p + k) && s[k]) { buf[k] = s[k]; ++k; }
      buf[k] = 0; }
    isaac_log("[isaac][probe] sub_%08x %s: 0x%08x \"%s\"", tag, label, p, buf);
}
