#pragma once

#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

/* Pure subsets recovered from HUD::PostUpdate (VA 0x009a2b30 / exact ZHL) and
   its always-called StatHUD tail FUN_0084c170 (VA 0x0084c170, no exact ZHL).
   Freestanding translations of pure-complete shells and pure islands only.

   Helpers ABI v39 (this unit): the span-B RECORDED-RESIDUAL laws —
   section-notes/hud-v39-frontier/. The v37/v38 handoffs recorded four
   span-B site classes as "not landed": two computed-arg far sites,
   one runtime-flag site, one widen outlier. This unit lands the pure
   decision cores of the computed-arg pair and the widen byte law:
     - ARG_D13 @0x00763c53..0x00763c6a (caller span-A/B dispatch):
       after sample s = LOW(HasCollectible(p,0)) the second push is
       `xor ecx,ecx ; setne cl ; add ecx,0xd` -> arg = 0xd + (s!=0)
       (first push constant 1; guard test al,al je -> closed arm);
     - ARG_2N5 @0x00763d3c..0x00763d5d: same shape with
       `lea ecx,[ecx*2+5]` -> arg = 5 + 2*(s!=0);
     - WIDEN @0x00765f96: `movzx esi,al` after HasCollectible(p,0x105)
       -> value = sample & 0xff (the widen outlier's widen step; the
       sum chain += LOW(0x9305f0(0x105)) + GetCollectibleNum(0x29d/0x14b)
       stays census-pinned host/value edges).
   Far-flag sites 0x763c7a / 0x763d64 and runtime-flag 0x769cac stay
   pinned census rows (their guards are the landed LOW-sample class;
   the merge-jmp topology is documented in the v37/v38 records).

   Helpers ABI v1: pure-complete idle shell, history/stat gates, StatHUD
   countdown pack, history one-shot flag store.

   Helpers ABI v2: residual pure islands inside nested hosts —
     (a) exact HistoryHUD::Recompute (0x0083b280) pure-complete shell when
         idx>1 / player==null / immediate==0 (dirty slot+4=1);
     (b) StatHUD FUN_0084c170 residual posts around host
         PlayerManager::FirstCollectibleOwner (exact 0x009be080) + player walk
         + exact StatHUD::RecomputeStats (0x0084ca00): call-site imms, owner
         flag store at StatHUD+0x2ac, player-vector count/select CF, host VAs.

   Helpers ABI v3: residual pure peels inside address-stable HistoryHUD
   RecomputeAll-shaped body (0x0083b850):
     pure-complete shell (both slots null + empty player list);
     reverse slot-walk CF (cursor 2→1, stride 0x14);
     invalid GetPlayerIdx (signed < 0) → pure player* clear;
     compact-needed (reverse cursor < 2);
     pure player+dirty slot shift island;
     twin dirty pure post after host GetPlayerIdx(twin);
     call-site offsets/imms + host VAs (GetPlayerIdx 0x0083bbc0, free
     0x00aef15c). Nested Recompute immediate path and list free/virtual
     remain host.

   Helpers ABI v4 (this unit): pure peels of address-stable GetPlayerIdx-
   shaped body (0x0083bbc0; ZHL HistoryHUD::GetPlayerIdx pattern misses —
   Manager netplay embed 0x4b3d8 vs catalog 0x4afb8):
     pure netplay range-empty gate (*Mgr+0x4b3d8 begin==end skips host);
     pure player eligibility (field+0x2c==0, +0x3bc==0, type!=0x28);
     pure 2-slot scan (exact match / first empty via cmovs);
     pure empty-slot player* assign side effect;
     try_pure when netplay empty or host IsIdxLocalPlayer sample known.
     Host residual: exact NetplayManager::IsIdxLocalPlayer (0x0090b100)
     when range non-empty (and virtual on membership hit). Nested PlayerHUD
     pure islands live in playerhud_post_update_pure_helpers (separate).
   Helpers ABI v5 (this unit): the StatHUD tail walk at 0x0084c170 is now
   disassembled end to end (0x0084c170..0x0084c2b9 ret). v2 already exported
   the call-site immediates, the owner-flag store and the count/select CF;
   v5 closes the remaining walk control flow and turns the whole tail into a
   single resolved plan:
     mid-loop empty-vector fatal gate (VA 0x0084c1cf test eax,eax; jne skip
       fatal — the count is recomputed at the top of every iteration, and a
       zero count there calls 0x00a112c0 — the outer count==0 case jumps
       straight to the countdown block with no fatal);
     unsigned loop-continue against the count reloaded after the body
       (VA 0x0084c220 cmp edi,eax; jb loop_top);
     the third argument of the GetPlayerId-shaped call is the LIVE count,
       not an immediate (VA 0x0084c1f5 pushes ecx from `sar ecx,2`);
     host-call accounting: 1 FirstCollectibleOwner + 2 per iteration;
     the pure countdown pack runs on both exits of the walk, so it is
       reached exactly when the Manager+0x2a37c gate is open.
   Still host: 0x009be080, 0x0084bf30, 0x0084ca00 bodies and the fatal log.

   v5 also PE-splits the head and tail of the gate-1ba78 host 0x0092f1c0
   (the body Game::Update runs before recapturing for try_pure). The body is
   ~3.6 KB with an SEH frame and stays host, but both ends are exact:
     head  0x0092f1f0: mode = *(u32*)this; if ((uint32)(mode - 1) > 3) skip
           the whole body, else jump through the table at 0x0092ffa4;
     tail  0x0092ff60: ++*(i32*)(this + 4), then RE-READ *(u32*)this and,
           when it is 2 or 3, store 2 into Game+0x22ed4 and Game+0x22edc.
   The tail re-read happens after the case body, so the tail decision must
   use a recaptured mode — never the pre-dispatch one.

   Helpers ABI v8 (this unit): class-wide byte-parameter sweep — every
   uint8_t SCALAR parameter (7: try_pure / post_update_needed /
   tail_pure_complete / tail_plan manager_stat_flag; recompute_all_needed
   history_flag_5c7c; slot_recompute_needed slot_flag; recompute_try_pure
   immediate) widened to uint32_t with an explicit low-byte mask in the
   body. All 7 probed DIVERGENT at 0x100 on the shipped module before the
   sweep. Struct fields stay uint8_t (layout; stores truncate).

   Helpers ABI v9 (this unit): the list teardown / sized-free residual
   inside the compact swap of 0x0083b850 — the node walk + free gates at
   both call sites (0x0083b947..0x0083b9de "site A", 0x0083b9fc..0x0083ba88
   "site B") become modelled control flow with host leaf edges:
     gate   begin == 0            → no teardown at all
     gate   begin == end          → skip node walk, still free the buffer
     walk   p = begin; p != end; p += 0x28:
              sub = *(p+8); if sub != 0: host virtual release (vtable[3],
              this = sub); if release()!=0 && *0xc7163c != 0: host
              callback(p+4)
     size   trunc_toward_zero((cap-begin)/0x28)*0x28 via the signed
              0x66666667 magic at 0x0083b9a3 (site A) / 0x0083ba4c (site B)
              (exact; negative spans stay negative)
     gate   (u32)size >= 0x1000   → CRT header path:
              header = *(begin-4); size_arg = size+0x23;
              (u32)(begin-header-4) > 0x1f → host _invalid_parameter_noinfo
              @ 0x0083bba5 (call [0xb18894]); else host sized free
              @ 0x00aef15c(header, size_arg)
     small  host sized free @ 0x00aef15c(begin, size)
   Ordering inside the swap (v7 three-move std::swap): the move-3 teardown
   (site A) tears down SRC's list BEFORE src adopts dst's old triple; the
   temp is zeroed at 0x0083ba90. In the REACHABLE compact of 0x0083b850 both
   teardown sites are structurally dead — site A's begin is always 0 (move 2
   zeroed src's triple), site B is gated on &src.begin == &temp (slot vs
   stack, never equal) — so the reachable compact emits NO free edge. The
   model is the general teardown of the slot-list type (reusable when
   HistoryHUD::Recompute's list rebuild is ported). 0x00aef15c is the
   sized-delete shim owned by the parallel alloc family (forwards block to
   0x00a0f500, size unused) — recorded as an address-stable host edge only.

   Helpers ABI v7 (this unit): correctness re-derivation of the v6 compact
   island (audit F3) plus the post-loop snapshot contract (audit F5).
     (a) The 0x0083b8bc island is a full three-move std::swap of the whole
         0x14-byte slot — v6 still zeroed src's list triple and reported dst's
         old triple as a host free; the PE adopts dst's old triple INTO src at
         0x0083b9ec..0x0083b9f4 and frees nothing (see the v7 block below).
     (b) The compact body is a loop (0x0083baa5..0x0083bab5), one slot pair
         per pass, continue while the incremented index is signed < 2.
     (c) HUD::PostUpdate reads Manager+0x2a384 at 0x009a2b5a and (via the
         0x009a2bb2 tail call) Manager+0x2a37c at 0x0084c178 — both AFTER the
         eight PlayerHUD call bodies. isaac_hud_post_update_snapshot_safe
         names when a pre-dispatch snapshot of the two fields is still valid.

   Helpers ABI v11 (this unit): the deepest leaves of the recompute chain —
     (a) exact NetplayManager::IsIdxLocalPlayer (0x0090b100) fully translated:
         the netplay vector count (sar), the zero-count pure-true path, the
         field_c==idx scan step (dword compare), the UNSIGNED loop-back, and a
         resolved plan with ONE typed host leaf — the virtual call
         (*(*(player+0x370)))[0x14](player+0x370) on a membership hit.
         Empty range and no-match paths are pure TRUE (al=1), so the v4
         GetPlayerIdx shell and the v10 walk node plans stay sound and the
         residual host only needs the virtual sample when the player IS in
         the netplay vector;
     (b) exact Entity_Player::IsHologram (0x007db700) fully translated — six
         pure gates, no host (byte flag +0x172, twin characters 0x1d/0x26,
         twin ptr +0x1e68, twin net idx +0x161c, SIGNED twin_idx >= own_idx
         reject, twin == self reject);
     (c) address-stable StatHUD GetPlayerId-shaped body (0x0084bf30) fully
         translated: netplay gate via (a), eligibility (2c/3bc/type), the
         IsHologram reject (b), and the 2-slot scan at StatHUD+0x114
         (stride 0xcc, UNSIGNED bound) with the first-empty player* assign.
         After v11 the StatHUD tail walk's per-iteration host surface is ONE
         body (exact StatHUD::RecomputeStats 0x0084ca00) plus the optional
         IsIdxLocal virtual edge — the GetPlayerId-shaped body needs no host
         call in the normal (netplay-empty) case. v5 note corrected: the
         0x84c1fe call passes ONLY the player (ret 4); the flags and count
         pushes at 0x84c1f5/0x84c1f6 are consumed by RecomputeStats (ret
         0xc), not by GetId.

   HistoryHUD::Recompute (0x0083b280) immediate!=0 body stays a typed host
   event (v2 shell): list rebuild with per-node sub-object release +
   DAT_00c7163c callbacks, list clear 0x00709300, the per-collectible loop
   with exact ItemConfig::GetCollectible (0x0072fd10), the 0x4b RNG branch,
   exact Manager::LoadImage (0x009588a0), builders/converters 0x0083aae0 /
   0x0083bf90 / 0x0083c320 / 0x004288a0, _Tree teardown (0x00415800 /
   0x0040c7f0) and the sized free 0x00aef15c(..., 0x1c). Only the pure
   immediate==0 collapse and the idx/player/immediate gates are v2-pure.

   ABI v36 wires isaac_hud_post_update_try_pure into safe Game::Update HUD
   emission sites (not gate 1ba78). Nested residual bodies stay host; v2–v7
   peels are freestanding only (not Update-wired).

   Helpers ABI v12 (this unit): RecomputeAll phase-1 elimination pass
   (0x0083b850, VA 0x83b878..0x83bad1) — reverse two-slot scan. Anchors:
     head 0x0083b890 (test eax,eax; je STEP), GetPlayerIdx call 0x0083b89d
     (body 0x0083bbc0), clear 0x0083b8aa (mov [esi],0), compact gate
     0x0083b8b3 (UNSIGNED cmp ebx,2; jae), step 0x0083bac4 (dec ebx;
     sub esi,0x14), loop back 0x0083bace (SIGNED (cursor-1) >= 1 / jge).
     Occupied gate then SIGNED jns on GetPlayerIdx (any negative idx
     clears). Compact body is the v7 three-move swap; teardown sites A/B are structurally dead (v9 pin) — nothing is freed. When a host
     GetPlayerIdx edge fires, later slot state is unknown (state_known 0);
     the caller recaptures and resumes. No ABI bump past 14.

   Helpers ABI v13: exact ItemConfig::GetCollectible (0x0072fd10) fully
   translated (25 ins, 0 calls, 0 stores) plus the FirstCollectibleOwner
   (0x009be080) prefix/walk CF around it. SIGNED id >= 0 (jns 0x72fd47)
   takes the table path; id < 0 (incl. 0x80000000) takes trinket/NULL.
   Remaining typed host leaf was address-stable HasCollectible-shaped
   0x007706e0 (narrowed != removed). Gate 0x0092f1c0 is already landed;
   not reopened.

   Helpers ABI v14: HasCollectible-shaped 0x007706e0 prefix
   (NULL config, field_2c==1 redirect, parent+0x28, GetPlayer(0), quest-hide,
   held-item true, signed-id trinket gate, ignoreModifiers dispatch) plus
   inventory setg tail and exact Game::GetPlayer 0x00417870 (SAR count,
   empty fatal 0x00a112c0 with no post-fatal fold, UNSIGNED jae clamp).
   Frozen bodies not reopened.

   Helpers ABI v15 (this unit): ignoreModifiers==0 modifier ladder
   0x007707de..0x00770c3e — pure ID-arm dispatch, 0x2028 bit TRUE exits
   (0x131/0x101/0xe7/0xb6), signed-mod-4 seed idiom, 0x147/0x148 post-host
   inner predicate, type==0xa / ==0x1f / (==3||==0xc) gates, and exact
   TemporaryEffects::HasNullEffect 0x00930680 (disabled byte+0x11, empty
   begin==end, type==0 && id match, stride 0x10). Nested 0x00771550,
   0x007cb6e0, recursive 0x007706e0 (from 0x007da770), and unconditional
   0x007db8d0 at 0x770a44 stay host. Trinket 0x009e04b0 and GetPlayer empty
   fatal 0x00a112c0 stay host. Not wired into Update/try_pure.

   Helpers ABI v16 (this unit): the 0x007db8d0 ladder blocker is narrowed.
   Full-chain disassembly (0x007db8d0..0x007dba0e, callee 0x007db860..0x7db8ca,
   walk 0x004288a0..0x4288e8) shows the whole resolve is READ-ONLY — the
   store census is zero observable stores (every store lands in a caller
   frame: the cookie, the 0x7db860 locals, and the walk's out struct at
   0x7db860-0x10). The only observable effect is the shared GetPlayer-style
   empty-count fatal 0x00a112c0 on the slow path when Game+0x1bb88 == 0
   (v14 precedent: fatal stays host). Pure gates landed:
     scan gate     mode byte at player+0x1fd4+0x8f is read iff the
                   Game+0x1bbd8 scan's last node is not disabled (+0xd==0),
                   has value <= 0x4f (+0x10), is not the head, and the
                   player buffer span (0x1fd8-0x1fd4) is signed > 0x8f;
     fast dispatch mode <= 7 (ja 0x7db987) -> jump table 0x7dba10
                   {-1,-1,0,1,2,3,4,5} (entries 0 and 1 both -> -1);
     slow hash     (xor-shift hash of max(1, [Game+0x1bb88]+mode) with
                   shift dwords 0xb1f57c/0xb1f580/0xb1f584) & 3 + 2;
     slow fatal    slow && [Game+0x1bb88]==0 -> host 0x00a112c0.
   Resolve result feeds the ladder's ebx==0x14a (eax==1 TRUE) and ebx==0x99
   (eax==2 TRUE) checks; all other IDs fall through to the RNG path at
   0x770a7e (0x436140 + RNG::RandomInt 0x7e9020 + table 0xb6bcd0) which
   stays host. 0x007db860 and 0x004288a0 keep address-stable names (no
   exact ZHL signature). The Game+0x1bbd8 scan walk itself stays host as
   the data source; its pure decision is modelled over sampled fields.
   Not wired into Update/try_pure. Next peel VA 0x00771550.

   Helpers ABI v17 (this unit): the 0x147/0x148 (and ID-9) arm's first
   nested host 0x00771550 is NARROWED (pure gates + resolved plan; host
   count + recursive HasCollectible samples remain).
   Body 0x00771550..0x00771612 (`ret 8`, this=player, id=[ebp+8],
   flag=[ebp+0xc]) — store census ZERO (mem-stores 0), no cookie frame:
     early TRUE   f=[player+0x2ef8]; f!=0 && f==id && byte[player+0x2ef0]
                  != 0 -> return TRUE, no host at all;
     flag==0      strict = (f!=0 && f==id && byte[player+0x2ef0]==0);
                  count = host 0x7cb6e0(player, id); return
                  count > (strict ? 1 : 0) — SIGNED setg both arms
                  (0x7715f3 cmp eax,1 ; setg / 0x771609 test eax,eax ;
                  setg);
     flag!=0      width = 1 + (HasCollectible(player,0x8b,0) [0x7706e0]
                  || HasCollectible(player,0x1ca,0)) — the 0x1ca call is
                  SHORT-CIRCUITED (0x77158f jne skips it when 0x8b true);
                  scan player+0x16c0 (stride 4) for `width` slots,
                  UNSIGNED loop (0x7715bf cmp ecx,ebx ; jb), TRUE iff any
                  (slot & 0x7fff) == id, else FALSE (0x7715c3).
   Ladder call sites: 0x7707f4 (arm 0x147/0x148, id 0x15, flag 0) and
   0x770920 (arm 9, id 0x5d, flag 0) — both use the flag==0 path. The
   early-TRUE gate is checked BEFORE the flag dispatch, so it applies to
   both flags and returns pure TRUE with no host call. Remaining host:
   0x7cb6e0 (count source, GetPlayer + RNG inside; stays host) and the
   two recursive 0x7706e0 HasCollectible samples on the flag!=0 path
   (v14 prefix narrows those; the samples themselves stay host).
   Next peel VA: 0x007cb6e0 (the count resolver itself).

   Helpers ABI v18 (this unit): the HUD::PostUpdate per-slot flag loop
   (0x009a2b83..0x009a2baa) — the loop gate over the two HistoryHUD slot
   flag bytes, read at 0x009a2b85 (+0x14 stride) and gated at 0x009a2b90
   `cmp byte [edi],0 / je 0x009a2ba3`. The loop decides, per slot, whether
   the host HistoryHUD::Recompute edge (0x0083b280, immediate=1) fires.
   Machine order:
     xor esi,esi / lea edi,[ebx+0x5c58]     ; i=0, flag_ptr = HUD+0x5c58
     0x009a2b90 cmp byte [edi],0 ; je skip  ; slot flag byte gate
     0x009a2b95 push 1                      ; immediate = 1
     0x009a2b97 push esi                    ; idx = i
     0x009a2b98 lea ecx,[ebx+0x5c54]        ; this = HistoryHUD
     0x009a2b9e call 0x83b280               ; host Recompute(i, 1)
     skip: inc esi / add edi,0x14           ; i++, flag_ptr += 0x14
     0x009a2ba7 cmp esi,2 ; jl 0x009a2b90   ; SIGNED loop-back i<2
   Pure law: per-slot flag byte != 0 -> exactly one host Recompute(i, 1)
   edge; both flags clear -> loop emits no host edge (pure no-op). The
   single-slot byte gate was already v1 (isaac_hud_history_slot_recompute_
   needed); v18 adds the loop-level plan (per-slot edges, host edge count,
   pure_complete), the flag address law (HUD+0x5c58 + i*0x14), and the
   SIGNED loop-back continuation (cmp esi,2 ; jl). All slot-flag
   parameters stay uint32_t with an explicit low-byte mask in the body
   (Wasm ABI does not narrow).

   Helpers ABI v19 (this unit): the count resolver 0x007cb6e0
   (v17 "Next peel VA"; census HudHasCollectible). Body
   0x007cb6e0..0x007cba1f (`ret 4`; this=player, arg1=id). Store
   census: 4 mem-stores, every one a caller-frame local (cookie
   [ebp-4], player save [ebp-0x1c] x2, [ebp-0x18] count40/4b slot) —
   zero observable stores. Host edges: GetPlayer 0x00417870 (walk
   0x7cb71f), 0x00740bc0 + RNG::RandomInt 0x007e9020 (0x4b branch,
   0x7cb86d/0x7cb899), 0x00930aa0 (id==0x17, 0x7cb8b2), recursive
   HasCollectible 0x007706e0 (0x8b, 0x1ca, 0x1b7), recursed self-calls
   0x7cb7b2 / 0x7cb801 / 0x7cb845 (ids 0x15/0x40/0x4b — the SAME pure
   accumulation over the same resolved player; pure in the model,
   host calls re-counted per invocation). Cookie 0x00aef12b.
     walk     0x7cb6fb..0x7cb730: while player->field_2c==1: parent
              0x3bc qualifies (+0x28==1) else GetPlayer(0) — HOST;
              loop while candidate field_2c==1. Modeled one step at a
              time (walk_step); the count plan runs on the RESOLVED
              player's fields.
     boost    0x7cb735 cmp ebx,0x56 ; cmp [p+0x13c0],4 ; cmove -> 1
              (UNMASKED id compare, before the mask).
     gate     0x7cb749/0x7cb756: byte[p+0x202c]!=0 || byte[p+0x20a9]!=
              0 -> return esi BEFORE the mask.
     mask     0x7cb768 and ebx,0x7fff.
     table    0x7cb76e: [Mgr+0x2663c]==0x1c -> UNSIGNED 10-entry scan
              of .rdata 0xb6bad0 {9,b,41,1b,a,c,1a,42,60,90}
              (eax=0; cmp eax,0x28; jb) -> esi++.
     special  0x7cb793..0x7cb7a8: idm in {0x15,0x40,0x4b} -> jump
              0x7cb8d8 (sampling region).
     count15  0x7cb7ae recursed count(id 0x15); only idm==0x30 uses
              it: 0x7cb7d9 mod4==2, or (0x7cb7de SIGNED count15>1 &&
              0x7cb7e3 mod4==3) -> RETURN count15+esi (no sampling).
              mod4 = signed % 4 of [Mgr+0x264f8] (0x80000003 idiom).
     count40  0x7cb7fd recursed count(id 0x40); if count40>0 &&
              table[seed_idx]==idm (0x7cb835) -> esi += count40.
              seed_idx = signed div-by-90 magic 0xb60b60b7 (imul +
              add edx,ecx + sar 6 + sign fix) mod 10 (UNSIGNED div).
     count4b  0x7cb841 recursed count(id 0x4b); if count4b>0:
              0x7cb857..0x7cb863 idm==0x7a && [Mgr+0x26584]==0x29 ->
              jump 0x7cb8d8 (skips the 0x4b add AND part F); else host
              0x740bc0 + 0x7e9020 (RNG) chain, 0x7cb89e inc eax;
              (rng+1)==idm -> esi += count4b.
     partF    0x7cb8a6..0x7cb8d7: idm==0x17 -> esi += host 0x930aa0
              (this=player+0x1508); idm==0x18 -> [p+0x18dc]>0 (jle)
              esi++; idm==0x13 -> [p+0x18e0]>0 esi++.
     sampling 0x7cb8d8..0x7cba0c:
       width = 1 + (has_8b || has_1ca); scan p+0x16c0 stride 4 (sub
              1 / jne countdown): (slot&0x7fff)==idm -> esi++ AND
              (slot&0x8000) -> esi++ (two INDEPENDENT increments);
       block p+0x17c4: non-null && [0]==2 && [4]==idm &&
              (f2ef8==0||f2ef8==idm) -> esi++; byte p+0x17cc & 2 ->
              esi++;
       items span=(p+0x174c - p+0x1748)>>2 (sar); UNSIGNED
              idm<span (jae) -> esi += movsx16[begin+idm*4] +
              2*movsx16[begin+idm*4+2];
       bytes span=p+0x1fe4 - p+0x1fe0; SIGNED idm<span (jge) ->
              b=byte[p+0x1fe0+idm] else 0; b!=0 -> esi++ (cmove);
       f2ef8 [p+0x2ef8]: f!=0 && (f&0x7fff)==idm -> byte[p+0x2ef0]!=
              0 ? esi += (f&0x8000)?2:1 (neg/sbb/neg) : esi =
              max(0,esi-1); (f&0x8000) -> esi = max(0,esi-1)
              (cmovg);
       gate SIGNED esi>0 (jle) && has_1b7 -> esi++.
   return esi (0x7cba0d..0x7cba1f, ret 4). Byte-gate params are
   uint32_t with explicit low-byte masks (v8 rule). Plan inputs are
   resolved-player + manager field samples; host samples has_8b /
   has_1ca (0x1ca short-circuited) / has_1b7 / host_17 (0x930aa0) /
   host_4b (rng+1) keep the v17 known/unknown convention.
   host_edge_count counts the 0x7706e0 / 0x930aa0 / 0x740bc0 /
   0x7e9020 calls across the outer call and the three recursed
   special-id invocations (each re-reads the same samples). GetPlayer
   walk edges are host (outside the count plan). Next frontier: the
   caller sites keep 0x7cb6e0 host until the count's sampled plan is
   wired (same style as v17 0x7db8d0).

   Evidence: PE tools/isaac-ng.unpacked.exe SHA-256
   5129df723e645daaea59514394195f3ea1dce1671bb0433d724648a845017200;
   output/decomp/5129df723e64/update-boundaries/decompiled/009a2b30_*.c,
   0084c170_*.c, 0083b280_*.c, 0083b850_*.c; section-notes/hud-post-update/,
   hud-v2/, hud-v3/, hud-v4/, pm-hud-v5/ (disasm-84c170-84c420.txt),
   pm-hud-v9/ (disasm-83b930-83bb00.txt). */

/* Helpers ABI v20 (this unit): the UPDATE-record-adjacent 0x008318a0 pure
   decision laws beyond the v87 mode gate (shared signed-advance island for
   modes 2/3, the Game+0x22ed0 rewrite gate, and the common float-ratio
   tail). Body FUN_008318a0 (VA 0x008318a0, this=receiver; SEH + GS frame).
   The mode gate (0x00831902 mov eax,[ebx]; dec; cmp 3; ja; jmp [eax*4+
   0x8327bc]) is SHARED with the v5 gate law (isaac_hud_gate_92f1c0_try_pure
   BY REFERENCE via the v87 update wire) — not re-landed. Table 0x8327bc:
   mode 1 -> 0x00831915 (always host 0x4186c0), mode 2 -> 0x00831fa1,
   mode 3 -> 0x008320c6, mode 4 -> 0x0083243b. New islands:
     head      0x008318d4..0x008318ff: iVar1 = Game+0x1bb74 (read); local =
               [this+0x234] iff non-null && type (+0x28)==0x3c5 && kind
               (+0x2c)==0xa (cmove); side-effect-free reads only.
     advance   0x00831fa1 mode 2: [this+0x238]==0 (je 0x83209c) -> fast
               path; 0x83209c cmp [ebx+4],[ebx+8]; jl 0x8320bd — SIGNED
               (int32)counter < (int32)limit. mode 3 0x8320c6: same SIGNED
               jl at 0x8320cc with NO +0x238 gate. Advance fires iff
               ((mode==2 && field_238==0) || mode==3) && signed counter <
               limit. LAB_008320bd: inc eax; [ebx+4]=eax (u32 wrap).
               When the advance does NOT fire: mode-2 fast path resets
               [ebx+4]=0, mode=3 and calls host 0x00830950; mode 3 runs
               its host body (0x421260 + 0x82eb90 + sparkle walk).
     rewrite   0x00832024 cmp dword [ebx+0x6c],0 / je 0x832034; 0x0083202a
               cmp byte [ebx+0x7c],0 / jne 0x832663 — rewrite_needed =
               [this+0x6c]==0 (FULL WORD) || byte[this+0x7c]==0 (LOW BYTE,
               uint32_t param + &0xff, v8 rule). When open: host leaf
               0x007eb1b0 + Game+0x22ed0 = 1 (byte) + [ebx+4] = [ebx+8] +
               mode = 3 + player walk Game+0x1baa8..0x1baac stride 4:
               p+0x418 = SIGNED max(10, p+0x418) (cmovg 0x832083). When
               closed: straight to the common tail, no host edge.
     tail      0x00832663..0x00832697: movd/cvtdq2ps (SIGNED int32->f32)
               [ebx+4] and [ebx+8]; divss; movss [ebx+0xc] — the ratio
               store is f32 (the C decompile's (int) cast is an artifact);
               mode RE-READ at 0x832670; when it is 2 or 3: Game+0x22ed4
               = 2 (dword) and Game+0x22edc = 2 (dword). 0x8326a1 SEH
               unwind + GS + ret 0x8326bc.
   Classification: the advance island + common tail is PURE-COMPLETE for
   modes 2/3 when the signed advance fires (no host edges); the rewrite
   decision is a NARROWED gate law (pure decision; host leaf 0x7eb1b0 +
   byte store + player walk stay host when the gate is open; pure no-op
   when closed).

   Helpers ABI v21 (this unit): the mode-2 SLOW path member scan
   (0x831fa1 [this+0x238]!=0 -> je 0x83209c is the v20 fast path). When
   field_0x238 != 0 the PE runs host 0x409100 prep (this+0x38, exact ZHL
   ANM2::Update) and then a std::_Tree-style successor walk over the
   container head stored at [this+0x224] (0x831fc2..0x832022), feeding the
   already-landed rewrite gate at 0x832024:
     entry   0x00831fb6 mov eax,[ebx+0x224]; 0x00831fbc mov esi,[eax];
             0x00831fbe cmp esi,eax; je 0x832024 — begin()==head is the
             EMPTY gate (scan emits no node, jumps to the rewrite gate).
     visit   0x00831fc2 cmp byte [esi+0x11d],0; je 0x831fdb — the byte
             +0x11d gate (LOW BYTE, uint32_t param + &0xff); when SET:
             0x00831fcb/0x00831fd3 lea ecx,[esi+0x44]/[esi+0x64];
             0x00831fce/0x00831fd6 call 0x409030 x2 — EXACTLY TWO host
             0x409030 edges per gated node (host stays host).
     succ    0x00831fdb..0x00832022 — MSVC-style in-order successor over
             node fields {left +0x0, parent +0x4, right +0x8, byte +0xd
             (isnil)}:
               right real (byte[+0xd]==0)     -> leftmost-of-right descend
                 0x832004..0x83201a (node=right; while left real: node=left)
               right nil                     -> parent climb
                 0x831fe4..0x832002 (while parent real && node==parent->
                 right: node=parent,parent=parent->parent; return parent;
                 parent nil at 0x831feb/0x831ffe -> return parent).
             The loop re-enters the visit body while successor != head
             (0x83201c cmp esi,[ebx+0x224]; 0x832022 jne 0x831fc2) and
             falls into 0x832024 when node==head (end()).
   Pure laws: member_scan_gated / member_scan_host_calls (per-node 0/2),
   member_scan_empty, member_scan_right_real, member_scan_descend_step,
   member_scan_climb_step, member_scan_walk_continue, and the counted
   member_scan_host_calls_total (1 prep edge when field_0x238!=0 + 2 per
   gated node). Nodes are std::_Tree-shaped (head+0 = begin, isnil byte
   at +0xd): classification NARROWED — the walk DECISION is pure over
   sampled fields (exact successor CF), the 0x409100/0x409030 edges stay
   host (v19 walkStep precedent). The empty scan is a pure no-op.
   Remaining host in 0x008318a0: mode 1 body, mode 2 slow host leaves
   (0x409100 + 0x409030), mode 3/4 bodies, SEH. */

enum { ISAAC_HUD_POST_UPDATE_PURE_HELPERS_ABI_VERSION = 39 };

/* Machine-backed layout constants (this binary; ZHL offsets may differ). */
enum {
  ISAAC_HUD_PLAYER_HUD_STRIDE = 0x6dc,
  ISAAC_HUD_PLAYER_HUD_COUNT = 8,
  ISAAC_HUD_STAT_HUD_OFFSET = 0x59a4,
  ISAAC_HUD_HISTORY_HUD_OFFSET = 0x5c54,
  ISAAC_HUD_HISTORY_FLAG_OFFSET = 0x5c7c,
  ISAAC_HUD_HISTORY_SLOT0_FLAG_OFFSET = 0x5c58,
  ISAAC_HUD_HISTORY_SLOT_STRIDE = 0x14,
  ISAAC_HUD_HISTORY_SLOT_COUNT = 2,
  /* Per-slot flag loop (helpers ABI v18, VA 0x009a2b30 middle block). */
  ISAAC_HUD_HISTORY_SLOT_LOOP_VA_HEAD = 0x009a2b83u,   /* xor esi,esi */
  ISAAC_HUD_HISTORY_SLOT_LOOP_VA_FLAG_GATE = 0x009a2b90u, /* cmp byte [edi],0 */
  ISAAC_HUD_HISTORY_SLOT_LOOP_VA_RECOMPUTE = 0x009a2b9eu, /* call 0x83b280 */
  ISAAC_HUD_HISTORY_SLOT_LOOP_VA_SKIP = 0x009a2ba3u,   /* inc esi */
  ISAAC_HUD_HISTORY_SLOT_LOOP_VA_LOOP_BACK = 0x009a2ba7u, /* cmp esi,2; jl */
  ISAAC_HUD_HISTORY_SLOT_LOOP_IMMEDIATE = 1,           /* push 1 */
  ISAAC_HUD_HISTORY_SLOT_LOOP_RECOMPUTE_HOST = 0x0083b280u,
  ISAAC_MANAGER_HISTORY_COUNT_OFFSET = 0x2a384,
  ISAAC_MANAGER_STAT_FLAG_OFFSET = 0x2a37c,
  ISAAC_STAT_HUD_COUNTDOWN_BASE = 0x13c,
  ISAAC_STAT_HUD_COUNTDOWN_FIRST = 0x128,
  ISAAC_STAT_HUD_COUNTDOWN_GROUP_STRIDE_DWORDS = 0x33,
  ISAAC_STAT_HUD_COUNTDOWN_INNER_STRIDE_DWORDS = 5,
  ISAAC_STAT_HUD_COUNTDOWN_PER_GROUP = 10,
  ISAAC_STAT_HUD_COUNTDOWN_GROUPS = 2,
  /* StatHUD residual FUN_0084c170 (helpers ABI v2). */
  ISAAC_STAT_HUD_OWNER_FLAG_OFFSET = 0x2ac,
  ISAAC_STAT_HUD_COLLECTIBLE_ID = 0x1f2, /* FirstCollectibleOwner imm */
  ISAAC_STAT_HUD_OWNER_LAZ_SHARED_TAG = 1,
  ISAAC_STAT_HUD_PLAYER_LIST_GAME_OFFSET = 0x1baa8u, /* Game+0x1baa8 vector */
  ISAAC_STAT_HUD_RECOMPUTE_FLAGS = 0xfffffeffu,
  /* HistoryHUD::Recompute pure shell (helpers ABI v2). */
  ISAAC_HISTORY_HUD_SLOT_PLAYER_OFFSET = 0x0,
  ISAAC_HISTORY_HUD_SLOT_DIRTY_OFFSET = 0x4,
  /* HistoryHUD RecomputeAll-shaped residual (helpers ABI v3, VA 0x0083b850). */
  ISAAC_HISTORY_HUD_SLOT_LIST_BEGIN_OFFSET = 0x8,
  ISAAC_HISTORY_HUD_SLOT_LIST_END_OFFSET = 0xc,
  ISAAC_HISTORY_HUD_SLOT_LIST_CAP_OFFSET = 0x10,
  ISAAC_HISTORY_HUD_LIST_ELEM_STRIDE = 0x28,
  ISAAC_HISTORY_HUD_REVERSE_WALK_START_CURSOR = 2,
  ISAAC_HISTORY_HUD_REVERSE_WALK_START_OFFSET = 0x14,
  ISAAC_HISTORY_HUD_TWIN_PTR_OFFSET = 0x1e6c,       /* Entity_Player twin* */
  ISAAC_HISTORY_HUD_CHARACTER_TYPE_OFFSET = 0x13c0, /* Entity_Player type */
  ISAAC_HISTORY_HUD_TWIN_CHAR_A = 0x1d,             /* Lazarus-shaped */
  ISAAC_HISTORY_HUD_TWIN_CHAR_B = 0x26,             /* Lazarus2-shaped */
  ISAAC_HISTORY_HUD_PLAYER_LIST_GAME_OFFSET = 0x1baa8u,
  /* GetPlayerIdx-shaped residual (helpers ABI v4, VA 0x0083bbc0). */
  ISAAC_HISTORY_GET_PLAYER_IDX_NETPLAY_EMBED_OFF = 0x4b3d8u, /* *Mgr+off vector */
  ISAAC_HISTORY_GET_PLAYER_IDX_PLAYER_NET_IDX_OFF = 0x1618u,
  ISAAC_HISTORY_GET_PLAYER_IDX_PLAYER_FIELD_2C_OFF = 0x2cu,
  ISAAC_HISTORY_GET_PLAYER_IDX_PLAYER_FIELD_3BC_OFF = 0x3bcu,
  ISAAC_HISTORY_GET_PLAYER_IDX_PLAYER_CHAR_TYPE_OFF = 0x13c0u,
  ISAAC_HISTORY_GET_PLAYER_IDX_REJECT_CHAR = 0x28,
  /* List teardown / sized free residual (helpers ABI v9, VA 0x0083b850). */
  ISAAC_HISTORY_HUD_LIST_NODE_SUB_OFF = 0x8,         /* node+8 sub-object */
  ISAAC_HISTORY_HUD_LIST_NODE_CALLBACK_ARG_OFF = 0x4, /* callback(node+4) */
  ISAAC_HISTORY_HUD_LIST_VTABLE_RELEASE_ENTRY = 0xc,  /* vtable[3] release */
  ISAAC_HISTORY_HUD_LIST_CALLBACK_GLOBAL = 0xc7163cu, /* DAT_00c7163c */
  ISAAC_HISTORY_HUD_FREE_LARGE_GATE = 0x1000u,        /* cmp size,0x1000; jb */
  ISAAC_HISTORY_HUD_FREE_HEADER_SIZE = 0x23u,         /* size += 0x23 */
  ISAAC_HISTORY_HUD_FREE_HEADER_OFFSET_BOUND = 0x1fu  /* cmp (begin-hdr-4),0x1f */
};

/* Address-stable / exact host VAs inside HUD::PostUpdate residual (v2–v4). */
enum {
  ISAAC_HUD_HOST_VA_POST_UPDATE = 0x009a2b30u,           /* exact HUD::PostUpdate */
  ISAAC_HUD_HOST_VA_PLAYER_HUD = 0x00842230u,            /* address-stable */
  ISAAC_HUD_HOST_VA_HISTORY_RECOMPUTE_ALL = 0x0083b850u, /* address-stable */
  ISAAC_HUD_HOST_VA_HISTORY_RECOMPUTE = 0x0083b280u,     /* exact HistoryHUD::Recompute */
  ISAAC_HUD_HOST_VA_HISTORY_GET_PLAYER_IDX = 0x0083bbc0u, /* address-stable GetPlayerIdx */
  ISAAC_HUD_HOST_VA_STAT_POST_UPDATE = 0x0084c170u,        /* address-stable StatHUD tail */
  ISAAC_HUD_HOST_VA_FIRST_COLLECTIBLE_OWNER = 0x009be080u, /* exact ZHL */
  ISAAC_HUD_HOST_VA_STAT_GET_PLAYER_ID = 0x0084bf30u,    /* address-stable */
  ISAAC_HUD_HOST_VA_STAT_RECOMPUTE_STATS = 0x0084ca00u,  /* exact StatHUD::RecomputeStats */
  ISAAC_HUD_HOST_VA_FATAL_LOG = 0x00a112c0u,            /* empty-player assert */
  ISAAC_HUD_HOST_VA_CRT_FREE = 0x00aef15cu,             /* list free residual */
  ISAAC_HUD_HOST_VA_NETPLAY_IS_IDX_LOCAL = 0x0090b100u,  /* exact IsIdxLocalPlayer */
  ISAAC_HUD_HOST_VA_INVALID_PARAMETER = 0x0083bba5u, /* _invalid_parameter_noinfo (call [0xb18894]) */
  ISAAC_HUD_HOST_VA_GET_COLLECTIBLE = 0x0072fd10u,   /* exact ItemConfig::GetCollectible */
  ISAAC_HUD_HOST_VA_HAS_COLLECTIBLE = 0x007706e0u,   /* address-stable HasCollectible-shaped */
  ISAAC_HUD_HOST_VA_GAME_GET_PLAYER = 0x00417870u,   /* exact Game::GetPlayer */
  ISAAC_HUD_HOST_VA_HAS_TRINKET = 0x009e04b0u,       /* address-stable trinket host */
  ISAAC_HUD_HOST_VA_HAS_COLLECTIBLE_771550 = 0x00771550u, /* address-stable */
  ISAAC_HUD_HOST_VA_HAS_COLLECTIBLE_7CB6E0 = 0x007cb6e0u, /* address-stable */
  ISAAC_HUD_HOST_VA_TEMPFX_HAS_NULL = 0x00930680u, /* exact TemporaryEffects::HasNullEffect */
  ISAAC_HUD_HOST_VA_HAS_COLLECTIBLE_7DA770 = 0x007da770u, /* address-stable type+rec */
  ISAAC_HUD_HOST_VA_HAS_COLLECTIBLE_7DB8D0 = 0x007db8d0u, /* resolver (narrowed v16) */
  ISAAC_HUD_HOST_VA_HAS_COLLECTIBLE_7DB860 = 0x007db860u, /* address-stable scan (mode source) */
  ISAAC_HUD_HOST_VA_HAS_COLLECTIBLE_SCAN_4288A0 = 0x004288a0u /* address-stable scan walk */
};

/* Sparse pure countdown pack recovered from FUN_0084c170 after the host
   player walk. group0[i] is the signed counter at
   StatHUD + 0x128 + i*0x14; group1[i] at StatHUD + 0x1f4 + i*0x14. */
typedef struct IsaacStatHudCountdownState {
  int32_t group0[ISAAC_STAT_HUD_COUNTDOWN_PER_GROUP];
  int32_t group1[ISAAC_STAT_HUD_COUNTDOWN_PER_GROUP];
} IsaacStatHudCountdownState;

/* Sparse HistoryHUD slot (stride 0x14) for RecomputeAll pure islands. */
typedef struct IsaacHistoryHudSlotSparse {
  uint32_t player;     /* +0x0 */
  uint8_t dirty;       /* +0x4 */
  uint8_t _pad[3];
  uint32_t list_begin; /* +0x8 */
  uint32_t list_end;   /* +0xc */
  uint32_t list_cap;   /* +0x10 */
} IsaacHistoryHudSlotSparse;

/* Pure-complete shell for HUD::PostUpdate.
   Inputs (resolved by the caller from live objects):
     player_hud_occupied_mask — bit i set when *(HUD + i*0x6dc) != 0
     manager_history_count    — signed int at Manager+0x2a384
     manager_stat_flag        — byte at Manager+0x2a37c
   Returns 1 if any host residual is reachable (caller must run full host
   body; no pure mutations). Returns 0 if the entire function is a pure
   no-op (all eight PlayerHUD slots empty, history block skipped, StatHUD
   tail pure no-op). Safe as a skip-host predicate without residual events.

   Snapshot contract (audit F5): the PE reads Manager+0x2a384 at VA
   0x009a2b5a and Manager+0x2a37c at VA 0x0084c178 (via `call 0x84c170` at
   0x009a2bb2) — both AFTER the eight `call 0x842230` PlayerHUD bodies, the
   stat flag also after the whole history block. try_pure itself stays sound
   on pre-dispatch snapshots: when the mask is 0 no host body precedes the
   PE reads, and when the mask is non-zero the result is 1 regardless of the
   two fields. But a caller that decides the history/stat residuals
   SEPARATELY after emitting PlayerHUD host bodies must recapture both
   fields after those bodies — never reuse the pre-loop snapshot (see
   isaac_hud_post_update_snapshot_safe).
*/

/* Remaining machine-backed constants recovered from the intact cpp + JS oracle.
   ABI 15 lockstep. Do not bump. */
enum {
  ISAAC_HISTORY_HUD_ELIMINATION_SLOT_STRIDE = 0x14,
  ISAAC_HISTORY_HUD_WALK_FATAL_ARG = 0x10,
  ISAAC_HISTORY_HUD_WALK_FATAL_STRING_VA = 0x00b7e6bc,
  ISAAC_HISTORY_HUD_WALK_VA_FATAL = 0x0083bb0d,
  ISAAC_HISTORY_HUD_WALK_VA_GET_PLAYER_IDX = 0x0083bb2d,
  ISAAC_HISTORY_HUD_WALK_VA_RECOMPUTE = 0x0083bb36,
  ISAAC_HISTORY_HUD_WALK_VA_TWIN_GET_PLAYER_IDX = 0x0083bb59,
  ISAAC_HISTORY_HUD_WALK_VA_TWIN_MARK = 0x0083bb6f,
  ISAAC_HUD_GATE_92F1C0_CASE1_VA = 0x0092f203u,
  ISAAC_HUD_GATE_92F1C0_CASE2_VA = 0x0092fa09u,
  ISAAC_HUD_GATE_92F1C0_CASE3_VA = 0x0092fe88u,
  ISAAC_HUD_GATE_92F1C0_CASE4_VA = 0x0092fed2u,
  ISAAC_NETPLAY_IS_IDX_LOCAL_PLAYER_FIELD_C_OFF = 0xc,
  ISAAC_NETPLAY_IS_IDX_LOCAL_PLAYER_VTABLE_OFF = 0x370,
  ISAAC_NETPLAY_IS_IDX_LOCAL_VTABLE_ENTRY_OFF = 0x14,
  ISAAC_ENTITY_PLAYER_IS_HOLOGRAM_FLAG_OFF = 0x172,
  ISAAC_ENTITY_PLAYER_TWIN_PTR_OFF = 0x1e68,
  ISAAC_ENTITY_PLAYER_NET_IDX_OFF = 0x161c,
  ISAAC_STAT_HUD_GET_PLAYER_ID_SLOT_BASE_OFF = 0x114,
  ISAAC_STAT_HUD_GET_PLAYER_ID_SLOT_STRIDE = 0xcc,
  ISAAC_STAT_HUD_GET_PLAYER_ID_SLOT_COUNT = 2,
  ISAAC_ITEM_CONFIG_GET_COLLECTIBLE_KIND_NULL = 0,
  ISAAC_ITEM_CONFIG_GET_COLLECTIBLE_KIND_TABLE = 1,
  ISAAC_ITEM_CONFIG_GET_COLLECTIBLE_KIND_TRINKET = 2,
  ISAAC_ITEM_CONFIG_TRINKET_BEGIN_OFF = 0x67758,
  ISAAC_ITEM_CONFIG_TRINKET_END_OFF = 0x6775c,
  ISAAC_ITEM_CONFIG_GAME_GLOBAL = 0xc71678,
  ISAAC_FCO_ITEM_FLAGS_OFF = 0xb8,
  ISAAC_FCO_TWIN_BIT = 0x80000000u,
  ISAAC_FCO_ITEM_CONFIG_OFF = 0x2a404,
  ISAAC_FCO_PLAYER_FIELD_2C_OFF = 0x2c,
  ISAAC_FCO_TWIN_PTR_OFF = 0x1e6c,
  ISAAC_FCO_LIST_STRIDE = 4,
  ISAAC_HAS_COLLECTIBLE_PLAYER_FIELD_2C_OFF = 0x2c,
  ISAAC_HAS_COLLECTIBLE_PARENT_PTR_OFF = 0x3bc,
  ISAAC_HAS_COLLECTIBLE_PARENT_FLAG_OFF = 0x28,
  ISAAC_HAS_COLLECTIBLE_QUEST_HIDE_OFF = 0x20a9,
  ISAAC_HAS_COLLECTIBLE_HELD_ID_OFF = 0x2ef4,
  ISAAC_HAS_COLLECTIBLE_HELD_FLAG_OFF = 0x2ef0,
  ISAAC_HAS_COLLECTIBLE_COUNT_TABLE_OFF = 0x16c8,
  ISAAC_HAS_COLLECTIBLE_QUEST_BIT = 0x8000,
  ISAAC_HAS_COLLECTIBLE_CHALLENGE_OFF = 0x26614,
  ISAAC_HAS_COLLECTIBLE_CHALLENGE_GATE = 2,
  ISAAC_HAS_COLLECTIBLE_FLAGS_2028_OFF = 0x2028,
  ISAAC_HAS_COLLECTIBLE_CHAR_TYPE_OFF = 0x13c0,
  ISAAC_HAS_COLLECTIBLE_TEMPFX_OFF = 0x1508,
  ISAAC_HAS_COLLECTIBLE_SEED_OFF = 0x264f8,
  ISAAC_HAS_COLLECTIBLE_MOD_ID_147 = 0x147,
  ISAAC_HAS_COLLECTIBLE_MOD_ID_148 = 0x148,
  ISAAC_HAS_COLLECTIBLE_MOD_ID_139 = 0x139,
  ISAAC_HAS_COLLECTIBLE_MOD_ID_9 = 9,
  ISAAC_HAS_COLLECTIBLE_MOD_ID_3B = 0x3b,
  ISAAC_HAS_COLLECTIBLE_MOD_ID_131 = 0x131,
  ISAAC_HAS_COLLECTIBLE_MOD_ID_101 = 0x101,
  ISAAC_HAS_COLLECTIBLE_MOD_ID_E7 = 0xe7,
  ISAAC_HAS_COLLECTIBLE_MOD_ID_B6 = 0xb6,
  ISAAC_HAS_COLLECTIBLE_MOD_BIT_131 = 0x10,
  ISAAC_HAS_COLLECTIBLE_MOD_BIT_101 = 0x08,
  ISAAC_HAS_COLLECTIBLE_MOD_BIT_E7 = 0x20,
  ISAAC_HAS_COLLECTIBLE_MOD_BIT_B6 = 0x40,
  ISAAC_HAS_COLLECTIBLE_MOD_TYPE_10 = 0xa,
  ISAAC_HAS_COLLECTIBLE_MOD_TYPE_31 = 0x1f,
  ISAAC_HAS_COLLECTIBLE_MOD_TYPE_3 = 3,
  ISAAC_HAS_COLLECTIBLE_MOD_TYPE_C = 0xc,
  ISAAC_HAS_COLLECTIBLE_MOD_EFFECT_15 = 0x15,
  ISAAC_HAS_COLLECTIBLE_MOD_EFFECT_5D = 0x5d,
  ISAAC_HAS_COLLECTIBLE_MOD_NULL_70 = 0x70,
  ISAAC_HAS_COLLECTIBLE_MOD_REC_26B = 0x26b,
  ISAAC_HAS_COLLECTIBLE_MOD_ARM_OTHER = 0,
  ISAAC_HAS_COLLECTIBLE_MOD_ARM_147_148 = 1,
  ISAAC_HAS_COLLECTIBLE_MOD_ARM_139 = 2,
  ISAAC_HAS_COLLECTIBLE_MOD_ARM_9 = 3,
  ISAAC_HAS_COLLECTIBLE_MOD_ARM_3B = 4,
  ISAAC_HAS_COLLECTIBLE_MOD_ARM_131 = 5,
  ISAAC_HAS_COLLECTIBLE_MOD_ARM_101 = 6,
  ISAAC_HAS_COLLECTIBLE_MOD_ARM_E7 = 7,
  ISAAC_HAS_COLLECTIBLE_MOD_ARM_B6 = 8,
  ISAAC_TEMPFX_DISABLED_OFF = 0x11,
  ISAAC_TEMPFX_BEGIN_OFF = 0x4,
  ISAAC_TEMPFX_END_OFF = 0x8,
  ISAAC_TEMPFX_ELEM_STRIDE = 0x10,
  ISAAC_TEMPFX_ITEM_TYPE_NULL = 0,
  /* Mod-resolve scan / dispatch / slow hash (helpers ABI v16, VA 0x007db8d0). */
  ISAAC_HAS_COLLECTIBLE_MOD_SCAN_LIST_OFF = 0x1bbd8u,  /* Game+0x1bbd8 list container */
  ISAAC_HAS_COLLECTIBLE_MOD_SCAN_HEAD_FIRST_OFF = 0x4, /* head->f4 walk start */
  ISAAC_HAS_COLLECTIBLE_MOD_SCAN_NODE_HIT_OFF = 0x0,   /* node->f0 follow on match */
  ISAAC_HAS_COLLECTIBLE_MOD_SCAN_NODE_NEXT_OFF = 0x8,  /* node->f8 follow on miss */
  ISAAC_HAS_COLLECTIBLE_MOD_SCAN_NODE_DISABLED_OFF = 0xd, /* node byte +0xd */
  ISAAC_HAS_COLLECTIBLE_MOD_SCAN_NODE_VALUE_OFF = 0x10,   /* node dword +0x10 */
  ISAAC_HAS_COLLECTIBLE_MOD_SCAN_WANTED = 0x4f,           /* scan wanted value */
  ISAAC_HAS_COLLECTIBLE_MOD_SCAN_PLAYER_BUF_OFF = 0x1fd4u, /* player mode buffer begin */
  ISAAC_HAS_COLLECTIBLE_MOD_SCAN_PLAYER_BUF_END_OFF = 0x1fd8u, /* player mode buffer end */
  ISAAC_HAS_COLLECTIBLE_MOD_SCAN_BUF_GATE_LEN = 0x8f,     /* signed (end-begin) > 0x8f */
  ISAAC_HAS_COLLECTIBLE_MOD_GAME_COUNT_OFF = 0x1bb88u,    /* Game+0x1bb88 slow-path count */
  ISAAC_HAS_COLLECTIBLE_MOD_FAST_MAX = 7,                 /* mode <= 7 -> fast table */
  ISAAC_HAS_COLLECTIBLE_MOD_HASH_C1 = 0x3e2d6048u,        /* [0xb1f57c] */
  ISAAC_HAS_COLLECTIBLE_MOD_HASH_C2 = 0x652f233eu,        /* [0xb1f580] */
  ISAAC_HAS_COLLECTIBLE_MOD_HASH_C3 = 0x4e31313eu,        /* [0xb1f584] */
  ISAAC_HAS_COLLECTIBLE_MOD_SLOW_RESULT_MASK = 3,
  ISAAC_HAS_COLLECTIBLE_MOD_SLOW_RESULT_ADD = 2,
  /* 0x00771550 narrowed gates (helpers ABI v17). */
  ISAAC_HAS_COLLECTIBLE_771550_FIELD_OFF = 0x2ef8,   /* player id dword */
  ISAAC_HAS_COLLECTIBLE_771550_BYTE_OFF = 0x2ef0,    /* player byte gate */
  ISAAC_HAS_COLLECTIBLE_771550_SLOT_BASE_OFF = 0x16c0, /* flag!=0 slot scan */
  ISAAC_HAS_COLLECTIBLE_771550_SLOT_STRIDE = 4,
  ISAAC_HAS_COLLECTIBLE_771550_SLOT_MASK = 0x7fff,   /* and eax,0x7fff */
  ISAAC_HAS_COLLECTIBLE_771550_WHICH_8B = 0x8b,      /* HasCollectible(id 0x8b) */
  ISAAC_HAS_COLLECTIBLE_771550_WHICH_1CA = 0x1ca,    /* HasCollectible(id 0x1ca) */
  ISAAC_HAS_COLLECTIBLE_771550_STRICT_CMP = 1        /* strict: count > 1 */
};

/* Count resolver 0x007cb6e0 (helpers ABI v19). Body 0x007cb6e0..0x7cba1f,
   ret 4; this=player, arg1=id (uint32). Offsets/layout from PE section
   notes output/decomp/5129df723e64/section-notes/cpu-dump/007cb6e0.txt
   / 007cb7fd.txt / 007cb940.txt. */
enum {
  ISAAC_HUD_COUNT_7CB6E0_VA_HEAD = 0x007cb6e0u,
  ISAAC_HUD_COUNT_7CB6E0_VA_RET = 0x007cba1fu,
  ISAAC_HUD_COUNT_7CB6E0_VA_SAMPLING = 0x007cb8d8u, /* 0x15/0x40/0x4b + 0x7a/0x29 target */
  ISAAC_HUD_COUNT_7CB6E0_VA_RECURSE_15 = 0x007cb7b2u, /* call 0x7cb6e0(p,0x15) */
  ISAAC_HUD_COUNT_7CB6E0_VA_RECURSE_40 = 0x007cb801u, /* call 0x7cb6e0(p,0x40) */
  ISAAC_HUD_COUNT_7CB6E0_VA_RECURSE_4B = 0x007cb845u, /* call 0x7cb6e0(p,0x4b) */
  ISAAC_HUD_COUNT_7CB6E0_HOST_VA_740BC0 = 0x00740bc0u, /* 0x4b branch gate 1 */
  ISAAC_HUD_COUNT_7CB6E0_HOST_VA_7E9020 = 0x007e9020u, /* RNG::RandomInt (0x4b) */
  ISAAC_HUD_COUNT_7CB6E0_HOST_VA_930AA0 = 0x00930aa0u, /* id==0x17 adder */
  ISAAC_HUD_COUNT_7CB6E0_TABLE_VA = 0x00b6bad0u,    /* .rdata, 10 dwords */
  ISAAC_HUD_COUNT_7CB6E0_TABLE_SIZE = 10,
  ISAAC_HUD_COUNT_7CB6E0_MASK = 0x7fff,             /* and ebx,0x7fff */
  ISAAC_HUD_COUNT_7CB6E0_MODE_GATE = 0x1c,          /* [Mgr+0x2663c] */
  ISAAC_HUD_COUNT_7CB6E0_MODE_7A_GATE = 0x29,       /* [Mgr+0x26584] */
  ISAAC_HUD_COUNT_7CB6E0_ID_15 = 0x15,
  ISAAC_HUD_COUNT_7CB6E0_ID_30 = 0x30,
  ISAAC_HUD_COUNT_7CB6E0_ID_40 = 0x40,
  ISAAC_HUD_COUNT_7CB6E0_ID_4B = 0x4b,
  ISAAC_HUD_COUNT_7CB6E0_ID_56 = 0x56,
  ISAAC_HUD_COUNT_7CB6E0_ID_7A = 0x7a,
  ISAAC_HUD_COUNT_7CB6E0_ID_17 = 0x17,
  ISAAC_HUD_COUNT_7CB6E0_ID_18 = 0x18,
  ISAAC_HUD_COUNT_7CB6E0_ID_13 = 0x13,
  ISAAC_HUD_COUNT_7CB6E0_HC_8B = 0x8b,              /* HasCollectible sample */
  ISAAC_HUD_COUNT_7CB6E0_HC_1CA = 0x1ca,            /* HasCollectible sample (SC) */
  ISAAC_HUD_COUNT_7CB6E0_HC_1B7 = 0x1b7,            /* final HasCollectible */
  ISAAC_HUD_COUNT_7CB6E0_FIELD_13C0_OFF = 0x13c0,   /* Entity_Player type */
  ISAAC_HUD_COUNT_7CB6E0_GATE_202C_OFF = 0x202c,    /* byte gate 1 */
  ISAAC_HUD_COUNT_7CB6E0_GATE_20A9_OFF = 0x20a9,    /* byte gate 2 */
  ISAAC_HUD_COUNT_7CB6E0_SLOT_BASE_OFF = 0x16c0,    /* sampling slot array */
  ISAAC_HUD_COUNT_7CB6E0_SLOT_STRIDE = 4,
  ISAAC_HUD_COUNT_7CB6E0_ITEM_BEGIN_OFF = 0x1748,   /* (i16 id, i16 count) items */
  ISAAC_HUD_COUNT_7CB6E0_ITEM_END_OFF = 0x174c,
  ISAAC_HUD_COUNT_7CB6E0_BYTE_BEGIN_OFF = 0x1fe0,   /* byte array [id] */
  ISAAC_HUD_COUNT_7CB6E0_BYTE_END_OFF = 0x1fe4,
  ISAAC_HUD_COUNT_7CB6E0_BLOCK_17C4_OFF = 0x17c4,   /* {2, id} block ptr */
  ISAAC_HUD_COUNT_7CB6E0_FLAG_17CC_OFF = 0x17cc,    /* byte bit-1 flag */
  ISAAC_HUD_COUNT_7CB6E0_FIELD_18DC_OFF = 0x18dc,   /* id==0x18 counter */
  ISAAC_HUD_COUNT_7CB6E0_FIELD_18E0_OFF = 0x18e0,   /* id==0x13 counter */
  ISAAC_HUD_COUNT_7CB6E0_FIELD_2EF8_OFF = 0x2ef8,   /* owned id dword */
  ISAAC_HUD_COUNT_7CB6E0_BYTE_2EF0_OFF = 0x2ef0,    /* owned byte gate */
  ISAAC_HUD_COUNT_7CB6E0_MGR_SEED_OFF = 0x264f8,    /* seed (mod4 + div90) */
  ISAAC_HUD_COUNT_7CB6E0_MGR_MODE_OFF = 0x2663c,    /* table-scan mode */
  ISAAC_HUD_COUNT_7CB6E0_MGR_MODE2_OFF = 0x26584,   /* 0x7a combo mode */
  ISAAC_HUD_COUNT_7CB6E0_SEED_DIV_MAGIC = 0xb60b60b7u, /* signed div-by-90 */
  ISAAC_HUD_COUNT_7CB6E0_SEED_DIV_SHIFT = 6,
  ISAAC_HUD_COUNT_7CB6E0_SEED_IDX_MOD = 10,         /* unsigned div rem */
  ISAAC_HUD_COUNT_7CB6E0_MOD4_MASK = 0x80000003u
};

/* ABI v23: 0x007cb6e0 preamble walk / count4b RNG-draw / twin +
   recursion PREP laws. Evidence: section-notes/hud-v23-7cb6e0/NOTES.md
   and cpu-dump/007cb6e0.txt + 007cb7fd.txt. The host leaves themselves
   stay host (GetPlayer 0x417870, GetRoomByIdx 0x740bc0, RNG::RandomInt
   0x7e9020, GetTrinketEffectNum 0x930aa0); these are the pure decisions
   and receiver/arg preps around them. */
enum {
  ISAAC_HUD_COUNT_7CB6E0_VA_WALK_GATE = 0x007cb6fbu,   /* cmp [edi+0x2c],1 */
  ISAAC_HUD_COUNT_7CB6E0_VA_M3BC_PROBE = 0x007cb701u,  /* mov eax,[edi+0x3bc] */
  ISAAC_HUD_COUNT_7CB6E0_VA_GETPLAYER_CALL = 0x007cb71fu, /* call 0x417870 */
  ISAAC_HUD_COUNT_7CB6E0_VA_WALK_ADOPT = 0x007cb728u,  /* cmp [eax+0x2c],1 */
  ISAAC_HUD_COUNT_7CB6E0_VA_WALK_STORE = 0x007cb730u,  /* resolved = edi */
  ISAAC_HUD_COUNT_7CB6E0_VA_ROOM_CALL = 0x007cb86du,  /* call 0x740bc0 */
  ISAAC_HUD_COUNT_7CB6E0_VA_RNG_GATE = 0x007cb875u,   /* test eax,eax */
  ISAAC_HUD_COUNT_7CB6E0_VA_RNG_CALL = 0x007cb899u,   /* call 0x7e9020 */
  ISAAC_HUD_COUNT_7CB6E0_VA_TWIN17_CALL = 0x007cb8b2u, /* call 0x930aa0 */
  ISAAC_HUD_COUNT_7CB6E0_RNG_MAX = 0xbdu,             /* push 0xbd */
  ISAAC_HUD_COUNT_7CB6E0_RNG_CONST_VA = 0x00b1f564u,  /* .rdata, 16 bytes */
  ISAAC_HUD_COUNT_7CB6E0_RNG_CONST_A_LO = 0x2u,       /* qword[0xb1f564] lo */
  ISAAC_HUD_COUNT_7CB6E0_RNG_CONST_A_HI = 0x7u,       /* qword[0xb1f564] hi */
  ISAAC_HUD_COUNT_7CB6E0_RNG_CONST_B = 0x19u,         /* dword[0xb1f56c] */
  ISAAC_HUD_COUNT_7CB6E0_FIELD_2C_OFF = 0x2cu,        /* player walk gate */
  ISAAC_HUD_COUNT_7CB6E0_FIELD_3BC_OFF = 0x3bcu,      /* m3bc chain ptr */
  ISAAC_HUD_COUNT_7CB6E0_FIELD_28_OFF = 0x28u,        /* m3bc qualify */
  ISAAC_HUD_COUNT_7CB6E0_GAME_ROOM_IDX_OFF = 0x18304u, /* [Game+0x18304] */
  ISAAC_HUD_COUNT_7CB6E0_ROOM_FIELD_5C_OFF = 0x5cu,   /* [room+0x5c] */
  ISAAC_HUD_COUNT_7CB6E0_TWIN_RECV_OFF = 0x1508u,     /* lea ecx,[p+0x1508] */
  ISAAC_HUD_COUNT_7CB6E0_WALK_ITER_CAP = 16           /* plan iteration bound */
};

/* Compact swap teardown sites are structurally dead (v9 pin): NOT a free residual.
   Reachable compact emits no host free; sized-delete shim 0x00aef15c and
   _invalid_parameter_noinfo stay residual on the list-teardown path only.
   List byte size uses imul 0x66666667 magic, equivalent to trunc toward zero
   of (end-begin) down to a multiple of 0x28. */

typedef struct IsaacHistoryHudSlotListTriple {
  uint32_t list_begin;
  uint32_t list_end;
  uint32_t list_cap;
} IsaacHistoryHudSlotListTriple;

typedef struct IsaacStatHudTailPlan {
  int32_t tail_needed;
  int32_t pure_complete;
  int32_t fco_host_needed;
  int32_t owner_flag;
  int32_t owner_flag_known;
  int32_t player_count;
  int32_t walk_iterations;
  int32_t host_call_count;
  int32_t empty_fatal_needed;
  int32_t countdown_applied;
} IsaacStatHudTailPlan;

typedef struct IsaacHudGate92f1c0Plan {
  int32_t dispatch_case;
  int32_t body_host_needed;
  int32_t pure_complete;
  int32_t counter_out;
  int32_t tail_stores_needed;
  uint32_t case_va;
} IsaacHudGate92f1c0Plan;

typedef struct IsaacHistoryHudListTeardownPlan {
  int32_t teardown_needed;
  int32_t walk_needed;
  int32_t walk_count;
  int32_t unbounded;
  int32_t host_node_edges;
  int32_t free_size;
  int32_t large_gate;
  int32_t invalid_parameter_needed;
  uint32_t free_ptr;
  int32_t free_size_arg;
  int32_t host_free_needed;
  int32_t free_monolithic;
} IsaacHistoryHudListTeardownPlan;

typedef struct IsaacHistoryHudCompactTeardownOrder {
  int32_t site_a_needed;
  int32_t site_b_needed;
  int32_t any_teardown_needed;
} IsaacHistoryHudCompactTeardownOrder;

typedef struct IsaacHistoryHudRecomputeWalkPlan {
  int32_t walk_needed;
  int32_t player_count;
  int32_t pure_complete;
  int32_t monolithic;
  int32_t iterations;
  int32_t host_edge_budget;
  int32_t fatal_reachable;
} IsaacHistoryHudRecomputeWalkPlan;

typedef struct IsaacHistoryHudRecomputeWalkNode {
  uint32_t iteration;
  uint32_t player_addr;
  uint32_t idx_for_recompute;
  int32_t get_player_idx_host;
  int32_t recompute_pure_dirty;
  int32_t recompute_host;
  uint32_t recompute_dirty_addr;
  int32_t twin_present;
  int32_t twin_get_player_idx_host;
  int32_t twin_dirty;
  uint32_t twin_dirty_slot_addr;
} IsaacHistoryHudRecomputeWalkNode;

typedef struct IsaacNetplayIsIdxLocalPlan {
  int32_t count;
  int32_t empty;
  int32_t monolithic;
  int32_t match_index;
  uint32_t match_player_addr;
  int32_t host_virtual_needed;
  int32_t pure_complete;
  int32_t pure_result;
  int32_t result_known;
} IsaacNetplayIsIdxLocalPlan;

typedef struct IsaacHistoryHudEliminationNode {
  uint32_t cursor;
  uint32_t slot_index;
  uint32_t slot_addr;
  int32_t occupied;
  int32_t gpi_host;
  int32_t decision_known;
  int32_t gpi_idx;
  int32_t clear;
  int32_t compact;
  uint32_t compact_dst_addr;
  uint32_t compact_src_addr;
  int32_t step_continue;
} IsaacHistoryHudEliminationNode;

typedef struct IsaacHistoryHudEliminationPlan {
  int32_t it1_occupied;
  int32_t it1_gpi_host;
  int32_t it1_decision_known;
  int32_t it1_gpi_idx;
  int32_t it1_clear;
  int32_t it1_compact;
  int32_t it2_occupied;
  int32_t it2_gpi_host;
  int32_t it2_decision_known;
  int32_t it2_gpi_idx;
  int32_t it2_clear;
  int32_t it2_compact;
  int32_t host_edge_count;
  int32_t pure_complete;
  int32_t state_known;
  uint32_t slot0_player;
  uint32_t slot0_dirty;
  uint32_t slot0_list_begin;
  uint32_t slot0_list_end;
  uint32_t slot0_list_cap;
  uint32_t slot1_player;
  uint32_t slot1_dirty;
  uint32_t slot1_list_begin;
  uint32_t slot1_list_end;
  uint32_t slot1_list_cap;
} IsaacHistoryHudEliminationPlan;

/* Per-slot flag loop plan (helpers ABI v18, VA 0x009a2b83..0x009a2baa).
   slotN_recompute: byte flag at HUD+0x5c58 + N*0x14 != 0 -> one host
   HistoryHUD::Recompute(N, 1) edge. host_edge_count: 0..2. pure_complete:
   1 when both flags clear (loop emits no host edge). The per-step SIGNED
   loop-back law (0x009a2ba7 cmp esi,2 ; jl) is exported separately as
   isaac_hud_history_slot_loop_continue. */
typedef struct IsaacHistoryHudSlotLoopPlan {
  int32_t slot0_recompute;
  int32_t slot1_recompute;
  int32_t host_edge_count;
  int32_t pure_complete;
} IsaacHistoryHudSlotLoopPlan;

typedef struct IsaacItemConfigGetCollectiblePlan {
  int32_t negative;
  int32_t trinket_index;
  int32_t count;
  int32_t in_bounds;
  int32_t kind;
  uint32_t slot_addr;
  uint32_t result;
  int32_t result_known;
} IsaacItemConfigGetCollectiblePlan;

typedef struct IsaacHudFcoNode {
  int32_t skip;
  int32_t host_primary;
  int32_t primary_hit;
  int32_t host_twin;
  int32_t twin_hit;
  uint32_t result;
  int32_t result_known;
  int32_t step_continue;
} IsaacHudFcoNode;

typedef struct IsaacHudFcoPlan {
  int32_t twin_flag;
  int32_t empty;
  int32_t count;
  int32_t monolithic;
  int32_t walk_needed;
  int32_t host_has_collectible;
  int32_t pure_complete;
  int32_t result_known;
  uint32_t result;
  int32_t get_collectible_pure;
} IsaacHudFcoPlan;

typedef struct IsaacGameGetPlayerPlan {
  int32_t count;
  int32_t empty;
  int32_t host_fatal;
  int32_t in_bounds;
  uint32_t slot_addr;
  uint32_t result;
  int32_t result_known;
} IsaacGameGetPlayerPlan;

typedef struct IsaacHasCollectibleRedirectNode {
  int32_t redirect_needed;
  int32_t parent_qualify;
  int32_t host_get_player;
  uint32_t player_out;
  int32_t player_known;
  int32_t fall_to_inventory;
} IsaacHasCollectibleRedirectNode;

typedef struct IsaacHasCollectiblePlan {
  int32_t config_null;
  int32_t redirect_needed;
  int32_t parent_qualify;
  int32_t host_get_player;
  int32_t get_player_fatal;
  int32_t player_known;
  uint32_t player_out;
  int32_t quest_hide;
  int32_t held_true;
  int32_t id_negative;
  int32_t host_trinket;
  int32_t ignore_modifiers;
  int32_t host_modifier_body;
  int32_t inventory_threshold;
  int32_t count_hit;
  int32_t result;
  int32_t result_known;
  int32_t pure_complete;
} IsaacHasCollectiblePlan;

typedef struct IsaacTempfxHasNullPlan {
  int32_t disabled;
  int32_t empty;
  int32_t node_match;
  int32_t walk_continue;
  int32_t result;
  int32_t result_known;
  int32_t pure_complete;
} IsaacTempfxHasNullPlan;

typedef struct IsaacHasCollectibleModifierPlan {
  int32_t arm;
  int32_t bit_true;
  int32_t type_10;
  int32_t type_31;
  int32_t type_3_or_c;
  int32_t seed_mod4;
  int32_t inner_true;
  int32_t host_771550;
  int32_t host_7cb6e0;
  int32_t need_has_null;
  int32_t host_rec_26b;
  int32_t host_7db8d0;
  int32_t host_139_body;
  int32_t host_9_body;
  int32_t result;
  int32_t result_known;
  int32_t pure_complete;
} IsaacHasCollectibleModifierPlan;

/* Resolved plan for the 0x007db8d0 ladder blocker (helpers ABI v16).
   scan_active: the Game+0x1bbd8 walk's last node qualifies (not disabled,
   value <= 0x4f, not the head) and the player mode-buffer span is > 0x8f.
   mode: buf byte at player+0x1fd4+0x8f when scan_active, else 0.
   fast_applicable / fast_result: mode <= 7 dispatch table {-1,-1,0,1,2,3,4,5}.
   slow_hash: (xor-shift hash of max(1, game_count+mode) & 3) + 2.
   slow_fatal: slow path with known game_count == 0 -> host 0x00a112c0.
   host_needed: slow && (!count_known || count == 0). */
typedef struct IsaacHasCollectibleModResolvePlan {
  int32_t scan_active;
  int32_t mode;
  int32_t fast_applicable;
  int32_t fast_result;
  int32_t slow_fatal;
  int32_t slow_hash;
  int32_t result;
  int32_t result_known;
  int32_t host_needed;
  int32_t pure_complete;
} IsaacHasCollectibleModResolvePlan;

/* Resolved plan for the 0x00771550 ladder helper (helpers ABI v17,
   narrowed). owned: early-TRUE gate (f=[player+0x2ef8] != 0 && f == id &&
   byte[player+0x2ef0] != 0) — pure result 1 with NO host call.
   strict: flag==0 sub-gate (f != 0 && f == id && byte == 0) — the host
   count compare uses count > 1 (else count > 0). host_7cb6e0: flag==0 &&
   !owned — 0x7cb6e0(player, id) count. count_known/count: caller-supplied
   host sample (result = count > (strict ? 1 : 0), SIGNED).
   host_has_8b / host_has_1ca: flag!=0 path recursive HasCollectible
   samples (0x7706e0); the 0x1ca sample is only needed when 0x8b is
   FALSE (PE short-circuit). scan_width: 1 + (has_8b || has_1ca) when the
   samples are known; scan_result: (slot & 0x7fff) == id over the first
   scan_width slots at player+0x16c0 (stride 4, UNSIGNED loop). */
typedef struct IsaacHasCollectible771550Plan {
  int32_t owned;
  int32_t strict;
  int32_t host_7cb6e0;
  int32_t count_known;
  int32_t count;
  int32_t host_has_8b;
  int32_t host_has_1ca;
  int32_t scan_width;
  int32_t scan_result;
  int32_t result;
  int32_t result_known;
  int32_t host_needed;
  int32_t pure_complete;
} IsaacHasCollectible771550Plan;

/* Resolved plan for the 0x007cb6e0 count resolver (helpers ABI v19,
   narrowed). The plan runs on the RESOLVED player's field samples (the
   GetPlayer walk stays host) plus the manager mode/seed samples and the
   recursive HasCollectible / RNG / 0x930aa0 host samples (v17-style
   known/unknown pairs). count15/count40/count4b are the PURE recursed
   counts for the special ids 0x15/0x40/0x4b (the recursion reaches only
   the sampling region, so it terminates; each invocation re-reads the
   same samples). sampling_add is the outer invocation's PART-G..M
   contribution. host_edge_count totals the 0x7706e0 (0x8b, short-
   circuited 0x1ca, gated 0x1b7), 0x930aa0 (id==0x17) and 0x740bc0 +
   0x7e9020 (count4b branch) calls across ALL four invocations;
   GetPlayer walk edges are host and excluded. pure_complete == 1 iff
   result_known == 1. */
typedef struct IsaacHudCount7cb6e0Plan {
  int32_t boost;          /* +0  id==0x56 && type==4 */
  int32_t early_gate;     /* +4  byte 0x202c / 0x20a9 low byte */
  uint32_t id_masked;     /* +8  id & 0x7fff */
  int32_t table_hit;      /* +12 [Mgr+0x2663c]==0x1c && table scan */
  int32_t special_id;     /* +16 idm in {0x15,0x40,0x4b} */
  int32_t seed_mod4;      /* +20 signed % 4 of [Mgr+0x264f8] */
  int32_t seed_idx;       /* +24 count40 table index 0..9 */
  int32_t id30_returned;  /* +28 0x30 early-return fired */
  int32_t skip_7a29;      /* +32 0x7a combo jump to sampling */
  int32_t host_4b_needed; /* +36 RNG 0x4b gate calls required */
  int32_t host_17_needed; /* +40 0x930aa0 edge (idm==0x17) */
  int32_t count15;        /* +44 pure recursed count(id 0x15) */
  int32_t count40;        /* +48 pure recursed count(id 0x40) */
  int32_t count4b;        /* +52 pure recursed count(id 0x4b) */
  int32_t sampling_add;   /* +56 outer PART G..M contribution */
  int32_t result;         /* +60 final count */
  int32_t result_known;   /* +64 */
  int32_t host_needed;    /* +68 unknown required sample */
  int32_t pure_complete;  /* +72 */
  int32_t host_edge_count; /* +76 */
} IsaacHudCount7cb6e0Plan;

/* ABI v23 composed preamble walk plan (0x7cb6fb..0x7cb733): resolves the
   final player the 0x7cb6e0 body actually counts for. The walk follows
   [p+0x3bc] when the candidate is non-null && [+0x28]==1 (full dwords),
   else falls back to Game::GetPlayer(0) (0x00417870 host leaf) and loops
   while the adopted candidate's [+0x2c] == 1. GetPlayer(0) results come
   from the caller's samples table in linear memory (8 bytes/entry:
   u32 known, u32 result; one consumed per host edge). An exhausted or
   unknown sample stops with the current player and sets host_needed;
   a null result sets stopped_null (0x7cb726 je 0x7cb730). iter_cap bounds
   the adoptions (WALK_ITER_CAP=16 default). */
typedef struct IsaacHudCount7cb6e0WalkPlan {
  uint32_t resolved_player; /* +0  final player (post-walk) */
  int32_t walk_active;      /* +4  [p+0x2c]==1 start gate fired */
  int32_t iterations;       /* +8  candidate adoptions */
  int32_t host_edges;       /* +12 GetPlayer(0) host calls needed */
  int32_t truncated;        /* +16 iterations >= iter_cap */
  int32_t stopped_null;     /* +20 GetPlayer result == 0 */
  int32_t host_needed;      /* +24 sample exhausted/unknown */
} IsaacHudCount7cb6e0WalkPlan;

/* ABI v23 count4b RNG receiver prep (0x7cb879..0x7cb896): the 16-byte
   stack buffer fed to RNG::RandomInt (0x007e9020) with max 0xbd. seed =
   [room+0x5c]; a_lo/a_hi = qword at .rdata 0xb1f564 (dwords 0x2, 0x7);
   b = dword at 0xb1f56c (0x19). */
typedef struct IsaacHudCount7cb6e0RngPrep {
  uint32_t seed; /* +0 room field +0x5c */
  uint32_t a_lo; /* +4 qword[0xb1f564] lo */
  uint32_t a_hi; /* +8 qword[0xb1f564] hi */
  uint32_t b;    /* +12 dword[0xb1f56c] */
} IsaacHudCount7cb6e0RngPrep;

/* ABI v24: RNG::RandomInt BODY (0x007e9020) — a SEPARATE xorshift32 LCG
   (16-byte receiver {seed, s1, s2, s3}), NOT the room MT19937 0x006eef60.
   Evidence: section-notes/hud-v24-rng/NOTES.md + cpu-dump/007e9020.txt
   (0x7e9020..0x7e9075, ret 4). The draw:
     seed==0 -> CRT fatal (log 0xa112c0 "RNG Seed is zero!" @0xb6bf54,
       level 0x10) + int3 0x7e9041 (host edge; no advance);
     else xorshift: x ^= x>>s1; x ^= x<<s2; x ^= x>>s3 (shifts CL-masked
       &31); state[0] STORED BEFORE the max==0 test (state always
       advances when seed != 0); return (max==0) ? 0 : x % max
       (UNSIGNED div ecx). */
typedef struct IsaacHudRng7e9020Draw {
  uint32_t value;      /* +0 result: x % max, or 0 (max==0 / fatal) */
  uint32_t seed_after; /* +4 state[0] after the step (seed on fatal) */
  int32_t fatal;       /* +8 1 when the PE hits log 0xa112c0 + int3 */
} IsaacHudRng7e9020Draw;

/* 0x007e9020 RNG::RandomInt body constants (helpers ABI v24). */
enum {
  ISAAC_HUD_RNG_7E9020_VA = 0x007e9020u,
  ISAAC_HUD_RNG_7E9020_RET_VA_MAX0 = 0x007e906au,  /* max==0 early ret 4 */
  ISAAC_HUD_RNG_7E9020_RET_VA_MOD = 0x007e9075u,   /* div path ret 4 */
  ISAAC_HUD_RNG_7E9020_FATAL_LOG_VA = 0x00a112c0u, /* CRT assert log */
  ISAAC_HUD_RNG_7E9020_FATAL_STR_VA = 0x00b6bf54u, /* "RNG Seed is zero!\n" */
  ISAAC_HUD_RNG_7E9020_FATAL_LEVEL = 0x10,         /* log level (ASSERT) */
  ISAAC_HUD_RNG_7E9020_FATAL_INT3_VA = 0x007e9041u, /* trap after re-read */
  ISAAC_HUD_RNG_7E9020_STATE_BYTES = 0x10,         /* 16-byte receiver */
  ISAAC_HUD_RNG_7E9020_SEED_OFF = 0x0u,            /* state[0] */
  ISAAC_HUD_RNG_7E9020_SHIFT1_OFF = 0x4u,          /* state[1] (shr cl) */
  ISAAC_HUD_RNG_7E9020_SHIFT2_OFF = 0x8u,          /* state[2] (shl cl) */
  ISAAC_HUD_RNG_7E9020_SHIFT3_OFF = 0xcu,          /* state[3] (shr cl) */
  ISAAC_HUD_RNG_7E9020_COUNT4B_SHIFT1 = 0x2u,      /* count4b caller: */
  ISAAC_HUD_RNG_7E9020_COUNT4B_SHIFT2 = 0x7u,      /*   qword[0xb1f564] */
  ISAAC_HUD_RNG_7E9020_COUNT4B_SHIFT3 = 0x19u,     /*   dword[0xb1f56c] */
  ISAAC_HUD_RNG_7E9020_COUNT4B_MAX = 0xbdu         /*   push 0xbd */
};

/* 0x008318a0 shared signed-advance + rewrite + common tail (helpers ABI
   v20). Evidence: section-notes/hud-v20/NOTES.md and the aligned machine
   dumps cpu-dump/008318a0.txt (head + mode gate), 00831f90.txt (mode-2/3
   island 0x831fa1..0x8320cc), 00832640.txt (common tail 0x832663..0x8326bc). */
enum {
  ISAAC_HUD_8318A0_VA_HEAD = 0x008318a0u,
  ISAAC_HUD_8318A0_VA_MODE_GATE = 0x00831902u,      /* shared 92f1c0 law shape */
  ISAAC_HUD_8318A0_JUMP_TABLE_VA = 0x008327bcu,     /* {1,2,3,4} case entries */
  ISAAC_HUD_8318A0_CASE_VA_MODE1 = 0x00831915u,     /* always host 0x4186c0 */
  ISAAC_HUD_8318A0_CASE_VA_MODE2 = 0x00831fa1u,
  ISAAC_HUD_8318A0_CASE_VA_MODE3 = 0x008320c6u,
  ISAAC_HUD_8318A0_CASE_VA_MODE4 = 0x0083243bu,
  ISAAC_HUD_8318A0_VA_MODE2_FAST = 0x0083209cu,     /* [this+0x238]==0 path */
  ISAAC_HUD_8318A0_VA_JL_MODE2 = 0x008320a2u,       /* SIGNED counter < limit */
  ISAAC_HUD_8318A0_VA_JL_MODE3 = 0x008320ccu,       /* SIGNED counter < limit */
  ISAAC_HUD_8318A0_VA_SHARED_ADVANCE = 0x008320bdu, /* inc eax; [ebx+4]=eax */
  ISAAC_HUD_8318A0_VA_REWRITE_GATE = 0x00832024u,   /* 0x6c dword / 0x7c byte */
  ISAAC_HUD_8318A0_VA_COMMON_TAIL = 0x00832663u,    /* f32 ratio + tail stores */
  ISAAC_HUD_8318A0_VA_TAIL_MODE_REREAD = 0x00832670u, /* recaptured mode */
  ISAAC_HUD_8318A0_VA_TAIL_RATIO_STORE = 0x00832679u, /* movss [ebx+0xc] */
  ISAAC_HUD_8318A0_HEAD_FIELD_OFF = 0x234,          /* this+0x234 candidate */
  ISAAC_HUD_8318A0_HEAD_TYPE_OFF = 0x28,            /* candidate+0x28 */
  ISAAC_HUD_8318A0_HEAD_KIND_OFF = 0x2c,            /* candidate+0x2c */
  ISAAC_HUD_8318A0_HEAD_TYPE = 0x3c5,               /* cmp [eax+0x28],0x3c5 */
  ISAAC_HUD_8318A0_HEAD_KIND = 0xa,                 /* cmp [eax+0x2c],0xa */
  ISAAC_HUD_8318A0_GAME_IVAR1_OFF = 0x1bb74u,       /* Game+0x1bb74 read */
  ISAAC_HUD_8318A0_COUNTER_OFF = 4,                 /* receiver+4 */
  ISAAC_HUD_8318A0_LIMIT_OFF = 8,                   /* receiver+8 */
  ISAAC_HUD_8318A0_RATIO_OFF = 0xc,                 /* receiver+0xc f32 */
  ISAAC_HUD_8318A0_FIELD_238_OFF = 0x238,           /* mode-2 fast gate */
  ISAAC_HUD_8318A0_FIELD_6C_OFF = 0x6c,             /* rewrite full-word */
  ISAAC_HUD_8318A0_FIELD_7C_OFF = 0x7c,             /* rewrite low-byte */
  ISAAC_HUD_8318A0_GAME_22ED0_OFF = 0x22ed0u,       /* rewrite byte store */
  ISAAC_HUD_8318A0_GAME_22ED0_VALUE = 1,
  ISAAC_HUD_8318A0_GAME_22ED4_OFF = 0x22ed4u,       /* tail dword store */
  ISAAC_HUD_8318A0_GAME_22EDC_OFF = 0x22edcu,       /* tail dword store */
  ISAAC_HUD_8318A0_TAIL_STORE_VALUE = 2,
  ISAAC_HUD_8318A0_PLAYER_LIST_OFF = 0x1baa8u,      /* Game+0x1baa8 vector */
  ISAAC_HUD_8318A0_PLAYER_STRIDE = 4,
  ISAAC_HUD_8318A0_PLAYER_418_OFF = 0x418,          /* p+0x418 rewrite bump */
  ISAAC_HUD_8318A0_PLAYER_418_MIN = 10,             /* cmovg ecx,edx */
  ISAAC_HUD_8318A0_MODE_AFTER_REWRITE = 3,          /* *this = 3 on rewrite */
  ISAAC_HUD_8318A0_HOST_VA_TREE_WALK_PREP = 0x00409100u, /* mode-2 slow prep */
  ISAAC_HUD_8318A0_HOST_VA_RESET = 0x00830950u,     /* fast-path reset call */
  ISAAC_HUD_8318A0_HOST_VA_7EB1B0 = 0x007eb1b0u,    /* rewrite host leaf */
  ISAAC_HUD_8318A0_HOST_VA_MODE1 = 0x004186c0u,     /* mode-1 always-call */
  /* Mode-2 SLOW-path member scan (helpers ABI v21): walk over the
     std::_Tree-shaped container head stored at [this+0x224]. Node
     layout: left +0x0, parent +0x4, right +0x8, _Isnil byte +0xd
     (0 = real node, !=0 = head/null sentinel), byte gate +0x11d
     (0x831fc2 cmp byte [esi+0x11d],0; je 0x831fdb). */
  ISAAC_HUD_8318A0_MEMBER_LIST_HEAD_OFF = 0x224u,   /* [this+0x224] head */
  ISAAC_HUD_8318A0_MEMBER_NODE_LEFT_OFF = 0x0u,
  ISAAC_HUD_8318A0_MEMBER_NODE_PARENT_OFF = 0x4u,
  ISAAC_HUD_8318A0_MEMBER_NODE_RIGHT_OFF = 0x8u,
  ISAAC_HUD_8318A0_MEMBER_NODE_ISNIL_OFF = 0xdu,    /* byte [node+0xd] */
  ISAAC_HUD_8318A0_MEMBER_NODE_GATE_OFF = 0x11du,   /* byte gate */
  ISAAC_HUD_8318A0_MEMBER_CALL_A_OFF = 0x44u,       /* lea ecx,[esi+0x44] */
  ISAAC_HUD_8318A0_MEMBER_CALL_B_OFF = 0x64u,       /* lea ecx,[esi+0x64] */
  ISAAC_HUD_8318A0_MEMBER_CALLS_PER_GATED = 2,      /* 0x409030 x2 */
  ISAAC_HUD_8318A0_MEMBER_HOST_VA_409030 = 0x00409030u, /* exact-named host */
  ISAAC_HUD_8318A0_MEMBER_VA_ENTRY = 0x00831fb6u,   /* mov eax,[ebx+0x224] */
  ISAAC_HUD_8318A0_MEMBER_VA_VISIT = 0x00831fc2u,   /* cmp byte [esi+0x11d] */
  ISAAC_HUD_8318A0_MEMBER_VA_SUCC = 0x00831fdbu,    /* mov eax,[esi+8] */
  ISAAC_HUD_8318A0_MEMBER_VA_DESCEND = 0x00832004u, /* leftmost descend */
  ISAAC_HUD_8318A0_MEMBER_VA_CLIMB = 0x00831ff0u,   /* parent climb loop */
  ISAAC_HUD_8318A0_MEMBER_VA_LOOP_BACK = 0x00832022u, /* cmp node,head; jne */
  ISAAC_HUD_8318A0_MEMBER_PHASE_INIT = 0,           /* successor entry */
  ISAAC_HUD_8318A0_MEMBER_PHASE_DESCEND = 1,
  ISAAC_HUD_8318A0_MEMBER_PHASE_CLIMB = 2,
  /* Walk-order plan (helpers ABI v22): the mode-2 slow member scan emitted as
     an ordered host-event plan. The PE visit loop (0x831fc2..0x832022) walks
     begin()..end() in MSVC _Tree in-order successor order, so this export
     ALSO yields the visit ORDER. Event word = (kind<<24) | (payload & 0xffffff). */
  ISAAC_HUD_8318A0_MEMBER_PREP_RECV_OFF = 0x38u,   /* lea ecx,[ebx+0x38] */
  ISAAC_HUD_8318A0_TREE_WALK_NODE_CAP = 32,
  ISAAC_HUD_8318A0_TREE_WALK_EVENT_CAP = 128,      /* 32*(NODE+2host)+PREP */
  ISAAC_HUD_8318A0_TREE_WALK_KIND_PREP = 1,
  ISAAC_HUD_8318A0_TREE_WALK_KIND_NODE = 2,
  ISAAC_HUD_8318A0_TREE_WALK_KIND_HOST_A = 3,      /* node+0x44 */
  ISAAC_HUD_8318A0_TREE_WALK_KIND_HOST_B = 4       /* node+0x64 */
};

/* Resolved plan for the mode-2/3 shared signed-advance island + common
   tail (helpers ABI v20). advance_fires == 1 exactly when the PE takes
   LAB_008320bd (0x8320a2 / 0x8320cc SIGNED jl). counter_out is the
   post-advance (uint32)(counter+1) wrap; ratio_bits is the f32 bit
   pattern of (float)(int32)counter_out / (float)(int32)limit (cvtdq2ps +
   divss + movss, IEEE f32; 0x832679 movss — no integer truncation).
   tail_stores_needed follows the mode RE-READ at 0x832670 (v5 recapture
   discipline: mode_after_body, never the pre-dispatch mode). When the
   advance does NOT fire the PE runs host (mode-2 fast reset 0x00830950 /
   mode-3 body) — host_needed reports that. */
typedef struct IsaacHud8318a0AdvancePlan {
  int32_t advance_fires;      /* +0x0 1 iff shared signed advance taken */
  uint32_t counter_out;       /* +0x4 (uint32)(counter+1) wrap */
  uint32_t ratio_bits;        /* +0x8 f32 bits of counter_out/limit */
  int32_t tail_stores_needed; /* +0xc recaptured mode 2/3 -> Game fields */
  int32_t host_needed;        /* +0x10 1 when the advance does NOT fire */
  int32_t pure_complete;      /* +0x14 1 iff advance_fires */
} IsaacHud8318a0AdvancePlan;

/* Resolved plan for the Game+0x22ed0 rewrite gate (helpers ABI v20,
   NARROWED). The gate decision is pure; the open path keeps the host leaf
   0x007eb1b0 + the pure receiver/Game stores + the player walk. Closed
   gate -> pure no-op (jump straight to the common tail at 0x832663).
   field_7c is a BYTE gate: uint32_t param, &0xff in the body (v8 rule). */
typedef struct IsaacHud8318a0RewritePlan {
  int32_t rewrite_needed;     /* +0x0 [6c]==0 (word) || byte[7c]==0 */
  int32_t host_leaf_needed;   /* +0x4 0x7eb1b0 when the gate is open */
  int32_t game_22ed0_store;   /* +0x8 byte value 1 at Game+0x22ed0 */
  uint32_t counter_out;       /* +0xc receiver+4 = receiver+8 (limit) */
  int32_t mode_out;           /* +0x10 receiver mode = 3 when fired */
  int32_t player_walk_count;  /* +0x14 (end-begin)/4 when fired */
  int32_t pure_complete;      /* +0x18 1 iff gate closed (no host edge) */
} IsaacHud8318a0RewritePlan;

/* Mode-2 slow-path member-scan WALK-ORDER plan (helpers ABI v22, PE
   0x831fa1..0x832022). The PE walks the std::_Tree at [this+0x224] in
   in-order successor order from begin() to end(), gating each node on the
   byte [node+0x11d]. The plan resolves the WHOLE walk: the slow gate, the
   prep host receiver, the ordered host-event stream (PREP, then per-node
   NODE / HOST_A / HOST_B), the visit order (node sequence recovered from
   the NODE events), per-node visit gate + host-call pair, and termination
   (successor returned the head sentinel). The 0x409030 / 0x409100 host
   bodies stay host; only the plan's CF + events are pure. */
typedef struct IsaacHud8318a0TreeWalkPlan {
  int32_t slow_path;              /* +0x00 [this+0x238]!=0 (dword, 0x831fa1) */
  int32_t prep_host_needed;       /* +0x04 == slow_path; 0x409100(this+0x38) */
  uint32_t prep_receiver;         /* +0x08 this+0x38 (0x831fae) */
  uint32_t head_addr;             /* +0x0c [this+0x224] (0x831fb6) */
  uint32_t first_node;            /* +0x10 [head] (0x831fbc) */
  int32_t walk_active;            /* +0x14 first != head (0x831fbe/0x831fc0) */
  int32_t node_count;             /* +0x18 visit iterations (visit order len) */
  int32_t visit_gated_count;      /* +0x1c byte[+0x11d]!=0 nodes */
  int32_t host_call_count;        /* +0x20 prep + 2*gated (0x409030 pairs) */
  int32_t terminated;             /* +0x24 successor==head ended the walk */
  int32_t truncated;              /* +0x28 NODE_CAP cut the walk */
  uint32_t event[ISAAC_HUD_8318A0_TREE_WALK_EVENT_CAP]; /* +0x2c ordered */
} IsaacHud8318a0TreeWalkPlan;

uint32_t isaac_hud_player_hud_occupied_mask( const uint32_t player_ptrs[ISAAC_HUD_PLAYER_HUD_COUNT]);
int32_t isaac_hud_history_block_needed(int32_t manager_history_count);
int32_t isaac_hud_history_recompute_all_needed( uint32_t history_flag_5c7c);
void isaac_hud_history_flag_set(uint8_t* history_flag_5c7c);
int32_t isaac_hud_history_slot_recompute_needed(uint32_t slot_flag);
uint32_t isaac_hud_history_slot_loop_flag_addr(uint32_t hud_ptr, uint32_t slot_index);
int32_t isaac_hud_history_slot_loop_continue(int32_t next_index);
void isaac_hud_history_slot_loop_plan(uint32_t slot0_flag, uint32_t slot1_flag, IsaacHistoryHudSlotLoopPlan* out);
uint32_t isaac_hud_history_slot_loop_va_head(void);
uint32_t isaac_hud_history_slot_loop_va_flag_gate(void);
uint32_t isaac_hud_history_slot_loop_va_recompute(void);
uint32_t isaac_hud_history_slot_loop_va_skip(void);
uint32_t isaac_hud_history_slot_loop_va_loop_back(void);
uint32_t isaac_hud_history_slot_loop_immediate(void);
uint32_t isaac_hud_history_slot_loop_recompute_host(void);
int32_t isaac_stat_hud_post_update_needed(uint32_t manager_stat_flag);
int32_t isaac_hud_post_update_try_pure( uint32_t player_hud_occupied_mask, int32_t manager_history_count, uint32_t manager_stat_flag);
int32_t isaac_hud_post_update_snapshot_safe( uint32_t player_hud_occupied_mask);
void isaac_stat_hud_countdown_tick(IsaacStatHudCountdownState* state);
void isaac_stat_hud_countdown_tick_at(int32_t* base_at_0x13c);
int32_t isaac_history_hud_recompute_try_pure( uint32_t idx, uint32_t immediate, uint32_t player_ptr, uint8_t* slot_dirty_flag);
void isaac_history_hud_slot_dirty_set(uint8_t* slot_dirty_flag);
uint32_t isaac_stat_hud_collectible_id(void);
uint32_t isaac_stat_hud_owner_laz_shared_tag(void);
uint32_t isaac_stat_hud_player_list_game_offset(void);
uint32_t isaac_stat_hud_owner_flag_offset(void);
uint32_t isaac_stat_hud_recompute_flags(void);
void isaac_stat_hud_apply_owner_flag( uint8_t* owner_flag_2ac, uint32_t owner_ptr);
int32_t isaac_stat_hud_player_vector_count( uint32_t list_begin, uint32_t list_end);
int32_t isaac_stat_hud_player_walk_needed(int32_t player_count);
uint32_t isaac_stat_hud_player_slot_addr( uint32_t list_begin, uint32_t idx, int32_t player_count);
int32_t isaac_stat_hud_walk_index_select(uint32_t index, int32_t count);
int32_t isaac_stat_hud_walk_needs_empty_fatal(int32_t count_now);
int32_t isaac_stat_hud_walk_continue(uint32_t next_index, int32_t count_reloaded);
int32_t isaac_stat_hud_recompute_count_arg(int32_t count_now);
int32_t isaac_stat_hud_owner_flag_value(uint32_t owner_ptr);
int32_t isaac_stat_hud_tail_host_call_count(int32_t tail_needed, int32_t iterations);
int32_t isaac_stat_hud_tail_pure_complete( uint32_t manager_stat_flag);
void isaac_stat_hud_tail_plan(uint32_t manager_stat_flag, uint32_t list_begin, uint32_t list_end, uint32_t owner_sample, int32_t owner_known, IsaacStatHudTailPlan* out);
int32_t isaac_hud_gate_92f1c0_dispatch_case(uint32_t mode);
uint32_t isaac_hud_gate_92f1c0_case_va(int32_t dispatch_case);
int32_t isaac_hud_gate_92f1c0_body_host_needed(uint32_t mode);
int32_t isaac_hud_gate_92f1c0_try_pure(uint32_t mode);
int32_t isaac_hud_gate_92f1c0_counter_next(int32_t counter);
int32_t isaac_hud_gate_92f1c0_tail_stores_needed( uint32_t mode_after_body);
void isaac_hud_gate_92f1c0_plan(uint32_t mode, uint32_t mode_after_body, int32_t counter, IsaacHudGate92f1c0Plan* out);
int32_t isaac_history_hud_recompute_all_try_pure( uint32_t slot0_player, uint32_t slot1_player, int32_t player_count);
uint32_t isaac_history_hud_slot_count(void);
uint32_t isaac_history_hud_slot_stride(void);
uint32_t isaac_history_hud_reverse_walk_start_cursor(void);
uint32_t isaac_history_hud_reverse_walk_start_offset(void);
uint32_t isaac_history_hud_twin_ptr_offset(void);
uint32_t isaac_history_hud_character_type_offset(void);
uint32_t isaac_history_hud_twin_char_a(void);
uint32_t isaac_history_hud_twin_char_b(void);
uint32_t isaac_history_hud_list_elem_stride(void);
uint32_t isaac_history_hud_player_list_game_offset(void);
int32_t isaac_history_hud_reverse_walk_step( uint32_t* cursor, uint32_t* offset);
int32_t isaac_history_hud_player_idx_invalid( int32_t get_player_idx_result);
int32_t isaac_history_hud_slot_compact_needed( uint32_t reverse_cursor);
void isaac_history_hud_slot_player_clear(uint32_t* slot_player);
int32_t isaac_history_hud_slot_compact_triple_move_needed( uint32_t dst_slot_addr, uint32_t src_slot_addr);
void isaac_history_hud_slot_compact_swap( IsaacHistoryHudSlotSparse* dst, IsaacHistoryHudSlotSparse* src, IsaacHistoryHudSlotListTriple* out_dst_old_list);
int32_t isaac_history_hud_slot_compact_loop_continue( int32_t cursor_after_inc);
int32_t isaac_history_hud_twin_char_eligible(int32_t character_type);
int32_t isaac_history_hud_twin_dirty_needed( uint32_t twin_ptr, int32_t character_type, uint32_t twin_idx, uint32_t slot_player_at_twin_idx);
uint32_t isaac_history_hud_list_byte_size( uint32_t list_begin, uint32_t list_end);
int32_t isaac_history_hud_list_free_needed(uint32_t list_begin);
uint32_t isaac_history_get_player_idx_netplay_embed_off(void);
uint32_t isaac_history_get_player_idx_player_net_idx_off(void);
uint32_t isaac_history_get_player_idx_player_field_2c_off(void);
uint32_t isaac_history_get_player_idx_player_field_3bc_off(void);
uint32_t isaac_history_get_player_idx_player_char_type_off(void);
uint32_t isaac_history_get_player_idx_reject_char(void);
int32_t isaac_history_hud_get_player_idx_netplay_range_empty( uint32_t netplay_begin, uint32_t netplay_end);
int32_t isaac_history_hud_get_player_idx_player_eligible( uint32_t player_field_2c, uint32_t player_field_3bc, int32_t player_char_type);
int32_t isaac_history_hud_get_player_idx_resolve( uint32_t slot0_player, uint32_t slot1_player, uint32_t player_ptr, uint32_t* out_slot0_player, uint32_t* out_slot1_player);
int32_t isaac_history_hud_get_player_idx_try_pure( uint32_t netplay_begin, uint32_t netplay_end, int32_t netplay_local_known, uint32_t player_field_2c, uint32_t player_field_3bc, int32_t player_char_type, uint32_t slot0_player, uint32_t slot1_player, uint32_t player_ptr, uint32_t* out_slot0_player, uint32_t* out_slot1_player, int32_t* out_idx);
int32_t isaac_history_hud_list_teardown_needed( uint32_t list_begin);
int32_t isaac_history_hud_list_walk_needed( uint32_t list_begin, uint32_t list_end);
int32_t isaac_history_hud_list_walk_count( uint32_t list_begin, uint32_t list_end);
int32_t isaac_history_hud_list_walk_continue( uint32_t next_elem, uint32_t list_end);
int32_t isaac_history_hud_list_teardown_node_release_needed( uint32_t node_sub_ptr);
int32_t isaac_history_hud_list_teardown_callback_needed( uint32_t callback_global);
int32_t isaac_history_hud_list_teardown_free_size( uint32_t list_begin, uint32_t list_cap);
int32_t isaac_history_hud_list_teardown_large_gate( int32_t free_size);
int32_t isaac_history_hud_list_teardown_header_resolve( uint32_t header, uint32_t list_begin, int32_t free_size, uint32_t* out_free_ptr, int32_t* out_free_size_arg);
void isaac_history_hud_list_teardown_plan( uint32_t list_begin, uint32_t list_end, uint32_t list_cap, int32_t header_known, uint32_t header, IsaacHistoryHudListTeardownPlan* out);
void isaac_history_hud_slot_compact_teardown_order( uint32_t src_begin_addr, uint32_t temp_addr, uint32_t src_begin_after_move2, uint32_t temp_begin, IsaacHistoryHudCompactTeardownOrder* out);
uint32_t isaac_history_hud_list_node_sub_offset(void);
uint32_t isaac_history_hud_list_node_callback_arg_offset(void);
uint32_t isaac_history_hud_list_vtable_release_entry(void);
uint32_t isaac_history_hud_list_callback_global(void);
uint32_t isaac_history_hud_free_large_gate(void);
uint32_t isaac_history_hud_free_header_size(void);
uint32_t isaac_history_hud_free_header_offset_bound(void);
int32_t isaac_history_hud_recompute_walk_entry_needed( int32_t player_count);
int32_t isaac_history_hud_recompute_walk_player_count( uint32_t list_begin, uint32_t list_end);
uint32_t isaac_history_hud_recompute_walk_select_addr( uint32_t list_begin, uint32_t idx, int32_t player_count);
int32_t isaac_history_hud_recompute_walk_fatal_needed( int32_t count_reloaded);
int32_t isaac_history_hud_recompute_walk_continue( uint32_t next_index, int32_t count_reloaded);
void isaac_history_hud_recompute_walk_plan( uint32_t list_begin, uint32_t list_end, IsaacHistoryHudRecomputeWalkPlan* out);
void isaac_history_hud_recompute_walk_node_plan( uint32_t hud_ptr, uint32_t list_begin, uint32_t idx, int32_t player_count, uint32_t immediate, uint32_t netplay_begin, uint32_t netplay_end, int32_t netplay_local_known, uint32_t player_ptr, int32_t idx_for_recompute, uint32_t twin_ptr, int32_t twin_character_type, int32_t twin_idx_result, uint32_t slot0_player, uint32_t slot1_player, IsaacHistoryHudRecomputeWalkNode* out);
uint32_t isaac_history_hud_recompute_walk_va_get_player_idx(void);
uint32_t isaac_history_hud_recompute_walk_va_recompute(void);
uint32_t isaac_history_hud_recompute_walk_va_twin_get_player_idx(void);
uint32_t isaac_history_hud_recompute_walk_va_fatal(void);
uint32_t isaac_history_hud_recompute_walk_va_mark(void);
uint32_t isaac_history_hud_recompute_walk_fatal_string(void);
uint32_t isaac_history_hud_recompute_walk_fatal_arg(void);
uint32_t isaac_hud_host_va_invalid_parameter(void);
uint32_t isaac_hud_host_va_history_recompute(void);
uint32_t isaac_hud_host_va_history_recompute_all(void);
uint32_t isaac_hud_host_va_history_get_player_idx(void);
uint32_t isaac_hud_host_va_first_collectible_owner(void);
uint32_t isaac_hud_host_va_stat_get_player_id(void);
uint32_t isaac_hud_host_va_stat_recompute_stats(void);
uint32_t isaac_hud_host_va_stat_post_update(void);
uint32_t isaac_hud_host_va_fatal_log(void);
uint32_t isaac_hud_host_va_crt_free(void);
uint32_t isaac_hud_host_va_netplay_is_idx_local(void);
int32_t isaac_netplay_is_idx_local_player_count( uint32_t list_begin, uint32_t list_end);
int32_t isaac_netplay_is_idx_local_player_empty( int32_t player_count);
int32_t isaac_netplay_is_idx_local_player_match( uint32_t player_field_c, uint32_t idx);
int32_t isaac_netplay_is_idx_local_player_continue( uint32_t next_index, int32_t player_count);
void isaac_netplay_is_idx_local_player_plan( uint32_t list_begin, uint32_t list_end, int32_t match_index, IsaacNetplayIsIdxLocalPlan* out);
uint32_t isaac_netplay_is_idx_local_player_field_c_off(void);
uint32_t isaac_netplay_is_idx_local_player_vtable_off(void);
uint32_t isaac_netplay_is_idx_local_player_vtable_entry_off(void);
int32_t isaac_entity_player_is_hologram_pure( uint32_t hologram_flag_172, int32_t character_type, uint32_t twin_ptr, int32_t twin_net_idx, int32_t own_net_idx, uint32_t self_ptr);
uint32_t isaac_entity_player_is_hologram_flag_off(void);
uint32_t isaac_entity_player_twin_ptr_off(void);
uint32_t isaac_entity_player_net_idx_off(void);
uint32_t isaac_stat_hud_get_player_id_slot_base_off(void);
uint32_t isaac_stat_hud_get_player_id_slot_stride(void);
uint32_t isaac_stat_hud_get_player_id_slot_count(void);
uint32_t isaac_stat_hud_get_player_id_slot_addr( uint32_t slot_base, uint32_t slot_index);
int32_t isaac_stat_hud_get_player_id_try_pure( uint32_t netplay_begin, uint32_t netplay_end, int32_t netplay_local_known, uint32_t player_field_2c, uint32_t player_field_3bc, int32_t player_char_type, int32_t is_hologram, uint32_t slot0_player, uint32_t slot1_player, uint32_t player_ptr, uint32_t* out_slot0_player, uint32_t* out_slot1_player, int32_t* out_idx);
int32_t isaac_stat_hud_tail_host_call_count_v11( int32_t tail_needed, int32_t iterations, int32_t netplay_virtual_edges);
int32_t isaac_history_hud_elimination_slot_occupied( uint32_t player);
int32_t isaac_history_hud_elimination_clear_needed( int32_t get_player_idx_result);
int32_t isaac_history_hud_elimination_compact_needed( uint32_t clear_needed, uint32_t cursor);
int32_t isaac_history_hud_elimination_step_continue( int32_t cursor_after_dec);
uint32_t isaac_history_hud_elimination_slot_addr( uint32_t hud_ptr, uint32_t cursor);
void isaac_history_hud_elimination_node_plan( uint32_t hud_ptr, uint32_t cursor, uint32_t slot_player, uint32_t player_field_2c, uint32_t player_field_3bc, int32_t player_char_type, uint32_t slot0_player, uint32_t slot1_player, uint32_t netplay_begin, uint32_t netplay_end, int32_t netplay_local_known, int32_t prior_host, IsaacHistoryHudEliminationNode* out);
void isaac_history_hud_elimination_plan( uint32_t hud_ptr, uint32_t netplay_begin, uint32_t netplay_end, int32_t netplay_local_known, uint32_t s0_player, uint32_t s0_dirty, uint32_t s0_list_begin, uint32_t s0_list_end, uint32_t s0_list_cap, uint32_t s0_field_2c, uint32_t s0_field_3bc, int32_t s0_char_type, uint32_t s1_player, uint32_t s1_dirty, uint32_t s1_list_begin, uint32_t s1_list_end, uint32_t s1_list_cap, uint32_t s1_field_2c, uint32_t s1_field_3bc, int32_t s1_char_type, IsaacHistoryHudEliminationPlan* out);
uint32_t isaac_hud_host_va_get_collectible(void);
uint32_t isaac_hud_host_va_has_collectible(void);
int32_t isaac_item_config_get_collectible_negative(int32_t id);
int32_t isaac_item_config_get_collectible_trinket_index(int32_t id);
int32_t isaac_item_config_get_collectible_in_bounds(int32_t index, int32_t count);
uint32_t isaac_item_config_get_collectible_slot_addr(uint32_t begin, int32_t index);
int32_t isaac_item_config_get_collectible_kind( uint32_t game_ptr, int32_t id, uint32_t config_begin, uint32_t config_end, uint32_t trinket_begin, uint32_t trinket_end);
void isaac_item_config_get_collectible_plan( uint32_t game_ptr, int32_t id, uint32_t config_begin, uint32_t config_end, uint32_t trinket_begin, uint32_t trinket_end, uint32_t slot_sample, uint32_t inner_sample, IsaacItemConfigGetCollectiblePlan* out);
uint32_t isaac_item_config_trinket_begin_off(void);
uint32_t isaac_item_config_trinket_end_off(void);
uint32_t isaac_item_config_game_global(void);
int32_t isaac_fco_twin_walk_flag(uint32_t laz_shared_tag, uint32_t config_ptr, uint32_t config_field_b8);
int32_t isaac_fco_list_empty(uint32_t list_begin, uint32_t list_end);
int32_t isaac_fco_player_slot_active(uint32_t player_field_2c);
int32_t isaac_fco_twin_present(uint32_t twin_ptr);
int32_t isaac_fco_has_collectible_hit(uint32_t al_byte);
int32_t isaac_fco_list_continue(uint32_t list_cur, uint32_t list_end);
void isaac_fco_node_plan( uint32_t player_ptr, uint32_t player_field_2c, uint32_t twin_ptr, int32_t twin_flag, int32_t primary_known, uint32_t primary_al, int32_t twin_known, uint32_t twin_al, IsaacHudFcoNode* out);
void isaac_fco_plan( uint32_t laz_shared_tag, uint32_t config_ptr, uint32_t config_field_b8, uint32_t list_begin, uint32_t list_end, int32_t hit_kind, uint32_t hit_player, uint32_t hit_twin, IsaacHudFcoPlan* out);
uint32_t isaac_fco_item_flags_off(void);
uint32_t isaac_fco_twin_bit(void);
uint32_t isaac_fco_item_config_off(void);
uint32_t isaac_fco_player_field_2c_off(void);
uint32_t isaac_fco_twin_ptr_off(void);
int32_t isaac_stat_hud_tail_host_call_count_v13( int32_t tail_needed, int32_t iterations, int32_t netplay_virtual_edges, int32_t fco_has_edges);
int32_t isaac_game_get_player_empty(int32_t count);
int32_t isaac_game_get_player_in_bounds(uint32_t index, int32_t count);
uint32_t isaac_game_get_player_slot_addr(uint32_t list_begin, uint32_t index, int32_t count);
void isaac_game_get_player_plan(uint32_t list_begin, uint32_t list_end, uint32_t index, uint32_t slot_sample, IsaacGameGetPlayerPlan* out);
uint32_t isaac_hud_host_va_game_get_player(void);
uint32_t isaac_hud_host_va_has_trinket(void);
int32_t isaac_has_collectible_config_null(uint32_t config_ptr);
int32_t isaac_has_collectible_redirect_needed(uint32_t field_2c);
int32_t isaac_has_collectible_parent_qualify( uint32_t parent_ptr, uint32_t parent_field_28);
int32_t isaac_has_collectible_quest_hide(uint32_t flag_20a9, int32_t challenge, uint32_t item_flags);
int32_t isaac_has_collectible_held_true(uint32_t held_id, int32_t id, uint32_t held_flag);
int32_t isaac_has_collectible_id_negative(int32_t id);
int32_t isaac_has_collectible_ignore_modifiers( uint32_t ignore_mod);
int32_t isaac_has_collectible_inventory_threshold( uint32_t held_id, int32_t id, uint32_t held_flag);
int32_t isaac_has_collectible_count_hit(int32_t count, int32_t threshold);
uint32_t isaac_has_collectible_count_slot_addr(uint32_t table, int32_t id);
void isaac_has_collectible_redirect_node( uint32_t player_in, uint32_t field_2c, uint32_t parent_ptr, uint32_t parent_field_28, int32_t get_player_known, uint32_t get_player_result, IsaacHasCollectibleRedirectNode* out);
void isaac_has_collectible_plan( uint32_t config_ptr, uint32_t player_in, uint32_t field_2c, uint32_t parent_ptr, uint32_t parent_field_28, uint32_t list_begin, uint32_t list_end, uint32_t player0_sample, uint32_t flag_20a9, int32_t challenge, uint32_t item_flags, uint32_t held_id, uint32_t held_flag, int32_t id, uint32_t ignore_mod, int32_t count_sample, IsaacHasCollectiblePlan* out);
uint32_t isaac_has_collectible_player_field_2c_off(void);
uint32_t isaac_has_collectible_parent_ptr_off(void);
uint32_t isaac_has_collectible_quest_hide_off(void);
uint32_t isaac_has_collectible_held_id_off(void);
uint32_t isaac_has_collectible_count_table_off(void);
uint32_t isaac_has_collectible_quest_bit(void);
int32_t isaac_has_collectible_mod_arm(int32_t id);
int32_t isaac_has_collectible_flags_2028_bit(uint32_t flags_2028, uint32_t mask);
int32_t isaac_has_collectible_seed_mod4(int32_t seed);
int32_t isaac_has_collectible_inner_true(int32_t id, int32_t num_15, int32_t seed_mod4);
int32_t isaac_has_collectible_type_10(int32_t char_type);
int32_t isaac_has_collectible_type_31(int32_t char_type);
int32_t isaac_has_collectible_type_3_or_c(int32_t char_type);
int32_t isaac_tempfx_has_null_disabled(uint32_t disabled);
int32_t isaac_tempfx_has_null_empty(uint32_t begin, uint32_t end);
int32_t isaac_tempfx_has_null_node_match(int32_t item_type, int32_t item_id, int32_t wanted);
int32_t isaac_tempfx_has_null_walk_continue(uint32_t next, uint32_t end);
void isaac_tempfx_has_null_plan(uint32_t disabled, uint32_t begin, uint32_t end, int32_t item_type, int32_t item_id, int32_t wanted, IsaacTempfxHasNullPlan* out);
void isaac_has_collectible_modifier_plan(int32_t id, uint32_t flags_2028, int32_t char_type, int32_t seed_264f8, int32_t has_effect_15_known, int32_t has_effect_15, int32_t num_15_known, int32_t num_15, int32_t has_null_known, int32_t has_null, int32_t has_effect_5d_known, int32_t has_effect_5d, int32_t rec_26b_known, int32_t rec_26b, IsaacHasCollectibleModifierPlan* out);
uint32_t isaac_hud_host_va_has_collectible_771550(void);
uint32_t isaac_hud_host_va_has_collectible_7cb6e0(void);
uint32_t isaac_hud_host_va_tempfx_has_null(void);
uint32_t isaac_hud_host_va_has_collectible_7da770(void);
uint32_t isaac_hud_host_va_has_collectible_7db8d0(void);
uint32_t isaac_tempfx_disabled_off(void);
uint32_t isaac_tempfx_elem_stride(void);
uint32_t isaac_has_collectible_flags_2028_off(void);
int32_t isaac_has_collectible_mod_scan_active( uint32_t last_node_disabled, uint32_t last_node_value, uint32_t last_node_is_head, uint32_t buf_begin, uint32_t buf_end);
int32_t isaac_has_collectible_mod_scan_mode( uint32_t last_node_disabled, uint32_t last_node_value, uint32_t last_node_is_head, uint32_t buf_begin, uint32_t buf_end, int32_t buf_byte);
int32_t isaac_has_collectible_mod_fast_applicable(uint32_t mode);
int32_t isaac_has_collectible_mod_fast_result(uint32_t mode);
int32_t isaac_has_collectible_mod_slow_fatal(int32_t game_count);
int32_t isaac_has_collectible_mod_slow_hash(uint32_t game_count, uint32_t mode);
void isaac_has_collectible_mod_resolve_plan( uint32_t last_node_disabled, uint32_t last_node_value, uint32_t last_node_is_head, uint32_t buf_begin, uint32_t buf_end, int32_t buf_byte, int32_t count_known, int32_t game_count, IsaacHasCollectibleModResolvePlan* out);
uint32_t isaac_hud_host_va_has_collectible_7db860(void);
uint32_t isaac_hud_host_va_has_collectible_scan_4288a0(void);
int32_t isaac_has_collectible_771550_owned(uint32_t field_2ef8, int32_t byte_2ef0, uint32_t id);
int32_t isaac_has_collectible_771550_strict(uint32_t field_2ef8, int32_t byte_2ef0, uint32_t id);
int32_t isaac_has_collectible_771550_count_gt(int32_t count, int32_t strict);
int32_t isaac_has_collectible_771550_scan_width(int32_t has_8b, int32_t has_1ca);
int32_t isaac_has_collectible_771550_slot_match(uint32_t slot, uint32_t id);
int32_t isaac_has_collectible_771550_scan_result(uint32_t slot0, uint32_t slot1, int32_t scan_width, uint32_t id);
void isaac_has_collectible_771550_plan(uint32_t field_2ef8, int32_t byte_2ef0, uint32_t id, int32_t flag, int32_t count_known, int32_t count, int32_t has_8b_known, int32_t has_8b, int32_t has_1ca_known, int32_t has_1ca, uint32_t slot0, uint32_t slot1, IsaacHasCollectible771550Plan* out);
uint32_t isaac_has_collectible_771550_field_off(void);
uint32_t isaac_has_collectible_771550_byte_off(void);
uint32_t isaac_has_collectible_771550_slot_base_off(void);
uint32_t isaac_has_collectible_771550_slot_stride(void);
uint32_t isaac_has_collectible_771550_slot_mask(void);
uint32_t isaac_has_collectible_771550_which_8b(void);
uint32_t isaac_has_collectible_771550_which_1ca(void);
int32_t isaac_hud_count_7cb6e0_char56_boost(uint32_t field_13c0, uint32_t id);
int32_t isaac_hud_count_7cb6e0_early_gate_202c(uint32_t flag_202c);
int32_t isaac_hud_count_7cb6e0_early_gate_20a9(uint32_t flag_20a9);
uint32_t isaac_hud_count_7cb6e0_id_mask(uint32_t id);
uint32_t isaac_hud_count_7cb6e0_table_va(void);
uint32_t isaac_hud_count_7cb6e0_table_size(void);
uint32_t isaac_hud_count_7cb6e0_table_value(uint32_t index);
uint32_t isaac_hud_count_7cb6e0_sampling_va(void);
uint32_t isaac_hud_count_7cb6e0_mode_gate(void);
uint32_t isaac_hud_count_7cb6e0_mask(void);
uint32_t isaac_hud_count_7cb6e0_slot_base_off(void);
uint32_t isaac_hud_count_7cb6e0_slot_stride(void);
uint32_t isaac_hud_count_7cb6e0_item_begin_off(void);
uint32_t isaac_hud_count_7cb6e0_item_end_off(void);
uint32_t isaac_hud_count_7cb6e0_byte_begin_off(void);
uint32_t isaac_hud_count_7cb6e0_byte_end_off(void);
uint32_t isaac_hud_count_7cb6e0_which_1b7(void);
int32_t isaac_hud_count_7cb6e0_mode_table_hit(uint32_t manager_mode, uint32_t id_masked);
int32_t isaac_hud_count_7cb6e0_special_id(uint32_t id_masked);
int32_t isaac_hud_count_7cb6e0_seed_mod4(int32_t seed_264f8);
uint32_t isaac_hud_count_7cb6e0_seed_table_index(int32_t seed_264f8);
int32_t isaac_hud_count_7cb6e0_seed_gate(int32_t seed_264f8, uint32_t id_masked);
int32_t isaac_hud_count_7cb6e0_id30_gate(uint32_t id_masked, int32_t count15, int32_t mod4);
int32_t isaac_hud_count_7cb6e0_7a29_skip(uint32_t id_masked, uint32_t manager_mode_26584);
int32_t isaac_hud_count_7cb6e0_4b_compare(uint32_t rng_plus1, uint32_t id_masked);
int32_t isaac_hud_count_7cb6e0_slot16c0(uint32_t slot, uint32_t id_masked);
int32_t isaac_hud_count_7cb6e0_scan_width(int32_t has_8b, int32_t has_1ca);
int32_t isaac_hud_count_7cb6e0_block17c4(uint32_t block_ptr, uint32_t block0, uint32_t block4, uint32_t field_2ef8, uint32_t id_masked);
int32_t isaac_hud_count_7cb6e0_block_flag_17cc(uint32_t flag_17cc);
int32_t isaac_hud_count_7cb6e0_item_span(uint32_t begin_1748, uint32_t end_174c);
int32_t isaac_hud_count_7cb6e0_item_list_add(uint32_t id_masked, int32_t item_span, int32_t item_id, int32_t item_count);
int32_t isaac_hud_count_7cb6e0_bytebuf_add(uint32_t id_masked, int32_t byte_span, uint32_t byte_value);
int32_t isaac_hud_count_7cb6e0_2ef8_adjust(int32_t esi, uint32_t field_2ef8, uint32_t byte_2ef0, uint32_t id_masked);
int32_t isaac_hud_count_7cb6e0_final_gate(int32_t esi, int32_t has_1b7);
void isaac_hud_count_7cb6e0_walk_step(uint32_t player_ptr, uint32_t player_field_2c, uint32_t parent_ptr, uint32_t parent_field_28, int32_t get_player_known, uint32_t get_player_result, uint32_t candidate_field_2c, uint32_t* out_player, int32_t* out_host_edge, int32_t* out_continue);
void isaac_hud_count_7cb6e0_plan(uint32_t id, uint32_t field_13c0, uint32_t flag_202c, uint32_t flag_20a9, uint32_t manager_mode_2663c, int32_t manager_seed_264f8, uint32_t manager_mode_26584, uint32_t slot0, uint32_t slot1, uint32_t block_ptr, uint32_t block0, uint32_t block4, uint32_t flag_17cc, uint32_t item_begin, uint32_t item_end, int32_t item_id, int32_t item_count, uint32_t byte_begin, uint32_t byte_end, uint32_t byte_value, uint32_t field_2ef8, uint32_t byte_2ef0, int32_t field_18dc, int32_t field_18e0, int32_t has_8b_known, int32_t has_8b, int32_t has_1ca_known, int32_t has_1ca, int32_t has_1b7_known, int32_t has_1b7, int32_t host_17_known, int32_t host_17, int32_t host_4b_known, int32_t host_4b, IsaacHudCount7cb6e0Plan* out);

/* v23 (0x007cb6e0): preamble walk + count4b RNG-draw + twin/recursion
   PREP laws. All host leaves stay host; laws are the pure decisions and
   receiver/arg preps. */
int32_t isaac_hud_count_7cb6e0_walk_active(uint32_t player_field_2c);
int32_t isaac_hud_count_7cb6e0_m3bc_eligible(uint32_t parent_ptr, uint32_t parent_field_28);
void isaac_hud_count_7cb6e0_walk_plan(uint32_t player_ptr, uint32_t samples_addr, uint32_t samples_count, uint32_t iter_cap, IsaacHudCount7cb6e0WalkPlan* out);
int32_t isaac_hud_count_7cb6e0_rng_gate(uint32_t room_field_5c);
void isaac_hud_count_7cb6e0_rng_prep(uint32_t room_field_5c, IsaacHudCount7cb6e0RngPrep* out);
void isaac_hud_count_7cb6e0_room_prep(uint32_t game_ptr, uint32_t game_field_18304, uint32_t* out_receiver, int32_t* out_idx, int32_t* out_arg2);
uint32_t isaac_hud_count_7cb6e0_rng_max(void);
int32_t isaac_hud_count_7cb6e0_4b_chain(uint32_t room_field_5c, int32_t rng_known, uint32_t rng_result, int32_t count4b, uint32_t id_masked);
void isaac_hud_count_7cb6e0_twin17_prep(uint32_t player_ptr, uint32_t* out_receiver, uint32_t* out_arg);
void isaac_hud_count_7cb6e0_recurse_prep(uint32_t player_ptr, uint32_t id, uint32_t* out_receiver, uint32_t* out_arg);
uint32_t isaac_hud_count_7cb6e0_rng_const_va(void);
uint32_t isaac_hud_count_7cb6e0_rng_const_a_lo(void);
uint32_t isaac_hud_count_7cb6e0_rng_const_a_hi(void);
uint32_t isaac_hud_count_7cb6e0_rng_const_b(void);

/* v24 (0x007e9020): RNG::RandomInt BODY — xorshift32 law + state update.
   Receiver is the 16-byte {seed, s1, s2, s3}; seeds/sifts are uint32_t
   (shift counts re-narrowed &31 in-body, no uint8_t params). */
int32_t isaac_hud_rng_7e9020_seed_zero(uint32_t seed);
uint32_t isaac_hud_rng_7e9020_xorshift(uint32_t seed, uint32_t shift1,
                                       uint32_t shift2, uint32_t shift3);
void isaac_hud_rng_7e9020_random_int(uint32_t seed, uint32_t shift1,
                                     uint32_t shift2, uint32_t shift3,
                                     uint32_t max,
                                     IsaacHudRng7e9020Draw* out);
uint32_t isaac_hud_rng_7e9020_va(void);
uint32_t isaac_hud_rng_7e9020_ret_va_max0(void);
uint32_t isaac_hud_rng_7e9020_ret_va_mod(void);
uint32_t isaac_hud_rng_7e9020_fatal_log_va(void);
uint32_t isaac_hud_rng_7e9020_fatal_str_va(void);
uint32_t isaac_hud_rng_7e9020_fatal_level(void);
uint32_t isaac_hud_rng_7e9020_fatal_int3_va(void);
uint32_t isaac_hud_rng_7e9020_state_bytes(void);
uint32_t isaac_hud_rng_7e9020_seed_off(void);
uint32_t isaac_hud_rng_7e9020_shift1_off(void);
uint32_t isaac_hud_rng_7e9020_shift2_off(void);
uint32_t isaac_hud_rng_7e9020_shift3_off(void);
uint32_t isaac_hud_rng_7e9020_count4b_shift1(void);
uint32_t isaac_hud_rng_7e9020_count4b_shift2(void);
uint32_t isaac_hud_rng_7e9020_count4b_shift3(void);
uint32_t isaac_hud_rng_7e9020_count4b_max(void);
uint32_t isaac_hud_count_7cb6e0_field_2c_off(void);
uint32_t isaac_hud_count_7cb6e0_field_3bc_off(void);
uint32_t isaac_hud_count_7cb6e0_field_28_off(void);
uint32_t isaac_hud_count_7cb6e0_game_room_idx_off(void);
uint32_t isaac_hud_count_7cb6e0_room_field_5c_off(void);
uint32_t isaac_hud_count_7cb6e0_twin_recv_off(void);
uint32_t isaac_hud_count_7cb6e0_va_walk_gate(void);
uint32_t isaac_hud_count_7cb6e0_va_getplayer_call(void);
uint32_t isaac_hud_count_7cb6e0_va_room_call(void);
uint32_t isaac_hud_count_7cb6e0_va_rng_gate(void);
uint32_t isaac_hud_count_7cb6e0_va_rng_call(void);
uint32_t isaac_hud_count_7cb6e0_va_twin17_call(void);
uint32_t isaac_hud_count_7cb6e0_walk_iter_cap(void);
uint32_t isaac_hud_8318a0_head_candidate(uint32_t field_234_ptr, uint32_t type_28, uint32_t kind_2c);
int32_t isaac_hud_8318a0_advance_fires(uint32_t mode, uint32_t field_238, uint32_t counter, uint32_t limit);
uint32_t isaac_hud_8318a0_counter_next(uint32_t counter);
uint32_t isaac_hud_8318a0_ratio_f32_bits(uint32_t counter, uint32_t limit);
int32_t isaac_hud_8318a0_tail_stores_needed(uint32_t mode_after_body);
int32_t isaac_hud_8318a0_rewrite_needed(uint32_t field_6c, uint32_t field_7c);
int32_t isaac_hud_8318a0_player_418_next(int32_t value);
void isaac_hud_8318a0_advance_plan(uint32_t mode, uint32_t field_238, uint32_t counter, uint32_t limit, uint32_t mode_after_body, IsaacHud8318a0AdvancePlan* out);
void isaac_hud_8318a0_rewrite_plan(uint32_t field_6c, uint32_t field_7c, uint32_t receiver_limit, uint32_t player_begin, uint32_t player_end, IsaacHud8318a0RewritePlan* out);
uint32_t isaac_hud_8318a0_va_head(void);
uint32_t isaac_hud_8318a0_va_mode_gate(void);
uint32_t isaac_hud_8318a0_jump_table_va(void);
uint32_t isaac_hud_8318a0_case_va(int32_t dispatch_case);
uint32_t isaac_hud_8318a0_va_mode2_fast(void);
uint32_t isaac_hud_8318a0_va_shared_advance(void);
uint32_t isaac_hud_8318a0_va_rewrite_gate(void);
uint32_t isaac_hud_8318a0_va_common_tail(void);
uint32_t isaac_hud_8318a0_host_va_tree_walk_prep(void);
uint32_t isaac_hud_8318a0_host_va_reset(void);
uint32_t isaac_hud_8318a0_host_va_7eb1b0(void);
uint32_t isaac_hud_8318a0_host_va_mode1(void);
uint32_t isaac_hud_8318a0_counter_off(void);
uint32_t isaac_hud_8318a0_limit_off(void);
uint32_t isaac_hud_8318a0_ratio_off(void);
uint32_t isaac_hud_8318a0_field_238_off(void);
uint32_t isaac_hud_8318a0_field_6c_off(void);
uint32_t isaac_hud_8318a0_field_7c_off(void);
uint32_t isaac_hud_8318a0_game_22ed0_off(void);
uint32_t isaac_hud_8318a0_game_22ed4_off(void);
uint32_t isaac_hud_8318a0_game_22edc_off(void);
uint32_t isaac_hud_8318a0_tail_store_value(void);
uint32_t isaac_hud_8318a0_player_list_off(void);
uint32_t isaac_hud_8318a0_player_stride(void);
uint32_t isaac_hud_8318a0_player_418_off(void);
uint32_t isaac_hud_8318a0_player_418_min(void);
uint32_t isaac_hud_8318a0_rewrite_mode(void);
uint32_t isaac_hud_8318a0_game_ivar1_off(void);
uint32_t isaac_hud_8318a0_head_field_off(void);
uint32_t isaac_hud_8318a0_head_type_off(void);
uint32_t isaac_hud_8318a0_head_kind_off(void);
uint32_t isaac_hud_8318a0_head_type(void);
uint32_t isaac_hud_8318a0_head_kind(void);
uint32_t isaac_hud_post_update_pure_helpers_abi_version(void);

/* v21 (0x008318a0 mode-2 slow path): _Tree successor-walk gates. */
int32_t isaac_hud_8318a0_tree_empty(uint32_t first_addr, uint32_t head_addr);
int32_t isaac_hud_8318a0_tree_visit_gate(uint32_t gate_11d);
int32_t isaac_hud_8318a0_tree_right_is_real(uint32_t right_isnil);
int32_t isaac_hud_8318a0_tree_left_is_real(uint32_t left_isnil);
int32_t isaac_hud_8318a0_tree_climb_continue(int32_t node_is_right_child, uint32_t parent_isnil);

/* v22: the walk-ORDER plan export + its per-law pieces (0x831fa1..0x832022).
   The plan reads the tree from Wasm linear memory (absolute node addrs, same
   contract as the exit family's IsaacExitRootMapWalkPlan). */
int32_t isaac_hud_8318a0_tree_slow_gate(uint32_t field_238);
uint32_t isaac_hud_8318a0_tree_prep_receiver(uint32_t this_base);
uint32_t isaac_hud_8318a0_tree_walk_next(uint32_t node_addr);
int32_t isaac_hud_8318a0_tree_walk_continue(uint32_t node_addr, uint32_t head_addr);
uint32_t isaac_hud_8318a0_tree_visit_host_a(uint32_t node_addr);
uint32_t isaac_hud_8318a0_tree_visit_host_b(uint32_t node_addr);
void isaac_hud_8318a0_tree_walk_plan(IsaacHud8318a0TreeWalkPlan* out, uint32_t this_base);

/* Helpers ABI v24 (0x007706e0): the HasCollectible QUERY accept gate +
   composed redirect WALK. The query is invoked cdecl 0x1b7 / 0 from the
   process-input record 0x009be6b0 and its result is LOW-BYTE tested at
   0x009be71f (`test al,al`); the accept merge (0x009be719 test bl,bl /
   je skip-store) is bl != 0 && low-byte hit. The redirect walk
   (0x77070d..0x770758) loops: config = GetCollectible(p,id) (sampled —
   item-config 0x72fd10 stays the shared typed-host); config NULL ->
   FALSE; field_2c != 1 -> interior; parent [p+0x3bc] with [+0x28]==1
   adopts, else GetPlayer(0) (sampled; NULL keeps edi, 0x770739 je
   0x77076f); adopt then re-query config (0x770756 test esi,esi ; jne
   loop). Samples table 16 bytes/entry {config_known, config_result,
   gp_known, gp_result}; one entry per walk iteration. Statuses:
   0 interior (field_2c != 1) · 1 config_null (FALSE) · 2 getplayer_null
   (interior, edi unchanged) · 3 host_needed (unknown/exhausted sample) ·
   4 truncated (iter_cap adoptions). */
typedef struct IsaacHasCollectibleWalkPlan {
  int32_t status;           /* walk exit classification (enum below) */
  uint32_t resolved_player; /* final edi (interior target) */
  uint32_t config_ptr;      /* final esi config (0 when config_null) */
  int32_t iterations;       /* adoptions executed */
  int32_t host_edges;       /* sample records consumed */
  int32_t host_needed;      /* unknown/exhausted sample or truncation */
} IsaacHasCollectibleWalkPlan;

enum {
  ISAAC_HAS_COLLECTIBLE_QUERY_ARG_ID = 0x1b7,     /* 0x9be6b0 cdecl arg1 */
  ISAAC_HAS_COLLECTIBLE_QUERY_ARG_IGNORE = 0x0,   /* cdecl arg2 (ignoreModifiers byte) */
  ISAAC_HAS_COLLECTIBLE_ACCEPT_VA_BL = 0x009be719u, /* test bl,bl ; je skip-store */
  ISAAC_HAS_COLLECTIBLE_ACCEPT_VA_AL = 0x009be71fu, /* test al,al ; jne epilogue-B */
  ISAAC_HAS_COLLECTIBLE_WALK_VA_CONFIG_TEST = 0x00770712u,
  ISAAC_HAS_COLLECTIBLE_WALK_VA_F2C_GATE = 0x00770716u,
  ISAAC_HAS_COLLECTIBLE_WALK_VA_PARENT_PROBE = 0x0077071cu,
  ISAAC_HAS_COLLECTIBLE_WALK_VA_PARENT_TEST = 0x00770726u,
  ISAAC_HAS_COLLECTIBLE_WALK_VA_GETPLAYER = 0x0077072cu,
  ISAAC_HAS_COLLECTIBLE_WALK_VA_GETPLAYER_TEST = 0x00770739u,
  ISAAC_HAS_COLLECTIBLE_WALK_VA_ADOPT = 0x0077073du,
  ISAAC_HAS_COLLECTIBLE_WALK_VA_CONFIG_REFETCH = 0x0077074cu,
  ISAAC_HAS_COLLECTIBLE_WALK_VA_CONFIG_LOOP = 0x00770756u,
  ISAAC_HAS_COLLECTIBLE_WALK_VA_FALSE = 0x0077075au,
  ISAAC_HAS_COLLECTIBLE_WALK_VA_INTERIOR = 0x0077076fu,
  ISAAC_HAS_COLLECTIBLE_WALK_STATUS_INTERIOR = 0,
  ISAAC_HAS_COLLECTIBLE_WALK_STATUS_CONFIG_NULL = 1,
  ISAAC_HAS_COLLECTIBLE_WALK_STATUS_GETPLAYER_NULL = 2,
  ISAAC_HAS_COLLECTIBLE_WALK_STATUS_HOST_NEEDED = 3,
  ISAAC_HAS_COLLECTIBLE_WALK_STATUS_TRUNCATED = 4,
  ISAAC_HAS_COLLECTIBLE_WALK_ITER_CAP = 16,
  ISAAC_HAS_COLLECTIBLE_WALK_SAMPLE_STRIDE = 16
};

uint32_t isaac_has_collectible_query_arg_id(void);
uint32_t isaac_has_collectible_query_arg_ignore(void);
int32_t isaac_has_collectible_query_hit(uint32_t query_result);
int32_t isaac_has_collectible_accept_gate(uint32_t bl, uint32_t query_result);
void isaac_has_collectible_walk_plan(uint32_t player_ptr,
                                     uint32_t samples_addr,
                                     uint32_t samples_count,
                                     uint32_t iter_cap,
                                     IsaacHasCollectibleWalkPlan* out);
uint32_t isaac_has_collectible_walk_iter_cap(void);
uint32_t isaac_has_collectible_walk_sample_stride(void);
uint32_t isaac_has_collectible_accept_va_bl(void);
uint32_t isaac_has_collectible_accept_va_al(void);
uint32_t isaac_has_collectible_walk_va_config_test(void);
uint32_t isaac_has_collectible_walk_va_f2c_gate(void);
uint32_t isaac_has_collectible_walk_va_parent_probe(void);
uint32_t isaac_has_collectible_walk_va_parent_test(void);
uint32_t isaac_has_collectible_walk_va_getplayer(void);
uint32_t isaac_has_collectible_walk_va_getplayer_test(void);
uint32_t isaac_has_collectible_walk_va_adopt(void);
uint32_t isaac_has_collectible_walk_va_config_refetch(void);
uint32_t isaac_has_collectible_walk_va_config_loop(void);
uint32_t isaac_has_collectible_walk_va_false(void);
uint32_t isaac_has_collectible_walk_va_interior(void);
int32_t isaac_has_collectible_walk_status_interior(void);
int32_t isaac_has_collectible_walk_status_config_null(void);
int32_t isaac_has_collectible_walk_status_getplayer_null(void);
int32_t isaac_has_collectible_walk_status_host_needed(void);
int32_t isaac_has_collectible_walk_status_truncated(void);

/* Helpers ABI v25 (0x007706e0): the two RNG-path PREPs that consume the
   v24 RNG::RandomInt body (0x7e9020) — the ladder RNG path
   0x770a7e..0x770ad9 (count 0x7db860 x2 + extra 0x436140, cmova-seeded
   receiver {seed,1,0x1b,0x1b}, max 6, .rdata table 0xb6bcd0 compare)
   and the id==9 arm prep 0x770942..0x77095f (memory-walk seed,
   receiver {seed,1,0xb,6}, max 0x64, draw < 0x21 + Game+0x26614
   gates). Evidence: section-notes/hud-v25-rng-preps/NOTES.md. All
   leave values are samples (0x7db860, 0x436140, 0x771550, the
   g_game->[0x18300]->[4]->[0x58] walk, Game+0x26614); the RNG draw
   composes isaac_hud_rng_7e9020_random_int in-module. Gate senses:
   0x770a88 jle SIGNED (counta <= 8 closes), 0x770abc cmova UNSIGNED
   (seed = sum > 1u ? sum : 1), 0x770967 jb UNSIGNED (draw < 0x21),
   0x770979 jl SIGNED (Game+0x26614 < 2 chains), 0x770925 test al,al
   LOW-BYTE (h1550). No uint8_t params anywhere. */

/* Region A: ladder RNG path 0x770a7e..0x770ad9. The PE never fatals on
   this path: the cmova clamps seed to >= 1, so seed==0 is unreachable
   (verified with wide sums in the tests). */
typedef struct IsaacHud770a7eDraw {
  uint32_t seed; /* +0  cmova result (>= 1) feeding RandomInt */
  uint32_t draw; /* +4  RandomInt value (0..5) */
} IsaacHud770a7eDraw;

typedef struct IsaacHud770a7ePlan {
  int32_t status;     /* +0  0 closed · 1 hit · 2 miss */
  uint32_t seed;      /* +4  prepared seed (0 when closed) */
  uint32_t draw;      /* +8  RNG draw (0 when closed) */
  int32_t host_edges; /* +12 1 when closed (countA), 3 open */
} IsaacHud770a7ePlan;

/* Region B: id==9 arm 0x770915..0x770979. seed==0 (p18300_4 null) makes
   the PE RNG call int3 inside 0x7e9020: FUTAL -> no hit decision. */
typedef struct IsaacHud770915Draw {
  uint32_t draw; /* +0  RandomInt value (0..0x63), 0 on fatal */
  int32_t fatal; /* +4  1 when seed==0 (PE int3; no compare runs) */
} IsaacHud770915Draw;

typedef struct IsaacHud770915Plan {
  int32_t status;     /* +0  0 closed · 1 h1550_false · 2 fatal
                             · 3 hit · 4 miss_true · 5 miss_chain */
  uint32_t seed;      /* +4  prepared seed */
  uint32_t draw;      /* +8  RNG draw (0 on fatal/closed) */
  int32_t hit_draw;   /* +12 draw < 0x21 (jb) */
  int32_t tail_true;  /* +16 (int32)Game+0x26614 >= 2 (jl skip) */
  int32_t result;     /* +20 1 iff hit_draw || tail_true (TRUE exits) */
} IsaacHud770915Plan;

enum {
  ISAAC_HUD_770A7E_VA = 0x00770a7eu,          /* path entry */
  ISAAC_HUD_770A7E_VA_COUNT_A_CALL = 0x00770a80u, /* call 0x7db860 */
  ISAAC_HUD_770A7E_VA_OPEN_CMP = 0x00770a85u, /* cmp eax,8 */
  ISAAC_HUD_770A7E_VA_OPEN_JLE = 0x00770a88u, /* jle 0x770ae2 (SIGNED) */
  ISAAC_HUD_770A7E_VA_EXTRA_CALL = 0x00770a96u, /* call 0x436140 */
  ISAAC_HUD_770A7E_VA_COUNT_B_CALL = 0x00770a9fu, /* 0x7db860 re-call */
  ISAAC_HUD_770A7E_VA_SEED_ADD = 0x00770aacu,  /* add eax,esi (wrap) */
  ISAAC_HUD_770A7E_VA_CMOVA = 0x00770abcu,     /* cmova ecx,eax (UNSIGNED) */
  ISAAC_HUD_770A7E_VA_RNG_CALL = 0x00770acdu,  /* call 0x7e9020 (v24 law) */
  ISAAC_HUD_770A7E_VA_TABLE_CMP = 0x00770ad2u, /* cmp ebx,table[eax*4] */
  ISAAC_HUD_770A7E_VA_TABLE_JE = 0x00770ad9u,  /* je 0x770c29 TRUE */
  ISAAC_HUD_770A7E_VA_MISS = 0x00770adfu,      /* tail fall-through */
  ISAAC_HUD_770A7E_VA_TAIL = 0x00770ae2u,      /* 0x771200 gate (host) */
  ISAAC_HUD_770A7E_VA_TRUE = 0x00770c29u,      /* TRUE epilogue */
  ISAAC_HUD_770A7E_HOST_VA_COUNT = 0x007db860u,  /* 0x7db860 count */
  ISAAC_HUD_770A7E_HOST_VA_EXTRA = 0x00436140u,  /* 0x436140 extra */
  ISAAC_HUD_770A7E_GAME_GLOBAL = 0x00c71678u,    /* g_game */
  ISAAC_HUD_770A7E_GAME_EXTRA_OFF = 0x1bb84u,    /* &g_game->[0x1bb84] */
  ISAAC_HUD_770A7E_SHIFTS_CONST_VA = 0x00b1f528u, /* qword {1,0x1b} */
  ISAAC_HUD_770A7E_SHIFT3_CONST_VA = 0x00b1f530u, /* dword 0x1b */
  ISAAC_HUD_770A7E_SHIFT1 = 1,                 /* receiver state[1] */
  ISAAC_HUD_770A7E_SHIFT2 = 0x1b,              /* receiver state[2] */
  ISAAC_HUD_770A7E_SHIFT3 = 0x1b,              /* receiver state[3] */
  ISAAC_HUD_770A7E_MAX = 6,                    /* push 6 */
  ISAAC_HUD_770A7E_CMOVA_MIN = 1,              /* cmova lower bound */
  ISAAC_HUD_770A7E_OPEN_GT = 8,                /* cmp eax,8 ; jle */
  ISAAC_HUD_770A7E_TABLE_VA = 0x00b6bcd0u,
  ISAAC_HUD_770A7E_TABLE_SIZE = 6,             /* draw in [0,6) */
  ISAAC_HUD_770A7E_TABLE_0 = 0x131,
  ISAAC_HUD_770A7E_TABLE_1 = 0x3,
  ISAAC_HUD_770A7E_TABLE_2 = 0x23a,
  ISAAC_HUD_770A7E_TABLE_3 = 0x101,
  ISAAC_HUD_770A7E_TABLE_4 = 0x254,
  ISAAC_HUD_770A7E_TABLE_5 = 0xe0,
  ISAAC_HUD_770A7E_TABLE_OOB = 0xffffffffu,    /* visible sentinel */
  ISAAC_HUD_770A7E_STATUS_CLOSED = 0,
  ISAAC_HUD_770A7E_STATUS_HIT = 1,
  ISAAC_HUD_770A7E_STATUS_MISS = 2,
  ISAAC_HUD_770915_VA_ARM = 0x00770915u,       /* cmp ebx,9 */
  ISAAC_HUD_770915_VA_ID_JNE = 0x00770918u,    /* jne 0x770994 */
  ISAAC_HUD_770915_VA_1550_CALL = 0x00770920u, /* call 0x771550(_,0x5d,0) */
  ISAAC_HUD_770915_VA_1550_TEST = 0x00770925u, /* test al,al (LOW-BYTE) */
  ISAAC_HUD_770915_VA_1550_FALSE_CHAIN = 0x00770927u, /* je 0x770a44 */
  ISAAC_HUD_770915_VA_SEED_LOAD = 0x0077092du, /* g_game -> [0x18300] */
  ISAAC_HUD_770915_VA_SEED_JE = 0x0077093du,   /* je 0x770942 (p4==0) */
  ISAAC_HUD_770915_VA_PREP = 0x00770942u,      /* movq [0xb1f4f8] */
  ISAAC_HUD_770915_VA_SHIFT3_LOAD = 0x00770950u, /* dword [0xb1f500] */
  ISAAC_HUD_770915_VA_RNG_CALL = 0x0077095fu,  /* call 0x7e9020 (v24 law) */
  ISAAC_HUD_770915_VA_HIT_CMP = 0x00770964u,   /* cmp eax,0x21 */
  ISAAC_HUD_770915_VA_HIT_JB = 0x00770967u,    /* jb 0x770c29 (UNSIGNED) */
  ISAAC_HUD_770915_GATE2_JL = 0x00770979u,      /* gate2 jl (signed) */
  ISAAC_HUD_770915_VA_GATE2_LOAD = 0x0077096du, /* g_game */
  ISAAC_HUD_770915_VA_GATE2_CMP = 0x00770972u, /* cmp [eax+0x26614],2 */
  ISAAC_HUD_770915_VA_GATE2_JL = 0x00770979u,  /* jl 0x770a44 (SIGNED) */
  ISAAC_HUD_770915_VA_TRUE = 0x00770c29u,      /* TRUE epilogue */
  ISAAC_HUD_770915_VA_CHAIN = 0x00770a44u,     /* 0x7db8d0 resolve chain */
  ISAAC_HUD_770915_HOST_VA_1550 = 0x00771550u, /* v17-narrowed 0x771550 */
  ISAAC_HUD_770915_ARM_ID = 9,                 /* cmp ebx,9 (full dword) */
  ISAAC_HUD_770915_ARG_ID = 0x5d,              /* 0x771550 arg1 */
  ISAAC_HUD_770915_ARG_FLAG = 0,               /* 0x771550 arg2 */
  ISAAC_HUD_770915_GAME_GLOBAL = 0x00c71678u,
  ISAAC_HUD_770915_GAME_P18300_OFF = 0x18300u,
  ISAAC_HUD_770915_GAME_P18300_P4_OFF = 4u,    /* [p18300+4] unconditional */
  ISAAC_HUD_770915_GAME_P18300_P4_58_OFF = 0x58u, /* [+0x58] iff p4 != 0 */
  ISAAC_HUD_770915_GAME_26614_OFF = 0x26614u,
  ISAAC_HUD_770915_SHIFTS_CONST_VA = 0x00b1f4f8u, /* qword {1,0xb} */
  ISAAC_HUD_770915_SHIFT3_CONST_VA = 0x00b1f500u, /* dword 6 */
  ISAAC_HUD_770915_SHIFT1 = 1,
  ISAAC_HUD_770915_SHIFT2 = 0xb,
  ISAAC_HUD_770915_SHIFT3 = 6,
  ISAAC_HUD_770915_MAX = 0x64,                 /* push 0x64 */
  ISAAC_HUD_770915_HIT_THRESHOLD = 0x21,       /* draw < 0x21 (jb) */
  ISAAC_HUD_770915_GATE2_THRESHOLD = 2,        /* field >= 2 (jl) */
  ISAAC_HUD_770915_STATUS_CLOSED = 0,
  ISAAC_HUD_770915_STATUS_H1550_FALSE = 1,
  ISAAC_HUD_770915_STATUS_FATAL = 2,
  ISAAC_HUD_770915_STATUS_HIT = 3,
  ISAAC_HUD_770915_STATUS_MISS_TRUE = 4,
  ISAAC_HUD_770915_STATUS_MISS_CHAIN = 5
};

int32_t isaac_hud_770a7e_open(uint32_t count_a);
uint32_t isaac_hud_770a7e_seed(uint32_t count_b, uint32_t extra);
void isaac_hud_770a7e_draw(uint32_t count_b, uint32_t extra,
                           IsaacHud770a7eDraw* out);
void isaac_hud_770a7e_plan(uint32_t id, uint32_t count_a, uint32_t count_b,
                           uint32_t extra, IsaacHud770a7ePlan* out);
uint32_t isaac_hud_770a7e_table_entry(uint32_t index);
uint32_t isaac_hud_770a7e_table_va(void);
uint32_t isaac_hud_770a7e_table_size(void);
uint32_t isaac_hud_770a7e_va(void);
uint32_t isaac_hud_770a7e_va_open_gate(void);
uint32_t isaac_hud_770a7e_va_jle(void);
uint32_t isaac_hud_770a7e_va_count_a_call(void);
uint32_t isaac_hud_770a7e_va_extra_call(void);
uint32_t isaac_hud_770a7e_va_count_b_call(void);
uint32_t isaac_hud_770a7e_va_rng_call(void);
uint32_t isaac_hud_770a7e_va_table_cmp(void);
uint32_t isaac_hud_770a7e_va_table_je(void);
uint32_t isaac_hud_770a7e_va_miss(void);
uint32_t isaac_hud_770a7e_va_tail(void);
uint32_t isaac_hud_770a7e_va_true(void);
uint32_t isaac_hud_770a7e_host_va_count(void);
uint32_t isaac_hud_770a7e_host_va_extra(void);
uint32_t isaac_hud_770a7e_game_global(void);
uint32_t isaac_hud_770a7e_game_extra_off(void);
uint32_t isaac_hud_770a7e_shifts_const_va(void);
uint32_t isaac_hud_770a7e_shift3_const_va(void);
uint32_t isaac_hud_770a7e_shift1(void);
uint32_t isaac_hud_770a7e_shift2(void);
uint32_t isaac_hud_770a7e_shift3(void);
uint32_t isaac_hud_770a7e_max(void);
uint32_t isaac_hud_770a7e_cmova_min(void);
uint32_t isaac_hud_770a7e_open_gt(void);
int32_t isaac_hud_770a7e_status_closed(void);
int32_t isaac_hud_770a7e_status_hit(void);
int32_t isaac_hud_770a7e_status_miss(void);
int32_t isaac_hud_770915_open(uint32_t id, uint32_t h1550_result);
uint32_t isaac_hud_770915_seed(uint32_t p18300_4, uint32_t p18300_4_58);
void isaac_hud_770915_draw(uint32_t seed, IsaacHud770915Draw* out);
int32_t isaac_hud_770915_hit(uint32_t draw);
int32_t isaac_hud_770915_tail_gate(uint32_t game_26614);
void isaac_hud_770915_plan(uint32_t id, uint32_t h1550_result,
                           uint32_t p18300_4, uint32_t p18300_4_58,
                           uint32_t game_26614, IsaacHud770915Plan* out);
uint32_t isaac_hud_770915_va(void);
uint32_t isaac_hud_770915_va_id_jne(void);
uint32_t isaac_hud_770915_va_1550_call(void);
uint32_t isaac_hud_770915_va_1550_test(void);
uint32_t isaac_hud_770915_va_1550_false_chain(void);
uint32_t isaac_hud_770915_va_seed_load(void);
uint32_t isaac_hud_770915_va_seed_je(void);
uint32_t isaac_hud_770915_va_prep(void);
uint32_t isaac_hud_770915_va_shift3_load(void);
uint32_t isaac_hud_770915_va_rng_call(void);
uint32_t isaac_hud_770915_va_hit_cmp(void);
uint32_t isaac_hud_770915_va_hit_jb(void);
uint32_t isaac_hud_770915_va_gate2_load(void);
uint32_t isaac_hud_770915_va_gate2_cmp(void);
uint32_t isaac_hud_770915_va_gate2_jl(void);
uint32_t isaac_hud_770915_va_true(void);
uint32_t isaac_hud_770915_host_va_1550(void);
uint32_t isaac_hud_770915_game_global(void);
uint32_t isaac_hud_770915_game_p18300_off(void);
uint32_t isaac_hud_770915_game_p18300_p4_off(void);
uint32_t isaac_hud_770915_game_p18300_p4_58_off(void);
uint32_t isaac_hud_770915_game_26614_off(void);
uint32_t isaac_hud_770915_shifts_const_va(void);
uint32_t isaac_hud_770915_shift3_const_va(void);
uint32_t isaac_hud_770915_shift1(void);
uint32_t isaac_hud_770915_shift2(void);
uint32_t isaac_hud_770915_shift3(void);
uint32_t isaac_hud_770915_max(void);
uint32_t isaac_hud_770915_arm_id(void);
uint32_t isaac_hud_770915_arg_id(void);
uint32_t isaac_hud_770915_arg_flag(void);
uint32_t isaac_hud_770915_hit_threshold(void);
uint32_t isaac_hud_770915_gate2_threshold(void);
int32_t isaac_hud_770915_status_closed(void);
int32_t isaac_hud_770915_status_h1550_false(void);
int32_t isaac_hud_770915_status_fatal(void);
int32_t isaac_hud_770915_status_hit(void);
int32_t isaac_hud_770915_status_miss_true(void);
int32_t isaac_hud_770915_status_miss_chain(void);

/* Helpers ABI v26 (0x007706e0): the tail true-chain window after the
   0x770ae2 0x771200 tail gate — the scalar [p+0x1fb8]==id gate
   0x770ba1..0x770bad (FULL-dword equality behind a full-dword zero
   test; pure) plus the pure DECISION laws of every sampled tail gate
   recorded by the v25 handoff (0x170/0x202c/0x1f84 byte/dword
   pre-gates, 0x9e0650 jg, 0x9305f0 low-byte, 0x7911c0 jns, 0xbf
   recursion low-byte + [p+0x1390], 0x1e8 low-byte + [p+0x1388]).
   Evidence: section-notes/hud-v26-next/NOTES.md; cpu-dump/007706e0.txt.
   Host leaves stay samples (0x557b00, 0x9e0650, 0x7307b0, 0x9305f0 x2,
   0x7911c0, the 0x7706e0 recursion, 0x771200, the 0x5b1500 pair, and
   the field samples). Gate senses: 0x770b9b/0x770bbd jg and 0x770be9
   jns are SIGNED (i64 sign-extend form, wide case 0xffffffff tested);
   0x770bdb/0x770c01/0x770c1d test al,al are LOW-BYTE (& 0xff — 0x100
   is false); 0x770b0c/0x770b45 are low-byte gates, 0x770b70 is a FULL
   dword zero test. The 0x770c3e counter epilogue (0x2ef4/0x2ef0/
   0x16c8, setg > 1 / > 0) is the next frontier. No uint8_t params. */

enum {
  ISAAC_HUD_770BA1_VA_GATE = 0x00770ba1u,  /* mov eax,[edi+0x1fb8] */
  ISAAC_HUD_770BA1_VA_TEST = 0x00770ba7u,  /* test eax,eax */
  ISAAC_HUD_770BA1_VA_JE = 0x00770ba9u,    /* je 0x770baf (p==0 skip) */
  ISAAC_HUD_770BA1_VA_CMP = 0x00770babu,   /* cmp eax,ebx (full dword) */
  ISAAC_HUD_770BA1_VA_JE_TRUE = 0x00770badu, /* je 0x770c29 (TRUE) */
  ISAAC_HUD_770BA1_VA_JG_9E0650 = 0x00770bbdu, /* jg 0x770c29 (SIGNED > 0) */
  ISAAC_HUD_770BA1_VA_JNS_7911C0 = 0x00770be9u, /* jns 0x770c29 (SIGNED >= 0) */
  ISAAC_HUD_770BA1_VA_JG_557B00 = 0x00770b9bu,  /* jg 0x770c29 (SIGNED > 0) */
  ISAAC_HUD_770BA1_VA_CMP_557B00 = 0x00770b95u, /* cmp dword [eax+0x14],0 */
  ISAAC_HUD_770BA1_VA_JE_1390 = 0x00770c0bu,  /* je 0x770c29 (field eq) */
  ISAAC_HUD_770BA1_VA_CMP_1390 = 0x00770c05u, /* cmp ebx,[edi+0x1390] */
  ISAAC_HUD_770BA1_VA_JE_1388 = 0x00770c27u,  /* jne 0x770c3e (field eq) */
  ISAAC_HUD_770BA1_VA_CMP_1388 = 0x00770c21u, /* cmp ebx,[edi+0x1388] */
  ISAAC_HUD_770BA1_VA_TEST_9305F0 = 0x00770bdbu, /* test al,al (LOW-BYTE) */
  ISAAC_HUD_770BA1_VA_TEST_REC = 0x00770c01u,  /* test al,al (LOW-BYTE) */
  ISAAC_HUD_770BA1_VA_TEST_1E8 = 0x00770c1du,  /* test al,al (LOW-BYTE) */
  ISAAC_HUD_770BA1_VA_GATE_170 = 0x00770b0cu,  /* byte gate 0x170 */
  ISAAC_HUD_770BA1_VA_GATE_202C = 0x00770b45u, /* byte gate 0x202c */
  ISAAC_HUD_770BA1_VA_GATE_1F84 = 0x00770b70u, /* dword gate 0x1f84 */
  ISAAC_HUD_770BA1_VA_TRUE = 0x00770c29u,    /* TRUE epilogue */
  ISAAC_HUD_770BA1_VA_COUNTER_EPILOGUE = 0x00770c3eu, /* next frontier */
  ISAAC_HUD_770BA1_OFF_1FB8 = 0x1fb8u,       /* scalar gate field */
  ISAAC_HUD_770BA1_OFF_170 = 0x170u,         /* byte gate 1 */
  ISAAC_HUD_770BA1_OFF_202C = 0x202cu,       /* byte gate 2 */
  ISAAC_HUD_770BA1_OFF_1F84 = 0x1f84u,       /* dword gate */
  ISAAC_HUD_770BA1_OFF_1F80 = 0x1f80u,       /* 0x557b00 receiver base */
  ISAAC_HUD_770BA1_OFF_1FC8 = 0x1fc8u,       /* 0x9e0650 receiver base */
  ISAAC_HUD_770BA1_OFF_1508 = 0x1508u,       /* 0x9305f0 receiver base */
  ISAAC_HUD_770BA1_OFF_1390 = 0x1390u,       /* recursion id field */
  ISAAC_HUD_770BA1_OFF_1388 = 0x1388u,       /* 0x1e8 arm id field */
  ISAAC_HUD_770BA1_OFF_1E6C = 0x1e6cu,       /* 0x76-arm recursion ptr */
  ISAAC_HUD_770BA1_ELEM_14_OFF = 0x14u,      /* 0x557b00 element cmp */
  ISAAC_HUD_770BA1_HOST_VA_9E0650 = 0x009e0650u,
  ISAAC_HUD_770BA1_HOST_VA_557B00 = 0x00557b00u,
  ISAAC_HUD_770BA1_HOST_VA_9305F0 = 0x009305f0u,
  ISAAC_HUD_770BA1_HOST_VA_7307B0 = 0x007307b0u,
  ISAAC_HUD_770BA1_HOST_VA_7911C0 = 0x007911c0u,
  ISAAC_HUD_770BA1_HOST_VA_771200 = 0x00771200u,
  ISAAC_HUD_770BA1_REC_ID = 0xbfu,           /* recursive 0x7706e0 arg */
  ISAAC_HUD_770BA1_ID_1E8 = 0x1e8u,          /* 0x9305f0 arg */
  ISAAC_HUD_770BA1_REC_FLAG = 0              /* recursive 0x7706e0 flag */
};

int32_t isaac_hud_770ba1_scalar_gate(uint32_t p_1fb8, uint32_t id);
int32_t isaac_hud_770ba1_gate_170(uint32_t byte_170);
int32_t isaac_hud_770ba1_gate_202c(uint32_t byte_202c);
int32_t isaac_hud_770ba1_gate_1f84(uint32_t p_1f84);
int32_t isaac_hud_770ba1_elem_557b00_open(uint32_t field_14);
int32_t isaac_hud_770ba1_9e0650_open(uint32_t host_result);
int32_t isaac_hud_770ba1_9305f0_open(uint32_t host_result);
int32_t isaac_hud_770ba1_7911c0_open(uint32_t host_result);
int32_t isaac_hud_770ba1_bf_recursive_open(uint32_t host_result);
int32_t isaac_hud_770ba1_9305f0_1e8_open(uint32_t host_result);
int32_t isaac_hud_770ba1_field_1390_eq(uint32_t p_1390, uint32_t id);
int32_t isaac_hud_770ba1_field_1388_eq(uint32_t p_1388, uint32_t id);
uint32_t isaac_hud_770ba1_va_gate(void);
uint32_t isaac_hud_770ba1_va_test(void);
uint32_t isaac_hud_770ba1_va_je(void);
uint32_t isaac_hud_770ba1_va_cmp(void);
uint32_t isaac_hud_770ba1_va_je_true(void);
uint32_t isaac_hud_770ba1_va_jg_9e0650(void);
uint32_t isaac_hud_770ba1_va_jns_7911c0(void);
uint32_t isaac_hud_770ba1_va_jg_557b00(void);
uint32_t isaac_hud_770ba1_va_cmp_557b00(void);
uint32_t isaac_hud_770ba1_va_je_1390(void);
uint32_t isaac_hud_770ba1_va_cmp_1390(void);
uint32_t isaac_hud_770ba1_va_je_1388(void);
uint32_t isaac_hud_770ba1_va_cmp_1388(void);
uint32_t isaac_hud_770ba1_va_test_9305f0(void);
uint32_t isaac_hud_770ba1_va_test_rec(void);
uint32_t isaac_hud_770ba1_va_test_1e8(void);
uint32_t isaac_hud_770ba1_va_gate_170(void);
uint32_t isaac_hud_770ba1_va_gate_202c(void);
uint32_t isaac_hud_770ba1_va_gate_1f84(void);
uint32_t isaac_hud_770ba1_va_true(void);
uint32_t isaac_hud_770ba1_va_counter_epilogue(void);
uint32_t isaac_hud_770ba1_off_1fb8(void);
uint32_t isaac_hud_770ba1_off_170(void);
uint32_t isaac_hud_770ba1_off_202c(void);
uint32_t isaac_hud_770ba1_off_1f84(void);
uint32_t isaac_hud_770ba1_off_1f80(void);
uint32_t isaac_hud_770ba1_off_1fc8(void);
uint32_t isaac_hud_770ba1_off_1508(void);
uint32_t isaac_hud_770ba1_off_1390(void);
uint32_t isaac_hud_770ba1_off_1388(void);
uint32_t isaac_hud_770ba1_off_1e6c(void);
uint32_t isaac_hud_770ba1_elem_14_off(void);
uint32_t isaac_hud_770ba1_host_va_9e0650(void);
uint32_t isaac_hud_770ba1_host_va_557b00(void);
uint32_t isaac_hud_770ba1_host_va_9305f0(void);
uint32_t isaac_hud_770ba1_host_va_7307b0(void);
uint32_t isaac_hud_770ba1_host_va_7911c0(void);
uint32_t isaac_hud_770ba1_host_va_771200(void);
uint32_t isaac_hud_770ba1_rec_id(void);
uint32_t isaac_hud_770ba1_id_1e8(void);
uint32_t isaac_hud_770ba1_rec_flag(void);

/* Helpers ABI v27 (0x00770c3e): the HasCollectible counter epilogue
   0x770c3e..0x770c92 — the function's LAST block (ret 8, 0x770c95 int3
   padding). Machine order: held_id = dword[p+0x2ef4]; if held_id != 0
   (FULL dword test) && id == held_id (FULL dword cmp) && byte[p+0x2ef0]
   == 0 (LOW-BYTE): result = (int32)[table+id*4] > 1 (path A, STRICT);
   else result = (int32)[table+id*4] > 0 (path B, LOOSE); table =
   dword[p+0x16c8], index [eax+ebx*4] full 32-bit scaled. Both compares
   are cmp dword,imm ; setg — SIGNED (i64 sign-extend form, wide case
   0xffffffff tested). Also lands the COMPOSED region-C tail plan
   (0x770b0c..0x770c27 from ABI v26 + this epilogue) as
   IsaacHud770c3eTailPlan: machine-order chain over the v26 gate laws
   (TRUE exit 0x770c29 / FALSE exit 0x77075a via the 0x202c-arm
   id != 0x216 check / epilogue), host leaves stay samples (v17/v19
   known/unknown pairs, host_edge_count), exit_kind + epilogue_strict +
   result/result_known/host_needed/pure_complete. Evidence:
   section-notes/hud-v27-770c3e/NOTES.md; cpu-dump/007706e0.txt
   (0x770c3e..0x770c92). No uint8_t params. */

enum {
  ISAAC_HUD_770C3E_VA_HEAD = 0x00770c3eu,   /* mov eax,[edi+0x2ef4] */
  ISAAC_HUD_770C3E_VA_TEST_HELD = 0x00770c44u, /* test eax,eax */
  ISAAC_HUD_770C3E_VA_JE_HELD = 0x00770c46u, /* je 0x770c75 (path B) */
  ISAAC_HUD_770C3E_VA_CMP_HELD = 0x00770c48u, /* cmp ebx,eax (full dword) */
  ISAAC_HUD_770C3E_VA_JNE_HELD = 0x00770c4au, /* jne 0x770c75 (path B) */
  ISAAC_HUD_770C3E_VA_CMP_BYTE = 0x00770c4cu, /* cmp byte [edi+0x2ef0],0 */
  ISAAC_HUD_770C3E_VA_JNE_BYTE = 0x00770c53u, /* jne 0x770c75 (path B) */
  ISAAC_HUD_770C3E_VA_TABLE_LOAD = 0x00770c55u, /* mov eax,[edi+0x16c8] */
  ISAAC_HUD_770C3E_VA_CMP_1 = 0x00770c5du,  /* cmp dword [eax+ebx*4],1 */
  ISAAC_HUD_770C3E_VA_SETG_1 = 0x00770c62u, /* setg al (SIGNED > 1) */
  ISAAC_HUD_770C3E_VA_PATH_B = 0x00770c75u, /* mov eax,[edi+0x16c8] */
  ISAAC_HUD_770C3E_VA_CMP_0 = 0x00770c80u,  /* cmp dword [eax+ebx*4],0 */
  ISAAC_HUD_770C3E_VA_SETG_0 = 0x00770c85u, /* setg al (SIGNED > 0) */
  ISAAC_HUD_770C3E_VA_RET = 0x00770c92u,    /* ret 8 */
  ISAAC_HUD_770C3E_VA_TRUE = 0x00770c29u,   /* region-C TRUE epilogue */
  ISAAC_HUD_770C3E_VA_FALSE_216 = 0x00770b64u, /* cmp ebx,0x216 ; jne FALSE */
  ISAAC_HUD_770C3E_VA_FALSE = 0x0077075au,  /* al=0 return */
  ISAAC_HUD_770C3E_VA_REGION_C = 0x00770b0cu, /* region-C head (plan entry) */
  ISAAC_HUD_770C3E_HELD_ID_OFF = 0x2ef4u,   /* held id dword */
  ISAAC_HUD_770C3E_HELD_FLAG_OFF = 0x2ef0u, /* held byte gate */
  ISAAC_HUD_770C3E_TABLE_OFF = 0x16c8u,     /* count table ptr */
  ISAAC_HUD_770C3E_STRICT_THRESHOLD = 1,    /* path A compare imm */
  ISAAC_HUD_770C3E_LOOSE_THRESHOLD = 0,     /* path B compare imm */
  ISAAC_HUD_770C3E_ID_216 = 0x216u,         /* 0x202c-arm false-exit id */
  ISAAC_HUD_770C3E_ARM170_FLAG = 0x40000000u, /* 0x5b1500 arg (0x170 arm) */
  ISAAC_HUD_770C3E_ARM202C_FLAG = 0x8000u,  /* 0x5b1500 arg (0x202c arm) */
  ISAAC_HUD_770C3E_HOST_VA_5B1500 = 0x005b1500u,
  ISAAC_HUD_770C3E_EXIT_EPILOGUE = 0,       /* epilogue computes result */
  ISAAC_HUD_770C3E_EXIT_TRUE = 1,           /* 0x770c29, al=1 */
  ISAAC_HUD_770C3E_EXIT_FALSE_216 = 2       /* 0x77075a, al=0 */
};

/* Composed region-C + counter-epilogue tail plan (helpers ABI v27). See
   the v27 doc block; gate laws reused from ABI v26. */
typedef struct IsaacHud770c3eTailPlan {
  int32_t gate_170;         /* +0x0  LOW(byte_170) != 0 (0x770b0c) */
  int32_t gate_202c;        /* +0x4  LOW(byte_202c) != 0 (0x770b45) */
  int32_t gate_1f84;        /* +0x8  p_1f84 != 0 FULL dword (0x770b70) */
  int32_t scalar_hit;       /* +0xc  p_1fb8 != 0 && p_1fb8 == id (pure) */
  int32_t arm_170_active;   /* +0x10 gate_170 && cfg != 0 (ra edge) */
  int32_t arm_202c_active;  /* +0x14 gate_202c && cfg != 0 (rc edge) */
  int32_t elem_arm;         /* +0x18 gate_1f84 (0x557b00 edge) */
  int32_t pair_active;      /* +0x1c cfg != 0 (0x7307b0/0x9305f0 pair) */
  int32_t rec_bf_active;    /* +0x20 id != 0xbf (recursion edge) */
  int32_t exit_kind;        /* +0x24 0 EPILOGUE · 1 TRUE · 2 FALSE_216 */
  int32_t epilogue_strict;  /* +0x28 D1 over held samples */
  int32_t result;           /* +0x2c final 0/1 */
  int32_t result_known;     /* +0x30 1 iff all required samples known */
  int32_t host_needed;      /* +0x34 1 iff a required sample is unknown */
  int32_t host_edge_count;  /* +0x38 host calls the PE would make */
  int32_t pure_complete;    /* +0x3c == result_known */
} IsaacHud770c3eTailPlan;

int32_t isaac_hud_770c3e_strict(uint32_t held_id, uint32_t id,
                                uint32_t held_flag);
int32_t isaac_hud_770c3e_count_gt_1(uint32_t count);
int32_t isaac_hud_770c3e_count_gt_0(uint32_t count);
int32_t isaac_hud_770c3e_result(int32_t strict, uint32_t count);
uint32_t isaac_hud_770c3e_table_addr(uint32_t table, uint32_t id);
void isaac_hud_770c3e_tail_plan(
    uint32_t id,
    uint32_t byte_170,
    uint32_t byte_202c,
    uint32_t p_1f84,
    uint32_t cfg,
    uint32_t twin,
    int32_t ra_known, uint32_t ra,
    int32_t rb_known, uint32_t rb,
    int32_t rc_known, uint32_t rc,
    int32_t elem_known, uint32_t resolved_elem, uint32_t elem_14,
    uint32_t p_1f80,
    uint32_t p_1fb8,
    int32_t r1_known, uint32_t r1,
    int32_t r2_known, uint32_t r2,
    int32_t r3_known, uint32_t r3,
    int32_t r4_known, uint32_t r4,
    int32_t r5_known, uint32_t r5,
    uint32_t p_1390,
    int32_t r6_known, uint32_t r6,
    uint32_t p_1388,
    uint32_t held_id,
    uint32_t held_flag,
    int32_t count,
    IsaacHud770c3eTailPlan* out);
uint32_t isaac_hud_770c3e_va_head(void);
uint32_t isaac_hud_770c3e_va_test_held(void);
uint32_t isaac_hud_770c3e_va_je_held(void);
uint32_t isaac_hud_770c3e_va_cmp_held(void);
uint32_t isaac_hud_770c3e_va_jne_held(void);
uint32_t isaac_hud_770c3e_va_cmp_byte(void);
uint32_t isaac_hud_770c3e_va_jne_byte(void);
uint32_t isaac_hud_770c3e_va_table_load(void);
uint32_t isaac_hud_770c3e_va_cmp_1(void);
uint32_t isaac_hud_770c3e_va_setg_1(void);
uint32_t isaac_hud_770c3e_va_path_b(void);
uint32_t isaac_hud_770c3e_va_cmp_0(void);
uint32_t isaac_hud_770c3e_va_setg_0(void);
uint32_t isaac_hud_770c3e_va_ret(void);
uint32_t isaac_hud_770c3e_va_true(void);
uint32_t isaac_hud_770c3e_va_false_216(void);
uint32_t isaac_hud_770c3e_va_false(void);
uint32_t isaac_hud_770c3e_va_region_c(void);
uint32_t isaac_hud_770c3e_held_id_off(void);
uint32_t isaac_hud_770c3e_held_flag_off(void);
uint32_t isaac_hud_770c3e_table_off(void);
uint32_t isaac_hud_770c3e_strict_threshold(void);
uint32_t isaac_hud_770c3e_loose_threshold(void);
uint32_t isaac_hud_770c3e_id_216(void);
uint32_t isaac_hud_770c3e_arm170_flag(void);
uint32_t isaac_hud_770c3e_arm202c_flag(void);
uint32_t isaac_hud_770c3e_host_va_5b1500(void);
int32_t isaac_hud_770c3e_exit_epilogue(void);
int32_t isaac_hud_770c3e_exit_true(void);
int32_t isaac_hud_770c3e_exit_false_216(void);

/* Helpers ABI v29 (0x00771410): the 0x2dd id-walk loop — the LAST
   un-narrowed region-C structure (v28 handoff). PACKED TRUE START
   (0x77140d..0x77140f int3 pads; 0x00771410..0x00771545 ret 0;
   identify-zhl: no exact match; next function 0x771550 is v17-lawed).
   Per iteration (LOOP HEAD 0x771420): r1 = 0x771200(player, id, dead
   flag) is a HOST sample; LOW(r1) (test al,al 0x771429) selects
   PATH A (0x77142d) vs PATH B (0x7714a8).
   PATH A: edition arm iff dword[g_game+0x26584] != 0x2b (FULL dword
   0x771432); then host 0x733ff0(g_game+0x1a740, 0x126, 0, 0) iff id
   == 0x1e4 (FULL dword 0x771441); then THE ONE observable store iff
   id UNSIGNED < dword[g_game+0x1a740+0x688] (jae 0x77145f):
   *word |= 1 << (id & 0x1f) at word_ptr = dword[g_game+0x1a740+0x67c]
   + (id >> 5) * 4 (bts 0x771476, store 0x771479). THEN ALWAYS (path
   A only) the room fire: room_count = sar(end-begin, 2) over
   [room+0x2a404]/[0x2a408] (0x77148e); host 0x75d1d0(player,
   begin[id], 0) iff (int32)id < (int32)room_count (SIGNED jge
   0x771493) && begin[id] != 0 (FULL dword 0x771498).
   PATH B: 0x7706e0(player, id, 0) host edge ALWAYS (the second
   0x771200 call at 0x7714ac is effect-DEAD — its result is never
   tested); LOW(r3) (0x7714bb) and LOW(r4) (0x7714cb) byte gates
   skip; then 0x72fd10(&room[0x2a404], id) host edge; host
   0x75d850(player, r5) iff r5 != 0 (FULL dword 0x7714e1).
   Walk bound: inc esi ; cmp esi,0x2dd ; jl 0x771420 (0x7714f4 —
   SIGNED; wasm32 compare-flip class: the i64 sign-extend form
   (int64_t)(int32_t)id < 0x2dd).
   Tail (mode == 5, FULL dword 0x7714fa): host 0x75d850(player, arg)
   with arg = (int32)((end-begin) & 0xfffffffc) > 0x1e8 (SIGNED jg
   0x77151e) ? dword[begin+0x1e8] (sample, loaded at 0x771531 ONLY
   when the gate opens) : 0 (0x771520). mode != 5 -> NO tail edge.
   Evidence: section-notes/hud-v29-771410/NOTES.md; cpu-dump/
   00771410.txt + 0077153f.txt. No uint8_t params. */

/* Helpers ABI v28 (0x00771200 + the 0x770ae2 tail gate): the last
   un-narrowed region-C predecessor of HasCollectible 0x007706e0. The
   gate at 0x770ae2 calls 0x771200(player, id, flag) — flag is a DEAD
   param (stale ecx from the RNG call, never read) — then `test al,al`
   LOW-BYTE -> TRUE exit 0x770c29; else id == 0x76 (FULL dword) opens
   the 0x9305f0(&player->[0x1508], 0x76) arm (LOW-BYTE -> TRUE); else
   falls into region C (0x770b0c, v26/v27 lawed). The 0x771200 body
   (0x00771200..0x0077140a, ret 8): the find preamble (room vector
   [0x4b3d8]/[0x4b3dc] emptiness, the 0x731ee0 pair-find over
   &room->[0x4c440], the record byte[+0xd]/u64 pair/sentinel checks,
   the 0x914150 resolve -> edi) stays HOST (samples); the pure surface
   is the player mode dispatch dword[player+0x13c0] over
   {0xd,0xa,2,5,6,8,0xb,0x12} with FULL-dword id gates (0x168/0x19c,
   0x139 + byte[edi+0x132], 0x2e, 0x7a/0x75, 0x9d, 0xd6 + byte[edi+
   0x183] + the shared room_game gate + [g_game+0x26584] == 0 for mode
   8 ONLY, 0x248 + [g_game+0x26584] not in {0x25,0x26}). room_game
   (0x77134d..0x77136f / 0x7713b5..0x7713d8): [room+8] == 2 (FULL
   dword) && g_game != 0 (dword[0xc71678]) && ((u32)[g_game+0x26630]
   > 0 (UNSIGNED ja — 0xffffffff OPENS) || byte[g_game+0x26589] != 0
   (LOW-BYTE)). NO signed compares in the body; byte gates mask & 0xff.
   Evidence: section-notes/hud-v28-771200/NOTES.md; cpu-dump/
   00771200.txt + 007706e0.txt. No uint8_t params. */

enum {
  ISAAC_HUD_771200_VA_HEAD = 0x00771200u, /* push ebp */
  ISAAC_HUD_771200_VA_FIND_GATE = 0x0077121fu, /* cmp eax,[esi+0x4b3dc] */
  ISAAC_HUD_771200_VA_FIND_JE = 0x00771225u,  /* je 0x7712b2 (empty) */
  ISAAC_HUD_771200_VA_1E50 = 0x0077122du,     /* mov eax,[eax+0x1e50] */
  ISAAC_HUD_771200_VA_FIND_CALL = 0x00771272u, /* call 0x731ee0 */
  ISAAC_HUD_771200_VA_REC_BYTE = 0x0077127bu, /* cmp byte [eax+0xd],0 */
  ISAAC_HUD_771200_VA_PAIR_CMP = 0x00771281u, /* cmp ebx,[eax+0x14] */
  ISAAC_HUD_771200_VA_SENTINEL = 0x00771291u, /* cmp eax,[esi+0x4c440] */
  ISAAC_HUD_771200_VA_RESOLVE_CALL = 0x007712a2u, /* call 0x914150 */
  ISAAC_HUD_771200_VA_MODE_LOAD = 0x007712b6u, /* mov eax,[eax+0x13c0] */
  ISAAC_HUD_771200_VA_DISPATCH = 0x007712bcu, /* cmp eax,0xd */
  ISAAC_HUD_771200_VA_DISPATCH_JNE = 0x007712f6u, /* jne 0x771402 */
  ISAAC_HUD_771200_VA_CASE_18 = 0x007712fcu,  /* mode 0x12 body */
  ISAAC_HUD_771200_VA_EXCLUDE_25 = 0x00771307u, /* cmp eax,0x25 ; je FALSE */
  ISAAC_HUD_771200_VA_EXCLUDE_26 = 0x00771310u, /* cmp eax,0x26 ; je FALSE */
  ISAAC_HUD_771200_VA_CMP_248 = 0x00771319u,  /* cmp [ebp+8],0x248 */
  ISAAC_HUD_771200_VA_JNE_FALSE = 0x00771320u, /* jne 0x771402 */
  ISAAC_HUD_771200_VA_TRUE = 0x00771326u,     /* mov al,1 */
  ISAAC_HUD_771200_VA_CASE_8B = 0x00771331u,  /* cmp [ebp+8],0xd6 */
  ISAAC_HUD_771200_VA_BYTE_183 = 0x0077133eu, /* cmp byte [edi+0x183],0 */
  ISAAC_HUD_771200_VA_ROOM_8 = 0x0077134du,   /* cmp dword [esi+8],2 */
  ISAAC_HUD_771200_VA_GAME_NULL = 0x00771357u, /* test ecx,ecx */
  ISAAC_HUD_771200_VA_26630 = 0x0077135fu,    /* cmp dword [ecx+0x26630],0
                                                 ; ja (UNSIGNED) */
  ISAAC_HUD_771200_VA_26589 = 0x00771368u,    /* cmp byte [ecx+0x26589],0 */
  ISAAC_HUD_771200_VA_SHARED = 0x00771375u,   /* cmp eax,0xb ; je TRUE */
  ISAAC_HUD_771200_VA_26584 = 0x0077137au,    /* cmp dword [ecx+0x26584],0
                                                 (mode 8 only) */
  ISAAC_HUD_771200_VA_CASE_6 = 0x00771383u,   /* cmp [ebp+8],0x9d */
  ISAAC_HUD_771200_VA_CASE_5 = 0x0077138cu,   /* id 0x7a/0x75 */
  ISAAC_HUD_771200_VA_CMP_7A = 0x0077138fu,
  ISAAC_HUD_771200_VA_CMP_75 = 0x00771394u,
  ISAAC_HUD_771200_VA_CASE_2 = 0x00771399u,   /* cmp [ebp+8],0x2e */
  ISAAC_HUD_771200_VA_CASE_A = 0x0077139fu,   /* cmp [ebp+8],0x139 */
  ISAAC_HUD_771200_VA_BYTE_132 = 0x007713a8u, /* cmp byte [edi+0x132],0 */
  ISAAC_HUD_771200_VA_FALSE_DE = 0x007713deu, /* xor al,al (case A tail) */
  ISAAC_HUD_771200_VA_CASE_D = 0x007713e9u,   /* cmp eax,0x168 */
  ISAAC_HUD_771200_VA_CMP_168 = 0x007713f1u,
  ISAAC_HUD_771200_VA_CMP_19C = 0x007713f7u,
  ISAAC_HUD_771200_VA_FALSE = 0x00771402u,    /* xor al,al */
  ISAAC_HUD_771200_VA_RET = 0x0077140au,      /* ret 8 */
  ISAAC_HUD_771200_HOST_VA_731EE0 = 0x00731ee0u, /* pair find */
  ISAAC_HUD_771200_HOST_VA_914150 = 0x00914150u, /* resolve -> edi */
  ISAAC_HUD_771200_GAME_GLOBAL = 0x00c71678u, /* g_game */
  ISAAC_HUD_771200_ROOM_GLOBAL = 0x00c7169cu, /* room */
  ISAAC_HUD_771200_PLAYER_1E50_OFF = 0x1e50u, /* find candidate ptr */
  ISAAC_HUD_771200_PLAYER_MODE_OFF = 0x13c0u, /* dispatch key */
  ISAAC_HUD_771200_ROOM_BEGIN_OFF = 0x4b3d8u, /* vector begin */
  ISAAC_HUD_771200_ROOM_END_OFF = 0x4b3dcu,   /* vector end */
  ISAAC_HUD_771200_ROOM_CONTAINER_OFF = 0x4c440u, /* find container */
  ISAAC_HUD_771200_ROOM_STATE_OFF = 8,        /* [room+8] == 2 */
  ISAAC_HUD_771200_GAME_26584_OFF = 0x26584u, /* mode 8/0x12 gate */
  ISAAC_HUD_771200_GAME_26630_OFF = 0x26630u, /* UNSIGNED ja gate */
  ISAAC_HUD_771200_GAME_26589_OFF = 0x26589u, /* LOW-byte gate */
  ISAAC_HUD_771200_EDI_132_OFF = 0x132u,      /* case 0xa byte */
  ISAAC_HUD_771200_EDI_183_OFF = 0x183u,      /* case 8/0xb byte */
  ISAAC_HUD_771200_MODE_D = 0xdu,
  ISAAC_HUD_771200_MODE_A = 0xau,
  ISAAC_HUD_771200_MODE_2 = 2u,
  ISAAC_HUD_771200_MODE_5 = 5u,
  ISAAC_HUD_771200_MODE_6 = 6u,
  ISAAC_HUD_771200_MODE_8 = 8u,
  ISAAC_HUD_771200_MODE_B = 0xbu,
  ISAAC_HUD_771200_MODE_12 = 0x12u,
  ISAAC_HUD_771200_ID_248 = 0x248u,
  ISAAC_HUD_771200_ID_D6 = 0xd6u,
  ISAAC_HUD_771200_ID_139 = 0x139u,
  ISAAC_HUD_771200_ID_9D = 0x9du,
  ISAAC_HUD_771200_ID_7A = 0x7au,
  ISAAC_HUD_771200_ID_75 = 0x75u,
  ISAAC_HUD_771200_ID_2E = 0x2eu,
  ISAAC_HUD_771200_ID_168 = 0x168u,
  ISAAC_HUD_771200_ID_19C = 0x19cu,
  ISAAC_HUD_771200_ROOM_STATE_2 = 2u,
  ISAAC_HUD_771200_GAME_26584_EXCLUDE_1 = 0x25u,
  ISAAC_HUD_771200_GAME_26584_EXCLUDE_2 = 0x26u,
  ISAAC_HUD_770AE2_VA_CALL = 0x00770ae2u,     /* push ecx ; push ebx */
  ISAAC_HUD_770AE2_VA_CALL_771200 = 0x00770ae6u, /* call 0x771200 */
  ISAAC_HUD_770AE2_VA_TEST = 0x00770aebu,     /* test al,al */
  ISAAC_HUD_770AE2_VA_JNE_TRUE = 0x00770aedu, /* jne 0x770c29 */
  ISAAC_HUD_770AE2_VA_CMP_76 = 0x00770af3u,   /* cmp ebx,0x76 (FULL) */
  ISAAC_HUD_770AE2_VA_JNE_REGION_C = 0x00770af6u, /* jne 0x770b0c */
  ISAAC_HUD_770AE2_VA_CALL_9305F0 = 0x00770affu, /* call 0x9305f0 */
  ISAAC_HUD_770AE2_VA_TEST_9305F0 = 0x00770b04u, /* test al,al */
  ISAAC_HUD_770AE2_VA_JNE_TRUE2 = 0x00770b06u, /* jne 0x770c29 */
  ISAAC_HUD_770AE2_VA_REGION_C = 0x00770b0cu, /* region-C fall-through */
  ISAAC_HUD_770AE2_HOST_VA_9305F0 = 0x009305f0u, /* 0x76 arm */
  ISAAC_HUD_770AE2_ID_76 = 0x76u,
  /* Entity_Player::VoidHasCollectible (EXACT ZHL @0x7711a0 — catalog
     third_party/REPENTOGON/libzhl/functions/EntityPlayer.zhl, 10
     pattern bytes, `__thiscall bool Entity_Player::VoidHasCollectible(
     int id)`, ret 4; identify-zhl-prologues.json results[8]). The
     function directly BEFORE the packed true start 0x771200 (0x7711fd
     ret 4 -> 0x771200 push ebp). Fully PURE — zero host edges: slot
     scan player+0x1580 (4 x dword, stride 0x20) for 0x1dd (0x7711b0..
     0x7711bf; FULL dword; found index feeds only the DEAD js guard
     0x7711c8 test eax,eax), then the void-id list scan
     [player+0x1754..0x1758) (count = sar(end-begin,2); FULL dword
     count gate; each elem FULL-dword == void_id; UNSIGNED jb loop).
     result = slot_hit && count != 0 && elem_hit. */
  ISAAC_HUD_7711A0_VA_HEAD = 0x007711a0u, /* push ebp */
  ISAAC_HUD_7711A0_VA_SLOT_SCAN = 0x007711b0u, /* cmp dword [edx],0x1dd */
  ISAAC_HUD_7711A0_VA_SLOT_JE = 0x007711b6u, /* je 0x7711c8 */
  ISAAC_HUD_7711A0_VA_SLOT_LOOP = 0x007711bfu, /* cmp eax,4 ; jb (UNSIGNED) */
  ISAAC_HUD_7711A0_VA_FALSE = 0x007711c1u,  /* xor al,al */
  ISAAC_HUD_7711A0_VA_TEST_IDX = 0x007711c8u, /* test eax,eax (dead js) */
  ISAAC_HUD_7711A0_VA_JS_GUARD = 0x007711cau, /* js 0x7711c1 (dead) */
  ISAAC_HUD_7711A0_VA_COUNT_SAR = 0x007711dcu, /* sar edx,2 */
  ISAAC_HUD_7711A0_VA_COUNT_GATE = 0x007711dfu, /* test edx,edx ; je FALSE */
  ISAAC_HUD_7711A0_VA_ELEM_CMP = 0x007711e6u, /* cmp dword [eax],esi */
  ISAAC_HUD_7711A0_VA_ELEM_JE = 0x007711e8u, /* je 0x7711f9 (TRUE) */
  ISAAC_HUD_7711A0_VA_ELEM_LOOP = 0x007711f0u, /* cmp ecx,edx ; jb (UNSIGNED) */
  ISAAC_HUD_7711A0_VA_TRUE = 0x007711f9u,  /* mov al,1 */
  ISAAC_HUD_7711A0_VA_RET = 0x007711fdu,   /* ret 4 */
  ISAAC_HUD_7711A0_ID_1DD = 0x1ddu,        /* void item id */
  ISAAC_HUD_7711A0_SLOT_COUNT = 4,
  ISAAC_HUD_7711A0_SLOT_STRIDE = 0x20,
  ISAAC_HUD_7711A0_SLOTS_OFF = 0x1580u,    /* 4-slot scan base */
  ISAAC_HUD_7711A0_LIST_BEGIN_OFF = 0x1754u, /* void-id vector begin */
  ISAAC_HUD_7711A0_LIST_END_OFF = 0x1758u, /* void-id vector end */
  /* The 0x771410 id-walk loop (0x00771410..0x00771545 ret 0) — the
     v29 unit: 0x2dd ids, per-iteration dispatch, the bit-set store,
     the mode-5 tail. See the v29 doc block above. */
  ISAAC_HUD_771410_VA_HEAD = 0x00771410u,  /* push ebp */
  ISAAC_HUD_771410_VA_LOOP_HEAD = 0x00771420u, /* push ecx (dead flag) */
  ISAAC_HUD_771410_VA_CALL_771200 = 0x00771424u, /* r1 = 0x771200 */
  ISAAC_HUD_771410_VA_TEST_AL = 0x00771429u, /* test al,al */
  ISAAC_HUD_771410_VA_JE_PATH_B = 0x0077142bu, /* je 0x7714a8 */
  ISAAC_HUD_771410_VA_EDITION_CMP = 0x00771432u, /* cmp [eax+0x26584],0x2b */
  ISAAC_HUD_771410_VA_EDITION_JE = 0x0077143fu, /* je 0x77147b (skip) */
  ISAAC_HUD_771410_VA_CHALLENGE_CMP = 0x00771441u, /* cmp esi,0x1e4 */
  ISAAC_HUD_771410_VA_CHALLENGE_JNE = 0x00771447u, /* jne 0x771459 */
  ISAAC_HUD_771410_VA_CALL_733FF0 = 0x00771454u, /* call 0x733ff0 */
  ISAAC_HUD_771410_VA_BIT_BOUND_CMP = 0x00771459u, /* cmp esi,[ebx+0x688] */
  ISAAC_HUD_771410_VA_BIT_BOUND_JAE = 0x0077145fu, /* jae (UNSIGNED) */
  ISAAC_HUD_771410_VA_WORD_SHR = 0x00771469u, /* shr ecx,5 */
  ISAAC_HUD_771410_VA_WORD_LEA = 0x0077146cu, /* lea edx,[eax+ecx*4] */
  ISAAC_HUD_771410_VA_BIT_AND = 0x00771473u, /* and ecx,0x1f */
  ISAAC_HUD_771410_VA_BTS = 0x00771476u,   /* bts eax,ecx */
  ISAAC_HUD_771410_VA_BIT_STORE = 0x00771479u, /* mov [edx],eax */
  ISAAC_HUD_771410_VA_ROOM_LOAD = 0x0077147bu, /* mov eax,[0xc7169c] */
  ISAAC_HUD_771410_VA_ROOM_SAR = 0x0077148eu, /* sar eax,2 */
  ISAAC_HUD_771410_VA_ROOM_JGE = 0x00771493u, /* jge (SIGNED) */
  ISAAC_HUD_771410_VA_ELEM_LOAD = 0x00771495u, /* mov eax,[ecx+esi*4] */
  ISAAC_HUD_771410_VA_ELEM_TEST = 0x00771498u, /* test eax,eax */
  ISAAC_HUD_771410_VA_ELEM_JE = 0x0077149au, /* je 0x7714ed */
  ISAAC_HUD_771410_VA_CALL_75D1D0 = 0x007714a1u, /* call 0x75d1d0 */
  ISAAC_HUD_771410_VA_PATH_B = 0x007714a8u, /* path B head */
  ISAAC_HUD_771410_VA_DEAD_CALL_771200 = 0x007714acu, /* r2 DEAD */
  ISAAC_HUD_771410_VA_CALL_7706E0 = 0x007714b6u, /* r3 = 0x7706e0 */
  ISAAC_HUD_771410_VA_HC_TEST = 0x007714bbu, /* test al,al */
  ISAAC_HUD_771410_VA_HC_JNE = 0x007714bdu, /* jne 0x7714ed */
  ISAAC_HUD_771410_VA_CALL_9305F0 = 0x007714c6u, /* r4 = 0x9305f0 */
  ISAAC_HUD_771410_VA_TRINKET_TEST = 0x007714cbu, /* test al,al */
  ISAAC_HUD_771410_VA_TRINKET_JNE = 0x007714cdu, /* jne 0x7714ed */
  ISAAC_HUD_771410_VA_CALL_72FD10 = 0x007714dcu, /* r5 = 0x72fd10 */
  ISAAC_HUD_771410_VA_LIST_TEST = 0x007714e1u, /* test eax,eax */
  ISAAC_HUD_771410_VA_LIST_JE = 0x007714e3u, /* je 0x7714ed */
  ISAAC_HUD_771410_VA_CALL_75D850 = 0x007714e8u, /* call 0x75d850 */
  ISAAC_HUD_771410_VA_INC = 0x007714edu,   /* inc esi */
  ISAAC_HUD_771410_VA_BOUND_CMP = 0x007714eeu, /* cmp esi,0x2dd */
  ISAAC_HUD_771410_VA_BOUND_JL = 0x007714f4u, /* jl 0x771420 (SIGNED) */
  ISAAC_HUD_771410_VA_TAIL_MODE_CMP = 0x007714fau, /* cmp [edi+0x13c0],5 */
  ISAAC_HUD_771410_VA_TAIL_MODE_JNE = 0x00771501u, /* jne 0x77153f */
  ISAAC_HUD_771410_VA_SPAN_MASK = 0x00771516u, /* and eax,0xfffffffc */
  ISAAC_HUD_771410_VA_TAIL_CMP = 0x00771519u, /* cmp eax,0x1e8 */
  ISAAC_HUD_771410_VA_TAIL_JG = 0x0077151eu, /* jg 0x771531 (SIGNED) */
  ISAAC_HUD_771410_VA_TAIL_XOR = 0x00771520u, /* xor eax,eax */
  ISAAC_HUD_771410_VA_TAIL_CALL_0 = 0x00771525u, /* call 0x75d850 */
  ISAAC_HUD_771410_VA_TAIL_RET = 0x00771530u, /* ret (small path) */
  ISAAC_HUD_771410_VA_TAIL_ARG_LOAD = 0x00771531u, /* mov eax,[ecx+0x1e8] */
  ISAAC_HUD_771410_VA_TAIL_CALL_ARG = 0x0077153au, /* call 0x75d850 */
  ISAAC_HUD_771410_VA_RET = 0x00771545u,   /* ret 0 (plain) */
  ISAAC_HUD_771410_HOST_VA_733FF0 = 0x00733ff0u,
  ISAAC_HUD_771410_HOST_VA_75D1D0 = 0x0075d1d0u,
  ISAAC_HUD_771410_HOST_VA_75D850 = 0x0075d850u,
  ISAAC_HUD_771410_HOST_VA_9305F0 = 0x009305f0u,
  ISAAC_HUD_771410_HOST_VA_72FD10 = 0x0072fd10u,
  ISAAC_HUD_771410_HOST_VA_7706E0 = 0x007706e0u,
  ISAAC_HUD_771410_HOST_VA_771200 = 0x00771200u,
  ISAAC_HUD_771410_GAME_GLOBAL = 0x00c71678u,
  ISAAC_HUD_771410_ROOM_GLOBAL = 0x00c7169cu,
  ISAAC_HUD_771410_PLAYER_MODE_OFF = 0x13c0u,
  ISAAC_HUD_771410_PLAYER_TRINKET_RECV_OFF = 0x1508u,
  ISAAC_HUD_771410_ROOM_BEGIN_OFF = 0x2a404u,
  ISAAC_HUD_771410_ROOM_END_OFF = 0x2a408u,
  ISAAC_HUD_771410_GAME_26584_OFF = 0x26584u,
  ISAAC_HUD_771410_BITSET_BASE_OFF = 0x1a740u,
  ISAAC_HUD_771410_BITSET_COUNT_OFF = 0x688u,
  ISAAC_HUD_771410_BITSET_PTR_OFF = 0x67cu,
  ISAAC_HUD_771410_BEGIN_1E8_OFF = 0x1e8u,
  ISAAC_HUD_771410_WALK_BOUND = 0x2ddu,
  ISAAC_HUD_771410_CHALLENGE_ID = 0x1e4u,
  ISAAC_HUD_771410_CHALLENGE_ARG = 0x126u,
  ISAAC_HUD_771410_EDITION_SKIP = 0x2bu,
  ISAAC_HUD_771410_TAIL_THRESHOLD = 0x1e8u,
  ISAAC_HUD_771410_TAIL_MODE = 5u,
  ISAAC_HUD_771410_BIT_MASK = 0x1fu,
  ISAAC_HUD_771410_SPAN_MASK = 0xfffffffc,
  ISAAC_HUD_771410_WORD_SHIFT = 5,
  ISAAC_HUD_771410_WORD_STRIDE = 4,
  ISAAC_HUD_771410_MASK_BIT_STORE = 1,
  ISAAC_HUD_771410_MASK_HOST_733FF0 = 2,
  ISAAC_HUD_771410_MASK_HOST_75D1D0 = 4,
  ISAAC_HUD_771410_MASK_HOST_7706E0 = 8,
  ISAAC_HUD_771410_MASK_HOST_9305F0 = 0x10,
  ISAAC_HUD_771410_MASK_HOST_72FD10 = 0x20,
  ISAAC_HUD_771410_MASK_HOST_75D850 = 0x40
};

int32_t isaac_hud_771200_mode_open(uint32_t mode);
int32_t isaac_hud_771200_room_game_open(uint32_t room_8, uint32_t g_game,
                                        uint32_t g_game_26630,
                                        uint32_t g_game_26589);
int32_t isaac_hud_771200_case_d(uint32_t id);
int32_t isaac_hud_771200_case_a(uint32_t id, uint32_t byte_edi_132,
                                uint32_t room_8, uint32_t g_game,
                                uint32_t g_game_26630,
                                uint32_t g_game_26589);
int32_t isaac_hud_771200_case_2(uint32_t id);
int32_t isaac_hud_771200_case_5(uint32_t id);
int32_t isaac_hud_771200_case_6(uint32_t id);
int32_t isaac_hud_771200_case_8(uint32_t id, uint32_t byte_edi_183,
                                uint32_t room_8, uint32_t g_game,
                                uint32_t g_game_26630,
                                uint32_t g_game_26589,
                                uint32_t g_game_26584);
int32_t isaac_hud_771200_case_b(uint32_t id, uint32_t byte_edi_183,
                                uint32_t room_8, uint32_t g_game,
                                uint32_t g_game_26630,
                                uint32_t g_game_26589);
int32_t isaac_hud_771200_case_18(uint32_t id, uint32_t g_game_26584);
int32_t isaac_hud_771200_gate(uint32_t id, uint32_t mode,
                              uint32_t byte_edi_132, uint32_t byte_edi_183,
                              uint32_t room_8, uint32_t g_game,
                              uint32_t g_game_26630, uint32_t g_game_26589,
                              uint32_t g_game_26584);
int32_t isaac_hud_770ae2_open(uint32_t r_771200, uint32_t id,
                              uint32_t r_9305f0);
int32_t isaac_hud_7711a0_void_slot_hit(uint32_t slot_0, uint32_t slot_1,
                                       uint32_t slot_2, uint32_t slot_3);
int32_t isaac_hud_7711a0_void_list_gate(uint32_t count);
int32_t isaac_hud_7711a0_void_elem_hit(uint32_t elem, uint32_t void_id);
int32_t isaac_hud_7711a0_void_has(int32_t slot_hit, uint32_t count,
                                  int32_t elem_hit);
uint32_t isaac_hud_7711a0_va_head(void);
uint32_t isaac_hud_7711a0_va_slot_scan(void);
uint32_t isaac_hud_7711a0_va_slot_je(void);
uint32_t isaac_hud_7711a0_va_slot_loop(void);
uint32_t isaac_hud_7711a0_va_false(void);
uint32_t isaac_hud_7711a0_va_test_idx(void);
uint32_t isaac_hud_7711a0_va_js_guard(void);
uint32_t isaac_hud_7711a0_va_count_sar(void);
uint32_t isaac_hud_7711a0_va_count_gate(void);
uint32_t isaac_hud_7711a0_va_elem_cmp(void);
uint32_t isaac_hud_7711a0_va_elem_je(void);
uint32_t isaac_hud_7711a0_va_elem_loop(void);
uint32_t isaac_hud_7711a0_va_true(void);
uint32_t isaac_hud_7711a0_va_ret(void);
uint32_t isaac_hud_7711a0_id_1dd(void);
uint32_t isaac_hud_7711a0_slot_count(void);
uint32_t isaac_hud_7711a0_slot_stride(void);
uint32_t isaac_hud_7711a0_slots_off(void);
uint32_t isaac_hud_7711a0_list_begin_off(void);
uint32_t isaac_hud_7711a0_list_end_off(void);
uint32_t isaac_hud_771200_va_head(void);
uint32_t isaac_hud_771200_va_find_gate(void);
uint32_t isaac_hud_771200_va_find_je(void);
uint32_t isaac_hud_771200_va_1e50(void);
uint32_t isaac_hud_771200_va_find_call(void);
uint32_t isaac_hud_771200_va_rec_byte(void);
uint32_t isaac_hud_771200_va_pair_cmp(void);
uint32_t isaac_hud_771200_va_sentinel(void);
uint32_t isaac_hud_771200_va_resolve_call(void);
uint32_t isaac_hud_771200_va_mode_load(void);
uint32_t isaac_hud_771200_va_dispatch(void);
uint32_t isaac_hud_771200_va_dispatch_jne(void);
uint32_t isaac_hud_771200_va_case_18(void);
uint32_t isaac_hud_771200_va_exclude_25(void);
uint32_t isaac_hud_771200_va_exclude_26(void);
uint32_t isaac_hud_771200_va_cmp_248(void);
uint32_t isaac_hud_771200_va_jne_false(void);
uint32_t isaac_hud_771200_va_true(void);
uint32_t isaac_hud_771200_va_case_8b(void);
uint32_t isaac_hud_771200_va_byte_183(void);
uint32_t isaac_hud_771200_va_room_8(void);
uint32_t isaac_hud_771200_va_game_null(void);
uint32_t isaac_hud_771200_va_26630(void);
uint32_t isaac_hud_771200_va_26589(void);
uint32_t isaac_hud_771200_va_shared(void);
uint32_t isaac_hud_771200_va_26584(void);
uint32_t isaac_hud_771200_va_case_6(void);
uint32_t isaac_hud_771200_va_case_5(void);
uint32_t isaac_hud_771200_va_cmp_7a(void);
uint32_t isaac_hud_771200_va_cmp_75(void);
uint32_t isaac_hud_771200_va_case_2(void);
uint32_t isaac_hud_771200_va_case_a(void);
uint32_t isaac_hud_771200_va_byte_132(void);
uint32_t isaac_hud_771200_va_false_de(void);
uint32_t isaac_hud_771200_va_case_d(void);
uint32_t isaac_hud_771200_va_cmp_168(void);
uint32_t isaac_hud_771200_va_cmp_19c(void);
uint32_t isaac_hud_771200_va_false(void);
uint32_t isaac_hud_771200_va_ret(void);
uint32_t isaac_hud_771200_host_va_731ee0(void);
uint32_t isaac_hud_771200_host_va_914150(void);
uint32_t isaac_hud_771200_game_global(void);
uint32_t isaac_hud_771200_room_global(void);
uint32_t isaac_hud_771200_player_1e50_off(void);
uint32_t isaac_hud_771200_player_mode_off(void);
uint32_t isaac_hud_771200_room_begin_off(void);
uint32_t isaac_hud_771200_room_end_off(void);
uint32_t isaac_hud_771200_room_container_off(void);
uint32_t isaac_hud_771200_room_state_off(void);
uint32_t isaac_hud_771200_game_26584_off(void);
uint32_t isaac_hud_771200_game_26630_off(void);
uint32_t isaac_hud_771200_game_26589_off(void);
uint32_t isaac_hud_771200_edi_132_off(void);
uint32_t isaac_hud_771200_edi_183_off(void);
uint32_t isaac_hud_771200_mode_d(void);
uint32_t isaac_hud_771200_mode_a(void);
uint32_t isaac_hud_771200_mode_2(void);
uint32_t isaac_hud_771200_mode_5(void);
uint32_t isaac_hud_771200_mode_6(void);
uint32_t isaac_hud_771200_mode_8(void);
uint32_t isaac_hud_771200_mode_b(void);
uint32_t isaac_hud_771200_mode_12(void);
uint32_t isaac_hud_771200_id_248(void);
uint32_t isaac_hud_771200_id_d6(void);
uint32_t isaac_hud_771200_id_139(void);
uint32_t isaac_hud_771200_id_9d(void);
uint32_t isaac_hud_771200_id_7a(void);
uint32_t isaac_hud_771200_id_75(void);
uint32_t isaac_hud_771200_id_2e(void);
uint32_t isaac_hud_771200_id_168(void);
uint32_t isaac_hud_771200_id_19c(void);
uint32_t isaac_hud_771200_room_state_2(void);
uint32_t isaac_hud_771200_game_26584_exclude_1(void);
uint32_t isaac_hud_771200_game_26584_exclude_2(void);
uint32_t isaac_hud_770ae2_va_call(void);
uint32_t isaac_hud_770ae2_va_call_771200(void);
uint32_t isaac_hud_770ae2_va_test(void);
uint32_t isaac_hud_770ae2_va_jne_true(void);
uint32_t isaac_hud_770ae2_va_cmp_76(void);
uint32_t isaac_hud_770ae2_va_jne_region_c(void);
uint32_t isaac_hud_770ae2_va_call_9305f0(void);
uint32_t isaac_hud_770ae2_va_test_9305f0(void);
uint32_t isaac_hud_770ae2_va_jne_true2(void);
uint32_t isaac_hud_770ae2_va_region_c(void);
uint32_t isaac_hud_770ae2_host_va_9305f0(void);
uint32_t isaac_hud_770ae2_id_76(void);

/* ---- ABI v29: the 0x771410 id-walk loop ---- */
int32_t isaac_hud_771410_walk_continue(uint32_t id);
int32_t isaac_hud_771410_path_a_open(uint32_t r_771200);
int32_t isaac_hud_771410_edition_gate(uint32_t g_game_26584);
int32_t isaac_hud_771410_challenge_gate(uint32_t id);
int32_t isaac_hud_771410_bit_set_open(uint32_t g_game_26584, uint32_t id,
                                      uint32_t bitset_count);
uint32_t isaac_hud_771410_bit_word(uint32_t bits_word, uint32_t id);
uint32_t isaac_hud_771410_bit_addr(uint32_t bits_ptr, uint32_t id);
uint32_t isaac_hud_771410_room_count_sar(uint32_t begin, uint32_t end);
int32_t isaac_hud_771410_room_fire_open(uint32_t room_count, uint32_t id);
int32_t isaac_hud_771410_elem_fire_open(uint32_t elem);
int32_t isaac_hud_771410_hc_skip_open(uint32_t r_7706e0);
int32_t isaac_hud_771410_trinket_skip_open(uint32_t r_9305f0);
int32_t isaac_hud_771410_list_fire_open(uint32_t r_72fd10);
int32_t isaac_hud_771410_tail_fire(uint32_t mode);
int32_t isaac_hud_771410_tail_large_gate(uint32_t begin, uint32_t end);
uint32_t isaac_hud_771410_tail_arg(uint32_t begin_1e8, uint32_t begin,
                                   uint32_t end);
int32_t isaac_hud_771410_iter_mask(uint32_t id, uint32_t r_771200,
                                   uint32_t g_game_26584,
                                   uint32_t bitset_count,
                                   uint32_t room_count, uint32_t elem,
                                   uint32_t r_7706e0, uint32_t r_9305f0,
                                   uint32_t r_72fd10);
uint32_t isaac_hud_771410_span_masked(uint32_t begin, uint32_t end);
uint32_t isaac_hud_771410_va_head(void);
uint32_t isaac_hud_771410_va_loop_head(void);
uint32_t isaac_hud_771410_va_call_771200(void);
uint32_t isaac_hud_771410_va_test_al(void);
uint32_t isaac_hud_771410_va_je_path_b(void);
uint32_t isaac_hud_771410_va_edition_cmp(void);
uint32_t isaac_hud_771410_va_edition_je(void);
uint32_t isaac_hud_771410_va_challenge_cmp(void);
uint32_t isaac_hud_771410_va_challenge_jne(void);
uint32_t isaac_hud_771410_va_call_733ff0(void);
uint32_t isaac_hud_771410_va_bit_bound_cmp(void);
uint32_t isaac_hud_771410_va_bit_bound_jae(void);
uint32_t isaac_hud_771410_va_word_shr(void);
uint32_t isaac_hud_771410_va_word_lea(void);
uint32_t isaac_hud_771410_va_bit_and(void);
uint32_t isaac_hud_771410_va_bts(void);
uint32_t isaac_hud_771410_va_bit_store(void);
uint32_t isaac_hud_771410_va_room_load(void);
uint32_t isaac_hud_771410_va_room_sar(void);
uint32_t isaac_hud_771410_va_room_jge(void);
uint32_t isaac_hud_771410_va_elem_load(void);
uint32_t isaac_hud_771410_va_elem_test(void);
uint32_t isaac_hud_771410_va_elem_je(void);
uint32_t isaac_hud_771410_va_call_75d1d0(void);
uint32_t isaac_hud_771410_va_path_b(void);
uint32_t isaac_hud_771410_va_dead_call_771200(void);
uint32_t isaac_hud_771410_va_call_7706e0(void);
uint32_t isaac_hud_771410_va_hc_test(void);
uint32_t isaac_hud_771410_va_hc_jne(void);
uint32_t isaac_hud_771410_va_call_9305f0(void);
uint32_t isaac_hud_771410_va_trinket_test(void);
uint32_t isaac_hud_771410_va_trinket_jne(void);
uint32_t isaac_hud_771410_va_call_72fd10(void);
uint32_t isaac_hud_771410_va_list_test(void);
uint32_t isaac_hud_771410_va_list_je(void);
uint32_t isaac_hud_771410_va_call_75d850(void);
uint32_t isaac_hud_771410_va_inc(void);
uint32_t isaac_hud_771410_va_bound_cmp(void);
uint32_t isaac_hud_771410_va_bound_jl(void);
uint32_t isaac_hud_771410_va_tail_mode_cmp(void);
uint32_t isaac_hud_771410_va_tail_mode_jne(void);
uint32_t isaac_hud_771410_va_span_mask(void);
uint32_t isaac_hud_771410_va_tail_cmp(void);
uint32_t isaac_hud_771410_va_tail_jg(void);
uint32_t isaac_hud_771410_va_tail_xor(void);
uint32_t isaac_hud_771410_va_tail_call_0(void);
uint32_t isaac_hud_771410_va_tail_ret(void);
uint32_t isaac_hud_771410_va_tail_arg_load(void);
uint32_t isaac_hud_771410_va_tail_call_arg(void);
uint32_t isaac_hud_771410_va_ret(void);
uint32_t isaac_hud_771410_host_va_733ff0(void);
uint32_t isaac_hud_771410_host_va_75d1d0(void);
uint32_t isaac_hud_771410_host_va_75d850(void);
uint32_t isaac_hud_771410_host_va_9305f0(void);
uint32_t isaac_hud_771410_host_va_72fd10(void);
uint32_t isaac_hud_771410_host_va_7706e0(void);
uint32_t isaac_hud_771410_host_va_771200(void);
uint32_t isaac_hud_771410_game_global(void);
uint32_t isaac_hud_771410_room_global(void);
uint32_t isaac_hud_771410_player_mode_off(void);
uint32_t isaac_hud_771410_player_trinket_recv_off(void);
uint32_t isaac_hud_771410_room_begin_off(void);
uint32_t isaac_hud_771410_room_end_off(void);
uint32_t isaac_hud_771410_game_26584_off(void);
uint32_t isaac_hud_771410_bitset_base_off(void);
uint32_t isaac_hud_771410_bitset_count_off(void);
uint32_t isaac_hud_771410_bitset_ptr_off(void);
uint32_t isaac_hud_771410_begin_1e8_off(void);
uint32_t isaac_hud_771410_walk_bound(void);
uint32_t isaac_hud_771410_challenge_id(void);
uint32_t isaac_hud_771410_challenge_arg(void);
uint32_t isaac_hud_771410_edition_skip(void);
uint32_t isaac_hud_771410_tail_threshold(void);
uint32_t isaac_hud_771410_tail_mode(void);
uint32_t isaac_hud_771410_bit_mask(void);
uint32_t isaac_hud_771410_span_mask(void);
uint32_t isaac_hud_771410_word_shift(void);
uint32_t isaac_hud_771410_word_stride(void);
uint32_t isaac_hud_771410_mask_bit_store(void);
uint32_t isaac_hud_771410_mask_host_733ff0(void);
uint32_t isaac_hud_771410_mask_host_75d1d0(void);
uint32_t isaac_hud_771410_mask_host_7706e0(void);
uint32_t isaac_hud_771410_mask_host_9305f0(void);
uint32_t isaac_hud_771410_mask_host_72fd10(void);
uint32_t isaac_hud_771410_mask_host_75d850(void);

/* Helpers ABI v30 (0x007706e0): the 0x76-arm caller chain + the
   0x770a88 jle PARENT branch selection — the four pre-gate windows
   of HasCollectible FUN_007706e0 (0x007706e0..0x00770c92, ret 8,
   1212 callers) left un-lawed between the v24 redirect walk and the
   v25 RNG / v26 tail-chain / v27 counter epilogue / v28 0x770ae2
   gate regions (v29 handoff). Walk resolves this=player + cfg; then:
   WINDOW A 0x77076f..0x7707d1 — interior gate: FALSE exit iff
   LOW(byte[p+0x20a9]) != 0 && (int64)(int32)game_26614 < 2 (jge
   0x770784 — SIGNED) && (dword[cfg+0xb8] & 0x8000) == 0; held gate:
   TRUE iff dword[p+0x2ef4] != 0 (FULL) && id == held_id (FULL) &&
   LOW(byte[p+0x2ef0]) != 0; negative arm: (int64)(int32)id < 0
   (jns 0x7707b3 — SIGNED) -> host 0x9e04b0(&player[0x1fc8], id),
   return its LOW byte (al passthrough 0x7707c1).
   WINDOW B 0x7707d4..0x77085c — flag gate: LOW(param_3 byte
   [ebp+0xc]) != 0 (cmp byte 0x7707d4 — the ONLY read of flag) ->
   the 0x770c3e counter epilogue DIRECTLY (skips all id arms, tail
   gate and region C). 0x147/0x148 arm: host 0x771550(player, 0x15,
   0), LOW-byte; mod4 = (int32)(dword[g_game+0x264f8] & 0x80000003)
   % 4 (and ; jns ; dec/or/inc — SIGNED remainder, value -3..3);
   count n = host 0x7cb6e0(player, 0x15); TRUE table (cmp/jle
   SIGNED 0x770826): n <= 1 -> (mod 0 && id 0x147) || (mod 1 && id
   0x148); n > 1 -> mod in {0,1} && id in {0x147, 0x148}.
   WINDOW C 0x77085c..0x770915 — 0x139 arm: mode (dword[p+0x13c0])
   == 0xa (FULL) enters directly, else host 0x930680(&player[0x1508],
   0x70) with LOW-byte gate; mode == 0x1f (FULL) after an open
   0x930680 CHAINS to 0x770a44; room find over [room+0x4b3d8]/
   [0x4b3dc] (FULL cmp; the 0xa23920 + 0x90c300 pair stays HOST, v =
   resolved ? resolved : &room[0x14] via cmovne); LOW(byte[v+0x132])
   != 0 -> TRUE; then the v28-G2 SHARED room_game gate (VAs
   0x7708e0..0x770910): room_8 == 2 (FULL) && g_game != 0 (FULL) &&
   ((uint64)dword[g_game+0x26630] > 0 (ja 0x770903 — UNSIGNED) ||
   LOW(byte[g_game+0x26589]) != 0 (jmp 0x770a3e shared jne TRUE)).
   WINDOW D 0x770994..0x770a7e — 0x3b arm (host 0x7da770(player),
   LOW-byte); 0x131/0x101/0xe7/0xb6 arms: test byte [p+0x2028] with
   imm masks 0x10/8/0x20/0x40 (LOW-byte field; the 0xb6 test shares
   the 0x770a3e jne TRUE target with byte26589); then HOST
   0x7db8d0(player) (always after the id compares) with the 14a99
   gate: (id == 0x14a && r == 1 FULL -> mov al,al return LOW(r) ==
   1) || (id == 0x99 && r == 2 FULL -> TRUE); FALSE -> the v25 ladder
   0x770a7e. The 0x76-ARM (inside the v28 gate): id == 0x76 (FULL
   0x770af3) -> host 0x9305f0(&player[0x1508], 0x76) — the UNIQUE
   0x76-id host path of a 320-site census (0x76 is never push-
   immediate anywhere) — LOW-byte result -> TRUE exit 0x770c29.
   Evidence: section-notes/hud-v30-76arm/NOTES.md + disasm-7706e0-
   full.txt; decompiled/007706e0_FUN_007706e0.c. Byte gates all
   uint32_t + & 0xff (0x100 CLOSED); no uint8_t params; wasm32
   compare-flip class: 26614 jge / id jns / count jle SIGNED (i64
   sign-extend form), 26630 ja genuine-UNSIGNED. */

enum {
  ISAAC_HUD_7706E0_VA_FALSE = 0x0077075au,      /* FALSE epilogue */
  ISAAC_HUD_7706E0_VA_INTERIOR_HEAD = 0x0077076fu, /* cmp byte [edi+0x20a9],0 */
  ISAAC_HUD_7706E0_VA_INTERIOR_26614_LOAD = 0x00770778u, /* g_game */
  ISAAC_HUD_7706E0_VA_INTERIOR_26614_CMP = 0x0077077du, /* cmp dword,2 */
  ISAAC_HUD_7706E0_VA_INTERIOR_26614_JGE = 0x00770784u, /* jge skip (SIGNED) */
  ISAAC_HUD_7706E0_VA_INTERIOR_CFG_B8 = 0x00770786u, /* mov eax,[esi+0xb8] */
  ISAAC_HUD_7706E0_VA_INTERIOR_CFG_AND = 0x0077078cu, /* and eax,0x8000 */
  ISAAC_HUD_7706E0_VA_INTERIOR_CFG_JE = 0x00770794u, /* je 0x77075a FALSE */
  ISAAC_HUD_7706E0_VA_HELD_HEAD = 0x00770796u,  /* mov eax,[edi+0x2ef4] */
  ISAAC_HUD_7706E0_VA_HELD_TEST = 0x0077079cu,  /* test eax,eax (FULL) */
  ISAAC_HUD_7706E0_VA_HELD_CMP = 0x007707a0u,   /* cmp ebx,eax (FULL) */
  ISAAC_HUD_7706E0_VA_HELD_BYTE = 0x007707a4u,  /* cmp byte [edi+0x2ef0],0 */
  ISAAC_HUD_7706E0_VA_HELD_JNE_TRUE = 0x007707abu, /* jne 0x770c29 TRUE */
  ISAAC_HUD_7706E0_VA_NEG_TEST = 0x007707b1u,   /* test ebx,ebx */
  ISAAC_HUD_7706E0_VA_NEG_JNS = 0x007707b3u,    /* jns 0x7707d4 (SIGNED) */
  ISAAC_HUD_7706E0_VA_NEG_CALL = 0x007707bcu,   /* call 0x9e04b0 */
  ISAAC_HUD_7706E0_VA_NEG_RET = 0x007707c1u,    /* al passthrough epilogue */
  ISAAC_HUD_7706E0_VA_FLAG_CMP = 0x007707d4u,   /* cmp byte [ebp+0xc],0 */
  ISAAC_HUD_7706E0_VA_FLAG_JNE_EPILOGUE = 0x007707d8u, /* jne 0x770c3e */
  ISAAC_HUD_7706E0_VA_CMP_147 = 0x007707deu,    /* cmp ebx,0x147 (FULL) */
  ISAAC_HUD_7706E0_VA_CMP_148 = 0x007707e6u,    /* cmp ebx,0x148 (FULL) */
  ISAAC_HUD_7706E0_VA_1550_CALL = 0x007707f4u,  /* call 0x771550(0x15,0) */
  ISAAC_HUD_7706E0_VA_1550_TEST = 0x007707f9u,  /* test al,al (LOW-BYTE) */
  ISAAC_HUD_7706E0_VA_MOD4_AND = 0x00770808u,   /* and eax,0x80000003 */
  ISAAC_HUD_7706E0_VA_MOD4_JNS = 0x0077080du,   /* jns 0x770814 (SIGNED) */
  ISAAC_HUD_7706E0_VA_MOD4_FIXUP = 0x0077080fu, /* dec/or 0xfffffffc/inc */
  ISAAC_HUD_7706E0_VA_COUNT_CALL = 0x0077081bu, /* call 0x7cb6e0(0x15) */
  ISAAC_HUD_7706E0_VA_COUNT_CMP = 0x00770820u,  /* cmp eax,1 */
  ISAAC_HUD_7706E0_VA_COUNT_JLE = 0x00770826u,  /* jle 0x77083f (SIGNED) */
  ISAAC_HUD_7706E0_VA_RULE_N_LE1_MOD0 = 0x00770831u, /* id==0x147 je TRUE */
  ISAAC_HUD_7706E0_VA_RULE_N_LE1_MOD1 = 0x00770850u, /* id==0x148 je TRUE */
  ISAAC_HUD_7706E0_VA_RULE_N_LE1_CHK = 0x0077083fu,  /* test eax,eax */
  ISAAC_HUD_7706E0_VA_RULE_N_GT1_CHK = 0x00770828u,  /* test eax,eax */
  ISAAC_HUD_7706E0_VA_RULE_N_GT1_MOD1 = 0x0077084bu, /* cmp eax,1 */
  ISAAC_HUD_7706E0_VA_CMP_139 = 0x0077085cu,    /* cmp ebx,0x139 (FULL) */
  ISAAC_HUD_7706E0_VA_MODE_A_CMP = 0x00770868u, /* cmp dword [edi+0x13c0],0xa */
  ISAAC_HUD_7706E0_VA_CALL_930680 = 0x00770879u, /* call 0x930680(0x70) */
  ISAAC_HUD_7706E0_VA_930680_TEST = 0x0077087eu, /* test al,al (LOW-BYTE) */
  ISAAC_HUD_7706E0_VA_MODE_1F_CMP = 0x00770886u, /* cmp dword,0x1f (FULL) */
  ISAAC_HUD_7706E0_VA_ROOM_BEGIN_CMP = 0x007708a9u, /* begin vs end (FULL) */
  ISAAC_HUD_7706E0_VA_PAIR_CALL = 0x007708b4u,  /* call 0xa23920 (u64 pair) */
  ISAAC_HUD_7706E0_VA_RESOLVE_CALL = 0x007708c6u, /* call 0x90c300 (HOST) */
  ISAAC_HUD_7706E0_VA_CMOVNE = 0x007708d0u,     /* cmovne ecx,eax */
  ISAAC_HUD_7706E0_VA_BYTE132_CMP = 0x007708d3u, /* cmp byte [ecx+0x132],0 */
  ISAAC_HUD_7706E0_VA_BYTE132_JNE = 0x007708dau, /* jne 0x770c29 TRUE */
  ISAAC_HUD_7706E0_VA_ROOM_8_CMP = 0x007708e0u, /* cmp dword [eax+8],2 (FULL) */
  ISAAC_HUD_7706E0_VA_ROOM_8_JNE = 0x007708e9u, /* jne 0x770a44 CHAIN */
  ISAAC_HUD_7706E0_VA_GAME_TEST = 0x007708efu,  /* test eax,eax (FULL) */
  ISAAC_HUD_7706E0_VA_GAME_JE = 0x007708f6u,    /* je 0x770a44 CHAIN */
  ISAAC_HUD_7706E0_VA_26630_CMP = 0x007708fcu,  /* cmp dword,0 */
  ISAAC_HUD_7706E0_VA_26630_JA = 0x00770903u,   /* ja 0x770c29 (UNSIGNED) */
  ISAAC_HUD_7706E0_VA_26589_CMP = 0x00770909u,  /* cmp byte,0 (LOW) */
  ISAAC_HUD_7706E0_VA_SHARED_JNE_TRUE = 0x00770a3eu, /* jne 0x770c29 */
  ISAAC_HUD_7706E0_VA_CMP_3B = 0x00770994u,     /* cmp ebx,0x3b (FULL) */
  ISAAC_HUD_7706E0_VA_CALL_7DA770 = 0x0077099bu, /* call 0x7da770 */
  ISAAC_HUD_7706E0_VA_7DA770_TEST = 0x007709a0u, /* test al,al (LOW-BYTE) */
  ISAAC_HUD_7706E0_VA_BIT_131 = 0x007709c5u,    /* test byte,0x10 */
  ISAAC_HUD_7706E0_VA_BIT_101 = 0x007709ebu,    /* test byte,8 */
  ISAAC_HUD_7706E0_VA_BIT_E7 = 0x00770a11u,     /* test byte,0x20 */
  ISAAC_HUD_7706E0_VA_BIT_B6 = 0x00770a37u,     /* test byte,0x40 */
  ISAAC_HUD_7706E0_VA_CALL_7DB8D0 = 0x00770a46u, /* call 0x7db8d0 */
  ISAAC_HUD_7706E0_VA_CMP_14A = 0x00770a4bu,    /* cmp ebx,0x14a (FULL) */
  ISAAC_HUD_7706E0_VA_7DB8D0_CMP_1 = 0x00770a53u, /* cmp eax,1 (FULL) */
  ISAAC_HUD_7706E0_VA_7DB8D0_AL_RET = 0x00770a58u, /* mov al,al epilogue */
  ISAAC_HUD_7706E0_VA_CMP_99 = 0x00770a6du,     /* cmp ebx,0x99 (FULL) */
  ISAAC_HUD_7706E0_VA_7DB8D0_CMP_2 = 0x00770a75u, /* cmp eax,2 (FULL) */
  ISAAC_HUD_7706E0_VA_LADDER = 0x00770a7eu,     /* v25 ladder entry */
  ISAAC_HUD_7706E0_VA_76_CMP = 0x00770af3u,     /* cmp ebx,0x76 (FULL) */
  ISAAC_HUD_7706E0_VA_76_JNE = 0x00770af6u,     /* jne 0x770b0c */
  ISAAC_HUD_7706E0_VA_CALL_9305F0_76 = 0x00770affu, /* call 0x9305f0(0x76) */
  ISAAC_HUD_7706E0_VA_76_TEST = 0x00770b04u,    /* test al,al (LOW-BYTE) */
  ISAAC_HUD_7706E0_VA_76_JNE_TRUE = 0x00770b06u, /* jne 0x770c29 TRUE */
  ISAAC_HUD_7706E0_VA_CHAIN_7DB8D0 = 0x00770a44u, /* shared chain target */
  ISAAC_HUD_7706E0_VA_EPILOGUE = 0x00770c3eu,   /* counter epilogue (v27) */
  ISAAC_HUD_7706E0_VA_TRUE = 0x00770c29u,       /* TRUE epilogue */
  ISAAC_HUD_7706E0_VA_REGION_C = 0x00770b0cu,   /* region-C head (v26/v27) */
  ISAAC_HUD_7706E0_HOST_VA_9E04B0 = 0x009e04b0u, /* trinket edge */
  ISAAC_HUD_7706E0_HOST_VA_771550 = 0x00771550u,  /* owned scan */
  ISAAC_HUD_7706E0_HOST_VA_7CB6E0 = 0x007cb6e0u,  /* count resolver */
  ISAAC_HUD_7706E0_HOST_VA_930680 = 0x00930680u,  /* 0x139 arm edge */
  ISAAC_HUD_7706E0_HOST_VA_A23920 = 0x00a23920u,  /* room find pair */
  ISAAC_HUD_7706E0_HOST_VA_90C300 = 0x0090c300u,  /* room find resolve */
  ISAAC_HUD_7706E0_HOST_VA_7DA770 = 0x007da770u,  /* 0x3b arm edge */
  ISAAC_HUD_7706E0_HOST_VA_7DB8D0 = 0x007db8d0u,  /* resolver chain */
  ISAAC_HUD_7706E0_HOST_VA_9305F0 = 0x009305f0u,  /* 0x76-id host */
  ISAAC_HUD_7706E0_GAME_GLOBAL = 0x00c71678u,
  ISAAC_HUD_7706E0_ROOM_GLOBAL = 0x00c7169cu,
  ISAAC_HUD_7706E0_OFF_20A9 = 0x20a9u,          /* interior byte gate */
  ISAAC_HUD_7706E0_OFF_26614 = 0x26614u,        /* g_game interior cmp */
  ISAAC_HUD_7706E0_OFF_CFG_B8 = 0xb8u,          /* cfg 0x8000 bit */
  ISAAC_HUD_7706E0_OFF_HELD_ID = 0x2ef4u,
  ISAAC_HUD_7706E0_OFF_HELD_FLAG = 0x2ef0u,
  ISAAC_HUD_7706E0_OFF_1FC8 = 0x1fc8u,          /* 0x9e04b0 receiver */
  ISAAC_HUD_7706E0_OFF_264F8 = 0x264f8u,        /* g_game mod4 source */
  ISAAC_HUD_7706E0_OFF_13C0 = 0x13c0u,          /* player mode */
  ISAAC_HUD_7706E0_OFF_1508 = 0x1508u,          /* 0x930680/0x9305f0 rcv */
  ISAAC_HUD_7706E0_OFF_1E4C = 0x1e4cu,          /* 0xa23920 receiver */
  ISAAC_HUD_7706E0_OFF_ROOM_BEGIN = 0x4b3d8u,
  ISAAC_HUD_7706E0_OFF_ROOM_END = 0x4b3dcu,
  ISAAC_HUD_7706E0_OFF_ROOM_8 = 8u,
  ISAAC_HUD_7706E0_OFF_ROOM_DEFAULT = 0x14u,    /* &room[0x14] fallback */
  ISAAC_HUD_7706E0_OFF_V_132 = 0x132u,          /* byte[v+0x132] */
  ISAAC_HUD_7706E0_OFF_26630 = 0x26630u,        /* g_game ja UNSIGNED */
  ISAAC_HUD_7706E0_OFF_26589 = 0x26589u,        /* g_game byte gate */
  ISAAC_HUD_7706E0_OFF_2028 = 0x2028u,          /* bit-arm byte field */
  ISAAC_HUD_7706E0_ID_147 = 0x147u,
  ISAAC_HUD_7706E0_ID_148 = 0x148u,
  ISAAC_HUD_7706E0_ID_9 = 9u,
  ISAAC_HUD_7706E0_ID_139 = 0x139u,
  ISAAC_HUD_7706E0_ID_3B = 0x3bu,
  ISAAC_HUD_7706E0_ID_131 = 0x131u,
  ISAAC_HUD_7706E0_ID_101 = 0x101u,
  ISAAC_HUD_7706E0_ID_E7 = 0xe7u,
  ISAAC_HUD_7706E0_ID_B6 = 0xb6u,
  ISAAC_HUD_7706E0_ID_14A = 0x14au,
  ISAAC_HUD_7706E0_ID_99 = 0x99u,
  ISAAC_HUD_7706E0_ID_76 = 0x76u,
  ISAAC_HUD_7706E0_ARG_15 = 0x15u,              /* 0x771550 + 0x7cb6e0 arg */
  ISAAC_HUD_7706E0_ARG_70 = 0x70u,              /* 0x930680 arg */
  ISAAC_HUD_7706E0_264F8_MOD_MASK = 0x80000003u, /* signed mod-4 mask */
  ISAAC_HUD_7706E0_CFG_B8_BIT = 0x8000u,
  ISAAC_HUD_7706E0_2028_BIT_131 = 0x10u,
  ISAAC_HUD_7706E0_2028_BIT_101 = 0x8u,
  ISAAC_HUD_7706E0_2028_BIT_E7 = 0x20u,
  ISAAC_HUD_7706E0_2028_BIT_B6 = 0x40u,
  ISAAC_HUD_7706E0_26614_THRESHOLD = 2u,        /* interior jge */
  ISAAC_HUD_7706E0_COUNT_LE1 = 1u,              /* count jle imm */
  ISAAC_HUD_7706E0_7DB8D0_EQ_1 = 1u,
  ISAAC_HUD_7706E0_7DB8D0_EQ_2 = 2u,
  ISAAC_HUD_7706E0_MODE_A = 0xau,               /* 0x139 arm direct mode */
  ISAAC_HUD_7706E0_MODE_1F = 0x1fu,             /* 0x139 arm chain mode */
  ISAAC_HUD_7706E0_ROOM_8_EQ = 2u,
  ISAAC_HUD_7706E0_EXIT_FALSE_INTERIOR = 0,
  ISAAC_HUD_7706E0_EXIT_TRUE_HELD = 1,
  ISAAC_HUD_7706E0_EXIT_NEGATIVE_ARM = 2,
  ISAAC_HUD_7706E0_EXIT_EPILOGUE_FLAG = 3,
  ISAAC_HUD_7706E0_EXIT_TRUE_147148 = 4,
  ISAAC_HUD_7706E0_EXIT_TRUE_139 = 5,
  ISAAC_HUD_7706E0_EXIT_TRUE_9 = 6,
  ISAAC_HUD_7706E0_EXIT_TRUE_3B = 7,
  ISAAC_HUD_7706E0_EXIT_TRUE_BITS = 8,
  ISAAC_HUD_7706E0_EXIT_TRUE_14A99 = 9,
  ISAAC_HUD_7706E0_EXIT_TRUE_LADDER = 10,
  ISAAC_HUD_7706E0_EXIT_TRUE_TAILGATE = 11,
  ISAAC_HUD_7706E0_EXIT_REGION_C = 12,
  ISAAC_HUD_7706E0_STAGE_76_ARM = 1,            /* plan bit: 0x76 edge */
  ISAAC_HUD_7706E0_STAGE_NEGATIVE = 2,          /* plan bit: 0x9e04b0 */
  ISAAC_HUD_7706E0_STAGE_1550 = 4,              /* plan bit: 0x771550 */
  ISAAC_HUD_7706E0_STAGE_COUNT = 8,             /* plan bit: 0x7cb6e0 */
  ISAAC_HUD_7706E0_STAGE_930680 = 0x10,         /* plan bit: 0x930680 */
  ISAAC_HUD_7706E0_STAGE_PAIR = 0x20,           /* plan bit: a23920+90c300 */
  ISAAC_HUD_7706E0_STAGE_7DA770 = 0x40,         /* plan bit: 0x7da770 */
  ISAAC_HUD_7706E0_STAGE_7DB8D0 = 0x80,         /* plan bit: 0x7db8d0 */
  ISAAC_HUD_7706E0_STAGE_LADDER = 0x100,        /* plan bit: ladder edges */
  ISAAC_HUD_7706E0_STAGE_TAIL = 0x200,          /* plan bit: 0x771200 */
  ISAAC_HUD_7706E0_ARM_BIT_147 = 1,             /* E1 147148 bit */
  ISAAC_HUD_7706E0_ARM_BIT_148 = 2,
  ISAAC_HUD_7706E0_ARM_BIT_139 = 4,
  ISAAC_HUD_7706E0_ARM_BIT_9 = 8,
  ISAAC_HUD_7706E0_ARM_BIT_3B = 0x10,
  ISAAC_HUD_7706E0_ARM_BIT_131 = 0x20,
  ISAAC_HUD_7706E0_ARM_BIT_101 = 0x40,
  ISAAC_HUD_7706E0_ARM_BIT_E7 = 0x80,
  ISAAC_HUD_7706E0_ARM_BIT_B6 = 0x100,
  ISAAC_HUD_7706E0_ARM_BIT_14A = 0x200,
  ISAAC_HUD_7706E0_ARM_BIT_99 = 0x400,
  ISAAC_HUD_7706E0_ARM_BIT_76 = 0x800
};

/* Composed parent branch selection (helpers ABI v30). Machine-order
   walk over the v30 gate laws + the v25 9-arm/ladder laws + the v28
   tail gate; the region-C tail plan (v27) stays the caller's next
   step (exit_kind REGION_C). result is the 0/1 return the PE would
   produce on the chosen exit (0 for FALSE_INTERIOR / FALSE_216 /
   EPILOGUE-FLAG needs the v27 epilogue count; negative-arm result =
   LOW(r_9e04b0)). */
typedef struct IsaacHud7706e0BranchPlan {
  int32_t exit_kind;        /* +0x0  EXIT_* enum */
  int32_t result;           /* +0x4  0/1 (0 when unknown/region C) */
  int32_t stages;           /* +0x8  STAGE_* bits that fired */
  int32_t arm_bits;         /* +0xc  ARM_BIT_* TRUE-arm bits */
  int32_t host_edge_count;  /* +0x10 host edges in machine order */
  int32_t interior_false;   /* +0x14 A1 */
  int32_t held_true;        /* +0x18 A2 */
  int32_t id_negative;      /* +0x1c A3 */
  int32_t flag_epilogue;    /* +0x20 A5 */
  int32_t arm_147148;       /* +0x24 A8 */
  int32_t arm_139;          /* +0x28 B2 mode gate */
  int32_t room_game;        /* +0x2c B4 */
  int32_t arm_9;            /* +0x30 v25 770915 result */
  int32_t arm_3b;           /* +0x34 C1 */
  int32_t bit_arm;          /* +0x38 C2 (matching id arm) */
  int32_t arm_14a99;        /* +0x3c C3 */
  int32_t ladder_open;      /* +0x40 v25 770a7e open */
  int32_t ladder_hit;       /* +0x44 v25 770a7e table hit */
  int32_t arm_76;           /* +0x48 D1 */
  int32_t tail_gate;        /* +0x4c v28 770ae2 open */
} IsaacHud7706e0BranchPlan;

int32_t isaac_hud_7706e0_interior_false(uint32_t byte_20a9,
                                        uint32_t game_26614,
                                        uint32_t cfg_b8);
int32_t isaac_hud_7706e0_held_true(uint32_t held_id, uint32_t id,
                                   uint32_t held_flag);
int32_t isaac_hud_7706e0_id_negative(uint32_t id);
int32_t isaac_hud_7706e0_trinket_return(uint32_t r_9e04b0);
int32_t isaac_hud_7706e0_flag_epilogue(uint32_t flag);
int32_t isaac_hud_7706e0_arm_147148_open(uint32_t id);
int32_t isaac_hud_7706e0_mod4(uint32_t game_264f8);
int32_t isaac_hud_7706e0_arm_147148_hit(uint32_t id, uint32_t r_771550,
                                        int32_t mod4, uint32_t count);
int32_t isaac_hud_7706e0_arm_139_open(uint32_t id);
int32_t isaac_hud_7706e0_139_mode_gate(uint32_t mode, uint32_t r_930680);
int32_t isaac_hud_7706e0_139_byte132(uint32_t byte_132);
int32_t isaac_hud_7706e0_room_game_true(uint32_t room_8, uint32_t g_game,
                                        uint32_t g_game_26630,
                                        uint32_t g_game_26589);
int32_t isaac_hud_7706e0_arm_3b_open(uint32_t id, uint32_t r_7da770);
int32_t isaac_hud_7706e0_arm_bit_open(uint32_t id, uint32_t byte_2028);
int32_t isaac_hud_7706e0_14a99_gate(uint32_t id, uint32_t r_7db8d0);
int32_t isaac_hud_7706e0_arm_76_open(uint32_t r_9305f0);
void isaac_hud_7706e0_branch_plan(
    uint32_t id,
    uint32_t flag,
    uint32_t cfg_b8,
    uint32_t byte_20a9,
    uint32_t game_26614,
    uint32_t held_id,
    uint32_t held_flag,
    uint32_t r_9e04b0,
    uint32_t r_771550,
    uint32_t game_264f8,
    uint32_t count_7cb6e0,
    uint32_t mode,
    uint32_t r_930680,
    uint32_t byte_132,
    uint32_t room_begin,
    uint32_t room_end,
    uint32_t room_8,
    uint32_t g_game,
    uint32_t g_game_26630,
    uint32_t g_game_26589,
    uint32_t r_7da770,
    uint32_t byte_2028,
    uint32_t r_7db8d0,
    uint32_t count_a,
    uint32_t count_b,
    uint32_t extra,
    uint32_t r_771550_5d,
    uint32_t p18300_4,
    uint32_t p18300_4_58,
    uint32_t r_771200,
    uint32_t r_9305f0_76,
    IsaacHud7706e0BranchPlan* out);
uint32_t isaac_hud_7706e0_va_false(void);
uint32_t isaac_hud_7706e0_va_interior_head(void);
uint32_t isaac_hud_7706e0_va_interior_26614_load(void);
uint32_t isaac_hud_7706e0_va_interior_26614_cmp(void);
uint32_t isaac_hud_7706e0_va_interior_26614_jge(void);
uint32_t isaac_hud_7706e0_va_interior_cfg_b8(void);
uint32_t isaac_hud_7706e0_va_interior_cfg_and(void);
uint32_t isaac_hud_7706e0_va_interior_cfg_je(void);
uint32_t isaac_hud_7706e0_va_held_head(void);
uint32_t isaac_hud_7706e0_va_held_test(void);
uint32_t isaac_hud_7706e0_va_held_cmp(void);
uint32_t isaac_hud_7706e0_va_held_byte(void);
uint32_t isaac_hud_7706e0_va_held_jne_true(void);
uint32_t isaac_hud_7706e0_va_neg_test(void);
uint32_t isaac_hud_7706e0_va_neg_jns(void);
uint32_t isaac_hud_7706e0_va_neg_call(void);
uint32_t isaac_hud_7706e0_va_neg_ret(void);
uint32_t isaac_hud_7706e0_va_flag_cmp(void);
uint32_t isaac_hud_7706e0_va_flag_jne_epilogue(void);
uint32_t isaac_hud_7706e0_va_cmp_147(void);
uint32_t isaac_hud_7706e0_va_cmp_148(void);
uint32_t isaac_hud_7706e0_va_1550_call(void);
uint32_t isaac_hud_7706e0_va_1550_test(void);
uint32_t isaac_hud_7706e0_va_mod4_and(void);
uint32_t isaac_hud_7706e0_va_mod4_jns(void);
uint32_t isaac_hud_7706e0_va_mod4_fixup(void);
uint32_t isaac_hud_7706e0_va_count_call(void);
uint32_t isaac_hud_7706e0_va_count_cmp(void);
uint32_t isaac_hud_7706e0_va_count_jle(void);
uint32_t isaac_hud_7706e0_va_rule_n_le1_mod0(void);
uint32_t isaac_hud_7706e0_va_rule_n_le1_mod1(void);
uint32_t isaac_hud_7706e0_va_rule_n_le1_chk(void);
uint32_t isaac_hud_7706e0_va_rule_n_gt1_chk(void);
uint32_t isaac_hud_7706e0_va_rule_n_gt1_mod1(void);
uint32_t isaac_hud_7706e0_va_cmp_139(void);
uint32_t isaac_hud_7706e0_va_mode_a_cmp(void);
uint32_t isaac_hud_7706e0_va_call_930680(void);
uint32_t isaac_hud_7706e0_va_930680_test(void);
uint32_t isaac_hud_7706e0_va_mode_1f_cmp(void);
uint32_t isaac_hud_7706e0_va_room_begin_cmp(void);
uint32_t isaac_hud_7706e0_va_pair_call(void);
uint32_t isaac_hud_7706e0_va_resolve_call(void);
uint32_t isaac_hud_7706e0_va_cmovne(void);
uint32_t isaac_hud_7706e0_va_byte132_cmp(void);
uint32_t isaac_hud_7706e0_va_byte132_jne(void);
uint32_t isaac_hud_7706e0_va_room_8_cmp(void);
uint32_t isaac_hud_7706e0_va_room_8_jne(void);
uint32_t isaac_hud_7706e0_va_game_test(void);
uint32_t isaac_hud_7706e0_va_game_je(void);
uint32_t isaac_hud_7706e0_va_26630_cmp(void);
uint32_t isaac_hud_7706e0_va_26630_ja(void);
uint32_t isaac_hud_7706e0_va_26589_cmp(void);
uint32_t isaac_hud_7706e0_va_shared_jne_true(void);
uint32_t isaac_hud_7706e0_va_cmp_3b(void);
uint32_t isaac_hud_7706e0_va_call_7da770(void);
uint32_t isaac_hud_7706e0_va_7da770_test(void);
uint32_t isaac_hud_7706e0_va_bit_131(void);
uint32_t isaac_hud_7706e0_va_bit_101(void);
uint32_t isaac_hud_7706e0_va_bit_e7(void);
uint32_t isaac_hud_7706e0_va_bit_b6(void);
uint32_t isaac_hud_7706e0_va_call_7db8d0(void);
uint32_t isaac_hud_7706e0_va_cmp_14a(void);
uint32_t isaac_hud_7706e0_va_7db8d0_cmp_1(void);
uint32_t isaac_hud_7706e0_va_7db8d0_al_ret(void);
uint32_t isaac_hud_7706e0_va_cmp_99(void);
uint32_t isaac_hud_7706e0_va_7db8d0_cmp_2(void);
uint32_t isaac_hud_7706e0_va_ladder(void);
uint32_t isaac_hud_7706e0_va_76_cmp(void);
uint32_t isaac_hud_7706e0_va_76_jne(void);
uint32_t isaac_hud_7706e0_va_call_9305f0_76(void);
uint32_t isaac_hud_7706e0_va_76_test(void);
uint32_t isaac_hud_7706e0_va_76_jne_true(void);
uint32_t isaac_hud_7706e0_va_chain_7db8d0(void);
uint32_t isaac_hud_7706e0_va_epilogue(void);
uint32_t isaac_hud_7706e0_va_true(void);
uint32_t isaac_hud_7706e0_va_region_c(void);
uint32_t isaac_hud_7706e0_host_va_9e04b0(void);
uint32_t isaac_hud_7706e0_host_va_771550(void);
uint32_t isaac_hud_7706e0_host_va_7cb6e0(void);
uint32_t isaac_hud_7706e0_host_va_930680(void);
uint32_t isaac_hud_7706e0_host_va_a23920(void);
uint32_t isaac_hud_7706e0_host_va_90c300(void);
uint32_t isaac_hud_7706e0_host_va_7da770(void);
uint32_t isaac_hud_7706e0_host_va_7db8d0(void);
uint32_t isaac_hud_7706e0_host_va_9305f0(void);
uint32_t isaac_hud_7706e0_game_global(void);
uint32_t isaac_hud_7706e0_room_global(void);
uint32_t isaac_hud_7706e0_off_20a9(void);
uint32_t isaac_hud_7706e0_off_26614(void);
uint32_t isaac_hud_7706e0_off_cfg_b8(void);
uint32_t isaac_hud_7706e0_off_held_id(void);
uint32_t isaac_hud_7706e0_off_held_flag(void);
uint32_t isaac_hud_7706e0_off_1fc8(void);
uint32_t isaac_hud_7706e0_off_264f8(void);
uint32_t isaac_hud_7706e0_off_13c0(void);
uint32_t isaac_hud_7706e0_off_1508(void);
uint32_t isaac_hud_7706e0_off_1e4c(void);
uint32_t isaac_hud_7706e0_off_room_begin(void);
uint32_t isaac_hud_7706e0_off_room_end(void);
uint32_t isaac_hud_7706e0_off_room_8(void);
uint32_t isaac_hud_7706e0_off_room_default(void);
uint32_t isaac_hud_7706e0_off_v_132(void);
uint32_t isaac_hud_7706e0_off_26630(void);
uint32_t isaac_hud_7706e0_off_26589(void);
uint32_t isaac_hud_7706e0_off_2028(void);
uint32_t isaac_hud_7706e0_id_147(void);
uint32_t isaac_hud_7706e0_id_148(void);
uint32_t isaac_hud_7706e0_id_139(void);
uint32_t isaac_hud_7706e0_id_3b(void);
uint32_t isaac_hud_7706e0_id_131(void);
uint32_t isaac_hud_7706e0_id_101(void);
uint32_t isaac_hud_7706e0_id_e7(void);
uint32_t isaac_hud_7706e0_id_b6(void);
uint32_t isaac_hud_7706e0_id_14a(void);
uint32_t isaac_hud_7706e0_id_99(void);
uint32_t isaac_hud_7706e0_id_76(void);
uint32_t isaac_hud_7706e0_arg_15(void);
uint32_t isaac_hud_7706e0_arg_70(void);
uint32_t isaac_hud_7706e0_264f8_mod_mask(void);
uint32_t isaac_hud_7706e0_cfg_b8_bit(void);
uint32_t isaac_hud_7706e0_2028_bit_131(void);
uint32_t isaac_hud_7706e0_2028_bit_101(void);
uint32_t isaac_hud_7706e0_2028_bit_e7(void);
uint32_t isaac_hud_7706e0_2028_bit_b6(void);
uint32_t isaac_hud_7706e0_26614_threshold(void);
uint32_t isaac_hud_7706e0_count_le1(void);
uint32_t isaac_hud_7706e0_7db8d0_eq_1(void);
uint32_t isaac_hud_7706e0_7db8d0_eq_2(void);
uint32_t isaac_hud_7706e0_mode_a(void);
uint32_t isaac_hud_7706e0_mode_1f(void);
uint32_t isaac_hud_7706e0_room_8_eq(void);
int32_t isaac_hud_7706e0_exit_false_interior(void);
int32_t isaac_hud_7706e0_exit_true_held(void);
int32_t isaac_hud_7706e0_exit_negative_arm(void);
int32_t isaac_hud_7706e0_exit_epilogue_flag(void);
int32_t isaac_hud_7706e0_exit_true_147148(void);
int32_t isaac_hud_7706e0_exit_true_139(void);
int32_t isaac_hud_7706e0_exit_true_9(void);
int32_t isaac_hud_7706e0_exit_true_3b(void);
int32_t isaac_hud_7706e0_exit_true_bits(void);
int32_t isaac_hud_7706e0_exit_true_14a99(void);
int32_t isaac_hud_7706e0_exit_true_ladder(void);
int32_t isaac_hud_7706e0_exit_true_tailgate(void);
int32_t isaac_hud_7706e0_exit_region_c(void);
uint32_t isaac_hud_7706e0_stage_76_arm(void);
uint32_t isaac_hud_7706e0_stage_negative(void);
uint32_t isaac_hud_7706e0_stage_1550(void);
uint32_t isaac_hud_7706e0_stage_count(void);
uint32_t isaac_hud_7706e0_stage_930680(void);
uint32_t isaac_hud_7706e0_stage_pair(void);
uint32_t isaac_hud_7706e0_stage_7da770(void);
uint32_t isaac_hud_7706e0_stage_7db8d0(void);
uint32_t isaac_hud_7706e0_stage_ladder(void);
uint32_t isaac_hud_7706e0_stage_tail(void);
uint32_t isaac_hud_7706e0_arm_bit_147(void);
uint32_t isaac_hud_7706e0_arm_bit_148(void);
uint32_t isaac_hud_7706e0_arm_bit_139(void);
uint32_t isaac_hud_7706e0_arm_bit_9(void);
uint32_t isaac_hud_7706e0_arm_bit_3b(void);
uint32_t isaac_hud_7706e0_arm_bit_131(void);
uint32_t isaac_hud_7706e0_arm_bit_101(void);
uint32_t isaac_hud_7706e0_arm_bit_e7(void);
uint32_t isaac_hud_7706e0_arm_bit_b6(void);
uint32_t isaac_hud_7706e0_arm_bit_14a(void);
uint32_t isaac_hud_7706e0_arm_bit_99(void);
uint32_t isaac_hud_7706e0_arm_bit_76(void);

/* Helpers ABI v31 (0x00771620): the HasCollectible SIBLING leaf
   `bool __thiscall has(p, id)` (0x00771620..0x007716bd, ret 4,
   this=player, id = dword [ebp+8] FULL; the first caller-bearing
   unlanded PURE body of the hud-v31-scan band re-scan 0x770000..
   0x772000 + the 0x76xxxx callers). Store census: ONE cookie local
   ([ebp-4]); zero observable stores. E8 census: 2 x 0x7706e0
   (LANDED v25-v30, consumed as LOW-byte samples in-family). Caller
   census: 6 sites (0x6ecab4 / 0x74dc45 push 0x98 / 0x7616ad push
   0x79 — sibling of the 0x7616a0 0x771550 call / 0x794fa4 /
   0x796cb8 push 0x19 — after a 0x7cb6e0(0x19) count / 0x796d28).
   Machine order:
     width = 1 + (LOW(r_8b) != 0 || LOW(r_1ca) != 0) — ids 0x8b then
       0x1ca via 0x7706e0(player, id, 0); the 0x1ca call SHORT-
       CIRCUITED when LOW(r_8b) != 0 (0x77163f jne 0x771653);
     slot scan p+0x16c0, stride 4, i in [0, width) UNSIGNED (0x77167c
       cmp ecx,edi ; jb): TRUE iff (slot & 0x7fff) == id (FULL after
       the and) && (slot & 0x8000) != 0 (0x771663..0x771676);
     list word (int16)[dword[p+0x1748] + id*4 + 2] > 0 SIGNED
       (0x771689 cmp word ptr,0 ; jg 0x77168f);
     held (dword[p+0x2ef8] & 0x7fff) == id (FULL) && (dword[p+0x2ef8]
       & 0x8000) != 0 (0x771699..0x7716a8);
   TRUE exit 0x7716b5 is the SHARED target of slot/word/held; FALSE
   epilogue 0x7716b2. Byte gates all uint32_t + & 0xff (0x100 CLOSED;
   the 0x7706e0 results are al test 0x77163d/0x77164f); no uint8_t
   params; wasm32 compare-flip class: loop jb UNSIGNED, word jg
   SIGNED 16-bit. Evidence: section-notes/hud-v31-scan/NOTES.md +
   cpu-dump/00771620.txt. */

enum {
  ISAAC_HUD_771620_VA_HEAD = 0x00771620u,   /* push ebp */
  ISAAC_HUD_771620_VA_WIDTH_1 = 0x0077162bu, /* mov edi,1 */
  ISAAC_HUD_771620_VA_WIDTH_2 = 0x00771653u, /* mov edi,2 */
  ISAAC_HUD_771620_VA_CALL_8B = 0x00771638u, /* call 0x7706e0(p,0x8b,0) */
  ISAAC_HUD_771620_VA_TEST_8B = 0x0077163du, /* test al,al (LOW) */
  ISAAC_HUD_771620_VA_CALL_1CA = 0x0077164au, /* call 0x7706e0(p,0x1ca,0) */
  ISAAC_HUD_771620_VA_TEST_1CA = 0x0077164fu, /* test al,al (LOW) */
  ISAAC_HUD_771620_VA_SLOTS_LEA = 0x00771658u, /* lea edx,[p+0x16c0] */
  ISAAC_HUD_771620_VA_SLOT_LOAD = 0x00771663u, /* mov esi,[edx] */
  ISAAC_HUD_771620_VA_SLOT_AND = 0x00771667u, /* and eax,0x7fff */
  ISAAC_HUD_771620_VA_SLOT_CMP = 0x0077166cu, /* cmp eax,ebx (FULL) */
  ISAAC_HUD_771620_VA_SLOT_TEST = 0x00771670u, /* test esi,0x8000 */
  ISAAC_HUD_771620_VA_SLOT_JNE_TRUE = 0x00771676u, /* jne 0x7716b5 */
  ISAAC_HUD_771620_VA_LOOP_CMP = 0x0077167cu, /* cmp ecx,edi */
  ISAAC_HUD_771620_VA_LOOP_JB = 0x0077167eu,  /* jb (UNSIGNED) */
  ISAAC_HUD_771620_VA_LIST_LOAD = 0x00771683u, /* mov eax,[p+0x1748] */
  ISAAC_HUD_771620_VA_WORD_CMP = 0x00771689u, /* cmp word [lst+id*4+2],0 */
  ISAAC_HUD_771620_VA_WORD_JG = 0x0077168fu,  /* jg 0x7716b5 (SIGNED) */
  ISAAC_HUD_771620_VA_HELD_LOAD = 0x00771691u, /* mov ecx,[p+0x2ef8] */
  ISAAC_HUD_771620_VA_HELD_AND = 0x00771699u, /* and eax,0x7fff */
  ISAAC_HUD_771620_VA_HELD_CMP = 0x0077169eu, /* cmp eax,ebx (FULL) */
  ISAAC_HUD_771620_VA_HELD_JNE_FALSE = 0x007716a0u, /* jne 0x7716aa */
  ISAAC_HUD_771620_VA_HELD_TEST = 0x007716a2u, /* test ecx,0x8000 */
  ISAAC_HUD_771620_VA_HELD_JNE_TRUE = 0x007716a8u, /* jne 0x7716b5 */
  ISAAC_HUD_771620_VA_FALSE = 0x007716aau,    /* FALSE epilogue */
  ISAAC_HUD_771620_VA_RET_FALSE = 0x007716b2u, /* ret 4 */
  ISAAC_HUD_771620_VA_TRUE = 0x007716b5u,     /* TRUE epilogue (shared) */
  ISAAC_HUD_771620_VA_RET_TRUE = 0x007716bdu, /* ret 4 */
  ISAAC_HUD_771620_HOST_VA_7706E0 = 0x007706e0u, /* the two HasCollectible edges */
  ISAAC_HUD_771620_OFF_SLOTS = 0x16c0u,       /* slot vector */
  ISAAC_HUD_771620_OFF_LIST = 0x1748u,        /* list ptr (word elem +2) */
  ISAAC_HUD_771620_OFF_HELD = 0x2ef8u,        /* held id dword */
  ISAAC_HUD_771620_OFF_WORD = 2u,             /* word at [list + id*4 + 2] */
  ISAAC_HUD_771620_ID_8B = 0x8bu,
  ISAAC_HUD_771620_ID_1CA = 0x1cau,
  ISAAC_HUD_771620_SLOT_MASK = 0x7fffu,
  ISAAC_HUD_771620_SLOT_BIT = 0x8000u,
  ISAAC_HUD_771620_WIDTH_BASE = 1u,
  ISAAC_HUD_771620_ARG_FLAG = 0u,             /* flag arg of both calls */
  ISAAC_HUD_771620_STAGE_SLOT = 1,            /* plan bit: slot scan */
  ISAAC_HUD_771620_STAGE_LIST = 2,            /* plan bit: list word */
  ISAAC_HUD_771620_STAGE_HELD = 4             /* plan bit: held gate */
};

/* Composed machine-order plan of 0x00771620 (helpers ABI v31). result
   = the 0/1 return of the PE (TRUE exit 0x7716b5); stages = the
   STAGE_* bits of the stages that ran (slot scan always runs first;
   list/held skipped when the slot scan already exited TRUE); the
   slot1 sample is consumed only when width == 2. host_edge_count =
   1 + 1ca_edge_needed (the 0x1ca edge fires iff the 0x8b call
   closed — 0x77163f short-circuit). */
typedef struct IsaacHud771620Plan {
  int32_t result;          /* +0x0 0/1 (exit TRUE 0x7716b5) */
  int32_t stages;          /* +0x4 STAGE_SLOT|STAGE_LIST|STAGE_HELD */
  int32_t host_edge_count; /* +0x8 1..2 (0x7706e0 edges) */
  int32_t width;           /* +0xc 1/2 */
  int32_t eight_b_open;    /* +0x10 L1 */
  int32_t one_ca_open;     /* +0x14 L2 */
  int32_t one_ca_edge;     /* +0x18 L4 */
  int32_t slot0_hit;       /* +0x1c L5 slot0 */
  int32_t slot1_hit;       /* +0x20 L5 slot1 (width==2 only) */
  int32_t list_word_true;  /* +0x24 L7 */
  int32_t held_true;       /* +0x28 L8 */
} IsaacHud771620Plan;

int32_t isaac_hud_771620_8b_open(uint32_t r_8b);
int32_t isaac_hud_771620_1ca_open(uint32_t r_1ca);
int32_t isaac_hud_771620_scan_width(uint32_t r_8b, uint32_t r_1ca);
int32_t isaac_hud_771620_1ca_edge_needed(uint32_t r_8b);
int32_t isaac_hud_771620_slot_hit(uint32_t slot, uint32_t id);
int32_t isaac_hud_771620_loop_continue(uint32_t index, uint32_t width);
int32_t isaac_hud_771620_list_word_true(uint32_t word);
int32_t isaac_hud_771620_held_true(uint32_t held, uint32_t id);
void isaac_hud_771620_plan(uint32_t id, uint32_t r_8b, uint32_t r_1ca,
                           uint32_t slot0, uint32_t slot1,
                           uint32_t list_word, uint32_t held,
                           IsaacHud771620Plan* out);
uint32_t isaac_hud_771620_va_head(void);
uint32_t isaac_hud_771620_va_width_1(void);
uint32_t isaac_hud_771620_va_width_2(void);
uint32_t isaac_hud_771620_va_call_8b(void);
uint32_t isaac_hud_771620_va_test_8b(void);
uint32_t isaac_hud_771620_va_call_1ca(void);
uint32_t isaac_hud_771620_va_test_1ca(void);
uint32_t isaac_hud_771620_va_slots_lea(void);
uint32_t isaac_hud_771620_va_slot_load(void);
uint32_t isaac_hud_771620_va_slot_and(void);
uint32_t isaac_hud_771620_va_slot_cmp(void);
uint32_t isaac_hud_771620_va_slot_test(void);
uint32_t isaac_hud_771620_va_slot_jne_true(void);
uint32_t isaac_hud_771620_va_loop_cmp(void);
uint32_t isaac_hud_771620_va_loop_jb(void);
uint32_t isaac_hud_771620_va_list_load(void);
uint32_t isaac_hud_771620_va_word_cmp(void);
uint32_t isaac_hud_771620_va_word_jg(void);
uint32_t isaac_hud_771620_va_held_load(void);
uint32_t isaac_hud_771620_va_held_and(void);
uint32_t isaac_hud_771620_va_held_cmp(void);
uint32_t isaac_hud_771620_va_held_jne_false(void);
uint32_t isaac_hud_771620_va_held_test(void);
uint32_t isaac_hud_771620_va_held_jne_true(void);
uint32_t isaac_hud_771620_va_false(void);
uint32_t isaac_hud_771620_va_ret_false(void);
uint32_t isaac_hud_771620_va_true(void);
uint32_t isaac_hud_771620_va_ret_true(void);
uint32_t isaac_hud_771620_host_va_7706e0(void);
uint32_t isaac_hud_771620_off_slots(void);
uint32_t isaac_hud_771620_off_list(void);
uint32_t isaac_hud_771620_off_held(void);
uint32_t isaac_hud_771620_off_word(void);
uint32_t isaac_hud_771620_id_8b(void);
uint32_t isaac_hud_771620_id_1ca(void);
uint32_t isaac_hud_771620_slot_mask(void);
uint32_t isaac_hud_771620_slot_bit(void);
uint32_t isaac_hud_771620_width_base(void);
uint32_t isaac_hud_771620_arg_flag(void);
int32_t isaac_hud_771620_stage_slot(void);
int32_t isaac_hud_771620_stage_list(void);
int32_t isaac_hud_771620_stage_held(void);

/* Helpers ABI v32 (0x007716c0): the HasCollectible sibling-family leaf
   `bool __stdcall is_trinket_id(id)` (0x007716c0..0x007716e2, ret 4,
   id = dword [ebp+8] FULL; the "next frontier" of the hud-v31-scan
   band table — PURE leaf, 2 callers). Store census: ZERO mem-stores
   (no cookie frame). E8 census: 0 (host_edge_count = 0). Indirect:
   0. Caller census (direct rel32, corrected scan_band.py): 2 sites —
   0x6ec2f2 (0x6exxxx region) and 0x77174d (inside host 0x7716f0, the
   virtual-eax HOST of the 0x7716c0/0x7716f0 pair — stays host).
   identify-zhl: MISS (no exact ZHL signature; zhl-batch6 row).
   Machine order:
     masked = id & 0x7fff (FULL dword and, 0x7716c6 — UNSIGNED, bit
       15 cleared so the compare operand is always in [0, 0x7fff]);
     TRUE iff masked == 0x29 (0x7716cb cmp eax,0x29 ; 0x7716ce je
       0x7716dd) or masked == 0x87 (0x7716d0 cmp eax,0x87 ;
       0x7716d5 je 0x7716dd); else FALSE (xor al,al 0x7716d7).
   TRUE exit 0x7716dd is the SHARED target of both je's; FALSE
   epilogue 0x7716d7; both `ret 4`. NO byte gates in this body (no
   test al/al — every gate is a FULL-dword equality after the FULL-
   dword and; the v8 "byte-gate uint32_t + & 0xff" class is N/A here)
   and NO signed compare (compare-flip class: equality is sign-
   agnostic; the mask is the unsigned 0x7fff). All parameters
   uint32_t; no uint8_t. Evidence:
   section-notes/hud-v32-7716c0/NOTES.md + cpu-dump/007716c0.txt. */

enum {
  ISAAC_HUD_7716C0_VA_HEAD = 0x007716c0u,    /* push ebp */
  ISAAC_HUD_7716C0_VA_AND = 0x007716c6u,     /* and eax,0x7fff */
  ISAAC_HUD_7716C0_VA_CMP_A = 0x007716cbu,   /* cmp eax,0x29 */
  ISAAC_HUD_7716C0_VA_JE_A = 0x007716ceu,    /* je 0x7716dd */
  ISAAC_HUD_7716C0_VA_CMP_B = 0x007716d0u,   /* cmp eax,0x87 */
  ISAAC_HUD_7716C0_VA_JE_B = 0x007716d5u,    /* je 0x7716dd */
  ISAAC_HUD_7716C0_VA_FALSE = 0x007716d7u,   /* FALSE epilogue (xor al,al) */
  ISAAC_HUD_7716C0_VA_RET_FALSE = 0x007716dau, /* ret 4 */
  ISAAC_HUD_7716C0_VA_TRUE = 0x007716ddu,    /* TRUE epilogue (shared) */
  ISAAC_HUD_7716C0_VA_RET_TRUE = 0x007716e0u, /* ret 4 */
  ISAAC_HUD_7716C0_ID_A = 0x29u,
  ISAAC_HUD_7716C0_ID_B = 0x87u,
  ISAAC_HUD_7716C0_ID_MASK = 0x7fffu,
  ISAAC_HUD_7716C0_STAGE_COMPARE = 1         /* plan bit: mask+compare */
};

/* Composed machine-order plan of 0x007716c0 (helpers ABI v32). result
   = the 0/1 return of the PE (TRUE exit 0x7716dd, shared); stages =
   the STAGE_* bits of the stages that ran (the mask+compare stage
   ALWAYS runs — the body has a single straight-line stage);
   host_edge_count = 0 (the body has no E8). */
typedef struct IsaacHud7716c0Plan {
  int32_t result;          /* +0x0 0/1 (exit TRUE 0x7716dd) */
  int32_t stages;          /* +0x4 STAGE_COMPARE */
  int32_t host_edge_count; /* +0x8 0 (no E8 in the body) */
  int32_t masked_id;       /* +0xc L1 */
  int32_t open_a;          /* +0x10 L2 */
  int32_t open_b;          /* +0x14 L3 */
} IsaacHud7716c0Plan;

int32_t isaac_hud_7716c0_id_masked(uint32_t id);
int32_t isaac_hud_7716c0_open_a(uint32_t id);
int32_t isaac_hud_7716c0_open_b(uint32_t id);
int32_t isaac_hud_7716c0_result(uint32_t id);
void isaac_hud_7716c0_plan(uint32_t id, IsaacHud7716c0Plan* out);
uint32_t isaac_hud_7716c0_va_head(void);
uint32_t isaac_hud_7716c0_va_and(void);
uint32_t isaac_hud_7716c0_va_cmp_a(void);
uint32_t isaac_hud_7716c0_va_je_a(void);
uint32_t isaac_hud_7716c0_va_cmp_b(void);
uint32_t isaac_hud_7716c0_va_je_b(void);
uint32_t isaac_hud_7716c0_va_false(void);
uint32_t isaac_hud_7716c0_va_ret_false(void);
uint32_t isaac_hud_7716c0_va_true(void);
uint32_t isaac_hud_7716c0_va_ret_true(void);
uint32_t isaac_hud_7716c0_id_a(void);
uint32_t isaac_hud_7716c0_id_b(void);
uint32_t isaac_hud_7716c0_id_mask(void);
int32_t isaac_hud_7716c0_stage_compare(void);

/* Helpers ABI v33 (0x007717c0): the HasCollectible sibling-family
   WIDTH leaf `int __thiscall collectible_width(player)` (0x007717c0..
   0x007717f1, ret c3 — NO stack args). The "missed body" class the
   hud-v33-scan unit hunts: the hud-v31-scan band table CONFLATED this
   body INSIDE the 0x7716f0 HOST row — 0x7716f0's FALSE-epilogue ret
   @0x7717bb is followed by a 2-byte int3 pad (alignment), and
   decode_span's >=3-byte pad stop walked through into 0x7717c0
   (95 = 80 + 2 cc + 13); the corrected re-scan's E8-target entry list
   caught it (4 callers) but the table never classified it. Store
   census: ZERO mem-stores (single push esi/pop esi — callee-saved
   reg, no cookie frame). E8 census: 2 x 0x7706e0 (IN-FAMILY LANDED
   v25-v30, consumed as LOW-byte samples — 0x100 CLOSED;
   host_edge_count = 1 + L3). Indirect: 0. Caller census (direct
   rel32, corrected scan_band.py, verified byte-level this unit):
   4 sites — 0x68ecc7, 0x68ef35, 0x6ec314 (cmp dword [edi+0x16c0],0
   gate before the call), 0x778df9 (inside host 0x771800).
   identify-zhl: MISS (address-stable leaf class, same as 0x771620 /
   0x7716c0). Machine order:
     r_8b = HasCollectible(p, 0x8b, 0)  [0x7717ca];
     LOW(r_8b) != 0 -> width = 2 (0x7717d1 jne 0x7717ea — the 0x1ca
        edge is SHORT-CIRCUITED);
     else r_1ca = HasCollectible(p, 0x1ca, 0) [0x7717dc];
     width = 1 + (LOW(r_8b) != 0 || LOW(r_1ca) != 0) (0x7717e3 mov
        eax,1 ; 0x7717ea mov eax,2); ret c3 @0x7717f0.
   The width is the pure WIDTH-ONLY sibling of the v31 0x771620 leaf
   (same ids 0x8b/0x1ca, same short-circuit, same LOW-byte sampling).
   Byte-gate class: every gate is a test al,al zero-test (uint32_t +
   & 0xff; the v8 no-uint8_t convention); NO signed compare in the
   body (compare-flip class: je/jne zero-tests only). All parameters
   uint32_t; no uint8_t. Evidence:
   section-notes/hud-v33-scan/NOTES.md + cpu-dump/007717c0.txt. */

enum {
  ISAAC_HUD_7717C0_VA_HEAD = 0x007717c0u,   /* push esi */
  ISAAC_HUD_7717C0_VA_CALL_8B = 0x007717cau, /* call 0x7706e0(p,0x8b,0) */
  ISAAC_HUD_7717C0_VA_TEST_8B = 0x007717cfu, /* test al,al (LOW) */
  ISAAC_HUD_7717C0_VA_JNE_8B = 0x007717d1u,  /* jne 0x7717ea (short-circuit) */
  ISAAC_HUD_7717C0_VA_CALL_1CA = 0x007717dcu, /* call 0x7706e0(p,0x1ca,0) */
  ISAAC_HUD_7717C0_VA_TEST_1CA = 0x007717e1u, /* test al,al (LOW) */
  ISAAC_HUD_7717C0_VA_WIDTH_1 = 0x007717e3u, /* mov eax,1 */
  ISAAC_HUD_7717C0_VA_JE_1CA = 0x007717e8u,  /* je 0x7717ef */
  ISAAC_HUD_7717C0_VA_WIDTH_2 = 0x007717eau, /* mov eax,2 */
  ISAAC_HUD_7717C0_VA_RET = 0x007717f0u,     /* ret (c3, no stack args) */
  ISAAC_HUD_7717C0_ID_8B = 0x8bu,
  ISAAC_HUD_7717C0_ID_1CA = 0x1cau,
  ISAAC_HUD_7717C0_FLAG = 0u,
  ISAAC_HUD_7717C0_WIDTH_BASE = 1,
  ISAAC_HUD_7717C0_HOST_7706E0 = 0x007706e0u, /* both edges */
  ISAAC_HUD_7717C0_STAGE_8B = 1,             /* plan bit: 0x8b stage */
  ISAAC_HUD_7717C0_STAGE_1CA = 2             /* plan bit: 0x1ca stage */
};

/* Composed machine-order plan of 0x007717c0 (helpers ABI v33). result
   = the width (1 or 2) returned by the PE (ret c3 @0x7717f0); stages
   = the STAGE_* bits of the edges that fired (STAGE_8B always —
   the 0x8b edge is unconditional; STAGE_1CA only when LOW(r_8b) == 0,
   the 0x7717d1 short-circuit); host_edge_count = 1 + L3 (the two
   in-family 0x7706e0 edges, sampled as LOW bytes); pure_complete = 1
   (every edge is an in-family landed law). */
typedef struct IsaacHud7717c0Plan {
  int32_t result;          /* +0x0 width 1/2 (ret c3) */
  int32_t stages;          /* +0x4 STAGE_8B | (L3 ? STAGE_1CA : 0) */
  int32_t host_edge_count; /* +0x8 1 + L3 */
  int32_t pure_complete;   /* +0xc 1 (all edges in-family) */
  int32_t r_8b_open;       /* +0x10 L1 */
  int32_t r_1ca_open;      /* +0x14 L2 */
  int32_t one_ca_edge;     /* +0x18 L3 */
} IsaacHud7717c0Plan;

int32_t isaac_hud_7717c0_8b_open(uint32_t r_8b);
int32_t isaac_hud_7717c0_1ca_open(uint32_t r_1ca);
int32_t isaac_hud_7717c0_1ca_edge_needed(uint32_t r_8b);
int32_t isaac_hud_7717c0_width(uint32_t r_8b, uint32_t r_1ca);
void isaac_hud_7717c0_plan(uint32_t r_8b, uint32_t r_1ca,
                           IsaacHud7717c0Plan* out);
uint32_t isaac_hud_7717c0_va_head(void);
uint32_t isaac_hud_7717c0_va_call_8b(void);
uint32_t isaac_hud_7717c0_va_test_8b(void);
uint32_t isaac_hud_7717c0_va_jne_8b(void);
uint32_t isaac_hud_7717c0_va_call_1ca(void);
uint32_t isaac_hud_7717c0_va_test_1ca(void);
uint32_t isaac_hud_7717c0_va_width_1(void);
uint32_t isaac_hud_7717c0_va_je_1ca(void);
uint32_t isaac_hud_7717c0_va_width_2(void);
uint32_t isaac_hud_7717c0_va_ret(void);
uint32_t isaac_hud_7717c0_id_8b(void);
uint32_t isaac_hud_7717c0_id_1ca(void);
uint32_t isaac_hud_7717c0_flag(void);
uint32_t isaac_hud_7717c0_width_base(void);
uint32_t isaac_hud_7717c0_host_7706e0(void);
int32_t isaac_hud_7717c0_stage_8b(void);
int32_t isaac_hud_7717c0_stage_1ca(void);

/* Helpers ABI v34 (0x007716f0): the HasCollectible sibling-family
   LOOP-CONTROL islands inside the 0x7716f0 host body (the v33-scan
   handoff "next frontier"). 0x007716f0..0x007717bb (`bool`-shaped,
   ret 4 — TRUE epilogue 0x7717b0, FALSE epilogue 0x7717bb; the
   virtual-eax HOST of the 0x7716c0/0x7716f0 sibling pair; the
   decompiled Lua registration `FUN_00880f30("TryHoldTrinket",
   FUN_007716f0)` names the entry — evidence note only, no code
   derives from it). Store census: 2 mem-stores, both in-frame
   cookie locals ([ebp-4] player save, [ebp-8] slot-ptr save) —
   zero observable stores (v17 cookie class). E8 census: 3 —
   the two 0x7706e0 width edges (LANDED v25-v30, LOW-byte samples)
   + 0x7716c0 (LANDED v32, LOW-byte sample). Indirect: 1 — the HOST
   virtual edge (*(*(game+0x26620)))[0x50](player) @0x77177c, sampled
   as r_v (stays host; counted, never modelled). Caller census: 1
   site 0x6ec22a (verified byte-level this unit: e8 c1 54 08 00 ->
   0x7716f0). identify-zhl: MISS (fresh run this unit).
   Machine order per iteration: width RECOMPUTED (the 0x771706
   recompute is byte-identical to the v33 0x7717c0 width leaf — the
   v33 width law is REUSED, not re-landed); UNSIGNED loop gate
   (0x771738 cmp edi,esi ; 0x77173a jae FALSE); slot FULL dword
   load; bl = ((slot & 0x7fff) == 0x35) && LOW(0x7716c0(arg)) != 0
   (the 0x7716c0 edge fires iff masked == 0x35); slot == 0 FULL ->
   early TRUE (0x77175c/0x77175e); SIGNED game gate (int32)
   game+0x26614 >= 2 (0x771765 cmp ,2 ; 0x77176c jl) opens the host
   virtual edge, LOW(r_v) != 0 -> TRUE (0x77177e/0x771793 jne);
   game-gate-closed path dispatches FULL slot == 0x35 -> bl gate /
   == 0x40 && game+0x26584 == 0x1c -> bl gate / else TRUE
   (0x771782..0x771793); bl gate LOW(bl) != 0 -> TRUE
   (0x771795/0x771797); else loop-continue (0x771799..0x7717a3:
   i++, slot_ptr += 4, jump back to the width recompute). The
   r_v == 0 virtual edge STILL reaches the bl gate (0x771780 jmp
   0x771793). width is 1..2 -> the loop runs at most 2 iterations;
   a CONTINUE at i == 1 (width 2) resolves to FALSE at the next gate
   (i == 2 >= width). Byte-gate class: every sampled result gate is
   a test al,al zero-test (uint32_t + & 0xff; 0x100 CLOSED; bl is a
   widenable scalar, its gate is the LOW byte); NO uint8_t params
   (v8 convention). Compare-flip classes: loop gate jae UNSIGNED;
   game gate jl SIGNED; the dispatch and slot-zero are FULL-dword
   equality/zero tests (sign-agnostic). Evidence:
   section-notes/hud-v34-7716f0/NOTES.md + canonical dump
   section-notes/cpu-dump/007716f0.txt. */

enum {
  ISAAC_HUD_7716F0_VA_HEAD = 0x007716f0u, /* push ebp (clean prologue) */
  ISAAC_HUD_7716F0_VA_WIDTH_1 = 0x00771712u, /* mov esi,1 */
  ISAAC_HUD_7716F0_VA_CALL_8B = 0x00771717u, /* call 0x7706e0(p,0x8b,0) */
  ISAAC_HUD_7716F0_VA_TEST_8B = 0x0077171cu, /* test al,al (LOW) */
  ISAAC_HUD_7716F0_VA_JNE_8B = 0x0077171eu,  /* jne 0x771733 (short-circuit) */
  ISAAC_HUD_7716F0_VA_CALL_1CA = 0x0077172au, /* call 0x7706e0(p,0x1ca,0) */
  ISAAC_HUD_7716F0_VA_TEST_1CA = 0x0077172fu, /* test al,al (LOW) */
  ISAAC_HUD_7716F0_VA_JE_1CA = 0x00771731u,  /* je 0x771738 */
  ISAAC_HUD_7716F0_VA_WIDTH_2 = 0x00771733u, /* mov esi,2 */
  ISAAC_HUD_7716F0_VA_LOOP_CMP = 0x00771738u, /* cmp edi,esi */
  ISAAC_HUD_7716F0_VA_LOOP_JAE = 0x0077173au, /* jae 0x7717b3 (UNSIGNED) */
  ISAAC_HUD_7716F0_VA_SLOT_LOAD = 0x0077173cu, /* mov ecx,[ebx] (FULL) */
  ISAAC_HUD_7716F0_VA_SLOT_AND = 0x00771740u, /* and eax,0x7fff */
  ISAAC_HUD_7716F0_VA_SLOT_CMP = 0x00771745u, /* cmp eax,0x35 (FULL) */
  ISAAC_HUD_7716F0_VA_SLOT_JNE = 0x00771748u, /* jne 0x77175a */
  ISAAC_HUD_7716F0_VA_CALL_7716C0 = 0x0077174du, /* call 0x7716c0(arg) */
  ISAAC_HUD_7716F0_VA_TEST_ISO = 0x00771752u, /* test al,al (LOW) */
  ISAAC_HUD_7716F0_VA_JE_ISO = 0x00771754u,  /* je 0x77175a */
  ISAAC_HUD_7716F0_VA_BL_1 = 0x00771756u,    /* mov bl,1 */
  ISAAC_HUD_7716F0_VA_BL_0 = 0x0077175au,    /* xor bl,bl */
  ISAAC_HUD_7716F0_VA_SLOT_TEST = 0x0077175cu, /* test ecx,ecx (FULL) */
  ISAAC_HUD_7716F0_VA_JE_SLOT_ZERO = 0x0077175eu, /* je 0x7717a8 */
  ISAAC_HUD_7716F0_VA_GAME_LOAD = 0x00771760u, /* mov eax,[0xc71678] */
  ISAAC_HUD_7716F0_VA_GAME_CMP = 0x00771765u, /* cmp [eax+0x26614],2 */
  ISAAC_HUD_7716F0_VA_GAME_JL = 0x0077176cu, /* jl 0x771782 (SIGNED) */
  ISAAC_HUD_7716F0_VA_VTABLE_LOAD = 0x0077176eu, /* mov ecx,[eax+0x26620] */
  ISAAC_HUD_7716F0_VA_VIRTUAL_CALL = 0x0077177cu, /* call eax (HOST) */
  ISAAC_HUD_7716F0_VA_TEST_V = 0x0077177eu,  /* test al,al (LOW) */
  ISAAC_HUD_7716F0_VA_DISP_CMP_35 = 0x00771782u, /* cmp ecx,0x35 (FULL) */
  ISAAC_HUD_7716F0_VA_DISP_JE_35 = 0x00771785u,  /* je 0x771795 */
  ISAAC_HUD_7716F0_VA_DISP_CMP_40 = 0x00771787u, /* cmp ecx,0x40 (FULL) */
  ISAAC_HUD_7716F0_VA_DISP_JNE_40 = 0x0077178au, /* jne 0x7717a8 */
  ISAAC_HUD_7716F0_VA_DISP_CMP_1C = 0x0077178cu, /* cmp [eax+0x26584],0x1c */
  ISAAC_HUD_7716F0_VA_MERGE_JNE = 0x00771793u, /* jne 0x7717a8 (both paths) */
  ISAAC_HUD_7716F0_VA_BL_TEST = 0x00771795u,  /* test bl,bl (LOW) */
  ISAAC_HUD_7716F0_VA_BL_JNE = 0x00771797u,   /* jne 0x7717a8 */
  ISAAC_HUD_7716F0_VA_LOOP_CONT = 0x00771799u, /* mov ebx,[ebp-8] */
  ISAAC_HUD_7716F0_VA_LOOP_INC = 0x0077179cu, /* inc edi */
  ISAAC_HUD_7716F0_VA_LOOP_BACK = 0x007717a3u, /* jmp 0x771706 */
  ISAAC_HUD_7716F0_VA_TRUE = 0x007717a8u,    /* TRUE epilogue (mov al,1) */
  ISAAC_HUD_7716F0_VA_RET_TRUE = 0x007717b0u, /* ret 4 */
  ISAAC_HUD_7716F0_VA_FALSE = 0x007717b3u,   /* FALSE epilogue (xor al,al) */
  ISAAC_HUD_7716F0_VA_RET_FALSE = 0x007717bbu, /* ret 4 */
  ISAAC_HUD_7716F0_OFF_SLOTS = 0x16c0u,      /* slot vector */
  ISAAC_HUD_7716F0_SLOT_STRIDE = 4,
  ISAAC_HUD_7716F0_SLOT_MASK = 0x7fffu,      /* and eax,0x7fff */
  ISAAC_HUD_7716F0_SLOT_35 = 0x35u,
  ISAAC_HUD_7716F0_SLOT_40 = 0x40u,
  ISAAC_HUD_7716F0_GAME_GLOBAL = 0x00c71678u, /* [0xc71678] = g_game */
  ISAAC_HUD_7716F0_GAME_FIELD_26614 = 0x26614u, /* SIGNED gate field */
  ISAAC_HUD_7716F0_GAME_FIELD_26620 = 0x26620u, /* virtual obj ptr */
  ISAAC_HUD_7716F0_GAME_FIELD_26584 = 0x26584u, /* dispatch mode field */
  ISAAC_HUD_7716F0_GAME_GATE_MIN = 2,
  ISAAC_HUD_7716F0_GAME_DISPATCH_MODE = 0x1cu,
  ISAAC_HUD_7716F0_HOST_VTABLE_ENTRY = 0x50u,
  ISAAC_HUD_7716F0_HOST_VA_7706E0 = 0x007706e0u, /* both width edges */
  ISAAC_HUD_7716F0_HOST_VA_7716C0 = 0x007716c0u, /* per-iteration iso leaf */
  ISAAC_HUD_7716F0_HOST_VA_VIRTUAL = 0, /* game+0x26620 vtable[0x50] */
  ISAAC_HUD_7716F0_STAGE_8B = 1,        /* plan bit: 0x8b width edge */
  ISAAC_HUD_7716F0_STAGE_1CA = 2,       /* plan bit: 0x1ca width edge */
  ISAAC_HUD_7716F0_STAGE_ISO = 4,       /* plan bit: 0x7716c0 edge */
  ISAAC_HUD_7716F0_STAGE_VIRTUAL = 8,   /* plan bit: host virtual edge */
  ISAAC_HUD_7716F0_EXIT_CONTINUE = 0,   /* iteration gates passed */
  ISAAC_HUD_7716F0_EXIT_TRUE = 1,       /* TRUE epilogue reached */
  ISAAC_HUD_7716F0_EXIT_FALSE = 2,      /* loop gate closed */
  ISAAC_HUD_7716F0_ITER_CAP = 2         /* width 1..2 -> <= 2 iterations */
};

/* Composed per-iteration machine-order plan (helpers ABI v34).
   width = the REUSED v33 width law (isaac_hud_7717c0_width — the
   0x771706 recompute is byte-identical to the 0x7717c0 leaf);
   loop_continue = UNSIGNED index < width (0x771738/0x77173a);
   masked_35 = (slot & 0x7fff) == 0x35; iso_edge = masked_35 (the
   0x7716c0 edge fires iff masked_35); bl = masked_35 && LOW(r_iso);
   slot_zero = slot == 0 (early TRUE, skips every later edge);
   game_gate = SIGNED (int32)game_26614 >= 2; virtual_edge =
   !slot_zero && game_gate (the HOST edge — r_v consumed iff fired);
   virtual_true = LOW(r_v) != 0; dispatch_gate = FULL slot == 0x35
   || (slot == 0x40 && game_26584 == 0x1c) (game-gate-closed path
   only); bl_gate = LOW(bl) != 0; exit_kind = EXIT_CONTINUE /
   EXIT_TRUE / EXIT_FALSE; host_edge_count = 1 [0x8b] +
   (LOW(r_8b)==0) [0x1ca] + iso_edge + virtual_edge; pure_complete =
   1 iff virtual_edge == 0 (the virtual edge is the body's only host
   edge). TRUE-exit laws: slot_zero || (game_gate && virtual_true) ||
   (!game_gate && !dispatch_gate) || bl_gate. */
typedef struct IsaacHud7716f0IterPlan {
  int32_t width;          /* +0x0  1/2 — v33 width law (reused) */
  int32_t loop_continue;  /* +0x4  UNSIGNED index < width */
  int32_t masked_35;      /* +0x8  (slot & 0x7fff) == 0x35 (FULL) */
  int32_t iso_edge;       /* +0xc  == masked_35 (0x7716c0 edge) */
  int32_t bl;             /* +0x10 masked_35 && LOW(r_iso) */
  int32_t slot_zero;      /* +0x14 slot == 0 (FULL) — early TRUE */
  int32_t game_gate;      /* +0x18 SIGNED game_26614 >= 2 */
  int32_t virtual_edge;   /* +0x1c !slot_zero && game_gate (HOST) */
  int32_t virtual_true;   /* +0x20 LOW(r_v) != 0 (consumed iff fired) */
  int32_t dispatch_gate;  /* +0x24 FULL 0x35 / (0x40 && 0x1c) */
  int32_t bl_gate;        /* +0x28 LOW(bl) != 0 — TRUE exit */
  int32_t exit_kind;      /* +0x2c EXIT_CONTINUE/TRUE/FALSE */
  int32_t host_edge_count; /* +0x30 8b + 1ca + iso + virtual */
  int32_t pure_complete;  /* +0x34 1 iff virtual_edge == 0 */
} IsaacHud7716f0IterPlan;

/* Composed FULL-BODY plan over both iterations (helpers ABI v34).
   Iteration 1's samples are consumed (edges counted, gates decide)
   ONLY when iteration 0 CONTINUED — the PE recomputes the width at
   the 0x7717a3 loop back before the iteration-1 0x8b call. result =
   the ret-4 value (1 TRUE / 0 FALSE); exit_kind = EXIT_TRUE /
   EXIT_FALSE for the whole call (a CONTINUE at i == 1 with width 2
   resolves to FALSE at the next gate: i == 2 >= width);
   host_edge_count = the executed iterations' totals; pure_complete
   = 1 iff no virtual edge fired across the executed iterations.
   Primary-caller notes (0x6ec22a, host draw span): the arg feeds
   only the 0x7716c0 leaf, so r_iso samples are per-iteration. */
typedef struct IsaacHud7716f0Plan {
  int32_t width_0;          /* +0x00 iter-0 width (v33 law) */
  int32_t loop_continue_0;  /* +0x04 */
  int32_t masked_35_0;      /* +0x08 */
  int32_t iso_edge_0;       /* +0x0c */
  int32_t bl_0;             /* +0x10 */
  int32_t slot_zero_0;      /* +0x14 */
  int32_t game_gate_0;      /* +0x18 */
  int32_t virtual_edge_0;   /* +0x1c */
  int32_t virtual_true_0;   /* +0x20 */
  int32_t dispatch_gate_0;  /* +0x24 */
  int32_t bl_gate_0;        /* +0x28 */
  int32_t exit_0;           /* +0x2c EXIT_* */
  int32_t width_1;          /* +0x30 iter-1 (computed; consumed iff */
  int32_t loop_continue_1;  /* +0x34  loop_continue_0) */
  int32_t masked_35_1;      /* +0x38 */
  int32_t iso_edge_1;       /* +0x3c */
  int32_t bl_1;             /* +0x40 */
  int32_t slot_zero_1;      /* +0x44 */
  int32_t game_gate_1;      /* +0x48 */
  int32_t virtual_edge_1;   /* +0x4c */
  int32_t virtual_true_1;   /* +0x50 */
  int32_t dispatch_gate_1;  /* +0x54 */
  int32_t bl_gate_1;        /* +0x58 */
  int32_t exit_1;           /* +0x5c */
  int32_t iter_1_ran;       /* +0x60 exit_0 == EXIT_CONTINUE */
  int32_t result;           /* +0x64 1 TRUE / 0 FALSE (ret 4) */
  int32_t exit_kind;        /* +0x68 whole-call EXIT_* */
  int32_t host_edge_count;  /* +0x6c executed iterations' totals */
  int32_t pure_complete;    /* +0x70 1 iff no virtual edge fired */
} IsaacHud7716f0Plan;

int32_t isaac_hud_7716f0_loop_continue(uint32_t index, uint32_t width);
int32_t isaac_hud_7716f0_masked_35(uint32_t slot);
int32_t isaac_hud_7716f0_iso_open(uint32_t r_iso);
int32_t isaac_hud_7716f0_bl_set(uint32_t slot, uint32_t r_iso);
int32_t isaac_hud_7716f0_slot_zero(uint32_t slot);
int32_t isaac_hud_7716f0_game_gate(uint32_t game_26614);
int32_t isaac_hud_7716f0_virtual_true(uint32_t r_v);
int32_t isaac_hud_7716f0_dispatch_gate(uint32_t slot,
                                       uint32_t game_26584);
int32_t isaac_hud_7716f0_bl_gate(uint32_t bl);
int32_t isaac_hud_7716f0_iter_continue(uint32_t index, uint32_t width,
                                       uint32_t slot, uint32_t r_iso,
                                       uint32_t game_26614,
                                       uint32_t game_26584,
                                       uint32_t r_v);
void isaac_hud_7716f0_iter_plan(uint32_t index, uint32_t r_8b,
                                uint32_t r_1ca, uint32_t slot,
                                uint32_t r_iso, uint32_t game_26614,
                                uint32_t game_26584, uint32_t r_v,
                                IsaacHud7716f0IterPlan* out);
void isaac_hud_7716f0_plan(uint32_t r_8b_0, uint32_t r_1ca_0,
                           uint32_t slot_0, uint32_t r_iso_0,
                           uint32_t game_26614_0, uint32_t game_26584_0,
                           uint32_t r_v_0, uint32_t r_8b_1,
                           uint32_t r_1ca_1, uint32_t slot_1,
                           uint32_t r_iso_1, uint32_t game_26614_1,
                           uint32_t game_26584_1, uint32_t r_v_1,
                           IsaacHud7716f0Plan* out);
uint32_t isaac_hud_7716f0_va_head(void);
uint32_t isaac_hud_7716f0_va_width_1(void);
uint32_t isaac_hud_7716f0_va_call_8b(void);
uint32_t isaac_hud_7716f0_va_test_8b(void);
uint32_t isaac_hud_7716f0_va_jne_8b(void);
uint32_t isaac_hud_7716f0_va_call_1ca(void);
uint32_t isaac_hud_7716f0_va_test_1ca(void);
uint32_t isaac_hud_7716f0_va_je_1ca(void);
uint32_t isaac_hud_7716f0_va_width_2(void);
uint32_t isaac_hud_7716f0_va_loop_cmp(void);
uint32_t isaac_hud_7716f0_va_loop_jae(void);
uint32_t isaac_hud_7716f0_va_slot_load(void);
uint32_t isaac_hud_7716f0_va_slot_and(void);
uint32_t isaac_hud_7716f0_va_slot_cmp(void);
uint32_t isaac_hud_7716f0_va_slot_jne(void);
uint32_t isaac_hud_7716f0_va_call_7716c0(void);
uint32_t isaac_hud_7716f0_va_test_iso(void);
uint32_t isaac_hud_7716f0_va_je_iso(void);
uint32_t isaac_hud_7716f0_va_bl_1(void);
uint32_t isaac_hud_7716f0_va_bl_0(void);
uint32_t isaac_hud_7716f0_va_slot_test(void);
uint32_t isaac_hud_7716f0_va_je_slot_zero(void);
uint32_t isaac_hud_7716f0_va_game_load(void);
uint32_t isaac_hud_7716f0_va_game_cmp(void);
uint32_t isaac_hud_7716f0_va_game_jl(void);
uint32_t isaac_hud_7716f0_va_vtable_load(void);
uint32_t isaac_hud_7716f0_va_virtual_call(void);
uint32_t isaac_hud_7716f0_va_test_v(void);
uint32_t isaac_hud_7716f0_va_disp_cmp_35(void);
uint32_t isaac_hud_7716f0_va_disp_je_35(void);
uint32_t isaac_hud_7716f0_va_disp_cmp_40(void);
uint32_t isaac_hud_7716f0_va_disp_jne_40(void);
uint32_t isaac_hud_7716f0_va_disp_cmp_1c(void);
uint32_t isaac_hud_7716f0_va_merge_jne(void);
uint32_t isaac_hud_7716f0_va_bl_test(void);
uint32_t isaac_hud_7716f0_va_bl_jne(void);
uint32_t isaac_hud_7716f0_va_loop_cont(void);
uint32_t isaac_hud_7716f0_va_loop_inc(void);
uint32_t isaac_hud_7716f0_va_loop_back(void);
uint32_t isaac_hud_7716f0_va_true(void);
uint32_t isaac_hud_7716f0_va_ret_true(void);
uint32_t isaac_hud_7716f0_va_false(void);
uint32_t isaac_hud_7716f0_va_ret_false(void);
uint32_t isaac_hud_7716f0_off_slots(void);
uint32_t isaac_hud_7716f0_slot_stride(void);
uint32_t isaac_hud_7716f0_slot_mask(void);
uint32_t isaac_hud_7716f0_slot_35(void);
uint32_t isaac_hud_7716f0_slot_40(void);
uint32_t isaac_hud_7716f0_game_global(void);
uint32_t isaac_hud_7716f0_game_field_26614(void);
uint32_t isaac_hud_7716f0_game_field_26620(void);
uint32_t isaac_hud_7716f0_game_field_26584(void);
uint32_t isaac_hud_7716f0_game_gate_min(void);
uint32_t isaac_hud_7716f0_game_dispatch_mode(void);
uint32_t isaac_hud_7716f0_host_vtable_entry(void);
uint32_t isaac_hud_7716f0_host_va_7706e0(void);
uint32_t isaac_hud_7716f0_host_va_7716c0(void);
uint32_t isaac_hud_7716f0_host_va_virtual(void);
int32_t isaac_hud_7716f0_stage_8b(void);
int32_t isaac_hud_7716f0_stage_1ca(void);
int32_t isaac_hud_7716f0_stage_iso(void);
int32_t isaac_hud_7716f0_stage_virtual(void);
int32_t isaac_hud_7716f0_exit_continue(void);
int32_t isaac_hud_7716f0_exit_true(void);
int32_t isaac_hud_7716f0_exit_false(void);
int32_t isaac_hud_7716f0_iter_cap(void);

/* Helpers ABI v35: the 0x76143f CALLER-GUARD laws (the v34 handoff
   candidate "0x770ca0 caller guards (0x76143f cmp [edi+0x15e0],0x226
   gate class)" — the band 0x770000..0x772000 is PURE-EXHAUSTED, and
   the only translatable surface left inside the int3-unseparated
   HOST draw span A (0x760c8c..0x762d4c) is the per-site caller-guard
   layer; the 0x76143f site is HasCollectible(p,0x226,0)
   (0x007706e0, LANDED v25-v30 — an unconditional IN-FAMILY call).
   The 0x770ca0 row itself is HOST (ZHL 16-byte exact (W29-C4 batch):
   Entity_Player::GetCollectibleNum — source-level name, used only
   where the callsite agrees; 352 direct callers reproduce the v31
   census). Bounded region 0x7613e8..0x7614b4 (canonical dump
   section-notes/cpu-dump/0076143f.txt): 54 insns, E8 5
   (0x7706e0 x1 + 0x78f840 x2 + 0x75f0e0 x1 + 0x791420 x1), ind 0,
   mem-stores 3 — ALL the in-frame cookie accumulator [ebp-0x1c8]
   (v17 cookie class, zero observable stores). identify-zhl: MISS
   (0x76143f is a call SITE inside the draw span, not an entry).
   Machine order: acc = pair_sum(0x15ac, 0x15a8) [0x7613e8..0x7613f4];
   FULL-dword gate [edi+0x15c0] == 0x226 [0x7613fa cmp dword ; 0x761404
   jne] -> acc = pair_sum(0x15cc, 0x15c8) [0x761406..0x761412]; FULL-
   dword gate [edi+0x15e0] == 0x226 [0x761418 cmp dword ; 0x761422
   jne] -> acc = pair_sum(0x15ec, 0x15e8) [0x761424..0x761430] — LAST
   match wins (the 15e0 chain overwrites the 15c0 chain); call
   0x7706e0(p,0x226,0) UNCONDITIONAL [0x761436..0x76143f]; test al,al
   LOW byte [0x761444 test al,al ; 0x761446 je 0x762806] opens the
   block: 2x 0x78f840 (0x226/0x227) + 0x75f0e0 (0x228) — host edges —
   then the pure 4-slot scan (stride 0x20, cmp dword [esi],0x228 FULL
   je; inc eax; add esi,0x20; cmp eax,4 ; jb UNSIGNED; not found
   jmp 0x762806), SIGNED idx test [0x76149e test eax,eax ; 0x7614a0 js
   0x762806 — structurally dead on-path, pinned], host 0x791420(p,
   acc, idx) with the SELECTED accumulator [0x7614a6..0x7614af],
   merge 0x762806. All gates FULL-dword except r_226 (LOW byte,
   0x100 CLOSED); uint32_t params only, no uint8_t (v8 convention).
   Evidence: section-notes/hud-v35-76143f/NOTES.md. */

/* Helpers ABI v36 (0x007616ad): the span-A CALLER-GUARD laws at the
   0x7616ad site — `0x771620(p, 0x79)` gated on LOW(r_771550) — inside
   the same int3-unseparated HOST draw span A as v35. The 0x771800
   head/tail PE-split option from the v35 handoff was CLOSED this unit:
   0x771800 (0x771800..0x771d26, ret 8) has NO pure head (first call
   0x75e1d0 at the 5th insn 0x771812, virtual dispatch 0x77184a, and
   no SEH in the body — the 0x771d3a fs:[0] accesses belong to the
   0x771d30 body); the "0x778df9 inside host 0x771800" claim is
   CORRECTED (0x778df9 is 0x75f9 past 0x771800, in the continuous
   HOST region around 0x778de5 — no int3 pads, no direct entries).
   The 0x7616ad site is dispatch CASE 13 of the span's two-level
   switch (0x760908 movzx byte[eax+0x762f2c] ; 0x76090f jmp
   [eax*4+0x762ec0], table[13] = 0x76169a). Bounded block
   0x76169a..0x7616bd (canonical dump
   section-notes/cpu-dump/007616ad.txt): 14 insns, E8 3
   (0x771550 / 0x771620 / 0x7db0a0), ind 0, mem-stores 0. Machine
   order: r_1550 = 0x771550(p, 0x79, 0) UNCONDITIONAL in-family
   v17-narrowed sample [0x7616a0] — the gates decide the LATER edges;
   LOW(r_1550) != 0 [0x7616a5 test al,al ; 0x7616a7 je merge] ->
   r_1620 = 0x771620(p, 0x79) in-family v31-LANDED [0x7616ad];
   LOW(r_1620) != 0 [0x7616b2 test al,al ; 0x7616b4 jne merge] -> host
   0x7db0a0(p) [0x7616b8 — 3 callers; body stores [p+0x1eec]]; the
   host edge fires iff LOW(r_1550) != 0 && LOW(r_1620) == 0. Merge
   0x7616bd -> host continuation: count = 0x7cb6e0(p,0x6d) [0x7616c1],
   SIGNED count > 1 [0x7616c6 cmp eax,1 ; 0x7616c9 jle 0x762806] &&
   FULL [p+0x1ef0] == 0 [0x7616cf cmp dword ; 0x7616d6 jne] -> the
   OBSERVABLE store [p+0x1ef0] = 1 [0x7616dc], jmp 0x762806
   (continuation stays host; only its gate laws are exported). All
   guard tests are test al,al LOW-byte (uint32_t + & 0xff, v8
   convention); count_open is SIGNED (int32_t); slot_empty is FULL
   dword. Evidence: section-notes/hud-v36-7616ad/NOTES.md. */

enum {
  ISAAC_HUD_76143F_VA_GATE_15C0 = 0x007613fau, /* cmp dword [edi+0x15c0],0x226 */
  ISAAC_HUD_76143F_VA_JNE_15C0 = 0x00761404u,  /* jne 0x761418 */
  ISAAC_HUD_76143F_VA_SUM_15C0 = 0x00761406u,  /* mov eax,[edi+0x15cc] */
  ISAAC_HUD_76143F_VA_STORE_15C0 = 0x00761412u, /* mov [ebp-0x1c8],eax */
  ISAAC_HUD_76143F_VA_GATE_15E0 = 0x00761418u, /* cmp dword [edi+0x15e0],0x226 */
  ISAAC_HUD_76143F_VA_JNE_15E0 = 0x00761422u,  /* jne 0x761436 */
  ISAAC_HUD_76143F_VA_SUM_15E0 = 0x00761424u,  /* mov eax,[edi+0x15ec] */
  ISAAC_HUD_76143F_VA_STORE_15E0 = 0x00761430u, /* mov [ebp-0x1c8],eax */
  ISAAC_HUD_76143F_VA_CALL_HAS = 0x0076143fu,  /* call 0x7706e0 (IN-FAMILY) */
  ISAAC_HUD_76143F_VA_TEST_AL = 0x00761444u,   /* test al,al (LOW) */
  ISAAC_HUD_76143F_VA_JE_SKIP = 0x00761446u,   /* je 0x762806 */
  ISAAC_HUD_76143F_VA_BLOCK = 0x0076144cu,     /* block head */
  ISAAC_HUD_76143F_VA_CALL2_A = 0x00761459u,   /* 0x78f840(p,0x226,0,1) */
  ISAAC_HUD_76143F_VA_CALL2_B = 0x0076146bu,   /* 0x78f840(p,0x227,0,1) */
  ISAAC_HUD_76143F_VA_CALL3 = 0x00761481u,     /* 0x75f0e0(p,0x228,0,0,0,0) */
  ISAAC_HUD_76143F_VA_SCAN_CMP = 0x00761488u,  /* cmp dword [esi],0x228 (FULL) */
  ISAAC_HUD_76143F_VA_SCAN_JE = 0x0076148eu,   /* je 0x76149e */
  ISAAC_HUD_76143F_VA_SCAN_INC = 0x00761490u,  /* inc eax */
  ISAAC_HUD_76143F_VA_SCAN_STRIDE = 0x00761491u, /* add esi,0x20 */
  ISAAC_HUD_76143F_VA_SCAN_CMP_4 = 0x00761494u, /* cmp eax,4 */
  ISAAC_HUD_76143F_VA_SCAN_JB = 0x00761497u,   /* jb 0x761488 (UNSIGNED) */
  ISAAC_HUD_76143F_VA_SCAN_FAIL = 0x00761499u, /* jmp 0x762806 */
  ISAAC_HUD_76143F_VA_SCAN_FOUND = 0x0076149eu, /* test eax,eax */
  ISAAC_HUD_76143F_VA_TEST_IDX = 0x007614a0u,  /* js 0x762806 (SIGNED) */
  ISAAC_HUD_76143F_VA_PUSH_ACC = 0x007614a7u,  /* push [ebp-0x1c8] */
  ISAAC_HUD_76143F_VA_CALL4 = 0x007614afu,     /* 0x791420(p,acc,idx) */
  ISAAC_HUD_76143F_VA_MERGE = 0x007614b4u,     /* jmp 0x762806 */
  ISAAC_HUD_76143F_VA_SKIP = 0x00762806u,      /* common tail */
  ISAAC_HUD_76143F_OFF_BASE_LO = 0x15a8u,      /* base pair lo */
  ISAAC_HUD_76143F_OFF_BASE_HI = 0x15acu,      /* base pair hi */
  ISAAC_HUD_76143F_OFF_15C0 = 0x15c0u,         /* gate-A field */
  ISAAC_HUD_76143F_OFF_15C8 = 0x15c8u,         /* gate-A pair lo */
  ISAAC_HUD_76143F_OFF_15CC = 0x15ccu,         /* gate-A pair hi */
  ISAAC_HUD_76143F_OFF_15E0 = 0x15e0u,         /* gate-B field */
  ISAAC_HUD_76143F_OFF_15E8 = 0x15e8u,         /* gate-B pair lo */
  ISAAC_HUD_76143F_OFF_15EC = 0x15ecu,         /* gate-B pair hi */
  ISAAC_HUD_76143F_ACC_COOKIE_OFF = 0x1c8u,    /* [ebp-0x1c8] cookie */
  ISAAC_HUD_76143F_CLASS_226 = 0x226u,         /* gate immediate */
  ISAAC_HUD_76143F_SCAN_ID = 0x228u,           /* scan dword */
  ISAAC_HUD_76143F_SCAN_COUNT = 4,             /* UNSIGNED jb bound */
  ISAAC_HUD_76143F_SCAN_STRIDE = 0x20u,        /* slot stride */
  ISAAC_HUD_76143F_HOST_7706E0 = 0x007706e0u,  /* HasCollectible — in-family */
  ISAAC_HUD_76143F_HOST_78F840 = 0x0078f840u,  /* block edge (address-stable) */
  ISAAC_HUD_76143F_HOST_75F0E0 = 0x0075f0e0u,  /* block edge (address-stable) */
  ISAAC_HUD_76143F_HOST_791420 = 0x00791420u,  /* block edge (address-stable) */
  ISAAC_HUD_76143F_STAGE_BASE = 1,             /* base sum ran */
  ISAAC_HUD_76143F_STAGE_15C0 = 2,             /* gate-A chain ran */
  ISAAC_HUD_76143F_STAGE_15E0 = 4              /* gate-B chain ran (LAST wins) */
};

/* Composed machine-order plan for the 0x76143f caller-guard layer
   (helpers ABI v35). acc = the SELECTED accumulator (base sum,
   overwritten per gate — the 15e0 chain wins when both fields are
   0x226); call_fires = 1 ALWAYS (0x7706e0(p,0x226,0) is
   unconditional — the gates select the accumulator, not the call);
   has_open = LOW(r_226) != 0 -> the block runs; scan_index = the
   FIRST index in [0,4) whose slot == 0x228 else 4; scan_found =
   scan_index < 4; idx_ok = SIGNED scan_index >= 0 (js gate,
   structurally dead on-path — pinned for the compare-flip class);
   block_edges = has_open ? (2 [0x78f840 x2] + 1 [0x75f0e0] +
   (scan_found && idx_ok ? 1 [0x791420] : 0)) : 0; host_edge_count =
   1 [0x7706e0] + block_edges; pure_complete = 1 iff has_open == 0
   (block closed: the only edge is the in-family call). */
typedef struct IsaacHud76143fPlan {
  int32_t acc;            /* +0x00 selected accumulator (u32) */
  int32_t stage_base;     /* +0x04 1 (base sum always runs) */
  int32_t class_15c0;     /* +0x08 FULL field_15c0 == 0x226 */
  int32_t stage_15c0;     /* +0x0c gate-A chain ran */
  int32_t class_15e0;     /* +0x10 FULL field_15e0 == 0x226 */
  int32_t stage_15e0;     /* +0x14 gate-B chain ran (LAST wins) */
  int32_t call_fires;     /* +0x18 1 — unconditional in-family call */
  int32_t has_open;       /* +0x1c LOW(r_226) != 0 — block runs */
  int32_t scan_index;     /* +0x20 first 0x228 slot index 0..3 / 4 */
  int32_t scan_found;     /* +0x24 scan_index < 4 */
  int32_t idx_ok;         /* +0x28 SIGNED scan_index >= 0 */
  int32_t block_edges;    /* +0x2c block host edges (2+1+gate) */
  int32_t host_edge_count; /* +0x30 1 [0x7706e0] + block_edges */
  int32_t pure_complete;  /* +0x34 1 iff has_open == 0 */
} IsaacHud76143fPlan;

int32_t isaac_hud_76143f_class_226(uint32_t field);
uint32_t isaac_hud_76143f_pair_sum(uint32_t lo, uint32_t hi);
uint32_t isaac_hud_76143f_accumulate(uint32_t base_lo, uint32_t base_hi,
                                     uint32_t field_15c0,
                                     uint32_t c8, uint32_t cc,
                                     uint32_t field_15e0,
                                     uint32_t e8, uint32_t ec);
int32_t isaac_hud_76143f_has_open(uint32_t r_226);
int32_t isaac_hud_76143f_scan_continue(uint32_t index);
int32_t isaac_hud_76143f_scan_found(uint32_t slot);
int32_t isaac_hud_76143f_scan_index(uint32_t slot0, uint32_t slot1,
                                    uint32_t slot2, uint32_t slot3);
int32_t isaac_hud_76143f_idx_ok(int32_t idx);
void isaac_hud_76143f_guard_plan(uint32_t base_lo, uint32_t base_hi,
                                 uint32_t field_15c0,
                                 uint32_t c8, uint32_t cc,
                                 uint32_t field_15e0,
                                 uint32_t e8, uint32_t ec,
                                 uint32_t r_226,
                                 uint32_t slot0, uint32_t slot1,
                                 uint32_t slot2, uint32_t slot3,
                                 IsaacHud76143fPlan* out);
uint32_t isaac_hud_76143f_va_gate_15c0(void);
uint32_t isaac_hud_76143f_va_jne_15c0(void);
uint32_t isaac_hud_76143f_va_sum_15c0(void);
uint32_t isaac_hud_76143f_va_store_15c0(void);
uint32_t isaac_hud_76143f_va_gate_15e0(void);
uint32_t isaac_hud_76143f_va_jne_15e0(void);
uint32_t isaac_hud_76143f_va_sum_15e0(void);
uint32_t isaac_hud_76143f_va_store_15e0(void);
uint32_t isaac_hud_76143f_va_call_has(void);
uint32_t isaac_hud_76143f_va_test_al(void);
uint32_t isaac_hud_76143f_va_je_skip(void);
uint32_t isaac_hud_76143f_va_block(void);
uint32_t isaac_hud_76143f_va_call2_a(void);
uint32_t isaac_hud_76143f_va_call2_b(void);
uint32_t isaac_hud_76143f_va_call3(void);
uint32_t isaac_hud_76143f_va_scan_cmp(void);
uint32_t isaac_hud_76143f_va_scan_je(void);
uint32_t isaac_hud_76143f_va_scan_inc(void);
uint32_t isaac_hud_76143f_va_scan_stride(void);
uint32_t isaac_hud_76143f_va_scan_cmp_4(void);
uint32_t isaac_hud_76143f_va_scan_jb(void);
uint32_t isaac_hud_76143f_va_scan_fail(void);
uint32_t isaac_hud_76143f_va_scan_found(void);
uint32_t isaac_hud_76143f_va_test_idx(void);
uint32_t isaac_hud_76143f_va_push_acc(void);
uint32_t isaac_hud_76143f_va_call4(void);
uint32_t isaac_hud_76143f_va_merge(void);
uint32_t isaac_hud_76143f_va_skip(void);
uint32_t isaac_hud_76143f_off_base_lo(void);
uint32_t isaac_hud_76143f_off_base_hi(void);
uint32_t isaac_hud_76143f_off_15c0(void);
uint32_t isaac_hud_76143f_off_15c8(void);
uint32_t isaac_hud_76143f_off_15cc(void);
uint32_t isaac_hud_76143f_off_15e0(void);
uint32_t isaac_hud_76143f_off_15e8(void);
uint32_t isaac_hud_76143f_off_15ec(void);
uint32_t isaac_hud_76143f_acc_cookie_off(void);
uint32_t isaac_hud_76143f_class_226_id(void);
uint32_t isaac_hud_76143f_scan_id(void);
uint32_t isaac_hud_76143f_scan_count(void);
uint32_t isaac_hud_76143f_scan_stride(void);
uint32_t isaac_hud_76143f_host_7706e0(void);
uint32_t isaac_hud_76143f_host_78f840(void);
uint32_t isaac_hud_76143f_host_75f0e0(void);
uint32_t isaac_hud_76143f_host_791420(void);
int32_t isaac_hud_76143f_stage_base(void);
int32_t isaac_hud_76143f_stage_15c0(void);
int32_t isaac_hud_76143f_stage_15e0(void);

/* Helpers ABI v36 (0x007616ad): the span-A CALLER-GUARD laws at the
   0x7616ad site — `0x771620(p, 0x79)` gated on LOW(r_771550) — inside
   the int3-unseparated HOST draw span A (0x760c8c..0x762d4c). The site
   is dispatch CASE 13 of the span's two-level switch (0x760908 movzx
   byte[eax+0x762f2c] ; 0x76090f jmp [eax*4+0x762ec0], table[13] =
   0x76169a). Machine order (bounded block 0x76169a..0x7616bd):
     r_1550 = 0x771550(p, 0x79, 0)   [0x7616a0 — IN-FAMILY v17-narrowed,
                                      UNCONDITIONAL (the guard sample)]
     guard A: LOW(r_1550) != 0        [0x7616a5 test al,al ;
                                       0x7616a7 je 0x7616bd]
       r_1620 = 0x771620(p, 0x79)     [0x7616ad — IN-FAMILY v31-LANDED]
       guard B: LOW(r_1620) != 0      [0x7616b2 test al,al ;
                                       0x7616b4 jne 0x7616bd]
         host 0x7db0a0(p)             [0x7616b8 — 3 callers; body stores
                                       [p+0x1eec]; address-stable]
     merge 0x7616bd -> continuation: count = 0x7cb6e0(p,0x6d) [0x7616c1],
       count > 1 (SIGNED jle 0x762806) && FULL [p+0x1ef0] == 0 -> the
       OBSERVABLE store [p+0x1ef0] = 1 [0x7616dc], then jmp 0x762806.
   The 0x771620 edge fires iff the 0x771550 sample is open; the host
   0x7db0a0 edge fires iff the 0x771550 sample is open AND the 0x771620
   result is closed. Both guard tests are test al,al LOW-byte gates
   (uint32_t + & 0xff, v8 no-uint8_t convention); count_open is SIGNED
   (int32_t); slot_empty is FULL dword. The continuation stays host
   (observable store); only its gate laws are exported. Evidence:
   section-notes/hud-v36-7616ad/NOTES.md + cpu-dump/007616ad.txt.
   Remaining span-A surface: 0x76280f (push 0x298, unconditional). */
enum {
  ISAAC_HUD_7616AD_VA_CASE = 0x0076169au,      /* dispatch case entry */
  ISAAC_HUD_7616AD_VA_PUSH_FLAG = 0x0076169au, /* push 0 (flag) */
  ISAAC_HUD_7616AD_VA_PUSH_ID_1550 = 0x0076169cu, /* push 0x79 (id) */
  ISAAC_HUD_7616AD_VA_MOV_ECX_1550 = 0x0076169eu, /* mov ecx,edi */
  ISAAC_HUD_7616AD_VA_CALL_1550 = 0x007616a0u, /* call 0x771550 */
  ISAAC_HUD_7616AD_VA_TEST_1550 = 0x007616a5u, /* test al,al (LOW) */
  ISAAC_HUD_7616AD_VA_JE_MERGE_1550 = 0x007616a7u, /* je 0x7616bd */
  ISAAC_HUD_7616AD_VA_PUSH_ID_1620 = 0x007616a9u, /* push 0x79 (id) */
  ISAAC_HUD_7616AD_VA_CALL_1620 = 0x007616adu, /* call 0x771620 */
  ISAAC_HUD_7616AD_VA_TEST_1620 = 0x007616b2u, /* test al,al (LOW) */
  ISAAC_HUD_7616AD_VA_JNE_MERGE_1620 = 0x007616b4u, /* jne 0x7616bd */
  ISAAC_HUD_7616AD_VA_CALL_7DB0A0 = 0x007616b8u, /* call 0x7db0a0 */
  ISAAC_HUD_7616AD_VA_MERGE = 0x007616bdu,      /* merge + continuation */
  ISAAC_HUD_7616AD_VA_COUNT_PUSH = 0x007616bdu, /* push 0x6d */
  ISAAC_HUD_7616AD_VA_COUNT_CALL = 0x007616c1u, /* call 0x7cb6e0 */
  ISAAC_HUD_7616AD_VA_COUNT_CMP = 0x007616c6u,  /* cmp eax,1 */
  ISAAC_HUD_7616AD_VA_COUNT_JLE = 0x007616c9u,  /* jle 0x762806 (SIGNED) */
  ISAAC_HUD_7616AD_VA_1EF0_CMP = 0x007616cfu,   /* cmp dword [edi+0x1ef0],0 */
  ISAAC_HUD_7616AD_VA_1EF0_JNE = 0x007616d6u,   /* jne 0x762806 */
  ISAAC_HUD_7616AD_VA_STORE_1EF0 = 0x007616dcu, /* mov [edi+0x1ef0],1 (OBS) */
  ISAAC_HUD_7616AD_VA_TAIL_JUMP = 0x007616e6u,  /* jmp 0x762806 */
  ISAAC_HUD_7616AD_VA_SKIP = 0x00762806u,       /* common tail */
  ISAAC_HUD_7616AD_VA_DISPATCH_MOVZX = 0x00760908u, /* two-level switch */
  ISAAC_HUD_7616AD_VA_DISPATCH_JMP = 0x0076090fu,    /* jmp [eax*4+0x762ec0] */
  ISAAC_HUD_7616AD_DISPATCH_TABLE_VA = 0x00762ec0u,  /* case table */
  ISAAC_HUD_7616AD_DISPATCH_BYTE_TABLE_VA = 0x00762f2cu, /* byte selector */
  ISAAC_HUD_7616AD_DISPATCH_CASE = 13,           /* table[13] -> 0x76169a */
  ISAAC_HUD_7616AD_ARG_ID = 0x79u,               /* both calls' id */
  ISAAC_HUD_7616AD_ARG_FLAG = 0u,                /* 0x771550 flag arg */
  ISAAC_HUD_7616AD_COUNT_ID = 0x6du,             /* continuation 0x7cb6e0 id */
  ISAAC_HUD_7616AD_OFF_1EF0 = 0x1ef0u,           /* observable store field */
  ISAAC_HUD_7616AD_HOST_771550 = 0x00771550u,    /* in-family v17-narrowed */
  ISAAC_HUD_7616AD_HOST_771620 = 0x00771620u,    /* in-family v31-landed */
  ISAAC_HUD_7616AD_HOST_7DB0A0 = 0x007db0a0u,    /* host (3 callers) */
  ISAAC_HUD_7616AD_HOST_7CB6E0 = 0x007cb6e0u,    /* host continuation */
  ISAAC_HUD_7616AD_STAGE_1550 = 1,               /* plan bit: 0x771550 */
  ISAAC_HUD_7616AD_STAGE_1620 = 2,               /* plan bit: 0x771620 */
  ISAAC_HUD_7616AD_STAGE_7DB0A0 = 4,             /* plan bit: 0x7db0a0 */
  ISAAC_HUD_7616AD_STAGE_COUNT = 8,              /* plan bit: continuation */
  ISAAC_HUD_7616AD_STAGE_STORE = 0x10            /* plan bit: [p+0x1ef0]=1 */
};

/* Composed machine-order plan of the 0x7616ad caller-guard layer
   (helpers ABI v36). edge_1550 = 1 ALWAYS (0x771550(p,0x79,0) is the
   unconditional in-family guard sample — the gates decide the LATER
   edges); edge_1620 = LOW(r_1550) != 0 (0x771620(p,0x79) fires iff
   guard A open); edge_7db0a0 = LOW(r_1550) != 0 && LOW(r_1620) == 0
   (the host 0x7db0a0 edge fires iff guard A open AND guard B closed);
   host_edge_count = 1 [0x771550] + edge_1620 [0x771620] + edge_7db0a0
   [0x7db0a0]; count_open = SIGNED count > 1 (0x7616c9 jle — the
   continuation store needs count > 1); slot_empty = FULL dword
   [p+0x1ef0] == 0; store_1ef0 = count_open && slot_empty (the
   observable [p+0x1ef0]=1 fires); pure_complete = 1 iff edge_7db0a0
   == 0 && store_1ef0 == 0 (no host edge and no observable store). */
typedef struct IsaacHud7616adPlan {
  int32_t edge_1550;      /* +0x00 1 — unconditional in-family sample */
  int32_t edge_1620;      /* +0x04 LOW(r_1550) != 0 — 0x771620 fires */
  int32_t edge_7db0a0;    /* +0x08 LOW(r_1550)!=0 && LOW(r_1620)==0 */
  int32_t host_edge_count;/* +0x0c 1 [0x771550] + edge_1620 + edge_7db0a0 */
  int32_t count_open;     /* +0x10 SIGNED count > 1 */
  int32_t slot_empty;     /* +0x14 FULL [p+0x1ef0] == 0 */
  int32_t store_1ef0;     /* +0x18 count_open && slot_empty (observable) */
  int32_t pure_complete;  /* +0x1c 1 iff edge_7db0a0 == 0 && store == 0 */
} IsaacHud7616adPlan;

int32_t isaac_hud_7616ad_1550_open(uint32_t r_1550);
int32_t isaac_hud_7616ad_1620_edge_needed(uint32_t r_1550);
int32_t isaac_hud_7616ad_1620_open(uint32_t r_1620);
int32_t isaac_hud_7616ad_7db0a0_edge_needed(uint32_t r_1550,
                                            uint32_t r_1620);
int32_t isaac_hud_7616ad_count_open(int32_t count);
int32_t isaac_hud_7616ad_slot_empty(uint32_t field_1ef0);
void isaac_hud_7616ad_guard_plan(uint32_t r_1550, uint32_t r_1620,
                                 int32_t count, uint32_t field_1ef0,
                                 IsaacHud7616adPlan* out);
uint32_t isaac_hud_7616ad_va_case(void);
uint32_t isaac_hud_7616ad_va_push_flag(void);
uint32_t isaac_hud_7616ad_va_push_id_1550(void);
uint32_t isaac_hud_7616ad_va_mov_ecx_1550(void);
uint32_t isaac_hud_7616ad_va_call_1550(void);
uint32_t isaac_hud_7616ad_va_test_1550(void);
uint32_t isaac_hud_7616ad_va_je_merge_1550(void);
uint32_t isaac_hud_7616ad_va_push_id_1620(void);
uint32_t isaac_hud_7616ad_va_call_1620(void);
uint32_t isaac_hud_7616ad_va_test_1620(void);
uint32_t isaac_hud_7616ad_va_jne_merge_1620(void);
uint32_t isaac_hud_7616ad_va_call_7db0a0(void);
uint32_t isaac_hud_7616ad_va_merge(void);
uint32_t isaac_hud_7616ad_va_count_push(void);
uint32_t isaac_hud_7616ad_va_count_call(void);
uint32_t isaac_hud_7616ad_va_count_cmp(void);
uint32_t isaac_hud_7616ad_va_count_jle(void);
uint32_t isaac_hud_7616ad_va_1ef0_cmp(void);
uint32_t isaac_hud_7616ad_va_1ef0_jne(void);
uint32_t isaac_hud_7616ad_va_store_1ef0(void);
uint32_t isaac_hud_7616ad_va_tail_jump(void);
uint32_t isaac_hud_7616ad_va_skip(void);
uint32_t isaac_hud_7616ad_va_dispatch_movzx(void);
uint32_t isaac_hud_7616ad_va_dispatch_jmp(void);
uint32_t isaac_hud_7616ad_dispatch_table_va(void);
uint32_t isaac_hud_7616ad_dispatch_byte_table_va(void);
int32_t isaac_hud_7616ad_dispatch_case(void);
uint32_t isaac_hud_7616ad_arg_id(void);
uint32_t isaac_hud_7616ad_arg_flag(void);
uint32_t isaac_hud_7616ad_count_id(void);
uint32_t isaac_hud_7616ad_off_1ef0(void);
uint32_t isaac_hud_7616ad_host_771550(void);
uint32_t isaac_hud_7616ad_host_771620(void);
uint32_t isaac_hud_7616ad_host_7db0a0(void);
uint32_t isaac_hud_7616ad_host_7cb6e0(void);
int32_t isaac_hud_7616ad_stage_1550(void);
int32_t isaac_hud_7616ad_stage_1620(void);
int32_t isaac_hud_7616ad_stage_7db0a0(void);
int32_t isaac_hud_7616ad_stage_count(void);
int32_t isaac_hud_7616ad_stage_store(void);

/* Helpers ABI v37 (0x0076280f): the LAST span-A caller-guard site
   LANDED — the shared tail block 0x762806..0x76288b of draw span A
   (0x760c8c..0x762d4c), plus the span-B unconditional 0x7706e0
   caller-guard CLASS. The 0x762806 head is the COMMON TAIL of the
   span-A dispatch — the v35 (0x7613e8..0x7614b4) and v36
   (0x76169a..0x7616e6) blocks both jmp 0x762806 — and runs the
   unconditional HasCollectible(p, 0x298, 0) sample for every case
   that reaches the tail. Machine order:
     r_298 = 0x7706e0(p, 0x298, 0) [0x76280f — IN-FAMILY v25-v30-
                                    LANDED, UNCONDITIONAL; push 0
                                    flag @0x762806 ; push 0x298 id
                                    @0x762808 ; mov ecx,edi @0x76280d]
     gate A: LOW(r_298) != 0        [0x762814 test al,al ;
                                     0x762816 je 0x76285b — closed
                                     jumps to the case-index dispatch]
     block (A open):
       r_5b = 0x5b1500([ebp-0x1e0], 0x40000, 0) [0x762825 — HOST]
       gate B: LOW(r_5b) != 0       [0x762830 test al,al ;
                                     0x762832 je 0x76288b (dispatch)]
       gate C: LOW(cl) != 0         [0x762834 test cl,cl ;
                                     0x762836 je 0x76288b — cl = byte
                                     [ebp-0x1c0], loaded 0x76282a
                                     AFTER the 0x5b1500 call]
       clamp = SIGNED max([p+0x1e74], 0x384) [0x762843 cmp eax,0x384 ;
                                     0x762847 cmovl — int32]
       [p+0x1e74] = clamp           [0x762850 — OBSERVABLE store]
       0x758a70(p, 2, 0, 0)         [0x762856 — HOST]
     merge 0x76285b: case-index dispatch re-entry (0x762867 add
       [ebp-0x1dc],-0xf0 ; 0x762872 UNSIGNED cmp eax,0xca ; 0x76287d
       movzx byte[eax+0x7631a8] ; 0x762884 jmp [eax*4+0x763184]).
   Gate A/B/C are test al,al / test cl,cl LOW-byte gates (uint32_t +
   & 0xff, v8 no-uint8_t convention); the clamp is SIGNED int32
   (cmovl); the store is OBSERVABLE. The case-index dispatch stays
   host; only the decision layer is exported.
   Span-B class: the lea-corrected census (v37) finds 229 0x7706e0
   sites in span B (0x763570..0x770000); 141 unconditional (no call-
   bypass conditional in the block prefix); 138 are the STRICT imm-imm
   arg class (straight-line push flag / push id prefix, flag and id
   both immediates) with a test al,al post-call LOW gate and are
   landed as the per-site caller-guard table (gate kind 0 =
   continuation-on-open / 1 = continuation-on-closed; the 2 far-flag
   sites 0x763c7a / 0x763d64 have an unconditional jmp inside the arg
   prefix — runtime flag — and 1 widen outlier 0x765f8a consumes the
   sample via movzx esi,al; those and the 88 call-bypass-gated sites
   stay host). Every landed continuation contains >= 1 host E8 within
   0x400 bytes (verified this unit; 3 chained sites 0x763967 /
   0x766e79 / 0x766ef3 pass through further in-family sites first).
   Evidence: section-notes/hud-v37-76280f/NOTES.md + cpu-dump/
   0076280f.txt. Span-A caller-guard layer is now EXHAUSTED. */
enum {
  ISAAC_HUD_76280F_VA_HEAD = 0x00762806u, /* push 0 (flag) — shared tail */
  ISAAC_HUD_76280F_VA_PUSH_FLAG = 0x00762806u, /* push 0 (flag) */
  ISAAC_HUD_76280F_VA_PUSH_ID = 0x00762808u,   /* push 0x298 (id) */
  ISAAC_HUD_76280F_VA_MOV_ECX = 0x0076280du,   /* mov ecx,edi */
  ISAAC_HUD_76280F_VA_CALL_7706E0 = 0x0076280fu, /* call 0x7706e0 */
  ISAAC_HUD_76280F_VA_TEST = 0x00762814u,      /* test al,al (LOW) */
  ISAAC_HUD_76280F_VA_JE_MERGE = 0x00762816u,  /* je 0x76285b (merge) */
  ISAAC_HUD_76280F_VA_BLOCK = 0x00762818u,     /* block head (A open) */
  ISAAC_HUD_76280F_VA_CALL_5B1500 = 0x00762825u, /* call 0x5b1500 */
  ISAAC_HUD_76280F_VA_TEST_5B = 0x00762830u,   /* test al,al (LOW) */
  ISAAC_HUD_76280F_VA_JE_5B = 0x00762832u,     /* je 0x76288b (notch) */
  ISAAC_HUD_76280F_VA_TEST_CL = 0x00762834u,   /* test cl,cl (LOW) */
  ISAAC_HUD_76280F_VA_JE_CL = 0x00762836u,     /* je 0x76288b (notch) */
  ISAAC_HUD_76280F_VA_LOAD_1E74 = 0x00762838u, /* mov eax,[edi+0x1e74] */
  ISAAC_HUD_76280F_VA_CLAMP_CMP = 0x00762843u, /* cmp eax,0x384 */
  ISAAC_HUD_76280F_VA_CMOVL = 0x00762847u,     /* cmovl eax,ecx (SIGNED) */
  ISAAC_HUD_76280F_VA_STORE_1E74 = 0x00762850u, /* mov [edi+0x1e74],eax */
  ISAAC_HUD_76280F_VA_CALL_758A70 = 0x00762856u, /* call 0x758a70 */
  ISAAC_HUD_76280F_VA_MERGE = 0x0076285bu,     /* merge + dispatch re-entry */
  ISAAC_HUD_76280F_VA_MERGE_HEAD = 0x00762861u, /* mov ecx,[ebp-0x1c0] */
  ISAAC_HUD_76280F_VA_DISPATCH_ADD = 0x0076286du, /* add eax,-0xf0 */
  ISAAC_HUD_76280F_VA_DISPATCH_CMP = 0x00762872u, /* cmp eax,0xca (UNSIGNED) */
  ISAAC_HUD_76280F_VA_DISPATCH_MOVZX = 0x0076287du, /* movzx byte[eax+0x7631a8] */
  ISAAC_HUD_76280F_VA_DISPATCH_JMP = 0x00762884u,   /* jmp [eax*4+0x763184] */
  ISAAC_HUD_76280F_VA_NOTCH = 0x0076288bu,     /* closed-path dispatch re-entry */
  ISAAC_HUD_76280F_DISPATCH_TABLE_VA = 0x00763184u,   /* case table */
  ISAAC_HUD_76280F_DISPATCH_BYTE_TABLE_VA = 0x007631a8u, /* byte selector */
  ISAAC_HUD_76280F_ARG_ID = 0x298u,            /* HasCollectible id */
  ISAAC_HUD_76280F_ARG_FLAG = 0u,              /* HasCollectible flag */
  ISAAC_HUD_76280F_CLAMP_MIN = 0x384u,         /* SIGNED clamp bound */
  ISAAC_HUD_76280F_OFF_1E74 = 0x1e74u,         /* observable store field */
  ISAAC_HUD_76280F_GATE_5B_ARG0 = 0x40000u,    /* 0x5b1500 arg */
  ISAAC_HUD_76280F_GATE_5B_ARG1 = 0u,          /* 0x5b1500 arg */
  ISAAC_HUD_76280F_CALL_758A70_ARG0 = 2,       /* 0x758a70 arg */
  ISAAC_HUD_76280F_CALL_758A70_ARG1 = 0,       /* 0x758a70 arg */
  ISAAC_HUD_76280F_CALL_758A70_ARG2 = 0,       /* 0x758a70 arg */
  ISAAC_HUD_76280F_HOST_7706E0 = 0x007706e0u,  /* in-family v25-v30-landed */
  ISAAC_HUD_76280F_HOST_5B1500 = 0x005b1500u,  /* host (block A edge) */
  ISAAC_HUD_76280F_HOST_758A70 = 0x00758a70u,  /* host (store-gated edge) */
  ISAAC_HUD_76280F_STAGE_OPEN = 1,             /* plan bit: gate A open */
  ISAAC_HUD_76280F_STAGE_5B = 2,               /* plan bit: 0x5b1500 edge */
  ISAAC_HUD_76280F_STAGE_ARM = 4,              /* plan bit: gate C open */
  ISAAC_HUD_76280F_STAGE_STORE = 8,            /* plan bit: [p+0x1e74]=clamp */
  ISAAC_HUD_76280F_STAGE_758A70 = 0x10         /* plan bit: 0x758a70 edge */
};

/* Composed machine-order plan of the 0x76280f caller-guard layer
   (helpers ABI v37). edge_7706e0 = 1 ALWAYS (the head is the shared
   tail; the sample runs for every case that reaches it); has_open =
   LOW(r_298) != 0; edge_5b1500 = has_open (the 0x5b1500 edge is the
   block's first edge — it fires whenever gate A is open, even when
   gates B/C close); arm_open = LOW(cl) != 0; clamp_1e74 = SIGNED
   max(field, 0x384) (cmovl — 0xffffffff as -1 clamps UP);
   store_1e74 = edge_5b1500 && arm_open (gates A && B && C — the
   OBSERVABLE [p+0x1e74]=clamp fires); edge_758a70 = store_1e74 (the
   host call fires on the same three gates, store precedes it);
   host_edge_count = edge_5b1500 + edge_758a70 (in-family 0x7706e0 is
   not a host edge); pure_complete = 1 iff has_open == 0 (gate A
   closed: the only edge is the in-family call). */
typedef struct IsaacHud76280fPlan {
  int32_t edge_7706e0;      /* +0x00 1 — unconditional in-family sample */
  int32_t has_open;         /* +0x04 LOW(r_298) != 0 — gate A */
  int32_t edge_5b1500;      /* +0x08 has_open — host 0x5b1500 fires */
  int32_t arm_open;         /* +0x0c LOW(cl) != 0 — gate C */
  int32_t clamp_1e74;       /* +0x10 SIGNED max(field, 0x384) */
  int32_t store_1e74;       /* +0x14 gates A&&B&&C — observable store */
  int32_t edge_758a70;      /* +0x18 store_1e74 — host 0x758a70 fires */
  int32_t host_edge_count;  /* +0x1c edge_5b1500 + edge_758a70 */
  int32_t pure_complete;    /* +0x20 1 iff has_open == 0 */
} IsaacHud76280fPlan;

int32_t isaac_hud_76280f_has_open(uint32_t r_298);
int32_t isaac_hud_76280f_5b1500_open(uint32_t r_5b);
int32_t isaac_hud_76280f_arm_open(uint32_t cl);
int32_t isaac_hud_76280f_clamp_1e74(int32_t field);
int32_t isaac_hud_76280f_store_needed(uint32_t r_298, uint32_t r_5b,
                                      uint32_t cl);
void isaac_hud_76280f_guard_plan(uint32_t r_298, uint32_t r_5b,
                                 uint32_t cl, int32_t field,
                                 IsaacHud76280fPlan* out);
uint32_t isaac_hud_76280f_va_head(void);
uint32_t isaac_hud_76280f_va_push_flag(void);
uint32_t isaac_hud_76280f_va_push_id(void);
uint32_t isaac_hud_76280f_va_mov_ecx(void);
uint32_t isaac_hud_76280f_va_call_7706e0(void);
uint32_t isaac_hud_76280f_va_test(void);
uint32_t isaac_hud_76280f_va_je_merge(void);
uint32_t isaac_hud_76280f_va_block(void);
uint32_t isaac_hud_76280f_va_call_5b1500(void);
uint32_t isaac_hud_76280f_va_test_5b(void);
uint32_t isaac_hud_76280f_va_je_5b(void);
uint32_t isaac_hud_76280f_va_test_cl(void);
uint32_t isaac_hud_76280f_va_je_cl(void);
uint32_t isaac_hud_76280f_va_load_1e74(void);
uint32_t isaac_hud_76280f_va_clamp_cmp(void);
uint32_t isaac_hud_76280f_va_cmovl(void);
uint32_t isaac_hud_76280f_va_store_1e74(void);
uint32_t isaac_hud_76280f_va_call_758a70(void);
uint32_t isaac_hud_76280f_va_merge(void);
uint32_t isaac_hud_76280f_va_merge_head(void);
uint32_t isaac_hud_76280f_va_dispatch_add(void);
uint32_t isaac_hud_76280f_va_dispatch_cmp(void);
uint32_t isaac_hud_76280f_va_dispatch_movzx(void);
uint32_t isaac_hud_76280f_va_dispatch_jmp(void);
uint32_t isaac_hud_76280f_va_notch(void);
uint32_t isaac_hud_76280f_dispatch_table_va(void);
uint32_t isaac_hud_76280f_dispatch_byte_table_va(void);
uint32_t isaac_hud_76280f_arg_id(void);
uint32_t isaac_hud_76280f_arg_flag(void);
uint32_t isaac_hud_76280f_clamp_min(void);
uint32_t isaac_hud_76280f_off_1e74(void);
uint32_t isaac_hud_76280f_gate_5b_arg0(void);
uint32_t isaac_hud_76280f_gate_5b_arg1(void);
int32_t isaac_hud_76280f_call_758a70_arg0(void);
int32_t isaac_hud_76280f_call_758a70_arg1(void);
int32_t isaac_hud_76280f_call_758a70_arg2(void);
uint32_t isaac_hud_76280f_host_7706e0(void);
uint32_t isaac_hud_76280f_host_5b1500(void);
uint32_t isaac_hud_76280f_host_758a70(void);
int32_t isaac_hud_76280f_stage_open(void);
int32_t isaac_hud_76280f_stage_5b(void);
int32_t isaac_hud_76280f_stage_arm(void);
int32_t isaac_hud_76280f_stage_store(void);
int32_t isaac_hud_76280f_stage_758a70(void);

/* Helpers ABI v37 (span-B class): the per-site caller-guard table of
   the UNCONDITIONAL HasCollectible 0x7706e0 call sites inside draw
   span B (0x763570..0x770000) — 138 rows (see the 0x76280f block
   above for the census). Each row: {va, id, flag, kind, test_va,
   jcc_va, tgt_va}; kind 0 = continuation-on-open (test al,al ; je
   merge — the OPEN path falls through, the 0x76280f shape), kind 1 =
   continuation-on-closed (test al,al ; jne merge — the OPEN path
   jumps away). The sample is always consumed as a LOW byte
   (test al,al; 0x100 CLOSED); every landed continuation contains
   >= 1 host E8 within 0x400 bytes (verified this unit; the site
   table's host_edge_count_min is the class floor). The span-B bodies
   stay host; only the per-site decision layer is landed. */
enum {
  ISAAC_HUD_SPANB_SPAN_B_BEGIN = 0x00763570u,  /* span B start */
  ISAAC_HUD_SPANB_SPAN_B_END = 0x00770000u,    /* span B end */
  ISAAC_HUD_SPANB_UNCOND_COUNT = 138,          /* strict imm-imm rows */
  ISAAC_HUD_SPANB_SITE_ROW_STRIDE = 0x1cu,     /* 7 x u32 row */
  ISAAC_HUD_SPANB_GATE_KIND_CONT_ON_OPEN = 0,  /* je merge shape */
  ISAAC_HUD_SPANB_GATE_KIND_CONT_ON_CLOSED = 1, /* jne merge shape */
  ISAAC_HUD_SPANB_SAMPLE_IS_LOW = 1,           /* test al,al law */
  ISAAC_HUD_SPANB_HOST_7706E0 = 0x007706e0u    /* in-family v25-v30-landed */
};

/* Composed per-site plan of an unconditional span-B 0x7706e0 site
   (helpers ABI v37). sample_open = LOW(sample) != 0 (the shared
   test al,al law); continuation = kind 0 ? open : closed (the jcc
   direction law); host_edge_count_min = continuation ? 1 : 0 (the
   class floor — every landed continuation contains >= 1 host edge,
   verified this unit); pure_complete = continuation ? 0 : 1 (when
   the gate closes the continuation the site's only edge is the
   in-family call). */
typedef struct IsaacHudSpanbSitePlan {
  uint32_t va;              /* +0x00 site VA (table) */
  uint32_t id;              /* +0x04 HasCollectible id (table) */
  uint32_t flag;            /* +0x08 HasCollectible flag (table) */
  int32_t kind;             /* +0x0c gate kind (table) */
  int32_t sample_open;      /* +0x10 LOW(sample) != 0 */
  int32_t continuation;     /* +0x14 kind 0: open / kind 1: closed */
  int32_t host_edge_count_min; /* +0x18 continuation ? 1 : 0 (floor) */
  int32_t pure_complete;    /* +0x1c continuation ? 0 : 1 */
} IsaacHudSpanbSitePlan;

uint32_t isaac_hud_spanb_uncond_count(void);
uint32_t isaac_hud_spanb_uncond_va(uint32_t idx);
uint32_t isaac_hud_spanb_uncond_id(uint32_t idx);
uint32_t isaac_hud_spanb_uncond_flag(uint32_t idx);
int32_t isaac_hud_spanb_uncond_kind(uint32_t idx);
uint32_t isaac_hud_spanb_uncond_test_va(uint32_t idx);
uint32_t isaac_hud_spanb_uncond_jcc_va(uint32_t idx);
uint32_t isaac_hud_spanb_uncond_tgt_va(uint32_t idx);
int32_t isaac_hud_spanb_sample_open(uint32_t sample);
int32_t isaac_hud_spanb_continuation(int32_t kind, uint32_t sample);
void isaac_hud_spanb_site_plan(uint32_t idx, uint32_t sample,
                               IsaacHudSpanbSitePlan* out);
uint32_t isaac_hud_spanb_span_b_begin(void);
uint32_t isaac_hud_spanb_span_b_end(void);
uint32_t isaac_hud_spanb_uncond_count_const(void);
uint32_t isaac_hud_spanb_site_row_stride(void);
int32_t isaac_hud_spanb_gate_kind_cont_on_open(void);
int32_t isaac_hud_spanb_gate_kind_cont_on_closed(void);
int32_t isaac_hud_spanb_sample_is_low(void);
uint32_t isaac_hud_spanb_host_7706e0(void);

/* ---- Helpers ABI v38: span-B FAR-GUARDED 0x7706e0 caller-guard
   site table ----
   The v37 lea-corrected image-wide census EXCLUDED these rows from
   the 138-site strict imm-imm table: each has a call-BYPASS
   conditional branch in the block PREFIX — a jcc whose target jumps
   PAST the call (the gate consumes a PRIOR in-family sample; the
   call fires only on the fall-through). Landed subset (this unit,
   census6-final.py, byte-verified): 67 rows — direct gate `test
   al,al; je|jne` (the shared LOW-byte sample law, 0x100 CLOSED),
   imm-imm args (flag 0 / id immediate), JCC bytes verified (74/75
   rel8, 0f 84/0f 85 rel32 -> tgt_va), EVERY landed continuation
   contains >= 1 host E8 within 0x400 bytes after va+5 (the class
   floor, verified for all 67). Row = {va, id, flag, kind, test_va,
   jcc_va, tgt_va}; kind 0 = je bypass (continuation-on-open), kind
   1 = jne bypass (continuation-on-closed) — same kind semantics as
   the v37 unconditional class. Excluded (stay host, documented):
   18 field-cmp / test-cl gates (gate samples beyond LOW), 2
   far-flag sites 0x763c7a / 0x763d64 (jmp inside the arg prefix),
   3 shared-tail sites 0x763d2b / 0x76674b / 0x768235 (gate/args
   behind an unconditional jmp), 1 runtime-flag site 0x769cac
   (flag = push eax), 1 widen outlier 0x765f8a (movzx sample, no
   branch gate). 0x771800 (0x771800..0x771d26, ret 8) re-audited
   this unit: SEH-class aligned-frame prologue, call @5th insn
   0x771812 -> 0x75e1d0 (fatal-capable host body), virtual dispatch
   0x77184a, inlined IsIdxLocalPlayer-shaped scan, ZERO 0x7706e0 /
   0x7715* sites (only in-family edge = the 0x7cb6e0 BODY call) —
   the caller-guard model covers NO decision prefix -> HOST
   (published census row; the 0x778df9 'inside 0x771800' claim stays
   corrected: 0x778df9 is 0x75f9 past, in the continuous host region
   0x778de5).*/

enum {
  ISAAC_HUD_SPANB_FAR_COUNT = 67,      /* landed far-guarded rows */
  ISAAC_HUD_SPANB_FAR_ROW_STRIDE = 0x1cu, /* 7 x u32 row */
  ISAAC_HUD_SPANB_FAR_SAMPLE_IS_LOW = 1,  /* test al,al law */
  ISAAC_HUD_SPANB_FAR_HOST_7706E0 = 0x007706e0u /* in-family v25-v30-landed */
};

/* Same shape as IsaacHudSpanbSitePlan (v37): the composed per-site
   decision. */
typedef struct IsaacHudSpanbFarSitePlan {
  uint32_t va;              /* +0x00 site VA (table) */
  uint32_t id;              /* +0x04 HasCollectible id (table) */
  uint32_t flag;            /* +0x08 HasCollectible flag (table) */
  int32_t kind;             /* +0x0c jcc shape (0 je / 1 jne) */
  int32_t sample_open;      /* +0x10 LOW-byte sample law */
  int32_t continuation;     /* +0x14 kind law (0/1) */
  int32_t host_edge_count_min; /* +0x18 class floor: continuation?1:0 */
  int32_t pure_complete;    /* +0x1c continuation ? 0 : 1 */
} IsaacHudSpanbFarSitePlan;

uint32_t isaac_hud_spanb_far_count(void);
uint32_t isaac_hud_spanb_far_va(uint32_t idx);
uint32_t isaac_hud_spanb_far_id(uint32_t idx);
uint32_t isaac_hud_spanb_far_flag(uint32_t idx);
int32_t isaac_hud_spanb_far_kind(uint32_t idx);
uint32_t isaac_hud_spanb_far_test_va(uint32_t idx);
uint32_t isaac_hud_spanb_far_jcc_va(uint32_t idx);
uint32_t isaac_hud_spanb_far_tgt_va(uint32_t idx);
int32_t isaac_hud_spanb_far_sample_open(uint32_t sample);
int32_t isaac_hud_spanb_far_continuation(int32_t kind, uint32_t sample);
void isaac_hud_spanb_far_site_plan(uint32_t idx, uint32_t sample,
                                   IsaacHudSpanbFarSitePlan* out);
uint32_t isaac_hud_spanb_far_count_const(void);
uint32_t isaac_hud_spanb_far_site_row_stride(void);
int32_t isaac_hud_spanb_far_sample_is_low(void);
uint32_t isaac_hud_spanb_far_host_7706e0(void);

/* ---- Helpers ABI v39: span-B recorded-residual laws
   (section-notes/hud-v39-frontier/). The v37/v38 exclusions, now with
   pure decision cores for the computed-arg pair + the widen step.
   Sites stay keyed by the CALL VA inside the span dispatch; the sample
   input is the LOW byte of the preceding 0x7706e0 edge (v25-v30 law). */

enum {
  ISAAC_HUD_SPANB_ARG_D13_SITE_VA = 0x00763c58u, /* call (p,0) sample */
  ISAAC_HUD_SPANB_ARG_D13_SETNE_VA = 0x00763c63u,
  ISAAC_HUD_SPANB_ARG_D13_LEA_VA = 0x00763c66u,  /* add ecx,0xd */
  ISAAC_HUD_SPANB_ARG_D13_BASE = 0xdu,
  ISAAC_HUD_SPANB_ARG_D13_OPEN_ADD = 1,
  ISAAC_HUD_SPANB_ARG_D13_FIRST_PUSH = 1,
  ISAAC_HUD_SPANB_ARG_2N5_SITE_VA = 0x00763d41u,
  ISAAC_HUD_SPANB_ARG_2N5_SETNE_VA = 0x00763d4cu,
  ISAAC_HUD_SPANB_ARG_2N5_LEA_VA = 0x00763d4fu,  /* lea ecx,[ecx*2+5] */
  ISAAC_HUD_SPANB_ARG_2N5_BASE = 5,
  ISAAC_HUD_SPANB_ARG_2N5_OPEN_MUL = 2,
  ISAAC_HUD_SPANB_ARG_2N5_FIRST_PUSH = 1,
  ISAAC_HUD_SPANB_WIDEN_SITE_VA = 0x00765f96u,   /* movzx esi,al */
  ISAAC_HUD_SPANB_WIDEN_SAMPLE_ID = 0x105u,
  ISAAC_HUD_SPANB_WIDEN_MASK = 0xffu,
  /* recorded-not-landed census rows (stay host / value edges). */
  ISAAC_HUD_SPANB_FARFLAG_A_VA = 0x00763c7au,
  ISAAC_HUD_SPANB_FARFLAG_B_VA = 0x00763d64u,
  ISAAC_HUD_SPANB_RUNTIME_FLAG_VA = 0x00769cacu, /* flag = push eax (v37 record) */
  ISAAC_HUD_SPANB_WIDEN_SUM_EDGES = 3 /* += LOW(9305f0) + 770ca0(0x29d) + 770ca0(0x14b) */
};

/* arg = base + (LOW(sample) != 0 ? open : 0) — byte gate & 0xff. */
uint32_t isaac_hud_spanb_arg_d13(uint32_t sample);
uint32_t isaac_hud_spanb_arg_2n5(uint32_t sample);
/* the widen outlier's widen step: value = sample & 0xff. */
uint32_t isaac_hud_spanb_widen_byte(uint32_t sample);
uint32_t isaac_hud_spanb_arg_d13_site_va(void);
uint32_t isaac_hud_spanb_arg_2n5_site_va(void);
uint32_t isaac_hud_spanb_widen_site_va(void);
int32_t isaac_hud_spanb_arg_d13_base(void);
int32_t isaac_hud_spanb_arg_2n5_base(void);
int32_t isaac_hud_spanb_arg_2n5_open_mul(void);
int32_t isaac_hud_spanb_widen_sum_edges(void);
uint32_t isaac_hud_spanb_farflag_a_va(void);
uint32_t isaac_hud_spanb_farflag_b_va(void);
uint32_t isaac_hud_spanb_runtime_flag_va(void);

#ifdef __cplusplus
}
#endif
