#pragma once

#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

/* Guest allocator WRAPPERS — a NEW freestanding pure-helper family, ABI v1.

   Standing decision (docs/decomp-port.md, re-affirmed here): the guest
   allocator is a platform primitive; the allocator *wrappers* are game logic.
   Wrapper-visible behaviour — header layout, accounting counters, payload
   bias, alignment arithmetic, size clamps, overflow predicates, free
   ordering, zero-size short-circuits — is read back by the game and is
   externally observable, so it is translated here. Raw `malloc` / `free`,
   the OOM observer broadcast, `_Xlength_error`, `_CxxThrowException`,
   `_invalid_parameter_noinfo_noreturn` and the SEH frame registration stay
   address-stable host actions.

   Three sections independently terminated at these wrappers and requested
   this family (ANM2 v3 at 0x00a648b0; Exit v27/v29 at 0x00a0f4c0 /
   0x00a648b0; render-alloc-v11 and frame-opaque v20/v22 at
   0x00a0f4c0 -> 0x00a648b0 and the 0x004170d0 size-throw).

   Roots (identity checked this unit with scripts/decomp/identify-zhl-address
   — NO root has an exact ZHL match; every name below is address-stable):

     0x00a648b0  tracked heap wrapper. Register convention: mode arrives in
                 CL and is read with `movzx eax, cl` — the LOW BYTE ONLY
                 (real callers leave `this` in the upper 24 bits of ECX);
                 the free-side pointer arrives in EDX; two dword stack args
                 carry (size_lo, size_hi) — free callsites push two ZEROS,
                 so a push-counting reading concludes no pointer is passed.
                 Modes: 0 alloc / 1 free / 2 account-fold / other = no-op.
                 459 rel32 `e8` callsites (345 boundary-decodable).
     0x00a0f4c0  thin alloc wrapper: push 0 (hi), push [ebp+8] (lo),
                 edx = 0, cl = 0 -> 0x00a648b0. 739 callsites.
     0x00a0f4e0  thin alloc sibling: size taken from ECX. It pushes the FULL
                 ECX as size_lo and only afterwards `xor cl, cl` for the
                 mode, so the pushed size keeps its own low byte. 214 sites.
     0x00a0f500  free wrapper (SEH frame, funcinfo 0x00af1310, cookie
                 0x00bf93b4): edx = [ebp+8], cl = 1, push 0, push 0.
                 Exactly ONE rel32 caller: 0x00aef15c.
     0x00aef15c  sized operator-delete shim: takes (ptr, size) and forwards
                 ONLY the pointer to 0x00a0f500 — the size argument is
                 DROPPED. (`push [ebp+8]; call 0xa0f500`.)
     0x0040cf00  MSVC-style aligned string-buffer allocator, size in ECX:
                 size >= 0x1000 over-allocates by 0x23, aligns the payload
                 to (raw + 0x23) & ~0x1f, stashes raw at payload-4; a
                 size+0x23 unsigned wrap throws via 0x0040cee0; a NULL big
                 alloc calls IAT [0x00b18894]
                 (_invalid_parameter_noinfo_noreturn) — noreturn, so the
                 fall-through into the small path is dead; a ZERO-size small
                 request returns NULL without calling the allocator at all;
                 a small-path NULL is returned unchecked. 614 callsites.
     0x0040cf50  string COPY ctor (v3, AK): SSO/len gates — src data sits
                 at [src] iff src cap >= 0x10 else at the src object; a
                 src size < 0x10 copies 16 bytes inline and sets cap 0xf;
                 the big path rounds cap = min(size|0xf, 0x7fffffff),
                 allocs cap+1 via 0x0040cf00, memcpys size+1, and writes
                 size = src_size, cap. 370 callsites.
     0x0040ccd0  string ASSIGN (v4, AM): (src, n) thiscall, ret 8 — the
                 biggest remaining alloc wrapper. UNSIGNED grow gate
                 `n > [this+0x14]`; the fast path memmoves n bytes into
                 the current data (cap >= 0x10 ? [this] : this — the
                 AK/getter data select), writes size = n and NUL at
                 data[n]; the grow path throws for n > 0x7fffffff via
                 0x0040ccc0 (IN-BODY length gate, one of the 82 pinned
                 xlength-string callers), clamps the new capacity
                 (n|0xf and cap + cap>>1 against 0x7fffffff, cmovb max),
                 allocs new_cap+1 via 0x0040cf00, memcpys n, writes
                 size/cap, then releases the old buffer iff old cap >=
                 0x10 (AH template over cap+1; delta > 0x1f aborts via
                 IAT [0x00b18894] noreturn — the buf swap at 0x40cda3 is
                 unreached) and swaps buf. Fast copy = thunk 0x00af08bd
                 (IAT [0x00b18748] VCRUNTIME140!memmove — overlap-safe);
                 grow copy = thunk 0x00af05df (IAT [0x00b18760]
                 VCRUNTIME140!memcpy). 1062 lea-corrected callsites.
     0x0040d040  string tidy/clear (v3, AL): release gate cap >= 0x10, the
                 AH release template over size cap+1, then reset size = 0,
                 cap = 0xf, byte [this] = 0; the delta > 0x1f abort is IAT
                 [0x00b18894] noreturn (nothing resets). 1288 callsites.
     0x0040c740  out-of-line u32 deallocate (v2): SAME instruction shape as
                 the inline release template, ONE new law — the size
                 argument is an element COUNT scaled `lea ecx,[eax*4]`
                 inside the wrapper (ret 8; (payload, count)). The small
                 path frees the payload directly, the big path validates
                 delta <= 0x1f then frees raw, abort = IAT [0x00b18894]
                 noreturn, and the size is dropped by 0x00aef15c. 57 e8
                 callsites (anm2 hash 0x40c9ce, room B20 0x80687f,
                 PlayerHUD 0x851a07.., update records 0x9d318a).
     (inline)    aligned-release template, 2617 occurrences in .text:
                 size >= 0x1000 -> raw = [payload-4]; size += 0x23;
                 delta = payload - raw - 4; `cmp delta, 0x1f ; ja` ->
                 IAT [0x00b18894] noreturn unless delta <= 0x1f; then the
                 sized delete (which drops the size) frees raw. Small blocks
                 free the payload directly.
     0x004170d0  length-error throw: push 0x00b1b160 "map/set too long",
                 call IAT [0x00b184d4] (MSVCP140 std::_Xlength_error), int3.
                 Noreturn host body; 86 callsites keep their own predicates.
     0x0040cee0  bad-array-new-length throw helper (ctor 0x0040cde0, vtable
                 0x00b1a740, throw-info 0x00bd5bcc, _CxxThrowException via
                 thunk 0x00af05eb -> IAT [0x00b18758]). Noreturn host;
                 202 callsites. The body reads NO stack argument (no
                 [ebp+8] access) — the bad-array-new-length COUNT gates
                 live at the CALLSITES, never in this body (v3 census
                 row; v5 audit: all 202 gates enumerated — throw iff a
                 caller-derived COUNT > K with K = floor((2^32-1)/elem
                 size), 37 distinct constants verified exact; row
                 finalized, alloc-v5-countgate-audit/NOTES.md).
     0x00a23200  OOM observer broadcast: walks the intrusive list at
                 [0x00c37974] calling each node's [node+8](arg, [node+0xc]);
                 0x00a648b0 calls it with the literal 0x7fcb9dd6 when malloc
                 returns NULL. Host (callback dispatch); 45 callsites.

   IAT identities resolved from the PE import directory this unit:
     [0x00b187e0] api-ms-win-crt-heap-l1-1-0.dll!malloc
     [0x00b187dc] api-ms-win-crt-heap-l1-1-0.dll!free
     [0x00b18894] api-ms-win-crt-runtime-l1-1-0.dll!
                  _invalid_parameter_noinfo_noreturn
     [0x00b184d4] MSVCP140.dll!?_Xlength_error@std@@YAXPBD@Z
     [0x00b18758] VCRUNTIME140.dll!_CxxThrowException

   Binary: tools/isaac-ng.unpacked.exe
   SHA-256: 5129DF723E645DAAEA59514394195F3EA1DCE1671BB0433D724648A845017200
   Evidence: output/decomp/5129df723e64/section-notes/alloc-v1/
     (disasm-roots.txt, disasm-release.txt, falsifier2.py output)

   ---- 0x00a648b0 exact control flow (whole body disassembled) ----

   prologue VA 0x00a648b5..0x00a648c2:
     edi = *(uint32*)0x00c7de78            ; tracked stats object (BSS,
     esi = edi + 0x30                      ;  zero-filled at load: both
     if (edi == 0) esi = 0x00c7f618        ;  0xc7de78 and 0xc7f618 sit past
                                           ;  .data's raw size)
   mode dispatch VA 0x00a648c7..0x00a648d7: movzx eax, cl; three `sub`/`jcc`.

   ALLOC (mode 0) VA 0x00a6490f..0x00a64960:
     ebx = size_hi ([ebp+0xc])
     if (ebx != 0) goto clamp              ; test ebx,ebx ; jne
     edi = size_lo ([ebp+8])
     if (edi <= 0xffffffff) goto ok        ; cmp edi,-1 ; jbe — ALWAYS TAKEN
                                           ; (dead branch: no u32 exceeds it,
                                           ;  so ONLY size_hi != 0 clamps)
   clamp: movlpd [ebp+8], xmm0(=0)         ; zeroes BOTH stack dwords
     ebx = 0 ; edi = 0                     ; reloaded from the zeroed slots
   ok: edi += 4                            ; malloc size (32-bit WRAP)
     push edi ; adc ebx, 0                 ; ebx = carry(size_lo + 4)
     eax = IAT malloc(edi)                 ; HOST
     if (eax == 0):
       push 0x7fcb9dd6 ; call 0x00a23200   ; HOST observer broadcast
       return 0
     *esi += edi                           ; acct_lo += size_lo+4  (add)
     *(uint32*)eax = edi                   ; HEADER at block = size_lo+4
     *(esi+4) += ebx + CF                  ; acct_hi (adc): a TRUE 64-bit add
     return eax + 4                        ; payload bias +4

   FREE (mode 1) VA 0x00a648ef..0x00a64906:
     if (edx == 0) return 0                ; gate, nothing at all happens
     eax = *(uint32*)(edx - 4)             ; header read back
     *esi -= eax                           ; acct_lo -= header  (sub)
     *(esi+4) -= CF                        ; sbb [esi+4], 0 — subtracts the
                                           ; BORROW ONLY, never a high word
     IAT free(edx - 4)                     ; HOST
     return 0

   ACCOUNT (mode 2) VA 0x00a648d9..0x00a648ee:
     *(edi+0x30) += *(uint32*)0x00c7f618   ; add
     *(edi+0x34) += *(uint32*)0x00c7f61c + CF  ; adc — true 64-bit fold
     return 0
     NOTE the asymmetry, pinned below: the fold target is edi+0x30
     UNCONDITIONALLY (the esi fallback select is ignored), so a mode-2 call
     with no tracked object stores at VA 0x30/0x34; and the fallback pair is
     NOT cleared after folding. A 32-byte-window census over all 459
     callsites finds cl=1 at 425, cl=0 at 33, unresolved 1, and NO immediate
     cl=2 site — the arm is proven from the body, not from a caller.

   ---- Original-binary defect, REPRODUCED and pinned, never corrected ----

   D-ALLOC-1 (free never subtracts the alloc carry): the alloc side adds
   (size_lo + 4) as a 64-bit value — up to 0x1'00000003 — but the header can
   record only its low 32 bits. The free side subtracts that 32-bit header
   with borrow propagation only (`sbb [esi+4], 0`), so an alloc whose
   size_lo + 4 carried leaves a permanent +0x1'00000000 residue in the
   accounting pair regardless of the counter's starting value (the borrow
   cancels the lo-add carry exactly — proven in the tests). Reachable: the
   DirectInput DIDOD walk at VA 0x00a6e793..0x00a6e7b0 saturates
   count * 0x14 (mul/seto/neg/or) to size_lo = 0xffffffff, size_hi = 0, so
   the wrapper calls malloc(3) (0xffffffff + 4 wraps), stores header 3, and
   accounts 0x1'00000003. The residue is observable wherever the counter
   pair is read, including through the mode-2 fold.

   ---- Falsifier (standing-decision check, run this unit) ----

   Boundary-anchored scan over every rel32 callsite of the four
   alloc-returning roots (0x00a0f4c0: 662, 0x00a0f4e0: 193, 0x0040cf00: 533,
   0x00a648b0: 345 boundary-real sites): NO ordering comparison between
   distinct allocations, NO hash/serialize of an address, NO RNG seeded from
   an address. Clean negative. The only pointer-value arithmetic found is
   the 0x0040cf00 alignment round-up and its release-side
   `payload - raw - 4 <= 0x1f` validation — a pointer DIFFERENCE within a
   single allocation, the same accepted category as `end == capacity`. */

enum { ISAAC_ALLOC_PURE_HELPERS_ABI_VERSION = 4 };

/* ---------- PE constants (hash-bound) ---------- */

enum {
  /* Root VAs (all address-stable; no exact ZHL match). */
  ISAAC_ALLOC_VA_TRACKED_WRAPPER = 0x00a648b0u,
  ISAAC_ALLOC_VA_THIN_ALLOC_STACK = 0x00a0f4c0u,
  ISAAC_ALLOC_VA_THIN_ALLOC_ECX = 0x00a0f4e0u,
  ISAAC_ALLOC_VA_FREE_WRAPPER = 0x00a0f500u,
  ISAAC_ALLOC_VA_SIZED_DELETE_SHIM = 0x00aef15cu,
  ISAAC_ALLOC_VA_SB_ALLOC = 0x0040cf00u,
  ISAAC_ALLOC_VA_STRING_CTOR = 0x0040cf50u,      /* v3: SSO/len-gated copy ctor */
  ISAAC_ALLOC_VA_UNSCALED_RELEASE = 0x0040d000u, /* unscaled release (AH body) */
  ISAAC_ALLOC_VA_STRING_TIDY = 0x0040d040u,      /* v3: cap-gated clear/reset */
  ISAAC_ALLOC_VA_SB_THROW_HELPER = 0x0040cee0u,
  ISAAC_ALLOC_VA_SB_THROW_CTOR = 0x0040cde0u,
  ISAAC_ALLOC_VA_XLENGTH_THROW = 0x004170d0u,
  ISAAC_ALLOC_VA_OOM_OBSERVER = 0x00a23200u,
  ISAAC_ALLOC_VA_CXX_THROW_THUNK = 0x00af05ebu,

  /* IAT slots (identities from the import directory, this unit). */
  ISAAC_ALLOC_IAT_MALLOC = 0x00b187e0u,        /* crt-heap malloc */
  ISAAC_ALLOC_IAT_FREE = 0x00b187dcu,          /* crt-heap free */
  ISAAC_ALLOC_IAT_INVALID_PARAMETER = 0x00b18894u, /* noreturn */
  ISAAC_ALLOC_IAT_XLENGTH_ERROR = 0x00b184d4u, /* std::_Xlength_error */
  ISAAC_ALLOC_IAT_CXX_THROW = 0x00b18758u,     /* _CxxThrowException */

  /* Data slots. Both BSS (past .data's raw size), zero-filled at load. */
  ISAAC_ALLOC_TRACKED_ROOT_VA = 0x00c7de78u,
  ISAAC_ALLOC_TRACKED_ACCT_OFF_LO = 0x30,
  ISAAC_ALLOC_TRACKED_ACCT_OFF_HI = 0x34,
  ISAAC_ALLOC_FALLBACK_ACCT_LO_VA = 0x00c7f618u,
  ISAAC_ALLOC_FALLBACK_ACCT_HI_VA = 0x00c7f61cu,
  ISAAC_ALLOC_OBSERVER_LIST_VA = 0x00c37974u,

  /* Modes (movzx eax, cl — LOW BYTE of ECX only). */
  ISAAC_ALLOC_MODE_ALLOC = 0,
  ISAAC_ALLOC_MODE_FREE = 1,
  ISAAC_ALLOC_MODE_ACCOUNT = 2,

  /* Wrapper laws. */
  ISAAC_ALLOC_HEADER_SIZE = 4,      /* header dword; payload = block + 4 */
  ISAAC_ALLOC_OOM_OBSERVER_ARG = 0x7fcb9dd6, /* push imm at 0x00a64941 */
  ISAAC_ALLOC_FREE_STACK_ZERO_WORDS = 2, /* 0x00a0f500 pushes two zeros */

  /* 0x0040cf00 aligned string-buffer allocator. */
  ISAAC_ALLOC_SB_BIG_MIN = 0x1000,       /* cmp ecx,0x1000 ; jb — unsigned */
  ISAAC_ALLOC_SB_PAD = 0x23,             /* lea eax,[ecx+0x23] */
  ISAAC_ALLOC_SB_ALIGN_MASK = 0xffffffe0u, /* and eax,0xffffffe0 */
  ISAAC_ALLOC_SB_STASH_BACK_OFF = 4,     /* mov [eax-4], ecx */
  ISAAC_ALLOC_SB_OVERFLOW_MIN = 0xffffffddu, /* (size+0x23) wraps <= size */
  ISAAC_ALLOC_SB_DELTA_MAX = 0x1f,       /* release: cmp delta,0x1f ; ja */

  /* Throw metadata (bodies stay host). */
  ISAAC_ALLOC_XLENGTH_MSG_VA = 0x00b1b160u, /* "map/set too long" */
  ISAAC_ALLOC_XLENGTH_STRING_VA = 0x0040ccc0u,   /* "string too long" */
  ISAAC_ALLOC_XLENGTH_STRING_MSG_VA = 0x00b1a714u,
  ISAAC_ALLOC_XLENGTH_DEQUE_VA = 0x0040cad0u,    /* "deque<T> too long" */
  ISAAC_ALLOC_XLENGTH_DEQUE_MSG_VA = 0x00b1a6c8u,
  ISAAC_ALLOC_SB_THROW_INFO_VA = 0x00bd5bccu,
  ISAAC_ALLOC_SB_THROW_VTABLE_VA = 0x00b1a740u,
  /* v3: the bad_alloc ctor (0x0040cde0) also stores the exception
     SUBOBJECT vtable at [this+4] (mov [ecx+4],0xb1a724) and zeroes
     [this+8] (xorps/movq before the store). Host 12-byte writer; row
     published in the v3 census. */
  ISAAC_ALLOC_BAD_ALLOC_EXCEPTION_VTABLE_VA = 0x00b1a724u,

  /* 0x0040c740 out-of-line u32 deallocate (v2): the size argument is an
     ELEMENT COUNT, scaled lea [eax*4] inside the wrapper; ret 8; first
     stack arg is the payload pointer. Same instruction shape as the inline
     release template + 0x0040d000, with the *4 scaling as the new law.
     Caller contract verified at room B20 0x80687f and the PlayerHUD
     cluster 0x851a07..0x851a75: count = (end - begin) >> 2. */
  ISAAC_ALLOC_SB_RELEASE_X4_VA = 0x0040c740u,
  ISAAC_ALLOC_SB_RELEASE_X4_ELEMENT_BYTES = 4,
  ISAAC_ALLOC_SB_RELEASE_X4_RET_BYTES = 8,
  ISAAC_ALLOC_CALLERS_SB_RELEASE_X4 = 57,
  ISAAC_ALLOC_SB_RELEASE_X4_CALLER_ANM2_HASH = 0x0040c9ceu,
  ISAAC_ALLOC_SB_RELEASE_X4_CALLER_ROOM_B20 = 0x0080687fu,
  ISAAC_ALLOC_CALLERS_XLENGTH_STRING = 82,
  ISAAC_ALLOC_CALLERS_XLENGTH_DEQUE = 12,

  /* v3 AK: 0x0040cf50 string copy ctor — SSO/length gates. */
  ISAAC_ALLOC_STR_SSO_CAP = 0x10,          /* cmp ..,0x10 ; jb — UNSIGNED */
  ISAAC_ALLOC_STR_SSO_CAP_VALUE = 0xf,     /* mov ebx,0xf — inline cap */
  ISAAC_ALLOC_STR_SSO_COPY_LEN = 16,       /* movups xmm — fixed 16 bytes */
  ISAAC_ALLOC_STR_CTOR_SAT = 0x7fffffff,   /* cmova ebx,eax — cap clamp */

  /* v3 AL: 0x0040d040 string tidy — reset state after the release. */
  ISAAC_ALLOC_TIDY_RESET_SIZE = 0,         /* mov [esi+0x10],0 */
  ISAAC_ALLOC_TIDY_RESET_CAP = 0xf,        /* mov [esi+0x14],0xf */
  ISAAC_ALLOC_TIDY_RESET_FIRST_BYTE = 0,   /* mov byte [esi],0 */

  /* v4 AM: 0x0040ccd0 string assign. */
  ISAAC_ALLOC_VA_STRING_ASSIGN = 0x0040ccd0u,
  ISAAC_ALLOC_STR_ASSIGN_MAX_LEN = 0x7fffffff, /* cmp edi,.. ; ja throw */
  ISAAC_ALLOC_STR_ASSIGN_COPY_FAST_THUNK_VA = 0x00af08bdu, /* -> memmove */
  ISAAC_ALLOC_STR_ASSIGN_COPY_GROW_THUNK_VA = 0x00af05dfu, /* -> memcpy */
  ISAAC_ALLOC_IAT_MEMMOVE = 0x00b18748u, /* VCRUNTIME140.dll!memmove */
  ISAAC_ALLOC_IAT_MEMCPY = 0x00b18760u,  /* VCRUNTIME140.dll!memcpy */
  /* The grow-path release-abort site (IAT [0xb18894], noreturn). */
  ISAAC_ALLOC_STR_ASSIGN_ABORT_VA = 0x0040cdafu,
  /* The grow-path length-throw site (-> 0x0040ccc0, noreturn). */
  ISAAC_ALLOC_STR_ASSIGN_THROW_VA = 0x0040cdb5u,

  /* SEH frame metadata of 0x00a0f500 (host mechanism, recorded). */
  ISAAC_ALLOC_A0F500_FUNCINFO_VA = 0x00af1310u,
  ISAAC_ALLOC_SECURITY_COOKIE_VA = 0x00bf93b4u,

  /* Whole-.text censuses (raw rel32 `e8` counts, this unit). */
  ISAAC_ALLOC_CALLERS_A648B0 = 459,
  ISAAC_ALLOC_CALLERS_A0F4C0 = 739,
  ISAAC_ALLOC_CALLERS_A0F4E0 = 214,
  ISAAC_ALLOC_CALLERS_A0F500 = 1,
  ISAAC_ALLOC_CALLERS_SB_ALLOC = 614,
  ISAAC_ALLOC_CALLERS_XLENGTH = 86,
  ISAAC_ALLOC_CALLERS_OOM_OBSERVER = 45,
  ISAAC_ALLOC_CALLERS_SB_THROW = 202,
  ISAAC_ALLOC_SB_RELEASE_TEMPLATE_SITES = 2617,
  /* v3: string-surface censuses (raw rel32 e8, re-verified this unit). */
  ISAAC_ALLOC_CALLERS_STRING_CTOR = 370,
  ISAAC_ALLOC_CALLERS_STRING_TIDY = 1288,
  ISAAC_ALLOC_CALLERS_UNSCALED_RELEASE = 2,
  ISAAC_ALLOC_UNSCALED_RELEASE_CALLER_1 = 0x0041416bu,
  ISAAC_ALLOC_UNSCALED_RELEASE_CALLER_2 = 0x0068753cu,
  /* v4: the string-assign census — LEA-CORRECTED channel (capstone linear
     decode with resync over the whole .text; the raw bytescan reads 1057,
     the 5-site shortfall being e8 bytes the raw scan skips past inside
     other instructions' displacement windows). The lea-corrected channel
     reproduces every pinned family census exactly (0x40ccc0 82, 0x40cf50
     370, 0x40d040 1288, 0x40cf00 614, 0xaef15c 3725), so 1062 is the
     canonical count for this root. */
  ISAAC_ALLOC_CALLERS_STRING_ASSIGN = 1062,

  /* DIDOD carry-reachability facts (caller body owned by process-input;
     recorded here because the wrapper consequence is this family's). */
  ISAAC_ALLOC_DIDOD_CALLSITE_VA = 0x00a6e7b0u,
  ISAAC_ALLOC_DIDOD_STRIDE = 0x14,
  ISAAC_ALLOC_DIDOD_SATURATED_LO = 0xffffffffu,
  ISAAC_ALLOC_DIDOD_MALLOC_ARG = 3 /* 0xffffffff + 4, 32-bit wrap */
};

/* Dispatch result of the movzx-cl mode. Values chosen so the three real
   modes equal their mode numbers. */
enum {
  ISAAC_ALLOC_ACTION_ALLOC = 0,
  ISAAC_ALLOC_ACTION_FREE = 1,
  ISAAC_ALLOC_ACTION_ACCOUNT = 2,
  ISAAC_ALLOC_ACTION_NONE = 3 /* any low byte >= 3: xor eax,eax; ret */
};

/* 0x0040cf00 classification. */
enum {
  ISAAC_ALLOC_SB_KIND_ZERO = 0,  /* small, size == 0: NULL, no alloc call */
  ISAAC_ALLOC_SB_KIND_SMALL = 1, /* size < 0x1000: raw result unchecked */
  ISAAC_ALLOC_SB_KIND_BIG = 2,   /* aligned path */
  ISAAC_ALLOC_SB_KIND_THROW = 3  /* size+0x23 wrapped: 0x0040cee0 noreturn */
};

/* ---------- structs (all fields 4 bytes; layouts pinned in tests) ---------- */

/* One resolved 0x00a648b0 call. Host-supplied inputs: the live ECX register
   (mode in its low byte, caller junk above), the EDX pointer, the two stack
   dwords, the tracked-root word and whether IAT malloc returned NULL. The
   block VALUE malloc returns is a host output; the plan reports laws over
   it (bias, header), never the pointer itself. */
typedef struct IsaacAllocA648b0Plan {
  int32_t mode;                /* movzx eax, cl */
  int32_t action;              /* ISAAC_ALLOC_ACTION_* */
  uint32_t acct_va;            /* esi: tracked ? tracked+0x30 : 0xc7f618 */
  int32_t acct_is_fallback;    /* tracked == 0 */
  int32_t clamp_applied;       /* alloc: size_hi != 0 (lo test is dead) */
  uint32_t malloc_arg;         /* clamped_lo + 4, 32-bit wrap */
  int32_t malloc_called;       /* action == ALLOC */
  uint32_t acct_add_lo;        /* == malloc_arg on success, else 0 */
  uint32_t acct_add_hi;        /* carry(clamped_lo + 4) on success, else 0 */
  uint32_t header_value;       /* stored at block[0] on success */
  int32_t header_store_needed; /* success only (store is after null test) */
  int32_t observer_needed;     /* malloc NULL -> 0x00a23200 broadcast */
  uint32_t observer_arg;       /* 0x7fcb9dd6 when needed, else 0 */
  uint32_t result_bias;        /* +4 on alloc success, else 0 */
  int32_t returns_zero;        /* every path except alloc success */
  int32_t free_called;         /* action FREE and edx != 0 */
  uint32_t free_arg;           /* edx - 4 when free_called, else 0 */
  uint32_t header_va;          /* edx - 4 when free_called, else 0 */
  int32_t mode2_fold_needed;   /* action == ACCOUNT */
  uint32_t mode2_target_va;    /* tracked + 0x30 UNCONDITIONALLY */
  int32_t no_effect;           /* NONE, or FREE with edx == 0 */
} IsaacAllocA648b0Plan;

/* Alloc-then-free of one block, from any starting counter value: what the
   accounting pair nets out to. residue_hi == the alloc carry — the pinned
   D-ALLOC-1 defect. */
typedef struct IsaacAllocRoundTrip {
  uint32_t add_lo;          /* alloc-side lo add == malloc arg */
  uint32_t add_hi;          /* alloc-side hi add == carry(clamped_lo+4) */
  uint32_t header;          /* what the free path reads back */
  uint32_t sub_value;       /* the 32-bit value free subtracts (== header) */
  uint32_t residue_lo;      /* always 0 (borrow cancels the lo-add carry) */
  uint32_t residue_hi;      /* == add_hi; never subtracted back */
  int32_t residue_nonzero;  /* 1 iff the defect leaves residue */
  int32_t clamp_applied;
} IsaacAllocRoundTrip;

/* One resolved 0x0040cf00 call. raw is the host allocator's return value
   (0 = NULL). */
typedef struct IsaacAllocSbPlan {
  int32_t kind;              /* ISAAC_ALLOC_SB_KIND_* */
  int32_t alloc_called;      /* 0x00a0f4c0 reached */
  uint32_t alloc_arg;        /* size (small) / size+0x23 (big) */
  int32_t throw_needed;      /* 0x0040cee0, noreturn */
  int32_t null_aborts;       /* big && raw == 0 -> IAT [0xb18894] noreturn */
  int32_t null_returned;     /* small && raw == 0 -> NULL handed back */
  uint32_t payload;          /* big: (raw+0x23) & ~0x1f; small: raw */
  uint32_t stash_va;         /* payload - 4 (big success only) */
  uint32_t stash_value;      /* raw (big success only) */
  int32_t stash_needed;      /* big success only */
  int32_t returns_null_immediately; /* ZERO kind */
} IsaacAllocSbPlan;

/* One instance of the inline aligned-release template. */
typedef struct IsaacAllocSbReleasePlan {
  int32_t is_big;            /* size >= 0x1000, unsigned */
  uint32_t adjusted_size;    /* big: size+0x23 (wrap); small: size */
  int32_t size_arg_dropped;  /* ALWAYS 1: 0x00aef15c forwards only the ptr */
  uint32_t delta;            /* big: payload - raw - 4 (wrap); small: 0 */
  int32_t valid;             /* big: delta <= 0x1f; small: vacuously 1 */
  int32_t abort_needed;      /* big && !valid */
  uint32_t free_arg;         /* big valid: raw; small: payload; else 0 */
  int32_t header_read_needed;/* big only */
} IsaacAllocSbReleasePlan;

/* One resolution of the 0x0040c740 u32 deallocate wrapper (ret 8, args
   (payload ptr, element count)). raw is the host read of [payload-4] on
   the big path (not supplied for small). delta/valid/abort/free_arg reuse
   the v1 AH laws over byte_size; the *4 scaling is the new law. */
typedef struct IsaacAllocC740Plan {
  uint32_t byte_size;          /* count * 4, 32-bit wrap (lea [eax*4]) */
  int32_t is_big;              /* byte_size >= 0x1000, UNSIGNED */
  uint32_t adjusted_size;      /* big: byte_size + 0x23; small: byte_size */
  uint32_t delta;              /* big: payload - raw - 4 (wrap); small: 0 */
  int32_t valid;               /* big: delta <= 0x1f; small: vacuously 1 */
  int32_t abort_needed;        /* big && !valid -> IAT [0xb18894] noreturn */
  uint32_t free_arg;           /* small: payload; big valid: raw; else 0 */
  int32_t size_arg_dropped;    /* ALWAYS 1: 0x00aef15c sees only the ptr */
  int32_t header_read_needed;  /* big only: mov edx, [eax-4] */
  int32_t ret_bytes;           /* 8: add esp,8 ; ret 8 */
  int32_t arg_order_ptr_first; /* [ebp+8]=payload, [ebp+0xc]=count */
} IsaacAllocC740Plan;

/* One resolution of the 0x0040cf50 string COPY ctor (v3). Inputs are the
   SOURCE string's [0x14] cap and [0x10] size (both game-visible fields);
   the source data lives at [src] iff cap >= 0x10, else at the src object
   itself (SSO buffer). The ctor zeroes this, then on the SSO path copies a
   FIXED 16 bytes (movups) and sets size = src_size, cap = 0xf; on the big
   path it allocates cap' + 1 via 0x0040cf00, memcpys size+1 bytes, and
   sets size = src_size, cap = min(size|0xf, 0x7fffffff). The alloc RESULT
   is a host output (0x0040cf00's own plan covers it); this plan covers
   every decision the game reads back. */
typedef struct IsaacAllocStrCtorPlan {
  int32_t sso;               /* size < 0x10: inline copy, no allocation */
  int32_t src_uses_heap;     /* src cap >= 0x10: source data at [src] */
  int32_t alloc_needed;      /* !sso — 0x0040cf00 called */
  uint32_t alloc_arg;        /* big: cap + 1 (round-up to 16); SSO: 0 */
  uint32_t cap;              /* big: min(size|0xf, 0x7fffffff); SSO: 0xf */
  int32_t cap_saturated;     /* (size|0xf) > 0x7fffffff, i.e. size >=
                                0x80000000 (cmova fires) */
  uint32_t copy_len;         /* big: size + 1; SSO: 16 (fixed movups) */
  uint32_t size_out;         /* src_size, both paths */
  int32_t ret_bytes;         /* 4: ret 4 — one stack arg (the source) */
} IsaacAllocStrCtorPlan;

/* One resolution of the 0x0040d040 string tidy (v3). cap is the string's
   [0x14] field; the release (cap >= 0x10) runs the v1 AH template over
   size = cap + 1, then (on the non-abort paths) resets size = 0,
   cap = 0xf and byte [this] = 0. The abort (delta > 0x1f) is IAT
   [0x00b18894] noreturn — NOTHING is reset on that path. */
typedef struct IsaacAllocStrTidyPlan {
  int32_t release_needed;    /* cap >= 0x10 — UNSIGNED release gate */
  uint32_t size_arg;         /* cap + 1 (inc ecx), passed to 0x00aef15c */
  int32_t is_big;            /* size_arg >= 0x1000 */
  uint32_t adjusted_size;    /* big: size_arg + 0x23; small: size_arg */
  uint32_t delta;            /* big: payload - raw - 4 (wrap); small: 0 */
  int32_t valid;             /* big: delta <= 0x1f; small: vacuously 1 */
  int32_t abort_needed;      /* big && !valid -> IAT [0xb18894] noreturn */
  uint32_t free_arg;         /* small release: payload; big valid: raw;
                                no release / abort: 0 */
  int32_t size_arg_dropped;  /* ALWAYS 1: 0x00aef15c forwards only ptr */
  int32_t header_read_needed;/* big only: mov edx, [eax-4] */
int32_t reset_size;       /* 0 — mov [esi+0x10],0 */
  uint32_t reset_cap;       /* 0xf — mov [esi+0x14],0xf */
  uint32_t reset_first_byte; /* 0 — mov byte [esi],0 */
  int32_t reset_applies;    /* 1 on every path except the noreturn abort */
} IsaacAllocStrTidyPlan;

/* One resolution of the 0x0040ccd0 string ASSIGN (v4 AM). Inputs: n = the
   requested length ([ebp+0xc]), cap = the OLD [this+0x14] capacity,
   payload = the OLD buffer pointer ([this] — only read on the grow-side
   release), raw = the host read of [payload-4] (big release only). The
   copy helpers (memmove fast / memcpy grow), the release drop and the
   noreturn throws stay host; every DECISION the game reads back is
   translated. On the noreturn paths (length throw, release abort) the
   fields still report the writes that DID execute before the noreturn
   (size/cap are stored before the grow copy); buf_out_is_new is 0 on the
   abort because the swap at 0x40cda3 is unreached. */
typedef struct IsaacAllocStrAssignPlan {
  int32_t grow_needed;       /* n > cap — UNSIGNED (ja); grow-side entry */
  int32_t throws;            /* grow && n > 0x7fffffff -> 0x40ccc0 noreturn */
  int32_t alloc_needed;      /* grow && !throws — 0x40cf00 reached */
  uint32_t alloc_arg;        /* grow: new_cap + 1; else 0 */
  uint32_t cap_out;          /* grow: new_cap; fast: cap (game reads [0x14]) */
  int32_t round_saturated;   /* grow && (n|0xf) > 0x7fffffff */
  int32_t grow_saturated;    /* grow && cap > 0x7fffffff - (cap>>1) */
  uint32_t size_out;         /* n — [esi+0x10], both paths */
  int32_t fast_uses_heap;    /* fast && cap >= 0x10: data at [this] */
  uint32_t copy_len;         /* n — memmove/memcpy length, both paths */
  uint32_t fast_helper_va;   /* 0x00af08bd (IAT [0xb18748] memmove) */
  uint32_t grow_helper_va;   /* 0x00af05df (IAT [0xb18760] memcpy) */
  uint32_t nul_offset;       /* n — byte [data+n] = 0, both paths */
  int32_t nul_byte;          /* 0 */
  int32_t release_needed;    /* grow && old cap >= 0x10 (0x40cd74 gate) */
  uint32_t release_size_arg; /* cap + 1 (old cap + the NUL slot) */
  int32_t release_is_big;    /* (cap+1) >= 0x1000 — AH template gate */
  uint32_t release_delta;    /* big release: payload - raw - 4 (wrap) */
  int32_t release_valid;     /* big: delta <= 0x1f; small/vacuous: 1 */
  int32_t release_abort_needed; /* big && !valid -> IAT [0xb18894] noreturn */
  uint32_t release_free_arg; /* !release: 0; small: payload; big: raw */
  int32_t buf_out_is_new;    /* grow && !abort — swap at 0x40cda3 */
  int32_t size_arg_dropped;  /* ALWAYS 1: 0x00aef15c forwards only ptr */
  int32_t ret_bytes;         /* 8 — ret 8, two stack args */
  int32_t returns_this;      /* 1 — eax = esi, both paths */
} IsaacAllocStrAssignPlan;

/* ---------- AA: 0x00a648b0 mode dispatch ---------- */

/* movzx eax, cl — the LOW BYTE of the live ECX. Callers leave `this` or
   other junk in the upper 24 bits, so the parameter is deliberately WIDE
   and narrowed in the body (byte-width class defect guard). */
int32_t isaac_alloc_a648b0_mode(uint32_t ecx_reg);

/* The three-step sub/jcc dispatch over the mode byte. */
int32_t isaac_alloc_a648b0_action(uint32_t ecx_reg);

/* ---------- AB: accounting block select ---------- */

/* Prologue select: tracked ? tracked+0x30 : 0xc7f618 (32-bit wrap). */
uint32_t isaac_alloc_acct_block_va(uint32_t tracked_c7de78);
int32_t isaac_alloc_acct_is_fallback(uint32_t tracked_c7de78);

/* Mode-2 fold target: tracked + 0x30 UNCONDITIONALLY (add [edi+0x30], …)
   — the esi fallback select is ignored by this arm. tracked == 0 makes the
   PE store at VA 0x30/0x34. Pinned asymmetry. */
uint32_t isaac_alloc_mode2_target_va(uint32_t tracked_c7de78);
int32_t isaac_alloc_mode2_selects_fallback(void); /* 0 — PE truth */
int32_t isaac_alloc_mode2_clears_fallback(void);  /* 0 — no store to
                                                     0xc7f618/1c in the arm */

/* Mode-2 64-bit fold arithmetic (add / adc — a TRUE 64-bit add). */
uint32_t isaac_alloc_mode2_fold_lo(uint32_t tracked_lo, uint32_t fb_lo);
uint32_t isaac_alloc_mode2_fold_hi(uint32_t tracked_hi,
                                   uint32_t fb_hi,
                                   uint32_t tracked_lo,
                                   uint32_t fb_lo);

/* ---------- AC: alloc arm ---------- */

/* Only size_hi != 0 clamps. The lo-side `cmp edi,-1 ; jbe` is a DEAD branch
   (no uint32 exceeds 0xffffffff), pinned by tests at lo == 0xffffffff. */
int32_t isaac_alloc_clamp_needed(uint32_t size_lo, uint32_t size_hi);
uint32_t isaac_alloc_clamped_lo(uint32_t size_lo, uint32_t size_hi);
/* Always 0 on every path (hi==0 unclamped, or zeroed by the clamp) — the
   reason acct_add_hi is exactly the +4 carry. */
uint32_t isaac_alloc_clamped_hi(uint32_t size_lo, uint32_t size_hi);

/* The single dword pushed to IAT malloc: clamped_lo + 4, 32-bit wrap.
   DIDOD: (0xffffffff, 0) -> malloc(3). (0xfffffffc, 0) -> malloc(0). */
uint32_t isaac_alloc_malloc_arg(uint32_t size_lo, uint32_t size_hi);

/* ebx after `adc ebx, 0`: the carry of clamped_lo + 4 (ebx is 0 on both
   entry paths). This is the high dword of the 64-bit accounting add — and
   the exact residue D-ALLOC-1 leaks per carried alloc. */
uint32_t isaac_alloc_acct_add_hi(uint32_t size_lo, uint32_t size_hi);

/* Header stored at block[0] on success: the malloc arg itself (the +4 is
   INSIDE the header, so free's [ptr-4] read recovers the malloc size). */
uint32_t isaac_alloc_header_value(uint32_t size_lo, uint32_t size_hi);

/* Payload bias: wrapper returns block + 4 (32-bit wrap). */
uint32_t isaac_alloc_result(uint32_t block);

/* malloc NULL -> push 0x7fcb9dd6; call 0x00a23200; return 0. */
int32_t isaac_alloc_oom_observer_needed(int32_t malloc_null);

/* ---------- AD: free arm ---------- */

/* `test edx, edx ; je` — a null pointer does nothing at all. */
int32_t isaac_alloc_free_needed(uint32_t edx_ptr);

/* Both the header read and the free argument are ptr - 4 (32-bit wrap). */
uint32_t isaac_alloc_free_base(uint32_t edx_ptr);

/* Free-side accounting: acct64 -= zext64(header). `sub [esi], eax` then
   `sbb [esi+4], 0` — borrow propagation ONLY; a high word is never
   subtracted (D-ALLOC-1). */
uint32_t isaac_alloc_acct_sub_lo(uint32_t acct_lo, uint32_t header);
int32_t isaac_alloc_acct_sub_borrow(uint32_t acct_lo, uint32_t header);
uint32_t isaac_alloc_acct_sub_hi(uint32_t acct_hi,
                                 uint32_t acct_lo,
                                 uint32_t header);
int32_t isaac_alloc_free_subtracts_alloc_carry(void); /* 0 — defect pin */

/* Alloc-side accounting: acct64 += (add_hi:add_lo). add / adc chain. */
uint32_t isaac_alloc_acct_alloc_lo(uint32_t acct_lo, uint32_t add_lo);
uint32_t isaac_alloc_acct_alloc_hi(uint32_t acct_hi,
                                   uint32_t acct_lo,
                                   uint32_t add_lo,
                                   uint32_t add_hi);

/* ---------- AE: plans ---------- */

/* Alloc..free round trip of one block. out may be null (no-op). */
void isaac_alloc_roundtrip(uint32_t size_lo,
                           uint32_t size_hi,
                           IsaacAllocRoundTrip* out);

/* Full 0x00a648b0 resolution. out may be null (no-op). */
void isaac_alloc_a648b0_plan(uint32_t ecx_reg,
                             uint32_t edx_ptr,
                             uint32_t size_lo,
                             uint32_t size_hi,
                             uint32_t tracked_c7de78,
                             int32_t malloc_null,
                             IsaacAllocA648b0Plan* out);

/* ---------- AF: thin wrapper call shapes ---------- */

int32_t isaac_alloc_a0f4c0_mode_cl(void); /* xor cl,cl -> 0 */
uint32_t isaac_alloc_a0f4c0_size_hi(void); /* push 0 */
uint32_t isaac_alloc_a0f4c0_edx(void);     /* xor edx,edx */
/* 0x00a0f4e0 pushes the FULL ECX as size_lo BEFORE `xor cl, cl` zeroes the
   mode byte — the pushed size keeps its own low byte (order pin). */
uint32_t isaac_alloc_a0f4e0_pushed_lo(uint32_t ecx_reg);
int32_t isaac_alloc_a0f500_mode_cl(void);  /* mov cl,1 */
int32_t isaac_alloc_a0f500_stack_zero_words(void); /* push 0; push 0 */
/* 0x00aef15c takes (ptr, size) and forwards ONLY ptr to 0x00a0f500. */
int32_t isaac_alloc_aef15c_size_dropped(void); /* 1 — pinned */

/* ---------- AG: 0x0040cf00 aligned string-buffer alloc ---------- */

int32_t isaac_alloc_sb_is_big(uint32_t size);   /* size >= 0x1000, unsigned */
int32_t isaac_alloc_sb_overflow(uint32_t size); /* (size+0x23) wraps <= size */
uint32_t isaac_alloc_sb_raw_request(uint32_t size); /* size + 0x23 (wrap) */
uint32_t isaac_alloc_sb_payload(uint32_t raw); /* (raw+0x23) & 0xffffffe0 */
uint32_t isaac_alloc_sb_stash_va(uint32_t payload); /* payload - 4 */
int32_t isaac_alloc_sb_alloc_called(uint32_t size); /* zero-size and throw
                                                       paths never call */
int32_t isaac_alloc_sb_kind(uint32_t size);
void isaac_alloc_sb_plan(uint32_t size, uint32_t raw, IsaacAllocSbPlan* out);

/* ---------- AH: inline aligned-release template ---------- */

int32_t isaac_alloc_sbr_is_big(uint32_t size); /* same 0x1000 gate; separate
                                                  export so the two sides
                                                  cross-check */
uint32_t isaac_alloc_sbr_adjusted_size(uint32_t size); /* big: size + 0x23 */
uint32_t isaac_alloc_sbr_delta(uint32_t payload, uint32_t raw); /* p-r-4 */
int32_t isaac_alloc_sbr_valid(uint32_t payload, uint32_t raw); /* <= 0x1f */
uint32_t isaac_alloc_sbr_free_arg(uint32_t size,
                                  uint32_t payload,
                                  uint32_t raw);
void isaac_alloc_sbr_plan(uint32_t size,
                          uint32_t payload,
                          uint32_t raw,
                          IsaacAllocSbReleasePlan* out);

/* PE-truth law: for EVERY raw pointer value, the payload 0x0040cf00 builds
   passes the release-side validation — delta = 0x1f - ((raw+3) mod 32) is
   always within [0, 0x1f]. Returns isaac_alloc_sbr_valid(payload(raw), raw). */
int32_t isaac_alloc_sb_roundtrip_valid(uint32_t raw);

/* ---------- AJ: 0x0040c740 out-of-line u32 deallocate (v2) ---------- */

/* lea ecx,[eax*4] — the NEW law: the size argument is an ELEMENT COUNT
   scaled by 4 inside the wrapper (callers push count = (end-begin)>>2). */
uint32_t isaac_alloc_c740_byte_size(uint32_t count);

/* cmp ecx,0x1000 ; jb — UNSIGNED, over byte_size (count >= 0x400). */
int32_t isaac_alloc_c740_is_big(uint32_t count);

/* big: add ecx,0x23 ; small: byte_size passes through untouched. */
uint32_t isaac_alloc_c740_adjusted_size(uint32_t count);

/* Full resolution. out may be null (no-op). */
void isaac_alloc_c740_plan(uint32_t count,
                           uint32_t payload,
                           uint32_t raw,
                           IsaacAllocC740Plan* out);

/* ---------- AK: 0x0040cf50 string copy ctor (v3) ---------- */

/* cmp eax,0x10 ; jae big — UNSIGNED size gate: SSO iff size < 0x10. */
int32_t isaac_alloc_str_ctor_sso(uint32_t src_size);

/* cmp [edi+0x14],0x10 ; jb keep — the source DATA-pointer select:
   [src] (heap buf) iff src cap >= 0x10, else the src object itself. */
int32_t isaac_alloc_str_ctor_src_uses_heap(uint32_t src_cap);

/* Capacity written to [this+0x14]: big: min(size|0xf, 0x7fffffff) (the
   `or ebx,0xf ; cmp ebx,0x7fffffff ; cmova` — UNSIGNED); SSO: 0xf. */
uint32_t isaac_alloc_str_ctor_cap(uint32_t src_size);

/* The single dword handed to 0x0040cf00: big: cap + 1 (round-up of size
   to the next 16 multiple); SSO: no allocation, 0. */
uint32_t isaac_alloc_str_ctor_alloc_arg(uint32_t src_size);

/* Copy length: SSO copies a FIXED 16 bytes (movups xmm0,[edi]); big
   memcpys size + 1 (the NUL too). */
uint32_t isaac_alloc_str_ctor_copy_len(uint32_t src_size);

/* Full resolution (src cap + src size -> decisions). out may be null. */
void isaac_alloc_str_ctor_plan(uint32_t src_cap,
                               uint32_t src_size,
                               IsaacAllocStrCtorPlan* out);

/* ---------- AL: 0x0040d040 string tidy (v3) ---------- */

/* cmp ecx,0x10 ; jb skip — UNSIGNED release gate: cap >= 0x10 frees. */
int32_t isaac_alloc_str_tidy_release_needed(uint32_t cap);

/* inc ecx — the release size is cap + 1 (the terminating NUL slot); the
   value 0x00aef15c receives (and DROPS). */
uint32_t isaac_alloc_str_tidy_size_arg(uint32_t cap);

/* Full resolution. out may be null (no-op). */
void isaac_alloc_str_tidy_plan(uint32_t cap,
                               uint32_t payload,
                               uint32_t raw,
                               IsaacAllocStrTidyPlan* out);

/* ---------- AM: 0x0040ccd0 string assign (v4) ---------- */

/* cmp edi,ecx ; ja grow — UNSIGNED: the only entry to the grow side. */
int32_t isaac_alloc_str_assign_grow_needed(uint32_t n, uint32_t cap);

/* cmp edi,0x7fffffff ; ja 0x40cdb5 — the length gate is IN this wrapper
   (-> 0x40ccc0 "string too long", noreturn; unlike 0x40cee0, whose body
   reads no argument). Counted inside the pinned 82 xlength-string sites. */
int32_t isaac_alloc_str_assign_throws(uint32_t n);

/* The two capacity clamps of the grow path — (n|0xf) > 0x7fffffff and
   cap > 0x7fffffff - (cap>>1) (UNSIGNED shr half). Either fires at
   exactly the values the cmova/cmovb would otherwise exceed. */
int32_t isaac_alloc_str_assign_round_saturated(uint32_t n);
int32_t isaac_alloc_str_assign_grow_saturated(uint32_t cap);

/* The capacity the game reads back at [this+0x14] after a grow: on either
   saturation exactly 0x7fffffff (the raw sums are never formed on the
   saturating paths), else max(n|0xf, cap + (cap>>1)) — the cmovb. */
uint32_t isaac_alloc_str_assign_new_cap(uint32_t n, uint32_t cap);

/* lea ecx,[ebx+1] ; call 0x40cf00 — the single dword handed to the SB
   allocator; only the growing (non-throwing) path allocates. 0x40cf00's
   own plan covers the SB arithmetic. */
uint32_t isaac_alloc_str_assign_alloc_arg(uint32_t n, uint32_t cap);

/* Fast-path data select (mov ebx,esi ; cmp ecx,0x10 ; jb ; mov ebx,[esi]):
   data at [this] iff old cap >= 0x10 — the v3 AK src_uses_heap law
   shape, evaluated on the fit path only. */
int32_t isaac_alloc_str_assign_fast_uses_heap(uint32_t cap);

/* The copy length: n on BOTH paths (memmove fast, memcpy grow; the NUL
   is a separate byte write at data[n]). */
uint32_t isaac_alloc_str_assign_copy_len(uint32_t n);

/* Copy-helper identity pins (thunk VAs; IAT identities in the enum):
   fast = 0x00af08bd -> VCRUNTIME140!memmove (overlap-safe); grow =
   0x00af05df -> VCRUNTIME140!memcpy (fresh buffer is disjoint). */
uint32_t isaac_alloc_str_assign_fast_helper_va(void);
uint32_t isaac_alloc_str_assign_grow_helper_va(void);

/* cmp eax,0x10 ; jb skip — the grow-side release gate: the OLD buffer is
   freed iff old cap >= 0x10 (the AL gate), reached only when growing. */
int32_t isaac_alloc_str_assign_release_needed(uint32_t n, uint32_t cap);

/* lea ecx,[eax+1] — the release size dword is old cap + 1 (the NUL slot),
   AL-shape; 0x00aef15c DROPS it (pinned law). */
uint32_t isaac_alloc_str_assign_release_size_arg(uint32_t cap);

/* Full resolution (n, old cap, old buffer pointer, host-read raw -> the
   decision surface + post-state the game reads back). out may be null. */
void isaac_alloc_str_assign_plan(uint32_t n,
                                 uint32_t cap,
                                 uint32_t payload,
                                 uint32_t raw,
                                 IsaacAllocStrAssignPlan* out);

/* ---------- AI: throw metadata ---------- */

uint32_t isaac_alloc_xlength_msg_va(void); /* 0x00b1b160 "map/set too long" */

/* v2: the sibling xlength-class throws, same body shape (push msg; call
   IAT [0x00b184d4]; int3) — noreturn host, msg VAs pinned. */
uint32_t isaac_alloc_xlength_string_msg_va(void); /* 0x00b1a714 */
uint32_t isaac_alloc_xlength_deque_msg_va(void);  /* 0x00b1a6c8 */

uint32_t isaac_alloc_pure_helpers_abi_version(void);

#ifdef __cplusplus
}
#endif
