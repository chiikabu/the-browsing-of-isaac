#pragma once

#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

/* Logger 0x00a112c0 pure level-gate — a NEW freestanding SHARED family,
   ABI v1. Deliberately not any one section's property: the logger is called
   by 10 families (frame-opaque, anm2, player-manager, exit, hud-post-update,
   frame-effect, process-input, render-shell, game-render, pgd) and this
   family retires the "residual host log" edge in all of them at once.

   Root (identity checked this unit with scripts/decomp/identify-zhl-address
   — NO exact ZHL match; the name is address-stable):

     0x00a112c0  cdecl varargs logger: (uint32 level, const char* fmt, ...).
                 .text raw offset 0x006106c0. Body 0x00a112c0..0x00a114a2
                 (gate ret at 0x00a1139c on the init-fail arm, main ret at
                 0x00a114a1), jump table 0x00a114a4 (6 dwords), index table
                 0x00a114bc (16 bytes 00 01 05 02 05 05 05 03 05 05 05 05 05
                 05 05 04). SEH handler thunk 0x00b1093d, security cookie
                 0x00bf93b4. Plain `ret` — caller cleans (varargs cdecl).

   ---- exact gate control flow (whole body disassembled this unit) ----

   0x00a112e8  eax = [0x00c7de48]              ; guard (BSS, 0 at load)
   0x00a112ed  cmp eax, 1 ; je epilogue        ; FULL 32-bit ==. guard 1 =
                                               ; logger disabled (shutdown /
                                               ; init window): total no-op.
   0x00a112f6  cmp [0x00c79bd8], 0 ; je clear  ; listener ptr null test
   0x00a11302  test [0x00c79bdc], ebx ; je clear ; mask AND level — FULL
                                               ; 32-bit `test` (no byte trick)
   0x00a1130a/0e  cl = 1 / cl = 0              ; listener_pre flag
   0x00a11310  [ebp-0xd] = cl                  ; stored for the post gate
   0x00a11313  test bl, bl ; jne proceed       ; LOW BYTE of level ONLY
   0x00a11317  test cl, cl ; je epilogue       ; drop: low byte 0 AND no hit
   0x00a1131f  test eax, eax ; jne locked      ; any nonzero guard skips init
   0x00a11328  [0x00c7de48] = 1                ; init window opens
   0x00a11332  call 0x00a15770 (ecx=0x00c37958); mutex-holder init (thiscall)
   0x00a11337  test al, al ; je fail           ; LOW BYTE. Structurally dead:
                                               ; 0x00a15770 ends `mov al, 1`
                                               ; on EVERY path (proven below)
   0x00a1133b  [0x00c7de48] = 2                ; ready
   0x00a11381  [0x00c7de48] = 0 ; ret          ; (fail arm: drop, no output)
   0x00a1134f  push -1 ; call [vtbl+0xc]       ; HOST lock (EnterCriticalSection
                                               ; wrapper 0x00a157f0, INFINITE)
   0x00a11362  cmp byte [0x00c33911], 0 ; je   ; atLineStart byte (initial 1,
                                               ; file-backed .data)
   0x00a1136b  lea eax, [ebx-1]                ; idx = level - 1 (32-bit wrap)
   0x00a1136e  cmp eax, 0xf ; ja default       ; UNSIGNED STRICT ABOVE:
                                               ; idx > 0xf -> default "".
                                               ; idx == 0xf (level 0x10) takes
                                               ; the table. level 0 wraps to
                                               ; 0xffffffff -> default.
   0x00a11373  movzx eax, byte [eax+0x00a114bc]; index table (16 bytes)
   0x00a1137a  jmp [eax*4+0x00a114a4]          ; 6-way jump table
     case 0 -> 0x00b81818 "[INFO] - "   (level 1)
     case 1 -> 0x00b8180c "[NET] - "    (level 2 — NO callsite uses it)
     case 2 -> 0x00b81830 "[WARN] - "   (level 4)
     case 3 -> 0x00b81824 "[ERROR] - "  (level 8)
     case 4 -> 0x00b8183c "[ASSERT] - " (level 0x10)
     case 5 -> 0x00b1a4ec ""            (levels 3,5..7,9..15 via table;
                                          0 and >= 0x11 via the ja)
   0x00a113d0  call 0x00420a80 (buf, "%s", prefix) ; HOST sprintf shim
   0x00a113dd  strlen(buf) -> len                  ; inline repne-style loop
   0x00a113f0  edx = 0x2800 - len ; ecx = buf+len  ; append window
   0x00a113fd  call 0x00709bc0 (fmt, &vararg0)     ; HOST vsnprintf shim
                                                   ; (ecx=dest, edx=count)
   0x00a11405  test bl, bl ; je skip           ; LOW BYTE of level AGAIN:
   0x00a11409  push buf ; call [0x00b1827c]    ; HOST OutputDebugStringA
                                               ; (stdcall — no caller cleanup)
   0x00a11414  cmp byte [ebp-0xd], 0 ; je      ; pre-flag re-check, then
   0x00a1141a  ecx = [0x00c79bd8]; test; je    ; POST re-read of ptr and
   0x00a11424  test [0x00c79bdc], ebx ; je     ; mask — NOT folded to the
                                               ; pre-call snapshot
   0x00a11440  strlen(buf) -> len2             ; separate pass, re-derived
   0x00a11449  push len2; push 1; push buf; call [vtbl+0x1c] ; HOST listener
                                               ; write (thiscall fwrite shim)
   0x00a11453  strlen(buf) -> len3             ; a THIRD separate pass
   0x00a11469  cmp byte [len3+0x00c7b647], 0xa ; buf[len3-1] == '\n'; len3==0
                                               ; reads the PRE-BUFFER byte
                                               ; 0x00c7b647 (never written —
                                               ; censused, so constant 0)
   0x00a11470  [0x00c7b648] = al               ; buffer reset: al is the NUL
                                               ; the strlen loop just read (0)
   0x00a11475  sete [0x00c33911]               ; atLineStart' = (last=='\n')
   0x00a1148d  call [vtbl+0x10]                ; HOST unlock (0x00a159a0)

   ---- what is game logic (translated here) vs platform primitive ----

   Translated (this family): the guard equality, the listener pre/post gates
   (full 32-bit mask AND), the low-byte emit/console gates, the guard state
   machine, the prefix selection (unsigned bound + byte table), the append
   window arithmetic (dest = buf+len, cap = 0x2800-len, 32-bit wrap), the
   atLineStart law including the len==0 pre-buffer quirk, the buffer-reset
   byte, and the callsite marshalling law (vararg dwords from `add esp, N`).

   Host (platform primitives, per the standing decision drafted with this
   unit): __stdio_common_vsprintf formatting (exact chains pinned this
   unit, log-v21: 0x00420a80 = 13-insn sprintf stub `lea eax,[ebp+0x10] ;
   or edx,-1 ; push eax(va) ; push ecx(fmt) ; push [ebp+0xc] ; mov ecx,
   [ebp+8](buf) ; call 0x0041d4d0 ; add esp,0xc ; ret` -> 0x0041d4d0 = the
   options|1 marshaller (pushes argptr/locale/fmt/edx-count/ecx-buf, calls
   0x0041d4c0, `or [options].lo,1`, then __stdio_common_vsprintf, cmovs -1);
   0x00709bc0 = the options|2 twin (count from edx, calls 0x0041d4c0
   DIRECTLY); 0x0041d4c0 = `mov eax, 0xc71648 ; ret` (0x00c71648 = the
   options u64). 133 whole-.text callsites for 0x420a80 (image-wide MSVC
   stub), 15 for 0x41d4c0, 2 for 0x709bc0 (0x7035a5 + the logger 0xa113fd)),
   OutputDebugStringA, the
   critical-section lock/unlock (0x00a157f0 / 0x00a159a0 on the holder
   0x00c37958, vtable 0x00b81c0c at runtime; 0x00ba04b4 is the base vtable
   written only during the static dtor 0x00b16b20), the guest-allocator init
   0x00a15770 (allocates 0x1c via 0x00a0f4c0 — allocator standing decision;
   full body decoded log-v21: low-BYTE `test byte [edi+4],1` already-init
   gate, InitializeCriticalSection [0xb18278] with the owned byte pre-cleared,
   movzx+bts bit-0 with a BYTE flags store, critsec ptr store, `mov al,1` on
   EVERY path = D-LOG-2; 9 direct callsites + 8 devirt-cmp sites whole-.text,
   cross-family template — consequences already laws: D-LOG-2, v5 LAA
   ready-bit, D-LOG-6),
   and the log.txt sink object (installer 0x00a5f3a0, vtable 0x00ba5184 /
   sibling 0x00b9e940 — 15 slots each, identical except +0x00 dtor wrapper
   (v15/v16), +0x1c write (v6 0x00a83fd0 / v7 0x00a52850), +0x20 flush
   (0x0040c200 nop / 0x00a52880 real fflush v13); the shared IO leaves are
   typed-host censused log-v21 (the +0x34 Close member is PURE since v21): +0x04 0x00a52760 filesize
   (ftell/fseek x4), +0x08 0x00a527b0 ftell leaf, +0x0c 0x00a527c0 fseek
   dispatch (mode 0/1/2 -> origin, default NO call), +0x10/+0x18
   0x00a28170/0x00a28190 base-class slots, +0x14 fread v8, +0x24/+0x28 open
   pair v10, +0x2c 0x00a526d0 fclose leaf (FULL-dword FILE* gate), +0x30
   0x00a25440 state!=2 getter — PURE since v22 (ABI 22: 3 insns
   `cmp dword ptr [ecx+4],2 ; setne al ; ret` — FULL-dword read of the
   state cell, 0/1 bool, no SEH/no store/no call; 3 devirt-cmp inlined
   copies at 0x92be28/0x92c008/0x92c1e8 inline the identical body;
   carriers = the +0x30 slots of 0xb833d8/0xba5184/0xb9e940 plus the
   13-slot function table 0xb65724; 0xb9c15c is a 10-slot table — its
   +0x30 dword is string data, NOT a slot), +0x34 0x00a526f0 Close member — PURE since
   v21 (ABI 21: unconditional vtbl+0x2c dispatch BEFORE the state store,
   state := 2 on ONE unconditional full-dword store, FULL-dword path gate
   -> guest free + conditional null; SEH 0xaf0a10 + GS; the FILE* presence
   gate itself stays INSIDE the typed-host leaf 0xa526d0), +0x38 =
   0x0043eec0 path getter `mov eax,[ecx+8] ; ret` — TYPED-HOST LEASE row
   (log-v23: the log ledger leases it PLATFORM; log-v24 ENGINE-OWNER
   IDENTIFIED: the 0x86b7/0x86c3 register megablocks ARE LuaEngine::
   RegisterClasses (0x866960..0x86e4c9 — the lua family's own censused
   body), so the lua family owns the megablock pattern and the v24 unit
   PROPOSES the lease transfer: the log family keeps the host pins (22
   direct calls + 2 registration pushes 0x86b72b/0x86c361, carriers =
   the +0x38 slots of 0xb833d8/0xba5184/0xb9e940 plus the steamworks-shim
   0xb6575c), the lua family gains the registration rows (incl. the two
   0x43eec0 rows: binder 0x88ab60/"GetVariant" @0x86b737 and binder
   0x88fd10/"GetType" @0x86c36d); the body is a generic cell+8 leaf
   shared with engine objects — evidence census-binding.out in
   log-v23-binding + census-megablock.py in log-v24-engine). log-v25
   VERIFIED the lease row and CLOSED the base tables: 0xb83418 / 0xb833d8
   member bodies fully decoded (census-base-tables.py); the four complete
   small helpers land at ABI 23 (0xa649b0 flags-set1, 0xa24ea0
   flush-clear, 0xa253e0/0xa25410 open twins); the megablock gap-bin row
   for the shared leaf 0x67efc0 is confirmed lua-registered (push @
   0x86b763) — the v24 transfer is live. The file-exists validator 0x00a524b0
   (SEH 0xb02b00, in the IO cluster) is typed-host per the SFX family's
   registration (Rule 12): `_access(path,0)` [0xb187c4], 2 sfx-only
   callsites, 0 raw dwords.

   IAT identities resolved from the PE import directory this unit:
     [0x00b1827c] KERNEL32.dll!OutputDebugStringA
     [0x00b18278] KERNEL32.dll!InitializeCriticalSection
     [0x00b18274] KERNEL32.dll!DeleteCriticalSection
     [0x00b18270] KERNEL32.dll!EnterCriticalSection
     [0x00b18268] KERNEL32.dll!LeaveCriticalSection
     [0x00b182d8] KERNEL32.dll!Sleep
     [0x00b18904] api-ms-win-crt-stdio-l1-1-0.dll!__stdio_common_vsprintf
     [0x00b188fc] api-ms-win-crt-stdio-l1-1-0.dll!fopen
     [0x00b188cc] api-ms-win-crt-stdio-l1-1-0.dll!fwrite
     [0x00b1891c] api-ms-win-crt-stdio-l1-1-0.dll!fflush

   ---- BSS / writer census (whole-.text linear decode, 2,094,686 insns;
        raw-byte superset scan matches the instruction census EXACTLY) ----

     0x00c7de48 guard        BSS 0 at load. Writers: logger (1/2/0) + the
                             exit teardown 0x00a71bec (=1 iff it was 2, at
                             0x00a71bac) — after which ALL 3286 sites no-op.
     0x00c79bd8 listener ptr BSS 0. Writers: 5 zero-stores + ONE nonzero
                             install 0x00a5f478 (log.txt sink; single caller
                             of installer 0x00a5f3a0 is 0x00931135, boot).
     0x00c79bdc listener mask BSS 0. Writers: 3 zero-stores + 0x00a5f48a
                             which stores 0xff UNCONDITIONALLY at install.
     0x00c33911 atLineStart  .data file-backed, INITIAL VALUE 1. Referenced
                             ONLY by the logger (read 0x00a11362, sete
                             0x00a11475).
     0x00c7b648 buffer[0x2800] BSS. Referenced ONLY by the logger (8 sites).
                             The guard dword sits exactly at buffer+0x2800.
     0x00c7b647 pre-buffer byte: ONE reference in all of .text (the logger's
                             cmp). ZERO writers -> constant 0 for the process
                             lifetime; claim bounded to this exact byte.

   ---- callsite census (all of .text, this unit) ----

     3286 direct rel32 `e8` callsites; ZERO address escapes (no imm32/disp32
     equals 0x00a112c0 anywhere in .text) — the census is complete.
     Levels (immediate): 0x10 x2219, 0x01 x709, 0x08 x216, 0x04 x137.
     Register-level sites: 5, ALL resolving to constants by their dominating
     writes: 0x0062ddd9 edx==1, 0x007f9ac3 edx==1, 0x009a653c eax==4,
     0x009a6558 eax==8, 0x00a6d05d eax in {4,1} (two-path join).
     Level 2 ("[NET] - ") is passed by NO callsite. Every shipped level has
     a NONZERO LOW BYTE, so the low-byte drop arm never fires in shipped
     code; the live drop conditions are guard==1 (post-shutdown) and the
     pre-install listener state (mask 0 -> file edge dead until boot).
     Cleanup `add esp, N` histogram: 0x8 x2336, 0xc x562, 0x10 x173,
     0x14 x48, 0x18 x27, 0x1c x25, 0x20 x13, 0x24 x4, 0x2c x1, 0x30 x2,
     0x34 x1, 0x40 x1, split-first-add-4 x8, folded-into-later-adds x85
     (sum 3286). Vararg dwords = (N - 8) / 4, max seen 14.
     Return-value dependence: NONE of the 3286 sites consumes EAX after the
     call (candidates were all overwrites: xor al,al / or eax,-1 /
     mov al,[..] / 3-op imul / sete al / lahf-driven test ah).

   ---- original-binary quirks, REPRODUCED and pinned, never corrected ----

   D-LOG-1 (empty append clears the line-start flag): the newline check
   reads buf[len-1]; for len == 0 that is the pre-buffer byte 0x00c7b647
   (censused constant 0), so an emit whose prefix AND formatted output are
   both empty stores atLineStart = 0 even though nothing was printed.

   D-LOG-2 (init cannot fail, but the fail arm exists): 0x00a15770 returns
   al = 1 on EVERY path (`mov al, 1` dominates both rets; on alloc failure
   it still sets the init bit with the critsec pointer NULL). The logger's
   `test al, al ; je 0x00a11381` guard-reset arm is therefore structurally
   dead in this binary. It is translated anyway and pinned as dead.

   ---- falsifier census (for the standing decision; run this unit) ----

   No instruction outside the logger body references the message buffer
   0x00c7b647..0x00c7de47 (the only outside hits of the range were the
   integer constant 0x00c7ce0c = 0xffffffff / 0x148 in vector max_size /
   growth arithmetic at 0x0069e921/0x006a03d3 clusters — magic-multiply
   division contexts, not addresses). No callsite reads the return value.
   Nothing reads atLineStart or the buffer back into game logic; the
   listener object's other virtual calls found are lifecycle (dtor +0,
   flush +0x20, path getter +0x38 = `mov eax,[ecx+8]; ret`). Clean negative.

   ============================ ABI v2 ============================
   The log LIFECYCLE: teardown 0x00a71770 and boot installer 0x00a5f3a0.

   Root (identity checked this unit, batched over all 18 call targets of the
   unit — 17 have NO exact ZHL match and stay address-stable. The ONE exact
   match in the whole unit is the caller):

     0x00a71770  log-system teardown. .text raw offset 0x00670b70. Body
                 0x00a71770..0x00a71c0d (single `ret`), then an int3 run to
                 0x00a71c20 — decoded LINEARLY from the function start, which
                 is itself anchored by the preceding epilogue+padding
                 (`5f 5e 5b 8b e5 5d c3` then `cc` x9). Prologue installs the
                 SEH frame 0x00b136e0 and the security cookie 0x00bf93b4.
     0x00a5f3a0  log.txt sink installer, `ret 8` (2 stack args, only
                 [ebp+8] is read). .text raw offset 0x0065e7a0.
     0x00931050  EXACT ZHL match `cleanup int IsaacMain(int argc, char** argv)`
                 (third_party/REPENTOGON/libzhl/functions/Isaac.zhl, 28
                 pattern bytes). Corroborated independently: its only caller
                 is the CRT 0x00aefbb9 (__scrt_common_main_seh) and it holds
                 BOTH lifecycle calls — install 0x00931135, teardown
                 0x0093140e. This is the init/shutdown pair.

   ---- teardown: log-relevant control flow (linear decode, this unit) ----

   The two log blocks are far apart in the body; everything between them is
   unrelated engine teardown and is NOT modelled here.

   (A) listener uninstall, 0x00a71823..0x00a71852. Reached on EVERY path:
       0x00a7179c `je 0xa71823` and the fallthrough both land at/ before it.

   0x00a71823  mov ecx, [0x00c79bd8]         ; listener ptr (PRE read)
   0x00a71829  test ecx, ecx ; je 0xa7184c   ; null -> skip the whole block
   0x00a7182d  mov eax, [ecx] ; call [eax+0x20] ; HOST flush vcall
   0x00a71832  mov ecx, [0x00c79bd8]         ; POST RE-READ — the machine does
   0x00a71838  test ecx, ecx ; je 0xa7184c   ; NOT reuse the pre-call value
   0x00a7183c  mov eax,[ecx]; push 1; call [eax] ; HOST deleting dtor(1)
   0x00a71842  mov [0x00c79bd8], 0           ; ptr := 0 — CONDITIONAL (this
                                             ; store is inside the block)
   0x00a7184c  mov esi, [0x00c7de50]         ; <- join of BOTH `je` edges and
                                             ;    of the fallthrough
   0x00a71852  mov [0x00c79bdc], 0           ; mask := 0 — UNCONDITIONAL

       Deliberate asymmetry, do not homogenise: the POINTER clear is guarded
       by two null tests, the MASK clear is not guarded at all. All three
       paths nevertheless leave the pointer 0 (pre==0; post==0; or the store)
       — that is DERIVED here, not assumed, and the tests prove the union of
       the three arms is {0}.

   (B) guard gate + critical-section destroy, 0x00a71bac..0x00a71bec:

   0x00a71bac  cmp dword [0x00c7de48], 2     ; 83 3d 48 de c7 00 02 — Grp1
                                             ; Ev,Ib: a FULL 32-bit compare
                                             ; against 2 (no 0x66 prefix).
                                             ; guard 0x102 does NOT engage.
   0x00a71bb3  mov dword [0x00c37970], 0     ; scheduled BETWEEN cmp and jne;
                                             ; `mov` does not touch EFLAGS, so
                                             ; the branch still reads the cmp
   0x00a71bbd  jne 0xa71bf6                  ; not 2 -> skip EVERYTHING below
   0x00a71bbf  mov esi, [0x00c37960]         ; holder+8 = the CRITICAL_SECTION
   0x00a71bc5  test esi, esi ; je 0xa71be5
   0x00a71bca  push esi ; call [0x00b18274]  ; HOST DeleteCriticalSection
   0x00a71bd0  push 0x1c ; push esi
   0x00a71bd3  call 0x00aef15c ; add esp, 8  ; HOST operator delete(p, 0x1c)
   0x00a71bdb  mov [0x00c37960], 0           ; critsec ptr := 0
   0x00a71be5  and byte [0x00c3795c], 0xfe   ; 80 25 .. fe — Grp1 Eb,Ib: a
                                             ; BYTE and, clearing holder+4
                                             ; bit 0 (the exact inverse of
                                             ; `bts eax,0` at 0x00a157a6)
   0x00a71bec  mov dword [0x00c7de48], 1     ; guard := 1 — CONDITIONAL on the
                                             ; == 2 test above
   0x00a71bf6  mov byte [0x00c78aad], 0      ; UNCONDITIONAL (it is the `jne`
                                             ; target AND the fallthrough)

       Adjacent-store contrast, also deliberate: `guard := 1` is reached only
       through the `== 2` gate; the byte store 8 instructions later is the
       branch target itself and always runs. And the widths differ on purpose
       across the body: 0x00a71be5 is a BYTE and (`80 /4`), while 0x00a7181c /
       0x00a71b4c / 0x00a71980 are DWORD ands (`83 /4`) on other flags.

   ---- the boot-side mask store IS unconditional (claim re-verified) ----

   v1 recorded "0x00a5f48a stores 0xff UNCONDITIONALLY". Re-derived from the
   instruction stream rather than inherited, because an unconditional mask
   store is exactly the shape a config read usually hides behind:

   0x00a5f3c5  mov ecx,[0x00c79bd8]; test; je 0xa5f3df ; destroy any previous
   0x00a5f3df  push 0x10 ; call 0x00a0f4c0            ; HOST alloc 16 bytes
   0x00a5f3f5  test esi, esi ; je 0xa5f480             ; alloc FAILED ->
   0x00a5f419  mov [esi], 0x00ba5184                   ; sink vtable
   0x00a5f436  call [0x00b188fc]                       ; HOST fopen(path,"wb")
   0x00a5f43f  mov [esi+0xc], eax ; test eax,eax ; je  ; FILE* stored
   0x00a5f44c  mov [esi+4], 1                          ; state 1 iff fopen ok
                                                       ; (0x00a5f3fd preset 2)
   0x00a5f478  mov [0x00c79bd8], esi ; jmp 0xa5f48a    ; success arm
   0x00a5f480  mov [0x00c79bd8], 0                     ; failure arm, falls
                                                       ; THROUGH to:
   0x00a5f48a  mov dword [0x00c79bdc], 0xff            ; <- JOIN of both arms

   CONFIRMED unconditional, and stronger than v1 stated: the function reads no
   configuration value anywhere (its only inputs are the path arg [ebp+8] and
   [0x00c5aa98]), and 0x00a5f48a is the join of the success arm's explicit
   `jmp` and the failure arm's fallthrough. D-LOG-4 below is the consequence.

   ---- BSS writer census, whole-.text linear decode WITH RESYNC ----

   2,094,319 instructions (capstone's generator halts on the first
   undecodable byte; without a resync loop the pass silently covers a prefix
   only — a first attempt here stopped at 35,730). 469 undecodable bytes
   skipped. This count agrees with the repository's recorded whole-.text
   figure; v1's header says 2,094,686, which does not — see the report.

     0x00c7de48 guard   2 readers  / 4 writers, ALL enumerated:
                        r 0x00a112e8 (logger gate), r 0x00a71bac (this gate)
                        W 0x00a11328 =1, W 0x00a1133b =2, W 0x00a11381 =0,
                        W 0x00a71bec =1 (this unit). No address escape: the
                        LE dword 0x00c7de48 does not occur as an immediate.
     0x00c79bd8 ptr     19 readers / 6 writers: 0x00930e4f=0, 0x00a5f3d5=0,
                        0x00a5f478=esi (the ONLY nonzero writer in .text),
                        0x00a5f480=0, 0x00a71842=0, 0x00b16f08=0.
     0x00c79bdc mask    2 readers (both in the logger) / 4 writers:
                        0x00930e60=0, 0x00a5f48a=0xff (ONLY nonzero),
                        0x00a71852=0, 0x00b16f12=0.
     0x00c37960 critsec 2 readers / 2 writers (0x00a71bdb, 0x00b16b47 both 0).
     0x00c3795c flags   0 readers / 2 writers, both `and ..,0xfe` BYTE ops
                        (0x00a71be5 this unit, 0x00b16b51 the static dtor).
     0x00c78aad          2 readers (0x00430c3b, 0x00a710cb) / 2 writers
                        (0x00a714af =1, 0x00a71bf6 =0).

   ---- reach-site enumeration for both lifecycle roots ----

   Every call form enumerated, plus a raw-byte superset scan for the
   little-endian target dword across ALL FIVE sections (an address escape
   need not live in .text):

     0x00a71770  direct rel32 e8: 1 (0x0093140e). tail/thunk jmp: 0.
                 conditional jmp: 0. register-held resolving to it: 0.
                 raw-byte occurrences of the LE dword in .text/.rdata/.data/
                 .rsrc/.reloc: 0. -> single caller, complete census.
     0x00a5f3a0  direct rel32 e8: 1 (0x00931135). all other forms: 0.
                 raw-byte occurrences across all sections: 0.
     0x00931050  direct rel32 e8: 1 (0x00aefbb9, the CRT). all others: 0.

   ---- post-teardown reachability (CFG, not assumption) ----

   Frame chain outward from the guard store, taking only instructions
   CFG-REACHABLE from each return address (an address-ordered "everything
   after the site" over-counts: 0x0093141c is a loop-continue block and
   0x00931458 an SEH funclet, neither of which is a successor of 0x00931413):

     0x00a71770 from 0x00a71bf6  ->  9 insns, 0 direct calls
     0x00931050 from 0x00931413  -> 17 insns, 1 direct call (0x00aef12b,
                                    the cookie check) + 1 IAT call
                                    [0x00b189ec] ole32!CoUninitialize
     0x00aef9bc from 0x00aefbbe  -> 29 insns, 5 direct calls (CRT exit)

   Transitive closure over direct rel32 edges: 154 functions, containing 15
   logger callsites in 8 functions — 0x00a12d50, the critsec lock/unlock pair
   (0x00a157f0/0x00a159a0), 0x00a230b0, 0x00a23160, the guest-allocator
   wrapper 0x00a648b0 (4 sites), 0x00a66a20, 0x00a68360, 0x00a6f270. All
   eight are engine/CRT infrastructure. ZERO of them is a game-logic body
   modelled by any pure-helper family. The teardown body itself contains 0
   logger callsites.

   BOUND, stated rather than hidden: that closure follows direct rel32 edges
   only. 149 IAT and 152 register/vtable call sites inside it are UNRESOLVED,
   and the CRT exit path dispatches static destructors through a function
   pointer table, so 15 is a LOWER bound on post-teardown-reachable log
   sites. It is not a lower bound on the family edges: the families' bodies
   are Game/Room/Player code that the CRT exit path does not enter.

   ---- a re-entrant logger edge inside the logger's own lock ----

   0x00a157f0 (the vtbl+0xc lock the logger takes at 0x00a1134f) begins:
     0x00a157fe test byte [eax+4], 1 ; jne 0xa1581b   ; holder init bit
     0x00a15808 push 0x00b81c58 ; push 0x10 ; call 0x00a112c0
   i.e. locking an uninitialised holder logs at level 0x10 with
   "Trying to lock mutex that has not been initialized". The teardown CLEARS
   that very bit (0x00a71be5) — but on the same path it also pins guard = 1,
   which makes the logger a total no-op, so the re-entrant assert can never
   fire post-teardown. Recorded because the two stores are 7 bytes apart and
   the ordering is what makes it safe.

   ---- original-binary quirks added this unit ----

   D-LOG-3 (the shutdown pin is CONDITIONAL, and this qualifies the v1
   claim): `guard := 1` at 0x00a71bec is reached only through
   `cmp [0xc7de48], 2 ; jne`. The guard reaches 2 only via the logger's own
   lazy init at 0x00a1133b. So a process that never emitted a single
   non-dropped message reaches teardown with guard == 0, the `jne` skips the
   entire block, and the logger is left FULLY LIVE after shutdown — no
   DeleteCriticalSection, no holder-flag clear, no guard pin. "After the exit
   teardown pins guard = 1 all 3286 sites are proven no-ops" is therefore
   true only for guard in {1, 2} at 0x00a71bac. Reproduced, never corrected.

   D-LOG-4 (the installer arms the mask for a sink it failed to create): the
   0xff store at 0x00a5f48a is the join of the success arm and the
   alloc-failure arm, so a failed installation still leaves mask == 0xff with
   ptr == 0. Benign only because the logger tests the pointer FIRST
   (0x00a112f6) — the mask alone cannot open the listener gate.

   D-LOG-5 (the teardown's second flush is structurally dead): 0x00a71a19
   re-reads [0x00c79bd8] and flushes if non-null, but the pointer is 0 on
   every path out of 0x00a7184c and the ONLY nonzero writer in all of .text
   is 0x00a5f478, inside 0x00a5f3a0, whose only caller (all forms censused,
   zero address escapes across all five sections) is 0x00931135 in IsaacMain
   — which cannot execute during the teardown it called. So the pointer
   cannot become non-null between 0x00a71842 and 0x00a71a19.

   ============================ ABI v3 ============================
   The log-system INIT 0x00a710a0 — the teardown's counterpart, and the
   instruction-level ANSWER to D-LOG-3.

   Root (identity checked this unit, batched over all 27 VAs of the unit in
   ONE invocation: 26 have NO exact ZHL match and stay address-stable. The
   ONE exact match is again the caller 0x00931050 = IsaacMain, 28 pattern
   bytes — the same single hit v2 found, and the line is held):

     0x00a710a0  log-system init. .text raw offset 0x006704a0. Body
                 0x00a710a0..0x00a714db (two rets: 0x00a714c8 returns AL=1,
                 0x00a714db returns AL=0), then an int3 run from 0x00a714dc.
                 The function start is ITSELF the anchor: a 16-byte int3 run
                 precedes it and it opens with the standard SEH prologue
                 (handler 0x00b13685, security cookie 0x00bf93b4).
                 Decoded LINEARLY with resync: 271 instructions, ZERO
                 undecodable bytes, and ZERO instructions without an
                 intra-procedural predecessor (no orphan/funclet block).
     0x00a5f0e0  its single caller; the call is at 0x00a5f18c.

   Two register arguments, published as globals before anything else runs:
     0x00a710c7  mov esi, edx        0x00a710c9  mov edi, ecx

   ---- init: log-relevant control flow (linear decode, this unit) ----

   0x00a710cb  cmp byte [0x00c78aad], 0     ; 80 3d .. 00 — Grp1 Eb,Ib: a
                                            ; BYTE compare against ZERO. Not
                                            ; a bit test, and NOT the dword
                                            ; compare the teardown uses.
   0x00a710d2  je 0x00a710e3                ; already-initialised -> warn
   0x00a710d4  push 0x00ba21f0              ; "KAGE has already been
                                            ;  initialized\n" (34 bytes)
   0x00a710d9  push 0x10                    ; level 0x10 (6a 10)
   0x00a710db  call 0x00a112c0              ; <- LOGGER EDGE 1
   0x00a710e0  add esp, 8                   ; (8-8)/4 = 0 vararg dwords
   0x00a710e3  push 0x40                    ; <- the `je` TARGET. Scheduled
                                            ;    before the two stores.
   0x00a710e5  mov [0x00c78d98], edi        ; arg0 (ecx) published —
   0x00a710eb  mov [0x00c78d94], esi        ; arg1 (edx) published.
                                            ; BOTH UNCONDITIONAL: 0x00a710e5
                                            ; dominates BOTH rets.
   0x00a710f1  call 0x00a0f4c0              ; HOST guest alloc of 0x40
   0x00a71105  test esi,esi ; je 0x00a711e2 ; alloc failure arm
   0x00a71113  mov [esi+8], 0x7fcb9dd6      ; immediate, pinned not construed
   0x00a71122  mov [esi+0x10], 0x00b81c0c   ; the SAME mutex vtable the
                                            ; logger's global holder uses
   0x00a711a5  cmp eax, 0x00a15770 ; jne    ; DEVIRTUALISED call: the vtable
   0x00a711ac  call 0x00a15770              ; slot is compared against the
   0x00a711b3  call eax                     ; logger's own holder-init body
                                            ; and called DIRECTLY when equal.
                                            ; Receiver is [esi+0x10], a fresh
                                            ; heap holder — NOT the global
                                            ; 0x00c37958 — so this does not
                                            ; touch the logger's guard.
   0x00a711da  mov [0x00c7de78], esi        ; object published — SUCCESS ARM
                                            ; ONLY (the failure arm at
                                            ; 0x00a711e2 does not write it)

   0x00a7139a  test byte [0x00c5ab48], 1    ; f6 05 .. 01 — Grp3 Eb,Ib: a
   0x00a713a1  jne 0x00a713db               ; BIT-0 test, not `cmp ..,0`.
                                            ; An inline lazy critical-section
                                            ; init; byte-diffed against the
                                            ; logger's out-of-line 0x00a15770
                                            ; this unit — ONE template, the
                                            ; only differences being the
                                            ; operand form ([edi+4]/[edi+8]
                                            ; vs absolute [0xc5ab48]/
                                            ; [0xc5ab4c]) and the local slot.
   0x00a713a3  push 0x1c ; call 0x00a0f4c0  ; same 0x1c as the logger holder
   0x00a713b2  test esi,esi ; je 0x00a713c3 ; alloc failure -> esi = 0
   0x00a713bb  call [0x00b18278]            ; HOST InitializeCriticalSection
   0x00a713c5  movzx eax, byte [0x00c5ab48] ; read the byte...
   0x00a713cc  bts eax, 0                   ; ...set bit 0 on the DWORD...
   0x00a713d0  mov [0x00c5ab4c], esi        ; ...store the pointer (0 on
   0x00a713d6  mov [0x00c5ab48], al         ; failure!) and the BYTE back.
                                            ; D-LOG-6 below.

   0x00a713f8  test byte [0x00c79a7c], 1    ; a THIRD byte gate, again BIT-0
   0x00a713ff  je 0x00a71412                ; clear -> create the thread
   0x00a71401  push 0x00ba82b0              ; "Command thread is already
                                            ;  initialized\n" (38 bytes)
   0x00a71406  push 0x10                    ; level 0x10
   0x00a71408  call 0x00a112c0              ; <- LOGGER EDGE 2
   0x00a7140d  add esp, 8                   ; 0 vararg dwords
   0x00a71410  jmp 0x00a7145f               ; and SKIP the creation
   0x00a7144f  movzx eax, byte [0x00c79a7c] ; creation arm only:
   0x00a71456  bts eax, 0                   ; flags := (flags & 0xff) | 1
   0x00a7145a  mov [0x00c79a7c], al

   0x00a714af  mov byte [0x00c78aad], 1     ; the lifecycle byte SET
   0x00a714b6  mov al, 1                    ; ...and AL = 1 (success)
   0x00a714c8  ret
   0x00a714c9  xor al, al                   ; failure label
   0x00a714db  ret

       Three byte gates in ONE function, deliberately NOT the same shape —
       do not homogenise them. 0x00a710cb is `cmp Eb, 0` (any nonzero value
       warns); 0x00a7139a and 0x00a713f8 are `test Eb, 1` (only bit 0
       matters, so a cell holding 2 does NOT count as initialised). And
       none of the three is the teardown's full-DWORD `cmp [0xc7de48], 2`.

       Asymmetry with the teardown, also deliberate: the teardown's
       `mov byte [0x00c78aad], 0` at 0x00a71bf6 is UNCONDITIONAL (it is the
       `jne` target), while the init's `= 1` at 0x00a714af is reached ONLY
       on the success return. Measured, not assumed: 0x00a714af dominates
       the AL=1 ret 0x00a714c8, does NOT dominate the AL=0 ret 0x00a714db,
       and the failure label 0x00a714c9 is NOT forward-reachable from the
       store (its only three predecessors are the early gates 0x00a7128b,
       0x00a71357, 0x00a71369). So byte == 1 IFF the init returned 1.

   ---- the lifecycle byte has a SECOND reader outside the pair ----

   0x00430c3b `cmp byte [0x00c78aad], 0 ; je` guards a level-0x10 log of
   0x00b82ee8 ("SetEngineParameters must be called before calling
   KAGE::Initialize\n") — the same gate shape as 0x00a710cb, in a different
   function. Recorded as evidence; the init is NOT named from it (rule 3),
   and stays address-stable.

   ---- reach-site enumeration (every call form + raw-byte superset scan) ----

     0x00a710a0  direct rel32 e8: 1 (0x00a5f18c). tail/thunk jmp: 0.
                 conditional jmp: 0. ff15 [disp32]: 0. register-held
                 resolving to it: 0. Raw LE-dword occurrences across ALL
                 FIVE sections: 0. Inbound control transfers landing inside
                 the body past its entry: 0. -> single caller, complete.
     0x00a71770  RE-VERIFIED independently this unit, not inherited: the
                 same 1 / 0 / 0 / 0 / 0 / 0 / 0 result as v2.
     0x00931050  1 direct caller (0x00aefbb9, the CRT), all other forms 0,
                 0 raw occurrences, 0 inbound transfers.

   ---- ZERO address escapes, proven rather than asserted ----

   For each tracked cell, every raw little-endian occurrence of its address
   in ANY of the five sections was matched against the displacement field of
   an instruction the census had already enumerated. Leftovers = escapes:

     0x00c7de48 guard          raw 6  / enumerated 6  / escapes 0
     0x00c78aad lifecycle byte raw 4  / enumerated 4  / escapes 0
     0x00c79a7c cmd-thread     raw 23 / enumerated 23 / escapes 0
     0x00c78d94 arg1 slot      raw 3  / enumerated 3  / escapes 0
     0x00c78d98 arg0 slot      raw 4  / enumerated 4  / escapes 0

   No occurrence in .rdata/.data/.rsrc/.reloc for any of them. So the writer
   census below is COMPLETE: nothing can reach these cells through a
   computed pointer.

   ---- BSS / writer census (whole-.text linear decode WITH RESYNC) ----

   2,094,319 instructions, 469 undecodable bytes skipped — the identical
   configuration and identical totals as v2 (v1's 2,094,686 still does not
   agree and is again left untouched rather than silently rewritten).

     0x00c7de48 guard        2 readers / 4 writers, unchanged from v2.
     0x00c78aad lifecycle    2 readers (0x00430c3b, 0x00a710cb) /
                             2 writers (0x00a714af =1, 0x00a71bf6 =0).
     0x00c78d98 arg0 slot    3 readers (0x00a54195, 0x00a7e404, 0x00a7e429)
                             / 1 writer (0x00a710e5).
     0x00c78d94 arg1 slot    2 readers (0x00a541a1, 0x00a7e412) /
                             1 writer (0x00a710eb).
     0x00c79a7c cmd flags    13 readers / 10 writers (three sibling copies
                             of the same lazy-init shape).
     0x00c7de78 init object  401 readers / 3 writers.

   ================= D-LOG-3 IS ANSWERED: guard is NEVER 0 =================

   The v2 qualification asked whether a shipped process can reach
   0x00a71bac with guard == 0, which would leave the logger fully live after
   shutdown. It CANNOT. The proof is a domination argument, entirely from
   the instruction stream:

   (1) [0x00c7de48] has exactly FOUR writers in all of .text (0x00a11328 =1,
       0x00a1133b =2, 0x00a11381 =0, 0x00a71bec =1) and ZERO address
       escapes (scan above), so this enumeration is exhaustive.
   (2) 0x00a71bac is reachable only through 0x00a71770's entry: one direct
       caller 0x0093140e, no other call form, no address escape in any
       section, and no control transfer from outside landing inside the body.
   (3) 0x0093140e lives in IsaacMain, whose only caller is the CRT
       0x00aefbb9, with no escapes and no inbound transfers.
   (4) In IsaacMain's CFG — 259 instructions, ZERO undecodable bytes, every
       instruction a node so a mid-block landing cannot be absorbed —
       0x00931172 DOMINATES 0x0093140e. 0x00931172 is
       `call 0x00a112c0` preceded by `push 0x00b7b3f8` ("Command Line: \n")
       at 0x0093116b and `push 1` (6a 01) at 0x00931170.
   (5) The only IsaacMain instruction without an intra-procedural
       predecessor is 0x00931458, the unwind funclet
       (`mov ecx,[ebp-0x14] ; call 0x00930b20 ; ret`) — it returns. The
       scope table pushed at 0x00931055 (0x00bcc178, .rdata) holds exactly
       one entry {enclosing -2, filter 0x00931458, handler 0x00931461}, and
       the handler at 0x00931461 restores ESP, sets trylevel -2, `xor eax,
       eax` and falls into the epilogue: it RETURNS FROM IsaacMain and never
       reaches 0x0093140e. So no exception path bypasses (4) either.
   (6) Level 1 has a nonzero LOW BYTE, so the v1 emit gate passes at
       0x00931172 regardless of listener state.
   (7) Therefore, at 0x00931172: guard 0 takes 0x00a11328 (=1), calls
       0x00a15770 which returns AL=1 on every path (D-LOG-2, already
       pinned), and 0x00a1133b stores 2. Guard 2 is left alone. Guard 1
       blocks and is left alone.
   (8) The only writer that could restore 0 is 0x00a11381, structurally dead
       (D-LOG-2).

   => at 0x00a71bac the guard is 2 on every normal shipped path (and can
      only ever be 1 in the pathological case where the transient
      0x00a11328..0x00a1133b window never closed). It is NEVER 0.

   Consequence for the standing decision: the v1 claim "after the exit
   teardown pins guard = 1 all 3286 sites are proven no-ops" is RESTORED for
   shipped runs — its antecedent guard-in-{1,2} is now proven, not assumed.
   D-LOG-3's *instruction-level* fact (the store at 0x00a71bec is
   conditional on `== 2`) remains true and stays modelled; what is retired
   is its *consequence*, the claim that a shipped process can leave the
   logger live after shutdown. That scenario is unreachable in this binary.

   ---- original-binary quirk added this unit ----

   D-LOG-6 (an "initialised" flag is set for a critical section that was
   never created): at 0x00a713b4 an allocation failure jumps to 0x00a713c3
   `xor esi, esi`, which falls into the SHARED tail 0x00a713c5 — so
   `bts eax, 0` still runs and 0x00a713d6 marks the cell initialised while
   0x00a713d0 stores a NULL CRITICAL_SECTION*. Byte-identical in shape to
   the logger's own holder init 0x00a15770 (0x00a15791 je 0x00a157a0 ->
   0x00a157a2 shared tail), which is what makes D-LOG-2's "init cannot
   report failure" observable rather than merely odd. Reproduced, never
   corrected.

   ============================ ABI v4 ============================
   The mutex LOCK 0x00a157f0 (vtbl+0xc) and UNLOCK 0x00a159a0 (vtbl+0x10) —
   the pair the logger itself takes at 0x00a11358 / 0x00a1148d.

   ---- reach-site enumeration: the vtable is the ONLY channel ----

   Decode configuration, identical to v2/v3: capstone 5.0.7, CS_MODE_32,
   detail on, linear from .text raw start (file offset 0x00000400, VA
   0x00401000) over the full raw size 0x00716200, +1-byte resync at each
   undecodable byte. Reproduces 2094319 instructions / 469 undecodable
   bytes exactly, and re-derives the v1 logger census (3286 rel32 calls to
   0x00a112c0) as a control.

   Over that decode, for BOTH targets:
     direct rel32 `call`      : 0
     direct rel32/rel8 `jmp`  : 0   (no tail-call entry)
     `call [imm32]`           : 0   (no absolute indirect)
     address as an IMMEDIATE  : 0   (so no `mov reg,imm32` + `call reg`
                                     register-held form can exist)
   and a raw-byte superset scan for the little-endian dword across ALL FIVE
   sections (.text/.rdata/.data/.rsrc/.reloc) returns exactly ONE occurrence
   each — the vtable slot itself:
     0x00a157f0 -> .rdata 0x00b81c18   (= 0x00b81c0c + 0xc)
     0x00a159a0 -> .rdata 0x00b81c1c   (= 0x00b81c0c + 0x10)
   Leftovers 0. An `FF15`-only census would have reported nothing at all.

   The class vtable 0x00b81c0c has 5 slots, all in this address band:
     +0x00 0x00a156e0  scalar-deleting dtor (`ret 4`, arg = delete flag)
     +0x04 0x00a15770  holder init  (the v1/v2 `mov al,1`-always body)
     +0x08 0x00a157c0  destroy      (DeleteCriticalSection + free 0x1c)
     +0x0c 0x00a157f0  LOCK    (this unit)
     +0x10 0x00a159a0  UNLOCK  (this unit)
   0x00b81c0c has 41 raw occurrences: 37 `mov [X], 0xb81c0c` immediates in
   .text (object construction) and 4 file-backed .data instances —
   0x00c37958 (the logger's holder), 0x00c57b2c, 0x00c5aa70, 0x00c5ab44.
   The logger's holder is pre-initialised IN THE IMAGE to
   {vtable = 0x00b81c0c, flags = 0, critsec = 0}.

   Statically resolvable dispatches (`mov reg,[G]` then `call [reg+0xc/+0x10]`
   with the register live) over those four globals: 32 sites = 16 lock /
   unlock pairs, and EVERY lock among them pushes 0xffffffff. Bound stated
   rather than hidden: receivers that live in heap or embedded objects (the
   37 construction sites) are not statically resolvable from one instruction,
   so "no callsite passes a finite timeout" is NOT claimed — only that none
   of the 32 resolvable ones does.

   ---- 0x00a157f0, __thiscall(this=ecx, uint32 timeout_ms), `ret 4` ----

   0x00a157f9  mov eax, ecx                 ; this
   0x00a157fe  test byte [eax+4], 1         ; holder flags, BIT 0 only
   0x00a15802  mov [esp+0x10], eax          ; spill `this` across the call
   0x00a15806  jne 0x00a1581b               ; initialised -> skip the assert
   0x00a15808  push 0x00b81c58              ; "Trying to lock mutex that has
                                            ;  not been initialized" (50)
   0x00a1580d  push 0x10                    ; level 0x10 — RE-ENTRANT logger
   0x00a1580f  call 0x00a112c0              ; the logger calling itself
   0x00a15814  mov eax, [esp+0x18]          ; reload `this` (esp is +8 here)
   0x00a15818  add esp, 8                   ; 0 vararg dwords by the v1 law
   0x00a1581b  cmp dword [ebp+8], -1        ; FULL 32-bit == INFINITE
   0x00a1581f  jne 0x00a15853               ; finite -> the timed arm
     -- INFINITE arm (the one the logger takes) --
   0x00a15821  mov esi, [eax+8]             ; critsec ptr, read ONCE
   0x00a15825  call [0x00b18270]            ; HOST EnterCriticalSection
   0x00a1582b  cmp byte [esi+0x18], 0       ; the logical-owned byte
   0x00a1582f  je 0x00a15844                ; free -> take it
   0x00a15831  mov edi, [0x00b182d8]        ; &Sleep — HOISTED OUT of the loop
   0x00a15837  push 0x3e8                   ; <== LOOP HEAD (1000 ms)
   0x00a1583c  call edi                     ; HOST Sleep
   0x00a1583e  cmp byte [esi+0x18], 0       ; the ONLY thing re-read
   0x00a15842  jne 0x00a15837               ; <== back-edge to the PUSH
   0x00a15844  mov byte [esi+0x18], 1       ; mark owned
   0x00a15848  mov al, 1                    ; return TRUE
   0x00a15850  ret 4
     -- timed arm --
   0x00a15853  call 0x00a68490              ; HOST nanosecond clock, ONCE
   0x00a15858..0x00a158bc                   ; start_ms = ns / 1000000
   0x00a158bf  cmp dword [ebp+8], 0
   0x00a158cb  jbe 0x00a1598e               ; UNSIGNED -> timeout 0 fails
                                            ; WITHOUT ever calling TryEnter
   0x00a158d1  mov eax, [esp+0x10]          ; <== LOOP HEAD; reloads `this`
   0x00a158d5  mov esi, [eax+8]             ; and RE-READS [this+8]
   0x00a158d9  call [0x00b1826c]            ; HOST TryEnterCriticalSection
   0x00a158df  test eax,eax ; setne cl      ; FULL 32-bit
   0x00a158e6  je 0x00a158f7
   0x00a158e8  cmp byte [esi+0x18], 0       ; entered: already owned?
   0x00a158ec  je 0x00a158f7
   0x00a158ee  call [0x00b18268]            ; HOST LeaveCriticalSection —
   0x00a158f5  jmp 0x00a158ff               ; give the CS back, then sleep
   0x00a158f7  test cl, cl
   0x00a158f9  jne 0x00a15848               ; SUCCESS -> lands on `mov al,1`
                                            ; and SKIPS 0x00a15844 (D-LOG-7)
   0x00a158ff  push 0xa ; call [0x00b182d8] ; HOST Sleep(10)
   0x00a15907  call 0x00a68490              ; now RE-READ every iteration
   0x00a1590c..0x00a15970                   ; now_ms = ns / 1000000
   0x00a15973  sub ecx, [esp+0xc]           ; elapsed = now - start (64-bit;
   0x00a15977  sbb edx, [esp+0x20]          ;  start captured ONCE, above)
   0x00a1597b  test edx, edx                ; clears CF...
   0x00a1597d  jb  0x00a158d1               ; ...so this edge is STATICALLY
                                            ; DEAD (the MSVC 64-bit unsigned
                                            ; compare idiom; harmless)
   0x00a15983  ja  0x00a1598e               ; elapsed.hi != 0 -> expired
   0x00a15985  cmp ecx, [ebp+8]             ; timeout re-read per iteration
   0x00a15988  jb  0x00a158d1               ; UNSIGNED: elapsed < timeout
   0x00a15990  xor al, al                   ; return FALSE
   0x00a15996  ret 4

   0x00a68490 is QueryPerformanceCounter / QueryPerformanceFrequency
   ([0x00b18238] / [0x00b18234]) converted through the CRT int64->double
   helper 0x00aefe80, divided, multiplied by the .rdata double 1.0e9 at
   0x00baa8b0 and truncated by 0x00aefd70: an unsigned 64-bit NANOSECOND
   count in edx:eax. The two conversion blocks are the standard MSVC magic
   division: eight 32x32 `mul` limbs against 0x431bde82d7b634db
   (= ceil(2^82 / 1000000)), an adc chain, then `shrd ecx,edx,0x12` /
   `shr edx,0x12`. Verified by direct emulation of the limb sequence to be
   EXACTLY `ns / 1000000` (unsigned) over 20010 values including 0, 1,
   999999, 1000000, 2^32-1, 2^32, 2^63 and 2^64-1: the wrapper's clock unit
   is MILLISECONDS, matching Sleep(0x3e8) and Sleep(0xa).

   ---- 0x00a159a0, __thiscall(this=ecx), plain `ret` (NO stack arg) ----

   0x00a159a3  test byte [esi+4], 1         ; same predicate, ESI form
   0x00a159a7  jne 0x00a159b8
   0x00a159a9  push 0x00b81c20
       ; the 52-byte .rdata string is exactly
       ; "Trying to unlock mutex that has not been initialized"
   0x00a159ae  push 0x10 ; call 0x00a112c0  ; RE-ENTRANT logger, level 0x10
   0x00a159b5  add esp, 8
   0x00a159b8  mov eax, [esi+8]             ; critsec ptr
   0x00a159bb  push eax
   0x00a159bc  mov byte [eax+0x18], 0       ; clear owned BEFORE the API call
   0x00a159c0  call [0x00b18268]            ; HOST LeaveCriticalSection
   0x00a159c7  ret
   The unlock never calls EnterCriticalSection, never tests the pointer, and
   clears the byte UNCONDITIONALLY — including on the arm where it just
   asserted that the mutex is not initialised.

   ---- the lazy-init template question, settled by byte diff ----

   The v3 handoff proposed 0x00a157fe as "the 4th instance of the lazy-init
   template". It is NOT, and that divergence is this unit's finding.

   What the five sites genuinely share is only the PREDICATE: Grp3
   `F6 /0 ib` with imm8 = 0x01 — a bit-0 test of one byte — plus a short
   jcc. Raw bytes:
     0x00a1577a  f6 47 04 01     75 30   test byte [edi+4],1     ; jne
     0x00a7139a  f6 05 48abc500 01 75 38 test byte [0xc5ab48],1  ; jne
     0x00a713f8  f6 05 7c9ac700 01 74 11 test byte [0xc79a7c],1  ; JE
     0x00a157fe  f6 40 04 01     75 13   test byte [eax+4],1     ; jne
     0x00a159a3  f6 46 04 01     75 0f   test byte [esi+4],1     ; jne
   Differing bytes are the ModRM/displacement form (47 / 05+disp32 / 40 / 46)
   and the rel8. 0x00a713f8 additionally flips 75 -> 74 because its two arms
   are laid out in the opposite order; the condition RELATIVE TO THE GUARDED
   WORK is identical in all five (bit set = the work is skipped).

   What is NOT shared is the guarded body, and that is the whole point:

   (a) The real lazy-init template has exactly TWO instances, 18 instructions
       each, identical mnemonic-for-mnemonic:
         0x00a1577a  f6 47 04 01 75 30 6a 1c e8 39 9d ff ff 8b f0 83 c4 04
                     89 75 fc 85 f6 74 0d 56 c6 46 18 00 ff 15 78 82 b1 00
                     eb 02 33 f6 0f b6 47 04 0f ba e8 00 89 77 08 88 47 04
         0x00a7139a  f6 05 48abc500 01 75 38 6a 1c e8 16 e1 f9 ff 8b f0
                     83 c4 04 89 75 ec 85 f6 74 0d 56 c6 46 18 00
                     ff 15 78 82 b1 00 eb 02 33 f6 0f b6 05 48abc500
                     0f ba e8 00 89 35 4cabc500 a2 48abc500
       The invariant core is byte-identical: `6a 1c` (the 0x1c allocation),
       `85 f6 / 74 0d`, `56 / c6 46 18 00` (the SAME +0x18 byte the lock
       spins on, zeroed at creation), `ff 15 78 82 b1 00`
       (InitializeCriticalSection), `eb 02 / 33 f6` (the failure arm joining
       the SHARED tail) and `0f ba e8 00` (bts eax,0). Differences are the
       operand form, the ebp spill slot (fc vs ec) and the two rel32/rel8.
   (b) 0x00a713f8 is a third, different shape: warn-or-create, `bts` present
       but reached only on the create arm, no allocation, no shared tail.
   (c) 0x00a157fe and 0x00a159a3 are a NEW two-instance template — an
       ASSERT-ONLY guard:
         lock    f6 40 04 01 [89 44 24 10] 75 13 68 581cb800 6a 10
                 e8 acbaffff [8b 44 24 18] 83 c4 08
         unlock  f6 46 04 01               75 0f 68 201cb800 6a 10
                 e8 0bb9ffff               83 c4 08
       Core `F6 /0 01` + `75 rel8` + `68 imm32` + `6a 10` + `E8 rel32` +
       `83 c4 08`, differing only in ModRM, rel8, the string VA and the
       rel32. The lock interleaves a spill/reload pair because it holds
       `this` in the caller-clobbered EAX; the unlock keeps it in callee-
       saved ESI and needs neither. This template contains NO allocation, NO
       InitializeCriticalSection, NO `bts`, and NO store to the flags byte:
       it READS the ready bit and never WRITES it.

   That asymmetry is exactly what makes D-LOG-6 lethal here — see below.

   ---- D-LOG-6 IS observable from the lock path ----

   0x00a15770's allocation-failure arm (0x00a15791 je 0x00a157a0 ->
   0x00a157a2) still runs `bts eax,0` and publishes flags bit 0 = 1 while
   0x00a157aa stores a NULL CRITICAL_SECTION* to holder+8. The assert guard
   reads ONLY that bit. So in the D-LOG-6 state (flags bit 0 set, holder+8
   == 0):
     - the assert is SUPPRESSED, precisely in the case it exists to catch;
     - lock/INFINITE dereferences NULL first at 0x00a15825
       (EnterCriticalSection(NULL)), then reads byte [0x00000018];
     - lock/timed dereferences NULL first at 0x00a158d9
       (TryEnterCriticalSection(NULL));
     - unlock WRITES byte [0x00000018] = 0 at 0x00a159bc, BEFORE its API
       call, so the unlock faults on a store.
   This is live on the logger's own path: guard 0 -> 0x00a11328 (guard=1) ->
   0x00a11332 call 0x00a15770 -> D-LOG-2 returns AL=1 regardless ->
   0x00a1133b (guard=2) -> 0x00a11358 call [vtbl+0xc]. A failed 0x1c
   allocation therefore reaches the lock with the assert disarmed.

   Corollary, proven and pinned: the re-entrant assert at 0x00a1580f is
   UNREACHABLE from the logger's own callsite in every non-D-LOG-6 state.
   The lock is reached only with guard == 2 (guard 1 drops at 0x00a112e8;
   guard 0 runs the init first), guard == 2 has exactly one writer
   (0x00a1133b) which is dominated by the 0x00a15770 call, and 0x00a15770
   sets bit 0 on BOTH arms. This strengthens the v2 note, which only ruled
   the assert out post-teardown.

   ---- v2 census refinement, stated rather than silently rewritten ----

   ISAAC_LOG_HOLDER_FLAGS_READERS = 0 is correct as an ABSOLUTE-displacement
   census and under-describes reality: the flags byte of the logger's holder
   has two real readers, 0x00a157fe and 0x00a159a3, which reach it as
   [eax+4] / [esi+4] after `mov ecx, 0xc37958`. Recorded as
   ISAAC_LOG_HOLDER_FLAGS_INDIRECT_READERS; the v2 constant is left alone.

   ---- original-binary quirks added this unit ----

   D-LOG-7 (a successful TIMED acquire does not mark the mutex owned): the
   timed success branch 0x00a158f9 `jne 0x00a15848` lands on `mov al, 1` and
   SKIPS `mov byte [esi+0x18], 1` at 0x00a15844, which only the INFINITE arm
   executes. The wrapper therefore returns TRUE holding the CRITICAL_SECTION
   while the logical-owned byte stays 0, so the next INFINITE acquire on the
   same object sees a free mutex, enters the (recursive) CS a second time and
   sets the byte — and one unlock then clears the byte and leaves the CS
   once, leaving the recursion count unbalanced. Reproduced, never corrected.

   D-LOG-8 (the INFINITE spin sleeps while holding the critical section):
   0x00a15825 enters the CS and no path from 0x00a15837 back to 0x00a15837
   contains a LeaveCriticalSection, so the 1000 ms spin runs with the CS
   held. The unlock never ENTERS the CS (it only clears the byte and
   Leaves), so a different thread can still release the spin; the same
   thread cannot — a Win32 CRITICAL_SECTION is recursive, so a re-entrant
   INFINITE lock passes 0x00a15825 immediately, finds its own byte set and
   spins forever. Reproduced, never corrected.

   ---- what stays a platform primitive (existing standing decision) ----

   EnterCriticalSection [0x00b18270], TryEnterCriticalSection [0x00b1826c],
   LeaveCriticalSection [0x00b18268], Sleep [0x00b182d8],
   QueryPerformanceCounter [0x00b18238] and QueryPerformanceFrequency
   [0x00b18234] are KERNEL32 imports; their bodies are not in this image.
   They are platform primitives under the logger standing decision and this
   unit does not stall on them. What IS translated here is every decision
   taken AROUND them: which arm runs, whether the assert fires, whether the
   spin is entered and what it re-reads, the elapsed-time law and its unit
   conversion, and every store to the ownership byte.

   Binary: tools/isaac-ng.unpacked.exe
   SHA-256: 5129DF723E645DAAEA59514394195F3EA1DCE1671BB0433D724648A845017200 */

enum { ISAAC_LOG_PURE_HELPERS_ABI_VERSION = 25 };

/* ---------- PE constants (hash-bound) ---------- */

enum {
  /* Root and tail VAs (all address-stable; no exact ZHL match). */
  ISAAC_LOG_VA_LOGGER = 0x00a112c0u,
  ISAAC_LOG_VA_MUTEX_INIT = 0x00a15770u,
  ISAAC_LOG_VA_MUTEX_LOCK = 0x00a157f0u,   /* vtbl+0xc, push -1 (INFINITE) */
  ISAAC_LOG_VA_MUTEX_UNLOCK = 0x00a159a0u, /* vtbl+0x10 */
  ISAAC_LOG_VA_SPRINTF_SHIM = 0x00420a80u, /* options|1, count -1 */
  ISAAC_LOG_VA_VSNPRINTF_SHIM = 0x00709bc0u, /* options|2, ecx=dest edx=cnt */
  ISAAC_LOG_VA_STDIO_OPTIONS = 0x0041d4c0u,  /* returns &u64 0x00c71648 */
  ISAAC_LOG_VA_LISTENER_INSTALLER = 0x00a5f3a0u, /* single caller 0x931135 */
  ISAAC_LOG_VA_LISTENER_WRITE = 0x00a83fd0u,     /* sink vtbl+0x1c */
  ISAAC_LOG_VA_SHUTDOWN_GUARD_STORE = 0x00a71becu, /* guard=1 iff was 2 */
  ISAAC_LOG_VA_STATIC_DTOR = 0x00b16b20u,
  ISAAC_LOG_VA_JUMP_TABLE = 0x00a114a4u,  /* 6 dwords */
  ISAAC_LOG_VA_INDEX_TABLE = 0x00a114bcu, /* 16 bytes */
  ISAAC_LOG_VA_SEH_HANDLER = 0x00b1093du,
  ISAAC_LOG_SECURITY_COOKIE_VA = 0x00bf93b4u,

  /* IAT slots (identities from the import directory, this unit). */
  ISAAC_LOG_IAT_OUTPUT_DEBUG_STRING_A = 0x00b1827cu,
  ISAAC_LOG_IAT_INIT_CRITICAL_SECTION = 0x00b18278u,
  ISAAC_LOG_IAT_DELETE_CRITICAL_SECTION = 0x00b18274u,
  ISAAC_LOG_IAT_ENTER_CRITICAL_SECTION = 0x00b18270u,
  ISAAC_LOG_IAT_LEAVE_CRITICAL_SECTION = 0x00b18268u,
  ISAAC_LOG_IAT_SLEEP = 0x00b182d8u,
  ISAAC_LOG_IAT_STDIO_COMMON_VSPRINTF = 0x00b18904u,
  ISAAC_LOG_IAT_FOPEN = 0x00b188fcu,
  ISAAC_LOG_IAT_FWRITE = 0x00b188ccu,
  ISAAC_LOG_IAT_FFLUSH = 0x00b1891cu,
  ISAAC_LOG_IAT_FCLOSE = 0x00b1890cu, /* dtor inner 0xa52443 calls it */
  ISAAC_LOG_IAT_EOS_LOBBYDETAILS_RELEASE = 0x00b180a4u,
  /* eossdk-win32-shipping ! _EOS_LobbyDetails_Release@4; the neighbor
     dtor inner 0xa840b2 calls it */

  /* Data slots. */
  ISAAC_LOG_GUARD_VA = 0x00c7de48u,        /* BSS 0; == buffer + 0x2800 */
  ISAAC_LOG_LISTENER_PTR_VA = 0x00c79bd8u, /* BSS 0 */
  ISAAC_LOG_LISTENER_MASK_VA = 0x00c79bdcu, /* BSS 0; installer stores 0xff */
  ISAAC_LOG_AT_LINE_START_VA = 0x00c33911u, /* file-backed, initial 1 */
  ISAAC_LOG_BUFFER_VA = 0x00c7b648u,       /* BSS zero-filled */
  ISAAC_LOG_PRE_BUFFER_BYTE_VA = 0x00c7b647u, /* read-only, constant 0 */
  ISAAC_LOG_MUTEX_HOLDER_VA = 0x00c37958u,
  ISAAC_LOG_MUTEX_VTABLE_VA = 0x00b81c0cu, /* runtime vtable (base 0xba04b4
                                              only during the static dtor) */
  ISAAC_LOG_SINK_VTABLE_VA = 0x00ba5184u,
  ISAAC_LOG_STDIO_OPTIONS_VA = 0x00c71648u,

  /* Gate laws. */
  ISAAC_LOG_GUARD_UNINIT = 0,
  ISAAC_LOG_GUARD_BUSY = 1, /* init window / permanent after shutdown */
  ISAAC_LOG_GUARD_READY = 2,
  ISAAC_LOG_BUFFER_CAPACITY = 0x2800,
  ISAAC_LOG_NEWLINE_BYTE = 0x0a,
  ISAAC_LOG_INSTALLER_MASK = 0xff, /* 0x00a5f48a, stored unconditionally */
  ISAAC_LOG_VA_START_STACK_DISP = 0x10, /* lea eax,[ebp+0x10] */
  ISAAC_LOG_PREFIX_INDEX_BOUND = 0xf,   /* cmp eax, 0xf ; ja — unsigned */

  /* Prefix table (level -> case; strings pinned from .rdata this unit). */
  ISAAC_LOG_PREFIX_CASE_INFO = 0,   /* 0x00b81818 "[INFO] - "  len 9  */
  ISAAC_LOG_PREFIX_CASE_NET = 1,    /* 0x00b8180c "[NET] - "   len 8  */
  ISAAC_LOG_PREFIX_CASE_WARN = 2,   /* 0x00b81830 "[WARN] - "  len 9  */
  ISAAC_LOG_PREFIX_CASE_ERROR = 3,  /* 0x00b81824 "[ERROR] - " len 10 */
  ISAAC_LOG_PREFIX_CASE_ASSERT = 4, /* 0x00b8183c "[ASSERT] - " len 11 */
  ISAAC_LOG_PREFIX_CASE_DEFAULT = 5, /* 0x00b1a4ec ""          len 0  */
  ISAAC_LOG_PREFIX_VA_INFO = 0x00b81818,
  ISAAC_LOG_PREFIX_VA_NET = 0x00b8180c,
  ISAAC_LOG_PREFIX_VA_WARN = 0x00b81830,
  ISAAC_LOG_PREFIX_VA_ERROR = 0x00b81824,
  ISAAC_LOG_PREFIX_VA_ASSERT = 0x00b8183c,
  ISAAC_LOG_PREFIX_VA_DEFAULT = 0x00b1a4ec,
  ISAAC_LOG_FMT_S_VA = 0x00b62fdc, /* "%s" — the prefix sprintf format */

  /* Whole-.text censuses (this unit). */
  ISAAC_LOG_CALLSITES = 3286,
  ISAAC_LOG_ADDRESS_ESCAPES = 0,
  ISAAC_LOG_RETURN_VALUE_DEPENDENT_SITES = 0,
  ISAAC_LOG_SITES_LEVEL_INFO = 709,   /* immediate push 1 */
  ISAAC_LOG_SITES_LEVEL_NET = 0,      /* level 2 is NEVER passed */
  ISAAC_LOG_SITES_LEVEL_WARN = 137,   /* immediate push 4 */
  ISAAC_LOG_SITES_LEVEL_ERROR = 216,  /* immediate push 8 */
  ISAAC_LOG_SITES_LEVEL_ASSERT = 2219, /* immediate push 0x10 */
  ISAAC_LOG_SITES_LEVEL_REGISTER = 5, /* all resolve to {1,4,8} constants */
  ISAAC_LOG_MAX_VARARG_DWORDS = 14,   /* add esp, 0x40 site */
  ISAAC_LOG_TEXT_INSN_COUNT = 2094686 /* linear decode, v1 unit — see v2 */
};

/* ---------- v2: lifecycle VAs (teardown 0x00a71770 / install 0x00a5f3a0) ---- */

enum {
  /* Roots. Every one address-stable EXCEPT the caller, which is the single
     exact ZHL match found in this unit's batched identity pass. */
  ISAAC_LOG_VA_TEARDOWN = 0x00a71770u,
  ISAAC_LOG_VA_TEARDOWN_END = 0x00a71c0du,  /* the one `ret` */
  ISAAC_LOG_VA_ISAAC_MAIN = 0x00931050u,    /* EXACT ZHL: IsaacMain, 28 bytes */
  ISAAC_LOG_VA_INSTALLER_CALLSITE = 0x00931135u, /* IsaacMain+0x0e5, boot */
  ISAAC_LOG_VA_TEARDOWN_CALLSITE = 0x0093140eu,  /* IsaacMain+0x3be, shutdown */
  ISAAC_LOG_VA_CRT_MAIN_SEH = 0x00aef9bcu,       /* IsaacMain's only caller */
  ISAAC_LOG_VA_CRT_MAIN_CALLSITE = 0x00aefbb9u,

  /* Teardown block (A): listener uninstall. */
  ISAAC_LOG_VA_TEARDOWN_PTR_READ_PRE = 0x00a71823u,
  ISAAC_LOG_VA_TEARDOWN_FLUSH_VCALL = 0x00a7182fu,  /* call [eax+0x20] */
  ISAAC_LOG_VA_TEARDOWN_PTR_READ_POST = 0x00a71832u, /* the RE-READ */
  ISAAC_LOG_VA_TEARDOWN_DESTROY_VCALL = 0x00a71840u, /* call [eax], arg 1 */
  ISAAC_LOG_VA_TEARDOWN_PTR_STORE = 0x00a71842u,   /* CONDITIONAL */
  ISAAC_LOG_VA_TEARDOWN_JOIN = 0x00a7184cu,        /* both `je` edges land */
  ISAAC_LOG_VA_TEARDOWN_MASK_STORE = 0x00a71852u,  /* UNCONDITIONAL */
  ISAAC_LOG_VA_TEARDOWN_SECOND_FLUSH = 0x00a71a19u, /* D-LOG-5, dead */

  /* Teardown block (B): guard gate + critical-section destroy. */
  ISAAC_LOG_VA_TEARDOWN_GUARD_TEST = 0x00a71bacu,  /* cmp dword [..], 2 */
  ISAAC_LOG_VA_TEARDOWN_GUARD_BRANCH = 0x00a71bbdu, /* jne 0x00a71bf6 */
  ISAAC_LOG_VA_TEARDOWN_CRITSEC_READ = 0x00a71bbfu,
  ISAAC_LOG_VA_TEARDOWN_CRITSEC_DELETE = 0x00a71bcau, /* IAT DeleteCritSec */
  ISAAC_LOG_VA_TEARDOWN_CRITSEC_FREE = 0x00a71bd3u,   /* operator delete */
  ISAAC_LOG_VA_TEARDOWN_CRITSEC_STORE = 0x00a71bdbu,
  ISAAC_LOG_VA_TEARDOWN_FLAGS_STORE = 0x00a71be5u,  /* BYTE and 0xfe */
  ISAAC_LOG_VA_TEARDOWN_BYTE_STORE = 0x00a71bf6u,   /* UNCONDITIONAL */
  ISAAC_LOG_VA_OPERATOR_DELETE = 0x00aef15cu,

  /* Installer internals. */
  ISAAC_LOG_VA_INSTALLER_PREV_READ = 0x00a5f3c5u,
  ISAAC_LOG_VA_INSTALLER_ALLOC = 0x00a5f3e1u,      /* push 0x10 */
  ISAAC_LOG_VA_INSTALLER_ALLOC_TEST = 0x00a5f3f5u, /* test esi,esi ; je */
  ISAAC_LOG_VA_INSTALLER_VTABLE_STORE = 0x00a5f419u,
  ISAAC_LOG_VA_INSTALLER_FOPEN = 0x00a5f436u,
  ISAAC_LOG_VA_INSTALLER_STATE_OK = 0x00a5f44cu,   /* [esi+4] = 1 */
  ISAAC_LOG_VA_INSTALLER_PTR_STORE = 0x00a5f478u,  /* the ONLY nonzero writer */
  ISAAC_LOG_VA_INSTALLER_PTR_FAIL_STORE = 0x00a5f480u,
  ISAAC_LOG_VA_INSTALLER_MASK_STORE = 0x00a5f48au, /* join of BOTH arms */
  ISAAC_LOG_VA_GUEST_ALLOC = 0x00a0f4c0u,

  /* The logger's own lock asserts through the logger (re-entrant edge). */
  ISAAC_LOG_VA_LOCK_ASSERT_TEST = 0x00a157feu, /* test byte [eax+4], 1 */
  ISAAC_LOG_VA_LOCK_ASSERT_SITE = 0x00a1580fu, /* call 0x00a112c0, level 0x10 */
  ISAAC_LOG_LOCK_ASSERT_STRING_VA = 0x00b81c58u,

  /* Data slots added this unit. */
  ISAAC_LOG_HOLDER_FLAGS_VA = 0x00c3795cu,  /* holder+4, bit 0 = initialised */
  ISAAC_LOG_CRITSEC_PTR_VA = 0x00c37960u,   /* holder+8 */
  ISAAC_LOG_TEARDOWN_BYTE_VA = 0x00c78aadu, /* set 1 at 0x00a714af, 0 here */
  ISAAC_LOG_IAT_CO_UNINITIALIZE = 0x00b189ecu,

  /* Lifecycle laws. */
  ISAAC_LOG_TEARDOWN_ENGAGE_VALUE = 2, /* cmp dword [0xc7de48], 2 — FULL */
  ISAAC_LOG_CRITSEC_SIZE = 0x1c,       /* alloc 0x00a15780 / free 0x00a71bd0 */
  ISAAC_LOG_HOLDER_INIT_BIT = 1,       /* bts eax,0 vs and byte ..,0xfe */
  ISAAC_LOG_HOLDER_FLAGS_CLEAR_MASK = 0xfe,
  ISAAC_LOG_SINK_ALLOC_SIZE = 0x10,    /* push 0x10 at 0x00a5f3df */
  ISAAC_LOG_SINK_STATE_NO_FILE = 2,    /* [esi+4] preset at 0x00a5f3fd */
  ISAAC_LOG_SINK_STATE_OPEN = 1,       /* overwritten iff fopen succeeded */
  ISAAC_LOG_SINK_STATE_NONE = -1,      /* modelled: no sink object at all */
  ISAAC_LOG_LOCK_ASSERT_LEVEL = 0x10,  /* push 0x10 at 0x00a1580d */

  /* Reach-site enumeration for the lifecycle roots (every call form, plus a
     raw-byte superset scan across ALL FIVE sections). */
  ISAAC_LOG_TEARDOWN_CALLSITES = 1,
  ISAAC_LOG_TEARDOWN_ADDRESS_ESCAPES = 0,
  ISAAC_LOG_INSTALLER_CALLSITES = 1,
  ISAAC_LOG_INSTALLER_ADDRESS_ESCAPES = 0,
  ISAAC_LOG_ISAAC_MAIN_CALLSITES = 1,
  ISAAC_LOG_TEARDOWN_INTERNAL_LOG_SITES = 0, /* the teardown never logs */

  /* Writer censuses (whole-.text linear decode WITH RESYNC, this unit). */
  ISAAC_LOG_GUARD_READERS = 2,
  ISAAC_LOG_GUARD_WRITERS = 4,
  ISAAC_LOG_LISTENER_PTR_READERS = 19,
  ISAAC_LOG_LISTENER_PTR_WRITERS = 6,
  ISAAC_LOG_LISTENER_PTR_NONZERO_WRITERS = 1, /* 0x00a5f478 alone */
  ISAAC_LOG_LISTENER_MASK_READERS = 2,
  ISAAC_LOG_LISTENER_MASK_WRITERS = 4,
  ISAAC_LOG_LISTENER_MASK_NONZERO_WRITERS = 1, /* 0x00a5f48a alone */
  ISAAC_LOG_CRITSEC_PTR_WRITERS = 2,
  ISAAC_LOG_HOLDER_FLAGS_WRITERS = 2, /* both BYTE `and ..,0xfe` */
  ISAAC_LOG_HOLDER_FLAGS_READERS = 0,

  /* Post-teardown reachability, CFG-measured (direct rel32 closure). */
  ISAAC_LOG_POST_TEARDOWN_FUNCTIONS = 154,
  ISAAC_LOG_POST_TEARDOWN_LOG_SITES = 15,
  ISAAC_LOG_POST_TEARDOWN_LOG_FUNCTIONS = 8,
  ISAAC_LOG_POST_TEARDOWN_FAMILY_GAME_LOGIC_EDGES = 0,
  ISAAC_LOG_POST_TEARDOWN_UNRESOLVED_IAT_CALLS = 149,
  ISAAC_LOG_POST_TEARDOWN_UNRESOLVED_REG_CALLS = 152,

  /* Re-derived whole-.text instruction count. capstone's generator halts at
     the first undecodable byte; this pass resyncs (+1 byte) and skips 469
     such bytes. Agrees with the repository-wide recorded figure; the v1
     constant above (2094686) does NOT and is left untouched for the report
     rather than silently rewritten. */
  ISAAC_LOG_TEXT_INSN_COUNT_V2 = 2094319,
  ISAAC_LOG_TEXT_UNDECODABLE_BYTES_V2 = 469
};

/* ---------- v3: init 0x00a710a0 + the D-LOG-3 proof chain ---------- */

enum {
  /* Root and caller. Address-stable: no exact ZHL match (26 of the unit's
     27 batched VAs missed; the only hit is IsaacMain, already pinned). */
  ISAAC_LOG_VA_INIT = 0x00a710a0u,
  ISAAC_LOG_VA_INIT_RET_OK = 0x00a714c8u,   /* AL = 1 */
  ISAAC_LOG_VA_INIT_RET_FAIL = 0x00a714dbu, /* AL = 0 */
  ISAAC_LOG_VA_INIT_FAIL_LABEL = 0x00a714c9u,
  ISAAC_LOG_VA_INIT_CALLER = 0x00a5f0e0u,
  ISAAC_LOG_VA_INIT_CALLSITE = 0x00a5f18cu,
  ISAAC_LOG_VA_INIT_SEH_HANDLER = 0x00b13685u,

  /* Argument capture (both stores unconditional, in this order). */
  ISAAC_LOG_VA_INIT_ARG0_STORE = 0x00a710e5u, /* mov [0xc78d98], edi (ecx) */
  ISAAC_LOG_VA_INIT_ARG1_STORE = 0x00a710ebu, /* mov [0xc78d94], esi (edx) */
  ISAAC_LOG_INIT_ARG0_VA = 0x00c78d98u,
  ISAAC_LOG_INIT_ARG1_VA = 0x00c78d94u,

  /* Gate 1: the lifecycle byte — `cmp Eb, 0`, any NONZERO value warns. */
  ISAAC_LOG_VA_INIT_LIFECYCLE_TEST = 0x00a710cbu,
  ISAAC_LOG_VA_INIT_LIFECYCLE_BRANCH = 0x00a710d2u,
  ISAAC_LOG_VA_INIT_WARN_SITE = 0x00a710dbu,
  ISAAC_LOG_VA_INIT_WARN_CLEANUP = 0x00a710e0u, /* add esp, 8 */
  ISAAC_LOG_INIT_WARN_STRING_VA = 0x00ba21f0u,
  ISAAC_LOG_INIT_WARN_STRING_LEN = 34,
  ISAAC_LOG_VA_INIT_LIFECYCLE_STORE = 0x00a714afu, /* SUCCESS ARM ONLY */

  /* The second reader of the lifecycle byte, outside the init/teardown
     pair. Evidence only — nothing here is named from it. */
  ISAAC_LOG_VA_LIFECYCLE_OTHER_READER = 0x00430c3bu,
  ISAAC_LOG_VA_LIFECYCLE_OTHER_LOG_SITE = 0x00430c4bu,
  ISAAC_LOG_LIFECYCLE_OTHER_STRING_VA = 0x00b82ee8u,

  /* The 0x40 object. */
  ISAAC_LOG_VA_INIT_OBJECT_ALLOC = 0x00a710f1u,
  ISAAC_LOG_VA_INIT_OBJECT_ALLOC_TEST = 0x00a71105u,
  ISAAC_LOG_VA_INIT_OBJECT_FAIL_LABEL = 0x00a711e2u, /* xor esi,esi */
  ISAAC_LOG_VA_INIT_OBJECT_PUBLISH = 0x00a711dau,    /* success arm only */
  ISAAC_LOG_INIT_OBJECT_VA = 0x00c7de78u,
  ISAAC_LOG_INIT_OBJECT_SIZE = 0x40,
  ISAAC_LOG_VA_INIT_OBJECT_MAGIC_STORE = 0x00a71113u,
  ISAAC_LOG_INIT_OBJECT_MAGIC = 0x7fcb9dd6, /* immediate; not construed */
  ISAAC_LOG_VA_INIT_MUTEX_VTABLE_STORE = 0x00a71122u,
  ISAAC_LOG_INIT_HOLDER_OFFSET = 0x10, /* lea ecx,[esi+0x10] @ 0x00a71198 */

  /* The devirtualised holder-init call. */
  ISAAC_LOG_VA_INIT_DEVIRT_TEST = 0x00a711a5u,     /* cmp eax, 0x00a15770 */
  ISAAC_LOG_VA_INIT_DEVIRT_DIRECT = 0x00a711acu,   /* call 0x00a15770 */
  ISAAC_LOG_VA_INIT_DEVIRT_INDIRECT = 0x00a711b3u, /* call eax */

  /* Gate 2: the inline lazy critical section — `test Eb, 1`, BIT 0 only. */
  ISAAC_LOG_VA_INIT_CRITSEC_TEST = 0x00a7139au,
  ISAAC_LOG_VA_INIT_CRITSEC_BRANCH = 0x00a713a1u, /* jne (skip) */
  ISAAC_LOG_VA_INIT_CRITSEC_ALLOC = 0x00a713a5u,
  ISAAC_LOG_VA_INIT_CRITSEC_ALLOC_TEST = 0x00a713b2u,
  ISAAC_LOG_VA_INIT_CRITSEC_FAIL_LABEL = 0x00a713c3u, /* xor esi,esi */
  ISAAC_LOG_VA_INIT_CRITSEC_TAIL = 0x00a713c5u,       /* SHARED tail */
  ISAAC_LOG_VA_INIT_CRITSEC_BTS = 0x00a713ccu,
  ISAAC_LOG_VA_INIT_CRITSEC_PTR_STORE = 0x00a713d0u,
  ISAAC_LOG_VA_INIT_CRITSEC_FLAGS_STORE = 0x00a713d6u,
  ISAAC_LOG_INIT_CRITSEC_FLAGS_VA = 0x00c5ab48u,
  ISAAC_LOG_INIT_CRITSEC_PTR_VA = 0x00c5ab4cu,
  ISAAC_LOG_INIT_CRITSEC_READY_BIT = 1,
  ISAAC_LOG_INIT_CRITSEC_ZERO_OFFSET = 0x18, /* mov byte [esi+0x18], 0 */

  /* Gate 3: the command thread — `test Eb, 1`, BIT 0 only, and it LOGS. */
  ISAAC_LOG_VA_INIT_CMD_THREAD_TEST = 0x00a713f8u,
  ISAAC_LOG_VA_INIT_CMD_THREAD_BRANCH = 0x00a713ffu, /* je (create) */
  ISAAC_LOG_VA_INIT_CMD_THREAD_WARN_SITE = 0x00a71408u,
  ISAAC_LOG_VA_INIT_CMD_THREAD_WARN_CLEANUP = 0x00a7140du,
  ISAAC_LOG_VA_INIT_CMD_THREAD_SKIP = 0x00a71410u, /* jmp 0x00a7145f */
  ISAAC_LOG_VA_INIT_CMD_THREAD_BTS = 0x00a71456u,
  ISAAC_LOG_VA_INIT_CMD_THREAD_FLAGS_STORE = 0x00a7145au,
  ISAAC_LOG_VA_INIT_CMD_THREAD_JOIN = 0x00a7145fu,
  ISAAC_LOG_INIT_CMD_THREAD_FLAGS_VA = 0x00c79a7cu,
  ISAAC_LOG_INIT_CMD_THREAD_STRING_VA = 0x00ba82b0u,
  ISAAC_LOG_INIT_CMD_THREAD_STRING_LEN = 38,
  ISAAC_LOG_INIT_CMD_THREAD_READY_BIT = 1,

  /* The three early-failure branches — measured as the COMPLETE predecessor
     set of the fail label 0x00a714c9. Each is the `je 0x00a714c9` of a
     `test al, al` pair (0x00a71289 / 0x00a71355 / 0x00a71367). */
  ISAAC_LOG_VA_INIT_FAIL_BRANCH_0 = 0x00a7128bu,
  ISAAC_LOG_VA_INIT_FAIL_BRANCH_1 = 0x00a71357u,
  ISAAC_LOG_VA_INIT_FAIL_BRANCH_2 = 0x00a71369u,
  ISAAC_LOG_INIT_FAIL_PREDECESSORS = 3,

  /* Both internal logger edges: level 0x10, `add esp, 8` -> 0 varargs. */
  ISAAC_LOG_INIT_WARN_LEVEL = 0x10,
  ISAAC_LOG_INIT_WARN_CLEANUP_IMM = 8,
  ISAAC_LOG_INIT_LOG_SITES = 2,

  /* Reach-site enumeration (every call form + raw-byte superset scan across
     ALL FIVE sections; inbound transfers into the body also counted). */
  ISAAC_LOG_INIT_CALLSITES = 1,
  ISAAC_LOG_INIT_ADDRESS_ESCAPES = 0,
  ISAAC_LOG_INIT_INBOUND_TRANSFERS = 0,
  ISAAC_LOG_INIT_INSN_COUNT = 271,
  ISAAC_LOG_INIT_UNDECODABLE_BYTES = 0,
  ISAAC_LOG_INIT_ORPHAN_BLOCKS = 0,

  /* Writer census additions (same decode configuration as v2). */
  ISAAC_LOG_LIFECYCLE_BYTE_READERS = 2,
  ISAAC_LOG_LIFECYCLE_BYTE_WRITERS = 2,
  ISAAC_LOG_INIT_ARG0_WRITERS = 1,
  ISAAC_LOG_INIT_ARG1_WRITERS = 1,

  /* ---- the D-LOG-3 proof chain, as pinned numbers ---- */
  ISAAC_LOG_VA_BOOT_LOG_SITE = 0x00931172u,   /* dominates 0x0093140e */
  ISAAC_LOG_VA_BOOT_LOG_LEVEL_PUSH = 0x00931170u, /* 6a 01 */
  ISAAC_LOG_BOOT_LOG_LEVEL = 1,
  ISAAC_LOG_BOOT_LOG_STRING_VA = 0x00b7b3f8u, /* "Command Line: \n" */
  ISAAC_LOG_BOOT_LOG_STRING_LEN = 15,
  ISAAC_LOG_VA_ISAAC_MAIN_SCOPE_TABLE = 0x00bcc178u,
  ISAAC_LOG_VA_ISAAC_MAIN_UNWIND_FUNCLET = 0x00931458u,
  ISAAC_LOG_VA_ISAAC_MAIN_EXCEPT_HANDLER = 0x00931461u,
  ISAAC_LOG_ISAAC_MAIN_SCOPE_ENTRIES = 1,
  ISAAC_LOG_ISAAC_MAIN_INSN_COUNT = 259,
  ISAAC_LOG_ISAAC_MAIN_UNDECODABLE_BYTES = 0,
  ISAAC_LOG_ISAAC_MAIN_ORPHAN_BLOCKS = 1, /* the unwind funclet, which rets */
  ISAAC_LOG_GUARD_ADDRESS_ESCAPES = 0,
  /* The guard only ever holds one of these three values: the four writers
     store the literals 1, 2, 0, 1 and nothing else can reach the cell. */
  ISAAC_LOG_GUARD_DISTINCT_VALUES = 3,
  ISAAC_LOG_TEARDOWN_CALLSITES_V3 = 1, /* re-verified, not inherited */
  ISAAC_LOG_TEXT_INSN_COUNT_V3 = 2094319,
  ISAAC_LOG_TEXT_UNDECODABLE_BYTES_V3 = 469
};

/* ---------- v4: the mutex lock 0x00a157f0 / unlock 0x00a159a0 ---------- */

enum {
  /* Roots. Address-stable: batched through identify-zhl-address.mjs with
     every other VA of this unit in ONE invocation; no exact match. */
  ISAAC_LOG_VA_LOCK = 0x00a157f0u,
  ISAAC_LOG_VA_UNLOCK = 0x00a159a0u,
  ISAAC_LOG_VA_LOCK_RET_TRUE = 0x00a15850u,  /* ret 4 after `mov al,1` */
  ISAAC_LOG_VA_LOCK_RET_FALSE = 0x00a15996u, /* ret 4 after `xor al,al` */
  ISAAC_LOG_VA_UNLOCK_RET = 0x00a159c7u,     /* plain `ret` — no stack arg */

  /* The class vtable and its five slots. */
  ISAAC_LOG_VA_MUTEX_DTOR = 0x00a156e0u,    /* vtbl + 0x0 */
  ISAAC_LOG_VA_MUTEX_DESTROY = 0x00a157c0u, /* vtbl + 0x8 */
  ISAAC_LOG_MUTEX_VTBL_SLOT_INIT = 0x04,
  ISAAC_LOG_MUTEX_VTBL_SLOT_DESTROY = 0x08,
  ISAAC_LOG_MUTEX_VTBL_SLOT_LOCK = 0x0c,
  ISAAC_LOG_MUTEX_VTBL_SLOT_UNLOCK = 0x10,
  ISAAC_LOG_VA_VTBL_LOCK_ENTRY = 0x00b81c18u,   /* 0x00b81c0c + 0xc */
  ISAAC_LOG_VA_VTBL_UNLOCK_ENTRY = 0x00b81c1cu, /* 0x00b81c0c + 0x10 */
  ISAAC_LOG_MUTEX_VTABLE_SLOTS = 5,

  /* Holder layout (both the .data instances and the embedded ones). */
  ISAAC_LOG_HOLDER_VTABLE_OFFSET = 0x00,
  ISAAC_LOG_HOLDER_FLAGS_OFFSET = 0x04,
  ISAAC_LOG_HOLDER_CRITSEC_OFFSET = 0x08,
  ISAAC_LOG_HOLDER_LOAD_TIME_FLAGS = 0, /* file-backed at 0x00c3795c */
  ISAAC_LOG_HOLDER_LOAD_TIME_CRITSEC = 0,

  /* The shared assert guard (two instances, this is a NEW template). */
  ISAAC_LOG_VA_LOCK_ASSERT_TEST_V4 = 0x00a157feu,
  ISAAC_LOG_VA_LOCK_ASSERT_BRANCH = 0x00a15806u,   /* jne 0x00a1581b */
  ISAAC_LOG_VA_LOCK_ASSERT_SKIP = 0x00a1581bu,
  ISAAC_LOG_VA_LOCK_ASSERT_CLEANUP = 0x00a15818u,  /* add esp, 8 */
  ISAAC_LOG_VA_UNLOCK_ASSERT_TEST = 0x00a159a3u,
  ISAAC_LOG_VA_UNLOCK_ASSERT_BRANCH = 0x00a159a7u, /* jne 0x00a159b8 */
  ISAAC_LOG_VA_UNLOCK_ASSERT_SITE = 0x00a159b0u,   /* call 0x00a112c0 */
  ISAAC_LOG_VA_UNLOCK_ASSERT_SKIP = 0x00a159b8u,
  ISAAC_LOG_VA_UNLOCK_ASSERT_CLEANUP = 0x00a159b5u,
  ISAAC_LOG_UNLOCK_ASSERT_STRING_VA = 0x00b81c20u,
  ISAAC_LOG_LOCK_ASSERT_STRING_LEN = 50,
  ISAAC_LOG_UNLOCK_ASSERT_STRING_LEN = 52,
  ISAAC_LOG_LOCK_ASSERT_CLEANUP_IMM = 8, /* -> 0 vararg dwords, v1 law */
  ISAAC_LOG_LOCK_READY_BIT = 1,          /* imm8 of the `F6 /0 ib` */
  ISAAC_LOG_VA_LOCK_THIS_SPILL = 0x00a15802u,  /* mov [esp+0x10], eax */
  ISAAC_LOG_VA_LOCK_THIS_RELOAD = 0x00a15814u, /* mov eax, [esp+0x18] */

  /* The timeout discriminator. */
  ISAAC_LOG_VA_LOCK_TIMEOUT_TEST = 0x00a1581bu,   /* cmp dword [ebp+8],-1 */
  ISAAC_LOG_VA_LOCK_TIMEOUT_BRANCH = 0x00a1581fu, /* jne 0x00a15853 */
  ISAAC_LOG_VA_LOCK_TIMED_ENTRY = 0x00a15853u,
  ISAAC_LOG_VA_LOCK_ZERO_TEST = 0x00a158bfu,   /* cmp dword [ebp+8], 0 */
  ISAAC_LOG_VA_LOCK_ZERO_BRANCH = 0x00a158cbu, /* jbe — UNSIGNED */
  ISAAC_LOG_LOCK_TIMEOUT_INFINITE = 0xffffffffu,
  ISAAC_LOG_LOCK_ARM_INFINITE = 0,
  ISAAC_LOG_LOCK_ARM_ZERO_TIMEOUT = 1,
  ISAAC_LOG_LOCK_ARM_TIMED = 2,

  /* The INFINITE arm and its spin loop. */
  ISAAC_LOG_VA_LOCK_CRITSEC_READ = 0x00a15821u,  /* mov esi,[eax+8] ONCE */
  ISAAC_LOG_VA_LOCK_ENTER_CALL = 0x00a15825u,
  ISAAC_LOG_VA_LOCK_OWNED_TEST = 0x00a1582bu,   /* cmp byte [esi+0x18],0 */
  ISAAC_LOG_VA_LOCK_SLEEP_PTR_LOAD = 0x00a15831u, /* HOISTED out of loop */
  ISAAC_LOG_VA_LOCK_SPIN_HEAD = 0x00a15837u,    /* push 0x3e8 */
  ISAAC_LOG_VA_LOCK_SPIN_SLEEP = 0x00a1583cu,   /* call edi */
  ISAAC_LOG_VA_LOCK_SPIN_RETEST = 0x00a1583eu,
  ISAAC_LOG_VA_LOCK_SPIN_BACK_EDGE = 0x00a15842u,
  ISAAC_LOG_VA_LOCK_OWNED_STORE = 0x00a15844u,  /* INFINITE arm ONLY */
  ISAAC_LOG_VA_LOCK_SUCCESS = 0x00a15848u,      /* mov al, 1 */
  ISAAC_LOG_LOCK_SPIN_SLEEP_MS = 0x3e8,
  ISAAC_LOG_LOCK_OWNED_VALUE = 1,
  ISAAC_LOG_LOCK_SPIN_NEVER_RETURNS = 0xffffffffu, /* iteration sentinel */

  /* The timed retry loop. */
  ISAAC_LOG_VA_LOCK_RETRY_HEAD = 0x00a158d1u,   /* reloads `this` */
  ISAAC_LOG_VA_LOCK_TIMED_CRITSEC_READ = 0x00a158d5u, /* re-read per iter */
  ISAAC_LOG_VA_LOCK_TRY_CALL = 0x00a158d9u,
  ISAAC_LOG_VA_LOCK_TRY_TEST = 0x00a158dfu,     /* test eax,eax ; setne cl */
  ISAAC_LOG_VA_LOCK_TRY_OWNED_TEST = 0x00a158e8u,
  ISAAC_LOG_VA_LOCK_GIVEBACK_LEAVE = 0x00a158efu,
  ISAAC_LOG_VA_LOCK_TRY_JOIN = 0x00a158f7u,     /* test cl, cl */
  ISAAC_LOG_VA_LOCK_TIMED_SUCCESS_BRANCH = 0x00a158f9u, /* jne 0x00a15848 */
  ISAAC_LOG_VA_LOCK_RETRY_SLEEP = 0x00a158ffu,  /* push 0xa */
  ISAAC_LOG_VA_LOCK_NOW_READ = 0x00a15907u,     /* per-iteration clock */
  ISAAC_LOG_VA_LOCK_ELAPSED_SUB = 0x00a15973u,
  ISAAC_LOG_VA_LOCK_ELAPSED_HI_TEST = 0x00a1597bu, /* test edx,edx */
  ISAAC_LOG_VA_LOCK_ELAPSED_DEAD_JB = 0x00a1597du, /* CF is always 0 */
  ISAAC_LOG_VA_LOCK_ELAPSED_HI_JA = 0x00a15983u,
  ISAAC_LOG_VA_LOCK_ELAPSED_LO_CMP = 0x00a15985u,
  ISAAC_LOG_VA_LOCK_ELAPSED_LO_JB = 0x00a15988u,  /* UNSIGNED */
  ISAAC_LOG_VA_LOCK_FAIL = 0x00a1598eu,
  ISAAC_LOG_LOCK_RETRY_SLEEP_MS = 0xa,
  ISAAC_LOG_LOCK_TRY_ARM_SUCCESS = 0,
  ISAAC_LOG_LOCK_TRY_ARM_LEAVE_AND_SLEEP = 1,
  ISAAC_LOG_LOCK_TRY_ARM_SLEEP = 2,

  /* The clock and its unit conversion. */
  ISAAC_LOG_VA_LOCK_CLOCK = 0x00a68490u,
  ISAAC_LOG_IAT_QPC = 0x00b18238u,
  ISAAC_LOG_IAT_QPF = 0x00b18234u,
  ISAAC_LOG_IAT_TRY_ENTER_CRITICAL_SECTION = 0x00b1826cu,
  ISAAC_LOG_VA_CLOCK_NS_SCALE = 0x00baa8b0u, /* double 1.0e9 */
  ISAAC_LOG_LOCK_MS_DIVISOR = 1000000u,
  ISAAC_LOG_LOCK_MS_MAGIC_LO = 0xd7b634dbu,
  ISAAC_LOG_LOCK_MS_MAGIC_HI = 0x431bde82u,
  ISAAC_LOG_LOCK_MS_SHIFT = 0x12, /* shrd/shr, on top of the implicit 64 */

  /* The unlock. */
  ISAAC_LOG_VA_UNLOCK_CRITSEC_READ = 0x00a159b8u,
  ISAAC_LOG_VA_UNLOCK_OWNED_STORE = 0x00a159bcu, /* BEFORE the API call */
  ISAAC_LOG_VA_UNLOCK_LEAVE_CALL = 0x00a159c0u,

  /* Reach-site enumeration — every call form, plus a raw-byte superset scan
     across ALL FIVE sections. Decode config == v2/v3 (see the header
     comment); reproduces 2094319 / 469 and the 3286-site logger control. */
  ISAAC_LOG_LOCK_DIRECT_CALLSITES = 0,
  ISAAC_LOG_UNLOCK_DIRECT_CALLSITES = 0,
  ISAAC_LOG_LOCK_TAIL_JUMPS = 0,
  ISAAC_LOG_UNLOCK_TAIL_JUMPS = 0,
  ISAAC_LOG_LOCK_IMMEDIATE_SITES = 0,   /* no register-held form possible */
  ISAAC_LOG_UNLOCK_IMMEDIATE_SITES = 0,
  ISAAC_LOG_LOCK_RAW_OCCURRENCES = 1,   /* the vtable slot itself */
  ISAAC_LOG_UNLOCK_RAW_OCCURRENCES = 1,
  ISAAC_LOG_MUTEX_VTABLE_RAW_OCCURRENCES = 41,
  ISAAC_LOG_MUTEX_VTABLE_TEXT_STORES = 37,
  ISAAC_LOG_MUTEX_VTABLE_DATA_INSTANCES = 4,
  ISAAC_LOG_MUTEX_GLOBAL_DISPATCH_SITES = 32, /* 16 lock/unlock pairs */
  ISAAC_LOG_MUTEX_GLOBAL_LOCK_SITES = 16,
  ISAAC_LOG_MUTEX_GLOBAL_INFINITE_SITES = 16, /* every one pushes -1 */
  ISAAC_LOG_MUTEX_GLOBAL_FINITE_SITES = 0,
  ISAAC_LOG_HOLDER_FLAGS_INDIRECT_READERS = 2, /* 0x00a157fe, 0x00a159a3 */
  ISAAC_LOG_TEXT_INSN_COUNT_V4 = 2094319,
  ISAAC_LOG_TEXT_UNDECODABLE_BYTES_V4 = 469,

  /* Identity pass, batched in ONE invocation over every VA of this unit.
     26 of 27 have no exact ZHL match and stay address-stable; the only hit
     is 0x00931050 = IsaacMain (28 pattern bytes), already pinned at v3. */
  ISAAC_LOG_V4_BATCHED_VAS = 27,
  ISAAC_LOG_V4_EXACT_ZHL_MATCHES = 1,

  /* Template census: the predicate is shared, the bodies are not. */
  ISAAC_LOG_READY_BIT_PREDICATE_SITES = 5,
  ISAAC_LOG_LAZY_INIT_TEMPLATE_INSTANCES = 2,   /* 0x00a1577a, 0x00a7139a */
  ISAAC_LOG_LAZY_INIT_TEMPLATE_INSNS = 18,
  ISAAC_LOG_ASSERT_GUARD_TEMPLATE_INSTANCES = 2 /* 0x00a157fe, 0x00a159a3 */
};

/* ============ v5: the mutex DESTROY template, and the ready bit ==========

   Targets: 0x00a157c0 (vtbl+0x8) and 0x00a15730, plus 0x00a156e0 (vtbl+0x0)
   which the byte diff proves is the SAME template. All three were open:
   v4 recorded only their VAs as constants; no destroy body was modelled and
   no destroy behaviour was asserted anywhere in the family.

   Decode configuration is identical to v2/v3/v4 — capstone 5.0.7,
   CS_MODE_32, linear from the .text RAW START with a resync loop that skips
   one byte per undecodable position. Reproduces 2094319 instructions / 469
   undecodable bytes exactly. Every VA -> file offset went through the PE
   SECTION TABLE read out of the image (5 sections; .text raw 0x00000400,
   .rdata 0x00716600, .data 0x007f6000, .rsrc 0x0085fe00, .reloc 0x00863a00).

   ---- 0x00a157c0, __thiscall(this = ecx), plain `ret`, 43 bytes ----

   0x00a157c0  push esi
   0x00a157c1  mov esi, ecx                 ; this
   0x00a157c3  push edi
   0x00a157c4  mov edi, [esi+8]             ; the CRITICAL_SECTION*
   0x00a157c7  test edi, edi                ; FULL 32-bit, not a byte test
   0x00a157c9  je 0x00a157e4                ; NULL -> straight to the CLEAR
   0x00a157cb  push edi
   0x00a157cc  call [0x00b18274]            ; HOST DeleteCriticalSection
   0x00a157d2  push 0x1c
   0x00a157d4  push edi
   0x00a157d5  call 0x00aef15c              ; HOST operator delete(p, 0x1c)
   0x00a157da  add esp, 8
   0x00a157dd  mov dword [esi+8], 0         ; non-NULL arm ONLY
   0x00a157e4  and byte [esi+4], 0xfe       ; <== the READY BIT is CLEARED
   0x00a157e8  pop edi
   0x00a157e9  pop esi
   0x00a157ea  ret                          ; no stack argument

   Two things the shape makes easy to get wrong and are pinned below:
   * the clear at 0x00a157e4 is the `je` TARGET, so it runs on BOTH arms —
     destroy is NULL-safe and idempotent;
   * it is a BYTE `and` with 0xfe, so bits 8..31 of the flags cell survive.
     Kept distinct in the corpus from the sibling DWORD form
     `and dword [0x00c37968], 0xfffffffe` at 0x00a71ba5 (a different holder).

   `0x00aef15c` is `push [ebp+8] ; call 0x00a0f500 ; pop ecx ; ret` — the
   size operand 0x1c is pushed and then DISCARDED by the callee. Both
   0x00a0f500 (free) and 0x00a0f4c0 (new) tail into the shared allocator
   wrapper 0x00a648b0. DeleteCriticalSection (KERNEL32, IAT 0x00b18274) and
   the raw free stay PLATFORM PRIMITIVES under the standing decisions; every
   decision around them is translated.

   ---- the template: five instances, two shapes ----

   Byte diff, measured, not assumed:
     0x00a157c0 (43 B) vs 0x00a15730 (55 B): 41 bytes EQUAL, 2 replaced
       (the low half of the `call 0x00aef15c` rel32 — forced by PC-relative
       encoding to the same callee), 12 inserted = exactly the two 6-byte
       vtable stores `c7 06 0c 1c b8 00` and `c7 06 b4 04 ba 00`.
     0x00a15730 (55 B) vs 0x00a156e0 (80 B): 52 of 55 bytes EQUAL. The three
       replaced positions are the forced rel32 byte, `pop edi` -> the
       delete-flag test, and `ret` -> `pop ebp ; ret 4`; the insertions are
       the 3-byte ebp prologue and the 16-byte delete-flag arm.
   That is one template with per-instance deltas, not two near-identical
   siblings merged on assumption.

     variant 0  0x00a157c0  vtbl+0x8   no vptr stores, plain ret
     variant 1  0x00a15730  (no slot)  vptr in on entry, base vptr on exit
     variant 2  0x00a156e0  vtbl+0x0   variant 1 + ebp frame + delete flag
     variant 3  0x00a71bbf  inlined    absolute on the LOGGER holder, NO vptr
     variant 4  0x00b16b20  inlined    absolute on the LOGGER holder, vptrs

   Whole-.text structural census of the template (a `call [0x00b18274]`
   followed within three instructions by `push 0x1c ; push reg ;
   call 0x00aef15c`, and a `and ..., 0xfe` within 14): 37 DeleteCriticalSection
   sites, of which 27 are template instances — the 3 out-of-line bodies plus
   24 inlined at member offsets +0x4/+0xc/+0x14/+0x18/+0x1c/+0x20/+0x28/
   +0x2c/+0xa4. Exactly 2 of the 27 operate on the logger holder 0x00c37958.

   ---- REACH CENSUS (rule 10), every channel, all five sections ----

   Channels enumerated per target: direct `call rel32`; `jmp rel32`/`rel8`
   (tail entry); every Jcc; `push imm32`; `mov reg,imm32` (the register-held
   `call reg` precursor); ANY decoded instruction carrying the VA as a
   literal; a raw little-endian dword scan over .text/.rdata/.data/.rsrc/
   .reloc; base-relocation HIGHLOW entries (180939 of them) pointing at such
   a dword; and inbound transfers into the BODY INTERIOR rather than entry.

     0x00a157c0  call 0  jmp 0  jcc 0  imm 0  raw 1 (.rdata 0x00b81c14,
                 relocated — the vtable slot) inbound 0
     0x00a156e0  call 0  jmp 0  jcc 0  imm 0  raw 1 (.rdata 0x00b81c0c)
                 inbound 0
     0x00a15730  call 0  jmp 10 jcc 0  imm 0  raw 0                inbound 0

   0x00a15730 IS REFERENCED. The inherited v4 claim of "zero references of
   any kind" enumerated direct calls and raw dwords only, and structurally
   could not see the `jmp rel32` channel — the exact rule-10 failure mode.
   All ten are `E9` tail entries, each re-decoded from an independent local
   anchor (two of them sit in bands the whole-file linear pass resyncs
   through, and both re-anchor clean):

     0x00af0d76  0x00b0bd2a  0x00b118e5  0x00b12134  0x00b13655
     0x00b14071  0x00b14087  0x00b1409d      -- 8 frame funclets, of the form
                                                `mov ecx,[ebp±N] ; add ecx,K
                                                 ; jmp 0x00a15730`
     0x00b11739  0x00b123f9  -- 2 absolute thunks, `mov ecx,<global> ; jmp`,
                                for the statics 0x00c57b2c and 0x00c5ab20

   Each of the ten thunk entry points has exactly one raw dword reference, in
   .rdata, inside an MSVC unwind/action table. So 0x00a15730 is live code
   reached during exception unwinding and static destruction, not linker
   residue. Its constant-folded twin 0x00b16b20 — the same template with
   `this` folded to the literal 0x00c37958 — is registered with atexit by
   `0x00402080 push 0x00b16b20 ; call 0x00aef5af`.

   ---- THE READY-BIT LIFECYCLE, END TO END ----

   The cell is holder+4, bit 0 of its LOW byte. For the logger's holder
   0x00c3795c the whole-.text census is:

     SET    : 1 site — 0x00a157ad `mov [edi+4], al` after `bts eax,0` at
              0x00a157a6, inside 0x00a15770, reached with ecx = 0x00c37958
              from the single devirtualized `call 0x00a15770` at 0x00a11332.
              There is NO absolute setter; the store is indirect.
     READ   : 2 indirect sites — 0x00a157fe (lock) and 0x00a159a3 (unlock),
              both `F6 /0 ib` bit 0 of the low byte.
     CLEAR  : exactly 2 absolute sites — 0x00a71be5 (the v2 teardown's
              inlined destroy, variant 3) and 0x00b16b51 (the atexit static
              destructor 0x00b16b20, variant 4). No others touch 0x00c3795c.

   Reachable states of (ready bit, critsec ptr):
     S0 DOWN   (0, NULL)  the image-initial state; also the post-destroy state
     S1 LIVE   (1, p)     alloc + InitializeCriticalSection succeeded
     S2 FAILED (1, NULL)  D-LOG-6: allocation failed, bit published anyway
     (0, non-NULL) is UNREACHABLE sequentially: the only writer of a non-NULL
     critsec is 0x00a157aa, whose very next instruction 0x00a157ad sets the
     bit with no branch between them; and every clear is either preceded by
     `mov [this+8], 0` or reached by a `je` that proved the pointer already 0.

   Destroy-then-lock DOES reach the NULL dereference. The assert arm is not
   an early return: 0x00a15806 `jne 0x00a1581b` skips the log call, and the
   fall-through path re-loads `this` at 0x00a15814, pops the two arguments at
   0x00a15818, and CONTINUES INTO 0x00a1581b. So from S0 a lock emits the
   assert and then performs exactly the same NULL-derived access D-LOG-6
   produces from S2. D-LOG-6 and destroy differ only in the diagnostic:
   D-LOG-6 leaves the bit SET and so DISARMS the assert; destroy CLEARS it
   and so RE-ARMS it. The fault itself is identical and unavoidable on both.

   Note for the reader of the v4 contract: `isaac_log_lock_null_critsec_reached`
   is scoped to D-LOG-6 — it additionally requires the ready bit — so it
   reports 0 for the post-destroy state S0. The v5 export
   `isaac_log_lock_null_deref_reached` is the unconditional control-flow fact.
   Both are kept and a cross-helper assertion pins where they diverge.

   ---- new original-binary defects, REPRODUCED and never corrected ----

   D-LOG-9. The destroy deletes and FREES the critical section BEFORE it
   clears the ready bit, and takes no lock while doing so. Over the six
   instructions 0x00a157cc..0x00a157e4 the holder still advertises ready = 1
   while [this+8] is a dangling pointer to freed memory, so a concurrent
   0x00a157f0 passes the assert at 0x00a157fe and calls EnterCriticalSection
   on a deleted section. The correct order would be clear-then-free.

   D-LOG-10. The logger's two destroy sites disagree about the vptr, so the
   same object has two different post-destruction failure modes. Variant 3
   (0x00a71bbf, the teardown) leaves [0x00c37958] = 0x00b81c0c, so a later
   virtual lock still dispatches to 0x00a157f0 and hits D-LOG-9's successor
   state S0. Variant 4 (0x00b16b20, the atexit destructor) stores the base
   vtable 0x00ba04b4, whose +0xc and +0x10 slots are both 0x00af05d3
   (_purecall), so the same call lands in _purecall instead. Neither is
   reachable from the shipped logger path — the v2 teardown pins the guard to
   1 at 0x00a71bec and the v1 level gate then blocks all 3286 sites — but the
   asymmetry is a property of the image and is modelled, not smoothed over.

   Identity pass: every VA of this unit was batched through
   identify-zhl-address.mjs in ONE invocation. No exact ZHL signature match
   for any of them; all stay address-stable. RTTI recorded as evidence only
   and NOT promoted to a name (rule 3): the type descriptor behind
   0x00b81c08 is ".?AVMutex@KAGE@@" and behind 0x00ba04b0 is
   ".?AVMutexBase@KAGE@@".                                                  */

enum {
  /* The three out-of-line bodies and their extents. */
  ISAAC_LOG_VA_MUTEX_UNWIND_DESTROY = 0x00a15730u,
  ISAAC_LOG_VA_MUTEX_DESTROY_END = 0x00a157ebu,
  ISAAC_LOG_VA_MUTEX_UNWIND_DESTROY_END = 0x00a15767u,
  ISAAC_LOG_VA_MUTEX_DTOR_END = 0x00a15730u, /* `ret 4` at 0x00a1572d */
  ISAAC_LOG_VA_VTBL_DTOR_ENTRY = 0x00b81c0cu,    /* 0x00b81c0c + 0x0 */
  ISAAC_LOG_VA_VTBL_DESTROY_ENTRY = 0x00b81c14u, /* 0x00b81c0c + 0x8 */
  ISAAC_LOG_MUTEX_VTBL_SLOT_DTOR = 0x00,
  ISAAC_LOG_VA_MUTEX_BASE_VTABLE = 0x00ba04b4u,
  ISAAC_LOG_VA_MUTEX_BASE_PURECALL = 0x00af05d3u, /* base +0xc and +0x10 */

  /* Instruction VAs of variant 0, the canonical body. */
  ISAAC_LOG_VA_DESTROY_CRITSEC_READ = 0x00a157c4u,
  ISAAC_LOG_VA_DESTROY_CRITSEC_TEST = 0x00a157c7u,  /* test edi,edi — 32-bit */
  ISAAC_LOG_VA_DESTROY_CRITSEC_BRANCH = 0x00a157c9u,
  ISAAC_LOG_VA_DESTROY_DELETE_CALL = 0x00a157ccu,
  ISAAC_LOG_VA_DESTROY_FREE_CALL = 0x00a157d5u,
  ISAAC_LOG_VA_DESTROY_NULL_STORE = 0x00a157ddu,
  ISAAC_LOG_VA_DESTROY_CLEAR = 0x00a157e4u,         /* also the je target */
  ISAAC_LOG_VA_DESTROY_RET = 0x00a157eau,

  /* Instruction VAs unique to variant 2, the scalar-deleting dtor. */
  ISAAC_LOG_VA_DTOR_ENTRY_VTABLE_STORE = 0x00a156eau,
  ISAAC_LOG_VA_DTOR_CLEAR = 0x00a1570du,
  ISAAC_LOG_VA_DTOR_DELETE_FLAG_TEST = 0x00a15711u, /* test byte [ebp+8],1 */
  ISAAC_LOG_VA_DTOR_EXIT_VTABLE_STORE = 0x00a15715u,/* BETWEEN test and jcc */
  ISAAC_LOG_VA_DTOR_DELETE_FLAG_BRANCH = 0x00a1571bu,
  ISAAC_LOG_VA_DTOR_OBJECT_FREE_CALL = 0x00a15720u,
  ISAAC_LOG_VA_DTOR_RET = 0x00a1572du,              /* ret 4 */

  /* Instruction VAs unique to variant 1. */
  ISAAC_LOG_VA_UNWIND_ENTRY_VTABLE_STORE = 0x00a15737u,
  ISAAC_LOG_VA_UNWIND_CLEAR = 0x00a1575au,
  ISAAC_LOG_VA_UNWIND_EXIT_VTABLE_STORE = 0x00a1575fu,
  ISAAC_LOG_VA_UNWIND_RET = 0x00a15766u,

  /* The two inlined instances that operate on the LOGGER holder. */
  ISAAC_LOG_VA_TEARDOWN_INLINE_DESTROY = 0x00a71bbfu,
  ISAAC_LOG_VA_TEARDOWN_DELETE_CALL = 0x00a71bcau,
  ISAAC_LOG_VA_TEARDOWN_CLEAR = 0x00a71be5u,
  /* 0x00b16b20 itself is ISAAC_LOG_VA_STATIC_DTOR, pinned since v2. */
  ISAAC_LOG_VA_STATIC_DTOR_DELETE_CALL = 0x00b16b36u,
  ISAAC_LOG_VA_STATIC_DTOR_CLEAR = 0x00b16b51u,
  ISAAC_LOG_VA_STATIC_DTOR_ATEXIT_SITE = 0x00402080u,
  ISAAC_LOG_VA_ATEXIT = 0x00aef5afu,

  /* Callees of the destroy path (the DeleteCriticalSection IAT slot is
     ISAAC_LOG_IAT_DELETE_CRITICAL_SECTION, pinned since v2). */
  ISAAC_LOG_VA_RAW_FREE = 0x00a0f500u,
  ISAAC_LOG_VA_SHARED_ALLOCATOR = 0x00a648b0u,
  ISAAC_LOG_MUTEX_CRITSEC_SIZE = 0x1c,
  ISAAC_LOG_MUTEX_OBJECT_SIZE = 0x0c, /* `push 0xc` at 0x00a1571d */
  ISAAC_LOG_MUTEX_OWNED_OFFSET = 0x18,
  ISAAC_LOG_MUTEX_DTOR_DELETE_BIT = 1,

  /* Variants. */
  ISAAC_LOG_DESTROY_VARIANT_DESTROY = 0,   /* 0x00a157c0 */
  ISAAC_LOG_DESTROY_VARIANT_UNWIND = 1,    /* 0x00a15730 */
  ISAAC_LOG_DESTROY_VARIANT_DTOR = 2,      /* 0x00a156e0 */
  ISAAC_LOG_DESTROY_VARIANT_TEARDOWN = 3,  /* 0x00a71bbf, inlined */
  ISAAC_LOG_DESTROY_VARIANT_STATIC = 4,    /* 0x00b16b20, inlined */
  ISAAC_LOG_DESTROY_VARIANTS = 5,

  /* Ordered typed host actions. */
  ISAAC_LOG_DESTROY_ACTION_NONE = 0,
  ISAAC_LOG_DESTROY_ACTION_STORE_ENTRY_VTABLE = 1,
  ISAAC_LOG_DESTROY_ACTION_DELETE_CRITICAL_SECTION = 2, /* platform */
  ISAAC_LOG_DESTROY_ACTION_FREE_CRITSEC = 3,            /* platform */
  ISAAC_LOG_DESTROY_ACTION_STORE_NULL_CRITSEC = 4,
  ISAAC_LOG_DESTROY_ACTION_CLEAR_READY_BIT = 5,
  ISAAC_LOG_DESTROY_ACTION_STORE_EXIT_VTABLE = 6,
  ISAAC_LOG_DESTROY_ACTION_FREE_OBJECT = 7,             /* platform */
  ISAAC_LOG_DESTROY_ACTION_MAX = 7,
  ISAAC_LOG_DESTROY_ACTIONS_MAX = 7,

  /* Ready-bit state codes. */
  ISAAC_LOG_READY_STATE_DOWN = 0,       /* (0, NULL) */
  ISAAC_LOG_READY_STATE_LIVE = 1,       /* (1, p)    */
  ISAAC_LOG_READY_STATE_FAILED = 2,     /* (1, NULL) — D-LOG-6 */
  ISAAC_LOG_READY_STATE_IMPOSSIBLE = 3, /* (0, p)    — unreachable */
  ISAAC_LOG_READY_STATES_REACHABLE = 3,

  /* Byte-diff evidence for the one-template claim. */
  ISAAC_LOG_DESTROY_BODY_BYTES = 43,
  ISAAC_LOG_UNWIND_DESTROY_BODY_BYTES = 55,
  ISAAC_LOG_DTOR_BODY_BYTES = 80,
  ISAAC_LOG_DESTROY_SHARED_BYTES_0_1 = 41,
  ISAAC_LOG_DESTROY_SHARED_BYTES_1_2 = 52,
  ISAAC_LOG_DESTROY_SHARED_BYTES_0_2 = 40,
  ISAAC_LOG_DESTROY_VTABLE_STORE_BYTES = 6,
  ISAAC_LOG_DESTROY_FORCED_REL32_DELTA_BYTES = 2, /* same callee, PC-rel */

  /* Reach census (rule 10). Channel indices for the accessor. */
  ISAAC_LOG_REACH_CHANNEL_DIRECT_CALL = 0,
  ISAAC_LOG_REACH_CHANNEL_TAIL_JUMP = 1,
  ISAAC_LOG_REACH_CHANNEL_JCC = 2,
  ISAAC_LOG_REACH_CHANNEL_PUSH_IMM = 3,
  ISAAC_LOG_REACH_CHANNEL_MOV_IMM = 4,
  ISAAC_LOG_REACH_CHANNEL_RAW_DWORD = 5,
  ISAAC_LOG_REACH_CHANNEL_INBOUND_INTERIOR = 6,
  ISAAC_LOG_REACH_CHANNELS = 7,

  ISAAC_LOG_DESTROY_DIRECT_CALLSITES = 0,
  ISAAC_LOG_DESTROY_TAIL_JUMPS = 0,
  ISAAC_LOG_DESTROY_RAW_OCCURRENCES = 1,
  ISAAC_LOG_DTOR_DIRECT_CALLSITES = 0,
  ISAAC_LOG_DTOR_TAIL_JUMPS = 0,
  ISAAC_LOG_DTOR_RAW_OCCURRENCES = 1,
  ISAAC_LOG_UNWIND_DESTROY_DIRECT_CALLSITES = 0,
  ISAAC_LOG_UNWIND_DESTROY_TAIL_JUMPS = 10,
  ISAAC_LOG_UNWIND_DESTROY_RAW_OCCURRENCES = 0,
  ISAAC_LOG_UNWIND_DESTROY_FRAME_FUNCLETS = 8,
  ISAAC_LOG_UNWIND_DESTROY_ABSOLUTE_THUNKS = 2,
  ISAAC_LOG_UNWIND_DESTROY_REACH_V4_REPORTED = 0, /* superseded */
  ISAAC_LOG_BASE_RELOCATIONS_HIGHLOW = 180939,

  /* Structural template census over the whole .text. */
  ISAAC_LOG_DELETE_CRITICAL_SECTION_SITES = 37,
  ISAAC_LOG_DESTROY_TEMPLATE_INSTANCES = 27,
  ISAAC_LOG_DESTROY_TEMPLATE_OUT_OF_LINE = 3,
  ISAAC_LOG_DESTROY_TEMPLATE_INLINED = 24,
  ISAAC_LOG_HOLDER_DESTROY_SITES = 2,

  /* The ready-bit writer census, bounded to 0x00c3795c. */
  ISAAC_LOG_HOLDER_READY_BIT_SETTERS = 1,
  ISAAC_LOG_HOLDER_READY_BIT_CLEARERS = 2,
  ISAAC_LOG_HOLDER_READY_BIT_ABSOLUTE_SETTERS = 0,
  ISAAC_LOG_VA_HOLDER_READY_BIT_SET = 0x00a157adu,

  /* D-LOG-9, the dangling window of variant 0. */
  ISAAC_LOG_DESTROY_DANGLING_WINDOW_INSNS = 6,

  ISAAC_LOG_TEXT_INSN_COUNT_V5 = 2094319,
  ISAAC_LOG_TEXT_UNDECODABLE_BYTES_V5 = 469,
  ISAAC_LOG_V5_BATCHED_VAS = 8,
  ISAAC_LOG_V5_EXACT_ZHL_MATCHES = 0
};

/* ============ v6: the listener-write shim 0x00a83fd0 (sink vtbl+0x1c) =====

   Target (open at ABI 5: recorded as a HOST fwrite/fflush action, body not
   modelled). identify-zhl-address.mjs batched in ONE invocation over the
   ten VAs of this unit; ZERO exact ZHL matches; all stay address-stable.

     0x00a83fd0  sink write, __thiscall(this = ecx), `ret 0xc` (3 stack
                 args). .text raw offset 0x006833d0. Body 0x00a83fd0..
                 0x00a84022 (82 bytes, 32 instructions, two `ret 0xc`,
                 then int3 padding). Linear decode, ZERO resyncs.
     0x00ba5184  the sink vtable. Slot +0x1c (file 0x00ba51a0) HOLDS
                 0x00a83fd0. Slot +0x20 HOLDS 0x0040c200 (`ret 0` — a
                 no-op). Slot +0x0 HOLDS the deleting dtor 0x00a83fa0.
     [0x00b188cc] api-ms-win-crt-stdio-l1-1-0.dll!fwrite  (import dir)
     [0x00b1891c] api-ms-win-crt-stdio-l1-1-0.dll!fflush
     [0x00b188fc] api-ms-win-crt-stdio-l1-1-0.dll!fopen   (installer only)

   Empty call/jmp/jcc/push/mov-imm lists for the VA itself are CORRECT and
   were re-verified, not inherited: the little-endian dword 0x00a83fd0
   occurs ONCE in the whole image, at vtable+0x1c in .rdata. Nobody
   `e8`-calls this body. The logger reaches it by

     0x00a11433  mov esi, [eax+0x1c]     ; eax = *[listener]
     0x00a1144a  push 1                  ; size
     0x00a1144c  push 0x00c7b648         ; buf
     0x00a11451  call esi                ; after `push edx` of strlen

   That is one indirect dispatch through the slot, not a direct call, which
   is why a VA-immediate census is empty. Do not read the empty list as
   "unreferenced".

   ---- exact control flow (whole body, this unit) ----

   0x00a83fd0  push ebp / mov ebp,esp / push ebx / push edi
   0x00a83fd5  mov edi, ecx                    ; this
   0x00a83fd7  cmp dword [edi+4], 1            ; 83 7f 04 01 — Grp1 Ev,Ib:
                                               ; FULL 32-bit == 1. No 0x66
                                               ; prefix, not a byte compare.
                                               ; 0x101 does NOT take the
                                               ; write arm.
   0x00a83fdb  je 0xa83ff3                     ; open -> fwrite path
   0x00a83fdd  push dword [edi+0xc]            ; FILE*, NEVER null-tested
   0x00a83fe0  xor ebx, ebx                    ; skip-arm return = 0
   0x00a83fe2  call [0x00b1891c]               ; HOST fflush
   0x00a83fe8  add esp, 4
   0x00a83feb  mov eax, ebx                    ; EAX = 0
   0x00a83ff0  ret 0xc

   0x00a83ff3  push dword [edi+0xc]            ; FILE*
   0x00a83ff6  push dword [ebp+0x10]           ; nmemb  (logger: strlen)
   0x00a83ff9  push dword [ebp+0xc]            ; size   (logger: 1)
   0x00a83ffc  push dword [ebp+8]              ; ptr    (logger: buffer)
   0x00a83fff  call [0x00b188cc]               ; HOST fwrite
   0x00a84005  add esp, 0x10
   0x00a84008  mov ebx, eax                    ; items written
   0x00a8400a  imul ebx, dword [ebp+0xc]       ; 32-bit wrap, no clamp:
                                               ; bytes = items * size
   0x00a8400e  push dword [edi+0xc]
   0x00a84011  call [0x00b1891c]               ; HOST fflush AGAIN
   0x00a84017  add esp, 4
   0x00a8401a  mov eax, ebx
   0x00a8401f  ret 0xc

   Pure island (translated here): the FULL-dword state==1 gate, the skip-arm
   `xor ebx,ebx` zero return, the `imul` byte-count (32-bit wrap), the
   "fflush on BOTH arms / fwrite on the open arm only" action shape, the
   vtbl+0x1c slot identity, and the fact that FILE* is never tested.

   Host (NOT translated): fwrite, fflush, fopen. Guest allocator stays
   platform. KERNEL32/CRT IO bodies are not in this image.

   There is NO length gate: count 0 still fwrite's. There is NO FILE* null
   test on either arm.

   ---- installer interaction, re-derived this unit (not inherited) ----

   0x00a5f3fd  [esi+4] := 2                    ; preset NO_FILE
   0x00a5f40b  [esi+0xc] := 0                  ; FILE* preset NULL
   0x00a5f436  call fopen("…", "wb")
   0x00a5f43f  [esi+0xc] := eax                ; FILE* stored even if NULL
   0x00a5f442  test eax, eax ; je 0xa5f460     ; FULL 32-bit. fopen FAIL
                                               ; skips the state=1 store
   0x00a5f44c  [esi+4] := 1                    ; OPEN, success only
   0x00a5f478  [0xc79bd8] := esi               ; <- JOIN of fopen-ok AND
                                               ;    fopen-fail (the je
                                               ;    target 0xa5f460 falls
                                               ;    through to here)
   0x00a5f480  [0xc79bd8] := 0                 ; alloc-fail ONLY

   So a failed fopen still PUBLISHES the sink. The logger's listener gate
   then sees a non-NULL pointer + mask 0xff and dispatches into 0x00a83fd0
   with state == 2, which takes the skip arm and fflush(NULL).

   ---- discriminator, NOT translated ----

   0x00a52850 lives in a DIFFERENT vtable (dword at 0x00b9e95c). Same
   `cmp dword [this+4], 1` / fwrite / imul / `ret 0xc` shape, 0x2c bytes,
   but NEITHER arm fflushs — flush is a separate slot 0x00a52880. Shared
   prefix with 0x00a83fd0 is 3 bytes (`55 8b ec`). Not one template; the
   extra fflush pair is this sink's whole point. Do not peel 0x00a52850.

   ---- original-binary quirk, REPRODUCED and never corrected ----

   D-LOG-11. The skip arm (state != 1) still fflushs, and fopen-fail still
   publishes the sink, so every subsequent listener write calls fflush with
   a NULL FILE*. The CRT defines fflush(NULL) as "flush all output
   streams"; that body is not in this image and is not translated. The
   reachable shape is: state==2, FILE*==NULL, fflush fires, fwrite does
   not, EAX returns 0.

   Identity pass: 10 VAs, 0 exact ZHL matches. Decode configuration
   identical to v2..v5: 2094319 instructions / 469 undecodable bytes.    */

enum {
  ISAAC_LOG_VA_WRITE = 0x00a83fd0u,              /* == LISTENER_WRITE */
  ISAAC_LOG_VA_WRITE_END = 0x00a84022u,          /* first int3 after ret */
  ISAAC_LOG_VA_WRITE_STATE_TEST = 0x00a83fd7u,   /* cmp dword [edi+4], 1 */
  ISAAC_LOG_VA_WRITE_STATE_BRANCH = 0x00a83fdbu, /* je 0xa83ff3 */
  ISAAC_LOG_VA_WRITE_SKIP_FFLUSH = 0x00a83fe2u,
  ISAAC_LOG_VA_WRITE_SKIP_RET = 0x00a83ff0u,     /* ret 0xc, EAX = 0 */
  ISAAC_LOG_VA_WRITE_FWRITE = 0x00a83fffu,
  ISAAC_LOG_VA_WRITE_IMUL = 0x00a8400au,
  ISAAC_LOG_VA_WRITE_OK_FFLUSH = 0x00a84011u,
  ISAAC_LOG_VA_WRITE_OK_RET = 0x00a8401fu,
  ISAAC_LOG_VA_WRITE_LOGGER_SLOT_LOAD = 0x00a11433u, /* mov esi, [eax+0x1c] */
  ISAAC_LOG_VA_WRITE_LOGGER_CALL = 0x00a11451u,      /* call esi */
  ISAAC_LOG_VA_WRITE_LOGGER_SIZE_PUSH = 0x00a1144au, /* push 1 */
  ISAAC_LOG_VA_SINK_DTOR = 0x00a83fa0u,              /* vtbl + 0 */
  ISAAC_LOG_VA_NEIGHBOR_DTOR = 0x00a84030u,          /* one int3 pad after
                                                        0x00a84022 */
  ISAAC_LOG_VA_SINK_DTOR_INNER = 0x00a52410u,
  ISAAC_LOG_VA_NEIGHBOR_DTOR_INNER = 0x00a84060u,
  ISAAC_LOG_VA_SINK_DTOR_VTABLE_STORE = 0x00a83fa6u, /* mov [esi],0xba5184 */
  ISAAC_LOG_VA_SINK_DTOR_GATE = 0x00a83fb1u,         /* test byte [ebp+8],1 */
  ISAAC_LOG_VA_NEIGHBOR_DTOR_GATE = 0x00a8403bu,     /* test byte [ebp+8],1 */
  ISAAC_LOG_VA_SINK_DTOR_INNER_CALL = 0x00a83facu,   /* call 0xa52410 */
  ISAAC_LOG_VA_NEIGHBOR_DTOR_INNER_CALL = 0x00a84036u, /* call 0xa84060 */
  ISAAC_LOG_VA_SINK_DTOR_DELETE_CALL = 0x00a83fbau,  /* call 0xaef15c */
  ISAAC_LOG_VA_NEIGHBOR_DTOR_DELETE_CALL = 0x00a84044u, /* call 0xaef15c */
  ISAAC_LOG_SINK_DTOR_BODY_BYTES = 0x26u,            /* a83fa0..a83fc6 */
  ISAAC_LOG_NEIGHBOR_DTOR_BODY_BYTES = 0x20u,        /* a84030..a84050 */
  ISAAC_LOG_SINK_DTOR_FREE_SIZE = 0x10u,
  ISAAC_LOG_NEIGHBOR_DTOR_FREE_SIZE = 0x30u,
  ISAAC_LOG_NEIGHBOR_DTOR_VTABLE = 0x00ba5520u,      /* stored INSIDE the
                                                        inner body, at
                                                        0x00a84089 */
  ISAAC_LOG_DTOR_ISLAND_VARIANTS = 3,         /* sink, neighbor, sibling */
  ISAAC_LOG_DTOR_ISLAND_VARIANT_SINK = 0,
  ISAAC_LOG_DTOR_ISLAND_VARIANT_NEIGHBOR = 1,
  ISAAC_LOG_DTOR_ISLAND_VARIANT_SIBLING = 2,  /* v16: 0x00a523e0, vtbl+0 */
  ISAAC_LOG_DTOR_ISLAND_RET_ARGS = 4,                /* ret 4 */
  ISAAC_LOG_DTOR_ISLAND_FLAG_BIT = 1,                /* test byte [ebp+8],1 */
  ISAAC_LOG_DTOR_ISLAND_SIZED_DELETE_VA = 0x00aef15cu, /* the size is DROPPED
                                                          (forwards only the
                                                          pointer) */
  ISAAC_LOG_VA_SINK_FLUSH = 0x0040c200u,             /* vtbl + 0x20, `ret 0` */
  ISAAC_LOG_VA_WRITE_SIBLING = 0x00a52850u,          /* other vtable; skip */
  ISAAC_LOG_VA_VTBL_WRITE_ENTRY = 0x00ba51a0u,       /* 0x00ba5184 + 0x1c */
  ISAAC_LOG_VA_VTBL_FLUSH_ENTRY = 0x00ba51a4u,       /* 0x00ba5184 + 0x20 */
  ISAAC_LOG_SINK_VTBL_SLOT_DTOR = 0x00,  ISAAC_LOG_SINK_VTBL_SLOT_WRITE = 0x1c,
  ISAAC_LOG_SINK_VTBL_SLOT_FLUSH = 0x20,
  ISAAC_LOG_SINK_STATE_OFFSET = 0x04,
  ISAAC_LOG_SINK_PATH_OFFSET = 0x08,
  ISAAC_LOG_SINK_FILE_OFFSET = 0x0c,
  ISAAC_LOG_WRITE_STACK_BYTES = 0x0c,
  ISAAC_LOG_WRITE_ARG_COUNT = 3,
  ISAAC_LOG_WRITE_BODY_BYTES = 0x52,
  ISAAC_LOG_WRITE_INSN_COUNT = 32,
  ISAAC_LOG_WRITE_SIBLING_BODY_BYTES = 0x2c,
  ISAAC_LOG_LOGGER_WRITE_SIZE_IMM = 1,
  ISAAC_LOG_FOPEN_MODE_VA = 0x00b9e938u, /* "wb" */
  ISAAC_LOG_WRITE_DIRECT_CALLSITES = 0,
  ISAAC_LOG_WRITE_TAIL_JUMPS = 0,
  ISAAC_LOG_WRITE_RAW_OCCURRENCES = 1, /* the vtable slot itself */
  ISAAC_LOG_WRITE_LOGGER_DISPATCH_SITES = 1,
  ISAAC_LOG_WRITE_INBOUND_EXTERIOR = 0,
  ISAAC_LOG_FWRITE_SITES = 5,
  ISAAC_LOG_FFLUSH_SITES = 5,
  ISAAC_LOG_FOPEN_SITES = 5,
  ISAAC_LOG_WRITE_FWRITE_SITES_IN_BODY = 1,
  ISAAC_LOG_WRITE_FFLUSH_SITES_IN_BODY = 2,

  /* ---- v17: the logger mid-body dispatch + tail (D-LOG-15/16/17) ----
     The LISTENER-write dispatch in the LOGGER body (0xa112c0) re-derives
     strlen TWICE more beyond the append-window pass 0xa113dd:
       0xa11440  strlen(buf) -> len2   ; SECOND pass, AFTER the vsnprintf
       0xa11449  push edx              ; nmemb = len2 (NOT the append len1)
       0xa11451  call esi              ; listener write (vtbl+0x1c)
       0xa11453  strlen(buf) -> len3   ; THIRD pass, AFTER the vcall
       0xa11469  cmp [len3+0xc7b647],0xa  ; newline compare uses len3
     The dispatch return (eax after 0xa11451) is dead: the reset at
     0xa11470 stores al (the strlen NUL), and eax at ret is the UNLOCK
     vcall residue (D-LOG-17). */
  ISAAC_LOG_VA_DISPATCH_STRLEN_PASS = 0x00a11440u, /* len2 loop head */
  ISAAC_LOG_VA_DISPATCH_NMEMB_PUSH = 0x00a11449u,  /* push edx (nmemb) */
  ISAAC_LOG_VA_TAIL_STRLEN_PASS = 0x00a11453u,     /* len3 loop head */
  ISAAC_LOG_VA_TAIL_NEWLINE_CMP = 0x00a11469u,     /* cmp [len3+..],0xa */
  ISAAC_LOG_SINK_VTABLE_TEXT_STORES = 2, /* 0x00a5f419, 0x00a83fa6 */
  ISAAC_LOG_WRITE_ACTION_NONE = 0,
  ISAAC_LOG_WRITE_ACTION_FWRITE = 1, /* platform */
  ISAAC_LOG_WRITE_ACTION_FFLUSH = 2, /* platform */
  ISAAC_LOG_WRITE_ACTIONS_MAX = 2,
  ISAAC_LOG_TEXT_INSN_COUNT_V6 = 2094319,
  ISAAC_LOG_TEXT_UNDECODABLE_BYTES_V6 = 469,
  ISAAC_LOG_V6_BATCHED_VAS = 10,
  ISAAC_LOG_V6_EXACT_ZHL_MATCHES = 0
};

/* ============ v7: the discriminator sibling write 0x00a52850 =============

   Target (open at ABI 6: named as NOT translated). identify-zhl-address.mjs
   batched in ONE invocation over the twelve VAs of this unit; ZERO exact
   ZHL matches; all stay address-stable.

     0x00a52850  other-vtable write, __thiscall(this = ecx), `ret 0xc`
                 (3 stack args). .text raw offset 0x00651c50. Body
                 0x00a52850..0x00a5287c (0x2c bytes, 16 instructions, two
                 `ret 0xc`, then int3). Linear decode, ZERO resyncs inside
                 the body.
     0x00b9e940  the sibling vtable. Slot +0x1c (file 0x00b9e95c) HOLDS
                 0x00a52850. Slot +0x20 HOLDS 0x00a52880 (real fflush,
                 NOT the log sink's `ret 0` nop). Slot +0x14 HOLDS the
                 fread 0x00a52820 — SHARED with the log sink vtable
                 0x00ba5184+0x14. Slot +0 HOLDS deleting dtor 0x00a523e0.
     [0x00b188cc] api-ms-win-crt-stdio-l1-1-0.dll!fwrite
     [0x00b1891c] api-ms-win-crt-stdio-l1-1-0.dll!fflush  (flush SLOT only)
     [0x00b188c8] api-ms-win-crt-stdio-l1-1-0.dll!fread   (sibling template)

   Empty call/jmp/jcc/push/mov-imm lists for 0x00a52850 are CORRECT and
   were re-verified, not inherited: the little-endian dword occurs ONCE
   in the whole image, at vtable+0x1c in .rdata. Nobody `e8`-calls this
   body. The interior `je 0xa5285f` at 0x00a52857 is the state gate, not
   an inbound transfer. Do not read the empty list as "unreferenced".

   ---- exact control flow (whole body, this unit) ----

   0x00a52850  push ebp / mov ebp,esp
   0x00a52853  cmp dword [ecx+4], 1            ; 83 79 04 01 — Grp1 Ev,Ib:
                                               ; FULL 32-bit == 1. No 0x66
                                               ; prefix. 0x101 does NOT write.
   0x00a52857  je 0xa5285f                     ; open -> fwrite path
   0x00a52859  xor eax, eax                    ; skip-arm return = 0
   0x00a5285b  pop ebp
   0x00a5285c  ret 0xc                         ; NO fflush on this arm

   0x00a5285f  push dword [ecx+0xc]            ; FILE*, NEVER null-tested
   0x00a52862  push dword [ebp+0x10]           ; nmemb
   0x00a52865  push dword [ebp+0xc]            ; size
   0x00a52868  push dword [ebp+8]              ; ptr
   0x00a5286b  call [0x00b188cc]               ; HOST fwrite
   0x00a52871  add esp, 0x10
   0x00a52874  imul eax, dword [ebp+0xc]       ; 32-bit wrap, no clamp
   0x00a52878  pop ebp
   0x00a52879  ret 0xc

   Pure island (translated here): the FULL-dword state==1 gate, the skip-arm
   `xor eax,eax` zero return, the `imul` byte-count (32-bit wrap), the
   "fwrite on the open arm only / fflush on NEITHER arm" action shape, the
   vtbl+0x1c slot identity, the 3-byte shared prefix with v6, and the fact
   that FILE* is never tested.

   Host (NOT translated): fwrite. fflush lives in a SEPARATE slot
   0x00a52880 (`push [ecx+0xc] ; call fflush ; pop ecx ; ret`) — also
   never FILE*-tested, also not translated. Guest allocator stays
   platform. KERNEL32/CRT IO bodies are not in this image. Logger
   0x00a112c0 body and 0x00a83fd0 are not re-peeled.

   There is NO length gate: count 0 still fwrite's. There is NO FILE* null
   test on either arm.

   ---- not one template with v6 (byte-diff, this unit) ----

   Shared prefix with 0x00a83fd0 is 3 bytes (`55 8b ec`). Over a 0x2c
   window: 4 identical / 40 differing, template_plausible false. v6's
   extra fflush pair (both arms) is this body's whole absence. Do not
   fold them.

   ---- IS one template with fread 0x00a52820 (byte-diff, this unit) ----

   42/44 identical, two diffs: offset 6 is the cmp immediate (`01` vs
   `00`) and offset 29 is the IAT low byte (`cc` fwrite vs `c8` fread).
   NOT peeled this unit (one island). Ranked next.

   ---- classified, not peeled ----

   0x00a83fa0 is the log-sink deleting dtor (stores 0x00ba5184, calls
   0x00a52410, `test byte [ebp+8], 1`, sized-delete 0x10, `ret 4`).
   After the 0x00a84022 int3 pad, 0x00a84030 is a DIFFERENT object's
   deleting dtor (stores 0x00ba5520, sized-delete 0x30, `ret 4`).
   Both classified as installer/dtor before any peel of that island.

   0x00a52610 (vtbl+0x28) fopen's `"wb"`/`"ab"` and stores FILE* even
   on NULL, then sets state=1 only on success. 0x00a52540 fopen's `"rb"`
   and sets state=0 on success. Neither publishes [0xc79bd8] — D-LOG-11
   is the log-sink installer 0x00a5f3a0, reproduced, never corrected.

   Identity pass: 12 VAs, 0 exact ZHL matches. Decode configuration
   identical to v2..v6: 2094319 instructions / 469 undecodable bytes.    */

enum {
  ISAAC_LOG_VA_SIBLING_WRITE = 0x00a52850u, /* == WRITE_SIBLING */
  ISAAC_LOG_VA_SIBLING_WRITE_END = 0x00a5287cu,
  ISAAC_LOG_VA_SIBLING_WRITE_STATE_TEST = 0x00a52853u, /* cmp dword [ecx+4], 1 */
  ISAAC_LOG_VA_SIBLING_WRITE_STATE_BRANCH = 0x00a52857u, /* je 0xa5285f */
  ISAAC_LOG_VA_SIBLING_WRITE_SKIP_RET = 0x00a5285cu,
  ISAAC_LOG_VA_SIBLING_WRITE_FWRITE = 0x00a5286bu,
  ISAAC_LOG_VA_SIBLING_WRITE_IMUL = 0x00a52874u,
  ISAAC_LOG_VA_SIBLING_WRITE_OK_RET = 0x00a52879u,
  ISAAC_LOG_VA_SIBLING_FLUSH = 0x00a52880u, /* vtbl+0x20, real fflush */
  ISAAC_LOG_VA_SIBLING_FLUSH_END = 0x00a5288bu,
  ISAAC_LOG_VA_SIBLING_FREAD = 0x00a52820u, /* one template; not peeled */
  ISAAC_LOG_VA_SIBLING_DTOR = 0x00a523e0u,  /* vtbl + 0 */
  ISAAC_LOG_VA_SIBLING_OPEN_WRITE = 0x00a52610u, /* vtbl+0x28, "wb"/"ab" */
  ISAAC_LOG_VA_SIBLING_OPEN_READ = 0x00a52540u,  /* vtbl+0x24, "rb" */
  ISAAC_LOG_VA_NEXT_ISLAND = 0x00a84030u, /* classified deleting dtor */
  ISAAC_LOG_SIBLING_VTABLE_VA = 0x00b9e940u,
  ISAAC_LOG_VA_SIBLING_VTBL_WRITE_ENTRY = 0x00b9e95cu, /* +0x1c */
  ISAAC_LOG_VA_SIBLING_VTBL_FLUSH_ENTRY = 0x00b9e960u, /* +0x20 */
  ISAAC_LOG_VA_SIBLING_VTBL_FREAD_ENTRY = 0x00b9e954u, /* +0x14 */
  ISAAC_LOG_IAT_FREAD = 0x00b188c8u,
  ISAAC_LOG_FOPEN_MODE_AB_VA = 0x00b6d104u, /* "ab" */
  ISAAC_LOG_FOPEN_MODE_RB_VA = 0x00b6d108u, /* "rb" */
  ISAAC_LOG_SIBLING_WRITE_BODY_BYTES = 0x2c,
  ISAAC_LOG_SIBLING_WRITE_INSN_COUNT = 16,
  ISAAC_LOG_SIBLING_FLUSH_BODY_BYTES = 0x0b,
  ISAAC_LOG_SIBLING_SHARED_PREFIX_BYTES = 3, /* 55 8b ec with v6 */
  ISAAC_LOG_SIBLING_FREAD_SHARED_BYTES = 42,
  ISAAC_LOG_SIBLING_FREAD_DIFF_BYTES = 2,
  ISAAC_LOG_SIBLING_WRITE_DIRECT_CALLSITES = 0,
  ISAAC_LOG_SIBLING_WRITE_TAIL_JUMPS = 0,
  ISAAC_LOG_SIBLING_WRITE_RAW_OCCURRENCES = 1, /* the vtable slot itself */
  ISAAC_LOG_SIBLING_FLUSH_RAW_OCCURRENCES = 1,
  ISAAC_LOG_SIBLING_FREAD_RAW_OCCURRENCES = 2, /* both vtables +0x14 */
  ISAAC_LOG_SIBLING_WRITE_INBOUND_EXTERIOR = 0,
  ISAAC_LOG_SIBLING_VTABLE_TEXT_STORES = 14,
  ISAAC_LOG_SIBLING_WRITE_FWRITE_SITES_IN_BODY = 1,
  ISAAC_LOG_SIBLING_WRITE_FFLUSH_SITES_IN_BODY = 0,
  ISAAC_LOG_SIBLING_FLUSH_FFLUSH_SITES_IN_BODY = 1,
  ISAAC_LOG_FREAD_SITES = 1,
  ISAAC_LOG_SIBLING_WRITE_ACTION_NONE = 0,
  ISAAC_LOG_SIBLING_WRITE_ACTION_FWRITE = 1, /* platform */
  ISAAC_LOG_SIBLING_WRITE_ACTIONS_MAX = 1,
  ISAAC_LOG_TEXT_INSN_COUNT_V7 = 2094319,
  ISAAC_LOG_TEXT_UNDECODABLE_BYTES_V7 = 469,
  ISAAC_LOG_V7_BATCHED_VAS = 12,
  ISAAC_LOG_V7_EXACT_ZHL_MATCHES = 0
};

/* ============ v8: the fread sibling 0x00a52820 (one template with v7) ====

   Target (open at ABI 7: ranked first, named as NOT folded into the write).
   identify-zhl-address.mjs batched in ONE invocation over the seven VAs of
   this unit; ZERO exact ZHL matches; all stay address-stable.

     0x00a52820  fread, __thiscall(this = ecx), `ret 0xc` (3 stack args).
                 .text raw offset 0x00651c20. Body 0x00a52820..0x00a5284c
                 (0x2c bytes, 16 instructions, two `ret 0xc`, then int3
                 pad to the v7 write at 0x00a52850). Linear decode, ZERO
                 resyncs inside the body.
     0x00b9e940  the sibling vtable. Slot +0x14 (file 0x00b9e954) HOLDS
                 0x00a52820. The log-sink vtable 0x00ba5184+0x14
                 (file 0x00ba5198) HOLDS THE SAME dword — raw occurrences
                 2, both .rdata slots, none in .text.
     [0x00b188c8] api-ms-win-crt-stdio-l1-1-0.dll!fread   (HOST)
     [0x00b188cc] api-ms-win-crt-stdio-l1-1-0.dll!fwrite  (v7 write, by ref)
     [0x00b1891c] api-ms-win-crt-stdio-l1-1-0.dll!fflush  (flush SLOT only)

   Empty call/jmp/jcc/push/mov-imm lists for 0x00a52820 are CORRECT and
   were re-verified, not inherited: the little-endian dword occurs TWICE
   in the whole image, at the two vtable +0x14 slots. Nobody `e8`-calls
   this body. The interior `je 0xa5282f` at 0x00a52827 is the state gate,
   not an inbound transfer. Do not read the empty list as "unreferenced".

   ---- exact control flow (whole body, this unit, transcribed from PE) ----

   0x00a52820  push ebp / mov ebp,esp
   0x00a52823  cmp dword [ecx+4], 0            ; 83 79 04 00 — Grp1 Ev,Ib:
                                               ; FULL 32-bit == 0. NOT the
                                               ; v7 write's `cmp ..., 1`.
                                               ; No 0x66 prefix. 0x100 and
                                               ; 0x101 do NOT fread.
   0x00a52827  je 0xa5282f                     ; state==0 -> fread path
   0x00a52829  xor eax, eax                    ; skip-arm return = 0
   0x00a5282b  pop ebp
   0x00a5282c  ret 0xc                         ; NO fflush on this arm

   0x00a5282f  push dword [ecx+0xc]            ; FILE*, NEVER null-tested
   0x00a52832  push dword [ebp+0x10]           ; nmemb
   0x00a52835  push dword [ebp+0xc]            ; size
   0x00a52838  push dword [ebp+8]              ; ptr
   0x00a5283b  call [0x00b188c8]               ; HOST fread
   0x00a52841  add esp, 0x10
   0x00a52844  imul eax, dword [ebp+0xc]       ; 32-bit wrap, no clamp
   0x00a52848  pop ebp
   0x00a52849  ret 0xc

   Pure island (translated here): the FULL-dword state==0 gate, the skip
   vs fread arm, the `imul` byte-count (32-bit wrap), the "fread on the
   readable arm only / fflush on NEITHER arm" action shape, the vtbl+0x14
   slot identity (shared by both vtables), and the fact that FILE* is
   never tested.

   Host (NOT translated): fread. KERNEL32/CRT IO bodies stay host. Guest
   allocator stays platform. Logger 0x00a112c0 body, 0x00a83fd0, log-sink
   dtor 0x00a83fa0, deleting dtor 0x00a84030: not reopened.

   There is NO length gate: count 0 still fread's. There is NO FILE* null
   test on either arm. There is NO fflush in either arm — do not copy v6
   fflush-on-skip, and do not copy the v7 write's skip-arm shape over this
   body's cmp immediate.

   ---- IS one template with v7 write 0x00a52850 (consumed BY REFERENCE) ----

   Byte-diff `--bytes 0x2c` (this unit): 42 identical / 2 differing,
   template_plausible true. Diffs: offset 6 cmp immediate (`00` vs `01`)
   and offset 29 IAT low byte (`c8` fread vs `cc` fwrite). The v7 write
   is already peeled; this unit does not re-transcribe it. Do NOT fold
   the two bodies: state 0 fread's and does not fwrite; state 1 fwrite's
   and does not fread. 0x00a52540 (`"rb"`) stores state 0 on success;
   that is why the fread cmp immediate is 0, not 1.

   ---- classified, not peeled ----

   0x00a52880 (vtbl+0x20): unconditional `push [ecx+0xc] ; call fflush ;
   pop ecx ; ret`. No FILE* test, no state gate, plain `ret` (not
   `ret 0xc`). Different ABI unit — ranked next, not this peel.
   0x00a83fa0 log-sink dtor and 0x00a84030 deleting dtor: still skip.

   Identity pass: 7 VAs, 0 exact ZHL matches. Decode configuration
   identical to v2..v7: 2094319 instructions / 469 undecodable bytes.    */

enum {
  ISAAC_LOG_VA_SIBLING_FREAD_END = 0x00a5284cu, /* first int3 after ret */
  ISAAC_LOG_VA_SIBLING_FREAD_STATE_TEST = 0x00a52823u, /* cmp dword [ecx+4], 0 */
  ISAAC_LOG_VA_SIBLING_FREAD_STATE_BRANCH = 0x00a52827u, /* je 0xa5282f */
  ISAAC_LOG_VA_SIBLING_FREAD_SKIP_RET = 0x00a5282cu,
  ISAAC_LOG_VA_SIBLING_FREAD_FREAD = 0x00a5283bu, /* call [0x00b188c8] */
  ISAAC_LOG_VA_SIBLING_FREAD_IMUL = 0x00a52844u,
  ISAAC_LOG_VA_SIBLING_FREAD_OK_RET = 0x00a52849u,
  ISAAC_LOG_VA_SINK_VTBL_FREAD_ENTRY = 0x00ba5198u, /* log-sink vtbl+0x14 */
  ISAAC_LOG_SINK_VTBL_SLOT_FREAD = 0x14,
  ISAAC_LOG_SINK_STATE_OPEN_READ = 0, /* cmp immediate; `"rb"` success */
  ISAAC_LOG_SIBLING_FREAD_BODY_BYTES = 0x2c,
  ISAAC_LOG_SIBLING_FREAD_INSN_COUNT = 16,
  ISAAC_LOG_SIBLING_FREAD_DIRECT_CALLSITES = 0,
  ISAAC_LOG_SIBLING_FREAD_TAIL_JUMPS = 0,
  ISAAC_LOG_SIBLING_FREAD_INBOUND_EXTERIOR = 0,
  ISAAC_LOG_SIBLING_FREAD_FREAD_SITES_IN_BODY = 1,
  ISAAC_LOG_SIBLING_FREAD_FFLUSH_SITES_IN_BODY = 0,
  ISAAC_LOG_SIBLING_FREAD_ACTION_NONE = 0,
  ISAAC_LOG_SIBLING_FREAD_ACTION_FREAD = 1, /* platform */
  ISAAC_LOG_SIBLING_FREAD_ACTIONS_MAX = 1,
  ISAAC_LOG_TEXT_INSN_COUNT_V8 = 2094319,
  ISAAC_LOG_TEXT_UNDECODABLE_BYTES_V8 = 469,
  ISAAC_LOG_V8_BATCHED_VAS = 7,
  ISAAC_LOG_V8_EXACT_ZHL_MATCHES = 0
};

/* Prefix lengths (strlen of the pinned .rdata strings). */
enum {
  ISAAC_LOG_PREFIX_LEN_INFO = 9,
  ISAAC_LOG_PREFIX_LEN_NET = 8,
  ISAAC_LOG_PREFIX_LEN_WARN = 9,
  ISAAC_LOG_PREFIX_LEN_ERROR = 10,
  ISAAC_LOG_PREFIX_LEN_ASSERT = 11,
  ISAAC_LOG_PREFIX_LEN_DEFAULT = 0
};

/* ---------- structs (all fields 4 bytes; layout pinned in tests) ---------- */

/* Everything the logger decides BEFORE any I/O happens, resolved from the
   externally visible state. Inputs are the raw dwords/bytes the PE reads:
   level (arg 0), guard [0xc7de48], listener ptr/mask [0xc79bd8/dc], the
   atLineStart byte [0xc33911] and the init result AL (only reachable value
   in this binary is 1 — D-LOG-2). Host actions are FLAGGED, never done. */
typedef struct IsaacLogEmitPlan {
  int32_t dropped_guard;   /* guard == 1: total no-op, no state change */
  int32_t listener_pre;    /* the [ebp-0xd] byte: ptr && (mask & level) */
  int32_t emit_gate;       /* (level & 0xff) != 0 || listener_pre */
  int32_t dropped_gate;    /* !dropped_guard && !emit_gate */
  int32_t init_needed;     /* proceeds && guard == 0 */
  int32_t init_fail_drops; /* init_needed && (init_ok & 0xff) == 0 (dead) */
  uint32_t guard_after;    /* full transition, see isaac_log_guard_after */
  int32_t lock_needed;     /* vcall +0xc reached (and unlock +0x10 later) */
  int32_t prefix_written;  /* lock_needed && atLineStart byte != 0 */
  int32_t prefix_case;     /* case 0..5 when written, -1 when not */
  uint32_t prefix_va;      /* string VA when written, 0 when not */
  uint32_t prefix_len;     /* pinned strlen when written, 0 when not */
  int32_t console_needed;  /* lock_needed && (level & 0xff) != 0 */
  int32_t unlock_needed;   /* == lock_needed (ordering pin) */
} IsaacLogEmitPlan;

/* ---------- LA: entry gates ---------- */

/* cmp eax, 1 ; je — FULL 32-bit equality on the guard dword. 0x101 does NOT
   block. */
int32_t isaac_log_guard_blocks(uint32_t guard);

/* cmp [0xc79bd8],0 ; je + test [0xc79bdc], ebx ; je — pointer null test and
   a FULL 32-bit mask AND against the FULL 32-bit level. */
int32_t isaac_log_listener_hit_pre(uint32_t listener_ptr,
                                   uint32_t listener_mask,
                                   uint32_t level);

/* The BL the two byte tests see (level is passed wide; narrowed here). */
uint32_t isaac_log_level_low_byte(uint32_t level);

/* test bl,bl ; jne  +  test cl,cl ; je — the message-exists decision:
   (level & 0xff) != 0 || listener_hit_pre. */
int32_t isaac_log_emit_gate(uint32_t level,
                            uint32_t listener_ptr,
                            uint32_t listener_mask);

/* Full drop law including the (structurally dead) init-fail arm. */
int32_t isaac_log_message_dropped(uint32_t guard,
                                  uint32_t level,
                                  uint32_t listener_ptr,
                                  uint32_t listener_mask,
                                  uint32_t init_ok);

/* ---------- LB: guard state machine ---------- */

/* test eax,eax ; jne — init runs only from guard 0 (after the ==1 out and
   the emit gate both passed). */
int32_t isaac_log_init_needed(uint32_t guard,
                              uint32_t level,
                              uint32_t listener_ptr,
                              uint32_t listener_mask);

/* test al,al after 0x00a15770: LOW BYTE. Nonzero -> 2, zero -> 0. */
uint32_t isaac_log_guard_after_init(uint32_t init_ok);

/* Complete transition of [0xc7de48] across one call. */
uint32_t isaac_log_guard_after(uint32_t guard,
                               uint32_t level,
                               uint32_t listener_ptr,
                               uint32_t listener_mask,
                               uint32_t init_ok);

/* D-LOG-2 pin: 0x00a15770 returns al=1 on every path (mov al,1 dominates
   both rets), so the je 0x00a11381 arm is dead in this binary. Returns 1. */
int32_t isaac_log_init_always_succeeds(void);

/* ---------- LC: prefix selection ---------- */

/* lea eax,[ebx-1] ; cmp eax,0xf ; ja default ; movzx table — the compare is
   UNSIGNED STRICT ABOVE: idx == 0xf takes the table (level 0x10 -> ASSERT),
   idx 0x10 (level 0x11) and the level-0 wrap (idx 0xffffffff) take default. */
int32_t isaac_log_prefix_case(uint32_t level);
uint32_t isaac_log_prefix_va(uint32_t level);
uint32_t isaac_log_prefix_len(uint32_t level);

/* cmp byte [0xc33911], 0 ; je — the prefix sprintf runs iff the byte is
   nonzero (byte-width memory cell; parameter wide, narrowed in body). */
int32_t isaac_log_prefix_written(uint32_t at_line_start_byte);

/* ---------- LD: append window ---------- */

/* Append destination offset: buffer + strlen(buffer). */
uint32_t isaac_log_append_dest_off(uint32_t len);

/* mov edx, 0x2800 ; sub edx, ecx — remaining capacity, 32-bit wrap (a len
   above 0x2800 yields a huge unsigned count; reproduced, not corrected). */
uint32_t isaac_log_append_capacity(uint32_t len);

/* ---------- LE: output gates ---------- */

/* test bl,bl at 0x00a11405 — LOW BYTE ONLY. Level 0x100 emits to the
   listener (mask permitting) but NOT to OutputDebugStringA. */
int32_t isaac_log_console_gate(uint32_t level);

/* cmp byte [ebp-0xd],0 ; je + POST re-reads of ptr and mask (defect-class
   guard: the machine does NOT reuse the pre-call snapshot for the pointer
   and mask — both must pass again after the format calls). */
int32_t isaac_log_listener_gate_post(uint32_t pre_flag_byte,
                                     uint32_t listener_ptr_post,
                                     uint32_t listener_mask_post,
                                     uint32_t level);

/* ---------- LF: atLineStart law ---------- */

/* cmp byte [len+0xc7b647], 0xa ; sete — buf[len-1] == '\n'. len == 0 reads
   the pre-buffer byte 0x00c7b647 (ZERO writers in all of .text, BSS zero,
   so the compare is false) — D-LOG-1: an empty append CLEARS the flag. */
int32_t isaac_log_next_at_line_start(uint32_t appended_len,
                                     uint32_t last_byte);

/* D-LOG-1 pin (returns 1: the quirk exists and is reproduced). */
int32_t isaac_log_empty_append_clears_line_start(void);

/* mov [0xc7b648], al — al is the NUL the strlen loop just read: 0. */
uint32_t isaac_log_buffer_reset_byte(void);

/* File-backed initial value of [0xc33911]: 1 (first message is prefixed). */
uint32_t isaac_log_initial_at_line_start(void);

/* ---------- v17: the mid-body DISPATCH + TAIL length laws ---------- */

/* D-LOG-15. The logger's listener dispatch pushes a SECOND strlen pass
   (0xa11440, computed AFTER the vsnprintf shim), NOT the append-window
   length (0xa113dd pass, computed BEFORE the format output was appended).
   When the two differ (alpha hidden in vsnprintf output), the listener
   receives the re-derived length. Returns dispatch_len; a translation
   that folds it to the append-window snapshot fails for every differing
   pair. */
uint32_t isaac_log_dispatch_nmemb_len(uint32_t append_len,
                                      uint32_t dispatch_len);

/* D-LOG-16. The atLineStart newline compare at 0xa11469 reads a THIRD
   strlen pass (0xa11453), re-derived AFTER the listener vcall 0xa11451 —
   the write holds buf and could have modified it. Returns tail_len; a
   fold to the dispatch snapshot (or the append snapshot) fails. */
uint32_t isaac_log_tail_len_after_dispatch(uint32_t dispatch_len,
                                           uint32_t tail_len);

/* D-LOG-17. The listener-write return (eax after call esi 0xa11451) is
   NEVER consumed: the buffer reset (0xa11470) stores al = the strlen NUL,
   and the logger's eax at ret (0xa114a1) is whatever the unlock vcall
   (+0x10) left. The dispatch result is dead on every path. */
int32_t isaac_log_dispatch_return_dropped(void);

/* The three mid-body strlen passes / compare, address-stable. */
uint32_t isaac_log_dispatch_strlen_pass_va(void); /* 0xa11440: len2 */
uint32_t isaac_log_dispatch_nmemb_push_va(void);  /* 0xa11449 */
uint32_t isaac_log_tail_strlen_pass_va(void);     /* 0xa11453: len3 */
uint32_t isaac_log_tail_newline_cmp_va(void);     /* 0xa11469 */

/* ---------- LG: callsite marshalling law ---------- */

/* cdecl: add esp, N cleans level + fmt + varargs -> (N - 8) >> 2 vararg
   dwords, unsigned. Census: N in {8..0x24, 0x2c..0x34, 0x40}, max 14. */
uint32_t isaac_log_vararg_dword_count(uint32_t add_esp_imm);

/* lea eax, [ebp+0x10] — the va_list starts at the third stack dword. */
uint32_t isaac_log_va_start_stack_disp(void);

/* ---------- LH: plan ---------- */

/* Everything decided BEFORE any I/O, in one resolution. out may be null. */
void isaac_log_emit_plan(uint32_t level,
                         uint32_t guard,
                         uint32_t listener_ptr,
                         uint32_t listener_mask,
                         uint32_t at_line_start_byte,
                         uint32_t init_ok,
                         IsaacLogEmitPlan* out);

/* ================= v2: LI — teardown listener uninstall ================= */

/* 0x00a71829 `test ecx,ecx ; je` on the PRE read of [0xc79bd8]: the flush
   vcall (+0x20) runs iff the pointer is non-null. FULL 32-bit test. */
int32_t isaac_log_teardown_flush_needed(uint32_t listener_ptr_pre);

/* 0x00a71838 tests the POST RE-READ at 0x00a71832, not the pre-call value.
   The deleting-dtor vcall (+0x0, arg 1) therefore needs BOTH to be non-null.
   Folding this to the pre-call snapshot is defect class 1 — it is spelled
   out as two parameters so a mutant that drops the second read is visible. */
int32_t isaac_log_teardown_destroy_needed(uint32_t listener_ptr_pre,
                                          uint32_t listener_ptr_post);

/* The value left in [0xc79bd8], per path. The store at 0x00a71842 is INSIDE
   the block (conditional); the other two arms simply do not write. All three
   arms nevertheless yield 0 — derived here, and proven over the whole drawn
   corpus by the tests rather than asserted. */
uint32_t isaac_log_teardown_listener_ptr_after(uint32_t listener_ptr_pre,
                                               uint32_t listener_ptr_post);

/* 0x00a71852 `mov [0xc79bdc], 0` sits at the join 0x00a7184c of both `je`
   edges AND the fallthrough: UNCONDITIONAL. The parameter exists so that a
   mutant making the clear conditional changes an observable result. */
uint32_t isaac_log_teardown_listener_mask_after(uint32_t listener_mask_before);

/* Law pin: the mask clear is unconditional while the pointer clear is not. */
int32_t isaac_log_teardown_mask_clear_unconditional(void);

/* D-LOG-5: 0x00a71a19 re-reads the pointer and flushes when non-null, but the
   pointer is 0 on every path out of the join and the only nonzero writer in
   .text (0x00a5f478) lives in a function IsaacMain alone can call. Derived
   from the pointer law so a mutant on that law propagates here. */
int32_t isaac_log_teardown_second_flush_reached(uint32_t listener_ptr_pre,
                                                uint32_t listener_ptr_post);

/* ============ v2: LJ — the `== 2` gate and critical-section destroy ======= */

/* 0x00a71bac `cmp dword ptr [0xc7de48], 2` ; 0x00a71bbd `jne`. A FULL 32-bit
   equality: guard 0x102 does NOT engage, guard 2 does. Deliberately a
   different width AND a different constant from the logger's own
   `cmp eax, 1` entry gate — the two must not be homogenised. */
int32_t isaac_log_teardown_engaged(uint32_t guard);

/* engaged && [0xc37960] != 0 -> DeleteCriticalSection + operator delete. */
int32_t isaac_log_teardown_critsec_delete_needed(uint32_t guard,
                                                 uint32_t critsec_ptr);

uint32_t isaac_log_teardown_critsec_ptr_after(uint32_t guard,
                                              uint32_t critsec_ptr);

/* 0x00a71be5 `and byte ptr [0xc3795c], 0xfe` — a BYTE op (80 /4 ib) on a
   one-byte cell, reached only when engaged. Parameter wide, narrowed in the
   body; a mutant widening it to a dword `and` must fail a test. */
uint32_t isaac_log_teardown_holder_flags_after(uint32_t guard,
                                               uint32_t holder_flags);

/* THE gate this unit exists for: 0x00a71bec `mov dword [0xc7de48], 1`,
   reached only through the `== 2` test. Any other guard value passes
   through UNCHANGED — see D-LOG-3. */
uint32_t isaac_log_teardown_guard_after(uint32_t guard);

/* 0x00a71bf6 `mov byte [0xc78aad], 0` is the `jne` TARGET as well as the
   fallthrough, so unlike the guard store 10 bytes earlier it always runs. */
uint32_t isaac_log_teardown_byte_after(uint32_t guard);

/* Composition with the v1 entry gate: does the post-teardown guard make
   every one of the 3286 callsites a no-op? True iff guard was 1 or 2. */
int32_t isaac_log_post_teardown_blocks_all(uint32_t guard_before);

/* D-LOG-3 pin: the teardown leaves the logger LIVE when the guard was
   neither 1 nor 2 (e.g. 0 — no message was ever emitted). */
int32_t isaac_log_teardown_leaves_logger_live(uint32_t guard_before);

uint32_t isaac_log_teardown_critsec_free_size(void);

/* ==================== v2: LK — the boot-side installer =================== */

/* 0x00a5f3cb `test ecx,ecx ; je` — a previously installed sink is destroyed
   (vcall +0x0, arg 1) before the new one is built. */
int32_t isaac_log_installer_prev_destroy_needed(uint32_t prev_listener_ptr);

/* Both arms store: 0x00a5f478 stores ESI, 0x00a5f480 stores 0, and ESI is 0
   exactly on the allocation-failure arm — so the cell ends up holding the
   allocation result either way. */
uint32_t isaac_log_installer_listener_ptr_after(uint32_t sink_ptr);

/* 0x00a5f48a `mov dword [0xc79bdc], 0xff` at the JOIN of the success `jmp`
   and the failure fallthrough. Re-verified from the instruction stream this
   unit: unconditional, and the function reads no configuration value at all.
   The parameter exists purely so a mutant that gates the store is visible. */
uint32_t isaac_log_installer_listener_mask_after(uint32_t sink_ptr);

/* Law pin for the claim above. */
int32_t isaac_log_installer_mask_unconditional(void);

/* D-LOG-4 pin: mask == 0xff is left armed even when the sink allocation
   failed and the pointer is 0. */
int32_t isaac_log_installer_mask_set_without_sink(void);

/* [esi+4]: preset 2 at 0x00a5f3fd, overwritten with 1 at 0x00a5f44c iff
   fopen returned non-null. Modelled as -1 when there is no sink object. */
int32_t isaac_log_installer_sink_state(uint32_t sink_ptr,
                                       uint32_t file_handle);

/* The v1 listener gate evaluated against the state boot leaves behind
   (ptr = sink_ptr, mask = 0xff). With mask 0xff the AND sees the level's LOW
   byte only, so level 0x100 still misses the listener after a successful
   install — the mask is NOT a full-width pass-through. */
int32_t isaac_log_listener_hit_after_install(uint32_t sink_ptr,
                                             uint32_t level);

/* ==================== v2: LL — the whole lifecycle plan ================== */

/* Everything 0x00a71770 decides about the log subsystem, in PE order. Host
   actions (the two vcalls, DeleteCriticalSection, operator delete) are
   FLAGGED, never performed. */
typedef struct IsaacLogTeardownPlan {
  int32_t flush_needed;          /* 0x00a71829 */
  int32_t destroy_needed;        /* 0x00a71838, POST re-read */
  uint32_t listener_ptr_after;   /* 0 on every path (derived) */
  uint32_t listener_mask_after;  /* 0, unconditional */
  int32_t second_flush_reached;  /* D-LOG-5: always 0 */
  int32_t engaged;               /* cmp dword [0xc7de48], 2 */
  int32_t critsec_delete_needed; /* engaged && ptr != 0 */
  uint32_t critsec_ptr_after;
  uint32_t holder_flags_after;   /* BYTE and 0xfe when engaged */
  uint32_t guard_after;          /* 1 iff engaged, else UNCHANGED */
  int32_t logger_live_after;     /* D-LOG-3 */
  uint32_t teardown_byte_after;  /* 0, unconditional */
} IsaacLogTeardownPlan;

void isaac_log_teardown_plan(uint32_t guard,
                             uint32_t listener_ptr_pre,
                             uint32_t listener_ptr_post,
                             uint32_t listener_mask,
                             uint32_t critsec_ptr,
                             uint32_t holder_flags,
                             IsaacLogTeardownPlan* out);

/* ============ v3: LM — the init 0x00a710a0, gate by gate ============ */

/* 0x00a710cb `cmp byte ptr [0xc78aad], 0 ; je` — a BYTE compare against
   ZERO, so ANY nonzero value warns (2 warns, unlike the two bit-0 gates
   below). Parameter wide, narrowed in the body. */
int32_t isaac_log_init_already_initialized(uint32_t lifecycle_byte);

/* Both internal edges push 0x10 and clean with `add esp, 8`. The count is
   derived through the v1 marshalling law so a mutant on that law shows up
   here too. */
uint32_t isaac_log_init_warn_level(void);
uint32_t isaac_log_init_warn_vararg_count(void);

/* 0x00a710e5 / 0x00a710eb: both stores dominate BOTH rets. The `push 0x40`
   at 0x00a710e3 is the `je` target and is scheduled between the branch and
   the stores, which does not make them conditional. */
int32_t isaac_log_init_args_published(void);

/* 0x00a71105 `test esi,esi ; je 0x00a711e2` on the 0x40 allocation. */
int32_t isaac_log_init_object_allocated(uint32_t alloc_result);

/* 0x00a711da `mov [0xc7de78], esi` is on the SUCCESS arm only — the
   failure arm (0x00a711e2 `xor esi,esi`) joins AFTER it, so a failed
   allocation leaves the previous object pointer in place rather than
   clearing it. Spelled with a `before` parameter so that asymmetry is
   observable. */
uint32_t isaac_log_init_object_after(uint32_t object_before,
                                     uint32_t alloc_result);

/* 0x00a7139a `test byte ptr [0xc5ab48], 1 ; jne` — BIT 0 of the low byte
   ONLY. A cell holding 2 is NOT "already initialised" and the block runs. */
int32_t isaac_log_init_critsec_init_runs(uint32_t critsec_flags);

/* 0x00a713c5 movzx / 0x00a713cc bts eax,0 / 0x00a713d6 mov byte back:
   (flags & 0xff) | 1 when the block runs, untouched otherwise. */
uint32_t isaac_log_init_critsec_flags_after(uint32_t critsec_flags);

/* 0x00a713d0 `mov [0xc5ab4c], esi` — the SHARED tail, reached from both the
   InitializeCriticalSection arm and the allocation-failure arm, so the cell
   takes the raw allocation result (0 on failure). Skipped entirely when the
   ready bit was already set. */
uint32_t isaac_log_init_critsec_ptr_after(uint32_t critsec_flags,
                                          uint32_t critsec_ptr_before,
                                          uint32_t alloc_result);

/* D-LOG-6 pin: the ready bit is set even when the 0x1c allocation failed
   and the stored CRITICAL_SECTION* is NULL. */
int32_t isaac_log_init_critsec_marked_without_critsec(void);

/* 0x00a713f8 `test byte ptr [0xc79a7c], 1 ; je` — the THIRD byte gate, bit
   0 again, but this one LOGS on the already-done arm and then skips the
   creation (`jmp 0x00a7145f` at 0x00a71410). */
int32_t isaac_log_init_cmd_thread_warns(uint32_t cmd_thread_flags);
int32_t isaac_log_init_cmd_thread_creates(uint32_t cmd_thread_flags);

/* 0x00a71456 bts / 0x00a7145a store — reached on the CREATE arm only. */
uint32_t isaac_log_init_cmd_thread_flags_after(uint32_t cmd_thread_flags);

/* 0x00a714af `mov byte ptr [0xc78aad], 1`, reached only on the AL=1 return
   (measured: it dominates 0x00a714c8, does not dominate 0x00a714db, and the
   fail label is not forward-reachable from it). The exact CONTRAST with the
   teardown's unconditional `= 0` at 0x00a71bf6 — do not homogenise. */
uint32_t isaac_log_init_lifecycle_byte_after(uint32_t lifecycle_before,
                                             uint32_t init_ok);

/* 0x00a711a5 `cmp eax, 0x00a15770 ; jne` — the vtable slot is compared
   against the logger's own holder-init body and, when equal, called
   DIRECTLY at 0x00a711ac instead of through 0x00a711b3 `call eax`. */
int32_t isaac_log_init_devirtualizes_to_mutex_init(void);

/* The init's own effect on the logger guard: the two internal edges are
   both level 0x10, evaluated in PE order (0x00a710db then 0x00a71408). */
uint32_t isaac_log_init_guard_after(uint32_t guard,
                                    uint32_t lifecycle_byte,
                                    uint32_t cmd_thread_flags);

/* ============ v3: LN — the D-LOG-3 answer ============ */

/* The immediate pushed at 0x00931170 for the site that dominates the
   teardown call. */
uint32_t isaac_log_boot_log_level(void);

/* Measured on IsaacMain's CFG: 0x00931172 dominates 0x0093140e, and neither
   the unwind funclet nor the __except handler offers a way around it. */
int32_t isaac_log_boot_site_dominates_teardown(void);

/* The guard transition across that dominating site. Composed from the v1
   law with the pinned level and the pinned D-LOG-2 init result, NOT
   restated, so a mutant on either propagates here. */
uint32_t isaac_log_guard_after_boot_site(uint32_t guard_before);

/* The value [0xc7de48] holds when 0x00a71bac reads it, given whatever it
   held when the dominating boot site ran. Nothing between them can store 0
   (0x00a11381 is dead — D-LOG-2), so this is the boot-site transition. */
uint32_t isaac_log_shipped_guard_at_teardown(uint32_t guard_at_boot_site);

/* THE ANSWER to D-LOG-3: can the guard be 0 at 0x00a71bac in a shipped
   run? Returns 0 — it cannot. Backed behaviourally by the corpus, which
   drives isaac_log_shipped_guard_at_teardown over every guard value. */
int32_t isaac_log_guard_zero_at_teardown_reachable(void);

/* The consequence D-LOG-3 warned about — logger left fully live after
   shutdown — evaluated on the shipped path. Returns 0. */
int32_t isaac_log_shipped_teardown_leaves_logger_live(void);

/* The v1 claim, now with its antecedent proven: composing the boot-site
   transition with the teardown gate and the v1 entry gate blocks all 3286
   sites. Derived, so it still reports 0 for guard values the four writers
   can never produce — that honesty is the point of the pin below. */
int32_t isaac_log_shipped_post_teardown_blocks_all(uint32_t guard_at_boot_site);

/* The guard's reachable value set is exactly {0, 1, 2}: the four enumerated
   writers store the literals 1, 2, 0, 1 and there are zero address escapes,
   so no other value can occur. */
int32_t isaac_log_guard_value_reachable(uint32_t guard);

/* The lifecycle triangle: init sets the byte iff it succeeded, teardown
   clears it unconditionally. */
uint32_t isaac_log_lifecycle_byte_after_init_then_teardown(
    uint32_t lifecycle_before, uint32_t init_ok);

/* ==================== v3: LO — the init plan ==================== */

typedef struct IsaacLogInitPlan {
  int32_t already_initialized;     /* 0x00a710cb, byte != 0 */
  int32_t warn_emitted;            /* == already_initialized */
  int32_t args_published;          /* always 1 */
  int32_t object_allocated;        /* 0x00a71105 */
  uint32_t object_after;           /* 0x00a711da, success arm only */
  int32_t critsec_init_runs;       /* 0x00a7139a, bit 0 */
  uint32_t critsec_flags_after;    /* 0x00a713d6 */
  uint32_t critsec_ptr_after;      /* 0x00a713d0, shared tail */
  int32_t cmd_thread_warns;        /* 0x00a713f8, bit 0 */
  int32_t cmd_thread_creates;      /* the complement */
  uint32_t cmd_thread_flags_after; /* 0x00a7145a, create arm only */
  int32_t log_sites_taken;         /* 0, 1 or 2 of the two internal edges */
  uint32_t guard_after;            /* effect of those edges on [0xc7de48] */
  int32_t returns_ok;              /* AL at the ret */
  uint32_t lifecycle_byte_after;   /* 0x00a714af, success arm only */
} IsaacLogInitPlan;

void isaac_log_init_plan(uint32_t lifecycle_byte,
                         uint32_t guard,
                         uint32_t object_before,
                         uint32_t object_alloc,
                         uint32_t critsec_flags,
                         uint32_t critsec_ptr_before,
                         uint32_t critsec_alloc,
                         uint32_t cmd_thread_flags,
                         uint32_t init_ok,
                         IsaacLogInitPlan* out);

/* ============ v4: LP — the shared assert guard (new template) ============ */

/* 0x00a157fe `test byte [eax+4], 1 ; jne` and 0x00a159a3
   `test byte [esi+4], 1 ; jne`. Grp3 Eb,Ib: BIT 0 of the LOW BYTE only, so
   a flags cell holding 2 asserts and one holding 0x100 asserts too. Both
   take the wide cell value; the narrowing is explicit in the body. */
int32_t isaac_log_lock_assert_fires(uint32_t holder_flags);
int32_t isaac_log_unlock_assert_fires(uint32_t holder_flags);

/* 0x00b81c58 / 0x00b81c20, selected by which wrapper is running. Returns 0
   when the guard does not fire. */
uint32_t isaac_log_lock_assert_string_va(uint32_t is_unlock,
                                         uint32_t holder_flags);

/* `add esp, 8` at 0x00a15818 / 0x00a159b5, through the v1 marshalling law:
   both assert sites pass zero varargs. */
uint32_t isaac_log_lock_assert_vararg_count(void);

/* THE v4 FINDING. The assert guard READS the ready bit and never writes it:
   its template contains no allocation, no InitializeCriticalSection, no
   `bts` and no store to holder+4. Both are 0. */
int32_t isaac_log_lock_assert_sets_ready_bit(void);
int32_t isaac_log_lock_assert_is_lazy_init_template(void);

/* Neither wrapper writes the flags byte on any path. */
uint32_t isaac_log_lock_holder_flags_after(uint32_t holder_flags);

/* The logger reaches 0x00a157f0 only with guard == 2, and guard 2 has one
   writer (0x00a1133b) dominated by the 0x00a15770 call, which sets bit 0 on
   BOTH arms — so the re-entrant assert cannot fire from 0x00a11358 unless
   D-LOG-6 is in play. */
int32_t isaac_log_lock_assert_reachable_from_logger(void);

/* ================= v4: LQ — the timeout discriminator ================= */

/* 0x00a1581b `cmp dword ptr [ebp+8], -1` — FULL 32-bit equality, not a sign
   test: 0x80000000 and 0x7fffffff are BOTH finite. */
int32_t isaac_log_lock_timeout_infinite(uint32_t timeout);

/* 0 = INFINITE, 1 = zero-timeout immediate failure (0x00a158cb `jbe`, which
   is UNSIGNED, so only 0 takes it), 2 = the timed retry loop. */
int32_t isaac_log_lock_timeout_arm(uint32_t timeout);

/* The `jbe` fires BEFORE 0x00a158d1, so a 0 timeout never calls
   TryEnterCriticalSection even once. */
int32_t isaac_log_lock_zero_timeout_tries(void);

/* ================== v4: LR — the INFINITE spin loop ================== */

/* 0x00a1582b `cmp byte ptr [esi+0x18], 0 ; je 0x00a15844` — the LOW BYTE of
   the ownership cell, so 0x100 does NOT spin. */
int32_t isaac_log_lock_spin_entered(uint32_t owned_byte);

/* 0x00a1583e / 0x00a15842: the same low-byte test, re-evaluated at the
   bottom of every iteration. */
int32_t isaac_log_lock_spin_continues(uint32_t owned_byte);

uint32_t isaac_log_lock_spin_sleep_ms(void);

/* ESI is loop-invariant: [this+8] is read once at 0x00a15821 and the loop
   re-reads only [esi+0x18]. (The timed loop is the opposite — it reloads
   `this` at 0x00a158d1 and re-reads [this+8] at 0x00a158d5.) */
int32_t isaac_log_lock_spin_reloads_critsec(void);
int32_t isaac_log_lock_timed_reloads_critsec(void);

/* No counter, no clock, no cap: the back edge 0x00a15842 is guarded only by
   the byte. The Sleep pointer load 0x00a15831 is HOISTED above the loop
   head 0x00a15837, so even the IAT read does not repeat. */
int32_t isaac_log_lock_spin_bounded(void);
int32_t isaac_log_lock_spin_rereads_sleep_pointer(void);

/* D-LOG-8: no LeaveCriticalSection exists on the 0x00a15837 back edge. */
int32_t isaac_log_lock_spin_holds_critsec(void);
int32_t isaac_log_unlock_enters_critsec(void);
int32_t isaac_log_lock_self_reentrant_spins_forever(void);

/* Iteration count for a corpus in which the ownership byte is observed
   clear after `clear_after` sleeps. Returns 0 when the loop is never
   entered and ISAAC_LOG_LOCK_SPIN_NEVER_RETURNS when it never is. */
uint32_t isaac_log_lock_spin_iterations(uint32_t owned_byte,
                                        uint32_t clear_after,
                                        uint32_t ever_clears);

/* ==================== v4: LS — the timed retry arm ==================== */

/* 0x00a158df `test eax, eax ; setne cl` — FULL 32-bit on the BOOL. */
int32_t isaac_log_lock_try_entered(uint32_t try_result);

/* 0 = success, 1 = entered but already owned -> LeaveCriticalSection then
   sleep, 2 = not entered -> sleep. The owned test at 0x00a158e8 is a LOW
   BYTE compare and is reached only when the try succeeded. */
int32_t isaac_log_lock_try_arm(uint32_t try_result, uint32_t owned_byte);
int32_t isaac_log_lock_try_leaves(uint32_t try_result, uint32_t owned_byte);

uint32_t isaac_log_lock_retry_sleep_ms(void);

/* The MSVC magic division at 0x00a15858 / 0x00a1590c, transcribed limb by
   limb: (ns * 0x431bde82d7b634db) >> 82, which is exactly ns / 1000000. */
uint32_t isaac_log_lock_ticks_to_ms_lo(uint32_t ns_hi, uint32_t ns_lo);
uint32_t isaac_log_lock_ticks_to_ms_hi(uint32_t ns_hi, uint32_t ns_lo);

/* 0x00a1597b..0x00a15988. `test edx,edx` clears CF, so the `jb` at
   0x00a1597d can never be taken; the live law is
   expired = elapsed_hi != 0 || elapsed_lo >= timeout, UNSIGNED. */
int32_t isaac_log_lock_elapsed_expired(uint32_t elapsed_hi,
                                       uint32_t elapsed_lo,
                                       uint32_t timeout);
int32_t isaac_log_lock_underflow_branch_dead(void);

/* The start timestamp is taken ONCE at 0x00a15853, above the loop head, and
   parked in [esp+0xc]/[esp+0x20]; the second clock block writes only
   [esp+0x14]/[esp+0x18]/[esp+0x28], so the bound is folded and only `now`
   is re-derived. The timeout operand IS re-read from [ebp+8] each pass. */
int32_t isaac_log_lock_start_refetched(void);
int32_t isaac_log_lock_now_refetched(void);

/* ============== v4: LT — the ownership store, and D-LOG-7 ============== */

/* 0x00a15844 belongs to the INFINITE arm alone: the timed success branch
   0x00a158f9 targets 0x00a15848 and jumps over it. */
int32_t isaac_log_lock_marks_owned(uint32_t timeout,
                                   uint32_t try_result,
                                   uint32_t owned_byte);
uint32_t isaac_log_lock_owned_byte_after(uint32_t timeout,
                                         uint32_t try_result,
                                         uint32_t owned_byte);
int32_t isaac_log_timed_success_skips_owned_store(void);

/* AL at the two rets. */
int32_t isaac_log_lock_acquired(uint32_t timeout,
                                uint32_t try_result,
                                uint32_t owned_byte,
                                uint32_t elapsed_hi,
                                uint32_t elapsed_lo);

/* ========================= v4: LU — the unlock ========================= */

/* 0x00a159bc stores 0 UNCONDITIONALLY, including on the arm that just
   asserted the mutex is not initialised, and does it BEFORE the API call
   at 0x00a159c0. The unlock takes no stack argument (plain `ret`). */
uint32_t isaac_log_unlock_owned_byte_after(uint32_t owned_before);
int32_t isaac_log_unlock_clears_before_leave(void);
int32_t isaac_log_unlock_takes_timeout(void);

/* ================ v4: LV — the D-LOG-6 interaction ================ */

/* D-LOG-6 state: 0x00a15770's allocation-failure arm sets flags bit 0 and
   stores a NULL CRITICAL_SECTION*. The guard reads only the bit, so it is
   suppressed exactly when the pointer is NULL. */
int32_t isaac_log_lock_null_critsec_reached(uint32_t holder_flags,
                                            uint32_t critsec_ptr);
int32_t isaac_log_lock_asserts_on_failed_init(void);

/* The VA of the first NULL-derived access on each entry, in PE order. */
uint32_t isaac_log_lock_first_null_access_va(uint32_t is_unlock,
                                             uint32_t timeout);

/* ==================== v4: LW — the lock plan ==================== */

typedef struct IsaacLogLockPlan {
  int32_t assert_fires;       /* 0x00a157fe / 0x00a159a3, bit 0 */
  uint32_t assert_string_va;  /* 0x00b81c58 / 0x00b81c20, else 0 */
  int32_t arm;                /* 0 INFINITE / 1 ZERO / 2 TIMED */
  int32_t enter_call;         /* 0x00a15825, INFINITE only */
  int32_t try_call;           /* 0x00a158d9, TIMED only */
  int32_t leave_call;         /* 0x00a158ef give-back */
  int32_t spin_entered;       /* 0x00a1582f falls into the 1000 ms loop */
  uint32_t sleep_ms;          /* 0x3e8 / 0xa / 0 */
  int32_t returns;            /* 0 when the INFINITE spin never ends */
  int32_t acquired;           /* AL at the ret */
  int32_t marks_owned;        /* the 0x00a15844 store — D-LOG-7 */
  uint32_t owned_byte_after;  /* [critsec+0x18] after this call */
  uint32_t critsec_ptr;       /* the pointer the wrapper dereferences */
  int32_t null_critsec_fault; /* D-LOG-6 observed from the lock path */
  uint32_t fault_va;          /* first NULL-derived access, else 0 */
} IsaacLogLockPlan;

void isaac_log_lock_plan(uint32_t holder_flags,
                         uint32_t critsec_ptr,
                         uint32_t timeout,
                         uint32_t owned_byte,
                         uint32_t try_result,
                         uint32_t spin_ever_clears,
                         uint32_t elapsed_hi,
                         uint32_t elapsed_lo,
                         IsaacLogLockPlan* out);

void isaac_log_unlock_plan(uint32_t holder_flags,
                           uint32_t critsec_ptr,
                           uint32_t owned_byte,
                           IsaacLogLockPlan* out);

/* ============ v5: LX — the destroy body 0x00a157c0, gate by gate ======== */

/* 0x00a157c7 `test edi, edi ; je 0x00a157e4` — a FULL 32-bit test on the
   pointer, so 0x00000100 frees and only exact 0 skips. Wide by contract. */
int32_t isaac_log_destroy_frees_critsec(uint32_t critsec_ptr);

/* 0x00a157dd `mov dword [esi+8], 0` lives on the non-NULL arm ONLY; the
   observable pointer is 0 afterwards either way. */
int32_t isaac_log_destroy_stores_null_critsec(uint32_t critsec_ptr);
uint32_t isaac_log_destroy_critsec_ptr_after(uint32_t critsec_ptr);

/* `push 0x1c` at 0x00a157d2. 0x00aef15c forwards only [ebp+8] to 0x00a0f500,
   so the size operand is pushed and then discarded by the callee. */
uint32_t isaac_log_destroy_critsec_free_size(void);
int32_t isaac_log_destroy_sized_delete_ignores_size(void);

/* 0x00a157e4 `and byte [esi+4], 0xfe` — a BYTE and, so bits 8..31 of the
   flags cell are preserved. Drive this unmasked with 0x100 / 0x1ff /
   0xffffffff; the narrowing is explicit in the body. */
uint32_t isaac_log_destroy_flags_after(uint32_t holder_flags);
int32_t isaac_log_destroy_clears_ready_bit(void);

/* The clear is the `je` TARGET, so it runs on both arms: destroy is
   NULL-safe and idempotent. */
int32_t isaac_log_destroy_clear_unconditional(void);
int32_t isaac_log_destroy_is_idempotent(void);

/* ============ v5: LY — the five instances of one template ============= */

uint32_t isaac_log_destroy_variants(void);
uint32_t isaac_log_destroy_body_va(uint32_t variant);
uint32_t isaac_log_destroy_entry_vtable_va(uint32_t variant);
uint32_t isaac_log_destroy_exit_vtable_va(uint32_t variant);
uint32_t isaac_log_destroy_clear_va(uint32_t variant);
uint32_t isaac_log_destroy_stack_bytes_popped(uint32_t variant);
int32_t isaac_log_destroy_returns_this(uint32_t variant);
int32_t isaac_log_destroy_has_delete_flag_gate(uint32_t variant);
int32_t isaac_log_destroy_operates_on_logger_holder(uint32_t variant);

/* Byte-diff evidence, measured on the image: 41/43 shared for (0,1),
   52/55 for (1,2), 40/43 for (0,2). */
uint32_t isaac_log_destroy_body_bytes(uint32_t variant);
uint32_t isaac_log_destroy_shared_bytes(uint32_t variant_a, uint32_t variant_b);
int32_t isaac_log_destroy_is_one_template(void);

/* ============ v5: LZ — the dtor delete-flag gate (variant 2) =========== */

/* 0x00a15711 `test byte [ebp+8], 1` — bit 0 of the LOW byte, so 0x100 does
   NOT free and 0x101 does. */
int32_t isaac_log_dtor_frees_object(uint32_t delete_flag);
uint32_t isaac_log_dtor_object_free_size(void);

/* 0x00a15715 stores the base vtable BETWEEN the test at 0x00a15711 and the
   branch at 0x00a1571b; `mov` does not write EFLAGS, so the store is
   unconditional and the gate still sees the test's flags. */
int32_t isaac_log_dtor_restores_base_vtable_unconditionally(void);
int32_t isaac_log_dtor_vtable_store_preserves_flags(void);

/* ============ v5: LAA — the ready-bit lifecycle, end to end =========== */

int32_t isaac_log_ready_state(uint32_t holder_flags, uint32_t critsec_ptr);
int32_t isaac_log_ready_state_reachable(uint32_t state);

/* 0x00a15770: success publishes (1, p); the allocation-failure arm
   publishes (1, NULL) — D-LOG-6. Already-ready is a no-op. */
int32_t isaac_log_ready_state_after_init(uint32_t holder_flags,
                                         uint32_t critsec_ptr,
                                         uint32_t alloc_result);
int32_t isaac_log_ready_state_after_destroy(uint32_t holder_flags,
                                            uint32_t critsec_ptr);

/* Bounded to the logger holder 0x00c3795c over the 2094319-instruction
   decode: 1 indirect setter, 0 absolute setters, 2 absolute clearers. */
uint32_t isaac_log_holder_ready_bit_setters(void);
uint32_t isaac_log_holder_ready_bit_clearers(void);
uint32_t isaac_log_holder_ready_bit_clear_va(uint32_t index);
uint32_t isaac_log_holder_ready_bit_set_va(void);

/* The pure control-flow fact: 0x00a15806 / 0x00a159a7 skip only the LOG
   CALL, and both arms converge on the dereference. Independent of the bit —
   this is where it differs from v4's D-LOG-6-scoped helper. */
int32_t isaac_log_lock_null_deref_reached(uint32_t holder_flags,
                                          uint32_t critsec_ptr);

/* Destroy leaves S0, and a lock from S0 asserts AND THEN faults. */
int32_t isaac_log_destroy_then_lock_asserts(uint32_t holder_flags,
                                            uint32_t critsec_ptr);
int32_t isaac_log_destroy_then_lock_faults(uint32_t holder_flags,
                                           uint32_t critsec_ptr);
uint32_t isaac_log_destroy_then_lock_fault_va(uint32_t holder_flags,
                                              uint32_t critsec_ptr,
                                              uint32_t timeout);

/* D-LOG-10: the vptr a later virtual lock would dispatch through. Variants
   that restore the base vtable land in _purecall 0x00af05d3 instead. */
uint32_t isaac_log_post_destroy_lock_dispatch_va(uint32_t variant);

/* ================ v5: LAB — D-LOG-9, the dangling window ============== */

int32_t isaac_log_destroy_holds_lock(void);
int32_t isaac_log_destroy_clears_before_free(void);
uint32_t isaac_log_destroy_dangling_window_start_va(uint32_t variant);
uint32_t isaac_log_destroy_dangling_window_end_va(uint32_t variant);
uint32_t isaac_log_destroy_dangling_window_insns(uint32_t variant);

/* ==================== v5: LAC — the reach census ====================== */

uint32_t isaac_log_destroy_reach_sites(uint32_t variant, uint32_t channel);
uint32_t isaac_log_destroy_total_reach(uint32_t variant);
uint32_t isaac_log_unwind_destroy_reach_measured(void);
uint32_t isaac_log_unwind_destroy_reach_v4_reported(void);
int32_t isaac_log_unwind_destroy_is_dead_code(void);

/* ==================== v5: LAD — the destroy plan ====================== */

typedef struct IsaacLogDestroyPlan {
  int32_t variant;                   /* 0..4, else -1 */
  uint32_t body_va;                  /* 0 for an unknown variant */
  uint32_t entry_vtable_va;          /* 0x00b81c0c or 0 */
  int32_t delete_critical_section;   /* the KERNEL32 import — platform */
  int32_t free_critsec;              /* the sized delete — platform */
  uint32_t critsec_free_size;        /* 0x1c on the non-NULL arm, else 0 */
  int32_t stores_null_critsec;       /* [this+8] := 0, non-NULL arm only */
  uint32_t critsec_ptr_after;
  uint32_t flags_after;              /* BYTE and, upper bits preserved */
  int32_t clears_ready_bit;
  uint32_t exit_vtable_va;           /* 0x00ba04b4 or 0 */
  int32_t frees_object;              /* variant 2 only, delete-flag gated */
  uint32_t object_free_size;         /* 0xc or 0 */
  int32_t returns_this;
  uint32_t stack_bytes_popped;       /* the `ret imm16` */
  int32_t ready_state_before;
  int32_t ready_state_after;
  uint32_t dangling_window_start_va; /* D-LOG-9, 0 on the NULL arm */
  uint32_t dangling_window_end_va;
  uint32_t action_count;
} IsaacLogDestroyPlan;

void isaac_log_destroy_plan(uint32_t variant,
                            uint32_t holder_flags,
                            uint32_t critsec_ptr,
                            uint32_t delete_flag,
                            IsaacLogDestroyPlan* out);

/* The ordered typed host-action list, in PE order. */
uint32_t isaac_log_destroy_action_count(uint32_t variant,
                                        uint32_t critsec_ptr,
                                        uint32_t delete_flag);
uint32_t isaac_log_destroy_action_at(uint32_t variant,
                                     uint32_t critsec_ptr,
                                     uint32_t delete_flag,
                                     uint32_t index);
int32_t isaac_log_destroy_action_is_platform(uint32_t action);

/* ============ v6: LAE — the FULL-dword state==1 gate =================== */

/* 0x00a83fd7 `cmp dword [edi+4], 1 ; je` — FULL 32-bit equality with 1.
   0x101 does NOT write. Drive unmasked. */
int32_t isaac_log_write_state_is_open(uint32_t state);
int32_t isaac_log_write_fwrite_needed(uint32_t state);

/* ============ v6: LAF — fflush both arms, no FILE* null test ========== */

/* Both arms call [0x00b1891c]. The state parameter exists so a mutant that
   gates fflush on the open arm is visible. Always returns 1. */
int32_t isaac_log_write_fflush_needed(uint32_t state);

/* FILE* is pushed and never tested. file_ptr is taken and discarded so a
   mutant that inserts `test file,file` changes an observable. Always 0. */
int32_t isaac_log_write_tests_file_null(uint32_t file_ptr);

/* D-LOG-11 pin: fopen-fail still stores the sink pointer, so the skip arm
   is reachable with FILE* NULL. Returns 1. */
int32_t isaac_log_write_fopen_fail_publishes_sink(void);

/* vtbl+0x20 is `ret 0`. The write shim is the only fflush. Returns 1. */
int32_t isaac_log_write_flush_vcall_is_nop(void);

/* ============ v6: LAG — the imul byte count and the zero skip return == */

/* 0x00a8400a `imul ebx, [ebp+0xc]` — 32-bit wrap, no clamp. Ungated: this
   is the multiply itself. */
uint32_t isaac_log_write_byte_count(uint32_t fwrite_count, uint32_t size);

/* Skip arm (`xor ebx,ebx`) returns 0; open arm returns the imul. */
uint32_t isaac_log_write_bytes_returned(uint32_t state,
                                        uint32_t fwrite_count,
                                        uint32_t size);

/* ============ v6: LAH — vtbl slot, reach, calling convention ========== */

uint32_t isaac_log_write_stack_bytes_popped(void);
uint32_t isaac_log_write_vtbl_slot(void);
uint32_t isaac_log_write_body_va(void);
uint32_t isaac_log_write_body_bytes(void);
uint32_t isaac_log_write_logger_size_imm(void);
uint32_t isaac_log_write_direct_callsites(void);
uint32_t isaac_log_write_raw_occurrences(void);
uint32_t isaac_log_write_logger_dispatch_sites(void);

/* ============ v6: LAI — the ordered typed host-action plan ============ */

typedef struct IsaacLogWritePlan {
  int32_t state_is_open;         /* state == 1, FULL 32-bit */
  int32_t fwrite;                /* same: HOST fwrite fires */
  int32_t fflush;                /* always 1 — both arms */
  int32_t tests_file_null;       /* always 0 */
  uint32_t bytes_returned;       /* 0 on skip, else count*size wrap */
  uint32_t stack_bytes_popped;   /* 0xc */
  uint32_t vtbl_slot;            /* 0x1c */
  uint32_t body_va;              /* 0x00a83fd0 */
  uint32_t fwrite_iat;
  uint32_t fflush_iat;
  uint32_t action_count;         /* 1 (fflush) or 2 (fwrite, fflush) */
} IsaacLogWritePlan;

void isaac_log_write_plan(uint32_t state,
                          uint32_t file_ptr,
                          uint32_t fwrite_count,
                          uint32_t size,
                          IsaacLogWritePlan* out);

uint32_t isaac_log_write_action_count(uint32_t state);
uint32_t isaac_log_write_action_at(uint32_t state, uint32_t index);
int32_t isaac_log_write_action_is_platform(uint32_t action);

/* ============ v7: LAJ — FULL-dword state==1, no fflush in the body ===== */

/* 0x00a52853 `cmp dword [ecx+4], 1 ; je` — FULL 32-bit equality with 1.
   0x101 does NOT write. Drive unmasked. Same gate as v6, different body. */
int32_t isaac_log_sibling_write_state_is_open(uint32_t state);
int32_t isaac_log_sibling_write_fwrite_needed(uint32_t state);

/* ============ v7: LAK — fflush is a SEPARATE slot, never this body ==== */

/* Neither arm of 0x00a52850 calls fflush. state is the unused operand a
   mutant that copies v6's "always 1" would read. Always returns 0. */
int32_t isaac_log_sibling_write_fflush_needed(uint32_t state);

/* FILE* is pushed and never tested. file_ptr is taken and discarded so a
   mutant that inserts `test file,file` changes an observable. Always 0. */
int32_t isaac_log_sibling_write_tests_file_null(uint32_t file_ptr);

/* 0x00a52880 also pushes FILE* and never tests it. Always 0. */
int32_t isaac_log_sibling_flush_tests_file_null(uint32_t file_ptr);

/* vtbl+0x20 is 0x00a52880 (real fflush), NOT 0x0040c200. Returns 0.
   Contrast with isaac_log_write_flush_vcall_is_nop (v6, returns 1). */
int32_t isaac_log_sibling_flush_vcall_is_nop(void);

/* ============ v7: LAL — imul byte count, skip returns 0, no fflush ==== */

/* 0x00a52874 `imul eax, [ebp+0xc]` — 32-bit wrap, no clamp. */
uint32_t isaac_log_sibling_write_byte_count(uint32_t fwrite_count,
                                            uint32_t size);

/* Skip arm (`xor eax,eax`) returns 0; open arm returns the imul. */
uint32_t isaac_log_sibling_write_bytes_returned(uint32_t state,
                                                uint32_t fwrite_count,
                                                uint32_t size);

/* ============ v7: LAM — vtbl slot, reach, template discriminators ===== */

uint32_t isaac_log_sibling_write_stack_bytes_popped(void);
uint32_t isaac_log_sibling_write_vtbl_slot(void);
uint32_t isaac_log_sibling_write_body_va(void);
uint32_t isaac_log_sibling_write_body_bytes(void);
uint32_t isaac_log_sibling_write_direct_callsites(void);
uint32_t isaac_log_sibling_write_raw_occurrences(void);
uint32_t isaac_log_sibling_flush_body_va(void);
uint32_t isaac_log_sibling_flush_body_bytes(void);

/* Byte-diff vs 0x00a83fd0: 3-byte prefix, not one template. Returns 0. */
int32_t isaac_log_sibling_write_is_one_template_with_v6(void);
uint32_t isaac_log_sibling_write_shared_prefix_bytes(void);

/* Byte-diff vs 0x00a52820: 42/44 shared, two diffs. Returns 1.
   The fread body is NOT translated this unit. */
int32_t isaac_log_sibling_fread_is_one_template(void);
uint32_t isaac_log_sibling_fread_shared_bytes(void);

/* ============ v7: LAN — the ordered typed host-action plan ============ */

typedef struct IsaacLogSiblingWritePlan {
  int32_t state_is_open;         /* state == 1, FULL 32-bit */
  int32_t fwrite;                /* same: HOST fwrite fires */
  int32_t fflush;                /* always 0 — neither arm */
  int32_t tests_file_null;       /* always 0 */
  uint32_t bytes_returned;       /* 0 on skip, else count*size wrap */
  uint32_t stack_bytes_popped;   /* 0xc */
  uint32_t vtbl_slot;            /* 0x1c */
  uint32_t body_va;              /* 0x00a52850 */
  uint32_t fwrite_iat;
  uint32_t flush_body_va;        /* 0x00a52880, separate slot */
  uint32_t action_count;         /* 0 (skip) or 1 (fwrite) */
} IsaacLogSiblingWritePlan;

void isaac_log_sibling_write_plan(uint32_t state,
                                  uint32_t file_ptr,
                                  uint32_t fwrite_count,
                                  uint32_t size,
                                  IsaacLogSiblingWritePlan* out);

uint32_t isaac_log_sibling_write_action_count(uint32_t state);
uint32_t isaac_log_sibling_write_action_at(uint32_t state, uint32_t index);
int32_t isaac_log_sibling_write_action_is_platform(uint32_t action);

/* ============ v8: LAO — FULL-dword state==0 gate, NOT state==1 ========== */

/* 0x00a52823 `cmp dword [ecx+4], 0 ; je` — FULL 32-bit equality with 0.
   0x100 / 0x101 do NOT fread. Drive unmasked. Opposite of the v7 write's
   `cmp ..., 1`. Do not fold. */
int32_t isaac_log_sibling_fread_state_is_readable(uint32_t state);
int32_t isaac_log_sibling_fread_needed(uint32_t state);

/* ============ v8: LAP — fflush never in this body, no FILE* null test == */

/* Neither arm of 0x00a52820 calls fflush. state is the unused operand a
   mutant that copies v6's "always 1" would read. Always returns 0.
   Transcribed from this PE body; not copied from the v7 write. */
int32_t isaac_log_sibling_fread_fflush_needed(uint32_t state);

/* FILE* is pushed and never tested. file_ptr is taken and discarded so a
   mutant that inserts `test file,file` changes an observable. Always 0. */
int32_t isaac_log_sibling_fread_tests_file_null(uint32_t file_ptr);

/* ============ v8: LAQ — imul byte count, skip returns 0, no fflush ===== */

/* 0x00a52844 `imul eax, [ebp+0xc]` — 32-bit wrap, no clamp. */
uint32_t isaac_log_sibling_fread_byte_count(uint32_t fread_count,
                                           uint32_t size);

/* Skip arm (`xor eax,eax`) returns 0; readable arm returns the imul. */
uint32_t isaac_log_sibling_fread_bytes_returned(uint32_t state,
                                               uint32_t fread_count,
                                               uint32_t size);

/* ============ v8: LAR — vtbl slot, reach, v7 write consumed by ref ===== */

uint32_t isaac_log_sibling_fread_stack_bytes_popped(void);
uint32_t isaac_log_sibling_fread_vtbl_slot(void);
uint32_t isaac_log_sibling_fread_body_va(void);
uint32_t isaac_log_sibling_fread_body_bytes(void);
uint32_t isaac_log_sibling_fread_direct_callsites(void);
uint32_t isaac_log_sibling_fread_raw_occurrences(void);

/* v7 write 0x00a52850, already peeled — consumed by reference. */
uint32_t isaac_log_sibling_fread_write_sibling_va(void);

/* Returns 0: the cmp immediate and IAT differ. Do not fold. */
int32_t isaac_log_sibling_fread_is_folded_into_v7(void);

/* ============ v8: LAS — the ordered typed host-action plan ============ */

typedef struct IsaacLogSiblingFreadPlan {
  int32_t state_is_readable;     /* state == 0, FULL 32-bit */
  int32_t fread;                 /* same: HOST fread fires */
  int32_t fflush;                /* always 0 — neither arm */
  int32_t tests_file_null;       /* always 0 */
  uint32_t bytes_returned;       /* 0 on skip, else count*size wrap */
  uint32_t stack_bytes_popped;   /* 0xc */
  uint32_t vtbl_slot;            /* 0x14 */
  uint32_t body_va;              /* 0x00a52820 */
  uint32_t fread_iat;            /* 0x00b188c8 */
  uint32_t write_sibling_va;     /* 0x00a52850, by reference */
  uint32_t action_count;         /* 0 (skip) or 1 (fread) */
} IsaacLogSiblingFreadPlan;

void isaac_log_sibling_fread_plan(uint32_t state,
                                  uint32_t file_ptr,
                                  uint32_t fread_count,
                                  uint32_t size,
                                  IsaacLogSiblingFreadPlan* out);

uint32_t isaac_log_sibling_fread_action_count(uint32_t state);
uint32_t isaac_log_sibling_fread_action_at(uint32_t state, uint32_t index);
int32_t isaac_log_sibling_fread_action_is_platform(uint32_t action);

/* ======================= v9: sink/neighbor deleting-dtor island ======================= */

/* Two instances of ONE template (0x00a83fa0 log-sink deleting dtor, vtbl
   +0; 0x00a84030 neighboring object's deleting dtor):
     push ebp ; mov ebp,esp ; push esi ; mov esi,ecx
     [instance prologue]                    ; sink: mov [esi],0xba5184
     call <inner body>                      ; HOST (0xa52410 / 0xa84060)
     test byte ptr [ebp + 8], 1 ; je skip   ; delete flag: LOW BYTE bit 0
     push <size> ; push esi ; call 0xaef15c ; HOST sized delete (0x10/0x30)
     mov eax, esi ; pop esi ; pop ebp ; ret 4
   Reach: sink slot 0 dispatched by the teardown 0x00a7183c; neighbor slot 0
   by its own object's dispatch (vtable 0x00ba5520 stored in the inner
   body 0x00a84060). The inner bodies stay host (SEH+GS, fclose/guest-free
   tails) — NARROWED, not removed. */

/* Deterministic variant select: 1 -> NEIGHBOR, else SINK (canonical 0). */
uint32_t isaac_log_dtor_island_variants(void);
uint32_t isaac_log_dtor_island_body_va(uint32_t variant);
uint32_t isaac_log_dtor_island_body_bytes(uint32_t variant);
uint32_t isaac_log_dtor_island_inner_body_va(uint32_t variant);
uint32_t isaac_log_dtor_island_free_size(uint32_t variant);
uint32_t isaac_log_dtor_island_vtable_va(uint32_t variant);

/* 1 for the sink (0x00a83fa6, in the wrapper), 0 for the neighbor (the
   vtable store 0x00a84089 lives in the inner body). */
int32_t isaac_log_dtor_island_wrapper_stores_vtable(uint32_t variant);

/* ret 4 — the deleting dtor cleans its one stack argument itself. */
uint32_t isaac_log_dtor_island_ret_args(void);

/* mov eax, esi — both wrappers return `this`. */
int32_t isaac_log_dtor_island_returns_this(void);

/* test byte ptr [ebp+8], 1 ; je — bit 0 of the LOW BYTE ONLY. Wide drives:
   0x100 / 0x2 / 0xfffffffe do NOT delete; 0x101 / 0x1ff / 0xffffffff do. */
int32_t isaac_log_dtor_island_delete_needed(uint32_t delete_flag);

/* ======================= v15: the deleting-dtor WRAPPER bodies ========== */

/* W1 — BOTH wrappers call the inner body FIRST and UNCONDITIONALLY (sink
   0x00a83fac -> 0x00a52410; neighbor 0x00a84036 -> 0x00a84060), BEFORE the
   delete gate. NO flag value suppresses the inner (0x0 / 0x100 /
   0xfffffffe all fire); the gate only controls the sized-delete. */
int32_t isaac_log_dtor_island_inner_fires(uint32_t delete_flag,
                                          uint32_t variant);

/* W3 — the sized-delete (`push <size>; push esi; call 0xaef15c; add esp,8`)
   fires ONLY when the gate passes, with the variant's size immediate:
   0x10 (sink) / 0x30 (neighbor); 0 when the gate fails. The host shim
   0xaef15c DROPS the size — it stays host. */
uint32_t isaac_log_dtor_island_sized_delete_size(uint32_t delete_flag,
                                                 uint32_t variant);

/* The full wrapper observable (W1..W5 composed). Layout pinned below and
   in the tests. `out == NULL` is a no-op. */
typedef struct IsaacLogDtorIslandPlan {
  uint32_t inner_va;     /* 0x00a52410 / 0x00a84060 — the FIRST E8 target */
  int32_t inner_fires;   /* always 1 (W1) */
  uint32_t gate_va;      /* 0x00a83fb1 / 0x00a8403b — test byte [ebp+8],1 */
  int32_t delete_fires;  /* (flag & 1) of the LOW BYTE (W2) */
  uint32_t delete_size;  /* gate ? variant free size : 0 (W3) */
  uint32_t delete_va;    /* 0x00aef15c — the sized-delete shim (HOST) */
  int32_t returns_this;  /* mov eax, esi — always 1 (W5) */
  uint32_t ret_args;     /* ret 4 — one stack dword (W5) */
} IsaacLogDtorIslandPlan;

void isaac_log_dtor_island_wrapper_plan(uint32_t delete_flag,
                                        uint32_t variant,
                                        IsaacLogDtorIslandPlan* out);

/* ============ v16: the SIBLING deleting-dtor WRAPPER 0x00a523e0 ========= */

/* THIRD instance of the ONE wrapper template (v15 W1..W6 + this unit's
   deltas). Root (identity checked this unit with the section-table census):
   sibling vtable 0x00b9e940 slot +0 (entry file 0x79cf40) HOLDS 0x00a523e0
   — the last unlanded slot of the sibling vtable (all others: +0x14 fread
   v8, +0x1c sibling-write v7, +0x20 flush v13, +0x24/+0x28 open v10).

   Raw dword census: 0x00a523e0 occurs ONCE in the whole image (the slot
   itself). The sibling vtable 0x00b9e940 is stored at 14 .text sites — 13
   constructor stores (0x008713e0, 0x0092946f, 0x009295dc, 0x00a16864,
   0x00a17ee1, 0x00a25022, 0x00a250e6, 0x00a7a5b6, 0x00a7b73c, 0x00a7bbd8,
   0x00a7be1b, 0x00a7c67b, 0x00a7c80a) + the v11 inner's vtable-#1 store
   0x00a5243a (mov [esi], 0xb9e940). Sibling-class objects ARE constructed;
   their slot-0 delete dispatch (`mov eax,[ecx]; call [eax]`) reaches
   0x00a523e0. NOT dead.

   Body 0x00a523e0..0x00a52400 = 0x20 bytes, 15 active insns, first ret
   0x00a52400 `ret 4`, E8 2 (0xa52410 + 0xaef15c), mem-stores 0 IN THE
   WRAPPER, int3 pad 0xa52403..0xa5240f then the v11 inner at 0xa52410:

     0x00a523e0 push ebp
     0x00a523e1 mov ebp, esp
     0x00a523e3 push esi
     0x00a523e4 mov esi, ecx            ; this
     0x00a523e6 call 0xa52410           ; inner dtor — UNCONDITIONAL, FIRST
                                         ;   (the SAME inner as the SINK)
     0x00a523eb test byte ptr [ebp+8],1 ; delete gate: LOW BYTE bit 0
     0x00a523ef je 0xa523fc
     0x00a523f1 push 0x10               ; sized-delete size = 0x10 (SINK's)
     0x00a523f3 push esi
     0x00a523f4 call 0xaef15c           ; HOST sized-delete shim (stays host)
     0x00a523f9 add esp, 8
     0x00a523fc mov eax, esi            ; returns this
     0x00a523fe pop esi
     0x00a523ff pop ebp
     0x00a52400 ret 4

   Deltas vs the v15 pair (pinned, never homogenised):
     - inner_va = 0x00a52410, the SAME body as the sink's inner (the ONLY
       cross-variant inner share; the neighbor's 0x00a84060 differs).
     - free_size = 0x10 (the sink's; the neighbor's is 0x30).
     - NO vtable store in the wrapper (wrapper_stores_vtable = 0, like the
       neighbor): the inner body stores the SIBLING vtable 0x00b9e940 at
       0x00a52438 (the v11 inner's vtable #1, ALWAYS, pre-gate).
     - vtable_va = 0x00b9e940 (== ISAAC_LOG_SIBLING_VTABLE_VA), held at
       sibling-vtable slot +0 (no +0x20 nop, no fflush slot interplay).
     - same gate/ret laws as W2/W5 (bit 0 of the LOW BYTE, ret 4, returns
       this).
     - call-order VAs: INNER_CALL 0xa523e6 < GATE 0xa523eb < DELETE_CALL
       0xa523f4 < RET 0xa52400.

   Laws: inner_fires / delete_needed / sized_delete_size / wrapper_plan all
   take the variant and must serve variant 2 with the SIBLING table rows.
   Identity/VA exports added this unit: body_va, body_bytes, inner_body_va,
   inner_call_va, gate_va, delete_call_va, ret_va, free_size, vtable_va,
   vtable_entry_va, wrapper_stores_vtable (all variant-parametric; variant 2
   is the SIBLING, any other value narrows to the SINK default).        */

enum {
  ISAAC_LOG_VA_SIBLING_DTOR_BODY = 0x00a523e0u, /* == ISAAC_LOG_VA_SIBLING_DTOR */
  ISAAC_LOG_SIBLING_DTOR_BODY_END = 0x00a52400u,   /* ret 4 */
  ISAAC_LOG_SIBLING_DTOR_FIRST_RET_VA = 0x00a52400u,
  ISAAC_LOG_SIBLING_DTOR_BODY_BYTES = 0x20u,
  ISAAC_LOG_SIBLING_DTOR_INSN_COUNT = 15,
  ISAAC_LOG_SIBLING_DTOR_INNER = 0x00a52410u,      /* == SINK_DTOR_INNER */
  ISAAC_LOG_SIBLING_DTOR_INNER_CALL_VA = 0x00a523e6u,
  ISAAC_LOG_SIBLING_DTOR_GATE_VA = 0x00a523ebu,   /* test byte [ebp+8],1 */
  ISAAC_LOG_SIBLING_DTOR_DELETE_CALL_VA = 0x00a523f4u,
  ISAAC_LOG_SIBLING_DTOR_FREE_SIZE = 0x10u,        /* == SINK_DTOR_FREE_SIZE */
  ISAAC_LOG_SIBLING_DTOR_VTABLE = 0x00b9e940u,     /* == SIBLING_VTABLE_VA,
                                                      stored INSIDE the inner
                                                      at 0x00a52438 */
  ISAAC_LOG_SIBLING_DTOR_VTABLE_SLOT = 0,          /* vtable+0 */
  ISAAC_LOG_SIBLING_DTOR_VTABLE_ENTRY = 0x00b9e940u, /* file 0x79cf40 */
  ISAAC_LOG_SIBLING_DTOR_VTABLE_TEXT_STORES = 14,  /* 13 ctors + inner #1 */
  ISAAC_LOG_SIBLING_DTOR_RAW_OCCURRENCES = 1,      /* the slot itself */
  ISAAC_LOG_SIBLING_DTOR_RET_ARGS = 4,             /* == the island's */
  ISAAC_LOG_SIBLING_DTOR_RETURNS_THIS = 1,
  ISAAC_LOG_SIBLING_DTOR_WRAPPER_STORES_VTABLE = 0,
  ISAAC_LOG_SIBLING_DTOR_INBOUND_CALLSITES = 3,    /* v11 inner census:
                                                      0xa523e6 THIS,
                                                      0xa83fac sink,
                                                      0xb12e22 funclet */
  ISAAC_LOG_SINK_DTOR_RET_VA = 0x00a83fc6u,        /* ret 4 */
  ISAAC_LOG_NEIGHBOR_DTOR_RET_VA = 0x00a84050u,    /* ret 4 */
  ISAAC_LOG_TEXT_INSN_COUNT_V16 = 2094319, /* carried (same SHA, decode) */
  ISAAC_LOG_TEXT_UNDECODABLE_BYTES_V16 = 469,
  ISAAC_LOG_V16_BATCHED_VAS = 2, /* a523e0 + a52410 (inner share check) */
  ISAAC_LOG_V16_EXACT_ZHL_MATCHES = 0
};

/* v16: per-variant wrapper VAs (all variant-parametric, address-stable). */
uint32_t isaac_log_dtor_island_inner_call_va(uint32_t variant);
uint32_t isaac_log_dtor_island_gate_va(uint32_t variant);
uint32_t isaac_log_dtor_island_delete_call_va(uint32_t variant);
uint32_t isaac_log_dtor_island_ret_va(uint32_t variant);
uint32_t isaac_log_dtor_island_vtable_entry_va(uint32_t variant);

/* ============ v10: LAV — the open helpers (vtbl +0x24 / +0x28) ========= */

/* The FINAL pure island of the sink/sibling I/O band: the two fopen opens.

   Root (identity checked this unit with
   scripts/decomp/identify-zhl-address.mjs over BOTH VAs in ONE call — NO
   exact ZHL matches; the names are address-stable):

     0x00a52540  open ("rb"), __thiscall(this=ecx), `ret 4` (ONE stack arg:
                 path at [ebp+8]). .text raw offset 0x00651940. Body
                 0x00a52540..0x00a525ff (0xc0 bytes, 68 instructions, TWO
                 `ret 4` — the first ret 0x00a525d3 is the success arm, the
                 second 0x00a525ff is the FAIL-arm join; int3 pad
                 0x00a52602..0x00a5260f to the write body). SEH handler
                 0x00af0b60, security cookie 0x00bf93b4.
     0x00a52610  open ("wb"/"ab"), __thiscall(this=ecx), `ret 8` (TWO stack
                 args: path at [ebp+8], append flag byte at [ebp+0xc]).
                 .text raw offset 0x00651a10. Body 0x00a52610..0x00a526bc
                 (0xac bytes, 61 instructions, ONE `ret 8` at 0x00a526bc).
                 SEH handler 0x00af12f0, security cookie 0x00bf93b4.

   Vtable slots (dwords read from the image this unit — BOTH vtables hold
   BOTH bodies):
     sibling vtbl 0x00b9e940 +0x24 (0x00b9e964) = 0x00a52540
     sibling vtbl 0x00b9e940 +0x28 (0x00b9e968) = 0x00a52610
     sink    vtbl 0x00ba5184 +0x24 (0x00ba51a8) = 0x00a52540
     sink    vtbl 0x00ba5184 +0x28 (0x00ba51ac) = 0x00a52610

   Reach (census this unit): the COMPILE-TIME DEVIRT pattern
   `mov eax,[vtable+slot] ; cmp eax,<body> ; jne indirect ; call <body>` —
   NINE direct `call 0x00a52540` sites in .text (0x00a16885, 0x00a17eff,
   0x00a2505a, 0x00a7a5d4, 0x00a7b75a, 0x00a7bbf6, 0x00a7be39,
   0x00a7c699, 0x00a7c828) and ONE direct `call 0x00a52610` (0x00a25107).
   Raw dword scan of the whole image: 0x00a52540 occurs 11 times (the two
   .rdata vtable slots + the 9 `cmp` immediates), 0x00a52610 occurs 3 times
   (the two vtable slots + the ONE `cmp` immediate at 0x00a25100). Both
   bodies are GENUINELY REACHABLE — the devirt sites decode as

   0x00a25050  mov eax, dword ptr [eax + 0x24]   ; sibling vtbl slot
   0x00a25053  cmp eax, 0xa52540                 ; devirt compare
   0x00a25058  jne 0xa25061                      ; generic-vtable fallback
   0x00a2505a  call 0xa52540                     ; DIRECT (shipped fast path)
   0x00a25061  call eax                          ; indirect (other vtables)

   and the write sibling (0x00a250fd..0x00a2510e) is identical with
   +0x28 / 0xa52610; the write callsite pushes TWO args:
   0x00a250f9 push dword ptr [ebp + 0xc]  (append flag) / 0x00a250fc push
   edi (path) — matching `ret 8`. The read callsite pushes ONE arg
   (0x00a2504f push edi) — matching `ret 4`.

   ---- exact control flow, transcribed branch-by-branch from PE ----

   READ 0x00a52540 (rb). The two interior helpers 0x00a5a7a0 (path combine)
   and 0x00a648b0 (allocator accounting) are HOST (standing decision); the
   ONLY observable they feed the law is "did the combine return NULL".

   0x00a52564  mov edi, ecx                   ; this
   0x00a52566  mov ecx, [ebp+8]               ; path
   0x00a5256f  call 0x00a5a7a0 (edx=0)        ; HOST combine(path) -> esi
   0x00a52579  test esi, esi ; je 0xa525ed    ; PATH GATE: combine NULL ->
                                               ; NO stores AT ALL (file/state/
                                               ; path cells untouched), ret 0
   0x00a5257d  push 0xb6d108                  ; "rb" — the ONLY mode
   0x00a52583  call [0xb188fc]                ; HOST fopen(path, "rb")
   0x00a5258c  mov [edi+0xc], eax             ; FILE* store — UNCONDITIONAL,
                                               ; even when fopen returned NULL
   0x00a5258f  test eax, eax ; je 0xa525d6    ; fopen NULL -> fail arm
   0x00a52599  mov [edi+4], 0                 ; state := 0 (OPEN_READ) —
                                               ; ONLY on fopen success
   0x00a525a2  call 0x00a5a7a0 (ecx=esi)      ; HOST SECOND combine
   0x00a525a7  mov [edi+8], eax               ; path store — ONLY on success
   0x00a525c1  mov al, 1 ; ret 4              ; success returns 1
   0x00a525d6  call 0x00a648b0                ; HOST accounting (fopen-fail arm)
   0x00a525ed  xor al, al ; ret 4             ; <- JOIN: ret 0 (combine NULL
                                               ;    OR fopen NULL); state/path
                                               ;    NOT stored on either fail

   WRITE 0x00a52610 (wb/ab):

   0x00a52637  mov edx, [0xc5aa98]            ; HOST combine base (same
                                               ; global the installer reads)
   0x00a5263d  mov ecx, [ebp+8]               ; path
   0x00a52644  call 0x00a5a7a0                ; HOST combine(path) -> esi
   0x00a52649  cmp byte [ebp+0xc], 0          ; append flag — LOW BYTE ONLY
   0x00a5264f  mov eax, 0xb9e938              ; "wb"
   0x00a52654  mov edx, 0xb6d104              ; "ab"
   0x00a52659  cmove edx, eax                 ; ZF -> edx = "wb":
                                               ; mode = (flag & 0xff) == 0
                                               ;             ? "wb" : "ab"
   0x00a5265e  call [0xb188fc]                ; HOST fopen(path, mode) —
                                               ; NO path gate: fopen runs
                                               ; even when combine == NULL
                                               ; (the contrast with the read)
   0x00a52667  mov [edi+0xc], eax             ; FILE* store — UNCONDITIONAL
   0x00a5266a  test eax, eax ; jne 0xa52672   ; fopen NULL -> xor bl,bl
   0x00a52672  mov [edi+4], 1                 ; state := 1 (OPEN) —
                                               ; ONLY on fopen success
   0x00a52681  call 0x00a5a7a0 (ecx=esi)      ; HOST SECOND combine
   0x00a52689  mov [edi+8], eax               ; path store — ONLY on success
   0x00a5268e  test esi, esi ; je 0xa526a9    ; ACCOUNTING GATE (join of both
                                               ; fopen arms): 0x00a648b0 runs
                                               ; iff combine != NULL
   0x00a526a9  mov al, bl ; ret 8             ; bl = 1 iff fopen succeeded —
                                               ; the return does NOT consult
                                               ; the combine result (contrast
                                               ; with the read's `&&`)

   The read stores state 0 on success (it feeds the v8 fread gate whose
   `cmp [ecx+4], 0` is the SAME constant), the write stores state 1 (v6/v7
   write gates). Both `mov [edi+0xc]` stores are UNCONDITIONAL — D-LOG-11's
   installer had the same shape; these two leaves of the class share it.
   The state/path stores are CONDITIONAL (success only) in BOTH bodies.

   Pure island (translated here): the read's path gate, the read's
   `&&`-return, the write's byte-width mode select (low byte ONLY — drive
   unmasked with 0x100: it must select "wb"), the write's ungated fopen and
   its fopen-only return, BOTH unconditional FILE* stores, BOTH
   success-only state/path stores, the accounting-reach gates, the vtbl
   slot identities (+0x24/+0x28, both vtables), the ret widths (4 / 8),
   and the reach census (9 + 1 direct callsites).

   Host (NOT translated): fopen [0x00b188fc], the path-combine interior
   0x00a5a7a0 (read: edx = 0; write: edx = [0xc5aa98]), the allocator
   accounting 0x00a648b0, and the SEH/GS frames (0x00af0b60 / 0x00af12f0,
   cookie 0x00bf93b4 — same frame shape as every body in this family).

   Identity pass: 2 VAs batched in ONE identify-zhl call, 0 exact matches. */

enum {
  ISAAC_LOG_VA_OPEN_READ = 0x00a52540u,  /* == SIBLING_OPEN_READ */
  ISAAC_LOG_VA_OPEN_READ_END = 0x00a525ffu, /* second `ret 4` */
  ISAAC_LOG_VA_OPEN_WRITE = 0x00a52610u, /* == SIBLING_OPEN_WRITE */
  ISAAC_LOG_VA_OPEN_WRITE_END = 0x00a526bcu, /* `ret 8` */
  ISAAC_LOG_OPEN_READ_BODY_BYTES = 0xc0u,
  ISAAC_LOG_OPEN_WRITE_BODY_BYTES = 0xacu,
  ISAAC_LOG_OPEN_READ_INSN_COUNT = 68,
  ISAAC_LOG_OPEN_WRITE_INSN_COUNT = 61,
  ISAAC_LOG_OPEN_READ_RET_ARGS = 4,   /* `ret 4` — one stack arg */
  ISAAC_LOG_OPEN_WRITE_RET_ARGS = 8,  /* `ret 8` — two stack args */
  ISAAC_LOG_OPEN_MODE_WB_VA = 0x00b9e938u, /* "wb\x00" */
  ISAAC_LOG_OPEN_MODE_AB_VA = 0x00b6d104u, /* "ab\x00" */
  ISAAC_LOG_OPEN_MODE_RB_VA = 0x00b6d108u, /* "rb\x00" */
  ISAAC_LOG_OPEN_MODE_LEN = 2,
  ISAAC_LOG_OPEN_READ_STATE = 0,      /* mov [edi+4], 0 — v8 fread's constant */
  ISAAC_LOG_OPEN_WRITE_STATE = 1,     /* mov [edi+4], 1 — v6/v7 write's */
  ISAAC_LOG_VA_OPEN_READ_PATH_GATE = 0x00a52579u,  /* test esi,esi ; je */
  ISAAC_LOG_VA_OPEN_READ_FOPEN = 0x00a52583u,
  ISAAC_LOG_VA_OPEN_READ_FILE_STORE = 0x00a5258cu, /* mov [edi+0xc], eax */
  ISAAC_LOG_VA_OPEN_READ_STATE_STORE = 0x00a52599u, /* mov [edi+4], 0 */
  ISAAC_LOG_VA_OPEN_READ_COMBINE1 = 0x00a5256fu,
  ISAAC_LOG_VA_OPEN_READ_COMBINE2 = 0x00a525a2u,
  ISAAC_LOG_VA_OPEN_READ_RET_OK = 0x00a525c1u,
  ISAAC_LOG_VA_OPEN_READ_RET_FAIL = 0x00a525edu,  /* the join */
  ISAAC_LOG_VA_OPEN_READ_ACCOUNTING_OK_SITE = 0x00a525b9u,
  ISAAC_LOG_VA_OPEN_READ_ACCOUNTING_FAIL_SITE = 0x00a525e5u,
  ISAAC_LOG_VA_OPEN_WRITE_MODE_TEST = 0x00a52649u, /* cmp byte [ebp+0xc], 0 */
  ISAAC_LOG_VA_OPEN_WRITE_MODE_SELECT = 0x00a52659u, /* cmove edx,eax */
  ISAAC_LOG_VA_OPEN_WRITE_FOPEN = 0x00a5265eu,    /* NO path gate before it */
  ISAAC_LOG_VA_OPEN_WRITE_FILE_STORE = 0x00a52667u,
  ISAAC_LOG_VA_OPEN_WRITE_STATE_STORE = 0x00a52678u, /* mov [edi+4], 1 */
  ISAAC_LOG_VA_OPEN_WRITE_COMBINE1 = 0x00a52644u,
  ISAAC_LOG_VA_OPEN_WRITE_COMBINE2 = 0x00a52681u,
  ISAAC_LOG_VA_OPEN_WRITE_ACCOUNTING_GATE = 0x00a5268eu, /* test esi,esi */
  ISAAC_LOG_VA_OPEN_WRITE_ACCOUNTING_SITE = 0x00a526a1u,
  ISAAC_LOG_VA_OPEN_WRITE_RET = 0x00a526a9u,      /* mov al, bl */
  ISAAC_LOG_OPEN_READ_ACCOUNTING_SITES = 2, /* per-fopen-arm (0xb9/0xe5) */
  ISAAC_LOG_OPEN_WRITE_ACCOUNTING_SITES = 1, /* the join, esi-gated */
  ISAAC_LOG_OPEN_READ_COMBINE_BASE = 0,          /* edx = 0 */
  ISAAC_LOG_OPEN_WRITE_COMBINE_BASE_VA = 0x00c5aa98u, /* edx = [c5aa98] */
  ISAAC_LOG_OPEN_READ_SEH_HANDLER = 0x00af0b60u,
  ISAAC_LOG_OPEN_WRITE_SEH_HANDLER = 0x00af12f0u,
  ISAAC_LOG_OPEN_VTABLE_SLOT_READ = 0x24,
  ISAAC_LOG_OPEN_VTABLE_SLOT_WRITE = 0x28,
  ISAAC_LOG_VA_SIBLING_VTBL_OPEN_READ_ENTRY = 0x00b9e964u,
  ISAAC_LOG_VA_SIBLING_VTBL_OPEN_WRITE_ENTRY = 0x00b9e968u,
  ISAAC_LOG_VA_SINK_VTBL_OPEN_READ_ENTRY = 0x00ba51a8u,
  ISAAC_LOG_VA_SINK_VTBL_OPEN_WRITE_ENTRY = 0x00ba51acu,
  ISAAC_LOG_OPEN_READ_DIRECT_CALLSITES = 9,
  ISAAC_LOG_OPEN_WRITE_DIRECT_CALLSITES = 1,
  ISAAC_LOG_OPEN_READ_RAW_OCCURRENCES = 11, /* 2 .rdata slots + 9 cmp imm */
  ISAAC_LOG_OPEN_WRITE_RAW_OCCURRENCES = 3,  /* 2 .rdata slots + 1 cmp imm */
  ISAAC_LOG_VA_OPEN_READ_DEVIRT_COMPARE = 0x00a25053u,
  ISAAC_LOG_VA_OPEN_READ_DEVIRT_CALL = 0x00a2505au,
  ISAAC_LOG_VA_OPEN_WRITE_DEVIRT_COMPARE = 0x00a25100u,
  ISAAC_LOG_VA_OPEN_WRITE_DEVIRT_CALL = 0x00a25107u,
  ISAAC_LOG_OPEN_ACTION_NONE = 0,
  ISAAC_LOG_OPEN_ACTION_FOPEN = 1,     /* platform */
  ISAAC_LOG_OPEN_ACTIONS_MAX = 1,
  ISAAC_LOG_TEXT_INSN_COUNT_V10 = 2094319,
  ISAAC_LOG_TEXT_UNDECODABLE_BYTES_V10 = 469,
  ISAAC_LOG_V10_BATCHED_VAS = 2,
  ISAAC_LOG_V10_EXACT_ZHL_MATCHES = 0
};

/* ============ v11: the dtor inner body 0x00a52410 (SEH+GS) ========= */

/* The ranked frontier AFTER the open helpers: the sink dtor's inner body
   (called from BOTH deleting-dtor wrappers + one SEH funclet tail-jump).

   Root (identity checked this unit with
   scripts/decomp/identify-zhl-address.mjs over FOUR VAs in ONE call —
   NO exact ZHL matches; all stay address-stable):

     0x00a52410  cdecl-ish plain `ret` body, this = ecx, 0 stack args.
                 .text raw offset 0x00651810. Body 0x00a52410..0x00a524a1
                 (0x92 bytes, 58 instructions, ONE `ret` at 0x00a524a1;
                 int3 pad 0x00a524a2..0x00a524af to the next body).
                 SEH handler 0x00b12420, security cookie 0x00bf93b4 —
                 SAME frame shape as every body in this family.

   Exact control flow (full body, this unit):

     0x00a52410  push ebp
     0x00a52411  mov ebp, esp
     0x00a52413  push -1                       ; SEH state
     0x00a52415  push 0xb12420                 ; SEH handler
     0x00a5241a  mov eax, fs:[0]
     0x00a52420  push eax                      ; prev fs:[0] link
     0x00a52421  push esi
     0x00a52422  mov eax, [0xbf93b4]           ; GS cookie
     0x00a52427  xor eax, ebp
     0x00a52429  push eax                      ; cookie ^ ebp
     0x00a5242a  lea eax, [ebp-0xc]
     0x00a5242d  mov fs:[0], eax               ; register SEH frame
     0x00a52433  mov esi, ecx                  ; this
     0x00a52435  mov eax, [esi+0xc]            ; eax = FILE* cell (+0xc)
     0x00a52438  mov [esi], 0xb9e940           ; VTABLE STORE #1: 0xb9e940
                                               ;   (sibling vtable!) ALWAYS,
                                               ;   before the fclose gate
     0x00a5243e  test eax, eax                 ; FCLOSE GATE: the FULL DWORD
     0x00a52440  je 0xa52453                   ;   (NOT low byte): 0x100 /
                                               ;   0x1ff / 0xffffffff close
     0x00a52442  push eax
     0x00a52443  call [0xb1890c]               ; HOST fclose (IAT)
     0x00a52449  add esp, 4
     0x00a5244c  mov [esi+0xc], 0              ; FILE* cell := NULL after
                                               ;   fclose (fclose arm ONLY)
     0x00a52453  mov edx, [esi+8]              ; edx = path cell (+8)
     0x00a52456  mov [esi+4], 2                ; STATE STORE #1: state := 2
                                               ;   (ALWAYS, before the free
                                               ;   gate — the skip arm ALSO
                                               ;   gets state 2)
     0x00a5245d  test edx, edx                 ; GUEST-FREE GATE: FULL DWORD
     0x00a5245f  je 0xa52486                   ;   (NOT low byte)
     0x00a52461  push 0
     0x00a52463  push 0
     0x00a52465  mov cl, 1
     0x00a52467  mov [ebp-4], 0                ; SEH state := 0 (normal)
     0x00a5246e  call 0xa648b0                 ; HOST shared allocator
                                               ;   (guest free)
     0x00a52473  add esp, 8
     0x00a52476  mov [esi+8], 0                ; path cell := NULL after
                                               ;   free (free arm ONLY)
     0x00a5247d  mov [esi+4], 2                ; STATE STORE #2: state := 2
                                               ;   (free arm re-store)
     0x00a52484  jmp 0xa5248c
     0x00a52486  mov [esi], 0xb833d8           ; VTABLE STORE #2: 0xb833d8
                                               ;   (path==0 arm ONLY)
     0x00a5248c  mov [esi], 0xb9c15c           ; VTABLE STORE #3: 0xb9c15c
                                               ;   ALWAYS — final vtable in
                                               ;   BOTH arms
     0x00a52492  mov ecx, [ebp-0xc]
     0x00a52495  mov fs:[0], ecx
     0x00a5249c  pop ecx                       ; pops the cookie WITHOUT
                                               ;   checking (no
                                               ;   __security_check_cookie
                                               ;   call on the normal path!)
     0x00a5249d  pop esi
     0x00a5249e  mov esp, ebp
     0x00a524a0  pop ebp
     0x00a524a1  ret

   Vtable chain (vtable-chain selection law): #1 0xb9e940 ALWAYS (this IS
   ISAAC_LOG_SIBLING_VTABLE_VA — the sink is a sibling-class object), #2
   0xb833d8 IFF path == 0 (the no-free arm), #3 0xb9c15c ALWAYS (both arms
   converge at 0xa5248c). So the FINAL vtable is ALWAYS 0xb9c15c; the mid
   0xb833d8 store happens exactly when the guest free did NOT run.

   Host (NOT translated): fclose [0x00b1890c], guest free 0x00a648b0
   (ISAAC_LOG_VA_SHARED_ALLOCATOR — the standing guest allocator), the
   SEH/GS frame (handler 0xb12420, cookie 0xbf93b4 — same frame shape as
   every body in this family; the normal-path epilogue pops the cookie
   without a __security_check_cookie call, matching the v10 bodies).

   Reach (whole-.text census, this unit): THREE inbound transfers:
     0x00a523e6  call 0xa52410   (sibling deleting dtor 0x00a523e0)
     0x00a83fac  call 0xa52410   (sink deleting dtor 0x00a83fa0 — v9)
     0x00b12e22  jmp 0xa52410    (SEH funclet tail-jump: mov ecx,
                                  [ebp-0x10]; jmp)
   Zero raw little-endian dword occurrences across all five sections (the
   body is bound ONLY by relative calls/jumps — no vtable slot, no data
   pointer, no mov-imm). NOT dead: both deleting-dtor wrappers plus the
   funclet dispatch it. fclose IAT call sites in the whole image: 8
   (0x85f3ee, 0x85f5f8, 0x85f726, 0x86e674, 0x9a9ebb, 0x9e7fb4, 0xa52443,
   0xa526db); the body owns 0xa52443.

   Pure island (translated here): the fclose gate (FULL-DWORD: 0x100 /
   0x1ff / 0xffffffff close, 0 does not), the guest-free gate (FULL-DWORD
   on the path cell), the state=2 store polarity (BOTH stores write 2 —
   the dtor closes the state machine to NO_FILE(2); the skip arm still
   gets the store because 0xa52456 precedes the free gate), the vtable
   chain selection (base 0xb9e940 always / mid 0xb833d8 iff path==0 /
   final 0xb9c15c always), the FILE* cell NULL-after-fclose and the path
   cell NULL-after-free (each store ONLY on its fire arm), the ret width
   (0 stack args), the inbound census (3) and the raw-occurrence census
   (0), the shared-allocator/fclose IAT identities, and the unverified-
   cookie epilogue (family-wide frame shape, matches v10).

   Identity pass: 4 VAs batched in ONE identify-zhl call (0xa52410,
   0xa83fa0, 0xa523e0, 0xb12e22), 0 exact matches. */

enum {
  ISAAC_LOG_VA_DTOR_INNER = 0x00a52410u,   /* == SINK_DTOR_INNER */
  ISAAC_LOG_VA_DTOR_INNER_END = 0x00a524a2u, /* first int3 after ret */
  ISAAC_LOG_DTOR_INNER_BODY_BYTES = 0x92u,
  ISAAC_LOG_DTOR_INNER_INSN_COUNT = 58,
  ISAAC_LOG_DTOR_INNER_RET_ARGS = 0,       /* plain `ret` — no ret N */
  ISAAC_LOG_DTOR_INNER_FCLOSE_GATE_VA = 0x00a5243eu, /* test eax,eax */
  ISAAC_LOG_DTOR_INNER_FCLOSE_BRANCH_VA = 0x00a52440u, /* je 0xa52453 */
  ISAAC_LOG_DTOR_INNER_FCLOSE_CALL_VA = 0x00a52443u, /* call [b1890c] */
  ISAAC_LOG_DTOR_INNER_FILE_NULL_VA = 0x00a5244cu, /* mov [esi+0xc],0 */
  ISAAC_LOG_DTOR_INNER_FREE_GATE_VA = 0x00a5245du, /* test edx,edx */
  ISAAC_LOG_DTOR_INNER_FREE_BRANCH_VA = 0x00a5245fu, /* je 0xa52486 */
  ISAAC_LOG_DTOR_INNER_FREE_CALL_VA = 0x00a5246eu, /* call 0xa648b0 */
  ISAAC_LOG_DTOR_INNER_PATH_NULL_VA = 0x00a52476u, /* mov [esi+8],0 */
  ISAAC_LOG_DTOR_INNER_STATE_STORE1_VA = 0x00a52456u, /* mov [esi+4],2 */
  ISAAC_LOG_DTOR_INNER_STATE_STORE2_VA = 0x00a5247du, /* mov [esi+4],2 */
  ISAAC_LOG_DTOR_INNER_VTABLE_STORE1_VA = 0x00a52438u, /* mov [esi],b9e940 */
  ISAAC_LOG_DTOR_INNER_VTABLE_STORE2_VA = 0x00a52486u, /* mov [esi],b833d8 */
  ISAAC_LOG_DTOR_INNER_VTABLE_STORE3_VA = 0x00a5248cu, /* mov [esi],b9c15c */
  ISAAC_LOG_DTOR_INNER_VTABLE_BASE = 0x00b9e940u, /* == SIBLING_VTABLE_VA */
  ISAAC_LOG_DTOR_INNER_VTABLE_MID = 0x00b833d8u,
  ISAAC_LOG_DTOR_INNER_VTABLE_FINAL = 0x00b9c15cu,
  ISAAC_LOG_DTOR_INNER_STATE_VALUE = 2,     /* == SINK_STATE_NO_FILE */
  ISAAC_LOG_DTOR_INNER_STATE_STORES = 2,    /* both write 2 */
  ISAAC_LOG_DTOR_INNER_SEH_HANDLER = 0x00b12420u,
  ISAAC_LOG_DTOR_INNER_INBOUND_CALLSITES = 3,
  ISAAC_LOG_DTOR_INNER_RAW_OCCURRENCES = 0,
  ISAAC_LOG_DTOR_INNER_FCLOSE_IAT_SITES = 8, /* whole-.text census */
  ISAAC_LOG_DTOR_INNER_ACTION_NONE = 0,
  ISAAC_LOG_DTOR_INNER_ACTION_FCLOSE = 1,   /* platform */
  ISAAC_LOG_DTOR_INNER_ACTION_FREE = 2,     /* platform (guest allocator) */
  ISAAC_LOG_DTOR_INNER_ACTIONS_MAX = 2,
  ISAAC_LOG_TEXT_INSN_COUNT_V11 = 2094319,
  ISAAC_LOG_TEXT_UNDECODABLE_BYTES_V11 = 469,
  ISAAC_LOG_V11_BATCHED_VAS = 4,
  ISAAC_LOG_V11_EXACT_ZHL_MATCHES = 0
};

/* ============ v12: the neighbor dtor inner body 0x00a84060 ============ */

/* The neighbor deleting-dtor's inner body (SEH+GS frame, host). this =
   ecx, 0 stack args, plain `ret`. Called by the v9 wrapper 0x00a84030
   (0x00a84036) and one SEH funclet tail-jump 0x00b14783 (`lea ecx,
   [ebp-0x40]; jmp`) — TWO inbound transfers, 0 raw dword references.

   Body (53 insns, 0x7d bytes, ret at 0x00a840dc):
     mov edx,[esi+0x20]      ; path cell (+0x20)
     mov [esi],0xba5520      ; vtable #1 — ALWAYS (BEFORE the free gate)
     test edx,edx ; je join  ; GUEST-FREE gate — FULL 32-bit path cell
     call 0xa648b0           ; HOST shared allocator (guest free)
     mov [esi+0x20],0        ; path cell := NULL (free arm ONLY)
     push [esi+0x28]         ; EOS LobbyDetails cell (+0x28) — NO GATE
     call [0xb180a4]         ; HOST _EOS_LobbyDetails_Release@4
     lea ecx,[esi+0x10]      ; sub-object at +0x10
     mov [esi+0x28],0        ; lobby cell := NULL (ALWAYS, AFTER the call)
     mov [esi],0xba2218      ; vtable #2 — ALWAYS (the FINAL vtable)
     call 0x426980           ; HOST sub-object dtor (always, LAST)
     ret

   Laws (deltas vs the v11 sink inner 0x00a52410 pinned, never
   homogenised): the guest-free gate is FULL-DWORD (0x100/0x1ff/0xffffffff
   fire, 0 skips); the path cell is NULLed ONLY on the free arm; the EOS
   release is UNCONDITIONAL — it fires even when the lobby cell is 0, and
   it receives the PRE-null cell value (the NULL store at 0x00a840bb comes
   AFTER the call); the lobby cell is NULLed ALWAYS; the vtable chain is
   TWO unconditional stores (0xba5520 -> 0xba2218) — there is NO
   conditional mid-store arm (the sink's 3-store chain is different);
   the sub-object dtor runs ALWAYS and LAST; no state-cell store exists in
   this body (the sink wrote [esi+4] twice). Host: guest free 0x00a648b0
   (ISAAC_LOG_VA_SHARED_ALLOCATOR), _EOS_LobbyDetails_Release@4
   [0x00b180a4] (eossdk-win32-shipping), sub-object dtor 0x00426980, the
   SEH/GS frame (handler 0x00af09f0 — DIFFERENT from the sink's 0xb12420,
   cookie 0xbf93b4; the normal-path epilogue pops the cookie without a
   __security_check_cookie call, matching v10/v11).

   Reach (whole-.text census, this unit): TWO inbound transfers —
   0x00a84036 call (wrapper 0x00a84030), 0x00b14783 jmp (SEH funclet
   tail-jump). Zero raw little-endian dword occurrences across all five
   sections (bound only by relative calls/jumps). NOT dead. Release IAT
   call sites in the whole image: 8 (0xa60938, 0xa60b0f, 0xa60cf2,
   0xa76d17, 0xa7ef55, 0xa840b2 <- this body, 0xa84196, 0xa84a27).

   Identity pass: 4 VAs batched in ONE identify-zhl call (0xa84060,
   0xa84030, 0xb14783, 0xa52880), 0 exact matches. */

enum {
  ISAAC_LOG_VA_NEIGHBOR_DTOR_INNER_END = 0x00a840ddu, /* first int3 */
  ISAAC_LOG_NEIGHBOR_DTOR_INNER_BODY_BYTES = 0x7du,
  ISAAC_LOG_NEIGHBOR_DTOR_INNER_INSN_COUNT = 53,
  ISAAC_LOG_NEIGHBOR_DTOR_INNER_RET_ARGS = 0,  /* plain `ret` — no ret N */
  ISAAC_LOG_NEIGHBOR_DTOR_INNER_FREE_GATE_VA = 0x00a8408fu, /* test edx */
  ISAAC_LOG_NEIGHBOR_DTOR_INNER_FREE_BRANCH_VA = 0x00a84091u, /* je join */
  ISAAC_LOG_NEIGHBOR_DTOR_INNER_FREE_CALL_VA = 0x00a840a0u, /* call a648b0 */
  ISAAC_LOG_NEIGHBOR_DTOR_INNER_PATH_NULL_VA = 0x00a840a8u, /* [esi+0x20]=0 */
  ISAAC_LOG_NEIGHBOR_DTOR_INNER_RELEASE_CALL_VA = 0x00a840b2u, /* call IAT */
  ISAAC_LOG_NEIGHBOR_DTOR_INNER_LOBBY_NULL_VA = 0x00a840bbu, /* [esi+0x28]=0 */
  ISAAC_LOG_NEIGHBOR_DTOR_INNER_SUB_DTOR_CALL_VA = 0x00a840c8u, /* call */
  ISAAC_LOG_NEIGHBOR_DTOR_INNER_VTABLE_STORE1_VA = 0x00a84089u, /* ba5520 */
  ISAAC_LOG_NEIGHBOR_DTOR_INNER_VTABLE_STORE2_VA = 0x00a840c2u, /* ba2218 */
  ISAAC_LOG_NEIGHBOR_DTOR_INNER_VTABLE_BASE = 0x00ba5520u,
  /* == ISAAC_LOG_NEIGHBOR_DTOR_VTABLE (stored INSIDE this body) */
  ISAAC_LOG_NEIGHBOR_DTOR_INNER_VTABLE_FINAL = 0x00ba2218u,
  ISAAC_LOG_NEIGHBOR_DTOR_INNER_PATH_OFFSET = 0x20,
  ISAAC_LOG_NEIGHBOR_DTOR_INNER_LOBBY_OFFSET = 0x28,
  ISAAC_LOG_NEIGHBOR_DTOR_INNER_SUB_OFFSET = 0x10,
  ISAAC_LOG_NEIGHBOR_DTOR_INNER_SEH_HANDLER = 0x00af09f0u,
  ISAAC_LOG_NEIGHBOR_DTOR_INNER_SUB_DTOR_VA = 0x00426980u,
  ISAAC_LOG_NEIGHBOR_DTOR_INNER_INBOUND_CALLSITES = 2,
  ISAAC_LOG_NEIGHBOR_DTOR_INNER_RAW_OCCURRENCES = 0,
  ISAAC_LOG_NEIGHBOR_DTOR_INNER_RELEASE_IAT_SITES = 8, /* whole-.text */
  ISAAC_LOG_NEIGHBOR_DTOR_INNER_ACTION_NONE = 0,
  ISAAC_LOG_NEIGHBOR_DTOR_INNER_ACTION_FREE = 1, /* platform (allocator) */
  ISAAC_LOG_NEIGHBOR_DTOR_INNER_ACTION_RELEASE = 2, /* platform (EOS SDK) */
  ISAAC_LOG_NEIGHBOR_DTOR_INNER_ACTIONS_MAX = 2,
  ISAAC_LOG_TEXT_INSN_COUNT_V12 = 2094319,
  ISAAC_LOG_TEXT_UNDECODABLE_BYTES_V12 = 469,
  ISAAC_LOG_V12_BATCHED_VAS = 4,
  ISAAC_LOG_V12_EXACT_ZHL_MATCHES = 0
};

/* ============ v13: the sibling vtbl+0x20 FLUSH SLOT 0x00a52880 ========== */

/* The sibling vtable 0x00b9e940 slot +0x20 (entry VA 0x00b9e960, .rdata
   raw 0x79cf60) HOLDS 0x00a52880 — the ONLY reach: zero direct
   call/jmp/jcc/push/mov/imm references in whole .text, exactly 1 raw
   little-endian dword occurrence across all five sections (the slot).

   Body (4 insns, 0xb bytes, plain `ret` at 0x00a5288a):
     push  dword ptr [ecx + 0xc]   ; FILE* field at this+0xc — 32-bit
     call  dword ptr [0xb1891c]    ; HOST fflush (IAT, UNCONDITIONAL)
     pop   ecx                     ; self-clean the 4 bytes (balanced)
     ret

   Laws: the FILE* field offset is +0xc (verified by disasm this unit);
   the fflush IAT identity [0xb1891c] api-ms-win-crt-stdio-l1-1-0.dll!
   fflush resolved from the PE import directory THIS unit (IAT RVA
   0x71891c -> fflush, matches shim_table.c:150); the call is UNCONDITIONAL
   — no FILE* null test, no state read, no guard read: fires for EVERY
   input (NULL included, mirroring D-LOG-11's fflush(NULL) flush-all); ret
   width 0 (plain `ret`, 0 stack args — the push/pop pair balances
   internally); EAX is untouched between call and ret, so the slot returns
   fflush's own result (host value — exported only as the `ret_is_fflush`
   law so a fold mutant is visible). The sink vtable 0x00ba5184 slot +0x20
   is the DIFFERENT nop 0x0040c200 (`ret 0`, v6 law); delta pinned by
   ISAAC_LOG_SIBLING_FLUSH_VTBL_IS_NOP == 0.

   Reach census (whole-.text linear decode, hash-bound, v9 method re-run
   this unit): call / jmp / jcc / push / mov / imm_any lists for
   0x00a52880 all EMPTY; inbound into the body extent EMPTY; fflush IAT
   call sites in whole .text = 6 (0x8604ac, 0x9e74d8, 0xa52883 <- this
   body, 0xa647b1, 0xa83fe2, 0xa84011). NOT dead: 1 inbound edge (the
   vtable slot dword). Identity pass: 4 VAs batched (0xa52880, 0xa52890,
   0xb9e960, 0xb1891c), 0 exact ZHL matches — address-stable. */
enum {
  ISAAC_LOG_VA_FLUSH_SLOT = 0x00a52880u, /* == ISAAC_LOG_VA_SIBLING_FLUSH */
  ISAAC_LOG_VA_FLUSH_SLOT_END = 0x00a5288bu, /* first int3 */
  ISAAC_LOG_FLUSH_SLOT_BODY_BYTES = 0x0b,
  ISAAC_LOG_FLUSH_SLOT_INSN_COUNT = 4,
  ISAAC_LOG_FLUSH_SLOT_FIRST_RET_VA = 0x00a5288au, /* plain `ret` */
  ISAAC_LOG_FLUSH_SLOT_RET_ARGS = 0, /* 0 stack args popped by callee */
  ISAAC_LOG_FLUSH_SLOT_STACK_BYTES_POPPED = 0, /* push/pop balances */
  ISAAC_LOG_FLUSH_SLOT_FILE_OFFSET = 0x0c, /* push [ecx+0xc] */
  ISAAC_LOG_FLUSH_SLOT_IAT_VA = 0x00b1891cu, /* == ISAAC_LOG_IAT_FFLUSH */
  ISAAC_LOG_FLUSH_SLOT_VTBL_SLOT = 0x20,
  ISAAC_LOG_FLUSH_SLOT_VTBL_VA = 0x00b9e940u, /* sibling vtable */
  ISAAC_LOG_FLUSH_SLOT_VTBL_ENTRY_VA = 0x00b9e960u, /* slot +0x20 */
  ISAAC_LOG_FLUSH_SLOT_PUSH_VA = 0x00a52880u,
  ISAAC_LOG_FLUSH_SLOT_CALL_VA = 0x00a52883u,
  ISAAC_LOG_FLUSH_SLOT_POP_VA = 0x00a52889u,
  ISAAC_LOG_FLUSH_SLOT_RET_VA = 0x00a5288au,
  ISAAC_LOG_FLUSH_SLOT_INDIRECT_CALLS = 1, /* the [0xb1891c] call */
  ISAAC_LOG_FLUSH_SLOT_DIRECT_CALLSITES = 0, /* whole-.text, imm refs */
  ISAAC_LOG_FLUSH_SLOT_INBOUND = 0, /* no direct transfer into body */
  ISAAC_LOG_FLUSH_SLOT_RAW_OCCURRENCES = 1, /* the vtable slot dword */
  ISAAC_LOG_FLUSH_SLOT_FFLUSH_IAT_SITES = 6, /* whole-.text */
  ISAAC_LOG_FLUSH_SLOT_VTBL_IS_NOP = 0, /* REAL fflush; sink +0x20 is nop */
  ISAAC_LOG_TEXT_INSN_COUNT_V13 = 2094319,
  ISAAC_LOG_TEXT_UNDECODABLE_BYTES_V13 = 469,
  ISAAC_LOG_V13_BATCHED_VAS = 4,
  ISAAC_LOG_V13_EXACT_ZHL_MATCHES = 0
};

/* ============ v10: LAV — read-open ("rb") laws ============ */

/* 0x00a52579 `test esi, esi ; je 0xa525ed` — the PATH GATE. esi is the
   HOST combine result; NULL (0) jumps straight to the join: NO file/state/
   path store, return 0. */
int32_t isaac_log_open_read_path_gate(uint32_t path_combine_ok);

/* 0x00a5257d `push 0xb6d108` — "rb" is the ONLY mode this body ever
   passes to fopen (no flag byte in the signature — `ret 4`). */
uint32_t isaac_log_open_read_mode_va(void);
uint32_t isaac_log_open_read_mode_len(void);

/* 0x00a5258c `mov [edi+0xc], eax` sits between the fopen call and the
   fopen test — the FILE* cell is OVERWRITTEN with the raw fopen result
   UNCONDITIONALLY, even when fopen returned NULL (so a PREVIOUS non-NULL
   handle is clobbered by a failed re-open). `file_before` exists so a
   mutant that keeps the old handle on NULL changes an observable. */
uint32_t isaac_log_open_read_file_after(uint32_t file_before,
                                        uint32_t fopen_result);

/* 0x00a52599 `mov [edi+4], 0` is on the SUCCESS arm only: the state cell
   keeps its previous value when fopen failed (or the gate blocked it).
   Polar value 0 — the v8 fread gate's `cmp [ecx+4], 0` constant. */
uint32_t isaac_log_open_read_state_after(uint32_t state_before,
                                         uint32_t fopen_ok);

/* 0x00a525a7 `mov [edi+8], eax` — the SECOND HOST combine result is
   stored on the SUCCESS arm only; failures leave the path cell intact. */
uint32_t isaac_log_open_read_path_after(uint32_t path_before,
                                        uint32_t fopen_ok,
                                        uint32_t combine2_result);

/* The two `ret 4` arms: 1 iff the path gate PASSED and fopen succeeded —
   the read is a strict `&&` on the two host results. */
int32_t isaac_log_open_read_returns(uint32_t path_combine_ok,
                                    uint32_t fopen_ok);

/* Allocator accounting: TWO sites (0x00a525b9 success arm / 0x00a525e5
   fopen-fail arm), both reachable iff the path gate passed — i.e. the
   fopen-fail arm STILL runs the accounting (with the EH state byte 1).
   Both sites are HOST; this is the reach flag. */
int32_t isaac_log_open_read_accounting_reached(uint32_t path_combine_ok);
uint32_t isaac_log_open_read_accounting_sites(void);

/* ============ v10: LAW — write-open ("wb"/"ab") laws ============ */

/* 0x00a52649 `cmp byte ptr [ebp + 0xc], 0` ; 0x00a52659 `cmove edx, eax` —
   the mode select reads the append flag's LOW BYTE ONLY:
   (flag & 0xff) == 0 -> "wb" (0xb9e938), else -> "ab" (0xb6d104).
   Drive unmasked: 0x100 selects "wb" because its low byte is 0. */
uint32_t isaac_log_open_write_mode_va(uint32_t append_flag);
uint32_t isaac_log_open_write_mode_len(uint32_t append_flag);

/* NO path gate before fopen — 0x00a52644's combine result is passed
   straight into fopen even when it is NULL. The parameter exists so a
   mutant that copies the read's gate is visible. Always 0. */
int32_t isaac_log_open_write_fopen_gated(uint32_t path_combine_ok);

/* 0x00a52667 `mov [edi+0xc], eax` — UNCONDITIONAL, like the read. */
uint32_t isaac_log_open_write_file_after(uint32_t file_before,
                                         uint32_t fopen_result);

/* 0x00a52678 `mov [edi+4], 1` — success arm only. Polar value 1 (v6/v7
   write gates' constant). Note the read's is 0 — do not homogenise. */
uint32_t isaac_log_open_write_state_after(uint32_t state_before,
                                          uint32_t fopen_ok);

/* 0x00a52689 `mov [edi+8], eax` — success arm only. */
uint32_t isaac_log_open_write_path_after(uint32_t path_before,
                                         uint32_t fopen_ok,
                                         uint32_t combine2_result);

/* `mov al, bl ; ret 8` — bl is set ONLY from the fopen test, so the return
   is fopen_ok ALONE. The path combine result is NOT consulted (the exact
   contrast with the read's `&&`; there is deliberately no path parameter). */
int32_t isaac_log_open_write_returns(uint32_t fopen_ok);

/* 0x00a5268e `test esi, esi ; je 0xa526a9` — the accounting gate sits at
   the JOIN of both fopen arms and runs iff the combine succeeded. ONE
   site (contrast: the read has two, per fopen arm). */
int32_t isaac_log_open_write_accounting_reached(uint32_t path_combine_ok);
uint32_t isaac_log_open_write_accounting_sites(void);

/* ============ v10: LAX — identities, reach, host-action plans ========= */

uint32_t isaac_log_open_read_body_va(void);
uint32_t isaac_log_open_read_body_bytes(void);
uint32_t isaac_log_open_read_insn_count(void);
uint32_t isaac_log_open_read_ret_args(void);
uint32_t isaac_log_open_read_vtbl_slot(void);
uint32_t isaac_log_open_read_direct_callsites(void);
uint32_t isaac_log_open_read_raw_occurrences(void);
uint32_t isaac_log_open_write_body_va(void);
uint32_t isaac_log_open_write_body_bytes(void);
uint32_t isaac_log_open_write_insn_count(void);
uint32_t isaac_log_open_write_ret_args(void);
uint32_t isaac_log_open_write_vtbl_slot(void);
uint32_t isaac_log_open_write_direct_callsites(void);
uint32_t isaac_log_open_write_raw_occurrences(void);
uint32_t isaac_log_open_read_devirt_call_va(void);
uint32_t isaac_log_open_write_devirt_call_va(void);

typedef struct IsaacLogOpenReadPlan {
  int32_t path_ok;             /* combine != NULL — the 0x00a52579 gate */
  uint32_t mode_va;            /* 0xb6d108 "rb" */
  int32_t fopen;               /* path_ok — HOST fopen fires */
  uint32_t file_after;         /* fopen result, UNCONDITIONAL overwrite */
  uint32_t state_after;        /* 0 iff fopen_ok, else state_before */
  int32_t path_stored;         /* fopen_ok — second combine + store */
  uint32_t path_after;         /* combine2 result, or path_before */
  uint32_t result;             /* path_ok && fopen_ok */
  int32_t accounting_reached;  /* path_ok */
  uint32_t accounting_sites;   /* 2 */
  uint32_t ret_args;           /* 4 */
  uint32_t body_va;            /* 0x00a52540 */
  uint32_t action_count;       /* 0 (gate blocked) or 1 (fopen) */
} IsaacLogOpenReadPlan;

void isaac_log_open_read_plan(uint32_t path_combine_ok,
                              uint32_t fopen_ok,
                              uint32_t file_before,
                              uint32_t fopen_result,
                              uint32_t state_before,
                              uint32_t path_before,
                              uint32_t combine2_result,
                              IsaacLogOpenReadPlan* out);

uint32_t isaac_log_open_read_action_count(uint32_t path_combine_ok);
uint32_t isaac_log_open_read_action_at(uint32_t path_combine_ok,
                                       uint32_t index);
int32_t isaac_log_open_read_action_is_platform(uint32_t action);

typedef struct IsaacLogOpenWritePlan {
  uint32_t mode_va;            /* (flag & 0xff) == 0 ? "wb" : "ab" */
  int32_t fopen;               /* ALWAYS — no path gate */
  uint32_t file_after;         /* fopen result, UNCONDITIONAL overwrite */
  uint32_t state_after;        /* 1 iff fopen_ok, else state_before */
  int32_t path_stored;         /* fopen_ok — second combine + store */
  uint32_t path_after;         /* combine2 result, or path_before */
  uint32_t result;             /* fopen_ok ALONE (no path consult) */
  int32_t accounting_reached;  /* path_combine_ok — the join gate */
  uint32_t accounting_sites;   /* 1 */
  uint32_t ret_args;           /* 8 */
  uint32_t body_va;            /* 0x00a52610 */
  uint32_t action_count;       /* always 1 (fopen) */
} IsaacLogOpenWritePlan;

void isaac_log_open_write_plan(uint32_t append_flag,
                               uint32_t path_combine_ok,
                               uint32_t fopen_ok,
                               uint32_t file_before,
                               uint32_t fopen_result,
                               uint32_t state_before,
                               uint32_t path_before,
                               uint32_t combine2_result,
                               IsaacLogOpenWritePlan* out);

uint32_t isaac_log_open_write_action_count(void);
uint32_t isaac_log_open_write_action_at(uint32_t index);
int32_t isaac_log_open_write_action_is_platform(uint32_t action);

/* ============ v11: LBE — the dtor inner body 0x00a52410 ========= */

/* test eax, eax ; je 0xa52453 — the FCLOSE gate reads the FULL 32-bit
   FILE* cell at [this+0xc]: ANY nonzero dword (0x100 / 0x1ff /
   0xffffffff) fires fclose; 0 skips. NOT a low-byte test. */
int32_t isaac_log_dtor_inner_fclose_gate(uint32_t file_ptr);
uint32_t isaac_log_dtor_inner_fclose_iat_va(void);

/* mov [esi+0xc], 0 — the FILE* cell is NULLed ONLY on the fclose arm
   (0x00a5244c, after the host call). On the skip arm the cell is kept. */
uint32_t isaac_log_dtor_inner_file_after(uint32_t file_before,
                                         uint32_t fclose_fired);

/* test edx, edx ; je 0xa52486 — the GUEST-FREE gate reads the FULL 32-bit
   path cell at [this+8]: ANY nonzero dword fires the guest free; 0 skips.
   NOT a low-byte test. */
int32_t isaac_log_dtor_inner_free_gate(uint32_t path_ptr);
uint32_t isaac_log_dtor_inner_free_helper_va(void);

/* mov [esi+8], 0 — the path cell is NULLed ONLY on the free arm
   (0x00a52476, after the host call). On the skip arm the cell is kept. */
uint32_t isaac_log_dtor_inner_path_after(uint32_t path_before,
                                         uint32_t free_fired);

/* mov [esi+4], 2 — BOTH state stores (0x00a52456 unconditional, 0x00a5247d
   free-arm) write the SAME polar value 2 (== SINK_STATE_NO_FILE). The
   skip arm gets the store because 0xa52456 precedes the free gate. */
uint32_t isaac_log_dtor_inner_state_after(uint32_t state_before);
uint32_t isaac_log_dtor_inner_state_value(void);
uint32_t isaac_log_dtor_inner_state_store_count(void);

/* VTABLE CHAIN: #1 0xb9e940 (== SIBLING_VTABLE_VA) ALWAYS; #2 0xb833d8
   IFF path == 0 (the no-free arm); #3 0xb9c15c ALWAYS (both arms).
   vtable_mid_stored(0x100) == 0, vtable_mid_stored(0) == 1. */
uint32_t isaac_log_dtor_inner_vtable_base(void);
uint32_t isaac_log_dtor_inner_vtable_mid(void);
uint32_t isaac_log_dtor_inner_vtable_final(void);
int32_t isaac_log_dtor_inner_vtable_mid_stored(uint32_t path_ptr);
uint32_t isaac_log_dtor_inner_vtable_after(uint32_t path_ptr);

/* Identities + census. */
uint32_t isaac_log_dtor_inner_body_va(void);
uint32_t isaac_log_dtor_inner_body_bytes(void);
uint32_t isaac_log_dtor_inner_insn_count(void);
uint32_t isaac_log_dtor_inner_ret_args(void);
uint32_t isaac_log_dtor_inner_seh_handler(void);
uint32_t isaac_log_dtor_inner_inbound_callsites(void);
uint32_t isaac_log_dtor_inner_raw_occurrences(void);
uint32_t isaac_log_dtor_inner_fclose_iat_sites(void);

/* Ordered host actions: [FCLOSE, FREE] — fclose fires FIRST (0xa52443,
   before the state=2 store), free second (0xa5246e). Both platform. */
uint32_t isaac_log_dtor_inner_action_count(uint32_t file_ptr,
                                           uint32_t path_ptr);
uint32_t isaac_log_dtor_inner_action_at(uint32_t file_ptr,
                                        uint32_t path_ptr,
                                        uint32_t index);
int32_t isaac_log_dtor_inner_action_is_platform(uint32_t action);

/* ---------- v12: neighbor dtor inner 0x00a84060 ---------- */

/* test edx, edx ; je 0xa840af — the GUEST-FREE gate reads the FULL 32-bit
   path cell [this+0x20]. 0x100 / 0x1ff / 0xffffffff ALL fire; 0 skips.
   NOT a low-byte test. */
int32_t isaac_log_neighbor_dtor_inner_free_gate(uint32_t path_ptr);
uint32_t isaac_log_neighbor_dtor_inner_free_helper_va(void);

/* mov [esi+0x20], 0 — the path cell is NULLed ONLY on the free arm
   (0x00a840a8, after the host call). On the skip arm the cell is kept. */
uint32_t isaac_log_neighbor_dtor_inner_path_after(uint32_t path_before,
                                                  uint32_t free_fired);

/* VTABLE CHAIN: #1 0xba5520 (0x00a84089) ALWAYS, #2 0xba2218 (0x00a840c2)
   ALWAYS — BOTH UNCONDITIONAL (no conditional mid-store arm; that is the
   SINK's law, do not homogenise). vtable_base_stored(path) == 1 for every
   input; vtable_final_after(path) == 0xba2218 for every input. */
uint32_t isaac_log_neighbor_dtor_inner_vtable_base(void);
uint32_t isaac_log_neighbor_dtor_inner_vtable_final(void);
int32_t isaac_log_neighbor_dtor_inner_vtable_base_stored(uint32_t path_ptr);
uint32_t isaac_log_neighbor_dtor_inner_vtable_final_after(uint32_t path_ptr);

/* push [esi+0x28] ; call [0xb180a4] — the EOS LobbyDetails release has NO
   gate: it fires for EVERY input (lobby cell 0 included), and it receives
   the PRE-null cell value (the NULL store at 0x00a840bb follows the call).
   mov [esi+0x28], 0 is UNCONDITIONAL — lobby_after == 0 for every input;
   the parameter exists so a keep-old-cell mutant is visible. */
int32_t isaac_log_neighbor_dtor_inner_release_unconditional(void);
uint32_t isaac_log_neighbor_dtor_inner_release_arg(uint32_t lobby_before);
uint32_t isaac_log_neighbor_dtor_inner_lobby_after(uint32_t lobby_before);
uint32_t isaac_log_neighbor_dtor_inner_release_iat_va(void);

/* lea ecx,[esi+0x10] ; call 0x426980 — sub-object dtor runs ALWAYS and
   LAST (after the final vtable store). Host 0x00426980 at offset +0x10. */
uint32_t isaac_log_neighbor_dtor_inner_sub_dtor_va(void);
uint32_t isaac_log_neighbor_dtor_inner_sub_dtor_offset(void);

/* Identities + census. */
uint32_t isaac_log_neighbor_dtor_inner_body_va(void);
uint32_t isaac_log_neighbor_dtor_inner_body_bytes(void);
uint32_t isaac_log_neighbor_dtor_inner_insn_count(void);
uint32_t isaac_log_neighbor_dtor_inner_ret_args(void);
uint32_t isaac_log_neighbor_dtor_inner_seh_handler(void);
uint32_t isaac_log_neighbor_dtor_inner_inbound_callsites(void);
uint32_t isaac_log_neighbor_dtor_inner_raw_occurrences(void);
uint32_t isaac_log_neighbor_dtor_inner_release_iat_sites(void);

/* Ordered host actions: [FREE, RELEASE] — free fires FIRST (0xa840a0,
   before the release at 0xa840b2); release ALWAYS fires (count == free
   gate + 1). Both platform. */
uint32_t isaac_log_neighbor_dtor_inner_action_count(uint32_t path_ptr);
uint32_t isaac_log_neighbor_dtor_inner_action_at(uint32_t path_ptr,
                                                 uint32_t index);
int32_t isaac_log_neighbor_dtor_inner_action_is_platform(uint32_t action);

/* ---------- v13: the sibling vtbl+0x20 flush slot 0x00a52880 ---------- */

/* push [ecx+0xc] — the FILE* field offset is +0xc (FULL 32-bit dword,
   no 0x66/0x67 prefix; disasm this unit). */
uint32_t isaac_log_flush_slot_file_offset(void);

/* call [0xb1891c] at 0x00a52883 — fflush. Identity resolved from the PE
   import directory THIS unit: api-ms-win-crt-stdio-l1-1-0.dll!fflush
   (== ISAAC_LOG_IAT_FFLUSH). The CRT body stays host. */
uint32_t isaac_log_flush_slot_iat_va(void);

/* The call has NO gate of any kind: no FILE* null test, no state cell
   read, no guard read. It fires for EVERY input — file_ptr 0 included
   (D-LOG-11: fflush(NULL) is the CRT flush-all; body not in image).
   Parameter exists so a gate mutant is visible. */
int32_t isaac_log_flush_slot_call_unconditional(uint32_t file_ptr);

/* ret width 0 — plain `ret`; the push/pop ecx pair balances internally,
   so the callee pops 0 stack bytes. */
uint32_t isaac_log_flush_slot_ret_args(void);
uint32_t isaac_log_flush_slot_stack_bytes_popped(void);

/* EAX is never touched between the fflush call and the ret, so the slot
   returns fflush's own result (a host value). 1 = the return is the
   fflush result; a fold-to-0/1 mutant is visible. */
int32_t isaac_log_flush_slot_ret_is_fflush(void);

/* Identities + census (all hash-bound, v9 method re-run this unit). */
uint32_t isaac_log_flush_slot_body_va(void);
uint32_t isaac_log_flush_slot_body_bytes(void);
uint32_t isaac_log_flush_slot_insn_count(void);
uint32_t isaac_log_flush_slot_first_ret_va(void);
uint32_t isaac_log_flush_slot_vtbl_slot(void);
uint32_t isaac_log_flush_slot_vtbl_va(void);
uint32_t isaac_log_flush_slot_vtbl_entry_va(void);
uint32_t isaac_log_flush_slot_push_va(void);
uint32_t isaac_log_flush_slot_call_va(void);
uint32_t isaac_log_flush_slot_pop_va(void);
uint32_t isaac_log_flush_slot_ret_va(void);
uint32_t isaac_log_flush_slot_indirect_calls(void);
uint32_t isaac_log_flush_slot_direct_callsites(void);
uint32_t isaac_log_flush_slot_inbound(void);
uint32_t isaac_log_flush_slot_raw_occurrences(void);
uint32_t isaac_log_flush_slot_fflush_iat_sites(void);

/* 0 = the sibling slot is a REAL fflush, NOT the log sink vtable's
   0x0040c200 `ret 0` nop (v6 law). */
int32_t isaac_log_flush_slot_vtbl_is_nop(void);

/* ============ v14: the fd lock/unlock helper 0x00a52890 ============ */

/* Register-arg helper (NOT thiscall — the pushed ecx is the _get_osfhandle
   argument): ecx = fd, edx = mode. 26 direct callers, scannable pattern
   `push [obj+0xc] ; call [0xb18920] (_fileno) ; mov edx, MODE ;
   mov ecx, eax ; call` — modes seen: 1 (x8), 2 (x5), 8 (x13); NO shipped
   caller sets bit 2. Body 0x00a52890..0x00a52931 (0xa2 bytes, 60 insns,
   first ret 0x00a52902 on the EINVAL arm), plain `ret` (0 stack args),
   4 indirect IAT calls, 0 E8. Identity pass v13 batch: 0 exact ZHL
   matches — address-stable.

   Machine flow (re-aligned this unit; raw bytes 0xa528f0..0xa52922 read
   from the image to stitch the two dump spans at the case-1/case-2 join):
     edi = _get_osfhandle(fd)            ; ALWAYS, first
     5 zero dwords [ebp-0x14..ebp-4]     ; a 20-byte OVERLAPPED
     UnlockFileEx(edi, 0, 1, 0, &ovl)    ; ALWAYS — BEFORE the dispatch;
                                          ; result NEVER tested
     eax = mode & 0xfffffffb             ; clears BIT 2 ONLY (high bits
                                          ; are NOT masked: 0x100 / 0x1ff /
                                          ; 0xffffffff all reach EINVAL)
       (mode&~4)==1 -> flags = (mode>>2)&1        ; lock, case 1
       (mode&~4)==2 -> flags = ((mode>>2)&1) + 2  ; lock, case 2
       (mode&~4)==8 -> return 0                   ; unlock ONLY
       else         -> errno arm                  ; EINVAL + return -1
     LockFileEx(edi, flags, 0, 1, NULL)  ; 6 dwords pushed — the 6th
                                          ; (&ovl) is a STRAY the 5-arg
                                          ; stdcall never reads; the
                                          ; epilogue pops rebalance it
       test eax,eax ; je errno           ; lock fail (0) -> SAME errno arm
       else return 0

   The shared errno arm: _errno() then *errno = 0x16 (EINVAL), or eax,-1,
   return -1 — reachable from BOTH the default dispatch and a failed
   LockFileEx. UnlockFileEx failure is silently ignored (D-LOG-14). */

enum {
  ISAAC_LOG_VA_FDLOCK = 0x00a52890u,
  ISAAC_LOG_VA_FDLOCK_END = 0x00a52932u, /* first int3 after the ret */
  ISAAC_LOG_FDLOCK_BODY_BYTES = 0xa2u,   /* END - VA */
  ISAAC_LOG_FDLOCK_INSN_COUNT = 60,
  ISAAC_LOG_FDLOCK_FIRST_RET_VA = 0x00a52902u, /* the EINVAL arm ret */
  ISAAC_LOG_FDLOCK_RET_ARGS = 0,               /* plain ret */
  ISAAC_LOG_FDLOCK_INDIRECT_CALLS = 4,  /* osfhandle, unlock, lock, errno */
  ISAAC_LOG_FDLOCK_DIRECT_CALLSITES = 26, /* whole-.text, scanner */
  ISAAC_LOG_FDLOCK_IAT_OSFHANDLE = 0x00b188f0u,
  ISAAC_LOG_FDLOCK_IAT_UNLOCK = 0x00b18254u,
  ISAAC_LOG_FDLOCK_IAT_LOCK = 0x00b18250u,
  ISAAC_LOG_FDLOCK_IAT_ERRNO = 0x00b18898u,
  ISAAC_LOG_FDLOCK_OVERLAPPED_ZERO_DWORDS = 5, /* [ebp-0x14..ebp-4] */
  ISAAC_LOG_FDLOCK_OVERLAPPED_BYTES = 20,
  ISAAC_LOG_FDLOCK_UNLOCK_RESERVED = 0,
  ISAAC_LOG_FDLOCK_UNLOCK_LENGTH_LOW = 1,
  ISAAC_LOG_FDLOCK_UNLOCK_LENGTH_HIGH = 0,
  ISAAC_LOG_FDLOCK_LOCK_LENGTH_LOW = 0,
  ISAAC_LOG_FDLOCK_LOCK_LENGTH_HIGH = 1,
  ISAAC_LOG_FDLOCK_LOCK_OVERLAPPED_NULL = 1, /* arg5 == 0; &ovl is stray */
  ISAAC_LOG_FDLOCK_ERRNO_EINVAL = 0x16,       /* 22 */
  ISAAC_LOG_FDLOCK_FAIL_RETURN = 0xffffffffu, /* or eax,-1 */
  ISAAC_LOG_FDLOCK_DISPATCH_NONE = 0,         /* default -> EINVAL arm */
  ISAAC_LOG_FDLOCK_DISPATCH_LOCK_FLAGS_BIT = 1, /* (mode&~4)==1 */
  ISAAC_LOG_FDLOCK_DISPATCH_LOCK_EXCLUSIVE = 2, /* (mode&~4)==2 */
  ISAAC_LOG_FDLOCK_DISPATCH_UNLOCK_ONLY = 8,    /* (mode&~4)==8 */
  ISAAC_LOG_FDLOCK_MODE_MASK = 0xfffffffbu,     /* and eax, ~4 */
  ISAAC_LOG_TEXT_INSN_COUNT_V14 = 2094319, /* carried from v13 (same SHA,
                                              deterministic decode) */
  ISAAC_LOG_TEXT_UNDECODABLE_BYTES_V14 = 469,
  ISAAC_LOG_V14_BATCHED_VAS = 4, /* v13 identity batch incl. this VA */
  ISAAC_LOG_V14_EXACT_ZHL_MATCHES = 0, /* none; address-stable */
};

/* ---- identities + census ---- */
uint32_t isaac_log_fdlock_body_va(void);
uint32_t isaac_log_fdlock_body_bytes(void);
uint32_t isaac_log_fdlock_insn_count(void);
uint32_t isaac_log_fdlock_first_ret_va(void);
uint32_t isaac_log_fdlock_ret_args(void);
uint32_t isaac_log_fdlock_direct_callsites(void);
uint32_t isaac_log_fdlock_indirect_calls(void);
uint32_t isaac_log_fdlock_overlapped_zero_dwords(void);
uint32_t isaac_log_fdlock_overlapped_bytes(void);

/* ---- IAT identities (host platform primitives) ---- */
uint32_t isaac_log_fdlock_osfhandle_iat_va(void);
uint32_t isaac_log_fdlock_unlock_iat_va(void);
uint32_t isaac_log_fdlock_lock_iat_va(void);
uint32_t isaac_log_fdlock_errno_iat_va(void);

/* _get_osfhandle(fd) is the FIRST instruction effect, before any branch:
   fires for EVERY (fd, mode). Params exist so a gate mutant is visible. */
int32_t isaac_log_fdlock_osfhandle_unconditional(uint32_t fd,
                                                 uint32_t mode);

/* UnlockFileEx fires BEFORE the mode dispatch, for EVERY mode — including
   modes that then fail with EINVAL (D-LOG-12). Result NEVER tested
   (D-LOG-14); only the LockFileEx result reaches the errno arm. */
int32_t isaac_log_fdlock_unlock_unconditional(uint32_t mode);
int32_t isaac_log_fdlock_unlock_result_ignored(void);
uint32_t isaac_log_fdlock_unlock_reserved(void);
uint32_t isaac_log_fdlock_unlock_length_low(void);
uint32_t isaac_log_fdlock_unlock_length_high(void);
int32_t isaac_log_fdlock_unlock_uses_overlapped(void);

/* The pure dispatch: 32-bit `and eax, 0xfffffffb` clears BIT 2 only, then
   sequential `sub 1 / je, sub 1 / je, sub 6 / je`. Returns the case
   value (1/2/8) or 0 for the default EINVAL arm. High bits are NOT
   masked — 0x100, 0x1ff, 0xffffffff, 0x105 all reach the default. */
uint32_t isaac_log_fdlock_dispatch(uint32_t mode);

/* LockFileEx fires ONLY on dispatch 1/2. flags: case 1 -> (mode>>2)&1
   (bit 2 of the ORIGINAL mode; 0 or 1); case 2 -> ((mode>>2)&1) + 2
   (2 or 3); otherwise the flags are never computed (0 exported). */
int32_t isaac_log_fdlock_lock_fires(uint32_t mode);
uint32_t isaac_log_fdlock_lock_flags(uint32_t mode);
uint32_t isaac_log_fdlock_lock_length_low(void);
uint32_t isaac_log_fdlock_lock_length_high(void);
int32_t isaac_log_fdlock_lock_overlapped_null(void);

/* The shared errno arm (0x00a528ee): *_errno() = 0x16 (EINVAL), or
   eax,-1, return -1. Reachable from the default dispatch AND from a
   failed LockFileEx (test eax,eax ; je). lock_ok = the LockFileEx
   result (nonzero = success); it is ignored on dispatch 8 (no lock) and
   on the default (already failing). */
uint32_t isaac_log_fdlock_errno_value(void);
uint32_t isaac_log_fdlock_fail_return(void);
uint32_t isaac_log_fdlock_errno_after(uint32_t mode, uint32_t lock_ok);
int32_t isaac_log_fdlock_returns(uint32_t mode, uint32_t lock_ok);

/* ---------- v18: the shared sub-object VECTOR dtor 0x00426980 ---------- */

/* The dtor-island chain's LAST host leaf: the neighbor inner calls
   0x00426980 ALWAYS and LAST (0x00a840c8 lea ecx,[esi+0x10] ; call). The
   body is the MSVC std::vector _Tidy_deallocate (no SEH/GS frame):
     mov eax,[esi]            ; begin (+0)
     test eax,eax ; je ret    ; BEGIN GATE: FULL 32-bit
     mov ecx,[esi+8]          ; end-of-storage (+8)
     sub ecx,eax              ; byte count = end - begin      (wrap)
     and ecx,0xfffffff8       ; count &= ~7
     cmp ecx,0x1000 ; jb smal ; count < 0x1000 (UNSIGNED) -> SMALL free
     mov edx,[eax-4]          ; header = *(begin - 4)
     add ecx,0x23             ; size_arg = count + 0x23 (large arm)
     sub eax,edx ; add eax,-4 ; delta = begin - header - 4   (wrap)
     cmp eax,0x1f ; ja inval  ; (u32)delta > 0x1f -> HOST abort
     mov eax,edx              ; free_ptr = header
     push ecx ; push eax
     call 0xaef15c            ; HOST sized-delete shim (platform)
     mov [esi],0 ; mov [esi+4],0 ; mov [esi+8],0  ; 3 nulls AFTER the free
     ret
     0x4269cb call [0xb18894] ; _invalid_parameter_noinfo (noreturn)
   Laws: FULL-dword begin gate (0x100/0x1ff/0xffffffff fire, 0 skips the
   free AND the nulls); byte count is (end-begin) with 32-bit wrap BEFORE
   the &~7 mask; small/large split is UNSIGNED count vs 0x1000; the large
   arm computes size = count+0x23 BEFORE the sanity check and validates
   (u32)(begin-header-4) <= 0x1f else host invalid_parameter (no free);
   SMALL: free(begin, count); LARGE: free(header, count+0x23); all three
   cells NULLed AFTER the free call in program order 0x4269b2 < 0x4269bb <
   0x4269c2; ret width 0. Host: 0x00aef15c + IAT [0x00b18894]. Census
   (whole-.text, this unit): 86 E8 rel32 call sites incl. the neighbor
   inner 0xa840c8 and the Update tail 0x6fbb6e; verified tail-jmp thunks
   0x4269e0 / 0x8fd8ef / 0x909113 / 0x90a893 / 0xb16a45 / 0xb0a0e3; ZERO
   raw little-endian dword occurrences (bound only by relative
   transfers). Reused cross-object by every family that destroys a
   std::vector (Update tail sweep, exit, hud, etc.). */
enum {
  ISAAC_LOG_VA_SUB_DTOR = 0x00426980u,
  ISAAC_LOG_SUB_DTOR_END = 0x004269d1u, /* first int3 (after invalid tail) */
  ISAAC_LOG_SUB_DTOR_BODY_BYTES = 0x51u, /* END - VA */
  ISAAC_LOG_SUB_DTOR_INSN_COUNT = 36,
  ISAAC_LOG_SUB_DTOR_FIRST_RET_VA = 0x004269cau, /* the plain ret */
  ISAAC_LOG_SUB_DTOR_RET_ARGS = 0,               /* plain ret, width 0 */
  ISAAC_LOG_SUB_DTOR_BEGIN_OFFSET = 0,           /* _Myfirst */
  ISAAC_LOG_SUB_DTOR_MYLAST_OFFSET = 4,          /* _Mylast (null #2) */
  ISAAC_LOG_SUB_DTOR_MYEND_OFFSET = 8,           /* _Myend (null #3) */
  ISAAC_LOG_SUB_DTOR_COUNT_MASK = 0xfffffff8u,   /* and ecx, ~7 */
  ISAAC_LOG_SUB_DTOR_SMALL_BOUND = 0x1000u,      /* jb small (UNSIGNED) */
  ISAAC_LOG_SUB_DTOR_LARGE_SIZE_BIAS = 0x23u,    /* add ecx, 0x23 */
  ISAAC_LOG_SUB_DTOR_HEADER_DELTA_MAX = 0x1fu,   /* ja invalid */
  ISAAC_LOG_SUB_DTOR_DELETE_VA = 0x00aef15cu,    /* sized-delete shim */
  ISAAC_LOG_SUB_DTOR_INVALID_IAT = 0x00b18894u,  /* invalid_parameter */
  ISAAC_LOG_SUB_DTOR_INVALID_CALL_VA = 0x004269cbu, /* call [0xb18894] */
  ISAAC_LOG_SUB_DTOR_FREE_CALL_VA = 0x004269adu,    /* call 0xaef15c */
  ISAAC_LOG_SUB_DTOR_NULL1_VA = 0x004269b2u,        /* [esi] := 0 */
  ISAAC_LOG_SUB_DTOR_NULL2_VA = 0x004269bbu,        /* [esi+4] := 0 */
  ISAAC_LOG_SUB_DTOR_NULL3_VA = 0x004269c2u,        /* [esi+8] := 0 */
  ISAAC_LOG_SUB_DTOR_E8_CALLSITES = 86, /* whole-.text, this unit */
  ISAAC_LOG_SUB_DTOR_RAW_OCCURRENCES = 0, /* all five sections */
  ISAAC_LOG_SUB_DTOR_PLAN_NONE = 0,       /* begin == 0: no free, no nulls */
  ISAAC_LOG_SUB_DTOR_PLAN_SMALL = 1,      /* count < 0x1000 */
  ISAAC_LOG_SUB_DTOR_PLAN_LARGE = 2,      /* count >= 0x1000, header sane */
  ISAAC_LOG_SUB_DTOR_PLAN_INVALID = 3,    /* host invalid_parameter (no free) */
  ISAAC_LOG_TEXT_INSN_COUNT_V18 = 2094319, /* carried (same SHA, deterministic
                                              decode as v11..v17) */
  ISAAC_LOG_TEXT_UNDECODABLE_BYTES_V18 = 469,
  ISAAC_LOG_V18_BATCHED_VAS = 3, /* 0x426980 + neighbor inner 0xa840c8 +
                                    delete shim 0xaef15c */
  ISAAC_LOG_V18_EXACT_ZHL_MATCHES = 0 /* none; address-stable */
};

/* ============================ ABI v19 ============================
   The open-helper path COMBINE 0x00a5a7a0 — flipped HOST -> PURE this
   unit (standing-host since v10). Body 0x00a5a7a0..0x00a5a938 (0x199
   bytes, 166 insns, 3 rets: 0xa5a83a fail arm, 0xa5a854 both-empty arm,
   0xa5a938 main), 7-byte int3 pad 0xa5a939..0xa5a93f, next function
   0xa5a940. NO SEH/GS frame in the body. identify-zhl: 0 exact matches
   (address-stable); NO inbound transfer lands mid-body (all 46 land on
   the entry).

   Call shape: combine(ecx=path, edx=base, [ebp+8]=lowercase flag,
   [ebp+0xc]=trailing-slash flag). cdecl 2 stack args; plain `ret`.
   Return: heap payload pointer (combined + normalized string).

     0xa5a7b6  len_path = inline strlen(path)   (NULL -> 0)
     0xa5a7cd  len_base = inline strlen(base)   (NULL -> 0)
     0xa5a7e1  has_sep  = len_base>0 AND last base byte in {'/','\\'}
     0xa5a7fb  len_path==0 AND len_base==0 -> BOTH-EMPTY arm:
                 counter = [0xc7de78] ? [0xc7de78]+0x30 : 0xc7f618
                 malloc(5) ; fail -> broadcast 0x7fcb9dd6 to the list at
                 0xc37974 then the directed null-write crash (never
                 returns a value). ok: counter.lo += 5 / counter.hi +=
                 carry; 4-byte header = 5 at buf; payload = "" at buf+4;
                 return buf+4 (counted EMPTY string).
     0xa5a855  size = (byte)[ebp+0xc] + 2 + len_base + len_path
                 (32-bit wrap; the +flag+2 slack is the sep+NUL budget —
                 consumed EXACTLY by the trailing "/" append).
     0xa5a86b  call 0xa648b0 (ecx=0 mode=alloc, size) -> payload (host
                 tracked allocator: malloc(size+4), header=size+4,
                 counter += size+4). fail -> allocator's own broadcast +
                 crash (code 0x7fcb9dd6 again).
     len_base==0                    -> strncpy_s(out, size, path,
                                                  len_path+1)  (copy path)
     len_base>0 AND len_path==0     -> strncpy_s(out, size, base,
                                                  len_base+1)  (copy base)
     both non-empty                 -> vsprintf_s(out, size, fmt, path,
                                                  base) via 0x652a30;
                                        fmt = has_sep ? "%s%s" (0xb60c28)
                                                     : "%s/%s" (0xb9ee70)
     0xa5a8d4  if out[0]!=0: per-char loop — IF (byte)[ebp+8] != 0 AND
                 (uint8)(ch - 0x41) <= 0x19 (8-bit wrap, `ja` unsigned)
                 -> ch += 0x20 (A-Z -> a-z); ALWAYS '\' -> '/'.
     0xa5a901  IF (byte)[ebp+0xc] != 0 AND out[len-1] != '/' ->
                 strcat_s(out, size, "/"). The len==0 read falls on the
                 pre-buffer byte out[-1] (the 4-byte header's high byte,
                 typically 0) — transcribed via the last_byte law param,
                 NEVER corrected (D-LOG-1 convention).
     0xa5a930  return out.

   Laws (PURE, byte-gate): lengths (NULL -> 0), has_sep detect, both-empty
   counted-empty + counter charge (+5, 64-bit), size law, copy count,
   mode selection (copy-path / copy-base / join), join format selection,
   per-char lowercase gate + unconditional slash normalization,
   trailing-slash append decision, fail arm (broadcast + directed crash,
   no value).

   Host leaves (platform primitives, typed): malloc [0xb187e0] /
   free [0xb187dc], strncpy_s [0xb18938], strcat_s [0xb18930],
   __stdio_common_vsprintf_s [0xb188e4] via shim 0x652a30 (options u64
   0xc71648 via getter 0x41d4c0), tracked allocator 0xa648b0, fail
   broadcast 0xa23200 (list head 0xc37974). The write-open base global
   0xc5aa98, init object 0xc7de78 and default counter 0xc7f618 are the
   combine's shared inputs (writer census in NOTES).

   Census (whole-.text, this unit): 46 direct rel32 call sites (7
   log-family: 0xa524da / 0xa5256f / 0xa525a2 / 0xa52644 / 0xa52681 /
   0xa5f429 / 0xa5f455 + 39 cross-family), ZERO address escapes (no
   imm32/disp32 equals the VA anywhere), zero jcc/push/mov-imm forms,
   zero raw little-endian dword occurrences, no mid-body inbound. */
enum {
  ISAAC_LOG_VA_OPEN_COMBINE = 0x00a5a7a0u,
  ISAAC_LOG_OPEN_COMBINE_END = 0x00a5a939u, /* first int3 after ret 0xa5a938 */
  ISAAC_LOG_OPEN_COMBINE_BODY_BYTES = 0x199u, /* END - VA */
  ISAAC_LOG_OPEN_COMBINE_INSN_COUNT = 166,
  ISAAC_LOG_OPEN_COMBINE_FIRST_RET_VA = 0x00a5a83au, /* the fail-arm ret */
  ISAAC_LOG_OPEN_COMBINE_RET_ARGS = 0,  /* plain ret; caller cleans 8 */
  ISAAC_LOG_OPEN_COMBINE_RETS = 3,      /* 0xa5a83a / 0xa5a854 / 0xa5a938 */
  ISAAC_LOG_OPEN_COMBINE_INBOUND_CALLSITES = 46, /* whole-.text, this unit */
  ISAAC_LOG_OPEN_COMBINE_RAW_OCCURRENCES = 0,    /* all five sections */
  ISAAC_LOG_OPEN_COMBINE_SEP_SLASH = 0x2fu,      /* '/' (join/trailing) */
  ISAAC_LOG_OPEN_COMBINE_SEP_BACKSLASH = 0x5cu,  /* '\' (base tail check) */
  ISAAC_LOG_OPEN_COMBINE_JOIN_SEP_VA = 0x00b60c28u,   /* "%s%s"  (has sep) */
  ISAAC_LOG_OPEN_COMBINE_JOIN_NOSEP_VA = 0x00b9ee70u, /* "%s/%s" (no sep) */
  ISAAC_LOG_OPEN_COMBINE_SLASH_STR_VA = 0x00b6db28u,  /* "/" (strcat_s) */
  ISAAC_LOG_OPEN_COMBINE_FAIL_CODE = 0x7fcb9dd6u, /* broadcast imm (not VA) */
  ISAAC_LOG_OPEN_COMBINE_FAIL_BROADCAST_VA = 0x00a23200u, /* list-walk fn */
  ISAAC_LOG_OPEN_COMBINE_FAIL_LIST_HEAD_VA = 0x00c37974u, /* node list head */
  ISAAC_LOG_OPEN_COMBINE_ALLOC_VA = 0x00a648b0u,    /* tracked alloc (host) */
  ISAAC_LOG_OPEN_COMBINE_VSPRINTF_S_VA = 0x00652a30u, /* vsprintf_s shim */
  ISAAC_LOG_OPEN_COMBINE_OPTIONS_GETTER = 0x0041d4c0u, /* &options u64 */
  ISAAC_LOG_OPEN_COMBINE_OPTIONS_VA = 0x00c71648u,     /* options u64 */
  ISAAC_LOG_OPEN_COMBINE_MALLOC_IAT = 0x00b187e0u,
  ISAAC_LOG_OPEN_COMBINE_STRNCPY_S_IAT = 0x00b18938u,
  ISAAC_LOG_OPEN_COMBINE_STRCAT_S_IAT = 0x00b18930u,
  ISAAC_LOG_OPEN_COMBINE_VSPRINTF_S_IAT = 0x00b188e4u,
  ISAAC_LOG_OPEN_COMBINE_COUNTER_DEFAULT_VA = 0x00c7f618u, /* 64-bit counter */
  ISAAC_LOG_OPEN_COMBINE_COUNTER_INIT_OFFSET = 0x30u,  /* init+0x30 counter */
  ISAAC_LOG_OPEN_COMBINE_INIT_OBJECT_VA = 0x00c7de78u, /* init object ptr */
  ISAAC_LOG_OPEN_COMBINE_BASE_GLOBAL_VA = 0x00c5aa98u, /* write-open base */
  ISAAC_LOG_OPEN_COMBINE_BOTH_EMPTY_HEADER = 5u,  /* dword at payload-4 */
  ISAAC_LOG_OPEN_COMBINE_BOTH_EMPTY_DELTA = 5u,   /* counter 64-bit += 5 */
  ISAAC_LOG_OPEN_COMBINE_SIZE_SLACK = 2u,         /* +2 (sep+NUL budget) */
  ISAAC_LOG_OPEN_COMBINE_MODE_COPY_PATH = 0,  /* base empty: copy path */
  ISAAC_LOG_OPEN_COMBINE_MODE_COPY_BASE = 1,  /* path empty: copy base */
  ISAAC_LOG_OPEN_COMBINE_MODE_JOIN = 2,       /* both non-empty: vsprintf_s */
  ISAAC_LOG_TEXT_INSN_COUNT_V19 = 2094319, /* carried (same deterministic
                                               decode as v18) */
  ISAAC_LOG_TEXT_UNDECODABLE_BYTES_V19 = 469,
  ISAAC_LOG_V19_BATCHED_VAS = 7, /* combine + fail broadcast 0xa23200 +
                                    tracked alloc 0xa648b0 + vsprintf_s shim
                                    0x652a30 + options getter 0x41d4c0 +
                                    read-open 0xa52540 + write-open 0xa52610 */
  ISAAC_LOG_V19_EXACT_ZHL_MATCHES = 0 /* none; address-stable */
};

/* ---------- v20: the fail-broadcast list walk 0x00a23200 ---------- */

/* The shared fail-broadcast: walk a custom MSVC node list (head
   0xc37974), firing fn(code, ctx) for every committed node. This unit
   lands the walk's OWN pure decisions (traversal bounds, registration/
   teardown gates, fail-code semantics) and pins the CALLBACK DISPATCH
   itself as typed-host (MSVC node-list callbacks = platform). Body
   0x00a23200..0x00a2322e (0x2f bytes, 21 insns, zero E8, one indirect
   `call eax` at 0xa2321a, zero mem-stores — the body is READ-ONLY),
   ret 4 at 0x00a2322c, int3 pad byte 0xa2322f, next function 0xa23230.
   identify-zhl: 0 exact matches (address-stable).

   Entry gate 0xa2320b compares the first node against the SNAPSHOT head
   (eax, read once); the loop gate 0xa23221 compares against the LIVE
   head re-read every iteration. The ONLY termination is returning to
   the live head; no node cap, no NULL check, callback results ignored.
   Empty list (sentinel self-linked) -> zero callbacks, no dispatch.

   The fail code is passed through UNMODIFIED (no narrowing in the body)
   as arg1 of every callback with node+0xc as arg2 (cdecl, caller pops
   8). Census: 45 direct rel32 callers — 44 push the CONSTANT
   0x7fcb9dd6 (same magic as ISAAC_LOG_INIT_OBJECT_MAGIC), 1 site
   (0xa23129) pushes the dynamic report value of the 0xc37964 object's
   vtbl[0x10] (0xa23260, out1 = sentinelA+0x10) — plus 6 INLINED copies
   of the walk at malloc-OOM arms (0x725055, 0x9972a0, 0xa5a0b0,
   0xa75310, 0xa7a8c0, 0xa8b5e5). Registration: dynamic initializer
   0x00406740 (CRT init table .rdata 0xb18ba4, SEH 0xb11949) zeroes the
   head, then installs the self-referential sentinel (the ONLY head
   writer after the zero; the list is EMPTY for the process lifetime —
   every broadcast no-ops at the entry gate). Teardown: atexit dtor
   0xb16c80 deletes the sentinel (0x10) and the active-list sentinel A
   (0x18); PINNED: the head global is never cleared (dangles after
   teardown). */
enum {
  ISAAC_LOG_VA_FAIL_BROADCAST = 0x00a23200u,
  ISAAC_LOG_FAIL_BROADCAST_END = 0x00a2322fu, /* first int3 */
  ISAAC_LOG_FAIL_BROADCAST_BODY_BYTES = 0x2fu, /* END - VA = 47 */
  ISAAC_LOG_FAIL_BROADCAST_INSN_COUNT = 21,
  ISAAC_LOG_FAIL_BROADCAST_FIRST_RET_VA = 0x00a2322cu,
  ISAAC_LOG_FAIL_BROADCAST_RET_ARGS = 4,  /* callee pops the code dword */
  ISAAC_LOG_FAIL_BROADCAST_RETS = 1,
  ISAAC_LOG_FAIL_BROADCAST_INDIRECT_CALLS = 1, /* the callback dispatch */
  ISAAC_LOG_FAIL_BROADCAST_E8_CALLS = 0,
  ISAAC_LOG_FAIL_BROADCAST_DIRECT_CALLSITES = 45, /* whole-.text, this unit */
  ISAAC_LOG_FAIL_BROADCAST_INLINED_COPIES = 6, /* 725055/9972a0/a5a0b0/
                                                 a75310/a7a8c0/a8b5e5 */
  ISAAC_LOG_FAIL_BROADCAST_RAW_OCCURRENCES = 0, /* imm32 VA: 0 */
  ISAAC_LOG_FAIL_BROADCAST_LIST_HEAD_VA = 0x00c37974u,
  ISAAC_LOG_FAIL_BROADCAST_FAIL_CODE = 0x7fcb9dd6u, /* broadcast imm */
  ISAAC_LOG_FAIL_BROADCAST_CONSTANT_CODE_SITES = 44, /* of the 45 */
  ISAAC_LOG_FAIL_BROADCAST_DYNAMIC_CODE_SITE_VA = 0x00a23129u, /* push esi */
  ISAAC_LOG_FAIL_BROADCAST_DYNAMIC_CODE_SOURCE_VA = 0x00a23260u, /* vtbl+0x10 */
  ISAAC_LOG_FAIL_BROADCAST_NODE_NEXT_OFFSET = 0x00u, /* walked next link */
  ISAAC_LOG_FAIL_BROADCAST_NODE_PREV_OFFSET = 0x04u, /* unused by the walk */
  ISAAC_LOG_FAIL_BROADCAST_NODE_FN_OFFSET = 0x08u,   /* the callback */
  ISAAC_LOG_FAIL_BROADCAST_NODE_CTX_OFFSET = 0x0cu,  /* callback arg 2 */
  ISAAC_LOG_FAIL_BROADCAST_CALLBACK_ARGS = 2,
  ISAAC_LOG_FAIL_BROADCAST_CALLBACK_STACK_BYTES = 8, /* cdecl cleanup */
  ISAAC_LOG_FAIL_BROADCAST_HEAD_WRITERS = 2,
  ISAAC_LOG_FAIL_BROADCAST_HEAD_ZERO_WRITE_VA = 0x0040678au,
  ISAAC_LOG_FAIL_BROADCAST_HEAD_SENTINEL_WRITE_VA = 0x004067adu,
  ISAAC_LOG_FAIL_BROADCAST_HEAD_READER_SITES = 18, /* imm32 refs: 2 body +
                                                     2 init + 2 dtor + 12 */
  ISAAC_LOG_FAIL_BROADCAST_HEAD_LOAD_VALUE = 0, /* .data file-backed 0 */
  ISAAC_LOG_FAIL_BROADCAST_HEAD_WRITES_AFTER_INIT = 0,
  ISAAC_LOG_FAIL_BROADCAST_SENTINEL_SELF_LINKS = 1, /* next & prev self */
  ISAAC_LOG_FAIL_BROADCAST_INIT_THUNK_VA = 0x00406740u, /* dynamic init */
  ISAAC_LOG_FAIL_BROADCAST_INIT_TABLE_SLOT_VA = 0x00b18ba4u, /* .rdata */
  ISAAC_LOG_FAIL_BROADCAST_INIT_SEH_VA = 0x00b11949u,
  ISAAC_LOG_FAIL_BROADCAST_OBJECT_VA = 0x00c37964u, /* vtable + lists */
  ISAAC_LOG_FAIL_BROADCAST_OBJECT_VTABLE_VA = 0x00ba2120u, /* live */
  ISAAC_LOG_FAIL_BROADCAST_ACTIVE_LIST_HEAD_VA = 0x00c3796cu, /* object+8 */
  ISAAC_LOG_FAIL_BROADCAST_SENTINEL_A_SIZE = 0x18u, /* active list node */
  ISAAC_LOG_FAIL_BROADCAST_SENTINEL_B_SIZE = 0x10u, /* broadcast node */
  ISAAC_LOG_FAIL_BROADCAST_SENTINEL_TAG = 0x101u, /* word at A+0xc */
  ISAAC_LOG_FAIL_BROADCAST_DTOR_VA = 0x00b16c80u, /* atexit teardown */
  ISAAC_LOG_FAIL_BROADCAST_DTOR_BODY_BYTES = 0x5eu, /* ..0xb16cdd */
  ISAAC_LOG_FAIL_BROADCAST_DTOR_FIRST_RET_VA = 0x00b16cddu,
  ISAAC_LOG_FAIL_BROADCAST_DTOR_RET_ARGS = 0, /* plain ret */
  ISAAC_LOG_FAIL_BROADCAST_DTOR_HEAD_DELETE_SIZE = 0x10u,
  ISAAC_LOG_FAIL_BROADCAST_DTOR_CLEARS_HEAD = 0, /* pin: dangles */
  ISAAC_LOG_FAIL_BROADCAST_DTOR_VTABLE_SWAP_1 = 0x00b82d40u,
  ISAAC_LOG_FAIL_BROADCAST_DTOR_VTABLE_SWAP_2 = 0x00b9fdccu,
  ISAAC_LOG_FAIL_BROADCAST_ATEXIT_VA = 0x00aef5afu, /* == LOG_VA_ATEXIT */
  ISAAC_LOG_TEXT_INSN_COUNT_V20 = 2094319, /* carried (same deterministic
                                              decode, same SHA) */
  ISAAC_LOG_TEXT_UNDECODABLE_BYTES_V20 = 469,
  ISAAC_LOG_V20_BATCHED_VAS = 4, /* 0xa23200 / 0xa2322c / 0xa23213 /
                                    0xa23221 */
  ISAAC_LOG_V20_EXACT_ZHL_MATCHES = 0 /* none; address-stable */
};

/* len_base > 0 AND base[len-1] in {'/','\\'} — the has-separator byte at
   [esp+0x13]. The last-byte compare is BYTE-wide: 0x12f reads as 0x2f.
   len_base == 0 -> 0 (no read of base[-1]). */
int32_t isaac_log_combine_has_trailing_sep(uint32_t len_base,
                                           uint32_t last_byte);

/* Both len_path and len_base zero -> the counted-empty arm 0xa5a803. */
int32_t isaac_log_combine_both_empty(uint32_t len_path, uint32_t len_base);

/* mov esi,[0xc7de78]; test; je default; add esi,0x30 — the counter
   selection: init_ptr ? init_ptr + 0x30 : 0xc7f618 (both 64-bit). */
uint32_t isaac_log_combine_counter_va(uint32_t init_ptr);

/* mov dword [eax], 5 — the 4-byte header on the both-empty allocation. */
uint32_t isaac_log_combine_both_empty_header(void);

/* add [esi],5 ; adc [esi+4],0 — the 64-bit counter charge: low dword
   addend 5, high dword += carry. */
uint32_t isaac_log_combine_both_empty_delta(void);

/* movzx eax, byte [ebp+0xc]; add eax,2; add eax,edi; add eax,esi —
   size = (byte)trailing_flag + 2 + len_base + len_path, 32-bit wrap.
   The +flag+2 slack is the "/" + NUL budget; consumed exactly. */
uint32_t isaac_log_combine_alloc_size(uint32_t len_path, uint32_t len_base,
                                      uint32_t trailing_flag);

/* lea ecx,[esi+1] — strncpy_s count = src_len + 1 (includes the NUL). */
uint32_t isaac_log_combine_copy_count(uint32_t src_len);

/* Mode selection from the two lens (the combine arm requires
   len_path+len_base > 0): 0 = COPY_PATH (base empty), 1 = COPY_BASE (path
   empty), 2 = JOIN (both non-empty). */
uint32_t isaac_log_combine_mode(uint32_t len_path, uint32_t len_base);

/* The join separator decision: has_sep ? 0 : 1 — base's own trailing
   separator skips the inserted "/". fmt = has_sep ? "%s%s" : "%s/%s". */
uint32_t isaac_log_combine_join_uses_sep(uint32_t has_trailing_sep);

/* Per-char normalization, byte-gate EXACT: lowercase is gated by the
   (byte)[ebp+8] flag AND (uint8)(ch - 0x41) <= 0x19 (8-bit sub, `ja`
   unsigned — only 0x41..0x5A qualify); backslash -> slash conversion is
   UNCONDITIONAL. Returns the transformed byte 0..0xff. */
uint32_t isaac_log_combine_normalize_char(uint32_t ch,
                                          uint32_t lowercase_flag);

/* cmp byte [ebp+0xc], 0 ; je skip  +  cmp byte [out+len-1], '/' ; je skip
   — trailing "/" append decision: flag != 0 AND last byte != '/'. The
   len==0 read falls on the pre-buffer byte out[-1] (header high byte,
   0 in practice) — the CALLER passes that byte via last_byte; never
   corrected. */
int32_t isaac_log_combine_trailing_needed(uint32_t trailing_flag,
                                          uint32_t last_byte);

/* The fail arm: push 0x7fcb9dd6; call 0xa23200 (broadcast) then
   `xor eax,eax; mov byte [eax],al` — a directed write-to-VA-0 crash.
   NO value is ever returned on the fail arm. */
int32_t isaac_log_combine_fail_crashes(void);

/* The broadcast imm 0x7fcb9dd6 (a fail code, NOT an address). */
uint32_t isaac_log_combine_fail_code(void);

/* Identities + census + host-leaf VAs. */
uint32_t isaac_log_combine_body_va(void);
uint32_t isaac_log_combine_end_va(void);
uint32_t isaac_log_combine_body_bytes(void);
uint32_t isaac_log_combine_insn_count(void);
uint32_t isaac_log_combine_first_ret_va(void);
uint32_t isaac_log_combine_ret_args(void);
uint32_t isaac_log_combine_rets(void);
uint32_t isaac_log_combine_inbound_callsites(void);
uint32_t isaac_log_combine_raw_occurrences(void);
uint32_t isaac_log_combine_join_sep_va(void);
uint32_t isaac_log_combine_join_nosep_va(void);
uint32_t isaac_log_combine_slash_str_va(void);
uint32_t isaac_log_combine_fail_broadcast_va(void);
uint32_t isaac_log_combine_alloc_va(void);
uint32_t isaac_log_combine_malloc_iat_va(void);
uint32_t isaac_log_combine_strncpy_s_iat_va(void);
uint32_t isaac_log_combine_strcat_s_iat_va(void);

/* ---------- v20: the fail-broadcast list walk 0x00a23200 ---------- */

/* cmp esi,eax ; je -- ENTRY GATE vs the SNAPSHOT head (read once at
   0xa23203). Empty (first_next == head_snapshot) -> 1: zero callbacks,
   the sentinel never fires. FULL 32-bit compare. */
int32_t isaac_log_broadcast_walk_empty(uint32_t head_snapshot,
                                       uint32_t first_next);

/* cmp esi,[0xc37974] ; jne -- LOOP GATE vs the LIVE head, re-read every
   iteration (0xa23221 READS the global, never reuses the snapshot).
   Continue (1) iff node_next != head_live. FULL 32-bit compare. */
int32_t isaac_log_broadcast_walk_continues(uint32_t node_next,
                                           uint32_t head_live);

/* The traversal bounds: the ONLY termination is returning to the LIVE
   head. 1 iff the entry gate is empty (trivially terminates with zero
   callbacks) OR some nexts[i] equals head_live. A chain that never
   returns to the live head does NOT terminate (walks forever or
   dereferences a foreign cycle — platform risk, never corrected). */
int32_t isaac_log_broadcast_walk_terminates(uint32_t head_snapshot,
                                            uint32_t head_live,
                                            uint32_t first_next,
                                            const uint32_t* nexts,
                                            uint32_t next_count);

/* Fired callback count for the same traversal: 0 when the entry gate is
   empty; else (index of the FIRST nexts entry == head_live) + 1; 0 when
   non-terminating. The fired node's [node+8]/[node+0xc] are the
   dispatch's inputs (typed-host call), the count is the walk's own. */
uint32_t isaac_log_broadcast_visited_count(uint32_t head_snapshot,
                                           uint32_t head_live,
                                           uint32_t first_next,
                                           const uint32_t* nexts,
                                           uint32_t next_count);

/* mov edi,[ebp+8]; push edi — the fail code reaches every callback
   UNMODIFIED (full 32-bit; the body narrows nothing). Identity law. */
uint32_t isaac_log_broadcast_code_passthrough(uint32_t code);

/* push [esi+0xc]; push edi — arg1 = code, arg2 = ctx (ctx pushed
   FIRST, i.e. right-most). */
uint32_t isaac_log_broadcast_callback_args(void);

/* add esp,8 after every call — cdecl, caller pops the two args. */
uint32_t isaac_log_broadcast_callback_stack_bytes(void);

/* The call eax at 0xa2321a is the MSVC node-list callback dispatch —
   TYPED-HOST per the standing classification (never modelled). 1 pins
   the audit's platform edge. */
int32_t isaac_log_broadcast_callback_dispatch_is_platform(void);

/* The broadcast code: 0x7fcb9dd6 at 44 of 45 call sites. */
uint32_t isaac_log_broadcast_fail_code(void);

/* 0x7fcb9dd6 == ISAAC_LOG_INIT_OBJECT_MAGIC — the broadcast code and
   the init-object magic are ONE constant (pinned identity). */
int32_t isaac_log_broadcast_fail_code_matches_init_magic(void);

/* Sites verified byte-wise as push-imm 0x7fcb9dd6 BEFORE the call
   (exact 9-byte pattern 68 d6 9d cb 7f e8): 44 of the 45. */
uint32_t isaac_log_broadcast_constant_code_sites(void);

/* The single dynamic site: push esi at 0xa23129 (esi = out1 of the
   0xc37964 object's vtbl[0x10] report, = sentinelA+0x10 — opaque
   runtime value, never narrowed). */
uint32_t isaac_log_broadcast_dynamic_code_site_va(void);

/* vblt[0x10] of the 0xc37964 object = 0xa23260; out1 = [sentinelA+0x10]
   is what the dynamic site broadcasts. */
uint32_t isaac_log_broadcast_dynamic_code_source_va(void);

/* The dynamic site's gate chain (0xa23101..0xa23126): fires the
   broadcast iff (flag_byte & 0xff) == 0 AND rank >= node_rank (UNSIGNED
   jb skip) AND node != active-list sentinel AND payload_result == 0.
   Byte-gate discipline: flag_byte is narrowed with & 0xff inside. */
int32_t isaac_log_broadcast_dynamic_site_fires(uint32_t flag_byte,
                                               uint32_t rank,
                                               uint32_t node_rank,
                                               uint32_t node_is_sentinel,
                                               uint32_t payload_result);

/* Word [A+0xc] = 0x101 on the ACTIVE-list sentinel; low byte = 1
   (byte-gate example: uint32 in, & 0xff out). */
uint32_t isaac_log_broadcast_sentinel_tag(void);
uint32_t isaac_log_broadcast_sentinel_tag_low_byte(void);

/* Identities + registration/teardown census. */
uint32_t isaac_log_broadcast_body_va(void);
uint32_t isaac_log_broadcast_end_va(void);
uint32_t isaac_log_broadcast_body_bytes(void);
uint32_t isaac_log_broadcast_insn_count(void);
uint32_t isaac_log_broadcast_first_ret_va(void);
uint32_t isaac_log_broadcast_ret_args(void);
uint32_t isaac_log_broadcast_rets(void);
uint32_t isaac_log_broadcast_indirect_calls(void);
uint32_t isaac_log_broadcast_e8_calls(void);
uint32_t isaac_log_broadcast_direct_callsites(void);
uint32_t isaac_log_broadcast_inlined_copies(void);
uint32_t isaac_log_broadcast_raw_occurrences(void);
uint32_t isaac_log_broadcast_list_head_va(void);
uint32_t isaac_log_broadcast_node_next_offset(void);
uint32_t isaac_log_broadcast_node_prev_offset(void);
uint32_t isaac_log_broadcast_node_fn_offset(void);
uint32_t isaac_log_broadcast_node_ctx_offset(void);
uint32_t isaac_log_broadcast_head_writers(void);
uint32_t isaac_log_broadcast_head_zero_write_va(void);
uint32_t isaac_log_broadcast_head_sentinel_write_va(void);
uint32_t isaac_log_broadcast_head_reader_sites(void);
uint32_t isaac_log_broadcast_head_load_value(void);
uint32_t isaac_log_broadcast_head_writes_after_init(void);
uint32_t isaac_log_broadcast_sentinel_self_links(void);
uint32_t isaac_log_broadcast_init_thunk_va(void);
uint32_t isaac_log_broadcast_init_table_slot_va(void);
uint32_t isaac_log_broadcast_init_seh_va(void);
uint32_t isaac_log_broadcast_object_va(void);
uint32_t isaac_log_broadcast_object_vtable_va(void);
uint32_t isaac_log_broadcast_active_list_head_va(void);
uint32_t isaac_log_broadcast_sentinel_a_size(void);
uint32_t isaac_log_broadcast_sentinel_b_size(void);
uint32_t isaac_log_broadcast_dtor_va(void);
uint32_t isaac_log_broadcast_dtor_body_bytes(void);
uint32_t isaac_log_broadcast_dtor_first_ret_va(void);
uint32_t isaac_log_broadcast_dtor_ret_args(void);
uint32_t isaac_log_broadcast_dtor_head_delete_size(void);
uint32_t isaac_log_broadcast_dtor_clears_head(void);
uint32_t isaac_log_broadcast_dtor_vtable_swap_1(void);
uint32_t isaac_log_broadcast_dtor_vtable_swap_2(void);
uint32_t isaac_log_broadcast_atexit_va(void);

/* Full-32-bit begin gate: `test eax,eax ; je` on [esi] — 0x100/0x1ff/
   0xffffffff ALL fire the free (and the null stores); only 0 skips. */
int32_t isaac_log_sub_dtor_needed(uint32_t begin);

/* mov ecx,[esi+8] ; sub ecx,eax ; and ecx,0xfffffff8 — the byte count is
   (end - begin) with 32-bit wrap BEFORE the mask. */
uint32_t isaac_log_sub_dtor_byte_count(uint32_t begin, uint32_t end);

/* cmp ecx,0x1000 ; jb small — UNSIGNED below: count >= 0x1000 -> large. */
int32_t isaac_log_sub_dtor_large(uint32_t begin, uint32_t end);

/* sub eax,edx ; add eax,-4 ; cmp eax,0x1f ; ja abort — valid iff
   (u32)(begin - header - 4) <= 0x1f. */
int32_t isaac_log_sub_dtor_header_sane(uint32_t begin, uint32_t header);

/* The composed plan: 0 NONE (begin==0) / 1 SMALL / 2 LARGE / 3 INVALID
   (large arm with an unsane header -> host _invalid_parameter, noreturn —
   the free NEVER runs). */
uint32_t isaac_log_sub_dtor_free_plan(uint32_t begin, uint32_t end,
                                      uint32_t header);

/* SMALL: begin; LARGE: header; NONE/INVALID: 0 (no free runs). */
uint32_t isaac_log_sub_dtor_free_ptr(uint32_t begin, uint32_t end,
                                     uint32_t header);

/* SMALL: count; LARGE: count + 0x23 (32-bit wrap); NONE/INVALID: 0. */
uint32_t isaac_log_sub_dtor_free_size(uint32_t begin, uint32_t end,
                                      uint32_t header);

/* 1 iff the host must abort (PLAN_INVALID): large arm AND header NOT sane.
   The abort is noreturn — no free, no nulls. */
int32_t isaac_log_sub_dtor_invalid_needed(uint32_t begin, uint32_t end,
                                          uint32_t header);

/* mov [esi],0 ; [esi+4],0 ; [esi+8],0 — all three cells NULLed AFTER the
   free call, on BOTH free paths. begin == 0 -> NO nulls (early ret). */
int32_t isaac_log_sub_dtor_null_after(uint32_t begin, uint32_t end,
                                      uint32_t header);

/* Identities + census. */
uint32_t isaac_log_sub_dtor_body_va(void);
uint32_t isaac_log_sub_dtor_body_bytes(void);
uint32_t isaac_log_sub_dtor_insn_count(void);
uint32_t isaac_log_sub_dtor_first_ret_va(void);
uint32_t isaac_log_sub_dtor_ret_args(void);
uint32_t isaac_log_sub_dtor_begin_offset(void);
uint32_t isaac_log_sub_dtor_mylast_offset(void);
uint32_t isaac_log_sub_dtor_myend_offset(void);
uint32_t isaac_log_sub_dtor_delete_va(void);
uint32_t isaac_log_sub_dtor_invalid_iat_va(void);
uint32_t isaac_log_sub_dtor_invalid_call_va(void);
uint32_t isaac_log_sub_dtor_e8_callsites(void);
uint32_t isaac_log_sub_dtor_raw_occurrences(void);


/* ============ v21: the sink Close member 0x00a526f0 (vtbl+0x34, SEH 0xaf0a10) ============ */

/* The sink-object Close member — the LAST un-landed sink object body;
   its PURE decisions land here (ABI 20 -> 21). Body 0x00a526f0..
   0x00a52753 (0x64 bytes, 32 insns, 0 resyncs, ONE `ret` at
   0x00a52753; int3 pad 0x00a52754..0x00a5275f, next function
   0x00a52760). SEH handler 0x00af0a10, security cookie 0x00bf93b4;
   normal-path epilogue pops the cookie WITHOUT a
   __security_check_cookie call (family frame shape, matches v10/v11).

   Exact control flow (full body, this unit):

     0x00a52713  mov esi, ecx                  ; this
     0x00a52715  mov eax, [esi]                ; vtbl
     0x00a52717  call [eax + 0x2c]             ; DISPATCH: the vtbl+0x2c
                                               ;   fclose leaf 0x00a526d0
                                               ;   — UNCONDITIONAL, FIRST
                                               ;   action (no file/path/
                                               ;   state read gates it)
     0x00a5271a  mov edx, [esi + 8]            ; edx = path cell (+8)
     0x00a5271d  mov [esi + 4], 2              ; STATE := 2 — ONE FULL-
                                               ;   dword store, UNCONDITIONAL
                                               ;   (both arms), positioned
                                               ;   before the free gate
     0x00a52724  test edx, edx                 ; FREE GATE: FULL 32-bit
     0x00a52726  je 0xa52744                   ;   path cell (0x100/0x1ff/
                                               ;   0xffffffff fire; 0 skip)
     0x00a52728  push 0 ; push 0 ; mov cl,1    ; guest free mode 1
     0x00a5272e  mov [ebp-4], 0                ; SEH try-level := 0
     0x00a52735  call 0x00a648b0               ; HOST shared allocator
                                               ;   (guest free of path)
     0x00a5273d  mov [esi + 8], 0              ; path cell := NULL — free
                                               ;   arm ONLY, AFTER the call
     0x00a52744  ... epilogue (fs restore, cookie pop without check)
     0x00a52753  ret                           ; 0 stack args

   The FILE* presence gate is NOT in this body: the dispatch is
   unconditional, and the gate lives INSIDE the typed-host leaf
   0x00a526d0 (FULL-dword test on cell +0xc at 0xa526d6; fclose
   [0xb1890c] at 0xa526db; cell NULLed at 0xa526e4 ONLY on the fclose
   arm — the skip arm leaves the cell untouched). The Close member's
   file-cell successor laws land those leaf semantics (referenced
   constants; the leaf body stays PLATFORM per the standing sink-leaf
   decision).

   Pure island (translated here): the dispatch-unconditional pin, the
   state-transition gate (state := 2, ONE store, both arms — the v11
   dtor's TWO-store shape is the contrast, STATE_STORES=1), the FILE*
   presence gate via the leaf (FULL-DWORD: 0x100/0x1ff/0xffffffff
   close, 0 does not; conditional null), the free-path condition
   (FULL-DWORD path gate; free arm = guest free mode 1 + path NULL
   after; skip arm = neither), NO vtable store (delta vs the v11
   dtor's 3-store chain; VTABLE_STORES=0), the ret width (0 stack
   args), the SEH/GS frame (handler 0xaf0a10, cookie 0xbf93b4), the
   slot census (sink 0xba51b8 / sibling 0xb9e974 = the ONLY reach:
   0 direct call/jmp/jcc/push/mov/imm refs whole-.text, 2 raw dword
   occurrences — the two slots, verified byte-exact this unit) and the
   state-getter identity (0xa25440 at +0x30 of both tables).

   Reach census (whole-.text linear decode with resync, corrected
   tooling — census-close.py): 2,094,319 insns / 469 undecodable bytes
   (family's recorded corrected figures). 0xa526f0: direct-call 0,
   jmp 0, jcc 0, push 0, mov 0, imm 0; the only inbound edge into the
   extent is the interior `je 0xa52744`. Raw little-endian dword
   occurrences across all five sections: EXACTLY 2 (.rdata 0x00ba51b8
   + 0x00b9e974). NOT dead: the two vtable slots dispatch it.

   Census-close (same unit, no laws): 0xa25450 — the base-class Close
   twin (vtable 0x00b833d8 slot +0x34 = 0x00b8340c), SAME SEH handler
   0xaf0a10 + GS cookie; body 0xa25450..0xa254ae, structure IDENTICAL
   to the Close member MINUS the vtbl+0x2c dispatch (the base class has
   no FILE* cell: its +0x2c slot is the stub 0xaf05d3 and the body
   never reads [esi+0xc]). 0 direct refs, EXACTLY 1 raw dword
   (0x00b8340c). Classification: covered by the Close laws (same gates
   D1/D3; the absent dispatch is the defining delta) — no separate
   exports. Also recorded: 0xa254c0 (vtable 0xb83418 +0x00, base-class
   sized-delete wrapper), 0xa25510 (_access [0xb187cc] != -1) and
   0xa25530 (GetFileAttributesW [0xb182dc] == 1 or GetLastError
   [0xb182bc] == 0xb7) — the 0xb83418 table's members, PLATFORM, 0
   direct refs.

   Identity pass: 6 VAs batched in ONE identify-zhl call (0xa526f0,
   0xa25450, 0xa25440, 0xba51b8, 0xb9e974, 0xaf0a10), 0 exact
   matches (address-stable). */

/* ======================= v22: the state!=2 getter 0x00a25440 =======================
   (vtbl+0x30 of the sink/sibling/dtor-phase tables; LANDED, ABI 21 -> 22)

   Fresh decode (dump-pe-span.py, section-table mapping), extent
   0xa25440..0xa25448 (first int3), 8 bytes, **3 insns, 0 resyncs,
   1 ret @ 0xa25447, E8 0, indirect 0, mem-stores 0**:

       0x00a25440  cmp dword ptr [ecx + 4], 2   ; FULL-dword read of the
                                                ;   state cell at +4
       0x00a25444  setne al                     ; al = (state != 2) ? 1 : 0
       0x00a25447  ret                          ; plain ret

   Pure getter: no SEH/GS frame, no vtable read/store, no call, no stack
   args. The READ WIDTH is the law (byte-gate discipline): `cmp dword ptr`
   — a low-byte compare misfires on 0x102/0x302/0xff02. The observable is
   the 0/1 boolean `state != 2` (2 == LOG_SINK_STATE_NO_FILE, the Close
   law's state value; the getter is exactly the state cell's != NO_FILE
   test).

   Reach census (census-leaves.py, whole-.text linear decode with resync,
   family's recorded corrected figures: 2,094,319 insns / 469 undecodable
   bytes, SAME sha256): 0 direct call/jmp/jcc/push/mov refs; 3 imm refs =
   DEVIRT-CMP sites at 0x92be28/0x92c008/0x92c1e8, each
   `mov eax,[esi] ; mov eax,[eax+0x30] ; cmp eax,0xa25440 ; jne <virtual
   dispatch> ; <INLINED body: cmp dword ptr [esi+4],2 ; setne al>` — the
   three inlined copies are instruction-identical to 0xa25440
   (cpu-dump/0092be00.txt etc.), binary confirmation of the semantics.
   Raw dwords: 7 total — .rdata 4 (0xb83408 = 0xb833d8+0x30, 0xba51b4 =
   0xba5184+0x30, 0xb9e970 = 0xb9e940+0x30, 0xb65754 = function table
   0xb65724+0x30) + .text 3 (the cmp immediates). **Correction to the
   v21/handoff "four vtables" claim**: 0xb9c15c is a 10-SLOT table
   (+0x00 0xa28130, +0x04/+0x08/+0x0c/+0x14/+0x1c/+0x20 = stub 0xaf05d3,
   +0x10 0xa28170, +0x18 0xa28190; +0x24 = "Inva" — the string "Invalid
   object used in..." follows); its +0x30/+0x38 dwords are string bytes,
   NOT slots. The fourth real carrier is the extra 13-slot function table
   0xb65724 (+0x00 0x683710, +0x04/+0x08 0x67efb0/0x67efc0, +0x0c 0x683a90,
   +0x10 0x67efd0, +0x14/+0x18 0x683b60/0x683bb0, +0x1c 0x683c10,
   +0x20 0x40c200, +0x24 0x683820 = the string handler the three devirt
   bodies dispatch on, +0x28 0xa25410 = the v11 dtor inner, +0x2c 0x40c200,
   +0x30 0xa25440, +0x34 0x6839b0, +0x38 0x43eec0) — steamworks-shim
   file-storage interface table ("STEAMREMOTESTORAGE_INTERFACE" string
   follows), recorded as the extra carrier, NOT family-owned.

   ALSO censused this unit (no laws): the base-class deleting wrapper
   0xa254c0 (vtable 0xb83418 +0x00) — 37 insns, ret 4, 2 x sized-free
   0xaef15c (payload size 1 + object size 0x20), vtable-store CHAIN
   ([esi] := 0xb83418 at entry, [esi] := 0xb9fdcc before the delete),
   flags `and [esi+4],0xfffffffe` (unconditional), deleting-flag byte
   test `test byte [ebp+8],1`, payload cell +0x18 freed + NULLed on the
   FULL-dword gate. VTBL class -> EVIDENCE (no laws; 0 direct refs,
   EXACTLY 1 raw dword 0xb83418). 0xb83418's own +0x30/+0x38 dwords are
   string bytes (v21's "log-side pins at +0x30/+0x38" claim corrected);
   its 12 live slots +0x00..+0x2c hold 0xa254c0/0xa649b0/0xa24ea0/
   0xa24ec0/0x67efc0/0xa24fd0/0xa25090/0xa25130/0xa25510 (_access)/
   0xa25530 (GetFileAttributesW)/0xa25560/0x00000000 — the v21-recorded
   PLATFORM members. 0x43eec0 (path getter, vtbl+0x38) censused: 22
   direct calls + 2 callback-registration pushes (0x86b72b/0x86c361) —
   engine binding surface, PLATFORM per log-v21-iocluster, registered by
   NO family file (ledger note: engine-family carrier). */

enum {
  ISAAC_LOG_VA_SINK_CLOSE = 0x00a526f0u,
  ISAAC_LOG_SINK_CLOSE_END = 0x00a52754u, /* first int3 after ret 0xa52753 */
  ISAAC_LOG_SINK_CLOSE_BODY_BYTES = 0x64u, /* END - VA = 100 */
  ISAAC_LOG_SINK_CLOSE_INSN_COUNT = 32,
  ISAAC_LOG_SINK_CLOSE_FIRST_RET_VA = 0x00a52753u,
  ISAAC_LOG_SINK_CLOSE_RET_ARGS = 0,      /* plain `ret` — no ret N */
  ISAAC_LOG_SINK_CLOSE_RETS = 1,
  ISAAC_LOG_SINK_CLOSE_E8_CALLS = 1,      /* 0xa648b0 @ 0xa52735 */
  ISAAC_LOG_SINK_CLOSE_INDIRECT_CALLS = 1, /* the vtbl+0x2c dispatch */
  ISAAC_LOG_SINK_CLOSE_MEM_STORES = 5,    /* fs[0] x2 + state + trylevel
                                             + path-null (object stores 2) */
  ISAAC_LOG_SINK_CLOSE_DISPATCH_VA = 0x00a52717u, /* call [eax+0x2c] */
  ISAAC_LOG_SINK_CLOSE_DISPATCH_SLOT = 0x2cu,      /* vtbl+0x2c */
  ISAAC_LOG_SINK_CLOSE_FCLOSE_LEAF_VA = 0x00a526d0u, /* typed-host leaf */
  ISAAC_LOG_SINK_CLOSE_STATE_STORE_VA = 0x00a5271du, /* mov [esi+4],2 */
  ISAAC_LOG_SINK_CLOSE_STATE_VALUE = 2,  /* == SINK_STATE_NO_FILE */
  ISAAC_LOG_SINK_CLOSE_STATE_STORES = 1, /* ONE store (v11 dtor: 2) */
  ISAAC_LOG_SINK_CLOSE_VTABLE_STORES = 0, /* delta vs the dtor chain */
  ISAAC_LOG_SINK_CLOSE_STATE_OFFSET = 0x04u,
  ISAAC_LOG_SINK_CLOSE_PATH_OFFSET = 0x08u,
  ISAAC_LOG_SINK_CLOSE_FILE_OFFSET = 0x0cu, /* the leaf's FILE* cell */
  ISAAC_LOG_SINK_CLOSE_FREE_GATE_VA = 0x00a52724u, /* test edx,edx */
  ISAAC_LOG_SINK_CLOSE_FREE_BRANCH_VA = 0x00a52726u, /* je 0xa52744 */
  ISAAC_LOG_SINK_CLOSE_FREE_CALL_VA = 0x00a52735u, /* call 0xa648b0 */
  ISAAC_LOG_SINK_CLOSE_FREE_MODE = 1,     /* cl=1 (guest free) */
  ISAAC_LOG_SINK_CLOSE_PATH_NULL_VA = 0x00a5273du, /* mov [esi+8],0 */
  ISAAC_LOG_SINK_CLOSE_FREE_HELPER_VA = 0x00a648b0u, /* == SHARED_ALLOCATOR */
  ISAAC_LOG_SINK_CLOSE_SEH_HANDLER = 0x00af0a10u,
  ISAAC_LOG_SINK_CLOSE_STATE_GETTER_VA = 0x00a25440u, /* +0x30 slots */
  ISAAC_LOG_SINK_CLOSE_SINK_SLOT_VA = 0x00ba51b8u,    /* 0xba5184 + 0x34 */
  ISAAC_LOG_SINK_CLOSE_SIBLING_SLOT_VA = 0x00b9e974u, /* 0xb9e940 + 0x34 */
  ISAAC_LOG_SINK_CLOSE_VTABLE_SLOTS = 2,
  ISAAC_LOG_SINK_CLOSE_RAW_OCCURRENCES = 2, /* the two slots only */
  ISAAC_LOG_SINK_CLOSE_DIRECT_CALLSITES = 0,
  ISAAC_LOG_SINK_CLOSE_DISPATCH_UNCONDITIONAL = 1, /* no file/path/state
                                                      gate before the call */
  ISAAC_LOG_SINK_CLOSE_FCLOSE_GATE_VA = 0x00a526d3u, /* leaf: mov eax,[+0xc] */
  ISAAC_LOG_SINK_CLOSE_FCLOSE_TEST_VA = 0x00a526d6u, /* leaf: test eax,eax */
  ISAAC_LOG_SINK_CLOSE_FCLOSE_BRANCH_VA = 0x00a526d8u, /* je skip */
  ISAAC_LOG_SINK_CLOSE_FCLOSE_CALL_VA = 0x00a526dbu, /* call [b1890c] */
  ISAAC_LOG_SINK_CLOSE_FCLOSE_NULL_VA = 0x00a526e4u, /* mov [esi+0xc],0 */
  ISAAC_LOG_TEXT_INSN_COUNT_V21 = 2094319, /* carried (same deterministic
                                               decode, same SHA) */
  ISAAC_LOG_TEXT_UNDECODABLE_BYTES_V21 = 469,
  ISAAC_LOG_V21_BATCHED_VAS = 6, /* 0xa526f0 / 0xa25450 / 0xa25440 /
                                    0xba51b8 / 0xb9e974 / 0xaf0a10 */
  ISAAC_LOG_V21_EXACT_ZHL_MATCHES = 0 /* none; address-stable */,

  /* ---- v22: the state!=2 getter 0x00a25440 (LANDED, ABI 22) ---- */
  ISAAC_LOG_VA_STATE_GETTER = 0x00a25440u,
  ISAAC_LOG_STATE_GETTER_END = 0x00a25448u, /* first int3 after ret */
  ISAAC_LOG_STATE_GETTER_BODY_BYTES = 0x08u, /* END - VA = 8 */
  ISAAC_LOG_STATE_GETTER_INSN_COUNT = 3,
  ISAAC_LOG_STATE_GETTER_FIRST_RET_VA = 0x00a25447u,
  ISAAC_LOG_STATE_GETTER_RET_ARGS = 0,     /* plain `ret` */
  ISAAC_LOG_STATE_GETTER_RETS = 1,
  ISAAC_LOG_STATE_GETTER_E8_CALLS = 0,
  ISAAC_LOG_STATE_GETTER_INDIRECT_CALLS = 0,
  ISAAC_LOG_STATE_GETTER_MEM_STORES = 0,   /* no SEH/GS, no writes */
  ISAAC_LOG_STATE_GETTER_STATE_OFFSET = 0x04u,
  ISAAC_LOG_STATE_GETTER_READ_WIDTH = 4,   /* FULL-dword cmp — the law */
  ISAAC_LOG_STATE_GETTER_COMPARE_VALUE = 2, /* == LOG_SINK_STATE_NO_FILE */
  ISAAC_LOG_STATE_GETTER_VTABLE_SLOTS = 3, /* 0xb83408/0xba51b4/0xb9e970 */
  ISAAC_LOG_STATE_GETTER_EXTRA_SLOT_VA = 0x00b65754u, /* 0xb65724 + 0x30 */
  ISAAC_LOG_STATE_GETTER_RAW_OCCURRENCES = 7, /* .rdata 4 + .text 3 */
  ISAAC_LOG_STATE_GETTER_DIRECT_CALLSITES = 0,
  ISAAC_LOG_STATE_GETTER_INLINED_COPIES = 3, /* devirt-cmp sites */
  ISAAC_LOG_STATE_GETTER_DEVIRT_CMP_1 = 0x0092be28u,
  ISAAC_LOG_STATE_GETTER_DEVIRT_CMP_2 = 0x0092c008u,
  ISAAC_LOG_STATE_GETTER_DEVIRT_CMP_3 = 0x0092c1e8u,
  ISAAC_LOG_STATE_GETTER_SLOT_DTOR_BASE_VA = 0x00b83408u, /* 0xb833d8+0x30 */
  ISAAC_LOG_STATE_GETTER_SLOT_SINK_VA = 0x00ba51b4u,      /* 0xba5184+0x30 */
  ISAAC_LOG_STATE_GETTER_SLOT_SIBLING_VA = 0x00b9e970u,   /* 0xb9e940+0x30 */
  ISAAC_LOG_TEXT_INSN_COUNT_V22 = 2094319, /* carried (same deterministic
                                               decode, same SHA) */
  ISAAC_LOG_TEXT_UNDECODABLE_BYTES_V22 = 469,

  /* ---- v23: engine-binding census final + sink/sibling cluster closure
          (NO laws; ABI stays 22 — pins only) ---- */
  /* 0x43eec0 path getter (vtbl+0x38): `mov eax,[ecx+8]; ret` — typed-host
     LEASE row (engine-family owner: NONE as of v23; nearest neighbour
     lua_engine records sibling rows of the 0x86b7 register megablock
     only. SUPERSEDED by v24: the megablock IS LuaEngine::RegisterClasses
     0x866960..0x86e4c9 — lua owns the pattern, lease transfer PROPOSED,
     the log family keeps the host pins of this block). */
  ISAAC_LOG_VA_PATH_GETTER = 0x0043eec0u,
  ISAAC_LOG_PATH_GETTER_END = 0x0043eec4u, /* first int3 after ret */
  ISAAC_LOG_PATH_GETTER_BODY_BYTES = 0x04u, /* END - VA = 4 */
  ISAAC_LOG_PATH_GETTER_INSN_COUNT = 2,
  ISAAC_LOG_PATH_GETTER_FIRST_RET_VA = 0x0043eec3u,
  ISAAC_LOG_PATH_GETTER_RET_ARGS = 0,      /* plain `ret` */
  ISAAC_LOG_PATH_GETTER_RETS = 1,
  ISAAC_LOG_PATH_GETTER_E8_CALLS = 0,
  ISAAC_LOG_PATH_GETTER_INDIRECT_CALLS = 0,
  ISAAC_LOG_PATH_GETTER_MEM_STORES = 0,    /* no SEH/GS, no writes */
  ISAAC_LOG_PATH_GETTER_PATH_OFFSET = 0x08u, /* the +8 cell (FULL dword) */
  ISAAC_LOG_PATH_GETTER_DIRECT_CALLSITES = 22, /* engine callsites */
  ISAAC_LOG_PATH_GETTER_REGISTRATION_PUSHES = 2,
  ISAAC_LOG_PATH_GETTER_REG_PUSH_VA_1 = 0x0086b72bu, /* push 0x43eec0 */
  ISAAC_LOG_PATH_GETTER_REG_PUSH_VA_2 = 0x0086c361u, /* push 0x43eec0 */
  ISAAC_LOG_PATH_GETTER_RAW_OCCURRENCES = 6, /* .rdata 4 + .text 2 */
  ISAAC_LOG_PATH_GETTER_VTABLE_SLOTS = 4,  /* +0x38 x4 carriers */
  ISAAC_LOG_PATH_GETTER_SLOT_DTOR_BASE_VA = 0x00b83410u, /* 0xb833d8+0x38 */
  ISAAC_LOG_PATH_GETTER_SLOT_SINK_VA = 0x00ba51bcu,      /* 0xba5184+0x38 */
  ISAAC_LOG_PATH_GETTER_SLOT_SIBLING_VA = 0x00b9e978u,   /* 0xb9e940+0x38 */
  ISAAC_LOG_PATH_GETTER_SLOT_EXTRA_VA = 0x00b6575cu,     /* 0xb65724+0x38 */
  /* sink/sibling vtable maps (0xba5184 / 0xb9e940 — the VAs are the
     standing ISAAC_LOG_SINK_VTABLE_VA / ISAAC_LOG_SIBLING_VTABLE_VA,
     15 slots each): identical except +0x00 / +0x1c / +0x20 — 12 shared
     slots, every reachable body classified (PURE laws or HOST evidence;
     v23 closure). */
  ISAAC_LOG_SINK_DTOR_WRAPPER_VA = 0x00a83fa0u,   /* +0x00 (v15) */
  ISAAC_LOG_SIBLING_DTOR_WRAPPER_VA = 0x00a523e0u, /* +0x00 (v16) */
  ISAAC_LOG_SINK_WRITE_VA = 0x00a83fd0u,          /* +0x1c (v6) */
  ISAAC_LOG_SIBLING_WRITE_VA = 0x00a52850u,       /* +0x1c (v7) */
  ISAAC_LOG_SINK_FLUSH_VA = 0x0040c200u,          /* +0x20 (nop, v6) */
  ISAAC_LOG_SIBLING_FLUSH_VA = 0x00a52880u,       /* +0x20 (v13) */
  ISAAC_LOG_SINK_SIBLING_SHARED_SLOTS = 12,       /* 15 - 3 differing */
  ISAAC_LOG_TEXT_INSN_COUNT_V23 = 2094319, /* carried (same deterministic
                                               decode, same SHA) */
  ISAAC_LOG_TEXT_UNDECODABLE_BYTES_V23 = 469,

  /* ---- v24: engine-family owner IDENTIFIED + lease transfer PROPOSED
          (NO laws; ABI stays 22 — pins only) ----
     The 0x86b7/0x86c3 register megablocks are LuaEngine::RegisterClasses
     0x00866960..0x0086e4c9 (0x7b6a bytes; the lua family's own v15
     structural-model body). The lua property-family census spans the
     body (CALLSITE 0x866c86..0x86da12, 173 rows); the gap-bin rows use
     single-fn binder bodies (0x88aa40/0x88aaa0/0x88ab00/0x88ab60/
     0x88abc0; 0x88fcf0/0x88fd10/0x88fdb0/0x8901xx) inside the lua band
     0x875230..0x8952b0 — un-recorded but lua-owned. The two 0x43eec0
     rows therefore transfer to the lua family; the log family keeps the
     host pins (this block + v23 block). */
  ISAAC_LOG_PATH_GETTER_ROW1_CALL_VA = 0x0086b737u, /* call 0x88ab60 */
  ISAAC_LOG_PATH_GETTER_ROW1_BINDER_VA = 0x0088ab60u, /* single-fn binder */
  ISAAC_LOG_PATH_GETTER_ROW1_NAME_VA = 0x00b730ecu,  /* "GetVariant" */
  ISAAC_LOG_PATH_GETTER_ROW2_CALL_VA = 0x0086c36du,  /* call 0x88fd10 */
  ISAAC_LOG_PATH_GETTER_ROW2_BINDER_VA = 0x0088fd10u, /* single-fn binder */
  ISAAC_LOG_PATH_GETTER_ROW2_NAME_VA = 0x00b7306cu,  /* "GetType" */
  ISAAC_LOG_ENGINE_REGISTER_CLASSES_VA = 0x00866960u, /* lua owner body */
  ISAAC_LOG_ENGINE_REGISTER_CLASSES_END_VA = 0x0086e4c9u, /* ret */
  ISAAC_LOG_ENGINE_REGISTER_CLASSES_BODY_BYTES = 0x7b6au,
  ISAAC_LOG_MEGABLOCK_A_GAP_ROWS = 6,   /* 0x86b704..0x86b76f bin */
  ISAAC_LOG_MEGABLOCK_A_GAP_FIRST_CALL_VA = 0x0086b704u,
  ISAAC_LOG_MEGABLOCK_A_GAP_LAST_CALL_VA = 0x0086b759u,

  /* ---- v25: base-class table closure (0xb83418 / 0xb833d8 members;
          FOUR laws land — ABI 22 -> 23) ----
     The two BASE tables of the sink object graph were dumped in v22 but
     never closed: 0xb83418 (12 live slots +0x00..+0x2c, NULL at +0x2c)
     and 0xb833d8 (15-slot dtor-phase table). THIS unit decodes every
     member body (census-base-tables.py, fresh whole-.text linear decode
     w/ resync: 2,094,319 insns / 469 undecodable bytes — the family's
     corrected figures reproduced under the same SHA) and LANDS the four
     complete small helpers (below). The other members are EVIDENCE or
     typed-host (0xa25350 dtor wrapper, 0xa24ec0 timed-window body,
     0xa24fd0 ready-gated open, 0xa25130 SEH vcall wrapper, 0xa25560 SEH
     stats writer, 0xa25200 SEH combine wrapper) or PLATFORM (0xa25090
     sibling factory — exit-owned HOST, Rule 12; 0xa25510 _access leaf;
     0xa25530 GetFileAttributesW leaf; 0x67efc0 generic cell+0x18 leaf —
     LUA-REGISTERED inside the megablock gap bin: push 0x67efc0 @
     0x86b763, mov imm @ 0x88ac83 — confirming the v24 lease transfer).
     CORRECTION to the v22 record: the 0xb65724 table's +0x28 slot holds
     0xa25410, the base-class open-1 twin — NOT "the v11 dtor inner"
     (that is 0xa52410, log-v18). */

  /* LANDED — 0xa649b0 (base table +0x04):
     `or dword ptr [ecx+4],1 ; mov al,1 ; ret` — bit 0 into the +4
     state/flags cell, then return 1. The read AND the write are
     FULL-dword (`83 49 04 01`). The behavior is width-independent (a
     byte-or writes the same cell), so READ_WIDTH=4 is an ENCODING law:
     the exact opcode is pinned, and a byte-or mutant is caught by the
     PE-evidence block. Five vtable carriers (slots 0xb81ae0 / 0xb8341c
     / 0xb9ebe8 / 0xb9fdd0 = 0xb9fdcc+0x04 / 0xba918c). The AND twin
     `and dword ptr [ecx+4],0xfffffffe ; ret` lives at 0xa649c0
    (0xb9fdcc +0x08) — sibling RECORDED at ABI 23 and LANDED by the
    v27 unit (below; ABI 24 -> 25). */
  ISAAC_LOG_VA_BASE_FLAGS_SET1 = 0x00a649b0u,
  ISAAC_LOG_BASE_FLAGS_SET1_END = 0x00a649b7u, /* first int3 after ret */
  ISAAC_LOG_BASE_FLAGS_SET1_BODY_BYTES = 0x07u,
  ISAAC_LOG_BASE_FLAGS_SET1_INSN_COUNT = 3,
  ISAAC_LOG_BASE_FLAGS_SET1_FIRST_RET_VA = 0x00a649b6u,
  ISAAC_LOG_BASE_FLAGS_SET1_RET_ARGS = 0,   /* plain ret */
  ISAAC_LOG_BASE_FLAGS_SET1_RETS = 1,
  ISAAC_LOG_BASE_FLAGS_SET1_E8_CALLS = 0,
  ISAAC_LOG_BASE_FLAGS_SET1_INDIRECT_CALLS = 0,
  ISAAC_LOG_BASE_FLAGS_SET1_MEM_STORES = 1, /* the or */
  ISAAC_LOG_BASE_FLAGS_SET1_STATE_OFFSET = 0x04u, /* the +4 cell */
  ISAAC_LOG_BASE_FLAGS_SET1_READ_WIDTH = 4, /* ENCODING law: 83 49 04 01 */
  ISAAC_LOG_BASE_FLAGS_SET1_VTABLE_SLOTS = 5,
  ISAAC_LOG_BASE_FLAGS_SET1_SLOT_1_VA = 0x00b81ae0u,
  ISAAC_LOG_BASE_FLAGS_SET1_SLOT_2_VA = 0x00b8341cu,
  ISAAC_LOG_BASE_FLAGS_SET1_SLOT_3_VA = 0x00b9ebe8u,
  ISAAC_LOG_BASE_FLAGS_SET1_SLOT_4_VA = 0x00b9fdd0u,
  ISAAC_LOG_BASE_FLAGS_SET1_SLOT_5_VA = 0x00ba918cu,
  ISAAC_LOG_BASE_FLAGS_SET1_RAW_OCCURRENCES = 5,
  ISAAC_LOG_BASE_FLAGS_SET1_DIRECT_CALLSITES = 0,
  ISAAC_LOG_BASE_FLAGS_SET1_SIBLING_CLEAR_VA = 0x00a649c0u, /* and ~1 */

  /* LANDED — 0xa24ea0 (base table +0x08):
     flush the LISTENER global (0xc79bd8; vtbl+0x20 vcall — HOST, the
     same sink-flush surface the v2 teardown laws dispatch), then
     `and dword ptr [esi+4],0xfffffffe` UNCONDITIONALLY (the clear runs
     on the null-skip arm too; `83 66 04 fe` — ENCODING law again: the
     and-mask is one dword, READ_WIDTH=4). Order: the vcall (0xa24eaf)
     precedes the clear (0xa24eb2). */
  ISAAC_LOG_VA_BASE_FLUSH_CLEAR = 0x00a24ea0u,
  ISAAC_LOG_BASE_FLUSH_CLEAR_END = 0x00a24eb8u, /* first int3 */
  ISAAC_LOG_BASE_FLUSH_CLEAR_BODY_BYTES = 0x18u,
  ISAAC_LOG_BASE_FLUSH_CLEAR_INSN_COUNT = 8,
  ISAAC_LOG_BASE_FLUSH_CLEAR_FIRST_RET_VA = 0x00a24eb7u,
  ISAAC_LOG_BASE_FLUSH_CLEAR_RET_ARGS = 0,
  ISAAC_LOG_BASE_FLUSH_CLEAR_RETS = 1,
  ISAAC_LOG_BASE_FLUSH_CLEAR_E8_CALLS = 0,
  ISAAC_LOG_BASE_FLUSH_CLEAR_INDIRECT_CALLS = 1, /* call [eax+0x20] */
  ISAAC_LOG_BASE_FLUSH_CLEAR_MEM_STORES = 1,     /* the and */
  ISAAC_LOG_BASE_FLUSH_CLEAR_LISTENER_GLOBAL_VA = 0x00c79bd8u,
  ISAAC_LOG_BASE_FLUSH_CLEAR_FLUSH_SLOT = 0x20u,
  ISAAC_LOG_BASE_FLUSH_CLEAR_CLEAR_MASK = 0xfffffffeu,
  ISAAC_LOG_BASE_FLUSH_CLEAR_READ_WIDTH = 4, /* ENCODING: 83 66 04 fe */
  ISAAC_LOG_BASE_FLUSH_CLEAR_FLUSH_CALL_VA = 0x00a24eafu,
  ISAAC_LOG_BASE_FLUSH_CLEAR_CLEAR_VA = 0x00a24eb2u, /* after the vcall */
  ISAAC_LOG_BASE_FLUSH_CLEAR_RAW_OCCURRENCES = 1, /* 0xb83420 */
  ISAAC_LOG_BASE_FLUSH_CLEAR_DIRECT_CALLSITES = 0,

  /* LANDED — 0xa253e0 / 0xa25410 (0xb833d8 +0x24 / +0x28): the
     BASE-CLASS OPEN TWINS. Each: state := N (ONE FULL-dword store,
     BEFORE the call), then `path := OPEN_COMBINE(path, base=NULL,
     lowercase=0, trailing=0)` — edx=0 + two pushed zeros = the v19
     body's COPY_PATH arm (marshalling law) — then al := 1, ret.
     The twins differ ONLY in the STATE VALUE (0 / 1) and the ret width
     (4 = one stack arg / 8 = two stack args; 0xa25410's [ebp+0xc] arg2
     is DEAD). state 0 == ISAAC_LOG_SINK_STATE_OPEN_READ (the v8
     encoding), state 1 == ISAAC_LOG_SINK_STATE_OPEN — the base class
     mirrors the sink's state encodings (cross-law pins). */
  ISAAC_LOG_VA_BASE_OPEN0 = 0x00a253e0u,
  ISAAC_LOG_BASE_OPEN0_END = 0x00a25408u, /* first int3 after ret 4 */
  ISAAC_LOG_BASE_OPEN0_BODY_BYTES = 0x28u,
  ISAAC_LOG_BASE_OPEN0_INSN_COUNT = 16,
  ISAAC_LOG_BASE_OPEN0_FIRST_RET_VA = 0x00a25405u,
  ISAAC_LOG_BASE_OPEN0_RET_ARGS = 4,   /* one stack dword (the path) */
  ISAAC_LOG_BASE_OPEN0_RETS = 1,
  ISAAC_LOG_BASE_OPEN0_E8_CALLS = 1,   /* the combine call */
  ISAAC_LOG_BASE_OPEN0_INDIRECT_CALLS = 0,
  ISAAC_LOG_BASE_OPEN0_MEM_STORES = 2, /* state + path */
  ISAAC_LOG_BASE_OPEN0_STATE_VALUE = 0, /* == SINK_STATE_OPEN_READ */
  ISAAC_LOG_BASE_OPEN0_STATE_OFFSET = 0x04u,
  ISAAC_LOG_BASE_OPEN0_PATH_OFFSET = 0x08u,
  ISAAC_LOG_BASE_OPEN0_STATE_STORE_VA = 0x00a253efu,
  ISAAC_LOG_BASE_OPEN0_COMBINE_CALL_VA = 0x00a253f6u,
  ISAAC_LOG_BASE_OPEN0_CLEANUP_VA = 0x00a253fbu, /* add esp, 8 */
  ISAAC_LOG_BASE_OPEN0_RAW_OCCURRENCES = 1, /* 0xb833fc */
  ISAAC_LOG_BASE_OPEN0_DIRECT_CALLSITES = 0,
  ISAAC_LOG_VA_BASE_OPEN1 = 0x00a25410u,
  ISAAC_LOG_BASE_OPEN1_END = 0x00a2543au, /* first int3 after ret 8 */
  ISAAC_LOG_BASE_OPEN1_BODY_BYTES = 0x2au,
  ISAAC_LOG_BASE_OPEN1_INSN_COUNT = 19,
  ISAAC_LOG_BASE_OPEN1_FIRST_RET_VA = 0x00a25437u,
  ISAAC_LOG_BASE_OPEN1_RET_ARGS = 8,   /* two stack dwords */
  ISAAC_LOG_BASE_OPEN1_RETS = 1,
  ISAAC_LOG_BASE_OPEN1_E8_CALLS = 1,
  ISAAC_LOG_BASE_OPEN1_INDIRECT_CALLS = 0,
  ISAAC_LOG_BASE_OPEN1_MEM_STORES = 2,
  ISAAC_LOG_BASE_OPEN1_STATE_VALUE = 1, /* == SINK_STATE_OPEN */
  ISAAC_LOG_BASE_OPEN1_STATE_OFFSET = 0x04u,
  ISAAC_LOG_BASE_OPEN1_PATH_OFFSET = 0x08u,
  ISAAC_LOG_BASE_OPEN1_STATE_STORE_VA = 0x00a25420u,
  ISAAC_LOG_BASE_OPEN1_COMBINE_CALL_VA = 0x00a25427u,
  ISAAC_LOG_BASE_OPEN1_CLEANUP_VA = 0x00a2542cu,
  ISAAC_LOG_BASE_OPEN1_ARG2_DEAD = 1,  /* ret 8, only [ebp+8] read */
  ISAAC_LOG_BASE_OPEN1_RAW_OCCURRENCES = 2, /* 0xb6574c + 0xb83400 */
  ISAAC_LOG_BASE_OPEN1_DIRECT_CALLSITES = 0,
  /* shared marshalling: base NULL (edx=0), both combine flags 0 */
  ISAAC_LOG_BASE_OPEN_COMBINE_BASE_NULL = 1,
  ISAAC_LOG_BASE_OPEN_COMBINE_FLAGS_ZERO = 1,
  ISAAC_LOG_BASE_OPEN_COMBINE_MODE = 0, /* == COMBINE_MODE_COPY_PATH */

  /* ---- v25 closure census (evidence, same unit) ---- */
  ISAAC_LOG_BASE_DTOR_TABLE_VA = 0x00b833d8u, /* 15 slots, re-verified */
  ISAAC_LOG_BASE_TABLE_VA = 0x00b83418u,      /* 12 live slots +0x00..+0x2c */
  ISAAC_LOG_BASE_TABLE_SLOTS = 12,
  ISAAC_LOG_BASE_TABLE_NULL_SLOT = 0x00000000u, /* +0x2c */
  ISAAC_LOG_VA_BASE_DTOR_WRAPPER = 0x00a25350u, /* 0xb833d8 +0x00 */
  ISAAC_LOG_BASE_DTOR_WRAPPER_END = 0x00a253d0u, /* first int3 */
  ISAAC_LOG_BASE_DTOR_WRAPPER_BODY_BYTES = 0x80u,
  ISAAC_LOG_BASE_DTOR_WRAPPER_SEH = 0x00af12a0u,
  ISAAC_LOG_BASE_DTOR_WRAPPER_FINAL_VTABLE = 0x00b9c15cu,
  ISAAC_LOG_BASE_DTOR_WRAPPER_OBJECT_SIZE = 0x0cu, /* sized delete */
  ISAAC_LOG_VA_BASE_TIMED_WINDOW = 0x00a24ec0u,  /* 0xb83418 +0x0c */
  ISAAC_LOG_VA_BASE_OPEN_GATED = 0x00a24fd0u,    /* 0xb83418 +0x14 */
  ISAAC_LOG_VA_BASE_FACTORY = 0x00a25090u,       /* 0xb83418 +0x18, exit HOST */
  ISAAC_LOG_VA_BASE_SEH_WRAPPER = 0x00a25130u,   /* 0xb83418 +0x1c */
  ISAAC_LOG_VA_BASE_ACCESS_LEAF = 0x00a25510u,   /* 0xb83418 +0x20 */
  ISAAC_LOG_BASE_ACCESS_LEAF_END = 0x00a25529u,
  ISAAC_LOG_BASE_ACCESS_LEAF_DIRECT_CALLSITES = 1, /* 0x91a3d0 (v21: 0 — CORRECTED) */
  ISAAC_LOG_BASE_ACCESS_LEAF_CALLSITE_VA = 0x0091a3d0u,
  ISAAC_LOG_VA_BASE_GFA_LEAF = 0x00a25530u,      /* 0xb83418 +0x24 */
  ISAAC_LOG_BASE_GFA_LEAF_END = 0x00a2555cu,
  ISAAC_LOG_VA_BASE_STATS_WRITER = 0x00a25560u,  /* 0xb83418 +0x28 */
  ISAAC_LOG_VA_BASE_GETTER_18 = 0x0067efc0u,     /* 0xb83418 +0x10 */
  ISAAC_LOG_BASE_GETTER_18_END = 0x0067efc4u,
  ISAAC_LOG_BASE_GETTER_18_REG_PUSH_VA = 0x0086b763u, /* lua megablock */
  ISAAC_LOG_VA_BASE_COMBINE_WRAPPER = 0x00a25200u, /* callee of 0xa25090 */
  ISAAC_LOG_TEXT_INSN_COUNT_V25 = 2094319, /* carried (same deterministic
                                              decode, same SHA) */
  ISAAC_LOG_TEXT_UNDECODABLE_BYTES_V25 = 469,
  ISAAC_LOG_V25_BATCHED_VAS = 16, /* the closure census set */
  ISAAC_LOG_V25_EXACT_ZHL_MATCHES = 0 /* none; address-stable */
};

/* call [eax+0x2c] at 0xa52717 — the dispatch is UNCONDITIONAL: it is
   the FIRST action, no file/path/state read gates it (1). */
int32_t isaac_log_sink_close_dispatch_fires(void);
uint32_t isaac_log_sink_close_dispatch_va(void);
uint32_t isaac_log_sink_close_dispatch_slot(void);
uint32_t isaac_log_sink_close_fclose_leaf_va(void);

/* The FILE* presence gate (the dispatched leaf's semantics, referenced):
   FULL-dword test on cell +0xc — 0x100 / 0x1ff / 0xffffffff close;
   0 skips (low-byte reading would misfire on 0x100). */
int32_t isaac_log_sink_close_file_gate(uint32_t file_ptr);
/* Leaf conditional null: cell := 0 ONLY when fclose fired. */
uint32_t isaac_log_sink_close_file_after(uint32_t file_before,
                                         uint32_t fclose_fired);

/* mov [esi+4], 2 — the state-transition gate: ONE unconditional full-
   dword store BEFORE the free gate; both arms end with state 2.
   state_before is a parameter so a skip-arm keep mutant is visible. */
uint32_t isaac_log_sink_close_state_after(uint32_t state_before);
uint32_t isaac_log_sink_close_state_value(void);
uint32_t isaac_log_sink_close_state_store_count(void);
uint32_t isaac_log_sink_close_state_store_va(void);
uint32_t isaac_log_sink_close_state_getter_va(void);

/* test edx,edx ; je — the free-path condition on the FULL 32-bit path
   cell (+8). Same width semantics as the v11 dtor's guest-free gate. */
int32_t isaac_log_sink_close_free_gate(uint32_t path_ptr);
uint32_t isaac_log_sink_close_free_branch_va(void);
uint32_t isaac_log_sink_close_free_call_va(void);
uint32_t isaac_log_sink_close_free_mode(void);       /* cl=1 */
uint32_t isaac_log_sink_close_free_helper_va(void);  /* 0xa648b0 */
uint32_t isaac_log_sink_close_path_null_va(void);
/* mov [esi+8], 0 — path cell NULLed ONLY on the free arm, AFTER the
   call; the skip arm leaves the cell untouched. */
uint32_t isaac_log_sink_close_path_after(uint32_t path_before,
                                         uint32_t free_fired);
uint32_t isaac_log_sink_close_file_offset(void);
uint32_t isaac_log_sink_close_path_offset(void);
uint32_t isaac_log_sink_close_state_offset(void);

/* NO vtable store in this body (the v11 dtor's 3-store chain is the
   contrast). */
uint32_t isaac_log_sink_close_vtable_store_count(void);

/* Identities + census. */
uint32_t isaac_log_sink_close_body_va(void);
uint32_t isaac_log_sink_close_end_va(void);
uint32_t isaac_log_sink_close_body_bytes(void);
uint32_t isaac_log_sink_close_insn_count(void);
uint32_t isaac_log_sink_close_first_ret_va(void);
uint32_t isaac_log_sink_close_ret_args(void);
uint32_t isaac_log_sink_close_rets(void);
uint32_t isaac_log_sink_close_e8_calls(void);
uint32_t isaac_log_sink_close_indirect_calls(void);
uint32_t isaac_log_sink_close_mem_stores(void);
uint32_t isaac_log_sink_close_seh_handler(void);
uint32_t isaac_log_sink_close_sink_slot_va(void);
uint32_t isaac_log_sink_close_sibling_slot_va(void);
uint32_t isaac_log_sink_close_vtable_slots(void);
uint32_t isaac_log_sink_close_raw_occurrences(void);
uint32_t isaac_log_sink_close_direct_callsites(void);
int32_t isaac_log_sink_close_dispatch_unconditional(void);
uint32_t isaac_log_sink_close_fclose_gate_va(void);
uint32_t isaac_log_sink_close_fclose_test_va(void);
uint32_t isaac_log_sink_close_fclose_branch_va(void);
uint32_t isaac_log_sink_close_fclose_call_va(void);
uint32_t isaac_log_sink_close_fclose_null_va(void);

/* ============ v22: the state!=2 getter 0x00a25440 (vtbl+0x30) ============ */

/* cmp dword ptr [ecx+4], 2 ; setne al ; ret — the pure boolean
   (state != 2). The parameter is the FULL 32-bit state cell; a mutant
   narrowing the read to a byte misfires on 0x102/0x302/0xff02 (the
   wasm ABI never narrows i32 arguments). */
int32_t isaac_log_state_getter_neq(uint32_t state);
uint32_t isaac_log_state_getter_body_va(void);
uint32_t isaac_log_state_getter_end_va(void);
uint32_t isaac_log_state_getter_body_bytes(void);
uint32_t isaac_log_state_getter_insn_count(void);
uint32_t isaac_log_state_getter_first_ret_va(void);
uint32_t isaac_log_state_getter_ret_args(void);
uint32_t isaac_log_state_getter_rets(void);
uint32_t isaac_log_state_getter_e8_calls(void);
uint32_t isaac_log_state_getter_indirect_calls(void);
uint32_t isaac_log_state_getter_mem_stores(void);
uint32_t isaac_log_state_getter_state_offset(void);
uint32_t isaac_log_state_getter_read_width(void);
uint32_t isaac_log_state_getter_compare_value(void);
uint32_t isaac_log_state_getter_vtable_slots(void);
uint32_t isaac_log_state_getter_extra_slot_va(void);
uint32_t isaac_log_state_getter_raw_occurrences(void);
uint32_t isaac_log_state_getter_direct_callsites(void);
uint32_t isaac_log_state_getter_inlined_copies(void);
uint32_t isaac_log_state_getter_devirt_cmp_1(void);
uint32_t isaac_log_state_getter_devirt_cmp_2(void);
uint32_t isaac_log_state_getter_devirt_cmp_3(void);
uint32_t isaac_log_state_getter_slot_dtor_base_va(void);
uint32_t isaac_log_state_getter_slot_sink_va(void);
uint32_t isaac_log_state_getter_slot_sibling_va(void);

/* ============ v25: base-class tables 0xb83418 / 0xb833d8 ============ */

/* L1 — 0xa649b0 (base table +0x04): `or dword ptr [ecx+4],1 ; mov al,1 ;
   ret`. The law is the STORED cell: flags | 1 (FULL-dword; READ_WIDTH=4
   is an ENCODING law — `83 49 04 01` — because a byte-or writes the same
   low byte and the width is behaviorally invisible). */
uint32_t isaac_log_base_flags_after_set1(uint32_t flags);
int32_t isaac_log_base_flags_set1_returns_one(void);
uint32_t isaac_log_base_flags_set1_body_va(void);
uint32_t isaac_log_base_flags_set1_end_va(void);
uint32_t isaac_log_base_flags_set1_body_bytes(void);
uint32_t isaac_log_base_flags_set1_insn_count(void);
uint32_t isaac_log_base_flags_set1_first_ret_va(void);
uint32_t isaac_log_base_flags_set1_ret_args(void);
uint32_t isaac_log_base_flags_set1_rets(void);
uint32_t isaac_log_base_flags_set1_e8_calls(void);
uint32_t isaac_log_base_flags_set1_indirect_calls(void);
uint32_t isaac_log_base_flags_set1_mem_stores(void);
uint32_t isaac_log_base_flags_set1_state_offset(void);
uint32_t isaac_log_base_flags_set1_read_width(void);
uint32_t isaac_log_base_flags_set1_vtable_slots(void);
uint32_t isaac_log_base_flags_set1_slot_1_va(void);
uint32_t isaac_log_base_flags_set1_slot_2_va(void);
uint32_t isaac_log_base_flags_set1_slot_3_va(void);
uint32_t isaac_log_base_flags_set1_slot_4_va(void);
uint32_t isaac_log_base_flags_set1_slot_5_va(void);
uint32_t isaac_log_base_flags_set1_raw_occurrences(void);
uint32_t isaac_log_base_flags_set1_direct_callsites(void);
uint32_t isaac_log_base_flags_set1_sibling_clear_va(void);

/* ============ v27: the base-class flags-CLEAR twin 0xa649c0 ============

   Target (open since ABI 23: v25 recorded the sibling row as "not
   landed"). identify-zhl-address: no exact ZHL match (batched with the
   band, exactMatches [] — address-stable).

     0x00a649c0  __thiscall(ecx), plain `ret` (0 stack args).
                 .text raw offset 0x663dc0. Body 0x00a649c0..0x00a649c5
                 (cpu-dump/00a649b7.txt, this unit):
                   0x00a649c0: 83 61 04 fe   and dword ptr [ecx+4],
                                              0xfffffffe
                   0x00a649c4: c3            ret
                 2 insns / 5 bytes / first ret 0x00a649c4 / rets 1 /
                 e8 0 / indirect 0 / mem stores 1 (the and). Then int3
                 to 0x00a649d0 (the v25-era neighbor body). The int3 pad
                 between set1 END (0xa649b7) and this body is 9 bytes.

   LANDED law: the stored cell is flags & ~1 — bit 0 of the +4
   state/flags cell cleared, ALL OTHER BITS PRESERVED, NO return value,
   NO gate (the and runs unconditionally). FULL-dword encoding
   (`83 61 04 fe`, Grp1 Ev,Ib, no 0x66 prefix) — READ_WIDTH=4 is an
   ENCODING law exactly like its set1 twin: a byte-and writes the same
   low byte, so the width is behaviorally invisible and only the pinned
   opcode + read-width getter catch a byte mutant. This is the
   width-CONTRAST to the mutexbase clear 0xa68480 (byte `and ...0xfe`,
   READ_WIDTH=1): same observable cell law, different machine encoding.

   Census (this unit, whole-image raw dword scan + whole-.text e8 rel32
   scan): 0x00a649c0 occurs 6 times, ALL in .rdata, ZERO in .text:
     0xb9e924  0xb9ebec (= 0xb9ebe8+4, set/clear pair)
     0xb9fa8c  0xb9fdd4 (= 0xb9fdd0+4, set/clear pair; 0xb9fdcc +0x08)
     0xba315c  0xba9190 (= 0xba918c+4, set/clear pair)
   Every slot sits in a function-pointer table followed by the nop-flush
   0x0040c200 — vtable rows, pure virtual dispatch, ZERO direct callers
   (e8 scan empty for BOTH twins). Three tables carry the set1/clear1
   pair adjacently; three carry clear1 alone. */
enum {
  ISAAC_LOG_VA_BASE_FLAGS_CLEAR1 = 0x00a649c0u,
  ISAAC_LOG_BASE_FLAGS_CLEAR1_END = 0x00a649c5u, /* first int3 after ret */
  ISAAC_LOG_BASE_FLAGS_CLEAR1_BODY_BYTES = 0x05u,
  ISAAC_LOG_BASE_FLAGS_CLEAR1_INSN_COUNT = 2,
  ISAAC_LOG_BASE_FLAGS_CLEAR1_FIRST_RET_VA = 0x00a649c4u,
  ISAAC_LOG_BASE_FLAGS_CLEAR1_RET_ARGS = 0, /* plain ret */
  ISAAC_LOG_BASE_FLAGS_CLEAR1_RETS = 1,
  ISAAC_LOG_BASE_FLAGS_CLEAR1_E8_CALLS = 0,
  ISAAC_LOG_BASE_FLAGS_CLEAR1_INDIRECT_CALLS = 0,
  ISAAC_LOG_BASE_FLAGS_CLEAR1_MEM_STORES = 1, /* the and */
  ISAAC_LOG_BASE_FLAGS_CLEAR1_STATE_OFFSET = 0x04u, /* the +4 cell */
  ISAAC_LOG_BASE_FLAGS_CLEAR1_CLEAR_MASK = 0xfffffffeu,
  ISAAC_LOG_BASE_FLAGS_CLEAR1_BYTE_MASK = 0xfeu,
  ISAAC_LOG_BASE_FLAGS_CLEAR1_READ_WIDTH = 4, /* ENCODING law: 83 61 04 fe */
  ISAAC_LOG_BASE_FLAGS_CLEAR1_VTABLE_SLOTS = 6,
  ISAAC_LOG_BASE_FLAGS_CLEAR1_SLOT_1_VA = 0x00b9e924u,
  ISAAC_LOG_BASE_FLAGS_CLEAR1_SLOT_2_VA = 0x00b9ebecu,
  ISAAC_LOG_BASE_FLAGS_CLEAR1_SLOT_3_VA = 0x00b9fa8cu,
  ISAAC_LOG_BASE_FLAGS_CLEAR1_SLOT_4_VA = 0x00b9fdd4u,
  ISAAC_LOG_BASE_FLAGS_CLEAR1_SLOT_5_VA = 0x00ba315cu,
  ISAAC_LOG_BASE_FLAGS_CLEAR1_SLOT_6_VA = 0x00ba9190u,
  ISAAC_LOG_BASE_FLAGS_CLEAR1_RAW_OCCURRENCES = 6,
  ISAAC_LOG_BASE_FLAGS_CLEAR1_DIRECT_CALLSITES = 0,
  ISAAC_LOG_BASE_FLAGS_CLEAR1_SIBLING_SET_VA = 0x00a649b0u,
  ISAAC_LOG_BASE_FLAGS_SET1_TO_CLEAR1_PAD_BYTES = 9u
};

/* L7 — 0xa649c0: low bit of the +4 flags cell cleared (&= ~1), all
   other bits preserved, no return value, unconditional.  FULL-dword
   encoding law (READ_WIDTH=4), the width-contrast twin of the
   mutexbase byte-clear 0xa68480. */
uint32_t isaac_log_base_flags_after_clear1(uint32_t flags);
int32_t isaac_log_base_flags_clear1_unconditional(void);
uint32_t isaac_log_base_flags_clear1_body_va(void);
uint32_t isaac_log_base_flags_clear1_end_va(void);
uint32_t isaac_log_base_flags_clear1_body_bytes(void);
uint32_t isaac_log_base_flags_clear1_insn_count(void);
uint32_t isaac_log_base_flags_clear1_first_ret_va(void);
uint32_t isaac_log_base_flags_clear1_ret_args(void);
uint32_t isaac_log_base_flags_clear1_rets(void);
uint32_t isaac_log_base_flags_clear1_e8_calls(void);
uint32_t isaac_log_base_flags_clear1_indirect_calls(void);
uint32_t isaac_log_base_flags_clear1_mem_stores(void);
uint32_t isaac_log_base_flags_clear1_state_offset(void);
uint32_t isaac_log_base_flags_clear1_clear_mask(void);
uint32_t isaac_log_base_flags_clear1_byte_mask(void);
uint32_t isaac_log_base_flags_clear1_read_width(void);
uint32_t isaac_log_base_flags_clear1_vtable_slots(void);
uint32_t isaac_log_base_flags_clear1_slot_1_va(void);
uint32_t isaac_log_base_flags_clear1_slot_2_va(void);
uint32_t isaac_log_base_flags_clear1_slot_3_va(void);
uint32_t isaac_log_base_flags_clear1_slot_4_va(void);
uint32_t isaac_log_base_flags_clear1_slot_5_va(void);
uint32_t isaac_log_base_flags_clear1_slot_6_va(void);
uint32_t isaac_log_base_flags_clear1_raw_occurrences(void);
uint32_t isaac_log_base_flags_clear1_direct_callsites(void);
uint32_t isaac_log_base_flags_clear1_sibling_set_va(void);
uint32_t isaac_log_base_flags_set1_to_clear1_pad_bytes(void);

/* L2 — 0xa24ea0 (base table +0x08): flush the LISTENER global (vtbl+0x20
   vcall, HOST — the v2 teardown's sink-flush surface) then clear bit 0
   UNCONDITIONALLY. The full-dword null gate catches 0x100; the clear mask
   is the dword 0xfffffffe (`83 66 04 fe` — ENCODING law, READ_WIDTH=4). */
int32_t isaac_log_base_flush_needed(uint32_t listener_ptr);
uint32_t isaac_log_base_flush_clears_bit0(uint32_t flags);
int32_t isaac_log_base_flush_clear_unconditional(void);
uint32_t isaac_log_base_flush_clear_body_va(void);
uint32_t isaac_log_base_flush_clear_end_va(void);
uint32_t isaac_log_base_flush_clear_body_bytes(void);
uint32_t isaac_log_base_flush_clear_insn_count(void);
uint32_t isaac_log_base_flush_clear_first_ret_va(void);
uint32_t isaac_log_base_flush_clear_ret_args(void);
uint32_t isaac_log_base_flush_clear_rets(void);
uint32_t isaac_log_base_flush_clear_e8_calls(void);
uint32_t isaac_log_base_flush_clear_indirect_calls(void);
uint32_t isaac_log_base_flush_clear_mem_stores(void);
uint32_t isaac_log_base_flush_clear_listener_global_va(void);
uint32_t isaac_log_base_flush_clear_flush_slot(void);
uint32_t isaac_log_base_flush_clear_clear_mask(void);
uint32_t isaac_log_base_flush_clear_read_width(void);
uint32_t isaac_log_base_flush_clear_flush_call_va(void);
uint32_t isaac_log_base_flush_clear_clear_va(void);
uint32_t isaac_log_base_flush_clear_raw_occurrences(void);
uint32_t isaac_log_base_flush_clear_direct_callsites(void);

/* L3/L4 — the base-class OPEN TWINS 0xa253e0 (state := 0) /
   0xa25410 (state := 1). Each stores its state value ONCE (FULL-dword,
   BEFORE the combine call), then marshals `OPEN_COMBINE(path, base=NULL,
   lowercase=0, trailing=0)` — the v19 COPY_PATH arm — and stores the
   result to the +8 path cell, returning 1. 0xa25410's second stack arg
   is DEAD (ret 8, only [ebp+8] read). state_before is a parameter so a
   skip-store mutant is visible. */
uint32_t isaac_log_base_open0_state_after(uint32_t state_before);
uint32_t isaac_log_base_open1_state_after(uint32_t state_before);
int32_t isaac_log_base_open_combine_base_null(void);
int32_t isaac_log_base_open_combine_flags_zero(void);
uint32_t isaac_log_base_open_combine_mode(void);
int32_t isaac_log_base_open_returns_one(void);
uint32_t isaac_log_base_open0_ret_args(void);
uint32_t isaac_log_base_open1_ret_args(void);
int32_t isaac_log_base_open1_arg2_dead(void);
uint32_t isaac_log_base_open0_combine_call_va(void);
uint32_t isaac_log_base_open1_combine_call_va(void);
uint32_t isaac_log_base_open0_cleanup_va(void);
uint32_t isaac_log_base_open1_cleanup_va(void);
uint32_t isaac_log_base_open0_state_store_va(void);
uint32_t isaac_log_base_open1_state_store_va(void);
uint32_t isaac_log_base_open0_body_va(void);
uint32_t isaac_log_base_open0_end_va(void);
uint32_t isaac_log_base_open0_body_bytes(void);
uint32_t isaac_log_base_open0_insn_count(void);
uint32_t isaac_log_base_open0_first_ret_va(void);
uint32_t isaac_log_base_open0_rets(void);
uint32_t isaac_log_base_open0_e8_calls(void);
uint32_t isaac_log_base_open0_indirect_calls(void);
uint32_t isaac_log_base_open0_mem_stores(void);
uint32_t isaac_log_base_open0_state_value(void);
uint32_t isaac_log_base_open0_raw_occurrences(void);
uint32_t isaac_log_base_open0_direct_callsites(void);
uint32_t isaac_log_base_open1_body_va(void);
uint32_t isaac_log_base_open1_end_va(void);
uint32_t isaac_log_base_open1_body_bytes(void);
uint32_t isaac_log_base_open1_insn_count(void);
uint32_t isaac_log_base_open1_first_ret_va(void);
uint32_t isaac_log_base_open1_rets(void);
uint32_t isaac_log_base_open1_e8_calls(void);
uint32_t isaac_log_base_open1_indirect_calls(void);
uint32_t isaac_log_base_open1_mem_stores(void);
uint32_t isaac_log_base_open1_state_value(void);
uint32_t isaac_log_base_open1_raw_occurrences(void);
uint32_t isaac_log_base_open1_direct_callsites(void);

/* v25 closure census (evidence pins). */
uint32_t isaac_log_base_dtor_wrapper_va(void);
uint32_t isaac_log_base_dtor_wrapper_end_va(void);
uint32_t isaac_log_base_dtor_wrapper_body_bytes(void);
uint32_t isaac_log_base_dtor_wrapper_seh(void);
uint32_t isaac_log_base_access_leaf_direct_callsites(void);
uint32_t isaac_log_base_access_leaf_callsite_va(void);
uint32_t isaac_log_base_getter_18_end_va(void);
uint32_t isaac_log_text_insn_count_v25(void);
uint32_t isaac_log_text_undecodable_bytes_v25(void);

/* ============ v26: the KAGE::MutexBase same-template trio
   0x00a68440 / 0x00a68470 / 0x00a68480 (the older handoff's
   VERIFY-open rows; band re-census 0xa68400..0xa69400, 6 bodies
   classified; identify-zhl ONE invocation — exactMatches []
   everywhere) ============

   The trio shares ONE interface vtable: .rdata 0xba04b4 (dtor at
   +0x00), 0xba04b8 (+0x04 set), 0xba04bc (+0x08 clear).  ZERO
   direct rel32 callers image-wide — pure virtual dispatch.

   0x00a68440 deleting dtor (ret 4, HOST free edge):
     test byte [ebp+8],1          ; delete-flags BIT 0 (BYTE gate)
     esi := ecx ; [esi] := 0xba04b4   (vtable store, ALWAYS)
     je skip -> free(esi, 8) via 0xaef15c (HOST platform free)
     eax := esi ; ret 4           ; returns this
     Object size 8.  Pinned HOST (free edge); the flags gate is
     the SAME byte-gate shape the landed laws below encode.

   LANDED — 0x00a68470 (+0x04): `movzx eax, byte [ecx+4] ;
     bts eax,0 ; mov [ecx+4],al ; mov al,1 ; ret` — BYTE-width
     bit-0 SET on the +4 cell (upper 3 bytes of the dword cell
     UNTOUCHED — the ENCODING contrast to the v25 base-class twin
     `or dword [ecx+4],1` at 0xa649b0, which is FULL-dword).  The
     bts-before-store means bit0 of the LOW byte is always 1 in
     the stored byte; returns al = 1 ALWAYS.
   LANDED — 0x00a68480 (+0x08): `and byte
     [ecx+4],0xfe ; ret` — BYTE-width bit-0 CLEAR (mask 0xfe).

   Band context (classified this unit): 0x00a68490 ns clock =
   ISAAC_LOG_VA_LOCK_CLOCK (QPC/QPF via IAT 0xb18238/0xb18234,
   divsd, mulsd [0xbaa8b0], tail 0xaefd70) — re-verified HOST;
   0x00a684f0 / 0x00a68540 dtor variants of the sibling template
   (vtable 0xba04cc, inner calls 0xa68640/0x42c8e0 + free) —
   pinned HOST. */
static constexpr uint32_t ISAAC_LOG_MUTEXBASE_SDTOR_VA = 0x00a68440u;
static constexpr uint32_t ISAAC_LOG_MUTEXBASE_SDTOR_FREE_SIZE = 8u;
static constexpr uint32_t ISAAC_LOG_MUTEXBASE_SDTOR_VTABLE = 0x00ba04b4u;
static constexpr uint32_t ISAAC_LOG_MUTEXBASE_OBJECT_SIZE = 8u;
static constexpr uint32_t ISAAC_LOG_MUTEXBASE_LOCK_CLOCK_RECHECK =
    0x00a68490u; /* == ISAAC_LOG_VA_LOCK_CLOCK (HOST re-verified) */
static constexpr uint32_t ISAAC_LOG_VA_MUTEXBASE_SET1 = 0x00a68470u;
static constexpr uint32_t ISAAC_LOG_MUTEXBASE_SET1_END = 0x00a6847eu;
static constexpr uint32_t ISAAC_LOG_MUTEXBASE_SET1_BODY_BYTES = 0x0eu;
static constexpr uint32_t ISAAC_LOG_MUTEXBASE_SET1_INSN_COUNT = 5u;
static constexpr uint32_t ISAAC_LOG_MUTEXBASE_SET1_FIRST_RET_VA =
    0x00a6847du;
static constexpr uint32_t ISAAC_LOG_MUTEXBASE_SET1_RET_ARGS = 0u;
static constexpr uint32_t ISAAC_LOG_MUTEXBASE_SET1_RETS = 1u;
static constexpr uint32_t ISAAC_LOG_MUTEXBASE_SET1_E8_CALLS = 0u;
static constexpr uint32_t ISAAC_LOG_MUTEXBASE_SET1_INDIRECT_CALLS = 0u;
static constexpr uint32_t ISAAC_LOG_MUTEXBASE_SET1_MEM_STORES = 1u;
static constexpr uint32_t ISAAC_LOG_MUTEXBASE_SET1_CELL_OFFSET = 0x04u;
static constexpr uint32_t ISAAC_LOG_MUTEXBASE_SET1_READ_WIDTH = 1u;
static constexpr uint32_t ISAAC_LOG_MUTEXBASE_SET1_BIT = 0u;
static constexpr uint32_t ISAAC_LOG_MUTEXBASE_SET1_RETURNS_ONE = 1u;
static constexpr uint32_t ISAAC_LOG_MUTEXBASE_SET1_VTABLE_REF_RDATA =
    0x00ba04b8u;
static constexpr uint32_t ISAAC_LOG_MUTEXBASE_SET1_DIRECT_CALLSITES = 0u;
static constexpr uint32_t ISAAC_LOG_VA_MUTEXBASE_CLEAR1 = 0x00a68480u;
static constexpr uint32_t ISAAC_LOG_MUTEXBASE_CLEAR1_END = 0x00a68485u;
static constexpr uint32_t ISAAC_LOG_MUTEXBASE_CLEAR1_BODY_BYTES = 0x05u;
static constexpr uint32_t ISAAC_LOG_MUTEXBASE_CLEAR1_INSN_COUNT = 2u;
static constexpr uint32_t ISAAC_LOG_MUTEXBASE_CLEAR1_FIRST_RET_VA =
    0x00a68484u;
static constexpr uint32_t ISAAC_LOG_MUTEXBASE_CLEAR1_MEM_STORES = 1u;
static constexpr uint32_t ISAAC_LOG_MUTEXBASE_CLEAR1_MASK = 0xfefefefeu;
static constexpr uint32_t ISAAC_LOG_MUTEXBASE_CLEAR1_BYTE_MASK = 0xfeu;
static constexpr uint32_t ISAAC_LOG_MUTEXBASE_CLEAR1_READ_WIDTH = 1u;
static constexpr uint32_t ISAAC_LOG_MUTEXBASE_CLEAR1_CELL_OFFSET = 0x04u;
static constexpr uint32_t ISAAC_LOG_MUTEXBASE_CLEAR1_VTABLE_REF_RDATA =
    0x00ba04bcu;
static constexpr uint32_t ISAAC_LOG_MUTEXBASE_CLEAR1_DIRECT_CALLSITES = 0u;

/* L5 — 0xa68470: low-byte |= (1 << 0), upper dword bytes preserved,
   returns 1.  BYTE-width encoding law (READ_WIDTH=1). */
uint32_t isaac_log_mutexbase_set1_after(uint32_t cell);
int32_t isaac_log_mutexbase_set1_returns_one(void);
uint32_t isaac_log_mutexbase_set1_body_va(void);
uint32_t isaac_log_mutexbase_set1_end_va(void);
uint32_t isaac_log_mutexbase_set1_body_bytes(void);
uint32_t isaac_log_mutexbase_set1_insn_count(void);
uint32_t isaac_log_mutexbase_set1_first_ret_va(void);
uint32_t isaac_log_mutexbase_set1_rets(void);
uint32_t isaac_log_mutexbase_set1_e8_calls(void);
uint32_t isaac_log_mutexbase_set1_mem_stores(void);
uint32_t isaac_log_mutexbase_set1_cell_offset(void);
uint32_t isaac_log_mutexbase_set1_read_width(void);
uint32_t isaac_log_mutexbase_set1_bit(void);
uint32_t isaac_log_mutexbase_set1_vtable_ref_rdata(void);
uint32_t isaac_log_mutexbase_set1_direct_callsites(void);

/* L6 — 0xa68480: low-byte &= 0xfe, upper dword bytes preserved. */
uint32_t isaac_log_mutexbase_clear1_after(uint32_t cell);
int32_t isaac_log_mutexbase_clear1_unconditional(void);
uint32_t isaac_log_mutexbase_clear1_body_va(void);
uint32_t isaac_log_mutexbase_clear1_end_va(void);
uint32_t isaac_log_mutexbase_clear1_body_bytes(void);
uint32_t isaac_log_mutexbase_clear1_insn_count(void);
uint32_t isaac_log_mutexbase_clear1_byte_mask(void);
uint32_t isaac_log_mutexbase_clear1_read_width(void);
uint32_t isaac_log_mutexbase_clear1_cell_offset(void);
uint32_t isaac_log_mutexbase_clear1_vtable_ref_rdata(void);

/* Band census pins. */
uint32_t isaac_log_mutexbase_sdtor_va(void);
uint32_t isaac_log_mutexbase_sdtor_free_size(void);
uint32_t isaac_log_mutexbase_sdtor_vtable(void);
uint32_t isaac_log_mutexbase_object_size(void);
uint32_t isaac_log_mutexbase_lock_clock_recheck(void);

uint32_t isaac_log_pure_helpers_abi_version(void);

#ifdef __cplusplus
}
#endif
