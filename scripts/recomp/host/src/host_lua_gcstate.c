/* host_lua_gcstate.c -- the one thing the host reads of Lua's private state.
 *
 * Round 113 (host_lua.c, isaac_lua_gc): whether the collector is between two
 * cycles. The public API does not say: LUA_GCSTEP answers 1 only when a cycle
 * ended inside that very call, and a cycle the game's steps started is often
 * finished by one of Lua's own steps (luaC_checkGC at an allocation, while
 * the debt is positive). The library is linked statically from the same
 * headers, so the state is read where it is kept (lstate.h global_State
 * .gcstate; lgc.h GCSpause). Its own translation unit, so Lua's internal
 * macros stay out of host_lua.c. Round 114 adds the one write: a metatable
 * set without the finalizer mark (below). */
#if defined(__has_include)
#  if __has_include("lstate.h")
#    define ISAAC_HAVE_LUA_STATE 1
#  endif
#endif

#ifdef ISAAC_HAVE_LUA_STATE
#include "lua.h"
#include "lstate.h"
#include "lgc.h"

/* 1 = no cycle is in progress (the collector waits for its next one) */
int isaac_lua_gc_paused(lua_State *L) { return G(L)->gcstate == GCSpause; }

/* Round 114: lua_setmetatable(L, idx) for a full userdata with a table on top,
 * without marking the object for finalization: lapi.c lua_setmetatable's
 * LUA_TUSERDATA case less its luaC_checkfinalizer call (the index is read as
 * index2addr reads a stack index). For an object whose __gc would do nothing
 * (host_lua.c 1d): it is then collected like any other garbage, in the cycle
 * it dies in, with no finalizer call. 1 = done and the table popped; 0 = not
 * that case, nothing touched. */
int isaac_lua_setmetatable_nofin(lua_State *L, int idx) {
    CallInfo *ci = L->ci;
    TValue *obj;
    if (L->top - (ci->func + 1) < 1) return 0;
    if (idx > 0) {
        obj = ci->func + idx;
        if (obj >= L->top) return 0;
    } else if (idx < 0 && idx > LUA_REGISTRYINDEX && -idx <= L->top - (ci->func + 1)) {
        obj = L->top + idx;
    } else {
        return 0;
    }
    if (!ttisfulluserdata(obj) || !ttistable(L->top - 1)) return 0;
    Table *mt = hvalue(L->top - 1);
    uvalue(obj)->metatable = mt;
    luaC_objbarrier(L, uvalue(obj), mt);
    L->top--;
    return 1;
}
#endif
