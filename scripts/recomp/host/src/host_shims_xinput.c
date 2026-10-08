/* host_shims_xinput.c -- XInput, answered by the page's controllers.
 *
 * Gamepad_init (0x00a6cf80) LoadLibraryA's XInput1_4.dll (registered in
 * host_shims_module.c dynamic_dlls), sets [0xc7e301]=1 at 0x00a6d06f, and
 * resolves three names with GetProcAddress (curated DYNAMIC_EXPORTS rows in
 * gen_shims.py): XInputGetState -> [0xc7e2dc], XInputSetState -> [0xc7e2f0],
 * XInputGetCapabilities -> [0xc7e2f4]. Ordinals 100 and 108 (GetStateEx,
 * GetBaseBusInformation) resolve to NULL here; the game falls back to
 * XInputGetState (0x00a6deef) and only logs the missing 108.
 *
 * The hot-plug scan (0x00a6dab0, job 0x00a220c0, one slice per frame) asks
 * XInputGetCapabilities(i, 0, &caps) for i = 0..3: 0 adds an "XInput
 * Controller i+1" device, anything else removes one. The state poll
 * (0x00a6de60) calls XInputGetState(index, &state) per device: 0 is read,
 * anything else removes it. So the two must agree on who is connected; both
 * ask the page the same question. The poll reads wButtons (bits 0..9, 12..15
 * and 10), both triggers and the four thumbs; it keeps no deadzone and never
 * reads dwPacketNumber. XInputSetState (0x00a22d10, the device vtable's rumble
 * slot) passes {left, right} motor words and ignores the result.
 *
 * The page answers: Module.isaacPadState(slot) -> null (not connected) or
 * { packet, buttons, lt, rt, lx, ly, rx, ry } (gamepad.mjs), and
 * Module.isaacPadRumble(slot, left, right) plays the motors. All three are
 * WINAPI (stdcall): the dispatcher's ESP += 4 + argBytes is the callee's
 * purge, so the bodies only set EAX. */
#include "isaac_host.h"
#include "shim_decls.h"

#include <string.h>

#define XI_OK                0u
#define XI_NOT_CONNECTED  1167u           /* ERROR_DEVICE_NOT_CONNECTED */

#ifdef __EMSCRIPTEN__
#include <emscripten.h>
/* The pad in slot `slot` written as XINPUT_STATE (16 bytes) to `out`; 1 when
 * one is connected, 0 when not (out untouched). */
EM_JS(int, isaac_xinput_state_js, (int slot, uint8_t *out), {
    var f = Module.isaacPadState;
    if (typeof f !== "function") return 0;
    var s = null;
    try { s = f(slot); } catch (e) { return 0; }
    if (!s) return 0;
    var dv = new DataView(HEAPU8.buffer, out, 16);
    dv.setUint32(0, s.packet >>> 0, true);
    dv.setUint16(4, s.buttons & 0xffff, true);
    dv.setUint8(6, s.lt & 255);
    dv.setUint8(7, s.rt & 255);
    dv.setInt16(8, s.lx | 0, true);
    dv.setInt16(10, s.ly | 0, true);
    dv.setInt16(12, s.rx | 0, true);
    dv.setInt16(14, s.ry | 0, true);
    return 1;
});
EM_JS(void, isaac_xinput_rumble_js, (int slot, int left, int right), {
    var f = Module.isaacPadRumble;
    if (typeof f === "function") { try { f(slot, left, right); } catch (e) { /* rumble is decoration */ } }
});
#else
static int isaac_xinput_state_js(int slot, uint8_t *out) { (void)slot; (void)out; return 0; }
static void isaac_xinput_rumble_js(int slot, int left, int right) { (void)slot; (void)left; (void)right; }
#endif

/* The page's answer for one slot, or 0 when nothing is there. */
static int xi_poll(uint32_t slot, uint8_t state[16]) {
    if (slot > 3u) return 0;
    memset(state, 0, 16);
    return isaac_xinput_state_js((int)slot, state);
}

/* DWORD XInputGetState(DWORD dwUserIndex, XINPUT_STATE *pState) -- WINAPI, 8. */
void imp_xinput1_4__XInputGetState(CpuState *restrict cpu) {
    uint32_t slot = isaac_arg(cpu, 0), out = isaac_arg(cpu, 1);
    uint8_t st[16];
    if (!xi_poll(slot, st)) { cpu->EAX = XI_NOT_CONNECTED; return; }
    if (out && isaac_is_guest_va(out) && isaac_is_guest_va(out + 15u)) memcpy(isaac_g(out), st, 16);
    cpu->EAX = XI_OK;
}

/* DWORD XInputGetCapabilities(DWORD dwUserIndex, DWORD dwFlags,
 *                             XINPUT_CAPABILITIES *pCapabilities) -- WINAPI, 12.
 * A gamepad (Type 1, SubType 1) with every button and both motors; the game
 * reads none of it, GLFW's joystick probe reads SubType. */
void imp_xinput1_4__XInputGetCapabilities(CpuState *restrict cpu) {
    uint32_t slot = isaac_arg(cpu, 0), out = isaac_arg(cpu, 2);
    uint8_t st[16];
    (void)isaac_arg(cpu, 1);
    if (!xi_poll(slot, st)) { cpu->EAX = XI_NOT_CONNECTED; return; }
    if (out && isaac_is_guest_va(out) && isaac_is_guest_va(out + 19u)) {
        uint8_t caps[20];
        memset(caps, 0, sizeof caps);
        caps[0] = 1;                                   /* XINPUT_DEVTYPE_GAMEPAD */
        caps[1] = 1;                                   /* XINPUT_DEVSUBTYPE_GAMEPAD */
        caps[4] = 0xff; caps[5] = 0xf3;                /* Gamepad.wButtons: all but 0x0400/0x0800 */
        caps[6] = 0xff; caps[7] = 0xff;                /* triggers */
        for (int i = 8; i < 16; i += 2) { caps[i] = 0xc0; caps[i + 1] = 0xff; }   /* thumbs */
        caps[16] = 0xff; caps[17] = 0xff; caps[18] = 0xff; caps[19] = 0xff;      /* both motors */
        memcpy(isaac_g(out), caps, sizeof caps);
    }
    cpu->EAX = XI_OK;
}

/* DWORD XInputSetState(DWORD dwUserIndex, XINPUT_VIBRATION *pVibration) --
 * WINAPI, 8. {WORD wLeftMotorSpeed, WORD wRightMotorSpeed}. */
void imp_xinput1_4__XInputSetState(CpuState *restrict cpu) {
    uint32_t slot = isaac_arg(cpu, 0), vib = isaac_arg(cpu, 1);
    uint8_t st[16];
    if (!xi_poll(slot, st)) { cpu->EAX = XI_NOT_CONNECTED; return; }
    if (vib && isaac_is_guest_va(vib) && isaac_is_guest_va(vib + 3u)) {
        const uint8_t *v = (const uint8_t *)isaac_g(vib);
        isaac_xinput_rumble_js((int)slot, v[0] | (v[1] << 8), v[2] | (v[3] << 8));
    }
    cpu->EAX = XI_OK;
}
