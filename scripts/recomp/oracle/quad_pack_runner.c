/* Minimal reader for quad_pack.py's private PE-derived fixtures.
 * Link the real host_fastpath.c with section GC; no guest-call stubs or models.
 * Native identity mappings and Wasm guest addresses are exactly the same. */
#include "isaac_host.h"

#include <inttypes.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#ifdef _WIN32
#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <xmmintrin.h>
#elif !defined(__EMSCRIPTEN__)
#error "The native quad-pack runner requires Windows; use Emscripten otherwise."
#endif

#ifdef _WIN32
/* COFF resolves these references in unrelated host_fastpath.c functions before
 * discarding their sections. These are harness tripwires, never replacements
 * for called guest logic: any dependency reached by this helper fails proof. */
void isaac_log(const char *format, ...) {
    (void)format;
    fputs("quad-pack: unexpected isaac_log dependency\n", stderr);
    abort();
}
void isaac_threads_note_cs(uint32_t cs) {
    (void)cs;
    fputs("quad-pack: unexpected isaac_threads_note_cs dependency\n", stderr);
    abort();
}
#endif

typedef struct {
    uint32_t va, size;
    unsigned char *baseline, *before, *expected;
} Window;

static Window windows[8];
static uint32_t window_count;

static void fail(const char *message) {
    fprintf(stderr, "quad-pack runner: %s\n", message);
    exit(2);
}

static void read_exact(FILE *file, void *data, size_t size) {
    if (size && fread(data, 1, size, file) != size) fail("truncated corpus");
}

static uint32_t read_u32(FILE *file) {
    unsigned char bytes[4];
    read_exact(file, bytes, sizeof(bytes));
    return (uint32_t)bytes[0] | ((uint32_t)bytes[1] << 8) |
           ((uint32_t)bytes[2] << 16) | ((uint32_t)bytes[3] << 24);
}

static unsigned char *allocate(uint32_t size) {
    unsigned char *p = malloc(size);
    if (!p) fail("host allocation failed");
    return p;
}

static void read_patches(FILE *file, int expected) {
    uint32_t count = read_u32(file);
    for (uint32_t n = 0; n < count; ++n) {
        uint32_t va = read_u32(file), size = read_u32(file), i;
        for (i = 0; i < window_count; ++i) {
            Window *w = &windows[i];
            if (va >= w->va && (uint64_t)va + size <= (uint64_t)w->va + w->size) {
                read_exact(file, (expected ? w->expected : w->before) + (va - w->va), size);
                break;
            }
        }
        if (i == window_count) fail("patch is outside the watched windows");
    }
}

static uint32_t bits(const unsigned char *bytes) {
    uint32_t word;
    memcpy(&word, bytes, sizeof(word));
    return word;
}

int main(int argc, char **argv) {
    if (argc != 2) fail("usage: quad_pack_runner <corpus.bin>");
    FILE *file = fopen(argv[1], "rb");
    if (!file) fail("cannot open corpus");
    char magic[8];
    read_exact(file, magic, sizeof(magic));
    if (memcmp(magic, "QPACK01\0", 8)) fail("wrong corpus version");
    window_count = read_u32(file);
    if (!window_count || window_count > 8) fail("bad window count");
    for (uint32_t i = 0; i < window_count; ++i) {
        Window *w = &windows[i];
        w->va = read_u32(file);
        w->size = read_u32(file);
        if (!w->va || (w->va & 0xFFFFu) || !w->size || (w->size & 0xFFFFu) ||
            (uint64_t)w->va + w->size > ISAAC_GUEST_LIMIT_VA)
            fail("window is not a low, allocation-aligned guest range");
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
        w->baseline = allocate(w->size);
        w->before = allocate(w->size);
        w->expected = allocate(w->size);
        read_exact(file, w->baseline, w->size);
    }
    uint32_t count = read_u32(file), accepted = 0, rejected = 0, failures = 0;
    for (uint32_t n = 0; n < count; ++n) {
        uint32_t name_size = read_u32(file);
        char name[160];
        if (!name_size || name_size >= sizeof(name)) fail("bad case name");
        read_exact(file, name, name_size);
        name[name_size] = 0;
        uint32_t want = read_u32(file), args[7];
        if (want > 3 || want == 2) fail("bad expected result flags");
        for (unsigned i = 0; i < 7; ++i) args[i] = read_u32(file);
        for (uint32_t i = 0; i < window_count; ++i)
            memcpy(windows[i].before, windows[i].baseline, windows[i].size);
        read_patches(file, 0);
        for (uint32_t i = 0; i < window_count; ++i) {
            Window *w = &windows[i];
            memcpy(isaac_g(w->va), w->before, w->size);
            memcpy(w->expected, w->before, w->size);
        }
        read_patches(file, 1);
        /* Logs identify the current vector even if a broken guard faults. */
        printf("CASE %s expected=%" PRIu32 "\n", name, want);
        fflush(stdout);
#ifdef _WIN32
        _mm_setcsr(0x1F80u);  /* round-nearest-even, no FTZ/DAZ, exceptions masked */
#endif
        int got = isaac_fast_entity_quad_pack(args[0], args[1], args[2], args[3],
                                              args[4], args[5], args[6]);
        int bad = got != (int)want;
        if (bad)
            printf("MISMATCH %s return expected=%" PRIu32 " actual=%d\n", name, want, got);
        for (uint32_t i = 0; i < window_count; ++i) {
            Window *w = &windows[i];
            const unsigned char *actual = isaac_g(w->va);
            if (!memcmp(actual, w->expected, w->size)) continue;
            uint32_t off = 0;
            while (actual[off] == w->expected[off]) ++off;
            uint32_t va = w->va + off;
            /* Align to the unaligned fixture field, not the host address. */
            uint32_t anchor = w->va;
            if (args[3] >= w->va && args[3] <= va && args[3] < w->va + w->size)
                anchor = args[3];
            if (va >= args[0] - 0x50u && (uint64_t)va < (uint64_t)args[0] + 0x18u)
                anchor = args[0];
            uint32_t word_va = va - ((va - anchor) & 3u);
            if (word_va < w->va || (uint64_t)word_va + 4 > (uint64_t)w->va + w->size)
                word_va = va & ~3u;
            uint32_t at = word_va - w->va;
            printf("MISMATCH %s byte_va=0x%08" PRIx32 " word_va=0x%08" PRIx32
                   " before=0x%08" PRIx32 " expected=0x%08" PRIx32 " actual=0x%08" PRIx32
                   " ox=0x%08" PRIx32 " oy=0x%08" PRIx32 "\n",
                   name, va, word_va, bits(w->before + at), bits(w->expected + at),
                   bits(actual + at), args[5], args[6]);
            bad = 1;
        }
        if (bad) ++failures;
        else if (want) ++accepted;
        else ++rejected;
    }
    if (fgetc(file) != EOF) fail("unexpected corpus trailer");
    fclose(file);
    for (uint32_t i = 0; i < window_count; ++i) {
        Window *w = &windows[i];
#ifdef _WIN32
        VirtualFree(isaac_g(w->va), 0, MEM_RELEASE);
#endif
        free(w->baseline);
        free(w->before);
        free(w->expected);
    }
    printf("{\"accepted\":%" PRIu32 ",\"rejected\":%" PRIu32 ",\"failures\":%" PRIu32 "}\n",
           accepted, rejected, failures);
    return failures ? 1 : 0;
}
