/* host_rgon.c -- round 102: the engine's half of a REPENTOGON-compatible layer.
 *
 * REPENTOGON itself cannot run here. It is built for game v1.9.7.12 and this
 * is v1.9.7.17: 424 of its 1,167 function signatures match nothing in this
 * executable, it patches 286 places in the middle of game functions, and it
 * writes machine code while the game runs, which a statically recompiled
 * image never executes. What mods need of it is its Lua surface: about 1,130
 * functions and 365 callbacks. So that surface is being rebuilt against this
 * executable, as a layer of its own.
 *
 * The layer is a MOD ("repentogon"), installed and switched off like any
 * other, and most of it is Lua (scripts/recomp/rgon/). It is not in the wasm,
 * so adding a function to it is a catalogue update, not an engine release.
 * This file is the small part that has to be native:
 *
 *   boot    once per Lua state, before the first mod's own chunk is loaded,
 *           mods/repentogon/rgon.lua is run and handed the bridge below as
 *           its one argument (never a global: no other mod can reach it).
 *   bridge  read and write guest memory, call a guest function by address
 *           with a calling convention, make a luabridge userdata for a game
 *           object, wrap a Lua function so luabridge takes it for a C one
 *           (its __index throws on anything else), load a sibling file.
 *   hooks   a slot per wrapped game function (lift_patches.py RGON_HOOKS):
 *           a Lua handler before it -- which may change its arguments or
 *           answer for it -- and one after. This is what a callback is.
 *   gate    `REPENTOGON` is only a global for the mods the layer names.
 *           A mod that sees it takes its REPENTOGON-only paths, and a path
 *           the layer does not cover yet is a Lua error where there was
 *           working fallback code. So each mod is let in once what it uses
 *           is there, and every other mod keeps seeing nil.
 *
 * With the mod absent or off none of this runs: the boot finds no file, no
 * hook is armed (one byte test in each wrapper) and nothing is registered.
 * ISAAC_RGON=0 turns the boot off outright. */

#include "isaac_host.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define RGON_HOOKS 192

/* read by the lift's wrappers: slot -> a handler is installed */
uint8_t g_rgon_hook_on[RGON_HOOKS];

/* one hooked call, kept in the wrapper's own frame (lift_patches.py RGON_WRAP
 * declares the same four words) */
typedef struct { uint32_t esp, ecx, edx; int ref; } rgon_frame;

#if defined(__has_include)
#  if __has_include("lua.h")
#    define ISAAC_HAVE_LUA 1
#  endif
#endif

#ifdef ISAAC_HAVE_LUA
#include "lauxlib.h"
#include "lua.h"
#include "lualib.h"

void isaac_lua_guest_invoke(uint32_t fn, CpuState *cpu, const uint32_t *args, unsigned nargs);
void isaac_lua_host_enter(uintptr_t here, uint32_t guest_esp);
void isaac_lua_host_leave(uintptr_t here);
const uint8_t *isaac_fs_peek(const char *path, uint32_t *len);
uint32_t isaac_guest_alloc(uint32_t n);
void     isaac_guest_free(uint32_t p);

#define RGON_DIR "mods/repentogon/"

static lua_State *g_L;                       /* the state the layer was booted in */
static int g_pre[RGON_HOOKS], g_post[RGON_HOOKS];
static unsigned g_hook_calls, g_hook_errors, g_native_calls;
static char g_boot_key;

/* ---- the bridge ---------------------------------------------------------- */

static uint32_t addr_arg(lua_State *L, int i, uint32_t n) {
    const uint32_t a = (uint32_t)luaL_checkinteger(L, i);
    if (a < 0x1000u || !isaac_is_guest_va(a) || a + n < a || !isaac_is_guest_va(a + n - 1u))
        luaL_error(L, "rgon: 0x%08x (+%d) is not guest memory", (int)a, (int)n);
    return a;
}

/* any Lua value as one 32-bit stack word: an integer, a boolean, a game
 * object (the address its userdata holds), nil as 0. A float is passed as
 * its bits (bridge.f2i). */
static uint32_t word_arg(lua_State *L, int i) {
    switch (lua_type(L, i)) {
    case LUA_TNUMBER:
        if (lua_isinteger(L, i)) return (uint32_t)lua_tointeger(L, i);
        return (uint32_t)(int32_t)lua_tonumber(L, i);
    case LUA_TBOOLEAN: return (uint32_t)lua_toboolean(L, i);
    case LUA_TUSERDATA: {
        const uint32_t ud = isaac_va(lua_touserdata(L, i));
        return ud ? isaac_r32(ud + 4u) : 0u;
    }
    case LUA_TLIGHTUSERDATA: return isaac_va(lua_touserdata(L, i));
    case LUA_TNIL: case LUA_TNONE: return 0u;
    default:
        return (uint32_t)luaL_error(L, "rgon: argument %d cannot be a stack word (%s)", i, luaL_typename(L, i));
    }
}

/* ptr(object) -> the address of the game object a luabridge userdata holds
 * (Userdata: a vtable, then the pointer), 0 for nil */
static int l_ptr(lua_State *L) { lua_pushinteger(L, (lua_Integer)word_arg(L, 1)); return 1; }
/* ud(object) -> the address of the userdata block itself */
static int l_ud(lua_State *L) {
    lua_pushinteger(L, lua_isuserdata(L, 1) ? (lua_Integer)isaac_va(lua_touserdata(L, 1)) : 0);
    return 1;
}
static int l_r8(lua_State *L)   { lua_pushinteger(L, isaac_r8(addr_arg(L, 1, 1))); return 1; }
static int l_r16(lua_State *L)  { lua_pushinteger(L, isaac_r16(addr_arg(L, 1, 2))); return 1; }
static int l_r32(lua_State *L)  { lua_pushinteger(L, (lua_Integer)isaac_r32(addr_arg(L, 1, 4))); return 1; }
static int l_ri32(lua_State *L) { lua_pushinteger(L, (lua_Integer)(int32_t)isaac_r32(addr_arg(L, 1, 4))); return 1; }
static int l_rf32(lua_State *L) { float f; memcpy(&f, isaac_g(addr_arg(L, 1, 4)), 4); lua_pushnumber(L, (lua_Number)f); return 1; }
static int l_rf64(lua_State *L) { double d; memcpy(&d, isaac_g(addr_arg(L, 1, 8)), 8); lua_pushnumber(L, (lua_Number)d); return 1; }
static int l_w8(lua_State *L)   { *(uint8_t *)isaac_g(addr_arg(L, 1, 1)) = (uint8_t)word_arg(L, 2); return 0; }
static int l_w16(lua_State *L)  { isaac_w16(addr_arg(L, 1, 2), (uint16_t)word_arg(L, 2)); return 0; }
static int l_w32(lua_State *L)  { isaac_w32(addr_arg(L, 1, 4), word_arg(L, 2)); return 0; }
static int l_wf32(lua_State *L) { float f = (float)luaL_checknumber(L, 2); memcpy(isaac_g(addr_arg(L, 1, 4)), &f, 4); return 0; }
static int l_wf64(lua_State *L) { double d = (double)luaL_checknumber(L, 2); memcpy(isaac_g(addr_arg(L, 1, 8)), &d, 8); return 0; }
static int l_f2i(lua_State *L)  { float f = (float)luaL_checknumber(L, 1); uint32_t u; memcpy(&u, &f, 4); lua_pushinteger(L, (lua_Integer)u); return 1; }
static int l_i2f(lua_State *L)  { uint32_t u = (uint32_t)luaL_checkinteger(L, 1); float f; memcpy(&f, &u, 4); lua_pushnumber(L, (lua_Number)f); return 1; }

/* str(address [, length]) -> a C string out of guest memory (4 KiB at most) */
static int l_str(lua_State *L) {
    const uint32_t a = addr_arg(L, 1, 1);
    if (!lua_isnoneornil(L, 2)) {
        const uint32_t n = (uint32_t)luaL_checkinteger(L, 2);
        if (n > (1u << 20)) return luaL_error(L, "rgon: str of %d bytes", (int)n);
        if (n) (void)addr_arg(L, 1, n);
        lua_pushlstring(L, (const char *)isaac_g(a), n);
        return 1;
    }
    uint32_t n = 0;
    while (n < 4096u && isaac_is_guest_va(a + n) && isaac_r8(a + n)) ++n;
    lua_pushlstring(L, (const char *)isaac_g(a), n);
    return 1;
}
/* stdstr(address) -> an MSVC std::string (16 bytes inline or a pointer, then
 * the size and the capacity) */
static int l_stdstr(lua_State *L) {
    const uint32_t a = addr_arg(L, 1, 24);
    const uint32_t n = isaac_r32(a + 16u), cap = isaac_r32(a + 20u);
    const uint32_t p = cap >= 16u ? isaac_r32(a) : a;
    if (n > (1u << 20) || n > cap || p < 0x1000u || !isaac_is_guest_va(p) || !isaac_is_guest_va(p + n))
        return luaL_error(L, "rgon: 0x%08x is not a std::string", (int)a);
    lua_pushlstring(L, (const char *)isaac_g(p), n);
    return 1;
}
static int l_alloc(lua_State *L) {
    const uint32_t n = (uint32_t)luaL_checkinteger(L, 1);
    const uint32_t p = n <= (64u << 20) ? isaac_guest_alloc(n) : 0u;
    if (p) memset(isaac_g(p), 0, n);
    lua_pushinteger(L, (lua_Integer)p);
    return 1;
}
static int l_free(lua_State *L) { isaac_guest_free((uint32_t)luaL_checkinteger(L, 1)); return 0; }

/* call(va, regs, ...) -> eax, st0, edx
 * A guest function by address. `regs` is nil or a table of the registers the
 * convention wants ({ecx = this} for a thiscall; eax, edx, ebx, esi, edi for
 * the game's register-argument functions); the rest are stack words, first
 * argument first. The callee's own `ret n` is irrelevant: the call runs on a
 * frame of its own. Three results, of which the caller takes the one the
 * function really returns: EAX as an unsigned integer, ST0 as a number (a
 * float or double return), EDX. */
static uint32_t reg_field(lua_State *L, int t, const char *name) {
    lua_getfield(L, t, name);
    const uint32_t v = word_arg(L, -1);
    lua_pop(L, 1);
    return v;
}
static int l_call(lua_State *L) {
    const uint32_t va = (uint32_t)luaL_checkinteger(L, 1);
    if (!isaac_in_image(va)) return luaL_error(L, "rgon: call to 0x%08x, which is not in the image", (int)va);
    CpuState cpu;
    memset(&cpu, 0, sizeof cpu);
    if (lua_istable(L, 2)) {
        cpu.EAX = reg_field(L, 2, "eax"); cpu.ECX = reg_field(L, 2, "ecx"); cpu.EDX = reg_field(L, 2, "edx");
        cpu.EBX = reg_field(L, 2, "ebx"); cpu.ESI = reg_field(L, 2, "esi"); cpu.EDI = reg_field(L, 2, "edi");
        /* round 103: a float argument the function takes in an SSE register (xmm0..xmm3) */
        static const char *const XMM[4] = { "xmm0", "xmm1", "xmm2", "xmm3" };
        uint8_t *const zmm[4] = { cpu.ZMM0, cpu.ZMM1, cpu.ZMM2, cpu.ZMM3 };
        for (int i = 0; i < 4; ++i) {
            lua_getfield(L, 2, XMM[i]);
            if (lua_isnumber(L, -1)) { const float f = (float)lua_tonumber(L, -1); memcpy(zmm[i], &f, 4); }
            lua_pop(L, 1);
        }
    } else if (!lua_isnoneornil(L, 2)) {
        cpu.ECX = word_arg(L, 2);              /* the common case: just `this` */
    }
    uint32_t args[24];
    const int n = lua_gettop(L) - 2;
    if (n > 24) return luaL_error(L, "rgon: call with %d stack words", n);
    for (int i = 0; i < n; ++i) args[i] = word_arg(L, 3 + i);
    ++g_native_calls;
    isaac_lua_guest_invoke(va, &cpu, args, n > 0 ? (unsigned)n : 0u);
    double st0;
    memcpy(&st0, cpu.ST0, 8);
    lua_pushinteger(L, (lua_Integer)cpu.EAX);
    lua_pushnumber(L, (lua_Number)st0);
    lua_pushinteger(L, (lua_Integer)cpu.EDX);
    return 3;
}

/* xmm(n [, value]) -> the low float of SSE register n (0..7) of the hooked
 * call a `before` handler is running for; with a value, sets it. Some game
 * functions take a float argument there rather than on the stack (the
 * signature says which). Outside a `before` handler it is an error. */
static CpuState *g_hook_cpu;
static int l_xmm(lua_State *L) {
    const lua_Integer n = luaL_checkinteger(L, 1);
    if (!g_hook_cpu) return luaL_error(L, "rgon: xmm outside a hook's before handler");
    if (n < 0 || n > 7) return luaL_error(L, "rgon: no xmm%d", (int)n);
    uint8_t *const zmm[8] = { g_hook_cpu->ZMM0, g_hook_cpu->ZMM1, g_hook_cpu->ZMM2, g_hook_cpu->ZMM3,
                              g_hook_cpu->ZMM4, g_hook_cpu->ZMM5, g_hook_cpu->ZMM6, g_hook_cpu->ZMM7 };
    float f;
    if (lua_gettop(L) >= 2) { f = (float)luaL_checknumber(L, 2); memcpy(zmm[n], &f, 4); return 0; }
    memcpy(&f, zmm[n], 4);
    lua_pushnumber(L, (lua_Number)f);
    return 1;
}

/* registry(key [, f]) -> the function the Lua registry holds under an integer
 * key; with f, f takes its place and the one it replaces comes back.
 * The game keeps its callback runner there: LuaEngine::Init (0x008604c0)
 * takes a reference to main.lua's _RunCallback and then clears the global, so
 * the only way to stand between the engine and a callback list is to swap
 * what that reference holds (the layer reads the key out of the engine
 * object). Only a function, and only over a function. */
static int l_registry(lua_State *L) {
    const lua_Integer key = luaL_checkinteger(L, 1);
    const int set = lua_gettop(L) >= 2;
    if (set) luaL_checktype(L, 2, LUA_TFUNCTION);
    lua_rawgeti(L, LUA_REGISTRYINDEX, key);
    if (!lua_isfunction(L, -1)) {
        if (set) return luaL_error(L, "rgon: registry[%d] is not a function", (int)key);
        lua_pop(L, 1);
        lua_pushnil(L);
        return 1;
    }
    if (set) { lua_pushvalue(L, 2); lua_rawseti(L, LUA_REGISTRYINDEX, key); }
    return 1;
}

/* cfn(f) -> f as a C function. luabridge's __index returns what it finds in a
 * class table only if lua_iscfunction says so, and THROWS std::logic_error on
 * a Lua function ("not a cfunction"), so a method written in Lua goes in
 * through this. */
static int cfn_thunk(lua_State *L) {
    const int n = lua_gettop(L);
    lua_pushvalue(L, lua_upvalueindex(1));
    lua_insert(L, 1);
    lua_call(L, n, LUA_MULTRET);
    return lua_gettop(L);
}
static int l_cfn(lua_State *L) {
    luaL_checktype(L, 1, LUA_TFUNCTION);
    lua_pushvalue(L, 1);
    lua_pushcclosure(L, cfn_thunk, 1);
    return 1;
}

/* obj(class_metatable, address, vtable) -> a luabridge UserdataPtr for a game
 * object: {vtable, pointer} with the class's metatable. The vtable is read by
 * the layer off a userdata the game made itself. nil for a null address. */
static int l_obj(lua_State *L) {
    luaL_checktype(L, 1, LUA_TTABLE);
    const uint32_t p = word_arg(L, 2), vt = (uint32_t)luaL_checkinteger(L, 3);
    if (!p) { lua_pushnil(L); return 1; }
    if (!isaac_in_image(vt)) return luaL_error(L, "rgon: obj with a vtable outside the image");
    uint32_t *ud = (uint32_t *)lua_newuserdata(L, 8);
    ud[0] = vt; ud[1] = p;
    lua_pushvalue(L, 1);
    lua_setmetatable(L, -2);
    return 1;
}

/* hook(slot, before, after): the handlers of a wrapped game function.
 *   before(ecx, esp, edx) -> nothing: the function runs as it was called;
 *                         -> true, eax, n: it does not run; EAX and `ret n`
 *                            are answered for it;
 *                         -> anything else: kept and handed to `after`.
 *     The arguments are at esp+4, esp+8, ... and may be rewritten in place.
 *   after(ecx, esp, eax, kept) -> nothing, or a new EAX. */
static int l_hook(lua_State *L) {
    const lua_Integer slot = luaL_checkinteger(L, 1);
    if (slot < 0 || slot >= RGON_HOOKS) return luaL_error(L, "rgon: no hook slot %d", (int)slot);
    for (int k = 0; k < 2; ++k) {
        int *ref = k ? &g_post[slot] : &g_pre[slot];
        if (*ref != LUA_NOREF) { luaL_unref(L, LUA_REGISTRYINDEX, *ref); *ref = LUA_NOREF; }
        if (lua_isfunction(L, 2 + k)) { lua_pushvalue(L, 2 + k); *ref = luaL_ref(L, LUA_REGISTRYINDEX); }
    }
    g_rgon_hook_on[slot] = (uint8_t)(g_pre[slot] != LUA_NOREF || g_post[slot] != LUA_NOREF);
    return 0;
}

/* gate(value, who): `REPENTOGON` reads as `value` in the mods named in `who`
 * (a table of mod folder names, or true for every mod) and as nil elsewhere.
 * The reader is the Lua function doing the lookup; its chunk name carries the
 * mod's folder ("//mods/<folder>/..."). */
static int gate_index(lua_State *L) {
    if (lua_type(L, 2) == LUA_TSTRING) {
        size_t n;
        const char *k = lua_tolstring(L, 2, &n);
        if (n == 10 && memcmp(k, "REPENTOGON", 10) == 0) {
            if (!lua_istable(L, lua_upvalueindex(2))) {
                if (lua_toboolean(L, lua_upvalueindex(2))) lua_pushvalue(L, lua_upvalueindex(1)); else lua_pushnil(L);
                return 1;
            }
            lua_Debug ar;
            if (lua_getstack(L, 1, &ar) && lua_getinfo(L, "S", &ar) && ar.source) {
                const char *m = strstr(ar.source, "mods/");
                const char *e = m ? strchr(m + 5, '/') : NULL;
                if (e && e - (m + 5) < 120) {
                    char dir[128];
                    size_t dn = (size_t)(e - (m + 5));
                    for (size_t i = 0; i < dn; ++i) { char c = m[5 + i]; dir[i] = (char)(c >= 'A' && c <= 'Z' ? c + 32 : c); }
                    dir[dn] = 0;
                    lua_getfield(L, lua_upvalueindex(2), dir);
                    if (lua_toboolean(L, -1)) {
                        /* said once per mod: which mods run on the layer is the
                         * first thing anybody reading a log wants to know */
                        lua_getfield(L, lua_upvalueindex(4), dir);
                        if (lua_isnil(L, -1)) {
                            lua_pushboolean(L, 1);
                            lua_setfield(L, lua_upvalueindex(4), dir);
                            isaac_log("[isaac][rgon] REPENTOGON is visible to the mod '%s'", dir);
                        }
                        lua_pushvalue(L, lua_upvalueindex(1));
                        return 1;
                    }
                }
            }
            lua_pushnil(L);
            return 1;
        }
    }
    /* whatever __index the globals had before */
    if (lua_isfunction(L, lua_upvalueindex(3))) {
        lua_pushvalue(L, lua_upvalueindex(3));
        lua_pushvalue(L, 1); lua_pushvalue(L, 2);
        lua_call(L, 2, 1);
        return 1;
    }
    if (lua_istable(L, lua_upvalueindex(3))) {
        lua_pushvalue(L, 2);
        lua_gettable(L, lua_upvalueindex(3));
        return 1;
    }
    lua_pushnil(L);
    return 1;
}
static int l_gate(lua_State *L) {
    lua_settop(L, 2);
    lua_pushglobaltable(L);                                   /* 3 */
    lua_pushnil(L); lua_setfield(L, 3, "REPENTOGON");         /* the lookup must miss */
    if (!lua_getmetatable(L, 3)) { lua_newtable(L); lua_pushvalue(L, -1); lua_setmetatable(L, 3); }   /* 4 */
    lua_pushvalue(L, 1);
    lua_pushvalue(L, 2);
    lua_getfield(L, 4, "__index");
    lua_newtable(L);                                          /* the mods already told about */
    lua_pushcclosure(L, gate_index, 4);
    lua_setfield(L, 4, "__index");
    return 0;
}

static int l_log(lua_State *L) {
    isaac_log("[isaac][rgon] %s", luaL_tolstring(L, 1, NULL));
    return 0;
}

/* load(name) -> the chunk of a sibling file of the layer, or nil and why */
static int l_load(lua_State *L) {
    const char *name = luaL_checkstring(L, 1);
    char path[200], chunk[220];
    if (strstr(name, "..") || strchr(name, ':') || name[0] == '/' || name[0] == '\\' || strlen(name) > 120)
        return luaL_error(L, "rgon: load of '%s'", name);
    snprintf(path, sizeof path, RGON_DIR "%s", name);
    snprintf(chunk, sizeof chunk, "@//" RGON_DIR "%s", name);
    uint32_t n = 0;
    const uint8_t *src = isaac_fs_peek(path, &n);
    if (!src) { lua_pushnil(L); lua_pushfstring(L, "no file %s", path); return 2; }
    if (luaL_loadbufferx(L, (const char *)src, n, chunk, "t") != LUA_OK) { lua_pushnil(L); lua_insert(L, -2); return 2; }
    return 1;
}
static int l_env(lua_State *L) {
    const char *v = getenv(luaL_checkstring(L, 1));
    if (v) lua_pushstring(L, v); else lua_pushnil(L);
    return 1;
}

static const luaL_Reg BRIDGE[] = {
    {"ptr", l_ptr}, {"ud", l_ud},
    {"r8", l_r8}, {"r16", l_r16}, {"r32", l_r32}, {"ri32", l_ri32}, {"rf32", l_rf32}, {"rf64", l_rf64},
    {"w8", l_w8}, {"w16", l_w16}, {"w32", l_w32}, {"wf32", l_wf32}, {"wf64", l_wf64},
    {"f2i", l_f2i}, {"i2f", l_i2f}, {"str", l_str}, {"stdstr", l_stdstr},
    {"alloc", l_alloc}, {"free", l_free}, {"call", l_call}, {"cfn", l_cfn}, {"obj", l_obj},
    {"hook", l_hook}, {"gate", l_gate}, {"log", l_log}, {"load", l_load}, {"env", l_env}, {"xmm", l_xmm}, {"registry", l_registry},
    {NULL, NULL},
};

/* the selftest's way in: the bridge table on top of the stack */
void isaac_rgon_push_bridge(lua_State *L) {
    lua_newtable(L);
    luaL_setfuncs(L, BRIDGE, 0);
    lua_pushinteger(L, RGON_HOOKS); lua_setfield(L, -2, "HOOKS");
    lua_pushinteger(L, 1); lua_setfield(L, -2, "API");        /* the bridge's own version */
    /* round 103: Lua's own os library, for the layer to hand mods the four
     * functions of it REPENTOGON gives them (date, time, clock, difftime). The
     * game opens seven libraries by name and os is not one of them, so there
     * is no `os` at all without this; the table goes to the layer, not to the
     * globals. */
    luaL_requiref(L, "os", luaopen_os, 0);
    lua_setfield(L, -2, "os");
}

/* ---- boot ---------------------------------------------------------------- */

static void hooks_reset(lua_State *L) {
    for (int i = 0; i < RGON_HOOKS; ++i) {
        if (L && g_pre[i] != LUA_NOREF) luaL_unref(L, LUA_REGISTRYINDEX, g_pre[i]);
        if (L && g_post[i] != LUA_NOREF) luaL_unref(L, LUA_REGISTRYINDEX, g_post[i]);
        g_pre[i] = g_post[i] = LUA_NOREF;
        g_rgon_hook_on[i] = 0;
    }
}

void isaac_rgon_on_close(lua_State *L) {
    if (L != g_L) return;
    hooks_reset(NULL);                    /* the registry goes with the state */
    g_L = NULL;
}

/* A Lua error raised with no protected call around it ends the process: Lua
 * calls the panic function, and then abort(). The game sets none, so the
 * abort came with no word of what the error was (round 103: an error out of a
 * finaliser, run by the collector inside a host API call). This says it. */
static int rgon_panic(lua_State *L) {
    const char *msg = lua_tostring(L, -1);
    isaac_log("[isaac][lua] PANIC: a Lua error outside any protected call: %s", msg ? msg : "(not a string)");
    return 0;
}

void isaac_rgon_before_chunk(lua_State *L, const char *chunkname) {
    static int inited;
    if (!inited) { inited = 1; hooks_reset(NULL); }
    if (!L || !chunkname || !strstr(chunkname, "mods/")) return;
    lua_pushlightuserdata(L, &g_boot_key);
    lua_rawget(L, LUA_REGISTRYINDEX);
    const int done = !lua_isnil(L, -1);
    lua_pop(L, 1);
    if (done) return;
    lua_pushlightuserdata(L, &g_boot_key);
    lua_pushboolean(L, 1);
    lua_rawset(L, LUA_REGISTRYINDEX);
    {
        const char *e = getenv("ISAAC_RGON");
        if (e && *e == '0') return;
    }
    uint32_t n = 0;
    const uint8_t *src = isaac_fs_peek(RGON_DIR "rgon.lua", &n);
    if (!src) return;                     /* the layer's mod is not installed, or is off */
    if (g_L && g_L != L) hooks_reset(NULL);
    g_L = L;
    {   /* say what an unprotected Lua error was, unless the game has a panic function of its own */
        lua_CFunction old = lua_atpanic(L, rgon_panic);
        if (old && old != rgon_panic) lua_atpanic(L, old);
    }
    const int top = lua_gettop(L);
    if (luaL_loadbufferx(L, (const char *)src, n, "@//" RGON_DIR "rgon.lua", "t") != LUA_OK) {
        isaac_log("[isaac][rgon] rgon.lua does not load: %s", lua_tostring(L, -1));
        lua_settop(L, top);
        return;
    }
    isaac_rgon_push_bridge(L);
    if (lua_pcall(L, 1, 0, 0) != LUA_OK) {
        isaac_log("[isaac][rgon] rgon.lua stopped: %s", lua_tostring(L, -1));
        hooks_reset(L);
    } else {
        unsigned armed = 0;
        for (int i = 0; i < RGON_HOOKS; ++i) armed += g_rgon_hook_on[i];
        isaac_log("[isaac][rgon] the REPENTOGON-compatible layer is loaded (%u bytes of script, %u hook(s) armed)", n, armed);
    }
    lua_settop(L, top);
}

/* ---- hooks --------------------------------------------------------------- */

static void hook_error(lua_State *L, int slot, const char *when) {
    if (++g_hook_errors <= 24u)
        isaac_log("[isaac][rgon] hook %d (%s): %s", slot, when, lua_tostring(L, -1));
}

/* Before the wrapped function. Returns 1 when the handler answered for it
 * (the return is already emulated), 0 to let it run. */
int isaac_rgon_hook_pre(int slot, CpuState *restrict s, rgon_frame *f) {
    lua_State *L = g_L;
    f->esp = s->ESP; f->ecx = s->ECX; f->edx = s->EDX; f->ref = LUA_NOREF;
    if (!L || g_pre[slot] == LUA_NOREF) return 0;
    volatile char anchor = 0;
    const uintptr_t here = (uintptr_t)&anchor;
    int skip = 0;
    uint32_t eax = 0, retn = 0;
    ++g_hook_calls;
    isaac_lua_host_enter(here, f->esp);
    CpuState *const outer = g_hook_cpu;
    g_hook_cpu = s;
    const int top = lua_gettop(L);
    lua_rawgeti(L, LUA_REGISTRYINDEX, g_pre[slot]);
    lua_pushinteger(L, (lua_Integer)f->ecx);
    lua_pushinteger(L, (lua_Integer)f->esp);
    lua_pushinteger(L, (lua_Integer)f->edx);
    if (lua_pcall(L, 3, 3, 0) != LUA_OK) {
        hook_error(L, slot, "before");
    } else if (lua_isboolean(L, top + 1) && lua_toboolean(L, top + 1)) {
        skip = 1;
        eax = word_arg(L, top + 2);
        retn = (uint32_t)lua_tointeger(L, top + 3);
    } else if (!lua_isnil(L, top + 1)) {
        lua_pushvalue(L, top + 1);
        f->ref = luaL_ref(L, LUA_REGISTRYINDEX);
    }
    lua_settop(L, top);
    g_hook_cpu = outer;
    isaac_lua_host_leave(here);
    if (skip) {
        if (retn > 0x100u) retn = 0;
        s->EAX = eax;
        s->EIP = isaac_r32(f->esp);
        s->ESP = f->esp + 4u + retn;
    }
    return skip;
}

/* After it (the wrapper has run any parked tail jump first). */
void isaac_rgon_hook_post(int slot, CpuState *restrict s, rgon_frame *f) {
    lua_State *L = g_L;
    if (!L) return;
    if (g_post[slot] != LUA_NOREF) {
        volatile char anchor = 0;
        const uintptr_t here = (uintptr_t)&anchor;
        ++g_hook_calls;
        isaac_lua_host_enter(here, s->ESP);
        const int top = lua_gettop(L);
        lua_rawgeti(L, LUA_REGISTRYINDEX, g_post[slot]);
        lua_pushinteger(L, (lua_Integer)f->ecx);
        lua_pushinteger(L, (lua_Integer)f->esp);
        lua_pushinteger(L, (lua_Integer)s->EAX);
        if (f->ref != LUA_NOREF) lua_rawgeti(L, LUA_REGISTRYINDEX, f->ref); else lua_pushnil(L);
        if (lua_pcall(L, 4, 1, 0) != LUA_OK) hook_error(L, slot, "after");
        else if (!lua_isnil(L, top + 1)) s->EAX = word_arg(L, top + 1);
        lua_settop(L, top);
        isaac_lua_host_leave(here);
    }
    if (f->ref != LUA_NOREF) { luaL_unref(L, LUA_REGISTRYINDEX, f->ref); f->ref = LUA_NOREF; }
}

void isaac_rgon_report(void) {
    if (!g_L && !g_hook_calls && !g_native_calls) return;
    isaac_log("[isaac][rgon] %u hook call(s), %u hook error(s), %u guest call(s) from the layer",
              g_hook_calls, g_hook_errors, g_native_calls);
}

#else   /* no Lua in this build: the wrappers still link, and never fire */

int isaac_rgon_hook_pre(int slot, CpuState *restrict s, rgon_frame *f) { (void)slot; (void)s; (void)f; return 0; }
void isaac_rgon_hook_post(int slot, CpuState *restrict s, rgon_frame *f) { (void)slot; (void)s; (void)f; }
void isaac_rgon_report(void) {}

#endif  /* ISAAC_HAVE_LUA */
