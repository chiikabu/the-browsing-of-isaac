/** Independent JS oracle for the guest allocator WRAPPER pure helpers.
 *  Reasoned branch-by-branch from the instruction stream
 *  (output/decomp/5129df723e64/section-notes/alloc-v1/disasm-roots.txt and
 *  disasm-release.txt), NOT transliterated from
 *  native/decomp/alloc_pure_helpers.cpp — the two sides are written from the
 *  same PE evidence but in different shapes, so a mis-transcription on
 *  either side shows up as a differential failure.
 *
 *  Binary SHA-256 5129DF723E645DAAEA59514394195F3EA1DCE1671BB0433D724648A845017200
 *
 *  Helpers ABI v1:
 *    AA  0x00a648b0 mode dispatch (movzx eax, cl — LOW BYTE only)
 *    AB  accounting block select (esi = tracked ? tracked+0x30 : 0xc7f618)
 *    AC  alloc arm (clamp, malloc arg, +4 wrap, 64-bit accounting add)
 *    AD  free arm (null gate, header read at ptr-4, sub/sbb)
 *    AE  plans (a648b0 plan, alloc..free round trip)
 *    AF  thin wrapper call shapes (a0f4c0 / a0f4e0 / a0f500 / aef15c)
 *    AG  0x0040cf00 aligned string-buffer alloc
 *    AH  inline aligned-release template (2617 sites)
 *    AI  throw metadata (bodies stay host)
 *    AJ  0x0040c740 u32 deallocate (count*4 scaled release)
 *    AK  0x0040cf50 string copy ctor (SSO/len gates, capacity rounding)
 *    AL  0x0040d040 string tidy (cap release gate + reset state)
 *
 *  Raw malloc/free, the OOM observer broadcast, the SEH frames and the three
 *  noreturn throw bodies stay address-stable HOST actions; everything the
 *  game reads back is modelled here.
 *
 *  D-ALLOC-1 is REPRODUCED, never corrected: alloc accounts (lo+4) as a
 *  64-bit add, free subtracts the 32-bit header with borrow propagation
 *  only (`sbb [esi+4], 0`), so a carried alloc leaves a permanent
 *  +0x1'00000000 residue. allocFreeSubtractsAllocCarry() is 0 and the
 *  round-trip exposes residue_hi == add_hi.
 */

export const ALLOC_PURE_ABI_VERSION = 4;

/* ---------- roots / IAT / data slots (hash-bound) ---------- */

export const ALLOC_VA_TRACKED_WRAPPER = 0x00a648b0;
export const ALLOC_VA_THIN_ALLOC_STACK = 0x00a0f4c0;
export const ALLOC_VA_THIN_ALLOC_ECX = 0x00a0f4e0;
export const ALLOC_VA_FREE_WRAPPER = 0x00a0f500;
export const ALLOC_VA_SIZED_DELETE_SHIM = 0x00aef15c;
export const ALLOC_VA_SB_ALLOC = 0x0040cf00;
export const ALLOC_VA_STRING_CTOR = 0x0040cf50; /* v3 AK */
export const ALLOC_VA_UNSCALED_RELEASE = 0x0040d000; /* census row */
export const ALLOC_VA_STRING_TIDY = 0x0040d040; /* v3 AL */
export const ALLOC_VA_SB_THROW_HELPER = 0x0040cee0;
export const ALLOC_VA_SB_THROW_CTOR = 0x0040cde0; /* 12-byte writer, host */
export const ALLOC_VA_XLENGTH_THROW = 0x004170d0;
export const ALLOC_VA_OOM_OBSERVER = 0x00a23200;
export const ALLOC_IAT_MALLOC = 0x00b187e0;
export const ALLOC_IAT_FREE = 0x00b187dc;
export const ALLOC_IAT_INVALID_PARAMETER = 0x00b18894;
export const ALLOC_IAT_XLENGTH_ERROR = 0x00b184d4;
export const ALLOC_TRACKED_ROOT_VA = 0x00c7de78;
export const ALLOC_TRACKED_ACCT_OFF_LO = 0x30;
export const ALLOC_TRACKED_ACCT_OFF_HI = 0x34;
export const ALLOC_FALLBACK_ACCT_LO_VA = 0x00c7f618;
export const ALLOC_FALLBACK_ACCT_HI_VA = 0x00c7f61c;
export const ALLOC_OBSERVER_LIST_VA = 0x00c37974;
export const ALLOC_OOM_OBSERVER_ARG = 0x7fcb9dd6;
export const ALLOC_FREE_STACK_ZERO_WORDS = 2;
export const ALLOC_HEADER_SIZE = 4;
export const ALLOC_SB_BIG_MIN = 0x1000;
export const ALLOC_SB_PAD = 0x23;
export const ALLOC_SB_ALIGN_MASK = 0xffffffe0;
export const ALLOC_SB_STASH_BACK_OFF = 4;
export const ALLOC_SB_OVERFLOW_MIN = 0xffffffdd;
export const ALLOC_SB_DELTA_MAX = 0x1f;
export const ALLOC_XLENGTH_MSG_VA = 0x00b1b160;
export const ALLOC_XLENGTH_STRING_VA = 0x0040ccc0;
export const ALLOC_XLENGTH_STRING_MSG_VA = 0x00b1a714;
export const ALLOC_XLENGTH_DEQUE_VA = 0x0040cad0;
export const ALLOC_XLENGTH_DEQUE_MSG_VA = 0x00b1a6c8;
export const ALLOC_SB_RELEASE_X4_VA = 0x0040c740;
export const ALLOC_SB_RELEASE_X4_ELEMENT_BYTES = 4;
export const ALLOC_SB_RELEASE_X4_RET_BYTES = 8;
export const ALLOC_CALLERS_SB_RELEASE_X4 = 57;
export const ALLOC_CALLERS_XLENGTH_STRING = 82;
export const ALLOC_CALLERS_XLENGTH_DEQUE = 12;
export const ALLOC_CALLERS_A648B0 = 459;
export const ALLOC_CALLERS_A0F4C0 = 739;
export const ALLOC_CALLERS_A0F4E0 = 214;
export const ALLOC_CALLERS_A0F500 = 1;
export const ALLOC_CALLERS_SB_ALLOC = 614;
export const ALLOC_CALLERS_XLENGTH = 86;
export const ALLOC_CALLERS_OOM_OBSERVER = 45;
export const ALLOC_CALLERS_SB_THROW = 202;
export const ALLOC_SB_RELEASE_TEMPLATE_SITES = 2617;
export const ALLOC_DIDOD_CALLSITE_VA = 0x00a6e7b0;
export const ALLOC_DIDOD_STRIDE = 0x14;
export const ALLOC_DIDOD_SATURATED_LO = 0xffffffff;
export const ALLOC_DIDOD_MALLOC_ARG = 3;

/* v3: string-surface identities + census (re-verified this unit). */
export const ALLOC_CALLERS_STRING_CTOR = 370;
export const ALLOC_CALLERS_STRING_TIDY = 1288;
export const ALLOC_CALLERS_UNSCALED_RELEASE = 2;
export const ALLOC_UNSCALED_RELEASE_CALLER_1 = 0x0041416b;
export const ALLOC_UNSCALED_RELEASE_CALLER_2 = 0x0068753c;
/* 0x0040cde0 bad_alloc ctor: [0]=0xb1a740, [4]=0xb1a724 (exception
   subobject vtable), [8]=0 (xorps/movq then the [4] store). Host. */
export const ALLOC_SB_THROW_VTABLE_VA = 0x00b1a740;
export const ALLOC_BAD_ALLOC_EXCEPTION_VTABLE_VA = 0x00b1a724;

/* v3 AK: 0x0040cf50 string copy ctor. */
export const ALLOC_STR_SSO_CAP = 0x10; /* cmp ..,0x10 ; jb — UNSIGNED */
export const ALLOC_STR_SSO_CAP_VALUE = 0xf; /* mov ebx,0xf */
export const ALLOC_STR_SSO_COPY_LEN = 16; /* movups — fixed 16 bytes */
export const ALLOC_STR_CTOR_SAT = 0x7fffffff; /* cmova clamp */

/* v3 AL: 0x0040d040 string tidy reset state. */
export const ALLOC_TIDY_RESET_SIZE = 0;
export const ALLOC_TIDY_RESET_CAP = 0xf;
export const ALLOC_TIDY_RESET_FIRST_BYTE = 0;

/* v4 AM: 0x0040ccd0 string assign (the biggest remaining alloc wrapper,
   1062 lea-corrected callsites — census reproduced this unit). */
export const ALLOC_VA_STRING_ASSIGN = 0x0040ccd0;
export const ALLOC_CALLERS_STRING_ASSIGN = 1062;
export const ALLOC_STR_ASSIGN_MAX_LEN = 0x7fffffff; /* cmp edi,.. ; ja throw */
/* Copy-helper identity pins: the fast path (n <= cap) calls 0x00af08bd,
   a thunk to IAT [0x00b18748] = VCRUNTIME140!memmove (overlap-safe — the
   src may be this string's own buffer); the grow path calls 0x00af05df,
   a thunk to IAT [0x00b18760] = VCRUNTIME140!memcpy (the fresh buffer is
   disjoint). Both resolved from the import directory this unit. */
export const ALLOC_STR_ASSIGN_COPY_FAST_THUNK_VA = 0x00af08bd;
export const ALLOC_STR_ASSIGN_COPY_GROW_THUNK_VA = 0x00af05df;
export const ALLOC_IAT_MEMMOVE = 0x00b18748;
export const ALLOC_IAT_MEMCPY = 0x00b18760;
/* The grow-path release-abort site (IAT [0xb18894], noreturn — the buf
   swap at 0x40cda3 is unreached from it) and the length-throw site
   (-> 0x0040ccc0, noreturn; one of the pinned 82 xlength-string callers). */
export const ALLOC_STR_ASSIGN_ABORT_VA = 0x0040cdaf;
export const ALLOC_STR_ASSIGN_THROW_VA = 0x0040cdb5;

export const ALLOC_MODE_ALLOC = 0;
export const ALLOC_MODE_FREE = 1;
export const ALLOC_MODE_ACCOUNT = 2;
export const ALLOC_ACTION_ALLOC = 0;
export const ALLOC_ACTION_FREE = 1;
export const ALLOC_ACTION_ACCOUNT = 2;
export const ALLOC_ACTION_NONE = 3;

export const ALLOC_SB_KIND_ZERO = 0;
export const ALLOC_SB_KIND_SMALL = 1;
export const ALLOC_SB_KIND_BIG = 2;
export const ALLOC_SB_KIND_THROW = 3;

function asU32(v) {
  return v >>> 0;
}

function asI32(v) {
  return v | 0;
}

/** x86 carry of a 32-bit add (`adc` input). */
function carry(a, b) {
  const s = asU32(a) + asU32(b) >>> 0;
  return s < asU32(a) ? 1 : 0;
}

/** x86 borrow of a 32-bit sub (`sbb` input). */
function borrow(a, b) {
  return asU32(a) < asU32(b) ? 1 : 0;
}

/* ======================= AA: mode dispatch ======================= */

/** movzx eax, cl — only the LOW BYTE of the live ECX register. Callers
 *  leave `this` or other junk in the upper 24 bits, so a full-word reading
 *  of the register is wrong for any caller with junk above bit 7. */
export function allocA648b0Mode(ecxReg) {
  return asU32(ecxReg) & 0xff;
}

/** The three-step sub/jcc dispatch:
 *    sub eax,0 ; je alloc ; sub eax,1 ; je free ; sub eax,1 ; jne none
 *  so byte 0 -> ALLOC, 1 -> FREE, 2 -> ACCOUNT, anything >= 3 -> NONE. */
export function allocA648b0Action(ecxReg) {
  const mode = allocA648b0Mode(ecxReg);
  if (mode === ALLOC_MODE_ALLOC) return ALLOC_ACTION_ALLOC;
  if (mode === ALLOC_MODE_FREE) return ALLOC_ACTION_FREE;
  if (mode === ALLOC_MODE_ACCOUNT) return ALLOC_ACTION_ACCOUNT;
  return ALLOC_ACTION_NONE;
}

/* ======================= AB: accounting block select ======================= */

/** Prologue: lea esi,[edi+0x30] ; test edi,edi ; jne ; mov esi,0xc7f618. */
export function allocAcctBlockVa(tracked) {
  return asU32(tracked) !== 0 ? asU32(asU32(tracked) + 0x30) : ALLOC_FALLBACK_ACCT_LO_VA;
}

export function allocAcctIsFallback(tracked) {
  return asU32(tracked) === 0 ? 1 : 0;
}

/** Mode-2 fold target: add [edi+0x30], eax — the arm folds into tracked+0x30
 *  UNCONDITIONALLY, ignoring the esi fallback select. tracked == 0 makes the
 *  PE store at VA 0x30/0x34. Pinned asymmetry. */
export function allocMode2TargetVa(tracked) {
  return asU32(asU32(tracked) + 0x30);
}

export function allocMode2SelectsFallback() {
  return 0; /* the arm never uses esi */
}

export function allocMode2ClearsFallback() {
  return 0; /* 0xc7f618/1c are never cleared by the arm */
}

/** add [edi+0x30], eax — 32-bit wrap. */
export function allocMode2FoldLo(trackedLo, fbLo) {
  return asU32(asU32(trackedLo) + asU32(fbLo));
}

/** adc [edi+0x34], eax — TRUE 64-bit fold with the lo-side carry. */
export function allocMode2FoldHi(trackedHi, fbHi, trackedLo, fbLo) {
  return asU32(asU32(asU32(trackedHi) + asU32(fbHi)) + carry(trackedLo, fbLo));
}

/* ======================= AC: alloc arm ======================= */

/** test ebx,ebx ; jne clamp — only a non-zero HIGH dword clamps. The lo-side
 *  `cmp edi,-1 ; jbe` is a DEAD branch: no uint32 exceeds 0xffffffff, so at
 *  lo == 0xffffffff the fall-through is still taken. */
export function allocClampNeeded(sizeLo, sizeHi) {
  void asU32(sizeLo);
  return asU32(sizeHi) !== 0 ? 1 : 0;
}

/** Clamped size_lo: on the clamp path both stack dwords are zeroed by
 *  movlpd, so the clamped lo is 0. */
export function allocClampedLo(sizeLo, sizeHi) {
  return asU32(sizeHi) !== 0 ? 0 : asU32(sizeLo);
}

/** Clamped size_hi: 0 on every path (size_hi == 0 fall-through, or the
 *  clamp zeroes it). */
export function allocClampedHi(sizeLo, sizeHi) {
  void sizeLo;
  void sizeHi;
  return 0;
}

/** The single dword pushed to IAT malloc: add edi,4 — 32-bit WRAP.
 *  DIDOD: (0xffffffff, 0) -> malloc(3); (0xfffffffc, 0) -> malloc(0). */
export function allocMallocArg(sizeLo, sizeHi) {
  return asU32(allocClampedLo(sizeLo, sizeHi) + 4);
}

/** ebx after `adc ebx, 0`: the carry of clamped_lo + 4 (ebx is 0 on both
 *  entry paths). This is the high dword of the 64-bit accounting add — and
 *  the exact residue D-ALLOC-1 leaks per carried alloc. */
export function allocAcctAddHi(sizeLo, sizeHi) {
  return carry(allocClampedLo(sizeLo, sizeHi), 4);
}

/** mov [eax], edi — the header stores the malloc arg itself, so free's
 *  [ptr-4] read recovers the full malloc size (the +4 is inside the
 *  header). */
export function allocHeaderValue(sizeLo, sizeHi) {
  return allocMallocArg(sizeLo, sizeHi);
}

/** add eax,4 — payload bias, 32-bit wrap. */
export function allocResult(block) {
  return asU32(asU32(block) + 4);
}

/** test eax,eax ; jne success — only the NULL path broadcasts. */
export function allocOomObserverNeeded(mallocNull) {
  return asI32(mallocNull) !== 0 ? 1 : 0;
}

/* ======================= AD: free arm ======================= */

/** test edx,edx ; je return — a null pointer does nothing at all. */
export function allocFreeNeeded(edxPtr) {
  return asU32(edxPtr) !== 0 ? 1 : 0;
}

/** lea ecx,[edx-4] — both the header read and the free argument. */
export function allocFreeBase(edxPtr) {
  return asU32(asU32(edxPtr) - 4);
}

/** sub [esi], eax — 32-bit wrap. */
export function allocAcctSubLo(acctLo, header) {
  return asU32(asU32(acctLo) - asU32(header));
}

/** The borrow the `sbb [esi+4], 0` consumes: unsigned below. */
export function allocAcctSubBorrow(acctLo, header) {
  return borrow(acctLo, header);
}

/** sbb [esi+4], 0 — borrow propagation ONLY. A high word is never
 *  subtracted (D-ALLOC-1). */
export function allocAcctSubHi(acctHi, acctLo, header) {
  return asU32(asU32(acctHi) - borrow(acctLo, header));
}

/** D-ALLOC-1 pin: free never subtracts the alloc carry. */
export function allocFreeSubtractsAllocCarry() {
  return 0;
}

/** add [esi], edi — 32-bit wrap. */
export function allocAcctAllocLo(acctLo, addLo) {
  return asU32(asU32(acctLo) + asU32(addLo));
}

/** add [esi], edi ; adc [esi+4], ebx — TRUE 64-bit add. */
export function allocAcctAllocHi(acctHi, acctLo, addLo, addHi) {
  return asU32(asU32(asU32(acctHi) + asU32(addHi)) + carry(acctLo, addLo));
}

/* ======================= AE: plans ======================= */

/** Alloc-then-free of one block from any starting counter pair.
 *
 *  Alloc side: acct64 += (carry : lo+4). Free side: acct64 -= zext32(header)
 *  with borrow propagation. The free-side borrow equals the alloc-side carry
 *  exactly (both are "did lo+4 wrap"), so the lo word always nets to zero
 *  and the hi word keeps add_hi forever — the pinned D-ALLOC-1 residue. */
export function allocRoundtrip(sizeLo, sizeHi) {
  const arg = allocMallocArg(sizeLo, sizeHi);
  const hi = allocAcctAddHi(sizeLo, sizeHi);
  return {
    addLo: arg,
    addHi: hi,
    header: arg,
    subValue: arg,
    residueLo: 0,
    residueHi: hi,
    residueNonzero: hi,
    clampApplied: allocClampNeeded(sizeLo, sizeHi),
  };
}

/** Full resolution of 0x00a648b0.
 *  @param {object} i {ecx, edx, sizeLo, sizeHi, tracked, mallocNull} */
export function allocA648b0Plan(i) {
  const ecx = asU32(i.ecx);
  const edx = asU32(i.edx);
  const sizeLo = asU32(i.sizeLo);
  const sizeHi = asU32(i.sizeHi);
  const tracked = asU32(i.tracked);
  const mallocNull = asI32(i.mallocNull) !== 0;
  const action = allocA648b0Action(ecx);
  const p = {
    mode: allocA648b0Mode(ecx),
    action,
    acctVa: allocAcctBlockVa(tracked),
    acctIsFallback: allocAcctIsFallback(tracked),
    clampApplied: 0,
    mallocArg: 0,
    mallocCalled: 0,
    acctAddLo: 0,
    acctAddHi: 0,
    headerValue: 0,
    headerStoreNeeded: 0,
    observerNeeded: 0,
    observerArg: 0,
    resultBias: 0,
    returnsZero: 1,
    freeCalled: 0,
    freeArg: 0,
    headerVa: 0,
    mode2FoldNeeded: 0,
    mode2TargetVa: 0,
    noEffect: 0,
  };
  if (action === ALLOC_ACTION_ALLOC) {
    p.clampApplied = allocClampNeeded(sizeLo, sizeHi);
    p.mallocArg = allocMallocArg(sizeLo, sizeHi);
    p.mallocCalled = 1;
    if (!mallocNull) {
      p.acctAddLo = p.mallocArg;
      p.acctAddHi = allocAcctAddHi(sizeLo, sizeHi);
      p.headerValue = p.mallocArg;
      /* The header store is AFTER `test eax,eax ; jne success`. */
      p.headerStoreNeeded = 1;
      p.resultBias = 4;
      p.returnsZero = 0;
    } else {
      /* push 0x7fcb9dd6 ; call 0x00a23200 ; xor eax,eax ; ret */
      p.observerNeeded = 1;
      p.observerArg = ALLOC_OOM_OBSERVER_ARG;
    }
    return p;
  }
  if (action === ALLOC_ACTION_FREE) {
    p.freeCalled = allocFreeNeeded(edx);
    if (p.freeCalled) {
      p.freeArg = allocFreeBase(edx);
      p.headerVa = p.freeArg;
    } else {
      p.noEffect = 1;
    }
    return p;
  }
  if (action === ALLOC_ACTION_ACCOUNT) {
    p.mode2FoldNeeded = 1;
    p.mode2TargetVa = allocMode2TargetVa(tracked);
    return p;
  }
  p.noEffect = 1;
  return p;
}

/* ======================= AF: thin wrapper call shapes ======================= */

export function allocA0f4c0ModeCl() {
  return 0; /* xor cl,cl */
}
export function allocA0f4c0SizeHi() {
  return 0; /* push 0 */
}
export function allocA0f4c0Edx() {
  return 0; /* xor edx,edx */
}
/** 0x00a0f4e0 pushes the FULL ECX as size_lo (push ecx at 0x00a0f4e8) and
 *  only afterwards `xor cl, cl` (0x00a0f4eb) zeroes the mode byte of the
 *  REGISTER — the pushed size keeps its own low byte. Order pin. */
export function allocA0f4e0PushedLo(ecxReg) {
  return asU32(ecxReg);
}
export function allocA0f500ModeCl() {
  return 1; /* mov cl,1 */
}
export function allocA0f500StackZeroWords() {
  return ALLOC_FREE_STACK_ZERO_WORDS;
}
/** 0x00aef15c takes (ptr, size) and forwards ONLY the pointer: the body is
 *  push [ebp+8] ; call 0xa0f500 — [ebp+0xc] (the size) is never touched. */
export function allocAef15cSizeDropped() {
  return 1;
}

/* ======================= AG: 0x0040cf00 aligned alloc ======================= */

/** cmp ecx,0x1000 ; jb small — UNSIGNED. */
export function allocSbIsBig(size) {
  return asU32(size) >= ALLOC_SB_BIG_MIN ? 1 : 0;
}

/** lea eax,[ecx+0x23] ; cmp eax,ecx ; jbe throw — (size+0x23) wraps to
 *  <= size. First fires at size 0xffffffdd. */
export function allocSbOverflow(size) {
  const x = asU32(asU32(size) + ALLOC_SB_PAD);
  return x <= asU32(size) ? 1 : 0;
}

/** lea eax,[ecx+0x23] — 32-bit wrap. */
export function allocSbRawRequest(size) {
  return asU32(asU32(size) + ALLOC_SB_PAD);
}

/** lea eax,[ecx+0x23] ; and eax,0xffffffe0 — the alignment round-up. */
export function allocSbPayload(raw) {
  /* `&` in JS produces a SIGNED int32; the PE mask is a u32 op. */
  return (asU32(asU32(raw) + ALLOC_SB_PAD) & ALLOC_SB_ALIGN_MASK) >>> 0;
}

/** mov [eax-4], ecx — raw sits 4 bytes below the payload. */
export function allocSbStashVa(payload) {
  return asU32(asU32(payload) - ALLOC_SB_STASH_BACK_OFF);
}

/** The ZERO path (test ecx,ecx ; je NULL) and the THROW path (noreturn
 *  0x0040cee0) never reach 0x00a0f4c0. */
export function allocSbAllocCalled(size) {
  const s = asU32(size);
  if (s === 0) return 0;
  if (allocSbIsBig(s) && allocSbOverflow(s)) return 0;
  return 1;
}

/** 0 zero / 1 small / 2 big / 3 throw. */
export function allocSbKind(size) {
  const s = asU32(size);
  if (allocSbIsBig(s)) return allocSbOverflow(s) ? ALLOC_SB_KIND_THROW : ALLOC_SB_KIND_BIG;
  return s === 0 ? ALLOC_SB_KIND_ZERO : ALLOC_SB_KIND_SMALL;
}

/** Full 0x0040cf00 resolution. @param {object} i {size, raw} */
export function allocSbPlan(i) {
  const size = asU32(i.size);
  const raw = asU32(i.raw);
  const kind = allocSbKind(size);
  const p = {
    kind,
    allocCalled: allocSbAllocCalled(size),
    allocArg: 0,
    throwNeeded: kind === ALLOC_SB_KIND_THROW ? 1 : 0,
    nullAborts: 0,
    nullReturned: 0,
    payload: 0,
    stashVa: 0,
    stashValue: 0,
    stashNeeded: 0,
    returnsNullImmediately: 0,
  };
  if (kind === ALLOC_SB_KIND_ZERO) {
    /* xor eax,eax ; ret — no allocator call. */
    p.returnsNullImmediately = 1;
    return p;
  }
  if (kind === ALLOC_SB_KIND_THROW) {
    return p; /* noreturn; nothing after is reachable */
  }
  if (kind === ALLOC_SB_KIND_BIG) {
    p.allocArg = allocSbRawRequest(size);
    if (raw === 0) {
      /* IAT [0x00b18894] _invalid_parameter_noinfo_noreturn — noreturn. */
      p.nullAborts = 1;
      return p;
    }
    p.payload = allocSbPayload(raw);
    p.stashVa = allocSbStashVa(p.payload);
    p.stashValue = raw;
    p.stashNeeded = 1;
    return p;
  }
  /* SMALL: the NULL result is returned UNCHECKED. */
  p.allocArg = size;
  if (raw === 0) p.nullReturned = 1;
  p.payload = raw;
  return p;
}

/* ======================= AH: inline aligned-release template ======================= */

export function allocSbrIsBig(size) {
  return allocSbIsBig(size);
}

/** big: add ecx,0x23 ; small: the size passes through untouched. */
export function allocSbrAdjustedSize(size) {
  return allocSbIsBig(size) ? asU32(asU32(size) + ALLOC_SB_PAD) : asU32(size);
}

/** sub eax,edx ; add eax,-4 — (payload - raw) - 4, 32-bit wrap. */
export function allocSbrDelta(payload, raw) {
  return asU32(asU32(payload) - asU32(raw) - 4);
}

/** cmp eax,0x1f ; ja abort — UNSIGNED ABOVE, so delta == 0x1f is VALID. */
export function allocSbrValid(payload, raw) {
  return allocSbrDelta(payload, raw) <= ALLOC_SB_DELTA_MAX ? 1 : 0;
}

/** big: mov eax,edx (raw) after the validation; small: the payload itself is
 *  freed directly; on the abort path nothing is freed. */
export function allocSbrFreeArg(size, payload, raw) {
  if (!allocSbIsBig(size)) return asU32(payload);
  return allocSbrValid(payload, raw) ? asU32(raw) : 0;
}

/** Full release-template resolution. @param {object} i {size, payload, raw} */
export function allocSbrPlan(i) {
  const size = asU32(i.size);
  const payload = asU32(i.payload);
  const raw = asU32(i.raw);
  const big = allocSbrIsBig(size);
  const valid = big ? allocSbrValid(payload, raw) : 1;
  return {
    isBig: big,
    adjustedSize: allocSbrAdjustedSize(size),
    sizeArgDropped: 1, /* 0x00aef15c forwards only the ptr */
    delta: big ? allocSbrDelta(payload, raw) : 0,
    valid,
    abortNeeded: big && !valid ? 1 : 0,
    freeArg: allocSbrFreeArg(size, payload, raw),
    headerReadNeeded: big ? 1 : 0,
  };
}

/** PE-truth law: for EVERY raw pointer value the payload 0x0040cf00 builds
 *  passes the release-side validation. delta = 0x1f - ((raw + 3) mod 32) is
 *  always within [0, 0x1f]. */
export function allocSbRoundtripValid(raw) {
  return allocSbrValid(allocSbPayload(raw), raw);
}

/* ======================= AI: throw metadata ======================= */

export function allocXlengthMsgVa() {
  return ALLOC_XLENGTH_MSG_VA;
}

/* v2: sibling xlength-class throws, same body shape (push msg; call IAT
 *  [0x00b184d4]; int3) — noreturn host; msg VAs pinned. */
export function allocXlengthStringMsgVa() {
  return ALLOC_XLENGTH_STRING_MSG_VA;
}

export function allocXlengthDequeMsgVa() {
  return ALLOC_XLENGTH_DEQUE_MSG_VA;
}

/* ======================= AJ: 0x0040c740 u32 deallocate ======================= */

/** lea ecx,[eax*4] — the size argument is an ELEMENT COUNT scaled by 4
 *  inside the wrapper (32-bit wrap). The NEW law vs the v1 template
 *  bodies (0x0040d000 and the 2617 inline sites are unscaled). */
export function allocC740ByteSize(count) {
  return asU32(asU32(count) * 4);
}

/** cmp ecx,0x1000 ; jb — UNSIGNED over byte_size; big iff count >= 0x400
 *  exactly. count 0x40000000: byte_size wraps to 0 (small). */
export function allocC740IsBig(count) {
  return allocC740ByteSize(count) >= ALLOC_SB_BIG_MIN ? 1 : 0;
}

/** big: add ecx,0x23 ; small: byte_size passes through untouched. */
export function allocC740AdjustedSize(count) {
  const byteSize = allocC740ByteSize(count);
  return allocC740IsBig(count) ? asU32(byteSize + ALLOC_SB_PAD) : byteSize;
}

/** Full 0x0040c740 resolution.
 *  @param {object} i {count, payload, raw}
 *  delta/valid/abort/free_arg reuse the v1 AH laws over byte_size. */
export function allocC740Plan(i) {
  const count = asU32(i.count);
  const payload = asU32(i.payload);
  const raw = asU32(i.raw);
  const byteSize = allocC740ByteSize(count);
  const big = allocC740IsBig(count);
  const delta = big ? allocSbrDelta(payload, raw) : 0;
  const valid = big ? allocSbrValid(payload, raw) : 1;
  return {
    byteSize,
    isBig: big,
    adjustedSize: big ? asU32(byteSize + ALLOC_SB_PAD) : byteSize,
    delta,
    valid,
    abortNeeded: big && !valid ? 1 : 0,
    freeArg: !big ? payload : valid ? raw : 0,
    sizeArgDropped: 1,  /* 0xaef15c forwards only the ptr */
    headerReadNeeded: big,
    retBytes: 8,         /* add esp,8 ; ret 8 */
    argOrderPtrFirst: 1, /* [ebp+8]=payload, [ebp+0xc]=count */
  };
}

export function allocAbiVersion() {
  return ALLOC_PURE_ABI_VERSION;
}

/* ======================= AK: 0x0040cf50 string copy ctor ======================= */

/** cmp eax,0x10 ; jae big — UNSIGNED SIZE gate: SSO iff src size < 0x10
 *  (0..0xf live in the 16-byte inline buffer). */
export function allocStrCtorSso(srcSize) {
  return asU32(srcSize) < ALLOC_STR_SSO_CAP ? 1 : 0;
}

/** cmp [edi+0x14],0x10 ; jb keep — the source DATA-pointer select: the
 *  data sits at [src] iff src cap >= 0x10, else at the src object itself
 *  (its SSO buffer is the object's first 16 bytes). The same select as
 *  the 0x40d0c0 data-pointer getter. */
export function allocStrCtorSrcUsesHeap(srcCap) {
  return asU32(srcCap) >= ALLOC_STR_SSO_CAP ? 1 : 0;
}

/** The capacity the game reads back at [this+0x14]: big path
 *  or ebx,0xf ; cmp ebx,0x7fffffff ; cmova ebx,eax — UNSIGNED saturation
 *  (JS `|` yields a SIGNED int32, so the OR result must be re-unsigned
 *  before the cmova comparison); SSO path mov ebx,0xf. */
export function allocStrCtorCap(srcSize) {
  if (allocStrCtorSso(srcSize)) return ALLOC_STR_SSO_CAP_VALUE;
  const r = asU32(asU32(srcSize) | ALLOC_STR_SSO_CAP_VALUE);
  return r > ALLOC_STR_CTOR_SAT ? ALLOC_STR_CTOR_SAT : r;
}

/** lea ecx,[ebx+1] ; call 0x40cf00 — the SSO path never allocates; the
 *  big path hands cap + 1 (size rounded up to the next 16 multiple). */
export function allocStrCtorAllocArg(srcSize) {
  return allocStrCtorSso(srcSize) ? 0 : asU32(allocStrCtorCap(srcSize) + 1);
}

/** Copy length: the SSO path is movups xmm0,[edi] — a FIXED 16 bytes
 *  whatever the size; the big path memcpys size + 1 (the NUL too). */
export function allocStrCtorCopyLen(srcSize) {
  return allocStrCtorSso(srcSize)
    ? ALLOC_STR_SSO_COPY_LEN
    : asU32(asU32(srcSize) + 1);
}

/** Full 0x0040cf50 resolution.
 *  @param {object} i {srcCap, srcSize} — the SOURCE string's [0x14] cap
 *    and [0x10] size (both game-visible fields of the source object). */
export function allocStrCtorPlan(i) {
  const srcCap = asU32(i.srcCap);
  const srcSize = asU32(i.srcSize);
  const sso = allocStrCtorSso(srcSize);
  return {
    sso,
    srcUsesHeap: allocStrCtorSrcUsesHeap(srcCap),
    allocNeeded: sso ? 0 : 1,
    allocArg: allocStrCtorAllocArg(srcSize),
    cap: allocStrCtorCap(srcSize),
    capSaturated:
      !sso && asU32(srcSize | ALLOC_STR_SSO_CAP_VALUE) > ALLOC_STR_CTOR_SAT ? 1 : 0,
    copyLen: allocStrCtorCopyLen(srcSize),
    sizeOut: srcSize,
    retBytes: 4, /* ret 4 — thiscall, one stack arg (the source) */
  };
}

/* ======================= AL: 0x0040d040 string tidy ======================= */

/** cmp ecx,0x10 ; jb skip — UNSIGNED RELEASE gate: cap >= 0x10 frees,
 *  an SSO string (cap 0xf) skips the allocator entirely. */
export function allocStrTidyReleaseNeeded(cap) {
  return asU32(cap) >= ALLOC_STR_SSO_CAP ? 1 : 0;
}

/** inc ecx — the release size dword is cap + 1 (the terminating NUL
 *  slot); it is pushed to 0xaef15c, which DROPS it (pinned law). */
export function allocStrTidySizeArg(cap) {
  return asU32(asU32(cap) + 1);
}

/** Full 0x0040d040 resolution.
 *  @param {object} i {cap, payload, raw}
 *  Release-side arithmetic = the v1 AH laws over size = cap+1; the NEW
 *  laws are the cap gate and the reset state (size 0, cap 0xf, byte[0]
 *  = 0). The abort (delta > 0x1f) is IAT [0xb18894] noreturn — nothing
 *  is reset there (resetApplies = 0). */
export function allocStrTidyPlan(i) {
  const cap = asU32(i.cap);
  const payload = asU32(i.payload);
  const raw = asU32(i.raw);
  const sizeArg = allocStrTidySizeArg(cap);
  const release = allocStrTidyReleaseNeeded(cap);
  const big = allocSbIsBig(sizeArg);
  const delta = big ? allocSbrDelta(payload, raw) : 0;
  const valid = big ? allocSbrValid(payload, raw) : 1;
  return {
    releaseNeeded: release,
    sizeArg,
    isBig: big,
    adjustedSize: big ? asU32(sizeArg + ALLOC_SB_PAD) : sizeArg,
    delta,
    valid,
    abortNeeded: big && !valid ? 1 : 0,
    freeArg: !release ? 0 : big ? (valid ? raw : 0) : payload,
    sizeArgDropped: 1, /* 0xaef15c forwards only the ptr */
    headerReadNeeded: big,
    resetSize: ALLOC_TIDY_RESET_SIZE,
    resetCap: ALLOC_TIDY_RESET_CAP,
    resetFirstByte: ALLOC_TIDY_RESET_FIRST_BYTE,
    resetApplies: big && !valid ? 0 : 1,
  };
}

/* ======================= AM: 0x0040ccd0 string assign ======================= */

/** cmp edi,ecx ; ja grow — UNSIGNED: the only entry to the grow side. */
export function allocStrAssignGrowNeeded(n, cap) {
  return asU32(n) > asU32(cap) ? 1 : 0;
}

/** cmp edi,0x7fffffff ; ja throw — the length gate is IN this wrapper
 *  (0x40cdb5 -> 0x40ccc0 "string too long", noreturn), unlike 0x40cee0
 *  whose body reads no argument. */
export function allocStrAssignThrows(n) {
  return asU32(n) > ALLOC_STR_ASSIGN_MAX_LEN ? 1 : 0;
}

/** or ebx,0xf ; cmp ebx,0x7fffffff ; jbe — the 16-round of n exceeds
 *  max_size only for n in 0x7ffffff0..0x7fffffff (n == 0x7fffffff rounds
 *  to ITSELF: the low nibble is already 0xf — not saturated). */
export function allocStrAssignRoundSaturated(n) {
  return asU32(asU32(n) | ALLOC_STR_SSO_CAP_VALUE) > ALLOC_STR_ASSIGN_MAX_LEN
    ? 1
    : 0;
}

/** shr edx,1 ; sub eax,edx ; cmp ecx,eax ; jbe — the geometric growth
 *  cap + (cap>>1) (UNSIGNED half) would exceed max_size. First fires at
 *  cap 0x55555556 (0x55555555 + 0x2aaaaaaa == 0x7fffffff — NOT above). */
export function allocStrAssignGrowSaturated(cap) {
  const c = asU32(cap);
  return c > ALLOC_STR_ASSIGN_MAX_LEN - (c >>> 1) ? 1 : 0;
}

/** The capacity the game reads back at [this+0x14] after a grow. The PE
 *  clamps the round and the geometric candidate BEFORE comparing; on
 *  either saturation the result is exactly max_size (the raw sum is never
 *  formed on the saturating path — a wrapped sum would poison the max). */
export function allocStrAssignNewCap(n, cap) {
  const nn = asU32(n);
  const cc = asU32(cap);
  const rounded = asU32(nn | ALLOC_STR_SSO_CAP_VALUE);
  const halfCap = cc >>> 1;
  const roundExceeds = rounded > ALLOC_STR_ASSIGN_MAX_LEN;
  const geoExceeds = cc > ALLOC_STR_ASSIGN_MAX_LEN - halfCap;
  if (roundExceeds || geoExceeds) {
    return ALLOC_STR_ASSIGN_MAX_LEN;
  }
  const geo = asU32(cc + halfCap); /* no wrap: geoExceeds false */
  return rounded > geo ? rounded : geo; /* cmovb — max */
}

/** lea ecx,[ebx+1] ; call 0x40cf00 — only the growing (non-throwing)
 *  path calls the SB allocator; the SSO/fit path allocates nothing. */
export function allocStrAssignAllocArg(n, cap) {
  if (!allocStrAssignGrowNeeded(n, cap)) return 0;
  if (allocStrAssignThrows(n)) return 0; /* noreturn before the alloc */
  return asU32(allocStrAssignNewCap(n, cap) + 1);
}

/** Fast-path data-pointer select (mov ebx,esi ; cmp ecx,0x10 ; jb ;
 *  mov ebx,[esi]): the data sits at [this] iff old cap >= 0x10, else at
 *  the object itself — the SAME law shape as the v3 AK src_uses_heap and
 *  the 0x40d0c0 getter. On the grow path the select is never executed. */
export function allocStrAssignFastUsesHeap(cap) {
  return asU32(cap) >= ALLOC_STR_SSO_CAP ? 1 : 0;
}

/** The copy length: n on BOTH paths (memmove fast / memcpy grow; the
 *  NUL is written separately at data[n]). */
export function allocStrAssignCopyLen(n) {
  return asU32(n);
}

export function allocStrAssignFastHelperVa() {
  return ALLOC_STR_ASSIGN_COPY_FAST_THUNK_VA; /* -> IAT memmove */
}

export function allocStrAssignGrowHelperVa() {
  return ALLOC_STR_ASSIGN_COPY_GROW_THUNK_VA; /* -> IAT memcpy */
}

/** The release gate of the grow path (0x40cd74): the OLD buffer is freed
 *  iff old cap >= 0x10 (the AL gate), reached only when growing. */
export function allocStrAssignReleaseNeeded(n, cap) {
  return allocStrAssignGrowNeeded(n, cap) && asU32(cap) >= ALLOC_STR_SSO_CAP
    ? 1
    : 0;
}

/** lea ecx,[eax+1] — the release size dword is old cap + 1 (the NUL
 *  slot), the AL-shape size derivation; 0xaef15c DROPS it (pinned). */
export function allocStrAssignReleaseSizeArg(cap) {
  return asU32(asU32(cap) + 1);
}

/** Full 0x0040ccd0 resolution.
 *  @param {object} i {n, cap, payload, raw} — n = requested length,
 *    cap = old [this+0x14] capacity, payload = the OLD buffer pointer
 *    ([this] at release time), raw = host read of [payload-4] (big only).
 *  Laws: grow gate, in-body length throw, the two capacity clamps + the
 *  cmovb geometric max, the alloc argument, the fast-path data select,
 *  the copy helper pins (memmove fast / memcpy grow), the release laws
 *  (AH template over cap+1, gated on grow && cap >= 0x10, abort IAT
 *  [0xb18894] noreturn — nothing after, buf swap unreached), and the
 *  post-state the game reads: size = n, cap = new_cap on grow, NUL at
 *  data[n]. */
export function allocStrAssignPlan(i) {
  const n = asU32(i.n);
  const cap = asU32(i.cap);
  const payload = asU32(i.payload);
  const raw = asU32(i.raw);
  const grow = allocStrAssignGrowNeeded(n, cap);
  const throws = grow && allocStrAssignThrows(n) === 1 ? 1 : 0;
  /* The noreturn length throw fires BEFORE the capacity calc, the alloc,
     the copy and the release — the reachable grow state is grow && !throws. */
  const growEff = grow && !throws ? 1 : 0;
  const newCap = growEff ? allocStrAssignNewCap(n, cap) : 0;
  const release = growEff && allocStrAssignFastUsesHeap(cap) === 1 ? 1 : 0;
  const sizeArg = allocStrAssignReleaseSizeArg(cap);
  const big = allocSbIsBig(sizeArg);
  const delta = release && big ? allocSbrDelta(payload, raw) : 0;
  const valid = release && big ? allocSbrValid(payload, raw) : 1;
  const abort = release && big && !valid ? 1 : 0;
  return {
    growNeeded: grow,
    throws,
    allocNeeded: growEff,
    allocArg: growEff ? asU32(newCap + 1) : 0,
    capOut: growEff ? newCap : cap,
    roundSaturated: growEff ? allocStrAssignRoundSaturated(n) : 0,
    growSaturated: growEff ? allocStrAssignGrowSaturated(cap) : 0,
    sizeOut: n,
    fastUsesHeap: grow ? 0 : allocStrAssignFastUsesHeap(cap),
    copyLen: allocStrAssignCopyLen(n),
    fastHelperVa: ALLOC_STR_ASSIGN_COPY_FAST_THUNK_VA,
    growHelperVa: ALLOC_STR_ASSIGN_COPY_GROW_THUNK_VA,
    nulOffset: n,
    nulByte: 0,
    releaseNeeded: release,
    releaseSizeArg: sizeArg,
    releaseIsBig: big,
    releaseDelta: delta,
    releaseValid: valid,
    releaseAbortNeeded: abort,
    releaseFreeArg: !release ? 0 : big ? (valid ? raw : 0) : payload,
    bufOutIsNew: growEff && !abort ? 1 : 0,
    sizeArgDropped: 1,
    retBytes: 8,
    returnsThis: 1,
  };
}
