#include "exit_pure_helpers.h"

/* Game::Exit pure helpers (VA 0x006fa0c0). Evidence:
   output/decomp/5129df723e64/decompiled/006fa0c0_Game_Exit.c (truncated)
   PE of Exit through ret 4 @ 0x006fa534 + nested 0x006f43b0 / 0x006f4520
   PE of residual 0x009b5cb0 @ Game+0x23a74 through ret @ 0x009b5d1a
   PE of nested residual 0x008d3250 @ Game+0x23a74+0x838 through ret @ 0x008d3358
   PE of residual 0x009b9150 @ Game+0x1baa8 through ret @ 0x009b92b7
   PE of residual 0x009a27d0 @ Game+0x1da04 through tail-jmp @ 0x009a2985
   PE of residual 0x009a19a0 @ Game+0x1da04 through tail-jmp @ 0x009a1a25
   PE of residual 0x0040e910 (global tree DAT_00c78ee8) through ret @ 0x0040e9fb
   PE of pure tree iterator++ 0x00414a80 through ret @ 0x00414ad2
   PE of Exit map walk Game+0x1a738 @ 0x006fa457 + find 0x0069d690
   PE of pure string compare 0x00423480; pure-complete lower_bound 0x00685bc0
   PE of pure-complete find 0x0069d690 (v11; post-lower_bound islands v10)
   PE of residual 0x0040c7f0 through ret 4 @ 0x0040c889 + nested ctor
   0x0040cc10 pure field pack (v12)
   PE of residual 0x00408830 through ret 4 @ 0x0040895e (v13)
   PE of residual 0x009b4810 through ret @ 0x009b5015 (v14)
   PE of residual vector grow 0x00428590 through ret 8 @ 0x0042869b (v15)
   PE of exact ANM2::GetLayer(int) 0x0040b220 through ret 4 (v16)
   PE of exact ANM2::Load 0x0040bd50 through ret 8 (v16)
   PE of nested alloc 0x0040cf00 through rets (v16 pure size CF)
   PE of exact ANM2::ReplaceSpritesheet 0x0040bf30 through ret 8 (v17)
   PE of Play-by-name residual 0x0040a5d0 through ret 8 (v17 pure CF)
   PE of exact AnimationState::Rewind 0x0040a1b0 through ret (v18)
   PE of nested 0x00408c90 through ret (v18 pure event-mask body)
   PE of residual string assign 0x0040ccd0 through ret 8 (v19 pure CF)
   PE of residual keep-set 0x00408970 through ret 4 @ 0x00408b81 (v20 pure CF)
   PE of residual Load nested 0x0040db90 through ret 8 @ 0x0040e0ff (v21 pure CF)
   PE of residual Load sibling 0x0040e110 through ret 4 @ 0x0040e2a3 (v22 pure CF)
   PE of residual ANM2 graphics walk 0x0040c000 through ret 4 @ 0x0040c1d6
   (v23 pure CF) + pure-complete freestanding 0x0040c1e0
   PE of residual layer-attach 0x00408640 through ret 8 @ 0x004086d0
   (v24 pure CF: field copy + pair slot + COM gates)
   PE of per-slot HUD residual 0x00841cf0 through ret @ 0x00841e12 (v25)
   PE of residual 0x0083abb0 through ret @ 0x0083ac13 (v25)
   PE of range COM destroy hosts 0x00709380 / 0x00709300 (v25 pure CF)
   PE of pure-complete tail-jmp 0x0084bfd0 through ret @ 0x0084c169 (v25)
   PE of buffer-free residual 0x00840f70 through ret @ 0x00840feb (v26)
   PE of pair-replace residual 0x00709150 through ret 4 @ 0x007091ea (v26)
   PE import directory: IAT 0x00b187dc = api-ms-win-crt-heap-l1-1-0!free
   PE of teardown residual 0x00a1ad90 through ret @ 0x00a1ae5e (v27)
   PE of host 0x00a648b0 (mode from CL low byte; mode 1 frees EDX) (v27)
   output/decomp/5129df723e64/section-notes/cpu-dump/00a648b0.txt (v43 EOF
   re-decode: 32 insns, 0 resyncs, first ret 0x00a648ee; mode 2 stats-add
   uses edi DIRECTLY — no fallback base)
   PE of 0x0042c8e0 confirming MSVC tree nodes (_Isnil byte at +0xd) (v27)
   PE of pair ctor 0x0040c4a0 through ret 4 @ 0x0040c548 (v28)
   PE of assignment sibling 0x0040c7f0 through ret 4 @ 0x0040c889 (v28 diff)
   PE of recursive tree _Erase 0x00415800 through ret 8 @ 0x0041589c (v28)
   output/decomp/5129df723e64/section-notes/agent6-exit/NOTES.md
   output/decomp/5129df723e64/section-notes/exit-render-advance/NOTES.md
   output/decomp/5129df723e64/section-notes/exit-residual-2/NOTES.md
   output/decomp/5129df723e64/section-notes/exit-9b5cb0/NOTES.md
   output/decomp/5129df723e64/section-notes/exit-8d3250/NOTES.md
   output/decomp/5129df723e64/section-notes/exit-9b9150/NOTES.md
   output/decomp/5129df723e64/section-notes/exit-9a27d0/NOTES.md
   output/decomp/5129df723e64/section-notes/exit-9a19a0/NOTES.md
   output/decomp/5129df723e64/section-notes/exit-40e910/NOTES.md
   output/decomp/5129df723e64/section-notes/exit-69d690/NOTES.md
   output/decomp/5129df723e64/section-notes/exit-685bc0/NOTES.md
   output/decomp/5129df723e64/section-notes/exit-40c7f0/NOTES.md
   output/decomp/5129df723e64/section-notes/exit-408830/NOTES.md
   output/decomp/5129df723e64/section-notes/exit-9b4810/NOTES.md
   output/decomp/5129df723e64/section-notes/exit-v15/NOTES.md
   output/decomp/5129df723e64/section-notes/exit-v16/NOTES.md
   output/decomp/5129df723e64/section-notes/exit-v17/NOTES.md
   output/decomp/5129df723e64/section-notes/exit-v18/NOTES.md
   output/decomp/5129df723e64/section-notes/exit-v19/NOTES.md
   output/decomp/5129df723e64/section-notes/exit-v20/NOTES.md
   output/decomp/5129df723e64/section-notes/exit-v21/NOTES.md
   output/decomp/5129df723e64/section-notes/exit-v22/NOTES.md
   output/decomp/5129df723e64/section-notes/exit-v23/NOTES.md
   output/decomp/5129df723e64/section-notes/exit-v24/NOTES.md
   output/decomp/5129df723e64/section-notes/exit-v25/NOTES.md
   output/decomp/5129df723e64/section-notes/exit-v26/NOTES.md
   output/decomp/5129df723e64/section-notes/exit-v27/NOTES.md
   output/decomp/5129df723e64/section-notes/exit-v28/NOTES.md
   PE of GameState delete 0x00959130 through ret @ 0x0095917b (v40)

   PE order (pure stores + host residual markers):
     if (Game+0x2658a == 0) return;
     host 0x008650a0(ShouldSave);
     host 0x0092e300; host 0x0092e230(id)×5  [ids pure table]
     if (ItemOverlay state==2) host ItemOverlay::Update(1);
     Manager+0x2a2d0/2a2d4 = 1.0f; host 0x007df690;
     if (changesmade && fileLoaded) { changesmade=0; host PGD save cluster }
     if (Game+0x2658b==0) host write/delete continue;
     --- early teardown ---
     T0: Game+0x2510c=0; +0x2593c=0;
     host 0x008d26c0(0,0) thiscall Game+0x25108;
     T1: +0x25948=0; +0x2590c=0; +0x1d520=0;
     host ANM2::Reset thiscall Game+0x1d528 (exact ZHL @ 0x00407f10);
     T2: +0x1d654=0;
     vector dtor loop host 0x0040d040 on elem+8; end=begin;
     T4: +0x25954=0;
     host 0x006f43b0 (Game thiscall) — see nested pure islands;
     host log 0x00a112c0(... ReadOnly False);
     Manager+0x15 = 0;                // PGD.readonly clear (pure)
     post-log pure Game field pack;   // decompiler-missed
     host ANM2::Reset Game+0x1c03c; host ANM2::Reset Game+0x1d1d8;
     Game+0x1c034=0; +0x1c038=0;      // item overlay state clear
     --- residual after overlay clear (ABI v3) ---
     host 0x00421260 this=Game+0x1d2ec:
       ANM2::Reset(this+8); pure mode pair 0; Manager volume path
       (exact SoundEffects::ClearVolumeModifier @ 0x0092e430 when needed);
       pure Manager+0x2a338 set;
     pure nest Game+0x18990: outer 0x25 × mid 2, copy entity+0x30→+0x34;
     host 0x00686950 this=Game+0x68d78;
     host 0x007384d0 this=Game (Room recreate / free @ +0x18300);
     --- residual 0x009b9150 this=Game+0x1baa8 (ABI v6 pure islands) ---
     P0: +0xc8/+0xcc=0;
     if player_list host needed ((end-begin)&~3): host Room unlink×5 +
       byte entity+0x170=0 + host 0x0041b570 + vtable delete + memmove;
     pure player_list end←begin;
     if extra_list count!=0: host vtable delete per non-null elem;
     pure extra_list end←begin;
     for esau[4] @ +0x80: if non-null host vtable delete then pure slot=0;
     mid pure: +0x7c=0; byte +0x5c=1; host log 0x00a112c0;
     tail: four× (host log; +0x60+i*4 ← -1);
     --- residual 0x009a27d0 this=Game+0x1da04 (ABI v7 pure islands) ---
     host a1ad90 ×2; ANM2::Reset ×N; 40c7f0(0)×5; more ANM2::Reset;
     slot triple ×11 (stride 0x1f4 from +0x3cdc): host 840f70 / Reset /
       709150 then pure byte flag at +0x3ce4+i*0x1f4 ← 0;
     host 841cf0 ×8 stride 0x6dc from this; host 709150 +0x536c;
     host 40c7f0(0) +0x592c; pure byte +0x54cd ← 0;
     host 83abb0 +0x5c54; tail-jmp 84bfd0 this=+0x59a4;
     --- residual 0x009a19a0 this=Game+0x1da04 (ABI v8 pure islands) ---
     P0: +0x5490=-1.0f; +0x5494/+0x5498=-1; byte +0x549c=0;
         +0x54d0=2; +0x54d8=2; byte +0x54d4=0;
     for i in 0..7: pure slot+4←this_addr, word slot+8←i;
                    host 0x00841cf0 this=this+i*0x6dc;
     host 0x0083abb0 this=+0x5c54; pure byte +0x54cc←1;
     tail-jmp 0x0084bfd0 this=+0x59a4;
     --- per-slot residual 0x00841cf0 (ABI v25 pure islands / CF) ---
     P0: 0x18 elements from +0x10 stride 0x10; per element in PE order
         dword +0←0, dword +8←0xb1a4ec, dword +0xc←0xb1a4ec, byte +4←0;
     head: dword +0xa←0 (unaligned) then byte +0xe←0;
     P1: 2 elements from +0x200 stride 0x18; pure dwords +0/+4←0 then
         host 0x0040c7f0(0) this=elem+8;
     P2: 4 elements from +0x190 stride 0x1c; pure dwords +0/+4/+0x18←0;
         if dword[elem+8]!=0 host 0x0040c7f0(0) this=elem+8;
         if dword[elem+0x10]!=0 host 0x0040c7f0(0) this=elem+0x10;
     vector +0x6a0/+0x6a4 stride 0xc: while cur != end (end re-read)
         host 0x0040c7f0(0) this=elem+4; then host 0x00709380(begin,end);
         pure [+0x6a4] ← [+0x6a0] recaptured after the host;
         pure word +0x6ac←0; host 0x0040c7f0(0) on +0x6b0 and +0x6cc;
         pure dword [this]←0;
     --- residual 0x0083abb0 this=9a19a0+0x5c54 (ABI v25) ---
     for block b in 0..1 (base = b*0x14):
       walk [begin=+8, end=+0xc) stride 0x28: host 0x0040c7f0(0)
         this=elem+4, end re-read each step;
       host 0x00709300(begin,end);
       pure [base+0xc] ← [base+8] recaptured; byte base+4←0;
       dword base+0←0;
     terminal byte +0x28←0;
     --- range COM destroy 0x00709380 / 0x00709300 (ABI v25 pure CF) ---
     for p in [begin,end) stride 0xc / 0x28:
       ctrl = [p+8]; if ctrl: host virtual[3](ctrl);
         if AL && DAT_00c7163c: host callback(p+4);
     SEH frame, virtual dispatch and callback stay host;
     --- pure-complete tail-jmp 0x0084bfd0 this=9a19a0+0x59a4 ---
     for block b in 0..1 (base = 0x114 + b*0xcc):
       51 dwords; element = 5 dwords; slots 0..3 of each element ← 0;
       slot 4 untouched for elements 0..5 and ← 0.1f for elements 6..9;
       trailing dword (index 50) ← 0;
     terminal byte +0x2ac←0; no calls, no loads — fully translated;
     --- buffer-free residual 0x00840f70 (ABI v26 pure islands / CF) ---
     for i in 0..1:
       p = [this + i*4];
       if p == 0: continue;
       stats = DAT_00c7de78 ? DAT_00c7de78+0x30 : DAT_00c7f618;
       size  = [p-4];
       [stats] -= size; [stats+4] -= borrow;      (pure 64-bit sub)
       host IAT free(p-4) via 0x00b187dc;
       [this + i*4] = 0;                          (pure)
     --- pair-replace residual 0x00709150 (ABI v26; unused stack arg) ---
     n = host alloc 0x00a0f4c0(0x18);             (allocator out of scope)
     if n != 0: host ctor 0x0040cc10(n) (v12 pure pack);
                pure [n] = 0x00b67f98; [n+0x14] = 0;
     else:      n = 0;
     old = [this+4];
     if old != 0: host virtual[3](old);
                  if AL && DAT_00c71644: host callback(this);
     pure [this] = 0; [this+4] = n;
     --- teardown residual 0x00a1ad90 (ABI v27 pure islands / CF) ---
     A: p = [this+0x28];
        if p != 0: host 0x00a648b0(cl=1, EDX=p, 0, 0);   (pointer in EDX)
                   [this+0x28] = 0;                       (pure)
     B: a = [this+0x3c];
        if a != 0: n_pre = [a-4];
                   host 0x00aef638(a, 8, n_pre, 0x0040c440);
                   n_post = [a-4];                         (RE-READ)
                   host 0x00aef15c(a-4, n_post*8 + 4);
                   [this+0x3c] = 0;                        (pure)
     C: head = [this+0x40];                                (pre-call)
        host 0x0042c8e0(this=this+0x40, this+0x40, [head+4]);
        [head+4] = head; [head] = head; [head+8] = head;   (pure)
        [this+0x44] = 0;                                   (pure)
     T: byte [this] = 0; [this+0x24] = 0; [this+0x38] = 0; (pure)
     --- pair ctor 0x0040c4a0 (ABI v28; sibling of 0x0040c7f0 v12) ---
     [this] = 0; [this+4] = 0;              (pure; 0x40c7f0 lacks this)
     n = host alloc 0x00a0f4c0(0x18);       (allocator out of scope)
     arg = [ebp+8];
     if n != 0: host ctor 0x0040cc10(n);
                pure [n] = 0x00b1a6e0; [n+0x14] = arg;
     else:      n = 0;
     old = [this+4];                        (RE-READ after the hosts)
     if old != 0: host virtual[3](old);
                  if AL && DAT_00c7163c: host callback(this);
     pure [this+4] = n; eax = this; [this] = arg;   (object slot first)
     --- recursive tree _Erase 0x00415800 (ABI v28) ---
     erase(node):
       while byte [node+0xd] == 0:          (BYTE test)
         erase([node+8]);                   (right subtree recurses)
         cur = node; node = [node];         (left child iterates)
         ctrl = [cur+0x18];
         if ctrl != 0: host virtual[3](ctrl);
                       if AL && DAT_00c7163c: host callback(cur+0x14);
         host free(cur, 0x1c);
     free order is reverse in-order (right, self, left) — enumerated pure;
     --- residual 0x0040e910 global tree DAT_00c78ee8 (ABI v9 pure CF,
         v41 decision laws) ---
     if first==sentinel: empty (no host);
     else loop node:
       obj = [node+0x18];
       if obj!=0: host COM vtable[obj+8]+0xc(-1) + vtable+0x10
                    (this=obj+8 [v41 com_iface_addr]; arg -1 [v41
                    com_release_arg]; vtable re-read before slot+0x10);
                  state = word(obj+4) [v41 com_state_word: 16-bit movzx];
                  if state>2: pure tree++ only; continue;
       free path: host 0x0040c7f0(0) this=node+0x14;
                  pure tree++ (0x00414a80); host erase 0x00415d20;
                  if [erased+0x18]!=0: host virtual; if AL && DAT_00c7163c:
                    host callback(erased+0x14);
                  host free(erased, 0x1c);
       until cur==[DAT_00c78ee8] re-read each iteration
       [v41 walk_continue];
     --- map walk Game+0x1a738 (ABI v10 pure CF; VA 0x006fa457) ---
     if first==sentinel: empty → 0x009b5cb0;
     else loop node:
       pure-complete find 0x0069d690 (v11) this=map, key=node+0x10 → found;
         pure-complete lower_bound 0x00685bc0 → triple.best;
         pure post-lower_bound: isnil → miss (out=sentinel);
         else SSO data-addr + pure strcmp 0x00423480;
         hit when cmp>=0 else miss;
       if found!=sentinel && flag@+0x28!=0:
         for elem in [+0x44,+0x48) step 0x20:
           host 0x0040c7f0(0) this=elem+0x18 (v12 pure CF + pure stores);
             host alloc 0x18; if ok host 40cc10 (pure field pack + host init);
             pure object finish vtable/arg; if old@+4: host virtual + callback;
             pure pair *this=arg, this+4=new;
         pure flag@+0x28←0;
       host 0x0040e910; pure tree successor; until first==sentinel;
     --- residual 0x009b5cb0 this=Game+0x23a74 (ABI v4 pure prefix) ---
     pure: [this]=0; [this+8]=2; [this+0x24]=0; [this+0x28]=0;
           byte [this+0x1454]=0;
     host 0x00408830(0) this=this+0x7c;   // v13 pure CF + terminal
     host 0x00408830(0) this=this+0x190;
     --- residual 0x009b4810 this=this+0x5b0 (ABI v14 pure islands) ---
     pure: vec end@+0x280 = begin@+0x27c;
     pure first value = (mode@+0==0||mode==3)?0:1; push via pure/grow;
     if mode!=3: push block A [2,3,4,6,7,8,0xf];
       if push_1c_needed(Manager/Game CF): push 0x1c;
     push block B [9,0xb,0xc];
     if mode!=3: push 0xd; push 0xe; if mode!=3: push [0x10,0x11,0x14];
     if mode!=1: push block F [0x15..0x1b];
     if mode in {1,2}: host ANM2 GetLayer("Sketch") xN + ReplaceSpritesheet;
     host string build + ANM2::Load GammaMenu.anm2 this=+0x138;
     Counter strcmp CF -> optional host Play + Rewind; pure play-flag;
     pure terminal pack +4/+8/+14..+20/+24c..+254;
     --- residual 0x008d3250 this=this+0x838 (ABI v5 pure islands) ---
     P0: byte +0x10=0; +0x14=0; +0x30/+0x34/+0x38=0;
     host 0x0040c7f0(0) this=this+0x3c;
     P1: +0x44/+0x48/+0x4c=0;
     host 0x0040c7f0(0) this=this+0x50;
     P2: +0x58/+0x5c/+0x60=0;
     host ANM2::Reset this=this+0x64 (exact ZHL 0x00407f10);
     P3: +0x178=-1; +0x17c/+0x180/+0x648/+0x64c=0;
     if (+0x40d!=0) host ANM2::GetLayer("Cursor") this=this+0x304
                    then byte [layer+0x74]=0;
     P4: copy +0x18→+0x1c; +0x24/+0x28/+0x2c=0;
     if (+0x1e8!=0) host 0x00415800 list destroy on obj+0x120
                    then pure list_empty (sentinel self-links + count 0);
     host GenericPrompt::Initialize(1) this=9b5cb0+0x47c (exact ZHL);
     Game+0x265c0=0; word +0x2658a=0; // terminal session clear
     ret 4;
*/

namespace {

inline float f32_bits(uint32_t bits) {
  return __builtin_bit_cast(float, bits);
}

}  // namespace

extern "C" int32_t isaac_exit_session_active(uint32_t session_flag_2658a_in) {
  const uint8_t session_flag_2658a = static_cast<uint8_t>(session_flag_2658a_in & 0xffu);
  return session_flag_2658a != 0 ? 1 : 0;
}

extern "C" int32_t isaac_exit_item_overlay_force_needed(
    int32_t item_overlay_state_1c034) {
  /* Decompiler: if (state != 0 && state == 2) — equivalent to state == 2. */
  return item_overlay_state_1c034 == 2 ? 1 : 0;
}

extern "C" void isaac_exit_manager_floats_reset(float* f_2a2d0, float* f_2a2d4) {
  if (f_2a2d0 == nullptr || f_2a2d4 == nullptr) {
    return;
  }
  /* PE stores imm32 0x3f800000 into both slots. */
  *f_2a2d0 = 1.0f;
  *f_2a2d4 = 1.0f;
}

extern "C" int32_t isaac_exit_pgd_flush_prepare(uint8_t* changesmade,
                                                uint32_t file_loaded_in) {
  const uint8_t file_loaded = static_cast<uint8_t>(file_loaded_in & 0xffu);
  if (changesmade == nullptr) {
    return 0;
  }
  if (*changesmade != 0 && file_loaded != 0) {
    *changesmade = 0;
    return 1;
  }
  return 0;
}

extern "C" int32_t isaac_exit_pgd_flush_needed(uint32_t changesmade_in,
                                               uint32_t file_loaded_in) {
  const uint8_t changesmade = static_cast<uint8_t>(changesmade_in & 0xffu);
  const uint8_t file_loaded = static_cast<uint8_t>(file_loaded_in & 0xffu);
  return (changesmade != 0 && file_loaded != 0) ? 1 : 0;
}

extern "C" int32_t isaac_exit_pgd_save_uses_cloud(uint32_t steam_ctx_word,
                                                  uint32_t cloud_enable_2a3a4_in) {
  /* PE @ 0x006fa1f0: cmp dword ptr [eax],0 — the FIRST DWORD of the Steam
     context returned by SteamInternal_ContextInit is tested FULL-WORD (the
     stack arg 0x00c5c3a4 was pushed and the IAT call 0x00b18a1c ran before
     this gate). A v29-era version masked this to a byte; the PE gate has no
     mask, so e.g. steam_ctx_word=0x100 with cloud on selects the CLOUD host.
     Driver must pass the recaptured [eax] word un-masked. */
  const uint8_t cloud_enable_2a3a4 =
      static_cast<uint8_t>(cloud_enable_2a3a4_in & 0xffu);
  if (steam_ctx_word == 0u || cloud_enable_2a3a4 == 0) {
    return 0;
  }
  return 1;
}

extern "C" int32_t isaac_exit_gamestate_io_needed(uint32_t skip_flag_2658b_in) {
  const uint8_t skip_flag_2658b = static_cast<uint8_t>(skip_flag_2658b_in & 0xffu);
  return skip_flag_2658b == 0 ? 1 : 0;
}

extern "C" int32_t isaac_exit_gamestate_should_write(uint32_t should_save) {
  /* PE: if ((char)param_1 == '\0') delete; else write. Low byte only. */
  return (should_save & 0xffu) != 0u ? 1 : 0;
}

extern "C" void isaac_exit_pure_field_teardown(IsaacExitPureTeardownState* state) {
  if (state == nullptr) {
    return;
  }
  state->field_2510c = 0;
  state->field_2593c = 0;
  state->field_25948 = 0;
  state->field_2590c = 0;
  state->gate_1d520 = 0;
  state->gate_1d654 = 0;
  state->skip_timed_transition_25954 = 0;
}

extern "C" void isaac_exit_teardown_t0(int32_t* field_2510c,
                                       int32_t* field_2593c) {
  if (field_2510c != nullptr) {
    *field_2510c = 0;
  }
  if (field_2593c != nullptr) {
    *field_2593c = 0;
  }
}

extern "C" void isaac_exit_teardown_t1(int32_t* field_25948,
                                       int32_t* field_2590c,
                                       int32_t* gate_1d520) {
  if (field_25948 != nullptr) {
    *field_25948 = 0;
  }
  if (field_2590c != nullptr) {
    *field_2590c = 0;
  }
  if (gate_1d520 != nullptr) {
    *gate_1d520 = 0;
  }
}

extern "C" void isaac_exit_teardown_t2(int32_t* gate_1d654) {
  if (gate_1d654 != nullptr) {
    *gate_1d654 = 0;
  }
}

extern "C" void isaac_exit_teardown_t4(uint8_t* skip_timed_transition_25954) {
  if (skip_timed_transition_25954 != nullptr) {
    *skip_timed_transition_25954 = 0;
  }
}

extern "C" void isaac_exit_vector_25ebc_clear_end(uint32_t* end_25ec0,
                                                  uint32_t begin_25ebc) {
  if (end_25ec0 == nullptr) {
    return;
  }
  *end_25ec0 = begin_25ebc;
}

extern "C" int32_t isaac_exit_vector_25ebc_dtor_needed(uint32_t begin_25ebc,
                                                       uint32_t end_25ec0) {
  return begin_25ebc != end_25ec0 ? 1 : 0;
}

extern "C" uint32_t isaac_exit_vector_25ebc_element_count(uint32_t begin_25ebc,
                                                          uint32_t end_25ec0) {
  if (end_25ec0 < begin_25ebc) {
    return 0;
  }
  const uint32_t span = end_25ec0 - begin_25ebc;
  if ((span % static_cast<uint32_t>(ISAAC_EXIT_VECTOR_25EBC_STRIDE)) != 0u) {
    return 0;
  }
  return span / static_cast<uint32_t>(ISAAC_EXIT_VECTOR_25EBC_STRIDE);
}

extern "C" uint32_t isaac_exit_sfx_stop_id_at(uint32_t index) {
  /* PE immediate push order for five 0x0092e230 calls. Switch avoids a
     mutable data-segment table. */
  switch (index) {
    case 0:
      return 0x256u;
    case 1:
      return 599u;
    case 2:
      return 600u;
    case 3:
      return 0x259u;
    case 4:
      return 0x3f0u;
    default:
      return 0;
  }
}

extern "C" void isaac_exit_pgd_readonly_clear(uint8_t* readonly_15) {
  if (readonly_15 == nullptr) {
    return;
  }
  *readonly_15 = 0;
}

extern "C" void isaac_exit_postlog_pure_fields(IsaacExitPostLogPureState* state,
                                                uint32_t g_c7b640,
                                                uint32_t g_c7b644) {
  if (state == nullptr) {
    return;
  }
  state->field_1bb70 = 0;
  state->gate_1ba78 = 0;
  state->field_1ba7c = 0;
  state->field_1ba84 = 0;
  state->field_1ba88 = 0;
  /* PE @ 0x006fa311..0x006fa329: movss from [0xc7b640]/[0xc7b644] then store.
     A raw 32-bit copy of whatever the globals currently hold — no rounding,
     no NaN normalisation, so this must be a bit-for-bit move. */
  state->field_1ba90 = f32_bits(g_c7b640);
  state->field_1ba94 = f32_bits(g_c7b644);
  state->field_1ba80 = ISAAC_EXIT_POSTLOG_I32_1BA80;
  state->field_1b840 = 0;
  state->field_1b848 = 0;
  state->gate_1b83c = 0;
  state->field_1b84c = 0;
  state->field_1b858 = 0;
  state->field_1b85c = 0;
  state->field_1b860 = 0;
  state->field_1bb74 = 0;
  state->field_26548 = 0;
  state->field_2654c = 0;
}

extern "C" void isaac_exit_item_overlay_state_clear(int32_t* state_1c034,
                                                    int32_t* field_1c038) {
  if (state_1c034 != nullptr) {
    *state_1c034 = 0;
  }
  if (field_1c038 != nullptr) {
    *field_1c038 = 0;
  }
}

extern "C" void isaac_exit_counter_265c0_clear(int32_t* counter_265c0) {
  if (counter_265c0 != nullptr) {
    *counter_265c0 = 0;
  }
}

extern "C" void isaac_exit_session_pair_clear(uint16_t* session_pair_2658a) {
  if (session_pair_2658a != nullptr) {
    *session_pair_2658a = 0;
  }
}

extern "C" void isaac_exit_6f43b0_prefix(IsaacExit6f43b0PrefixState* state) {
  if (state == nullptr) {
    return;
  }
  state->field_26588 = 0;
  state->field_264f8 = 0;
  state->field_264fc = 0;
  state->field_26508 = 0;
}

extern "C" void isaac_exit_6f4520_apply(IsaacExit6f4520State* state) {
  if (state == nullptr) {
    return;
  }
  state->field_26554 = 0;
  state->field_26558 = 0;
  state->field_2655c = 0;
  state->field_26560 = 0;
  state->field_26564 = 0;
  state->field_26568 = 0;
  state->field_2656c = 0;
  state->field_26570 = 0;
  state->field_269c0 = 0;
  state->field_26540 = 0;
  state->field_2657c = 0;
  state->field_26528 = 0;
  state->field_2652c = ISAAC_EXIT_6F4520_I32_2652C;
  state->field_26530 = f32_bits(ISAAC_EXIT_6F4520_F32_26530_BITS);
  state->field_2653c = 0;
  state->field_26538 = 0;
  state->counter_265c0 = 0;
  state->field_26548 = 0;
  state->field_2654c = 0;
  state->counter_67788 = 0;
  /* Effect slots at Game+0x67a9c + i*0x320 (a, b=a+4, flag=a+0xc). */
  for (int i = 0; i < ISAAC_EXIT_6F4520_EFFECT_SLOT_COUNT; ++i) {
    state->effect_slots[i].field_a = 0;
    state->effect_slots[i].field_b = 0;
    state->effect_slots[i].flag = 0;
  }
  state->field_68d6c = 0;
  state->fade_26514 = 0;
  state->fade_26518 = 0;
  state->field_2651c = 0;
  state->field_269c4 = 1;
  state->field_26774 = 0;
  state->field_269cc = 0;
  /* PE: mov eax,[this+0x269d4]; ...; mov [this+0x269d8], eax */
  state->field_269d8 = state->field_269d4;
  state->field_269ea = 0;
  state->field_676ac = static_cast<int32_t>(ISAAC_EXIT_6F4520_I32_676AC);
  state->field_676b0 = 0;
  state->field_269ec = 0;
  state->field_4704c = 0;
  state->field_68d70 = 0;
  state->field_26578 = 0;
  state->field_26574 = ISAAC_EXIT_6F4520_I32_26574;
}

extern "C" void isaac_exit_6f43b0_mid(IsaacExit6f43b0MidState* state) {
  if (state == nullptr) {
    return;
  }
  state->field_264f4 = 0;
  for (int i = 0; i < 4; ++i) {
    state->zero16_2658c[i] = 0;
    state->zero16_265a4[i] = 0;
  }
  state->field_26544 = 0;
  state->field_26550 = 0;
  state->field_2659c = 0;
  state->field_265b4 = 0;
  state->field_265bc = 0;
  state->field_265c4 = 0;
  state->counter_265c0 = 0;
  state->field_26630 = 0;
  state->field_26634 = 0;
  state->field_2663c = 0;
  state->field_26638 = 0;
}

extern "C" void isaac_exit_6f43b0_tail(IsaacExit6f43b0TailState* state) {
  if (state == nullptr) {
    return;
  }
  /* movaps from DAT_00bab050: 1.0f, 1.0f, 1.0f, 0.0f */
  state->pack_676b8[0] = 1.0f;
  state->pack_676b8[1] = 1.0f;
  state->pack_676b8[2] = 1.0f;
  state->pack_676b8[3] = 0.0f;
  state->field_269e4 = 0;
  state->field_269e0 = 0;
  state->field_269e9 = 0;
  state->field_676b4 = 0;
  /* unpcklps zero with 1.0f → movq stores 0.0f, 1.0f */
  state->field_676c8 = 0.0f;
  state->field_676cc = 1.0f;
  state->field_67734 = 0;
  state->field_67738 = 0;
  state->field_6773c = 0;
  state->field_67740 = f32_bits(ISAAC_EXIT_6F43B0_F32_67740_BITS);
  state->field_67744 = 0;
  state->field_67748 = 0;
  state->field_67750 = state->field_6774c;
  state->field_68d70 = 0;
}

extern "C" void isaac_exit_frame_mode_pair_clear(int32_t* mode_1d2ec,
                                                 int32_t* secondary_1d2f0) {
  if (mode_1d2ec != nullptr) {
    *mode_1d2ec = 0;
  }
  if (secondary_1d2f0 != nullptr) {
    *secondary_1d2f0 = 0;
  }
}

extern "C" int32_t isaac_exit_volume_modifier_clear_needed(float manager_2a334) {
  /* PE: ucomiss xmm0, [DAT_00baa454=1.0f]; lahf; test ah,0x44; jnp skip.
     Skip only on ordered-equal to 1.0f. NaN (unordered) falls through to the
     clear path (same as C `x != 1.0f` for NaN). */
  const float one = f32_bits(ISAAC_EXIT_F32_ONE_BITS);
  return manager_2a334 != one ? 1 : 0;
}

extern "C" void isaac_exit_manager_2a334_set_one(float* manager_2a334) {
  if (manager_2a334 == nullptr) {
    return;
  }
  *manager_2a334 = f32_bits(ISAAC_EXIT_F32_ONE_BITS);
}

extern "C" void isaac_exit_manager_2a338_set(float* manager_2a338) {
  if (manager_2a338 == nullptr) {
    return;
  }
  *manager_2a338 = f32_bits(ISAAC_EXIT_MANAGER_2A338_BITS);
}

extern "C" int32_t isaac_exit_residual_slot_copy_needed(uint32_t flag_0c_in,
                                                       uint32_t count) {
  const uint8_t flag_0c = static_cast<uint8_t>(flag_0c_in & 0xffu);
  return (flag_0c != 0 && count > 0u) ? 1 : 0;
}

extern "C" void isaac_exit_residual_entity_copy_30_to_34(uint8_t* entity) {
  if (entity == nullptr) {
    return;
  }
  uint32_t* src = reinterpret_cast<uint32_t*>(
      entity + ISAAC_EXIT_RESIDUAL_ENTITY_SRC_OFF);
  uint32_t* dst = reinterpret_cast<uint32_t*>(
      entity + ISAAC_EXIT_RESIDUAL_ENTITY_DST_OFF);
  *dst = *src;
}

extern "C" void isaac_exit_residual_entity_batch_copy_30_to_34(
    uint8_t* entity_base, uint32_t count) {
  if (entity_base == nullptr || count == 0u) {
    return;
  }
  for (uint32_t i = 0; i < count; ++i) {
    isaac_exit_residual_entity_copy_30_to_34(
        entity_base +
        i * static_cast<uint32_t>(ISAAC_EXIT_RESIDUAL_ENTITY_STRIDE));
  }
}

extern "C" void isaac_exit_residual_18990_apply(uint8_t* game_base) {
  if (game_base == nullptr) {
    return;
  }
  uint8_t* outer = game_base + ISAAC_EXIT_RESIDUAL_BASE_OFF;
  for (uint32_t o = 0; o < static_cast<uint32_t>(ISAAC_EXIT_RESIDUAL_OUTER_COUNT);
       ++o) {
    uint8_t* edi = outer;
    for (uint32_t m = 0; m < static_cast<uint32_t>(ISAAC_EXIT_RESIDUAL_MID_COUNT);
         ++m) {
      const uint8_t flag = edi[ISAAC_EXIT_RESIDUAL_SLOT_FLAG_OFF];
      const uint32_t count =
          *reinterpret_cast<uint32_t*>(edi); /* [edi] = count */
      if (flag != 0 && count > 0u) {
        /* PE loads entity base from [edi-4]. In freestanding tests the
           stored value is a linear-memory offset relative to game_base's
           address space: host encodes ptr as offset from the same base
           the caller used for game_base, OR as an absolute pointer in the
           same process. Here we treat the stored word as an absolute
           uint8_t* in the caller's address space (native) / Wasm linear
           memory address when used with Wasm memory offsets cast via
           integer. */
        uint32_t entity_word =
            *reinterpret_cast<uint32_t*>(edi - ISAAC_EXIT_RESIDUAL_SLOT_PTR_DELTA);
        /* Wasm32 / freestanding: stored word is a linear-memory address. */
        uint8_t* entity_base =
            reinterpret_cast<uint8_t*>(static_cast<uint32_t>(entity_word));
        isaac_exit_residual_entity_batch_copy_30_to_34(entity_base, count);
      }
      edi += ISAAC_EXIT_RESIDUAL_MID_STRIDE;
    }
    outer += ISAAC_EXIT_RESIDUAL_OUTER_STRIDE;
  }
}

extern "C" void isaac_exit_map_value_flag_28_clear(uint8_t* flag_28) {
  if (flag_28 == nullptr) {
    return;
  }
  *flag_28 = 0;
}

extern "C" void isaac_exit_9b5cb0_prefix(IsaacExit9b5cb0PrefixState* state) {
  if (state == nullptr) {
    return;
  }
  /* PE: mov dword [esi],0; mov dword [esi+8],2; mov dword [esi+0x24],0;
     mov dword [esi+0x28],0; mov byte [esi+0x1454],0 — before first host. */
  state->menu_state_0 = 0;
  state->field_8 = ISAAC_EXIT_9B5CB0_FIELD_8_VALUE;
  state->field_24 = 0;
  state->field_28 = 0;
  state->field_1454 = 0;
}

extern "C" void isaac_exit_9b5cb0_prefix_ptrs(int32_t* menu_state_0,
                                              int32_t* field_8,
                                              int32_t* field_24,
                                              int32_t* field_28,
                                              uint8_t* field_1454) {
  if (menu_state_0 != nullptr) {
    *menu_state_0 = 0;
  }
  if (field_8 != nullptr) {
    *field_8 = ISAAC_EXIT_9B5CB0_FIELD_8_VALUE;
  }
  if (field_24 != nullptr) {
    *field_24 = 0;
  }
  if (field_28 != nullptr) {
    *field_28 = 0;
  }
  if (field_1454 != nullptr) {
    *field_1454 = 0;
  }
}

extern "C" void isaac_exit_8d3250_p0(IsaacExit8d3250P0State* state) {
  if (state == nullptr) {
    return;
  }
  /* PE: mov byte [esi+0x10],0; mov dword [esi+0x14],0;
     mov dword [esi+0x30/34/38],0 — before first host 0x0040c7f0. */
  state->field_10 = 0;
  state->field_14 = 0;
  state->field_30 = 0;
  state->field_34 = 0;
  state->field_38 = 0;
}

extern "C" void isaac_exit_8d3250_p0_ptrs(uint8_t* field_10, int32_t* field_14,
                                          int32_t* field_30, int32_t* field_34,
                                          int32_t* field_38) {
  if (field_10 != nullptr) {
    *field_10 = 0;
  }
  if (field_14 != nullptr) {
    *field_14 = 0;
  }
  if (field_30 != nullptr) {
    *field_30 = 0;
  }
  if (field_34 != nullptr) {
    *field_34 = 0;
  }
  if (field_38 != nullptr) {
    *field_38 = 0;
  }
}

extern "C" void isaac_exit_8d3250_p1(int32_t* field_44, int32_t* field_48,
                                     int32_t* field_4c) {
  if (field_44 != nullptr) {
    *field_44 = 0;
  }
  if (field_48 != nullptr) {
    *field_48 = 0;
  }
  if (field_4c != nullptr) {
    *field_4c = 0;
  }
}

extern "C" void isaac_exit_8d3250_p2(int32_t* field_58, int32_t* field_5c,
                                     int32_t* field_60) {
  if (field_58 != nullptr) {
    *field_58 = 0;
  }
  if (field_5c != nullptr) {
    *field_5c = 0;
  }
  if (field_60 != nullptr) {
    *field_60 = 0;
  }
}

extern "C" void isaac_exit_8d3250_p3(IsaacExit8d3250P3State* state) {
  if (state == nullptr) {
    return;
  }
  /* PE: mov dword [esi+0x178], -1; then four zero dwords. Flags from the
     earlier cmp byte [esi+0x40d],0 are preserved across these movs. */
  state->field_178 = static_cast<int32_t>(ISAAC_EXIT_8D3250_FIELD_178_VALUE);
  state->field_17c = 0;
  state->field_180 = 0;
  state->field_648 = 0;
  state->field_64c = 0;
}

extern "C" void isaac_exit_8d3250_p3_ptrs(int32_t* field_178, int32_t* field_17c,
                                          int32_t* field_180, int32_t* field_648,
                                          int32_t* field_64c) {
  if (field_178 != nullptr) {
    *field_178 = static_cast<int32_t>(ISAAC_EXIT_8D3250_FIELD_178_VALUE);
  }
  if (field_17c != nullptr) {
    *field_17c = 0;
  }
  if (field_180 != nullptr) {
    *field_180 = 0;
  }
  if (field_648 != nullptr) {
    *field_648 = 0;
  }
  if (field_64c != nullptr) {
    *field_64c = 0;
  }
}

extern "C" int32_t isaac_exit_8d3250_cursor_layer_host_needed(
    uint32_t field_40d_in) {
  const uint8_t field_40d = static_cast<uint8_t>(field_40d_in & 0xffu);
  /* PE: cmp byte [esi+0x40d],0; je skip GetLayer("Cursor"). */
  return field_40d != 0 ? 1 : 0;
}

extern "C" void isaac_exit_8d3250_p4(IsaacExit8d3250P4State* state) {
  if (state == nullptr) {
    return;
  }
  /* PE: mov eax,[esi+0x18]; mov [esi+0x1c],eax; [esi+0x24/28/2c]=0. */
  state->field_1c = state->field_18;
  state->field_24 = 0;
  state->field_28 = 0;
  state->field_2c = 0;
}

extern "C" void isaac_exit_8d3250_p4_ptrs(const int32_t* field_18,
                                          int32_t* field_1c, int32_t* field_24,
                                          int32_t* field_28, int32_t* field_2c) {
  if (field_1c != nullptr) {
    *field_1c = field_18 != nullptr ? *field_18 : 0;
  }
  if (field_24 != nullptr) {
    *field_24 = 0;
  }
  if (field_28 != nullptr) {
    *field_28 = 0;
  }
  if (field_2c != nullptr) {
    *field_2c = 0;
  }
}

extern "C" int32_t isaac_exit_8d3250_list_host_needed(uint32_t ptr_1e8) {
  /* PE: mov edi,[esi+0x1e8]; test edi,edi; je skip list path. */
  return ptr_1e8 != 0u ? 1 : 0;
}

extern "C" void isaac_exit_8d3250_list_empty(uint32_t* links,
                                             uint32_t self_addr,
                                             uint32_t* count_slot) {
  if (links != nullptr) {
    /* PE: mov [esi],esi; mov [esi+4],esi; mov [esi+8],esi — circular empty.
       Caller supplies self_addr (Wasm linear offset / PE address). */
    const uint32_t self = self_addr;
    links[0] = self;
    links[1] = self;
    links[2] = self;
  }
  if (count_slot != nullptr) {
    *count_slot = 0;
  }
}

/* --- ABI v42: 0x008d3250 ordered host-event decision laws ---
   PE 0x008d3250..0x008d3358 (this = Game+0x23a74+0x838). v5 landed the
   pure islands; these laws pin the 5 ordered typed-host events'
   receiver/arg/offset decisions. Bodies stay host (0x0040c7f0 ×2,
   ANM2::Reset 0x00407f10, ANM2::GetLayer 0x0040b430, 0x00415800). */

extern "C" uint32_t isaac_exit_8d3250_cursor_va(void) {
  /* PE @ 0x008d32f6: push 0xb75734 ("Cursor"). */
  return ISAAC_EXIT_8D3250_CURSOR_VA;
}

extern "C" uint32_t isaac_exit_8d3250_getlayer_receiver_off(void) {
  /* PE @ 0x008d32fb: lea ecx,[esi+0x304] before call ANM2::GetLayer. */
  return ISAAC_EXIT_8D3250_HOST_304_OFF;
}

extern "C" uint32_t isaac_exit_8d3250_layer_clear_off(void) {
  /* PE @ 0x008d3306: mov byte [eax+0x74],0 — eax = GetLayer return
     (LayerState*; host-owned). Only the offset is pure. */
  return ISAAC_EXIT_8D3250_LAYER_CLEAR_OFF;
}

extern "C" uint32_t isaac_exit_8d3250_reset_receiver_off(void) {
  /* PE @ 0x008d329e: lea ecx,[esi+0x64] before call ANM2::Reset. */
  return ISAAC_EXIT_8D3250_HOST_64_OFF;
}

extern "C" uint32_t isaac_exit_8d3250_list_sentinel_off(void) {
  /* PE @ 0x008d332f: mov esi,[edi+0x120] — sentinel = [obj+0x120]. */
  return ISAAC_EXIT_8D3250_LIST_HEADER_OFF;
}

extern "C" uint32_t isaac_exit_8d3250_list_header_off(void) {
  /* PE @ 0x008d3335: add edi,0x120 — header = obj+0x120 (H5 this + arg2). */
  return ISAAC_EXIT_8D3250_LIST_HEADER_OFF;
}

extern "C" uint32_t isaac_exit_8d3250_list_destroy_arg1_ptr(
    uint32_t sentinel) {
  /* PE @ 0x008d333d: push dword [esi+4] where esi = sentinel. The pushed
     value is the dword at [sentinel+4]; this law yields that source
     address (32-bit wrap; the driver reads the dword). */
  return sentinel + ISAAC_EXIT_8D3250_LIST_ARG1_OFF;
}

extern "C" uint32_t isaac_exit_8d3250_list_destroy_arg2(uint32_t obj) {
  /* PE @ 0x008d3340: push edi where edi = obj+0x120 (header). The pushed
     VALUE is the header address (== H5 this). 32-bit wrap. */
  return obj + ISAAC_EXIT_8D3250_LIST_HEADER_OFF;
}

extern "C" void isaac_exit_8d3250_host_plan(IsaacExit8d3250HostPlan* out,
                                            uint32_t field_40d_in,
                                            uint32_t ptr_1e8) {
  if (out == nullptr) {
    return;
  }
  /* PE @ 0x008d32bb: cmp byte [esi+0x40d],0; je skip H4 — LOW BYTE. */
  const uint8_t field_40d = static_cast<uint8_t>(field_40d_in & 0xffu);
  /* PE @ 0x008d332b: test edi,edi (edi = [esi+0x1e8]); je skip H5 — FULL
     dword pointer. */
  out->cursor_va = ISAAC_EXIT_8D3250_CURSOR_VA;
  out->getlayer_receiver_off = ISAAC_EXIT_8D3250_HOST_304_OFF;
  out->layer_clear_off = ISAAC_EXIT_8D3250_LAYER_CLEAR_OFF;
  out->reset_receiver_off = ISAAC_EXIT_8D3250_HOST_64_OFF;
  out->list_obj_off = ISAAC_EXIT_8D3250_LIST_OBJ_OFF;
  out->list_sentinel_off = ISAAC_EXIT_8D3250_LIST_HEADER_OFF;
  out->list_header_off = ISAAC_EXIT_8D3250_LIST_HEADER_OFF;
  out->cursor_gate = field_40d != 0 ? 1 : 0;
  out->list_gate = ptr_1e8 != 0u ? 1 : 0;
}

extern "C" void isaac_exit_9b9150_p0(IsaacExit9b9150P0State* state) {
  if (state == nullptr) {
    return;
  }
  /* PE: mov dword [esi+0xc8],0; mov dword [esi+0xcc],0 — before list walk. */
  state->field_c8 = 0;
  state->field_cc = 0;
}

extern "C" void isaac_exit_9b9150_p0_ptrs(int32_t* field_c8, int32_t* field_cc) {
  if (field_c8 != nullptr) {
    *field_c8 = 0;
  }
  if (field_cc != nullptr) {
    *field_cc = 0;
  }
}

extern "C" int32_t isaac_exit_9b9150_player_list_host_needed(uint32_t begin,
                                                             uint32_t end) {
  /* PE: sub eax,ecx; test eax,0xfffffffc; je skip.
     At least one full pointer slot when any of bits 2..31 of span are set. */
  const uint32_t span = end - begin;
  return (span & 0xfffffffcu) != 0u ? 1 : 0;
}

extern "C" void isaac_exit_9b9150_player_list_clear_end(uint32_t* end_slot,
                                                        uint32_t begin) {
  if (end_slot == nullptr) {
    return;
  }
  /* PE: mov [esi+4], ecx  with ecx = begin (empty range). */
  *end_slot = begin;
}

extern "C" int32_t isaac_exit_9b9150_extra_list_count(uint32_t begin,
                                                      uint32_t end) {
  /* PE: sub eax,ecx; sar eax,2 — signed element count. */
  const int32_t span = static_cast<int32_t>(end - begin);
  return span >> 2;
}

extern "C" int32_t isaac_exit_9b9150_extra_list_host_needed(uint32_t begin,
                                                            uint32_t end) {
  /* PE: sar count; test eax,eax; je skip. */
  return isaac_exit_9b9150_extra_list_count(begin, end) != 0 ? 1 : 0;
}

extern "C" void isaac_exit_9b9150_extra_list_clear_end(uint32_t* end_slot,
                                                       uint32_t begin) {
  if (end_slot == nullptr) {
    return;
  }
  /* PE: mov [esi+0xd4], ecx  with ecx = begin. */
  *end_slot = begin;
}

extern "C" int32_t isaac_exit_9b9150_ptr_host_needed(uint32_t ptr) {
  /* PE: test ecx,ecx / test edi path; je skip vtable delete. */
  return ptr != 0u ? 1 : 0;
}

extern "C" void isaac_exit_9b9150_slot_clear(uint32_t* slot) {
  if (slot == nullptr) {
    return;
  }
  /* PE: mov dword [edi],0 after host vtable delete on non-null. */
  *slot = 0;
}

extern "C" void isaac_exit_9b9150_esau_slots_clear(uint32_t* slots) {
  if (slots == nullptr) {
    return;
  }
  for (int i = 0; i < ISAAC_EXIT_9B9150_ESAU_SLOT_COUNT; ++i) {
    slots[i] = 0;
  }
}

extern "C" void isaac_exit_9b9150_mid(IsaacExit9b9150MidState* state) {
  if (state == nullptr) {
    return;
  }
  /* PE after esau loop (ebx==0): mov [esi+0x7c],ebx; mov byte [esi+0x5c],1. */
  state->field_7c = 0;
  state->field_5c = static_cast<uint8_t>(ISAAC_EXIT_9B9150_FIELD_5C_VALUE);
}

extern "C" void isaac_exit_9b9150_mid_ptrs(int32_t* field_7c, uint8_t* field_5c) {
  if (field_7c != nullptr) {
    *field_7c = 0;
  }
  if (field_5c != nullptr) {
    *field_5c = static_cast<uint8_t>(ISAAC_EXIT_9B9150_FIELD_5C_VALUE);
  }
}

extern "C" void isaac_exit_9b9150_tail(IsaacExit9b9150TailState* state) {
  if (state == nullptr) {
    return;
  }
  /* PE: four stores of 0xffffffff at this+0x60 + i*4 (between log hosts). */
  for (int i = 0; i < ISAAC_EXIT_9B9150_TAIL_COUNT; ++i) {
    state->fields[i] = static_cast<int32_t>(ISAAC_EXIT_9B9150_TAIL_VALUE);
  }
}

extern "C" void isaac_exit_9b9150_tail_ptrs(int32_t* fields) {
  if (fields == nullptr) {
    return;
  }
  for (int i = 0; i < ISAAC_EXIT_9B9150_TAIL_COUNT; ++i) {
    fields[i] = static_cast<int32_t>(ISAAC_EXIT_9B9150_TAIL_VALUE);
  }
}

extern "C" void isaac_exit_9a27d0_slot_flag_clear(uint8_t* flag) {
  if (flag == nullptr) {
    return;
  }
  /* PE: mov byte [esi-0x10], 0 after slot host triple (also first slot
     mov byte [ebx+0x3ce4], 0). */
  *flag = 0;
}

extern "C" void isaac_exit_9a27d0_slot_flags_clear_packed(uint8_t* flags) {
  if (flags == nullptr) {
    return;
  }
  for (int i = 0; i < ISAAC_EXIT_9A27D0_SLOT_FLAG_COUNT; ++i) {
    flags[i] = 0;
  }
}

extern "C" void isaac_exit_9a27d0_slot_flags_apply(uint8_t* this_base) {
  if (this_base == nullptr) {
    return;
  }
  /* PE: 1 standalone + 6-loop + 4-loop = 11 continuous flags,
     this+0x3ce4 + i*0x1f4 ← 0. */
  for (int i = 0; i < ISAAC_EXIT_9A27D0_SLOT_FLAG_COUNT; ++i) {
    const uint32_t off =
        static_cast<uint32_t>(ISAAC_EXIT_9A27D0_SLOT_FLAG_BASE_OFF) +
        static_cast<uint32_t>(i) *
            static_cast<uint32_t>(ISAAC_EXIT_9A27D0_SLOT_FLAG_STRIDE);
    this_base[off] = 0;
  }
}

extern "C" uint32_t isaac_exit_9a27d0_slot_flag_off(uint32_t index) {
  if (index >= static_cast<uint32_t>(ISAAC_EXIT_9A27D0_SLOT_FLAG_COUNT)) {
    return 0xffffffffu;
  }
  return static_cast<uint32_t>(ISAAC_EXIT_9A27D0_SLOT_FLAG_BASE_OFF) +
         index * static_cast<uint32_t>(ISAAC_EXIT_9A27D0_SLOT_FLAG_STRIDE);
}

extern "C" void isaac_exit_9a27d0_field_54cd_clear(uint8_t* field_54cd) {
  if (field_54cd == nullptr) {
    return;
  }
  /* PE @ 0x009a2970: mov byte [ebx+0x54cd], 0 before host 0x0083abb0. */
  *field_54cd = 0;
}

extern "C" void isaac_exit_9a19a0_prefix(IsaacExit9a19a0PrefixState* state) {
  if (state == nullptr) {
    return;
  }
  /* PE @ 0x009a19a7–0x009a19e3: float -1.0f, two -1 dwords, byte 0,
     two dwords = 2, byte 0 — before first host 0x00841cf0. */
  state->field_5490 = f32_bits(ISAAC_EXIT_9A19A0_F32_5490_BITS);
  state->field_5494 = static_cast<int32_t>(ISAAC_EXIT_9A19A0_I32_M1);
  state->field_5498 = static_cast<int32_t>(ISAAC_EXIT_9A19A0_I32_M1);
  state->field_549c = 0;
  state->field_54d0 = ISAAC_EXIT_9A19A0_FIELD_54D0_VALUE;
  state->field_54d4 = 0;
  state->field_54d8 = ISAAC_EXIT_9A19A0_FIELD_54D8_VALUE;
}

extern "C" void isaac_exit_9a19a0_prefix_ptrs(float* field_5490,
                                              int32_t* field_5494,
                                              int32_t* field_5498,
                                              uint8_t* field_549c,
                                              int32_t* field_54d0,
                                              uint8_t* field_54d4,
                                              int32_t* field_54d8) {
  if (field_5490 != nullptr) {
    *field_5490 = f32_bits(ISAAC_EXIT_9A19A0_F32_5490_BITS);
  }
  if (field_5494 != nullptr) {
    *field_5494 = static_cast<int32_t>(ISAAC_EXIT_9A19A0_I32_M1);
  }
  if (field_5498 != nullptr) {
    *field_5498 = static_cast<int32_t>(ISAAC_EXIT_9A19A0_I32_M1);
  }
  if (field_549c != nullptr) {
    *field_549c = 0;
  }
  if (field_54d0 != nullptr) {
    *field_54d0 = ISAAC_EXIT_9A19A0_FIELD_54D0_VALUE;
  }
  if (field_54d4 != nullptr) {
    *field_54d4 = 0;
  }
  if (field_54d8 != nullptr) {
    *field_54d8 = ISAAC_EXIT_9A19A0_FIELD_54D8_VALUE;
  }
}

extern "C" void isaac_exit_9a19a0_slot_setup(uint32_t* field_4,
                                             uint16_t* field_8,
                                             uint32_t this_addr,
                                             uint16_t index) {
  /* PE loop: mov word [esi+4], di; mov dword [esi], ebx
     where esi = this+4 + i*0x6dc → slot+8 word / slot+4 dword. */
  if (field_4 != nullptr) {
    *field_4 = this_addr;
  }
  if (field_8 != nullptr) {
    *field_8 = index;
  }
}

extern "C" void isaac_exit_9a19a0_slots_apply(uint8_t* this_base,
                                              uint32_t this_addr) {
  if (this_base == nullptr) {
    return;
  }
  for (int i = 0; i < ISAAC_EXIT_9A19A0_PLAYERHUD_LOOP_COUNT; ++i) {
    const uint32_t base =
        static_cast<uint32_t>(i) *
        static_cast<uint32_t>(ISAAC_EXIT_9A19A0_PLAYERHUD_STRIDE);
    uint32_t* backptr = reinterpret_cast<uint32_t*>(
        this_base + base + ISAAC_EXIT_9A19A0_SLOT_BACKPTR_OFF);
    uint16_t* index_word = reinterpret_cast<uint16_t*>(
        this_base + base + ISAAC_EXIT_9A19A0_SLOT_INDEX_OFF);
    *backptr = this_addr;
    *index_word = static_cast<uint16_t>(i);
  }
}

extern "C" uint32_t isaac_exit_9a19a0_slot_base_off(uint32_t index) {
  if (index >= static_cast<uint32_t>(ISAAC_EXIT_9A19A0_PLAYERHUD_LOOP_COUNT)) {
    return 0xffffffffu;
  }
  return index * static_cast<uint32_t>(ISAAC_EXIT_9A19A0_PLAYERHUD_STRIDE);
}

extern "C" void isaac_exit_9a19a0_field_54cc_set(uint8_t* field_54cc) {
  if (field_54cc == nullptr) {
    return;
  }
  /* PE @ 0x009a1a17: mov byte [ebx+0x54cc], 1 after host 0x0083abb0,
     before tail-jmp 0x0084bfd0. */
  *field_54cc = ISAAC_EXIT_9A19A0_FIELD_54CC_VALUE;
}

extern "C" int32_t isaac_exit_40e910_list_host_needed(uint32_t sentinel,
                                                      uint32_t first) {
  /* PE @ 0x0040e940: cmp esi, eax; je empty. */
  return (first != sentinel) ? 1 : 0;
}

extern "C" int32_t isaac_exit_40e910_node_object_present(uint32_t obj_ptr) {
  /* PE @ 0x0040e94b: test edi, edi; je free path. */
  return (obj_ptr != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_exit_40e910_free_after_com_needed(uint32_t obj_word4) {
  /* PE @ 0x0040e960–0x0040e96a: movzx edi, word [obj+4]; cmp edi, 2; jbe free.
     Free when zero-extended word <= 2; else pure successor only. */
  return ((obj_word4 & 0xffffu) <=
          static_cast<uint32_t>(ISAAC_EXIT_40E910_COM_FREE_WORD_MAX))
             ? 1
             : 0;
}

extern "C" int32_t isaac_exit_40e910_post_erase_dtor_needed(uint32_t obj_ptr) {
  /* PE @ 0x0040e9a5–0x0040e9aa: mov ecx, [edi+4]; test ecx, ecx; je skip. */
  return (obj_ptr != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_exit_40e910_post_erase_callback_needed(
    uint32_t virtual_al_in, uint32_t global_fn) {
  const uint8_t virtual_al = static_cast<uint8_t>(virtual_al_in & 0xffu);
  /* PE @ 0x0040e9b3–0x0040e9be: test al, al; je skip;
     mov eax, [DAT_00c7163c]; test eax, eax; je skip. */
  if (virtual_al == 0) {
    return 0;
  }
  return (global_fn != 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_40e910_free_size(void) {
  /* PE @ 0x0040e9c6: push 0x1c before free 0x00aef15c. */
  return static_cast<uint32_t>(ISAAC_EXIT_40E910_NODE_SIZE);
}

/* ABI v41: decision laws for the 0x0040e910 global-tree walk + COM
   release. COM vtable calls (slots +0xc/+0x10), virtual dtor, global
   callback, erase 0x00415d20, 0x0040c7f0 and free stay typed-host. */

extern "C" int32_t isaac_exit_40e910_walk_continue(uint32_t cur,
                                                   uint32_t sentinel) {
  /* PE @ 0x0040e9de: cmp esi, dword [DAT_00c78ee8]; jne loop.
     Sentinel is re-read from DAT_00c78ee8 on every iteration; both the
     keep path (tree++ result) and the erase path (0x00415d20 return)
     flow into this check before the next node iteration. */
  return (cur != sentinel) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_40e910_com_iface_addr(uint32_t obj_ptr) {
  /* PE @ 0x0040e952: lea ebx, [edi + 8] — COM release this for the
     vtable slot +0xc/+0x10 calls. */
  return obj_ptr + static_cast<uint32_t>(ISAAC_EXIT_40E910_OBJ_COM_OFF);
}

extern "C" uint32_t isaac_exit_40e910_com_release_arg(void) {
  /* PE @ 0x0040e955: push -1 before call [vtable+0xc]; the slot +0x10
     call reuses the same stack arg (no cleanup before the compare). */
  return static_cast<uint32_t>(ISAAC_EXIT_40E910_COM_RELEASE_ARG);
}

extern "C" uint32_t isaac_exit_40e910_com_state_word(uint32_t obj_word4) {
  /* PE @ 0x0040e960: movzx edi, word ptr [edi + 4] — the free decision
     reads a 16-bit word; low 16 bits only (drives
     free_after_com_needed, which complements this narrowing). */
  return obj_word4 & 0xffffu;
}

namespace {

/* Wasm linear-memory model: node addresses are absolute i32 offsets stored
   as u32 (same pattern as residual_18990 entity pointers). */
inline const uint8_t* tree_node_ptr(uint32_t addr) {
  return reinterpret_cast<const uint8_t*>(static_cast<uint32_t>(addr));
}

inline uint8_t* tree_node_mut(uint32_t addr) {
  return reinterpret_cast<uint8_t*>(static_cast<uint32_t>(addr));
}

inline uint32_t tree_load_u32(uint32_t addr) {
  uint32_t value = 0;
  const uint8_t* p = tree_node_ptr(addr);
  value |= static_cast<uint32_t>(p[0]);
  value |= static_cast<uint32_t>(p[1]) << 8;
  value |= static_cast<uint32_t>(p[2]) << 16;
  value |= static_cast<uint32_t>(p[3]) << 24;
  return value;
}

inline void tree_store_u32(uint32_t addr, uint32_t value) {
  uint8_t* p = tree_node_mut(addr);
  p[0] = static_cast<uint8_t>(value & 0xffu);
  p[1] = static_cast<uint8_t>((value >> 8) & 0xffu);
  p[2] = static_cast<uint8_t>((value >> 16) & 0xffu);
  p[3] = static_cast<uint8_t>((value >> 24) & 0xffu);
}

inline uint8_t tree_load_isnil(uint32_t node_addr) {
  return tree_node_ptr(node_addr +
                       static_cast<uint32_t>(ISAAC_EXIT_TREE_ISNIL_OFF))[0];
}

/* MSVC basic_string data pointer: SSO when capacity < 0x10. */
inline uint32_t msvc_string_data_addr(uint32_t str_addr) {
  const uint32_t cap = tree_load_u32(
      str_addr + static_cast<uint32_t>(ISAAC_EXIT_MSVC_STRING_CAP_OFF));
  if (cap < static_cast<uint32_t>(ISAAC_EXIT_MSVC_STRING_SSO_CAP)) {
    return str_addr;
  }
  return tree_load_u32(str_addr);
}

inline uint32_t msvc_string_size(uint32_t str_addr) {
  return tree_load_u32(str_addr +
                       static_cast<uint32_t>(ISAAC_EXIT_MSVC_STRING_SIZE_OFF));
}

/* PE 0x00423480 strcmp on linear addresses (min-length memcmp + length order). */
inline int32_t string_compare_addrs(uint32_t s1_addr, uint32_t len1,
                                    uint32_t s2_addr, uint32_t len2) {
  const uint32_t n = (len1 < len2) ? len1 : len2;
  for (uint32_t i = 0; i < n; ++i) {
    const uint8_t a = tree_node_ptr(s1_addr + i)[0];
    const uint8_t b = tree_node_ptr(s2_addr + i)[0];
    if (a != b) {
      return (a < b) ? -1 : 1;
    }
  }
  if (len2 > len1) {
    return -1;
  }
  if (len1 > len2) {
    return 1;
  }
  return 0;
}

}  // namespace

extern "C" void isaac_exit_tree_iterator_next(uint32_t* it) {
  /* Exact PE 0x00414a80 (MSVC tree unchecked const iterator++). */
  if (it == nullptr) {
    return;
  }
  const uint32_t node = *it;
  if (node == 0u) {
    return;
  }
  const uint32_t right =
      tree_load_u32(node + static_cast<uint32_t>(ISAAC_EXIT_TREE_RIGHT_OFF));
  if (tree_load_isnil(right) != 0) {
    /* Right is nil: climb parents while current is a right child. */
    uint32_t cur = node;
    uint32_t parent =
        tree_load_u32(cur + static_cast<uint32_t>(ISAAC_EXIT_TREE_PARENT_OFF));
    if (tree_load_isnil(parent) == 0) {
      while (cur == tree_load_u32(parent + static_cast<uint32_t>(
                                               ISAAC_EXIT_TREE_RIGHT_OFF))) {
        *it = parent;
        cur = parent;
        parent = tree_load_u32(
            cur + static_cast<uint32_t>(ISAAC_EXIT_TREE_PARENT_OFF));
        if (tree_load_isnil(parent) != 0) {
          break;
        }
      }
    }
    *it = parent;
    return;
  }
  /* Right is not nil: go to leftmost node in the right subtree. */
  uint32_t walk = right;
  uint32_t left =
      tree_load_u32(walk + static_cast<uint32_t>(ISAAC_EXIT_TREE_LEFT_OFF));
  if (tree_load_isnil(left) == 0) {
    do {
      walk = left;
      left =
          tree_load_u32(walk + static_cast<uint32_t>(ISAAC_EXIT_TREE_LEFT_OFF));
    } while (tree_load_isnil(left) == 0);
  }
  *it = walk;
}

extern "C" int32_t isaac_exit_map_1a738_walk_needed(uint32_t sentinel,
                                                    uint32_t first) {
  /* PE @ 0x006fa468: cmp esi, edi; je empty. */
  return (first != sentinel) ? 1 : 0;
}

extern "C" int32_t isaac_exit_map_1a738_lookup_hit(uint32_t sentinel,
                                                   uint32_t found) {
  /* PE @ 0x006fa484: cmp eax, edi; je skip body. */
  return (found != sentinel) ? 1 : 0;
}

extern "C" int32_t isaac_exit_map_1a738_flag_active(uint32_t flag_28_in) {
  const uint8_t flag_28 = static_cast<uint8_t>(flag_28_in & 0xffu);
  /* PE @ 0x006fa488: cmp byte [eax+0x28], 0; je skip body. */
  return (flag_28 != 0) ? 1 : 0;
}

extern "C" int32_t isaac_exit_map_1a738_elem_range_nonempty(uint32_t begin,
                                                            uint32_t end) {
  /* PE @ 0x006fa491: cmp edi, [eax+0x48]; je flag clear only. */
  return (begin != end) ? 1 : 0;
}

extern "C" int32_t isaac_exit_map_1a738_elem_walk_needed(uint32_t sentinel,
                                                         uint32_t found,
                                                         uint32_t flag_28_in,
                                                         uint32_t begin,
                                                         uint32_t end) {
  const uint8_t flag_28 = static_cast<uint8_t>(flag_28_in & 0xffu);
  if (found == sentinel) {
    return 0;
  }
  if (flag_28 == 0) {
    return 0;
  }
  return (begin != end) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_map_1a738_elem_stride(void) {
  /* PE @ 0x006fa4aa: add edi, 0x20. */
  return static_cast<uint32_t>(ISAAC_EXIT_MAP_ELEM_STRIDE);
}

extern "C" uint32_t isaac_exit_map_1a738_elem_host_off(void) {
  /* PE @ 0x006fa4a2: lea ecx, [edi+0x18]. */
  return static_cast<uint32_t>(ISAAC_EXIT_MAP_ELEM_HOST_OFF);
}

extern "C" int32_t isaac_exit_msvc_string_sso_inline(uint32_t capacity) {
  /* PE: cmp capacity, 0x10; jb → inline buf at string object. */
  return (capacity < static_cast<uint32_t>(ISAAC_EXIT_MSVC_STRING_SSO_CAP)) ? 1
                                                                            : 0;
}

extern "C" uint32_t isaac_exit_msvc_string_data_addr(uint32_t str_addr,
                                                    uint32_t capacity,
                                                    uint32_t dword0) {
  /* PE SSO: capacity < 0x10 → data = str object; else data = [str]. */
  if (capacity < static_cast<uint32_t>(ISAAC_EXIT_MSVC_STRING_SSO_CAP)) {
    return str_addr;
  }
  return dword0;
}

extern "C" int32_t isaac_exit_string_compare(const uint8_t* s1, uint32_t len1,
                                             const uint8_t* s2, uint32_t len2) {
  /* Exact PE 0x00423480: memcmp of min lengths, then length order.
     Null buffers only legal when the compared length is 0. */
  const uint32_t n = (len1 < len2) ? len1 : len2;
  for (uint32_t i = 0; i < n; ++i) {
    const uint8_t a = (s1 != nullptr) ? s1[i] : 0;
    const uint8_t b = (s2 != nullptr) ? s2[i] : 0;
    if (a != b) {
      return (a < b) ? -1 : 1;
    }
  }
  if (len2 > len1) {
    return -1;
  }
  if (len1 > len2) {
    return 1;
  }
  return 0;
}

extern "C" int32_t isaac_exit_69d690_candidate_isnil(uint32_t isnil_byte_in) {
  const uint8_t isnil_byte = static_cast<uint8_t>(isnil_byte_in & 0xffu);
  /* PE @ 0x0069d6ab: cmp byte [edi+0xd], 0; jne miss. */
  return (isnil_byte != 0) ? 1 : 0;
}

extern "C" int32_t isaac_exit_69d690_cmp_is_hit(int32_t cmp_result) {
  /* PE @ 0x0069d6d6: test eax, eax; js miss — hit when cmp >= 0. */
  return (cmp_result >= 0) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_69d690_select_result(uint32_t sentinel,
                                                    uint32_t candidate,
                                                    uint32_t isnil_byte_in,
                                                    int32_t cmp_result) {
  const uint8_t isnil_byte = static_cast<uint8_t>(isnil_byte_in & 0xffu);
  /* Miss path stores *map (sentinel); hit stores candidate node. */
  if (isnil_byte != 0) {
    return sentinel;
  }
  if (cmp_result < 0) {
    return sentinel;
  }
  return candidate;
}

extern "C" void isaac_exit_685bc0_init_triple(IsaacExitLowerBoundTriple* out,
                                              uint32_t sentinel,
                                              uint32_t root) {
  /* PE @ 0x00685bcd..0x00685bda. */
  if (out == nullptr) {
    return;
  }
  out->walk = root;
  out->bound = 0u;
  out->best = sentinel;
}

extern "C" int32_t isaac_exit_685bc0_root_is_empty(uint32_t root_isnil_in) {
  const uint8_t root_isnil = static_cast<uint8_t>(root_isnil_in & 0xffu);
  /* PE @ 0x00685bcf: cmp byte [esi+0xd], 0; jne epilog. */
  return (root_isnil != 0) ? 1 : 0;
}

extern "C" int32_t isaac_exit_685bc0_cmp_go_right(int32_t cmp_result) {
  /* PE @ 0x00685c15: test eax; jns left-path; js/fall → right when < 0. */
  return (cmp_result < 0) ? 1 : 0;
}

extern "C" void isaac_exit_685bc0_step(IsaacExitLowerBoundTriple* out,
                                       uint32_t node, uint32_t left,
                                       uint32_t right, int32_t cmp_result) {
  /* PE @ 0x00685c15..0x00685c2d after strcmp(node_key, search_key). */
  if (out == nullptr) {
    return;
  }
  if (cmp_result < 0) {
    out->walk = right;
    out->bound = 0u;
  } else {
    out->best = node;
    out->bound = 1u;
    out->walk = left;
  }
}

extern "C" int32_t isaac_exit_685bc0_loop_continue(uint32_t next_isnil_in) {
  const uint8_t next_isnil = static_cast<uint8_t>(next_isnil_in & 0xffu);
  /* PE @ 0x00685c30: cmp byte [esi+0xd], 0; je loop. */
  return (next_isnil == 0) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_map_lower_bound(uint32_t map_addr,
                                               uint32_t out_addr,
                                               uint32_t key_addr) {
  /* Exact PE 0x00685bc0 through ret 8 @ 0x00685c3c. */
  if (map_addr == 0u || out_addr == 0u) {
    return 0u;
  }
  const uint32_t sentinel = tree_load_u32(map_addr);
  const uint32_t root = tree_load_u32(
      sentinel + static_cast<uint32_t>(ISAAC_EXIT_MAP_ROOT_FROM_SENTINEL_OFF));
  tree_store_u32(out_addr + static_cast<uint32_t>(ISAAC_EXIT_LOWER_BOUND_WALK_OFF),
                 root);
  tree_store_u32(out_addr + static_cast<uint32_t>(ISAAC_EXIT_LOWER_BOUND_BOUND_OFF),
                 0u);
  tree_store_u32(out_addr + static_cast<uint32_t>(ISAAC_EXIT_LOWER_BOUND_BEST_OFF),
                 sentinel);
  if (tree_load_isnil(root) != 0) {
    return out_addr;
  }

  /* Key size cached once; data re-resolved each iter (PE keeps key ptr). */
  const uint32_t key_size = msvc_string_size(key_addr);
  const uint32_t key_data = msvc_string_data_addr(key_addr);

  uint32_t walk = root;
  uint32_t best = sentinel;
  for (;;) {
    tree_store_u32(
        out_addr + static_cast<uint32_t>(ISAAC_EXIT_LOWER_BOUND_WALK_OFF), walk);
    /* Node key at walk+0x10; strcmp(node, key). */
    const uint32_t node_key =
        walk + static_cast<uint32_t>(ISAAC_EXIT_MAP_NODE_KEY_OFF);
    const uint32_t node_size = msvc_string_size(node_key);
    const uint32_t node_data = msvc_string_data_addr(node_key);
    const int32_t cmp =
        string_compare_addrs(node_data, node_size, key_data, key_size);
    uint32_t bound = 0u;
    if (cmp < 0) {
      walk = tree_load_u32(walk +
                           static_cast<uint32_t>(ISAAC_EXIT_TREE_RIGHT_OFF));
      bound = 0u;
    } else {
      best = walk;
      tree_store_u32(
          out_addr + static_cast<uint32_t>(ISAAC_EXIT_LOWER_BOUND_BEST_OFF),
          best);
      bound = 1u;
      walk =
          tree_load_u32(walk + static_cast<uint32_t>(ISAAC_EXIT_TREE_LEFT_OFF));
    }
    tree_store_u32(
        out_addr + static_cast<uint32_t>(ISAAC_EXIT_LOWER_BOUND_BOUND_OFF),
        bound);
    if (tree_load_isnil(walk) != 0) {
      /* PE @ 0x00685c30–0x00685c36: when the child IS nil the loop falls
         out to 0x00685c37 and [edi] is NOT written again. out.walk keeps
         the last value the loop head stored — the last NON-nil node — or
         the root when the loop never ran. Storing the terminating nil
         child here was wrong (stale-state audit F7). */
      break;
    }
  }
  return out_addr;
}

extern "C" uint32_t isaac_exit_map_find_69d690(uint32_t map_addr,
                                               uint32_t out_node_addr,
                                               uint32_t key_addr) {
  /* Exact PE 0x0069d690: lower_bound then isnil / strcmp(key,node) / select. */
  if (map_addr == 0u || out_node_addr == 0u) {
    return 0u;
  }
  /* PE stack triple at [ebp-0xc]; freestanding form keeps locals only. */
  const uint32_t sentinel = tree_load_u32(map_addr);
  const uint32_t root = tree_load_u32(
      sentinel + static_cast<uint32_t>(ISAAC_EXIT_MAP_ROOT_FROM_SENTINEL_OFF));
  uint32_t walk = root;
  uint32_t best = sentinel;
  if (tree_load_isnil(root) == 0) {
    const uint32_t key_size = msvc_string_size(key_addr);
    const uint32_t key_data = msvc_string_data_addr(key_addr);
    for (;;) {
      const uint32_t node_key =
          walk + static_cast<uint32_t>(ISAAC_EXIT_MAP_NODE_KEY_OFF);
      const uint32_t node_size = msvc_string_size(node_key);
      const uint32_t node_data = msvc_string_data_addr(node_key);
      const int32_t cmp =
          string_compare_addrs(node_data, node_size, key_data, key_size);
      if (cmp < 0) {
        walk = tree_load_u32(walk +
                             static_cast<uint32_t>(ISAAC_EXIT_TREE_RIGHT_OFF));
      } else {
        best = walk;
        walk =
            tree_load_u32(walk + static_cast<uint32_t>(ISAAC_EXIT_TREE_LEFT_OFF));
      }
      if (tree_load_isnil(walk) != 0) {
        break;
      }
    }
  }
  if (tree_load_isnil(best) != 0) {
    tree_store_u32(out_node_addr, sentinel);
    return out_node_addr;
  }
  /* PE strcmp(key, node) — opposite arg order from lower_bound. */
  const uint32_t node_key =
      best + static_cast<uint32_t>(ISAAC_EXIT_MAP_NODE_KEY_OFF);
  const uint32_t node_size = msvc_string_size(node_key);
  const uint32_t node_data = msvc_string_data_addr(node_key);
  const uint32_t key_size = msvc_string_size(key_addr);
  const uint32_t key_data = msvc_string_data_addr(key_addr);
  const int32_t cmp =
      string_compare_addrs(key_data, key_size, node_data, node_size);
  if (cmp < 0) {
    tree_store_u32(out_node_addr, sentinel);
  } else {
    tree_store_u32(out_node_addr, best);
  }
  return out_node_addr;
}

extern "C" uint32_t isaac_exit_40c7f0_alloc_size(void) {
  /* PE @ 0x0040c81a: push 0x18 before host alloc 0x00a0f4c0. */
  return static_cast<uint32_t>(ISAAC_EXIT_40C7F0_ALLOC_SIZE);
}

extern "C" int32_t isaac_exit_40c7f0_alloc_ok(uint32_t alloc_ptr) {
  /* PE @ 0x0040c833: test edi, edi; je null path. */
  return (alloc_ptr != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_exit_40c7f0_old_object_present(uint32_t old_obj_ptr) {
  /* PE @ 0x0040c852–0x0040c857: mov ecx,[esi+4]; test ecx; je skip. */
  return (old_obj_ptr != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_exit_40c7f0_callback_needed(uint32_t virtual_al_in,
                                                     uint32_t global_fn) {
  const uint8_t virtual_al = static_cast<uint8_t>(virtual_al_in & 0xffu);
  /* PE @ 0x0040c860–0x0040c86b: test al, al; je skip;
     mov eax,[DAT_00c7163c]; test eax, eax; je skip. */
  if (virtual_al == 0) {
    return 0;
  }
  return (global_fn != 0u) ? 1 : 0;
}

extern "C" void isaac_exit_40c7f0_object_finish(uint32_t* vtable_slot,
                                                uint32_t* arg_slot,
                                                uint32_t arg) {
  /* PE @ 0x0040c83e: mov dword [edi], 0xb1a6e0
     PE @ 0x0040c844: mov dword [edi+0x14], ebx  (stack arg). */
  if (vtable_slot != nullptr) {
    *vtable_slot = static_cast<uint32_t>(ISAAC_EXIT_40C7F0_VTABLE);
  }
  if (arg_slot != nullptr) {
    *arg_slot = arg;
  }
}

extern "C" void isaac_exit_40c7f0_object_finish_apply(uint8_t* obj_base,
                                                      uint32_t arg) {
  if (obj_base == nullptr) {
    return;
  }
  *reinterpret_cast<uint32_t*>(obj_base) =
      static_cast<uint32_t>(ISAAC_EXIT_40C7F0_VTABLE);
  *reinterpret_cast<uint32_t*>(obj_base + ISAAC_EXIT_40C7F0_ARG_OFF) = arg;
}

extern "C" void isaac_exit_40c7f0_pair_apply(uint32_t* value_slot,
                                             uint32_t* obj_slot, uint32_t arg,
                                             uint32_t new_obj) {
  /* PE @ 0x0040c873: mov [esi], ebx; mov [esi+4], edi. */
  if (value_slot != nullptr) {
    *value_slot = arg;
  }
  if (obj_slot != nullptr) {
    *obj_slot = new_obj;
  }
}

extern "C" void isaac_exit_40c7f0_pair_apply_base(uint8_t* pair_base,
                                                  uint32_t arg,
                                                  uint32_t new_obj) {
  if (pair_base == nullptr) {
    return;
  }
  *reinterpret_cast<uint32_t*>(pair_base + ISAAC_EXIT_40C7F0_PAIR_VALUE_OFF) =
      arg;
  *reinterpret_cast<uint32_t*>(pair_base + ISAAC_EXIT_40C7F0_PAIR_OBJ_OFF) =
      new_obj;
}

extern "C" void isaac_exit_40cc10_pure_fields(IsaacExit40cc10PureState* state) {
  if (state == nullptr) {
    return;
  }
  state->vtable = static_cast<uint32_t>(ISAAC_EXIT_40CC10_VTABLE);
  state->field_4 = static_cast<uint32_t>(ISAAC_EXIT_40CC10_FIELD4);
  state->sub_vtable = static_cast<uint32_t>(ISAAC_EXIT_40CC10_SUB_VTABLE);
  state->field_c = 0;
  state->field_10 = 0;
}

extern "C" void isaac_exit_40cc10_pure_fields_ptrs(uint32_t* vtable,
                                                   uint32_t* field_4,
                                                   uint32_t* sub_vtable,
                                                   uint8_t* field_c,
                                                   uint32_t* field_10) {
  /* PE @ 0x0040cc3c–0x0040cc53 pure stores before DAT_00b81c10 host. */
  if (vtable != nullptr) {
    *vtable = static_cast<uint32_t>(ISAAC_EXIT_40CC10_VTABLE);
  }
  if (field_4 != nullptr) {
    *field_4 = static_cast<uint32_t>(ISAAC_EXIT_40CC10_FIELD4);
  }
  if (sub_vtable != nullptr) {
    *sub_vtable = static_cast<uint32_t>(ISAAC_EXIT_40CC10_SUB_VTABLE);
  }
  if (field_c != nullptr) {
    *field_c = 0;
  }
  if (field_10 != nullptr) {
    *field_10 = 0;
  }
}

extern "C" void isaac_exit_40cc10_apply(uint8_t* obj_base) {
  if (obj_base == nullptr) {
    return;
  }
  /* PE @ 0x0040cc3c–0x0040cc53. */
  *reinterpret_cast<uint32_t*>(obj_base) =
      static_cast<uint32_t>(ISAAC_EXIT_40CC10_VTABLE);
  *reinterpret_cast<uint32_t*>(obj_base + 4) =
      static_cast<uint32_t>(ISAAC_EXIT_40CC10_FIELD4);
  *reinterpret_cast<uint32_t*>(obj_base + 8) =
      static_cast<uint32_t>(ISAAC_EXIT_40CC10_SUB_VTABLE);
  obj_base[0xc] = 0;
  *reinterpret_cast<uint32_t*>(obj_base + 0x10) = 0u;
}

extern "C" int32_t isaac_exit_40cc10_default_init_is_direct(
    uint32_t dat_b81c10) {
  /* PE @ 0x0040cc61–0x0040cc6b: cmp eax, 0xa15770; jne indirect. */
  return (dat_b81c10 ==
          static_cast<uint32_t>(ISAAC_EXIT_40CC10_DEFAULT_INIT))
             ? 1
             : 0;
}

extern "C" uint32_t isaac_exit_40cc10_default_init_va(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_40CC10_DEFAULT_INIT);
}

extern "C" uint32_t isaac_exit_40c7f0_vtable(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_40C7F0_VTABLE);
}

/* --- ABI v13: pure islands / CF inside residual host 0x00408830 --- */

extern "C" void isaac_exit_408830_store_arg(uint32_t* field4_slot,
                                            uint32_t arg) {
  /* PE @ 0x00408859–0x0040885c: mov eax,[ebp+8]; mov [esi+4], eax. */
  if (field4_slot != nullptr) {
    *field4_slot = arg;
  }
}

extern "C" void isaac_exit_408830_store_arg_apply(uint8_t* this_base,
                                                  uint32_t arg) {
  if (this_base == nullptr) {
    return;
  }
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_408830_FIELD_4_OFF) =
      arg;
}

extern "C" int32_t isaac_exit_408830_ptr_free_needed(uint32_t ptr) {
  /* PE @ 0x0040885f / 0x00408889: test edx, edx; je skip free. */
  return (ptr != 0u) ? 1 : 0;
}

extern "C" void isaac_exit_408830_ptr_clear(uint32_t* slot) {
  /* PE @ 0x0040887f / 0x004088a9: mov dword [esi+8/0xc], 0 after free. */
  if (slot != nullptr) {
    *slot = 0u;
  }
}

extern "C" int32_t isaac_exit_408830_arg_present(uint32_t arg) {
  /* PE @ 0x004088b0–0x004088ba: mov ecx,[esi+4]; test ecx; je tail. */
  return (arg != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_exit_408830_count_nonzero(uint32_t count) {
  /* PE @ 0x004088bc–0x004088c1 / 0x004088fc–0x00408901: test eax; je skip. */
  return (count != 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_408830_alloc_size(uint32_t count) {
  /* PE @ 0x004088c3–0x004088d0: mul edi (4); seto cl; neg ecx; or ecx, eax.
     Overflow → 0xffffffff (same pattern as manager poll didod size). */
  const uint64_t prod = static_cast<uint64_t>(count) *
                        static_cast<uint64_t>(ISAAC_EXIT_408830_ELEM_SIZE);
  if (prod > 0xffffffffull) {
    return 0xffffffffu;
  }
  return static_cast<uint32_t>(prod);
}

extern "C" uint32_t isaac_exit_408830_fill_size(uint32_t count) {
  /* PE @ 0x004088e3 / 0x00408923: shl ecx, 2 (no overflow check). */
  return count << 2;
}

extern "C" uint8_t isaac_exit_408830_fill_byte(void) {
  /* PE @ 0x004088e7 / 0x00408927: push 0xff before memset 0x00af05e5. */
  return static_cast<uint8_t>(ISAAC_EXIT_408830_FILL_BYTE);
}

extern "C" uint32_t isaac_exit_408830_f32_10_bits(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_408830_F32_10_BITS);
}

extern "C" void isaac_exit_408830_tail(IsaacExit408830TailState* state) {
  if (state == nullptr) {
    return;
  }
  /* PE @ 0x00408935–0x0040894e. */
  state->field_10 = static_cast<uint32_t>(ISAAC_EXIT_408830_F32_10_BITS);
  state->field_14 = 0;
  state->field_18 = 0u;
  state->field_1c = 0u;
}

extern "C" void isaac_exit_408830_tail_ptrs(uint32_t* field_10,
                                            uint8_t* field_14,
                                            uint32_t* field_18,
                                            uint32_t* field_1c) {
  if (field_10 != nullptr) {
    *field_10 = static_cast<uint32_t>(ISAAC_EXIT_408830_F32_10_BITS);
  }
  if (field_14 != nullptr) {
    *field_14 = 0;
  }
  if (field_18 != nullptr) {
    *field_18 = 0u;
  }
  if (field_1c != nullptr) {
    *field_1c = 0u;
  }
}

extern "C" void isaac_exit_408830_tail_apply(uint8_t* this_base) {
  if (this_base == nullptr) {
    return;
  }
  /* PE @ 0x00408935–0x0040894e. */
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_408830_FIELD_10_OFF) =
      static_cast<uint32_t>(ISAAC_EXIT_408830_F32_10_BITS);
  this_base[ISAAC_EXIT_408830_FIELD_14_OFF] = 0;
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_408830_FIELD_18_OFF) =
      0u;
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_408830_FIELD_1C_OFF) =
      0u;
}

/* --- ABI v14: pure islands / CF inside residual host 0x009b4810 --- */

namespace {

const uint32_t kExit9b4810BlockA[ISAAC_EXIT_9B4810_BLOCK_A_COUNT] = {
    2u, 3u, 4u, 6u, 7u, 8u, 0xfu};
const uint32_t kExit9b4810BlockB[ISAAC_EXIT_9B4810_BLOCK_B_COUNT] = {
    9u, 0xbu, 0xcu};
const uint32_t kExit9b4810BlockC[ISAAC_EXIT_9B4810_BLOCK_C_COUNT] = {0xdu};
const uint32_t kExit9b4810BlockD[ISAAC_EXIT_9B4810_BLOCK_D_COUNT] = {0xeu};
const uint32_t kExit9b4810BlockE[ISAAC_EXIT_9B4810_BLOCK_E_COUNT] = {
    0x10u, 0x11u, 0x14u};
const uint32_t kExit9b4810BlockF[ISAAC_EXIT_9B4810_BLOCK_F_COUNT] = {
    0x15u, 0x16u, 0x17u, 0x18u, 0x19u, 0x1au, 0x1bu};

uint32_t block_at(const uint32_t* table, uint32_t count, uint32_t index) {
  if (index >= count) {
    return 0u;
  }
  return table[index];
}

}  // namespace

extern "C" void isaac_exit_9b4810_vec_reset_end(uint32_t* end_slot,
                                                uint32_t begin) {
  /* PE @ 0x009b485c: mov [esi+4], eax with eax=begin. */
  if (end_slot != nullptr) {
    *end_slot = begin;
  }
}

extern "C" void isaac_exit_9b4810_vec_reset_end_apply(uint8_t* this_base) {
  if (this_base == nullptr) {
    return;
  }
  const uint32_t begin = *reinterpret_cast<const uint32_t*>(
      this_base + ISAAC_EXIT_9B4810_VEC_BEGIN_OFF);
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_9B4810_VEC_END_OFF) =
      begin;
}

extern "C" uint32_t isaac_exit_9b4810_first_push_value(uint32_t mode) {
  /* PE @ 0x009b485f–0x009b486a: test/cmp → 0 when mode==0 or mode==3. */
  if (mode == 0u || mode == 3u) {
    return 0u;
  }
  return 1u;
}

extern "C" int32_t isaac_exit_9b4810_mode_is_3(uint32_t mode) {
  return (mode == 3u) ? 1 : 0;
}

extern "C" int32_t isaac_exit_9b4810_mode_is_1(uint32_t mode) {
  return (mode == 1u) ? 1 : 0;
}

extern "C" int32_t isaac_exit_9b4810_mode_layer_path(uint32_t mode) {
  /* PE @ 0x009b4d1a–0x009b4d22: mode==1 or mode==2. */
  return (mode == 1u || mode == 2u) ? 1 : 0;
}

extern "C" int32_t isaac_exit_9b4810_mode_block_a_needed(uint32_t mode) {
  return (mode != 3u) ? 1 : 0;
}

extern "C" int32_t isaac_exit_9b4810_mode_block_c_needed(uint32_t mode) {
  return (mode != 3u) ? 1 : 0;
}

extern "C" int32_t isaac_exit_9b4810_mode_block_e_needed(uint32_t mode) {
  return (mode != 3u) ? 1 : 0;
}

extern "C" int32_t isaac_exit_9b4810_mode_block_f_needed(uint32_t mode) {
  return (mode != 1u) ? 1 : 0;
}

extern "C" int32_t isaac_exit_9b4810_vec_space(uint32_t end, uint32_t cap) {
  /* PE: cmp end, cap; je grow. Pure push when unequal. */
  return (end != cap) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_9b4810_vec_end_after_push(uint32_t end) {
  return end + static_cast<uint32_t>(ISAAC_EXIT_9B4810_ELEM_SIZE);
}

extern "C" void isaac_exit_9b4810_vec_store(uint32_t* elem_slot,
                                            uint32_t value) {
  if (elem_slot != nullptr) {
    *elem_slot = value;
  }
}

extern "C" uint32_t isaac_exit_9b4810_vec_push_pure(uint32_t* end_slot,
                                                   uint32_t* elem_slot,
                                                   uint32_t end,
                                                   uint32_t value) {
  /* PE pure path: mov [end], value; add end, 4. Freestanding: elem_slot
     is the storage for *end (caller maps guest end → slot). */
  if (elem_slot != nullptr) {
    *elem_slot = value;
  }
  const uint32_t neu =
      end + static_cast<uint32_t>(ISAAC_EXIT_9B4810_ELEM_SIZE);
  if (end_slot != nullptr) {
    *end_slot = neu;
  }
  return neu;
}

extern "C" int32_t isaac_exit_9b4810_vec_push_apply(uint8_t* this_base,
                                                    uint8_t* arena_base,
                                                    uint32_t value) {
  if (this_base == nullptr || arena_base == nullptr) {
    return 0;
  }
  const uint32_t end = *reinterpret_cast<const uint32_t*>(
      this_base + ISAAC_EXIT_9B4810_VEC_END_OFF);
  const uint32_t cap = *reinterpret_cast<const uint32_t*>(
      this_base + ISAAC_EXIT_9B4810_VEC_CAP_OFF);
  if (end == cap) {
    return 0; /* host grow 0x00428590 */
  }
  /* Freestanding address model: begin/end/cap are offsets into arena. */
  *reinterpret_cast<uint32_t*>(arena_base + end) = value;
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_9B4810_VEC_END_OFF) =
      end + static_cast<uint32_t>(ISAAC_EXIT_9B4810_ELEM_SIZE);
  return 1;
}

extern "C" uint32_t isaac_exit_9b4810_block_a_count(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_9B4810_BLOCK_A_COUNT);
}
extern "C" uint32_t isaac_exit_9b4810_block_a_at(uint32_t index) {
  return block_at(kExit9b4810BlockA, ISAAC_EXIT_9B4810_BLOCK_A_COUNT, index);
}
extern "C" uint32_t isaac_exit_9b4810_block_b_count(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_9B4810_BLOCK_B_COUNT);
}
extern "C" uint32_t isaac_exit_9b4810_block_b_at(uint32_t index) {
  return block_at(kExit9b4810BlockB, ISAAC_EXIT_9B4810_BLOCK_B_COUNT, index);
}
extern "C" uint32_t isaac_exit_9b4810_block_c_count(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_9B4810_BLOCK_C_COUNT);
}
extern "C" uint32_t isaac_exit_9b4810_block_c_at(uint32_t index) {
  return block_at(kExit9b4810BlockC, ISAAC_EXIT_9B4810_BLOCK_C_COUNT, index);
}
extern "C" uint32_t isaac_exit_9b4810_block_d_count(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_9B4810_BLOCK_D_COUNT);
}
extern "C" uint32_t isaac_exit_9b4810_block_d_at(uint32_t index) {
  return block_at(kExit9b4810BlockD, ISAAC_EXIT_9B4810_BLOCK_D_COUNT, index);
}
extern "C" uint32_t isaac_exit_9b4810_block_e_count(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_9B4810_BLOCK_E_COUNT);
}
extern "C" uint32_t isaac_exit_9b4810_block_e_at(uint32_t index) {
  return block_at(kExit9b4810BlockE, ISAAC_EXIT_9B4810_BLOCK_E_COUNT, index);
}
extern "C" uint32_t isaac_exit_9b4810_block_f_count(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_9B4810_BLOCK_F_COUNT);
}
extern "C" uint32_t isaac_exit_9b4810_block_f_at(uint32_t index) {
  return block_at(kExit9b4810BlockF, ISAAC_EXIT_9B4810_BLOCK_F_COUNT, index);
}
extern "C" uint32_t isaac_exit_9b4810_value_1c(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_9B4810_VALUE_1C);
}

extern "C" int32_t isaac_exit_9b4810_push_1c_needed(
    uint32_t selected_flag_2b9_in, uint32_t manager_field8, uint32_t game_ptr_null_in,
    uint32_t game_26630, uint32_t game_26589_in) {
  const uint8_t selected_flag_2b9 = static_cast<uint8_t>(selected_flag_2b9_in & 0xffu);
  const uint8_t game_ptr_null = static_cast<uint8_t>(game_ptr_null_in & 0xffu);
  const uint8_t game_26589 = static_cast<uint8_t>(game_26589_in & 0xffu);
  /* PE @ 0x009b4a07–0x009b4a2f (after host-selected object). */
  if (selected_flag_2b9 != 0) {
    return 1;
  }
  if (manager_field8 != 2u) {
    return 0;
  }
  if (game_ptr_null != 0) {
    return 0;
  }
  if (game_26630 > 0u) {
    return 1;
  }
  return (game_26589 != 0) ? 1 : 0;
}

extern "C" int32_t isaac_exit_9b4810_layer_loop_needed(int32_t layer_count) {
  /* PE @ 0x009b4d30–0x009b4d32: test eax; jle skip (signed). */
  return (layer_count > 0) ? 1 : 0;
}

extern "C" int32_t isaac_exit_9b4810_counter_play_needed(uint32_t str_null_in,
                                                         uint32_t strcmp_eq_in,
                                                         uint32_t anim_flag_34_in,
                                                         uint32_t this_17c_in) {
  const uint8_t str_null = static_cast<uint8_t>(str_null_in & 0xffu);
  const uint8_t strcmp_eq = static_cast<uint8_t>(strcmp_eq_in & 0xffu);
  const uint8_t anim_flag_34 = static_cast<uint8_t>(anim_flag_34_in & 0xffu);
  const uint8_t this_17c = static_cast<uint8_t>(this_17c_in & 0xffu);
  /* PE @ 0x009b4f23–0x009b4f7c. */
  if (str_null != 0) {
    return 1;
  }
  if (strcmp_eq == 0) {
    return 1; /* strcmp != 0 → play */
  }
  /* Counter match (strcmp_eq): skip play when flag_34==0 or this_17c!=0. */
  if (anim_flag_34 == 0) {
    return 0;
  }
  if (this_17c != 0) {
    return 0;
  }
  return 1;
}

extern "C" void isaac_exit_9b4810_play_flag_set(uint8_t* flag_slot) {
  /* PE @ 0x009b4f9e: mov byte [esi+0x44], 1. */
  if (flag_slot != nullptr) {
    *flag_slot = static_cast<uint8_t>(ISAAC_EXIT_9B4810_PLAY_FLAG_VALUE);
  }
}

extern "C" void isaac_exit_9b4810_play_flag_apply(uint8_t* this_base) {
  if (this_base == nullptr) {
    return;
  }
  this_base[ISAAC_EXIT_9B4810_ANM2_138_OFF + ISAAC_EXIT_9B4810_PLAY_FLAG_OFF] =
      static_cast<uint8_t>(ISAAC_EXIT_9B4810_PLAY_FLAG_VALUE);
}

extern "C" void isaac_exit_9b4810_tail(IsaacExit9b4810TailState* state,
                                       uint32_t field_c, uint32_t field_10,
                                       uint32_t g_c7b640, uint32_t g_c7b644) {
  if (state == nullptr) {
    return;
  }
  /* PE @ 0x009b4fa2–0x009b4fee. Dead store this+0x20=0 before float. */
  state->field_4 = 0;
  state->field_8 = 0u;
  state->field_14 = field_c;
  state->field_18 = field_10;
  /* PE @ 0x009b4fc0/0x009b4fcd: movss from the two runtime globals. */
  state->field_1c = g_c7b640;
  state->field_20 = g_c7b644;
  state->field_24c = 0u;
  state->field_250 = 0u;
  state->field_254 = 0u;
}

extern "C" void isaac_exit_9b4810_tail_ptrs(
    uint8_t* field_4, uint32_t* field_8, uint32_t* field_14,
    uint32_t* field_18, uint32_t* field_1c, uint32_t* field_20,
    uint32_t* field_24c, uint32_t* field_250, uint32_t* field_254,
    uint32_t field_c, uint32_t field_10, uint32_t g_c7b640,
    uint32_t g_c7b644) {
  IsaacExit9b4810TailState t{};
  isaac_exit_9b4810_tail(&t, field_c, field_10, g_c7b640, g_c7b644);
  if (field_4 != nullptr) {
    *field_4 = t.field_4;
  }
  if (field_8 != nullptr) {
    *field_8 = t.field_8;
  }
  if (field_14 != nullptr) {
    *field_14 = t.field_14;
  }
  if (field_18 != nullptr) {
    *field_18 = t.field_18;
  }
  if (field_1c != nullptr) {
    *field_1c = t.field_1c;
  }
  if (field_20 != nullptr) {
    *field_20 = t.field_20;
  }
  if (field_24c != nullptr) {
    *field_24c = t.field_24c;
  }
  if (field_250 != nullptr) {
    *field_250 = t.field_250;
  }
  if (field_254 != nullptr) {
    *field_254 = t.field_254;
  }
}

extern "C" void isaac_exit_9b4810_tail_apply(uint8_t* this_base,
                                             uint32_t g_c7b640,
                                             uint32_t g_c7b644) {
  if (this_base == nullptr) {
    return;
  }
  const uint32_t field_c = *reinterpret_cast<const uint32_t*>(
      this_base + ISAAC_EXIT_9B4810_FIELD_C_OFF);
  const uint32_t field_10 = *reinterpret_cast<const uint32_t*>(
      this_base + ISAAC_EXIT_9B4810_FIELD_10_OFF);
  IsaacExit9b4810TailState t{};
  isaac_exit_9b4810_tail(&t, field_c, field_10, g_c7b640, g_c7b644);
  this_base[ISAAC_EXIT_9B4810_FIELD_4_OFF] = t.field_4;
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_9B4810_FIELD_8_OFF) =
      t.field_8;
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_9B4810_FIELD_14_OFF) =
      t.field_14;
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_9B4810_FIELD_18_OFF) =
      t.field_18;
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_9B4810_FIELD_1C_OFF) =
      t.field_1c;
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_9B4810_FIELD_20_OFF) =
      t.field_20;
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_9B4810_FIELD_24C_OFF) =
      t.field_24c;
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_9B4810_FIELD_250_OFF) =
      t.field_250;
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_9B4810_FIELD_254_OFF) =
      t.field_254;
}

extern "C" uint32_t isaac_exit_f32_global_c7b640_addr(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_F32_GLOBAL_C7B640_ADDR);
}

extern "C" uint32_t isaac_exit_f32_global_c7b644_addr(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_F32_GLOBAL_C7B644_ADDR);
}

/* --- ABI v15: pure size/cap CF inside residual grow 0x00428590 --- */

namespace {

/* PE uses SAR after sub for dword element counts. */
inline uint32_t sar32_div4(uint32_t lo, uint32_t hi_subtrahend) {
  const int32_t diff = static_cast<int32_t>(lo - hi_subtrahend);
  return static_cast<uint32_t>(diff >> 2);
}

}  // namespace

extern "C" uint32_t isaac_exit_428590_elem_count(uint32_t begin, uint32_t end) {
  /* PE @ 0x004285a2–0x004285aa: sub eax,edx; sar eax,2 with eax=end. */
  return sar32_div4(end, begin);
}

extern "C" uint32_t isaac_exit_428590_capacity_elems(uint32_t begin,
                                                     uint32_t cap) {
  /* PE @ 0x004285b8–0x004285c3: sub ecx,edx; sar ecx,2 with ecx=cap. */
  return sar32_div4(cap, begin);
}

extern "C" uint32_t isaac_exit_428590_insert_index(uint32_t begin,
                                                   uint32_t insert_pos) {
  /* PE @ 0x0042859b–0x004285a7: sub edi,edx; sar edi,2. */
  return sar32_div4(insert_pos, begin);
}

extern "C" uint32_t isaac_exit_428590_max_elems(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_428590_MAX_ELEMS);
}

extern "C" int32_t isaac_exit_428590_length_error_needed(uint32_t size) {
  /* PE @ 0x004285ad–0x004285b2: cmp eax, 0x3fffffff; je throw 0x415bc0. */
  return (size == static_cast<uint32_t>(ISAAC_EXIT_428590_MAX_ELEMS)) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_428590_needed_size(uint32_t size) {
  /* PE: lea ebx, [eax+1]. */
  return size + 1u;
}

extern "C" int32_t isaac_exit_428590_geo_would_overflow(uint32_t capacity) {
  /* PE @ 0x004285c6–0x004285d3:
       mov eax, 0x3fffffff; mov edx, ecx; shr edx, 1; sub eax, edx;
       cmp ecx, eax; jbe geometric_path.
     Overflow path when capacity > MAX - (capacity>>1). */
  const uint32_t half = capacity >> 1;
  const uint32_t limit =
      static_cast<uint32_t>(ISAAC_EXIT_428590_MAX_ELEMS) - half;
  return (capacity > limit) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_428590_geometric_capacity(uint32_t capacity) {
  /* PE @ 0x00428618: lea eax, [edx+ecx] with edx=cap>>1, ecx=cap. */
  return capacity + (capacity >> 1);
}

extern "C" uint32_t isaac_exit_428590_new_capacity(uint32_t capacity,
                                                   uint32_t needed) {
  /* PE geometric / max-path select (assumes !length_error). */
  if (isaac_exit_428590_geo_would_overflow(capacity) != 0) {
    return static_cast<uint32_t>(ISAAC_EXIT_428590_MAX_ELEMS);
  }
  const uint32_t geo = isaac_exit_428590_geometric_capacity(capacity);
  /* PE: cmp eax, ebx; cmovae ecx, eax  → max(geo, needed). */
  return (geo >= needed) ? geo : needed;
}

extern "C" int32_t isaac_exit_428590_capacity_error_needed(
    uint32_t new_capacity) {
  /* PE @ 0x00428622–0x00428628: cmp ecx, 0x3fffffff; ja throw 0x40cee0. */
  return (new_capacity >
          static_cast<uint32_t>(ISAAC_EXIT_428590_MAX_ELEMS))
             ? 1
             : 0;
}

extern "C" uint32_t isaac_exit_428590_alloc_bytes(uint32_t new_capacity) {
  /* PE @ 0x004285da: lea eax, [ecx*4]. Host 0x40cf00(eax). */
  return new_capacity * static_cast<uint32_t>(ISAAC_EXIT_428590_ELEM_SIZE);
}

extern "C" uint32_t isaac_exit_428590_insert_slot(uint32_t new_begin,
                                                  uint32_t insert_index) {
  /* PE @ 0x004285f0: lea eax, [ebx+edi*4]. */
  return new_begin +
         insert_index * static_cast<uint32_t>(ISAAC_EXIT_428590_ELEM_SIZE);
}

extern "C" uint32_t isaac_exit_428590_new_end(uint32_t new_begin,
                                              uint32_t needed) {
  /* PE @ 0x00428685: lea ecx, [ebx+eax*4] with eax=needed; [esi+4]=ecx. */
  return new_begin +
         needed * static_cast<uint32_t>(ISAAC_EXIT_428590_ELEM_SIZE);
}

extern "C" uint32_t isaac_exit_428590_new_cap_ptr(uint32_t new_begin,
                                                  uint32_t alloc_bytes) {
  /* PE @ 0x0042868d–0x00428693: add ecx, ebx; [esi+8]=ecx. */
  return new_begin + alloc_bytes;
}

extern "C" int32_t isaac_exit_428590_insert_at_end(uint32_t insert_pos,
                                                   uint32_t end) {
  /* PE @ 0x00428602: cmp edi, eax; jne mid-insert. */
  return (insert_pos == end) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_428590_copy_prefix_bytes(uint32_t begin,
                                                        uint32_t insert_pos) {
  /* PE mid-insert: sub eax, ecx with eax=insert_pos, ecx=begin. */
  return insert_pos - begin;
}

extern "C" uint32_t isaac_exit_428590_copy_suffix_bytes(uint32_t end,
                                                        uint32_t insert_pos) {
  /* PE mid-insert: sub eax, edi with eax=end, edi=insert_pos. */
  return end - insert_pos;
}

extern "C" uint32_t isaac_exit_428590_copy_all_bytes(uint32_t begin,
                                                     uint32_t end) {
  /* PE append: sub eax, ecx with eax=end, ecx=begin. */
  return end - begin;
}

extern "C" int32_t isaac_exit_428590_old_free_needed(uint32_t begin) {
  /* PE @ 0x00428650: test eax, eax; je skip free. */
  return (begin != 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_428590_old_capacity_bytes(uint32_t begin,
                                                         uint32_t cap) {
  /* PE @ 0x00428654–0x00428659: sub ecx, eax; and ecx, 0xfffffffc. */
  return (cap - begin) & 0xfffffffcu;
}

extern "C" int32_t isaac_exit_428590_free_uses_heap_header(
    uint32_t capacity_bytes) {
  /* PE @ 0x0042865c–0x00428662: cmp ecx, 0x1000; jb simple free. */
  return (capacity_bytes >=
          static_cast<uint32_t>(ISAAC_EXIT_428590_FREE_HEADER_THRESHOLD))
             ? 1
             : 0;
}

extern "C" uint32_t isaac_exit_428590_free_header_size(
    uint32_t capacity_bytes) {
  /* PE @ 0x00428667: add ecx, 0x23. */
  return capacity_bytes +
         static_cast<uint32_t>(ISAAC_EXIT_428590_FREE_HEADER_ADD);
}

extern "C" int32_t isaac_exit_428590_free_header_offset_ok(uint32_t begin,
                                                           uint32_t header) {
  /* PE @ 0x0042866a–0x00428672: sub eax,edx; add eax,-4; cmp eax,0x1f; ja
     abort. Continue free when offset <= 0x1f (unsigned jbe). */
  const uint32_t off = (begin - header) - 4u;
  return (off <=
          static_cast<uint32_t>(ISAAC_EXIT_428590_FREE_HEADER_OFFSET_MAX))
             ? 1
             : 0;
}

extern "C" void isaac_exit_428590_plan(IsaacExit428590Plan* out,
                                       uint32_t begin, uint32_t end,
                                       uint32_t cap, uint32_t insert_pos) {
  if (out == nullptr) {
    return;
  }
  const uint32_t size = isaac_exit_428590_elem_count(begin, end);
  const uint32_t capacity = isaac_exit_428590_capacity_elems(begin, cap);
  const uint32_t insert_index =
      isaac_exit_428590_insert_index(begin, insert_pos);
  const int32_t length_error = isaac_exit_428590_length_error_needed(size);
  const uint32_t needed = isaac_exit_428590_needed_size(size);
  const int32_t geo_overflow = isaac_exit_428590_geo_would_overflow(capacity);
  uint32_t new_cap = 0u;
  int32_t capacity_error = 0;
  if (length_error == 0) {
    new_cap = isaac_exit_428590_new_capacity(capacity, needed);
    capacity_error = isaac_exit_428590_capacity_error_needed(new_cap);
  }
  out->size = size;
  out->capacity = capacity;
  out->insert_index = insert_index;
  out->needed = needed;
  out->new_capacity = new_cap;
  out->alloc_bytes =
      (length_error == 0 && capacity_error == 0)
          ? isaac_exit_428590_alloc_bytes(new_cap)
          : 0u;
  out->length_error = length_error;
  out->capacity_error = capacity_error;
  out->geo_overflow = geo_overflow;
  out->insert_at_end = isaac_exit_428590_insert_at_end(insert_pos, end);
}

extern "C" void isaac_exit_428590_post_alloc_ptrs(
    uint32_t new_begin, uint32_t needed, uint32_t alloc_bytes,
    uint32_t insert_index, uint32_t* out_end, uint32_t* out_cap,
    uint32_t* out_insert_slot) {
  if (out_end != nullptr) {
    *out_end = isaac_exit_428590_new_end(new_begin, needed);
  }
  if (out_cap != nullptr) {
    *out_cap = isaac_exit_428590_new_cap_ptr(new_begin, alloc_bytes);
  }
  if (out_insert_slot != nullptr) {
    *out_insert_slot = isaac_exit_428590_insert_slot(new_begin, insert_index);
  }
}

/* --- ABI v16: ANM2::GetLayer(int) / ANM2::Load / alloc 0x40cf00 pure CF --- */

namespace {

/* PE-inline null-terminated equality used by ANM2 Load shadow compare
   (0x0040be00–0x0040be25): two-byte steps; equal → 1, else → 0. */
inline int32_t cstr_equal_pe(const uint8_t* a, const uint8_t* b) {
  if (a == nullptr || b == nullptr) {
    return (a == b) ? 1 : 0;
  }
  const uint8_t* pa = a;
  const uint8_t* pb = b;
  for (;;) {
    const uint8_t d0 = *pa;
    if (d0 != *pb) {
      return 0;
    }
    if (d0 == 0) {
      return 1;
    }
    const uint8_t d1 = pa[1];
    if (d1 != pb[1]) {
      return 0;
    }
    pa += 2;
    pb += 2;
    if (d1 == 0) {
      return 1;
    }
  }
}

/* Fixed DAT_00b1a6c0 "shadow" (hash-bound). */
constexpr char kAnm2ShadowName[] = "shadow";

}  // namespace

extern "C" uint32_t isaac_exit_anm2_layer_stride(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_ANM2_LAYER_STRIDE);
}

extern "C" int32_t isaac_exit_anm2_getlayer_in_range(int32_t layer_id,
                                                     int32_t count) {
  /* PE @ 0x0040b24a–0x0040b254: test esi; js OOB; cmp esi,[edi+0x80]; jl ok. */
  return (layer_id >= 0 && layer_id < count) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_anm2_layer_ptr(uint32_t layer_base,
                                              int32_t layer_id) {
  /* PE @ 0x0040b27d–0x0040b283: lea eax,[esi+esi*4]; shl eax,5; add [edi+0x7c]. */
  const uint32_t id = static_cast<uint32_t>(layer_id);
  return layer_base + id * static_cast<uint32_t>(ISAAC_EXIT_ANM2_LAYER_STRIDE);
}

extern "C" int32_t isaac_exit_anm2_getlayer_try(uint32_t layer_base,
                                                int32_t layer_id,
                                                int32_t count,
                                                uint32_t* out_layer) {
  if (isaac_exit_anm2_getlayer_in_range(layer_id, count) == 0) {
    return 0;
  }
  if (out_layer != nullptr) {
    *out_layer = isaac_exit_anm2_layer_ptr(layer_base, layer_id);
  }
  return 1;
}

extern "C" uint32_t isaac_exit_anm2_getlayer_apply(const uint8_t* anm2_base,
                                                   int32_t layer_id) {
  if (anm2_base == nullptr) {
    return 0;
  }
  const int32_t count = *reinterpret_cast<const int32_t*>(
      anm2_base + ISAAC_EXIT_ANM2_LAYER_COUNT_OFF);
  if (isaac_exit_anm2_getlayer_in_range(layer_id, count) == 0) {
    return 0;
  }
  const uint32_t base = *reinterpret_cast<const uint32_t*>(
      anm2_base + ISAAC_EXIT_ANM2_LAYER_BASE_OFF);
  return isaac_exit_anm2_layer_ptr(base, layer_id);
}

extern "C" int32_t isaac_exit_anm2_load_path_present(uint32_t path_size_10) {
  /* PE @ 0x0040bd59: cmp dword [esi+0x10], 0; je skip host 0x40e2b0. */
  return (path_size_10 != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_exit_anm2_load_path_is_self(uint32_t this_addr,
                                                     uint32_t path_addr) {
  /* PE @ 0x0040bd68: cmp esi, edi; je skip string assign. */
  return (this_addr == path_addr) ? 1 : 0;
}

extern "C" int32_t isaac_exit_anm2_load_graphics_needed(uint32_t loadgraphics_in) {
  const uint8_t loadgraphics = static_cast<uint8_t>(loadgraphics_in & 0xffu);
  /* PE @ 0x0040bd8e: cmp byte [ebp+0xc], 0; je skip host 0x40c000. */
  return (loadgraphics != 0) ? 1 : 0;
}

extern "C" void isaac_exit_anm2_load_prefix(
    IsaacExitAnm2LoadPrefixState* state) {
  if (state == nullptr) {
    return;
  }
  state->flag_109 =
      static_cast<uint8_t>(ISAAC_EXIT_ANM2_LOAD_FLAG_109_VALUE);
  state->shadow_index_10c =
      static_cast<uint32_t>(ISAAC_EXIT_ANM2_SHADOW_INDEX_INIT);
}

extern "C" void isaac_exit_anm2_load_prefix_ptrs(uint8_t* flag_109,
                                                 uint32_t* shadow_index_10c) {
  IsaacExitAnm2LoadPrefixState st{};
  isaac_exit_anm2_load_prefix(&st);
  if (flag_109 != nullptr) {
    *flag_109 = st.flag_109;
  }
  if (shadow_index_10c != nullptr) {
    *shadow_index_10c = st.shadow_index_10c;
  }
}

extern "C" void isaac_exit_anm2_load_prefix_apply(uint8_t* anm2_base) {
  if (anm2_base == nullptr) {
    return;
  }
  anm2_base[ISAAC_EXIT_ANM2_LOAD_FLAG_109_OFF] =
      static_cast<uint8_t>(ISAAC_EXIT_ANM2_LOAD_FLAG_109_VALUE);
  *reinterpret_cast<uint32_t*>(anm2_base + ISAAC_EXIT_ANM2_SHADOW_INDEX_OFF) =
      static_cast<uint32_t>(ISAAC_EXIT_ANM2_SHADOW_INDEX_INIT);
}

extern "C" int32_t isaac_exit_anm2_layer_loop_needed(uint32_t layer_count) {
  /* PE @ 0x0040bdc3: cmp [esi+0x80], ebx(0); jbe skip. */
  return (layer_count != 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_anm2_layer_byte_off(uint32_t index) {
  return index * static_cast<uint32_t>(ISAAC_EXIT_ANM2_LAYER_STRIDE);
}

extern "C" int32_t isaac_exit_anm2_layer_name_holder_null(uint32_t holder_ptr) {
  /* PE @ 0x0040bdde: test edi, edi; je empty string. */
  return (holder_ptr == 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_anm2_layer_name_str_addr(uint32_t holder_ptr) {
  /* PE @ 0x0040bde2: add edi, 8. */
  return holder_ptr +
         static_cast<uint32_t>(ISAAC_EXIT_ANM2_LAYER_NAME_STR_DELTA);
}

extern "C" int32_t isaac_exit_anm2_cstr_equal(const uint8_t* a,
                                              const uint8_t* b) {
  return cstr_equal_pe(a, b);
}

extern "C" int32_t isaac_exit_anm2_name_is_shadow(const uint8_t* name) {
  return cstr_equal_pe(name, reinterpret_cast<const uint8_t*>(kAnm2ShadowName));
}

extern "C" int32_t isaac_exit_anm2_name_is_star(uint32_t first_byte_in) {
  const uint8_t first_byte = static_cast<uint8_t>(first_byte_in & 0xffu);
  /* PE @ 0x0040be31: cmp byte [edi], 0x2a. */
  return (first_byte ==
          static_cast<uint8_t>(ISAAC_EXIT_ANM2_STAR_BYTE))
             ? 1
             : 0;
}

extern "C" void isaac_exit_anm2_shadow_index_set(uint32_t* slot,
                                                 uint32_t index) {
  if (slot != nullptr) {
    *slot = index;
  }
}

extern "C" void isaac_exit_anm2_layer_star_flags_or(uint32_t* flags_slot) {
  if (flags_slot != nullptr) {
    *flags_slot |= static_cast<uint32_t>(ISAAC_EXIT_ANM2_LAYER_STAR_OR);
  }
}

extern "C" uint32_t isaac_exit_anm2_layer_star_flags_value(uint32_t flags) {
  return flags | static_cast<uint32_t>(ISAAC_EXIT_ANM2_LAYER_STAR_OR);
}

extern "C" void isaac_exit_anm2_flags110_or_400(uint32_t* flags_slot) {
  if (flags_slot != nullptr) {
    *flags_slot |= static_cast<uint32_t>(ISAAC_EXIT_ANM2_STAR_GLOBAL_OR_400);
  }
}

extern "C" void isaac_exit_anm2_flags110_or_800(uint32_t* flags_slot) {
  if (flags_slot != nullptr) {
    *flags_slot |= static_cast<uint32_t>(ISAAC_EXIT_ANM2_STAR_GLOBAL_OR_800);
  }
}

extern "C" uint32_t isaac_exit_anm2_flags110_or_400_value(uint32_t flags) {
  return flags | static_cast<uint32_t>(ISAAC_EXIT_ANM2_STAR_GLOBAL_OR_400);
}

extern "C" uint32_t isaac_exit_anm2_flags110_or_800_value(uint32_t flags) {
  return flags | static_cast<uint32_t>(ISAAC_EXIT_ANM2_STAR_GLOBAL_OR_800);
}

extern "C" int32_t isaac_exit_anm2_load_layer_step(
    const uint8_t* name, uint32_t index, uint32_t* shadow_index_slot,
    uint32_t* layer_star_flags_slot, uint32_t* flags110_slot) {
  /* Empty name when null (PE empty-string path). */
  static const uint8_t kEmpty[] = {0};
  const uint8_t* n = (name != nullptr) ? name : kEmpty;
  if (isaac_exit_anm2_name_is_shadow(n) != 0) {
    isaac_exit_anm2_shadow_index_set(shadow_index_slot, index);
    return 1;
  }
  if (isaac_exit_anm2_name_is_star(n[0]) != 0) {
    isaac_exit_anm2_layer_star_flags_or(layer_star_flags_slot);
    isaac_exit_anm2_flags110_or_400(flags110_slot);
  }
  return 0;
}

extern "C" int32_t isaac_exit_anm2_sheet_loop_needed(uint32_t sheet_count) {
  /* PE @ 0x0040be69: test edx, edx; je skip. */
  return (sheet_count != 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_anm2_sheet_stride(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_ANM2_SHEET_STRIDE);
}

extern "C" uint32_t isaac_exit_anm2_sheet_ptr(uint32_t sheet_base,
                                              uint32_t index) {
  return sheet_base +
         index * static_cast<uint32_t>(ISAAC_EXIT_ANM2_SHEET_STRIDE);
}

extern "C" void isaac_exit_anm2_load_sheet_step(const uint8_t* name,
                                                uint32_t* flags110_slot) {
  static const uint8_t kEmpty[] = {0};
  const uint8_t* n = (name != nullptr) ? name : kEmpty;
  if (isaac_exit_anm2_name_is_star(n[0]) != 0) {
    isaac_exit_anm2_flags110_or_800(flags110_slot);
  }
}

extern "C" int32_t isaac_exit_40cf00_uses_heap_header(uint32_t size) {
  /* PE @ 0x0040cf01: cmp ecx, 0x1000; jb small. */
  return (size >= static_cast<uint32_t>(ISAAC_EXIT_40CF00_HEADER_THRESHOLD))
             ? 1
             : 0;
}

extern "C" int32_t isaac_exit_40cf00_size_is_zero(uint32_t size) {
  /* PE @ 0x0040cf30: test ecx, ecx; je return 0. */
  return (size == 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_40cf00_header_request_size(uint32_t size) {
  /* PE @ 0x0040cf09: lea eax, [ecx+0x23]. */
  return size + static_cast<uint32_t>(ISAAC_EXIT_40CF00_HEADER_ADD);
}

extern "C" int32_t isaac_exit_40cf00_header_overflow(uint32_t size) {
  /* PE @ 0x0040cf0c: cmp eax, ecx; jbe throw 0x40cee0. */
  const uint32_t req = isaac_exit_40cf00_header_request_size(size);
  return (req <= size) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_40cf00_alloc_request_size(uint32_t size) {
  if (isaac_exit_40cf00_uses_heap_header(size) != 0) {
    if (isaac_exit_40cf00_header_overflow(size) != 0) {
      return 0;
    }
    return isaac_exit_40cf00_header_request_size(size);
  }
  /* Small path: host gets size (caller skips when size==0). */
  return size;
}

extern "C" uint32_t isaac_exit_40cf00_align_user_ptr(uint32_t raw_ptr) {
  /* PE @ 0x0040cf1f–0x0040cf22: lea eax,[ecx+0x23]; and eax, 0xffffffe0. */
  return (raw_ptr + static_cast<uint32_t>(ISAAC_EXIT_40CF00_HEADER_ADD)) &
         static_cast<uint32_t>(ISAAC_EXIT_40CF00_ALIGN_MASK);
}

extern "C" uint32_t isaac_exit_40cf00_header_slot(uint32_t aligned_user_ptr) {
  /* PE @ 0x0040cf25: mov dword [eax-4], ecx. */
  return aligned_user_ptr - 4u;
}

extern "C" void isaac_exit_40cf00_plan(IsaacExit40cf00Plan* out, uint32_t size) {
  if (out == nullptr) {
    return;
  }
  const int32_t uses_header = isaac_exit_40cf00_uses_heap_header(size);
  const int32_t size_zero = isaac_exit_40cf00_size_is_zero(size);
  int32_t overflow = 0;
  if (uses_header != 0) {
    overflow = isaac_exit_40cf00_header_overflow(size);
  }
  out->size = size;
  out->uses_header = uses_header;
  out->size_zero = size_zero;
  out->overflow = overflow;
  out->skip_alloc = (size_zero != 0 || overflow != 0) ? 1 : 0;
  out->request_size =
      (out->skip_alloc != 0) ? 0u : isaac_exit_40cf00_alloc_request_size(size);
}

extern "C" uint32_t isaac_exit_40cf00_finish_header(uint32_t* header_slot,
                                                    uint32_t raw_ptr) {
  if (raw_ptr == 0u) {
    return 0;
  }
  const uint32_t aligned = isaac_exit_40cf00_align_user_ptr(raw_ptr);
  if (header_slot != nullptr) {
    *header_slot = raw_ptr;
  }
  return aligned;
}

/* --- ABI v17: ANM2::ReplaceSpritesheet / Play path 0x40a5d0 pure CF --- */

extern "C" uint32_t isaac_exit_anm2_layer_png_str_off(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_ANM2_LAYER_PNG_STR_OFF);
}

extern "C" uint32_t isaac_exit_anm2_layer_flag30_off(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_ANM2_LAYER_FLAG30_OFF);
}

extern "C" uint32_t isaac_exit_anm2_layer_png_str_ptr(uint32_t layer_ptr) {
  /* PE @ 0x0040bf61–0x0040bf64: lea edi, [eax+8]; add edi, ecx. */
  return layer_ptr + static_cast<uint32_t>(ISAAC_EXIT_ANM2_LAYER_PNG_STR_OFF);
}

extern "C" int32_t isaac_exit_anm2_sized_equal(const uint8_t* a, uint32_t len_a,
                                               const uint8_t* b,
                                               uint32_t len_b) {
  /* Exact PE 0x0040cae0: size mismatch → false; else memcmp-of-size → bool.
     Used as ecx=a/edx=len_a, stack b/len_b from ReplaceSpritesheet. */
  if (len_a != len_b) {
    return 0;
  }
  if (len_a == 0u) {
    return 1;
  }
  if (a == nullptr || b == nullptr) {
    return (a == b) ? 1 : 0;
  }
  for (uint32_t i = 0; i < len_a; ++i) {
    if (a[i] != b[i]) {
      return 0;
    }
  }
  return 1;
}

extern "C" int32_t isaac_exit_anm2_replace_assign_needed(uint32_t png_str_addr,
                                                         uint32_t path_addr) {
  /* PE @ 0x0040bf93: cmp edi, esi; je skip host 0x40ccd0. */
  return (png_str_addr != path_addr) ? 1 : 0;
}

extern "C" void isaac_exit_anm2_replace_flag30_clear(uint8_t* flag30) {
  /* PE @ 0x0040bfb3 / 0x0040bfc9: mov byte [layer+0x30], 0. */
  if (flag30 != nullptr) {
    *flag30 = 0;
  }
}

extern "C" void isaac_exit_anm2_replace_plan(
    IsaacExitAnm2ReplacePlan* out, int32_t layer_id, int32_t count,
    uint32_t layer_base, uint32_t path_addr, const uint8_t* layer_data,
    uint32_t layer_size, const uint8_t* path_data, uint32_t path_size) {
  if (out == nullptr) {
    return;
  }
  const int32_t in_range =
      isaac_exit_anm2_getlayer_in_range(layer_id, count);
  uint32_t layer_ptr = 0u;
  uint32_t png_str = 0u;
  int32_t already_equal = 0;
  int32_t assign_needed = 0;
  int32_t will_succeed = 0;
  int32_t return_bool = 0;
  if (in_range != 0) {
    layer_ptr = isaac_exit_anm2_layer_ptr(layer_base, layer_id);
    png_str = isaac_exit_anm2_layer_png_str_ptr(layer_ptr);
    already_equal =
        isaac_exit_anm2_sized_equal(path_data, path_size, layer_data,
                                    layer_size);
    if (already_equal == 0) {
      will_succeed = 1;
      return_bool = 1;
      assign_needed =
          isaac_exit_anm2_replace_assign_needed(png_str, path_addr);
    }
  }
  out->in_range = in_range;
  out->already_equal = already_equal;
  out->assign_needed = assign_needed;
  out->will_succeed = will_succeed;
  out->return_bool = return_bool;
  out->layer_ptr = layer_ptr;
  out->png_str_ptr = png_str;
}

extern "C" int32_t isaac_exit_anm2_replace_finish(uint8_t* layer_host,
                                                  int32_t will_succeed) {
  /* PE success epilog @ 0x0040bfb0–0x0040bfbd / 0x0040bfc0–0x0040bfd3. */
  if (will_succeed == 0) {
    return 0;
  }
  if (layer_host != nullptr) {
    isaac_exit_anm2_replace_flag30_clear(
        layer_host + ISAAC_EXIT_ANM2_LAYER_FLAG30_OFF);
  }
  return 1;
}

extern "C" uint32_t isaac_exit_anm2_anim_stride(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_ANM2_ANIM_STRIDE);
}

extern "C" uint32_t isaac_exit_anm2_anim_base_off(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_ANM2_ANIM_BASE_OFF);
}

extern "C" uint32_t isaac_exit_anm2_anim_count_off(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_ANM2_ANIM_COUNT_OFF);
}

extern "C" uint32_t isaac_exit_anm2_play_state_off(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_ANM2_PLAY_STATE_OFF);
}

extern "C" int32_t isaac_exit_anm2_anim_loop_needed(uint32_t anim_count) {
  /* PE @ 0x0040a5e6–0x0040a5e8: test ebx, ebx; je miss. */
  return (anim_count != 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_anm2_anim_entry_ptr(uint32_t anim_base,
                                                   uint32_t index) {
  /* PE @ 0x0040a62d: add esi, 0x13c per step; found: imul eax,edi,0x13c. */
  return anim_base +
         index * static_cast<uint32_t>(ISAAC_EXIT_ANM2_ANIM_STRIDE);
}

extern "C" uint32_t isaac_exit_anm2_play_state_ptr(uint32_t anm2_addr) {
  /* PE @ 0x0040a65b: add ecx, 0x30 before host 0x408830 / 0x408970. */
  return anm2_addr + static_cast<uint32_t>(ISAAC_EXIT_ANM2_PLAY_STATE_OFF);
}

extern "C" int32_t isaac_exit_anm2_play_reset_needed(uint32_t reset_in) {
  const uint8_t reset = static_cast<uint8_t>(reset_in & 0xffu);
  /* PE @ 0x0040a661: cmp byte [ebp+0xc], 0; je keep-path 0x408970. */
  return (reset != 0) ? 1 : 0;
}

extern "C" int32_t isaac_exit_anm2_play_name_match(const uint8_t* entry_name,
                                                   const uint8_t* anim_name) {
  /* PE @ 0x0040a600–0x0040a627: inline 2-byte cstr compare; je found. */
  return cstr_equal_pe(entry_name, anim_name);
}

extern "C" void isaac_exit_anm2_play_plan(IsaacExitAnm2PlayPlan* out,
                                          uint32_t anm2_addr,
                                          uint32_t anim_base,
                                          uint32_t anim_count,
                                          int32_t found_index,
                                          uint32_t reset_in) {
  const uint8_t reset = static_cast<uint8_t>(reset_in & 0xffu);
  if (out == nullptr) {
    return;
  }
  const int32_t loop_needed = isaac_exit_anm2_anim_loop_needed(anim_count);
  int32_t found = 0;
  if (loop_needed != 0 && found_index >= 0 &&
      static_cast<uint32_t>(found_index) < anim_count) {
    found = 1;
  }
  out->loop_needed = loop_needed;
  out->found = found;
  out->miss_log_needed = (found == 0) ? 1 : 0;
  out->reset_needed =
      (found != 0) ? isaac_exit_anm2_play_reset_needed(reset) : 0;
  out->return_bool = found;
  out->entry_ptr =
      (found != 0)
          ? isaac_exit_anm2_anim_entry_ptr(
                anim_base, static_cast<uint32_t>(found_index))
          : 0u;
  out->state_ptr =
      (found != 0) ? isaac_exit_anm2_play_state_ptr(anm2_addr) : 0u;
}

extern "C" int32_t isaac_exit_anm2_play_find(uint32_t anim_base,
                                             uint32_t anim_count,
                                             const uint8_t* anim_name,
                                             int32_t* out_index) {
  /* PE name scan @ 0x0040a5e3–0x0040a635 (SSO + cstr equal per entry). */
  if (out_index != nullptr) {
    *out_index = -1;
  }
  if (anim_count == 0u || anim_name == nullptr) {
    return 0;
  }
  for (uint32_t i = 0; i < anim_count; ++i) {
    const uint32_t entry = isaac_exit_anm2_anim_entry_ptr(anim_base, i);
    const uint32_t name_data = msvc_string_data_addr(entry);
    const uint8_t* name = tree_node_ptr(name_data);
    if (cstr_equal_pe(name, anim_name) != 0) {
      if (out_index != nullptr) {
        *out_index = static_cast<int32_t>(i);
      }
      return 1;
    }
  }
  return 0;
}

/* --- ABI v18: exact AnimationState::Rewind 0x0040a1b0 pure CF --- */

namespace {

inline uint32_t load_u32_le(const uint8_t* p) {
  return static_cast<uint32_t>(p[0]) |
         (static_cast<uint32_t>(p[1]) << 8) |
         (static_cast<uint32_t>(p[2]) << 16) |
         (static_cast<uint32_t>(p[3]) << 24);
}

inline void store_u32_le(uint8_t* p, uint32_t value) {
  p[0] = static_cast<uint8_t>(value & 0xffu);
  p[1] = static_cast<uint8_t>((value >> 8) & 0xffu);
  p[2] = static_cast<uint8_t>((value >> 16) & 0xffu);
  p[3] = static_cast<uint8_t>((value >> 24) & 0xffu);
}

inline float load_f32_le(const uint8_t* p) {
  return f32_bits(load_u32_le(p));
}

inline void store_f32_le(uint8_t* p, float value) {
  store_u32_le(p, __builtin_bit_cast(uint32_t, value));
}

}  // namespace

extern "C" uint32_t isaac_exit_animstate_anim_off(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_ANIMSTATE_ANIM_OFF);
}

extern "C" uint32_t isaac_exit_animstate_layer_arr_off(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_ANIMSTATE_LAYER_ARR_OFF);
}

extern "C" uint32_t isaac_exit_animstate_null_arr_off(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_ANIMSTATE_NULL_ARR_OFF);
}

extern "C" uint32_t isaac_exit_animstate_frame_off(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_ANIMSTATE_FRAME_OFF);
}

extern "C" uint32_t isaac_exit_animstate_mask18_off(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_ANIMSTATE_MASK18_OFF);
}

extern "C" uint32_t isaac_exit_animstate_mask1c_off(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_ANIMSTATE_MASK1C_OFF);
}

extern "C" uint32_t isaac_exit_animdata_layer_count_off(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_ANIMDATA_LAYER_COUNT_OFF);
}

extern "C" uint32_t isaac_exit_animdata_null_count_off(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_ANIMDATA_NULL_COUNT_OFF);
}

extern "C" uint32_t isaac_exit_animdata_event_base_off(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_ANIMDATA_EVENT_BASE_OFF);
}

extern "C" uint32_t isaac_exit_animdata_event_count_off(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_ANIMDATA_EVENT_COUNT_OFF);
}

extern "C" uint32_t isaac_exit_anim_event_stride(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_ANIM_EVENT_STRIDE);
}

extern "C" void isaac_exit_animstate_rewind_prefix(float* frame,
                                                   uint32_t* mask18,
                                                   uint32_t* mask1c) {
  /* PE @ 0x0040a1b3–0x0040a1c7: mov dword [esi+0x10/0x18/0x1c], 0. */
  if (frame != nullptr) {
    *frame = 0.0f;
  }
  if (mask18 != nullptr) {
    *mask18 = 0u;
  }
  if (mask1c != nullptr) {
    *mask1c = 0u;
  }
}

extern "C" void isaac_exit_animstate_rewind_prefix_apply(uint8_t* state) {
  if (state == nullptr) {
    return;
  }
  store_f32_le(state + ISAAC_EXIT_ANIMSTATE_FRAME_OFF, 0.0f);
  store_u32_le(state + ISAAC_EXIT_ANIMSTATE_MASK18_OFF, 0u);
  store_u32_le(state + ISAAC_EXIT_ANIMSTATE_MASK1C_OFF, 0u);
}

extern "C" int32_t isaac_exit_animstate_408c90_anim_present(uint32_t anim_ptr) {
  /* PE @ 0x00408c9a: test edi, edi; jne continue. */
  return (anim_ptr != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_exit_animstate_408c90_log_needed(uint32_t anim_ptr) {
  /* PE @ 0x00408c9e–0x00408ca5: null anim → host log 0xa112c0. */
  return (anim_ptr == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_exit_animstate_408c90_event_loop_needed(
    uint32_t event_count) {
  /* PE @ 0x00408cb4–0x00408cb7: cmp [ebx+0x2c], edx; jbe skip. */
  return (event_count != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_exit_animstate_408c90_event_frame_eq(
    float state_frame, int32_t event_frame_i32) {
  /* PE @ 0x00408cc3–0x00408cd3: movd xmm0,[event+4]; cvtdq2ps; ucomiss
     xmm0, xmm1(=state frame); lahf; test ah,0x44; jp skip.
     Fall-through only on ordered equal (NaN → not equal). */
  const float event_f = static_cast<float>(event_frame_i32);
  return (event_f == state_frame) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_animstate_408c90_mask_bts(uint32_t mask,
                                                         uint32_t bit_index) {
  /* PE bts r32, r32: bit offset taken modulo 32 for register dest. */
  return mask | (1u << (bit_index & 31u));
}

extern "C" void isaac_exit_animstate_408c90_event_step(uint32_t* mask18,
                                                       uint32_t* mask1c,
                                                       float state_frame,
                                                       int32_t bit_index,
                                                       int32_t event_frame_i32) {
  /* PE @ 0x00408cd5–0x00408cf0: on equal, bts both masks with event bit. */
  if (isaac_exit_animstate_408c90_event_frame_eq(state_frame,
                                                 event_frame_i32) == 0) {
    return;
  }
  const uint32_t bit = static_cast<uint32_t>(bit_index);
  if (mask18 != nullptr) {
    *mask18 = isaac_exit_animstate_408c90_mask_bts(*mask18, bit);
  }
  if (mask1c != nullptr) {
    *mask1c = isaac_exit_animstate_408c90_mask_bts(*mask1c, bit);
  }
}

extern "C" void isaac_exit_animstate_408c90_apply(uint8_t* state,
                                                  const uint8_t* anim) {
  /* Pure body of 0x00408c90 when anim non-null (null log residual). */
  if (state == nullptr || anim == nullptr) {
    return;
  }
  const float frame =
      load_f32_le(state + ISAAC_EXIT_ANIMSTATE_FRAME_OFF);
  uint32_t mask18 =
      load_u32_le(state + ISAAC_EXIT_ANIMSTATE_MASK18_OFF);
  uint32_t mask1c =
      load_u32_le(state + ISAAC_EXIT_ANIMSTATE_MASK1C_OFF);
  const uint32_t event_count =
      load_u32_le(anim + ISAAC_EXIT_ANIMDATA_EVENT_COUNT_OFF);
  const uint32_t event_base =
      load_u32_le(anim + ISAAC_EXIT_ANIMDATA_EVENT_BASE_OFF);
  for (uint32_t i = 0; i < event_count; ++i) {
    /* Event pairs live in linear memory at guest event_base. */
    const uint32_t ev =
        event_base + i * static_cast<uint32_t>(ISAAC_EXIT_ANIM_EVENT_STRIDE);
    const int32_t bit =
        static_cast<int32_t>(tree_load_u32(ev + ISAAC_EXIT_ANIM_EVENT_BIT_OFF));
    const int32_t eframe = static_cast<int32_t>(
        tree_load_u32(ev + ISAAC_EXIT_ANIM_EVENT_FRAME_OFF));
    isaac_exit_animstate_408c90_event_step(&mask18, &mask1c, frame, bit,
                                           eframe);
  }
  store_u32_le(state + ISAAC_EXIT_ANIMSTATE_MASK18_OFF, mask18);
  store_u32_le(state + ISAAC_EXIT_ANIMSTATE_MASK1C_OFF, mask1c);
}

extern "C" int32_t isaac_exit_animstate_rewind_layer_loop_needed(
    uint32_t layer_count) {
  /* PE @ 0x0040a1d2–0x0040a1d5: cmp [eax+0x1c], ecx; jbe skip. */
  return (layer_count != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_exit_animstate_rewind_null_loop_needed(
    uint32_t null_count) {
  /* PE @ 0x0040a1f5–0x0040a1f8: cmp [eax+0x24], ecx; jbe skip. */
  return (null_count != 0u) ? 1 : 0;
}

extern "C" void isaac_exit_animstate_rewind_zero_u32_n(uint32_t* arr,
                                                      uint32_t count) {
  /* PE @ 0x0040a1e0 / 0x0040a200: mov dword [arr+ecx*4], 0. */
  if (arr == nullptr || count == 0u) {
    return;
  }
  for (uint32_t i = 0; i < count; ++i) {
    arr[i] = 0u;
  }
}

extern "C" void isaac_exit_animstate_rewind_zero_arrays(uint8_t* state,
                                                        const uint8_t* anim) {
  if (state == nullptr || anim == nullptr) {
    return;
  }
  const uint32_t layer_count =
      load_u32_le(anim + ISAAC_EXIT_ANIMDATA_LAYER_COUNT_OFF);
  const uint32_t null_count =
      load_u32_le(anim + ISAAC_EXIT_ANIMDATA_NULL_COUNT_OFF);
  const uint32_t layer_arr =
      load_u32_le(state + ISAAC_EXIT_ANIMSTATE_LAYER_ARR_OFF);
  const uint32_t null_arr =
      load_u32_le(state + ISAAC_EXIT_ANIMSTATE_NULL_ARR_OFF);
  for (uint32_t i = 0; i < layer_count; ++i) {
    tree_store_u32(layer_arr + i * 4u, 0u);
  }
  for (uint32_t i = 0; i < null_count; ++i) {
    tree_store_u32(null_arr + i * 4u, 0u);
  }
}

extern "C" void isaac_exit_animstate_rewind_plan(
    IsaacExitAnimStateRewindPlan* out, uint32_t anim_ptr,
    uint32_t event_count, uint32_t layer_count, uint32_t null_count) {
  if (out == nullptr) {
    return;
  }
  const int32_t present = isaac_exit_animstate_408c90_anim_present(anim_ptr);
  out->anim_present = present;
  out->log_needed = isaac_exit_animstate_408c90_log_needed(anim_ptr);
  out->event_loop_needed =
      (present != 0) ? isaac_exit_animstate_408c90_event_loop_needed(event_count)
                     : 0;
  out->layer_loop_needed =
      (present != 0)
          ? isaac_exit_animstate_rewind_layer_loop_needed(layer_count)
          : 0;
  out->null_loop_needed =
      (present != 0)
          ? isaac_exit_animstate_rewind_null_loop_needed(null_count)
          : 0;
  out->pure_complete_ok = present;
  out->anim_ptr = anim_ptr;
  out->event_count = (present != 0) ? event_count : 0u;
  out->layer_count = (present != 0) ? layer_count : 0u;
  out->null_count = (present != 0) ? null_count : 0u;
}

extern "C" void isaac_exit_animstate_rewind_apply(uint8_t* state,
                                                  const uint8_t* anim) {
  /* Full PE order of 0x0040a1b0 when anim non-null. */
  if (state == nullptr || anim == nullptr) {
    return;
  }
  isaac_exit_animstate_rewind_prefix_apply(state);
  isaac_exit_animstate_408c90_apply(state, anim);
  isaac_exit_animstate_rewind_zero_arrays(state, anim);
}

extern "C" int32_t isaac_exit_animstate_rewind_apply_addr(uint32_t state_addr) {
  /* Linear-memory pure-complete Rewind; anim null → residual log (ret 0). */
  if (state_addr == 0u) {
    return 0;
  }
  const uint32_t anim_ptr =
      tree_load_u32(state_addr + ISAAC_EXIT_ANIMSTATE_ANIM_OFF);
  if (anim_ptr == 0u) {
    /* PE would log then continue into null deref; keep residual. */
    tree_store_u32(state_addr + ISAAC_EXIT_ANIMSTATE_FRAME_OFF, 0u);
    tree_store_u32(state_addr + ISAAC_EXIT_ANIMSTATE_MASK18_OFF, 0u);
    tree_store_u32(state_addr + ISAAC_EXIT_ANIMSTATE_MASK1C_OFF, 0u);
    return 0;
  }
  uint8_t* state = tree_node_mut(state_addr);
  const uint8_t* anim = tree_node_ptr(anim_ptr);
  isaac_exit_animstate_rewind_apply(state, anim);
  return 1;
}

/* --- ABI v19: residual MSVC string assign 0x0040ccd0 pure CF --- */

extern "C" uint32_t isaac_exit_40ccd0_max_size(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_40CCD0_MAX_SIZE);
}

extern "C" int32_t isaac_exit_40ccd0_fits_capacity(uint32_t count,
                                                   uint32_t capacity) {
  /* PE @ 0x0040cce2–0x0040cce4: cmp edi, ecx; ja grow. */
  return (count <= capacity) ? 1 : 0;
}

extern "C" int32_t isaac_exit_40ccd0_length_error_needed(uint32_t count) {
  /* PE @ 0x0040cd0e–0x0040cd14: cmp edi, 0x7fffffff; ja throw. */
  return (count > static_cast<uint32_t>(ISAAC_EXIT_40CCD0_MAX_SIZE)) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_40ccd0_dest_data_addr(uint32_t str_addr,
                                                     uint32_t capacity,
                                                     uint32_t dword0) {
  /* PE @ 0x0040cce6–0x0040cced: ebx=esi; if cap>=0x10 ebx=[esi]. */
  return isaac_exit_msvc_string_data_addr(str_addr, capacity, dword0);
}

extern "C" uint32_t isaac_exit_40ccd0_rounded_capacity(uint32_t count) {
  /* PE @ 0x0040cd1a–0x0040cd1c: mov ebx, edi; or ebx, 0xf. */
  return count | static_cast<uint32_t>(ISAAC_EXIT_40CCD0_ALIGN_OR);
}

extern "C" int32_t isaac_exit_40ccd0_rounded_overflow(uint32_t count) {
  /* PE @ 0x0040cd1f–0x0040cd25: cmp ebx, 0x7fffffff; jbe geo. */
  return (isaac_exit_40ccd0_rounded_capacity(count) >
          static_cast<uint32_t>(ISAAC_EXIT_40CCD0_MAX_SIZE))
             ? 1
             : 0;
}

extern "C" int32_t isaac_exit_40ccd0_geo_would_overflow(uint32_t capacity) {
  /* PE @ 0x0040cd2e–0x0040cd3b:
       edx = cap>>1; eax = MAX - edx; cmp cap, eax; jbe geometric. */
  const uint32_t half = capacity >> 1;
  const uint32_t limit =
      static_cast<uint32_t>(ISAAC_EXIT_40CCD0_MAX_SIZE) - half;
  return (capacity > limit) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_40ccd0_geometric_capacity(uint32_t capacity) {
  /* PE @ 0x0040cd44: lea eax, [edx+ecx] with edx=cap>>1, ecx=cap. */
  return capacity + (capacity >> 1);
}

extern "C" uint32_t isaac_exit_40ccd0_new_capacity(uint32_t capacity,
                                                   uint32_t count) {
  /* PE select when !length_error (assumes count <= MAX). */
  const uint32_t rounded = isaac_exit_40ccd0_rounded_capacity(count);
  if (rounded > static_cast<uint32_t>(ISAAC_EXIT_40CCD0_MAX_SIZE)) {
    return static_cast<uint32_t>(ISAAC_EXIT_40CCD0_MAX_SIZE);
  }
  if (isaac_exit_40ccd0_geo_would_overflow(capacity) != 0) {
    return static_cast<uint32_t>(ISAAC_EXIT_40CCD0_MAX_SIZE);
  }
  const uint32_t geo = isaac_exit_40ccd0_geometric_capacity(capacity);
  /* PE: cmp ebx, eax; cmovb ebx, eax → max(rounded, geo). */
  return (rounded < geo) ? geo : rounded;
}

extern "C" uint32_t isaac_exit_40ccd0_alloc_size(uint32_t new_capacity) {
  /* PE @ 0x0040cd4c: lea ecx, [ebx+1]; call 0x40cf00. */
  return new_capacity + 1u;
}

extern "C" int32_t isaac_exit_40ccd0_old_free_needed(uint32_t old_capacity) {
  /* PE @ 0x0040cd74–0x0040cd77: cmp eax, 0x10; jb skip free. */
  return (old_capacity >=
          static_cast<uint32_t>(ISAAC_EXIT_MSVC_STRING_SSO_CAP))
             ? 1
             : 0;
}

extern "C" uint32_t isaac_exit_40ccd0_free_size(uint32_t old_capacity) {
  /* PE @ 0x0040cd79: lea ecx, [eax+1]. */
  return old_capacity + 1u;
}

extern "C" int32_t isaac_exit_40ccd0_free_uses_heap_header(
    uint32_t free_size) {
  /* PE @ 0x0040cd7e–0x0040cd84: cmp ecx, 0x1000; jb simple free. */
  return (free_size >=
          static_cast<uint32_t>(ISAAC_EXIT_40CCD0_FREE_HEADER_THRESHOLD))
             ? 1
             : 0;
}

extern "C" uint32_t isaac_exit_40ccd0_free_header_size(uint32_t free_size) {
  /* PE @ 0x0040cd89: add ecx, 0x23. */
  return free_size +
         static_cast<uint32_t>(ISAAC_EXIT_40CCD0_FREE_HEADER_ADD);
}

extern "C" int32_t isaac_exit_40ccd0_free_header_offset_ok(uint32_t old_ptr,
                                                           uint32_t header) {
  /* PE @ 0x0040cd8c–0x0040cd94: sub eax,edx; add eax,-4; cmp eax,0x1f; ja
     abort. Continue free when offset <= 0x1f (unsigned jbe). */
  const uint32_t off = (old_ptr - header) - 4u;
  return (off <=
          static_cast<uint32_t>(ISAAC_EXIT_40CCD0_FREE_HEADER_OFFSET_MAX))
             ? 1
             : 0;
}

extern "C" void isaac_exit_40ccd0_store_size(uint32_t* size_slot,
                                             uint32_t count) {
  /* PE @ 0x0040ccf3 / 0x0040cd5c: mov [esi+0x10], edi. */
  if (size_slot != nullptr) {
    *size_slot = count;
  }
}

extern "C" void isaac_exit_40ccd0_store_capacity(uint32_t* cap_slot,
                                                 uint32_t new_cap) {
  /* PE @ 0x0040cd5f: mov [esi+0x14], ebx. */
  if (cap_slot != nullptr) {
    *cap_slot = new_cap;
  }
}

extern "C" void isaac_exit_40ccd0_store_ptr(uint32_t* dword0_slot,
                                            uint32_t new_ptr) {
  /* PE @ 0x0040cda3: mov [esi], ebx. */
  if (dword0_slot != nullptr) {
    *dword0_slot = new_ptr;
  }
}

extern "C" void isaac_exit_40ccd0_null_term(uint8_t* dest, uint32_t count) {
  /* PE @ 0x0040ccff / 0x0040cd70: mov byte [ebx+edi], 0. */
  if (dest != nullptr) {
    dest[count] = 0;
  }
}

extern "C" void isaac_exit_40ccd0_copy_and_term(uint8_t* dest,
                                                const uint8_t* src,
                                                uint32_t count) {
  /* Freestanding pure body of host memmove when buffers non-overlapping. */
  if (dest != nullptr && src != nullptr && count != 0u) {
    for (uint32_t i = 0; i < count; ++i) {
      dest[i] = src[i];
    }
  }
  isaac_exit_40ccd0_null_term(dest, count);
}

extern "C" void isaac_exit_40ccd0_nongrow_finish(uint8_t* dest,
                                                 uint32_t* size_slot,
                                                 const uint8_t* src,
                                                 uint32_t count) {
  /* PE no-grow path: size store, copy, null-term (order size before copy). */
  isaac_exit_40ccd0_store_size(size_slot, count);
  isaac_exit_40ccd0_copy_and_term(dest, src, count);
}

extern "C" void isaac_exit_40ccd0_grow_pre_copy(uint32_t* size_slot,
                                                uint32_t* cap_slot,
                                                uint32_t count,
                                                uint32_t new_cap) {
  /* PE @ 0x0040cd5c–0x0040cd5f before memcpy. */
  isaac_exit_40ccd0_store_size(size_slot, count);
  isaac_exit_40ccd0_store_capacity(cap_slot, new_cap);
}

extern "C" void isaac_exit_40ccd0_grow_post_free(uint32_t* dword0_slot,
                                                 uint32_t new_ptr) {
  /* PE @ 0x0040cda3 after free. */
  isaac_exit_40ccd0_store_ptr(dword0_slot, new_ptr);
}

extern "C" void isaac_exit_40ccd0_plan(IsaacExit40ccd0Plan* out,
                                       uint32_t str_addr, uint32_t capacity,
                                       uint32_t dword0, uint32_t count) {
  if (out == nullptr) {
    return;
  }
  const int32_t fits = isaac_exit_40ccd0_fits_capacity(count, capacity);
  const int32_t length_error = isaac_exit_40ccd0_length_error_needed(count);
  const int32_t sso = isaac_exit_msvc_string_sso_inline(capacity);
  const int32_t grow =
      (fits == 0 && length_error == 0) ? 1 : 0;
  int32_t rounded_overflow = 0;
  int32_t geo_overflow = 0;
  uint32_t new_cap = 0u;
  uint32_t alloc = 0u;
  uint32_t free_sz = 0u;
  int32_t old_free = 0;
  int32_t uses_header = 0;
  uint32_t dest = 0u;
  if (fits != 0) {
    dest = isaac_exit_40ccd0_dest_data_addr(str_addr, capacity, dword0);
    new_cap = capacity;
  } else if (length_error == 0) {
    rounded_overflow = isaac_exit_40ccd0_rounded_overflow(count);
    if (rounded_overflow == 0) {
      geo_overflow = isaac_exit_40ccd0_geo_would_overflow(capacity);
    }
    new_cap = isaac_exit_40ccd0_new_capacity(capacity, count);
    alloc = isaac_exit_40ccd0_alloc_size(new_cap);
    old_free = isaac_exit_40ccd0_old_free_needed(capacity);
    if (old_free != 0) {
      free_sz = isaac_exit_40ccd0_free_size(capacity);
      uses_header = isaac_exit_40ccd0_free_uses_heap_header(free_sz);
    }
  }
  out->count = count;
  out->capacity = capacity;
  out->dest_data = dest;
  out->new_capacity = new_cap;
  out->alloc_size = alloc;
  out->free_size = free_sz;
  out->fits = fits;
  out->length_error = length_error;
  out->grow_needed = grow;
  out->rounded_overflow = rounded_overflow;
  out->geo_overflow = geo_overflow;
  out->old_free_needed = old_free;
  out->free_uses_header = uses_header;
  out->sso_inline = sso;
}

/* --- ABI v20: residual keep-set host 0x00408970 pure CF --- */

extern "C" uint32_t isaac_exit_408970_count_select(uint32_t obj_addr,
                                                   uint32_t loaded_count) {
  /* PE @ 0x0040899a–0x004089a6 / 0x4089ae–0x4089b7 / +0x24 twins:
     test obj; je → 0; else use [obj+off] (host-loaded into loaded_count). */
  if (obj_addr == 0u) {
    return 0u;
  }
  return loaded_count;
}

extern "C" int32_t isaac_exit_408970_counts_equal(uint32_t old_count,
                                                  uint32_t new_count) {
  /* PE @ 0x004089df / 0x00408aad: cmp; je skip resize. */
  return (old_count == new_count) ? 1 : 0;
}

extern "C" int32_t isaac_exit_408970_counts_differ(uint32_t old_count,
                                                   uint32_t new_count) {
  return (old_count != new_count) ? 1 : 0;
}

extern "C" int32_t isaac_exit_408970_new_count_positive(uint32_t new_count) {
  /* PE @ 0x004089e7 / 0x00408ab6: test ebx, ebx; jg realloc. Signed. */
  return (static_cast<int32_t>(new_count) > 0) ? 1 : 0;
}

extern "C" int32_t isaac_exit_408970_copy_needed(uint32_t old_count) {
  /* PE @ 0x00408a56 / 0x00408b1e: test eax, eax; jle skip memcpy. Signed. */
  return (static_cast<int32_t>(old_count) > 0) ? 1 : 0;
}

extern "C" int32_t isaac_exit_408970_ptr_nonzero(uint32_t ptr) {
  /* PE: test edx/ecx; je skip free. */
  return (ptr != 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_408970_alloc_size(uint32_t count) {
  /* PE @ 0x00408a1e–0x00408a2d: mul edx(4); seto; neg; or → all-ones. */
  const uint64_t prod = static_cast<uint64_t>(count) *
                        static_cast<uint64_t>(ISAAC_EXIT_408970_ELEM_SIZE);
  if (prod > 0xffffffffull) {
    return 0xffffffffu;
  }
  return static_cast<uint32_t>(prod);
}

extern "C" uint32_t isaac_exit_408970_fill_size(uint32_t count) {
  /* PE @ 0x00408a37: lea ecx, [ebx*4] (no overflow check / wrap). */
  return (count * static_cast<uint32_t>(ISAAC_EXIT_408970_ELEM_SIZE));
}

extern "C" uint32_t isaac_exit_408970_copy_size(uint32_t old_count) {
  /* PE @ 0x00408a5a / 0x00408b22: shl eax, 2. */
  return old_count << 2;
}

extern "C" uint8_t isaac_exit_408970_fill_byte(void) {
  return static_cast<uint8_t>(ISAAC_EXIT_408970_FILL_BYTE);
}

extern "C" uint32_t isaac_exit_408970_heap_stats_base(
    uint32_t heap_stats_global) {
  /* PE @ 0x00408a71–0x00408a85:
     mov edx, [0xc7de78]; test edx; je fallback;
     add edx, 0x30; else mov edx, 0xc7f618. */
  if (heap_stats_global != 0u) {
    return heap_stats_global +
           static_cast<uint32_t>(ISAAC_EXIT_408970_HEAP_STATS_DELTA);
  }
  return static_cast<uint32_t>(ISAAC_EXIT_408970_HEAP_STATS_FALLBACK);
}

extern "C" uint32_t isaac_exit_408970_free_block_ptr(uint32_t buf_ptr) {
  /* PE @ 0x00408a88 / 0x00408b50: add ecx, -4 before IAT free. */
  return buf_ptr - 4u;
}

extern "C" void isaac_exit_408970_store_arg(uint32_t* field4_slot,
                                            uint32_t arg) {
  /* PE @ 0x00408b6d: mov [esi+4], edi. */
  if (field4_slot != nullptr) {
    *field4_slot = arg;
  }
}

extern "C" void isaac_exit_408970_store_arg_apply(uint8_t* this_base,
                                                  uint32_t arg) {
  if (this_base == nullptr) {
    return;
  }
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_408970_FIELD_4_OFF) =
      arg;
}

extern "C" void isaac_exit_408970_store_buf_a(uint32_t* field8_slot,
                                              uint32_t ptr) {
  if (field8_slot != nullptr) {
    *field8_slot = ptr;
  }
}

extern "C" void isaac_exit_408970_store_buf_b(uint32_t* fieldc_slot,
                                              uint32_t ptr) {
  if (fieldc_slot != nullptr) {
    *fieldc_slot = ptr;
  }
}

extern "C" void isaac_exit_408970_ptr_clear(uint32_t* slot) {
  if (slot != nullptr) {
    *slot = 0u;
  }
}

extern "C" void isaac_exit_408970_store_buf_a_apply(uint8_t* this_base,
                                                    uint32_t ptr) {
  if (this_base == nullptr) {
    return;
  }
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_408970_FIELD_8_OFF) =
      ptr;
}

extern "C" void isaac_exit_408970_store_buf_b_apply(uint8_t* this_base,
                                                    uint32_t ptr) {
  if (this_base == nullptr) {
    return;
  }
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_408970_FIELD_C_OFF) =
      ptr;
}

extern "C" void isaac_exit_408970_clear_buf_a_apply(uint8_t* this_base) {
  isaac_exit_408970_store_buf_a_apply(this_base, 0u);
}

extern "C" void isaac_exit_408970_clear_buf_b_apply(uint8_t* this_base) {
  isaac_exit_408970_store_buf_b_apply(this_base, 0u);
}

extern "C" void isaac_exit_408970_buffer_plan(IsaacExit408970BufferPlan* out,
                                              uint32_t old_count,
                                              uint32_t new_count,
                                              uint32_t old_buf_ptr) {
  if (out == nullptr) {
    return;
  }
  const int32_t differ = isaac_exit_408970_counts_differ(old_count, new_count);
  const int32_t pos = isaac_exit_408970_new_count_positive(new_count);
  const int32_t free_np = (differ != 0 && pos == 0) ? 1 : 0;
  const int32_t realloc = (differ != 0 && pos != 0) ? 1 : 0;
  const int32_t copy =
      (realloc != 0 && isaac_exit_408970_copy_needed(old_count) != 0) ? 1 : 0;
  const int32_t heap_free =
      (realloc != 0 && isaac_exit_408970_ptr_nonzero(old_buf_ptr) != 0) ? 1
                                                                        : 0;
  const int32_t a648 =
      (free_np != 0 && isaac_exit_408970_ptr_nonzero(old_buf_ptr) != 0) ? 1
                                                                        : 0;
  out->old_count = old_count;
  out->new_count = new_count;
  out->alloc_size =
      (realloc != 0) ? isaac_exit_408970_alloc_size(new_count) : 0u;
  out->fill_size =
      (realloc != 0) ? isaac_exit_408970_fill_size(new_count) : 0u;
  out->copy_size = (copy != 0) ? isaac_exit_408970_copy_size(old_count) : 0u;
  out->free_block_ptr =
      (heap_free != 0) ? isaac_exit_408970_free_block_ptr(old_buf_ptr) : 0u;
  out->counts_differ = differ;
  out->new_positive = pos;
  out->free_nonpositive = free_np;
  out->a648b0_free_needed = a648;
  out->realloc_needed = realloc;
  out->copy_needed = copy;
  out->heap_free_needed = heap_free;
}

extern "C" void isaac_exit_408970_plan(IsaacExit408970Plan* out,
                                       uint32_t old_count_a,
                                       uint32_t new_count_a,
                                       uint32_t old_count_b,
                                       uint32_t new_count_b,
                                       uint32_t buf_a_ptr, uint32_t buf_b_ptr,
                                       uint32_t new_arg_addr) {
  if (out == nullptr) {
    return;
  }
  IsaacExit408970BufferPlan a{};
  IsaacExit408970BufferPlan b{};
  isaac_exit_408970_buffer_plan(&a, old_count_a, new_count_a, buf_a_ptr);
  isaac_exit_408970_buffer_plan(&b, old_count_b, new_count_b, buf_b_ptr);

  out->old_count_a = old_count_a;
  out->new_count_a = new_count_a;
  out->old_count_b = old_count_b;
  out->new_count_b = new_count_b;
  out->terminal_arg = new_arg_addr;

  out->a_alloc_size = a.alloc_size;
  out->a_fill_size = a.fill_size;
  out->a_copy_size = a.copy_size;
  out->a_free_block_ptr = a.free_block_ptr;
  out->a_counts_differ = a.counts_differ;
  out->a_new_positive = a.new_positive;
  out->a_free_nonpositive = a.free_nonpositive;
  out->a_a648b0_free_needed = a.a648b0_free_needed;
  out->a_realloc_needed = a.realloc_needed;
  out->a_copy_needed = a.copy_needed;
  out->a_heap_free_needed = a.heap_free_needed;

  out->b_alloc_size = b.alloc_size;
  out->b_fill_size = b.fill_size;
  out->b_copy_size = b.copy_size;
  out->b_free_block_ptr = b.free_block_ptr;
  out->b_counts_differ = b.counts_differ;
  out->b_new_positive = b.new_positive;
  out->b_free_nonpositive = b.free_nonpositive;
  out->b_a648b0_free_needed = b.a648b0_free_needed;
  out->b_realloc_needed = b.realloc_needed;
  out->b_copy_needed = b.copy_needed;
  out->b_heap_free_needed = b.heap_free_needed;
  /* PE @ 0x00408b6a: after B realloc, mov [esi+8], ebx (A slot). */
  out->b_store_new_at_a_slot = b.realloc_needed;
}

/* --- ABI v21: residual Load nested host 0x0040db90 pure CF --- */

namespace {

/* High 64 bits of 64x64 → 128 unsigned multiply (MSVC PE limb order). */
uint64_t mulhu64(uint64_t a, uint64_t b) {
  const uint32_t a0 = static_cast<uint32_t>(a);
  const uint32_t a1 = static_cast<uint32_t>(a >> 32);
  const uint32_t b0 = static_cast<uint32_t>(b);
  const uint32_t b1 = static_cast<uint32_t>(b >> 32);
  const uint64_t p_ll = static_cast<uint64_t>(a0) * static_cast<uint64_t>(b0);
  const uint64_t p_lh = static_cast<uint64_t>(a0) * static_cast<uint64_t>(b1);
  const uint64_t p_hl = static_cast<uint64_t>(a1) * static_cast<uint64_t>(b0);
  const uint64_t p_hh = static_cast<uint64_t>(a1) * static_cast<uint64_t>(b1);

  /* Match PE 0x40dbfa–0x40dc8e accumulation for product high half. */
  uint32_t p_ll_hi = static_cast<uint32_t>(p_ll >> 32);
  uint32_t p_lh_lo = static_cast<uint32_t>(p_lh);
  uint32_t p_lh_hi = static_cast<uint32_t>(p_lh >> 32);
  uint32_t p_hl_lo = static_cast<uint32_t>(p_hl);
  uint32_t p_hl_hi = static_cast<uint32_t>(p_hl >> 32);
  uint32_t p_hh_lo = static_cast<uint32_t>(p_hh);
  uint32_t p_hh_hi = static_cast<uint32_t>(p_hh >> 32);

  uint32_t ecx = p_hl_lo + p_ll_hi;
  uint32_t cf1 = (ecx < p_hl_lo) ? 1u : 0u;
  uint32_t edx = p_hl_hi + cf1;
  uint32_t edi = p_lh_lo + ecx;
  uint32_t cf2 = (edi < p_lh_lo) ? 1u : 0u;
  ecx = p_lh_hi + cf2;
  uint32_t eax = 0u;
  uint32_t sum = edx + ecx;
  uint32_t cf3 = (sum < edx) ? 1u : 0u;
  eax = cf3; /* PE: adc eax, eax with eax starting 0 */
  uint32_t esi = p_hh_lo + sum;
  uint32_t cf4 = (esi < p_hh_lo) ? 1u : 0u;
  ecx = p_hh_hi + eax + cf4;
  return (static_cast<uint64_t>(ecx) << 32) | static_cast<uint64_t>(esi);
}

} /* namespace */

extern "C" int32_t isaac_exit_40db90_path_size_present(uint32_t path_size_10) {
  /* PE @ 0x0040dbe3: cmp dword [path+0x10], 0; je early. */
  return (path_size_10 != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_exit_40db90_early_return(uint32_t path_size_10) {
  return (path_size_10 == 0u) ? 1 : 0;
}

extern "C" void isaac_exit_40db90_timing_scale(uint32_t qpc_lo, uint32_t qpc_hi,
                                               uint32_t* out_lo,
                                               uint32_t* out_hi) {
  /* PE @ 0x0040dbfa–0x40dc91: high64(qpc * magic) >> 18. */
  const uint64_t qpc =
      (static_cast<uint64_t>(qpc_hi) << 32) | static_cast<uint64_t>(qpc_lo);
  const uint64_t magic =
      (static_cast<uint64_t>(ISAAC_EXIT_40DB90_TIMING_MUL_HI) << 32) |
      static_cast<uint64_t>(ISAAC_EXIT_40DB90_TIMING_MUL_LO);
  const uint64_t hi = mulhu64(qpc, magic);
  const uint64_t scaled = hi >> ISAAC_EXIT_40DB90_TIMING_SHIFT;
  if (out_lo != nullptr) {
    *out_lo = static_cast<uint32_t>(scaled);
  }
  if (out_hi != nullptr) {
    *out_hi = static_cast<uint32_t>(scaled >> 32);
  }
}

extern "C" void isaac_exit_40db90_timing_delta(uint32_t end_lo, uint32_t end_hi,
                                               uint32_t start_lo,
                                               uint32_t start_hi,
                                               uint32_t* out_lo,
                                               uint32_t* out_hi) {
  /* PE @ 0x0040e0ca–0x40e0d5: sub/sbb scaled_end - scaled_start. */
  const uint64_t end =
      (static_cast<uint64_t>(end_hi) << 32) | static_cast<uint64_t>(end_lo);
  const uint64_t start =
      (static_cast<uint64_t>(start_hi) << 32) | static_cast<uint64_t>(start_lo);
  const uint64_t d = end - start;
  if (out_lo != nullptr) {
    *out_lo = static_cast<uint32_t>(d);
  }
  if (out_hi != nullptr) {
    *out_hi = static_cast<uint32_t>(d >> 32);
  }
}

extern "C" int32_t isaac_exit_40db90_cache_space_ok(uint32_t begin,
                                                    uint32_t end) {
  /* PE @ 0x0040dc9f–0x40dcb0: sub eax, edi; cmp eax, 4; jae skip grow. */
  return ((end - begin) >=
          static_cast<uint32_t>(ISAAC_EXIT_40DB90_CACHE_MIN_SPACE))
             ? 1
             : 0;
}

extern "C" int32_t isaac_exit_40db90_cache_walk_done(uint32_t walk,
                                                     uint32_t end) {
  /* PE @ 0x0040dd16: cmp edi, ecx; je done. */
  return (walk == end) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_40db90_cache_walk_next(uint32_t walk) {
  /* PE @ 0x0040dda9: add edi, 4. */
  return walk + static_cast<uint32_t>(ISAAC_EXIT_40DB90_CACHE_PTR_STRIDE);
}

extern "C" uint32_t isaac_exit_40db90_tree_hit_select(
    uint32_t node_addr, uint32_t isnil_byte_in, uint32_t node_key, uint32_t key,
    uint32_t sentinel_addr) {
  const uint8_t isnil_byte = static_cast<uint8_t>(isnil_byte_in & 0xffu);
  /* PE @ 0x0040dd92–0x40dda3:
     if isnil(@+0xd) → sentinel
     else if key < node_key (unsigned jb via !jae) → sentinel
     else keep node. */
  if (isnil_byte != 0u) {
    return sentinel_addr;
  }
  if (key < node_key) {
    return sentinel_addr;
  }
  return node_addr;
}

extern "C" int32_t isaac_exit_40db90_node_is_sentinel(uint32_t node_addr,
                                                      uint32_t sentinel_addr) {
  return (node_addr == sentinel_addr) ? 1 : 0;
}

extern "C" int32_t isaac_exit_40db90_cache_miss(uint32_t node_addr,
                                                uint32_t sentinel_addr) {
  /* PE @ 0x0040de70: cmp esi, ecx; je miss log path. */
  return isaac_exit_40db90_node_is_sentinel(node_addr, sentinel_addr);
}

extern "C" int32_t isaac_exit_40db90_insert_needed(uint32_t node_addr,
                                                   uint32_t sentinel_addr,
                                                   uint32_t flag14_in,
                                                   uint32_t file_ptr) {
  const uint8_t flag14 = static_cast<uint8_t>(flag14_in & 0xffu);
  /* PE @ 0x0040dddf–0x40ddeb:
     if node == sentinel → insert
     if flag14 == 0 → skip
     if file_ptr == 0 → skip
     else insert. */
  if (node_addr == sentinel_addr) {
    return 1;
  }
  if (flag14 == 0u) {
    return 0;
  }
  if (file_ptr == 0u) {
    return 0;
  }
  return 1;
}

extern "C" uint32_t isaac_exit_40db90_heap_stats_base(
    uint32_t heap_stats_global) {
  /* PE @ 0x0040de36–0x40de4a: same select as 0x408970. */
  if (heap_stats_global != 0u) {
    return heap_stats_global +
           static_cast<uint32_t>(ISAAC_EXIT_40DB90_HEAP_STATS_DELTA);
  }
  return static_cast<uint32_t>(ISAAC_EXIT_40DB90_HEAP_STATS_FALLBACK);
}

extern "C" int32_t isaac_exit_40db90_temp_free_needed(uint32_t ptr) {
  /* PE @ 0x0040de4a: test eax, eax; je skip free. */
  return (ptr != 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_40db90_free_block_ptr(uint32_t buf_ptr) {
  /* PE @ 0x0040de4e: lea ecx, [eax-4]. */
  return buf_ptr - 4u;
}

extern "C" int32_t isaac_exit_40db90_layer_array_present(
    uint32_t layer_base_ptr) {
  /* PE @ 0x0040de7e–0x40de83: mov eax, [anm2+0x7c]; test; je skip free. */
  return (layer_base_ptr != 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_40db90_old_layer_free_size(uint32_t header_count) {
  /* PE @ 0x0040dea1–0x40dea9: lea eax,[eax+eax*4]; shl 5; add 4. */
  return header_count * static_cast<uint32_t>(ISAAC_EXIT_40DB90_LAYER_STRIDE) +
         static_cast<uint32_t>(ISAAC_EXIT_40DB90_HEADER_SIZE);
}

extern "C" int32_t isaac_exit_40db90_layer_count_nonzero(uint32_t count) {
  /* PE @ 0x0040decc / 0x40df62: test ecx; je skip alloc/loop. */
  return (count != 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_40db90_layer_alloc_size(uint32_t count) {
  /* PE @ 0x0040dee2–0x40df02: mul 0xa0; seto→-1; add 4; setb→-1. */
  const uint64_t prod =
      static_cast<uint64_t>(count) *
      static_cast<uint64_t>(ISAAC_EXIT_40DB90_LAYER_STRIDE);
  uint32_t s =
      (prod > 0xffffffffull) ? 0xffffffffu : static_cast<uint32_t>(prod);
  const uint32_t sum = s + static_cast<uint32_t>(ISAAC_EXIT_40DB90_HEADER_SIZE);
  if (sum < s) {
    return 0xffffffffu;
  }
  return sum;
}

extern "C" int32_t isaac_exit_40db90_alloc_ok(uint32_t raw_ptr) {
  /* PE @ 0x0040df16: test eax; je null user. */
  return (raw_ptr != 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_40db90_user_ptr_after_header(uint32_t raw_ptr) {
  /* PE @ 0x0040df2d: add eax, 4 after storing count at raw. */
  return raw_ptr + static_cast<uint32_t>(ISAAC_EXIT_40DB90_HEADER_SIZE);
}

extern "C" int32_t isaac_exit_40db90_layer_loop_needed(uint32_t index,
                                                       uint32_t count) {
  /* PE @ 0x0040dfc6: cmp eax, ecx; jb continue. */
  return (index < count) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_40db90_src_layer_stride(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_40DB90_SRC_LAYER_STRIDE);
}

extern "C" uint32_t isaac_exit_40db90_dst_layer_stride(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_40DB90_LAYER_STRIDE);
}

extern "C" uint32_t isaac_exit_40db90_src_layer_ptr(uint32_t src_base,
                                                    uint32_t index) {
  /* PE @ 0x0040df86–0x40df89: [esi+0x18] + index*0x38. */
  return src_base +
         index * static_cast<uint32_t>(ISAAC_EXIT_40DB90_SRC_LAYER_STRIDE);
}

extern "C" uint32_t isaac_exit_40db90_dst_layer_ptr(uint32_t dst_base,
                                                    uint32_t index) {
  /* PE @ 0x0040df8e–0x40dfaa: base + index*0xa0. */
  return dst_base +
         index * static_cast<uint32_t>(ISAAC_EXIT_40DB90_LAYER_STRIDE);
}

extern "C" void isaac_exit_40db90_store_layer_backptr(uint32_t* backptr_slot,
                                                      uint32_t anm2_addr) {
  /* PE @ 0x0040dfa6: mov [edx+eax+4], edi. */
  if (backptr_slot != nullptr) {
    *backptr_slot = anm2_addr;
  }
}

extern "C" void isaac_exit_40db90_store_layer_backptr_at(uint8_t* dst_layer,
                                                         uint32_t anm2_addr) {
  if (dst_layer == nullptr) {
    return;
  }
  *reinterpret_cast<uint32_t*>(dst_layer + ISAAC_EXIT_40DB90_LAYER_BACKPTR_OFF) =
      anm2_addr;
}

extern "C" int32_t isaac_exit_40db90_name_assign_needed(
    uint32_t anm2_name_addr, uint32_t node_name_addr) {
  /* PE @ 0x0040e006: cmp ecx, esi; je skip 0x40ccd0. */
  return (anm2_name_addr != node_name_addr) ? 1 : 0;
}

extern "C" void isaac_exit_40db90_field_pack(IsaacExit40db90FieldPack* out,
                                             uint32_t layer_count, uint32_t f20,
                                             uint32_t f24, uint32_t f28,
                                             uint32_t f2c, uint32_t f30,
                                             uint32_t f34) {
  if (out == nullptr) {
    return;
  }
  out->layer_count = layer_count;
  out->field74 = f20;
  out->field78 = f24;
  out->field84 = f28;
  out->field88 = f2c;
  out->field8c = f30;
  out->field90 = f34;
}

extern "C" void isaac_exit_40db90_field_pack_apply(
    uint8_t* anm2_base, const IsaacExit40db90FieldPack* pack) {
  /* PE @ 0x0040dfca–0x40e005 pure stores. */
  if (anm2_base == nullptr || pack == nullptr) {
    return;
  }
  *reinterpret_cast<uint32_t*>(anm2_base +
                               ISAAC_EXIT_40DB90_ANM2_LAYER_COUNT_OFF) =
      pack->layer_count;
  *reinterpret_cast<uint32_t*>(anm2_base + ISAAC_EXIT_40DB90_ANM2_FIELD74_OFF) =
      pack->field74;
  *reinterpret_cast<uint32_t*>(anm2_base + ISAAC_EXIT_40DB90_ANM2_FIELD78_OFF) =
      pack->field78;
  *reinterpret_cast<uint32_t*>(anm2_base + ISAAC_EXIT_40DB90_ANM2_FIELD84_OFF) =
      pack->field84;
  *reinterpret_cast<uint32_t*>(anm2_base + ISAAC_EXIT_40DB90_ANM2_FIELD88_OFF) =
      pack->field88;
  *reinterpret_cast<uint32_t*>(anm2_base + ISAAC_EXIT_40DB90_ANM2_FIELD8C_OFF) =
      pack->field8c;
  *reinterpret_cast<uint32_t*>(anm2_base + ISAAC_EXIT_40DB90_ANM2_FIELD90_OFF) =
      pack->field90;
}

extern "C" void isaac_exit_40db90_plan(
    IsaacExit40db90Plan* out, uint32_t path_size, uint32_t qpc_lo,
    uint32_t qpc_hi, uint32_t cache_begin, uint32_t cache_end,
    uint32_t node_addr, uint32_t isnil_byte_in, uint32_t node_key, uint32_t key,
    uint32_t sentinel_addr, uint32_t flag14_in, uint32_t file_ptr,
    uint32_t layer_base_ptr, uint32_t layer_count, uint32_t header_count,
    uint32_t anm2_name_addr, uint32_t node_name_addr) {
  const uint8_t isnil_byte = static_cast<uint8_t>(isnil_byte_in & 0xffu);
  const uint8_t flag14 = static_cast<uint8_t>(flag14_in & 0xffu);
  if (out == nullptr) {
    return;
  }
  uint32_t t_lo = 0u;
  uint32_t t_hi = 0u;
  isaac_exit_40db90_timing_scale(qpc_lo, qpc_hi, &t_lo, &t_hi);
  const uint32_t selected = isaac_exit_40db90_tree_hit_select(
      node_addr, isnil_byte, node_key, key, sentinel_addr);
  const int32_t path_present = isaac_exit_40db90_path_size_present(path_size);
  const int32_t early = isaac_exit_40db90_early_return(path_size);
  const int32_t space =
      isaac_exit_40db90_cache_space_ok(cache_begin, cache_end);
  const int32_t walk_done =
      isaac_exit_40db90_cache_walk_done(cache_begin, cache_end);
  const int32_t miss =
      isaac_exit_40db90_cache_miss(selected, sentinel_addr);
  const int32_t insert = isaac_exit_40db90_insert_needed(
      selected, sentinel_addr, flag14, file_ptr);
  const int32_t temp_free = isaac_exit_40db90_temp_free_needed(file_ptr);
  const int32_t layer_present =
      isaac_exit_40db90_layer_array_present(layer_base_ptr);
  const int32_t count_nz = isaac_exit_40db90_layer_count_nonzero(layer_count);
  const int32_t name_asg =
      isaac_exit_40db90_name_assign_needed(anm2_name_addr, node_name_addr);

  out->path_size = path_size;
  out->timing_lo = t_lo;
  out->timing_hi = t_hi;
  out->cache_begin = cache_begin;
  out->cache_end = cache_end;
  out->node_addr = selected;
  out->sentinel_addr = sentinel_addr;
  out->layer_base_ptr = layer_base_ptr;
  out->layer_count = layer_count;
  out->layer_alloc_size =
      (count_nz != 0) ? isaac_exit_40db90_layer_alloc_size(layer_count) : 0u;
  out->old_free_size =
      (layer_present != 0) ? isaac_exit_40db90_old_layer_free_size(header_count)
                           : 0u;
  out->free_block_ptr =
      (temp_free != 0) ? isaac_exit_40db90_free_block_ptr(file_ptr) : 0u;
  out->path_present = path_present;
  out->early_return = early;
  out->cache_space_ok = space;
  out->cache_walk_done = walk_done;
  out->cache_miss = miss;
  out->insert_needed = insert;
  out->temp_free_needed = temp_free;
  out->layer_array_present = layer_present;
  out->layer_count_nonzero = count_nz;
  out->layer_loop_needed = count_nz;
  out->name_assign_needed = (miss == 0) ? name_asg : 0;
}

/* --- ABI v22: residual Load sibling host 0x0040e110 pure CF --- */

extern "C" int32_t isaac_exit_40e110_cache_space_ok(uint32_t begin,
                                                    uint32_t end) {
  /* PE @ 0x0040e155–0x40e15e: sub eax, edi; test eax, 0xfffffffc; jne skip. */
  const uint32_t size = end - begin;
  return ((size & static_cast<uint32_t>(ISAAC_EXIT_40E110_CACHE_SPACE_MASK)) !=
          0u)
             ? 1
             : 0;
}

extern "C" int32_t isaac_exit_40e110_cache_walk_done(uint32_t walk,
                                                     uint32_t end) {
  /* PE @ 0x0040e1ca: cmp edi, edx; je done. Also loop tail @ 0x40e25e. */
  return (walk == end) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_40e110_cache_walk_next(uint32_t walk) {
  /* PE @ 0x0040e25b: add edi, 4. */
  return walk + static_cast<uint32_t>(ISAAC_EXIT_40E110_CACHE_PTR_STRIDE);
}

extern "C" uint32_t isaac_exit_40e110_path_data_addr(uint32_t str_addr,
                                                     uint32_t capacity,
                                                     uint32_t dword0) {
  /* PE @ 0x0040e1f6–0x40e1fc / 0x40e279–0x40e27f:
     cmp [path+0x14], 0x10; jb → path itself; else path = [path]. */
  return isaac_exit_msvc_string_data_addr(str_addr, capacity, dword0);
}

extern "C" uint32_t isaac_exit_40e110_path_buf_size(void) {
  /* PE @ 0x0040e1d2 / 0x40e1df / 0x40e205: push 0x100. */
  return static_cast<uint32_t>(ISAAC_EXIT_40E110_PATH_BUF_SIZE);
}

extern "C" uint32_t isaac_exit_40e110_tree_hit_select(
    uint32_t node_addr, uint32_t isnil_byte_in, uint32_t node_key, uint32_t key,
    uint32_t sentinel_addr) {
  const uint8_t isnil_byte = static_cast<uint8_t>(isnil_byte_in & 0xffu);
  /* PE @ 0x0040e244–0x40e255:
     if isnil(@+0xd) → sentinel
     else if key < node_key (unsigned !jae) → sentinel
     else keep node. Same CF as 0x40db90. */
  if (isnil_byte != 0u) {
    return sentinel_addr;
  }
  if (key < node_key) {
    return sentinel_addr;
  }
  return node_addr;
}

extern "C" int32_t isaac_exit_40e110_node_is_sentinel(uint32_t node_addr,
                                                      uint32_t sentinel_addr) {
  return (node_addr == sentinel_addr) ? 1 : 0;
}

extern "C" int32_t isaac_exit_40e110_cache_hit(uint32_t node_addr,
                                               uint32_t sentinel_addr) {
  /* PE @ 0x0040e257–0x40e26e: cmp esi, ecx; jne hit (inc refcount). */
  return (node_addr != sentinel_addr) ? 1 : 0;
}

extern "C" int32_t isaac_exit_40e110_cache_miss(uint32_t node_addr,
                                                uint32_t sentinel_addr) {
  /* PE @ 0x0040e26a–0x40e26c: cmp esi, ecx; je miss log. */
  return isaac_exit_40e110_node_is_sentinel(node_addr, sentinel_addr);
}

extern "C" int32_t isaac_exit_40e110_log_needed(uint32_t node_addr,
                                                uint32_t sentinel_addr) {
  /* PE @ 0x0040e273–0x40e289: host 0xa112c0 on miss only. */
  return isaac_exit_40e110_cache_miss(node_addr, sentinel_addr);
}

extern "C" uint32_t isaac_exit_40e110_refcount_inc(uint32_t prior) {
  /* PE @ 0x0040e26e: inc dword [esi+0x50] (32-bit wrap). */
  return prior + 1u;
}

extern "C" void isaac_exit_40e110_refcount_store(uint32_t* slot,
                                                 uint32_t value) {
  if (slot != nullptr) {
    *slot = value;
  }
}

extern "C" void isaac_exit_40e110_refcount_inc_apply(uint8_t* node_base) {
  if (node_base == nullptr) {
    return;
  }
  uint32_t* slot = reinterpret_cast<uint32_t*>(
      node_base + ISAAC_EXIT_40E110_NODE_REFCOUNT_OFF);
  *slot = isaac_exit_40e110_refcount_inc(*slot);
}

extern "C" int32_t isaac_exit_40e110_grow_install_needed(
    uint32_t grow_result) {
  /* PE @ 0x0040e16e–0x40e174: cmp edi, 0xc798b8; je skip triple install. */
  return (grow_result !=
          static_cast<uint32_t>(ISAAC_EXIT_40E110_CACHE_BEGIN_ADDR))
             ? 1
             : 0;
}

extern "C" void isaac_exit_40e110_grow_result_clear(uint32_t* grow_obj) {
  /* PE @ 0x0040e199–0x40e1a6: [edi]=0; [edi+4]=0; [edi+8]=0. */
  if (grow_obj == nullptr) {
    return;
  }
  grow_obj[0] = 0u;
  grow_obj[1] = 0u;
  grow_obj[2] = 0u;
}

extern "C" void isaac_exit_40e110_grow_result_clear_at(uint8_t* grow_base) {
  if (grow_base == nullptr) {
    return;
  }
  isaac_exit_40e110_grow_result_clear(reinterpret_cast<uint32_t*>(grow_base));
}

extern "C" void isaac_exit_40e110_plan(
    IsaacExit40e110Plan* out, uint32_t cache_begin, uint32_t cache_end,
    uint32_t node_addr, uint32_t isnil_byte_in, uint32_t node_key, uint32_t key,
    uint32_t sentinel_addr, uint32_t path_str_addr, uint32_t path_capacity,
    uint32_t path_dword0, uint32_t grow_result, uint32_t refcount_prior) {
  const uint8_t isnil_byte = static_cast<uint8_t>(isnil_byte_in & 0xffu);
  if (out == nullptr) {
    return;
  }
  const uint32_t selected = isaac_exit_40e110_tree_hit_select(
      node_addr, isnil_byte, node_key, key, sentinel_addr);
  const int32_t space =
      isaac_exit_40e110_cache_space_ok(cache_begin, cache_end);
  const int32_t walk_done =
      isaac_exit_40e110_cache_walk_done(cache_begin, cache_end);
  const int32_t hit = isaac_exit_40e110_cache_hit(selected, sentinel_addr);
  const int32_t miss = isaac_exit_40e110_cache_miss(selected, sentinel_addr);
  const int32_t grow_install =
      isaac_exit_40e110_grow_install_needed(grow_result);

  out->cache_begin = cache_begin;
  out->cache_end = cache_end;
  out->node_addr = selected;
  out->sentinel_addr = sentinel_addr;
  out->path_data_addr = isaac_exit_40e110_path_data_addr(
      path_str_addr, path_capacity, path_dword0);
  out->path_buf_size = isaac_exit_40e110_path_buf_size();
  out->refcount_next =
      (hit != 0) ? isaac_exit_40e110_refcount_inc(refcount_prior) : 0u;
  out->cache_space_ok = space;
  out->cache_walk_done = walk_done;
  out->grow_install_needed = grow_install;
  out->cache_hit = hit;
  out->cache_miss = miss;
  out->log_needed = miss;
  out->refcount_inc_needed = hit;
}

/* --- ABI v23: residual ANM2 graphics walk host 0x0040c000 pure CF --- */

extern "C" int32_t isaac_exit_40c000_layer_count_nonzero(uint32_t count) {
  /* PE @ 0x0040c032–0x40c038: cmp [esi+0x80], ecx(=0); jbe done. */
  return (count != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_exit_40c000_loop_needed(uint32_t index,
                                                 uint32_t count) {
  /* PE @ 0x0040c1b9: cmp ecx, [esi+0x80]; jb continue. */
  return (index < count) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_40c000_layer_stride(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_40C000_LAYER_STRIDE);
}

extern "C" uint32_t isaac_exit_40c000_layer_byte_off(uint32_t index) {
  /* PE: ebx = index * 0xa0 (add ebx, 0xa0 per step). */
  return index * static_cast<uint32_t>(ISAAC_EXIT_40C000_LAYER_STRIDE);
}

extern "C" uint32_t isaac_exit_40c000_layer_ptr(uint32_t layer_base,
                                                uint32_t index) {
  /* PE @ 0x0040c040 / 0x40c09a: layer_base + ebx. */
  return layer_base + isaac_exit_40c000_layer_byte_off(index);
}

extern "C" int32_t isaac_exit_40c000_layer_skip(uint32_t flag30_in) {
  const uint8_t flag30 = static_cast<uint8_t>(flag30_in & 0xffu);
  /* PE @ 0x0040c043–0x40c048: cmp byte [ebx+eax+0x30], 0; jne next. */
  return (flag30 != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_exit_40c000_layer_body_needed(uint32_t flag30_in) {
  const uint8_t flag30 = static_cast<uint8_t>(flag30_in & 0xffu);
  return (flag30 == 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_40c000_png_str_ptr(uint32_t layer_ptr) {
  /* PE @ 0x0040c04e–0x40c051: layer + 8 (PNG MSVC string holder). */
  return layer_ptr + static_cast<uint32_t>(ISAAC_EXIT_40C000_LAYER_PNG_STR_OFF);
}

extern "C" uint32_t isaac_exit_40c000_path_data_addr(uint32_t str_addr,
                                                     uint32_t capacity,
                                                     uint32_t dword0) {
  /* PE @ 0x0040c053–0x40c059: cmp [str+0x14], 0x10; jb → str else [str]. */
  return isaac_exit_msvc_string_data_addr(str_addr, capacity, dword0);
}

extern "C" int32_t isaac_exit_40c000_shared_present(uint32_t shared_ptr) {
  /* PE @ 0x0040c06c–0x40c071: mov ecx,[ebp-0x30]; test ecx; je flag=0. */
  return (shared_ptr != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_exit_40c000_virtual_ok(uint32_t virtual_al_in) {
  const uint8_t virtual_al = static_cast<uint8_t>(virtual_al_in & 0xffu);
  /* PE @ 0x0040c079–0x40c07b / 0x40c108 / release paths: test al; je skip. */
  return (virtual_al != 0u) ? 1 : 0;
}

extern "C" uint8_t isaac_exit_40c000_graphics_flag(uint32_t shared_ptr,
                                                   uint32_t virtual_al_in) {
  const uint8_t virtual_al = static_cast<uint8_t>(virtual_al_in & 0xffu);
  /* PE @ 0x0040c06c–0x40c096: flag=1 only when shared non-null and vt[0] AL. */
  if (shared_ptr == 0u) {
    return 0u;
  }
  if (virtual_al == 0u) {
    return 0u;
  }
  return 1u;
}

extern "C" int32_t isaac_exit_40c000_sprite_present(uint32_t sprite_ptr) {
  /* PE @ 0x0040c0ac–0x40c0b1: mov edi,[ebp-0x38]; test edi; je skip. */
  return (sprite_ptr != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_exit_40c000_object_present(uint32_t obj_ptr) {
  /* PE COM release: test ecx; je skip virtual. */
  return (obj_ptr != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_exit_40c000_callback_needed(uint32_t virtual_al_in,
                                                     uint32_t global_fn) {
  const uint8_t virtual_al = static_cast<uint8_t>(virtual_al_in & 0xffu);
  /* PE @ 0x0040c11a–0x40c125 / 0x40c164–0x40c16f / 0x40c18f–0x40c19a:
     virtual AL && DAT_00c7163c != 0 → call global. Same CF as 40c7f0. */
  return (virtual_al != 0u && global_fn != 0u) ? 1 : 0;
}

extern "C" void isaac_exit_40c000_pair_zero(uint32_t* pair) {
  /* PE @ 0x0040c0e4–0x40c0ea: [edi]=0; [edi+4]=0. */
  if (pair == nullptr) {
    return;
  }
  pair[0] = 0u;
  pair[1] = 0u;
}

extern "C" void isaac_exit_40c000_pair_assign(uint32_t* pair, uint32_t value,
                                              uint32_t ctrl) {
  /* PE @ 0x0040c12d–0x40c136: [edi+4]=ctrl; [edi]=value. */
  if (pair == nullptr) {
    return;
  }
  pair[0] = value;
  pair[1] = ctrl;
}

extern "C" void isaac_exit_40c000_pair_zero_at(uint8_t* pair_base) {
  if (pair_base == nullptr) {
    return;
  }
  isaac_exit_40c000_pair_zero(reinterpret_cast<uint32_t*>(pair_base));
}

extern "C" void isaac_exit_40c000_pair_assign_at(uint8_t* pair_base,
                                                 uint32_t value,
                                                 uint32_t ctrl) {
  if (pair_base == nullptr) {
    return;
  }
  isaac_exit_40c000_pair_assign(reinterpret_cast<uint32_t*>(pair_base), value,
                                ctrl);
}

extern "C" void isaac_exit_40c000_store_layer_flags(uint8_t* flag30_slot,
                                                    uint8_t* flag31_slot,
                                                    uint32_t flag_in) {
  const uint8_t flag = static_cast<uint8_t>(flag_in & 0xffu);
  /* PE @ 0x0040c143–0x40c14d: [layer+0x30]=cl; [layer+0x31]=0. */
  if (flag30_slot != nullptr) {
    *flag30_slot = flag;
  }
  if (flag31_slot != nullptr) {
    *flag31_slot = 0u;
  }
}

extern "C" void isaac_exit_40c000_store_layer_flags_at(uint8_t* layer_base,
                                                       uint32_t flag_in) {
  const uint8_t flag = static_cast<uint8_t>(flag_in & 0xffu);
  if (layer_base == nullptr) {
    return;
  }
  layer_base[ISAAC_EXIT_40C000_LAYER_FLAG30_OFF] = flag;
  layer_base[ISAAC_EXIT_40C000_LAYER_FLAG31_OFF] = 0u;
}

extern "C" uint32_t isaac_exit_40c000_loop_next_index(uint32_t index) {
  /* PE @ 0x0040c1af: inc ecx. */
  return index + 1u;
}

extern "C" uint32_t isaac_exit_40c000_loop_next_off(uint32_t byte_off) {
  /* PE @ 0x0040c1b0: add ebx, 0xa0. */
  return byte_off + static_cast<uint32_t>(ISAAC_EXIT_40C000_LAYER_STRIDE);
}

extern "C" void isaac_exit_40c1e0_init(IsaacExit40c1e0State* state) {
  /* PE @ 0x0040c1e0–0x40c1f6 pure-complete. */
  if (state == nullptr) {
    return;
  }
  state->field0 = static_cast<uint32_t>(ISAAC_EXIT_40C1E0_FIELD0_VALUE);
  state->field4 = 0u;
  state->field8 = 0u;
  state->field_c = static_cast<uint8_t>(ISAAC_EXIT_40C1E0_FIELD_C_VALUE);
}

extern "C" void isaac_exit_40c1e0_apply(uint8_t* obj_base) {
  if (obj_base == nullptr) {
    return;
  }
  *reinterpret_cast<uint32_t*>(obj_base + 0) =
      static_cast<uint32_t>(ISAAC_EXIT_40C1E0_FIELD0_VALUE);
  *reinterpret_cast<uint32_t*>(obj_base + 4) = 0u;
  *reinterpret_cast<uint32_t*>(obj_base + 8) = 0u;
  obj_base[0xc] = static_cast<uint8_t>(ISAAC_EXIT_40C1E0_FIELD_C_VALUE);
}

extern "C" void isaac_exit_40c000_plan(
    IsaacExit40c000Plan* out, uint32_t layer_count, uint32_t layer_base_ptr,
    uint32_t index, uint32_t flag30_in, uint32_t path_capacity,
    uint32_t path_dword0, uint32_t shared_ptr, uint32_t shared_virtual_al_in,
    uint32_t sprite_ptr, uint32_t callback_virtual_al_in,
    uint32_t callback_global_fn) {
  const uint8_t flag30 = static_cast<uint8_t>(flag30_in & 0xffu);
  const uint8_t shared_virtual_al = static_cast<uint8_t>(shared_virtual_al_in & 0xffu);
  const uint8_t callback_virtual_al = static_cast<uint8_t>(callback_virtual_al_in & 0xffu);
  if (out == nullptr) {
    return;
  }
  const uint32_t layer_ptr =
      isaac_exit_40c000_layer_ptr(layer_base_ptr, index);
  const uint32_t png =
      isaac_exit_40c000_png_str_ptr(layer_ptr);
  const int32_t count_nz = isaac_exit_40c000_layer_count_nonzero(layer_count);
  const int32_t loop = isaac_exit_40c000_loop_needed(index, layer_count);
  const int32_t skip = isaac_exit_40c000_layer_skip(flag30);
  const int32_t body = isaac_exit_40c000_layer_body_needed(flag30);
  const int32_t shared = isaac_exit_40c000_shared_present(shared_ptr);
  const int32_t v_ok = isaac_exit_40c000_virtual_ok(shared_virtual_al);
  const uint8_t gflag =
      isaac_exit_40c000_graphics_flag(shared_ptr, shared_virtual_al);
  const int32_t sprite = isaac_exit_40c000_sprite_present(sprite_ptr);
  const int32_t cb = isaac_exit_40c000_callback_needed(callback_virtual_al,
                                                       callback_global_fn);

  out->layer_count = layer_count;
  out->layer_base_ptr = layer_base_ptr;
  out->index = index;
  out->layer_ptr = layer_ptr;
  out->layer_byte_off = isaac_exit_40c000_layer_byte_off(index);
  out->png_str_ptr = png;
  out->path_data_addr =
      isaac_exit_40c000_path_data_addr(png, path_capacity, path_dword0);
  out->graphics_flag = static_cast<uint32_t>(gflag);
  out->count_nonzero = count_nz;
  out->loop_needed = loop;
  out->layer_skip = skip;
  out->layer_body_needed = body;
  out->shared_present = shared;
  out->virtual_ok = v_ok;
  out->sprite_present = sprite;
  out->store_flags_needed = body; /* only body path reaches flag stores */
  out->callback_needed = cb;
}

/* --- ABI v24: residual layer-attach host 0x00408640 pure CF --- */

extern "C" int32_t isaac_exit_408640_source_present(uint32_t src_ptr) {
  /* PE @ 0x00408669–0x40866e: mov edx,[ebp+8]; test edx; je skip copy. */
  return (src_ptr != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_exit_408640_ctrl_present(uint32_t ctrl_ptr) {
  /* PE @ 0x0040869e–0x4086a3: mov ecx,[ebp+0xc]; test ecx; je skip COM. */
  return (ctrl_ptr != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_exit_408640_virtual_ok(uint32_t virtual_al_in) {
  const uint8_t virtual_al = static_cast<uint8_t>(virtual_al_in & 0xffu);
  /* PE @ 0x004086ac–0x4086ae: test al; je skip callback. */
  return (virtual_al != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_exit_408640_callback_needed(uint32_t virtual_al_in,
                                                      uint32_t global_fn) {
  const uint8_t virtual_al = static_cast<uint8_t>(virtual_al_in & 0xffu);
  /* PE @ 0x004086ac–0x4086b7: virtual AL && DAT_00c7163c != 0. */
  return (virtual_al != 0u && global_fn != 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_408640_dst_field_ptr(uint32_t layer_ptr) {
  /* PE @ 0x00408673: [ecx+0x20] destination pack base. */
  return layer_ptr + static_cast<uint32_t>(ISAAC_EXIT_408640_DST_FIELD_OFF);
}

extern "C" uint32_t isaac_exit_408640_src_field_ptr(uint32_t src_ptr) {
  /* PE @ 0x00408670: [edx+0x30] source pack base. */
  return src_ptr + static_cast<uint32_t>(ISAAC_EXIT_408640_SRC_FIELD_OFF);
}

extern "C" uint32_t isaac_exit_408640_pair_slot_ptr(uint32_t layer_ptr) {
  /* PE @ 0x0040868b: add ecx, 0x98 → SmartPointer swap this. */
  return layer_ptr + static_cast<uint32_t>(ISAAC_EXIT_408640_PAIR_SLOT_OFF);
}

extern "C" uint32_t isaac_exit_408640_dst_field_off(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_408640_DST_FIELD_OFF);
}

extern "C" uint32_t isaac_exit_408640_src_field_off(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_408640_SRC_FIELD_OFF);
}

extern "C" uint32_t isaac_exit_408640_pair_slot_off(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_408640_PAIR_SLOT_OFF);
}

extern "C" uint32_t isaac_exit_408640_field_dwords(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_408640_FIELD_DWORDS);
}

extern "C" void isaac_exit_408640_field_copy(uint32_t* dst4,
                                              const uint32_t* src4) {
  /* PE @ 0x00408670–0x408685: four dword raw copies. */
  if (dst4 == nullptr || src4 == nullptr) {
    return;
  }
  dst4[0] = src4[0];
  dst4[1] = src4[1];
  dst4[2] = src4[2];
  dst4[3] = src4[3];
}

extern "C" void isaac_exit_408640_field_copy_at(uint8_t* layer_base,
                                                 const uint8_t* src_obj) {
  if (layer_base == nullptr || src_obj == nullptr) {
    return;
  }
  isaac_exit_408640_field_copy(
      reinterpret_cast<uint32_t*>(layer_base +
                                  ISAAC_EXIT_408640_DST_FIELD_OFF),
      reinterpret_cast<const uint32_t*>(src_obj +
                                        ISAAC_EXIT_408640_SRC_FIELD_OFF));
}

extern "C" void isaac_exit_408640_field_copy_if_present_at(
    uint8_t* layer_base, const uint8_t* src_obj) {
  /* PE: test edx; je skip entire copy block. */
  if (src_obj == nullptr) {
    return;
  }
  isaac_exit_408640_field_copy_at(layer_base, src_obj);
}

extern "C" void isaac_exit_408640_plan(IsaacExit408640Plan* out,
                                        uint32_t layer_ptr, uint32_t src_ptr,
                                        uint32_t ctrl_ptr, uint32_t virtual_al_in,
                                        uint32_t callback_global_fn) {
  const uint8_t virtual_al = static_cast<uint8_t>(virtual_al_in & 0xffu);
  if (out == nullptr) {
    return;
  }
  const int32_t src_ok = isaac_exit_408640_source_present(src_ptr);
  const int32_t ctrl_ok = isaac_exit_408640_ctrl_present(ctrl_ptr);
  const int32_t v_ok = isaac_exit_408640_virtual_ok(virtual_al);
  const int32_t cb = isaac_exit_408640_callback_needed(virtual_al,
                                                       callback_global_fn);

  out->layer_ptr = layer_ptr;
  out->src_ptr = src_ptr;
  out->ctrl_ptr = ctrl_ptr;
  out->dst_field_ptr = isaac_exit_408640_dst_field_ptr(layer_ptr);
  out->src_field_ptr =
      (src_ok != 0) ? isaac_exit_408640_src_field_ptr(src_ptr) : 0u;
  out->pair_slot_ptr = isaac_exit_408640_pair_slot_ptr(layer_ptr);
  out->source_present = src_ok;
  out->field_copy_needed = src_ok;
  out->ctrl_present = ctrl_ok;
  out->virtual_ok = v_ok;
  out->callback_needed = cb;
  out->pair_swap_host_needed = 1; /* PE always calls 0x40c3b0 */
}

/* --- ABI v25: per-slot HUD residual 0x00841cf0 pure islands / CF --- */

extern "C" uint32_t isaac_exit_841cf0_p0_elem_off(uint32_t index) {
  if (index >= static_cast<uint32_t>(ISAAC_EXIT_841CF0_P0_COUNT)) {
    return 0xffffffffu;
  }
  return static_cast<uint32_t>(ISAAC_EXIT_841CF0_P0_BASE_OFF) +
         index * static_cast<uint32_t>(ISAAC_EXIT_841CF0_P0_STRIDE);
}

extern "C" void isaac_exit_841cf0_p0_elem(uint8_t* elem) {
  if (elem == nullptr) {
    return;
  }
  /* PE loop @ 0x00841d00–0x00841d1f (ecx = 0x18 iterations, eax += 0x10):
       mov dword [elem+0], 0
       mov dword [elem+8], 0xb1a4ec
       mov dword [elem+0xc], 0xb1a4ec
       mov byte  [elem+4], 0   */
  *reinterpret_cast<uint32_t*>(elem + ISAAC_EXIT_841CF0_P0_VALUE_OFF) = 0u;
  *reinterpret_cast<uint32_t*>(elem + ISAAC_EXIT_841CF0_P0_PTR_A_OFF) =
      static_cast<uint32_t>(ISAAC_EXIT_841CF0_P0_PTR_VALUE);
  *reinterpret_cast<uint32_t*>(elem + ISAAC_EXIT_841CF0_P0_PTR_B_OFF) =
      static_cast<uint32_t>(ISAAC_EXIT_841CF0_P0_PTR_VALUE);
  elem[ISAAC_EXIT_841CF0_P0_FLAG_OFF] = 0;
}

extern "C" void isaac_exit_841cf0_p0_apply(uint8_t* this_base) {
  if (this_base == nullptr) {
    return;
  }
  for (uint32_t i = 0; i < static_cast<uint32_t>(ISAAC_EXIT_841CF0_P0_COUNT);
       ++i) {
    isaac_exit_841cf0_p0_elem(this_base + isaac_exit_841cf0_p0_elem_off(i));
  }
}

extern "C" void isaac_exit_841cf0_head_clear(uint8_t* this_base) {
  if (this_base == nullptr) {
    return;
  }
  /* PE @ 0x00841d29 / 0x00841d2f: mov dword [edi+0xa], 0 (unaligned) then
     mov byte [edi+0xe], 0 — five zero bytes at +0xa..+0xe. */
  for (uint32_t i = 0;
       i < static_cast<uint32_t>(ISAAC_EXIT_841CF0_HEAD_ZERO_BYTES); ++i) {
    this_base[static_cast<uint32_t>(ISAAC_EXIT_841CF0_HEAD_DWORD_OFF) + i] = 0;
  }
}

extern "C" uint32_t isaac_exit_841cf0_p1_elem_off(uint32_t index) {
  if (index >= static_cast<uint32_t>(ISAAC_EXIT_841CF0_P1_COUNT)) {
    return 0xffffffffu;
  }
  return static_cast<uint32_t>(ISAAC_EXIT_841CF0_P1_BASE_OFF) +
         index * static_cast<uint32_t>(ISAAC_EXIT_841CF0_P1_STRIDE);
}

extern "C" uint32_t isaac_exit_841cf0_p1_host_ptr(uint32_t this_addr,
                                                  uint32_t index) {
  const uint32_t off = isaac_exit_841cf0_p1_elem_off(index);
  if (off == 0xffffffffu) {
    return 0u;
  }
  /* PE: ecx = esi where esi = this + 0x208 + i*0x18 = elem + 8. */
  return this_addr + off +
         static_cast<uint32_t>(ISAAC_EXIT_841CF0_P1_HOST_OFF);
}

extern "C" void isaac_exit_841cf0_p1_pre(uint8_t* elem) {
  if (elem == nullptr) {
    return;
  }
  /* PE @ 0x00841d36 / 0x00841d3d: mov dword [esi-8], 0; [esi-4], 0. */
  *reinterpret_cast<uint32_t*>(elem + 0) = 0u;
  *reinterpret_cast<uint32_t*>(elem + 4) = 0u;
}

extern "C" void isaac_exit_841cf0_p1_apply(uint8_t* this_base) {
  if (this_base == nullptr) {
    return;
  }
  for (uint32_t i = 0; i < static_cast<uint32_t>(ISAAC_EXIT_841CF0_P1_COUNT);
       ++i) {
    isaac_exit_841cf0_p1_pre(this_base + isaac_exit_841cf0_p1_elem_off(i));
  }
}

extern "C" uint32_t isaac_exit_841cf0_p2_elem_off(uint32_t index) {
  if (index >= static_cast<uint32_t>(ISAAC_EXIT_841CF0_P2_COUNT)) {
    return 0xffffffffu;
  }
  return static_cast<uint32_t>(ISAAC_EXIT_841CF0_P2_BASE_OFF) +
         index * static_cast<uint32_t>(ISAAC_EXIT_841CF0_P2_STRIDE);
}

extern "C" uint32_t isaac_exit_841cf0_p2_host_a_ptr(uint32_t this_addr,
                                                    uint32_t index) {
  const uint32_t off = isaac_exit_841cf0_p2_elem_off(index);
  if (off == 0xffffffffu) {
    return 0u;
  }
  return this_addr + off +
         static_cast<uint32_t>(ISAAC_EXIT_841CF0_P2_HOST_A_OFF);
}

extern "C" uint32_t isaac_exit_841cf0_p2_host_b_ptr(uint32_t this_addr,
                                                    uint32_t index) {
  const uint32_t off = isaac_exit_841cf0_p2_elem_off(index);
  if (off == 0xffffffffu) {
    return 0u;
  }
  return this_addr + off +
         static_cast<uint32_t>(ISAAC_EXIT_841CF0_P2_HOST_B_OFF);
}

extern "C" void isaac_exit_841cf0_p2_pre(uint8_t* elem) {
  if (elem == nullptr) {
    return;
  }
  /* PE @ 0x00841d63 / 0x00841d6a / 0x00841d71: [esi-0x18], [esi-0x14],
     [esi] ← 0 where esi = elem + 0x18. */
  *reinterpret_cast<uint32_t*>(elem + 0) = 0u;
  *reinterpret_cast<uint32_t*>(elem + 4) = 0u;
  *reinterpret_cast<uint32_t*>(elem + ISAAC_EXIT_841CF0_P2_TAIL_OFF) = 0u;
}

extern "C" void isaac_exit_841cf0_p2_apply(uint8_t* this_base) {
  if (this_base == nullptr) {
    return;
  }
  for (uint32_t i = 0; i < static_cast<uint32_t>(ISAAC_EXIT_841CF0_P2_COUNT);
       ++i) {
    isaac_exit_841cf0_p2_pre(this_base + isaac_exit_841cf0_p2_elem_off(i));
  }
}

extern "C" int32_t isaac_exit_841cf0_p2_host_needed(uint32_t pair_value) {
  /* PE @ 0x00841d77 / 0x00841d83: cmp dword [ecx], 0; je skip. */
  return (pair_value != 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_841cf0_vec_elem_host_ptr(uint32_t elem_ptr) {
  /* PE @ 0x00841db2: lea ecx, [esi+4]. */
  return elem_ptr +
         static_cast<uint32_t>(ISAAC_EXIT_841CF0_VEC_ELEM_HOST_OFF);
}

extern "C" uint32_t isaac_exit_841cf0_vec_next(uint32_t elem_ptr) {
  return elem_ptr +
         static_cast<uint32_t>(ISAAC_EXIT_841CF0_VEC_ELEM_STRIDE);
}

extern "C" int32_t isaac_exit_841cf0_vec_walk_needed(uint32_t begin,
                                                     uint32_t end) {
  /* PE @ 0x00841da1: cmp esi, [edi+0x6a4]; je skip loop. */
  return (begin != end) ? 1 : 0;
}

extern "C" int32_t isaac_exit_841cf0_vec_walk_continue(uint32_t next,
                                                       uint32_t end) {
  /* PE @ 0x00841dbd: cmp esi, [edi+0x6a4]; jne loop (end re-read). */
  return (next != end) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_841cf0_vec_elem_count(uint32_t begin,
                                                     uint32_t end) {
  if (end < begin) {
    return 0u;
  }
  const uint32_t span = end - begin;
  const uint32_t stride =
      static_cast<uint32_t>(ISAAC_EXIT_841CF0_VEC_ELEM_STRIDE);
  if ((span % stride) != 0u) {
    return 0u;
  }
  return span / stride;
}

extern "C" void isaac_exit_841cf0_vec_clear_end(uint32_t* end_slot,
                                                uint32_t begin_after_host) {
  if (end_slot == nullptr) {
    return;
  }
  /* PE @ 0x00841dd7 / 0x00841de6: eax = [edi+0x6a0] re-read after host
     0x00709380; mov [edi+0x6a4], eax. */
  *end_slot = begin_after_host;
}

extern "C" void isaac_exit_841cf0_word_6ac_clear(uint16_t* word_6ac) {
  if (word_6ac == nullptr) {
    return;
  }
  /* PE @ 0x00841dec: mov word [edi+0x6ac], 0. */
  *word_6ac = 0u;
}

extern "C" void isaac_exit_841cf0_terminal_clear(uint32_t* field_0) {
  if (field_0 == nullptr) {
    return;
  }
  /* PE @ 0x00841e09: mov dword [edi], 0 (last store before ret). */
  *field_0 = 0u;
}

extern "C" void isaac_exit_841cf0_pure_apply(uint8_t* this_base,
                                             uint32_t vec_begin_after_host) {
  if (this_base == nullptr) {
    return;
  }
  isaac_exit_841cf0_p0_apply(this_base);
  isaac_exit_841cf0_head_clear(this_base);
  isaac_exit_841cf0_p1_apply(this_base);
  isaac_exit_841cf0_p2_apply(this_base);
  isaac_exit_841cf0_vec_clear_end(
      reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_841CF0_VEC_END_OFF),
      vec_begin_after_host);
  isaac_exit_841cf0_word_6ac_clear(
      reinterpret_cast<uint16_t*>(this_base + ISAAC_EXIT_841CF0_WORD_6AC_OFF));
  isaac_exit_841cf0_terminal_clear(
      reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_841CF0_TERMINAL_OFF));
}

/* --- ABI v25: residual 0x0083abb0 pure islands / CF --- */

extern "C" uint32_t isaac_exit_83abb0_block_base_off(uint32_t block) {
  if (block >= static_cast<uint32_t>(ISAAC_EXIT_83ABB0_BLOCK_COUNT)) {
    return 0xffffffffu;
  }
  /* PE: edi = this + 0xc then edi += 0x14 per block; block base = edi-0xc. */
  return block * static_cast<uint32_t>(ISAAC_EXIT_83ABB0_BLOCK_STRIDE);
}

extern "C" int32_t isaac_exit_83abb0_walk_needed(uint32_t begin,
                                                 uint32_t end) {
  /* PE @ 0x0083abc9: cmp esi, edx; je skip. */
  return (begin != end) ? 1 : 0;
}

extern "C" int32_t isaac_exit_83abb0_walk_continue(uint32_t next,
                                                   uint32_t end) {
  /* PE @ 0x0083abdf: cmp esi, edx; jne loop (edx re-read at 0x0083abda). */
  return (next != end) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_83abb0_elem_host_ptr(uint32_t elem_ptr) {
  /* PE @ 0x0083abd2: lea ecx, [esi+4]. */
  return elem_ptr + static_cast<uint32_t>(ISAAC_EXIT_83ABB0_ELEM_HOST_OFF);
}

extern "C" uint32_t isaac_exit_83abb0_elem_next(uint32_t elem_ptr) {
  return elem_ptr + static_cast<uint32_t>(ISAAC_EXIT_83ABB0_ELEM_STRIDE);
}

extern "C" uint32_t isaac_exit_83abb0_elem_count(uint32_t begin,
                                                 uint32_t end) {
  if (end < begin) {
    return 0u;
  }
  const uint32_t span = end - begin;
  const uint32_t stride =
      static_cast<uint32_t>(ISAAC_EXIT_83ABB0_ELEM_STRIDE);
  if ((span % stride) != 0u) {
    return 0u;
  }
  return span / stride;
}

extern "C" void isaac_exit_83abb0_block_post(uint8_t* block_base,
                                             uint32_t begin_after_host) {
  if (block_base == nullptr) {
    return;
  }
  /* PE @ 0x0083abec–0x0083abf8: eax = [edi-4] re-read after host
     0x00709300; mov [edi], eax; mov byte [edi-8], 0; mov [edi-0xc], 0. */
  *reinterpret_cast<uint32_t*>(block_base + ISAAC_EXIT_83ABB0_VEC_END_OFF) =
      begin_after_host;
  block_base[ISAAC_EXIT_83ABB0_FLAG4_OFF] = 0;
  *reinterpret_cast<uint32_t*>(block_base + ISAAC_EXIT_83ABB0_FIELD0_OFF) = 0u;
}

extern "C" void isaac_exit_83abb0_terminal_clear(uint8_t* flag_28) {
  if (flag_28 == nullptr) {
    return;
  }
  /* PE @ 0x0083ac0c: mov byte [eax+0x28], bl with bl = 0 after the loop. */
  *flag_28 = 0;
}

extern "C" void isaac_exit_83abb0_apply(uint8_t* this_base,
                                        const uint32_t* begin_after_host) {
  if (this_base == nullptr || begin_after_host == nullptr) {
    return;
  }
  for (uint32_t b = 0;
       b < static_cast<uint32_t>(ISAAC_EXIT_83ABB0_BLOCK_COUNT); ++b) {
    isaac_exit_83abb0_block_post(
        this_base + isaac_exit_83abb0_block_base_off(b), begin_after_host[b]);
  }
  isaac_exit_83abb0_terminal_clear(this_base + ISAAC_EXIT_83ABB0_TERMINAL_OFF);
}

/* --- ABI v25: shared range COM destroy CF (0x00709380 / 0x00709300) --- */

extern "C" uint32_t isaac_exit_range_destroy_stride_709380(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_709380_ELEM_STRIDE);
}

extern "C" uint32_t isaac_exit_range_destroy_stride_709300(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_709300_ELEM_STRIDE);
}

extern "C" int32_t isaac_exit_range_destroy_loop_needed(uint32_t begin,
                                                        uint32_t end) {
  /* PE @ 0x00709326 / 0x007093a6: cmp ecx, edi; je epilog. */
  return (begin != end) ? 1 : 0;
}

extern "C" int32_t isaac_exit_range_destroy_continue(uint32_t next,
                                                     uint32_t end) {
  /* PE @ 0x00709365 / 0x007093e5: lea eax,[esi-4]; cmp eax, edi; jne. */
  return (next != end) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_range_destroy_ctrl_ptr(uint32_t elem_ptr) {
  /* PE: esi = elem + 4; ctrl = [esi+4] = [elem+8]. */
  return elem_ptr + static_cast<uint32_t>(ISAAC_EXIT_RANGE_DESTROY_CTRL_OFF);
}

extern "C" uint32_t isaac_exit_range_destroy_cb_arg_ptr(uint32_t elem_ptr) {
  /* PE: push esi where esi = elem + 4. */
  return elem_ptr + static_cast<uint32_t>(ISAAC_EXIT_RANGE_DESTROY_CB_ARG_OFF);
}

extern "C" uint32_t isaac_exit_range_destroy_next(uint32_t elem_ptr,
                                                  uint32_t stride) {
  return elem_ptr + stride;
}

extern "C" int32_t isaac_exit_range_destroy_ctrl_present(uint32_t ctrl_ptr) {
  /* PE: test ecx, ecx; je skip. */
  return (ctrl_ptr != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_exit_range_destroy_virtual_ok(uint32_t virtual_al_in) {
  const uint8_t virtual_al = static_cast<uint8_t>(virtual_al_in & 0xffu);
  /* PE: test al, al; je skip. */
  return (virtual_al != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_exit_range_destroy_callback_needed(
    uint32_t ctrl_ptr, uint32_t virtual_al_in, uint32_t global_fn) {
  const uint8_t virtual_al = static_cast<uint8_t>(virtual_al_in & 0xffu);
  return (ctrl_ptr != 0u && virtual_al != 0u && global_fn != 0u) ? 1 : 0;
}

/* --- ABI v25: pure-complete tail-jmp 0x0084bfd0 --- */

extern "C" uint32_t isaac_exit_84bfd0_slot_kind(uint32_t dword_index) {
  if (dword_index >= static_cast<uint32_t>(ISAAC_EXIT_84BFD0_BLOCK_DWORDS)) {
    return 0xffffffffu;
  }
  const uint32_t elem_dwords =
      static_cast<uint32_t>(ISAAC_EXIT_84BFD0_ELEM_DWORDS);
  if ((dword_index % elem_dwords) != (elem_dwords - 1u)) {
    return static_cast<uint32_t>(ISAAC_EXIT_84BFD0_SLOT_ZERO);
  }
  /* Element slot 4: untouched for elements 0..5, 0.1f for 6..9. */
  if ((dword_index / elem_dwords) <
      static_cast<uint32_t>(ISAAC_EXIT_84BFD0_FLOAT_ELEM_FIRST)) {
    return static_cast<uint32_t>(ISAAC_EXIT_84BFD0_SLOT_SKIP);
  }
  return static_cast<uint32_t>(ISAAC_EXIT_84BFD0_SLOT_FLOAT);
}

extern "C" uint32_t isaac_exit_84bfd0_block_base_off(uint32_t block) {
  if (block >= static_cast<uint32_t>(ISAAC_EXIT_84BFD0_BLOCK_COUNT)) {
    return 0xffffffffu;
  }
  /* PE: eax = this + 0x128; first store [eax-0x14] = this + 0x114. */
  return static_cast<uint32_t>(ISAAC_EXIT_84BFD0_BASE_OFF) +
         block * static_cast<uint32_t>(ISAAC_EXIT_84BFD0_BLOCK_STRIDE);
}

extern "C" uint32_t isaac_exit_84bfd0_slot_off(uint32_t block,
                                               uint32_t dword_index) {
  const uint32_t base = isaac_exit_84bfd0_block_base_off(block);
  if (base == 0xffffffffu ||
      dword_index >= static_cast<uint32_t>(ISAAC_EXIT_84BFD0_BLOCK_DWORDS)) {
    return 0xffffffffu;
  }
  return base + dword_index * 4u;
}

extern "C" uint32_t isaac_exit_84bfd0_f32_bits(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_84BFD0_F32_BITS);
}

extern "C" void isaac_exit_84bfd0_apply_block(uint8_t* block_base) {
  if (block_base == nullptr) {
    return;
  }
  for (uint32_t i = 0;
       i < static_cast<uint32_t>(ISAAC_EXIT_84BFD0_BLOCK_DWORDS); ++i) {
    const uint32_t kind = isaac_exit_84bfd0_slot_kind(i);
    if (kind == static_cast<uint32_t>(ISAAC_EXIT_84BFD0_SLOT_SKIP)) {
      continue;
    }
    uint32_t* slot = reinterpret_cast<uint32_t*>(block_base + i * 4u);
    *slot = (kind == static_cast<uint32_t>(ISAAC_EXIT_84BFD0_SLOT_FLOAT))
                ? static_cast<uint32_t>(ISAAC_EXIT_84BFD0_F32_BITS)
                : 0u;
  }
}

extern "C" void isaac_exit_84bfd0_apply(uint8_t* this_base) {
  if (this_base == nullptr) {
    return;
  }
  for (uint32_t b = 0;
       b < static_cast<uint32_t>(ISAAC_EXIT_84BFD0_BLOCK_COUNT); ++b) {
    isaac_exit_84bfd0_apply_block(this_base +
                                  isaac_exit_84bfd0_block_base_off(b));
  }
  /* PE @ 0x0084c163: mov byte [ecx+0x2ac], dl with dl = 0 after the loop. */
  this_base[ISAAC_EXIT_84BFD0_TERMINAL_OFF] = 0;
}

/* --- ABI v26: buffer-free residual 0x00840f70 pure islands / CF --- */

extern "C" uint32_t isaac_exit_840f70_slot_off(uint32_t index) {
  if (index >= static_cast<uint32_t>(ISAAC_EXIT_840F70_SLOT_COUNT)) {
    return 0xffffffffu;
  }
  return index * static_cast<uint32_t>(ISAAC_EXIT_840F70_SLOT_STRIDE);
}

extern "C" uint32_t isaac_exit_840f70_slot_ptr(uint32_t this_addr,
                                               uint32_t index) {
  const uint32_t off = isaac_exit_840f70_slot_off(index);
  if (off == 0xffffffffu) {
    return 0u;
  }
  /* PE @ 0x00840fa0: mov ecx, [edi + esi*4]. */
  return this_addr + off;
}

extern "C" int32_t isaac_exit_840f70_free_needed(uint32_t slot_value) {
  /* PE @ 0x00840fa3: test ecx, ecx; je 0x840fd4. */
  return (slot_value != 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_840f70_heap_stats_base(
    uint32_t heap_stats_global) {
  /* PE @ 0x00840fa7–0x00840fb6: DAT_00c7de78 ? +0x30 : DAT_00c7f618. */
  if (heap_stats_global != 0u) {
    return heap_stats_global +
           static_cast<uint32_t>(ISAAC_EXIT_840F70_HEAP_STATS_DELTA);
  }
  return static_cast<uint32_t>(ISAAC_EXIT_840F70_HEAP_STATS_FALLBACK);
}

extern "C" uint32_t isaac_exit_840f70_free_base_ptr(uint32_t slot_value) {
  /* PE @ 0x00840fbe: add ecx, -4 (32-bit wrap). */
  return slot_value - static_cast<uint32_t>(ISAAC_EXIT_840F70_HEADER_DELTA);
}

extern "C" uint32_t isaac_exit_840f70_header_size_ptr(uint32_t slot_value) {
  /* PE @ 0x00840fbb: mov eax, [ecx-4] — same address as the free base. */
  return slot_value - static_cast<uint32_t>(ISAAC_EXIT_840F70_HEADER_DELTA);
}

extern "C" uint32_t isaac_exit_840f70_stats_sub_lo(uint32_t lo,
                                                   uint32_t size) {
  /* PE @ 0x00840fc1: sub dword [edx], eax (32-bit wrap). */
  return lo - size;
}

extern "C" uint32_t isaac_exit_840f70_stats_sub_borrow(uint32_t lo,
                                                       uint32_t size) {
  /* CF of the 32-bit subtract is exactly the unsigned compare. */
  return (lo < size) ? 1u : 0u;
}

extern "C" uint32_t isaac_exit_840f70_stats_sub_hi(uint32_t lo, uint32_t hi,
                                                   uint32_t size) {
  /* PE @ 0x00840fc4: sbb dword [edx+4], 0 → hi - CF. */
  return hi - isaac_exit_840f70_stats_sub_borrow(lo, size);
}

extern "C" void isaac_exit_840f70_stats_sub(uint32_t* lo, uint32_t* hi,
                                            uint32_t size) {
  if (lo == nullptr || hi == nullptr) {
    return;
  }
  const uint32_t old_lo = *lo;
  *lo = isaac_exit_840f70_stats_sub_lo(old_lo, size);
  *hi = isaac_exit_840f70_stats_sub_hi(old_lo, *hi, size);
}

extern "C" void isaac_exit_840f70_stats_sub_at(uint8_t* stats_base,
                                               uint32_t size) {
  if (stats_base == nullptr) {
    return;
  }
  isaac_exit_840f70_stats_sub(
      reinterpret_cast<uint32_t*>(stats_base + ISAAC_EXIT_840F70_STATS_LO_OFF),
      reinterpret_cast<uint32_t*>(stats_base + ISAAC_EXIT_840F70_STATS_HI_OFF),
      size);
}

extern "C" void isaac_exit_840f70_slot_clear(uint32_t* slot) {
  if (slot == nullptr) {
    return;
  }
  /* PE @ 0x00840fcd: mov dword [edi + esi*4], 0 (after the host free). */
  *slot = 0u;
}

extern "C" uint32_t isaac_exit_840f70_apply(uint8_t* this_base) {
  if (this_base == nullptr) {
    return 0u;
  }
  uint32_t frees = 0u;
  for (uint32_t i = 0; i < static_cast<uint32_t>(ISAAC_EXIT_840F70_SLOT_COUNT);
       ++i) {
    uint32_t* slot = reinterpret_cast<uint32_t*>(
        this_base + isaac_exit_840f70_slot_off(i));
    if (isaac_exit_840f70_free_needed(*slot) != 0) {
      ++frees;
      isaac_exit_840f70_slot_clear(slot);
    }
  }
  return frees;
}

extern "C" void isaac_exit_840f70_slot_plan(IsaacExit840f70SlotPlan* out,
                                            uint32_t this_addr,
                                            uint32_t index,
                                            uint32_t slot_value,
                                            uint32_t heap_stats_global,
                                            uint32_t header_size,
                                            uint32_t stats_lo,
                                            uint32_t stats_hi) {
  if (out == nullptr) {
    return;
  }
  const int32_t needed = isaac_exit_840f70_free_needed(slot_value);
  const uint32_t base =
      (needed != 0) ? isaac_exit_840f70_heap_stats_base(heap_stats_global) : 0u;

  out->index = index;
  out->slot_ptr = isaac_exit_840f70_slot_ptr(this_addr, index);
  out->slot_value = slot_value;
  out->free_needed = needed;
  out->free_base_ptr =
      (needed != 0) ? isaac_exit_840f70_free_base_ptr(slot_value) : 0u;
  out->stats_base = base;
  out->stats_lo_ptr =
      (needed != 0)
          ? base + static_cast<uint32_t>(ISAAC_EXIT_840F70_STATS_LO_OFF)
          : 0u;
  out->stats_hi_ptr =
      (needed != 0)
          ? base + static_cast<uint32_t>(ISAAC_EXIT_840F70_STATS_HI_OFF)
          : 0u;
  out->header_size = (needed != 0) ? header_size : 0u;
  out->stats_lo_after =
      (needed != 0) ? isaac_exit_840f70_stats_sub_lo(stats_lo, header_size)
                    : 0u;
  out->stats_hi_after =
      (needed != 0)
          ? isaac_exit_840f70_stats_sub_hi(stats_lo, stats_hi, header_size)
          : 0u;
}

/* --- ABI v26: pair-replace residual 0x00709150 pure islands / CF --- */

extern "C" uint32_t isaac_exit_709150_alloc_size(void) {
  /* PE @ 0x00709177: push 0x18. */
  return static_cast<uint32_t>(ISAAC_EXIT_709150_ALLOC_SIZE);
}

extern "C" int32_t isaac_exit_709150_alloc_ok(uint32_t alloc_ptr) {
  /* PE @ 0x0070918d: test edi, edi; je 0x7091a7. */
  return (alloc_ptr != 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_709150_new_object_value(uint32_t alloc_ptr) {
  /* PE @ 0x007091a7: xor edi, edi on the failure path. */
  return (isaac_exit_709150_alloc_ok(alloc_ptr) != 0) ? alloc_ptr : 0u;
}

extern "C" void isaac_exit_709150_object_finish(uint32_t* vtable_slot,
                                                uint32_t* field_14_slot) {
  /* PE @ 0x00709198 / 0x0070919e, after nested ctor 0x0040cc10. */
  if (vtable_slot != nullptr) {
    *vtable_slot = static_cast<uint32_t>(ISAAC_EXIT_709150_VTABLE);
  }
  if (field_14_slot != nullptr) {
    *field_14_slot = 0u;
  }
}

extern "C" void isaac_exit_709150_object_finish_apply(uint8_t* obj_base) {
  if (obj_base == nullptr) {
    return;
  }
  isaac_exit_709150_object_finish(
      reinterpret_cast<uint32_t*>(obj_base),
      reinterpret_cast<uint32_t*>(obj_base + ISAAC_EXIT_709150_FIELD_14_OFF));
}

extern "C" int32_t isaac_exit_709150_old_object_present(uint32_t old_obj) {
  /* PE @ 0x007091b0–0x007091b5: mov ecx,[esi+4]; test ecx,ecx; je. */
  return (old_obj != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_exit_709150_virtual_ok(uint32_t virtual_al_in) {
  const uint8_t virtual_al = static_cast<uint8_t>(virtual_al_in & 0xffu);
  /* PE @ 0x007091be: test al, al; je. */
  return (virtual_al != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_exit_709150_callback_needed(uint32_t old_obj,
                                                     uint32_t virtual_al_in,
                                                     uint32_t global_fn) {
  const uint8_t virtual_al = static_cast<uint8_t>(virtual_al_in & 0xffu);
  /* PE @ 0x007091c2: DAT_00c71644 gate after the virtual AL check. */
  return (old_obj != 0u && virtual_al != 0u && global_fn != 0u) ? 1 : 0;
}

extern "C" void isaac_exit_709150_pair_apply(uint32_t* value_slot,
                                             uint32_t* obj_slot,
                                             uint32_t new_obj) {
  /* PE @ 0x007091d1 / 0x007091d7: mov dword [esi], 0; mov [esi+4], edi. */
  if (value_slot != nullptr) {
    *value_slot = 0u;
  }
  if (obj_slot != nullptr) {
    *obj_slot = new_obj;
  }
}

extern "C" void isaac_exit_709150_pair_apply_base(uint8_t* pair_base,
                                                  uint32_t new_obj) {
  if (pair_base == nullptr) {
    return;
  }
  isaac_exit_709150_pair_apply(
      reinterpret_cast<uint32_t*>(pair_base + ISAAC_EXIT_709150_PAIR_VALUE_OFF),
      reinterpret_cast<uint32_t*>(pair_base + ISAAC_EXIT_709150_PAIR_OBJ_OFF),
      new_obj);
}

extern "C" void isaac_exit_709150_plan(IsaacExit709150Plan* out,
                                       uint32_t this_addr, uint32_t alloc_ptr,
                                       uint32_t old_object, uint32_t virtual_al_in,
                                       uint32_t callback_global_fn) {
  const uint8_t virtual_al = static_cast<uint8_t>(virtual_al_in & 0xffu);
  if (out == nullptr) {
    return;
  }
  const int32_t ok = isaac_exit_709150_alloc_ok(alloc_ptr);
  const uint32_t new_obj = isaac_exit_709150_new_object_value(alloc_ptr);

  out->this_addr = this_addr;
  out->alloc_size = isaac_exit_709150_alloc_size();
  out->alloc_ptr = alloc_ptr;
  out->alloc_ok = ok;
  out->new_object = new_obj;
  out->ctor_host_needed = ok;
  out->finish_needed = ok;
  out->vtable_value = static_cast<uint32_t>(ISAAC_EXIT_709150_VTABLE);
  out->old_object = old_object;
  out->old_object_present =
      isaac_exit_709150_old_object_present(old_object);
  out->virtual_ok = isaac_exit_709150_virtual_ok(virtual_al);
  out->callback_needed = isaac_exit_709150_callback_needed(
      old_object, virtual_al, callback_global_fn);
  out->value_slot_ptr =
      this_addr + static_cast<uint32_t>(ISAAC_EXIT_709150_PAIR_VALUE_OFF);
  out->obj_slot_ptr =
      this_addr + static_cast<uint32_t>(ISAAC_EXIT_709150_PAIR_OBJ_OFF);
  out->value_slot_after = 0u; /* PE stores an immediate 0, not the arg */
  out->obj_slot_after = new_obj;
}

/* --- ABI v27: teardown residual 0x00a1ad90 pure islands / CF --- */

extern "C" int32_t isaac_exit_a1ad90_block_a_needed(uint32_t ptr_28) {
  /* PE @ 0x00a1adb8–0x00a1adbd: mov edx,[ebx+0x28]; test edx,edx; je. */
  return (ptr_28 != 0u) ? 1 : 0;
}

extern "C" void isaac_exit_a1ad90_block_a_clear(uint32_t* slot_28) {
  if (slot_28 == nullptr) {
    return;
  }
  /* PE @ 0x00a1addb: mov dword [ebx+0x28], 0 after the host free. */
  *slot_28 = 0u;
}

extern "C" int32_t isaac_exit_a1ad90_block_b_needed(uint32_t arr_3c) {
  /* PE @ 0x00a1ade2–0x00a1ade7: mov eax,[ebx+0x3c]; test eax,eax; je. */
  return (arr_3c != 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_a1ad90_header_ptr(uint32_t arr_3c) {
  /* PE @ 0x00a1adee: lea esi,[eax-4] — count dword and free base. */
  return arr_3c - static_cast<uint32_t>(ISAAC_EXIT_A1AD90_HEADER_DELTA);
}

extern "C" uint32_t isaac_exit_a1ad90_elem_size(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_A1AD90_ELEM_SIZE);
}

extern "C" uint32_t isaac_exit_a1ad90_elem_dtor(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_A1AD90_ELEM_DTOR);
}

extern "C" uint32_t isaac_exit_a1ad90_dtor_count_arg(uint32_t count_before) {
  /* PE @ 0x00a1adf8: push dword [esi] — read BEFORE host 0x00aef638. */
  return count_before;
}

extern "C" uint32_t isaac_exit_a1ad90_free_size(uint32_t count_after) {
  /* PE @ 0x00a1ae02–0x00a1ae04: mov eax,[esi] (RE-READ after the host
     iterator) then lea eax,[eax*8+4]. 32-bit wrap is preserved. */
  return count_after * 8u +
         static_cast<uint32_t>(ISAAC_EXIT_A1AD90_FREE_SIZE_ADD);
}

extern "C" void isaac_exit_a1ad90_block_b_clear(uint32_t* slot_3c) {
  if (slot_3c == nullptr) {
    return;
  }
  /* PE @ 0x00a1ae15: mov dword [ebx+0x3c], 0. */
  *slot_3c = 0u;
}

extern "C" uint32_t isaac_exit_a1ad90_tree_obj_ptr(uint32_t this_addr) {
  /* PE @ 0x00a1ae1f: lea edi,[ebx+0x40] — the map object itself. */
  return this_addr + static_cast<uint32_t>(ISAAC_EXIT_A1AD90_TREE_OFF);
}

extern "C" uint32_t isaac_exit_a1ad90_tree_head_ptr(uint32_t this_addr) {
  /* PE @ 0x00a1ae1c: mov esi,[ebx+0x40] — head pointer field address. */
  return this_addr + static_cast<uint32_t>(ISAAC_EXIT_A1AD90_TREE_OFF);
}

extern "C" uint32_t isaac_exit_a1ad90_tree_size_ptr(uint32_t this_addr) {
  return this_addr + static_cast<uint32_t>(ISAAC_EXIT_A1AD90_TREE_SIZE_OFF);
}

extern "C" uint32_t isaac_exit_a1ad90_tree_root_ptr(uint32_t head_addr) {
  /* PE @ 0x00a1ae24: push dword [esi+4] — _Root(), read before the host. */
  return head_addr + static_cast<uint32_t>(ISAAC_EXIT_TREE_PARENT_OFF);
}

extern "C" void isaac_exit_a1ad90_tree_reset_at(uint8_t* head_base,
                                                uint32_t head_addr) {
  if (head_base == nullptr) {
    return;
  }
  /* PE @ 0x00a1ae2d / 0x00a1ae30 / 0x00a1ae32, in that order. The head
     value is the one captured BEFORE host 0x0042c8e0 (callee-saved esi). */
  *reinterpret_cast<uint32_t*>(head_base + ISAAC_EXIT_TREE_PARENT_OFF) =
      head_addr;
  *reinterpret_cast<uint32_t*>(head_base + ISAAC_EXIT_TREE_LEFT_OFF) =
      head_addr;
  *reinterpret_cast<uint32_t*>(head_base + ISAAC_EXIT_TREE_RIGHT_OFF) =
      head_addr;
}

extern "C" void isaac_exit_a1ad90_tree_size_clear(uint32_t* size_44) {
  if (size_44 == nullptr) {
    return;
  }
  /* PE @ 0x00a1ae35: mov dword [edi+4], 0. */
  *size_44 = 0u;
}

extern "C" void isaac_exit_a1ad90_terminal(uint8_t* this_base) {
  if (this_base == nullptr) {
    return;
  }
  /* PE @ 0x00a1ae3c: mov BYTE [ebx], 0 — one byte only. */
  this_base[ISAAC_EXIT_A1AD90_TERMINAL_BYTE_OFF] = 0;
  /* PE @ 0x00a1ae3f / 0x00a1ae46: dword stores. */
  *reinterpret_cast<uint32_t*>(this_base +
                               ISAAC_EXIT_A1AD90_TERMINAL_24_OFF) = 0u;
  *reinterpret_cast<uint32_t*>(this_base +
                               ISAAC_EXIT_A1AD90_TERMINAL_38_OFF) = 0u;
}

extern "C" uint32_t isaac_exit_a1ad90_apply_this(uint8_t* this_base) {
  if (this_base == nullptr) {
    return 0u;
  }
  uint32_t hosts = 0u;
  uint32_t* slot_a = reinterpret_cast<uint32_t*>(
      this_base + ISAAC_EXIT_A1AD90_BLOCK_A_OFF);
  if (isaac_exit_a1ad90_block_a_needed(*slot_a) != 0) {
    hosts |= static_cast<uint32_t>(ISAAC_EXIT_A1AD90_HOST_A_NEEDED_BIT);
    isaac_exit_a1ad90_block_a_clear(slot_a);
  }
  uint32_t* slot_b = reinterpret_cast<uint32_t*>(
      this_base + ISAAC_EXIT_A1AD90_BLOCK_B_OFF);
  if (isaac_exit_a1ad90_block_b_needed(*slot_b) != 0) {
    hosts |= static_cast<uint32_t>(ISAAC_EXIT_A1AD90_HOST_B_NEEDED_BIT);
    isaac_exit_a1ad90_block_b_clear(slot_b);
  }
  isaac_exit_a1ad90_tree_size_clear(reinterpret_cast<uint32_t*>(
      this_base + ISAAC_EXIT_A1AD90_TREE_SIZE_OFF));
  isaac_exit_a1ad90_terminal(this_base);
  return hosts;
}

extern "C" void isaac_exit_a1ad90_plan(IsaacExitA1ad90Plan* out,
                                       uint32_t this_addr, uint32_t ptr_28,
                                       uint32_t arr_3c,
                                       uint32_t count_before,
                                       uint32_t count_after,
                                       uint32_t tree_head) {
  if (out == nullptr) {
    return;
  }
  const int32_t a = isaac_exit_a1ad90_block_a_needed(ptr_28);
  const int32_t b = isaac_exit_a1ad90_block_b_needed(arr_3c);
  const uint32_t hdr = (b != 0) ? isaac_exit_a1ad90_header_ptr(arr_3c) : 0u;

  out->this_addr = this_addr;
  out->ptr_28 = ptr_28;
  out->block_a_needed = a;
  out->arr_3c = arr_3c;
  out->block_b_needed = b;
  out->header_ptr = hdr;
  out->dtor_base = (b != 0) ? arr_3c : 0u;
  out->dtor_elem_size = isaac_exit_a1ad90_elem_size();
  out->dtor_count =
      (b != 0) ? isaac_exit_a1ad90_dtor_count_arg(count_before) : 0u;
  out->dtor_fn = isaac_exit_a1ad90_elem_dtor();
  out->free_base_ptr = hdr;
  /* Deliberately count_after, never count_before. */
  out->free_size = (b != 0) ? isaac_exit_a1ad90_free_size(count_after) : 0u;
  out->tree_obj_ptr = isaac_exit_a1ad90_tree_obj_ptr(this_addr);
  out->tree_head = tree_head;
  out->tree_root_ptr = isaac_exit_a1ad90_tree_root_ptr(tree_head);
  out->tree_size_ptr = isaac_exit_a1ad90_tree_size_ptr(this_addr);
}

/* --- ABI v27: recovered call shape of host 0x00a648b0 (body stays host) --- */

extern "C" uint32_t isaac_exit_a648b0_mode_from_cl(uint32_t ecx) {
  /* PE @ 0x00a648c7: movzx eax, cl. Only the low byte is significant. */
  return ecx & static_cast<uint32_t>(ISAAC_EXIT_A648B0_MODE_MASK);
}

extern "C" uint32_t isaac_exit_a648b0_mode_free(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_A648B0_MODE_FREE);
}

extern "C" int32_t isaac_exit_a648b0_mode1_free_needed(uint32_t edx_ptr) {
  /* PE @ 0x00a648ef: test edx, edx; je. */
  return (edx_ptr != 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_a648b0_mode1_header_size_ptr(
    uint32_t edx_ptr) {
  /* PE @ 0x00a648f3: mov eax, [edx-4]. */
  return edx_ptr - static_cast<uint32_t>(ISAAC_EXIT_A648B0_HEADER_DELTA);
}

extern "C" uint32_t isaac_exit_a648b0_mode1_free_base_ptr(uint32_t edx_ptr) {
  /* PE @ 0x00a648f6: lea ecx, [edx-4]. */
  return edx_ptr - static_cast<uint32_t>(ISAAC_EXIT_A648B0_HEADER_DELTA);
}

extern "C" uint32_t isaac_exit_a648b0_heap_stats_base(
    uint32_t heap_stats_global) {
  /* PE @ 0x00a648b5–0x00a648c2: same select as 0x00840f70 / v20 / v21. */
  if (heap_stats_global != 0u) {
    return heap_stats_global +
           static_cast<uint32_t>(ISAAC_EXIT_A648B0_HEAP_STATS_DELTA);
  }
  return static_cast<uint32_t>(ISAAC_EXIT_A648B0_HEAP_STATS_FALLBACK);
}

/* --- ABI v43: decision laws of the host 0x00a648b0 body ---
   PE 0x00a648b0..0x00a6490f (656 B window already census'd at v27 as a
   standalone body). v27 recovered the call shape and mode-1 gates; these
   laws pin the remaining BODY decisions: the full dispatch chain, the
   mode-2 stats-add path (direct edi base, addend pair, 64-bit add with
   carry), and the packed mode plan. The mode-1 64-bit borrow subtract is
   the SAME arithmetic as the v26 0x00840f70 laws (documented, not
   duplicated); IAT free 0x00b187dc stays host. */

extern "C" uint32_t isaac_exit_a648b0_mode_path(uint32_t mode) {
  /* PE @ 0x00a648c7: movzx eax, cl — low byte only. Then:
     sub eax,0 / je 0xa6490f (mode 0 -> done, no store)
     sub eax,1 / je 0xa648ef (mode 1 -> free path)
     sub eax,1 / jne 0xa64909 (mode >= 3 -> done)
     (mode 2 falls through to the stats-add path). */
  const uint8_t m =
      static_cast<uint8_t>(mode & static_cast<uint32_t>(ISAAC_EXIT_A648B0_MODE_MASK));
  if (m == static_cast<uint8_t>(ISAAC_EXIT_A648B0_MODE_FREE)) {
    return 1u;
  }
  if (m == static_cast<uint8_t>(ISAAC_EXIT_A648B0_MODE_STATS)) {
    return 2u;
  }
  return 0u;
}

extern "C" uint32_t isaac_exit_a648b0_mode_stats(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_A648B0_MODE_STATS);
}

extern "C" uint32_t isaac_exit_a648b0_mode2_stats_base_ptr(
    uint32_t heap_stats_global) {
  /* PE @ 0x00a648de/0x00a648e6: add/adc dword [edi+0x30]/[edi+0x34]
     where edi = [0xc7de78]. Mode 2 uses edi DIRECTLY: there is NO
     0xc7f618 fallback (the esi select + fallback is only for mode 1).
     With heap_stats_global == 0 the PE would address 0x30 — the law
     reproduces the raw 32-bit wrap instead of "fixing" it. */
  return heap_stats_global +
         static_cast<uint32_t>(ISAAC_EXIT_A648B0_MODE2_BASE_OFF);
}

extern "C" uint32_t isaac_exit_a648b0_mode2_addend_lo_va(void) {
  /* PE @ 0x00a648d9: mov eax, dword ptr [0xc7f618]. */
  return static_cast<uint32_t>(ISAAC_EXIT_A648B0_MODE2_ADDEND_LO_VA);
}

extern "C" uint32_t isaac_exit_a648b0_mode2_addend_hi_va(void) {
  /* PE @ 0x00a648e1: mov eax, dword ptr [0xc7f61c]. */
  return static_cast<uint32_t>(ISAAC_EXIT_A648B0_MODE2_ADDEND_HI_VA);
}

extern "C" uint32_t isaac_exit_a648b0_stats_add_lo(uint32_t lo,
                                                   uint32_t add_lo) {
  /* PE @ 0x00a648de: add dword [edi+0x30], eax (32-bit wrap). */
  return lo + add_lo;
}

extern "C" uint32_t isaac_exit_a648b0_stats_add_carry(uint32_t lo,
                                                      uint32_t add_lo) {
  /* CF of the 32-bit add is exactly the unsigned wrap compare. */
  return (lo + add_lo) < lo ? 1u : 0u;
}

extern "C" uint32_t isaac_exit_a648b0_stats_add_hi(uint32_t lo, uint32_t hi,
                                                   uint32_t add_lo,
                                                   uint32_t add_hi) {
  /* PE @ 0x00a648e6: adc dword [edi+0x34], eax — hi + add_hi + CF. */
  return hi + add_hi + isaac_exit_a648b0_stats_add_carry(lo, add_lo);
}

extern "C" void isaac_exit_a648b0_stats_add(IsaacExitA648b0StatsAdd* out,
                                            uint32_t lo, uint32_t hi,
                                            uint32_t add_lo,
                                            uint32_t add_hi) {
  if (out == nullptr) {
    return;
  }
  out->lo = isaac_exit_a648b0_stats_add_lo(lo, add_lo);
  out->hi = isaac_exit_a648b0_stats_add_hi(lo, hi, add_lo, add_hi);
}

extern "C" void isaac_exit_a648b0_mode_plan(IsaacExitA648b0ModePlan* out,
                                            uint32_t mode, uint32_t edx_ptr,
                                            uint32_t heap_stats_global,
                                            uint32_t stats_lo,
                                            uint32_t stats_hi,
                                            uint32_t header_size,
                                            uint32_t add_lo,
                                            uint32_t add_hi) {
  if (out == nullptr) {
    return;
  }
  const uint32_t path = isaac_exit_a648b0_mode_path(mode);
  const int32_t free_needed =
      (path == 1u && edx_ptr != 0u) ? 1 : 0;
  out->path = static_cast<int32_t>(path);
  out->free_needed = free_needed;
  out->free_ptr = 0u;
  switch (path) {
    case 1u:
      /* Mode 1: base = esi select (v27 law). The sub/sbb only executes
         when the edx gate is open (je 0xa64909 skips both the stores
         and the free call). The 64-bit borrow subtract is the SAME
         arithmetic as the v26 0x00840f70 laws — referenced here, not
         duplicated. */
      if (free_needed != 0) {
        out->stats_base = isaac_exit_a648b0_heap_stats_base(heap_stats_global);
        out->free_ptr =
            isaac_exit_a648b0_mode1_free_base_ptr(edx_ptr);
        out->lo_after = isaac_exit_840f70_stats_sub_lo(stats_lo, header_size);
        out->hi_after = isaac_exit_840f70_stats_sub_hi(stats_lo, stats_hi,
                                                       header_size);
      } else {
        out->stats_base = 0u;
        out->lo_after = stats_lo;
        out->hi_after = stats_hi;
      }
      break;
    case 2u:
      /* Mode 2: stores are UNCONDITIONAL once dispatched; base is the
         direct edi form (no fallback). */
      out->stats_base =
          isaac_exit_a648b0_mode2_stats_base_ptr(heap_stats_global);
      out->lo_after = isaac_exit_a648b0_stats_add_lo(stats_lo, add_lo);
      out->hi_after = isaac_exit_a648b0_stats_add_hi(stats_lo, stats_hi,
                                                     add_lo, add_hi);
      break;
    default:
      /* Modes 0 and >= 3: empty path, no store, stats pass through. */
      out->stats_base = 0u;
      out->lo_after = stats_lo;
      out->hi_after = stats_hi;
      break;
  }
}

/* --- ABI v44: fully pure thiscall predicate 0x006f0040 (band-scan find) ---
   PE 0x006f0040..0x006f0066 (39 B, 12 insns, 0 E8 / 0 indirect / 0
   stores). The exit-band census (corrected capstone caller scan) found
   exactly one caller-bearing fully-pure unclaimed body: this one (4
   direct rel32 callers). Gates are FULL-dword tests in machine order;
   the signed `jge` compares B >= own as int32. The return is the AL byte
   flag — the body itself never narrows any input. */

extern "C" uint32_t isaac_exit_6f0040_va(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_6F0040_VA);
}

extern "C" uint32_t isaac_exit_6f0040_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_6F0040_BODY_BYTES);
}

extern "C" uint32_t isaac_exit_6f0040_ptr_off(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_6F0040_PTR_OFF);
}

extern "C" uint32_t isaac_exit_6f0040_count_off(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_6F0040_COUNT_OFF);
}

extern "C" int32_t isaac_exit_6f0040_predicate(uint32_t receiver,
                                               uint32_t ptr_1e68,
                                               uint32_t own_161c,
                                               uint32_t obj_161c) {
  /* PE order:
       0x006f0046 test eax,eax; je  -> A == 0      closes
       0x006f0050 cmp edx,-1; je    -> B == -1     closes
       0x006f0055 cmp edx,[own]; jge -> B >= own   closes (SIGNED)
       0x006f005d cmp eax,ecx; je   -> A == this   closes
       else AL = 1 */
  if (ptr_1e68 == 0u) {
    return 0;
  }
  if (obj_161c == static_cast<uint32_t>(ISAAC_EXIT_6F0040_INVALID_COUNT)) {
    return 0;
  }
  if (static_cast<int32_t>(obj_161c) >= static_cast<int32_t>(own_161c)) {
    return 0;
  }
  if (ptr_1e68 == receiver) {
    return 0;
  }
  return 1;
}

/* --- ABI v45: fully pure static membership predicate 0x0071df80 (band
   re-scan find) ---
   PE 0x0071df80..0x0071dfbf (64 B, 0x40, TWO rets), 0 E8 / 0 indirect /
   0 stores. The corrected exit-band census over the full coordinator
   extent 0x006f0000..0x007c0000 found exactly one caller-bearing
   fully-pure unclaimed body after v44: this one (2 direct rel32 callers
   0x0071ead7 / 0x0071ebda). Gates are FULL-dword cmp eax, imm in PE
   order; the return is the AL byte flag. The three dereferences (Game
   global -> Game::_room -> room+0x1d18) are capture-side laws; the
   predicate takes the FINAL dword. */

extern "C" uint32_t isaac_exit_71df80_va(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_71DF80_VA);
}

extern "C" uint32_t isaac_exit_71df80_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_71DF80_BODY_BYTES);
}

extern "C" uint32_t isaac_exit_71df80_game_dat(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_71DF80_GAME_DAT);
}

extern "C" uint32_t isaac_exit_71df80_room_off(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_71DF80_ROOM_OFF);
}

extern "C" uint32_t isaac_exit_71df80_state_off(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_71DF80_STATE_OFF);
}

extern "C" int32_t isaac_exit_71df80_state_open(uint32_t state_1d18) {
  /* PE order (all FULL-dword cmp eax, imm; 83 F8 imm8 sign-extended):
       0x0071df91 cmp eax,0xa  / je 0xdfbc
       0x0071df96 cmp eax,0xb  / je 0xdfbc
       0x0071df9b cmp eax,0xc  / je 0xdfbc
       0x0071dfa0 cmp eax,0xd  / je 0xdfbc
       0x0071dfa5 cmp eax,0x22 / je 0xdfbc
       0x0071dfaa cmp eax,0x2b / je 0xdfbc
       0x0071dfaf cmp eax,0x2c / je 0xdfbc
       0x0071dfb4 cmp eax,0x30 / je 0xdfbc
       else xor al,al / ret; open: mov al,1 / ret */
  if (state_1d18 == ISAAC_EXIT_71DF80_STATE_0A) {
    return 1;
  }
  if (state_1d18 == ISAAC_EXIT_71DF80_STATE_0B) {
    return 1;
  }
  if (state_1d18 == ISAAC_EXIT_71DF80_STATE_0C) {
    return 1;
  }
  if (state_1d18 == ISAAC_EXIT_71DF80_STATE_0D) {
    return 1;
  }
  if (state_1d18 == ISAAC_EXIT_71DF80_STATE_22) {
    return 1;
  }
  if (state_1d18 == ISAAC_EXIT_71DF80_STATE_2B) {
    return 1;
  }
  if (state_1d18 == ISAAC_EXIT_71DF80_STATE_2C) {
    return 1;
  }
  if (state_1d18 == ISAAC_EXIT_71DF80_STATE_30) {
    return 1;
  }
  return 0;
}

/* --- ABI v28: pair constructor 0x0040c4a0 pure islands / CF --- */

extern "C" void isaac_exit_40c4a0_entry_zero(uint32_t* value_slot,
                                             uint32_t* obj_slot) {
  /* PE @ 0x0040c4cc / 0x0040c4d2, BEFORE push 0x18 / call 0xa0f4c0.
     0x0040c7f0 has no equivalent store. */
  if (value_slot != nullptr) {
    *value_slot = 0u;
  }
  if (obj_slot != nullptr) {
    *obj_slot = 0u;
  }
}

extern "C" void isaac_exit_40c4a0_entry_zero_at(uint8_t* pair_base) {
  if (pair_base == nullptr) {
    return;
  }
  isaac_exit_40c4a0_entry_zero(
      reinterpret_cast<uint32_t*>(pair_base + ISAAC_EXIT_40C4A0_PAIR_VALUE_OFF),
      reinterpret_cast<uint32_t*>(pair_base + ISAAC_EXIT_40C4A0_PAIR_OBJ_OFF));
}

extern "C" uint32_t isaac_exit_40c4a0_alloc_size(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_40C4A0_ALLOC_SIZE);
}

extern "C" int32_t isaac_exit_40c4a0_alloc_ok(uint32_t alloc_ptr) {
  /* PE @ 0x0040c4f0: test edi, edi; je 0x40c506. */
  return (alloc_ptr != 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_40c4a0_new_object_value(uint32_t alloc_ptr) {
  /* PE @ 0x0040c506: xor edi, edi on the failure path. */
  return (isaac_exit_40c4a0_alloc_ok(alloc_ptr) != 0) ? alloc_ptr : 0u;
}

extern "C" void isaac_exit_40c4a0_object_finish(uint32_t* vtable_slot,
                                                uint32_t* arg_slot,
                                                uint32_t arg) {
  /* PE @ 0x0040c4fb / 0x0040c501. */
  if (vtable_slot != nullptr) {
    *vtable_slot = static_cast<uint32_t>(ISAAC_EXIT_40C4A0_VTABLE);
  }
  if (arg_slot != nullptr) {
    *arg_slot = arg;
  }
}

extern "C" void isaac_exit_40c4a0_object_finish_apply(uint8_t* obj_base,
                                                       uint32_t arg) {
  if (obj_base == nullptr) {
    return;
  }
  isaac_exit_40c4a0_object_finish(
      reinterpret_cast<uint32_t*>(obj_base),
      reinterpret_cast<uint32_t*>(obj_base + ISAAC_EXIT_40C4A0_ARG_OFF), arg);
}

extern "C" int32_t isaac_exit_40c4a0_old_object_present(
    uint32_t old_obj_after_hosts) {
  /* PE @ 0x0040c50f–0x0040c514: mov ecx,[esi+4]; test ecx,ecx; je.
     The entry zero makes this 0 on every observable path, but the PE
     re-reads it after two host calls, so the gate is not folded. */
  return (old_obj_after_hosts != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_exit_40c4a0_virtual_ok(uint32_t virtual_al_in) {
  const uint8_t virtual_al = static_cast<uint8_t>(virtual_al_in & 0xffu);
  /* PE @ 0x0040c51d: test al, al; je. */
  return (virtual_al != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_exit_40c4a0_callback_needed(
    uint32_t old_obj_after_hosts, uint32_t virtual_al_in, uint32_t global_fn) {
  const uint8_t virtual_al = static_cast<uint8_t>(virtual_al_in & 0xffu);
  /* PE @ 0x0040c521: DAT_00c7163c gate after the virtual AL check. */
  return (old_obj_after_hosts != 0u && virtual_al != 0u && global_fn != 0u)
             ? 1
             : 0;
}

extern "C" void isaac_exit_40c4a0_pair_apply(uint32_t* obj_slot,
                                              uint32_t* value_slot,
                                              uint32_t new_obj, uint32_t arg) {
  /* PE @ 0x0040c530 then 0x0040c535 — object slot first, value slot last.
     0x0040c7f0 emits value first (0x0040c873) then object (0x0040c875). */
  if (obj_slot != nullptr) {
    *obj_slot = new_obj;
  }
  if (value_slot != nullptr) {
    *value_slot = arg;
  }
}

extern "C" void isaac_exit_40c4a0_pair_apply_base(uint8_t* pair_base,
                                                   uint32_t new_obj,
                                                   uint32_t arg) {
  if (pair_base == nullptr) {
    return;
  }
  isaac_exit_40c4a0_pair_apply(
      reinterpret_cast<uint32_t*>(pair_base + ISAAC_EXIT_40C4A0_PAIR_OBJ_OFF),
      reinterpret_cast<uint32_t*>(pair_base + ISAAC_EXIT_40C4A0_PAIR_VALUE_OFF),
      new_obj, arg);
}

extern "C" uint32_t isaac_exit_40c4a0_return_value(uint32_t this_addr) {
  /* PE @ 0x0040c533: mov eax, esi. */
  return this_addr;
}

extern "C" void isaac_exit_40c4a0_plan(IsaacExit40c4a0Plan* out,
                                        uint32_t this_addr, uint32_t arg,
                                        uint32_t alloc_ptr,
                                        uint32_t old_obj_after_hosts,
                                        uint32_t virtual_al_in,
                                        uint32_t callback_global_fn) {
  const uint8_t virtual_al = static_cast<uint8_t>(virtual_al_in & 0xffu);
  if (out == nullptr) {
    return;
  }
  const int32_t ok = isaac_exit_40c4a0_alloc_ok(alloc_ptr);
  const uint32_t new_obj = isaac_exit_40c4a0_new_object_value(alloc_ptr);

  out->this_addr = this_addr;
  out->arg = arg;
  out->alloc_size = isaac_exit_40c4a0_alloc_size();
  out->alloc_ptr = alloc_ptr;
  out->alloc_ok = ok;
  out->new_object = new_obj;
  out->ctor_host_needed = ok;
  out->finish_needed = ok;
  out->vtable_value = static_cast<uint32_t>(ISAAC_EXIT_40C4A0_VTABLE);
  out->arg_slot_ptr =
      (ok != 0) ? new_obj + static_cast<uint32_t>(ISAAC_EXIT_40C4A0_ARG_OFF)
                : 0u;
  out->old_object = old_obj_after_hosts;
  out->old_object_present =
      isaac_exit_40c4a0_old_object_present(old_obj_after_hosts);
  out->virtual_ok = isaac_exit_40c4a0_virtual_ok(virtual_al);
  out->callback_needed = isaac_exit_40c4a0_callback_needed(
      old_obj_after_hosts, virtual_al, callback_global_fn);
  out->value_slot_ptr =
      this_addr + static_cast<uint32_t>(ISAAC_EXIT_40C4A0_PAIR_VALUE_OFF);
  out->obj_slot_ptr =
      this_addr + static_cast<uint32_t>(ISAAC_EXIT_40C4A0_PAIR_OBJ_OFF);
  out->value_slot_after = arg;
  out->obj_slot_after = new_obj;
  out->return_value = isaac_exit_40c4a0_return_value(this_addr);
}

/* --- ABI v28: recursive tree _Erase 0x00415800 pure islands / CF --- */

extern "C" int32_t isaac_exit_415800_walk_continue(uint32_t isnil_byte_in) {
  const uint8_t isnil_byte = static_cast<uint8_t>(isnil_byte_in & 0xffu);
  /* PE @ 0x0041582e: cmp byte [esi+0xd], 0; jne done. Byte test only. */
  return (isnil_byte == 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_415800_recurse_node_ptr(uint32_t node) {
  /* PE @ 0x00415834: push dword [esi+8] — right child recurses. */
  return node + static_cast<uint32_t>(ISAAC_EXIT_TREE_RIGHT_OFF);
}

extern "C" uint32_t isaac_exit_415800_next_node_ptr(uint32_t node) {
  /* PE @ 0x00415843: mov esi, [esi] — left child iterates. */
  return node + static_cast<uint32_t>(ISAAC_EXIT_TREE_LEFT_OFF);
}

extern "C" uint32_t isaac_exit_415800_com_slot_ptr(uint32_t node) {
  /* PE @ 0x00415845: lea ebx, [edi+0x14] — the callback argument. */
  return node + static_cast<uint32_t>(ISAAC_EXIT_415800_COM_SLOT_OFF);
}

extern "C" uint32_t isaac_exit_415800_ctrl_ptr(uint32_t node) {
  /* PE @ 0x0041584f: mov ecx, [ebx+4] = [node+0x18]. */
  return node + static_cast<uint32_t>(ISAAC_EXIT_415800_CTRL_OFF);
}

extern "C" int32_t isaac_exit_415800_ctrl_present(uint32_t ctrl) {
  return (ctrl != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_exit_415800_virtual_ok(uint32_t virtual_al_in) {
  const uint8_t virtual_al = static_cast<uint8_t>(virtual_al_in & 0xffu);
  return (virtual_al != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_exit_415800_callback_needed(uint32_t ctrl,
                                                      uint32_t virtual_al_in,
                                                      uint32_t global_fn) {
  const uint8_t virtual_al = static_cast<uint8_t>(virtual_al_in & 0xffu);
  return (ctrl != 0u && virtual_al != 0u && global_fn != 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_415800_free_size(void) {
  /* PE @ 0x00415870: push 0x1c. */
  return static_cast<uint32_t>(ISAAC_EXIT_415800_NODE_SIZE);
}

extern "C" uint32_t isaac_exit_415800_free_order(const uint8_t* mem,
                                                  uint32_t root,
                                                  uint32_t* out,
                                                  uint32_t max_out) {
  if (mem == nullptr || out == nullptr) {
    return static_cast<uint32_t>(ISAAC_EXIT_415800_ORDER_OVERFLOW);
  }
  /* Iterative reverse in-order: descend the right spine, emit, go left.
     Matches erase(n) = erase(right(n)); free(n); erase(left(n)). */
  uint32_t stack[ISAAC_EXIT_415800_MAX_DEPTH];
  uint32_t depth = 0u;
  uint32_t count = 0u;
  uint32_t cur = root;
  const uint32_t step_cap =
      static_cast<uint32_t>(ISAAC_EXIT_415800_MAX_DEPTH) * 64u;
  uint32_t steps = 0u;

  for (;;) {
    if (++steps > step_cap) {
      return static_cast<uint32_t>(ISAAC_EXIT_415800_ORDER_OVERFLOW);
    }
    const uint8_t isnil = mem[cur + ISAAC_EXIT_TREE_ISNIL_OFF];
    if (isaac_exit_415800_walk_continue(isnil) != 0) {
      if (depth >= static_cast<uint32_t>(ISAAC_EXIT_415800_MAX_DEPTH)) {
        return static_cast<uint32_t>(ISAAC_EXIT_415800_ORDER_OVERFLOW);
      }
      stack[depth++] = cur;
      cur = *reinterpret_cast<const uint32_t*>(
          mem + cur + ISAAC_EXIT_TREE_RIGHT_OFF);
      continue;
    }
    if (depth == 0u) {
      break;
    }
    const uint32_t node = stack[--depth];
    if (count >= max_out) {
      return static_cast<uint32_t>(ISAAC_EXIT_415800_ORDER_OVERFLOW);
    }
    out[count++] = node;
    cur = *reinterpret_cast<const uint32_t*>(mem + node +
                                             ISAAC_EXIT_TREE_LEFT_OFF);
  }
  return count;
}

/* --- ABI v30: keyed registry store/release 0x0040e520 ---
   v109 dedupe: the 0x00a159d0 key hash LAW BODIES were removed here and
   REMAIN in render_shell_pure_helpers.cpp (isaac_render_shell_a159d0_norm_
   char / hash_step / hash, landed at RShell ABI v7; the render slice's
   a14050 chain consumes the hash by name). This file keeps ONLY the 40e520
   island laws; the hash VA/PE constants live in the header as host-VA
   documentation and the suite pins the RShell export semantics by
   reference. NO duplicate law exports. */

extern "C" int32_t isaac_exit_40e520_map_store_needed(uint32_t pair_value) {
  /* PE @ 0x0040e54f: test eax,eax; je 0x40e588 — full dword. */
  return (pair_value != 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_40e520_name_ptr(uint32_t field44,
                                                uint32_t field40) {
  /* PE @ 0x0040e556: test ecx,ecx; jne 0x40e567 — the primary short-circuits
     past the fallback load entirely. */
  if (field44 != 0u) {
    return field44;
  }
  /* PE @ 0x0040e562: test eax,eax; cmovne ecx,eax with ecx preloaded to the
     "unknown" literal. */
  return (field40 != 0u)
             ? field40
             : static_cast<uint32_t>(ISAAC_EXIT_40E520_DEFAULT_NAME_ADDR);
}

extern "C" uint32_t isaac_exit_40e520_default_name_addr(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_40E520_DEFAULT_NAME_ADDR);
}

extern "C" uint32_t isaac_exit_40e520_map_global(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_40E520_MAP_GLOBAL);
}

extern "C" uint32_t isaac_exit_40e520_pair_value_ptr(uint32_t pair_base) {
  return pair_base + static_cast<uint32_t>(ISAAC_EXIT_40E520_PAIR_VALUE_OFF);
}

extern "C" uint32_t isaac_exit_40e520_pair_ctrl_ptr(uint32_t pair_base) {
  return pair_base + static_cast<uint32_t>(ISAAC_EXIT_40E520_PAIR_CTRL_OFF);
}

extern "C" int32_t isaac_exit_40e520_release_ctrl_present(
    uint32_t ctrl_after_hosts) {
  /* PE @ 0x0040e592: test ecx,ecx; je — on the RECAPTURED value. */
  return (ctrl_after_hosts != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_exit_40e520_virtual_ok(uint32_t virtual_al_in) {
  const uint8_t virtual_al = static_cast<uint8_t>(virtual_al_in & 0xffu);
  /* PE @ 0x0040e59d: test al,al; je — AL only. */
  return (virtual_al != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_exit_40e520_callback_needed(uint32_t ctrl_after_hosts,
                                                      uint32_t virtual_al_in,
                                                      uint32_t global_fn) {
  const uint8_t virtual_al = static_cast<uint8_t>(virtual_al_in & 0xffu);
  return (ctrl_after_hosts != 0u && virtual_al != 0u && global_fn != 0u) ? 1
                                                                         : 0;
}

extern "C" uint32_t isaac_exit_40e520_callback_arg_ptr(uint32_t pair_base) {
  /* PE @ 0x0040e5aa: lea ecx,[ebp+8] — the pair's ADDRESS. */
  return pair_base;
}

extern "C" void isaac_exit_40e520_plan(IsaacExit40e520Plan* out,
                                        uint32_t pair_base,
                                        uint32_t pair_value, uint32_t field44,
                                        uint32_t field40,
                                        uint32_t ctrl_after_hosts,
                                        uint32_t virtual_al,
                                        uint32_t callback_global_fn) {
  if (out == nullptr) {
    return;
  }
  out->pair_base = pair_base;
  out->pair_value = pair_value;
  out->map_store_needed = isaac_exit_40e520_map_store_needed(pair_value);
  /* The ladder is evaluated ONLY on the store path: when the value is zero
     the PE jumps 0x0040e551 -> 0x0040e588 and never reads +0x44 or +0x40. */
  out->name_ptr = (out->map_store_needed != 0)
                      ? isaac_exit_40e520_name_ptr(field44, field40)
                      : 0u;
  out->map_global = isaac_exit_40e520_map_global();
  out->ctrl_after_hosts = ctrl_after_hosts;
  out->release_ctrl_present =
      isaac_exit_40e520_release_ctrl_present(ctrl_after_hosts);
  out->virtual_ok = isaac_exit_40e520_virtual_ok(virtual_al);
  out->callback_needed = isaac_exit_40e520_callback_needed(
      ctrl_after_hosts, virtual_al, callback_global_fn);
  out->callback_arg_ptr = isaac_exit_40e520_callback_arg_ptr(pair_base);
}

/* --- ABI v35: Game::Exit map walk continuation (PE 0x006fa457-0x006fa50a) ---
   This is INLINE code in Game::Exit, transcribed gate by gate from the
   instruction stream (see the header for the full walk shape). The JS
   oracle is a PC-walk trace interpreter over the same instruction table;
   this C++ side is a straight branch loop, so a wrong branch in one
   implementation cannot be reproduced by the other. */

extern "C" int32_t isaac_exit_root_map_walk_flag_active(uint32_t flag28_in) {
  /* PE @ 0x006fa488: cmp byte ptr [eax+0x28],0 -- LOW-BYTE test. */
  const uint8_t flag28 = static_cast<uint8_t>(flag28_in & 0xffu);
  return (flag28 != 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_root_map_walk_elem_host_this(
    uint32_t elem_addr) {
  /* PE @ 0x006fa4a2: lea ecx,[edi+0x18]; this = elem+0x18, 32-bit wrap. */
  return static_cast<uint32_t>(
      elem_addr + static_cast<uint32_t>(ISAAC_EXIT_MAP_ELEM_HOST_OFF));
}

extern "C" uint32_t isaac_exit_root_map_walk_flag_addr(uint32_t found_addr) {
  /* PE @ 0x006fa4b8: mov byte [eax+0x28],0; address = found+0x28. */
  return static_cast<uint32_t>(
      found_addr + static_cast<uint32_t>(ISAAC_EXIT_MAP_NODE_FLAG_OFF));
}

extern "C" uint32_t isaac_exit_root_map_walk_next(uint32_t node_addr) {
  /* PE @ 0x006fa4c1-0x006fa504, the INLINE MSVC tree iterator++:
       eax = [node+8] (right)
       if right REAL: descend left from right while left REAL
       else (right sentinel): climb while parent REAL and node == parent->right
       result is the final node (esi); the same algorithm as 0x00414a80. */
  if (node_addr == 0u) {
    return 0u;
  }
  const uint32_t right =
      tree_load_u32(node_addr + static_cast<uint32_t>(ISAAC_EXIT_TREE_RIGHT_OFF));
  if (tree_load_isnil(right) != 0u) {
    uint32_t cur = node_addr;
    uint32_t parent =
        tree_load_u32(cur + static_cast<uint32_t>(ISAAC_EXIT_TREE_PARENT_OFF));
    if (tree_load_isnil(parent) == 0u) {
      while (cur ==
             tree_load_u32(parent +
                           static_cast<uint32_t>(ISAAC_EXIT_TREE_RIGHT_OFF))) {
        cur = parent;
        parent =
            tree_load_u32(cur + static_cast<uint32_t>(ISAAC_EXIT_TREE_PARENT_OFF));
        if (tree_load_isnil(parent) != 0u) {
          break;
        }
      }
    }
    return parent;
  }
  uint32_t walk = right;
  uint32_t left = tree_load_u32(walk + static_cast<uint32_t>(ISAAC_EXIT_TREE_LEFT_OFF));
  while (tree_load_isnil(left) == 0u) {
    walk = left;
    left = tree_load_u32(walk + static_cast<uint32_t>(ISAAC_EXIT_TREE_LEFT_OFF));
  }
  return walk;
}

extern "C" uint32_t isaac_exit_root_map_walk_elem_host_va(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_ROOT_MAP_WALK_ELEM_HOST_VA);
}

extern "C" uint32_t isaac_exit_root_map_walk_global_va(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_ROOT_MAP_WALK_GLOBAL_VA);
}

extern "C" uint32_t isaac_exit_root_map_walk_find_va(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_ROOT_MAP_WALK_FIND_VA);
}

namespace {

inline void walk_push_event(IsaacExitRootMapWalkPlan* out, uint32_t kind,
                            uint32_t payload, uint32_t* emitted) {
  if (*emitted < static_cast<uint32_t>(ISAAC_EXIT_ROOT_MAP_WALK_EVENT_CAP)) {
    out->event[*emitted] = ((kind << 24) | (payload & 0xffffffu)) & 0xffffffffu;
    *emitted += 1u;
    out->event_count = static_cast<int32_t>(*emitted);
  } else {
    out->truncated = 1;
  }
}

}  // namespace

extern "C" void isaac_exit_root_map_walk_plan(IsaacExitRootMapWalkPlan* out,
                                              uint32_t map_addr,
                                              uint32_t out_slot_addr) {
  if (out == nullptr) {
    return;
  }
  out->walk_active = 0;
  out->node_count = 0;
  out->elem_host_count = 0;
  out->flag_clear_count = 0;
  out->global_host_count = 0;
  out->event_count = 0;
  out->truncated = 0;
  for (uint32_t i = 0; i < static_cast<uint32_t>(ISAAC_EXIT_ROOT_MAP_WALK_EVENT_CAP);
       ++i) {
    out->event[i] = 0u;
  }

  /* PE @ 0x006fa457: edi = [map]; @ 0x006fa463: esi = [edi] (first node). */
  const uint32_t sentinel0 = tree_load_u32(map_addr);
  const uint32_t first = tree_load_u32(sentinel0);
  if (first == sentinel0) {
    /* PE @ 0x006fa46a: je 0x6fa513 — walk skipped entirely. */
    return;
  }
  out->walk_active = 1;

  uint32_t node = first;
  uint32_t emitted = 0u;
  uint32_t iterations = 0u;
  for (;;) {
    if (++iterations > static_cast<uint32_t>(ISAAC_EXIT_ROOT_MAP_WALK_NODE_CAP)) {
      out->truncated = 1;
      break;
    }
    out->node_count = static_cast<int32_t>(iterations);

    /* PE @ 0x006fa472-0x006fa47c: find(map, out_slot, node+0x10) — the
       v11 pure-complete find writes the found node into out_slot (the
       PE's [ebp-4] slot). */
    const uint32_t key =
        node + static_cast<uint32_t>(ISAAC_EXIT_MAP_NODE_KEY_OFF);
    isaac_exit_map_find_69d690(map_addr, out_slot_addr, key);
    uint32_t found = tree_load_u32(out_slot_addr); /* PE @ 0x006fa481 */

    if (found != sentinel0) { /* PE @ 0x006fa484/0x006fa486 je 0x6fa4bc */
      /* PE @ 0x006fa488: cmp byte ptr [found+0x28],0; je 0x6fa4bc. */
      const uint8_t flag = tree_node_ptr(
          found + static_cast<uint32_t>(ISAAC_EXIT_MAP_NODE_FLAG_OFF))[0];
      if (flag != 0u) {
        /* PE @ 0x006fa48e/0x006fa491: elem = [found+0x44]; cmp, je. */
        uint32_t elem = tree_load_u32(
            found + static_cast<uint32_t>(ISAAC_EXIT_MAP_NODE_BEGIN_OFF));
        const uint32_t end0 = tree_load_u32(
            found + static_cast<uint32_t>(ISAAC_EXIT_MAP_NODE_END_OFF));
        if (elem != end0) { /* range non-empty -> elem host loop */
          for (;;) {
            /* PE @ 0x006fa4a0-0x006fa4a5: host 0x0040c7f0(0),
               this = elem+0x18. */
            const uint32_t host_this = static_cast<uint32_t>(
                elem + static_cast<uint32_t>(ISAAC_EXIT_MAP_ELEM_HOST_OFF));
            walk_push_event(out,
                            static_cast<uint32_t>(
                                ISAAC_EXIT_ROOT_MAP_WALK_KIND_ELEM_HOST),
                            host_this, &emitted);
            out->elem_host_count += 1;
            /* PE @ 0x006fa4aa: add edi,0x20. */
            elem = static_cast<uint32_t>(
                elem + static_cast<uint32_t>(ISAAC_EXIT_MAP_ELEM_STRIDE));
            /* PE @ 0x006fa4ad: cmp edi,[esi+0x48] — end RE-READ per
               iteration; 0x006fa4b0 jne loops. */
            const uint32_t end_r = tree_load_u32(
                found + static_cast<uint32_t>(ISAAC_EXIT_MAP_NODE_END_OFF));
            if (elem == end_r) {
              break;
            }
          }
        }
        /* PE @ 0x006fa4b2 restores the outer node (a local here);
           @ 0x006fa4b5 found is RE-READ from out_slot — never the
           pre-host value (defect class 1). */
        found = tree_load_u32(out_slot_addr);
        const uint32_t flag_addr = static_cast<uint32_t>(
            found + static_cast<uint32_t>(ISAAC_EXIT_MAP_NODE_FLAG_OFF));
        walk_push_event(out,
                        static_cast<uint32_t>(
                            ISAAC_EXIT_ROOT_MAP_WALK_KIND_FLAG_CLEAR),
                        flag_addr, &emitted);
        out->flag_clear_count += 1;
        /* PE @ 0x006fa4b8: mov byte [found+0x28],0 — the store is APPLIED
           so later iterations observe it, exactly like the PE. */
        tree_node_mut(flag_addr)[0] = 0u;
      }
    }

    /* PE @ 0x006fa4bc: call 0x0040e910 — the global walk runs on EVERY
       iteration, hit or miss. */
    walk_push_event(out,
                    static_cast<uint32_t>(
                        ISAAC_EXIT_ROOT_MAP_WALK_KIND_GLOBAL_HOST),
                    0u, &emitted);
    out->global_host_count += 1;

    /* PE @ 0x006fa4c1-0x006fa504: inline tree iterator++. */
    node = isaac_exit_root_map_walk_next(node);

    /* PE @ 0x006fa506: mov edi,[map] — sentinel RE-READ per iteration;
       @ 0x006fa508/0x006fa50a: continue while node != sentinel. */
    const uint32_t sentinel_r = tree_load_u32(map_addr);
    if (node == sentinel_r) {
      break;
    }
  }
}

extern "C" uint32_t isaac_exit_pure_helpers_abi_version(void) {
  return ISAAC_EXIT_PURE_HELPERS_ABI_VERSION;
}

/* --- ABI v32: object realloc/fill 0x007384d0 --- */

extern "C" int32_t isaac_exit_7384d0_old_object_present(uint32_t old_ptr) {
  /* PE @ 0x007384ff: test edi,edi; je — the full dword of the entry slot. */
  return (old_ptr != 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_7384d0_alloc_size(void) {
  /* PE @ 0x00738522 / 0x0073850a: push 0x7898. */
  return static_cast<uint32_t>(ISAAC_EXIT_7384D0_ALLOC_SIZE);
}

extern "C" int32_t isaac_exit_7384d0_alloc_ok(uint32_t alloc_ptr) {
  /* PE @ 0x00738539: test eax,eax; je — full dword of the alloc result. */
  return (alloc_ptr != 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_7384d0_new_object_value(uint32_t alloc_ptr,
                                                       uint32_t ctor_return) {
  /* PE @ 0x00738539–0x00738546: je -> xor eax,eax; else the ctor 0x007e9400
     runs and ITS return value is what gets stored @ 0x0073854a — never the
     raw alloc pointer. */
  return (alloc_ptr != 0u) ? ctor_return : 0u;
}

extern "C" void isaac_exit_7384d0_apply(uint8_t* this_base,
                                        uint32_t new_obj_value) {
  if (this_base == nullptr) {
    return;
  }
  /* PE @ 0x0073854a–0x00738581 (first pack, before the memset). */
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_7384D0_OBJ_OFF) =
      new_obj_value;
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_7384D0_182D0_OFF) =
      static_cast<uint32_t>(ISAAC_EXIT_7384D0_182D0_VALUE);
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_7384D0_182CC_OFF) = 0u;
  *reinterpret_cast<uint32_t*>(this_base + 0) = 0u;
  *reinterpret_cast<uint32_t*>(this_base + 4) = 0u;
  /* PE @ 0x0073856d/0x00738573/0x0073857a: [this], [this+4], [this+0xc]
     are zeroed but [this+8] is deliberately NOT written (survives). */
  *reinterpret_cast<uint32_t*>(this_base + 0xc) = 0u;
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_7384D0_18334_OFF) = 0u;
  /* memset @ 0x0073858b: VCRUNTIME140!memset via IAT [0x00b1875c] — the fill
     is pure: zero bytes [0x18338, 0x18338+0x30). */
  for (uint32_t i = 0; i < ISAAC_EXIT_7384D0_MEMSET_SIZE; ++i) {
    this_base[ISAAC_EXIT_7384D0_MEMSET_BASE_OFF + i] = 0;
  }
  /* PE @ 0x00738593–0x007385a7 (second pack, after the memset). */
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_7384D0_18368_OFF) = 0u;
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_7384D0_1836C_OFF) = 0u;
  this_base[ISAAC_EXIT_7384D0_188F8_OFF] = 0;
}

/* --- ABI v32: MSVC string field setter 0x00408310 --- */

extern "C" int32_t isaac_exit_408310_flag(uint32_t arg0) {
  /* PE @ 0x0040835f mov ebx,1 (ctor temp) / 0x0040838d mov ebx,2 (empty). */
  return (arg0 != 0u) ? ISAAC_EXIT_408310_TEMP_CTOR_FLAG
                      : ISAAC_EXIT_408310_TEMP_EMPTY_FLAG;
}

extern "C" void isaac_exit_408310_set_arg0(uint8_t* this_base, uint32_t arg0) {
  if (this_base == nullptr) {
    return;
  }
  /* PE @ 0x00408346: mov [esi], eax. */
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_408310_ARG0_OFF) = arg0;
}

extern "C" void isaac_exit_408310_empty_temp(uint8_t* temp_base) {
  if (temp_base == nullptr) {
    return;
  }
  /* PE @ 0x00408369–0x0040837f. The trailing byte store buf[0]=0 is
     subsumed by the dword store of the union field. */
  *reinterpret_cast<uint32_t*>(temp_base + 0) = 0u;
  *reinterpret_cast<uint32_t*>(temp_base + ISAAC_EXIT_408310_STR_SIZE_OFF) =
      0u;
  *reinterpret_cast<uint32_t*>(temp_base + ISAAC_EXIT_408310_STR_CAP_OFF) =
      static_cast<uint32_t>(ISAAC_EXIT_408310_EMPTY_CAP);
}

extern "C" void isaac_exit_408310_temp_reset(uint8_t* temp_base) {
  if (temp_base == nullptr) {
    return;
  }
  /* PE @ 0x00408433–0x00408441, after the arm2 sized free. */
  *reinterpret_cast<uint32_t*>(temp_base + ISAAC_EXIT_408310_STR_SIZE_OFF) =
      0u;
  *reinterpret_cast<uint32_t*>(temp_base + ISAAC_EXIT_408310_STR_CAP_OFF) =
      static_cast<uint32_t>(ISAAC_EXIT_408310_EMPTY_CAP);
  temp_base[0] = 0;
}

extern "C" int32_t isaac_exit_408310_assign_needed(uint32_t dst_addr,
                                                   uint32_t src_base) {
  /* PE @ 0x00408398: cmp edx,eax; je — full dword self-assign guard. */
  return (dst_addr != src_base) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_408310_src_data_addr(uint32_t src_base,
                                                    uint32_t src_cap,
                                                    uint32_t src_dword0) {
  /* PE @ 0x0040839c: cmp [eax+0x14],0x10; jb — UNSIGNED below; on the heap
     path eax is replaced by [eax] (the recaptured dword0). */
  return (src_cap < static_cast<uint32_t>(ISAAC_EXIT_MSVC_STRING_SSO_CAP))
             ? src_base
             : src_dword0;
}

extern "C" int32_t isaac_exit_408310_arm_free_needed(uint32_t flag_in,
                                                     uint32_t arm_mask,
                                                     uint32_t cap) {
  const uint8_t flag = static_cast<uint8_t>(flag_in & 0xffu);
  /* test bl,2 @ 0x004083ba / test bl,1 @ 0x004083f8 — LOW-BYTE gates, then
     cmp cap,0x10; jb (unsigned) — the same gate as the v19 0x40ccd0 free
     idiom. */
  return ((flag & static_cast<uint8_t>(arm_mask)) != 0u &&
          cap >= static_cast<uint32_t>(ISAAC_EXIT_MSVC_STRING_SSO_CAP))
             ? 1
             : 0;
}

extern "C" uint32_t isaac_exit_408310_free_ptr(uint32_t ptr,
                                               uint32_t uses_header,
                                               uint32_t header) {
  /* PE @ 0x004083d7/0x00408413: mov ecx,[ecx-4] — the heap-header path frees
     the recaptured header, not the string pointer. */
  return (uses_header != 0u) ? header : ptr;
}

extern "C" uint32_t isaac_exit_408310_free_count(uint32_t cap,
                                                 uint32_t uses_header) {
  const uint32_t size = isaac_exit_40ccd0_free_size(cap);
  return (uses_header != 0u) ? isaac_exit_40ccd0_free_header_size(size) : size;
}

extern "C" int32_t isaac_exit_408310_abort_needed(uint32_t uses_header,
                                                  uint32_t offset_ok) {
  /* PE @ 0x004083e2/0x0040841e: cmp off,0x1f; ja -> IAT [0xb18894]. */
  return (uses_header != 0u && offset_ok == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_exit_408310_field_7c(uint32_t g_c798e4) {
  /* PE @ 0x004084ea: mov eax,[0xc798e4]; and eax,4 — ZF survives to the
     cmove @ 0x00408508 with ecx=6. */
  return ((g_c798e4 & 4u) == 0u) ? ISAAC_EXIT_408310_FIELD_7C_CLEAR_VALUE
                                 : ISAAC_EXIT_408310_FIELD_7C_BITSET_VALUE;
}

extern "C" uint32_t isaac_exit_408310_gate_c798e4_addr(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_408310_GATE_C798E4_ADDR);
}

extern "C" void isaac_exit_408310_tail_apply(uint8_t* this_base,
                                             uint32_t g_c7b640,
                                             uint32_t g_c7b644,
                                             uint32_t g_c798e4) {
  if (this_base == nullptr) {
    return;
  }
  /* PE @ 0x00408452–0x00408594, in instruction order. f32 stores are raw bit
     copies (movss). The 1.0f constants are file-backed .data @ 0xc3793c/0xc37940;
     g_c7b640/g_c7b644/g_c798e4 are RUNTIME globals (past .data raw end). */
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_408310_F30_OFF) = 0u;
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_408310_F34_OFF) =
      static_cast<uint32_t>(ISAAC_EXIT_408310_F32_ONE_BITS);
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_408310_F38_OFF) =
      static_cast<uint32_t>(ISAAC_EXIT_408310_F32_ONE_BITS);
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_408310_F3C_OFF) = 0u;
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_408310_F40_OFF) =
      g_c7b640;
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_408310_F44_OFF) =
      g_c7b644;
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_408310_F48_OFF) =
      static_cast<uint32_t>(ISAAC_EXIT_408310_F32_ONE_BITS);
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_408310_F4C_OFF) =
      static_cast<uint32_t>(ISAAC_EXIT_408310_F32_ONE_BITS);
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_408310_F50_OFF) =
      static_cast<uint32_t>(ISAAC_EXIT_408310_F32_ONE_BITS);
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_408310_F54_OFF) =
      static_cast<uint32_t>(ISAAC_EXIT_408310_F32_ONE_BITS);
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_408310_F58_OFF) = 0u;
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_408310_F5C_OFF) = 0u;
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_408310_F60_OFF) = 0u;
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_408310_F64_OFF) = 0u;
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_408310_F68_OFF) = 0u;
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_408310_F6C_OFF) = 0u;
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_408310_F70_OFF) = 0u;
  this_base[ISAAC_EXIT_408310_F74_OFF] = 1;
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_408310_F78_OFF) = 0u;
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_408310_F80_OFF) = 7u;
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_408310_F84_OFF) = 1u;
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_408310_F7C_OFF) =
      static_cast<uint32_t>(isaac_exit_408310_field_7c(g_c798e4));
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_408310_F88_OFF) = 7u;
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_408310_F20_OFF) = 0u;
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_408310_F24_OFF) = 0u;
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_408310_F28_OFF) = 0u;
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_408310_F2C_OFF) = 0u;
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_408310_F8C_OFF) = 0u;
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_408310_F90_OFF) =
      g_c7b640;
  *reinterpret_cast<uint32_t*>(this_base + ISAAC_EXIT_408310_F94_OFF) =
      g_c7b644;
}

extern "C" void isaac_exit_408310_plan(IsaacExit408310Plan* out,
                                       uint32_t arg0, uint32_t dst_addr,
                                       uint32_t temp_base, uint32_t temp_ptr,
                                       uint32_t temp_size, uint32_t temp_cap,
                                       uint32_t header) {
  if (out == nullptr) {
    return;
  }
  out->arg0 = arg0;
  out->dst_addr = dst_addr;
  out->temp_base = temp_base;
  out->flag = isaac_exit_408310_flag(arg0);
  out->temp_ptr = temp_ptr;
  out->temp_size = temp_size;
  out->temp_cap = temp_cap;
  /* The src decode reads [eax+0x10] (size) FIRST and [eax] only on the heap
     path — the count is the size field regardless of SSO. */
  out->assign_needed = isaac_exit_408310_assign_needed(dst_addr, temp_base);
  out->assign_src_data =
      isaac_exit_408310_src_data_addr(temp_base, temp_cap, temp_ptr);
  out->assign_count = temp_size;

  const int32_t arm1_gate = isaac_exit_408310_arm_free_needed(
      static_cast<uint32_t>(out->flag), ISAAC_EXIT_408310_TEMP_EMPTY_FLAG,
      temp_cap);
  const int32_t arm2_gate = isaac_exit_408310_arm_free_needed(
      static_cast<uint32_t>(out->flag), ISAAC_EXIT_408310_TEMP_CTOR_FLAG,
      temp_cap);
  const uint32_t free_size = isaac_exit_40ccd0_free_size(temp_cap);
  const int32_t uses_header =
      isaac_exit_40ccd0_free_uses_heap_header(free_size);
  const int32_t offset_ok =
      isaac_exit_40ccd0_free_header_offset_ok(temp_ptr, header);

  /* Each arm's free math is only reached in the PE when its test bl,xx gate
     is open (the whole arm is skipped by the je), so the outputs are gated
     on it. */
  out->arm1_free_needed = arm1_gate;
  out->arm1_free_ptr =
      (arm1_gate != 0) ? isaac_exit_408310_free_ptr(temp_ptr, uses_header,
                                                    header)
                       : 0u;
  out->arm1_free_count =
      (arm1_gate != 0) ? isaac_exit_408310_free_count(temp_cap, uses_header)
                       : 0u;
  out->arm1_abort_needed =
      (arm1_gate != 0) ? isaac_exit_408310_abort_needed(uses_header, offset_ok)
                       : 0;

  out->arm2_free_needed = arm2_gate;
  out->arm2_free_ptr =
      (arm2_gate != 0) ? isaac_exit_408310_free_ptr(temp_ptr, uses_header,
                                                    header)
                       : 0u;
  out->arm2_free_count =
      (arm2_gate != 0) ? isaac_exit_408310_free_count(temp_cap, uses_header)
                       : 0u;
  out->arm2_abort_needed =
      (arm2_gate != 0) ? isaac_exit_408310_abort_needed(uses_header, offset_ok)
                       : 0;

  out->host_98_addr = dst_addr + (ISAAC_EXIT_408310_HOST_98_OFF -
                                  ISAAC_EXIT_408310_STR_OFF);
  out->invalid_param_iat = static_cast<uint32_t>(ISAAC_EXIT_408310_INVALID_PARAM_IAT);
}

/* --- ABI v33: Game::Exit root typed continuation plan --- */

extern "C" uint32_t isaac_exit_root_7df690_receiver(uint32_t manager_base,
                                                    uint32_t count_29fbc) {
  /* PE @ 0x006fa190: imul eax,[ecx+0x29fbc],0x184; @ 0x006fa1ae add
     ecx,0x29fc0; @ 0x006fa1b4 add ecx,eax. 32-bit wrap on both adds. */
  return manager_base + static_cast<uint32_t>(ISAAC_EXIT_ROOT_7DF690_BASE_OFF) +
         count_29fbc * static_cast<uint32_t>(ISAAC_EXIT_ROOT_7DF690_STRIDE);
}

extern "C" int32_t isaac_exit_root_anm2_reset_count(void) {
  return static_cast<int32_t>(ISAAC_EXIT_ROOT_ANM2_RESET_COUNT);
}

extern "C" uint32_t isaac_exit_root_anm2_reset_this_off_at(uint32_t index) {
  /* PE: call 0x00407f10 @ 0x006fa270 (this=Game+0x1d528), @ 0x006fa396
     (this=Game+0x1c03c, ecx held from 0x006fa2d5) and @ 0x006fa3a1
     (this=Game+0x1d1d8). */
  switch (index) {
    case 0:
      return static_cast<uint32_t>(ISAAC_EXIT_ROOT_ANM2_RESET_THIS_OFF_0);
    case 1:
      return static_cast<uint32_t>(ISAAC_EXIT_ROOT_ANM2_RESET_THIS_OFF_1);
    case 2:
      return static_cast<uint32_t>(ISAAC_EXIT_ROOT_ANM2_RESET_THIS_OFF_2);
    default:
      return 0;
  }
}

namespace {

inline uint32_t root_event_word(uint32_t kind, uint32_t payload24) {
  return (kind << 24) | (payload24 & 0x00ffffffu);
}

inline void root_emit(IsaacExitRootPlan* out, uint32_t word) {
  if (out->event_count < ISAAC_EXIT_ROOT_EVENT_CAP) {
    out->event[out->event_count++] = word;
  }
}

inline void root_host(IsaacExitRootPlan* out, uint32_t va) {
  root_emit(out, root_event_word(
                     static_cast<uint32_t>(ISAAC_EXIT_ROOT_EVENT_HOST), va));
}

inline void root_pure(IsaacExitRootPlan* out, uint32_t seg) {
  root_emit(out, root_event_word(
                     static_cast<uint32_t>(ISAAC_EXIT_ROOT_EVENT_PURE), seg));
}

}  // namespace

extern "C" void isaac_exit_root_plan(IsaacExitRootPlan* out,
                                     uint32_t should_save,
                                     uint32_t session_active_2658a,
                                     uint32_t overlay_state_1c034,
                                     uint32_t mgr_changesmade_14,
                                     uint32_t mgr_file_loaded_f8c,
                                     uint32_t steam_ctx_word,
                                     uint32_t mgr_cloud_2a3a4,
                                     uint32_t skip_gamestate_io_2658b,
                                     uint32_t mgr_count_29fbc,
                                     uint32_t vector_begin,
                                     uint32_t vector_end,
                                     uint32_t set_index_7d8) {
  if (out == nullptr) {
    return;
  }
  /* Deterministic zero fill: an inactive gate leaves the whole plan empty
     and the tail of the event array is always zero. */
  for (uint32_t i = 0; i < ISAAC_EXIT_ROOT_EVENT_CAP; ++i) {
    out->event[i] = 0u;
  }
  out->entry_active = 0;
  out->should_save = should_save;
  out->overlay_force_needed = 0;
  out->sfx_stop_count = 0;
  out->sfx_receiver_off =
      static_cast<uint32_t>(ISAAC_EXIT_ROOT_SFX_RECEIVER_OFF);
  out->pgd_flush_needed = 0;
  out->pgd_save_cloud = 0;
  out->gamestate_io_needed = 0;
  out->gamestate_should_write = 0;
  out->anm2_reset_count = 0;
  out->anm2_reset_this_off_0 =
      static_cast<uint32_t>(ISAAC_EXIT_ROOT_ANM2_RESET_THIS_OFF_0);
  out->anm2_reset_this_off_1 =
      static_cast<uint32_t>(ISAAC_EXIT_ROOT_ANM2_RESET_THIS_OFF_1);
  out->anm2_reset_this_off_2 =
      static_cast<uint32_t>(ISAAC_EXIT_ROOT_ANM2_RESET_THIS_OFF_2);
  out->vector_dtor_count = 0;
  out->host_8d26c0_needed = 0;
  out->event_count = 0;
  out->mgr_host_7df690_receiver =
      isaac_exit_root_7df690_receiver(0u, mgr_count_29fbc);

  /* Entry gate @ 0x006fa0d2: cmp byte ptr [ebx+0x2658a],0; je ret @
     0x006fa531 — a LOW-BYTE test; when the byte is zero NOTHING in the
     body runs and the ret-4 (not the terminal clears) is the early exit. */
  const uint8_t session_active =
      static_cast<uint8_t>(session_active_2658a & 0xffu);
  if (session_active == 0) {
    return;
  }
  out->entry_active = 1;
  /* Three ordered ANM2::Reset hosts (@ 0x006fa270/0x006fa396/0x006fa3a1);
     the count is populated when the entry gate is open so a slice driver
     can consume the reset table. */
  out->anm2_reset_count =
      static_cast<int32_t>(ISAAC_EXIT_ROOT_ANM2_RESET_COUNT);

  /* Host 0x008650a0 prologue; raw STACK dword pushed verbatim. */
  root_host(out, 0x008650a0u);

  /* SFX walk 0x0092e300 + five 0x0092e230 stops on Manager+0x2a324. */
  root_host(out, 0x0092e300u);
  out->sfx_stop_count = static_cast<int32_t>(ISAAC_EXIT_SFX_STOP_COUNT);
  for (uint32_t i = 0; i < static_cast<uint32_t>(ISAAC_EXIT_SFX_STOP_COUNT);
       ++i) {
    root_host(out, 0x0092e230u);
  }

  /* ItemOverlay force gate @ 0x006fa166: test eax,eax; je; cmp eax,2; jne —
     FULL-dword state == 2, then host 0x009aca90 (exact ItemOverlay::Update,
     this=Game+0x1c034, arg 1). */
  if (overlay_state_1c034 == 2u) {
    out->overlay_force_needed = 1;
    root_host(out, 0x009aca90u);
  }

  /* Manager floats pure segment @ 0x006fa19a (always when active). */
  root_pure(out, static_cast<uint32_t>(ISAAC_EXIT_ROOT_SEG_MANAGER_FLOATS));
  /* Host 0x007df690 with the receiver computed above. */
  out->mgr_host_7df690_receiver =
      isaac_exit_root_7df690_receiver(0, mgr_count_29fbc);
  root_host(out, 0x007df690u);

  /* PGD flush gate @ 0x006fa1c4: two LOW-BYTE tests (changesmade @
     Manager+0x14, fileLoaded @ +0x14+0xf8c); the changesmade clear is a
     BYTE store; Steam context init via IAT [0x00b18a1c]; cloud selected by
     FULL-dword [eax] && byte Manager+0x2a3a4 (host 0x00928ee0 = exact
     SaveToSteamCloud, else local 0x009294f0). */
  if (isaac_exit_pgd_flush_needed(mgr_changesmade_14,
                                  mgr_file_loaded_f8c)) {
    out->pgd_flush_needed = 1;
    root_pure(out,
              static_cast<uint32_t>(ISAAC_EXIT_ROOT_SEG_PGD_CHANGES_CLEAR));
    root_host(out, 0x009292c0u);
    root_host(out, static_cast<uint32_t>(ISAAC_EXIT_ROOT_STEAM_CTX_IAT));
    const int32_t cloud =
        isaac_exit_pgd_save_uses_cloud(steam_ctx_word, mgr_cloud_2a3a4);
    out->pgd_save_cloud = cloud;
    root_host(out, cloud != 0 ? 0x00928ee0u : 0x009294f0u);
  }

  /* GameState IO @ 0x006fa20e: LOW-BYTE skip gate Game+0x2658b; write
     host 0x00958ed0 vs delete host 0x00959130 by the LOW byte of
     ShouldSave. */
  if (isaac_exit_gamestate_io_needed(skip_gamestate_io_2658b)) {
    out->gamestate_io_needed = 1;
    if (isaac_exit_gamestate_should_write(should_save)) {
      out->gamestate_should_write = 1;
      root_host(out, 0x00958ed0u);
    } else {
      root_host(out, 0x00959130u);
    }
  }

  /* Early pure teardown T0 (Game+0x2510c, +0x2593c) then host 0x008d26c0
     (this=Game+0x25108, args 0,0); T1 (+0x25948, +0x2590c, +0x1d520) then
     ANM2::Reset #1 (this=Game+0x1d528); T2 (+0x1d654).
     v34: the site pushes index 0 / force 0 (0x006fa229/0x006fa22b), so
     when the receiver's current set index is already 0 the whole callee
     is a censused complete no-op — zero stores, zero calls — and the
     host event is DROPPED. Any other current index keeps it verbatim. */
  root_pure(out, static_cast<uint32_t>(ISAAC_EXIT_ROOT_SEG_TEARDOWN_T0));
  out->host_8d26c0_needed =
      isaac_exit_root_8d26c0_host_needed(set_index_7d8);
  if (out->host_8d26c0_needed != 0) {
    root_host(out, 0x008d26c0u);
  }
  root_pure(out, static_cast<uint32_t>(ISAAC_EXIT_ROOT_SEG_TEARDOWN_T1));
  root_host(out, 0x00407f10u);
  root_pure(out, static_cast<uint32_t>(ISAAC_EXIT_ROOT_SEG_TEARDOWN_T2));

  /* Vector dtor loop @ 0x006fa27f: count = (end-begin)/0x38; when nonzero
     one VECTOR_DTOR_LOOP event (count payload) then the pure clear-end
     (the PE re-reads begin after the loop). */
  const int32_t dtor_count =
      isaac_exit_vector_25ebc_element_count(vector_begin, vector_end);
  if (dtor_count > 0) {
    out->vector_dtor_count = dtor_count;
    root_emit(out,
              root_event_word(static_cast<uint32_t>(
                                  ISAAC_EXIT_ROOT_EVENT_VECTOR_DTOR_LOOP),
                              static_cast<uint32_t>(dtor_count)));
  }
  root_pure(out, static_cast<uint32_t>(ISAAC_EXIT_ROOT_SEG_VECTOR_CLEAR_END));
  /* Byte Game+0x25954 <- 0 then nested 0x006f43b0. */
  root_pure(out, static_cast<uint32_t>(ISAAC_EXIT_ROOT_SEG_BYTE_25954));
  root_host(out, 0x006f43b0u);
  /* Info log 0x00a112c0 (level 1, "Setting PersistentGameData ReadOnly to
     %s\n", "False" — both strings .rdata); then the readonly byte clear
     (Manager+0x15) and the post-log pure pack (v2/v31). */
  root_host(out, 0x00a112c0u);
  root_pure(out, static_cast<uint32_t>(ISAAC_EXIT_ROOT_SEG_PGD_READONLY));
  root_pure(out, static_cast<uint32_t>(ISAAC_EXIT_ROOT_SEG_POSTLOG_PACK));
  /* ANM2::Reset #2 (this=Game+0x1c03c) and #3 (this=Game+0x1d1d8). */
  root_host(out, 0x00407f10u);
  root_host(out, 0x00407f10u);
  /* Overlay state clear (0x1c034/0x1c038) then host 0x00421260
     (this=Game+0x1d2ec; v3 pure islands inside). */
  root_pure(out, static_cast<uint32_t>(ISAAC_EXIT_ROOT_SEG_OVERLAY_STATE));
  root_host(out, 0x00421260u);
  /* 18990 nest (pure) then the ordered terminal residual hosts (each keeps
     its v5-v27 pure islands). */
  root_pure(out, static_cast<uint32_t>(ISAAC_EXIT_ROOT_SEG_RESIDUAL_18990));
  root_host(out, 0x00686950u);
  root_host(out, 0x007384d0u);
  root_host(out, 0x009b9150u);
  root_host(out, 0x009a27d0u);
  root_host(out, 0x009a19a0u);
  root_host(out, 0x0040e910u);
  /* Map walk over Game+0x1a738 (v10/v11: 0x0069d690 find, 0x0040c7f0 elem
     loops, 0x0040e910 erase, pure successor + flag +0x28 clear). */
  root_emit(out, root_event_word(
                     static_cast<uint32_t>(ISAAC_EXIT_ROOT_EVENT_MAP_WALK),
                     0u));
  root_host(out, 0x009b5cb0u);
  /* Terminal: dword Game+0x265c0 <- 0, word Game+0x2658a <- 0. */
  root_pure(out, static_cast<uint32_t>(ISAAC_EXIT_ROOT_SEG_TERMINAL));
}

/* --- ABI v34: complete body of 0x008d26c0 (set-index step rescaler) ---

   __thiscall(index = [ebp+8], force = [ebp+0xc]); ret 8. Decoded linearly
   from the int3 pad run 0x008d26b7..0x008d26c0 (57 instructions, 0
   resyncs) and re-anchored from a second decode. The ONLY call in the
   whole body is the shared logger 0x00a112c0, which the standing logger
   split classifies as a platform primitive, so nothing here is left as
   untranslated game logic.

     0x008d26cb  cmp esi, [edi+0x7d8]        ; FULL dword
     0x008d26d1  jne  0x8d26dd
     0x008d26d3  cmp byte ptr [ebp+0xc], 0   ; LOW BYTE
     0x008d26d7  je   0x8d277e               ; NOOP: no stores, no calls
     0x008d26dd  mov ecx, [edi+0x7d0]        ; end
     0x008d26e3  mov eax, 0x2aaaaaab
     0x008d26e8  mov ebx, [edi+0x7cc]        ; begin
     0x008d26ee  sub ecx, ebx
     0x008d26f0  imul ecx                    ; SIGNED magic division by 0xc
     0x008d26f2  sar edx, 1
     0x008d26f4  mov eax, edx
     0x008d26f6  shr eax, 0x1f
     0x008d26f9  add eax, edx                ; = count
     0x008d26fb  cmp esi, eax
     0x008d26fd  jae  0x8d276e               ; UNSIGNED bound -> INVALID
     0x008d26ff  lea eax, [esi+esi*2]
     0x008d2702  mov [edi+0x7d8], esi        ; STORE 1
     0x008d2708  mov ecx, [ebx+eax*4+4]
     0x008d270c  sub ecx, [ebx+eax*4]
     0x008d2717  sar ecx, 2                  ; ARITHMETIC
     0x008d274d  movss [edi+0x838], xmm1     ; STORE 2
     0x008d2761  mov [edi+0x834], eax        ; STORE 3
     0x008d276e  push esi / push 0xb758b8 / push 8 / call 0xa112c0
*/

namespace {

/* x86 CVTTSS2SI: truncate toward zero, but yield the integer indefinite
   0x80000000 for NaN, either infinity, or any value whose truncation does
   not fit int32. A plain C++ cast is undefined behaviour in exactly those
   cases, so the boundary is spelled out. 2147483648.0f is 2^31 exactly and
   -2147483648.0f is representable and IN range. */
inline int32_t x86_cvttss2si(float v) {
  if (!(v == v)) {
    return static_cast<int32_t>(ISAAC_EXIT_8D26C0_CVTTSS2SI_INDEFINITE);
  }
  if (!(v >= -2147483648.0f) || !(v < 2147483648.0f)) {
    return static_cast<int32_t>(ISAAC_EXIT_8D26C0_CVTTSS2SI_INDEFINITE);
  }
  return static_cast<int32_t>(v);
}

}  // namespace

extern "C" int32_t isaac_exit_8d26c0_is_noop(uint32_t index,
                                             uint32_t cur_index,
                                             uint32_t force_in) {
  /* PE 0x008d26cb is a FULL-dword compare; PE 0x008d26d3 tests only the
     LOW BYTE of the stack argument. Taking force as uint32_t and masking
     here is what keeps -O2 from deleting the narrowing. */
  const uint8_t force = static_cast<uint8_t>(force_in & 0xffu);
  return (index == cur_index && force == 0) ? 1 : 0;
}

extern "C" int32_t isaac_exit_8d26c0_element_count(uint32_t begin,
                                                   uint32_t end) {
  /* delta is a 32-bit wrapping subtraction, then the MSVC SIGNED magic
     division by 0xc. Reading this as an unsigned delta/0xc diverges for
     every reversed or torn begin/end pair. */
  const int32_t delta = static_cast<int32_t>(end - begin);
  const int64_t product =
      static_cast<int64_t>(static_cast<int32_t>(ISAAC_EXIT_8D26C0_DIV_MAGIC)) *
      static_cast<int64_t>(delta);
  int32_t high = static_cast<int32_t>(
      static_cast<uint32_t>(static_cast<uint64_t>(product) >> 32));
  high >>= 1;                                                    /* sar edx,1 */
  const uint32_t correction = static_cast<uint32_t>(high) >> 31; /* shr,0x1f */
  return static_cast<int32_t>(static_cast<uint32_t>(high) + correction);
}

extern "C" int32_t isaac_exit_8d26c0_index_valid(uint32_t index,
                                                 int32_t count) {
  /* PE 0x008d26fd jae is UNSIGNED, even though count came out of a SIGNED
     division. A negative count therefore admits large indices. */
  return (index < static_cast<uint32_t>(count)) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_8d26c0_element_addr(uint32_t begin,
                                                   uint32_t index) {
  /* lea eax,[esi+esi*2] then [ebx+eax*4] = begin + index*0xc, 32-bit wrap. */
  return static_cast<uint32_t>(
      begin + index * static_cast<uint32_t>(ISAAC_EXIT_8D26C0_ELEM_STRIDE));
}

extern "C" int32_t isaac_exit_8d26c0_sub_count(uint32_t elem_lo,
                                               uint32_t elem_hi) {
  /* sar ecx,2 @ 0x008d2717 is ARITHMETIC: a reversed pair stays negative
     and is later reinterpreted as unsigned by the float conversion. */
  const int32_t delta = static_cast<int32_t>(elem_hi - elem_lo);
  return delta >> ISAAC_EXIT_8D26C0_SUB_SHIFT;
}

extern "C" uint32_t isaac_exit_8d26c0_step_bits(int32_t sub_count) {
  /* cvtdq2pd gives the SIGNED double; the addsd then indexes the .rdata
     pair {0.0, 4294967296.0} with the SIGN BIT, so the two together are
     exactly an unsigned conversion. Transcribed in that order rather than
     folded, so the mechanism stays auditable. */
  double widened = static_cast<double>(sub_count);
  const uint32_t sign = static_cast<uint32_t>(sub_count) >> 31;
  widened += (sign != 0u) ? 4294967296.0 : 0.0;
  const float denominator = static_cast<float>(widened); /* cvtpd2ps */
  const float numerator = f32_bits(ISAAC_EXIT_8D26C0_F32_360_BITS);
  return __builtin_bit_cast(uint32_t, numerator / denominator);
}

extern "C" int32_t isaac_exit_8d26c0_frame_from(int32_t old_frame,
                                                uint32_t old_step_bits,
                                                uint32_t new_step_bits) {
  /* The multiply consumes the OLD step (read at 0x008d2730, before the
     store at 0x008d274d) and the divide consumes the NEW one. Folding
     either side to the other value is defect class 1. */
  float scaled = static_cast<float>(old_frame);                /* cvtdq2ps */
  scaled = scaled * f32_bits(old_step_bits);                   /* mulss */
  scaled = scaled / f32_bits(new_step_bits);                   /* divss */
  scaled = scaled + f32_bits(ISAAC_EXIT_8D26C0_F32_HALF_BITS); /* addss */
  return x86_cvttss2si(scaled);                                /* cvttss2si */
}

extern "C" void isaac_exit_8d26c0_plan(IsaacExit8d26c0Plan* out,
                                       uint32_t index, uint32_t force,
                                       uint32_t cur_index, uint32_t vec_begin,
                                       uint32_t vec_end, uint32_t elem_lo,
                                       uint32_t elem_hi, int32_t old_frame,
                                       uint32_t old_step_bits) {
  if (out == nullptr) {
    return;
  }
  out->arm = static_cast<int32_t>(ISAAC_EXIT_8D26C0_ARM_NOOP);
  out->element_count = 0;
  out->index_valid = 0;
  out->element_addr = 0u;
  out->sub_count = 0;
  out->new_step_bits = 0u;
  out->new_frame = 0;
  out->store_count = 0;
  out->log_needed = 0;
  out->log_level = 0u;
  out->log_fmt_addr = 0u;
  out->log_arg = 0u;

  if (isaac_exit_8d26c0_is_noop(index, cur_index, force) != 0) {
    return; /* zero stores, zero calls */
  }

  const int32_t count = isaac_exit_8d26c0_element_count(vec_begin, vec_end);
  out->element_count = count;
  out->index_valid = isaac_exit_8d26c0_index_valid(index, count);
  if (out->index_valid == 0) {
    out->arm = static_cast<int32_t>(ISAAC_EXIT_8D26C0_ARM_INVALID);
    out->log_needed = 1;
    out->log_level = static_cast<uint32_t>(ISAAC_EXIT_8D26C0_LOG_LEVEL);
    out->log_fmt_addr = static_cast<uint32_t>(ISAAC_EXIT_8D26C0_LOG_FMT_ADDR);
    out->log_arg = index; /* pushed raw, not narrowed */
    return;               /* zero stores */
  }

  out->arm = static_cast<int32_t>(ISAAC_EXIT_8D26C0_ARM_APPLY);
  out->element_addr = isaac_exit_8d26c0_element_addr(vec_begin, index);
  out->sub_count = isaac_exit_8d26c0_sub_count(elem_lo, elem_hi);
  out->new_step_bits = isaac_exit_8d26c0_step_bits(out->sub_count);
  out->new_frame = isaac_exit_8d26c0_frame_from(old_frame, old_step_bits,
                                                out->new_step_bits);
  out->store_count = static_cast<int32_t>(ISAAC_EXIT_8D26C0_APPLY_STORE_COUNT);
}

extern "C" int32_t isaac_exit_8d26c0_apply(uint8_t* this_base, uint32_t index,
                                           uint32_t force, uint32_t elem_lo,
                                           uint32_t elem_hi) {
  if (this_base == nullptr) {
    return static_cast<int32_t>(ISAAC_EXIT_8D26C0_ARM_NOOP);
  }
  const uint32_t cur_index =
      load_u32_le(this_base + ISAAC_EXIT_8D26C0_SET_INDEX_OFF);
  const uint32_t vec_begin =
      load_u32_le(this_base + ISAAC_EXIT_8D26C0_VEC_BEGIN_OFF);
  const uint32_t vec_end =
      load_u32_le(this_base + ISAAC_EXIT_8D26C0_VEC_END_OFF);
  const int32_t old_frame =
      static_cast<int32_t>(load_u32_le(this_base + ISAAC_EXIT_8D26C0_FRAME_OFF));
  const uint32_t old_step_bits =
      load_u32_le(this_base + ISAAC_EXIT_8D26C0_STEP_OFF);

  IsaacExit8d26c0Plan plan;
  isaac_exit_8d26c0_plan(&plan, index, force, cur_index, vec_begin, vec_end,
                         elem_lo, elem_hi, old_frame, old_step_bits);
  if (plan.arm != static_cast<int32_t>(ISAAC_EXIT_8D26C0_ARM_APPLY)) {
    return plan.arm; /* both other arms write nothing at all */
  }
  /* Exactly the three PE stores, in PE order. */
  store_u32_le(this_base + ISAAC_EXIT_8D26C0_SET_INDEX_OFF, index);
  store_u32_le(this_base + ISAAC_EXIT_8D26C0_STEP_OFF, plan.new_step_bits);
  store_u32_le(this_base + ISAAC_EXIT_8D26C0_FRAME_OFF,
               static_cast<uint32_t>(plan.new_frame));
  return plan.arm;
}

extern "C" int32_t isaac_exit_root_8d26c0_host_needed(uint32_t cur_index) {
  /* Game::Exit pushes force 0 @ 0x006fa229 and index 0 @ 0x006fa22b, then
     loads this = Game+0x25108 @ 0x006fa22d. With index 0 and force 0 the
     entry gate closes exactly when the receiver current index is 0. */
  return isaac_exit_8d26c0_is_noop(0u, cur_index, 0u) != 0 ? 0 : 1;
}

/* --- ABI v36: complete body of 0x007df690 (7-slot volume setter) ---
   PE transcription (123 bytes, ret @ 0x007df70a):
     0x007df690 push ebp; mov ebp,esp; push ecx; push esi; mov esi,ecx
     0x007df697 movss [ebp-4],xmm1
     0x007df69c push edi
     slot 0 inline: mov ecx,[esi]; test ecx,ecx; je 0x7df6c9
       mov eax,[ecx]; mov eax,[eax+0x28]; call eax; test al,al; je 0x7df6c9
       movss xmm0,[ebp-4]; mov ecx,[esi]           ; obj RE-READ
       movss [esi+0x14],xmm0; test ecx,ecx; je 0x7df6c9
       mov eax,[ecx]; push ecx; movss [esp],xmm0; call [eax+0x58]
     loop: add esi,0x34; mov edi,6; (same block @ 0x7df6d1); add esi,0x34;
       sub edi,1; jne 0x7df6d1; pop edi; pop esi; mov esp,ebp; pop ebp; ret
   Per-slot: obj0 = [s]; skip when 0; HOST gate vtable[obj0]+0x28(); when
   open: obj1 = [s] RE-READ, STORE [s+0x14] = float, and when obj1 != 0
   HOST set vtable[obj1]+0x58(float). */

extern "C" int32_t isaac_exit_7df690_slot_count(void) {
  return ISAAC_EXIT_7DF690_SLOT_COUNT;
}

extern "C" uint32_t isaac_exit_7df690_slot_addr(uint32_t receiver,
                                                uint32_t index) {
  /* PE 0x007df6c9/0x007df6fd: add esi,0x34 per slot; 32-bit wrap. */
  if (index >= static_cast<uint32_t>(ISAAC_EXIT_7DF690_SLOT_COUNT)) {
    return 0u; /* the PE loop is fixed at 7 iterations */
  }
  return (receiver + index * static_cast<uint32_t>(ISAAC_EXIT_7DF690_SLOT_STRIDE)) &
         0xffffffffu;
}

extern "C" uint32_t isaac_exit_7df690_float_off(void) {
  return ISAAC_EXIT_7DF690_FLOAT_OFF;
}

extern "C" uint32_t isaac_exit_7df690_gate_vtbl_off(void) {
  return ISAAC_EXIT_7DF690_GATE_VTBL_OFF;
}

extern "C" uint32_t isaac_exit_7df690_set_vtbl_off(void) {
  return ISAAC_EXIT_7DF690_SET_VTBL_OFF;
}

extern "C" int32_t isaac_exit_7df690_slot_obj_present(uint32_t slot_addr) {
  /* PE 0x007df69f: test ecx,ecx — FULL-dword presence. A pointer whose
     low byte is 0 (e.g. 0x100) IS present; a byte-narrowed test would
     be the uint8_t-parameter defect class. */
  return tree_load_u32(slot_addr) != 0u ? 1 : 0;
}

extern "C" uint32_t isaac_exit_7df690_apply(uint32_t slot_base,
                                            uint32_t float_bits) {
  /* PE 0x007df6b5: movss [esi+0x14],xmm0 — the body's only pure store,
     on the gate-open path. Raw u32 bits, no float interpretation. */
  const uint32_t addr =
      (slot_base + static_cast<uint32_t>(ISAAC_EXIT_7DF690_FLOAT_OFF)) &
      0xffffffffu;
  tree_store_u32(addr, float_bits);
  return addr;
}

extern "C" void isaac_exit_7df690_plan(IsaacExit7df690Plan* out,
                                       uint32_t receiver) {
  if (out == nullptr) {
    return;
  }
  out->slot_count = ISAAC_EXIT_7DF690_SLOT_COUNT;
  out->obj_present_count = 0;
  for (uint32_t i = 0; i < static_cast<uint32_t>(ISAAC_EXIT_7DF690_SLOT_COUNT);
       ++i) {
    const uint32_t s =
        (receiver + i * static_cast<uint32_t>(ISAAC_EXIT_7DF690_SLOT_STRIDE)) &
        0xffffffffu;
    out->slot_addr[i] = s;
    if (tree_load_u32(s) != 0u) {
      out->obj_present_count += 1;
    }
  }
}

/* --- ABI v37: Exit-root prologue 0x008650a0 (217 B) ---
   PE transcription (happy path ret 4 @ 0x0086512b; SEH filter ret @
   0x00865178). identify-zhl empty. IAT 0xb1831c = Lua5.3.3r.dll!luaL_unref.
     0x008650cb mov ecx,[0xc71690]
     0x008650d1 mov [ebp-0x28], 0x11
     0x008650d8 mov [ebp-0x24], 0xffffffff
     0x008650df mov eax,[ecx+0x10]; mov [ebp-0x2c], eax
     0x008650e5 mov eax,[ecx]; test dword [eax], 0x20000; je 0x86511a
     0x008650ef push [ebp+8]; call 0x874a10; IAT luaL_unref; ret 4
   Host: 0x874a10, IAT luaL_unref, logger 0xa112c0, 0x693180, SEH.
   Pure: FULL-dword 0x20000 gate, engine+0x10 math, three pack stores. */

extern "C" int32_t isaac_exit_8650a0_flag_open(uint32_t flag_dword) {
  /* PE 0x008650e7: test dword ptr [eax], 0x20000 -- FULL-dword. A
     sibling-confused mask of 0x2000 (0x00864c30) would close 0x20000
     and open 0x2000; 0x100 / 0x1ff must stay closed. */
  return ((flag_dword & static_cast<uint32_t>(ISAAC_EXIT_8650A0_FLAG_MASK)) !=
          0u)
             ? 1
             : 0;
}

extern "C" int32_t isaac_exit_8650a0_host_needed(uint32_t flag_dword) {
  /* Both 0x874a10 and luaL_unref sit on the open arm; closed jumps
     straight to SEH teardown. */
  return isaac_exit_8650a0_flag_open(flag_dword);
}

extern "C" uint32_t isaac_exit_8650a0_flag_mask(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_8650A0_FLAG_MASK);
}

extern "C" uint32_t isaac_exit_8650a0_holder_off(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_8650A0_HOLDER_OFF);
}

extern "C" uint32_t isaac_exit_8650a0_holder_addr(uint32_t engine) {
  /* PE 0x008650df: [ecx+0x10] -- 32-bit wrap. */
  return (engine + static_cast<uint32_t>(ISAAC_EXIT_8650A0_HOLDER_OFF)) &
         0xffffffffu;
}

extern "C" uint32_t isaac_exit_8650a0_pack_arg1(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_8650A0_PACK_ARG1);
}

extern "C" uint32_t isaac_exit_8650a0_pack_arg2(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_8650A0_PACK_ARG2);
}

extern "C" uint32_t isaac_exit_8650a0_registry_index(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_8650A0_REGISTRY_INDEX);
}

extern "C" uint32_t isaac_exit_8650a0_unref_iat(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_8650A0_UNREF_IAT);
}

extern "C" uint32_t isaac_exit_8650a0_host_874a10_va(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_8650A0_HOST_874A10_VA);
}

extern "C" uint32_t isaac_exit_8650a0_pack_apply(uint32_t pack_base,
                                                 uint32_t holder) {
  /* PE order @ 0x008650d1 / 0x008650d8 / 0x008650e2:
       [pack+4] <- 0x11
       [pack+8] <- 0xffffffff
       [pack+0] <- holder     (LAST; the load of [engine+0x10] precedes it)
     32-bit wrap on every address. */
  const uint32_t a1 = (pack_base + 4u) & 0xffffffffu;
  const uint32_t a2 = (pack_base + 8u) & 0xffffffffu;
  tree_store_u32(a1, static_cast<uint32_t>(ISAAC_EXIT_8650A0_PACK_ARG1));
  tree_store_u32(a2, static_cast<uint32_t>(ISAAC_EXIT_8650A0_PACK_ARG2));
  tree_store_u32(pack_base, holder);
  return pack_base;
}

extern "C" void isaac_exit_8650a0_plan(IsaacExit8650a0Plan* out,
                                       uint32_t flag_dword, uint32_t engine,
                                       uint32_t should_save) {
  if (out == nullptr) {
    return;
  }
  const int32_t open = isaac_exit_8650a0_flag_open(flag_dword);
  out->flag_open = open;
  out->host_874a10_needed = open;
  out->host_unref_needed = open;
  out->holder_addr = isaac_exit_8650a0_holder_addr(engine);
  out->pack_arg1 = static_cast<uint32_t>(ISAAC_EXIT_8650A0_PACK_ARG1);
  out->pack_arg2 = static_cast<uint32_t>(ISAAC_EXIT_8650A0_PACK_ARG2);
  out->should_save = should_save; /* RAW; 8650a0 does not mask it */
}

/* --- ABI v38: Exit nest 0x00686950 (384 B) ---
   PE transcription (early ret 0x00686a1f; terminal ret 0x00686acf).
   identify-zhl empty. IAT 0xb187cc = remove. 1075 B window continues
   into siblings 0x00686ad0 / 0x00686b70 (0x40cf50 x2) which Exit does
   not call.
     0x00686968 cmp dword [esi], 1 ; jbe 0x686abf     UNSIGNED
     0x00686977 mov [esi], 4
     0x0068697d mov [esi+4], 0
     0x00686984 mov byte [ecx+0x4abc7], 1
     then I/O gates; HOST sprintf / remove / fopen / virtuals. */

extern "C" int32_t isaac_exit_686950_entry_open(uint32_t state_dword) {
  /* PE 0x00686968: cmp dword ptr [esi], 1 ; jbe — UNSIGNED.
     0 / 1 closed; 2 open; 0xffffffff open. A signed `> 1` would close
     0xffffffff. Never narrow to a byte: 0x100 is OPEN. */
  return (state_dword > 1u) ? 1 : 0;
}

extern "C" int32_t isaac_exit_686950_io_open(uint32_t vec_begin, uint32_t vec_end,
                                            uint32_t game_ptr, uint32_t game_26630,
                                            uint32_t game_26638_in,
                                            uint32_t mgr_2a398_in,
                                            uint32_t mgr_2a3a1_in) {
  /* PE 0x00686991: cmp eax, [ecx+0x4b3dc] ; jne epilogue — FULL-dword. */
  if (vec_begin != vec_end) {
    return 0;
  }
  const uint8_t game_26638 = static_cast<uint8_t>(game_26638_in & 0xffu);
  const uint8_t mgr_2a398 = static_cast<uint8_t>(mgr_2a398_in & 0xffu);
  const uint8_t mgr_2a3a1 = static_cast<uint8_t>(mgr_2a3a1_in & 0xffu);
  /* PE 0x006869a2 test game; je 2a398. PE 0x006869a6 cmp dword
     [game+0x26630], 0 ; jbe 2a398 — UNSIGNED <= 0, i.e. == 0 only.
     0x80000000 does NOT skip the byte test (a signed jle would). */
  if (game_ptr != 0u && game_26630 > 0u) {
    /* PE 0x006869af: cmp byte [game+0x26638], 0 ; je epilogue. */
    if (game_26638 == 0u) {
      return 0;
    }
  }
  /* PE 0x006869bc / 0x006869c9: cmp byte, 0 ; je epilogue. */
  if (mgr_2a398 == 0u) {
    return 0;
  }
  if (mgr_2a3a1 == 0u) {
    return 0;
  }
  return 1;
}

extern "C" int32_t isaac_exit_686950_host_needed(uint32_t state_dword,
                                                uint32_t vec_begin,
                                                uint32_t vec_end,
                                                uint32_t game_ptr,
                                                uint32_t game_26630,
                                                uint32_t game_26638_in,
                                                uint32_t mgr_2a398_in,
                                                uint32_t mgr_2a3a1_in) {
  if (isaac_exit_686950_entry_open(state_dword) == 0) {
    return 0;
  }
  return isaac_exit_686950_io_open(vec_begin, vec_end, game_ptr, game_26630,
                                   game_26638_in, mgr_2a398_in, mgr_2a3a1_in);
}

extern "C" int32_t isaac_exit_686950_remove_needed(uint32_t count64) {
  /* PE 0x006869ff: cmp dword [esi+0x64], 0 ; jne write. FULL-dword.
     0x100 is WRITE, not remove. */
  return (count64 == 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_686950_va(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_686950_VA);
}

extern "C" uint32_t isaac_exit_686950_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_686950_BODY_BYTES);
}

extern "C" uint32_t isaac_exit_686950_this_from_game(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_686950_THIS_FROM_GAME);
}

extern "C" uint32_t isaac_exit_686950_state_value(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_686950_STATE_VALUE);
}

extern "C" uint32_t isaac_exit_686950_mgr_flag_off(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_686950_MGR_FLAG_OFF);
}

extern "C" uint32_t isaac_exit_686950_sprintf_va(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_686950_SPRINTF_VA);
}

extern "C" uint32_t isaac_exit_686950_remove_iat(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_686950_REMOVE_IAT);
}

extern "C" uint32_t isaac_exit_686950_mgr_flag_addr(uint32_t manager) {
  /* PE 0x00686984: ecx+0x4abc7 — 32-bit wrap. */
  return (manager + static_cast<uint32_t>(ISAAC_EXIT_686950_MGR_FLAG_OFF)) &
         0xffffffffu;
}

extern "C" uint32_t isaac_exit_686950_pack_apply(uint32_t this_addr,
                                                uint32_t manager) {
  /* PE order @ 0x00686977 / 0x0068697d / 0x00686984:
       [this]     <- 4
       [this+4]   <- 0
       byte [manager+0x4abc7] <- 1     LAST
     32-bit wrap on every address. */
  const uint32_t field4 = (this_addr + 4u) & 0xffffffffu;
  const uint32_t flag = isaac_exit_686950_mgr_flag_addr(manager);
  tree_store_u32(this_addr, static_cast<uint32_t>(ISAAC_EXIT_686950_STATE_VALUE));
  tree_store_u32(field4, static_cast<uint32_t>(ISAAC_EXIT_686950_FIELD4_VALUE));
  tree_node_mut(flag)[0] =
      static_cast<uint8_t>(ISAAC_EXIT_686950_MGR_FLAG_VALUE);
  return this_addr;
}

extern "C" void isaac_exit_686950_plan(IsaacExit686950Plan* out,
                                       uint32_t state_dword, uint32_t manager,
                                       uint32_t vec_begin, uint32_t vec_end,
                                       uint32_t game_ptr, uint32_t game_26630,
                                       uint32_t game_26638_in,
                                       uint32_t mgr_2a398_in,
                                       uint32_t mgr_2a3a1_in, uint32_t count64,
                                       uint32_t this_addr) {
  if (out == nullptr) {
    return;
  }
  const int32_t entry = isaac_exit_686950_entry_open(state_dword);
  const int32_t io = isaac_exit_686950_io_open(
      vec_begin, vec_end, game_ptr, game_26630, game_26638_in, mgr_2a398_in,
      mgr_2a3a1_in);
  const int32_t host_io = (entry != 0 && io != 0) ? 1 : 0;
  const int32_t remove = isaac_exit_686950_remove_needed(count64);
  out->entry_open = entry;
  out->pack_needed = entry;
  out->host_io_needed = host_io;
  out->host_remove_needed = (host_io != 0 && remove != 0) ? 1 : 0;
  out->host_write_needed = (host_io != 0 && remove == 0) ? 1 : 0;
  out->mgr_flag_addr = isaac_exit_686950_mgr_flag_addr(manager);
  out->this_addr = this_addr;
}

/* --- ABI v39: GameState write 0x00958ed0 (600 B) ---
   PE transcription (early ret 0x00958efa; terminal ret 0x00959127).
   identify-zhl empty on the body; string "GameState::Save".
   Sibling 0x00959130 is GameState::Delete -- distinct IAT/CF, not folded.
     0x00958edf cmp dword [esi+8], 2 ; je body
     0x00958f01 cmp dword [game+0x26630], 0 ; ja epilogue  UNSIGNED
     0x00958f14 vec begin==end ; jne epilogue
     HOST GetPlayer / optional GetExtraLives SIGNED >= 1
     0x00958f5a byte [esi+0x20dcc]=1
     HOST SaveState / 0x8f8cd0 / Steam / fopen / write / PGD
     tail byte [esi+0x20dcc]=0. */

extern "C" int32_t isaac_exit_958ed0_entry_open(uint32_t state8) {
  /* PE 0x00958edf: cmp dword ptr [esi+8], 2 ; je -- FULL-dword.
     0x102 is CLOSED (a byte test would open it). */
  return (state8 == static_cast<uint32_t>(ISAAC_EXIT_958ED0_STATE8_VALUE)) ? 1
                                                                         : 0;
}

extern "C" int32_t isaac_exit_958ed0_count_ok(uint32_t count26630) {
  /* PE 0x00958f01: cmp dword, 0 ; ja epilogue -- UNSIGNED > 0 skips.
     Continue only when == 0. 0x80000000 is CLOSED (a signed jle would
     open it). */
  return (count26630 == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_exit_958ed0_vec_empty(uint32_t vec_begin,
                                              uint32_t vec_end) {
  /* PE 0x00958f14: cmp eax, [esi+0x4b3dc] ; jne epilogue -- FULL-dword. */
  return (vec_begin == vec_end) ? 1 : 0;
}

extern "C" int32_t isaac_exit_958ed0_prefix_open(uint32_t state8,
                                                uint32_t count26630,
                                                uint32_t vec_begin,
                                                uint32_t vec_end) {
  if (isaac_exit_958ed0_entry_open(state8) == 0) {
    return 0;
  }
  if (isaac_exit_958ed0_count_ok(count26630) == 0) {
    return 0;
  }
  return isaac_exit_958ed0_vec_empty(vec_begin, vec_end);
}

extern "C" int32_t isaac_exit_958ed0_challenge_needed(uint32_t byte173_in) {
  /* PE 0x00958f27: cmp byte [eax+0x173], 0 ; je pack -- LOW-BYTE.
     0x100 has AL==0 so GetExtraLives is SKIPPED. */
  const uint8_t byte173 = static_cast<uint8_t>(byte173_in & 0xffu);
  return (byte173 != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_exit_958ed0_challenge_ok(uint32_t byte173_in,
                                                 uint32_t extra_lives) {
  const uint8_t byte173 = static_cast<uint8_t>(byte173_in & 0xffu);
  if (byte173 == 0u) {
    return 1;
  }
  /* PE 0x00958f44: cmp eax, 1 ; jl epilogue -- SIGNED.
     0xffffffff (-1) and 0x80000000 (INT_MIN) are CLOSED; 1 is OPEN.
     An unsigned jb would open 0xffffffff. */
  return (static_cast<int32_t>(extra_lives) >=
          static_cast<int32_t>(ISAAC_EXIT_958ED0_LIVES_MIN))
             ? 1
             : 0;
}

extern "C" int32_t isaac_exit_958ed0_host_needed(uint32_t state8,
                                                uint32_t count26630,
                                                uint32_t vec_begin,
                                                uint32_t vec_end,
                                                uint32_t byte173_in,
                                                uint32_t extra_lives) {
  if (isaac_exit_958ed0_prefix_open(state8, count26630, vec_begin, vec_end) ==
      0) {
    return 0;
  }
  return isaac_exit_958ed0_challenge_ok(byte173_in, extra_lives);
}

extern "C" int32_t isaac_exit_958ed0_pgd_needed(uint32_t fa0_in) {
  /* PE 0x009590c5: cmp byte [esi+0xfa0], 0 ; je tail -- LOW-BYTE. */
  const uint8_t fa0 = static_cast<uint8_t>(fa0_in & 0xffu);
  return (fa0 != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_exit_958ed0_local_filename_present(
    uint32_t size_1fdbc) {
  /* ABI v46. PE 0x00958fab: cmp dword [edi+0x1fdbc], 0 ; jne 0x958fc8
     -- FULL-dword. edi = Manager+0xfa4 (GameState); +0x1fdbc is the
     MSVC basic_string SIZE of the local save filename. Nonzero -> the
     fopen/write arm (0xa25090 + virtuals); zero -> the no-filename
     logger (0xa112c0, "[warn] GameState::Save: no filename
     specified."). A byte-narrowed read would treat size 0x100 (valid
     dword, low byte 0) as EMPTY and flip the branch. */
  return (size_1fdbc != 0u) ? 1 : 0;
}

extern "C" int32_t isaac_exit_958ed0_io_dtor_needed(uint32_t io_ptr_1fe24) {
  /* ABI v46. PE 0x00958fd5: test ecx, ecx ; je 0x958fdf -- FULL-dword
     presence of the existing GameStateIO* at [edi+0x1fe24]; nonzero ->
     virtual dtor host call ([ecx]+0). 0x100 IS present (a byte-narrowed
     test would skip the dtor). */
  return (io_ptr_1fe24 != 0u) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_958ed0_va(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_958ED0_VA);
}

extern "C" uint32_t isaac_exit_958ed0_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_958ED0_BODY_BYTES);
}

extern "C" uint32_t isaac_exit_958ed0_flag_20dcc_off(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_958ED0_FLAG_20DCC_OFF);
}

extern "C" uint32_t isaac_exit_958ed0_steam_iat(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_958ED0_STEAM_IAT);
}

extern "C" uint32_t isaac_exit_958ed0_fileno_iat(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_958ED0_FILENO_IAT);
}

extern "C" uint32_t isaac_exit_958ed0_flag_20dcc_addr(uint32_t manager) {
  /* PE 0x00958f5a: esi+0x20dcc -- 32-bit wrap. */
  return (manager + static_cast<uint32_t>(ISAAC_EXIT_958ED0_FLAG_20DCC_OFF)) &
         0xffffffffu;
}

extern "C" uint32_t isaac_exit_958ed0_pgd_this_addr(uint32_t manager) {
  /* PE 0x009590ce: lea ecx,[esi+0x14] -- 32-bit wrap. */
  return (manager + static_cast<uint32_t>(ISAAC_EXIT_958ED0_CHANGES_OFF)) &
         0xffffffffu;
}

extern "C" uint32_t isaac_exit_958ed0_prefix_apply(uint32_t manager) {
  /* PE 0x00958f5a: mov byte [esi+0x20dcc], 1. */
  const uint32_t flag = isaac_exit_958ed0_flag_20dcc_addr(manager);
  tree_node_mut(flag)[0] =
      static_cast<uint8_t>(ISAAC_EXIT_958ED0_FLAG_20DCC_VALUE);
  return manager;
}

extern "C" uint32_t isaac_exit_958ed0_copy_1ad14_apply(uint32_t manager) {
  /* PE 0x00958f66/0x00958f72: recapture [esi+0x4b134] after SaveState
     and store at [esi+0x1ad14]. */
  const uint32_t src_addr =
      (manager + static_cast<uint32_t>(ISAAC_EXIT_958ED0_COPY_SRC_OFF)) &
      0xffffffffu;
  const uint32_t dst_addr =
      (manager + static_cast<uint32_t>(ISAAC_EXIT_958ED0_COPY_DST_OFF)) &
      0xffffffffu;
  tree_store_u32(dst_addr, tree_load_u32(src_addr));
  return dst_addr;
}

extern "C" uint32_t isaac_exit_958ed0_store_1ad18_apply(uint32_t manager,
                                                       uint32_t al_in) {
  /* PE 0x00958f82: mov byte [esi+0x1ad18], al -- LOW-BYTE of host return.
     0x100 stores 0. */
  const uint8_t al = static_cast<uint8_t>(al_in & 0xffu);
  const uint32_t addr =
      (manager + static_cast<uint32_t>(ISAAC_EXIT_958ED0_AL_OFF)) & 0xffffffffu;
  tree_node_mut(addr)[0] = al;
  return addr;
}

extern "C" uint32_t isaac_exit_958ed0_post_apply(uint32_t manager) {
  /* PE 0x009590bb / 0x009590c1: [esi+0xf98] <- [esi+0x20d48] then
     byte [esi+0x14] <- 1, in that order. */
  const uint32_t src_addr =
      (manager + static_cast<uint32_t>(ISAAC_EXIT_958ED0_POST_SRC_OFF)) &
      0xffffffffu;
  const uint32_t dst_addr =
      (manager + static_cast<uint32_t>(ISAAC_EXIT_958ED0_POST_DST_OFF)) &
      0xffffffffu;
  const uint32_t changes = isaac_exit_958ed0_pgd_this_addr(manager);
  tree_store_u32(dst_addr, tree_load_u32(src_addr));
  tree_node_mut(changes)[0] = 1u;
  return manager;
}

extern "C" uint32_t isaac_exit_958ed0_pgd_clear_apply(uint32_t manager) {
  /* PE 0x009590d1: mov byte [esi+0x14], 0 before host 0x9292c0. */
  const uint32_t changes = isaac_exit_958ed0_pgd_this_addr(manager);
  tree_node_mut(changes)[0] = 0u;
  return changes;
}

extern "C" uint32_t isaac_exit_958ed0_tail_apply(uint32_t manager) {
  /* PE 0x00959104 / 0x0095911a: mov byte [esi+0x20dcc], 0. */
  const uint32_t flag = isaac_exit_958ed0_flag_20dcc_addr(manager);
  tree_node_mut(flag)[0] = 0u;
  return manager;
}

extern "C" void isaac_exit_958ed0_plan(IsaacExit958ed0Plan* out, uint32_t state8,
                                       uint32_t count26630, uint32_t vec_begin,
                                       uint32_t vec_end, uint32_t byte173_in,
                                       uint32_t extra_lives,
                                       uint32_t steam_ctx_word,
                                       uint32_t cloud_2a3a4_in, uint32_t fa0_in,
                                       uint32_t manager) {
  if (out == nullptr) {
    return;
  }
  const int32_t entry = isaac_exit_958ed0_entry_open(state8);
  const int32_t prefix = isaac_exit_958ed0_prefix_open(
      state8, count26630, vec_begin, vec_end);
  const int32_t challenge =
      isaac_exit_958ed0_challenge_ok(byte173_in, extra_lives);
  const int32_t pack = (prefix != 0 && challenge != 0) ? 1 : 0;
  const int32_t cloud =
      isaac_exit_pgd_save_uses_cloud(steam_ctx_word, cloud_2a3a4_in);
  const int32_t pgd = isaac_exit_958ed0_pgd_needed(fa0_in);
  out->entry_open = entry;
  out->prefix_open = prefix;
  out->pack_needed = pack;
  out->host_cloud_needed = (pack != 0 && cloud != 0) ? 1 : 0;
  out->host_local_needed = (pack != 0 && cloud == 0) ? 1 : 0;
  out->host_pgd_needed = (pack != 0 && pgd != 0) ? 1 : 0;
  out->flag_20dcc_addr = isaac_exit_958ed0_flag_20dcc_addr(manager);
  out->this_addr = manager;
}

/* --- ABI v40: GameState delete 0x00959130 (75 B) ---
   PE transcription (terminal ret @ 0x0095917b; int3 pad 0x0095917c-7f).
   dump-pe-span --bytes 0x80: 30 insns, 0 resyncs, 1 E8, 0 indirect,
   3 mem stores. identify-zhl empty on the body; the only callee
   0x9c8350 = exact ZHL GameState::Delete(). Sibling of the v39 write;
   shares only the UNSIGNED 26630 + FULL-dword vec prefix — distinct CF
   and stores, no IAT — NOT folded. */

extern "C" int32_t isaac_exit_959130_entry_open(uint32_t count26630) {
  /* PE 0x00959140: cmp dword [game+0x26630], 0 ; ja skip -- UNSIGNED.
     0x80000000 is CLOSED (a signed jle would open it). */
  return (count26630 == 0u) ? 1 : 0;
}

extern "C" int32_t isaac_exit_959130_vec_empty(uint32_t vec_begin,
                                               uint32_t vec_end) {
  /* PE 0x0095914f: cmp eax, [esi+0x4b3dc] ; jne skip -- FULL-dword. */
  return (vec_begin == vec_end) ? 1 : 0;
}

extern "C" int32_t isaac_exit_959130_prefix_open(uint32_t count26630,
                                                 uint32_t vec_begin,
                                                 uint32_t vec_end) {
  if (isaac_exit_959130_entry_open(count26630) == 0) {
    return 0;
  }
  return isaac_exit_959130_vec_empty(vec_begin, vec_end);
}

extern "C" int32_t isaac_exit_959130_host_needed(uint32_t count26630,
                                                 uint32_t vec_begin,
                                                 uint32_t vec_end) {
  /* GameState::Delete @ 0x9c8350 sits on the prefix-open arm. */
  return isaac_exit_959130_prefix_open(count26630, vec_begin, vec_end);
}

extern "C" uint32_t isaac_exit_959130_va(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_959130_VA);
}

extern "C" uint32_t isaac_exit_959130_body_bytes(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_959130_BODY_BYTES);
}

extern "C" uint32_t isaac_exit_959130_delete_va(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_959130_DELETE_VA);
}

extern "C" uint32_t isaac_exit_959130_gamestate_addr(uint32_t manager) {
  /* PE 0x00959157: lea ecx,[esi+0xfa4] -- GameState* this, 32-bit wrap. */
  return (manager + static_cast<uint32_t>(ISAAC_EXIT_959130_GAMESTATE_OFF)) &
         0xffffffffu;
}

extern "C" uint32_t isaac_exit_959130_delete_apply(uint32_t manager) {
  /* PE order: 0x00959162 dword [esi+0xf98] <- 0, 0x0095916c byte
     [esi+0x14] <- 1, 0x00959170 byte [esi+0x4b284] <- 0. All immediates:
     no recapture, no host-return dependency. */
  const uint32_t f98 =
      (manager + static_cast<uint32_t>(ISAAC_EXIT_959130_F98_OFF)) &
      0xffffffffu;
  tree_store_u32(f98, 0u);
  tree_node_mut((manager + static_cast<uint32_t>(ISAAC_EXIT_959130_CHANGES_OFF)) &
                0xffffffffu)[0] = 1u;
  tree_node_mut(
      (manager + static_cast<uint32_t>(ISAAC_EXIT_959130_FLAG_4B284_OFF)) &
      0xffffffffu)[0] = 0u;
  return manager;
}

extern "C" void isaac_exit_959130_plan(IsaacExit959130Plan* out,
                                       uint32_t count26630,
                                       uint32_t vec_begin, uint32_t vec_end,
                                       uint32_t manager) {
  if (out == nullptr) {
    return;
  }
  const int32_t entry = isaac_exit_959130_entry_open(count26630);
  const int32_t vec_empty = isaac_exit_959130_vec_empty(vec_begin, vec_end);
  out->entry_open = entry;
  out->vec_empty = vec_empty;
  out->host_needed = (entry != 0 && vec_empty != 0) ? 1 : 0;
  out->gamestate_addr = isaac_exit_959130_gamestate_addr(manager);
  out->this_addr = manager;
}

/* --- ABI v41: per-slot decision laws inside residual host 0x009a27d0 ---
   this = Game+0x1da04. Slot i in [0, 11): base = 0x3cdc + i*0x1f4
   (0x00840f70 receiver), flag = base+8, 0x00709150 = base+0x18,
   ANM2::Reset = base+0x20. The push ecx before 0x00709150 holds the
   ANM2::Reset receiver of the same slot. Loop segmentation: slot 0 direct;
   slots 1..6 in the 6-loop (esi from this+0x3ee8); slots 7..10 in the
   4-loop (esi from this+0x4aa0). */

static uint32_t exit_9a27d0_slot_scaled_base(uint32_t index) {
  /* PE: slot base this+0x3cdc + i*0x1f4 (32-bit wrap arithmetic). */
  return (static_cast<uint32_t>(ISAAC_EXIT_9A27D0_SLOT_HOST_840F70_OFF) +
          index * static_cast<uint32_t>(ISAAC_EXIT_9A27D0_SLOT_TRIPLE_STRIDE)) &
         0xffffffffu;
}

extern "C" uint32_t isaac_exit_9a27d0_slot_triple_base_off(uint32_t index) {
  if (index >= static_cast<uint32_t>(ISAAC_EXIT_9A27D0_SLOT_FLAG_COUNT)) {
    return 0xffffffffu;
  }
  return exit_9a27d0_slot_scaled_base(index);
}

extern "C" uint32_t isaac_exit_9a27d0_slot_reset_off(uint32_t index) {
  if (index >= static_cast<uint32_t>(ISAAC_EXIT_9A27D0_SLOT_FLAG_COUNT)) {
    return 0xffffffffu;
  }
  /* base + 0x20: 0x3cfc + i*0x1f4. */
  return (exit_9a27d0_slot_scaled_base(index) +
          static_cast<uint32_t>(ISAAC_EXIT_9A27D0_SLOT_HOST_RESET_FROM_840F70)) &
         0xffffffffu;
}

extern "C" uint32_t isaac_exit_9a27d0_slot_709150_off(uint32_t index) {
  if (index >= static_cast<uint32_t>(ISAAC_EXIT_9A27D0_SLOT_FLAG_COUNT)) {
    return 0xffffffffu;
  }
  /* base + 0x18: 0x3cf4 + i*0x1f4. */
  return (exit_9a27d0_slot_scaled_base(index) +
          static_cast<uint32_t>(ISAAC_EXIT_9A27D0_SLOT_HOST_709150_FROM_840F70)) &
         0xffffffffu;
}

extern "C" uint32_t isaac_exit_9a27d0_slot_709150_arg(uint32_t index) {
  /* The push ecx before 0x00709150 carries the ANM2::Reset receiver of the
     same slot (lea ecx,[esi+8] survives into the push @ 0x009a28f0). */
  return isaac_exit_9a27d0_slot_reset_off(index);
}

extern "C" int32_t isaac_exit_9a27d0_slot_loop_segment(uint32_t index) {
  if (index >= static_cast<uint32_t>(ISAAC_EXIT_9A27D0_SLOT_FLAG_COUNT)) {
    return -1;
  }
  if (index == 0u) {
    return 0; /* direct block at 0x009a28a5 */
  }
  if (index < static_cast<uint32_t>(ISAAC_EXIT_9A27D0_SLOT_LOOP1_COUNT) + 1u) {
    return 1; /* slots 1..6 */
  }
  return 2; /* slots 7..10 */
}

extern "C" uint32_t isaac_exit_9a27d0_slot_loop1_count(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_9A27D0_SLOT_LOOP1_COUNT);
}

extern "C" uint32_t isaac_exit_9a27d0_slot_loop2_count(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_9A27D0_SLOT_LOOP2_COUNT);
}

extern "C" uint32_t isaac_exit_9a27d0_slot_loop1_start_off(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_9A27D0_SLOT_LOOP1_START_ESI);
}

extern "C" uint32_t isaac_exit_9a27d0_slot_loop2_start_off(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_9A27D0_SLOT_LOOP2_START_ESI);
}

extern "C" void isaac_exit_9a27d0_slot_plan(IsaacExit9a27d0SlotPlan* out,
                                            uint32_t index) {
  if (out == nullptr) {
    return;
  }
  if (index >= static_cast<uint32_t>(ISAAC_EXIT_9A27D0_SLOT_FLAG_COUNT)) {
    out->valid = 0;
    out->base_off = 0u;
    out->flag_off = 0u;
    out->reset_off = 0u;
    out->receiver_709150_off = 0u;
    out->arg_709150 = 0u;
    out->loop_segment = -1;
    return;
  }
  const uint32_t base = exit_9a27d0_slot_scaled_base(index);
  out->valid = 1;
  out->base_off = base;
  out->flag_off =
      (base + static_cast<uint32_t>(ISAAC_EXIT_9A27D0_SLOT_FLAG_FROM_840F70)) &
      0xffffffffu;
  out->reset_off =
      (base + static_cast<uint32_t>(ISAAC_EXIT_9A27D0_SLOT_HOST_RESET_FROM_840F70)) &
      0xffffffffu;
  out->receiver_709150_off =
      (base + static_cast<uint32_t>(ISAAC_EXIT_9A27D0_SLOT_HOST_709150_FROM_840F70)) &
      0xffffffffu;
  out->arg_709150 =
      (base + static_cast<uint32_t>(ISAAC_EXIT_9A27D0_SLOT_HOST_RESET_FROM_840F70)) &
      0xffffffffu;
  out->loop_segment = isaac_exit_9a27d0_slot_loop_segment(index);
}

/* --- ABI v48: frozen alloc string-tidy contract, Exit-root consumption ---
   Reconciliation unit: the 0x0040d040 template was already translated and
   frozen by the alloc family (v3 AL); the Exit side consumes those laws at
   its one reach site (root vector dtor loop call @ 0x006fa293). Census is
   pinned in the header enum: 1288 E8 + 33 jmp tails = 1321, register-held
   0. */

extern "C" int32_t isaac_exit_tidy_release_needed(uint32_t cap) {
  /* Frozen AL gate (PE cmp ecx,0x10 ; jb): UNSIGNED full-dword compare.
     Deliberately NOT re-narrowed: a uint8_t parameter would silently map
     0x10f -> 0x0f and drop a real release (documented trap). */
  return cap >= static_cast<uint32_t>(ISAAC_EXIT_TIDY_SSO_CAP) ? 1 : 0;
}

extern "C" uint32_t isaac_exit_tidy_size_arg(uint32_t cap) {
  /* inc ecx: cap + 1 with full u32 wrap (0xffffffff + 1 == 0). */
  return cap + 1u;
}

extern "C" uint32_t isaac_exit_tidy_va(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_TIDY_VA);
}

extern "C" uint32_t isaac_exit_tidy_root_site_va(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_TIDY_ROOT_SITE_VA);
}

extern "C" uint32_t isaac_exit_tidy_root_elem_cap_off(void) {
  return static_cast<uint32_t>(ISAAC_EXIT_TIDY_ROOT_ELEM_CAP_OFF);
}
