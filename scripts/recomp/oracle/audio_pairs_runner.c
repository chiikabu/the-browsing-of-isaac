/* Differential runner for audio_pairs.py. The included block is extracted
 * verbatim from lift_patches.py, not a second implementation of its liveouts. */
#include "isaac_host.h"
#include "recomp_rt.h"

#include <inttypes.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#ifdef _WIN32
#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <xmmintrin.h>
#elif !defined(__EMSCRIPTEN__)
#error "The native audio-pair runner requires Windows; use Emscripten otherwise."
#endif
#ifndef ISAAC_HAVE_LIFTER_STATE
#error "The oracle requires the actual generated recomp_state.h."
#endif

#ifdef _WIN32
/* COFF resolves unrelated references before section GC. These test-only
 * tripwires must abort if the tested block ever reaches either dependency. */
void isaac_log(const char *format, ...) {
    (void)format;
    fputs("audio-pairs: unexpected isaac_log dependency\n", stderr);
    abort();
}
void isaac_threads_note_cs(uint32_t cs) {
    (void)cs;
    fputs("audio-pairs: unexpected isaac_threads_note_cs dependency\n", stderr);
    abort();
}
#endif

static int integrated(CpuState *s) {
    uint32_t EAX = s->EAX, ECX = s->ECX, EDX = s->EDX, EBX = s->EBX;
    uint32_t ESP = s->ESP, EBP = s->EBP, ESI = s->ESI, EDI = s->EDI;
    uint8_t CF = s->CF, PF = s->PF;
    uint8_t ZF = s->ZF, SF = s->SF, OF = s->OF;
    int handled = 0;
#include "audio_pairs_patch.inc"
    goto save;
#include "audio_pairs_join.inc"
    handled = 1;
save:
    s->EAX = EAX; s->ECX = ECX; s->EDX = EDX; s->EBX = EBX;
    s->ESP = ESP; s->EBP = EBP; s->ESI = ESI; s->EDI = EDI;
    s->CF = CF; s->PF = PF;
    s->ZF = ZF; s->SF = SF; s->OF = OF;
    return handled;
}

typedef struct {
    uint32_t va, size;
    unsigned char *baseline, *before, *expected;
} Window;

typedef struct {
    uint32_t gpr[8], flags;
    unsigned char xmm[8][16];
} Registers;

static Window windows[8];
static uint32_t window_count;

static void fail(const char *message) {
    fprintf(stderr, "audio-pairs runner: %s\n", message);
    exit(2);
}

static void read_exact(FILE *file, void *data, size_t size) {
    if (size && fread(data, 1, size, file) != size) fail("truncated corpus");
}

static uint32_t read_u32(FILE *file) {
    unsigned char b[4];
    read_exact(file, b, sizeof(b));
    return (uint32_t)b[0] | ((uint32_t)b[1] << 8) |
           ((uint32_t)b[2] << 16) | ((uint32_t)b[3] << 24);
}

static unsigned char *allocate(uint32_t size) {
    unsigned char *p = malloc(size);
    if (!p) fail("host allocation failed");
    return p;
}

static void read_registers(FILE *file, Registers *r) {
    for (unsigned i = 0; i < 8; ++i) r->gpr[i] = read_u32(file);
    r->flags = read_u32(file);
    read_exact(file, r->xmm, sizeof(r->xmm));
}

static void read_patches(FILE *file, int expected) {
    uint32_t count = read_u32(file);
    for (uint32_t n = 0; n < count; ++n) {
        uint32_t va = read_u32(file), size = read_u32(file), i;
        for (i = 0; i < window_count; ++i) {
            Window *w = &windows[i];
            if (va >= w->va && (uint64_t)va + size <= (uint64_t)w->va + w->size) {
                read_exact(file, (expected ? w->expected : w->before) + va - w->va, size);
                break;
            }
        }
        if (i == window_count) fail("patch outside watched windows");
    }
}

/* The generated state stores EFLAGS bits separately. The eflags shadow, EIP
 * shadow, MXCSR, upper ZMM bytes and every unrelated field must stay unchanged.
 * Original MXCSR is recorded separately: the existing lifted SSE contract does
 * not model exception sticky bits. The reached label checks PC, not EIP shadow. */
static void apply_registers(CpuState *s, const Registers *r) {
    s->EAX = r->gpr[0]; s->ECX = r->gpr[1]; s->EDX = r->gpr[2]; s->EBX = r->gpr[3];
    s->ESP = r->gpr[4]; s->EBP = r->gpr[5]; s->ESI = r->gpr[6]; s->EDI = r->gpr[7];
#define FLAG(field, bit) s->field = (uint8_t)((r->flags >> (bit)) & 1u)
    FLAG(CF, 0); FLAG(F1, 1); FLAG(PF, 2); FLAG(F3, 3); FLAG(AF, 4); FLAG(F5, 5);
    FLAG(ZF, 6); FLAG(SF, 7); FLAG(TF, 8); FLAG(IF, 9); FLAG(DF, 10); FLAG(OF, 11);
    s->IOPL = (uint8_t)((r->flags >> 12) & 3u);
    FLAG(NT, 14); FLAG(F15, 15); FLAG(RF, 16); FLAG(VM, 17); FLAG(AC, 18);
    FLAG(VIF, 19); FLAG(VIP, 20); FLAG(ID, 21);
#undef FLAG
    unsigned char *xmm[] = {s->ZMM0, s->ZMM1, s->ZMM2, s->ZMM3,
                           s->ZMM4, s->ZMM5, s->ZMM6, s->ZMM7};
    for (unsigned i = 0; i < 8; ++i) memcpy(xmm[i], r->xmm[i], 16);
}

static void reset_memory(void) {
    for (uint32_t i = 0; i < window_count; ++i)
        memcpy(isaac_g(windows[i].va), windows[i].before, windows[i].size);
#ifdef _WIN32
    _mm_setcsr(0x1F80u);
#endif
}

static int compare_memory(const char *name, const char *lane, int changed) {
    int bad = 0;
    for (uint32_t i = 0; i < window_count; ++i) {
        Window *w = &windows[i];
        const unsigned char *actual = isaac_g(w->va);
        const unsigned char *expected = changed ? w->expected : w->before;
        if (!memcmp(actual, expected, w->size)) continue;
        uint32_t off = 0;
        while (actual[off] == expected[off]) ++off;
        printf("MISMATCH %s %s memory va=0x%08" PRIx32
               " before=%02x expected=%02x actual=%02x\n",
               name, lane, w->va + off, w->before[off], expected[off], actual[off]);
        bad = 1;
    }
    return bad;
}

int main(int argc, char **argv) {
    if (argc != 3) fail("usage: audio_pairs_runner <corpus.bin> <mode:0|1|2>");
    if (strlen(argv[2]) != 1 || argv[2][0] < '0' || argv[2][0] > '2') fail("bad mode");
    int mode = argv[2][0] - '0';
    /* Node's process environment need not populate Emscripten's C ENV. Select
     * the real host mode through its CRT environment before its cached read. */
    const char *fastpath = mode == 0 ? "0" : "1";
    const char *verify = mode == 2 ? "1" : "0";
#ifdef _WIN32
    if (_putenv_s("ISAAC_FASTPATH", fastpath) || _putenv_s("ISAAC_FASTPATH_VERIFY", verify))
        fail("cannot select requested fastpath environment");
#else
    if (setenv("ISAAC_FASTPATH", fastpath, 1) || setenv("ISAAC_FASTPATH_VERIFY", verify, 1))
        fail("cannot select requested fastpath environment");
#endif
    if (isaac_fastpath_mode() != mode) fail("environment selected a different fastpath mode");
    FILE *file = fopen(argv[1], "rb");
    if (!file) fail("cannot open corpus");
    char magic[8];
    read_exact(file, magic, sizeof(magic));
    if (memcmp(magic, "APAIRS1\0", 8)) fail("wrong corpus version");
    window_count = read_u32(file);
    if (!window_count || window_count > 8) fail("bad window count");
    for (uint32_t i = 0; i < window_count; ++i) {
        Window *w = &windows[i];
        w->va = read_u32(file); w->size = read_u32(file);
        if (!w->va || (w->va & 0xFFFFu) || !w->size || (w->size & 0xFFFFu) ||
            (uint64_t)w->va + w->size > ISAAC_GUEST_LIMIT_VA)
            fail("window is not an allocation-aligned guest range");
        for (uint32_t j = 0; j < i; ++j)
            if (w->va < windows[j].va + windows[j].size && windows[j].va < w->va + w->size)
                fail("overlapping watch windows");
#ifdef _WIN32
        void *mapped = VirtualAlloc(isaac_g(w->va), w->size, MEM_RESERVE | MEM_COMMIT, PAGE_READWRITE);
        if (mapped != isaac_g(w->va)) {
            fprintf(stderr, "VirtualAlloc exact guest mapping 0x%08" PRIx32 "+0x%08" PRIx32
                    " failed (Windows error %lu)\n", w->va, w->size, (unsigned long)GetLastError());
            return 2;
        }
#endif
        w->baseline = allocate(w->size); w->before = allocate(w->size); w->expected = allocate(w->size);
        read_exact(file, w->baseline, w->size);
    }
    uint32_t count = read_u32(file), accepted = 0, rejected = 0, failures = 0;
    for (uint32_t n = 0; n < count; ++n) {
        uint32_t name_size = read_u32(file);
        char name[192];
        if (!name_size || name_size >= sizeof(name)) fail("bad case name");
        read_exact(file, name, name_size); name[name_size] = 0;
        uint32_t pairs = read_u32(file), last_before = read_u32(file);
        Registers input, output;
        read_registers(file, &input); read_registers(file, &output);
        for (uint32_t i = 0; i < window_count; ++i)
            memcpy(windows[i].before, windows[i].baseline, windows[i].size);
        read_patches(file, 0);
        for (uint32_t i = 0; i < window_count; ++i)
            memcpy(windows[i].expected, windows[i].before, windows[i].size);
        read_patches(file, 1);
        printf("CASE %s mode=%d expected_pairs=%" PRIu32 "\n", name, mode, pairs);
        fflush(stdout);
        int bad = 0;
        if (mode == 1) {
            reset_memory();
            uint32_t last = last_before;
            uint32_t got = isaac_fast_aa2580_pairs(input.gpr[5], input.gpr[1], input.gpr[2],
                                                 input.gpr[3], recomp_rd32(input.xmm[1]), &last);
            uint32_t want_last = pairs ? recomp_rd32(output.xmm[0]) : last_before;
            if (got != pairs || last != want_last) {
                printf("MISMATCH %s helper pairs=%" PRIu32 "/%" PRIu32
                       " last=0x%08" PRIx32 "/0x%08" PRIx32 " (actual/expected)\n",
                       name, got, pairs, last, want_last);
                bad = 1;
            }
            bad |= compare_memory(name, "helper", 1);
        }
        reset_memory();
        CpuState actual, expected;
        unsigned char *state_bytes = (unsigned char *)&actual;
        for (size_t i = 0; i < sizeof(actual); ++i)
            state_bytes[i] = (unsigned char)(i * 73u + n * 19u + 37u);
        actual.MXCSR = 0x1F80u;
        apply_registers(&actual, &input);
        memcpy(&expected, &actual, sizeof(expected));
        int want_handled = mode == 1 && pairs != 0;
        if (want_handled) apply_registers(&expected, &output);
        int handled = integrated(&actual);
        if (handled != want_handled) {
            printf("MISMATCH %s integration join=%d/%d (actual/expected)\n", name, handled, want_handled);
            bad = 1;
        }
        if (memcmp(&actual, &expected, sizeof(actual))) {
            size_t off = 0;
            const unsigned char *want = (const unsigned char *)&expected;
            while (state_bytes[off] == want[off]) ++off;
            printf("MISMATCH %s CpuState byte=%zu expected=%02x actual=%02x\n",
                   name, off, want[off], state_bytes[off]);
            bad = 1;
        }
        bad |= compare_memory(name, "integration", want_handled);
        if (bad) ++failures;
        else if (pairs) ++accepted;
        else ++rejected;
    }
    if (fgetc(file) != EOF) fail("unexpected corpus trailer");
    fclose(file);
    for (uint32_t i = 0; i < window_count; ++i) {
        Window *w = &windows[i];
#ifdef _WIN32
        VirtualFree(isaac_g(w->va), 0, MEM_RELEASE);
#endif
        free(w->baseline); free(w->before); free(w->expected);
    }
    printf("{\"accepted\":%" PRIu32 ",\"rejected\":%" PRIu32 ",\"failures\":%" PRIu32
           ",\"mode\":%d,\"helper_cases\":%" PRIu32 ",\"integration_cases\":%" PRIu32
           ",\"cpu_state_bytes\":%zu}\n",
           accepted, rejected, failures, mode, mode == 1 ? count : 0, count, sizeof(CpuState));
    return failures ? 1 : 0;
}
