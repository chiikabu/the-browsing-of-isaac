/* host_shims_gl.c -- strong implementations for the GLFW-WGL bootstrap
 * surface that the game reaches through cells rather than the static IAT.
 *
 * Boot path (GLFW3): 0x00a7fce0 (_glfwInitWGL) LoadLibraryA("opengl32.dll"),
 * resolves seven wgl* entry points through GetProcAddress into
 * 0x00c75d44..0x00c75d5c, then GetDC/ChoosePixelFormat/SetPixelFormat on a
 * dummy window; 0x00a80010 (_glfwCreateContextWGL) runs the format chooser
 * 0x00a7f340 (DescribePixelFormat per format id, PFD matching, selection via
 * 0x00a6b3c0) and calls wglCreateContext.
 *
 * Policy (headless native port):
 *  - wglGetProcAddress resolves exactly the four GL entry points the game's
 *    context-capability refresh (0x00a6b570, GLFW's _glfwRefreshContextAttribs)
 *    requires, then returns 0 for every other name. The game probes
 *    wglGetExtensionsStringEXT/ARB, wglCreateContextAttribsARB,
 *    wglGetPixelFormatAttribivARB and WGL_ARB_pixel_format this way; a NULL
 *    answer drops the game onto the classic DescribePixelFormat/ChoosePixel
 *    Format path with the PFD below -- the same path a driver with no WGL
 *    extensions takes. All extension gates then stay 0, which is what the
 *    runtime globals (0x00c75d60..0x00c75da0) read from.
 *  - The four resolved names are the plain-core GL functions listed with the
 *    rows in gen_shims.py (cdecl; the guest cleans its own pushes). Their
 *    answers are chosen so the refresh takes the benign branches:
 *        glGetIntegerv(pname, out) -> *out = 0 for every pname
 *        glGetString(0x1f02)       -> "4.6.0" in guest scratch (the game
 *                                     sscanf-parses it -> major 4); any
 *                                     other pname -> NULL
 *        glGetStringi(name, i)     -> NULL (never called: the extension
 *                                     checker needs count>0 from
 *                                     glGetIntegerv(GL_NUM_EXTENSIONS=0x821d),
 *                                     which stays 0, so it falls back to
 *                                     the WGL extension-string cells)
 *        glClear(mask)             -> no-op (result discarded at 0x00a6b9e7)
 *  - The pixel-format answer is one RGBA double-buffered composition format,
 *    ids 1..15, so the chooser's scan finds matches and the picker has a
 *    nonzero best entry. Flags 0x1025 == DRAW_TO_WINDOW(0x4) |
 *    SUPPORT_OPENGL(0x20) | SUPPORT_COMPOSITION(0x1000) | DOUBLEBUFFER(0x1):
 *    the game matches (dwFlags & 1) == [0x00c7380c] (double buffer, = 1) and
 *    skips the GENERIC check when COMPOSITION is set.
 *  - Context handles are opaque nonzero tokens; wglMakeCurrent always
 *    succeeds, which is what the dummy-context bootstrap gates on.
 */
#include "isaac_host.h"
#include "shim_decls.h"

#include <string.h>
#include <stdio.h>

/* gdi32 PIXELFORMATDESCRIPTOR (40 bytes) */
#define PFD_DOUBLEBUFFER 0x00000001u
#define PFD_DRAW_TO_WINDOW 0x00000004u
#define PFD_SUPPORT_OPENGL 0x00000020u
#define PFD_SUPPORT_COMPOSITION 0x00001000u

static void pf_fill_pfd_unchecked(uint32_t pfd) {
    uint8_t *p = (uint8_t *)isaac_g(pfd);
    /* nSize=0x28, nVersion=1 */
    p[0] = 0x28; p[1] = 0x00; p[2] = 0x01; p[3] = 0x00;
    memcpy(p + 4, (const uint8_t[4]){
        (uint8_t)(PFD_DOUBLEBUFFER | PFD_DRAW_TO_WINDOW |
                  PFD_SUPPORT_OPENGL | PFD_SUPPORT_COMPOSITION),
        0, 0, 0}, 4);
    p[8] = 0;            /* iPixelType = PFD_TYPE_RGBA */
    p[9] = 32;           /* cColorBits */
    p[10] = 8;           /* cRedBits */
    p[12] = 8;           /* cGreenBits */
    p[14] = 8;           /* cBlueBits */
    p[16] = 8;           /* cAlphaBits */
    p[23] = 24;          /* cDepthBits */
    p[24] = 8;           /* cStencilBits */
    p[26] = 0;           /* iLayerType = PFD_MAIN_PLANE */
    /* dwLayerMask/dwVisibleMask/dwDamageMask: 0 (already zeroed) */
}

/* int ChoosePixelFormat(HDC, const PIXELFORMATDESCRIPTOR*) */
void imp_gdi32__ChoosePixelFormat(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0);
    (void)isaac_arg(cpu, 1);
    cpu->EAX = 1;        /* a valid format id; the game passes it straight to
                          * SetPixelFormat without inspecting it */
}

/* BOOL SetPixelFormat(HDC, int, const PIXELFORMATDESCRIPTOR*) */
void imp_gdi32__SetPixelFormat(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0);
    (void)isaac_arg(cpu, 1);
    (void)isaac_arg(cpu, 2);
    cpu->EAX = 1;
}

/* int DescribePixelFormat(HDC, int iPixelFormat, UINT nBytes,
 *                         PIXELFORMATDESCRIPTOR* ppfd)
 * Returns the maximum pixel-format count; the game scans formats 1..N. */
void imp_gdi32__DescribePixelFormat(CpuState *restrict cpu) {
    uint32_t fmt = isaac_arg(cpu, 1);
    uint32_t nbytes = isaac_arg(cpu, 2);
    uint32_t pfd = isaac_arg(cpu, 3);
    if (pfd && nbytes >= 0x28u && isaac_is_guest_va(pfd))
        pf_fill_pfd_unchecked(pfd);
    (void)fmt;
    cpu->EAX = 15;       /* one answered format, id 1..15 */
}

/* The game stores the resolved wgl tokens into 0x00c75d44..0x00c75d5c and
 * calls through those cells; the handles it stores back into the window
 * object are only ever re-passed to us. */

/* HGLRC wglCreateContext(HDC) */
void imp_opengl32__wglCreateContext(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0);
    static uint32_t n = 0;
    cpu->EAX = 0x77880000u + (++n & 0x7ffffu);
}

/* BOOL wglDeleteContext(HGLRC) */
void imp_opengl32__wglDeleteContext(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0);
    cpu->EAX = 1;
}

/* PROC wglGetProcAddress(LPCSTR) -- always NULL, see policy above. */
void imp_opengl32__wglGetProcAddress(CpuState *restrict cpu) {
    uint32_t name = isaac_arg(cpu, 0);
    cpu->EAX = 0;
    if (!isaac_is_guest_va(name))
        return;
    const char *n = (const char *)isaac_g(name);
    for (unsigned i = 0; i < isaac_import_count; ++i) {
        const isaac_import *imp = &isaac_imports[i];
        if (imp->shim_va < ISAAC_SHIM_BASE)
            continue;                        /* IAT rows: not token-callable */
        if (strcmp(imp->dll, "opengl32.dll") != 0)
            continue;
        if (strcmp(imp->symbol, n) == 0) {
            cpu->EAX = imp->shim_va;
            return;
        }
    }
}

/* HDC wglGetCurrentDC(void) */
void imp_opengl32__wglGetCurrentDC(CpuState *restrict cpu) {
    (void)cpu;
    cpu->EAX = 0;        /* no current context during the dummy probe */
}

/* HGLRC wglGetCurrentContext(void) */
void imp_opengl32__wglGetCurrentContext(CpuState *restrict cpu) {
    (void)cpu;
    cpu->EAX = 0;
}

/* BOOL wglMakeCurrent(HDC, HGLRC) -- the bootstrap's success gate. */
void imp_opengl32__wglMakeCurrent(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0);
    (void)isaac_arg(cpu, 1);
    cpu->EAX = 1;
}

/* BOOL wglShareLists(HGLRC, HGLRC) */
void imp_opengl32__wglShareLists(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0);
    (void)isaac_arg(cpu, 1);
    cpu->EAX = 1;
}

/* ============ plain-core GL entry points resolved by wglGetProcAddress ==== */

/* Guest-visible scratch for the GL_VERSION answer. The fake-TEB block owns
 * 0x0e000000..0x0e005080 (TEB/PEB/TLS array/TLS block/ENV_SCRATCH); module
 * tokens start at 0x0e010000. 0x0e006000 sits between them, is below
 * ISAAC_GUEST_LIMIT_VA, and is written by the host only -- safe for the
 * game's own sscanf/strncmp to read. */
#define GL_VERSION_SCRATCH_VA 0x0e006000u

/* void glGetIntegerv(GLenum pname, GLint *out) -- cdecl. The refresh reads
 * these pnames: 0x821e (GL_MAJOR_VERSION), 0x821d (GL_NUM_EXTENSIONS),
 * 0x9126 (GL_CONTEXT_PROFILE_MASK), 0x8256 (GL_RESET_NOTIFICATION_STRATEGY
 * _ARB), 0x82fb (GL_CONTEXT_RELEASE_BEHAVIOR). 0 for every answer keeps the
 * gate tests (low-byte flags, exact-value compares) on their benign arms:
 * no feature flags set, no extension enumeration (count 0 -> the WGL
 * extension-string fallback), no robustness/flush-control register. */
void imp_opengl32__glGetIntegerv(CpuState *restrict cpu) {
    uint32_t pname = isaac_arg(cpu, 0), out = isaac_arg(cpu, 1);
    /* Size caps must be non-zero or the asset loader's image-dimension gate
     * (0x00a12d50: `cmp w,max / ja fail`, max = a renderer vtable method that
     * surfaces this query) rejects EVERY texture with "Attempted to create
     * image larger than max supported size", which leaves gfx/ui/coop menu.png
     * NULL and faults the HUD load at 0x009a26c2. Report a modern desktop-GL
     * max (16384). GL_NUM_EXTENSIONS stays 0 on purpose (the comment above):
     * a non-zero count would send the caller down the glGetStringi walk. */
    uint32_t v = 0;
    if (pname == 0x0D33u /* GL_MAX_TEXTURE_SIZE */ ||
        pname == 0x0D3Au /* GL_MAX_VIEWPORT_DIMS (writes 2; both = 16384) */ ||
        pname == 0x84E8u /* GL_MAX_RENDERBUFFER_SIZE */ ||
        pname == 0x8073u /* GL_MAX_3D_TEXTURE_SIZE */ ||
        pname == 0x851Cu /* GL_MAX_CUBE_MAP_TEXTURE_SIZE */)
        v = 16384u;
    if (isaac_is_guest_va(out)) {
        *(uint32_t *)isaac_g(out) = v;
        /* GL_MAX_VIEWPORT_DIMS returns two ints. */
        if (pname == 0x0D3Au && isaac_is_guest_va(out + 4))
            *(uint32_t *)isaac_g(out + 4) = v;
    }
    cpu->EAX = 0;
}

/* const GLubyte *glGetString(GLenum pname) -- cdecl. Only GL_VERSION
 * (0x1f02) is queried (0x00a6b6e0); the answer is a "%d.%d.%d" string the
 * game sscanf-parses at 0x00a6b782 into major/minor/revision, then gates:
 * major >= [0x00c73c6c] (1) passes, major != 1 skips the minor compare,
 * major >= 3 resolves glGetStringi and the version-prefix strncmp loop
 * ("OpenGL ES-CM "/"OpenGL ES-CL "/"OpenGL ES ") matches nothing. */
void imp_opengl32__glGetString(CpuState *restrict cpu) {
    uint32_t pname = isaac_arg(cpu, 0);
    if (pname == 0x1f02u) {
        static const char version[] = "4.6.0";
        memcpy(isaac_g(GL_VERSION_SCRATCH_VA), version, sizeof version);
        cpu->EAX = GL_VERSION_SCRATCH_VA;
        return;
    }
    cpu->EAX = 0;
}

/* const GLubyte *glGetStringi(GLenum name, GLuint index) -- cdecl. Stored
 * into node+0x220 when major >= 3 but never called: the only consumer
 * (0x00a6bd24) is gated on glGetIntegerv(GL_NUM_EXTENSIONS) > 0, and that
 * query answers 0. */
void imp_opengl32__glGetStringi(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0);
    (void)isaac_arg(cpu, 1);
    cpu->EAX = 0;
}

/* void glClear(GLbitfield mask) -- cdecl. Called once at 0x00a6b9e1 with
 * 0x4000 (GL_COLOR_BUFFER_BIT); the return value is discarded. */
void imp_opengl32__glClear(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0);
    cpu->EAX = 0;
}


/* ================= libepoxy GL surface (resolved via wglGetProcAddress) ===
 * The game's odsa/epoxy layer resolves every gl* name it calls through
 * wglGetProcAddress (0x00a7fc80 / epoxy_wglGetProcAddress slot 0x00c13410)
 * and stores the result into the .data slot, then calls it with NO caller
 * cleanup (Win32 GL ABI: __stdcall).  The name list below is the 75-name
 * caller-census from gl_census.py (82 entry points, minus the 7 wgl/epoxy
 * bootstrap rows); every one of them must resolve or the odsa lazy binder
 * stores NULL and tail-jumps to 0 (measured at 0x00a38680 for
 * glGenFramebuffers).  All rows are stdcall (purge = arg_bytes) and every
 * body is a benign headless answer: fake object tokens, zeros, no-ops,
 * GL_FRAMEBUFFER_COMPLETE for the status query, empty shader logs.
 */

/* First-call logger: names the GL call once (keeps the main loop quiet). */
static void gl_log_once(const char *name, const char *args) {
    static const char *seen[128];
    static unsigned nseen = 0;
    for (unsigned i = 0; i < nseen; ++i)
        if (seen[i] == name) return;
    if (nseen < 128) seen[nseen++] = name;
    fprintf(stderr, "[gl] %s(%s)\n", name, args);
}

static uint32_t gl_next_token(void) {
    static uint32_t n = 0x7788f000u;
    return n += 0x10u;
}

/* glGen*: write `count` fake ids into the guest ids[] array. */
static void gl_gen_impl(uint32_t count, uint32_t ids) {
    for (uint32_t i = 0; i < count; ++i) {
        if (isaac_is_guest_va(ids + 4 * i))
            isaac_w32(ids + 4 * i, gl_next_token());
    }
}

void imp_opengl32__glActiveTexture(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 1; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glAttachShader(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 2; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glBindFramebuffer(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 2; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
/* Renderbuffer storage book-keeping. The game's RenderTarget code
 * (0x00a18750) re-validates a target every frame: bind the renderbuffer,
 * read back GL_RENDERBUFFER_WIDTH/HEIGHT, and if they differ from the wanted
 * size, glGenRenderbuffers a new one (logging "Renderbuffer ID: ..."). A
 * shim that answers 0 for the query therefore allocates a fresh 1024x1024
 * target on every frame (boot round 12: 652 of them in ten minutes, the
 * first thing the frame loop did). Remember (w, h, format) per name. */
#define GL_RB_SLOTS 256u
static struct { uint32_t name, w, h, fmt; } g_gl_rb[GL_RB_SLOTS];
static uint32_t g_gl_rb_bound;
static int gl_rb_find(uint32_t name) {
    if (!name) return -1;
    for (unsigned i = 0; i < GL_RB_SLOTS; ++i) if (g_gl_rb[i].name == name) return (int)i;
    return -1;
}
static int gl_rb_slot(uint32_t name) {
    int i = gl_rb_find(name);
    if (i >= 0) return i;
    for (unsigned k = 0; k < GL_RB_SLOTS; ++k)
        if (!g_gl_rb[k].name) { g_gl_rb[k].name = name; g_gl_rb[k].w = g_gl_rb[k].h = g_gl_rb[k].fmt = 0; return (int)k; }
    gl_log_once("glRenderbufferStorage", "renderbuffer table full (256 live names)");
    return -1;
}
void imp_opengl32__glBindRenderbuffer(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0);                 /* target: GL_RENDERBUFFER only */
    g_gl_rb_bound = isaac_arg(cpu, 1);
    cpu->EAX = 0;
}
void imp_opengl32__glBindTexture(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 2; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glBlendEquation(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 1; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glBlendFuncSeparate(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 4; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glCheckFramebufferStatus(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0);
    cpu->EAX = 0x8CD5u;          /* GL_FRAMEBUFFER_COMPLETE */
}
void imp_opengl32__glClampColorARB(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 2; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glClearColor(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 4; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glClearDepth(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);  /* double: 2 slots */
    cpu->EAX = 0;
}
void imp_opengl32__glCompileShader(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 1; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glCreateProgram(CpuState *restrict cpu) {
    gl_log_once("glCreateProgram", "");
    cpu->EAX = gl_next_token();
}
void imp_opengl32__glCreateShader(CpuState *restrict cpu) {
    gl_log_once("glCreateShader", "type");
    (void)isaac_arg(cpu, 0);
    cpu->EAX = gl_next_token();
}
void imp_opengl32__glCullFace(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 1; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glDeleteFramebuffers(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 2; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glDeleteProgram(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 1; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
static void gl_rb_forget(uint32_t count, uint32_t ids) {
    for (uint32_t i = 0; i < count; ++i) {
        if (!isaac_is_guest_va(ids + 4 * i)) break;
        int k = gl_rb_find(isaac_r32(ids + 4 * i));
        if (k >= 0) g_gl_rb[k].name = 0;
    }
}
void imp_opengl32__glDeleteRenderbuffers(CpuState *restrict cpu) {
    gl_rb_forget(isaac_arg(cpu, 0), isaac_arg(cpu, 1));
    for (unsigned i = 0; i < 2; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glDeleteShader(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 1; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glDeleteTextures(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 2; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glDepthFunc(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 1; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glDisable(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 1; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glDisableVertexAttribArray(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 1; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glDrawArraysInstancedEXT(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 4; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glDrawElements(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 4; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glEnable(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 1; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glEnableVertexAttribArray(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 1; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glFramebufferRenderbuffer(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 4; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glFramebufferTexture2D(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 5; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glGenFramebuffers(CpuState *restrict cpu) {
    gl_gen_impl(isaac_arg(cpu, 0), isaac_arg(cpu, 1));
    cpu->EAX = 0;
}
void imp_opengl32__glGenRenderbuffers(CpuState *restrict cpu) {
    gl_gen_impl(isaac_arg(cpu, 0), isaac_arg(cpu, 1));
    cpu->EAX = 0;
}
void imp_opengl32__glGenTextures(CpuState *restrict cpu) {
    gl_gen_impl(isaac_arg(cpu, 0), isaac_arg(cpu, 1));
    cpu->EAX = 0;
}
void imp_opengl32__glGetAttribLocation(CpuState *restrict cpu) {
    gl_log_once("glGetAttribLocation", "prog, name");
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    cpu->EAX = 0;               /* location 0: the game's first uniform */
}
void imp_opengl32__glGetCombinerInputParameterivNV(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 5; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glGetProgramInfoLog(CpuState *restrict cpu) {
    uint32_t bufsize = isaac_arg(cpu, 1), len = isaac_arg(cpu, 2),
             log = isaac_arg(cpu, 3);
    (void)bufsize;
    if (isaac_is_guest_va(log)) *(uint8_t *)isaac_g(log) = 0;
    if (isaac_is_guest_va(len)) isaac_w32(len, 0);
    cpu->EAX = 0;
}
void imp_opengl32__glGetProgramiv(CpuState *restrict cpu) {
    uint32_t pname = isaac_arg(cpu, 1), out = isaac_arg(cpu, 2);
    /* COMPILE_STATUS/LINK_STATUS/VALIDATE_STATUS/DELETE_STATUS = success;
     * everything else (INFO_LOG_LENGTH, ATTACHED_SHADERS, ...) = 0. */
    uint32_t v = (pname == 0x8B81u || pname == 0x8B82u || pname == 0x8B83u ||
                  pname == 0x8B80u) ? 1u : 0u;
    if (isaac_is_guest_va(out)) isaac_w32(out, v);
    cpu->EAX = 0;
}
void imp_opengl32__glGetRenderbufferParameteriv(CpuState *restrict cpu) {
    uint32_t pname = isaac_arg(cpu, 1), out = isaac_arg(cpu, 2);
    int k = gl_rb_find(g_gl_rb_bound);
    uint32_t v = 0;
    if (k >= 0) {
        if (pname == 0x8D42u) v = g_gl_rb[k].w;          /* GL_RENDERBUFFER_WIDTH */
        else if (pname == 0x8D43u) v = g_gl_rb[k].h;     /* GL_RENDERBUFFER_HEIGHT */
        else if (pname == 0x8D44u) v = g_gl_rb[k].fmt;   /* GL_RENDERBUFFER_INTERNAL_FORMAT */
    }
    if (isaac_is_guest_va(out)) isaac_w32(out, v);
    cpu->EAX = 0;
}
void imp_opengl32__glGetShaderInfoLog(CpuState *restrict cpu) {
    uint32_t bufsize = isaac_arg(cpu, 1), len = isaac_arg(cpu, 2),
             log = isaac_arg(cpu, 3);
    (void)bufsize;
    if (isaac_is_guest_va(log)) *(uint8_t *)isaac_g(log) = 0;
    if (isaac_is_guest_va(len)) isaac_w32(len, 0);
    cpu->EAX = 0;
}
void imp_opengl32__glGetShaderiv(CpuState *restrict cpu) {
    uint32_t pname = isaac_arg(cpu, 1), out = isaac_arg(cpu, 2);
    /* COMPILE_STATUS/LINK_STATUS/VALIDATE_STATUS/DELETE_STATUS = success;
     * everything else (INFO_LOG_LENGTH, ATTACHED_SHADERS, ...) = 0. */
    uint32_t v = (pname == 0x8B81u || pname == 0x8B82u || pname == 0x8B83u ||
                  pname == 0x8B80u) ? 1u : 0u;
    if (isaac_is_guest_va(out)) isaac_w32(out, v);
    cpu->EAX = 0;
}
void imp_opengl32__glGetUniformLocation(CpuState *restrict cpu) {
    gl_log_once("glGetUniformLocation", "prog, name");
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    cpu->EAX = 0;               /* location 0: the game's first uniform */
}
void imp_opengl32__glLinkProgram(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 1; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glMultiDrawArraysIndirectEXT(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 4; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glProgramUniform1ivEXT(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 4; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glReadPixels(CpuState *restrict cpu) {
    uint32_t w = isaac_arg(cpu, 2), h = isaac_arg(cpu, 3),
             fmt = isaac_arg(cpu, 5), ty = isaac_arg(cpu, 6),
             px = isaac_arg(cpu, 7);
    (void)fmt; (void)ty;
    /* Zero the pixel buffer (headless: framebuffer reads are empty). */
    size_t n = (size_t)w * (size_t)h * 4;
    for (size_t i = 0; i < n && isaac_is_guest_va(px + (uint32_t)i); i += 4)
        isaac_w32(px + (uint32_t)i, 0);
    cpu->EAX = 0;
}
void imp_opengl32__glRenderbufferStorage(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0);                 /* target */
    int k = gl_rb_slot(g_gl_rb_bound);
    if (k >= 0) {
        g_gl_rb[k].fmt = isaac_arg(cpu, 1);
        g_gl_rb[k].w = isaac_arg(cpu, 2);
        g_gl_rb[k].h = isaac_arg(cpu, 3);
    }
    cpu->EAX = 0;
}
void imp_opengl32__glShaderSource(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    (void)isaac_arg(cpu, 2); (void)isaac_arg(cpu, 3);
    cpu->EAX = 0;
}
void imp_opengl32__glTexImage2D(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 9; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glTexParameteri(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 3; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glTexSubImage2D(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 9; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glUniform1fv(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 3; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glUniform1i(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 2; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glUniform1iv(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 3; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glUniform1uiv(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 3; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glUniform2fv(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 3; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glUniform2iv(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 3; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glUniform2uiv(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 3; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glUniform3fv(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 3; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glUniform3iv(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 3; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glUniform3uiv(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 3; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glUniform4fv(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 3; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glUniform4iv(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 3; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glUniform4uiv(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 3; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glUniformMatrix2fv(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 4; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glUniformMatrix2x3fv(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 4; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glUniformMatrix2x4fv(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 4; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glUniformMatrix3fv(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 4; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glUniformMatrix3x2fv(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 4; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glUniformMatrix3x4fv(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 4; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glUniformMatrix4fv(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 4; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glUniformMatrix4x2fv(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 4; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glUniformMatrix4x3fv(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 4; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glUseProgram(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 1; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glVertexAttribPointer(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 6; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glVertexStream2fATI(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 3; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}
void imp_opengl32__glViewport(CpuState *restrict cpu) {
    for (unsigned i = 0; i < 4; ++i) (void)isaac_arg(cpu, i);
    cpu->EAX = 0;
}

/* ================= TEMP instrumentation (remove after 0xa6b570 root cause) = */
void imp_kernel32__OutputDebugStringA(CpuState *restrict cpu) {
    uint32_t p = isaac_arg(cpu, 0);
    char buf[1024];
    size_t n = 0;
    if (isaac_is_guest_va(p)) {
        const char *q = (const char *)isaac_g(p);
        while (n + 1 < sizeof buf && q[n]) { buf[n] = q[n]; ++n; }
    }
    buf[n] = 0;
    fprintf(stderr, "[odsa] %s\n", buf);
    cpu->EAX = 0;
}
