/* host_fastpath.c -- exact host implementations of the deterministic leaf
 * functions that dominate the boot (round 12 profile: PNG row unfilter 37%,
 * zlib adler32 8.7%, texture premultiply 8% of 6.7 G lifted instructions at
 * ~12 MIPS). Each is a pure function of its inputs with a spec-fixed result
 * (PNG filter algorithms, RFC 1950 Adler-32, a table lookup), so a host
 * implementation is output-identical to the lifted one; the wrapper that
 * lift_patches.py installs around the lifted body (WRAP_PATCHES) can also
 * run both and compare (ISAAC_FASTPATH_VERIFY=1), or fall back to the
 * lifted body entirely (ISAAC_FASTPATH=0).
 *
 * Everything operates on GUEST memory through isaac_g(): the buffers are
 * the game's, in the guest arena, exactly as the lifted code would touch
 * them. */

#include "isaac_host.h"

#include <stdlib.h>
#include <string.h>

static int fastpath_mode(void) {          /* 0 = lifted only, 1 = host, 2 = verify both */
    static int v = -1;
    if (v < 0) {
        const char *e = getenv("ISAAC_FASTPATH");
        const char *vf = getenv("ISAAC_FASTPATH_VERIFY");
        v = (e && *e == '0') ? 0 : 1;
        if (vf && *vf && *vf != '0') v = 2;
    }
    return v;
}
int isaac_fastpath_mode(void) { return fastpath_mode(); }

/* Round 49: stb_vorbis's imdct_step3_inner_r_loop (0x00aa3270), the inner
 * butterfly of the inverse MDCT the engine runs for every 64 KB music chunk
 * (two streams) and every sound effect it decodes. The 6x profile put the
 * vorbis decode at about 5 % of a frame, this loop 1.2 %. The compiled
 * function is MSVC's rendering of the public-domain source:
 *
 *   for (i = lim >> 2; i > 0; --i) {                 // e0 = e + d0, e2 = e0 + k_off
 *     k00_20 = e0[-0] - e2[-0]; k01_21 = e0[-1] - e2[-1];
 *     e0[-0] += e2[-0]; e0[-1] += e2[-1];
 *     e2[-0] = k00_20 * A[0] - k01_21 * A[1];
 *     e2[-1] = k01_21 * A[0] + k00_20 * A[1];
 *     A += k1;                                         // three more pairs, then e0 -= 8, e2 -= 8
 *   }
 *
 * Every operation is an IEEE single multiply, add or subtract in the same
 * association as the x86 code (products first, then the sum or difference),
 * so the results are bit-identical; ISAAC_FASTPATH_VERIFY=1 compares them
 * against the lifted body on the game's own data. lim, e are the register
 * arguments (ecx, edx), d0 / k_off / A / k1 the stack arguments. */
void isaac_fast_imdct_r_loop(uint32_t lim, uint32_t e_va, uint32_t d0, uint32_t k_off,
                             uint32_t a_va, uint32_t k1) {
    int n = (int)lim >> 2;
    float *e2 = (float *)isaac_g(e_va + (d0 + k_off) * 4u);   /* pfVar4: e2 = e + d0 + k_off */
    float *e0 = e2 - (int)k_off - 2;                            /* pfVar3: e0[2] is the source's e0[-0] */
    const float *A = (const float *)isaac_g(a_va);
    for (; n > 0; --n) {
        float k00, k01;
        const float *A1, *A2, *A3;
        k00 = e0[2] - e2[0];  k01 = e0[1] - e2[-1];
        e0[2] = e2[0] + e0[2];  e0[1] = e0[1] + e2[-1];
        e2[0]  = k00 * A[0] - k01 * A[1];
        A1 = A + k1;
        e2[-1] = k00 * A[1] + k01 * A[0];
        k00 = e0[0] - e2[-2];  k01 = e0[-1] - e2[-3];
        e0[0] = e0[0] + e2[-2];  e0[-1] = e0[-1] + e2[-3];
        e2[-2] = k00 * A1[0] - k01 * A1[1];
        A2 = A1 + k1;
        e2[-3] = k00 * A1[1] + k01 * A1[0];
        k00 = e0[-2] - e2[-4];  k01 = e0[-3] - e2[-5];
        e0[-2] = e0[-2] + e2[-4];  e0[-3] = e0[-3] + e2[-5];
        e2[-4] = k00 * A2[0] - k01 * A2[1];
        A3 = A2 + k1;
        e2[-5] = k00 * A2[1] + k01 * A2[0];
        k00 = e0[-4] - e2[-6];  k01 = e0[-5] - e2[-7];
        e0[-4] = e0[-4] + e2[-6];  e0[-5] = e0[-5] + e2[-7];
        e2[-6] = k00 * A3[0] - k01 * A3[1];
        e2[-7] = k00 * A3[1] + k01 * A3[0];
        A = A3 + k1;
        e0 -= 8; e2 -= 8;
    }
}

/* Round 50: the whole of stb_vorbis's inverse_mdct (0x00aa38a0) -- the
 * function the round-49 butterfly belongs to, 2.3 % of a 6x frame on its
 * own and about 4 % with its helpers. It is transcribed from the Ghidra
 * decompile statement by statement (the compiler's own operation order,
 * so every single-precision product, sum and difference rounds where the
 * binary's does), the helper loops included: iter0 (0x00aa30a0), the r loop
 * (0x00aa3270, round 49), the s loop (0x00aa3430) and ld654 (0x00aa3620).
 * Calling convention: buffer in ecx, n in edx, (f, blocktype) on the
 * stack, a plain ret. The original keeps its n/2-float scratch either on
 * the stack (alloca, when no alloc_buffer is installed: the host uses its
 * own scratch then) or, as the engine has it, in the vorb's alloc_buffer
 * at temp_offset - n/2*4 (temp_alloc; the host writes the same guest
 * bytes the original would, and leaves temp_offset as the original does:
 * taken and given back). A block that would not fit (temp_offset - size
 * below setup_offset: the original dereferences NULL) is left to the
 * lifted body. The output is the n floats at buffer, which the verify mode
 * compares against the lifted body. The vorb layout it reads:
 * +0x60 alloc_buffer, +0x68 setup_offset, +0x6c temp_offset,
 * +0x43c A[2], +0x444 B[2], +0x44c C[2], +0x45c bit_reverse[2]. */
#define IMDCT_MAX_N 8192u
static float g_imdct_buf2[IMDCT_MAX_N / 2];

static int imdct_ilog(int n) {           /* stb_vorbis ilog: floor(log2 n) + 1, 0 for n <= 0 */
    static const signed char log2_4[16] = { 0,1,2,2,3,3,3,3,4,4,4,4,4,4,4,4 };
    if (n < (1 << 14)) {
        if (n < (1 << 4)) return n < 0 ? 0 : log2_4[n];
        if (n < (1 << 9)) return 5 + log2_4[n >> 5];
        return 10 + log2_4[n >> 10];
    }
    if (n < (1 << 24)) {
        if (n < (1 << 19)) return 15 + log2_4[n >> 15];
        return 20 + log2_4[n >> 20];
    }
    if (n < (1 << 29)) return 25 + log2_4[n >> 25];
    if (n < (1 << 31)) return 30 + log2_4[n >> 30];
    return 0;
}

static void imdct_iter0_loop(int cnt, float *e, int i_off, int k_off, const float *A) {
    float *e2 = e + i_off + k_off;
    float *e0 = e2 - k_off - 2;
    int i;
    for (i = cnt >> 2; i > 0; --i) {
        float k00, k01;
        k00 = e0[2] - e2[0];  k01 = e0[1] - e2[-1];
        e0[2] = e2[0] + e0[2];  e0[1] = e0[1] + e2[-1];
        e2[0]  = k00 * A[0] - k01 * A[1];
        e2[-1] = k01 * A[0] + k00 * A[1];
        k00 = e0[0] - e2[-2];  k01 = e0[-1] - e2[-3];
        e0[0] = e0[0] + e2[-2];  e0[-1] = e0[-1] + e2[-3];
        e2[-2] = k00 * A[8] - k01 * A[9];
        e2[-3] = k01 * A[8] + k00 * A[9];
        k00 = e0[-2] - e2[-4];  k01 = e0[-3] - e2[-5];
        e0[-2] = e0[-2] + e2[-4];  e0[-3] = e0[-3] + e2[-5];
        e2[-4] = k00 * A[16] - k01 * A[17];
        e2[-5] = k01 * A[16] + k00 * A[17];
        k00 = e0[-4] - e2[-6];  k01 = e0[-5] - e2[-7];
        e0[-4] = e2[-6] + e0[-4];  e0[-5] = e0[-5] + e2[-7];
        e2[-6] = k00 * A[24] - k01 * A[25];
        e2[-7] = k01 * A[24] + k00 * A[25];
        A += 32; e2 -= 8; e0 -= 8;
    }
}

static void imdct_r_loop(int lim, float *e, int i_off, int k_off, const float *A, int k1) {
    isaac_fast_imdct_r_loop((uint32_t)lim, isaac_va((void *)e), (uint32_t)i_off, (uint32_t)k_off,
                            isaac_va((void *)A), (uint32_t)k1);
}

static void imdct_s_loop(int cnt, float *e, int i_off, int k_off, const float *A, int k1, int k0) {
    const float A0 = A[0], A1 = A[1], A2 = A[k1], A3 = A[k1 + 1],
                A4 = A[k1 * 2], A5 = A[k1 * 2 + 1], A6 = A[k1 * 3], A7 = A[k1 * 3 + 1];
    float *e2 = e + i_off + k_off;
    float *e0 = e2 - k_off - 2;
    for (; cnt > 0; --cnt) {
        float k00, k01;
        k00 = e0[2] - e2[0];  k01 = e0[1] - e2[-1];
        e0[2] = e0[2] + e2[0];  e0[1] = e0[1] + e2[-1];
        e2[0]  = k00 * A0 - k01 * A1;
        e2[-1] = k00 * A1 + k01 * A0;
        k00 = e0[0] - e2[-2];  k01 = e0[-1] - e2[-3];
        e0[0] = e0[0] + e2[-2];  e0[-1] = e0[-1] + e2[-3];
        e2[-2] = k00 * A2 - k01 * A3;
        e2[-3] = k00 * A3 + k01 * A2;
        k00 = e0[-2] - e2[-4];  k01 = e0[-3] - e2[-5];
        e0[-2] = e0[-2] + e2[-4];  e0[-3] = e0[-3] + e2[-5];
        e2[-4] = k00 * A4 - k01 * A5;
        e2[-5] = k00 * A5 + k01 * A4;
        k00 = e0[-4] - e2[-6];  k01 = e0[-5] - e2[-7];
        e0[-4] = e0[-4] + e2[-6];  e0[-5] = e0[-5] + e2[-7];
        e2[-6] = k00 * A6 - k01 * A7;
        e2[-7] = k00 * A7 + k01 * A6;
        e2 -= k0; e0 -= k0;
    }
}

static void imdct_ld654_loop(int cnt, float *e, int i_off, const float *A, int base_n) {
    const float A2 = A[base_n >> 3];
    float *z = e + i_off;
    float *base = z - 16 * cnt;
    for (; base < z; z -= 16) {
        float f13, f10, f4, f6, f17, f11, f7, f14, f15, f12, f5, f8, f18, f20, f16, f21, f9, f19;
        f13 = z[-1] - z[-9];
        f10 = z[-9] + z[-1];
        f4 = z[0] - z[-8];
        f6 = z[-8] + z[0];
        f17 = z[-3] - z[-11];
        f11 = z[-11] + z[-3];
        f7 = z[-2] - z[-10];
        f14 = z[-10] + z[-2];
        f15 = z[-14] - z[-6];
        f12 = z[-6] + z[-14];
        f5 = (f17 + f7) * A2;
        f8 = z[-5] - z[-13];
        f18 = (f17 - f7) * A2;
        f7 = z[-12] - z[-4];
        f20 = z[-4] + z[-12];
        f17 = z[-7] - z[-15];
        f16 = z[-15] + z[-7];
        f21 = z[-13] + z[-5];
        f9 = f6 - f20;
        f20 = f20 + f6;
        f19 = (f17 + f15) * A2;
        f17 = (f15 - f17) * A2;
        f6 = f12 + f14;
        f14 = f14 - f12;
        f12 = f11 - f16;
        f16 = f16 + f11;
        z[0] = f6 + f20;
        z[-2] = f20 - f6;
        f6 = f10 - f21;
        f21 = f21 + f10;
        z[-4] = f12 + f9;
        z[-6] = f9 - f12;
        f9 = f4 + f8;
        f4 = f4 - f8;
        z[-1] = f16 + f21;
        z[-3] = f21 - f16;
        z[-7] = f6 + f14;
        f12 = f19 + f5;
        z[-5] = f6 - f14;
        f5 = f5 - f19;
        f14 = f18 - f17;
        f17 = f17 + f18;
        z[-8] = f12 + f9;
        z[-10] = f9 - f12;
        z[-12] = f14 + f4;
        z[-14] = f4 - f14;
        f4 = f13 + f7;
        f13 = f13 - f7;
        z[-9] = f17 + f4;
        z[-11] = f4 - f17;
        z[-13] = f13 - f5;
        z[-15] = f13 + f5;
    }
}

/* may the host inverse_mdct run? a power-of-two n in the codec's range, a
 * blocktype of 0 or 1, the stack (alloca) scratch path, and every table
 * inside guest memory */
int isaac_fast_inverse_mdct_ok(uint32_t buf_va, uint32_t n, uint32_t f_va, uint32_t bt) {
    uint32_t n2, n4, n8, a, b, c, br;
    if (n < 64u || n > IMDCT_MAX_N || (n & (n - 1u)) || bt > 1u) return 0;
    if (!isaac_is_guest_va(f_va) || !isaac_is_guest_va(f_va + 0x460u + bt * 4u + 3u)) return 0;
    n2 = n >> 1; n4 = n >> 2; n8 = n >> 3;
    {   /* alloc_buffer installed: the scratch is guest memory at temp_offset - n2*4 */
        uint32_t ab = *(const uint32_t *)isaac_g(f_va + 0x60u);
        if (ab) {
            int32_t so = *(const int32_t *)isaac_g(f_va + 0x68u), to = *(const int32_t *)isaac_g(f_va + 0x6cu);
            int32_t off = to - (int32_t)(n2 * 4u);
            if (off < so) return 0;                                       /* the original would crash here */
            if (!isaac_is_guest_va(ab + (uint32_t)off) || !isaac_is_guest_va(ab + (uint32_t)off + n2 * 4u - 1u)) return 0;
        }
    }
    a = *(const uint32_t *)isaac_g(f_va + 0x43cu + bt * 4u);
    b = *(const uint32_t *)isaac_g(f_va + 0x444u + bt * 4u);
    c = *(const uint32_t *)isaac_g(f_va + 0x44cu + bt * 4u);
    br = *(const uint32_t *)isaac_g(f_va + 0x45cu + bt * 4u);
    if (!buf_va || !a || !b || !c || !br) return 0;
    if (!isaac_is_guest_va(buf_va) || !isaac_is_guest_va(buf_va + n * 4u - 1u)) return 0;
    if (!isaac_is_guest_va(a) || !isaac_is_guest_va(a + n2 * 4u - 1u)) return 0;
    if (!isaac_is_guest_va(b) || !isaac_is_guest_va(b + n2 * 4u - 1u)) return 0;
    if (!isaac_is_guest_va(c) || !isaac_is_guest_va(c + n4 * 4u - 1u)) return 0;
    if (!isaac_is_guest_va(br) || !isaac_is_guest_va(br + n8 * 2u - 1u)) return 0;
    return 1;
}

void isaac_fast_inverse_mdct(uint32_t buf_va, uint32_t n_u, uint32_t f_va, uint32_t bt) {
    const int n = (int)n_u, n2 = n >> 1, n4 = n >> 2, n8 = n >> 3;
    float *buffer = (float *)isaac_g(buf_va);
    float *buf2 = g_imdct_buf2;
    {
        uint32_t ab = *(const uint32_t *)isaac_g(f_va + 0x60u);
        if (ab) {
            int32_t to = *(const int32_t *)isaac_g(f_va + 0x6cu);
            buf2 = (float *)isaac_g(ab + (uint32_t)(to - (int32_t)((uint32_t)n2 * 4u)));
        }
    }
    const float *A = (const float *)isaac_g(*(const uint32_t *)isaac_g(f_va + 0x43cu + bt * 4u));
    const float *B = (const float *)isaac_g(*(const uint32_t *)isaac_g(f_va + 0x444u + bt * 4u));
    const float *C = (const float *)isaac_g(*(const uint32_t *)isaac_g(f_va + 0x44cu + bt * 4u));
    const uint16_t *bitrev = (const uint16_t *)isaac_g(*(const uint32_t *)isaac_g(f_va + 0x45cu + bt * 4u));
    int ld, l, lim, bound;

    /* step 1: twiddle the input into the scratch, in two halves */
    {
        float *d = buf2 + n2 - 2;
        const float *AA = A;
        const float *e = buffer;
        const float *e_stop = buffer + n2;
        for (; e != e_stop; e += 4) {
            d[1] = AA[0] * e[0] - AA[1] * e[2];
            d[0] = AA[0] * e[2] + AA[1] * e[0];
            AA += 2; d -= 2;
        }
        e = buffer + n2 - 3;
        for (; buf2 <= d; d -= 2) {
            d[1] = -e[2] * AA[0] - -e[0] * AA[1];
            d[0] = -e[0] * AA[0] - AA[1] * e[2];
            AA += 2; e -= 4;
        }
    }
    /* step 2: back into the buffer, the paper's w -> u */
    {
        const float *AA = A + n2 - 8;
        if (A <= AA) {
            const float *e0 = buf2 + n4 + 2;
            const float *e1 = buf2 + 2;
            float *d0 = buffer + n4;
            float *d1 = buffer + 1;
            do {
                float a = e0[-2], b = e1[-2];
                float v41 = e0[-1] - e1[-1];
                float c, d, v43;
                d0[1] = e0[-1] + e1[-1];
                d0[0] = e1[-2] + e0[-2];
                d1[0] = v41 * AA[4] - (a - b) * AA[5];
                d1[-1] = (a - b) * AA[4] + v41 * AA[5];
                c = e0[0]; v43 = e0[1] - e1[1]; d = e1[0];
                d0[3] = e1[1] + e0[1];
                d0[2] = e0[0] + e1[0];
                e1 += 4; e0 += 4;
                d1[2] = v43 * AA[0] - (c - d) * AA[1];
                d1[1] = v43 * AA[1] + (c - d) * AA[0];
                AA -= 8; d1 += 4; d0 += 4;
            } while (A <= AA);
        }
    }
    /* step 3: the butterflies -- two iter0 stages, four r loops at k1 16,
     * r loops while l < (ld-3)>>1, s loops while l < ld-6, then ld654 */
    ld = imdct_ilog(n);
    imdct_iter0_loop(n >> 4, buffer, n2 - 1, -n8, A);
    imdct_iter0_loop(n >> 4, buffer, n2 - n4 - 1, -n8, A);
    imdct_r_loop(n >> 5, buffer, n2 - 1, -(n >> 4), A, 16);
    imdct_r_loop(n >> 5, buffer, n2 - n8 - 1, -(n >> 4), A, 16);
    imdct_r_loop(n >> 5, buffer, n2 - n8 * 2 - 1, -(n >> 4), A, 16);
    imdct_r_loop(n >> 5, buffer, n2 - n8 * 3 - 1, -(n >> 4), A, 16);
    l = 2; lim = 4;
    bound = (ld - 4) >> 1;
    while (l < bound) {
        int k0 = n >> (l + 2);
        lim <<= 1;
        if (lim > 0) {
            int i_off = n2 - 1, i;
            for (i = lim; i != 0; --i) {
                imdct_r_loop(n >> (l + 4), buffer, i_off, -(k0 >> 1), A, 1 << (l + 3));
                i_off -= k0;
            }
        }
        ++l;
    }
    if (l < ld - 7) {
        int kbase = 1 << l, sh = l + 6, count = (ld - 7) - l;
        do {
            int k0 = n >> (sh - 4);
            int k1 = kbase << 3;
            int rlim = n >> sh;
            kbase <<= 1;
            if (rlim > 0) {
                const float *A0 = A;
                int i_off = n2 - 1;
                do {
                    imdct_s_loop(kbase, buffer, i_off, -(k0 >> 1), A0, k1, k0);
                    --rlim; A0 += k1 * 4; i_off -= 8;
                } while (rlim > 0);
            }
            ++sh; --count;
        } while (count != 0);
    }
    imdct_ld654_loop(n >> 5, buffer, n2 - 1, A, n);
    /* step 4: bit-reverse the buffer back into the scratch */
    {
        float *d0 = buf2 + n2 - 4;
        float *d1 = buf2 + n4 - 4;
        if (buf2 <= d1) {
            float *d2 = buf2 + n2 - 2;
            const uint16_t *br = bitrev;
            do {
                unsigned k = br[0];
                d2[1] = buffer[k]; d2[0] = buffer[k + 1]; d1[3] = buffer[k + 2]; d1[2] = buffer[k + 3];
                k = br[1];
                d2[-1] = buffer[k]; d2[-2] = buffer[k + 1]; d1[1] = buffer[k + 2]; d1[0] = buffer[k + 3];
                d1 -= 4; br += 2; d2 -= 4;
            } while (buf2 <= d1);
        }
        /* step 7: the C twiddle across the scratch's two halves */
        if (buf2 < d0) {
            const float *Cp = C + 2;
            float *d = buf2 + 2;
            const float *dm;
            do {
                float a02 = d[-1] + d0[3];
                float a11 = d[-2] - d0[2];
                float b0 = d[-2] + d0[2];
                float b1 = Cp[-2] * a02 + Cp[-1] * a11;
                float b2 = Cp[-1] * a02 - Cp[-2] * a11;
                float a13 = d[-1] - d0[3];
                float c0, s, t, u, v, w, x;
                const float *C1;
                d[-2] = b0 + b1;
                d[-1] = a13 + b2;
                d0[2] = b0 - b1;
                d0[3] = b2 - a13;
                c0 = Cp[0]; C1 = Cp + 1;
                s = d[1] + d0[1];
                Cp += 4;
                t = d[0] - d0[0];
                u = C1[0] * s - c0 * t;
                v = d[0] + d0[0];
                w = d[1] - d0[1];
                x = C1[0] * t + c0 * s;
                d[0] = v + x;
                d[1] = w + u;
                d0[0] = v - x;
                d0[1] = u - w;
                d0 -= 4; dm = d + 2; d += 4;
            } while (dm < d0);
        }
    }
    /* step 8: the B window, four outputs per scratch pair, into the buffer */
    {
        float *d0 = buffer + n2 - 4;
        const float *e = buf2 + n2 - 8;
        if (buf2 <= e) {
            float *d1 = buffer + 2;
            const float *Bp = B + n2 - 2;
            float *d3 = d0 + (n - n2) + 2;
            float *d2 = buffer + n2 + 2;
            do {
                float p0, p1, e0v;
                const float *B5, *B6, *e1p;
                p0 = Bp[1] * e[6] - Bp[0] * e[7];
                p1 = -e[6] * Bp[0] - Bp[1] * e[7];
                d1[-2] = p0; d0[3] = -p0; d2[-2] = p1; d3[1] = p1;
                p0 = Bp[-1] * e[4] - Bp[-2] * e[5];
                p1 = -e[4] * Bp[-2] - Bp[-1] * e[5];
                d1[-1] = p0; d0[2] = -p0; d2[-1] = p1; d3[0] = p1;
                p0 = Bp[-3] * e[2] - Bp[-4] * e[3];
                p1 = -e[2] * Bp[-4] - Bp[-3] * e[3];
                d1[0] = p0; d0[1] = -p0; d2[0] = p1; d3[-1] = p1;
                B5 = Bp - 5; e0v = e[0]; B6 = Bp - 6; e1p = e + 1;
                e -= 8; Bp -= 8;
                p0 = B5[0] * e0v - B6[0] * e1p[0];
                p1 = -e0v * B6[0] - B5[0] * e1p[0];
                d1[1] = p0; d0[0] = -p0; d1 += 4; d2[1] = p1; d0 -= 4; d3[-2] = p1; d3 -= 4; d2 += 4;
            } while (buf2 <= e);
        }
    }
    /* temp_offset is left as it was (the original restores what it took) */
}

/* the bytes the loop touches: [lo, lo + len) covering both runs (for the verify mode) */
void isaac_fast_imdct_r_loop_range(uint32_t lim, uint32_t e_va, uint32_t d0, uint32_t k_off,
                                   uint32_t *lo, uint32_t *len) {
    int n = (int)lim >> 2;
    uint32_t e2 = e_va + (d0 + k_off) * 4u, e0 = e2 - k_off * 4u - 8u;
    uint32_t lo0 = e0 - (uint32_t)(8 * n - 3) * 4u, hi0 = e0 + 12u;
    uint32_t lo2 = e2 - (uint32_t)(8 * n - 1) * 4u, hi2 = e2 + 4u;
    *lo = lo0 < lo2 ? lo0 : lo2;
    *len = (hi0 > hi2 ? hi0 : hi2) - *lo;
}
/* may the host loop run? no for an empty loop, or when either run or the
 * twiddle reads fall outside guest memory (the lifted body then runs and
 * traps the way the original would have) */
int isaac_fast_imdct_r_loop_ok(uint32_t lim, uint32_t e_va, uint32_t d0, uint32_t k_off,
                               uint32_t a_va, uint32_t k1, uint32_t *lo, uint32_t *len) {
    int n = (int)lim >> 2;
    if (n <= 0) return 0;
    isaac_fast_imdct_r_loop_range(lim, e_va, d0, k_off, lo, len);
    if (!*len || !isaac_is_guest_va(*lo) || !isaac_is_guest_va(*lo + *len - 1u)) return 0;
    if (!isaac_is_guest_va(a_va) || !isaac_is_guest_va(a_va + ((uint32_t)(4 * n - 1) * k1 + 1u) * 4u)) return 0;
    return 1;
}

/* png_read_filter_row: libpng 1.6's png_row_info at row_info_va
 *   +0 width, +4 rowbytes, +8 color_type, +9 bit_depth, +0xa channels,
 *   +0xb pixel_depth.  row/prev point at the first byte after the filter
 * byte, as libpng passes them; filter 0..4 per the PNG spec. */
void isaac_fast_unfilter(uint32_t row_info_va, uint32_t row_va, uint32_t prev_va,
                         uint32_t filter) {
    uint32_t rowbytes = isaac_r32(row_info_va + 4u);
    uint32_t bpp = (uint32_t)(*(const uint8_t *)isaac_g(row_info_va + 0xbu) + 7u) >> 3;
    if (!rowbytes || !isaac_is_guest_va(row_va + rowbytes - 1u)) return;
    uint8_t *row = (uint8_t *)isaac_g(row_va);
    const uint8_t *prev = (prev_va && isaac_is_guest_va(prev_va + rowbytes - 1u))
                              ? (const uint8_t *)isaac_g(prev_va) : NULL;
    uint32_t i;
    switch (filter) {
    case 0: break;
    case 1:                                        /* Sub */
        for (i = bpp; i < rowbytes; i++) row[i] = (uint8_t)(row[i] + row[i - bpp]);
        break;
    case 2:                                        /* Up */
        if (prev) for (i = 0; i < rowbytes; i++) row[i] = (uint8_t)(row[i] + prev[i]);
        break;
    case 3:                                        /* Avg */
        for (i = 0; i < bpp && i < rowbytes; i++)
            row[i] = (uint8_t)(row[i] + ((prev ? prev[i] : 0u) >> 1));
        for (i = bpp; i < rowbytes; i++)
            row[i] = (uint8_t)(row[i] + (((uint32_t)row[i - bpp] + (prev ? prev[i] : 0u)) >> 1));
        break;
    case 4:                                        /* Paeth */
        for (i = 0; i < bpp && i < rowbytes; i++)
            row[i] = (uint8_t)(row[i] + (prev ? prev[i] : 0u));
        for (i = bpp; i < rowbytes; i++) {
            int a = row[i - bpp], b = prev ? prev[i] : 0, c = prev ? prev[i - bpp] : 0;
            int p = a + b - c;
            int pa = abs(p - a), pb = abs(p - b), pc = abs(p - c);
            int pred = (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
            row[i] = (uint8_t)(row[i] + pred);
        }
        break;
    default: break;                                /* the lifted body reports the error */
    }
}

/* zlib adler32(adler, buf, len): RFC 1950, BASE 65521, NMAX 5552. */
uint32_t isaac_fast_adler32(uint32_t adler, uint32_t buf_va, uint32_t len) {
    if (!buf_va) return 1u;
    if (len && !isaac_is_guest_va(buf_va + len - 1u)) return adler;
    const uint8_t *p = (const uint8_t *)isaac_g(buf_va);
    uint32_t s1 = adler & 0xffffu, s2 = adler >> 16;
    while (len) {
        uint32_t n = len < 5552u ? len : 5552u;
        len -= n;
        while (n--) { s1 += *p++; s2 += s1; }
        s1 %= 65521u; s2 %= 65521u;
    }
    return (s2 << 16) | s1;
}

/* The engine's texture premultiply (0x00a663c0): for `count` RGBA8 pixels,
 * alpha 0xff = untouched, alpha 0 = pixel zeroed, otherwise each of R,G,B
 * replaced by table[(alpha << 8) | value] -- the 64 KB table lives in the
 * image (0x00c13640 when [0x00c798e4] & 8, else 0x00c23640). */
void isaac_fast_premultiply(uint32_t pixels_va, uint32_t count, uint32_t table_va) {
    if (!count || !isaac_is_guest_va(pixels_va + count * 4u - 1u) ||
        !isaac_is_guest_va(table_va + 0xffffu)) return;
    uint8_t *p = (uint8_t *)isaac_g(pixels_va);
    const uint8_t *t = (const uint8_t *)isaac_g(table_va);
    for (uint32_t i = 0; i < count; i++, p += 4) {
        uint8_t a = p[3];
        if (a == 0xffu) continue;
        if (a == 0u) { p[0] = p[1] = p[2] = p[3] = 0; continue; }
        uint32_t base = (uint32_t)a << 8;
        p[0] = t[base | p[0]];
        p[1] = t[base | p[1]];
        p[2] = t[base | p[2]];
    }
}

/* Verify-mode support: compare a guest range against a host snapshot. */
int isaac_fast_verify_equal(const void *snapshot, uint32_t va, uint32_t len) {
    if (!isaac_is_guest_va(va + len - 1u)) return 1;
    return memcmp(snapshot, isaac_g(va), len) == 0;
}

static uint32_t g_mismatches;
void isaac_fastpath_mismatch(const char *what, uint32_t a, uint32_t b) {
    ++g_mismatches;
    if (g_mismatches <= 20u)
        isaac_log("[isaac][fastpath] MISMATCH #%u in %s (%u, %u): host result differs from the lifted body",
                  g_mismatches, what, a, b);
}
uint32_t isaac_fastpath_mismatches(void) { return g_mismatches; }

/* The exit census (round 27): per wrapper, how many calls ran the lifted body
 * (ISAAC_FASTPATH=0, or the host path declining: a refill, a contended lock, a
 * count reaching zero) and how many verify compares completed, so that
 * "0 mismatches" comes with the number of calls it was measured over. The
 * host path itself is not counted -- for a dispatched wrapper it is the
 * dispatch census minus the lifted count -- to keep the hot path free of it. */
#define FP_CENSUS_MAX 16
static uint32_t g_fp_va[FP_CENSUS_MAX], g_fp_lifted[FP_CENSUS_MAX], g_fp_verified[FP_CENSUS_MAX];
static unsigned g_fp_n;
void isaac_fastpath_count(uint32_t va, int kind) {
    unsigned i = 0;
    for (; i < g_fp_n; ++i) if (g_fp_va[i] == va) break;
    if (i == g_fp_n) { if (g_fp_n >= FP_CENSUS_MAX) return; g_fp_va[g_fp_n++] = va; }
    if (kind == 2) ++g_fp_verified[i]; else ++g_fp_lifted[i];
}
void isaac_fastpath_report(void) {
    if (!g_fp_n && !g_mismatches) return;
    static const char *const modes[] = { "lifted (ISAAC_FASTPATH=0)", "host", "verify (ISAAC_FASTPATH_VERIFY=1)" };
    isaac_log("[isaac][fastpath] ---- mode %s: %u mismatch(es) ----", modes[fastpath_mode()], g_mismatches);
    for (unsigned i = 0; i < g_fp_n; ++i)
        isaac_log("[isaac][fastpath]   sub_%08x: %u lifted, %u verified", g_fp_va[i], g_fp_lifted[i], g_fp_verified[i]);
}

/* The engine's path hash (FUN_00a159d0): djb2 over the string with ASCII
 * upper-case folded down and '\\' folded to '/', so "GFX\\X.PNG" and
 * "gfx/x.png" hash alike. It is the hot leaf of every resource lookup -- the
 * round-18 stall dump found it and the path normalisation above it dominating
 * the ring while the game resolved one enemy's anm2. Pure: same string, same
 * answer, no state. */
uint32_t isaac_fast_pathhash(uint32_t str_va) {
    if (!str_va) return 0u;
    uint32_t h = 0x1505u;
    for (uint32_t a = str_va;; ++a) {
        if (!isaac_is_guest_va(a)) break;
        uint8_t b = *(const uint8_t *)isaac_g(a);
        if (!b) break;
        uint32_t c = (b >= 'A' && b <= 'Z') ? (uint32_t)(b + 0x20u) : (uint32_t)b;
        if (c == 0x5Cu) c = 0x2Fu;
        h = h * 33u + c;
    }
    return h;
}

/* ---- round 27: the leaves of the dispatch census ---------------------------
 * The fast profile's dispatch census over 3,000 gameplay frames (recomp-
 * architecture.md 21.42) put 71 M of its 93 M dispatches in four fragments of
 * ONE function: the ISAAC CSPRNG core that refills the v2 archive keystream,
 * whose per-iteration `switch (i & 3)` is a jump table the lifter dispatches
 * through, 256 times per call. Next came the engine Mutex's Lock/Unlock
 * (5.07 M each) under the refcount-handle helpers, and ArchivedFile::read
 * (1.18 M, the top inclusive time). Each gets an exact host version here; the
 * wrappers in lift_patches.py decide BEFORE any side effect whether the host
 * version applies and otherwise run the lifted body untouched. */

/* [va, va+len) is guest memory (and does not wrap). */
int isaac_fast_guest_range(uint32_t va, uint32_t len) {
    if (!len) return isaac_is_guest_va(va);
    return va + len >= va && isaac_is_guest_va(va + len - 1u);
}

/* Bob Jenkins' isaac() (0x00aa94a0) on the engine's context layout:
 *   +0x000 the consumer's result index, +0x004 r[256], +0x404 mm[256],
 *   +0x804 a, +0x808 b, +0x80c c.
 * The lifted body reads a and b back from memory every iteration and writes
 * mm[i], r[i], a and b as it goes; no mm/r index can alias the scalars, so
 * keeping a and b in locals and storing them at the end leaves the same bytes.
 * `edx_out` receives what the last iteration leaves in EDX (a after its xor
 * step) so the wrapper hands back the same scratch registers; the last b is
 * EAX and is read back from +0x808. Returns 0 (nothing touched) when the
 * context is not guest memory. */
int isaac_fast_isaac(uint32_t ctx_va, uint32_t *edx_out) {
    if (!isaac_fast_guest_range(ctx_va, 0x810u)) return 0;
    uint32_t *r = (uint32_t *)isaac_g(ctx_va + 4u);
    uint32_t *mm = (uint32_t *)isaac_g(ctx_va + 0x404u);
    uint32_t a = isaac_r32(ctx_va + 0x804u), b = isaac_r32(ctx_va + 0x808u);
    uint32_t c = isaac_r32(ctx_va + 0x80cu) + 1u, axor = a;
    b += c;
    for (uint32_t i = 0; i < 256u; i++) {
        uint32_t x = mm[i], y;
        switch (i & 3u) {
        case 0: a ^= a << 13; break;
        case 1: a ^= a >> 6; break;
        case 2: a ^= a << 2; break;
        default: a ^= a >> 16; break;
        }
        axor = a;
        a += mm[(i + 128u) & 0xffu];
        y = mm[(x >> 2) & 0xffu] + a + b;
        mm[i] = y;
        b = mm[(y >> 10) & 0xffu] + x;
        r[i] = b;
    }
    isaac_w32(ctx_va + 0x804u, a);
    isaac_w32(ctx_va + 0x808u, b);
    isaac_w32(ctx_va + 0x80cu, c);
    if (edx_out) *edx_out = axor;
    return 1;
}

/* The keystream consumer (0x00a89d70; thiscall, [this] -> the context above,
 * stack: buf, len): XORs len bytes with the r[] words, least significant byte
 * first, taking word r[idx] at every fourth byte and refilling through isaac()
 * the moment r[255] has been taken (the index resets to 0). A trailing partial
 * word is dropped: the next call starts on a fresh word. `ok` is the
 * side-effect-free precondition (guest ranges, an index inside r[]); `xor`
 * assumes it. */
int isaac_fast_keystream_ok(uint32_t self_va, uint32_t buf_va, uint32_t len) {
    if (!isaac_fast_guest_range(self_va, 4u)) return 0;
    uint32_t ctx = isaac_r32(self_va);
    if (!isaac_fast_guest_range(ctx, 0x810u) || !isaac_fast_guest_range(buf_va, len)) return 0;
    if (!isaac_is_guest_va(ctx) || isaac_r32(ctx) > 0xffu) return 0;
    return 1;
}
void isaac_fast_keystream_xor(uint32_t self_va, uint32_t buf_va, uint32_t len) {
    uint32_t ctx = isaac_r32(self_va);
    uint32_t *c = (uint32_t *)isaac_g(ctx);
    uint8_t *p = (uint8_t *)isaac_g(buf_va);
    uint32_t w = 0u;
    for (uint32_t k = 0; k < len; k++) {
        if ((k & 3u) == 0u) {
            uint32_t idx = c[0];
            w = c[idx + 1u];
            c[0] = idx + 1u;
            if (idx + 1u > 0xffu) { isaac_fast_isaac(ctx, NULL); c[0] = 0u; }
        } else {
            w >>= 8;
        }
        p[k] ^= (uint8_t)w;
    }
}

/* ArchivedFile::read (0x00a69510; thiscall, stack: buf, size, count; ret 0xc):
 *   +0x018 stream position, +0x81c the 0x400-byte decoded window,
 *   +0xc1c window position, +0xc20 window fill, +0xc28 eof.
 * It serves size*count bytes from the window and refills through 0x00a68cf0
 * when the window runs dry. The host takes only the calls the window can
 * satisfy outright, or that end at eof (the lifted loop returns what it has
 * once eof is set): a refill decodes a piece through the stream, the LZW /
 * deflate state and the keystream above, and stays the lifted body's job.
 * `plan` decides that with no side effect; `window` performs the copy. */
int isaac_fast_read_plan(uint32_t self, uint32_t buf, uint32_t n, uint32_t *take) {
    if (!isaac_fast_guest_range(self, 0xc29u)) return 0;
    uint32_t pos = isaac_r32(self + 0xc1cu), fill = isaac_r32(self + 0xc20u);
    uint32_t avail = pos < fill ? fill - pos : 0u;
    if (n > avail && !isaac_r8(self + 0xc28u)) return 0;      /* a refill: not ours */
    uint32_t t = n < avail ? n : avail;
    if (t && (!isaac_fast_guest_range(buf, t) || !isaac_fast_guest_range(self + 0x81cu + pos, t))) return 0;
    if (!isaac_is_guest_va(buf)) return 0;
    *take = t;
    return 1;
}
void isaac_fast_read_window(uint32_t self, uint32_t buf, uint32_t take) {
    uint32_t pos = isaac_r32(self + 0xc1cu);
    if (take) memmove(isaac_g(buf), isaac_g(self + 0x81cu + pos), take);   /* the CRT memcpy is memmove-safe */
    isaac_w32(self + 0x18u, isaac_r32(self + 0x18u) + take);
    isaac_w32(self + 0xc1cu, pos + take);
}

/* The engine Mutex (0x00a15770 family): +0 vtable, +4 flags (bit 0 =
 * initialised), +8 -> a 0x1c-byte block holding the 24-byte Win32
 * CRITICAL_SECTION and the engine's own 'locked' byte at +0x18. Lock(-1)
 * (0x00a157f0) is EnterCriticalSection, spin on that byte with Sleep(1000),
 * set it, return 1; Unlock (0x00a159a0) clears it and Leaves. In this runtime
 * Enter reports the acquire to the thread slicer (isaac_threads_note_cs: the
 * idle-lap detection, which may yield) and Leave does nothing, so the
 * uncontended Lock is exactly that report plus the byte. The contended case
 * -- the byte already set, i.e. a sliced job holding the mutex -- and every
 * timeout other than INFINITE are left to the lifted body. */
static uint32_t mutex_cs(uint32_t mutex) {   /* the block, or 0 unless initialised and in guest memory */
    if (!isaac_fast_guest_range(mutex, 0xcu)) return 0u;
    if (!(isaac_r8(mutex + 4u) & 1u)) return 0u;
    uint32_t cs = isaac_r32(mutex + 8u);
    if (!cs || !isaac_fast_guest_range(cs, 0x1cu)) return 0u;
    return cs;
}
int isaac_fast_mutex_init(uint32_t mutex) { return mutex_cs(mutex) != 0u; }
int isaac_fast_mutex_free(uint32_t mutex) {
    uint32_t cs = mutex_cs(mutex);
    return cs != 0u && isaac_r8(cs + 0x18u) == 0u;
}
/* The refcount handles reach their (embedded) mutex through its vtable, +0xc
 * Lock and +0x10 Unlock; the host stands in for the engine's own pair only. */
int isaac_fast_mutex_std(uint32_t mutex) {
    if (!isaac_fast_mutex_free(mutex)) return 0;
    uint32_t vt = isaac_r32(mutex);
    if (!isaac_is_guest_va(vt) || !isaac_fast_guest_range(vt, 0x14u)) return 0;
    return isaac_r32(vt + 0xcu) == 0x00a157f0u && isaac_r32(vt + 0x10u) == 0x00a159a0u;
}
extern void isaac_threads_note_cs(uint32_t cs);          /* host_shims_module.c */
void isaac_fast_mutex_take(uint32_t mutex) {             /* Lock(INFINITE), uncontended */
    uint32_t cs = isaac_r32(mutex + 8u);
    isaac_threads_note_cs(cs);                           /* what EnterCriticalSection does here; may yield */
    *(uint8_t *)isaac_g(cs + 0x18u) = 1u;
}
void isaac_fast_mutex_drop(uint32_t mutex) {             /* Unlock: the byte, then a LeaveCriticalSection that is a no-op */
    uint32_t cs = isaac_r32(mutex + 8u);
    *(uint8_t *)isaac_g(cs + 0x18u) = 0u;
}

/* ---- probes (lift_patches.py PROBE_PATCHES) ------------------------------
 * ISAAC_PROBE=1: log the first calls of a lifted function that the dispatch
 * watch cannot see because its callers reach it directly. `tag` is the
 * function's VA; the three values are whatever the probe wants to show. */
int isaac_probe_on(void) {
    static int v = -1;
    if (v < 0) { const char *e = getenv("ISAAC_PROBE"); v = (e && *e && *e != '0') ? 1 : 0; }
    return v;
}
void isaac_probe_hit(uint32_t tag, uint32_t a, uint32_t b, uint32_t c) {
    static uint32_t tags[16];
    static unsigned hits[16], n;
    unsigned i = 0;
    for (; i < n; ++i) if (tags[i] == tag) break;
    if (i == n) { if (n >= 16u) return; tags[n] = tag; hits[n] = 0u; n++; }
    if (++hits[i] > 64u) return;    /* 64, like isaac_probe_str: the boot alone opens dozens of streams */
    isaac_log("[isaac][probe] sub_%08x #%u: %08x %08x %08x", tag, hits[i], a, b, c);
}
/* A probe value that is a guest C string (round 24d: the sound path an ogg
 * stream is asked to open). Same first-8-per-tag budget as isaac_probe_hit;
 * a null or non-guest pointer prints as such instead of faulting. */
void isaac_probe_str(uint32_t tag, const char *label, uint32_t p) {
    static uint32_t tags[16];
    static unsigned hits[16], n;
    unsigned i = 0;
    char buf[96];
    for (; i < n; ++i) if (tags[i] == tag) break;
    if (i == n) { if (n >= 16u) return; tags[n] = tag; hits[n] = 0u; n++; }
    if (++hits[i] > 64u) return;    /* 64: the resource resolver is hit ~10 times during boot alone */
    if (!p) { isaac_log("[isaac][probe] sub_%08x %s: (null)", tag, label); return; }
    if (!isaac_is_guest_va(p)) { isaac_log("[isaac][probe] sub_%08x %s: 0x%08x (not a guest address)", tag, label, p); return; }
    { unsigned k = 0; const char *s = (const char *)isaac_g(p);
      while (k < sizeof buf - 1u && isaac_is_guest_va(p + k) && s[k]) { buf[k] = s[k]; ++k; }
      buf[k] = 0; }
    isaac_log("[isaac][probe] sub_%08x %s: 0x%08x \"%s\"", tag, label, p, buf);
}
