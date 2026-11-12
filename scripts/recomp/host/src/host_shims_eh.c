/* host_shims_eh.c -- round 95: the C++ catch a Lua error lands in.
 *
 * Rep+'s scripts/main.lua runs a mod's callback with no pcall of its own
 * (_RunCallback calls v.Function directly), so an error in a mod reaches the
 * engine's lua_pcallk (37 LuaRef-call functions 0x00872980..0x00875050 and 12
 * dispatchers that pcall themselves). A nonzero result builds a
 * luabridge::LuaException (0x0085c080: the message from lua_tolstring(L,-1))
 * and 0x008727d0 throws a copy of it (ThrowInfo 0x00bd5bf8). One of 72
 * LuaEngine dispatchers (0x008607a0 PostUpdate ... 0x008667d0) catches it:
 * `catch (const luabridge::LuaException &)`, which logs
 * `Error in "X" call: <message>` (logger 0x00a112c0), prints `"X" failed:`
 * to the debug console when a Game exists (0x00693180), and continues --
 * mostly at a plain epilogue, some returning a default. The port has no C++
 * exception runtime, so the throw trapped and one mod error ended the game.
 *
 * This carries out what the MSVC runtime would, from the image's own tables:
 * walk the fs:[0] chain from the thrower, read each frame's FuncInfo from its
 * __ehhandler thunk (mov eax, FuncInfo; jmp __CxxFrameHandler3), find the
 * first try block covering the frame's state with a handler for one of the
 * thrown CatchableTypes, run the unwind actions of every frame between
 * (0x008727d0's: the passed exception's destructor), unwind the catching frame
 * to the try's low state, set its state to tryHigh+1, bind the catch object,
 * call the catch funclet, destroy the thrown object (pmfnUnwind) and resume at
 * the continuation the funclet returns, with fs:[0] = the catching node, EBP
 * its frame and ESP = [ebp-0x10] -- through the guest longjmp replay.
 *
 * The scope is deliberately narrow: only a catch inside the innermost guest
 * call (g_guest_call_esp), only C++ frames on the way, only a by-reference or
 * catch(...) handler, and only a continuation the dispatcher can resume: a
 * lifted entry (Ghidra made 61 of the 72 continuations functions of their
 * own) or one of the eleven tails translated in isaac_eh_tail below.
 * GetShaderParams (0x00865490) continues into calls and a luaL_unref; round
 * 101 translates the arm a thrown callback takes (no table referenced yet).
 * Anything else traps as before. */
#include "isaac_host.h"
#include "shim_decls.h"

#include <stdio.h>
#include <string.h>

void isaac_guest_call(uint32_t va, CpuState *restrict cpu);
void isaac_guest_longjmp(CpuState *restrict cpu);
extern uint32_t g_guest_call_esp;
extern const uint32_t g_dva[];
extern const uint32_t g_ndispatch;

#define EH_MAGIC_LO 0x19930520u
#define EH_MAGIC_HI 0x19930522u

static uint8_t r8(uint32_t va) { return *(const uint8_t *)isaac_g(va); }
static int ok_range(uint32_t va, uint32_t n) { return isaac_is_guest_va(va) && isaac_is_guest_va(va + n - 1u); }

/* The FuncInfo an __ehhandler thunk names: B8 imm32 (mov eax, FuncInfo), then
 * E9 rel32 or FF 25 [slot] (jmp __CxxFrameHandler3); 0 for anything else. This
 * image is built with /GS, so the thunk first checks the frame's cookies --
 * `nop; nop; mov edx,[esp+8]; lea eax,[edx+0xc]; mov ecx,[edx-N]; xor ecx,eax;
 * call __security_check_cookie`, once or twice (0x00b04ecd) -- and the pair is
 * found by scanning the thunk's first 64 bytes; the FuncInfo's magic number is
 * what makes a match. */
uint32_t isaac_eh_funcinfo(uint32_t handler) {
    if (!ok_range(handler, 64u + 11u)) return 0;
    for (uint32_t at = handler; at < handler + 64u; ++at) {
        if (r8(at) != 0xB8u) continue;
        const uint8_t op = r8(at + 5u);
        if (op != 0xE9u && !(op == 0xFFu && r8(at + 6u) == 0x25u)) continue;
        const uint32_t fi = isaac_r32(at + 1u);
        if (!ok_range(fi, 20u)) continue;
        const uint32_t magic = isaac_r32(fi);
        if (magic >= EH_MAGIC_LO && magic <= EH_MAGIC_HI) return fi;
    }
    return 0;
}

/* Whether a handler of TypeDescriptor `ptype` takes the thrown type; *mdisp is
 * the matched CatchableType's this-displacement. ptype 0 is catch(...). */
static int eh_matches(uint32_t throwinfo, uint32_t ptype, uint32_t *mdisp) {
    *mdisp = 0;
    if (!ptype) return 1;
    const uint32_t cta = isaac_r32(throwinfo + 12u);
    if (!ok_range(cta, 4u)) return 0;
    const uint32_t n = isaac_r32(cta);
    for (uint32_t i = 0; i < n && i < 16u; ++i) {
        const uint32_t ct = isaac_r32(cta + 4u + 4u * i);
        if (!ok_range(ct, 28u)) continue;
        const uint32_t td = isaac_r32(ct + 4u);
        int same = td == ptype;
        if (!same && ok_range(td, 12u) && ok_range(ptype, 12u)) {     /* the decorated names, at +8 */
            const char *a = (const char *)isaac_g(td + 8u), *b = (const char *)isaac_g(ptype + 8u);
            same = strncmp(a, b, 128) == 0;
        }
        if (same) { *mdisp = isaac_r32(ct + 8u); return 1; }
    }
    return 0;
}

int isaac_eh_plan(uint32_t fs0, uint32_t throwinfo, uint32_t esp_limit, isaac_eh_plan_t *p) {
    memset(p, 0, sizeof *p);
    if (!ok_range(throwinfo, 16u)) return 0;
    uint32_t node = fs0;
    for (unsigned depth = 0; depth < 64u; ++depth) {
        if (node == 0xFFFFFFFFu || !ok_range(node, 12u)) return 0;     /* the end: nothing catches it */
        const uint32_t ebp = node + 0xcu;
        if (ebp >= esp_limit) return 0;                               /* past the innermost guest call */
        const uint32_t fi = isaac_eh_funcinfo(isaac_r32(node + 4u));
        if (!fi) return 0;                                            /* not a C++ frame */
        const int32_t state = (int32_t)isaac_r32(node + 8u);
        const uint32_t ntry = isaac_r32(fi + 12u), tmap = isaac_r32(fi + 16u);
        for (uint32_t t = 0; t < ntry && t < 64u; ++t) {
            const uint32_t e = tmap + 20u * t;
            if (!ok_range(e, 20u)) return 0;
            const int32_t lo = (int32_t)isaac_r32(e), hi = (int32_t)isaac_r32(e + 4u);
            if (state < lo || state > hi) continue;
            const uint32_t nc = isaac_r32(e + 12u), ha = isaac_r32(e + 16u);
            for (uint32_t c = 0; c < nc && c < 16u; ++c) {
                const uint32_t h = ha + 16u * c;
                if (!ok_range(h, 16u)) return 0;
                const uint32_t adj = isaac_r32(h), ptype = isaac_r32(h + 4u);
                uint32_t mdisp;
                if (!eh_matches(throwinfo, ptype, &mdisp)) continue;
                if (ptype && isaac_r32(h + 8u) && !(adj & 8u)) return 0;   /* a catch by value: not carried out */
                p->node = node; p->ebp = ebp; p->funcinfo = fi; p->state = state;
                p->try_low = lo; p->try_high = hi; p->adjectives = adj; p->ptype = ptype;
                p->disp = isaac_r32(h + 8u); p->handler = isaac_r32(h + 12u); p->mdisp = mdisp;
                return 1;
            }
        }
        if (p->n_nested >= ISAAC_EH_NESTED) return 0;
        p->nested_node[p->n_nested] = node;
        p->nested_state[p->n_nested] = state;
        p->nested_funcinfo[p->n_nested] = fi;
        ++p->n_nested;
        node = isaac_r32(node);
    }
    return 0;
}

/* ---- the ten continuations Ghidra did not make functions: exact epilogues */
static uint32_t pop32(CpuState *c) { const uint32_t v = isaac_r32(c->ESP); c->ESP += 4u; return v; }
static void ret_n(CpuState *c, uint32_t n) { c->EIP = pop32(c); c->ESP += n; }
static uint32_t fs_base(const CpuState *c) { return c->FS_OFFSET ? c->FS_OFFSET : ISAAC_TEB_VA; }
/* mov ecx,[ebp-0xc]; mov fs:[0],ecx */
static void fs0_restore(CpuState *c) { c->ECX = isaac_r32(c->EBP - 0xcu); isaac_w32(fs_base(c), c->ECX); }
/* pop ecx; pop edi; pop esi; pop ebx; mov esp,ebp; pop ebp; ret n */
static void tail_plain(CpuState *c, uint32_t n) {
    c->ECX = pop32(c); c->EDI = pop32(c); c->ESI = pop32(c); c->EBX = pop32(c);
    c->ESP = c->EBP; c->EBP = pop32(c); ret_n(c, n);
}
/* pop ecx; pop edi; pop esi; mov esp,ebp; pop ebp; mov esp,ebx; pop ebx; ret n (an aligned frame) */
static void tail_aligned(CpuState *c, uint32_t n) {
    c->ECX = pop32(c); c->EDI = pop32(c); c->ESI = pop32(c);
    c->ESP = c->EBP; c->EBP = pop32(c); c->ESP = c->EBX; c->EBX = pop32(c); ret_n(c, n);
}

int isaac_eh_tail(uint32_t cont, CpuState *c) {
    const uint32_t ebp = c->EBP;
    switch (cont) {
    case 0x00864abcu:                                     /* PreEntitySpawn: EAX stays the continuation */
        c->EBX = isaac_r32(ebp - 0x14u); fs0_restore(c); tail_aligned(c, 0x1cu); return 1;
    case 0x00864c03u:                                     /* PostCurseEval: the curses it was given */
        c->EBX = isaac_r32(ebp + 8u); c->EAX = c->EBX; fs0_restore(c); tail_plain(c, 4u); return 1;
    case 0x00864d61u: {                                   /* PreActionHook (bool): mov bh,[ebp-0x11]; mov al,bh */
        const uint32_t b = r8(ebp - 0x11u);
        c->EBX = (c->EBX & 0xFFFF00FFu) | (b << 8); c->EAX = (c->EAX & 0xFFFFFF00u) | b;
        fs0_restore(c); tail_plain(c, 0x10u); return 1;
    }
    case 0x00864eb8u: {                                   /* PreActionHook (float/value): mov bl,[ebp-0x11]; mov al,bl */
        const uint32_t b = r8(ebp - 0x11u);
        c->EBX = (c->EBX & 0xFFFFFF00u) | b; c->EAX = (c->EAX & 0xFFFFFF00u) | b;
        fs0_restore(c); tail_plain(c, 0x10u); return 1;
    }
    case 0x0086546fu:                                     /* GetCard: the card it was asked about */
        c->EBX = isaac_r32(ebp + 0xcu); c->EAX = c->EBX; fs0_restore(c); tail_plain(c, 0x14u); return 1;
    case 0x008659f9u:                                     /* GetTrinket: -> 0x00865a95 */
        c->EBX = isaac_r32(ebp - 0x14u); c->ESI = isaac_r32(ebp - 0x1cu);
        c->EAX = c->ESI; fs0_restore(c); tail_aligned(c, 8u); return 1;
    case 0x00865bb4u:                                     /* GetPillEffect: -> 0x00865c4b */
        c->EBX = isaac_r32(ebp - 0x14u); c->EAX = c->EBX; fs0_restore(c); tail_plain(c, 8u); return 1;
    case 0x00865d9eu:                                     /* GetPill */
        c->EBX = isaac_r32(ebp - 0x14u); c->EAX = c->EBX; fs0_restore(c); tail_plain(c, 8u); return 1;
    case 0x00865ee4u:                                     /* PreGetCollectible */
        c->EBX = isaac_r32(ebp - 0x14u); c->EAX = c->EBX; fs0_restore(c); tail_plain(c, 0xcu); return 1;
    case 0x00866033u:                                     /* PostGetCollectible */
        c->EBX = isaac_r32(ebp - 0x14u); c->EAX = c->EBX; fs0_restore(c); tail_plain(c, 0x10u); return 1;
    case 0x00865602u: {                                   /* GetShaderParams (round 101) */
        /* mov ebx,[ebp-0x20]; mov edi,[ebp-0x24]; mov esi,[ebp+8]; mov [esi],edi;
         * cmp ebx,-1; je -> or eax,-1; mov [esi+4],eax; luaL_unref(L, REGISTRY, -1);
         * mov eax,esi; epilogue; ret 8. The reference at [ebp-0x20] is written
         * only after the callback's pcall has returned, and the throw comes out
         * of that pcall, so it is still -1 here: the result is {L, LUA_NOREF}
         * and the unref of -1 is a no-op (luaL_unref returns at once for a
         * negative ref). The other arm -- a table already referenced -- runs
         * calls and is left untranslated: it stops as before. */
        const uint32_t ref = isaac_r32(ebp - 0x20u), L = isaac_r32(ebp - 0x24u), out = isaac_r32(ebp + 8u);
        if (ref != 0xFFFFFFFFu || !ok_range(out, 8u)) return 0;
        isaac_w32(out, L); isaac_w32(out + 4u, 0xFFFFFFFFu);
        c->EAX = out; fs0_restore(c); tail_plain(c, 8u); return 1;
    }
    default:
        return 0;
    }
}

static int lifted_entry(uint32_t va) {
    for (uint32_t i = 0; i < g_ndispatch; ++i) if (g_dva[i] == va) return 1;
    return 0;
}

/* a funclet or destructor, called the way the runtime calls it: EBP the frame,
 * ECX `this`, on a stack below everything live */
static uint32_t eh_call(uint32_t va, const CpuState *cpu, uint32_t ebp, uint32_t ecx) {
    CpuState sub = *cpu;
    sub.EBP = ebp; sub.ECX = ecx;
    sub.ESP = (cpu->ESP - 0x800u) & ~0xFu;
    sub.ESP -= 4u; isaac_w32(sub.ESP, 0u);
    isaac_guest_call(va, &sub);
    return sub.EAX;
}

/* a frame's unwind map from `state` down to `target`, the state stored before
 * each action as the runtime stores it */
static void eh_unwind(uint32_t fi, uint32_t node, int32_t state, int32_t target, const CpuState *cpu) {
    const uint32_t max = isaac_r32(fi + 4u), umap = isaac_r32(fi + 8u);
    for (unsigned n = 0; n < 256u && state != target && state >= 0 && (uint32_t)state < max; ++n) {
        const uint32_t e = umap + 8u * (uint32_t)state;
        if (!ok_range(e, 8u)) return;
        const int32_t to = (int32_t)isaac_r32(e);
        const uint32_t act = isaac_r32(e + 4u);
        isaac_w32(node + 8u, (uint32_t)to);
        if (act) (void)eh_call(act, cpu, node + 0xcu, 0u);
        state = to;
    }
}

/* Called by the _CxxThrowException shim. Returns only when it cannot carry the
 * catch out (and has done nothing); otherwise it resumes the guest. */
static uint32_t g_eh_caught;
void isaac_eh_throw(CpuState *restrict cpu) {
    const uint32_t obj = isaac_arg(cpu, 0), info = isaac_arg(cpu, 1), from = isaac_retaddr(cpu);
    if (!obj || !info) return;                              /* a rethrow: no object to hand on */
    isaac_eh_plan_t p;
    if (!isaac_eh_plan(isaac_r32(fs_base(cpu)), info, g_guest_call_esp, &p)) {
        static unsigned told;
        isaac_log("[isaac][c++] throw of 0x%08x from 0x%08x: no catch this host can carry out "
                  "(fs base 0x%08x, fs:[0] 0x%08x, ESP 0x%08x, innermost guest call ESP 0x%08x)",
                  info, isaac_retaddr(cpu), fs_base(cpu), isaac_r32(fs_base(cpu)), cpu->ESP, g_guest_call_esp);
        if (told++ < 2u) {                                       /* the chain, as the walk saw it */
            uint32_t node = isaac_r32(fs_base(cpu));
            for (unsigned i = 0; i < 6u && node != 0xFFFFFFFFu && ok_range(node, 12u); ++i) {
                const uint32_t h = isaac_r32(node + 4u);
                isaac_log("[isaac][c++]   node 0x%08x: next 0x%08x handler 0x%08x [%02x %02x %02x %02x %02x %02x] state %d funcinfo 0x%08x",
                          node, isaac_r32(node), h, ok_range(h, 6u) ? r8(h) : 0u, ok_range(h, 6u) ? r8(h + 1u) : 0u,
                          ok_range(h, 6u) ? r8(h + 2u) : 0u, ok_range(h, 6u) ? r8(h + 3u) : 0u,
                          ok_range(h, 6u) ? r8(h + 4u) : 0u, ok_range(h, 6u) ? r8(h + 5u) : 0u,
                          (int)isaac_r32(node + 8u), isaac_eh_funcinfo(h));
                node = isaac_r32(node);
            }
        }
        return;
    }
    for (uint32_t i = 0; i < p.n_nested; ++i)
        eh_unwind(p.nested_funcinfo[i], p.nested_node[i], p.nested_state[i], -1, cpu);
    eh_unwind(p.funcinfo, p.node, p.state, p.try_low, cpu);
    isaac_w32(p.node + 8u, (uint32_t)(p.try_high + 1));
    if (p.ptype && p.disp) isaac_w32(p.ebp + p.disp, obj + p.mdisp);
    const uint32_t cont = eh_call(p.handler, cpu, p.ebp, 0u);
    const uint32_t dtor = isaac_r32(info + 4u);
    if (dtor) (void)eh_call(dtor, cpu, cpu->EBP, obj);
    isaac_w32(fs_base(cpu), p.node);
    cpu->EBP = p.ebp;
    cpu->ESP = isaac_r32(p.ebp - 0x10u);
    cpu->EAX = cont;
    cpu->EIP = cont;
    if (++g_eh_caught <= 8u)
        isaac_log("[isaac][c++] throw of 0x%08x from 0x%08x caught by the frame at 0x%08x (catch 0x%08x), "
                  "%u frame(s) unwound; resuming at 0x%08x", info, from, p.ebp, p.handler, p.n_nested, cont);
    if (isaac_eh_tail(cont, cpu) || lifted_entry(cont)) {
        isaac_guest_longjmp(cpu);
        return;
    }
    isaac_log("[isaac][c++] the catch at 0x%08x continues at 0x%08x, which this build cannot resume", p.handler, cont);
}
