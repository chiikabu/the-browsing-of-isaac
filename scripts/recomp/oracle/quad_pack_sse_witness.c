/* Real scalar SSE witness for quad_pack.py. No host helper or C float model.
 * Input: little-endian u32 count followed by that many raw f32 bit patterns.
 * Output: CPU/MXCSR metadata, then both hardware results for every input pair. */
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <xmmintrin.h>
#include <cpuid.h>

static uint32_t addss(uint32_t left, uint32_t right) {
    uint32_t result;
    __asm__ volatile("movd %1, %%xmm0\n\taddss %2, %%xmm0\n\tmovd %%xmm0, %0"
                     : "=r"(result) : "r"(left), "m"(right) : "xmm0");
    return result;
}
static uint32_t subss(uint32_t left, uint32_t right) {
    uint32_t result;
    __asm__ volatile("movd %1, %%xmm0\n\tsubss %2, %%xmm0\n\tmovd %%xmm0, %0"
                     : "=r"(result) : "r"(left), "m"(right) : "xmm0");
    return result;
}
int main(int argc, char **argv) {
    if (argc != 2) {
        fputs("usage: quad_pack_sse_witness <sse-inputs.bin>\n", stderr);
        return 2;
    }
    FILE *input = fopen(argv[1], "rb");
    uint32_t count = 0;
    if (!input || fread(&count, sizeof(count), 1, input) != 1 || !count || count > 4096) {
        fputs("bad SSE witness input\n", stderr);
        return 2;
    }
    uint32_t *values = malloc((size_t)count * sizeof(*values));
    if (!values || fread(values, sizeof(*values), count, input) != count || fgetc(input) != EOF) {
        fputs("truncated/oversized SSE witness input\n", stderr);
        return 2;
    }
    fclose(input);
    unsigned a=0, b=0, c=0, d=0;
    char vendor[13] = {0};
    __get_cpuid(0, &a, &b, &c, &d);
    memcpy(vendor, &b, 4); memcpy(vendor+4, &d, 4); memcpy(vendor+8, &c, 4);
    __get_cpuid(1, &a, &b, &c, &d);
    _mm_setcsr(0x1f80);
    printf("{\"cpu_vendor\":\"%s\",\"cpuid_1_eax\":\"0x%08x\",\"mxcsr\":\"0x%08x\"}\n", vendor, a, _mm_getcsr());
    for (uint32_t i = 0; i < count; ++i) {
        for (uint32_t j = 0; j < count; ++j) {
            _mm_setcsr(0x1f80);
            uint32_t sum = addss(values[i], values[j]);
            unsigned add_flags = _mm_getcsr();
            _mm_setcsr(0x1f80);
            uint32_t difference = subss(values[i], values[j]);
            unsigned sub_flags = _mm_getcsr();
            printf("{\"left\":\"0x%08x\",\"right\":\"0x%08x\",\"addss\":\"0x%08x\",\"subss\":\"0x%08x\",\"add_mxcsr\":\"0x%08x\",\"sub_mxcsr\":\"0x%08x\"}\n",
                   values[i], values[j], sum, difference, add_flags, sub_flags);
        }
    }
    free(values);
    return 0;
}
