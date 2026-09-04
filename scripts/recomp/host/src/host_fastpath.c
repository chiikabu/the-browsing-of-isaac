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
