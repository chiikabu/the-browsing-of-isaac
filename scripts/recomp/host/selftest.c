/* selftest.c -- link-and-run check for the host layer.
 *
 * Compiling every translation unit proves syntax. This proves the things that
 * only appear at link and run time:
 *
 *   1. All 622 weak stubs and the 13 strong hand-written shims link together
 *      with no duplicate-symbol error.
 *   2. The strong shims ACTUALLY OVERRIDE the weak ones. A typo in an
 *      identifier would compile and link happily, leaving the trap in place --
 *      the failure would only show up as a mysterious abort at runtime.
 *   3. The IAT binding writes a token into all 650 slots and every token
 *      round-trips back to its import through isaac_resolve_shim().
 *   4. A STUB returns 0 loudly rather than silently.
 *   5. Host static data really does live below the guest image base.
 *
 * Build + run:  python scripts/recomp/host/build_selftest.py
 */

#include "isaac_host.h"
#include "shim_decls.h"   /* the 622 imp_* declarations */
#include "rtti_cases.h"   /* real RTTI chains from the image */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* Upstream Lua 5.3.3 is linked into the selftest when present (see
 * build_selftest.py: it adds -I third_party/lua-5.3.3/src and liblua.a).
 * The runtime checks below then prove the 59-symbol binding actually
 * executes against the real VM; without the header the same section is
 * compiled out and the stub layer is what the selftest exercises. */
#if defined(__has_include)
#  if __has_include("lua.h")
#    define ISAAC_SELFTEST_HAVE_LUA 1
#    include "lua.h"
#  endif
#endif

/* Provided by the host layer TUs under test. */
void     isaac_heap_report(void);
uint64_t isaac_heap_peak(void);
void     isaac_cxx_report(void);
void     isaac_module_report(void);
unsigned isaac_stub_record_count(void);
uint32_t isaac_call_site_from_return(uint32_t ret);

/* Externs the host layer expects from the lifted module. Standalone build
 * supplies inert versions: nothing here transfers control to guest code. */
void isaac_guest_call(uint32_t va, CpuState *restrict cpu) {
    (void)va;
    if (cpu) cpu->EAX = 0;
}
static int g_image_loaded;
int isaac_image_is_loaded(void) { return g_image_loaded; }

/* Load the real memory image so the RTTI walk runs on real descriptors.
 * Built with -sNODERAWFS=1, so fopen reaches the actual filesystem. */
static void load_image(const char *path) {
    FILE *f = fopen(path, "rb");
    if (!f) { printf("      image: cannot open %s\n", path); return; }
    size_t n = fread(isaac_g(ISAAC_IMAGE_BASE), 1, ISAAC_IMAGE_SIZE, f);
    fclose(f);
    g_image_loaded = (n > 0x1000 && isaac_r16(ISAAC_IMAGE_BASE) == 0x5A4D);
    printf("      image: %zu bytes at 0x%08x, MZ=%s\n", n, ISAAC_IMAGE_BASE,
           g_image_loaded ? "yes" : "NO");
}

static int g_fail;
static void check(int cond, const char *what) {
    if (!cond) {
        printf("FAIL  %s\n", what);
        ++g_fail;
    } else {
        printf("ok    %s\n", what);
    }
}

int main(int argc, char **argv) {
    printf("--- isaac host layer selftest ---\n");
    if (argc > 1) load_image(argv[1]);

    /* 5. THE BLAST-RADIUS INVARIANT: host state must be unreachable by a
     * wild guest pointer. The lifter saw one wild write corrupt the
     * dispatch table and cascade into 1,429 bogus downstream failures. */
    static const char probe = 0;
    uint32_t hva = isaac_va(&probe);
    printf("      host static 0x%08x | guest limit 0x%08x | host base 0x%08x\n",
           hva, ISAAC_GUEST_LIMIT_VA, ISAAC_HOST_BASE_VA);
    check(hva >= ISAAC_HOST_BASE_VA,
          "host static data is above the host base");
    check(!isaac_is_guest_va(hva),
          "host static data is outside the guest-reachable range");
    void *hp = malloc(4096);
    printf("      host malloc 0x%08x\n", isaac_va(hp));
    check(isaac_va(hp) >= ISAAC_HOST_BASE_VA,
          "host malloc also lands above the host base");
    free(hp);
    check(isaac_is_guest_va(ISAAC_IMAGE_END - 1) &&
          isaac_is_guest_va(ISAAC_HEAP_VA + ISAAC_HEAP_SIZE - 1) &&
          isaac_is_guest_va(ISAAC_STACK_TOP_VA - 1) &&
          isaac_is_guest_va(ISAAC_SHIM_BASE + (isaac_import_count - 1) * ISAAC_SHIM_STRIDE),
          "image, heap, stack and shim tokens are all below the guest limit");
    check(ISAAC_HEAP_VA >= ISAAC_IMAGE_END,
          "guest heap is above the image, so a .data overrun hits guest memory");
    check(ISAAC_GUARD_VA + ISAAC_GUARD_SIZE == ISAAC_HOST_BASE_VA,
          "the guard region abuts the host base with no gap");

    /* 1. table shape: 622 static IAT imports + the dynamic (LoadLibrary/
     * GetProcAddress) exports the game resolves at runtime (RtlVerifyVersionInfo,
     * wgl*, gl*, xinput, steam ctx, ...). The exact total is a canary that
     * moves only when gen_shims.py's DYNAMIC_EXPORTS changes. */
    check(isaac_import_count == 723, "622 IAT + 101 dynamic imports linked");

    /* 3. tokens are unique and round-trip */
    unsigned round = 0, uniq = 1;
    for (unsigned i = 0; i < isaac_import_count; ++i) {
        isaac_import *imp = &isaac_imports[i];
        if (isaac_resolve_shim(imp->shim_va) == imp) ++round;
        if (i && isaac_imports[i].shim_va <= isaac_imports[i - 1].shim_va)
            uniq = 0;
    }
    check(round == isaac_import_count, "every shim token resolves to its import");
    check(uniq, "shim tokens are strictly increasing (hence unique)");
    check(isaac_resolve_shim(ISAAC_IMAGE_BASE) == NULL,
          "an ordinary guest VA does not resolve to a shim");
    check(isaac_resolve_shim(ISAAC_SHIM_BASE + 1) == NULL,
          "a misaligned token does not resolve");

    /* 3b. IAT binding: needs the .rdata IAT page to be addressable memory. */
    memset(isaac_g(ISAAC_IAT_VA), 0, ISAAC_IAT_SLOTS * 4);
    isaac_boot_bind_iat();
    unsigned bound = 0, slotted = 0;
    for (unsigned i = 0; i < isaac_import_count; ++i) {
        /* Dynamic (LoadLibrary/GetProcAddress) exports have no IAT slot
         * (iat_slot_va == 0) and are bound at resolve time, not here. */
        if (!isaac_imports[i].iat_slot_va) continue;
        ++slotted;
        if (isaac_r32(isaac_imports[i].iat_slot_va) == isaac_imports[i].shim_va)
            ++bound;
    }
    printf("      %u/%u IAT slots hold their shim token (%u dynamic exports unslotted)\n",
           bound, slotted, isaac_import_count - slotted);
    check(bound == slotted, "IAT binding wrote every slotted import");

    /* 2. THE OVERRIDE CHECK.
     * imp_..._errno is hand-written and must return the errno cell VA. The weak
     * fallback for a REAL verdict calls isaac_trap(), which aborts -- so if the
     * override failed to take, this test does not merely fail, it terminates.
     * Reaching the line after the call is itself part of the assertion. */
    CpuState cpu;
    memset(&cpu, 0, sizeof cpu);
    cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
    isaac_w32(cpu.ESP, 0xDEADBEEF);          /* return address */
    imp_api_ms_win_crt_runtime___errno(&cpu);
    printf("      _errno returned 0x%08x\n", cpu.EAX);
    check(cpu.EAX != 0, "strong shim _errno overrode the weak trap");

    /* _set_errno / _errno agree */
    memset(&cpu, 0, sizeof cpu);
    cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
    isaac_w32(cpu.ESP, 0xDEADBEEF);
    isaac_w32(cpu.ESP + 4, 42);
    imp_api_ms_win_crt_runtime___set_errno(&cpu);
    memset(&cpu, 0, sizeof cpu);
    cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
    isaac_w32(cpu.ESP, 0xDEADBEEF);
    imp_api_ms_win_crt_runtime___errno(&cpu);
    check(isaac_r32(cpu.EAX) == 42, "_set_errno(42) then _errno reads back 42");

    /* __acrt_iob_func must hand out three distinct guest-visible blocks */
    uint32_t iob[3];
    for (unsigned i = 0; i < 3; ++i) {
        memset(&cpu, 0, sizeof cpu);
        cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
        isaac_w32(cpu.ESP, 0xDEADBEEF);
        isaac_w32(cpu.ESP + 4, i);
        imp_api_ms_win_crt_stdio____acrt_iob_func(&cpu);
        iob[i] = cpu.EAX;
    }
    check(iob[0] && iob[1] && iob[2] && iob[0] != iob[1] && iob[1] != iob[2],
          "__acrt_iob_func returns 3 distinct non-null streams");
    check(isaac_r32(iob[2] + 0x10) == 2, "stderr block carries fd 2 at +0x10");

    /* 4. a STUB is inert but loud, and returns 0 */
    isaac_import *stub = NULL;
    for (unsigned i = 0; i < isaac_import_count; ++i) {
        if (isaac_imports[i].verdict == ISAAC_V_STUB &&
            isaac_imports[i].call_sites > 0) { stub = &isaac_imports[i]; break; }
    }
    check(stub != NULL, "found a STUB import to exercise");
    if (stub) {
        printf("      exercising stub %s!%s (purge %u)\n",
               stub->dll, stub->symbol, stub->arg_bytes);
        memset(&cpu, 0, sizeof cpu);
        cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
        isaac_w32(cpu.ESP, 0x00401234);
        uint32_t esp0 = cpu.ESP;
        int handled = isaac_indirect_call(stub->shim_va, &cpu);
        check(handled == 1, "isaac_indirect_call handled the shim token");
        check(cpu.EAX == 0, "stub returned 0");
        check(cpu.ESP == esp0 + 4u + stub->arg_bytes,
              "stub popped return address + its stdcall purge");
        check(cpu.EIP == 0x00401234, "stub returned to the caller VA");
        /* PROVES OUR weak definitions won the link. Both this layer and the
         * lifter emitted weak imp_* definitions for the same 591 imports; two
         * weak symbols do not collide, so the linker silently picks one. The
         * lifter's stub returns without recording anything, so a non-zero
         * record count is only possible if ours survived. Neither layer's own
         * tests could catch this, because the bug exists only in the pair. */
        check(isaac_stub_record_count() > 0,
              "this layer's weak stub definitions are the ones linked in");
    }

    /* 6. THE GUEST ALLOCATOR must hand out GUEST addresses.
     * Forwarding guest malloc to the host allocator would return pointers
     * above the guard -- write access to the runtime. This is the check that
     * catches that regression. */
    uint32_t ptrs[8];
    for (unsigned i = 0; i < 8; ++i) {
        memset(&cpu, 0, sizeof cpu);
        cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
        isaac_w32(cpu.ESP, 0xDEADBEEF);
        isaac_w32(cpu.ESP + 4, 1024u << i);
        imp_api_ms_win_crt_heap__malloc(&cpu);
        ptrs[i] = cpu.EAX;
    }
    int all_guest = 1, all_distinct = 1;
    for (unsigned i = 0; i < 8; ++i) {
        if (!ptrs[i] || !isaac_is_guest_va(ptrs[i])) all_guest = 0;
        if (ptrs[i] < ISAAC_HEAP_VA ||
            ptrs[i] >= ISAAC_HEAP_VA + ISAAC_HEAP_SIZE) all_guest = 0;
        for (unsigned j = i + 1; j < 8; ++j)
            if (ptrs[i] == ptrs[j]) all_distinct = 0;
    }
    printf("      guest malloc[0] 0x%08x  peak %llu bytes\n",
           ptrs[0], (unsigned long long)isaac_heap_peak());
    check(all_guest, "guest malloc returns pointers inside the GUEST arena");
    check(all_distinct, "guest malloc returns distinct blocks");
    check(isaac_heap_peak() > 0, "heap high-water meter is recording");

    /* the blocks must be writable and not overlap */
    for (unsigned i = 0; i < 8; ++i)
        memset(isaac_g(ptrs[i]), (int)(i + 1), 1024u << i);
    int intact = 1;
    for (unsigned i = 0; i < 8; ++i) {
        const uint8_t *q = (const uint8_t *)isaac_g(ptrs[i]);
        for (uint32_t k = 0; k < (1024u << i); ++k)
            if (q[k] != (uint8_t)(i + 1)) { intact = 0; break; }
    }
    check(intact, "guest heap blocks do not overlap after writing all of them");

    /* free then reallocate: the arena must be reusable */
    uint64_t peak_before = isaac_heap_peak();
    for (unsigned i = 0; i < 8; ++i) {
        memset(&cpu, 0, sizeof cpu);
        cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
        isaac_w32(cpu.ESP, 0xDEADBEEF);
        isaac_w32(cpu.ESP + 4, ptrs[i]);
        imp_api_ms_win_crt_heap__free(&cpu);
    }
    memset(&cpu, 0, sizeof cpu);
    cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
    isaac_w32(cpu.ESP, 0xDEADBEEF);
    isaac_w32(cpu.ESP + 4, 4096);
    imp_api_ms_win_crt_heap__malloc(&cpu);
    check(cpu.EAX && isaac_is_guest_va(cpu.EAX),
          "arena is reusable after free (coalescing works)");
    check(isaac_heap_peak() == peak_before,
          "peak is a high-water mark, not the live figure");

    /* VirtualAlloc must also stay inside the guest range and zero its memory */
    memset(&cpu, 0, sizeof cpu);
    cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
    isaac_w32(cpu.ESP, 0xDEADBEEF);
    isaac_w32(cpu.ESP + 4, 0);        /* lpAddress  */
    isaac_w32(cpu.ESP + 8, 65536);    /* dwSize     */
    isaac_w32(cpu.ESP + 12, 0x1000);  /* MEM_COMMIT */
    isaac_w32(cpu.ESP + 16, 0x04);
    imp_kernel32__VirtualAlloc(&cpu);
    uint32_t va = cpu.EAX;
    int zeroed = 1;
    if (va) {
        const uint8_t *q = (const uint8_t *)isaac_g(va);
        for (uint32_t k = 0; k < 65536; ++k) if (q[k]) { zeroed = 0; break; }
    }
    check(va && isaac_is_guest_va(va), "VirtualAlloc returns a guest address");
    check(zeroed, "VirtualAlloc zeroes its memory (malloc does not)");

    /* the TEB must be installable and give fs:[0] an empty SEH chain */
    isaac_boot_install_teb();
    check(isaac_r32(ISAAC_TEB_VA + 0x00) == 0xFFFFFFFFu,
          "TEB ExceptionList is an empty SEH chain");
    check(isaac_r32(ISAAC_TEB_VA + 0x18) == ISAAC_TEB_VA, "TEB Self is correct");
    check(isaac_r32(ISAAC_PEB_VA + 0x08) == ISAAC_IMAGE_BASE,
          "PEB ImageBaseAddress is the image base");

    /* 7. __RTDynamicCast against REAL RTTI.
     * Validating a dynamic_cast implementation against a mock proves only that
     * the mock agrees with the implementation. These are genuine MSVC
     * descriptor chains read out of the shipped .rdata, so the shim is
     * exercised on the same bytes the game will hand it. Requires the memory
     * image; skipped if it could not be loaded. */
    if (g_image_loaded && G_NRTTI > 0) {
        unsigned ok_up = 0, ok_neg = 0;
        for (unsigned i = 0; i < G_NRTTI; ++i) {
            const RttiCase *rc = &g_rtti[i];
            /* Synthesise an object: first dword is the vfptr. Put it in the
             * guest heap so it is a realistic address. */
            uint32_t obj = ISAAC_HEAP_VA + 0x10000 + i * 64;
            isaac_w32(obj, rc->vftable);

            /* upcast to a real base in the hierarchy */
            memset(&cpu, 0, sizeof cpu);
            cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
            isaac_w32(cpu.ESP, 0xDEADBEEF);
            isaac_w32(cpu.ESP + 4, obj);
            isaac_w32(cpu.ESP + 8, 0);
            isaac_w32(cpu.ESP + 12, rc->typeDescriptor);
            isaac_w32(cpu.ESP + 16, rc->baseTypeDescriptor);
            isaac_w32(cpu.ESP + 20, 0);
            imp_vcruntime140____RTDynamicCast(&cpu);
            uint32_t got = cpu.EAX;
            uint32_t want = obj + (uint32_t)rc->mdisp;
            if (got == want) ++ok_up;
            else printf("      RTTI[%u] %s -> %s: got 0x%08x want 0x%08x\n",
                        i, rc->name, rc->baseName, got, want);

            /* negative: a type descriptor that is not in this hierarchy at all */
            memset(&cpu, 0, sizeof cpu);
            cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
            isaac_w32(cpu.ESP, 0xDEADBEEF);
            isaac_w32(cpu.ESP + 4, obj);
            isaac_w32(cpu.ESP + 8, 0);
            isaac_w32(cpu.ESP + 12, rc->typeDescriptor);
            isaac_w32(cpu.ESP + 16, ISAAC_IMAGE_BASE + 0x1000);  /* not a TD */
            isaac_w32(cpu.ESP + 20, 0);
            imp_vcruntime140____RTDynamicCast(&cpu);
            if (cpu.EAX == 0) ++ok_neg;
        }
        printf("      RTTI cases: %u/%u upcasts, %u/%u correct nulls\n",
               ok_up, G_NRTTI, ok_neg, G_NRTTI);
        check(ok_up == G_NRTTI,
              "__RTDynamicCast resolves real upcasts through real RTTI");
        check(ok_neg == G_NRTTI,
              "__RTDynamicCast returns null for a type not in the hierarchy");

        /* null in, null out -- and it must not walk anything */
        memset(&cpu, 0, sizeof cpu);
        cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
        isaac_w32(cpu.ESP, 0xDEADBEEF);
        isaac_w32(cpu.ESP + 4, 0);
        imp_vcruntime140____RTDynamicCast(&cpu);
        check(cpu.EAX == 0, "__RTDynamicCast(nullptr) is nullptr");
        isaac_cxx_report();
    } else {
        printf("      (RTTI cases skipped: memory image not loaded)\n");
    }

    /* 8. The 16 imports on the critical path to main() must all be real. */
    {
        static const char *boot16[] = {
            "_set_app_type", "_set_fmode", "__p__commode", "_crt_atexit",
            "_configure_narrow_argv", "InitializeSListHead", "_controlfp_s",
            "_configthreadlocale", "_initialize_narrow_environment",
            "InitializeCriticalSectionAndSpinCount", "GetModuleHandleW",
            "IsProcessorFeaturePresent", "memset", "IsDebuggerPresent",
            "SetUnhandledExceptionFilter", "UnhandledExceptionFilter",
        };
        unsigned found = 0, real = 0;
        for (unsigned i = 0; i < sizeof boot16 / sizeof boot16[0]; ++i)
            for (unsigned j = 0; j < isaac_import_count; ++j)
                if (!strcmp(isaac_imports[j].symbol, boot16[i])) {
                    ++found;
                    if (isaac_imports[j].verdict == ISAAC_V_REAL ||
                        isaac_imports[j].verdict == ISAAC_V_PROVIDED) ++real;
                    break;
                }
        printf("      boot-critical: %u/16 present, %u REAL/PROVIDED\n",
               found, real);
        check(found == 16, "all 16 boot-critical imports are in the table");
        check(real == 16, "all 16 are REAL or PROVIDED, none left a stub");
    }

    /* They must EXECUTE, not trap. A weak fallback for a REAL verdict aborts,
     * so reaching the line after each call is part of the assertion. */
    memset(&cpu, 0, sizeof cpu);
    cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
    isaac_w32(cpu.ESP, 0xDEADBEEF);
    imp_kernel32__IsDebuggerPresent(&cpu);
    check(cpu.EAX == 0, "IsDebuggerPresent returns 0 without trapping");

    memset(&cpu, 0, sizeof cpu);
    cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
    isaac_w32(cpu.ESP, 0xDEADBEEF);
    imp_api_ms_win_crt_stdio____p__commode(&cpu);
    check(cpu.EAX && isaac_is_guest_va(cpu.EAX),
          "__p__commode returns a guest-visible cell the CRT writes through");

    memset(&cpu, 0, sizeof cpu);
    cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
    isaac_w32(cpu.ESP, 0xDEADBEEF);
    isaac_w32(cpu.ESP + 4, 10);          /* PF_XMMI64 (SSE2) */
    imp_kernel32__IsProcessorFeaturePresent(&cpu);
    check(cpu.EAX == 1, "IsProcessorFeaturePresent reports SSE2 available");

    memset(&cpu, 0, sizeof cpu);
    cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
    isaac_w32(cpu.ESP, 0xDEADBEEF);
    isaac_w32(cpu.ESP + 4, 0);
    imp_kernel32__GetModuleHandleW(&cpu);
    check(cpu.EAX == ISAAC_IMAGE_BASE,
          "GetModuleHandleW(NULL) returns the image base");

    /* memset must refuse a destination on the HOST side of the guard. */
    memset(&cpu, 0, sizeof cpu);
    cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
    isaac_w32(cpu.ESP, 0xDEADBEEF);
    isaac_w32(cpu.ESP + 4, ISAAC_HOST_BASE_VA);
    isaac_w32(cpu.ESP + 8, 0xAA);
    isaac_w32(cpu.ESP + 12, 64);
    uint32_t host_canary = *(volatile uint32_t *)isaac_g(ISAAC_HOST_BASE_VA);
    imp_vcruntime140__memset(&cpu);
    check(*(volatile uint32_t *)isaac_g(ISAAC_HOST_BASE_VA) == host_canary,
          "memset refuses a host-range destination and leaves it untouched");

    /* 9. The trap message must name the CALL SITE, not the return address.
     * The lifter observed _set_app_type demanded from return address
     * 0x00aefa07; the call is at 0x00aefa02. */
    if (g_image_loaded) {
        uint32_t site = isaac_call_site_from_return(0x00aefa07u);
        printf("      call-site decode: ret 0x00aefa07 -> 0x%08x\n", site);
        check(site == 0x00aefa02u,
              "call site recovered from the return address (off-by-one fixed)");
    }

    /* 10. THE MODULE-HANDLE STORY, and the specific decision that unblocks the
     * boot. FUN_00aef191 treats a NULL kernel32 handle as fatal (je at
     * 0x00aef1c3 -> STATUS_FATAL_APP_EXIT) while handling a NULL api-set
     * handle by design, so these two answers must differ. */
    {
        /* build UTF-16 names in guest memory */
        uint32_t nbuf = ISAAC_HEAP_VA + 0x40000;
        const char *k32 = "kernel32.dll";
        const char *apiset = "api-ms-win-core-synch-l1-2-0.dll";
        uint32_t n1 = nbuf, n2 = nbuf + 256;
        for (unsigned i = 0; ; ++i) { isaac_w32(n1 + 2u * i, k32[i]); if (!k32[i]) break; }
        for (unsigned i = 0; ; ++i) { isaac_w32(n2 + 2u * i, apiset[i]); if (!apiset[i]) break; }

        memset(&cpu, 0, sizeof cpu);
        cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
        isaac_w32(cpu.ESP, 0xDEADBEEF);
        isaac_w32(cpu.ESP + 4, n1);
        imp_kernel32__GetModuleHandleW(&cpu);
        uint32_t hk32 = cpu.EAX;
        printf("      GetModuleHandleW(kernel32.dll) -> 0x%08x\n", hk32);
        check(hk32 != 0,
              "GetModuleHandleW(kernel32.dll) is non-NULL (the boot blocker)");
        check(isaac_is_guest_va(hk32), "module handle is a guest-side token");

        memset(&cpu, 0, sizeof cpu);
        cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
        isaac_w32(cpu.ESP, 0xDEADBEEF);
        isaac_w32(cpu.ESP + 4, n2);
        imp_kernel32__GetModuleHandleW(&cpu);
        check(cpu.EAX == 0,
              "GetModuleHandleW(api-set) is NULL, which the caller handles");

        memset(&cpu, 0, sizeof cpu);
        cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
        isaac_w32(cpu.ESP, 0xDEADBEEF);
        isaac_w32(cpu.ESP + 4, 0);
        imp_kernel32__GetModuleHandleW(&cpu);
        check(cpu.EAX == ISAAC_IMAGE_BASE,
              "GetModuleHandleW(NULL) is the image base, as on Windows");

        /* GetProcAddress must return THE SHIM TOKEN -- the same value the IAT
         * holds -- so a dynamically resolved pointer and a statically bound
         * one are the same thing. */
        uint32_t sbuf = nbuf + 512;
        const char *sym = "CreateEventW";
        for (unsigned i = 0; ; ++i) {
            *(uint8_t *)isaac_g(sbuf + i) = (uint8_t)sym[i];
            if (!sym[i]) break;
        }
        memset(&cpu, 0, sizeof cpu);
        cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
        isaac_w32(cpu.ESP, 0xDEADBEEF);
        isaac_w32(cpu.ESP + 4, hk32);
        isaac_w32(cpu.ESP + 8, sbuf);
        imp_kernel32__GetProcAddress(&cpu);
        uint32_t proc = cpu.EAX;
        isaac_import *viaproc = isaac_resolve_shim(proc);
        printf("      GetProcAddress(kernel32, CreateEventW) -> 0x%08x\n", proc);
        check(proc != 0, "GetProcAddress resolves a symbol we implement");
        check(viaproc && !strcmp(viaproc->symbol, "CreateEventW"),
              "GetProcAddress returns the SAME shim token the IAT holds");
        check(viaproc && isaac_r32(viaproc->iat_slot_va) == proc,
              "that token is bit-identical to the bound IAT slot");

        /* A DYNAMIC export (not in the static IAT) must ALSO resolve: the game
         * probes ntdll!RtlVerifyVersionInfo via GetProcAddress and calls the
         * result unconditionally, so a NULL here is the boot fault at
         * 0x00a8102c. gen_shims.py emits these dynamic rows into the C table;
         * this proves GetProcAddress finds one. */
        uint32_t hntdll = 0;
        {
            const char *nt = "ntdll.dll";
            uint32_t nbuf16 = nbuf + 800;
            for (unsigned i = 0; ; ++i) { isaac_w32(nbuf16 + 2u * i, nt[i]); if (!nt[i]) break; }
            memset(&cpu, 0, sizeof cpu);
            cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
            isaac_w32(cpu.ESP, 0xDEADBEEF);
            isaac_w32(cpu.ESP + 4, nbuf16);
            imp_kernel32__GetModuleHandleW(&cpu);
            hntdll = cpu.EAX;
        }
        const char *rtl = "RtlVerifyVersionInfo";
        for (unsigned i = 0; ; ++i) {
            *(uint8_t *)isaac_g(sbuf + i) = (uint8_t)rtl[i];
            if (!rtl[i]) break;
        }
        memset(&cpu, 0, sizeof cpu);
        cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
        isaac_w32(cpu.ESP, 0xDEADBEEF);
        isaac_w32(cpu.ESP + 4, hntdll);
        isaac_w32(cpu.ESP + 8, sbuf);
        imp_kernel32__GetProcAddress(&cpu);
        isaac_import *rtlimp = isaac_resolve_shim(cpu.EAX);
        check(cpu.EAX != 0 && rtlimp && !strcmp(rtlimp->symbol, "RtlVerifyVersionInfo"),
              "GetProcAddress resolves the dynamic ntdll!RtlVerifyVersionInfo export");

        /* A symbol we do not have must be NULL -- callers probe deliberately. */
        const char *absent = "SleepConditionVariableCS";
        for (unsigned i = 0; ; ++i) {
            *(uint8_t *)isaac_g(sbuf + i) = (uint8_t)absent[i];
            if (!absent[i]) break;
        }
        memset(&cpu, 0, sizeof cpu);
        cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
        isaac_w32(cpu.ESP, 0xDEADBEEF);
        isaac_w32(cpu.ESP + 4, hk32);
        isaac_w32(cpu.ESP + 8, sbuf);
        imp_kernel32__GetProcAddress(&cpu);
        check(cpu.EAX == 0,
              "GetProcAddress returns NULL for a symbol we do not provide");
    }

    /* 11. CreateEventW must be non-NULL or the same fatal branch fires one
     * step later, and the event has to actually behave. */
    memset(&cpu, 0, sizeof cpu);
    cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
    isaac_w32(cpu.ESP, 0xDEADBEEF);
    isaac_w32(cpu.ESP + 4, 0);        /* attrs        */
    isaac_w32(cpu.ESP + 8, 1);        /* manual reset */
    isaac_w32(cpu.ESP + 12, 0);       /* initial      */
    isaac_w32(cpu.ESP + 16, 0);       /* name         */
    imp_kernel32__CreateEventW(&cpu);
    uint32_t ev = cpu.EAX;
    printf("      CreateEventW -> 0x%08x\n", ev);
    check(ev != 0, "CreateEventW is non-NULL (the intended CRT fallback)");

    memset(&cpu, 0, sizeof cpu);
    cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
    isaac_w32(cpu.ESP, 0xDEADBEEF);
    isaac_w32(cpu.ESP + 4, ev);
    isaac_w32(cpu.ESP + 8, 0);        /* zero timeout */
    imp_kernel32__WaitForSingleObject(&cpu);
    check(cpu.EAX == 0x102u,
          "wait on an unsignalled event with 0 timeout returns WAIT_TIMEOUT");

    memset(&cpu, 0, sizeof cpu);
    cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
    isaac_w32(cpu.ESP, 0xDEADBEEF);
    isaac_w32(cpu.ESP + 4, ev);
    imp_kernel32__SetEvent(&cpu);
    memset(&cpu, 0, sizeof cpu);
    cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
    isaac_w32(cpu.ESP, 0xDEADBEEF);
    isaac_w32(cpu.ESP + 4, ev);
    isaac_w32(cpu.ESP + 8, 0xFFFFFFFFu);
    imp_kernel32__WaitForSingleObject(&cpu);
    check(cpu.EAX == 0, "after SetEvent, an INFINITE wait returns WAIT_OBJECT_0");

#ifdef ISAAC_SELFTEST_HAVE_LUA
    /* 12. LUA -- the 59-symbol binding against a REAL upstream 5.3.3 module.
     * The compile-time ABI gates live in host_lua.c (LUAL_NUMSIZES == 136,
     * no LUA_COMPAT_5_2, no LUA_32BITS); these checks prove the linked module
     * executes and every marshalling convention round-trips THROUGH THE SHIMS:
     * doubles cross two stack slots, 64-bit integers cross EDX:EAX/st(0) on
     * the way out, Lua allocates inside the guest arena, and guest
     * lua_CFunction pointers ride pooled trampolines. */
    extern uint32_t isaac_guest_alloc(uint32_t n);
    extern void     isaac_guest_free(uint32_t p);
    extern unsigned isaac_lua_trampolines_used(void);
    extern void     isaac_lua_report(void);

    uint32_t scratch = isaac_guest_alloc(1024);
    CpuState lc;
    lua_State *L;
    int isnum = 0;
    double dbl;
    lua_Integer lint, lgot;
    size_t slen;
    const char *sret;
    unsigned tl;

#  define LFRAME() do { \
        memset(&lc, 0, sizeof lc); \
        lc.ESP = ISAAC_STACK_TOP_VA - 0x1000; \
        isaac_w32(lc.ESP, 0xDEADBEEF); \
    } while (0)
#  define LARG(n, v) isaac_w32(lc.ESP + 4u + 4u * (n), (uint32_t)(v))
#  define LARG64(n, v) do { \
        uint64_t _u; memcpy(&_u, &(v), 8); \
        isaac_w32(lc.ESP + 4u + 4u * (n), (uint32_t)_u); \
        isaac_w32(lc.ESP + 4u + 4u * (n) + 4u, (uint32_t)(_u >> 32)); \
    } while (0)

    /* luaL_newstate must return a guest-addressable state: the binding
     * supplies the guest-arena allocator, so L and every object it owns land
     * below the guard. */
    memcpy(isaac_g(scratch), "sync", 5);
    memcpy(isaac_g(scratch + 16), "return 2+3", 11);
    LFRAME();
    imp_lua5_3_3r__luaL_newstate(&lc);
    L = (lua_State *)isaac_g(lc.EAX);
    printf("      luaL_newstate -> 0x%08x\n", lc.EAX);
    check(lc.EAX != 0 && isaac_is_guest_va(lc.EAX),
          "luaL_newstate returns a guest-addressable lua_State");

    LFRAME();
    LARG(0, isaac_va(L));
    imp_lua5_3_3r__luaL_openlibs(&lc);
    LFRAME();
    LARG(0, isaac_va(L));
    LARG(1, LUA_GCCOUNT);
    LARG(2, 0);
    imp_lua5_3_3r__lua_gc(&lc);
    printf("      lua_gc LUA_GCCOUNT -> %u KB\n", lc.EAX);
    check(lc.EAX > 0, "the Lua VM really allocated after openlibs");

    /* doubles: two stack slots in, round-trip out without narrowing. */
    dbl = 1.5;
    LFRAME();
    LARG(0, isaac_va(L));
    LARG64(1, dbl);
    imp_lua5_3_3r__lua_pushnumber(&lc);
    dbl = lua_tonumberx(L, -1, NULL);
    check(dbl == 1.5 && lua_type(L, -1) == LUA_TNUMBER,
          "lua_pushnumber shim round-trips a double");

    /* 64-bit integers: the high dword must not be dropped. A silent 32-bit
     * truncation would turn 0x123456789ABCDEF0 into 0x789ABCDEF0. */
    lint = (lua_Integer)0x123456789ABCDEF0ULL;
    LFRAME();
    LARG(0, isaac_va(L));
    LARG64(1, lint);
    imp_lua5_3_3r__lua_pushinteger(&lc);
    lgot = lua_tointegerx(L, -1, &isnum);
    check(isnum && memcmp(&lgot, &lint, 8) == 0,
          "lua_pushinteger shim round-trips a 64-bit lua_Integer");

    /* strings: the pointer argument is guest memory and must be read as-is. */
    LFRAME();
    LARG(0, isaac_va(L));
    LARG(1, scratch);
    imp_lua5_3_3r__lua_pushstring(&lc);
    sret = lua_tolstring(L, -1, &slen);
    check(slen == 4 && sret && memcmp(sret, "sync", 4) == 0,
          "lua_pushstring shim round-trips a guest string");

    /* the actual VM: compile and run a chunk through the load/pcall shims. */
    LFRAME();
    LARG(0, isaac_va(L));
    LARG(1, scratch + 16);
    LARG(2, 10);
    LARG(3, scratch + 16);
    LARG(4, 0);
    imp_lua5_3_3r__luaL_loadbufferx(&lc);
    check(lc.EAX == LUA_OK, "luaL_loadbufferx compiles a chunk (LUA_OK)");
    LFRAME();
    LARG(0, isaac_va(L));
    LARG(1, 0);
    LARG(2, 1);
    LARG(3, 0);
    imp_lua5_3_3r__lua_pcallk(&lc);
    check(lc.EAX == LUA_OK, "lua_pcallk runs the chunk (LUA_OK)");
    lgot = lua_tointegerx(L, -1, &isnum);
    check(isnum && lgot == 5,
          "upstream Lua VM computes 2+3 inside the wasm module");

    /* guest lua_CFunction pointers must ride distinct pooled trampolines and
     * deduplicate; calling one fires the inert isaac_guest_call (nothing here
     * transfers control to guest code) and must still come back LUA_OK. */
    LFRAME();
    LARG(0, isaac_va(L));
    LARG(1, 0x01234567u);
    LARG(2, 0);
    imp_lua5_3_3r__lua_pushcclosure(&lc);
    tl = isaac_lua_trampolines_used();
    check(tl == 1, "lua_pushcclosure registers the first trampoline");
    LFRAME();
    LARG(0, isaac_va(L));
    LARG(1, 0x07654321u);
    LARG(2, 0);
    imp_lua5_3_3r__lua_pushcclosure(&lc);
    check(isaac_lua_trampolines_used() == 2,
          "distinct guest C functions get distinct trampolines");
    LFRAME();
    LARG(0, isaac_va(L));
    LARG(1, 0x01234567u);
    LARG(2, 0);
    imp_lua5_3_3r__lua_pushcclosure(&lc);
    check(isaac_lua_trampolines_used() == 2,
          "re-registering the same guest C function reuses its trampoline");
    LFRAME();
    LARG(0, isaac_va(L));
    LARG(1, (uint32_t)-1);
    imp_lua5_3_3r__lua_iscfunction(&lc);
    check(lc.EAX == 1, "the trampoline closure reads back as a C function");
    LFRAME();
    LARG(0, isaac_va(L));
    LARG(1, 0);
    LARG(2, 1);
    LARG(3, 0);
    imp_lua5_3_3r__lua_pcallk(&lc);
    check(lc.EAX == LUA_OK,
          "calling the trampoline closure yields LUA_OK (inert guest call)");

    /* return-convention checks: luaL_checknumber returns in st(0),
     * luaL_checkinteger in EDX:EAX. */
    dbl = 7.25;
    LFRAME();
    LARG(0, isaac_va(L));
    LARG64(1, dbl);
    imp_lua5_3_3r__lua_pushnumber(&lc);
    LFRAME();
    LARG(0, isaac_va(L));
    LARG(1, (uint32_t)-1);
    imp_lua5_3_3r__luaL_checknumber(&lc);
    memcpy(&dbl, lc.ST0, 8);
    check(dbl == 7.25, "luaL_checknumber returns the double in st(0)");
    lint = 42;
    LFRAME();
    LARG(0, isaac_va(L));
    LARG64(1, lint);
    imp_lua5_3_3r__lua_pushinteger(&lc);
    LFRAME();
    LARG(0, isaac_va(L));
    LARG(1, (uint32_t)-1);
    imp_lua5_3_3r__luaL_checkinteger(&lc);
    check(lc.EAX == 42 && lc.EDX == 0,
          "luaL_checkinteger returns in EDX:EAX");

    LFRAME();
    LARG(0, isaac_va(L));
    imp_lua5_3_3r__lua_close(&lc);
    check(isaac_lua_trampolines_used() == 2,
          "trampoline pool survives lua_close");
    isaac_guest_free(scratch);
    isaac_lua_report();
#  undef LFRAME
#  undef LARG
#  undef LARG64
#endif

    /* 13. BOOT ASSET SEEDING: isaac_fs_seed() must place a file the game's
     * own fopen/fread shims read back byte-for-byte, at the key those shims
     * compute from the same relative path — this is what lets the packed
     * archives be present so Manager::LoadImage stops returning NULL on the
     * HUD path (the guest fault at 0x009a26c2). Parent dirs must appear so a
     * directory scan sees the file. */
    {
        extern int isaac_fs_seed(const char *path, const uint8_t *data, uint32_t len);
        static const uint8_t payload[] = {
            'I','S','A','A','C','P','A','K', 0x01, 0x00, 0x00, 0x00,
            0xDE, 0xAD, 0xBE, 0xEF, 0x55, 0xAA, 0x00, 0xFF,
        };
        int seeded = isaac_fs_seed("resources/packed/graphics.a",
                                   payload, (uint32_t)sizeof payload);
        check(seeded == 1, "isaac_fs_seed placed the archive file");

        /* the parent directory the game FindFirstFile-scans must exist */
        uint32_t dbuf = ISAAC_HEAP_VA + 0x50000;
        const char *dpath = "resources/packed";
        for (unsigned i = 0; ; ++i) {
            *(uint8_t *)isaac_g(dbuf + i) = (uint8_t)dpath[i];
            if (!dpath[i]) break;
        }
        memset(&cpu, 0, sizeof cpu);
        cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
        isaac_w32(cpu.ESP, 0xDEADBEEF);
        isaac_w32(cpu.ESP + 4, dbuf);
        imp_kernel32__GetFileAttributesA(&cpu);
        check(cpu.EAX == 0x10u, "the seeded parent dir reads as a directory");

        /* open it through the SAME fopen shim the lifted game uses */
        uint32_t pbuf = dbuf + 256, mbuf = dbuf + 512, rbuf = dbuf + 640;
        const char *ppath = "resources/packed/graphics.a";
        for (unsigned i = 0; ; ++i) {
            *(uint8_t *)isaac_g(pbuf + i) = (uint8_t)ppath[i];
            if (!ppath[i]) break;
        }
        *(uint8_t *)isaac_g(mbuf) = 'r';
        *(uint8_t *)isaac_g(mbuf + 1) = 'b';
        *(uint8_t *)isaac_g(mbuf + 2) = 0;
        memset(&cpu, 0, sizeof cpu);
        cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
        isaac_w32(cpu.ESP, 0xDEADBEEF);
        isaac_w32(cpu.ESP + 4, pbuf);
        isaac_w32(cpu.ESP + 8, mbuf);
        imp_api_ms_win_crt_stdio__fopen(&cpu);
        uint32_t fh = cpu.EAX;
        check(fh != 0, "fopen finds the seeded archive by its normalized key");

        memset(&cpu, 0, sizeof cpu);
        cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
        isaac_w32(cpu.ESP, 0xDEADBEEF);
        isaac_w32(cpu.ESP + 4, rbuf);                 /* dst    */
        isaac_w32(cpu.ESP + 8, 1);                    /* size   */
        isaac_w32(cpu.ESP + 12, (uint32_t)sizeof payload); /* nmemb */
        isaac_w32(cpu.ESP + 16, fh);                  /* stream */
        imp_api_ms_win_crt_stdio__fread(&cpu);
        check(cpu.EAX == sizeof payload, "fread returns the full seeded length");
        int match = 1;
        for (unsigned i = 0; i < sizeof payload; ++i)
            if (*(uint8_t *)isaac_g(rbuf + i) != payload[i]) { match = 0; break; }
        check(match, "the bytes read back are byte-for-byte what was seeded");

        /* "." segments must collapse. The game probes its own cwd as "./"
         * during the save-data setup; that was normalising to the key
         * "c:/isaac/." and missing, so the probe reported "no such
         * directory" for the directory everything else resolves against.
         * Found with ISAAC_FS_TRACE=1 on a boot run. */
        static const char *const dotforms[] = {
            "./resources/packed", "resources/./packed", "./resources/./packed/",
        };
        for (unsigned k = 0; k < sizeof dotforms / sizeof dotforms[0]; ++k) {
            for (unsigned i = 0; ; ++i) {
                *(uint8_t *)isaac_g(dbuf + i) = (uint8_t)dotforms[k][i];
                if (!dotforms[k][i]) break;
            }
            memset(&cpu, 0, sizeof cpu);
            cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
            isaac_w32(cpu.ESP, 0xDEADBEEF);
            isaac_w32(cpu.ESP + 4, dbuf);
            imp_kernel32__GetFileAttributesA(&cpu);
            check(cpu.EAX == 0x10u, "a '.' segment collapses to the same dir key");
        }
        /* the bare cwd, in both spellings, is the FS root and always exists */
        static const char *const cwdforms[] = { ".", "./" };
        for (unsigned k = 0; k < 2; ++k) {
            for (unsigned i = 0; ; ++i) {
                *(uint8_t *)isaac_g(dbuf + i) = (uint8_t)cwdforms[k][i];
                if (!cwdforms[k][i]) break;
            }
            memset(&cpu, 0, sizeof cpu);
            cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
            isaac_w32(cpu.ESP, 0xDEADBEEF);
            isaac_w32(cpu.ESP + 4, dbuf);
            imp_kernel32__GetFileAttributesA(&cpu);
            check(cpu.EAX == 0x10u, "the bare cwd reads as a directory");
        }
    }

    /* 14. THE WIDE DIRECTORY SCAN THAT BUILDS KAGE'S MOUNT INDEX.
     * The engine's readdir (0x00a172e0 / opendir 0x00a16f50) lists a directory
     * with mbstowcs_s -> GetFullPathNameW -> "\*" -> FindFirstFileW, walks it
     * with FindNextFileW through a register-held import, and brings each
     * cFileName back with wcstombs_s. KAGE init scans the root that way to
     * fill the std::map every relative path resolves through (0x00a16c60).
     * With FindFirstFileW a stub the map stayed empty and all 18 packed
     * archives "Failed to open" before any fopen (boot round 9). Each check
     * here is one link of that chain against the SAME RAM-FS the game sees. */
    {
        extern int isaac_fs_seed(const char *path, const uint8_t *data, uint32_t len);
        static const uint8_t payload2[] = { 'A','R','C','H', 2, 0, 0, 0, 0x11, 0x22 };
        check(isaac_fs_seed("resources/packed/animations.a", payload2,
                            (uint32_t)sizeof payload2) == 1,
              "a second archive seeds beside the first");

        uint32_t wpat = ISAAC_HEAP_VA + 0x54000, wfd = wpat + 0x400;
        uint32_t mb = wfd + 0x300, pret = mb + 0x120;
        /* the exact shape 0x00a16f50 produces: full path + backslash + star */
        static const char pat[] = "c:\\isaac\\resources\\packed\\*";
        unsigned i;
        for (i = 0; pat[i]; ++i) isaac_w16(wpat + 2 * i, (uint16_t)(uint8_t)pat[i]);
        isaac_w16(wpat + 2 * i, 0);
        memset(&cpu, 0, sizeof cpu);
        cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
        isaac_w32(cpu.ESP, 0xDEADBEEF);
        isaac_w32(cpu.ESP + 4, wpat);
        isaac_w32(cpu.ESP + 8, wfd);
        imp_kernel32__FindFirstFileW(&cpu);
        uint32_t fh = cpu.EAX;
        check(fh != 0xFFFFFFFFu, "FindFirstFileW opens the seeded dir from a wide backslash-star pattern");
        check(isaac_r32(wfd) == 0x80u, "the first entry is a regular file (attr 0x80)");
        /* 20 = the section-13 graphics.a payload; the other is payload2 */
        check(isaac_r32(wfd + 0x20u) == 20u || isaac_r32(wfd + 0x20u) == sizeof payload2,
              "nFileSizeLow carries the seeded length");
        check(isaac_r16(wfd + 0x234u) == 0, "cAlternateFileName is empty");

        /* wcstombs_s(&ret, mb, 0x104, cFileName, 0x104) -- the readdir form */
        memset(&cpu, 0, sizeof cpu);
        cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
        isaac_w32(cpu.ESP, 0xDEADBEEF);
        isaac_w32(cpu.ESP + 4, pret);
        isaac_w32(cpu.ESP + 8, mb);
        isaac_w32(cpu.ESP + 12, 0x104);
        isaac_w32(cpu.ESP + 16, wfd + 0x2cu);
        isaac_w32(cpu.ESP + 20, 0x104);
        imp_api_ms_win_crt_convert__wcstombs_s(&cpu);
        check(cpu.EAX == 0, "wcstombs_s converts cFileName without error");
        const char *name1 = (const char *)isaac_g(mb);
        int name1_ok = strcmp(name1, "graphics.a") == 0 || strcmp(name1, "animations.a") == 0;
        check(name1_ok, "cFileName round-trips as one of the seeded basenames");
        check(isaac_r32(pret) == (uint32_t)strlen(name1) + 1u,
              "wcstombs_s reports the length INCLUDING the terminator (readdir stores ret-1)");
        char first[64];
        strncpy(first, name1, sizeof first - 1); first[sizeof first - 1] = 0;

        memset(&cpu, 0, sizeof cpu);
        cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
        isaac_w32(cpu.ESP, 0xDEADBEEF);
        isaac_w32(cpu.ESP + 4, fh);
        isaac_w32(cpu.ESP + 8, wfd);
        imp_kernel32__FindNextFileW(&cpu);
        check(cpu.EAX == 1, "FindNextFileW yields the second seeded file");
        memset(&cpu, 0, sizeof cpu);
        cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
        isaac_w32(cpu.ESP, 0xDEADBEEF);
        isaac_w32(cpu.ESP + 4, pret);
        isaac_w32(cpu.ESP + 8, mb);
        isaac_w32(cpu.ESP + 12, 0x104);
        isaac_w32(cpu.ESP + 16, wfd + 0x2cu);
        isaac_w32(cpu.ESP + 20, 0x104);
        imp_api_ms_win_crt_convert__wcstombs_s(&cpu);
        check(cpu.EAX == 0 && strcmp((const char *)isaac_g(mb), first) != 0 &&
              (strcmp((const char *)isaac_g(mb), "graphics.a") == 0 ||
               strcmp((const char *)isaac_g(mb), "animations.a") == 0),
              "the second entry is the OTHER seeded basename");

        memset(&cpu, 0, sizeof cpu);
        cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
        isaac_w32(cpu.ESP, 0xDEADBEEF);
        isaac_w32(cpu.ESP + 4, fh);
        isaac_w32(cpu.ESP + 8, wfd);
        imp_kernel32__FindNextFileW(&cpu);
        check(cpu.EAX == 0, "a third FindNextFileW is exhausted (ERROR_NO_MORE_FILES)");
        memset(&cpu, 0, sizeof cpu);
        cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
        isaac_w32(cpu.ESP, 0xDEADBEEF);
        isaac_w32(cpu.ESP + 4, fh);
        imp_kernel32__FindClose(&cpu);
        check(cpu.EAX == 1, "FindClose releases the wide handle");

        /* the KAGE root scan: mbstowcs("./") -> GetFullPathNameW -> "c:/isaac/./"
         * (already slash-terminated, so the game appends only "*"). It must land
         * on the FS root and enumerate "resources" as a directory. */
        static const char rootpat[] = "c:/isaac/./*";
        for (i = 0; rootpat[i]; ++i) isaac_w16(wpat + 2 * i, (uint16_t)(uint8_t)rootpat[i]);
        isaac_w16(wpat + 2 * i, 0);
        memset(&cpu, 0, sizeof cpu);
        cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
        isaac_w32(cpu.ESP, 0xDEADBEEF);
        isaac_w32(cpu.ESP + 4, wpat);
        isaac_w32(cpu.ESP + 8, wfd);
        imp_kernel32__FindFirstFileW(&cpu);
        fh = cpu.EAX;
        check(fh != 0xFFFFFFFFu, "the root pattern 'c:/isaac/./*' opens the FS root");
        int saw_resources_dir = 0;
        for (unsigned guard = 0; fh != 0xFFFFFFFFu && guard < 200; ++guard) {
            memset(&cpu, 0, sizeof cpu);
            cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
            isaac_w32(cpu.ESP, 0xDEADBEEF);
            isaac_w32(cpu.ESP + 4, pret);
            isaac_w32(cpu.ESP + 8, mb);
            isaac_w32(cpu.ESP + 12, 0x104);
            isaac_w32(cpu.ESP + 16, wfd + 0x2cu);
            isaac_w32(cpu.ESP + 20, 0x104);
            imp_api_ms_win_crt_convert__wcstombs_s(&cpu);
            if (cpu.EAX == 0 && strcmp((const char *)isaac_g(mb), "resources") == 0 &&
                isaac_r32(wfd) == 0x10u)
                saw_resources_dir = 1;
            memset(&cpu, 0, sizeof cpu);
            cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
            isaac_w32(cpu.ESP, 0xDEADBEEF);
            isaac_w32(cpu.ESP + 4, fh);
            isaac_w32(cpu.ESP + 8, wfd);
            imp_kernel32__FindNextFileW(&cpu);
            if (cpu.EAX != 1) break;
        }
        check(saw_resources_dir, "the root scan lists 'resources' as a directory (attr 0x10)");

        /* 15. GetFullPathNameW's two-call size protocol, exactly as opendir
         * 0x00a16f50 drives it: a NULL/0 query must return the required
         * WCHAR count INCLUDING the terminator (the game mallocs n*2+0x10 and
         * calls again with n); the sized call returns the length WITHOUT the
         * terminator and writes it. Returning 0 on the query is what stopped
         * the whole mount-root scan before FindFirstFileW (boot round 10). */
        static const char rel[] = "./";
        for (i = 0; rel[i]; ++i) isaac_w16(wpat + 2 * i, (uint16_t)(uint8_t)rel[i]);
        isaac_w16(wpat + 2 * i, 0);
        memset(&cpu, 0, sizeof cpu);
        cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
        isaac_w32(cpu.ESP, 0xDEADBEEF);
        isaac_w32(cpu.ESP + 4, wpat);       /* name   */
        isaac_w32(cpu.ESP + 8, 0);          /* nBufferLength = 0 */
        isaac_w32(cpu.ESP + 12, 0);         /* buffer = NULL */
        isaac_w32(cpu.ESP + 16, 0);         /* lpFilePart = NULL */
        imp_kernel32__GetFullPathNameW(&cpu);
        uint32_t need = cpu.EAX;
        /* "c:/isaac/./" = 11 WCHARs + terminator */
        check(need == 12u, "GetFullPathNameW(name, 0, NULL) returns the required size INCLUDING the terminator");

        uint32_t wout = wfd;                /* reuse the find buffer as scratch */
        memset(&cpu, 0, sizeof cpu);
        cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
        isaac_w32(cpu.ESP, 0xDEADBEEF);
        isaac_w32(cpu.ESP + 4, wpat);
        isaac_w32(cpu.ESP + 8, 4);          /* too small */
        isaac_w32(cpu.ESP + 12, wout);
        isaac_w32(cpu.ESP + 16, 0);
        imp_kernel32__GetFullPathNameW(&cpu);
        check(cpu.EAX == 12u, "a too-small buffer also returns the required size");

        memset(&cpu, 0, sizeof cpu);
        cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
        isaac_w32(cpu.ESP, 0xDEADBEEF);
        isaac_w32(cpu.ESP + 4, wpat);
        isaac_w32(cpu.ESP + 8, need);       /* exactly what the query asked for */
        isaac_w32(cpu.ESP + 12, wout);
        isaac_w32(cpu.ESP + 16, 0);
        imp_kernel32__GetFullPathNameW(&cpu);
        check(cpu.EAX == 11u, "the sized call returns the length WITHOUT the terminator");
        static const char expect_full[] = "c:/isaac/./";
        int full_ok = 1;
        for (i = 0; i <= 11; ++i)
            if (isaac_r16(wout + 2 * i) != (uint16_t)(uint8_t)expect_full[i]) { full_ok = 0; break; }
        check(full_ok, "the sized call writes L\"c:/isaac/./\" NUL-terminated (the cwd-resolved form)");

        /* 16. CAPACITY. The install's loose resources/ tree is 476 files in 21
         * dirs (gfx/ui alone has 143 children) plus the archives and the save
         * dir the game creates; the old 512-slot table and 128-per-scan cap
         * overflowed silently (a seed returning 0, a scan listing 128 of 143).
         * Seed 700 small files into one directory and require every one of
         * them to be enumerable and openable. */
        {
            static const uint8_t tiny[] = { 'x' };
            int seeded_all = 1;
            char name[64];
            for (unsigned k = 0; k < 700; ++k) {
                snprintf(name, sizeof name, "resources/many/f%03u.txt", k);
                if (isaac_fs_seed(name, tiny, 1) != 1) { seeded_all = 0; break; }
            }
            check(seeded_all, "700 files seed into one directory (table capacity)");
            static const char manypat[] = "c:\\isaac\\resources\\many\\*";
            for (i = 0; manypat[i]; ++i) isaac_w16(wpat + 2 * i, (uint16_t)(uint8_t)manypat[i]);
            isaac_w16(wpat + 2 * i, 0);
            memset(&cpu, 0, sizeof cpu);
            cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
            isaac_w32(cpu.ESP, 0xDEADBEEF);
            isaac_w32(cpu.ESP + 4, wpat);
            isaac_w32(cpu.ESP + 8, wfd);
            imp_kernel32__FindFirstFileW(&cpu);
            uint32_t hh = cpu.EAX;
            unsigned listed = (hh != 0xFFFFFFFFu) ? 1u : 0u;
            while (hh != 0xFFFFFFFFu && listed < 5000) {
                memset(&cpu, 0, sizeof cpu);
                cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
                isaac_w32(cpu.ESP, 0xDEADBEEF);
                isaac_w32(cpu.ESP + 4, hh);
                isaac_w32(cpu.ESP + 8, wfd);
                imp_kernel32__FindNextFileW(&cpu);
                if (cpu.EAX != 1) break;
                ++listed;
            }
            check(listed == 700u, "a directory scan lists all 700 (per-scan cap)");
            /* and the last one opens by its narrow path through the same fopen */
            const char *lastp = "resources/many/f699.txt";
            for (i = 0; ; ++i) { *(uint8_t *)isaac_g(mb + i) = (uint8_t)lastp[i]; if (!lastp[i]) break; }
            const char *mode = "rb";
            for (i = 0; ; ++i) { *(uint8_t *)isaac_g(pret + i) = (uint8_t)mode[i]; if (!mode[i]) break; }
            memset(&cpu, 0, sizeof cpu);
            cpu.ESP = ISAAC_STACK_TOP_VA - 0x1000;
            isaac_w32(cpu.ESP, 0xDEADBEEF);
            isaac_w32(cpu.ESP + 4, mb);
            isaac_w32(cpu.ESP + 8, pret);
            imp_api_ms_win_crt_stdio__fopen(&cpu);
            check(cpu.EAX != 0, "the 700th seeded file opens by path");
        }
    }

    isaac_module_report();

    isaac_heap_report();
    isaac_stub_report();
    printf("--- %s (%d failure%s) ---\n", g_fail ? "FAILED" : "PASSED",
           g_fail, g_fail == 1 ? "" : "s");
    return g_fail ? 1 : 0;
}
