/* host_shims_win.c -- user32 window-class / window handlers for the boot.
 *
 * The game reaches these while creating its main window (RegisterClassExW at
 * 0x00a813a5, then CreateWindowExW etc.). There is no real HWND in the wasm
 * harness; window handles and class atoms are stable magic tokens that the
 * game only compares and passes back, so identity is preserved without a
 * window. The eventual render work unit replaces these with real GLFW-style
 * handles; nothing here is part of the shipped frame path.
 *
 * Window size answers a fixed 1280x720 "display"; CreateWindowEx stores the
 * requested size and GetClientRect/GetWindowRect return it, so resolution
 * detection sees a plausible window.
 */
#include "isaac_host.h"
#include "shim_decls.h"

#include <stdio.h>
#include <string.h>

#define WIN_CLASS_MAX 32
#define WIN_HWND_MAX  32
#define WIN_ATOM_BASE 0xC000u
#define WIN_HWND_BASE 0x00020000u
#define DISPLAY_W 1280
#define DISPLAY_H 720

static struct {
    char     name[64];
    uint32_t atom;
    uint32_t wndproc, hinst;
} g_wc[WIN_CLASS_MAX];
static int g_wc_n;

static struct {
    uint32_t hwnd;
    uint32_t style, ex_style;
    uint32_t x, y, w, h;
} g_win[WIN_HWND_MAX];
static int g_win_n;

static int win_find_hwnd(uint32_t hwnd) {
    for (int i = 0; i < g_win_n; ++i)
        if (g_win[i].hwnd == hwnd) return i;
    return -1;
}

/* Resolve a WNDCLASS/WNDCLASSEX class-name argument: a MAKEINTRESOURCE atom
 * (high word 0) or a guest pointer to a (wide or ansi) string. */
static const char *win_class_of(uint32_t name_va, int wide, char *buf,
                                size_t cap) {
    if ((name_va & 0xFFFF0000u) == 0) {
        uint32_t atom = name_va & 0xFFFFu;
        for (int i = 0; i < g_wc_n; ++i)
            if (g_wc[i].atom == atom) return g_wc[i].name;
        return NULL;
    }
    if (wide) {
        size_t n = 0;
        while (n + 1 < cap && isaac_is_guest_va(name_va + 2 * n) &&
               isaac_r16(name_va + 2 * n)) {
            uint16_t c = isaac_r16(name_va + 2 * n);
            buf[n++] = c < 0x80 ? (char)c : '?';
        }
        buf[n] = 0;
    } else {
        isaac_guest_cstr(name_va, buf, cap, "window class");
    }
    return buf;
}

static uint32_t win_register_class(uint32_t pwcx, int wide, CpuState *cpu) {
    if (!isaac_is_guest_va(pwcx)) return 0;
    char name[64];
    uint32_t name_va = isaac_r32(pwcx + 0x28);
    uint32_t wndproc = isaac_r32(pwcx + 0x08);
    uint32_t hinst = isaac_r32(pwcx + 0x14);
    const char *cls = win_class_of(name_va, wide, name, sizeof name);
    if (!cls || !cls[0]) return 0;
    for (int i = 0; i < g_wc_n; ++i)
        if (!strcmp(g_wc[i].name, cls)) return 0;   /* already exists */
    if (g_wc_n >= WIN_CLASS_MAX) return 0;
    snprintf(g_wc[g_wc_n].name, sizeof g_wc[g_wc_n].name, "%s", cls);
    g_wc[g_wc_n].atom = WIN_ATOM_BASE + (uint32_t)g_wc_n;
    g_wc[g_wc_n].wndproc = wndproc;
    g_wc[g_wc_n].hinst = hinst;
    ++g_wc_n;
    isaac_log("[isaac][ui] RegisterClassEx%c(\"%s\") -> atom 0x%04x wndproc 0x%08x",
              wide ? 'W' : 'A', cls, WIN_ATOM_BASE + g_wc_n - 1, wndproc);
    return WIN_ATOM_BASE + (uint32_t)(g_wc_n - 1);
}

static uint32_t win_create(uint32_t ex_style, uint32_t cls_va, int wide,
                           uint32_t name_va, uint32_t style,
                           uint32_t x, uint32_t y, uint32_t w, uint32_t h,
                           CpuState *cpu) {
    char cls[64], title[128];
    const char *c = win_class_of(cls_va, wide, cls, sizeof cls);
    char tbuf[128];
    isaac_guest_cstr(name_va, tbuf, sizeof tbuf, "window title");
    snprintf(title, sizeof title, "%s", tbuf);
    if (!c) return 0;
    if (g_win_n >= WIN_HWND_MAX) return 0;
    uint32_t hwnd = WIN_HWND_BASE + (uint32_t)g_win_n;
    g_win[g_win_n].hwnd = hwnd;
    g_win[g_win_n].style = style;
    g_win[g_win_n].ex_style = ex_style;
    g_win[g_win_n].x = x;
    g_win[g_win_n].y = y;
    g_win[g_win_n].w = (w == 0 || w == 0x80000000u) ? DISPLAY_W : w;
    g_win[g_win_n].h = (h == 0 || h == 0x80000000u) ? DISPLAY_H : h;
    ++g_win_n;
    isaac_log("[isaac][ui] CreateWindowEx%c class=\"%s\" title=\"%s\" "
              "style=0x%08x %ux%u -> hwnd 0x%08x",
              wide ? 'W' : 'A', c, title[0] ? title : "(untitled)", style,
              g_win[g_win_n - 1].w, g_win[g_win_n - 1].h, hwnd);
    return hwnd;
}

/* ------------------------------------------------------- icons --------- */

/* HICON LoadIconA(HINSTANCE, LPCSTR) -- token 0x10001. */
void imp_user32__LoadIconA(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    cpu->EAX = 0x10001u;
}

/* HANDLE LoadImageA(HINSTANCE, LPCSTR name, UINT type, int cx, int cy, UINT fuLoad)
 * -- 6 stdcall args (purge 24). Reached REGISTER-HELD (`call ebx` at
 * 0x00949b03: hInstance, MAKEINTRESOURCE(101), IMAGE_ICON, ...) for the
 * window icon, so the call-site census saw 0 sites and the purge was
 * UNKNOWN; boot round 11b stopped on that trap. No icon: return NULL, which
 * the caller tolerates (it only hands the result to SetClassLongA). */
void imp_user32__LoadImageA(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1); (void)isaac_arg(cpu, 2);
    (void)isaac_arg(cpu, 3); (void)isaac_arg(cpu, 4); (void)isaac_arg(cpu, 5);
    cpu->EAX = 0;
}

/* int GetDeviceCaps(HDC, int index) -- gdi32, 8 bytes. Reached register-held
 * from GLFW's monitor/DPI code (0x00a5cd20, 0x00a5dc90, 0x00a816f0); an
 * inert 0 would put 0 dpi / 0 Hz into ratios. Answer a 96-dpi 60 Hz 32-bpp
 * display of the emulated size. */
void imp_gdi32__GetDeviceCaps(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0);
    uint32_t index = isaac_arg(cpu, 1);
    switch (index) {
        case 8:   cpu->EAX = DISPLAY_W; break;   /* HORZRES */
        case 10:  cpu->EAX = DISPLAY_H; break;   /* VERTRES */
        case 12:  cpu->EAX = 32; break;          /* BITSPIXEL */
        case 14:  cpu->EAX = 1; break;           /* PLANES */
        case 88:  cpu->EAX = 96; break;          /* LOGPIXELSX */
        case 90:  cpu->EAX = 96; break;          /* LOGPIXELSY */
        case 116: cpu->EAX = 60; break;          /* VREFRESH */
        case 118: cpu->EAX = DISPLAY_W; break;   /* DESKTOPHORZRES */
        case 117: cpu->EAX = DISPLAY_H; break;   /* DESKTOPVERTRES */
        default:  cpu->EAX = 0; break;
    }
}

/* UINT GetRawInputDeviceList(PRAWINPUTDEVICELIST list, PUINT count, UINT size)
 * -- user32, 12 bytes. Reached register-held (0x00a6d5ea, 0x00aa80ac: raw
 * input / gamepad enumeration). The two-call protocol (NULL list: report
 * the count; then fill) must write *count, or the caller sizes its buffer
 * from stack garbage. No raw input devices: *count = 0, return 0. */
void imp_user32__GetRawInputDeviceList(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 2);
    uint32_t pcount = isaac_arg(cpu, 1);
    if (pcount && isaac_is_guest_va(pcount)) isaac_w32(pcount, 0);
    cpu->EAX = 0;
}

/* LONG SetClassLongA(HWND, int, LONG) -- no class storage; old value 0. */
void imp_user32__SetClassLongA(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1); (void)isaac_arg(cpu, 2);
    cpu->EAX = 0;
}

/* ------------------------------------------------------- class atoms ---- */

void imp_user32__RegisterClassExW(CpuState *restrict cpu) {
    cpu->EAX = win_register_class(isaac_arg(cpu, 0), 1, cpu);
}
void imp_user32__RegisterClassExA(CpuState *restrict cpu) {
    cpu->EAX = win_register_class(isaac_arg(cpu, 0), 0, cpu);
}
void imp_user32__UnregisterClassA(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    cpu->EAX = 1;
}

/* ------------------------------------------------------- windows -------- */

void imp_user32__CreateWindowExW(CpuState *restrict cpu) {
    cpu->EAX = win_create(isaac_arg(cpu, 0), isaac_arg(cpu, 1), 1,
                          isaac_arg(cpu, 2), isaac_arg(cpu, 3),
                          isaac_arg(cpu, 4), isaac_arg(cpu, 5),
                          isaac_arg(cpu, 6), isaac_arg(cpu, 7), cpu);
}
void imp_user32__CreateWindowExA(CpuState *restrict cpu) {
    cpu->EAX = win_create(isaac_arg(cpu, 0), isaac_arg(cpu, 1), 0,
                          isaac_arg(cpu, 2), isaac_arg(cpu, 3),
                          isaac_arg(cpu, 4), isaac_arg(cpu, 5),
                          isaac_arg(cpu, 6), isaac_arg(cpu, 7), cpu);
}
void imp_user32__DestroyWindow(CpuState *restrict cpu) {
    uint32_t h = isaac_arg(cpu, 0);
    int i = win_find_hwnd(h);
    if (i >= 0) {
        g_win[i] = g_win[--g_win_n];
    }
    cpu->EAX = 1;
}
void imp_user32__ShowWindow(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    cpu->EAX = 1;                       /* previously visible */
}
void imp_user32__IsWindow(CpuState *restrict cpu) {
    cpu->EAX = win_find_hwnd(isaac_arg(cpu, 0)) >= 0 ? 1u : 0u;
}
void imp_user32__IsWindowVisible(CpuState *restrict cpu) {
    cpu->EAX = win_find_hwnd(isaac_arg(cpu, 0)) >= 0 ? 1u : 0u;
}
void imp_user32__IsIconic(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0);
    cpu->EAX = 0;
}
void imp_user32__IsZoomed(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0);
    cpu->EAX = 0;
}
void imp_user32__GetAncestor(CpuState *restrict cpu) {
    cpu->EAX = isaac_arg(cpu, 0);
}
void imp_user32__GetLastActivePopup(CpuState *restrict cpu) {
    cpu->EAX = isaac_arg(cpu, 0);
}
void imp_user32__GetWindowThreadProcessId(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0);
    cpu->EAX = 1;                       /* our single fake thread id */
}
void imp_user32__BringWindowToTop(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0);
    cpu->EAX = 1;
}
void imp_user32__SetForegroundWindow(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0);
    cpu->EAX = 1;
}
void imp_user32__SetFocus(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0);
    cpu->EAX = 0;                       /* previous focus: none */
}
void imp_user32__SetCapture(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0);
    cpu->EAX = 0;
}
void imp_user32__ReleaseCapture(CpuState *restrict cpu) {
    cpu->EAX = 1;
}
void imp_user32__WindowFromPoint(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    cpu->EAX = 0;
}
void imp_user32__DefWindowProcW(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    (void)isaac_arg(cpu, 2); (void)isaac_arg(cpu, 3);
    cpu->EAX = 0;
}
void imp_user32__GetWindowRect(CpuState *restrict cpu) {
    uint32_t h = isaac_arg(cpu, 0), r = isaac_arg(cpu, 1);
    int i = win_find_hwnd(h);
    if (i < 0) { cpu->EAX = 0; return; }
    if (isaac_is_guest_va(r)) {
        isaac_w32(r + 0,  g_win[i].x);
        isaac_w32(r + 4,  g_win[i].y);
        isaac_w32(r + 8,  g_win[i].x + g_win[i].w);
        isaac_w32(r + 12, g_win[i].y + g_win[i].h);
    }
    cpu->EAX = 1;
}
void imp_user32__GetClientRect(CpuState *restrict cpu) {
    uint32_t h = isaac_arg(cpu, 0), r = isaac_arg(cpu, 1);
    int i = win_find_hwnd(h);
    if (i < 0) { cpu->EAX = 0; return; }
    if (isaac_is_guest_va(r)) {
        isaac_w32(r + 0, 0);
        isaac_w32(r + 4, 0);
        isaac_w32(r + 8,  g_win[i].w);
        isaac_w32(r + 12, g_win[i].h);
    }
    cpu->EAX = 1;
}
void imp_user32__ClientToScreen(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    cpu->EAX = 1;                       /* identity: window at 0,0 */
}
void imp_user32__ScreenToClient(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    cpu->EAX = 1;
}
void imp_user32__GetWindowPlacement(CpuState *restrict cpu) {
    uint32_t p = isaac_arg(cpu, 1);
    if (isaac_is_guest_va(p)) {
        isaac_w32(p + 0, 44);           /* length */
        isaac_w32(p + 4, 0);            /* flags */
        isaac_w32(p + 8, 1);            /* showCmd SW_SHOWNORMAL */
        /* ptMinPosition, ptMaxPosition */
        isaac_w32(p + 12, 0); isaac_w32(p + 16, 0);
        isaac_w32(p + 20, 0); isaac_w32(p + 24, 0);
        isaac_w32(p + 28, 0); isaac_w32(p + 32, 0);
        isaac_w32(p + 36, DISPLAY_W); isaac_w32(p + 40, DISPLAY_H);
    }
    cpu->EAX = 1;
}
void imp_user32__SetWindowPlacement(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    cpu->EAX = 1;
}
void imp_user32__MoveWindow(CpuState *restrict cpu) {
    uint32_t h = isaac_arg(cpu, 0);
    int i = win_find_hwnd(h);
    if (i >= 0) {
        g_win[i].x = isaac_arg(cpu, 1);
        g_win[i].y = isaac_arg(cpu, 2);
        g_win[i].w = isaac_arg(cpu, 3);
        g_win[i].h = isaac_arg(cpu, 4);
    }
    cpu->EAX = 1;
}
void imp_user32__SetWindowTextW(CpuState *restrict cpu) {
    char t[128];
    isaac_guest_cstr(isaac_arg(cpu, 1), t, sizeof t, "window title");
    isaac_log("[isaac][ui] SetWindowTextW: \"%s\"", t);
    cpu->EAX = 1;
}
void imp_user32__FlashWindow(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    cpu->EAX = 1;
}
void imp_user32__GetTitleBarInfo(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    cpu->EAX = 1;
}
void imp_user32__SetWindowPos(CpuState *restrict cpu) {
    (void)cpu;
    cpu->EAX = 1;
}
void imp_user32__GetWindowLongA(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    cpu->EAX = 0;
}
void imp_user32__SetWindowLongA(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1); (void)isaac_arg(cpu, 2);
    cpu->EAX = 0;
}
void imp_user32__GetWindowLongW(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    cpu->EAX = 0;
}
void imp_user32__SetWindowLongW(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1); (void)isaac_arg(cpu, 2);
    cpu->EAX = 0;
}
void imp_user32__AdjustWindowRectEx(CpuState *restrict cpu) {
    uint32_t r = isaac_arg(cpu, 0), style = isaac_arg(cpu, 1);
    (void)isaac_arg(cpu, 2);
    if (isaac_is_guest_va(r)) {
        int32_t l = (int32_t)isaac_r32(r + 0), t = (int32_t)isaac_r32(r + 4);
        int32_t rr = (int32_t)isaac_r32(r + 8), b = (int32_t)isaac_r32(r + 12);
        if (style & 0x00CF0000u) {      /* WS_CAPTION | WS_THICKFRAME ... */
            l -= 8; t -= 30; rr += 8; b += 8;
        }
        isaac_w32(r + 0, (uint32_t)l); isaac_w32(r + 4, (uint32_t)t);
        isaac_w32(r + 8, (uint32_t)rr); isaac_w32(r + 12, (uint32_t)b);
    }
    cpu->EAX = 1;
}

/* ------------------------------------------------------- drawing ------- */

void imp_user32__GetDC(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0);
    cpu->EAX = 1;                       /* opaque HDC token */
}
void imp_user32__ReleaseDC(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    cpu->EAX = 1;
}
void imp_user32__GetSystemMetrics(CpuState *restrict cpu) {
    uint32_t i = isaac_arg(cpu, 0);
    switch (i) {
        case 0:  cpu->EAX = DISPLAY_W; break;   /* SM_CXSCREEN */
        case 1:  cpu->EAX = DISPLAY_H; break;   /* SM_CYSCREEN */
        case 11: cpu->EAX = DISPLAY_W; break;   /* SM_CXMONITOR */
        case 12: cpu->EAX = DISPLAY_H; break;   /* SM_CYMONITOR */
        case 13: cpu->EAX = 32; break;          /* SM_CXCURSOR */
        case 14: cpu->EAX = 32; break;          /* SM_CYCURSOR */
        case 34: cpu->EAX = DISPLAY_W; break;   /* SM_CXMINTRACK */
        case 35: cpu->EAX = DISPLAY_H; break;   /* SM_CYMINTRACK */
        case 49: cpu->EAX = 16; break;          /* SM_CXSMICON */
        case 50: cpu->EAX = 16; break;          /* SM_CYSMICON */
        case 76: cpu->EAX = 0; break;           /* SM_XVIRTUALSCREEN */
        case 77: cpu->EAX = 0; break;           /* SM_YVIRTUALSCREEN */
        case 78: cpu->EAX = DISPLAY_W; break;   /* SM_CXVIRTUALSCREEN */
        case 79: cpu->EAX = DISPLAY_H; break;   /* SM_CYVIRTUALSCREEN */
        case 80: cpu->EAX = 1; break;           /* SM_CMONITORS */
        default: cpu->EAX = 0; break;
    }
}
void imp_user32__GetMonitorInfoW(CpuState *restrict cpu) {
    uint32_t mi = isaac_arg(cpu, 1);
    (void)isaac_arg(cpu, 0);
    if (isaac_is_guest_va(mi)) {
        isaac_w32(mi + 0, 40);          /* cbSize */
        isaac_w32(mi + 4, 0);  isaac_w32(mi + 8, 0);
        isaac_w32(mi + 12, DISPLAY_W); isaac_w32(mi + 16, DISPLAY_H);
        isaac_w32(mi + 20, 0); isaac_w32(mi + 24, 0);
        isaac_w32(mi + 28, DISPLAY_W); isaac_w32(mi + 32, DISPLAY_H);
        isaac_w32(mi + 36, 1);          /* MONITORINFOF_PRIMARY */
    }
    cpu->EAX = 1;
}
void imp_user32__MonitorFromWindow(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    cpu->EAX = 1;                       /* the single fake monitor */
}
void imp_user32__EnumDisplayMonitors(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    (void)isaac_arg(cpu, 2); (void)isaac_arg(cpu, 3);
    cpu->EAX = 1;                       /* nothing enumerated */
}
void imp_user32__EnumDisplayDevicesW(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    (void)isaac_arg(cpu, 2); (void)isaac_arg(cpu, 3);
    cpu->EAX = 0;
}
void imp_user32__EnumDisplaySettingsW(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1); (void)isaac_arg(cpu, 2);
    cpu->EAX = 0;                       /* no custom modes */
}
void imp_user32__EnumDisplaySettingsExW(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    (void)isaac_arg(cpu, 2); (void)isaac_arg(cpu, 3);
    cpu->EAX = 0;
}
void imp_user32__ChangeDisplaySettingsExW(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    (void)isaac_arg(cpu, 2); (void)isaac_arg(cpu, 3); (void)isaac_arg(cpu, 4);
    cpu->EAX = 0;                       /* DISP_CHANGE_SUCCESSFUL */
}
void imp_user32__SetLayeredWindowAttributes(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    (void)isaac_arg(cpu, 2); (void)isaac_arg(cpu, 3);
    cpu->EAX = 1;
}
void imp_user32__GetLayeredWindowAttributes(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    (void)isaac_arg(cpu, 2); (void)isaac_arg(cpu, 3);
    cpu->EAX = 0;
}
void imp_user32__SetCursorPos(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    cpu->EAX = 1;
}
void imp_user32__GetCursorPos(CpuState *restrict cpu) {
    uint32_t p = isaac_arg(cpu, 0);
    if (isaac_is_guest_va(p)) { isaac_w32(p, 0); isaac_w32(p + 4, 0); }
    cpu->EAX = 1;
}
void imp_user32__ClipCursor(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0);
    cpu->EAX = 1;
}
void imp_user32__SetCursor(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0);
    cpu->EAX = 0;                       /* previous cursor: none */
}
void imp_user32__GetKeyState(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0);
    cpu->EAX = 0;
}
void imp_user32__SendInput(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1); (void)isaac_arg(cpu, 2);
    cpu->EAX = 0;                       /* nothing injected */
}
void imp_user32__MapVirtualKeyW(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    cpu->EAX = 0;
}
void imp_user32__ToUnicode(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    (void)isaac_arg(cpu, 2); (void)isaac_arg(cpu, 3);
    (void)isaac_arg(cpu, 4); (void)isaac_arg(cpu, 5);
    cpu->EAX = 0;
}

/* ------------------------------------------------------- input --------- */

void imp_user32__RegisterRawInputDevices(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1); (void)isaac_arg(cpu, 2);
    cpu->EAX = 1;
}
void imp_user32__GetRawInputData(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    (void)isaac_arg(cpu, 2); (void)isaac_arg(cpu, 3); (void)isaac_arg(cpu, 4);
    cpu->EAX = 0;
}
void imp_user32__GetRawInputDeviceInfoA(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    (void)isaac_arg(cpu, 2); (void)isaac_arg(cpu, 3);
    cpu->EAX = 0;
}

/* ------------------------------------------------------- messages ------ */

void imp_user32__PeekMessageW(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    (void)isaac_arg(cpu, 2); (void)isaac_arg(cpu, 3); (void)isaac_arg(cpu, 4);
    cpu->EAX = 0;                       /* no messages */
}
void imp_user32__GetMessageA(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    (void)isaac_arg(cpu, 2); (void)isaac_arg(cpu, 3);
    cpu->EAX = 0;                       /* WM_QUIT: ends the pump */
}
void imp_user32__GetMessageW(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    (void)isaac_arg(cpu, 2); (void)isaac_arg(cpu, 3);
    cpu->EAX = 0;
}
void imp_user32__DispatchMessageA(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0);
    cpu->EAX = 0;
}
void imp_user32__DispatchMessageW(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0);
    cpu->EAX = 0;
}
void imp_user32__WaitMessage(CpuState *restrict cpu) {
    cpu->EAX = 0;
}
void imp_user32__GetMessageTime(CpuState *restrict cpu) {
    cpu->EAX = 0;
}
void imp_user32__PostMessageW(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    (void)isaac_arg(cpu, 2); (void)isaac_arg(cpu, 3);
    cpu->EAX = 1;
}
void imp_user32__SendMessageTimeoutA(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    (void)isaac_arg(cpu, 2); (void)isaac_arg(cpu, 3);
    (void)isaac_arg(cpu, 4); (void)isaac_arg(cpu, 5); (void)isaac_arg(cpu, 6);
    cpu->EAX = 0;
}
void imp_user32__MsgWaitForMultipleObjects(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    (void)isaac_arg(cpu, 2); (void)isaac_arg(cpu, 3);
    cpu->EAX = 0x102u;                  /* WAIT_TIMEOUT */
}
void imp_user32__ChangeWindowMessageFilterEx(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    (void)isaac_arg(cpu, 2); (void)isaac_arg(cpu, 3);
    cpu->EAX = 1;
}
void imp_user32__EnumWindows(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    cpu->EAX = 1;                       /* nothing enumerated */
}

/* ------------------------------------------------------- misc ---------- */

void imp_user32__OpenClipboard(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0);
    cpu->EAX = 1;
}
void imp_user32__CloseClipboard(CpuState *restrict cpu) {
    cpu->EAX = 1;
}
void imp_user32__EmptyClipboard(CpuState *restrict cpu) {
    cpu->EAX = 1;
}
void imp_user32__GetClipboardData(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0);
    cpu->EAX = 0;
}
void imp_user32__SetClipboardData(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    cpu->EAX = 0;
}
void imp_user32__SetPropW(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1); (void)isaac_arg(cpu, 2);
    cpu->EAX = 1;
}
void imp_user32__GetPropW(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    cpu->EAX = 0;
}
void imp_user32__RemovePropW(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    cpu->EAX = 0;
}
void imp_user32__TrackMouseEvent(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0);
    cpu->EAX = 1;
}
void imp_user32__SystemParametersInfoW(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    (void)isaac_arg(cpu, 2); (void)isaac_arg(cpu, 3);
    cpu->EAX = 0;
}
void imp_user32__RegisterDeviceNotificationA(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1); (void)isaac_arg(cpu, 2);
    cpu->EAX = 1;
}
void imp_user32__RegisterDeviceNotificationW(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1); (void)isaac_arg(cpu, 2);
    cpu->EAX = 1;
}
void imp_user32__UnregisterDeviceNotification(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0);
    cpu->EAX = 1;
}
void imp_user32__LoadImageW(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    (void)isaac_arg(cpu, 2); (void)isaac_arg(cpu, 3);
    (void)isaac_arg(cpu, 4); (void)isaac_arg(cpu, 5);
    cpu->EAX = 0x10001u;                /* image token */
}
void imp_user32__CreateIconIndirect(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0);
    cpu->EAX = 0x10001u;
}
void imp_user32__DestroyIcon(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0);
    cpu->EAX = 1;
}
void imp_user32__LoadCursorW(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    cpu->EAX = 0x10001u;                /* cursor token */
}
void imp_user32__SetRect(CpuState *restrict cpu) {
    uint32_t r = isaac_arg(cpu, 0);
    if (isaac_is_guest_va(r)) {
        isaac_w32(r + 0, isaac_arg(cpu, 1));
        isaac_w32(r + 4, isaac_arg(cpu, 2));
        isaac_w32(r + 8, isaac_arg(cpu, 3));
        isaac_w32(r + 12, isaac_arg(cpu, 4));
    }
    cpu->EAX = 1;
}
void imp_user32__OffsetRect(CpuState *restrict cpu) {
    uint32_t r = isaac_arg(cpu, 0);
    int32_t dx = (int32_t)isaac_arg(cpu, 1), dy = (int32_t)isaac_arg(cpu, 2);
    if (isaac_is_guest_va(r)) {
        isaac_w32(r + 0, isaac_r32(r + 0) + (uint32_t)dx);
        isaac_w32(r + 4, isaac_r32(r + 4) + (uint32_t)dy);
        isaac_w32(r + 8, isaac_r32(r + 8) + (uint32_t)dx);
        isaac_w32(r + 12, isaac_r32(r + 12) + (uint32_t)dy);
    }
    cpu->EAX = 1;
}
void imp_user32__PtInRect(CpuState *restrict cpu) {
    (void)isaac_arg(cpu, 0); (void)isaac_arg(cpu, 1);
    (void)isaac_arg(cpu, 2);
    cpu->EAX = 0;
}
