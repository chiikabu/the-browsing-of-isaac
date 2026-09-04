/* host_gl_webgl.c -- the WEB build's GL backend (round 13c).
 *
 * Every opengl32 entry point the game resolves through wglGetProcAddress is
 * forwarded to the real GLES3 function emscripten binds to the page's WebGL2
 * context (created by wglCreateContext in host_shims_gl.c). The node build
 * keeps the headless fake in host_shims_gl.c; this file compiles only with
 * -DISAAC_WEB=1 (build_boot.py --web).
 *
 * Calling convention on the guest side: __stdcall, arguments on the guest
 * stack (isaac_arg), floats as raw IEEE bits, doubles as two slots, pointers
 * as guest VAs. Guest memory is the wasm heap, so a guest pointer becomes a
 * host pointer with isaac_g() and can be handed to GL directly (input arrays,
 * output arrays, strings).
 *
 * What the census (round 13a, 60 frames) says the game passes, and how it
 * maps:
 *   textures      glTexImage2D(RGBA|RGB, RGBA|RGB, UNSIGNED_BYTE), NEAREST /
 *                 LINEAR filters, CLAMP_TO_EDGE / REPEAT wrap   -> 1:1
 *   targets       renderbuffer DEPTH_COMPONENT24, color attachment 0 texture,
 *                 GL_FRAMEBUFFER_BINDING read back                 -> 1:1
 *   state         BLEND / DEPTH_TEST / CULL_FACE, GREATER, BACK/FRONT,
 *                 FUNC_ADD, (ONE, ONE_MINUS_SRC_ALPHA) premultiplied -> 1:1
 *   geometry      client-side arrays, TRIANGLES + UNSIGNED_SHORT
 *                 -> host_gl_clientarrays.c stages them into VBOs
 *   shaders       23 programs, GLSL ES 1.00 style sources
 *                 (attribute/varying, precision highp) -> 1:1
 *   desktop-only  glClearDepth(double) -> glClearDepthf; glDrawArraysInstancedEXT
 *                 -> glDrawArraysInstanced; NV/ATI/ARB oddities -> no-ops
 * Nothing needed enum translation. Unknown values are still passed through
 * and would surface as GL errors, which isaac_web_present() polls once per
 * frame (glGetError) and logs. */
#ifdef ISAAC_WEB
#include "isaac_host.h"
#include "shim_decls.h"

#include <GLES3/gl3.h>
#include <emscripten.h>
#include <emscripten/html5.h>
#include <stdlib.h>
#include <string.h>

#define A(i)      isaac_arg(cpu, (i))
#define AF(i)     arg_f(cpu, (i))
#define AP(i)     arg_p(cpu, (i))
#define RET0      do { cpu->EAX = 0; return; } while (0)

static float arg_f(CpuState *restrict cpu, unsigned i) {
    uint32_t bits = isaac_arg(cpu, i);
    float f;
    memcpy(&f, &bits, 4);
    return f;
}
static void *arg_p(CpuState *restrict cpu, unsigned i) {
    uint32_t va = isaac_arg(cpu, i);
    return va ? isaac_g(va) : NULL;
}

/* client-array emulation (host_gl_clientarrays.c) */
void isaac_gl_enable_vertex_attrib_array(GLuint index);
void isaac_gl_disable_vertex_attrib_array(GLuint index);
void isaac_gl_vertex_attrib_pointer(GLuint index, GLint size, GLenum type,
                                    GLboolean normalized, GLsizei stride,
                                    uint32_t pointer_va);
void isaac_gl_draw_elements(GLenum mode, GLsizei count, GLenum type, uint32_t indices_va);
void isaac_gl_draw_arrays_instanced(GLenum mode, GLint first, GLsizei count, GLsizei prims);
int  isaac_web_gl_ready(void);

static uint32_t g_gl_calls, g_gl_errors;
static uint32_t g_present_count;

/* ---- context capability answers the shared shim delegates here ---------- */
void isaac_web_get_integerv(uint32_t pname, uint32_t out) {
    GLint v[4] = {0, 0, 0, 0};
    if (isaac_web_gl_ready()) glGetIntegerv((GLenum)pname, v);
    if (isaac_is_guest_va(out)) isaac_w32(out, (uint32_t)v[0]);
    if (pname == 0x0D3Au && isaac_is_guest_va(out + 4)) isaac_w32(out + 4, (uint32_t)v[1]);
}

/* ---- frame presentation --------------------------------------------------- */
EM_JS(void, isaac_present_js, (const uint8_t *px, int w, int h), {
    if (typeof Module.isaacPresent === "function") Module.isaacPresent(px, w, h);
});
/* The canvas already shows every frame; the readback exists only so the
 * runner can keep PNGs. Reading a 960x540 frame back is 2 MB through
 * glReadPixels, which stalls the GL pipeline, so ask the page first and skip
 * the whole thing for the frames it does not want (round 17). A page that
 * defines no hook keeps the old behaviour and gets every frame. */
EM_JS(int, isaac_wants_frame_js, (unsigned n), {
    if (typeof Module.isaacWantsFrame !== "function") return 1;
    try { return Module.isaacWantsFrame(n) ? 1 : 0; } catch (e) { return 1; }
});
static uint8_t *g_present_buf;
static uint32_t g_present_cap;
void isaac_web_present(void) {
    if (!isaac_web_gl_ready()) return;
    ++g_present_count;
    GLenum err;
    while ((err = glGetError()) != GL_NO_ERROR) {
        ++g_gl_errors;
        if (g_gl_errors <= 20)
            isaac_log("[isaac][gl] GL error 0x%x pending at present #%u", err, g_present_count);
    }
    if (!isaac_wants_frame_js(g_present_count)) return;   /* no PNG wanted: no readback */
    int w = 0, h = 0;
    emscripten_webgl_get_drawing_buffer_size(emscripten_webgl_get_current_context(), &w, &h);
    if (w <= 0 || h <= 0) return;
    uint32_t need = (uint32_t)w * (uint32_t)h * 4u;
    if (need > g_present_cap) {
        free(g_present_buf);
        g_present_buf = (uint8_t *)malloc(need);
        g_present_cap = g_present_buf ? need : 0;
    }
    if (!g_present_buf) return;
    GLint prev = 0;
    glGetIntegerv(GL_FRAMEBUFFER_BINDING, &prev);
    glBindFramebuffer(GL_FRAMEBUFFER, 0);
    glReadPixels(0, 0, w, h, GL_RGBA, GL_UNSIGNED_BYTE, g_present_buf);
    glBindFramebuffer(GL_FRAMEBUFFER, (GLuint)prev);
    isaac_present_js(g_present_buf, w, h);
}
void isaac_web_gl_report(void) {
    isaac_log("[isaac][gl] web backend: %u GL calls, %u GL errors, %u frames presented",
              g_gl_calls, g_gl_errors, g_present_count);
}

/* ---- the entry points ------------------------------------------------------ */
/* ISAAC_GL_CHECK=1: glGetError after every forwarded call, naming it. */
static int gl_check_mode(void) {
    static int v = -1;
    if (v < 0) { const char *e = getenv("ISAAC_GL_CHECK"); v = (e && *e && *e != '0') ? 1 : 0; }
    return v;
}
static void gl_check(const char *fn) {
    if (!gl_check_mode()) return;
    GLenum err;
    while ((err = glGetError()) != GL_NO_ERROR) {
        ++g_gl_errors;
        if (g_gl_errors <= 50) isaac_log("[isaac][gl] %s -> GL error 0x%x", fn, err);
    }
}
#define GLFN(name) void imp_opengl32__##name(CpuState *restrict cpu)
#define ENTER      const char *gl_fn_name = __func__; do { ++g_gl_calls; } while (0)
#undef RET0
#define RET0       do { gl_check(gl_fn_name); cpu->EAX = 0; return; } while (0)
#define RETV(v)    do { cpu->EAX = (uint32_t)(v); gl_check(gl_fn_name); return; } while (0)

/* Shader types by name, for the precision default below. */
#define GL_SHADER_NAMES 4096
static uint8_t g_shader_is_frag[GL_SHADER_NAMES];

GLFN(glClear)                { ENTER; glClear(A(0)); RET0; }
GLFN(glActiveTexture)        { ENTER; glActiveTexture(A(0)); RET0; }
GLFN(glAttachShader)         { ENTER; glAttachShader(A(0), A(1)); RET0; }
GLFN(glBindFramebuffer)      { ENTER; glBindFramebuffer(A(0), A(1)); RET0; }
GLFN(glBindRenderbuffer)     { ENTER; glBindRenderbuffer(A(0), A(1)); RET0; }
GLFN(glBindTexture)          { ENTER; glBindTexture(A(0), A(1)); RET0; }
GLFN(glBlendEquation)        { ENTER; glBlendEquation(A(0)); RET0; }
GLFN(glBlendFuncSeparate)    { ENTER; glBlendFuncSeparate(A(0), A(1), A(2), A(3)); RET0; }
GLFN(glCheckFramebufferStatus) { ENTER; RETV(glCheckFramebufferStatus(A(0))); }
GLFN(glClampColorARB)        { ENTER; RET0; }
GLFN(glClearColor)           { ENTER; glClearColor(AF(0), AF(1), AF(2), AF(3)); RET0; }
GLFN(glClearDepth) {
    ENTER;
    uint32_t lo = A(0), hi = A(1);
    uint64_t bits = ((uint64_t)hi << 32) | lo;
    double d;
    memcpy(&d, &bits, 8);
    glClearDepthf((float)d);
    RET0;
}
GLFN(glCompileShader)        { ENTER; glCompileShader(A(0)); RET0; }
GLFN(glCreateProgram)        { ENTER; RETV(glCreateProgram()); }
GLFN(glCreateShader) {
    ENTER;
    GLuint sh = glCreateShader(A(0));
    if (sh < GL_SHADER_NAMES) g_shader_is_frag[sh] = (A(0) == 0x8B30u);
    RETV(sh);
}
GLFN(glCullFace)             { ENTER; glCullFace(A(0)); RET0; }
GLFN(glDeleteFramebuffers)   { ENTER; glDeleteFramebuffers((GLsizei)A(0), (const GLuint *)AP(1)); RET0; }
GLFN(glDeleteProgram)        { ENTER; glDeleteProgram(A(0)); RET0; }
GLFN(glDeleteRenderbuffers)  { ENTER; glDeleteRenderbuffers((GLsizei)A(0), (const GLuint *)AP(1)); RET0; }
GLFN(glDeleteShader)         { ENTER; glDeleteShader(A(0)); RET0; }
GLFN(glDeleteTextures)       { ENTER; glDeleteTextures((GLsizei)A(0), (const GLuint *)AP(1)); RET0; }
GLFN(glDepthFunc)            { ENTER; glDepthFunc(A(0)); RET0; }
GLFN(glDisable)              { ENTER; glDisable(A(0)); RET0; }
GLFN(glDisableVertexAttribArray) {
    ENTER;
    isaac_gl_disable_vertex_attrib_array(A(0));
    glDisableVertexAttribArray(A(0));
    RET0;
}
GLFN(glDrawArraysInstancedEXT) {
    ENTER;
    isaac_gl_draw_arrays_instanced(A(0), (GLint)A(1), (GLsizei)A(2), (GLsizei)A(3));
    RET0;
}
GLFN(glDrawElements) {
    ENTER;
    isaac_gl_draw_elements(A(0), (GLsizei)A(1), A(2), A(3));
    RET0;
}
GLFN(glEnable)               { ENTER; glEnable(A(0)); RET0; }
GLFN(glEnableVertexAttribArray) {
    ENTER;
    isaac_gl_enable_vertex_attrib_array(A(0));
    glEnableVertexAttribArray(A(0));
    RET0;
}
GLFN(glFramebufferRenderbuffer) { ENTER; glFramebufferRenderbuffer(A(0), A(1), A(2), A(3)); RET0; }
GLFN(glFramebufferTexture2D) { ENTER; glFramebufferTexture2D(A(0), A(1), A(2), A(3), (GLint)A(4)); RET0; }
GLFN(glGenFramebuffers)      { ENTER; glGenFramebuffers((GLsizei)A(0), (GLuint *)AP(1)); RET0; }
GLFN(glGenRenderbuffers)     { ENTER; glGenRenderbuffers((GLsizei)A(0), (GLuint *)AP(1)); RET0; }
GLFN(glGenTextures)          { ENTER; glGenTextures((GLsizei)A(0), (GLuint *)AP(1)); RET0; }
GLFN(glGetAttribLocation)    { ENTER; RETV(glGetAttribLocation(A(0), (const GLchar *)AP(1))); }
GLFN(glGetCombinerInputParameterivNV) { ENTER; RET0; }
GLFN(glGetProgramInfoLog)    { ENTER; glGetProgramInfoLog(A(0), (GLsizei)A(1), (GLsizei *)AP(2), (GLchar *)AP(3)); RET0; }
GLFN(glGetProgramiv)         { ENTER; glGetProgramiv(A(0), A(1), (GLint *)AP(2)); RET0; }
GLFN(glGetRenderbufferParameteriv) { ENTER; glGetRenderbufferParameteriv(A(0), A(1), (GLint *)AP(2)); RET0; }
GLFN(glGetShaderInfoLog)     { ENTER; glGetShaderInfoLog(A(0), (GLsizei)A(1), (GLsizei *)AP(2), (GLchar *)AP(3)); RET0; }
GLFN(glGetShaderiv)          { ENTER; glGetShaderiv(A(0), A(1), (GLint *)AP(2)); RET0; }
GLFN(glGetUniformLocation)   { ENTER; RETV(glGetUniformLocation(A(0), (const GLchar *)AP(1))); }
GLFN(glLinkProgram) {
    ENTER;
    GLuint prog = A(0);
    glLinkProgram(prog);
    GLint ok = 0;
    glGetProgramiv(prog, GL_LINK_STATUS, &ok);
    if (!ok) {
        char buf[512];
        GLsizei n = 0;
        glGetProgramInfoLog(prog, (GLsizei)sizeof buf - 1, &n, buf);
        buf[n < 0 ? 0 : n] = 0;
        isaac_log("[isaac][gl] program %u failed to link: %s", prog, buf);
    }
    RET0;
}
GLFN(glMultiDrawArraysIndirectEXT) { ENTER; RET0; }
GLFN(glProgramUniform1ivEXT) { ENTER; RET0; }
GLFN(glReadPixels) {
    ENTER;
    glReadPixels((GLint)A(0), (GLint)A(1), (GLsizei)A(2), (GLsizei)A(3), A(4), A(5), AP(6));
    RET0;
}
GLFN(glRenderbufferStorage)  { ENTER; glRenderbufferStorage(A(0), A(1), (GLsizei)A(2), (GLsizei)A(3)); RET0; }
GLFN(glShaderSource) {
    ENTER;
    GLuint shader = A(0);
    GLsizei count = (GLsizei)A(1);
    uint32_t strings_va = A(2), lengths_va = A(3);
    if (count <= 0 || count > 64 || !isaac_is_guest_va(strings_va)) RET0;
    /* Concatenate the pieces into one host string so a GLSL ES header can be
     * prepended: desktop GLSL needs no default precision, GLSL ES rejects a
     * fragment shader without one ("No precision specified for (float)"),
     * and a desktop `#version 1xx` line would be rejected outright. */
    size_t total = 0;
    for (GLsizei i = 0; i < count; i++) {
        uint32_t sva = isaac_r32(strings_va + 4u * (uint32_t)i);
        if (!sva) continue;
        GLint len = lengths_va ? (GLint)isaac_r32(lengths_va + 4u * (uint32_t)i) : -1;
        total += len >= 0 ? (size_t)len : strlen((const char *)isaac_g(sva));
    }
    int frag = shader < GL_SHADER_NAMES && g_shader_is_frag[shader];
    static const char header[] = "precision highp float;\nprecision highp int;\n";
    char *src = (char *)malloc(total + sizeof header + 16);
    if (!src) RET0;
    size_t off = 0;
    if (frag) { memcpy(src, header, sizeof header - 1); off = sizeof header - 1; }
    for (GLsizei i = 0; i < count; i++) {
        uint32_t sva = isaac_r32(strings_va + 4u * (uint32_t)i);
        if (!sva) continue;
        GLint len = lengths_va ? (GLint)isaac_r32(lengths_va + 4u * (uint32_t)i) : -1;
        size_t n = len >= 0 ? (size_t)len : strlen((const char *)isaac_g(sva));
        memcpy(src + off, isaac_g(sva), n);
        off += n;
    }
    src[off] = 0;
    /* a source that already declares a precision keeps its own; drop the
     * header again in that case (it would only be redundant, but keep the
     * bytes exactly the game's) */
    const char *body = src;
    if (frag && strstr(src + sizeof header - 1, "precision ")) body = src + sizeof header - 1;
    /* strip a desktop #version line */
    char *ver = strstr((char *)body, "#version");
    if (ver) { char *nl = strchr(ver, '\n'); if (nl) memmove(ver, nl + 1, strlen(nl + 1) + 1); else *ver = 0; }
    const GLchar *one = body;
    glShaderSource(shader, 1, &one, NULL);
    glCompileShader(shader);
    GLint ok = 0;
    glGetShaderiv(shader, GL_COMPILE_STATUS, &ok);
    if (!ok) {
        char buf[512];
        GLsizei n = 0;
        glGetShaderInfoLog(shader, (GLsizei)sizeof buf - 1, &n, buf);
        buf[n < 0 ? 0 : n] = 0;
        isaac_log("[isaac][gl] shader %u (%s) failed to compile: %s", shader,
                  frag ? "fragment" : "vertex", buf);
        isaac_log("[isaac][gl]   source head: %.300s", body);
    }
    free(src);
    RET0;
}
GLFN(glTexImage2D) {
    ENTER;
    glTexImage2D(A(0), (GLint)A(1), (GLint)A(2), (GLsizei)A(3), (GLsizei)A(4), (GLint)A(5),
                 A(6), A(7), AP(8));
    RET0;
}
GLFN(glTexParameteri)        { ENTER; glTexParameteri(A(0), A(1), (GLint)A(2)); RET0; }
GLFN(glTexSubImage2D) {
    ENTER;
    glTexSubImage2D(A(0), (GLint)A(1), (GLint)A(2), (GLint)A(3), (GLsizei)A(4), (GLsizei)A(5),
                    A(6), A(7), AP(8));
    RET0;
}
GLFN(glUniform1fv)           { ENTER; glUniform1fv((GLint)A(0), (GLsizei)A(1), (const GLfloat *)AP(2)); RET0; }
GLFN(glUniform1i)            { ENTER; glUniform1i((GLint)A(0), (GLint)A(1)); RET0; }
GLFN(glUniform1iv)           { ENTER; glUniform1iv((GLint)A(0), (GLsizei)A(1), (const GLint *)AP(2)); RET0; }
GLFN(glUniform1uiv)          { ENTER; glUniform1uiv((GLint)A(0), (GLsizei)A(1), (const GLuint *)AP(2)); RET0; }
GLFN(glUniform2fv)           { ENTER; glUniform2fv((GLint)A(0), (GLsizei)A(1), (const GLfloat *)AP(2)); RET0; }
GLFN(glUniform2iv)           { ENTER; glUniform2iv((GLint)A(0), (GLsizei)A(1), (const GLint *)AP(2)); RET0; }
GLFN(glUniform2uiv)          { ENTER; glUniform2uiv((GLint)A(0), (GLsizei)A(1), (const GLuint *)AP(2)); RET0; }
GLFN(glUniform3fv)           { ENTER; glUniform3fv((GLint)A(0), (GLsizei)A(1), (const GLfloat *)AP(2)); RET0; }
GLFN(glUniform3iv)           { ENTER; glUniform3iv((GLint)A(0), (GLsizei)A(1), (const GLint *)AP(2)); RET0; }
GLFN(glUniform3uiv)          { ENTER; glUniform3uiv((GLint)A(0), (GLsizei)A(1), (const GLuint *)AP(2)); RET0; }
GLFN(glUniform4fv)           { ENTER; glUniform4fv((GLint)A(0), (GLsizei)A(1), (const GLfloat *)AP(2)); RET0; }
GLFN(glUniform4iv)           { ENTER; glUniform4iv((GLint)A(0), (GLsizei)A(1), (const GLint *)AP(2)); RET0; }
GLFN(glUniform4uiv)          { ENTER; glUniform4uiv((GLint)A(0), (GLsizei)A(1), (const GLuint *)AP(2)); RET0; }
#define UMAT(name, fn) GLFN(name) { ENTER; fn((GLint)A(0), (GLsizei)A(1), (GLboolean)A(2), (const GLfloat *)AP(3)); RET0; }
UMAT(glUniformMatrix2fv, glUniformMatrix2fv)
UMAT(glUniformMatrix2x3fv, glUniformMatrix2x3fv)
UMAT(glUniformMatrix2x4fv, glUniformMatrix2x4fv)
UMAT(glUniformMatrix3fv, glUniformMatrix3fv)
UMAT(glUniformMatrix3x2fv, glUniformMatrix3x2fv)
UMAT(glUniformMatrix3x4fv, glUniformMatrix3x4fv)
UMAT(glUniformMatrix4fv, glUniformMatrix4fv)
UMAT(glUniformMatrix4x2fv, glUniformMatrix4x2fv)
UMAT(glUniformMatrix4x3fv, glUniformMatrix4x3fv)
GLFN(glUseProgram)           { ENTER; glUseProgram(A(0)); RET0; }
GLFN(glVertexAttribPointer) {
    ENTER;
    isaac_gl_vertex_attrib_pointer(A(0), (GLint)A(1), A(2), (GLboolean)A(3), (GLsizei)A(4), A(5));
    RET0;
}
GLFN(glVertexStream2fATI)    { ENTER; RET0; }
GLFN(glViewport)             { ENTER; glViewport((GLint)A(0), (GLint)A(1), (GLsizei)A(2), (GLsizei)A(3)); RET0; }

#endif /* ISAAC_WEB */
