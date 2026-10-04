#pragma once

#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

/* Pure subsets recovered from Game::Exit (VA 0x006fa0c0 / RVA 0x2fa0c0).
   Freestanding translations of complete pure field teardown islands and
   pure predicates only. Platform/IO/Steam/audio/host callees stay residual.
   Not an Exit slice ABI and not wired into the Update frame path.

   Evidence:
     tools/isaac-ng.unpacked.exe SHA-256 5129DF72…
     output/decomp/5129df723e64/decompiled/006fa0c0_Game_Exit.c (truncated:
       false noreturn on logger 0x00a112c0 — post-log PE body continues)
     PE map of Exit + nested pure 0x006f43b0 / 0x006f4520
     PE map of terminal residual 0x009b5cb0 (thiscall Game+0x23a74)

   ABI v2 adds PE-ordered early teardown islands, vector dtor pure CF, SFX
   stop-id table, PGD.readonly clear, post-log pure pack (decompiler-missed),
   item-overlay state clear, session terminal clear, and nested 0x006f43b0
   pure islands including pure-complete 0x006f4520.

   ABI v3 peels pure islands from the residual host walk after ItemOverlay
   state clear (VA 0x006fa3ac … terminal): Game+0x18990 entity field copy
   nest, 0x00421260 pure mode-pair / Manager float stores (host ANM2 +
   SoundEffects::ClearVolumeModifier residual), and list-node +0x28 clear.

   ABI v4 peels the pure field prefix of residual host 0x009b5cb0 (this =
   Game+0x23a74 / menu-gate object; first dword is menuState23a74). Five
   ordered host residuals remain after the pure prefix (incl. exact
   GenericPrompt::Initialize @ 0x008378e0).

   ABI v5 peels pure islands inside nested residual 0x008d3250 (this =
   Game+0x23a74+0x838 = Game+0x242ac): P0/P1/P2 field zeros, P3 counters
   (+0x178=-1), cursor-layer host gate on +0x40d, P4 copy +0x18→+0x1c and
   +0x24..+0x2c clear, list-host gate on +0x1e8, and post-host list empty.

   ABI v6 peels pure islands inside residual 0x009b9150 (this =
   Game+0x1baa8; ZHL layout hint PlayerManager): P0 +0xc8/+0xcc zeros,
   player-list host gate + post-host end←begin, extra-list count/gate +
   clear-end, per-ptr host gate (extra elems / _esauJrState[4]), esau slot
   clears, mid +0x7c=0 + byte +0x5c=1, tail four dwords at +0x60 ← -1.

   ABI v7 peels pure islands inside residual 0x009a27d0 (this =
   Game+0x1da04; near ZHL HUD @ 0x1d9ac +0x58): no pure entry prefix
   (host ANM2 / a1ad90 / 40c7f0 cluster first); 11 slot-flag bytes at
   this+0x3ce4 + i*0x1f4 ← 0 after each slot host triple; tail pure
   byte this+0x54cd ← 0 before host 0x0083abb0 + tail-jmp 0x0084bfd0.

   ABI v8 peels pure islands inside residual 0x009a19a0 (this =
   Game+0x1da04; same receiver as 0x009a27d0): P0 scalar/float pack at
   +0x5490..+0x54d8; per-slot setup before host 0x00841cf0 ×8 stride
   0x6dc (dword +4 ← this_addr, word +8 ← index); tail pure byte
   +0x54cc ← 1 before tail-jmp 0x0084bfd0 this=+0x59a4.

   ABI v9 peels pure islands / CF from residual host 0x0040e910 (global
   tree walk / COM release at DAT_00c78ee8 after 0x009a19a0): list walk
   needed when first != sentinel; node object at +0x18 non-null → COM
   path; after COM hosts free when word(obj+4) <= 2 else pure successor
   only; post-erase dtor object non-null; post-erase callback when host
   virtual AL != 0 and global fn non-null; free size imm 0x1c; pure-
   complete freestanding tree iterator++ (PE 0x00414a80). COM/vtable/
   erase/free stay residual.

   ABI v10 peels pure islands / CF from Exit map walk at Game+0x1a738
   (after 0x0040e910) and residual host 0x0069d690 (string-key map find):
   outer walk when first != sentinel; post-find hit when found !=
   sentinel; flag@node+0x28 and elem range [+0x44,+0x48) gate host
   0x0040c7f0×N; MSVC string SSO data-addr + pure-complete string
   compare (PE 0x00423480); 0x0069d690 post-lower_bound isnil/cmp hit
   select.

   ABI v11 peels pure islands + pure-complete lower_bound 0x00685bc0
   (inside find 0x0069d690) and pure-complete find itself: init triple
   {walk,bound,best}, empty-tree isnil CF, per-step strcmp(node,key)
   branch (cmp<0 → right/bound=0; else best=node left/bound=1), loop
   while !isnil(walk). Freestanding pure-complete over linear memory
   (same address model as tree_iterator++).

   ABI v12 peels pure islands / CF from residual host 0x0040c7f0
   (map elem walk this=elem+0x18; also 8d3250 / 9a27d0 / 40e910 free
   path) and nested ctor pure stores of 0x0040cc10: alloc size imm
   0x18; alloc-ok / old-object-present gates; callback gate (virtual
   AL && DAT_00c7163c); post-ctor object finish (vtable 0xb1a6e0 +
   arg@+0x14); pair tail *this=arg / this+4=new; 40cc10 pure field
   pack + default-init direct/indirect CF. Host residual remains
   alloc 0x00a0f4c0, 40cc10 DAT_00b81c10 call, virtual release, and
   optional global callback.

   ABI v13 peels pure islands / CF from residual host 0x00408830
   (thiscall; stack arg; Exit sites this=9b5cb0+0x7c / +0x190 with
   arg=0): entry store this+4←arg; free-needed gates on this+8 /
   this+0xc; post-free slot zeros; arg-present + count-nonzero alloc
   gates (arg+0x1c / arg+0x24); overflow-safe alloc size count*4
   (seto/neg/or → 0xffffffff); fill size count<<2 + fill byte 0xff;
   terminal pack this+0x10=-1.0f bits, +0x14=0, +0x18=0, +0x1c=0.
   Host residual remains free/alloc 0x00a648b0 and memset 0x00af05e5.

   ABI v14 peels pure islands / CF from residual host 0x009b4810
   (thiscall; this=9b5cb0+0x5b0 = Game+0x24024): vector end←begin
   at +0x27c; first push value from mode@+0; mode gates (skip A/E
   when mode==3; skip F when mode==1; layer path when mode∈{1,2});
   vector space gate end!=cap for pure dword push; id tables for
   blocks A–F + optional 0x1c; push-0x1c CF from host-supplied
   Manager/Game fields; layer-loop gate (signed count@+0xa4>0);
   Counter play-skip CF; post-Rewind byte anm2+0x44←1; terminal
   pure pack (+4/+8/+14..+20/+24c..+254). Host residual remains
   vector grow 0x00428590, ANM2 GetLayer/Load/ReplaceSpritesheet/
   Play/Rewind, string alloc/free, IAT strcmp, security cookie.

   ABI v15 peels pure size/cap CF from residual vector grow 0x00428590
   (thiscall; this = {begin,end,cap}; stack insert_pos + value*):
   SAR32 elem size/capacity/insert index; max-size length throw gate
   (0x415bc0); needed = size+1; geometric 1.5x capacity with overflow
   → MAX path; capacity-error throw gate (0x40cee0); alloc byte size
   new_cap*4; post-alloc end/cap/insert-slot pointer math; append vs
   mid-insert copy byte counts; old-buffer free CF (capacity bytes
   &~3, heap-header when >=0x1000, header offset check). Host residual
   remains operator-new 0x40cf00, memmove IAT, free 0xaef15c, throw
   bodies, and ANM2/string hosts inside 0x009b4810.

   ABI v16 peels pure islands / CF from freestanding ANM2 residual hosts
   and nested sized alloc used by Exit (and 0x009b4810):
   exact ANM2::GetLayer(int) @ 0x0040b220 (signed range + layer stride
   0xa0 pointer math; OOB log/throw residual); exact ANM2::Load @
   0x0040bd50 (path-present / path-is-self / loadgraphics gates; pure
   post stores +0x109/+0x10c; layer-loop + sheet-loop CF; shadow name
   eq + '*' flag OR pure; string/parse/graphics hosts residual); nested
   alloc 0x0040cf00 pure size CF (heap-header threshold 0x1000, +0x23
   request, overflow throw gate, 32-byte align user ptr). Host residual
   remains alloc body 0xa0f4c0, Load string/parse hosts, GetLayer OOB.

   ABI v17 peels pure islands / CF from freestanding ANM2 residual hosts
   exact ANM2::ReplaceSpritesheet @ 0x0040bf30 (signed layer range;
   layer+8 MSVC string vs path sized equality pure 0x40cae0; self-assign
   skip; pure byte layer+0x30←0 on success; host string assign 0x40ccd0
   residual) and Play-by-name path @ 0x0040a5d0 (no exact ZHL Play match;
   anim table +0x74/+0x78 stride 0x13c; pure cstr name scan; miss → host
   log 0xa112c0; hit → host 0x408830/0x408970 on this+0x30 by reset).

   ABI v18 peels pure islands / CF from exact AnimationState::Rewind @
   0x0040a1b0: entry zeros +0x10/+0x18/+0x1c; nested residual 0x408c90
   pure event-mask body (frame0 ucomiss ordered-equal + bts masks; null
   anim log residual); post-call dword-zero loops over layer arr @+8
   count anim+0x1c and null arr @+0xc count anim+0x24.

   ABI v19 peels pure islands / CF from residual MSVC string assign
   0x0040ccd0 (thiscall; stack src + count; ret 8): fits-capacity
   no-grow CF, length-error gate (count > 0x7fffffff → host 0x40ccc0),
   new_cap = max(count|0xf, 1.5x) with MAX clamp, alloc size new_cap+1
   (host 0x40cf00), old-buffer free CF (cap>=0x10, size cap+1, header
   threshold 0x1000), pure size/cap/ptr/null-term stores. Host residual
   remains memmove/memcpy IAT, alloc body, free, throw.

   ABI v20 peels pure islands / CF from freestanding keep-set residual
   0x00408970 (thiscall; stack new-arg object; ret 4; Play keep-path
   sibling of reset host 0x408830): null-safe count A/B loads from
   this+4 / stack arg (+0x1c / +0x24), signed resize gates, alloc/fill/
   copy size CF, heap-accounting free base (DAT_00c7de78+0x30 /
   0xc7f618), buffer free gates, pure field stores (this+4←arg;
   +8/+0xc clears; PE B-realloc store targets +8). Host residual remains
   free/alloc 0xa648b0, memset 0xaf05e5, memcpy 0xaf05df, IAT free.

   ABI v21 peels pure islands / CF from freestanding Load nested residual
   0x0040db90 (stdcall path*, anm2*; ret 8; called from ANM2::Load):
   path-size early-return gate, QPC timing high-mul>>18 pure scale,
   cache list space/walk CF, post-lower_bound isnil/key hit select,
   insert-needed gate, heap-stats free base + temp free gate, old layer
   free size, layer count/alloc size (count*0xa0+4 overflow→-1), layer
   loop strides 0x38/0xa0 + backptr, pure field pack node→anm2, name
   string self-assign skip, timing delta. Host residual remains QPC,
   cache grow/find/IAT path, tree, file load, insert, free/alloc,
   vector construct/destroy, layer copy 0x408310, string assign, log.

   ABI v22 peels pure islands / CF from freestanding Load sibling residual
   0x0040e110 (stdcall path*; ret 4; called from ANM2::Load after
   0x40db90): same path-string cache list DAT_00c798b8/bc + tree
   sentinel DAT_00c78ee0; space CF via test (end-begin),~3; walk
   done/next stride 4; grow-install gate (result != cache-begin addr);
   grow-result triple zero; path SSO data select (cap@+0x14); post-
   lower_bound isnil/key hit select; hit → pure refcount++ at node+0x50;
   miss → host log 0xa112c0. Host residual remains cache grow 0xa16060 /
   tree 0x4149d0, IAT path canonicalize, hash 0xa159d0, lower_bound
   0x416490, log 0xa112c0.

   ABI v23 peels pure islands / CF from freestanding ANM2 graphics walk
   residual 0x0040c000 (thiscall anm2*; ret 4 dummy stack cleanup; called
   from exact ANM2::Load when loadgraphics): layer count@+0x80 loop gate,
   stride 0xa0 ptr math, skip when flag@layer+0x30 != 0, PNG string SSO
   path select at layer+8, shared-ptr / virtual AL → graphics flag byte,
   stack pair zero/assign CF, COM callback gate (virtual AL &&
   DAT_00c7163c), pure flag stores layer+0x30/+0x31, loop next index/off.
   Pure-complete freestanding 0x0040c1e0 field pack. Host residual remains
   exact Manager::LoadImage 0x9588a0, SP materialize 0x40c550, graphics
   0x40e520/0x40e740, sprite 0x408590, pair ctor 0x40c4a0, layer attach
   0x408640, virtual COM release, global callback.

   ABI v24 peels pure islands / CF from freestanding layer-attach residual
   0x00408640 (thiscall layer*; stack src + ctrl; ret 8; called from
   0x40c000 when sprite present): source-present gate on stack arg0;
   pure 4-dword field copy src+0x30..0x3c → layer+0x20..0x2c; pair slot
   ptr layer+0x98 for host exact KAGE_SmartPointer_ImageBase::swap @
   0x40c3b0; ctrl-present + virtual AL + DAT_00c7163c callback gate for
   COM release path. Host residual remains swap 0x40c3b0, virtual
   release (vtbl+0xc), global callback.

   ABI v25 completes the residual bodies invoked by 0x009a19a0 /
   0x009a27d0 (this = Game+0x1da04):
     * per-slot residual 0x00841cf0 (thiscall; ret; ×8 at this+i*0x6dc):
       P0 24× stride-0x10 element pack at +0x10 (dword 0, rdata pointer
       0x00b1a4ec ×2, byte 0); head zero bytes +0xa..+0xe; P1 2× stride
       0x18 pre-stores at +0x200 before host 0x0040c7f0(0) on elem+8;
       P2 4× stride 0x1c at +0x190 (three dword zeros + two pair-value
       host gates); vector walk at +0x6a0/+0x6a4 stride 0xc (host
       0x0040c7f0(0) on elem+4), host range destroy 0x00709380, pure
       end←begin recaptured after that host, word +0x6ac ← 0, terminal
       dword [this] ← 0. Host residual: 0x0040c7f0, 0x00709380.
     * residual 0x0083abb0 (thiscall; ret; this = +0x5c54): two blocks
       stride 0x14 — element walk stride 0x28 with host 0x0040c7f0(0)
       on elem+4 and re-read end each step, host range destroy
       0x00709300, pure end←begin (recaptured), byte +4 ← 0, dword +0 ←
       0; terminal byte +0x28 ← 0.
     * shared range-destroy host CF for 0x00709380 (stride 0xc) and
       0x00709300 (stride 0x28): ctrl at elem+8, callback arg elem+4,
       virtual AL (vtbl+0xc) + DAT_00c7163c gates. SEH/virtual/callback
       stay host.
     * pure-complete tail-jmp 0x0084bfd0 (thiscall; this = +0x59a4 =
       Game+0x233a8; ret): two blocks stride 0xcc from +0x114, 51 dwords
       each in 0x14-byte elements — 4 zeros per element, element slot 4
       untouched for elements 0..5 and ← 0.1f (0x3dcccccd) for elements
       6..9, trailing dword ← 0; terminal byte +0x2ac ← 0. No calls, no
       loads: fully translated.

   ABI v26 peels the last two non-ANM2 hosts of the 0x009a27d0 slot triple
   (slot base = 0x009a27d0 this + 0x3cdc + i*0x1f4):
     * 0x00840f70 (thiscall; no stack args; ret): two owned buffers at
       this[0] / this[1]. Per slot, when the pointer is non-null: pure
       heap-accounting base select (DAT_00c7de78 ? +0x30 : DAT_00c7f618),
       pure 64-bit borrow subtract of the size dword at ptr-4 from the
       {lo,hi} accounting pair, host IAT free(ptr-4) via 0x00b187dc
       (api-ms-win-crt-heap-l1-1-0!free), then pure slot ← 0.
     * 0x00709150 (thiscall; one UNUSED stack arg; ret 4): allocate 0x18
       (host 0x00a0f4c0 — allocator body deliberately out of scope), on
       success run nested ctor 0x0040cc10 (v12 pure field pack) then pure
       post-ctor vtable ← 0x00b67f98 and +0x14 ← 0; alloc failure forces
       the new object to 0. Then release the old object at this+4 through
       vtbl+0xc with a DAT_00c71644 callback gate (a DIFFERENT global from
       the DAT_00c7163c used by 0x0040c000 / 0x00408640 / range destroy).
       Terminal pure pair store: *this ← 0 (immediate, NOT the stack arg —
       this is where it differs from 0x0040c7f0) and this+4 ← new object.
   The IAT free, the allocator, the virtual COM release and both global
   callbacks stay address-stable host actions.

   ABI v27 peels the last non-ANM2 host of 0x009a27d0, residual 0x00a1ad90
   (thiscall; no stack args; ret; SEH frame 0xb11230). Three independent
   teardown blocks plus a terminal pack:
     A  gate [this+0x28] != 0 → host 0x00a648b0 with CL = mode 1 and the
        POINTER IN EDX (register argument; a listing that only shows the
        two pushed zeros loses it) → pure [this+0x28] ← 0.
     B  gate [this+0x3c] != 0 → header at arr-4 holds the element count;
        host CRT vector-dtor iterator 0x00aef638(arr, 8, count_pre,
        dtor 0x0040c440); the count is then RE-READ from arr-4 and the
        free size is count_after*8 + 4 (lea [eax*8+4], 32-bit wrap);
        host free 0x00aef15c(arr-4, size) → pure [this+0x3c] ← 0.
     C  MSVC tree clear on the map object at this+0x40 (node _Isnil byte
        at +0xd confirmed inside 0x0042c8e0, matching the v9/v10/v11 tree
        model): head = [this+0x40] read BEFORE the call and held in a
        callee-saved register, root = [head+4]; host _Erase 0x0042c8e0;
        pure [head+4] ← head, [head] ← head, [head+8] ← head,
        [this+0x44] ← 0.
     T  terminal: BYTE [this] ← 0 (byte, not dword), [this+0x24] ← 0,
        [this+0x38] ← 0.
   Blocks B and C are deliberately opposite on recapture: B must use the
   count re-read after the host call, C must use the pre-call head.

   ABI v27 also records the recovered call shape of 0x00a648b0 mode 1
   (movzx eax,cl selects the mode from the LOW BYTE only; mode 1 tests
   EDX, reads the size dword at EDX-4, applies the same 64-bit borrow
   subtract to the same accounting pair as 0x00840f70, and calls the same
   0x00b187dc CRT free import). Its body stays host; only the argument
   shape and gate are translated.

   ABI v28 peels two more freestanding Exit residuals:
     * 0x0040c4a0 (thiscall pair*; stack arg; ret 4; returns this) — the
       CONSTRUCTOR sibling of assignment 0x0040c7f0 (v12). Same alloc size
       0x18, same nested ctor 0x0040cc10, same post-ctor vtable
       0x00b1a6e0, same +0x14 ← stack arg, same DAT_00c7163c gate. Three
       differences, all load-bearing:
         (a) it ZEROES the pair before the allocator ([this] ← 0 and
             [this+4] ← 0 at 0x0040c4cc/0x0040c4d2), which 0x0040c7f0
             does not;
         (b) its terminal stores run OBJECT FIRST then value
             ([this+4] ← new, then [this] ← arg), the opposite order;
         (c) it returns this in EAX.
       Because of (a) the recaptured [this+4] is 0 on every path we can
       observe, so the COM release is effectively dead — but the PE still
       RE-READS [this+4] after the allocator and ctor hosts, so the gate
       is NOT constant-folded here; the recaptured value stays an input.
     * 0x00415800 (thiscall ctx; stack base + node; ret 8) — the MSVC
       tree _Erase for the SAME node type as the v9 global tree walk
       0x0040e910: node size 0x1c, COM control at node+0x18, callback
       argument node+0x14, DAT_00c7163c gate, _Isnil byte at +0xd tested
       as a BYTE. Right subtree recurses, left child iterates, so the
       free order is reverse in-order (right, self, left) — externally
       visible through the host free sequence, and translated as a
       pure-complete order enumerator over linear memory.
   Allocator 0x00a0f4c0, CRT free 0x00aef15c, the virtual COM releases
   and the global callbacks all stay address-stable host actions.

   ABI v29 is a CORRECTNESS bump with no new peel: every byte-wide scalar
   parameter in this family was widened from uint8_t to uint32_t and is
   now re-narrowed explicitly in the body.

   Why this was wrong. These helpers model x86 BYTE tests — `test al,al`
   (the COM-release gates) and `cmp byte ptr [n+0xd],0` (the _Isnil tree
   flags). They were declared `uint8_t`, but the Wasm ABI does NOT narrow
   an i32 argument at the call boundary, and -O2 deletes an in-body mask
   it can prove redundant for a uint8_t parameter. So for any argument
   above 0xff the compiled helper read the FULL word: measured on the
   shipped module, isaac_exit_415800_virtual_ok(0x100) returned 1 where
   the PE's `test al,al` on 0x100 clears ZF's operand to AL=0 and does
   NOT take the gate, and isaac_exit_415800_walk_continue(0x100) returned
   0 where the PE sees an _Isnil byte of 0 and CONTINUES the walk. Nine
   exports were confirmed divergent by direct probe; 58 parameters across
   48 functions had the defect shape.

   Why no test caught it for 28 ABI versions: the JS oracles all mask
   correctly, and the 0x100 boundary existed ONLY as an oracle-side fixed
   case (e.g. exit415800VirtualOk(0x100) === false). Every Wasm-side draw
   was masked with `& 0xff` before the call, so the differential never
   presented the one input class that diverges. Fixed cases now push
   0x100/0x1ff/0xffffffff across the Wasm boundary directly.

   A uint32_t parameter cannot be proven in-range, so the explicit
   static_cast<uint8_t>(x & 0xffu) survives -O2.

   ABI v30 peels the keyed-registry residual 0x0040e520 (stdcall-shaped;
   ret 8) and, with it, its key derivation 0x00a159d0:
     * 0x0040e520's [ebp+8]/[ebp+0xc] are ONE by-value {value, ctrl} pair,
       not two arguments. Two pushes at 0x0040e577 and 0x0040e57b feed two
       DIFFERENT callees — 0x00414440 is `ret 4` and pops the key address,
       0x0040c3b0 is `ret 4` and pops the pair address — so a reading that
       counts pushes into one call gets the argument shape wrong.
     * The control word is RE-READ at 0x0040e58f, after all three host
       calls, one of which (0x0040c3b0) receives &pair. The gate therefore
       takes a recaptured value, never the entry snapshot.
     * 0x00a159d0 turned out NOT to be opaque: it is a pure djb2 hash
       (seed 0x1505, *33) that lower-cases ASCII A-Z and normalises '\\'
       to '/'. Translating it removes a host edge from 0x0040e520 rather
       than merely gating it. A null pointer hashes to 0, an empty string
       to the seed — deliberately different.
     * 0x00414440 (map operator[]) allocates a 0x1c node with the key at
       +0x10 and returns node+0x14. That is the SAME node geometry v28
       recorded for the _Erase 0x00415800 (node 0x1c, pair at +0x14/+0x18),
       which independently confirms the map's mapped type is this pair.
   0x00a159d0's callers, the map insert 0x00414440/0x00415bd0, the assign
   0x0040c3b0, the COM release and the 0x00c7163c callback stay host.

   ABI v32 translates two complete __thiscall bodies:
     - 0x007384d0 (ret @ 0x007385be): an object realloc/fill. Four host edges
       (dtor 0x007e9ba0, CRT sized free 0x00aef15c, raw alloc 0x00a0f4c0, ctor
       0x007e9400) wrap eleven pure stores that STRADDLE a memset
       (0x00af05e5 = VCRUNTIME140!memset via IAT [0x00b1875c], so the fill is
       translatable): 0x0073854a-0x00738581 before, 0x0073858b the memset,
       0x00738593-0x007385a7 after. [this+0x18300] receives the CTOR's return
       value, never the alloc pointer; [this+8] is deliberately NOT cleared
       while [this], [this+4], [this+0xc] are. identify-zhl finds an exact
       Room::constructor match for the ctor 0x007e9400 but it stays host per unit scope.
     - 0x00408310 (ret 4 @ 0x00408586): an MSVC string-field setter. [this]=arg0,
       then a temp string built HOST (copy-ctor 0x0040cf50 from arg0+0x20,
       ebx=1) or PURE (empty SSO, ebx=2), a full-word self-assign guard, the
       assign read 0x0040ccd0 (its CF is v19), two LOW-BYTE-free arms, and after a
       host 0x0040c7f0(0) a pure field tail that reads the runtime globals
       g_c7b640/g_c7b644 (v31) and g_c798e4. 0x0040cf50 stays host (frame-
       opaque's active target); 0x0040ccd0 stays host here but its v19 model
       is reused for the free arms' geometry.

   ABI v33 pins the Game::Exit root (exact ZHL __stdcall void
   Game::Exit(bool ShouldSave) @ 0x006fa0c0; ret 4 @ 0x006fa537). The whole
   root body is PE-mapped: 262 instructions, 30+ ordered host events and 13
   pure segments. This unit adds the root's pure control flow as a typed
   continuation plan:
     * isaac_exit_root_plan fills an ordered event array (kind<<24 | payload)
       mirroring the PE order exactly — HOST (VA payload), PURE (segment id
       payload), VECTOR_DTOR_LOOP (count payload) and MAP_WALK kinds — plus
       the decision fields that gate the conditional events. A slice driver
       can walk the array and run each HOST event as a typed host action and
       each PURE segment through the matching existing apply helper.
     * The entry gate is a LOW-BYTE test on Game+0x2658a (0x006fa0d2); when
       zero the whole plan is empty (early ret @ 0x006fa531).
     * The ItemOverlay force gate is a FULL-DWORD state==2 test (test
       eax,eax @ 0x006fa172 + cmp eax,2 @ 0x006fa176; host 0x009aca90 is
       exact ItemOverlay::Update(bool)).
     * The SFX receiver for 0x0092e300 + the five 0x0092e230 stops is
       Manager+0x2a324; stop ids 0x256/0x257/0x258/0x259/0x3f0.
     * Host 0x007df690's receiver is computed: Manager + 0x29fc0 +
       [Manager+0x29fbc]*0x184 (imul @ 0x006fa190, 32-bit wrap) — pure math
       exported as isaac_exit_root_7df690_receiver.
     * PGD flush gate: two LOW-BYTE tests (changesmade @ Manager+0x14,
       fileLoaded @ +0x14+0xf8c); the changesmade clear is a BYTE store
       before host 0x009292c0. Cloud vs local: the Steam context's FIRST
       DWORD is tested FULL-WORD (cmp dword ptr [eax],0 @ 0x006fa1f0) ANDed
       with a LOW-BYTE test on Manager+0x2a3a4. CORRECTNESS FIX: v29-era
       isaac_exit_pgd_save_uses_cloud masked the steam word to a byte; the
       PE gate is full-dword, so 0x100 with cloud on must select the cloud
       host. Fixed here with wide-value draws (0x100/0x1ff/0xffffffff) and a
       mask-dropping mutant pinned by test.
     * GameState IO: LOW-BYTE skip gate Game+0x2658b; write 0x00958ed0 vs
       delete 0x00959130 selected by the LOW BYTE of ShouldSave.
     * The root calls exact ANM2::Reset @ 0x00407f10 THREE times, in order:
       this=Game+0x1d528 (0x006fa270), this=Game+0x1c03c (ecx set at
       0x006fa2d5, call @ 0x006fa396) and this=Game+0x1d1d8 (0x006fa3a1) —
       the last two were not in the v1/v2 root tables. Exported as an
       ordered this-offset table (0x1d528, 0x1c03c, 0x1d1d8).
     * The vector dtor loop at 0x006fa27f-0x006fa2a5 re-reads begin AFTER
       the host 0x0040d040 loop and stores end<-begin; the plan emits one
       VECTOR_DTOR_LOOP event (count payload) then the pure clear-end
       segment.
     * All 13 pure segments map to existing apply helpers (manager floats,
       changesmade byte clear, T0/T1/T2, vector clear-end, byte 0x25954,
       readonly clear, postlog pack with g_c7b640/g_c7b644 inputs, overlay
       state clear, 18990 nest, map flag +0x28 clear, terminal).
   Host bodies stay host: 0x008650a0, 0x0092e300, 0x0092e230, 0x009aca90,
   0x007df690, 0x009292c0, SteamInternal_ContextInit IAT [0x00b18a1c],
   0x00928ee0 (exact SaveToSteamCloud) / 0x009294f0, 0x00958ed0 /
   0x00959130, 0x008d26c0, 0x0040d040, 0x006f43b0, 0x00a112c0, 0x00421260,
   0x00686950, 0x009b9150, 0x009a27d0, 0x009a19a0, 0x0040e910, the
   0x0069d690/0x0040c7f0 map walk, 0x009b5cb0. 0x007384d0 is v32-complete
   but keeps its alloc/free/ctor host edges; 0x00407f10 is exact ANM2::Reset
   and stays host.

   ABI v42 adds the ordered host-event decision laws for residual 0x008d3250
   (this = Game+0x242ac; v5 pure islands P0-P4 + gates + list_empty already
   landed): the ANM2::GetLayer("Cursor") receiver/arg/layer-clear offset
   laws (H4, gated on byte this+0x40d), the ANM2::Reset receiver offset law
   (H3, this+0x64), the 0x00415800 list-destroy sentinel/header offsets and
   the two stack-arg pointer laws (H5, gated on this+0x1e8), and a packed
   ordered host plan. Host bodies stay typed-host (0x0040c7f0 ×2, ANM2::Reset,
   ANM2::GetLayer + return-value layer byte store, 0x00415800).

   ABI v43 lands the remaining decision surface of the host 0x00a648b0 BODY
   (free/accounting dispatcher; v27 recovered its call shape and mode-1
   gates, the body stayed host): the full mode dispatch law (mode = low
   byte of CL; path 0 empty / 1 free / 2 stats-add; 3+ empty), the mode-2
   stats-add path (base = DAT_00c7de78 + 0x30 DIRECTLY with NO fallback —
   trapping asymmetry vs. the mode-1 esi select — addends from pair
   DAT_00c7f618 / DAT_00c7f61c, 64-bit add with carry), and a packed mode
   plan. The mode-1 free path's 64-bit borrow subtract is the SAME
   arithmetic as the v26 0x00840f70 laws (not duplicated; the plan calls
   out the shared law). IAT free 0x00b187dc stays address-stable host.

   ABI v44 lands the pure band-scan find 0x006f0040 — the first new
   caller-bearing unlanded body recovered by the corrected exit-band
   census (capstone caller scan; the 3-byte-lea undercount fix). The
   band is the Game-method window the family root sits in
   (0x006f0000..0x006fadb3, above Game::Update = the Update family root):
   44 bodies, only 0x006f0040 is caller-bearing, fully pure and unclaimed.
   0x006f8120/0x006f8100 are exact ZHL Game::IsGreedMode / Game::IsHardMode
   (frame-effect + room families treat them as host); 0x006f5210 is the
   Lua vecband "Fadein" real_fn (lua family host); 0x006f9730 is the
   process-input family's pure gate; the rest are host/owned. Body
   0x006f0040..0x006f0066 (39 B) is a FULLY PURE thiscall predicate
   (0 E8 / 0 indirect / 0 stores; 4 direct rel32 callers image-wide).
   Four FULL-dword gates in machine order: [this+0x1e68] ptr null,
   [ptr+0x161c] == -1 sentinel, SIGNED jge [ptr+0x161c] >= [this+0x161c],
   self-alias (ptr == this). Returns AL 0/1.

   ABI v45 lands the band re-scan find 0x0071df80 — the second body
   recovered by the corrected exit-band census, this time over the full
   coordinator extent 0x006f0000..0x007c0000 (the lone remaining pure
   body; the tooling store counter was also fixed this unit — add/inc/
   dec/or/and/xor/sub with a MEM first operand are read-modify-WRITE
   stores, so the 0x704b30/0x704b40/0x704b50 trio correctly drops out of
   the pure class). Body 0x0071df80..0x0071dfbf (64 B, 0x40) is a FULLY
   PURE static membership predicate (0 E8 / 0 indirect / 0 stores; 2
   direct rel32 callers 0x0071ead7 / 0x0071ebda in entity machinery):
   Game global DAT_00c71678 -> Game+0x18300 (Game::_room) -> room+0x1d18
   (room STATE id), eight FULL-dword cmp eax, imm gates
   (0xa / 0xb / 0xc / 0xd / 0x22 / 0x2b / 0x2c / 0x30), AL 0/1. The room
   family treats room+0x1d18 as the state id (ambient 0x2b/0x2c/0xd,
   B9B11 0x1a, B16 lava 0x20) — field identity agrees.

   ABI v46 closes the coordinator-VA host-leaf ledger (verify-open of the
   Wave-22 handoff leases 0x40e910 / 0x40ed50 / write-tail / SFX / PGD).
   0x40e910's decision surface was already complete (v9 + v41); 0x40ed50
   is an MSVC string-tree cache insert (pure islands are SSO/strcmp/tree
   links on runtime host strings — no scalar law surface); SFX
   (0x92e230/0x92e300) and PGD (0x9292c0/0x9294f0/0x928ee0) leases are
   held by their own families. This unit lands the last two
   capture-driven decision gates in the write body 0x00958ed0 (v39
   NARROWED): the local filename EMPTY test (cmp dword [gs+0x1fdbc], 0
   @ 0x00958fab — selects the no-filename log vs fopen/write path) and
   the existing GameStateIO dtor-present test (test ecx, ecx on
   [gs+0x1fe24] @ 0x00958fd5). Both FULL-dword; remaining compares in
   the body are SSO string-layout (host std::string) or host-call-result
   gates.

   ABI v48 is a RECONCILIATION + consumption unit. The continuation doc's
   Exit row listed 0x0040d040 (string tidy/deallocate) as the open
   frontier, but that template is already translated and FROZEN in the
   alloc family (v3 AL: isaac_alloc_str_tidy_release_needed — UNSIGNED
   gate cap >= 0x10; isaac_alloc_str_tidy_size_arg — cap + 1 dropped by
   0xaef15c; isaac_alloc_str_tidy_plan). The Exit-side ground is therefore
   consuming those frozen laws where Exit callers reach the template, not
   re-deriving it. Census (linear decode with resync, rule 10): 1288
   direct E8 rel32 + 33 E9 jmp tails = 1321 reach sites, register-held 0;
   exactly one site lies inside an exit-owned extent — 0x006fa293, the
   Game::Exit root vector dtor loop call (loop head 0x006fa27f over
   Game+0x25ebc/0x25ec0, stride 0x38, this = elem+8, cap dword read from
   elem+0x1c by the callee). New exports: isaac_exit_tidy_release_needed /
   isaac_exit_tidy_size_arg (thin delegates over the frozen AL laws,
   uint32_t throughout) plus site/offset accessors; tests prove wasm ==
   exit oracle == alloc frozen oracle differentially.

   ABI v34 translates the COMPLETE body of 0x008d26c0 (__thiscall; two
   stack args; ret 8 @ 0x008d276b / 0x008d2782) — a "select set index"
   step-size rescaler. 197 bytes, 57 instructions, 0 resyncs, decoded
   linearly from the int3 pad run 0x008d26b7..0x008d26c0 and re-anchored
   from a second decode.

   WHY THIS BODY: it is one of only TWO Exit-referenced functions whose
   ONLY call is the shared logger 0x00a112c0 (the other, 0x00408c90, was
   peeled at v18). Censused, not estimated: 3286 direct rel32 callsites of
   0x00a112c0 image-wide; 24 of them fall inside the 83 distinct functions
   this family references; exactly 2 of those functions have no other
   call. Under the standing logger split the logger tail is a platform
   primitive, so translating this body leaves it with NO game-logic host
   content — it is game-logic complete.

   Reach channels enumerated (rule 10), and the call set is COMPLETE at 3:
   direct rel32 3 (0x006fa247 inside Game::Exit, 0x008d20d3, 0x008d2315),
   jmp tail entries 0, mov reg/imm32 0, push imm32 0, raw LE dword in all
   five sections 0, indirect [imm32] slots 0. No exact ZHL signature, so
   the name stays address-stable.

   Argument shape — do NOT count pushes into the nearest call. At
   0x008d2315 only ONE push (edx) sits immediately before the call; its
   partner `push 0` is at 0x008d22e5, BEFORE a test/branch. Confirmed
   __thiscall(index = [ebp+8], force = [ebp+0xc]) with ret 8 at all three
   sites; all three pass force = 0, and the Game::Exit site passes
   index = 0 with this = Game+0x25108.

   Body (this = the object; offsets are from it):
     +0x7cc/+0x7d0  vector begin/end, element stride 0xc
     +0x7d8         currently selected set index
     +0x834         int32 frame index
     +0x838         float32 step (degrees per frame)
   Three arms, and BOTH non-apply arms store nothing at all:
     NOOP    0x008d26cb cmp esi,[edi+0x7d8] (FULL dword) / jne, then
             0x008d26d3 cmp byte ptr [ebp+0xc],0 (LOW BYTE) / je 0x8d277e.
             Equal index AND force low byte 0 -> straight to the epilogue.
             Censused STORES on this arm (v72 rule — count stores, not
             calls): ZERO outside the own frame, which `ret 8` unwinds;
             ZERO calls; esi/edi/ebx are callee-saved and restored, and
             eax is never written. A COMPLETE no-op.
     INVALID 0x008d26fd jae 0x8d276e — an UNSIGNED bound test against a
             count produced by a SIGNED division. Pushes (8,
             0x00b758b8 "Invalid set index %d \n", index) and calls the
             logger, then falls into the SAME epilogue. ZERO stores.
     APPLY   exactly three stores: [+0x7d8] <- index (0x008d2702),
             [+0x838] <- new step (0x008d274d), [+0x834] <- new frame
             (0x008d2761). All three are inside the receiver object.

   Element count is the MSVC SIGNED magic division by 12, NOT an unsigned
   delta/12: mov eax,0x2aaaaaab; imul ecx; sar edx,1; mov eax,edx;
   shr eax,0x1f; add eax,edx (0x008d26e3..0x008d26f9). The caller at
   0x008d22eb..0x008d230c recomputes the identical sequence, which
   independently confirms both the stride and the signedness.

   Float chain, transcribed rather than paraphrased (0x008d270f-0x008d2761):
     n     = (int32)([elem+4] - [elem+0]) >> 2     ; sar — ARITHMETIC
     d     = (double)(int32)n                      ; cvtdq2pd
     d    += (n < 0) ? 4294967296.0 : 0.0          ; addsd [ecx*8+0xbacb00]
                                                   ; the table is
                                                   ; {0.0, 2^32} and ecx is
                                                   ; the SIGN BIT, so the
                                                   ; pair is exactly an
                                                   ; unsigned conversion
     new838 = 360.0f / (float)d                    ; cvtpd2ps + divss
     new834 = cvttss2si( ((float)(int32)old834 * old838) / new838 + 0.5f )
   old838 is read at 0x008d2730, BEFORE the new value is stored at
   0x008d274d — the multiply uses the OLD step and the divide uses the NEW
   one. Folding either way round is defect class 1 and a test pins it.

   Constants read through the SECTION TABLE (.rdata VA 0x00b18000 raw
   0x00716600), never a .text formula: 0x00baab30 = 360.0f (file offset
   0x007a9130), 0x00baa2d0 = 0.5f (0x007a88d0), 0x00bacb00 = {0.0,
   4294967296.0} (0x007ab100), format string at 0x00b758b8 (0x00773eb8).

   Two original-binary behaviours are REPRODUCED, not corrected:
     * a negative sub-count becomes a huge unsigned double, so new838 is a
       denormal-small positive and the rescaled frame overflows int32;
     * x86 CVTTSS2SI yields the integer indefinite 0x80000000 on NaN,
       infinity, or any out-of-range magnitude. A plain C++ cast is UB
       there, so the conversion is explicit.

   Root integration: the plan gains the receiver's current set index and
   DROPS the 0x008d26c0 host event on the proven no-op arm (the Exit site
   passes index 0 and force 0, so a zeroed +0x7d8 — the default boot state
   — makes the call a no-op). Every other arm keeps the host event
   byte-for-byte, so this narrows the event stream without changing state.
   The body itself is fully translated; wiring the APPLY arm into the root
   as a pure segment additionally needs the element pair at
   begin + index*0xc, which lives in the vector's heap block OUTSIDE the
   Game object the capture ABI addresses — that is the exact remaining
   blocker for the last host event, and it is a capture contract, not
   untranslated logic.

   ABI v37 peels PURE islands from Exit-root prologue 0x008650a0 (217 B,
   ret 4 @ 0x0086512b; SEH unwinder continues to 0x00865178). Entry gate
   is a FULL-dword test of 0x20000 on *[engine]; pack stores
   {holder=[engine+0x10], 0x11, -1}; pointer math engine+0x10. Host
   remains: SEH unwinder, logger 0x00a112c0, 0x00874a10, IAT luaL_unref
   0x00b1831c, 0x00693180. identify-zhl empty on every call/IAT.

   ABI v38 peels PURE islands from Exit nest 0x00686950 (this =
   Game+0x68d78; 384 B to terminal ret @ 0x00686acf; early ret @
   0x00686a1f). The 1075 B linear window is THREE functions: this body,
   sibling 0x00686ad0 (ret 4), sibling 0x00686b70 (SEH, 0x40cf50 x2).
   Entry gate is UNSIGNED cmp dword [this],1 / jbe (0xffffffff OPEN).
   Pack stores { [this]=4, [this+4]=0, byte[Manager+0x4abc7]=1 } fire
   BEFORE the I/O gates and are not undone if I/O is skipped. Host
   remains: sprintf 0x0041e420, IAT remove 0xb187cc, fopen-shaped
   0x00a25090, virtual +0x1c / +0 writes, cookie 0xaef12b. identify-zhl
   empty.

   ABI v39 peels PURE islands from GameState write 0x00958ed0 (600 B to
   terminal ret @ 0x00959127; early log-ret @ 0x00958efa; int3 pad then
   sibling 0x00959130). Exit-root caller 0x006fa21d when ShouldSave
   low-byte != 0. identify-zhl empty on the body; string evidence
   "GameState::Save". Sibling 0x00959130 is NOT the same template
   (GameState::Delete + distinct stores / no Steam/_fileno IAT) — peel
   write only. Entry gate is FULL-dword [Manager+8]==2. Count gate is
   UNSIGNED [Game+0x26630]==0 (ja skip; 0x80000000 CLOSED). Vec
   begin==end FULL-dword. Challenge: LOW-BYTE player+0x173 then SIGNED
   GetExtraLives>=1. Pack store byte[Manager+0x20dcc]=1 then hosts.
   Host remains: GetPlayer 0x417870, GetExtraLives 0x7bf670, SaveState
   0x6f9000, 0x8f8cd0, Steam IAT 0xb18a1c, 0x9cad40, fopen 0xa25090,
   _fileno IAT 0xb18920, GameState::write 0x9c9340, PGD 0x9292c0
   (SKIP — PGD TAIL_HOST_VA_9292C0), SaveToSteamCloud 0x928ee0 /
   0x9294f0, logger, virtuals.

   ABI v40 peels PURE islands from GameState delete 0x00959130 (75 B to
   terminal ret @ 0x0095917b; int3 pad to 0x00959180). Exit-root caller
   0x006fa224 when ShouldSave low-byte == 0; also 0x6f97ad / 0x704fb3 /
   0x7896e1 / 0x9b65b7. identify-zhl empty on the body; the only callee
   0x9c8350 = exact ZHL GameState::Delete(). Sibling of v39 write —
   shares only the UNSIGNED [Game+0x26630]==0 + FULL-dword vec-empty
   prefix; distinct CF (single Delete host vs the write's GetPlayer /
   lives / SaveState / cloud / fopen chain) and distinct stores (dword
   [0xf98]=0, byte [0x14]=1, byte [0x4b284]=0 vs 20dcc / 4b134→1ad14 /
   AL→1ad18 / f98←20d48 / 20dcc=0), no IAT — NOT folded. Host remains:
   GameState::Delete 0x9c8350 only. */

enum { ISAAC_EXIT_PURE_HELPERS_ABI_VERSION = 48 };

enum {
  ISAAC_EXIT_VECTOR_25EBC_STRIDE = 0x38,
  ISAAC_EXIT_VECTOR_25EBC_DTOR_THIS_DELTA = 8,
  ISAAC_EXIT_SFX_STOP_COUNT = 5,
  ISAAC_EXIT_6F4520_EFFECT_SLOT_COUNT = 7,
  /* Residual post-overlay pure nest at Game+0x18990 (VA 0x006fa3c5). */
  ISAAC_EXIT_RESIDUAL_BASE_OFF = 0x18990,
  ISAAC_EXIT_RESIDUAL_OUTER_COUNT = 0x25, /* 37 */
  ISAAC_EXIT_RESIDUAL_OUTER_STRIDE = 0xc4,
  ISAAC_EXIT_RESIDUAL_MID_COUNT = 2,
  ISAAC_EXIT_RESIDUAL_MID_STRIDE = 0x2c,
  /* Slot relative to mid edi: [edi-4]=entity base, [edi]=count, [edi+0xc]=flag. */
  ISAAC_EXIT_RESIDUAL_SLOT_PTR_DELTA = 4, /* edi points at count; ptr is -4 */
  ISAAC_EXIT_RESIDUAL_SLOT_FLAG_OFF = 0xc,
  ISAAC_EXIT_RESIDUAL_ENTITY_STRIDE = 0x5c,
  ISAAC_EXIT_RESIDUAL_ENTITY_SRC_OFF = 0x30,
  ISAAC_EXIT_RESIDUAL_ENTITY_DST_OFF = 0x34,
  /* PE imm / DAT bits (hash-bound). */
  /* ABI v31: WAS 0x3760371c / 0x37873770 as literals. Removed — the PE reads
     these from two globals at runtime, so they are INPUTS, not constants.
     `.data` is VA 0x00bf8000, raw 0x007f6000, raw size 0x69e00, so the file
     backs it only up to VA 0x00c61e00; 0x00c7b640 is past that end and is
     therefore ZERO AT LOAD and written at runtime. The two literals appear
     nowhere in the image — not as immediates in .text, not in .rdata.
       0x006fa311  movss xmm0, dword ptr [0xc7b640]
       0x006fa319  movss dword ptr [ebx + 0x1ba90], xmm0
       0x006fa321  movss xmm0, dword ptr [0xc7b644]
       0x006fa329  movss dword ptr [ebx + 0x1ba94], xmm0
     (sibling site 0x006fdf9e/0x006fdfac; the 0x009b4810 tail does the same
     at 0x009b4fc0/0x009b4fcd into this+0x1c / this+0x20).
     Callers must supply the observed global values. */
  ISAAC_EXIT_F32_GLOBAL_C7B640_ADDR = 0x00c7b640u,
  ISAAC_EXIT_F32_GLOBAL_C7B644_ADDR = 0x00c7b644u,
  ISAAC_EXIT_POSTLOG_I32_1BA80 = 0x32,             /* 50 */
  ISAAC_EXIT_6F4520_I32_2652C = 0x1e,              /* 30 */
  ISAAC_EXIT_6F4520_F32_26530_BITS = 0x3f800000u,  /* 1.0f */
  ISAAC_EXIT_6F4520_I32_26574 = 0x0a,              /* 10 */
  ISAAC_EXIT_6F4520_I32_676AC = 0xffffffffu,       /* -1 */
  ISAAC_EXIT_6F43B0_F32_67740_BITS = 0x3a83126fu,  /* 0.001f */
  ISAAC_EXIT_F32_ONE_BITS = 0x3f800000u,          /* DAT_00baa454 / 1.0f */
  ISAAC_EXIT_MANAGER_2A338_BITS = 0x3ba3d70au,     /* ~0.005f from 0x00421260 */
  /* 0x009b5cb0 pure prefix: this = Game+0x23a74. */
  ISAAC_EXIT_9B5CB0_THIS_OFF = 0x23a74,
  ISAAC_EXIT_9B5CB0_FIELD_8_VALUE = 2,
  /* Host receivers relative to the 0x009b5cb0 this pointer. */
  ISAAC_EXIT_9B5CB0_HOST_7C_OFF = 0x7c,
  ISAAC_EXIT_9B5CB0_HOST_190_OFF = 0x190,
  ISAAC_EXIT_9B5CB0_HOST_5B0_OFF = 0x5b0,
  ISAAC_EXIT_9B5CB0_HOST_838_OFF = 0x838,
  ISAAC_EXIT_9B5CB0_HOST_47C_OFF = 0x47c, /* GenericPrompt::Initialize */
  /* 0x008d3250 this = Game+0x23a74+0x838 = Game+0x242ac. */
  ISAAC_EXIT_8D3250_THIS_FROM_9B5CB0 = 0x838,
  ISAAC_EXIT_8D3250_THIS_FROM_GAME = 0x242ac,
  ISAAC_EXIT_8D3250_FIELD_178_VALUE = 0xffffffffu, /* -1 */
  /* Host receivers relative to the 0x008d3250 this pointer. */
  ISAAC_EXIT_8D3250_HOST_3C_OFF = 0x3c,   /* 0x0040c7f0(0) */
  ISAAC_EXIT_8D3250_HOST_50_OFF = 0x50,   /* 0x0040c7f0(0) */
  ISAAC_EXIT_8D3250_HOST_64_OFF = 0x64,   /* exact ANM2::Reset */
  ISAAC_EXIT_8D3250_HOST_304_OFF = 0x304, /* ANM2::GetLayer("Cursor") */
  ISAAC_EXIT_8D3250_LIST_OBJ_OFF = 0x1e8, /* non-null → list host */
  ISAAC_EXIT_8D3250_LIST_HEADER_OFF = 0x120, /* relative to list obj */
  /* ABI v42: GetLayer/list-destroy decision constants (PE 0x008d32f6 /
     0x008d3306 / 0x008d333d). "Cursor" string verified at .rdata
     raw 0x76d734 (VA 0xb75734). */
  ISAAC_EXIT_8D3250_CURSOR_VA = 0xb75734u, /* push imm for host ANM2::GetLayer */
  ISAAC_EXIT_8D3250_LAYER_CLEAR_OFF = 0x74, /* byte [layer+0x74] <- 0 (post-H4) */
  ISAAC_EXIT_8D3250_LIST_ARG1_OFF = 4,      /* push dword [sentinel+4] */
  /* 0x009b9150 this = Game+0x1baa8 (ZHL PlayerManager layout hint). */
  ISAAC_EXIT_9B9150_THIS_FROM_GAME = 0x1baa8,
  ISAAC_EXIT_9B9150_ESAU_SLOT_COUNT = 4,
  ISAAC_EXIT_9B9150_TAIL_COUNT = 4,
  ISAAC_EXIT_9B9150_TAIL_VALUE = 0xffffffffu, /* -1 */
  ISAAC_EXIT_9B9150_FIELD_5C_VALUE = 1,
  /* Vector/list offsets relative to 0x009b9150 this. */
  ISAAC_EXIT_9B9150_PLAYER_LIST_BEGIN_OFF = 0x0,
  ISAAC_EXIT_9B9150_PLAYER_LIST_END_OFF = 0x4,
  ISAAC_EXIT_9B9150_ESAU_SLOTS_OFF = 0x80, /* ZHL _esauJrState[4] */
  ISAAC_EXIT_9B9150_FIELD_5C_OFF = 0x5c,
  ISAAC_EXIT_9B9150_TAIL_OFF = 0x60,
  ISAAC_EXIT_9B9150_FIELD_7C_OFF = 0x7c,
  ISAAC_EXIT_9B9150_FIELD_C8_OFF = 0xc8,
  ISAAC_EXIT_9B9150_FIELD_CC_OFF = 0xcc,
  ISAAC_EXIT_9B9150_EXTRA_LIST_BEGIN_OFF = 0xd0,
  ISAAC_EXIT_9B9150_EXTRA_LIST_END_OFF = 0xd4,
  /* 0x009a27d0 this = Game+0x1da04 (near ZHL HUD @ Game+0x1d9ac). */
  ISAAC_EXIT_9A27D0_THIS_FROM_GAME = 0x1da04,
  ISAAC_EXIT_9A27D0_SLOT_FLAG_COUNT = 11,
  ISAAC_EXIT_9A27D0_SLOT_FLAG_STRIDE = 0x1f4,
  ISAAC_EXIT_9A27D0_SLOT_FLAG_BASE_OFF = 0x3ce4,
  ISAAC_EXIT_9A27D0_FIELD_54CD_OFF = 0x54cd,
  /* Slot layout from first host receiver this+0x3cdc (stride 0x1f4):
       +0     host 0x00840f70
       +8     pure flag byte ← 0  (also SLOT_FLAG_BASE_OFF)
       +0x18  host 0x00709150
       +0x20  host exact ANM2::Reset @ 0x00407f10 */
  ISAAC_EXIT_9A27D0_SLOT_HOST_840F70_OFF = 0x3cdc,
  ISAAC_EXIT_9A27D0_SLOT_FLAG_FROM_840F70 = 8,
  ISAAC_EXIT_9A27D0_SLOT_HOST_709150_FROM_840F70 = 0x18,
  ISAAC_EXIT_9A27D0_SLOT_HOST_RESET_FROM_840F70 = 0x20,
  /* Other host receivers relative to 0x009a27d0 this. */
  ISAAC_EXIT_9A27D0_PLAYERHUD_LOOP_COUNT = 8,
  ISAAC_EXIT_9A27D0_PLAYERHUD_STRIDE = 0x6dc, /* host 0x00841cf0 ×8 from this */
  ISAAC_EXIT_9A27D0_HOST_536C_OFF = 0x536c,  /* host 0x00709150 */
  ISAAC_EXIT_9A27D0_HOST_592C_OFF = 0x592c,  /* host 0x0040c7f0(0) */
  ISAAC_EXIT_9A27D0_HOST_5C54_OFF = 0x5c54,  /* host 0x0083abb0 */
  ISAAC_EXIT_9A27D0_HOST_59A4_OFF = 0x59a4,  /* tail-jmp 0x0084bfd0 this */
  /* 0x009a19a0 this = Game+0x1da04 (same receiver as 0x009a27d0). */
  ISAAC_EXIT_9A19A0_THIS_FROM_GAME = 0x1da04,
  ISAAC_EXIT_9A19A0_F32_5490_BITS = 0xbf800000u, /* -1.0f */
  ISAAC_EXIT_9A19A0_I32_M1 = 0xffffffffu,        /* -1 */
  ISAAC_EXIT_9A19A0_FIELD_54D0_VALUE = 2,
  ISAAC_EXIT_9A19A0_FIELD_54D8_VALUE = 2,
  ISAAC_EXIT_9A19A0_FIELD_54CC_VALUE = 1,
  ISAAC_EXIT_9A19A0_PLAYERHUD_LOOP_COUNT = 8,
  ISAAC_EXIT_9A19A0_PLAYERHUD_STRIDE = 0x6dc,
  ISAAC_EXIT_9A19A0_FIELD_5490_OFF = 0x5490,
  ISAAC_EXIT_9A19A0_FIELD_5494_OFF = 0x5494,
  ISAAC_EXIT_9A19A0_FIELD_5498_OFF = 0x5498,
  ISAAC_EXIT_9A19A0_FIELD_549C_OFF = 0x549c,
  ISAAC_EXIT_9A19A0_FIELD_54D0_OFF = 0x54d0,
  ISAAC_EXIT_9A19A0_FIELD_54D4_OFF = 0x54d4,
  ISAAC_EXIT_9A19A0_FIELD_54D8_OFF = 0x54d8,
  ISAAC_EXIT_9A19A0_FIELD_54CC_OFF = 0x54cc,
  /* Per-slot relative to this + i*0x6dc (host 0x00841cf0 receiver). */
  ISAAC_EXIT_9A19A0_SLOT_BACKPTR_OFF = 4, /* dword ← outer this_addr */
  ISAAC_EXIT_9A19A0_SLOT_INDEX_OFF = 8,   /* word ← loop index i */
  ISAAC_EXIT_9A19A0_HOST_5C54_OFF = 0x5c54, /* host 0x0083abb0 */
  ISAAC_EXIT_9A19A0_HOST_59A4_OFF = 0x59a4, /* tail-jmp 0x0084bfd0 this */
  /* 0x0040e910 global tree at DAT_00c78ee8 (host residual body). */
  ISAAC_EXIT_40E910_NODE_SIZE = 0x1c,       /* free size imm */
  ISAAC_EXIT_40E910_NODE_OBJ_OFF = 0x18,    /* COM/object ptr on node */
  ISAAC_EXIT_40E910_NODE_HOST14_OFF = 0x14, /* host 0x0040c7f0 this */
  ISAAC_EXIT_40E910_OBJ_WORD_OFF = 4,       /* word read after COM hosts */
  ISAAC_EXIT_40E910_OBJ_COM_OFF = 8,        /* COM iface this = obj+8 */
  ISAAC_EXIT_40E910_COM_FREE_WORD_MAX = 2,  /* free when word <= 2 (jbe) */
  /* ABI v41: COM release arg/state typed-host laws (PE 0x40e955/0x40e960). */
  ISAAC_EXIT_40E910_COM_RELEASE_ARG = 0xffffffff, /* push -1 before slot+0xc */
  ISAAC_EXIT_40E910_COM_STATE_BITS = 16,    /* movzx word read at obj+4 */
  /* MSVC tree node link offsets used by pure 0x00414a80. */
  ISAAC_EXIT_TREE_LEFT_OFF = 0,
  ISAAC_EXIT_TREE_PARENT_OFF = 4,
  ISAAC_EXIT_TREE_RIGHT_OFF = 8,
  ISAAC_EXIT_TREE_ISNIL_OFF = 0xd,
  /* Exit map walk at Game+0x1a738 (VA 0x006fa457) + find 0x0069d690. */
  ISAAC_EXIT_MAP_1A738_OFF = 0x1a738,
  ISAAC_EXIT_MAP_NODE_KEY_OFF = 0x10,       /* MSVC basic_string key */
  ISAAC_EXIT_MAP_NODE_FLAG_OFF = 0x28,      /* byte flag after key */
  ISAAC_EXIT_MAP_NODE_BEGIN_OFF = 0x44,     /* elem vector begin */
  ISAAC_EXIT_MAP_NODE_END_OFF = 0x48,       /* elem vector end */
  ISAAC_EXIT_MAP_ELEM_STRIDE = 0x20,        /* host 0x0040c7f0 loop step */
  ISAAC_EXIT_MAP_ELEM_HOST_OFF = 0x18,      /* this = elem+0x18 */
  /* MSVC basic_string (x86) relative to string object. */
  ISAAC_EXIT_MSVC_STRING_SIZE_OFF = 0x10,
  ISAAC_EXIT_MSVC_STRING_CAP_OFF = 0x14,
  ISAAC_EXIT_MSVC_STRING_SSO_CAP = 0x10, /* capacity < 0x10 → inline buf */
  /* lower_bound 0x00685bc0 out-triple (walk / bound / best). */
  ISAAC_EXIT_LOWER_BOUND_TRIPLE_SIZE = 12,
  ISAAC_EXIT_LOWER_BOUND_WALK_OFF = 0,
  ISAAC_EXIT_LOWER_BOUND_BOUND_OFF = 4,
  ISAAC_EXIT_LOWER_BOUND_BEST_OFF = 8,
  /* MSVC map: root = [sentinel+4] (header parent). */
  ISAAC_EXIT_MAP_ROOT_FROM_SENTINEL_OFF = 4,
  /* Residual host 0x0040c7f0 (thiscall pair; stack arg). */
  ISAAC_EXIT_40C7F0_ALLOC_SIZE = 0x18,
  ISAAC_EXIT_40C7F0_VTABLE = 0x00b1a6e0u, /* post-ctor overwrite */
  ISAAC_EXIT_40C7F0_ARG_OFF = 0x14,       /* new obj +0x14 ← stack arg */
  ISAAC_EXIT_40C7F0_PAIR_VALUE_OFF = 0,   /* *this ← stack arg */
  ISAAC_EXIT_40C7F0_PAIR_OBJ_OFF = 4,     /* this+4 ← new / null */
  /* Nested ctor 0x0040cc10 pure stores (before DAT_00b81c10 host). */
  ISAAC_EXIT_40CC10_VTABLE = 0x00b1a6fcu,
  ISAAC_EXIT_40CC10_FIELD4 = 0x00010001u,
  ISAAC_EXIT_40CC10_SUB_VTABLE = 0x00b81c0cu, /* this+8 */
  ISAAC_EXIT_40CC10_DEFAULT_INIT = 0x00a15770u, /* DAT_00b81c10 default */
  /* Residual host 0x00408830 (thiscall; stack arg; ret 4). */
  ISAAC_EXIT_408830_FIELD_4_OFF = 4,   /* this+4 ← stack arg */
  ISAAC_EXIT_408830_FIELD_8_OFF = 8,   /* buffer A ptr (free/alloc) */
  ISAAC_EXIT_408830_FIELD_C_OFF = 0xc, /* buffer B ptr (free/alloc) */
  ISAAC_EXIT_408830_FIELD_10_OFF = 0x10,
  ISAAC_EXIT_408830_FIELD_14_OFF = 0x14,
  ISAAC_EXIT_408830_FIELD_18_OFF = 0x18,
  ISAAC_EXIT_408830_FIELD_1C_OFF = 0x1c,
  /* Counts on the arg object at this+4 (when non-null). */
  ISAAC_EXIT_408830_ARG_COUNT_A_OFF = 0x1c, /* → alloc into this+8 */
  ISAAC_EXIT_408830_ARG_COUNT_B_OFF = 0x24, /* → alloc into this+0xc */
  ISAAC_EXIT_408830_ELEM_SIZE = 4,          /* dword elements */
  ISAAC_EXIT_408830_F32_10_BITS = 0xbf800000u, /* -1.0f @ this+0x10 */
  ISAAC_EXIT_408830_FILL_BYTE = 0xff,       /* memset fill imm */
  /* Residual keep-set host 0x00408970 (thiscall; stack arg; ret 4).
     Same AnimationState object layout as 0x408830. */
  ISAAC_EXIT_408970_FIELD_4_OFF = 4,   /* this+4 ← stack arg (terminal) */
  ISAAC_EXIT_408970_FIELD_8_OFF = 8,   /* buffer A (and PE B-realloc store) */
  ISAAC_EXIT_408970_FIELD_C_OFF = 0xc, /* buffer B */
  ISAAC_EXIT_408970_ARG_COUNT_A_OFF = 0x1c,
  ISAAC_EXIT_408970_ARG_COUNT_B_OFF = 0x24,
  ISAAC_EXIT_408970_ELEM_SIZE = 4,
  ISAAC_EXIT_408970_FILL_BYTE = 0xff,
  /* Heap-accounting free stats base select (PE @ 0x00408a71 / 0x408b39). */
  ISAAC_EXIT_408970_HEAP_STATS_GLOBAL = 0x00c7de78u, /* DAT_00c7de78 */
  ISAAC_EXIT_408970_HEAP_STATS_DELTA = 0x30,         /* when global != 0 */
  ISAAC_EXIT_408970_HEAP_STATS_FALLBACK = 0x00c7f618u,
  /* Residual host 0x009b4810 (thiscall; this = 9b5cb0+0x5b0). */
  ISAAC_EXIT_9B4810_THIS_FROM_9B5CB0 = 0x5b0,
  ISAAC_EXIT_9B4810_THIS_FROM_GAME = 0x24024, /* 0x23a74+0x5b0 */
  ISAAC_EXIT_9B4810_MODE_OFF = 0,
  ISAAC_EXIT_9B4810_FIELD_4_OFF = 4,   /* byte ← 0 terminal */
  ISAAC_EXIT_9B4810_FIELD_8_OFF = 8,   /* dword ← 0 terminal */
  ISAAC_EXIT_9B4810_FIELD_C_OFF = 0xc, /* copied → +0x14 */
  ISAAC_EXIT_9B4810_FIELD_10_OFF = 0x10, /* copied → +0x18 */
  ISAAC_EXIT_9B4810_FIELD_14_OFF = 0x14,
  ISAAC_EXIT_9B4810_FIELD_18_OFF = 0x18,
  ISAAC_EXIT_9B4810_FIELD_1C_OFF = 0x1c, /* ← DAT_00c7b640 */
  ISAAC_EXIT_9B4810_FIELD_20_OFF = 0x20, /* ← DAT_00c7b644 */
  ISAAC_EXIT_9B4810_ANM2_24_OFF = 0x24,  /* host GetLayer / ReplaceSpritesheet */
  ISAAC_EXIT_9B4810_LAYER_COUNT_OFF = 0xa4,
  ISAAC_EXIT_9B4810_ANM2_138_OFF = 0x138, /* host Load / Play / Rewind */
  ISAAC_EXIT_9B4810_STR_16C_OFF = 0x16c,  /* Counter string object ptr */
  ISAAC_EXIT_9B4810_BYTE_17C_OFF = 0x17c, /* play-skip gate + post-Rewind flag */
  ISAAC_EXIT_9B4810_FIELD_24C_OFF = 0x24c,
  ISAAC_EXIT_9B4810_FIELD_250_OFF = 0x250,
  ISAAC_EXIT_9B4810_FIELD_254_OFF = 0x254,
  ISAAC_EXIT_9B4810_VEC_BEGIN_OFF = 0x27c,
  ISAAC_EXIT_9B4810_VEC_END_OFF = 0x280,
  ISAAC_EXIT_9B4810_VEC_CAP_OFF = 0x284,
  ISAAC_EXIT_9B4810_ELEM_SIZE = 4,
  /* Terminal float bits (same immediates as Exit post-log pack). */
  /* ABI v31: these were literals (0x3760371c / 0x37873770) claiming to be
     "DAT_00c7b640 / DAT_00c7b644". They are NOT constants — see
     ISAAC_EXIT_F32_GLOBAL_C7B640_ADDR. The PE loads them at RUNTIME. */
  /* Post-Rewind pure store relative to ANM2 at +0x138 (= this+0x17c). */
  ISAAC_EXIT_9B4810_PLAY_FLAG_OFF = 0x44,
  ISAAC_EXIT_9B4810_PLAY_FLAG_VALUE = 1,
  /* Id-table block sizes (PE-ordered push sequences). */
  ISAAC_EXIT_9B4810_BLOCK_A_COUNT = 7, /* 2,3,4,6,7,8,0xf when mode!=3 */
  ISAAC_EXIT_9B4810_BLOCK_B_COUNT = 3, /* 9,0xb,0xc always */
  ISAAC_EXIT_9B4810_BLOCK_C_COUNT = 1, /* 0xd when mode!=3 */
  ISAAC_EXIT_9B4810_BLOCK_D_COUNT = 1, /* 0xe always */
  ISAAC_EXIT_9B4810_BLOCK_E_COUNT = 3, /* 0x10,0x11,0x14 when mode!=3 */
  ISAAC_EXIT_9B4810_BLOCK_F_COUNT = 7, /* 0x15..0x1b when mode!=1 */
  ISAAC_EXIT_9B4810_VALUE_1C = 0x1c,
  /* Residual vector grow 0x00428590 (dword vector; freestanding pure CF). */
  ISAAC_EXIT_428590_ELEM_SIZE = 4,
  ISAAC_EXIT_428590_MAX_ELEMS = 0x3fffffffu, /* PE cmp size, 0x3fffffff */
  ISAAC_EXIT_428590_FREE_HEADER_THRESHOLD = 0x1000,
  ISAAC_EXIT_428590_FREE_HEADER_ADD = 0x23,
  ISAAC_EXIT_428590_FREE_HEADER_OFFSET_MAX = 0x1f,
  /* Exact ANM2::GetLayer(int) @ 0x0040b220 / ANM2::Load @ 0x0040bd50. */
  ISAAC_EXIT_ANM2_LAYER_BASE_OFF = 0x7c,   /* dword layer array base */
  ISAAC_EXIT_ANM2_LAYER_COUNT_OFF = 0x80,  /* signed/unsigned count */
  ISAAC_EXIT_ANM2_LAYER_STRIDE = 0xa0,     /* lea [id+id*4]; shl 5 */
  ISAAC_EXIT_ANM2_NAME_CAP_OFF = 0x14,     /* MSVC string cap on ANM2 this */
  ISAAC_EXIT_ANM2_PATH_SIZE_OFF = 0x10,    /* Load: nonzero → host 0x40e2b0 */
  ISAAC_EXIT_ANM2_LOAD_408830_A_OFF = 0x30,
  ISAAC_EXIT_ANM2_LOAD_408830_B_OFF = 0x50,
  ISAAC_EXIT_ANM2_LOAD_FLAG_109_OFF = 0x109,
  ISAAC_EXIT_ANM2_LOAD_FLAG_109_VALUE = 1,
  ISAAC_EXIT_ANM2_SHADOW_INDEX_OFF = 0x10c, /* ← -1 then matching layer idx */
  ISAAC_EXIT_ANM2_SHADOW_INDEX_INIT = 0xffffffffu,
  ISAAC_EXIT_ANM2_FLAGS_110_OFF = 0x110,
  ISAAC_EXIT_ANM2_LAYER_NAME_HOLDER_OFF = 0, /* *[layer+0]; null → empty */
  ISAAC_EXIT_ANM2_LAYER_NAME_STR_DELTA = 8,  /* holder+8 = MSVC string */
  ISAAC_EXIT_ANM2_LAYER_STAR_FLAGS_OFF = 0x8c,
  ISAAC_EXIT_ANM2_LAYER_STAR_OR = 5,         /* or [layer+0x8c], 5 */
  ISAAC_EXIT_ANM2_STAR_GLOBAL_OR_400 = 0x400, /* or [anm2+0x110], 0x400 */
  ISAAC_EXIT_ANM2_STAR_GLOBAL_OR_800 = 0x800, /* sheet loop or 0x800 */
  ISAAC_EXIT_ANM2_SHEET_BASE_OFF = 0x84,
  ISAAC_EXIT_ANM2_SHEET_COUNT_OFF = 0x88,
  ISAAC_EXIT_ANM2_SHEET_STRIDE = 0x18,
  ISAAC_EXIT_ANM2_STAR_BYTE = 0x2a, /* '*' */
  /* Nested sized alloc 0x0040cf00 (size in ECX; used by 0x428590 grow). */
  ISAAC_EXIT_40CF00_HEADER_THRESHOLD = 0x1000,
  ISAAC_EXIT_40CF00_HEADER_ADD = 0x23,
  ISAAC_EXIT_40CF00_ALIGN_MASK = 0xffffffe0u, /* (raw+0x23) & ~0x1f */
  /* Exact ANM2::ReplaceSpritesheet @ 0x0040bf30. */
  ISAAC_EXIT_ANM2_LAYER_PNG_STR_OFF = 8, /* MSVC string at layer+8 */
  ISAAC_EXIT_ANM2_LAYER_FLAG30_OFF = 0x30, /* byte ← 0 on success */
  /* Play-by-name residual 0x0040a5d0 (SetAnimation-like; no exact ZHL). */
  ISAAC_EXIT_ANM2_ANIM_BASE_OFF = 0x74,  /* AnimationData* table */
  ISAAC_EXIT_ANM2_ANIM_COUNT_OFF = 0x78, /* unsigned count */
  ISAAC_EXIT_ANM2_ANIM_STRIDE = 0x13c,   /* per-anim element size */
  ISAAC_EXIT_ANM2_PLAY_STATE_OFF = 0x30, /* AnimationState this for hosts */
  /* Exact AnimationState::Rewind @ 0x0040a1b0 (+ nested 0x00408c90). */
  ISAAC_EXIT_ANIMSTATE_ANIM_OFF = 4,       /* AnimationData* */
  ISAAC_EXIT_ANIMSTATE_LAYER_ARR_OFF = 8,   /* dword* layer slots */
  ISAAC_EXIT_ANIMSTATE_NULL_ARR_OFF = 0xc,  /* dword* null slots */
  ISAAC_EXIT_ANIMSTATE_FRAME_OFF = 0x10,    /* float current frame */
  ISAAC_EXIT_ANIMSTATE_MASK18_OFF = 0x18,   /* event bitset A */
  ISAAC_EXIT_ANIMSTATE_MASK1C_OFF = 0x1c,   /* event bitset B */
  ISAAC_EXIT_ANIMDATA_LAYER_COUNT_OFF = 0x1c,
  ISAAC_EXIT_ANIMDATA_NULL_COUNT_OFF = 0x24,
  ISAAC_EXIT_ANIMDATA_EVENT_BASE_OFF = 0x28,  /* {bit,frame_i32}* */
  ISAAC_EXIT_ANIMDATA_EVENT_COUNT_OFF = 0x2c,
  ISAAC_EXIT_ANIM_EVENT_STRIDE = 8,
  ISAAC_EXIT_ANIM_EVENT_BIT_OFF = 0,
  ISAAC_EXIT_ANIM_EVENT_FRAME_OFF = 4,
  /* Residual MSVC basic_string assign 0x0040ccd0. */
  ISAAC_EXIT_40CCD0_MAX_SIZE = 0x7fffffffu, /* length-error cmp imm */
  ISAAC_EXIT_40CCD0_ALIGN_OR = 0xfu,       /* new_cap = count | 0xf */
  ISAAC_EXIT_40CCD0_FREE_HEADER_THRESHOLD = 0x1000,
  ISAAC_EXIT_40CCD0_FREE_HEADER_ADD = 0x23,
  ISAAC_EXIT_40CCD0_FREE_HEADER_OFFSET_MAX = 0x1f,
  /* Residual Load nested 0x0040db90 (stdcall path*, anm2*; ret 8). */
  ISAAC_EXIT_40DB90_PATH_SIZE_OFF = 0x10, /* early return when 0 */
  ISAAC_EXIT_40DB90_TIMING_MUL_LO = 0xd7b634dbu,
  ISAAC_EXIT_40DB90_TIMING_MUL_HI = 0x431bde82u,
  ISAAC_EXIT_40DB90_TIMING_SHIFT = 0x12, /* shrd/shr 18 on product high */
  ISAAC_EXIT_40DB90_CACHE_MIN_SPACE = 4, /* end-begin jae 4 */
  ISAAC_EXIT_40DB90_CACHE_PTR_STRIDE = 4,
  ISAAC_EXIT_40DB90_NODE_ISNIL_OFF = 0xd,
  ISAAC_EXIT_40DB90_NODE_KEY_OFF = 0x10,
  ISAAC_EXIT_40DB90_NODE_FLAG14_OFF = 0x14,
  ISAAC_EXIT_40DB90_NODE_LAYERS_OFF = 0x18,
  ISAAC_EXIT_40DB90_NODE_COUNT_OFF = 0x1c,
  ISAAC_EXIT_40DB90_NODE_FIELD20_OFF = 0x20,
  ISAAC_EXIT_40DB90_NODE_FIELD24_OFF = 0x24,
  ISAAC_EXIT_40DB90_NODE_FIELD28_OFF = 0x28,
  ISAAC_EXIT_40DB90_NODE_FIELD2C_OFF = 0x2c,
  ISAAC_EXIT_40DB90_NODE_FIELD30_OFF = 0x30,
  ISAAC_EXIT_40DB90_NODE_FIELD34_OFF = 0x34,
  ISAAC_EXIT_40DB90_NODE_NAME_OFF = 0x38, /* MSVC string → anm2+0x18 */
  ISAAC_EXIT_40DB90_ANM2_NAME_OFF = 0x18,
  ISAAC_EXIT_40DB90_ANM2_LAYER_BASE_OFF = 0x7c,
  ISAAC_EXIT_40DB90_ANM2_LAYER_COUNT_OFF = 0x80,
  ISAAC_EXIT_40DB90_ANM2_FIELD74_OFF = 0x74,
  ISAAC_EXIT_40DB90_ANM2_FIELD78_OFF = 0x78,
  ISAAC_EXIT_40DB90_ANM2_FIELD84_OFF = 0x84,
  ISAAC_EXIT_40DB90_ANM2_FIELD88_OFF = 0x88,
  ISAAC_EXIT_40DB90_ANM2_FIELD8C_OFF = 0x8c,
  ISAAC_EXIT_40DB90_ANM2_FIELD90_OFF = 0x90,
  ISAAC_EXIT_40DB90_LAYER_STRIDE = 0xa0,     /* dst layer element */
  ISAAC_EXIT_40DB90_SRC_LAYER_STRIDE = 0x38, /* cache node layer element */
  ISAAC_EXIT_40DB90_LAYER_BACKPTR_OFF = 4,   /* [dst+4] ← anm2 */
  ISAAC_EXIT_40DB90_HEADER_SIZE = 4,         /* count dword before user ptr */
  /* Heap-accounting free (same DAT as keep-set 0x408970). */
  ISAAC_EXIT_40DB90_HEAP_STATS_GLOBAL = 0x00c7de78u,
  ISAAC_EXIT_40DB90_HEAP_STATS_DELTA = 0x30,
  ISAAC_EXIT_40DB90_HEAP_STATS_FALLBACK = 0x00c7f618u,
  /* Evidence imms (not live-loaded by pure helpers). */
  ISAAC_EXIT_40DB90_CACHE_BEGIN_ADDR = 0x00c798b8u,
  ISAAC_EXIT_40DB90_CACHE_END_ADDR = 0x00c798bcu,
  ISAAC_EXIT_40DB90_TREE_SENTINEL_ADDR = 0x00c78ee0u,
  ISAAC_EXIT_40DB90_TIMING_ACCUM_ADDR = 0x00c79c40u,
  /* Residual Load sibling 0x0040e110 (stdcall path*; ret 4). Same cache
     list / sentinel as 0x40db90. */
  ISAAC_EXIT_40E110_CACHE_BEGIN_ADDR = 0x00c798b8u,
  ISAAC_EXIT_40E110_CACHE_END_ADDR = 0x00c798bcu,
  ISAAC_EXIT_40E110_CACHE_CAP_ADDR = 0x00c798c0u,
  ISAAC_EXIT_40E110_TREE_SENTINEL_ADDR = 0x00c78ee0u,
  ISAAC_EXIT_40E110_CACHE_SPACE_MASK = 0xfffffffcu, /* test size,~3 */
  ISAAC_EXIT_40E110_CACHE_PTR_STRIDE = 4,
  ISAAC_EXIT_40E110_PATH_BUF_SIZE = 0x100, /* IAT canonicalize buf imm */
  ISAAC_EXIT_40E110_PATH_CAP_OFF = 0x14,   /* MSVC string capacity */
  ISAAC_EXIT_40E110_PATH_SSO_CAP = 0x10,
  ISAAC_EXIT_40E110_NODE_ISNIL_OFF = 0xd,
  ISAAC_EXIT_40E110_NODE_KEY_OFF = 0x10,
  ISAAC_EXIT_40E110_NODE_REFCOUNT_OFF = 0x50, /* pure inc on hit */
  ISAAC_EXIT_40E110_GROW_TRIPLE_DWORDS = 3,
  /* Residual ANM2 graphics walk 0x0040c000 (thiscall anm2*; ret 4). */
  ISAAC_EXIT_40C000_ANM2_LAYER_BASE_OFF = 0x7c,
  ISAAC_EXIT_40C000_ANM2_LAYER_COUNT_OFF = 0x80,
  ISAAC_EXIT_40C000_LAYER_STRIDE = 0xa0,
  ISAAC_EXIT_40C000_LAYER_PNG_STR_OFF = 0x8,  /* MSVC string at layer+8 */
  ISAAC_EXIT_40C000_LAYER_FLAG30_OFF = 0x30,  /* skip when non-zero */
  ISAAC_EXIT_40C000_LAYER_FLAG31_OFF = 0x31,  /* pure clear after body */
  ISAAC_EXIT_40C000_PATH_CAP_OFF = 0x14,
  ISAAC_EXIT_40C000_PATH_SSO_CAP = 0x10,
  ISAAC_EXIT_40C000_CALLBACK_GLOBAL = 0x00c7163cu, /* DAT_00c7163c */
  ISAAC_EXIT_40C000_SPRITE_FIELD_44_OFF = 0x44, /* host path from 408590 */
  /* Pure-complete freestanding 0x0040c1e0 (thiscall; ret). */
  ISAAC_EXIT_40C1E0_FIELD0_VALUE = 0xffffffffu, /* -1 */
  ISAAC_EXIT_40C1E0_FIELD_C_VALUE = 1,
  /* Residual layer-attach 0x00408640 (thiscall layer*; stack src,ctrl; ret 8). */
  ISAAC_EXIT_408640_DST_FIELD_OFF = 0x20, /* layer+0x20 ← four dwords */
  ISAAC_EXIT_408640_SRC_FIELD_OFF = 0x30, /* src+0x30 source pack */
  ISAAC_EXIT_408640_FIELD_DWORDS = 4,
  ISAAC_EXIT_408640_PAIR_SLOT_OFF = 0x98, /* SmartPointer swap this */
  ISAAC_EXIT_408640_CALLBACK_GLOBAL = 0x00c7163cu, /* DAT_00c7163c */
  ISAAC_EXIT_408640_VTBL_RELEASE_OFF = 0xc, /* virtual[3] COM release */
  /* Per-slot HUD residual 0x00841cf0 (thiscall; no stack args; ret).
     Called ×8 at this + i*0x6dc from both 0x009a19a0 and 0x009a27d0. */
  ISAAC_EXIT_841CF0_HEAD_DWORD_OFF = 0xa, /* unaligned dword ← 0 */
  ISAAC_EXIT_841CF0_HEAD_BYTE_OFF = 0xe,  /* byte ← 0 */
  ISAAC_EXIT_841CF0_HEAD_ZERO_BYTES = 5,  /* +0xa..+0xe inclusive */
  ISAAC_EXIT_841CF0_P0_BASE_OFF = 0x10,
  ISAAC_EXIT_841CF0_P0_COUNT = 0x18, /* mov ecx, 0x18 */
  ISAAC_EXIT_841CF0_P0_STRIDE = 0x10,
  ISAAC_EXIT_841CF0_P0_VALUE_OFF = 0,   /* dword ← 0 (stored first) */
  ISAAC_EXIT_841CF0_P0_FLAG_OFF = 4,    /* byte ← 0 (stored last) */
  ISAAC_EXIT_841CF0_P0_PTR_A_OFF = 8,   /* dword ← 0x00b1a4ec */
  ISAAC_EXIT_841CF0_P0_PTR_B_OFF = 0xc, /* dword ← 0x00b1a4ec */
  /* rdata immediate; the dword at 0x00b1a4ec is 0 (empty C string just
     before "id out of bounds\n"). Recorded as an address, not a name. */
  ISAAC_EXIT_841CF0_P0_PTR_VALUE = 0x00b1a4ecu,
  ISAAC_EXIT_841CF0_P1_BASE_OFF = 0x200,
  ISAAC_EXIT_841CF0_P1_COUNT = 2,
  ISAAC_EXIT_841CF0_P1_STRIDE = 0x18,
  ISAAC_EXIT_841CF0_P1_HOST_OFF = 8, /* host 0x0040c7f0(0) this = elem+8 */
  ISAAC_EXIT_841CF0_P2_BASE_OFF = 0x190,
  ISAAC_EXIT_841CF0_P2_COUNT = 4,
  ISAAC_EXIT_841CF0_P2_STRIDE = 0x1c,
  ISAAC_EXIT_841CF0_P2_HOST_A_OFF = 8,   /* pair gate + host this */
  ISAAC_EXIT_841CF0_P2_HOST_B_OFF = 0x10,/* pair gate + host this */
  ISAAC_EXIT_841CF0_P2_TAIL_OFF = 0x18,  /* dword ← 0 */
  ISAAC_EXIT_841CF0_VEC_BEGIN_OFF = 0x6a0,
  ISAAC_EXIT_841CF0_VEC_END_OFF = 0x6a4,
  ISAAC_EXIT_841CF0_VEC_ELEM_STRIDE = 0xc,
  ISAAC_EXIT_841CF0_VEC_ELEM_HOST_OFF = 4, /* host 0x0040c7f0(0) this */
  ISAAC_EXIT_841CF0_WORD_6AC_OFF = 0x6ac,  /* word ← 0 */
  ISAAC_EXIT_841CF0_HOST_6B0_OFF = 0x6b0,  /* host 0x0040c7f0(0) */
  ISAAC_EXIT_841CF0_HOST_6CC_OFF = 0x6cc,  /* host 0x0040c7f0(0) */
  ISAAC_EXIT_841CF0_TERMINAL_OFF = 0,      /* dword ← 0 (last store) */
  /* Residual 0x0083abb0 (thiscall; ret; this = 9a19a0/9a27d0 +0x5c54). */
  ISAAC_EXIT_83ABB0_BLOCK_COUNT = 2,
  ISAAC_EXIT_83ABB0_BLOCK_STRIDE = 0x14,
  ISAAC_EXIT_83ABB0_FIELD0_OFF = 0,   /* dword ← 0 (stored last) */
  ISAAC_EXIT_83ABB0_FLAG4_OFF = 4,    /* byte ← 0 */
  ISAAC_EXIT_83ABB0_VEC_BEGIN_OFF = 8,
  ISAAC_EXIT_83ABB0_VEC_END_OFF = 0xc,
  ISAAC_EXIT_83ABB0_ELEM_STRIDE = 0x28,
  ISAAC_EXIT_83ABB0_ELEM_HOST_OFF = 4, /* host 0x0040c7f0(0) this */
  ISAAC_EXIT_83ABB0_TERMINAL_OFF = 0x28, /* byte ← 0 */
  /* Shared range COM destroy hosts 0x00709380 (elements stride 0xc, from
     0x00841cf0) and 0x00709300 (stride 0x28, from 0x0083abb0). Identical
     bodies: SEH frame, ctrl at elem+8, callback arg elem+4. */
  ISAAC_EXIT_RANGE_DESTROY_CTRL_OFF = 8,
  ISAAC_EXIT_RANGE_DESTROY_CB_ARG_OFF = 4,
  ISAAC_EXIT_RANGE_DESTROY_VTBL_RELEASE_OFF = 0xc,
  ISAAC_EXIT_RANGE_DESTROY_CALLBACK_GLOBAL = 0x00c7163cu,
  ISAAC_EXIT_709380_ELEM_STRIDE = 0xc,
  ISAAC_EXIT_709300_ELEM_STRIDE = 0x28,
  /* Pure-complete tail-jmp 0x0084bfd0 (thiscall; ret; this = 9a19a0 /
     9a27d0 this + 0x59a4 = Game+0x233a8). */
  ISAAC_EXIT_84BFD0_THIS_FROM_9A19A0 = 0x59a4,
  ISAAC_EXIT_84BFD0_THIS_FROM_GAME = 0x233a8,
  ISAAC_EXIT_84BFD0_BLOCK_COUNT = 2,
  ISAAC_EXIT_84BFD0_BLOCK_STRIDE = 0xcc,
  ISAAC_EXIT_84BFD0_BASE_OFF = 0x114,
  ISAAC_EXIT_84BFD0_BLOCK_DWORDS = 51,
  ISAAC_EXIT_84BFD0_ELEM_DWORDS = 5,
  ISAAC_EXIT_84BFD0_ELEM_COUNT = 10,
  ISAAC_EXIT_84BFD0_FLOAT_ELEM_FIRST = 6, /* elements 6..9 get 0.1f */
  ISAAC_EXIT_84BFD0_F32_BITS = 0x3dcccccdu, /* 0.1f */
  ISAAC_EXIT_84BFD0_TERMINAL_OFF = 0x2ac,   /* byte ← 0 */
  ISAAC_EXIT_84BFD0_SLOT_ZERO = 0,
  ISAAC_EXIT_84BFD0_SLOT_SKIP = 1,
  ISAAC_EXIT_84BFD0_SLOT_FLOAT = 2,
  /* Slot triple inside 0x009a27d0: base = this + 0x3cdc + i*0x1f4.
     +0 host 0x00840f70 · +8 pure flag · +0x18 host 0x00709150 ·
     +0x20 host exact ANM2::Reset. (Also mirrored above as the v7 names.) */
  ISAAC_EXIT_9A27D0_SLOT_TRIPLE_STRIDE = 0x1f4,
  /* ABI v41: per-slot decision laws around the slot triples. Receivers are
     this-relative and stride with the slot: base (0x00840f70) =
     0x3cdc + i*0x1f4; flag = base+8; 0x00709150 = base+0x18; ANM2::Reset =
     base+0x20. The push ecx before 0x00709150 holds the ANM2::Reset receiver
     of the same slot (lea ecx,[esi+8] survives into the push); the body
     never reads it (v26) but the value is deterministic. */
  ISAAC_EXIT_9A27D0_SLOT_709150_BASE_OFF = 0x3cf4, /* base + 0x18 */
  ISAAC_EXIT_9A27D0_SLOT_RESET_BASE_OFF = 0x3cfc,  /* base + 0x20 */
  /* Loop segmentation of the 11 slots: slot 0 direct block, slots 1..6 in
     the 6-iteration loop (esi starts this+0x3ee8 @ 0x009a28ce), slots 7..10
     in the 4-iteration loop (esi starts this+0x4aa0 @ 0x009a2907). */
  ISAAC_EXIT_9A27D0_SLOT_LOOP1_COUNT = 6,
  ISAAC_EXIT_9A27D0_SLOT_LOOP2_COUNT = 4,
  ISAAC_EXIT_9A27D0_SLOT_LOOP1_START_ESI = 0x3ee8,
  ISAAC_EXIT_9A27D0_SLOT_LOOP2_START_ESI = 0x4aa0,
  /* Buffer-free residual 0x00840f70 (thiscall; no stack args; ret). */
  ISAAC_EXIT_840F70_SLOT_COUNT = 2,   /* cmp esi, 2; jl */
  ISAAC_EXIT_840F70_SLOT_STRIDE = 4,  /* [edi + esi*4] */
  ISAAC_EXIT_840F70_HEADER_DELTA = 4, /* size dword at ptr-4; free(ptr-4) */
  ISAAC_EXIT_840F70_HEAP_STATS_GLOBAL = 0x00c7de78u,
  ISAAC_EXIT_840F70_HEAP_STATS_DELTA = 0x30,
  ISAAC_EXIT_840F70_HEAP_STATS_FALLBACK = 0x00c7f618u,
  ISAAC_EXIT_840F70_STATS_LO_OFF = 0, /* sub  [edx], eax */
  ISAAC_EXIT_840F70_STATS_HI_OFF = 4, /* sbb  [edx+4], 0 */
  /* IAT slot loaded once into ebx: api-ms-win-crt-heap-l1-1-0.dll!free.
     Evidence: PE import directory; host action, never translated. */
  ISAAC_EXIT_840F70_FREE_IAT_SLOT = 0x00b187dcu,
  /* Pair replace residual 0x00709150 (thiscall; unused stack arg; ret 4). */
  ISAAC_EXIT_709150_ALLOC_SIZE = 0x18,        /* push 0x18; call 0xa0f4c0 */
  ISAAC_EXIT_709150_VTABLE = 0x00b67f98u,     /* post-ctor overwrite */
  ISAAC_EXIT_709150_FIELD_14_OFF = 0x14,      /* new object +0x14 ← 0 */
  ISAAC_EXIT_709150_PAIR_VALUE_OFF = 0,       /* *this ← 0 (immediate) */
  ISAAC_EXIT_709150_PAIR_OBJ_OFF = 4,         /* this+4 ← new / null */
  ISAAC_EXIT_709150_CALLBACK_GLOBAL = 0x00c71644u, /* NOT DAT_00c7163c */
  ISAAC_EXIT_709150_VTBL_RELEASE_OFF = 0xc,   /* virtual[3] COM release */
  ISAAC_EXIT_709150_STACK_ARG_BYTES = 4,      /* ret 4; arg never read */
  /* Teardown residual 0x00a1ad90 (thiscall; no stack args; ret). */
  ISAAC_EXIT_A1AD90_BLOCK_A_OFF = 0x28,   /* pointer freed via 0xa648b0 */
  ISAAC_EXIT_A1AD90_BLOCK_B_OFF = 0x3c,   /* counted array base */
  ISAAC_EXIT_A1AD90_HEADER_DELTA = 4,     /* count dword at arr-4 */
  ISAAC_EXIT_A1AD90_ELEM_SIZE = 8,        /* push 8 to the dtor iterator */
  ISAAC_EXIT_A1AD90_ELEM_DTOR = 0x0040c440u, /* pushed fn ptr */
  ISAAC_EXIT_A1AD90_FREE_SIZE_ADD = 4,    /* lea eax,[eax*8+4] */
  ISAAC_EXIT_A1AD90_TREE_OFF = 0x40,      /* MSVC tree object (_Myhead) */
  ISAAC_EXIT_A1AD90_TREE_SIZE_OFF = 0x44, /* _Mysize ← 0 */
  ISAAC_EXIT_A1AD90_TERMINAL_BYTE_OFF = 0, /* BYTE store, not dword */
  ISAAC_EXIT_A1AD90_TERMINAL_24_OFF = 0x24,
  ISAAC_EXIT_A1AD90_TERMINAL_38_OFF = 0x38,
  ISAAC_EXIT_A1AD90_HOST_A_NEEDED_BIT = 1, /* _apply_this result bit 0 */
  ISAAC_EXIT_A1AD90_HOST_B_NEEDED_BIT = 2, /* _apply_this result bit 1 */
  /* Recovered call shape of host 0x00a648b0 (body stays host). */
  ISAAC_EXIT_A648B0_MODE_MASK = 0xff, /* movzx eax, cl — LOW BYTE only */
  ISAAC_EXIT_A648B0_MODE_FREE = 1,    /* mode 1: free the EDX pointer */
  ISAAC_EXIT_A648B0_HEADER_DELTA = 4, /* size dword at EDX-4 */
  ISAAC_EXIT_A648B0_HEAP_STATS_GLOBAL = 0x00c7de78u,
  ISAAC_EXIT_A648B0_HEAP_STATS_DELTA = 0x30,
  ISAAC_EXIT_A648B0_HEAP_STATS_FALLBACK = 0x00c7f618u,
  ISAAC_EXIT_A648B0_FREE_IAT_SLOT = 0x00b187dcu, /* same import as 0x840f70 */
  /* ABI v43: decision laws of the host body (mode 2 stats-add path).
     PE @ 0x00a648d9/0x00a648e6: mov eax,[0xc7f618]; add [edi+0x30],eax;
     mov eax,[0xc7f61c]; adc [edi+0x34],eax — edi = [0xc7de78] DIRECTLY,
     so mode 2 has NO fallback base (the esi select with the 0xc7f618
     fallback exists only for the mode-1 free path). */
  ISAAC_EXIT_A648B0_MODE_STATS = 2,   /* mode 2: accumulate current stats */
  ISAAC_EXIT_A648B0_MODE2_BASE_OFF = 0x30, /* [g+0x30]/[g+0x34] accounting */
  ISAAC_EXIT_A648B0_MODE2_ADDEND_LO_VA = 0x00c7f618u, /* mov eax,[imm] */
  ISAAC_EXIT_A648B0_MODE2_ADDEND_HI_VA = 0x00c7f61cu,
  /* ABI v44: fully pure thiscall predicate 0x006f0040 (band-scan find).
     Body 0x006f0040..0x006f0066 (39 B), 12 insns, 0 E8 / 0 indirect /
     0 stores; int3 pad 0x006f0067..0x006f006f; next fn 0x006f0070.
     identify-zhl empty (address-stable). 4 direct rel32 callers
     (0x789774 / 0x791ac2 / 0x791bb8 / 0x7a3e6c — corrected capstone
     census; the old manual lea skip undercounted). */
  ISAAC_EXIT_6F0040_VA = 0x006f0040u,
  ISAAC_EXIT_6F0040_BODY_BYTES = 0x27,      /* 39; terminal ret 0x006f0066 */
  ISAAC_EXIT_6F0040_PTR_OFF = 0x1e68,       /* mov eax,[ecx+0x1e68]  @0x6f0040 */
  ISAAC_EXIT_6F0040_COUNT_OFF = 0x161c,     /* mov edx,[eax+0x161c] @0x6f004a;
                                               cmp edx,[ecx+0x161c] @0x6f0055 */
  ISAAC_EXIT_6F0040_INVALID_COUNT = 0xffffffffu, /* cmp edx,-1 @0x6f0050 */
  ISAAC_EXIT_6F0040_CALLERS = 4,            /* corrected rel32 census */
  /* ABI v45: fully pure static membership predicate 0x0071df80 (band
     re-scan find). Body 0x0071df80..0x0071dfbf (64 B, 0x40, TWO rets:
     false 0x0071dfbb / true 0x0071dfbe), 0 E8 / 0 indirect / 0 stores;
     int3 predecessor 0x0071df70; next fn 0x0071dfbf. identify-zhl empty
     (address-stable). 2 direct rel32 callers image-wide (0x0071ead7 /
     0x0071ebda — entity machinery that also calls ANM2 Load/Play/Rewind,
     hud 0x771550, playerhud 0x7706e0, frame-effect 0x6fe410).
     Reads Game global DAT_00c71678 -> Game+0x18300 (Game::_room) ->
     room+0x1d18 (room STATE id) and tests membership in the 8-state set
     below with FULL-dword cmp eax, imm gates. */
  ISAAC_EXIT_71DF80_VA = 0x0071df80u,
  ISAAC_EXIT_71DF80_BODY_BYTES = 0x40,      /* 64; terminal ret 0x0071dfbe */
  ISAAC_EXIT_71DF80_GAME_DAT = 0x00c71678u, /* mov eax,[0xc71678] @0x71df80 */
  ISAAC_EXIT_71DF80_ROOM_OFF = 0x18300,     /* mov eax,[eax+0x18300] @0x71df85
                                               = ZHL Game::_room */
  ISAAC_EXIT_71DF80_STATE_OFF = 0x1d18,     /* mov eax,[eax+0x1d18] @0x71df8b */
  ISAAC_EXIT_71DF80_STATE_0A = 0x0a,        /* cmp eax,0xa / je @0x71df91 */
  ISAAC_EXIT_71DF80_STATE_0B = 0x0b,        /* cmp eax,0xb / je @0x71df96 */
  ISAAC_EXIT_71DF80_STATE_0C = 0x0c,        /* cmp eax,0xc / je @0x71df9b */
  ISAAC_EXIT_71DF80_STATE_0D = 0x0d,        /* cmp eax,0xd / je @0x71dfa0 */
  ISAAC_EXIT_71DF80_STATE_22 = 0x22,        /* cmp eax,0x22 / je @0x71dfa5 */
  ISAAC_EXIT_71DF80_STATE_2B = 0x2b,        /* cmp eax,0x2b / je @0x71dfaa */
  ISAAC_EXIT_71DF80_STATE_2C = 0x2c,        /* cmp eax,0x2c / je @0x71dfaf */
  ISAAC_EXIT_71DF80_STATE_30 = 0x30,        /* cmp eax,0x30 / je @0x71dfb4 */
  ISAAC_EXIT_71DF80_CALLERS = 2,            /* corrected rel32 census */
  /* Pair CONSTRUCTOR 0x0040c4a0 (thiscall; stack arg; ret 4; returns this).
     Sibling of assignment 0x0040c7f0 (v12) — see the differences above. */
  ISAAC_EXIT_40C4A0_ALLOC_SIZE = 0x18,
  ISAAC_EXIT_40C4A0_VTABLE = 0x00b1a6e0u, /* same as 0x0040c7f0 */
  ISAAC_EXIT_40C4A0_ARG_OFF = 0x14,       /* new obj +0x14 ← stack arg */
  ISAAC_EXIT_40C4A0_PAIR_VALUE_OFF = 0,
  ISAAC_EXIT_40C4A0_PAIR_OBJ_OFF = 4,
  ISAAC_EXIT_40C4A0_CALLBACK_GLOBAL = 0x00c7163cu, /* NOT 0x00c71644 */
  ISAAC_EXIT_40C4A0_VTBL_RELEASE_OFF = 0xc,
  ISAAC_EXIT_40C4A0_STACK_ARG_BYTES = 4,
  /* Recursive tree _Erase 0x00415800 (thiscall ctx; stack base + node;
     ret 8). Same node geometry as the v9 0x0040e910 global tree. */
  ISAAC_EXIT_415800_NODE_SIZE = 0x1c,   /* push 0x1c to the CRT free */
  ISAAC_EXIT_415800_COM_SLOT_OFF = 0x14, /* callback argument node+0x14 */
  ISAAC_EXIT_415800_CTRL_OFF = 0x18,     /* ctrl = [node+0x18] */
  ISAAC_EXIT_415800_CALLBACK_GLOBAL = 0x00c7163cu,
  ISAAC_EXIT_415800_VTBL_RELEASE_OFF = 0xc,
  ISAAC_EXIT_415800_STACK_ARG_BYTES = 8,
  ISAAC_EXIT_415800_MAX_DEPTH = 64,     /* enumerator guard, not a PE limit */
  ISAAC_EXIT_415800_ORDER_OVERFLOW = 0xffffffffu,
  /* ABI v48: consumption of the FROZEN alloc string-tidy contract (alloc
     v3 AL, 0x0040d040) at the Exit root's only reach site. Census (whole-
     .text linear decode WITH resync, rule 10): 1288 direct E8 rel32 + 33
     E9 jmp tails = 1321 total, register-held 0 — the direct channel equals
     the alloc family's ALLOC_CALLERS_STRING_TIDY pin. Game::Exit root
     vector dtor loop: head 0x006fa27f reads end [ebx+0x25ec0] / begin
     [ebx+0x25ebc], cmp/je skip; body lea ecx,[esi+8] @ 0x006fa290 then
     call 0x0040d040 @ 0x006fa293; stride 0x38; begin re-read after the
     loop, end<-begin store @ 0x006fa2a5. this=elem+8 is an MSVC string,
     so its cap dword (+0x14) sits at elem+0x1c and feeds the gate. */
  ISAAC_EXIT_TIDY_VA = 0x0040d040u,
  ISAAC_EXIT_TIDY_SSO_CAP = 0x10, /* cmp ecx,0x10 ; jb — UNSIGNED gate */
  ISAAC_EXIT_TIDY_REACH_E8 = 1288,
  ISAAC_EXIT_TIDY_REACH_JMP_TAILS = 33,
  ISAAC_EXIT_TIDY_REACH_TOTAL = 1321,
  ISAAC_EXIT_TIDY_ROOT_SITE_VA = 0x006fa293u,
  ISAAC_EXIT_TIDY_ROOT_ELEM_CAP_OFF = 0x1c,
};

/* Sparse pure fields zeroed during in-memory teardown (after continue
   GameState host IO). Interleaved host calls between some of these stores
   are not represented here — prefer the PE-ordered T0/T1/T2/T4 islands when
   driving a residual host sequence. Offsets are version-bound. */
typedef struct IsaacExitPureTeardownState {
  int32_t field_2510c;                 /* Game+0x2510c */
  int32_t field_2593c;                 /* Game+0x2593c */
  int32_t field_25948;                 /* Game+0x25948 */
  int32_t field_2590c;                 /* Game+0x2590c */
  int32_t gate_1d520;                  /* Game+0x1d520 (also Update ABI) */
  int32_t gate_1d654;                  /* Game+0x1d654 (also Update ABI) */
  uint8_t skip_timed_transition_25954; /* Game+0x25954 (also Update ABI) */
} IsaacExitPureTeardownState;

/* Post-log pure island (VA ~0x006fa2de–0x006fa396) after Manager+0x15=0 and
   before ANM2::Reset hosts on Game+0x1c03c / +0x1d1d8. Decompiler truncated
   this region due to false noreturn on 0x00a112c0. */
typedef struct IsaacExitPostLogPureState {
  int32_t field_1bb70;   /* Game+0x1bb70 */
  int32_t gate_1ba78;    /* Game+0x1ba78 (also Update ABI) */
  int32_t field_1ba7c;   /* Game+0x1ba7c */
  uint8_t field_1ba84;   /* Game+0x1ba84 */
  int32_t field_1ba88;   /* Game+0x1ba88 */
  float field_1ba90;     /* Game+0x1ba90 ← DAT_00c7b640 */
  float field_1ba94;     /* Game+0x1ba94 ← DAT_00c7b644 */
  int32_t field_1ba80;   /* Game+0x1ba80 ← 50 */
  int32_t field_1b840;   /* Game+0x1b840 */
  int32_t field_1b848;   /* Game+0x1b848 */
  int32_t gate_1b83c;    /* Game+0x1b83c (also Update ABI) */
  int32_t field_1b84c;   /* Game+0x1b84c */
  int32_t field_1b858;   /* Game+0x1b858 */
  int32_t field_1b85c;   /* Game+0x1b85c */
  int32_t field_1b860;   /* Game+0x1b860 */
  int32_t field_1bb74;   /* Game+0x1bb74 */
  int32_t field_26548;   /* Game+0x26548 (movq low) */
  int32_t field_2654c;   /* Game+0x2654c (movq high) */
} IsaacExitPostLogPureState;

/* Nested pure-complete helper at VA 0x006f4520 (called from 0x006f43b0 with
   Game* this). Only scalar/float field stores + one copy 0x269d4→0x269d8. */
typedef struct IsaacExit6f4520EffectSlot {
  int32_t field_a; /* base+0 */
  int32_t field_b; /* base+4 */
  uint8_t flag;    /* base+0xc */
} IsaacExit6f4520EffectSlot;

typedef struct IsaacExit6f4520State {
  int32_t field_26554;
  int32_t field_26558;
  int32_t field_2655c;
  int32_t field_26560;
  int32_t field_26564;
  int32_t field_26568;
  int32_t field_2656c;
  int32_t field_26570;
  int32_t field_269c0;
  uint8_t field_26540;
  int32_t field_2657c;
  int32_t field_26528;
  int32_t field_2652c; /* ← 30 */
  float field_26530;   /* ← 1.0f */
  int32_t field_2653c;
  int32_t field_26538;
  int32_t counter_265c0;
  int32_t field_26548;
  int32_t field_2654c;
  int32_t counter_67788;
  IsaacExit6f4520EffectSlot effect_slots[ISAAC_EXIT_6F4520_EFFECT_SLOT_COUNT];
  int32_t field_68d6c;
  int32_t fade_26514;
  int32_t fade_26518;
  int32_t field_2651c;
  int32_t field_269c4; /* ← 1 */
  int32_t field_26774;
  int32_t field_269cc;
  int32_t field_269d4; /* input for copy */
  int32_t field_269d8; /* ← copy of field_269d4 */
  uint16_t field_269ea; /* word zero */
  int32_t field_676ac;  /* ← -1 */
  int32_t field_676b0;
  uint8_t field_269ec;
  uint8_t field_4704c;
  uint8_t field_68d70;
  int32_t field_26578;
  int32_t field_26574; /* ← 10 */
} IsaacExit6f4520State;

/* 0x006f43b0 pure prefix before nested 0x006f4520. */
typedef struct IsaacExit6f43b0PrefixState {
  uint16_t field_26588; /* word zero */
  int32_t field_264f8;
  int32_t field_264fc;
  int32_t field_26508;
} IsaacExit6f43b0PrefixState;

/* 0x006f43b0 pure mid island after 0x006f4520, before host 0x00424440. */
typedef struct IsaacExit6f43b0MidState {
  int32_t field_264f4;
  int32_t zero16_2658c[4]; /* movups 16 bytes at +0x2658c */
  int32_t field_26544;
  int32_t zero16_265a4[4]; /* movups 16 bytes at +0x265a4 */
  int32_t field_26550;
  int32_t field_2659c;
  int32_t field_265b4;
  int32_t field_265bc;
  uint8_t field_265c4;
  int32_t counter_265c0;
  int32_t field_26630;
  int32_t field_26634;
  int32_t field_2663c;
  uint8_t field_26638;
} IsaacExit6f43b0MidState;

/* 0x006f43b0 pure tail after host 0x00424440 + 0x009e53a0. */
typedef struct IsaacExit6f43b0TailState {
  float pack_676b8[4]; /* ← (1,1,1,0) from DAT_00bab050 */
  int32_t field_269e4;
  int32_t field_269e0;
  uint8_t field_269e9;
  uint8_t field_676b4;
  float field_676c8; /* ← 0.0f */
  float field_676cc; /* ← 1.0f */
  int32_t field_6774c; /* input for copy */
  int32_t field_67734;
  int32_t field_67738;
  int32_t field_6773c;
  float field_67740; /* ← 0.001f bits 0x3a83126f */
  uint8_t field_67744;
  int32_t field_67748;
  int32_t field_67750; /* ← copy of field_6774c */
  uint8_t field_68d70;
} IsaacExit6f43b0TailState;

/* Entry gate: Exit body is a pure no-op when Game+0x2658a == 0.
   Returns 1 when the active-session body must run, 0 when Exit returns. */
int32_t isaac_exit_session_active(uint32_t session_flag_2658a);

/* ItemOverlay force-close host is required iff state at Game+0x1c034 == 2
   (ZHL ACTIVE). Predicate only; the thiscall at 0x009aca90 stays host
   (exact ItemOverlay::Update). */
int32_t isaac_exit_item_overlay_force_needed(int32_t item_overlay_state_1c034);

/* Manager+0x2a2d0 / +0x2a2d4 ← 1.0f (PE imm 0x3f800000) before opaque
   0x007df690. */
void isaac_exit_manager_floats_reset(float* f_2a2d0, float* f_2a2d4);

/* PersistentGameData flush pure prelude:
     if (changesmade && fileLoadedSucessfully) { *changesmade = 0; return 1; }
     else return 0;
   When 1, host must run pre-save (0x009292c0) then local/cloud save. When 0,
   skip the entire PGD save cluster. Matches PE order: clear before host. */
int32_t isaac_exit_pgd_flush_prepare(uint8_t* changesmade, uint32_t file_loaded);

/* Read-only PGD flush predicate (no mutation). */
int32_t isaac_exit_pgd_flush_needed(uint32_t changesmade, uint32_t file_loaded);

/* Steam vs local PGD save branch after SteamInternal_ContextInit:
   local (return 0) when steam_ctx_word == 0 OR cloud_enable_2a3a4 == 0;
   cloud (return 1) when steam iface live AND cloud_enable_2a3a4 != 0.
   steam_ctx_word is the RAW FIRST DWORD of the Steam context (the PE gate
   @ 0x006fa1f0 is cmp dword ptr [eax],0 — a FULL-dword test, NOT a
   pre-computed boolean; 0x100 with cloud on must select the cloud host).
   cloud_enable_2a3a4 is a byte gate on Manager+0x2a3a4.
   Cloud path host is exact PersistentGameData::SaveToSteamCloud @ 0x00928ee0. */
int32_t isaac_exit_pgd_save_uses_cloud(uint32_t steam_ctx_word,
                                       uint32_t cloud_enable_2a3a4);

/* Continue GameState IO needed when Game+0x2658b == 0. */
int32_t isaac_exit_gamestate_io_needed(uint32_t skip_flag_2658b);

/* When GameState IO is needed: ShouldSave low byte selects write (1) vs
   delete (0). Returns 1 for write path (0x00958ed0), 0 for delete
   (0x00959130). Accepts the full 32-bit arg (PE tests (char)param_1);
   only the low 8 bits are significant. */
int32_t isaac_exit_gamestate_should_write(uint32_t should_save);

/* Apply pure in-memory field zeros for the Exit early teardown pack
   (convenience; hosts interleave — prefer T0/T1/T2/T4). */
void isaac_exit_pure_field_teardown(IsaacExitPureTeardownState* state);

/* PE-ordered early teardown islands around host 0x008d26c0 / ANM2::Reset
   (0x00407f10 on Game+0x1d528) / vector dtor. */
void isaac_exit_teardown_t0(int32_t* field_2510c, int32_t* field_2593c);
void isaac_exit_teardown_t1(int32_t* field_25948, int32_t* field_2590c,
                            int32_t* gate_1d520);
void isaac_exit_teardown_t2(int32_t* gate_1d654);
void isaac_exit_teardown_t4(uint8_t* skip_timed_transition_25954);

/* After host element dtors over [begin, end) stride 0x38: set end = begin
   (Game+0x25ec0 = Game+0x25ebc). Pointer values are opaque; only equality
   / assignment of the end slot is pure. */
void isaac_exit_vector_25ebc_clear_end(uint32_t* end_25ec0, uint32_t begin_25ebc);

/* Pure CF for the vector dtor loop. Host runs 0x0040d040 thiscall on
   (element + 8) once per element when begin != end. */
int32_t isaac_exit_vector_25ebc_dtor_needed(uint32_t begin_25ebc,
                                            uint32_t end_25ec0);
/* Element count when end >= begin and (end-begin) is a multiple of stride;
   otherwise 0 (invalid range — PE would not terminate cleanly). */
uint32_t isaac_exit_vector_25ebc_element_count(uint32_t begin_25ebc,
                                               uint32_t end_25ec0);

/* Ordered SFX stop IDs passed to residual 0x0092e230 (five calls). */
uint32_t isaac_exit_sfx_stop_id_at(uint32_t index);

/* Manager+0x15 (PersistentGameData.readonly) ← 0 after the ReadOnly log. */
void isaac_exit_pgd_readonly_clear(uint8_t* readonly_15);

/* Post-log pure Game field island.
   ABI v31: g_c7b640 / g_c7b644 are the RUNTIME values of the two globals the
   PE loads at 0x006fa311 / 0x006fa321 — not constants. */
void isaac_exit_postlog_pure_fields(IsaacExitPostLogPureState* state,
                                    uint32_t g_c7b640, uint32_t g_c7b644);

/* ItemOverlay state pair clear: Game+0x1c034 / +0x1c038 ← 0 (between ANM2
   resets and host 0x00421260). */
void isaac_exit_item_overlay_state_clear(int32_t* state_1c034,
                                         int32_t* field_1c038);

/* Terminal: Game+0x265c0 ← 0 then word Game+0x2658a ← 0 (clears session
   0x2658a and skip-IO 0x2658b together). */
void isaac_exit_counter_265c0_clear(int32_t* counter_265c0);
void isaac_exit_session_pair_clear(uint16_t* session_pair_2658a);

/* Nested 0x006f43b0 pure islands (Game* this). Host residuals inside
   0x006f43b0: 0x00424440 on Game+0x26640, 0x009e53a0 on Game+0x266e4. */
void isaac_exit_6f43b0_prefix(IsaacExit6f43b0PrefixState* state);
void isaac_exit_6f4520_apply(IsaacExit6f4520State* state);
void isaac_exit_6f43b0_mid(IsaacExit6f43b0MidState* state);
void isaac_exit_6f43b0_tail(IsaacExit6f43b0TailState* state);

/* --- ABI v3: residual after ItemOverlay state clear --- */

/* Pure stores inside host residual 0x00421260 after ANM2::Reset(Game+0x1d2f4):
   Game+0x1d2ec / +0x1d2f0 ← 0 (mode pair on the 0x1d2ec object). */
void isaac_exit_frame_mode_pair_clear(int32_t* mode_1d2ec, int32_t* secondary_1d2f0);

/* 0x00421260 Manager path: ClearVolumeModifier host needed when
   Manager+0x2a334 != 1.0f (ucomiss vs DAT_00baa454). PE also stores 1.0f
   before the host when the branch is taken. */
int32_t isaac_exit_volume_modifier_clear_needed(float manager_2a334);
void isaac_exit_manager_2a334_set_one(float* manager_2a334);
/* Always after the conditional: Manager+0x2a338 ← 0x3ba3d70a. */
void isaac_exit_manager_2a338_set(float* manager_2a338);

/* Residual pure nest gate: entity copy runs iff flag != 0 && count > 0. */
int32_t isaac_exit_residual_slot_copy_needed(uint32_t flag_0c, uint32_t count);

/* One entity: dword at +0x30 → +0x34 (PE inner body). entity may be null → no-op. */
void isaac_exit_residual_entity_copy_30_to_34(uint8_t* entity);

/* Batch: for i in [0, count): copy on entity_base + i*0x5c. Matches the PE
   inner loop when gate is open. count is unsigned; null base is no-op. */
void isaac_exit_residual_entity_batch_copy_30_to_34(uint8_t* entity_base,
                                                    uint32_t count);

/* Full pure nest over a linear Game image: for outer×mid slots starting at
   game_base+0x18990, when gate open apply batch copy using the slot's stored
   entity pointer (read as a host pointer value cast through uint8_t* in the
   caller's address space — for Wasm tests, pointers are linear-memory offsets
   encoded as uint32). When game_base is null, no-op.
   Slot layout at edi = base + o*0xc4 + m*0x2c:
     *(u32*)(edi-4) = entity_base, *(u32*)edi = count, *(u8*)(edi+0xc) = flag. */
void isaac_exit_residual_18990_apply(uint8_t* game_base);

/* After host element walk on map value: value+0x28 ← 0. */
void isaac_exit_map_value_flag_28_clear(uint8_t* flag_28);

/* --- ABI v4: pure prefix of residual host 0x009b5cb0 --- */

/* Pure field pack at the head of 0x009b5cb0 (thiscall Game+0x23a74) before
   the five ordered host residuals. menu_state_0 is the same dword as Update
   sparse field menuState23a74. field_8 is set to 2 (not zero). */
typedef struct IsaacExit9b5cb0PrefixState {
  int32_t menu_state_0; /* this+0 / Game+0x23a74 ← 0 */
  int32_t field_8;      /* this+8 / Game+0x23a7c ← 2 */
  int32_t field_24;     /* this+0x24 / Game+0x23a98 ← 0 */
  int32_t field_28;     /* this+0x28 / Game+0x23a9c ← 0 */
  uint8_t field_1454;   /* this+0x1454 / Game+0x24ec8 ← 0 */
} IsaacExit9b5cb0PrefixState;

void isaac_exit_9b5cb0_prefix(IsaacExit9b5cb0PrefixState* state);

/* Pointer form of the same pure stores (null slots skipped). */
void isaac_exit_9b5cb0_prefix_ptrs(int32_t* menu_state_0, int32_t* field_8,
                                   int32_t* field_24, int32_t* field_28,
                                   uint8_t* field_1454);

/* --- ABI v5: pure islands inside residual host 0x008d3250 --- */

/* P0: before first host 0x0040c7f0 (this=this+0x3c). PE also sets up that
   host's ecx/arg before these stores; pure fields do not depend on it. */
typedef struct IsaacExit8d3250P0State {
  uint8_t field_10; /* this+0x10 ← 0 */
  int32_t field_14; /* this+0x14 ← 0 */
  int32_t field_30; /* this+0x30 ← 0 */
  int32_t field_34; /* this+0x34 ← 0 */
  int32_t field_38; /* this+0x38 ← 0 */
} IsaacExit8d3250P0State;

void isaac_exit_8d3250_p0(IsaacExit8d3250P0State* state);
void isaac_exit_8d3250_p0_ptrs(uint8_t* field_10, int32_t* field_14,
                               int32_t* field_30, int32_t* field_34,
                               int32_t* field_38);

/* P1: after first 0x0040c7f0, before second 0x0040c7f0 (this=this+0x50). */
void isaac_exit_8d3250_p1(int32_t* field_44, int32_t* field_48,
                          int32_t* field_4c);

/* P2: after second 0x0040c7f0, before exact ANM2::Reset (this=this+0x64). */
void isaac_exit_8d3250_p2(int32_t* field_58, int32_t* field_5c,
                          int32_t* field_60);

/* P3: after ANM2::Reset; pure stores always run (between cmp and je).
   field_178 ← -1; other four dwords ← 0. */
typedef struct IsaacExit8d3250P3State {
  int32_t field_178; /* this+0x178 ← -1 */
  int32_t field_17c; /* this+0x17c ← 0 */
  int32_t field_180; /* this+0x180 ← 0 */
  int32_t field_648; /* this+0x648 ← 0 */
  int32_t field_64c; /* this+0x64c ← 0 */
} IsaacExit8d3250P3State;

void isaac_exit_8d3250_p3(IsaacExit8d3250P3State* state);
void isaac_exit_8d3250_p3_ptrs(int32_t* field_178, int32_t* field_17c,
                               int32_t* field_180, int32_t* field_648,
                               int32_t* field_64c);

/* Host ANM2::GetLayer("Cursor") on this+0x304 needed when this+0x40d != 0.
   After the host returns LayerState*, PE also writes byte layer+0x74 ← 0
   (host residual, not pure on the 8d3250 object). */
int32_t isaac_exit_8d3250_cursor_layer_host_needed(uint32_t field_40d);

/* P4: after optional GetLayer path. Copy this+0x18 → this+0x1c; clear
   this+0x24 / +0x28 / +0x2c. field_18 is an input (preserved). */
typedef struct IsaacExit8d3250P4State {
  int32_t field_18; /* input */
  int32_t field_1c; /* ← copy of field_18 */
  int32_t field_24; /* ← 0 */
  int32_t field_28; /* ← 0 */
  int32_t field_2c; /* ← 0 */
} IsaacExit8d3250P4State;

void isaac_exit_8d3250_p4(IsaacExit8d3250P4State* state);
void isaac_exit_8d3250_p4_ptrs(const int32_t* field_18, int32_t* field_1c,
                               int32_t* field_24, int32_t* field_28,
                               int32_t* field_2c);

/* List-reset host path when this+0x1e8 != 0 (object with header +0x120). */
int32_t isaac_exit_8d3250_list_host_needed(uint32_t ptr_1e8);

/* After residual host 0x00415800 list destroy: empty circular sentinel and
   count slot ← 0. `links` points at three consecutive dwords (next/prev/self);
   each is set to `self_addr` (the PE/Wasm linear address of the sentinel).
   Freestanding-safe: self_addr is supplied by the caller (no pointer→u32). */
void isaac_exit_8d3250_list_empty(uint32_t* links, uint32_t self_addr,
                                  uint32_t* count_slot);

/* --- ABI v6: pure islands inside residual host 0x009b9150 --- */

/* P0: before player-list host walk. this+0xc8 / +0xcc ← 0. */
typedef struct IsaacExit9b9150P0State {
  int32_t field_c8; /* this+0xc8 ← 0 */
  int32_t field_cc; /* this+0xcc ← 0 */
} IsaacExit9b9150P0State;

void isaac_exit_9b9150_p0(IsaacExit9b9150P0State* state);
void isaac_exit_9b9150_p0_ptrs(int32_t* field_c8, int32_t* field_cc);

/* Player list at this+0 / +4 (ZHL _playerList). Host walk needed when
   ((end - begin) & 0xfffffffc) != 0 (PE test eax, 0xfffffffc). After the
   host loop (or when empty), pure end ← begin. */
int32_t isaac_exit_9b9150_player_list_host_needed(uint32_t begin, uint32_t end);
void isaac_exit_9b9150_player_list_clear_end(uint32_t* end_slot, uint32_t begin);

/* Extra pointer vector at this+0xd0 / +0xd4. Count is signed sar of
   (end-begin) by 2; host walk when count != 0. Per-element vtable delete
   when *elem != 0 (use ptr_host_needed). After walk: end ← begin. */
int32_t isaac_exit_9b9150_extra_list_count(uint32_t begin, uint32_t end);
int32_t isaac_exit_9b9150_extra_list_host_needed(uint32_t begin, uint32_t end);
void isaac_exit_9b9150_extra_list_clear_end(uint32_t* end_slot, uint32_t begin);

/* Non-null pointer → host vtable delete (extra-list elems and esau slots). */
int32_t isaac_exit_9b9150_ptr_host_needed(uint32_t ptr);

/* After optional host delete on one esau slot: slot ← 0. */
void isaac_exit_9b9150_slot_clear(uint32_t* slot);

/* Final pure: clear all four esau slots at this+0x80 (after host deletes). */
void isaac_exit_9b9150_esau_slots_clear(uint32_t* slots /* [4] */);

/* Mid pure after esau loop (ebx==0): this+0x7c ← 0; byte this+0x5c ← 1.
   Interleaved with host log setup; stores do not depend on the log. */
typedef struct IsaacExit9b9150MidState {
  int32_t field_7c; /* this+0x7c ← 0 */
  uint8_t field_5c; /* this+0x5c ← 1 */
} IsaacExit9b9150MidState;

void isaac_exit_9b9150_mid(IsaacExit9b9150MidState* state);
void isaac_exit_9b9150_mid_ptrs(int32_t* field_7c, uint8_t* field_5c);

/* Tail pure: four dwords at this+0x60 + i*4 ← -1 (host log residual between
   stores; freestanding pack applies the pure final state). */
typedef struct IsaacExit9b9150TailState {
  int32_t fields[ISAAC_EXIT_9B9150_TAIL_COUNT];
} IsaacExit9b9150TailState;

void isaac_exit_9b9150_tail(IsaacExit9b9150TailState* state);
void isaac_exit_9b9150_tail_ptrs(int32_t* fields /* [4] or null slots */);

/* --- ABI v7: pure islands inside residual host 0x009a27d0 --- */

/* After each slot host triple (0x00840f70 / ANM2::Reset / 0x00709150):
   pure byte flag ← 0. Single-slot form for residual sequencing. */
void isaac_exit_9a27d0_slot_flag_clear(uint8_t* flag);

/* Packed freestanding final state: 11 consecutive flag bytes ← 0
   (not game-strided; use apply for this+0x3ce4 stride 0x1f4 layout). */
void isaac_exit_9a27d0_slot_flags_clear_packed(
    uint8_t* flags /* [ISAAC_EXIT_9A27D0_SLOT_FLAG_COUNT] */);

/* Strided apply on a 0x009a27d0 this image: for i in [0, 11):
   this_base[0x3ce4 + i*0x1f4] ← 0. Null this_base is a no-op. */
void isaac_exit_9a27d0_slot_flags_apply(uint8_t* this_base);

/* This-relative offset of slot flag i (0x3ce4 + i*0x1f4). Returns
   0xffffffff when index >= SLOT_FLAG_COUNT. */
uint32_t isaac_exit_9a27d0_slot_flag_off(uint32_t index);

/* Tail pure before host 0x0083abb0 / tail-jmp 0x0084bfd0:
   byte this+0x54cd ← 0. */
void isaac_exit_9a27d0_field_54cd_clear(uint8_t* field_54cd);

/* --- ABI v8: pure islands inside residual host 0x009a19a0 --- */

/* P0 pure prefix before the 8× host 0x00841cf0 walk. */
typedef struct IsaacExit9a19a0PrefixState {
  float field_5490;   /* this+0x5490 ← -1.0f (bits 0xbf800000) */
  int32_t field_5494; /* this+0x5494 ← -1 */
  int32_t field_5498; /* this+0x5498 ← -1 */
  uint8_t field_549c; /* this+0x549c ← 0 */
  int32_t field_54d0; /* this+0x54d0 ← 2 */
  uint8_t field_54d4; /* this+0x54d4 ← 0 */
  int32_t field_54d8; /* this+0x54d8 ← 2 */
} IsaacExit9a19a0PrefixState;

void isaac_exit_9a19a0_prefix(IsaacExit9a19a0PrefixState* state);
void isaac_exit_9a19a0_prefix_ptrs(float* field_5490, int32_t* field_5494,
                                   int32_t* field_5498, uint8_t* field_549c,
                                   int32_t* field_54d0, uint8_t* field_54d4,
                                   int32_t* field_54d8);

/* Per-slot pure before host 0x00841cf0 (slot = this + i*0x6dc):
   dword slot+4 ← this_addr; word slot+8 ← index. this_addr is the PE/Wasm
   linear address of the outer this object (caller-supplied). */
void isaac_exit_9a19a0_slot_setup(uint32_t* field_4, uint16_t* field_8,
                                  uint32_t this_addr, uint16_t index);

/* Strided apply on a 0x009a19a0 this image: for i in [0, 8):
   this_base[i*0x6dc + 4] ← this_addr (u32); word at +8 ← i.
   Null this_base is a no-op. */
void isaac_exit_9a19a0_slots_apply(uint8_t* this_base, uint32_t this_addr);

/* This-relative base offset of slot i (i*0x6dc). Returns 0xffffffff when
   index >= PLAYERHUD_LOOP_COUNT. */
uint32_t isaac_exit_9a19a0_slot_base_off(uint32_t index);

/* Tail pure after host 0x0083abb0, before tail-jmp 0x0084bfd0:
   byte this+0x54cc ← 1. */
void isaac_exit_9a19a0_field_54cc_set(uint8_t* field_54cc);

/* --- ABI v9: pure islands / CF inside residual host 0x0040e910 --- */

/* Outer walk needed when first node != sentinel (PE: cmp esi, eax; je
   epilog). Both values are opaque host/Wasm linear addresses. */
int32_t isaac_exit_40e910_list_host_needed(uint32_t sentinel, uint32_t first);

/* Node object at node+0x18 non-null → COM vtable path; null → free path. */
int32_t isaac_exit_40e910_node_object_present(uint32_t obj_ptr);

/* After residual COM hosts on obj+8: free path when zero-extended
   word(obj+4) <= 2 (PE: movzx; cmp edi, 2; jbe free). Else pure successor
   only (keep node). Accepts full 32-bit; only low 16 bits matter. */
int32_t isaac_exit_40e910_free_after_com_needed(uint32_t obj_word4);

/* Post-erase dtor object non-null (erased_node+0x18 / [edi+4] with
   edi=node+0x14). Same null test as node_object_present. */
int32_t isaac_exit_40e910_post_erase_dtor_needed(uint32_t obj_ptr);

/* After host virtual dtor predicate returns AL: global callback at
   DAT_00c7163c needed when virtual_al != 0 AND global_fn != 0. */
int32_t isaac_exit_40e910_post_erase_callback_needed(uint32_t virtual_al,
                                                     uint32_t global_fn);

/* Free size immediate pushed before residual free 0x00aef15c. */
uint32_t isaac_exit_40e910_free_size(void);

/* ABI v41: decision laws for the residual global-tree walk + COM release
   (COM/alloc stay typed-host; only the pure decision surface is here).

   Loop-continue law (PE @ 0x0040e9de: cmp esi, dword [DAT_00c78ee8];
   jne loop). cur is the node after host tree++ (keep path) or the
   0x00415d20 erase return (free path); sentinel is RE-READ from
   DAT_00c78ee8 on every iteration — do not fold the entry-time head. */
int32_t isaac_exit_40e910_walk_continue(uint32_t cur, uint32_t sentinel);

/* COM release this: obj+8 (PE lea ebx, [edi+8] @ 0x0040e952). u32 wrap. */
uint32_t isaac_exit_40e910_com_iface_addr(uint32_t obj_ptr);

/* First COM method stack arg: -1 (PE push -1 @ 0x0040e955, consumed by
   the vtable slot +0xc call; slot +0x10 reuses it, no stack cleanup
   before the compare). */
uint32_t isaac_exit_40e910_com_release_arg(void);

/* COM state word: zero-extended 16-bit word at obj+4 (PE movzx edi,
   word ptr [edi+4] @ 0x0040e960) — the value free_after_com_needed
   tests against ISAAC_EXIT_40E910_COM_FREE_WORD_MAX. */
uint32_t isaac_exit_40e910_com_state_word(uint32_t obj_word4);

/* Pure freestanding MSVC tree iterator++ (exact PE 0x00414a80).
   *it holds the current node linear address (Wasm absolute offset / PE
   pointer value). Node layout: left@0 parent@4 right@8 isnil@0xd.
   Null it is a no-op; does not validate the graph. Host erase/COM/free
   remain residual. */
void isaac_exit_tree_iterator_next(uint32_t* it);

/* --- ABI v10: map walk Game+0x1a738 + residual 0x0069d690 pure islands --- */

/* Outer map walk needed when first node != sentinel (PE: cmp esi, edi). */
int32_t isaac_exit_map_1a738_walk_needed(uint32_t sentinel, uint32_t first);

/* Post-find hit when found node != sentinel (PE: cmp eax, edi; je skip). */
int32_t isaac_exit_map_1a738_lookup_hit(uint32_t sentinel, uint32_t found);

/* Element-host path when byte flag at node+0x28 != 0. */
int32_t isaac_exit_map_1a738_flag_active(uint32_t flag_28);

/* Element range non-empty when begin != end (node+0x44 / +0x48). */
int32_t isaac_exit_map_1a738_elem_range_nonempty(uint32_t begin, uint32_t end);

/* Combined: hit && flag_active && range nonempty → host 0x0040c7f0×N.
   When false, PE still runs pure flag clear (if hit+flag) then always
   host 0x0040e910 + pure tree successor. */
int32_t isaac_exit_map_1a738_elem_walk_needed(uint32_t sentinel, uint32_t found,
                                              uint32_t flag_28, uint32_t begin,
                                              uint32_t end);

/* PE immediates for the element host loop. */
uint32_t isaac_exit_map_1a738_elem_stride(void);
uint32_t isaac_exit_map_1a738_elem_host_off(void);

/* MSVC basic_string SSO: capacity < 0x10 → data at str_addr (inline buf);
   else data is dword0 (caller-supplied load of *str_addr). */
int32_t isaac_exit_msvc_string_sso_inline(uint32_t capacity);
uint32_t isaac_exit_msvc_string_data_addr(uint32_t str_addr, uint32_t capacity,
                                          uint32_t dword0);

/* Pure-complete string compare (exact PE 0x00423480).
   s1/len1 = ecx/edx; s2/len2 = stack args. Returns <0 / 0 / >0. */
int32_t isaac_exit_string_compare(const uint8_t* s1, uint32_t len1,
                                  const uint8_t* s2, uint32_t len2);

/* 0x0069d690 pure CF after lower_bound 0x00685bc0:
   isnil(candidate) → miss; else pure strcmp; hit when cmp >= 0. */
int32_t isaac_exit_69d690_candidate_isnil(uint32_t isnil_byte);
int32_t isaac_exit_69d690_cmp_is_hit(int32_t cmp_result);

/* Select find result: isnil or cmp < 0 → sentinel; else candidate. */
uint32_t isaac_exit_69d690_select_result(uint32_t sentinel, uint32_t candidate,
                                         uint32_t isnil_byte, int32_t cmp_result);

/* --- ABI v11: pure islands + pure-complete lower_bound 0x00685bc0 --- */

/* Out-triple written by PE lower_bound (and find reads best@+8). */
typedef struct IsaacExitLowerBoundTriple {
  uint32_t walk;  /* +0 current / next node */
  uint32_t bound; /* +4 last branch: 0 = went right, 1 = went left */
  uint32_t best;  /* +8 lower_bound candidate (starts as sentinel) */
} IsaacExitLowerBoundTriple;

/* Init: walk=root, bound=0, best=sentinel (PE @ 0x00685bcd..0x00685bda). */
void isaac_exit_685bc0_init_triple(IsaacExitLowerBoundTriple* out,
                                   uint32_t sentinel, uint32_t root);

/* Empty tree when root isnil != 0 (PE: jne epilog @ 0x00685bdd). */
int32_t isaac_exit_685bc0_root_is_empty(uint32_t root_isnil);

/* After strcmp(node_key, search_key): go right when cmp < 0
   (PE: test eax; jns record-left; else right @ 0x00685c17). */
int32_t isaac_exit_685bc0_cmp_go_right(int32_t cmp_result);

/* One loop body after strcmp(node, key). Updates walk/bound/best.
   left/right are node children (caller-supplied). Does not write
   walk=node first — PE does that at loop head before strcmp. */
void isaac_exit_685bc0_step(IsaacExitLowerBoundTriple* out, uint32_t node,
                            uint32_t left, uint32_t right, int32_t cmp_result);

/* Continue loop when next walk isnil == 0 (PE: je loop @ 0x00685c34). */
int32_t isaac_exit_685bc0_loop_continue(uint32_t next_isnil);

/* Pure-complete MSVC map lower_bound (exact PE 0x00685bc0).
   Addresses are Wasm/PE linear u32 (same model as tree_iterator_next).
   map_addr: map object with [map]=sentinel; root=[sentinel+4].
   out_addr: 12-byte triple destination.
   key_addr: MSVC basic_string search key (size@+0x10, cap@+0x14).
   Node keys at node+0x10. Returns out_addr (PE returns edi). Zero
   map_addr or out_addr → return 0 without stores. */
uint32_t isaac_exit_map_lower_bound(uint32_t map_addr, uint32_t out_addr,
                                    uint32_t key_addr);

/* Pure-complete map find (exact PE 0x0069d690): lower_bound then
   isnil / strcmp(key, node) / select. out_node_addr receives the
   found node or sentinel. Returns out_node_addr. */
uint32_t isaac_exit_map_find_69d690(uint32_t map_addr, uint32_t out_node_addr,
                                    uint32_t key_addr);

/* --- ABI v12: pure islands / CF inside residual host 0x0040c7f0 --- */

/* Alloc size immediate pushed before residual 0x00a0f4c0. */
uint32_t isaac_exit_40c7f0_alloc_size(void);

/* Host ctor 0x0040cc10 path when alloc ptr != 0 (PE: test edi; je null). */
int32_t isaac_exit_40c7f0_alloc_ok(uint32_t alloc_ptr);

/* Old holder at this+4 non-null → virtual release path
   (PE: mov ecx,[esi+4]; test ecx; je skip). */
int32_t isaac_exit_40c7f0_old_object_present(uint32_t old_obj_ptr);

/* After host virtual AL on old object: global callback at DAT_00c7163c
   when virtual_al != 0 AND global_fn != 0 (same CF as 40e910 post-erase). */
int32_t isaac_exit_40c7f0_callback_needed(uint32_t virtual_al,
                                          uint32_t global_fn);

/* Post-ctor pure on the new object (PE @ 0x0040c83e..0x0040c844):
   *obj ← vtable 0xb1a6e0; *(obj+0x14) ← stack arg. Null slots skipped. */
void isaac_exit_40c7f0_object_finish(uint32_t* vtable_slot, uint32_t* arg_slot,
                                     uint32_t arg);

/* Linear-memory form: write vtable@+0 and arg@+0x14 on obj_base.
   Null obj_base is a no-op. */
void isaac_exit_40c7f0_object_finish_apply(uint8_t* obj_base, uint32_t arg);

/* Pure tail of 0x0040c7f0 (PE @ 0x0040c873..0x0040c875):
   *this ← arg; this+4 ← new_obj (0 when alloc failed). Null slots skipped. */
void isaac_exit_40c7f0_pair_apply(uint32_t* value_slot, uint32_t* obj_slot,
                                  uint32_t arg, uint32_t new_obj);

/* Linear-memory form on an 8-byte pair at pair_base. Null is a no-op. */
void isaac_exit_40c7f0_pair_apply_base(uint8_t* pair_base, uint32_t arg,
                                       uint32_t new_obj);

/* Nested ctor 0x0040cc10 pure field pack (always; before DAT_00b81c10 host). */
typedef struct IsaacExit40cc10PureState {
  uint32_t vtable;     /* this+0  ← 0xb1a6fc */
  uint32_t field_4;    /* this+4  ← 0x10001 */
  uint32_t sub_vtable; /* this+8  ← 0xb81c0c */
  uint8_t field_c;     /* this+0xc ← 0 */
  uint32_t field_10;   /* this+0x10 ← 0 */
} IsaacExit40cc10PureState;

void isaac_exit_40cc10_pure_fields(IsaacExit40cc10PureState* state);
void isaac_exit_40cc10_pure_fields_ptrs(uint32_t* vtable, uint32_t* field_4,
                                        uint32_t* sub_vtable, uint8_t* field_c,
                                        uint32_t* field_10);

/* Linear-memory apply of 40cc10 pure stores on obj_base (size ≥ 0x14).
   Null obj_base is a no-op. Host residual DAT_00b81c10 call remains. */
void isaac_exit_40cc10_apply(uint8_t* obj_base);

/* DAT_00b81c10 == 0xa15770 → direct call path; else indirect call eax.
   Both remain host residual; pure CF only. */
int32_t isaac_exit_40cc10_default_init_is_direct(uint32_t dat_b81c10);

/* Immediate default-init VA (0xa15770). */
uint32_t isaac_exit_40cc10_default_init_va(void);

/* Post-ctor derived vtable immediate (0xb1a6e0). */
uint32_t isaac_exit_40c7f0_vtable(void);

/* --- ABI v13: pure islands / CF inside residual host 0x00408830 --- */

/* Entry store: this+4 ← stack arg (PE @ 0x0040885c; before free paths). */
void isaac_exit_408830_store_arg(uint32_t* field4_slot, uint32_t arg);

/* Linear-memory form: write arg at this_base+4. Null this_base is a no-op. */
void isaac_exit_408830_store_arg_apply(uint8_t* this_base, uint32_t arg);

/* Free host path when buffer ptr != 0 (PE: test edx; je skip for +8/+0xc). */
int32_t isaac_exit_408830_ptr_free_needed(uint32_t ptr);

/* Post-free pure zero of a buffer slot (PE: mov dword [esi+8/0xc], 0). */
void isaac_exit_408830_ptr_clear(uint32_t* slot);

/* Alloc cluster when this+4 / arg != 0 (PE @ 0x004088b0: test ecx; je tail). */
int32_t isaac_exit_408830_arg_present(uint32_t arg);

/* Per-count alloc gate: count != 0 (PE: test eax; je skip for +0x1c/+0x24). */
int32_t isaac_exit_408830_count_nonzero(uint32_t count);

/* Overflow-safe alloc byte size: count * 4 with seto/neg/or → all-ones
   (PE @ 0x004088c3–0x004088d0 and twin for count B). */
uint32_t isaac_exit_408830_alloc_size(uint32_t count);

/* Memset byte count: count << 2 (PE: shl ecx, 2; no overflow check). */
uint32_t isaac_exit_408830_fill_size(uint32_t count);

/* Memset fill immediate (push 0xff before 0x00af05e5). */
uint8_t isaac_exit_408830_fill_byte(void);

/* Terminal float bits at this+0x10 (imm 0xbf800000 / -1.0f). */
uint32_t isaac_exit_408830_f32_10_bits(void);

/* Terminal pure pack after free/alloc hosts (PE @ 0x00408935–0x0040894e). */
typedef struct IsaacExit408830TailState {
  uint32_t field_10; /* this+0x10 ← 0xbf800000 */
  uint8_t field_14;  /* this+0x14 ← 0 */
  uint32_t field_18; /* this+0x18 ← 0 */
  uint32_t field_1c; /* this+0x1c ← 0 */
} IsaacExit408830TailState;

void isaac_exit_408830_tail(IsaacExit408830TailState* state);
void isaac_exit_408830_tail_ptrs(uint32_t* field_10, uint8_t* field_14,
                                 uint32_t* field_18, uint32_t* field_1c);

/* Linear-memory terminal pack on this_base (writes +0x10..+0x1c).
   Null this_base is a no-op. Host free/alloc/memset remain residual. */
void isaac_exit_408830_tail_apply(uint8_t* this_base);

/* --- ABI v14: pure islands / CF inside residual host 0x009b4810 --- */

/* Entry: vector end ← begin (PE @ 0x009b485c: mov [esi+4], eax). */
void isaac_exit_9b4810_vec_reset_end(uint32_t* end_slot, uint32_t begin);

/* Linear-memory form: write begin into this_base+0x280. Null is a no-op. */
void isaac_exit_9b4810_vec_reset_end_apply(uint8_t* this_base);

/* First push value: 0 when mode==0 or mode==3, else 1 (PE @ 0x009b485f). */
uint32_t isaac_exit_9b4810_first_push_value(uint32_t mode);

/* Mode gates (PE-ordered block skips). */
int32_t isaac_exit_9b4810_mode_is_3(uint32_t mode);
int32_t isaac_exit_9b4810_mode_is_1(uint32_t mode);
/* Layer / spritesheet path when mode ∈ {1,2} (PE @ 0x009b4d18–0x009b4d22). */
int32_t isaac_exit_9b4810_mode_layer_path(uint32_t mode);
/* Block A/E (and optional 0x1c) run when mode != 3. */
int32_t isaac_exit_9b4810_mode_block_a_needed(uint32_t mode);
/* Block C needed when mode != 3. */
int32_t isaac_exit_9b4810_mode_block_c_needed(uint32_t mode);
/* Block E needed when mode != 3. */
int32_t isaac_exit_9b4810_mode_block_e_needed(uint32_t mode);
/* Block F needed when mode != 1. */
int32_t isaac_exit_9b4810_mode_block_f_needed(uint32_t mode);

/* Vector pure-push gate: end != cap (PE: cmp end, cap; je grow host). */
int32_t isaac_exit_9b4810_vec_space(uint32_t end, uint32_t cap);

/* Pure end advance after dword push (PE: add dword [esi+4], 4). */
uint32_t isaac_exit_9b4810_vec_end_after_push(uint32_t end);

/* Pure store of push value into the current end element slot. */
void isaac_exit_9b4810_vec_store(uint32_t* elem_slot, uint32_t value);

/* Pure path when space: store value at elem_slot; *end_slot = end+4.
   Returns new end. Null slots are skipped. Caller must ensure space. */
uint32_t isaac_exit_9b4810_vec_push_pure(uint32_t* end_slot,
                                         uint32_t* elem_slot, uint32_t end,
                                         uint32_t value);

/* Linear-memory pure push when begin/end/cap are byte offsets into
   arena_base (freestanding address model). If end!=cap: store value at
   arena_base+end, write end+4 into this_base+0x280, return 1. Else return
   0 (host grow). Null this_base or arena_base → 0. */
int32_t isaac_exit_9b4810_vec_push_apply(uint8_t* this_base,
                                         uint8_t* arena_base,
                                         uint32_t value);

/* Id-table accessors (PE-ordered). index out of range → 0. */
uint32_t isaac_exit_9b4810_block_a_count(void);
uint32_t isaac_exit_9b4810_block_a_at(uint32_t index);
uint32_t isaac_exit_9b4810_block_b_count(void);
uint32_t isaac_exit_9b4810_block_b_at(uint32_t index);
uint32_t isaac_exit_9b4810_block_c_count(void);
uint32_t isaac_exit_9b4810_block_c_at(uint32_t index);
uint32_t isaac_exit_9b4810_block_d_count(void);
uint32_t isaac_exit_9b4810_block_d_at(uint32_t index);
uint32_t isaac_exit_9b4810_block_e_count(void);
uint32_t isaac_exit_9b4810_block_e_at(uint32_t index);
uint32_t isaac_exit_9b4810_block_f_count(void);
uint32_t isaac_exit_9b4810_block_f_at(uint32_t index);
uint32_t isaac_exit_9b4810_value_1c(void);

/* Optional push 0x1c CF (PE @ 0x009b49ea–0x009b4a2f). Host supplies
   already-selected flag@+0x2b9, Manager+8, Game nullness, Game+0x26630,
   Game+0x26589. Returns 1 when the 0x1c push runs. */
int32_t isaac_exit_9b4810_push_1c_needed(uint32_t selected_flag_2b9,
                                         uint32_t manager_field8,
                                         uint32_t game_ptr_null,
                                         uint32_t game_26630,
                                         uint32_t game_26589);

/* Layer loop when signed count > 0 (PE: test eax; jle skip). */
int32_t isaac_exit_9b4810_layer_loop_needed(int32_t layer_count);

/* Counter play-skip CF after host strcmp with "Counter" (PE @ 0x009b4f23).
   str_null: [this+0x16c]==0. strcmp_eq: host strcmp result == 0.
   anim_flag_34: byte at string_obj+0x34. this_17c: byte at this+0x17c.
   Returns 1 when PlayAnimation host path runs; 0 → skip to terminal. */
int32_t isaac_exit_9b4810_counter_play_needed(uint32_t str_null,
                                              uint32_t strcmp_eq,
                                              uint32_t anim_flag_34,
                                              uint32_t this_17c);

/* Post-Rewind pure store: byte [anm2+0x44] ← 1 (PE @ 0x009b4f9e). */
void isaac_exit_9b4810_play_flag_set(uint8_t* flag_slot);

/* Linear-memory play flag at this_base+0x17c. Null is a no-op. */
void isaac_exit_9b4810_play_flag_apply(uint8_t* this_base);

/* Terminal pure pack (PE @ 0x009b4fa2–0x009b4fee). field_c/field_10 are
   inputs copied to field_14/field_18. */
typedef struct IsaacExit9b4810TailState {
  uint8_t field_4;     /* this+4 ← 0 */
  uint32_t field_8;    /* this+8 ← 0 */
  uint32_t field_14;   /* this+0x14 ← field_c */
  uint32_t field_18;   /* this+0x18 ← field_10 */
  uint32_t field_1c;   /* this+0x1c ← DAT_00c7b640 bits */
  uint32_t field_20;   /* this+0x20 ← DAT_00c7b644 bits */
  uint32_t field_24c;  /* this+0x24c ← 0 */
  uint32_t field_250;  /* this+0x250 ← 0 */
  uint32_t field_254;  /* this+0x254 ← 0 */
} IsaacExit9b4810TailState;

/* ABI v31: g_c7b640 / g_c7b644 are RUNTIME global values (PE @ 0x009b4fc0 /
   0x009b4fcd: movss xmm0, [0xc7b640] / [0xc7b644]), not constants. */
void isaac_exit_9b4810_tail(IsaacExit9b4810TailState* state, uint32_t field_c,
                            uint32_t field_10, uint32_t g_c7b640,
                            uint32_t g_c7b644);
void isaac_exit_9b4810_tail_ptrs(uint8_t* field_4, uint32_t* field_8,
                                 uint32_t* field_14, uint32_t* field_18,
                                 uint32_t* field_1c, uint32_t* field_20,
                                 uint32_t* field_24c, uint32_t* field_250,
                                 uint32_t* field_254, uint32_t field_c,
                                 uint32_t field_10, uint32_t g_c7b640,
                                 uint32_t g_c7b644);

/* Linear-memory terminal pack. Reads +0xc/+0x10; writes terminal fields.
   Null this_base is a no-op. Host residual remains grow/ANM2/free. */
void isaac_exit_9b4810_tail_apply(uint8_t* this_base, uint32_t g_c7b640,
                                  uint32_t g_c7b644);

/* Source ADDRESSES of the two runtime floats (they replaced the bogus
   value accessors isaac_exit_9b4810_f32_1c_bits/_f32_20_bits in v31). */
uint32_t isaac_exit_f32_global_c7b640_addr(void);
uint32_t isaac_exit_f32_global_c7b644_addr(void);

/* --- ABI v15: pure size/cap CF inside residual grow 0x00428590 --- */

/* Element count: SAR32(end - begin, 2). PE @ 0x004285a0–0x004285aa. */
uint32_t isaac_exit_428590_elem_count(uint32_t begin, uint32_t end);

/* Capacity elems: SAR32(cap - begin, 2). PE @ 0x004285b8–0x004285c3. */
uint32_t isaac_exit_428590_capacity_elems(uint32_t begin, uint32_t cap);

/* Insert index: SAR32(insert_pos - begin, 2). PE @ 0x0042859b–0x004285a7. */
uint32_t isaac_exit_428590_insert_index(uint32_t begin, uint32_t insert_pos);

/* Max dword-vector length imm 0x3fffffff. */
uint32_t isaac_exit_428590_max_elems(void);

/* Length throw (host 0x415bc0) when size == MAX. PE @ 0x004285ad–0x004285b2. */
int32_t isaac_exit_428590_length_error_needed(uint32_t size);

/* needed = size + 1 (32-bit wrap). PE: lea ebx, [eax+1]. */
uint32_t isaac_exit_428590_needed_size(uint32_t size);

/* Geometric would overflow MAX: capacity > MAX - (capacity>>1).
   PE @ 0x004285cb–0x004285d3 → take new_cap = MAX path. */
int32_t isaac_exit_428590_geo_would_overflow(uint32_t capacity);

/* geometric = capacity + (capacity>>1). PE: lea eax, [edx+ecx]. */
uint32_t isaac_exit_428590_geometric_capacity(uint32_t capacity);

/* Select new_cap when !length_error:
   if geo_would_overflow → MAX;
   else max(geometric, needed). Does not clamp > MAX (caller checks).
   PE @ 0x004285d5 / 0x00428618–0x0042861f. */
uint32_t isaac_exit_428590_new_capacity(uint32_t capacity, uint32_t needed);

/* Capacity throw (host 0x40cee0) when selected new_cap > MAX.
   PE @ 0x00428622–0x00428628 (geometric path only in PE; still pure). */
int32_t isaac_exit_428590_capacity_error_needed(uint32_t new_capacity);

/* Alloc byte size for host 0x40cf00: new_cap * 4. PE: lea eax, [ecx*4]. */
uint32_t isaac_exit_428590_alloc_bytes(uint32_t new_capacity);

/* Post-alloc pure pointer math (host supplies new_begin from 0x40cf00). */
uint32_t isaac_exit_428590_insert_slot(uint32_t new_begin,
                                       uint32_t insert_index);
uint32_t isaac_exit_428590_new_end(uint32_t new_begin, uint32_t needed);
uint32_t isaac_exit_428590_new_cap_ptr(uint32_t new_begin,
                                       uint32_t alloc_bytes);

/* Append path when insert_pos == end (9b4810 push-grow always). */
int32_t isaac_exit_428590_insert_at_end(uint32_t insert_pos, uint32_t end);

/* Copy byte counts for host memmove IAT (32-bit wrap on sub). */
uint32_t isaac_exit_428590_copy_prefix_bytes(uint32_t begin,
                                             uint32_t insert_pos);
uint32_t isaac_exit_428590_copy_suffix_bytes(uint32_t end,
                                             uint32_t insert_pos);
/* Full buffer copy when append: end - begin. */
uint32_t isaac_exit_428590_copy_all_bytes(uint32_t begin, uint32_t end);

/* Old buffer free CF after host alloc+copy. */
int32_t isaac_exit_428590_old_free_needed(uint32_t begin);
/* capacity bytes = (cap - begin) & ~3. PE @ 0x00428654–0x00428659. */
uint32_t isaac_exit_428590_old_capacity_bytes(uint32_t begin, uint32_t cap);
/* size >= 0x1000 → heap-header free path. */
int32_t isaac_exit_428590_free_uses_heap_header(uint32_t capacity_bytes);
/* size' = size + 0x23 (wrap). */
uint32_t isaac_exit_428590_free_header_size(uint32_t capacity_bytes);
/* (begin - header - 4) <= 0x1f → valid header (continue free);
   else host abort IAT [0xb18894]. */
int32_t isaac_exit_428590_free_header_offset_ok(uint32_t begin,
                                                uint32_t header);

/* Combined pure plan from vector pointers + insert_pos.
   length_error / capacity_error gate host throws; alloc_bytes feeds
   host 0x40cf00. Does not allocate or write memory. */
typedef struct IsaacExit428590Plan {
  uint32_t size;           /* SAR32(end-begin,2) */
  uint32_t capacity;       /* SAR32(cap-begin,2) */
  uint32_t insert_index;   /* SAR32(insert_pos-begin,2) */
  uint32_t needed;         /* size+1 */
  uint32_t new_capacity;   /* selected (MAX on geo overflow) */
  uint32_t alloc_bytes;    /* new_capacity*4 */
  int32_t length_error;    /* size==MAX → host 0x415bc0 */
  int32_t capacity_error;  /* new_capacity>MAX → host 0x40cee0 */
  int32_t geo_overflow;    /* took MAX new_cap path */
  int32_t insert_at_end;   /* insert_pos==end */
} IsaacExit428590Plan;

void isaac_exit_428590_plan(IsaacExit428590Plan* out, uint32_t begin,
                            uint32_t end, uint32_t cap,
                            uint32_t insert_pos);

/* Post-alloc pure pointer pack when host returns new_begin (null-safe).
   Writes *out_end / *out_cap / *out_insert_slot when non-null. */
void isaac_exit_428590_post_alloc_ptrs(uint32_t new_begin, uint32_t needed,
                                       uint32_t alloc_bytes,
                                       uint32_t insert_index,
                                       uint32_t* out_end, uint32_t* out_cap,
                                       uint32_t* out_insert_slot);

/* --- ABI v16: ANM2::GetLayer(int) / ANM2::Load / alloc 0x40cf00 pure CF --- */

/* Layer stride imm 0xa0 (PE: lea eax,[esi+esi*4]; shl eax,5). */
uint32_t isaac_exit_anm2_layer_stride(void);

/* Signed in-range: layer_id >= 0 && layer_id < count (PE jl path). */
int32_t isaac_exit_anm2_getlayer_in_range(int32_t layer_id, int32_t count);

/* Pure layer pointer: base + layer_id * 0xa0 (32-bit wrap). */
uint32_t isaac_exit_anm2_layer_ptr(uint32_t layer_base, int32_t layer_id);

/* When in_range: write *out_layer = layer_ptr and return 1; else return 0
   (caller takes host OOB log/throw residual). Null out_layer still returns
   the in-range predicate. */
int32_t isaac_exit_anm2_getlayer_try(uint32_t layer_base, int32_t layer_id,
                                     int32_t count, uint32_t* out_layer);

/* Linear-memory GetLayer(int): read count@+0x80 and base@+0x7c from
   anm2_base. Returns layer addr or 0 when OOB / null base. */
uint32_t isaac_exit_anm2_getlayer_apply(const uint8_t* anm2_base,
                                        int32_t layer_id);

/* --- ANM2::Load pure islands (host string/parse/graphics residual) --- */

/* Path already present: size@+0x10 != 0 → host 0x40e2b0(this). */
int32_t isaac_exit_anm2_load_path_present(uint32_t path_size_10);

/* Path object is this (PE: cmp esi, edi; je skip assign). */
int32_t isaac_exit_anm2_load_path_is_self(uint32_t this_addr,
                                          uint32_t path_addr);

/* loadgraphics stack bool != 0 → host 0x40c000(this). */
int32_t isaac_exit_anm2_load_graphics_needed(uint32_t loadgraphics);

/* Pure post stores after 0x408830×2 (PE @ 0x0040bdb2–0x0040bdc3):
   byte +0x109 ← 1; dword +0x10c ← -1. */
typedef struct IsaacExitAnm2LoadPrefixState {
  uint8_t flag_109;
  uint32_t shadow_index_10c;
} IsaacExitAnm2LoadPrefixState;

void isaac_exit_anm2_load_prefix(IsaacExitAnm2LoadPrefixState* state);
void isaac_exit_anm2_load_prefix_ptrs(uint8_t* flag_109,
                                      uint32_t* shadow_index_10c);
void isaac_exit_anm2_load_prefix_apply(uint8_t* anm2_base);

/* Layer loop when count != 0 (PE: cmp [esi+0x80], ebx; jbe skip). */
int32_t isaac_exit_anm2_layer_loop_needed(uint32_t layer_count);

/* Byte offset of layer i: i * 0xa0. */
uint32_t isaac_exit_anm2_layer_byte_off(uint32_t index);

/* Layer name holder null → use empty C-string (PE: je 0xb1a4ec). */
int32_t isaac_exit_anm2_layer_name_holder_null(uint32_t holder_ptr);

/* Name string object addr from non-null holder: holder + 8. */
uint32_t isaac_exit_anm2_layer_name_str_addr(uint32_t holder_ptr);

/* Null-terminated PE-style equality (2-byte steps; 0 equal / 1 unequal).
   Used for layer name vs "shadow". Null name → unequal unless both empty. */
int32_t isaac_exit_anm2_cstr_equal(const uint8_t* a, const uint8_t* b);

/* Fixed compare against "shadow" (DAT_00b1a6c0). */
int32_t isaac_exit_anm2_name_is_shadow(const uint8_t* name);

/* First byte == '*' (0x2a). */
int32_t isaac_exit_anm2_name_is_star(uint32_t first_byte);

/* Shadow hit → store index into shadow slot (PE: mov [esi+0x10c], ebx). */
void isaac_exit_anm2_shadow_index_set(uint32_t* slot, uint32_t index);

/* Layer star flag OR: *flags |= 5. */
void isaac_exit_anm2_layer_star_flags_or(uint32_t* flags_slot);
uint32_t isaac_exit_anm2_layer_star_flags_value(uint32_t flags);

/* Global anm2+0x110 OR helpers. */
void isaac_exit_anm2_flags110_or_400(uint32_t* flags_slot);
void isaac_exit_anm2_flags110_or_800(uint32_t* flags_slot);
uint32_t isaac_exit_anm2_flags110_or_400_value(uint32_t flags);
uint32_t isaac_exit_anm2_flags110_or_800_value(uint32_t flags);

/* One layer-loop pure step (host supplies resolved C-string name).
   On shadow eq: write shadow_index = index.
   On leading '*': or layer_star_flags and global |0x400.
   Returns 1 if name was shadow. Null slots skipped. */
int32_t isaac_exit_anm2_load_layer_step(const uint8_t* name, uint32_t index,
                                        uint32_t* shadow_index_slot,
                                        uint32_t* layer_star_flags_slot,
                                        uint32_t* flags110_slot);

/* Sheet loop when count != 0 (PE: test edx; je skip). */
int32_t isaac_exit_anm2_sheet_loop_needed(uint32_t sheet_count);

/* Sheet stride imm 0x18. */
uint32_t isaac_exit_anm2_sheet_stride(void);

/* Sheet element base + index * 0x18. */
uint32_t isaac_exit_anm2_sheet_ptr(uint32_t sheet_base, uint32_t index);

/* One sheet-loop pure step: if name starts with '*', or flags110 |0x800. */
void isaac_exit_anm2_load_sheet_step(const uint8_t* name,
                                     uint32_t* flags110_slot);

/* --- nested alloc 0x0040cf00 pure size CF (body/alloc residual) --- */

/* size >= 0x1000 → heap-header path (PE @ 0x0040cf01). */
int32_t isaac_exit_40cf00_uses_heap_header(uint32_t size);

/* Small path null result when size == 0 (PE @ 0x0040cf30–0x0040cf3f). */
int32_t isaac_exit_40cf00_size_is_zero(uint32_t size);

/* Header request: size + 0x23 (wrap). */
uint32_t isaac_exit_40cf00_header_request_size(uint32_t size);

/* Overflow throw host 0x40cee0 when (size+0x23) <= size (unsigned). */
int32_t isaac_exit_40cf00_header_overflow(uint32_t size);

/* Bytes passed to host 0xa0f4c0 when !overflow:
   small: size (caller skips when size==0);
   large: size+0x23. */
uint32_t isaac_exit_40cf00_alloc_request_size(uint32_t size);

/* Align user pointer: (raw + 0x23) & ~0x1f (PE @ 0x0040cf1f–0x0040cf22). */
uint32_t isaac_exit_40cf00_align_user_ptr(uint32_t raw_ptr);

/* Header store slot: aligned - 4 (writes raw back). */
uint32_t isaac_exit_40cf00_header_slot(uint32_t aligned_user_ptr);

/* Combined pure plan (no allocation). */
typedef struct IsaacExit40cf00Plan {
  uint32_t size;
  uint32_t request_size; /* bytes for host 0xa0f4c0 (0 when size==0 small) */
  int32_t uses_header;   /* size >= 0x1000 */
  int32_t size_zero;     /* size == 0 */
  int32_t overflow;      /* large path overflow → host 0x40cee0 */
  int32_t skip_alloc;    /* size_zero || overflow */
} IsaacExit40cf00Plan;

void isaac_exit_40cf00_plan(IsaacExit40cf00Plan* out, uint32_t size);

/* After host returns raw on large path: return aligned user ptr.
   If header_slot is non-null, store raw into *header_slot (the dword at
   aligned-4). Null raw → 0 / no store. */
uint32_t isaac_exit_40cf00_finish_header(uint32_t* header_slot,
                                         uint32_t raw_ptr);

/* --- ABI v17: ANM2::ReplaceSpritesheet / Play path 0x40a5d0 pure CF --- */

/* Layer MSVC string (png path) offset from layer base: +8. */
uint32_t isaac_exit_anm2_layer_png_str_off(void);

/* Layer dirty/loaded flag byte offset: +0x30. */
uint32_t isaac_exit_anm2_layer_flag30_off(void);

/* Png string object address: layer_ptr + 8. */
uint32_t isaac_exit_anm2_layer_png_str_ptr(uint32_t layer_ptr);

/* Sized equality (exact PE 0x0040cae0 used by ReplaceSpritesheet):
   lengths must match, then content of that many bytes. Returns 1 equal. */
int32_t isaac_exit_anm2_sized_equal(const uint8_t* a, uint32_t len_a,
                                    const uint8_t* b, uint32_t len_b);

/* Assign host 0x40ccd0 needed when png_str object addr != path object. */
int32_t isaac_exit_anm2_replace_assign_needed(uint32_t png_str_addr,
                                              uint32_t path_addr);

/* Pure success store: *flag30 = 0 (PE mov byte [layer+0x30], 0). */
void isaac_exit_anm2_replace_flag30_clear(uint8_t* flag30);

/* Combined pure plan for ReplaceSpritesheet (no string assign body).
   layer_data/path_data may be null only when the corresponding size is 0. */
typedef struct IsaacExitAnm2ReplacePlan {
  int32_t in_range;       /* signed layer_id in [0, count) */
  int32_t already_equal;  /* sized equal → PE returns false early */
  int32_t assign_needed;  /* in_range && !equal && png_str != path */
  int32_t will_succeed;   /* in_range && !equal → clear flag30, ret true */
  int32_t return_bool;    /* PE AL: 0 OOB/equal, 1 success */
  uint32_t layer_ptr;     /* 0 when !in_range */
  uint32_t png_str_ptr;   /* layer+8 when in_range else 0 */
} IsaacExitAnm2ReplacePlan;

void isaac_exit_anm2_replace_plan(IsaacExitAnm2ReplacePlan* out,
                                  int32_t layer_id, int32_t count,
                                  uint32_t layer_base, uint32_t path_addr,
                                  const uint8_t* layer_data,
                                  uint32_t layer_size,
                                  const uint8_t* path_data,
                                  uint32_t path_size);

/* Success-path finish: when will_succeed, clear byte layer_host+0x30 and
   return 1; else return 0 with no store. layer_host is the layer element
   base (host pointer). */
int32_t isaac_exit_anm2_replace_finish(uint8_t* layer_host,
                                       int32_t will_succeed);

/* --- Play-by-name residual 0x0040a5d0 pure CF --- */

uint32_t isaac_exit_anm2_anim_stride(void);
uint32_t isaac_exit_anm2_anim_base_off(void);
uint32_t isaac_exit_anm2_anim_count_off(void);
uint32_t isaac_exit_anm2_play_state_off(void);

/* Anim table non-empty: count != 0 (PE: test ebx; je miss). */
int32_t isaac_exit_anm2_anim_loop_needed(uint32_t anim_count);

/* Anim entry pointer: base + index * 0x13c (32-bit wrap). */
uint32_t isaac_exit_anm2_anim_entry_ptr(uint32_t anim_base, uint32_t index);

/* AnimationState this for hit hosts: anm2 + 0x30. */
uint32_t isaac_exit_anm2_play_state_ptr(uint32_t anm2_addr);

/* reset stack bool != 0 → host 0x408830; else host 0x408970. */
int32_t isaac_exit_anm2_play_reset_needed(uint32_t reset);

/* One name-scan step: PE-inline cstr equal (reuse Load shadow comparator).
   Returns 1 on match. */
int32_t isaac_exit_anm2_play_name_match(const uint8_t* entry_name,
                                        const uint8_t* anim_name);

/* Combined pure plan after host-supplied scan result.
   found_index < 0 or >= count → miss (return 0, log residual). */
typedef struct IsaacExitAnm2PlayPlan {
  int32_t loop_needed;    /* anim_count != 0 */
  int32_t found;          /* valid found_index */
  int32_t miss_log_needed; /* !found → host 0xa112c0 */
  int32_t reset_needed;   /* hit && reset → 0x408830 else 0x408970 */
  int32_t return_bool;    /* PE AL */
  uint32_t entry_ptr;     /* anim_base + found_index * stride when found */
  uint32_t state_ptr;     /* anm2 + 0x30 when found else 0 */
} IsaacExitAnm2PlayPlan;

void isaac_exit_anm2_play_plan(IsaacExitAnm2PlayPlan* out, uint32_t anm2_addr,
                               uint32_t anim_base, uint32_t anim_count,
                               int32_t found_index, uint32_t reset);

/* Linear-memory name scan over anim table (MSVC string at each entry;
   same address model as tree/string helpers). Writes *out_index on hit
   and returns 1; else returns 0 and *out_index = -1. anim_name is a
   null-terminated C string (stack arg). count==0 → miss. */
int32_t isaac_exit_anm2_play_find(uint32_t anim_base, uint32_t anim_count,
                                  const uint8_t* anim_name,
                                  int32_t* out_index);

/* --- ABI v18: exact AnimationState::Rewind 0x0040a1b0 pure CF --- */

uint32_t isaac_exit_animstate_anim_off(void);
uint32_t isaac_exit_animstate_layer_arr_off(void);
uint32_t isaac_exit_animstate_null_arr_off(void);
uint32_t isaac_exit_animstate_frame_off(void);
uint32_t isaac_exit_animstate_mask18_off(void);
uint32_t isaac_exit_animstate_mask1c_off(void);
uint32_t isaac_exit_animdata_layer_count_off(void);
uint32_t isaac_exit_animdata_null_count_off(void);
uint32_t isaac_exit_animdata_event_base_off(void);
uint32_t isaac_exit_animdata_event_count_off(void);
uint32_t isaac_exit_anim_event_stride(void);

/* Entry pure stores @ 0x0040a1b3–0x0040a1c7: frame + both masks ← 0. */
void isaac_exit_animstate_rewind_prefix(float* frame, uint32_t* mask18,
                                        uint32_t* mask1c);

/* Apply prefix zeros onto a host AnimationState object. */
void isaac_exit_animstate_rewind_prefix_apply(uint8_t* state);

/* Nested 0x00408c90 pure CF (called with this still = AnimationState). */

/* anim ptr non-null. Null → host log 0xa112c0 then PE continues (UB). */
int32_t isaac_exit_animstate_408c90_anim_present(uint32_t anim_ptr);

/* !anim_present → residual log path. */
int32_t isaac_exit_animstate_408c90_log_needed(uint32_t anim_ptr);

/* event count @ anim+0x2c != 0 (unsigned jbe). */
int32_t isaac_exit_animstate_408c90_event_loop_needed(uint32_t event_count);

/* PE: movd+cvtdq2ps event_frame_i32; ucomiss vs state frame; ordered equal
   (lahf; test ah,0x44; jp skip). NaN → not equal. */
int32_t isaac_exit_animstate_408c90_event_frame_eq(float state_frame,
                                                   int32_t event_frame_i32);

/* PE bts on 32-bit register: bit index taken modulo 32. */
uint32_t isaac_exit_animstate_408c90_mask_bts(uint32_t mask,
                                              uint32_t bit_index);

/* One event step: when frame eq, bts both masks with bit_index. */
void isaac_exit_animstate_408c90_event_step(uint32_t* mask18,
                                            uint32_t* mask1c,
                                            float state_frame,
                                            int32_t bit_index,
                                            int32_t event_frame_i32);

/* Pure-complete 0x408c90 body over host buffers (anim non-null). Reads
   event_base@+0x28 / count@+0x2c, state frame@+0x10; writes masks. */
void isaac_exit_animstate_408c90_apply(uint8_t* state, const uint8_t* anim);

/* Post-Rewind zero-loop CF. */
int32_t isaac_exit_animstate_rewind_layer_loop_needed(uint32_t layer_count);
int32_t isaac_exit_animstate_rewind_null_loop_needed(uint32_t null_count);

/* Zero count dwords at arr (PE loops @ 0x40a1e0 / 0x40a200). */
void isaac_exit_animstate_rewind_zero_u32_n(uint32_t* arr, uint32_t count);

/* Apply both post-call zero loops using counts from anim and array ptrs
   from state (+8 / +0xc). Null arr with count>0 is host UB (not gated). */
void isaac_exit_animstate_rewind_zero_arrays(uint8_t* state,
                                             const uint8_t* anim);

/* Combined pure plan from host-supplied counts / anim ptr. */
typedef struct IsaacExitAnimStateRewindPlan {
  int32_t anim_present;       /* anim_ptr != 0 */
  int32_t log_needed;         /* !anim_present → host 0xa112c0 */
  int32_t event_loop_needed;  /* event_count != 0 (when present) */
  int32_t layer_loop_needed;  /* layer_count != 0 (when present) */
  int32_t null_loop_needed;   /* null_count != 0 (when present) */
  int32_t pure_complete_ok;   /* anim present → full pure body runnable */
  uint32_t anim_ptr;
  uint32_t event_count;
  uint32_t layer_count;
  uint32_t null_count;
} IsaacExitAnimStateRewindPlan;

void isaac_exit_animstate_rewind_plan(IsaacExitAnimStateRewindPlan* out,
                                      uint32_t anim_ptr, uint32_t event_count,
                                      uint32_t layer_count,
                                      uint32_t null_count);

/* Full pure-complete Rewind over host state+anim (anim must be non-null).
   Order: prefix zeros → 408c90 apply → layer/null zero loops. */
void isaac_exit_animstate_rewind_apply(uint8_t* state, const uint8_t* anim);

/* Linear-memory pure-complete Rewind (same address model as tree helpers).
   Returns 1 when anim@state+4 non-null and body ran; 0 when anim null
   (caller must residual-log; PE post-null is UB). */
int32_t isaac_exit_animstate_rewind_apply_addr(uint32_t state_addr);

/* --- ABI v19: residual MSVC string assign 0x0040ccd0 pure CF --- */

/* Max string size imm 0x7fffffff. */
uint32_t isaac_exit_40ccd0_max_size(void);

/* No-grow when count <= capacity (unsigned ja). PE @ 0x0040cce2. */
int32_t isaac_exit_40ccd0_fits_capacity(uint32_t count, uint32_t capacity);

/* Length throw host 0x40ccc0 when count > MAX. PE @ 0x0040cd0e. */
int32_t isaac_exit_40ccd0_length_error_needed(uint32_t count);

/* Dest data: capacity < 0x10 → str_addr (SSO); else dword0 heap ptr.
   Same model as isaac_exit_msvc_string_data_addr. */
uint32_t isaac_exit_40ccd0_dest_data_addr(uint32_t str_addr, uint32_t capacity,
                                          uint32_t dword0);

/* rounded = count | 0xf. PE @ 0x0040cd1a–0x0040cd1c. */
uint32_t isaac_exit_40ccd0_rounded_capacity(uint32_t count);

/* rounded > MAX → take new_cap = MAX before geo. PE @ 0x0040cd1f. */
int32_t isaac_exit_40ccd0_rounded_overflow(uint32_t count);

/* Geometric would overflow MAX: capacity > MAX - (capacity>>1).
   PE @ 0x0040cd2e–0x0040cd3b. */
int32_t isaac_exit_40ccd0_geo_would_overflow(uint32_t capacity);

/* geometric = capacity + (capacity>>1). PE: lea eax, [edx+ecx]. */
uint32_t isaac_exit_40ccd0_geometric_capacity(uint32_t capacity);

/* Select new_cap when !length_error && !fits:
   if rounded > MAX → MAX;
   else if geo_would_overflow → MAX;
   else max(rounded, geometric). */
uint32_t isaac_exit_40ccd0_new_capacity(uint32_t capacity, uint32_t count);

/* Alloc size for host 0x40cf00: new_cap + 1. PE: lea ecx, [ebx+1]. */
uint32_t isaac_exit_40ccd0_alloc_size(uint32_t new_capacity);

/* Old buffer free when grow and capacity >= 0x10. PE @ 0x0040cd74. */
int32_t isaac_exit_40ccd0_old_free_needed(uint32_t old_capacity);

/* Free byte count: old_cap + 1. PE: lea ecx, [eax+1]. */
uint32_t isaac_exit_40ccd0_free_size(uint32_t old_capacity);

/* free_size >= 0x1000 → heap-header free path. */
int32_t isaac_exit_40ccd0_free_uses_heap_header(uint32_t free_size);

/* free_size' = free_size + 0x23 (wrap). */
uint32_t isaac_exit_40ccd0_free_header_size(uint32_t free_size);

/* (old_ptr - header - 4) <= 0x1f → valid header (continue free);
   else host abort IAT [0xb18894]. */
int32_t isaac_exit_40ccd0_free_header_offset_ok(uint32_t old_ptr,
                                                uint32_t header);

/* Pure field stores. */
void isaac_exit_40ccd0_store_size(uint32_t* size_slot, uint32_t count);
void isaac_exit_40ccd0_store_capacity(uint32_t* cap_slot, uint32_t new_cap);
void isaac_exit_40ccd0_store_ptr(uint32_t* dword0_slot, uint32_t new_ptr);
void isaac_exit_40ccd0_null_term(uint8_t* dest, uint32_t count);

/* Pure copy count bytes then null-term (no-grow freestanding path).
   Null dest/src skipped for the corresponding half; size store separate. */
void isaac_exit_40ccd0_copy_and_term(uint8_t* dest, const uint8_t* src,
                                     uint32_t count);

/* No-grow pure-complete over host buffers: copy+term + size store.
   When dest or size_slot is null, that half is skipped. */
void isaac_exit_40ccd0_nongrow_finish(uint8_t* dest, uint32_t* size_slot,
                                      const uint8_t* src, uint32_t count);

/* Grow-path pure field pack after host alloc returns new_ptr (before copy):
   size ← count, capacity ← new_cap. */
void isaac_exit_40ccd0_grow_pre_copy(uint32_t* size_slot, uint32_t* cap_slot,
                                     uint32_t count, uint32_t new_cap);

/* Grow-path pure ptr store after host free: dword0 ← new_ptr. */
void isaac_exit_40ccd0_grow_post_free(uint32_t* dword0_slot, uint32_t new_ptr);

/* Combined pure plan from host-supplied count + capacity + str/dword0.
   Does not allocate, free, or copy. length_error gates host throw;
   grow_needed feeds host 0x40cf00(alloc_size). */
typedef struct IsaacExit40ccd0Plan {
  uint32_t count;
  uint32_t capacity;       /* old capacity */
  uint32_t dest_data;      /* SSO/heap dest when fits; 0 when grow/error */
  uint32_t new_capacity;   /* selected when grow; else capacity or 0 */
  uint32_t alloc_size;     /* new_cap+1 when grow else 0 */
  uint32_t free_size;      /* old_cap+1 when old_free else 0 */
  int32_t fits;            /* count <= capacity */
  int32_t length_error;    /* count > MAX → host 0x40ccc0 */
  int32_t grow_needed;     /* !fits && !length_error */
  int32_t rounded_overflow;/* took MAX from count|0xf > MAX */
  int32_t geo_overflow;    /* took MAX from geo path */
  int32_t old_free_needed; /* grow && capacity >= 0x10 */
  int32_t free_uses_header;/* free_size >= 0x1000 */
  int32_t sso_inline;      /* capacity < 0x10 */
} IsaacExit40ccd0Plan;

void isaac_exit_40ccd0_plan(IsaacExit40ccd0Plan* out, uint32_t str_addr,
                            uint32_t capacity, uint32_t dword0,
                            uint32_t count);

/* --- ABI v20: residual keep-set host 0x00408970 pure CF --- */

/* Null-safe count select: obj_addr==0 → 0; else host-supplied loaded_count
   (PE loads [obj+0x1c] / [obj+0x24] when obj non-null). */
uint32_t isaac_exit_408970_count_select(uint32_t obj_addr,
                                        uint32_t loaded_count);

/* Count equality (skip resize when equal). PE: cmp; je. */
int32_t isaac_exit_408970_counts_equal(uint32_t old_count, uint32_t new_count);
int32_t isaac_exit_408970_counts_differ(uint32_t old_count, uint32_t new_count);

/* Signed new-count > 0 → realloc path (PE: test; jg). */
int32_t isaac_exit_408970_new_count_positive(uint32_t new_count);

/* Signed old-count > 0 → memcpy from old buffer (PE: test; jle skip). */
int32_t isaac_exit_408970_copy_needed(uint32_t old_count);

/* Buffer host free/alloc gate: ptr != 0. */
int32_t isaac_exit_408970_ptr_nonzero(uint32_t ptr);

/* Overflow-safe alloc byte size: count * 4 with seto → 0xffffffff
   (same mul/seto/neg/or pattern as 0x408830). */
uint32_t isaac_exit_408970_alloc_size(uint32_t count);

/* Memset/fill byte count: count * 4 via lea [count*4] (no overflow check). */
uint32_t isaac_exit_408970_fill_size(uint32_t count);

/* Memcpy byte count: old_count << 2 (PE: shl eax, 2). */
uint32_t isaac_exit_408970_copy_size(uint32_t old_count);

/* Memset fill immediate 0xff. */
uint8_t isaac_exit_408970_fill_byte(void);

/* Heap free stats base: global!=0 → global+0x30 else 0xc7f618.
   PE @ 0x00408a71–0x00408a85 and twin. Host-supplied global value. */
uint32_t isaac_exit_408970_heap_stats_base(uint32_t heap_stats_global);

/* Free block pointer for IAT free: buf_ptr - 4 (PE: add ecx, -4). */
uint32_t isaac_exit_408970_free_block_ptr(uint32_t buf_ptr);

/* Pure field stores. */
void isaac_exit_408970_store_arg(uint32_t* field4_slot, uint32_t arg);
void isaac_exit_408970_store_arg_apply(uint8_t* this_base, uint32_t arg);
void isaac_exit_408970_store_buf_a(uint32_t* field8_slot, uint32_t ptr);
void isaac_exit_408970_store_buf_b(uint32_t* fieldc_slot, uint32_t ptr);
void isaac_exit_408970_ptr_clear(uint32_t* slot);

/* Linear-memory field stores (null this_base is a no-op). */
void isaac_exit_408970_store_buf_a_apply(uint8_t* this_base, uint32_t ptr);
void isaac_exit_408970_store_buf_b_apply(uint8_t* this_base, uint32_t ptr);
void isaac_exit_408970_clear_buf_a_apply(uint8_t* this_base);
void isaac_exit_408970_clear_buf_b_apply(uint8_t* this_base);

/* One buffer's pure plan (A or B). Host supplies counts + current buf ptr. */
typedef struct IsaacExit408970BufferPlan {
  uint32_t old_count;
  uint32_t new_count;
  uint32_t alloc_size;    /* when realloc */
  uint32_t fill_size;     /* when realloc */
  uint32_t copy_size;     /* when copy_needed */
  uint32_t free_block_ptr;/* old_buf-4 when heap_free_needed else 0 */
  int32_t counts_differ;
  int32_t new_positive;     /* signed > 0 */
  int32_t free_nonpositive; /* differ && !new_positive */
  int32_t a648b0_free_needed; /* free_nonpositive && old_buf != 0 */
  int32_t realloc_needed;   /* differ && new_positive */
  int32_t copy_needed;      /* realloc && old_count > 0 signed */
  int32_t heap_free_needed; /* realloc && old_buf != 0 */
} IsaacExit408970BufferPlan;

void isaac_exit_408970_buffer_plan(IsaacExit408970BufferPlan* out,
                                   uint32_t old_count, uint32_t new_count,
                                   uint32_t old_buf_ptr);

/* Combined pure plan for both buffers + terminal arg store.
   Host-supplied resolved counts (after null-safe select) + buffer ptrs
   + stack arg address for terminal this+4 store.
   Does not allocate, free, memset, or memcpy.
   PE note: after buffer-B realloc, new ptr is stored at this+8 (field A),
   and this+0xc is zeroed when heap free of old B ran (or left null). */
typedef struct IsaacExit408970Plan {
  uint32_t old_count_a;
  uint32_t new_count_a;
  uint32_t old_count_b;
  uint32_t new_count_b;
  uint32_t terminal_arg; /* stack arg → this+4 always */
  /* Buffer A plan fields (flat for wasm layout). */
  uint32_t a_alloc_size;
  uint32_t a_fill_size;
  uint32_t a_copy_size;
  uint32_t a_free_block_ptr;
  int32_t a_counts_differ;
  int32_t a_new_positive;
  int32_t a_free_nonpositive;
  int32_t a_a648b0_free_needed;
  int32_t a_realloc_needed;
  int32_t a_copy_needed;
  int32_t a_heap_free_needed;
  /* Buffer B plan fields. */
  uint32_t b_alloc_size;
  uint32_t b_fill_size;
  uint32_t b_copy_size;
  uint32_t b_free_block_ptr;
  int32_t b_counts_differ;
  int32_t b_new_positive;
  int32_t b_free_nonpositive;
  int32_t b_a648b0_free_needed;
  int32_t b_realloc_needed;
  int32_t b_copy_needed;
  int32_t b_heap_free_needed;
  /* PE: B realloc stores new ptr at this+8 (same as A). */
  int32_t b_store_new_at_a_slot;
} IsaacExit408970Plan;

void isaac_exit_408970_plan(IsaacExit408970Plan* out, uint32_t old_count_a,
                            uint32_t new_count_a, uint32_t old_count_b,
                            uint32_t new_count_b, uint32_t buf_a_ptr,
                            uint32_t buf_b_ptr, uint32_t new_arg_addr);

/* --- ABI v21: residual Load nested host 0x0040db90 pure CF --- */

/* Path size@+0x10 != 0 → enter body (else early ret). */
int32_t isaac_exit_40db90_path_size_present(uint32_t path_size_10);
int32_t isaac_exit_40db90_early_return(uint32_t path_size_10);

/* QPC host pair (lo,hi) → pure high64(qpc * magic) >> 18.
   magic = 0x431bde82d7b634db (PE imm pair). Writes out_lo/out_hi. */
void isaac_exit_40db90_timing_scale(uint32_t qpc_lo, uint32_t qpc_hi,
                                    uint32_t* out_lo, uint32_t* out_hi);

/* 64-bit timing delta: end - start (lo/hi pairs). */
void isaac_exit_40db90_timing_delta(uint32_t end_lo, uint32_t end_hi,
                                    uint32_t start_lo, uint32_t start_hi,
                                    uint32_t* out_lo, uint32_t* out_hi);

/* Cache list space: (end - begin) >= 4 (unsigned). */
int32_t isaac_exit_40db90_cache_space_ok(uint32_t begin, uint32_t end);

/* Walk done when walk == end. */
int32_t isaac_exit_40db90_cache_walk_done(uint32_t walk, uint32_t end);

/* walk + 4 (ptr stride). */
uint32_t isaac_exit_40db90_cache_walk_next(uint32_t walk);

/* Post-lower_bound hit: !isnil && key >= node_key → node else sentinel. */
uint32_t isaac_exit_40db90_tree_hit_select(uint32_t node_addr,
                                           uint32_t isnil_byte,
                                           uint32_t node_key, uint32_t key,
                                           uint32_t sentinel_addr);

/* node == sentinel → cache miss / log path. */
int32_t isaac_exit_40db90_node_is_sentinel(uint32_t node_addr,
                                           uint32_t sentinel_addr);
int32_t isaac_exit_40db90_cache_miss(uint32_t node_addr,
                                     uint32_t sentinel_addr);

/* Insert path when miss, or hit with flag@+0x14 != 0 and file_ptr != 0. */
int32_t isaac_exit_40db90_insert_needed(uint32_t node_addr,
                                        uint32_t sentinel_addr,
                                        uint32_t flag14, uint32_t file_ptr);

/* Heap free stats base (same select as 0x408970). */
uint32_t isaac_exit_40db90_heap_stats_base(uint32_t heap_stats_global);

/* Temp buffer free: ptr != 0; free block = ptr - 4. */
int32_t isaac_exit_40db90_temp_free_needed(uint32_t ptr);
uint32_t isaac_exit_40db90_free_block_ptr(uint32_t buf_ptr);

/* Old layer array free when anm2+0x7c != 0. */
int32_t isaac_exit_40db90_layer_array_present(uint32_t layer_base_ptr);

/* Free byte size from header count: count*0xa0 + 4 (wrap, no OF check). */
uint32_t isaac_exit_40db90_old_layer_free_size(uint32_t header_count);

/* Layer count != 0 → alloc + fill loop. */
int32_t isaac_exit_40db90_layer_count_nonzero(uint32_t count);

/* Alloc request: count*0xa0 (seto→-1) then +4 (setb→-1). */
uint32_t isaac_exit_40db90_layer_alloc_size(uint32_t count);

/* Alloc ok / user ptr after header dword. */
int32_t isaac_exit_40db90_alloc_ok(uint32_t raw_ptr);
uint32_t isaac_exit_40db90_user_ptr_after_header(uint32_t raw_ptr);

/* Layer loop CF: index < count (unsigned); strides; ptr math; backptr. */
int32_t isaac_exit_40db90_layer_loop_needed(uint32_t index, uint32_t count);
uint32_t isaac_exit_40db90_src_layer_stride(void);
uint32_t isaac_exit_40db90_dst_layer_stride(void);
uint32_t isaac_exit_40db90_src_layer_ptr(uint32_t src_base, uint32_t index);
uint32_t isaac_exit_40db90_dst_layer_ptr(uint32_t dst_base, uint32_t index);
void isaac_exit_40db90_store_layer_backptr(uint32_t* backptr_slot,
                                           uint32_t anm2_addr);
void isaac_exit_40db90_store_layer_backptr_at(uint8_t* dst_layer,
                                              uint32_t anm2_addr);

/* Name string assign skip when &anm2+0x18 == &node+0x38 (same addr). */
int32_t isaac_exit_40db90_name_assign_needed(uint32_t anm2_name_addr,
                                             uint32_t node_name_addr);

/* Pure field pack from host-supplied node fields → anm2 slots. */
typedef struct IsaacExit40db90FieldPack {
  uint32_t layer_count; /* → anm2+0x80 */
  uint32_t field74;     /* node+0x20 */
  uint32_t field78;     /* node+0x24 */
  uint32_t field84;     /* node+0x28 */
  uint32_t field88;     /* node+0x2c */
  uint32_t field8c;     /* node+0x30 */
  uint32_t field90;     /* node+0x34 */
} IsaacExit40db90FieldPack;

void isaac_exit_40db90_field_pack(IsaacExit40db90FieldPack* out,
                                  uint32_t layer_count, uint32_t f20,
                                  uint32_t f24, uint32_t f28, uint32_t f2c,
                                  uint32_t f30, uint32_t f34);
void isaac_exit_40db90_field_pack_apply(uint8_t* anm2_base,
                                        const IsaacExit40db90FieldPack* pack);

/* Combined pure plan (no host bodies). Host supplies path size, QPC pair,
   cache begin/end, lower_bound node fields, file ptr, layer base, counts. */
typedef struct IsaacExit40db90Plan {
  uint32_t path_size;
  uint32_t timing_lo;
  uint32_t timing_hi;
  uint32_t cache_begin;
  uint32_t cache_end;
  uint32_t node_addr;
  uint32_t sentinel_addr;
  uint32_t layer_base_ptr;
  uint32_t layer_count;
  uint32_t layer_alloc_size;
  uint32_t old_free_size;
  uint32_t free_block_ptr; /* temp file buf-4 when temp free else 0 */
  int32_t path_present;
  int32_t early_return;
  int32_t cache_space_ok;
  int32_t cache_walk_done;
  int32_t cache_miss;
  int32_t insert_needed;
  int32_t temp_free_needed;
  int32_t layer_array_present;
  int32_t layer_count_nonzero;
  int32_t layer_loop_needed; /* count != 0 */
  int32_t name_assign_needed;
} IsaacExit40db90Plan;

void isaac_exit_40db90_plan(
    IsaacExit40db90Plan* out, uint32_t path_size, uint32_t qpc_lo,
    uint32_t qpc_hi, uint32_t cache_begin, uint32_t cache_end,
    uint32_t node_addr, uint32_t isnil_byte, uint32_t node_key, uint32_t key,
    uint32_t sentinel_addr, uint32_t flag14, uint32_t file_ptr,
    uint32_t layer_base_ptr, uint32_t layer_count, uint32_t header_count,
    uint32_t anm2_name_addr, uint32_t node_name_addr);

/* --- ABI v22: residual Load sibling host 0x0040e110 pure CF --- */

/* Cache list space: test (end-begin), 0xfffffffc; jne skip grow.
   Equivalent to (end-begin) >= 4 for all uint32 when bits align; PE uses
   the mask form. */
int32_t isaac_exit_40e110_cache_space_ok(uint32_t begin, uint32_t end);

/* Walk done when walk == end; next = walk + 4. */
int32_t isaac_exit_40e110_cache_walk_done(uint32_t walk, uint32_t end);
uint32_t isaac_exit_40e110_cache_walk_next(uint32_t walk);

/* Path SSO data: cap < 0x10 → str_addr else dword0 (same as MSVC helper). */
uint32_t isaac_exit_40e110_path_data_addr(uint32_t str_addr, uint32_t capacity,
                                          uint32_t dword0);

/* IAT path-canonicalize buffer size imm 0x100. */
uint32_t isaac_exit_40e110_path_buf_size(void);

/* Post-lower_bound hit: !isnil && key >= node_key → node else sentinel. */
uint32_t isaac_exit_40e110_tree_hit_select(uint32_t node_addr,
                                           uint32_t isnil_byte,
                                           uint32_t node_key, uint32_t key,
                                           uint32_t sentinel_addr);

/* node == sentinel → miss / host log; else hit / pure refcount++. */
int32_t isaac_exit_40e110_node_is_sentinel(uint32_t node_addr,
                                           uint32_t sentinel_addr);
int32_t isaac_exit_40e110_cache_hit(uint32_t node_addr,
                                    uint32_t sentinel_addr);
int32_t isaac_exit_40e110_cache_miss(uint32_t node_addr,
                                     uint32_t sentinel_addr);
int32_t isaac_exit_40e110_log_needed(uint32_t node_addr,
                                     uint32_t sentinel_addr);

/* Pure refcount: prior+1 (wrap); store at node+0x50. */
uint32_t isaac_exit_40e110_refcount_inc(uint32_t prior);
void isaac_exit_40e110_refcount_store(uint32_t* slot, uint32_t value);
void isaac_exit_40e110_refcount_inc_apply(uint8_t* node_base);

/* Grow path: install triple when grow_result != DAT_00c798b8. */
int32_t isaac_exit_40e110_grow_install_needed(uint32_t grow_result);
/* Zero three dwords at grow result object after global install. */
void isaac_exit_40e110_grow_result_clear(uint32_t* grow_obj);
void isaac_exit_40e110_grow_result_clear_at(uint8_t* grow_base);

/* Combined pure plan (no host bodies). */
typedef struct IsaacExit40e110Plan {
  uint32_t cache_begin;
  uint32_t cache_end;
  uint32_t node_addr; /* selected after hit-select */
  uint32_t sentinel_addr;
  uint32_t path_data_addr;
  uint32_t path_buf_size;
  uint32_t refcount_next; /* prior+1 when hit else 0 */
  int32_t cache_space_ok;
  int32_t cache_walk_done;
  int32_t grow_install_needed;
  int32_t cache_hit;
  int32_t cache_miss;
  int32_t log_needed;
  int32_t refcount_inc_needed; /* same as cache_hit */
} IsaacExit40e110Plan;

void isaac_exit_40e110_plan(IsaacExit40e110Plan* out, uint32_t cache_begin,
                            uint32_t cache_end, uint32_t node_addr,
                            uint32_t isnil_byte, uint32_t node_key,
                            uint32_t key, uint32_t sentinel_addr,
                            uint32_t path_str_addr, uint32_t path_capacity,
                            uint32_t path_dword0, uint32_t grow_result,
                            uint32_t refcount_prior);

/* --- ABI v23: residual ANM2 graphics walk host 0x0040c000 pure CF --- */

/* Layer count@+0x80 != 0 → enter loop (PE: jbe done when count == 0). */
int32_t isaac_exit_40c000_layer_count_nonzero(uint32_t count);
/* index < count (unsigned) → continue loop body. */
int32_t isaac_exit_40c000_loop_needed(uint32_t index, uint32_t count);
uint32_t isaac_exit_40c000_layer_stride(void);
uint32_t isaac_exit_40c000_layer_byte_off(uint32_t index);
uint32_t isaac_exit_40c000_layer_ptr(uint32_t layer_base, uint32_t index);
/* flag@layer+0x30 != 0 → skip body (PE jne next). */
int32_t isaac_exit_40c000_layer_skip(uint32_t flag30);
int32_t isaac_exit_40c000_layer_body_needed(uint32_t flag30);
/* PNG MSVC string at layer+8. */
uint32_t isaac_exit_40c000_png_str_ptr(uint32_t layer_ptr);
/* Path SSO data select (same MSVC helper as 40e110). */
uint32_t isaac_exit_40c000_path_data_addr(uint32_t str_addr, uint32_t capacity,
                                          uint32_t dword0);
/* Shared-ptr object present (PE: test ecx; je flag=0). */
int32_t isaac_exit_40c000_shared_present(uint32_t shared_ptr);
/* Virtual AL success (PE: test al; je flag=0). */
int32_t isaac_exit_40c000_virtual_ok(uint32_t virtual_al);
/* Graphics flag byte: shared_present && virtual_ok → 1 else 0. */
uint8_t isaac_exit_40c000_graphics_flag(uint32_t shared_ptr,
                                        uint32_t virtual_al);
/* Sprite object from host 0x408590 non-null. */
int32_t isaac_exit_40c000_sprite_present(uint32_t sprite_ptr);
/* Generic non-null object gate (COM release / pair.ctrl paths). */
int32_t isaac_exit_40c000_object_present(uint32_t obj_ptr);
/* Callback when virtual_al != 0 AND DAT_00c7163c != 0 (same as 40c7f0). */
int32_t isaac_exit_40c000_callback_needed(uint32_t virtual_al,
                                          uint32_t global_fn);
/* Stack pair pure: zero both dwords; assign value@+0 / ctrl@+4. */
void isaac_exit_40c000_pair_zero(uint32_t* pair);
void isaac_exit_40c000_pair_assign(uint32_t* pair, uint32_t value,
                                   uint32_t ctrl);
void isaac_exit_40c000_pair_zero_at(uint8_t* pair_base);
void isaac_exit_40c000_pair_assign_at(uint8_t* pair_base, uint32_t value,
                                      uint32_t ctrl);
/* Pure flag stores after hosts: [layer+0x30]=flag; [layer+0x31]=0. */
void isaac_exit_40c000_store_layer_flags(uint8_t* flag30_slot,
                                         uint8_t* flag31_slot, uint32_t flag);
void isaac_exit_40c000_store_layer_flags_at(uint8_t* layer_base, uint32_t flag);
/* Loop advance: index+1; byte_off+0xa0. */
uint32_t isaac_exit_40c000_loop_next_index(uint32_t index);
uint32_t isaac_exit_40c000_loop_next_off(uint32_t byte_off);

/* Pure-complete freestanding 0x0040c1e0: [this]=-1; +4=0; +8=0; +0xc=1. */
typedef struct IsaacExit40c1e0State {
  uint32_t field0;
  uint32_t field4;
  uint32_t field8;
  uint8_t field_c;
} IsaacExit40c1e0State;

void isaac_exit_40c1e0_init(IsaacExit40c1e0State* state);
void isaac_exit_40c1e0_apply(uint8_t* obj_base);

/* Combined pure plan for one layer step (no host bodies). Host supplies
   count/base/index, layer flag30, path string fields, shared_ptr + virtual
   AL from LoadImage path, sprite_ptr from 408590, callback virtual/global. */
typedef struct IsaacExit40c000Plan {
  uint32_t layer_count;
  uint32_t layer_base_ptr;
  uint32_t index;
  uint32_t layer_ptr;
  uint32_t layer_byte_off;
  uint32_t png_str_ptr;
  uint32_t path_data_addr;
  uint32_t graphics_flag; /* 0/1 as u32 */
  int32_t count_nonzero;
  int32_t loop_needed;
  int32_t layer_skip;
  int32_t layer_body_needed;
  int32_t shared_present;
  int32_t virtual_ok;
  int32_t sprite_present;
  int32_t store_flags_needed; /* body path stores flags after hosts */
  int32_t callback_needed;
} IsaacExit40c000Plan;

void isaac_exit_40c000_plan(IsaacExit40c000Plan* out, uint32_t layer_count,
                            uint32_t layer_base_ptr, uint32_t index,
                            uint32_t flag30, uint32_t path_capacity,
                            uint32_t path_dword0, uint32_t shared_ptr,
                            uint32_t shared_virtual_al, uint32_t sprite_ptr,
                            uint32_t callback_virtual_al,
                            uint32_t callback_global_fn);

/* --- ABI v24: residual layer-attach host 0x00408640 pure CF --- */

/* Stack arg0 (source object) non-null → pure field copy runs. */
int32_t isaac_exit_408640_source_present(uint32_t src_ptr);
/* Stack arg1 (shared ctrl) non-null → virtual COM release path. */
int32_t isaac_exit_408640_ctrl_present(uint32_t ctrl_ptr);
/* Virtual AL success after COM release (test al; je skip callback). */
int32_t isaac_exit_408640_virtual_ok(uint32_t virtual_al);
/* Callback when virtual_al != 0 AND DAT_00c7163c != 0. */
int32_t isaac_exit_408640_callback_needed(uint32_t virtual_al,
                                          uint32_t global_fn);
/* Pointer math: layer destinations / source pack / pair slot. */
uint32_t isaac_exit_408640_dst_field_ptr(uint32_t layer_ptr);
uint32_t isaac_exit_408640_src_field_ptr(uint32_t src_ptr);
uint32_t isaac_exit_408640_pair_slot_ptr(uint32_t layer_ptr);
uint32_t isaac_exit_408640_dst_field_off(void);
uint32_t isaac_exit_408640_src_field_off(void);
uint32_t isaac_exit_408640_pair_slot_off(void);
uint32_t isaac_exit_408640_field_dwords(void);
/* Pure 4-dword pack: [layer+0x20..0x2c] ← [src+0x30..0x3c]. */
void isaac_exit_408640_field_copy(uint32_t* dst4, const uint32_t* src4);
void isaac_exit_408640_field_copy_at(uint8_t* layer_base,
                                     const uint8_t* src_obj);
/* Gate + copy: only when src_obj non-null (matches PE je skip). */
void isaac_exit_408640_field_copy_if_present_at(uint8_t* layer_base,
                                                const uint8_t* src_obj);

/* Combined pure plan (no host bodies). Host supplies layer this, stack
   src/ctrl, virtual AL from COM release, and global callback fn. */
typedef struct IsaacExit408640Plan {
  uint32_t layer_ptr;
  uint32_t src_ptr;
  uint32_t ctrl_ptr;
  uint32_t dst_field_ptr;
  uint32_t src_field_ptr; /* 0 when source absent */
  uint32_t pair_slot_ptr;
  int32_t source_present;
  int32_t field_copy_needed; /* same as source_present */
  int32_t ctrl_present;
  int32_t virtual_ok;
  int32_t callback_needed;
  int32_t pair_swap_host_needed; /* always 1: host 0x40c3b0 always runs */
} IsaacExit408640Plan;

void isaac_exit_408640_plan(IsaacExit408640Plan* out, uint32_t layer_ptr,
                            uint32_t src_ptr, uint32_t ctrl_ptr,
                            uint32_t virtual_al, uint32_t callback_global_fn);

/* --- ABI v25: per-slot HUD residual 0x00841cf0 pure islands / CF --- */

/* This-relative byte offset of P0 element `index` (0x18 elements from
   +0x10, stride 0x10). 0xffffffff when out of range. */
uint32_t isaac_exit_841cf0_p0_elem_off(uint32_t index);
/* One P0 element in PE store order: dword +0 ← 0, dword +8 ← 0x00b1a4ec,
   dword +0xc ← 0x00b1a4ec, byte +4 ← 0. */
void isaac_exit_841cf0_p0_elem(uint8_t* elem);
/* All 0x18 P0 elements over the residual `this` image. */
void isaac_exit_841cf0_p0_apply(uint8_t* this_base);
/* Head zeros: PE stores an unaligned dword 0 at +0xa then byte 0 at +0xe
   (bytes +0xa..+0xe inclusive). */
void isaac_exit_841cf0_head_clear(uint8_t* this_base);

/* P1: two stride-0x18 elements from +0x200. Pure dwords +0/+4 ← 0 run
   before host 0x0040c7f0(0) on elem+8. */
uint32_t isaac_exit_841cf0_p1_elem_off(uint32_t index);
uint32_t isaac_exit_841cf0_p1_host_ptr(uint32_t this_addr, uint32_t index);
void isaac_exit_841cf0_p1_pre(uint8_t* elem);
void isaac_exit_841cf0_p1_apply(uint8_t* this_base);

/* P2: four stride-0x1c elements from +0x190. Pure dwords +0/+4/+0x18 ← 0,
   then two host gates on the pair value dwords at +8 and +0x10. */
uint32_t isaac_exit_841cf0_p2_elem_off(uint32_t index);
uint32_t isaac_exit_841cf0_p2_host_a_ptr(uint32_t this_addr, uint32_t index);
uint32_t isaac_exit_841cf0_p2_host_b_ptr(uint32_t this_addr, uint32_t index);
void isaac_exit_841cf0_p2_pre(uint8_t* elem);
void isaac_exit_841cf0_p2_apply(uint8_t* this_base);
/* Host 0x0040c7f0(0) runs iff the pair value dword is non-zero. */
int32_t isaac_exit_841cf0_p2_host_needed(uint32_t pair_value);

/* Vector at +0x6a0/+0x6a4, element stride 0xc, host on elem+4. */
uint32_t isaac_exit_841cf0_vec_elem_host_ptr(uint32_t elem_ptr);
uint32_t isaac_exit_841cf0_vec_next(uint32_t elem_ptr);
int32_t isaac_exit_841cf0_vec_walk_needed(uint32_t begin, uint32_t end);
int32_t isaac_exit_841cf0_vec_walk_continue(uint32_t next, uint32_t end);
uint32_t isaac_exit_841cf0_vec_elem_count(uint32_t begin, uint32_t end);
/* PE re-reads [this+0x6a0] AFTER host 0x00709380 and stores it into
   [this+0x6a4]; callers must pass the recaptured begin value. */
void isaac_exit_841cf0_vec_clear_end(uint32_t* end_slot,
                                     uint32_t begin_after_host);
void isaac_exit_841cf0_word_6ac_clear(uint16_t* word_6ac);
void isaac_exit_841cf0_terminal_clear(uint32_t* field_0);
/* Every pure store of 0x00841cf0 in PE order, hosts omitted. The vector
   end store uses the recaptured begin value. */
void isaac_exit_841cf0_pure_apply(uint8_t* this_base,
                                  uint32_t vec_begin_after_host);

/* --- ABI v25: residual 0x0083abb0 pure islands / CF --- */

uint32_t isaac_exit_83abb0_block_base_off(uint32_t block);
int32_t isaac_exit_83abb0_walk_needed(uint32_t begin, uint32_t end);
/* PE re-reads end from [block+0xc] after every host element call. */
int32_t isaac_exit_83abb0_walk_continue(uint32_t next, uint32_t end);
uint32_t isaac_exit_83abb0_elem_host_ptr(uint32_t elem_ptr);
uint32_t isaac_exit_83abb0_elem_next(uint32_t elem_ptr);
uint32_t isaac_exit_83abb0_elem_count(uint32_t begin, uint32_t end);
/* Post-host pure pack for one block, PE order: end ← recaptured begin,
   byte +4 ← 0, dword +0 ← 0. */
void isaac_exit_83abb0_block_post(uint8_t* block_base,
                                  uint32_t begin_after_host);
void isaac_exit_83abb0_terminal_clear(uint8_t* flag_28);
/* Both blocks + terminal byte. begin_after_host points at
   ISAAC_EXIT_83ABB0_BLOCK_COUNT recaptured begin values. */
void isaac_exit_83abb0_apply(uint8_t* this_base,
                             const uint32_t* begin_after_host);

/* --- ABI v25: shared range COM destroy CF (0x00709380 / 0x00709300) --- */

uint32_t isaac_exit_range_destroy_stride_709380(void);
uint32_t isaac_exit_range_destroy_stride_709300(void);
int32_t isaac_exit_range_destroy_loop_needed(uint32_t begin, uint32_t end);
int32_t isaac_exit_range_destroy_continue(uint32_t next, uint32_t end);
uint32_t isaac_exit_range_destroy_ctrl_ptr(uint32_t elem_ptr);
uint32_t isaac_exit_range_destroy_cb_arg_ptr(uint32_t elem_ptr);
uint32_t isaac_exit_range_destroy_next(uint32_t elem_ptr, uint32_t stride);
int32_t isaac_exit_range_destroy_ctrl_present(uint32_t ctrl_ptr);
int32_t isaac_exit_range_destroy_virtual_ok(uint32_t virtual_al);
int32_t isaac_exit_range_destroy_callback_needed(uint32_t ctrl_ptr,
                                                 uint32_t virtual_al,
                                                 uint32_t global_fn);

/* --- ABI v25: pure-complete tail-jmp 0x0084bfd0 --- */

/* Slot kind for dword index in [0, ISAAC_EXIT_84BFD0_BLOCK_DWORDS):
   ISAAC_EXIT_84BFD0_SLOT_ZERO / _SKIP / _FLOAT. 0xffffffff out of range. */
uint32_t isaac_exit_84bfd0_slot_kind(uint32_t dword_index);
uint32_t isaac_exit_84bfd0_block_base_off(uint32_t block);
uint32_t isaac_exit_84bfd0_slot_off(uint32_t block, uint32_t dword_index);
uint32_t isaac_exit_84bfd0_f32_bits(void);
void isaac_exit_84bfd0_apply_block(uint8_t* block_base);
/* Pure-complete body: two blocks then terminal byte +0x2ac ← 0. */
void isaac_exit_84bfd0_apply(uint8_t* this_base);

/* --- ABI v26: buffer-free residual 0x00840f70 pure islands / CF --- */

/* This-relative offset / absolute address of owned-buffer slot `index`
   ([edi + esi*4], esi in [0, 2)). 0xffffffff / 0 out of range. */
uint32_t isaac_exit_840f70_slot_off(uint32_t index);
uint32_t isaac_exit_840f70_slot_ptr(uint32_t this_addr, uint32_t index);
/* PE: mov ecx,[edi+esi*4]; test ecx,ecx; je skip — free runs iff non-null. */
int32_t isaac_exit_840f70_free_needed(uint32_t slot_value);
/* Heap-accounting base: DAT_00c7de78 ? DAT_00c7de78 + 0x30 : DAT_00c7f618.
   Same idiom already recorded for 0x00408970 (v20) and 0x0040db90 (v21). */
uint32_t isaac_exit_840f70_heap_stats_base(uint32_t heap_stats_global);
/* Allocation header: the size dword lives at ptr-4 and free() takes ptr-4. */
uint32_t isaac_exit_840f70_free_base_ptr(uint32_t slot_value);
uint32_t isaac_exit_840f70_header_size_ptr(uint32_t slot_value);
/* 64-bit borrow subtract: sub [base],size ; sbb [base+4],0.
   size is zero-extended; the borrow is exactly (lo < size) unsigned. */
uint32_t isaac_exit_840f70_stats_sub_lo(uint32_t lo, uint32_t size);
uint32_t isaac_exit_840f70_stats_sub_borrow(uint32_t lo, uint32_t size);
uint32_t isaac_exit_840f70_stats_sub_hi(uint32_t lo, uint32_t hi,
                                        uint32_t size);
void isaac_exit_840f70_stats_sub(uint32_t* lo, uint32_t* hi, uint32_t size);
void isaac_exit_840f70_stats_sub_at(uint8_t* stats_base, uint32_t size);
/* Pure post-free store: mov dword [edi+esi*4], 0. */
void isaac_exit_840f70_slot_clear(uint32_t* slot);
/* Net pure effect on `this` for the whole body: both slots end at 0
   (null slots are already 0, non-null ones are cleared after the host
   free). Returns the number of host frees the PE would issue. */
uint32_t isaac_exit_840f70_apply(uint8_t* this_base);

/* Per-slot pure plan; the host supplies the loaded slot value, the
   accounting global and the header size read from ptr-4. */
typedef struct IsaacExit840f70SlotPlan {
  uint32_t index;
  uint32_t slot_ptr;
  uint32_t slot_value;
  int32_t free_needed;
  uint32_t free_base_ptr;  /* 0 when the slot is null */
  uint32_t stats_base;     /* 0 when the slot is null */
  uint32_t stats_lo_ptr;   /* 0 when the slot is null */
  uint32_t stats_hi_ptr;   /* 0 when the slot is null */
  uint32_t header_size;    /* echoed input; 0 when the slot is null */
  uint32_t stats_lo_after; /* 0 when the slot is null */
  uint32_t stats_hi_after; /* 0 when the slot is null */
} IsaacExit840f70SlotPlan;

void isaac_exit_840f70_slot_plan(IsaacExit840f70SlotPlan* out,
                                 uint32_t this_addr, uint32_t index,
                                 uint32_t slot_value,
                                 uint32_t heap_stats_global,
                                 uint32_t header_size, uint32_t stats_lo,
                                 uint32_t stats_hi);

/* --- ABI v26: pair-replace residual 0x00709150 pure islands / CF --- */

uint32_t isaac_exit_709150_alloc_size(void);
/* PE: test edi,edi; je → ctor/finish skipped and the new object is 0. */
int32_t isaac_exit_709150_alloc_ok(uint32_t alloc_ptr);
uint32_t isaac_exit_709150_new_object_value(uint32_t alloc_ptr);
/* Post-ctor overwrite after nested 0x0040cc10 (v12 covers the ctor pack):
   [obj] ← 0x00b67f98, [obj+0x14] ← 0. */
void isaac_exit_709150_object_finish(uint32_t* vtable_slot,
                                     uint32_t* field_14_slot);
void isaac_exit_709150_object_finish_apply(uint8_t* obj_base);
/* Old object at this+4 drives the COM release / callback chain. */
int32_t isaac_exit_709150_old_object_present(uint32_t old_obj);
int32_t isaac_exit_709150_virtual_ok(uint32_t virtual_al);
int32_t isaac_exit_709150_callback_needed(uint32_t old_obj,
                                          uint32_t virtual_al,
                                          uint32_t global_fn);
/* Terminal pure pair store: *this ← 0, this+4 ← new object. Unlike
   0x0040c7f0 the value slot takes an immediate 0, not the stack arg. */
void isaac_exit_709150_pair_apply(uint32_t* value_slot, uint32_t* obj_slot,
                                  uint32_t new_obj);
void isaac_exit_709150_pair_apply_base(uint8_t* pair_base, uint32_t new_obj);

typedef struct IsaacExit709150Plan {
  uint32_t this_addr;
  uint32_t alloc_size;
  uint32_t alloc_ptr;
  int32_t alloc_ok;
  uint32_t new_object;      /* alloc_ptr or 0 */
  int32_t ctor_host_needed; /* nested 0x0040cc10 runs only when alloc_ok */
  int32_t finish_needed;    /* same gate as ctor_host_needed */
  uint32_t vtable_value;
  uint32_t old_object;
  int32_t old_object_present;
  int32_t virtual_ok;
  int32_t callback_needed;
  uint32_t value_slot_ptr;
  uint32_t obj_slot_ptr;
  uint32_t value_slot_after; /* always 0 */
  uint32_t obj_slot_after;   /* new_object */
} IsaacExit709150Plan;

void isaac_exit_709150_plan(IsaacExit709150Plan* out, uint32_t this_addr,
                            uint32_t alloc_ptr, uint32_t old_object,
                            uint32_t virtual_al, uint32_t callback_global_fn);

/* --- ABI v27: teardown residual 0x00a1ad90 pure islands / CF --- */

/* Block A: free the pointer at this+0x28 through host 0x00a648b0. */
int32_t isaac_exit_a1ad90_block_a_needed(uint32_t ptr_28);
void isaac_exit_a1ad90_block_a_clear(uint32_t* slot_28);

/* Block B: counted array at this+0x3c. */
int32_t isaac_exit_a1ad90_block_b_needed(uint32_t arr_3c);
/* Allocation header (count dword) sits at arr-4; it is also the free base. */
uint32_t isaac_exit_a1ad90_header_ptr(uint32_t arr_3c);
uint32_t isaac_exit_a1ad90_elem_size(void);
uint32_t isaac_exit_a1ad90_elem_dtor(void);
/* Count pushed to the dtor iterator — read BEFORE host 0x00aef638. */
uint32_t isaac_exit_a1ad90_dtor_count_arg(uint32_t count_before);
/* Free size — the PE RE-READS the count from arr-4 after the iterator and
   computes count_after*8 + 4. Passing the pre-call count here is the exact
   mistake this signature exists to prevent. */
uint32_t isaac_exit_a1ad90_free_size(uint32_t count_after);
void isaac_exit_a1ad90_block_b_clear(uint32_t* slot_3c);

/* Block C: MSVC tree clear on the map object at this+0x40. */
uint32_t isaac_exit_a1ad90_tree_obj_ptr(uint32_t this_addr);
uint32_t isaac_exit_a1ad90_tree_head_ptr(uint32_t this_addr);
uint32_t isaac_exit_a1ad90_tree_size_ptr(uint32_t this_addr);
/* Root node address slot on the sentinel (head+4), read BEFORE the host. */
uint32_t isaac_exit_a1ad90_tree_root_ptr(uint32_t head_addr);
/* Post-erase sentinel reset: three self-pointers, PE order +4, +0, +8.
   head_addr is the value stored back; head_base points at the node. */
void isaac_exit_a1ad90_tree_reset_at(uint8_t* head_base, uint32_t head_addr);
void isaac_exit_a1ad90_tree_size_clear(uint32_t* size_44);

/* Terminal pack: BYTE [this] ← 0 then dwords +0x24 / +0x38 ← 0. */
void isaac_exit_a1ad90_terminal(uint8_t* this_base);

/* Every pure store that lands on `this` (blocks A/B slot clears, tree size,
   terminal pack). Returns a bitmask of the host blocks the PE would run:
   bit 0 = block A free, bit 1 = block B destroy+free. The sentinel reset of
   block C lives on the head node, not on `this` — use _tree_reset_at. */
uint32_t isaac_exit_a1ad90_apply_this(uint8_t* this_base);

typedef struct IsaacExitA1ad90Plan {
  uint32_t this_addr;
  uint32_t ptr_28;
  int32_t block_a_needed;
  uint32_t arr_3c;
  int32_t block_b_needed;
  uint32_t header_ptr;    /* 0 when block B is skipped */
  uint32_t dtor_base;     /* arr_3c when needed, else 0 */
  uint32_t dtor_elem_size;
  uint32_t dtor_count;    /* pre-call count */
  uint32_t dtor_fn;
  uint32_t free_base_ptr; /* header_ptr */
  uint32_t free_size;     /* from the POST-call count */
  uint32_t tree_obj_ptr;
  uint32_t tree_head;     /* pre-call head value */
  uint32_t tree_root_ptr; /* head+4 */
  uint32_t tree_size_ptr;
} IsaacExitA1ad90Plan;

void isaac_exit_a1ad90_plan(IsaacExitA1ad90Plan* out, uint32_t this_addr,
                            uint32_t ptr_28, uint32_t arr_3c,
                            uint32_t count_before, uint32_t count_after,
                            uint32_t tree_head);

/* --- ABI v27: recovered call shape of host 0x00a648b0 (body stays host) --- */

/* PE @ 0x00a648c7: movzx eax, cl — only the low byte of ECX selects the
   mode. Callers leave the upper 24 bits as whatever `this` had. */
uint32_t isaac_exit_a648b0_mode_from_cl(uint32_t ecx);
uint32_t isaac_exit_a648b0_mode_free(void);
/* Mode 1 @ 0x00a648ef: test edx,edx; je — the pointer arrives in EDX. */
int32_t isaac_exit_a648b0_mode1_free_needed(uint32_t edx_ptr);
uint32_t isaac_exit_a648b0_mode1_header_size_ptr(uint32_t edx_ptr);
uint32_t isaac_exit_a648b0_mode1_free_base_ptr(uint32_t edx_ptr);
uint32_t isaac_exit_a648b0_heap_stats_base(uint32_t heap_stats_global);

/* --- ABI v43: decision laws of the host body (mode dispatch + mode 2
   stats-add path). PE 0x00a648b0..0x00a6490f; v27 landed the call shape,
   these pin the remaining body decisions. --- */

/* Full dispatch law (PE @ 0x00a648c7..0x00a648d7: movzx eax,cl; sub 0; je
   done; sub 1; je mode1; sub 1; jne done): low byte 0 -> 0 (empty), 1 ->
   1 (free path), 2 -> 2 (stats-add path), >= 3 -> 0 (empty). */
uint32_t isaac_exit_a648b0_mode_path(uint32_t mode);

/* Mode 2 constant (addend pair DAT_00c7f618 / DAT_00c7f61c). */
uint32_t isaac_exit_a648b0_mode_stats(void);

/* Mode-2 accounting base: [0xc7de78] + 0x30 with 32-bit wrap and NO null
   fallback — the PE uses edi (the loaded global) directly, unlike the
   mode-1 esi select in heap_stats_base. The trap is the LAW. */
uint32_t isaac_exit_a648b0_mode2_stats_base_ptr(uint32_t heap_stats_global);

/* Mode-2 addend source VAs (mov eax, dword ptr [imm]). */
uint32_t isaac_exit_a648b0_mode2_addend_lo_va(void);
uint32_t isaac_exit_a648b0_mode2_addend_hi_va(void);

/* 64-bit add-with-carry (add/adc) component laws. */
uint32_t isaac_exit_a648b0_stats_add_lo(uint32_t lo, uint32_t add_lo);
uint32_t isaac_exit_a648b0_stats_add_carry(uint32_t lo, uint32_t add_lo);
uint32_t isaac_exit_a648b0_stats_add_hi(uint32_t lo, uint32_t hi,
                                        uint32_t add_lo, uint32_t add_hi);

typedef struct IsaacExitA648b0StatsAdd {
  uint32_t lo; /* (lo + add_lo) mod 2^32 */
  uint32_t hi; /* hi + add_hi + carry */
} IsaacExitA648b0StatsAdd;

void isaac_exit_a648b0_stats_add(IsaacExitA648b0StatsAdd* out, uint32_t lo,
                                 uint32_t hi, uint32_t add_lo,
                                 uint32_t add_hi);

/* Packed body decision plan. mode_plan re-derives the path from the raw
   mode word (low byte), then emits per-path base/ptr/arithmetic. Mode-1
   stores only run when the edx gate opens (the PE jumps over both the
   sub/sbb AND the free call when edx == 0); mode-2 stores are
   unconditional once dispatched. Path 0 leaves the stats untouched
   (lo_after/hi_after are the inputs passed through). */
typedef struct IsaacExitA648b0ModePlan {
  int32_t path;        /* 0 empty / 1 free / 2 stats-add */
  int32_t free_needed; /* path == 1 && edx_ptr != 0 */
  uint32_t stats_base; /* mode1 select / mode2 direct / 0 when no store */
  uint32_t lo_after;   /* stats lo after the path's store (or pass-through) */
  uint32_t hi_after;   /* stats hi after the path's store (or pass-through) */
  uint32_t free_ptr;   /* edx_ptr - 4 when free_needed, else 0 */
} IsaacExitA648b0ModePlan;

void isaac_exit_a648b0_mode_plan(IsaacExitA648b0ModePlan* out, uint32_t mode,
                                 uint32_t edx_ptr, uint32_t heap_stats_global,
                                 uint32_t stats_lo, uint32_t stats_hi,
                                 uint32_t header_size, uint32_t add_lo,
                                 uint32_t add_hi);

/* --- ABI v44: fully pure thiscall predicate 0x006f0040 (band-scan find).
   PE 0x006f0040..0x006f0066:
     mov eax,[ecx+0x1e68]    ; A = this->1e68
     test eax,eax / je 0     ; A == 0              -> false
     mov edx,[eax+0x161c]    ; B = A->161c
     cmp edx,-1 / je 0       ; B == 0xffffffff     -> false
     cmp edx,[ecx+0x161c] / jge 0  ; B >= own (SIGNED) -> false
     cmp eax,ecx / je 0      ; A == this (self)    -> false
     mov al,1 / ret          ; else true
   All gates FULL-dword; the return is the AL byte flag. No uint8_t
   input anywhere. 0 E8 / 0 indirect / 0 stores. */

uint32_t isaac_exit_6f0040_va(void);
uint32_t isaac_exit_6f0040_body_bytes(void);
uint32_t isaac_exit_6f0040_ptr_off(void);
uint32_t isaac_exit_6f0040_count_off(void);
int32_t isaac_exit_6f0040_predicate(uint32_t receiver, uint32_t ptr_1e68,
                                    uint32_t own_161c, uint32_t obj_161c);

/* --- ABI v45: fully pure static membership predicate 0x0071df80 (band
   re-scan find).
   PE 0x0071df80..0x0071dfbf:
     mov eax,[0xc71678]       ; Game* (global)
     mov eax,[eax+0x18300]    ; Game::_room
     mov eax,[eax+0x1d18]     ; S = room->1d18 (room state id)
     cmp eax,0xa  / je open   ; S == 0x0a -> true
     cmp eax,0xb  / je open   ; S == 0x0b -> true
     cmp eax,0xc  / je open   ; S == 0x0c -> true
     cmp eax,0xd  / je open   ; S == 0x0d -> true
     cmp eax,0x22 / je open   ; S == 0x22 -> true
     cmp eax,0x2b / je open   ; S == 0x2b -> true
     cmp eax,0x2c / je open   ; S == 0x2c -> true
     cmp eax,0x30 / je open   ; S == 0x30 -> true
     xor al,al / ret          ; else false
     open: mov al,1 / ret     ; true
   All eight gates FULL-dword cmp eax, imm (83 F8 imm8 sign-extended —
   equality over the WHOLE dword; 0x1000000a does NOT match 0xa). The
   return is the AL byte flag. No byte-narrowed input anywhere. 0 E8 /
   0 indirect / 0 stores. */

uint32_t isaac_exit_71df80_va(void);
uint32_t isaac_exit_71df80_body_bytes(void);
uint32_t isaac_exit_71df80_game_dat(void);
uint32_t isaac_exit_71df80_room_off(void);
uint32_t isaac_exit_71df80_state_off(void);
int32_t isaac_exit_71df80_state_open(uint32_t state_1d18);

/* --- ABI v28: pair constructor 0x0040c4a0 pure islands / CF --- */

/* Entry zero BEFORE the allocator: [this] ← 0, [this+4] ← 0. This is the
   store 0x0040c7f0 does not have; it is what makes the COM path dead. */
void isaac_exit_40c4a0_entry_zero(uint32_t* value_slot, uint32_t* obj_slot);
void isaac_exit_40c4a0_entry_zero_at(uint8_t* pair_base);

uint32_t isaac_exit_40c4a0_alloc_size(void);
int32_t isaac_exit_40c4a0_alloc_ok(uint32_t alloc_ptr);
uint32_t isaac_exit_40c4a0_new_object_value(uint32_t alloc_ptr);
/* Post-ctor overwrite after nested 0x0040cc10 (v12 covers the ctor pack). */
void isaac_exit_40c4a0_object_finish(uint32_t* vtable_slot,
                                     uint32_t* arg_slot, uint32_t arg);
void isaac_exit_40c4a0_object_finish_apply(uint8_t* obj_base, uint32_t arg);

/* Old-object gate. The PE re-reads [this+4] AFTER the allocator and ctor
   hosts; pass that recaptured value, never the entry-zeroed snapshot. */
int32_t isaac_exit_40c4a0_old_object_present(uint32_t old_obj_after_hosts);
int32_t isaac_exit_40c4a0_virtual_ok(uint32_t virtual_al);
int32_t isaac_exit_40c4a0_callback_needed(uint32_t old_obj_after_hosts,
                                          uint32_t virtual_al,
                                          uint32_t global_fn);

/* Terminal stores in PE order: object slot FIRST, then the value slot
   (0x0040c7f0 emits them the other way round). */
void isaac_exit_40c4a0_pair_apply(uint32_t* obj_slot, uint32_t* value_slot,
                                  uint32_t new_obj, uint32_t arg);
void isaac_exit_40c4a0_pair_apply_base(uint8_t* pair_base, uint32_t new_obj,
                                       uint32_t arg);
/* EAX on return is this (PE @ 0x0040c533: mov eax, esi). */
uint32_t isaac_exit_40c4a0_return_value(uint32_t this_addr);

typedef struct IsaacExit40c4a0Plan {
  uint32_t this_addr;
  uint32_t arg;
  uint32_t alloc_size;
  uint32_t alloc_ptr;
  int32_t alloc_ok;
  uint32_t new_object;
  int32_t ctor_host_needed;
  int32_t finish_needed;
  uint32_t vtable_value;
  uint32_t arg_slot_ptr;   /* new object +0x14; 0 when the alloc failed */
  uint32_t old_object;     /* recaptured [this+4] */
  int32_t old_object_present;
  int32_t virtual_ok;
  int32_t callback_needed;
  uint32_t value_slot_ptr;
  uint32_t obj_slot_ptr;
  uint32_t value_slot_after;
  uint32_t obj_slot_after;
  uint32_t return_value;
} IsaacExit40c4a0Plan;

void isaac_exit_40c4a0_plan(IsaacExit40c4a0Plan* out, uint32_t this_addr,
                            uint32_t arg, uint32_t alloc_ptr,
                            uint32_t old_obj_after_hosts, uint32_t virtual_al,
                            uint32_t callback_global_fn);

/* --- ABI v28: recursive tree _Erase 0x00415800 pure islands / CF --- */

/* PE @ 0x0041582e: cmp BYTE [esi+0xd], 0; jne done — low byte only. */
int32_t isaac_exit_415800_walk_continue(uint32_t isnil_byte);
/* Right subtree recurses, left child iterates. */
uint32_t isaac_exit_415800_recurse_node_ptr(uint32_t node);
uint32_t isaac_exit_415800_next_node_ptr(uint32_t node);
uint32_t isaac_exit_415800_com_slot_ptr(uint32_t node);
uint32_t isaac_exit_415800_ctrl_ptr(uint32_t node);
int32_t isaac_exit_415800_ctrl_present(uint32_t ctrl);
int32_t isaac_exit_415800_virtual_ok(uint32_t virtual_al);
int32_t isaac_exit_415800_callback_needed(uint32_t ctrl, uint32_t virtual_al,
                                          uint32_t global_fn);
uint32_t isaac_exit_415800_free_size(void);

/* Pure-complete free-order enumerator over a linear-memory tree image.
   Node addresses are linear-memory offsets. Emits nodes in the exact PE
   order (reverse in-order: right subtree, self, left subtree) — the same
   order the host free calls are issued in. Returns the number of nodes
   written, or ISAAC_EXIT_415800_ORDER_OVERFLOW when the output buffer or
   the depth guard would be exceeded. */
uint32_t isaac_exit_415800_free_order(const uint8_t* mem, uint32_t root,
                                      uint32_t* out, uint32_t max_out);

/* --- ABI v30: keyed registry store/release 0x0040e520 + key hash 0x00a159d0
   ---
   v109 dedupe: the 0x00a159d0 key-hash LAWS (fold/step/hash) are OWNED by
   the render-shell family (isaac_render_shell_a159d0_norm_char/hash_step/
   hash, landed at RShell ABI v7; the render slice's a14050 chain consumes
   the hash by name). Exit keeps the PE constants below as host-VA
   documentation and pins the render-shell export semantics BY REFERENCE
   in the suite; NO duplicate law exports. */

enum {
  /* 0x0040e520 frame. [ebp+8] and [ebp+0xc] are ONE by-value {value, ctrl}
     pair (the function is `ret 8`), NOT two independent arguments: the tail
     runs the same release idiom that 0x0040c3b0 runs on that exact shape,
     and 0x0040c3b0 is handed &[ebp+8] as a single object pointer. */
  ISAAC_EXIT_40E520_PAIR_VALUE_OFF = 0,
  ISAAC_EXIT_40E520_PAIR_CTRL_OFF = 4,
  /* Name ladder, read off the pair's value object. */
  ISAAC_EXIT_40E520_NAME_PRIMARY_OFF = 0x44,
  ISAAC_EXIT_40E520_NAME_FALLBACK_OFF = 0x40,
  /* Release vtable slot (PE @ 0x0040e598: mov eax, [eax + 0xc]). */
  ISAAC_EXIT_40E520_RELEASE_VTABLE_OFF = 0xc,
  ISAAC_EXIT_40E520_DEFAULT_NAME_ADDR = 0x00b65788u, /* .rdata "unknown" */
  ISAAC_EXIT_40E520_MAP_GLOBAL = 0x00c78ee8u,
  /* Same global the 0x0040c000 / 0x00408640 / range-destroy gates use. */
  ISAAC_EXIT_40E520_CALLBACK_GLOBAL = 0x00c7163cu,

  /* 0x00a159d0 key hash — host-VA + PE constants (laws owned by RShell). */
  ISAAC_EXIT_A159D0_HOST_VA = 0x00a159d0u,
  ISAAC_EXIT_A159D0_HASH_INIT = 0x1505u, /* 5381 */
  ISAAC_EXIT_A159D0_HASH_SHIFT = 5,      /* shl eax,5 then add -> *33 */
  ISAAC_EXIT_A159D0_NULL_HASH = 0u,      /* null ptr returns 0, NOT the seed */
  ISAAC_EXIT_A159D0_UPPER_LO = 0x41u,    /* 'A' */
  ISAAC_EXIT_A159D0_UPPER_SPAN = 0x19u,  /* cmp dl,0x19 / cmova -> UNSIGNED */
  ISAAC_EXIT_A159D0_LOWER_DELTA = 0x20u,
  ISAAC_EXIT_A159D0_BACKSLASH = 0x5cu,
  ISAAC_EXIT_A159D0_SLASH = 0x2fu,
  /* Harness guard only. The PE has NO length bound; a name this long does
     not occur and would be a harness memory-safety bug, not a behavioural
     difference. Documented so nobody mistakes it for PE semantics. */
  ISAAC_EXIT_A159D0_MAX_LEN = 0x1000
};

/* Entry gate @ 0x0040e54f: test eax,eax; je — the FULL dword of the pair's
   value word, not a low-byte test. */
int32_t isaac_exit_40e520_map_store_needed(uint32_t pair_value);

/* Name ladder @ 0x0040e553..0x0040e564. The primary wins OUTRIGHT: the jne
   at 0x0040e558 skips the fallback load AND the cmov, so [value+0x40] is
   never even read when [value+0x44] != 0. */
uint32_t isaac_exit_40e520_name_ptr(uint32_t field44, uint32_t field40);

uint32_t isaac_exit_40e520_default_name_addr(void);
uint32_t isaac_exit_40e520_map_global(void);
uint32_t isaac_exit_40e520_pair_value_ptr(uint32_t pair_base);
uint32_t isaac_exit_40e520_pair_ctrl_ptr(uint32_t pair_base);

/* Release tail @ 0x0040e58f..0x0040e5b0.
   The PE RE-READS [ebp+0xc] at 0x0040e58f, AFTER 0x00a159d0, the map
   operator[] 0x00414440 and the assign 0x0040c3b0 have all run — and
   0x0040c3b0 receives &pair, so it can write through it. Pass the
   RECAPTURED control word here; folding the entry snapshot is exactly the
   stale-state defect class this port keeps being bitten by. */
int32_t isaac_exit_40e520_release_ctrl_present(uint32_t ctrl_after_hosts);
int32_t isaac_exit_40e520_virtual_ok(uint32_t virtual_al);
int32_t isaac_exit_40e520_callback_needed(uint32_t ctrl_after_hosts,
                                          uint32_t virtual_al,
                                          uint32_t global_fn);
/* The cdecl callback takes &pair (PE @ 0x0040e5aa: lea ecx,[ebp+8]) — the
   ADDRESS of the pair slot, never its value. */
uint32_t isaac_exit_40e520_callback_arg_ptr(uint32_t pair_base);

typedef struct IsaacExit40e520Plan {
  uint32_t pair_base;
  uint32_t pair_value;
  int32_t map_store_needed;
  uint32_t name_ptr; /* 0 when the store is skipped: on that path the PE
                        jumps straight to 0x0040e588 and never evaluates
                        the ladder at all. */
  uint32_t map_global;
  uint32_t ctrl_after_hosts; /* recaptured [ebp+0xc] */
  int32_t release_ctrl_present;
  int32_t virtual_ok;
  int32_t callback_needed;
  uint32_t callback_arg_ptr;
} IsaacExit40e520Plan;

void isaac_exit_40e520_plan(IsaacExit40e520Plan* out, uint32_t pair_base,
                            uint32_t pair_value, uint32_t field44,
                            uint32_t field40, uint32_t ctrl_after_hosts,
                            uint32_t virtual_al, uint32_t callback_global_fn);

/* --- ABI v32: object realloc/fill 0x007384d0 (complete body, __thiscall,
   ret @ 0x007385be) --- */

enum {
  /* edi = [this+0x18300] is re-read at 0x007384f9 AFTER nothing — it is the
     entry value; the dtor/free hosts receive it, then the slot is zeroed at
     0x00738518 before the alloc. The final store at 0x0073854a overwrites it,
     so the net pure effect is a single store of the ctor-return fold. */
  ISAAC_EXIT_7384D0_OBJ_OFF = 0x18300,
  ISAAC_EXIT_7384D0_ALLOC_SIZE = 0x7898,
  ISAAC_EXIT_7384D0_182D0_OFF = 0x182d0,
  ISAAC_EXIT_7384D0_182CC_OFF = 0x182cc,
  ISAAC_EXIT_7384D0_18334_OFF = 0x18334,
  /* memset base/size: VCRUNTIME140!memset via IAT [0x00b1875c] @ 0x0073858b. */
  ISAAC_EXIT_7384D0_MEMSET_BASE_OFF = 0x18338,
  ISAAC_EXIT_7384D0_MEMSET_SIZE = 0x30,
  ISAAC_EXIT_7384D0_18368_OFF = 0x18368,
  ISAAC_EXIT_7384D0_1836C_OFF = 0x1836c,
  ISAAC_EXIT_7384D0_188F8_OFF = 0x188f8,
  ISAAC_EXIT_7384D0_182D0_VALUE = 0xffffffffu
};

/* Entry gate @ 0x007384ff: test edi,edi; je — FULL dword (dtor+free needed). */
int32_t isaac_exit_7384d0_old_object_present(uint32_t old_ptr);

uint32_t isaac_exit_7384d0_alloc_size(void);

/* Post-alloc gate @ 0x00738539: test eax,eax; je — FULL dword. */
int32_t isaac_exit_7384d0_alloc_ok(uint32_t alloc_ptr);

/* [this+0x18300] receives the fold: alloc==0 → 0 (ctor never runs, PE
   @ 0x00738546 xor eax,eax), else the CTOR's return value @ 0x0073853f, never
   the raw alloc pointer. */
uint32_t isaac_exit_7384d0_new_object_value(uint32_t alloc_ptr,
                                            uint32_t ctor_return);

/* All eleven pure stores, in PE order, split by the memset:
     store 0x18300 (0x0073854a), 0x182d0=0xffffffff (0x00738559),
     0x182cc=0 (0x00738563), +0x0=0 (0x0073856d), +0x4=0 (0x00738573),
     +0xc=0 (0x0073857a), 0x18334=0 (0x00738581),
   then the 0x30-byte zero fill at +0x18338 (0x0073858b),
   then 0x18368=0 (0x00738593), 0x1836c=0 (0x0073859d),
   byte 0x188f8=0 (0x007385a7).
   [this+8] is deliberately NOT touched (PE never writes it). */
void isaac_exit_7384d0_apply(uint8_t* this_base, uint32_t new_obj_value);

/* --- ABI v32: MSVC string field setter 0x00408310 (complete body,
   __thiscall, ret 4 @ 0x00408586) --- */

enum {
  ISAAC_EXIT_408310_ARG0_OFF = 0,  /* [this] = arg0 @ 0x00408346 */
  ISAAC_EXIT_408310_STR_OFF = 8,   /* dst string object at this+8 */
  /* MSVC basic_string layout used by both temps: union buf/ptr @ +0,
     size @ +0x10, capacity @ +0x14. */
  ISAAC_EXIT_408310_STR_SIZE_OFF = 0x10,
  ISAAC_EXIT_408310_STR_CAP_OFF = 0x14,
  ISAAC_EXIT_408310_EMPTY_CAP = 0xf, /* empty SSO capacity store */
  /* ebx flag: 1 = host copy-ctor temp (0x0040835f), 2 = pure empty SSO temp
     (0x0040838d). The teardown tests are `test bl,2` @ 0x004083ba and
     `test bl,1` @ 0x004083f8 — LOW-BYTE gates. */
  ISAAC_EXIT_408310_TEMP_CTOR_FLAG = 1,
  ISAAC_EXIT_408310_TEMP_EMPTY_FLAG = 2,
  /* Host 0x0040c7f0(0) at 0x0040844d receives this+0x98 as its this. */
  ISAAC_EXIT_408310_HOST_98_OFF = 0x98,
  /* `call dword ptr [0xb18894]` @ 0x00408423 — CRT invalid_parameter (host). */
  ISAAC_EXIT_408310_INVALID_PARAM_IAT = 0x00b18894u,
  /* Runtime global gate @ 0x004084ea: mov eax,[0xc798e4]; and eax,4. Past
     .data raw end → zero at load, written at runtime (same class as
     g_c7b640/g_c7b644). */
  ISAAC_EXIT_408310_GATE_C798E4_ADDR = 0x00c798e4u,
  /* cmove @ 0x00408508 with ecx=6: field_7c = (g & 4) == 0 ? 6 : 1. */
  ISAAC_EXIT_408310_FIELD_7C_CLEAR_VALUE = 6,
  ISAAC_EXIT_408310_FIELD_7C_BITSET_VALUE = 1,
  /* f32 1.0f bit pattern, file-backed .data @ 0xc3793c/0xc37940. */
  ISAAC_EXIT_408310_F32_ONE_BITS = 0x3f800000u,
  /* Pure field tail offsets (0x00408452–0x00408594). */
  ISAAC_EXIT_408310_F20_OFF = 0x20,
  ISAAC_EXIT_408310_F24_OFF = 0x24,
  ISAAC_EXIT_408310_F28_OFF = 0x28,
  ISAAC_EXIT_408310_F2C_OFF = 0x2c,
  ISAAC_EXIT_408310_F30_OFF = 0x30,
  ISAAC_EXIT_408310_F34_OFF = 0x34,
  ISAAC_EXIT_408310_F38_OFF = 0x38,
  ISAAC_EXIT_408310_F3C_OFF = 0x3c,
  ISAAC_EXIT_408310_F40_OFF = 0x40,
  ISAAC_EXIT_408310_F44_OFF = 0x44,
  ISAAC_EXIT_408310_F48_OFF = 0x48,
  ISAAC_EXIT_408310_F4C_OFF = 0x4c,
  ISAAC_EXIT_408310_F50_OFF = 0x50,
  ISAAC_EXIT_408310_F54_OFF = 0x54,
  ISAAC_EXIT_408310_F58_OFF = 0x58,
  ISAAC_EXIT_408310_F5C_OFF = 0x5c,
  ISAAC_EXIT_408310_F60_OFF = 0x60,
  ISAAC_EXIT_408310_F64_OFF = 0x64,
  ISAAC_EXIT_408310_F68_OFF = 0x68,
  ISAAC_EXIT_408310_F6C_OFF = 0x6c,
  ISAAC_EXIT_408310_F70_OFF = 0x70,
  ISAAC_EXIT_408310_F74_OFF = 0x74, /* byte store = 1 */
  ISAAC_EXIT_408310_F78_OFF = 0x78,
  ISAAC_EXIT_408310_F7C_OFF = 0x7c,
  ISAAC_EXIT_408310_F80_OFF = 0x80,
  ISAAC_EXIT_408310_F84_OFF = 0x84,
  ISAAC_EXIT_408310_F88_OFF = 0x88,
  ISAAC_EXIT_408310_F8C_OFF = 0x8c,
  ISAAC_EXIT_408310_F90_OFF = 0x90,
  ISAAC_EXIT_408310_F94_OFF = 0x94,
  /* --- ABI v33: Game::Exit root typed continuation plan (0x006fa0c0) --- */
  /* Entry gate: LOW-BYTE test on Game+0x2658a @ 0x006fa0d2. */
  ISAAC_EXIT_ROOT_SESSION_ACTIVE_OFF = 0x2658a,
  ISAAC_EXIT_ROOT_TERMINAL_CTR_OFF = 0x265c0,
  /* Manager floats @ 0x006fa19a/0x006fa1a4: both <- 0x3f800000. */
  ISAAC_EXIT_ROOT_MGR_F_2A2D0_OFF = 0x2a2d0,
  ISAAC_EXIT_ROOT_MGR_F_2A2D4_OFF = 0x2a2d4,
  /* SFX receiver @ 0x006fa0ed (lea ecx,[ecx+0x2a324]): Manager+0x2a324. */
  ISAAC_EXIT_ROOT_SFX_RECEIVER_OFF = 0x2a324,
  /* 0x007df690 receiver math @ 0x006fa1ae/0x006fa190:
     ecx = Manager + 0x29fc0 + [Manager+0x29fbc]*0x184 (imul, 32-bit wrap). */
  ISAAC_EXIT_ROOT_7DF690_BASE_OFF = 0x29fc0,
  ISAAC_EXIT_ROOT_7DF690_INDEX_OFF = 0x29fbc,
  ISAAC_EXIT_ROOT_7DF690_STRIDE = 0x184,
  /* PGD flush: changesmade byte @ Manager+0x14 (+0xf8c fileLoaded), clear is
     a BYTE store @ 0x006fa1d4. readonly byte @ Manager+0x15. */
  ISAAC_EXIT_ROOT_PGD_CHANGES_OFF = 0x14,
  ISAAC_EXIT_ROOT_PGD_FILE_LOADED_DELTA = 0xf8c,
  ISAAC_EXIT_ROOT_PGD_READONLY_OFF = 0x15,
  ISAAC_EXIT_ROOT_MGR_CLOUD_2A3A4_OFF = 0x2a3a4,
  /* Steam context gate @ 0x006fa1f0: cmp dword ptr [eax],0 - FULL dword. */
  ISAAC_EXIT_ROOT_STEAM_CTX_IAT = 0x00b18a1cu,
  ISAAC_EXIT_ROOT_STEAM_CTX_ARG = 0x00c5c3a4,
  ISAAC_EXIT_ROOT_STEAM_CTX_FIRST_DWORD_OFF = 0,
  /* GameState IO skip byte @ Game+0x2658b. */
  ISAAC_EXIT_ROOT_GAMESTATE_SKIP_OFF = 0x2658b,
  /* ANM2::Reset (exact 0x00407f10): three ordered this offsets. */
  ISAAC_EXIT_ROOT_ANM2_RESET_COUNT = 3,
  ISAAC_EXIT_ROOT_ANM2_RESET_THIS_OFF_0 = 0x1d528,
  ISAAC_EXIT_ROOT_ANM2_RESET_THIS_OFF_1 = 0x1c03c,
  ISAAC_EXIT_ROOT_ANM2_RESET_THIS_OFF_2 = 0x1d1d8,
  /* Vector dtor loop @ 0x006fa27f: this=elem+8, stride 0x38; begin@+0x25ebc,
     end@+0x25ec0; dtor host 0x0040d040; end<-begin re-read after loop. */
  ISAAC_EXIT_ROOT_VECTOR_BEGIN_OFF = 0x25ebc,
  ISAAC_EXIT_ROOT_VECTOR_END_OFF = 0x25ec0,
  /* 0x008d26c0 receiver (args 0,0). */
  ISAAC_EXIT_ROOT_8D26C0_THIS_OFF = 0x25108,
  /* Root post-log pure pack float globals (runtime; v31). */
  ISAAC_EXIT_ROOT_F32_GLOBAL_C7B640_ADDR = 0x00c7b640u,
  ISAAC_EXIT_ROOT_F32_GLOBAL_C7B644_ADDR = 0x00c7b644u,
  /* Map walk base @ 0x006fa457: Game+0x1a738. */
  ISAAC_EXIT_ROOT_MAP_BASE_OFF = 0x1a738,
  ISAAC_EXIT_ROOT_MAP_NODE_KEY_DELTA = 0x10,
  ISAAC_EXIT_ROOT_MAP_NODE_FLAG_OFF = 0x28,
  ISAAC_EXIT_ROOT_MAP_ELEM_BEGIN_OFF = 0x44,
  ISAAC_EXIT_ROOT_MAP_ELEM_END_OFF = 0x48,
  ISAAC_EXIT_ROOT_MAP_ELEM_STRIDE = 0x20,
  ISAAC_EXIT_ROOT_MAP_ELEM_HOST_OFF = 0x18,
  /* Ordered event kinds (event word = kind<<24 | payload24). */
  ISAAC_EXIT_ROOT_EVENT_HOST = 1,              /* payload = VA */
  ISAAC_EXIT_ROOT_EVENT_PURE = 2,             /* payload = pure segment id */
  ISAAC_EXIT_ROOT_EVENT_VECTOR_DTOR_LOOP = 3, /* payload = element count */
  ISAAC_EXIT_ROOT_EVENT_MAP_WALK = 4,         /* payload = 0 */
  /* Pure segment ids (match the model EXIT_ROOT_SEG_* constants). */
  ISAAC_EXIT_ROOT_SEG_MANAGER_FLOATS = 1,
  ISAAC_EXIT_ROOT_SEG_PGD_CHANGES_CLEAR = 2,
  ISAAC_EXIT_ROOT_SEG_TEARDOWN_T0 = 3,
  ISAAC_EXIT_ROOT_SEG_TEARDOWN_T1 = 4,
  ISAAC_EXIT_ROOT_SEG_TEARDOWN_T2 = 5,
  ISAAC_EXIT_ROOT_SEG_VECTOR_CLEAR_END = 6,
  ISAAC_EXIT_ROOT_SEG_BYTE_25954 = 7,
  ISAAC_EXIT_ROOT_SEG_PGD_READONLY = 8,
  ISAAC_EXIT_ROOT_SEG_POSTLOG_PACK = 9,
  ISAAC_EXIT_ROOT_SEG_OVERLAY_STATE = 10,
  ISAAC_EXIT_ROOT_SEG_RESIDUAL_18990 = 11,
  ISAAC_EXIT_ROOT_SEG_MAP_FLAG_28 = 12,
  ISAAC_EXIT_ROOT_SEG_TERMINAL = 13,
  /* Max events in the plan array (34 base + 1 overlay + 1 vector loop
     + 4 PGD flush + 1 GameState + 1 map walk = 42; 48 headroom). */
  ISAAC_EXIT_ROOT_EVENT_CAP = 48
};

/* ebx flag derivation: arg0 != 0 → 1 (ctor temp), else 2 (empty SSO). */
int32_t isaac_exit_408310_flag(uint32_t arg0);

/* [this] ← arg0 (PE @ 0x00408346). */
void isaac_exit_408310_set_arg0(uint8_t* this_base, uint32_t arg0);

/* Pure empty SSO temp (PE @ 0x00408369–0x0040837f): dword buf ← 0,
   size@+0x10 ← 0, cap@+0x14 ← 0xf. The trailing byte store buf[0]=0 is
   subsumed by the dword store. */
void isaac_exit_408310_empty_temp(uint8_t* temp_base);

/* Post-arm2 reset to an empty SSO temp (PE @ 0x00408433–0x00408441):
   size@+0x10 ← 0, cap@+0x14 ← 0xf, byte buf[0] ← 0. */
void isaac_exit_408310_temp_reset(uint8_t* temp_base);

/* Self-assign guard @ 0x00408398: cmp edx,eax; je — FULL dword, dst != src. */
int32_t isaac_exit_408310_assign_needed(uint32_t dst_addr, uint32_t src_base);

/* Src data decode @ 0x0040839c: cmp [src+0x14],0x10; jb — UNSIGNED below:
   cap < 0x10 → src_base (SSO), else [src_base] (heap ptr, recaptured). */
uint32_t isaac_exit_408310_src_data_addr(uint32_t src_base, uint32_t src_cap,
                                         uint32_t src_dword0);

/* Free arm gate: (flag & arm_mask) != 0 on the LOW byte (test bl,2 / bl,1),
   AND cap >= 0x10 (cmp cap,0x10; jb — unsigned; same gate as the v19
   0x40ccd0 free idiom). */
int32_t isaac_exit_408310_arm_free_needed(uint32_t flag, uint32_t arm_mask,
                                          uint32_t cap);

/* Where the sized free's first argument points: heap-header path → header
   (recaptured [ptr-4]), else ptr. PE @ 0x004083d7 / 0x00408413. */
uint32_t isaac_exit_408310_free_ptr(uint32_t ptr, uint32_t uses_header,
                                    uint32_t header);

/* Sized free byte count: cap+1, or +0x23 on the heap-header path (wrap). */
uint32_t isaac_exit_408310_free_count(uint32_t cap, uint32_t uses_header);

/* CRT invalid_parameter host needed: big path AND header offset NOT ok
   (PE @ 0x004083e2/0x0040841e: cmp off,0x1f; ja abort). */
int32_t isaac_exit_408310_abort_needed(uint32_t uses_header,
                                       uint32_t offset_ok);

/* field_7c = (g_c798e4 & 4) == 0 ? 6 : 1 (PE @ 0x004084ea–0x00408515). */
int32_t isaac_exit_408310_field_7c(uint32_t g_c798e4);

uint32_t isaac_exit_408310_gate_c798e4_addr(void);

/* Pure tail after host 0x0040c7f0(0) (PE @ 0x00408452–0x00408594). Raw
   f32 bits are passed through: 1.0f constants are file-backed .data, while
   g_c7b640/g_c7b644/g_c798e4 are RUNTIME globals (past .data raw end). */
void isaac_exit_408310_tail_apply(uint8_t* this_base, uint32_t g_c7b640,
                                  uint32_t g_c7b644, uint32_t g_c798e4);

typedef struct IsaacExit408310Plan {
  uint32_t arg0;
  uint32_t dst_addr;   /* this + 8 */
  uint32_t temp_base;  /* ctor path: copy-ctor 0x40cf50 return (recaptured);
                          empty path: the SSO temp base */
  int32_t flag;        /* 1 ctor / 2 empty */
  uint32_t temp_ptr;   /* [temp_base] (recaptured) */
  uint32_t temp_size;  /* [temp_base+0x10] (recaptured) */
  uint32_t temp_cap;   /* [temp_base+0x14] (recaptured) */
  int32_t assign_needed;
  uint32_t assign_src_data; /* decoded (SSO base or heap ptr) */
  uint32_t assign_count;    /* temp size */
  int32_t arm1_free_needed; /* empty-temp arm (test bl,2) */
  uint32_t arm1_free_ptr;
  uint32_t arm1_free_count;
  int32_t arm1_abort_needed;
  int32_t arm2_free_needed; /* ctor-temp arm (test bl,1) */
  uint32_t arm2_free_ptr;
  uint32_t arm2_free_count;
  int32_t arm2_abort_needed;
  uint32_t host_98_addr;    /* host 0x0040c7f0(0) this */
  uint32_t invalid_param_iat;
} IsaacExit408310Plan;

void isaac_exit_408310_plan(IsaacExit408310Plan* out, uint32_t arg0,
                            uint32_t dst_addr, uint32_t temp_base,
                            uint32_t temp_ptr, uint32_t temp_size,
                            uint32_t temp_cap, uint32_t header);

/* --- ABI v33: Game::Exit root typed continuation plan --- */

/* Host 0x007df690 receiver (PE @ 0x006fa190/0x006fa1ae):
   Manager + 0x29fc0 + ([Manager+0x29fbc] * 0x184) — imul with 32-bit wrap. */
uint32_t isaac_exit_root_7df690_receiver(uint32_t manager_base,
                                         uint32_t count_29fbc);

/* Ordered ANM2::Reset this offsets (exact 0x00407f10): count + table. */
int32_t isaac_exit_root_anm2_reset_count(void);
uint32_t isaac_exit_root_anm2_reset_this_off_at(uint32_t index);

typedef struct IsaacExitRootPlan {
  int32_t entry_active;              /* LOW-BYTE gate Game+0x2658a */
  uint32_t should_save;              /* raw dword arg for host 0x008650a0 */
  int32_t overlay_force_needed;      /* FULL-dword state == 2 */
  int32_t sfx_stop_count;            /* 5 when active, else 0 */
  uint32_t sfx_receiver_off;         /* Manager+0x2a324 */
  uint32_t mgr_host_7df690_receiver; /* computed receiver (wrap) */
  int32_t pgd_flush_needed;          /* byte changesmade && byte fileLoaded */
  int32_t pgd_save_cloud;            /* FULL-dword steam ctx && byte cloud */
  int32_t gamestate_io_needed;       /* byte skip == 0 */
  int32_t gamestate_should_write;    /* byte ShouldSave != 0 */
  int32_t anm2_reset_count;          /* 3 when active, else 0 */
  uint32_t anm2_reset_this_off_0;    /* 0x1d528 */
  uint32_t anm2_reset_this_off_1;    /* 0x1c03c */
  uint32_t anm2_reset_this_off_2;    /* 0x1d1d8 */
  int32_t vector_dtor_count;         /* (end-begin)/0x38, 0 when inactive */
  int32_t host_8d26c0_needed;        /* v34: 0 drops the host event */
  int32_t event_count;               /* 0 when inactive */
  uint32_t event[ISAAC_EXIT_ROOT_EVENT_CAP]; /* kind<<24 | payload */
} IsaacExitRootPlan;

/* Pure root control flow: fills the typed continuation plan for the whole
   Game::Exit body in PE order. When the entry gate is closed the plan is
   empty (early ret @ 0x006fa531). All byte gates re-narrow explicitly;
   the steam-context gate is a FULL-dword test on the recaptured [eax]. */
void isaac_exit_root_plan(IsaacExitRootPlan* out, uint32_t should_save,
                          uint32_t session_active_2658a,
                          uint32_t overlay_state_1c034,
                          uint32_t mgr_changesmade_14,
                          uint32_t mgr_file_loaded_f8c,
                          uint32_t steam_ctx_word,
                          uint32_t mgr_cloud_2a3a4,
                          uint32_t skip_gamestate_io_2658b,
                          uint32_t mgr_count_29fbc, uint32_t vector_begin,
                          uint32_t vector_end, uint32_t set_index_7d8);

/* --- ABI v34: complete body of 0x008d26c0 (set-index step rescaler) --- */

enum {
  /* Receiver field offsets (PE reads/writes, all relative to `this`). */
  ISAAC_EXIT_8D26C0_VEC_BEGIN_OFF = 0x7cc,  /* 0x008d26e8 */
  ISAAC_EXIT_8D26C0_VEC_END_OFF = 0x7d0,    /* 0x008d26dd */
  ISAAC_EXIT_8D26C0_SET_INDEX_OFF = 0x7d8,  /* 0x008d26cb read / 0x008d2702 write */
  ISAAC_EXIT_8D26C0_FRAME_OFF = 0x834,      /* 0x008d271a read / 0x008d2761 write */
  ISAAC_EXIT_8D26C0_STEP_OFF = 0x838,       /* 0x008d2730 read / 0x008d274d write */
  ISAAC_EXIT_8D26C0_ELEM_STRIDE = 0xc,      /* lea [esi+esi*2] then *4 */
  ISAAC_EXIT_8D26C0_ELEM_LO_OFF = 0,        /* 0x008d270c */
  ISAAC_EXIT_8D26C0_ELEM_HI_OFF = 4,        /* 0x008d2708 */
  ISAAC_EXIT_8D26C0_SUB_SHIFT = 2,          /* sar ecx,2 @ 0x008d2717 */
  /* MSVC SIGNED magic division by ELEM_STRIDE (0x008d26e3). */
  ISAAC_EXIT_8D26C0_DIV_MAGIC = 0x2aaaaaab,
  /* .rdata constants, resolved through the section table. */
  ISAAC_EXIT_8D26C0_F32_360_BITS = 0x43b40000u,  /* 0x00baab30 = 360.0f */
  ISAAC_EXIT_8D26C0_F32_HALF_BITS = 0x3f000000u, /* 0x00baa2d0 = 0.5f */
  ISAAC_EXIT_8D26C0_U32_FIXUP_ADDR = 0x00bacb00u, /* {0.0, 4294967296.0} */
  /* Logger edge (level, format) — retired by the standing logger split. */
  ISAAC_EXIT_8D26C0_LOG_VA = 0x00a112c0u,
  ISAAC_EXIT_8D26C0_LOG_LEVEL = 8,
  ISAAC_EXIT_8D26C0_LOG_FMT_ADDR = 0x00b758b8u, /* "Invalid set index %d \n" */
  /* x86 CVTTSS2SI integer indefinite (NaN / inf / out of range). */
  ISAAC_EXIT_8D26C0_CVTTSS2SI_INDEFINITE = 0x80000000u,
  ISAAC_EXIT_8D26C0_STACK_ARG_BYTES = 8,
  /* Arms. Both non-apply arms store nothing. */
  ISAAC_EXIT_8D26C0_ARM_NOOP = 0,
  ISAAC_EXIT_8D26C0_ARM_INVALID = 1,
  ISAAC_EXIT_8D26C0_ARM_APPLY = 2,
  ISAAC_EXIT_8D26C0_APPLY_STORE_COUNT = 3
};

/* Entry no-op gate: FULL-dword index compare AND a LOW-BYTE force test
   (PE 0x008d26cb cmp esi,[edi+0x7d8] / jne; 0x008d26d3 cmp byte
   ptr [ebp+0xc],0 / je 0x008d277e). `force` is deliberately uint32_t so
   the mask survives -O2; bits above the low byte must not open the gate. */
int32_t isaac_exit_8d26c0_is_noop(uint32_t index, uint32_t cur_index,
                                  uint32_t force);

/* Element count: (end - begin) through the MSVC SIGNED magic division by
   0xc. NOT unsigned delta/0xc — the sar/shr/add correction is reproduced
   exactly (PE 0x008d26dd..0x008d26f9). */
int32_t isaac_exit_8d26c0_element_count(uint32_t begin, uint32_t end);

/* Bound test: PE 0x008d26fd `jae` is UNSIGNED, over the signed count. */
int32_t isaac_exit_8d26c0_index_valid(uint32_t index, int32_t count);

/* begin + index * 0xc with 32-bit wrap (PE 0x008d26ff / 0x008d2708). */
uint32_t isaac_exit_8d26c0_element_addr(uint32_t begin, uint32_t index);

/* ([elem+4] - [elem+0]) >> 2 — ARITHMETIC shift (PE 0x008d2717 sar). */
int32_t isaac_exit_8d26c0_sub_count(uint32_t elem_lo, uint32_t elem_hi);

/* New step: 360.0f / (float)(double)(uint32_t)sub_count. The unsigned
   conversion is the machine's cvtdq2pd + sign-bit-indexed 2^32 fixup.
   Returned as raw bits so a caller never loses a NaN payload. */
uint32_t isaac_exit_8d26c0_step_bits(int32_t sub_count);

/* New frame: cvttss2si(((float)old_frame * old_step) / new_step + 0.5f).
   old_step is the value BEFORE the new one is stored. Out-of-range, inf
   and NaN all yield 0x80000000, as the machine does. */
int32_t isaac_exit_8d26c0_frame_from(int32_t old_frame, uint32_t old_step_bits,
                                     uint32_t new_step_bits);

typedef struct IsaacExit8d26c0Plan {
  int32_t arm;              /* ISAAC_EXIT_8D26C0_ARM_* */
  int32_t element_count;    /* signed magic division result */
  int32_t index_valid;      /* unsigned bound test */
  uint32_t element_addr;    /* 0 unless APPLY */
  int32_t sub_count;        /* 0 unless APPLY */
  uint32_t new_step_bits;   /* 0 unless APPLY */
  int32_t new_frame;        /* 0 unless APPLY */
  int32_t store_count;      /* 0 / 0 / 3 */
  int32_t log_needed;       /* 1 only on INVALID */
  uint32_t log_level;       /* 8 when logging, else 0 */
  uint32_t log_fmt_addr;    /* 0x00b758b8 when logging, else 0 */
  uint32_t log_arg;         /* the raw index when logging, else 0 */
} IsaacExit8d26c0Plan;

/* Whole-body pure control flow. The element pair is supplied by the
   caller because it lives in the vector's heap block, not the receiver. */
void isaac_exit_8d26c0_plan(IsaacExit8d26c0Plan* out, uint32_t index,
                            uint32_t force, uint32_t cur_index,
                            uint32_t vec_begin, uint32_t vec_end,
                            uint32_t elem_lo, uint32_t elem_hi,
                            int32_t old_frame, uint32_t old_step_bits);

/* Linear-memory apply over the receiver. Writes ONLY on the APPLY arm and
   writes exactly the three PE stores, in PE order. Returns the arm. */
int32_t isaac_exit_8d26c0_apply(uint8_t* this_base, uint32_t index,
                                uint32_t force, uint32_t elem_lo,
                                uint32_t elem_hi);

/* Root drop gate: the Game::Exit site calls with index 0 and force 0, so
   the body is a proven complete no-op when the current index is 0 and the
   host event can be dropped. Any other value keeps the host event. */
int32_t isaac_exit_root_8d26c0_host_needed(uint32_t cur_index);

/* --- ABI v35: Game::Exit map walk continuation (PE 0x006fa457–0x006fa50a) ---
   The root plan's MAP_WALK event (kind 4) is expanded into its PE-ordered
   nested events by isaac_exit_root_map_walk_plan. Inline in Game::Exit —
   not a separate function — so every gate below is transcribed from the
   instruction stream, not from a callee body.

   Walk shape (this = map at Game+0x1a738; [map]=sentinel, root=[sentinel+4]):
     first = [sentinel]; first == sentinel -> walk skipped entirely
     per node (MSVC map iteration):
       1. key  = node+0x10; find(map, out_slot, key) @ 0x0069d690 (pure;
          the v11 pure-complete find is called internally; out_slot is the
          caller-supplied linear-memory analogue of the PE's [ebp-4] slot).
       2. found != sentinel0 (the ORIGINAL sentinel read @ 0x006fa457) AND
          byte [found+0x28] != 0 (LOW-BYTE test) -> elem range
          [found+0x44, [found+0x48]) is walked: HOST 0x0040c7f0(0) on
          elem+0x18, stride 0x20; the range end is RE-READ from [found+0x48]
          each iteration (@ 0x006fa4ad).
       3. found is RE-READ from out_slot (@ 0x006fa4b5, after the elem
          hosts, exactly like the PE), then BYTE [found+0x28] <- 0
          (@ 0x006fa4b8). The plan APPLIES this store (later iterations
          observe it, as the PE does) and also emits it as an event.
       4. HOST 0x0040e910 per iteration (@ 0x006fa4bc) — the same global
          tree walk / COM release the root plan calls once before the walk.
       5. MSVC tree iterator++ INLINE (@ 0x006fa4c1–0x006fa504) — same
          algorithm as freestanding 0x00414a80 (isaac_exit_tree_iterator_
          next); the two are cross-asserted in tests.
       6. sentinel RE-READ from [map] (@ 0x006fa506) for the continue test.
   Recapture discipline: the found value used for the flag clear is the
   post-host RE-READ (defect class 1: never fold to the pre-host value);
   sentinel0 vs the per-iteration re-read are deliberately kept separate.
   Host content that stays residual: the 0x0040c7f0 and 0x0040e910 bodies
   (their pure CF is v9/v12-modeled; alloc/COM/erase/free stay host).

   Event words reuse the root plan's kind<<24|payload encoding:
     kind 5 WALK_ELEM_HOST   payload = 0x0040c7f0 receiver (elem+0x18)
     kind 6 WALK_GLOBAL_HOST payload = 0 (0x0040e910 body)
     kind 8 WALK_FLAG_CLEAR  payload = flag address (found+0x28; applied) */
enum {
  ISAAC_EXIT_ROOT_MAP_WALK_EVENT_CAP = 64,
  ISAAC_EXIT_ROOT_MAP_WALK_NODE_CAP = 64,
  ISAAC_EXIT_ROOT_MAP_WALK_KIND_ELEM_HOST = 5,
  ISAAC_EXIT_ROOT_MAP_WALK_KIND_GLOBAL_HOST = 6,
  ISAAC_EXIT_ROOT_MAP_WALK_KIND_FLAG_CLEAR = 8,
  ISAAC_EXIT_ROOT_MAP_WALK_ELEM_HOST_VA = 0x0040c7f0u, /* PE @ 0x006fa4a5 */
  ISAAC_EXIT_ROOT_MAP_WALK_GLOBAL_VA = 0x0040e910u,    /* PE @ 0x006fa4bc */
  ISAAC_EXIT_ROOT_MAP_WALK_FIND_VA = 0x0069d690u,      /* PE @ 0x006fa47c */
};

typedef struct IsaacExitRootMapWalkPlan {
  int32_t walk_active;        /* first != sentinel -> walk runs */
  int32_t node_count;         /* outer iterations */
  int32_t elem_host_count;    /* 0x0040c7f0 events */
  int32_t flag_clear_count;   /* byte clears (applied + emitted) */
  int32_t global_host_count;  /* 0x0040e910 events == node_count */
  int32_t event_count;        /* capped at EVENT_CAP */
  int32_t truncated;          /* a cap cut the event stream */
  uint32_t event[ISAAC_EXIT_ROOT_MAP_WALK_EVENT_CAP];
} IsaacExitRootMapWalkPlan;

/* PE @ 0x006fa488: cmp byte ptr [found+0x28],0 — LOW-BYTE test. */
int32_t isaac_exit_root_map_walk_flag_active(uint32_t flag28_in);

/* PE @ 0x006fa4a2: lea ecx,[edi+0x18] — 0x0040c7f0 receiver. */
uint32_t isaac_exit_root_map_walk_elem_host_this(uint32_t elem_addr);

/* PE @ 0x006fa4b8: mov byte [eax+0x28],0 — flag address. */
uint32_t isaac_exit_root_map_walk_flag_addr(uint32_t found_addr);

/* PE @ 0x006fa4c1–0x006fa504: the INLINE MSVC tree iterator++.
   Same algorithm as 0x00414a80; agreement is asserted in tests. */
uint32_t isaac_exit_root_map_walk_next(uint32_t node_addr);

uint32_t isaac_exit_root_map_walk_elem_host_va(void);
uint32_t isaac_exit_root_map_walk_global_va(void);
uint32_t isaac_exit_root_map_walk_find_va(void);

/* Whole-walk typed continuation plan over linear memory. Applies ONLY the
   pure flag-clear stores (byte 0 at found+0x28) so later decisions observe
   them exactly like the PE; all 0x0040c7f0 / 0x0040e910 calls are emitted
   as ordered host events for the driver. out_slot_addr is a scratch dword
   (the PE's [ebp-4]). */
void isaac_exit_root_map_walk_plan(IsaacExitRootMapWalkPlan* out,
                                   uint32_t map_addr, uint32_t out_slot_addr);

/* --- ABI v36: complete body of 0x007df690 (7-slot volume setter) ---
   Body: 123 bytes, ret @ 0x007df70a. this = 7 slots of stride 0x34; per
   slot s = this + i*0x34 (i = 0..6):
     1. obj0 = [s]; obj0 == 0 -> next slot (FULL-dword test, 0x007df69f)
     2. HOST gate: vtable[obj0]+0x28() (0x007df6a5/0x007df6a8); closed
        (al == 0) -> next slot
     3. obj1 = [s] RE-READ after the host call (0x007df6b3 — the gate can
        rewrite the slot; never fold to obj0)
     4. STORE [s+0x14] = float (0x007df6b5) — the body's only pure store
     5. obj1 == 0 -> next slot; else HOST set: vtable[obj1]+0x58(float)
        (0x007df6c6), vtable re-read from [obj1] (0x007df6be)
   Callers: Game::Exit 0x006fa1b6 (float 1.0f from .rdata 0x00baa454),
   0x007e1c4a (two receivers 0x184 apart, float [esi+0x314]), and TWO
   Game::Update sites 0x00803fd2 / 0x0080407a (genrand-derived float) —
   frame-path reachable. The vtable leaves stay host; everything else is
   translated below. */
enum {
  ISAAC_EXIT_7DF690_SLOT_COUNT = 7,    /* mov edi,6 + inline slot 0 */
  ISAAC_EXIT_7DF690_SLOT_STRIDE = 0x34, /* add esi,0x34 @ 0x007df6c9 */
  ISAAC_EXIT_7DF690_FLOAT_OFF = 0x14,   /* movss [esi+0x14],xmm0 */
  ISAAC_EXIT_7DF690_GATE_VTBL_OFF = 0x28, /* mov eax,[eax+0x28]; call eax */
  ISAAC_EXIT_7DF690_SET_VTBL_OFF = 0x58   /* call [eax+0x58] */
};

typedef struct IsaacExit7df690Plan {
  int32_t slot_count;                    /* 7 */
  int32_t obj_present_count;             /* slots whose [s] != 0 (plan-time) */
  uint32_t slot_addr[ISAAC_EXIT_7DF690_SLOT_COUNT];
} IsaacExit7df690Plan;

/* PE 0x007df6cc: the fixed 7-iteration loop. */
int32_t isaac_exit_7df690_slot_count(void);

/* s = this + i*0x34, 32-bit wrap (PE 0x007df6c9/0x007df6fd); index >= 7
   -> 0 (the PE loop never iterates past 6). */
uint32_t isaac_exit_7df690_slot_addr(uint32_t receiver, uint32_t index);

uint32_t isaac_exit_7df690_float_off(void);
uint32_t isaac_exit_7df690_gate_vtbl_off(void);
uint32_t isaac_exit_7df690_set_vtbl_off(void);

/* PE 0x007df69f: test ecx,ecx — FULL-dword presence test. A pointer with
   a zero low byte (0x100) IS present; never narrow to a byte test. */
int32_t isaac_exit_7df690_slot_obj_present(uint32_t slot_addr);

/* PE 0x007df6b5: the gate-open float store, raw u32 bits. Returns the
   stored address. */
uint32_t isaac_exit_7df690_apply(uint32_t slot_base, uint32_t float_bits);

/* Plan-time census: slot addresses + obj-presence count. The gate
   outcomes and the post-gate [s] recapture are host-side (driver state),
   exactly like the PE. */
void isaac_exit_7df690_plan(IsaacExit7df690Plan* out, uint32_t receiver);

/* --- ABI v37: Exit-root prologue 0x008650a0 (217 B) ---
   Body: 217 bytes. Happy-path ret 4 @ 0x0086512b; SEH filter ret @
   0x00865178. stdcall-shaped (one stack arg = ShouldSave, pushed RAW
   at Game::Exit 0x006fa0df); identify-zhl empty.

   Sibling of lua 0x008607a0 (BYTE flag 2, pack arg1=1, call 0x872980)
   and frame-opaque 0x00864c30 (DWORD flag 0x2000, pack arg1=0xd, call
   0x874910). This body is the 0x20000 / 0x11 / 0x874a10 member:

     engine = [DAT_00c71690]                         @ 0x008650cb
     pack this = { [engine+0x10], 0x11, 0xffffffff } @ 0x008650d1..e2
     eax = [engine]; test dword [eax], 0x20000       @ 0x008650e7
     je SEH teardown                                 @ 0x008650ed
     push ShouldSave; call 0x00874a10 (this=pack)    @ 0x00865101  HOST
     IAT luaL_unref(out.L, REGISTRYINDEX, out.ref)   @ 0x00865111  HOST
     SEH teardown; ret 4

   Classification (identify-zhl empty on every VA; IAT from the import
   directory):
     0x00874a10     HOST -- frame-opaque v23 already models the lua
                    pack/push sibling; do not reopen
     IAT 0xb1831c   HOST -- Lua5.3.3r.dll!luaL_unref (hint 42)
     0x00a112c0     HOST -- logger (SEH unwinder; fmt at 0x00b6fd1c is
                    string evidence, not a ZHL name)
     0x00693180     HOST -- SEH side log (frame-opaque marks host)
     virtual +4     HOST -- vtbl name fetch in the unwinder
     SEH unwinder   HOST -- fs:[0] / cookie / filter at 0x0086512e

   PURE islands: FULL-dword 0x20000 entry gate, engine+0x10 pointer
   math, the three pack stores in PE order (arg1, arg2, holder LAST).
   ShouldSave is not tested here -- it is passed through RAW to 874a10
   (that body's low-byte boolean is frame-opaque's, not ours).
   0x007df690 (v36) is consumed only by reference; its body is not
   reopened. */
enum {
  ISAAC_EXIT_8650A0_VA = 0x008650a0u,
  ISAAC_EXIT_8650A0_BODY_BYTES = 217,       /* 0xD9; first_ret 0x86512b */
  ISAAC_EXIT_8650A0_RET_BYTES = 4,          /* ret 4 @ 0x0086512b */
  ISAAC_EXIT_8650A0_ENGINE_GLOBAL_DAT = 0x00c71690u, /* mov ecx,[DAT] */
  ISAAC_EXIT_8650A0_HOLDER_OFF = 0x10,      /* [ecx+0x10] @ 0x008650df */
  ISAAC_EXIT_8650A0_FLAG_MASK = 0x20000u,   /* test dword [eax], 0x20000 */
  ISAAC_EXIT_8650A0_PACK_ARG1 = 0x11,       /* [ebp-0x28] @ 0x008650d1 */
  ISAAC_EXIT_8650A0_PACK_ARG2 = 0xffffffffu, /* [ebp-0x24] @ 0x008650d8 */
  ISAAC_EXIT_8650A0_TRY_LEVEL = 0,          /* [ebp-4] @ 0x008650f5 */
  ISAAC_EXIT_8650A0_REGISTRY_INDEX = 0xfff0b9d8u, /* LUA_REGISTRYINDEX */
  ISAAC_EXIT_8650A0_UNREF_IAT = 0x00b1831cu, /* luaL_unref */
  ISAAC_EXIT_8650A0_HOST_874A10_VA = 0x00874a10u,
  ISAAC_EXIT_8650A0_HOST_LOGGER_VA = 0x00a112c0u,
  ISAAC_EXIT_8650A0_HOST_693180_VA = 0x00693180u
};

typedef struct IsaacExit8650a0Plan {
  int32_t flag_open;            /* (flag_dword & 0x20000) != 0 */
  int32_t host_874a10_needed;   /* == flag_open (same arm) */
  int32_t host_unref_needed;    /* == flag_open (unref is unconditional
                                   after 874a10 returns) */
  uint32_t holder_addr;         /* engine + 0x10, 32-bit wrap */
  uint32_t pack_arg1;           /* 0x11 */
  uint32_t pack_arg2;           /* 0xffffffff */
  uint32_t should_save;         /* raw stack dword, unmasked */
} IsaacExit8650a0Plan;

/* PE 0x008650e7: test dword ptr [eax], 0x20000 -- FULL-dword. 0x2000
   (the 0x00864c30 sibling bit) is CLOSED. 0x100 / 0x1ff are CLOSED.
   0xffffffff is OPEN. Never narrow to a byte test. */
int32_t isaac_exit_8650a0_flag_open(uint32_t flag_dword);

/* Same arm: both 0x874a10 and luaL_unref fire iff the gate is open. */
int32_t isaac_exit_8650a0_host_needed(uint32_t flag_dword);

uint32_t isaac_exit_8650a0_flag_mask(void);
uint32_t isaac_exit_8650a0_holder_off(void);

/* PE 0x008650df: lea-equivalent engine+0x10, 32-bit wrap. */
uint32_t isaac_exit_8650a0_holder_addr(uint32_t engine);

uint32_t isaac_exit_8650a0_pack_arg1(void);
uint32_t isaac_exit_8650a0_pack_arg2(void);
uint32_t isaac_exit_8650a0_registry_index(void);
uint32_t isaac_exit_8650a0_unref_iat(void);
uint32_t isaac_exit_8650a0_host_874a10_va(void);

/* PE 0x008650d1 / 0x008650d8 / 0x008650e2: three pack stores in PE
   order (arg1 at +4, arg2 at +8, holder at +0 LAST). Returns pack_base. */
uint32_t isaac_exit_8650a0_pack_apply(uint32_t pack_base, uint32_t holder);

/* Plan-time census: gate + host-needed bits + pack immediates + holder
   address. The 0x874a10 / luaL_unref bodies and the SEH unwinder stay
   driver-side, exactly like the PE. */
void isaac_exit_8650a0_plan(IsaacExit8650a0Plan* out, uint32_t flag_dword,
                            uint32_t engine, uint32_t should_save);

/* --- ABI v38: Exit nest 0x00686950 (384 B; 1075 B window is 3 funcs) ---
   Body: 384 bytes, early ret @ 0x00686a1f (remove path), terminal ret @
   0x00686acf. __thiscall; this = Game+0x68d78 at Exit 0x006fa425 (also
   called from console 0x0068bb81). identify-zhl empty on every VA/IAT.

   The assignment's 1075 B nest is a linear decode past the terminal ret
   into two siblings that Exit does NOT call:
     0x00686ad0  ret 4 @ 0x00686b50/0x00686b6a  (6 console callers)
     0x00686b70  ret 4 @ 0x00686d80  (SEH; 0x40cf50 x2; 2 console callers)
   0x40cf50 stays frame-opaque territory; do not translate it here.

   PE (entry + pack + I/O gates):
     0x00686968 cmp dword [esi], 1 ; jbe 0x686abf     UNSIGNED
     0x00686971 mov ecx, [DAT_00c7169c]               Manager
     0x00686977 mov dword [esi], 4                    pack 1
     0x0068697d mov dword [esi+4], 0                  pack 2
     0x00686984 mov byte [ecx+0x4abc7], 1             pack 3
     0x0068698b cmp [ecx+0x4b3d8], [ecx+0x4b3dc] ; jne epilogue
     0x0068699d game=[DAT_00c71678]; test; je 2a398
                cmp dword [game+0x26630], 0 ; jbe 2a398   UNSIGNED ==0
                cmp byte [game+0x26638], 0 ; je epilogue  LOW-BYTE
     0x006869bc cmp byte [ecx+0x2a398], 0 ; je epilogue   LOW-BYTE
     0x006869c9 cmp byte [ecx+0x2a3a1], 0 ; je epilogue   LOW-BYTE
     then HOST sprintf 0x41e420("%s%s", dir BSS 0xc72a28, "cmd_history.txt")
     [esi+0x64]==0 -> IAT remove 0xb187cc; else fopen 0xa25090 + virtuals

   Classification:
     entry gate          PURE UNSIGNED dword > 1 (jbe, NOT jle)
     three pack stores   PURE, PE order, fire even if I/O later skips
     vec empty / game /  PURE CF (I/O host_needed); bodies stay host
     2a398 / 2a3a1
     0x0041e420          HOST (sprintf-shaped; string evidence only)
     IAT 0xb187cc        HOST api-ms-win-crt-filesystem-l1-1-0!remove
     0x00a25090          HOST (fopen-shaped this=0xc5aa80)
     virtual +0x1c / +0  HOST
     0xaef12b            HOST cookie
     0x40cf50            HOST — lives in sibling 0x00686b70, not this body

   Honest counter: the root plan still emits evHost(0x00686950). The body
   is NARROWED, not removed — sprintf / file I/O / virtuals stay host. */
enum {
  ISAAC_EXIT_686950_VA = 0x00686950u,
  ISAAC_EXIT_686950_BODY_BYTES = 384,        /* 0x180; terminal ret 0x686acf */
  ISAAC_EXIT_686950_WINDOW_BYTES = 1075,     /* 0x433; three-function window */
  ISAAC_EXIT_686950_THIS_FROM_GAME = 0x68d78, /* Exit site this */
  ISAAC_EXIT_686950_STATE_VALUE = 4,         /* [this] <- 4 @ 0x00686977 */
  ISAAC_EXIT_686950_FIELD4_VALUE = 0,        /* [this+4] <- 0 @ 0x0068697d */
  ISAAC_EXIT_686950_MGR_FLAG_OFF = 0x4abc7,  /* byte store = 1 */
  ISAAC_EXIT_686950_MGR_FLAG_VALUE = 1,
  ISAAC_EXIT_686950_VEC_BEGIN_OFF = 0x4b3d8,
  ISAAC_EXIT_686950_VEC_END_OFF = 0x4b3dc,
  ISAAC_EXIT_686950_GAME_COUNT_OFF = 0x26630,
  ISAAC_EXIT_686950_GAME_FLAG_OFF = 0x26638,
  ISAAC_EXIT_686950_MGR_2A398_OFF = 0x2a398,
  ISAAC_EXIT_686950_MGR_2A3A1_OFF = 0x2a3a1,
  ISAAC_EXIT_686950_COUNT64_OFF = 0x64,
  ISAAC_EXIT_686950_MGR_GLOBAL_DAT = 0x00c7169cu, /* runtime; 2 writers */
  ISAAC_EXIT_686950_GAME_GLOBAL_DAT = 0x00c71678u, /* runtime BSS */
  ISAAC_EXIT_686950_DIR_BSS = 0x00c72a28u,    /* zero-at-load; runtime path */
  ISAAC_EXIT_686950_FMT_ADDR = 0x00b60c28u,   /* "%s%s" string evidence */
  ISAAC_EXIT_686950_NAME_ADDR = 0x00b65834u,  /* "cmd_history.txt" */
  ISAAC_EXIT_686950_NL_ADDR = 0x00b657f8u,    /* "\r\n" */
  ISAAC_EXIT_686950_BUF_SIZE = 0x100,
  ISAAC_EXIT_686950_SPRINTF_VA = 0x0041e420u,
  ISAAC_EXIT_686950_OPEN_VA = 0x00a25090u,
  ISAAC_EXIT_686950_REMOVE_IAT = 0x00b187ccu,
  ISAAC_EXIT_686950_COOKIE_VA = 0x00aef12bu
};

typedef struct IsaacExit686950Plan {
  int32_t entry_open;           /* unsigned [this] > 1 */
  int32_t pack_needed;          /* == entry_open (stores precede I/O gates) */
  int32_t host_io_needed;       /* entry_open && remaining I/O gates */
  int32_t host_remove_needed;   /* host_io && count64 == 0 (FULL-dword) */
  int32_t host_write_needed;    /* host_io && count64 != 0 */
  uint32_t mgr_flag_addr;       /* manager + 0x4abc7, 32-bit wrap */
  uint32_t this_addr;           /* RAW this, unmasked */
} IsaacExit686950Plan;

/* PE 0x00686968: cmp dword ptr [esi], 1 ; jbe — UNSIGNED. 0 and 1
   CLOSED; 2 OPEN; 0xffffffff OPEN (a signed jle would close it).
   Never narrow to a byte test. */
int32_t isaac_exit_686950_entry_open(uint32_t state_dword);

/* I/O gates after the pack (vec empty, optional Game+0x26638 fail,
   Manager+0x2a398 / +0x2a3a1 low-byte). Independent of entry_open so
   a closed I/O arm can still assert the pack fired. Byte samples are
   uint32_t and re-narrowed. */
int32_t isaac_exit_686950_io_open(uint32_t vec_begin, uint32_t vec_end,
                                  uint32_t game_ptr, uint32_t game_26630,
                                  uint32_t game_26638_in,
                                  uint32_t mgr_2a398_in,
                                  uint32_t mgr_2a3a1_in);

/* entry_open && io_open — sprintf / remove / write sit on this arm. */
int32_t isaac_exit_686950_host_needed(uint32_t state_dword, uint32_t vec_begin,
                                      uint32_t vec_end, uint32_t game_ptr,
                                      uint32_t game_26630,
                                      uint32_t game_26638_in,
                                      uint32_t mgr_2a398_in,
                                      uint32_t mgr_2a3a1_in);

/* PE 0x006869ff: cmp dword [esi+0x64], 0 — FULL-dword. 0x100 is WRITE
   (not remove). Only meaningful when host_io is open. */
int32_t isaac_exit_686950_remove_needed(uint32_t count64);

uint32_t isaac_exit_686950_va(void);
uint32_t isaac_exit_686950_body_bytes(void);
uint32_t isaac_exit_686950_this_from_game(void);
uint32_t isaac_exit_686950_state_value(void);
uint32_t isaac_exit_686950_mgr_flag_off(void);
uint32_t isaac_exit_686950_sprintf_va(void);
uint32_t isaac_exit_686950_remove_iat(void);

/* PE 0x00686984: manager+0x4abc7, 32-bit wrap. */
uint32_t isaac_exit_686950_mgr_flag_addr(uint32_t manager);

/* PE 0x00686977 / 0x0068697d / 0x00686984: [this]=4, [this+4]=0,
   byte[manager+0x4abc7]=1, in that order. Always stores (the driver
   consults pack_needed). Returns this_addr. */
uint32_t isaac_exit_686950_pack_apply(uint32_t this_addr, uint32_t manager);

void isaac_exit_686950_plan(IsaacExit686950Plan* out, uint32_t state_dword,
                            uint32_t manager, uint32_t vec_begin,
                            uint32_t vec_end, uint32_t game_ptr,
                            uint32_t game_26630, uint32_t game_26638_in,
                            uint32_t mgr_2a398_in, uint32_t mgr_2a3a1_in,
                            uint32_t count64, uint32_t this_addr);

/* --- ABI v39: GameState write 0x00958ed0 (600 B) ---
   Body: 600 bytes, early ret @ 0x00958efa (not-in-game log), cloud-PGD
   ret @ 0x00959111, terminal ret @ 0x00959127 then int3 pad to sibling
   0x00959130. dump-pe-span --bytes 0x258 --no-stop-at-ret: 166 insns,
   0 resyncs. Manager/Game from DAT_00c7169c / DAT_00c71678. Exit site
   0x006fa21d; also 0x6f57a0 / 0x6f76bc / 0x6f802f / 0x92fc7c.

   Sibling 0x00959130 (GameState::Delete @ 0x9c8350 + stores f98=0 /
   byte+0x14=1 / byte+0x4b284=0) shares only the UNSIGNED 26630 + vec
   empty prefix. Distinct IAT (write: Steam 0xb18a1c + _fileno 0xb18920;
   delete: none) and distinct CF -- not folded.

   PE (entry + prefix + challenge + pack):
     0x00958edf cmp dword [esi+8], 2 ; je body else log 0xa112c0; ret
     0x00958f01 cmp dword [game+0x26630], 0 ; ja epilogue   UNSIGNED
     0x00958f14 cmp [esi+0x4b3d8], [esi+0x4b3dc] ; jne epilogue
     0x00958f22 call Game::GetPlayer(0) @ 0x417870          HOST
     0x00958f27 cmp byte [eax+0x173], 0 ; je pack           LOW-BYTE
     0x00958f38 GetPlayer(0); call GetExtraLives @ 0x7bf670 HOST
     0x00958f44 cmp eax, 1 ; jl epilogue                    SIGNED
     0x00958f5a mov byte [esi+0x20dcc], 1                   pack
     0x00958f61 call Game::SaveState @ 0x6f9000             HOST
     0x00958f72 mov [esi+0x1ad14], [esi+0x4b134]            copy
     0x00958f78 call 0x8f8cd0 ; mov byte [esi+0x1ad18], al  HOST+AL
     then Steam/cloud 0x9cad40 vs local fopen/write; post
     [esi+0xf98]=[esi+0x20d48] / byte [esi+0x14]=1; optional
     PGD 0x9292c0 (this=esi+0x14, SKIP reopen) + cloud/local;
     tail byte [esi+0x20dcc]=0.

   Classification:
     [Manager+8]==2           PURE FULL-dword (0x102 CLOSED)
     [Game+0x26630]==0        PURE UNSIGNED (0x80000000 CLOSED)
     vec begin==end           PURE FULL-dword
     player+0x173             PURE LOW-BYTE (0x100 CLOSED)
     GetExtraLives>=1         PURE SIGNED (0xffffffff CLOSED)
     byte 0x20dcc=1 / =0      PURE stores
     dword 0x4b134->0x1ad14   PURE copy (recapture after SaveState)
     byte 0x1ad18<-AL         PURE LOW-BYTE store of host return
     dword 0xf98<-0x20d48 +
       byte 0x14=1            PURE post pack
     byte 0x14=0 before PGD   PURE (PGD this = Manager+0x14)
     byte 0xfa0               PURE LOW-BYTE PGD gate
     steam dword + 0x2a3a4    PURE (same CF as v33 pgd_save_uses_cloud)
     GetPlayer / ExtraLives /
       SaveState / 0x8f8cd0 /
       0x9cad40 / fopen /
       GameState::write / IAT /
       virtuals / 0x9292c0 /
       0x928ee0 / 0x9294f0 /
       logger                 HOST

   Honest counter: the root plan still emits evHost(0x00958ed0). The
   body is NARROWED, not removed. */
enum {
  ISAAC_EXIT_958ED0_VA = 0x00958ed0u,
  ISAAC_EXIT_958ED0_BODY_BYTES = 600,         /* 0x258; terminal ret 0x959127 */
  ISAAC_EXIT_958ED0_STATE8_OFF = 8,           /* cmp dword [esi+8], 2 */
  ISAAC_EXIT_958ED0_STATE8_VALUE = 2,
  ISAAC_EXIT_958ED0_GAME_COUNT_OFF = 0x26630, /* UNSIGNED ja skip */
  ISAAC_EXIT_958ED0_VEC_BEGIN_OFF = 0x4b3d8,
  ISAAC_EXIT_958ED0_VEC_END_OFF = 0x4b3dc,
  ISAAC_EXIT_958ED0_PLAYER_FLAG_OFF = 0x173,  /* LOW-BYTE */
  ISAAC_EXIT_958ED0_LIVES_MIN = 1,            /* SIGNED cmp eax, 1 */
  ISAAC_EXIT_958ED0_FLAG_20DCC_OFF = 0x20dcc,
  ISAAC_EXIT_958ED0_FLAG_20DCC_VALUE = 1,
  ISAAC_EXIT_958ED0_COPY_SRC_OFF = 0x4b134,
  ISAAC_EXIT_958ED0_COPY_DST_OFF = 0x1ad14,
  ISAAC_EXIT_958ED0_AL_OFF = 0x1ad18,
  ISAAC_EXIT_958ED0_POST_SRC_OFF = 0x20d48,
  ISAAC_EXIT_958ED0_POST_DST_OFF = 0xf98,
  ISAAC_EXIT_958ED0_CHANGES_OFF = 0x14,       /* PGD this; byte 1 then 0 */
  ISAAC_EXIT_958ED0_PGD_FLAG_OFF = 0xfa0,     /* LOW-BYTE */
  ISAAC_EXIT_958ED0_CLOUD_OFF = 0x2a3a4,
  ISAAC_EXIT_958ED0_FILENAME_SIZE_OFF = 0x1fdbc, /* GameState string size (cmp dword, 0) */
  ISAAC_EXIT_958ED0_IO_PTR_OFF = 0x1fe24,        /* GameState existing GameStateIO* */
  ISAAC_EXIT_958ED0_GAMESTATE_OFF = 0xfa4,
  ISAAC_EXIT_958ED0_MGR_GLOBAL_DAT = 0x00c7169cu,
  ISAAC_EXIT_958ED0_GAME_GLOBAL_DAT = 0x00c71678u,
  ISAAC_EXIT_958ED0_STEAM_CTX_ARG = 0x00c5c3a4u,
  ISAAC_EXIT_958ED0_STEAM_IAT = 0x00b18a1cu,  /* SteamInternal_ContextInit */
  ISAAC_EXIT_958ED0_FILENO_IAT = 0x00b18920u, /* api-ms-win-crt-stdio!_fileno */
  ISAAC_EXIT_958ED0_GETPLAYER_VA = 0x00417870u,
  ISAAC_EXIT_958ED0_EXTRALIVES_VA = 0x007bf670u,
  ISAAC_EXIT_958ED0_SAVESTATE_VA = 0x006f9000u,
  ISAAC_EXIT_958ED0_OPEN_VA = 0x00a25090u,
  ISAAC_EXIT_958ED0_WRITE_VA = 0x009c9340u,
  ISAAC_EXIT_958ED0_PGD_VA = 0x009292c0u,     /* SKIP reopen */
  ISAAC_EXIT_958ED0_CLOUD_WRITE_VA = 0x009cad40u
};

typedef struct IsaacExit958ed0Plan {
  int32_t entry_open;           /* [Manager+8] == 2 FULL-dword */
  int32_t prefix_open;          /* entry && count==0 && vec empty */
  int32_t pack_needed;          /* prefix && challenge_ok (20dcc=1) */
  int32_t host_cloud_needed;    /* pack && steam_cloud -> 0x9cad40 */
  int32_t host_local_needed;    /* pack && !steam_cloud -> fopen/write */
  int32_t host_pgd_needed;      /* pack && LOW-BYTE fa0 -> 0x9292c0 */
  uint32_t flag_20dcc_addr;     /* manager + 0x20dcc, 32-bit wrap */
  uint32_t this_addr;           /* RAW manager, unmasked */
} IsaacExit958ed0Plan;

/* PE 0x00958edf: cmp dword ptr [esi+8], 2 ; je -- FULL-dword equality.
   0 / 1 / 3 / 0x100 / 0x102 / 0xffffffff CLOSED; only 2 OPEN.
   A low-byte test would open 0x102. */
int32_t isaac_exit_958ed0_entry_open(uint32_t state8);

/* PE 0x00958f01: cmp dword [game+0x26630], 0 ; ja epilogue -- UNSIGNED.
   0 OPEN; 1 / 0x80000000 / 0xffffffff CLOSED. A signed jle would open
   0x80000000. */
int32_t isaac_exit_958ed0_count_ok(uint32_t count26630);

/* PE 0x00958f14: cmp begin, end ; jne epilogue -- FULL-dword. */
int32_t isaac_exit_958ed0_vec_empty(uint32_t vec_begin, uint32_t vec_end);

/* entry && count_ok && vec_empty -- GetPlayer sits on this arm. */
int32_t isaac_exit_958ed0_prefix_open(uint32_t state8, uint32_t count26630,
                                      uint32_t vec_begin, uint32_t vec_end);

/* PE 0x00958f27: cmp byte [player+0x173], 0 ; je pack -- LOW-BYTE.
   0x100 CLOSED (skip GetExtraLives). 0x101 OPEN. */
int32_t isaac_exit_958ed0_challenge_needed(uint32_t byte173_in);

/* byte173==0 -> ok (pack). Else SIGNED extra_lives >= 1.
   0xffffffff / 0x80000000 CLOSED; 1 OPEN. */
int32_t isaac_exit_958ed0_challenge_ok(uint32_t byte173_in,
                                       uint32_t extra_lives);

/* prefix_open && challenge_ok -- SaveState / fopen / write sit here. */
int32_t isaac_exit_958ed0_host_needed(uint32_t state8, uint32_t count26630,
                                      uint32_t vec_begin, uint32_t vec_end,
                                      uint32_t byte173_in,
                                      uint32_t extra_lives);

/* PE 0x009590c5: cmp byte [esi+0xfa0], 0 ; je tail -- LOW-BYTE.
   0x100 CLOSED. Only meaningful when pack_needed. */
int32_t isaac_exit_958ed0_pgd_needed(uint32_t fa0_in);

/* ABI v46. PE 0x00958fab: cmp dword [gs+0x1fdbc], 0 ; jne fopen --
   FULL-dword. The GameState filename SIZE (MSVC basic_string size at
   SSO obj+0x10) selects the no-filename log (0xa112c0) vs the fopen/
   write path (0xa25090 + virtuals). 0x100 is PRESENT (a byte-narrowed
   read would say empty and flip the log/fopen branch). */
int32_t isaac_exit_958ed0_local_filename_present(uint32_t size_1fdbc);

/* ABI v46. PE 0x00958fd5: test ecx, ecx ; je -- the existing
   GameStateIO* at [gs+0x1fe24] drives the virtual dtor host call.
   0x100 IS a valid pointer (FULL-dword presence). */
int32_t isaac_exit_958ed0_io_dtor_needed(uint32_t io_ptr_1fe24);

uint32_t isaac_exit_958ed0_va(void);
uint32_t isaac_exit_958ed0_body_bytes(void);
uint32_t isaac_exit_958ed0_flag_20dcc_off(void);
uint32_t isaac_exit_958ed0_steam_iat(void);
uint32_t isaac_exit_958ed0_fileno_iat(void);

/* PE 0x00958f5a: manager+0x20dcc, 32-bit wrap. */
uint32_t isaac_exit_958ed0_flag_20dcc_addr(uint32_t manager);

/* PE 0x009590ce: lea ecx,[esi+0x14] -- PGD 0x9292c0 this. */
uint32_t isaac_exit_958ed0_pgd_this_addr(uint32_t manager);

/* PE 0x00958f5a: byte [manager+0x20dcc] <- 1. Returns manager. */
uint32_t isaac_exit_958ed0_prefix_apply(uint32_t manager);

/* PE 0x00958f72: [manager+0x1ad14] <- [manager+0x4b134] recapture.
   Returns dest addr. */
uint32_t isaac_exit_958ed0_copy_1ad14_apply(uint32_t manager);

/* PE 0x00958f82: byte [manager+0x1ad18] <- AL. uint32_t re-narrowed. */
uint32_t isaac_exit_958ed0_store_1ad18_apply(uint32_t manager, uint32_t al_in);

/* PE 0x009590bb / 0x009590c1: [0xf98] <- [0x20d48], byte [0x14] <- 1. */
uint32_t isaac_exit_958ed0_post_apply(uint32_t manager);

/* PE 0x009590d1: byte [0x14] <- 0 before host 0x9292c0. Returns PGD this. */
uint32_t isaac_exit_958ed0_pgd_clear_apply(uint32_t manager);

/* PE 0x00959104 / 0x0095911a: byte [0x20dcc] <- 0. Returns manager. */
uint32_t isaac_exit_958ed0_tail_apply(uint32_t manager);

void isaac_exit_958ed0_plan(IsaacExit958ed0Plan* out, uint32_t state8,
                            uint32_t count26630, uint32_t vec_begin,
                            uint32_t vec_end, uint32_t byte173_in,
                            uint32_t extra_lives, uint32_t steam_ctx_word,
                            uint32_t cloud_2a3a4_in, uint32_t fa0_in,
                            uint32_t manager);

/* --- ABI v40: GameState delete 0x00959130 (75 B) ---
   Body: 75 bytes, terminal ret @ 0x0095917b, int3 pad 0x0095917c-0x0095917f
   then the next function @ 0x00959180. dump-pe-span --bytes 0x80: 30
   insns, 0 resyncs, 1 E8, 0 indirect, 3 mem stores. Manager/Game from
   DAT_00c7169c / DAT_00c71678. Exit site 0x006fa224 (ShouldSave low byte
   == 0); also 0x6f97ad / 0x704fb3 / 0x7896e1 / 0x9b65b7.

   Sibling of the v39 write 0x00958ed0. The shared prefix (UNSIGNED
   [Game+0x26630]==0 + FULL-dword vec begin==end) is NOT folded: distinct
   CF (one host GameState::Delete vs the write's challenge/SaveState/
   cloud/fopen chain), distinct stores, no Steam/_fileno IAT.

   PE (entry + host + stores):
     0x00959140 cmp dword [game+0x26630], 0 ; ja ret      UNSIGNED
     0x00959149 cmp [esi+0x4b3d8], [esi+0x4b3dc] ; jne ret FULL-dword
     0x00959157 lea ecx,[esi+0xfa4]                       GameState*
     0x0095915d call GameState::Delete @ 0x9c8350         HOST
     0x00959162 mov dword [esi+0xf98], 0                  store 1
     0x0095916c mov byte [esi+0x14], 1                    store 2
     0x00959170 mov byte [esi+0x4b284], 0                 store 3

   Classification:
     [Game+0x26630]==0     PURE UNSIGNED (0x80000000 CLOSED)
     vec begin==end        PURE FULL-dword (0x100==0x100 OPEN)
     lea ecx,[esi+0xfa4]   PURE wrap pointer math
     GameState::Delete     HOST (exact ZHL __thiscall void
                           GameState::Delete(); this = Manager+0xfa4)
     dword f98=0 / byte
       14=1 / byte 4b284=0 PURE stores, PE order, all immediate

   Honest counter: the root plan still emits evHost(0x00959130). The
   body is NARROWED, not removed — a driver applies the three pure
   stores around the single host call. */
enum {
  ISAAC_EXIT_959130_VA = 0x00959130u,
  ISAAC_EXIT_959130_BODY_BYTES = 75,          /* 0x4b; terminal ret 0x95917b */
  ISAAC_EXIT_959130_GAME_COUNT_OFF = 0x26630, /* UNSIGNED ja skip */
  ISAAC_EXIT_959130_VEC_BEGIN_OFF = 0x4b3d8,
  ISAAC_EXIT_959130_VEC_END_OFF = 0x4b3dc,
  ISAAC_EXIT_959130_GAMESTATE_OFF = 0xfa4,    /* lea ecx,[esi+0xfa4] */
  ISAAC_EXIT_959130_F98_OFF = 0xf98,          /* dword <- 0 */
  ISAAC_EXIT_959130_CHANGES_OFF = 0x14,       /* byte <- 1 */
  ISAAC_EXIT_959130_FLAG_4B284_OFF = 0x4b284, /* byte <- 0 */
  ISAAC_EXIT_959130_GAME_GLOBAL_DAT = 0x00c71678u,
  ISAAC_EXIT_959130_MGR_GLOBAL_DAT = 0x00c7169cu,
  ISAAC_EXIT_959130_DELETE_VA = 0x009c8350u   /* exact ZHL GameState::Delete */
};

typedef struct IsaacExit959130Plan {
  int32_t entry_open;        /* [Game+0x26630] == 0 UNSIGNED */
  int32_t vec_empty;         /* FULL-dword begin == end */
  int32_t host_needed;       /* entry && vec_empty -> 0x9c8350 */
  uint32_t gamestate_addr;   /* manager + 0xfa4, 32-bit wrap */
  uint32_t this_addr;        /* RAW manager, unmasked */
} IsaacExit959130Plan;

/* --- ABI v41: per-slot decision laws inside residual host 0x009a27d0 ---
   this = Game+0x1da04. Slot i in [0, 11): base = this + 0x3cdc + i*0x1f4
   (host 0x00840f70), flag byte = base+8 (0x3ce4+i*0x1f4), host 0x00709150
   = base+0x18 (0x3cf4+i*0x1f4), ANM2::Reset = base+0x20 (0x3cfc+i*0x1f4).
   The push ecx before 0x00709150 carries the ANM2::Reset receiver of the
   same slot (lea ecx,[esi+8] survives into the push; callee ignores it but
   the value is deterministic). Slots 1..6 run in the 6-iteration loop
   (esi from this+0x3ee8), slots 7..10 in the 4-iteration loop (esi from
   this+0x4aa0); slot 0 is the direct block. All index laws take the FULL
   uint32_t (WIDE 0x100/0xffffffff -> 0xffffffff OOB). */
typedef struct IsaacExit9a27d0SlotPlan {
  int32_t valid;              /* index < 11 */
  uint32_t base_off;          /* 0x3cdc + i*0x1f4  (0x00840f70 receiver) */
  uint32_t flag_off;          /* 0x3ce4 + i*0x1f4  (base + 8) */
  uint32_t reset_off;         /* 0x3cfc + i*0x1f4  (ANM2::Reset receiver) */
  uint32_t receiver_709150_off; /* 0x3cf4 + i*0x1f4 (0x00709150 receiver) */
  uint32_t arg_709150;        /* 0x3cfc + i*0x1f4  (pushed ecx = reset recv) */
  int32_t loop_segment;       /* 0 direct (i==0), 1 (i in 1..6), 2 (i in 7..10) */
} IsaacExit9a27d0SlotPlan;

/* Slot triple base (0x00840f70 receiver) offset; 0xffffffff when index >= 11. */
uint32_t isaac_exit_9a27d0_slot_triple_base_off(uint32_t index);

/* ANM2::Reset receiver offset (typed-host; only the offset law is pure). */
uint32_t isaac_exit_9a27d0_slot_reset_off(uint32_t index);

/* 0x00709150 receiver offset. */
uint32_t isaac_exit_9a27d0_slot_709150_off(uint32_t index);

/* The value pushed before 0x00709150 (== the slot's ANM2::Reset receiver). */
uint32_t isaac_exit_9a27d0_slot_709150_arg(uint32_t index);

/* Loop segment of slot i: 0 (direct), 1 (6-loop), 2 (4-loop), or
   0xffffffff when index >= 11. */
int32_t isaac_exit_9a27d0_slot_loop_segment(uint32_t index);

uint32_t isaac_exit_9a27d0_slot_loop1_count(void);
uint32_t isaac_exit_9a27d0_slot_loop2_count(void);
uint32_t isaac_exit_9a27d0_slot_loop1_start_off(void);
uint32_t isaac_exit_9a27d0_slot_loop2_start_off(void);

/* Packed per-slot decision law (valid=0 when index >= 11). */
void isaac_exit_9a27d0_slot_plan(IsaacExit9a27d0SlotPlan* out,
                                 uint32_t index);

/* --- ABI v42: ordered host-event decision laws inside residual 0x008d3250
   (this = Game+0x23a74+0x838 = Game+0x242ac). v5 landed the pure islands
   (P0-P4, cursor gate +0x40d, list gate +0x1e8, post-host list_empty);
   these laws pin the DECISION surface of the 5 ordered typed-host events:

     H1 0x0040c7f0(0) this=this+0x3c  (always; @0x8d327a)
     H2 0x0040c7f0(0) this=this+0x50  (always; @0x8d3299)
     H3 ANM2::Reset    this=this+0x64  (always; @0x8d32b6)
     H4 ANM2::GetLayer("Cursor")  this=this+0x304 (@0x8d32fb, push
        0xb75734 @0x8d32f6); post-store byte [layer+0x74] <- 0
        (@0x8d3306) when byte this+0x40d != 0 (@0x8d32bb cmp/je)
     H5 0x00415800 list destroy (@0x8d3341) when this+0x1e8 != 0
        (@0x8d332b): sentinel = [obj+0x120], header = obj+0x120,
        this=header, stack args [sentinel+4] then header (ret 8);
        post-host pure list_empty already v5 (circular sentinel +
        count 0). */

/* "Cursor" literal VA pushed before host ANM2::GetLayer. */
uint32_t isaac_exit_8d3250_cursor_va(void);

/* H4 ANM2::GetLayer receiver offset (this+0x304). */
uint32_t isaac_exit_8d3250_getlayer_receiver_off(void);

/* Byte offset on the GetLayer RETURN value cleared after H4 (0x74).
   The address is the host return (host-owned); only the offset is pure. */
uint32_t isaac_exit_8d3250_layer_clear_off(void);

/* H3 exact ANM2::Reset receiver offset (this+0x64). */
uint32_t isaac_exit_8d3250_reset_receiver_off(void);

/* H5 sentinel offset within the list object (0x120; mov esi,[edi+0x120]). */
uint32_t isaac_exit_8d3250_list_sentinel_off(void);

/* H5 header offset within the list object (0x120; add edi,0x120). Also the
   H5 this and the pushed arg2 (see list_destroy_arg2). */
uint32_t isaac_exit_8d3250_list_header_off(void);

/* H5 first stack arg source address: sentinel+4 (u32 wrap). The pushed
   value is the dword at [sentinel+4] (PE push dword [esi+4]). */
uint32_t isaac_exit_8d3250_list_destroy_arg1_ptr(uint32_t sentinel);

/* H5 second stack arg value (== header == H5 this): obj+0x120 (u32 wrap;
   PE push edi where edi = obj+0x120). */
uint32_t isaac_exit_8d3250_list_destroy_arg2(uint32_t obj);

/* Packed ordered host plan: cursor/layer/reset/list constants plus the two
   gates re-derived here from their raw fields (byte +0x40d re-narrowed
   with & 0xff; ptr +0x1e8 full-dword). */
typedef struct IsaacExit8d3250HostPlan {
  uint32_t cursor_va;             /* 0xb75734 */
  uint32_t getlayer_receiver_off; /* 0x304 */
  uint32_t layer_clear_off;       /* 0x74 */
  uint32_t reset_receiver_off;    /* 0x64 */
  uint32_t list_obj_off;          /* 0x1e8 */
  uint32_t list_sentinel_off;     /* 0x120 */
  uint32_t list_header_off;       /* 0x120 */
  int32_t cursor_gate;            /* byte +0x40d != 0 (H4 runs) */
  int32_t list_gate;              /* +0x1e8 != 0 (H5 runs) */
} IsaacExit8d3250HostPlan;

void isaac_exit_8d3250_host_plan(IsaacExit8d3250HostPlan* out,
                                 uint32_t field_40d, uint32_t ptr_1e8);

/* PE 0x00959140: cmp dword [game+0x26630], 0 ; ja skip -- UNSIGNED.
   0 OPEN; 1 / 0x80000000 / 0xffffffff CLOSED. A signed jle would open
   0x80000000. */
int32_t isaac_exit_959130_entry_open(uint32_t count26630);

/* PE 0x0095914f: cmp eax, [esi+0x4b3dc] ; jne skip -- FULL-dword.
   0x100==0x100 IS empty. */
int32_t isaac_exit_959130_vec_empty(uint32_t vec_begin, uint32_t vec_end);

/* entry && vec_empty -- GameState::Delete sits on this arm. */
int32_t isaac_exit_959130_prefix_open(uint32_t count26630, uint32_t vec_begin,
                                      uint32_t vec_end);

/* prefix_open -- the single host call 0x009c8350 sits here. */
int32_t isaac_exit_959130_host_needed(uint32_t count26630, uint32_t vec_begin,
                                      uint32_t vec_end);

uint32_t isaac_exit_959130_va(void);
uint32_t isaac_exit_959130_body_bytes(void);
uint32_t isaac_exit_959130_delete_va(void);

/* PE 0x00959157: lea ecx,[esi+0xfa4] -- GameState* this (32-bit wrap). */
uint32_t isaac_exit_959130_gamestate_addr(uint32_t manager);

/* PE 0x00959162 / 0x0095916c / 0x00959170: dword [0xf98] <- 0, byte [0x14]
   <- 1, byte [0x4b284] <- 0, in that order. Returns manager. */
uint32_t isaac_exit_959130_delete_apply(uint32_t manager);

void isaac_exit_959130_plan(IsaacExit959130Plan* out, uint32_t count26630,
                            uint32_t vec_begin, uint32_t vec_end,
                            uint32_t manager);

/* ---- ABI v48: frozen alloc string-tidy contract, Exit-root consumption ---
   The tidy template itself is OWNED by the alloc family (v3 AL); these are
   thin Exit-boundary delegates over the SAME frozen laws, not a
   re-derivation. The gate input on the root's dtor loop is the MSVC-string
   capacity dword at elem+0x1c (this = elem+8, cap at +0x14). uint32_t
   throughout — never a narrowed scalar parameter. */

/* Frozen AL gate (PE cmp ecx,0x10 ; jb): UNSIGNED full-dword compare —
   cap >= 0x10 frees; SSO (cap < 0x10) skips the allocator. 0xf CLOSED,
   0x10 OPEN, 0x100 OPEN, 0xffffffff OPEN. A byte-truncated parameter is
   the documented silent-wrongness trap: 0x10f releases in the PE yet
   narrows to 0x0f. */
int32_t isaac_exit_tidy_release_needed(uint32_t cap);

/* inc ecx: cap + 1 with FULL u32 wrap (0xffffffff -> 0); the frozen law
   pins that 0xaef15c forwards and drops this value. */
uint32_t isaac_exit_tidy_size_arg(uint32_t cap);

uint32_t isaac_exit_tidy_va(void);

/* The Exit root's single reach site of the template (vector dtor loop). */
uint32_t isaac_exit_tidy_root_site_va(void);

/* elem + 0x1c = elem + 8 (tidy this) + 0x14 (MSVC-string cap dword). */
uint32_t isaac_exit_tidy_root_elem_cap_off(void);

uint32_t isaac_exit_pure_helpers_abi_version(void);
#ifdef __cplusplus
}
#endif
