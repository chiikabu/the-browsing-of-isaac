#pragma once

#include <stdint.h>
#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

/* Pure subsets recovered from PlayerHUD post-update residual FUN_00842230
   (VA 0x00842230). Exact PlayerHUD::UpdateHearts (0x00841e20). Edges
   0x0084240d / 0x00842486 / 0x00842499 / 0x0084250f / 0x0084298b /
   0x00842a5b / 0x00842c92 / 0x00842f8a.
   Hosts: 0x007706e0 / 0x009588a0 / 0x0072fd10 / 0x0040c550 / 0x00740bc0 /
   0x0040c3b0 / 0x009a8970 / 0x00694fb0 / 0x0040bd50 / 0x00407f10.
   Helpers ABI v11: P5 residual after the pocket loop (VA 0x00843116).
   Edges 0x0084312f / 0x0084315a / 0x008431e0 / 0x00843213.
   Host alloc 0x00a0f4c0. Grow host 0x0084bc30.
   Helpers ABI v12: class-wide byte-parameter sweep.
   Helpers ABI v13: P6 pocket-upgrade residual (VA 0x0084327d..0x008435ed)
   plus P7 gates (0x00843667..0x00843a5c). Sites 0x0084325d / 0x008435ed.
   Helpers ABI v14: tail residuals after the P6/P7 loops (0x00843a62 /
   0x00843af1 / 0x00843ba6). Hosts 0x00414a80 / 0x0083b830 / 0x0084bba0 /
   0x00748490 / 0x00b63a18 / 0x004288a0 / 0x00415d20 / 0x00aef15c.
   Helpers ABI v16: tail completion to the function epilogue.
   Helpers ABI v17: pure UpdateHearts call-site plan
   Helpers ABI v18: pure StatHUD progress-slot tween
   Helpers ABI v19: pure 6-slot StatHUD progress updater
   Helpers ABI v20: pure action-id to rdata-string select
   Helpers ABI v21: pure 2-segment SSE intersect
   Helpers ABI v22: pure thiscall MSVC SSO-string
   Helpers ABI v23: pure thiscall SEH ctor prefix
   Helpers ABI v24: typed host plan for thiscall 4-subobject
   Helpers ABI v25: typed host plan for thiscall 7-subobject
   Helpers ABI v26: typed host plan for range wipe (VA 0x00856840).
   Next VA 0x008568a0.
   Helpers ABI v27: typed host GATE/PLAN for FUN_0084dea0 / FUN_0084e200.
   Gate [this+4]==0 skip (full dword). Six host 0x84dc00 calls with xmm1
   this+{0x50,0x64,0x78,0x8c,0xa0,0xb4} (v19 slot base+4 by reference) and
   rdata labels Speed/Tears/Damage/Range/Shot Speed/Luck. Sibling 0x84e200
   xorps-neg xmm1 with v21 0xbacb70 before each host call. 0x84dc00 /
   0x84ea90 / 0x84eb10 stay host. Not Update-wired. Next VA 0x0084e5b0.
   Helpers ABI v28: FUN_0084e5b0 predicate GATE/PLAN + pure islands.
   Index vs signed-/0x68 count (unsigned jae, v22 stride by ref) then
   [this+4]==0 early-true (full dword, v27 gate off by ref, inverted
   polarity). Six 0xc sub-vectors of the 0x68 object (v25 this-offs by
   ref, low-to-high). Char wl/bl pure; 0x7706e0 / 0x771550 stay host.
   +0x60 completion prefix pure, globals host. +0x64 mode/flags pure
   (game+0x269c8 recaptured). Not Update-wired. Next VA 0x0084e820.
   Helpers ABI v29: FUN_0084e820 counter GATE/PLAN + pure islands.
   [this+4]==0 early-return signed /0x68 of this+0x2c/+0x30 (v28
   count by ref). Else Game+0x2a448 dword list: signed in-range
   body, unsigned loop-cont. Empty range kind==0xf char ids
   {0x23,0x106}/0x30; else host 0x72fe80 / 0x72fec0 recapture al.
   Extra this+0x20/+0x24 /0x68 (v26 by ref) + pred loop recaptures
   v28 0x84e5b0 al. Not Update-wired. Next VA 0x0084e9d0 (v19, done;
   real next frontier is the v26 chain 0x008568a0).
   Helpers ABI v30: typed host COPY plan for FUN_008568a0 (0x68
   object copy-ctor, copy twin of the v26 wipe). thiscall dest=ecx,
   stdcall src [ebp+8], ret 4, eax=dest. Seven calls: 1x 0x40cf50
   SSO-string copy-ctor (this=dest, arg=src, +0 member) then 6x
   0x43eca0 0xc-vector copy-ctor at dest+src +0x18..+0x54 (v28 vec
   offs low-to-high by reference). Pure tail: dword copies +0x60/+0x64
   (v28 completion/mode by reference). Not Update-wired. Next VA
   0x00856960.
   Helpers ABI v31: FUN_00856960 stdcall range move-ctor (the
   0x68-object vector reallocation loop 856650 -> 8568a0 / 0x856e10 /
   0x856960 / 0x856840, next after the v30 copy-ctor). Args
   [ebp+8]=src_begin, [ebp+0xc]=src_end, [ebp+0x10]=dest; ret 0xc;
   eax=dest_end (dest_begin + count*0x68). Full-dword gate
   src_begin != src_end; stride 0x68 (v22 by ref); per-element
   thiscall move-ctor 0x856e10 (dest=ecx, src=[arg], ret 4, eax=dest).
   Trailing 0x856840(dest_end, dest_end) call is invariant-empty:
   always a no-op, documented and omitted. FUN_00856e10 peeled pure:
   dest[0..0x68) = src[0..0x68); src reset to empty (byte +0 = 0,
   +0x10 = 0, +0x14 = 0xf SSO cap, six 0xc triples +0x18..+0x5c
   zeroed; v28 vec offs by reference); tail +0x60/+0x64 copied, src
   keeps them. Both Not Update-wired. Next VA 0x008569a0.
   Helpers ABI v32: RecomputeStats 0x84ca00 mask-dispatch pure laws
   (blob-gated: host resolves the 3 opaque stat probes 0x7f92b0 /
   0x749830 / 0x7f96f0).  Pure laws: setg flag (gameframe-entryframe
   signed >1, 0x84ca3f), per-mask tween selection (low bits on bl,
   high bits on ebx; slots 6/7 coupled by test bl,0xc0), per-slot
   target f32 (6 entry-field recipes + c0 probe-scalar block +
   xorps 0 + Game+0x1adb4*100).  Every store still goes through the
   v18 pure tween 0x84d6b0.  Not Update-wired. Next VA 0x0084cc40.
   Helpers ABI v33: per-player StatHUD stats-pack updater
   FUN_0084cc40 (VA 0x0084cc40..ret 8 @ 0x0084d6ad) GATE/PLAN +
   pure laws.  thiscall + 2 stdcall args (player_a [esp+4],
   player_b [esp+8] via the push ebx/mov ebx,esp frame).  Two player
   blocks stride 0xcc (v32 PLAYER_STRIDE by ref), block player ptr
   +0x114 (v32 ENTRY_PTR_OFF by ref).  Gate law: block==A ->
   store B + (B!=0) repack; block==B -> store A + RecomputeStats
   0x84ca00(v32 pure laws) (i, mask=-1, dead=i, ret 0xc); else
   skip.  Pack repack = v18 tween law per slot with v32 slot-target
   recipes; mode byte this+0x2ac (v32 MODE_BYTE_OFF by ref).  3
   opaque probes host-resolved (v32 HOST_VA_PROBE1..3 by ref).
   Not Update-wired. Next VA 0x0084d6b0 (v18 tween, ALREADY landed;
   the 84d6b0..84d8xx band is consumed v18/v20/v21).
   Helpers ABI v34: pure leaf gate FUN_00856f50 (VA 0x00856f50..
   0x00856f61) — the v31 recorded next (FUN_00856e10 ret 4 @
   0x00856f4a, int3 pad 0x856f4d..0x856f4f).  thiscall, no args,
   rets at 0x856f5e (xor al,al) and 0x856f61 (mov al,1).  Law:
   mov eax,[ecx+8]; cmp eax,2; je 1; test eax,eax; je 1; else 0 —
   returns 1 iff [this+8] == 2 || [this+8] == 0, FULL-DWORD
   compares (cmp dword + test dword; no byte gate).  0 E8, 0
   stores, 0 indirect.  Sole direct rel32 caller 0x0085a554
   (mov ecx,esi; call; test al,al; je).  Not Update-wired.
   Next VA 0x00856f70 (SEH ctor host, 5 E8 — blocked; the rest of
   the 856fxx..8583xx band is host bodies).
   Helpers ABI v35: pure time-pack leaf FUN_0085af30 (VA 0x0085af30..
   0x0085afaf, ret) — the v34 recorded frontier (0x85a230 band; the
   0x85a200 giant host, 0x85a8b0 1-E8 init, 0x85aeb0 import-thunk
   pair, 0x8583e0 Leaderboard::get_leaderboard stay host).  Register
   args ecx = out struct ptr, edx = value (u32), eax = out; 0 E8,
   0 indirect, 13 stores.  q10000 = mulhi(value,0xd1b71759)>>45
   (value/10000), q100 = mulhi(value%10000,0x51eb851f)>>37; store
   byte +0 = 2, +1c = value%100, +20 = q100-1, +24 = q10000-1900,
   zeros +8..+18/+28..+30, +4 preserved.  9 rel32 callers feed
   edx = [this+0x250].  Not Update-wired.  Next VA 0x0085afb0
   (frame-effect-owned, ALREADY LANDED as isaac_frame_effect_85afb0_*).
   Helpers ABI v36: pure ordinal-suffix leaf FUN_00858870 (VA
   0x00858870..0x008588e5, ret 4) — the census-led pick after the v35
   time-pack leaf (full 0x857500..0x85b000 band walk, caller-verified
   entries; see section-notes/playerhud-v36-census/NOTES.md).  stdcall,
   1 int32 arg [ebp+8], eax = .rdata suffix-string VA.  0 E8, 0 stores,
   0 indirect.  r100 = value - trunc(value/100)*100 (SIGNED magic
   0x51eb851f sar 5 + sign fix, truncation toward zero); r100 ==
   11/12/13 -> TH.  r10 = value - trunc(value/10)*10 (magic 0x66666667
   sar 2 + sign fix); r10 == 1 -> ST (0xb6e4cc "st"), 2 -> ND (0xb6e4c0
   "nd"), 3 -> RD (0xb6e4c4 "rd"), else TH (0xb6e4c8 "th").  Full-dword
   sub/je chain, no byte gate; negatives always TH (-11 != 11).
   Callers 0x858f20 / 0x85902e (both inside the 0x8588f0 SEH giant)
   sprintf rank via "%d%s" 0xb6e6e8.  Not Update-wired.  Next VA
   0x008588f0 (SEH rank-display giant, 58 E8 — blocked; 0x857400 pure
   getter recorded as fresh frontier below the band floor).
   Helpers ABI v37: pure leaderboard type->entry getter FUN_00857400
   (VA 0x00857400..0x0085743c, ret 0) — the v36-recorded below-floor
   frontier, scope confirmed.  thiscall ecx = Leaderboard object;
   kind = [this+8] FULL-DWORD load; `cmp eax,3; ja 0x85742b` UNSIGNED
   gate (no byte mask — byte-gate mutant M81 kills any & 0xff reading).
   kind 0..3 -> [this+0x238+4*kind] via jump table 0x857440 (arms
   0x85740f/0x857416/0x85741d/0x857424); kind > 3 -> host log 0xa112c0
   ("Invalid leaderboard type \n" 0xb6e4f0, level 8) + eax = 0.  0 E8
   in the taken arms, 0 stores, 1 indirect dispatch.  9 callers
   0x857a54/0x857a70/0x857a98/0x857ab4/0x857ff3/0x858018/0x8586ce/
   0x858778/0x858816 (leaderboard best-time rank display band; callers
   test eax,eax; je, then [entry+0xc]-0xa or mode-1 [this+0x24c]-0xa
   vs [this+0x3ac]).  Next VA 0x00857450 (game-update v56 rank
   display, ALREADY LANDED elsewhere).
   Helpers ABI v38: pure float getter FUN_0085e360 (VA 0x0085e360..
   0x0085e366, ret 0) — the first caller-bearing PURE body of the
   0x85e000+ band census (0x85e000..0x89e610 walk: only this body is
   E8-free AND indirect-free AND caller-bearing).  thiscall,
   st0 = f32 view of the dword at [this+0x41c] (x87 fld, bit-
   preserving reinterpret).  6 callers 0x668193/0x66f608/0x78639e/
   0x79d9eb/0x79dbf2/0x79df21.  Next VA 0x0085e370.
   Helpers ABI v39: 7-leaf StatHUD conversion cluster at VA
   0x009bfc00..0x009bfd38 (HUD lane; ownership handed by the PI family
   process-input-v50-9bfc00, re-verified this unit).  Sole callers
   live in the 0x770000 HUD StatHUD stat-bar body (reads/writes
   v32/v33 entry slots [edi+0x1460]/[edi+0x1470]/[edi+0x1480]/
   [edi+0x1568]) except 0x9bfc40 whose caller 0x7619d3 sits in an
   entity-behavior body (same HUD stat fields).  4 pure
   (0 E8): 0x9bfc00 x*4.5f-2.0f; 0x9bfc20 (x+2.0f)/4.5f;
   0x9bfd00 (x-230.0f)/60.0f+2.0f; 0x9bfd20 (x-2.0f)*60.0f+230.0f.
   3 pow-composed (blob-gated, host resolves the powf probe via
   0x4e4690 — the PI "atan2f" mis-ID CORRECTED: 0x4e4690 is
   cvtss2sd x2; call 0xaf08ff; cvtsd2ss, and 0xaf08ff = jmp
   [IAT 0xb18830] = _libm_sse2_pow_precise): 0x9bfc40
   powf(30/(x+1),0.75f)*2.12039089f-2.0f; 0x9bfc80 comiss/jbe
   x<=-2.0f||NaN -> 10000.0f else 30.0f/powf((x+2)*0.471611142f,
   1.33333337f)-1.0f; 0x9bfcd0 comiss/jbe x<=-2.0f||NaN -> 0.0f
   else powf((x+2)*0.44819352f,1.78571427f).  Each SSE op is one f32
   rounding (wasm f32, no fast-math; per-op Math.fround in the oracle).
   All ret 0, xmm0 in/out, 1 direct rel32 caller each
   (0x77007b/0x7700c3/0x770090/0x770102/0x7700d8/0x7700ed/0x7619d3).
   Next VA 0x009bfd40 (SEH ret-4 vector-build host, 5 E8 — PI-recorded
   host, re-verified W29-F9/v40: /GS+SEH frame (handler 0xb0ebd0),
   ret 4 epilogue @ 0x9bff98, this+4 3-dword vector build, [ebx+8]
   stack arg @ 0x9bfda9/@0x9bfe21, xmm2 float param, 31 stores;
   E8 0x9bfdcd->0x9c00c0 / 0x9bfe08->0x41d540 / 0x9bfe1c->0x41d520 /
   0x9bff2c->0x435a50 / 0x9bff69->0x901310; 0 direct callers, 0 static
   dword refs — reached only via runtime-resolved pointer.  Family
   frontier stays host beyond the cluster; the 0x84c206/0x84d66d
   RecomputeStats neighborhood has NO family-side open body (0x84bf30
   HUD v11, 0x84bfd0 EXIT v25, 0x84c170 HUD v5 + slice v84,
   0x84ca00 v32/S1, 0x84cc40 v33, 0x84d6b0 v18, 0x84d740 v20,
   0x84d8b0 v21 — all owned; see section-notes/playerhud-v40-census). */

enum { ISAAC_PLAYERHUD_POST_UPDATE_PURE_HELPERS_ABI_VERSION = 44 };

static constexpr int32_t ISAAC_PLAYERHUD_ACTIVE_COUNTDOWN_BASE = 0x1a8;
static constexpr int32_t ISAAC_PLAYERHUD_ACTIVE_DIRTY_AFTER_GFX = 1;
static constexpr int32_t ISAAC_PLAYERHUD_ACTIVE_IMAGE_SP_BASE = 0x198;
static constexpr int32_t ISAAC_PLAYERHUD_ACTIVE_SLOT_COUNT = 4;
static constexpr int32_t ISAAC_PLAYERHUD_ACTIVE_SLOT_STRIDE = 0x1c;
static constexpr int32_t ISAAC_PLAYERHUD_ACTIVE_SP_SAVED_EBP_OFF = -0x1428;
static constexpr int32_t ISAAC_PLAYERHUD_BOOK_DIRTY_AFTER_GFX = 1;
static constexpr int32_t ISAAC_PLAYERHUD_BOOK_IMAGE_SP_BASE = 0x1a0;
static constexpr int32_t ISAAC_PLAYERHUD_BOOK_LOAD_IMAGE_RESULT_EBP_OFF_BELIAL = -0x14c8;
static constexpr int32_t ISAAC_PLAYERHUD_BOOK_LOAD_IMAGE_RESULT_EBP_OFF_BOTH = -0x14d8;
static constexpr int32_t ISAAC_PLAYERHUD_BOOK_LOAD_IMAGE_RESULT_EBP_OFF_VIRTUES = -0x14b8;
static constexpr int32_t ISAAC_PLAYERHUD_BOOK_LOAD_IMAGE_RESULT_OBJ_EBP_OFF_BELIAL = -0x14c4;
static constexpr int32_t ISAAC_PLAYERHUD_BOOK_LOAD_IMAGE_RESULT_OBJ_EBP_OFF_BOTH = -0x14d4;
static constexpr int32_t ISAAC_PLAYERHUD_BOOK_LOAD_IMAGE_RESULT_OBJ_EBP_OFF_VIRTUES = -0x14b4;
static constexpr int32_t ISAAC_PLAYERHUD_BOOK_MATERIALIZE_OBJ_EBP_OFF_BELIAL = -0x14bc;
static constexpr int32_t ISAAC_PLAYERHUD_BOOK_MATERIALIZE_OBJ_EBP_OFF_BOTH = -0x14cc;
static constexpr int32_t ISAAC_PLAYERHUD_BOOK_MATERIALIZE_OBJ_EBP_OFF_VIRTUES = -0x14ac;
static constexpr int32_t ISAAC_PLAYERHUD_BOOK_MATERIALIZE_SEH_BELIAL = 6;
static constexpr int32_t ISAAC_PLAYERHUD_BOOK_MATERIALIZE_SEH_BOTH = 9;
static constexpr int32_t ISAAC_PLAYERHUD_BOOK_MATERIALIZE_SEH_VIRTUES = 3;
static constexpr int32_t ISAAC_PLAYERHUD_BOOK_MATERIALIZE_THIS_EBP_OFF_BELIAL = -0x14c0;
static constexpr int32_t ISAAC_PLAYERHUD_BOOK_MATERIALIZE_THIS_EBP_OFF_BOTH = -0x14d0;
static constexpr int32_t ISAAC_PLAYERHUD_BOOK_MATERIALIZE_THIS_EBP_OFF_VIRTUES = -0x14b0;
static constexpr int32_t ISAAC_PLAYERHUD_BOOK_PATH_KIND_BELIAL = 2;
static constexpr int32_t ISAAC_PLAYERHUD_BOOK_PATH_KIND_BOTH = 3;
static constexpr int32_t ISAAC_PLAYERHUD_BOOK_PATH_KIND_CLEAR = 0;
static constexpr int32_t ISAAC_PLAYERHUD_BOOK_PATH_KIND_VIRTUES = 1;
static constexpr int32_t ISAAC_PLAYERHUD_BOOK_SP_CLEAR_ARG = 0;
static constexpr int32_t ISAAC_PLAYERHUD_CACHED_ACTIVE_ID_BASE = 0x190;
static constexpr int32_t ISAAC_PLAYERHUD_CACHED_BOOK_OVERLAY_BASE = 0x194;
static constexpr int32_t ISAAC_PLAYERHUD_CACHED_POCKET_ID_BASE = 0x234;
static constexpr int32_t ISAAC_PLAYERHUD_CACHED_POCKET_TYPE_BASE = 0x230;
static constexpr int32_t ISAAC_PLAYERHUD_CACHED_TRINKET_ID_BASE = 0x200;
static constexpr int32_t ISAAC_PLAYERHUD_CACHED_TRINKET_SECONDARY_BASE = 0x204;
static constexpr int32_t ISAAC_PLAYERHUD_COLLECTIBLE_BOOK_OF_BELIAL = 0x22;
static constexpr int32_t ISAAC_PLAYERHUD_COLLECTIBLE_BOOK_OF_VIRTUES = 0x248;
static constexpr int32_t ISAAC_PLAYERHUD_COLLECTIBLE_VIRTUES_BELIAL = 0x3b;
static constexpr int32_t ISAAC_PLAYERHUD_CRITICAL_BLINK_MOD = 0x2d;
static constexpr int32_t ISAAC_PLAYERHUD_CRITICAL_BLINK_WINDOW = 10;
static constexpr int32_t ISAAC_PLAYERHUD_DIRTY_FLAG_EBP_OFF = -0x1419;
static constexpr int32_t ISAAC_PLAYERHUD_GET_ENTITY_TYPE = 5;
static constexpr int32_t ISAAC_PLAYERHUD_HEART_BYTE1_BASE = 0x11;
static constexpr int32_t ISAAC_PLAYERHUD_HEART_STRIDE = 0x10;
static constexpr uint32_t ISAAC_PLAYERHUD_ITEMCFG_GFX_CAPACITY_OFF = 0x4cu;
static constexpr int32_t ISAAC_PLAYERHUD_ITEMCFG_GFX_SSO_THRESHOLD = 0x10;
static constexpr uint32_t ISAAC_PLAYERHUD_ITEMCFG_GFX_STRING_OFF = 0x38u;
static constexpr int32_t ISAAC_PLAYERHUD_ITEMCFG_KIND_GAME_NEG = 2;
static constexpr int32_t ISAAC_PLAYERHUD_ITEMCFG_KIND_MANAGER = 1;
static constexpr int32_t ISAAC_PLAYERHUD_ITEMCFG_KIND_MANAGER_TRINKET = 3;
static constexpr int32_t ISAAC_PLAYERHUD_ITEMCFG_KIND_NULL = 0;
static constexpr int32_t ISAAC_PLAYERHUD_LOAD_IMAGE_PATH_BUF_EBP_OFF = -0x418;
static constexpr int32_t ISAAC_PLAYERHUD_LOAD_IMAGE_RESULT_EBP_OFF = -0x14a8;
static constexpr int32_t ISAAC_PLAYERHUD_LOAD_IMAGE_RESULT_OBJ_EBP_OFF = -0x14a4;
static constexpr int32_t ISAAC_PLAYERHUD_MATERIALIZE_OBJ_EBP_OFF = -0x149c;
static constexpr int32_t ISAAC_PLAYERHUD_MATERIALIZE_SEH_TRY_LEVEL = 0;
static constexpr int32_t ISAAC_PLAYERHUD_MATERIALIZE_THIS_EBP_OFF = -0x14a0;
static constexpr uint32_t ISAAC_PLAYERHUD_PATH_ACTIVE_0x122 = 0x00b6dd44u;
static constexpr uint32_t ISAAC_PLAYERHUD_PATH_ACTIVE_0x146 = 0x00b6ddc0u;
static constexpr uint32_t ISAAC_PLAYERHUD_PATH_ACTIVE_0x160 = 0x00b6de54u;
static constexpr uint32_t ISAAC_PLAYERHUD_PATH_ACTIVE_0x1a6 = 0x00b6de34u;
static constexpr uint32_t ISAAC_PLAYERHUD_PATH_ACTIVE_0x1b2 = 0x00b6dcd0u;
static constexpr uint32_t ISAAC_PLAYERHUD_PATH_ACTIVE_0x1da = 0x00b6ddf8u;
static constexpr uint32_t ISAAC_PLAYERHUD_PATH_ACTIVE_0x1df = 0x00b6dea4u;
static constexpr uint32_t ISAAC_PLAYERHUD_PATH_ACTIVE_0x1e3 = 0x00b6de1cu;
static constexpr uint32_t ISAAC_PLAYERHUD_PATH_ACTIVE_0x1e9 = 0x00b6de70u;
static constexpr uint32_t ISAAC_PLAYERHUD_PATH_ACTIVE_0x20b = 0x00b6dd04u;
static constexpr uint32_t ISAAC_PLAYERHUD_PATH_ACTIVE_0x23 = 0x00b6df18u;
static constexpr uint32_t ISAAC_PLAYERHUD_PATH_ACTIVE_0x280 = 0x00b6df94u;
static constexpr uint32_t ISAAC_PLAYERHUD_PATH_ACTIVE_0x280_BELIAL = 0x00b6df70u;
static constexpr uint32_t ISAAC_PLAYERHUD_PATH_ACTIVE_0x2ad = 0x00b6dddcu;
static constexpr uint32_t ISAAC_PLAYERHUD_PATH_ACTIVE_0x2c6 = 0x00b6def8u;
static constexpr uint32_t ISAAC_PLAYERHUD_PATH_ACTIVE_0x2c7 = 0x00b6df3cu;
static constexpr uint32_t ISAAC_PLAYERHUD_PATH_ACTIVE_0x2d0 = 0x00b6df50u;
static constexpr int32_t ISAAC_PLAYERHUD_PATH_BOOK_OF_BELIAL = 0x00b6dedc;
static constexpr int32_t ISAAC_PLAYERHUD_PATH_BOOK_OF_VIRTUES = 0x00b6debc;
static constexpr int32_t ISAAC_PLAYERHUD_PATH_BOOK_VIRTUES_BELIAL = 0x00b6e020;
static constexpr int32_t ISAAC_PLAYERHUD_PLAYER_POCKET_ID_BASE = 0x17a0;
static constexpr int32_t ISAAC_PLAYERHUD_PLAYER_POCKET_STRIDE = 8;
static constexpr int32_t ISAAC_PLAYERHUD_PLAYER_POCKET_TYPE_BASE = 0x17a4;
static constexpr int32_t ISAAC_PLAYERHUD_PLAYER_TRINKET_ID_BASE = 0x16c0;
static constexpr int32_t ISAAC_PLAYERHUD_PLAYER_TRINKET_ID_STRIDE = 4;
static constexpr int32_t ISAAC_PLAYERHUD_PLAYER_TRINKET_SECONDARY = 0x1fb8;
static constexpr int32_t ISAAC_PLAYERHUD_POCKET_ANM2_BASE = 0x238;
static constexpr int32_t ISAAC_PLAYERHUD_POCKET_PATH_KIND_CARD = 1;
static constexpr int32_t ISAAC_PLAYERHUD_POCKET_PATH_KIND_PILL = 2;
static constexpr int32_t ISAAC_PLAYERHUD_POCKET_PATH_KIND_RESET = 0;
static constexpr int32_t ISAAC_PLAYERHUD_HEART_SLOT_COUNT = 24;
static constexpr int32_t ISAAC_PLAYERHUD_POCKET_SLOT_COUNT = 4;
static constexpr int32_t ISAAC_PLAYERHUD_POCKET_SLOT_STRIDE = 0x11c;
static constexpr int32_t ISAAC_PLAYERHUD_POCKET_TYPE_CARD = 0;
static constexpr int32_t ISAAC_PLAYERHUD_POCKET_TYPE_PILL = 1;
static constexpr int32_t ISAAC_PLAYERHUD_SP_CLEAR_ALLOC_SIZE = 0x18;
static constexpr uint32_t ISAAC_PLAYERHUD_SP_CLEAR_ARG_OFF = 0x14u;
static constexpr int32_t ISAAC_PLAYERHUD_SP_CLEAR_VTABLE = 0x00b1a6e0;
static constexpr int32_t ISAAC_PLAYERHUD_TRINKET_0x4b_MAGIC = 0x5ac056b1;
static constexpr int32_t ISAAC_PLAYERHUD_TRINKET_0x4b_MOD = 0xbd;
static constexpr int32_t ISAAC_PLAYERHUD_TRINKET_DIRTY_AFTER_GFX = 1;
static constexpr int32_t ISAAC_PLAYERHUD_TRINKET_ID_MASK = 0x7fff;
static constexpr int32_t ISAAC_PLAYERHUD_TRINKET_IMAGE_SP_BASE = 0x208;
static constexpr int32_t ISAAC_PLAYERHUD_TRINKET_LOAD_IMAGE_RESULT_EBP_OFF = -0x1448;
static constexpr int32_t ISAAC_PLAYERHUD_TRINKET_LOAD_IMAGE_RESULT_OBJ_EBP_OFF = -0x1444;
static constexpr int32_t ISAAC_PLAYERHUD_TRINKET_SEH_TRY_LEVEL = 0xc;
static constexpr int32_t ISAAC_PLAYERHUD_TRINKET_SLOT_COUNT = 2;
static constexpr int32_t ISAAC_PLAYERHUD_TRINKET_SLOT_STRIDE = 0x18;
static constexpr int32_t ISAAC_PLAYERHUD_TRINKET_SPECIAL_0x4b = 0x4b;
static constexpr int32_t ISAAC_PLAYERHUD_TRINKET_TICK_CACHED_ID = 0xa6;
static constexpr int32_t ISAAC_PLAYERHUD_TYPE_DARK_JUDAS = 0xc;
static constexpr int32_t ISAAC_PLAYERHUD_TYPE_JUDAS = 3;
static constexpr int32_t ISAAC_PLAYERHUD_UPDATE_HEARTS_ARG_PLAYER = 0;
static constexpr int32_t ISAAC_PLAYERHUD_UPDATE_HEARTS_ARG_TWIN = 1;
static constexpr int32_t ISAAC_PLAYERHUD_UPDATE_HEARTS_SINGLE_MAX_SLOTS = 0x18;
static constexpr uint32_t ISAAC_PLAYERHUD_UPDATE_HEARTS_SLOTS_OFF = 0x10u;
static constexpr int32_t ISAAC_PLAYERHUD_UPDATE_HEARTS_TWIN_MAX_SLOTS = 6;
static constexpr uint32_t ISAAC_PLAYERHUD_UPDATE_HEARTS_TWIN_SLOTS_OFF = 0x70u;
static constexpr int32_t ISAAC_PLAYERHUD_84D740_ACTION_COUNT = 0x20;
static constexpr int32_t ISAAC_PLAYERHUD_84D740_ACTION_MAX = 0x1f;
static constexpr uint32_t ISAAC_PLAYERHUD_84D740_DEFAULT_STRING_VA = 0x00b1a4ecu;
static constexpr uint32_t ISAAC_PLAYERHUD_84D740_LOG_FMT_VA = 0x00b6e230u;
static constexpr int32_t ISAAC_PLAYERHUD_84D740_LOG_LEVEL = 0x10;
static constexpr int32_t ISAAC_PLAYERHUD_84D8B0_EPS_F64_HI = 0x3ee4f8b5;
static constexpr uint32_t ISAAC_PLAYERHUD_84D8B0_EPS_F64_LO = 0x80000000u;
static constexpr uint32_t ISAAC_PLAYERHUD_84DA20_NEXT_VA = 0x0084dad0u;
static constexpr int32_t ISAAC_PLAYERHUD_84DA20_OBJECT_SIZE = 0x68;
static constexpr int32_t ISAAC_PLAYERHUD_84DA20_SSO_CAPACITY = 0xf;
static constexpr uint32_t ISAAC_PLAYERHUD_84DA20_SSO_CAP_OFF = 0x14u;
static constexpr uint32_t ISAAC_PLAYERHUD_84DA20_SSO_SIZE_OFF = 0x10u;
static constexpr int32_t ISAAC_PLAYERHUD_84DA20_TAIL_BEGIN = 0x18;
static constexpr int32_t ISAAC_PLAYERHUD_84DA20_TAIL_LAST = 0x64;
static constexpr uint32_t ISAAC_PLAYERHUD_84DAD0_FLAG_BYTE_OFF = 0x44u;
static constexpr uint32_t ISAAC_PLAYERHUD_84DAD0_HOST_THIS_OFF = 0x48u;
static constexpr uint32_t ISAAC_PLAYERHUD_84DAD0_HOST_VA = 0x006efa40u;
static constexpr uint32_t ISAAC_PLAYERHUD_84DAD0_NEXT_VA = 0x0084db90u;
static constexpr int32_t ISAAC_PLAYERHUD_84DAD0_OBJECT_SIZE = 0x48;
static constexpr int32_t ISAAC_PLAYERHUD_84DAD0_SSO_CAPACITY = 0xf;
static constexpr uint32_t ISAAC_PLAYERHUD_84DAD0_SSO_CAP_OFF = 0x1cu;
static constexpr uint32_t ISAAC_PLAYERHUD_84DAD0_SSO_OFF = 0x8u;
static constexpr uint32_t ISAAC_PLAYERHUD_84DAD0_SSO_SIZE_OFF = 0x18u;
static constexpr int32_t ISAAC_PLAYERHUD_84DAD0_TAIL_BEGIN = 0x20;
static constexpr int32_t ISAAC_PLAYERHUD_84DAD0_TAIL_LAST = 0x40;
static constexpr int32_t ISAAC_PLAYERHUD_84DB90_CALL_COUNT = 4;
static constexpr uint32_t ISAAC_PLAYERHUD_84DB90_HOST_VA_STRING = 0x0040d040u;
static constexpr uint32_t ISAAC_PLAYERHUD_84DB90_HOST_VA_SUB = 0x008562b0u;
static constexpr uint32_t ISAAC_PLAYERHUD_84DB90_NEXT_VA = 0x0084dbc0u;
static constexpr int32_t ISAAC_PLAYERHUD_84DB90_THIS_OFF_0 = 0x38;
static constexpr int32_t ISAAC_PLAYERHUD_84DB90_THIS_OFF_1 = 0x2c;
static constexpr int32_t ISAAC_PLAYERHUD_84DB90_THIS_OFF_2 = 0x20;
static constexpr int32_t ISAAC_PLAYERHUD_84DB90_THIS_OFF_3 = 0x8;
static constexpr int32_t ISAAC_PLAYERHUD_84DBC0_CALL_COUNT = 7;
static constexpr uint32_t ISAAC_PLAYERHUD_84DBC0_HOST_VA_STRING = 0x0040d040u;
static constexpr uint32_t ISAAC_PLAYERHUD_84DBC0_HOST_VA_SUB = 0x004149d0u;
static constexpr uint32_t ISAAC_PLAYERHUD_84DBC0_NEXT_VA = 0x0084dc00u;
static constexpr int32_t ISAAC_PLAYERHUD_84DBC0_THIS_OFF_0 = 0x54;
static constexpr int32_t ISAAC_PLAYERHUD_84DBC0_THIS_OFF_1 = 0x48;
static constexpr int32_t ISAAC_PLAYERHUD_84DBC0_THIS_OFF_2 = 0x3c;
static constexpr int32_t ISAAC_PLAYERHUD_84DBC0_THIS_OFF_3 = 0x30;
static constexpr int32_t ISAAC_PLAYERHUD_84DBC0_THIS_OFF_4 = 0x24;
static constexpr int32_t ISAAC_PLAYERHUD_84DBC0_THIS_OFF_5 = 0x18;
static constexpr int32_t ISAAC_PLAYERHUD_84DBC0_THIS_OFF_6 = 0;
static constexpr int32_t ISAAC_PLAYERHUD_84DEA0_CALL_COUNT = 6;
static constexpr uint32_t ISAAC_PLAYERHUD_84DEA0_GATE_OFF = 4u;
static constexpr uint32_t ISAAC_PLAYERHUD_84DEA0_HOST_VA = 0x0084dc00u;
static constexpr int32_t ISAAC_PLAYERHUD_84DEA0_LABEL_SIZE_0 = 6;
static constexpr int32_t ISAAC_PLAYERHUD_84DEA0_LABEL_SIZE_1 = 6;
static constexpr int32_t ISAAC_PLAYERHUD_84DEA0_LABEL_SIZE_2 = 7;
static constexpr int32_t ISAAC_PLAYERHUD_84DEA0_LABEL_SIZE_3 = 6;
static constexpr int32_t ISAAC_PLAYERHUD_84DEA0_LABEL_SIZE_4 = 0xb;
static constexpr int32_t ISAAC_PLAYERHUD_84DEA0_LABEL_SIZE_5 = 5;
static constexpr int32_t ISAAC_PLAYERHUD_84DEA0_LABEL_VA_0 = 0x00b6e274;
static constexpr int32_t ISAAC_PLAYERHUD_84DEA0_LABEL_VA_1 = 0x00b6e2e4;
static constexpr int32_t ISAAC_PLAYERHUD_84DEA0_LABEL_VA_2 = 0x00b6e2ec;
static constexpr int32_t ISAAC_PLAYERHUD_84DEA0_LABEL_VA_3 = 0x00b6e2d0;
static constexpr int32_t ISAAC_PLAYERHUD_84DEA0_LABEL_VA_4 = 0x00b6e2d8;
static constexpr int32_t ISAAC_PLAYERHUD_84DEA0_LABEL_VA_5 = 0x00b6e2b8;
static constexpr uint32_t ISAAC_PLAYERHUD_84DEA0_NEXT_VA = 0x0084e200u;
static constexpr uint32_t ISAAC_PLAYERHUD_84DEA0_PLAYER_PTR_OFF = 0x48u;
static constexpr uint32_t ISAAC_PLAYERHUD_84DEA0_RET_VA = 0x0084e1fdu;
static constexpr int32_t ISAAC_PLAYERHUD_84DEA0_SLOT_COUNT = 6;
static constexpr int32_t ISAAC_PLAYERHUD_84DEA0_SLOT_STRIDE = 0x14;
static constexpr uint32_t ISAAC_PLAYERHUD_84DEA0_VA = 0x0084dea0u;
static constexpr int32_t ISAAC_PLAYERHUD_84DEA0_XMM1_OFF_0 = 0x50;
static constexpr int32_t ISAAC_PLAYERHUD_84DEA0_XMM1_OFF_1 = 0x64;
static constexpr int32_t ISAAC_PLAYERHUD_84DEA0_XMM1_OFF_2 = 0x78;
static constexpr int32_t ISAAC_PLAYERHUD_84DEA0_XMM1_OFF_3 = 0x8c;
static constexpr int32_t ISAAC_PLAYERHUD_84DEA0_XMM1_OFF_4 = 0xa0;
static constexpr int32_t ISAAC_PLAYERHUD_84DEA0_XMM1_OFF_5 = 0xb4;
static constexpr uint32_t ISAAC_PLAYERHUD_84E200_NEXT_VA = 0x0084e5b0u;
static constexpr int32_t ISAAC_PLAYERHUD_84E200_RDATA_NEG = 0x00bacb70;
static constexpr uint32_t ISAAC_PLAYERHUD_84E200_RET_VA = 0x0084e59eu;
static constexpr uint32_t ISAAC_PLAYERHUD_84E200_VA = 0x0084e200u;
static constexpr int32_t ISAAC_PLAYERHUD_84E200_XORPS = 1;
static constexpr int32_t ISAAC_PLAYERHUD_84E5B0_COMPLETION_MAX = 0x282;
static constexpr int32_t ISAAC_PLAYERHUD_84E5B0_COMPLETION_NEG2 = -2;
static constexpr uint32_t ISAAC_PLAYERHUD_84E5B0_COMPLETION_OFF = 0x60u;
static constexpr int32_t ISAAC_PLAYERHUD_84E5B0_FLAG_SHR_MODE1 = 0xf;
static constexpr int32_t ISAAC_PLAYERHUD_84E5B0_FLAG_SHR_MODE2 = 0xb;
static constexpr uint32_t ISAAC_PLAYERHUD_84E5B0_GATE_OFF = 4u;
static constexpr uint32_t ISAAC_PLAYERHUD_84E5B0_HOST_VA_COL = 0x007706e0u;
static constexpr uint32_t ISAAC_PLAYERHUD_84E5B0_HOST_VA_TRK = 0x00771550u;
static constexpr uint32_t ISAAC_PLAYERHUD_84E5B0_MODE_OFF = 0x64u;
static constexpr uint32_t ISAAC_PLAYERHUD_84E5B0_NEXT_VA = 0x0084e820u;
static constexpr uint32_t ISAAC_PLAYERHUD_84E5B0_PLAYER_TYPE_OFF = 0x13c0u;
static constexpr int32_t ISAAC_PLAYERHUD_84E5B0_PREFIX_CONT = 2;
static constexpr int32_t ISAAC_PLAYERHUD_84E5B0_PREFIX_EARLY = 1;
static constexpr int32_t ISAAC_PLAYERHUD_84E5B0_PREFIX_FAIL = 0;
static constexpr uint32_t ISAAC_PLAYERHUD_84E5B0_RET_VA = 0x0084e81au;
static constexpr int32_t ISAAC_PLAYERHUD_84E5B0_STRIDE = 0x68;
static constexpr uint32_t ISAAC_PLAYERHUD_84E5B0_VA = 0x0084e5b0u;
static constexpr uint32_t ISAAC_PLAYERHUD_84E5B0_VEC_BEGIN_OFF = 0x2cu;
static constexpr int32_t ISAAC_PLAYERHUD_84E5B0_VEC_COUNT = 6;
static constexpr uint32_t ISAAC_PLAYERHUD_84E5B0_VEC_END_OFF = 0x30u;
static constexpr int32_t ISAAC_PLAYERHUD_84E5B0_VEC_OFF_0 = 0x18;
static constexpr int32_t ISAAC_PLAYERHUD_84E5B0_VEC_OFF_1 = 0x24;
static constexpr int32_t ISAAC_PLAYERHUD_84E5B0_VEC_OFF_2 = 0x30;
static constexpr int32_t ISAAC_PLAYERHUD_84E5B0_VEC_OFF_3 = 0x3c;
static constexpr int32_t ISAAC_PLAYERHUD_84E5B0_VEC_OFF_4 = 0x48;
static constexpr int32_t ISAAC_PLAYERHUD_84E5B0_VEC_OFF_5 = 0x54;
static constexpr int32_t ISAAC_PLAYERHUD_84E820_CHAR_MODE0_A = 0x23;
static constexpr int32_t ISAAC_PLAYERHUD_84E820_CHAR_MODE0_B = 0x106;
static constexpr int32_t ISAAC_PLAYERHUD_84E820_CHAR_MODE1 = 0x30;
static constexpr uint32_t ISAAC_PLAYERHUD_84E820_EXTRA_BEGIN_OFF = 0x20u;
static constexpr uint32_t ISAAC_PLAYERHUD_84E820_EXTRA_END_OFF = 0x24u;
static constexpr uint32_t ISAAC_PLAYERHUD_84E820_GAME_BEGIN_OFF = 0x2a448u;
static constexpr uint32_t ISAAC_PLAYERHUD_84E820_GAME_END_OFF = 0x2a44cu;
static constexpr uint32_t ISAAC_PLAYERHUD_84E820_GATE_OFF = 4u;
static constexpr uint32_t ISAAC_PLAYERHUD_84E820_HOST_VA_MODE0 = 0x0072fe80u;
static constexpr uint32_t ISAAC_PLAYERHUD_84E820_HOST_VA_MODE1 = 0x0072fec0u;
static constexpr uint32_t ISAAC_PLAYERHUD_84E820_HOST_VA_PRED = 0x0084e5b0u;
static constexpr uint32_t ISAAC_PLAYERHUD_84E820_NEXT_VA = 0x0084e9d0u;
static constexpr uint32_t ISAAC_PLAYERHUD_84E820_RANGE_HI_OFF = 0xcu;
static constexpr uint32_t ISAAC_PLAYERHUD_84E820_RANGE_LO_OFF = 8u;
static constexpr uint32_t ISAAC_PLAYERHUD_84E820_RET_VA = 0x0084e97du;
static constexpr int32_t ISAAC_PLAYERHUD_84E820_SPECIAL_KIND = 0xf;
static constexpr int32_t ISAAC_PLAYERHUD_84E820_STRIDE = 0x68;
static constexpr uint32_t ISAAC_PLAYERHUD_84E820_VA = 0x0084e820u;
static constexpr uint32_t ISAAC_PLAYERHUD_84E820_VEC_BEGIN_OFF = 0x2cu;
static constexpr uint32_t ISAAC_PLAYERHUD_84E820_VEC_END_OFF = 0x30u;
static constexpr uint32_t ISAAC_PLAYERHUD_84CA00_ENTRY_1460 = 0x1460u;
static constexpr uint32_t ISAAC_PLAYERHUD_84CA00_ENTRY_1464 = 0x1464u;
static constexpr uint32_t ISAAC_PLAYERHUD_84CA00_ENTRY_1470 = 0x1470u;
static constexpr uint32_t ISAAC_PLAYERHUD_84CA00_ENTRY_1480 = 0x1480u;
static constexpr uint32_t ISAAC_PLAYERHUD_84CA00_ENTRY_1568 = 0x1568u;
static constexpr uint32_t ISAAC_PLAYERHUD_84CA00_ENTRY_156C = 0x156cu;
static constexpr uint32_t ISAAC_PLAYERHUD_84CA00_ENTRY_FRAME_OFF = 0x328u;
static constexpr uint32_t ISAAC_PLAYERHUD_84CA00_ENTRY_PTR_OFF = 0x114u;
static constexpr uint32_t ISAAC_PLAYERHUD_84CA00_GAME_1ADB4_OFF = 0x1adb4u;
static constexpr uint32_t ISAAC_PLAYERHUD_84CA00_GAME_FRAME_OFF = 0x264f8u;
static constexpr uint32_t ISAAC_PLAYERHUD_84CA00_HOST_VA_PROBE1 = 0x007f92b0u;
static constexpr uint32_t ISAAC_PLAYERHUD_84CA00_HOST_VA_PROBE2 = 0x00749830u;
static constexpr uint32_t ISAAC_PLAYERHUD_84CA00_HOST_VA_PROBE3 = 0x007f96f0u;
static constexpr uint32_t ISAAC_PLAYERHUD_84CA00_MODE_BYTE_OFF = 0x2acu;
static constexpr int32_t ISAAC_PLAYERHUD_84CA00_PLAYER_STRIDE = 0xcc;
static constexpr uint32_t ISAAC_PLAYERHUD_84CA00_PURE_VA_TWEEN = 0x0084d6b0u;
static constexpr uint32_t ISAAC_PLAYERHUD_84CA00_RDATA_100F = 0x00baa9d0u;
static constexpr uint32_t ISAAC_PLAYERHUD_84CA00_RDATA_1F = 0x00baa454u;
static constexpr uint32_t ISAAC_PLAYERHUD_84CA00_RDATA_30F = 0x00baa8d0u;
static constexpr uint32_t ISAAC_PLAYERHUD_84CA00_RDATA_40F = 0x00baa904u;
static constexpr uint32_t ISAAC_PLAYERHUD_84CA00_RDATA_ZERO = 0x00ba9fe4u;
static constexpr uint32_t ISAAC_PLAYERHUD_84CA00_RET_VA = 0x0084cc38u;
static constexpr int32_t ISAAC_PLAYERHUD_84CA00_SLOT_BASE_118 = 0x118;
static constexpr int32_t ISAAC_PLAYERHUD_84CA00_SLOT_COUNT = 10;
static constexpr int32_t ISAAC_PLAYERHUD_84CA00_SLOT_STRIDE = 0x14;
static constexpr uint32_t ISAAC_PLAYERHUD_84CA00_VA = 0x0084ca00u;
static constexpr uint32_t ISAAC_PLAYERHUD_84CC40_VA = 0x0084cc40u;
static constexpr uint32_t ISAAC_PLAYERHUD_84CC40_RET_VA = 0x0084d6adu;
static constexpr uint32_t ISAAC_PLAYERHUD_84CC40_NEXT_VA = 0x0084d6b0u;
static constexpr int32_t ISAAC_PLAYERHUD_84CC40_BLOCK_COUNT = 2;
static constexpr int32_t ISAAC_PLAYERHUD_84CC40_BLOCK_STRIDE = 0xcc;
static constexpr int32_t ISAAC_PLAYERHUD_84CC40_BLOCK_PLAYER_OFF = 0x114;
static constexpr int32_t ISAAC_PLAYERHUD_84CC40_SLOT_BASE_OFF = 0x118;
static constexpr int32_t ISAAC_PLAYERHUD_84CC40_SLOT_COUNT = 10;
static constexpr int32_t ISAAC_PLAYERHUD_84CC40_SLOT_STRIDE = 0x14;
static constexpr int32_t ISAAC_PLAYERHUD_84CC40_MODE_BYTE_OFF = 0x2ac;
static constexpr uint32_t ISAAC_PLAYERHUD_84CC40_RECOMPUTE_HOST_VA = 0x0084ca00u;
static constexpr uint32_t ISAAC_PLAYERHUD_84CC40_RECOMPUTE_MASK = 0xffffffffu;
static constexpr int32_t ISAAC_PLAYERHUD_84CC40_BLOCK_KIND_NONE = 0;
static constexpr int32_t ISAAC_PLAYERHUD_84CC40_BLOCK_KIND_SWAP_UPDATE = 1;
static constexpr int32_t ISAAC_PLAYERHUD_84CC40_BLOCK_KIND_SWAP_RECOMPUTE = 2;
static constexpr int32_t ISAAC_PLAYERHUD_84E9D0_SLOT_COUNT = 6;
static constexpr int32_t ISAAC_PLAYERHUD_856840_CALL_COUNT = 7;
static constexpr uint32_t ISAAC_PLAYERHUD_856840_HOST_VA_STRING = 0x0040d040u;
static constexpr uint32_t ISAAC_PLAYERHUD_856840_HOST_VA_SUB = 0x004149d0u;
static constexpr uint32_t ISAAC_PLAYERHUD_856840_NEXT_VA = 0x008568a0u;
static constexpr int32_t ISAAC_PLAYERHUD_856840_STRIDE = 0x68;
static constexpr int32_t ISAAC_PLAYERHUD_856840_THIS_OFF_0 = 0x54;
static constexpr int32_t ISAAC_PLAYERHUD_856840_THIS_OFF_1 = 0x48;
static constexpr int32_t ISAAC_PLAYERHUD_856840_THIS_OFF_2 = 0x3c;
static constexpr int32_t ISAAC_PLAYERHUD_856840_THIS_OFF_3 = 0x30;
static constexpr int32_t ISAAC_PLAYERHUD_856840_THIS_OFF_4 = 0x24;
static constexpr int32_t ISAAC_PLAYERHUD_856840_THIS_OFF_5 = 0x18;
static constexpr int32_t ISAAC_PLAYERHUD_856840_THIS_OFF_6 = 0;
static constexpr uint32_t ISAAC_PLAYERHUD_8568A0_VA = 0x008568a0u;
static constexpr uint32_t ISAAC_PLAYERHUD_8568A0_RET_VA = 0x00856954u;
static constexpr int32_t ISAAC_PLAYERHUD_8568A0_CALL_COUNT = 7;
static constexpr uint32_t ISAAC_PLAYERHUD_8568A0_HOST_VA_STRING = 0x0040cf50u;
static constexpr uint32_t ISAAC_PLAYERHUD_8568A0_HOST_VA_SUB = 0x0043eca0u;
static constexpr uint32_t ISAAC_PLAYERHUD_8568A0_NEXT_VA = 0x00856960u;
static constexpr uint32_t ISAAC_PLAYERHUD_8568A0_OBJECT_SIZE = 0x68u;
static constexpr int32_t ISAAC_PLAYERHUD_8568A0_TAIL_BEGIN_OFF = 0x60;
static constexpr int32_t ISAAC_PLAYERHUD_8568A0_TAIL_DWORD_COUNT = 2;
static constexpr int32_t ISAAC_PLAYERHUD_8568A0_THIS_OFF_0 = 0;
static constexpr int32_t ISAAC_PLAYERHUD_8568A0_THIS_OFF_1 = 0x18;
static constexpr int32_t ISAAC_PLAYERHUD_8568A0_THIS_OFF_2 = 0x24;
static constexpr int32_t ISAAC_PLAYERHUD_8568A0_THIS_OFF_3 = 0x30;
static constexpr int32_t ISAAC_PLAYERHUD_8568A0_THIS_OFF_4 = 0x3c;
static constexpr int32_t ISAAC_PLAYERHUD_8568A0_THIS_OFF_5 = 0x48;
static constexpr int32_t ISAAC_PLAYERHUD_8568A0_THIS_OFF_6 = 0x54;
static constexpr uint32_t ISAAC_PLAYERHUD_856960_VA = 0x00856960u;
static constexpr uint32_t ISAAC_PLAYERHUD_856960_RET_VA = 0x00856998u;
static constexpr int32_t ISAAC_PLAYERHUD_856960_STRIDE = 0x68;
static constexpr uint32_t ISAAC_PLAYERHUD_856960_MOVE_CTOR_VA = 0x00856e10u;
static constexpr uint32_t ISAAC_PLAYERHUD_856960_WIPE_VA = 0x00856840u;
static constexpr uint32_t ISAAC_PLAYERHUD_856960_NEXT_VA = 0x008569a0u;
static constexpr uint32_t ISAAC_PLAYERHUD_856E10_VA = 0x00856e10u;
static constexpr uint32_t ISAAC_PLAYERHUD_856E10_RET_VA = 0x00856f4au;
static constexpr uint32_t ISAAC_PLAYERHUD_856E10_NEXT_VA = 0x00856f50u;
static constexpr int32_t ISAAC_PLAYERHUD_856E10_OBJECT_SIZE = 0x68;
static constexpr int32_t ISAAC_PLAYERHUD_856E10_SSO_CAPACITY = 0xf;
static constexpr uint32_t ISAAC_PLAYERHUD_856E10_SSO_SIZE_OFF = 0x10u;
static constexpr uint32_t ISAAC_PLAYERHUD_856F50_VA = 0x00856f50u;
static constexpr uint32_t ISAAC_PLAYERHUD_856F50_RET_VA = 0x00856f61u;
static constexpr uint32_t ISAAC_PLAYERHUD_856F50_NEXT_VA = 0x00856f70u;
static constexpr int32_t ISAAC_PLAYERHUD_856F50_FIELD_OFF = 8;
/* ABI v35: pure time-pack leaf FUN_0085af30 (VA 0x0085af30..0x0085afaf).
   Argon: thiscall-style ecx = out struct ptr, edx = value (u32),
   eax = out.  0 E8, 0 indirect, 13 stores.  The 0xd1b71759 / 0x51eb851f
   magic shifts are the PE mulhi+shr div-by-10000 / div-by-100. */
static constexpr uint32_t ISAAC_PLAYERHUD_85AF30_VA = 0x0085af30u;
static constexpr uint32_t ISAAC_PLAYERHUD_85AF30_RET_VA = 0x0085afafu;
static constexpr uint32_t ISAAC_PLAYERHUD_85AF30_NEXT_VA = 0x0085afb0u;
static constexpr int32_t ISAAC_PLAYERHUD_85AF30_OBJECT_SIZE = 0x38;
static constexpr int32_t ISAAC_PLAYERHUD_85AF30_PACK_DWORD_COUNT = 13;
static constexpr int32_t ISAAC_PLAYERHUD_85AF30_FLAG_BYTE = 2;
static constexpr uint32_t ISAAC_PLAYERHUD_85AF30_REM100_OFF = 0x1cu;
static constexpr uint32_t ISAAC_PLAYERHUD_85AF30_Q100_MINUS1_OFF = 0x20u;
static constexpr uint32_t ISAAC_PLAYERHUD_85AF30_Q10000_MINUS1900_OFF = 0x24u;
static constexpr uint32_t ISAAC_PLAYERHUD_85AF30_DIV10000_MAGIC = 0xd1b71759u;
static constexpr int32_t ISAAC_PLAYERHUD_85AF30_DIV10000_SHIFT = 45;
static constexpr uint32_t ISAAC_PLAYERHUD_85AF30_DIV100_MAGIC = 0x51eb851fu;
static constexpr int32_t ISAAC_PLAYERHUD_85AF30_DIV100_SHIFT = 37;
static constexpr int32_t ISAAC_PLAYERHUD_85AF30_YEAR_BASE = 0x76c;
/* ABI v36: pure ordinal-suffix leaf FUN_00858870 (VA 0x00858870..
   0x008588e5, ret 4).  stdcall, 1 int32 arg; eax = .rdata suffix
   string VA.  0 E8, 0 stores, 0 indirect.  The 0x51eb851f/0x66666667
   magics are the PE SIGNED div-by-100 / div-by-10 (imul + sar + sign
   fix = truncation toward zero, C `%` semantics). */
static constexpr uint32_t ISAAC_PLAYERHUD_858870_VA = 0x00858870u;
static constexpr uint32_t ISAAC_PLAYERHUD_858870_RET_VA = 0x008588e5u;
static constexpr uint32_t ISAAC_PLAYERHUD_858870_NEXT_VA = 0x008588f0u;
static constexpr uint32_t ISAAC_PLAYERHUD_858870_ST_VA = 0x00b6e4ccu;
static constexpr uint32_t ISAAC_PLAYERHUD_858870_ND_VA = 0x00b6e4c0u;
static constexpr uint32_t ISAAC_PLAYERHUD_858870_RD_VA = 0x00b6e4c4u;
static constexpr uint32_t ISAAC_PLAYERHUD_858870_TH_VA = 0x00b6e4c8u;
static constexpr uint32_t ISAAC_PLAYERHUD_858870_DIV100_MAGIC = 0x51eb851fu;
static constexpr int32_t ISAAC_PLAYERHUD_858870_DIV100_SHIFT = 5;
static constexpr uint32_t ISAAC_PLAYERHUD_858870_DIV10_MAGIC = 0x66666667u;
static constexpr int32_t ISAAC_PLAYERHUD_858870_DIV10_SHIFT = 2;
static constexpr uint32_t ISAAC_PLAYERHUD_858870_CALLER1_VA = 0x00858f20u;
static constexpr uint32_t ISAAC_PLAYERHUD_858870_CALLER2_VA = 0x0085902eu;
/* ABI v37: pure leaderboard type->entry getter FUN_00857400.  thiscall
   ecx = Leaderboard object; kind = [this+8] FULL-DWORD; cmp eax,3; ja
   UNSIGNED gate -> jump table 0x857440 pick of [this+0x238+4*kind]
   (arms 0x85740f/0x857416/0x85741d/0x857424); default arm 0x85742b
   host-log 0xa112c0 (0xb6e4f0, level 8) + xor eax,eax. */
static constexpr uint32_t ISAAC_PLAYERHUD_857400_VA = 0x00857400u;
static constexpr uint32_t ISAAC_PLAYERHUD_857400_RET_VA = 0x0085743cu;
static constexpr uint32_t ISAAC_PLAYERHUD_857400_NEXT_VA = 0x00857450u;
static constexpr int32_t ISAAC_PLAYERHUD_857400_KIND_MAX = 3;
static constexpr int32_t ISAAC_PLAYERHUD_857400_ENTRY_COUNT = 4;
static constexpr uint32_t ISAAC_PLAYERHUD_857400_SLOT_BASE = 0x238u;
static constexpr int32_t ISAAC_PLAYERHUD_857400_SLOT_STRIDE = 4;
static constexpr uint32_t ISAAC_PLAYERHUD_857400_JUMP_TABLE_VA = 0x00857440u;
static constexpr uint32_t ISAAC_PLAYERHUD_857400_JUMP_TABLE_TARGET0 = 0x0085740fu;
static constexpr uint32_t ISAAC_PLAYERHUD_857400_JUMP_TABLE_TARGET1 = 0x00857416u;
static constexpr uint32_t ISAAC_PLAYERHUD_857400_JUMP_TABLE_TARGET2 = 0x0085741du;
static constexpr uint32_t ISAAC_PLAYERHUD_857400_JUMP_TABLE_TARGET3 = 0x00857424u;
static constexpr uint32_t ISAAC_PLAYERHUD_857400_LOG_FMT_VA = 0x00b6e4f0u;
static constexpr int32_t ISAAC_PLAYERHUD_857400_LOG_LEVEL = 8;
static constexpr uint32_t ISAAC_PLAYERHUD_857400_CALLER1_VA = 0x00857a54u;
static constexpr uint32_t ISAAC_PLAYERHUD_857400_CALLER2_VA = 0x00857a70u;
static constexpr uint32_t ISAAC_PLAYERHUD_857400_CALLER3_VA = 0x00857a98u;
static constexpr uint32_t ISAAC_PLAYERHUD_857400_CALLER4_VA = 0x00857ab4u;
static constexpr uint32_t ISAAC_PLAYERHUD_857400_CALLER5_VA = 0x00857ff3u;
static constexpr uint32_t ISAAC_PLAYERHUD_857400_CALLER6_VA = 0x00858018u;
static constexpr uint32_t ISAAC_PLAYERHUD_857400_CALLER7_VA = 0x008586ceu;
static constexpr uint32_t ISAAC_PLAYERHUD_857400_CALLER8_VA = 0x00858778u;
static constexpr uint32_t ISAAC_PLAYERHUD_857400_CALLER9_VA = 0x00858816u;
/* ABI v38: pure float getter FUN_0085e360 (VA 0x0085e360..0x0085e366,
   ret 0).  thiscall ecx = object, st0 = *(float*)(this+0x41c) via
   `fld dword ptr [ecx+0x41c]` — a bit-preserving f32 reinterpret
   (x87 load, no arithmetic, no NaN canonicalization).  0 E8, 0
   stores, 0 indirect.  Twin setters: 0x85e340 movss [ecx+0x41c],
   xmm0 (ret 4); 0x85e330 movss [ecx+0x420],xmm0 (ret 4).  6 direct
   callers 0x668193/0x66f608/0x78639e/0x79d9eb/0x79dbf2/0x79df21
   (all `mov ecx,<this>; call; fstp/fstp [esp]` consuming st0).
   Next VA 0x0085e370 (mov eax,[ecx+0x269d8]; sub eax,[ecx+0x269d4];
   sar eax,3; ret — pointer-delta getter, 0 direct callers). */
static constexpr uint32_t ISAAC_PLAYERHUD_85E360_VA = 0x0085e360u;
static constexpr uint32_t ISAAC_PLAYERHUD_85E360_RET_VA = 0x0085e366u;
static constexpr uint32_t ISAAC_PLAYERHUD_85E360_NEXT_VA = 0x0085e370u;
static constexpr uint32_t ISAAC_PLAYERHUD_85E360_FIELD_OFF = 0x41cu;
static constexpr uint32_t ISAAC_PLAYERHUD_85E360_CALLER1_VA = 0x00668193u;
static constexpr uint32_t ISAAC_PLAYERHUD_85E360_CALLER2_VA = 0x0066f608u;
static constexpr uint32_t ISAAC_PLAYERHUD_85E360_CALLER3_VA = 0x0078639eu;
static constexpr uint32_t ISAAC_PLAYERHUD_85E360_CALLER4_VA = 0x0079d9ebu;
static constexpr uint32_t ISAAC_PLAYERHUD_85E360_CALLER5_VA = 0x0079dbf2u;
static constexpr uint32_t ISAAC_PLAYERHUD_85E360_CALLER6_VA = 0x0079df21u;
/* ABI v39: 7-leaf StatHUD conversion cluster (VA 0x009bfc00..0x009bfd38).
   PE .rdata constants (va 0x718000 raw 0x716600; float bits verified). */
static constexpr uint32_t ISAAC_PLAYERHUD_9BFC00_VA = 0x009bfc00u;
static constexpr uint32_t ISAAC_PLAYERHUD_9BFC00_RET_VA = 0x009bfc10u;
static constexpr uint32_t ISAAC_PLAYERHUD_9BFC00_NEXT_VA = 0x009bfc20u;
static constexpr uint32_t ISAAC_PLAYERHUD_9BFC00_CALLER1_VA = 0x0077007bu;
static constexpr uint32_t ISAAC_PLAYERHUD_9BFC20_VA = 0x009bfc20u;
static constexpr uint32_t ISAAC_PLAYERHUD_9BFC20_RET_VA = 0x009bfc30u;
static constexpr uint32_t ISAAC_PLAYERHUD_9BFC20_NEXT_VA = 0x009bfc40u;
static constexpr uint32_t ISAAC_PLAYERHUD_9BFC20_CALLER1_VA = 0x007700c3u;
static constexpr uint32_t ISAAC_PLAYERHUD_9BFC40_VA = 0x009bfc40u;
static constexpr uint32_t ISAAC_PLAYERHUD_9BFC40_RET_VA = 0x009bfc76u;
static constexpr uint32_t ISAAC_PLAYERHUD_9BFC40_NEXT_VA = 0x009bfc80u;
static constexpr uint32_t ISAAC_PLAYERHUD_9BFC40_CALLER1_VA = 0x007619d3u;
static constexpr uint32_t ISAAC_PLAYERHUD_9BFC80_VA = 0x009bfc80u;
static constexpr uint32_t ISAAC_PLAYERHUD_9BFC80_RET_VA = 0x009bfcc6u;
static constexpr uint32_t ISAAC_PLAYERHUD_9BFC80_NEXT_VA = 0x009bfcd0u;
static constexpr uint32_t ISAAC_PLAYERHUD_9BFC80_CALLER1_VA = 0x007700d8u;
static constexpr uint32_t ISAAC_PLAYERHUD_9BFCD0_VA = 0x009bfcd0u;
static constexpr uint32_t ISAAC_PLAYERHUD_9BFCD0_RET_VA = 0x009bfcf9u;
static constexpr uint32_t ISAAC_PLAYERHUD_9BFCD0_NEXT_VA = 0x009bfd00u;
static constexpr uint32_t ISAAC_PLAYERHUD_9BFCD0_CALLER1_VA = 0x007700edu;
static constexpr uint32_t ISAAC_PLAYERHUD_9BFD00_VA = 0x009bfd00u;
static constexpr uint32_t ISAAC_PLAYERHUD_9BFD00_RET_VA = 0x009bfd18u;
static constexpr uint32_t ISAAC_PLAYERHUD_9BFD00_NEXT_VA = 0x009bfd20u;
static constexpr uint32_t ISAAC_PLAYERHUD_9BFD00_CALLER1_VA = 0x00770090u;
static constexpr uint32_t ISAAC_PLAYERHUD_9BFD20_VA = 0x009bfd20u;
static constexpr uint32_t ISAAC_PLAYERHUD_9BFD20_RET_VA = 0x009bfd38u;
static constexpr uint32_t ISAAC_PLAYERHUD_9BFD20_NEXT_VA = 0x009bfd40u;
static constexpr uint32_t ISAAC_PLAYERHUD_9BFD20_CALLER1_VA = 0x00770102u;
/* powf wrapper 0x4e4690 (host-resolved blob probe; 0xaf08ff = jmp
   [IAT 0xb18830] = _libm_sse2_pow_precise — PI "atan2f" mis-ID corrected). */
static constexpr uint32_t ISAAC_PLAYERHUD_9BFC40_HOST_VA_POWF = 0x004e4690u;
/* PE .rdata float constants (bits: float bits at the VA; exact). */
static constexpr uint32_t ISAAC_PLAYERHUD_9BFC_45F_BITS = 0x40900000u; /* 4.5f  */
static constexpr uint32_t ISAAC_PLAYERHUD_9BFC_2F_BITS = 0x40000000u;  /* 2.0f  */
static constexpr uint32_t ISAAC_PLAYERHUD_9BFC_1F_BITS = 0x3f800000u;  /* 1.0f  */
static constexpr uint32_t ISAAC_PLAYERHUD_9BFC_30F_BITS = 0x41f00000u; /* 30.0f */
static constexpr uint32_t ISAAC_PLAYERHUD_9BFC_075F_BITS = 0x3f400000u; /* 0.75f */
static constexpr uint32_t ISAAC_PLAYERHUD_9BFC_2120F_BITS = 0x4007b47cu; /* 2.12039089f */
static constexpr uint32_t ISAAC_PLAYERHUD_9BFC_13333F_BITS = 0x3faaaaabu; /* 1.33333337f */
static constexpr uint32_t ISAAC_PLAYERHUD_9BFC_04716F_BITS = 0x3ef17704u; /* 0.471611142f */
static constexpr uint32_t ISAAC_PLAYERHUD_9BFC_17857F_BITS = 0x3fe49249u; /* 1.78571427f */
static constexpr uint32_t ISAAC_PLAYERHUD_9BFC_04482F_BITS = 0x3ee5799fu; /* 0.44819352f */
static constexpr uint32_t ISAAC_PLAYERHUD_9BFC_NEG2F_BITS = 0xc0000000u;  /* -2.0f */
static constexpr uint32_t ISAAC_PLAYERHUD_9BFC_10000F_BITS = 0x461c4000u; /* 10000.0f */
static constexpr uint32_t ISAAC_PLAYERHUD_9BFC_230F_BITS = 0x43660000u;  /* 230.0f */
static constexpr uint32_t ISAAC_PLAYERHUD_9BFC_60F_BITS = 0x42700000u;   /* 60.0f */
static constexpr uint32_t ISAAC_PLAYERHUD_856E10_SSO_CAP_OFF = 0x14u;
static constexpr int32_t ISAAC_PLAYERHUD_856E10_VEC_TRIPLE_COUNT = 6;
static constexpr int32_t ISAAC_PLAYERHUD_856E10_VEC_TRIPLE_STRIDE = 0xc;
static constexpr uint32_t ISAAC_PLAYERHUD_856E10_VEC_BEGIN_OFF = 0x18u;
static constexpr uint32_t ISAAC_PLAYERHUD_856E10_VEC_END_OFF = 0x5cu;
static constexpr uint32_t ISAAC_PLAYERHUD_856E10_TAIL_BEGIN_OFF = 0x60u;
static constexpr int32_t ISAAC_PLAYERHUD_856E10_TAIL_DWORD_COUNT = 2;
static constexpr int32_t ISAAC_PLAYERHUD_ANM2_LOAD_GRAPHICS = 1;
static constexpr uint32_t ISAAC_PLAYERHUD_ENTITY_ANM_PATH_OFF = 0x74u;
static constexpr uint32_t ISAAC_PLAYERHUD_F32_ONE_BITS = 0x3f800000u;
static constexpr uint32_t ISAAC_PLAYERHUD_F32_STEP_0_25_BITS = 0x3e800000u;
static constexpr uint32_t ISAAC_PLAYERHUD_F32_ZERO_BITS = 0x00000000u;
static constexpr int32_t ISAAC_PLAYERHUD_GET_ENTITY_VARIANT_CARD = 0x46;
static constexpr int32_t ISAAC_PLAYERHUD_GET_ENTITY_VARIANT_PILL = 0x12c;
static constexpr uint32_t ISAAC_PLAYERHUD_HOST_VA_LOAD_IMAGE = 0x009588a0u;
static constexpr uint32_t ISAAC_PLAYERHUD_HOST_VA_LOG = 0x00a112c0u;
static constexpr int32_t ISAAC_PLAYERHUD_LIST_CLEAR_CURSOR_EBP_OFF = -0x1428;
static constexpr int32_t ISAAC_PLAYERHUD_LIST_CLEAR_FREE_SIZE = 0x1c;
static constexpr uint32_t ISAAC_PLAYERHUD_LIST_CLEAR_NODE_SP_OFF = 0x14u;
static constexpr uint32_t ISAAC_PLAYERHUD_LIST_CLEAR_SEH_LEVEL = 0xffffffffu;
static constexpr int32_t ISAAC_PLAYERHUD_LIST_CLEAR_SP_ARG = 0;
static constexpr uint32_t ISAAC_PLAYERHUD_MANAGER_ENTITY_CONFIG_OFF = 0x2a670u;
static constexpr int32_t ISAAC_PLAYERHUD_P5_CHAR_TYPE_MATCH = 0x15;
static constexpr int32_t ISAAC_PLAYERHUD_P5_ELEM_STRIDE = 0xc;
static constexpr uint32_t ISAAC_PLAYERHUD_P5_HOST_VA_ALLOC = 0x00a0f4c0u;
static constexpr uint32_t ISAAC_PLAYERHUD_P5_HOST_VA_ELEM_INIT = 0x0040c4a0u;
static constexpr uint32_t ISAAC_PLAYERHUD_P5_HOST_VA_PUSH_GROW = 0x0084bc30u;
static constexpr uint32_t ISAAC_PLAYERHUD_P5_VA = 0x00843116u;
static constexpr uint32_t ISAAC_PLAYERHUD_P5_CHAR_CMP_VA = 0x0084312fu;
static constexpr uint32_t ISAAC_PLAYERHUD_P5_NODE_INIT_VA = 0x0084315au;
static constexpr uint32_t ISAAC_PLAYERHUD_P5_WALK_HEAD_VA = 0x008431e0u;
static constexpr uint32_t ISAAC_PLAYERHUD_P5_PUSH_GROW_CMP_VA = 0x00843213u;
static constexpr int32_t ISAAC_PLAYERHUD_P5_NODE_FLAG_WORD = 0x0101;
static constexpr int32_t ISAAC_PLAYERHUD_P5_OFF_LIST_END_6A4 = 0x6a4;
static constexpr int32_t ISAAC_PLAYERHUD_P5_OFF_LIST_HEAD_6A0 = 0x6a0;
static constexpr int32_t ISAAC_PLAYERHUD_P5_OFF_SLOT_BASE_1E00 = 0x1e00;
static constexpr int32_t ISAAC_PLAYERHUD_P5_SKIP_VA_DISABLED = 0x00843af1;
static constexpr int32_t ISAAC_PLAYERHUD_P5_SKIP_VA_WRONG_CHAR = 0x00843667;
static constexpr int32_t ISAAC_PLAYERHUD_P5_SLOT_STRIDE = 4;
static constexpr int32_t ISAAC_PLAYERHUD_P5_WALK_STRIDE = 0xc;
static constexpr int32_t ISAAC_PLAYERHUD_P6_ARRAY_ID_ELEM = 2;
static constexpr uint32_t ISAAC_PLAYERHUD_P6_ARRAY_PTR_OFF = 0x1decu;
static constexpr int32_t ISAAC_PLAYERHUD_P6_BUILD_NODE_OBJ_EBP_OFF = -0x1490;
static constexpr int32_t ISAAC_PLAYERHUD_P6_BUILD_NODE_RESULT_EBP_OFF = -0x1498;
static constexpr uint32_t ISAAC_PLAYERHUD_P6_CONFIG_CAPACITY_OFF = 0x4cu;
static constexpr int32_t ISAAC_PLAYERHUD_P6_CONFIG_ELEM2_EBP_OFF = -0x1488;
static constexpr int32_t ISAAC_PLAYERHUD_P6_CONFIG_ELEM_EBP_OFF = -0x1470;
static constexpr int32_t ISAAC_PLAYERHUD_P6_CONFIG_LOAD_IMAGE_RESULT_EBP_OFF = -0x1448;
static constexpr int32_t ISAAC_PLAYERHUD_P6_CONFIG_SSO_THRESHOLD = 0x10;
static constexpr uint32_t ISAAC_PLAYERHUD_P6_CONFIG_STRING_OFF = 0x38u;
static constexpr int32_t ISAAC_PLAYERHUD_P6_CONFIG_VALUE2_EBP_OFF = -0x148c;
static constexpr int32_t ISAAC_PLAYERHUD_P6_CONFIG_VALUE_EBP_OFF = -0x1474;
static constexpr int32_t ISAAC_PLAYERHUD_P6_CONFIG_VIRTUAL2_EBP_OFF = -0x1484;
static constexpr int32_t ISAAC_PLAYERHUD_P6_CONFIG_VIRTUAL3_EBP_OFF = -0x1444;
static constexpr int32_t ISAAC_PLAYERHUD_P6_CONFIG_VIRTUAL_EBP_OFF = -0x146c;
static constexpr int32_t ISAAC_PLAYERHUD_P6_ENTRY_TYPE_BLOCK = 3;
static constexpr uint32_t ISAAC_PLAYERHUD_P6_HOST_VA_BUILD_NODE = 0x004288a0u;
static constexpr uint32_t ISAAC_PLAYERHUD_P6_HOST_VA_FREE = 0x00aef15cu;
static constexpr uint32_t ISAAC_PLAYERHUD_P6_HOST_VA_NODE_REMOVE = 0x00415d20u;
static constexpr int32_t ISAAC_PLAYERHUD_P6_LIST_HEAD_EBP_OFF = -0x1450;
static constexpr int32_t ISAAC_PLAYERHUD_P6_NEG_ELEM_EBP_OFF = -0x1464;
static constexpr int32_t ISAAC_PLAYERHUD_P6_NEG_VALUE_EBP_OFF = -0x1468;
static constexpr int32_t ISAAC_PLAYERHUD_P6_NEG_VIRTUAL_EBP_OFF = -0x1460;
static constexpr uint32_t ISAAC_PLAYERHUD_P6_RESULT_COPY_OFF = 0x14u;
static constexpr int32_t ISAAC_PLAYERHUD_P6_RESULT_ELEM_EBP_OFF = -0x1458;
static constexpr int32_t ISAAC_PLAYERHUD_P6_RESULT_VALUE_EBP_OFF = -0x145c;
static constexpr int32_t ISAAC_PLAYERHUD_P6_RESULT_VIRTUAL_EBP_OFF = -0x1454;
static constexpr int32_t ISAAC_PLAYERHUD_P6_SEH_CONFIG_FIRST = 0x16;
static constexpr int32_t ISAAC_PLAYERHUD_P6_SEH_NEG_FIRST = 0x14;
static constexpr int32_t ISAAC_PLAYERHUD_P6_SEH_RESULT_FIRST = 0x11;
static constexpr int32_t ISAAC_PLAYERHUD_P6_SLOT_BASE = 0x1e00;
static constexpr int32_t ISAAC_PLAYERHUD_P6_SLOT_COUNT = 0x10;
static constexpr int32_t ISAAC_PLAYERHUD_P6_SLOT_STRIDE = 4;
static constexpr int32_t ISAAC_PLAYERHUD_P7_GAME_GATE_VALUE = 0x2b;
static constexpr int32_t ISAAC_PLAYERHUD_P7_LIST_HEAD_EBP_OFF = -0x143c;
static constexpr uint32_t ISAAC_PLAYERHUD_P7_VEC_BEGIN_OFF = 0x1fa4u;
static constexpr uint32_t ISAAC_PLAYERHUD_P7_VEC_END_OFF = 0x1fa8u;
static constexpr int32_t ISAAC_PLAYERHUD_PATH_BLACK_HEART_FULL = 0x00b6dc54;
static constexpr int32_t ISAAC_PLAYERHUD_PATH_BLACK_HEART_HALF = 0x00b6dc64;
static constexpr int32_t ISAAC_PLAYERHUD_PATH_BLUE_HEART_FULL = 0x00b6dda0;
static constexpr int32_t ISAAC_PLAYERHUD_PATH_BLUE_HEART_HALF = 0x00b6ddb0;
static constexpr int32_t ISAAC_PLAYERHUD_PATH_BONE_HEART_EMPTY = 0x00b6dc88;
static constexpr int32_t ISAAC_PLAYERHUD_PATH_BONE_HEART_FULL = 0x00b6dc98;
static constexpr int32_t ISAAC_PLAYERHUD_PATH_BONE_HEART_HALF = 0x00b6dca8;
static constexpr int32_t ISAAC_PLAYERHUD_PATH_BROKEN_COIN_HEART = 0x00b6dd90;
static constexpr int32_t ISAAC_PLAYERHUD_PATH_BROKEN_HEART = 0x00b6dd38;
static constexpr int32_t ISAAC_PLAYERHUD_PATH_COIN_EMPTY = 0x00b6dcb8;
static constexpr int32_t ISAAC_PLAYERHUD_PATH_COIN_HEART_FULL = 0x00b6dc44;
static constexpr int32_t ISAAC_PLAYERHUD_PATH_COIN_HEART_HALF = 0x00b6dc24;
static constexpr int32_t ISAAC_PLAYERHUD_PATH_EMPTY_HEART = 0x00b6dcc4;
static constexpr int32_t ISAAC_PLAYERHUD_PATH_RED_HEART_FULL = 0x00b6dc34;
static constexpr int32_t ISAAC_PLAYERHUD_PATH_RED_HEART_HALF = 0x00b6dc04;
static constexpr int32_t ISAAC_PLAYERHUD_PATH_ROTTEN_BONE_HEART_FULL = 0x00b6dc74;
static constexpr int32_t ISAAC_PLAYERHUD_PATH_ROTTEN_HEART_FULL = 0x00b6dc14;
static constexpr int32_t ISAAC_PLAYERHUD_PATH_WHITE_HEART_OVERLAY = 0x00b6dd7c;
static constexpr int32_t ISAAC_PLAYERHUD_POCKET_LIST_CLEAR_KIND_P7 = 1;
static constexpr int32_t ISAAC_PLAYERHUD_POCKET_UPGRADE_BRANCH_CONFIG = 3;
static constexpr int32_t ISAAC_PLAYERHUD_POCKET_UPGRADE_BRANCH_NEG = 2;
static constexpr int32_t ISAAC_PLAYERHUD_POCKET_UPGRADE_BRANCH_RESULT = 1;
static constexpr int32_t ISAAC_PLAYERHUD_POCKET_UPGRADE_BRANCH_SKIP = 0;
static constexpr int32_t ISAAC_PLAYERHUD_POCKET_UPGRADE_KIND_GAME_NEG = 1;
static constexpr int32_t ISAAC_PLAYERHUD_POCKET_UPGRADE_KIND_MANAGER = 2;
static constexpr int32_t ISAAC_PLAYERHUD_POCKET_UPGRADE_KIND_SKIP = 0;
static constexpr int32_t ISAAC_PLAYERHUD_STAT_BAR_TWEEN_ABS_MASK = 0x7fffffff;
static constexpr int32_t ISAAC_PLAYERHUD_STAT_BAR_TWEEN_TIMER_FLOOR = 0x87;
static constexpr int32_t ISAAC_PLAYERHUD_STAT_BAR_TWEEN_TIMER_NEW = 0x96;
static constexpr int32_t ISAAC_PLAYERHUD_STAT_BAR_TWEEN_TIMER_SLOW = 0x1e;
static constexpr uint32_t ISAAC_PLAYERHUD_TAIL_ANM2_SP_OFF = 0x6b0u;
static constexpr uint32_t ISAAC_PLAYERHUD_TAIL_COLLECTIBLE_ID_OFF = 0x1f4cu;
static constexpr int32_t ISAAC_PLAYERHUD_TAIL_CONFIG_RESULT_EBP_OFF = -0x142c;
static constexpr int32_t ISAAC_PLAYERHUD_TAIL_DIRTY_ARG = 1;
static constexpr uint32_t ISAAC_PLAYERHUD_TAIL_DIRTY_HUD_THIS_OFF = 0x4u;
static constexpr uint32_t ISAAC_PLAYERHUD_TAIL_ENABLE_BYTE_OFF = 0x6acu;
static constexpr uint32_t ISAAC_PLAYERHUD_TAIL_FIXED_PATH_VA = 0x00b63a18u;
static constexpr int32_t ISAAC_PLAYERHUD_TAIL_FIXED_RESULT_EBP_OFF = -0x1448;
static constexpr uint32_t ISAAC_PLAYERHUD_TAIL_GET_COLLECTIBLE_THIS_OFF = 0x2a404u;
static constexpr uint32_t ISAAC_PLAYERHUD_TAIL_HOST_VA_ADVANCE = 0x00414a80u;
static constexpr uint32_t ISAAC_PLAYERHUD_TAIL_HOST_VA_DIRTY_NOTIFY = 0x009a6110u;
static constexpr uint32_t ISAAC_PLAYERHUD_TAIL_HOST_VA_P7_LIST_CLEAR = 0x0083b830u;
static constexpr uint32_t ISAAC_PLAYERHUD_TAIL_HOST_VA_PREDICATE = 0x00956110u;
static constexpr uint32_t ISAAC_PLAYERHUD_TAIL_HOST_VA_PROBE = 0x00748490u;
static constexpr uint32_t ISAAC_PLAYERHUD_TAIL_HOST_VA_TEMP_TEARDOWN = 0x0040c440u;
static constexpr uint32_t ISAAC_PLAYERHUD_TAIL_HOST_VA_TREE_TEARDOWN = 0x00415800u;
static constexpr uint32_t ISAAC_PLAYERHUD_TAIL_HOST_VA_WALK_CLEAR = 0x0084bba0u;
static constexpr int32_t ISAAC_PLAYERHUD_TAIL_PATH_CONFIG = 1;
static constexpr int32_t ISAAC_PLAYERHUD_TAIL_PATH_FIXED = 0;
static constexpr uint32_t ISAAC_PLAYERHUD_TAIL_PREDICATE_ARG1_OFF = 0x1618u;
static constexpr int32_t ISAAC_PLAYERHUD_TAIL_PREDICATE_TYPE = 0xb;
static constexpr int32_t ISAAC_PLAYERHUD_TAIL_PROBE_MASK = 0x40;
static constexpr int32_t ISAAC_PLAYERHUD_TAIL_SEH_CONFIG = 0x27;
static constexpr int32_t ISAAC_PLAYERHUD_TAIL_SEH_FIXED = 0x26;
static constexpr uint32_t ISAAC_PLAYERHUD_TAIL_TEMP_TEARDOWN_SEH = 0xffffffffu;
static constexpr int32_t ISAAC_PLAYERHUD_WALK_CLEAR_CURSOR_SAVE_EBP_OFF = -0x1428;
static constexpr int32_t ISAAC_PLAYERHUD_WALK_CLEAR_HUD_EBP_OFF = -0x1430;
static constexpr uint32_t ISAAC_PLAYERHUD_WALK_CLEAR_NODE_SP_OFF = 4u;
static constexpr uint32_t ISAAC_PLAYERHUD_SP_PAIR_VALUE_OFF = 0u;
static constexpr uint32_t ISAAC_PLAYERHUD_SP_PAIR_OBJ_OFF = 4u;
static constexpr uint32_t ISAAC_PLAYERHUD_TAIL_CHAR0_OFFSET = 0xcu;
static constexpr uint32_t ISAAC_PLAYERHUD_TAIL_CHAR1_OFFSET = 0xdu;
static constexpr uint32_t ISAAC_PLAYERHUD_TAIL_CHAR2_OFFSET = 0xeu;
static constexpr uint32_t ISAAC_PLAYERHUD_TAIL_HOST_VA_GET_COLLECTIBLE = 0x0072fd10u;
static constexpr uint32_t ISAAC_PLAYERHUD_TAIL_HOST_VA_SP_CLEAR = 0x0040c7f0u;
static constexpr uint32_t ISAAC_PLAYERHUD_TAIL_HOST_VA_SP_SWAP = 0x0040c3b0u;


static constexpr int32_t ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_CONFIG = 0;
static constexpr int32_t ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x23 = 1;
static constexpr int32_t ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x122 = 2;
static constexpr int32_t ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x146 = 3;
static constexpr int32_t ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x160 = 4;
static constexpr int32_t ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x1a6 = 5;
static constexpr int32_t ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x1b2 = 6;
static constexpr int32_t ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x1da = 7;
static constexpr int32_t ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x1df = 8;
static constexpr int32_t ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x1e3 = 9;
static constexpr int32_t ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x1e9 = 10;
static constexpr int32_t ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x20b = 11;
static constexpr int32_t ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x280 = 12;
static constexpr int32_t ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x280_BELIAL = 13;
static constexpr int32_t ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x2ad = 14;
static constexpr int32_t ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x2c6 = 15;
static constexpr int32_t ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x2c7 = 16;
static constexpr int32_t ISAAC_PLAYERHUD_ACTIVE_PATH_KIND_0x2d0 = 17;
#pragma pack(push, 1)
typedef struct IsaacPlayerHud84d740Plan {
  uint32_t string_va;
  uint32_t needs_log;
  uint32_t log_level;
  uint32_t log_fmt_va;
  uint32_t host_va_log;
} IsaacPlayerHud84d740Plan;
#pragma pack(pop)
static_assert(sizeof(IsaacPlayerHud84d740Plan) == 20, "IsaacPlayerHud84d740Plan size");


#pragma pack(push, 1)
typedef struct IsaacPlayerHud857400Plan {
  uint32_t entry_va;
  uint32_t needs_log;
  uint32_t log_level;
  uint32_t log_fmt_va;
  uint32_t host_va_log;
} IsaacPlayerHud857400Plan;
#pragma pack(pop)
static_assert(sizeof(IsaacPlayerHud857400Plan) == 20, "IsaacPlayerHud857400Plan size");


#pragma pack(push, 1)
typedef struct IsaacPlayerHud84d8b0Result {
  uint32_t hit;
  uint32_t x_bits;
  uint32_t y_bits;
  uint32_t write_x;
  uint32_t write_y;
} IsaacPlayerHud84d8b0Result;
#pragma pack(pop)
static_assert(sizeof(IsaacPlayerHud84d8b0Result) == 20, "IsaacPlayerHud84d8b0Result size");


#pragma pack(push, 1)
typedef struct IsaacPlayerHud84db90Plan {
  uint32_t call_count;
  uint32_t host_va_0;
  uint32_t this_off_0;
  uint32_t host_va_1;
  uint32_t this_off_1;
  uint32_t host_va_2;
  uint32_t this_off_2;
  uint32_t host_va_3;
  uint32_t this_off_3;
  uint32_t tail_jmp;
  uint32_t next_va;
} IsaacPlayerHud84db90Plan;
#pragma pack(pop)
static_assert(sizeof(IsaacPlayerHud84db90Plan) == 44, "IsaacPlayerHud84db90Plan size");


#pragma pack(push, 1)
typedef struct IsaacPlayerHud84dbc0Plan {
  uint32_t call_count;
  uint32_t host_va_0;
  uint32_t this_off_0;
  uint32_t host_va_1;
  uint32_t this_off_1;
  uint32_t host_va_2;
  uint32_t this_off_2;
  uint32_t host_va_3;
  uint32_t this_off_3;
  uint32_t host_va_4;
  uint32_t this_off_4;
  uint32_t host_va_5;
  uint32_t this_off_5;
  uint32_t host_va_6;
  uint32_t this_off_6;
  uint32_t tail_jmp;
  uint32_t next_va;
} IsaacPlayerHud84dbc0Plan;
#pragma pack(pop)
static_assert(sizeof(IsaacPlayerHud84dbc0Plan) == 68, "IsaacPlayerHud84dbc0Plan size");



#pragma pack(push, 1)
typedef struct IsaacPlayerHud84dea0Plan {
  uint32_t call_count;
  uint32_t host_va;
  uint32_t gate_off;
  uint32_t player_ptr_off;
  uint32_t slot_count;
  uint32_t slot_stride;
  uint32_t xmm1_off_0;
  uint32_t label_va_0;
  uint32_t label_size_0;
  uint32_t xmm1_off_1;
  uint32_t label_va_1;
  uint32_t label_size_1;
  uint32_t xmm1_off_2;
  uint32_t label_va_2;
  uint32_t label_size_2;
  uint32_t xmm1_off_3;
  uint32_t label_va_3;
  uint32_t label_size_3;
  uint32_t xmm1_off_4;
  uint32_t label_va_4;
  uint32_t label_size_4;
  uint32_t xmm1_off_5;
  uint32_t label_va_5;
  uint32_t label_size_5;
  uint32_t xorps_rdata;
  uint32_t xorps_sibling;
  uint32_t next_va;
  uint32_t sibling_next_va;
} IsaacPlayerHud84dea0Plan;
#pragma pack(pop)
static_assert(sizeof(IsaacPlayerHud84dea0Plan) == 112, "IsaacPlayerHud84dea0Plan size");


#pragma pack(push, 1)
typedef struct IsaacPlayerHud84e5b0Plan {
  uint32_t stride;
  uint32_t vec_begin_off;
  uint32_t vec_end_off;
  uint32_t gate_off;
  uint32_t player_type_off;
  uint32_t vec_off_0;
  uint32_t vec_off_1;
  uint32_t vec_off_2;
  uint32_t vec_off_3;
  uint32_t vec_off_4;
  uint32_t vec_off_5;
  uint32_t completion_off;
  uint32_t mode_off;
  uint32_t host_va_col;
  uint32_t host_va_trk;
  uint32_t flag_shr_mode1;
  uint32_t flag_shr_mode2;
  uint32_t completion_max;
  uint32_t next_va;
} IsaacPlayerHud84e5b0Plan;
#pragma pack(pop)
static_assert(sizeof(IsaacPlayerHud84e5b0Plan) == 76, "IsaacPlayerHud84e5b0Plan size");



#pragma pack(push, 1)
typedef struct IsaacPlayerHud84e820Plan {
  uint32_t stride;
  uint32_t gate_off;
  uint32_t vec_begin_off;
  uint32_t vec_end_off;
  uint32_t extra_begin_off;
  uint32_t extra_end_off;
  uint32_t game_begin_off;
  uint32_t game_end_off;
  uint32_t range_lo_off;
  uint32_t range_hi_off;
  uint32_t special_kind;
  uint32_t char_mode0_a;
  uint32_t char_mode0_b;
  uint32_t char_mode1;
  uint32_t host_va_mode0;
  uint32_t host_va_mode1;
  uint32_t host_va_pred;
  uint32_t next_va;
} IsaacPlayerHud84e820Plan;
#pragma pack(pop)
static_assert(sizeof(IsaacPlayerHud84e820Plan) == 72, "IsaacPlayerHud84e820Plan size");



#pragma pack(push, 1)
typedef struct IsaacPlayerHud84e9d0SlotState {
  uint32_t current_bits;
  uint32_t delta_bits;
  uint32_t prev_bits;
  uint32_t threshold_bits;
  uint32_t timer;
} IsaacPlayerHud84e9d0SlotState;
#pragma pack(pop)
static_assert(sizeof(IsaacPlayerHud84e9d0SlotState) == 20, "IsaacPlayerHud84e9d0SlotState size");


#pragma pack(push, 1)
typedef struct IsaacPlayerHud856840Plan {
  uint32_t call_count;
  uint32_t host_va_0;
  uint32_t this_off_0;
  uint32_t host_va_1;
  uint32_t this_off_1;
  uint32_t host_va_2;
  uint32_t this_off_2;
  uint32_t host_va_3;
  uint32_t this_off_3;
  uint32_t host_va_4;
  uint32_t this_off_4;
  uint32_t host_va_5;
  uint32_t this_off_5;
  uint32_t host_va_6;
  uint32_t this_off_6;
  uint32_t stride;
  uint32_t next_va;
} IsaacPlayerHud856840Plan;
#pragma pack(pop)
static_assert(sizeof(IsaacPlayerHud856840Plan) == 68, "IsaacPlayerHud856840Plan size");


#pragma pack(push, 1)
typedef struct IsaacPlayerHud8568a0CopyPlan {
  uint32_t call_count;
  uint32_t host_va_0;
  uint32_t this_off_0;
  uint32_t arg_off_0;
  uint32_t host_va_1;
  uint32_t this_off_1;
  uint32_t arg_off_1;
  uint32_t host_va_2;
  uint32_t this_off_2;
  uint32_t arg_off_2;
  uint32_t host_va_3;
  uint32_t this_off_3;
  uint32_t arg_off_3;
  uint32_t host_va_4;
  uint32_t this_off_4;
  uint32_t arg_off_4;
  uint32_t host_va_5;
  uint32_t this_off_5;
  uint32_t arg_off_5;
  uint32_t host_va_6;
  uint32_t this_off_6;
  uint32_t arg_off_6;
  uint32_t tail_begin_off;
  uint32_t tail_dword_count;
  uint32_t object_size;
  uint32_t next_va;
} IsaacPlayerHud8568a0CopyPlan;
#pragma pack(pop)
static_assert(sizeof(IsaacPlayerHud8568a0CopyPlan) == 104, "IsaacPlayerHud8568a0CopyPlan size");


#pragma pack(push, 1)
typedef struct IsaacPlayerHudActiveCountdownState {
  int32_t slots[4];
} IsaacPlayerHudActiveCountdownState;
#pragma pack(pop)
static_assert(sizeof(IsaacPlayerHudActiveCountdownState) == 16, "IsaacPlayerHudActiveCountdownState size");


#pragma pack(push, 1)
typedef struct IsaacPlayerHudActiveGfxCachePlan {
  uint32_t needs_active_gfx;
  uint32_t needs_book_gfx;
  uint32_t book_path_kind;
  uint32_t book_path_va;
  uint32_t slot_dword_index;
  uint32_t cached_active_byte_off;
  uint32_t cached_book_byte_off;
} IsaacPlayerHudActiveGfxCachePlan;
#pragma pack(pop)
static_assert(sizeof(IsaacPlayerHudActiveGfxCachePlan) == 28, "IsaacPlayerHudActiveGfxCachePlan size");


#pragma pack(push, 1)
typedef struct IsaacPlayerHudActiveLoadImageCall {
  uint32_t runs_load_image;
  uint32_t path_kind;
  uint32_t path_va;
  uint32_t uses_config_gfx;
  uint32_t config_string_sso;
  uint32_t path_buffer_ebp_off;
  uint32_t result_sp_ebp_off;
  uint32_t materialize_this_ebp_off;
  uint32_t active_sp_saved_ebp_off;
  uint32_t dirty_flag_ebp_off;
  uint32_t materialize_seh_try_level;
  uint32_t dirty_after;
  uint32_t active_image_sp_byte_off;
  uint32_t host_va_load_image;
  uint32_t host_va_sp_materialize;
} IsaacPlayerHudActiveLoadImageCall;
#pragma pack(pop)
static_assert(sizeof(IsaacPlayerHudActiveLoadImageCall) == 60, "IsaacPlayerHudActiveLoadImageCall size");


#pragma pack(push, 1)
typedef struct IsaacPlayerHudActiveLoadImagePrep {
  uint32_t active_image_sp_byte_off;
  uint32_t sp_clear_arg;
  uint32_t skips_load_image;
  uint32_t path_kind;
  uint32_t path_va;
  uint32_t uses_config_gfx;
  uint32_t config_string_sso;
  uint32_t host_va_sp_clear;
  uint32_t host_va_load_image;
  uint32_t host_va_sp_materialize;
} IsaacPlayerHudActiveLoadImagePrep;
#pragma pack(pop)
static_assert(sizeof(IsaacPlayerHudActiveLoadImagePrep) == 40, "IsaacPlayerHudActiveLoadImagePrep size");


#pragma pack(push, 1)
typedef struct IsaacPlayerHudActivePathInputs {
  int32_t slot_index;
  int32_t active_item_id;
  int32_t player_type;
  int32_t player_dword_1818;
  int32_t player_active_charge;
  int8_t player_byte_202c;
  int8_t player_byte_20a9;
  int8_t has_collectible_0x26b;
  uint8_t _pad_end;
} IsaacPlayerHudActivePathInputs;
#pragma pack(pop)
static_assert(sizeof(IsaacPlayerHudActivePathInputs) == 24, "IsaacPlayerHudActivePathInputs size");


#pragma pack(push, 1)
typedef struct IsaacPlayerHudActivePathPlan {
  uint32_t path_kind;
  uint32_t path_va;
  uint32_t uses_config_gfx;
} IsaacPlayerHudActivePathPlan;
#pragma pack(pop)
static_assert(sizeof(IsaacPlayerHudActivePathPlan) == 12, "IsaacPlayerHudActivePathPlan size");


#pragma pack(push, 1)
typedef struct IsaacPlayerHudBookLoadImageCall {
  uint32_t book_path_kind;
  uint32_t path_va;
  uint32_t runs_load_image;
  uint32_t runs_sp_clear;
  uint32_t book_image_sp_byte_off;
  uint32_t result_sp_ebp_off;
  uint32_t materialize_this_ebp_off;
  uint32_t result_obj_ebp_off;
  uint32_t materialize_obj_ebp_off;
  uint32_t materialize_seh_try_level;
  uint32_t dirty_flag_ebp_off;
  uint32_t dirty_after;
  uint32_t host_va_load_image;
  uint32_t host_va_sp_materialize;
  uint32_t host_va_sp_clear;
  uint32_t sp_clear_arg;
} IsaacPlayerHudBookLoadImageCall;
#pragma pack(pop)
static_assert(sizeof(IsaacPlayerHudBookLoadImageCall) == 64, "IsaacPlayerHudBookLoadImageCall size");


#pragma pack(push, 1)
typedef struct IsaacPlayerHudItemConfigResolve {
  uint32_t table_kind;
  uint32_t lookup_index;
  uint32_t active_image_sp_byte_off;
} IsaacPlayerHudItemConfigResolve;
#pragma pack(pop)
static_assert(sizeof(IsaacPlayerHudItemConfigResolve) == 12, "IsaacPlayerHudItemConfigResolve size");


#pragma pack(push, 1)
typedef struct IsaacPlayerHudP5WalkClearPlan {
  uint32_t needed;
  uint32_t walk_steps;
  uint32_t cursor_byte_off;
  uint32_t end_byte_off;
  uint32_t stride;
  uint32_t node_sp_clear_off;
  uint32_t sp_clear_arg;
  uint32_t cursor_save_ebp_off;
  uint32_t hud_ebp_off;
  uint32_t host_va_sp_clear;
  uint32_t host_va_teardown;
} IsaacPlayerHudP5WalkClearPlan;
#pragma pack(pop)


#pragma pack(push, 1)
typedef struct IsaacPlayerHudPocketGfxPlan {
  uint32_t needs_pocket_gfx;
  uint32_t pocket_type;
  uint32_t resolved_id;
  uint32_t player_slot_index;
  uint32_t cached_type_byte_off;
  uint32_t cached_id_byte_off;
  uint32_t anm2_byte_off;
  uint32_t host_path_kind;
  uint32_t get_entity_type;
  uint32_t get_entity_variant;
  uint32_t get_entity_subtype;
  uint32_t manager_entity_config_off;
  uint32_t entity_anm_path_off;
  uint32_t anm2_load_graphics;
  uint32_t needs_pill_table_probe;
  uint32_t pill_table_lookup_index;
  uint32_t host_va_get_entity;
  uint32_t host_va_anm2_load;
  uint32_t host_va_anm2_reset;
} IsaacPlayerHudPocketGfxPlan;
#pragma pack(pop)
static_assert(sizeof(IsaacPlayerHudPocketGfxPlan) == 76, "IsaacPlayerHudPocketGfxPlan size");


#pragma pack(push, 1)
typedef struct IsaacPlayerHudPocketListClearPlan {
  uint32_t needs_clear;
  uint32_t head_ebp_off;
  uint32_t cursor_ebp_off;
  uint32_t node_sp_clear_off;
  uint32_t sp_clear_arg;
  uint32_t seh_level;
  uint32_t host_va_advance;
  uint32_t host_va_teardown;
  uint32_t teardown_runs_free;
  uint32_t host_va_free;
  uint32_t free_size;
} IsaacPlayerHudPocketListClearPlan;
#pragma pack(pop)


#pragma pack(push, 1)
typedef struct IsaacPlayerHudPocketUpgradePlan {
  uint32_t branch_kind;
  uint32_t resolve_table_kind;
  uint32_t resolve_lookup_index;
  uint32_t insert_value;
  uint32_t slot_byte_off;
  uint32_t array_element_dword_index;
  uint32_t build_node_result_ebp_off;
  uint32_t build_node_obj_ebp_off;
  uint32_t list_head_ebp_off;
  uint32_t value_ebp_off;
  uint32_t elem_ebp_off;
  uint32_t virtual_ebp_off;
  uint32_t global_arg_ebp_off;
  uint32_t seh_first;
  uint32_t seh_count;
  uint32_t callback_count;
  uint32_t result_copy_off;
  uint32_t config_is_sso;
  uint32_t config_path_ptr;
  uint32_t config_load_image_result_ebp_off;
  uint32_t config_elem2_ebp_off;
  uint32_t config_value2_ebp_off;
  uint32_t config_virtual2_ebp_off;
  uint32_t config_virtual3_ebp_off;
  uint32_t host_va_build_node;
  uint32_t host_va_node_remove;
  uint32_t host_va_materialize;
  uint32_t host_va_elem_init;
  uint32_t host_va_push_grow;
  uint32_t host_va_load_image;
  uint32_t host_va_free;
} IsaacPlayerHudPocketUpgradePlan;
#pragma pack(pop)
static_assert(sizeof(IsaacPlayerHudPocketUpgradePlan) == 124, "IsaacPlayerHudPocketUpgradePlan size");


#pragma pack(push, 1)
typedef struct IsaacPlayerHudStatBarTweenState {
  uint32_t current_bits;
  uint32_t delta_bits;
  uint32_t prev_bits;
  uint32_t timer;
} IsaacPlayerHudStatBarTweenState;
#pragma pack(pop)
static_assert(sizeof(IsaacPlayerHudStatBarTweenState) == 16, "IsaacPlayerHudStatBarTweenState size");


#pragma pack(push, 1)
typedef struct IsaacPlayerHud84cc40RecomputePlan {
  uint32_t host_va;      /* RecomputeStats 0x84ca00 */
  uint32_t player_index; /* loop index i */
  uint32_t mask;         /* 0xffffffff (-1) */
  uint32_t dead;         /* == player_index (push ecx twice) */
  uint32_t ret_bytes;    /* 0xc */
} IsaacPlayerHud84cc40RecomputePlan;
#pragma pack(pop)
static_assert(sizeof(IsaacPlayerHud84cc40RecomputePlan) == 20,
              "IsaacPlayerHud84cc40RecomputePlan size");


#pragma pack(push, 1)
typedef struct IsaacPlayerHudTailCharCountdownState {
  int8_t c0;
  int8_t c1;
  int8_t c2;
} IsaacPlayerHudTailCharCountdownState;
#pragma pack(pop)
static_assert(sizeof(IsaacPlayerHudTailCharCountdownState) == 3, "IsaacPlayerHudTailCharCountdownState size");


#pragma pack(push, 1)
typedef struct IsaacPlayerHudTailDirtyNotifyCallArgs {
  uint32_t dirty_flag_ebp_off;
  uint32_t hud_this_dword_off;
  uint32_t notify_arg;
  uint32_t host_va_notify;
} IsaacPlayerHudTailDirtyNotifyCallArgs;
#pragma pack(pop)


#pragma pack(push, 1)
typedef struct IsaacPlayerHudTailPredicateCallArgs {
  uint32_t type_arg;
  uint32_t arg1_player_off;
  uint32_t arg2_is_player;
  uint32_t arg3_is_leftover_ecx;
  uint32_t host_va_predicate;
} IsaacPlayerHudTailPredicateCallArgs;
#pragma pack(pop)


#pragma pack(push, 1)
typedef struct IsaacPlayerHudTailRebuildPlan {
  uint32_t runs;
  uint32_t entry_present;
  uint32_t path_kind;
  uint32_t fixed_path_va;
  uint32_t result_ebp_off;
  uint32_t swap_seh_try_level;
  uint32_t teardown_ecx_ebp_off;
  uint32_t temp_teardown_seh;
  uint32_t anm2_sp_byte_off;
  uint32_t sp_clear_arg;
  uint32_t clears_after;
  uint32_t config_path_sso;
  uint32_t config_path_ptr;
  uint32_t get_collectible_this_off;
  uint32_t get_collectible_arg_off;
  uint32_t probe_mask;
  uint32_t host_va_get_collectible;
  uint32_t host_va_sp_clear;
  uint32_t host_va_load_image;
  uint32_t host_va_swap;
  uint32_t host_va_temp_teardown;
  uint32_t host_va_probe;
} IsaacPlayerHudTailRebuildPlan;
#pragma pack(pop)


#pragma pack(push, 1)
typedef struct IsaacPlayerHudTrinketGfxPlan {
  uint32_t needs_trinket_gfx;
  uint32_t needs_room_seed_probe;
  uint32_t masked_id;
  uint32_t secondary_id;
  uint32_t table_kind;
  uint32_t lookup_index;
  uint32_t cached_id_byte_off;
  uint32_t cached_secondary_byte_off;
  uint32_t trinket_image_sp_byte_off;
  uint32_t result_sp_ebp_off;
  uint32_t result_obj_ebp_off;
  uint32_t seh_try_level;
  uint32_t dirty_flag_ebp_off;
  uint32_t dirty_after;
  uint32_t host_va_get_room_by_idx;
  uint32_t host_va_load_image;
  uint32_t host_va_sp_swap;
  uint32_t host_va_dirty_notify;
} IsaacPlayerHudTrinketGfxPlan;
#pragma pack(pop)
static_assert(sizeof(IsaacPlayerHudTrinketGfxPlan) == 72, "IsaacPlayerHudTrinketGfxPlan size");


#pragma pack(push, 1)
typedef struct IsaacPlayerHudUpdateHeartsCall {
  uint32_t heart_slots_off;
  uint32_t max_slots;
  uint32_t arg_source;
} IsaacPlayerHudUpdateHeartsCall;
#pragma pack(pop)
static_assert(sizeof(IsaacPlayerHudUpdateHeartsCall) == 12, "IsaacPlayerHudUpdateHeartsCall size");

#pragma pack(push, 1)
typedef struct IsaacPlayerHudUpdateHeartsCallPlan {
  uint32_t is_twin;
  uint32_t call_count;
  IsaacPlayerHudUpdateHeartsCall calls[2];
} IsaacPlayerHudUpdateHeartsCallPlan;
#pragma pack(pop)
static_assert(sizeof(IsaacPlayerHudUpdateHeartsCallPlan) == 32, "IsaacPlayerHudUpdateHeartsCallPlan size");


#pragma pack(push, 1)
typedef struct IsaacPlayerHudUpdateHeartsInput {
  int32_t player_type;
  int32_t max_hearts;
  int32_t red_hearts;
  int32_t eternal_hearts;
  int32_t soul_hearts;
  int32_t black_hearts_mask;
  int32_t bone_count;
  int32_t bone_mask;
  int32_t broken_hearts;
  int32_t rotten_hearts;
  int32_t heart_icon_count;
  int32_t field_1ef4;
  int8_t hud_char_c;
  int8_t hud_char_d;
  int8_t has_collectible_0x26b;
  uint8_t _pad_end;
} IsaacPlayerHudUpdateHeartsInput;
#pragma pack(pop)
static_assert(sizeof(IsaacPlayerHudUpdateHeartsInput) == 52, "IsaacPlayerHudUpdateHeartsInput size");


/* Prototypes recovered from the family cpp. */
void isaac_playerhud_entry_clear_heart_byte1(uint8_t flags[ISAAC_PLAYERHUD_HEART_SLOT_COUNT]);
void isaac_playerhud_entry_clear_heart_byte1_at(uint8_t* player_hud);
int32_t isaac_playerhud_update_hearts_uses_twin(uint32_t twin_ptr, int32_t player_type, int32_t field_3bc);
void isaac_playerhud_update_hearts_call_plan(IsaacPlayerHudUpdateHeartsCallPlan* out, uint32_t twin_ptr, int32_t player_type, int32_t field_3bc);
int32_t isaac_playerhud_get_health_type(int32_t player_type);
int32_t isaac_playerhud_signed_ceil_half(int32_t value);
int32_t isaac_playerhud_update_hearts_pure(uint8_t* heart_slots, int32_t max_slots, const IsaacPlayerHudUpdateHeartsInput* input);
int32_t isaac_playerhud_tramp_suppresses_critical_blink(const int32_t* types, const int32_t* variants, const int32_t* counts, int32_t count);
int32_t isaac_playerhud_active_slot_countdown_tick(IsaacPlayerHudActiveCountdownState* state);
int32_t isaac_playerhud_active_slot_countdown_tick_at(int32_t* player_hud_as_i32);
int32_t isaac_playerhud_active_book_overlay_id(int32_t slot_index, int32_t active_item_id, int32_t player_type, int8_t has_collectible_0x248, int8_t has_collectible_0x26b);
uint32_t isaac_playerhud_host_va_has_collectible(void);
int32_t isaac_playerhud_active_slot_dword_index(int32_t slot_index);
int32_t isaac_playerhud_cached_active_id_byte_offset(int32_t slot_index);
int32_t isaac_playerhud_cached_book_overlay_byte_offset(int32_t slot_index);
int32_t isaac_playerhud_active_id_cache_changed(int32_t active_item_id, int32_t cached_active_id);
int32_t isaac_playerhud_book_overlay_cache_changed(int32_t book_overlay_id, int32_t cached_book_overlay_id);
int32_t isaac_playerhud_book_overlay_path_kind(int32_t book_overlay_id);
uint32_t isaac_playerhud_book_overlay_path_va(int32_t book_overlay_id);
void isaac_playerhud_active_gfx_cache_plan(IsaacPlayerHudActiveGfxCachePlan* out, int32_t slot_index, int32_t active_item_id, int32_t cached_active_id, int32_t book_overlay_id, int32_t cached_book_overlay_id);
int32_t isaac_playerhud_active_gfx_cache_apply_at(int32_t* player_hud_as_i32, int32_t slot_index, int32_t active_item_id, int32_t book_overlay_id);
uint32_t isaac_playerhud_host_va_load_image(void);
uint32_t isaac_playerhud_host_va_smart_ptr_clear(void);
uint32_t isaac_playerhud_host_va_item_config_get_collectible(void);
int32_t isaac_playerhud_active_image_sp_byte_offset(int32_t slot_index);
void isaac_playerhud_item_config_resolve(IsaacPlayerHudItemConfigResolve* out, int32_t slot_index, int32_t active_item_id, int32_t game_present, int32_t game_neg_table_size, int32_t manager_table_size);
int32_t isaac_playerhud_active_item_path_kind(const IsaacPlayerHudActivePathInputs* input);
uint32_t isaac_playerhud_active_item_path_va(int32_t path_kind);
void isaac_playerhud_active_item_path_plan(IsaacPlayerHudActivePathPlan* out, const IsaacPlayerHudActivePathInputs* input);
uint32_t isaac_playerhud_active_sp_clear_arg(void);
uint32_t isaac_playerhud_sp_clear_alloc_size(void);
int32_t isaac_playerhud_sp_clear_alloc_ok(uint32_t alloc_ptr);
int32_t isaac_playerhud_sp_clear_old_object_present(uint32_t old_obj_ptr);
int32_t isaac_playerhud_sp_clear_callback_needed(uint32_t virtual_al, uint32_t global_fn);
void isaac_playerhud_sp_clear_object_finish_apply(uint8_t* obj_base, uint32_t arg);
void isaac_playerhud_sp_clear_pair_apply_base(uint8_t* pair_base, uint32_t arg, uint32_t new_obj);
uint32_t isaac_playerhud_sp_clear_vtable(void);
int32_t isaac_playerhud_skips_active_load_image(uint32_t item_entry_ptr);
int32_t isaac_playerhud_item_config_gfx_string_byte_offset(void);
int32_t isaac_playerhud_item_config_gfx_capacity_byte_offset(void);
int32_t isaac_playerhud_config_gfx_string_is_sso(uint32_t capacity);
uint32_t isaac_playerhud_host_va_sp_materialize(void);
void isaac_playerhud_sp_pair_swap(uint32_t* a_pair, uint32_t* b_pair);
void isaac_playerhud_sp_pair_swap_at(uint8_t* a_base, uint8_t* b_base);
void isaac_playerhud_active_load_image_prep(IsaacPlayerHudActiveLoadImagePrep* out, int32_t slot_index, uint32_t item_entry_ptr, const IsaacPlayerHudActivePathInputs* path_input, uint32_t config_capacity);
int32_t isaac_playerhud_load_image_path_buffer_ebp_off(void);
int32_t isaac_playerhud_load_image_result_ebp_off(void);
int32_t isaac_playerhud_materialize_this_ebp_off(void);
int32_t isaac_playerhud_active_sp_saved_ebp_off(void);
int32_t isaac_playerhud_dirty_flag_ebp_off(void);
int32_t isaac_playerhud_load_image_result_obj_ebp_off(void);
int32_t isaac_playerhud_materialize_obj_ebp_off(void);
int32_t isaac_playerhud_materialize_seh_try_level(void);
int32_t isaac_playerhud_active_dirty_after_gfx(void);
void isaac_playerhud_active_dirty_set(uint8_t* dirty_flag);
void isaac_playerhud_active_load_image_call(IsaacPlayerHudActiveLoadImageCall* out, int32_t slot_index, uint32_t item_entry_ptr, const IsaacPlayerHudActivePathInputs* path_input, uint32_t config_capacity);
int32_t isaac_playerhud_book_image_sp_byte_offset(int32_t slot_index);
int32_t isaac_playerhud_book_load_image_result_ebp_off(int32_t book_path_kind);
int32_t isaac_playerhud_book_materialize_this_ebp_off(int32_t book_path_kind);
int32_t isaac_playerhud_book_load_image_result_obj_ebp_off(int32_t book_path_kind);
int32_t isaac_playerhud_book_materialize_obj_ebp_off(int32_t book_path_kind);
int32_t isaac_playerhud_book_materialize_seh_try_level(int32_t book_path_kind);
uint32_t isaac_playerhud_book_sp_clear_arg(void);
int32_t isaac_playerhud_book_dirty_after_gfx(void);
void isaac_playerhud_book_load_image_call(IsaacPlayerHudBookLoadImageCall* out, int32_t slot_index, int32_t book_overlay_id);
int32_t isaac_playerhud_trinket_slot_count(void);
int32_t isaac_playerhud_cached_trinket_id_byte_offset(int32_t slot_index);
int32_t isaac_playerhud_cached_trinket_secondary_byte_offset(int32_t slot_index);
int32_t isaac_playerhud_trinket_image_sp_byte_offset(int32_t slot_index);
int32_t isaac_playerhud_player_trinket_id_byte_offset(int32_t slot_index);
int32_t isaac_playerhud_player_trinket_secondary_byte_offset(void);
uint32_t isaac_playerhud_trinket_mask_id(uint32_t raw_trinket_id);
int32_t isaac_playerhud_trinket_secondary_id(int32_t cached_trinket_id, int32_t player_secondary_1fb8);
int32_t isaac_playerhud_trinket_needs_room_seed_probe(uint32_t raw_trinket_id);
int32_t isaac_playerhud_trinket_apply_0x4b_remask(int32_t masked_id, uint32_t room_seed);
int32_t isaac_playerhud_trinket_cache_changed(int32_t masked_id, int32_t secondary_id, int32_t cached_id, int32_t cached_secondary);
void isaac_playerhud_trinket_cache_apply_at(uint8_t* player_hud, int32_t slot_index, int32_t masked_id, int32_t secondary_id);
uint32_t isaac_playerhud_host_va_get_room_by_idx(void);
uint32_t isaac_playerhud_host_va_sp_swap(void);
uint32_t isaac_playerhud_host_va_dirty_notify(void);
int32_t isaac_playerhud_trinket_load_image_result_ebp_off(void);
int32_t isaac_playerhud_trinket_load_image_result_obj_ebp_off(void);
int32_t isaac_playerhud_trinket_seh_try_level(void);
int32_t isaac_playerhud_trinket_dirty_after_gfx(void);
void isaac_playerhud_trinket_gfx_plan(IsaacPlayerHudTrinketGfxPlan* out, int32_t slot_index, uint32_t raw_trinket_id, int32_t cached_id, int32_t cached_secondary, int32_t player_secondary_1fb8, uint32_t room_seed, int32_t game_present, int32_t game_neg_table_size, int32_t manager_collectible_table_size, int32_t manager_trinket_table_size);
int32_t isaac_playerhud_pocket_slot_count(void);
int32_t isaac_playerhud_pocket_slot_stride(void);
int32_t isaac_playerhud_pocket_clamp_slot(int32_t slot_index);
int32_t isaac_playerhud_cached_pocket_type_byte_offset(int32_t slot_index);
int32_t isaac_playerhud_cached_pocket_id_byte_offset(int32_t slot_index);
int32_t isaac_playerhud_pocket_anm2_byte_offset(int32_t slot_index);
int32_t isaac_playerhud_player_pocket_id_byte_offset(int32_t slot_index);
int32_t isaac_playerhud_player_pocket_type_byte_offset(int32_t slot_index);
int32_t isaac_playerhud_pocket_resolved_id(int32_t pocket_type, int32_t pocket_id, int32_t pill_table_size, uint32_t pill_entry_ptr, int32_t pill_effect_id);
int32_t isaac_playerhud_pocket_cache_changed(int32_t pocket_type, int32_t resolved_id, int32_t cached_type, int32_t cached_id);
void isaac_playerhud_pocket_cache_apply_at(uint8_t* player_hud, int32_t slot_index, int32_t pocket_type, int32_t resolved_id);
int32_t isaac_playerhud_pocket_path_kind(int32_t pocket_type, int32_t resolved_id);
uint32_t isaac_playerhud_host_va_get_entity(void);
uint32_t isaac_playerhud_host_va_anm2_load(void);
uint32_t isaac_playerhud_host_va_anm2_reset(void);
int32_t isaac_playerhud_get_entity_type(void);
int32_t isaac_playerhud_get_entity_variant_card(void);
int32_t isaac_playerhud_get_entity_variant_pill(void);
int32_t isaac_playerhud_manager_entity_config_byte_offset(void);
int32_t isaac_playerhud_entity_anm_path_byte_offset(void);
int32_t isaac_playerhud_anm2_load_graphics(void);
void isaac_playerhud_pocket_gfx_plan(IsaacPlayerHudPocketGfxPlan* out, int32_t slot_index, int32_t pocket_type, int32_t pocket_id, int32_t cached_type, int32_t cached_id, int32_t pill_table_size, uint32_t pill_entry_ptr, int32_t pill_effect_id);
void isaac_playerhud_tail_float_step(float* value_6b8, int32_t predicate_true);
void isaac_playerhud_tail_char_countdown(IsaacPlayerHudTailCharCountdownState* state);
void isaac_playerhud_tail_char_countdown_at(uint8_t* player_hud);
int32_t isaac_playerhud_p5_block_needed(uint32_t enable_6ac, int32_t char_type_13c0);
uint32_t isaac_playerhud_p5_skip_va(uint32_t enable_6ac, int32_t char_type_13c0);
int32_t isaac_playerhud_p5_node_flag_word(void);
uint32_t isaac_playerhud_p5_node_self_ptr(uint32_t node_base, int32_t slot_offset);
int32_t isaac_playerhud_p5_walk_terminates(uint32_t cursor, uint32_t end);
int32_t isaac_playerhud_p5_walk_steps(uint32_t cursor, uint32_t end);
int32_t isaac_playerhud_p5_slot_needs_insert(int32_t slot_value);
int32_t isaac_playerhud_p5_slot_byte_offset(int32_t index);
int32_t isaac_playerhud_p5_push_needs_grow(uint32_t list_end, uint32_t list_cap);
uint32_t isaac_playerhud_p5_push_advance(uint32_t list_end);
int32_t isaac_playerhud_pocket_upgrade_slot_count(void);
int32_t isaac_playerhud_pocket_upgrade_slot_byte_offset(int32_t slot_index);
int32_t isaac_playerhud_pocket_upgrade_slot_is_upgrade(int32_t slot_value);
int32_t isaac_playerhud_pocket_upgrade_array_ptr_byte_offset(void);
int32_t isaac_playerhud_pocket_upgrade_array_element_dword_index(int32_t slot_index);
int32_t isaac_playerhud_pocket_upgrade_array_id_byte_offset(int32_t slot_index);
int32_t isaac_playerhud_pocket_upgrade_resolve_kind(int32_t game_present, int32_t id, int32_t game_neg_table_size, int32_t manager_table_size);
int32_t isaac_playerhud_pocket_upgrade_resolve_index(int32_t game_present, int32_t id, int32_t game_neg_table_size, int32_t manager_table_size);
int32_t isaac_playerhud_pocket_upgrade_entry_usable(uint32_t entry_ptr, int32_t entry_type);
int32_t isaac_playerhud_pocket_upgrade_take_result_value(uint32_t result_byte_d, int32_t result_word_4, int32_t id, uint32_t result_ptr, uint32_t list_head);
int32_t isaac_playerhud_pocket_upgrade_branch_kind(int32_t take_result, int32_t id);
int32_t isaac_playerhud_pocket_upgrade_insert_value(int32_t branch_kind, int32_t id, int32_t result_word_4, int32_t config_reinsert_id);
uint32_t isaac_playerhud_pocket_upgrade_config_path_ptr(uint32_t entry_ptr, int32_t is_sso, uint32_t config_heap_ptr);
int32_t isaac_playerhud_pocket_upgrade_global_callback_needed(uint32_t virtual_al, uint32_t global_fn);
int32_t isaac_playerhud_pocket_upgrade_result_followup_needed(uint32_t node_word_18);
int32_t isaac_playerhud_pocket_upgrade_result_copy_byte_offset(void);
int32_t isaac_playerhud_pocket_upgrade_build_node_result_ebp_off(void);
int32_t isaac_playerhud_pocket_upgrade_build_node_obj_ebp_off(void);
int32_t isaac_playerhud_pocket_upgrade_list_head_ebp_off(void);
int32_t isaac_playerhud_pocket_upgrade_value_ebp_off(int32_t branch_kind);
int32_t isaac_playerhud_pocket_upgrade_elem_ebp_off(int32_t branch_kind);
int32_t isaac_playerhud_pocket_upgrade_virtual_ebp_off(int32_t branch_kind);
int32_t isaac_playerhud_pocket_upgrade_global_arg_ebp_off(int32_t branch_kind);
int32_t isaac_playerhud_pocket_upgrade_seh_first(int32_t branch_kind);
int32_t isaac_playerhud_pocket_upgrade_seh_count(int32_t branch_kind);
int32_t isaac_playerhud_pocket_upgrade_callback_count(int32_t branch_kind);
int32_t isaac_playerhud_pocket_upgrade_config_load_image_result_ebp_off(void);
int32_t isaac_playerhud_pocket_upgrade_config_elem2_ebp_off(void);
int32_t isaac_playerhud_pocket_upgrade_config_value2_ebp_off(void);
int32_t isaac_playerhud_pocket_upgrade_config_virtual2_ebp_off(void);
int32_t isaac_playerhud_pocket_upgrade_config_virtual3_ebp_off(void);
int32_t isaac_playerhud_pocket_upgrade_config_capacity_byte_offset(void);
uint32_t isaac_playerhud_host_va_pocket_upgrade_build_node(void);
uint32_t isaac_playerhud_host_va_pocket_upgrade_node_remove(void);
uint32_t isaac_playerhud_host_va_free(void);
void isaac_playerhud_pocket_upgrade_plan(IsaacPlayerHudPocketUpgradePlan* out, int32_t slot_index, int32_t game_present, int32_t id, int32_t game_neg_table_size, int32_t manager_table_size, uint32_t entry_ptr, int32_t entry_type, uint32_t result_ptr, uint32_t result_byte_d, int32_t result_word_4, uint32_t list_head, int32_t config_capacity, uint32_t config_heap_ptr, int32_t config_reinsert_id);
int32_t isaac_playerhud_pocket_second_list_gate(int32_t game_word_26584);
int32_t isaac_playerhud_pocket_second_list_count(uint32_t begin_1fa4, uint32_t end_1fa8);
int32_t isaac_playerhud_pocket_second_list_iteration_needed(int32_t index, uint32_t begin_1fa4, uint32_t end_1fa8);
int32_t isaac_playerhud_pocket_second_list_entry_usable(uint32_t entry_ptr);
int32_t isaac_playerhud_pocket_second_list_vec_begin_byte_offset(void);
int32_t isaac_playerhud_pocket_second_list_vec_end_byte_offset(void);
int32_t isaac_playerhud_pocket_list_clear_needed(uint32_t head_ptr, uint32_t head_word0);
void isaac_playerhud_pocket_list_clear_plan(IsaacPlayerHudPocketListClearPlan* out, int32_t kind, uint32_t head_ptr, uint32_t head_word0);
int32_t isaac_playerhud_p5_walk_clear_needed(uint32_t cursor_6a0, uint32_t end_6a4);
void isaac_playerhud_p5_walk_clear_plan(IsaacPlayerHudP5WalkClearPlan* out, uint32_t cursor_6a0, uint32_t end_6a4);
void isaac_playerhud_tail_enable_store_clear(uint8_t* player_hud);
int32_t isaac_playerhud_tail_rebuild_gate(uint32_t byte_6ad);
int32_t isaac_playerhud_tail_rebuild_path_kind(uint32_t probe_al);
uint32_t isaac_playerhud_tail_config_string_data(uint32_t entry_ptr, uint32_t capacity, uint32_t heap_data_ptr);
void isaac_playerhud_tail_rebuild_plan(IsaacPlayerHudTailRebuildPlan* out, uint32_t byte_6ad, uint32_t entry_ptr, uint32_t probe_al, uint32_t config_capacity, uint32_t config_heap_ptr);
void isaac_playerhud_tail_predicate_call_args(IsaacPlayerHudTailPredicateCallArgs* out);
int32_t isaac_playerhud_tail_dirty_notify_needed(uint32_t dirty_byte);
void isaac_playerhud_tail_dirty_notify_call_args(IsaacPlayerHudTailDirtyNotifyCallArgs* out);
void isaac_playerhud_stat_bar_tween(IsaacPlayerHudStatBarTweenState* out, uint32_t current_bits, uint32_t prev_bits, uint32_t threshold_bits, int32_t timer, uint32_t target_bits, uint32_t mode);
void isaac_playerhud_84e9d0_update(IsaacPlayerHud84e9d0SlotState out[6], uint32_t player_ptr, uint32_t player_1568_bits, uint32_t player_1460_bits, uint32_t player_1470_bits, uint32_t player_1480_bits, uint32_t player_1464_bits, uint32_t player_156c_bits, uint32_t mode);
uint32_t isaac_playerhud_84ca00_flag(uint32_t game_frame, uint32_t entry_frame);
uint32_t isaac_playerhud_84ca00_clamp(uint32_t probe1_bits, uint32_t probe2);
uint32_t isaac_playerhud_84ca00_slot_active(uint32_t mask, uint32_t slot_index);
uint32_t isaac_playerhud_84ca00_slot_target(uint32_t slot_index, uint32_t e1568_bits, uint32_t e1460_bits, uint32_t e1470_bits, uint32_t e1480_bits, uint32_t e1464_bits, uint32_t e156c_bits, uint32_t probe1_bits, uint32_t probe2, uint32_t probe3_bits, uint32_t mode_byte, uint32_t game_1adb4_bits);
/* ABI v33: per-player StatHUD stats-pack updater FUN_0084cc40 gate/plan. */
uint32_t isaac_playerhud_84cc40_block_count(void);
uint32_t isaac_playerhud_84cc40_block_stride(void);
uint32_t isaac_playerhud_84cc40_block_player_off(void);
uint32_t isaac_playerhud_84cc40_slot_base_off(void);
uint32_t isaac_playerhud_84cc40_slot_count(void);
uint32_t isaac_playerhud_84cc40_slot_stride(void);
uint32_t isaac_playerhud_84cc40_mode_byte_off(void);
uint32_t isaac_playerhud_84cc40_block_kind(uint32_t block_player, uint32_t player_a, uint32_t player_b);
uint32_t isaac_playerhud_84cc40_update_needed(uint32_t player_b);
uint32_t isaac_playerhud_84cc40_path_flag(uint32_t game_frame, uint32_t entry_frame);
uint32_t isaac_playerhud_84cc40_recompute_host_va(void);
void isaac_playerhud_84cc40_recompute_plan(IsaacPlayerHud84cc40RecomputePlan* out, uint32_t player_index);
uint32_t isaac_playerhud_84cc40_va(void);
uint32_t isaac_playerhud_84cc40_ret_va(void);
uint32_t isaac_playerhud_84cc40_next_va(void);
uint32_t isaac_playerhud_84d740_string_va(uint32_t action_id);
int32_t isaac_playerhud_84d740_needs_log(uint32_t action_id);
void isaac_playerhud_84d740_plan(IsaacPlayerHud84d740Plan* out, uint32_t action_id);
void isaac_playerhud_84d8b0_intersect(IsaacPlayerHud84d8b0Result* out, uint32_t ax_bits, uint32_t ay_bits, uint32_t bx_bits, uint32_t by_bits, uint32_t cx_bits, uint32_t cy_bits, uint32_t dx_bits, uint32_t dy_bits, uint32_t out_x_ptr, uint32_t out_y_ptr);
void isaac_playerhud_84da20_init(uint32_t* obj);
int32_t isaac_playerhud_84da20_writes_dword(uint32_t byte_off);
uint32_t isaac_playerhud_84da20_object_size(void);
uint32_t isaac_playerhud_84da20_sso_capacity(void);
uint32_t isaac_playerhud_84da20_next_va(void);
void isaac_playerhud_84dad0_init(uint32_t* obj);
int32_t isaac_playerhud_84dad0_writes_dword(uint32_t byte_off);
int32_t isaac_playerhud_84dad0_writes_byte(uint32_t byte_off);
uint32_t isaac_playerhud_84dad0_object_size(void);
uint32_t isaac_playerhud_84dad0_sso_capacity(void);
uint32_t isaac_playerhud_84dad0_host_va(void);
uint32_t isaac_playerhud_84dad0_host_this_off(void);
uint32_t isaac_playerhud_84dad0_next_va(void);
void isaac_playerhud_84db90_plan(IsaacPlayerHud84db90Plan* out);
uint32_t isaac_playerhud_84db90_call_count(void);
uint32_t isaac_playerhud_84db90_this_off_at(uint32_t index);
uint32_t isaac_playerhud_84db90_host_va_at(uint32_t index);
int32_t isaac_playerhud_84db90_is_tail_jmp(uint32_t index);
uint32_t isaac_playerhud_84db90_next_va(void);
void isaac_playerhud_84dbc0_plan(IsaacPlayerHud84dbc0Plan* out);
uint32_t isaac_playerhud_84dbc0_call_count(void);
uint32_t isaac_playerhud_84dbc0_this_off_at(uint32_t index);
uint32_t isaac_playerhud_84dbc0_host_va_at(uint32_t index);
int32_t isaac_playerhud_84dbc0_is_tail_jmp(uint32_t index);
uint32_t isaac_playerhud_84dbc0_next_va(void);
int32_t isaac_playerhud_856840_needed(uint32_t begin, uint32_t end);
uint32_t isaac_playerhud_856840_count(uint32_t begin, uint32_t end);
void isaac_playerhud_856840_plan(IsaacPlayerHud856840Plan* out);
uint32_t isaac_playerhud_856840_call_count(void);
uint32_t isaac_playerhud_856840_this_off_at(uint32_t index);
uint32_t isaac_playerhud_856840_host_va_at(uint32_t index);
uint32_t isaac_playerhud_856840_stride(void);
uint32_t isaac_playerhud_856840_next_va(void);
void isaac_playerhud_8568a0_plan(IsaacPlayerHud8568a0CopyPlan* out);
uint32_t isaac_playerhud_8568a0_call_count(void);
uint32_t isaac_playerhud_8568a0_this_off_at(uint32_t index);
uint32_t isaac_playerhud_8568a0_arg_off_at(uint32_t index);
uint32_t isaac_playerhud_8568a0_host_va_at(uint32_t index);
uint32_t isaac_playerhud_8568a0_tail_begin_off(void);
uint32_t isaac_playerhud_8568a0_tail_dword_count(void);
uint32_t isaac_playerhud_8568a0_object_size(void);
uint32_t isaac_playerhud_8568a0_next_va(void);
void isaac_playerhud_8568a0_tail_copy(uint32_t* dest, const uint32_t* src);
uint32_t isaac_playerhud_856e10_move_ctor(uint8_t* dest, uint8_t* src);
uint32_t isaac_playerhud_856e10_object_size(void);
uint32_t isaac_playerhud_856e10_next_va(void);
/* ABI v34: pure leaf gate FUN_00856f50 ([this+8]==2||[this+8]==0). */
uint32_t isaac_playerhud_856f50_gate(uint32_t field_8);
uint32_t isaac_playerhud_856f50_field_off(void);
uint32_t isaac_playerhud_856f50_va(void);
uint32_t isaac_playerhud_856f50_ret_va(void);
uint32_t isaac_playerhud_856f50_next_va(void);
/* ABI v35: pure time-pack leaf FUN_0085af30.  ecx = out struct ptr,
   edx = value (u32); eax = out.  writes byte+0 = 2, +8..+18 zeros,
   +1c = value%100, +20 = (value/10000%100)-1, +24 = value/10000-1900,
   +28..+30 zeros; +4 preserved.  Next VA 0x0085afb0 is frame-effect-owned
   (ALREADY LANDED as isaac_frame_effect_85afb0_*). */
void isaac_playerhud_85af30_pack(uint32_t* out, uint32_t value);
uint32_t isaac_playerhud_85af30_value_div10000(uint32_t value);
uint32_t isaac_playerhud_85af30_value_rem100(uint32_t value);
int32_t isaac_playerhud_85af30_value_q100_minus1(uint32_t value);
int32_t isaac_playerhud_85af30_value_q10000_minus1900(uint32_t value);
uint32_t isaac_playerhud_85af30_va(void);
uint32_t isaac_playerhud_85af30_ret_va(void);
uint32_t isaac_playerhud_85af30_next_va(void);
uint32_t isaac_playerhud_85af30_object_size(void);
/* ABI v36: pure ordinal-suffix leaf FUN_00858870.  stdcall, 1 int32
   arg; returns .rdata suffix VA: r100 = value%100 (signed trunc),
   r100 in {11,12,13} -> TH; else r10 = value%10: 1 -> ST (0xb6e4cc),
   2 -> ND (0xb6e4c0), 3 -> RD (0xb6e4c4), else TH (0xb6e4c8).
   Next VA 0x008588f0 (SEH rank-display giant host). */
uint32_t isaac_playerhud_858870_ordinal_suffix_va(int32_t value);
int32_t isaac_playerhud_858870_value_rem100(int32_t value);
int32_t isaac_playerhud_858870_value_rem10(int32_t value);
uint32_t isaac_playerhud_858870_va(void);
uint32_t isaac_playerhud_858870_ret_va(void);
uint32_t isaac_playerhud_858870_next_va(void);
/* ABI v37: pure leaderboard type->entry getter FUN_00857400.  thiscall
   ecx = Leaderboard object; kind = [this+8] FULL-DWORD; UNSIGNED
   `cmp eax,3; ja` gate (no byte mask).  kind 0..3 -> entry ptr
   [this+0x238+4*kind]; kind > 3 -> host log 0xa112c0 + entry = 0. */
uint32_t isaac_playerhud_857400_entry(uint32_t kind, uint32_t slot0,
                                      uint32_t slot1, uint32_t slot2,
                                      uint32_t slot3);
int32_t isaac_playerhud_857400_needs_log(uint32_t kind);
void isaac_playerhud_857400_plan(IsaacPlayerHud857400Plan* out,
                                 uint32_t kind, uint32_t slot0,
                                 uint32_t slot1, uint32_t slot2,
                                 uint32_t slot3);
uint32_t isaac_playerhud_857400_va(void);
uint32_t isaac_playerhud_857400_ret_va(void);
uint32_t isaac_playerhud_857400_next_va(void);
/* ABI v38: pure float getter FUN_0085e360.  thiscall, no args;
   returns the f32 view of the dword at [this+0x41c] (PE `fld dword
   ptr [ecx+0x41c]; ret` — bit-preserving reinterpret). */
float isaac_playerhud_85e360_float_41c(uint32_t field_bits);
uint32_t isaac_playerhud_85e360_field_off(void);
uint32_t isaac_playerhud_85e360_va(void);
uint32_t isaac_playerhud_85e360_ret_va(void);
uint32_t isaac_playerhud_85e360_next_va(void);
/* ABI v39: 7-leaf StatHUD conversion cluster (VA 0x009bfc00..0x009bfd38).
   All leaves: xmm0 in / xmm0 out, ret 0, 1 direct rel32 caller.
   4 pure (0 E8) + 3 pow-composed (blob-gated: the pow_bits parameter is
   the host-resolved f32 result of 0x4e4690 powf(base, exp); the JS
   oracle computes Math.fround(Math.pow(base, exp))).  Every SSE op is
   one f32 rounding (wasm f32, no fast-math). */
uint32_t isaac_playerhud_9bfc00_law(uint32_t x_bits);
uint32_t isaac_playerhud_9bfc00_va(void);
uint32_t isaac_playerhud_9bfc00_ret_va(void);
uint32_t isaac_playerhud_9bfc00_next_va(void);
uint32_t isaac_playerhud_9bfc00_caller1_va(void);
uint32_t isaac_playerhud_9bfc20_law(uint32_t x_bits);
uint32_t isaac_playerhud_9bfc20_va(void);
uint32_t isaac_playerhud_9bfc20_ret_va(void);
uint32_t isaac_playerhud_9bfc20_next_va(void);
uint32_t isaac_playerhud_9bfc20_caller1_va(void);
uint32_t isaac_playerhud_9bfc40_pow_base(uint32_t x_bits);
uint32_t isaac_playerhud_9bfc40_pow_exp_bits(void);
uint32_t isaac_playerhud_9bfc40_law(uint32_t x_bits, uint32_t pow_bits);
uint32_t isaac_playerhud_9bfc40_va(void);
uint32_t isaac_playerhud_9bfc40_ret_va(void);
uint32_t isaac_playerhud_9bfc40_next_va(void);
uint32_t isaac_playerhud_9bfc40_caller1_va(void);
uint32_t isaac_playerhud_9bfc80_gate(uint32_t x_bits);
uint32_t isaac_playerhud_9bfc80_pow_base(uint32_t x_bits);
uint32_t isaac_playerhud_9bfc80_pow_exp_bits(void);
uint32_t isaac_playerhud_9bfc80_law(uint32_t x_bits, uint32_t pow_bits);
uint32_t isaac_playerhud_9bfc80_va(void);
uint32_t isaac_playerhud_9bfc80_ret_va(void);
uint32_t isaac_playerhud_9bfc80_next_va(void);
uint32_t isaac_playerhud_9bfc80_caller1_va(void);
uint32_t isaac_playerhud_9bfcd0_gate(uint32_t x_bits);
uint32_t isaac_playerhud_9bfcd0_pow_base(uint32_t x_bits);
uint32_t isaac_playerhud_9bfcd0_pow_exp_bits(void);
uint32_t isaac_playerhud_9bfcd0_law(uint32_t x_bits, uint32_t pow_bits);
uint32_t isaac_playerhud_9bfcd0_va(void);
uint32_t isaac_playerhud_9bfcd0_ret_va(void);
uint32_t isaac_playerhud_9bfcd0_next_va(void);
uint32_t isaac_playerhud_9bfcd0_caller1_va(void);
uint32_t isaac_playerhud_9bfd00_law(uint32_t x_bits);
uint32_t isaac_playerhud_9bfd00_va(void);
uint32_t isaac_playerhud_9bfd00_ret_va(void);
uint32_t isaac_playerhud_9bfd00_next_va(void);
uint32_t isaac_playerhud_9bfd00_caller1_va(void);
uint32_t isaac_playerhud_9bfd20_law(uint32_t x_bits);
uint32_t isaac_playerhud_9bfd20_va(void);
uint32_t isaac_playerhud_9bfd20_ret_va(void);
uint32_t isaac_playerhud_9bfd20_next_va(void);
uint32_t isaac_playerhud_9bfd20_caller1_va(void);
uint32_t isaac_playerhud_9bfc_host_va_powf(void);
int32_t isaac_playerhud_856960_needed(uint32_t src_begin, uint32_t src_end);
uint32_t isaac_playerhud_856960_count(uint32_t src_begin, uint32_t src_end);
uint32_t isaac_playerhud_856960_move_range(uint8_t* dest,
                                           uint8_t* src_begin,
                                           uint8_t* src_end);
uint32_t isaac_playerhud_856960_stride(void);
uint32_t isaac_playerhud_856960_move_ctor_va(void);
uint32_t isaac_playerhud_856960_wipe_va(void);
uint32_t isaac_playerhud_856960_next_va(void);
int32_t isaac_playerhud_84dea0_needed(uint32_t this_plus_4);
void isaac_playerhud_84dea0_plan(IsaacPlayerHud84dea0Plan* out);
uint32_t isaac_playerhud_84dea0_call_count(void);
uint32_t isaac_playerhud_84dea0_xmm1_off_at(uint32_t index);
uint32_t isaac_playerhud_84dea0_label_va_at(uint32_t index);
uint32_t isaac_playerhud_84dea0_label_size_at(uint32_t index);
uint32_t isaac_playerhud_84dea0_host_va(void);
uint32_t isaac_playerhud_84dea0_next_va(void);
int32_t isaac_playerhud_84e200_xorps_needed(void);
uint32_t isaac_playerhud_84e200_next_va(void);
uint32_t isaac_playerhud_84e5b0_count(uint32_t begin, uint32_t end);
int32_t isaac_playerhud_84e5b0_in_range(uint32_t index, uint32_t begin,
                                       uint32_t end);
int32_t isaac_playerhud_84e5b0_early_true(uint32_t this_plus_4);
int32_t isaac_playerhud_84e5b0_prefix(uint32_t index, uint32_t begin,
                                     uint32_t end, uint32_t this_plus_4);
uint32_t isaac_playerhud_84e5b0_object_off(uint32_t index);
uint32_t isaac_playerhud_84e5b0_dword_count(uint32_t begin, uint32_t end);
int32_t isaac_playerhud_84e5b0_whitelist_ok(uint32_t count, uint32_t has);
int32_t isaac_playerhud_84e5b0_blacklist_ok(uint32_t has);
int32_t isaac_playerhud_84e5b0_completion_prefix(uint32_t id);
int32_t isaac_playerhud_84e5b0_mode_ok(uint32_t this_mode, uint32_t obj_64,
                                      uint32_t flags, uint32_t game_269c8);
int32_t isaac_playerhud_84e5b0_decide(
    uint32_t index, uint32_t begin, uint32_t end, uint32_t this_plus_4,
    uint32_t wl_count, uint32_t wl_has, uint32_t bl_has, uint32_t req_col_ok,
    uint32_t forb_col_hit, uint32_t req_trk_ok, uint32_t forb_trk_hit,
    uint32_t completion_ok, uint32_t this_mode, uint32_t obj_64, uint32_t flags,
    uint32_t game_269c8);
void isaac_playerhud_84e5b0_plan(IsaacPlayerHud84e5b0Plan* out);
uint32_t isaac_playerhud_84e5b0_vec_off_at(uint32_t index);
uint32_t isaac_playerhud_84e5b0_host_va_at(uint32_t index);
int32_t isaac_playerhud_84e5b0_fail_if_al_at(uint32_t index);
uint32_t isaac_playerhud_84e5b0_stride(void);
uint32_t isaac_playerhud_84e5b0_next_va(void);
int32_t isaac_playerhud_84e820_gate_zero(uint32_t this_plus_4);
uint32_t isaac_playerhud_84e820_count(uint32_t begin, uint32_t end);
uint32_t isaac_playerhud_84e820_ptr_count(uint32_t begin, uint32_t end);
int32_t isaac_playerhud_84e820_in_range(uint32_t index, uint32_t count);
int32_t isaac_playerhud_84e820_loop_cont(uint32_t index, uint32_t count);
int32_t isaac_playerhud_84e820_range_empty(uint32_t lo, uint32_t hi);
int32_t isaac_playerhud_84e820_special_ok(uint32_t kind, uint32_t mode,
                                         uint32_t this_plus_4);
int32_t isaac_playerhud_84e820_al_hit(uint32_t host_al);
int32_t isaac_playerhud_84e820_entry_inc(uint32_t ptr, uint32_t lo, uint32_t hi,
                                        uint32_t kind, uint32_t mode,
                                        uint32_t this_plus_4, uint32_t host_al);
uint32_t isaac_playerhud_84e820_extra_sum(uint32_t extra_count, uint32_t acc);
int32_t isaac_playerhud_84e820_decide(uint32_t index, uint32_t ptr_count,
                                     uint32_t ptr, uint32_t lo, uint32_t hi,
                                     uint32_t kind, uint32_t mode,
                                     uint32_t this_plus_4, uint32_t host_al);
void isaac_playerhud_84e820_plan(IsaacPlayerHud84e820Plan* out);
uint32_t isaac_playerhud_84e820_host_va_at(uint32_t mode);
uint32_t isaac_playerhud_84e820_stride(void);
uint32_t isaac_playerhud_84e820_next_va(void);
uint32_t isaac_playerhud_host_va_log(void);
/* ---------------- ABI v40: 0x009c0120 / 0x009c0170 lerp visitors --------
 * The v39 handoff's "re-census the remaining PlayerHUD host residuals"
 * pick (frontier 0x009bfd40; window 0x9bfd40..0x9c0d40; 6 bodies
 * classified; identify-zhl ONE invocation, exactMatches [] for all).
 * TWO verify-open small pure NARROWED bodies — virtual methods
 * (address-taken ONLY via .rdata vtables 0xb7ed28 / 0xb7ed40; ZERO
 * E8 callers, ZERO static dword refs in .text):
 *   0x009c0120..0x009c0165 (ret 0, thiscall, no stack args):
 *     probe := this->vtbl[4]()  — ALWAYS-path indirect (slot +0x10),
 *                 float returned in st0 (recapture input f)
 *     d := [this+0xc] - [this+8]            (subss)
 *     t := clamp01(f): maxss [0xba9fe4]=0.0f then minss [0xbaa454]=1.0f
 *         (NaN -> 0.0f via the maxss src2 rule; -0.0f -> +0.0f)
 *     st0 := [this+8] + d * t               (mulss, addss) — scalar lerp
 *   0x009c0170..0x9c01cc (ret 4, thiscall, out ptr [ebp+8]):
 *     same probe + clamp ONCE, then per-component lerp
 *     out[0] = [this+8]  + ([this+0x10] - [this+8])  * t
 *     out[1] = [this+0xc] + ([this+0x14] - [this+0xc]) * t
 * The probe edge stays HOST (its VALUE is the recapture f_bits, the
 * v39 pow-probe precedent).  All params uint32_t f32 bits; per-op
 * f32 rounding.  Band context: #1 0x9bfd40 SEH vector-build host,
 * #2 0x9bffb0 log-leaf pair (2 callers 0x4bf89e/0x4bf922), #3
 * 0x9c00c0 entity-owned alloc leaf (sole caller 0x9bfdcd), #6
 * 0x9c01d0 SEH ctor giant (1219B) — all pinned HOST. */
static constexpr uint32_t ISAAC_PLAYERHUD_9C0120_VA = 0x009c0120u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C0120_RET_VA = 0x009c0165u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C0120_NEXT_VA = 0x009c0170u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C0120_VTABLE_REF_RDATA =
    0x00b7ed28u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C0120_PROBE_SLOT = 4u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C0120_PROBE_VTBL_OFF = 0x10u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C0120_A_OFF = 8u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C0120_B_OFF = 0xcu;
static constexpr uint32_t ISAAC_PLAYERHUD_CLAMP_LO_RDATA = 0x00ba9fe4u;
static constexpr uint32_t ISAAC_PLAYERHUD_CLAMP_HI_RDATA = 0x00baa454u;
static constexpr uint32_t ISAAC_PLAYERHUD_CLAMP_ZERO_BITS = 0x00000000u;
static constexpr uint32_t ISAAC_PLAYERHUD_CLAMP_ONE_BITS = 0x3f800000u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C0170_VA = 0x009c0170u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C0170_RET_VA = 0x009c01ccu;
static constexpr uint32_t ISAAC_PLAYERHUD_9C0170_NEXT_VA = 0x009c01d0u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C0170_VTABLE_REF_RDATA =
    0x00b7ed40u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C0170_RET_IMM = 4u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C0170_A_OFF = 8u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C0170_B_OFF = 0xcu;
static constexpr uint32_t ISAAC_PLAYERHUD_9C0170_C_OFF = 0x10u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C0170_D_OFF = 0x14u;

#pragma pack(push, 1)
typedef struct IsaacPlayerHud9c0170Pair {
  uint32_t out0_bits;  /* f32 bits of [this+8]  + ([this+0x10]-[this+8])*t  */
  uint32_t out1_bits;  /* f32 bits of [this+0xc] + ([this+0x14]-[this+0xc])*t */
  uint32_t t_bits;     /* the shared clamp01(f) (computed ONCE) */
} IsaacPlayerHud9c0170Pair;
#pragma pack(pop)
static_assert(sizeof(IsaacPlayerHud9c0170Pair) == 12,
              "IsaacPlayerHud9c0170Pair size");

/* clamp01 via the PE maxss/minss pair: NaN -> +0.0f, -0.0f -> +0.0f,
   f < 0 -> +0.0f, f > 1 -> 1.0f, else f (bit-preserving).  Shared by
   both bodies (sites 0x9c0140/0x9c0148 and 0x9c0193/0x9c019b). */
uint32_t isaac_playerhud_9c0120_clamp01(uint32_t f_bits);
/* 0x9c0120 law: a + (b - a) * clamp01(f), per-op f32. */
uint32_t isaac_playerhud_9c0120_value(uint32_t a_bits, uint32_t b_bits,
                                      uint32_t f_bits);
/* 0x9c0170 law: the shared clamp01 + the two component lerps.
   out may be null (no-op). */
void isaac_playerhud_9c0170_pair(uint32_t a_bits, uint32_t b_bits,
                                 uint32_t c_bits, uint32_t d_bits,
                                 uint32_t f_bits,
                                 IsaacPlayerHud9c0170Pair* out);

/* v40 census pins. */
uint32_t isaac_playerhud_9c0120_va(void);
uint32_t isaac_playerhud_9c0120_ret_va(void);
uint32_t isaac_playerhud_9c0120_next_va(void);
uint32_t isaac_playerhud_9c0120_vtable_ref_rdata(void);
uint32_t isaac_playerhud_9c0120_probe_slot(void);
uint32_t isaac_playerhud_9c0120_probe_vtbl_off(void);
uint32_t isaac_playerhud_9c0120_a_off(void);
uint32_t isaac_playerhud_9c0120_b_off(void);
uint32_t isaac_playerhud_clamp_lo_rdata(void);
uint32_t isaac_playerhud_clamp_hi_rdata(void);
uint32_t isaac_playerhud_clamp_zero_bits(void);
uint32_t isaac_playerhud_clamp_one_bits(void);
uint32_t isaac_playerhud_9c0170_va(void);
uint32_t isaac_playerhud_9c0170_ret_va(void);
uint32_t isaac_playerhud_9c0170_next_va(void);
uint32_t isaac_playerhud_9c0170_vtable_ref_rdata(void);
uint32_t isaac_playerhud_9c0170_ret_imm(void);
uint32_t isaac_playerhud_9c0170_a_off(void);
uint32_t isaac_playerhud_9c0170_b_off(void);
uint32_t isaac_playerhud_9c0170_c_off(void);
uint32_t isaac_playerhud_9c0170_d_off(void);

/* ---------------- ABI v41: 0x009c06a0 probe-sum vec2 law ------------
 * The v41 depth unit's census pick (window 0x9c0693..0x9c1693; six
 * census rows classified; identify-zhl ONE invocation, exactMatches []
 * on every row start):
 *   #2 0x9c075a..0x9c07e4 HOST (E8 x2 -> 0x8370b0, unlanded)
 *   #3 0x9c07e4..0x9c086d HOST (E8 -> 0xa68490 QPC clock, known host)
 *   #4+#5+#6 0x9c0870..0x9c0958 ONE function (the linear census splits
 *     it at the loop-exit ret): slot-search over this+0x84/0x88 stride
 *     0x30 (-1,-1)-pair scan with a this+0xc index-store tail; HOST
 *     (E8 -> 0x9c2210 unlanded; 4 direct callers 0x420670 / 0x420692 /
 *     0x420783 / 0x42078e).
 * LANDED: 0x009c06a0..0x9c075a (ret 4 @0x9c0757), thiscall, out ptr
 * [ebp+8], returns eax = out.  TWO ALWAYS-PATH indirect probes
 * call [vtbl+8] on the embedded objects this+0xc8 / this+0xf0 — the
 * consumed VALUES are the post-probe f32 fields [obj1+0]/[obj1+4]
 * (v40 recapture precedent); the probe edges stay HOST.
 *   out0 = ([obj1+0] + [this+0x48]) + g1*K1        ; g1 = BSS 0xc7997c
 *   out1 = (([obj1+4] + [this+0x4c]) + g2*K1) - K2 ; g2 = BSS 0xc79980
 * K1 = [0xbaa2d0] = 0.5f, K2 = [0xbaa804] = 9.0f (both file-backed
 * .rdata).  The machine pre-zeros out (subsumed by the unconditional
 * final stores).  Direct rel32 callers 0x420800 / 0x8403c0 (both then
 * consume eax = out).  All params uint32_t f32 bits; per-op f32
 * rounding. */
static constexpr uint32_t ISAAC_PLAYERHUD_9C06A0_VA = 0x009c06a0u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C06A0_RET_VA = 0x009c0757u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C06A0_NEXT_VA = 0x009c075au;
static constexpr uint32_t ISAAC_PLAYERHUD_9C06A0_RET_IMM = 4u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C06A0_CALLER1_VA = 0x00420800u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C06A0_CALLER2_VA = 0x008403c0u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C06A0_OBJ1_OFF = 0xc8u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C06A0_PROBE_SLOT = 2u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C06A0_PROBE_VTBL_OFF = 8u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C06A0_OBJ1_X_OFF = 0u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C06A0_OBJ1_Y_OFF = 4u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C06A0_THIS_B_OFF = 0x48u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C06A0_THIS_D_OFF = 0x4cu;
static constexpr uint32_t ISAAC_PLAYERHUD_9C06A0_OBJ2_OFF = 0xf0u;
static constexpr uint32_t ISAAC_PLAYERHUD_GLOBAL1_BSS = 0x00c7997cu;
static constexpr uint32_t ISAAC_PLAYERHUD_GLOBAL2_BSS = 0x00c79980u;
static constexpr uint32_t ISAAC_PLAYERHUD_K1_RDATA = 0x00baa2d0u;
static constexpr uint32_t ISAAC_PLAYERHUD_K1_BITS = 0x3f000000u;
static constexpr uint32_t ISAAC_PLAYERHUD_K2_RDATA = 0x00baa804u;
static constexpr uint32_t ISAAC_PLAYERHUD_K2_BITS = 0x41100000u;

#pragma pack(push, 1)
typedef struct IsaacPlayerHud9c06a0Pair {
  uint32_t out0_bits; /* f32 bits of ([obj1+0] + [this+0x48]) + g1*K1       */
  uint32_t out1_bits; /* f32 bits of (([obj1+4] + [this+0x4c]) + g2*K1) - K2 */
} IsaacPlayerHud9c06a0Pair;
#pragma pack(pop)
static_assert(sizeof(IsaacPlayerHud9c06a0Pair) == 8,
              "IsaacPlayerHud9c06a0Pair size");

/* 0x9c06a0 law: a = [obj1+0] post-probe, b = [this+0x48],
   c = [obj1+4] post-probe, d = [this+0x4c]; g1/g2 are the BSS global
   f32 bits (host-resolved inputs).  Per-op f32.  out may be null. */
void isaac_playerhud_9c06a0_law(uint32_t a_bits, uint32_t b_bits,
                                uint32_t c_bits, uint32_t d_bits,
                                uint32_t g1_bits, uint32_t g2_bits,
                                IsaacPlayerHud9c06a0Pair* out);

/* v41 census pins. */
uint32_t isaac_playerhud_9c06a0_va(void);
uint32_t isaac_playerhud_9c06a0_ret_va(void);
uint32_t isaac_playerhud_9c06a0_next_va(void);
uint32_t isaac_playerhud_9c06a0_ret_imm(void);
uint32_t isaac_playerhud_9c06a0_caller1_va(void);
uint32_t isaac_playerhud_9c06a0_caller2_va(void);
uint32_t isaac_playerhud_9c06a0_obj1_off(void);
uint32_t isaac_playerhud_9c06a0_probe_slot(void);
uint32_t isaac_playerhud_9c06a0_probe_vtbl_off(void);
uint32_t isaac_playerhud_9c06a0_obj1_x_off(void);
uint32_t isaac_playerhud_9c06a0_obj1_y_off(void);
uint32_t isaac_playerhud_9c06a0_this_b_off(void);
uint32_t isaac_playerhud_9c06a0_this_d_off(void);
uint32_t isaac_playerhud_9c06a0_obj2_off(void);
uint32_t isaac_playerhud_global1_bss(void);
uint32_t isaac_playerhud_global2_bss(void);
uint32_t isaac_playerhud_k1_rdata(void);
uint32_t isaac_playerhud_k1_bits(void);
uint32_t isaac_playerhud_k2_rdata(void);
uint32_t isaac_playerhud_k2_bits(void);

/* ---------------- ABI v42: 0x9c2210 slot-index advance machine ------
 * The v41 handoff's re-open lead: FUN_009c2210..0x9c22a4 (ret 4 @
 * 0x9c22a4), thiscall + i32 stack arg, PURE-COMPLETE — 0 E8, 0
 * indirect, 0 SEH, no globals; identify-zhl exactMatches [].  FOUR
 * direct rel32 callers: 0x009c066b (inside the giant SEH ctor),
 * 0x009c092c (the merged slot-search fn's tail), 0x009c0b67 /
 * 0x009c0b9b (inside 0x9c0a5b).
 * Machine (this+0xc = slot index i32; this+0x84/0x88 = vector
 * begin/end; stride 0x30 via magic 0x2aaaaaab imul/sar 3 ==
 * truncated s-div):
 *   orig := [this+0xc]; loop:
 *     next := arg + orig_or_esi;  [this+0xc] := next   (tentative)
 *     next < 0:  orig < 0 -> FAIL(-1); else esi := next + count
 *     esi >= count (signed jl inverse): orig < 0 -> FAIL(-1);
 *               else esi -= count
 *     esi == orig -> DONE (landing back on the start stops BEFORE
 *               any probe); [elem+8] != -1 -> DONE (occupied);
 *               else iterate with esi (head-eax stays orig).
 * Only the +8 dword gates (NOT the +0xc twin of v41's scan).  The
 * intermediate stores are unobservable (same cell overwritten before
 * return).  Probe-offset math wraps mod 2^32 like the PE lea/add
 * chain; adversarial args can run the PE loop away (documented,
 * non-terminating domain excluded from tests).  Law operates on
 * caller memory through pointers (856960_move_range precedent);
 * returns the final [this+0xc]. */
static constexpr uint32_t ISAAC_PLAYERHUD_9C2210_VA = 0x009c2210u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C2210_RET_VA = 0x009c22a4u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C2210_NEXT_VA = 0x009c22b0u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C2210_RET_IMM = 4u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C2210_INDEX_OFF = 0xcu;
static constexpr uint32_t ISAAC_PLAYERHUD_9C2210_VEC_BEGIN_OFF = 0x84u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C2210_VEC_END_OFF = 0x88u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C2210_STRIDE = 0x30u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C2210_DIV_MAGIC = 0x2aaaaaabu;
static constexpr uint32_t ISAAC_PLAYERHUD_9C2210_DIV_SHIFT = 3u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C2210_EMPTY_FLAG_OFF = 8u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C2210_EMPTY_FLAG_BITS =
    0xffffffffu;
static constexpr uint32_t ISAAC_PLAYERHUD_9C2210_FAIL_INDEX = 0xffffffffu;
static constexpr uint32_t ISAAC_PLAYERHUD_9C2210_CALLER1_VA = 0x009c066bu;
static constexpr uint32_t ISAAC_PLAYERHUD_9C2210_CALLER2_VA = 0x009c092cu;
static constexpr uint32_t ISAAC_PLAYERHUD_9C2210_CALLER3_VA = 0x009c0b67u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C2210_CALLER4_VA = 0x009c0b9bu;

/* 0x9c2210 law: full advance machine over caller memory.  index_cell
   points at the this+0xc dword; vec_begin/vec_end delimit the raw
   0x30-stride vector.  Returns the final index (-1 on fail). */
int32_t isaac_playerhud_9c2210_advance(int32_t* index_cell, int32_t arg,
                                       const uint8_t* vec_begin,
                                       const uint8_t* vec_end);

/* v42 census pins. */
uint32_t isaac_playerhud_9c2210_va(void);
uint32_t isaac_playerhud_9c2210_ret_va(void);
uint32_t isaac_playerhud_9c2210_next_va(void);
uint32_t isaac_playerhud_9c2210_ret_imm(void);
uint32_t isaac_playerhud_9c2210_index_off(void);
uint32_t isaac_playerhud_9c2210_vec_begin_off(void);
uint32_t isaac_playerhud_9c2210_vec_end_off(void);
uint32_t isaac_playerhud_9c2210_stride(void);
uint32_t isaac_playerhud_9c2210_div_magic(void);
uint32_t isaac_playerhud_9c2210_div_shift(void);
uint32_t isaac_playerhud_9c2210_empty_flag_off(void);
uint32_t isaac_playerhud_9c2210_empty_flag_bits(void);
uint32_t isaac_playerhud_9c2210_caller1_va(void);
uint32_t isaac_playerhud_9c2210_caller2_va(void);
uint32_t isaac_playerhud_9c2210_caller3_va(void);
uint32_t isaac_playerhud_9c2210_caller4_va(void);
/* ---------------- ABI v43: 0x009c0870 merged slot-search/clear -----
 * The v42 handoff's re-open lead: FUN_009c0870..0x009c0958 (ret 8;
 * three exits: loop-exhaust @0x9c08d3, post-clear @0x9c0943, shared
 * epilogue @0x9c0958), thiscall + i32 `which` [ebp+8] + byte `lane`
 * [ebp+0xc].  PURE-COMPLETE under family host-leaf conventions: the
 * SOLE E8 is the now-landed pure v42 advance (composition precedent
 * v31/v42); identify-zhl exactMatches [].  FOUR direct rel32 callers:
 * 0x00420670 / 0x00420692 / 0x00420783 / 0x0042078e.
 * Machine over the 0x30-stride vector (count = truncated s-div):
 *   scan i = 0..count-1, ordinal = 0:
 *     ([elem+8] == -1 && [elem+0xc] == -1) -> EMPTY, skip;
 *     else if (ordinal++ == which) -> FOUND at i (esi), break.
 *   exhausted/count==0 -> plain ret, nothing stored.
 *   FOUND tail (i): lane != 0: [e+8] must be -1 else plain ret;
 *       [e+8] := [e+0xc]; [e+0xc] := -1.  lane == 0 mirrors onto +0xc.
 *   re-seat [this+0xc] (cur):
 *     cur == i -> advance(this, -1) (v42 law); still i -> cur := -1;
 *     else cur == -1 && lane != 0 -> cur := i;  else untouched.
 * The mid-tail [ebx+0x84] reload reads the same begin (no observable
 * difference absent aliasing).  All params uint32/int32; pointer-law
 * precedent 9c2210_advance/856960_move_range. */
static constexpr uint32_t ISAAC_PLAYERHUD_9C0870_VA = 0x009c0870u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C0870_RET_VA = 0x009c0958u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C0870_RET_EXHAUST_VA =
    0x009c08d3u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C0870_RET_CLEARED_VA =
    0x009c0943u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C0870_NEXT_VA = 0x009c0960u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C0870_RET_IMM = 8u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C0870_INDEX_OFF = 0xcu;
static constexpr uint32_t ISAAC_PLAYERHUD_9C0870_VEC_BEGIN_OFF = 0x84u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C0870_VEC_END_OFF = 0x88u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C0870_STRIDE = 0x30u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C0870_DIV_MAGIC = 0x2aaaaaabu;
static constexpr uint32_t ISAAC_PLAYERHUD_9C0870_DIV_SHIFT = 3u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C0870_FLAG_A_OFF = 8u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C0870_FLAG_B_OFF = 0xcu;
static constexpr uint32_t ISAAC_PLAYERHUD_9C0870_EMPTY_BITS = 0xffffffffu;
static constexpr uint32_t ISAAC_PLAYERHUD_9C0870_CALLER1_VA = 0x00420670u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C0870_CALLER2_VA = 0x00420692u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C0870_CALLER3_VA = 0x00420783u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C0870_CALLER4_VA = 0x0042078eu;

/* 0x9c0870 law: full search/clear machine over caller memory,
   composing isaac_playerhud_9c2210_advance for the re-seat edge.
   Returns the final [this+0xc]. */
int32_t isaac_playerhud_9c0870_search_clear(int32_t* index_cell,
                                            int32_t which, int32_t lane,
                                            uint8_t* vec_begin,
                                            const uint8_t* vec_end);

/* v43 census pins. */
uint32_t isaac_playerhud_9c0870_va(void);
uint32_t isaac_playerhud_9c0870_ret_va(void);
uint32_t isaac_playerhud_9c0870_ret_exhaust_va(void);
uint32_t isaac_playerhud_9c0870_ret_cleared_va(void);
uint32_t isaac_playerhud_9c0870_next_va(void);
uint32_t isaac_playerhud_9c0870_ret_imm(void);
uint32_t isaac_playerhud_9c0870_index_off(void);
uint32_t isaac_playerhud_9c0870_vec_begin_off(void);
uint32_t isaac_playerhud_9c0870_vec_end_off(void);
uint32_t isaac_playerhud_9c0870_stride(void);
uint32_t isaac_playerhud_9c0870_div_magic(void);
uint32_t isaac_playerhud_9c0870_div_shift(void);
uint32_t isaac_playerhud_9c0870_flag_a_off(void);
uint32_t isaac_playerhud_9c0870_flag_b_off(void);
uint32_t isaac_playerhud_9c0870_empty_bits(void);
uint32_t isaac_playerhud_9c0870_caller1_va(void);
uint32_t isaac_playerhud_9c0870_caller2_va(void);
uint32_t isaac_playerhud_9c0870_caller3_va(void);
uint32_t isaac_playerhud_9c0870_caller4_va(void);
/* ---------------- ABI v44: 0x009c2370 probe-threshold gate ----------
 * Band census (0x009c2360 onward, max 2 bodies):
 *   #1 0x009c2370..0x009c2391 LANDED below;
 *   #2 0x009c23a0.. HOST (QPC clock 0xa68490 + magic-mul tick stamp,
 *      sibling of the landed-host 0x9c22d0).
 * FUN_009c2370 (ret @0x9c2390, thiscall, no stack args): ALWAYS-PATH
 * indirect probe [[ecx]+0x10] = vtbl slot 4, float returned in st0
 * (recapture input f_bits — v39 pow-probe / v40 lerp precedent);
 * then comiss vs [0xbaa454]=1.0f + setae: returns 1 iff ORDERED
 * f >= 1.0f (NaN unordered -> CF=1 -> 0).  ZERO E8 callers;
 * address-taken ONLY via .rdata vtable dwords 0xb7ed2c / 0xb7ed44 —
 * adjacent slots of the SAME class neighborhood as the v40 lerp
 * visitors (0xb7ed28/0xb7ed40): exactly the v40 NARROWED verify-open
 * class.  identify-zhl exactMatches []. */
static constexpr uint32_t ISAAC_PLAYERHUD_9C2370_VA = 0x009c2370u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C2370_RET_VA = 0x009c2390u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C2370_NEXT_VA = 0x009c23a0u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C2370_PROBE_SLOT = 4u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C2370_PROBE_VTBL_OFF = 0x10u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C2370_VTABLE_REF_RDATA_A =
    0x00b7ed2cu;
static constexpr uint32_t ISAAC_PLAYERHUD_9C2370_VTABLE_REF_RDATA_B =
    0x00b7ed44u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C2370_GATE_RDATA = 0x00baa454u;
static constexpr uint32_t ISAAC_PLAYERHUD_9C2370_GATE_BITS = 0x3f800000u;

/* 0x9c2370 law: 1 iff ordered f32(f_bits) >= 1.0f (comiss/setae;
   NaN -> 0).  The probe edge stays HOST; f_bits is the recapture. */
uint32_t isaac_playerhud_9c2370_gate(uint32_t f_bits);

/* v44 census pins. */
uint32_t isaac_playerhud_9c2370_va(void);
uint32_t isaac_playerhud_9c2370_ret_va(void);
uint32_t isaac_playerhud_9c2370_next_va(void);
uint32_t isaac_playerhud_9c2370_probe_slot(void);
uint32_t isaac_playerhud_9c2370_probe_vtbl_off(void);
uint32_t isaac_playerhud_9c2370_vtable_ref_rdata_a(void);
uint32_t isaac_playerhud_9c2370_vtable_ref_rdata_b(void);
uint32_t isaac_playerhud_9c2370_gate_rdata(void);
uint32_t isaac_playerhud_9c2370_gate_bits(void);



uint32_t isaac_playerhud_post_update_pure_helpers_abi_version(void);

int16_t isaac_playerhud_critical_heart_blink(int32_t hearts_sum, uint32_t player_flag_1519, int32_t tramp_suppress, int32_t frame_counter_264f8);
#ifdef __cplusplus
}
#endif
