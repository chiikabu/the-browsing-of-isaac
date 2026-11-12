/* host_gl_clientarrays.c -- client-side vertex array emulation for WebGL2.
 *
 * THE PROBLEM (measured, not assumed)
 * -----------------------------------
 * The renderer submits geometry with CLIENT-SIDE arrays. Evidence:
 *
 *   - Of the 3,221 libepoxy dispatch slots, the buffer-object family
 *     (glGenBuffers/glBindBuffer/glBufferData/glBufferSubData/glMapBuffer and
 *     every ARB/EXT/OES alias -- 25 exports) has ZERO references from caller
 *     code. The VAO family (12 exports) likewise ZERO. Checked across all
 *     7,430,656 bytes of .text, 2,088,711 decoded instructions.
 *   - glVertexAttribPointer's `pointer` argument comes straight from a caller
 *     parameter at 0x00a24d37:
 *         push ebx                  ; pointer   (caller-supplied)
 *         push [ebp+0x10]           ; stride
 *         push 0                    ; normalized
 *         push 0x1406               ; GL_FLOAT
 *         push eax                  ; size 1..4
 *         push [ebp+8]              ; index (from glGetAttribLocation)
 *         call [epoxy_glVertexAttribPointer]
 *   - glDrawElements' `indices` argument likewise, at 0x00a189f0:
 *         push [ebx+0x14]           ; indices   (caller-supplied)
 *         push 0x1403               ; GL_UNSIGNED_SHORT
 *         push [ebx+0x18]           ; count
 *         push 4                    ; GL_TRIANGLES
 *         call [epoxy_glDrawElements]
 *
 * Because glBindBuffer is never called, ARRAY_BUFFER and ELEMENT_ARRAY_BUFFER
 * are provably always 0, so both pointers are client memory addresses.
 *
 * WebGL2 removed client-side arrays outright: vertexAttribPointer's last
 * argument is a byte offset into the bound ARRAY_BUFFER, and drawElements'
 * last argument is a byte offset into the bound ELEMENT_ARRAY_BUFFER. Passing
 * a heap pointer produces INVALID_OPERATION, not a draw.
 *
 * THE FIX
 * -------
 * Intercept the attribute-pointer calls, remember the client pointers, and at
 * draw time stage the referenced memory into a pool of real buffer objects,
 * then re-issue the draw against buffer offsets.
 *
 * Identity addressing makes the staging cheap: a guest pointer IS a linear
 * memory offset, so the source of the upload is `isaac_g(ptr)` with no
 * translation and no bounce buffer on our side.
 *
 * WHAT IS DERIVABLE AND WHAT IS NOT
 * ---------------------------------
 * derivable  glDrawArrays(mode, first, count): the vertex range is exactly
 *            [first, first+count). Upload stride*(first+count) bytes. Exact.
 *
 * derivable  glDrawElements(mode, count, type, indices): the INDEX range is
 *            exact -- count * sizeof(type) bytes starting at `indices`. So the
 *            index upload is never a guess.
 *
 * NOT derivable without work
 *            glDrawElements' VERTEX range. GL says "read attribute i at
 *            pointer + stride*index" for each index in the index array; there
 *            is no API-level upper bound on index values. The only exact
 *            answer is to SCAN the index array and take max+1. That scan is
 *            O(count) per draw call and is unavoidable -- glDrawRangeElements
 *            exists precisely to supply the bound, and this binary never calls
 *            it (verified: 0 references).
 *
 * NOT derivable at all
 *            The true extent of the client buffer. If the app's array is
 *            shorter than max_index+1 vertices, real GL would read out of
 *            bounds and so would we; we cannot infer it. Upload only the span
 *            referenced by GL, without padding after the final attribute.
 *
 * PER-FRAME COST
 * --------------
 * Per glDrawElements call:
 *   - index scan: count reads (2 bytes each for GL_UNSIGNED_SHORT).
 *   - index upload: count*2 bytes.
 *   - vertex upload: stride * max_index + attribute width per enabled attribute,
 *     or one upload if all attributes are interleaved in one array (the common
 *     case, and detected here so the buffer is uploaded once).
 * With only 2 draw-call sites in the whole binary, the dominant term is the
 * per-frame vertex volume, not call overhead. The scan is the part that scales
 * with geometry and is the thing to profile first.
 *
 * ASSUMPTION ON RECORD: draw-call sites == 2.
 * Both are glDrawElements (0x00a189f0 and 0x00a67e41); glDrawArrays has zero
 * references. That is measured over the whole of .text at the CURRENT lift
 * coverage. If coverage grows and more draw sites appear, the per-call
 * overhead argument weakens and the index scan may need caching (keyed on the
 * index pointer + count, invalidated by any write into that range). Re-run
 *     python scripts/recomp/host/gl_legacy_audit.py
 * and check `constantArguments.glDrawElements` before relying on "only 2".
 */

#include "isaac_host.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#ifdef __EMSCRIPTEN__
#include <GLES3/gl3.h>
#else
/* Host-test build: the logic is exercised without a GL context. */
typedef unsigned int GLenum; typedef unsigned int GLuint; typedef int GLint;
typedef int GLsizei; typedef unsigned char GLboolean; typedef long GLintptr;
typedef long GLsizeiptr; typedef void GLvoid;
#define GL_ARRAY_BUFFER 0x8892
#define GL_ELEMENT_ARRAY_BUFFER 0x8893
#define GL_STREAM_DRAW 0x88E0
#define GL_STATIC_DRAW 0x88E4
#define GL_UNSIGNED_BYTE 0x1401
#define GL_UNSIGNED_SHORT 0x1403
#define GL_UNSIGNED_INT 0x1405
#define GL_FLOAT 0x1406
#define GL_BYTE 0x1400
#define GL_SHORT 0x1402
#define GL_INT 0x1404
#define GL_HALF_FLOAT 0x140B
#define GL_INT_2_10_10_10_REV 0x8D9F
#define GL_UNSIGNED_INT_2_10_10_10_REV 0x8368
extern void glGenBuffers(GLsizei, GLuint *);
extern void glBindBuffer(GLenum, GLuint);
extern void glBufferData(GLenum, GLsizeiptr, const void *, GLenum);
extern void glVertexAttribPointer(GLuint, GLint, GLenum, GLboolean, GLsizei,
                                  const void *);
extern void glDrawElements(GLenum, GLsizei, GLenum, const void *);
extern void glDrawArrays(GLenum, GLint, GLsizei);
extern void glEnableVertexAttribArray(GLuint);
extern void glDisableVertexAttribArray(GLuint);
#endif

#define ISAAC_MAX_ATTRIBS 16

typedef struct {
    int      enabled;
    int      configured;
    GLint    size;          /* 1..4 components                         */
    GLenum   type;
    GLboolean normalized;
    GLsizei  stride;        /* 0 means tightly packed                  */
    uint32_t client_ptr;    /* guest VA, or 0 if a real VBO was bound  */
    uint32_t width;         /* bytes occupied by one attribute value   */
} attrib_state;

static attrib_state g_attribs[ISAAC_MAX_ATTRIBS];
/* Round 39: the staging buffers are rings. Every draw used to glBufferSubData
 * its vertices and indices at offset 0 of one VBO and one IBO -- on top of the
 * bytes the previous draw, still queued on the GPU, was reading. ANGLE keeps
 * that correct with a copy or a stall per upload, and the browser profile
 * charged 3.2% of a throttled frame to bufferSubData for 47 draws. A ring
 * appends instead: a write never lands on bytes a queued draw still reads;
 * when the remainder cannot hold a request the storage is orphaned with
 * glBufferData(NULL) (the driver hands out fresh memory and the old block
 * dies with the draws that read it). 4 MB holds ~90 frames of the menus'
 * 45 KB a frame. The head is reported by isaac_gl_ring_head() for the
 * selftest. */
typedef struct { GLuint buf; uint32_t cap, head, orphans, gen; } gl_ring;   /* gen: bumps when the storage is replaced */
/* Round 48: the engine draws quads with the same six-index pattern over and
 * over; an index block identical to the last one uploaded is drawn from the
 * ring offset it already has, as long as that storage is still the one it
 * went into (the ring's generation). */
#define IDX_KEEP 4096
static uint8_t g_idx_last[IDX_KEEP];
static uint32_t g_idx_len, g_idx_at, g_idx_gen, g_idx_reuse;
static int g_idx_valid;

/* Round 53: the canonical quad index buffer. The engine draws its sprites as
 * quads through the client-array path, and a draw's index block is almost
 * always the standard pattern -- six indices per quad over four vertices, the
 * same six offsets repeated with +4 per quad -- so every such block is a
 * prefix of one fixed sequence. One static ELEMENT_ARRAY_BUFFER holding that
 * sequence serves all of them at offset 0: no upload, no ring space, no
 * compare. The six offsets are learnt from the first block whose offsets are
 * all below 4 (the engine's winding, whatever it is); a block that is not the
 * pattern goes through the ring as before. ISAAC_GL_QUAD_IBO=0 turns it off
 * (the A/B); the census counts the draws each way. */
#define QUAD_IBO_MIN_QUADS 4096u
static GLuint g_quad_ibo[2];              /* [0] GL_UNSIGNED_SHORT, [1] GL_UNSIGNED_INT */
static uint32_t g_quad_quads[2];          /* quads the buffer holds */
static uint32_t g_quad_pat[6];
static int g_quad_pat_set, g_quad_mode = -1;
static uint32_t g_quad_draws, g_quad_other;
static GLuint g_bound_ibo;                /* what ELEMENT_ARRAY_BUFFER holds: the ring's or the quad buffer */

static int quad_mode(void) {
    if (g_quad_mode < 0) { const char *e = getenv("ISAAC_GL_QUAD_IBO"); g_quad_mode = (e && *e == '0') ? 0 : 1; }
    return g_quad_mode;
}
static uint32_t idx_at(const uint8_t *src, uint32_t type, uint32_t i) {
    if (type == GL_UNSIGNED_SHORT) { uint16_t v; memcpy(&v, src + i * 2u, 2); return v; }
    { uint32_t v; memcpy(&v, src + i * 4u, 4); return v; }
}
/* the block is the canonical pattern's prefix (the pattern is learnt from the first block whose six offsets are all below 4) */
static int is_quad_block(const uint8_t *src, int count, uint32_t type) {
    int q, i;
    if (count < 6 || (count % 6) != 0 || (type != GL_UNSIGNED_SHORT && type != GL_UNSIGNED_INT)) return 0;
    if (!g_quad_pat_set) {
        uint32_t p[6];
        for (i = 0; i < 6; ++i) { p[i] = idx_at(src, type, (uint32_t)i); if (p[i] > 3u) return 0; }
        memcpy(g_quad_pat, p, sizeof p);
        g_quad_pat_set = 1;
    }
    for (q = 0; q < count / 6; ++q)
        for (i = 0; i < 6; ++i)
            if (idx_at(src, type, (uint32_t)(q * 6 + i)) != g_quad_pat[i] + 4u * (uint32_t)q) return 0;
    return 1;
}
/* the static buffer for `type` holds at least `quads` quads (grown by doubling, bound on return) */
static int quad_ibo_ready(uint32_t type, uint32_t quads) {
    int k = type == GL_UNSIGNED_INT ? 1 : 0;
    uint32_t limit = k ? (1u << 24) : 65536u / 4u;          /* the index type's reach (16 M quads is plenty) */
    if (quads > limit) return 0;
    if (!g_quad_ibo[k] || g_quad_quads[k] < quads) {
        uint32_t n = g_quad_quads[k] ? g_quad_quads[k] * 2u : QUAD_IBO_MIN_QUADS, q, bytes;
        uint8_t *buf;
        while (n < quads) n *= 2u;
        if (n > limit) n = limit;
        bytes = n * 6u * (k ? 4u : 2u);
        buf = (uint8_t *)malloc(bytes);
        if (!buf) return 0;
        for (q = 0; q < n; ++q) {
            int i;
            for (i = 0; i < 6; ++i) {
                uint32_t v = g_quad_pat[i] + 4u * q;
                if (k) memcpy(buf + (q * 6u + (uint32_t)i) * 4u, &v, 4);
                else { uint16_t s = (uint16_t)v; memcpy(buf + (q * 6u + (uint32_t)i) * 2u, &s, 2); }
            }
        }
        if (!g_quad_ibo[k]) glGenBuffers(1, &g_quad_ibo[k]);
        glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, g_quad_ibo[k]);
        g_bound_ibo = g_quad_ibo[k];
        glBufferData(GL_ELEMENT_ARRAY_BUFFER, (GLsizeiptr)bytes, buf, GL_STATIC_DRAW);
        free(buf);
        g_quad_quads[k] = n;
    }
    if (g_bound_ibo != g_quad_ibo[k]) { glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, g_quad_ibo[k]); g_bound_ibo = g_quad_ibo[k]; }
    return 1;
}
void isaac_gl_quad_census(uint32_t *quad_draws, uint32_t *other_blocks, uint32_t *pattern) {
    if (quad_draws) *quad_draws = g_quad_draws;
    if (other_blocks) *other_blocks = g_quad_other;
    if (pattern) memcpy(pattern, g_quad_pat, sizeof g_quad_pat);
}
static gl_ring g_vring, g_iring;
#define RING_VERTEX_BYTES (4u << 20)
#define RING_INDEX_BYTES  (1u << 20)

/* Round 107: the attribute state WebGL is sent only when it changes. In the
 * heavy room 61% of all WebGL calls per frame were attribute churn: the engine
 * enables its arrays before each draw and disables them after (634 calls),
 * ring_put bound the one vertex ring before every upload (107, all redundant),
 * and every draw re-pointed its attributes at its own ring offset (317).
 *   - glBindBuffer(ARRAY_BUFFER) is issued only when the ring's buffer is not
 *     the one bound (g_bound_vbo; ELEMENT_ARRAY_BUFFER already had g_bound_ibo);
 *   - enable/disable are recorded, and at the draw only the difference between
 *     the set the engine asked for and the set WebGL has is sent -- attribute
 *     arrays are read by draws alone, so a draw sees exactly the same state;
 *   - glVertexAttribPointer is skipped when the attribute already points there.
 * Mode 2 also keeps the pointers still across draws: a draw whose attributes
 * have the layout the pointers already describe is uploaded at a ring offset a
 * whole number of 4-vertex groups past the pointers' base, and drawn from that
 * vertex on -- glDrawArrays' first + v0, or the static quad index buffer from
 * quad v0/4 (its indices are the same pattern +4 per quad). Any other draw (a
 * ring index block, another layout, a ring that wrapped) points the attributes
 * at its own data, which becomes the new base. The same bytes are drawn the
 * same way; only where WebGL finds them changes.
 * ISAAC_GL_ATTR=0 is the previous behaviour, =1 the bind and enable filters
 * and the pointer cache, =2 (default) adds the still pointers. */
static int g_attr_mode = -1;
static int attr_mode(void) {
    if (g_attr_mode < 0) {
        const char *e = getenv("ISAAC_GL_ATTR");
        g_attr_mode = (e && *e >= '0' && *e <= '2') ? *e - '0' : 2;
        if (g_attr_mode != 2) isaac_log("[isaac][gl] ISAAC_GL_ATTR=%d", g_attr_mode);
    }
    return g_attr_mode;
}
static GLuint g_bound_vbo;                          /* what ARRAY_BUFFER holds */
static uint8_t g_gl_attr_on[ISAAC_MAX_ATTRIBS];     /* what WebGL has enabled (a new context: none) */
typedef struct { GLint size; GLenum type; GLboolean normalized; GLsizei stride; uint32_t off; GLuint buf; int set; } gl_ptr;
static gl_ptr g_gl_ptr[ISAAC_MAX_ATTRIBS];          /* what each attribute points at */
/* the still pointers' base: the ring offset of vertex 0 and the layout it was set for */
typedef struct { int valid; uint32_t gen, base, mask; GLsizei stride; uint32_t rel[ISAAC_MAX_ATTRIBS]; } gl_seg;
static gl_seg g_seg;
static uint32_t g_skip_bind, g_skip_ptr, g_sent_ptr, g_sent_enable, g_seg_draws, g_seg_moves;

/* a glEnable/DisableVertexAttribArray the draw applies (1), or one the caller sends now (0) */
int isaac_gl_attr_deferred(GLuint index) { return attr_mode() >= 1 && index < ISAAC_MAX_ATTRIBS; }

static void bind_array_buffer(GLuint buf) {
    if (attr_mode() >= 1 && g_bound_vbo == buf) { ++g_skip_bind; return; }
    glBindBuffer(GL_ARRAY_BUFFER, buf);
    g_bound_vbo = buf;
}
/* at a draw: the engine's enable set, sent as the difference */
static void sync_enables(void) {
    if (attr_mode() < 1) return;
    for (unsigned i = 0; i < ISAAC_MAX_ATTRIBS; ++i) {
        uint8_t want = (uint8_t)(g_attribs[i].enabled != 0);
        if (g_gl_attr_on[i] == want) continue;
        g_gl_attr_on[i] = want;
        ++g_sent_enable;
        if (want) glEnableVertexAttribArray(i); else glDisableVertexAttribArray(i);
    }
}
static unsigned type_size(GLenum t);
static void point_attrib(unsigned i, const attrib_state *a, uint32_t off) {
    gl_ptr *p = &g_gl_ptr[i];
    if (attr_mode() >= 1 && p->set && p->size == a->size && p->type == a->type && p->normalized == a->normalized
        && p->stride == a->stride && p->off == off && p->buf == g_bound_vbo) { ++g_skip_ptr; return; }
    p->size = a->size; p->type = a->type; p->normalized = a->normalized; p->stride = a->stride;
    p->off = off; p->buf = g_bound_vbo;
    /* a call WebGL rejects changes nothing: remember only what it accepts */
    switch (a->type) {
    case GL_BYTE: case GL_UNSIGNED_BYTE: case GL_SHORT: case GL_UNSIGNED_SHORT: case GL_INT: case GL_UNSIGNED_INT:
    case GL_FLOAT: case GL_HALF_FLOAT: case GL_INT_2_10_10_10_REV: case GL_UNSIGNED_INT_2_10_10_10_REV:
        p->set = a->size >= 1 && a->size <= 4 && a->stride >= 0 && a->stride <= 255
              && off % type_size(a->type) == 0 && (uint32_t)a->stride % type_size(a->type) == 0; break;
    default: p->set = 0; break;
    }
    ++g_sent_ptr;
    glVertexAttribPointer(i, a->size, a->type, a->normalized, a->stride, (const void *)(uintptr_t)off);
}

/* stats, reported by isaac_gl_report() -- this is a hot path, so it is
 * measured rather than guessed at. */
static uint64_t g_draws, g_indices_scanned, g_vertex_bytes, g_index_bytes;

static unsigned type_size(GLenum t) {
    switch (t) {
    case GL_BYTE: case GL_UNSIGNED_BYTE:   return 1;
    case GL_SHORT: case GL_UNSIGNED_SHORT: case GL_HALF_FLOAT: return 2;
    case GL_INT: case GL_UNSIGNED_INT: case GL_FLOAT: return 4;
    default: return 4;
    }
}

void isaac_gl_reset_state(void) {
    memset(g_attribs, 0, sizeof g_attribs);
    memset(&g_vring, 0, sizeof g_vring);
    memset(&g_iring, 0, sizeof g_iring);
    g_idx_valid = 0;
    g_bound_vbo = 0;
    memset(g_gl_attr_on, 0, sizeof g_gl_attr_on);
    memset(g_gl_ptr, 0, sizeof g_gl_ptr);
    memset(&g_seg, 0, sizeof g_seg);
}

static void ensure_buffers(void) {
    if (!g_vring.buf) glGenBuffers(1, &g_vring.buf);
    if (!g_iring.buf) glGenBuffers(1, &g_iring.buf);
}

/* Append `bytes` (from `src`, or reserve them when src is NULL) to a ring and
 * return the offset they occupy. Requests are 16-byte aligned so any
 * attribute offset stays aligned to its type. */
static uint32_t ring_put(GLenum target, gl_ring *r, uint32_t initial,
                         const void *src, uint32_t bytes) {
    uint32_t need = (bytes + 15u) & ~15u;
    if (target == GL_ARRAY_BUFFER) bind_array_buffer(r->buf);          /* round 107: only when it is not bound */
    else if (attr_mode() >= 1 && target == GL_ELEMENT_ARRAY_BUFFER && g_bound_ibo == r->buf) ++g_skip_bind;
    else glBindBuffer(target, r->buf);
    if (r->cap < need) {                       /* a single draw bigger than the ring: grow it */
        r->cap = need + need / 2;
        if (r->cap < initial) r->cap = initial;
        glBufferData(target, (GLsizeiptr)r->cap, 0, GL_STREAM_DRAW);
        r->head = 0; ++r->gen;
    } else if (r->head + need > r->cap) {      /* wrap: orphan, never overwrite */
        glBufferData(target, (GLsizeiptr)r->cap, 0, GL_STREAM_DRAW);
        r->head = 0; ++r->gen;
        ++r->orphans;
    }
    uint32_t off = r->head;
#ifdef __EMSCRIPTEN__
    if (src) glBufferSubData(target, (GLintptr)off, (GLsizeiptr)bytes, src);
#else
    (void)src;
#endif
    r->head += need;
    return off;
}
uint32_t isaac_gl_ring_head(int which) { return which ? g_iring.head : g_vring.head; }
uint32_t isaac_gl_ring_orphans(int which) { return which ? g_iring.orphans : g_vring.orphans; }

/* ------------------------------------------------------- intercepted API -- */

void isaac_gl_enable_vertex_attrib_array(GLuint index) {
    if (index < ISAAC_MAX_ATTRIBS) g_attribs[index].enabled = 1;
}

void isaac_gl_disable_vertex_attrib_array(GLuint index) {
    if (index < ISAAC_MAX_ATTRIBS) g_attribs[index].enabled = 0;
}

void isaac_gl_vertex_attrib_pointer(GLuint index, GLint size, GLenum type,
                                    GLboolean normalized, GLsizei stride,
                                    uint32_t pointer_va) {
    if (index >= ISAAC_MAX_ATTRIBS) {
        isaac_log("[isaac][gl] attrib index %u >= %d; ignoring", index,
                  ISAAC_MAX_ATTRIBS);
        return;
    }
    attrib_state *a = &g_attribs[index];
    a->configured = 1;
    a->size = size;
    a->type = type;
    a->normalized = normalized;
    a->width = (type == GL_INT_2_10_10_10_REV ||
                type == GL_UNSIGNED_INT_2_10_10_10_REV)
        ? 4u : (uint32_t)size * type_size(type);
    a->stride = stride ? stride : (GLsizei)a->width;
    a->client_ptr = pointer_va;
    /* Deliberately NOT forwarded to glVertexAttribPointer here: with no buffer
     * bound WebGL2 would reject it. The real call is issued at draw time once
     * the data is staged. */
}

/* Scan the client index array for its maximum value. This is the one piece of
 * information GL does not give us and cannot be inferred. */
static uint32_t max_index(uint32_t indices_va, GLsizei count, GLenum type,
                          int *ok) {
    uint32_t maxi = 0;
    *ok = 1;
    switch (type) {
    case GL_UNSIGNED_BYTE: {
        const uint8_t *p = (const uint8_t *)isaac_g(indices_va);
        for (GLsizei i = 0; i < count; ++i) if (p[i] > maxi) maxi = p[i];
        break;
    }
    case GL_UNSIGNED_SHORT: {
        const uint16_t *p = (const uint16_t *)isaac_g(indices_va);
        for (GLsizei i = 0; i < count; ++i) if (p[i] > maxi) maxi = p[i];
        break;
    }
    case GL_UNSIGNED_INT: {
        const uint32_t *p = (const uint32_t *)isaac_g(indices_va);
        for (GLsizei i = 0; i < count; ++i) if (p[i] > maxi) maxi = p[i];
        break;
    }
    default:
        isaac_log("[isaac][gl] glDrawElements: unsupported index type 0x%x", type);
        *ok = 0;
        return 0;
    }
    g_indices_scanned += (uint64_t)count;
    return maxi;
}

static uint32_t attribute_span(const attrib_state *a, uint32_t count) {
    return count ? (count - 1u) * (uint32_t)a->stride + a->width : 0;
}

static uint32_t attribute_offset(uint32_t offset, const attrib_state *a) {
    /* Preserve the source's alignment, including invalid unaligned inputs. */
    return offset + ((a->client_ptr - offset) & (type_size(a->type) - 1u));
}

/* Stage every enabled client attribute and point GL at the staged copy.
 * vertex_count is max_index+1 for indexed draws, or first+count for arrays.
 * Returns v0, the vertex at which the staged vertex 0 sits for the pointers:
 * 0 unless the draw can be shifted (shift_limit > 0: v0 + vertex_count must
 * stay within it) and the pointers already describe its layout (round 107,
 * mode 2: the still pointers above). */
static uint32_t stage_attributes(uint32_t vertex_count, uint32_t shift_limit) {
    /* The common case is a single interleaved array: several attributes with
     * the same stride, pointers a few bytes apart. Detect it so the memory is
     * uploaded once rather than once per attribute. */
    uint32_t base = 0xFFFFFFFFu, top = 0, mask = 0;
    int any = 0, interleaved = 1;
    GLsizei stride0 = 0;
    for (unsigned i = 0; i < ISAAC_MAX_ATTRIBS; ++i) {
        attrib_state *a = &g_attribs[i];
        if (!a->enabled || !a->configured || !a->client_ptr) continue;
        if (!any) { stride0 = a->stride; any = 1; }
        else if (a->stride != stride0) interleaved = 0;
        mask |= 1u << i;
        uint32_t lo = a->client_ptr;
        uint32_t hi = lo + attribute_span(a, vertex_count);
        if (lo < base) base = lo;
        if (hi > top)  top = hi;
    }
    if (!any) return 0;
    /* Keep each source pointer's low bits when rebasing mixed scalar types. */
    if (vertex_count) base &= ~3u;

    if (interleaved && (top - base) <= (uint32_t)stride0 * vertex_count + 256) {
        uint32_t bytes = top - base;
        int still = attr_mode() >= 2 && shift_limit && stride0 > 0 && (stride0 & 3) == 0;
        if (still && g_seg.valid && g_seg.gen == g_vring.gen && g_vring.buf && g_seg.stride == stride0 && g_seg.mask == mask) {
            /* the pointers describe this layout: place the bytes a whole number of
             * 4-vertex groups past their base (4 * stride is a multiple of 16) */
            int same = 1;
            for (unsigned i = 0; i < ISAAC_MAX_ATTRIBS && same; ++i) {
                if (!(mask & (1u << i))) continue;
                const attrib_state *a = &g_attribs[i];
                const gl_ptr *p = &g_gl_ptr[i];
                same = g_seg.rel[i] == a->client_ptr - base && p->set && p->buf == g_vring.buf
                    && p->size == a->size && p->type == a->type && p->normalized == a->normalized
                    && p->stride == a->stride && p->off == g_seg.base + g_seg.rel[i];
            }
            if (same) {
                uint64_t unit = 4u * (uint64_t)(uint32_t)stride0;
                uint64_t k = ((uint64_t)(g_vring.head - g_seg.base) + unit - 1u) / unit;
                uint64_t at = g_seg.base + k * unit;
                if (at + bytes <= g_vring.cap && 4u * k + vertex_count <= shift_limit) {
                    bind_array_buffer(g_vring.buf);
#ifdef __EMSCRIPTEN__
                    glBufferSubData(GL_ARRAY_BUFFER, (GLintptr)at, (GLsizeiptr)bytes, isaac_g(base));
#endif
                    g_vring.head = (uint32_t)at + ((bytes + 15u) & ~15u);
                    g_vertex_bytes += bytes;
                    ++g_seg_draws;
                    return (uint32_t)(4u * k);
                }
            }
        }
        uint32_t at = ring_put(GL_ARRAY_BUFFER, &g_vring, RING_VERTEX_BYTES,
                               isaac_g(base), bytes);
        g_vertex_bytes += bytes;
        for (unsigned i = 0; i < ISAAC_MAX_ATTRIBS; ++i) {
            attrib_state *a = &g_attribs[i];
            if (!a->enabled || !a->configured || !a->client_ptr) continue;
            point_attrib(i, a, at + (a->client_ptr - base));
            g_seg.rel[i] = a->client_ptr - base;
        }
        /* these pointers are the base the next draws of this layout use */
        g_seg.valid = still; g_seg.gen = g_vring.gen; g_seg.base = at; g_seg.mask = mask; g_seg.stride = stride0;
        if (still) ++g_seg_moves;
        return 0;
    }
    g_seg.valid = 0;

    /* Fallback: separate arrays. Upload them back to back into one buffer and
     * hand each attribute its own offset. */
    uint32_t total = 0;
    for (unsigned i = 0; i < ISAAC_MAX_ATTRIBS; ++i) {
        attrib_state *a = &g_attribs[i];
        if (!a->enabled || !a->configured || !a->client_ptr) continue;
        if (vertex_count) total = attribute_offset(total, a);
        total += attribute_span(a, vertex_count);
    }
    uint32_t at = ring_put(GL_ARRAY_BUFFER, &g_vring, RING_VERTEX_BYTES, 0, total);
    uint32_t off = 0;
    for (unsigned i = 0; i < ISAAC_MAX_ATTRIBS; ++i) {
        attrib_state *a = &g_attribs[i];
        if (!a->enabled || !a->configured || !a->client_ptr) continue;
        if (vertex_count) off = attribute_offset(off, a);
        uint32_t bytes = attribute_span(a, vertex_count);
#ifdef __EMSCRIPTEN__
        glBufferSubData(GL_ARRAY_BUFFER, (GLintptr)(at + off), (GLsizeiptr)bytes,
                        isaac_g(a->client_ptr));
#endif
        point_attrib(i, a, at + off);
        off += bytes;
        g_vertex_bytes += bytes;
    }
    return 0;
}

void isaac_gl_draw_elements(GLenum mode, GLsizei count, GLenum type,
                            uint32_t indices_va) {
    if (count <= 0) return;
    ensure_buffers();

    int ok = 0;
    uint32_t maxi = max_index(indices_va, count, type, &ok);
    if (!ok) return;
    sync_enables();                                  /* round 107: the enable set, as a difference */

    uint32_t ibytes = (uint32_t)count * type_size(type);
    uint32_t iat;
    const uint8_t *isrc = (const uint8_t *)isaac_g(indices_va);
    /* a quad block may be drawn from any quad of the static buffer, so its
     * vertices may sit past the pointers' base (round 107, within the index
     * type's reach); any other index block needs the pointers on its data */
    int quad = quad_mode() && is_quad_block(isrc, count, type);
    uint32_t v0 = stage_attributes(maxi + 1u, quad ? (type == GL_UNSIGNED_INT ? (1u << 26) : 65536u) : 0u);
    int qready = quad && quad_ibo_ready(type, v0 / 4u + (uint32_t)count / 6u);
    if (quad && !qready && v0) {
        g_seg.valid = 0;                             /* the static buffer cannot reach that far: restage on the data */
        v0 = stage_attributes(maxi + 1u, 0u);
        qready = quad_ibo_ready(type, (uint32_t)count / 6u);
    }
    if (qready) {
        /* the static quad indices, from quad v0/4 (from the start when v0 is 0) */
        glDrawElements(mode, count, type, (const void *)(uintptr_t)((v0 / 4u) * 6u * type_size(type)));
        ++g_draws; ++g_quad_draws;
        return;
    }
    if (g_quad_pat_set) ++g_quad_other;
    if (g_idx_valid && ibytes == g_idx_len && ibytes <= IDX_KEEP && g_idx_gen == g_iring.gen && g_iring.buf
        && memcmp(isrc, g_idx_last, ibytes) == 0) {
        iat = g_idx_at; ++g_idx_reuse;               /* the same indices: already in the ring */
        if (g_bound_ibo != g_iring.buf) { glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, g_iring.buf); g_bound_ibo = g_iring.buf; }
    } else {
        iat = ring_put(GL_ELEMENT_ARRAY_BUFFER, &g_iring, RING_INDEX_BYTES, isrc, ibytes);
        g_bound_ibo = g_iring.buf;                   /* ring_put bound it */
        g_index_bytes += ibytes;
        if (ibytes <= IDX_KEEP) { memcpy(g_idx_last, isrc, ibytes); g_idx_len = ibytes; g_idx_at = iat; g_idx_gen = g_iring.gen; g_idx_valid = 1; }
        else g_idx_valid = 0;
    }

    glDrawElements(mode, count, type, (const void *)(uintptr_t)iat);
    ++g_draws;
}

void isaac_gl_draw_arrays(GLenum mode, GLint first, GLsizei count) {
    if (count <= 0) return;
    ensure_buffers();
    sync_enables();                                  /* round 107 */
    /* Exact: no scan needed, the range is stated by the call. The draw may
     * start past the pointers' base (round 107): first + v0. */
    uint32_t v0 = stage_attributes((uint32_t)first + (uint32_t)count, first >= 0 ? (1u << 30) : 0u);
    glDrawArrays(mode, first + (GLint)v0, count);
    ++g_draws;
}

void isaac_gl_draw_arrays_instanced(GLenum mode, GLint first, GLsizei count,
                                    GLsizei prims) {
    if (count <= 0 || prims <= 0) return;
    ensure_buffers();
    sync_enables();                                  /* round 107 */
    uint32_t v0 = stage_attributes((uint32_t)first + (uint32_t)count, first >= 0 ? (1u << 30) : 0u);
#ifdef __EMSCRIPTEN__
    glDrawArraysInstanced(mode, first + (GLint)v0, count, prims);
#else
    (void)v0;
    (void)mode;
#endif
    ++g_draws;
}

void isaac_gl_report(void) {
    isaac_log("[isaac][gl] client-array emulation: %llu draws, %llu indices "
              "scanned, %llu vertex bytes staged, %llu index bytes staged; "
              "rings orphaned %u / %u times (vertex %u KB, index %u KB); %u identical index blocks reused; "
              "%u draws on the static quad index buffer (pattern %u %u %u %u %u %u), %u index blocks not the pattern",
              (unsigned long long)g_draws,
              (unsigned long long)g_indices_scanned,
              (unsigned long long)g_vertex_bytes,
              (unsigned long long)g_index_bytes,
              g_vring.orphans, g_iring.orphans, g_vring.cap >> 10, g_iring.cap >> 10, g_idx_reuse,
              g_quad_draws, g_quad_pat[0], g_quad_pat[1], g_quad_pat[2], g_quad_pat[3], g_quad_pat[4], g_quad_pat[5], g_quad_other);
    isaac_log("[isaac][gl] attribute state (ISAAC_GL_ATTR=%d): %u buffer binds and %u pointers skipped, %u pointers and "
              "%u enable/disable sent; %u draws on the still pointers, %u new bases",
              attr_mode(), g_skip_bind, g_skip_ptr, g_sent_ptr, g_sent_enable, g_seg_draws, g_seg_moves);
}
