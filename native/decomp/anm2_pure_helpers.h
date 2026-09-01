#pragma once

#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

/* Pure subsets recovered from the ANM2 animation system.

   NEW helper family â€” ABI v1. Nothing here is Update-wired yet; every helper
   is freestanding. This family exists because ANM2 is cross-cutting: it blocks
   Game::Exit (ANM2::Reset is reached from 14 of the 16 remaining untranslated
   sites inside residual 0x009a27d0 and from 0x008d3250+0x64), Room H5 (the
   create path calls the 0x0040bcd0 / 0x0040a5d0 name walks and ANM2::GetLayer)
   and Render (ANM2::Reset on teardown, layer/frame data into the scale packs).

   Binary: tools/isaac-ng.unpacked.exe
   SHA-256: 5129DF723E645DAAEA59514394195F3EA1DCE1671BB0433D724648A845017200

   Roots covered by v1 (identity re-verified in this work unit with
   scripts/decomp/identify-zhl-address.mjs):
     0x00407f10  EXACT ZHL __thiscall void ANM2::Reset()            (42 bytes)
     0x0040b220  EXACT ZHL __thiscall LayerState* ANM2::GetLayer(int) (44 bytes)
     0x0040b430  EXACT ZHL __thiscall LayerState* ANM2::GetLayer(const char*)
                 (only 7 pattern bytes â€” weak signature; the body walk below is
                  what actually pins it, not the pattern)
     0x0040bcd0  NO exact match â€” address-stable name-indexed AnimationData walk
     0x0040a5d0  NO exact match â€” same walk + apply/warn residual
     0x00408e00  NO exact match â€” NOT peeled in v1 (see NEXT VA)

   Evidence:
     PE raw ANM2::Reset            VA 0x00407f10..0x00408169 (107 instructions)
     PE raw ANM2::GetLayer(int)    VA 0x0040b220..0x0040b2e8
     PE raw ANM2::GetLayer(char*)  VA 0x0040b430..0x0040b4be
     PE raw anim-data walk         VA 0x0040bcd0..0x0040bd43
     PE raw anim-data walk+apply   VA 0x0040a5d0..0x0040a685
     section-notes/anm2-v1/

   The SEH frame pushed at VA 0x00407f15 (0x00af0a30) and the security cookie
   at 0x00bf93b4 are host bookkeeping. The exception path is not game logic and
   is deliberately not modelled.

   ---------------------------------------------------------------------------
   ANM2 object layout (sizeof == 0x114)

   Every offset and every store WIDTH below is proven from this binary's
   instruction stream. The REPENTOGON ZHL `struct ANM2 ... : 0x114` field names
   agree with the machine on all of them, so ZHL-backed names are used with the
   offset kept in the identifier. Slots ZHL does not name stay address-stable.

     0x000 std::string  _filename         (SSO buf 0x000, size 0x010, cap 0x014)
     0x018 std::string  _animDefaultName  (SSO buf 0x018, size 0x028, cap 0x02c)
     0x030 AnimationState _animState      (host, 0x20 bytes)
     0x050 AnimationState _overlayAnimState (host, 0x20 bytes)
     0x070 bool         _overlayRenderFirst  <- 8-bit store  @0x00408141
     0x074 AnimationData* _animData
     0x078 int          _animCount
     0x07c LayerState*  _layerState
     0x080 int          _layerCount
     0x084 ptr / 0x088 count / 0x08c ptr / 0x090 count
     0x094 Vector       _offset  (2 floats)
     0x09c Vector       _scale   (2 floats)
     0x0a4 float        _rotation
     0x0a8 ColorMod     _color            (11 dwords, 0x0a8..0x0d0)
     0x0d4 ColorMod     _championColor    (11 dwords, 0x0d4..0x0fc)
     0x100 bool _flipX / 0x101 bool _flipY <- ONE 16-bit store @0x00408125
     0x104 float        _playbackSpeed
     0x108 unnamed bool / 0x109 bool _loaded <- ONE 16-bit store @0x00408138
     0x10c unnamed int32, reset to -1        (ZHL does not name this slot)
     0x110 unsigned int _bitflags

   ---------------------------------------------------------------------------
   ANM2::Reset PE order (VA 0x00407f10..0x00408169)

     1. if (*(int32*)(this+0x10) != 0) HOST 0x0040e2b0(this)   <- full dword test
     2. clear _filename: size=0 then *data = '\0', where data is the SSO select
        (cap < 0x10 ? this+0x00 : *(char**)(this+0x00))
     3. HOST __thiscall 0x00408830(this+0x30, 0)
     4. HOST __thiscall 0x00408830(this+0x50, 0)
     5. clear _animDefaultName the same way (this+0x18 / cap at this+0x2c).
        NOTE: no 0x0040e2b0 call guards this second string.
     6. this->_animData = 0; this->_animCount = 0
     7. layers = *(void**)(this+0x7c)          <- read AFTER the host calls
        if (layers != 0) {
          header = layers - 4
          HOST `eh vector destructor iterator` 0x00aef638(
                 layers, 0xa0, *(u32*)header, dtor 0x00407a60)
          n = *(u32*)header                     <- RE-READ after the dtor call
          HOST operator delete 0x00aef15c(header, n*0xa0 + 4)
        }
     8. the field-write plan (see isaac_anm2_reset_apply_fields).

   Reset is NEVER pure-complete: steps 3 and 4 are unconditional host calls.

   ---------------------------------------------------------------------------
   Original defects reproduced, not corrected (see NOTES.md):

   D1 ANM2::GetLayer(int) out of range does NOT return null. It logs and then
      returns &<function-local static LayerState> at 0x00c7f630 (guard
      0x00c7f628), so every bad caller aliases one shared object.
   D2 The same _layerCount slot is compared SIGNED by GetLayer(int)
      (js / jl / jge at 0x0040b24c, 0x0040b254, 0x0040b27b) and UNSIGNED by
      GetLayer(const char*) (jb at 0x0040b4a2). A count with bit 31 set makes
      the int overload reject every index while the name overload scans ~2^32.
   D3 _flipX/_flipY and 0x108/_loaded are each cleared by ONE 16-bit store, so
      the padding bytes at 0x102..0x103 and 0x10a..0x10b survive Reset. So do
      0x071..0x073.
   D4 The array header count used for the operator delete SIZE is re-read after
      the eh-vector destructor call. An element destructor that touches the
      header changes the freed size.
   D5 _color resets all four leading components to 1.0f, but _championColor
      resets only three to 1.0f and the fourth (0x0e0) to 0.0f.
   D6 The 0x0040e2b0 host call is gated on _filename being non-empty; the
      second string is cleared with no matching call.
   D7 The AnimationData walks (0x0040bcd0 / 0x0040a5d0) dereference the element
      std::string with no null guard, while GetLayer(const char*) guards
      _layerData == 0 with the empty literal at 0x00b1a4ec.

   ---------------------------------------------------------------------------
   Do NOT promote the four float sources as constants. _offset is copied from
   the Vector at 0x00c7b640 and _scale from the Vector at 0x00c3793c; both live
   in writable .data and both have their address taken elsewhere in .text
   (e.g. `push 0xc7b640` at VA 0x0040b750). No direct 32-bit store to any of
   the four slots exists in .text for this hash, and 0x00c7b640/0x00c7b644 sit
   past the raw size of .data (so they load as 0.0f) while 0x00c3793c/0x00c37940
   carry a raw 1.0f initializer. They are runtime inputs with documented
   load-time defaults, and the PE moves them with movss - a raw 32-bit copy -
   so the helpers take and store BIT PATTERNS, not floats.

   Do NOT promote 0x00408830 as AnimationState::SetAnimationData: it has no
   exact ZHL match. It is address-stable here even though Reset passes 0 and
   0x0040a5d0 passes a found AnimationData*.

   Residual host actions in this section (all address-stable):
     0x0040e2b0  non-empty-_filename prologue of Reset
     0x00408830  animation-state apply (both Reset receivers and the 0x0040a5d0
                 reset==true branch)
     0x00408970  animation-state apply, 0x0040a5d0 reset==false branch
     0x00407a60  LayerState element destructor (virtual dispatch + global fn ptr)
     0x00aef638  MSVC `eh vector destructor iterator`
     0x00aef15c  operator delete(void*, size_t)  -> platform primitive
     0x00a112c0  logger
     0x00c7f628 / 0x00c7f630  magic-static guard + static LayerState
     0x00408e00  frame/scale advance (calls IAT 0x00b18838, 0x00408c90,
                 0x00408b90) - not peeled in v1 */

/* ---------------------------------------------------------------------------
   v2 additions â€” AnimationState frame/scale advance (0x00408e00) and the
   animation-state apply pair (0x00408830 / 0x00408970).

   Roots added in v2 (identity re-verified; NONE has an exact ZHL match):
     0x00408e00  AnimationState frame/scale advance   â€” peeled here
     0x00408830  animation-state apply                â€” pure size/sequence
                 logic + the unconditional epilogue field writes
     0x00408c90 / 0x00408b90 / 0x00408c10 / 0x00408970  â€” still host
     0x00a648b0  guest allocator WRAPPER (cl-dispatched, 64-bit accounting
                 counters at [0x00c7de78]+0x30 else 0x00c7f618) â€” host
                 residual. Per the standing allocator decision a WRAPPER is
                 game logic, so this does NOT count as a platform primitive;
                 it is cross-cutting (every section reaches it) and belongs
                 to its own future family, not to ANM2.
     0x00af05e5  `jmp [0x00b1875c]` = VCRUNTIME140.dll!memset (hint 72,
                 import-directory-resolved) â€” platform primitive
     0x00af05df  `jmp [0x00b18760]` = VCRUNTIME140.dll!memcpy (hint 70) â€”
                 platform primitive, reached from 0x00408970 only
     0x00b187dc  IAT api-ms-win-crt-heap-l1-1-0.dll!free â€” platform primitive

   IAT `0x00b18838` resolved through the PE import directory (not inferred):
   `api-ms-win-crt-math-l1-1-0.dll` **nextafterf** (hint 275).

   0x00408e00 PE order (VA 0x00408e00..0x00408ee4, `ret` â€” __thiscall, the
   incoming float arrives in xmm1):

     x        = cvtdq2ps(*(int32*)(animData + 0x30))     ; frame length
     clamped  = minss( nextafterf(x, 0.0f), incoming )   ; minss dst,mem
     *(int32*)(state + 0x18) = 0
     *(float*)(state + 0x10) = clamped
     HOST __thiscall 0x00408c90(state)
     for (i = 0; ; ++i)   ; layer frames
        outer entry   `cmp [animData+0x1c], esi ; jbe`  with esi == 0 (UNSIGNED)
        inner check   `test eax,eax ; je` + `test esi,esi ; js` +
                      `cmp esi,[animData+0x1c] ; jl`     (SIGNED)
        on failure    HOST log 0x00a112c0(0x10, "id out of bounds\n")
        BODY ALWAYS   *(int32*)(*(void**)(state+8) + i*4) = 0
                      HOST __thiscall 0x00408b90(state, i, xmm2 = incoming)
        loop back     `cmp esi,[animData+0x1c] ; jb`     (UNSIGNED, animData
                      RE-READ from state+4 every iteration)
     same again with count at animData+0x24, array at state+0xc, body 0x00408c10

   AnimationState layout (this binary; ZHL `AnimationState` agrees):
     +0x00 ANM2* _animation      (proven: 0x00408efe reads [edi] then [eax+0x80]
                                  which is ANM2::_layerCount from v1)
     +0x04 AnimationData* _animData
     +0x08 int* _layerFrames
     +0x0c int* _nullLayerFrames
     +0x10 float _animFrame
     +0x18 int32 (cleared to 0 by the advance)

   AnimationData layout (this binary):
     +0x00 std::string _name    (already used by the v1 name walk)
     +0x1c int _layerCount      (ZHL agrees)
     +0x24 int **second count**  <-- ZHL says `_nullLayerCount : 0x28`.
           THE MACHINE SAYS 0x24, in five independent places: 0x00408e9e,
           0x00408eab, 0x00408eda (advance) and 0x004088fc, 0x00408920
           (apply). ZHL is not authoritative for this hash; the name is NOT
           promoted and the offset stays address-stable.
     +0x30 int _length          (fed to cvtdq2ps + nextafterf)

   v2 defects reproduced, not corrected:

   D8  The "id out of bounds\n" log at 0x00408e6d / 0x00408eb0 is ADVISORY.
       Control falls straight through to the frame-slot store and the body
       call, so an out-of-range index still writes `frames[i] = 0` and still
       invokes the host body. The log does not guard anything.
   D9  0x00408830 asks the allocator for a SATURATING `count*4`
       (`mul ; seto ; neg ; or` -> 0xffffffff on overflow) but then memsets
       with a plain WRAPPING `count << 2`. On overflow the two disagree.
   D10 The same AnimationData count is compared UNSIGNED by the loop entry and
       loop-back (`jbe` / `jb`) and SIGNED by the in-loop bound check (`jl`).
       A count with bit 31 set therefore enters the loop, logs on every single
       iteration, and still runs ~2^31 bodies. Same shape as D2, different
       object â€” measured on two independent walks.
   D11 The advance re-reads `animData` from `state+0x04` after every body call
       (0x00408e93 / 0x00408ed6), so the loop bound is re-derived per
       iteration. This is the OPPOSITE of ANM2::GetLayer(const char*), which
       folds its bound once. Do not unify them.
   D12 0x00408830 reads `_layerCount` twice: once for the allocation size
       (VA 0x004088bc) and again for the memset size (VA 0x004088e0) â€” and the
       second read goes through an animData pointer that was itself RE-READ
       from state+0x04 after the allocator call (VA 0x004088da). Same for the
       second array (0x004088fc alloc vs 0x00408920 memset via the 0x0040891a
       re-read).
   D13 The 0x00408830 epilogue (VA 0x00408935..0x0040894e, reached from EVERY
       path including the early data==null exit) clears state+0x14 with an
       8-BIT store, so bytes 0x15..0x17 survive the apply â€” same shape as D3.
       The same block sets state+0x10 to raw bits 0xbf800000 (-1.0f), the only
       negative sentinel in this family, and clears +0x18 / +0x1c as dwords.

   0x00408830 PE order (VA 0x00408830..0x0040895e, `ret 4`; SEH frame
   0x00af0b60 + cookie are host bookkeeping):

     1. state+0x04 = new_data (the stack argument), stored FIRST
     2. if ([state+0x08] != 0)  HOST free  (guest allocator 0x00a648b0, cl=1),
        then state+0x08 = 0
     3. if ([state+0x0c] != 0)  HOST free, then state+0x0c = 0
     4. data = [state+0x04] RE-READ; if data == 0 -> step 7
     5. n = [data+0x1c]; if n != 0:
          HOST alloc(saturate(n*4)) -> state+0x08
          data = [state+0x04] RE-READ; m = [data+0x1c]  (D12)
          HOST memset(ptr, 0xff, m << 2)                (D9: wrapping)
          data = [state+0x04] RE-READ; if data == 0 -> step 7
        (n == 0 falls THROUGH to step 6 with the pre-alloc data pointer and
         NO extra null test â€” do not add a recapture the PE does not perform)
     6. n2 = [data+0x24]; if n2 != 0: same alloc+memset for state+0x0c
     7. the unconditional epilogue field writes (isaac_anm2_state_apply_tail_
        fields): +0x10 = 0xbf800000, byte +0x14 = 0, +0x18 = 0, +0x1c = 0

   0x00408970 (the reset==false apply) is NOT modelled in v2. Its machine
   extent is VA 0x00408970..0x00408b81 (`ret 4`). Shape actually observed:
   old/new counts for BOTH arrays are read up front with null guards
   (old = [state+0x04], new = the stack argument), and per array:
   equal counts -> keep the buffer untouched; new <= 0 (SIGNED `jg`) -> free
   the old buffer; else alloc(saturate(new*4)) + memset 0xff + `memcpy`
   0x00af05df of old_count<<2 bytes (only when old_count > 0, SIGNED) + a
   64-bit accounting decrement (`sub [p] ; sbb [p+4]`, p = [0x00c7de78]
   ? [0x00c7de78]+0x30 : 0x00c7f618) + raw free through IAT 0x00b187dc,
   then state+0x04 = new_data LAST (0x00408b6d). The accounting counters are
   allocator-WRAPPER state (game logic per the standing decision), which is
   why this body stays host until it gets its own work unit. */

/* ---------------------------------------------------------------------------
   v3 â€” 0x00408970 decision/size peel, the 0x00408830 epilogue writes, and the
   evidence re-verification the v2 checkpoint was missing.

   v2 landed the C++ and the JS oracle for 0x00408e00 / 0x00408830 but shipped
   ZERO behavioural assertions for either (the helpers were imported by the test
   file and listed as exports, so only "it links" was checked), and the v2 text
   below names a helper `isaac_anm2_state_apply_tail_fields` that did not exist.
   v3 closes both gaps and adds 0x00408970.

   Re-verified in v3 straight from the binary (not carried over on trust):

   * IAT 0x00b18838 resolved by WALKING THE PE IMPORT DIRECTORY (data dir 1 at
     RVA 0x007f3088, 28 descriptors), not by inference from the callsite:
       0x00b1875c  VCRUNTIME140.dll!memset                    hint 72
       0x00b18760  VCRUNTIME140.dll!memcpy                    hint 70
       0x00b187dc  api-ms-win-crt-heap-l1-1-0.dll!free        hint 24
       0x00b18838  api-ms-win-crt-math-l1-1-0.dll!nextafterf  hint 275
     The two thunks are 6-byte `ff 25` jumps: 0x00af05e5 -> [0x00b1875c] and
     0x00af05df -> [0x00b18760], so both v2 claims hold byte-for-byte.
   * ZHL identity re-run on every VA of this unit. 0x00408e00 / 0x00408830 /
     0x00408970 / 0x00408b90 / 0x00408c10 / 0x00408c90 / 0x00a648b0 have NO
     exact match and stay address-stable. Pattern length as evidence strength:
     ANM2::Reset 42 bytes (strong), ANM2::GetLayer(int) 44 bytes (strong),
     ANM2::GetLayer(const char*) only 7 bytes â€” that name rests on the body
     walk recovered in v1, not on the signature.
   * rel32 call census over the whole .text raw range: 0x00408e00 has 432 direct
     call sites, 0x00408830 has 60, 0x00408970 has exactly 2 (0x0040a678 and
     0x0040ab98, both the `cmp byte ptr [ebp+0xc],0 ; je` arm of a 0x0040a5d0
     clone). The advance is by far the hottest body in this family.
   * 0x00c7de78 and 0x00c7f618 both sit PAST the raw size of .data, so they are
     zero-filled at load: the allocator accounting block defaults to the fixed
     0x00c7f618 until something publishes a heap head. Same class of fact as the
     v1 _offset/_scale sources â€” a documented load-time default, NOT a constant.

   0x00408970 PE order (VA 0x00408970..0x00408b81, `ret 4`; SEH frame 0x00af0b60
   is host bookkeeping). All FOUR counts are observed UP FRONT, before any host
   call, each behind its own null guard:

     old      = [state+0x04]                       (0x0040899a)
     old_n0   = old ? [old+0x1c] : 0               (0x004089a1 / 0x004089a6)
     new      = the stack argument                 (0x004089a8)
     new_n0   = new ? [new+0x1c] : 0               (0x004089b2 / 0x004089b7)
     old_n1   = old ? [old+0x24] : 0               (0x004089bd / 0x004089c5)
     new_n1   = new ? [new+0x24] : 0               (0x004089d0 / 0x004089d5)

   then, per array (arm 0 = frames at state+0x08 / counts +0x1c; arm 1 = frames
   at state+0x0c / counts +0x24):

     if (old_n == new_n)                       -> arm does nothing at all
     else if ((int32)new_n <= 0)               -> `test ebx,ebx ; jg` is SIGNED
        if (slot != 0) { wrapper free(slot); slot = 0; }
     else
        p = wrapper alloc(saturate(new_n*4))       ; mul/seto/neg/or
        memset(p, 0xff, wrap(new_n*4))             ; lea ecx,[ebx*4] â€” WRAPS
        if ((int32)old_n > 0)                      ; `test eax,eax ; jle` SIGNED
           memcpy(p, slot, wrap(old_n*4))          ; shl eax,2 â€” WRAPS
        if (slot != 0) {
           blk = [0x00c7de78] ? [0x00c7de78]+0x30 : 0x00c7f618
           sub [blk], [slot-4] ; sbb [blk+4], 0    ; 64-bit accounting
           raw free(slot-4) through IAT 0x00b187dc
           arm 1 ONLY: state+0x0c = 0              ; 0x00408b63
        }
        state+0x08 = p                             ; 0x00408aa2 AND 0x00408b6a
     finally state+0x04 = new (0x00408b6d), stored LAST.

   v3 defects reproduced, not corrected:

   D14 THE SLOT CLOBBER. Arm 1's realloc path stores its freshly allocated
       buffer into `state+0x08` â€” the LAYER frame pointer â€” not `state+0x0c`.
       Both stores are the same three bytes `89 5e 08` at 0x00408aa2 and
       0x00408b6a; the correct encoding `89 5e 0c` appears nowhere. Arm 1 also
       zeroes its own slot at 0x00408b63 on the release path, so after an arm-1
       realloc `state+0x0c` is ALWAYS null and `state+0x08` holds arm 1's
       buffer, leaking whatever arm 0 just allocated. Downstream this makes
       0x00408e00's second walk store through a null base whenever the second
       count is nonzero. Reproduce it; do not "fix" the displacement.
   D15 The memcpy length comes from the OLD count alone (`shl eax,2` on old_n),
       never min(old_n, new_n), and the arm is only reached when the counts
       DIFFER. old_n > new_n therefore copies past the end of the buffer that
       was just allocated at new_n*4 bytes. Both arms.
   D16 D9 recurs here in both arms: the allocation size saturates to 0xffffffff
       while the memset size (`lea ecx,[ebx*4]`) and the memcpy size
       (`shl eax,2`) wrap. They disagree from count 0x40000000 up.
   D17 The same AnimationData count field is read three different ways across
       this family. For a count with bit 31 set:
         0x00408830  `test eax,eax ; je`  -> sign-agnostic, ALLOCATES
         0x00408e00  `cmp [d+off],esi ; jbe` with esi==0 -> UNSIGNED, ENTERS
         0x00408970  `test ebx,ebx ; jg`  -> SIGNED, takes the FREE path
       One field, three verdicts. This is the same class as D2/D10 and is why
       none of these predicates may be shared.
   D18 The inner `test eax,eax ; je log` null guard inside BOTH 0x00408e00
       walks is dead on every non-faulting execution. Entry already dereferenced
       the same pointer (`cmp [eax+0x1c],esi` at 0x00408e58, `cmp [eax+0x24],esi`
       at 0x00408e9e) and so does the loop-back (`cmp esi,[eax+0x1c]` at
       0x00408e97), so reaching 0x00408e60 with eax == 0 is impossible without
       having already faulted. The helper still models the instruction, because
       the instruction is what the machine executes.
   D19 The second walk's ENTRY count is read through the animData pointer left
       in eax by the FIRST walk (0x00408e9e reads [eax+0x24], with no reload),
       while its loop-back reloads from state+0x04 (0x00408ed6). Entry and
       continuation therefore disagree if a body call swaps the descriptor.

   Still host after v3, for this family:
     0x00a648b0  guest allocator WRAPPER (cl=0 alloc / cl=1 free, pointer in
                 edx, two stack dwords) â€” game logic per the standing decision,
                 cross-cutting, belongs to its own family
     0x00408c90  advance pre-walk body        0x00408b90 / 0x00408c10  walk bodies
     0x00af05e5 memset / 0x00af05df memcpy / 0x00b187dc free â€” platform
     0x00a112c0  logger
   ANM2::Reset is therefore STILL not pure-complete: steps 3 and 4 remain
   unconditional calls into 0x00408830, whose allocator content is a wrapper. */

/* ---------------------------------------------------------------------------
   v4 â€” the three bodies the advance calls: 0x00408c90, 0x00408b90, 0x00408c10.

   All three are TRANSLATED HERE, not reduced to plans: their only remaining
   host content is the logger 0x00a112c0, which is advisory in every case. That
   removes three host edges from 0x00408e00 (432 direct call sites); the logger
   is the only host edge left on that path.

   Roots added in v4 (identity re-verified; NONE has an exact ZHL match, so all
   three keep address-stable names â€” the helper names below are descriptive and
   are NOT promoted symbols):
     0x00408c90  advance pre-walk / trigger scan   __thiscall, no args, `ret`
     0x00408b90  frame walk, layer list            __thiscall(int), xmm2 float
     0x00408c10  frame walk, second list           __thiscall(int), xmm2 float

   SIBLING TEMPLATE, byte-proven. 0x00408b90 and 0x00408c10 are 120 bytes each
   and differ in exactly TEN bytes; two of those (+0x2b, +0x2c) are only the
   rel32 displacement to the shared logger call, so there are EIGHT parameter
   bytes carrying SEVEN distinct values:

     off    0x00408b90   0x00408c10   meaning
     +0x20  0x1c         0x24         AnimationData count field
     +0x3c  0x08         0x0c         AnimationState frame-array field
     +0x48  0x18         0x20         AnimationData list-of-entries field
     +0x4f  0x6c         0x54         element stride (imul imm8)
     +0x53  0x08         0x0c         entry's element-count field
     +0x58  0x04         0x08         entry's element-array field
     +0x5e  0x68         0x50         element's time field
     +0x69  0x6c         0x54         element stride again (add imm8)

   The entry stride is `shl esi,4` = 0x10 in BOTH. One template, one per-index
   law, two sites â€” do not merge the bodies, they read different arrays.

   0x00408c90 PE order (VA 0x00408c90..0x00408cfc, `ret`):

     data = [state+0x04]                          0x00408c95 (edi AND ebx)
     if (data == 0) {
        HOST log(0x10, "AnimationData is NULL\n" @0x00b1a504)
        data = [state+0x04]  RE-READ, both registers re-synced   0x00408caa
     }
     i = 0
     if ([data+0x2c] <= i)  UNSIGNED (`cmp ; jbe` with i == 0) -> return
     frame = [state+0x10]                         loaded ONCE, 0x00408cb9
     do {
        t = cvtdq2ps( *(int32*)([data+0x28] + i*8 + 4) )
        ucomiss t, frame ; lahf ; test ah,0x44 ; jp skip
        if (ORDERED EQUAL) {
           id = *(int32*)([data+0x28] + i*8)      ; [data+0x28] RE-READ
           [state+0x18] = bts([state+0x18], id)
           id = *(int32*)([data+0x28] + i*8)      ; RE-READ a THIRD time
           [state+0x1c] = bts([state+0x1c], id)
        }
        ++i
     } while (i < [data+0x2c])                    UNSIGNED (`jb`)

   0x00408b90 / 0x00408c10 PE order (120 bytes, `ret 4`):

     data = [state+0x04]
     ok = data != 0 && (int)index >= 0 && (int)index < (int)[data+COUNT_OFF]
     if (!ok) {
        HOST log(0x10, "id out of bounds\n" @0x00b1a4f0)
        data = [state+0x04]   RE-READ, LOG PATH ONLY   0x00408bbf
        time  = reload of the spilled xmm2             0x00408bc5
     }
     slot  = [state+FRAMES_OFF] + index*4      ; NO bound clamp â€” see D20
     cur   = *(int32*)slot
     entry = [data+LIST_OFF] + (index << 4)    ; 32-bit wrap
     if ((int)cur < 0) return
     off = cur * STRIDE                        ; imul, 32-bit wrap
     for (;;) {
        ++cur
        if ((int)cur >= (int)[entry+LIST_COUNT_OFF]) break     SIGNED jge
        t = cvtdq2ps( *(int32*)([entry+LIST_BASE_OFF] + off + TIME_OFF) )
        if (comiss(time, t) sets CF) break      ; time < t OR UNORDERED
        off += STRIDE
        *(int32*)slot = cur
        if ((int)cur < 0) break                 SIGNED jns
     }

   v4 defects reproduced, not corrected:

   D20 D8 SQUARED. 0x00408e00 already logs "id out of bounds\n" for a bad index
       and then calls the body anyway; the body re-tests the SAME index against
       the SAME field, logs the SAME string AGAIN, and then indexes the frame
       array and the entry list with it regardless. One bad index therefore
       emits TWO log lines per iteration and performs two unclamped scaled
       indexings. The second test guards nothing either.
   D21 `bts r32, r32` masks the bit index to 5 bits. The trigger id read from
       the element is used raw, so id 32 sets bit 0 and a NEGATIVE id sets
       bit (id & 31). The two trigger masks are silently modulo 32; there is no
       range check anywhere on the path.
   D22 The two trigger masks are NOT symmetric in lifetime. 0x00408e00 clears
       ONLY [state+0x18] (0x00408e42) while 0x00408830's epilogue clears BOTH
       0x18 and 0x1c (D13). So 0x18 is per-advance and 0x1c accumulates across
       every advance until the next animation-state apply. Same value, two
       fields, two lifetimes â€” do not unify them.
   D23 The trigger element is re-read from memory THREE times per matching
       iteration ([data+0x28] at 0x00408cc0, 0x00408cd5, 0x00408ce4) and the id
       word twice (0x00408cdb, 0x00408cea). The loop-back bound is re-read from
       [data+0x2c] every iteration as well. Nothing folds.
   D24 The frame-walk store happens BEFORE the negative test: `mov [edi],ecx`
       at 0x00408bfa precedes `test ecx,ecx ; jns` at 0x00408bfc. When `cur`
       wraps to 0x80000000 the wrapped value is COMMITTED to the frame slot and
       only then does the loop exit. The next call reads it back, takes the
       `test ecx,ecx ; js` early return at 0x00408bdb, and the walk is stuck
       forever.
   D25 The advance's frame clamp can leave a NaN in [state+0x10] (a NaN request
       survives `minss`, pinned in v3). Both v4 bodies see it: 0x00408c90's
       `ucomiss` + parity idiom reports NOT EQUAL, so no trigger ever fires,
       and the frame walk's `comiss ; jb` takes CF=1 and stops before its
       first store. A NaN frame silently freezes the animation rather than
       faulting.
   D26 0x00408c90's null-descriptor log is a diagnostic BEFORE the crash, not
       a guard: control falls straight into `cmp [ebx+0x2c], edx`, which
       dereferences the same pointer. Identical shape to D18, one function up.

   The `ucomiss ; lahf ; test ah,0x44 ; jp` idiom at 0x00408ccc..0x00408cd3 is
   an EQUALITY test, derived here rather than assumed. lahf puts ZF in AH bit 6
   and PF in AH bit 2, so `ah & 0x44` is one of 0x00 / 0x04 / 0x40 / 0x44 and
   `jp` fires on EVEN parity, i.e. on 0x00 and 0x44. ucomiss can only produce
   (ZF,PF) = (0,0) ordered-unequal, (1,0) equal, (1,1) unordered, so the
   fall-through -- the only path that fires a trigger -- is exactly 0x40:
   ordered and equal. NaN takes the 0x44 arm and skips.

   Still host after v4 in this family: 0x00a112c0 logger; the guest allocator
   WRAPPER 0x00a648b0 (game logic, cross-cutting, handled elsewhere â€” this
   family stops at that boundary); everything already listed for v1..v3.

   ---------------------------------------------------------------------------
   v5: the ANM2::Play family and the AnimationState update chain.

   Roots (identify-zhl-address.mjs, one batch):
     0x0040a380  EXACT ZHL  __thiscall void ANM2::Play(const char*, bool)
                 (129 pattern bytes)              -> translated (gate + plan)
     0x00409100  EXACT ZHL  __thiscall void ANM2::Update() (22 bytes) -> translated
     0x0040a1b0  EXACT ZHL  __thiscall void AnimationState::Rewind() (25 bytes)
                                                  -> translated
     0x00408d00  EXACT ZHL  __thiscall void AnimationState::AdvancePosition(int)
                 (13 pattern bytes â€” WEAK signature, same posture as v4:
                  the address-stable name is retained) -> translated
     0x0040a4d0  NO match    IsPlaying-name predicate  -> translated
     0x0040a550  NO match    sibling predicate (D27)    -> translated
     0x00409030  NO match    AnimationState update      -> translated
     0x0040a400  NO match    ANM2::Play(int, bool)      -> plan translated,
                  the 0x0040a5d0 walk+apply stays host
     0x00af0917  CRT `floor` (api-ms-win-crt-math-l1-1-0, hint 224), resolved
                 through the PE import directory -> MODELED natively: the
                 helpers lower std::floor / float conversions to f64.floor /
                 f32.demote_f64 / f32.convert_s, so the module stays
                 zero-import. This was the only external callee of the chain.

   Census (direct e8 call sites): 0x0040a380 -> 1784, 0x0040a1b0 -> 851,
   0x00409030 -> 226, 0x00409100 -> 19, 0x0040a4d0 -> 10, 0x0040a400 -> 8,
   0x0040a550 -> 3. The family's pure surface is now complete except the
   0x0040a5d0 walk+apply residual and 0x0040a2b0 PlayRandom.

   The Play gate (0x0040a380, reused by 0x0040a400 and 0x0040a2b0):
      skip = !reset && data=[this+0x34] && strcmp(data->name, name)==0
             && (byte[data+0x34]==0 || byte[this+0x44]!=0)
   call = !skip -> HOST 0x0040a5d0(this, name, 1); if AL != 0 then
   Rewind(this+0x30) [translated] and byte[this+0x44] = 1. byte[data+0x34] is
   the AnimationData loop-ish flag; byte[this+0x44] is the primary
   AnimationState+0x14 playing flag (0x44 == 0x30 + 0x14).

   The state update (0x00409030) chain: data==0 or playing flag clear -> no-op;
   (int)trunc(floor(frame+_playbackSpeed)) < length [SIGNED] -> AdvancePosition
   + store the UNTRUNCATED frame+speed float; otherwise byte[data+0x34] != 0 ->
   Rewind (flag survives); else wrap: if (length-1) >= (int)floor(frame)
   [SIGNED, floor taken on the ORIGINAL frame, NOT frame+speed] ->
   AdvancePosition(state, length-1), then byte[state+0x14] = 0.
   0x00409100 runs it for _animState (+0x30) then _overlayAnimState (+0x50)
   iff byte[this+0x109] (_loaded) is set.

   AdvancePosition (0x00408d00): target < (int)floor(frame) [SIGNED] -> advisory
   log(0x10, 0x00b1a520, target, cur) and the frame for the compare is RE-READ
   after the host logger; else the pre-call snapshot. [state+0x18] = 0; loop
   while ordered((float)target > frame): frame = (float)floor(frame) + 1.0f
   (float32 add; 1.0f constant at 0x00baa454), prewalk (v4), re-compare.
   Then both v4 frame walks with xmm2 == (float)target, entry counts UNSIGNED,
   per-iteration re-read of [state+4] for the loop bounds.

   New defects reproduced, not corrected:
   D27 0x0040a550's null-data path makes the empty-name check DEAD: after
      `cmp byte [name],0` the decision is a raw pointer test, so any non-null
      name (including "") returns 0 while the data path returns 1 for "".
      (A null name pointer faults at the byte read in the PE; the harness
      reads linear address 0 instead.)
   D28 AdvancePosition's loop makes no progress once |frame| >= 2^24:
      floor(frame)+1.0f rounds back to frame, so with (float)target > frame
      the PE spins forever. The helpers stop at the first no-progress
      iteration and report runaway=1. Reachable targets (|target| <= 2^31)
      still terminate, so this is only observable for huge frame values.
   D29 NaN payloads: SSE addss propagates the first operand's NaN bits while
      wasm f32.add canonicalizes; unobservable downstream here (every consumer
      is an unordered compare or cvttss2si). floor(NaN) passes the input bits
      through (MSVC CRT behavior) in both implementations.

   Still host after v5 in this family: 0x00a112c0 logger (advisory, reported
   in plans); 0x0040a5d0 walk+apply residual (removed in v6 below);
   0x0040a2b0 PlayRandom; 0x0040a220 getter. floor is modeled; no import
   remains.

   v6 (0x0040a5d0 whole body): the name walk + hit/miss apply/warn routing is
   now one pure export, isaac_anm2_walk_apply_plan (44-byte plan below).
   The walk is an UNSIGNED `cmp edi,ebx ; jb` over anim-data stride 0x13c
   with std::string SSO select + inlined two-byte strcmp; miss routes to the
   warn log (0x00a112c0, level 1, str 0x00b1a614) and hit picks the state
   apply receiver by the LOW BYTE of reset: byte==0 -> 0x00408970, else
   0x00408830 (cmp byte ptr [ebp+0xc],0 ; je). host_call_count is 1 on both
   paths. The two receiver bodies and the logger stay host (their own v2/v3
   plans model the receivers). 0x00857450's five Play / four state-update /
   one IsPlaying edges are recorded as the wiring interface in
   section-notes/anm2-v6/NOTES.md; not wired into Update.

   v10 (0x0040a2b0 PlayRandom): the UNSIGNED modulo decision. Body
   0x0040a2b0..0x0040a353 (`ret 4`, 164 bytes). identify-zhl-address.mjs
   v10: NO exact ZHL match — address-stable (Lua binds the VA as
   "PlayRandom"). Census of .text `e8` sites via the section table
   (.text raw 0x400 + (VA-0x401000)): exactly 3 callers —
   0x005cf62f, 0x0099b092, 0x0099b1aa. Stores: only the existing
   Play tail `mov byte [this+0x44],1` after Rewind; no other writes.

     ecx = [this+0x78]                    ; _animCount, FULL DWORD
     test ecx,ecx ; je LOG                ; count==0 -> log + ret 4
     eax = [ebp+8] ; xor edx,edx ; div ecx  ; UNSIGNED rem in edx
     ebx = [this+0x74] + edx*0x13c        ; element (imul 0x13c)
     ebx = SSO-select(element name)       ; cap < 0x10 UNSIGNED jb
     ; then the shared Play gate with reset implicit 0 (no [ebp+0xc]
     ; test anywhere; one stack arg is the seed). Host 0x0040a5d0 +
     ; Rewind tail identical to Play(int).
     LOG: log(1, 0x00b1a5c8 "[warn] PlayRandom: no animations\\n")

   The divisor test is a FULL 32-bit `test ecx,ecx`: count 0x100 /
   0x10000 / 0xffffffff all take the rem path. The rem itself is
   UNSIGNED (`xor edx,edx ; div ecx`), so seed 0x80000000 % 3 == 2
   (a signed `idiv` would produce a different remainder). Seed is
   the raw [ebp+8] dword — never a byte. Not Update-wired. Next VA:
   0x0040a220 getter.

   v11 (0x0040a220 AnimationState layer-frame getter): the COMPLETE
   body 0x0040a220..0x0040a2a4 (`ret 4`, 132 bytes, int3 pad to
   0x0040a2af). identify-zhl-address.mjs v11: NO exact ZHL match —
   address-stable (Lua binds a wrapper as GetLayerFrameData; the
   name is NOT promoted). Census of .text `e8` sites via the
   section table (.text raw 0x400 + (VA-0x401000)): exactly 52
   callers. Stores: NONE. Two HOST logs are ADVISORY (fall through):
     0x0040a22d log(0x10, 0x00b1a504 "AnimationData is NULL\\n")
        when [this+4]==0, FULL DWORD `cmp ; jne`
     0x0040a24d log(0x10, 0x00b1a564 "LayerId out of bounds\\n")
        when layerId<0 (SIGNED `js`) or layerId >= [ANM2+0x80]
        (SIGNED `jl` against a FRESH `[this]` load)
   then the body RE-READS [this+4] and returns 0 / AnimationFrame*:
     edx = [this+4] ; test ; je FAIL
     esi = [ebp+8] ; test ; js FAIL          ; SIGNED
     cmp esi, [[this]+0x80] ; jg FAIL        ; SIGNED, FRESH [this]
     ecx = [edx + esi*4 + 0x38]              ; layerMap[layerId]
     test ecx,ecx ; js FAIL                  ; SIGNED
     cmp ecx,[edx+0x1c] ; jge FAIL           ; SIGNED vs _layerCount
     eax = [[this+8] + ecx*4]                ; _layerFrames[map]
     test eax,eax ; js FAIL                  ; SIGNED
     ecx <<= 4 ; ecx += [edx+0x18]           ; entry = layers + map*0x10
     cmp eax,[ecx+8] ; jge FAIL              ; SIGNED vs list count
     return [ecx+4] + eax*0x6c               ; imul 0x6c
     FAIL: xor eax,eax ; ret 4

   D29: the advisory bound uses SIGNED `jl` (layerId >= count logs)
   but the body uses SIGNED `jg` (only layerId > count fails). So
   layerId == [ANM2+0x80] logs and then CONTINUES into the map
   lookup. ZHL GetLayerOrder also caps the map index at 64; the
   machine does not. [this] (ANM2*) and [this+8] (_layerFrames)
   are unguarded: a null either faults at [eax+0x80] / [eax+ecx*4]
   (harness reads linear 0). Logs stay host (advisory). Not
   Update-wired. Next VA: 0x0040a360 SSO trampoline into Play.

   v12 (0x0040a360 std::string SSO trampoline into Play): the COMPLETE
   23-byte body 0x0040a360..0x0040a376 (`jmp 0x0040a380`, int3 pad to
   0x0040a37f). identify-zhl-address.mjs v12: NO exact ZHL match —
   address-stable (Lua binds it as Play via `push 0x0040a360` at
   0x00867262; the name is NOT promoted — ZHL Play is the 0x0040a380
   const-char* overload, 129 pattern bytes). Census of .text `e8`
   sites via the section table (.text raw 0x400 + (VA-0x401000)):
   exactly 12 callers. One `.text` imm32 `push 0x0040a360` at
   0x00867262 (Lua). Zero `e9` tails. Stores: NONE on the ANM2
   image. The only store is `mov [ebp+8], eax` (stack-arg rewrite).
   Body:
     eax = [ebp+8]                      ; std::string*
     cmp [eax+0x14], 0x10 ; jb INLINE   ; UNSIGNED strict below
     mov eax, [eax]                     ; heap pointer
     INLINE: mov [ebp+8], eax
     pop ebp
     jmp 0x0040a380                     ; ANM2::Play(const char*, bool)
   Then the already-translated Play gate + host 0x0040a5d0 + Rewind
   tail. Consume Play BY REFERENCE. A null std::string* faults in the
   PE at the cap load; the harness reports cap/name 0 and still runs
   Play. Not Update-wired. Next VA: 0x0040a4b0 sibling SSO
   trampoline into 0x0040a4d0.

   v13 (0x0040a4b0 std::string SSO trampoline into 0x0040a4d0): the
   COMPLETE 23-byte body 0x0040a4b0..0x0040a4c6 (`jmp 0x0040a4d0`,
   int3 pad to 0x0040a4cf). identify-zhl-address.mjs v13: NO exact
   ZHL match — address-stable (Lua binds it as IsPlaying via
   `push 0x0040a4b0` at 0x008673dc; the name is NOT promoted — ZHL
   IsPlaying is a multi-body pattern that starts at the 0x0040a4d0
   const-char* overload). Census of .text `e8` sites via the section
   table (.text raw 0x400 + (VA-0x401000)): exactly 0 callers. One
   `.text` imm32 `push 0x0040a4b0` at 0x008673dc (Lua). Zero `e9`
   tails. Raw LE-dword hits across all five sections: 1 (that push).
   Stores: NONE on the ANM2 image. The only store is `mov [ebp+8],
   eax` (stack-arg rewrite). Body:
     eax = [ebp+8]                      ; std::string*
     cmp [eax+0x14], 0x10 ; jb INLINE   ; UNSIGNED strict below
     mov eax, [eax]                     ; heap pointer
     INLINE: mov [ebp+8], eax
     pop ebp
     jmp 0x0040a4d0                     ; already-translated pred
   Consume isaac_anm2_playing_name_pred BY REFERENCE. A null
   std::string* faults in the PE at the cap load; the harness
   reports cap/name 0 and still runs the pred. The 0x200 dump
   window also covers already-translated 0x0040a4d0 / 0x0040a550 /
   0x0040a5d0 — not re-opened. Not Update-wired. Next VA:
   0x0040a530 sibling SSO trampoline into 0x0040a550.

   v14 (0x0040a530 std::string SSO trampoline into 0x0040a550): the
   COMPLETE 23-byte body 0x0040a530..0x0040a546 (`jmp 0x0040a550`,
   int3 pad to 0x0040a54f). identify-zhl-address.mjs v14: NO exact
   ZHL match — address-stable (Lua binds it as IsFinished via
   `push 0x0040a530` at 0x0086724e; the name is NOT promoted — ZHL
   IsFinished is a multi-body pattern that starts at the 0x0040a550
   const-char* overload). Census of .text `e8` sites via the section
   table (.text raw 0x400 + (VA-0x401000)): exactly 0 callers. One
   `.text` imm32 `push 0x0040a530` at 0x0086724e (Lua). Zero `e9`
   tails. Raw LE-dword hits across all five sections: 1 (that push).
   Stores: NONE on the ANM2 image. The only store is `mov [ebp+8],
   eax` (stack-arg rewrite). Body:
     eax = [ebp+8]                      ; std::string*
     cmp [eax+0x14], 0x10 ; jb INLINE   ; UNSIGNED strict below
     mov eax, [eax]                     ; heap pointer
     INLINE: mov [ebp+8], eax
     pop ebp
     jmp 0x0040a550                     ; already-translated pred_alt
   Consume isaac_anm2_playing_name_pred_alt BY REFERENCE. A null
   std::string* faults in the PE at the cap load; the harness
   reports cap/name 0 and still runs the pred. The 0x180 dump
   window also covers already-translated 0x0040a550 / 0x0040a5d0
   and the 0x00408830 / 0x00408970 apply pair — consumed by
   reference, not re-opened. Do not re-open 0x0040a4b0 /
   0x0040a4d0. Not Update-wired. Next VA: 0x0040a5b0 sibling SSO
   trampoline into 0x0040a5d0.

   v15 (0x0040a5b0 std::string SSO trampoline into 0x0040a5d0): the
   COMPLETE 23-byte body 0x0040a5b0..0x0040a5c6 (`jmp 0x0040a5d0`,
   int3 pad to 0x0040a5cf). identify-zhl-address.mjs v15: NO exact
   ZHL match — address-stable (Lua binds it as SetAnimation via
   `push 0x0040a5b0` at 0x0086739d; the name is NOT promoted — ZHL
   SetAnimation is not this 23-byte SSO wrapper). Census of .text
   `e8` sites via the section table (.text raw 0x400 + (VA-0x401000)):
   exactly 0 callers. One `.text` imm32 `push 0x0040a5b0` at
   0x0086739d (Lua). Zero `e9` tails. Raw LE-dword hits across all
   five sections: 1 (that push). Stores: NONE on the ANM2 image.
   The only store is `mov [ebp+8], eax` (stack-arg rewrite). Body:
     eax = [ebp+8]                      ; std::string*
     cmp [eax+0x14], 0x10 ; jb INLINE   ; UNSIGNED strict below
     mov eax, [eax]                     ; heap pointer
     INLINE: mov [ebp+8], eax
     pop ebp
     jmp 0x0040a5d0                     ; already-translated walk+apply
   Consume isaac_anm2_walk_apply_plan BY REFERENCE. [ebp+0xc] reset
   flag is forwarded unchanged. A null std::string* faults in the PE
   at the cap load; the harness reports cap/name 0 and still runs
   the walk. The 0x180 dump window also covers already-translated
   0x0040a5d0 and the 0x00408830 / 0x00408970 apply pair — consumed
   by reference, not re-opened. Do not re-open 0x0040a530 /
   0x0040a550 / 0x0040a4b0 / 0x0040a4d0. Not Update-wired. Next VA:
   0x0040a690 ANM2::SetFrame(std_string*, int).

   v16 (0x0040a690 ANM2::SetFrame(std_string*, int)): the COMPLETE
   67-byte body 0x0040a690..0x0040a6d3 (`ret 8`, int3 pad to
   0x0040a6df). EXACT ZHL, 32 pattern bytes. Census of .text `e8`
   sites via the section table (.text raw 0x400 + (VA-0x401000)):
   exactly 15 callers. One `.text` imm32 `push 0x0040a690` at
   0x00867277 (Lua SetFrame). Zero `e9` tails. Raw LE-dword hits
   across all five sections: 1 (that push). Stores on the ANM2
   image: only `mov byte ptr [esi+0x44], 0` after the 0x00408e00
   tail, gated on a RE-READ of [this+0x34]. Body:
     eax = [ebp+8]                      ; std::string*
     cmp [eax+0x14], 0x10 ; jb INLINE   ; UNSIGNED strict below
     mov eax, [eax]                     ; heap pointer
     INLINE: push 1 ; push eax
     call 0x0040a5d0                    ; walk+apply, reset imm 1
     test al,al ; je DONE               ; BYTE gate
     test [esi+0x34],eax ; je DONE      ; data present
     cvtdq2ps xmm1, [ebp+0xc]           ; SIGNED frame -> float
     lea ecx,[esi+0x30] ; call 0x408e00 ; already-translated advance
     test [esi+0x34],eax ; je DONE      ; data RE-READ
     mov byte [esi+0x44], 0
     DONE: ret 8
   Consume isaac_anm2_walk_apply_plan / 0x00408e00 BY REFERENCE.
   Reset arg is the IMMEDIATE 1, not [ebp+0xc] (that slot is the
   SIGNED frame). A null std::string* faults in the PE at the cap
   load; the harness reports cap/name 0 and still runs the walk.
   The 0x180 dump window also covers 0x0040a6e0 / 0x0040a720 /
   0x0040a740 / 0x0040a760 / 0x0040a780 / 0x0040a7c0 — not opened.
   Do not re-open 0x0040a5b0 / 0x0040a5d0 / 0x0040a530 / 0x0040a4b0.
   Not Update-wired. Next VA: 0x0040a6e0 const-char* SetFrame.

   v17 (0x0040a6e0 const-char* SetFrame sibling): the COMPLETE
   58-byte body 0x0040a6e0..0x0040a71a (`ret 8`, int3 pad to
   0x0040a71f). NO exact ZHL match — address-stable. Census of
   .text `e8` sites via the section table (.text raw 0x400 +
   (VA-0x401000)): exactly 80 callers. Zero `.text` imm32
   `push 0x0040a6e0`. Zero `e9` tails. Raw LE-dword hits across
   all five sections: 0. Stores on the ANM2 image: only
   `mov byte ptr [esi+0x44], 0` after the 0x00408e00 tail,
   gated on a RE-READ of [this+0x34]. Body:
     push 1 ; push [ebp+8]              ; reset IMM 1, name is raw char*
     call 0x0040a5d0                    ; walk+apply
     test al,al ; je DONE               ; BYTE gate
     test [esi+0x34],eax ; je DONE      ; data present
     cvtdq2ps xmm1, [ebp+0xc]           ; SIGNED frame -> float
     lea ecx,[esi+0x30] ; call 0x408e00 ; already-translated advance
     test [esi+0x34],eax ; je DONE      ; data RE-READ
     mov byte [esi+0x44], 0
     DONE: ret 8
   Consume isaac_anm2_walk_apply_plan / 0x00408e00 / v16 SetFrame
   BY REFERENCE. No SSO: [ebp+8] is the char* itself. A null
   char* is forwarded as name 0 and the walk still runs. The
   0x180 dump window also covers 0x0040a720 / 0x0040a740 /
   0x0040a760 / 0x0040a780 / 0x0040a7c0 / 0x0040a7e0 — not
   opened. Do not re-open 0x0040a690 / 0x0040a5d0 / 0x00408e00.
   Not Update-wired. Next VA: 0x0040a720.

   v18 (0x0040a720 current-anim SetFrame(int)): the COMPLETE
   28-byte body 0x0040a720..0x0040a73c (`ret 4`, int3 pad to
   0x0040a73f). The 0x180 dump over-read past first_ret into
   0x0040a740 / 0x0040a760 / 0x0040a780 / 0x0040a7c0 /
   0x0040a7e0 — NOT opened. NO exact ZHL match — address-stable.
   Census of .text `e8` sites via the section table (.text raw
   0x400 + (VA-0x401000)): exactly 55 callers. One `.text`
   imm32 `push 0x0040a720` at 0x0086728c (Lua SetFrame(int)).
   Zero `e9` tails. Raw LE-dword hits across all five sections:
   2 (the Lua push, plus `mov [eax], 0x0040a720` at 0x0089f0a7).
   No store on the ANM2 image. Body:
     cmp dword [ecx+0x34], 0 ; je SKIP   ; full dword test
     movd xmm1, [ebp+8]
     add ecx, 0x30
     cvtdq2ps xmm1, xmm1                 ; SIGNED frame -> float
     call 0x408e00                       ; already-translated advance
     SKIP: ret 4
   Consume 0x00408e00 / SetFrame / walk+apply BY REFERENCE.
   Do not re-open 0x0040a6e0 / 0x0040a690 / 0x0040a5d0.
   Not Update-wired. Next VA: 0x0040a740.

   v19 (0x0040a740 current-anim advance, no frame): the COMPLETE
   17-byte body 0x0040a740..0x0040a750 (`ret`, int3 pad to
   0x0040a75f). The dump over-read past first_ret into
   0x0040a760 / 0x0040a780 / 0x0040a7c0 — NOT opened.
   NO exact ZHL match — address-stable (identify-zhl EMPTY).
   Census of .text `e8` sites via the section table (.text raw
   0x400 + (VA-0x401000)): exactly 4 callers. Zero `.text`
   imm32 `push 0x0040a740`. Zero `e9` tails. Raw LE-dword hits
   across all five sections: 0. No store on the ANM2 image.
   No frame arg. Body:
     push ecx
     cmp dword [ecx+0x34], 0 ; je SKIP   ; FULL dword test
     add ecx, 0x30
     call 0x408e00                       ; already-translated advance
     SKIP: pop ecx ; ret
   Consume 0x00408e00 / v16 SetFrame / v17 0x40a6e0 / v18 0x40a720
   BY REFERENCE. Do not re-open those. Do not open 0x0040a760+.
   needed(data_dword): data_dword != 0 (0x100 IS needed).
   Not Update-wired. Next VA: 0x0040a760.

   v20 (0x0040a760 current-anim AdvancePosition to last frame): the COMPLETE
   25-byte body 0x0040a760..0x0040a778 (`ret`, int3 pad to
   0x0040a77f). The dump over-read past first_ret into
   0x0040a780 — NOT opened. NO exact ZHL match — address-stable
   (identify-zhl EMPTY wrapper). No store on the ANM2 image.
   Body:
     push ecx
     cmp dword [ecx+0x34], 0 ; je SKIP   ; FULL dword test
     mov eax, [ecx+0x34]
     add ecx, 0x30
     mov eax, [eax+0x30]
     dec eax                             ; [data+0x30]-1, 32-bit wrap
     push eax
     call 0x408d00                       ; already-translated AdvancePosition
     SKIP: pop ecx ; ret
   Consume isaac_anm2_advance_position_apply /
   ISAAC_ANM2_HOST_VA_ADVANCE_POSITION 0x408d00 / v19 0x40a740
   FULL-dword gate BY REFERENCE. Do not re-open 0x408d00 /
   0x40a740 / 0x40a720 / 0x40a6e0. Do not open 0x0040a780.
   needed(data_dword): data_dword != 0 (0x100 IS needed).
   target_from_data(data_plus_0x30): data_plus_0x30 - 1 (i32 wrap).
   Not Update-wired. Next VA: 0x0040a780.

   v21 (0x0040a780 GetFrame-int + 0x0040a7c0 GetFrame-float): TWO
   adjacent getters that share the FULL-DWORD [this+0x34] gate.
   Dump: section-notes/cpu-dump/0040a780.txt. identify-zhl EMPTY.
   `--stop-at-ret` cut the NULL early-out at 0x40a790 — the TAKEN
   arm continues to 0x40a7b3 (`ret`, int3 pad to 0x40a7bf).
   0x0040a780..0x0040a7b3 (`ret`):
     cmp dword [ecx+0x34], 0 ; je → eax = -1 ; ret
     fld [ecx+0x40]          ; ANM2+0x40 = state+0x10 _animFrame
     fstp qword [esp]
     call 0xaf0917           ; CRT floor thunk: jmp [0x00b18840]
     fstp dword [ebp-4]
     fld [ebp-4]
     fstp dword [ebp-4]
     cvttss2si eax, [ebp-4]
     ret
   0xaf0917 is the same CRT floor the family already models
   (IAT 0x00b18840). Reuse isaac_anm2_floor_f32_bits +
   isaac_anm2_cvttss2si_bits BY REFERENCE. Do not stall on it.
   Census of .text `e8` sites via the section table: exactly 82 callers
   of 0x40a780. Zero store on the ANM2 image.
   0x0040a7c0..0x0040a7d4 (`ret`, int3 pad to 0x40a7df):
     cmp dword [ecx+0x34], 0
     je  → movss xmm0, [0xbaad50] ; ret
     jne → movss xmm0, [ecx+0x40] ; ret
   Zero calls. Fully pure. 0x00baad50 is .rdata (section table:
   va 0xb18000 raw 0x716600 → file+0x7a9350), bits 0xbf800000
   (-1.0f). Census: exactly 8 `.text` e8 callers. Do NOT open
   0x0040a7e0. Shared needed(data_dword): data_dword != 0
   (0x100 IS needed). Consume v19 FULL-dword gate BY REFERENCE.
   Not Update-wired. Next VA: 0x0040a7e0.

   v22 (0x0040a7e0 layer-int frame setter): the COMPLETE body
   0x0040a7e0..0x0040a85c (`ret 8`, int3 at 0x40a85f). Sibling
   0x0040a860 is the v23 name trampoline that calls this.
   identify-zhl: 13-byte match `ANM2::SetLayerFrame(int,int)` —
   WEAK. Address-stable name; the match is evidence only.
   Dump: section-notes/cpu-dump/0040a7e0.txt.
   Body:
     cmp dword [ecx+0x34], 0 ; je DONE   ; FULL dword
     mov esi, [ebp+8]                    ; layer SIGNED
     lea edi, [ecx+0x30]
     test esi,esi ; js LOG               ; negative → log
     cmp esi, [[edi]+0x80] ; jl HIT      ; SIGNED vs [anim+0x80]
     LOG: host 0xa112c0(0x10, 0xb1a564)
     test esi,esi ; js DONE
     cmp esi, [[edi]+0x80] ; jge DONE    ; SIGNED re-test
     esi = [[edi+4] + esi*4 + 0x38]      ; layer map (hit path)
     movd xmm2, [ebp+0xc] ; cvtdq2ps     ; SIGNED frame
     [ [edi+8] + esi*4 ] = 0
     call 0x408b90                       ; already-translated walk
     DONE: ret 8
   Consume v4 isaac_anm2_frame_walk_apply / 0x408b90, v19
   FULL-dword [this+0x34] gate, and the standing logger split
   for 0xa112c0 BY REFERENCE. needed(data_dword): data_dword
   != 0 (0x100 IS needed). layer 0x80000000 is SIGNED
   negative → log, no walk. Not Update-wired.
   Next VA: 0x0040a860 (opened in v23).

   v23 (0x0040a860 name trampoline + 0x0040a8a0 GetLayerFrame-int):
   TWO complete bodies. Dump: cpu-dump/0040a860.txt.
   identify-zhl: EMPTY. Address-stable. Do NOT open past
   0x0040a905 int3. Logger 0xa112c0 stays host.
   0x0040a860..0x0040a89c (`ret 8`, BOTH miss and hit rets):
     push [ebp+8]
     call 0x40b430          ; GetLayer(const char*) BY REFERENCE
     test eax,eax / jne HIT
     log 0xa112c0 (0xb1a634, 4, name) ; standing logger split
     ret 8
     HIT: eax = [eax]                  ; LayerData*
          push [ebp+0xc] ; push [eax]  ; frame, [LayerData+0]
          call 0x40a7e0                ; v22 SetLayerFrame BY REFERENCE
          ret 8
   0x0040a8a0..0x0040a902 (`ret 4`):
     cmp dword [edi+0x34], 0 / je → eax=-1   ; FULL dword
     mov esi, [ebp+8]
     test esi,esi ; js LOG
     cmp esi, [[this+0x30]+0x80] ; jl HIT    ; SIGNED
     LOG: host 0xa112c0(0x10, 0xb1a564)
          test esi,esi ; js OOB
     HIT: re-read [this+0x30] / [anim+0x80]
          cmp esi, [anim+0x80] ; jge OOB     ; SIGNED re-test
          ecx = [[this+0x34] + esi*4 + 0x38]
          eax = [[this+0x38] + ecx*4]
          ret 4
     OOB after log: eax=0 ; ret 4
   Consume v19/v22 FULL-dword [this+0x34] gate and v22 SIGNED
   layer-vs-[anim+0x80] BY REFERENCE. 0x100 IS needed.
   layer 0x80000000 is SIGNED-negative → log, eax=0.
   Not Update-wired. Next VA: 0x0040a910 (opened in v24).

   v24 (0x0040a910 Stop / clear playing flag): the COMPLETE
   11-byte body 0x0040a910..0x0040a91a (`ret`, int3 pad to
   0x0040a91f). Do NOT open 0x0040a920. identify-zhl EMPTY.
   Dump: section-notes/cpu-dump/0040a910.txt.
   Body:
     cmp dword [ecx+0x34], 0 ; je SKIP   ; FULL dword
     mov byte [ecx+0x44], 0
     SKIP: ret
   Consume v19 FULL-dword [this+0x34] BY REFERENCE.
   needed(data_dword): data_dword != 0 (0x100 IS needed).
   apply writes +0x44 only when needed. Not Update-wired.
   Next VA: 0x0040a920 (opened in v25).

   v25 (0x0040a920 overlay Play SSO + 0x0040a940 overlay Play
   + 0x0040a9c0 overlay Stop): TWO overlay-band bodies.
   identify-zhl EMPTY. Address-stable. Dump:
   section-notes/cpu-dump/0040a920.txt and 0040a9c0.txt.
   Do NOT open 0x0040a9d0. Do NOT peel 0x0040aaf0 (HOST).
   0x0040a920..0x0040a936 (`jmp 0x0040a940`, int3 at
   0x0040a937):
     eax = [ebp+8]                      ; std::string*
     cmp [eax+0x14], 0x10 ; jb INLINE   ; UNSIGNED
     mov eax, [eax]
     INLINE: mov [ebp+8], eax
     pop ebp
     jmp 0x0040a940
   Consume v12 Play SSO BY REFERENCE.
   0x0040a940..0x0040a9b3 (`ret 8`):
     cmp byte [ebp+0xc],0          ; reset LOW BYTE
     jne CALL
     esi=[this+0x54]; test esi / je CALL   ; FULL dword
     SSO-select esi; strcmp vs [ebp+8]
     test eax / jne CALL
     cmp [esi+0x34],al / je SKIP   ; BYTE
     cmp [this+0x64],al / jne SKIP
     CALL: push 1; push name; call 0x40aaf0  ; HOST
     test al,al / je SKIP
     lea ecx,[this+0x50]; call 0x40a1b0     ; Rewind BY REF
     mov byte [this+0x64],1
     SKIP: ret 8
   Overlay Play is v5/v12 Play parameterized
   (0x34/0x44/0x30/0x40a5d0 → 0x54/0x64/0x50/0x40aaf0).
   reset 0x100 is a SET of the LOW BYTE (not set).
   data 0x100 IS present (FULL dword).
   0x0040a9c0..0x0040a9ca (`ret`, int3 pad to 0x0040a9cf):
     cmp dword [ecx+0x54], 0 ; je SKIP   ; FULL dword
     mov byte [ecx+0x64], 0
     SKIP: ret
   Sibling of v24 0x40a910. Consume v24 BY REFERENCE —
   parameterize offs 0x34/0x44 → 0x54/0x64. 0x100 IS
   needed. Not Update-wired. Next VA: 0x0040a9d0 (opened in v26).

   v26 (0x0040a9d0 overlay Playing SSO trampoline + 0x0040a9f0
   overlay Playing pred): the COMPLETE trampoline
   0x0040a9d0..0x0040a9e2 (`jmp 0x0040a9f0`, int3 pad to
   0x0040a9ef) plus the COMPLETE body 0x0040a9f0..0x0040aa42
   (`ret 4` on BOTH the true and false exits). identify-zhl
   EMPTY. Address-stable. Dump:
   section-notes/cpu-dump/0040a9d0.txt. 0 E8. Fully pure.
   Opened in v27: 0x0040aa50.
   0x0040a9d0..0x0040a9e2 (`jmp 0x0040a9f0`, int3 at
   0x0040a9e7):
     eax = [ebp+8]                      ; std::string*
     cmp [eax+0x14], 0x10 ; jb INLINE   ; UNSIGNED
     mov eax, [eax]
     INLINE: mov [ebp+8], eax
     pop ebp
     jmp 0x0040a9f0
   Consume v13 Playing SSO BY REFERENCE.
   0x0040a9f0..0x0040aa42 (`ret 4`):
     eax=[this+0x54]; test eax / je FALSE   ; FULL dword
     cmp byte [this+0x64],0 / je FALSE      ; LOW BYTE overlay playing latch
     ecx=[ebp+8]
     cmp byte [ecx],0 / je TRUE             ; empty name → al=1
     SSO-select overlay name; strcmp
     test eax / jne FALSE
     TRUE: al=1; ret 4
     FALSE: xor al,al; ret 4
   Overlay Playing is v13 Playing pred parameterized
   (0x34/0x44 → 0x54/0x64). Latch 0x100 is CLEAR (LOW BYTE).
   data 0x100 IS present (FULL dword). Not Update-wired.
   Next VA: 0x0040aa50 (opened in v27).

   v27 (0x0040aa50 overlay Playing-alt SSO trampoline + 0x0040aa70
   overlay Playing-alt pred): the COMPLETE trampoline
   0x0040aa50..0x0040aa62 (`jmp 0x0040aa70`, int3 pad to
   0x0040aa6f) plus the COMPLETE body 0x0040aa70..0x0040aaca
   (`ret 4` on BOTH the true and false exits). identify-zhl
   EMPTY. Address-stable. Dump:
   section-notes/cpu-dump/0040aa50.txt. 0 E8 on the trampoline.
   Fully pure. Opened in v28: 0x0040aad0. Do NOT peel 0x0040aaf0
   (HOST, already named in v25).
   0x0040aa50..0x0040aa62 (`jmp 0x0040aa70`, int3 at
   0x0040aa67):
     eax = [ebp+8]                      ; std::string*
     cmp [eax+0x14], 0x10 ; jb INLINE   ; UNSIGNED
     mov eax, [eax]
     INLINE: mov [ebp+8], eax
     pop ebp
     jmp 0x0040aa70
   Consume v14 Playing SSO alt BY REFERENCE.
   0x0040aa70..0x0040aaca (`ret 4`):
     eax=[this+0x54]; test eax / jne LIVE     ; FULL dword
     NULL: eax=[ebp+8]; cmp byte [eax],0      ; discarded
           jmp TEST                           ; D27 pointer test
     LIVE: cmp byte [this+0x64],0 / jne FALSE ; LOW BYTE overlay playing-alt latch
           ecx=[ebp+8]
           cmp byte [ecx],0 / je TRUE         ; empty name -> al=1
           SSO-select overlay name; strcmp
     TEST: test eax / jne FALSE
     TRUE: al=1; ret 4
     FALSE: xor al,al; ret 4
   Overlay Playing-alt is v14 pred_alt parameterized
   (0x34/0x44 -> 0x54/0x64). Latch 0x100 is CLEAR (LOW BYTE).
   data 0x100 IS present (FULL dword). D27 reproduced: the
   null-data path decides on the raw name POINTER. Census:
   trampoline 0 E8 / 0 E9; one `.text` imm32 `push 0x0040aa50`
   at 0x00867491 (Lua helper 0x0089f1b0 at 0x0086749e; name
   NOT promoted). Body 0x0040aa70 has 1 E8 at 0x00787679 and
   1 E9 from the trampoline. Not Update-wired.
   Next VA: 0x0040aad0 (opened in v28).

   v28 (0x0040aad0 SSO trampoline into overlay apply HOST
   0x0040aaf0): the COMPLETE trampoline 0x0040aad0..0x0040aae2
   (`jmp 0x0040aaf0`, first int3 `0x0040aae7`, pad to
   0x0040aaef). identify-zhl v28 batch: 0x0040aad0, 0x0040aaf0,
   0x00a112c0, 0x00408830, 0x00408970 -- ALL EMPTY.
   Address-stable. Dump via section table (.text VA 0x00401000
   raw 0x400 -> file 0x9ed0). Byte-identical to v15 0x0040a5b0
   (SSO rewrite + `jmp rel32=+9` into the next island).
   Lua binds the trampoline via `push 0x0040aad0` at
   0x0086741b / helper 0x0089ed10 at 0x00867420 (same helper
   as v15 SetAnimation); .rdata name at 0x00b70528 is recorded
   as evidence and NOT promoted. 0 E8 on the trampoline; 0 E8
   and 0 E9 targeting it; one `.text` imm32. Fully pure SSO
   rewrite; the jmp target 0x0040aaf0 stays HOST (overlay
   walk+apply sibling of 0x0040a5d0 with apply recv this+0x50;
   not opened). [ebp+0xc] reset flag is forwarded unchanged.
   Consume v15 trampoline SSO BY REFERENCE. Not Update-wired.
   Next VA: 0x0040abb0 (opened in v29).

   v29 (0x0040abb0 overlay SetFrame SSO): the COMPLETE body
   0x0040abb0..0x0040abe7 (`ret 8`, first int3 `0x0040abea`,
   pad to `0x0040abef`). identify-zhl v29 batch: 0x0040abb0,
   0x0040aaf0, 0x00408e00, 0x0040a5d0, 0x00a112c0, 0x00408830,
   0x00408970 -- ALL EMPTY. Address-stable. Classified from the
   PE via the section table (.text VA 0x00401000 raw 0x400 ->
   file 0x9fb0); no cpu-dump write. Overlay sibling of v16
   0x0040a690: SSO-select [ebp+8], `push 1` / `push eax`,
   `call 0x0040aaf0` HOST (not peeled; overlay walk+apply with
   recv this+0x50), `test al,al`, FULL-dword `cmp [esi+0x54],0`
   (0x100 IS present), `movd xmm1,[ebp+0xc]` / `cvtdq2ps`,
   `lea ecx,[esi+0x50]`, `call 0x00408e00` (already translated
   advance, consumed BY REFERENCE). NO post-advance re-read and
   NO flag store (v16's byte[this+0x44]=0 tail is ABSENT).
   Consume v16 SetFrame SSO + v6 walk+apply BY REFERENCE;
   override apply recv to 0x50 on a hit. Lua binds via
   `push 0x0040abb0` at 0x00867446 / helper 0x0089f0f0 (same
   helper as v16 SetFrame); .rdata at 0x00b7061c reads
   SetOverlayFrame and is NOT promoted. .text E8 targeting
   0x0040abb0: exactly 3 callers (0x0077fe22, 0x00780038,
   0x0078b5e0); 0 E9; one LE-dword. Not Update-wired.
   Next VA: 0x0040abf0 (cstr sibling, no SSO) -- opened in v30.

   v62 unit (Rule-11 redirect: the assigned 0x0040a5d0 walk+apply was
   already landed whole at v6 as isaac_anm2_walk_apply_plan, so this unit
   took the frontier recorded by anm2-v62-gapscan): (a) PE-truth REPAIR of
   the v44 float ctor 0x0040d0e0 -- the body really ends at 0x40d13a
   (`pop ebp ; ret 0x10` @ 0x40d137; old END_VA 0x40d11d is a
   mid-instruction pin) and stores SEVEN distinct float inputs
   (a0/a1/a2/a6 stack + xmm1/xmm2/xmm3), not 4-with-replication;
   (b) THREE new complete small pure laws in the 0x40d120..0x40d220 gap:
   0x0040d140 two-string zero-init ctor, 0x0040d170 wide zero/identity
   ctor (22 constant stores), 0x0040d210 global-base getter
   ([0xc7169c] + 0x2a6c0). All three dead code (zero callers of any
   kind; strpair addr-taken x2 as eh-vec element ctor). ABI 61 -> 62.

   v64 unit (0x00412000 gap scan, mandatory resync): the 0x412000..
   0x413b3a stretch is ONE continuous body region (the 0x40ed50 INSERT
   tail; no int3 padding). First true boundaries after it:
   0x00413b40 SEH wrapper over host container-clear 0x414730 (census row,
   HOST) and 0x00413b90 aligned-buffer state ctor — a COMPLETE small pure
   body (11 constant stores + one round-up-to-4 alignment law), dead code
   (zero refs of any kind), LANDED. ABI 62 -> 63.

   v65 unit (0x00413bf0 + 0x00413c70, the next two bodies down the v64
   run table): TWIN by-name intrusive-list lookups -- head [this+0x20]
   with node-next +0x18, and head [this+0x18] with node-next +0x2c;
   nodes {name ptr +0x0, len +0x8}, empty-name default global
   0x00c71640, null needle returns the raw head. Both dead code (zero
   refs of any kind), identify-zhl EMPTY. BOTH LANDED as one shared
   plan shape. ABI 63 -> 64.

   v66 unit (0x00413cf0, next run-table body): NOT SEH (the v65
   handoff guess was wrong -- no fs:[0]/cookie; plain and-esp-8 frame).
   A call-free 64-bit seek over the manager struct (the 0x10044-byte
   object whose ctor landed at v64): 64-bit req = argX + argY, bounds
   vs limit = sext64([this+0x38] - posLo), flag-gated store arms,
   out-struct {result64, zeros}. Zero E8/E9/PUSH/data refs except ONE
   .rdata dword: vtable slot 0xb1b1bc (virtual method, adjustor-thunk
   siblings 0x413f90/0x413ff0/0x413e00 in the same table). LANDED as a
   report-only plan. 0x00413e00 (the whence-switch seek twin, same
   vtable at 0xb1b1b8) census-only this unit. ABI 64 -> 65.

   v67 unit (0x00413e00): the whence-switch seek twin -- FULL tail
   decoded, true `ret 0x14` @ 0x00413f8c (body 0x00413e00..0x413f8f,
   143 B; single int3 pad @0x413f8f; next body 0x00413f90). LANDED as
   a second report-only plan. Supplementary observation (decoded in
   the same dump, recorded so it is not re-opened blind):
   0x00413f90 read-byte-at-pos virtual (vtable slot 0xb1b1a8):
   pos = *[*[this+0x1c]]; pos == 0 -> -1; end = *[*[this+0x2c]] + pos;
   pos <u end -> return byte[pos]; else refresh arm: e = *[*[this+0x20]]
   (0 -> -1), byte[this+0x3c]&4 set -> -1, lim = min([this+0x38], e)
   (cmovb), lim <=u pos -> -1, [this+0x38] = lim, *[*[this+0x2c]] =
   lim - *posCell, then return byte[*[*[this+0x1c]]]. Census-only.
   ABI 65 -> 66.

   v68-retry unit: TWO more manager-vtable methods LANDED.
   0x00413ff0 put-char (vtable slot 0xb1b1a0, ret 4): pos =
   *[*[this+0x1c]]; FAIL iff pos == 0 (je 0x413ff9) or pos <=u
   *[*[this+0xc]] (jbe 0x414002); mismatch gate REACHED ONLY ON
   BOUNDS-PASS (the je/jbe exits jump past it) and only when
   ch != -1 (je 0x41400a): (byte)ch != byte[pos-1] (3A 56 FF @
   0x41400c) && byte[this+0x3c]&2 set -> FAIL; arms:
   ++*[*[this+0x2c]], --*[*[this+0x1c]], iff ch != -1
   byte[POST-DEC pos] = (byte)ch (the machine decs the cell for
   real before the store -- the plan SIMULATES the post-dec value);
   result = ch == -1 ? 0 : ch (full dword; cmove 0x414033); FAIL -1.
   0x00413f90 get-byte (vtable slot 0xb1b1a8): pos == 0 -> -1;
   end = *[*[this+0x2c]] + pos; pos <u end -> byte[pos] DIRECT;
   else refresh arm: e = *[*[this+0x20]] (0 -> -1),
   byte[this+0x3c]&4 -> -1, lim = max_u32([this+0x38], e) (cmovb),
   lim <=u pos -> -1, [this+0x38] = lim, *[*[this+0x2c]] = lim-pos,
   *[*[this+0x1c]] = pos SAME-VALUE writeback, result byte[pos].
   Both report-only plans. ABI 66 -> 67.

   v71 unit: TWO tiny pure getters LANDED as scalar laws (both dead
   code: zero E8/E9/push-imm/data refs; identify-zhl EMPTY).
   0x004143f0 stride-24 offset getter (18 B, ret 4, int3
   0x00414402..0f): result = *[this] + arg*24 via lea edx,[eax+eax*2]
   / lea eax,[eax+edx*8] -- 32-bit wrap throughout.
   0x00414410 signed divide-by-24 magic getter (23 B, ret, int3
   0x00414427..2f; next body 0x00414430 = jmp 0x4147f0 thunk):
   d = [this+4] - [this]; edx:eax = d * 0x2aaaaaab (SIGNED imul);
   high = sar(edx, 2); result = high + (high >>u 31) -- the classic
   MSVC SIGNED DIVIDE-BY-24 sequence (magic = ceil(2^34/24),
   sar 2, sign-add): trunc-toward-zero d/24, NOT floor (d = -24 ->
   -1; dropping the sign-add gives -2). BYTE-VERIFIED correction of
   the v70 supplementary guess (/3): d = 3 -> 0, d = 24 -> 1 on the
   machine. ABI 67 -> 68.

   v73 unit: 0x00414520 string resize-tail setter LANDED as a SPLIT
   law (pure shrink/equal arm + HOST grow tail). 0x00414520..
   0x00414549 (`ret 8` shrink exit @ 0x0041453c; grow exit `pop ebp
   ; jmp 0x00414870` with first stack slot := delta), int3
   0x0041454a..f. Dead code (zero E8/E9/push-imm/data refs;
   identify-zhl EMPTY). Shrink/equal arm (arg <=u cur): size store
   + SSO-select null-terminate -- pure-complete. Grow arm: delta =
   arg - cur, HOST tail 0x00414870 receives it in the first stack
   slot. ABI 68 -> 69.

   v76 unit: 0x00414a80 std::_Tree SUCCESSOR (operator++ core)
   LANDED as a plan law (81 B, ret x2, ZERO calls -- pure-complete;
   dead code: zero E8/E9/push-imm/data refs; identify-zhl EMPTY).
   this=esi is an ITERATOR SLOT: node = [esi]; the computed successor
   is stored BACK into [esi] and `this` is returned.
     right = node->+8; if right NOT nil ([+0xd]==0, je 0x00414ab1):
       descend left chain (+0) while NOT nil -> result = leftmost
       of the right subtree (PATH 0).
     else: parent = node->+4; if parent IS nil ([+0xd]!=0, jne
       0x00414aaa): result = parent = nil head (PATH 2);
       elif node != parent->+8: result = parent (PATH 3 -- node is
       a LEFT child); else climb parents while parent not-nil AND
       node == parent->+8: result = first non-right-child ancestor
       or nil head (PATH 1).
   ABI 69 -> 70.

   v82 unit: 0x00415d20 RB-erase orchestration CENSUS (HOST row --
   calls the landed successor 0x00414a80 plus the UNOPENED helpers
   0x00415f80/0x00415fe0; a complete law needs all three together,
   deferred) and 0x00415f80 tree-splice LANDED as a plan law:
   89 B, ret 4 x3, ZERO calls -- pure-complete. this=ecx is the
   container ([ecx] = header ptr, header+4 = root slot); arg
   [ebp+8] = node being erased. Splice the node's LEFT child into
   the node's position (node->left := left->right first), three
   exits: PATH 0 node == root; PATH 1 node == parent->right;
   PATH 2 node == parent->left. Dead code (zero E8/E9/push-imm/
   data refs; identify-zhl EMPTY). ABI 70 -> 71.

   v83 unit: 0x00415fe0 _Tree erase-splice RIGHT variant LANDED as
   the mirror of the v82 left-splice (85 B, ret 4 x3, ZERO calls --
   pure-complete; dead code; identify-zhl EMPTY). this=ecx =
   container; arg [ebp+8] = node. Splices the node's RIGHT child
   into the node's position (node->right := right->left first);
   three exits: node == header->root / node == parent->left /
   node == parent->right. The composed 0x00415d20 full-erase plan
   (RB-delete fixup loop, ~700 B) is now UNBLOCKED -- all three
   callees (0x00414a80 successor / 0x00415f80 left-splice /
   0x00415fe0 right-splice) are landed -- but its size defers the
   composition to a dedicated unit. ABI 71 -> 72.

   v84-retry unit: 0x00416440 std::_Tree LOWER_BOUND LANDED as a
   plan law (75 B, ret 8 @ 0x00416488, ZERO calls -- pure-complete;
   dead code: zero E8/E9/push-imm/data refs; identify-zhl EMPTY).
   this=ecx = container ([ecx] = header ptr); args: out iterator
   slot (3 dwords) @ [ebp+8], key-slot ptr @ [ebp+0xc] (key =
   *[key_slot], loaded once). Walk: x = header->root; root nil ->
   immediate return; while x NOT nil: [out] := x; node_key =
   [x+0x10]; if node_key >=u key { y := x ([out+8] := x);
   flag := 1; x := x->left (+0) } else { flag := 0; x :=
   x->right (+8) }. Exit on nil; [out+4] := last flag.
   First attempt aborted on a test-world bug (absent children = 0
   instead of the NIL head -> infinite walk); retry uses the
   corrected world builder. ABI 72 -> 73. */

enum { ISAAC_ANM2_PURE_HELPERS_ABI_VERSION = 77 };

/* Object / element sizes and strides. */
enum {
  ISAAC_ANM2_SIZE = 0x114,
  ISAAC_ANM2_ANIM_STATE_SIZE = 0x20,
  /* lea eax,[esi+esi*4]; shl eax,5  (VA 0x0040b27d, 0x00407fb3, 0x0040b4af) */
  ISAAC_ANM2_LAYER_STATE_STRIDE = 0xa0,
  /* imul eax, edi, 0x13c            (VA 0x0040bd34, 0x0040a655) */
  ISAAC_ANM2_ANIM_DATA_STRIDE = 0x13c,
  /* MSVC new[] cookie: base returned to the program is header+4. */
  ISAAC_ANM2_ARRAY_HEADER_BIAS = 4,
  /* cmp dword ptr [str+0x14], 0x10 ; jb inline   (UNSIGNED, strictly below) */
  ISAAC_ANM2_SSO_CAPACITY_THRESHOLD = 0x10
};

/* ANM2 field offsets (this binary; ZHL-name-backed where noted above). */
enum {
  ISAAC_ANM2_OFF_FILENAME_STR_00 = 0x00,
  ISAAC_ANM2_OFF_FILENAME_SIZE_10 = 0x10,
  ISAAC_ANM2_OFF_FILENAME_CAP_14 = 0x14,
  ISAAC_ANM2_OFF_ANIM_NAME_STR_18 = 0x18,
  ISAAC_ANM2_OFF_ANIM_NAME_SIZE_28 = 0x28,
  ISAAC_ANM2_OFF_ANIM_NAME_CAP_2C = 0x2c,
  ISAAC_ANM2_OFF_ANIM_STATE_30 = 0x30,
  ISAAC_ANM2_OFF_OVERLAY_STATE_50 = 0x50,
  ISAAC_ANM2_OFF_OVERLAY_FIRST_70 = 0x70,   /* 8-bit */
  ISAAC_ANM2_OFF_ANIM_DATA_74 = 0x74,
  ISAAC_ANM2_OFF_ANIM_COUNT_78 = 0x78,
  ISAAC_ANM2_OFF_LAYER_STATE_7C = 0x7c,
  ISAAC_ANM2_OFF_LAYER_COUNT_80 = 0x80,
  ISAAC_ANM2_OFF_OFFSET_94 = 0x94,
  ISAAC_ANM2_OFF_SCALE_9C = 0x9c,
  ISAAC_ANM2_OFF_ROTATION_A4 = 0xa4,
  ISAAC_ANM2_OFF_COLOR_A8 = 0xa8,
  ISAAC_ANM2_OFF_CHAMPION_COLOR_D4 = 0xd4,
  ISAAC_ANM2_OFF_FLIP_PAIR_100 = 0x100,     /* 16-bit: _flipX + _flipY */
  ISAAC_ANM2_OFF_PLAYBACK_SPEED_104 = 0x104,
  ISAAC_ANM2_OFF_LOADED_PAIR_108 = 0x108,   /* 16-bit: 0x108 + _loaded 0x109 */
  ISAAC_ANM2_OFF_UNNAMED_10C = 0x10c,       /* reset to -1; ZHL does not name */
  ISAAC_ANM2_OFF_BITFLAGS_110 = 0x110,
  /* LayerState::_layerData is at element+0; its std::string name at +8. */
  ISAAC_ANM2_LAYER_DATA_PTR_OFF = 0x00,
  ISAAC_ANM2_LAYER_DATA_NAME_OFF = 0x08
};

/* Immediate bit patterns stored by Reset (mov dword ptr, not float math). */
enum {
  ISAAC_ANM2_F32_ONE_BITS = 0x3f800000u,
  ISAAC_ANM2_RESET_UNNAMED_10C_VALUE = 0xffffffffu
};

/* Runtime float sources for _offset / _scale (writable .data, bit copies). */
enum {
  ISAAC_ANM2_OFFSET_X_SRC_VA = 0x00c7b640u,
  ISAAC_ANM2_OFFSET_Y_SRC_VA = 0x00c7b644u,
  ISAAC_ANM2_SCALE_X_SRC_VA = 0x00c3793cu,
  ISAAC_ANM2_SCALE_Y_SRC_VA = 0x00c37940u,
  /* Past the raw size of .data -> zero filled at load. */
  ISAAC_ANM2_OFFSET_X_LOAD_DEFAULT_BITS = 0x00000000u,
  ISAAC_ANM2_OFFSET_Y_LOAD_DEFAULT_BITS = 0x00000000u,
  /* Raw .data initializer 1.0f. */
  ISAAC_ANM2_SCALE_X_LOAD_DEFAULT_BITS = 0x3f800000u,
  ISAAC_ANM2_SCALE_Y_LOAD_DEFAULT_BITS = 0x3f800000u
};

/* Address-stable host VAs reached from this section. */
enum {
  ISAAC_ANM2_HOST_VA_RESET_NAME_PROLOGUE = 0x0040e2b0u,
  ISAAC_ANM2_HOST_VA_ANIM_STATE_APPLY = 0x00408830u,
  ISAAC_ANM2_HOST_VA_ANIM_STATE_APPLY_ALT = 0x00408970u,
  ISAAC_ANM2_HOST_VA_LAYER_ELEM_DTOR = 0x00407a60u,
  ISAAC_ANM2_HOST_VA_EHVEC_DTOR_ITER = 0x00aef638u,
  ISAAC_ANM2_HOST_VA_OPERATOR_DELETE = 0x00aef15cu,
  ISAAC_ANM2_HOST_VA_LOG = 0x00a112c0u,
  ISAAC_ANM2_HOST_VA_FRAME_ADVANCE = 0x00408e00u,
  ISAAC_ANM2_SEH_FRAME_RESET_VA = 0x00af0a30u,
  ISAAC_ANM2_SECURITY_COOKIE_VA = 0x00bf93b4u,
  /* GetLayer(int) miss fallback: function-local static + its guard. */
  ISAAC_ANM2_GET_LAYER_STATIC_VA = 0x00c7f630u,
  ISAAC_ANM2_GET_LAYER_GUARD_VA = 0x00c7f628u
};

/* Logger immediates. */
enum {
  ISAAC_ANM2_GET_LAYER_LOG_LEVEL = 0x10,      /* push 0x10 @0x0040b267 */
  ISAAC_ANM2_GET_LAYER_LOG_STR_VA = 0x00b1a68cu, /* "%s: No layer with Id %d\n" */
  ISAAC_ANM2_ANIM_MISS_LOG_LEVEL = 1,         /* push 1 @0x0040a63d */
  ISAAC_ANM2_ANIM_MISS_LOG_STR_VA = 0x00b1a614u, /* "[warn] no animation named %s\n" */
  ISAAC_ANM2_EMPTY_LITERAL_VA = 0x00b1a4ecu   /* "" used when _layerData == 0 */
};

/* Reset layer-array teardown plan (VA 0x00407f80..0x00407fc3). */
typedef struct IsaacAnm2ResetTeardownPlan {
  int32_t teardown_needed;      /* layer_state_7c != 0 */
  uint32_t header_ptr;          /* layer_state_7c - 4 (32-bit wrap); 0 if none */
  uint32_t dtor_array_ptr;      /* layer_state_7c; 0 if none */
  uint32_t dtor_elem_size;      /* 0xa0 */
  uint32_t dtor_count;          /* header count BEFORE the dtor call */
  uint32_t dtor_elem_va;        /* 0x00407a60 */
  uint32_t ehvec_va;            /* 0x00aef638 */
  uint32_t free_count;          /* header count RE-READ after the dtor call */
  uint32_t free_size;           /* free_count*0xa0 + 4 (32-bit wrap) */
  uint32_t operator_delete_va;  /* 0x00aef15c */
} IsaacAnm2ResetTeardownPlan;

/* Whole-Reset residual plan. */
typedef struct IsaacAnm2ResetPlan {
  int32_t name_host_needed;     /* *(int32*)(this+0x10) != 0 */
  uint32_t name_host_va;        /* 0x0040e2b0 */
  int32_t anim_state_calls;     /* always 2 (unconditional) */
  uint32_t anim_state_va;       /* 0x00408830 */
  uint32_t anim_state_recv0;    /* 0x30 */
  uint32_t anim_state_recv1;    /* 0x50 */
  int32_t teardown_needed;      /* layer_state_7c != 0 */
  uint32_t free_size;           /* 0 when no teardown */
  int32_t host_call_count;      /* name + 2 + (teardown ? 2 : 0) */
  int32_t pure_complete;        /* always 0 for Reset */
} IsaacAnm2ResetPlan;

/* ANM2::GetLayer(int) plan (VA 0x0040b220..0x0040b2e8). */
typedef struct IsaacAnm2GetLayerPlan {
  int32_t in_range_pre;         /* SIGNED index >= 0 && index < count_pre */
  int32_t log_needed;           /* !in_range_pre */
  uint32_t log_va;              /* 0x00a112c0 */
  int32_t log_level;            /* 0x10 */
  uint32_t log_format_va;       /* 0x00b1a68c */
  int32_t in_range_post;        /* recaptured re-test after the log call */
  uint32_t result_ptr;          /* base_post + index*0xa0, or the static VA */
  int32_t uses_static_fallback; /* !in_range_post */
  uint32_t static_layer_va;     /* 0x00c7f630 */
  uint32_t static_guard_va;     /* 0x00c7f628 */
} IsaacAnm2GetLayerPlan;

/* 0x0040a5d0 residual after the pure name walk. */
typedef struct IsaacAnm2AnimApplyPlan {
  int32_t found;                /* found_index >= 0 */
  int32_t found_index;          /* -1 on miss */
  uint32_t elem_byte_offset;    /* found_index * 0x13c; 0 on miss */
  int32_t warn_log_needed;      /* miss */
  uint32_t warn_log_va;         /* 0x00a112c0 */
  int32_t warn_log_level;       /* 1 */
  uint32_t warn_log_str_va;     /* 0x00b1a614 */
  uint32_t apply_va;            /* hit: 0x00408830 / 0x00408970; miss: 0 */
  uint32_t apply_recv_off;      /* 0x30 on hit; 0 on miss */
  int32_t result;               /* al: 1 on hit, 0 on miss */
} IsaacAnm2AnimApplyPlan;

/* v6: 0x0040a5d0 whole-body plan (the walk + the apply/warn routing joined).
   The count is loaded from [anm2+0x78] and the base from [anm2+0x74] once,
   then the SAME unsigned `jb` walk over stride 0x13c; first matching element
   name wins. host_call_count is exactly 1 on both paths: the warn log on a
   miss or the state-apply receiver call on a hit. */
typedef struct IsaacAnm2WalkApplyPlan {
  int32_t found;             /* found_index >= 0 */
  int32_t found_index;       /* i32 walk index; -1 on miss */
  uint32_t elem_byte_offset; /* found_index * 0x13c (u32 wrap); 0 on miss */
  int32_t warn_log_needed;   /* miss */
  uint32_t warn_log_va;      /* 0x00a112c0 */
  int32_t warn_log_level;    /* 1 */
  uint32_t warn_log_str_va;  /* 0x00b1a614 */
  uint32_t apply_va;         /* hit: 0x00408830 / 0x00408970; miss: 0 */
  uint32_t apply_recv_off;   /* 0x30 on hit; 0 on miss */
  int32_t result;            /* al: 1 on hit, 0 on miss */
  int32_t host_call_count;   /* 1: warn log or state-apply call */
} IsaacAnm2WalkApplyPlan;

/* v7: 0x0040bd50 ANM2::Load observable store lane (exact ZHL
   `__thiscall void ANM2::Load(std_string &ANM2Path, bool loadgraphics)`).
   The five pre-lane call sites stay host (0x0040e2b0 filename prologue,
   0x0040ccd0 filename assign, 0x0040db90 cache guard, 0x0040e110 cache
   fetch, 0x0040c000 per-layer graphics, and the two 0x00408830 state
   applies); this plan publishes their accounting plus the six pure stores:

     S1 byte  [this+0x109] = 1                 (0x0040bdb2 — UNCONDITIONAL;
        this+0x109 == engine+0x141 for the record-22 receiver engine+0x38 —
        the self-latching gate byte Game+0x1b97d)
     S2 dword [this+0x10c] = 0xffffffff        (0x0040bdb9 — UNCONDITIONAL)
     S3 dword [this+0x10c] = last layer index whose data name == "shadow"
                                               (0x0040be29)
     S4 dword [layer + 0x8c] |= 5 for each '*' layer   (0x0040be39)
     S5 dword [this+0x110] |= 0x400            (0x0040be40)
     S6 dword [this+0x110] |= 0x800            (0x0040be82)

   Layer array read through the guest pointer [anm2+0x7c] (stride 0xa0,
   UNSIGNED count at [anm2+0x80]); extras array through [anm2+0x84]
   (stride 0x18, count at [anm2+0x88], base NOT loaded when count == 0).
   host_call_count = 5 + (filename size != 0) + ((load_graphics & 0xff)!=0). */
typedef struct IsaacAnm2LoadPlan {
  int32_t entered;             /* 1 for a non-null anm2 image */
  uint32_t latch_off;          /* 0x109 */
  int32_t latch_value;         /* 1 */
  int32_t slot10c_uncond;      /* 1 */
  int32_t slot10c_uncond_value;/* 0xffffffff */
  int32_t shadow_index;        /* last "shadow" layer index; -1 when none */
  int32_t shadow_set;          /* shadow_index >= 0 */
  int32_t star_layer_count;    /* '*' layers seen */
  int32_t star_layer_first;    /* first '*' layer index; -1 when none */
  int32_t star_extra_count;    /* '*' extras seen */
  int32_t star_extra_first;    /* first '*' extra index; -1 when none */
  int32_t bitflags_or_400;     /* star_layer_count > 0 */
  int32_t bitflags_or_800;     /* star_extra_count > 0 */
  uint32_t bitflags_off;       /* 0x110 */
  uint32_t star_flag_off;      /* layer element + 0x8c */
  uint32_t layer_stride;       /* 0xa0 */
  uint32_t extra_stride;       /* 0x18 */
  uint32_t layer_count;        /* [anm2+0x80] raw */
  uint32_t extra_count;        /* [anm2+0x88] raw */
  uint32_t filename_size;      /* [anm2+0x10] raw */
  int32_t graphics_loaded;     /* (load_graphics & 0xff) != 0 */
  uint32_t shadow_str_va;      /* 0x00b1a6c0 "shadow" */
  int32_t host_call_count;     /* 5 + prologue + graphics */
  uint32_t layers_guest;       /* [anm2+0x7c] raw */
  uint32_t extras_guest;       /* [anm2+0x84] raw */
} IsaacAnm2LoadPlan;

/* Load constants (v7). */
enum {
  ISAAC_ANM2_LOAD_SHADOW_STR_VA = 0x00b1a6c0, /* "shadow" */
  ISAAC_ANM2_LOAD_EMPTY_NAME_VA = 0x00b1a4ec, /* "" (same literal as v1) */
  ISAAC_ANM2_LOAD_STAR_CHAR = 0x2a,           /* '*' */
  ISAAC_ANM2_LOAD_LAYER_STAR_OR = 5,          /* S4 mask */
  ISAAC_ANM2_LOAD_BITFLAG_400 = 0x400,        /* S5 */
  ISAAC_ANM2_LOAD_BITFLAG_800 = 0x800,        /* S6 */
  ISAAC_ANM2_LOAD_OFF_LAYER_STATE_7C = 0x7c,
  ISAAC_ANM2_LOAD_OFF_LAYER_COUNT_80 = 0x80,
  ISAAC_ANM2_LOAD_OFF_EXTRAS_PTR_84 = 0x84,
  ISAAC_ANM2_LOAD_OFF_EXTRAS_COUNT_88 = 0x88,
  ISAAC_ANM2_LOAD_OFF_NAME_8 = 0x08,          /* std::string at data+8 */
  ISAAC_ANM2_LOAD_LAYER_STRIDE = 0xa0,
  ISAAC_ANM2_LOAD_EXTRA_STRIDE = 0x18,
  ISAAC_ANM2_LOAD_LAYER_STAR_FLAG_OFF = 0x8c,
  ISAAC_ANM2_LOAD_HOST_VA_STRING_ASSIGN = 0x0040ccd0,
  ISAAC_ANM2_LOAD_HOST_VA_CACHE_GUARD = 0x0040db90,
  ISAAC_ANM2_LOAD_HOST_VA_CACHE_FETCH = 0x0040e110,
  ISAAC_ANM2_LOAD_HOST_VA_GRAPHICS = 0x0040c000,
};

/* v52: 0x0040bc90 anim-state key getter (unit anm2-v52-getters). Receiver is
   the AnimationState subobject (ANM2+0x30 / ANM2+0x50); [state+4] is the
   state's _animData (same field as ISAAC_ANM2_STATE_OFF_ANIM_DATA_04 / the
   ANM2+0x34 FULL-dword gate). Null anim data -> 0xffffffff (or eax,-1 at
   0x0040bc97); else the RAW first dword of the anim-record SSO key string at
   [anim_data+0x138] (NO cap test in this body — cap is at +0x14c per the
   frame-opaque 4214b0 law, whose KEY_DATA_OFF pins the same 0x138 field). */
enum {
  ISAAC_ANM2_ANIM_KEY_VA = 0x0040bc90,
  ISAAC_ANM2_ANIM_KEY_END_VA = 0x0040bca1,      /* `ret` */
  ISAAC_ANM2_ANIM_KEY_BODY_BYTES = 18,          /* 0x0040bc90..0x0040bca1 */
  ISAAC_ANM2_ANIM_KEY_DATA_OFF = 0x04,          /* mov eax,[ecx+4] (state+4) */
  ISAAC_ANM2_ANIM_KEY_RECORD_OFF = 0x138,       /* mov eax,[eax+0x138] */
  ISAAC_ANM2_ANIM_KEY_NULL_RESULT = 0xffffffff, /* or eax,-1 */
  ISAAC_ANM2_ANIM_KEY_CALLSITE_COUNT = 2,       /* direct e8 census */
};

/* v53: 0x00407ae0 Isaac::SwapANM2 (unit anm2-v53-swapanm2). EXACT ZHL
   `static cleanup void Isaac::SwapANM2(ANM2* left<ecx>, ANM2* right<edx>)`
   (pattern `558bec0f1002`, 6 bytes; oracle zhlcheck.json va 4225760
   corroborates). Pure field-pair exchange of two 0x114-byte ANM2 images:
   933 B, 0 E8 / 0 indirect / 8 branches / 70 memory-store insns; `ret` at
   0x00407e84; 19 corrected direct callers (lea-fixed census, this unit;
   every site capstone-verified, incl. 0x407eb8 inside the companion
   0x00407e90). Field offsets below reuse the v1/v21 layout pins where they
   exist (0x00/0x18 blocks, 0x34, 0x44, 0x74..0x80, 0x94/0x9c/0xa4, 0xa8/
   0xd4, 0x100/0x104/0x108/0x10c/0x110); the state/extras offsets not
   previously pinned are added here. NOT swapped (absent from the body):
   0x30 / 0x50 (state _animation headers), 0x70..0x73 (_overlayRenderFirst
   + padding), 0x94/0x98 (_offset), 0x102/0x103, 0x10a/0x10b padding. */
enum {
  ISAAC_ANM2_SWAP_VA = 0x00407ae0,
  ISAAC_ANM2_SWAP_END_VA = 0x00407e84,        /* `ret` */
  ISAAC_ANM2_SWAP_BODY_BYTES = 933,           /* 0x00407ae0..0x00407e85 */
  ISAAC_ANM2_SWAP_CALLSITE_COUNT = 19,        /* lea-corrected direct e8 */
  ISAAC_ANM2_SWAP_SSO_BLOCK_BYTES = 24,       /* filename/animName buf+size+cap */
  ISAAC_ANM2_SWAP_COLORMOD_BYTES = 44,        /* 11 dwords at +0xa8 / +0xd4 */
  ISAAC_ANM2_SWAP_LAYER_OWNER_OFF = 0x04,     /* layers[i*0xa0 + 4] = owner */
  ISAAC_ANM2_SWAP_STATE_FRAMES_OFF = 0x38,    /* primary state +0x08 */
  ISAAC_ANM2_SWAP_STATE_NULL_OFF = 0x3c,      /* primary state +0x0c */
  ISAAC_ANM2_SWAP_STATE_FRAME_OFF = 0x40,     /* movss _animFrame (state+0x10) */
  ISAAC_ANM2_SWAP_STATE_18_OFF = 0x48,        /* primary state +0x18 */
  ISAAC_ANM2_SWAP_STATE_1C_OFF = 0x4c,        /* primary state +0x1c */
  ISAAC_ANM2_SWAP_OVERLAY_DATA_OFF = 0x54,    /* overlay state +0x04 */
  ISAAC_ANM2_SWAP_OVERLAY_FRAMES_OFF = 0x58,
  ISAAC_ANM2_SWAP_OVERLAY_NULL_OFF = 0x5c,
  ISAAC_ANM2_SWAP_OVERLAY_FRAME_OFF = 0x60,   /* movss _animFrame */
  ISAAC_ANM2_SWAP_OVERLAY_BYTE_OFF = 0x64,    /* 8-bit tail byte */
  ISAAC_ANM2_SWAP_OVERLAY_18_OFF = 0x68,
  ISAAC_ANM2_SWAP_OVERLAY_1C_OFF = 0x6c,
  ISAAC_ANM2_SWAP_EXTRAS_PTR_OFF = 0x84,
  ISAAC_ANM2_SWAP_EXTRAS_COUNT_OFF = 0x88,
  ISAAC_ANM2_SWAP_EXTRAS_PTR2_OFF = 0x8c,
  ISAAC_ANM2_SWAP_EXTRAS_COUNT2_OFF = 0x90,
};

/* ---------- shared std::string / strcmp primitives ---------- */

/* `cmp dword ptr [str+0x14], 0x10 ; jb use_inline`. The compare is UNSIGNED
   and STRICT: a capacity of exactly 0x10 already means heap storage. */
int32_t isaac_anm2_sso_uses_heap(uint32_t capacity);

/* Data pointer the PE dereferences for a std::string:
     capacity < 0x10 ? str_base : heap_ptr
   32-bit values throughout; no memory access. */
uint32_t isaac_anm2_sso_data_ptr(uint32_t str_base,
                                 uint32_t capacity,
                                 uint32_t heap_ptr);

/* The strcmp MSVC inlined into 0x0040b470, 0x0040bcf5 and 0x0040a600. Two
   bytes are compared per iteration; the result is normalised by `sbb eax,eax /
   or eax,1`, so it is exactly -1 / 0 / +1 and the byte compare is UNSIGNED. */
int32_t isaac_anm2_strcmp_inline(const char* a, const char* b);

/* ---------- AR: ANM2::Reset (VA 0x00407f10) ---------- */

/* `cmp dword ptr [edi+0x10], 0 ; je skip` â€” a full 32-bit test of the
   std::string size, not a byte test. 1 when HOST 0x0040e2b0 runs. */
int32_t isaac_anm2_reset_name_host_needed(int32_t filename_size_10);

/* `test eax,eax ; je` on the recaptured *(void**)(this+0x7c). */
int32_t isaac_anm2_reset_teardown_needed(uint32_t layer_state_7c);

/* `lea esi,[eax-4]` â€” the MSVC new[] cookie sits one dword below the base. */
uint32_t isaac_anm2_reset_array_header(uint32_t layer_state_7c);

/* `mov eax,[esi] ; lea eax,[eax+eax*4] ; shl eax,5 ; add eax,4` â€” the byte
   count handed to operator delete. 32-bit wrapping multiply by 0xa0 plus the
   4-byte cookie. */
uint32_t isaac_anm2_reset_free_size(uint32_t header_count);

/* Struct form. count_before is the header dword read at VA 0x00407fa4 (the
   eh-vector destructor argument); count_after is the SEPARATE re-read at VA
   0x00407fb1 that decides the freed size. Collapsing the two is defect D4.
   out may be null (no-op). */
void isaac_anm2_reset_teardown_plan(uint32_t layer_state_7c,
                                    uint32_t count_before,
                                    uint32_t count_after,
                                    IsaacAnm2ResetTeardownPlan* out);

/* Whole-Reset residual classification. out may be null (no-op). */
void isaac_anm2_reset_plan(int32_t filename_size_10,
                           uint32_t layer_state_7c,
                           uint32_t count_before,
                           uint32_t count_after,
                           IsaacAnm2ResetPlan* out);

/* The pure half of ANM2::Reset: every field write the PE performs on the
   receiver, at the exact offset, WIDTH and value, in PE order.

   obj points at a 0x114-byte ANM2 image. name_heap / anim_heap are the
   pointers the two std::strings would dereference when their capacity is
   >= 0x10; they are ignored on the SSO path. The four *_bits arguments are the
   raw 32-bit words loaded from 0x00c7b640 / 0x00c7b644 / 0x00c3793c /
   0x00c37940 and are copied bit-for-bit (movss), never rounded.

   Deliberately NOT written by this helper, because the PE never writes them
   here: bytes 0x001..0x00f and 0x019..0x027 (SSO tails), 0x030..0x06f (owned
   by the two 0x00408830 host calls), 0x071..0x073, 0x102..0x103, 0x10a..0x10b.
   obj may be null (no-op). */
void isaac_anm2_reset_apply_fields(uint8_t* obj,
                                   uint8_t* name_heap,
                                   uint8_t* anim_heap,
                                   uint32_t offset_x_bits,
                                   uint32_t offset_y_bits,
                                   uint32_t scale_x_bits,
                                   uint32_t scale_y_bits);

/* ---------- AL: ANM2::GetLayer(int) (VA 0x0040b220) ---------- */

/* `test esi,esi ; js miss` then `cmp esi,[edi+0x80] ; jl ok`. Both compares
   are SIGNED (defect D2) and the upper bound is STRICT. */
int32_t isaac_anm2_layer_index_in_range(int32_t index, int32_t count);

/* `lea eax,[esi+esi*4] ; shl eax,5` â€” index * 0xa0 with 32-bit wrap. */
uint32_t isaac_anm2_layer_byte_offset(int32_t index);

/* Full plan. count_pre is the load at VA 0x0040b24e; count_post is the
   SEPARATE re-read at VA 0x0040b275 after the logger call, and base_post is
   *(void**)(this+0x7c) read at VA 0x0040b283 (also after the call). On the
   in-range fast path the PE jumps straight to 0x0040b27d, so in_range_post is
   forced to 1 there. On a still-out-of-range miss the return value is the
   shared function-local static at 0x00c7f630, never null (defect D1).
   out may be null (no-op). */
void isaac_anm2_get_layer_plan(int32_t index,
                               int32_t count_pre,
                               int32_t count_post,
                               uint32_t base_post,
                               IsaacAnm2GetLayerPlan* out);

/* ---------- ALN: ANM2::GetLayer(const char*) (VA 0x0040b430) ---------- */

/* `test ebx,ebx ; je return_null` on the once-folded layer count. */
int32_t isaac_anm2_layer_walk_enter(uint32_t count);

/* `inc esi ; cmp esi,ebx ; jb loop` â€” UNSIGNED, against the count that was
   read ONCE before the loop (defect D2). */
int32_t isaac_anm2_layer_walk_continue(uint32_t next_index, uint32_t count);

/* Linear scan for a layer whose LayerData name matches. layer_base points at
   element 0; elements are 0xa0 apart; element+0 is the LayerData pointer and
   the name std::string lives at layerData+8. A null LayerData substitutes the
   empty literal at 0x00b1a4ec instead of faulting.
   Returns the matching index, or -1. Null base or count 0 -> -1. */
int32_t isaac_anm2_find_layer_index_by_name(const uint8_t* layer_base,
                                            uint32_t count,
                                            const char* name);

/* ---------- AD: AnimationData name walk (0x0040bcd0 / 0x0040a5d0) ---------- */

/* `imul eax, edi, 0x13c` â€” index * 0x13c with 32-bit wrap. */
uint32_t isaac_anm2_anim_data_byte_offset(int32_t index);

/* Same walk shape as the layer scan but stride 0x13c, and the element's own
   std::string sits at element+0 with NO null guard (defect D7).
   Returns the matching index, or -1. */
int32_t isaac_anm2_anim_data_index_by_name(const uint8_t* anim_base,
                                           uint32_t count,
                                           const char* name);

/* 0x0040a5d0 residual after the walk. reset_flag is the second stack argument
   (`cmp byte ptr [ebp+0xc], 0` at VA 0x0040a661): non-zero selects the
   0x00408830 apply, zero selects 0x00408970. A miss logs level 1 with
   "[warn] no animation named %s\n" and returns false.
   out may be null (no-op). */
void isaac_anm2_anim_apply_plan(int32_t found_index,
                                int32_t reset_flag,
                                IsaacAnm2AnimApplyPlan* out);

/* 0x0040a5d0 whole body: walk + apply routing in one pure decision. */
void isaac_anm2_walk_apply_plan(const uint8_t* anm2,
                                uint32_t name_addr,
                                int32_t reset_flag,
                                IsaacAnm2WalkApplyPlan* out);

/* 0x0040bd50 ANM2::Load store lane. Reads the layer/extras arrays through the
   GUEST pointers stored in the anm2 image ([anm2+0x7c] / [anm2+0x84]), exactly
   like the PE. load_graphics is a WIDE byte gate (cmp byte ptr [ebp+0xc],0).
   plan/apply fill the same IsaacAnm2LoadPlan; apply performs S1..S6 into the
   images (S4 re-walks; writes suppressed at null targets). */
void isaac_anm2_load_plan(const uint8_t* anm2,
                          int32_t load_graphics,
                          IsaacAnm2LoadPlan* out);
void isaac_anm2_load_apply(const uint8_t* anm2,
                           int32_t load_graphics,
                           IsaacAnm2LoadPlan* out);

/* ---------------- v51: ANM2::Load (0x0040bd50) frame laws ----------------
   Scalar exports for the load frame's pure decisions — the exact PE gates
   and name reads, re-transcribed in unit anm2-v51-load-depth. All params are
   uint32_t (no narrow ABI params). PE anchors:
     H1 gate 0x0040bd59 FULL-DWORD  [esi+0x10] != 0        -> path_present
     H2 gate 0x0040bd68 ADDRESS eq  esi != path            -> path_is_self
     H5 gate 0x0040bd8e LOW-BYTE    byte[ebp+0xc] != 0     -> graphics_needed
     composed PE-order count: 4 (H3+H4+H6a+H6b) + !self + present + graphics */
int32_t isaac_anm2_load_path_present(uint32_t filename_size);
int32_t isaac_anm2_load_path_is_self(uint32_t this_addr, uint32_t path_addr);
int32_t isaac_anm2_load_graphics_needed(uint32_t load_graphics);
int32_t isaac_anm2_load_frame_host_calls(uint32_t filename_size,
                                         uint32_t this_addr,
                                         uint32_t path_addr,
                                         uint32_t load_graphics);

/* S1 latch laws. latch_ready = the caller one-shot arm gate `cmp byte
   [recv+0x141],0 / jne` (0x0082ee9e): latch low byte CLEAR -> run. 
   latch_store_value = S1's BYTE store (0x0040bdb2): high bits of the pre
   value are preserved (0x100 drive -> 0x101). */
int32_t isaac_anm2_load_latch_ready(uint32_t latch);
uint32_t isaac_anm2_load_latch_store_value(uint32_t latch_pre);

/* Name-read / SSO-walk laws. layer_name_addr: layer = [anm2+0x7c] + i*0xa0
   (u32 wrap); data = u32(layer); data == 0 -> empty literal 0x00b1a4ec;
   else SSO-select (cap [data+8+0x14] < 0x10 -> data+8, else [data+8]).
   extra_name_addr: elem = [anm2+0x84] + k*0x18 (u32 wrap); SSO-select on the
   element itself — NO null guard (PE 0x0040be73). name_is_shadow consumes
   isaac_anm2_strcmp_inline BY REFERENCE vs the literal 0x00b1a6c0.
   name_is_star = byte[name_addr] == 0x2a ('*'). */
uint32_t isaac_anm2_load_layer_name_addr(const uint8_t* anm2,
                                         uint32_t layer_index);
uint32_t isaac_anm2_load_extra_name_addr(const uint8_t* anm2,
                                         uint32_t extra_index);
int32_t isaac_anm2_load_name_is_shadow(uint32_t name_addr);
int32_t isaac_anm2_load_name_is_star(uint32_t name_addr);
/* v52: 0x0040bc90 — state->animData null ? -1 : [animData+0x138] key dword. */
int32_t isaac_anm2_state_anim_key_dword(uint32_t state_addr);
/* v53: 0x00407ae0 — in-place field-pair exchange of two ANM2 images
   (left<ecx> / right<edx>), incl. the layer back-pointer fix-up loops. */
void isaac_anm2_swap_anm2(uint32_t left_addr, uint32_t right_addr);

/* ===== v54-band4: state-receiver frame set/get trio (0x00408ef0 /
   0x00408fc0 / 0x00408f70 — unit anm2-v54-band4) =====

   The v22/v23 SetLayerFrame / GetLayerFrame-int machines at the
   AnimationState subobject receiver (callers use lea ecx,[obj+0x78] /
   [obj+0x40] / computed base). All three bodies are byte-proven
   re-transcriptions (capstone 5.0.7); identify-zhl EMPTY for all three.
   Every call is a logger burst (typed-host by the standing split — the
   0xa112c0 level-gate is translated, the call is a platform primitive)
   or an ALREADY-TRANSLATED walk (0x00408b90 / 0x00408c10, v4) consumed BY
   REFERENCE. v22/v23 gate laws consumed BY REFERENCE; uint32 params, no
   byte loads anywhere in the three bodies, NO uint8_t scalars.  Not
   Update-wired.

   0x00408ef0..0x00408f65 (`ret 8`, int3 0x408f68; 30 lea-corrected
   callers, 0 E9): state SetLayerFrame (apply walk). Machine:
     test esi,esi ; js LOG1 / cmp esi,[anim+0x80] ; jl HIT   ; SIGNED
     LOG1: host 0xa112c0(0x10, 0xb1a564 "LayerId out of bounds\n")
     test esi,esi ; js END              ; SIGNED re-test
     re-read [state+0] / [anim+0x80] ; cmp ; jge END
     data=[state+4] ; mapped=[data+idx*4+0x38]  ; DEREF before null test
     data==0 || mapped<0 || mapped>=[data+0x1c] -> LOG2
     LOG2: host 0xa112c0(0x10, 0xb1a4f0 "id out of bounds\n") — the
           walk's own entry gate pre-fired; the walk re-fires it
     [state+8 + mapped*4] = 0 ; call 0x00408b90 (xmm2=cvtdq2ps(frame))
   Equivalent to v22 0x40a7e0 with receiver = state and NO top
   [this+0x34] entry gate (so log1 is NOT gated by data — it fires for
   any out-of-range index). data==0 with in-range index faults at the
   deref — unobservable; folded: no walk (v22 needed convention).

   0x00408fc0..0x00409023 (`ret 8`, int3 0x409026; 2 callers): state
   null-layer frame setter. Machine:
     test esi,esi ; js LOG1 / cmp esi,[anim+0x88] ; jl SKIP  ; SIGNED
     LOG1: host 0xa112c0(0x10, 0xb1a57c "layerId out of bounds\n")
     NO re-test — falls through with the same index
     data=[state+4] ; data==0 || index<0 || index>=[data+0x24] -> LOG2
     LOG2: host 0xa112c0(0x10, 0xb1a4f0)  (data==0 test PRECEDES derefs)
     [state+0xc + idx*4] = 0 ; call 0x00408c10 (xmm2=cvtdq2ps(frame))
     UNCONDITIONAL tail: even after LOG1/LOG2 the store and the walk run
     (the walk then re-logs and faults internally — its own landed law
     documents faults_at_list_base).

   0x00408f70..0x00408fb5 (`ret 4`, int3 0x408fb8; 1 caller): state
   GetLayerFrame-int. Machine:
     test esi,esi ; js LOG1 / cmp esi,[anim+0x80] ; jl HIT  ; SIGNED
     LOG1: host 0xa112c0(0x10, 0xb1a564)
     test esi,esi ; js OOB / re-read count80 ; jge OOB
     data=[state+4] ; mapped=[data+idx*4+0x38] (UNGUARDED deref)
     eax = [state+8 + mapped*4] ; ret 4
     OOB: NO xor eax,eax (unlike v23 0x40a8a0) — leftover register: anim
     ptr on the jge path, the logger's return on the js path. The law
     pins 0 for both OOB paths — HARNESS CONVENTION (the logger-return
     arm is unrepresentable in a pure law; the single caller 0x807223
     consumes the result only under a bounds-valid guard). */

typedef struct IsaacAnm2StateSetLayerFramePlan {
  int32_t entered;      /* 1 for a non-null state image */
  int32_t needs_log;    /* !(0<=index<count80) — 0xa112c0(0x10, 0xb1a564) */
  int32_t needs_walk;   /* 0<=index<count80 && [state+4]!=0 — 0x408b90 runs */
  int32_t walk_index;   /* mapped [data + index*4 + 0x38]; 0 if !needs_walk */
  uint32_t frame_bits;  /* cvtdq2ps(SIGNED frame) */
} IsaacAnm2StateSetLayerFramePlan;

typedef struct IsaacAnm2StateSetNullFramePlan {
  int32_t entered;       /* 1 for a non-null state image */
  int32_t needs_log_1;   /* !(0<=index<count88) — 0xa112c0(0x10, 0xb1a57c) */
  int32_t needs_log_2;   /* data==0 || index<0 || index >= [data+0x24]
                            — 0xa112c0(0x10, 0xb1a4f0), walk gate pre-fire */
  int32_t needs_walk;    /* ALWAYS 1 when entered — the 0x408c10 call is
                            unconditional (even after LOG1/LOG2) */
  int32_t walk_index;    /* RAW index (may be negative after LOG paths) */
  uint32_t frame_bits;   /* cvtdq2ps(SIGNED frame) */
} IsaacAnm2StateSetNullFramePlan;

typedef struct IsaacAnm2StateGetLayerFramePlan {
  int32_t entered;       /* 1 for a non-null state image */
  int32_t needs_log;     /* !(0<=index<count80) — 0xa112c0(0x10, 0xb1a564) */
  int32_t in_range;      /* post-log re-test: 0<=index<count80 (re-read) */
  int32_t result;        /* frames[mapped] on hit; 0 on any OOB path
                            (harness convention — machine leaves anim ptr /
                            logger return; caller never consumes it) */
} IsaacAnm2StateGetLayerFramePlan;

/* v54-band4 constants. All offsets are state/anim-data-relative. */
enum {
  ISAAC_ANM2_STATE_SET_LAYER_FRAME_VA = 0x00408ef0u,   /* identify-zhl EMPTY */
  ISAAC_ANM2_STATE_SET_LAYER_FRAME_END_VA = 0x00408f65u, /* `ret 8` */
  ISAAC_ANM2_STATE_SET_LAYER_FRAME_BODY_BYTES = 0x76,   /* 0x408ef0..0x408f65 */
  ISAAC_ANM2_STATE_SET_LAYER_FRAME_CALLSITE_COUNT = 30, /* lea-corrected */
  ISAAC_ANM2_STATE_SET_LAYER_FRAME_COUNT_OFF = 0x80,    /* SIGNED [anim+0x80] */
  ISAAC_ANM2_STATE_SET_LAYER_FRAME_MAP_OFF = 0x38,      /* [data + idx*4 + 0x38] */
  ISAAC_ANM2_STATE_SET_LAYER_FRAME_DATA_COUNT_OFF = 0x1c, /* [data+0x1c] */
  ISAAC_ANM2_STATE_SET_LAYER_FRAME_WALK_VA = 0x00408b90u, /* already-translated */
  ISAAC_ANM2_STATE_SET_LAYER_FRAME_LOG_STR_VA = 0x00b1a564u, /* "LayerId out of bounds\n" */
  ISAAC_ANM2_STATE_SET_LAYER_FRAME_LOG_LEVEL = 0x10,
  ISAAC_ANM2_STATE_SET_NULL_FRAME_VA = 0x00408fc0u,     /* identify-zhl EMPTY */
  ISAAC_ANM2_STATE_SET_NULL_FRAME_END_VA = 0x00409023u, /* `ret 8` */
  ISAAC_ANM2_STATE_SET_NULL_FRAME_BODY_BYTES = 0x64,    /* 0x408fc0..0x409023 */
  ISAAC_ANM2_STATE_SET_NULL_FRAME_CALLSITE_COUNT = 2,
  ISAAC_ANM2_STATE_SET_NULL_FRAME_COUNT_OFF = 0x88,     /* SIGNED [anim+0x88] */
  ISAAC_ANM2_STATE_SET_NULL_FRAME_DATA_COUNT_OFF = 0x24, /* [data+0x24] */
  ISAAC_ANM2_STATE_SET_NULL_FRAME_WALK_VA = 0x00408c10u, /* already-translated */
  ISAAC_ANM2_STATE_SET_NULL_FRAME_LOG_STR_VA = 0x00b1a57cu, /* "layerId out of bounds\n" */
  ISAAC_ANM2_STATE_SET_NULL_FRAME_LOG2_STR_VA = 0x00b1a4f0u, /* "id out of bounds\n" */
  ISAAC_ANM2_STATE_SET_NULL_FRAME_LOG_LEVEL = 0x10,
  ISAAC_ANM2_STATE_GET_LAYER_FRAME_VA = 0x00408f70u,    /* identify-zhl EMPTY */
  ISAAC_ANM2_STATE_GET_LAYER_FRAME_END_VA = 0x00408fb5u, /* `ret 4` */
  ISAAC_ANM2_STATE_GET_LAYER_FRAME_BODY_BYTES = 0x46,   /* 0x408f70..0x408fb5 */
  ISAAC_ANM2_STATE_GET_LAYER_FRAME_CALLSITE_COUNT = 1,
  ISAAC_ANM2_STATE_GET_LAYER_FRAME_COUNT_OFF = 0x80,    /* SIGNED [anim+0x80] */
  ISAAC_ANM2_STATE_GET_LAYER_FRAME_MAP_OFF = 0x38,      /* [data + idx*4 + 0x38] */
  ISAAC_ANM2_STATE_GET_LAYER_FRAME_FRAMES_OFF = 0x08,   /* [state+8] frame array */
  ISAAC_ANM2_STATE_GET_LAYER_FRAME_LOG_STR_VA = 0x00b1a564u, /* "LayerId out of bounds\n" */
  ISAAC_ANM2_STATE_GET_LAYER_FRAME_LOG_LEVEL = 0x10,
};

/* needed(data_dword): FULL-dword test (0x100 IS needed) — same law as
   v22/v23, consumed BY REFERENCE. The hit-path map deref is unguarded on
   the machine; a null data with an in-range index faults (unobservable),
   folded: no walk. */
int32_t isaac_anm2_state_set_layer_frame_needed(uint32_t data_dword);

/* SIGNED in-range: index >= 0 && index < count. Same law as v22. */
int32_t isaac_anm2_state_set_layer_frame_in_range(int32_t index,
                                                  int32_t count);

/* 0x00408ef0 plan. layer is the raw SIGNED [ebp+8]; frame the raw SIGNED
   [ebp+0xc] (cvtdq2ps bits). Log1 fires for ANY out-of-range index (no
   top data gate — the machine has none). count80 read once; the machine's
   post-log re-read equals it (log is a typed-host primitive, no guest
   mutation). 0x00408b90 consumed BY REFERENCE; 0xa112c0 bound logs are
   standing-logger-split host residuals. */
void isaac_anm2_state_set_layer_frame_plan(uint8_t* state,
                                           int32_t layer,
                                           int32_t frame,
                                           IsaacAnm2StateSetLayerFramePlan* out);

/* needed(data_dword): FULL-dword test — same law as v22/v23. */
int32_t isaac_anm2_state_set_null_frame_needed(uint32_t data_dword);

/* SIGNED in-range vs [anim+0x88]: index >= 0 && index < count. Same law. */
int32_t isaac_anm2_state_set_null_frame_in_range(int32_t index,
                                                 int32_t count);

/* 0x00408fc0 plan. index is the raw SIGNED [ebp+8]; frame the raw SIGNED
   [ebp+0xc]. No post-log re-test on the MACHINE — log1 is followed by the
   data section unconditionally. The tail (store + 0x408c10 call) runs
   even after log1/log2; needs_walk is 1 whenever entered and walk_index
   is the RAW index. 0x00408c10 consumed BY REFERENCE; both 0xa112c0
   bursts are standing-logger-split host residuals. */
void isaac_anm2_state_set_null_frame_plan(uint8_t* state,
                                          int32_t index,
                                          int32_t frame,
                                          IsaacAnm2StateSetNullFramePlan* out);

/* needed(data_dword): FULL-dword test — same law as v22/v23; used for the
   hit-path only (data==0 with in-range index faults: unobservable). */
int32_t isaac_anm2_state_get_layer_frame_needed(uint32_t data_dword);

/* SIGNED in-range vs [anim+0x80]: index >= 0 && index < count. Same law. */
int32_t isaac_anm2_state_get_layer_frame_in_range(int32_t index,
                                                  int32_t count);

/* 0x00408f70 plan. index is the raw SIGNED [ebp+8]. result on the hit
   path is [frames + mapped*4] with mapped = [data + index*4 + 0x38] (the
   deref is unguarded on the machine; a null data/index fault is
   unobservable, folded to result 0). OOB result is pinned 0 — HARNESS
   CONVENTION: the machine leaves the anim pointer on the jge path and the
   logger's return on the js path (unrepresentable; the single caller
   0x807223 consumes the result only under a bounds-valid guard). */
void isaac_anm2_state_get_layer_frame_plan(uint8_t* state,
                                           int32_t index,
                                           IsaacAnm2StateGetLayerFramePlan* out);

/* ================= v54-cache: filename-cache family (0x0040e5d0 FIND /
   0x0040ea10 load-one gate / 0x0040ea50 load-into-map — unit
   anm2-v54-cache) ================ */

/* The three cache paths of the ANM2 filename-cache (globals 0xc798b8..
   0xc798c0 begin/end/cap; containers 0xc78ee0 / 0xc78ee8; the key hash
   0x00a159d0; insert 0x0040ed50; APPLY_ANIM 0x0040e520; Manager::
   LoadImage 0x009588a0). All identities re-verified THIS unit
   (identify-zhl EMPTY for 0x40e5d0/0x40ea10/0x40ea50/0x40ed50/0x40e520/
   0xa159d0; 0x9588a0 exact ZHL 48 B; 0x6fd350 exact ZHL 5 B
   Game::IsPaused — weak, host query). Line-by-line transcriptions in
   section-notes/anm2-v54-cache/NOTES.md.

   0x0040e5d0..0x0040e738 (`ret 4`, int3 0x40e73b; 3 lea-corrected
   callers): filename-cache FIND — maintenance gate ((end-begin) < 4,
   `test eax,0xfffffffc`), the slot scan (stride 4, UNSIGNED loop bounds,
   end RE-READ per loop-back), the per-probe found decision
   (node != end && byte[node+0xd]==0 && key >= u32[node+0x10] — the
   tree _Isnil flag at +0xd, the key dword at +0x10), stop-on-found,
   `setne al` return.
   0x0040ea10..0x0040ea41 (`ret 4`, int3 0x40ea44; 1 caller 0x52c8c9):
   load-one gate — FIND(name); found -> skip; else host query 0x6fd350 +
   LoadImage 0x9588a0(out, name) + APPLY_ANIM 0x40e520. The APPLY_ANIM
   STORE CONDITION = FIND says not found.
   0x0040ea50..0x0040ed47 (`ret 4`, SEH 0x00af0ee0; 1 caller 0x69bac5):
   cache load-into-map — byte[name]==0 early exit; maintenance gate;
   slot scan (container 0xc78ee0); not-found -> build name SSO string +
   INSERT host 0x0040ed50 + RE-FIND (same decision; the empty-cache
   re-find key is 0 and MISSES — machine defect reproduced D-v54-1);
   layer loop over the found node: base+0x18 / count+0x1c RE-READ per
   iteration, UNSIGNED bounds, stride 0x38, name SSO slot at element
   +0x20 (cap at +0x34), per-layer FIND gate -> LoadImage + APPLY_ANIM
   pair when not found.
   0x0040ed50 INSERT: SEH 0x00af118f, 0x267ec-byte frame, 2 callers
   (0x40ddf9, 0x40ec3f), receiver [0xc7169c]+0x2a6c0, NO single ret in
   the first 0x2000 decoded bytes (shared tails 0x413b0f/0x410d56/
   0x410d5e) — TYPED-HOST (not peeled).

   Host ledger (all re-identified this unit): 0x9588a0 Manager::LoadImage
   (exact ZHL 48 B, receiver [0xc71678]); 0x40e520 APPLY_ANIM (ret 8,
   SEH 0xaf0e8d, map 0xc78ee8 + 0x40c3b0 + callbacks); 0x416440 /
   0x416490 _Tree lower_bound walks (node +0x0d _Isnil / +0x10 key);
   [0xb18938] strncpy_s + [0xb18930] strcat_s (IAT hints 144/133,
   import-directory-resolved THIS unit) — the probe normalization is
   HOST, the key hash 0x00a159d0 is PURE and landed; 0xa16060 pop /
   0x4149d0 dtor / 0x6fd350 query are HOST.

   Byte-gate discipline: every byte read (byte[name], byte[node+0xd],
   hash chars) is load_guest_u32(p) & 0xffu; NO uint8_t scalar
   variables anywhere in the v54-cache laws. */

typedef struct IsaacAnm2CacheFindScan {
  uint32_t slot_count;    /* (end - begin) >> 2 (u32); 0 when end < begin */
  uint32_t probed;        /* slots probed before the stop */
  int32_t found;          /* 1 when a probe decision matched */
  uint32_t found_slot;    /* index of the matched probe; 0 when not found */
  uint32_t probe_stride;  /* 4 */
} IsaacAnm2CacheFindScan;

typedef struct IsaacAnm2LoadOnePlan {
  int32_t entered;         /* 1 for a non-null name */
  int32_t found;           /* FIND result (host), the gate input */
  int32_t skip;            /* found != 0: the host block is skipped */
  uint32_t name_addr;      /* the pushed FIND argument */
  int32_t find_count;      /* 1 — FIND always runs */
  int32_t query_count;     /* skip ? 0 : 1 (0x6fd350) */
  int32_t load_count;      /* skip ? 0 : 1 (LoadImage 0x9588a0) */
  int32_t apply_count;     /* skip ? 0 : 1 (APPLY_ANIM 0x40e520) */
  uint32_t find_va;        /* 0x0040e5d0 */
  uint32_t query_va;       /* 0x006fd350 (Game::IsPaused ZHL 5 B, weak) */
  uint32_t load_image_va;  /* 0x009588a0 (Manager::LoadImage, exact ZHL) */
  uint32_t apply_va;       /* 0x0040e520 */
  uint32_t receiver_global;/* 0x00c71678 — the LoadImage receiver global */
} IsaacAnm2LoadOnePlan;

typedef struct IsaacAnm2LoadMapPlan {
  int32_t entered;           /* 1 for a non-null name */
  int32_t empty_gate;        /* byte[name] == 0 -> early exit */
  int32_t maintenance_gate;  /* (end - begin) < 4 (u32) */
  uint32_t slot_count;       /* from begin/end, same as the FIND scan */
  uint32_t probed;           /* slots probed before the cache stop */
  int32_t cache_found;       /* the slot scan found a node */
  uint32_t cache_found_slot; /* index of the matched probe; 0 when none */
  int32_t insert;            /* !cache_found: host 0x0040ed50 runs */
  int32_t refind_found;      /* the re-find decision (host node+key) */
  uint32_t refind_node;      /* re-find node result (host, fed) */
  uint32_t refind_key;       /* re-find key (the last probe key; 0 when
                                 no slot probed — the D-v54-1 miss) */
  uint32_t container_end;    /* the end-sentinel dword [0xc78ee0] */
  uint32_t node_base;        /* u32[refind/scan node + 0x18] re-read law */
  uint32_t node_count;       /* u32[node + 0x1c] re-read law */
  uint32_t layers_scanned;   /* min(node_count, layer_avail) */
  int32_t load_pair_count;   /* layers with a !found FIND flag */
  int32_t apply_count;       /* = load_pair_count (APPLY_ANIM per pair) */
  int32_t skipped_layers;    /* layers with a found FIND flag */
  uint32_t insert_va;        /* 0x0040ed50 (typed host) */
  uint32_t find_va;          /* 0x0040e5d0 */
  uint32_t load_image_va;    /* 0x009588a0 */
  uint32_t apply_va;         /* 0x0040e520 */
  uint32_t query_va;         /* 0x006fd350 */
  uint32_t receiver_global;  /* 0x00c71678 */
  uint32_t layer_stride;     /* 0x38 */
  uint32_t layer_name_off;   /* element + 0x20 */
  uint32_t layer_cap_off;    /* name slot + 0x14 */
  uint32_t cache_slots_va;   /* 0x00c798b8 — the maintenance sentinel */
} IsaacAnm2LoadMapPlan;

/* v54-cache constants. */
enum {
  ISAAC_ANM2_CACHE_FIND_VA = 0x0040e5d0u,
  ISAAC_ANM2_CACHE_FIND_END_VA = 0x0040e738u,   /* `ret 4` */
  ISAAC_ANM2_CACHE_FIND_BODY_BYTES = 363,       /* 0x40e5d0..0x40e73b */
  ISAAC_ANM2_CACHE_FIND_CALLSITE_COUNT = 3,     /* lea-corrected direct e8 */
  ISAAC_ANM2_LOAD_ONE_VA = 0x0040ea10u,
  ISAAC_ANM2_LOAD_ONE_END_VA = 0x0040ea41u,     /* `ret 4` */
  ISAAC_ANM2_LOAD_ONE_BODY_BYTES = 52,
  ISAAC_ANM2_LOAD_ONE_CALLSITE_COUNT = 1,
  ISAAC_ANM2_LOAD_MAP_VA = 0x0040ea50u,
  ISAAC_ANM2_LOAD_MAP_END_VA = 0x0040ed47u,     /* `ret 4` */
  ISAAC_ANM2_LOAD_MAP_BODY_BYTES = 762,
  ISAAC_ANM2_LOAD_MAP_CALLSITE_COUNT = 1,
  ISAAC_ANM2_LOAD_MAP_SEH_FRAME = 0x00af0ee0u,
  ISAAC_ANM2_APPLY_ANIM_VA = 0x0040e520u,       /* HOST (pinned v8 as
                                                   LOADGRAPHICS_APPLY_ANIM) */
  ISAAC_ANM2_APPLY_ANIM_BODY_BYTES = 164,
  ISAAC_ANM2_APPLY_ANIM_CALLSITE_COUNT = 5,
  ISAAC_ANM2_INSERT_VA = 0x0040ed50u,           /* TYPED-HOST */
  ISAAC_ANM2_INSERT_SEH_FRAME = 0x00af118fu,
  ISAAC_ANM2_INSERT_CALLSITE_COUNT = 2,
  ISAAC_ANM2_FILENAME_HASH_VA = 0x00a159d0u,    /* PURE (landed) */
  ISAAC_ANM2_FILENAME_HASH_SEED = 0x1505u,      /* djb2-style seed 5381 */
  ISAAC_ANM2_FILENAME_HASH_CASE_DELTA = 0x20u,  /* 'A'-'Z' -> lower */
  ISAAC_ANM2_FILENAME_HASH_BACKSLASH = 0x5cu,
  ISAAC_ANM2_FILENAME_HASH_SLASH = 0x2fu,
  ISAAC_ANM2_CACHE_SLOTS_VA = 0x00c798b8u,      /* begin; end +8, cap +8 */
  ISAAC_ANM2_CACHE_MAINT_GATE_MASK = 0xfffffffcu,
  ISAAC_ANM2_CACHE_PROBE_STRIDE = 4,
  ISAAC_ANM2_CACHE_CONTAINER_LOAD = 0x00c78ee0u, /* load-into-map map */
  ISAAC_ANM2_CACHE_CONTAINER_FIND = 0x00c78ee8u, /* FIND/APPLY map */
  ISAAC_ANM2_CACHE_RECEIVER_GLOBAL = 0x00c71678u,
  ISAAC_ANM2_MAP_NODE_ISNIL_OFF = 0x0du,
  ISAAC_ANM2_MAP_NODE_KEY_OFF = 0x10u,
  ISAAC_ANM2_MAP_NODE_LAYERS_OFF = 0x18u,       /* name-array base */
  ISAAC_ANM2_MAP_NODE_COUNT_OFF = 0x1cu,        /* layer count */
  ISAAC_ANM2_LOADMAP_LAYER_STRIDE = 0x38u,
  ISAAC_ANM2_LOADMAP_LAYER_NAME_OFF = 0x20u,    /* element + 0x20 */
  ISAAC_ANM2_LOADMAP_LAYER_CAP_OFF = 0x14u,     /* name slot + 0x14 */
};

/* v54-cache law exports (all scalar params uint32_t — NO_NARROW_PARAMS guards
   in the cpp; byte reads via load_guest_u32(p) & 0xffu throughout). */
uint32_t isaac_anm2_filename_hash(const uint8_t* name_guest);
int32_t isaac_anm2_cache_probe_found(uint32_t node, uint32_t key,
                                     uint32_t container_end);
void isaac_anm2_cache_find_scan(uint32_t cache_begin, uint32_t cache_end,
                                const uint32_t* probe_keys,
                                const uint32_t* probe_nodes,
                                uint32_t probe_avail,
                                uint32_t container_end,
                                IsaacAnm2CacheFindScan* out);
int32_t isaac_anm2_cache_maintenance_gate(uint32_t cache_begin,
                                          uint32_t cache_end);
void isaac_anm2_cache_maintenance_apply(uint32_t pop_node, uint8_t* cache);
void isaac_anm2_load_one_plan(uint32_t name_addr, int32_t find_found,
                              IsaacAnm2LoadOnePlan* out);
void isaac_anm2_load_map_plan(const uint8_t* name,
                              uint32_t cache_begin, uint32_t cache_end,
                              const uint32_t* probe_keys,
                              const uint32_t* probe_nodes,
                              uint32_t probe_avail, uint32_t container_end,
                              uint32_t refind_node, uint32_t refind_key,
                              const uint32_t* layer_found,
                              uint32_t layer_avail,
                              IsaacAnm2LoadMapPlan* out);
uint32_t isaac_anm2_loadmap_layer_name_addr(uint32_t layers_guest,
                                            uint32_t layer_index);

/* ================= v55: 0x00407690 ANM2::construct_from_copy (unit
   anm2-v55-407690; copy-ctor store lane + decision laws) ================ */

/* The ANM2 COPY CONSTRUCTOR (ZHL ANM2.zhl name `construct_from_copy(ANM2*
   right)`; the catalog pattern `538bdc83ec0883e4f883c404...` matches this
   body's prologue 39/40 concrete bytes — frame byte 0x1c vs 0x14, build
   drift; identify-zhl exactMatch stays empty, near-match recorded in the
   unit NOTES §2). 976 B, `ret 4` at 0x00407a5d, SEH 0x00af09d3, cookie
   0xbf93b4, **40 corrected direct callers** (windowed-capstone resync
   census, this unit; every site byte-verified e8 rel32; the
   v53-shipped census-callers-fixed.py heuristic prints 39 — one
   approximate-rule gap, documented). Call sites build 0x114-byte stack
   temps (`sub esp,0x114; mov ecx,esp; push <src>; call` — 0x976364,
   0x839400, 0x8ae3c7, 0x7abec6, 0x78b71e ...) then often SwapANM2+Reset
   teardown (0x407e90 pair) — the REPENTOGON replace idiom
   (PickupUtils: copySprite.construct_from_copy(&pickup._sprite);
   Isaac::SwapANM2(...)).

   dst = receiver (ecx), src = arg1. Pure store lane (apply): Stage-1
   scalar block 0x70..0x110 with the ctor-specific ZERO slots 0x7c
   (pre-alloc _layerState), 0x94/0x98 (_offset), 0x110 (_bitflags);
   Stage-3 vector base store [dst+0x7c] = vector_base (host-fed) +
   UNSIGNED count fence + per-layer field copies (dword +0, bytes
   0x30..0x33, dwords 0x34..0x44, self-guarded 44-B block 0x48..0x73,
   byte 0x74, dwords 0x78..0x94) + owner back-ptr at element+4, with
   per-iteration re-reads of [src+0x80]. Decision laws (plan): the
   cache-fetch gate on byte[src+0x109] (_loaded) -> host 0x40e110 (the
   same cache fetch ANM2::Load 0x40bd50 calls), the alloc-size overflow
   law (count*0xa0+4, seto/setb wrap — D family), alloc_pending :=
   vector_base != 0 (host alloc result; fail with count > 0 is the
   machine's fault lane, folded to processed 0), the string SSO select
   (layer +8, cap +0x14 >= 0x10 -> heap ptr). Host (counted, not
   executed): 0x40cf50 x2 string ctors, 0x4086e0 x2 state ctors,
   0xa0f4e0 alloc, 0xaef5c4 __ehvec_ctor (layer ctor 0x4081d0 / dtor
   0x407a60), per-layer 0x40ccd0 assign + 0x408590 getter + 0x40c3b0
   KAGE_SmartPointer_ImageBase::swap (EXACT ZHL 52 B, re-run this unit)
   + the sprite notify chain on u32[src_i+0x9c] (vtbl slot 0xc + the
   [0xc7163c] registry — the notification receiver [ebp-0x24] is the
   0x408590 out-pair's second dword, i.e. the source layer's inner
   sprite object; resolved this unit). */
typedef struct IsaacAnm2CopyCtorPlan {
  int32_t entered;             /* 1 for non-null dst && src images */
  int32_t zeroed_7c;           /* dword [dst+0x7c] = 0 (pre-alloc) */
  int32_t zeroed_94;           /* dword [dst+0x94] = 0 (_offset.x) */
  int32_t zeroed_98;           /* dword [dst+0x98] = 0 (_offset.y) */
  int32_t zeroed_110;          /* dword [dst+0x110] = 0 (_bitflags) */
  int32_t src_loaded;          /* byte[src+0x109] != 0 */
  int32_t cache_fetch_count;   /* src_loaded ? 1 : 0 (host 0x40e110) */
  uint32_t layer_count;        /* u32[src+0x80] raw (UNSIGNED fence) */
  uint32_t alloc_size;         /* overflow law: count*0xa0+4 (D wrap) */
  int32_t alloc_pending;       /* vector_base != 0 (host alloc result) */
  uint32_t vector_base;        /* host-fed base (alloc result + 4) */
  int32_t processed_count;     /* count != 0 && alloc_pending ? count : 0 */
  int32_t string_ctor_count;   /* 2 x 0x40cf50 */
  int32_t state_ctor_count;    /* 2 x 0x4086e0 */
  int32_t alloc_count;         /* 1 x 0xa0f4e0 (even for count == 0) */
  int32_t vector_ctor_count;   /* alloc_pending ? 1 : 0 (0xaef5c4) */
  int32_t layer_string_assigns;/* 0x40ccd0 per processed layer */
  int32_t layer_getter_count;  /* 0x408590 per processed layer */
  int32_t kage_swap_count;     /* 0x40c3b0 per processed layer */
  int32_t notify_chain_count;  /* layers with u32[src_i+0x9c] != 0 */
  uint32_t cache_fetch_va;     /* 0x0040e110 */
  uint32_t layer_stride;       /* 0xa0 */
  uint32_t layer_owner_off;    /* element + 0x04 */
  uint32_t layer_sprite_pair_off;  /* element + 0x98 */
  uint32_t layer_sprite_inner_off; /* element + 0x9c */
  uint32_t registry_global_va; /* 0x00c7163c */
} IsaacAnm2CopyCtorPlan;

typedef struct IsaacAnm2StringSrc {
  uint32_t ptr;   /* SSO buffer (layer + 8) or heap pointer */
  uint32_t len;   /* u32[layer+8+0x10] */
  uint32_t cap;   /* u32[layer+8+0x14] */
} IsaacAnm2StringSrc;

/* v55 constants. */
enum {
  ISAAC_ANM2_COPYCTOR_VA = 0x00407690u,
  ISAAC_ANM2_COPYCTOR_END_VA = 0x00407a5du,    /* `ret 4` */
  ISAAC_ANM2_COPYCTOR_BODY_BYTES = 976,        /* 0x407690..0x407a60 */
  ISAAC_ANM2_COPYCTOR_CALLSITE_COUNT = 40,     /* windowed-capstone census */
  ISAAC_ANM2_COPYCTOR_SEH_FRAME = 0x00af09d3u,
  ISAAC_ANM2_COPYCTOR_ALLOC_HEAD = 4,          /* count header dword */
  ISAAC_ANM2_COPYCTOR_STRIDE = 0xa0u,          /* layer element stride */
  ISAAC_ANM2_COPYCTOR_OWNER_OFF = 0x04u,       /* element + 4 back-ptr */
  ISAAC_ANM2_COPYCTOR_PAIR_OFF = 0x98u,        /* KAGE sprite pair */
  ISAAC_ANM2_COPYCTOR_INNER_OFF = 0x9cu,       /* pair inner object */
  ISAAC_ANM2_COPYCTOR_LOADED_OFF = 0x109u,     /* byte _loaded */
  ISAAC_ANM2_COPYCTOR_STR_OFF = 0x08u,         /* layer element name slot */
  ISAAC_ANM2_COPYCTOR_STR_LEN_OFF = 0x10u,     /* name slot + 0x10 (size) */
  ISAAC_ANM2_COPYCTOR_STR_CAP_OFF = 0x14u,     /* name slot + 0x14 (cap) */
  ISAAC_ANM2_COPYCTOR_LAYER_FIELDS_OFF = 0x30u, /* per-layer field block */
  ISAAC_ANM2_COPYCTOR_BLOCK_44 = 0x2cu,        /* self-guarded 44-B block */
  ISAAC_ANM2_COPYCTOR_CACHE_FETCH_VA = 0x0040e110u, /* HOST (v7 pin) */
  ISAAC_ANM2_COPYCTOR_REGISTRY_VA = 0x00c7163cu,
  ISAAC_ANM2_COPYCTOR_STRING_CTOR_VA = 0x0040cf50u,  /* HOST */
  ISAAC_ANM2_COPYCTOR_STATE_CTOR_VA = 0x004086e0u,   /* HOST */
  ISAAC_ANM2_COPYCTOR_ALLOC_VA = 0x00a0f4e0u,        /* HOST */
  ISAAC_ANM2_COPYCTOR_VECTOR_CTOR_VA = 0x00aef5c4u,  /* HOST __ehvec_ctor */
  ISAAC_ANM2_COPYCTOR_LAYER_CTOR_VA = 0x004081d0u,   /* HOST */
  ISAAC_ANM2_COPYCTOR_LAYER_DTOR_VA = 0x00407a60u,   /* HOST (v1 pin
                                        ISAAC_ANM2_HOST_VA_LAYER_ELEM_DTOR) */
  ISAAC_ANM2_COPYCTOR_GETTER_VA = 0x00408590u,       /* HOST (v8 pin) */
  ISAAC_ANM2_COPYCTOR_STRING_ASSIGN_VA = 0x0040ccd0u, /* HOST (v7 pin) */
  ISAAC_ANM2_COPYCTOR_KAGE_SWAP_VA = 0x0040c3b0u,  /* EXACT ZHL 52 B, HOST */
};

/* v55 law exports (all scalar params uint32_t — NO_NARROW_PARAMS guards
   in the cpp; byte reads via load_guest_u32(p) & 0xffu throughout). */
void isaac_anm2_copyctor_plan(uint32_t dst_addr, uint32_t src_addr,
                              uint32_t vector_base,
                              IsaacAnm2CopyCtorPlan* out);
void isaac_anm2_copyctor_apply(uint32_t dst_addr, uint32_t src_addr,
                               uint32_t vector_base);
void isaac_anm2_copyctor_layer_string_src(uint32_t layer_addr,
                                          IsaacAnm2StringSrc* out);

/* ================= v56: 0x0040e470 AnmCache-clear teardown (unit
   anm2-v56-regiona; cache-container clear walk — decision laws) ========== */

/* The ANM2 filename-cache container CLEAR (log "AnmCache: Clear %u.\n"
   at 0x00b1b2c0). 0x0040e470..0x0040e510 (`ret`), 161 B, 56 insns, 7 E8,
   0 indirect, no SEH/cookie; ebx-frame prologue. **3 direct E8 callers**
   (raw-byte rel32 census this unit: 0x68fd57, 0x8f8c6f, 0x9b248f; 0 E9,
   0 addr-taken). identify-zhl EMPTY (address-stable).

   The walk uses the SAME container global the v54-cache family pinned as
   ISAAC_ANM2_CACHE_CONTAINER_LOAD (0xc78ee0): head = u32[0xc78ee0]; first
   node = u32[head+0] (head->_Next); empty iff first == head; per node:
   gate = u32[node+0x50] == 0 -> teardown path, != 0 -> skip path (FULL
   dword cmp 0x40e4a0 — not a byte gate); terminator node == head
   (0x40e504 cmp esi,edi ; jne). D-family re-read: head is RE-READ from
   u32[container] after EVERY teardown step (0x40e4ee) and NOT after a
   skip (the skip path keeps the stale head — reproduced, not corrected).

   Teardown path host leaves (counted, not executed — the advance
   0x414a80 is shared container machinery per the v51 census precedent,
   so the walk is host-fed like v54's find_scan):
     log 0xa112c0(1, 0xb1b2c0, u32[node+0x10])   ; the %u = cache id
     string teardown 0x40d850(node+0x14)
     iterator advance 0x414a80
     list erase 0x415d20(container 0xc78ee0, node) -> eax = removed node
     string tidy 0x40d040(node+0x38)
     operator delete 0xaef15c(node, 0x54)
   Skip path host leaf: advance 0x414a80 only.

   Node layout (this body's reads): size 0x54, gate dword +0x50, log id
   +0x10, string A +0x14 (0x40d850), string B +0x38 (0x40d040). The
   +0xd isnil byte of the v54 map nodes is NOT read by this body. */
typedef struct IsaacAnm2CacheClearStepPlan {
  int32_t entered;             /* node_addr != 0 */
  int32_t gate;                /* u32[node+0x50] == 0 -> teardown */
  uint32_t log_id;             /* u32[node+0x10] (the %u) */
  int32_t walk_done;           /* node == head */
  uint32_t head_reload_value;  /* teardown: u32[container]; skip: head */
  int32_t head_reloaded;       /* 1 on teardown path (0x40e4ee re-read) */
  int32_t log_count;           /* teardown: 1 x 0xa112c0 */
  int32_t string14_count;      /* teardown: 1 x 0x40d850 */
  int32_t advance_count;       /* 1 always (0x414a80) */
  int32_t erase_count;         /* teardown: 1 x 0x415d20 */
  int32_t tidy38_count;        /* teardown: 1 x 0x40d040 */
  int32_t delete_count;        /* teardown: 1 x 0xaef15c */
  uint32_t delete_size;        /* 0x54 */
  uint32_t node_size;          /* 0x54 */
  uint32_t gate_off;           /* 0x50 */
  uint32_t log_id_off;         /* 0x10 */
  uint32_t str_a_off;          /* 0x14 */
  uint32_t str_b_off;          /* 0x38 */
  uint32_t log_fmt_va;         /* 0x00b1b2c0 "AnmCache: Clear %u.\n" */
  uint32_t log_level;          /* 1 */
} IsaacAnm2CacheClearStepPlan; /* 20 x 4 = 80 bytes */

/* v56 constants. */
enum {
  ISAAC_ANM2_CACHE_CLEAR_VA = 0x0040e470u,
  ISAAC_ANM2_CACHE_CLEAR_END_VA = 0x0040e510u,  /* `ret` */
  ISAAC_ANM2_CACHE_CLEAR_BODY_BYTES = 0xa1,     /* 0x40e470..0x40e510 */
  ISAAC_ANM2_CACHE_CLEAR_CALLSITE_COUNT = 3,    /* raw-byte rel32 census */
  ISAAC_ANM2_CACHE_CLEAR_CALLER_FIRST_VA = 0x0068fd57u,
  ISAAC_ANM2_CACHE_CLEAR_CALLER_LAST_VA = 0x009b248fu,
  ISAAC_ANM2_CACHE_CLEAR_CONTAINER_VA = 0x00c78ee0u, /* v54 pin value */
  ISAAC_ANM2_CACHE_CLEAR_NODE_SIZE = 0x54u,
  ISAAC_ANM2_CACHE_CLEAR_GATE_OFF = 0x50u,
  ISAAC_ANM2_CACHE_CLEAR_LOG_ID_OFF = 0x10u,
  ISAAC_ANM2_CACHE_CLEAR_STR_A_OFF = 0x14u,
  ISAAC_ANM2_CACHE_CLEAR_STR_B_OFF = 0x38u,
  ISAAC_ANM2_CACHE_CLEAR_LOG_FMT_VA = 0x00b1b2c0u, /* "AnmCache: Clear %u.\n" */
  ISAAC_ANM2_CACHE_CLEAR_LOG_LEVEL = 1,
  ISAAC_ANM2_CACHE_CLEAR_LOG_VA = 0x00a112c0u,         /* HOST */
  ISAAC_ANM2_CACHE_CLEAR_STRING_TEARDOWN_VA = 0x0040d850u, /* HOST */
  ISAAC_ANM2_CACHE_CLEAR_ADVANCE_VA = 0x00414a80u,     /* HOST */
  ISAAC_ANM2_CACHE_CLEAR_ERASE_VA = 0x00415d20u,       /* HOST */
  ISAAC_ANM2_CACHE_CLEAR_STRING_TIDY_VA = 0x0040d040u, /* HOST */
  ISAAC_ANM2_CACHE_CLEAR_DELETE_VA = 0x00aef15cu       /* HOST */
};

/* v56 law exports (all scalar params uint32_t — NO_NARROW_PARAMS guards
   in the cpp; no byte reads in this body, gates are FULL-dword). */
uint32_t isaac_anm2_cache_clear_head(uint32_t container_addr);
uint32_t isaac_anm2_cache_clear_first_node(uint32_t head_addr);
int32_t isaac_anm2_cache_clear_empty(uint32_t first_addr,
                                     uint32_t head_addr);
int32_t isaac_anm2_cache_clear_gate(uint32_t node_addr);
uint32_t isaac_anm2_cache_clear_log_id(uint32_t node_addr);
int32_t isaac_anm2_cache_clear_walk_done(uint32_t node_addr,
                                         uint32_t head_addr);
void isaac_anm2_cache_clear_step_plan(uint32_t container_addr,
                                      uint32_t node_addr,
                                      uint32_t head_addr,
                                      IsaacAnm2CacheClearStepPlan* out);

/* ============ v57: 0x0040c890 global hash-table grow/insert ================
   (unit anm2-v57-frontier; the standing allocator decision "raw alloc =
   platform primitive" lifts the old host fence — the alloc/memcpy/memset/
   free/throw leaves stay TYPED-HOST, the hash DECISIONS are pure laws).

   Body 0x0040c890..0x0040ca60, `ret 4` @ 0x0040ca5d, 0x1d0 = 464 bytes,
   74 insns, 8 E8, no SEH/cookie, ebp-frame prologue. **6 direct E8
   callers** (raw-byte rel32 census this unit; 0 E9, 0 imm32 addr-taken):
   0x6250dd, 0x78bf13, 0x78c260, 0x78c4f6, 0x78c6d3, 0x78d323. Stack arg
   [ebp+8] = pointer to the 0x2c-byte VALUE record copied into the node.

   Globals (the SAME four dwords the v46 probe reads; roles in the
   insert: base = slot-pointer array, cur = slot count/capacity cursor,
   end_lo = masked cursor/old capacity, end_hi = live-entry count):
     base = u32[0xc78db4], cur = u32[0xc78db8], end_lo = u32[0xc78dbc],
     end_hi = u32[0xc78dc0].
   Writer census this unit: base/cur are written ONLY inside this body
   (0x40c9db/0x40c9e7); end_lo by 0x40c9ff here + the manager remove
   paths (0x626030/0x78c2b6/0x78c614/0x78c65d/0x78c72e/0x78d3a6, which
   zero it when the count empties); end_hi inc ONLY at 0x40ca54 here,
   dec by the manager removes. All RUNTIME inputs (v46/v82 flags
   precedent) — host supplies each tick, the laws take scalars.

   Decision laws (machine-exact, all unsigned unless noted):

   - GROW GATE 0x40c8a9 `cmp edx,eax ; ja skip` with eax = end_hi + 1:
     grow iff cur <= end_hi + 1 (unsigned).
   - CAPACITY 0x40c8af..0x40c8e2: eax = cur == 0 ? 1 : cur; loop
     { delta = eax - cur (u32 wrap); exit when delta >= 1 && eax >= 8;
       else if (0x5d174d5 - eax) < eax (u32) -> THROW A (0x40ca65 ->
       0x40cad0); eax *= 2 }. Cap check 0x40c8f2: eax > 0x3fffffff ->
     THROW B (0x40ca60 -> 0x40cee0). delta = new_capacity - cur.
   - SLOT 0x40c9fd..0x40ca08: end_lo := end_lo & (cur-1) (the 0x40c9ff
     MASK-STORE); slot = ((end_lo & (cur-1)) + end_hi) & (cur-1).
   - PROBE 0x40ca0f: u32[base + slot*4] == 0 -> EMPTY: node =
     0xa0f4c0(0x2c) then u32[base + slot*4] = node; non-zero -> the
     existing node is REUSED (overwritten). NO linear probe loop —
     collision = overwrite.
   - COPY 0x40ca36..0x40ca51: 0x2c bytes from [arg] to the node;
     end_hi++ (0x40ca54) on BOTH paths.

   Grow data motion (0x40c930..0x40c9b6; memmove 0xaf08bd, memset
   0xaf05e5): tail move first: memmove(dst = new_base + old_cap*4,
   src = old_base + old_cap*4, n = (cur - old_cap)*4) with old_cap =
   end_lo (the PRE-grow value); then CASE A (old_cap <= delta, unsigned
   `ja` at 0x40c949):
     memmove(new_base + cur*4, old_base, old_cap*4)
     memset(new_base + cur*4 + old_cap*4, 0, (delta - old_cap)*4)
     memset(new_base, 0, old_cap*4)
   CASE B (old_cap > delta):
     memmove(new_base + cur*4, old_base, delta*4)
     memmove(new_base, old_base + delta*4, (old_cap - delta)*4)
     memset(new_base + (old_cap - delta)*4, 0, delta*4)
   Then (0x40c9bb..0x40c9ed): if old_base != 0 -> 0x40c740(old_base,
   size = cur ELEMENTS — read before the cur store); base := new_base;
   cur := cur + delta (the effective cur used by the slot law).
   All spans are pure u32 arithmetic exactly as the machine computes
   them (dst = new_base + cur*4 uses the saved [ebp-0x14] = new_base +
   old_cap*4 + tail_bytes). */

typedef struct IsaacAnm2HashGrowMotionPlan {
  int32_t entered;             /* 1 */
  int32_t case_b;              /* 1 iff old_cap > delta (0x40c949 ja) */
  int32_t move_count;          /* memmove spans: 2 (A) or 3 (B) */
  uint32_t move0_dst;          /* new_base + old_cap*4 (tail) */
  uint32_t move0_src;          /* old_base + old_cap*4 (tail) */
  uint32_t move0_count;        /* (cur - old_cap)*4 (u32 wrap) */
  uint32_t move1_dst;          /* A: new_base + cur*4; B: new_base + cur*4 */
  uint32_t move1_src;          /* A: old_base;       B: old_base */
  uint32_t move1_count;        /* A: old_cap*4;      B: delta*4 */
  uint32_t move2_dst;          /* B only: new_base */
  uint32_t move2_src;          /* B only: old_base + delta*4 */
  uint32_t move2_count;        /* B only: (old_cap - delta)*4 */
  int32_t zero_count;          /* memset spans: 2 (A) or 1 (B) */
  uint32_t zero0_dst;          /* A: new_base+cur*4+old_cap*4; B: new_base+(old_cap-delta)*4 */
  uint32_t zero0_count;        /* A: (delta - old_cap)*4;      B: delta*4 */
  uint32_t zero1_dst;          /* A only: new_base */
  uint32_t zero1_count;        /* A only: old_cap*4 */
  int32_t free_needed;         /* old_base != 0 */
  uint32_t free_size;          /* cur (ELEMENTS; 0x40c740 x4 internally) */
  uint32_t base_store;         /* new_base (0x40c9db) */
  uint32_t cur_store;          /* cur + delta = new capacity (0x40c9e7) */
} IsaacAnm2HashGrowMotionPlan; /* 21 x 4 = 84 bytes */

typedef struct IsaacAnm2HashInsertPlan {
  int32_t entered;             /* 1 */
  uint32_t base;               /* [0xc78db4] runtime */
  uint32_t cur;                /* [0xc78db8] runtime */
  uint32_t end_lo;             /* [0xc78dbc] runtime */
  uint32_t end_hi;             /* [0xc78dc0] runtime */
  int32_t grow_gate;           /* 1 iff cur <= end_hi + 1 (u32) */
  uint32_t capacity;           /* new_capacity when gate; 0 when not */
  uint32_t delta;              /* capacity - cur (u32 wrap) */
  int32_t overflow_throw;      /* (0x5d174d5 - eax) < eax at a doubling */
  int32_t cap_throw;           /* capacity > 0x3fffffff (aborts before alloc) */
  uint32_t alloc_bytes;        /* capacity * 4 (0x40c8f8 lea) */
  int32_t alloc_count;         /* 0x40cf00: 1 when gate && no throw */
  int32_t case_b;              /* motion case B flag (0 when no grow) */
  int32_t move_count;          /* memmove spans (0 when no grow) */
  int32_t zero_count;          /* memset spans (0 when no grow) */
  int32_t free_needed;         /* old_base != 0 && grew */
  uint32_t free_size;          /* cur (elements; 0x40c740 x4 internally) */
  int32_t free_count;          /* 0x40c740: 1 when free_needed */
  uint32_t base_eff;           /* new_base after grow; entry base on skip */
  int32_t base_updated;        /* 1 when gate (0x40c9db store happened) */
  uint32_t cur_eff;            /* cur + delta after grow; entry cur on skip */
  int32_t cur_updated;         /* 1 when gate (0x40c9e7 store happened) */
  uint32_t slot;               /* ((end_lo & (cur_eff-1)) + end_hi) & (cur_eff-1) */
  uint32_t end_lo_store;       /* end_lo & (cur_eff-1) (0x40c9ff MASK-STORE) */
  int32_t slot_empty;          /* u32[base_eff + slot*4] == 0 (0x40ca0f) */
  int32_t node_alloc_count;    /* 0xa0f4c0: 1 when slot_empty */
  uint32_t node_alloc_size;    /* 0x2c */
  uint32_t copy_size;          /* 0x2c (0x40ca36..0x40ca51) */
  int32_t end_hi_inc;          /* 1 (0x40ca54 inc — BOTH paths) */
  int32_t memcpy_count;        /* move_count */
  int32_t memset_count;        /* zero_count */
  int32_t host_call_count;     /* alloc+memcpy+memset+free+node_alloc+throws */
  int32_t pure_complete;       /* 1 */
  uint32_t alloc_va;           /* 0x0040cf00 (aligned alloc, HOST) */
  uint32_t node_alloc_va;      /* 0x00a0f4c0 (raw new, HOST) */
  uint32_t memcpy_va;          /* 0x00af08bd (memmove, HOST) */
  uint32_t memset_va;          /* 0x00af05e5 (memset, HOST) */
  uint32_t free_va;            /* 0x0040c740 (aligned release, HOST) */
  uint32_t throw_a_va;         /* 0x0040cad0 (overflow, via 0x40ca65) */
  uint32_t throw_b_va;         /* 0x0040cee0 (cap, via 0x40ca60) */
} IsaacAnm2HashInsertPlan;     /* 40 x 4 = 160 bytes */

/* v57 constants. */
enum {
  ISAAC_ANM2_HASH_INSERT_VA = 0x0040c890u,
  ISAAC_ANM2_HASH_INSERT_END_VA = 0x0040ca5du,  /* `ret 4` */
  ISAAC_ANM2_HASH_INSERT_BODY_BYTES = 0x1d0,    /* 464 B */
  ISAAC_ANM2_HASH_INSERT_CALLSITE_COUNT = 6,    /* raw-byte rel32 census */
  ISAAC_ANM2_HASH_INSERT_CALLER_FIRST_VA = 0x006250ddu,
  ISAAC_ANM2_HASH_INSERT_CALLER_LAST_VA = 0x0078d323u,
  ISAAC_ANM2_HASH_INSERT_MIN_CAPACITY = 8,
  ISAAC_ANM2_HASH_INSERT_CAP_GUARD = 0x5d174d5u,   /* doubling overflow */
  ISAAC_ANM2_HASH_INSERT_CAP_MAX = 0x3fffffffu,    /* pre-alloc cap */
  ISAAC_ANM2_HASH_INSERT_SLOT_STRIDE = 4,
  ISAAC_ANM2_HASH_INSERT_NODE_SIZE = 0x2cu,        /* node + copy size */
  ISAAC_ANM2_HASH_INSERT_ALLOC_VA = 0x0040cf00u,   /* HOST (platform) */
  ISAAC_ANM2_HASH_INSERT_NODE_ALLOC_VA = 0x00a0f4c0u, /* HOST (platform) */
  ISAAC_ANM2_HASH_INSERT_MEMCPY_VA = 0x00af08bdu, /* HOST memmove */
  ISAAC_ANM2_HASH_INSERT_MEMSET_VA = 0x00af05e5u, /* HOST memset */
  ISAAC_ANM2_HASH_INSERT_FREE_VA = 0x0040c740u,   /* HOST aligned release */
  ISAAC_ANM2_HASH_INSERT_THROW_A_VA = 0x0040cad0u,/* overflow throw */
  ISAAC_ANM2_HASH_INSERT_THROW_B_VA = 0x0040cee0u /* cap throw */
  /* table globals reuse the v46 pins:
     ISAAC_ANM2_HASH_PROBE_BASE_GLOBAL 0xc78db4
     ISAAC_ANM2_HASH_PROBE_KEY_GLOBAL  0xc78db8
     ISAAC_ANM2_HASH_PROBE_END_LO_GLOBAL 0xc78dbc
     ISAAC_ANM2_HASH_PROBE_END_HI_GLOBAL 0xc78dc0 */
};

/* v57 law exports (all scalar params uint32_t; NO uint8_t anywhere;
   this body has NO byte reads, so the & 0xffu template is vacuous here).
   new_base in the insert plan = the 0x40cf00 alloc result (HOST-fed,
   v54/v56 host-fed-inputs precedent; 0 when no grow happened). */
uint32_t isaac_anm2_hash_grow_gate(uint32_t cur, uint32_t end_hi);
uint32_t isaac_anm2_hash_grow_capacity(uint32_t cur);
uint32_t isaac_anm2_hash_insert_slot(uint32_t end_lo, uint32_t cur,
                                     uint32_t end_hi);
int32_t isaac_anm2_hash_slot_empty(uint32_t base, uint32_t slot);
void isaac_anm2_hash_grow_motion_plan(uint32_t old_base, uint32_t old_cap,
                                      uint32_t cur, uint32_t delta,
                                      uint32_t new_base,
                                      IsaacAnm2HashGrowMotionPlan* out);
void isaac_anm2_hash_insert_plan(uint32_t base, uint32_t cur,
                                 uint32_t end_lo, uint32_t end_hi,
                                 uint32_t new_base,
                                 IsaacAnm2HashInsertPlan* out);

/* ============ v58: 0x0040c2d0 string empty + 0x0040c2f0 string clear =====
   (unit anm2-v58-string-gate; the next verify-open band bodies after the
   v57 hash insert — the v98 gapscan3 OPEN rows at 0x40c2d0/0x40c2f0 were
   still unclaimed by ANY family file at unit start; 0x40c2e0 is the
   size() twin but is LUA-FENCED: ISAAC_LUA_INSTALL_HELPER_20_REAL_FN_VA
   pins it as GetMissingCharacterOverride's real_fn — NOT opened here).

   Both are MSVC std::basic_string SSO members on the ANM2 band (size +0x10,
   cap +0x14, chars/ptr +0 — same layout as the v38/v42/v43/v45 landed
   string laws). Fully pure: ZERO E8, 0 indirect, no SEH/cookie, no globals.

   0x0040c2d0 `empty()` — 8 bytes, `ret` @ 0x0040c2d7 (`cmp dword
   [ecx+0x10],0 ; sete al ; ret`): FULL-dword size test, result byte 0/1.
   **4 direct E8 callers** (raw-byte rel32 census this unit; 0 E9, 0 imm32
   addr-taken): 0x5dbe88, 0x5dc0cb, 0x6919b1, 0x7891d7.

   0x0040c2f0 `clear()` — 30 bytes 0x0040c2f0..0x0040c30d, exits `ret` @
   0x0040c302 (HEAP path) and @ 0x0040c30d (SSO path; int3 pad 0x40c30e):
     cmp dword [ecx+0x14], 0x10   ; cap gate
     jb 0x40c303                  ; UNSIGNED below -> SSO path (cap < 0x10)
     mov eax, [ecx]               ; buf = heap ptr
     mov dword [ecx+0x10], 0      ; size := 0        (0x40c2f8, BOTH paths)
     mov byte [eax], 0            ; buf[0] := 0
     ret
     mov dword [ecx+0x10], 0      ; size := 0        (0x40c303, SSO path)
     mov byte [ecx], 0            ; inline buf[0] := 0
     ret
   **7 direct E8 callers** (raw-byte rel32 census this unit; 0 E9, 0 imm32):
   0x687897, 0x689e12, 0x68bb1e, 0x789204, 0x8cd2ee, 0x8ddab6, 0x94ce31.
   The SIZE store is identical on both paths (dword [self+0x10] := 0);
   only the first-BYTE address differs (heap buf vs inline self). The
   `& 0xffu` template is vacuous for empty (dword test) and for clear
   (no byte READS); the byte WRITE address is selected by the cap gate. */

/* v58 constants. */
enum {
  ISAAC_ANM2_STRING_EMPTY_VA = 0x0040c2d0u,
  ISAAC_ANM2_STRING_EMPTY_END_VA = 0x0040c2d7u,  /* `ret` */
  ISAAC_ANM2_STRING_EMPTY_BODY_BYTES = 0x8,      /* 8 B */
  ISAAC_ANM2_STRING_EMPTY_CALLSITE_COUNT = 4,    /* raw-byte rel32 census */
  ISAAC_ANM2_STRING_EMPTY_CALLER_FIRST_VA = 0x005dbe88u,
  ISAAC_ANM2_STRING_EMPTY_CALLER_LAST_VA = 0x007891d7u,
  ISAAC_ANM2_STRING_SIZE_OFF = 0x10,             /* [this+0x10] size */
  ISAAC_ANM2_STRING_CAP_OFF = 0x14,              /* [this+0x14] cap */
  ISAAC_ANM2_STRING_CLEAR_VA = 0x0040c2f0u,
  ISAAC_ANM2_STRING_CLEAR_END_VA = 0x0040c30du,  /* SSO-path `ret` */
  ISAAC_ANM2_STRING_CLEAR_BODY_BYTES = 0x1e,     /* 30 B */
  ISAAC_ANM2_STRING_CLEAR_CALLSITE_COUNT = 7,    /* raw-byte rel32 census */
  ISAAC_ANM2_STRING_CLEAR_CALLER_FIRST_VA = 0x00687897u,
  ISAAC_ANM2_STRING_CLEAR_CALLER_LAST_VA = 0x0094ce31u
  /* the cap gate reuses the standing ISAAC_ANM2_SSO_CAPACITY_THRESHOLD
     0x10 (v3-era pin; `jb` = UNSIGNED strictly below -> SSO path). */
};

/* v58 law exports (all scalar params uint32_t; NO uint8_t anywhere; the
   byte-WRITE address in clear is selected by the cap gate — SSO writes
   inline [self], heap writes [buf] = u32[self]). */

/* 0x0040c2d0 plan-free scalar law: 1 iff size == 0 (0x40c2d4 sete al;
   the FULL dword [self+0x10] is compared — no byte masking anywhere). */
int32_t isaac_anm2_string_empty(uint32_t size);

/* 0x0040c2f0 plan. heap_path iff cap >= 0x10 (UNSIGNED; the 0x40c2f4
   `jb` skips the heap arm for strictly-below caps). size_store is 1 on
   BOTH paths (identical dword [self+0x10] := 0); byte_store 1 with the
   address = heap_path ? buf : self (the machine's byte [eax] vs byte
   [ecx]). Zero host calls; fully pure mutator. */
typedef struct IsaacAnm2StringClearPlan {
  int32_t entered;             /* 1 */
  uint32_t cap;                /* [self+0x14] raw (runtime input) */
  uint32_t buf;                /* [self] raw (heap ptr; SSO self) */
  uint32_t self;               /* receiver base */
  int32_t heap_path;           /* 1 iff cap >= 0x10 (0x40c2f4 jb) */
  int32_t size_store;          /* 1 — dword [self+0x10] := 0, BOTH paths */
  uint32_t size_off;           /* 0x10 (ISAAC_ANM2_STRING_SIZE_OFF) */
  uint32_t size_value;         /* 0 */
  int32_t byte_store;          /* 1 — byte := 0 at byte_addr */
  uint32_t byte_addr;          /* heap_path ? buf : self (0x40c2ff/0x40c30a) */
  uint32_t byte_value;         /* 0 */
  int32_t pure_complete;       /* 1 — zero host calls */
} IsaacAnm2StringClearPlan;    /* 12 x 4 = 48 bytes */

void isaac_anm2_string_clear_plan(uint32_t cap, uint32_t buf, uint32_t self,
                                  IsaacAnm2StringClearPlan* out);

/* ---------------- v59-gapscan: 0x0040bcb0 SSO AD name-walk wrapper
   (unit anm2-v59-gapscan; laws LAND -> ABI 59) --------------------------
   Complete small pure helper found by the 0x40b000..0x40c000 gap-scan:
   an SSO-select wrapper whose tail-jump is the family's v1/v6 pure walk
   0x40bcd0. Zero host calls in the combined body. Full evidence in
   section-notes/anm2-v59-gapscan/NOTES.md.

   0x0040bcb0..0x40bcc6 (12 B + 5 B `jmp 0x40bcd0` @ 0x40bcc2; plain ebp
   frame, NO SEH/cookie); int3 0x40bcc7..0x40bccf; next body 0x40bcd0
   (the v1/v6 walk, 0x40bcd0..0x40bd43 `ret 4`, pure). Body:
     mov eax,[ebp+8]               ; arg1 = std::string* guest addr
     cmp dword [eax+0x14],0x10     ; SSO cap gate — UNSIGNED strict below
     jb INLINE                     ; cap < 0x10 -> chars = str
     mov eax,[eax]                 ; else chars = *(u32*)str (heap)
     mov [ebp+8],eax               ; [ebp+8] REWRITTEN to the chars
     pop ebp ; jmp 0x40bcd0        ; tail-jump, ecx UNCHANGED (anm2)
   Walk (0x40bcd0, re-read this unit): count=[ecx+0x78] (_animCount),
   base=[ecx+0x74] (_animData); count==0 -> 0. Loop i in [0,count)
   UNSIGNED (`cmp edi,ebx ; jb`): elem = base + i*0x13c, name SSO at
   elem+0, 2-byte inline strcmp vs [ebp+8]; match -> return
   base + i*0x13c (ELEMENT ADDRESS); exhausted -> return 0. D7 kept:
   NO null guard on the element string.
   Census (windowed rel32 + push-imm32 scan): E8 = 4 (0x77fe78, 0x77ff03,
   0x77ffbe, 0x788d0c), E9 = 0, imm32 = 0. identify-zhl EMPTY. */
enum {
  ISAAC_ANM2_ANIM_DATA_SSO_WALK_VA = 0x0040bcb0u,
  ISAAC_ANM2_ANIM_DATA_SSO_WALK_END_VA = 0x0040bcc6u, /* after the 5-B jmp */
  ISAAC_ANM2_ANIM_DATA_SSO_WALK_BODY_BYTES = 0x17,    /* 23 B */
  ISAAC_ANM2_ANIM_DATA_SSO_WALK_CALLSITE_COUNT = 4,
  ISAAC_ANM2_ANIM_DATA_SSO_WALK_CALLER_FIRST_VA = 0x0077fe78u,
  ISAAC_ANM2_ANIM_DATA_SSO_WALK_CALLER_LAST_VA = 0x00788d0cu,
  ISAAC_ANM2_ANIM_DATA_SSO_WALK_WALK_VA = 0x0040bcd0u /* the v1/v6 walk */
};

/* Scalar note: the SSO select at 0x40bcb6..0x40bcbe IS the standing
   isaac_anm2_sso_uses_heap / isaac_anm2_sso_data_ptr law — no scalar
   duplicate is exported. The plan below is the new law surface. */
typedef struct IsaacAnm2AnimDataSsoWalkPlan {
  int32_t entered;             /* 1 when anm2 non-null */
  uint32_t str_addr;           /* the raw arg (std::string* guest addr) */
  uint32_t cap;                /* [str+0x14] raw (runtime input) */
  int32_t heap_used;           /* 1 iff cap >= 0x10 (0x40bcba jb) */
  uint32_t name_addr;          /* heap_used ? *(u32*)str : str (the chars
                                  installed into [ebp+8]) */
  uint32_t count;              /* [anm2+0x78] raw; 0 when not entered */
  uint32_t base;               /* [anm2+0x74] raw; 0 when not entered */
  int32_t found;               /* found_index >= 0 */
  int32_t found_index;         /* walk hit index; -1 on miss */
  uint32_t elem_byte_offset;   /* found ? found_index*0x13c : 0 */
  uint32_t result_ptr;         /* found ? base + found_index*0x13c : 0
                                  (the machine's return — element ADDRESS) */
  int32_t pure_complete;       /* 1 — zero host calls ALWAYS */
} IsaacAnm2AnimDataSsoWalkPlan;  /* 12 x 4 = 48 bytes */

void isaac_anm2_anim_data_sso_walk_plan(uint8_t* anm2,
                                        uint32_t str_addr,
                                        IsaacAnm2AnimDataSsoWalkPlan* out);

/* ---------------- v59-boundary: HOST seal rows (unit anm2-v59-boundary) --
   The v58 handoff's still-OPEN caller-bearing band bodies,
   verify-opened + bounded + census-backed, then SEALED as HOST. NO laws
   land (every body below is host-callee-only; nothing pure to
   translate), so ABI stays 58. Full per-row evidence in
   section-notes/anm2-v59-boundary/NOTES.md. All eight identity checks
   identify-zhl EMPTY (address-stable).

   0x00408170 ANM2::~ANM2 — SEH 0xaf0a50 + cookie; 5 unconditional
   teardowns: Reset(this) [v1 root] -> 0x4087a0(+0x50) -> 0x4087a0
   (+0x30) -> 0x40d040(+0x18) -> 0x40d040(this). Census: E8=0,
   E9=117 (thunk-adapter `jmp` stubs 0xaf1f16..0xb0feeb, this-adjust
   offsets 12..4364), 20 push-imm32 fn-ptr refs. Bounds 0x408170..
   0x4081c9, int3 0x4081ca..0x4081cf. Callees host: 0x407f10 (family
   root, itself never pure), 0x4087a0 (frame_opaque v57 pin), 0x40d040
   (frame_opaque v26 pin).

   0x0040d220 node raze — call 0x415ae0(this,[this->p+4]) [0x54-node
   _Tree release walk, shared container machinery, host] + operator
   delete 0xaef15c([this], 0x54). Census: E8=0, E9=1 @0xaf0da5.
   Bounds 0x40d220..0x40d23b, int3 0x40d23c..0x40d23f. v56 cache-node
   delete shape (0x54).

   0x0040db70 string-pair dtor — call 0x40d040(+0x20); tail jmp
   0x40d040(+8). Census: E8=0, E9=1 @0xb0aa46, 5 push-imm32
   eh-vec-dtor args. Bounds 0x40db70..0x40db83, int3 0x40db84..0x40db8f.

   0x0040d4c0 filename-cache container dtor (0xc78ee0 walk, 0x13c
   stride) — plain ebp frame; log 0xa112c0/0xb1b1ec, advance 0x414a80,
   eh-vec 0xaef638 (elem dtors 0x40db70/0x40c200), deletes 0xaef15c,
   free IAT 0xb187dc + 0xc7de78 accounting. Census: E8=1 @0x6f4343,
   E9=0. TYPED-HOST (0x40ed50 precedent). Bounds 0x40d4c0..0x40d845;
   folded 0-caller sibling stub 0x40d846..0x40d84d (jmp 0x40d7b6);
   int3 0x40d84e..0x40d84f.

   Supplementary observed (not in the handoff list, evidence in NOTES
   §5/§6): 0x0040d850 cache-node dtor leaf (3 E8; already the v56 host
   leaf pin). 0x0040d240 — v59's "unclaimed, next gap-scan candidate" —
   is SEALED by the follow-up unit anm2-v59-40d240 (see the next block). */

/* ---------------- v59-40d240: 0x0040d240 LANDED + Load-sibling census
   (unit anm2-v59-40d240) ------------------------------------------------
   Full evidence in section-notes/anm2-v59-40d240/NOTES.md. No laws land,
   ABI stays 58, targeted suite 257/257.

   0x0040d240 ANM2 registry flush + filename-cache container dtor
   (thiscall; this = the 0xc78ee0 container in both callers) — SEH
   0xaf0dd0 + cookie [0xbf93b4]; 197 insns; ret @0x40d46e, int3
   0x40d46f..0x40d47f, next body 0x40d480. Stage 1: flush registry
   [0xc78da4]..[0xc78da8] — Reset(this) [0x407f10, family root] + IAT
   free [0xb187dc] x4 with 0xc7de78(+0x30)/0xc7f618 64-bit accounting
   (+0x58/+0x5c/+0x38/+0x3c) + 0x40d040 x2 (+0x18, +0) +
   operator delete 0xaef15c(this, 0x114). Stage 2: cache container
   this+0 clear — node dtor 0x40d850(+0x14), advance 0x414a80, release
   0x415ae0. Stage 3: tree this+8 clear — vtbl indirect [eax+0xc] +
   [0xc7163c] registry notify + advance 0x414a80 + release 0x415800.
   Census: E8=2 (0x9ab700 = Isaac::Shutdown(), zhl exact 38 B, SEH
   0xaf12f0; 0xb15200 static uninit, SEH 0xaf0c50 — also the v59 row-2
   "0xb1526c" 0x415ae0 caller's home), E9=0, imm32=0. Callee evidence:
   0x415800 = _Tree release walk #2, SEH 0xaf1380, 0x415800..0x41589c,
   16 E8 (0x40d449, 0x41583c self, 0x83b7fb, 0x83b839, 0x83d746,
   0x84364d, 0x8d2aa9, 0x8d3341, 0x9efa60, 0x9efa97, 0x9efaba, 0xa11669,
   0xa116c6, 0xa11751, 0xa131b3, 0xb15245) — container machinery, host.
   Verdict: HOST (verify-open confirmed; no other family claims it).

   0x0040e110 filename-cache fetch (stdcall, ret 4; 0x40e110..0x40e2a3)
   — already pinned host here (ISAAC_ANM2_LOAD_HOST_VA_CACHE_FETCH) +
   exit v22 residual CF. Census: E8=3 (0x40bd89 ANM2::Load, 0x40beb1 the
   0x40bea0 sibling, 0x407866 the 0x407690 clone/copy fn, conditional on
   byte+0x109), E9=0, imm32=0.
   0x0040c000 ANM2::LoadGraphics (thiscall, ret 4; 0x40c000..0x40c1d6,
   SEH 0xaf0cc5) — already pinned host here (ISAAC_ANM2_LOAD_HOST_VA_
   GRAPHICS) + exit v23 residual CF. Census: E8=**102** (full list in
   NOTES §2b; the dominant `51 8d 4e 48 e8` shape = dead [ebp+8] arg +
   anm2 at +0x48; v8's "either callsite" wording was a dead-arg remark,
   NOT an exhaustive census), E9=0, imm32=0. Both rows: NOT translatable
   (record-22 v75/v77 holds ANM2::Load itself host). */

/* ---------------- v60-c380: 0x0040c380 string SSO default ctor LANDED
   + load-sibling census pins (unit anm2-v60-c380) ----------------------
   Full evidence in section-notes/anm2-v60-c380/NOTES.md. LAWS LAND ->
   ABI 59 -> 60.

   Wave-31 F3 re-verified the windowed rel32 census for the two Load
   siblings (raw scan == multi-offset-validated, no eliminations) and
   publishes them as explicit pins:

     0x0040e110 CACHE_FETCH: E8=3 (0x407866, 0x40bd89, 0x40beb1),
       E9=0, imm32=0.
     0x0040c000 GRAPHICS: E8=102 (0x40bd97 .. 0x9fc92f, full list in
       NOTES §1), E9=0, imm32=0.
   Both rows stay HOST pins (exit v22/v23 residual CF; the body VAs were
   pinned since v7 as ISAAC_ANM2_LOAD_HOST_VA_CACHE_FETCH/_GRAPHICS).

   Gap-scan of the remaining 0x40c000..0x40d000 band found the next
   verify-open PURE body: 0x0040c380 — the MSVC std::basic_string SSO
   default ctor (23 B, 0x40c380..0x40c396 `ret`; int3 0x40c397..0x40c39f;
   next body 0x40c3a0 is the LUA-fenced GetAlignment getter). Body:
     mov dword [ecx], 0          ; chars dword (+0) := 0
     mov eax, ecx                ; return this
     mov dword [ecx+0x10], 0     ; size := 0   (ANM2_STRING_SIZE_OFF)
     mov dword [ecx+0x14], 0xf   ; cap := 0xf  (ANM2_STRING_CAP_OFF)
     ret
   Zero E8, 0 indirect, no SEH/cookie/globals — CONSTANT stores only, no
   gates anywhere (the family byte-gate rule is vacuous here). Census:
   E8=0, E9=0, push-imm32 ADDR-TAKEN=16 (0x401255, 0x401597, 0x40eed1,
   0x40f4e4, 0x40f76a, 0x40f80c, 0x40fa9a, 0x42fa94, 0x6a712c, 0x6a714a,
   0x6f1f6a, 0x72f07d, 0x72f09b, 0x8e06eb, 0x8e0e39, 0x94f75e).
   identify-zhl EMPTY (address-stable).

   The second verify-open pure row in the band — 0x0040c5b0 pair ctor
   (mov [ecx],0; mov [ecx+4],0; ret; E8=0, imm32=5: 0x950c73, 0x9df4f0,
   0xa1a98f, 0xa1fa9b, 0xa219fb) — LANDED in the v61 unit (see
   ISAAC_ANM2_PAIR_CTOR_VA below); that unit's gap-scan re-confirmed
   0x40c5b0 as the ONLY remaining verify-open body in 0x40c300..0x40c890
   (0x40c3a0 GetAlignment and 0x40c2e0 size() stay LUA-FENCED; every other
   row in the band is landed-family or HOST). */

/* v60 constants. */
enum {
  ISAAC_ANM2_STRING_DEFAULT_CTOR_VA = 0x0040c380u,
  ISAAC_ANM2_STRING_DEFAULT_CTOR_END_VA = 0x0040c396u,  /* `ret` */
  ISAAC_ANM2_STRING_DEFAULT_CTOR_BODY_BYTES = 0x17,     /* 23 B */
  ISAAC_ANM2_STRING_DEFAULT_CTOR_CALLSITE_COUNT = 0,    /* windowed rel32 census */
  ISAAC_ANM2_STRING_DEFAULT_CTOR_ADDR_TAKEN = 16,       /* push-imm32 fn-ptr refs */
  ISAAC_ANM2_STRING_DEFAULT_CTOR_CAP_VALUE = 0xfu,      /* the stored SSO cap */
  /* Load-sibling census pins (wave-31 F3 re-verified windowed rel32):
     body VAs were pinned at v7 as ISAAC_ANM2_LOAD_HOST_VA_CACHE_FETCH
     (0x40e110) / ISAAC_ANM2_LOAD_HOST_VA_GRAPHICS (0x40c000); these pin
     the windowed caller censuses (E9=0, imm32=0 on both). */
  ISAAC_ANM2_LOAD_HOST_VA_CACHE_FETCH_CALLSITE_COUNT = 3,
  ISAAC_ANM2_LOAD_HOST_VA_CACHE_FETCH_CALLER_FIRST_VA = 0x00407866u,
  ISAAC_ANM2_LOAD_HOST_VA_CACHE_FETCH_CALLER_LAST_VA = 0x0040beb1u,
  ISAAC_ANM2_LOAD_HOST_VA_GRAPHICS_CALLSITE_COUNT = 102,
  ISAAC_ANM2_LOAD_HOST_VA_GRAPHICS_CALLER_FIRST_VA = 0x0040bd97u,
  ISAAC_ANM2_LOAD_HOST_VA_GRAPHICS_CALLER_LAST_VA = 0x009fc92fu
};

/* v60 law export (scalar param uint32_t; NO uint8_t anywhere; the body
   has NO gates — every store is a machine constant). */

/* 0x0040c380 plan. entered iff self != 0 (v42 posture); result = self
   (0x40c386 mov eax,ecx). The three dword stores are reported verbatim:
   chars dword [self+0] := 0, size [self+0x10] := 0, cap [self+0x14] :=
   0xf (0x40c380/0x40c388/0x40c38f). Zero host calls; pure_complete 1. */
typedef struct IsaacAnm2StringDefaultCtorPlan {
  int32_t entered;             /* 1 iff self != 0 */
  uint32_t self;               /* receiver base (guest address) */
  uint32_t result;             /* self (mov eax,ecx @ 0x40c386) */
  int32_t store_count;         /* 3 — the three constant dword stores */
  uint32_t chars_off;          /* 0 — dword [self+0x00] := 0 (0x40c380) */
  uint32_t chars_value;        /* 0 */
  uint32_t size_off;           /* 0x10 (ISAAC_ANM2_STRING_SIZE_OFF) */
  uint32_t size_value;         /* 0 (0x40c388) */
  uint32_t cap_off;            /* 0x14 (ISAAC_ANM2_STRING_CAP_OFF) */
  uint32_t cap_value;          /* 0xf (ISAAC_ANM2_STRING_DEFAULT_CTOR_CAP_VALUE) */
  int32_t pure_complete;       /* 1 — zero host calls */
  int32_t host_call_count;     /* 0 */
} IsaacAnm2StringDefaultCtorPlan; /* 12 x 4 = 48 bytes */

void isaac_anm2_string_default_ctor_plan(uint32_t self,
                                         IsaacAnm2StringDefaultCtorPlan* out);

/* ---------------------------------------------------------------------------
   v61-c5b0: 0x0040c5b0 2-dword pair ctor LANDED (PURE LAW).

   The last verify-open body in the 0x40c300..0x40c890 band (v60 §2 gap
   scan + this unit's re-scan; the other two open rows in the wider band,
   0x40c3a0 GetAlignment and 0x40c2e0 size(), are LUA-FENCED and NOT
   opened). Bounds 0x40c5b0..0x40c5bf (`ret` @ 0x40c5bf) = 15 bytes; no
   int3 after — 0x40c5c0 is the following vtbl-dtor cluster's first insn.
   Body (4 insns, 15 B):
     0x40c5b0 mov dword ptr [ecx], 0         ; dword [self+0] := 0
     0x40c5b6 mov eax, ecx                   ; return this
     0x40c5b8 mov dword ptr [ecx + 4], 0     ; dword [self+4] := 0
     0x40c5bf ret
   A 2-dword zero-init ctor (pointer-pair / std::pair / SSO first-8-bytes
   shape) sandwiched between the v8 CTOR_ANIM pin (0x40c550) and the
   vtbl-dtor cluster (0x40c5c0). Zero E8, zero E9, zero indirect refs, no
   SEH/cookie/globals — CONSTANT stores only, no gates, no byte reads
   anywhere (the family byte-gate rule is vacuous; NO_NARROW holds).
   identify-zhl EMPTY (address-stable; no ZHL name promoted).
   Census (this unit, windowed rel32 hit-12..hit-0 multi-offset capstone
   validation + push-imm32 0x68 scan, whole .text): CALLSITE_COUNT = 0,
   ADDR_TAKEN = 5 (0x950c73, 0x9df4f0, 0xa1a98f, 0xa1fa9b, 0xa219fb —
   byte-identical to the v60 §2a recorded list). The ctor is reached ONLY
   as an address-taken fn pointer (container/pair emplace shapes), never
   by a direct .text `call`. */

/* v61 constants. */
enum {
  ISAAC_ANM2_PAIR_CTOR_VA = 0x0040c5b0u,
  ISAAC_ANM2_PAIR_CTOR_END_VA = 0x0040c5bfu,  /* `ret` */
  ISAAC_ANM2_PAIR_CTOR_BODY_BYTES = 0xf,      /* 15 B */
  ISAAC_ANM2_PAIR_CTOR_CALLSITE_COUNT = 0,    /* windowed rel32 census */
  ISAAC_ANM2_PAIR_CTOR_ADDR_TAKEN = 5,        /* push-imm32 fn-ptr refs */
  ISAAC_ANM2_PAIR_CTOR_FIRST_OFF = 0x0u,      /* dword [self+0] store */
  ISAAC_ANM2_PAIR_CTOR_SECOND_OFF = 0x4u      /* dword [self+4] store */
};

/* v61 law export (scalar param uint32_t; NO uint8_t anywhere; the body
   has NO gates — every store is a machine constant). */

/* 0x0040c5b0 plan. entered iff self != 0 (v42 posture); result = self
   (0x40c5b6 mov eax,ecx). The two dword stores are reported verbatim:
   [self+0] := 0 (0x40c5b0) and [self+4] := 0 (0x40c5b8). Zero host
   calls; pure_complete 1. */
typedef struct IsaacAnm2PairCtorPlan {
  int32_t entered;             /* 1 iff self != 0 */
  uint32_t self;               /* receiver base (guest address) */
  uint32_t result;             /* self (mov eax,ecx @ 0x40c5b6) */
  int32_t store_count;         /* 2 — the two constant dword stores */
  uint32_t first_off;          /* 0 — dword [self+0x00] := 0 (0x40c5b0) */
  uint32_t first_value;        /* 0 */
  uint32_t second_off;         /* 4 — dword [self+0x04] := 0 (0x40c5b8) */
  uint32_t second_value;       /* 0 */
  int32_t pure_complete;       /* 1 — zero host calls */
  int32_t host_call_count;     /* 0 */
} IsaacAnm2PairCtorPlan; /* 10 x 4 = 40 bytes */

void isaac_anm2_pair_ctor_plan(uint32_t self,
                               IsaacAnm2PairCtorPlan* out);

/* ============ v62 unit: 0x0040d140 / 0x0040d170 / 0x0040d210 ==============
   Three complete small pure bodies in the 0x40d120..0x40d220 gap between
   the (v62-corrected) v44 float ctor end 0x40d13a and the v59-boundary
   node-raze HOST row 0x40d220. All three: zero E8, zero E9 (windowed
   rel32 census, hit-12..hit-0 capstone-validated, whole .text), no SEH,
   no cookie, no branches, no byte gates (family byte-gate rule vacuous). */

/* v62: 0x0040d140 two-string zero-init ctor. 0x0040d140..0x0040d16c
   (`ret` @ 0x40d16c), 45 B, int3 0x40d16d..0x40d16f. Two std::string
   members at self+0x8 and self+0x20 (size +0x10 / cap +0x14 per string);
   the body zeroes each string's FIRST dword (SSO buf / heap-ptr slot),
   size, and cap — exactly 7 dword stores:
     0x40d140 [self+0x08] = 0      (A data slot)
     0x40d147 eax = ecx            (return this)
     0x40d149 [self+0x18] = 0      (A size)
     0x40d150 [self+0x1c] = 0xf    (A cap)
     0x40d157 [self+0x20] = 0      (B data slot)
     0x40d15e [self+0x30] = 0      (B size)
     0x40d165 [self+0x34] = 0xf    (B cap)
   Census: E8=0, E9=0, push-imm32 addr-taken = 2 (0x0040f028, 0x0040f41d —
   eh-vector ctor fn-ptr args; the adjacent sites push 0x40db70 as the
   matching element dtor, v59-boundary §3). No .rdata/.data dword refs. */
enum {
  ISAAC_ANM2_STRPAIR_CTOR_VA = 0x0040d140u,
  ISAAC_ANM2_STRPAIR_CTOR_END_VA = 0x0040d16cu,   /* `ret` */
  ISAAC_ANM2_STRPAIR_CTOR_BODY_BYTES = 0x2du,     /* 45 B */
  ISAAC_ANM2_STRPAIR_CTOR_CALLSITE_COUNT = 0,     /* windowed rel32 census */
  ISAAC_ANM2_STRPAIR_CTOR_ADDR_TAKEN = 2,
  ISAAC_ANM2_STRPAIR_CTOR_STORE_COUNT = 7,
  ISAAC_ANM2_STRPAIR_CTOR_A_OFF = 0x8u,           /* string A base */
  ISAAC_ANM2_STRPAIR_CTOR_B_OFF = 0x20u,          /* string B base */
  ISAAC_ANM2_STRPAIR_CTOR_SSO_CAP = 0xfu
};

/* 0x0040d140 plan. entered iff self != 0 (v42 posture); result = self
   (mov eax,ecx @ 0x40d147); the seven constant stores are reported via
   the A/B base offsets + SSO cap (store_count 7). Zero host calls. */
typedef struct IsaacAnm2StrPairCtorPlan {
  int32_t entered;             /* 1 iff self != 0 */
  uint32_t self;               /* receiver base (guest address) */
  uint32_t result;             /* self (mov eax,ecx @ 0x40d147) */
  int32_t store_count;         /* 7 constant dword stores */
  uint32_t a_off;              /* 0x8  — string A base */
  uint32_t b_off;              /* 0x20 — string B base */
  uint32_t sso_cap;            /* 0xf — both cap stores */
  int32_t pure_complete;       /* 1 — zero host calls */
  int32_t host_call_count;     /* 0 */
} IsaacAnm2StrPairCtorPlan; /* 9 x 4 = 36 bytes */

void isaac_anm2_strpair_ctor_plan(uint32_t self,
                                  IsaacAnm2StrPairCtorPlan* out);

/* v62: 0x0040d170 wide zero/identity ctor. 0x0040d170..0x0040d208
   (`ret` @ 0x40d208), 153 B, int3 0x40d209..0x40d20f. 22 constant
   stores, PE order:
     dwords +0x04,+0x00,+0x0c,+0x08,+0x14,+0x10,+0x1c,+0x18,+0x24,+0x20
       := 0  (the +0x00..+0x24 range zeroed in the PE's pairwise order;
              +0x28 is NOT stored)
     dwords +0x30,+0x34,+0x38,+0x3c := 0x3f800000 (1.0f x4)
     dwords +0x40,+0x44,+0x48,+0x4c,+0x50,+0x54,+0x58 := 0
     byte   +0x60 := 0
   0x40d177 eax = ecx (return this). Census: E8=0, E9=0, addr-taken 0,
   no data-section dword refs — fully dead code. */
enum {
  ISAAC_ANM2_IDENTITY_CTOR_VA = 0x0040d170u,
  ISAAC_ANM2_IDENTITY_CTOR_END_VA = 0x0040d208u,  /* `ret` */
  ISAAC_ANM2_IDENTITY_CTOR_BODY_BYTES = 0x99u,    /* 153 B */
  ISAAC_ANM2_IDENTITY_CTOR_CALLSITE_COUNT = 0,
  ISAAC_ANM2_IDENTITY_CTOR_ADDR_TAKEN = 0,
  ISAAC_ANM2_IDENTITY_CTOR_DWORD_STORE_COUNT = 21,
  ISAAC_ANM2_IDENTITY_CTOR_ONE_BITS = 0x3f800000u, /* 1.0f */
  ISAAC_ANM2_IDENTITY_CTOR_ONES_FIRST_OFF = 0x30u,
  ISAAC_ANM2_IDENTITY_CTOR_BYTE_OFF = 0x60u
};

/* 0x0040d170 plan. Same posture as the strpair ctor: entered iff
   self != 0; result = self (mov eax,ecx @ 0x40d177); store_count 22 =
   21 dwords + 1 byte; the four 1.0f words start at +0x30. */
typedef struct IsaacAnm2IdentityCtorPlan {
  int32_t entered;             /* 1 iff self != 0 */
  uint32_t self;
  uint32_t result;             /* self (mov eax,ecx @ 0x40d177) */
  int32_t store_count;         /* 22 = 21 dwords + 1 byte */
  uint32_t one_bits;           /* 0x3f800000 (1.0f) */
  uint32_t ones_first_off;     /* 0x30 */
  uint32_t byte_off;           /* 0x60 */
  int32_t pure_complete;       /* 1 */
  int32_t host_call_count;     /* 0 */
} IsaacAnm2IdentityCtorPlan; /* 9 x 4 = 36 bytes */

void isaac_anm2_identity_ctor_plan(uint32_t self,
                                   IsaacAnm2IdentityCtorPlan* out);

/* v62: 0x0040d210 global-base getter. 0x0040d210..0x0040d210+0xa
   (`ret` @ 0x40d21a), 11 B, int3 0x40d21b..0x40d21f (next body 0x40d220
   = the v59-boundary node-raze HOST row). Body:
     0x40d210 mov eax, [0x00c7169c]
     0x40d215 add eax, 0x2a6c0
     0x40d21a ret
   The loaded dword is a RUNTIME input (host-fed-inputs precedent
   v54/v56; 0xc7169c sits next to the 0xc7163c registry-notify global).
   result = loaded + 0x2a6c0 (32-bit wrap). Census: E8=0, E9=0,
   addr-taken 0, no data refs — dead code. */
enum {
  ISAAC_ANM2_GLOBAL_BASE_GETTER_VA = 0x0040d210u,
  ISAAC_ANM2_GLOBAL_BASE_GETTER_END_VA = 0x0040d21au, /* `ret` */
  ISAAC_ANM2_GLOBAL_BASE_GETTER_BODY_BYTES = 0xbu,    /* 11 B */
  ISAAC_ANM2_GLOBAL_BASE_GETTER_CALLSITE_COUNT = 0,
  ISAAC_ANM2_GLOBAL_BASE_GETTER_ADDR_TAKEN = 0,
  ISAAC_ANM2_GLOBAL_BASE_PTR_VA = 0x00c7169cu,
  ISAAC_ANM2_GLOBAL_BASE_DELTA = 0x2a6c0u
};

/* result = loaded + 0x2a6c0 (32-bit wrap; uint32_t in, uint32_t out). */
uint32_t isaac_anm2_global_base_getter(uint32_t loaded);

/* ============ v64 unit: 0x00413b40 / 0x00413b90 ===========================
   First true body boundaries after the 0x40ed50 INSERT tail (the
   0x412000..0x413b3a stretch is ONE continuous region — no int3 padding;
   naive-linear decode from 0x40ed50 runs past 0x411d4e with no ret). */

/* v64 census row — 0x00413b40 SEH container-clear wrapper — HOST.
   0x00413b40..0x00413b7f (`ret` @ 0x413b7f), 64 B,
   int3 0x413b80..0x413b8f (16 x cc). SEH frame 0x00af11c0, GS cookie
   [0xbf93b4], fs:[0] install/remove. Body: `add ecx,0x30` then
   `call 0x00414730` (generic std container clear helper — host indirect
   calls inside, pgd-unit out-of-scope pin) then SEH pop + ret. Census:
   E8=0, E9=0, push-imm32=0, no .rdata/.data dword refs. Verdict: HOST
   (SEH + host callee; nothing pure to peel). identify-zhl EMPTY. */
enum {
  ISAAC_ANM2_SEH_CLEAR_WRAP_VA = 0x00413b40u,
  ISAAC_ANM2_SEH_CLEAR_WRAP_END_VA = 0x00413b7fu, /* `ret` */
  ISAAC_ANM2_SEH_CLEAR_WRAP_BODY_BYTES = 0x40u,   /* 64 B */
  ISAAC_ANM2_SEH_CLEAR_WRAP_CALLSITE_COUNT = 0,
  ISAAC_ANM2_SEH_CLEAR_WRAP_ADDR_TAKEN = 0,
  ISAAC_ANM2_SEH_CLEAR_WRAP_FRAME_VA = 0x00af11c0u,
  ISAAC_ANM2_SEH_CLEAR_WRAP_CLEAR_VA = 0x00414730u,
  ISAAC_ANM2_SEH_CLEAR_WRAP_RECV_OFF = 0x30u
};

/* v64 law — 0x00413b90 aligned-buffer state ctor — PURE. Complete small
   body 0x00413b90..0x00413bea (`ret` @ 0x413bea; int3 0x413beb..0x413bef,
   next body 0x413bf0). thiscall this=ecx -> esi. 11 stores, PE order:
     0x413b99 [self+0x1003c] := 0        (edx = self+0x1003c)
     0x413ba2 [self+0x00]    := 0
     0x413baa [self+0x04]    := 0
     0x413bb3 [self+0x10]    := 0
     0x413bbd [self+0x14]    := 0
     0x413bc6 [self+0x18]    := 0
     0x413bcd [self+0x34]    := base + ((-base) & 3)   (base = self+0x3c)
     0x413bd2 [self+0x20]    := 0
     0x413bd9 [self+0x10040] := 0
     0x413be3 [self+0x30]    := base                    (self+0x3c)
     0x413be6 [self+0x38]    := self+0x1003c
   The alignment law (0x413ba8 neg / 0x413bba and 3 / 0x413bc4 add):
   aligned(base) = base + ((-base) & 3) — round UP to the next multiple
   of 4, 32-bit wrap. eax = self (0x413bd0 mov eax,esi). Zero calls,
   zero branches. Census: E8=0, E9=0, push-imm32=0, no data refs — dead
   code. identify-zhl EMPTY (address-stable). */
enum {
  ISAAC_ANM2_ALIGNED_STATE_CTOR_VA = 0x00413b90u,
  ISAAC_ANM2_ALIGNED_STATE_CTOR_END_VA = 0x00413beau, /* `ret` */
  ISAAC_ANM2_ALIGNED_STATE_CTOR_BODY_BYTES = 0x5bu,   /* 91 B */
  ISAAC_ANM2_ALIGNED_STATE_CTOR_CALLSITE_COUNT = 0,
  ISAAC_ANM2_ALIGNED_STATE_CTOR_ADDR_TAKEN = 0,
  ISAAC_ANM2_ALIGNED_STATE_CTOR_STORE_COUNT = 11,
  ISAAC_ANM2_ALIGNED_STATE_CTOR_BASE_OFF = 0x3cu,
  ISAAC_ANM2_ALIGNED_STATE_CTOR_SENTINEL_OFF = 0x1003cu,
  ISAAC_ANM2_ALIGNED_STATE_CTOR_ALIGN_MASK = 3u
};

/* 0x00413b90 plan. entered iff self != 0 (v42 posture); result = self
   (mov eax,esi @ 0x413bd0); store_count 11; the alignment input and the
   two pointer stores are reported via base_off/sentinel_off. */
typedef struct IsaacAnm2AlignedStateCtorPlan {
  int32_t entered;             /* 1 iff self != 0 */
  uint32_t self;               /* receiver base (guest address) */
  uint32_t result;             /* self (mov eax,esi @ 0x413bd0) */
  int32_t store_count;         /* 11 dword stores */
  uint32_t base_off;           /* 0x3c — buffer base member */
  uint32_t sentinel_off;       /* 0x1003c — end sentinel member */
  uint32_t aligned_value;      /* base + ((-base) & 3) (the +0x34 store) */
  int32_t pure_complete;       /* 1 — zero host calls */
  int32_t host_call_count;     /* 0 */
} IsaacAnm2AlignedStateCtorPlan; /* 9 x 4 = 36 bytes */

void isaac_anm2_aligned_state_ctor_plan(uint32_t self,
                                        IsaacAnm2AlignedStateCtorPlan* out);

/* Alignment law twin (scalar): aligned = base + ((-base) & 3), 32-bit
   wrap — PE 0x413ba8/0x413bba/0x413bc4. */
uint32_t isaac_anm2_aligned_state_ctor_aligned(uint32_t base);

/* ============ v65 unit: 0x00413bf0 / 0x00413c70 ===========================
   TWIN by-name intrusive-list lookups (both dead code: zero E8/E9/
   push-imm/data refs; identify-zhl EMPTY). Shared machine shape:
     esi = [ebp+8] (needle char*); esi == 0 -> return [this+head_off]
       (the RAW head -- the machine's null-needle posture, ret 0xc)
     len = strlen(needle) (0x413bfb..0x413c07 inline walk)
     node = [this+head_off]; while node != 0:
       name = [node+0x0]; if name == 0 -> chars = 0x00c71640 (empty
         global), cmpLen = 0; else cmpLen = [node+0x8], chars = name
       if cmpLen == len AND memcmp(chars, needle, len) == 0
         -> return node (ret 0xc)
       node = [node+next_off]
     exhausted -> return 0 (ret 0xc)
   Node layout read by the bodies: {name ptr +0x0, len +0x8, next +N}.
   ret 0xc with one used stack arg -- callee-cleanup of 3 slots. */

enum {
  ISAAC_ANM2_LIST_FIND_A_VA = 0x00413bf0u,
  ISAAC_ANM2_LIST_FIND_A_END_VA = 0x00413c61u,   /* last `ret 0xc` */
  ISAAC_ANM2_LIST_FIND_A_BODY_BYTES = 0x72u,     /* 114 B */
  ISAAC_ANM2_LIST_FIND_A_HEAD_OFF = 0x20u,       /* [this+0x20] */
  ISAAC_ANM2_LIST_FIND_A_NEXT_OFF = 0x18u,       /* [node+0x18] */
  ISAAC_ANM2_LIST_FIND_B_VA = 0x00413c70u,
  ISAAC_ANM2_LIST_FIND_B_END_VA = 0x00413cdfu,   /* last `ret 0xc` */
  ISAAC_ANM2_LIST_FIND_B_BODY_BYTES = 0x70u,     /* 112 B */
  ISAAC_ANM2_LIST_FIND_B_HEAD_OFF = 0x18u,       /* [this+0x18] */
  ISAAC_ANM2_LIST_FIND_B_NEXT_OFF = 0x2cu,       /* [node+0x2c] */
  ISAAC_ANM2_LIST_FIND_CALLSITE_COUNT = 0,       /* both bodies */
  ISAAC_ANM2_LIST_FIND_ADDR_TAKEN = 0,           /* both bodies */
  ISAAC_ANM2_LIST_FIND_NAME_OFF = 0x0u,
  ISAAC_ANM2_LIST_FIND_LEN_OFF = 0x8u,
  ISAAC_ANM2_LIST_FIND_EMPTY_GLOBAL = 0x00c71640u,
  ISAAC_ANM2_LIST_FIND_RET_BYTES = 0xcu
};

/* Shared plan. entered iff needle != 0; when !entered the machine still
   returns the raw head -- result = head, found = 0, walked_count = 0.
   this_addr == 0 folds to the v42 zeroed posture (head 0, result 0). */
typedef struct IsaacAnm2ListFindPlan {
  int32_t entered;             /* 1 iff needle != 0 */
  uint32_t this_addr;
  uint32_t needle_addr;
  uint32_t head;               /* [this+head_off] raw */
  int32_t found;               /* 1 iff result is a matching node */
  uint32_t result;             /* node addr; head when !entered; 0 miss */
  int32_t walked_count;        /* nodes visited */
  int32_t log_needed;          /* always 0 */
  uint32_t log_va;
  int32_t log_level;
  int32_t host_call_count;     /* 0 */
  int32_t pure_complete;       /* 1 -- zero host calls */
} IsaacAnm2ListFindPlan; /* 12 x 4 = 48 bytes */

void isaac_anm2_list_find_a_plan(uint32_t this_addr,
                                 uint32_t needle_addr,
                                 IsaacAnm2ListFindPlan* out);
void isaac_anm2_list_find_b_plan(uint32_t this_addr,
                                 uint32_t needle_addr,
                                 IsaacAnm2ListFindPlan* out);

/* ============ v66 unit: 0x00413cf0 manager seek ===========================
   Call-free virtual method (vtable slot 0xb1b1bc; zero direct callers,
   zero push-imm refs). thiscall this=ecx; ret 0x20 (8 stack slots):
     [ebp+0x08] out struct ptr (16 bytes written)
     [ebp+0x0c] x_lo, [ebp+0x10] x_hi   -- 64-bit arg X
     [ebp+0x14] y_lo, [ebp+0x18] y_hi   -- 64-bit arg Y
     [ebp+0x1c], [ebp+0x20]             -- unused by the body
     [ebp+0x24] flags (tested via LOW BYTE dl only)
   Body:
     req64 = X + Y                       (0x413d04 add / 0x413d0a adc)
     a_val = *[*[this+0x1c]]             (0x413d07/0x413d0a->0x413d11)
     if ((byte[this+0x3c] & 2) == 0) {   (0x413d0d/0x413d17)
       c_val = *[*[this+0x20]];          (0x413d1d/0x413d20)
       if (c_val != 0 && [this+0x38] < c_val)   UNSIGNED jae skip
         [this+0x38] = c_val;            (0x413d2b MAX-UPDATE arm)
     } else c_val = 0;
     pos_lo = *[*[this+0xc]];            (0x413d2e/0x413d31)
     limit64 = sext64([this+0x38] - pos_lo)   (0x413d33..0x413d41 cdq)
     FAIL (bounds, UNSIGNED 64): req_hi > limit_hi, or == and
          req_lo > limit_lo               (0x413d41..0x413d49)
     gates (ONLY when req64 != 0):       (0x413d50 je skip)
       flags&1 && a_val == 0 -> FAIL     (0x413d54..0x413d5e)
       flags&2 && c_val == 0 -> FAIL     (0x413d60..0x413d67)
     new_lo = pos_lo + req_lo            (0x413d69/0x413d6d)
     arm A/B (iff flags&1 && a_val != 0):(0x413d6f..0x413d89)
       *[*[this+0x1c]] = new_lo
       *[*[this+0x2c]] = [this+0x38] - new_lo
     arm C/D (iff flags&2 && c_val != 0):(0x413d8e..0x413db6)
       *[this+0x10] = pos_lo
       *[*[this+0x20]] = new_lo
       *[*[this+0x30]] = (old_c + old_d) - new_lo
         where old_c = *[*[this+0x20]] BEFORE the store and
               old_d = *[*[this+0x30]]
     out: ok  -> [out]=req_lo, [out+4]=req_hi
          fail-> [out]=-1,  [out+4]=-1        (0x413db8/0x413dc2)
     always: [out+8]=[out+0xc]=0, [out+0x10..0x17]=0 (xorps/movq)
   Report-only plan: the machine's stores are REPORTED (addresses +
   values), never performed -- the receivers live behind vtable dispatch
   with zero static callers, so there is no apply surface to replay. */

enum {
  ISAAC_ANM2_MGR_SEEK_VA = 0x00413cf0u,
  ISAAC_ANM2_MGR_SEEK_END_VA = 0x00413df0u,     /* `ret 0x20` @ 0x413dee */
  ISAAC_ANM2_MGR_SEEK_BODY_BYTES = 0x100u,      /* 256 B */
  ISAAC_ANM2_MGR_SEEK_CALLSITE_COUNT = 0,       /* zero direct callers */
  ISAAC_ANM2_MGR_SEEK_ADDR_TAKEN = 1,           /* vtable 0xb1b1bc */
  ISAAC_ANM2_MGR_SEEK_VTABLE_SLOT_VA = 0x00b1b1bcu,
  ISAAC_ANM2_MGR_SEEK_RET_BYTES = 0x20u,
  ISAAC_ANM2_MGR_SEEK_FLAG_MASK = 2u            /* byte [this+0x3c] test */
};

/* 0x00413cf0 plan. entered iff this != 0 (v42 posture; the machine would
   fault on the member loads). All scalar params uint32_t. */
typedef struct IsaacAnm2MgrSeekPlan {
  int32_t entered;             /* 1 iff this != 0 */
  uint32_t this_addr;
  uint32_t x_lo;               /* [ebp+0x0c] */
  uint32_t x_hi;               /* [ebp+0x10] */
  uint32_t y_lo;               /* [ebp+0x14] */
  uint32_t y_hi;               /* [ebp+0x18] */
  uint32_t flags;              /* [ebp+0x24] (low byte tested) */
  uint32_t req_lo;             /* x+y 64-bit sum, low */
  uint32_t req_hi;
  uint32_t pos_lo;             /* *[*[this+0x0c]] */
  uint32_t lim_hi;             /* [this+0x38] AFTER the max-update arm */
  uint32_t limit_lo;           /* sext64(lim_hi - pos_lo), low */
  uint32_t limit_hi;
  uint32_t a_val;              /* *[*[this+0x1c]] */
  uint32_t c_val;              /* *[*[this+0x20]] (0 when flag bit1 set) */
  int32_t max_updated;         /* [this+0x38] := c_val arm fired */
  int32_t ok;                  /* bounds + flag gates passed */
  uint32_t new_lo;             /* pos_lo + req_lo */
  int32_t ab_applied;          /* arm A/B fired */
  uint32_t ab_a_addr;          /* *[this+0x1c] */
  uint32_t ab_a_value;         /* new_lo */
  uint32_t ab_b_addr;          /* *[this+0x2c] */
  uint32_t ab_b_value;         /* lim_hi - new_lo */
  int32_t cd_applied;          /* arm C/D fired */
  uint32_t cd_pos_addr;        /* [this+0x10] */
  uint32_t cd_pos_value;       /* pos_lo */
  uint32_t cd_c_addr;          /* *[this+0x20] */
  uint32_t cd_c_value;         /* new_lo */
  uint32_t cd_d_addr;          /* *[this+0x30] */
  uint32_t cd_d_value;         /* (old_c + old_d) - new_lo */
  uint32_t out_lo;             /* req_lo if ok else 0xffffffff */
  uint32_t out_hi;             /* req_hi if ok else 0xffffffff */
  int32_t pure_complete;       /* 1 -- zero host calls */
  int32_t host_call_count;     /* 0 */
} IsaacAnm2MgrSeekPlan; /* 34 x 4 = 136 bytes */

void isaac_anm2_mgr_seek_plan(uint8_t* th,
                              uint32_t x_lo,
                              uint32_t x_hi,
                              uint32_t y_lo,
                              uint32_t y_hi,
                              uint32_t flags,
                              IsaacAnm2MgrSeekPlan* out);

/* ============ v67 unit: 0x00413e00 whence-switch seek =====================
   Call-free virtual method (vtable slot 0xb1b1b8; zero direct callers,
   zero push-imm refs). thiscall this=ecx; ret 0x14 (5 stack slots):
     [ebp+0x08] out struct ptr, [ebp+0x0c] off_lo, [ebp+0x10] off_hi,
     [ebp+0x14] whence, [ebp+0x18] flags (LOW BYTE bl tested)
   Prologue (identical to the v66 seek): a_val = *[*[this+0x1c]];
   if ((byte[this+0x3c] & 2) == 0) { c_val = *[*[this+0x20]]; if (c_val
   != 0 && [this+0x38] <u c_val) [this+0x38] = c_val; } else c_val = 0;
   pos_lo = *[*[this+0xc]]; diff = [this+0x38] - pos_lo.
   Whence switch ([ebp+0x14], sub/cmp chain 0x413e4e..0x413e5b):
     0        -> target64 = 0                       (0x413eb5 xorps)
     1 (cur)  -> if ((flags & 3) == 3) FAIL         (ALIGN GUARD,
                0x413e6e..73 -- BOTH flag bits set rejects)
                else if flags&1: if (a_val == 0 && pos != 0) FAIL;
                     target64 = sext64(a_val - pos)  (0x413e8a..93)
                else if flags&2: if (c_val == 0 && pos != 0) FAIL;
                     target64 = sext64(c_val - pos)  (0x413eaa..b3)
                else FAIL                            (0x413e95..9e)
     2 (end)  -> target64 = sext64(diff)            (0x413e61..6a)
     else     -> FAIL                               (0x413e58 jne 0x413f60)
   req64 = target64 + off64               (0x413ec6 add / 0x413ec9 adc)
   limit64 = sext64(diff) (recomputed)    (0x413ed0..d4)
   FAIL iff req64 >u limit64              (0x413ed5..e3)
   gates ONLY when req64 != 0:            (0x413eeb je skip)
     flags&1 && pos_lo == 0 -> FAIL       (NOTE: gates on POS, not
     flags&2 && c_val   == 0 -> FAIL       a_val -- differs from v66)
   new_lo = pos_lo + req_lo               (0x413f03/07)
   arm A/B iff flags&1 && pos_lo != 0:    (0x413f0d..24)
     *[*[this+0x1c]] = new_lo; *[*[this+0x2c]] = [this+0x38] - new_lo
   arm C/D iff flags&2 && c_val != 0:     (0x413f26..50; identical to v66)
     *[this+0x10] = pos_lo; *[*[this+0x20]] = new_lo;
     *[*[this+0x30]] = (old_c + old_d) - new_lo
   out: ok -> {req_lo, req_hi}; fail -> {-1,-1}; [out+8..0x17] := 0
   Report-only plan (zero static callers; vtable dispatch only). */

enum {
  ISAAC_ANM2_MGR_SEEK2_VA = 0x00413e00u,
  ISAAC_ANM2_MGR_SEEK2_END_VA = 0x00413f8fu,    /* `ret 0x14` @ 0x413f8c */
  ISAAC_ANM2_MGR_SEEK2_BODY_BYTES = 0x8fu,      /* 143 B */
  ISAAC_ANM2_MGR_SEEK2_CALLSITE_COUNT = 0,
  ISAAC_ANM2_MGR_SEEK2_ADDR_TAKEN = 1,          /* vtable 0xb1b1b8 */
  ISAAC_ANM2_MGR_SEEK2_VTABLE_SLOT_VA = 0x00b1b1b8u,
  ISAAC_ANM2_MGR_SEEK2_RET_BYTES = 0x14u,
  ISAAC_ANM2_MGR_SEEK2_ALIGN_MASK = 3u          /* flags & 3 == 3 rejects */
};

/* 0x00413e00 plan. entered iff th != 0 (v42 posture). All params
   uint32_t. */
typedef struct IsaacAnm2MgrSeek2Plan {
  int32_t entered;             /* 1 iff th != 0 */
  uint32_t this_addr;
  uint32_t off_lo;             /* [ebp+0x0c] */
  uint32_t off_hi;             /* [ebp+0x10] */
  uint32_t whence;             /* [ebp+0x14] */
  uint32_t flags;              /* [ebp+0x18] (low byte tested) */
  uint32_t pos_lo;             /* *[*[this+0x0c]] */
  uint32_t lim_hi;             /* [this+0x38] AFTER the max-update arm */
  uint32_t a_val;              /* *[*[this+0x1c]] */
  uint32_t c_val;              /* *[*[this+0x20]] (0 when flag bit1 set) */
  int32_t max_updated;         /* [this+0x38] := c_val arm fired */
  uint32_t target_lo;          /* whence-derived seek base, low */
  uint32_t target_hi;
  uint32_t req_lo;             /* target + off, 64-bit with carry */
  uint32_t req_hi;
  uint32_t limit_lo;           /* sext64(diff) */
  uint32_t limit_hi;
  int32_t invalid_whence;      /* whence > 2 */
  int32_t align_fail;          /* whence == 1 && (flags & 3) == 3 */
  int32_t ok;
  uint32_t new_lo;             /* pos_lo + req_lo */
  int32_t ab_applied;
  uint32_t ab_a_addr;
  uint32_t ab_a_value;         /* new_lo */
  uint32_t ab_b_addr;
  uint32_t ab_b_value;         /* lim_hi - new_lo */
  int32_t cd_applied;
  uint32_t cd_pos_addr;        /* [this+0x10] */
  uint32_t cd_pos_value;       /* pos_lo */
  uint32_t cd_c_addr;          /* *[this+0x20] */
  uint32_t cd_c_value;         /* new_lo */
  uint32_t cd_d_addr;          /* *[this+0x30] */
  uint32_t cd_d_value;         /* (old_c + old_d) - new_lo */
  uint32_t out_lo;             /* req_lo if ok else 0xffffffff */
  uint32_t out_hi;             /* req_hi if ok else 0xffffffff */
  int32_t pure_complete;       /* 1 */
  int32_t host_call_count;     /* 0 */
} IsaacAnm2MgrSeek2Plan; /* 37 x 4 = 148 bytes */

void isaac_anm2_mgr_seek2_plan(uint8_t* th,
                               uint32_t off_lo,
                               uint32_t off_hi,
                               uint32_t whence,
                               uint32_t flags,
                               IsaacAnm2MgrSeek2Plan* out);

/* ============ v68-retry: 0x00413ff0 put-char + 0x00413f90 get-byte =======
   Two more call-free manager-vtable methods (slots 0xb1b1a0 / 0xb1b1a8;
   zero direct callers, zero push-imm refs; identify-zhl EMPTY).
   Report-only plans: stores REPORTED, never performed.

   --- 0x00413ff0 put-char (ret 4; [ebp+8] = ch, -1 sentinel) ---
     EVALUATION ORDER IS THE LAW (each FAIL exit jumps past the rest):
       pos = *[*[this+0x1c]]            (0x413ff3/97)
       FAIL iff pos == 0                (je 0x413ff9)
       FAIL iff pos <=u *[*[this+0xc]]  (jbe 0x414002)
       gate: iff ch != -1 (je 0x41400a):
             mismatch = (byte)ch != byte[pos-1]   (3A 56 FF @0x41400c)
             FAIL iff mismatch && (byte[this+0x3c] & 2) (0x414011..15)
     arms (unconditional on success):
       *[*[this+0x2c]] += 1                        (0x414017..1a)
       *[*[this+0x1c]] -= 1                        (0x41401c..1f)
       iff ch != -1: byte[POST-DEC pos] = (byte)ch (0x414021..2b)
     result = ch == -1 ? 0 : ch (FULL dword; cmove @0x414033)
     FAIL -> -1                                    (0x41403c)

   --- 0x00413f90 get-byte (ret; no stack args) ---
     pos = *[*[this+0x1c]]            (0x413f90..95)
     FAIL iff pos == 0                (0x413f97 je)
     end = *[*[this+0x2c]] + pos      (0x413f9b..a0 -- NOTE: pos added)
     pos <u end -> result byte[pos]   (DIRECT hit, 0x413fa2..ab)
     refresh arm (0x413fac..df):
       e = *[*[this+0x20]];  e == 0 -> FAIL        (0x413fac..b3)
       byte[this+0x3c] & 4 -> FAIL                 (0x413fb5..b9)
       lim = max_u32([this+0x38], e)  (cmovb @0x413fc0)
       lim <=u pos -> FAIL                         (0x413fc3..c5)
       [this+0x38] = lim                           (0x413fc7)
       *[*[this+0x2c]] = lim - pos                 (0x413fd0..d4)
       *[*[this+0x1c]] = pos  (SAME-VALUE writeback, 0x413fca..ce)
       result = byte[pos (re-read)]
   Null inner pointers fold to 0 (v42 posture documented). */

enum {
  ISAAC_ANM2_MGR_PUTC_VA = 0x00413ff0u,
  ISAAC_ANM2_MGR_PUTC_END_VA = 0x00414041u,     /* `ret 4` @ 0x00414039 */
  ISAAC_ANM2_MGR_PUTC_BODY_BYTES = 0x52u,       /* 82 B */
  ISAAC_ANM2_MGR_PUTC_CALLSITE_COUNT = 0,
  ISAAC_ANM2_MGR_PUTC_ADDR_TAKEN = 1,           /* vtable 0xb1b1a0 */
  ISAAC_ANM2_MGR_PUTC_VTABLE_SLOT_VA = 0x00b1b1a0u,
  ISAAC_ANM2_MGR_PUTC_RET_BYTES = 4u,
  ISAAC_ANM2_MGR_GETC_VA = 0x00413f90u,
  ISAAC_ANM2_MGR_GETC_END_VA = 0x00413fe5u,     /* `ret` @ 0x00413fe5 */
  ISAAC_ANM2_MGR_GETC_BODY_BYTES = 0x56u,       /* 86 B */
  ISAAC_ANM2_MGR_GETC_CALLSITE_COUNT = 0,
  ISAAC_ANM2_MGR_GETC_ADDR_TAKEN = 1,           /* vtable 0xb1b1a8 */
  ISAAC_ANM2_MGR_GETC_VTABLE_SLOT_VA = 0x00b1b1a8u,
  ISAAC_ANM2_MGR_GETC_FLAG4_MASK = 4u
};

typedef struct IsaacAnm2MgrPutcPlan {
  int32_t entered;             /* 1 iff th != 0 */
  uint32_t this_addr;
  uint32_t ch;                 /* [ebp+8]; 0xffffffff sentinel */
  uint32_t pos;                /* *[*[this+0x1c]] */
  uint32_t size_val;           /* *[*[this+0x0c]] */
  int32_t mismatch;            /* evaluated ONLY on bounds-pass, ch!=-1 */
  int32_t ok;
  int32_t end_inc_applied;
  uint32_t end_inc_addr;       /* *[this+0x2c] */
  uint32_t end_inc_value;      /* old + 1 */
  int32_t pos_dec_applied;
  uint32_t pos_dec_addr;       /* *[this+0x1c] */
  uint32_t pos_dec_value;      /* old - 1 */
  int32_t ch_store_applied;    /* iff ch != -1 */
  uint32_t ch_store_addr;      /* POST-DEC pos (simulated) */
  uint32_t ch_store_value;     /* (byte)ch */
  int32_t result;              /* -1 fail / 0 sentinel / ch */
  int32_t pure_complete;       /* 1 */
  int32_t host_call_count;     /* 0 */
} IsaacAnm2MgrPutcPlan; /* 19 x 4 = 76 bytes */

void isaac_anm2_mgr_putc_plan(uint8_t* th,
                              uint32_t ch,
                              IsaacAnm2MgrPutcPlan* out);

typedef struct IsaacAnm2MgrGetcPlan {
  int32_t entered;             /* 1 iff th != 0 */
  uint32_t this_addr;
  uint32_t pos;                /* *[*[this+0x1c]] */
  uint32_t end_base;           /* *[this+0x2c] */
  uint32_t end_val;            /* end_base_val + pos */
  int32_t direct_hit;          /* pos <u end_val */
  uint32_t direct_byte;        /* byte[pos] on the direct path */
  int32_t refresh_used;        /* !direct_hit */
  uint32_t e_val;              /* *[*[this+0x20]] */
  int32_t refresh_flag4_fail;  /* byte[this+0x3c] & 4 */
  uint32_t lim_old;            /* [this+0x38] */
  uint32_t lim_new;            /* max_u32(lim_old, e_val) */
  int32_t lim_committed;       /* [this+0x38] := lim_new fired */
  int32_t end_wr_applied;
  uint32_t end_wr_addr;        /* *[this+0x2c] */
  uint32_t end_wr_value;       /* lim_new - pos */
  int32_t pos_wr_applied;      /* SAME-VALUE writeback */
  uint32_t pos_wr_addr;        /* *[this+0x1c] */
  uint32_t pos_wr_value;       /* pos (unchanged) */
  int32_t result;              /* -1 fail, else byte value 0..0xff */
  int32_t pure_complete;       /* 1 */
  int32_t host_call_count;     /* 0 */
} IsaacAnm2MgrGetcPlan; /* 22 x 4 = 88 bytes */

void isaac_anm2_mgr_getc_plan(uint8_t* th,
                              IsaacAnm2MgrGetcPlan* out);

/* ============ v71 unit: 0x004143f0 + 0x00414410 tiny getters =============
   Two complete small pure bodies, landed as SCALAR laws (no guest
   memory beyond the thiscall's own two member reads, which arrive as
   uint32_t params -- the caller's values).

   --- 0x004143f0 stride-24 offset getter (thiscall, ret 4) ---
     0x4143f3 mov eax, [ebp+8]          ; arg (element index)
     0x4143f6 lea edx, [eax+eax*2]      ; edx = arg*3
     0x4143f9 mov eax, [ecx]            ; base = [this]
     0x4143fb lea eax, [eax+edx*8]      ; result = base + (arg*3)*8
     0x4143ff ret 4
   result = base + arg*24 (32-bit wrap; (arg*3)*8 == arg*24 mod 2^32).

   --- 0x00414410 signed divide-by-3 magic getter (thiscall, ret) ---
     0x414410 mov edx, [ecx+4]          ; hi = [this+4]
     0x414413 mov eax, 0x2aaaaaab       ; magic 715827883
     0x414418 sub edx, [ecx]            ; d = hi - lo (u32 wrap)
     0x41441a imul edx                  ; edx:eax = (i32)d * 715827883
     0x41441c sar edx, 2                ; high >>= 2 arithmetic
     0x41441f mov eax, edx
     0x414421 shr eax, 0x1f             ; sign bit of high
     0x414424 add eax, edx              ; +1 when negative: TRUNC d/24
     0x414426 ret
   result = trunc-toward-zero((i32)(hi - lo) / 3) -- NOT floor:
   d = -5 -> -1 (a floor mutant gives -2); d = 5 -> 1; d = 0 -> 0. */

enum {
  ISAAC_ANM2_STRIDE24_GETTER_VA = 0x004143f0u,
  ISAAC_ANM2_STRIDE24_GETTER_END_VA = 0x00414401u, /* `ret 4` @ 0x4143ff */
  ISAAC_ANM2_STRIDE24_GETTER_BODY_BYTES = 0x12u,   /* 18 B */
  ISAAC_ANM2_STRIDE24_GETTER_CALLSITE_COUNT = 0,
  ISAAC_ANM2_STRIDE24_GETTER_ADDR_TAKEN = 0,
  ISAAC_ANM2_STRIDE24_GETTER_STRIDE = 24u,         /* arg*3*8 */
  ISAAC_ANM2_STRIDE24_GETTER_RET_BYTES = 4u,
  ISAAC_ANM2_DIFF_DIV24_VA = 0x00414410u,
  ISAAC_ANM2_DIFF_DIV24_END_VA = 0x00414426u,      /* `ret` @ 0x414426 */
  ISAAC_ANM2_DIFF_DIV24_BODY_BYTES = 0x17u,        /* 23 B */
  ISAAC_ANM2_DIFF_DIV24_CALLSITE_COUNT = 0,
  ISAAC_ANM2_DIFF_DIV24_ADDR_TAKEN = 0,
  ISAAC_ANM2_DIFF_DIV24_MAGIC = 0x2aaaaaabu,       /* ceil(2^34/24) */
  ISAAC_ANM2_DIFF_DIV24_SHIFT = 2u                 /* sar edx,2 */
};

/* result = base + arg*24 (32-bit wrap; uint32_t in, uint32_t out). */
uint32_t isaac_anm2_stride24_offset(uint32_t base, uint32_t arg);

/* result = trunc-toward-zero((i32)(hi - lo) / 24) via the PE's
   0x2aaaaaab imul / sar 2 / sign-add sequence (MSVC /24 pattern). */
int32_t isaac_anm2_diff_div24(uint32_t lo, uint32_t hi);

/* ============ v73 unit: 0x00414520 string resize-tail setter =============
   SPLIT law: pure shrink/equal arm + HOST grow tail.
   thiscall this=ecx (a std::string-like object: size @+0x10,
   cap @+0x14, data ptr-or-SSO-buf @+0); stack args: [ebp+8] = new
   size (arg), [ebp+0xc] = unused by this body (ret 8).
   PE (byte-exact):
     0x00414526 lea edx,[ecx+0x10]
     0x00414529 cmp eax,[edx] ; ja 0x0041453f     -- GROW iff arg >u cur
     0x0041452d cmp dword [ecx+0x14],0x10 ; jb 0x00414535
     0x00414533 mov ecx,[ecx]                     -- SSO select: heap data
                                                    ptr iff cap >= 0x10
     0x00414535 mov [edx],eax                     -- size := arg
     0x00414537 mov byte [ecx+eax],0              -- terminator at arg
     0x0041453b pop ebp ; ret 8                   -- PURE exit
     0x0041453f sub eax,[edx]                     -- delta = arg - cur
     0x00414541 mov [ebp+8],eax ; pop ebp ; jmp 0x00414870
                                                   -- HOST grow tail
                                                   (first stack slot =
                                                    delta)
   Equal sizes take the SHRINK arm (stores same value + re-terminates).
   Report-only plan: the two shrink stores are REPORTED, never
   performed; the grow arm reports delta + the HOST tail VA. */

enum {
  ISAAC_ANM2_STR_RESIZE_VA = 0x00414520u,
  ISAAC_ANM2_STR_RESIZE_END_VA = 0x00414549u,
  ISAAC_ANM2_STR_RESIZE_BODY_BYTES = 0x2au,     /* 42 B */
  ISAAC_ANM2_STR_RESIZE_CALLSITE_COUNT = 0,
  ISAAC_ANM2_STR_RESIZE_ADDR_TAKEN = 0,
  ISAAC_ANM2_STR_RESIZE_RET_BYTES = 8u,         /* shrink exit ret 8 */
  ISAAC_ANM2_STR_RESIZE_SSO_CAP = 0x10u,
  ISAAC_ANM2_STR_RESIZE_SIZE_OFF = 0x10u,
  ISAAC_ANM2_STR_RESIZE_CAP_OFF = 0x14u,
  ISAAC_ANM2_STR_RESIZE_HOST_TAIL_VA = 0x00414870u
};

typedef struct IsaacAnm2StrResizePlan {
  int32_t entered;             /* 1 iff th != 0 */
  uint32_t this_addr;
  uint32_t new_size;           /* arg [ebp+8] */
  uint32_t cur_size;           /* [th+0x10] */
  uint32_t cap;                /* [th+0x14] */
  int32_t heap_data_used;      /* 1 iff cap >= 0x10 (jb skips deref) */
  int32_t grow;                /* 1 iff arg >u cur_size */
  uint32_t delta;              /* arg - cur (u32 wrap; host handoff) */
  int32_t size_store_applied;
  uint32_t size_store_addr;    /* th + 0x10 */
  uint32_t size_store_value;   /* arg */
  int32_t term_store_applied;
  uint32_t term_store_addr;    /* (heap ? *th : th) + arg */
  uint32_t term_store_value;   /* 0 */
  uint32_t host_tail_va;       /* 0x00414870 iff grow, else 0 */
  int32_t pure_complete;       /* 1 -- shrink arm complete; grow arm's
                                  host work is REPORTED via host_tail_va */
  int32_t host_call_count;     /* 0 in-plan (tail is a caller hop) */
} IsaacAnm2StrResizePlan; /* 17 x 4 = 68 bytes */

void isaac_anm2_str_resize_plan(uint8_t* th,
                                uint32_t new_size,
                                IsaacAnm2StrResizePlan* out);

/* ============ v76 unit: 0x00414a80 std::_Tree successor ==================
   Pure-complete plan law over an MSVC _Tree node graph:
     node layout {left +0x0, parent +0x4, right +0x8, _Isnil byte +0xd}
     (_Isnil NONZERO = header/nil node).
   this=esi is an iterator SLOT holding the current node in [esi]; the
   computed successor node is stored back into [esi] and `this` is
   returned (mov eax,esi @ 0x00414aac / 0x00414ace).
   Paths (byte-exact):
     PATH 0  right not-nil -> descend left chain from right; result =
             leftmost of the right subtree        (0x00414ab1..cc)
     PATH 2  right nil AND parent nil -> result = parent (nil head)
                                                  (jne 0x00414aaa)
     PATH 3  right nil, parent ok, node != parent->right ->
             result = parent                      (jne 0x00414aaa)
     PATH 1  right nil, node == parent->right -> climb while parent
             not-nil AND node == parent->right; result = first ancestor
             that is a LEFT child's root, else nil head
                                                  (loop 0x00414a98..a8)
   Report-only plan: the [this] := successor store is REPORTED, never
   performed (the slot belongs to the caller's iterator). Guest node
   reads go through guest_ptr absolute addresses. */

enum {
  ISAAC_ANM2_TREE_NEXT_VA = 0x00414a80u,
  ISAAC_ANM2_TREE_NEXT_END_VA = 0x00414ad2u,    /* last `ret` @ 0x414ad2 */
  ISAAC_ANM2_TREE_NEXT_BODY_BYTES = 0x53u,      /* 83 B */
  ISAAC_ANM2_TREE_NEXT_CALLSITE_COUNT = 0,
  ISAAC_ANM2_TREE_NEXT_ADDR_TAKEN = 0,
  ISAAC_ANM2_TREE_NEXT_LEFT_OFF = 0x0u,
  ISAAC_ANM2_TREE_NEXT_PARENT_OFF = 0x4u,
  ISAAC_ANM2_TREE_NEXT_RIGHT_OFF = 0x8u,
  ISAAC_ANM2_TREE_NEXT_ISNIL_OFF = 0xdu
};

/* PATH_* values for IsaacAnm2TreeNextPlan.path. */
enum {
  ISAAC_ANM2_TREE_NEXT_PATH_LEFTMOST = 0,
  ISAAC_ANM2_TREE_NEXT_PATH_CLIMB = 1,
  ISAAC_ANM2_TREE_NEXT_PATH_PARENT_NIL = 2,
  ISAAC_ANM2_TREE_NEXT_PATH_PARENT_DIRECT = 3
};

typedef struct IsaacAnm2TreeNextPlan {
  int32_t entered;             /* 1 iff th != 0 */
  uint32_t this_addr;          /* iterator slot base */
  uint32_t node;               /* [th] -- current node */
  uint32_t result_node;        /* successor (reported store value) */
  int32_t path;                /* PATH_* above */
  int32_t climb_count;         /* parent hops on PATH 1 */
  int32_t pure_complete;       /* 1 -- zero host calls */
  int32_t host_call_count;     /* 0 */
} IsaacAnm2TreeNextPlan; /* 8 x 4 = 32 bytes */

void isaac_anm2_tree_next_plan(uint8_t* th,
                               IsaacAnm2TreeNextPlan* out);

/* ============ v82 unit: 0x00415f80 _Tree erase-splice ====================
   Pure-complete plan law (89 B, ret 4 x3 exits @ 0x00415fb2/fc8/fd5,
   ZERO calls). this=ecx = container ([ecx] = header ptr, header+4 =
   root slot); [ebp+8] = node being erased.
   PE (byte-exact):
     0x00415f83 mov edx,[ebp+8]        ; node
     0x00415f87 mov esi,[edx]          ; left = node->+0
     0x00415f8e mov eax,[esi+8]        ; left->right
     0x00415f8c mov [edx],eax          ; node->+0 := left->right
     0x00415f8e..f9: if left->right NOT nil ([+0xd]==0 jne skip... the
       machine: cmp byte [eax+0xd],0 ; jne skip ; [eax+4] = node) --
       left->right's parent := node (guarded by _Isnil)
     0x00415f9a..9d: left->parent := node->parent
     0x00415fa0..b2: PATH 0 (root): node == [*[*ecx]+4] ->
       [*[*ecx]+4] := left; left->right := node; node->parent := left
     0x00415fb5..c8: PATH 1 (right child): node == parent->+8 ->
       parent->+8 := left; left->right := node; node->parent := left
     0x00415fcb..d5: PATH 2 (left child): parent->+0 := left;
       left->right := node; node->parent := left
   Report-only plan: all graph stores are REPORTED (the caller's tree
   is never touched by the plan). Guest reads via guest_ptr. */

enum {
  ISAAC_ANM2_TREE_SPLICE_VA = 0x00415f80u,
  ISAAC_ANM2_TREE_SPLICE_END_VA = 0x00415fd7u,  /* last `ret 4` @ 0x415fd5 */
  ISAAC_ANM2_TREE_SPLICE_BODY_BYTES = 0x58u,    /* 89 B */
  ISAAC_ANM2_TREE_SPLICE_CALLSITE_COUNT = 0,
  ISAAC_ANM2_TREE_SPLICE_ADDR_TAKEN = 0,
  ISAAC_ANM2_TREE_SPLICE_PATH_ROOT = 0u,
  ISAAC_ANM2_TREE_SPLICE_PATH_RIGHT_CHILD = 1u,
  ISAAC_ANM2_TREE_SPLICE_PATH_LEFT_CHILD = 2u
};

typedef struct IsaacAnm2TreeSplicePlan {
  int32_t entered;             /* 1 iff container != 0 && node != 0 */
  uint32_t container;          /* [ecx] chain base */
  uint32_t node;               /* node being erased */
  uint32_t left_child;         /* [node+0x0] */
  uint32_t parent;             /* [node+0x4] */
  uint32_t node_left_after;    /* [left_child+0x8] (node's new +0) */
  int32_t path;                /* PATH_* above */
  int32_t pure_complete;       /* 1 -- zero host calls */
  int32_t host_call_count;     /* 0 */
} IsaacAnm2TreeSplicePlan; /* 9 x 4 = 36 bytes */

void isaac_anm2_tree_splice_plan(uint32_t container,
                                 uint32_t node,
                                 IsaacAnm2TreeSplicePlan* out);

/* ============ v83 unit: 0x00415fe0 _Tree erase-splice RIGHT ==============
   Mirror of the v82 left-splice. Pure-complete plan law (85 B, ret 4
   x3 exits @ 0x00416011 / 0x00416024 / 0x00416031, ZERO calls).
   this=ecx = container ([ecx] = header ptr, header+4 = root slot);
   [ebp+8] = node being erased.
   PE (byte-exact):
     0x00415fe3 mov edx,[ebp+8]        ; node
     0x00415fe7 mov esi,[edx+8]        ; right = node->+8
     0x00415fea mov eax,[esi]          ; right->left
     0x00415fec mov [edx+8],eax        ; node->+8 := right->left
     0x00415ff1..f7: if right->left NOT nil ([+0xd]==0 jne skip):
       right->left's parent := node
     0x00415ffa..fd: right->parent := node->parent
     0x00416000..11: PATH 0 (root): node == [*[*ecx]+4] ->
       [*[*ecx]+4] := right; right->left := node; node->parent := right
     0x00416014..24: PATH 1 (left child): node == parent->+0 ->
       parent->+0 := right; right->left := node; node->parent := right
     0x00416027..31: PATH 2 (right child): parent->+8 := right;
       right->left := node; node->parent := right
   Report-only plan: all graph stores are REPORTED (the caller's tree
   is never touched by the plan). Guest reads via guest_ptr. */

enum {
  ISAAC_ANM2_TREE_SPLICE_R_VA = 0x00415fe0u,
  ISAAC_ANM2_TREE_SPLICE_R_END_VA = 0x00416034u, /* last `ret 4` @ 0x416031 */
  ISAAC_ANM2_TREE_SPLICE_R_BODY_BYTES = 0x55u,   /* 85 B */
  ISAAC_ANM2_TREE_SPLICE_R_CALLSITE_COUNT = 0,
  ISAAC_ANM2_TREE_SPLICE_R_ADDR_TAKEN = 0,
  ISAAC_ANM2_TREE_SPLICE_R_PATH_ROOT = 0u,
  ISAAC_ANM2_TREE_SPLICE_R_PATH_LEFT_CHILD = 1u,
  ISAAC_ANM2_TREE_SPLICE_R_PATH_RIGHT_CHILD = 2u
};

typedef struct IsaacAnm2TreeSpliceRPlan {
  int32_t entered;             /* 1 iff container != 0 && node != 0 */
  uint32_t container;          /* [ecx] chain base */
  uint32_t node;               /* node being erased */
  uint32_t right_child;        /* [node+0x8] */
  uint32_t parent;             /* [node+0x4] */
  uint32_t node_right_after;   /* [right_child+0x0] (node's new +8) */
  int32_t path;                /* PATH_* above */
  int32_t pure_complete;       /* 1 -- zero host calls */
  int32_t host_call_count;     /* 0 */
} IsaacAnm2TreeSpliceRPlan; /* 9 x 4 = 36 bytes */

void isaac_anm2_tree_splice_r_plan(uint32_t container,
                                   uint32_t node,
                                   IsaacAnm2TreeSpliceRPlan* out);

/* ============ v84-retry: 0x00416440 _Tree lower_bound ====================
   Pure-complete plan law (75 B, ret 8 @ 0x00416488, ZERO calls).
   this=ecx = container ([ecx] = header ptr, header+4 = root);
   [ebp+8] = out iterator slot (3 dwords); [ebp+0xc] = key-slot ptr
   (key = *key_slot, loaded ONCE before the walk).
   PE (byte-exact):
     0x00416443 mov ecx,[ecx]          ; hdr
     0x00416448 mov eax,[hdr+4]        ; root
     0x0041644b..54: out := {root, 0, hdr}
     0x00416457: root ISNIL -> return immediately (jne 0x00416485)
     loop (0x00416463..82):
       0x00416463 [out+0] := x
       0x00416465 cmp [x+0x10], key ; jae 0x00416471
         jae-taken:  y := x -> [out+8] := x ; flag := 1 ;
                     x := x->left (+0)            (0x0041646a..7b)
         fall-through (node_key < key): flag := 0 ;
                     x := x->right (+8)            (0x00416479..7b)
       0x0041647e: x ISNIL -> exit; else loop
   Report-only plan: the caller's out slot is NEVER written by the plan;
   its final contents are REPORTED field-by-field. Guest reads via
   guest_ptr. */

enum {
  ISAAC_ANM2_TREE_LOWER_BOUND_VA = 0x00416440u,
  ISAAC_ANM2_TREE_LOWER_BOUND_END_VA = 0x0041648cu, /* `ret 8` @ 0x416488 */
  ISAAC_ANM2_TREE_LOWER_BOUND_BODY_BYTES = 0x4cu,   /* 76 B */
  ISAAC_ANM2_TREE_LOWER_BOUND_CALLSITE_COUNT = 0,
  ISAAC_ANM2_TREE_LOWER_BOUND_ADDR_TAKEN = 0,
  ISAAC_ANM2_TREE_LOWER_BOUND_KEY_OFF = 0x10u,
  ISAAC_ANM2_TREE_LOWER_BOUND_LEFT_OFF = 0x0u,
  ISAAC_ANM2_TREE_LOWER_BOUND_RIGHT_OFF = 0x8u,
  ISAAC_ANM2_TREE_LOWER_BOUND_ISNIL_OFF = 0xdu
};

typedef struct IsaacAnm2TreeLowerBoundPlan {
  int32_t entered;             /* 1 iff container != 0 && hdr != 0 */
  uint32_t container;          /* [ecx] chain base */
  uint32_t out_slot;           /* arg1: caller's 3-dword iterator slot */
  uint32_t key_slot;           /* arg2: pointer to the key dword */
  uint32_t key;                /* *key_slot (loaded once) */
  uint32_t root;               /* header->root at entry */
  int32_t iterations;          /* non-nil nodes visited */
  uint32_t y_node;             /* last candidate with node_key >=u key */
  int32_t last_flag;           /* final compare flag (1 = candidate) */
  uint32_t final_x;            /* last non-nil visited node */
  int32_t root_isnil_early;    /* 1 iff root was nil at entry */
  int32_t pure_complete;       /* 1 -- zero host calls */
  int32_t host_call_count;     /* 0 */
} IsaacAnm2TreeLowerBoundPlan; /* 13 x 4 = 52 bytes */

void isaac_anm2_tree_lower_bound_plan(uint32_t container,
                                      uint32_t out_slot,
                                      uint32_t key_slot,
                                      IsaacAnm2TreeLowerBoundPlan* out);



/* ---------------- v8: 0x0040c000 ANM2::LoadGraphics store lane ------------ */

/* `cmp dword ptr [this+0x80],0 ; jbe` — UNSIGNED fence: only count 0 skips,
   and then [this+0x7c] is never loaded (the base read sits inside the loop).
   Per processed layer (byte[layer+0x30] == 0, in index order, stride 0xa0,
   u32 wrap; base RE-READ per iteration exactly like the PE):
     STORE A 0x0040c146  byte[layer+0x30] = host load result (flag)
     STORE B 0x0040c14d  byte[layer+0x31] = 0
   The flag VALUE is a host result (Manager::LoadImage 0x009588a0 — exact ZHL
   48 bytes — plus a virtual check); apply consumes flags[0..processed_count)
   = host-written per-layer load results in processing order and normalizes
   each to 0/1 (the PE stores exactly 0 or 1). flags == 0
   suppresses both per-layer stores (harness convention: no fabricated
   values). host_call_count = processed_count — the primary per-layer host
   action (LoadImage); the follow-on host leaves (0x40c550/0x40e520,
   0x408590, 0x40c4a0/0x408640/0x40e740, [0xc7163c] registry, 0x408640)
   are conditional on host results and are not counted. SEH frame
   0x00af0cc5; the pushed arg [ebp+8] is never read at either callsite
   (0x40bd97 in ANM2::Load, 0x40beb9 in the 0x40bea0 sibling). */
typedef struct IsaacAnm2LoadGraphicsPlan {
  int32_t entered;             /* 1 for a non-null anm2 image */
  uint32_t layer_count;        /* [anm2+0x80] raw */
  uint32_t layers_guest;       /* [anm2+0x7c] raw; 0 when count == 0 (the PE
                                  never loads the base on the fence skip) */
  int32_t processed_count;     /* layers with byte[+0x30] == 0, in order */
  int32_t processed_first;     /* first processed index; -1 when none */
  int32_t processed_last;      /* last processed index; -1 when none */
  uint32_t layer_stride;       /* 0xa0 */
  uint32_t load_flag_off;      /* layer element + 0x30 */
  uint32_t clear_flag_off;     /* layer element + 0x31 */
  uint32_t load_image_va;      /* 0x009588a0 Manager::LoadImage (exact ZHL) */
  int32_t host_call_count;     /* processed_count (LoadImage per layer) */
} IsaacAnm2LoadGraphicsPlan;

/* LoadGraphics constants (v8). */
enum {
  ISAAC_ANM2_LOADGRAPHICS_FLAG_OFF = 0x30,
  ISAAC_ANM2_LOADGRAPHICS_CLEAR_OFF = 0x31,
  ISAAC_ANM2_LOADGRAPHICS_LOAD_IMAGE_VA = 0x009588a0,
  ISAAC_ANM2_LOADGRAPHICS_SEH_FRAME = 0x00af0cc5,
  ISAAC_ANM2_LOADGRAPHICS_CTOR_ANIM = 0x0040c550,
  ISAAC_ANM2_LOADGRAPHICS_CTOR_LAYER = 0x0040c4a0,
  ISAAC_ANM2_LOADGRAPHICS_APPLY_ANIM = 0x0040e520,
  ISAAC_ANM2_LOADGRAPHICS_APPLY_LAYER = 0x0040e740,
  ISAAC_ANM2_LOADGRAPHICS_GET_LAYER = 0x00408590,
  ISAAC_ANM2_LOADGRAPHICS_SET_ANIM = 0x00408640,
};

/* Plan/apply for the 0x0040c000 store lane (freestanding; not Update-wired).
   plan publishes the processed-layer decision; apply re-walks the images
   like the PE and performs STORE A + STORE B per processed layer. */
void isaac_anm2_loadgraphics_plan(const uint8_t* anm2,
                                  IsaacAnm2LoadGraphicsPlan* out);
void isaac_anm2_loadgraphics_apply(const uint8_t* anm2,
                                   const uint8_t* flags,
                                   IsaacAnm2LoadGraphicsPlan* out);

/* ===================== v9: 0x0040bea0 ANM2::Reload (gate + recipes) ======= */

/* `__thiscall void ANM2::Reload()` — EXACT ZHL match, 10 pattern bytes
   (re-verified v9). Body VA 0x0040bea0..0x0040bebf, 32 bytes, plain `ret`:

     cmp dword ptr [esi+0x10], 0      ; FULL-DWORD gate — the _filename
     je  skip                          ; std::string SIZE (v1 slot 0x10)
     call 0x0040db90  (ecx=this, arg1=this, arg2=this)   ; ret 8, no ZHL
     call 0x0040e110  (ecx=this, arg1=this)              ; ret 4, no ZHL
     call 0x0040c000  (ecx=this, dead [esp]=this)        ; ret 4, no ZHL

   Every pushed dword and every receiver is `this`; the caller never adjusts
   esp, so all three callees clean their own stack args. 0x0040c000's
   argument is the v8-anchored DEAD slot ([ebp+8] has zero references in all
   171 instructions). Reload itself performs NO observable stores: the host
   residual is exactly the gate plus the three typed calls. The gate is a
   32-bit test of the string size, NOT a byte test — size 0x100/0x10000/
   0xffffffff all take the call path (v9 wide drives + byte-narrow mutant
   pin this). */
typedef struct IsaacAnm2ReloadPlan {
  int32_t entered;          /* 1 for a non-null anm2 image */
  int32_t gate;             /* dword [anm2+0x10] != 0 (cmp at 0x40bea3) */
  uint32_t gate_off;        /* 0x10 — _filename std::string size field */
  int32_t call_count;       /* 3 when gate else 0 */
  int32_t host_call_count;  /* = call_count: 0x40db90 + 0x40e110 + 0x40c000 */
  uint32_t call0_va;        /* 0x0040db90 — filename cache guard (no ZHL) */
  int32_t call0_argc;       /* 2 — both stack args are `this` */
  uint32_t call1_va;        /* 0x0040e110 — filename cache fetch (no ZHL) */
  int32_t call1_argc;       /* 1 — `this` */
  uint32_t call2_va;        /* 0x0040c000 — LoadGraphics (no ZHL) */
  int32_t call2_argc;       /* 1 — the DEAD [ebp+8] arg; still pushed */
  int32_t receivers_anm2;   /* 1 — ecx == this at all three callsites */
  int32_t args_anm2;        /* 1 — every pushed dword is this */
} IsaacAnm2ReloadPlan;

/* Reload constants (v9). 0x40db90 / 0x40e110 / 0x40c000 have NO exact ZHL
   match; the v7 labels (cache guard / cache fetch / graphics) are reused as
   VAs only, never as promoted symbols. */
enum {
  ISAAC_ANM2_RELOAD_VA = 0x0040bea0u,
  ISAAC_ANM2_RELOAD_GATE_OFF = 0x10,   /* _filename std::string size */
  ISAAC_ANM2_RELOAD_CALL0_VA = 0x0040db90u,
  ISAAC_ANM2_RELOAD_CALL0_ARGC = 2,
  ISAAC_ANM2_RELOAD_CALL1_VA = 0x0040e110u,
  ISAAC_ANM2_RELOAD_CALL1_ARGC = 1,
  ISAAC_ANM2_RELOAD_CALL2_VA = 0x0040c000u,
  ISAAC_ANM2_RELOAD_CALL2_ARGC = 1,   /* DEAD — never read by the body */
  ISAAC_ANM2_RELOAD_CALL_COUNT = 3
};

/* The whole body as a pure decision + typed call recipes (freestanding; not
   Update-wired). out may be null (no-op). */
void isaac_anm2_reload_plan(const uint8_t* anm2, IsaacAnm2ReloadPlan* out);

/* ===================== v2: AnimationState advance / apply ================= */

enum {
  ISAAC_ANM2_STATE_OFF_ANIMATION_00 = 0x00,
  ISAAC_ANM2_STATE_OFF_ANIM_DATA_04 = 0x04,
  ISAAC_ANM2_STATE_OFF_LAYER_FRAMES_08 = 0x08,
  ISAAC_ANM2_STATE_OFF_NULL_FRAMES_0C = 0x0c,
  ISAAC_ANM2_STATE_OFF_ANIM_FRAME_10 = 0x10,
  ISAAC_ANM2_STATE_OFF_CLEARED_18 = 0x18,
  ISAAC_ANM2_DATA_OFF_LAYER_COUNT_1C = 0x1c,
  /* NOT promoted to ZHL `_nullLayerCount`: ZHL puts that at 0x28 and this
     binary uses 0x24 in five places. Address-stable. */
  ISAAC_ANM2_DATA_OFF_SECOND_COUNT_24 = 0x24,
  ISAAC_ANM2_DATA_OFF_LENGTH_30 = 0x30,
  ISAAC_ANM2_FRAME_SLOT_SIZE = 4,
  ISAAC_ANM2_STATE_MEMSET_FILL = 0xff
};

enum {
  ISAAC_ANM2_HOST_VA_ADVANCE = 0x00408e00u,
  ISAAC_ANM2_HOST_VA_ADVANCE_PRE = 0x00408c90u,   /* after the frame store */
  ISAAC_ANM2_HOST_VA_LAYER_BODY = 0x00408b90u,    /* first walk body */
  ISAAC_ANM2_HOST_VA_NULL_BODY = 0x00408c10u,     /* second walk body */
  ISAAC_ANM2_HOST_VA_ALLOC = 0x00a648b0u,         /* guest allocator */
  ISAAC_ANM2_HOST_VA_MEMSET = 0x00af05e5u,        /* memset */
  ISAAC_ANM2_IAT_VA_NEXTAFTERF = 0x00b18838u,     /* api-ms-win-crt-math-l1-1-0 */
  ISAAC_ANM2_ADVANCE_LOG_LEVEL = 0x10,
  ISAAC_ANM2_ADVANCE_LOG_STR_VA = 0x00b1a4f0u     /* "id out of bounds\n" */
};

/* v3 additions. */
enum {
  ISAAC_ANM2_STATE_OFF_TAIL_BYTE_14 = 0x14,
  ISAAC_ANM2_STATE_OFF_TAIL_18 = 0x18,
  ISAAC_ANM2_STATE_OFF_TAIL_1C = 0x1c,
  /* mov dword ptr [esi+0x10], 0xbf800000 â€” raw bits, i.e. -1.0f. The only
     negative sentinel in this family; it is a bit pattern, not float math. */
  ISAAC_ANM2_STATE_APPLY_TAIL_FRAME_BITS = 0xbf800000u,
  ISAAC_ANM2_HOST_VA_MEMCPY = 0x00af05dfu,        /* jmp [0x00b18760] */
  ISAAC_ANM2_IAT_VA_MEMSET = 0x00b1875cu,         /* VCRUNTIME140 hint 72 */
  ISAAC_ANM2_IAT_VA_MEMCPY = 0x00b18760u,         /* VCRUNTIME140 hint 70 */
  ISAAC_ANM2_IAT_VA_FREE = 0x00b187dcu,           /* crt-heap hint 24 */
  ISAAC_ANM2_SEH_FRAME_APPLY_VA = 0x00af0b60u,    /* 0x00408830 */
  ISAAC_ANM2_SEH_FRAME_APPLY_ALT_VA = 0x00af0b80u,/* 0x00408970 */
  /* Allocator accounting block select. Both slots are past the raw size of
     .data, so both are zero at load and the fixed block is the load-time
     default. Runtime inputs, NOT constants. */
  ISAAC_ANM2_ALLOC_COUNTER_HEAD_VA = 0x00c7de78u,
  ISAAC_ANM2_ALLOC_COUNTER_HEAD_OFF = 0x30,
  ISAAC_ANM2_ALLOC_COUNTER_FIXED_VA = 0x00c7f618u,
  /* lea eax,[ecx-4]: the wrapper's block header sits one dword below the
     pointer the program holds, and [ptr-4] is the size the counter drops by. */
  ISAAC_ANM2_ALLOC_BLOCK_HEADER_BIAS = 4,
  /* Which arm of 0x00408970 a plan describes. */
  ISAAC_ANM2_ALT_ARM_LAYER = 0,
  ISAAC_ANM2_ALT_ARM_NULL = 1,
  /* Defect D14: BOTH arms store their new buffer here. */
  ISAAC_ANM2_ALT_STORE_SLOT_OFF = 0x08
};

/* `nextafterf(x, 0.0f)` on raw bits. For every finite x this is one ulp of
   magnitude toward zero: decrement the magnitude field and keep the sign,
   which crosses the normal/subnormal boundary and yields the correctly signed
   zero from the smallest subnormal. x == 0 returns +0.0f because nextafter
   returns *y* when x == y and -0.0f == +0.0f.

   This is an IEEE-754-specified operation, not reverse-engineered game logic,
   so it is modelled exactly rather than left as a host call. The PE reaches it
   only with `cvtdq2ps` output, which is always finite â€” the NaN case is
   unreachable here and returning the input unchanged is a HARNESS CONVENTION
   shared with the oracle, not a claim about the CRT. */
uint32_t isaac_anm2_next_toward_zero_f32_bits(uint32_t x_bits);

/* 1 when x_bits is NOT a NaN, i.e. when the ulp step above is the true IEEE
   result rather than the harness pass-through. Infinity is inside this domain
   (nextafterf(+inf, 0) is FLT_MAX). The PE presents a strict subset of it:
   `cvtdq2ps` output is always finite. */
int32_t isaac_anm2_next_toward_zero_domain_ok(uint32_t x_bits);

/* `minss dst, m32` on raw bits: dst keeps its value only when it is ORDERED
   and strictly less, so NaN in either operand and every tie (including
   +0.0 vs -0.0) yield the MEMORY operand. Returning bits preserves the sign
   of zero, which a float return would not. */
uint32_t isaac_anm2_minss_bits(uint32_t dst_bits, uint32_t mem_bits);

/* The whole clamp at VA 0x00408e12..0x00408e3b:
     minss( nextafterf((float)length_30, 0.0f), incoming ) */
uint32_t isaac_anm2_frame_clamp_bits(int32_t length_30, uint32_t incoming_bits);

/* Advance store plan (VA 0x00408e40..0x00408e4e). */
typedef struct IsaacAnm2AdvanceStorePlan {
  uint32_t clamped_bits;      /* value stored at state+0x10 */
  int32_t cleared_18;         /* always 0 */
  uint32_t pre_walk_host_va;  /* 0x00408c90, called after both stores */
  int32_t store_frame_off;    /* 0x10 */
  int32_t store_cleared_off;  /* 0x18 */
} IsaacAnm2AdvanceStorePlan;

void isaac_anm2_advance_store_plan(int32_t length_30,
                                   uint32_t incoming_bits,
                                   IsaacAnm2AdvanceStorePlan* out);

/* `cmp [animData+count_off], esi ; jbe skip` evaluated with esi == 0: an
   UNSIGNED `count <= 0`, i.e. the loop is entered iff count != 0. A count with
   bit 31 set DOES enter (defect D10). */
int32_t isaac_anm2_advance_walk_enter(uint32_t count);

/* In-loop bound check (VA 0x00408e60..0x00408e6b):
     animData != 0 && (int32)index >= 0 && (int32)index < (int32)count
   SIGNED on both index tests. */
int32_t isaac_anm2_advance_inner_ok(int32_t anim_data_null,
                                    int32_t index,
                                    int32_t count);

/* `inc esi ; cmp esi,[animData+count_off] ; jb` â€” UNSIGNED, against the count
   re-derived from the RE-READ animData (defect D11). */
int32_t isaac_anm2_advance_walk_continue(uint32_t next_index,
                                         uint32_t count_reloaded);

/* Which of the two walks a plan describes. */
enum {
  ISAAC_ANM2_WALK_LAYER = 0, /* count at 0x1c, array at state+0x08, body b90 */
  ISAAC_ANM2_WALK_NULL = 1   /* count at 0x24, array at state+0x0c, body c10 */
};

typedef struct IsaacAnm2AdvanceWalkPlan {
  int32_t enter;              /* count != 0 (unsigned) */
  int32_t inner_ok;           /* signed bound check passed */
  int32_t log_needed;         /* !inner_ok */
  int32_t body_runs;          /* 1 whenever the loop was entered â€” defect D8 */
  uint32_t log_va;            /* 0x00a112c0 */
  int32_t log_level;          /* 0x10 */
  uint32_t log_str_va;        /* 0x00b1a4f0 */
  uint32_t slot_byte_offset;  /* index*4 into the frame array, 32-bit wrap */
  uint32_t body_va;           /* 0x00408b90 or 0x00408c10 */
  int32_t continue_loop;      /* unsigned next_index < count_reloaded */
} IsaacAnm2AdvanceWalkPlan;

/* One iteration of either walk. `which` selects the body VA and is the only
   thing that differs between them. out may be null (no-op). */
void isaac_anm2_advance_walk_plan(int32_t which,
                                  int32_t anim_data_null,
                                  int32_t index,
                                  int32_t count,
                                  uint32_t count_reloaded,
                                  IsaacAnm2AdvanceWalkPlan* out);

/* ---- 0x00408830 animation-state apply: pure size / sequence logic ---- */

/* `mul edi ; seto cl ; neg ecx ; or ecx,eax` with edi == 4 â€” the byte count
   handed to the allocator, saturated to 0xffffffff when count*4 overflows
   32 bits. */
uint32_t isaac_anm2_state_alloc_size(uint32_t count);

/* `mov ecx,[data+off] ; shl ecx,2` â€” the byte count handed to memset. This one
   is NOT saturated, so it disagrees with the allocation size on overflow
   (defect D9). */
uint32_t isaac_anm2_state_memset_size(uint32_t count);

/* 1 when the two disagree, i.e. count >= 0x40000000. */
int32_t isaac_anm2_state_size_disagrees(uint32_t count);

typedef struct IsaacAnm2StateApplyPlan {
  int32_t free_layer_frames;   /* [state+0x08] != 0 */
  int32_t free_null_frames;    /* [state+0x0c] != 0 */
  int32_t alloc_layer;         /* data non-null && layer_count != 0 */
  uint32_t alloc_layer_size;   /* saturating */
  uint32_t memset_layer_size;  /* wrapping, from the RE-READ count (D12) */
  int32_t alloc_null;          /* recaptured data non-null && count != 0 */
  uint32_t alloc_null_size;
  uint32_t memset_null_size;
  int32_t memset_fill;         /* 0xff */
  int32_t host_call_count;     /* frees + allocs + memsets */
} IsaacAnm2StateApplyPlan;

/* PE order: store the new animData at state+0x04, free both frame arrays,
   re-read animData, allocate+memset the layer array, RE-READ animData again,
   then allocate+memset the second array.
   `data_null_initial` is the read at VA 0x004088b0; `layer_count_alloc` is the
   read at 0x004088bc and `layer_count_memset` the separate re-read at
   0x004088e0; `data_null_after_first` is the re-read at 0x004088f2.
   out may be null (no-op). */
void isaac_anm2_state_apply_plan(int32_t layer_frames_08,
                                 int32_t null_frames_0c,
                                 int32_t data_null_initial,
                                 uint32_t layer_count_alloc,
                                 uint32_t layer_count_memset,
                                 int32_t data_null_after_first,
                                 uint32_t null_count_alloc,
                                 uint32_t null_count_memset,
                                 IsaacAnm2StateApplyPlan* out);

/* The 0x00408830 epilogue at VA 0x00408935..0x0040894e, reached from EVERY
   path including the `data == 0` early exit:
     dword [state+0x10] = 0xbf800000    (raw bits, -1.0f)
     byte  [state+0x14] = 0             <- 8-BIT store: 0x15..0x17 survive (D13)
     dword [state+0x18] = 0
     dword [state+0x1c] = 0
   state points at a >= 0x20-byte AnimationState image and may be null (no-op).
   Nothing else in the object is touched, so a caller can diff the whole image
   against its pre-state and see exactly the four writes. */
void isaac_anm2_state_apply_tail_fields(uint8_t* state);

/* ===================== v3: 0x00408970 (reset == false apply) ============== */

/* `mov edx,[0x00c7de78] ; test edx,edx ; je fixed ; add edx,0x30` â€” the
   allocator accounting block the 64-bit `sub`/`sbb` pair targets. Pure address
   arithmetic with a 32-bit wrap; head == 0 selects the fixed block, which is
   also the load-time state because both slots are past the raw .data size. */
uint32_t isaac_anm2_alloc_counter_block(uint32_t counter_head);

/* `test eax,eax ; je zero ; mov ecx,[eax+off]` â€” a count field read behind its
   own null guard, evaluated four times up front at VA 0x0040899a..0x004089d7.
   data_null != 0 yields 0 without consulting raw_count. */
int32_t isaac_anm2_state_alt_count(int32_t data_null, int32_t raw_count);

/* `test ebx,ebx ; jg realloc` â€” SIGNED. A count with bit 31 set takes the FREE
   path here while 0x00408e00 would enter its loop on the same value (D17). */
int32_t isaac_anm2_state_alt_realloc_path(int32_t new_count);

/* `test eax,eax ; jle skip` on the OLD count â€” SIGNED, and the byte length is
   `shl eax,2`, a 32-bit wrap of the OLD count with no min() against the new
   one (defect D15). */
int32_t isaac_anm2_state_alt_memcpy_needed(int32_t old_count);
uint32_t isaac_anm2_state_alt_memcpy_size(int32_t old_count);

/* One arm of 0x00408970. `which` selects only which slot the arm READS and
   whether the arm zeroes its own slot after the raw free; per defect D14 the
   store of the new buffer goes to state+0x08 for BOTH arms. */
typedef struct IsaacAnm2StateApplyAltArm {
  int32_t counts_equal;        /* old == new -> the arm is skipped entirely */
  int32_t free_path;           /* !equal && (int32)new <= 0 */
  int32_t realloc_path;        /* !equal && (int32)new > 0 */
  int32_t wrapper_free_call;   /* free_path && slot != 0 */
  int32_t slot_zeroed;         /* the arm writes 0 into its OWN slot */
  uint32_t alloc_size;         /* saturating new*4; 0 unless realloc_path */
  uint32_t memset_size;        /* wrapping new*4  (D16) */
  int32_t memcpy_needed;       /* realloc_path && (int32)old > 0 */
  uint32_t memcpy_size;        /* wrapping old*4  (D15) */
  int32_t release_old;         /* realloc_path && slot != 0 */
  uint32_t counter_block;      /* block the 64-bit decrement targets */
  uint32_t release_free_ptr;   /* slot - 4, the raw free() argument */
  uint32_t store_slot_off;     /* ALWAYS 0x08 â€” defect D14 */
  int32_t host_call_count;     /* wrapper free + alloc + memset + memcpy + raw */
} IsaacAnm2StateApplyAltArm;

void isaac_anm2_state_alt_arm_plan(int32_t which,
                                   int32_t old_count,
                                   int32_t new_count,
                                   uint32_t slot_ptr,
                                   uint32_t counter_head,
                                   IsaacAnm2StateApplyAltArm* out);

/* Whole-body plan. The four raw counts are the fields as they sit in the two
   descriptors; the two *_data_null flags gate them exactly as the PE does.
   alloc0/alloc1 are the pointers the wrapper hands back on each arm's realloc
   path (ignored when that arm does not allocate). final_* are the values the
   three state slots hold when the function returns â€” that is where D14 is
   visible: an arm-1 realloc leaves final_0c == 0 and final_08 == alloc1. */
typedef struct IsaacAnm2StateApplyAltPlan {
  int32_t old_layer_count;     /* guarded read of old->[0x1c] */
  int32_t new_layer_count;
  int32_t old_second_count;    /* guarded read of old->[0x24] */
  int32_t new_second_count;
  int32_t arm0_free_path;
  int32_t arm0_realloc_path;
  int32_t arm0_memcpy_needed;
  uint32_t arm0_alloc_size;
  uint32_t arm0_memset_size;
  uint32_t arm0_memcpy_size;
  int32_t arm0_release_old;
  int32_t arm1_free_path;
  int32_t arm1_realloc_path;
  int32_t arm1_memcpy_needed;
  uint32_t arm1_alloc_size;
  uint32_t arm1_memset_size;
  uint32_t arm1_memcpy_size;
  int32_t arm1_release_old;
  uint32_t final_04;           /* new descriptor, stored LAST (0x00408b6d) */
  uint32_t final_08;
  uint32_t final_0c;
  uint32_t counter_block;
  /* The value state+0x08 held immediately before arm 1's misdirected store,
     i.e. the pointer defect D14 destroys. 0 when arm 1 does not reallocate,
     and also 0 when the slot happened to be null already. */
  uint32_t clobbered_layer_ptr;
  int32_t host_call_count;
} IsaacAnm2StateApplyAltPlan;

void isaac_anm2_state_apply_alt_plan(int32_t old_data_null,
                                     int32_t old_layer_count_raw,
                                     int32_t old_second_count_raw,
                                     int32_t new_data_null,
                                     int32_t new_layer_count_raw,
                                     int32_t new_second_count_raw,
                                     uint32_t slot_08,
                                     uint32_t slot_0c,
                                     uint32_t alloc0_result,
                                     uint32_t alloc1_result,
                                     uint32_t new_data_ptr,
                                     uint32_t counter_head,
                                     IsaacAnm2StateApplyAltPlan* out);

/* ============ v4: 0x00408c90 / 0x00408b90 / 0x00408c10 bodies ============ */

enum {
  /* 0x00408c90 â€” trigger scan. */
  ISAAC_ANM2_DATA_OFF_TRIGGER_LIST_28 = 0x28,
  ISAAC_ANM2_DATA_OFF_TRIGGER_COUNT_2C = 0x2c,
  ISAAC_ANM2_TRIGGER_ELEM_STRIDE = 8,      /* [eax + edx*8] */
  ISAAC_ANM2_TRIGGER_ELEM_ID_OFF = 0,
  ISAAC_ANM2_TRIGGER_ELEM_TIME_OFF = 4,
  ISAAC_ANM2_STATE_OFF_TRIGGER_BITS_18 = 0x18,
  ISAAC_ANM2_STATE_OFF_TRIGGER_BITS_1C = 0x1c,
  /* `bts r32, r32` takes the bit offset modulo the operand size (defect D21). */
  ISAAC_ANM2_BTS_SHIFT_MASK = 31,
  ISAAC_ANM2_HOST_VA_PREWALK = 0x00408c90u,
  ISAAC_ANM2_PREWALK_LOG_LEVEL = 0x10,
  ISAAC_ANM2_PREWALK_LOG_STR_VA = 0x00b1a504u, /* "AnimationData is NULL\n" */
  /* The `ah & 0x44` immediate and the two flag bits lahf places there. */
  ISAAC_ANM2_LAHF_TEST_MASK = 0x44,
  ISAAC_ANM2_LAHF_ZF_BIT = 0x40,
  ISAAC_ANM2_LAHF_PF_BIT = 0x04
};

enum {
  ISAAC_ANM2_FRAME_WALK_LAYER = 0,   /* 0x00408b90 */
  ISAAC_ANM2_FRAME_WALK_NULL = 1,    /* 0x00408c10 */
  /* `shl esi,4` in BOTH bodies â€” the one parameter the siblings share. */
  ISAAC_ANM2_FRAME_WALK_ENTRY_STRIDE = 0x10,
  ISAAC_ANM2_FRAME_WALK_SLOT_STRIDE = 4,
  /* walk 0 (0x00408b90) */
  ISAAC_ANM2_W0_DATA_COUNT_OFF = 0x1c,
  ISAAC_ANM2_W0_STATE_FRAMES_OFF = 0x08,
  ISAAC_ANM2_W0_DATA_LIST_OFF = 0x18,
  ISAAC_ANM2_W0_ELEM_STRIDE = 0x6c,
  ISAAC_ANM2_W0_ELEM_TIME_OFF = 0x68,
  ISAAC_ANM2_W0_LIST_COUNT_OFF = 0x08,
  ISAAC_ANM2_W0_LIST_BASE_OFF = 0x04,
  /* walk 1 (0x00408c10) */
  ISAAC_ANM2_W1_DATA_COUNT_OFF = 0x24,
  ISAAC_ANM2_W1_STATE_FRAMES_OFF = 0x0c,
  ISAAC_ANM2_W1_DATA_LIST_OFF = 0x20,
  ISAAC_ANM2_W1_ELEM_STRIDE = 0x54,
  ISAAC_ANM2_W1_ELEM_TIME_OFF = 0x50,
  ISAAC_ANM2_W1_LIST_COUNT_OFF = 0x0c,
  ISAAC_ANM2_W1_LIST_BASE_OFF = 0x08,
  /* Why a frame walk stopped. */
  ISAAC_ANM2_WALK_STOP_NOT_ENTERED = 3, /* stored frame was negative */
  ISAAC_ANM2_WALK_STOP_COUNT = 0,       /* signed jge against the entry count */
  ISAAC_ANM2_WALK_STOP_TIME = 1,        /* comiss set CF (below or unordered) */
  ISAAC_ANM2_WALK_STOP_WRAPPED = 2      /* jns after the store failed (D24) */
};

/* 0x00408d00 was the next untranslated VA at v4. v5 translates the body; the
   constant survives as the plan's rewind/advance VA record and in the docs.
   The ZHL catalog matches it to
   `__thiscall void AnimationState::AdvancePosition(int)` on only 13 pattern
   bytes, so the name is NOT promoted (v4 posture kept). */
enum { ISAAC_ANM2_HOST_VA_ADVANCE_POSITION = 0x00408d00u };

/* Raw `ah & 0x44` after `ucomiss a,b ; lahf`. Exactly one of 0x00 (ordered and
   unequal), 0x40 (ordered equal) or 0x44 (unordered): ucomiss never sets PF
   without ZF. Returning the byte rather than a bool lets a test pin the actual
   flag state instead of only the derived predicate. */
uint32_t isaac_anm2_ucomiss_ah_test44(uint32_t a_bits, uint32_t b_bits);

/* The full idiom `ucomiss ; lahf ; test ah,0x44 ; jp skip`: 1 when control
   FALLS THROUGH, i.e. when the parity of `ah & 0x44` is odd, i.e. only for
   0x40 â€” ordered and equal. Any NaN takes the skip. */
int32_t isaac_anm2_ucomiss_eq_bits(uint32_t a_bits, uint32_t b_bits);

/* CF after `comiss a,b`, which is what `jb` tests: a < b OR either unordered.
   This is the NaN direction the frame walk depends on â€” a NaN request stops
   the walk before its first store. */
int32_t isaac_anm2_comiss_below_bits(uint32_t a_bits, uint32_t b_bits);

/* `bts r32, r32` â€” the bit offset is taken modulo 32 (defect D21). */
uint32_t isaac_anm2_bts_mask(uint32_t bit_index);
uint32_t isaac_anm2_bts_apply(uint32_t value, uint32_t bit_index);

typedef struct IsaacAnm2PreWalkPlan {
  int32_t log_needed;        /* [state+0x04] == 0 at entry */
  uint32_t log_va;           /* 0x00a112c0 */
  int32_t log_level;         /* 0x10 */
  uint32_t log_str_va;       /* 0x00b1a504 */
  int32_t faults_after_log;  /* the re-read is STILL null -> the PE faults */
  int32_t entered;           /* count != 0, UNSIGNED */
  uint32_t count;            /* [data+0x2c] as observed at entry */
  uint32_t frame_bits;       /* [state+0x10], loaded ONCE before the loop */
  int32_t matches;           /* iterations that compared ORDERED EQUAL */
  uint32_t bits_18;          /* resulting [state+0x18] */
  uint32_t bits_1c;          /* resulting [state+0x1c] */
  int32_t iterations;        /* loop trips actually performed */
} IsaacAnm2PreWalkPlan;

/* Executes 0x00408c90 over a real AnimationState image. `state` points at a
   >= 0x20-byte image; [state+0x04] is a GUEST address of the AnimationData,
   whose 0x28/0x2c fields are read exactly where the PE reads them.
   A null descriptor is where the PE faults (D26); the harness convention is to
   report it through faults_after_log and touch nothing, exactly as the v1
   helpers suppress a store through a null heap pointer instead of writing
   linear address 0. state and out may each be null (no-op). */
void isaac_anm2_prewalk_apply(uint8_t* state, IsaacAnm2PreWalkPlan* out);

typedef struct IsaacAnm2FrameWalkParams {
  uint32_t data_count_off;
  uint32_t state_frames_off;
  uint32_t data_list_off;
  uint32_t elem_stride;
  uint32_t elem_time_off;
  uint32_t list_count_off;
  uint32_t list_base_off;
  uint32_t entry_stride;     /* 0x10 in both siblings */
} IsaacAnm2FrameWalkParams;

/* The per-index law recovered from the 10-byte sibling diff. out may be null. */
void isaac_anm2_frame_walk_params(int32_t which,
                                  IsaacAnm2FrameWalkParams* out);

typedef struct IsaacAnm2FrameWalkPlan {
  int32_t bound_ok;          /* data && index >= 0 && index < count (SIGNED) */
  int32_t log_needed;        /* !bound_ok â€” and it guards NOTHING (D20) */
  uint32_t log_va;
  int32_t log_level;
  uint32_t log_str_va;       /* 0x00b1a4f0, the same string 0x00408e00 used */
  int32_t recaptured;        /* animData re-read: LOG PATH ONLY */
  /* `add esi,[edx+LIST_OFF]` at 0x00408bd6 dereferences the descriptor
     UNCONDITIONALLY, after the frame slot has already been read and before the
     `test ecx,ecx ; js` early return. A null descriptor therefore faults there,
     no matter what the stored frame is. The harness reports it and stops
     instead of inventing a base â€” same convention as the v1 null-heap store. */
  int32_t faults_at_list_base;
  uint32_t frame_slot_ptr;   /* [state+FRAMES_OFF] + index*4, unclamped */
  uint32_t entry_ptr;        /* [data+LIST_OFF] + (index << 4), unclamped */
  int32_t start_frame;       /* *(int32*)frame_slot_ptr as read */
  int32_t final_frame;       /* what the slot holds on return */
  int32_t steps;             /* stores performed */
  int32_t stop_reason;       /* ISAAC_ANM2_WALK_STOP_* */
} IsaacAnm2FrameWalkPlan;

/* Executes 0x00408b90 (which == LAYER) or 0x00408c10 (which == NULL) over a
   real AnimationState image. `time_bits` is the raw xmm2 argument, taken as
   bits so a NaN survives the call boundary. state and out may be null. */
void isaac_anm2_frame_walk_apply(int32_t which,
                                 uint8_t* state,
                                 int32_t index,
                                 uint32_t time_bits,
                                 IsaacAnm2FrameWalkPlan* out);

/* ============ v5: Play family + state update chain ============ */

enum {
  /* 0x0040a380 / 0x0040a400 / 0x0040a2b0 share the gate matrix. */
  ISAAC_ANM2_OFF_ANIM_DATA_PTR_34 = 0x34,      /* ANM2->_animData (dword) */
  ISAAC_ANM2_OFF_PLAYING_FLAG_44 = 0x44,       /* primary state +0x14 byte */
  /* AnimationData std::string _name: SSO buf +0x00, size +0x10, cap +0x14. */
  ISAAC_ANM2_ANIM_NAME_SIZE_OFF = 0x10,
  ISAAC_ANM2_ANIM_NAME_CAP_OFF = 0x14,
  /* byte [data+0x34] â€” the AnimationData loop-ish flag tested by Play. */
  ISAAC_ANM2_DATA_OFF_RESTART_FLAG_34 = 0x34,
  /* [ANM2+0x109] _loaded byte tested by ANM2::Update. */
  ISAAC_ANM2_OFF_LOADED_BYTE_109 = 0x109,
  ISAAC_ANM2_PLAY_APPLY_VA = 0x0040a5d0u,      /* HOST walk+apply residual */
  ISAAC_ANM2_PLAY_VA = 0x0040a380u,
  ISAAC_ANM2_PLAY_INDEX_VA = 0x0040a400u,
  ISAAC_ANM2_PLAY_RANDOM_VA = 0x0040a2b0u,    /* no ZHL; address-stable */
  ISAAC_ANM2_STATE_UPDATE_VA = 0x00409030u,
  ISAAC_ANM2_ANM_UPDATE_VA = 0x00409100u,
  ISAAC_ANM2_PRED_VA = 0x0040a4d0u,
  ISAAC_ANM2_PRED_ALT_VA = 0x0040a550u,
  ISAAC_ANM2_REWIND_VA = 0x0040a1b0u,
  ISAAC_ANM2_ADVANCE_BACKWARD_LOG_STR_VA = 0x00b1a520u, /* "Animation::"
     "AdvancePosition cannot go backward (new: %%d, cur: %%d)\\n" */
  ISAAC_ANM2_ADVANCE_BACKWARD_LOG_LEVEL = 0x10,
  ISAAC_ANM2_INDEX_LOG_STR_VA = 0x00b1a5ecu,   /* "[warn] Animation index "
     "out of range!\\n" */
  ISAAC_ANM2_INDEX_LOG_LEVEL = 1,
  ISAAC_ANM2_PLAY_RANDOM_LOG_STR_VA = 0x00b1a5c8u, /* "[warn] PlayRandom: "
     "no animations\\n" — .rdata via section table */
  ISAAC_ANM2_PLAY_RANDOM_LOG_LEVEL = 1,
  ISAAC_ANM2_PLAY_RANDOM_CALLSITE_COUNT = 3,
  /* The 1.0f added to the frame in the AdvancePosition loop (0x00baa454). */
  ISAAC_ANM2_ADVANCE_STEP_BITS = 0x3f800000u,
  ISAAC_ANM2_ADVANCE_STEP_VA = 0x00baa454u,
  /* cvttss2si indefinite result (NaN, infinity, |x| >= 2^31). */
  ISAAC_ANM2_CVTTSS2SI_INDEFINITE = 0x80000000u,
  /* CRT floor through the PE import directory: api-ms-win-crt-math-l1-1-0,
     hint 224 (MODELED natively as f64.floor; zero imports). */
  ISAAC_ANM2_IAT_VA_FLOOR = 0x00b18840u,
  /* No-progress cap in the AdvancePosition loop (D28): floor(frame)+1.0f
     rounds back to frame once |frame| >= 2^24; the PE spins forever there. */
  ISAAC_ANM2_ADVANCE_RUNAWAY_AT = 0x1000000u
};

/* 0x0040a380 ANM2::Play(const char*, bool) plan. The gate inputs are all
   reported so a test can pin the matrix independently of skip. */
typedef struct IsaacAnm2PlayPlan {
  int32_t reset_flag;        /* stack arg [ebp+0xc] */
  int32_t data_null;         /* [anm2+0x34] == 0 */
  int32_t name_equal;        /* strcmp(data->name, requested) == 0 */
  int32_t data_34_flag;      /* byte [data+0x34] */
  int32_t state_44_flag;     /* byte [anm2+0x44] */
  int32_t skip;              /* gate skip: no 0x0040a5d0 call */
  int32_t call_apply;        /* !skip */
  uint32_t apply_va;         /* 0x0040a5d0 (HOST walk+apply residual) */
  int32_t apply_reset_arg;   /* 1 */
  uint32_t rewind_va;        /* 0x0040a1b0 (TRANSLATED) */
  int32_t rewind_ran;        /* apply-time: call_apply && host AL != 0 */
  int32_t flag_44_set;       /* apply-time: byte [anm2+0x44] = 1 */
} IsaacAnm2PlayPlan;

/* 0x0040a400 ANM2::Play(int, bool) plan. Same gate matrix with the element
   name as the query; the bounds test is SIGNED and precedes everything. */
typedef struct IsaacAnm2PlayIndexPlan {
  int32_t index_in_range;    /* SIGNED: 0 <= index < [anm2+0x78] */
  int32_t log_needed;        /* out of range */
  uint32_t log_va;           /* 0x00a112c0 */
  int32_t log_level;         /* 1 */
  uint32_t log_str_va;       /* 0x00b1a5ec */
  int32_t data_null;         /* [anm2+0x34] == 0 */
  int32_t name_equal;        /* strcmp(data->name, element name) == 0 */
  int32_t data_34_flag;
  int32_t state_44_flag;
  int32_t skip;
  int32_t call_apply;
  uint32_t apply_va;         /* 0x0040a5d0 */
  int32_t apply_reset_arg;   /* 1 */
  uint32_t rewind_va;        /* 0x0040a1b0 */
  int32_t rewind_ran;
  int32_t flag_44_set;
} IsaacAnm2PlayIndexPlan;

/* 0x0040a2b0 PlayRandom plan. UNSIGNED `xor edx,edx ; div ecx` remainder
   of the seed dword against [anm2+0x78]. count==0 logs and never touches
   the gate; otherwise the shared Play gate runs with the SSO-selected
   element name and reset implicit 0. */
typedef struct IsaacAnm2PlayRandomPlan {
  int32_t entered;           /* 1 for a non-null anm2 image */
  uint32_t count;            /* [anm2+0x78] FULL DWORD */
  int32_t count_zero;        /* count == 0 (test ecx,ecx) */
  int32_t log_needed;        /* count == 0 */
  uint32_t log_va;           /* 0x00a112c0 */
  int32_t log_level;         /* 1 */
  uint32_t log_str_va;       /* 0x00b1a5c8 */
  uint32_t seed;             /* [ebp+8] FULL DWORD */
  uint32_t remainder;        /* UNSIGNED seed % count; 0 if count==0 */
  int32_t data_null;
  int32_t name_equal;
  int32_t data_34_flag;
  int32_t state_44_flag;
  int32_t skip;
  int32_t call_apply;
  uint32_t apply_va;         /* 0x0040a5d0 */
  int32_t apply_reset_arg;   /* 1 */
  uint32_t rewind_va;        /* 0x0040a1b0 */
  int32_t rewind_ran;
  int32_t flag_44_set;
} IsaacAnm2PlayRandomPlan;

/* 0x0040a1b0 AnimationState::Rewind plan. */
typedef struct IsaacAnm2RewindPlan {
  int32_t prewalk_log_needed;  /* null descriptor inside the v4 prewalk */
  int32_t prewalk_faulted;     /* prewalk still null -> the PE dies there */
  int32_t faults_at_count;     /* [state+4] == 0 at the first count compare */
  uint32_t count0;             /* [data+0x1c] at entry */
  uint32_t count1;             /* [data+0x24] from the LAST data re-read */
  int32_t zeros0;              /* layer frame slots zeroed */
  int32_t zeros1;              /* null frame slots zeroed */
  int32_t faults_at_slot;      /* frames ptr == 0 with a non-zero count */
} IsaacAnm2RewindPlan;

/* 0x00408d00 AnimationState::AdvancePosition(int) plan. */
typedef struct IsaacAnm2AdvancePositionPlan {
  int32_t log_needed;          /* target < (int)floor(frame), SIGNED */
  uint32_t log_va;             /* 0x00a112c0 */
  int32_t log_level;           /* 0x10 */
  uint32_t log_str_va;         /* 0x00b1a520 */
  int32_t log_new_arg;         /* target */
  int32_t log_cur_arg;         /* (int)floor(frame) */
  uint32_t frame_snapshot_bits; /* [state+0x10] at entry */
  uint32_t floor_bits;         /* (float32)floor(frame) */
  int32_t floor_int;           /* cvttss2si of floor_bits */
  uint32_t selected_bits;      /* snapshot, or RE-READ after the log */
  uint32_t target_f_bits;      /* cvtdq2ps(target) */
  int32_t loop_entered;        /* ordered target > selected (comiss ja) */
  int32_t iterations;          /* loop trips */
  int32_t runaway;             /* D28: floor(frame)+1.0f made no progress */
  int32_t prewalk_log_needed;  /* last prewalk inside the loop */
  int32_t prewalk_faulted;
  int32_t faults_at_walk_entry;/* [state+4] == 0 at the walk entry compare */
  int32_t walk0_iterations;    /* LAYER walk trips */
  int32_t walk1_iterations;    /* NULL walk trips */
  int32_t host_call_count;     /* 0: the advisory log is modelled, not counted */
} IsaacAnm2AdvancePositionPlan;

/* 0x00409030 AnimationState update plan. */
typedef struct IsaacAnm2StateUpdatePlan {
  int32_t entered;             /* data && playing flag */
  int32_t data_null;           /* exit at 0x0040903d */
  int32_t flag_clear;          /* exit at 0x00409045 */
  uint32_t frame_bits;         /* [state+0x10] */
  uint32_t speed_bits;         /* [ANM2+0x104] _playbackSpeed */
  uint32_t frame_plus_speed_bits; /* float32 add result */
  uint32_t floor_bits;         /* (float32)floor(frame+speed) or floor(frame) */
  int32_t floor_int;           /* cvttss2si */
  int32_t length;              /* [data+0x30] */
  int32_t below_length;        /* floor_int < length, SIGNED */
  int32_t data_34_flag;        /* byte [data+0x34] */
  int32_t rewind_path;         /* floor >= length && data_34 */
  int32_t wrap_path;           /* floor >= length && !data_34 */
  int32_t wrap_target;         /* length - 1 (32-bit wrap) */
  int32_t wrap_advance_called; /* (int)(length-1) >= (int)floor(frame), SIGNED */
  int32_t advance_path;        /* floor < length */
  int32_t advance_target;      /* the target handed to AdvancePosition */
  int32_t flag_cleared;        /* wrap path: byte [state+0x14] = 0 */
  int32_t frame_stored;        /* advance path: [state+0x10] = frame+speed */
  int32_t host_call_count;     /* 0: floor is modeled, the rest is pure */
} IsaacAnm2StateUpdatePlan;

/* 0x00409100 ANM2::Update plan (exact ZHL, 22 bytes). */
typedef struct IsaacAnm2AnmUpdatePlan {
  int32_t loaded;              /* byte [anm2+0x109] */
  int32_t state0_entered;
  int32_t state1_entered;
  int32_t host_call_count;     /* 0 */
} IsaacAnm2AnmUpdatePlan;

/* The float primitives of the chain, carried as bits:
   - floor_f32_bits: (float32)floor((double)float32); NaN passes through.
   - cvttss2si_bits: truncation with the SSE indefinite for NaN/inf/|x|>=2^31.
   - comiss_jbe_bits: `jbe` after comiss a,b -> !(ordered a > b).
   - comiss_ja_bits:  `ja`  after comiss a,b -> ordered a > b. */
uint32_t isaac_anm2_floor_f32_bits(uint32_t x_bits);
int32_t isaac_anm2_cvttss2si_bits(uint32_t f_bits);
int32_t isaac_anm2_comiss_jbe_bits(uint32_t a_bits, uint32_t b_bits);
int32_t isaac_anm2_comiss_ja_bits(uint32_t a_bits, uint32_t b_bits);

/* The Play gate matrix (0x0040a380, 0x0040a400, 0x0040a2b0 share it):
   skip = !reset && !data_null && name_equal && (data_34_flag == 0 ||
          state_44_flag != 0). */
int32_t isaac_anm2_play_gate_skip(int32_t reset_flag,
                                  int32_t data_null,
                                  int32_t name_equal,
                                  int32_t data_34_flag,
                                  int32_t state_44_flag);

/* 0x0040a380. anm2 points at the ANM2 image; name_addr is the GUEST address
   of the requested C string (the boundary passes resolved literals). The
   plan is filled from the image; apply additionally performs the rewind +
   flag store when call_apply && host_apply_al (host_apply_al is what the HOST
   0x0040a5d0 returned in AL). state/out may be null. */
void isaac_anm2_play_plan(uint8_t* anm2,
                          uint32_t name_addr,
                          int32_t reset_flag,
                          IsaacAnm2PlayPlan* out);
void isaac_anm2_play_apply(uint8_t* anm2,
                           uint32_t name_addr,
                           int32_t reset_flag,
                           int32_t host_apply_al,
                           IsaacAnm2PlayPlan* out);

/* 0x0040a400. The element name is read from [anm2+0x74] + index*0x13c
   (SSO-select); out-of-range indexes log and never touch the gate. */
void isaac_anm2_play_index_plan(uint8_t* anm2,
                                int32_t index,
                                IsaacAnm2PlayIndexPlan* out);
void isaac_anm2_play_index_apply(uint8_t* anm2,
                                 int32_t index,
                                 int32_t host_apply_al,
                                 IsaacAnm2PlayIndexPlan* out);

/* 0x0040a2b0. seed is the raw [ebp+8] dword (UNSIGNED dividend). count==0
   logs and returns; else rem = seed % count (unsigned) indexes the
   element array and the shared Play gate runs with reset implicit 0.
   host_apply_al is the HOST 0x0040a5d0 AL return — BYTE gate. */
void isaac_anm2_play_random_plan(uint8_t* anm2,
                                 uint32_t seed,
                                 IsaacAnm2PlayRandomPlan* out);
void isaac_anm2_play_random_apply(uint8_t* anm2,
                                  uint32_t seed,
                                  int32_t host_apply_al,
                                  IsaacAnm2PlayRandomPlan* out);

/* 0x0040a4d0: 1 iff data && byte[anm2+0x44] && (name empty || strcmp == 0). */
int32_t isaac_anm2_playing_name_pred(uint8_t* anm2, uint32_t name_addr);

/* 0x0040a550 (D27): null-data path decides on the raw name POINTER, so any
   non-null name (including "") returns 0 there. */
int32_t isaac_anm2_playing_name_pred_alt(uint8_t* anm2, uint32_t name_addr);

/* 0x0040a1b0: zero frame + trigger fields, prewalk, zero both frame arrays
   (counts and pointers RE-READ per iteration, UNSIGNED bounds). */
void isaac_anm2_rewind_apply(uint8_t* state, IsaacAnm2RewindPlan* out);

/* 0x00408d00 (kept address-stable; weak 13-byte ZHL signature). */
void isaac_anm2_advance_position_apply(uint8_t* state,
                                       int32_t target,
                                       IsaacAnm2AdvancePositionPlan* out);

/* 0x00409030 (address-stable AnimationState update). */
void isaac_anm2_state_update_apply(uint8_t* state,
                                   IsaacAnm2StateUpdatePlan* out);

/* 0x00409100 ANM2::Update (exact ZHL, 22 bytes): both states, tail call. */
void isaac_anm2_anm_update_apply(uint8_t* anm2,
                                 IsaacAnm2AnmUpdatePlan* out);

/* ============ v11: 0x0040a220 layer-frame getter ============ */

enum {
  ISAAC_ANM2_LAYER_FRAME_VA = 0x0040a220u,      /* no ZHL; address-stable */
  ISAAC_ANM2_LAYER_FRAME_END_VA = 0x0040a2a4u,  /* `ret 4` */
  ISAAC_ANM2_LAYER_FRAME_LOG_NULL_STR_VA = 0x00b1a504u, /* "AnimationData is NULL\\n" */
  ISAAC_ANM2_LAYER_FRAME_LOG_BOUND_STR_VA = 0x00b1a564u, /* "LayerId out of bounds\\n" */
  ISAAC_ANM2_LAYER_FRAME_LOG_LEVEL = 0x10,
  ISAAC_ANM2_LAYER_FRAME_CALLSITE_COUNT = 52,
  ISAAC_ANM2_DATA_OFF_LAYER_MAP_38 = 0x38,      /* int _layerMap[] */
  ISAAC_ANM2_LAYER_FRAME_ELEM_STRIDE = 0x6c,    /* imul eax, eax, 0x6c */
  ISAAC_ANM2_LAYER_FRAME_NEXT_VA = 0x0040a360u  /* SSO trampoline into Play */
};

/* 0x0040a220 plan. layer_id is the raw SIGNED [ebp+8]. Both logs are
   ADVISORY (D29: log uses `jl`, body uses `jg`, so layerId==count
   logs then continues). result is the guest AnimationFrame* or 0. */
typedef struct IsaacAnm2LayerFramePlan {
  int32_t entered;             /* 1 for a non-null state image */
  int32_t layer_id;            /* [ebp+8] SIGNED */
  int32_t data_null;           /* [state+4]==0 at the FIRST test */
  int32_t log_null_needed;     /* advisory AnimationData-is-NULL log */
  uint32_t log_null_str_va;    /* 0x00b1a504 */
  int32_t log_bound_needed;    /* advisory LayerId-out-of-bounds log */
  uint32_t log_bound_str_va;   /* 0x00b1a564 */
  uint32_t log_va;             /* 0x00a112c0 */
  int32_t log_level;           /* 0x10 */
  uint32_t anm2_ptr;           /* [state+0] at the FIRST bound check */
  int32_t anm2_layer_count;    /* SIGNED [anm2+0x80] at the FIRST check */
  uint32_t data_ptr;           /* [state+4] RE-READ at the body */
  int32_t data_null_post;      /* that re-read was 0 */
  int32_t map_index;           /* [data + layerId*4 + 0x38], 0 if skipped */
  int32_t layer_count_1c;      /* SIGNED [data+0x1c], 0 if skipped */
  int32_t frame_index;         /* [_layerFrames + map*4], 0 if skipped */
  uint32_t frames_ptr;         /* [state+8] */
  uint32_t entry_ptr;          /* [data+0x18] + map*0x10, 0 if skipped */
  int32_t list_count;          /* SIGNED [entry+8], 0 if skipped */
  uint32_t result;             /* guest AnimationFrame* or 0 */
  int32_t hit;                 /* result != 0 */
  int32_t host_call_count;     /* 0: both logs are advisory, not counted */
} IsaacAnm2LayerFramePlan;

/* 0x0040a220. state points at the AnimationState image; layer_id is
   the raw SIGNED stack arg. Fills the plan and returns result. */
uint32_t isaac_anm2_layer_frame_plan(uint8_t* state,
                                     int32_t layer_id,
                                     IsaacAnm2LayerFramePlan* out);

/* ============ v12: 0x0040a360 SSO trampoline into Play ============ */

enum {
  ISAAC_ANM2_PLAY_SSO_VA = 0x0040a360u,        /* no ZHL; address-stable */
  ISAAC_ANM2_PLAY_SSO_END_VA = 0x0040a377u,    /* first int3 after jmp */
  ISAAC_ANM2_PLAY_SSO_TARGET_VA = 0x0040a380u, /* exact ZHL ANM2::Play */
  ISAAC_ANM2_PLAY_SSO_CALLSITE_COUNT = 12,     /* .text e8 only */
  ISAAC_ANM2_PLAY_SSO_LUA_PUSH_VA = 0x00867262u,
  ISAAC_ANM2_PLAY_SSO_LUA_PUSH_COUNT = 1,
  ISAAC_ANM2_PLAY_SSO_NEXT_VA = 0x0040a4b0u    /* sibling SSO into 0x40a4d0 */
};

/* 0x0040a360 plan. str_addr is the raw std::string* at [ebp+8].
   SSO-select is UNSIGNED `jb` against cap 0x10 (cap == 0x10 already
   heap). The Play gate / tail is consumed BY REFERENCE. */
typedef struct IsaacAnm2PlaySsoPlan {
  int32_t entered;           /* 1 for a non-null anm2 image */
  uint32_t str_addr;         /* [ebp+8] std::string* */
  uint32_t cap;              /* [str+0x14]; 0 if str_addr == 0 */
  int32_t heap_used;         /* cap >= 0x10 UNSIGNED */
  uint32_t name_addr;        /* resolved char*; 0 if str_addr == 0 */
  int32_t reset_flag;        /* stack arg [ebp+0xc], forwarded */
  int32_t data_null;         /* from Play */
  int32_t name_equal;
  int32_t data_34_flag;
  int32_t state_44_flag;
  int32_t skip;
  int32_t call_apply;
  uint32_t apply_va;
  int32_t apply_reset_arg;
  uint32_t rewind_va;
  int32_t rewind_ran;
  int32_t flag_44_set;
} IsaacAnm2PlaySsoPlan;

void isaac_anm2_play_sso_plan(uint8_t* anm2,
                              uint32_t str_addr,
                              int32_t reset_flag,
                              IsaacAnm2PlaySsoPlan* out);

void isaac_anm2_play_sso_apply(uint8_t* anm2,
                               uint32_t str_addr,
                               int32_t reset_flag,
                               int32_t host_apply_al,
                               IsaacAnm2PlaySsoPlan* out);

/* ============ v13: 0x0040a4b0 SSO trampoline into pred ============ */

enum {
  ISAAC_ANM2_PLAYING_SSO_VA = 0x0040a4b0u,      /* no ZHL; address-stable */
  ISAAC_ANM2_PLAYING_SSO_END_VA = 0x0040a4c7u,  /* first int3 after jmp */
  ISAAC_ANM2_PLAYING_SSO_TARGET_VA = 0x0040a4d0u, /* already-translated pred */
  ISAAC_ANM2_PLAYING_SSO_CALLSITE_COUNT = 0,    /* .text e8 only */
  ISAAC_ANM2_PLAYING_SSO_LUA_PUSH_VA = 0x008673dcu,
  ISAAC_ANM2_PLAYING_SSO_LUA_PUSH_COUNT = 1,
  ISAAC_ANM2_PLAYING_SSO_NEXT_VA = 0x0040a530u  /* sibling SSO into 0x40a550 */
};

/* 0x0040a4b0 plan. str_addr is the raw std::string* at [ebp+8].
   SSO-select is UNSIGNED `jb` against cap 0x10 (cap == 0x10 already
   heap). The 0x0040a4d0 pred is consumed BY REFERENCE. */
typedef struct IsaacAnm2PlayingSsoPlan {
  int32_t entered;           /* 1 for a non-null anm2 image */
  uint32_t str_addr;         /* [ebp+8] std::string* */
  uint32_t cap;              /* [str+0x14]; 0 if str_addr == 0 */
  int32_t heap_used;         /* cap >= 0x10 UNSIGNED */
  uint32_t name_addr;        /* resolved char*; 0 if str_addr == 0 */
  int32_t result;            /* pred AL */
} IsaacAnm2PlayingSsoPlan;

void isaac_anm2_playing_sso_plan(uint8_t* anm2,
                                 uint32_t str_addr,
                                 IsaacAnm2PlayingSsoPlan* out);

/* ============ v14: 0x0040a530 SSO trampoline into pred_alt ============ */

enum {
  ISAAC_ANM2_PLAYING_SSO_ALT_VA = 0x0040a530u,      /* no ZHL; address-stable */
  ISAAC_ANM2_PLAYING_SSO_ALT_END_VA = 0x0040a547u,  /* first int3 after jmp */
  ISAAC_ANM2_PLAYING_SSO_ALT_TARGET_VA = 0x0040a550u, /* already-translated pred_alt */
  ISAAC_ANM2_PLAYING_SSO_ALT_CALLSITE_COUNT = 0,    /* .text e8 only */
  ISAAC_ANM2_PLAYING_SSO_ALT_LUA_PUSH_VA = 0x0086724eu,
  ISAAC_ANM2_PLAYING_SSO_ALT_LUA_PUSH_COUNT = 1,
  ISAAC_ANM2_PLAYING_SSO_ALT_NEXT_VA = 0x0040a5b0u  /* sibling SSO into 0x40a5d0 */
};

/* 0x0040a530 plan. str_addr is the raw std::string* at [ebp+8].
   SSO-select is UNSIGNED `jb` against cap 0x10 (cap == 0x10 already
   heap). The 0x0040a550 pred_alt is consumed BY REFERENCE. */
typedef struct IsaacAnm2PlayingSsoAltPlan {
  int32_t entered;           /* 1 for a non-null anm2 image */
  uint32_t str_addr;         /* [ebp+8] std::string* */
  uint32_t cap;              /* [str+0x14]; 0 if str_addr == 0 */
  int32_t heap_used;         /* cap >= 0x10 UNSIGNED */
  uint32_t name_addr;        /* resolved char*; 0 if str_addr == 0 */
  int32_t result;            /* pred_alt AL */
} IsaacAnm2PlayingSsoAltPlan;

void isaac_anm2_playing_sso_alt_plan(uint8_t* anm2,
                                     uint32_t str_addr,
                                     IsaacAnm2PlayingSsoAltPlan* out);

/* ============ v15: 0x0040a5b0 SSO trampoline into walk+apply ============ */

enum {
  ISAAC_ANM2_WALK_APPLY_SSO_VA = 0x0040a5b0u,      /* no ZHL; address-stable */
  ISAAC_ANM2_WALK_APPLY_SSO_END_VA = 0x0040a5c7u,  /* first int3 after jmp */
  ISAAC_ANM2_WALK_APPLY_SSO_TARGET_VA = 0x0040a5d0u, /* already-translated walk+apply */
  ISAAC_ANM2_WALK_APPLY_SSO_CALLSITE_COUNT = 0,    /* .text e8 only */
  ISAAC_ANM2_WALK_APPLY_SSO_LUA_PUSH_VA = 0x0086739du,
  ISAAC_ANM2_WALK_APPLY_SSO_LUA_PUSH_COUNT = 1,
  ISAAC_ANM2_WALK_APPLY_SSO_NEXT_VA = 0x0040a690u  /* SSO trampoline + frame-set tail */
};

/* 0x0040a5b0 plan. str_addr is the raw std::string* at [ebp+8].
   SSO-select is UNSIGNED `jb` against cap 0x10 (cap == 0x10 already
   heap). The 0x0040a5d0 walk+apply is consumed BY REFERENCE. */
typedef struct IsaacAnm2WalkApplySsoPlan {
  int32_t entered;           /* 1 for a non-null anm2 image */
  uint32_t str_addr;         /* [ebp+8] std::string* */
  uint32_t cap;              /* [str+0x14]; 0 if str_addr == 0 */
  int32_t heap_used;         /* cap >= 0x10 UNSIGNED */
  uint32_t name_addr;        /* resolved char*; 0 if str_addr == 0 */
  int32_t reset_flag;        /* stack arg [ebp+0xc], forwarded */
  int32_t found;             /* from walk+apply */
  int32_t found_index;
  uint32_t elem_byte_offset;
  int32_t warn_log_needed;
  uint32_t warn_log_va;
  int32_t warn_log_level;
  uint32_t warn_log_str_va;
  uint32_t apply_va;
  uint32_t apply_recv_off;
  int32_t result;
  int32_t host_call_count;
} IsaacAnm2WalkApplySsoPlan;

void isaac_anm2_walk_apply_sso_plan(uint8_t* anm2,
                                    uint32_t str_addr,
                                    int32_t reset_flag,
                                    IsaacAnm2WalkApplySsoPlan* out);

/* ============ v16: 0x0040a690 ANM2::SetFrame(std_string*, int) ============ */

enum {
  ISAAC_ANM2_SET_FRAME_VA = 0x0040a690u,       /* exact ZHL, 32 pattern bytes */
  ISAAC_ANM2_SET_FRAME_END_VA = 0x0040a6d3u,   /* `ret 8` */
  ISAAC_ANM2_SET_FRAME_WALK_VA = 0x0040a5d0u,  /* already-translated walk+apply */
  ISAAC_ANM2_SET_FRAME_ADVANCE_VA = 0x00408e00u, /* already-translated advance */
  ISAAC_ANM2_SET_FRAME_CALLSITE_COUNT = 15,    /* .text e8 only */
  ISAAC_ANM2_SET_FRAME_LUA_PUSH_VA = 0x00867277u,
  ISAAC_ANM2_SET_FRAME_LUA_PUSH_COUNT = 1,
  ISAAC_ANM2_SET_FRAME_RESET_IMM = 1,          /* push 1 before 0x40a5d0 */
  ISAAC_ANM2_SET_FRAME_NEXT_VA = 0x0040a6e0u   /* const-char* SetFrame sibling */
};

/* 0x0040a690 plan. str_addr is the raw std::string* at [ebp+8].
   SSO-select is UNSIGNED `jb` against cap 0x10 (cap == 0x10 already
   heap). frame is the raw SIGNED [ebp+0xc]. The 0x0040a5d0 walk+apply
   (reset IMM 1) and 0x00408e00 advance are consumed BY REFERENCE. */
typedef struct IsaacAnm2SetFramePlan {
  int32_t entered;           /* 1 for a non-null anm2 image */
  uint32_t str_addr;         /* [ebp+8] std::string* */
  uint32_t cap;              /* [str+0x14]; 0 if str_addr == 0 */
  int32_t heap_used;         /* cap >= 0x10 UNSIGNED */
  uint32_t name_addr;        /* resolved char*; 0 if str_addr == 0 */
  int32_t frame;             /* [ebp+0xc] SIGNED */
  uint32_t frame_f_bits;     /* cvtdq2ps(frame) */
  int32_t found;             /* from walk+apply (reset IMM 1) */
  int32_t found_index;
  uint32_t elem_byte_offset;
  int32_t warn_log_needed;
  uint32_t warn_log_va;
  int32_t warn_log_level;
  uint32_t warn_log_str_va;
  uint32_t apply_va;
  uint32_t apply_recv_off;
  int32_t walk_result;       /* walk+apply AL */
  int32_t data_present;      /* [this+0x34] at first post-walk test */
  int32_t data_present_post; /* [this+0x34] RE-READ after 0x408e00 */
  int32_t advance_ran;       /* walk AL && data_present */
  int32_t flag_44_cleared;   /* advance_ran && data_present_post */
  int32_t host_call_count;   /* walk host + (advance_ran ? 1 : 0) */
} IsaacAnm2SetFramePlan;

void isaac_anm2_set_frame_plan(uint8_t* anm2,
                               uint32_t str_addr,
                               int32_t frame,
                               IsaacAnm2SetFramePlan* out);

void isaac_anm2_set_frame_apply(uint8_t* anm2,
                                uint32_t str_addr,
                                int32_t frame,
                                IsaacAnm2SetFramePlan* out);

/* ============ v17: 0x0040a6e0 const-char* SetFrame sibling ============ */

enum {
  ISAAC_ANM2_SET_FRAME_CSTR_VA = 0x0040a6e0u,      /* no ZHL — address-stable */
  ISAAC_ANM2_SET_FRAME_CSTR_END_VA = 0x0040a71au,  /* `ret 8` */
  ISAAC_ANM2_SET_FRAME_CSTR_WALK_VA = 0x0040a5d0u, /* already-translated walk+apply */
  ISAAC_ANM2_SET_FRAME_CSTR_ADVANCE_VA = 0x00408e00u, /* already-translated advance */
  ISAAC_ANM2_SET_FRAME_CSTR_CALLSITE_COUNT = 80,   /* .text e8 only */
  ISAAC_ANM2_SET_FRAME_CSTR_LUA_PUSH_COUNT = 0,    /* no imm32 push / LE-dword */
  ISAAC_ANM2_SET_FRAME_CSTR_RESET_IMM = 1,         /* push 1 before 0x40a5d0 */
  ISAAC_ANM2_SET_FRAME_CSTR_NEXT_VA = 0x0040a720u  /* next small helper in dump */
};

/* 0x0040a6e0 plan. name_addr is the raw const char* at [ebp+8]
   (no SSO). frame is the raw SIGNED [ebp+0xc]. The 0x0040a5d0
   walk+apply (reset IMM 1) and 0x00408e00 advance are consumed
   BY REFERENCE. Same gated byte +0x44 tail as v16 SetFrame. */
typedef struct IsaacAnm2SetFrameCstrPlan {
  int32_t entered;           /* 1 for a non-null anm2 image */
  uint32_t name_addr;        /* [ebp+8] const char* */
  int32_t frame;             /* [ebp+0xc] SIGNED */
  uint32_t frame_f_bits;     /* cvtdq2ps(frame) */
  int32_t found;             /* from walk+apply (reset IMM 1) */
  int32_t found_index;
  uint32_t elem_byte_offset;
  int32_t warn_log_needed;
  uint32_t warn_log_va;
  int32_t warn_log_level;
  uint32_t warn_log_str_va;
  uint32_t apply_va;
  uint32_t apply_recv_off;
  int32_t walk_result;       /* walk+apply AL */
  int32_t data_present;      /* [this+0x34] at first post-walk test */
  int32_t data_present_post; /* [this+0x34] RE-READ after 0x408e00 */
  int32_t advance_ran;       /* walk AL && data_present */
  int32_t flag_44_cleared;   /* advance_ran && data_present_post */
  int32_t host_call_count;   /* walk host + (advance_ran ? 1 : 0) */
} IsaacAnm2SetFrameCstrPlan;

void isaac_anm2_set_frame_cstr_plan(uint8_t* anm2,
                                    uint32_t name_addr,
                                    int32_t frame,
                                    IsaacAnm2SetFrameCstrPlan* out);

void isaac_anm2_set_frame_cstr_apply(uint8_t* anm2,
                                     uint32_t name_addr,
                                     int32_t frame,
                                     IsaacAnm2SetFrameCstrPlan* out);

/* ============ v18: 0x0040a720 current-anim SetFrame(int) ============ */

enum {
  ISAAC_ANM2_SET_FRAME_CUR_VA = 0x0040a720u,      /* no ZHL — address-stable */
  ISAAC_ANM2_SET_FRAME_CUR_END_VA = 0x0040a73cu,  /* `ret 4` */
  ISAAC_ANM2_SET_FRAME_CUR_ADVANCE_VA = 0x00408e00u, /* already-translated advance */
  ISAAC_ANM2_SET_FRAME_CUR_CALLSITE_COUNT = 55,   /* .text e8 only */
  ISAAC_ANM2_SET_FRAME_CUR_LUA_PUSH_VA = 0x0086728cu,
  ISAAC_ANM2_SET_FRAME_CUR_LUA_PUSH_COUNT = 1,
  ISAAC_ANM2_SET_FRAME_CUR_LE_DWORD_COUNT = 2,    /* lua push + 0x0089f0a7 store */
  ISAAC_ANM2_SET_FRAME_CUR_NEXT_VA = 0x0040a740u  /* next small helper in dump */
};

/* 0x0040a720 plan. frame is the raw SIGNED [ebp+8].
   [this+0x34] is a full-dword test. 0x00408e00 is consumed
   BY REFERENCE; this wrapper stores nothing on the ANM2 image. */
typedef struct IsaacAnm2SetFrameCurPlan {
  int32_t entered;           /* 1 for a non-null anm2 image */
  int32_t frame;             /* [ebp+8] SIGNED */
  uint32_t frame_f_bits;     /* cvtdq2ps(frame) */
  int32_t data_present;      /* [this+0x34] != 0 */
  int32_t advance_ran;       /* data_present */
  int32_t host_call_count;   /* advance_ran ? 1 : 0 */
} IsaacAnm2SetFrameCurPlan;

void isaac_anm2_set_frame_cur_plan(uint8_t* anm2,
                                   int32_t frame,
                                   IsaacAnm2SetFrameCurPlan* out);

/* ============ v19: 0x0040a740 current-anim advance (no frame) ============ */

enum {
  ISAAC_ANM2_ADVANCE_CUR_VA = 0x0040a740u,      /* no ZHL — address-stable */
  ISAAC_ANM2_ADVANCE_CUR_END_VA = 0x0040a750u,  /* `ret` */
  ISAAC_ANM2_ADVANCE_CUR_BODY_BYTES = 0x11,     /* 0x0040a740..0x0040a750 incl. */
  ISAAC_ANM2_ADVANCE_CUR_DATA_OFF = 0x34,       /* cmp dword [ecx+0x34], 0 */
  ISAAC_ANM2_ADVANCE_CUR_ADVANCE_OFF = 0x30,    /* add ecx, 0x30 */
  ISAAC_ANM2_ADVANCE_CUR_ADVANCE_VA = 0x00408e00u, /* already-translated advance */
  ISAAC_ANM2_ADVANCE_CUR_CALLSITE_COUNT = 4,    /* .text e8 only */
  ISAAC_ANM2_ADVANCE_CUR_LUA_PUSH_COUNT = 0,
  ISAAC_ANM2_ADVANCE_CUR_LE_DWORD_COUNT = 0,
  ISAAC_ANM2_ADVANCE_CUR_NEXT_VA = 0x0040a760u  /* next small helper in dump */
};

/* needed(data_dword): FULL-dword test. 0x100 is needed. */
int32_t isaac_anm2_advance_cur_needed(uint32_t data_dword);

/* 0x0040a740 plan. No frame arg. [this+0x34] is a full-dword
   test. 0x00408e00 is consumed BY REFERENCE; this wrapper
   stores nothing on the ANM2 image. */
typedef struct IsaacAnm2AdvanceCurPlan {
  int32_t entered;              /* 1 for a non-null anm2 image */
  int32_t needed;               /* [this+0x34] != 0 (FULL dword) */
  uint32_t data_dword;          /* raw [this+0x34] */
  int32_t advance_ran;          /* needed */
  uint32_t advance_recv_off;    /* 0x30 */
  uint32_t host_or_advance_va;  /* 0x408e00 */
  int32_t host_call_count;      /* advance_ran ? 1 : 0 */
} IsaacAnm2AdvanceCurPlan;

void isaac_anm2_advance_cur_plan(uint8_t* anm2,
                                 IsaacAnm2AdvanceCurPlan* out);

/* ============ v20: 0x0040a760 AdvancePosition to [data+0x30]-1 ============ */

enum {
  ISAAC_ANM2_ADVANCE_POS_CUR_VA = 0x0040a760u,      /* no ZHL — address-stable */
  ISAAC_ANM2_ADVANCE_POS_CUR_END_VA = 0x0040a778u,  /* `ret` */
  ISAAC_ANM2_ADVANCE_POS_CUR_BODY_BYTES = 0x19,     /* 0x0040a760..0x0040a778 incl. */
  ISAAC_ANM2_ADVANCE_POS_CUR_DATA_OFF = 0x34,       /* cmp dword [ecx+0x34], 0 */
  ISAAC_ANM2_ADVANCE_POS_CUR_STATE_OFF = 0x30,      /* add ecx, 0x30 */
  ISAAC_ANM2_ADVANCE_POS_CUR_ADVANCE_VA = 0x00408d00u, /* already-translated AdvancePosition */
  ISAAC_ANM2_ADVANCE_POS_CUR_NEXT_VA = 0x0040a780u  /* next helper in dump — NOT opened */
};

/* needed(data_dword): FULL-dword test. Same gate as v19 0x40a740. 0x100 is needed. */
int32_t isaac_anm2_advance_pos_cur_needed(uint32_t data_dword);

/* target_from_data(data_plus_0x30): [data+0x30] - 1, 32-bit wrap (`dec eax`). */
int32_t isaac_anm2_advance_pos_cur_target_from_data(uint32_t data_plus_0x30);

/* 0x0040a760 plan. No frame arg. [this+0x34] is a full-dword
   test. Target is [data+0x30]-1. 0x00408d00 is consumed
   BY REFERENCE; this wrapper stores nothing on the ANM2 image. */
typedef struct IsaacAnm2AdvancePosCurPlan {
  int32_t entered;              /* 1 for a non-null anm2 image */
  int32_t needed;               /* [this+0x34] != 0 (FULL dword) */
  uint32_t data_dword;          /* raw [this+0x34] */
  int32_t target;               /* [data+0x30]-1 (i32 wrap); 0 if !needed */
  int32_t advance_ran;          /* needed */
  uint32_t advance_recv_off;    /* 0x30 */
  uint32_t host_or_advance_va;  /* 0x408d00 */
  int32_t host_call_count;      /* advance_ran ? 1 : 0 */
} IsaacAnm2AdvancePosCurPlan;

void isaac_anm2_advance_pos_cur_plan(uint8_t* anm2,
                                     IsaacAnm2AdvancePosCurPlan* out);

/* ============ v21: 0x0040a780 GetFrame-int + 0x0040a7c0 GetFrame-float ============ */

enum {
  ISAAC_ANM2_GET_FRAME_INT_VA = 0x0040a780u,      /* no ZHL — address-stable */
  ISAAC_ANM2_GET_FRAME_INT_END_VA = 0x0040a7b3u,  /* `ret` */
  ISAAC_ANM2_GET_FRAME_INT_BODY_BYTES = 0x34,     /* 0x0040a780..0x0040a7b3 incl. */
  ISAAC_ANM2_GET_FRAME_INT_DATA_OFF = 0x34,       /* cmp dword [ecx+0x34], 0 */
  ISAAC_ANM2_GET_FRAME_INT_FRAME_OFF = 0x40,      /* fld [ecx+0x40] */
  ISAAC_ANM2_GET_FRAME_INT_FLOOR_THUNK_VA = 0x00af0917u, /* jmp [0x00b18840] */
  ISAAC_ANM2_GET_FRAME_INT_CALLSITE_COUNT = 82,   /* .text e8 only */
  ISAAC_ANM2_GET_FRAME_INT_NEXT_VA = 0x0040a7c0u, /* sibling getter — peeled here */
  ISAAC_ANM2_GET_FRAME_F32_VA = 0x0040a7c0u,      /* no ZHL — address-stable */
  ISAAC_ANM2_GET_FRAME_F32_END_VA = 0x0040a7d4u,  /* `ret` */
  ISAAC_ANM2_GET_FRAME_F32_BODY_BYTES = 0x15,     /* 0x0040a7c0..0x0040a7d4 incl. */
  ISAAC_ANM2_GET_FRAME_F32_DATA_OFF = 0x34,       /* cmp dword [ecx+0x34], 0 */
  ISAAC_ANM2_GET_FRAME_F32_FRAME_OFF = 0x40,      /* movss xmm0, [ecx+0x40] */
  ISAAC_ANM2_GET_FRAME_F32_NULL_VA = 0x00baad50u, /* .rdata via section table */
  ISAAC_ANM2_GET_FRAME_F32_NULL_BITS = 0xbf800000u, /* file+0x7a9350 */
  ISAAC_ANM2_GET_FRAME_F32_CALLSITE_COUNT = 8,    /* .text e8 only */
  ISAAC_ANM2_GET_FRAME_F32_NEXT_VA = 0x0040a7e0u  /* next helper — NOT opened */
};

/* needed(data_dword): FULL-dword test. Same gate as v19 0x40a740. 0x100 is needed. */
int32_t isaac_anm2_get_frame_needed(uint32_t data_dword);

/* floor(frame) then cvttss2si. Reuses v5 primitives BY REFERENCE. */
int32_t isaac_anm2_get_frame_int_from_bits(uint32_t frame_bits);

/* 0x0040a780 plan. [this+0x34] is a full-dword test. Null data
   returns -1. Hit path floors [this+0x40] then cvttss2si.
   CRT floor 0xaf0917 is the already-modelled IAT; no residual host. */
typedef struct IsaacAnm2GetFrameIntPlan {
  int32_t entered;              /* 1 for a non-null anm2 image */
  int32_t needed;               /* [this+0x34] != 0 (FULL dword) */
  uint32_t data_dword;          /* raw [this+0x34] */
  uint32_t frame_bits;          /* [this+0x40] if needed, else 0 */
  uint32_t floor_bits;          /* floor(frame) if needed, else 0 */
  int32_t result;               /* -1 if !needed, else cvttss2si(floor) */
} IsaacAnm2GetFrameIntPlan;

void isaac_anm2_get_frame_int_plan(uint8_t* anm2,
                                   IsaacAnm2GetFrameIntPlan* out);

/* 0x0040a7c0 plan. Same FULL-dword gate. Null data returns the
   .rdata dword at 0x00baad50 (0xbf800000). Hit path is a raw
   32-bit copy of [this+0x40]. Zero calls. Fully pure. */
typedef struct IsaacAnm2GetFrameF32Plan {
  int32_t entered;              /* 1 for a non-null anm2 image */
  int32_t needed;               /* [this+0x34] != 0 (FULL dword) */
  uint32_t data_dword;          /* raw [this+0x34] */
  uint32_t result_bits;         /* [this+0x40] or 0xbf800000 */
} IsaacAnm2GetFrameF32Plan;

void isaac_anm2_get_frame_f32_plan(uint8_t* anm2,
                                   IsaacAnm2GetFrameF32Plan* out);

/* ============ v22: 0x0040a7e0 layer-int frame setter ============ */

enum {
  ISAAC_ANM2_SET_LAYER_FRAME_VA = 0x0040a7e0u,      /* 13-byte ZHL — WEAK */
  ISAAC_ANM2_SET_LAYER_FRAME_END_VA = 0x0040a85cu,  /* `ret 8` */
  ISAAC_ANM2_SET_LAYER_FRAME_BODY_BYTES = 0x7d,     /* 0x0040a7e0..0x0040a85c incl. */
  ISAAC_ANM2_SET_LAYER_FRAME_DATA_OFF = 0x34,       /* cmp dword [ecx+0x34], 0 */
  ISAAC_ANM2_SET_LAYER_FRAME_STATE_OFF = 0x30,      /* lea edi, [ecx+0x30] */
  ISAAC_ANM2_SET_LAYER_FRAME_COUNT_OFF = 0x80,      /* SIGNED [anim+0x80] */
  ISAAC_ANM2_SET_LAYER_FRAME_MAP_OFF = 0x38,        /* [data + layer*4 + 0x38] */
  ISAAC_ANM2_SET_LAYER_FRAME_WALK_VA = 0x00408b90u, /* already-translated walk */
  ISAAC_ANM2_SET_LAYER_FRAME_LOG_STR_VA = 0x00b1a564u, /* "LayerId out of bounds\\n" */
  ISAAC_ANM2_SET_LAYER_FRAME_LOG_LEVEL = 0x10,
  ISAAC_ANM2_SET_LAYER_FRAME_NEXT_VA = 0x0040a860u  /* name trampoline — opened in v23 */
};

/* needed(data_dword): FULL-dword test. Same gate as v19 0x40a740. 0x100 is needed. */
int32_t isaac_anm2_set_layer_frame_needed(uint32_t data_dword);

/* SIGNED in-range: layer >= 0 && layer < count_80. 0x80000000 is negative. */
int32_t isaac_anm2_set_layer_frame_layer_in_range(int32_t layer,
                                                  int32_t count_80);

/* 0x0040a7e0 plan. layer is the raw SIGNED [ebp+8]. frame is the
   raw SIGNED [ebp+0xc] (cvtdq2ps bits). [this+0x34] is a full-dword
   test. 0x00408b90 is consumed BY REFERENCE. The 0xa112c0 bound
   log is a standing-logger-split host residual. */
typedef struct IsaacAnm2SetLayerFramePlan {
  int32_t needed;               /* [this+0x34] != 0 (FULL dword) */
  int32_t needs_log;            /* bound log 0xa112c0(0x10, 0xb1a564) */
  int32_t needs_walk;           /* 0x408b90 runs */
  int32_t walk_index;           /* mapped esi handed to 0x408b90; 0 if !walk */
  uint32_t frame_bits;          /* cvtdq2ps(SIGNED frame) */
} IsaacAnm2SetLayerFramePlan;

void isaac_anm2_set_layer_frame_plan(uint8_t* anm2,
                                     int32_t layer,
                                     int32_t frame,
                                     IsaacAnm2SetLayerFramePlan* out);

/* ============ v23: 0x0040a860 name trampoline + 0x0040a8a0 GetLayerFrame-int ============ */

enum {
  ISAAC_ANM2_SET_LAYER_FRAME_NAME_VA = 0x0040a860u,     /* identify-zhl EMPTY */
  ISAAC_ANM2_SET_LAYER_FRAME_NAME_END_VA = 0x0040a89cu, /* `ret 8` (BOTH rets) */
  ISAAC_ANM2_SET_LAYER_FRAME_NAME_BODY_BYTES = 0x3d,    /* 0x0040a860..0x0040a89c incl. */
  ISAAC_ANM2_SET_LAYER_FRAME_NAME_GET_LAYER_VA = 0x0040b430u, /* GetLayer(const char*) BY REF */
  ISAAC_ANM2_SET_LAYER_FRAME_NAME_SET_VA = 0x0040a7e0u, /* v22 SetLayerFrame BY REF */
  ISAAC_ANM2_SET_LAYER_FRAME_NAME_LOG_STR_VA = 0x00b1a634u,
  ISAAC_ANM2_SET_LAYER_FRAME_NAME_LOG_LEVEL = 4,
  ISAAC_ANM2_SET_LAYER_FRAME_NAME_NEXT_VA = 0x0040a8a0u, /* GetLayerFrame-int */
  ISAAC_ANM2_GET_LAYER_FRAME_INT_VA = 0x0040a8a0u,      /* identify-zhl EMPTY */
  ISAAC_ANM2_GET_LAYER_FRAME_INT_END_VA = 0x0040a902u,  /* `ret 4` */
  ISAAC_ANM2_GET_LAYER_FRAME_INT_BODY_BYTES = 0x63,     /* 0x0040a8a0..0x0040a902 incl. */
  ISAAC_ANM2_GET_LAYER_FRAME_INT_DATA_OFF = 0x34,       /* cmp dword [this+0x34], 0 */
  ISAAC_ANM2_GET_LAYER_FRAME_INT_STATE_OFF = 0x30,      /* [this+0x30] anim */
  ISAAC_ANM2_GET_LAYER_FRAME_INT_COUNT_OFF = 0x80,      /* SIGNED [anim+0x80] */
  ISAAC_ANM2_GET_LAYER_FRAME_INT_MAP_OFF = 0x38,        /* [data + layer*4 + 0x38] */
  ISAAC_ANM2_GET_LAYER_FRAME_INT_FRAMES_OFF = 0x38,     /* [this+0x38] frame array */
  ISAAC_ANM2_GET_LAYER_FRAME_INT_LOG_STR_VA = 0x00b1a564u,
  ISAAC_ANM2_GET_LAYER_FRAME_INT_LOG_LEVEL = 0x10,
  ISAAC_ANM2_GET_LAYER_FRAME_INT_NEXT_VA = 0x0040a910u  /* Stop — opened in v24 */
};

/* 0x0040a860 plan. name_addr is the raw [ebp+8] C-string guest
   address. frame is the raw SIGNED [ebp+0xc]. 0x40b430 and
   0x40a7e0 are consumed BY REFERENCE. The 0xa112c0 miss log
   is a standing-logger-split host residual. */
typedef struct IsaacAnm2SetLayerFrameNamePlan {
  int32_t entered;              /* 1 for a non-null anm2 image */
  uint32_t name_addr;           /* raw [ebp+8] */
  int32_t frame;                /* raw SIGNED [ebp+0xc] */
  uint32_t layer_ptr;           /* 0x40b430 result; 0 on miss */
  int32_t needs_log;            /* miss log 0xa112c0(4, 0xb1a634, name) */
  int32_t needs_set;            /* 0x40a7e0 runs */
  int32_t set_layer;            /* [LayerData+0] handed to 0x40a7e0; 0 if !set */
} IsaacAnm2SetLayerFrameNamePlan;

void isaac_anm2_set_layer_frame_name_plan(uint8_t* anm2,
                                          uint32_t name_addr,
                                          int32_t frame,
                                          IsaacAnm2SetLayerFrameNamePlan* out);

/* needed(data_dword): FULL-dword test. Same gate as v19 0x40a740. 0x100 is needed. */
int32_t isaac_anm2_get_layer_frame_int_needed(uint32_t data_dword);

/* SIGNED in-range: layer >= 0 && layer < count_80. Same law as v22. */
int32_t isaac_anm2_get_layer_frame_int_layer_in_range(int32_t layer,
                                                      int32_t count_80);

/* 0x0040a8a0 plan. layer is the raw SIGNED [ebp+8]. [this+0x34]
   is a full-dword test. Consume v19/v22 gates BY REFERENCE.
   The 0xa112c0 bound log is a standing-logger-split host residual. */
typedef struct IsaacAnm2GetLayerFrameIntPlan {
  int32_t entered;              /* 1 for a non-null anm2 image */
  int32_t needed;               /* [this+0x34] != 0 (FULL dword) */
  uint32_t data_dword;          /* raw [this+0x34] */
  int32_t layer;                /* raw SIGNED [ebp+8] */
  int32_t needs_log;            /* bound log 0xa112c0(0x10, 0xb1a564) */
  int32_t result;               /* -1 if !needed; mapped frame or 0 after log */
} IsaacAnm2GetLayerFrameIntPlan;

void isaac_anm2_get_layer_frame_int_plan(uint8_t* anm2,
                                         int32_t layer,
                                         IsaacAnm2GetLayerFrameIntPlan* out);

/* ============ v24: 0x0040a910 Stop / clear playing flag ============ */

enum {
  ISAAC_ANM2_STOP_VA = 0x0040a910u,      /* identify-zhl EMPTY */
  ISAAC_ANM2_STOP_END_VA = 0x0040a91au,  /* `ret` */
  ISAAC_ANM2_STOP_BODY_BYTES = 0x0b,     /* 0x0040a910..0x0040a91a incl. */
  ISAAC_ANM2_STOP_DATA_OFF = 0x34,       /* cmp dword [ecx+0x34], 0 */
  ISAAC_ANM2_STOP_FLAG_OFF = 0x44,       /* mov byte [ecx+0x44], 0 */
  ISAAC_ANM2_STOP_NEXT_VA = 0x0040a920u  /* opened in v25 */
};

/* ============ v25: 0x0040a920 overlay Play SSO + 0x0040a9c0 overlay Stop ============ */

enum {
  ISAAC_ANM2_OVERLAY_PLAY_SSO_VA = 0x0040a920u,        /* identify-zhl EMPTY */
  ISAAC_ANM2_OVERLAY_PLAY_SSO_END_VA = 0x0040a936u,    /* first int3 after jmp */
  ISAAC_ANM2_OVERLAY_PLAY_VA = 0x0040a940u,            /* overlay Play body */
  ISAAC_ANM2_OVERLAY_PLAY_END_VA = 0x0040a9b3u,        /* `ret 8` */
  ISAAC_ANM2_OVERLAY_PLAY_APPLY_VA = 0x0040aaf0u,      /* HOST — not peeled */
  ISAAC_ANM2_OVERLAY_PLAY_DATA_OFF = 0x54,             /* [this+0x54] overlay data */
  ISAAC_ANM2_OVERLAY_PLAY_FLAG_OFF = 0x64,             /* byte [this+0x64] */
  ISAAC_ANM2_OVERLAY_PLAY_STATE_OFF = 0x50,            /* Rewind this+0x50 */
  ISAAC_ANM2_OVERLAY_STOP_VA = 0x0040a9c0u,            /* identify-zhl EMPTY */
  ISAAC_ANM2_OVERLAY_STOP_END_VA = 0x0040a9cau,        /* `ret` */
  ISAAC_ANM2_OVERLAY_STOP_BODY_BYTES = 0x0b,           /* 0x0040a9c0..0x0040a9ca */
  ISAAC_ANM2_OVERLAY_STOP_DATA_OFF = 0x54,             /* cmp dword [ecx+0x54], 0 */
  ISAAC_ANM2_OVERLAY_STOP_FLAG_OFF = 0x64,             /* mov byte [ecx+0x64], 0 */
  ISAAC_ANM2_OVERLAY_STOP_NEXT_VA = 0x0040a9d0u        /* opened in v26 */
};

/* 0x0040a920 / 0x0040a940 plan. Same shape as IsaacAnm2PlaySsoPlan.
   Overlay offs: data 0x54, flag 0x64, rewind this+0x50, host 0x40aaf0.
   Consume v12 Play SSO / v5 Play gate / 0x40a1b0 Rewind BY REFERENCE. */
typedef struct IsaacAnm2OverlayPlaySsoPlan {
  int32_t entered;           /* 1 for a non-null anm2 image */
  uint32_t str_addr;         /* [ebp+8] std::string* */
  uint32_t cap;              /* [str+0x14]; 0 if str_addr == 0 */
  int32_t heap_used;         /* cap >= 0x10 UNSIGNED */
  uint32_t name_addr;        /* resolved char*; 0 if str_addr == 0 */
  int32_t reset_flag;        /* stack arg [ebp+0xc], forwarded */
  int32_t data_null;         /* [this+0x54] == 0 */
  int32_t name_equal;
  int32_t data_34_flag;      /* byte [overlay-data+0x34] */
  int32_t state_44_flag;     /* byte [this+0x64] */
  int32_t skip;
  int32_t call_apply;
  uint32_t apply_va;         /* 0x0040aaf0 HOST */
  int32_t apply_reset_arg;   /* 1 */
  uint32_t rewind_va;        /* 0x0040a1b0 */
  int32_t rewind_ran;
  int32_t flag_44_set;       /* apply-time: byte [this+0x64] = 1 */
} IsaacAnm2OverlayPlaySsoPlan;

void isaac_anm2_overlay_play_sso_plan(uint8_t* anm2,
                                      uint32_t str_addr,
                                      int32_t reset_flag,
                                      IsaacAnm2OverlayPlaySsoPlan* out);

void isaac_anm2_overlay_play_sso_apply(uint8_t* anm2,
                                       uint32_t str_addr,
                                       int32_t reset_flag,
                                       int32_t host_apply_al,
                                       IsaacAnm2OverlayPlaySsoPlan* out);

/* needed(data_dword): FULL-dword test. Consume v24/v19 BY REFERENCE. 0x100 is needed. */
int32_t isaac_anm2_overlay_stop_needed(uint32_t data_dword);

/* Writes byte[this+0x64] = 0 only when needed. Null ANM2 is a no-op. */
void isaac_anm2_overlay_stop_apply(uint8_t* anm2);

/* ============ v26: 0x0040a9d0 overlay Playing SSO + 0x0040a9f0 pred ============ */

enum {
  ISAAC_ANM2_OVERLAY_PLAYING_SSO_VA = 0x0040a9d0u,      /* identify-zhl EMPTY */
  ISAAC_ANM2_OVERLAY_PLAYING_SSO_END_VA = 0x0040a9e7u,  /* first int3 after jmp */
  ISAAC_ANM2_OVERLAY_PLAYING_VA = 0x0040a9f0u,          /* overlay Playing body */
  ISAAC_ANM2_OVERLAY_PLAYING_END_VA = 0x0040aa42u,      /* `ret 4` */
  ISAAC_ANM2_OVERLAY_PLAYING_DATA_OFF = 0x54,           /* test [this+0x54] */
  ISAAC_ANM2_OVERLAY_PLAYING_FLAG_OFF = 0x64,           /* cmp byte [this+0x64],0 */
  ISAAC_ANM2_OVERLAY_PLAYING_SSO_CALLSITE_COUNT = 0,    /* .text e8 only */
  ISAAC_ANM2_OVERLAY_PLAYING_SSO_LUA_PUSH_VA = 0x00867489u,
  ISAAC_ANM2_OVERLAY_PLAYING_SSO_LUA_PUSH_COUNT = 1,
  ISAAC_ANM2_OVERLAY_PLAYING_NEXT_VA = 0x0040aa50u      /* opened in v27 */
};

/* 0x0040a9d0 / 0x0040a9f0 plan. Same shape as IsaacAnm2PlayingSsoPlan.
   Overlay offs: data 0x54, latch byte 0x64. Consume v13 Playing SSO
   / isaac_anm2_playing_name_pred BY REFERENCE. Latch 0x100 is CLEAR. */
typedef struct IsaacAnm2OverlayPlayingSsoPlan {
  int32_t entered;           /* 1 for a non-null anm2 image */
  uint32_t str_addr;         /* [ebp+8] std::string* */
  uint32_t cap;              /* [str+0x14]; 0 if str_addr == 0 */
  int32_t heap_used;         /* cap >= 0x10 UNSIGNED */
  uint32_t name_addr;        /* resolved char*; 0 if str_addr == 0 */
  int32_t result;            /* overlay pred AL */
} IsaacAnm2OverlayPlayingSsoPlan;

/* 0x0040a9f0: 1 iff overlay-data && LOW-BYTE[anm2+0x64] &&
   (name empty || strcmp == 0). Latch 0x100 is CLEAR. */
int32_t isaac_anm2_overlay_playing_name_pred(uint8_t* anm2, uint32_t name_addr);

void isaac_anm2_overlay_playing_sso_plan(uint8_t* anm2,
                                         uint32_t str_addr,
                                         IsaacAnm2OverlayPlayingSsoPlan* out);

/* ============ v27: 0x0040aa50 overlay Playing-alt SSO + 0x0040aa70 pred_alt ============ */

enum {
  ISAAC_ANM2_OVERLAY_PLAYING_SSO_ALT_VA = 0x0040aa50u,     /* identify-zhl EMPTY */
  ISAAC_ANM2_OVERLAY_PLAYING_SSO_ALT_END_VA = 0x0040aa67u, /* first int3 after jmp */
  ISAAC_ANM2_OVERLAY_PLAYING_ALT_VA = 0x0040aa70u,         /* overlay pred_alt body */
  ISAAC_ANM2_OVERLAY_PLAYING_ALT_END_VA = 0x0040aacau,     /* `ret 4` */
  ISAAC_ANM2_OVERLAY_PLAYING_ALT_DATA_OFF = 0x54,          /* test [this+0x54] */
  ISAAC_ANM2_OVERLAY_PLAYING_ALT_FLAG_OFF = 0x64,          /* cmp byte [this+0x64],0 */
  ISAAC_ANM2_OVERLAY_PLAYING_SSO_ALT_CALLSITE_COUNT = 0,   /* .text e8 only */
  ISAAC_ANM2_OVERLAY_PLAYING_SSO_ALT_LUA_PUSH_VA = 0x00867491u,
  ISAAC_ANM2_OVERLAY_PLAYING_SSO_ALT_LUA_PUSH_COUNT = 1,
  ISAAC_ANM2_OVERLAY_PLAYING_SSO_ALT_NEXT_VA = 0x0040aad0u /* SSO into 0x40aaf0 HOST */
};

/* 0x0040aa50 / 0x0040aa70 plan. Same shape as IsaacAnm2PlayingSsoAltPlan.
   Overlay offs: data 0x54, latch byte 0x64. Consume v14 Playing SSO alt
   / isaac_anm2_playing_name_pred_alt BY REFERENCE. Latch 0x100 is CLEAR. */
typedef struct IsaacAnm2OverlayPlayingSsoAltPlan {
  int32_t entered;           /* 1 for a non-null anm2 image */
  uint32_t str_addr;         /* [ebp+8] std::string* */
  uint32_t cap;              /* [str+0x14]; 0 if str_addr == 0 */
  int32_t heap_used;         /* cap >= 0x10 UNSIGNED */
  uint32_t name_addr;        /* resolved char*; 0 if str_addr == 0 */
  int32_t result;            /* overlay pred_alt AL */
} IsaacAnm2OverlayPlayingSsoAltPlan;

/* 0x0040aa70 (D27 overlay): on the null-data path the decision is the
   raw name POINTER. Latch SET -> FALSE. Latch 0x100 is CLEAR. */
int32_t isaac_anm2_overlay_playing_name_pred_alt(uint8_t* anm2,
                                                 uint32_t name_addr);

void isaac_anm2_overlay_playing_sso_alt_plan(uint8_t* anm2,
                                             uint32_t str_addr,
                                             IsaacAnm2OverlayPlayingSsoAltPlan* out);

/* ============ v28: 0x0040aad0 SSO trampoline into overlay apply HOST ============ */

enum {
  ISAAC_ANM2_OVERLAY_APPLY_SSO_VA = 0x0040aad0u,       /* identify-zhl EMPTY */
  ISAAC_ANM2_OVERLAY_APPLY_SSO_END_VA = 0x0040aae7u,   /* first int3 after jmp */
  ISAAC_ANM2_OVERLAY_APPLY_SSO_TARGET_VA = 0x0040aaf0u, /* HOST -- not peeled */
  ISAAC_ANM2_OVERLAY_APPLY_SSO_CALLSITE_COUNT = 0,     /* .text e8 only */
  ISAAC_ANM2_OVERLAY_APPLY_SSO_LUA_PUSH_VA = 0x0086741bu,
  ISAAC_ANM2_OVERLAY_APPLY_SSO_LUA_PUSH_COUNT = 1,
  ISAAC_ANM2_OVERLAY_APPLY_SSO_NEXT_VA = 0x0040abb0u   /* after HOST island */
};

/* 0x0040aad0 plan. str_addr is the raw std::string* at [ebp+8].
   SSO-select is UNSIGNED `jb` against cap 0x10 (cap == 0x10 already
   heap). The trampoline then `jmp 0x0040aaf0` HOST; reset_flag at
   [ebp+0xc] is forwarded unchanged. Consume v15 trampoline SSO
   BY REFERENCE. Do NOT peel 0x0040aaf0. */
typedef struct IsaacAnm2OverlayApplySsoPlan {
  int32_t entered;           /* 1 for a non-null anm2 image */
  uint32_t str_addr;         /* [ebp+8] std::string* */
  uint32_t cap;              /* [str+0x14]; 0 if str_addr == 0 */
  int32_t heap_used;         /* cap >= 0x10 UNSIGNED */
  uint32_t name_addr;        /* resolved char*; 0 if str_addr == 0 */
  int32_t reset_flag;        /* stack arg [ebp+0xc], forwarded */
  uint32_t host_va;          /* 0x0040aaf0 HOST */
  int32_t host_call_count;   /* 1: unconditional jmp */
} IsaacAnm2OverlayApplySsoPlan;

void isaac_anm2_overlay_apply_sso_plan(uint8_t* anm2,
                                       uint32_t str_addr,
                                       int32_t reset_flag,
                                       IsaacAnm2OverlayApplySsoPlan* out);


/* ============ v29: 0x0040abb0 overlay SetFrame SSO ============ */

enum {
  ISAAC_ANM2_OVERLAY_SET_FRAME_VA = 0x0040abb0u,       /* identify-zhl EMPTY */
  ISAAC_ANM2_OVERLAY_SET_FRAME_END_VA = 0x0040abe7u,   /* `ret 8` */
  ISAAC_ANM2_OVERLAY_SET_FRAME_HOST_VA = 0x0040aaf0u,  /* HOST overlay apply -- not peeled */
  ISAAC_ANM2_OVERLAY_SET_FRAME_ADVANCE_VA = 0x00408e00u, /* already-translated advance */
  ISAAC_ANM2_OVERLAY_SET_FRAME_CALLSITE_COUNT = 3,     /* .text e8 only */
  ISAAC_ANM2_OVERLAY_SET_FRAME_LUA_PUSH_VA = 0x00867446u,
  ISAAC_ANM2_OVERLAY_SET_FRAME_LUA_PUSH_COUNT = 1,
  ISAAC_ANM2_OVERLAY_SET_FRAME_RESET_IMM = 1,          /* push 1 before 0x40aaf0 */
  ISAAC_ANM2_OVERLAY_SET_FRAME_NEXT_VA = 0x0040abf0u   /* cstr sibling, no SSO */
};

/* 0x0040abb0 plan. str_addr is the raw std::string* at [ebp+8].
   SSO-select is UNSIGNED `jb` against cap 0x10 (cap == 0x10 already
   heap). frame is the raw SIGNED [ebp+0xc]. The 0x0040aaf0 overlay
   apply stays HOST; its name-walk AL is predicted by consuming v6
   walk+apply BY REFERENCE with apply recv overridden to this+0x50
   on a hit. Advance 0x00408e00 is consumed BY REFERENCE.
   data_present is the FULL dword at [this+0x54] (0x100 IS present).
   No flag store. Do NOT peel 0x0040aaf0. */
typedef struct IsaacAnm2OverlaySetFramePlan {
  int32_t entered;           /* 1 for a non-null anm2 image */
  uint32_t str_addr;         /* [ebp+8] std::string* */
  uint32_t cap;              /* [str+0x14]; 0 if str_addr == 0 */
  int32_t heap_used;         /* cap >= 0x10 UNSIGNED */
  uint32_t name_addr;        /* resolved char*; 0 if str_addr == 0 */
  int32_t frame;             /* [ebp+0xc] SIGNED */
  uint32_t frame_f_bits;     /* cvtdq2ps(frame) */
  int32_t found;             /* from walk+apply (reset IMM 1) */
  int32_t found_index;
  uint32_t elem_byte_offset;
  int32_t warn_log_needed;
  uint32_t warn_log_va;
  int32_t warn_log_level;
  uint32_t warn_log_str_va;
  uint32_t apply_va;
  uint32_t apply_recv_off;   /* 0x50 on hit; 0 on miss */
  int32_t walk_result;       /* HOST 0x0040aaf0 AL */
  int32_t data_present;      /* [this+0x54] FULL dword */
  int32_t advance_ran;       /* walk AL && data_present */
  uint32_t host_va;          /* 0x0040aaf0 HOST */
  int32_t host_call_count;   /* 1 + advance_ran */
} IsaacAnm2OverlaySetFramePlan;

void isaac_anm2_overlay_set_frame_plan(uint8_t* anm2,
                                       uint32_t str_addr,
                                       int32_t frame,
                                       IsaacAnm2OverlaySetFramePlan* out);


/* ============ v30: 0x0040abf0 ANM2::SetOverlayFrame(const char*, int) ============ */

enum {
  ISAAC_ANM2_OVERLAY_SET_FRAME_CSTR_VA = 0x0040abf0u,  /* EXACT ZHL 25 bytes */
  ISAAC_ANM2_OVERLAY_SET_FRAME_CSTR_END_VA = 0x0040ac1eu, /* `ret 8` */
  ISAAC_ANM2_OVERLAY_SET_FRAME_CSTR_HOST_VA = 0x0040aaf0u, /* HOST overlay apply -- not peeled */
  ISAAC_ANM2_OVERLAY_SET_FRAME_CSTR_ADVANCE_VA = 0x00408e00u, /* already-translated advance */
  ISAAC_ANM2_OVERLAY_SET_FRAME_CSTR_CALLSITE_COUNT = 4, /* .text e8 only */
  ISAAC_ANM2_OVERLAY_SET_FRAME_CSTR_LUA_PUSH_VA = 0x00000000u, /* no imm32 bind in .text */
  ISAAC_ANM2_OVERLAY_SET_FRAME_CSTR_LUA_PUSH_COUNT = 0,
  ISAAC_ANM2_OVERLAY_SET_FRAME_CSTR_RESET_IMM = 1,     /* push 1 before 0x40aaf0 */
  ISAAC_ANM2_OVERLAY_SET_FRAME_CSTR_NEXT_VA = 0x0040ac30u /* SetOverlayFrame(int) */
};

/* 0x0040abf0 plan. name_addr is the raw const char* at [ebp+8] -- the cstr
   sibling of v29 has NO SSO select, unlike the std::string form. The
   0x0040aaf0 overlay apply stays HOST; its AL is predicted by consuming v6
   walk+apply BY REFERENCE with apply recv overridden to this+0x50 on a hit.
   Advance 0x00408e00 is consumed BY REFERENCE. data_present is the FULL
   dword at [this+0x54] (0x100 IS present). No flag store. Do NOT peel
   0x0040aaf0. */
typedef struct IsaacAnm2OverlaySetFrameCstrPlan {
  int32_t entered;           /* 1 for a non-null anm2 image */
  uint32_t name_addr;        /* [ebp+8] const char* */
  int32_t frame;             /* [ebp+0xc] SIGNED */
  uint32_t frame_f_bits;     /* cvtdq2ps(frame) */
  int32_t found;             /* from walk+apply (reset IMM 1) */
  int32_t found_index;
  uint32_t elem_byte_offset;
  int32_t warn_log_needed;
  uint32_t warn_log_va;
  int32_t warn_log_level;
  uint32_t warn_log_str_va;
  uint32_t apply_va;
  uint32_t apply_recv_off;   /* 0x50 on hit; 0 on miss */
  int32_t walk_result;       /* HOST 0x0040aaf0 AL */
  int32_t data_present;      /* [this+0x54] FULL dword */
  int32_t advance_ran;       /* walk AL && data_present */
  uint32_t host_va;          /* 0x0040aaf0 HOST */
  int32_t host_call_count;   /* 1 + advance_ran */
} IsaacAnm2OverlaySetFrameCstrPlan;

void isaac_anm2_overlay_set_frame_cstr_plan(uint8_t* anm2,
                                            uint32_t name_addr,
                                            int32_t frame,
                                            IsaacAnm2OverlaySetFrameCstrPlan* out);

/* ============ v31: 0x0040ac30 SetOverlayFrame(int) + 0x0040ac50 ==========
   FUN_0040ac30 (ret 4): cmp dword [this+0x54],0; je ret (pure no-op);
   else movd [ebp+8]; add this,0x50; cvtdq2ps; call 0x408e00 (HOST advance).
   FUN_0040ac50 (ret): [this+0x54]==0 -> eax=-1; else cvttss2si eax,[this+0x60].
   Fully pure. 0x0040ac30 is EXACT ZHL 18 bytes `ANM2::SetOverlayFrame(int)`;
   0x0040ac50 is address-stable (no ZHL). Gate is FULL-dword (0x100 IS set). */

enum {
  ISAAC_ANM2_SET_OVERLAY_FRAME_INT_VA = 0x0040ac30u,
  ISAAC_ANM2_SET_OVERLAY_FRAME_INT_END_VA = 0x0040ac4cu,
  ISAAC_ANM2_SET_OVERLAY_FRAME_INT_ADVANCE_VA = 0x00408e00u,
  ISAAC_ANM2_SET_OVERLAY_FRAME_INT_GATE_OFF = 0x54u,
  ISAAC_ANM2_SET_OVERLAY_FRAME_INT_RECV_OFF = 0x50u,
  ISAAC_ANM2_GET_OVERLAY_FRAME_VA = 0x0040ac50u,
  ISAAC_ANM2_GET_OVERLAY_FRAME_END_VA = 0x0040ac5fu,
  ISAAC_ANM2_GET_OVERLAY_FRAME_GATE_OFF = 0x54u,
  ISAAC_ANM2_GET_OVERLAY_FRAME_CUR_OFF = 0x60u,
  ISAAC_ANM2_GET_OVERLAY_FRAME_MISS = -1,
};

typedef struct IsaacAnm2SetOverlayFrameIntPlan {
  int32_t entered;
  int32_t frame;             /* SIGNED */
  uint32_t frame_f_bits;     /* cvtdq2ps(frame) */
  int32_t gate_54;           /* [this+0x54] FULL dword != 0 */
  uint32_t advance_va;       /* 0x00408e00 HOST */
  uint32_t advance_recv_off; /* 0x50 */
  int32_t host_call_count;   /* gate ? 1 : 0 */
  int32_t pure_complete;     /* !gate */
} IsaacAnm2SetOverlayFrameIntPlan;

typedef struct IsaacAnm2GetOverlayFrameIntPlan {
  int32_t entered;
  int32_t gate_54;           /* [this+0x54] FULL dword != 0 */
  int32_t result;            /* gate ? (int)[this+0x60] : -1 */
  int32_t host_call_count;   /* 0 */
  int32_t pure_complete;     /* 1 */
} IsaacAnm2GetOverlayFrameIntPlan;

void isaac_anm2_set_overlay_frame_int_plan(uint8_t* anm2,
                                           int32_t frame,
                                           IsaacAnm2SetOverlayFrameIntPlan* out);
void isaac_anm2_get_overlay_frame_int_plan(uint8_t* anm2,
                                           IsaacAnm2GetOverlayFrameIntPlan* out);

/* ============ v32: 0x0040ac60 forwarder + 0x0040ac70 id lookup ==========
   FUN_0040ac60 (ret 4): push 0; add ecx,0x50; call 0x40882e; ret — thin
   forwarder to the animation-state apply interior (family-v2 area).
   FUN_0040ac70 (ret 4, address-stable):
     [this+4]==0 -> log 0xa112c0("AnimationData is NULL") then RELOAD
     [this+4] (PE defect reproduced: the reload re-derefs possibly-null).
     count=[anim+0x24]; count==0 -> 0. Loop i in [0,count): idArr=[this+0xc]
     (stride 4), elems=[anim+0x20] (stride 0x10): if [elem]==id &&
     idVal=[idArr+i]>=0 (signed js) && idVal < [elem+0xc] (signed jge):
     return idVal*0x54 + [elem+8]. Not found -> 0. Pure except null-log. */

enum {
  ISAAC_ANM2_ANIM_ID_LOOKUP_VA = 0x0040ac70u,
  ISAAC_ANM2_ANIM_ID_LOOKUP_END_VA = 0x0040accau,
  ISAAC_ANM2_ANIM_ID_LOOKUP_LOG_VA = 0x00a112c0u,
  ISAAC_ANM2_ANIM_ID_LOOKUP_LOG_LEVEL = 0x10,
  ISAAC_ANM2_ANIM_ID_LOOKUP_LOG_STR_VA = 0x00b1a504u,
  ISAAC_ANM2_ANIM_ID_LOOKUP_ANIM_OFF = 0x04u,
  ISAAC_ANM2_ANIM_ID_LOOKUP_COUNT_OFF = 0x24u,
  ISAAC_ANM2_ANIM_ID_LOOKUP_IDS_OFF = 0x0cu,
  ISAAC_ANM2_ANIM_ID_LOOKUP_ELEMS_OFF = 0x20u,
  ISAAC_ANM2_ANIM_ID_LOOKUP_ELEM_STRIDE = 0x10u,
  ISAAC_ANM2_ANIM_ID_LOOKUP_ID_OFF = 0x00u,
  ISAAC_ANM2_ANIM_ID_LOOKUP_BASE_OFF = 0x08u,
  ISAAC_ANM2_ANIM_ID_LOOKUP_LIMIT_OFF = 0x0cu,
  ISAAC_ANM2_ANIM_ID_LOOKUP_FOUND_STRIDE = 0x54u,
  ISAAC_ANM2_FORWARDER_60_VA = 0x0040ac60u,
  ISAAC_ANM2_FORWARDER_60_END_VA = 0x0040ac6au,
  ISAAC_ANM2_FORWARDER_60_CALL_VA = 0x0040882eu,
  ISAAC_ANM2_FORWARDER_60_RECV_OFF = 0x50u,
  ISAAC_ANM2_FORWARDER_60_ARG_COUNT = 1,
  ISAAC_ANM2_FORWARDER_60_HOST_CALL_COUNT = 1,
};

typedef struct IsaacAnm2AnimIdLookupPlan {
  int32_t entered;
  uint32_t anim;             /* [this+4] after the possible reload */
  uint32_t count;            /* [anim+0x24] */
  int32_t found;
  int32_t id_val;            /* idArr[i] on the found arm */
  uint32_t elem_base;        /* elems + i*0x10 on the found arm */
  int32_t elem_byte_offset;  /* id_val*0x54 */
  int32_t result;            /* offset + [elem+8] */
  int32_t log_needed;
  uint32_t log_va;
  int32_t log_level;
  uint32_t log_str_va;
  int32_t host_call_count;   /* log ? 1 : 0 */
  int32_t pure_complete;
} IsaacAnm2AnimIdLookupPlan;

typedef struct IsaacAnm2Forwarder60Plan {
  int32_t entered;
  uint32_t call_va;          /* 0x0040882e */
  uint32_t recv_off;         /* 0x50 */
  int32_t arg_count;         /* 1 */
  int32_t host_call_count;   /* 1 */
  int32_t pure_complete;     /* 0 */
} IsaacAnm2Forwarder60Plan;

void isaac_anm2_anim_id_lookup_plan(uint8_t* anm2,
                                    int32_t id,
                                    IsaacAnm2AnimIdLookupPlan* out);
void isaac_anm2_forwarder60_plan(uint8_t* anm2,
                                 IsaacAnm2Forwarder60Plan* out);

/* ============ v33: 0x0040ace0 extras name->index walk ====================
   ret 4 @ 0x0040ad6a; 5 int3 pad at 0x40acdb..0x40acdf before the entry.
     [this+4]==0 -> log 0xa112c0("AnimationData is NULL") (the PE calls
       +5 into the logger prologue: 0xa112c5; canonical VA 0xa112c0).
     [this] = animData; count = [[this]+0x88]; list = [[this]+0x84].
     count==0 -> 0. loop i in [0,count): elem = list + i*0x18; SSO string
     at elem (cap [elem+0x14] < 0x10 -> inline else [elem]); strcmp vs
     [ebp+8]; equal -> return i (raw index, no stride multiply). miss -> 0.
   Fully pure except the null-log (logger split). */

enum {
  ISAAC_ANM2_EXTRAS_NAME_INDEX_VA = 0x0040ace0u,
  /* v47: the found path falls through to the stage-2 id-lookup continuation
     (PE 0x40ad6d..0x40adcc), so the function's true end is the ret 4 at
     0x40adcc — NOT 0x40ad61 (the v33 END_VA was the miss-path ret). */
  ISAAC_ANM2_EXTRAS_NAME_INDEX_END_VA = 0x0040adccu,
  ISAAC_ANM2_EXTRAS_NAME_INDEX_LOG_VA = 0x00a112c0u,
  ISAAC_ANM2_EXTRAS_NAME_INDEX_LOG_LEVEL = 0x10,
  ISAAC_ANM2_EXTRAS_NAME_INDEX_LOG_STR_VA = 0x00b1a504u,
  ISAAC_ANM2_EXTRAS_NAME_INDEX_ANIM_OFF = 0x04u,
  ISAAC_ANM2_EXTRAS_NAME_INDEX_DATA_OFF = 0x00u,
  ISAAC_ANM2_EXTRAS_NAME_INDEX_COUNT_OFF = 0x88u,
  ISAAC_ANM2_EXTRAS_NAME_INDEX_LIST_OFF = 0x84u,
  ISAAC_ANM2_EXTRAS_NAME_INDEX_STRIDE = 0x18u,
  ISAAC_ANM2_EXTRAS_NAME_INDEX_SSO_CAP_OFF = 0x14u,
  ISAAC_ANM2_EXTRAS_NAME_INDEX_SSO_CAP = 0x10u,
  /* Stage-2 continuation (PE 0x40ad6d): [this+4] re-read + RELOAD on null,
     count2 = [anim+0x24], elems2 = [anim+0x20] stride 0x10, id array at
     [this+0xc]; [elem]==found extras index && id_val>=0 (js) &&
     id_val<[elem+0xc] (jl) -> result = id_val*0x54 + [elem+8]. Layout is
     the v32 0x40ac70 elems contract (same offsets, byte-identical shape). */
  ISAAC_ANM2_EXTRAS_NAME_INDEX_ANIM2_OFF = 0x04u,
  ISAAC_ANM2_EXTRAS_NAME_INDEX_COUNT2_OFF = 0x24u,
  ISAAC_ANM2_EXTRAS_NAME_INDEX_ELEMS2_OFF = 0x20u,
  ISAAC_ANM2_EXTRAS_NAME_INDEX_ELEM2_STRIDE = 0x10u,
  ISAAC_ANM2_EXTRAS_NAME_INDEX_ID_ARR_OFF = 0x0cu,
  ISAAC_ANM2_EXTRAS_NAME_INDEX_ELEM2_ID_OFF = 0x00u,
  ISAAC_ANM2_EXTRAS_NAME_INDEX_ELEM2_BASE_OFF = 0x08u,
  ISAAC_ANM2_EXTRAS_NAME_INDEX_ELEM2_LIMIT_OFF = 0x0cu,
  ISAAC_ANM2_EXTRAS_NAME_INDEX_FOUND_STRIDE = 0x54u,
};

typedef struct IsaacAnm2ExtrasNameIndexPlan {
  int32_t entered;
  uint32_t anim;             /* [this+4] first read */
  uint32_t count;            /* [[this]+0x88] */
  int32_t found;             /* matched extras index, -1 on miss */
  int32_t result;            /* v47: stage-2 id_lookup*0x54+[elem+8] or 0 (NOT raw index) */
  int32_t log_needed;
  uint32_t log_va;
  int32_t log_level;
  uint32_t log_str_va;
  int32_t host_call_count;   /* stage-1 log ? 1 : 0 (+1 if stage-2 null anim re-log) */
  int32_t pure_complete;
  /* v47 stage-2 continuation (PE 0x40ad6d..0x40adcc), only on a name hit. */
  uint32_t anim2;            /* [this+4] re-read (RELOAD on null) */
  uint32_t count2;           /* [anim2+0x24] */
  uint32_t elems2;           /* [anim2+0x20] */
  uint32_t id_arr;           /* [this+0xc] */
  int32_t id_val;            /* matched id value, 0 if none */
  int32_t elem_byte_offset;  /* j*0x10 of matched stage-2 elem, -1 if none */
  int32_t found2;            /* stage-2 match flag */
  int32_t stage2_log;        /* stage-2 null-anim re-log fired */
} IsaacAnm2ExtrasNameIndexPlan;

void isaac_anm2_extras_name_index_plan(uint8_t* anm2,
                                       uint32_t name_addr,
                                       IsaacAnm2ExtrasNameIndexPlan* out);

/* ============ v34: 0x0040af10 GetAnimation two-stage ======================
   ret 4 @ 0x0040aff7; 3 int3 pad at 0x40af0d..0x40af0f.
   Stage 1 (name -> outer index, miss -1): [this+4]==0 -> log;
   data=[this]; count=[data+0x90]; list=[data+0x8c] (SSO stride 0x18);
   strcmp match -> outer index; miss -> -1.
   Stage 2 (inner id-match + min-delta scan): inner=[this+4] re-read;
   elems=[inner+0x28]; count2=[inner+0x2c]; frameInt=cvttss2si([this+0x10]);
   loop: [elems+i*4] == outer -> payload=[elems+i*4+4];
   delta=frameInt-payload; keep the smallest POSITIVE delta's payload
   (esi min-scan, starts -1: first match keeps unconditionally, then only
   if delta<best); return best payload or -1. Fully pure except null-log. */

enum {
  ISAAC_ANM2_GET_ANIM_TWO_STAGE_VA = 0x0040af10u,
  ISAAC_ANM2_GET_ANIM_TWO_STAGE_END_VA = 0x0040aff5u,
  ISAAC_ANM2_GET_ANIM_TWO_STAGE_LOG_VA = 0x00a112c0u,
  ISAAC_ANM2_GET_ANIM_TWO_STAGE_LOG_LEVEL = 0x10,
  ISAAC_ANM2_GET_ANIM_TWO_STAGE_LOG_STR_VA = 0x00b1a504u,
  ISAAC_ANM2_GET_ANIM_TWO_STAGE_ANIM_OFF = 0x04u,
  ISAAC_ANM2_GET_ANIM_TWO_STAGE_DATA_OFF = 0x00u,
  ISAAC_ANM2_GET_ANIM_TWO_STAGE_COUNT_OFF = 0x90u,
  ISAAC_ANM2_GET_ANIM_TWO_STAGE_LIST_OFF = 0x8cu,
  ISAAC_ANM2_GET_ANIM_TWO_STAGE_STRIDE = 0x18u,
  ISAAC_ANM2_GET_ANIM_TWO_STAGE_SSO_CAP_OFF = 0x14u,
  ISAAC_ANM2_GET_ANIM_TWO_STAGE_SSO_CAP = 0x10u,
  ISAAC_ANM2_GET_ANIM_TWO_STAGE_INNER_ELEMS_OFF = 0x28u,
  ISAAC_ANM2_GET_ANIM_TWO_STAGE_INNER_COUNT_OFF = 0x2cu,
  ISAAC_ANM2_GET_ANIM_TWO_STAGE_FRAME_FLOAT_OFF = 0x10u,
  ISAAC_ANM2_GET_ANIM_TWO_STAGE_MISS = -1,
};

typedef struct IsaacAnm2GetAnimTwoStagePlan {
  int32_t entered;
  int32_t outer;             /* stage-1 matched index, -1 miss */
  uint32_t count;            /* stage-1 count */
  int32_t found_outer;
  uint32_t inner_count;      /* stage-2 count */
  int32_t frame_int;         /* cvttss2si([this+0x10]) */
  int32_t best_delta;        /* smallest positive delta kept, -1 none */
  int32_t best_payload;      /* payload of that match, -1 none */
  int32_t result;            /* best payload or -1 */
  int32_t log_needed;
  uint32_t log_va;
  int32_t log_level;
  uint32_t log_str_va;
  int32_t host_call_count;
  int32_t pure_complete;
} IsaacAnm2GetAnimTwoStagePlan;

void isaac_anm2_get_anim_two_stage_plan(uint8_t* anm2,
                                        uint32_t name_addr,
                                        IsaacAnm2GetAnimTwoStagePlan* out);

/* ============ v35: 0x0040b0c0 three-stage index lookup ====================
   ret 0xc (THREE args: (this, dataName, extraName, id)).
   Stage 1: call 0x0040bcd0 (AD name walk, family v6 BY REFERENCE) on arg1
   -> data ptr (miss -> fail 0).
   Stage 2: extras walk count [this+0x88] / list [this+0x84] (SSO stride
   0x18) vs arg2 -> extra index (cmovne); miss -> fail log
   0xa112c0(1, 0xb1a650).
   Stage 3: inner id-match on the data block: elems [data+0x20] stride 0x10,
   count [data+0x24]; [elems+i*4]==arg3 with signed bounds (idVal>=0 &&
   idVal<[elem+0xc]) -> byte offset arg3*0x54 + [elem+8]; miss -> 0.
   Fully pure except the fail log. */

enum {
  ISAAC_ANM2_THREE_STAGE_LOOKUP_VA = 0x0040b0c0u,
  ISAAC_ANM2_THREE_STAGE_LOOKUP_END_VA = 0x0040b19fu,
  ISAAC_ANM2_THREE_STAGE_LOOKUP_AD_WALK_VA = 0x0040bcd0u,
  ISAAC_ANM2_THREE_STAGE_LOOKUP_FAIL_LOG_VA = 0x00a112c0u,
  ISAAC_ANM2_THREE_STAGE_LOOKUP_FAIL_LOG_LEVEL = 1,
  ISAAC_ANM2_THREE_STAGE_LOOKUP_FAIL_LOG_STR_VA = 0x00b1a650u,
  ISAAC_ANM2_THREE_STAGE_LOOKUP_EXTRAS_COUNT_OFF = 0x88u,
  ISAAC_ANM2_THREE_STAGE_LOOKUP_EXTRAS_LIST_OFF = 0x84u,
  ISAAC_ANM2_THREE_STAGE_LOOKUP_EXTRAS_STRIDE = 0x18u,
  ISAAC_ANM2_THREE_STAGE_LOOKUP_SSO_CAP_OFF = 0x14u,
  ISAAC_ANM2_THREE_STAGE_LOOKUP_SSO_CAP = 0x10u,
  ISAAC_ANM2_THREE_STAGE_LOOKUP_INNER_COUNT_OFF = 0x24u,
  ISAAC_ANM2_THREE_STAGE_LOOKUP_INNER_ELEMS_OFF = 0x20u,
  ISAAC_ANM2_THREE_STAGE_LOOKUP_INNER_STRIDE = 0x10u,
  ISAAC_ANM2_THREE_STAGE_LOOKUP_INNER_ID_OFF = 0x00u,
  ISAAC_ANM2_THREE_STAGE_LOOKUP_INNER_BASE_OFF = 0x08u,
  ISAAC_ANM2_THREE_STAGE_LOOKUP_INNER_LIMIT_OFF = 0x0cu,
  ISAAC_ANM2_THREE_STAGE_LOOKUP_FOUND_STRIDE = 0x54u,
};

typedef struct IsaacAnm2ThreeStageLookupPlan {
  int32_t entered;
  uint32_t data;             /* stage-1 AD element ptr */
  int32_t data_found;
  int32_t extra_index;       /* stage-2 extras index, -1 miss */
  int32_t extra_found;
  uint32_t inner_count;      /* stage-3 count */
  int32_t inner_id_val;
  int32_t elem_byte_offset;  /* id*0x54 */
  int32_t result;            /* offset + [elem+8], or 0 */
  int32_t fail_log_needed;
  uint32_t fail_log_va;
  int32_t fail_log_level;
  uint32_t fail_log_str_va;
  int32_t host_call_count;
  int32_t pure_complete;
} IsaacAnm2ThreeStageLookupPlan;

void isaac_anm2_three_stage_lookup_plan(uint8_t* anm2,
                                        uint32_t data_name_addr,
                                        uint32_t extra_name_addr,
                                        int32_t id,
                                        IsaacAnm2ThreeStageLookupPlan* out);

/* ============ v36: 0x0040b23a bounds-checked element getter ===============
   ret 4; SEH prologue. arg [ebp+8] = index. [this+0x80] count, [this+0x7c]
   base. index<0 (js) or index>=[this+0x80] (signed jge) -> log
   0xa112c0(0x10, 0xb1a68c) + fail (0). else base + index*0xa0 (lea
   [esi+esi*4]; shl 5; the 0xa0 = ANM2_LAYER_STATE_STRIDE). Pure except log. */

enum {
  ISAAC_ANM2_BOUNDED_ELEM_GET_VA = 0x0040b23au,
  ISAAC_ANM2_BOUNDED_ELEM_GET_END_VA = 0x0040b2e8u,
  ISAAC_ANM2_BOUNDED_ELEM_GET_LOG_VA = 0x00a112c0u,
  ISAAC_ANM2_BOUNDED_ELEM_GET_LOG_LEVEL = 0x10,
  ISAAC_ANM2_BOUNDED_ELEM_GET_LOG_STR_VA = 0x00b1a68cu,
  ISAAC_ANM2_BOUNDED_ELEM_GET_BASE_OFF = 0x7cu,
  ISAAC_ANM2_BOUNDED_ELEM_GET_COUNT_OFF = 0x80u,
  ISAAC_ANM2_BOUNDED_ELEM_GET_STRIDE = 0xa0u,
};

typedef struct IsaacAnm2BoundedElemGetPlan {
  int32_t entered;
  int32_t count;             /* [this+0x80] SIGNED */
  uint32_t base;             /* [this+0x7c] */
  int32_t index;             /* arg, SIGNED */
  uint32_t elem;             /* base + index*0xa0 when in range, else 0 */
  int32_t in_range;
  int32_t log_needed;
  uint32_t log_va;
  int32_t log_level;
  uint32_t log_str_va;
  int32_t host_call_count;
  int32_t pure_complete;
} IsaacAnm2BoundedElemGetPlan;

/* ============ v37: 0x0040b44a layer-array name->index ======================
   ret 4. count=[this+0x80]; base=[this+0x7c]; stride 0xa0 (LAYER stride).
   Each slot holds a POINTER to the element; name at elem+8, SSO cap at
   elem+0x1c; match -> return base + index*0xa0 (ELEMENT ADDRESS, like v36);
   count==0 or miss -> 0. The SSO fallback string 0xb1a4ec is the PE's
   empty-string literal used when a slot is null. */

enum {
  ISAAC_ANM2_LAYER_NAME_INDEX_VA = 0x0040b44au,
  ISAAC_ANM2_LAYER_NAME_INDEX_END_VA = 0x0040b4abu,
  ISAAC_ANM2_LAYER_NAME_INDEX_BASE_OFF = 0x7cu,
  ISAAC_ANM2_LAYER_NAME_INDEX_COUNT_OFF = 0x80u,
  ISAAC_ANM2_LAYER_NAME_INDEX_STRIDE = 0xa0u,
  ISAAC_ANM2_LAYER_NAME_INDEX_NAME_OFF = 0x08u,
  ISAAC_ANM2_LAYER_NAME_INDEX_SSO_CAP_OFF = 0x1cu,
  ISAAC_ANM2_LAYER_NAME_INDEX_SSO_CAP = 0x10u,
  ISAAC_ANM2_LAYER_NAME_INDEX_EMPTY_STR_VA = 0x00b1a4ecu,
};

typedef struct IsaacAnm2LayerNameIndexPlan {
  int32_t entered;
  int32_t count;
  uint32_t base;
  int32_t found_index;
  uint32_t elem;
  uint32_t result;
  int32_t log_needed;
  uint32_t log_va;
  int32_t log_level;
  uint32_t log_str_va;
  int32_t host_call_count;
  int32_t pure_complete;
} IsaacAnm2LayerNameIndexPlan;

void isaac_anm2_layer_name_index_plan(uint8_t* anm2,
                                      uint32_t name_addr,
                                      IsaacAnm2LayerNameIndexPlan* out);
/* ============ v38: 0x0040b310 layer name->slot SIZED eq ====================
   ret 4; SEH. count=[this+0x80]; base=[this+0x7c]; stride 0xa0. arg =
   std::string* (size +0x10, cap +0x14, chars/ptr +0). Each slot holds a
   POINTER to the element; name at elem+8, SSO cap at elem+0x1c (jb 0x10
   inline). Sized-eq (0x40cae0): size EQUAL AND bytes equal -> first match
   returns base + i*0xa0 (SLOT address); none/count0 -> 0. Null slots are the
   empty string. Heap locals (cap>=0x10) take an MSVC sized-free (0xaef15c,
   platform) + block validation (ja -> noreturn IAT 0xb18894, never on valid
   blocks) — both platform primitives, no game-logic edge. */

enum {
  ISAAC_ANM2_LAYER_SLOT_SIZED_EQ_VA = 0x0040b310u,
  ISAAC_ANM2_LAYER_SLOT_SIZED_EQ_END_VA = 0x0040b421u,
  ISAAC_ANM2_LAYER_SLOT_SIZED_EQ_BASE_OFF = 0x7cu,
  ISAAC_ANM2_LAYER_SLOT_SIZED_EQ_COUNT_OFF = 0x80u,
  ISAAC_ANM2_LAYER_SLOT_SIZED_EQ_STRIDE = 0xa0u,
  ISAAC_ANM2_LAYER_SLOT_SIZED_EQ_NAME_OFF = 0x08u,
  ISAAC_ANM2_LAYER_SLOT_SIZED_EQ_SSO_CAP_OFF = 0x1cu,
  ISAAC_ANM2_LAYER_SLOT_SIZED_EQ_SSO_CAP = 0x10u,
  ISAAC_ANM2_LAYER_SLOT_SIZED_EQ_EQ_HELPER_VA = 0x0040cae0u,
  ISAAC_ANM2_LAYER_SLOT_SIZED_EQ_FREE_VA = 0x00aef15cu,
  ISAAC_ANM2_LAYER_SLOT_SIZED_EQ_INVALID_PARAM_VA = 0x00b18894u,
};

typedef struct IsaacAnm2LayerSlotSizedEqPlan {
  int32_t entered;
  int32_t count;             /* SIGNED field; loop unsigned */
  uint32_t base;
  int32_t found_index;
  uint32_t slot;             /* base + i*0xa0 when found */
  uint32_t result;
  int32_t arg_size;
  int32_t local_heap_count;  /* slots whose names were heap-backed */
  int32_t log_needed;
  uint32_t log_va;
  int32_t log_level;
  uint32_t log_str_va;
  int32_t host_call_count;
  int32_t pure_complete;
} IsaacAnm2LayerSlotSizedEqPlan;


/* ============ v39: 0x0040b4d0 +0x84/+0x88 bounded getter ==================
   ret 4. count=[this+0x88]; base=[this+0x84]; stride 0xc (index*12). index<0
   (js) OR index>=[this+0x88] (SIGNED jl) -> side-effect log 0xa112c0(0x10,
   0xb1a6a8 "%s: No null with Id %d\n", this-name SSO, index); the RESULT is
   computed UNCONDITIONALLY (log does not skip the return): base+index*0xc. */

enum {
  ISAAC_ANM2_SUBARRAY_GET_VA = 0x0040b4d0u,
  ISAAC_ANM2_SUBARRAY_GET_END_VA = 0x0040b513u,
  ISAAC_ANM2_SUBARRAY_GET_BASE_OFF = 0x84u,
  ISAAC_ANM2_SUBARRAY_GET_COUNT_OFF = 0x88u,
  ISAAC_ANM2_SUBARRAY_GET_STRIDE = 0x0cu,
  ISAAC_ANM2_SUBARRAY_GET_LOG_VA = 0x00a112c0u,
  ISAAC_ANM2_SUBARRAY_GET_LOG_LEVEL = 0x10,
  ISAAC_ANM2_SUBARRAY_GET_LOG_STR_VA = 0x00b1a6a8u,
  ISAAC_ANM2_SUBARRAY_GET_NAME_CAP_OFF = 0x14u,
  ISAAC_ANM2_SUBARRAY_GET_SSO_CAP = 0x10u,
};

typedef struct IsaacAnm2SubarrayGetPlan {
  int32_t entered;
  int32_t count;             /* [this+0x88] SIGNED (jl) */
  uint32_t base;             /* [this+0x84] */
  int32_t index;             /* arg, SIGNED */
  uint32_t result;           /* base + index*0xc ALWAYS */
  int32_t in_range;
  int32_t log_needed;
  uint32_t log_va;
  int32_t log_level;
  uint32_t log_str_va;
  uint32_t log_name_addr;    /* this-name SSO data address */
  int32_t host_call_count;
  int32_t pure_complete;
} IsaacAnm2SubarrayGetPlan;


/* ============ v40: 0x0040b520 +0x84/+0x88 name->index =====================
   ret 4. Same sub-array as v39: count=[this+0x88] (SIGNED jle/jl), base=
   [this+0x84], stride 0x18 (24-byte elements). Element name std::string at
   elem+0, SSO cap elem+0x14 (jb 0x10 inline, else heap ptr [elem+0]). 2-byte
   strcmp vs the arg C-string. Match -> index; no match/count<=0 -> -1. */

enum {
  ISAAC_ANM2_SUBARRAY_NAME_INDEX_VA = 0x0040b520u,
  ISAAC_ANM2_SUBARRAY_NAME_INDEX_END_VA = 0x0040b589u,
  ISAAC_ANM2_SUBARRAY_NAME_INDEX_BASE_OFF = 0x84u,
  ISAAC_ANM2_SUBARRAY_NAME_INDEX_COUNT_OFF = 0x88u,
  ISAAC_ANM2_SUBARRAY_NAME_INDEX_STRIDE = 0x18u,
  ISAAC_ANM2_SUBARRAY_NAME_INDEX_SSO_CAP_OFF = 0x14u,
  ISAAC_ANM2_SUBARRAY_NAME_INDEX_SSO_CAP = 0x10u,
};

typedef struct IsaacAnm2SubarrayNameIndexPlan {
  int32_t entered;
  int32_t count;             /* [this+0x88] SIGNED (jle/jl) */
  uint32_t base;             /* [this+0x84] */
  int32_t found_index;       /* match index, else -1 */
  int32_t result;            /* same as found_index */
  uint32_t name_addr;        /* arg C-string */
  int32_t heap_count;        /* elements whose names were heap-backed */
  int32_t log_needed;        /* always 0: truly pure */
  uint32_t log_va;
  int32_t log_level;
  int32_t host_call_count;
  int32_t pure_complete;
} IsaacAnm2SubarrayNameIndexPlan;


/* ============ v41: 0x0040bbf0 0x6c-byte struct copy =======================
   ret 4. this=ecx = DEST; [ebp+8] = SRC. Copies the 0x6c-byte element
   struct field-by-field (dword pairs +0x0..+0x28, byte +0x2c, movups +0x30
   and +0x40, movq +0x50, dwords +0x58/+0x5c, byte +0x60, dwords
   +0x64/+0x68). Truly pure; the layout IS the contract. */

enum {
  ISAAC_ANM2_STRUCT_COPY_6C_VA = 0x0040bbf0u,
  ISAAC_ANM2_STRUCT_COPY_6C_END_VA = 0x0040bc3bu,
  ISAAC_ANM2_STRUCT_COPY_6C_SIZE = 0x6cu,
};

typedef struct IsaacAnm2StructCopy6cPlan {
  int32_t entered;
  uint32_t dst_addr;
  uint32_t src_addr;
  int32_t byte_count;        /* 0x6c */
  int32_t log_needed;        /* always 0 */
  uint32_t log_va;
  int32_t log_level;
  int32_t host_call_count;
  int32_t pure_complete;
} IsaacAnm2StructCopy6cPlan;

/** Copies 0x6c bytes from src to this (field-by-field, PE order). */

/* ============ v42: 0x0040c310 self-assign-guarded string assign ===========
   ret 4. this=ecx; src=[ebp+8]. Self-alias -> return *this, PURE NO-OP.
   Else: src std::string SSO decode (cap [src+0x14] jb 0x10 inline : heap
   [src]; size [src+0x10]) -> host STRING_ASSIGN 0x40ccd0(this, data, size). */

enum {
  ISAAC_ANM2_STRING_ASSIGN_GUARD_VA = 0x0040c310u,
  ISAAC_ANM2_STRING_ASSIGN_GUARD_END_VA = 0x0040c32bu,
  ISAAC_ANM2_STRING_ASSIGN_GUARD_HOST_VA = 0x0040ccd0u,
  ISAAC_ANM2_STRING_ASSIGN_GUARD_SSO_CAP_OFF = 0x14u,
  ISAAC_ANM2_STRING_ASSIGN_GUARD_SIZE_OFF = 0x10u,
  ISAAC_ANM2_STRING_ASSIGN_GUARD_SSO_CAP = 0x10u,
};

typedef struct IsaacAnm2StringAssignGuardPlan {
  int32_t entered;
  uint32_t this_addr;
  uint32_t src_addr;
  int32_t self_alias;        /* 1: pure no-op (host event dropped) */
  uint32_t src_data;         /* SSO inline or heap ptr */
  int32_t src_size;
  int32_t host_needed;       /* 0 on self-alias, 1 otherwise */
  uint32_t host_va;          /* 0x40ccd0 STRING_ASSIGN */
  int32_t log_needed;
  uint32_t log_va;
  int32_t log_level;
  int32_t host_call_count;
  int32_t pure_complete;     /* 1 only on the self-alias arm */
} IsaacAnm2StringAssignGuardPlan;


/* ============ v43: 0x0040c340 SSO C-string ctor ===========================
   ret 4. std::string(const char*): this=ecx; cstr=[ebp+8]. Zero-init SSO
   ([this]=0, [this+0x10]=0, [this+0x14]=0xf), pure inline strlen, then host
   STRING_ASSIGN 0x40ccd0(this, cstr, length). The strlen decode is the pure
   translated arm; the assign stays host. */

enum {
  ISAAC_ANM2_SSO_CSTR_CTOR_VA = 0x0040c340u,
  ISAAC_ANM2_SSO_CSTR_CTOR_END_VA = 0x0040c37du,
  ISAAC_ANM2_SSO_CSTR_CTOR_HOST_VA = 0x0040ccd0u,
  ISAAC_ANM2_SSO_CSTR_CTOR_CAP_OFF = 0x14u,
  ISAAC_ANM2_SSO_CSTR_CTOR_SSO_CAP = 0x0fu,
};

typedef struct IsaacAnm2SsoCstrCtorPlan {
  int32_t entered;
  uint32_t this_addr;
  uint32_t cstr_addr;
  int32_t str_len;           /* pure strlen decode */
  int32_t host_needed;       /* always 1: ctor assign */
  uint32_t host_va;          /* 0x40ccd0 STRING_ASSIGN */
  int32_t log_needed;
  uint32_t log_va;
  int32_t log_level;
  int32_t host_call_count;
  int32_t pure_complete;     /* 0: host assign required */
} IsaacAnm2SsoCstrCtorPlan;


/* ============ v44: 0x0040d0e0 float-vector ctor (7 float inputs) ==========
   CORRECTED by the v62 unit (byte-exact PE re-read): the body is
   0x0040d0e0..0x40d13a (`pop ebp ; ret 0x10` @ 0x40d137..0x40d13a). The
   old END_VA 0x40d11d was a mid-instruction pin — byte 0x40d11d is the
   disp8 of `movss [ecx+0x24],xmm0` (0x40d11a..0x40d11e); no `ret` there.
   The machine reads SEVEN distinct float sources, not four:
     stack: a0 = [ebp+0x08], a1 = [ebp+0x0c], a2 = [ebp+0x10],
            a6 = [ebp+0x14];  regs: x1 = xmm1, x2 = xmm2, x3 = xmm3.
   Stores (PE order):
     [this+0x10..0x1c] = 0 (4 dwords)
     [this+0x0c] = a0, [this+0x20] = a1, [this+0x24] = a2
     [this+0x00] = x1 (0x40d124), [this+0x04] = x2 (0x40d128),
     [this+0x08] = x3 (0x40d12d), [this+0x28] = a6 (0x40d132)
   The old "arg3 replicated to +0/+4/+8/+0x28" reading was WRONG: the
   bytes are four distinct stores from xmm1/xmm2/xmm3/[ebp+0x14]. Truly
   pure: zero E8/E9/ind (v62 windowed census), no gates, eax = this
   (0x40d0e8 mov eax,ecx). Zero callers of any kind — dead code. */

enum {
  ISAAC_ANM2_FLOATVEC_CTOR_VA = 0x0040d0e0u,
  ISAAC_ANM2_FLOATVEC_CTOR_END_VA = 0x0040d13au, /* `ret 0x10` @ 0x40d138 */
  ISAAC_ANM2_FLOATVEC_CTOR_RET_BYTES = 0x10,
};

typedef struct IsaacAnm2FloatVecCtorPlan {
  int32_t entered;
  uint32_t this_addr;
  uint32_t a0_bits;           /* [ebp+0x08] stack float */
  uint32_t a1_bits;           /* [ebp+0x0c] */
  uint32_t a2_bits;           /* [ebp+0x10] */
  uint32_t x1_bits;           /* xmm1 */
  uint32_t x2_bits;           /* xmm2 */
  uint32_t x3_bits;           /* xmm3 */
  uint32_t a6_bits;           /* [ebp+0x14] */
  int32_t log_needed;
  uint32_t log_va;
  int32_t log_level;
  int32_t host_call_count;
  int32_t pure_complete;
} IsaacAnm2FloatVecCtorPlan; /* 14 x 4 = 56 bytes */

/** Performs the 7-input float ctor stores; plan pins the layout. */

/* ============ v45: 0x0040ca70 ORDERED memcmp ==============================
   ret. ecx=a, edx=b, [ebp+8]=n. dword loop while n>=4, byte tail 0..3 in
   order. Returns ORDER of first differing byte (UNSIGNED): a<b -> -1, a>b ->
   +1; 0 when equal. Distinct from the v38 sized-eq (1/0). The trailing
   push 0xb1a6c8; call [0xb184d4]; int3 after the rets is DEAD — no branch
   reaches it. Truly pure. */

enum {
  ISAAC_ANM2_ORDERED_MEMCMP_VA = 0x0040ca70u,
  ISAAC_ANM2_ORDERED_MEMCMP_END_VA = 0x0040cac9u,
  ISAAC_ANM2_ORDERED_MEMCMP_ASSERT_MSG_VA = 0x00b1a6c8u,
  ISAAC_ANM2_ORDERED_MEMCMP_ASSERT_HOOK_VA = 0x00b184d4u,
};

typedef struct IsaacAnm2OrderedMemcmpPlan {
  int32_t entered;
  uint32_t a_addr;
  uint32_t b_addr;
  int32_t n;                 /* SIGNED field; loop unsigned */
  int32_t result;            /* -1/0/+1 unsigned byte order */
  int32_t log_needed;        /* always 0 */
  uint32_t log_va;
  int32_t log_level;
  int32_t host_call_count;
  int32_t pure_complete;
} IsaacAnm2OrderedMemcmpPlan;


/* ============ v46: 0x0040c6f0 hash-table probe ============================
   ret; no receiver. Pure indexed read: end = endLo + endHi (0xc78dbc +
   0xc78dc0); idx = (key-1) & (end-1) UNSIGNED (key = 0xc78db8); result =
   [base + idx*4] (base = 0xc78db4). The four globals are RUNTIME inputs
   (sparse direct writers; none constant) — host supplies each tick, apply
   never touches them (v82 flags precedent). Pure. */

enum {
  ISAAC_ANM2_HASH_PROBE_VA = 0x0040c6f0u,
  ISAAC_ANM2_HASH_PROBE_END_VA = 0x0040c70bu,
  ISAAC_ANM2_HASH_PROBE_BASE_GLOBAL = 0x00c78db4u,
  ISAAC_ANM2_HASH_PROBE_KEY_GLOBAL = 0x00c78db8u,
  ISAAC_ANM2_HASH_PROBE_END_LO_GLOBAL = 0x00c78dbcu,
  ISAAC_ANM2_HASH_PROBE_END_HI_GLOBAL = 0x00c78dc0u,
};

typedef struct IsaacAnm2HashProbePlan {
  int32_t entered;
  uint32_t table_base;       /* [0xc78db4] runtime */
  uint32_t key;              /* [0xc78db8] runtime */
  uint32_t end_lo;           /* [0xc78dbc] runtime */
  uint32_t end_hi;           /* [0xc78dc0] runtime */
  uint32_t index;            /* (key-1) & (end-1), UNSIGNED */
  uint32_t result;           /* [base + index*4] */
  int32_t log_needed;
  uint32_t log_va;
  int32_t log_level;
  int32_t host_call_count;
  int32_t pure_complete;
} IsaacAnm2HashProbePlan;

void isaac_anm2_hash_probe_plan(uint32_t table_base,
                                uint32_t key,
                                uint32_t end_lo,
                                uint32_t end_hi,
                                IsaacAnm2HashProbePlan* out);
int32_t isaac_anm2_ordered_memcmp(uint32_t a_addr,
                                  uint32_t b_addr,
                                  uint32_t n,
                                  IsaacAnm2OrderedMemcmpPlan* out);
void isaac_anm2_floatvec_ctor(uint8_t* anm2,
                              float a0,
                              float a1,
                              float a2,
                              float x1,
                              float x2,
                              float x3,
                              float a6,
                              IsaacAnm2FloatVecCtorPlan* out);
void isaac_anm2_sso_cstr_ctor_plan(uint8_t* anm2,
                                   uint32_t cstr_addr,
                                   IsaacAnm2SsoCstrCtorPlan* out);
void isaac_anm2_string_assign_guard_plan(uint8_t* anm2,
                                         uint32_t src_addr,
                                         IsaacAnm2StringAssignGuardPlan* out);
void isaac_anm2_struct_copy_6c(uint8_t* dst,
                               const uint8_t* src,
                               IsaacAnm2StructCopy6cPlan* out);
void isaac_anm2_subarray_name_index_plan(uint8_t* anm2,
                                         uint32_t name_addr,
                                         IsaacAnm2SubarrayNameIndexPlan* out);
void isaac_anm2_subarray_get_plan(uint8_t* anm2,
                                  int32_t index,
                                  IsaacAnm2SubarrayGetPlan* out);
void isaac_anm2_layer_slot_sized_eq_plan(uint8_t* anm2,
                                         uint32_t arg_addr,
                                         IsaacAnm2LayerSlotSizedEqPlan* out);


/* needed(data_dword): FULL-dword test. Consume v19 BY REFERENCE. 0x100 is needed. */
int32_t isaac_anm2_stop_needed(uint32_t data_dword);

/* Writes byte[this+0x44] = 0 only when needed. Null ANM2 is a no-op. */
void isaac_anm2_stop_apply(uint8_t* anm2);

/* ============ v48: 0x0040c780 float-pointer min + 0x0040c790 SSO sized-eq ===
   0x0040c780 (13 bytes, `ret` @ 0x0040c78c, 66 direct E8 callers):
       movss xmm0,[ecx] ; comiss xmm0,[edx] ; cmova ecx,edx ; mov eax,ecx ; ret
   Returns the ADDRESS of the smaller float. cmova = CF==0 && ZF==0: takes b
   ONLY when a > b is ORDERED. NaN on either side (comiss unordered, PF=1)
   does NOT take cmova, so a NaN operand keeps the FIRST pointer; ties (-0/+0)
   likewise keep a. The plan publishes bits, the unordered (PF) verdict and
   the selected address (result_addr = takes_b ? b_addr : a_addr).

   0x0040c790 (28 insns, `ret` @ 0x0040c7b4, 3 direct E8 callers): std::string
   sized-eq wrapper. SSO-select both strings (`cmp [str+0x14],0x10 ; jb` —
   UNSIGNED strict below; cap >= 0x10 reads the heap pointer at [str]), then
   calls the already-modeled 0x0040cae0 sized-eq with a_chars/a_size in
   ecx/edx and b_chars/b_size on the stack: sizes EQUAL AND bytes equal over
   a_size -> AL 1, else 0 (the family bytes_equal law). Pure; 0x0040cae0 is
   modeled, so helper_va is published and pure_complete stays 1.

   v47's "NONE pure remains" census was stale: it missed these two live pure
   bodies. 0x0040c890 (6 live callers) is the global hash-table grow/insert
   (stores 0xc78db4/0xc78db8/0xc78dbc, inc 0xc78dc0; alloc
   0x0040cf00 and 0x00a0f4c0, memcpy 0x00af08bd, memset 0x00af05e5, throws
   0x0040cad0/0x0040cee0) — its DECISION laws landed at v57 (see the v57
   block below; the alloc/memcpy/free leaves stay typed-host per the
   alloc-family platform-primitive decision). 0x0040cb50..0x0040d090 ctors
   have 0 callers.
   0x0040add0/0x0040ae70 are frame-opaque-owned twins. v46's 0x0040c6f0
   hash probe stays pure; the 0x0040c890 INSERT laws are v57. */

enum {
  ISAAC_ANM2_FLOAT_MIN_VA = 0x0040c780u,       /* no ZHL; address-stable */
  ISAAC_ANM2_FLOAT_MIN_END_VA = 0x0040c78cu,   /* `ret` */
  ISAAC_ANM2_FLOAT_MIN_CALLSITE_COUNT = 66,    /* .text e8 only */
  ISAAC_ANM2_SSO_SIZED_EQ_VA = 0x0040c790u,    /* no ZHL; address-stable */
  ISAAC_ANM2_SSO_SIZED_EQ_END_VA = 0x0040c7b4u,/* `ret` */
  ISAAC_ANM2_SSO_SIZED_EQ_CALLSITE_COUNT = 3,  /* .text e8 only */
  ISAAC_ANM2_SSO_SIZED_EQ_HELPER_VA = 0x0040cae0u, /* sized-eq (v38) */
  ISAAC_ANM2_SSO_SIZED_EQ_SSO_CAP = 0x10u,
};

typedef struct IsaacAnm2FloatMinPlan {
  int32_t entered;         /* 1 when both addrs non-null */
  uint32_t a_addr;
  uint32_t b_addr;
  uint32_t a_bits;         /* load_guest_u32(a_addr) */
  uint32_t b_bits;         /* load_guest_u32(b_addr) */
  int32_t unordered;       /* PF: a or b is NaN */
  int32_t takes_b;         /* ordered && a > b (cmova taken) */
  uint32_t result_addr;    /* takes_b ? b_addr : a_addr */
  int32_t pure_complete;   /* 1 */
} IsaacAnm2FloatMinPlan;

typedef struct IsaacAnm2SsoSizedEqPlan {
  int32_t entered;         /* 1 when both addrs non-null */
  uint32_t a_addr;
  uint32_t b_addr;
  uint32_t a_cap;          /* [a+0x14] */
  uint32_t a_size;         /* [a+0x10] */
  int32_t a_heap;          /* cap >= 0x10 */
  uint32_t a_chars;        /* SSO select: a_addr or *a */
  uint32_t b_cap;
  uint32_t b_size;
  int32_t b_heap;
  uint32_t b_chars;
  int32_t result;          /* AL: sizes equal AND bytes equal */
  uint32_t helper_va;      /* 0x0040cae0 */
  int32_t pure_complete;   /* 1 */
} IsaacAnm2SsoSizedEqPlan;

uint32_t isaac_anm2_float_min_plan(uint32_t a_addr,
                                   uint32_t b_addr,
                                   IsaacAnm2FloatMinPlan* out);
int32_t isaac_anm2_sso_sized_eq_plan(uint32_t a_addr,
                                     uint32_t b_addr,
                                     IsaacAnm2SsoSizedEqPlan* out);

/* ===================== v49: 0x0040ae70 SSO name->flag walk =============== */

/* __thiscall bool (this, const char* name) — address-stable, no ZHL match.
   104 direct .text e8 callers. Twin of frame-opaque's FUN_0040add0 walk
   (0x40add0..0x40ae6a, owned by frame-opaque): SAME owner list shape
   (entries [owner+0x8c], count [owner+0x90], stride 0x18, SSO cap 0x10,
   assert gate [this+4] -> HOST 0xa112c0) but the match tail tests
   [this+0x1c] while FUN_0040add0's tests [this+0x18] — the +0x1c-vs-+0x18
   delta is pinned by the tests.

   PE (0x40ae70..0x40af0a, `ret 4`):
     cmp dword [this+4],0 ; je HOST 0xa112c0(0xb1a504 "AnimationData is NULL",
     0x10) — assert edge; the walk STILL RUNS after the log (no early-out,
     no reload of [this+4])
     esi = [this]                          ; owner (read AFTER the log)
     count = [owner+0x90]                  ; read ONCE before the loop
     if count == 0 -> return 0
     base = [owner+0x8c]                   ; NOT read when count == 0
     loop i = 0..count-1 (jb UNSIGNED; bound NOT re-read per iteration):
       entry = base + i*0x18
       chars = [entry+0x14] < 0x10 ? entry : [entry]   (jb STRICT; cap 0x10
       is ALREADY the heap pointer)
       cmp  = inlined strcmp(chars, name)  (two-byte loop + sbb/or; UNSIGNED
       byte compare; -1/0/+1)
       if cmp == 0 -> MATCH at i
     return 0
   MATCH:
     test i,i ; js -> return 0             (DEAD on x86; i is 0-based)
     bit = 1 << (i & 31)                   (shl eax,cl — x86 masks the count
     modulo 32, so i==32 shifts by 0)
     return ([this+0x1c] & bit) != 0       (this re-read from the saved slot
     [ebp-4], NOT the loop-clobbered register; FULL-dword AND, setne al) */
enum {
  ISAAC_ANM2_NAME_FLAG_VA = 0x0040ae70u,   /* no ZHL; address-stable */
  ISAAC_ANM2_NAME_FLAG_END_VA = 0x0040af0au, /* `ret 4` */
  ISAAC_ANM2_NAME_FLAG_CALLSITE_COUNT = 104, /* .text e8 only */
  ISAAC_ANM2_NAME_FLAG_OWNER_OFF = 0x00,   /* [this+0] list owner */
  ISAAC_ANM2_NAME_FLAG_GATE_OFF = 0x04,    /* [this+4] assert gate */
  ISAAC_ANM2_NAME_FLAG_COUNT_OFF = 0x90,   /* [owner+0x90] */
  ISAAC_ANM2_NAME_FLAG_BASE_OFF = 0x8c,    /* [owner+0x8c] */
  ISAAC_ANM2_NAME_FLAG_STRIDE = 0x18,
  ISAAC_ANM2_NAME_FLAG_SSO_CAP_OFF = 0x14, /* [entry+0x14] */
  ISAAC_ANM2_NAME_FLAG_SSO_CAP = 0x10u,
  ISAAC_ANM2_NAME_FLAG_BITFIELD_OFF = 0x1c, /* NOT frame-opaque's +0x18 */
  ISAAC_ANM2_NAME_FLAG_BITWIDTH = 32,
  ISAAC_ANM2_NAME_FLAG_LOG_VA = 0x00a112c0u,
  ISAAC_ANM2_NAME_FLAG_LOG_LEVEL = 0x10,
  ISAAC_ANM2_NAME_FLAG_LOG_STR_VA = 0x00b1a504u, /* "AnimationData is NULL" */
};

typedef struct IsaacAnm2NameFlagWalkPlan {
  int32_t entered;          /* 1 when this_addr && name_addr non-null */
  uint32_t this_addr;
  uint32_t name_addr;
  uint32_t owner_addr;      /* [this+0] raw (read after the assert log) */
  uint32_t count_raw;       /* [owner+0x90] */
  uint32_t base_raw;        /* [owner+0x8c]; 0 when count==0 (PE skips) */
  int32_t assert_host_needed; /* [this+4]==0 -> HOST 0xa112c0 */
  uint32_t log_va;          /* 0x00a112c0 */
  uint32_t log_level;       /* 0x10 */
  uint32_t log_str_va;      /* 0x00b1a504 */
  int32_t match_index;      /* -1 on miss */
  int32_t match_cmp;        /* normalized strcmp (-1/0/+1) of the hit */
  uint32_t match_entry_cap; /* [entry+0x14] of the matched entry */
  uint32_t match_chars_addr;/* SSO-select of the matched entry chars */
  uint32_t flag_bit;        /* 1 << (match_index & 31); 0 on miss */
  uint32_t bitfield_raw;    /* [this+0x1c]; 0 on miss */
  int32_t result;           /* AL: 1 on hit && bit set */
  int32_t host_call_count;  /* 1 on the assert edge */
  int32_t pure_complete;    /* 0 on the assert edge */
} IsaacAnm2NameFlagWalkPlan;

/* Law exports. All scalar params are uint32_t (no narrow ABI params). */
int32_t isaac_anm2_name_flag_assert_needed(uint32_t field_4);
int32_t isaac_anm2_name_flag_sso_inline(uint32_t cap_14);
uint32_t isaac_anm2_name_flag_bit_mask(uint32_t match_index);
int32_t isaac_anm2_name_flag_bit_result(uint32_t bitfield_1c,
                                        uint32_t match_index);
int32_t isaac_anm2_name_flag_walk_plan(uint32_t this_addr,
                                       uint32_t name_addr,
                                       IsaacAnm2NameFlagWalkPlan* out);

/* ============ v49: 0x0040b000 IsEventTriggered SSO wrapper ================
   FUN_0040b000 (ret 4; address-stable; Lua glue "IsEventTriggered" bind via
   helper 0x0089f1b0 at glue site 0x008674b3 — register-held const):
     eax = [ebp+8] (name std::string*); SSO select: cap [eax+0x14] cmp 0x10
     jb (UNSIGNED strict below) -> chars = name ; else chars = [name] (heap).
     FULL-dword gate cmp dword [this+0x34],0 (0x100 IS set): closed -> xor
     al,al ret (bool 0; PE byte-clear leaves upper 3 bytes of EAX = chars
     addr); open -> push chars; add this,0x30; call 0x0040add0 (HOST —
     frame-opaque-owned SSO name->flag walk body, BY REFERENCE); ret 4.
   NARROWED: gate + SSO decode + call contract pure; the walk stays host. */
enum {
  ISAAC_ANM2_EVENT_TRIGGER_SSO_VA = 0x0040b000u,
  ISAAC_ANM2_EVENT_TRIGGER_SSO_END_VA = 0x0040b027u,  /* `ret 4`; int3 0x40b028..0x40b02f */
  ISAAC_ANM2_EVENT_TRIGGER_SSO_SSO_CAP_OFF = 0x14u,
  ISAAC_ANM2_EVENT_TRIGGER_SSO_SSO_CAP = 0x10u,
  ISAAC_ANM2_EVENT_TRIGGER_SSO_GATE_OFF = 0x34u,      /* FULL dword */
  ISAAC_ANM2_EVENT_TRIGGER_SSO_STATE_OFF = 0x30u,     /* call receiver offset */
  ISAAC_ANM2_EVENT_TRIGGER_SSO_CALL_VA = 0x0040add0u, /* HOST walk body */
  ISAAC_ANM2_EVENT_TRIGGER_SSO_LUA_PUSH_VA = 0x008674b3u,
  ISAAC_ANM2_EVENT_TRIGGER_SSO_LUA_PUSH_COUNT = 1,
  ISAAC_ANM2_EVENT_TRIGGER_SSO_CALLSITE_COUNT = 1,    /* Lua glue reg-held const */
};

typedef struct IsaacAnm2EventTriggerSsoPlan {
  int32_t entered;         /* 1 when anm2 non-null */
  int32_t sso;             /* cap < 0x10 ? inline : heap */
  uint32_t chars_addr;     /* decoded name chars guest address */
  int32_t gate_34;         /* [this+0x34] FULL dword != 0 */
  uint32_t call_va;        /* 0x0040add0 HOST walk body */
  uint32_t recv_off;       /* 0x30 */
  int32_t result;          /* closed-path bool 0 (AL); host fills on open */
  uint32_t eax_closed;     /* closed-path EAX: chars_addr & ~0xff (xor al,al) */
  int32_t host_call_count; /* gate ? 1 : 0 */
  int32_t pure_complete;   /* !gate */
} IsaacAnm2EventTriggerSsoPlan;

void isaac_anm2_event_trigger_sso_plan(uint8_t* anm2,
                                       uint32_t name_addr,
                                       IsaacAnm2EventTriggerSsoPlan* out);

/* ============ v49: 0x0040b060 WasEventTriggered SSO wrapper ===============
   FUN_0040b060 (ret 4; address-stable; Lua glue "WasEventTriggered" bind:
   .rdata literal "WasEventTriggered" at 0x00b705ac, push 0x0040b060 at
   glue site 0x008674c3, same helper 0x0089f1b0 as 0x0040b000 — one slot
   after IsEventTriggered's push at 0x008674b3):
     eax = [ebp+8] (name std::string*); SSO select: cap [eax+0x14] cmp 0x10
     jb (UNSIGNED strict below) -> chars = name ; else chars = [name] (heap).
     FULL-dword gate cmp dword [this+0x34],0 (0x100 IS set): closed -> xor
     al,al ret (bool 0; PE byte-clear leaves upper 3 bytes of EAX = chars
     addr); open -> push chars; add this,0x30; call 0x0040ae70 (HOST —
     BandD's in-wave ANM2 name->flag walk body, BY REFERENCE — the +0x1c
     twin of frame-opaque's 0x0040add0); ret 4.
   NARROWED: gate + SSO decode + call contract pure; the walk stays host. */
enum {
  ISAAC_ANM2_WAS_EVENT_TRIGGERED_SSO_VA = 0x0040b060u,
  ISAAC_ANM2_WAS_EVENT_TRIGGERED_SSO_END_VA = 0x0040b087u, /* `ret 4` */
  ISAAC_ANM2_WAS_EVENT_TRIGGERED_SSO_SSO_CAP_OFF = 0x14u,
  ISAAC_ANM2_WAS_EVENT_TRIGGERED_SSO_SSO_CAP = 0x10u,
  ISAAC_ANM2_WAS_EVENT_TRIGGERED_SSO_GATE_OFF = 0x34u,  /* FULL dword */
  ISAAC_ANM2_WAS_EVENT_TRIGGERED_SSO_STATE_OFF = 0x30u, /* call receiver */
  ISAAC_ANM2_WAS_EVENT_TRIGGERED_SSO_CALL_VA = 0x0040ae70u, /* HOST walk */
  ISAAC_ANM2_WAS_EVENT_TRIGGERED_SSO_LUA_PUSH_VA = 0x008674c3u,
  ISAAC_ANM2_WAS_EVENT_TRIGGERED_SSO_LUA_PUSH_COUNT = 1,
  ISAAC_ANM2_WAS_EVENT_TRIGGERED_SSO_CALLSITE_COUNT = 1, /* Lua glue reg-held const */
};

typedef struct IsaacAnm2WasEventTriggeredSsoPlan {
  int32_t entered;         /* 1 when anm2 non-null */
  int32_t sso;             /* cap < 0x10 ? inline : heap */
  uint32_t chars_addr;     /* decoded name chars guest address */
  int32_t gate_34;         /* [this+0x34] FULL dword != 0 */
  uint32_t call_va;        /* 0x0040ae70 HOST walk body */
  uint32_t recv_off;       /* 0x30 */
  int32_t result;          /* closed-path bool 0 (AL); host fills on open */
  uint32_t eax_closed;     /* closed-path EAX: chars_addr & ~0xff (xor al,al) */
  int32_t host_call_count; /* gate ? 1 : 0 */
  int32_t pure_complete;   /* !gate */
} IsaacAnm2WasEventTriggeredSsoPlan;

void isaac_anm2_was_event_triggered_sso_plan(uint8_t* anm2,
                                             uint32_t name_addr,
                                             IsaacAnm2WasEventTriggeredSsoPlan* out);

/* ============ v49 band-b: 0x0040b030 const-char twin =====================
   `__thiscall bool (this, const char* name)` — ret 4 @ 0x40b04e; no ZHL
   match (address-stable). 386 direct .text e8 callers (rel32 census,
   section-table mapped). Twin of the 0x0040b000 SSO wrapper (band-a): the
   ONLY difference is the arg handling — this body pushes [ebp+8] UNCHANGED
   (raw const char*), while 0x40b000 SSO-decodes a std::string. Must NOT be
   unified with the twin.

   PE 0x40b030..0x40b050 (int3 pad 0x40b051..0x40b05f):
     push ebp; mov ebp,esp; push ecx
     cmp dword [ecx+0x34], 0 ; jne 0x40b041   FULL-dword gate, 0x100 IS set
     xor al,al                                closed -> return 0
     ret 4
     push dword [ebp+8]                       RAW const char* name
     add ecx, 0x30                            receiver = this+0x30
     call 0x40add0                            HOST name->flag walk (BY
                                              REFERENCE, frame-opaque-owned)
     ret 4                                    return callee AL
   0 stores, 1 E8. open gate -> 1 host call; closed -> pure (result 0). */

enum {
  ISAAC_ANM2_EVENT_TRIGGER_CSTR_VA = 0x0040b030u,
  ISAAC_ANM2_EVENT_TRIGGER_CSTR_END_VA = 0x0040b04eu, /* `ret 4` */
  ISAAC_ANM2_EVENT_TRIGGER_CSTR_GATE_OFF = 0x34u,     /* FULL dword */
  ISAAC_ANM2_EVENT_TRIGGER_CSTR_STATE_OFF = 0x30u,    /* call receiver offset */
  ISAAC_ANM2_EVENT_TRIGGER_CSTR_CALL_VA = 0x0040add0u, /* HOST walk body */
  ISAAC_ANM2_EVENT_TRIGGER_CSTR_CALLSITE_COUNT = 386, /* direct e8 callers */
};

typedef struct IsaacAnm2EventTriggerCstrPlan {
  int32_t entered;         /* 1 when anm2 non-null */
  int32_t gate_34;         /* [this+0x34] != 0 (FULL-dword test) */
  uint32_t chars_addr;     /* RAW arg passthrough — the PE pushes [ebp+8]
                              verbatim; NO SSO decode (twin contrast) */
  uint32_t call_va;        /* 0x0040add0 HOST name->flag walk */
  uint32_t recv_off;       /* 0x30 */
  int32_t result;          /* 0 on closed; open -> callee AL (host-side) */
  int32_t host_call_count; /* gate open ? 1 : 0 */
  int32_t pure_complete;   /* gate closed ? 1 : 0 */
} IsaacAnm2EventTriggerCstrPlan; /* 8 x 4 = 32 bytes */

void isaac_anm2_event_trigger_cstr_plan(uint8_t* anm2,
                                        uint32_t name_addr,
                                        IsaacAnm2EventTriggerCstrPlan* out);

/* ============ v50: 0x0040b090 WasEventTriggered const-char twin ===========
   FUN_0040b090 (ret 4 @ 0x40b0ae; address-stable, no ZHL match). 116 direct
   .text e8 callers (rel32 census, section-table mapped). The FOURTH wrapper
   twin — WasEventTriggered in const-char form:
     - vs 0x0040b030 (band-b IsEventTriggered cstr): call target 0x0040ae70
       (ANM2's own SSO name->flag walk, the +0x1c twin), NOT 0x0040add0.
     - vs 0x0040b060 (band-c WasEventTriggered std::string): the arg is pushed
       RAW (`push dword [ebp+8]`) — NO SSO cap read at [name+0x14]. The whole
       difference is the arg handling, mirrored from the 0x40b000/0x40b030 pair.
   VA pin: 0x0040b060 + 0x30 == 0x0040b090 (was-triggered SSO -> cstr twin).

   PE 0x40b090..0x40b0ae (int3 pad 0x40b0b1..):
     push ebp; mov ebp,esp; push ecx
     cmp dword [ecx+0x34], 0 ; jne 0x40b0a1   FULL-dword gate, 0x100 IS set
     xor al,al                                closed -> return 0
     ret 4
     push dword [ebp+8]                       RAW const char* name
     add ecx, 0x30                            receiver = this+0x30
     call 0x40ae70                            HOST name->flag walk (BY
                                              REFERENCE, ANM2 band-D body)
     ret 4                                    return callee AL
   0 stores, 1 E8. open gate -> 1 host call; closed -> pure (result 0). */

enum {
  ISAAC_ANM2_WAS_EVENT_TRIGGERED_CSTR_VA = 0x0040b090u,
  ISAAC_ANM2_WAS_EVENT_TRIGGERED_CSTR_END_VA = 0x0040b0aeu, /* `ret 4` */
  ISAAC_ANM2_WAS_EVENT_TRIGGERED_CSTR_GATE_OFF = 0x34u,     /* FULL dword */
  ISAAC_ANM2_WAS_EVENT_TRIGGERED_CSTR_STATE_OFF = 0x30u,    /* recv offset */
  ISAAC_ANM2_WAS_EVENT_TRIGGERED_CSTR_CALL_VA = 0x0040ae70u, /* HOST walk */
  ISAAC_ANM2_WAS_EVENT_TRIGGERED_CSTR_CALLSITE_COUNT = 116, /* direct e8 callers */
};

typedef struct IsaacAnm2WasEventTriggeredCstrPlan {
  int32_t entered;         /* 1 when anm2 non-null */
  int32_t gate_34;         /* [this+0x34] != 0 (FULL-dword test) */
  uint32_t chars_addr;     /* RAW arg passthrough — the PE pushes [ebp+8]
                              verbatim; NO SSO decode (twin contrast) */
  uint32_t call_va;        /* 0x0040ae70 HOST name->flag walk */
  uint32_t recv_off;       /* 0x30 */
  int32_t result;          /* 0 on closed; open -> callee AL (host-side) */
  int32_t host_call_count; /* gate open ? 1 : 0 */
  int32_t pure_complete;   /* gate closed ? 1 : 0 */
} IsaacAnm2WasEventTriggeredCstrPlan; /* 8 x 4 = 32 bytes */

void isaac_anm2_was_event_triggered_cstr_plan(uint8_t* anm2,
                                              uint32_t name_addr,
                                              IsaacAnm2WasEventTriggeredCstrPlan* out);

/* ==================== v50: 0x0040bf30 ReplaceSpritesheet ==================
   __thiscall bool ANM2::ReplaceSpritesheet(int LayerId, std_string& Png)
   — EXACT ZHL match (10 pattern bytes, ANM2.zhl); ret 8 @ 0x40bfbd;
   80 direct .text e8 callers (rel32 census this unit; the Lua glue /
   register-held edges push the brief's "150"). Calls: 0x0040cae0 sized-eq
   (MODELED — the family bytes_equal law) + 0x0040ccd0 string assign (HOST —
   typed, 770 direct callers family-wide, NOT translated here).

   PE 0x40bf30..0x40bfbd (ret 8):
     test LayerId ; js false                   ; LayerId < 0 SIGNED
     cmp LayerId,[this+0x80] ; jge false       ; LayerId >= layerCount SIGNED
                                                ; (count read ONCE)
     base = [this+0x7c]                        ; read AFTER the gate; saved
     idx = LayerId*0xa0                        ; lea [eax+eax*4]; shl 5 — u32 wrap
     name = base + idx + 8                     ; layer element string object
     nameChars = cap[name+0x14] < 0x10 ? name : [name]   (jb STRICT)
     pngChars  = cap[png+0x14] < 0x10 ? png : [png]
     sizedEq = (png.size == name.size) && bytesEqual(pngChars, nameChars,
               png.size)                       ; 0x40cae0 family law; the PNG
                                                ; side is ecx/edx, the NAME side
                                                ; is pushed (order symmetric)
     if sizedEq -> return false                ; jne 0x40bfd6 (names equal)
     if name == png (string-object ADDRESS je) ; -> SELF arm (unreachable via
                                                ;   coherent memory: same object
                                                ;   implies the equality gate hit;
                                                ;   transcribed faithfully)
       SELF: byte [SAVED base + idx + 0x30] = 0 ; return true
     else:
       HOST __thiscall 0x0040ccd0(recv=name, chars=pngChars, size=png.size)
       byte [RE-READ [this+0x7c] + idx + 0x30] = 0 ; return true
        ^^^ THE POST-CALL RE-READ TRAP (0x40bfaa): the assign arm store uses
            the base re-read AFTER the host call; folding it to the saved
            base is the class-1 defect this unit pins via store_base_source
            + the apply's host_base_post argument.
   The store is ONE 8-bit zero on each success arm; upper-3-byte/mask laws
   do not apply (return is a full AL from mov al,1 / xor eax,eax). */

enum {
  ISAAC_ANM2_REPLACE_SPRITESHEET_VA = 0x0040bf30u, /* EXACT ZHL */
  ISAAC_ANM2_REPLACE_SPRITESHEET_END_VA = 0x0040bfbdu, /* `ret 8` */
  ISAAC_ANM2_REPLACE_SPRITESHEET_CALLSITE_COUNT = 80, /* direct e8 census */
  ISAAC_ANM2_REPLACE_SPRITESHEET_LAYER_COUNT_OFF = 0x80, /* [this+0x80] */
  ISAAC_ANM2_REPLACE_SPRITESHEET_LAYER_STATE_OFF = 0x7c, /* [this+0x7c] */
  ISAAC_ANM2_REPLACE_SPRITESHEET_LAYER_STRIDE = 0xa0,
  ISAAC_ANM2_REPLACE_SPRITESHEET_NAME_OFF = 0x08, /* string at layer+8 */
  ISAAC_ANM2_REPLACE_SPRITESHEET_SSO_CAP_OFF = 0x14,
  ISAAC_ANM2_REPLACE_SPRITESHEET_SSO_SIZE_OFF = 0x10,
  ISAAC_ANM2_REPLACE_SPRITESHEET_SSO_CAP = 0x10u, /* jb STRICT below */
  ISAAC_ANM2_REPLACE_SPRITESHEET_EQ_HELPER_VA = 0x0040cae0u, /* modeled */
  ISAAC_ANM2_REPLACE_SPRITESHEET_HOST_VA = 0x0040ccd0u, /* string assign */
  ISAAC_ANM2_REPLACE_SPRITESHEET_STORE_OFF = 0x30, /* +0x30 within element */
  ISAAC_ANM2_REPLACE_SPRITESHEET_STORE_VALUE = 0,
  ISAAC_ANM2_REPLACE_SPRITESHEET_BASE_SAVED = 0, /* self arm base source */
  ISAAC_ANM2_REPLACE_SPRITESHEET_BASE_RE_READ = 1, /* assign arm (P1 pin) */
};

typedef struct IsaacAnm2ReplaceSpritesheetPlan {
  int32_t entered;          /* 1 when anm2 && png non-null */
  uint32_t layer_id;        /* raw arg (SIGNED re-narrowed in the gate) */
  uint32_t png_addr;        /* raw arg */
  uint32_t layer_count_raw; /* [this+0x80], read at gate time only */
  int32_t in_bounds;        /* 0: js/jge exit -> result 0, no store */
  uint32_t base_raw;        /* [this+0x7c] read AFTER the gate (saved) */
  uint32_t idx_off;         /* layer_id * 0xa0 mod 2^32 (lea+shl) */
  uint32_t name_addr;       /* base + idx + 8 (layer name string object) */
  uint32_t name_cap;        /* [name+0x14] */
  uint32_t name_size;       /* [name+0x10] */
  uint32_t name_chars;      /* SSO-select chars address */
  int32_t name_heap;        /* 1 when cap >= 0x10 */
  uint32_t png_cap;         /* [png+0x14] */
  uint32_t png_size;        /* [png+0x10] (edx; also saved to [ebp+8]) */
  uint32_t png_chars;       /* SSO-select chars address */
  int32_t png_heap;         /* 1 when cap >= 0x10 */
  int32_t names_equal;      /* sized-eq 0x40cae0 -> 1 -> return false */
  int32_t self_alias;       /* name string object == png object (ADDRESS je) */
  int32_t assign_needed;    /* 1 when !names_equal && !self_alias */
  uint32_t host_va;         /* 0x0040ccd0 (typed host) */
  uint32_t host_chars;      /* pngChars (assign recv args) */
  uint32_t host_size;       /* png.size */
  uint32_t store_off;       /* idx_off + 0x30 */
  int32_t store_value;      /* 0 */
  int32_t store_base_source;/* BASE_SAVED (self) / BASE_RE_READ (assign) */
  uint32_t store_addr_saved;/* base_raw + store_off (self-arm address) */
  int32_t result;           /* 1 on both success arms; 0 on gate/equality */
  int32_t host_call_count;  /* assign_needed ? 1 : 0 */
  int32_t pure_complete;    /* 0 ONLY on the assign arm */
} IsaacAnm2ReplaceSpritesheetPlan; /* 29 x 4 = 116 bytes */

/* Law exports. All scalar params are uint32_t (no narrow ABI params). */
int32_t isaac_anm2_replace_spritesheet_bounds(uint32_t layer_id,
                                              uint32_t layer_count);
uint32_t isaac_anm2_replace_spritesheet_idx_off(uint32_t layer_id);
int32_t isaac_anm2_replace_spritesheet_store_base_source(uint32_t self_alias);
int32_t isaac_anm2_replace_spritesheet_plan(
    uint8_t* anm2,
    uint32_t layer_id,
    uint32_t png_addr,
    IsaacAnm2ReplaceSpritesheetPlan* out);
int32_t isaac_anm2_replace_spritesheet_apply(
    uint8_t* anm2,
    uint32_t layer_id,
    uint32_t png_addr,
    uint32_t host_base_post, /* [this+0x7c] re-read after the HOST assign */
    IsaacAnm2ReplaceSpritesheetPlan* out);

/* ============ v51: 0x40b1a0 / 0x40b1d0 / 0x40b200 wrapper trio ===========
   THREE thin __thiscall wrappers (ret 4, address-stable, no ZHL match)
   sitting between v35's 0x40b0c0..0x40b19f and v1's GetLayer(int)
   0x40b220. Direct rel32 e8 census (section-table mapped): 0x40b1a0 = 10,
   0x40b1d0 = 16, 0x40b200 = 124. The anm2-v36 NOTES recorded 0x40b1d0 /
   0x40b200 as "0x40add0-call duplicates" — FACTUALLY WRONG: the callees are
   ANM2's OWN landed kernels (0x40ace0 extras name->index, v33/v47; 0x40b220
   GetLayer(int), v1), and 0x40b200 has NO [this+0x34] gate at all. This
   unit lands the trio as by-reference wrapper plans (the v49/v50
   event-trigger-band pattern).

   0x40b1a0 (10 callers): gate `cmp dword [this+0x34],0` FULL-dword (0x100
     IS set) -> closed: return 0 (PURE); open: push [ebp+8] RAW, add
     this,0x30, call 0x40ac70 (anim-id lookup, v32 kernel BY REFERENCE).
     0 stores, 1 E8. host_call_count = open ? 1 : 0.
   0x40b1d0 (16 callers): SAME gate/receiver shape; callee 0x40ace0
     (extras name->index, v33/v47 kernel BY REFERENCE). Twin discipline:
     MUST NOT be unified with 0x40b1a0 (the callees differ).
   0x40b200 (124 callers): NO gate — push [ebp+8] RAW, call 0x40b220
     (GetLayer(int), v1 kernel BY REFERENCE) with ecx UNCHANGED
     (recv_off = 0). ALWAYS 1 host call, pure_complete 0 (contrast twin:
     never pure). 0 stores, 1 E8. */

enum {
  ISAAC_ANM2_ANIM_ID_WRAPPER_VA = 0x0040b1a0u,
  ISAAC_ANM2_ANIM_ID_WRAPPER_END_VA = 0x0040b1beu, /* open-arm `ret 4` */
  ISAAC_ANM2_ANIM_ID_WRAPPER_GATE_OFF = 0x34u,     /* FULL dword */
  ISAAC_ANM2_ANIM_ID_WRAPPER_STATE_OFF = 0x30u,    /* call receiver offset */
  ISAAC_ANM2_ANIM_ID_WRAPPER_CALL_VA = 0x0040ac70u, /* v32 kernel BY REF */
  ISAAC_ANM2_ANIM_ID_WRAPPER_CALLSITE_COUNT = 10,  /* direct e8 callers */
  ISAAC_ANM2_EXTRAS_NAME_WRAPPER_VA = 0x0040b1d0u,
  ISAAC_ANM2_EXTRAS_NAME_WRAPPER_END_VA = 0x0040b1eeu, /* open-arm ret 4 */
  ISAAC_ANM2_EXTRAS_NAME_WRAPPER_GATE_OFF = 0x34u,     /* FULL dword */
  ISAAC_ANM2_EXTRAS_NAME_WRAPPER_STATE_OFF = 0x30u,    /* call receiver off */
  ISAAC_ANM2_EXTRAS_NAME_WRAPPER_CALL_VA = 0x0040ace0u, /* v33/v47 kernel */
  ISAAC_ANM2_EXTRAS_NAME_WRAPPER_CALLSITE_COUNT = 16,  /* direct e8 callers */
  ISAAC_ANM2_GET_LAYER_WRAPPER_VA = 0x0040b200u,
  ISAAC_ANM2_GET_LAYER_WRAPPER_END_VA = 0x0040b20eu,   /* `ret 4` */
  ISAAC_ANM2_GET_LAYER_WRAPPER_GATE_OFF = 0x34u,  /* NOT READ — no gate (the
                                                     contrast pin: gate_34
                                                     stays 0 even when the
                                                     memory is nonzero) */
  ISAAC_ANM2_GET_LAYER_WRAPPER_STATE_OFF = 0x00u, /* ecx unchanged (recv 0) */
  ISAAC_ANM2_GET_LAYER_WRAPPER_CALL_VA = 0x0040b220u, /* v1 GetLayer(int) */
  ISAAC_ANM2_GET_LAYER_WRAPPER_CALLSITE_COUNT = 124,  /* direct e8 callers */
};

typedef struct IsaacAnm2AnimIdWrapperPlan {
  int32_t entered;         /* 1 when anm2 non-null */
  int32_t gate_34;         /* [this+0x34] != 0 (FULL-dword test) */
  uint32_t arg_addr;       /* RAW arg passthrough — the PE pushes [ebp+8]
                              verbatim; NO SSO decode (wrapper twin shape) */
  uint32_t call_va;        /* 0x0040ac70 HOST anim-id lookup (v32 kernel) */
  uint32_t recv_off;       /* 0x30 */
  int32_t result;          /* 0 on closed; open -> callee AL (host-side) */
  int32_t host_call_count; /* gate open ? 1 : 0 */
  int32_t pure_complete;   /* gate closed ? 1 : 0 */
} IsaacAnm2AnimIdWrapperPlan; /* 8 x 4 = 32 bytes */

typedef struct IsaacAnm2ExtrasNameWrapperPlan {
  int32_t entered;         /* 1 when anm2 non-null */
  int32_t gate_34;         /* [this+0x34] != 0 (FULL-dword test) */
  uint32_t arg_addr;       /* RAW arg passthrough (no SSO decode) */
  uint32_t call_va;        /* 0x0040ace0 HOST extras name->index (v33/v47) */
  uint32_t recv_off;       /* 0x30 */
  int32_t result;          /* 0 on closed; open -> callee AL (host-side) */
  int32_t host_call_count; /* gate open ? 1 : 0 */
  int32_t pure_complete;   /* gate closed ? 1 : 0 */
} IsaacAnm2ExtrasNameWrapperPlan; /* 8 x 4 = 32 bytes */

typedef struct IsaacAnm2GetLayerWrapperPlan {
  int32_t entered;         /* 1 when anm2 non-null */
  int32_t gate_34;         /* PINNED 0 — the PE has NO [this+0x34] gate here
                              (contrast vs the two gated twins) */
  uint32_t arg_addr;       /* RAW arg passthrough (layer index) */
  uint32_t call_va;        /* 0x0040b220 HOST GetLayer(int) (v1 kernel) */
  uint32_t recv_off;       /* 0x00 — ecx UNCHANGED (this itself) */
  int32_t result;          /* 0 in the pure plan; callee AL (host-side) */
  int32_t host_call_count; /* ALWAYS 1 (no closed arm exists) */
  int32_t pure_complete;   /* ALWAYS 0 (contrast twin — never pure) */
} IsaacAnm2GetLayerWrapperPlan; /* 8 x 4 = 32 bytes */

void isaac_anm2_anim_id_wrapper_plan(uint8_t* anm2,
                                     uint32_t arg_addr,
                                     IsaacAnm2AnimIdWrapperPlan* out);
void isaac_anm2_extras_name_wrapper_plan(uint8_t* anm2,
                                         uint32_t arg_addr,
                                         IsaacAnm2ExtrasNameWrapperPlan* out);
void isaac_anm2_get_layer_wrapper_plan(uint8_t* anm2,
                                       uint32_t arg_addr,
                                       IsaacAnm2GetLayerWrapperPlan* out);

/* ==================== v51: 0x0040cdc0 / 0x0040cdd0 dword-pointer min
   + 0x0040c7c0 SSO sized-INEQ ==========================================

   Three PURE bodies found OPEN by the update-v96 gap scan (wave 20) in the
   family band 0x407f10..0x40e2b0; v48's "float min + SSO sized-eq" landing
   already closed this band's other pure finds. None match a ZHL signature;
   all address-stable. Caller counts re-verified by an independent linear
   rel32 census (section-table mapped) plus per-site capstone decode.

   0x0040cdc0 (10 bytes, `ret` @ 0x0040cdc9, 5 direct E8 callers: 0x5b640d,
   0x5b72b0, 0x65f164, 0x65f870, 0x660dec):
       mov eax,[ecx] ; cmp eax,[edx] ; cmovb ecx,edx ; mov eax,ecx ; ret
   UNSIGNED dword min: returns the ADDRESS of the smaller dword; ties keep
   the FIRST pointer (ecx). cmovb = CF: b wins ONLY when a < b. The uint
   twin of the v48 float-pointer min 0x0040c780 (comiss/cmova) — but integer
   cmp is TOTAL, so there is no unordered case and the plan drops the
   unordered field. 0 E8 / 0 stores. PURE.

   0x0040cdd0 (10 bytes, `ret` @ 0x0040cdd9, 3 direct E8 callers: 0x5c181c,
   0x5cf28c, 0x661b00):
       mov eax,[edx] ; cmp eax,[ecx] ; cmovb ecx,edx ; mov eax,ecx ; ret
   The ALTERNATE twin: the SAME min law with the operand loads swapped
   (a from edx, b from ecx; cmovb still takes b on a < b, ties keep ecx).
   Separate body, separate VA/caller pins — MUST NOT be unified (twin
   discipline, cf. the v50 anim-id/extras wrapper trio).

   0x0040c7c0 (39 bytes, `ret` @ 0x0040c7e6, 1 direct E8 caller: 0x6c5698):
   std::string sized-INEQ wrapper. Byte-identical to the v48-landed
   0x0040c790 sized-EQ wrapper EXCEPT the `xor al,1` that inverts the
   verdict (the call rel32 also differs — the site is 0x30 bytes closer —
   but resolves to the SAME helper 0x0040cae0). SSO-select both strings
   (cmp [str+0x14],0x10 ; jb — UNSIGNED strict below; cap >= 0x10 reads the
   heap pointer at [str]), call 0x0040cae0 (sizes EQUAL AND bytes equal over
   a_size -> AL 1/0), invert: result 1 iff the strings DIFFER (size mismatch
   OR byte mismatch); equal pairs incl. empty==empty -> 0. Pure; 0x0040cae0
   is modeled, so helper_va is published and pure_complete stays 1.
   The DISCRIMINATOR from 0x40c790: on the SAME mismatching pair the EQ
   wrapper returns 0 while this law returns 1. */

enum {
  ISAAC_ANM2_DWORD_MIN_VA = 0x0040cdc0u,        /* no ZHL; address-stable */
  ISAAC_ANM2_DWORD_MIN_END_VA = 0x0040cdc9u,    /* `ret` */
  ISAAC_ANM2_DWORD_MIN_CALLSITE_COUNT = 5,      /* .text e8 only */
  ISAAC_ANM2_DWORD_MIN_ALT_VA = 0x0040cdd0u,    /* no ZHL; address-stable */
  ISAAC_ANM2_DWORD_MIN_ALT_END_VA = 0x0040cdd9u,/* `ret` */
  ISAAC_ANM2_DWORD_MIN_ALT_CALLSITE_COUNT = 3,  /* .text e8 only */
  ISAAC_ANM2_SSO_SIZED_INEQ_VA = 0x0040c7c0u,   /* no ZHL; address-stable */
  ISAAC_ANM2_SSO_SIZED_INEQ_END_VA = 0x0040c7e6u, /* `ret` */
  ISAAC_ANM2_SSO_SIZED_INEQ_CALLSITE_COUNT = 1, /* .text e8 only */
  ISAAC_ANM2_SSO_SIZED_INEQ_HELPER_VA = 0x0040cae0u, /* sized-eq (v38) */
  ISAAC_ANM2_SSO_SIZED_INEQ_SSO_CAP = 0x10u,
};

typedef struct IsaacAnm2DwordMinPlan {
  int32_t entered;         /* 1 when both addrs non-null */
  uint32_t a_addr;
  uint32_t b_addr;
  uint32_t a_bits;         /* load_guest_u32(a_addr) */
  uint32_t b_bits;         /* load_guest_u32(b_addr) */
  int32_t takes_b;         /* unsigned a > b (cmovb taken) */
  uint32_t result_addr;    /* takes_b ? b_addr : a_addr */
  int32_t pure_complete;   /* 1 */
} IsaacAnm2DwordMinPlan; /* 8 x 4 = 32 bytes */

typedef struct IsaacAnm2DwordMinAltPlan {
  int32_t entered;         /* 1 when both addrs non-null */
  uint32_t a_addr;
  uint32_t b_addr;
  uint32_t a_bits;         /* load_guest_u32(a_addr) — PE loads [edx] first */
  uint32_t b_bits;         /* load_guest_u32(b_addr) */
  int32_t takes_b;         /* unsigned a > b (cmovb taken) */
  uint32_t result_addr;    /* takes_b ? b_addr : a_addr */
  int32_t pure_complete;   /* 1 */
} IsaacAnm2DwordMinAltPlan; /* 8 x 4 = 32 bytes */

typedef struct IsaacAnm2SsoSizedIneqPlan {
  int32_t entered;         /* 1 when both addrs non-null */
  uint32_t a_addr;
  uint32_t b_addr;
  uint32_t a_cap;          /* [a+0x14] */
  uint32_t a_size;         /* [a+0x10] */
  int32_t a_heap;          /* cap >= 0x10 */
  uint32_t a_chars;        /* SSO select: a_addr or *a */
  uint32_t b_cap;
  uint32_t b_size;
  int32_t b_heap;
  uint32_t b_chars;
  int32_t result;          /* AL: NOT (sizes equal AND bytes equal) — xor al,1 */
  uint32_t helper_va;      /* 0x0040cae0 */
  int32_t pure_complete;   /* 1 */
} IsaacAnm2SsoSizedIneqPlan; /* 14 x 4 = 56 bytes */

uint32_t isaac_anm2_dword_min_plan(uint32_t a_addr,
                                   uint32_t b_addr,
                                   IsaacAnm2DwordMinPlan* out);
uint32_t isaac_anm2_dword_min_alt_plan(uint32_t a_addr,
                                       uint32_t b_addr,
                                       IsaacAnm2DwordMinAltPlan* out);
int32_t isaac_anm2_sso_sized_ineq_plan(uint32_t a_addr,
                                       uint32_t b_addr,
                                       IsaacAnm2SsoSizedIneqPlan* out);

uint32_t isaac_anm2_pure_helpers_abi_version(void);

#ifdef __cplusplus
}
#endif
/* Appended past the header's own extern "C" close; re-open linkage. */
#ifdef __cplusplus
extern "C" {
#endif

/* ============ v85 unit: XML entity-decode trio (0x00416920 / 0x00416b70 /
   0x00416e80) + UTF-8 leaf 0x00416dc0 =====================================
   TEMPLATE LAW. The three bodies are byte-identical instantiations of one
   MSVC-generated XML text decoder; they differ ONLY in three class-table
   constants (verified: identical instruction streams, identical dispatch
   lookup bytes at 0x416b14/0x416d64/0x417074, jump tables relocating the
   same six cases). One proven template + per-index pins cover all sites:

     site 0  0x00416920  skip tbl 0xb1a960  cls tbl 0xb1ac60
             terminator ' (0x27) -- single-quoted attribute value
             caller: attrs parser 0x004165a0 @ 0x0041671e
     site 1  0x00416b70  skip tbl 0xb1a860  cls tbl 0xb1ab60
             terminator " (0x22) -- double-quoted attribute value
             caller: attrs parser 0x004165a0 @ 0x004166de
     site 2  0x00416e80  skip tbl 0xb1a760  cls tbl 0xb1aa60
             terminator < (0x3c) -- element text content
             caller: children parser 0x00416770 @ 0x004167fd

   Shared data: hex-digit table 0xb1ad60 ('0'-'9'->0-9, 'A'-'F'/'a'-'f'
   ->10-15, else 0xff); error slot BSS 0xc7de4c; error strings
   0xb1b6f8 "expected ;" and 0xb1b704 "invalid numeric character entity".

   Machine shape (thiscall ecx=cursor-slot ptr, ret 0, eax=out end):
     1. esi=[ecx]; while skip_table[*esi]: esi++        (skip loop)
     2. [ecx]=esi; out=ebp4=esi                          (IN-PLACE decode)
     3. loop while class_table[*esi]:
          plain char -> *out++=*esi; esi++
          '&' -> d=(int8)[esi+1]; idx=d-0x23; idx >u 0x4e -> default copy
            '#' -> hex ([esi+2]=='x') or decimal digit walk via hex table
                  (first invalid digit encodes cp=0), call 0x416dc0 UTF-8
                  encode into out cursor, then require ';' else error slot
                  := 0xb1b6f8
            'a' -> "&amp;" emit '&' (+5) | "&apos;" emit '\'' (+6)
            'g' -> "&gt;"  emit '>'  (+4)      'l' -> "&lt;" emit '<' (+4)
            'q' -> "&quot;" emit '"' (+6)      else -> default copy '&'
     4. [ecx]=esi; return eax=out

   Numeric accumulation is u32-wrapping: hex acc=(acc<<4)+v,
   decimal acc=(acc+acc*4)*2+v. Codepoints >= 0x110000 make the callee
   store 0xb1b704 to the error slot and leave the out cursor unchanged.

   Report-only plans: guest stores are REPORTED, never performed. The two
   exports are ONE translated island set -- 0x00416dc0 is landed by this
   same unit, so decode reports host_call_count = 0 and counts internal
   utf8 invocations in utf8_calls. Dispatch lookup/jump tables are NOT
   dereferenced (control flow is expressed directly); their identity is
   pinned byte-exact in the v85 constants test instead. */

enum {
  ISAAC_ANM2_XML_UTF8_VA = 0x00416dc0u,
  ISAAC_ANM2_XML_UTF8_END_VA = 0x00416e69u,
  ISAAC_ANM2_XML_UTF8_BODY_BYTES = 0xa9u,       /* 169 B */
  ISAAC_ANM2_XML_UTF8_CALLSITE_COUNT = 3,
  ISAAC_ANM2_XML_UTF8_ADDR_TAKEN = 0,
  ISAAC_ANM2_XML_UTF8_ERR_SLOT_VA = 0xc7de4cu,
  ISAAC_ANM2_XML_UTF8_INVALID_CP_VA = 0xb1b704u
};

typedef struct IsaacAnm2XmlUtf8Plan {
  int32_t entered;           /* 1 iff cursor_slot != 0 */
  uint32_t cursor_slot_addr;
  uint32_t out_start;        /* [slot] on entry */
  uint32_t code_point;       /* edx */
  uint32_t length;           /* 1..4 encoded bytes; 0 on error arm */
  uint32_t b0;               /* byte at out_start+0 */
  uint32_t b1;               /* byte at out_start+1 */
  uint32_t b2;               /* byte at out_start+2 */
  uint32_t b3;               /* byte at out_start+3 */
  uint32_t new_cursor;       /* out_start+length; unchanged on error arm */
  int32_t error_written;     /* cp >= 0x110000 */
  uint32_t error_string_va;  /* 0xb1b704 iff error_written */
  int32_t pure_complete;     /* 1 */
  int32_t host_call_count;   /* 0 */
} IsaacAnm2XmlUtf8Plan; /* 14 x 4 = 56 bytes */

void isaac_anm2_xml_utf8_encode_plan(uint8_t* cursor_slot,
                                     uint32_t code_point,
                                     IsaacAnm2XmlUtf8Plan* out);

enum {
  ISAAC_ANM2_XML_DECODE_SITES = 3,
  ISAAC_ANM2_XML_DECODE_TEXT_VA_0 = 0x00416920u,
  ISAAC_ANM2_XML_DECODE_TEXT_END_VA_0 = 0x00416afbu,
  ISAAC_ANM2_XML_DECODE_SKIP_TABLE_VA_0 = 0xb1a960u,
  ISAAC_ANM2_XML_DECODE_CLASS_TABLE_VA_0 = 0xb1ac60u,
  ISAAC_ANM2_XML_DECODE_TERM_CHAR_0 = 0x27u,
  ISAAC_ANM2_XML_DECODE_CALLSITE_VA_0 = 0x0041671eu,
  ISAAC_ANM2_XML_DECODE_TEXT_VA_1 = 0x00416b70u,
  ISAAC_ANM2_XML_DECODE_TEXT_END_VA_1 = 0x00416d4cu,
  ISAAC_ANM2_XML_DECODE_SKIP_TABLE_VA_1 = 0xb1a860u,
  ISAAC_ANM2_XML_DECODE_CLASS_TABLE_VA_1 = 0xb1ab60u,
  ISAAC_ANM2_XML_DECODE_TERM_CHAR_1 = 0x22u,
  ISAAC_ANM2_XML_DECODE_CALLSITE_VA_1 = 0x004166deu,
  ISAAC_ANM2_XML_DECODE_TEXT_VA_2 = 0x00416e80u,
  ISAAC_ANM2_XML_DECODE_TEXT_END_VA_2 = 0x0041705cu,
  ISAAC_ANM2_XML_DECODE_SKIP_TABLE_VA_2 = 0xb1a760u,
  ISAAC_ANM2_XML_DECODE_CLASS_TABLE_VA_2 = 0xb1aa60u,
  ISAAC_ANM2_XML_DECODE_TERM_CHAR_2 = 0x3cu,
  ISAAC_ANM2_XML_DECODE_CALLSITE_VA_2 = 0x004167fdu,
  ISAAC_ANM2_XML_DECODE_HEX_TABLE_VA = 0xb1ad60u,
  ISAAC_ANM2_XML_DECODE_LOOKUP_VA_0 = 0x00416b14u,
  ISAAC_ANM2_XML_DECODE_LOOKUP_VA_1 = 0x00416d64u,
  ISAAC_ANM2_XML_DECODE_LOOKUP_VA_2 = 0x00417074u,
  ISAAC_ANM2_XML_DECODE_JUMPTAB_VA_0 = 0x00416afcu,
  ISAAC_ANM2_XML_DECODE_JUMPTAB_VA_1 = 0x00416d4cu,
  ISAAC_ANM2_XML_DECODE_JUMPTAB_VA_2 = 0x0041705cu,
  ISAAC_ANM2_XML_DECODE_ERROR_SLOT_VA = 0xc7de4cu,
  ISAAC_ANM2_XML_DECODE_EXPECTED_SEMI_VA = 0xb1b6f8u,
  ISAAC_ANM2_XML_DECODE_DISPATCH_BASE = -0x23,
  ISAAC_ANM2_XML_DECODE_DISPATCH_BOUND = 0x4eu,
  ISAAC_ANM2_XML_DECODE_UTF8_CALLEE_VA = 0x00416dc0u
};

typedef struct IsaacAnm2XmlDecodeTextPlan {
  int32_t entered;             /* 1 iff cursor_slot != 0 */
  uint32_t cursor_slot_addr;
  uint32_t scan_in;            /* [slot] on entry */
  uint32_t scan_after_skip;    /* after the leading-skip loop */
  uint32_t skipped_count;      /* skip-loop iterations */
  uint32_t scan_out;           /* final [ecx] value (reported) */
  uint32_t decoded_end;        /* return eax: out pointer after decode */
  uint32_t out_bytes;          /* total bytes emitted to the output */
  uint32_t verbatim_copies;    /* plain chars + fallback '&' copies */
  uint32_t named_entities;     /* matched &amp;/&apos;/&quot;/&gt;/&lt; */
  uint32_t numeric_entities;   /* &#...; walks entered */
  uint32_t utf8_calls;         /* inline 0x00416dc0 invocations */
  uint32_t semi_errors;        /* missing ';' after numeric entity */
  uint32_t invalid_cp_errors;  /* codepoint >= 0x110000 */
  uint32_t last_error_string_va; /* 0xb1b6f8 / 0xb1b704 / 0 */
  int32_t pure_complete;       /* 1 -- both island members translated */
  int32_t host_call_count;     /* 0 */
} IsaacAnm2XmlDecodeTextPlan; /* 17 x 4 = 68 bytes */

void isaac_anm2_xml_decode_text_plan(uint8_t* cursor_slot,
                                     uint32_t skip_table,
                                     uint32_t class_table,
                                     uint32_t hex_table,
                                     IsaacAnm2XmlDecodeTextPlan* out);


/* ============ v86 unit: 0x00416510 XML arena allocator SPLIT law ========
   thiscall ecx=arena {begin@0x0, end@0x4, cap@0x8, custom-alloc fn
   @0x1000c}; stack arg [ebp+8]=needed; ret 4; eax = data pointer.
   Byte-exact shape:
     FAST ARM (pure-complete):
       0x41651a pad      = (-end) & 3                (neg/and)
       0x416522 aligned  = end + pad
       0x416525 required = aligned + needed
       0x416528 GROW iff required >u cap             (jbe skips grow)
       0x41658f [arena+4] := required ; eax := aligned
     GROW ARM (host: one alloc call, result unresolved):
       0x41652d blocks   = max(needed, 0x10000)      (cmp/cmovbe)
       0x416540 size     = blocks + 0xa              (header slack)
       0x41653a fn = [arena+0x1000c]; fn ? fn(size)
                     : (malloc(size) @0xa0f4e0, and the BSS message slot
                        [0xc7de4c] is rewritten: "out of memory"
                        0xb1b6b4 iff malloc==0, else the OLD slot value)
       block chain: [[arena]] linked at align4(raw); [arena]:=raw;
       cap := raw+size; new data cursor = align4(raw)+4.
   Report-only plan: the fast arm is pure_complete; the grow arm reports
   the alloc shape (blocks/size/custom-vs-CRT/oom string) and leaves the
   allocation result to the host. 16 direct rel32 callers: 0x416068,
   0x4162a5, 0x416603, 0x41680d (this XML band) + 0x83563a, 0x83576c,
   0x83641e, 0x836478, 0x8f9304, 0x8f939c, 0x8f9439, 0x8f94d7, 0x8f9581,
   0x8f9621, 0x8f96f8, 0x8f974d. */

enum {
  ISAAC_ANM2_XML_ALLOC_VA = 0x00416510u,
  ISAAC_ANM2_XML_ALLOC_END_VA = 0x0041659au,
  ISAAC_ANM2_XML_ALLOC_BODY_BYTES = 0x8du,      /* 141 B */
  ISAAC_ANM2_XML_ALLOC_CALLSITE_COUNT = 16,
  ISAAC_ANM2_XML_ALLOC_ADDR_TAKEN = 0,
  ISAAC_ANM2_XML_ALLOC_ALIGN_MASK = 3u,
  ISAAC_ANM2_XML_ALLOC_GROW_FLOOR = 0x10000u,
  ISAAC_ANM2_XML_ALLOC_HDR_SLACK = 0xau,
  ISAAC_ANM2_XML_ALLOC_CUSTOM_FN_OFF = 0x1000cu,
  ISAAC_ANM2_XML_ALLOC_OOM_STRING_VA = 0xb1b6b4u,
  ISAAC_ANM2_XML_ALLOC_ERROR_SLOT_VA = 0xc7de4cu,
  ISAAC_ANM2_XML_ALLOC_CRT_MALLOC_VA = 0xa0f4e0u
};

typedef struct IsaacAnm2XmlAllocPlan {
  int32_t entered;        /* 1 iff arena != 0 */
  uint32_t arena_addr;
  uint32_t needed;        /* arg */
  uint32_t cur_end;       /* [arena+4] */
  uint32_t align_pad;     /* (-end) & 3 */
  uint32_t aligned_end;   /* end + pad */
  uint32_t req_end;       /* aligned + needed */
  uint32_t cap;           /* [arena+8] */
  int32_t grow;           /* 1 iff req_end >u cap */
  uint32_t grow_blocks;   /* max(needed, 0x10000); grow arm only */
  uint32_t alloc_size;    /* grow_blocks + 0xa; grow arm only */
  uint32_t custom_fn;     /* [arena+0x1000c]; grow arm only */
  int32_t use_custom;     /* custom_fn != 0 */
  uint32_t oom_string_va; /* 0xb1b6b4 on the CRT arm (stored iff fails) */
  int32_t pure_complete;  /* 1 fast arm / 0 grow arm */
  int32_t host_call_count;/* 0 fast / 1 grow */
  uint32_t new_end;       /* fast: required; grow: 0 (host-decided) */
  uint32_t ret_ptr;       /* fast: aligned_end; grow: 0 */
} IsaacAnm2XmlAllocPlan; /* 18 x 4 = 72 bytes */


/* ============ v87 unit: 0x004165a0 attrs-parser narrow pass =============
   thiscall ecx=doc {attrs arena @+0x30}; stack [ebp+8]=cursor-slot,
   [ebp+0xc]=parent node; ret 8. One ATTRIBUTE ITERATION, report-only:

     gate 0xb1af60 [*cur] else return          (0x004165ab..b5)
     save old err slot edx                     (0x004165bb)
     arena = [doc+0x30]                        (0x004165c2)
     name: starts AT cur; skip 0xb1af60 from cur+1 (0x004165c8..ee)
           len = nameEnd - scanIn; empty-name arm stores 0xb1b6c4
           (unreachable: cur+1 > cur always)    (0x004165f2..fc)
     HOST: node = alloc(arena, 0x1c)           (0x004165fc..08)
     node fields (REPORTED): +0 name ptr = scanIn, +8 name len,
        +4/+0x10 zeroed then set below         (0x0041660a..66)
     link into parent {first@0x20, last@0x24}  (0x00416627..4e):
        prev = parent.last ; last.next@+0x18 = node (iff first!=0)
        else prev=0, parent.first = node ; parent.last = node ;
        node.parent(+0x10) = parent ; node.next(+0x18) = 0
     skip 0xb1b060 (spaces/=) ; require '=' else slot := 0xb1b6dc
                                               (0x00416655..82)
     cur++ past '='                            (0x00416687)
     NUL-terminate name at nameStart+nameLen (empty-string guard
        0xc71640)                              (0x0041668c..9e)
     skip 0xb1b060 ; q = *cur                  (0x004166a2..c5)
     q==' -> site0 0x00416920 ; q==" or UNQUOTED -> site1 0x00416b70;
     unquoted ALSO drops the first char (esi=cur+1) and pre-loads
     slot 0xb1b6e8                             (0x004166c5..23)
     value: +4 = start, +0xc = decode_end - start (0x004166e3..f0)
     closing quote cl=q: match -> consume ++ and slot keeps old value,
        else slot := 0xb1b6e8                  (0x004166f3..704)
     NUL-terminate value                       (0x0041670a..2c)
     skip 0xb1b060 ; loop while gate 0xb1af60  (0x00416730..5d)

   Both decode callees are translated (v85); the ONLY remaining host
   edge is the allocator, so host_call_count = 1 and pure_complete = 0.
   Node address is host-decided (reported 0). */

enum {
  ISAAC_ANM2_XML_ATTR_VA = 0x004165a0u,
  ISAAC_ANM2_XML_ATTR_END_VA = 0x004165a9u + 0x1c0u, /* ret @0x00416769 */
  ISAAC_ANM2_XML_ATTR_BODY_BYTES = 0x1cau,
  ISAAC_ANM2_XML_ATTR_CALLSITE_COUNT = 1,       /* children parser */
  ISAAC_ANM2_XML_ATTR_ADDR_TAKEN = 0,
  ISAAC_ANM2_XML_ATTR_NAME_GATE_VA = 0xb1af60u,
  ISAAC_ANM2_XML_ATTR_SPACE_GATE_VA = 0xb1b060u,
  ISAAC_ANM2_XML_ATTR_ARENA_OFF = 0x30u,
  ISAAC_ANM2_XML_ATTR_NODE_SIZE = 0x1cu,
  ISAAC_ANM2_XML_ATTR_PARENT_FIRST_OFF = 0x20u,
  ISAAC_ANM2_XML_ATTR_PARENT_LAST_OFF = 0x24u,
  ISAAC_ANM2_XML_ATTR_EMPTY_STR_VA = 0xc71640u,
  ISAAC_ANM2_XML_ATTR_NO_NAME_VA = 0xb1b6c4u,
  ISAAC_ANM2_XML_ATTR_EXPECTED_EQ_VA = 0xb1b6dcu,
  ISAAC_ANM2_XML_ATTR_BAD_VALUE_VA = 0xb1b6e8u,
  ISAAC_ANM2_XML_ATTR_ALLOC_CALLEE_VA = 0x00416510u,
  ISAAC_ANM2_XML_ATTR_DECODE0_CALLEE_VA = 0x00416920u,
  ISAAC_ANM2_XML_ATTR_DECODE1_CALLEE_VA = 0x00416b70u
};

typedef struct IsaacAnm2XmlAttrPlan {
  int32_t entered;            /* gate passed */
  uint32_t doc_addr;
  uint32_t cursor_slot_addr;
  uint32_t parent_node_addr;
  uint32_t scan_in;           /* *slot on entry == name start */
  uint32_t name_end;          /* after 0xb1af60 skip */
  uint32_t name_len;          /* name_end - scan_in */
  uint32_t node_addr;         /* 0: host-decided by allocator */
  uint32_t name_term_addr;    /* nameStart + nameLen */
  uint32_t parent_first;      /* [pn+0x20] on entry */
  uint32_t parent_last_old;   /* [pn+0x24] on entry */
  uint32_t link_prev_value;   /* node.prev = parent_last_old | 0 */
  uint32_t link_next_addr;    /* &last->next when first!=0, else 0 */
  int32_t saw_equals;
  uint32_t missing_eq_va;     /* 0xb1b6dc iff no '=' */
  uint32_t quote_char;        /* raw byte at value-position */
  int32_t decode_site;        /* 0 ' / 1 "-or-unquoted / -1 n/a */
  uint32_t value_start;       /* reported start fed to the decoder */
  uint32_t value_len;         /* decode_end - value_start */
  uint32_t value_term_addr;   /* value_start + value_len */
  int32_t closing_quote_matched;
  uint32_t bad_value_va;      /* 0xb1b6e8 iff closing quote unmatched */
  int32_t loop_again;         /* gate 0xb1af60 passes after the attr */
  int32_t pure_complete;      /* 0 -- allocator edge remains */
  int32_t host_call_count;    /* 1 (allocator) */
} IsaacAnm2XmlAttrPlan; /* 25 x 4 = 100 bytes */

void isaac_anm2_xml_attr_plan(uint8_t* doc,
                              uint32_t cursor_slot_addr,
                              uint32_t parent_node_addr,
                              uint32_t name_gate_table,
                              uint32_t space_gate_table,
                              IsaacAnm2XmlAttrPlan* out);

/* ============ v88 unit: 0x417000+ accessor bulk band ====================
   TEMPLATE LAWS over the ANM2 per-property accessor instantiations.
   Byte-exact census of band 0x417000..0x41a000 (pattern scan):

   T1 u32 scalar get   `8B 41 d8 C3` / `8B 81 d32 C3`
      (mov eax,[ecx+d]; ret) -- 8 sites
   T2 f32 get          `D9 81 d32 C3`  (fld dword [ecx+d]; ret) -- 4 sites
   T3 pair copy-out    55 8B EC 8B 45 08 8B 91 d1 8B 89 d2 89 10 89 48 04
      5D C2 04 00 -- 3 sites

   All three templates are fully pure loads / copy-outs. The pair getter
   WRITES 8 bytes into the caller's buffer: report-only plan reports
   lo/hi instead of storing. */

typedef struct IsaacAnm2AccU32Site {
  uint32_t va;
  uint32_t offset;
} IsaacAnm2AccU32Site; /* 2 x 4 = 8 bytes */

typedef struct IsaacAnm2AccF32Site {
  uint32_t va;
  uint32_t offset;
} IsaacAnm2AccF32Site;

typedef struct IsaacAnm2AccPairSite {
  uint32_t va;
  uint32_t offset0;
  uint32_t offset1;
} IsaacAnm2AccPairSite; /* 3 x 4 = 12 bytes */

enum {
  ISAAC_ANM2_ACC_U32_GET_COUNT = 8,
  ISAAC_ANM2_ACC_F32_GET_COUNT = 4,
  ISAAC_ANM2_ACC_PAIR_GET_COUNT = 3
};

/* Pinned site tables (byte-exact PE enumeration). */
static const IsaacAnm2AccU32Site ISAAC_ANM2_ACC_U32_SITES[ISAAC_ANM2_ACC_U32_GET_COUNT] = {
  { 0x00417260u, 0x28u   },
  { 0x00417270u, 0x2cu   },
  { 0x00417280u, 0x30u   },
  { 0x00417710u, 0xcu    },
  { 0x00417380u, 0x188u  },
  { 0x00417490u, 0x330u  },
  { 0x004174a0u, 0x3c8u  },
  { 0x00417860u, 0x1e68u }
};

static const IsaacAnm2AccF32Site ISAAC_ANM2_ACC_F32_SITES[ISAAC_ANM2_ACC_F32_GET_COUNT] = {
  { 0x00417210u, 0xa4u  },
  { 0x00417330u, 0xecu  },
  { 0x00417360u, 0x384u },
  { 0x00417370u, 0x380u }
};

static const IsaacAnm2AccPairSite ISAAC_ANM2_ACC_PAIR_SITES[ISAAC_ANM2_ACC_PAIR_GET_COUNT] = {
  { 0x00417290u, 0x33cu, 0x340u },
  { 0x004172b0u, 0x38cu, 0x390u },
  { 0x004172d0u, 0x360u, 0x364u }
};

typedef struct IsaacAnm2AccPairGetPlan {
  int32_t entered;        /* 1 iff th != 0 */
  uint32_t this_addr;
  uint32_t off;
  uint32_t lo;            /* [th+off] reported */
  uint32_t hi;            /* [th+off+4] reported */
  int32_t pure_complete;  /* 1 */
  int32_t host_call_count;/* 0 */
} IsaacAnm2AccPairGetPlan; /* 7 x 4 = 28 bytes */

uint32_t isaac_anm2_u32_field_get(uint8_t* th, uint32_t off);
uint32_t isaac_anm2_f32_field_get_bits(uint8_t* th, uint32_t off);
void isaac_anm2_pair_field_get_plan(uint8_t* th, uint32_t off,
                                    IsaacAnm2AccPairGetPlan* out);


#ifdef __cplusplus
}  // extern "C"
#endif
