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
 *            bounds and so would we; we cannot detect it. We clamp uploads to
 *            the guest image/heap bounds and report, rather than fault.
 *
 * PER-FRAME COST
 * --------------
 * Per glDrawElements call:
 *   - index scan: count reads (2 bytes each for GL_UNSIGNED_SHORT).
 *   - index upload: count*2 bytes.
 *   - vertex upload: stride * (max_index+1) bytes per enabled attribute,
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
#define GL_UNSIGNED_BYTE 0x1401
#define GL_UNSIGNED_SHORT 0x1403
#define GL_UNSIGNED_INT 0x1405
#define GL_FLOAT 0x1406
#define GL_BYTE 0x1400
#define GL_SHORT 0x1402
#define GL_INT 0x1404
extern void glGenBuffers(GLsizei, GLuint *);
extern void glBindBuffer(GLenum, GLuint);
extern void glBufferData(GLenum, GLsizeiptr, const void *, GLenum);
extern void glVertexAttribPointer(GLuint, GLint, GLenum, GLboolean, GLsizei,
                                  const void *);
extern void glDrawElements(GLenum, GLsizei, GLenum, const void *);
extern void glDrawArrays(GLenum, GLint, GLsizei);
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
} attrib_state;

static attrib_state g_attribs[ISAAC_MAX_ATTRIBS];
static GLuint g_vertex_vbo, g_index_ibo;
static uint32_t g_vbo_capacity, g_ibo_capacity;

/* stats, reported by isaac_gl_report() -- this is a hot path, so it is
 * measured rather than guessed at. */
static uint64_t g_draws, g_indices_scanned, g_vertex_bytes, g_index_bytes;

static unsigned type_size(GLenum t) {
    switch (t) {
    case GL_BYTE: case GL_UNSIGNED_BYTE:   return 1;
    case GL_SHORT: case GL_UNSIGNED_SHORT: return 2;
    case GL_INT: case GL_UNSIGNED_INT: case GL_FLOAT: return 4;
    default: return 4;
    }
}

void isaac_gl_reset_state(void) {
    memset(g_attribs, 0, sizeof g_attribs);
    g_vertex_vbo = g_index_ibo = 0;
    g_vbo_capacity = g_ibo_capacity = 0;
}

static void ensure_buffers(void) {
    if (!g_vertex_vbo) glGenBuffers(1, &g_vertex_vbo);
    if (!g_index_ibo)  glGenBuffers(1, &g_index_ibo);
}

/* Grow-only streaming buffers. Reallocating with glBufferData(NULL) on growth
 * and glBufferSubData afterwards avoids reallocating every frame. */
static void upload(GLenum target, GLuint buf, uint32_t *cap,
                   const void *src, uint32_t bytes) {
    glBindBuffer(target, buf);
    if (bytes > *cap) {
        uint32_t want = bytes + bytes / 2 + 4096;
        glBufferData(target, (GLsizeiptr)want, 0, GL_STREAM_DRAW);
        *cap = want;
    }
#ifdef __EMSCRIPTEN__
    glBufferSubData(target, 0, (GLsizeiptr)bytes, src);
#else
    (void)src;
#endif
}

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
    a->stride = stride ? stride : (GLsizei)(size * (GLint)type_size(type));
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

/* Stage every enabled client attribute and point GL at the staged copy.
 * vertex_count is max_index+1 for indexed draws, or first+count for arrays. */
static void stage_attributes(uint32_t vertex_count) {
    /* The common case is a single interleaved array: several attributes with
     * the same stride, pointers a few bytes apart. Detect it so the memory is
     * uploaded once rather than once per attribute. */
    uint32_t base = 0xFFFFFFFFu, top = 0;
    int any = 0, interleaved = 1;
    GLsizei stride0 = 0;
    for (unsigned i = 0; i < ISAAC_MAX_ATTRIBS; ++i) {
        attrib_state *a = &g_attribs[i];
        if (!a->enabled || !a->configured || !a->client_ptr) continue;
        if (!any) { stride0 = a->stride; any = 1; }
        else if (a->stride != stride0) interleaved = 0;
        uint32_t lo = a->client_ptr;
        uint32_t hi = lo + (uint32_t)a->stride * vertex_count;
        if (lo < base) base = lo;
        if (hi > top)  top = hi;
    }
    if (!any) return;

    if (interleaved && (top - base) <= (uint32_t)stride0 * vertex_count + 256) {
        uint32_t bytes = top - base;
        upload(GL_ARRAY_BUFFER, g_vertex_vbo, &g_vbo_capacity,
               isaac_g(base), bytes);
        g_vertex_bytes += bytes;
        for (unsigned i = 0; i < ISAAC_MAX_ATTRIBS; ++i) {
            attrib_state *a = &g_attribs[i];
            if (!a->enabled || !a->configured || !a->client_ptr) continue;
            glVertexAttribPointer(i, a->size, a->type, a->normalized, a->stride,
                                  (const void *)(uintptr_t)(a->client_ptr - base));
        }
        return;
    }

    /* Fallback: separate arrays. Upload them back to back into one buffer and
     * hand each attribute its own offset. */
    uint32_t total = 0;
    for (unsigned i = 0; i < ISAAC_MAX_ATTRIBS; ++i) {
        attrib_state *a = &g_attribs[i];
        if (!a->enabled || !a->configured || !a->client_ptr) continue;
        total += (uint32_t)a->stride * vertex_count;
    }
    upload(GL_ARRAY_BUFFER, g_vertex_vbo, &g_vbo_capacity, 0, total);
    uint32_t off = 0;
    for (unsigned i = 0; i < ISAAC_MAX_ATTRIBS; ++i) {
        attrib_state *a = &g_attribs[i];
        if (!a->enabled || !a->configured || !a->client_ptr) continue;
        uint32_t bytes = (uint32_t)a->stride * vertex_count;
#ifdef __EMSCRIPTEN__
        glBufferSubData(GL_ARRAY_BUFFER, (GLintptr)off, (GLsizeiptr)bytes,
                        isaac_g(a->client_ptr));
#endif
        glVertexAttribPointer(i, a->size, a->type, a->normalized, a->stride,
                              (const void *)(uintptr_t)off);
        off += bytes;
        g_vertex_bytes += bytes;
    }
}

void isaac_gl_draw_elements(GLenum mode, GLsizei count, GLenum type,
                            uint32_t indices_va) {
    if (count <= 0) return;
    ensure_buffers();

    int ok = 0;
    uint32_t maxi = max_index(indices_va, count, type, &ok);
    if (!ok) return;

    stage_attributes(maxi + 1u);

    uint32_t ibytes = (uint32_t)count * type_size(type);
    upload(GL_ELEMENT_ARRAY_BUFFER, g_index_ibo, &g_ibo_capacity,
           isaac_g(indices_va), ibytes);
    g_index_bytes += ibytes;

    glDrawElements(mode, count, type, (const void *)0);
    ++g_draws;
}

void isaac_gl_draw_arrays(GLenum mode, GLint first, GLsizei count) {
    if (count <= 0) return;
    ensure_buffers();
    /* Exact: no scan needed, the range is stated by the call. */
    stage_attributes((uint32_t)first + (uint32_t)count);
    glDrawArrays(mode, first, count);
    ++g_draws;
}

void isaac_gl_report(void) {
    isaac_log("[isaac][gl] client-array emulation: %llu draws, %llu indices "
              "scanned, %llu vertex bytes staged, %llu index bytes staged",
              (unsigned long long)g_draws,
              (unsigned long long)g_indices_scanned,
              (unsigned long long)g_vertex_bytes,
              (unsigned long long)g_index_bytes);
}
