/* host_gl_lazy.c -- a texture reaches the GPU when it is first used (round 97).
 *
 * The engine decodes and uploads nearly every sprite sheet and font page it has
 * at boot, and draws with few of them: at the title 566 of 575 live textures,
 * 235 of 258 MB, had never been bound for a draw; after a minute of play, 614
 * of 633 (239 of 308 MB). Four of the five largest are the CJK font pages
 * (a 4096x4096, 64 MB, never drawn in an English game). On a phone, texture
 * memory is the system's RAM.
 *
 * So a large RGBA upload is not forwarded. Its pixels are kept here, coded
 * small, and the texture gets its storage the first time it is used: bound
 * (glBindTexture), written (glTexSubImage2D), attached to a framebuffer, or
 * found bound at a draw (host_gl_webgl.c decides when; this file keeps the
 * bytes and gives them back exactly).
 *
 * The code: tokens of a LEB128 header, count << 1 | 1 for a repeat of one
 * value (the value after it), count << 1 for a literal run (count values
 * after it). A value is a whole pixel, or one byte where every pixel of the
 * texture is premultiplied gray (r == g == b == a: a white glyph page).
 * Round 97d replaced a u32 header per token: the dense CJK glyph pages are
 * short runs, and the boot's textures (256.8 MB of RGBA) code to 28.3 MB
 * instead of 35.1 (deflate would make 12.1, at about a second of boot CPU).
 * A texture whose code would be more than half its RGBA is uploaded as before.
 *
 * The pixels come back a band of rows at a time (4 MB, the GL transfer chunk
 * of round 60), decoded straight from the code: round 97 decoded a whole
 * texture into one buffer first, 64 MB at once for the largest glyph page,
 * and that peak was the host heap's. With it gone the wasm memory is 640 MiB
 * again (build_boot.py).
 *
 * Plain C (no GL here), so the selftest runs the codec and the table natively.
 * ISAAC_GL_LAZY_TEX=0 turns it off; ISAAC_GL_LAZY_MIN=<bytes> is the smallest
 * texture deferred (64 KB). */
#include "isaac_host.h"

#include <stdint.h>
#include <stdlib.h>
#include <string.h>

#define LAZY_TEXTURE_2D 0x0DE1u
#define LAZY_RGBA       0x1908u
#define LAZY_UBYTE      0x1401u

typedef struct {
    uint32_t target, level, ifmt, w, h, border, format, type;   /* the deferred glTexImage2D */
    uint32_t len;                                               /* bytes of code */
    uint8_t gray;
    uint8_t *code;
} lazy_tex;

static lazy_tex **g_lazy;
static uint32_t g_lazy_cap;
static int g_lazy_mode = -1;
static uint32_t g_lazy_min;
static uint32_t g_lazy_pending, g_lazy_deferred, g_lazy_materialized, g_lazy_refused;
static uint64_t g_lazy_held, g_lazy_raw_pending, g_lazy_raw_materialized;

int isaac_lazy_tex_enabled(void) {
    if (g_lazy_mode < 0) {
        const char *e = getenv("ISAAC_GL_LAZY_TEX");
        const char *m = getenv("ISAAC_GL_LAZY_MIN");
        g_lazy_mode = (e && *e == '0') ? 0 : 1;
        g_lazy_min = (m && *m) ? (uint32_t)strtoul(m, NULL, 10) : 65536u;
    }
    return g_lazy_mode;
}

/* ---- the code ------------------------------------------------------------ */

static void put32(uint8_t *out, size_t at, uint32_t v) {
    out[at] = (uint8_t)v; out[at + 1] = (uint8_t)(v >> 8); out[at + 2] = (uint8_t)(v >> 16); out[at + 3] = (uint8_t)(v >> 24);
}
static uint32_t get32(const uint8_t *in, size_t at) {
    return (uint32_t)in[at] | ((uint32_t)in[at + 1] << 8) | ((uint32_t)in[at + 2] << 16) | ((uint32_t)in[at + 3] << 24);
}
static uint32_t pixel(const uint8_t *px, uint32_t i) { return get32(px, (size_t)i * 4u); }

/* 1 if every pixel is r == g == b == a */
int isaac_lazy_gray(const uint8_t *px, uint32_t npix) {
    for (uint32_t i = 0; i < npix; ++i) {
        const uint8_t *p = px + (size_t)i * 4u;
        if (p[0] != p[3] || p[1] != p[3] || p[2] != p[3]) return 0;
    }
    return 1;
}

/* a token header: count << 1 | repeat, LEB128 (1 byte up to a count of 63, 2 up to 8191) */
static size_t put_head(uint8_t *out, size_t o, uint32_t count, uint32_t repeat) {
    uint32_t v = (count << 1) | repeat;
    size_t n = 0;
    do {
        uint8_t b = (uint8_t)(v & 0x7fu);
        v >>= 7;
        if (out) out[o + n] = (uint8_t)(b | (v ? 0x80u : 0u));
        ++n;
    } while (v);
    return n;
}
static int get_head(const uint8_t *code, size_t len, size_t *p, uint32_t *v) {
    uint32_t r = 0;
    for (unsigned k = 0; k < 5; ++k) {
        if (*p >= len) return 0;
        uint8_t b = code[(*p)++];
        if (k == 4 && b > 0x0fu) return 0;                    /* more than 32 bits */
        r |= (uint32_t)(b & 0x7fu) << (7 * k);
        if (!(b & 0x80u)) { *v = r; return 1; }
    }
    return 0;
}

/* The code of npix RGBA pixels into out (NULL: only its length), as long as
 * it is at most cap bytes: LAZY_OVER when it would be longer, with nothing
 * written past cap (a token is taken to need its longest header, 5 bytes,
 * so a code within 4 bytes of cap can be refused). Round 117: the upload
 * path codes into a buffer of half the RGBA in one pass; it measured the
 * code first and then wrote it, two passes over every sheet a room loads. */
#define LAZY_OVER ((size_t)-1)
static size_t lazy_encode_to(const uint8_t *px, uint32_t npix, int gray, uint8_t *out, size_t cap) {
    const uint32_t minrun = gray ? 3u : 2u, size = gray ? 1u : 4u, most = 0x7fffffffu;
    size_t o = 0;
    uint32_t i = 0, lit = 0, litlen = 0;
#define FLUSH() do { if (litlen) { \
        if (cap - o < 5u || (cap - o - 5u) / size < litlen) return LAZY_OVER; \
        o += put_head(out, o, litlen, 0u); \
        if (out) for (uint32_t k = 0; k < litlen; ++k) { \
            if (gray) out[o + k] = px[(size_t)(lit + k) * 4u + 3u]; \
            else memcpy(out + o + (size_t)k * 4u, px + (size_t)(lit + k) * 4u, 4); } \
        o += (size_t)litlen * size; litlen = 0; } } while (0)
    while (i < npix) {
        uint32_t v = pixel(px, i), r = 1;
        while (i + r < npix && r < most && pixel(px, i + r) == v) ++r;
        if (r >= minrun) {
            FLUSH();
            if (cap - o < 5u + size) return LAZY_OVER;
            o += put_head(out, o, r, 1u);
            if (out) { if (gray) out[o] = (uint8_t)(v >> 24); else put32(out, o, v); }
            o += size;
            i += r;
            lit = i;
        } else {
            if (!litlen) lit = i;
            litlen += r;
            i += r;
            if (litlen >= most - 8u) FLUSH();
        }
    }
    FLUSH();
#undef FLUSH
    return o;
}
size_t isaac_lazy_encode(const uint8_t *px, uint32_t npix, int gray, uint8_t *out) {
    return lazy_encode_to(px, npix, gray, out, (size_t)-1);
}
/* the same into at most cap bytes of out: (size_t)-1 if the code would not fit */
size_t isaac_lazy_encode_cap(const uint8_t *px, uint32_t npix, int gray, uint8_t *out, size_t cap) {
    return lazy_encode_to(px, npix, gray, out, cap);
}

/* The next npix pixels of a code, from where the cursor stands (a zeroed
 * cursor: the start). 0 if the code is malformed or ends first; a literal
 * run is checked whole when its header is read, so a bad code never reads
 * past its end, and nothing is written past npix pixels. */
int isaac_lazy_decode_next(const uint8_t *code, size_t len, int gray, isaac_lazy_cursor *c,
                           uint8_t *px, uint32_t npix) {
    const uint32_t size = gray ? 1u : 4u;
    uint32_t i = 0;
    while (i < npix) {
        if (!c->left) {
            uint32_t h;
            if (!get_head(code, len, &c->p, &h) || !(h >> 1)) return 0;
            c->left = h >> 1;
            c->repeat = (uint8_t)(h & 1u);
            if (c->repeat) {
                if (len - c->p < size) return 0;
                c->value = gray ? 0x01010101u * code[c->p] : get32(code, c->p);
                c->p += size;
            } else if ((len - c->p) / size < c->left) {
                return 0;
            }
        }
        uint32_t n = c->left < npix - i ? c->left : npix - i;
        if (c->repeat) {
            for (uint32_t k = 0; k < n; ++k) put32(px, (size_t)(i + k) * 4u, c->value);
        } else {
            if (gray) for (uint32_t k = 0; k < n; ++k) memset(px + (size_t)(i + k) * 4u, code[c->p + k], 4);
            else memcpy(px + (size_t)i * 4u, code + c->p, (size_t)n * 4u);
            c->p += (size_t)n * size;
        }
        c->left -= n;
        i += n;
    }
    return 1;
}

/* The pixels back. 0 if the code does not describe exactly npix pixels. */
int isaac_lazy_decode(const uint8_t *code, size_t len, int gray, uint8_t *px, uint32_t npix) {
    isaac_lazy_cursor c = {0};
    return isaac_lazy_decode_next(code, len, gray, &c, px, npix) && !c.left && c.p == len;
}

/* rows per upload band: the GL transfer chunk of round 60 (a test may shrink it) */
static uint32_t g_lazy_band = 4u << 20;
void isaac_lazy_set_band(uint32_t bytes) { g_lazy_band = bytes ? bytes : 4u << 20; }

/* ---- the table ----------------------------------------------------------- */

static lazy_tex *lazy_get(uint32_t name) { return name < g_lazy_cap ? g_lazy[name] : NULL; }

int isaac_lazy_tex_pending(uint32_t name) { return lazy_get(name) != NULL; }

void isaac_lazy_tex_drop(uint32_t name) {
    lazy_tex *t = lazy_get(name);
    if (!t) return;
    g_lazy[name] = NULL;
    --g_lazy_pending;
    g_lazy_held -= t->len;
    g_lazy_raw_pending -= (uint64_t)t->w * t->h * 4u;
    free(t->code);
    free(t);
}

/* Keep the upload instead of making it: 1 if kept (the caller forwards nothing). */
int isaac_lazy_tex_defer(uint32_t name, uint32_t target, uint32_t level, uint32_t ifmt, uint32_t w, uint32_t h,
                         uint32_t border, uint32_t format, uint32_t type, const uint8_t *px) {
    if (!isaac_lazy_tex_enabled() || !name || !px || target != LAZY_TEXTURE_2D || level || border ||
        format != LAZY_RGBA || type != LAZY_UBYTE || !w || !h || (uint64_t)w * h > 0x10000000u)
        return 0;
    uint32_t npix = w * h;
    uint64_t raw = (uint64_t)npix * 4u;
    if (raw < g_lazy_min) return 0;
    int gray = isaac_lazy_gray(px, npix);
    /* a code of more than half the RGBA is not kept: one pass, into a buffer of that half */
    const size_t half = (size_t)(raw / 2u);
    uint8_t *code = (uint8_t *)malloc(half);
    if (!code) return 0;
    size_t len = lazy_encode_to(px, npix, gray, code, half);
    if (len == LAZY_OVER) { free(code); ++g_lazy_refused; return 0; }
    { uint8_t *fit = (uint8_t *)realloc(code, len ? len : 1); if (fit) code = fit; }
    if (name >= g_lazy_cap) {
        uint32_t cap = g_lazy_cap ? g_lazy_cap : 1024u;
        while (cap <= name) cap *= 2u;
        lazy_tex **grown = (lazy_tex **)realloc(g_lazy, (size_t)cap * sizeof *grown);
        if (!grown) { free(code); return 0; }
        memset(grown + g_lazy_cap, 0, (size_t)(cap - g_lazy_cap) * sizeof *grown);
        g_lazy = grown; g_lazy_cap = cap;
    }
    lazy_tex *t = (lazy_tex *)calloc(1, sizeof *t);
    if (!t) { free(code); return 0; }
    isaac_lazy_tex_drop(name);
    t->target = target; t->level = level; t->ifmt = ifmt; t->w = w; t->h = h;
    t->border = border; t->format = format; t->type = type;
    t->len = (uint32_t)len; t->gray = (uint8_t)gray; t->code = code;
    g_lazy[name] = t;
    ++g_lazy_pending; ++g_lazy_deferred;
    g_lazy_held += len; g_lazy_raw_pending += raw;
    if (g_lazy_deferred == 1)
        isaac_log("[isaac][gl] textures reach the GPU when first used (%u bytes and up; ISAAC_GL_LAZY_TEX=0 uploads at once)", g_lazy_min);
    return 1;
}

/* Give a kept texture its pixels: the upload is made through `up` (the texture
 * must be bound where `up` uploads), then the copy is freed. 1 if it was kept.
 * A texture larger than a band is allocated first, then filled band by band
 * from one band-sized buffer, decoded straight from the code. */
int isaac_lazy_tex_materialize(uint32_t name, isaac_lazy_upload_fn up) {
    lazy_tex *t = lazy_get(name);
    if (!t) return 0;
    uint32_t row = t->w * 4u, rows = g_lazy_band / row;
    if (!rows) rows = 1;
    if (rows > t->h) rows = t->h;
    uint8_t *px = (uint8_t *)malloc((size_t)rows * row);
    if (!px) {
        isaac_log("[isaac][gl] texture %u (%ux%u): no memory to give it its pixels; it stays empty", name, t->w, t->h);
        isaac_lazy_tex_drop(name);
        return 1;
    }
    isaac_lazy_cursor c = {0};
    int ok = 1;
    if (rows < t->h) up(t->target, t->level, t->ifmt, t->w, t->h, t->border, t->format, t->type, 0, 0, NULL);
    for (uint32_t y = 0; y < t->h; y += rows) {
        uint32_t n = t->h - y < rows ? t->h - y : rows;
        if (ok && !isaac_lazy_decode_next(t->code, t->len, t->gray, &c, px, n * t->w)) ok = 0;
        if (!ok) memset(px, 0, (size_t)n * row);
        up(t->target, t->level, t->ifmt, t->w, t->h, t->border, t->format, t->type, y, n, px);
    }
    if (!ok || c.left || c.p != t->len)
        isaac_log("[isaac][gl] texture %u (%ux%u): its kept pixels do not decode", name, t->w, t->h);
    free(px);
    ++g_lazy_materialized;
    g_lazy_raw_materialized += (uint64_t)t->w * t->h * 4u;
    isaac_lazy_tex_drop(name);
    return 1;
}

void isaac_lazy_tex_stats(uint32_t *pending, uint32_t *deferred, uint32_t *materialized, uint32_t *refused,
                          uint64_t *held, uint64_t *raw_pending) {
    if (pending) *pending = g_lazy_pending;
    if (deferred) *deferred = g_lazy_deferred;
    if (materialized) *materialized = g_lazy_materialized;
    if (refused) *refused = g_lazy_refused;
    if (held) *held = g_lazy_held;
    if (raw_pending) *raw_pending = g_lazy_raw_pending;
}

void isaac_lazy_tex_report(void) {
    if (!g_lazy_deferred) return;
    isaac_log("[isaac][gl] lazy textures: %u kept, %u given their pixels on first use (%.1f MB), %u still kept: "
              "%.1f MB of RGBA held in %.1f MB; %u uploaded at once (code over half)",
              g_lazy_deferred, g_lazy_materialized, g_lazy_raw_materialized / 1048576.0, g_lazy_pending,
              g_lazy_raw_pending / 1048576.0, g_lazy_held / 1048576.0, g_lazy_refused);
}
