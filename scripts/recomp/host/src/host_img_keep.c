/* host_img_keep.c -- an image the game loaded stays loaded a while after its
 * last user let go of it (round 118).
 *
 * The game counts the users of every image it loads (a sprite sheet, a
 * backdrop sheet) and frees the image, texture and all, when the last one
 * lets go; the next request for the same file reads the archive, inflates
 * and unfilters the PNG, premultiplies it and uploads it again. Leaving a
 * room lets go of what the room used, and the next room asks for most of it
 * back: perf-rooms.mjs measured 48 of the 75 ms of CPU in the frame a room
 * appears in going to PNG decoding and texture upload, in a room that had
 * been entered before as much as in a new one.
 *
 * The game's own loader (0x00a118d0: a lookup of the live images by name,
 * then a load) already hands out the one image of a name to everyone who
 * asks while it is alive. So nothing is cached here. The host takes one
 * more counted reference of its own (the game's smart-pointer copy,
 * 0x0040c550, into a guest slot the host owns) to every image that loader
 * returns, and lets go of it again (the game's destructor of that pointer,
 * 0x0040c440): the least recently asked-for ones when what it holds passes
 * a budget, and any that has not been asked for in a while. While the host
 * holds an image, the game's lookup finds it.
 *
 * What changes for the game: an image may outlive its last user, by at most
 * the budget's worth of other images and the idle time. It is the same
 * object the game would have shared with any other user alive at that time,
 * in the state the game left it. Nothing else of the game's state is touched.
 *
 * The size of an image is taken as the RGBA bytes handed to glTexImage2D
 * while it loaded (host_gl_webgl.c counts them), or IMG_KEEP_UNKNOWN when
 * none were (an image that was alive already).
 *
 * ISAAC_IMG_KEEP=<MB> is the budget (64; 0 keeps nothing, as before round
 * 118), ISAAC_IMG_KEEP_S=<seconds> the idle time (180; 0: no limit),
 * ISAAC_IMG_KEEP_LOG=1 names every image loaded or taken.
 *
 * The table is plain C over two callbacks (take a reference into slot i,
 * let slot i go) and a clock handed in, so the selftest drives it without a
 * guest. */
#include "isaac_host.h"

#include <stdint.h>
#include <stdlib.h>
#include <string.h>

#define IMG_KEEP_SLOTS   256u
#define IMG_KEEP_UNKNOWN (256u * 1024u)
#define IMG_KEEP_MB      64u
#define IMG_KEEP_IDLE_S  180u
#define IMG_SP_COPY      0x0040c550u      /* KAGE smart pointer: copy-construct (this = dst, arg = &src) */
#define IMG_SP_DTOR      0x0040c440u      /* its destructor (this) */

enum { KEEP_FREE = 0, KEEP_HELD = 1, KEEP_BUSY = 2 };
typedef struct { uint32_t img, bytes; uint64_t stamp; double seen_ms; uint8_t state; } keep_entry;

static keep_entry g_keep[IMG_KEEP_SLOTS];
static uint64_t g_keep_clock, g_keep_bytes, g_keep_budget = (uint64_t)IMG_KEEP_MB << 20;
static double g_keep_idle_ms = IMG_KEEP_IDLE_S * 1000.0;
static uint32_t g_keep_count, g_keep_taken, g_keep_again, g_keep_let_go, g_keep_too_big, g_keep_idled;

void isaac_img_keep_reset(uint64_t budget_bytes, double idle_ms) {
    memset(g_keep, 0, sizeof g_keep);
    g_keep_clock = g_keep_bytes = 0;
    g_keep_budget = budget_bytes;
    g_keep_idle_ms = idle_ms;
    g_keep_count = g_keep_taken = g_keep_again = g_keep_let_go = g_keep_too_big = g_keep_idled = 0u;
}
/* held now, taken, asked for again while held, let go for room, larger than the budget, let go idle */
void isaac_img_keep_counts(uint32_t out[6], uint64_t *bytes) {
    out[0] = g_keep_count; out[1] = g_keep_taken; out[2] = g_keep_again; out[3] = g_keep_let_go; out[4] = g_keep_too_big; out[5] = g_keep_idled;
    if (bytes) *bytes = g_keep_bytes;
}
/* A slot is marked busy around either callback, so a call made from inside
 * one (the game's destructor loading something) leaves it be. */
static void keep_let_go(uint32_t i, void (*drop)(void *, uint32_t), void *ctx) {
    g_keep[i].state = KEEP_BUSY;
    g_keep_bytes -= g_keep[i].bytes;
    --g_keep_count;
    drop(ctx, i);
    g_keep[i].state = KEEP_FREE;
    g_keep[i].img = 0u;
}

/* The game's loader returned image `img`, of `bytes` bytes (0: not known),
 * at `now_ms`. hold(ctx, i) takes a reference of the host's own into slot i
 * and returns 1 if it did; drop(ctx, i) lets slot i go. Returns 1 if a
 * reference was taken now, 0 if the image was held already (it is the most
 * recent again), or is not held (larger than the budget, which a budget of 0
 * makes every image, or no slot). */
int isaac_img_keep_note(uint32_t img, uint64_t bytes, double now_ms,
                        int (*hold)(void *, uint32_t), void (*drop)(void *, uint32_t), void *ctx) {
    if (!img) return 0;
    /* what nobody asked for in a while goes first */
    if (g_keep_idle_ms > 0.0)
        for (uint32_t i = 0; i < IMG_KEEP_SLOTS; ++i)
            if (g_keep[i].state == KEEP_HELD && g_keep[i].img != img && now_ms - g_keep[i].seen_ms > g_keep_idle_ms) {
                ++g_keep_idled;
                keep_let_go(i, drop, ctx);
            }
    for (uint32_t i = 0; i < IMG_KEEP_SLOTS; ++i)
        if (g_keep[i].state != KEEP_FREE && g_keep[i].img == img) {
            g_keep[i].stamp = ++g_keep_clock;
            g_keep[i].seen_ms = now_ms;
            ++g_keep_again;
            return 0;
        }
    if (!bytes) bytes = IMG_KEEP_UNKNOWN;
    if (bytes > g_keep_budget) { ++g_keep_too_big; return 0; }
    /* room: let the least recently asked-for go until this one fits */
    for (;;) {
        if (g_keep_count < IMG_KEEP_SLOTS && g_keep_bytes + bytes <= g_keep_budget) break;
        uint32_t old = IMG_KEEP_SLOTS;
        for (uint32_t i = 0; i < IMG_KEEP_SLOTS; ++i)
            if (g_keep[i].state == KEEP_HELD && (old == IMG_KEEP_SLOTS || g_keep[i].stamp < g_keep[old].stamp)) old = i;
        if (old == IMG_KEEP_SLOTS) return 0;                 /* everything left is busy */
        ++g_keep_let_go;
        keep_let_go(old, drop, ctx);
    }
    uint32_t at = IMG_KEEP_SLOTS;
    for (uint32_t i = 0; i < IMG_KEEP_SLOTS; ++i) if (g_keep[i].state == KEEP_FREE) { at = i; break; }
    if (at == IMG_KEEP_SLOTS) return 0;
    g_keep[at].state = KEEP_BUSY;
    g_keep[at].img = img;
    g_keep[at].bytes = (uint32_t)bytes;
    g_keep[at].stamp = ++g_keep_clock;
    g_keep[at].seen_ms = now_ms;
    g_keep_bytes += bytes;
    ++g_keep_count;
    if (!hold(ctx, at)) {
        g_keep_bytes -= bytes;
        --g_keep_count;
        g_keep[at].state = KEEP_FREE;
        g_keep[at].img = 0u;
        return 0;
    }
    g_keep[at].state = KEEP_HELD;
    ++g_keep_taken;
    return 1;
}

/* ---- the game's side ------------------------------------------------------ */

extern void isaac_guest_call(uint32_t va, CpuState *restrict cpu);
#ifdef __EMSCRIPTEN__
extern double emscripten_get_now(void);
static double keep_now_ms(void) { return emscripten_get_now(); }
#else
#include <time.h>
static double keep_now_ms(void) { return (double)clock() * 1000.0 / CLOCKS_PER_SEC; }
#endif

static int g_keep_mode = -1, g_keep_log;
static uint32_t g_keep_va;                            /* IMG_KEEP_SLOTS guest smart pointers, 8 bytes each */
typedef struct { const CpuState *cpu; uint32_t src; } keep_ctx;

static int keep_on(void) {
    if (g_keep_mode < 0) {
        const char *e = getenv("ISAAC_IMG_KEEP"), *t = getenv("ISAAC_IMG_KEEP_S"), *l = getenv("ISAAC_IMG_KEEP_LOG");
        unsigned long mb = (e && *e) ? strtoul(e, NULL, 10) : IMG_KEEP_MB;
        unsigned long idle = (t && *t) ? strtoul(t, NULL, 10) : IMG_KEEP_IDLE_S;
        if (mb > 1024ul) mb = 1024ul;
        if (idle > 86400ul) idle = 86400ul;
        g_keep_budget = (uint64_t)mb << 20;
        g_keep_idle_ms = (double)idle * 1000.0;
        g_keep_log = (l && *l && *l != '0');
        g_keep_mode = mb ? 1 : 0;
        if (g_keep_mode) {
            g_keep_va = isaac_guest_alloc(IMG_KEEP_SLOTS * 8u);
            if (!g_keep_va) g_keep_mode = 0;
            else memset(isaac_g(g_keep_va), 0, IMG_KEEP_SLOTS * 8u);
        }
        if (g_keep_mode)
            isaac_log("[isaac][img] round 118: a loaded image is kept past its last user, up to %lu MB of them and %lu s "
                      "since it was last asked for (ISAAC_IMG_KEEP=0 keeps none)", mb, idle);
        else
            isaac_log("[isaac][img] round 118: no image is kept past its last user (ISAAC_IMG_KEEP=%lu)", mb);
    }
    return g_keep_mode;
}
/* a guest thiscall on a stack well below the caller's frame */
static void keep_call(const CpuState *cpu, uint32_t fn, uint32_t self, int has_arg, uint32_t arg) {
    CpuState sub = *cpu;
    sub.ECX = self;
    sub.ESP = (cpu->ESP - 0x1000u) & ~0xFu;
    if (has_arg) { sub.ESP -= 4u; isaac_w32(sub.ESP, arg); }
    sub.ESP -= 4u; isaac_w32(sub.ESP, 0u);            /* return address */
    isaac_guest_call(fn, &sub);
}
static int keep_hold(void *c, uint32_t i) {
    const keep_ctx *k = (const keep_ctx *)c;
    const uint32_t slot = g_keep_va + i * 8u;
    isaac_w32(slot, 0u); isaac_w32(slot + 4u, 0u);
    keep_call(k->cpu, IMG_SP_COPY, slot, 1, k->src);
    return isaac_r32(slot + 4u) != 0u;                /* the copy took its count */
}
static void keep_drop(void *c, uint32_t i) {
    const keep_ctx *k = (const keep_ctx *)c;
    const uint32_t slot = g_keep_va + i * 8u;
    keep_call(k->cpu, IMG_SP_DTOR, slot, 0, 0u);
    isaac_w32(slot, 0u); isaac_w32(slot + 4u, 0u);
}

/* Around the game's loader (the wrapper of 0x00a118d0, lift_patches.py):
 * before it, the upload counter; after it, the pointer it filled in. */
uint64_t isaac_img_keep_enter(void) { return keep_on() ? isaac_gl_tex_image_bytes() : 0u; }
void isaac_img_keep_loaded(const CpuState *cpu, uint32_t out, uint32_t path, uint64_t before) {
    if (!keep_on() || !out || !isaac_is_guest_va(out) || !isaac_is_guest_va(out + 7u)) return;
    const uint32_t img = isaac_r32(out), counter = isaac_r32(out + 4u);
    if (!img || !counter) return;
    keep_ctx k = { cpu, out };
    const uint64_t bytes = isaac_gl_tex_image_bytes() - before;
    const uint32_t gone = g_keep_let_go + g_keep_idled, big = g_keep_too_big;
    const int took = isaac_img_keep_note(img, bytes, keep_now_ms(), keep_hold, keep_drop, &k);
    /* ISAAC_IMG_KEEP_LOG=1: every image loaded now (it uploaded pixels) or taken, by name */
    if (g_keep_log && (took || bytes))
        isaac_log("[isaac][img] %s %s (%llu bytes uploaded): %u held, %.1f MB, %u let go at this call%s",
                  took ? "took" : "loaded, not taken:", isaac_is_guest_va(path) ? (const char *)isaac_g(path) : "?",
                  (unsigned long long)bytes, g_keep_count, g_keep_bytes / 1048576.0, g_keep_let_go + g_keep_idled - gone,
                  g_keep_too_big != big ? " (larger than the budget)" : "");
}
void isaac_img_keep_report(void) {
    if (g_keep_mode <= 0 || !g_keep_taken) return;
    isaac_log("[isaac][img] images kept past their last user: %u held now (%.1f MB), %u taken, %u asked for again while held, "
              "%u let go for room, %u let go idle, %u larger than the budget",
              g_keep_count, g_keep_bytes / 1048576.0, g_keep_taken, g_keep_again, g_keep_let_go, g_keep_idled, g_keep_too_big);
}
