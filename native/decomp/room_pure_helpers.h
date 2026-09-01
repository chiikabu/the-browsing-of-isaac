#pragma once

#include <stddef.h>
#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

/* Reconstructed from intact room_pure_helpers.cpp + room-pure-model.mjs.
   ABI 85. Do not peel. Not a Read-tool dump. */

enum { ISAAC_ROOM_PURE_HELPERS_ABI_VERSION = 88 };

/* v54 — FUN_00428b20 (B15 rain spawn relay; also prefix B1/B2/B4 + tail B20
   spawn path) pure stdcall arg-relayout law. PE bytes at 0x00428b20: 8
   pushes (0, a7..a1 in R->L) then call 0x006fe410; ret 0x1c = 7 dword args;
   ecx untouched (relayed thiscall receiver). */
static constexpr uint32_t ISAAC_ROOM_SPAWN_428B20_VA = 0x00428b20u;
static constexpr uint32_t ISAAC_ROOM_SPAWN_428B20_RET_VA = 0x00428b45u;
static constexpr uint32_t ISAAC_ROOM_SPAWN_428B20_END_VA = 0x00428b48u;
static constexpr uint32_t ISAAC_ROOM_SPAWN_428B20_CALL_VA = 0x00428b3du;
static constexpr uint32_t ISAAC_ROOM_SPAWN_428B20_CALLEE_VA = 0x006fe410u;
static constexpr int32_t ISAAC_ROOM_SPAWN_428B20_ARITY = 7;
static constexpr int32_t ISAAC_ROOM_SPAWN_428B20_FRAME_DEPTH = 8;
static constexpr int32_t ISAAC_ROOM_SPAWN_428B20_LEADING_ZERO = 0;

/* v55 — B15 rain shuffle/spawn loop CF (0x00802c20..0x00802e0d) + spawn-site
   arg provenance (0x00802daf..0x00802dc4). PE listings cpu-dump/00802a80.txt
   (loop-head half) + cpu-dump/00802c80.txt (rain tail). Fisher-Yates over
   0x78-byte buffer slots; seed carried across iterations in esi (first seed
   loaded @0x00802bf0 from quality_ptr+0x58); two xorshift steps per
   iteration; spawn relay FUN_00428b20 (v54) fed from slot fields + the host
   0x00813520 search result; FUN_007ef420 bind stays host. */
static constexpr uint32_t ISAAC_ROOM_B15_RAIN_LOOP_HEAD_VA = 0x00802c20u;
static constexpr uint32_t ISAAC_ROOM_B15_RAIN_LOOP_EXIT_VA = 0x00802e0du;
static constexpr uint32_t ISAAC_ROOM_B15_RAIN_SPAWN_SITE_VA = 0x00802dc4u;
static constexpr uint32_t ISAAC_ROOM_B15_RAIN_BIND_SITE_VA = 0x00802dd5u;
static constexpr uint32_t ISAAC_ROOM_B15_RAIN_POSITION_SITE_VA = 0x00802da4u;
static constexpr uint32_t ISAAC_ROOM_B15_RAIN_SEED_LOAD_VA = 0x00802bf0u;
static constexpr int32_t ISAAC_ROOM_B15_RAIN_STRIDE = 0x78;
static constexpr uint32_t ISAAC_ROOM_B15_RAIN_LOOP_MAX_STEPS = 8u;
static constexpr uint32_t ISAAC_ROOM_B15_RAIN_POS_VEC_PTR = 0x00c7b640u;
static constexpr uint32_t ISAAC_ROOM_B15_RAIN_GAME_GLOBAL = 0x00c71678u;
static constexpr uint32_t ISAAC_ROOM_B15_RAIN_SLOT_FIELD_34_OFF = 0x34u;
static constexpr uint32_t ISAAC_ROOM_B15_RAIN_ENTITY_MARK_FIELD = 0x32cu;
static constexpr uint32_t ISAAC_ROOM_B15_RAIN_ENTITY_MARK_VALUE = 0xffffffffu;
static constexpr uint32_t ISAAC_ROOM_B15_RAIN_HOST_VA_BIND = 0x007ef420u;
/* v56: 0x007ef420 bind pure-law constants (PE 0x7ef420..0x7ef697, ret 8).
   type-5 path 0x7ef4e5..0x7ef697; host calls stay host (position re-derive
   0x81e9d0+0x813520, attach 0x6e2570/0x6e21f0/0x6e1a80/0x6e17c0/0x4d74a0,
   ANM2::Reset 0x407f10). .data constants: scale pair @0xc3793c/0xc37940 =
   1.0f (0x3f800000, verified via section table); pos-vec 0xc7b640/0xc7b644
   is a runtime-writable zero-filled .data-tail global. */
static constexpr uint32_t ISAAC_ROOM_B15_BIND_VA = 0x007ef420u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_RET_VA = 0x007ef697u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TYPE5_HEAD_VA = 0x007ef4e5u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_POS_VEC_VA = 0x00c7b640u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_SCALE_X_VA = 0x00c3793cu;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_SCALE_Y_VA = 0x00c37940u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_SCALE_X_BITS = 0x3f800000u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_SCALE_Y_BITS = 0x3f800000u;
static constexpr int32_t ISAAC_ROOM_B15_BIND_CLAMP_MIN = -2;
static constexpr int32_t ISAAC_ROOM_B15_BIND_CLAMP_MAX = 7;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_SUB_COUNT_OFF = 0x5c0u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_SUB_LIST_OFF = 0x5a0u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_SUB_MAX = 8u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_SUB_STRIDE = 4u;
/* v57: the [ebx+0x64] sub-list copy law (PE 0x7ef5d5..0x7ef60f): ptr==0 ->
   count untouched; else count:=0 then 8-iteration stride-4 loop, entry==0
   breaks, count<8 (jae cap) stores dst[0x5a0+count*4]=entry, count++. */
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TAIL_FLAG_OFF = 0x168u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TAIL_FLAG_BIT = 0x40000u;
/* v58: the type-5 attach config store-pack relayout law (PE
   0x7ef4a2..0x7ef5d5). Pure register->field stores in PE order: COMMON
   (before the type gate): src0x38->dst0x3dc, qword const
   {lo 4, hi 3}@0xb1f630->dst0x3e0, dword const 0x11@0xb1f638->dst0x3e8,
   sxw(src0x20)->dst0x32c, src0x58->dst0x404. TYPE-5 (iff [edi+0x28]==5):
   (gated src8!=0) src0x10->dst0x524, byte src0x60->dst0x538,
   clamp(src0x18)->dst0x53c, byte src0x22->dst0x52c, src0x24->dst0x588,
   (gated src0x24 not in {0,-1}) dst0x5c0=0, src0x30->dst0x528,
   src0x3c->dst0x34, src0x40->dst0x38, src0x1c->dst0x540, scale pair
   src0x54 (mulss 1.0f both) -> dst0xe4 X / dst0xe8 Y, byte
   src0x23->dst0x52e (NEW), src0x5c->dst0x59c, src0x50->dst0x530. Host
   calls stay host: A 0x6e2570 (arg src0x14) @0x7ef4f9, B 0x6e21f0
   (arg 0, CONDITIONAL [edi+0x2c]==0x64 && [edi+0x30]!=0 && old52e !=
   new52e) @0x7ef5b4, C 0x6e1a80 (arg src0xc) @0x7ef5be. */
static constexpr uint32_t ISAAC_ROOM_B15_BIND_STORE_PACK_VA = 0x007ef4a2u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_STORE_TYPE5_HEAD_VA = 0x007ef4e5u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_STORE_SUB_LIST_VA = 0x007ef5d5u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_STORE_QWORD_CONST_VA = 0x00b1f630u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_STORE_DWORD_CONST_VA = 0x00b1f638u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_STORE_QWORD_LO = 0x4u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_STORE_QWORD_HI = 0x3u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_STORE_DWORD_CONST = 0x11u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_STORE_HOST_A_VA = 0x006e2570u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_STORE_HOST_B_VA = 0x006e21f0u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_STORE_HOST_C_VA = 0x006e1a80u;
static constexpr int32_t ISAAC_ROOM_B15_BIND_STORE_TYPE5 = 5;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_GAME_18304_EXPECT = 0xfffffff4u; /* -0xc */
static constexpr uint32_t ISAAC_ROOM_B15_BIND_GAME_269E9_OFF = 0x269e9u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_RECV_7764_OFF = 0x7764u;
static constexpr uint32_t ISAAC_ROOM_B15_RAIN_HOST_VA_POSITION = 0x00813520u;
static constexpr int32_t ISAAC_ROOM_B15_RAIN_SEED_FATAL_PRE_CORNER = 2;
static constexpr int32_t ISAAC_ROOM_B15_RAIN_SEED_FATAL_PRE_SHUFFLE = 1;
static constexpr int32_t ISAAC_ROOM_B15_RAIN_SEED_OK = 0;
/* v59: type-6 dispatch tail (PE 0x7ef69a..0x7ef6c7, ret 8) + the 0x6c-stride
   ANM2 chain (PE 0x7ef611..0x7ef62f, falls into the v56 tail-gate epilogue
   at 0x7ef630). Pure laws: the chain's add-ebx,0x6c stride (u32 wrap) + the
   cmp [ebx],0 / je conditional-skip decision (FULL dword); and the type-6
   body's unconditional [edi+0x420]=[ebx+0xc] store + the [edi+0x2c]==0xa
   GATED [edi+0x424]=[ebx+0x10] store (cmp ZF survives the intervening
   mov/mov — the 0x420 store is NOT gated). Host calls stay host: chain A
   0x4d74a0 (this edi+0x5c8, arg post-add ebx), chain B ANM2::Reset 0x407f10
   (this edi+0x5d0), type-6 D 0x665500 (arg [ebx+0x30], this edi). */
static constexpr uint32_t ISAAC_ROOM_B15_BIND_CHAIN_VA = 0x007ef611u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_CHAIN_EPILOGUE_VA = 0x007ef630u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_CHAIN_STRIDE = 0x6cu;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_CHAIN_THIS_A_OFF = 0x5c8u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_CHAIN_THIS_B_OFF = 0x5d0u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_CHAIN_HOST_A_VA = 0x004d74a0u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_CHAIN_HOST_B_VA = 0x00407f10u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TYPE6_VA = 0x007ef69au;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TYPE6_RET_VA = 0x007ef6c7u;
static constexpr int32_t ISAAC_ROOM_B15_BIND_TYPE6 = 6;
static constexpr int32_t ISAAC_ROOM_B15_BIND_TYPE6_FIELD_2C_GATE = 0xa;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TYPE6_HOST_D_VA = 0x00665500u;
/* v60: type-1000 dispatch head (PE 0x7ef6ca..0x7ef817, INSIDE FUN_007ef420
   after the v59 type-6 tail). cmp esi,0x3e8 FULL-dword type gate; jne ->
   NEXT dispatch 0x7ef817 (types 0x21/0x124/4/0x11/0x38b, still host).
   [edi+0x2c] mode gate: POS set {0x15,0x21,0x3f,0x40,0x41,0x45,0x9e} ->
   position-model path 0x7ef745 (reads Game->[0x18300]+{0x14,0x18,0x1c,
   0x20} f32s, 2 HOST genrand 0x6eef60, u32->f32 via the 0xbacb00
   sign-add table, mulss 2^-32 scale @0xba9ff4 = 0x2f800000, lerp
   x=dst0x33c / y=dst0x340); mode 0x44 -> INDIRECT vtable call
   [eax+0xc] (eax=[edi], ecx=edi, 1 indirect call — stays host) then ret 8;
   mode 0x74 -> shared store 0x7ef733 dst0x450=src.f0c; mode 0x78 -> dst
   0x420=src.f18 + dst0x424=src.f10 then FALLS INTO 0x7ef733 dst0x450=
   src.f0c; default (none of the above) -> jne 0x7efa3d common epilogue,
   no stores. Game global 0xc71678 + Game+0x18300 are runtime pointers
   (blob-gated: host supplies the 4 f32 bits). */
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TYPE1000_VA = 0x007ef6cau;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TYPE1000_NEXT_VA = 0x007ef817u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TYPE1000_DEFAULT_VA = 0x007efa3du;
static constexpr int32_t ISAAC_ROOM_B15_BIND_TYPE1000_TYPE = 0x3e8;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TYPE1000_POS_VA = 0x007ef745u;
static constexpr int32_t ISAAC_ROOM_B15_BIND_TYPE1000_POS_A = 0x15;
static constexpr int32_t ISAAC_ROOM_B15_BIND_TYPE1000_POS_B = 0x21;
static constexpr int32_t ISAAC_ROOM_B15_BIND_TYPE1000_POS_C = 0x3f;
static constexpr int32_t ISAAC_ROOM_B15_BIND_TYPE1000_POS_D = 0x40;
static constexpr int32_t ISAAC_ROOM_B15_BIND_TYPE1000_POS_E = 0x41;
static constexpr int32_t ISAAC_ROOM_B15_BIND_TYPE1000_POS_F = 0x45;
static constexpr int32_t ISAAC_ROOM_B15_BIND_TYPE1000_POS_G = 0x9e;
static constexpr int32_t ISAAC_ROOM_B15_BIND_TYPE1000_MODE_44 = 0x44;
static constexpr int32_t ISAAC_ROOM_B15_BIND_TYPE1000_MODE_74 = 0x74;
static constexpr int32_t ISAAC_ROOM_B15_BIND_TYPE1000_MODE_78 = 0x78;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TYPE1000_VTABLE_SLOT = 0xcu;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TYPE1000_GENRAND_VA = 0x006eef60u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TYPE1000_SCALE_VA = 0x00ba9ff4u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TYPE1000_SCALE_BITS = 0x2f800000u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TYPE1000_SIGN_TABLE_VA = 0x00bacb00u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TYPE1000_GAME_GLOBAL = 0x00c71678u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TYPE1000_GAME_18300_OFF = 0x18300u;
/* v61: B15 bind dispatch tail (PE 0x7ef817..0x7efa43, INSIDE FUN_007ef420
   after the v60 type-1000 head, ret 8 variants). Type dispatch, FULL
   dword each: 0x21/0x124 -> 0x7efa1a (dst 0x380 = f32(u32 src.f0c), pure,
   no host); 4 -> 0x7ef835 12-store pack (pure) then the HOST chain
   0x417870 -> 0x4cf210 (gated on [this+0x3c8]!=0) -> [this+0x3c8]=result
   -> 0x4cdcf0 (gated result!=0); other -> 0x7ef924 HOST gate 0x6ac530
   then 0x11/0x38b -> DEFAULT, else dst 0x380=src.f50 + f18 SIGNED gate ->
   HOST 0x6d03e0 / 0xa10600 / 0x812d00 / 0x813520 / 0x67f070 (vec ptr)
   + HOST genrand 0x6eef60 + PURE lerp 0x7ef9b4 (unit =
   f32(u32)*2^-32, X=[esp+0x20] base + unit*vec[0]*20.0f -> 0x33c, Y=
   [esp+0x24] base + unit*vec[1]*20.0f -> 0x340; 20.0f @0xbaa87c).
   Chain count = (Game[0x1baac]-Game[0x1baa8])>>2 (u32 wrap + SAR);
   chain arg = UNSIGNED (uint32)edx < (uint32)count ? edx : 0 where edx =
   sign-extended (int8)f60. Game ptr 0xc71678 blob-gated. */
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TAIL_VA = 0x007ef817u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TAIL_PACK_VA = 0x007ef835u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TAIL_OTHER_VA = 0x007ef924u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TAIL_V21_VA = 0x007efa1au;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TAIL_DEFAULT_VA = 0x007efa3du;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TAIL_LERP_VA = 0x007ef9b4u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TAIL_RET_VA = 0x007efa17u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TAIL_TYPE4_RET_VA = 0x007ef921u;
static constexpr int32_t ISAAC_ROOM_B15_BIND_TAIL_TYPE_21 = 0x21;
static constexpr int32_t ISAAC_ROOM_B15_BIND_TAIL_TYPE_124 = 0x124;
static constexpr int32_t ISAAC_ROOM_B15_BIND_TAIL_TYPE_4 = 4;
static constexpr int32_t ISAAC_ROOM_B15_BIND_TAIL_TYPE_11 = 0x11;
static constexpr int32_t ISAAC_ROOM_B15_BIND_TAIL_TYPE_38B = 0x38b;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TAIL_CHAIN_HOST_VA = 0x00417870u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TAIL_SUBCALL_VA = 0x004cf210u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TAIL_SUBCALL_THIS_OFF = 0x3ccu;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TAIL_CHAIN_THIS_OFF = 0x3c8u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TAIL_FINAL_VA = 0x004cdcf0u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TAIL_GATE_VA = 0x006ac530u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TAIL_6D03E0_VA = 0x006d03e0u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TAIL_A10600_VA = 0x00a10600u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TAIL_A10600_ARG = 0x00c7b640u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TAIL_A10600_THIS_OFF = 0x28u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TAIL_812D00_VA = 0x00812d00u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TAIL_813520_VA = 0x00813520u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TAIL_67F070_VA = 0x0067f070u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TAIL_GENRAND_VA = 0x006eef60u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TAIL_SCALE20_VA = 0x00baa87cu;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TAIL_SCALE20_BITS = 0x41a00000u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TAIL_GAME_GLOBAL = 0x00c71678u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TAIL_GAME_COUNT_LO_OFF = 0x1baa8u;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TAIL_GAME_COUNT_HI_OFF = 0x1baacu;
static constexpr uint32_t ISAAC_ROOM_B15_BIND_TAIL_F80_BITS = 0x42a00000u;
/* v62: FUN_007efa50 (Room::Update-style body 0x7efa50..0x7eff48, callers
   0x6f92f4/0x6fe0b9/0x6fe0da/0x73fceb LIVE; next 0x7eff50 = Room::
   RestoreState). RESTOCK GATE (SIGNED jle) -> STAGE/SLOT gates (FULL-dword
   -3 / FULL-dword 0) -> BOMB BLOCK (UNSIGNED ja (u32)(f11ec-1) > 7 skip,
   byte bit0 gate; pure stores [esi+0x11ec]=0, [this4+0x44]|=1 DWORD, word
   [this4+0x4a]++ 16-bit) + HOST args 0x9e5960 (this Game+0x266e4) ->
   HOST 0x6f8120 greed (fresh call each time) -> HOST 0x9bb840 (fired iff
   greed1==0 || this_f8!=1; this Game+0x1baa8) -> HOST 0x7fb250 (this=esi,
   unconditional in bomb block) -> PURE store [Game+0x18368]=[Game+0x18334]
   (iff greed2!=0 && this_f8==1) -> HOST 0x571170 (this=this4+0x74,
   unconditional when stage/slot pass) -> GRID COPY (total = SIGNED imul
   (int32)[esi+0xc]*(int32)[esi+0x10] 32-bit wrap, RE-derived per iter;
   SIGNED jle/jl; src array [esi+0x24] stride 4 -> dst [[esi+4]+0x68] byte
   off stride 0x20; src==0 -> default slot: [0..16)=0, [16..20)=0x16a9de81,
   [20..24)=0, byte[24]=0, bytes[25..27]=garbage bits 8..31, [28..32)=
   0x16a9de81; default slot 32B) -> ENTITY WALK (count [esi+0x1264]
   UNSIGNED jbe skip; list [[esi+0x125c]+i*4]; path_a = FULL-dword
   type==0x3c5 && subtype==0; config templates @0xbacc80 magic16 + pos vec
   @0xc7b640 + 60.0f 0x42700000 + 1.0f; host 0x7eeeb0 x3, vector push
   0x4d3130/0x4d7530 stride 0x78, indirect vtable slot 0xc, globals
   0xc7e84c/0xc7e850; loop UNSIGNED jb + next index). */
static constexpr uint32_t ISAAC_ROOM_706C_HEAD_VA = 0x007efa50u;
static constexpr uint32_t ISAAC_ROOM_706C_HEAD_RET_VA = 0x007eff48u;
static constexpr uint32_t ISAAC_ROOM_706C_RESTOCK_HOST_VA = 0x008158a0u;
static constexpr uint32_t ISAAC_ROOM_706C_9E5960_VA = 0x009e5960u;
static constexpr uint32_t ISAAC_ROOM_706C_9E5960_THIS_OFF = 0x266e4u;
static constexpr uint32_t ISAAC_ROOM_706C_GREED_VA = 0x006f8120u;
static constexpr uint32_t ISAAC_ROOM_706C_9BB840_VA = 0x009bb840u;
static constexpr uint32_t ISAAC_ROOM_706C_9BB840_THIS_OFF = 0x1baa8u;
static constexpr uint32_t ISAAC_ROOM_706C_7FB250_VA = 0x007fb250u;
static constexpr uint32_t ISAAC_ROOM_706C_571170_VA = 0x00571170u;
static constexpr uint32_t ISAAC_ROOM_706C_571170_THIS_OFF = 0x74u;
static constexpr uint32_t ISAAC_ROOM_706C_GAME_GLOBAL = 0x00c71678u;
static constexpr int32_t ISAAC_ROOM_706C_STAGE_EXPECT = -3;
static constexpr int32_t ISAAC_ROOM_706C_WALK_TYPE_GATE = 0x3c5;
static constexpr int32_t ISAAC_ROOM_706C_WALK_SUB_GATE = 0;
static constexpr uint32_t ISAAC_ROOM_706C_F706C_OFF = 0x706cu;
static constexpr uint32_t ISAAC_ROOM_706C_F11EC_OFF = 0x11ecu;
static constexpr uint32_t ISAAC_ROOM_706C_N44_OFF = 0x44u;
static constexpr uint32_t ISAAC_ROOM_706C_N4A_OFF = 0x4au;
static constexpr uint32_t ISAAC_ROOM_706C_BOMB_TIMER_MAX = 7u;
static constexpr uint32_t ISAAC_ROOM_706C_GRID_STRIDE = 0x20u;
static constexpr uint32_t ISAAC_ROOM_706C_GRID_SRC_OFF = 0x24u;
static constexpr uint32_t ISAAC_ROOM_706C_GRID_DST_OFF = 0x68u;
static constexpr uint32_t ISAAC_ROOM_706C_GRID_MAGIC = 0x16a9de81u;
static constexpr uint32_t ISAAC_ROOM_706C_GRID_SLOT_SIZE = 0x20u;
static constexpr uint32_t ISAAC_ROOM_706C_WALK_MAGIC16_0 = 0u;
static constexpr uint32_t ISAAC_ROOM_706C_WALK_MAGIC16_1 = 0u;
static constexpr uint32_t ISAAC_ROOM_706C_WALK_MAGIC16_2 = 0xffffffffu;
static constexpr uint32_t ISAAC_ROOM_706C_WALK_MAGIC16_3 = 0xffffffffu;
static constexpr uint32_t ISAAC_ROOM_706C_WALK_POS_VEC_VA = 0x00c7b640u;
static constexpr uint32_t ISAAC_ROOM_706C_WALK_F60_BITS = 0x42700000u;
static constexpr uint32_t ISAAC_ROOM_706C_WALK_F1_BITS = 0x3f800000u;
static constexpr uint32_t ISAAC_ROOM_706C_WALK_HOST_7EEEB0_VA = 0x007eeeb0u;
static constexpr uint32_t ISAAC_ROOM_706C_WALK_VEC_CTOR_VA = 0x004d3130u;
static constexpr uint32_t ISAAC_ROOM_706C_WALK_VEC_GROW_VA = 0x004d7530u;
static constexpr uint32_t ISAAC_ROOM_706C_WALK_VEC_STRIDE = 0x78u;
static constexpr uint32_t ISAAC_ROOM_706C_WALK_VEC_LIST_OFF = 0x78u;
static constexpr uint32_t ISAAC_ROOM_706C_WALK_VEC_END_OFF = 0x7cu;
static constexpr uint32_t ISAAC_ROOM_706C_WALK_VEC_HEAD_OFF = 0x74u;
static constexpr uint32_t ISAAC_ROOM_706C_WALK_VTABLE_SLOT = 0xcu;
static constexpr uint32_t ISAAC_ROOM_706C_WALK_GLOBAL_A = 0x00c7e84cu;
static constexpr uint32_t ISAAC_ROOM_706C_WALK_GLOBAL_B = 0x00c7e850u;
static constexpr uint32_t ISAAC_ROOM_706C_WALK_TYPE_OFF = 0x28u;
static constexpr uint32_t ISAAC_ROOM_706C_WALK_SUB_OFF = 0x2cu;
static constexpr uint32_t ISAAC_ROOM_706C_WALK_F3C0_OFF = 0x3c0u;
static constexpr uint32_t ISAAC_ROOM_706C_WALK_LIST_BASE_OFF = 0x125cu;
static constexpr uint32_t ISAAC_ROOM_706C_WALK_COUNT_OFF = 0x1264u;
static constexpr uint32_t ISAAC_ROOM_706C_WALK_STRIDE = 4u;
/* v63: FUN_007eff50 Room::RestoreState (PE 0x7eff50..0x7f01b8, 2 rets
   0x7f01aa/0x7f01b8, 9 E8, 1 indirect; identify-zhl EXACT "__thiscall
   void Room::RestoreState()"; next body 0x7f01c0). COUNTER GUARD:
   entry [0xc71674]=c+1, both exits net-restore c (normal = memory dec,
   early = dec of the entry-inc ecx). LIST1 WALK (stride 0x78,
   begin/end = [f4+0x74]/[f4+0x78], f4=[this+4]): PURE pointer
   iteration — continue iff next_ptr!=end (EQUALITY jne), next_ptr=
   cur_ptr+0x78 u32 wrap, saved_ptr=cur_ptr+0x28 ([esp+0x10]); path_a
   = FULL-dword cur.f0==0x3c5 && cur.f4==0; PATH_A host 0x6fe410
   (this=Game 0xc71678, a1=next.f0 a2=next.f4 a3=next+0x28 a4=0xc7b640
   a5=0 a6=cur.f80 a7=cur.fac a8=0 — the ADVANCED element!) then HOST
   0x7ef420 (this=room, result, next) + FLOAT: localA = f32(cur.f50)*
   deg2rad (0x3c8efa35 @0xbaa088 — NOT 22.5f, PE bytes verified),
   HOST cos 0x41d540 / HOST sin 0x41d520 (arg localA) -> velocity
   {cosR@0x18, sinR@0x1c}; idiv (SIGNED, movsx int16 cur.w20 / (int32)
   room.f0c) -> quot/rem; localD = f32(rem)*40.0f+40.0f (0xbaa904),
   localE = f32(quot)*40.0f+120.0f (0xbaaa00) -> position {localD@0x20,
   localE@0x24}; HOST 0x6b7be0 GiveMinecart (this=create result,
   position=&localD, velocity=&cosR). PATH_B host 0x6fe410 (a1=cur.f0
   a2=cur.f4 a3=cur+0x28 a4=0xc7b640 a5=0 a6=cur.f8 a7=cur.f34 a8=0)
   then HOST 0x7ef420 (this=room, result, cur); NO float. LIST2 CLEAR:
   dtor 0x4d6ee0 (this=begin+k*0x78) while begin!=end; store
   [f4+0x78]=begin (begin RE-READ). GATES: fire iff f4.f0==-10 FULL
   dword && Game.f0==8 && byte bit0 [f4+0x44]; else early ret 0x7f01b8.
   GRID FIX: outer/inner fire iff SIGNED (s32)(rows-1)>1 / (s32)
   (cols-1)>1 (rows/cols RE-read per iter); per-cell guards (signed
   i/j bounds, index=cols*i+j SIGNED imul+add wrap with js guard,
   src!=0, src.f4==0xf, (u32)target<=0x1bf UNSIGNED ja, dst!=0,
   dst.f4!=1); FIRE [grid+target*4+0x76c]=0x384, [grid+target*4]=0,
   INDIRECT [dst] vtable slot 0 (dst, arg 1); continue_i/j SIGNED jl.
   LOOP8: 8 HOST 0x8167e0 (this=room, arg=k) k=0..7, gate UNSIGNED jb
   ((u32)(k+1)<8). */
static constexpr uint32_t ISAAC_ROOM_RESTORE_VA = 0x007eff50u;
static constexpr uint32_t ISAAC_ROOM_RESTORE_RET_VA = 0x007f01aau;
static constexpr uint32_t ISAAC_ROOM_RESTORE_RET_EARLY_VA = 0x007f01b8u;
static constexpr uint32_t ISAAC_ROOM_RESTORE_NEXT_VA = 0x007f01c0u;
static constexpr uint32_t ISAAC_ROOM_RESTORE_COUNTER_GLOBAL_VA = 0x00c71674u;
static constexpr uint32_t ISAAC_ROOM_RESTORE_GAME_GLOBAL = 0x00c71678u;
static constexpr uint32_t ISAAC_ROOM_RESTORE_CREATE_HOST_VA = 0x006fe410u;
static constexpr uint32_t ISAAC_ROOM_RESTORE_BIND_HOST_VA = 0x007ef420u;
static constexpr uint32_t ISAAC_ROOM_RESTORE_COS_HOST_VA = 0x0041d540u;
static constexpr uint32_t ISAAC_ROOM_RESTORE_SIN_HOST_VA = 0x0041d520u;
static constexpr uint32_t ISAAC_ROOM_RESTORE_MINECART_HOST_VA = 0x006b7be0u;
static constexpr uint32_t ISAAC_ROOM_RESTORE_DTOR_HOST_VA = 0x004d6ee0u;
static constexpr uint32_t ISAAC_ROOM_RESTORE_LOOP8_HOST_VA = 0x008167e0u;
static constexpr uint32_t ISAAC_ROOM_RESTORE_POS_VEC_VA = 0x00c7b640u;
static constexpr uint32_t ISAAC_ROOM_RESTORE_DEG2RAD_BITS = 0x3c8efa35u;
static constexpr uint32_t ISAAC_ROOM_RESTORE_DEG2RAD_VA = 0x00baa088u;
static constexpr uint32_t ISAAC_ROOM_RESTORE_F40_BITS = 0x42200000u;
static constexpr uint32_t ISAAC_ROOM_RESTORE_F40_VA = 0x00baa904u;
static constexpr uint32_t ISAAC_ROOM_RESTORE_F120_BITS = 0x42f00000u;
static constexpr uint32_t ISAAC_ROOM_RESTORE_F120_VA = 0x00baaa00u;
static constexpr uint32_t ISAAC_ROOM_RESTORE_LIST_STRIDE = 0x78u;
static constexpr uint32_t ISAAC_ROOM_RESTORE_LIST_BEGIN_OFF = 0x74u;
static constexpr uint32_t ISAAC_ROOM_RESTORE_LIST_END_OFF = 0x78u;
static constexpr int32_t ISAAC_ROOM_RESTORE_WALK_TYPE_GATE = 0x3c5;
static constexpr int32_t ISAAC_ROOM_RESTORE_WALK_SUB_GATE = 0;
static constexpr uint32_t ISAAC_ROOM_RESTORE_CREATE_ARITY = 8u;
static constexpr uint32_t ISAAC_ROOM_RESTORE_VEL_BASE_OFF = 0x18u;
static constexpr uint32_t ISAAC_ROOM_RESTORE_POS_BASE_OFF = 0x20u;
static constexpr int32_t ISAAC_ROOM_RESTORE_F4_0_EXPECT = -10;
static constexpr int32_t ISAAC_ROOM_RESTORE_GAME_0_EXPECT = 8;
static constexpr uint32_t ISAAC_ROOM_RESTORE_F4_44_OFF = 0x44u;
static constexpr uint32_t ISAAC_ROOM_RESTORE_F4_44_BIT = 1u;
static constexpr uint32_t ISAAC_ROOM_RESTORE_GRID_HEAD_VA = 0x007f0106u;
static constexpr uint32_t ISAAC_ROOM_RESTORE_GRID_DONE_VA = 0x007f018du;
static constexpr uint32_t ISAAC_ROOM_RESTORE_GRID_BASE_OFF = 0x24u;
static constexpr uint32_t ISAAC_ROOM_RESTORE_GRID_CELL_STRIDE = 4u;
static constexpr uint32_t ISAAC_ROOM_RESTORE_GRID_TYPE_EXPECT = 0xfu;
static constexpr uint32_t ISAAC_ROOM_RESTORE_GRID_TARGET_MAX = 0x1bfu;
static constexpr uint32_t ISAAC_ROOM_RESTORE_GRID_F76C_OFF = 0x76cu;
static constexpr uint32_t ISAAC_ROOM_RESTORE_GRID_F76C_VALUE = 0x384u;
static constexpr uint32_t ISAAC_ROOM_RESTORE_GRID_VTABLE_SLOT = 0u;
static constexpr uint32_t ISAAC_ROOM_RESTORE_LOOP8_COUNT = 8u;

static constexpr uint32_t ISAAC_ROOM_7230_DOOR_DIST2_BITS = 0x45992000u;
static constexpr uint32_t ISAAC_ROOM_7230_DOOR_DIST2_LIMIT_BITS = 0x45992000u;
static constexpr uint32_t ISAAC_ROOM_7230_DOOR_DIST2_VA = 0x00baac18u;
static constexpr int32_t ISAAC_ROOM_7230_DOOR_PLAN_MONOLITHIC = 2;
static constexpr int32_t ISAAC_ROOM_7230_DOOR_PLAN_NONE = 0;
static constexpr int32_t ISAAC_ROOM_7230_DOOR_PLAN_RECURSE = 1;
static constexpr int32_t ISAAC_ROOM_7230_DOOR_RECURSE_ARG4 = 0;
static constexpr int32_t ISAAC_ROOM_7230_DOOR_RECURSE_ARG5 = 0;
static constexpr int32_t ISAAC_ROOM_7230_DOOR_RECURSE_ARG6 = 0;
static constexpr int32_t ISAAC_ROOM_7230_DOOR_RECURSE_BUDGET = 0x14;
static constexpr uint32_t ISAAC_ROOM_7230_DOOR_RECURSE_CALL_VA = 0x00813a99u;
static constexpr uint32_t ISAAC_ROOM_7230_DOOR_RECURSE_RESULT_COPY_VA = 0x00813ab5u;
static constexpr uint32_t ISAAC_ROOM_7230_DOOR_RECURSE_RESULT_COPY_END_VA = 0x00813ac5u;
static constexpr uint32_t ISAAC_ROOM_7230_DOOR_RECURSE_RADIUS_BITS = 0x42200000u;
static constexpr int32_t ISAAC_ROOM_7230_DOOR_SLOT_COUNT = 8;
static constexpr uint32_t ISAAC_ROOM_7230_ENTITY_COUNT_OFF = 0x1264u;
static constexpr uint32_t ISAAC_ROOM_7230_ENTITY_DIST_BITS = 0x41a00000u;
static constexpr uint32_t ISAAC_ROOM_7230_ENTITY_DIST_VA = 0x00baa87cu;
static constexpr uint32_t ISAAC_ROOM_7230_ENTITY_VEC_OFF = 0x125cu;
static constexpr uint32_t ISAAC_ROOM_7230_EXIT_JG_VA = 0x008138bfu;
static constexpr uint32_t ISAAC_ROOM_7230_FINISH_DEG_BITS = 0x43b40000u;
static constexpr uint32_t ISAAC_ROOM_7230_FINISH_GRID_BITS = 0x42200000u;
static constexpr uint32_t ISAAC_ROOM_7230_FINISH_GRID_COST_OFF = 0x76cu;
static constexpr uint32_t ISAAC_ROOM_7230_FINISH_GRID_Y0_BITS = 0x42f00000u;
static constexpr uint32_t ISAAC_ROOM_7230_FINISH_HALF_BITS = 0x3f000000u;
static constexpr uint32_t ISAAC_ROOM_7230_FINISH_HEIGHT_OFF = 0x10u;
static constexpr uint32_t ISAAC_ROOM_7230_FINISH_HOST_VA_CLAMP = 0x00812f50u;
static constexpr uint32_t ISAAC_ROOM_7230_FINISH_HOST_VA_COS = 0x0041d540u;
static constexpr uint32_t ISAAC_ROOM_7230_FINISH_HOST_VA_ENTRY = 0x00813520u;
static constexpr uint32_t ISAAC_ROOM_7230_FINISH_HOST_VA_FATAL = 0x00a112c0u;
static constexpr uint32_t ISAAC_ROOM_7230_FINISH_HOST_VA_QUERY = 0x007f0800u;
static constexpr uint32_t ISAAC_ROOM_7230_FINISH_HOST_VA_RECURSE = 0x00813a99u;
static constexpr uint32_t ISAAC_ROOM_7230_FINISH_HOST_VA_RET = 0x00813b29u;
static constexpr uint32_t ISAAC_ROOM_7230_FINISH_HOST_VA_SIN = 0x0041d520u;
static constexpr uint32_t ISAAC_ROOM_7230_FINISH_HOST_VA_SITE = 0x00813506u;
static constexpr uint32_t ISAAC_ROOM_7230_FINISH_HOST_VA_SQRT = 0x00435a50u;
static constexpr int32_t ISAAC_ROOM_7230_FINISH_IAT_COS = 0x00b18820;
static constexpr int32_t ISAAC_ROOM_7230_FINISH_IAT_SIN = 0x00b18834;
static constexpr int32_t ISAAC_ROOM_7230_FINISH_IAT_SQRT = 0x00b1884c;
static constexpr int32_t ISAAC_ROOM_7230_FINISH_ITERATIONS = 0x7d;
static constexpr uint32_t ISAAC_ROOM_7230_FINISH_RADIUS_ADD_BITS = 0x40a00000u;
static constexpr int32_t ISAAC_ROOM_7230_FINISH_RADIUS_BONUS = 0xbb8;
static constexpr uint32_t ISAAC_ROOM_7230_FINISH_RADIUS_CAP_BITS = 0x43fa0000u;
static constexpr uint32_t ISAAC_ROOM_7230_FINISH_RAD_BITS = 0x3c8efa35u;
static constexpr uint32_t ISAAC_ROOM_7230_FINISH_RANDF_BITS = 0x2f7ffffeu;
static constexpr int32_t ISAAC_ROOM_7230_FINISH_RECURSE_BUDGET = 0x14;
static constexpr int32_t ISAAC_ROOM_7230_FINISH_SEED = 0x441c1dfd;
static constexpr int32_t ISAAC_ROOM_7230_FINISH_SHIFT_A = 1;
static constexpr int32_t ISAAC_ROOM_7230_FINISH_SHIFT_B = 9;
static constexpr int32_t ISAAC_ROOM_7230_FINISH_SHIFT_C = 29;
static constexpr uint32_t ISAAC_ROOM_7230_FINISH_SHIFT_TABLE_VA = 0x00b1f4ecu;
static constexpr int32_t ISAAC_ROOM_7230_FINISH_THRESH_BASE = 0x2bc;
static constexpr int32_t ISAAC_ROOM_7230_FINISH_THRESH_GE60 = 0x258;
static constexpr int32_t ISAAC_ROOM_7230_FINISH_THRESH_LT20 = 0x384;
static constexpr int32_t ISAAC_ROOM_7230_FINISH_THRESH_LT40 = 0x320;
static constexpr int32_t ISAAC_ROOM_7230_FINISH_THRESH_LT5 = 0x3e8;
static constexpr uint32_t ISAAC_ROOM_7230_FINISH_WIDTH_OFF = 0x0cu;
static constexpr uint32_t ISAAC_ROOM_7230_HOST_VA_COUNTDOWN = 0x008054abu;
static constexpr uint32_t ISAAC_ROOM_7230_HOST_VA_GENRAND = 0x006eef60u;
static constexpr uint32_t ISAAC_ROOM_7230_HOST_VA_NEXT = 0x00805527u;
static constexpr uint32_t ISAAC_ROOM_7230_HOST_VA_POS = 0x00813460u;
static constexpr uint32_t ISAAC_ROOM_7230_HOST_VA_POS_FINISH = 0x00813520u;
static constexpr uint32_t ISAAC_ROOM_7230_HOST_VA_RTTI = 0x00af08b1u;
static constexpr uint32_t ISAAC_ROOM_7230_HOST_VA_SPAWN = 0x00428b20u;
static constexpr uint32_t ISAAC_ROOM_7230_HOST_VA_SPAWN_BODY = 0x008054c3u;
static constexpr uint32_t ISAAC_ROOM_7230_SITE_A_CALL_VA = 0x0081370bu;
static constexpr uint32_t ISAAC_ROOM_7230_SITE_A_COST_GATE_VA = 0x008137abu;
static constexpr uint32_t ISAAC_ROOM_7230_SITE_A_ENTITY_REJECT_VA = 0x0081387fu;
static constexpr uint32_t ISAAC_ROOM_7230_SITE_A_IDENTITY_X_VA = 0x0081371au;
static constexpr uint32_t ISAAC_ROOM_7230_SITE_A_IDENTITY_Y_VA = 0x00813731u;
static constexpr uint32_t ISAAC_ROOM_7230_SITE_A_INDEX_JS_VA = 0x008137a5u;
static constexpr int32_t ISAAC_ROOM_7230_SITE_A_INDEX_NEGATIVE = 2;
static constexpr int32_t ISAAC_ROOM_7230_SITE_A_NEED_COST = 3;
static constexpr int32_t ISAAC_ROOM_7230_SITE_A_RANGE_FAIL = 1;
static constexpr int32_t ISAAC_ROOM_7230_SITE_A_REJECT_IDENTITY = 0;
static constexpr uint32_t ISAAC_ROOM_7230_SITE_B_CALL_VA = 0x008138f0u;
static constexpr uint32_t ISAAC_ROOM_7230_SITE_B_IDIV_VA = 0x0081395bu;
static constexpr uint32_t ISAAC_ROOM_7230_SITE_B_PAD_BITS = 0x41a00000u;
static constexpr uint32_t ISAAC_ROOM_7230_SPAWN_ARG_PTR_A = 0x00c5d838u;
static constexpr uint32_t ISAAC_ROOM_7230_SPAWN_ARG_PTR_B = 0x00c5d5dcu;
static constexpr int32_t ISAAC_ROOM_7230_SPAWN_BEST_ENTITY_BOUND = 0x1c0;
static constexpr int32_t ISAAC_ROOM_7230_SPAWN_BEST_INDEX_INIT = -1;
static constexpr int32_t ISAAC_ROOM_7230_SPAWN_COST_EXTRA = 0xbb8;
static constexpr uint32_t ISAAC_ROOM_7230_SPAWN_DOOR_DIST2_BITS = 0x45992000u;
static constexpr uint32_t ISAAC_ROOM_7230_SPAWN_DOOR_INDEX_OFF = 0x24u;
static constexpr uint32_t ISAAC_ROOM_7230_SPAWN_DOOR_SLOT_OFF = 0x724u;
static constexpr int32_t ISAAC_ROOM_7230_SPAWN_FIRST_COUNTER = 0x7c;
static constexpr uint32_t ISAAC_ROOM_7230_SPAWN_GAME_ROOM_OFF = 0x18300u;
static constexpr uint32_t ISAAC_ROOM_7230_SPAWN_GRID_COST_OFF = 0x76cu;
static constexpr uint32_t ISAAC_ROOM_7230_SPAWN_GRID_ENTITY_OFF = 0x24u;
static constexpr uint32_t ISAAC_ROOM_7230_SPAWN_HALF_BITS = 0x3f000000u;
static constexpr int32_t ISAAC_ROOM_7230_SPAWN_HANDOFF_ARG6 = 0;
static constexpr uint32_t ISAAC_ROOM_7230_SPAWN_HOST_VA_COS = 0x0041d540u;
static constexpr uint32_t ISAAC_ROOM_7230_SPAWN_HOST_VA_DOOR_LOOP = 0x00813996u;
static constexpr uint32_t ISAAC_ROOM_7230_SPAWN_HOST_VA_ENTRY = 0x00813460u;
static constexpr uint32_t ISAAC_ROOM_7230_SPAWN_HOST_VA_EXIT = 0x00813b29u;
static constexpr uint32_t ISAAC_ROOM_7230_SPAWN_HOST_VA_LOOP_HEAD = 0x00813570u;
static constexpr uint32_t ISAAC_ROOM_7230_SPAWN_HOST_VA_QUERY = 0x007f0800u;
static constexpr uint32_t ISAAC_ROOM_7230_SPAWN_HOST_VA_RECURSE = 0x00813a99u;
static constexpr uint32_t ISAAC_ROOM_7230_SPAWN_HOST_VA_SIN = 0x0041d520u;
static constexpr uint32_t ISAAC_ROOM_7230_SPAWN_HOST_VA_SITE_8054D7 = 0x008054d7u;
static constexpr uint32_t ISAAC_ROOM_7230_SPAWN_HOST_VA_SITE_A = 0x0081370bu;
static constexpr uint32_t ISAAC_ROOM_7230_SPAWN_HOST_VA_SITE_B = 0x008138f0u;
static constexpr int32_t ISAAC_ROOM_7230_SPAWN_LOOP_ITERS = 0x7d;
static constexpr uint32_t ISAAC_ROOM_7230_SPAWN_POS_VEC_PTR = 0x00c7b640u;
static constexpr int32_t ISAAC_ROOM_7230_SPAWN_PRE_ACCEPT_NO_ENTITY = 7;
static constexpr int32_t ISAAC_ROOM_7230_SPAWN_PRE_ACCEPT_TYPE_OK = 8;
static constexpr int32_t ISAAC_ROOM_7230_SPAWN_PRE_COST_ARG5 = 1;
static constexpr int32_t ISAAC_ROOM_7230_SPAWN_PRE_COST_EXTRA = 3;
static constexpr int32_t ISAAC_ROOM_7230_SPAWN_PRE_COST_GRID = 2;
static constexpr int32_t ISAAC_ROOM_7230_SPAWN_PRE_ENTITY_ARG5 = 4;
static constexpr int32_t ISAAC_ROOM_7230_SPAWN_PRE_ENTITY_GRID = 5;
static constexpr int32_t ISAAC_ROOM_7230_SPAWN_PRE_NO_BEST = 0;
static constexpr int32_t ISAAC_ROOM_7230_SPAWN_PRE_TYPE_REJECT = 6;
static constexpr int32_t ISAAC_ROOM_7230_SPAWN_RECURSE_BUDGET = 0x14;
static constexpr uint32_t ISAAC_ROOM_7230_SPAWN_RECURSE_RADIUS_BITS = 0x42200000u;
static constexpr int32_t ISAAC_ROOM_7230_SPAWN_REJECT_TYPE_11 = 0x11;
static constexpr int32_t ISAAC_ROOM_7230_SPAWN_REJECT_TYPE_12 = 0x12;
static constexpr int32_t ISAAC_ROOM_7230_SPAWN_REJECT_TYPE_14 = 0x14;
static constexpr int32_t ISAAC_ROOM_7230_SPAWN_REJECT_TYPE_17 = 0x17;
static constexpr int32_t ISAAC_ROOM_7230_SPAWN_SEARCH_BEST_COST = 2;
static constexpr int32_t ISAAC_ROOM_7230_SPAWN_SEARCH_BEST_ENTITY = 3;
static constexpr int32_t ISAAC_ROOM_7230_SPAWN_SEARCH_CLAMP_A = 5;
static constexpr int32_t ISAAC_ROOM_7230_SPAWN_SEARCH_DONE = 0;
static constexpr int32_t ISAAC_ROOM_7230_SPAWN_SEARCH_DOOR = 11;
static constexpr int32_t ISAAC_ROOM_7230_SPAWN_SEARCH_EXIT = 9;
static constexpr int32_t ISAAC_ROOM_7230_SPAWN_SEARCH_GRID = 1;
static constexpr uint32_t ISAAC_ROOM_7230_SPAWN_SEARCH_HEAD_VA = 0x00813520u;
static constexpr int32_t ISAAC_ROOM_7230_SPAWN_SEARCH_ITERS = 0x7d;
static constexpr int32_t ISAAC_ROOM_7230_SPAWN_SEARCH_LOOP = 8;
static constexpr int32_t ISAAC_ROOM_7230_SPAWN_SEARCH_PROBE_COST = 6;
static constexpr int32_t ISAAC_ROOM_7230_SPAWN_SEARCH_RECURSE = 12;
static constexpr int32_t ISAAC_ROOM_7230_SPAWN_SEARCH_SEED = 0x441c1dfd;
static constexpr int32_t ISAAC_ROOM_7230_SPAWN_SEARCH_SIN_COS = 4;
static constexpr int32_t ISAAC_ROOM_7230_SPAWN_SEARCH_SITE_B = 10;
static constexpr uint32_t ISAAC_ROOM_7230_SPAWN_SEARCH_VA_BEST_COST_SITE = 0x008135b6u;
static constexpr uint32_t ISAAC_ROOM_7230_SPAWN_SEARCH_VA_BEST_ENTITY_SITE = 0x008135d6u;
static constexpr uint32_t ISAAC_ROOM_7230_SPAWN_SEARCH_VA_CLAMP_A = 0x0081370bu;
static constexpr uint32_t ISAAC_ROOM_7230_SPAWN_SEARCH_VA_COS = 0x0041d540u;
static constexpr uint32_t ISAAC_ROOM_7230_SPAWN_SEARCH_VA_DOOR = 0x00813996u;
static constexpr uint32_t ISAAC_ROOM_7230_SPAWN_SEARCH_VA_GRID = 0x007f0800u;
static constexpr uint32_t ISAAC_ROOM_7230_SPAWN_SEARCH_VA_HEAD = 0x00813520u;
static constexpr uint32_t ISAAC_ROOM_7230_SPAWN_SEARCH_VA_LROOM = 0x0081f8b0u;
static constexpr uint32_t ISAAC_ROOM_7230_SPAWN_SEARCH_VA_PRE = 0x00813561u;
static constexpr uint32_t ISAAC_ROOM_7230_SPAWN_SEARCH_VA_PRE_END = 0x008135f0u;
static constexpr uint32_t ISAAC_ROOM_7230_SPAWN_SEARCH_VA_PROBE_COST_SITE = 0x008137abu;
static constexpr uint32_t ISAAC_ROOM_7230_SPAWN_SEARCH_VA_RECURSE = 0x00813a99u;
static constexpr uint32_t ISAAC_ROOM_7230_SPAWN_SEARCH_VA_SIN = 0x0041d520u;
static constexpr uint32_t ISAAC_ROOM_7230_SPAWN_SEARCH_VA_SITE_B = 0x008138f0u;
static constexpr uint32_t ISAAC_ROOM_7230_SPAWN_SEARCH_VA_WALK_SITE = 0x008137ecu;
static constexpr int32_t ISAAC_ROOM_7230_SPAWN_SEARCH_WALK = 7;
static constexpr int32_t ISAAC_ROOM_7230_SPAWN_SEED_INIT = 0x441c1dfd;
static constexpr uint32_t ISAAC_ROOM_7230_SPAWN_SITE_B_PAD_BITS = 0x41a00000u;
static constexpr int32_t ISAAC_ROOM_7230_SPAWN_TYPE = 4;
static constexpr uint32_t ISAAC_ROOM_7230_SPAWN_UNIT_SCALE_BITS = 0x2f800000u;
static constexpr uint32_t ISAAC_ROOM_7230_SPAWN_VARIANT = 3u;
static constexpr int32_t ISAAC_ROOM_AMBIENT_824A70_A1_ARG = 1;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_824A70_A2_THIS_OFF = 0x30u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_824A70_ANIM_COUNT_OFF = 0x30u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_824A70_ANM2_FIELD_34_OFF = 0x34u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_824A70_ANM2_FIELD_44_OFF = 0x44u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_824A70_ANM_DATA_PTR = 0x00b1bc54u;
static constexpr int32_t ISAAC_ROOM_AMBIENT_824A70_CREATE_ARG_ZERO = 0;
static constexpr int32_t ISAAC_ROOM_AMBIENT_824A70_EFFECT_TYPE = 0x3e8;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_824A70_EFFECT_VARIANT = 0x8au;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_824A70_ENTITY_ANM2_OFF = 0x48u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_824A70_GAME_PTR_GLOBAL = 0x00c71678u;
static constexpr int32_t ISAAC_ROOM_AMBIENT_824A70_GENRAND_MAX_PER_LOOP = 8;
static constexpr int32_t ISAAC_ROOM_AMBIENT_824A70_GENRAND_SAMPLES_PER_LOOP = 7;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_824A70_HOST_VA_A0 = 0x0040bcd0u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_824A70_HOST_VA_A0_SITE = 0x00824cd0u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_824A70_HOST_VA_A1 = 0x0040a5d0u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_824A70_HOST_VA_A1_SITE = 0x00824cf0u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_824A70_HOST_VA_A2 = 0x00408e00u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_824A70_HOST_VA_A2_SITE = 0x00824d0au;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_824A70_HOST_VA_CREATE = 0x006fe410u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_824A70_HOST_VA_CREATE_SITE = 0x00824cbdu;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_824A70_HOST_VA_CREATE_START = 0x00824c9cu;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_824A70_HOST_VA_EPILOG = 0x00824ed2u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_824A70_HOST_VA_GENRAND = 0x006eef60u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_824A70_HOST_VA_GETLAYER = 0x0040b220u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_824A70_HOST_VA_GETLAYER_SITE = 0x00824e8fu;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_824A70_HOST_VA_LOOP = 0x00824ec7u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_824A70_HOST_VA_R0 = 0x00824bb3u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_824A70_HOST_VA_R1 = 0x00824beeu;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_824A70_HOST_VA_R2 = 0x00824c50u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_824A70_HOST_VA_R3 = 0x00824c97u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_824A70_HOST_VA_R4 = 0x00824cdcu;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_824A70_HOST_VA_R5 = 0x00824d1au;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_824A70_HOST_VA_R6 = 0x00824d2bu;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_824A70_HOST_VA_R7 = 0x00824e50u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_824A70_HOST_VA_VCALL_SITE = 0x00824ec4u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_824A70_LAYER_COLOR_OFF = 0x48u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_824A70_LAYER_COLOR_PAD_DWORD_OFF = 0x28u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_824A70_LAYER_COLOR_PAD_QWORD_OFF = 0x20u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_824A70_LAYER_COLOR_ZERO16_OFF = 0x10u;
static constexpr int32_t ISAAC_ROOM_AMBIENT_824A70_LAYER_INDEX = 0;
static constexpr int32_t ISAAC_ROOM_AMBIENT_824A70_RESIDUAL_BODY = 1;
static constexpr int32_t ISAAC_ROOM_AMBIENT_824A70_RESIDUAL_MONOLITHIC = 2;
static constexpr int32_t ISAAC_ROOM_AMBIENT_824A70_RESIDUAL_NONE = 0;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_824A70_VCALL_OFF = 0xcu;
static constexpr int32_t ISAAC_ROOM_B18_ACTION_RTTI_CANDIDATE = 2;
static constexpr int32_t ISAAC_ROOM_B18_ACTION_SKIP = 0;
static constexpr int32_t ISAAC_ROOM_B18_ACTION_TYPE5 = 1;
static constexpr int32_t ISAAC_ROOM_B18_ENTITY_TYPE1 = 1;
static constexpr int32_t ISAAC_ROOM_B18_ENTITY_TYPE5 = 5;
static constexpr uint32_t ISAAC_ROOM_B18_ENTITY_TYPE_OFF = 0x28u;
static constexpr uint32_t ISAAC_ROOM_B18_GAME_MODE_OFF = 0x26614u;
static constexpr uint32_t ISAAC_ROOM_B18_HOST_VA_FLAG_CLEAR = 0x008055a0u;
static constexpr uint32_t ISAAC_ROOM_B18_HOST_VA_FLAG_TEST = 0x00805527u;
static constexpr uint32_t ISAAC_ROOM_B18_HOST_VA_NEXT = 0x008055a7u;
static constexpr uint32_t ISAAC_ROOM_B18_HOST_VA_PATH_B = 0x006da530u;
static constexpr uint32_t ISAAC_ROOM_B18_HOST_VA_RTTI = 0x00af08b1u;
static constexpr uint32_t ISAAC_ROOM_B18_HOST_VA_TYPE5 = 0x006e17c0u;
static constexpr uint32_t ISAAC_ROOM_B18_HOST_VA_WALK_START = 0x00805540u;
static constexpr int32_t ISAAC_ROOM_B18_MODE_GATE = 2;
static constexpr int32_t ISAAC_ROOM_B18_RESIDUAL_HOST_WALK = 2;
static constexpr int32_t ISAAC_ROOM_B18_RESIDUAL_MONOLITHIC = 3;
static constexpr int32_t ISAAC_ROOM_B18_RESIDUAL_NONE = 0;
static constexpr int32_t ISAAC_ROOM_B18_RESIDUAL_PURE_COMPLETE = 1;
static constexpr uint32_t ISAAC_ROOM_B18_ROOM_COUNT_OFF = 0x1264u;
static constexpr uint32_t ISAAC_ROOM_B18_ROOM_FLAG_OFF = 0x7894u;
static constexpr uint32_t ISAAC_ROOM_B18_ROOM_VEC_OFF = 0x125cu;
static constexpr uint32_t ISAAC_ROOM_B18_RTTI_DST_PTR = 0x00c5d6acu;
static constexpr uint32_t ISAAC_ROOM_B18_RTTI_SRC_PTR = 0x00c5d5dcu;
static constexpr int32_t ISAAC_ROOM_B18_TYPE_RANGE_BASE = 10;
static constexpr int32_t ISAAC_ROOM_B18_TYPE_RANGE_SPAN = 0x3de;
static constexpr int32_t ISAAC_ROOM_B19_CELL_BUF_SIZE = 0x1c0;
static constexpr uint32_t ISAAC_ROOM_B19_ENTITY_DEAD_OFF = 0x173u;
static constexpr uint32_t ISAAC_ROOM_B19_ENTITY_FIELD_534_OFF = 0x534u;
static constexpr uint32_t ISAAC_ROOM_B19_ENTITY_FLAGS_168_OFF = 0x168u;
static constexpr int32_t ISAAC_ROOM_B19_ENTITY_FLAG_BIT = 0x80000;
static constexpr uint32_t ISAAC_ROOM_B19_ENTITY_POS_X_OFF = 0x33cu;
static constexpr uint32_t ISAAC_ROOM_B19_ENTITY_POS_Y_OFF = 0x340u;
static constexpr int32_t ISAAC_ROOM_B19_ENTITY_TYPE5 = 5;
static constexpr uint32_t ISAAC_ROOM_B19_ENTITY_TYPE_OFF = 0x28u;
static constexpr uint32_t ISAAC_ROOM_B19_ENTITY_VARIANT_100 = 0x64u;
static constexpr uint32_t ISAAC_ROOM_B19_ENTITY_VARIANT_OFF = 0x2cu;
static constexpr uint32_t ISAAC_ROOM_B19_GRID_CELL_BITS = 0x42200000u;
static constexpr uint32_t ISAAC_ROOM_B19_GRID_HALF_BITS = 0x3f000000u;
static constexpr uint32_t ISAAC_ROOM_B19_GRID_Y0_BITS = 0x42f00000u;
static constexpr uint32_t ISAAC_ROOM_B19_HOST_VA_ENTITY_WALK = 0x00805640u;
static constexpr uint32_t ISAAC_ROOM_B19_HOST_VA_FLAG_CLEAR = 0x00806043u;
static constexpr uint32_t ISAAC_ROOM_B19_HOST_VA_FLAG_TEST = 0x008055a7u;
static constexpr uint32_t ISAAC_ROOM_B19_HOST_VA_GET_ALT_PEDESTAL = 0x006e1d70u;
static constexpr uint32_t ISAAC_ROOM_B19_HOST_VA_GET_GRID_COLLISION = 0x007f0800u;
static constexpr uint32_t ISAAC_ROOM_B19_HOST_VA_MEMSET = 0x00af05e5u;
static constexpr uint32_t ISAAC_ROOM_B19_HOST_VA_NEXT = 0x0080608eu;
static constexpr uint32_t ISAAC_ROOM_B19_HOST_VA_POS_FINISH = 0x00813520u;
static constexpr uint32_t ISAAC_ROOM_B19_HOST_VA_QUERY_8000 = 0x0072fe80u;
static constexpr uint32_t ISAAC_ROOM_B19_HOST_VA_REBUILD_START = 0x008055b4u;
static constexpr uint32_t ISAAC_ROOM_B19_HOST_VA_SET_ALT_PEDESTAL = 0x006e1a80u;
static constexpr uint32_t ISAAC_ROOM_B19_HOST_VA_SPAWN = 0x00428b20u;
static constexpr uint32_t ISAAC_ROOM_B19_HOST_VA_TREE_ALLOC = 0x00a0f4c0u;
static constexpr int32_t ISAAC_ROOM_B19_QUERY_IMM_8000 = 0x8000;
static constexpr uint32_t ISAAC_ROOM_B19_REFCOUNT_VA = 0x00c71674u;
static constexpr int32_t ISAAC_ROOM_B19_RESIDUAL_HOST_REBUILD = 1;
static constexpr int32_t ISAAC_ROOM_B19_RESIDUAL_MONOLITHIC = 2;
static constexpr int32_t ISAAC_ROOM_B19_RESIDUAL_NONE = 0;
static constexpr uint32_t ISAAC_ROOM_B19_ROOM_COUNT_OFF = 0x1264u;
static constexpr uint32_t ISAAC_ROOM_B19_ROOM_FLAG_OFF = 0x7769u;
static constexpr uint32_t ISAAC_ROOM_B19_ROOM_H_OFF = 0x10u;
static constexpr uint32_t ISAAC_ROOM_B19_ROOM_VEC_OFF = 0x125cu;
static constexpr uint32_t ISAAC_ROOM_B19_ROOM_W_OFF = 0xcu;
static constexpr int32_t ISAAC_ROOM_B19_TREE_NODE_SIZE = 0x18;
static constexpr int32_t ISAAC_ROOM_B1_BUFFER_ELEM_STRIDE = 0x78;
static constexpr int32_t ISAAC_ROOM_B1_COLLECTIBLE_0x89 = 0x89;
static constexpr int32_t ISAAC_ROOM_B1_COLLECTIBLE_ID = 0x89;
static constexpr uint32_t ISAAC_ROOM_B1_HOST_VA_CLEANUP = 0x00802e1au;
static constexpr uint32_t ISAAC_ROOM_B1_HOST_VA_OWNER = 0x00802b7du;
static constexpr uint32_t ISAAC_ROOM_B1_HOST_VA_POSITION = 0x00802da4u;
static constexpr uint32_t ISAAC_ROOM_B1_HOST_VA_POST_BIND = 0x00802dd5u;
static constexpr uint32_t ISAAC_ROOM_B1_HOST_VA_QUALITY = 0x00802b92u;
static constexpr uint32_t ISAAC_ROOM_B1_HOST_VA_SFX = 0x00802a53u;
static constexpr uint32_t ISAAC_ROOM_B1_HOST_VA_SFX_PLAY = 0x0092dc30u;
static constexpr uint32_t ISAAC_ROOM_B1_HOST_VA_SFX_PRE = 0x00956780u;
static constexpr uint32_t ISAAC_ROOM_B1_HOST_VA_SHUFFLE_ASSIGN = 0x004d3230u;
static constexpr uint32_t ISAAC_ROOM_B1_HOST_VA_SHUFFLE_COPY = 0x004d3130u;
static constexpr uint32_t ISAAC_ROOM_B1_HOST_VA_SHUFFLE_DTOR = 0x004d6ee0u;
static constexpr uint32_t ISAAC_ROOM_B1_HOST_VA_SPAWN = 0x00802dc4u;
static constexpr uint32_t ISAAC_ROOM_B1_HOST_VA_SPAWN_SETUP = 0x00802b60u;
static constexpr int32_t ISAAC_ROOM_B1_RESIDUAL_MONOLITHIC = 4;
static constexpr int32_t ISAAC_ROOM_B1_RESIDUAL_NONE = 0;
static constexpr int32_t ISAAC_ROOM_B1_RESIDUAL_SFX = 1;
static constexpr int32_t ISAAC_ROOM_B1_RESIDUAL_SFX_SPAWN = 3;
static constexpr int32_t ISAAC_ROOM_B1_RESIDUAL_SPAWN = 2;
static constexpr int32_t ISAAC_ROOM_B1_SEED_FATAL_PRE_CORNER = 2;
static constexpr int32_t ISAAC_ROOM_B1_SEED_FATAL_PRE_SHUFFLE = 1;
static constexpr int32_t ISAAC_ROOM_B1_SEED_OK = 0;
static constexpr int32_t ISAAC_ROOM_B1_SFX_ID = 0xbe;
static constexpr int32_t ISAAC_ROOM_B1_SFX_PLAY_FRAME_DELAY = 2;
static constexpr int32_t ISAAC_ROOM_B1_SFX_PLAY_LOOP = 0;
static constexpr int32_t ISAAC_ROOM_B1_SFX_PLAY_PAN = 0;
static constexpr uint32_t ISAAC_ROOM_B1_SFX_PLAY_PAN_BITS = 0u;
static constexpr uint32_t ISAAC_ROOM_B1_SFX_PLAY_PITCH_BITS = 0x3f800000u;
static constexpr uint32_t ISAAC_ROOM_B1_SFX_VOLUME_BITS = 0x3f800000u;
static constexpr uint32_t ISAAC_ROOM_B1_SPAWN_RADIUS_BITS = 0x41c00000u;
static constexpr int32_t ISAAC_ROOM_B20_ACTION_DEFAULT = 3;
static constexpr int32_t ISAAC_ROOM_B20_ACTION_FLAGGED = 0;
static constexpr int32_t ISAAC_ROOM_B20_ACTION_PAIR_X = 1;
static constexpr int32_t ISAAC_ROOM_B20_ACTION_PAIR_Y = 2;
static constexpr uint32_t ISAAC_ROOM_B20_COLLECT_FLAG_BITS = 0x4080u;
static constexpr int32_t ISAAC_ROOM_B20_DEFAULT_FIELD184_GATE = 5;
static constexpr uint32_t ISAAC_ROOM_B20_ENTITY_FIELD_184_OFF = 0x184u;
static constexpr uint32_t ISAAC_ROOM_B20_ENTITY_FIELD_32C_OFF = 0x32cu;
static constexpr uint32_t ISAAC_ROOM_B20_ENTITY_FIELD_370_OFF = 0x370u;
static constexpr uint32_t ISAAC_ROOM_B20_ENTITY_FIELD_3BC_OFF = 0x3bcu;
static constexpr uint32_t ISAAC_ROOM_B20_ENTITY_FIELD_3C0_OFF = 0x3c0u;
static constexpr uint32_t ISAAC_ROOM_B20_ENTITY_FIELD_3EC_OFF = 0x3ecu;
static constexpr uint32_t ISAAC_ROOM_B20_ENTITY_FLAGS_168_OFF = 0x168u;
static constexpr uint32_t ISAAC_ROOM_B20_ENTITY_FLAGS_16C_OFF = 0x16cu;
static constexpr uint32_t ISAAC_ROOM_B20_ENTITY_POS_X_OFF = 0x33cu;
static constexpr uint32_t ISAAC_ROOM_B20_ENTITY_POS_Y_OFF = 0x340u;
static constexpr uint32_t ISAAC_ROOM_B20_ENTITY_SUBTYPE_OFF = 0x30u;
static constexpr uint32_t ISAAC_ROOM_B20_ENTITY_TYPE_OFF = 0x28u;
static constexpr uint32_t ISAAC_ROOM_B20_ENTITY_VARIANT_OFF = 0x2cu;
static constexpr uint32_t ISAAC_ROOM_B20_FLAG_BIT_4000 = 0x4000u;
static constexpr uint32_t ISAAC_ROOM_B20_FLAG_CLEAR_MASK = 0xffffbfffu;
static constexpr uint32_t ISAAC_ROOM_B20_GAME_MODE_OFF = 0x26614u;
static constexpr uint32_t ISAAC_ROOM_B20_GRID_CELL_BITS = 0x42200000u;
static constexpr uint32_t ISAAC_ROOM_B20_HOST_VA_COLLECT_OR_4080 = 0x008063f0u;
static constexpr uint32_t ISAAC_ROOM_B20_HOST_VA_COS = 0x0041d540u;
static constexpr uint32_t ISAAC_ROOM_B20_HOST_VA_DEALLOCATE = 0x0040c740u;
static constexpr uint32_t ISAAC_ROOM_B20_HOST_VA_DEFAULT_FIELD184 = 0x008065a5u;
static constexpr uint32_t ISAAC_ROOM_B20_HOST_VA_DEFAULT_RNG = 0x008065c2u;
static constexpr uint32_t ISAAC_ROOM_B20_HOST_VA_EPILOGUE = 0x00806884u;
static constexpr uint32_t ISAAC_ROOM_B20_HOST_VA_FLAGGED_GENRAND = 0x00806206u;
static constexpr uint32_t ISAAC_ROOM_B20_HOST_VA_FLAG_CLEAR = 0x00806850u;
static constexpr uint32_t ISAAC_ROOM_B20_HOST_VA_FREE = 0x0080686eu;
static constexpr uint32_t ISAAC_ROOM_B20_HOST_VA_GENRAND = 0x006eef60u;
static constexpr uint32_t ISAAC_ROOM_B20_HOST_VA_LIST_TEST = 0x0080608eu;
static constexpr uint32_t ISAAC_ROOM_B20_HOST_VA_MULTISPAWN = 0x00806281u;
static constexpr uint32_t ISAAC_ROOM_B20_HOST_VA_PAIR_X = 0x00806717u;
static constexpr uint32_t ISAAC_ROOM_B20_HOST_VA_PAIR_Y = 0x008064fcu;
static constexpr uint32_t ISAAC_ROOM_B20_HOST_VA_PASS1 = 0x008060e3u;
static constexpr uint32_t ISAAC_ROOM_B20_HOST_VA_PASS2 = 0x008061a0u;
static constexpr uint32_t ISAAC_ROOM_B20_HOST_VA_POS_PACK = 0x00802740u;
static constexpr uint32_t ISAAC_ROOM_B20_HOST_VA_SIN = 0x0041d520u;
static constexpr uint32_t ISAAC_ROOM_B20_HOST_VA_SPAWN = 0x00428b20u;
static constexpr uint32_t ISAAC_ROOM_B20_HOST_VA_VECTOR_PUSH = 0x0042c920u;
static constexpr uint32_t ISAAC_ROOM_B20_LIST_BEGIN_VA = 0x00c82674u;
static constexpr uint32_t ISAAC_ROOM_B20_LIST_CAP_VA = 0x00c8267cu;
static constexpr uint32_t ISAAC_ROOM_B20_LIST_END_VA = 0x00c82678u;
static constexpr int32_t ISAAC_ROOM_B20_MODE_GATE = 2;
static constexpr uint32_t ISAAC_ROOM_B20_PAIR_X_OFFSET_BITS = 0x42700000u;
static constexpr int32_t ISAAC_ROOM_B20_PAIR_X_TYPE_A = 0x4e;
static constexpr int32_t ISAAC_ROOM_B20_PAIR_X_TYPE_B = 0x24;
static constexpr int32_t ISAAC_ROOM_B20_PAIR_X_TYPE_C = 0x10a;
static constexpr int32_t ISAAC_ROOM_B20_PAIR_X_TYPE_D = 0x54;
static constexpr int32_t ISAAC_ROOM_B20_PAIR_X_TYPE_E = 0x106;
static constexpr int32_t ISAAC_ROOM_B20_PAIR_X_TYPE_F = 0x107;
static constexpr int32_t ISAAC_ROOM_B20_PAIR_X_TYPE_G = 0x65;
static constexpr uint32_t ISAAC_ROOM_B20_PAIR_Y_OFFSET_BITS = 0x41f00000u;
static constexpr int32_t ISAAC_ROOM_B20_PAIR_Y_TYPE = 0x66;
static constexpr int32_t ISAAC_ROOM_B20_PASS1_TYPE_A = 0x1c;
static constexpr int32_t ISAAC_ROOM_B20_PASS1_TYPE_B = 0x13;
static constexpr int32_t ISAAC_ROOM_B20_PASS1_TYPE_C = 0xef;
static constexpr int32_t ISAAC_ROOM_B20_PASS1_TYPE_D = 0x59;
static constexpr int32_t ISAAC_ROOM_B20_RESIDUAL_HOST_TRAIL = 1;
static constexpr int32_t ISAAC_ROOM_B20_RESIDUAL_MONOLITHIC = 2;
static constexpr int32_t ISAAC_ROOM_B20_RESIDUAL_NONE = 0;
static constexpr uint32_t ISAAC_ROOM_B20_RNG_RADIUS_BITS = 0x41a00000u;
static constexpr uint32_t ISAAC_ROOM_B20_RNG_SPAN_BITS = 0x4048f5c3u;
static constexpr int32_t ISAAC_ROOM_B20_SPAWN_FLAG_BIT_80 = 0x80;
static constexpr uint32_t ISAAC_ROOM_B20_SPAWN_POS_VEC_PTR = 0x00c7b640u;
static constexpr int32_t ISAAC_ROOM_B20_TYPE_RANGE_BASE = 10;
static constexpr int32_t ISAAC_ROOM_B20_TYPE_RANGE_SPAN = 0x3de;
static constexpr uint32_t ISAAC_ROOM_B20_UNIT_SCALE_BITS = 0x2f800000u;
static constexpr uint32_t ISAAC_ROOM_B3B7_HOST_VA_NEXT = 0x00803bfbu;
static constexpr int32_t ISAAC_ROOM_B3B7_RESIDUAL_HOST = 1;
static constexpr int32_t ISAAC_ROOM_B3B7_RESIDUAL_MONOLITHIC = 2;
static constexpr int32_t ISAAC_ROOM_B3_CB_BASE_COOLDOWN = 1;
static constexpr int32_t ISAAC_ROOM_B3_CB_BASE_DEFAULT = 0;
static constexpr int32_t ISAAC_ROOM_B3_CB_BASE_HCE = 2;
static constexpr int32_t ISAAC_ROOM_B3_CB_BASE_MODE = 3;
static constexpr int32_t ISAAC_ROOM_B3_CB_BASE_OWNER = 4;
static constexpr int32_t ISAAC_ROOM_B3_CB_COL_42 = 0x42;
static constexpr int32_t ISAAC_ROOM_B3_CB_COL_E8 = 0xe8;
static constexpr uint32_t ISAAC_ROOM_B3_CB_F_COUNT_SCALE_BITS = 0x3dcccccdu;
static constexpr uint32_t ISAAC_ROOM_B3_CB_F_DEFAULT_BITS = 0x3f800000u;
static constexpr uint32_t ISAAC_ROOM_B3_CB_F_DIV_BITS = 0x42b40000u;
static constexpr uint32_t ISAAC_ROOM_B3_CB_F_FLOOR_BITS = 0x3f000000u;
static constexpr uint32_t ISAAC_ROOM_B3_CB_F_HCE_BITS = 0x3f333333u;
static constexpr uint32_t ISAAC_ROOM_B3_CB_F_MODE_BITS = 0x3fb70a3du;
static constexpr uint32_t ISAAC_ROOM_B3_CB_F_MUL_BITS = 0x3f4ccccdu;
static constexpr uint32_t ISAAC_ROOM_B3_CB_F_OWNER_BITS = 0x3f666666u;
static constexpr int32_t ISAAC_ROOM_B3_CB_MODE_16 = 0x16;
static constexpr uint32_t ISAAC_ROOM_B3_CB_ROOM_FIELD_OFF = 0x1210u;
static constexpr uint32_t ISAAC_ROOM_B3_CB_STORE_OFF = 0x2a2d4u;
static constexpr uint32_t ISAAC_ROOM_B3_CB_TE_THIS_OFF = 0x7310u;
static constexpr int32_t ISAAC_ROOM_B3_CHALLENGE_ID = 0x2a5;
static constexpr int32_t ISAAC_ROOM_B3_COLLECTIBLE_ID = 0x28d;
static constexpr uint32_t ISAAC_ROOM_B3_FLAG_OFF = 0x7768u;
static constexpr uint32_t ISAAC_ROOM_B3_GAME_OWNER_OFF = 0x1baa8u;
static constexpr uint32_t ISAAC_ROOM_B3_HCE_COOLDOWN_OFF = 8u;
static constexpr uint32_t ISAAC_ROOM_B3_HCE_GATE_OFF = 0x11u;
static constexpr uint32_t ISAAC_ROOM_B3_HCE_LIST_BEGIN_OFF = 4u;
static constexpr uint32_t ISAAC_ROOM_B3_HCE_LIST_END_OFF = 8u;
static constexpr int32_t ISAAC_ROOM_B3_HCE_STRIDE = 0x10;
static constexpr int32_t ISAAC_ROOM_B3_HCE_TYPE_A = 1;
static constexpr int32_t ISAAC_ROOM_B3_HCE_TYPE_B = 3;
static constexpr int32_t ISAAC_ROOM_B3_HCE_TYPE_C = 4;
static constexpr uint32_t ISAAC_ROOM_B3_HOST_VA_CHALLENGE = 0x009305f0u;
static constexpr uint32_t ISAAC_ROOM_B3_HOST_VA_CHALLENGE_BODY = 0x007ea2d0u;
static constexpr uint32_t ISAAC_ROOM_B3_HOST_VA_COUNT = 0x00708250u;
static constexpr uint32_t ISAAC_ROOM_B3_HOST_VA_GET_COLLECTIBLE = 0x0072fd10u;
static constexpr uint32_t ISAAC_ROOM_B3_HOST_VA_GET_COLLECTIBLE_EFFECT = 0x00930980u;
static constexpr uint32_t ISAAC_ROOM_B3_HOST_VA_HAS_COLLECTIBLE = 0x007706e0u;
static constexpr uint32_t ISAAC_ROOM_B3_HOST_VA_OWNER = 0x009be080u;
static constexpr uint32_t ISAAC_ROOM_B3_HOST_VA_START = 0x00803327u;
static constexpr uint32_t ISAAC_ROOM_B3_HOST_VA_TE_CALL = 0x009960b0u;
static constexpr uint32_t ISAAC_ROOM_B3_OWNER_CONFIG_TWIN_BIT = 0x80000000u;
static constexpr int32_t ISAAC_ROOM_B3_OWNER_LAZ_SHARED_TAG = 1;
static constexpr int32_t ISAAC_ROOM_B3_OWNER_LIST_STRIDE = 4;
static constexpr uint32_t ISAAC_ROOM_B3_OWNER_PLAYER_OFF_2C = 0x2cu;
static constexpr uint32_t ISAAC_ROOM_B3_OWNER_PLAYER_OFF_TWIN = 0x1e6cu;
static constexpr uint32_t ISAAC_ROOM_B3_TE_BEGIN_OFF = 0x7314u;
static constexpr uint32_t ISAAC_ROOM_B3_TE_CALL_BYTE71_OFF = 0x71u;
static constexpr uint32_t ISAAC_ROOM_B3_TE_CALL_COPY_DST_OFF = 0x84u;
static constexpr int32_t ISAAC_ROOM_B3_TE_CALL_COPY_SIZE = 0x2c;
static constexpr int32_t ISAAC_ROOM_B3_TE_CALL_FIELD50 = 3;
static constexpr uint32_t ISAAC_ROOM_B3_TE_CALL_FIELD54_BITS = 0x3dcccccdu;
static constexpr uint32_t ISAAC_ROOM_B3_TE_CALL_FIELD58_BITS = 0x3f800000u;
static constexpr uint32_t ISAAC_ROOM_B3_TE_CALL_FIELD5C_BITS = 0xbf000000u;
static constexpr uint32_t ISAAC_ROOM_B3_TE_CALL_FIELD60_BITS = 0x3f000000u;
static constexpr uint32_t ISAAC_ROOM_B3_TE_CALL_F_150_BITS = 0x43160000u;
static constexpr uint32_t ISAAC_ROOM_B3_TE_CALL_F_180_BITS = 0x43340000u;
static constexpr uint32_t ISAAC_ROOM_B3_TE_CALL_F_30_BITS = 0x41f00000u;
static constexpr uint32_t ISAAC_ROOM_B3_TE_CALL_IMAGE_FIELD_OFF = 0x3cu;
static constexpr uint32_t ISAAC_ROOM_B3_TE_CALL_THIS_OFF = 0x1618u;
static constexpr int32_t ISAAC_ROOM_B3_TE_CALL_TIMER_INIT = 0xb4;
static constexpr int32_t ISAAC_ROOM_B3_TE_CALL_TIMER_MAX = 0x96;
static constexpr uint32_t ISAAC_ROOM_B3_TE_CALL_TIMER_OFF = 0x34u;
static constexpr uint32_t ISAAC_ROOM_B3_TE_END_OFF = 0x7318u;
static constexpr uint32_t ISAAC_ROOM_B3_TE_GATE_OFF = 0x7321u;
static constexpr uint32_t ISAAC_ROOM_B3_TE_PUSH_PTR = 0x00c5d108u;
static constexpr int32_t ISAAC_ROOM_B3_TE_STRIDE = 0x10;
static constexpr int32_t ISAAC_ROOM_B3_TE_TYPE = 0;
static constexpr uint32_t ISAAC_ROOM_B3_TE_VARIANT = 0x40u;
static constexpr int32_t ISAAC_ROOM_B4_BAND_A = 1;
static constexpr int32_t ISAAC_ROOM_B4_BAND_A_REM = 0x19;
static constexpr int32_t ISAAC_ROOM_B4_BAND_A_SUB = 0x31;
static constexpr uint32_t ISAAC_ROOM_B4_BAND_A_VARIANT = 0x12cu;
static constexpr int32_t ISAAC_ROOM_B4_BAND_B = 2;
static constexpr uint32_t ISAAC_ROOM_B4_BAND_B_OPTION_OFF = 0x1b4u;
static constexpr int32_t ISAAC_ROOM_B4_BAND_B_REM = 0x32;
static constexpr int32_t ISAAC_ROOM_B4_BAND_B_SUB = 0x7a;
static constexpr uint32_t ISAAC_ROOM_B4_BAND_B_VARIANT = 0x15eu;
static constexpr int32_t ISAAC_ROOM_B4_BAND_C = 3;
static constexpr uint32_t ISAAC_ROOM_B4_BAND_C_OPTION_OFF = 0x2bfu;
static constexpr int32_t ISAAC_ROOM_B4_BAND_C_REM = 0x3c;
static constexpr int32_t ISAAC_ROOM_B4_BAND_C_SUB = 0x5a;
static constexpr uint32_t ISAAC_ROOM_B4_BAND_C_VARIANT = 0x12cu;
static constexpr int32_t ISAAC_ROOM_B4_BAND_D = 4;
static constexpr uint32_t ISAAC_ROOM_B4_BAND_D_OPTION_OFF = 0x1bau;
static constexpr int32_t ISAAC_ROOM_B4_BAND_D_REM = 0x3d;
static constexpr int32_t ISAAC_ROOM_B4_BAND_D_SUB = 0x20b;
static constexpr uint32_t ISAAC_ROOM_B4_BAND_D_VARIANT = 0x64u;
static constexpr int32_t ISAAC_ROOM_B4_BAND_NONE = 0;
static constexpr int32_t ISAAC_ROOM_B4_CLEANUP_CL = 1;
static constexpr uint32_t ISAAC_ROOM_B4_DESC_SEED_OFF = 0x5cu;
static constexpr int32_t ISAAC_ROOM_B4_DESC_TYPE_GATE = -0x14;
static constexpr uint32_t ISAAC_ROOM_B4_ENTITY_SEED_OFF = 0x30u;
static constexpr int32_t ISAAC_ROOM_B4_ENTITY_TYPE5 = 5;
static constexpr uint32_t ISAAC_ROOM_B4_GAME_SEED_OFF = 0x18308u;
static constexpr uint32_t ISAAC_ROOM_B4_HOST_VA_CLEANUP = 0x00a648b0u;
static constexpr uint32_t ISAAC_ROOM_B4_HOST_VA_CLEANUP_SITE = 0x00803822u;
static constexpr uint32_t ISAAC_ROOM_B4_HOST_VA_ENTITY_SEED = 0x00803457u;
static constexpr uint32_t ISAAC_ROOM_B4_HOST_VA_FRAME_GATE = 0x00803472u;
static constexpr uint32_t ISAAC_ROOM_B4_HOST_VA_G0 = 0x0080341fu;
static constexpr uint32_t ISAAC_ROOM_B4_HOST_VA_G1 = 0x0080357du;
static constexpr uint32_t ISAAC_ROOM_B4_HOST_VA_G2A = 0x00803665u;
static constexpr uint32_t ISAAC_ROOM_B4_HOST_VA_G2B = 0x008036c6u;
static constexpr uint32_t ISAAC_ROOM_B4_HOST_VA_G2C = 0x0080371fu;
static constexpr uint32_t ISAAC_ROOM_B4_HOST_VA_G2D = 0x00803761u;
static constexpr uint32_t ISAAC_ROOM_B4_HOST_VA_G3 = 0x008037fdu;
static constexpr uint32_t ISAAC_ROOM_B4_HOST_VA_GATE = 0x008033b6u;
static constexpr uint32_t ISAAC_ROOM_B4_HOST_VA_GENRAND = 0x006eef60u;
static constexpr uint32_t ISAAC_ROOM_B4_HOST_VA_LOOKUP = 0x0041af60u;
static constexpr uint32_t ISAAC_ROOM_B4_HOST_VA_NEXT = 0x00803854u;
static constexpr uint32_t ISAAC_ROOM_B4_HOST_VA_POS_A = 0x00812d00u;
static constexpr uint32_t ISAAC_ROOM_B4_HOST_VA_POS_A_SITE = 0x0080340bu;
static constexpr uint32_t ISAAC_ROOM_B4_HOST_VA_POS_FINISH = 0x00813520u;
static constexpr uint32_t ISAAC_ROOM_B4_HOST_VA_REWARD_BODY = 0x008033c2u;
static constexpr uint32_t ISAAC_ROOM_B4_HOST_VA_REWARD_POS = 0x008035a6u;
static constexpr uint32_t ISAAC_ROOM_B4_HOST_VA_SEED_CHECK = 0x008034dau;
static constexpr uint32_t ISAAC_ROOM_B4_HOST_VA_SEED_FATAL = 0x00a112c0u;
static constexpr uint32_t ISAAC_ROOM_B4_HOST_VA_SPAWN = 0x00428b20u;
static constexpr uint32_t ISAAC_ROOM_B4_HOST_VA_THIRD_POS = 0x008037c6u;
static constexpr uint32_t ISAAC_ROOM_B4_LOOKUP_COUNT_OFF = 0xcu;
static constexpr uint32_t ISAAC_ROOM_B4_LOOKUP_ENTITY_PTR_OFF = 4u;
static constexpr int32_t ISAAC_ROOM_B4_LOOKUP_PATH_ENTITY_SEED = 2;
static constexpr int32_t ISAAC_ROOM_B4_LOOKUP_PATH_G0 = 1;
static constexpr int32_t ISAAC_ROOM_B4_LOOKUP_PATH_NONE = 0;
static constexpr int32_t ISAAC_ROOM_B4_LOOKUP_SUBTYPE = -1;
static constexpr uint32_t ISAAC_ROOM_B4_LOOKUP_THIS_OFF = 0x1218u;
static constexpr int32_t ISAAC_ROOM_B4_MOD100_MAGIC = 0x51eb851f;
static constexpr int32_t ISAAC_ROOM_B4_PICKUP_DEFAULT = 0x32;
static constexpr int32_t ISAAC_ROOM_B4_PICKUP_SUBTYPE = 1;
static constexpr int32_t ISAAC_ROOM_B4_PICKUP_T0 = 0x35;
static constexpr int32_t ISAAC_ROOM_B4_PICKUP_T1 = 0x34;
static constexpr int32_t ISAAC_ROOM_B4_PICKUP_T2 = 0x33;
static constexpr int32_t ISAAC_ROOM_B4_PICKUP_T3 = 0x168;
static constexpr int32_t ISAAC_ROOM_B4_PICKUP_T4 = 0x3c;
static constexpr int32_t ISAAC_ROOM_B4_POS_FLAG0 = 0;
static constexpr int32_t ISAAC_ROOM_B4_POS_FLAG1 = 0;
static constexpr int32_t ISAAC_ROOM_B4_POS_FLAG2 = 1;
static constexpr uint32_t ISAAC_ROOM_B4_POS_PAD_BITS = 0x42200000u;
static constexpr uint32_t ISAAC_ROOM_B4_ROOM_BYTE1_OFF = 1u;
static constexpr uint32_t ISAAC_ROOM_B4_ROOM_ENTRY_OFF = 0x11f0u;
static constexpr uint32_t ISAAC_ROOM_B4_ROOM_POS_BASE_OFF = 0x14u;
static constexpr uint32_t ISAAC_ROOM_B4_ROOM_POS_X_OFF = 0x1cu;
static constexpr uint32_t ISAAC_ROOM_B4_ROOM_POS_Y_OFF = 0x20u;
static constexpr int32_t ISAAC_ROOM_B4_SEED_ADD = 0x3e8;
static constexpr uint32_t ISAAC_ROOM_B4_SPAWN_ARG_PTR = 0x00c7b640u;
static constexpr int32_t ISAAC_ROOM_B4_SPAWN_TYPE_1000 = 0x3e8;
static constexpr uint32_t ISAAC_ROOM_B4_SPAWN_VARIANT_A1 = 0xa1u;
static constexpr uint32_t ISAAC_ROOM_B4_THIRD_VARIANT = 0x5au;
static constexpr int32_t ISAAC_ROOM_B4_XOR_SHIFT1 = 5;
static constexpr int32_t ISAAC_ROOM_B4_XOR_SHIFT2 = 9;
static constexpr int32_t ISAAC_ROOM_B4_XOR_SHIFT3 = 7;
static constexpr uint32_t ISAAC_ROOM_B4_Y_OFFSET_BITS = 0x42000000u;
static constexpr uint32_t ISAAC_ROOM_B5_ENTITY_RNG_SHIFT0_OFF = 0x3e0u;
static constexpr uint32_t ISAAC_ROOM_B5_ENTITY_RNG_SHIFT1_OFF = 0x3e4u;
static constexpr uint32_t ISAAC_ROOM_B5_ENTITY_RNG_SHIFT2_OFF = 0x3e8u;
static constexpr int32_t ISAAC_ROOM_B5_FLAG_BIT = 0x20000000;
static constexpr uint32_t ISAAC_ROOM_B5_HOST_VA_COUNT = 0x00708250u;
static constexpr uint32_t ISAAC_ROOM_B5_HOST_VA_NEXT = 0x00803b1du;
static constexpr uint32_t ISAAC_ROOM_B5_HOST_VA_OUTER = 0x00803886u;
static constexpr uint32_t ISAAC_ROOM_B5_HOST_VA_PASS1 = 0x008038d0u;
static constexpr uint32_t ISAAC_ROOM_B5_HOST_VA_PASS1_APPEND = 0x00803954u;
static constexpr uint32_t ISAAC_ROOM_B5_HOST_VA_PASS1_GROW = 0x00803979u;
static constexpr uint32_t ISAAC_ROOM_B5_HOST_VA_PASS1_VCALL48 = 0x0080391cu;
static constexpr uint32_t ISAAC_ROOM_B5_HOST_VA_PASS2 = 0x008039d0u;
static constexpr uint32_t ISAAC_ROOM_B5_HOST_VA_PASS2_GROW = 0x00803ad8u;
static constexpr uint32_t ISAAC_ROOM_B5_HOST_VA_PASS2_RNG = 0x00803a60u;
static constexpr uint32_t ISAAC_ROOM_B5_HOST_VA_PASS2_VCALL48 = 0x00803a24u;
static constexpr uint32_t ISAAC_ROOM_B5_HOST_VA_PASS2_VCALL4C = 0x00803a42u;
static constexpr uint32_t ISAAC_ROOM_B5_HOST_VA_START = 0x00803854u;
static constexpr uint32_t ISAAC_ROOM_B5_HOST_VA_VECTOR_PUSH = 0x0042c920u;
static constexpr uint32_t ISAAC_ROOM_B5_LIST_BEGIN_VA = 0x00c82674u;
static constexpr uint32_t ISAAC_ROOM_B5_LIST_CAP_VA = 0x00c8267cu;
static constexpr uint32_t ISAAC_ROOM_B5_LIST_END_VA = 0x00c82678u;
static constexpr uint32_t ISAAC_ROOM_B5_LIST_PTR_STRIDE = 4u;
static constexpr int32_t ISAAC_ROOM_B5_MODE_GATE = 2;
static constexpr int32_t ISAAC_ROOM_B5_PASS1_MODE = 0x28;
static constexpr int32_t ISAAC_ROOM_B5_PASS2_COUNT_MIN = 3;
static constexpr int32_t ISAAC_ROOM_B5_TYPE_EXCLUDE_A = 0x2d;
static constexpr int32_t ISAAC_ROOM_B5_TYPE_EXCLUDE_B = 0x54;
static constexpr int32_t ISAAC_ROOM_B5_TYPE_EXCLUDE_C = 0x112;
static constexpr int32_t ISAAC_ROOM_B5_TYPE_EXCLUDE_D = 0x113;
static constexpr int32_t ISAAC_ROOM_B5_TYPE_EXCLUDE_E = 0x4e;
static constexpr int32_t ISAAC_ROOM_B5_TYPE_RANGE_BASE = 10;
static constexpr int32_t ISAAC_ROOM_B5_TYPE_RANGE_SPAN = 0x3de;
static constexpr uint32_t ISAAC_ROOM_B5_VARIANT_EXCLUDE_E = 0xau;
static constexpr uint32_t ISAAC_ROOM_B5_VCALL_OFF_48 = 0x48u;
static constexpr uint32_t ISAAC_ROOM_B5_VCALL_OFF_4C = 0x4cu;
static constexpr uint32_t ISAAC_ROOM_B6_HOST_VA_COUNTDOWN = 0x00803b1du;
static constexpr uint32_t ISAAC_ROOM_B6_HOST_VA_TREE = 0x00803b2eu;
static constexpr uint32_t ISAAC_ROOM_B6_HOST_VA_TREE_ERASE = 0x00424540u;
static constexpr uint32_t ISAAC_ROOM_B6_HOST_VA_TREE_INC = 0x00414a80u;
static constexpr uint32_t ISAAC_ROOM_B7_GRID_BASE_OFF = 0x24u;
static constexpr uint32_t ISAAC_ROOM_B7_HOST_VA_LOOP = 0x00803bd0u;
static constexpr uint32_t ISAAC_ROOM_B7_HOST_VA_START = 0x00803bb4u;
static constexpr uint32_t ISAAC_ROOM_B7_HOST_VA_VCALL = 0x00803bd8u;
static constexpr int32_t ISAAC_ROOM_B7_SLOT_STRIDE = 4;
static constexpr uint32_t ISAAC_ROOM_B7_VCALL_OFF = 8u;
static constexpr int32_t ISAAC_ROOM_B9B11_CHALLENGE_FRAME_AGE = 4;
static constexpr int32_t ISAAC_ROOM_B9B11_CHALLENGE_ID = 0x226;
static constexpr int32_t ISAAC_ROOM_B9B11_CHALLENGE_ROOM_TYPE = 0x11;
static constexpr int32_t ISAAC_ROOM_B9B11_FRAME_AGE1 = 1;
static constexpr int32_t ISAAC_ROOM_B9B11_FREE_ENTITY_TYPE = 5;
static constexpr uint32_t ISAAC_ROOM_B9B11_FREE_ENTITY_VARIANT = 0x64u;
static constexpr uint32_t ISAAC_ROOM_B9B11_HOST_VA_409030 = 0x00409030u;
static constexpr uint32_t ISAAC_ROOM_B9B11_HOST_VA_40A5D0 = 0x0040a5d0u;
static constexpr uint32_t ISAAC_ROOM_B9B11_HOST_VA_7EB870 = 0x007eb870u;
static constexpr uint32_t ISAAC_ROOM_B9B11_HOST_VA_8020D0 = 0x008020d0u;
static constexpr uint32_t ISAAC_ROOM_B9B11_HOST_VA_83A080 = 0x0083a080u;
static constexpr uint32_t ISAAC_ROOM_B9B11_HOST_VA_930820 = 0x00930820u;
static constexpr uint32_t ISAAC_ROOM_B9B11_HOST_VA_B10_START = 0x00803e0au;
static constexpr uint32_t ISAAC_ROOM_B9B11_HOST_VA_B11_START = 0x00803e70u;
static constexpr uint32_t ISAAC_ROOM_B9B11_HOST_VA_B12_START = 0x00804113u;
static constexpr uint32_t ISAAC_ROOM_B9B11_HOST_VA_B9_START = 0x00803ce5u;
static constexpr uint32_t ISAAC_ROOM_B9B11_HOST_VA_CAMERA = 0x007df690u;
static constexpr uint32_t ISAAC_ROOM_B9B11_HOST_VA_FATAL = 0x00a112c0u;
static constexpr uint32_t ISAAC_ROOM_B9B11_HOST_VA_FLAG_11F4 = 0x007fe220u;
static constexpr uint32_t ISAAC_ROOM_B9B11_HOST_VA_FREE_HELPER = 0x00833420u;
static constexpr uint32_t ISAAC_ROOM_B9B11_HOST_VA_FREE_LOOKUP = 0x0041af60u;
static constexpr uint32_t ISAAC_ROOM_B9B11_HOST_VA_GENRAND = 0x006eef60u;
static constexpr uint32_t ISAAC_ROOM_B9B11_HOST_VA_MANAGER_A = 0x004186c0u;
static constexpr uint32_t ISAAC_ROOM_B9B11_HOST_VA_MANAGER_B = 0x00993a70u;
static constexpr uint32_t ISAAC_ROOM_B9B11_HOST_VA_MODE_HOOKS = 0x00834350u;
static constexpr uint32_t ISAAC_ROOM_B9B11_HOST_VA_QUERY = 0x009be080u;
static constexpr uint32_t ISAAC_ROOM_B9B11_HOST_VA_REWIND = 0x0040a1b0u;
static constexpr int32_t ISAAC_ROOM_B9B11_MODE_TYPE_11 = 0x11;
static constexpr int32_t ISAAC_ROOM_B9B11_MODE_TYPE_B = 0xb;
static constexpr int32_t ISAAC_ROOM_B9B11_RESIDUAL_ALWAYS_HOST = 1;
static constexpr int32_t ISAAC_ROOM_B9B11_RESIDUAL_MONOLITHIC = 2;
static constexpr int32_t ISAAC_ROOM_B9B11_STAGE_ID_1A = 0x1a;
static constexpr int32_t ISAAC_ROOM_B9B11_TEMPFX_STRIDE = 0x10;
static constexpr uint32_t ISAAC_ROOM_B9B11_TEMPFX_VARIANT = 0x1e1u;
static constexpr int32_t ISAAC_ROOM_B9_FREE_ARG_PAD0 = 0;
static constexpr int32_t ISAAC_ROOM_B9_FREE_ARG_PAD1 = 0;
static constexpr int32_t ISAAC_ROOM_B9_FREE_ENTITY_SUBTYPE = -1;
static constexpr int32_t ISAAC_ROOM_B9_FREE_ENTITY_TYPE = 5;
static constexpr uint32_t ISAAC_ROOM_B9_FREE_ENTITY_VARIANT = 0x64u;
static constexpr int32_t ISAAC_ROOM_B9_FREE_HEAP_STATS_DELTA = 0x30;
static constexpr int32_t ISAAC_ROOM_B9_FREE_HEAP_STATS_FALLBACK = 0x00c7f618;
static constexpr int32_t ISAAC_ROOM_B9_FREE_HEAP_STATS_GLOBAL = 0x00c7de78;
static constexpr uint32_t ISAAC_ROOM_B9_FREE_HELPER_THIS_OFF = 0x265c8u;
static constexpr uint32_t ISAAC_ROOM_B9_FREE_HOST_VA_BODY = 0x00803d4bu;
static constexpr uint32_t ISAAC_ROOM_B9_FREE_HOST_VA_FREE_SITE = 0x00803d98u;
static constexpr uint32_t ISAAC_ROOM_B9_FREE_HOST_VA_HELPER = 0x00833420u;
static constexpr uint32_t ISAAC_ROOM_B9_FREE_HOST_VA_LOOKUP = 0x0041af60u;
static constexpr uint32_t ISAAC_ROOM_B9_FREE_HOST_VA_NEXT = 0x00803dd3u;
static constexpr uint32_t ISAAC_ROOM_B9_FREE_IAT_VA = 0x00b187dcu;
static constexpr uint32_t ISAAC_ROOM_B9_FREE_RESULT_BYTE_OFF = 0u;
static constexpr uint32_t ISAAC_ROOM_B9_FREE_RESULT_COUNT_OFF = 0xcu;
static constexpr uint32_t ISAAC_ROOM_B9_FREE_RESULT_PTR_OFF = 4u;
static constexpr int32_t ISAAC_ROOM_B9_FREE_SEH_IN = 5;
static constexpr uint32_t ISAAC_ROOM_B9_FREE_SEH_OUT = 0xffffffffu;
static constexpr uint32_t ISAAC_ROOM_B9_FREE_THIS_OFF = 0x1218u;
static constexpr uint32_t ISAAC_ROOM_CLAMP_812F50_HOST_VA = 0x00812f50u;
static constexpr uint32_t ISAAC_ROOM_CLAMP_812F50_HOST_VA_AREADESC = 0x0081f8b0u;
static constexpr uint32_t ISAAC_ROOM_CLAMP_812F50_LROOM_ARM9_VA = 0x00813078u;
static constexpr uint32_t ISAAC_ROOM_CLAMP_812F50_LROOM_ARMA_VA = 0x008130bcu;
static constexpr uint32_t ISAAC_ROOM_CLAMP_812F50_LROOM_ARMB_VA = 0x008130fcu;
static constexpr uint32_t ISAAC_ROOM_CLAMP_812F50_LROOM_ARMC_VA = 0x0081311au;
static constexpr uint32_t ISAAC_ROOM_CLAMP_812F50_LROOM_BODY_VA = 0x00812f8au;
static constexpr int32_t ISAAC_ROOM_CLAMP_812F50_LROOM_BUF_DEAD_INDEX = 1;
static constexpr int32_t ISAAC_ROOM_CLAMP_812F50_LROOM_BUF_FLOATS = 7;
static constexpr uint32_t ISAAC_ROOM_CLAMP_812F50_LROOM_CALL_VA = 0x00812fa7u;
static constexpr uint32_t ISAAC_ROOM_CLAMP_812F50_LROOM_SELECT_VA = 0x00813025u;
static constexpr uint32_t ISAAC_ROOM_CLAMP_812F50_LROOM_SHAPE_REREAD_VA = 0x00813045u;
static constexpr int32_t ISAAC_ROOM_CLAMP_812F50_LROOM_STORE_LIMIT = 2;
static constexpr int32_t ISAAC_ROOM_CLAMP_812F50_LROOM_STORE_SEL_Y = 1;
static constexpr int32_t ISAAC_ROOM_CLAMP_812F50_LROOM_STORE_SIMPLE = 0;
static constexpr uint32_t ISAAC_ROOM_CLAMP_812F50_LROOM_TAIL_VA = 0x00813155u;
static constexpr uint32_t ISAAC_ROOM_CLAMP_812F50_NEG_MASK_VA = 0x00bacb70u;
static constexpr int32_t ISAAC_ROOM_CLAMP_812F50_PATH_LROOM = 2;
static constexpr int32_t ISAAC_ROOM_CLAMP_812F50_PATH_PASSTHROUGH = 0;
static constexpr int32_t ISAAC_ROOM_CLAMP_812F50_PATH_SIMPLE = 1;
static constexpr uint32_t ISAAC_ROOM_CLAMP_812F50_ROOM_X0_OFF = 0x14u;
static constexpr uint32_t ISAAC_ROOM_CLAMP_812F50_ROOM_X1_OFF = 0x1cu;
static constexpr uint32_t ISAAC_ROOM_CLAMP_812F50_ROOM_Y0_OFF = 0x18u;
static constexpr uint32_t ISAAC_ROOM_CLAMP_812F50_ROOM_Y1_OFF = 0x20u;
static constexpr int32_t ISAAC_ROOM_CLAMP_812F50_SHAPE_LO = 9;
static constexpr uint32_t ISAAC_ROOM_CLAMP_812F50_SHAPE_OFF = 0x48u;
static constexpr int32_t ISAAC_ROOM_CLAMP_812F50_SHAPE_SPAN = 3;
static constexpr int32_t ISAAC_ROOM_CLAMP_812F50_SITE_A = 0x0081370b;
static constexpr int32_t ISAAC_ROOM_CLAMP_812F50_SITE_B = 0x008138f0;
static constexpr int32_t ISAAC_ROOM_DOOR_SLOT_COUNT = 8;
static constexpr int32_t ISAAC_ROOM_GENRAND_ACTION_EMIT = 0;
static constexpr int32_t ISAAC_ROOM_GENRAND_ACTION_RELOAD = 1;
static constexpr int32_t ISAAC_ROOM_GENRAND_ACTION_SEED_RELOAD = 2;
static constexpr uint32_t ISAAC_ROOM_GENRAND_CRT_BRACKET_CALLEE_VA = 0x00948fc0u;
static constexpr uint32_t ISAAC_ROOM_GENRAND_CRT_BRACKET_SITE_VA = 0x00916e5eu;
static constexpr uint32_t ISAAC_ROOM_GENRAND_CRT_CLEAR_VA = 0x00916e71u;
static constexpr uint32_t ISAAC_ROOM_GENRAND_CRT_OWNER_CALLER_VA = 0x0090b2ceu;
static constexpr uint32_t ISAAC_ROOM_GENRAND_CRT_OWNER_VA = 0x00916770u;
static constexpr uint32_t ISAAC_ROOM_GENRAND_CRT_PROVEN_SITE_VA = 0x009eb892u;
static constexpr uint32_t ISAAC_ROOM_GENRAND_CRT_READ_VA = 0x006eef8au;
static constexpr uint32_t ISAAC_ROOM_GENRAND_CRT_SET_VA = 0x00916e51u;
static constexpr int32_t ISAAC_ROOM_GENRAND_DEFAULT_SEED = 5489;
static constexpr uint32_t ISAAC_ROOM_GENRAND_HOST_VA_ALLOC = 0x00a0f4c0u;
static constexpr uint32_t ISAAC_ROOM_GENRAND_HOST_VA_CALL = 0x006eef60u;
static constexpr uint32_t ISAAC_ROOM_GENRAND_HOST_VA_EMIT = 0x006ef07fu;
static constexpr uint32_t ISAAC_ROOM_GENRAND_HOST_VA_FREE = 0x00aef15cu;
static constexpr uint32_t ISAAC_ROOM_GENRAND_HOST_VA_INIT = 0x006eef20u;
static constexpr uint32_t ISAAC_ROOM_GENRAND_HOST_VA_LOG_START = 0x006ef0b2u;
static constexpr uint32_t ISAAC_ROOM_GENRAND_HOST_VA_MEMSET = 0x00af05e5u;
static constexpr uint32_t ISAAC_ROOM_GENRAND_HOST_VA_RELOAD = 0x006eefcbu;
static constexpr uint32_t ISAAC_ROOM_GENRAND_HOST_VA_RET = 0x006ef1e4u;
static constexpr uint32_t ISAAC_ROOM_GENRAND_HOST_VA_TRIM_LOOP = 0x006ef182u;
static constexpr int32_t ISAAC_ROOM_GENRAND_IAT_BACKTRACE = 0x00b182c8;
static constexpr int32_t ISAAC_ROOM_GENRAND_IAT_CRT_RAND = 0x00b18994;
static constexpr int32_t ISAAC_ROOM_GENRAND_IAT_XLENGTH = 0x00b184d4;
static constexpr uint32_t ISAAC_ROOM_GENRAND_INDEX_VA = 0x00c34f04u;
static constexpr int32_t ISAAC_ROOM_GENRAND_INIT_INDEX = 624;
static constexpr int32_t ISAAC_ROOM_GENRAND_INIT_MULT = 0x6c078965;
static constexpr int32_t ISAAC_ROOM_GENRAND_INIT_SHIFT = 30;
static constexpr uint32_t ISAAC_ROOM_GENRAND_LOG_BACKTRACE_OFF = 0x10u;
static constexpr uint32_t ISAAC_ROOM_GENRAND_LOG_COUNT_VA = 0x00c79868u;
static constexpr uint32_t ISAAC_ROOM_GENRAND_LOG_DEPTH_OFF = 0x110u;
static constexpr uint32_t ISAAC_ROOM_GENRAND_LOG_DRAIN_VA = 0x00905114u;
static constexpr uint32_t ISAAC_ROOM_GENRAND_LOG_DTOR_VA = 0x00b165f0u;
static constexpr uint32_t ISAAC_ROOM_GENRAND_LOG_FACTOR_SRC_OFF = 0x4b3e8u;
static constexpr int32_t ISAAC_ROOM_GENRAND_LOG_FRAMES = 0x40;
static constexpr uint32_t ISAAC_ROOM_GENRAND_LOG_FRAME_OFF = 0x0cu;
static constexpr uint32_t ISAAC_ROOM_GENRAND_LOG_FRAME_SRC_OFF = 0x4b3e4u;
static constexpr uint32_t ISAAC_ROOM_GENRAND_LOG_LIST_VA = 0x00c79864u;
static constexpr int32_t ISAAC_ROOM_GENRAND_LOG_MAX_NODES = 0xed7303;
static constexpr uint32_t ISAAC_ROOM_GENRAND_LOG_NEXT_OFF = 0x00u;
static constexpr int32_t ISAAC_ROOM_GENRAND_LOG_NODE_BYTES = 0x114;
static constexpr int32_t ISAAC_ROOM_GENRAND_LOG_PAYLOAD_BYTES = 0x10c;
static constexpr uint32_t ISAAC_ROOM_GENRAND_LOG_PREV_OFF = 0x04u;
static constexpr uint32_t ISAAC_ROOM_GENRAND_LOG_SENTINEL_CTOR_VA = 0x004019b0u;
static constexpr uint32_t ISAAC_ROOM_GENRAND_LOG_VALUE_OFF = 0x08u;
static constexpr int32_t ISAAC_ROOM_GENRAND_LOG_ZERO2_BYTES = 0x108;
static constexpr uint32_t ISAAC_ROOM_GENRAND_LOG_ZERO2_OFF = 0x0cu;
static constexpr int32_t ISAAC_ROOM_GENRAND_LOOP1_END = 227;
static constexpr uint32_t ISAAC_ROOM_GENRAND_LOWER_MASK = 0x7fffffffu;
static constexpr int32_t ISAAC_ROOM_GENRAND_M = 397;
static constexpr uint32_t ISAAC_ROOM_GENRAND_MAG01_VA = 0x00b67f8cu;
static constexpr uint32_t ISAAC_ROOM_GENRAND_MATRIX_A = 0x9908b0dfu;
static constexpr uint32_t ISAAC_ROOM_GENRAND_MODE_FLAG_VA = 0x00c7ac68u;
static constexpr int32_t ISAAC_ROOM_GENRAND_N = 624;
static constexpr int32_t ISAAC_ROOM_GENRAND_STATE_BYTES = 2496;
static constexpr uint32_t ISAAC_ROOM_GENRAND_STATE_VA = 0x00c7ac70u;
static constexpr uint32_t ISAAC_ROOM_GENRAND_TEMPER_MASK_B = 0x9d2c5680u;
static constexpr uint32_t ISAAC_ROOM_GENRAND_TEMPER_MASK_C = 0xefc60000u;
static constexpr uint32_t ISAAC_ROOM_GENRAND_TEMPER_PRE_MASK_B = 0xff3a58adu;
static constexpr uint32_t ISAAC_ROOM_GENRAND_TEMPER_PRE_MASK_C = 0xffffdf8cu;
static constexpr int32_t ISAAC_ROOM_GENRAND_TEMPER_SHIFT_L = 18;
static constexpr int32_t ISAAC_ROOM_GENRAND_TEMPER_SHIFT_S = 7;
static constexpr int32_t ISAAC_ROOM_GENRAND_TEMPER_SHIFT_T = 15;
static constexpr int32_t ISAAC_ROOM_GENRAND_TEMPER_SHIFT_U = 11;
static constexpr int32_t ISAAC_ROOM_GENRAND_UNSEEDED_INDEX = 625;
static constexpr uint32_t ISAAC_ROOM_GENRAND_UPPER_MASK = 0x80000000u;
static constexpr int32_t ISAAC_ROOM_GRID_COLLISION_CFG_FIELD8_MATCH = 0x10;
static constexpr uint32_t ISAAC_ROOM_GRID_COLLISION_CFG_FIELD8_OFF = 0x08u;
static constexpr int32_t ISAAC_ROOM_GRID_COLLISION_CFG_TYPE_MATCH = 0x23;
static constexpr uint32_t ISAAC_ROOM_GRID_COLLISION_CFG_TYPE_OFF = 0x00u;
static constexpr int32_t ISAAC_ROOM_GRID_COLLISION_COST_BASE = 0x76c;
static constexpr int32_t ISAAC_ROOM_GRID_COLLISION_COST_HI = 0xf9f;
static constexpr int32_t ISAAC_ROOM_GRID_COLLISION_COST_LO = 0x3e8;
static constexpr int32_t ISAAC_ROOM_GRID_COLLISION_COST_MID = 0xbb8;
static constexpr uint32_t ISAAC_ROOM_GRID_COLLISION_DATA_OFF = 0x10u;
static constexpr uint32_t ISAAC_ROOM_GRID_COLLISION_DESC_OFF = 0x04u;
static constexpr int32_t ISAAC_ROOM_GRID_COLLISION_ENTITY_BASE = 0x24;
static constexpr uint32_t ISAAC_ROOM_GRID_COLLISION_ENTITY_FIELD_OFF = 0x3cu;
static constexpr uint32_t ISAAC_ROOM_GRID_COLLISION_HOST_VA = 0x007f0800u;
static constexpr int32_t ISAAC_ROOM_GRID_COLLISION_PATH_CONFIG = 0;
static constexpr int32_t ISAAC_ROOM_GRID_COLLISION_PATH_COST_HIGH = 5;
static constexpr int32_t ISAAC_ROOM_GRID_COLLISION_PATH_COST_LOW = 4;
static constexpr int32_t ISAAC_ROOM_GRID_COLLISION_PATH_ENTITY = 2;
static constexpr int32_t ISAAC_ROOM_GRID_COLLISION_PATH_MID_BAND = 3;
static constexpr int32_t ISAAC_ROOM_GRID_COLLISION_PATH_NEG_INDEX = 1;
static constexpr uint32_t ISAAC_ROOM_GRID_COLLISION_SITE_VA = 0x00813577u;
static constexpr uint32_t ISAAC_ROOM_GRID_COLLISION_VALUE_HIGH = 3u;
static constexpr uint32_t ISAAC_ROOM_GRID_COLLISION_VALUE_MID_BAND = 1u;
static constexpr uint32_t ISAAC_ROOM_GRID_COLLISION_VALUE_NEG_INDEX = 4u;
static constexpr uint32_t ISAAC_ROOM_GRID_COLLISION_VALUE_ZERO = 0u;
static constexpr int32_t ISAAC_ROOM_MID_RESTOCK_COLLECTIBLE_ID = 0x209;
static constexpr uint32_t ISAAC_ROOM_MID_RESTOCK_DESC_OFF_AC = 0xacu;
static constexpr uint32_t ISAAC_ROOM_MID_RESTOCK_DESC_OFF_AE = 0xaeu;
static constexpr uint32_t ISAAC_ROOM_MID_RESTOCK_DESC_OFF_SEED58 = 0x58u;
static constexpr uint32_t ISAAC_ROOM_MID_RESTOCK_HOST_VA_BODY = 0x0080544au;
static constexpr uint32_t ISAAC_ROOM_MID_RESTOCK_HOST_VA_GET_COLLECTIBLE = 0x0072fd10u;
static constexpr uint32_t ISAAC_ROOM_MID_RESTOCK_HOST_VA_HAS_COLLECTIBLE = 0x007706e0u;
static constexpr uint32_t ISAAC_ROOM_MID_RESTOCK_HOST_VA_NEXT = 0x008054abu;
static constexpr uint32_t ISAAC_ROOM_MID_RESTOCK_HOST_VA_OUTER = 0x00805408u;
static constexpr uint32_t ISAAC_ROOM_MID_RESTOCK_HOST_VA_OWNER = 0x009be080u;
static constexpr uint32_t ISAAC_ROOM_MID_RESTOCK_HOST_VA_RANDOM_INT = 0x007e9020u;
static constexpr uint32_t ISAAC_ROOM_MID_RESTOCK_HOST_VA_SEED_FATAL = 0x00a112c0u;
static constexpr uint32_t ISAAC_ROOM_MID_RESTOCK_HOST_VA_WRITE = 0x0080549eu;
static constexpr uint32_t ISAAC_ROOM_MID_RESTOCK_OWNER_CONFIG_TWIN_BIT = 0x80000000u;
static constexpr int32_t ISAAC_ROOM_MID_RESTOCK_OWNER_LAZ_SHARED_TAG = 1;
static constexpr int32_t ISAAC_ROOM_MID_RESTOCK_OWNER_LIST_STRIDE = 4;
static constexpr uint32_t ISAAC_ROOM_MID_RESTOCK_OWNER_RNG_GAME_OFF = 0x1baa8u;
static constexpr int32_t ISAAC_ROOM_MID_RESTOCK_RESIDUAL_HOST_FATAL = 2;
static constexpr int32_t ISAAC_ROOM_MID_RESTOCK_RESIDUAL_MONOLITHIC = 3;
static constexpr int32_t ISAAC_ROOM_MID_RESTOCK_RESIDUAL_NONE = 0;
static constexpr int32_t ISAAC_ROOM_MID_RESTOCK_RESIDUAL_PURE_COMPLETE = 1;
static constexpr int32_t ISAAC_ROOM_MID_RESTOCK_RNG_SHIFT1 = 1;
static constexpr int32_t ISAAC_ROOM_MID_RESTOCK_RNG_SHIFT2 = 0x1b;
static constexpr int32_t ISAAC_ROOM_MID_RESTOCK_RNG_SHIFT3 = 0x1b;
static constexpr uint32_t ISAAC_ROOM_PRE_PLAY_800500_PLAY_VA = 0x00801c42u;
static constexpr uint32_t ISAAC_ROOM_PRE_PLAY_B1_PLAY_VA = 0x00802a82u;
static constexpr uint32_t ISAAC_ROOM_PRE_PLAY_B1_REMAP_VA = 0x00802a53u;
static constexpr uint32_t ISAAC_ROOM_PRE_PLAY_B1_SEED_VA = 0x00802a49u;
static constexpr int32_t ISAAC_ROOM_PRE_PLAY_GAME_GLOBAL = 0x00c71678;
static constexpr uint32_t ISAAC_ROOM_PRE_PLAY_HOST_VA = 0x00956780u;
static constexpr uint32_t ISAAC_ROOM_PRE_PLAY_HOST_VA_FATAL = 0x00a112c0u;
static constexpr uint32_t ISAAC_ROOM_PRE_PLAY_HOST_VA_LOOKUP = 0x004288a0u;
static constexpr uint32_t ISAAC_ROOM_PRE_PLAY_HOST_VA_PLAY = 0x0092dc30u;
static constexpr int32_t ISAAC_ROOM_PRE_PLAY_ID_GATED = 0x25;
static constexpr int32_t ISAAC_ROOM_PRE_PLAY_ID_RARE = 0x12d;
static constexpr int32_t ISAAC_ROOM_PRE_PLAY_MAP_KEY = 7;
static constexpr int32_t ISAAC_ROOM_PRE_PLAY_NODE_LIMIT = 7;
static constexpr int32_t ISAAC_ROOM_PRE_PLAY_RARE_MODULUS = 20;
static constexpr int32_t ISAAC_ROOM_PRE_PLAY_RNG_SEED_GLOBAL = 0x00c5d2b0;
static constexpr uint32_t ISAAC_ROOM_PRE_PLAY_TAILMID_PLAY_VA = 0x008020c2u;
static constexpr uint32_t ISAAC_ROOM_PRE_PLAY_TAILMID_REMAP_VA = 0x00802095u;
static constexpr uint32_t ISAAC_ROOM_PRE_PLAY_TAILMID_SEED_VA = 0x0080208du;
static constexpr uint32_t ISAAC_ROOM_TAILMID_800500_ABS_MASK = 0x7fffffffu;
static constexpr int32_t ISAAC_ROOM_TAILMID_800500_CH_7084 = 0x10d;
static constexpr int32_t ISAAC_ROOM_TAILMID_800500_CH_7088 = 4;
static constexpr int32_t ISAAC_ROOM_TAILMID_800500_CH_708C = 0x117;
static constexpr int32_t ISAAC_ROOM_TAILMID_800500_CH_70C0 = 0x264;
static constexpr uint32_t ISAAC_ROOM_TAILMID_800500_DEFAULT_INTENSITY_BITS = 0x3f800000u;
static constexpr uint32_t ISAAC_ROOM_TAILMID_800500_DIST_SCALE_BITS = 0x43e10000u;
static constexpr uint32_t ISAAC_ROOM_TAILMID_800500_FLAG_168_MASK = 0x20u;
static constexpr uint32_t ISAAC_ROOM_TAILMID_800500_FLAG_16C_MASK = 0x2000000u;
static constexpr uint32_t ISAAC_ROOM_TAILMID_800500_ROOM_ENTITY_COUNT_OFF = 0x1264u;
static constexpr uint32_t ISAAC_ROOM_TAILMID_800500_ROOM_ENTITY_LIST_OFF = 0x125cu;
static constexpr uint32_t ISAAC_ROOM_TAILMID_800500_ROOM_TIMER_72FC_OFF = 0x72fcu;
static constexpr uint32_t ISAAC_ROOM_TAILMID_800500_STEP_HALF_BITS = 0x3f000000u;
static constexpr uint32_t ISAAC_ROOM_TAILMID_800500_STEP_SMALL_BITS = 0x3cf5c28fu;
static constexpr uint32_t ISAAC_ROOM_TAILMID_800500_TIMER_CLEAR = 0xffffffffu;
static constexpr int32_t ISAAC_ROOM_TAILMID_800500_TIMER_SFX_GATE = 10;
static constexpr int32_t ISAAC_ROOM_TAILMID_800500_TIMER_SFX_ID = 0x1cc;
static constexpr int32_t ISAAC_ROOM_TAILMID_800500_TYPE_BAND_BASE = 10;
static constexpr int32_t ISAAC_ROOM_TAILMID_800500_TYPE_BAND_SPAN = 0x3dd;
static constexpr int32_t ISAAC_ROOM_TAILMID_800500_TYPE_EFFECT = 1000;
static constexpr int32_t ISAAC_ROOM_TAILMID_800500_TYPE_PLAYER = 1;
static constexpr int32_t ISAAC_ROOM_TAILMID_800500_TYPE_TEAR = 7;
static constexpr int32_t ISAAC_ROOM_TAILMID_CURSE_EFFECT_TYPE = 0x3e8;
static constexpr uint32_t ISAAC_ROOM_TAILMID_CURSE_EFFECT_VARIANT = 0x7fu;
static constexpr int32_t ISAAC_ROOM_TAILMID_CURSE_FLAG_BIT = 0x4000;
static constexpr uint32_t ISAAC_ROOM_TAILMID_CURSE_HALF_BITS = 0x3f000000u;
static constexpr uint32_t ISAAC_ROOM_TAILMID_CURSE_POS_VEC_PTR = 0x00c7b640u;
static constexpr uint32_t ISAAC_ROOM_TAILMID_CURSE_VEL_SCALE_BITS = 0x43480000u;
static constexpr int32_t ISAAC_ROOM_TAILMID_DESC_CLEAR_BIT40 = 0x40;
static constexpr int32_t ISAAC_ROOM_TAILMID_FRAG_HOST = 1;
static constexpr int32_t ISAAC_ROOM_TAILMID_FRAG_MONOLITHIC = 2;
static constexpr int32_t ISAAC_ROOM_TAILMID_FRAG_NONE = 0;
static constexpr uint32_t ISAAC_ROOM_TAILMID_HOST_VA_800500 = 0x00800500u;
static constexpr uint32_t ISAAC_ROOM_TAILMID_HOST_VA_800500_BODY = 0x00800754u;
static constexpr uint32_t ISAAC_ROOM_TAILMID_HOST_VA_800500_EMPTY = 0x00801137u;
static constexpr uint32_t ISAAC_ROOM_TAILMID_HOST_VA_800500_EPILOGUE = 0x00801544u;
static constexpr uint32_t ISAAC_ROOM_TAILMID_HOST_VA_800500_INTENSITY = 0x0092e620u;
static constexpr uint32_t ISAAC_ROOM_TAILMID_HOST_VA_800500_ISLOCAL = 0x0090b100u;
static constexpr uint32_t ISAAC_ROOM_TAILMID_HOST_VA_800500_ISPLAYING = 0x0092e560u;
static constexpr uint32_t ISAAC_ROOM_TAILMID_HOST_VA_800500_PLAYER_POS = 0x009beba0u;
static constexpr uint32_t ISAAC_ROOM_TAILMID_HOST_VA_800500_TIMER = 0x00801bf9u;
static constexpr uint32_t ISAAC_ROOM_TAILMID_HOST_VA_801EE0 = 0x00801ee0u;
static constexpr uint32_t ISAAC_ROOM_TAILMID_HOST_VA_CURSE = 0x00820910u;
static constexpr uint32_t ISAAC_ROOM_TAILMID_HOST_VA_CURSE_CREATE = 0x006fe410u;
static constexpr uint32_t ISAAC_ROOM_TAILMID_HOST_VA_CURSE_GENRAND = 0x006eef60u;
static constexpr uint32_t ISAAC_ROOM_TAILMID_HOST_VA_CURSE_GETPLAYER = 0x00417870u;
static constexpr uint32_t ISAAC_ROOM_TAILMID_HOST_VA_CURSE_SQRT = 0x00435a50u;
static constexpr uint32_t ISAAC_ROOM_TAILMID_HOST_VA_GATE = 0x00805378u;
static constexpr uint32_t ISAAC_ROOM_TAILMID_HOST_VA_ISPAUSED = 0x006fd350u;
static constexpr uint32_t ISAAC_ROOM_TAILMID_HOST_VA_MUSIC = 0x007e1d50u;
static constexpr uint32_t ISAAC_ROOM_TAILMID_HOST_VA_NEXT = 0x008053e2u;
static constexpr uint32_t ISAAC_ROOM_TAILMID_HOST_VA_SFX_PLAY = 0x0092dc30u;
static constexpr uint32_t ISAAC_ROOM_TAILMID_HOST_VA_SFX_PRE = 0x00956780u;
static constexpr uint32_t ISAAC_ROOM_TAILMID_HOST_VA_SPAWN_WAVE = 0x00816910u;
static constexpr uint32_t ISAAC_ROOM_TAILMID_HOST_VA_TRIGGER_OUTPUT = 0x00823080u;
static constexpr int32_t ISAAC_ROOM_TAILMID_MUSIC_ID = 9;
static constexpr int32_t ISAAC_ROOM_TAILMID_RESIDUAL_HOST = 1;
static constexpr int32_t ISAAC_ROOM_TAILMID_RESIDUAL_MONOLITHIC = 2;
static constexpr int32_t ISAAC_ROOM_TAILMID_RESIDUAL_NONE = 0;
static constexpr int32_t ISAAC_ROOM_TAILMID_SFX_FRAME_DELAY = 2;
static constexpr int32_t ISAAC_ROOM_TAILMID_SFX_ID = 0xbe;
static constexpr int32_t ISAAC_ROOM_TAILMID_SFX_LOOP = 0;
static constexpr uint32_t ISAAC_ROOM_TAILMID_SFX_PAN_BITS = 0u;
static constexpr uint32_t ISAAC_ROOM_TAILMID_SFX_PITCH_BITS = 0x3f800000u;
static constexpr uint32_t ISAAC_ROOM_TAILMID_SFX_VOLUME_BITS = 0x3f800000u;
static constexpr int32_t ISAAC_ROOM_TAILMID_SPECIAL_EFFECT_TYPE = 0x14;
static constexpr uint32_t ISAAC_ROOM_TAILMID_SPECIAL_EFFECT_VARIANT = 0u;
static constexpr int32_t ISAAC_ROOM_TAILMID_SPECIAL_FLAG_BIT = 0x1000;
static constexpr int32_t ISAAC_ROOM_TAILMID_SPECIAL_ROOM_TYPE = 5;
static constexpr int32_t ISAAC_ROOM_TAILMID_SPECIAL_STAGE = 7;
static constexpr int32_t ISAAC_ROOM_TAILMID_WAVE_TIMER_GATE = 0x14;
static constexpr int32_t ISAAC_ROOM_TAILMID_WAVE_TIMER_SET = 0x13;

#pragma pack(push, 1)
typedef struct IsaacRoomCameraFxState {
  int32_t counter_70d8;
  int32_t limit_70dc;
  float value_70cc;
  float step_70d4;
  int32_t counter_70f4;
  int32_t limit_70f8;
  float value_70e8;
  float step_70f0;
} IsaacRoomCameraFxState;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomCameraFxState) == 32, "IsaacRoomCameraFxState size");

#pragma pack(push, 1)
typedef struct IsaacRoomClearDelayState {
  int32_t alive_a;
  int32_t alive_b;
  int32_t room_clear_delay;
  int32_t greed_wave_timer;
  int32_t room_type;
  int32_t room_subtype;
  int32_t enemies_present;
} IsaacRoomClearDelayState;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomClearDelayState) == 28, "IsaacRoomClearDelayState size");

#pragma pack(push, 1)
typedef struct IsaacRoomWaterLavaState {
  float water_amount_7240;
  float lava_intensity_7740;
  int32_t room_type_8;
  int32_t challenge_0x123;
  uint32_t room_desc_flags_44;
} IsaacRoomWaterLavaState;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomWaterLavaState) == 20, "IsaacRoomWaterLavaState size");

#pragma pack(push, 1)
typedef struct IsaacRoomTriggerClearEntry {
  uint32_t room_desc_flags_44;
  int16_t room_desc_clear_count_4a;
  uint16_t _pad_6;
} IsaacRoomTriggerClearEntry;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomTriggerClearEntry) == 8, "IsaacRoomTriggerClearEntry size");

#pragma pack(push, 1)
typedef struct IsaacDoorSlotFields {
  uint32_t present;
  uint32_t field_3a0;
  int32_t field_8;
  int32_t field_c;
} IsaacDoorSlotFields;
#pragma pack(pop)
static_assert(sizeof(IsaacDoorSlotFields) == 16, "IsaacDoorSlotFields size");

#pragma pack(push, 1)
typedef struct IsaacRoomB1ResidualPlan {
  int32_t outer_gate;
  int32_t sfx_needs_host;
  int32_t once_flag_clear;
  int32_t spawn_needs_host;
  int32_t residual_kind;
  int32_t pure_complete;
  int32_t host_needed;
  int32_t pure_once_flag_apply;
  uint32_t sfx_id;
  float sfx_volume;
  int32_t sfx_frame_delay;
  int32_t sfx_loop;
  float sfx_pitch;
  float sfx_pan;
} IsaacRoomB1ResidualPlan;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomB1ResidualPlan) == 56, "IsaacRoomB1ResidualPlan size");

#pragma pack(push, 1)
typedef struct IsaacRoomAmbient824800State {
  int32_t count_7454;
  float intensity_7458;
  int32_t flag_745c;
} IsaacRoomAmbient824800State;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomAmbient824800State) == 12, "IsaacRoomAmbient824800State size");

#pragma pack(push, 1)
typedef struct IsaacRoomB18ResidualPlan {
  int32_t needs_host;
  int32_t residual_kind;
  int32_t pure_complete;
  int32_t host_needed;
  int32_t entity_count;
} IsaacRoomB18ResidualPlan;
#pragma pack(pop)

#pragma pack(push, 1)
typedef struct IsaacRoomB19ResidualPlan {
  int32_t needs_host;
  int32_t residual_kind;
  int32_t pure_complete;
  int32_t host_needed;
  int32_t cell_count;
} IsaacRoomB19ResidualPlan;
#pragma pack(pop)

#pragma pack(push, 1)
typedef struct IsaacRoomTailmidCenters {
  float span_x;
  float span_y;
  float center_x;
  float center_y;
} IsaacRoomTailmidCenters;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomTailmidCenters) == 16, "IsaacRoomTailmidCenters size");

#pragma pack(push, 1)
typedef struct IsaacRoomTailmidDeltas {
  float dx;
  float dy;
} IsaacRoomTailmidDeltas;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomTailmidDeltas) == 8, "IsaacRoomTailmidDeltas size");

#pragma pack(push, 1)
typedef struct IsaacRoom7230FinishGrid {
  int32_t grid_x;
  int32_t grid_y;
  int32_t x_valid;
  int32_t y_valid;
  int32_t index;
  int32_t valid;
} IsaacRoom7230FinishGrid;
#pragma pack(pop)
static_assert(sizeof(IsaacRoom7230FinishGrid) == 24, "IsaacRoom7230FinishGrid size");
static_assert(offsetof(IsaacRoom7230FinishGrid, valid) == 20, "IsaacRoom7230FinishGrid valid offset");

#pragma pack(push, 1)
typedef struct IsaacRoom7230FinishSqrt {
  float value;
  int32_t crt_host_needed;
} IsaacRoom7230FinishSqrt;
#pragma pack(pop)
static_assert(sizeof(IsaacRoom7230FinishSqrt) == 8, "IsaacRoom7230FinishSqrt size");
static_assert(offsetof(IsaacRoom7230FinishSqrt, crt_host_needed) == 4, "IsaacRoom7230FinishSqrt crt_host_needed offset");

#pragma pack(push, 1)
typedef struct IsaacRoom7230DoorSlotSnapshot {
  uint32_t present;
  int32_t door_index;
} IsaacRoom7230DoorSlotSnapshot;
#pragma pack(pop)
static_assert(sizeof(IsaacRoom7230DoorSlotSnapshot) == 8, "IsaacRoom7230DoorSlotSnapshot size");

#pragma pack(push, 1)
typedef struct IsaacRoom7230WalkProximity {
  float dx;
  float dy;
  float dist2;
  float dist;
  int32_t reject;
  int32_t sqrt_host_needed;
} IsaacRoom7230WalkProximity;
#pragma pack(pop)
static_assert(sizeof(IsaacRoom7230WalkProximity) == 24, "IsaacRoom7230WalkProximity size");

#pragma pack(push, 1)
typedef struct IsaacRoomGridCollisionResult {
  uint32_t value;
  int32_t path;
  int32_t index_negative;
  int32_t index_unchecked_high;
} IsaacRoomGridCollisionResult;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomGridCollisionResult) == 16, "IsaacRoomGridCollisionResult size");
static_assert(offsetof(IsaacRoomGridCollisionResult, index_unchecked_high) == 12, "IsaacRoomGridCollisionResult index_unchecked_high offset");

#pragma pack(push, 1)
typedef struct IsaacRoomGridCollisionQuery {
  int32_t data_present;
  int32_t cfg_type;
  int32_t cfg_field8;
  int32_t index;
  int32_t grid_entity_present;
  int32_t grid_entity_field3c;
  int32_t grid_cost;
} IsaacRoomGridCollisionQuery;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomGridCollisionQuery) == 28, "IsaacRoomGridCollisionQuery size");
static_assert(offsetof(IsaacRoomGridCollisionQuery, grid_cost) == 24, "IsaacRoomGridCollisionQuery grid_cost offset");

#pragma pack(push, 1)
typedef struct IsaacRoomGenrandStep {
  uint32_t value;
  uint32_t raw;
  int32_t index_in;
  int32_t index_out;
  int32_t action;
  int32_t reloaded;
  int32_t seeded;
  int32_t index_oob;
} IsaacRoomGenrandStep;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomGenrandStep) == 32, "IsaacRoomGenrandStep size");
static_assert(offsetof(IsaacRoomGenrandStep, index_in) == 8, "IsaacRoomGenrandStep index_in offset");
static_assert(offsetof(IsaacRoomGenrandStep, index_oob) == 28, "IsaacRoomGenrandStep index_oob offset");

#pragma pack(push, 1)
typedef struct IsaacRoomClamp812f50Simple {
  float x;
  float y;
  float lo_x;
  float hi_x;
  float lo_y;
  float hi_y;
} IsaacRoomClamp812f50Simple;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomClamp812f50Simple) == 24, "IsaacRoomClamp812f50Simple size");
static_assert(offsetof(IsaacRoomClamp812f50Simple, hi_y) == 20, "IsaacRoomClamp812f50Simple hi_y offset");

#pragma pack(push, 1)
typedef struct IsaacRoom7230ClampSite {
  int32_t lroom_needed;
  float clamped_x;
  float clamped_y;
} IsaacRoom7230ClampSite;
#pragma pack(pop)
static_assert(sizeof(IsaacRoom7230ClampSite) == 12, "IsaacRoom7230ClampSite size");

#pragma pack(push, 1)
typedef struct IsaacRoom7230DoorBlockPlan {
  int32_t kind;
  int32_t slot_index;
} IsaacRoom7230DoorBlockPlan;
#pragma pack(pop)
static_assert(sizeof(IsaacRoom7230DoorBlockPlan) == 8, "IsaacRoom7230DoorBlockPlan size");

#pragma pack(push, 1)
typedef struct IsaacRoom7230DoorRecursePlan {
  int32_t enter;               /* js guard: slot >= 0 && 4900 > enter_dist2 */
  int32_t div_ok;              /* gate idiv fault (width 0 / INT_MIN/-1) */
  int32_t budget_in;           /* budget at the head (first entry 0x14) */
  int32_t budget_out;          /* budget-1 (dec @0x00813a78, u32 wrap) */
  int32_t budget_enter;        /* head test: budget > 0 (signed jle) */
  int32_t nested_host_needed;  /* 1 — call @0x00813a99 stays host */
  uint32_t call_va;            /* 0x00813a99 */
  uint32_t radius_bits;        /* 0x42200000 (40.0f) */
  int32_t arg4;                /* 0 */
  int32_t arg5;                /* 0 */
  int32_t arg6;                /* 0 */
  float enter_dist2;           /* gate dist2 of the door cell vs out */
  float copy_x;                /* out.x = result.x @0x00813ab9 */
  float copy_y;                /* out.y = result.y @0x00813ac5 */
  float post_dist2;            /* gate dist2 of the door cell vs result */
  int32_t retry;               /* 4900 > post_dist2 (comiss+ja @0x00813b18) */
  int32_t loop_continue;       /* budget_out > 0 && retry */
} IsaacRoom7230DoorRecursePlan;
#pragma pack(pop)
static_assert(sizeof(IsaacRoom7230DoorRecursePlan) == 68, "IsaacRoom7230DoorRecursePlan size");
static_assert(offsetof(IsaacRoom7230DoorRecursePlan, enter_dist2) == 44,
              "IsaacRoom7230DoorRecursePlan enter_dist2 offset");
static_assert(offsetof(IsaacRoom7230DoorRecursePlan, loop_continue) == 64,
              "IsaacRoom7230DoorRecursePlan loop_continue offset");

#pragma pack(push, 1)
typedef struct IsaacRoom7230DoorProximity {
  float dist2;
  int32_t recurse_needed;
  float door_x;
  float door_y;
  int32_t quot;
  int32_t rem;
  int32_t div_ok;
} IsaacRoom7230DoorProximity;
#pragma pack(pop)
static_assert(sizeof(IsaacRoom7230DoorProximity) == 28, "IsaacRoom7230DoorProximity size");

#pragma pack(push, 1)
typedef struct IsaacRoom7230FinishMathResidual {
  int32_t cos_host_needed;
  int32_t sin_host_needed;
  int32_t sqrt_host_needed;
  int32_t sqrt_pure;
  uint32_t host_va_cos;
  uint32_t host_va_sin;
  uint32_t host_va_sqrt;
  int32_t iat_cos;
  int32_t iat_sin;
  int32_t iat_sqrt;
} IsaacRoom7230FinishMathResidual;
#pragma pack(pop)
static_assert(sizeof(IsaacRoom7230FinishMathResidual) == 40, "IsaacRoom7230FinishMathResidual size");

#pragma pack(push, 1)
typedef struct IsaacRoom7230FinishRecurseStep {
  int32_t budget_in;
  int32_t budget_out;
  int32_t enter;
} IsaacRoom7230FinishRecurseStep;
#pragma pack(pop)
static_assert(sizeof(IsaacRoom7230FinishRecurseStep) == 12, "IsaacRoom7230FinishRecurseStep size");

#pragma pack(push, 1)
typedef struct IsaacRoom7230FinishStep {
  int32_t counter;
  int32_t continue_loop;
  int32_t threshold;
  uint32_t seed_in;
  uint32_t seed_fatal;
  uint32_t seed_out;
  float angle;
  float radius;
} IsaacRoom7230FinishStep;
#pragma pack(pop)
static_assert(sizeof(IsaacRoom7230FinishStep) == 32, "IsaacRoom7230FinishStep size");

#pragma pack(push, 1)
typedef struct IsaacRoom7230FinishWorld {
  float x;
  float y;
  int32_t quot;
  int32_t rem;
  int32_t div_ok;
} IsaacRoom7230FinishWorld;
#pragma pack(pop)
static_assert(sizeof(IsaacRoom7230FinishWorld) == 20, "IsaacRoom7230FinishWorld size");

#pragma pack(push, 1)
typedef struct IsaacRoom7230SiteACost {
  int32_t pass;
  int32_t best_index;
  int32_t snapped;
  int32_t div_ok;
  float snap_x;
  float snap_y;
  int32_t entity_walk_needed;
} IsaacRoom7230SiteACost;
#pragma pack(pop)
static_assert(sizeof(IsaacRoom7230SiteACost) == 28, "IsaacRoom7230SiteACost size");

#pragma pack(push, 1)
typedef struct IsaacRoom7230SiteAProbe {
  int32_t identity_accept;
  int32_t phase;
  int32_t grid_x;
  int32_t grid_y;
  int32_t index;
  int32_t best_index;
} IsaacRoom7230SiteAProbe;
#pragma pack(pop)
static_assert(sizeof(IsaacRoom7230SiteAProbe) == 24, "IsaacRoom7230SiteAProbe size");

#pragma pack(push, 1)
typedef struct IsaacRoom7230SiteBSnap {
  int32_t grid_x;
  int32_t grid_y;
  uint32_t x_valid;
  uint32_t y_valid;
  int32_t valid;
  int32_t index;
  int32_t div_ok;
  int32_t quot;
  int32_t rem;
  float x;
  float y;
} IsaacRoom7230SiteBSnap;
#pragma pack(pop)
static_assert(sizeof(IsaacRoom7230SiteBSnap) == 44, "IsaacRoom7230SiteBSnap size");

#pragma pack(push, 1)
typedef struct IsaacRoom7230SpawnCandidate {
  float radius;
  uint32_t seed_fatal;
  uint32_t seed_out;
  float angle;
  float cand_x;
  float cand_y;
} IsaacRoom7230SpawnCandidate;
#pragma pack(pop)
static_assert(sizeof(IsaacRoom7230SpawnCandidate) == 24, "IsaacRoom7230SpawnCandidate size");

#pragma pack(push, 1)
typedef struct IsaacRoom7230SpawnPosMt {
  float span_x;
  float span_y;
  float unit;
  float center_x;
  float center_y;
  float max_span;
  float radius_arg;
  int32_t genrand;
  int32_t index_in;
  int32_t index_out;
  int32_t genrand_pure;
} IsaacRoom7230SpawnPosMt;
#pragma pack(pop)
static_assert(sizeof(IsaacRoom7230SpawnPosMt) == 44, "IsaacRoom7230SpawnPosMt size");

#pragma pack(push, 1)
typedef struct IsaacRoom7230SpawnPosPosts {
  float span_x;
  float span_y;
  float unit;
  float center_x;
  float center_y;
  float max_span;
  float radius_arg;
} IsaacRoom7230SpawnPosPosts;
#pragma pack(pop)

#pragma pack(push, 1)
typedef struct IsaacRoom7230SpawnPositionPlan {
  int32_t draw_pure;
  int32_t crt_override;
  int32_t ring_host_needed;
  int32_t genrand;
  int32_t index_in;
  int32_t index_out;
  float span_x;
  float span_y;
  float unit;
  float center_x;
  float center_y;
  float max_span;
  float radius_arg;
  float handoff_radius;
  int32_t handoff_arg4;
  int32_t handoff_arg5;
  int32_t handoff_arg6;
  int32_t host_finish;
  int32_t iterations;
  uint32_t search_seed;
  int32_t first_counter;
  int32_t first_threshold;
} IsaacRoom7230SpawnPositionPlan;
#pragma pack(pop)
static_assert(sizeof(IsaacRoom7230SpawnPositionPlan) == 88, "IsaacRoom7230SpawnPositionPlan size");

#pragma pack(push, 1)
typedef struct IsaacRoom7230SpawnPreAccept {
  int32_t accept;
  int32_t reason;
} IsaacRoom7230SpawnPreAccept;
#pragma pack(pop)
static_assert(sizeof(IsaacRoom7230SpawnPreAccept) == 8, "IsaacRoom7230SpawnPreAccept size");

#pragma pack(push, 1)
typedef struct IsaacRoom7230SpawnSearchIteration {
  int32_t threshold;
  int32_t cost_read_needed;
  int32_t entity_read_needed;
  int32_t accept;
  int32_t reason;
  int32_t loop_continue;
  int32_t counter_next;
  uint32_t seed_out;
  uint32_t seed_fatal;
  int32_t next_best;
} IsaacRoom7230SpawnSearchIteration;
#pragma pack(pop)
static_assert(sizeof(IsaacRoom7230SpawnSearchIteration) == 40, "IsaacRoom7230SpawnSearchIteration size");

#pragma pack(push, 1)
typedef struct IsaacRoom7230SpawnSearchHead {
  int32_t best_index;
  uint32_t seed;
  int32_t iterations;
  int32_t first_counter;
  int32_t first_threshold;
  int32_t shift_a;
  int32_t shift_b;
  int32_t shift_c;
  uint32_t shift_table_va;
  uint32_t pos_vec_ptr;
  int32_t first_kind;
  int32_t after_grid_kind;
  int32_t cost_read_needed;
  int32_t entity_read_needed;
  int32_t grid_host_needed;
  int32_t loop_continue;
} IsaacRoom7230SpawnSearchHead;
#pragma pack(pop)
static_assert(sizeof(IsaacRoom7230SpawnSearchHead) == 64, "IsaacRoom7230SpawnSearchHead size");
static_assert(offsetof(IsaacRoom7230SpawnSearchHead, after_grid_kind) == 44, "IsaacRoom7230SpawnSearchHead after_grid_kind offset");
static_assert(offsetof(IsaacRoom7230SpawnSearchHead, loop_continue) == 60, "IsaacRoom7230SpawnSearchHead loop_continue offset");

#pragma pack(push, 1)
typedef struct IsaacRoom7230SpawnSearchVas {
  int32_t grid;
  int32_t best_cost_site;
  int32_t best_entity_site;
  int32_t cos;
  int32_t sin;
  int32_t clamp_site_a;
  int32_t lroom;
  int32_t probe_cost_site;
  int32_t walk_site;
  int32_t site_b_site;
  int32_t door_site;
  int32_t recurse_site;
} IsaacRoom7230SpawnSearchVas;
#pragma pack(pop)
static_assert(sizeof(IsaacRoom7230SpawnSearchVas) == 48, "IsaacRoom7230SpawnSearchVas size");

#pragma pack(push, 1)
typedef struct IsaacRoom7230SpawnSpans {
  float span_x;
  float span_y;
} IsaacRoom7230SpawnSpans;
#pragma pack(pop)

#pragma pack(push, 1)
typedef struct IsaacRoom7230SpawnStep {
  int32_t continue_loop;
  int32_t counter_next;
  int32_t threshold;
  int32_t accept;
  int32_t pre_reason;
  int32_t probe_phase;
  int32_t identity_accept;
  int32_t best_index;
  int32_t cost_pass;
  int32_t snapped;
  int32_t div_ok;
  float snap_x;
  float snap_y;
  int32_t walk_needed;
  int32_t exit_counter;
  float radius;
  uint32_t seed_out;
  float angle;
  float cand_x;
  float cand_y;
  int32_t clamp_lroom_needed;
  float clamped_x;
  float clamped_y;
  int32_t site_b_taken;
} IsaacRoom7230SpawnStep;
#pragma pack(pop)
static_assert(sizeof(IsaacRoom7230SpawnStep) == 96, "IsaacRoom7230SpawnStep size");
static_assert(offsetof(IsaacRoom7230SpawnStep, site_b_taken) == 92, "IsaacRoom7230SpawnStep site_b_taken offset");

#pragma pack(push, 1)
typedef struct IsaacRoom7230WalkListNext {
  int32_t node_addr;
  int32_t remaining;
  int32_t loop_continue;
} IsaacRoom7230WalkListNext;
#pragma pack(pop)
static_assert(sizeof(IsaacRoom7230WalkListNext) == 12, "IsaacRoom7230WalkListNext size");

#pragma pack(push, 1)
typedef struct IsaacRoomAmbient824a70AnimFramePosts {
  int32_t genrand_needed;
  int32_t frame;
  float frame_f32;
} IsaacRoomAmbient824a70AnimFramePosts;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomAmbient824a70AnimFramePosts) == 12, "IsaacRoomAmbient824a70AnimFramePosts size");

#pragma pack(push, 1)
typedef struct IsaacRoomAmbient824a70BodyBounds {
  float min_x;
  float span_x;
  float base_y;
  float span_y;
  float room_y_1c;
  int32_t age;
  int32_t loop_count;
} IsaacRoomAmbient824a70BodyBounds;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomAmbient824a70BodyBounds) == 28, "IsaacRoomAmbient824a70BodyBounds size");

#pragma pack(push, 1)
typedef struct IsaacRoomAmbient824a70Color {
  float r;
  float g;
  float b;
} IsaacRoomAmbient824a70Color;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomAmbient824a70Color) == 12, "IsaacRoomAmbient824a70Color size");

#pragma pack(push, 1)
typedef struct IsaacRoomAmbient824a70CreateArgsPlan {
  int32_t effect_type;
  uint32_t effect_variant;
  int32_t arg4_zero;
  int32_t arg5_zero;
  uint32_t seed;
  int32_t arg7_zero;
  int32_t game_ptr_global;
} IsaacRoomAmbient824a70CreateArgsPlan;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomAmbient824a70CreateArgsPlan) == 28, "IsaacRoomAmbient824a70CreateArgsPlan size");

#pragma pack(push, 1)
typedef struct IsaacRoomAmbient824a70CreateHostGates {
  int32_t r4_genrand_needed;
  int32_t a2_apply_needed;
  int32_t a2_clear_needed;
  int32_t layer_index;
  int32_t a1_arg;
  int32_t anm_data_ptr;
  int32_t entity_anm2_off;
  int32_t anim_count_off;
  int32_t a2_this_off;
  int32_t field_34_off;
  int32_t field_44_off;
  int32_t vcall_off;
  int32_t host_c0;
  int32_t host_a0;
  int32_t host_a1;
  int32_t host_a2;
  int32_t host_l0;
  int32_t host_v0;
} IsaacRoomAmbient824a70CreateHostGates;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomAmbient824a70CreateHostGates) == 72, "IsaacRoomAmbient824a70CreateHostGates size");

#pragma pack(push, 1)
typedef struct IsaacRoomAmbient824a70GenrandLoopPosts {
  float x;
  float y_rng;
  float y;
  float z;
  float vel_pad;
  uint32_t seed;
  int32_t flag_148;
  int32_t flag_149;
  float scale;
  int32_t y_override_applies;
  float pos_x_copy;
  int32_t pad_qword_lo;
  int32_t pad_qword_hi;
  int32_t pad_dword;
} IsaacRoomAmbient824a70GenrandLoopPosts;
#pragma pack(pop)

#pragma pack(push, 1)
typedef struct IsaacRoomAmbient824a70GenrandMtPlan {
  int32_t loop_count;
  int32_t samples_per_loop;
  int32_t max_genrand_per_loop;
  int32_t samples_needed;
  int32_t mt_state_ready;
  int32_t crt_rand_active;
  int32_t genrand_pure;
  int32_t pure_posts_ready;
  int32_t genrand_host_needed;
  int32_t body_host_needed;
  int32_t requires_mt_state;
  int32_t requires_sample_stream;
} IsaacRoomAmbient824a70GenrandMtPlan;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomAmbient824a70GenrandMtPlan) == 48, "IsaacRoomAmbient824a70GenrandMtPlan size");

#pragma pack(push, 1)
typedef struct IsaacRoomAmbient824a70GenrandStreamPlan {
  int32_t loop_count;
  int32_t samples_per_loop;
  int32_t max_genrand_per_loop;
  int32_t samples_needed;
  int32_t sample_count;
  int32_t samples_ready;
  int32_t pure_posts_ready;
  int32_t pure_complete;
  int32_t host_needed;
  int32_t requires_sample_stream;
} IsaacRoomAmbient824a70GenrandStreamPlan;
#pragma pack(pop)

#pragma pack(push, 1)
typedef struct IsaacRoomAmbient824a70LayerColorPads {
  int32_t qword_lo;
  int32_t qword_hi;
  int32_t dword;
} IsaacRoomAmbient824a70LayerColorPads;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomAmbient824a70LayerColorPads) == 12, "IsaacRoomAmbient824a70LayerColorPads size");

#pragma pack(push, 1)
typedef struct IsaacRoomAmbient824a70LayerColorPlan {
  int32_t write_needed;
  float r;
  float g;
  float b;
  int32_t alpha_defined;
  float alpha;
  int32_t pad_qword_lo;
  int32_t pad_qword_hi;
  int32_t pad_dword;
  int32_t color_off;
  int32_t zero16_off;
  int32_t pad_qword_off;
  int32_t pad_dword_off;
} IsaacRoomAmbient824a70LayerColorPlan;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomAmbient824a70LayerColorPlan) == 52, "IsaacRoomAmbient824a70LayerColorPlan size");

#pragma pack(push, 1)
typedef struct IsaacRoomAmbient824a70LoopStep {
  int32_t remaining;
  int32_t continue_loop;
} IsaacRoomAmbient824a70LoopStep;
#pragma pack(pop)

#pragma pack(push, 1)
typedef struct IsaacRoomAmbient824a70ResidualPlan {
  int32_t needs_host;
  int32_t residual_kind;
  int32_t pure_complete;
  int32_t host_needed;
  int32_t loop_count;
  int32_t age;
} IsaacRoomAmbient824a70ResidualPlan;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomAmbient824a70ResidualPlan) == 24, "IsaacRoomAmbient824a70ResidualPlan size");
static_assert(offsetof(IsaacRoomAmbient824a70ResidualPlan, age) == 20, "IsaacRoomAmbient824a70ResidualPlan age offset");

#pragma pack(push, 1)
typedef struct IsaacRoomB1CornerWorld {
  float x;
  float y;
} IsaacRoomB1CornerWorld;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomB1CornerWorld) == 8, "IsaacRoomB1CornerWorld size");

#pragma pack(push, 1)
typedef struct IsaacRoomB1Corners {
  int32_t c0;
  int32_t c1;
  int32_t c2;
  int32_t c3;
} IsaacRoomB1Corners;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomB1Corners) == 16, "IsaacRoomB1Corners size");

#pragma pack(push, 1)
typedef struct IsaacRoomB1SpawnIterPlan {
  uint32_t seed_fatal;
  int32_t remaining;
  uint32_t seed_shuffle;
  int32_t shuffle_rem;
  int32_t needs_swap;
  int32_t swap_index;
  int32_t elem_offset;
  int32_t swap_offset;
  uint32_t seed_corner;
  int32_t corner_index;
  float world_x;
  float world_y;
  float spawn_radius;
  int32_t next_i;
  int32_t continue_loop;
} IsaacRoomB1SpawnIterPlan;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomB1SpawnIterPlan) == 60, "IsaacRoomB1SpawnIterPlan size");

#pragma pack(push, 1)
typedef struct IsaacRoomB20Pos2 {
  float x;
  float y;
} IsaacRoomB20Pos2;
#pragma pack(pop)

#pragma pack(push, 1)
typedef struct IsaacRoomGridA2A0Pos {
  float x;  /* (float)(idx % w) * 40.0f + 40.0f  — CELL @0xbaa904, L2a */
  float y;  /* (float)(idx / w) * 40.0f + 120.0f — ORIGIN_Y @0xbaaa00 */
} IsaacRoomGridA2A0Pos;
#pragma pack(pop)

#pragma pack(push, 1)
typedef struct IsaacRoomGridHalfScale {
  float x;  /* (float)w * 0.5f — cvtdq2ps/mulss @0x7fa7f3, HALF @0xbaa2d0 */
  float y;  /* (float)h * 0.5f — @0x7fa808 */
} IsaacRoomGridHalfScale;
#pragma pack(pop)

#pragma pack(push, 1)
typedef struct IsaacRoomB20ResidualPlan {
  int32_t needs_host;
  int32_t residual_kind;
  int32_t pure_complete;
  int32_t host_needed;
  int32_t list_count;
} IsaacRoomB20ResidualPlan;
#pragma pack(pop)

#pragma pack(push, 1)
typedef struct IsaacRoomB3B7ResidualPlan {
  int32_t needs_b3_owner_host;
  int32_t needs_b3_challenge_host;
  int32_t needs_b3_temp_effects_host;
  int32_t needs_b4_reward_host;
  int32_t needs_b5_candidate_host;
  int32_t needs_b6_destroy_host;
  int32_t needs_b7_grid_update_host;
  int32_t residual_kind;
  int32_t pure_complete;
  int32_t host_needed;
} IsaacRoomB3B7ResidualPlan;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomB3B7ResidualPlan) == 40, "IsaacRoomB3B7ResidualPlan size");

#pragma pack(push, 1)
typedef struct IsaacRoomB3CbBaseSelect {
  int32_t kind;
  float base;
} IsaacRoomB3CbBaseSelect;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomB3CbBaseSelect) == 8, "IsaacRoomB3CbBaseSelect size");

#pragma pack(push, 1)
typedef struct IsaacRoomB3TeCallInitPosts {
  int32_t timer;
  int32_t byte71;
  int32_t field50;
  uint32_t field54_bits;
  uint32_t field58_bits;
  uint32_t field5c_bits;
  uint32_t field60_bits;
} IsaacRoomB3TeCallInitPosts;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomB3TeCallInitPosts) == 28,
              "IsaacRoomB3TeCallInitPosts size");
static_assert(offsetof(IsaacRoomB3TeCallInitPosts, field50) == 8,
              "IsaacRoomB3TeCallInitPosts field50 offset");

#pragma pack(push, 1)
typedef struct IsaacRoomB4BandImms {
  int32_t kind;
  int32_t valid;
  int32_t variant;
  int32_t subtype;
} IsaacRoomB4BandImms;
#pragma pack(pop)

#pragma pack(push, 1)
typedef struct IsaacRoomB4BandSpawnPosts {
  int32_t needs_spawn;
  int32_t band_kind;
  int32_t entity_type;
  int32_t variant;
  int32_t subtype;
  uint32_t seed;
  int32_t null_arg;
  int32_t arg_ptr;
} IsaacRoomB4BandSpawnPosts;
#pragma pack(pop)

#pragma pack(push, 1)
typedef struct IsaacRoomB4CleanupPosts {
  int32_t needs_cleanup;
  int32_t cl_imm;
  int32_t null_arg0;
  int32_t null_arg1;
  uint32_t host_va;
} IsaacRoomB4CleanupPosts;
#pragma pack(pop)

#pragma pack(push, 1)
typedef struct IsaacRoomB4EffectSpawnPosts {
  int32_t entity_type;
  int32_t variant;
  uint32_t seed;
  uint32_t seed_offset;
  int32_t null_arg;
  int32_t arg_ptr;
} IsaacRoomB4EffectSpawnPosts;
#pragma pack(pop)

#pragma pack(push, 1)
typedef struct IsaacRoomB4EntitySeedWritePosts {
  uint32_t seed_value;
  int32_t dest_off;
  int32_t needs_write;
} IsaacRoomB4EntitySeedWritePosts;
#pragma pack(pop)

#pragma pack(push, 1)
typedef struct IsaacRoomB4FramePathEnter {
  int32_t frame_gate;
  uint32_t seed_present;
  uint32_t needs_seed_fatal;
  int32_t needs_rng_chain;
  int32_t needs_pos_finish_host;
  int32_t pos_base_off;
} IsaacRoomB4FramePathEnter;
#pragma pack(pop)

#pragma pack(push, 1)
typedef struct IsaacRoomB4G0PosPosts {
  float pad;
  int32_t flag0;
  int32_t flag1;
  int32_t flag2;
  int32_t needs_pos_a_host;
  int32_t needs_pos_finish_host;
} IsaacRoomB4G0PosPosts;
#pragma pack(pop)

#pragma pack(push, 1)
typedef struct IsaacRoomB4LookupArgs {
  int32_t entity_type;
  int32_t variant;
  int32_t subtype;
  int32_t null_arg0;
  int32_t null_arg1;
  int32_t this_off;
} IsaacRoomB4LookupArgs;
#pragma pack(pop)

#pragma pack(push, 1)
typedef struct IsaacRoomB4LookupRoute {
  int32_t path;
  int32_t needs_g0_path;
  uint32_t needs_entity_seed;
  int32_t needs_pos_a_host;
  int32_t needs_pos_finish_host;
  int32_t needs_genrand_host;
  int32_t needs_spawn_host;
} IsaacRoomB4LookupRoute;
#pragma pack(pop)

#pragma pack(push, 1)
typedef struct IsaacRoomB4PickupFromSeed {
  uint32_t next_seed;
  int32_t rem100;
  int32_t variant;
} IsaacRoomB4PickupFromSeed;
#pragma pack(pop)

#pragma pack(push, 1)
typedef struct IsaacRoomB4PickupSpawnPosts {
  int32_t entity_type;
  int32_t variant;
  int32_t subtype;
  uint32_t seed;
  int32_t null_arg;
  int32_t arg_ptr;
} IsaacRoomB4PickupSpawnPosts;
#pragma pack(pop)

#pragma pack(push, 1)
typedef struct IsaacRoomB4PosFinishCopy {
  float x;
  float y;
} IsaacRoomB4PosFinishCopy;
#pragma pack(pop)

#pragma pack(push, 1)
typedef struct IsaacRoomB4RewardPos {
  float x;
  float y;
} IsaacRoomB4RewardPos;
#pragma pack(pop)

#pragma pack(push, 1)
typedef struct IsaacRoomB4RewardPosPosts {
  float x;
  float y;
  int32_t needs_pos_finish_host;
  int32_t flag0;
  int32_t flag1;
  int32_t flag2;
} IsaacRoomB4RewardPosPosts;
#pragma pack(pop)

#pragma pack(push, 1)
typedef struct IsaacRoomB4RewardSeedChain {
  uint32_t seed1;
  int32_t rem1;
  uint32_t pickup_variant;
  uint32_t seed2;
  int32_t rem2;
  int32_t band_kind;
  uint32_t seed3;
  int32_t third_gate;
} IsaacRoomB4RewardSeedChain;
#pragma pack(pop)

#pragma pack(push, 1)
typedef struct IsaacRoomB4SeedStep {
  uint32_t next_seed;
  int32_t rem100;
} IsaacRoomB4SeedStep;
#pragma pack(pop)

#pragma pack(push, 1)
typedef struct IsaacRoomB4ThirdPathPosts {
  int32_t needs_spawn;
  float pos_x;
  float pos_y;
  int32_t needs_pos_finish_host;
  int32_t needs_genrand_host;
  int32_t needs_spawn_host;
  int32_t entity_type;
  int32_t variant;
  int32_t subtype;
  int32_t arg_ptr;
} IsaacRoomB4ThirdPathPosts;
#pragma pack(pop)

#pragma pack(push, 1)
typedef struct IsaacRoomB4ThirdPos {
  float x;
  float y;
} IsaacRoomB4ThirdPos;
#pragma pack(pop)

#pragma pack(push, 1)
typedef struct IsaacRoomB4ThirdSpawnPosts {
  int32_t needs_spawn;
  int32_t entity_type;
  int32_t variant;
  int32_t subtype;
  uint32_t seed;
  int32_t null_arg0;
  int32_t null_arg1;
  int32_t arg_ptr;
} IsaacRoomB4ThirdSpawnPosts;
#pragma pack(pop)

#pragma pack(push, 1)
typedef struct IsaacRoomB5ListAppendRoute {
  int32_t can_direct_store;
  int32_t needs_grow_host;
  int32_t next_end;
} IsaacRoomB5ListAppendRoute;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomB5ListAppendRoute) == 12, "IsaacRoomB5ListAppendRoute size");

#pragma pack(push, 1)
typedef struct IsaacRoomB5Pass1AppendPosts {
  int32_t needs_append;
  int32_t can_direct_store;
  int32_t needs_grow_host;
  int32_t next_end;
} IsaacRoomB5Pass1AppendPosts;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomB5Pass1AppendPosts) == 16, "IsaacRoomB5Pass1AppendPosts size");

#pragma pack(push, 1)
typedef struct IsaacRoomB5Pass2EntityPosts {
  int32_t needs_vcall48_host;
  int32_t needs_vcall4c_host;
  int32_t needs_rng_loop;
  int32_t append_budget;
} IsaacRoomB5Pass2EntityPosts;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomB5Pass2EntityPosts) == 16, "IsaacRoomB5Pass2EntityPosts size");

#pragma pack(push, 1)
typedef struct IsaacRoomB5Pass2RngTryPosts {
  uint32_t next_seed;
  int32_t needs_append;
  int32_t can_direct_store;
  int32_t needs_grow_host;
  int32_t next_end;
  int32_t next_budget;
  int32_t budget_continue;
} IsaacRoomB5Pass2RngTryPosts;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomB5Pass2RngTryPosts) == 28, "IsaacRoomB5Pass2RngTryPosts size");

#pragma pack(push, 1)
typedef struct IsaacRoomB7CellStepPosts {
  int32_t needs_vcall_host;
  int32_t next_index;
  int32_t cell_count;
  int32_t continue_loop;
} IsaacRoomB7CellStepPosts;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomB7CellStepPosts) == 16, "IsaacRoomB7CellStepPosts size");

#pragma pack(push, 1)
typedef struct IsaacRoomB9B11ResidualPlan {
  int32_t challenge_body_needs_host;
  int32_t mode_hooks_needs_host;
  int32_t flag_11f4_needs_host;
  int32_t b10_enemies;
  int32_t b10_fatal_needs_host;
  int32_t double_409030_needs_host;
  int32_t stage_1a_needs_host;
  int32_t frame_age1_needs_host;
  int32_t tempfx_walk_needs_host;
  int32_t residual_kind;
  int32_t pure_complete;
  int32_t host_needed;
} IsaacRoomB9B11ResidualPlan;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomB9B11ResidualPlan) == 48, "IsaacRoomB9B11ResidualPlan size");

#pragma pack(push, 1)
typedef struct IsaacRoomB9FreeBodyPlan {
  int32_t helper_needed;
  int32_t free_path_needed;
  int32_t free_ptr_needed;
  int32_t free_iat_needed;
  int32_t heap_stats_base;
  int32_t free_block_ptr;
} IsaacRoomB9FreeBodyPlan;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomB9FreeBodyPlan) == 24, "IsaacRoomB9FreeBodyPlan size");

#pragma pack(push, 1)
typedef struct IsaacRoomB9FreeHeapAccount {
  int32_t new_lo;
  int32_t new_hi;
  int32_t borrow;
} IsaacRoomB9FreeHeapAccount;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomB9FreeHeapAccount) == 12, "IsaacRoomB9FreeHeapAccount size");

#pragma pack(push, 1)
typedef struct IsaacRoomB9FreeLookupArgs {
  int32_t entity_type;
  uint32_t entity_variant;
  int32_t entity_subtype;
  int32_t arg_pad0;
  int32_t arg_pad1;
  int32_t this_off;
  uint32_t host_va;
} IsaacRoomB9FreeLookupArgs;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomB9FreeLookupArgs) == 28, "IsaacRoomB9FreeLookupArgs size");

#pragma pack(push, 1)
typedef struct IsaacRoomClamp812f50LRoom {
  float x;
  float y;
  float x_simple;
  float y_simple;
  float sel;
  int32_t select_took_b;
  int32_t shape_arm;
  int32_t store_path;
  float limit;
} IsaacRoomClamp812f50LRoom;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomClamp812f50LRoom) == 36, "IsaacRoomClamp812f50LRoom size");

#pragma pack(push, 1)
typedef struct IsaacRoomGenrandCallPlan {
  int32_t crt_rand_active;
  int32_t value_pure;
  int32_t ring_reachable;
  int32_t ring_structure_pure;
  int32_t overflow_throw_needed;
  int32_t host_alloc_calls;
  int32_t host_backtrace_calls;
  int32_t host_free_calls_min;
  int32_t host_free_unbounded;
  int32_t call_pure;
  uint32_t host_va_alloc;
  uint32_t host_va_free;
  uint32_t host_va_backtrace;
  uint32_t host_va_throw;
  uint32_t host_va_memset;
  uint32_t host_va_ring_start;
  uint32_t host_va_ret;
} IsaacRoomGenrandCallPlan;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomGenrandCallPlan) == 68, "IsaacRoomGenrandCallPlan size");

#pragma pack(push, 1)
typedef struct IsaacRoomGenrandCallResidual {
  int32_t crt_rand_active;
  int32_t value_pure;
  int32_t log_ring_host;
  int32_t state_bytes;
  uint32_t state_va;
  uint32_t index_va;
  uint32_t mode_flag_va;
  uint32_t host_va_call;
  uint32_t host_va_crt_rand;
  uint32_t host_va_log_start;
  uint32_t host_va_ret;
} IsaacRoomGenrandCallResidual;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomGenrandCallResidual) == 44, "IsaacRoomGenrandCallResidual size");

#pragma pack(push, 1)
typedef struct IsaacRoomGenrandConstants {
  int32_t n;
  int32_t m;
  int32_t loop1_end;
  int32_t state_bytes;
  int32_t init_index;
  uint32_t unseeded_index;
  uint32_t upper_mask;
  uint32_t lower_mask;
  int32_t matrix_a;
  int32_t init_mult;
  int32_t init_shift;
  uint32_t default_seed;
  int32_t temper_shift_u;
  int32_t temper_shift_s;
  int32_t temper_shift_t;
  int32_t temper_shift_l;
  uint32_t temper_pre_mask_b;
  uint32_t temper_pre_mask_c;
  uint32_t temper_mask_b;
  uint32_t temper_mask_c;
  uint32_t mag01_va;
  uint32_t state_va;
  uint32_t index_va;
  uint32_t mode_flag_va;
} IsaacRoomGenrandConstants;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomGenrandConstants) == 96, "IsaacRoomGenrandConstants size");

#pragma pack(push, 1)
typedef struct IsaacRoomGenrandCrtOverride {
  int32_t active;
  uint32_t default_value;
  int32_t writer_count;
  int32_t reader_count;
  int32_t reachable_from_room_update;
  uint32_t flag_va;
  uint32_t reader_va;
  uint32_t writer_set_va;
  uint32_t writer_clear_va;
  uint32_t bracket_site_va;
  uint32_t bracket_callee_va;
  uint32_t owner_fn_va;
  uint32_t owner_caller_va;
  uint32_t proven_site_va;
  int32_t iat_crt_rand;
} IsaacRoomGenrandCrtOverride;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomGenrandCrtOverride) == 60, "IsaacRoomGenrandCrtOverride size");

#pragma pack(push, 1)
typedef struct IsaacRoomGenrandFill {
  int32_t count;
  int32_t index_in;
  int32_t index_out;
  int32_t reloads;
} IsaacRoomGenrandFill;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomGenrandFill) == 16, "IsaacRoomGenrandFill size");

#pragma pack(push, 1)
typedef struct IsaacRoomGenrandLogLayout {
  int32_t node_bytes;
  int32_t payload_bytes;
  int32_t next_off;
  int32_t prev_off;
  int32_t value_off;
  int32_t frame_off;
  int32_t backtrace_off;
  int32_t depth_off;
  int32_t backtrace_frames;
  int32_t zero2_off;
  int32_t zero2_bytes;
  int32_t max_nodes;
} IsaacRoomGenrandLogLayout;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomGenrandLogLayout) == 48, "IsaacRoomGenrandLogLayout size");

#pragma pack(push, 1)
typedef struct IsaacRoomGenrandLogLink {
  int32_t node_next;
  int32_t node_prev;
  int32_t head_prev;
  int32_t old_prev_next;
  int32_t size_after;
} IsaacRoomGenrandLogLink;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomGenrandLogLink) == 20, "IsaacRoomGenrandLogLink size");

#pragma pack(push, 1)
typedef struct IsaacRoomGenrandLogRecord {
  int32_t value;
  int32_t frame;
  int32_t depth;
} IsaacRoomGenrandLogRecord;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomGenrandLogRecord) == 12, "IsaacRoomGenrandLogRecord size");

#pragma pack(push, 1)
typedef struct IsaacRoomGenrandLogTrimStep {
  int32_t cutoff;
  int32_t size_nonzero;
  int32_t trim_needed;
  int32_t prev_next;
  int32_t next_prev;
  int32_t free_ptr;
  int32_t size_after;
  int32_t continue_loop;
} IsaacRoomGenrandLogTrimStep;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomGenrandLogTrimStep) == 32, "IsaacRoomGenrandLogTrimStep size");

#pragma pack(push, 1)
typedef struct IsaacRoomPrePlayPlan {
  int32_t sound_id;
  uint32_t rng_seed_out;
  int32_t rng_advanced;
  int32_t host_lookup_needed;
  uint32_t seed_zero_fatal;
  int32_t rare_hit;
  int32_t id_rewritten;
} IsaacRoomPrePlayPlan;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomPrePlayPlan) == 28, "IsaacRoomPrePlayPlan size");

#pragma pack(push, 1)
typedef struct IsaacRoomTailmidResidualPlan {
  int32_t curse_kind;
  int32_t kind_801ee0;
  int32_t kind_800500;
  int32_t residual_kind;
  int32_t pure_complete;
  int32_t host_needed;
  int32_t needs_curse_host;
  int32_t needs_801ee0_host;
  int32_t needs_800500_host;
} IsaacRoomTailmidResidualPlan;
#pragma pack(pop)

void isaac_room_camera_fx_lerp_step(IsaacRoomCameraFxState* state);
void isaac_room_clear_delay_step(IsaacRoomClearDelayState* state);
void isaac_room_entry_clear_7220(uint8_t* field_7220);
void isaac_room_countdown_dec_if_positive(int32_t* counter);
void isaac_room_countdown_dec_if_nonnegative(int32_t* counter);
void isaac_room_countdown_dec_expire_neg1(int32_t* counter);
void isaac_room_boss_count_snapshot(int32_t* out_7224, int32_t count_12c8, int32_t count_12cc);
void isaac_room_water_lava_float_step(IsaacRoomWaterLavaState* state);
void isaac_room_trigger_clear_entry(IsaacRoomTriggerClearEntry* state);
uint32_t isaac_door_helper_710dd0_early_out(uint32_t field_3a0, int32_t field_8, int32_t field_c);
int32_t isaac_door_slots_710dd0_any_needs_host(const IsaacDoorSlotFields* slots);
int32_t isaac_door_slots_710dd0_any_type5_needs_host(const IsaacDoorSlotFields* slots);
int32_t isaac_room_b16_needs_type7_grid(uint32_t challenge_0x123, int32_t room_type_8, float water_pre, uint32_t room_desc_flags_44_post);
int32_t isaac_room_b16_needs_lava_band_grid(float lava_pre, float lava_post_mul);
int32_t isaac_room_b16_needs_823540(float water_post_step, float lava_pre);
int32_t isaac_room_b16_needs_grid_host(uint32_t challenge_0x123, int32_t room_type_8, float water_pre, float lava_pre, uint32_t room_desc_flags_44_post);
/* FUN_0074efd0 room-callsite gate (0x0074efd0..0x0074f02e); poll_combine_byte is
   the typed-host bit1 source (0x748490 combine over action-map walks). */
uint32_t isaac_room_b16_mineshaft_gate(uint32_t difficulty_269c8, uint32_t stage_0,
                                       uint32_t stage_type_4, uint32_t flags_2654c,
                                       uint32_t poll_combine_byte);
/* FUN_00823370 grid math (0x00823370..0x00823536): out[6] = f(in[6], room/grid
   fields, typed mineshaft gate + Game+0x1830c). */
void isaac_room_b16_grid_step(float* out, const float* in, int32_t room_type_8,
                              uint32_t desc_flags_44, int32_t desc_54,
                              uint32_t room_1d18, int32_t grid_w_c,
                              int32_t grid_h_10, float lava_7740,
                              uint32_t mineshaft_al, int32_t transition_1830c);
/* FUN_00823540 wrapper al gate: (byte[Game+0x183a0]==0 && byte[Game+0x269e9]==0). */
uint32_t isaac_room_b16_spray_gate_al(uint32_t byte_183a0, uint32_t byte_269e9);
/* FUN_007067c0 spray math (0x007067c0..0x007068be): prev[6]/cur[6]/factor/active
   -> vel_out[6] + gate byte; inactive copies prev[0..3]=cur[0..3]. */
uint32_t isaac_room_b16_spray_step(float* prev, const float* cur, float factor,
                                   uint32_t active, float* vel_out);
uint32_t isaac_door_helper_70ee40_early_out(uint32_t field_149_byte);
int32_t isaac_room_trigger_clear_is_greed_mode(int32_t difficulty_269c8);
int32_t isaac_room_trigger_clear_needs_non_greed_host(int32_t difficulty_269c8);
int32_t isaac_room_trigger_clear_needs_awards_bit7_walk(uint32_t room_desc_flags_44);
int32_t isaac_room_706c_needs_expire_host(int32_t pre_timer_706c);
int32_t isaac_room_7230_needs_spawn_host(int32_t pre_timer_7230);
int32_t isaac_room_b18_needs_entity_walk_host(uint32_t room_flag_7894);
uint32_t isaac_room_b18_entity_type5(void);
uint32_t isaac_room_b18_entity_type1(void);
uint32_t isaac_room_b18_type_range_base(void);
uint32_t isaac_room_b18_type_range_span(void);
uint32_t isaac_room_b18_mode_gate(void);
uint32_t isaac_room_b18_rtti_src_ptr(void);
uint32_t isaac_room_b18_rtti_dst_ptr(void);
uint32_t isaac_room_b18_room_vec_offset(void);
uint32_t isaac_room_b18_room_count_offset(void);
uint32_t isaac_room_b18_entity_type_offset(void);
uint32_t isaac_room_b18_room_flag_offset(void);
uint32_t isaac_room_b18_game_mode_offset(void);
uint32_t isaac_room_b18_host_va_flag_test(void);
uint32_t isaac_room_b18_host_va_walk_start(void);
uint32_t isaac_room_b18_host_va_type5(void);
uint32_t isaac_room_b18_host_va_rtti(void);
uint32_t isaac_room_b18_host_va_path_b(void);
uint32_t isaac_room_b18_host_va_flag_clear(void);
uint32_t isaac_room_b18_host_va_next(void);
int32_t isaac_room_b18_list_empty(uint32_t entity_count_1264);
int32_t isaac_room_b18_list_continue(uint32_t index, uint32_t entity_count_1264);
int32_t isaac_room_b18_entity_is_type5(int32_t entity_type_28);
int32_t isaac_room_b18_entity_type1_mode_gate(int32_t timed_transition_cleanup_mode, int32_t entity_type_28);
int32_t isaac_room_b18_entity_type_in_range(int32_t entity_type_28);
int32_t isaac_room_b18_entity_path_b_candidate(int32_t timed_transition_cleanup_mode, int32_t entity_type_28);
int32_t isaac_room_b18_entity_action(int32_t timed_transition_cleanup_mode, int32_t entity_type_28);
int32_t isaac_room_b18_path_b_needs_host(uint32_t rtti_cast_result);
void isaac_room_b18_residual_plan(uint32_t room_flag_7894, uint32_t entity_count_1264, IsaacRoomB18ResidualPlan* out);
void isaac_room_b18_wire_decide(int32_t flag_ready, int32_t count_ready, uint32_t room_flag_7894, uint32_t entity_count_1264, IsaacRoomB18ResidualPlan* out);
int32_t isaac_room_b19_needs_path_rebuild_host(uint32_t room_flag_7769);
uint32_t isaac_room_b19_entity_type5(void);
uint32_t isaac_room_b19_entity_variant_100(void);
uint32_t isaac_room_b19_entity_flag_bit(void);
uint32_t isaac_room_b19_query_imm_8000(void);
uint32_t isaac_room_b19_cell_buf_size(void);
uint32_t isaac_room_b19_tree_node_size(void);
uint32_t isaac_room_b19_grid_cell_bits(void);
uint32_t isaac_room_b19_grid_y0_bits(void);
uint32_t isaac_room_b19_grid_half_bits(void);
uint32_t isaac_room_b19_room_w_offset(void);
uint32_t isaac_room_b19_room_h_offset(void);
uint32_t isaac_room_b19_room_vec_offset(void);
uint32_t isaac_room_b19_room_count_offset(void);
uint32_t isaac_room_b19_room_flag_offset(void);
uint32_t isaac_room_b19_entity_type_offset(void);
uint32_t isaac_room_b19_entity_variant_offset(void);
uint32_t isaac_room_b19_entity_pos_x_offset(void);
uint32_t isaac_room_b19_entity_pos_y_offset(void);
uint32_t isaac_room_b19_entity_dead_offset(void);
uint32_t isaac_room_b19_entity_field_534_offset(void);
uint32_t isaac_room_b19_entity_flags_168_offset(void);
uint32_t isaac_room_b19_refcount_va(void);
uint32_t isaac_room_b19_host_va_flag_test(void);
uint32_t isaac_room_b19_host_va_rebuild_start(void);
uint32_t isaac_room_b19_host_va_memset(void);
uint32_t isaac_room_b19_host_va_get_grid_collision(void);
uint32_t isaac_room_b19_host_va_entity_walk(void);
uint32_t isaac_room_b19_host_va_query_8000(void);
uint32_t isaac_room_b19_host_va_tree_alloc(void);
uint32_t isaac_room_b19_host_va_pos_finish(void);
uint32_t isaac_room_b19_host_va_spawn(void);
uint32_t isaac_room_b19_host_va_get_alt_pedestal(void);
uint32_t isaac_room_b19_host_va_set_alt_pedestal(void);
uint32_t isaac_room_b19_host_va_flag_clear(void);
uint32_t isaac_room_b19_host_va_next(void);
int32_t isaac_room_b19_cell_count(int32_t width_c, int32_t height_10);
int32_t isaac_room_b19_cell_loop_enter(int32_t cell_count);
int32_t isaac_room_b19_cell_loop_continue(int32_t index, int32_t cell_count);
int32_t isaac_room_b19_list_empty(uint32_t entity_count_1264);
int32_t isaac_room_b19_list_continue(uint32_t index, uint32_t entity_count_1264);
int32_t isaac_room_b19_entity_is_mark_candidate(int32_t entity_type_28, int32_t entity_variant_2c);
int32_t isaac_room_b19_entity_secondary_eligible(uint32_t dead_173_byte, uint32_t field_534, uint32_t flags_168);
uint32_t isaac_room_b19_collision_byte(uint32_t grid_collision_result);
int32_t isaac_room_b19_world_to_grid_x(float pos_x);
int32_t isaac_room_b19_world_to_grid_y(float pos_y);
int32_t isaac_room_b19_world_to_grid_index(float pos_x, float pos_y, int32_t width_c, int32_t height_10);
int32_t isaac_room_b19_grid_index_valid(int32_t grid_index);
void isaac_room_b19_residual_plan(uint32_t room_flag_7769, int32_t width_c, int32_t height_10, IsaacRoomB19ResidualPlan* out);
void isaac_room_b19_wire_decide(int32_t flag_ready, uint32_t room_flag_7769, int32_t width_c, int32_t height_10, IsaacRoomB19ResidualPlan* out);
int32_t isaac_room_b20_needs_trail_host(uint32_t list_begin_c82674, uint32_t list_end_c82678);
uint32_t isaac_room_b20_pass1_type_a(void);
uint32_t isaac_room_b20_pass1_type_b(void);
uint32_t isaac_room_b20_pass1_type_c(void);
uint32_t isaac_room_b20_pass1_type_d(void);
uint32_t isaac_room_b20_pair_y_type(void);
uint32_t isaac_room_b20_flag_bit_4000(void);
uint32_t isaac_room_b20_flag_clear_mask(void);
uint32_t isaac_room_b20_spawn_flag_bit_80(void);
uint32_t isaac_room_b20_collect_flag_bits(void);
uint32_t isaac_room_b20_pair_x_offset_bits(void);
uint32_t isaac_room_b20_pair_y_offset_bits(void);
uint32_t isaac_room_b20_grid_cell_bits(void);
uint32_t isaac_room_b20_rng_span_bits(void);
uint32_t isaac_room_b20_unit_scale_bits(void);
uint32_t isaac_room_b20_rng_radius_bits(void);
uint32_t isaac_room_b20_type_range_base(void);
uint32_t isaac_room_b20_type_range_span(void);
uint32_t isaac_room_b20_mode_gate(void);
uint32_t isaac_room_b20_default_field184_gate(void);
uint32_t isaac_room_b20_entity_type_offset(void);
uint32_t isaac_room_b20_entity_variant_offset(void);
uint32_t isaac_room_b20_entity_subtype_offset(void);
uint32_t isaac_room_b20_entity_pos_x_offset(void);
uint32_t isaac_room_b20_entity_pos_y_offset(void);
uint32_t isaac_room_b20_entity_flags_168_offset(void);
uint32_t isaac_room_b20_entity_flags_16c_offset(void);
uint32_t isaac_room_b20_entity_field_184_offset(void);
uint32_t isaac_room_b20_entity_field_32c_offset(void);
uint32_t isaac_room_b20_entity_field_370_offset(void);
uint32_t isaac_room_b20_entity_field_3bc_offset(void);
uint32_t isaac_room_b20_entity_field_3c0_offset(void);
uint32_t isaac_room_b20_entity_field_3ec_offset(void);
uint32_t isaac_room_b20_list_begin_va(void);
uint32_t isaac_room_b20_list_end_va(void);
uint32_t isaac_room_b20_list_cap_va(void);
uint32_t isaac_room_b20_spawn_pos_vec_ptr(void);
uint32_t isaac_room_b20_game_mode_offset(void);
uint32_t isaac_room_b20_host_va_list_test(void);
uint32_t isaac_room_b20_host_va_pass1(void);
uint32_t isaac_room_b20_host_va_pass2(void);
uint32_t isaac_room_b20_host_va_flagged_genrand(void);
uint32_t isaac_room_b20_host_va_multispawn(void);
uint32_t isaac_room_b20_host_va_collect_or_4080(void);
uint32_t isaac_room_b20_host_va_pair_y(void);
uint32_t isaac_room_b20_host_va_default_field184(void);
uint32_t isaac_room_b20_host_va_default_rng(void);
uint32_t isaac_room_b20_host_va_pair_x(void);
uint32_t isaac_room_b20_host_va_vector_push(void);
uint32_t isaac_room_b20_host_va_spawn(void);
uint32_t isaac_room_b20_host_va_genrand(void);
uint32_t isaac_room_b20_host_va_sin(void);
uint32_t isaac_room_b20_host_va_cos(void);
uint32_t isaac_room_b20_host_va_pos_pack(void);
uint32_t isaac_room_b20_host_va_deallocate(void);
uint32_t isaac_room_b20_host_va_flag_clear(void);
uint32_t isaac_room_b20_host_va_free(void);
uint32_t isaac_room_b20_host_va_epilogue(void);
int32_t isaac_room_b20_list_count(uint32_t list_begin, uint32_t list_end);
int32_t isaac_room_b20_list_empty(int32_t list_count);
int32_t isaac_room_b20_list_continue(uint32_t index, int32_t list_count);
int32_t isaac_room_b20_pass1_type_match(int32_t entity_type_28);
uint32_t isaac_room_b20_flag_or_4000(uint32_t flags_16c);
uint32_t isaac_room_b20_flag_clear_4000(uint32_t flags_16c);
int32_t isaac_room_b20_entity_is_flagged(uint32_t flags_16c);
int32_t isaac_room_b20_entity_is_pair_x(int32_t entity_type_28);
int32_t isaac_room_b20_entity_is_pair_y(int32_t entity_type_28);
int32_t isaac_room_b20_pass2_action(uint32_t flags_16c, int32_t entity_type_28);
int32_t isaac_room_b20_flagged_multispawn_enter(uint32_t field_3c0);
int32_t isaac_room_b20_chain_continue(uint32_t child_ptr_3bc, int32_t timed_transition_cleanup_mode, int32_t child_type_28);
uint32_t isaac_room_b20_spawn_flag_or_80(uint32_t flags_16c);
uint32_t isaac_room_b20_collect_flag_or_4080(uint32_t flags_16c);
int32_t isaac_room_b20_default_field184_is_special(int32_t field_184);
int32_t isaac_room_b20_vector_needs_free(uint32_t vector_begin_ptr);
int32_t isaac_room_b20_collect_loop_enter(int32_t collect_count);
float isaac_room_b20_unit_float(uint32_t genrand);
float isaac_room_b20_angle_from_unit(float unit);
float isaac_room_b20_angle_from_genrand(uint32_t genrand);
float isaac_room_b20_dir_scale_grid(float dir);
float isaac_room_b20_dir_scale_radius(float dir);
void isaac_room_b20_pair_x_left(float pos_x, float pos_y, IsaacRoomB20Pos2* out);
void isaac_room_b20_pair_x_right(float pos_x, float pos_y, IsaacRoomB20Pos2* out);
void isaac_room_b20_pair_y_up(float pos_x, float pos_y, IsaacRoomB20Pos2* out);
void isaac_room_b20_pair_y_down(float pos_x, float pos_y, IsaacRoomB20Pos2* out);
void isaac_room_b20_flagged_spawn_offset(float pos_x, float pos_y, float sin_a, float cos_a, IsaacRoomB20Pos2* out);
void isaac_room_b20_default_spawn_offset(float pos_x, float pos_y, float sin_a, float cos_a, IsaacRoomB20Pos2* out);
void isaac_room_b20_residual_plan(uint32_t list_begin_c82674, uint32_t list_end_c82678, IsaacRoomB20ResidualPlan* out);
void isaac_room_b20_wire_decide(int32_t list_ready, uint32_t list_begin_c82674, uint32_t list_end_c82678, IsaacRoomB20ResidualPlan* out);
int32_t isaac_room_b8_needs_path_cost_host(int32_t frame_counter_264f8, int32_t cell_count);
void isaac_room_ambient_824800_float_step(IsaacRoomAmbient824800State* state);
int32_t isaac_room_ambient_824800_needs_spawn_host(const IsaacRoomAmbient824800State* state_post);
int32_t isaac_room_ambient_7f01c0_needs_host(int32_t gate_1b83c, uint32_t desc_present, int32_t desc_type_8, int32_t desc_id_0, int32_t player_count);
int32_t isaac_room_ambient_24ee0_needs_host(float vel_x_7460, float vel_y_7464);
uint32_t isaac_room_ambient_8024f0_flags_early_out(uint32_t room_desc_flags_44);
int32_t isaac_room_ambient_special_1023_needs_host(uint32_t desc_present, int32_t desc_type_8, int32_t desc_id_0);
void isaac_room_ambient_greed_stage_remap(int32_t difficulty_269c8, int32_t* stage, int32_t* stage_type);
int32_t isaac_room_ambient_stage_spawn_may_rng(int32_t stage, int32_t stage_type);
int32_t isaac_room_ambient_mode_sfx_needs_host(int32_t mode_26584, int32_t dim_1830c);
int32_t isaac_room_ambient_mode_sfx_may_play(int32_t stage_id, int32_t frame_264f8);
int32_t isaac_room_ambient_74e9b0_pure_false(int32_t difficulty_269c8, int32_t stage_0, uint32_t flags_2654c);
int32_t isaac_room_ambient_824a70_cadence_may_body(uint32_t room_active_byte0, int32_t frame_264f8, int32_t room_entry_11f0);
int32_t isaac_room_ambient_824a70_needs_host(int32_t mode_26584, int32_t dim_1830c, int32_t stage_id_resolved, int32_t room_type_8, int32_t room_subtype_1bb0, int32_t game_18304, int32_t difficulty_269c8, int32_t stage_0, int32_t stage_type_4, uint32_t flags_2654c, uint32_t room_active_byte0, int32_t frame_264f8, int32_t room_entry_11f0);
int32_t isaac_room_mid_restock_needs_host(int32_t room_type_8, uint32_t collectible_owner_0x209_nonzero, uint32_t room_active_byte0, int32_t frame_264f8, int32_t room_entry_11f0);
int32_t isaac_room_mid_restock_desc_gate(int32_t desc_short_ac, int32_t desc_short_ae);
uint32_t isaac_room_mid_restock_collectible_id(void);
uint32_t isaac_room_mid_restock_rng_shift1(void);
uint32_t isaac_room_mid_restock_rng_shift2(void);
uint32_t isaac_room_mid_restock_rng_shift3(void);
uint32_t isaac_room_mid_restock_host_va_outer(void);
uint32_t isaac_room_mid_restock_host_va_owner(void);
uint32_t isaac_room_mid_restock_host_va_body(void);
uint32_t isaac_room_mid_restock_host_va_random_int(void);
uint32_t isaac_room_mid_restock_host_va_write(void);
uint32_t isaac_room_mid_restock_host_va_next(void);
uint32_t isaac_room_mid_restock_rng_next(uint32_t* seed_inout, uint32_t shift1, uint32_t shift2, uint32_t shift3);
uint32_t isaac_room_mid_restock_random_int(uint32_t* seed_inout, uint32_t shift1, uint32_t shift2, uint32_t shift3, uint32_t max);
int32_t isaac_room_mid_restock_body_apply(int32_t desc_short_ac, int32_t desc_short_ae, uint32_t desc_seed_58, int32_t* out_ae);
void isaac_room_mid_restock_wire_decide(int32_t outer_ready, int32_t desc_ready, int32_t room_type_8, uint32_t collectible_owner_0x209_nonzero, uint32_t room_active_byte0, int32_t frame_264f8, int32_t room_entry_11f0, int32_t desc_short_ac, int32_t desc_short_ae, uint32_t desc_seed_58, int32_t* out_residual_kind, int32_t* out_ae, int32_t* out_applied);
uint32_t isaac_room_mid_restock_owner_laz_shared_tag(void);
uint32_t isaac_room_mid_restock_owner_rng_game_offset(void);
uint32_t isaac_room_mid_restock_desc_off_ac(void);
uint32_t isaac_room_mid_restock_desc_off_ae(void);
uint32_t isaac_room_mid_restock_desc_off_seed58(void);
uint32_t isaac_room_mid_restock_host_va_seed_fatal(void);
uint32_t isaac_room_mid_restock_host_va_get_collectible(void);
uint32_t isaac_room_mid_restock_host_va_has_collectible(void);
int32_t isaac_room_mid_restock_frame_age(int32_t frame_264f8, int32_t room_entry_11f0);
int32_t isaac_room_mid_restock_age_opens_body(int32_t age);
int32_t isaac_room_mid_restock_owner_twin_walk_flag(uint32_t laz_shared_tag, uint32_t config_ptr_nonzero, uint32_t config_field_b8);
int32_t isaac_room_mid_restock_owner_list_empty(uint32_t list_begin, uint32_t list_end);
int32_t isaac_room_mid_restock_owner_player_slot_active(uint32_t player_field_2c);
int32_t isaac_room_mid_restock_owner_twin_present(uint32_t twin_ptr);
int32_t isaac_room_mid_restock_owner_has_collectible_hit(uint32_t al_byte);
int32_t isaac_room_mid_restock_owner_list_continue(uint32_t list_cur, uint32_t list_end);
uint32_t isaac_room_7230_spawn_type(void);
uint32_t isaac_room_7230_spawn_variant(void);
uint32_t isaac_room_7230_spawn_pos_vec_ptr(void);
uint32_t isaac_room_7230_spawn_arg_ptr_a(void);
uint32_t isaac_room_7230_spawn_arg_ptr_b(void);
uint32_t isaac_room_7230_spawn_game_room_offset(void);
uint32_t isaac_room_7230_spawn_pos_zero_arg(void);
uint32_t isaac_room_7230_host_va_countdown(void);
uint32_t isaac_room_7230_host_va_spawn_body(void);
uint32_t isaac_room_7230_host_va_pos(void);
uint32_t isaac_room_7230_host_va_pos_finish(void);
uint32_t isaac_room_7230_host_va_genrand(void);
uint32_t isaac_room_7230_host_va_spawn(void);
uint32_t isaac_room_7230_host_va_rtti(void);
uint32_t isaac_room_7230_host_va_next(void);
void isaac_room_7230_spawn_spans(float room_f14, float room_f18, float room_f1c, float room_f20, IsaacRoom7230SpawnSpans* out);
float isaac_room_7230_spawn_unit_float(uint32_t genrand);
float isaac_room_7230_spawn_center_x(float room_f14, float span_x);
float isaac_room_7230_spawn_center_y(float room_f18, float span_y);
float isaac_room_7230_spawn_max_span(float span_x, float span_y);
float isaac_room_7230_spawn_radius_arg(float unit, float max_span);
void isaac_room_7230_spawn_pos_posts(uint32_t genrand, float room_f14, float room_f18, float room_f1c, float room_f20, IsaacRoom7230SpawnPosPosts* out);
void isaac_room_ambient_824a70_body_bounds(uint32_t room_active_byte0, int32_t frame_264f8, int32_t room_entry_11f0, float room_f14, float room_f18, float room_f1c, float room_f20, IsaacRoomAmbient824a70BodyBounds* out);
void isaac_room_ambient_824a70_body_color(int32_t stage_id, int32_t room_1d18, int32_t dim_1830c, IsaacRoomAmbient824a70Color* out);
int32_t isaac_room_ambient_824a70_body_y_override_applies(int32_t age);
float isaac_room_ambient_824a70_body_y_override(float room_y_1c);
float isaac_room_ambient_824a70_body_unit_float(uint32_t genrand);
float isaac_room_ambient_824a70_body_pos_axis(float base, float unit, float span);
float isaac_room_ambient_824a70_body_z(float unit);
float isaac_room_ambient_824a70_body_scale(float unit);
uint32_t isaac_room_ambient_824a70_body_flag_bit(uint32_t genrand);
int32_t isaac_room_ambient_824a70_body_anim_frame_genrand_needed(uint32_t anim_count);
uint32_t isaac_room_ambient_824a70_body_anim_frame(uint32_t genrand, uint32_t anim_count);
float isaac_room_ambient_824a70_body_anim_frame_f32(int32_t frame_index);
int32_t isaac_room_ambient_824a70_body_anim_frame_apply_needed(uint32_t a1_ok, uint32_t field_34);
int32_t isaac_room_ambient_824a70_body_anim_frame_clear_needed(uint32_t field_34_post);
void isaac_room_ambient_824a70_body_anim_frame_posts(uint32_t genrand, uint32_t anim_count, IsaacRoomAmbient824a70AnimFramePosts* out);
int32_t isaac_room_ambient_824a70_body_layer_color_write_needed(uint32_t layer_ptr, uint32_t stack_color_ptr);
void isaac_room_ambient_824a70_body_layer_color_pads(IsaacRoomAmbient824a70LayerColorPads* out);
void isaac_room_ambient_824a70_body_layer_color_plan(uint32_t layer_ptr, uint32_t stack_color_ptr, float r, float g, float b, uint32_t alpha_defined, float alpha, IsaacRoomAmbient824a70LayerColorPlan* out);
uint32_t isaac_room_ambient_824a70_effect_type(void);
uint32_t isaac_room_ambient_824a70_effect_variant(void);
uint32_t isaac_room_ambient_824a70_layer_index(void);
uint32_t isaac_room_ambient_824a70_anm_data_ptr(void);
uint32_t isaac_room_ambient_824a70_a1_arg(void);
uint32_t isaac_room_ambient_824a70_entity_anm2_off(void);
uint32_t isaac_room_ambient_824a70_anim_count_off(void);
uint32_t isaac_room_ambient_824a70_anm2_field_34_off(void);
uint32_t isaac_room_ambient_824a70_anm2_field_44_off(void);
uint32_t isaac_room_ambient_824a70_a2_this_off(void);
uint32_t isaac_room_ambient_824a70_vcall_off(void);
uint32_t isaac_room_ambient_824a70_create_arg_zero(void);
uint32_t isaac_room_ambient_824a70_game_ptr_global(void);
uint32_t isaac_room_ambient_824a70_host_va_create(void);
uint32_t isaac_room_ambient_824a70_host_va_create_site(void);
uint32_t isaac_room_ambient_824a70_host_va_create_start(void);
uint32_t isaac_room_ambient_824a70_host_va_a0(void);
uint32_t isaac_room_ambient_824a70_host_va_a0_site(void);
uint32_t isaac_room_ambient_824a70_host_va_a1(void);
uint32_t isaac_room_ambient_824a70_host_va_a1_site(void);
uint32_t isaac_room_ambient_824a70_host_va_a2(void);
uint32_t isaac_room_ambient_824a70_host_va_a2_site(void);
uint32_t isaac_room_ambient_824a70_host_va_getlayer(void);
uint32_t isaac_room_ambient_824a70_host_va_getlayer_site(void);
uint32_t isaac_room_ambient_824a70_host_va_vcall_site(void);
uint32_t isaac_room_ambient_824a70_entity_anm2_ptr(uint32_t entity_ptr);
uint32_t isaac_room_ambient_824a70_a2_this_ptr(uint32_t anm2_ptr);
void isaac_room_ambient_824a70_create_args_plan(uint32_t seed, IsaacRoomAmbient824a70CreateArgsPlan* out);
void isaac_room_ambient_824a70_create_host_gates(uint32_t anim_count, uint32_t a1_ok, uint32_t field_34, uint32_t field_34_post, IsaacRoomAmbient824a70CreateHostGates* out);
void isaac_room_ambient_824a70_residual_plan(int32_t mode_26584, int32_t dim_1830c, int32_t stage_id_resolved, int32_t room_type_8, int32_t room_subtype_1bb0, int32_t game_18304, int32_t difficulty_269c8, int32_t stage_0, int32_t stage_type_4, uint32_t flags_2654c, uint32_t room_active_byte0, int32_t frame_264f8, int32_t room_entry_11f0, IsaacRoomAmbient824a70ResidualPlan* out);
void isaac_room_ambient_824a70_wire_decide(int32_t gate_ready, int32_t blob_ready, int32_t mode_26584, int32_t dim_1830c, int32_t stage_id_resolved, int32_t room_type_8, int32_t room_subtype_1bb0, int32_t game_18304, int32_t difficulty_269c8, int32_t stage_0, int32_t stage_type_4, uint32_t flags_2654c, uint32_t room_active_byte0, int32_t frame_264f8, int32_t room_entry_11f0, IsaacRoomAmbient824a70ResidualPlan* out);
int32_t isaac_room_b1_frame_in_room_gate(uint32_t room_active_byte0, int32_t frame_264f8, int32_t room_entry_11f0);
int32_t isaac_room_b1_once_flag_clear(uint32_t flags_60e7);
void isaac_room_b1_flag_or_80000(uint32_t* flags_60e7);
void isaac_room_b1_corner_indices(int32_t width_c, int32_t height_10, IsaacRoomB1Corners* out_corners);
int32_t isaac_room_b1_sfx_needs_host(int32_t room_type_8, int32_t desc_field_40, int32_t difficulty_269c8, int32_t stage_0, int32_t nested_field_10, uint32_t flags_60e7, int32_t boss_id_1bb0);
int32_t isaac_room_b1_spawn_buffer_nonempty(float begin_60e9, float end_60ea);
int32_t isaac_room_b1_spawn_buffer_nonempty_bits(uint32_t begin_183a4, uint32_t end_183a8);
int32_t isaac_room_b1_once_path_needs_spawn_host(uint32_t flags_60e7, uint32_t begin_183a4, uint32_t end_183a8);
int32_t isaac_room_b1_spawn_base_count(int32_t owner_nonzero, int32_t quality);
int32_t isaac_room_b1_spawn_count_clamp(int32_t base_count, int32_t buffer_byte_len);
uint32_t isaac_room_b1_rng_xorshift(uint32_t seed);
int32_t isaac_room_b1_corner_pick(const IsaacRoomB1Corners* corners, uint32_t rng_state);
void isaac_room_b1_corner_world_xy(int32_t corner_index, int32_t width_c, IsaacRoomB1CornerWorld* out_xy);
void isaac_room_b1_entity_post_spawn_mark(int32_t* entity_field_32c);
uint32_t isaac_room_b1_sfx_id(void);
float isaac_room_b1_sfx_play_volume(void);
int32_t isaac_room_b1_sfx_play_frame_delay(void);
int32_t isaac_room_b1_sfx_play_loop(void);
float isaac_room_b1_sfx_play_pitch(void);
float isaac_room_b1_sfx_play_pan(void);
uint32_t isaac_room_b1_host_va_sfx(void);
uint32_t isaac_room_b1_host_va_sfx_pre(void);
uint32_t isaac_room_b1_host_va_sfx_play(void);
uint32_t isaac_room_b1_host_va_spawn_setup(void);
uint32_t isaac_room_b1_host_va_position(void);
uint32_t isaac_room_b1_host_va_spawn(void);
uint32_t isaac_room_b1_host_va_cleanup(void);
uint32_t isaac_room_b1_shuffle_remainder(uint32_t rng_state, int32_t remaining);
int32_t isaac_room_b1_shuffle_needs_swap(uint32_t remainder);
int32_t isaac_room_b1_buffer_elem_stride(void);
int32_t isaac_room_b1_buffer_elem_offset(int32_t index);
float isaac_room_b1_spawn_radius(void);
void isaac_room_b1_fill_sfx_play_imms(IsaacRoomB1ResidualPlan* out);
void isaac_room_b1_residual_plan(uint32_t room_active_byte0, int32_t frame_264f8, int32_t room_entry_11f0, int32_t room_type_8, int32_t desc_field_40, int32_t difficulty_269c8, int32_t stage_0, int32_t nested_field_10, uint32_t flags_60e7, int32_t boss_id_1bb0, uint32_t begin_183a4, uint32_t end_183a8, IsaacRoomB1ResidualPlan* out);
void isaac_room_b1_wire_decide(int32_t outer_ready, int32_t sfx_ready, int32_t buffer_ready, uint32_t room_active_byte0, int32_t frame_264f8, int32_t room_entry_11f0, int32_t room_type_8, int32_t desc_field_40, int32_t difficulty_269c8, int32_t stage_0, int32_t nested_field_10, uint32_t flags_60e7, int32_t boss_id_1bb0, uint32_t begin_183a4, uint32_t end_183a8, IsaacRoomB1ResidualPlan* out);
uint32_t isaac_room_b1_collectible_id(void);
int32_t isaac_room_b1_buffer_byte_len(uint32_t begin_183a4, uint32_t end_183a8);
int32_t isaac_room_b1_spawn_loop_enter(int32_t spawn_count);
int32_t isaac_room_b1_loop_remaining(int32_t spawn_count, int32_t index);
int32_t isaac_room_b1_seed_nonzero(uint32_t seed);
int32_t isaac_room_b1_shuffle_swap_index(int32_t index, uint32_t remainder);
int32_t isaac_room_b1_loop_continue(int32_t next_index, int32_t spawn_count);
int32_t isaac_room_b1_spawn_count_resolved(int32_t owner_nonzero, int32_t quality, uint32_t begin_183a4, uint32_t end_183a8);
int32_t isaac_room_b1_position_zero_pad(void);
uint32_t isaac_room_b1_host_va_owner(void);
uint32_t isaac_room_b1_host_va_quality(void);
uint32_t isaac_room_b1_host_va_post_bind(void);
uint32_t isaac_room_b1_host_va_shuffle_copy(void);
uint32_t isaac_room_b1_host_va_shuffle_assign(void);
uint32_t isaac_room_b1_host_va_shuffle_dtor(void);
void isaac_room_b1_spawn_iter_plan(uint32_t seed_in, int32_t index, int32_t spawn_count, const IsaacRoomB1Corners* corners, int32_t width_c, IsaacRoomB1SpawnIterPlan* out);
void isaac_room_b8_path_cost_cell_step(int32_t* cost_int, int16_t* trail_short);
void isaac_room_b8_path_cost_grid_step(int32_t* costs, int16_t* trails, int32_t cell_count);
uint32_t isaac_room_ambient_824a70_host_va_r0(void);
uint32_t isaac_room_ambient_824a70_host_va_r1(void);
uint32_t isaac_room_ambient_824a70_host_va_r2(void);
uint32_t isaac_room_ambient_824a70_host_va_r3(void);
uint32_t isaac_room_ambient_824a70_host_va_r4(void);
uint32_t isaac_room_ambient_824a70_host_va_r5(void);
uint32_t isaac_room_ambient_824a70_host_va_r6(void);
uint32_t isaac_room_ambient_824a70_host_va_r7(void);
uint32_t isaac_room_ambient_824a70_host_va_genrand(void);
uint32_t isaac_room_ambient_824a70_host_va_loop(void);
float isaac_room_ambient_824a70_body_pos_y_final(float rng_y, int32_t age, float room_y_1c);
void isaac_room_ambient_824a70_body_loop_step(int32_t loop_count, IsaacRoomAmbient824a70LoopStep* out);
void isaac_room_ambient_824a70_body_genrand_loop_posts(uint32_t g0, uint32_t g1, uint32_t g2, uint32_t g3, uint32_t g5, uint32_t g6, uint32_t g7, float min_x, float span_x, float base_y, float span_y, int32_t age, float room_y_1c, IsaacRoomAmbient824a70GenrandLoopPosts* out);
void isaac_room_ambient_824a70_genrand_stream_plan(int32_t loop_count, int32_t sample_count, IsaacRoomAmbient824a70GenrandStreamPlan* out);
int32_t isaac_room_b9b11_frame_age(int32_t frame_264f8, int32_t room_entry_11f0);
int32_t isaac_room_b9b11_challenge_body_needs_host(int32_t challenge_result_nonzero, uint32_t room_active_byte0, int32_t frame_264f8, int32_t room_entry_11f0, int32_t room_type_8, uint32_t room_desc_flags_44);
int32_t isaac_room_b9b11_mode_hooks_needs_host(int32_t room_type_8, uint32_t game_997a_byte);
int32_t isaac_room_b9b11_flag_11f4_needs_host(uint32_t room_byte_11f4);
int32_t isaac_room_b9b11_b10_enemies(int32_t count_12c8, int32_t count_12cc);
int32_t isaac_room_b9b11_b10_fatal_needs_host(int32_t enemies, int32_t old_7224);
int32_t isaac_room_b9b11_double_409030_needs_host(uint32_t room_byte_1d0d);
int32_t isaac_room_b9b11_stage_1a_needs_host(int32_t room_1d18);
int32_t isaac_room_b9b11_frame_age1_needs_host(uint32_t room_active_byte0, int32_t frame_264f8, int32_t room_entry_11f0);
int32_t isaac_room_b9b11_tempfx_flag_clear(uint32_t room_byte_7321);
int32_t isaac_room_b9b11_tempfx_list_empty(uint32_t list_begin_7314, uint32_t list_end_7318);
int32_t isaac_room_b9b11_tempfx_walk_needs_host(uint32_t room_byte_7321, uint32_t list_begin_7314, uint32_t list_end_7318);
int32_t isaac_room_b9b11_tempfx_list_continue(uint32_t cur, uint32_t end);
int32_t isaac_room_b9b11_tempfx_is_candidate(int32_t effect_type, int32_t effect_variant);
uint32_t isaac_room_b9b11_challenge_id(void);
uint32_t isaac_room_b9b11_challenge_room_type(void);
int32_t isaac_room_b9b11_challenge_frame_age(void);
uint32_t isaac_room_b9b11_free_entity_type(void);
uint32_t isaac_room_b9b11_free_entity_variant(void);
uint32_t isaac_room_b9b11_tempfx_variant(void);
int32_t isaac_room_b9b11_tempfx_stride(void);
uint32_t isaac_room_b9b11_stage_id_1a(void);
uint32_t isaac_room_b9b11_host_va_b9_start(void);
uint32_t isaac_room_b9b11_host_va_query(void);
uint32_t isaac_room_b9b11_host_va_free_lookup(void);
uint32_t isaac_room_b9b11_host_va_free_helper(void);
uint32_t isaac_room_b9b11_host_va_mode_hooks(void);
uint32_t isaac_room_b9b11_host_va_flag_11f4(void);
uint32_t isaac_room_b9b11_host_va_b10_start(void);
uint32_t isaac_room_b9b11_host_va_fatal(void);
uint32_t isaac_room_b9b11_host_va_b11_start(void);
uint32_t isaac_room_b9b11_host_va_manager_a(void);
uint32_t isaac_room_b9b11_host_va_manager_b(void);
uint32_t isaac_room_b9b11_host_va_409030(void);
uint32_t isaac_room_b9b11_host_va_40a5d0(void);
uint32_t isaac_room_b9b11_host_va_rewind(void);
uint32_t isaac_room_b9b11_host_va_83a080(void);
uint32_t isaac_room_b9b11_host_va_7eb870(void);
uint32_t isaac_room_b9b11_host_va_genrand(void);
uint32_t isaac_room_b9b11_host_va_camera(void);
uint32_t isaac_room_b9b11_host_va_930820(void);
uint32_t isaac_room_b9b11_host_va_8020d0(void);
uint32_t isaac_room_b9b11_host_va_b12_start(void);
void isaac_room_b9b11_residual_plan(int32_t challenge_result_nonzero, uint32_t room_active_byte0, int32_t frame_264f8, int32_t room_entry_11f0, int32_t room_type_8, uint32_t room_desc_flags_44, uint32_t game_997a_byte, uint32_t room_byte_11f4, int32_t count_12c8, int32_t count_12cc, int32_t old_7224, uint32_t room_byte_1d0d, int32_t room_1d18, uint32_t room_byte_7321, uint32_t list_begin_7314, uint32_t list_end_7318, IsaacRoomB9B11ResidualPlan* out);
void isaac_room_b9b11_wire_decide(int32_t inputs_ready, int32_t challenge_result_nonzero, uint32_t room_active_byte0, int32_t frame_264f8, int32_t room_entry_11f0, int32_t room_type_8, uint32_t room_desc_flags_44, uint32_t game_997a_byte, uint32_t room_byte_11f4, int32_t count_12c8, int32_t count_12cc, int32_t old_7224, uint32_t room_byte_1d0d, int32_t room_1d18, uint32_t room_byte_7321, uint32_t list_begin_7314, uint32_t list_end_7318, IsaacRoomB9B11ResidualPlan* out);
int32_t isaac_room_tailmid_game_has_curse_bit(uint32_t game_flags_1839c);
int32_t isaac_room_tailmid_desc_lacks_curse_bit(uint32_t room_desc_flags_44);
int32_t isaac_room_tailmid_room_is_active(uint32_t room_active_byte0);
int32_t isaac_room_tailmid_frame_age_is_one(int32_t frame_264f8, int32_t room_entry_11f0);
int32_t isaac_room_tailmid_needs_curse_host(uint32_t game_flags_1839c, uint32_t room_desc_flags_44, uint32_t room_active_byte0, int32_t frame_264f8, int32_t room_entry_11f0, uint32_t is_paused);
uint32_t isaac_room_tailmid_curse_flag_or_4000(uint32_t room_desc_flags_44);
uint32_t isaac_room_tailmid_curse_effect_type(void);
uint32_t isaac_room_tailmid_curse_effect_variant(void);
uint32_t isaac_room_tailmid_curse_pos_vec_ptr(void);
uint32_t isaac_room_tailmid_curse_arg_zero(void);
void isaac_room_tailmid_curse_centers(float room_f14, float room_f18, float room_f1c, float room_f20, IsaacRoomTailmidCenters* out);
void isaac_room_tailmid_curse_deltas(float player_x, float player_y, float center_x, float center_y, IsaacRoomTailmidDeltas* out);
int32_t isaac_room_tailmid_curse_pos_is_zero_vec(float pos_x, float pos_y, float zero_x, float zero_y);
float isaac_room_tailmid_curse_vel_scale(float dist);
uint32_t isaac_room_tailmid_host_va_gate(void);
uint32_t isaac_room_tailmid_host_va_ispaused(void);
uint32_t isaac_room_tailmid_host_va_curse(void);
uint32_t isaac_room_tailmid_host_va_curse_genrand(void);
uint32_t isaac_room_tailmid_host_va_curse_getplayer(void);
uint32_t isaac_room_tailmid_host_va_curse_create(void);
uint32_t isaac_room_tailmid_host_va_curse_sqrt(void);
uint32_t isaac_room_tailmid_host_va_801ee0(void);
uint32_t isaac_room_tailmid_host_va_spawn_wave(void);
uint32_t isaac_room_tailmid_host_va_music(void);
uint32_t isaac_room_tailmid_host_va_trigger_output(void);
uint32_t isaac_room_tailmid_host_va_sfx_pre(void);
uint32_t isaac_room_tailmid_host_va_sfx_play(void);
uint32_t isaac_room_tailmid_host_va_800500(void);
uint32_t isaac_room_tailmid_host_va_next(void);
int32_t isaac_room_tailmid_801ee0_is_greed_mode(int32_t difficulty_269c8);
int32_t isaac_room_tailmid_801ee0_boss_count(int32_t count_12c0, int32_t count_12c4);
int32_t isaac_room_tailmid_801ee0_needs_timer_reset_host(int32_t post_timer_723c, int32_t boss_count);
int32_t isaac_room_tailmid_801ee0_needs_spawn_wave_host(int32_t post_timer_723c, int32_t pre_timer_723c);
int32_t isaac_room_tailmid_801ee0_needs_special_host(int32_t stage0, int32_t room_type_8, uint32_t game_flags_1839c, int32_t player_count);
int32_t isaac_room_tailmid_801ee0_timer_set_13(void);
uint32_t isaac_room_tailmid_801ee0_desc_clear_bit40(uint32_t room_desc_flags_44);
uint32_t isaac_room_tailmid_801ee0_game_flag_or_1000(uint32_t game_flags_1839c);
uint32_t isaac_room_tailmid_special_effect_type(void);
uint32_t isaac_room_tailmid_special_effect_variant(void);
uint32_t isaac_room_tailmid_sfx_id(void);
float isaac_room_tailmid_sfx_volume(void);
int32_t isaac_room_tailmid_sfx_frame_delay(void);
int32_t isaac_room_tailmid_sfx_loop(void);
float isaac_room_tailmid_sfx_pitch(void);
float isaac_room_tailmid_sfx_pan(void);
uint32_t isaac_room_tailmid_music_id(void);
int32_t isaac_room_tailmid_800500_early_skip(uint32_t is_paused, int32_t gate_1b83c);
int32_t isaac_room_tailmid_800500_entity_list_empty(uint32_t count_1264);
float isaac_room_tailmid_800500_default_intensity(void);
float isaac_room_tailmid_800500_avg_intensity(float sum, int32_t count);
int32_t isaac_room_tailmid_800500_type_in_threat_band(int32_t type_28);
int32_t isaac_room_tailmid_800500_outer_include_candidate(int32_t game_dim_26614, int32_t type_28);
int32_t isaac_room_tailmid_800500_outer_is_tear_type(int32_t type_28);
int32_t isaac_room_tailmid_800500_outer_is_effect_type(int32_t type_28);
int32_t isaac_room_tailmid_800500_entity_include(int32_t entity_nonzero, int32_t game_dim_26614, int32_t type_28, uint32_t flag_byte_173, int32_t short_c74, float float_39c, int32_t int_31c, uint32_t flags_168, uint32_t flags_16c);
float isaac_room_tailmid_800500_abs_diff(float a, float b);
float isaac_room_tailmid_800500_approach(float curr, float target, float step);
float isaac_room_tailmid_800500_step_half(void);
float isaac_room_tailmid_800500_step_small(void);
float isaac_room_tailmid_800500_dist_scale(void);
int32_t isaac_room_tailmid_800500_timer_72fc_needs_host(int32_t timer_72fc);
int32_t isaac_room_tailmid_800500_timer_72fc_inc(int32_t timer_72fc);
int32_t isaac_room_tailmid_800500_timer_72fc_needs_sfx_play(int32_t post_inc);
int32_t isaac_room_tailmid_800500_timer_72fc_needs_isplaying_host(int32_t post_inc);
int32_t isaac_room_tailmid_800500_timer_72fc_clear_neg1(void);
uint32_t isaac_room_tailmid_800500_room_entity_count_off(void);
uint32_t isaac_room_tailmid_800500_room_entity_list_off(void);
uint32_t isaac_room_tailmid_800500_room_timer_72fc_off(void);
uint32_t isaac_room_tailmid_800500_timer_sfx_id(void);
uint32_t isaac_room_tailmid_800500_timer_sfx_gate(void);
uint32_t isaac_room_tailmid_800500_ch_7084(void);
uint32_t isaac_room_tailmid_800500_ch_7088(void);
uint32_t isaac_room_tailmid_800500_ch_708c(void);
uint32_t isaac_room_tailmid_800500_ch_70c0(void);
uint32_t isaac_room_tailmid_host_va_800500_player_pos(void);
uint32_t isaac_room_tailmid_host_va_800500_islocal(void);
uint32_t isaac_room_tailmid_host_va_800500_body(void);
uint32_t isaac_room_tailmid_host_va_800500_empty(void);
uint32_t isaac_room_tailmid_host_va_800500_epilogue(void);
uint32_t isaac_room_tailmid_host_va_800500_intensity(void);
uint32_t isaac_room_tailmid_host_va_800500_isplaying(void);
uint32_t isaac_room_tailmid_host_va_800500_timer(void);
int32_t isaac_room_tailmid_801ee0_fragment_kind(int32_t difficulty_269c8);
int32_t isaac_room_tailmid_800500_fragment_kind(uint32_t is_paused, int32_t gate_1b83c);
int32_t isaac_room_tailmid_curse_fragment_kind(uint32_t game_flags_1839c, uint32_t room_desc_flags_44, uint32_t room_active_byte0, int32_t frame_264f8, int32_t room_entry_11f0, uint32_t is_paused);
void isaac_room_tailmid_residual_plan(uint32_t game_flags_1839c, uint32_t room_desc_flags_44, uint32_t room_active_byte0, int32_t frame_264f8, int32_t room_entry_11f0, uint32_t is_paused_curse, int32_t difficulty_269c8, uint32_t is_paused_800500, int32_t gate_1b83c, IsaacRoomTailmidResidualPlan* out);
void isaac_room_tailmid_wire_decide(int32_t inputs_ready, uint32_t game_flags_1839c, uint32_t room_desc_flags_44, uint32_t room_active_byte0, int32_t frame_264f8, int32_t room_entry_11f0, uint32_t is_paused_curse, int32_t difficulty_269c8, uint32_t is_paused_800500, int32_t gate_1b83c, IsaacRoomTailmidResidualPlan* out);
uint32_t isaac_room_b3_collectible_id(void);
uint32_t isaac_room_b3_challenge_id(void);
uint32_t isaac_room_b3_te_type(void);
uint32_t isaac_room_b3_te_variant(void);
uint32_t isaac_room_b3_te_stride(void);
uint32_t isaac_room_b3_te_push_ptr(void);
uint32_t isaac_room_b3_flag_offset(void);
uint32_t isaac_room_b3_te_gate_offset(void);
uint32_t isaac_room_b3_te_begin_offset(void);
uint32_t isaac_room_b3_te_end_offset(void);
uint32_t isaac_room_b3_game_owner_offset(void);
uint32_t isaac_room_b3_host_va_start(void);
uint32_t isaac_room_b3_host_va_owner(void);
uint32_t isaac_room_b3_host_va_challenge(void);
uint32_t isaac_room_b3_host_va_challenge_body(void);
uint32_t isaac_room_b3_host_va_te_call(void);
uint32_t isaac_room_b4_host_va_gate(void);
uint32_t isaac_room_b4_host_va_lookup(void);
uint32_t isaac_room_b4_host_va_pos_a(void);
uint32_t isaac_room_b4_host_va_pos_finish(void);
uint32_t isaac_room_b4_host_va_genrand(void);
uint32_t isaac_room_b4_host_va_spawn(void);
uint32_t isaac_room_b4_host_va_cleanup(void);
uint32_t isaac_room_b5_host_va_start(void);
uint32_t isaac_room_b5_host_va_pass1(void);
uint32_t isaac_room_b5_host_va_count(void);
uint32_t isaac_room_b5_host_va_pass2(void);
uint32_t isaac_room_b5_host_va_vector_push(void);
uint32_t isaac_room_b6_host_va_countdown(void);
uint32_t isaac_room_b6_host_va_tree(void);
uint32_t isaac_room_b6_host_va_tree_inc(void);
uint32_t isaac_room_b6_host_va_tree_erase(void);
uint32_t isaac_room_b7_host_va_start(void);
uint32_t isaac_room_b3b7_host_va_next(void);
uint8_t isaac_room_b3_flag_from_owner_result(uint32_t owner_result);
int32_t isaac_room_b3_temp_effects_gate(uint32_t byte_7321);
int32_t isaac_room_b3_temp_effects_list_empty(uint32_t begin_7314, uint32_t end_7318);
int32_t isaac_room_b3_temp_effects_entry_match(int32_t type0, int32_t variant4);
int32_t isaac_room_b3_temp_effects_list_continue(uint32_t cur, uint32_t end_7318);
int32_t isaac_room_b3_temp_effects_needs_host(uint32_t byte_7321, uint32_t begin_7314, uint32_t end_7318);
int32_t isaac_room_b4_desc_type_gate(int32_t desc_type0);
int32_t isaac_room_b4_frame_in_room_gate(uint32_t room_byte1, int32_t entry_11f0, int32_t frame_264f8);
uint32_t isaac_room_b4_xorshift(uint32_t seed, uint32_t shift1, uint32_t shift2, uint32_t shift3);
uint32_t isaac_room_b4_xorshift_imm(uint32_t seed);
uint32_t isaac_room_b4_mod100(uint32_t value);
uint32_t isaac_room_b4_pickup_variant_from_rem(uint32_t rem100);
int32_t isaac_room_b4_second_band_kind(uint32_t rem100);
int32_t isaac_room_b4_option_gate(uint32_t option_byte, int32_t mgr_field8, uint32_t game_nonnull, uint32_t game_dword_26630, uint32_t game_byte_26589);
int32_t isaac_room_b4_second_band_needs_host(uint32_t rem100, uint32_t option_byte, int32_t mgr_field8, uint32_t game_nonnull, uint32_t game_dword_26630, uint32_t game_byte_26589);
int32_t isaac_room_b4_third_spawn_gate(uint32_t xorshift_result);
float isaac_room_b4_pos_y_offset(float room_y_20);
uint32_t isaac_room_b4_xor_shift1(void);
uint32_t isaac_room_b4_xor_shift2(void);
uint32_t isaac_room_b4_xor_shift3(void);
uint32_t isaac_room_b4_y_offset_bits(void);
int32_t isaac_room_b4_desc_type_imm(void);
uint32_t isaac_room_b4_entity_type5(void);
uint32_t isaac_room_b4_spawn_type_1000(void);
uint32_t isaac_room_b4_spawn_variant_a1(void);
uint32_t isaac_room_b4_pickup_subtype(void);
uint32_t isaac_room_b4_third_variant(void);
uint32_t isaac_room_b4_spawn_arg_ptr(void);
uint32_t isaac_room_b4_seed_add(void);
uint32_t isaac_room_b4_game_seed_off(void);
uint32_t isaac_room_b4_entity_seed_off(void);
uint32_t isaac_room_b4_desc_seed_off(void);
uint32_t isaac_room_b4_band_a_variant(void);
uint32_t isaac_room_b4_band_a_sub(void);
uint32_t isaac_room_b4_band_b_variant(void);
uint32_t isaac_room_b4_band_b_sub(void);
uint32_t isaac_room_b4_band_c_variant(void);
uint32_t isaac_room_b4_band_c_sub(void);
uint32_t isaac_room_b4_band_d_variant(void);
uint32_t isaac_room_b4_band_d_sub(void);
uint32_t isaac_room_b4_band_b_option_off(void);
uint32_t isaac_room_b4_band_c_option_off(void);
uint32_t isaac_room_b4_band_d_option_off(void);
uint32_t isaac_room_b4_pos_pad_bits(void);
uint32_t isaac_room_b4_band_option_off(int32_t band_kind);
uint32_t isaac_room_b4_host_va_reward_body(void);
uint32_t isaac_room_b4_host_va_g0(void);
uint32_t isaac_room_b4_host_va_frame_gate(void);
uint32_t isaac_room_b4_host_va_g1(void);
uint32_t isaac_room_b4_host_va_g2a(void);
uint32_t isaac_room_b4_host_va_g2b(void);
uint32_t isaac_room_b4_host_va_g2c(void);
uint32_t isaac_room_b4_host_va_g2d(void);
uint32_t isaac_room_b4_host_va_g3(void);
uint32_t isaac_room_b4_host_va_cleanup_site(void);
uint32_t isaac_room_b4_host_va_next(void);
int32_t isaac_room_b4_seed_present(uint32_t seed_desc_5c);
int32_t isaac_room_b4_lookup_empty(uint32_t lookup_count);
int32_t isaac_room_b4_cleanup_needed(uint32_t lookup_result_byte);
uint32_t isaac_room_b4_seed_offset(uint32_t game_18308);
float isaac_room_b4_pos_pad(void);
void isaac_room_b4_reward_pos(float room_x_1c, float room_y_20, IsaacRoomB4RewardPos* out);
void isaac_room_b4_seed_step(uint32_t seed, IsaacRoomB4SeedStep* out);
void isaac_room_b4_pickup_from_seed(uint32_t seed, IsaacRoomB4PickupFromSeed* out);
void isaac_room_b4_band_imms(int32_t band_kind, IsaacRoomB4BandImms* out);
void isaac_room_b4_effect_spawn_posts(uint32_t genrand, uint32_t game_18308, IsaacRoomB4EffectSpawnPosts* out);
void isaac_room_b4_pickup_spawn_posts(uint32_t genrand, uint32_t rem100, IsaacRoomB4PickupSpawnPosts* out);
void isaac_room_b4_band_spawn_posts(uint32_t genrand, uint32_t rem100, uint32_t option_byte, int32_t mgr_field8, uint32_t game_nonnull, uint32_t game_dword_26630, uint32_t game_byte_26589, IsaacRoomB4BandSpawnPosts* out);
void isaac_room_b4_third_spawn_posts(uint32_t genrand, uint32_t xorshift_result, IsaacRoomB4ThirdSpawnPosts* out);
void isaac_room_b4_reward_seed_chain(uint32_t seed_desc_5c, IsaacRoomB4RewardSeedChain* out);
int32_t isaac_room_b4_lookup_subtype(void);
uint32_t isaac_room_b4_lookup_this_off(void);
uint32_t isaac_room_b4_lookup_count_off(void);
uint32_t isaac_room_b4_lookup_entity_ptr_off(void);
uint32_t isaac_room_b4_room_pos_base_off(void);
uint32_t isaac_room_b4_room_pos_x_off(void);
uint32_t isaac_room_b4_room_pos_y_off(void);
uint32_t isaac_room_b4_room_entry_off(void);
uint32_t isaac_room_b4_room_byte1_off(void);
uint32_t isaac_room_b4_pos_flag0(void);
uint32_t isaac_room_b4_pos_flag1(void);
uint32_t isaac_room_b4_pos_flag2(void);
uint32_t isaac_room_b4_cleanup_cl(void);
uint32_t isaac_room_b4_host_va_pos_a_site(void);
uint32_t isaac_room_b4_host_va_entity_seed(void);
uint32_t isaac_room_b4_host_va_seed_check(void);
uint32_t isaac_room_b4_host_va_seed_fatal(void);
uint32_t isaac_room_b4_host_va_reward_pos(void);
uint32_t isaac_room_b4_host_va_third_pos(void);
void isaac_room_b4_lookup_args(IsaacRoomB4LookupArgs* out);
void isaac_room_b4_lookup_route(uint32_t lookup_count, IsaacRoomB4LookupRoute* out);
void isaac_room_b4_g0_pos_posts(IsaacRoomB4G0PosPosts* out);
void isaac_room_b4_entity_seed_write_posts(uint32_t game_18308, uint32_t lookup_count, IsaacRoomB4EntitySeedWritePosts* out);
void isaac_room_b4_frame_path_enter(uint32_t room_byte1, int32_t entry_11f0, int32_t frame_264f8, uint32_t seed_desc_5c, IsaacRoomB4FramePathEnter* out);
void isaac_room_b4_third_pos(float room_x_14, float room_y_20, IsaacRoomB4ThirdPos* out);
void isaac_room_b4_pos_finish_copy(float host_x, float host_y, IsaacRoomB4PosFinishCopy* out);
void isaac_room_b4_reward_pos_posts(float room_x_1c, float room_y_20, IsaacRoomB4RewardPosPosts* out);
void isaac_room_b4_third_path_posts(uint32_t xorshift_result, float room_x_14, float room_y_20, IsaacRoomB4ThirdPathPosts* out);
void isaac_room_b4_cleanup_posts(uint32_t lookup_result_byte, IsaacRoomB4CleanupPosts* out);
int32_t isaac_room_b4_seed_fatal_needed(uint32_t seed_desc_5c);
uint32_t isaac_room_b5_list_reset_end(uint32_t begin_c82674, uint32_t end_c82678);
int32_t isaac_room_b5_list_needs_reset(uint32_t begin_c82674, uint32_t end_c82678);
int32_t isaac_room_b5_outer_gate(uint32_t room_active_byte0, int32_t frame_264f8, int32_t entry_11f0);
int32_t isaac_room_b5_pass1_mode_gate(int32_t mode_26584);
int32_t isaac_room_b5_entity_type_candidate(int32_t mode_26614, int32_t entity_type_28);
int32_t isaac_room_b5_entity_flag_clear(uint32_t flags_168);
int32_t isaac_room_b5_entity_type_excluded(int32_t entity_type_28, int32_t entity_variant_2c);
int32_t isaac_room_b5_pass1_entity_pre_vcall(uint32_t entity_nonnull, int32_t mode_26614, int32_t entity_type_28, uint32_t flags_168, int32_t field_32c, int32_t entity_variant_2c);
int32_t isaac_room_b5_pass2_count_gate(int32_t count_708250);
int32_t isaac_room_b5_list_empty(uint32_t entity_count_1264);
int32_t isaac_room_b5_list_continue(uint32_t index, uint32_t entity_count_1264);
uint32_t isaac_room_b5_entity_rng_step(uint32_t seed_3dc, uint32_t shift_3e0, uint32_t shift_3e4, uint32_t shift_3e8);
int32_t isaac_room_b5_entity_rng_append_gate(uint32_t rng_result);
uint32_t isaac_room_b5_list_begin_va(void);
uint32_t isaac_room_b5_list_end_va(void);
uint32_t isaac_room_b5_list_cap_va(void);
uint32_t isaac_room_b5_pass1_mode_imm(void);
uint32_t isaac_room_b5_flag_bit(void);
uint32_t isaac_room_b5_vcall_off_48(void);
uint32_t isaac_room_b5_vcall_off_4c(void);
uint32_t isaac_room_b5_list_ptr_stride(void);
uint32_t isaac_room_b5_entity_rng_shift0_off(void);
uint32_t isaac_room_b5_entity_rng_shift1_off(void);
uint32_t isaac_room_b5_entity_rng_shift2_off(void);
uint32_t isaac_room_b5_host_va_outer(void);
uint32_t isaac_room_b5_host_va_pass1_vcall48(void);
uint32_t isaac_room_b5_host_va_pass1_append(void);
uint32_t isaac_room_b5_host_va_pass1_grow(void);
uint32_t isaac_room_b5_host_va_pass2_vcall48(void);
uint32_t isaac_room_b5_host_va_pass2_vcall4c(void);
uint32_t isaac_room_b5_host_va_pass2_rng(void);
uint32_t isaac_room_b5_host_va_pass2_grow(void);
uint32_t isaac_room_b5_host_va_next(void);
int32_t isaac_room_b5_entity_field_32c_ok(int32_t field_32c);
int32_t isaac_room_b5_pass1_entity_pre_vcall48(uint32_t entity_nonnull, int32_t mode_26614, int32_t entity_type_28, uint32_t flags_168);
int32_t isaac_room_b5_pass1_entity_post_vcall48(uint32_t vcall48_nonzero, int32_t field_32c, int32_t entity_type_28, int32_t entity_variant_2c);
int32_t isaac_room_b5_list_at_capacity(uint32_t end_c82678, uint32_t cap_c8267c);
int32_t isaac_room_b5_list_can_direct_store(uint32_t end_c82678, uint32_t cap_c8267c);
uint32_t isaac_room_b5_list_end_after_store(uint32_t end_c82678);
int32_t isaac_room_b5_list_needs_grow_host(uint32_t end_c82678, uint32_t cap_c8267c);
void isaac_room_b5_list_append_route(uint32_t end_c82678, uint32_t cap_c8267c, IsaacRoomB5ListAppendRoute* out);
void isaac_room_b5_pass1_append_posts(uint32_t vcall48_nonzero, int32_t field_32c, int32_t entity_type_28, int32_t entity_variant_2c, uint32_t end_c82678, uint32_t cap_c8267c, IsaacRoomB5Pass1AppendPosts* out);
int32_t isaac_room_b5_pass2_entity_pre_vcall48(uint32_t entity_nonnull, int32_t mode_26614, int32_t entity_type_28, uint32_t flags_168);
int32_t isaac_room_b5_pass2_entity_mid_vcall48(uint32_t vcall48_nonzero, int32_t field_32c);
int32_t isaac_room_b5_pass2_entity_needs_rng(uint32_t vcall4c_nonzero);
int32_t isaac_room_b5_pass2_append_budget(int32_t count_708250);
int32_t isaac_room_b5_entity_rng_seed_present(uint32_t seed_3dc);
int32_t isaac_room_b5_pass2_budget_dec(int32_t budget);
int32_t isaac_room_b5_pass2_budget_continue(int32_t budget);
void isaac_room_b5_pass2_entity_posts(uint32_t entity_nonnull, int32_t mode_26614, int32_t entity_type_28, uint32_t flags_168, uint32_t vcall48_nonzero, int32_t field_32c, uint32_t vcall4c_nonzero, int32_t count_708250, IsaacRoomB5Pass2EntityPosts* out);
void isaac_room_b5_pass2_rng_try_posts(uint32_t seed_3dc, uint32_t shift_3e0, uint32_t shift_3e4, uint32_t shift_3e8, uint32_t end_c82678, uint32_t cap_c8267c, int32_t budget, IsaacRoomB5Pass2RngTryPosts* out);
int32_t isaac_room_b6_destroy_tree_gate(uint32_t count_7238);
int32_t isaac_room_b6_grid_index_valid(int32_t index, int32_t width_c, int32_t height_10);
int32_t isaac_room_b6_slot_present(uint32_t slot_ptr);
int32_t isaac_room_b7_slot_present(uint32_t slot_ptr);
int32_t isaac_room_b7_cell_count(int32_t width_c, int32_t height_10);
int32_t isaac_room_b7_cell_loop_enter(int32_t cell_count);
int32_t isaac_room_b7_cell_loop_continue(int32_t index, int32_t cell_count);
int32_t isaac_room_b7_needs_grid_update_host(int32_t width_c, int32_t height_10);
uint32_t isaac_room_b7_grid_base_off(void);
uint32_t isaac_room_b7_slot_stride(void);
uint32_t isaac_room_b7_vcall_off(void);
uint32_t isaac_room_b7_host_va_loop(void);
uint32_t isaac_room_b7_host_va_vcall(void);
uint32_t isaac_room_b7_grid_slot_off(int32_t index);
int32_t isaac_room_b7_cell_needs_vcall(uint32_t slot_ptr);
void isaac_room_b7_cell_step_posts(int32_t index, int32_t width_c, int32_t height_10, uint32_t slot_ptr, IsaacRoomB7CellStepPosts* out);
void isaac_room_b3b7_residual_plan(uint32_t te_byte_7321, uint32_t te_begin, uint32_t te_end, int32_t desc_type0, uint32_t room_active_byte0, int32_t frame_264f8, int32_t entry_11f0, uint32_t tree_count_7238, int32_t width_c, int32_t height_10, IsaacRoomB3B7ResidualPlan* out);
void isaac_room_b3b7_wire_decide(int32_t sparse_ready, uint32_t te_byte_7321, uint32_t te_begin, uint32_t te_end, int32_t desc_type0, uint32_t room_active_byte0, int32_t frame_264f8, int32_t entry_11f0, uint32_t tree_count_7238, int32_t width_c, int32_t height_10, IsaacRoomB3B7ResidualPlan* out);
uint32_t isaac_room_b3_owner_laz_shared_tag(void);
uint32_t isaac_room_b3_owner_config_twin_bit(void);
uint32_t isaac_room_b3_owner_list_stride(void);
uint32_t isaac_room_b3_owner_player_off_2c(void);
uint32_t isaac_room_b3_owner_player_off_twin(void);
uint32_t isaac_room_b3_host_va_get_collectible(void);
uint32_t isaac_room_b3_host_va_has_collectible(void);
uint32_t isaac_room_b3_host_va_get_collectible_effect(void);
uint32_t isaac_room_b3_host_va_count(void);
int32_t isaac_room_b3_owner_twin_walk_flag(uint32_t laz_shared_tag, uint32_t config_ptr_nonzero, uint32_t config_field_b8);
int32_t isaac_room_b3_owner_list_empty(uint32_t list_begin, uint32_t list_end);
int32_t isaac_room_b3_owner_player_slot_active(uint32_t player_field_2c);
int32_t isaac_room_b3_owner_twin_present(uint32_t twin_ptr);
int32_t isaac_room_b3_owner_has_collectible_hit(uint32_t al_byte);
int32_t isaac_room_b3_owner_list_continue(uint32_t list_cur, uint32_t list_end);
uint32_t isaac_room_b3_hce_gate_off(void);
uint32_t isaac_room_b3_hce_list_begin_off(void);
uint32_t isaac_room_b3_hce_list_end_off(void);
uint32_t isaac_room_b3_hce_stride(void);
uint32_t isaac_room_b3_hce_type_a(void);
uint32_t isaac_room_b3_hce_type_b(void);
uint32_t isaac_room_b3_hce_type_c(void);
uint32_t isaac_room_b3_hce_cooldown_off(void);
int32_t isaac_room_b3_hce_gate_open(uint32_t byte_11);
int32_t isaac_room_b3_hce_list_empty(uint32_t begin, uint32_t end);
int32_t isaac_room_b3_hce_type_eligible(int32_t item_type0);
int32_t isaac_room_b3_hce_entry_match(int32_t item_type0, int32_t item_id4, int32_t coltype);
int32_t isaac_room_b3_hce_list_continue(uint32_t cur, uint32_t end);
int32_t isaac_room_b3_hce_bool_from_match(int32_t matched);
int32_t isaac_room_b3_challenge_body_needs_host(uint32_t hce_al);
uint32_t isaac_room_b3_cb_col_e8(void);
uint32_t isaac_room_b3_cb_col_42(void);
uint32_t isaac_room_b3_cb_mode_16(void);
uint32_t isaac_room_b3_cb_room_field_off(void);
uint32_t isaac_room_b3_cb_store_off(void);
uint32_t isaac_room_b3_cb_te_this_off(void);
uint32_t isaac_room_b3_cb_f_default_bits(void);
uint32_t isaac_room_b3_cb_f_div_bits(void);
uint32_t isaac_room_b3_cb_f_mul_bits(void);
uint32_t isaac_room_b3_cb_f_floor_bits(void);
uint32_t isaac_room_b3_cb_f_owner_bits(void);
uint32_t isaac_room_b3_cb_f_mode_bits(void);
uint32_t isaac_room_b3_cb_f_hce_bits(void);
uint32_t isaac_room_b3_cb_f_count_scale_bits(void);
int32_t isaac_room_b3_cb_gce_hit(uint32_t gce_ptr);
int32_t isaac_room_b3_cb_hce_hit(uint32_t al_byte);
int32_t isaac_room_b3_cb_mode_is_16(int32_t mode_26584);
int32_t isaac_room_b3_cb_room_is_1(int32_t room_1210);
int32_t isaac_room_b3_cb_room_is_2(int32_t room_1210);
int32_t isaac_room_b3_cb_owner_hit(uint32_t owner_ptr);
float isaac_room_b3_cb_scale_from_cooldown(int32_t cooldown8);
void isaac_room_b3_cb_select_base(uint32_t gce_ptr, int32_t cooldown8, uint32_t hce_e8_al, uint32_t hce_42_al, int32_t mode_26584, int32_t room_1210, uint32_t owner_e8_ptr, IsaacRoomB3CbBaseSelect* out);
float isaac_room_b3_cb_count_post(int32_t count_result, float base);
uint32_t isaac_room_b3_te_call_this_off(void);
uint32_t isaac_room_b3_te_call_copy_dst_off(void);
uint32_t isaac_room_b3_te_call_copy_size(void);
uint32_t isaac_room_b3_te_call_timer_off(void);
uint32_t isaac_room_b3_te_call_timer_max(void);
uint32_t isaac_room_b3_te_call_timer_init(void);
uint32_t isaac_room_b3_te_call_byte71_off(void);
uint32_t isaac_room_b3_te_call_field50(void);
uint32_t isaac_room_b3_te_call_field54_bits(void);
uint32_t isaac_room_b3_te_call_field58_bits(void);
uint32_t isaac_room_b3_te_call_field5c_bits(void);
uint32_t isaac_room_b3_te_call_field60_bits(void);
uint32_t isaac_room_b3_te_call_f_180_bits(void);
uint32_t isaac_room_b3_te_call_f_150_bits(void);
uint32_t isaac_room_b3_te_call_f_30_bits(void);
uint32_t isaac_room_b3_te_call_image_field_off(void);
int32_t isaac_room_b3_te_call_timer_positive(int32_t timer34);
int32_t isaac_room_b3_te_call_timer_in_scale_range(int32_t timer34);
int32_t isaac_room_b3_te_call_timer_at_or_above_max(int32_t timer34);
int32_t isaac_room_b3_te_call_needs_init_path(int32_t timer34);
int32_t isaac_room_b3_te_call_scale_timer(int32_t timer34);
int32_t isaac_room_b3_te_call_needs_image_host(uint32_t field_3c);
int32_t isaac_room_b3_te_call_image_present(uint32_t field_3c);
int32_t isaac_room_b3_te_call_seed_present(uint32_t seed);
int32_t isaac_room_b3_te_call_loop_enter(int32_t field50);
int32_t isaac_room_b3_te_call_loop_continue(int32_t index, int32_t field50);
void isaac_room_b3_te_call_init_posts(IsaacRoomB3TeCallInitPosts* out);
uint32_t isaac_room_b9_free_entity_type(void);
uint32_t isaac_room_b9_free_entity_variant(void);
int32_t isaac_room_b9_free_entity_subtype(void);
uint32_t isaac_room_b9_free_arg_pad0(void);
uint32_t isaac_room_b9_free_arg_pad1(void);
uint32_t isaac_room_b9_free_this_off(void);
uint32_t isaac_room_b9_free_result_byte_off(void);
uint32_t isaac_room_b9_free_result_ptr_off(void);
uint32_t isaac_room_b9_free_result_count_off(void);
uint32_t isaac_room_b9_free_helper_this_off(void);
int32_t isaac_room_b9_free_seh_in(void);
uint32_t isaac_room_b9_free_seh_out(void);
uint32_t isaac_room_b9_free_heap_stats_global(void);
uint32_t isaac_room_b9_free_heap_stats_delta(void);
uint32_t isaac_room_b9_free_heap_stats_fallback(void);
uint32_t isaac_room_b9_free_iat_va(void);
uint32_t isaac_room_b9_free_host_va_body(void);
uint32_t isaac_room_b9_free_host_va_lookup(void);
uint32_t isaac_room_b9_free_host_va_helper(void);
uint32_t isaac_room_b9_free_host_va_free_site(void);
uint32_t isaac_room_b9_free_host_va_next(void);
int32_t isaac_room_b9_free_helper_needed(uint32_t lookup_count);
int32_t isaac_room_b9_free_path_needed(uint32_t result_byte);
int32_t isaac_room_b9_free_ptr_needed(uint32_t buf_ptr);
uint32_t isaac_room_b9_free_heap_stats_base(uint32_t heap_stats_global);
uint32_t isaac_room_b9_free_block_ptr(uint32_t buf_ptr);
int32_t isaac_room_b9_free_iat_needed(uint32_t result_byte, uint32_t buf_ptr);
void isaac_room_b9_free_heap_account(uint32_t old_lo, uint32_t old_hi, uint32_t size_header, IsaacRoomB9FreeHeapAccount* out);
void isaac_room_b9_free_body_plan(uint32_t lookup_count, uint32_t result_byte, uint32_t buf_ptr, uint32_t heap_stats_global, IsaacRoomB9FreeBodyPlan* out);
void isaac_room_b9_free_lookup_args(IsaacRoomB9FreeLookupArgs* out);
void isaac_room_genrand_constants(IsaacRoomGenrandConstants* out);
int32_t isaac_room_genrand_index_action(int32_t index);
uint32_t isaac_room_genrand_mag01(uint32_t index);
uint32_t isaac_room_genrand_mix_bits(uint32_t cur, uint32_t next);
uint32_t isaac_room_genrand_twist_word(uint32_t cur, uint32_t next, uint32_t far);
uint32_t isaac_room_genrand_temper(uint32_t value);
void isaac_room_genrand_init(uint32_t seed, uint32_t* state);
void isaac_room_genrand_reload(uint32_t* state);
void isaac_room_genrand_next(uint32_t* state, int32_t index, IsaacRoomGenrandStep* out);
void isaac_room_genrand_fill(uint32_t* state, int32_t index, int32_t count, uint32_t* out_values, IsaacRoomGenrandFill* out);
void isaac_room_genrand_call_residual(uint32_t mode_flag, IsaacRoomGenrandCallResidual* out);
void isaac_room_ambient_824a70_genrand_mt_plan(int32_t loop_count, int32_t mt_state_ready, uint32_t mode_flag, IsaacRoomAmbient824a70GenrandMtPlan* out);
void isaac_room_ambient_824a70_genrand_mt_samples(uint32_t* state, int32_t index, int32_t loop_count, uint32_t mode_flag, uint32_t* out_samples, IsaacRoomGenrandFill* out);
void isaac_room_7230_spawn_pos_mt(uint32_t* state, int32_t index, uint32_t mode_flag, float room_f14, float room_f18, float room_f1c, float room_f20, IsaacRoom7230SpawnPosMt* out);
void isaac_room_genrand_log_layout(IsaacRoomGenrandLogLayout* out);
int32_t isaac_room_genrand_log_overflow_throw(uint32_t size);
void isaac_room_genrand_log_link(uint32_t head, uint32_t head_prev, uint32_t node, int32_t size, IsaacRoomGenrandLogLink* out);
void isaac_room_genrand_log_record(uint32_t value, uint32_t frame, uint32_t backtrace_ret, IsaacRoomGenrandLogRecord* out);
uint32_t isaac_room_genrand_log_trim_cutoff(uint32_t frame, uint32_t factor);
void isaac_room_genrand_log_trim_step(int32_t size, uint32_t front, uint32_t front_next, uint32_t front_prev, uint32_t front_frame, uint32_t frame, uint32_t factor, IsaacRoomGenrandLogTrimStep* out);
void isaac_room_genrand_call_plan(uint32_t mode_flag, uint32_t size, IsaacRoomGenrandCallPlan* out);
void isaac_room_genrand_crt_override(uint32_t mode_flag, IsaacRoomGenrandCrtOverride* out);
int32_t isaac_room_7230_finish_threshold(int32_t counter);
int32_t isaac_room_7230_finish_loop_continue(int32_t counter);
uint32_t isaac_room_7230_finish_rng_next(uint32_t seed);
int32_t isaac_room_7230_finish_seed_fatal(uint32_t seed);
float isaac_room_7230_finish_angle(uint32_t seed_out);
float isaac_room_7230_finish_radius(float radius_in);
void isaac_room_7230_finish_grid_index(float x, float y, int32_t width, int32_t height, IsaacRoom7230FinishGrid* out);
void isaac_room_7230_finish_grid_world(int32_t index, int32_t width, IsaacRoom7230FinishWorld* out);
void isaac_room_7230_finish_step(uint32_t seed, int32_t counter, float radius_in, IsaacRoom7230FinishStep* out);
int32_t isaac_room_grid_collision_config_zero(int32_t data_present, int32_t cfg_type, int32_t cfg_field8);
uint32_t isaac_room_grid_collision_from_cost(int32_t cost);
void isaac_room_get_grid_collision(const IsaacRoomGridCollisionQuery* query, IsaacRoomGridCollisionResult* out);
void isaac_room_7230_finish_sqrt(float x, IsaacRoom7230FinishSqrt* out);
void isaac_room_7230_finish_math_residual(float sqrt_arg, IsaacRoom7230FinishMathResidual* out);
void isaac_room_7230_finish_recurse_step(int32_t budget, IsaacRoom7230FinishRecurseStep* out);
int32_t isaac_room_clamp_812f50_path(int32_t desc_present, int32_t data_present, int32_t shape);
void isaac_room_clamp_812f50_simple(float in_x, float in_y, float margin, float f10, float f14, float f18, float room_x0, float room_y0, float room_x1, float room_y1, IsaacRoomClamp812f50Simple* out);
uint32_t isaac_room_pre_play_rng_next(uint32_t seed, uint32_t shift1, uint32_t shift2, uint32_t shift3);
int32_t isaac_room_pre_play_rare_hit(uint32_t seed_out);
void isaac_room_pre_play_plan(int32_t seed_literal, int32_t game_null, int32_t entry_found, uint32_t seed, uint32_t shift1, uint32_t shift2, uint32_t shift3, IsaacRoomPrePlayPlan* out);
int32_t isaac_room_pre_play_sound_id(int32_t seed_literal, int32_t game_null, int32_t entry_found, uint32_t seed, uint32_t shift1, uint32_t shift2, uint32_t shift3);
int32_t isaac_room_b1_sfx_play_id(int32_t game_null, int32_t entry_found, uint32_t seed, uint32_t shift1, uint32_t shift2, uint32_t shift3);
int32_t isaac_room_tailmid_sfx_play_id(int32_t game_null, int32_t entry_found, uint32_t seed, uint32_t shift1, uint32_t shift2, uint32_t shift3);
int32_t isaac_room_b1_sfx_id_is_remapped(void);
int32_t isaac_room_tailmid_sfx_id_is_remapped(void);
int32_t isaac_room_tailmid_800500_timer_sfx_id_is_remapped(void);
void isaac_room_clamp_812f50_lroom(float in_x, float in_y, float margin, float f10, float f14, float f18, const float* lroom_desc7, int32_t shape_after, float room_x0, float room_y0, float room_x1, float room_y1, IsaacRoomClamp812f50LRoom* out);
int32_t isaac_room_7230_site_a_identity_accept(float clamped_x, float cand_x, float clamped_y, float cand_y);
void isaac_room_7230_site_a_probe(float clamped_x, float cand_x, float clamped_y, float cand_y, int32_t width, int32_t height, IsaacRoom7230SiteAProbe* out);
void isaac_room_7230_site_a_cost_apply(int32_t index, int32_t cost_at_index, int32_t threshold, int32_t width, int32_t entity_count, IsaacRoom7230SiteACost* out);
int32_t isaac_room_7230_exit_counter(int32_t accepted, int32_t counter_stored);
int32_t isaac_room_7230_site_b_taken(int32_t exit_eax);
void isaac_room_7230_site_b_snap(float clamped_x, float clamped_y, int32_t width, int32_t height, IsaacRoom7230SiteBSnap* out);
void isaac_room_7230_spawn_pre_accept(int32_t best_index, int32_t cost_at_best, int32_t gridcoll_result, int32_t entity_present_captured, int32_t entity_type_captured, int32_t arg5_byte, int32_t threshold, IsaacRoom7230SpawnPreAccept* out);
void isaac_room_7230_spawn_candidate(uint32_t seed, float radius_in, float in_x, float in_y, float cos_value, float sin_value, IsaacRoom7230SpawnCandidate* out);
void isaac_room_7230_clamp_site_a(int32_t desc_present, int32_t data_present, float in_x, float in_y, const float* lroom_desc7, int32_t shape_after, float room_x0, float room_y0, float room_x1, float room_y1, IsaacRoom7230ClampSite* out);
void isaac_room_7230_clamp_site_b(int32_t desc_present, int32_t data_present, float in_x, float in_y, const float* lroom_desc7, int32_t shape_after, float room_x0, float room_y0, float room_x1, float room_y1, IsaacRoom7230ClampSite* out);
void isaac_room_7230_spawn_step(int32_t counter, int32_t best_index, int32_t cost_at_best, int32_t gridcoll_result, int32_t entity_present_captured, int32_t entity_type_captured, int32_t arg5_byte, uint32_t seed, float radius_in, float in_x, float in_y, int32_t desc_present, int32_t data_present, int32_t shape_after, const float* lroom_desc7, float cos_value, float sin_value, int32_t width, int32_t height, float room_x0, float room_y0, float room_x1, float room_y1, int32_t cost_at_index, int32_t entity_count, IsaacRoom7230SpawnStep* out);
void isaac_room_7230_door_proximity_gate(float out_x, float out_y, int32_t door_index_captured, int32_t width, IsaacRoom7230DoorProximity* out);
int32_t isaac_room_7230_door_loop_enter(int32_t arg6_byte);
int32_t isaac_room_7230_door_slot_present(uint32_t slot_ptr);
int32_t isaac_room_7230_door_loop_next(int32_t index);
int32_t isaac_room_7230_door_loop_continue(int32_t next_index);
int32_t isaac_room_7230_door_recurse_enter(float enter_dist2);
int32_t isaac_room_7230_door_recurse_retry(float post_dist2);
void isaac_room_7230_door_block_plan(uint32_t arg6_byte, float out_x, float out_y, int32_t width, const IsaacRoom7230DoorSlotSnapshot* slots, IsaacRoom7230DoorBlockPlan* out);
void isaac_room_7230_door_recurse_result(float result_x, float result_y, float* out2);
void isaac_room_7230_door_recurse_plan(int32_t slot_index, int32_t budget, int32_t door_index, int32_t width, float out_x, float out_y, float result_x, float result_y, IsaacRoom7230DoorRecursePlan* out);
int32_t isaac_room_7230_walk_list_enter(uint32_t entity_count_1264);
int32_t isaac_room_7230_walk_list_step(uint32_t remaining);
int32_t isaac_room_7230_walk_list_continue(uint32_t next_remaining);
uint32_t isaac_room_7230_walk_node_next(uint32_t node_addr);
void isaac_room_7230_walk_list_next(uint32_t node_addr, uint32_t remaining, IsaacRoom7230WalkListNext* out);
void isaac_room_7230_spawn_exit_position(int32_t site_b_taken, float cell_x, float cell_y, float site_b_x, float site_b_y, float* out2);
void isaac_room_7230_spawn_position_plan(uint32_t* mt_state, int32_t index, uint32_t mode_flag, float room_f14, float room_f18, float room_f1c, float room_f20, uint32_t handoff_arg4, uint32_t handoff_arg5, IsaacRoom7230SpawnPositionPlan* out);
void isaac_room_7230_spawn_search_vas(IsaacRoom7230SpawnSearchVas* out);
int32_t isaac_room_7230_spawn_search_next(int32_t kind, int32_t best_index, int32_t accept, int32_t identity_accept, int32_t probe_phase, int32_t cost_pass, int32_t entity_count, int32_t loop_continue, int32_t exit_le0, uint32_t arg6_byte);
void isaac_room_7230_spawn_search_iteration(int32_t counter, int32_t best_index, uint32_t seed, int32_t gridcoll_result, int32_t cost_at_best, int32_t entity_present_captured, int32_t entity_type_captured, uint32_t arg5_byte, IsaacRoom7230SpawnSearchIteration* out);
void isaac_room_7230_spawn_search_head(IsaacRoom7230SpawnSearchHead* out);
void isaac_room_7230_spawn_search_head_pre(int32_t gridcoll_result, int32_t cost_at_best, int32_t entity_present_captured, int32_t entity_type_captured, uint32_t arg5_byte, IsaacRoom7230SpawnSearchIteration* out);
int32_t isaac_room_7230_walk_type_eligible(int32_t entity_type, uint32_t arg4_byte, int32_t mode_26614);
void isaac_room_7230_walk_proximity(float cell_x, float cell_y, float ent_x, float ent_y, IsaacRoom7230WalkProximity* out);
int32_t isaac_room_7230_walk_entity_reject(int32_t entity_type, uint32_t arg4_byte, int32_t mode_26614, float cell_x, float cell_y, float ent_x, float ent_y);
int32_t isaac_room_7230_walk_reject_latch(int32_t any_reject, int32_t entity_reject);
int32_t isaac_room_7230_walk_best_index(int32_t best_index, int32_t any_reject);
#pragma pack(push, 1)
typedef struct IsaacRoomSpawn428b20 {
  uint32_t frame[8];        /* {a1..a7, 0} — callee stack order (lowest addr first) */
  uint32_t arity;           /* 7 (ret 0x1c) */
  uint32_t frame_depth;     /* 8 pushed dwords */
  uint32_t host_callee_va;  /* 0x006fe410 */
  uint32_t relays_ecx;      /* 1 — wrapper never writes ecx */
  uint32_t va;              /* 0x00428b20 */
  uint32_t ret_va;          /* 0x00428b45 */
  uint32_t call_va;         /* 0x00428b3d */
} IsaacRoomSpawn428b20;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomSpawn428b20) == 60, "IsaacRoomSpawn428b20 size");
static_assert(offsetof(IsaacRoomSpawn428b20, frame) == 0,
              "IsaacRoomSpawn428b20 frame offset");
static_assert(offsetof(IsaacRoomSpawn428b20, relays_ecx) == 44,
              "IsaacRoomSpawn428b20 relays_ecx offset");
uint32_t isaac_room_spawn_428b20_frame_at(uint32_t index, uint32_t a1, uint32_t a2, uint32_t a3, uint32_t a4, uint32_t a5, uint32_t a6, uint32_t a7);
int32_t isaac_room_spawn_428b20_arity(void);
int32_t isaac_room_spawn_428b20_frame_depth(void);
int32_t isaac_room_spawn_428b20_relays_ecx(void);
uint32_t isaac_room_spawn_428b20_host_callee_va(void);
int32_t isaac_room_spawn_428b20_leading_zero(void);
void isaac_room_spawn_428b20_relayout(uint32_t a1, uint32_t a2, uint32_t a3, uint32_t a4, uint32_t a5, uint32_t a6, uint32_t a7, IsaacRoomSpawn428b20* out);

#pragma pack(push, 1)
typedef struct IsaacRoomB15RainLoopStep {
  int32_t remaining;      /* spawn_count - index              0x00802c20 sub eax,ecx */
  uint32_t seed_in;       /* carried seed for this iteration  (step0 = seed0) */
  uint32_t seed_shuffle;  /* xorshift(seed_in)                0x00802c3c..0x64 */
  uint32_t shuffle_rem;   /* seed_shuffle % remaining (0 when remaining==0; div @0x00802c72 UNSIGNED) */
  int32_t needs_swap;     /* rem != 0                         0x00802c7f cmp/je */
  int32_t swap_index;     /* index + rem                      0x00802c7c lea ecx,[edx+eax] */
  int32_t slot_offset;    /* index * 0x78                     0x00802de0 add [ebp-0x98c],0x78 */
  int32_t swap_offset;    /* swap_index * 0x78                0x00802c8b..0x99 shl4/sub/lea*8 */
  uint32_t seed_corner;   /* xorshift(seed_shuffle)           0x00802d02..0x2f (corner RNG) */
  uint32_t seed_out;      /* = seed_corner, carried           0x00802e02 mov esi,[ebp-0x998] */
  int32_t next_index;     /* index + 1                        0x00802de7 inc ecx */
  int32_t continue_loop;  /* next_index < spawn_count (signed jge @0x00802dfe) */
  int32_t seed_fatal;     /* 0 ok / 1 pre-shuffle / 2 pre-corner 0x00802c28/0x00802cee */
} IsaacRoomB15RainLoopStep;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomB15RainLoopStep) == 52, "IsaacRoomB15RainLoopStep size");
static_assert(offsetof(IsaacRoomB15RainLoopStep, seed_fatal) == 48,
              "IsaacRoomB15RainLoopStep seed_fatal offset");

#pragma pack(push, 1)
typedef struct IsaacRoomB15RainSpawnArgs {
  uint32_t relay_va;          /* FUN_00428b20 spawn site 0x00802dc4 */
  uint32_t a1;                /* *(slot+0)            0x00802dc2 push [edi]     */
  uint32_t a2;                /* *(slot+4)            0x00802dbf push [edi+4]   */
  uint32_t a3;                /* search_result (host) 0x00802dbe push eax       */
  uint32_t a4;                /* 0xc7b640             0x00802db9 push 0xc7b640  */
  uint32_t a5;                /* 0                    0x00802db7 push 0         */
  uint32_t a6;                /* *(slot+8)            0x00802db0 push edi (pre-reload) */
  uint32_t a7;                /* *(slot+0x34)         0x00802daf push esi       */
  uint32_t relays_ecx;        /* 1 — game global 0xc71678 @0x00802da9 passes through */
  uint32_t bind_va;           /* FUN_007ef420 host @0x00802dd5 */
  uint32_t bind_entity_first; /* 1 — entity=relay return pushed last @0x00802dd0/.d2 */
  uint32_t bind_slot_second;  /* 1 — slot ptr pushed first @0x00802dc9 */
  uint32_t entity_mark_field; /* 0x32c @0x00802dee mov [esi+0x32c],-1 */
  uint32_t entity_mark_value; /* 0xffffffff */
} IsaacRoomB15RainSpawnArgs;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomB15RainSpawnArgs) == 56, "IsaacRoomB15RainSpawnArgs size");
static_assert(offsetof(IsaacRoomB15RainSpawnArgs, a7) == 28,
              "IsaacRoomB15RainSpawnArgs a7 offset");

/* v58 (0x007ef4a2..0x007ef5d5): type-5 bind store-pack RELAY structs. PE
   reads [ebx+off] (the slot) and stores [edi+off] (the entity). The src
   struct mirrors the slot dwords/bytes the law reads; pack = common
   stores + type-5 stores + gates + host call site VAs, in PE order. */
#pragma pack(push, 1)
typedef struct IsaacRoomB15BindSrc {
  uint32_t f8;    /* [ebx+0x08] gate for the 0x524 store (full dword) */
  uint32_t f0c;   /* [ebx+0x0c] host call C arg */
  uint32_t f10;   /* [ebx+0x10] -> dst 0x524 (gated) */
  uint32_t f14;   /* [ebx+0x14] host call A arg */
  uint32_t f18;   /* [ebx+0x18] clamp -> dst 0x53c */
  uint32_t f1c;   /* [ebx+0x1c] -> dst 0x540 */
  uint32_t f20;   /* [ebx+0x20] WORD, movsx sign-extend -> dst 0x32c */
  uint32_t f22;   /* [ebx+0x22] byte -> dst 0x52c */
  uint32_t f23;   /* [ebx+0x23] byte -> dst 0x52e (NEW) */
  uint32_t f24;   /* [ebx+0x24] -> dst 0x588 + 0x5c0 reset gate */
  uint32_t f30;   /* [ebx+0x30] -> dst 0x528 */
  uint32_t f38;   /* [ebx+0x38] -> dst 0x3dc */
  uint32_t f3c;   /* [ebx+0x3c] -> dst 0x34 */
  uint32_t f40;   /* [ebx+0x40] -> dst 0x38 */
  uint32_t f50;   /* [ebx+0x50] -> dst 0x530 */
  uint32_t f54;   /* [ebx+0x54] f32 bits -> dst 0xe4/0xe8 (scale pair) */
  uint32_t f58;   /* [ebx+0x58] -> dst 0x404 */
  uint32_t f5c;   /* [ebx+0x5c] -> dst 0x59c */
  uint32_t f60;   /* [ebx+0x60] byte -> dst 0x538 */
} IsaacRoomB15BindSrc;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomB15BindSrc) == 76, "IsaacRoomB15BindSrc size");

#pragma pack(push, 1)
typedef struct IsaacRoomB15BindStorePack {
  uint32_t dst_3dc;      /* src.f38                                  0x7ef4ad */
  uint32_t dst_3e0_lo;   /* qword const lo 4 @0xb1f630              0x7ef4b8 */
  uint32_t dst_3e0_hi;   /* qword const hi 3                         0x7ef4b8 */
  uint32_t dst_3e8;      /* dword const 0x11 @0xb1f638              0x7ef4c0 */
  uint32_t dst_32c;      /* sxw(src.f20)                             0x7ef4cd */
  uint32_t dst_404;      /* src.f58                                  0x7ef4d6 */
  uint32_t type5;        /* 1 iff type_28 == 5 (pack runs)           0x7ef4dc */
  uint32_t store_524;    /* 1 iff src.f8 != 0 (full dword)           0x7ef4e5 */
  uint32_t dst_524;      /* src.f10 (valid iff store_524)            0x7ef4ee */
  uint32_t dst_538;      /* byte: src.f60 & 0xff                     0x7ef501 */
  uint32_t dst_53c;      /* clamp(src.f18, -2..7) SIGNED             0x7ef520 */
  uint32_t dst_52c;      /* byte: src.f22 & 0xff                     0x7ef529 */
  uint32_t dst_588;      /* src.f24                                  0x7ef532 */
  uint32_t reset_5c0;    /* 1 iff src.f24 not in {0, 0xffffffff}     0x7ef541 */
  uint32_t dst_528;      /* src.f30                                  0x7ef554 */
  uint32_t dst_34;       /* src.f3c                                  0x7ef55d */
  uint32_t dst_38;       /* src.f40                                  0x7ef563 */
  uint32_t dst_540;      /* src.f1c                                  0x7ef569 */
  uint32_t dst_e4_bits;  /* f32 src.f54 * 1.0f (X, mulss 0xc3793c)   0x7ef58f */
  uint32_t dst_e8_bits;  /* f32 src.f54 * 1.0f (Y, mulss 0xc37940)   0x7ef587 */
  uint32_t dst_52e;      /* byte: src.f23 & 0xff (NEW)               0x7ef59e */
  uint32_t dst_59c;      /* src.f5c                                  0x7ef5c6 */
  uint32_t dst_530;      /* src.f50                                  0x7ef5cf */
  uint32_t call_a_va;    /* 0x6e2570 (fire iff type5)                0x7ef4f9 */
  uint32_t call_a_arg;   /* src.f14 */
  uint32_t call_b_va;    /* 0x6e21f0 (conditional)                   0x7ef5b4 */
  uint32_t call_b_fire;  /* type5 && field_2c==0x64 && field_30!=0 &&
                            old_byte_52e != new_byte_52e */
  uint32_t call_b_arg;   /* 0 */
  uint32_t call_c_va;    /* 0x6e1a80 (fire iff type5)                0x7ef5be */
  uint32_t call_c_arg;   /* src.f0c */
  uint32_t qword_const_va; /* 0xb1f630 */
  uint32_t dword_const_va; /* 0xb1f638 */
} IsaacRoomB15BindStorePack;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomB15BindStorePack) == 128, "IsaacRoomB15BindStorePack size");
static_assert(offsetof(IsaacRoomB15BindStorePack, dst_3e0_lo) == 4,
              "IsaacRoomB15BindStorePack dst_3e0_lo offset");
static_assert(offsetof(IsaacRoomB15BindStorePack, type5) == 24,
              "IsaacRoomB15BindStorePack type5 offset");
static_assert(offsetof(IsaacRoomB15BindStorePack, call_b_fire) == 104,
              "IsaacRoomB15BindStorePack call_b_fire offset");
#pragma pack(push, 1)
typedef struct IsaacRoomB15BindType6Src {
  uint32_t f0c;   /* [ebx+0x0c] -> dst 0x420 (UNCONDITIONAL within body) */
  uint32_t f10;   /* [ebx+0x10] -> dst 0x424 (gated: field_2c == 0xa)  */
  uint32_t f30;   /* [ebx+0x30] host call D arg                         */
} IsaacRoomB15BindType6Src;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomB15BindType6Src) == 12, "IsaacRoomB15BindType6Src size");

#pragma pack(push, 1)
typedef struct IsaacRoomB15BindType6Out {
  uint32_t type6;        /* 1 iff type_28 == 6 (cmp esi,6)               */
  uint32_t dst_420;      /* src.f0c -> [edi+0x420] (0x7ef6a6, always)    */
  uint32_t store_424;    /* 1 iff type6 && field_2c == 0xa (jne 0x7ef6ac)*/
  uint32_t dst_424;      /* src.f10 -> [edi+0x424] (0x7ef6b1, gated)     */
  uint32_t call_d_fire;  /* type6 (push [ebx+0x30]; call 0x665500)       */
  uint32_t call_d_va;    /* 0x665500                                     */
  uint32_t call_d_arg;   /* src.f30                                      */
  uint32_t head_va;      /* 0x7ef69a                                     */
  uint32_t ret_va;       /* 0x7ef6c7                                     */
} IsaacRoomB15BindType6Out;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomB15BindType6Out) == 36, "IsaacRoomB15BindType6Out size");

#pragma pack(push, 1)
typedef struct IsaacRoomB15BindChainSrc {
  uint32_t base;         /* ebx BEFORE add ebx,0x6c                       */
  uint32_t item_dword;   /* [ebx] AFTER the add (cmp [ebx],0 source)      */
} IsaacRoomB15BindChainSrc;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomB15BindChainSrc) == 8, "IsaacRoomB15BindChainSrc size");

#pragma pack(push, 1)
typedef struct IsaacRoomB15BindChainOut {
  uint32_t stride;          /* 0x6c                                        */
  uint32_t next_base;       /* base + 0x6c (u32 wrap)                      */
  uint32_t skip;            /* 1 iff item_dword == 0 (FULL-dword cmp/je)   */
  uint32_t fire_a;          /* !skip                                       */
  uint32_t call_a_va;       /* 0x4d74a0                                    */
  uint32_t call_a_this_off; /* 0x5c8 (lea ecx,[edi+0x5c8])                 */
  uint32_t call_a_arg;      /* next_base (push ebx POST-add)               */
  uint32_t fire_b;          /* !skip                                       */
  uint32_t call_b_va;       /* 0x407f10 (ANM2::Reset)                      */
  uint32_t call_b_this_off; /* 0x5d0 (lea ecx,[edi+0x5d0])                 */
  uint32_t chain_va;        /* 0x7ef611                                    */
  uint32_t epilogue_va;     /* 0x7ef630                                    */
} IsaacRoomB15BindChainOut;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomB15BindChainOut) == 48, "IsaacRoomB15BindChainOut size");
static_assert(offsetof(IsaacRoomB15BindChainOut, skip) == 8,
              "IsaacRoomB15BindChainOut skip offset");
static_assert(offsetof(IsaacRoomB15BindType6Out, store_424) == 8,
              "IsaacRoomB15BindType6Out store_424 offset");

/* ---- v60: type-1000 dispatch head (PE 0x7ef6ca..0x7ef817) ---- */

#pragma pack(push, 1)
typedef struct IsaacRoomB15BindType1000Src {   /* 12 bytes */
  uint32_t f0c;   /* [ebx+0x0c] -> dst 0x450 (modes 0x74 AND 0x78) */
  uint32_t f10;   /* [ebx+0x10] -> dst 0x424 (mode 0x78 only)      */
  uint32_t f18;   /* [ebx+0x18] -> dst 0x420 (mode 0x78 only)      */
} IsaacRoomB15BindType1000Src;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomB15BindType1000Src) == 12,
              "IsaacRoomB15BindType1000Src size");

#pragma pack(push, 1)
typedef struct IsaacRoomB15BindType1000Out {   /* 96 bytes */
  uint32_t type1000;        /* 1 iff type_28 == 0x3e8 (cmp esi,0x3e8,
                               FULL dword; jne -> NEXT dispatch 0x7ef817) */
  uint32_t mode_pos;        /* field_2c in POS set (7 modes) -> 0x7ef745 */
  uint32_t mode_44;         /* field_2c == 0x44 -> vtable indirect call */
  uint32_t mode_74;         /* field_2c == 0x74 -> shared store 0x7ef733 */
  uint32_t mode_78;         /* field_2c == 0x78 -> 420/424 + 450 stores */
  uint32_t mode_default;    /* none of the above -> jne 0x7efa3d (no stores) */
  uint32_t store_420;       /* mode_78 (dst 0x420 = src.f18)              */
  uint32_t dst_420;         /* src.f18                                    */
  uint32_t store_424;       /* mode_78 (dst 0x424 = src.f10)              */
  uint32_t dst_424;         /* src.f10                                    */
  uint32_t store_450;       /* mode_74 || mode_78 (dst 0x450 = src.f0c)   */
  uint32_t dst_450;         /* src.f0c                                    */
  uint32_t indirect_fire;   /* mode_44 -> call dword ptr [eax+0xc] (HOST,
                               eax=[edi] vtable, ecx=edi; ret 8)          */
  uint32_t indirect_slot;   /* 0xc (vtable slot offset)                   */
  uint32_t pos_fire;        /* mode_pos -> 0x7ef745 position-model path   */
  uint32_t pos_genrand_va;  /* 0x6eef60 (2 HOST genrand calls)            */
  uint32_t pos_scale_va;    /* 0xba9ff4 (mulss 2^-32 scale)               */
  uint32_t pos_scale_bits;  /* 0x2f800000                                 */
  uint32_t pos_sign_tbl_va; /* 0xbacb00 (u32->f64 bias table)             */
  uint32_t pos_game_global; /* 0xc71678 (Game ptr, BSS)                   */
  uint32_t pos_game_off;    /* 0x18300 (Game->0x18300 read)               */
  uint32_t head_va;         /* 0x7ef6ca                                    */
  uint32_t next_va;         /* 0x7ef817 (next dispatch when type != 1000) */
  uint32_t default_va;      /* 0x7efa3d (mode default epilogue)           */
} IsaacRoomB15BindType1000Out;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomB15BindType1000Out) == 96,
              "IsaacRoomB15BindType1000Out size");
static_assert(offsetof(IsaacRoomB15BindType1000Out, type1000) == 0,
              "IsaacRoomB15BindType1000Out type1000 offset");
static_assert(offsetof(IsaacRoomB15BindType1000Out, store_420) == 24,
              "IsaacRoomB15BindType1000Out store_420 offset");
static_assert(offsetof(IsaacRoomB15BindType1000Out, indirect_fire) == 48,
              "IsaacRoomB15BindType1000Out indirect_fire offset");
static_assert(offsetof(IsaacRoomB15BindType1000Out, head_va) == 84,
              "IsaacRoomB15BindType1000Out head_va offset");

#pragma pack(push, 1)
typedef struct IsaacRoomB15BindType1000PosSrc { /* 16 bytes */
  uint32_t v0_bits;  /* f32 [Game->0x18300 + 0x14] (-> stack +0x20) */
  uint32_t v1_bits;  /* f32 [Game->0x18300 + 0x18] (-> stack +0x14) */
  uint32_t v2_bits;  /* f32 [Game->0x18300 + 0x1c] (-> stack +0x18) */
  uint32_t v3_bits;  /* f32 [Game->0x18300 + 0x20] (-> stack +0x10) */
} IsaacRoomB15BindType1000PosSrc;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomB15BindType1000PosSrc) == 16,
              "IsaacRoomB15BindType1000PosSrc size");

#pragma pack(push, 1)
typedef struct IsaacRoomB15BindType1000PosOut { /* 16 bytes */
  uint32_t dst_33c_bits;  /* f32: a0 + unit1*(a2-a0) (genrand #2) */
  uint32_t dst_340_bits;  /* f32: a1 + unit0*(a3-a1) (genrand #1) */
  uint32_t genrand_va;    /* 0x6eef60 (HOST) */
  uint32_t scale_bits;    /* 0x2f800000 */
} IsaacRoomB15BindType1000PosOut;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomB15BindType1000PosOut) == 16,
              "IsaacRoomB15BindType1000PosOut size");

/* v61: B15 bind dispatch tail (PE 0x7ef817..0x7efa43). */
#pragma pack(push, 1)
typedef struct IsaacRoomB15BindTailSrc {   /* 48 bytes */
  uint32_t f0c;   /* [ebx+0x0c] -> dst 0x434 (pack) + f32(u32) -> 0x380 (v21) */
  uint32_t f10;   /* [ebx+0x10] -> dst 0x438 (pack)                       */
  uint32_t f14;   /* [ebx+0x14] -> dst 0x43c (pack)                       */
  uint32_t f18;   /* [ebx+0x18] -> dst 0x440 (pack); f18 SIGNED gate (tail)*/
  uint32_t f1c;   /* [ebx+0x1c] -> dst 0x444 (pack)                       */
  uint32_t f23;   /* [ebx+0x23] byte -> dst 0x448 (pack)                  */
  uint32_t f28;   /* [ebx+0x28] host 0xa10600 this (this_off 0x28)        */
  uint32_t f34;   /* [ebx+0x34] host 0x6d03e0 arg2                        */
  uint32_t f3c;   /* [ebx+0x3c] -> dst 0x34 (pack)                        */
  uint32_t f50;   /* [ebx+0x50] -> dst 0x418 (pack) + dst 0x380 (tail)    */
  uint32_t f54;   /* [ebx+0x54] -> dst 0x44c (pack) + f32 scale pair      */
  uint32_t f60;   /* [ebx+0x60] byte -> chain gate (SIGNED js)            */
} IsaacRoomB15BindTailSrc;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomB15BindTailSrc) == 48,
              "IsaacRoomB15BindTailSrc size");

#pragma pack(push, 1)
typedef struct IsaacRoomB15BindTailOut {   /* 280 bytes */
  /* type classification (FULL-dword gates). */
  uint32_t type21;        /* type_28 == 0x21 -> path_a (0x7efa1a)  */
  uint32_t type124;       /* type_28 == 0x124 -> path_a            */
  uint32_t type4;         /* type_28 == 4 -> path_b (store pack)   */
  uint32_t type11;        /* type_28 == 0x11 -> DEFAULT (path_c)   */
  uint32_t type38b;       /* type_28 == 0x38b -> DEFAULT (path_c)  */
  uint32_t path_a;        /* type21 || type124 (dst 0x380 f32(u32))*/
  uint32_t path_b;        /* type == 4 (12-store pack 0x7ef835)    */
  uint32_t path_c;        /* other (0x7ef924 host-gate tail)       */
  /* type-4 store pack (all gated on type4, unconditional in body). */
  uint32_t store_438;     /* type4 (dst 0x438 = src.f10)           */
  uint32_t dst_438;
  uint32_t store_43c;     /* type4 (dst 0x43c = src.f14)           */
  uint32_t dst_43c;
  uint32_t store_440;     /* type4 (dst 0x440 = src.f18)           */
  uint32_t dst_440;
  uint32_t store_444;     /* type4 (dst 0x444 = src.f1c)           */
  uint32_t dst_444;
  uint32_t store_463;     /* type4 (byte dst 0x463 = 1)            */
  uint32_t dst_463;
  uint32_t store_448;     /* type4 (byte dst 0x448 = src.f23)      */
  uint32_t dst_448;
  uint32_t store_418;     /* type4 (dst 0x418 = src.f50)           */
  uint32_t dst_418;
  uint32_t store_44c;     /* type4 (dst 0x44c = src.f54)           */
  uint32_t dst_44c;
  uint32_t store_e4;      /* type4 (f32 dst 0xe4 = f32(f54)*1.0 X) */
  uint32_t dst_e4_bits;
  uint32_t store_e8;      /* type4 (f32 dst 0xe8 = f32(f54)*1.0 Y) */
  uint32_t dst_e8_bits;
  uint32_t store_34;      /* type4 (dst 0x34 = src.f3c)            */
  uint32_t dst_34;
  uint32_t store_434;     /* type4 (dst 0x434 = src.f0c)           */
  uint32_t dst_434;
  /* chain decisions (pure pre-call). */
  uint32_t chain_fire;    /* (int8)src.f60 >= 0 (js NOT taken)     */
  uint32_t chain_arg;     /* (u32)edx < (u32)count ? edx : 0       */
  uint32_t chain_count;   /* (Game[0x1baac]-Game[0x1baa8]) >> 2    */
  uint32_t chain_host_va; /* 0x417870 (fires when chain_fire)      */
  uint32_t subcall_fire;  /* [this+0x3c8] != 0 -> 0x4cf210 fires   */
  uint32_t subcall_va;    /* 0x4cf210                              */
  uint32_t subcall_this_off; /* 0x3cc (this = f3c8 + 0x3cc)        */
  uint32_t chain_this_off;   /* 0x3c8 (pre-call [this+0x3c8] gate) */
  uint32_t chain_ret_va;  /* 0x7ef921 (type-4 success epilogue)    */
  uint32_t final_va;      /* 0x4cdcf0 (host-gated result!=0)       */
  /* path A (v21/v124): dst 0x380 = f32(u32 src.f0c) — pure.       */
  uint32_t store_380_v21; /* path_a                                */
  uint32_t dst_380_v21_bits; /* f32(u32 src.f0c)                  */
  /* path C tail: dst 0x380 = src.f50 (when !type11 && !type38b AND
     host gate passed — caller ANDs). */
  uint32_t store_380;     /* path_c && !type11 && !type38b         */
  uint32_t dst_380;       /* src.f50                               */
  uint32_t call_6d03e0_fire; /* (int32)src.f18 >= 0 (js skips)     */
  uint32_t call_6d03e0_va;   /* 0x6d03e0                           */
  uint32_t call_6d03e0_arg;  /* src.f18                            */
  uint32_t call_6d03e0_arg2; /* src.f34                            */
  uint32_t call_a10600_va;   /* 0xa10600                           */
  uint32_t call_a10600_arg;  /* 0xc7b640                           */
  uint32_t call_a10600_this_off; /* 0x28                           */
  uint32_t call_812d00_va;   /* 0x812d00                           */
  uint32_t call_813520_va;   /* 0x813520                           */
  uint32_t call_67f070_va;   /* 0x67f070 (-> result vec ptr)       */
  uint32_t gate_va;          /* 0x6ac530 (HOST gate, al!=0 needed) */
  uint32_t lerp_fire;        /* path_c && !type11 && !type38b      */
  uint32_t genrand_va;       /* 0x6eef60 (HOST)                    */
  uint32_t scale20_va;       /* 0xbaa87c (mulss 20.0f)             */
  uint32_t scale20_bits;     /* 0x41a00000                         */
  uint32_t scale2_va;        /* 0xba9ff4 (mulss 2^-32)             */
  uint32_t scale2_bits;      /* 0x2f800000                         */
  uint32_t sign_tbl_va;      /* 0xbacb00 (u32->f64 bias)           */
  uint32_t game_global;      /* 0xc71678 (Game ptr, BSS)           */
  uint32_t game_count_lo_off;/* 0x1baa8                            */
  uint32_t game_count_hi_off;/* 0x1baac                            */
  uint32_t f80_bits;         /* 0x42a00000 (imm arg to 0x812d00)   */
  uint32_t head_va;          /* 0x7ef817                           */
  uint32_t default_va;       /* 0x7efa3d (common epilogue)         */
} IsaacRoomB15BindTailOut;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomB15BindTailOut) == 280,
              "IsaacRoomB15BindTailOut size");
static_assert(offsetof(IsaacRoomB15BindTailOut, type21) == 0,
              "IsaacRoomB15BindTailOut type21 offset");
static_assert(offsetof(IsaacRoomB15BindTailOut, store_438) == 32,
              "IsaacRoomB15BindTailOut store_438 offset");
static_assert(offsetof(IsaacRoomB15BindTailOut, chain_fire) == 128,
              "IsaacRoomB15BindTailOut chain_fire offset");
static_assert(offsetof(IsaacRoomB15BindTailOut, store_380_v21) == 168,
              "IsaacRoomB15BindTailOut store_380_v21 offset");
static_assert(offsetof(IsaacRoomB15BindTailOut, lerp_fire) == 228,
              "IsaacRoomB15BindTailOut lerp_fire offset");
static_assert(offsetof(IsaacRoomB15BindTailOut, head_va) == 272,
              "IsaacRoomB15BindTailOut head_va offset");

#pragma pack(push, 1)
typedef struct IsaacRoomB15BindTailLerpSrc { /* 16 bytes */
  uint32_t vec0_bits;  /* f32 [esi+0] (host 0x67f070 result) -> X  */
  uint32_t vec1_bits;  /* f32 [esi+4] -> Y                         */
  uint32_t base_x_bits;/* f32 [esp+0x20] (frame local, blob)       */
  uint32_t base_y_bits;/* f32 [esp+0x24] (frame local, blob)       */
} IsaacRoomB15BindTailLerpSrc;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomB15BindTailLerpSrc) == 16,
              "IsaacRoomB15BindTailLerpSrc size");

/* v62: FUN_007efa50 head gates (PE 0x7efa7f..0x7efb66). All scalar src
   fields 32-bit; byte gates re-narrow in the body (no narrow scalar
   params). */
#pragma pack(push, 1)
typedef struct IsaacRoom706cHeadSrc {   /* 44 bytes */
  int32_t f706c;        /* [esi+0x706c] restock timer (SIGNED jle gate) */
  int32_t game_18304;   /* [Game+0x18304] stage gate (FULL dword == -3) */
  uint32_t this4_40;    /* [this4+0x40] slot gate (FULL dword == 0)     */
  uint32_t f11ec;       /* [esi+0x11ec] bomb timer (u32 dec/ja)         */
  uint32_t this4_44;    /* [this4+0x44] byte bit0 gate + DWORD or store */
  uint32_t this4_4a;    /* [this4+0x4a] word counter (16-bit inc wrap)  */
  uint32_t this4_10_48; /* [this4_10+0x48] host arg (blob)              */
  uint32_t this_f8;     /* [this+8] greed compare (blob)                */
  uint32_t greed1;      /* host 0x6f8120 result #1 (blob)               */
  uint32_t greed2;      /* host 0x6f8120 result #2 (blob, FRESH call)   */
  uint32_t game_18334;  /* [Game+0x18334] blob -> [Game+0x18368]        */
} IsaacRoom706cHeadSrc;
#pragma pack(pop)
static_assert(sizeof(IsaacRoom706cHeadSrc) == 44,
              "IsaacRoom706cHeadSrc size");
static_assert(offsetof(IsaacRoom706cHeadSrc, game_18334) == 40,
              "IsaacRoom706cHeadSrc game_18334 offset");

#pragma pack(push, 1)
typedef struct IsaacRoom706cHeadOut {   /* 152 bytes */
  /* --- RESTOCK GATE 0x7efa7f..0x7efa97 (SIGNED jle) --- */
  uint32_t restock_fire;    /* (int32)f706c > 0 */
  uint32_t restock_store_706c; /* 0xffffffff when fire */
  uint32_t restock_host_va; /* 0x8158a0 (Room::ShopRestockPartial, this=room) */
  /* --- STAGE/SLOT GATES 0x7efa9d..0x7efab1 (FULL dword) --- */
  uint32_t stage_early;     /* game_18304 == -3 -> 0x7eff38 early */
  uint32_t slot_early;      /* this4_40 == 0 -> 0x7eff38 early */
  /* --- BOMB BLOCK 0x7efab7..0x7efb58 (only when !stage_early &&
         !slot_early) --- */
  uint32_t bomb_fire;       /* (u32)(f11ec-1) <= 7 && (this4_44 & 1) == 0 */
  uint32_t store_11ec;      /* bomb: [esi+0x11ec] = 0 */
  uint32_t store_44;        /* bomb: this4_44 | 1 (DWORD or) */
  uint32_t store_4a;        /* bomb: (uint16)(this4_4a + 1) word wrap */
  /* Host 0x9e5960 args (push order R->L: bit10, word4a, [this4_10+0x48],
     [this+8]). */
  uint32_t arg_bit10;       /* ((this4_44 | 1) >> 0xa) & 1 (post-or) */
  uint32_t arg_word4a;      /* (this4_4a + 1) & 0xffff (movzx) */
  uint32_t arg_10_48;       /* this4_10_48 */
  uint32_t arg_f8;          /* this_f8 */
  uint32_t call_9e5960_fire;/* bomb_fire (unconditional in block) */
  uint32_t call_9e5960_va;  /* 0x9e5960 */
  uint32_t call_9e5960_this_off; /* 0x266e4 (this = Game + 0x266e4) */
  uint32_t greed_va;        /* 0x6f8120 (Game::IsGreedMode) */
  /* 0x7efb1c..0x7efb24: test al,al ; je fire ; cmp [esi+8],1 ; je skip.
     fire_9bb840 = (greed1==0) || (this_f8!=1). */
  uint32_t fire_9bb840;
  uint32_t call_9bb840_va;  /* 0x9bb840 */
  uint32_t call_9bb840_this_off; /* 0x1baa8 (this = Game + 0x1baa8) */
  uint32_t fire_7fb250;     /* bomb_fire (unconditional in block) */
  uint32_t call_7fb250_va;  /* 0x7fb250 (this = room/esi) */
  /* 0x7efb38..0x7efb55: FRESH greed call; store only if
     (greed2!=0 && this_f8==1). */
  uint32_t store_18368_fire;
  uint32_t dst_18368;       /* game_18334 -> [Game+0x18368] */
  uint32_t store_18368_src_off; /* 0x18334 */
  uint32_t store_18368_dst_off; /* 0x18368 */
  /* 0x7efb5b..0x7efb61: HOST 0x571170 (this=this4+0x74), unconditional
     once stage/slot pass. */
  uint32_t call_571170_fire;/* !stage_early && !slot_early */
  uint32_t call_571170_va;  /* 0x571170 */
  uint32_t call_571170_this_off; /* 0x74 */
  /* Offset / constants pins. */
  uint32_t game_global;     /* 0xc71678 */
  uint32_t game_18304_expect; /* -3 */
  uint32_t f706c_off;       /* 0x706c */
  uint32_t f11ec_off;       /* 0x11ec */
  uint32_t n44_off;         /* 0x44 */
  uint32_t n4a_off;         /* 0x4a */
  uint32_t bomb_timer_max;  /* 7 */
  uint32_t head_va;         /* 0x7efa50 */
  uint32_t ret_va;          /* 0x7eff48 */
} IsaacRoom706cHeadOut;
#pragma pack(pop)
static_assert(sizeof(IsaacRoom706cHeadOut) == 152,
              "IsaacRoom706cHeadOut size");
static_assert(offsetof(IsaacRoom706cHeadOut, restock_fire) == 0,
              "IsaacRoom706cHeadOut restock_fire offset");
static_assert(offsetof(IsaacRoom706cHeadOut, bomb_fire) == 20,
              "IsaacRoom706cHeadOut bomb_fire offset");
static_assert(offsetof(IsaacRoom706cHeadOut, arg_bit10) == 36,
              "IsaacRoom706cHeadOut arg_bit10 offset");
static_assert(offsetof(IsaacRoom706cHeadOut, store_18368_fire) == 88,
              "IsaacRoom706cHeadOut store_18368_fire offset");
static_assert(offsetof(IsaacRoom706cHeadOut, head_va) == 144,
              "IsaacRoom706cHeadOut head_va offset");

/* v62: GRID COPY (PE 0x7efb66..0x7efbfd). memory-to-memory; params are
   scalar u32: src array base (stride 4), dst base, f0c, f10 (SIGNED
   imul), garbage (pre-existing [ebp-0x18] dword for default slots). */
#pragma pack(push, 1)
typedef struct IsaacRoom706cGridSrc {   /* 20 bytes */
  uint32_t src_array_ptr; /* array of u32 src pointers (stride 4) */
  uint32_t dst_ptr;       /* dst base [[this4+0x68]] */
  int32_t f0c;            /* [esi+0xc] (SIGNED imul) */
  int32_t f10;            /* [esi+0x10] (SIGNED imul) */
  uint32_t garbage;       /* pre-existing [ebp-0x18] dword */
} IsaacRoom706cGridSrc;
#pragma pack(pop)
static_assert(sizeof(IsaacRoom706cGridSrc) == 20,
              "IsaacRoom706cGridSrc size");

#pragma pack(push, 1)
typedef struct IsaacRoom706cGridOut {   /* 56 bytes */
  int32_t total;          /* (int32)f0c * (int32)f10, 32-bit wrap */
  uint32_t iterations;    /* loop iterations actually run */
  uint32_t copies;        /* entries with src != 0 */
  uint32_t defaults;      /* entries with src == 0 */
  uint32_t stride;        /* 0x20 (byte offset step) */
  uint32_t src_off;       /* 0x24 (array base field) */
  uint32_t dst_off;       /* 0x68 (dst base field) */
  uint32_t magic;         /* 0x16a9de81 (default slot) */
  uint32_t slot_size;     /* 0x20 (default slot bytes) */
  uint32_t copy_src_off;  /* 4 (copy starts at [src+4]) */
  uint32_t head_va;       /* 0x7efa50 */
  uint32_t ret_va;        /* 0x7eff48 */
  uint32_t grid_head_va;  /* 0x7efb66 (loop entry) */
  uint32_t grid_done_va;  /* 0x7efbfd (exit) */
} IsaacRoom706cGridOut;
#pragma pack(pop)
static_assert(sizeof(IsaacRoom706cGridOut) == 56,
              "IsaacRoom706cGridOut size");

/* v62: ENTITY WALK STEP (PE 0x7efbfd..0x7efc10 entry + 0x7efcba..0x7efcd0
   classification + 0x7eff1e..0x7eff32 tail). pure step law: count gate
   (UNSIGNED jbe), per-entity path_a classification (FULL dword), loop
   continue (UNSIGNED jb) + next index. Config template consts are
   annotations for the HOST 0x7eeeb0 pushes. */
#pragma pack(push, 1)
typedef struct IsaacRoom706cWalkStepOut { /* 128 bytes */
  uint32_t path_a;        /* (type_28 == 0x3c5 && subtype_2c == 0) FULL dword */
  uint32_t loop_fire;     /* (uint32)count != 0 (jbe vs 0 not taken) */
  uint32_t continue_loop; /* (uint32)(index+1) < (uint32)count (jb) */
  uint32_t next_index;    /* (index + 1) & 0xffffffff (inc) */
  uint32_t type_gate;     /* 0x3c5 */
  uint32_t subtype_gate;  /* 0 */
  uint32_t list_off;      /* 0x125c (entity list base) */
  uint32_t count_off;     /* 0x1264 (entity count) */
  uint32_t stride;        /* 4 (entity list stride) */
  /* config template consts (annotations; the template itself is host-
     gated via 0x7eeeb0). */
  uint32_t magic16_0;     /* 0 (0xbacc80) */
  uint32_t magic16_1;     /* 0 */
  uint32_t magic16_2;     /* 0xffffffff */
  uint32_t magic16_3;     /* 0xffffffff */
  uint32_t pos_vec_va;    /* 0xc7b640 (f32 x/y) */
  uint32_t f60_bits;      /* 0x42700000 (60.0f) */
  uint32_t f1_bits;       /* 0x3f800000 (1.0f) */
  uint32_t byte1;         /* 1 (byte [ebp-0x48]) */
  uint32_t host_7eeeb0_va;/* 0x7eeeb0 (3 call variants) */
  uint32_t vec_ctor_va;   /* 0x4d3130 (in-place ctor) */
  uint32_t vec_grow_va;   /* 0x4d7530 (grow) */
  uint32_t vec_stride;    /* 0x78 (elem size) */
  uint32_t vec_list_off;  /* 0x78 (size field) */
  uint32_t vec_end_off;   /* 0x7c (end field) */
  uint32_t vec_head_off;  /* 0x74 (vector head) */
  uint32_t vtable_slot;   /* 0xc (indirect) */
  uint32_t global_a;      /* 0xc7e84c */
  uint32_t global_b;      /* 0xc7e850 */
  uint32_t entity_type_off; /* 0x28 */
  uint32_t entity_sub_off;  /* 0x2c */
  uint32_t entity_f3c0_off; /* 0x3c0 */
  uint32_t head_va;       /* 0x7efa50 */
  uint32_t ret_va;        /* 0x7eff48 */
} IsaacRoom706cWalkStepOut;
#pragma pack(pop)
static_assert(sizeof(IsaacRoom706cWalkStepOut) == 128,
              "IsaacRoom706cWalkStepOut size");
static_assert(offsetof(IsaacRoom706cWalkStepOut, path_a) == 0,
              "IsaacRoom706cWalkStepOut path_a offset");
static_assert(offsetof(IsaacRoom706cWalkStepOut, type_gate) == 16,
              "IsaacRoom706cWalkStepOut type_gate offset");
static_assert(offsetof(IsaacRoom706cWalkStepOut, host_7eeeb0_va) == 68,
              "IsaacRoom706cWalkStepOut host_7eeeb0_va offset");
static_assert(offsetof(IsaacRoom706cWalkStepOut, head_va) == 120,
              "IsaacRoom706cWalkStepOut head_va offset");

/* --- v63: FUN_007eff50 Room::RestoreState pure laws --- */

/* Counter guard (PE 0x7eff5c..0x7eff6c entry, 0x7f019e normal exit,
   0x7f01ab early exit). entry_store = c+1; BOTH exits net-restore c. */
#pragma pack(push, 1)
typedef struct IsaacRoomRestoreCountersOut { /* 28 bytes */
  uint32_t entry_store;      /* [0xc71674] = counter_in + 1 */
  uint32_t exit_store;       /* normal: dec [0xc71674] -> counter_in */
  uint32_t exit_early_store; /* early: dec entry-inc ecx -> counter_in */
  uint32_t global_va;        /* 0xc71674 */
  uint32_t head_va;          /* 0x7eff50 */
  uint32_t ret_va;           /* 0x7f01aa */
  uint32_t ret_early_va;     /* 0x7f01b8 */
} IsaacRoomRestoreCountersOut;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomRestoreCountersOut) == 28,
              "IsaacRoomRestoreCountersOut size");

/* List1 walk step source (PE 0x7eff76..0x7f00b4). cur_ptr = element k
   address (begin + k*0x78), end_ptr = list end; field scalars are the
   element memory reads; next_* = the ADVANCED (k+1) element reads used
   on path A; room_f0c = idiv divisor. */
#pragma pack(push, 1)
typedef struct IsaacRoomRestoreList1Src { /* 52 bytes */
  uint32_t cur_ptr;      /* element k address (u32 wrap basis) */
  uint32_t end_ptr;      /* [f4+0x78] loop end pointer */
  uint32_t cur_f0;       /* [cur+0] type (FULL dword gate 0x3c5) */
  uint32_t cur_f4;       /* [cur+4] subtype gate 0 */
  uint32_t cur_f8;       /* [cur+8] PATH_B arg a6 */
  uint32_t cur_f34;      /* [cur+0x34] PATH_B arg a7 */
  uint32_t cur_f80;      /* [cur+0x80] PATH_A arg a6 */
  uint32_t cur_fac;      /* [cur+0xac] PATH_A arg a7 */
  uint32_t cur_f50_bits; /* [cur+0x50] f32 bits -> deg2rad -> cos/sin */
  uint32_t cur_w20;      /* [cur+0x20] WORD, movsx int16 -> idiv */
  uint32_t next_f0;      /* [next+0] PATH_A create arg a1 */
  uint32_t next_f4;      /* [next+4] PATH_A create arg a2 */
  int32_t room_f0c;      /* [room+0xc] idiv divisor (SIGNED) */
  uint32_t cos_r_bits;   /* HOST 0x41d540 result passthrough (vel.x) */
  uint32_t sin_r_bits;   /* HOST 0x41d520 result passthrough (vel.y) */
} IsaacRoomRestoreList1Src;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomRestoreList1Src) == 60,
              "IsaacRoomRestoreList1Src size");

/* List1 walk step output (152 bytes). */
#pragma pack(push, 1)
typedef struct IsaacRoomRestoreList1Out { /* 152 bytes */
  uint32_t path_a;         /* FULL dword cur.f0==0x3c5 && cur.f4==0 */
  uint32_t continue_loop;  /* next_ptr != end_ptr (EQUALITY jne) */
  uint32_t next_ptr;       /* cur_ptr + 0x78 (u32 wrap) */
  uint32_t saved_ptr;      /* cur_ptr + 0x28 ([esp+0x10]) */
  uint32_t create_host_va; /* 0x6fe410 */
  uint32_t create_this_va; /* 0xc71678 (Game global) */
  uint32_t create_a1;      /* path_a ? next_f0 : cur_f0 */
  uint32_t create_a2;      /* path_a ? next_f4 : cur_f4 */
  uint32_t create_a3;      /* path_a ? next_ptr+0x28 : cur_ptr+0x28 */
  uint32_t create_a4;      /* 0xc7b640 (pos vec const) */
  uint32_t create_a5;      /* 0 */
  uint32_t create_a6;      /* path_a ? cur_f80 : cur_f8 */
  uint32_t create_a7;      /* path_a ? cur_fac : cur_f34 */
  uint32_t create_a8;      /* 0 */
  uint32_t bind_host_va;   /* 0x7ef420 (this=room) */
  uint32_t bind_arg1_fire; /* 1 (bind always fires; arg1 = create result) */
  uint32_t bind_arg2;      /* path_a ? next_ptr : cur_ptr */
  uint32_t local_a_bits;   /* f32(f50) * deg2rad (0x3c8efa35) */
  int32_t quot;            /* (int16)w20 / (int32)room_f0c (SIGNED) */
  int32_t rem;             /* (int16)w20 % (int32)room_f0c */
  uint32_t local_d_bits;   /* f32(rem)*40.0f + 40.0f (pos.x) */
  uint32_t local_e_bits;   /* f32(quot)*40.0f + 120.0f (pos.y) */
  uint32_t minecart_va;    /* 0x6b7be0 GiveMinecart */
  uint32_t minecart_this_passthru; /* 1 (this = create result) */
  uint32_t pos_ptr_off;    /* 0x20 ([esp+0x20], position base) */
  uint32_t vel_ptr_off;    /* 0x18 ([esp+0x18], velocity base) */
  uint32_t cos_va;         /* 0x41d540 (velocity.x host result) */
  uint32_t sin_va;         /* 0x41d520 (velocity.y host result) */
  uint32_t cos_r_bits;     /* host cos result passthrough (vel.x) */
  uint32_t sin_r_bits;     /* host sin result passthrough (vel.y) */
  uint32_t stride;         /* 0x78 */
  uint32_t type_gate;      /* 0x3c5 */
  uint32_t sub_gate;       /* 0 */
  uint32_t deg2rad_bits;   /* 0x3c8efa35 (NOT 22.5f) */
  uint32_t f40_bits;       /* 0x42200000 */
  uint32_t f120_bits;      /* 0x42f00000 */
  uint32_t head_va;        /* 0x7eff50 */
  uint32_t ret_va;         /* 0x7f01aa */
} IsaacRoomRestoreList1Out;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomRestoreList1Out) == 152,
              "IsaacRoomRestoreList1Out size");
static_assert(offsetof(IsaacRoomRestoreList1Out, path_a) == 0,
              "IsaacRoomRestoreList1Out path_a offset");
static_assert(offsetof(IsaacRoomRestoreList1Out, create_a1) == 24,
              "IsaacRoomRestoreList1Out create_a1 offset");
static_assert(offsetof(IsaacRoomRestoreList1Out, local_a_bits) == 68,
              "IsaacRoomRestoreList1Out local_a_bits offset");
static_assert(offsetof(IsaacRoomRestoreList1Out, head_va) == 144,
              "IsaacRoomRestoreList1Out head_va offset");

/* List2 clear (PE 0x7f00ba..0x7f00df). */
#pragma pack(push, 1)
typedef struct IsaacRoomRestoreList2ClearOut { /* 20 bytes */
  uint32_t dtor_count;      /* (end-begin)/0x78 when begin!=end else 0 */
  uint32_t store_end;       /* [f4+0x78] = begin (RE-READ begin) */
  uint32_t dtor_host_va;    /* 0x4d6ee0 (EntitySaveState dtor) */
  uint32_t stride;          /* 0x78 */
  uint32_t head_va;         /* 0x7eff50 */
} IsaacRoomRestoreList2ClearOut;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomRestoreList2ClearOut) == 20,
              "IsaacRoomRestoreList2ClearOut size");

/* Gates (PE 0x7f00e2..0x7f0100). */
#pragma pack(push, 1)
typedef struct IsaacRoomRestoreGatesOut { /* 40 bytes */
  uint32_t fire;            /* f4_0==-10 && game_0==8 && byte bit0 */
  uint32_t f4_0_expect;     /* -10 (0xfffffff6, FULL dword) */
  uint32_t game_0_expect;   /* 8 */
  uint32_t f4_44_off;       /* 0x44 (byte bit0) */
  uint32_t byte_bit;        /* 1 */
  uint32_t early_ret_va;    /* 0x7f01b8 */
  uint32_t head_va;         /* 0x7eff50 */
  uint32_t ret_va;          /* 0x7f01aa */
  uint32_t grid_head_va;    /* 0x7f0106 */
  uint32_t grid_done_va;    /* 0x7f018d */
} IsaacRoomRestoreGatesOut;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomRestoreGatesOut) == 40,
              "IsaacRoomRestoreGatesOut size");

/* Loop8 step (PE 0x7f018d..0x7f019e). */
#pragma pack(push, 1)
typedef struct IsaacRoomRestoreLoop8Out { /* 16 bytes */
  uint32_t continue_loop;   /* (u32)(k+1) < 8 (UNSIGNED jb) */
  uint32_t host_va;         /* 0x8167e0 (this=room, arg=k) */
  uint32_t arg;             /* k */
  uint32_t count;           /* 8 */
} IsaacRoomRestoreLoop8Out;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomRestoreLoop8Out) == 16,
              "IsaacRoomRestoreLoop8Out size");

/* Grid fix step source (PE 0x7f0106..0x7f018d). */
#pragma pack(push, 1)
typedef struct IsaacRoomRestoreGridSrc { /* 36 bytes */
  int32_t cols;         /* [room+0xc] (RE-read per outer iter) */
  int32_t rows;         /* [room+0x10] (RE-read per outer iter) */
  int32_t i;            /* row index (outer counter, starts 1) */
  int32_t j;            /* col index (inner counter, starts 1) */
  uint32_t src_ptr;     /* grid[index] pointer ([[room+0x24]+index*4]) */
  uint32_t src_f4;      /* [src+4] type (== 0xf) */
  uint32_t src_f24;     /* [src+0x24] target index (u32 <= 0x1bf) */
  uint32_t dst_ptr;     /* grid[target] pointer */
  uint32_t dst_f4;      /* [dst+4] (!= 1 to fire) */
} IsaacRoomRestoreGridSrc;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomRestoreGridSrc) == 36,
              "IsaacRoomRestoreGridSrc size");

/* Grid fix step output (104 bytes). */
#pragma pack(push, 1)
typedef struct IsaacRoomRestoreGridOut { /* 104 bytes */
  uint32_t outer_fire;      /* (s32)(rows-1) > 1 (SIGNED jle gate) */
  uint32_t inner_fire;      /* (s32)(cols-1) > 1 (SIGNED jle gate) */
  int32_t index;            /* (s32)(cols*i + j), SIGNED imul+add wrap */
  uint32_t index_ok;        /* (s32)index >= 0 (js guard) */
  uint32_t i_ok;            /* i >= 0 && i < rows (signed) */
  uint32_t j_ok;            /* j >= 0 && j < cols (signed) */
  uint32_t src_ok;          /* src_ptr != 0 */
  uint32_t src_type_ok;     /* src_f4 == 0xf */
  uint32_t target;          /* src_f24 */
  uint32_t target_ok;       /* (u32)target <= 0x1bf (UNSIGNED ja) */
  uint32_t dst_ok;          /* dst_ptr != 0 */
  uint32_t dst_type_ok;     /* dst_f4 != 1 */
  uint32_t fire;            /* all guards pass */
  uint32_t store_76c_value; /* 0x384 when fire ([grid+target*4+0x76c]) */
  uint32_t indirect_fire;   /* fire (INDIRECT [dst] vtable[0]) */
  uint32_t indirect_arg;    /* 1 (pushed before the indirect call) */
  uint32_t vtable_slot;     /* 0 */
  uint32_t continue_j;      /* (s32)(j+1) < (s32)(cols-1) (jl) */
  uint32_t continue_i;      /* (s32)(i+1) < (s32)(rows-1) (jl) */
  uint32_t grid_base_off;   /* 0x24 */
  uint32_t cell_stride;     /* 4 */
  uint32_t type_gate;       /* 0xf */
  uint32_t target_max;      /* 0x1bf */
  uint32_t f76c_off;        /* 0x76c */
  uint32_t head_va;         /* 0x7eff50 */
  uint32_t ret_va;          /* 0x7f01aa */
} IsaacRoomRestoreGridOut;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomRestoreGridOut) == 104,
              "IsaacRoomRestoreGridOut size");
static_assert(offsetof(IsaacRoomRestoreGridOut, fire) == 48,
              "IsaacRoomRestoreGridOut fire offset");
static_assert(offsetof(IsaacRoomRestoreGridOut, head_va) == 96,
              "IsaacRoomRestoreGridOut head_va offset");

/* v64 — FUN_007f01c0 ambient body PURE ISLANDS (PE 0x7f01c0..0x7f072e,
   1 ret; SEH-framed). Landed laws: (a) slot position math
   (0x7f02b8..0x7f0305: SIGNED idiv [slot+0x24]/room_f0c; quot*40+120
   +laneA, rem*40+40+laneB, lane=edi&3), (b) main distance (0x7f030a..
   0x7f0323: CROSSED slot_x-p340 / slot_y-p33c, dist2, CRT sqrt
   0x435a50 primitive), (c) special step (0x7f032e..0x7f03a9: s13c0==
   0x23, len2>4.0f, 4-quadrant dir law), (d) adj distance (0x7f03c9..
   0x7f0401: crossed vs p340+2b / p33c+2a), (e) tail decision
   (0x7f040f..0x7f0476: flag byte 0x3a0&0x10, 25.0f range gate,
   type{1..5}, byte f4+0x44&1, 60.0f bind gate, ecx provenance = dir |
   player_f1624, bind 0x710480), (f) bounds chain (0x7f04a2..0x7f0515:
   this.f8==0x10, 120/110/100/140 + f1c/f20+20 gates, dest VAs).
   SQRT = CRT platform primitive (cvtss2sd/ucomisd/sqrtsd/cvtsd2ss,
   error path 0xaf090b) — same law as 7230 finish_sqrt. */
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_VA = 0x007f01c0u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_RET_VA = 0x007f072eu;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_EPILOGUE_VA = 0x007f0711u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_GAME_GLOBAL = 0x00c71678u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_ROOM_OFF = 0x18300u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_SLOT_ARR_OFF = 0x724u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_SLOT_COUNT = 8u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_SQRT_VA = 0x00435a50u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_BIND_HOST_VA = 0x00710480u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_RANGE_TAIL_VA = 0x007f0544u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_BIND_SITE_VA = 0x007f0478u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_CONTINUE_VA = 0x007f051bu;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_TAIL_CONTINUE_VA = 0x007f0485u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_DEST_6F4_VA = 0x007f06f4u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_DEST_6AC_VA = 0x007f06acu;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_DEST_692_VA = 0x007f0692u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_DEST_678_VA = 0x007f0678u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_F40_BITS = 0x42200000u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_F40_VA = 0x00baa904u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_F120_BITS = 0x42f00000u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_F120_VA = 0x00baaa00u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_GATE4_BITS = 0x40800000u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_GATE4_VA = 0x00baa75cu;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_RANGE_BITS = 0x41c80000u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_RANGE_VA = 0x00baa8a0u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_BIND60_BITS = 0x42700000u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_BIND60_VA = 0x00baa950u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_B110_BITS = 0x42dc0000u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_B110_VA = 0x00baa9ecu;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_B100_BITS = 0x42c80000u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_B100_VA = 0x00baa9d0u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_B140_BITS = 0x430c0000u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_B140_VA = 0x00baaa30u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_B20_BITS = 0x41a00000u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_B20_VA = 0x00baa87cu;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_LANE_QUOT_VA = 0x00bacbf0u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_LANE_REM_VA = 0x00bacab0u;
/* .rdata lane tables are {-18,0,0,-18} (0xbacbf0) / {18,0,0,18}
   (0xbacab0); the PE displacement indexing (two movups stores +
   [ebp+8*lane-0x30] / [ebp+8*lane-0x34]) unpacks them to laneA
   (quot path) = {0,-18,0,18} and laneB (rem path) = {-18,0,18,0}. */
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_LANE_OFF_QUOT[4] = {
    0x00000000u, 0xc1900000u, 0x00000000u, 0x41900000u};
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_LANE_OFF_REM[4] = {
    0xc1900000u, 0x00000000u, 0x41900000u, 0x00000000u};
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_SPECIAL_TYPE = 0x23u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_THIS_TYPE_GATE = 0x10u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_SLOT_F3A0_BIT = 0x10u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_F4_44_OFF = 0x44u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_F4_44_BIT = 1u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_PLAYER_33C_OFF = 0x33cu;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_PLAYER_340_OFF = 0x340u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_PLAYER_13C0_OFF = 0x13c0u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_PLAYER_1624_OFF = 0x1624u;
static constexpr int32_t ISAAC_ROOM_AMBIENT_7F01C0_BIND_ARG0 = 0;

/* v64 structs — FUN_007f01c0 pure islands. */
#pragma pack(push, 1)
typedef struct IsaacRoomAmbientPos7f01c0Src { /* 12 bytes */
  int32_t slot_f24;   /* [slot+0x24] SIGNED idiv dividend */
  int32_t room_f0c;   /* [room+0xc] SIGNED idiv divisor */
  uint32_t lane;      /* edi & 3 (0..3) */
} IsaacRoomAmbientPos7f01c0Src;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomAmbientPos7f01c0Src) == 12,
              "IsaacRoomAmbientPos7f01c0Src size");

#pragma pack(push, 1)
typedef struct IsaacRoomAmbientPos7f01c0Out { /* 40 bytes */
  int32_t quot;           /* idiv quotient (signed toward zero) */
  int32_t rem;            /* idiv remainder */
  uint32_t div_ok;        /* no idiv fault (divisor!=0 && !INT_MIN/-1) */
  uint32_t lane;          /* edi&3 echoed */
  uint32_t slot_x_bits;   /* f32(quot)*40+120+laneA[lane] */
  uint32_t slot_y_bits;   /* f32(rem)*40+40+laneB[lane] */
  uint32_t f40_bits;      /* 0x42200000 */
  uint32_t f120_bits;     /* 0x42f00000 */
  uint32_t lane_quot_va;  /* 0xbacbf0 (laneA source) */
  uint32_t lane_rem_va;   /* 0xbacab0 (laneB source) */
} IsaacRoomAmbientPos7f01c0Out;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomAmbientPos7f01c0Out) == 40,
              "IsaacRoomAmbientPos7f01c0Out size");
static_assert(offsetof(IsaacRoomAmbientPos7f01c0Out, slot_x_bits) == 16,
              "IsaacRoomAmbientPos7f01c0Out slot_x_bits offset");

#pragma pack(push, 1)
typedef struct IsaacRoomAmbientDist7f01c0Src { /* 16 bytes */
  uint32_t slot_x_bits; /* slot position x (quot path) f32 bits */
  uint32_t slot_y_bits; /* slot position y (rem path) f32 bits */
  uint32_t p33c_bits;   /* [player+0x33c] f32 bits */
  uint32_t p340_bits;   /* [player+0x340] f32 bits */
} IsaacRoomAmbientDist7f01c0Src;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomAmbientDist7f01c0Src) == 16,
              "IsaacRoomAmbientDist7f01c0Src size");

#pragma pack(push, 1)
typedef struct IsaacRoomAmbientDist7f01c0Out { /* 24 bytes */
  uint32_t d0_bits;        /* f32(slot_x - p340) (CROSSED) */
  uint32_t d1_bits;        /* f32(slot_y - p33c) (CROSSED) */
  uint32_t dist2_bits;     /* f32(f32(d0*d0)+f32(d1*d1)) */
  uint32_t dist_bits;      /* CRT sqrt(dist2) (sqrt is primitive) */
  uint32_t sqrt_va;        /* 0x435a50 */
  uint32_t sqrt_primitive; /* 1: platform CRT primitive */
} IsaacRoomAmbientDist7f01c0Out;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomAmbientDist7f01c0Out) == 24,
              "IsaacRoomAmbientDist7f01c0Out size");

#pragma pack(push, 1)
typedef struct IsaacRoomAmbientSpecial7f01c0Src { /* 16 bytes */
  uint32_t s13c0; /* [player+0x13c0] (full-dword), 0x23 gate */
  uint32_t a_bits; /* [player+0x360] f32 bits */
  uint32_t b_bits; /* [player+0x364] f32 bits */
  uint32_t pad;    /* alignment */
} IsaacRoomAmbientSpecial7f01c0Src;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomAmbientSpecial7f01c0Src) == 16,
              "IsaacRoomAmbientSpecial7f01c0Src size");

#pragma pack(push, 1)
typedef struct IsaacRoomAmbientSpecial7f01c0Out { /* 40 bytes */
  uint32_t special_active; /* s13c0 == 0x23 */
  uint32_t len2_bits;      /* f32(a*a + b*b) */
  uint32_t len2_gt_4;      /* len2 > 4.0f ORDERED (comiss jbe skip) */
  uint32_t dir;            /* 4-quadrant dir law (0..3) */
  uint32_t dir_ok;         /* dir valid when special_active && gt */
  uint32_t gate4_bits;     /* 0x40800000 */
  uint32_t gate4_va;       /* 0xbaa75c */
  uint32_t sqrt_va;        /* 0x435a50 */
  uint32_t head_va;        /* 0x7f01c0 */
  uint32_t epilogue_va;    /* 0x7f0711 */
} IsaacRoomAmbientSpecial7f01c0Out;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomAmbientSpecial7f01c0Out) == 40,
              "IsaacRoomAmbientSpecial7f01c0Out size");

#pragma pack(push, 1)
typedef struct IsaacRoomAmbientAdjDist7f01c0Src { /* 24 bytes */
  uint32_t slot_x_bits; /* slot position x (quot path) f32 bits */
  uint32_t slot_y_bits; /* slot position y (rem path) f32 bits */
  uint32_t p33c_bits;   /* [player+0x33c] f32 bits */
  uint32_t p340_bits;   /* [player+0x340] f32 bits */
  uint32_t a_bits;      /* [player+0x360] f32 bits (direction) */
  uint32_t b_bits;      /* [player+0x364] f32 bits (direction) */
} IsaacRoomAmbientAdjDist7f01c0Src;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomAmbientAdjDist7f01c0Src) == 24,
              "IsaacRoomAmbientAdjDist7f01c0Src size");

#pragma pack(push, 1)
typedef struct IsaacRoomAmbientAdjDist7f01c0Out { /* 20 bytes */
  uint32_t d0_bits;    /* f32(slot_x - f32(p340 + f32(b+b))) (CROSSED) */
  uint32_t d1_bits;    /* f32(slot_y - f32(p33c + f32(a+a))) (CROSSED) */
  uint32_t dist2_bits; /* f32(f32(d0*d0)+f32(d1*d1)) */
  uint32_t dist_bits;  /* CRT sqrt(dist2) */
  uint32_t sqrt_va;    /* 0x435a50 */
} IsaacRoomAmbientAdjDist7f01c0Out;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomAmbientAdjDist7f01c0Out) == 20,
              "IsaacRoomAmbientAdjDist7f01c0Out size");

#pragma pack(push, 1)
typedef struct IsaacRoomAmbientTail7f01c0Src { /* 40 bytes */
  uint32_t special_active;  /* s13c0==0x23 (from special_step) */
  uint32_t len2_gt_4;       /* len2 > 4.0f (from special_step) */
  uint32_t dir;             /* dir (from special_step) */
  uint32_t player_f1624;    /* [player+0x1624] (ecx fallback) */
  uint32_t slot_type8;      /* [slot+8] full-dword type */
  int32_t slot_f0c;         /* [slot+0xc] */
  uint32_t slot_f3a0_byte;  /* [slot+0x3a0] wide; body masks 0x10 */
  uint32_t this_f4_44_byte; /* [this.f4+0x44] wide; body masks 1 */
  uint32_t dist_bits;       /* current distance f32 bits */
  uint32_t lane;            /* edi & 3 */
} IsaacRoomAmbientTail7f01c0Src;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomAmbientTail7f01c0Src) == 40,
              "IsaacRoomAmbientTail7f01c0Src size");

#pragma pack(push, 1)
typedef struct IsaacRoomAmbientTail7f01c0Out { /* 72 bytes */
  uint32_t ecx_gate;      /* dir when special&&gt else player_f1624 */
  uint32_t ecx_is_dir;    /* provenance flag */
  uint32_t compare_enable;/* byte&0x10 ? (f0c!=2) : (f0c==2) */
  uint32_t flag_bit_set;  /* byte [slot+0x3a0] bit 0x10 */
  uint32_t range_dest;    /* 25.0f > dist ORDERED -> 0x7f0544 */
  uint32_t type_ok;       /* f8 in {1,2,3,4,5} (full dword) */
  uint32_t this_gate_ok;  /* byte [this.f4+0x44] & 1 */
  uint32_t dist60_ok;     /* 60.0f > dist ORDERED */
  uint32_t dir_eq_lane;   /* ecx_gate == lane */
  uint32_t bind_fire;     /* all tail gates pass -> host 0x710480 */
  uint32_t bind_host_va;  /* 0x710480 */
  uint32_t bind_arg0;     /* 0 (pushed first) */
  uint32_t range_gate_bits; /* 0x41c80000 (25.0f) */
  uint32_t bind_gate_bits;  /* 0x42700000 (60.0f) */
  uint32_t dest_544_va;   /* 0x7f0544 (range tail) */
  uint32_t dest_485_va;   /* 0x7f0485 (continue) */
  uint32_t head_va;       /* 0x7f01c0 */
  uint32_t epilogue_va;   /* 0x7f0711 */
} IsaacRoomAmbientTail7f01c0Out;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomAmbientTail7f01c0Out) == 72,
              "IsaacRoomAmbientTail7f01c0Out size");

#pragma pack(push, 1)
typedef struct IsaacRoomAmbientBounds7f01c0Src { /* 24 bytes */
  uint32_t this_f8;      /* [this+8] (== 0x10 gate) */
  uint32_t p33c_bits;    /* [player+0x33c] f32 bits (p0) */
  uint32_t p340_bits;    /* [player+0x340] f32 bits (p1) */
  uint32_t room_f1c_bits;/* [this+0x1c] f32 bits */
  uint32_t room_f20_bits;/* [this+0x20] f32 bits */
  uint32_t pad;          /* alignment */
} IsaacRoomAmbientBounds7f01c0Src;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomAmbientBounds7f01c0Src) == 24,
              "IsaacRoomAmbientBounds7f01c0Src size");

#pragma pack(push, 1)
typedef struct IsaacRoomAmbientBounds7f01c0Out { /* 88 bytes */
  uint32_t chain_active; /* this_f8 == 0x10 (full dword) */
  uint32_t gate_a;       /* 120.0f > p1 ORDERED -> 0x7f06f4 */
  uint32_t gate_b;       /* 110.0f > p1 ORDERED (pass) */
  uint32_t gate_c;       /* p0 > 100.0f ORDERED (pass) */
  uint32_t gate_d;       /* 140.0f > p0 ORDERED -> 0x7f06f4 */
  uint32_t gate_e;       /* p0 > fround(f1c+20) ORDERED -> 0x7f06ac */
  uint32_t gate_f;       /* 0.0f > p0 ORDERED (-0.0 excluded) */
  uint32_t gate_g;       /* p1 > fround(f20+20) ORDERED -> 0x7f0678 */
  uint32_t dest;         /* 0=cont,1=6f4,2=6ac,3=692,4=678 */
  uint32_t dest_va;      /* resolved destination VA */
  uint32_t cont_va;      /* 0x7f051b */
  uint32_t f120_bits;    /* 0x42f00000 */
  uint32_t f120_va;      /* 0xbaaa00 */
  uint32_t f110_bits;    /* 0x42dc0000 */
  uint32_t f110_va;      /* 0xbaa9ec */
  uint32_t f100_bits;    /* 0x42c80000 */
  uint32_t f100_va;      /* 0xbaa9d0 */
  uint32_t f140_bits;    /* 0x430c0000 */
  uint32_t f140_va;      /* 0xbaaa30 */
  uint32_t f20_bits;     /* 0x41a00000 */
  uint32_t f20_va;       /* 0xbaa87c */
  uint32_t sqrt_va;      /* 0x435a50 */
} IsaacRoomAmbientBounds7f01c0Out;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomAmbientBounds7f01c0Out) == 88,
              "IsaacRoomAmbientBounds7f01c0Out size");
static_assert(offsetof(IsaacRoomAmbientBounds7f01c0Out, dest) == 32,
              "IsaacRoomAmbientBounds7f01c0Out dest offset");

#pragma pack(push, 1)
typedef struct IsaacRoomB15BindTailLerpOut { /* 40 bytes */
  uint32_t dst_33c_bits;  /* f32 X: (unit*vec[0])*20.0f + base_x   */
  uint32_t dst_340_bits;  /* f32 Y: (unit*vec[1])*20.0f + base_y   */
  uint32_t genrand_va;    /* 0x6eef60 (HOST)                       */
  uint32_t scale2_va;     /* 0xba9ff4 (2^-32)                      */
  uint32_t scale2_bits;   /* 0x2f800000                            */
  uint32_t scale20_va;    /* 0xbaa87c (20.0f)                      */
  uint32_t scale20_bits;  /* 0x41a00000                            */
  uint32_t sign_tbl_va;   /* 0xbacb00                              */
  uint32_t host_vec_va;   /* 0x67f070                              */
  uint32_t lerp_va;       /* 0x7ef9b4                              */
} IsaacRoomB15BindTailLerpOut;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomB15BindTailLerpOut) == 40,
              "IsaacRoomB15BindTailLerpOut size");
int32_t isaac_room_b15_rain_stride(void);
uint32_t isaac_room_b15_rain_pos_vec_ptr(void);
uint32_t isaac_room_b15_rain_game_global(void);
uint32_t isaac_room_b15_rain_entity_mark_field(void);
uint32_t isaac_room_b15_rain_entity_mark_value(void);
uint32_t isaac_room_b15_rain_host_va_bind(void);
uint32_t isaac_room_b15_rain_host_va_position(void);
uint32_t isaac_room_b15_rain_host_va_spawn_site(void);
void isaac_room_b15_rain_loop_step(uint32_t seed_in, int32_t index, int32_t spawn_count, IsaacRoomB15RainLoopStep* out);
int32_t isaac_room_b15_rain_loop_walk(uint32_t seed0, int32_t spawn_count, IsaacRoomB15RainLoopStep* steps, uint32_t capacity);
void isaac_room_b15_rain_spawn_args(uint32_t slot_f0, uint32_t slot_f4, uint32_t slot_f8, uint32_t slot_f34, uint32_t search_result, IsaacRoomB15RainSpawnArgs* out);
/* v56 (0x007ef420 bind): pure laws. */
uint32_t isaac_room_b15_bind_va(void);
uint32_t isaac_room_b15_bind_ret_va(void);
int32_t isaac_room_b15_bind_pos_unordered(uint32_t field_bits, uint32_t vec_bits);
int32_t isaac_room_b15_bind_pos_rederive_needed(uint32_t fx, uint32_t vx, uint32_t fy, uint32_t vy);
int32_t isaac_room_b15_bind_clamp_val(int32_t v);
void isaac_room_b15_bind_scale_pair(uint32_t v_bits, uint32_t* out_x_bits, uint32_t* out_y_bits);
int32_t isaac_room_b15_bind_tail_gate(int32_t game18304, uint32_t byte269e9, int32_t field2c, int32_t field32c);
/* v57 (0x007ef5d5..0x007ef60f): sub-list array copy with 0x5c0 count cap
   (8). ptr==0 -> returns count_in untouched; else count:=0 then copies up
   to 8 dwords from sub_list_ptr into out_list[count], zero entry breaks,
   jae cap skips store but keeps iterating. Returns count_after. */
uint32_t isaac_room_b15_bind_sub_list_copy(uint32_t sub_list_ptr, uint32_t count_in, uint32_t* out_list);
/* v58 (0x007ef4a2..0x007ef5d5): type-5 bind store-pack relayout. Common
   stores (all types) + type-5 stores + gates + host call site VAs. All
   src fields are 32-bit (masked for byte legs); old_52e is the OLD byte
   [edi+0x52e] captured pre-store at 0x7ef54e (wide-masked in body). */
uint32_t isaac_room_b15_bind_store_pack_va(void);
uint32_t isaac_room_b15_bind_store_type5_head_va(void);
uint32_t isaac_room_b15_bind_store_sub_list_va(void);
void isaac_room_b15_bind_store_pack(const IsaacRoomB15BindSrc* src, uint32_t type_28, uint32_t old_52e, uint32_t field_2c, uint32_t field_30, IsaacRoomB15BindStorePack* out);
uint32_t isaac_room_b15_bind_chain_va(void);
uint32_t isaac_room_b15_bind_chain_epilogue_va(void);
void isaac_room_b15_bind_chain_step(const IsaacRoomB15BindChainSrc* src, IsaacRoomB15BindChainOut* out);
uint32_t isaac_room_b15_bind_type6_va(void);
uint32_t isaac_room_b15_bind_type6_ret_va(void);
void isaac_room_b15_bind_type6(const IsaacRoomB15BindType6Src* src, uint32_t type_28, uint32_t field_2c, IsaacRoomB15BindType6Out* out);
/* v60 (0x007ef6ca..0x007ef817): type-1000 dispatch head. */
uint32_t isaac_room_b15_bind_type1000_va(void);
uint32_t isaac_room_b15_bind_type1000_next_va(void);
uint32_t isaac_room_b15_bind_type1000_default_va(void);
void isaac_room_b15_bind_type1000(const IsaacRoomB15BindType1000Src* src, uint32_t type_28, uint32_t field_2c, IsaacRoomB15BindType1000Out* out);
void isaac_room_b15_bind_type1000_pos(const IsaacRoomB15BindType1000PosSrc* src, uint32_t genrand0, uint32_t genrand1, IsaacRoomB15BindType1000PosOut* out);
/* v61 (0x007ef817..0x007efa43): B15 bind dispatch tail. */
uint32_t isaac_room_b15_bind_tail_dispatch_va(void);
void isaac_room_b15_bind_tail_dispatch(const IsaacRoomB15BindTailSrc* src, uint32_t type_28, uint32_t this_f3c8, uint32_t game_1baa8, uint32_t game_1baac, IsaacRoomB15BindTailOut* out);
void isaac_room_b15_bind_tail_lerp(const IsaacRoomB15BindTailLerpSrc* src, uint32_t genrand, IsaacRoomB15BindTailLerpOut* out);
/* v62 (0x007efa50 Room::Update-style body): head gates + grid copy +
   entity walk step pure laws. */
uint32_t isaac_room_706c_head_va(void);
uint32_t isaac_room_706c_head_ret_va(void);
void isaac_room_706c_head_gates(const IsaacRoom706cHeadSrc* src, IsaacRoom706cHeadOut* out);
void isaac_room_706c_grid_copy(const IsaacRoom706cGridSrc* src, IsaacRoom706cGridOut* out);
void isaac_room_706c_walk_step(uint32_t count, uint32_t index, uint32_t type_28, uint32_t subtype_2c, IsaacRoom706cWalkStepOut* out);
/* v63 (0x007eff50 Room::RestoreState): counter guard + list1 walk step +
   list2 clear + gates + grid fix step + loop8 step pure laws. */
uint32_t isaac_room_restore_va(void);
uint32_t isaac_room_restore_ret_va(void);
void isaac_room_restore_counters(uint32_t counter_in, IsaacRoomRestoreCountersOut* out);
void isaac_room_restore_list1_step(const IsaacRoomRestoreList1Src* src, IsaacRoomRestoreList1Out* out);
void isaac_room_restore_list2_clear(uint32_t begin_ptr, uint32_t end_ptr, IsaacRoomRestoreList2ClearOut* out);
void isaac_room_restore_gates(int32_t f4_f0, int32_t game_f0, uint32_t f4_44_byte, IsaacRoomRestoreGatesOut* out);
void isaac_room_restore_grid_step(const IsaacRoomRestoreGridSrc* src, IsaacRoomRestoreGridOut* out);
void isaac_room_restore_loop8_step(uint32_t k, IsaacRoomRestoreLoop8Out* out);
/* v64 (0x007f01c0 ambient body): pure islands. */
uint32_t isaac_room_ambient_7f01c0_va(void);
uint32_t isaac_room_ambient_7f01c0_ret_va(void);
float isaac_room_ambient_7f01c0_lane_off_quot(uint32_t lane);
float isaac_room_ambient_7f01c0_lane_off_rem(uint32_t lane);
void isaac_room_ambient_7f01c0_pos_step(const IsaacRoomAmbientPos7f01c0Src* src, IsaacRoomAmbientPos7f01c0Out* out);
void isaac_room_ambient_7f01c0_dist(const IsaacRoomAmbientDist7f01c0Src* src, IsaacRoomAmbientDist7f01c0Out* out);
void isaac_room_ambient_7f01c0_special_step(const IsaacRoomAmbientSpecial7f01c0Src* src, IsaacRoomAmbientSpecial7f01c0Out* out);
void isaac_room_ambient_7f01c0_adj_dist(const IsaacRoomAmbientAdjDist7f01c0Src* src, IsaacRoomAmbientAdjDist7f01c0Out* out);
void isaac_room_ambient_7f01c0_tail_decision(const IsaacRoomAmbientTail7f01c0Src* src, IsaacRoomAmbientTail7f01c0Out* out);
void isaac_room_ambient_7f01c0_bounds(const IsaacRoomAmbientBounds7f01c0Src* src, IsaacRoomAmbientBounds7f01c0Out* out);
/* v25r (0x007f01c0 ambient body): OUTER-LOOP count/continue law (PE
   0x7f022f..0x7f0245 player count; 0x7f051b..0x7f053f continue).
   count = (s32)((s32)([Game+0x1baac]-[Game+0x1baa8]) >> 2) SAR; entry
   gate = ZERO-ONLY test (negative counts ENTER); the tail RE-READS
   [Game+0x1baac]/[Game+0x1baa8] EVERY iteration (0x7f0528/0x7f052e)
   before cmp/jb UNSIGNED (u32)idx_next < (u32)count_fresh. Game::
   GetPlayer 0x417870 stays HOST; the player gate observes
   [player+0x2c] post-call. ABI UNCHANGED (still 64). */
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_OUTER_COUNT_END_OFF = 0x1baacu;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_OUTER_COUNT_START_OFF = 0x1baa8u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_GETPLAYER_VA = 0x00417870u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_LOOP_HEAD_VA = 0x007f0250u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_PLAYER_2C_OFF = 0x2cu;
#pragma pack(push, 1)
typedef struct IsaacRoomAmbientOuterCount7f01c0Src { /* 8 bytes */
  uint32_t g1baac; /* [Game+0x1baac] player list end (0x7f022f) */
  uint32_t g1baa8; /* [Game+0x1baa8] player list start (0x7f0237) */
} IsaacRoomAmbientOuterCount7f01c0Src;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomAmbientOuterCount7f01c0Src) == 8,
              "IsaacRoomAmbientOuterCount7f01c0Src size");
#pragma pack(push, 1)
typedef struct IsaacRoomAmbientOuterCount7f01c0Out { /* 12 bytes */
  int32_t count_s32;  /* sar result (sign kept; negative possible) */
  uint32_t count_u32; /* count bit pattern (u32 loop bound) */
  uint32_t entry;     /* count != 0 (ZERO-ONLY test/jz 0x7f0245) */
} IsaacRoomAmbientOuterCount7f01c0Out;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomAmbientOuterCount7f01c0Out) == 12,
              "IsaacRoomAmbientOuterCount7f01c0Out size");
#pragma pack(push, 1)
typedef struct IsaacRoomAmbientOuterCont7f01c0Src { /* 12 bytes */
  uint32_t idx;    /* stored [ebp-0x54]: current iteration idx (GetPlayer arg) */
  uint32_t g1baac; /* FRESH [Game+0x1baac] re-read at 0x7f0528 */
  uint32_t g1baa8; /* FRESH [Game+0x1baa8] re-read at 0x7f052e */
} IsaacRoomAmbientOuterCont7f01c0Src;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomAmbientOuterCont7f01c0Src) == 12,
              "IsaacRoomAmbientOuterCont7f01c0Src size");
#pragma pack(push, 1)
typedef struct IsaacRoomAmbientOuterCont7f01c0Out { /* 16 bytes */
  int32_t count_fresh_s32;  /* re-derived count (SAR) per iteration */
  uint32_t count_fresh_u32; /* count bit pattern */
  uint32_t idx_next;        /* idx + 1 (u32 wrap; inc edx 0x7f0524) */
  uint32_t continue_loop;   /* (u32)idx_next < (u32)count_fresh (jb) */
} IsaacRoomAmbientOuterCont7f01c0Out;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomAmbientOuterCont7f01c0Out) == 16,
              "IsaacRoomAmbientOuterCont7f01c0Out size");
#pragma pack(push, 1)
typedef struct IsaacRoomAmbientOuterGate7f01c0Src { /* 4 bytes */
  int32_t player_f2c; /* [player+0x2c] observed post-GetPlayer (host) */
} IsaacRoomAmbientOuterGate7f01c0Src;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomAmbientOuterGate7f01c0Src) == 4,
              "IsaacRoomAmbientOuterGate7f01c0Src size");
#pragma pack(push, 1)
typedef struct IsaacRoomAmbientOuterGate7f01c0Out { /* 4 bytes */
  uint32_t skip_inner; /* player_f2c != 0 -> outer continue (no inner) */
} IsaacRoomAmbientOuterGate7f01c0Out;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomAmbientOuterGate7f01c0Out) == 4,
              "IsaacRoomAmbientOuterGate7f01c0Out size");
void isaac_room_ambient_7f01c0_outer_count(const IsaacRoomAmbientOuterCount7f01c0Src* src, IsaacRoomAmbientOuterCount7f01c0Out* out);
void isaac_room_ambient_7f01c0_outer_continue(const IsaacRoomAmbientOuterCont7f01c0Src* src, IsaacRoomAmbientOuterCont7f01c0Out* out);
void isaac_room_ambient_7f01c0_outer_player_gate(const IsaacRoomAmbientOuterGate7f01c0Src* src, IsaacRoomAmbientOuterGate7f01c0Out* out);
/* v25s (0x007f01c0 ambient body): PAYLOAD-SHAPE TAIL arg-prep laws
   (0x7f0673..0x7f072e; peer v25q owns the f394 pair at 0x7f0662).
   The four bounds-dest shapes 0x7f0678/0x7f0692/0x7f06ac/0x7f06f4
   assemble the exact 5-arg stdcall frame for host 0x6fd7c0 (ret 0x14,
   thiscall ecx=Game) at call site 0x7f070c. dest = the v64 bounds law
   enum (0 none, 1=6f4, 2=6ac, 3=692, 4=678). edx_in is the host's live
   edx at the dest (inner-loop leftover; player on the bind path) —
   echoed verbatim as arg4. dest-2 (0x7f06ac) selects tail arg1 by
   [this.f4] tag == -0xe (full dword) else bit2 of [[f4+0x10]+0x38]
   (shr 2; test al,1 = low-byte test of the shifted dword): -0xf/-6/-2.
   [Game+0x18318] dword stores: dest4 -> 3, dest3 -> 0, dest2 -> 2,
   dest1 -> NONE. ABI UNCHANGED (still 64). */
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_PAYLOAD_CALL_VA = 0x007f070cu;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_PAYLOAD_HOST_VA = 0x006fd7c0u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_PAYLOAD_HOST_RET = 0x14u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_GAME_18318_OFF = 0x18318u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_GAME_1831C_OFF = 0x1831cu;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_GAME_18328_OFF = 0x18328u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_F4_10_OFF = 0x10u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_F4_38_OFF = 0x38u;
static constexpr int32_t ISAAC_ROOM_AMBIENT_7F01C0_F4_F0_NEG14 = -14;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_PAYLOAD_678_STORE = 3u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_PAYLOAD_692_STORE = 0u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_PAYLOAD_6AC_STORE = 2u;
static constexpr int32_t ISAAC_ROOM_AMBIENT_7F01C0_PAYLOAD_678_ARG1 = -2;
static constexpr int32_t ISAAC_ROOM_AMBIENT_7F01C0_PAYLOAD_692_ARG1 = -2;
static constexpr int32_t ISAAC_ROOM_AMBIENT_7F01C0_PAYLOAD_6AC_ARG1_EQ = -0xf;
static constexpr int32_t ISAAC_ROOM_AMBIENT_7F01C0_PAYLOAD_6AC_ARG1_BIT = -6;
static constexpr int32_t ISAAC_ROOM_AMBIENT_7F01C0_PAYLOAD_6AC_ARG1_NOBIT = -2;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_PAYLOAD_6AC_ARG2 = 2u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_PAYLOAD_6F4_ARG3 = 2u;
static constexpr int32_t ISAAC_ROOM_AMBIENT_7F01C0_PAYLOAD_ARG5 = -1;
#pragma pack(push, 1)
typedef struct IsaacRoomAmbientPayload7f0673Src { /* 24 bytes */
  uint32_t dest;      /* v64 bounds dest enum: 0 none, 1=6f4, 2=6ac,
                         3=692, 4=678 */
  uint32_t edx_in;    /* host live edx at the dest (echoed as arg4) */
  uint32_t game_1831c;/* [Game+0x1831c] (dest 1 only) */
  uint32_t game_18328;/* [Game+0x18328] (dest 1 only) */
  int32_t f4_f0;      /* [this.f4] dword (-0xe tag gate, dest 2 only) */
  uint32_t f4_10_38;  /* [[this.f4+0x10]+0x38] dword (dest 2; bit2) */
} IsaacRoomAmbientPayload7f0673Src;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomAmbientPayload7f0673Src) == 24,
              "IsaacRoomAmbientPayload7f0673Src size");
#pragma pack(push, 1)
typedef struct IsaacRoomAmbientPayload7f0673Out { /* 56 bytes */
  uint32_t fired;      /* dest != 0 -> host 0x6fd7c0 payload call */
  uint32_t shape;      /* 1=6f4, 2=6ac, 3=692, 4=678 (dest echo) */
  uint32_t arg1;       /* [esp] at call (LAST push) */
  uint32_t arg2;
  uint32_t arg3;
  uint32_t arg4;       /* edx_in (2nd push) */
  uint32_t arg5;       /* FIRST push (deepest stack slot; -1) */
  uint32_t store_val;  /* [Game+0x18318] dword written by this shape */
  uint32_t store_off;  /* 0x18318; 0 when no store (dest 1) */
  uint32_t call_va;    /* 0x7f070c */
  uint32_t host_va;    /* 0x6fd7c0 */
  uint32_t cont_va;    /* 0x7f051b (dest 0: outer-loop continue) */
  uint32_t epilogue_va;/* 0x7f0711 (SEH teardown) */
  uint32_t ret_va;     /* 0x7f072e */
} IsaacRoomAmbientPayload7f0673Out;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomAmbientPayload7f0673Out) == 56,
              "IsaacRoomAmbientPayload7f0673Out size");
static_assert(offsetof(IsaacRoomAmbientPayload7f0673Out, arg1) == 8,
              "IsaacRoomAmbientPayload7f0673Out arg1 offset");
void isaac_room_ambient_7f01c0_payload_bounds(const IsaacRoomAmbientPayload7f0673Src* src, IsaacRoomAmbientPayload7f0673Out* out);
int32_t isaac_game_challenge_bitset_test_low(uint64_t word0, int32_t challenge_id);
int32_t isaac_level_has_abandoned_mineshaft_pure(int32_t difficulty_269c8, int32_t stage_0, int32_t stage_type_4, uint32_t flags_2654c);
uint32_t isaac_room_pure_helpers_abi_version(void);

/* ---- v65r: Game::GetPlayer 0x00417870 BODY (thiscall, index stack arg,
   ret 4; 40 insns, 1 E8 -> HOST fatal 0xa112c0, 0 stores) ----
   PE 0x417870: count = SAR((u32)([Game+0x1baac]-[Game+0x1baa8]),2);
   empty (count==0) -> HOST fatal 0xa112c0 (push 0xb7e6bc; push 0x10)
   then RE-READ begin/end (defect-class-1: NEVER fold the pre-call read
   into the post-fatal path); count2 re-derived from the recaptured pair;
   (u32)index < (u32)count2 ? [begin_used + index*4] : [begin_used]
   (0x4178b4 jae UNSIGNED). ret 0x4178bd (in-bounds) / 0x4178c6 (clamp).
   Same Game list offsets as the B15 bind tail chain_count law. */
static constexpr uint32_t ISAAC_ROOM_GET_PLAYER_417870_VA = 0x00417870u;
static constexpr uint32_t ISAAC_ROOM_GET_PLAYER_417870_RET_VA = 0x004178bdu;
static constexpr uint32_t ISAAC_ROOM_GET_PLAYER_417870_CLAMP_RET_VA = 0x004178c6u;
static constexpr uint32_t ISAAC_ROOM_GET_PLAYER_417870_GAME_BEGIN_OFF = 0x1baa8u;
static constexpr uint32_t ISAAC_ROOM_GET_PLAYER_417870_GAME_END_OFF = 0x1baacu;
static constexpr uint32_t ISAAC_ROOM_GET_PLAYER_417870_FATAL_VA = 0x00a112c0u;
static constexpr uint32_t ISAAC_ROOM_GET_PLAYER_417870_FATAL_ARG0 = 0x10u;
static constexpr uint32_t ISAAC_ROOM_GET_PLAYER_417870_FATAL_ARG1_VA = 0x00b7e6bcu;

/* v65r structs — GetPlayer body pure laws. */
#pragma pack(push, 1)
typedef struct IsaacRoomGetPlayer417870Out { /* 56 bytes */
  int32_t count_pre;     /* SAR((u32)(end-begin),2) PRE-call (0x417888) */
  uint32_t empty;        /* count_pre == 0 (0x41788b test/jne) */
  uint32_t host_fatal;   /* empty -> HOST 0xa112c0 (0x417896) */
  uint32_t begin_used;   /* empty ? re_read_begin : begin (recapture) */
  uint32_t end_used;     /* empty ? re_read_end : end */
  int32_t count_used;    /* SAR((u32)(end_used-begin_used),2) (0x4178ad/af) */
  uint32_t in_bounds;    /* (u32)index < (u32)count_used (0x4178b4 jae) */
  uint32_t slot_addr;    /* in_bounds ? begin_used+index*4 : begin_used */
  uint32_t result;       /* in_bounds ? slot_idx_sample : slot0_sample */
  uint32_t result_known; /* 1: both paths read memory, samples supplied */
  uint32_t ret_va;       /* in_bounds ? 0x4178bd : 0x4178c6 */
  uint32_t head_va;      /* 0x417870 */
  uint32_t clamp_ret_va; /* 0x4178c6 */
  uint32_t fatal_va;     /* 0xa112c0 */
} IsaacRoomGetPlayer417870Out;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomGetPlayer417870Out) == 56,
              "IsaacRoomGetPlayer417870Out size");
static_assert(offsetof(IsaacRoomGetPlayer417870Out, count_pre) == 0,
              "IsaacRoomGetPlayer417870Out count_pre offset");

uint32_t isaac_room_get_player_417870_va(void);
uint32_t isaac_room_get_player_417870_ret_va(void);
uint32_t isaac_room_get_player_417870_clamp_ret_va(void);
uint32_t isaac_room_get_player_417870_game_begin_off(void);
uint32_t isaac_room_get_player_417870_game_end_off(void);
uint32_t isaac_room_get_player_417870_fatal_va(void);
uint32_t isaac_room_get_player_417870_fatal_arg0(void);
uint32_t isaac_room_get_player_417870_fatal_arg1_va(void);
int32_t isaac_room_get_player_417870_count(uint32_t begin, uint32_t end);
int32_t isaac_room_get_player_417870_empty(int32_t count);
int32_t isaac_room_get_player_417870_in_bounds(uint32_t index, int32_t count);
uint32_t isaac_room_get_player_417870_slot_addr(uint32_t begin, uint32_t index, int32_t count);
void isaac_room_get_player_417870_plan(uint32_t begin, uint32_t end, uint32_t index, uint32_t re_read_begin, uint32_t re_read_end, uint32_t slot0_sample, uint32_t slot_idx_sample, IsaacRoomGetPlayer417870Out* out);
uint32_t isaac_room_pure_helpers_abi_version(void);

/* ---- v25q: 0x7f0544 range-hit tail (PE 0x7f0544..0x7f0673, INSIDE
   FUN_007f01c0; reached from the v64 tail-decision `ja 0x7f0544` when
   25.0f > dist — peer v25s owns 0x7f0673..0x7f072e) ----
   Head host 0x705ee0(lane) ret 4 (result discarded, edi preserved);
   clamp(edi,-1,7) SIGNED (cmp edi,-1 jle / cmp edi,7 jl) ->
   [Game+0x18318] dword store (ALWAYS); slot.f394 == -1 FULL-dword gate
   (jne 0x7f060e skips the devil/angel block); fs:[0x2c] TLS check:
   (s32)[0xc8108c] > (s32)[[fs:0x2c]+0xc] (jg SIGNED) -> host fail
   0x7f072f (0xaef29d); sel gate: (u32)[Game+0x1830c] >= 3 (jae
   UNSIGNED) ? 0xc810a0 : Game+0x16c8c, *sel == 0 (FULL dword) ->
   enter devil block; devil/angel: sete/setne FULL dword
   [slot+0x160]==0xf -> host Level::InitializeDevilAngelRoom(ecx=Game,
   ForceAngel=(f160==0xf), ForceDevil=(f160!=0xf)) 0x7499a0; then
   [Game+0x2654c] SELF-store (devil block only) + cmp esi,0xf jne ->
   [Game+0x26548] |= 1 : |= 0x20 (esi=f160 preserved across call).
   JOIN 0x7f060e (all non-fail paths): ecx=edx=Game; push -1 (hoisted);
   slot RE-READ; f394_split = [slot+0x394]; cmp -0x64; jg 0x7f0659
   SIGNED: f394_split > -100 -> SHAPE B 0x6fd7c0(ecx=Game; a1=f394_split
   a2=lane&3 a3=0 a4=player a5=-1(dangling hoisted push)) ; else SHAPE A:
   push f394_split; call Game::GetRoomByIdx(f394_split, -1) 0x740bc0 ret
   8 (consumes hoisted -1 + f394; shape-A stack balanced, NO caller add
   esp) -> room; slot RE-READ AGAIN (defect-class-1!); cmov edx =
   (POST-CALL [slot+0x394] == -100) ? 0x12 : 0 (0x7f063e cmp + cmovne);
   0x6fd7c0(ecx=Game; a1=[room+0] a2=lane&3 a3=cmov a4=player a5=
   [room+0xc]). Tail byte store [Game+0x68d70] = 0 on BOTH shapes
   (0x7f066c) then jmp 0x7f0711 shared epilogue. ABI UNCHANGED (64). */
static constexpr uint32_t ISAAC_ROOM_RANGE_HIT_7F0544_VA = 0x007f0544u;
static constexpr uint32_t ISAAC_ROOM_RANGE_HIT_7F0544_END_VA = 0x007f0673u;
static constexpr uint32_t ISAAC_ROOM_RANGE_HIT_7F0544_EPILOGUE_VA = 0x007f0711u;
static constexpr uint32_t ISAAC_ROOM_RANGE_HIT_7F0544_FAIL_VA = 0x007f072fu;
static constexpr uint32_t ISAAC_ROOM_RANGE_HIT_7F0544_GAME_GLOBAL = 0x00c71678u;
static constexpr uint32_t ISAAC_ROOM_RANGE_HIT_7F0544_TLS_GLOBAL_VA = 0x00c8108cu;
static constexpr uint32_t ISAAC_ROOM_RANGE_HIT_7F0544_SEL_A_VA = 0x00c810a0u;
static constexpr int32_t ISAAC_ROOM_RANGE_HIT_7F0544_CLAMP_MIN = -1;
static constexpr int32_t ISAAC_ROOM_RANGE_HIT_7F0544_CLAMP_MAX = 7;
static constexpr int32_t ISAAC_ROOM_RANGE_HIT_7F0544_SPLIT = -100;
static constexpr int32_t ISAAC_ROOM_RANGE_HIT_7F0544_CMOV_TRUE = 0x12;
static constexpr int32_t ISAAC_ROOM_RANGE_HIT_7F0544_F160_GATE = 0xf;
static constexpr uint32_t ISAAC_ROOM_RANGE_HIT_7F0544_SEL_GE = 3u;
static constexpr uint32_t ISAAC_ROOM_RANGE_HIT_7F0544_GAME_1830C_OFF = 0x1830cu;
static constexpr uint32_t ISAAC_ROOM_RANGE_HIT_7F0544_GAME_16C8C_OFF = 0x16c8cu;
static constexpr uint32_t ISAAC_ROOM_RANGE_HIT_7F0544_GAME_18318_OFF = 0x18318u;
static constexpr uint32_t ISAAC_ROOM_RANGE_HIT_7F0544_GAME_26548_OFF = 0x26548u;
static constexpr uint32_t ISAAC_ROOM_RANGE_HIT_7F0544_GAME_2654C_OFF = 0x2654cu;
static constexpr uint32_t ISAAC_ROOM_RANGE_HIT_7F0544_GAME_68D70_OFF = 0x68d70u;
static constexpr uint32_t ISAAC_ROOM_RANGE_HIT_7F0544_SLOT_ARR_OFF = 0x724u;
static constexpr uint32_t ISAAC_ROOM_RANGE_HIT_7F0544_SLOT_F394_OFF = 0x394u;
static constexpr uint32_t ISAAC_ROOM_RANGE_HIT_7F0544_SLOT_F160_OFF = 0x160u;
static constexpr uint32_t ISAAC_ROOM_RANGE_HIT_7F0544_OR_MASK_1 = 0x00000001u;
static constexpr uint32_t ISAAC_ROOM_RANGE_HIT_7F0544_OR_MASK_20 = 0x00000020u;
static constexpr uint32_t ISAAC_ROOM_RANGE_HIT_7F0544_HOST_705EE0_VA = 0x00705ee0u;
static constexpr uint32_t ISAAC_ROOM_RANGE_HIT_7F0544_HOST_7499A0_VA = 0x007499a0u;
static constexpr uint32_t ISAAC_ROOM_RANGE_HIT_7F0544_HOST_740BC0_VA = 0x00740bc0u;
static constexpr uint32_t ISAAC_ROOM_RANGE_HIT_7F0544_HOST_6FD7C0_VA = 0x006fd7c0u;
static constexpr uint32_t ISAAC_ROOM_RANGE_HIT_7F0544_HOST_AEF29D_VA = 0x00aef29du;
static constexpr int32_t ISAAC_ROOM_RANGE_HIT_7F0544_PAYLOAD_ARITY = 5;
static constexpr uint32_t ISAAC_ROOM_RANGE_HIT_7F0544_GETROOM_RET = 8u;
#pragma pack(push, 1)
typedef struct IsaacRoomRangeHit7f0544Src { /* 56 bytes */
  uint32_t lane;        /* edi: clamp input + slot index + lane&3 */
  int32_t f394_gate;    /* [slot+0x394] FIRST read (== -1 gate) */
  int32_t f394_split;   /* [slot+0x394] SECOND read (pre-GetRoom) */
  int32_t f394_post;    /* [slot+0x394] THIRD read (POST-GetRoom) */
  uint32_t slot_f160;   /* [slot+0x160] (sete/setne 0xf) */
  uint32_t player;      /* [ebp-0x44] (passthrough arg4) */
  uint32_t game_1830c;  /* [Game+0x1830c] (sel gate, jae UNSIGNED) */
  uint32_t sel_a;       /* [0xc810a0] (chosen when >= 3) */
  uint32_t sel_b;       /* [Game+0x16c8c] (chosen when < 3) */
  int32_t tls_global;   /* [0xc8108c] (TLS check) */
  int32_t tls_peb;      /* [[fs:0x2c]+0xc] (TLS check) */
  uint32_t room_f00;    /* GetRoomByIdx result [room+0] (shape A a1) */
  uint32_t room_f0c;    /* GetRoomByIdx result [room+0xc] (shape A a5) */
  uint32_t pad;         /* alignment */
} IsaacRoomRangeHit7f0544Src;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomRangeHit7f0544Src) == 56,
              "IsaacRoomRangeHit7f0544Src size");

#pragma pack(push, 1)
typedef struct IsaacRoomRangeHit7f0544Out { /* 120 bytes */
  int32_t  clamp_value;   /* clamp_s32(lane, -1, 7) -> [Game+0x18318] */
  uint32_t gate_minus1;   /* f394_gate == -1 (FULL dword) */
  uint32_t tls_fail;      /* (s32)tls_global > (s32)tls_peb (jg) */
  uint32_t fail_va;       /* 0x7f072f (host 0xaef29d) */
  uint32_t sel_low;       /* (u32)game_1830c >= 3 (jae UNSIGNED) */
  uint32_t sel_zero;      /* *sel_ptr == 0 (FULL dword) */
  uint32_t devil_fire;    /* gate && !tls_fail && sel_zero */
  uint32_t force_angel;   /* (f160 == 0xf) ? 1 : 0 (sete) */
  uint32_t force_devil;   /* (f160 != 0xf) ? 1 : 0 (setne) */
  uint32_t devil_va;      /* 0x7499a0 */
  uint32_t st2654c_flag;  /* devil_fire: [Game+0x2654c] self-store */
  uint32_t st26548_mask;  /* devil_fire ? (angel?1:0x20) : 0 */
  uint32_t split_direct;  /* (s32)f394_split > -100 (jg) */
  uint32_t shape_a;       /* f394_split <= -100 (GetRoomByIdx path) */
  uint32_t getroom_va;    /* 0x740bc0 */
  uint32_t getroom_arg1;  /* f394_split bits (u32 view) */
  uint32_t getroom_arg2;  /* 0xffffffff (hoisted -1) */
  uint32_t cmov_arg3;     /* (f394_post == -100) ? 0x12 : 0 */
  uint32_t payload_va;    /* 0x6fd7c0 */
  uint32_t payload_a1;    /* shape A: room_f00 ; shape B: f394_split bits */
  uint32_t payload_a2;    /* lane & 3 */
  uint32_t payload_a3;    /* shape A: cmov ; shape B: 0 */
  uint32_t payload_a4;    /* player */
  uint32_t payload_a5;    /* shape A: room_f0c ; shape B: 0xffffffff */
  uint32_t payload_count; /* 5 */
  uint32_t st68d70_flag;  /* [Game+0x68d70] = 0 byte store (post call) */
  uint32_t head_va;       /* 0x705ee0 (ret 4) */
  uint32_t head_arg;      /* lane (edi, FULL) */
  uint32_t end_va;        /* 0x7f0673 (jmp epilogue) */
  uint32_t epilogue_va;   /* 0x7f0711 */
} IsaacRoomRangeHit7f0544Out;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomRangeHit7f0544Out) == 120,
              "IsaacRoomRangeHit7f0544Out size");
static_assert(offsetof(IsaacRoomRangeHit7f0544Out, payload_a1) == 76,
              "IsaacRoomRangeHit7f0544Out payload_a1 offset");
uint32_t isaac_room_range_hit_7f0544_va(void);
void isaac_room_range_hit_7f0544_eval(const IsaacRoomRangeHit7f0544Src* src, IsaacRoomRangeHit7f0544Out* out);

/* ---- v25t: FUN_007f01c0 TLS-fail RE-ENTRY (PE 0x7f072f..0x7f077b;
   entered from the v25q TLS check `jg 0x7f072f` @0x7f0598) ----
   push &[0xc8108c]; call HOST 0xaef29d (TLS claim/sync thunk, cdecl
   ret 4; *arg==0 -> set -1 claim; *arg==-1 -> spin; else sync
   [TLS+0xc]=[0xbf9380]); RE-CHECK 0x7f073c: cmp [0xc8108c],-1 ;
   jne 0x7f05a0 (FULL dword, POST-call snapshot — never the pre-call
   value). == -1 -> fail tail: SEH funclet state [ebp-4] = 0 (ENTER);
   ecx=0xc81090; call HOST 0x6ef590 RoomDescriptor::constructor
   (thiscall, no stack args); push 0xb15b30 (.rdata shim addr); call
   HOST 0xaef5af (validate helper, cdecl); add esp 4; [ebp-4] =
   0xffffffff (LEAVE); push &[0xc8108c]; call HOST 0xaef253 (release/
   advance: [0xc8108c] = ++[0xbf9380], [TLS+0xc] = [0xbf9380], cdecl);
   add esp 4; jmp 0x7f05a0 (rejoin: edx = [0xc71678] = Game reload,
   then sel gate). The SEH funclet TRANSPORT (prologue chain +
   epilogue 0x7f0711..0x7f072e) stays typed-host; the state stores are
   REPORTED as outputs for the host to apply. ABI 66. */
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_FAIL_REENTRY_VA = 0x007f072fu;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_FAIL_RECHECK_VA = 0x007f073cu;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_FAIL_END_VA = 0x007f077bu;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_FAIL_TLS_GLOBAL_VA = 0x00c8108cu;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_FAIL_CLAIM_VA = 0x00aef29du;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_FAIL_CTOR_VA = 0x006ef590u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_FAIL_CTOR_ECX = 0x00c81090u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_FAIL_VALIDATE_VA = 0x00aef5afu;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_FAIL_VALIDATE_ARG_VA = 0x00b15b30u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_FAIL_RELEASE_VA = 0x00aef253u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_FAIL_CONT_VA = 0x007f05a0u;
static constexpr uint32_t ISAAC_ROOM_AMBIENT_7F01C0_FAIL_REJOIN_GAME_VA = 0x00c71678u;

#pragma pack(push, 1)
typedef struct IsaacRoomAmbientFailReentry7f072fSrc { /* 8 bytes */
  int32_t tls_pre;  /* [0xc8108c] BEFORE the 0xaef29d claim call */
  int32_t tls_post; /* [0xc8108c] AFTER 0xaef29d (0x7f073c snapshot) */
} IsaacRoomAmbientFailReentry7f072fSrc;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomAmbientFailReentry7f072fSrc) == 8,
              "IsaacRoomAmbientFailReentry7f072fSrc size");

#pragma pack(push, 1)
typedef struct IsaacRoomAmbientFailReentry7f072fOut { /* 64 bytes */
  uint32_t claim;             /* tls_pre == 0 (FULL dword; the 0xaef29d
                                 -1-claim precondition) */
  uint32_t fail_tail;         /* tls_post == -1 (cmp 0x7f073c FULL dword;
                                 jne skips the tail) */
  uint32_t state_enter;       /* [ebp-4] = 0 (funclet ENTER store @0x7f074e) */
  uint32_t state_exit;        /* [ebp-4] = 0xffffffff (LEAVE store @0x7f0767) */
  uint32_t fail_va;           /* 0x7f072f */
  uint32_t recheck_va;        /* 0x7f073c */
  uint32_t claim_va;          /* 0xaef29d (host TLS claim/sync) */
  uint32_t claim_arg;         /* 0xc8108c (push @0x7f072f / @0x7f076e) */
  uint32_t ctor_va;           /* 0x6ef590 (RoomDescriptor::constructor) */
  uint32_t ctor_ecx;          /* 0xc81090 (thiscall this @0x7f0749) */
  uint32_t validate_va;       /* 0xaef5af (host validate helper) */
  uint32_t validate_arg;      /* 0xb15b30 (.rdata shim addr, push @0x7f075a) */
  uint32_t release_va;        /* 0xaef253 (host TLS release/advance) */
  uint32_t cont_va;           /* 0x7f05a0 (rejoin, both paths) */
  uint32_t rejoin_edx_game_va;/* 0xc71678 (edx = Game reload @0x7f05a0) */
  uint32_t end_va;            /* 0x7f077b (jmp rejoin) */
} IsaacRoomAmbientFailReentry7f072fOut;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomAmbientFailReentry7f072fOut) == 64,
              "IsaacRoomAmbientFailReentry7f072fOut size");
static_assert(offsetof(IsaacRoomAmbientFailReentry7f072fOut, fail_tail) == 4,
              "IsaacRoomAmbientFailReentry7f072fOut fail_tail offset");
uint32_t isaac_room_ambient_7f01c0_fail_reentry_va(void);
void isaac_room_ambient_7f01c0_fail_reentry(
    const IsaacRoomAmbientFailReentry7f072fSrc* src,
    IsaacRoomAmbientFailReentry7f072fOut* out);

/* ---- v67a: FUN_007f7a40 (record 26 roomTriggerClearAudioNonGreed;
   PE 0x7f7a40..0x7f8189, ret 8, thiscall, 2 stack args a1=[ebx+8]
   a2=[ebx+0xc], BOTH byte-tested). Callers: TriggerClear non-greed
   0x8069cf (1,0) + 0x73ed37 (0,0). Pure decision surface: a2 byte
   gate -> early aborts (Game[0x26584]==0x2c, type-5+subtype-0x59 ->
   host 0x74ea50, stage 1..6 + bit-0x10000), play flag (host
   0x706940[0x80]==3 || obj chain with UNSIGNED 0x26630 / byte
   0x2c7/0x26589 / FULL 0x26584), stage-5/6 al law (bit-2 of
   ~0x6f95a0 & (0x6f9400|Game[0x26550]|Game[0xc])), success gate
   (play && al && Game[0x18304]==Game[0x182d0] && Game[4] not 4/5
   && room[0x728]==0) -> PLAY (3 sound calls + [slot+0x394]=-10);
   fail path: 0x740bc0 POST-call snapshot vs Game[0x18314],
   0x706940b[0x80]==2, obj chain, 0x74bae0/0x74e9b0 gates, PURE
   slot-hash search (xorshift 2/9/15 over desc[0x5c], dual bitmap +
   room[0x724+slot*4] occupancy, signed mod-8 scan, 8 max), PLAY2
   (0x74bba0/0x7eea90/0x710fa0 + [slot+0x394]=-10), door branch
   (slot8 != 8 -> 0x70d360 != 4 -> path A/B: 0x417870 GetPlayer(0)
   + 0x710480 [+ 0x710dd0 + 0x70fb60]), a1 gate -> return 1 skip
   tail, else music tail typed-host (genrand/cos/sin/0x428b20/
   vtable; loop count (genrand&3)+5). All sound calls stay HOST
   with typed arg records. ABI 67. */
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_VA = 0x007f7a40u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_RET_VA = 0x007f7bd5u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_FAIL_VA = 0x007f7bd8u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_END_VA = 0x007f8189u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_TAIL_VA = 0x007f7e3eu;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_GAME_GLOBAL = 0x00c71678u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_OBJ_GLOBAL = 0x00c7169cu;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HASH_QWORD_VA = 0x00b1f570u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HASH_DWORD_VA = 0x00b1f578u;
static constexpr int32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HASH_SHIFT_LO = 2;
static constexpr int32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HASH_SHIFT_MID = 9;
static constexpr int32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HASH_SHIFT_HI = 15;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HASH_MASK = 7u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_SLOT_ARR_OFF = 0x724u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_SLOT_F394_OFF = 0x394u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_SLOT_F10_OFF = 0x10u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_SLOT_SEED_OFF = 0x5cu;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_SLOT_BM2_OFF = 0x18u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_SLOT_BM1_OFF = 0x38u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_GAME_18304_OFF = 0x18304u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_GAME_182D0_OFF = 0x182d0u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_GAME_18314_OFF = 0x18314u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_GAME_26584_OFF = 0x26584u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_GAME_2654C_OFF = 0x2654cu;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_GAME_26550_OFF = 0x26550u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_GAME_26589_OFF = 0x26589u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_GAME_26630_OFF = 0x26630u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_OBJ_2C7_OFF = 0x2c7u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_OBJ_1E3_OFF = 0x1e3u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_TYPE5_GATE = 5u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_SUBTYPE59_GATE = 0x59u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_STAGE_BIT_MASK = 0x10000u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_SLOT_394_VALUE = 0xfffffff6u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_74EA50_VA = 0x0074ea50u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_706940_VA = 0x00706940u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_6F9400_VA = 0x006f9400u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_6F95A0_VA = 0x006f95a0u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_7EEA90_VA = 0x007eea90u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_74BBA0_VA = 0x0074bba0u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_710FA0_VA = 0x00710fa0u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_740BC0_VA = 0x00740bc0u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_74BAE0_VA = 0x0074bae0u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_74E9B0_VA = 0x0074e9b0u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_70D360_VA = 0x0070d360u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_417870_VA = 0x00417870u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_710480_VA = 0x00710480u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_710DD0_VA = 0x00710dd0u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_70FB60_VA = 0x0070fb60u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_67F1D0_VA = 0x0067f1d0u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_COS_VA = 0x0041d540u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_SIN_VA = 0x0041d520u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_GENRAND_VA = 0x006eef60u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_SPAWN_428B20_VA = 0x00428b20u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_HOST_FATAL_VA = 0x00a112c0u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_FATAL_ARG0 = 0x00b6bf54u;
static constexpr int32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_PLAY_7EEA90_ARG = 1;
static constexpr int32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_PLAY_74BBA0_ARG = 3;
static constexpr int32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_PLAY2_ARG1 = 1;
static constexpr int32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_7F7A40_GETPLAYER_ARG = 0;

#pragma pack(push, 1)
typedef struct IsaacRoomTriggerClearAudio7f7a40GatesSrc { /* 96 bytes */
  uint32_t a1;            /* [ebx+8] byte arg (0x7f7e34 gate: 0 -> ret 1) */
  uint32_t a2;            /* [ebx+0xc] byte arg (0x7f7a59/7f7bd8/7f7c09/7f7c71) */
  uint32_t game_26584;    /* [Game+0x26584] (==0x2c abort; ==0 play gate) */
  uint32_t room_type_8;   /* [this+8] */
  uint32_t desc_f10_f10;  /* [[this+4]+0x10]+0x10 (0x59 gate value) */
  uint32_t h_74ea50;      /* 0x74ea50(Game) result (al) */
  uint32_t game_stage_0;  /* [Game+0] (stage 1..6 gate / stage-5 al) */
  uint32_t game_2654c;    /* [Game+0x2654c] (bit-0x10000 abort) */
  uint32_t h_706940_80;   /* [0x706940(Game) result + 0x80] (==3) */
  uint32_t obj_2c7;       /* byte [0xc7169c + 0x2c7] */
  uint32_t obj_8;         /* [0xc7169c + 8] */
  uint32_t game_26630;    /* [Game+0x26630] (UNSIGNED ja/jbe) */
  uint32_t game_26589;    /* byte [Game + 0x26589] */
  uint32_t game_26550;    /* [Game+0x26550] (stage-5 al) */
  uint32_t game_c;        /* [Game+0xc] (stage-5 al) */
  uint32_t h_6f9400;      /* 0x6f9400() result */
  uint32_t h_6f95a0;      /* 0x6f95a0() result */
  uint32_t game_18304;    /* [Game+0x18304] */
  uint32_t game_182d0;    /* [Game+0x182d0] */
  uint32_t game_4;        /* [Game+4] (not in {4,5}) */
  uint32_t room_728;      /* [this+0x728] (==0 else hard abort) */
  uint32_t room_f10_f8;   /* [[this+4]+0x10]+8 (0x710fa0 arg1) */
  uint32_t r74bba0_f10_f8;/* [[0x74bba0 result]+0x10]+8 (0x710fa0 arg2) */
  uint32_t game_present;  /* edi != 0 test @0x7f7aed (host blob gate) */
} IsaacRoomTriggerClearAudio7f7a40GatesSrc;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomTriggerClearAudio7f7a40GatesSrc) == 96,
              "IsaacRoomTriggerClearAudio7f7a40GatesSrc size");

#pragma pack(push, 1)
typedef struct IsaacRoomTriggerClearAudio7f7a40GatesOut { /* 100 bytes */
  uint32_t skip_early;    /* a2 byte != 0 (0x7f7a71 jne 0x7f7ac9) */
  uint32_t abort_2c;      /* a2==0 && Game[0x26584]==0x2c (FULL dword) */
  uint32_t type5_59;      /* a2==0 && type8==5 && desc_f10_f10==0x59 */
  uint32_t fire_74ea50;   /* type5_59 (host call 0x74ea50) */
  uint32_t abort_74ea50;  /* fire_74ea50 && h_74ea50 != 0 */
  uint32_t stage_gate;    /* a2==0 && 1<=Game[0]<=6 */
  uint32_t abort_stage_bit; /* stage_gate && (Game[0x2654c]&0x10000) */
  uint32_t play;          /* play flag law */
  uint32_t al;            /* stage-5/6 al law (bit-2) */
  uint32_t success;       /* play && al && 18304==182d0 && g4 not 4/5
                             && room_728 == 0 */
  uint32_t abort_728;     /* play && al && 18304==182d0 && g4 not 4/5
                             && room_728 != 0 (0x7f817f) */
  uint32_t fail_path;     /* play && al && (18304!=182d0 || g4 in
                             {4,5}) -> 0x7f7bd8 */
  uint32_t play_fire;     /* success && room_728 == 0 (PLAY block) */
  uint32_t exit_kind;     /* 0 abort / 1 play(ret 1) / 2 fail-path */
  uint32_t call_7eea90_va;   /* 0x7eea90 (this=room, arg 1) */
  uint32_t call_7eea90_arg;  /* 1 */
  uint32_t call_74bba0_va;   /* 0x74bba0 (this=Game, arg 3) */
  uint32_t call_74bba0_arg;  /* 3 */
  uint32_t store_394_value;  /* 0xfffffff6 ([slot+0x394] store) */
  uint32_t call_710fa0_va;   /* 0x710fa0 (this=room_728, 2 args) */
  uint32_t call_710fa0_arg1; /* [[this+4]+0x10]+8 (pass-through) */
  uint32_t call_710fa0_arg2; /* [[r74bba0]+0x10]+8 (pass-through) */
  uint32_t ret_va;           /* 0x7f7bd5 (PLAY exit) */
  uint32_t fail_va;          /* 0x7f7bd8 (fail-path entry) */
  uint32_t end_va;           /* 0x7f8189 (common ret 8) */
} IsaacRoomTriggerClearAudio7f7a40GatesOut;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomTriggerClearAudio7f7a40GatesOut) == 100,
              "IsaacRoomTriggerClearAudio7f7a40GatesOut size");
static_assert(offsetof(IsaacRoomTriggerClearAudio7f7a40GatesOut, play) == 28,
              "IsaacRoomTriggerClearAudio7f7a40GatesOut play offset");

#pragma pack(push, 1)
typedef struct IsaacRoomTriggerClearAudio7f7a40FailSrc { /* 104 bytes */
  uint32_t a1;            /* [ebx+8] byte arg (0x7f7e34: 0 -> ret 1) */
  uint32_t a2;            /* [ebx+0xc] byte arg */
  uint32_t game_26584;    /* [Game+0x26584] (fail gate !=0 check) */
  uint32_t game_26630;    /* [Game+0x26630] (UNSIGNED ja/jbe) */
  uint32_t game_26589;    /* byte [Game + 0x26589] */
  uint32_t game_18304;    /* [Game+0x18304] (0x740bc0 arg1) */
  uint32_t game_18314;    /* [Game+0x18314] (post-call compare) */
  uint32_t h_740bc0_ret_8;/* [0x740bc0 result + 8] (POST snapshot) */
  uint32_t h_706940b_80;  /* [0x706940(Game) 2nd result + 0x80] (==2) */
  uint32_t obj_1e3;       /* byte [0xc7169c + 0x1e3] */
  uint32_t obj_8;         /* [0xc7169c + 8] */
  uint32_t h_74bae0;      /* 0x74bae0(Game) result (zero/==4 gates) */
  uint32_t h_74e9b0;      /* 0x74e9b0(Game) result (al; ==0 gate) */
  uint32_t slot_seed;     /* [desc + 0x5c] (0 -> HOST FATAL 0xa112c0) */
  uint32_t bm1;           /* [desc[0x10] + 0x38] dword (bitmap1 word0) */
  uint32_t bm2;           /* [desc + 0x18] dword (bitmap2 word0) */
  uint32_t slot_occ0;     /* [room+0x724+0*4] (slot0 occupancy) */
  uint32_t slot_occ1;
  uint32_t slot_occ2;
  uint32_t slot_occ3;
  uint32_t slot_occ4;
  uint32_t slot_occ5;
  uint32_t slot_occ6;
  uint32_t slot_occ7;
  uint32_t r74bba0b_f10_f8;/* [[0x74bba0 2nd result]+0x10]+8 (0x710fa0 arg2) */
  uint32_t slot_8;        /* [slot+8] (door branch: !=8 gate) */
  uint32_t h_70d360;      /* 0x70d360(slot) result (!=4 gate) */
  uint32_t genrand_tail;  /* genrand sample for the tail count law */
} IsaacRoomTriggerClearAudio7f7a40FailSrc;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomTriggerClearAudio7f7a40FailSrc) == 112,
              "IsaacRoomTriggerClearAudio7f7a40FailSrc size");

#pragma pack(push, 1)
typedef struct IsaacRoomTriggerClearAudio7f7a40FailOut { /* 156 bytes */
  uint32_t fire_740bc0;     /* a2==0 (call 0x740bc0(Game, g18304, -1)) */
  uint32_t call_740bc0_va;  /* 0x740bc0 */
  uint32_t abort_740bc0;    /* fire && [r740bc0+8] != Game[0x18314]
                               (POST-call snapshot, FULL dword) */
  uint32_t gate_706940b;    /* a2==0 && (g26584 != 0 || g26630 > 0u) */
  uint32_t abort_706940b;   /* gate && [r706940b+0x80] != 2 */
  uint32_t gate_obj;        /* a2==0 && obj_1e3 == 0 */
  uint32_t abort_obj;       /* gate_obj && (obj_8 != 2 || (g26630 <= 0u
                               && g26589 == 0)) */
  uint32_t abort_74bae0_zero; /* r74bae0 == 0 */
  uint32_t gate_74e9b0;     /* a2==0 && r74bae0 == 4 */
  uint32_t abort_74e9b0;    /* gate_74e9b0 && r74e9b0 != 0 */
  uint32_t seed_fatal;      /* slot_seed == 0 (0xa112c0 + int3) */
  uint32_t fatal_va;        /* 0xa112c0 */
  uint32_t slot_hash;       /* xorshift(seed, 2, 9, 15) u32 */
  uint32_t slot;            /* hash & 7 (then scan) */
  uint32_t found;           /* cl=1 (bitmap1 set && empty && !bitmap2) */
  uint32_t loop_count;      /* 0..8 iterations */
  uint32_t slot_negative;   /* slot < 0 -> ret 0 (dead; &7 keeps 0..7) */
  uint32_t fire_74bba0b;    /* PLAY2 0x74bba0(Game, r74bae0) */
  uint32_t call_74bba0b_arg;/* r74bae0 (pass-through) */
  uint32_t fire_7eea90b;    /* slot ptr == 0 (create: this=room, slot) */
  uint32_t call_7eea90b_arg;/* slot (pass-through) */
  uint32_t store_394_value; /* 0xfffffff6 ([slot+0x394] store) */
  uint32_t fire_710fa0b;    /* 0x710fa0(this=slot, 1, [r74bba0b+0x10+8]) */
  uint32_t call_710fa0b_arg1;/* 1 */
  uint32_t call_710fa0b_arg2;/* [[r74bba0b]+0x10]+8 (pass-through) */
  uint32_t gate_80;         /* [r706940b+0x80] == 2 (door branch) */
  uint32_t slot8_gate;      /* gate_80 && slot_8 != 8 */
  uint32_t fire_70d360;     /* slot8_gate (0x70d360(slot)) */
  uint32_t gate_70d360_4;   /* fire_70d360 && r70d360 != 4 */
  uint32_t path_b;          /* gate_70d360_4 && slot_8 in {1,4,2} */
  uint32_t fire_417870;     /* gate_70d360_4 (GetPlayer(Game, 0)) */
  uint32_t call_417870_arg; /* 0 (index) */
  uint32_t fire_710480;     /* gate_70d360_4 (0x710480(slot, player)) */
  uint32_t fire_710dd0;     /* gate_70d360_4 && !path_b (0x710dd0) */
  uint32_t fire_70fb60;     /* gate_70d360_4 && !path_b (0x70fb60) */
  uint32_t a1_gate;         /* a1 byte == 0 (0x7f7e34 je 0x7f8172) */
  uint32_t tail_fire;       /* a1 byte != 0 (music tail typed-host) */
  uint32_t tail_loop_count; /* (genrand_tail & 3) + 5 */
  uint32_t ret;             /* 0 abort / 1 survive (ret 8 al=1) */
} IsaacRoomTriggerClearAudio7f7a40FailOut;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomTriggerClearAudio7f7a40FailOut) == 156,
              "IsaacRoomTriggerClearAudio7f7a40FailOut size");
static_assert(offsetof(IsaacRoomTriggerClearAudio7f7a40FailOut, slot) == 52,
              "IsaacRoomTriggerClearAudio7f7a40FailOut slot offset");
uint32_t isaac_room_trigger_clear_audio_7f7a40_va(void);
void isaac_room_trigger_clear_audio_7f7a40_gates(
    const IsaacRoomTriggerClearAudio7f7a40GatesSrc* src,
    IsaacRoomTriggerClearAudio7f7a40GatesOut* out);
void isaac_room_trigger_clear_audio_7f7a40_fail(
    const IsaacRoomTriggerClearAudio7f7a40FailSrc* src,
    IsaacRoomTriggerClearAudio7f7a40FailOut* out);

/* ---- v68: FUN_007f8190 (PE 0x7f8190..0x7f83a3, ret 4, thiscall, ONE
   stack arg (byte-gated [ebp+8]), SEH handler 0xb012c7, 76 insns, 11 E8
   + 1 indirect; bounded by 9x int3 at 0x7f83a6..0x7f83af; LIVE: direct
   E8 callers 0x73ee03 + 0x761da6; next body 0x7f83b0 = record-27
   trigger-clear audio always, STILL HOST). Decision laws: (a) HEAD GATE
   (0x7f81ba..0x7f81fe): arg byte != 0 -> proceed; arg==0 && this8!=2 ->
   ret 0; arg==0 && this8==2 -> FirstCollectibleOwner(Game, 0x25a,
   &Game+0x1baa8, 1) 0x9be080; owner!=0 -> proceed; owner==0 &&
   (int32)[*this4] >= 0 -> ret 0; (int32)[*this4] < 0 -> proceed. (b)
   SLOT LAW (0x7f8201..0x7f823b, ALL signed): c=[this+0xc], f10=
   [this+0x10], raw48=[[*this4]+0x10]+0x48; slot = (c>0xa && f10>1) ?
   c+0xa : -1; if (raw48==6) { slot = (c>0x14 && f10>2) ? (c+0xa)*2 :
   -1 }. (c) PATH (0x7f823b): (int32)[*this4] < 0 -> SPAWN (create)
   else SLOT-path. (d) SPAWN: genrand 0x6eef60; SIGNED idiv slot /
   [this+0xc] -> rem/quot; pos.x=(float)rem*40+40 (0xbaa904), pos.y=
   (float)quot*40+120 (0xbaaa00); create 0x6fe410(ecx=Game, frame
   {0x3e8, 0x9c, pos_ptr, 0xc7b640, 0, 0, rng, 0} 8 args). (e) SLOT-path
   (0x7f82ab..0x7f838f): [ebp+8]=0x394 sound id; HOST 0x956780 + 0x92dc30
   (this=[0xc7169c]+0x2a324); genrand -> [ebp+8]; bounds ((int32)slot<0
   || (u32)slot>=0x1c0) -> HOST FATAL 0xa112c0(0xb6c138, 0x10) then
   FALLS THROUGH; (u32)slot>0x1bf (ja) -> skip ret 1; GetGridCollision
   0x7f0800(this=room, slot) > 0 (jg) -> skip; alloc 0xa0f4c0(0x154)
   ==0 -> skip; else ctor 0x709c40, vtable 0xb7da10, [obj+4]=0x12,
   [obj+0x24]=slot, old=[this+slot*4+0x24] (0x24, stride 4): !=0 ->
   vcall old->vfn0(1) (host), slot store = obj, [obj+8]=2, [obj+0x18]=0,
   HOST 0x709db0(this=obj, arg=rng); ret 1. Tile constants 0xbaa904/
   0xbaaa00 match v63 RestoreState (40.0f / 120.0f, section-table
   verified). ABI 68. */
static constexpr uint32_t ISAAC_ROOM_8190_VA = 0x007f8190u;
static constexpr uint32_t ISAAC_ROOM_8190_RET_VA = 0x007f83a3u;
static constexpr uint32_t ISAAC_ROOM_8190_NEXT_VA = 0x007f83b0u;
static constexpr uint32_t ISAAC_ROOM_8190_SEH_HANDLER_VA = 0x00b012c7u;
static constexpr uint32_t ISAAC_ROOM_8190_GAME_GLOBAL = 0x00c71678u;
static constexpr uint32_t ISAAC_ROOM_8190_OBJ_GLOBAL = 0x00c7169cu;
static constexpr uint32_t ISAAC_ROOM_8190_OWNER_HOST_VA = 0x009be080u;
static constexpr uint32_t ISAAC_ROOM_8190_OWNER_COLLECTIBLE = 0x25au;
static constexpr uint32_t ISAAC_ROOM_8190_OWNER_RNG_OFF = 0x1baa8u;
static constexpr uint32_t ISAAC_ROOM_8190_GENRAND_VA = 0x006eef60u;
static constexpr uint32_t ISAAC_ROOM_8190_CREATE_HOST_VA = 0x006fe410u;
static constexpr uint32_t ISAAC_ROOM_8190_CREATE_TYPE = 0x3e8u;
static constexpr uint32_t ISAAC_ROOM_8190_CREATE_VARIANT = 0x9cu;
static constexpr uint32_t ISAAC_ROOM_8190_CREATE_POS_VEC_VA = 0x00c7b640u;
static constexpr uint32_t ISAAC_ROOM_8190_CREATE_ARITY = 8u;
static constexpr uint32_t ISAAC_ROOM_8190_SFX_ID = 0x394u;
static constexpr uint32_t ISAAC_ROOM_8190_SFX_PRE_VA = 0x00956780u;
static constexpr uint32_t ISAAC_ROOM_8190_SFX_PLAY_VA = 0x0092dc30u;
static constexpr uint32_t ISAAC_ROOM_8190_SFX_PLAY_THIS_OFF = 0x2a324u;
static constexpr uint32_t ISAAC_ROOM_8190_FATAL_VA = 0x00a112c0u;
static constexpr uint32_t ISAAC_ROOM_8190_FATAL_ARG0 = 0x00b6c138u;
static constexpr uint32_t ISAAC_ROOM_8190_SLOT_FATAL_MAX = 0x1c0u;
static constexpr uint32_t ISAAC_ROOM_8190_SLOT_SKIP_MAX = 0x1bfu;
static constexpr uint32_t ISAAC_ROOM_8190_GRID_HOST_VA = 0x007f0800u;
static constexpr uint32_t ISAAC_ROOM_8190_ALLOC_HOST_VA = 0x00a0f4c0u;
static constexpr uint32_t ISAAC_ROOM_8190_ALLOC_ARG = 0x154u;
static constexpr uint32_t ISAAC_ROOM_8190_CTOR_HOST_VA = 0x00709c40u;
static constexpr uint32_t ISAAC_ROOM_8190_INIT_HOST_VA = 0x00709db0u;
static constexpr uint32_t ISAAC_ROOM_8190_VTABLE = 0x00b7da10u;
static constexpr uint32_t ISAAC_ROOM_8190_SUBTYPE = 0x12u;
static constexpr uint32_t ISAAC_ROOM_8190_SLOT_ARR_OFF = 0x24u;
static constexpr uint32_t ISAAC_ROOM_8190_SLOT_STRIDE = 4u;
static constexpr uint32_t ISAAC_ROOM_8190_OBJ_F8_VAL = 2u;
static constexpr uint32_t ISAAC_ROOM_8190_OBJ_F18_VAL = 0u;
static constexpr uint32_t ISAAC_ROOM_8190_POS_X_VA = 0x00baa904u;
static constexpr uint32_t ISAAC_ROOM_8190_POS_X_BITS = 0x42200000u;
static constexpr uint32_t ISAAC_ROOM_8190_POS_Y_VA = 0x00baaa00u;
static constexpr uint32_t ISAAC_ROOM_8190_POS_Y_BITS = 0x42f00000u;

#pragma pack(push, 1)
typedef struct IsaacRoom8190DivmodOut { /* 8 bytes */
  int32_t rem;          /* edx after SIGNED idiv slot / width */
  int32_t quot;         /* eax after SIGNED idiv slot / width */
} IsaacRoom8190DivmodOut;
#pragma pack(pop)
static_assert(sizeof(IsaacRoom8190DivmodOut) == 8,
              "IsaacRoom8190DivmodOut size");

#pragma pack(push, 1)
typedef struct IsaacRoom8190SlotGatesOut { /* 60 bytes */
  uint32_t fatal_bounds;   /* (int32)slot<0 || (u32)slot>=0x1c0 (0xa112c0) */
  uint32_t skip_range;     /* (u32)slot > 0x1bf (ja 0x7f8390) */
  uint32_t skip_collision; /* (int32)gridcoll > 0 (jg) */
  uint32_t alloc_needed;   /* !skip_range && !skip_collision */
  uint32_t grid_host_va;   /* 0x7f0800 GetGridCollision */
  uint32_t alloc_host_va;  /* 0xa0f4c0 */
  uint32_t alloc_arg;      /* 0x154 */
  uint32_t ctor_host_va;   /* 0x709c40 */
  uint32_t init_host_va;   /* 0x709db0 */
  uint32_t vtable;         /* 0xb7da10 */
  uint32_t subtype;        /* 0x12 ([obj+4]) */
  uint32_t slot_off;       /* 0x24 */
  uint32_t slot_stride;    /* 4 */
  uint32_t obj_f8_val;     /* 2 ([obj+8]) */
  uint32_t obj_f18_val;    /* 0 ([obj+0x18]) */
} IsaacRoom8190SlotGatesOut;
#pragma pack(pop)
static_assert(sizeof(IsaacRoom8190SlotGatesOut) == 60,
              "IsaacRoom8190SlotGatesOut size");
static_assert(offsetof(IsaacRoom8190SlotGatesOut, grid_host_va) == 16,
              "IsaacRoom8190SlotGatesOut grid_host_va offset");

#pragma pack(push, 1)
typedef struct IsaacRoom8190CreateFrameOut { /* 40 bytes */
  uint32_t a0_type;     /* 0x3e8 (effect type) */
  uint32_t a1_variant;  /* 0x9c (variant) */
  uint32_t a2_pos_ptr;  /* runtime &pos (PE lea [ebp-0x14]; index 2) */
  uint32_t a3_posvec;   /* 0xc7b640 */
  uint32_t a4_zero;
  uint32_t a5_zero;
  uint32_t a6_rng;      /* genrand result */
  uint32_t a7_zero;
  uint32_t arity;       /* 8 (pushed dwords) */
  uint32_t host_va;     /* 0x6fe410 (ecx=Game) */
} IsaacRoom8190CreateFrameOut;
#pragma pack(pop)
static_assert(sizeof(IsaacRoom8190CreateFrameOut) == 40,
              "IsaacRoom8190CreateFrameOut size");
uint32_t isaac_room_8190_va(void);
uint32_t isaac_room_8190_ret_va(void);
uint32_t isaac_room_8190_next_va(void);
uint32_t isaac_room_8190_head_ret0(uint32_t arg, uint32_t this8,
                                   uint32_t owner_25a, int32_t this4_0);
int32_t isaac_room_8190_slot_law(int32_t c, int32_t f10, uint32_t raw48);
uint32_t isaac_room_8190_spawn_path(int32_t this4_0);
void isaac_room_8190_tile_divmod(int32_t slot, int32_t width,
                                 IsaacRoom8190DivmodOut* out);
float isaac_room_8190_tile_pos_x(int32_t rem);
float isaac_room_8190_tile_pos_y(int32_t quot);
void isaac_room_8190_create_frame(uint32_t index, uint32_t rng,
                                  IsaacRoom8190CreateFrameOut* out);
void isaac_room_8190_slot_gates(int32_t slot, int32_t gridcoll,
                                IsaacRoom8190SlotGatesOut* out);

/* ---- v69: FUN_007f83b0 (record-27 trigger-clear audio "always" body, PE
   0x7f83b0..0x7f92ab, ret 8, thiscall, TWO stack args (byte-gated
   [ebx+8]=arg1 music-SFX arm, [ebx+0xc]=arg2 music-force gate), SEH
   handler 0xb01315, cookie 0xbf93b4 + check 0xaef12b; bounded by the
   v68 ret 0x7f83a3 and next body 0x7f92b0 (the VALUE leaf FUN_007f92b0);
   LIVE: direct E8 caller Room::TriggerClear 0x8068f0 @0x8069da with
   (arg1=1, arg2=0); 48 E8 + 3 indirect). PURE laws: L1 music decision
   (xorshift32 static {2,0x15,9} from qword 0xb1f594 + dword 0xb1f59c,
   u32->double sign-fix via qword table 0xbacb00 {0, 2^32}, cvtpd2ps,
   mulss 0x2f7ffffe @0xba9ff0, comiss value>rnd / ja + value>=1.0f
   @0xbaa454 / jae; NaN -> NOT taken -> music==0; NO store-back of the
   transformed seed), L2 rnd f32, L3 flag store [game+9]=1 (byte) iff
   !music && arg2==0, L4 pure skip gate (arg2==0 && (gate749830==0 ||
   room_match==0) -> ret 0 with NO stores), L5 seed==0 fatal leaf
   (0xa112c0(0x10,0xb6bf54) + int3, body continues), L6 item vol =
   u32ToF32*2^-32(0xba9ff4)*5.0f(0xbaa784), L7 item pitch =
   (u32ToF32*2^-32*pi(0xbaa704)) doubled by addss, L8 item speed =
   u32ToF32*2^-32*20.0f(0xbaa87c), L9 noise direction comiss 0.0f vs vel
   / jbe (NaN +-0 keep +1.0f, vel<0 -> -1.0f @0xbaad50), L10 signed-mod
   idiom (and 0x80000000|(mod-1) / jns / dec / or ~(mod-1) / inc; mods 8
   and 4), L11 chapter cap clamp 0..13 (chapter [game+4] 4/5 -> base+1,
   cmovle 0, cmovl 0xd) -> [game+0x26554]. HOST leaves with census
   evidence: gates 0x749830 / 0x740bc0 GetRoomByIdx / value leaf
   0x7f92b0; FirstCollectibleOwner 0x9be080(0x1f2, &Game+0x1baa8, 1);
   RandomInt 0x7e9020(rng {seed=[room+4]+0x58, 2,5,0x15}, 8); vector
   0x42c880 / 0x42c920 / sort 0x5cc070; door create 0x7eea90 + ops
   0x710fa0 / 0x710dd0 + [door+0x394]=0xffffffff mark; room-by-idx vec
   0x67f1d0; genrand 0x6eef60 x16; cos 0x41d540 / sin 0x41d520; spawn
   relay 0x428b20 (family v54 law, 8-arg frame {0x3e8, 0x3b, pos, vel,
   0, i==0, a, 0}); item factory 0xaf08b1; item vtable [eax+0xc];
   music gate 0x44bfb0 + tail 0x7499a0; SFX 0x956780 remap + 0x92dc30
   Play (ids 0x140 / 0x17, this [0xc7169c]+0x2a324, pack 1.0f/2/0/1.0f/
   0, gated arg1 byte); fatal 0xa112c0; free 0xaef15c + indirect delete
   0xb18894; platform cookie 0xaef12b + SEH 0x6ef590/0xaef5af/0xaef253.
   ABI 69. */
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_VA = 0x007f83b0u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_RET_VA = 0x007f8506u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_EPILOGUE_VA = 0x007f84e9u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_END_VA = 0x007f92b0u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_SEH_HANDLER_VA = 0x00b01315u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_GAME_GLOBAL = 0x00c71678u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_OBJ_GLOBAL = 0x00c7169cu;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_GAME_SEED_OFF = 0x182e4u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_GAME_FLAG_OFF = 9u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_GAME_18304_OFF = 0x18304u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_GAME_18314_OFF = 0x18314u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_GAME_CHAPTER_OFF = 4u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_GAME_26554_OFF = 0x26554u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_GAME_RNGCTRL_OFF = 0x182e8u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_SHIFT_QWORD_VA = 0x00b1f594u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_SHIFT_LO = 2u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_SHIFT_MID = 0x15u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_SHIFT_HI = 9u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_SCALE_VA = 0x00ba9ff0u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_SCALE_BITS = 0x2f7ffffeu;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_SCALE_POW2M32_VA = 0x00ba9ff4u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_SCALE_POW2M32_BITS = 0x2f800000u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_ONE_VA = 0x00baa454u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_ONE_BITS = 0x3f800000u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_VOL_MUL_VA = 0x00baa784u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_VOL_MUL_BITS = 0x40a00000u; /* 5.0f */
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_PITCH_MUL_VA = 0x00baa704u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_PITCH_MUL_BITS = 0x4048f5c3u; /* pi */
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_SPEED_MUL_VA = 0x00baa87cu;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_SPEED_MUL_BITS = 0x41a00000u; /* 20.0f */
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_FLOAT10_VA = 0x00baa81cu;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_FLOAT10_BITS = 0x41200000u; /* 10.0f */
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_FLOAT2_VA = 0x00baa630u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_FLOAT2_BITS = 0x40000000u; /* 2.0f */
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_NEG1_VA = 0x00baad50u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_NEG1_BITS = 0xbf800000u; /* -1.0f */
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_SIGN_TABLE_VA = 0x00bacb00u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_SIGN_TABLE_HI_BITS = 0x41f0000000000000u; /* 2^32 */
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_SIGN_MASK_VA = 0x00bacb70u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_SIGN_MASK_BITS = 0x80000000u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_FATAL_VA = 0x00a112c0u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_FATAL_ARG0 = 0x00b6bf54u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_FATAL_ARG1 = 0x10u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_GATE_749830_VA = 0x00749830u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_ROOMIDX_HOST_VA = 0x00740bc0u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_VALUE_LEAF_VA = 0x007f92b0u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_OWNER_HOST_VA = 0x009be080u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_OWNER_COLLECTIBLE = 0x1f2u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_OWNER_RNG_OFF = 0x1baa8u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_RANDOMINT_HOST_VA = 0x007e9020u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_RANDOMINT_BOUND = 8u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_RANDOMINT_QWORD_VA = 0x00b1f540u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_RANDOMINT_DWORD_VA = 0x00b1f548u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_SORT_HOST_VA = 0x005cc070u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_VEC_INIT_VA = 0x0042c880u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_VEC_PUSH_VA = 0x0042c920u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_DOOR_CREATE_VA = 0x007eea90u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_DOOR_OP_A_VA = 0x00710fa0u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_DOOR_OP_B_VA = 0x00710dd0u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_DOOR_MARK_OFF = 0x394u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_DOOR_MARK_BITS = 0xffffffffu;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_GENRAND_VA = 0x006eef60u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_COS_VA = 0x0041d540u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_SIN_VA = 0x0041d520u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_SPAWN_428B20_VA = 0x00428b20u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_ITEM_FACTORY_VA = 0x00af08b1u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_MUSIC_GATE_44BFB0_VA = 0x0044bfb0u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_MUSIC_TAIL_7499A0_VA = 0x007499a0u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_SFX_PRE_VA = 0x00956780u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_SFX_PLAY_VA = 0x0092dc30u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_SFX_PLAY_THIS_OFF = 0x2a324u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_SFX_ID_A = 0x140u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_SFX_ID_B = 0x17u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_SFX_VOL_BITS = 0x3f800000u;
static constexpr int32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_SFX_DELAY = 2;
static constexpr int32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_SFX_LOOP = 0;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_SFX_PITCH_BITS = 0x3f800000u;
static constexpr int32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_SFX_PAN = 0;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_TILE_40_VA = 0x00baa904u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_TILE_40_BITS = 0x42200000u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_TILE_120_VA = 0x00baaa00u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_TILE_120_BITS = 0x42f00000u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_ITEM_F474_OFF = 0x474u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_ITEM_F45C_OFF = 0x45cu;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_ITEM_F460_OFF = 0x460u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_ITEM_ID_BASE = 0x1eu;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_ITEM_ID_DIV = 0xau;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_ITEM_COUNT_ADD = 5u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_ITEM_COUNT_MASK = 3u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_SPAWN_TYPE = 0x3e8u;
static constexpr uint32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_SPAWN_VARIANT = 0x3bu;
static constexpr int32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_CHAPTER_4 = 4;
static constexpr int32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_CHAPTER_5 = 5;
static constexpr int32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_CHAPTER_CAP = 0xd;
static constexpr int32_t ISAAC_ROOM_TRIGGER_CLEAR_AUDIO_83B0_DOOR_MIN = 2;

uint32_t isaac_room_trigger_clear_audio_83b0_va(void);
uint32_t isaac_room_trigger_clear_audio_83b0_ret_va(void);
uint32_t isaac_room_trigger_clear_audio_83b0_end_va(void);
uint32_t isaac_room_trigger_clear_audio_music(uint32_t arg2,
                                              uint32_t value_bits,
                                              uint32_t seed);
float isaac_room_trigger_clear_audio_rnd_f32(uint32_t seed);
uint32_t isaac_room_trigger_clear_audio_flag_store(uint32_t arg2,
                                                    uint32_t value_bits,
                                                    uint32_t seed);
uint32_t isaac_room_trigger_clear_audio_skip(uint32_t arg2,
                                              uint32_t gate749830,
                                              uint32_t room_match);
uint32_t isaac_room_trigger_clear_audio_seed_fatal(uint32_t seed);
float isaac_room_trigger_clear_audio_item_vol(uint32_t rnd_bits);
float isaac_room_trigger_clear_audio_item_pitch(uint32_t rnd_bits);
float isaac_room_trigger_clear_audio_item_speed(uint32_t rnd_bits);
float isaac_room_trigger_clear_audio_noise_dir(uint32_t vel_bits);
int32_t isaac_room_trigger_clear_audio_signed_mod(uint32_t value,
                                                  uint32_t mod_pow2);
uint32_t isaac_room_trigger_clear_audio_chapter_cap(uint32_t chapter,
                                                    int32_t base);

/* ---- v70: FUN_007f92b0 value leaf (PE 0x7f92b0..0x7f96e6, ret with
   ST0 float, thiscall, ecx = current room used ONLY as the 0x9305f0
   receiver (room+0x7310); 18 E8 + 0 indirect; LIVE: 3 direct callers
   0x7f8441 (FUN_007f83b0 G3), 0x84cb4d (StatHUD::RecomputeStats
   0x84ca00), 0x84d18e (the 0x84cc40 stat tween walker) — all pass
   this=room; next body 0x7f96f0). Collectible/flags sum: FCO owners
   0x33/0x104/0x22/0x3b/0x4e/0x259 x2/0x29d/0xd7/0x1f3, count33
   (0x9be750, SIGNED >1), trinket counts 0xae/7 (0x9be6b0 + 0x7cb6e0
   sub-chain switch), flags [game+0x1839c] bits 1/4/0x40, room-match
   gate + byte [room+0x120c], stage/chapter scale ((acc+f)*0.25/0.5),
   byte [game+9], modes 0x2663c/0x269c8 + [game+0x26548] bit
   0x20000000, [game+0x18334] unsigned compare. PLUS the v69 ALT-tail
   laws: door-magic flag stores (0x7f8d94..0x7f8dc6, FULL-dword magic
   0xe -> [game+0x26548]|=0x20 / 0xf -> |=1) and the tail-RNG advance
   (0x7f91b3..0x7f9201, dynamic shift registers [game+0x182e8/
   0x182ec/0x182f0] low bytes, store-back [game+0x182e4]). ABI 70. */
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_VA = 0x007f92b0u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_RET_VA = 0x007f96e6u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_END_VA = 0x007f96f0u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_GAME_GLOBAL = 0x00c71678u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_OWNER_HOST_VA = 0x009be080u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_COUNT_HOST_VA = 0x009be750u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_TRINKET_COUNT_VA = 0x009be6b0u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_TRINKET_LOOKUP_VA = 0x007cb6e0u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_ROOMIDX_HOST_VA = 0x00740bc0u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_LIST_COUNT_VA = 0x0041b770u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_LIST_HAS_VA = 0x009305f0u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_OWNER_33 = 0x33u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_OWNER_104 = 0x104u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_OWNER_22 = 0x22u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_OWNER_3B = 0x3bu;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_OWNER_4E = 0x4eu;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_OWNER_259 = 0x259u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_OWNER_29D = 0x29du;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_OWNER_D7 = 0xd7u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_OWNER_1F3 = 0x1f3u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_TRINKET_AE = 0xaeu;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_TRINKET_7 = 7u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_LIST_TYPE_124 = 0x124u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_PLAYERS_OFF = 0x1baa8u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_GAME_18300_OFF = 0x18300u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_GAME_18304_OFF = 0x18304u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_GAME_18314_OFF = 0x18314u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_GAME_1839C_OFF = 0x1839cu;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_GAME_18334_OFF = 0x18334u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_GAME_26548_OFF = 0x26548u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_GAME_26554_OFF = 0x26554u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_GAME_2663C_OFF = 0x2663cu;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_GAME_269C8_OFF = 0x269c8u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_GAME_CHAPTER_OFF = 4u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_GAME_MUSIC_FLAG_OFF = 9u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_ROOM_120C_OFF = 0x120cu;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_ROOM_7310_OFF = 0x7310u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_ROOM_1218_OFF = 0x1218u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_FLAGS_BIT_1 = 1u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_FLAGS_BIT_4 = 4u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_FLAGS_BIT_40 = 0x40u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_FLAGS26548_BIT = 0x20000000u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_MODE_2663C = 0x11u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_MODE_2 = 2u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_MODE_3 = 3u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_MODE_3_E = 0xcu;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_MODE_2_E = 0xbu;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_INIT_VA = 0x00baa06cu;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_INIT_BITS = 0x3c23d70au; /* 0.01f */
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_A1_VA = 0x00baa12cu;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_A1_BITS = 0x3de147aeu; /* 0.11f */
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_A2_VA = 0x00baa154u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_A2_BITS = 0x3e19999au; /* 0.15f */
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_A3_VA = 0x00baa0d0u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_A3_BITS = 0x3d4ccccdu; /* 0.05f */
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_A4_VA = 0x00baa13cu;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_A4_BITS = 0x3e000000u; /* 0.125f */
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_A5_VA = 0x00baa178u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_A5_BITS = 0x3e333333u; /* 0.175f */
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_A6_VA = 0x00baa244u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_A6_BITS = 0x3eb33333u; /* 0.35f */
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_A7_VA = 0x00baa244u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_A7_BITS = 0x3eb33333u; /* 0.35f */
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_A7B_VA = 0x00baa154u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_A7B_BITS = 0x3e19999au; /* 0.15f */
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_A8_VA = 0x00baa44cu;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_A8_BITS = 0x3f7d70a4u; /* 0.99f */
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_A8B_VA = 0x00baa280u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_A8B_BITS = 0x3ecccccdu; /* 0.4f */
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_A9_VA = 0x00baa120u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_A9_BITS = 0x3dccccccdu; /* 0.1f */
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_A10_1_BITS = 0x3dccccccdu; /* 0.1f */
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_A10_2_BITS = 0x3e19999au; /* 0.15f */
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_A10_3_BITS = 0x3e4ccccdu; /* 0.2f */
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_A11_2_BITS = 0x3d4ccccdu; /* 0.05f */
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_A11_3_BITS = 0x3dccccccdu; /* 0.1f */
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_A12_VA = 0x00baa0f0u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_A12_BITS = 0x3d8d4fdfu; /* 0.069f */
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_A13_VA = 0x00baa120u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_A13_BITS = 0x3dccccccdu; /* 0.1f */
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_SCALE_Q_VA = 0x00baa1d4u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_SCALE_Q_BITS = 0x3e800000u; /* 0.25f */
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_SCALE_H_VA = 0x00baa2d0u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_SCALE_H_BITS = 0x3f000000u; /* 0.5f */
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_ONE_VA = 0x00baa454u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_ONE_BITS = 0x3f800000u; /* 1.0f */
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_A15_BITS = 0x42853333u; /* 66.4f */
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_SIGN_TABLE_VA = 0x00bacb00u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_SIGN_TABLE_HI_BITS = 0x41f0000000000000u; /* 2^32 */
static constexpr int32_t ISAAC_ROOM_VALUE_92B0_CHAPTER_4 = 4;
static constexpr int32_t ISAAC_ROOM_VALUE_92B0_CHAPTER_5 = 5;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_DOOR_MAGIC_E = 0xeu;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_DOOR_MAGIC_F = 0xfu;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_DOOR_FLAG_20 = 0x20u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_DOOR_FLAG_1 = 1u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_GAME_2654C_OFF = 0x2654cu;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_TAIL_SEED_OFF = 0x182e4u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_TAIL_S1_OFF = 0x182e8u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_TAIL_S2_OFF = 0x182ecu;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_TAIL_S3_OFF = 0x182f0u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_TAIL_FATAL_VA = 0x00a112c0u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_TAIL_FATAL_ARG0 = 0x00b6bf54u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_TAIL_FATAL_ARG1 = 0x10u;

/* ---- v71: 0x7f96f0 StatHUD luck/chance leaf (PE 0x7f96f0..0x7f9955,
   plain `ret` ST0 float; NO args, NO receiver — everything re-read from
   the Game global [0xc71678]; 6 E8 all 0x9be080; 0 indirect; next body
   0x7f9960; 3 direct callers 0x749a2d (Level::InitializeDevilAngelRoom
   0x7499a0), 0x84cb86 (StatHUD::RecomputeStats), 0x84d1c7 (0x84cc40
   tween walker)). acc init 0.5f; G0 (flags26548 bits 0x40/1 both clear
   -> 1.0f); G1..G3 FCO owners 0xee/0xef/0x248 lerp 0.25f; G4
   (int32)[game+0x26570]>9 SIGNED lerp 0.5f; G5 flags1839c bit 2 lerp
   0.25f; G6 XOR(bits 3,4) -> +0.1f (bit 8) / -0.1f SUBSS (bit 0x10);
   G7 f=[game+0x182f4] comiss/ja (NaN enters block): lerp iff f>0 OR
   (owner259 && flags26548&0x20) OR owner248b; else acc=0 unless
   (flags26548&0x20 && [game+0x26568]==0) keeps acc; G8 owner 0x1f3 ->
   77.0f else acc; maxss 0.0 / minss 1.0 clamp (SSE semantics:
   (v>=0.0f)?v:0.0f then (v<=1.0f)?v:1.0f — -0.0 kept, NaN -> 0.0).
   [game+0x2654c] is a DEAD store @0x7f9712 (never read; excluded).
   ABI 71. */
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_VA = 0x007f96f0u;
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_RET_VA = 0x007f9955u;
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_END_VA = 0x007f9960u;
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_GAME_GLOBAL = 0x00c71678u;
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_OWNER_HOST_VA = 0x009be080u;
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_OWNER_EE = 0xeeu;
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_OWNER_EF = 0xefu;
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_OWNER_248 = 0x248u;
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_OWNER_259 = 0x259u;
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_OWNER_1F3 = 0x1f3u;
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_GAME_26548_OFF = 0x26548u;
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_GAME_2654C_OFF = 0x2654cu; /* dead store @0x7f9712 */
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_GAME_26570_OFF = 0x26570u;
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_GAME_1839C_OFF = 0x1839cu;
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_GAME_182F4_OFF = 0x182f4u;
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_GAME_26568_OFF = 0x26568u;
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_FLAGS_BIT_1 = 1u;
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_FLAGS_BIT_20 = 0x20u;
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_FLAGS_BIT_40 = 0x40u;
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_1839C_BIT_2 = 2u;
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_1839C_BIT_3 = 3u;
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_1839C_BIT_4 = 4u;
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_1839C_BIT_8 = 8u;
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_1839C_BIT_10 = 0x10u;
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_INIT_VA = 0x00baa2d0u;
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_INIT_BITS = 0x3f000000u; /* 0.5f */
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_Q_VA = 0x00baa1d4u;
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_Q_BITS = 0x3e800000u; /* 0.25f */
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_H_VA = 0x00baa2d0u;
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_H_BITS = 0x3f000000u; /* 0.5f */
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_TENTH_VA = 0x00baa120u;
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_TENTH_BITS = 0x3dccccccdu; /* 0.1f */
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_ONE_VA = 0x00baa454u;
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_ONE_BITS = 0x3f800000u; /* 1.0f */
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_ZERO_VA = 0x00ba9fe4u;
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_ZERO_BITS = 0x00000000u; /* 0.0f */
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_1F3_RESULT_VA = 0x00baa994u;
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_1F3_RESULT_BITS = 0x429a0000u; /* 77.0f */
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_CALLER_749A2D = 0x00749a2du;
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_CALLER_84CB86 = 0x0084cb86u;
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_CALLER_84D1C7 = 0x0084d1c7u;

/* ---- v71: FUN_007f83b0 ALT-tail door-walk selection (PE 0x7f8c0f..
   0x7f8d81, inside the v69 body; 1 E8 = 0xa112c0 fatal @0x7f8c59; 0
   indirect). FIXED path iff [game+0x18308]==-1 && (int32)[game+0x1831c]
   >=0: bm1 bit test + [room+idx*4+0x724]==0 slot test -> success.
   RANDOM: seed=[room4+0x58] (room4=[room+4]); seed==0 -> HOST fatal
   +int3, body continues; xorshift32 {2,5,0x15} (qword 0xb1f540 +
   dword 0xb1f548) -> sel = x&7; mode [game+0x269c8]==2||3 (FULL dword)
   -> sel=4 REPLACE. PASS1 (i 0..7): idx=smod8(sel+i); bm1 bit idx AND
   bm2 bit smod4(idx+2) AND slot_free(idx) -> success if idx>=0 else
   fall to PASS2. PASS2 (i 0..7): idx=smod8(sel+i); bm1 AND slot_free ->
   success idx>=0 else fail. bm1 dwords [room4->+0x10]+0x38/0x3c (idx
   >>5); bm2 dwords [[ebp-0x1c]]+0x38 (idx2>=0) / +0x34 (idx2<0,
   arithmetic >>5 = -1) where [[ebp-0x1c]] = stage>=3 (UNSIGNED jae
   0x1830c) ? [0xc810a0] : [game+0x16c8c] (host capture). Slot test
   [room+idx*4+0x724]==0 (FULL dword); walk idx bounds 0..7 -> mask,
   fixed idx unbounded -> captured separately. smod reuses the v69 L10
   signed-mod law. Result: idx or -1. ABI 71. */
static constexpr uint32_t ISAAC_ROOM_TCA83B0_DOOR_WALK_VA = 0x007f8c0fu;
static constexpr uint32_t ISAAC_ROOM_TCA83B0_DOOR_WALK_END_VA = 0x007f8d89u; /* first post-law insn */
static constexpr uint32_t ISAAC_ROOM_TCA83B0_DOOR_WALK_GAME_GLOBAL = 0x00c71678u;
static constexpr uint32_t ISAAC_ROOM_TCA83B0_DOOR_WALK_FATAL_VA = 0x00a112c0u;
static constexpr uint32_t ISAAC_ROOM_TCA83B0_DOOR_WALK_FATAL_ARG0 = 0x00b6bf54u;
static constexpr uint32_t ISAAC_ROOM_TCA83B0_DOOR_WALK_FATAL_ARG1 = 0x10u;
static constexpr uint32_t ISAAC_ROOM_TCA83B0_DOOR_WALK_ROOM4_OFF = 4u;
static constexpr uint32_t ISAAC_ROOM_TCA83B0_DOOR_WALK_SEED_OFF = 0x58u;
static constexpr uint32_t ISAAC_ROOM_TCA83B0_DOOR_WALK_BM1_BASE_OFF = 0x10u;
static constexpr uint32_t ISAAC_ROOM_TCA83B0_DOOR_WALK_BM1_DW_38 = 0x38u;
static constexpr uint32_t ISAAC_ROOM_TCA83B0_DOOR_WALK_BM1_DW_3C = 0x3cu;
static constexpr uint32_t ISAAC_ROOM_TCA83B0_DOOR_WALK_BM2_DW_34 = 0x34u;
static constexpr uint32_t ISAAC_ROOM_TCA83B0_DOOR_WALK_BM2_DW_38 = 0x38u;
static constexpr uint32_t ISAAC_ROOM_TCA83B0_DOOR_WALK_SLOT_OFF = 0x724u;
static constexpr uint32_t ISAAC_ROOM_TCA83B0_DOOR_WALK_GAME_18308_OFF = 0x18308u;
static constexpr uint32_t ISAAC_ROOM_TCA83B0_DOOR_WALK_GAME_1831C_OFF = 0x1831cu;
static constexpr uint32_t ISAAC_ROOM_TCA83B0_DOOR_WALK_GAME_1830C_OFF = 0x1830cu;
static constexpr uint32_t ISAAC_ROOM_TCA83B0_DOOR_WALK_GAME_269C8_OFF = 0x269c8u;
static constexpr uint32_t ISAAC_ROOM_TCA83B0_DOOR_WALK_GAME_16C8C_OFF = 0x16c8cu;
static constexpr uint32_t ISAAC_ROOM_TCA83B0_DOOR_WALK_BM2_GLOBAL = 0x00c810a0u;
static constexpr uint32_t ISAAC_ROOM_TCA83B0_DOOR_WALK_SHIFT_TABLE_VA = 0x00b1f540u;
static constexpr uint32_t ISAAC_ROOM_TCA83B0_DOOR_WALK_SHIFT_HI_VA = 0x00b1f548u;
static constexpr uint32_t ISAAC_ROOM_TCA83B0_DOOR_WALK_SHIFT_LO = 2u;
static constexpr uint32_t ISAAC_ROOM_TCA83B0_DOOR_WALK_SHIFT_MID = 5u;
static constexpr uint32_t ISAAC_ROOM_TCA83B0_DOOR_WALK_SHIFT_HI = 0x15u;
static constexpr uint32_t ISAAC_ROOM_TCA83B0_DOOR_WALK_SEL_GREED = 4u;
static constexpr uint32_t ISAAC_ROOM_TCA83B0_DOOR_WALK_MODE_2 = 2u;
static constexpr uint32_t ISAAC_ROOM_TCA83B0_DOOR_WALK_MODE_3 = 3u;
static constexpr int32_t ISAAC_ROOM_TCA83B0_DOOR_WALK_MOD_8 = 8;
static constexpr int32_t ISAAC_ROOM_TCA83B0_DOOR_WALK_MOD_4 = 4;
static constexpr uint32_t ISAAC_ROOM_TCA83B0_DOOR_WALK_FAIL = 0xffffffffu; /* -1 */

/* ---- v71: StatHUD-side clamp/gate recipe consuming the 0x7f92b0
   value (PE 0x84cb4d..0x84cb86 RecomputeStats + 0x84d18e..0x84d1c7
   tween walker; IDENTICAL): value=0x7f92b0(room); maxss 0.0 (0xba9fe4);
   minss 1.0 (0xbaa454); call 0x749830; al==0 -> value = 0.0. Both
   callsites pass ecx=[game+0x18300] (current room) to the value + luck
   leaves. ABI 71. */
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_HUD_CLAMP_VA_1 = 0x0084cb4du;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_HUD_CLAMP_END_1 = 0x0084cb86u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_HUD_CLAMP_VA_2 = 0x0084d18eu;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_HUD_CLAMP_END_2 = 0x0084d1c7u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_HUD_GATE_VA = 0x00749830u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_HUD_VALUE_VA = 0x007f92b0u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_HUD_LUCK_VA = 0x007f96f0u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_HUD_ROOM_OFF = 0x18300u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_HUD_GAME_GLOBAL = 0x00c71678u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_HUD_MAX_VA = 0x00ba9fe4u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_HUD_MAX_BITS = 0x00000000u; /* 0.0f */
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_HUD_MIN_VA = 0x00baa454u;
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_HUD_MIN_BITS = 0x3f800000u; /* 1.0f */

/* ---- v72: FUN_007f83b0 MUSIC-path door collect walk (PE 0x7f85c0..
   0x7f8634 loop + 0x7f8636..0x7f8643 count/gate; INSIDE the v69 body,
   packed entry 0x7f8509 = first insn after the v69 ret 8 @0x7f8506).
   rnd = HOST RandomInt 0x7e9020 result (rng blob {seed=[room4+0x58],
   qword 0xb1f540, dword 0xb1f548}, bound 8) captured at the seam —
   the RNG chain STAYS HOST (family standard). Per i in 0..7 (SIGNED
   jl): idx = smod8(rnd+i) (v69 L10 signed-mod, same helper the v71
   door-walk select reuses); bm1 bit idx [room4->+0x10]+0x38/0x3c +
   slot [room+idx*4+0x724]==0 (FULL dword) -> count++ (vec push host
   0x42c880/0x42c920 is bookkeeping: smod8 over 8 consecutive ints
   yields 8 DISTINCT residues, no duplicates). count = SAR(end-begin,
   2) @0x7f863d; gate 0x7f8640 cmp eax,2 / jb 0x7f8b2f UNSIGNED:
   body continues iff (u32)count >= 2 (0xffffffff CONTINUES); skip
   exit 0x7f8b2f stores [ebp-4]=-1 + vec dtor + falls into the ALT
   door-walk label 0x7f8b80 (census label, MID-INSTRUCTION: 2 bytes
   into `mov esi,[0xc71678]` @0x7f8b7e — region label, not a call
   target). Count feeds the HOST sort 0x5cc070 @0x7f864e + door
   create 0x7eea90/0x710fa0/0x710dd0. No bm2 test, no mode override,
   no seed read. ABI 72. */
static constexpr uint32_t ISAAC_ROOM_TCA83B0_DOOR_WALK_MUSIC_VA = 0x007f85c0u;
static constexpr uint32_t ISAAC_ROOM_TCA83B0_DOOR_WALK_MUSIC_END_VA = 0x007f8649u; /* first post-gate insn (push edi) */
static constexpr uint32_t ISAAC_ROOM_TCA83B0_DOOR_WALK_MUSIC_LOOP_TAIL_VA = 0x007f8634u; /* jl 0x7f85c0 */
static constexpr uint32_t ISAAC_ROOM_TCA83B0_DOOR_WALK_MUSIC_COUNT_VA = 0x007f8636u; /* SAR (end-begin)>>2 */
static constexpr uint32_t ISAAC_ROOM_TCA83B0_DOOR_WALK_MUSIC_GATE_VA = 0x007f8640u; /* cmp eax,2 */
static constexpr uint32_t ISAAC_ROOM_TCA83B0_DOOR_WALK_MUSIC_SKIP_VA = 0x007f8b2fu; /* [ebp-4]=-1 + vec dtor */
static constexpr uint32_t ISAAC_ROOM_TCA83B0_DOOR_WALK_MUSIC_ENTRY_VA = 0x007f8509u; /* packed entry (owner 0x1f2 gate) */
static constexpr uint32_t ISAAC_ROOM_TCA83B0_DOOR_WALK_LABEL_VA = 0x007f8b80u; /* ALT door-walk census label, mid-insn */
static constexpr int32_t ISAAC_ROOM_TCA83B0_DOOR_WALK_MUSIC_ITER = 8;
static constexpr uint32_t ISAAC_ROOM_TCA83B0_DOOR_WALK_MUSIC_MIN_COUNT = 2u; /* UNSIGNED jb gate bound */

/* ---- v73: 0x7f9960..0x7f9de6 devil/angel room selection + door-create
   tail (SEH body, `ret 8`, 2 byte args (ForceAngel [ebp+8], ForceDevil
   [ebp+0xc]) — the ROOM-side twin of Level::InitializeDevilAngelRoom
   0x7499a0 (which calls the v71 luck leaf at 0x749a2d); ebx = ecx =
   room; returns bool in al (0 @0x7f9b14/ret 0x7f9b27, 1 @0x7f9d80/ret
   0x7f9d93); 19 E8 + 1 indirect vtable [vt+0x28] @0x7f9d56 (result
   ignored); 5 direct callers 0x806a4a (Room::TriggerClear 0x8068f0,
   the update-v95 awards suite (0,0)), 0x73ed55 + 0x73f552 (enclosing
   0x73e040, (0,0), ecx=[game+0x18300]), 0x5fbdb8 ((1,0), ecx =
   0x407480(Game) room), 0x7a7660 ((1,1), gate
   [0x7cb6e0(ebx)]>1 SIGNED && [game+0x18308]==-5); census in
   section-notes/room-v73-devilangel/NOTES.md §4. PHASES: A init gates
   (only when !ForceDevil; 0x26584==0x2c; room type 5 && bm1base[0x10]
   ==0x59 && host 0x74ea50; game state SIGNED [1,6] && 0x2654c &
   0x10000; 0x1830c==0; host GetRoomByIdx 0x740bc0 [ret+8]==0x18314;
   host 0x74e9b0); B state inc (t = ~host6f95a0 & (host6f9400 |
   0x26550 | [game+0xc]); test al,2 -> state+1; !ForceDevil -> ==6
   SIGNED-eq); C slot -5 marks (any slot ptr [room+i*4+0x724] with
   (s32)[slot+0x394]==-5 -> return 0; -5 == the create mark); D FCO
   0x226 owner -> ForceAngel' = combine (cmovne); fatals 0xb6c620/
   0xb6c610; proceed iff (s32)0x264fc <= (s32)0x26500 (jle SIGNED)
   || ForceAngel' || ForceDevil else fatal 0xb6c634 + return 0; E
   select: FIXED iff 0x18308==-5 && (s32)0x1831c >= 0 (js) && slot
   free (idx UNBOUNDED, no bm1) -> idx; RANDOM: seed=[room4+0x58],
   seed==0 -> HOST fatal 0xa112c0(0x10, 0xb6bf54) + int3 (same law
   shape as v71 V8, NEW site 0x7f9b7e); xorshift32 {1,0xb,0x10}
   (qword 0xb1f504 + dword 0xb1f50c; NOT the 83b0 {2,5,0x15} table)
   -> sel = x&7; ONE pass i 0..7: idx = smod8(sel+i); bm1 bit
   (logical idx>>5 == 0 -> word +0x38 only) AND slot free -> idx;
   NO match in 8 -> idx = smod8(sel+7) LAST TRIED (never fails, no
   -1, js @0x7f9bfc dead); F TLS (s32)[0xc8108c] > (s32)[[fs:0x2c]
   +0xc] jg SIGNED -> HOST report 0xaef29d/0x6ef590/0xaef5af/
   0xaef253 + retry — outcome-neutral, host-only) + create (host
   0x7eea90/0x710fa0/0x710dd0/0x70f810; [slot+0x394]=-5;
   [game+0x2654c] |= 0x40; [game+0x26548] SELF-store) + angel loop
   (only if ForceAngel'; vec {head 0x125c, cap 0x1260, end 0x1264},
   UNSIGNED jb bound; member: type 0x2d && [0x2c]==0 && 2500.0f >
   dist2 ORDERED (comiss/jbe) where q = IDIV SIGNED (s32)slot->0x24 /
   (s32)[curRoom+0xc] (curRoom = [game+0x18300]), dy = f32(r*40+40-
   rv_33c), dx = f32(q*40+120-rv_340), dist2 = dx*dx+dy*dy f32 ->
   HOST vtable call [vt+0x28] @0x7f9d56 (result ignored)). All
   params uint32_t (byte gates & 0xff); SIGNED compares via int32
   casts (wasm32 i64 sign-extend form). ABI 73. */
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_VA = 0x007f9960u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_RET_FAIL_VA = 0x007f9b27u; /* first ret 8 (al=0) */
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_RET_OK_VA = 0x007f9d93u; /* final ret 8 (al=1) */
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_END_VA = 0x007f9de7u; /* int3 pad */
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_NEXT_VA = 0x007f9df0u; /* next body */
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_GAME_GLOBAL = 0x00c71678u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_INIT_GATES_VA = 0x007f998au;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_STATE_INC_VA = 0x007f9a2eu;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_SLOT_MARK_VA = 0x007f9a6au;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_PROCEED_VA = 0x007f9ae2u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_PROCEED_JLE_VA = 0x007f9af7u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_SELECT_VA = 0x007f9b3eu; /* fixed gate */
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_RANDOM_VA = 0x007f9b5fu;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_WALK_VA = 0x007f9bc0u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_SEED_FATAL_VA = 0x007f9b7eu;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_TLS_VA = 0x007f9c04u; /* host-only (outcome-neutral) */
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_CREATE_VA = 0x007f9c1du; /* host */
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_ANGEL_VA = 0x007f9ce0u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_ANGEL_CALL_VA = 0x007f9d56u; /* vtable [vt+0x28] */
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_GAME_26584_OFF = 0x26584u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_GAME_26584_GATE = 0x2cu;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_ROOM_TYPE_GATE = 5u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_BM1BASE_10_GATE = 0x59u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_STATE_MIN = 1u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_STATE_MAX = 6u; /* SIGNED jl/jg range */
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_GAME_2654C_OFF = 0x2654cu;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_2654C_BIT_10000 = 0x10000u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_2654C_OR_40 = 0x40u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_GAME_1830C_OFF = 0x1830cu;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_GAME_18304_OFF = 0x18304u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_GAME_18314_OFF = 0x18314u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_GAME_18308_OFF = 0x18308u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_GAME_1831C_OFF = 0x1831cu;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_GAME_264FC_OFF = 0x264fcu;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_GAME_26500_OFF = 0x26500u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_GAME_18300_OFF = 0x18300u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_GAME_26548_OFF = 0x26548u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_GAME_26550_OFF = 0x26550u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_GAME_C_OFF = 0xcu;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_ROOM4_OFF = 4u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_SEED_OFF = 0x58u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_BM1_BASE_OFF = 0x10u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_BM1_DW_38 = 0x38u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_SLOT_OFF = 0x724u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_SLOT_F394_OFF = 0x394u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_MARK_NEG5 = 0xfffffffbu; /* -5 (create mark) */
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_ANGEL_VEC_HEAD_OFF = 0x125cu;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_ANGEL_VEC_CAP_OFF = 0x1260u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_ANGEL_VEC_END_OFF = 0x1264u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_ANGEL_ATTR = 0x2du;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_ANGEL_ATTR2_OFF = 0x2cu;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_DOOR_POS_OFF = 0x24u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_GRID_DIV_OFF = 0xcu;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_K40_VA = 0x00baa904u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_K40_BITS = 0x42200000u; /* 40.0f */
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_ADD120_VA = 0x00baaa00u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_ADD120_BITS = 0x42f00000u; /* 120.0f */
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_THRESH_VA = 0x00baabf0u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_THRESH_BITS = 0x451c4000u; /* 2500.0f */
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_SHIFT_TABLE_VA = 0x00b1f504u; /* qword {1, 0xb} */
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_SHIFT_HI_VA = 0x00b1f50cu; /* 0x10 */
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_SHIFT_LO = 1u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_SHIFT_MID = 0xbu;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_SHIFT_HI = 0x10u;
static constexpr int32_t ISAAC_ROOM_DEVIL_ANGEL_9960_SEL_MASK = 7;
static constexpr int32_t ISAAC_ROOM_DEVIL_ANGEL_9960_ITER = 8;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_FATAL_VA = 0x00a112c0u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_FATAL_MSG_1 = 0x00b6c620u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_FATAL_MSG_2 = 0x00b6c610u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_FATAL_MSG_3 = 0x00b6c634u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_FATAL_MSG_4 = 0x00b6c66cu;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_FATAL_SEED_MSG = 0x00b6bf54u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_FATAL_SEED_ARG = 0x10u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_HOST_74EA50_VA = 0x0074ea50u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_HOST_GETROOM_V740BC0_VA = 0x00740bc0u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_HOST_74E9B0_VA = 0x0074e9b0u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_HOST_6F9400_VA = 0x006f9400u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_HOST_6F95A0_VA = 0x006f95a0u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_OWNER_HOST_VA = 0x009be080u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_OWNER_226 = 0x226u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_DOOR_CREATE_HOST_VA = 0x007eea90u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_DOOR_OPS_710FA0_VA = 0x00710fa0u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_DOOR_OPS_710DD0_VA = 0x00710dd0u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_DOOR_OPS_70F810_VA = 0x0070f810u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_DOOR_OP_11 = 0x11u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_TLS_REPORT_VA = 0x00aef29du;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_TLS_6EF590_VA = 0x006ef590u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_TLS_REPORT2_VA = 0x00aef5afu;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_TLS_RELEASE_VA = 0x00aef253u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_TLS_GLOBAL = 0x00c8108cu;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_TLS_BLOB = 0x00c81090u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_TLS_B15B30 = 0x00b15b30u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_CALLER_806A4A = 0x00806a4au;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_CALLER_73ED55 = 0x0073ed55u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_CALLER_73F552 = 0x0073f552u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_CALLER_5FBDB8 = 0x005fbdb8u;
static constexpr uint32_t ISAAC_ROOM_DEVIL_ANGEL_9960_CALLER_7A7660 = 0x007a7660u;

uint32_t isaac_room_value_92b0_va(void);
uint32_t isaac_room_value_92b0_ret_va(void);
uint32_t isaac_room_value_92b0_end_va(void);
float isaac_room_value_92b0(uint32_t owner33, uint32_t owner104,
                            uint32_t count33, uint32_t owner22,
                            uint32_t owner3b, uint32_t owner4e,
                            uint32_t flags1839c, uint32_t room_match,
                            uint32_t room120c, uint32_t owner259,
                            uint32_t owner259b, uint32_t trinket_ae_count,
                            uint32_t trinket_ae_t, uint32_t trinket_7_count,
                            uint32_t trinket_7_t, uint32_t owner29d,
                            uint32_t count124, uint32_t stage,
                            uint32_t chapter4, uint32_t chapter,
                            uint32_t music_flag9, uint32_t owner_d7,
                            uint32_t room_has_d7, uint32_t mode2663c,
                            uint32_t flags26548, uint32_t owner_1f3,
                            uint32_t mode269c8, uint32_t count18334);
uint32_t isaac_room_value_92b0_stage_scale(uint32_t stage,
                                           uint32_t chapter4,
                                           uint32_t chapter);
uint32_t isaac_room_trigger_clear_audio_83b0_door_flag_store(
    uint32_t flags, uint32_t door_magic);
uint32_t isaac_room_trigger_clear_audio_83b0_tail_rng_fatal(uint32_t seed);
uint32_t isaac_room_trigger_clear_audio_83b0_tail_rng_next(
    uint32_t seed, uint32_t s1, uint32_t s2, uint32_t s3);

uint32_t isaac_room_luck_96f0_va(void);
uint32_t isaac_room_luck_96f0_ret_va(void);
uint32_t isaac_room_luck_96f0_end_va(void);
float isaac_room_luck_96f0(uint32_t flags26548, uint32_t owner_ee,
                           uint32_t owner_ef, uint32_t owner_248,
                           uint32_t count26570, uint32_t flags1839c,
                           uint32_t f182f4_bits, uint32_t owner_259,
                           uint32_t owner_248b, uint32_t game26568,
                           uint32_t owner_1f3);
uint32_t isaac_room_trigger_clear_audio_83b0_door_walk_seed_fatal(
    uint32_t seed);
int32_t isaac_room_trigger_clear_audio_83b0_door_walk_select(
    uint32_t game18308, uint32_t game1831c, uint32_t fixed_slot_free,
    uint32_t bm1_38, uint32_t bm1_3c, uint32_t bm2_38, uint32_t bm2_34,
    uint32_t seed, uint32_t mode269c8, uint32_t slot_free_mask);
float isaac_room_value_92b0_hud_clamp_gate(uint32_t value_bits,
                                           uint32_t gate749830);
uint32_t isaac_room_trigger_clear_audio_83b0_door_walk_music_count(
    uint32_t rnd, uint32_t bm1_38, uint32_t bm1_3c,
    uint32_t slot_free_mask);
uint32_t isaac_room_trigger_clear_audio_83b0_door_walk_music_continue(
    uint32_t count);

uint32_t isaac_room_devil_angel_9960_init_gates(
    uint32_t force_devil, uint32_t game26584, uint32_t room_type,
    uint32_t bm1base_10, uint32_t host74ea50, uint32_t game_state,
    uint32_t game2654c, uint32_t game1830c, uint32_t host_room8_740bc0,
    uint32_t game18314, uint32_t host74e9b0);
uint32_t isaac_room_devil_angel_9960_state_inc(
    uint32_t force_devil, uint32_t game_state, uint32_t host6f9400,
    uint32_t host6f95a0, uint32_t game26550, uint32_t game_c);
uint32_t isaac_room_devil_angel_9960_slot_mark_pass(
    uint32_t slot_f394_neg5_mask);
uint32_t isaac_room_devil_angel_9960_force_angel_combine(
    uint32_t force_angel, uint32_t owner226);
uint32_t isaac_room_devil_angel_9960_proceed(
    uint32_t force_angel, uint32_t force_devil, uint32_t game264fc,
    uint32_t game26500);
uint32_t isaac_room_devil_angel_9960_seed_fatal(uint32_t seed);
int32_t isaac_room_devil_angel_9960_select(
    uint32_t game18308, uint32_t game1831c, uint32_t fixed_slot_free,
    uint32_t bm1_38, uint32_t slot_free_mask, uint32_t seed);
uint32_t isaac_room_devil_angel_9960_angel_proximity(
    uint32_t slot_24, uint32_t room_c, uint32_t roomv_28,
    uint32_t roomv_2c, uint32_t roomv_33c, uint32_t roomv_340);

/* ---- v74: 0x7f9df0..0x7f9ed4 door-create byte-gate body (plain
   prologue, `ret 4`, ONE byte arg [ebp+8], thiscall receiver = ROOM,
   returns bool in al (1 @0x7f9eb6/ret 0x7f9ebc, 0 @0x7f9ecf/ret
   0x7f9ed4); 5 E8 + 0 indirect; int3 pad 0x7f9ed7..0x7f9edf; next
   body 0x7f9ee0. Gate chain runs ONLY when (arg & 0xff) == 0 (cmp
   byte [ebp+8],0 / jne 0x7f9e6f); arg != 0 skips straight to the
   pass log + slot gate. PURE decisions: W1 init gates (G1 [G+0x18304]
   == [G+0x182d0] FULL dword; G2 game state == 0xb FULL dword; G3
   [G+0x1830c] == 0; G4 byte [obj+0xe7] != 0 || [obj+8] == 2 (obj =
   [0xc7169c]); G5 (u32)[G+0x26630] > 0 UNSIGNED ja @0x7f9e55 ||
   byte [G+0x26589] != 0; G6 (host6dae20 & 0xff) == 0 ||
   (host706940.ret[0x74] & 0xff) != 0 — the two host results are
   captured at the seam) and W2 slot gate ([room+0x728] == 0 FULL
   dword @0x7f9e7e, else HOST fatal 0xb6c584 + return 0). Creation
   side stays HOST: fatal 0xa112c0(1, 0xb6c5ac) pass log @0x7f9e6f,
   door create 0x7eea90(idx 1) @0x7f9e8b (slot -> [room+0x728]),
   [slot+0x394] = 0xfffffff9 (-7) mark @0x7f9e98, door op 0x710fa0
   (arg [room4->0x10+8], 5) @0x7f9eb1. 1 direct caller 0x7f3f32
   (push 0; ecx=room; enclosing 0x7f2800 SEH, result IGNORED) +
   INDIRECT callback registration 0x86c708 (push 0x7f9df0; push
   0xb73bbc; call 0x890f30) in the room-callback chain — census in
   section-notes/room-v74-7f9df0/NOTES.md §4. All params uint32_t
   (byte gates & 0xff); the ONLY unsigned-sensitive compare is the
   ja @0x7f9e55 (wasm32 compare-flip class: uint32 > 0u; a signed
   int32 mutant flips for 0x80000000). NO uint8_t scalars. ABI 74. */
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_VA = 0x007f9df0u;
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_RET_OK_VA = 0x007f9ebcu; /* ret 4 (al=1) */
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_RET_FAIL_VA = 0x007f9ed4u; /* ret 4 (al=0) */
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_END_VA = 0x007f9ed7u; /* int3 pad */
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_NEXT_VA = 0x007f9ee0u; /* next body (grid) */
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_GAME_GLOBAL = 0x00c71678u;
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_OBJ_GLOBAL = 0x00c7169cu;
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_INIT_GATES_VA = 0x007f9e05u; /* cmp byte [ebp+8],0 */
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_G1_VA = 0x007f9e0eu; /* 18304 vs 182d0 */
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_STATE_GATE_VA = 0x007f9e20u; /* [G] == 0xb */
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_G3_VA = 0x007f9e29u; /* [G+0x1830c] == 0 */
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_G4_VA = 0x007f9e36u; /* obj e7/8 gate */
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_G5_JA_VA = 0x007f9e55u; /* UNSIGNED ja [G+0x26630] > 0 */
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_G6_VA = 0x007f9e60u; /* host 0x6dae20 + dl */
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_PASS_LOG_VA = 0x007f9e6fu; /* HOST fatal(1, 0xb6c5ac) */
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_SLOT_GATE_VA = 0x007f9e7eu; /* [room+0x728] == 0 */
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_CREATE_VA = 0x007f9e87u; /* HOST 0x7eea90 idx 1 */
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_MARK_VA = 0x007f9e98u; /* [slot+0x394] = -7 */
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_DOOR_OP_VA = 0x007f9eb1u; /* HOST 0x710fa0 */
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_FAIL_LOG_VA = 0x007f9ebfu; /* HOST fatal(1, 0xb6c584) */
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_GAME_18304_OFF = 0x18304u;
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_GAME_182D0_OFF = 0x182d0u;
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_GAME_1830C_OFF = 0x1830cu;
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_GAME_26630_OFF = 0x26630u;
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_GAME_26589_OFF = 0x26589u;
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_STATE_GATE = 0xbu;
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_OBJ_E7_OFF = 0xe7u;
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_OBJ_8_OFF = 8u;
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_OBJ_8_GATE = 2u;
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_SLOT_728_OFF = 0x728u;
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_SLOT_F394_OFF = 0x394u;
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_MARK_NEG7 = 0xfffffff9u; /* -7 clock mark */
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_SLOT_IDX = 1u; /* 0x7eea90 create arg */
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_DOOR_OP_ARG_2 = 5u; /* 2nd 0x710fa0 arg */
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_ROOM4_10_8_OFF = 8u; /* [room4->0x10+8] host arg */
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_HOST_706940_VA = 0x00706940u;
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_HOST_6DAE20_VA = 0x006dae20u;
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_FATAL_VA = 0x00a112c0u;
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_FATAL_MSG_PASS = 0x00b6c5acu;
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_FATAL_MSG_BUSY = 0x00b6c584u;
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_DOOR_CREATE_HOST_VA = 0x007eea90u;
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_DOOR_OPS_710FA0_VA = 0x00710fa0u;
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_CALLER_7F3F32 = 0x007f3f32u;
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_CALLER_HOST_28180_HEAD = 0x007f2800u; /* enclosing SEH */
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_REGISTER_VA = 0x0086c708u; /* push 0x7f9df0 */
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_REGISTER_HOST_890F30_VA = 0x00890f30u;
static constexpr uint32_t ISAAC_ROOM_DOOR_CREATE_9DF0_REGISTER_SLOT = 0x00b73bbcu;

uint32_t isaac_room_door_create_9df0_init_gates(
    uint32_t arg, uint32_t host706940_74, uint32_t game18304,
    uint32_t game182d0, uint32_t game_state, uint32_t game1830c,
    uint32_t obj_e7, uint32_t obj_8, uint32_t game26630,
    uint32_t game26589, uint32_t host6dae20);
uint32_t isaac_room_door_create_9df0_slot_gate(uint32_t slot728);

/* ---- v75: grid bodies 0x7f9ee0 (pos->cell ops + snap) + 0x7fa0e0
   (index->cell ops + snap-back). 0x7f9ee0..0x7fa0d9: plain prologue
   + stack align, thiscall receiver = ROOM, ONE arg = &{f32 x, f32
   y} (in/out: arg[0..1] overwritten with the snapped pos on the
   collision path), `ret 4`; int3 pad 0x7fa0dc..0x7fa0df; next body
   0x7fa0e0. 0x7fa0e0..0x7fa296: same prologue, ONE arg = &int32
   grid index (in/out: *arg = back-converted idx or -1 on the
   collision path, untouched otherwise), rets 0x7fa288/0x7fa296.
   Census (corrected tooling, section-notes/room-v75-grid/NOTES.md
   §0/§4): 9ee0 = 22 direct rel32 callers 0x7fbea4..0x7fe013, a0e0
   = 1 direct caller 0x7fce17; NO push-immediate/registration for
   either. Shared pure core: pos->idx conversion col = trunc((x-
   40.0f)/40.0f+0.5f), row = trunc((y-120.0f)/40.0f+0.5f) (f32
   chain, cvttss2si trunc-toward-zero, 0x80000000 indefinite for
   NaN/out-of-range), SIGNED bounds (js/jge), idx = (u32)(w*row+
   col) 32-bit imul wrap; and the FIVE unsigned idx<=0x1bf ja gates
   (9ee0 0x7f9f4f/0x7f9fd7/0x7fa00e, a0e0 0x7fa14b/0x7fa178) — the
   wasm32 compare-flip class (i64 sign-extend form): cpp writes
   `idx <= 0x1bfu` (i32.le_u); a signed int32 mutant flips for
   bit-31 idx (pins 0x80000000/0xffffffff). NO byte gates in either
   body (all compares dword/float); NO uint8_t scalars. Cell-type
   gates on THREE separate grid[idx] reads (cell_a type-7 -> HOST
   0x81e6e0, cell_b type-5 -> [cell_b+4]=2 + INDIRECT vtable[0x14]
   call, cell_c 0xe/!=1 -> [grid+idx*4+0x76c]=0x384 + HOST 0x4e45c0);
   edi/edi_type = the register state at the 0x7fa004 gate (seam-
   captured post-host reload on the type-7 path); collision = HOST
   0x7f0800 GetGridCollision result (seam); E4 bit = collision != 0
   (FULL dword) -> HOST 0x813520 snap. Float constants via the
   section table: CELL 40.0f @0xbaa904, HALF 0.5f @0xbaa2d0,
   ORIGIN_Y 120.0f @0xbaaa00; struct floats 1.3364271e-05f
   @0xc7b640 / 1.6119069e-05f @0xc7b644 (host-side, doc-only).
   ABI 75. */
static constexpr uint32_t ISAAC_ROOM_GRID_9EE0_VA = 0x007f9ee0u;
static constexpr uint32_t ISAAC_ROOM_GRID_9EE0_RET_VA = 0x007fa0d9u; /* ret 4 */
static constexpr uint32_t ISAAC_ROOM_GRID_9EE0_END_VA = 0x007fa0dcu; /* int3 pad */
static constexpr uint32_t ISAAC_ROOM_GRID_9EE0_NEXT_VA = 0x007fa0e0u;
static constexpr uint32_t ISAAC_ROOM_GRID_A0E0_VA = 0x007fa0e0u;
static constexpr uint32_t ISAAC_ROOM_GRID_A0E0_RET_OK_VA = 0x007fa288u; /* ret 4 (*arg = idx) */
static constexpr uint32_t ISAAC_ROOM_GRID_A0E0_RET_COLLIDE_VA = 0x007fa296u; /* ret 4 (*arg untouched) */
static constexpr uint32_t ISAAC_ROOM_GRID_A0E0_END_VA = 0x007fa299u; /* int3 pad */
static constexpr uint32_t ISAAC_ROOM_GRID_CELL_SIZE_BITS = 0x42200000u; /* 40.0f @0xbaa904 */
static constexpr uint32_t ISAAC_ROOM_GRID_HALF_BITS = 0x3f000000u; /* 0.5f @0xbaa2d0 */
static constexpr uint32_t ISAAC_ROOM_GRID_ORIGIN_Y_BITS = 0x42f00000u; /* 120.0f @0xbaaa00 */
static constexpr uint32_t ISAAC_ROOM_GRID_STRUCT_F_LO_BITS = 0x3760371cu; /* 1.3364271e-05f @0xc7b640 */
static constexpr uint32_t ISAAC_ROOM_GRID_STRUCT_F_HI_BITS = 0x37783770u; /* 1.6119069e-05f @0xc7b644 */
static constexpr uint32_t ISAAC_ROOM_GRID_INDEX_MAX = 0x1bfu;
static constexpr uint32_t ISAAC_ROOM_GRID_BASE_OFF = 0x24u;
static constexpr uint32_t ISAAC_ROOM_GRID_CELL_STRIDE = 4u;
static constexpr uint32_t ISAAC_ROOM_GRID_COST_OFF = 0x76cu;
static constexpr uint32_t ISAAC_ROOM_GRID_COST_VALUE = 0x384u;
static constexpr uint32_t ISAAC_ROOM_GRID_TYPE_7 = 7u;
static constexpr uint32_t ISAAC_ROOM_GRID_TYPE_5 = 5u;
static constexpr uint32_t ISAAC_ROOM_GRID_TYPE_MARK = 2u;
static constexpr uint32_t ISAAC_ROOM_GRID_TYPE_E = 0xeu;
static constexpr uint32_t ISAAC_ROOM_GRID_TYPE_SKIP = 1u;
static constexpr uint32_t ISAAC_ROOM_GRID_VTABLE_SLOT = 0x14u;
static constexpr uint32_t ISAAC_ROOM_GRID_VTABLE_ARG = 1u;
static constexpr uint32_t ISAAC_ROOM_GRID_ROOM_W_OFF = 0xcu;
static constexpr uint32_t ISAAC_ROOM_GRID_ROOM_H_OFF = 0x10u;
static constexpr uint32_t ISAAC_ROOM_GRID_OOB = 0xffffffffu;
static constexpr uint32_t ISAAC_ROOM_GRID_9EE0_COL_HEAD_VA = 0x007f9efcu; /* movss xmm0,[eax] */
static constexpr uint32_t ISAAC_ROOM_GRID_9EE0_COL_TRUNC_VA = 0x007f9f11u; /* cvttss2si */
static constexpr uint32_t ISAAC_ROOM_GRID_9EE0_ROW_TRUNC_VA = 0x007f9f35u; /* cvttss2si */
static constexpr uint32_t ISAAC_ROOM_GRID_9EE0_IDX_IMUL_VA = 0x007f9f42u; /* imul/add wrap */
static constexpr uint32_t ISAAC_ROOM_GRID_9EE0_GATE1_VA = 0x007f9f4fu; /* ja UNSIGNED */
static constexpr uint32_t ISAAC_ROOM_GRID_9EE0_GATE2_VA = 0x007f9fddu;
static constexpr uint32_t ISAAC_ROOM_GRID_9EE0_GATE3_VA = 0x007fa00eu;
static constexpr uint32_t ISAAC_ROOM_GRID_9EE0_E1_VA = 0x007f9f68u; /* HOST 0x81e6e0 (type 7) */
static constexpr uint32_t ISAAC_ROOM_GRID_9EE0_E2_VA = 0x007f9fdfu; /* cell_b block */
static constexpr uint32_t ISAAC_ROOM_GRID_9EE0_MARK_VA = 0x007f9fedu; /* [cell_b+4] = 2 */
static constexpr uint32_t ISAAC_ROOM_GRID_9EE0_VCALL_VA = 0x007f9ffdu; /* [vtable+0x14] */
static constexpr uint32_t ISAAC_ROOM_GRID_9EE0_E3_GATE_VA = 0x007fa004u; /* edi type 0xe */
static constexpr uint32_t ISAAC_ROOM_GRID_9EE0_COST_STORE_VA = 0x007fa028u; /* [grid+idx*4+0x76c]=0x384 */
static constexpr uint32_t ISAAC_ROOM_GRID_9EE0_COLLIDE_VA = 0x007fa0aau; /* test eax,eax (host 0x7f0800) */
static constexpr uint32_t ISAAC_ROOM_GRID_9EE0_SNAP_VA = 0x007fa0c4u; /* HOST 0x813520 */
static constexpr uint32_t ISAAC_ROOM_GRID_9EE0_SNAP_STORE_VA = 0x007fa0cbu; /* arg[0..1] = snap */
static constexpr uint32_t ISAAC_ROOM_GRID_A0E0_GATE1_VA = 0x007fa14bu; /* ja UNSIGNED */
static constexpr uint32_t ISAAC_ROOM_GRID_A0E0_GATE2_VA = 0x007fa178u;
static constexpr uint32_t ISAAC_ROOM_GRID_A0E0_MARK_VA = 0x007fa161u; /* [cell_b+4] = 2 */
static constexpr uint32_t ISAAC_ROOM_GRID_A0E0_VCALL_VA = 0x007fa171u; /* [vtable+0x14] */
static constexpr uint32_t ISAAC_ROOM_GRID_A0E0_COST_STORE_VA = 0x007fa19bu; /* [grid+idx2*4+0x76c]=0x384 */
static constexpr uint32_t ISAAC_ROOM_GRID_A0E0_COLLIDE_VA = 0x007fa1c5u; /* test eax,eax (host 0x7f0800) */
static constexpr uint32_t ISAAC_ROOM_GRID_A0E0_IDIV_VA = 0x007fa1d8u; /* cdq/idiv SIGNED by w */
static constexpr uint32_t ISAAC_ROOM_GRID_A0E0_SNAP_VA = 0x007fa223u; /* HOST 0x813520 */
static constexpr uint32_t ISAAC_ROOM_GRID_A0E0_BACKCONVERT_VA = 0x007fa23au; /* cvttss2si chain */
static constexpr uint32_t ISAAC_ROOM_GRID_A0E0_STORE_IDX_VA = 0x007fa280u; /* *arg = idx */
static constexpr uint32_t ISAAC_ROOM_GRID_A0E0_STORE_NEG1_VA = 0x007fa28eu; /* *arg = -1 */
static constexpr uint32_t ISAAC_ROOM_GRID_HOST_81E6E0_VA = 0x0081e6e0u; /* type-7 cell op */
static constexpr uint32_t ISAAC_ROOM_GRID_HOST_4E45C0_VA = 0x004e45c0u; /* cell-cost op (this room+0x7234) */
static constexpr uint32_t ISAAC_ROOM_GRID_HOST_GET_COLLISION_7F0800_VA = 0x007f0800u;
static constexpr uint32_t ISAAC_ROOM_GRID_HOST_SNAP_813520_VA = 0x00813520u;
static constexpr uint32_t ISAAC_ROOM_GRID_9EE0_CALLER_COUNT = 22u;
static constexpr uint32_t ISAAC_ROOM_GRID_9EE0_CALLER_FIRST = 0x007fbea4u;
static constexpr uint32_t ISAAC_ROOM_GRID_9EE0_CALLER_LAST = 0x007fe013u;
static constexpr uint32_t ISAAC_ROOM_GRID_A0E0_CALLER = 0x007fce17u;

uint32_t isaac_room_grid_pos_index(float x, float y, uint32_t room_w,
                                   uint32_t room_h);
uint32_t isaac_room_grid_index_gate(uint32_t idx);
uint32_t isaac_room_grid_9ee0_effects(
    uint32_t idx, uint32_t cell_a, uint32_t cell_a_type,
    uint32_t edi, uint32_t edi_type, uint32_t cell_b,
    uint32_t cell_b_type, uint32_t cell_c, uint32_t cell_c_type,
    uint32_t collision);
uint32_t isaac_room_grid_a0e0_effects(
    uint32_t idx, uint32_t cell_b, uint32_t cell_b_type,
    uint32_t idx2, uint32_t cell_c, uint32_t cell_c_type,
    uint32_t collision);

/* ---- v76: CENSUS + LEASE block (NO laws, ABI stays 75). The Lua
   class-binding registry mega-function 0x866960..0x86e4c9 (SEH
   thiscall `mov ebx,ecx`, registers EVERY Lua class, `ret` @0x86e4c9;
   0 direct rel32 callers + zero static dword refs — reached via
   pointer only) contains the Room class block: property pass
   (class-create @0x86bed1 -> rows 0x86c100..0x86c283: property rows
   `push <getter>; push <setter>; push <name>; call 0x88f890` +
   member-field rows `push 1; push <off>; push <name>; call 0x88f720/
   0x88f2c0/0x88fa00/0x88fb80`) and method pass (class-create
   @0x86c288 -> rows 0x86c2a2..0x86ca49; class name string slot
   0xb734f0 = "Room"). The wave-26 C4 "45 paired push+call rows" body
   = rows 57..101 of the method pass, 0x86c6c4..0x86c9c0, uniform
   17-byte rows `push <body>; push <name>; mov ecx,eax; call <helper>`.
   STRAIGHT-LINE: zero jXX/ret/int3 in the whole block — NO
   row-selection gates, NO &0xff byte gates, NO uint8_t; the
   registration-decision-law hypothesis is decoded FALSE (log-v23-
   binding precedent: ZERO LAWS). Helpers: GENERIC binders (0x890e70/
   0x890ed0/0x890f30/0x88fdb0/0x8906f0/0x88fd10/0x890110/0x890790/
   0x890b50/0x88fe10/0x891230 — body `[ebp+0xc]` + name `[ebp+8]` from
   the row, six-IAT 0xb1839c/0xb183fc/0xb18418/0xb18414/0xb1840c/
   0xb18408 lua-reg fill, ret 8) vs per-row CLOSURE binders (imm-
   bodied: 0x890e10=0x816000, 0x890f90=0x820170, 0x890ff0=0x7ec080,
   0x891050=0x4566f0, 0x8910b0=0x81e6e0, 0x891110=0x81e9d0,
   0x891170=0x81ecc0, 0x8911d0=0x820910, 0x891290=0x820c00) — the
   choice is a pure compiler artifact. Full 45-row table re-decoded
   byte-exact in the v78 verification (section-notes/room-v78-7fa920/
   NOTES.md §3). LEASES: rows 0x86c719
   (0x820170 TrySpawnBlueWombDoor) + 0x86c72a (0x8204b0
   TrySpawnTheVoidDoor) re-register the frame_effect-OWNED Room door
   bodies (FE v23/v24 FINAL) — room records the rows only, never peels
   the bodies. Rows 0x86c6f7 (0x7f9960, v73) + 0x86c708 (0x7f9df0,
   v74) re-pin the family bodies' own binder rows. LUCK consumers:
   StatHUD::RecomputeStats 0x84ca00 + the 0x84cc40 walker reach the
   v71 luck leaf isaac_room_luck_96f0 and the v70 value leaf
   isaac_room_value_92b0 ONLY through the room laws (sites 0x84cb86/
   0x84d1c7 + 0x84cb4d/0x84d18e; host gate 0x749830; maxss 0.0 / minss
   1.0 clamp; walker recursion call 0x84ca00 @0x84d66d). [G+0x26548]
   has NO direct read in 0x84ca00..0x84d6b0 — the band reaches it only
   through the leaves (luck-leaf sites 0x7f970c bits 0x40/1,
   0x7f98b4 + 0x7f98df bit 0x20; value-leaf 0x7f966d bit
   0x20000000; writers = v69 door-magic stores). HUD-side consumers:
   PLAYERHUD v32/v33 laws (84ca00 mask-dispatch + 84cc40 walker:
   HOST_VA_PROBE3 = 0x7f96f0, PROBE1 = 0x7f92b0, PROBE2 = 0x749830),
   NOT hud_post_update v28/v30 (those read 0x26584/0x26589/0x26630/
   0x26614/0x264f8 only; zero 96f0/92b0/749830/26548 hits in
   hud_post_update files). */

/* ---- v76: callback chain census constants ---- */
static constexpr uint32_t ISAAC_ROOM_CALLBACK_CHAIN_HEAD_VA = 0x00866960u;
static constexpr uint32_t ISAAC_ROOM_CALLBACK_CHAIN_END_VA = 0x0086e4c9u;
static constexpr uint32_t ISAAC_ROOM_CALLBACK_CHAIN_NAME_SLOT_ROOM = 0x00b734f0u;
static constexpr uint32_t ISAAC_ROOM_CALLBACK_PROPERTY_PASS_CREATE_VA = 0x0086bed1u;
static constexpr uint32_t ISAAC_ROOM_CALLBACK_PROPERTY_ROWS_VA = 0x0086c100u;
static constexpr uint32_t ISAAC_ROOM_CALLBACK_METHOD_PASS_CREATE_VA = 0x0086c288u;
static constexpr uint32_t ISAAC_ROOM_CALLBACK_METHOD_ROWS_VA = 0x0086c2a2u;
static constexpr uint32_t ISAAC_ROOM_CALLBACK_METHOD_ROWS_END_VA = 0x0086ca49u;
static constexpr uint32_t ISAAC_ROOM_CALLBACK_C4_BODY_VA = 0x0086c6c4u;
static constexpr uint32_t ISAAC_ROOM_CALLBACK_C4_BODY_END_VA = 0x0086c9c1u;
static constexpr uint32_t ISAAC_ROOM_CALLBACK_C4_ROWS = 45u;
static constexpr uint32_t ISAAC_ROOM_CALLBACK_ROW_STRIDE = 17u;
static constexpr uint32_t ISAAC_ROOM_CALLBACK_GENERIC_HELPER_FIRST_VA = 0x0088fd10u;
static constexpr uint32_t ISAAC_ROOM_CALLBACK_CLOSURE_HELPER_FIRST_VA = 0x00890e10u;
static constexpr uint32_t ISAAC_ROOM_CALLBACK_ROW_7F9960_VA = 0x0086c6f7u; /* TrySpawnBossRushDoor (v73) */
static constexpr uint32_t ISAAC_ROOM_CALLBACK_ROW_7F9DF0_VA = 0x0086c708u; /* TrySpawnMegaSatanRoomDoor (v74) */
static constexpr uint32_t ISAAC_ROOM_CALLBACK_ROW_820170_VA = 0x0086c719u; /* TrySpawnBlueWombDoor */
static constexpr uint32_t ISAAC_ROOM_CALLBACK_ROW_8204B0_VA = 0x0086c72au; /* TrySpawnTheVoidDoor */

/* ---- v76: frame_effect lease rows (0x820170/0x8204b0) ---- */
static constexpr uint32_t ISAAC_ROOM_LEASE_820170_FRAME_EFFECT_VA = 0x00820170u; /* FE v23 FINAL */
static constexpr uint32_t ISAAC_ROOM_LEASE_8204B0_FRAME_EFFECT_VA = 0x008204b0u; /* FE v24 FINAL */

/* ---- v76: RecomputeStats luck-leaf / [G+0x26548] consumer record ---- */
static constexpr uint32_t ISAAC_ROOM_RECOMPUTE_84CA00_VA = 0x0084ca00u;
static constexpr uint32_t ISAAC_ROOM_RECOMPUTE_VALUE_SITE_84CB4D = 0x0084cb4du; /* isaac_room_value_92b0 */
static constexpr uint32_t ISAAC_ROOM_RECOMPUTE_WALKER_VALUE_SITE_84D18E = 0x0084d18eu;
static constexpr uint32_t ISAAC_ROOM_RECOMPUTE_RECURSE_84D66D = 0x0084d66du; /* call 0x84ca00 */
static constexpr uint32_t ISAAC_ROOM_RECOMPUTE_GATE_749830_VA = 0x00749830u;
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_26548_READ_G0 = 0x007f970cu; /* bits 0x40/1 */
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_26548_READ_G7 = 0x007f98b4u; /* bit 0x20 */
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_26548_READ_G7B = 0x007f98dfu; /* owner259 arm */
static constexpr uint32_t ISAAC_ROOM_VALUE_92B0_26548_READ = 0x007f966du; /* bit 0x20000000 */
static constexpr uint32_t ISAAC_ROOM_LUCK_96F0_PLAYERHUD_PROBE3 = 0x007f96f0u; /* playerhud v32/v33 probes */

/* ---- v76 (ABI bump): grid pos-snap body 0x7fa2a0 (after the v75 grid
   block end 0x7fa299). Plain prologue (`and esp,0xfffffff8`), thiscall
   receiver = ROOM, ONE arg = &{f32 x, f32 y} in/out, ret 4 @0x7fa35b;
   no SEH; 1 E8 + 0 indirect. Flow: L1 pos->idx (the v75 shared law,
   isaac_room_grid_pos_index, IDENTICAL chain 0x7fa2c0..0x7fa306)
   -> push &local idx; call HOST 0x7fa360 (SEH cell-op; arg IN/OUT —
   rewritten on the collision path @0x7fa67d) -> re-read idx @0x7fa31b
   -> L2a idx->pos (NEW law, this unit): cdq/idiv SIGNED by w @0x7fa31f/
   0x7fa320 (q = idx/w, r = idx%w, trunc toward zero), x = f32(r)*40.0f
   + 40.0f, y = f32(q)*40.0f + 120.0f, movss stores @0x7fa34d/0x7fa351.
   The tail runs even for idx == -1 (oob): w > 1 -> q 0, r -1 -> pos
   (0.0, 120.0); w == 1 -> q -1, r 0 -> (40.0, 80.0). Contracts (x86
   idiv fault classes, excluded): w != 0, !(idx == INT32_MIN && w ==
   -1). Census: 4 direct rel32 callers 0x7fd351..0x7fd6ad (same band as
   the v75 grid callers; every site `mov ecx,this; lea eax,&pos; push
   eax; call`, shared `call 0x7e90f0` tail); NO push-immediate / dword
   registration (zero pointer refs in .text/.rdata/.data). HOST seam
   0x7fa360..0x7fa7c1 (SEH, ret 4, &idx in/out): 8 direct callers
   0x7fa316 + 0x7fbf8c..0x7fd002. NOTES: room-v76-a2a0. */
static constexpr uint32_t ISAAC_ROOM_GRID_A2A0_VA = 0x007fa2a0u;
static constexpr uint32_t ISAAC_ROOM_GRID_A2A0_POS_HEAD_VA = 0x007fa2c0u; /* movss xmm0,[edi] */
static constexpr uint32_t ISAAC_ROOM_GRID_A2A0_IDX_IMUL_VA = 0x007fa301u; /* imul/add wrap */
static constexpr uint32_t ISAAC_ROOM_GRID_A2A0_OOB_VA = 0x007fa308u; /* or eax,-1 */
static constexpr uint32_t ISAAC_ROOM_GRID_A2A0_HOST_CALL_VA = 0x007fa316u; /* call 0x7fa360 */
static constexpr uint32_t ISAAC_ROOM_GRID_A2A0_ARG_REREAD_VA = 0x007fa31bu; /* mov eax,[esp+0xc] */
static constexpr uint32_t ISAAC_ROOM_GRID_A2A0_IDIV_VA = 0x007fa31fu; /* cdq/idiv SIGNED by w */
static constexpr uint32_t ISAAC_ROOM_GRID_A2A0_BACKCONVERT_VA = 0x007fa323u; /* cvtdq2ps/mulss/addss */
static constexpr uint32_t ISAAC_ROOM_GRID_A2A0_STORE_X_VA = 0x007fa34du; /* movss [edi],xmm1 */
static constexpr uint32_t ISAAC_ROOM_GRID_A2A0_STORE_Y_VA = 0x007fa351u; /* movss [edi+4],xmm0 */
static constexpr uint32_t ISAAC_ROOM_GRID_A2A0_RET_VA = 0x007fa35bu; /* ret 4 */
static constexpr uint32_t ISAAC_ROOM_GRID_A2A0_END_VA = 0x007fa35eu; /* int3 pad */
static constexpr uint32_t ISAAC_ROOM_GRID_A2A0_NEXT_VA = 0x007fa360u; /* SEH cell-op (host) */
static constexpr uint32_t ISAAC_ROOM_GRID_HOST_CELLOP_A2A0_VA = 0x007fa360u;
static constexpr uint32_t ISAAC_ROOM_GRID_A2A0_CALLER_COUNT = 4u;
static constexpr uint32_t ISAAC_ROOM_GRID_A2A0_CALLER_FIRST = 0x007fd351u;
static constexpr uint32_t ISAAC_ROOM_GRID_A2A0_CALLER_LAST = 0x007fd6adu;
static constexpr uint32_t ISAAC_ROOM_GRID_CELLOP_CALLER_COUNT = 8u;
static constexpr uint32_t ISAAC_ROOM_GRID_CELLOP_CALLER_FIRST = 0x007fa316u;
static constexpr uint32_t ISAAC_ROOM_GRID_CELLOP_CALLER_LAST = 0x007fd002u;

void isaac_room_grid_a2a0_idx_to_pos(int32_t idx, uint32_t room_w,
                                     IsaacRoomGridA2A0Pos* out);

/* ---- v77 (ABI bump): grid-half body 0x7fa7d0 (first translatable
   frontier after the v76 SEH cell-op 0x7fa360..0x7fa7c1 = record-only
   host). Plain prologue (`push ebp; mov ebp,esp; and esp,0xfffffff8;
   sub esp,0x14`), thiscall receiver = ROOM, ZERO stack args, ret (0)
   @0x7fa91f; no SEH; 4 E8 + 0 indirect. Flow: guard w<0 -> END
   (SIGNED js @0x7fa818); scale pair = f32(w)*0.5f / f32(h)*0.5f
   (cvtdq2ps/mulss, HALF 0.5f @0xbaa2d0 = 0x3f000000, stores @0x7fa7fb/
   0x7fa810); row loop [0..=w] + col loop [0..=h] (SIGNED jle
   INCLUSIVE @0x7fa903/0x7fa913; h<0 -> row loop only); inner gates
   SIGNED row>=0 && row<w && col>=0 && col<h (@0x7fa832..0x7fa84d);
   idx = (u32)(w*col + row) 32-bit wrap (imul @0x7fa853 + lea
   @0x7fa856) — COL-major, TRANSPOSED vs the v75/v76 L1
   (w*row+col); gate (u32)idx <= 0x1bf UNSIGNED (cmp/ja @0x7fa85d,
   reuses v75 isaac_room_grid_index_gate); per-cell: cell =
   grid[idx] ([+0x24+idx*4]) -> HOST 0xaf08b1 (5-arg cdecl lookup,
   args 0/0xc5d7a4/0xc5e8b8/0, ret ptr) -> HOST
   Room::GetGridCollision 0x7f0800 (thiscall, arg idx, callee-clean)
   -> PURE dist2 = (scale_x - f32(row))^2 + (scale_y - f32(col))^2
   (subss/mulss/addss f32-exact @0x7fa897..0x7fa8c3) -> R2 = 2 *
   u32trunc(dist2) (helper 0xaefca0: [0xc7162c] quality >= 6 ->
   vcvttss2usi, else manual fallback; add eax,eax @0x7fa8cf) ->
   PURE store (ent->[0xc]==0 gate; R2 != 0 -> [0x18]=R2, [0xc]=1;
   R2 == 0 -> [0xc]=2 + HOST 0x714610 thiscall). Callers: 1 direct
   rel32 = 0x7fbd16 (`mov ecx,esi; call`, inside the same
   room-type dispatch band 0x7fbcf0..0x7fd759); NO push-immediate/
   dword registration (zero pointer refs). Next 0x7fa920 = /GS
   SEH function (not this unit). NOTES: room-v77-7fa7d0. */
static constexpr uint32_t ISAAC_ROOM_GRID_HALF_VA = 0x007fa7d0u;
static constexpr uint32_t ISAAC_ROOM_GRID_HALF_SCALE_X_VA = 0x007fa7f3u; /* mulss [0xbaa2d0] */
static constexpr uint32_t ISAAC_ROOM_GRID_HALF_SCALE_X_STORE_VA = 0x007fa7fbu;
static constexpr uint32_t ISAAC_ROOM_GRID_HALF_SCALE_Y_VA = 0x007fa808u;
static constexpr uint32_t ISAAC_ROOM_GRID_HALF_SCALE_Y_STORE_VA = 0x007fa810u;
static constexpr uint32_t ISAAC_ROOM_GRID_HALF_W_NEG_GATE_VA = 0x007fa818u; /* js END */
static constexpr uint32_t ISAAC_ROOM_GRID_HALF_H_NEG_GATE_VA = 0x007fa824u; /* js INC_ROW */
static constexpr uint32_t ISAAC_ROOM_GRID_HALF_ROW_GE_W_VA = 0x007fa83du; /* jge SIGNED */
static constexpr uint32_t ISAAC_ROOM_GRID_HALF_COL_GE_H_VA = 0x007fa84du; /* jge SIGNED */
static constexpr uint32_t ISAAC_ROOM_GRID_HALF_IDX_IMUL_VA = 0x007fa853u; /* imul w*col wrap */
static constexpr uint32_t ISAAC_ROOM_GRID_HALF_IDX_LEA_VA = 0x007fa856u; /* lea +row */
static constexpr uint32_t ISAAC_ROOM_GRID_HALF_IDX_GATE_VA = 0x007fa85du; /* cmp 0x1bf / ja UNSIGNED */
static constexpr uint32_t ISAAC_ROOM_GRID_HALF_LOOKUP_VA = 0x007fa87bu; /* HOST 0xaf08b1 */
static constexpr uint32_t ISAAC_ROOM_GRID_HALF_COLLIDE_VA = 0x007fa88eu; /* HOST 0x7f0800 */
static constexpr uint32_t ISAAC_ROOM_GRID_HALF_DIST2_HEAD_VA = 0x007fa897u; /* movd row */
static constexpr uint32_t ISAAC_ROOM_GRID_HALF_DIST2_SUB_X_VA = 0x007fa8b3u; /* subss scale_x,row */
static constexpr uint32_t ISAAC_ROOM_GRID_HALF_DIST2_SUB_Y_VA = 0x007fa8b7u; /* subss scale_y,col */
static constexpr uint32_t ISAAC_ROOM_GRID_HALF_DIST2_ADD_VA = 0x007fa8c3u; /* addss */
static constexpr uint32_t ISAAC_ROOM_GRID_HALF_CONV_VA = 0x007fa8cau; /* 0xaefca0 u32 trunc */
static constexpr uint32_t ISAAC_ROOM_GRID_HALF_DOUBLE_VA = 0x007fa8cfu; /* add eax,eax */
static constexpr uint32_t ISAAC_ROOM_GRID_HALF_STORE_GATE_VA = 0x007fa8d1u; /* cmp [ent+0xc],0 */
static constexpr uint32_t ISAAC_ROOM_GRID_HALF_STORE_R2_VA = 0x007fa8dbu; /* [ent+0x18]=R2 */
static constexpr uint32_t ISAAC_ROOM_GRID_HALF_STORE_C1_VA = 0x007fa8deu; /* [ent+0xc]=1 */
static constexpr uint32_t ISAAC_ROOM_GRID_HALF_STORE_C2_VA = 0x007fa8e9u; /* [ent+0xc]=2 */
static constexpr uint32_t ISAAC_ROOM_GRID_HALF_HOST_714610_VA = 0x007fa8f0u; /* HOST 0x714610 */
static constexpr uint32_t ISAAC_ROOM_GRID_HALF_NEXT_VA = 0x007fa920u; /* v78 census (RNG picker, host) */
static constexpr uint32_t ISAAC_ROOM_GRID_HALF_RET_VA = 0x007fa91fu; /* ret */
static constexpr uint32_t ISAAC_ROOM_GRID_HALF_END_VA = 0x007fa920u;
static constexpr uint32_t ISAAC_ROOM_GRID_HALF_CALLER_COUNT = 1u;
static constexpr uint32_t ISAAC_ROOM_GRID_HALF_CALLER = 0x007fbd16u;
static constexpr uint32_t ISAAC_ROOM_GRID_HALF_CONV_VA_HELPER = 0x00aefca0u;
static constexpr uint32_t ISAAC_ROOM_GRID_HALF_QUALITY_GLOBAL = 0x00c7162cu;
static constexpr uint32_t ISAAC_ROOM_GRID_HALF_QUALITY_SSE41 = 6u;
static constexpr uint32_t ISAAC_ROOM_GRID_HALF_LOOKUP_VA_HOST = 0x00af08b1u;
static constexpr uint32_t ISAAC_ROOM_GRID_HALF_COLLIDE_VA_HOST = 0x007f0800u;
static constexpr uint32_t ISAAC_ROOM_GRID_HALF_714610_HOST_VA = 0x00714610u;
static constexpr uint32_t ISAAC_ROOM_GRID_HALF_LOOKUP_ARG0 = 0x00c5d7a4u;
static constexpr uint32_t ISAAC_ROOM_GRID_HALF_LOOKUP_ARG1 = 0x00c5e8b8u;
static constexpr uint32_t ISAAC_ROOM_GRID_HALF_LOOKUP_TABLE_VA = 0x00b1a424u;
static constexpr uint32_t ISAAC_ROOM_GRID_HALF_LOOKUP_TABLE_BITS = 0x00b1a424u;
static constexpr uint32_t ISAAC_ROOM_GRID_HALF_HALF_BITS = 0x3f000000u; /* 0.5f @0xbaa2d0 */
static constexpr uint32_t ISAAC_ROOM_GRID_HALF_IDX_MAX = 0x1bfu;

void isaac_room_grid_half_scale(uint32_t w, uint32_t h,
                                IsaacRoomGridHalfScale* out);
uint32_t isaac_room_grid_half_idx(uint32_t w, uint32_t col, uint32_t row);
uint32_t isaac_room_grid_half_dist2(uint32_t scale_x_bits,
                                    uint32_t scale_y_bits, uint32_t col,
                                    uint32_t row, uint32_t quality);
uint32_t isaac_room_grid_half_cell_store(uint32_t* ent_field_c,
                                         uint32_t* ent_field_18,
                                         uint32_t r2);
uint32_t isaac_room_grid_half_cell_action(uint32_t ent_field_c,
                                          uint32_t r2);

/* ---- v78: CENSUS rows (NO laws, ABI stays 77). The v77 handoff's next
   body 0x7fa920 (/GS-cookie — NOT SEH: no fs:[0] frame; the v77
   "/GS SEH fn" label corrected) = xorshift-parameterized RNG picker
   0x7fa920..0x7fb218 (ret 8 @0x7fb15b/0x7fb208 + tail epilogue
   0x7fb20b..0x7fb218; arg0 = [ebp+8] ptr to 16-byte xorshift state
   {x,a,b,c} @+0/+4/+8/+c, arg1 = [ebp+0xc] byte flag; ecx unused —
   NOT thiscall). 32 E8, all HOST (0xa112c0 x13, 0x9be080 x5,
   0x44bfb0 x5, 0x7e9020 x2, 0x771550 x2, 0xaef12b x2, 0x9be6b0,
   0x9bea80, 0x7cb6e0): seed pulls Game+0x1baa8, entity-list walk
   Game[0x1baa8..0x1baac], float clamp chains, assert/alloc path —
   ZERO pure islands (the inline xorshift32 step repeats 10x but is
   NEVER a standalone callee). Callers: 2 direct rel32 = 0x7fb4a6
   (inside the dispatch master; push 0 + &[ebp-0xac]) + 0x827720
   (inside 0x8276e0; push 1 + &[ebp-0x30], retry loop cmp 0xa);
   lea-corrected: both lea'd LOCAL buffers, ret 8 = 2 pushed dwords,
   no convention correction. ZERO dword refs. NOTES: room-v78-7fa920. */
static constexpr uint32_t ISAAC_ROOM_RNG_PICK_7FA920_VA = 0x007fa920u;
static constexpr uint32_t ISAAC_ROOM_RNG_PICK_7FA920_GS_BLOB_VA = 0x00bf93b4u;
static constexpr uint32_t ISAAC_ROOM_RNG_PICK_7FA920_STATE_OFF_X = 0x0u;
static constexpr uint32_t ISAAC_ROOM_RNG_PICK_7FA920_STATE_OFF_A = 0x4u;
static constexpr uint32_t ISAAC_ROOM_RNG_PICK_7FA920_STATE_OFF_B = 0x8u;
static constexpr uint32_t ISAAC_ROOM_RNG_PICK_7FA920_STATE_OFF_C = 0xcu;
static constexpr uint32_t ISAAC_ROOM_RNG_PICK_7FA920_RET_VA = 0x007fb15bu; /* ret 8 */
static constexpr uint32_t ISAAC_ROOM_RNG_PICK_7FA920_RET2_VA = 0x007fb208u; /* ret 8 */
static constexpr uint32_t ISAAC_ROOM_RNG_PICK_7FA920_END_VA = 0x007fb218u; /* tail ret 8 */
static constexpr uint32_t ISAAC_ROOM_RNG_PICK_7FA920_SWITCH_BYTE_TBL_VA = 0x007fb238u;
static constexpr uint32_t ISAAC_ROOM_RNG_PICK_7FA920_SWITCH_DWORD_TBL_VA = 0x007fb220u;
static constexpr uint32_t ISAAC_ROOM_RNG_PICK_7FA920_COOKIE_CHECK_VA = 0x00aef12bu;
static constexpr uint32_t ISAAC_ROOM_RNG_PICK_7FA920_ASSERT_VA = 0x00a112c0u;
static constexpr uint32_t ISAAC_ROOM_RNG_PICK_7FA920_F32_SCALE_VA = 0x00ba9ff0u; /* 0x2f7ffffe (vs v60 0x2f800000@0xba9ff4) */
static constexpr uint32_t ISAAC_ROOM_RNG_PICK_7FA920_U32F32_TBL_VA = 0x00bacb00u;
static constexpr uint32_t ISAAC_ROOM_RNG_PICK_7FA920_CALLER_COUNT = 2u;
static constexpr uint32_t ISAAC_ROOM_RNG_PICK_7FA920_CALLER_A = 0x007fb4a6u;
static constexpr uint32_t ISAAC_ROOM_RNG_PICK_7FA920_CALLER_B = 0x00827720u;
static constexpr uint32_t ISAAC_ROOM_RNG_PICK_7FA920_CALLER_B_FN = 0x008276e0u;

/* v78 — next band body 0x7fb254 = REAL SEH thiscall room-type dispatch
   master 0x7fb254..0x7fe0b3 (handler 0xb013bd + /GS; single exit =
   shared SEH epilogue 0x7fe084..0x7fe0b3 with `ret` @0x7fe0b3; jump
   tables @0x7fe0b4/0x7fe0f8 hold the v77 caller 0x7fbd16 + 0x7fbd1d).
   346 E8 + 2 indirect ([eax+0x3c] @0x7fdfc8 / [eax+0xc] @0x7fdfcf);
   all HOST except the family laws it CONSUMES (0x428b20 v54 x25,
   0x7fa2a0 v76 x4, 0x7fa7d0 v77 x1, 0x7fa360 host-record x7,
   0x7fa920 v78 census x1); genrand 0x6eef60 x15, 0x7f9ee0 x20,
   0x7e90f0 x26, 0x7e9020 x12, 0x929a20 x27, 0x929b40 x12,
   0x95a7b0 x12, 0x813520 x9, 0xaf08b1 x8, 0x732d00 x8,
   0x733ff0 x8, 0x706940 x7, 0x7ebca0 x7, 0x812c90 x7, ...;
   entity stores only inside host decision flows.
   Callers: 0 rel32 + 0 dword refs — reached via pointer ONLY.
   Next frontier 0x7fe220 = another SEH body (not opened). */
static constexpr uint32_t ISAAC_ROOM_DISPATCH_7FB254_VA = 0x007fb254u;
static constexpr uint32_t ISAAC_ROOM_DISPATCH_7FB254_RET_VA = 0x007fe0b3u;
static constexpr uint32_t ISAAC_ROOM_DISPATCH_7FB254_EPILOGUE_VA = 0x007fe084u;
static constexpr uint32_t ISAAC_ROOM_DISPATCH_7FB254_TABLE_A_VA = 0x007fe0b4u;
static constexpr uint32_t ISAAC_ROOM_DISPATCH_7FB254_TABLE_B_VA = 0x007fe0f8u;
static constexpr uint32_t ISAAC_ROOM_DISPATCH_7FB254_NEXT_VA = 0x007fe220u;

/* v79 — band frontier 0x7fe220 = REAL SEH thiscall grid-spawn picker
   0x7fe220..0x7febf7 (handler 0xb01417 pushed / fs:[0] installed
   @0x7fe242 / restored @0x7febe9; /GS cookie [0xbf93b4]^ebp pushed
   @[ebp-0x1c], POPPED WITHOUT a check call — the check lives in the
   handler: nop;nop;mov edx,[esp+8];lea eax,[edx+0xc];mov
   ecx,[edx-0x5c];xor ecx,eax;call 0xaef12b;mov eax,0xbc1fe0;jmp
   0xaf05c7). Single `ret` (0) @0x7febf7 — pure thiscall, ZERO stack
   args. 29 E8 + 4 indirect ([edx+0xc] @0x7fe47f on the v54 relay
   result, [eax] @0x7feb43 on the old grid cell, [eax+0x20] @0x7feb6a
   on the new cell, [0xb18894] IAT free @0x7febb8). Family-owned
   callee: 0x428b20 v54 x1 @0x7fe476. Host: 0xa0f4c0 x2 (0x14/0x19c
   alloc), 0x4e45c0 x1, 0xa112c0 x10 (0xb6bf54 seed-null x6,
   0xb7e6bc, 0xb6aa08, 0xb6c138), 0x6eef60 x1, 0x703850 x1,
   0x42c880 x1 (vec ctor), 0x42c920 x1 (vec grow), 0x4288a0 x1,
   0x9be080 x2, 0x9be7f0 x1, 0x771550 x2, 0xaf08bd x1 (memmove),
   0x709c40 x1 (obj ctor), 0x424540 x1 (dtor), 0xaef15c x2 (free);
   the UNSIGNED-ja area guard @0x7fe4ae jumps to the fail stub
   0x7febf8 (`call 0x415bc0; int3 x3`; 0x415bc0 = push 0xb1b634 /
   call [0xb184d4] / int3 range-check stub). Body: entity walk
   (Room+0x125c/+0x1264, type +0x28, Game+0x26614 — B18 offsets) +
   shape-gated grid walk (dword [Room+4->+0x10->+0x48] switch
   0xb/0xc/9/0xa/2/7/3/5, w/h>>1 SIGNED compares, default
   candidate) collecting indices (v75 pos->idx reuse @0x7fe2e4 +
   0x1bf index gate @0x7fe755 + cost 0x384 @[grid+0x76c] gate
   @0x7fea17) into a vec, then RNG-pick (45-slot 16-byte xorshift
   state list tail pick @0x7fe3ce base+min_u32(n-1,0x2d)*16; inline
   xorshift32 steps x6 — embedded, NOT laws) and spawn: alloc/ctor
   0x709c40, pure field pack @0x7fea4d..0x7feae2 ([esi]=0xb68648
   vtable, type 0xe, idx, pos-vec 0xc7b640/0xc7b644 pair x2), grid
   install @0x7feb48, [Room+0x11f4] byte set @0x7fe7b3/0x7fe7d5
   (cleared @0x7fe24f). ALL pure islands sit AFTER the handler
   install — SEH band rule (cf. 0x7fa360 v76, 0x7fb254 v78) => HOST
   census row, nothing translatable. Callers: 1 direct rel32 =
   0x00803e05 INSIDE the family's own FrameOpaque_802980 host body
   (0x802980; `cmp byte ptr [edi+0x11f4],0; je 0x803e0a; mov
   ecx,edi; call 0x7fe220` — byte gate already modeled by
   isaac_room_b9b11_flag_11f4_needs_host). ZERO dword refs.
   identify-zhl exactMatches [] (all catalogs). Next frontier
   0x7fec00 = /GS-ONLY thiscall (NOT SEH; 1 stack arg). NOTE:
   ROOM_SPAWN_428B20 (v54) and ROOM_GRID_* (v75/v77) laws stay. */
static constexpr uint32_t ISAAC_ROOM_GRID_SPAWN_7FE220_VA = 0x007fe220u;
static constexpr uint32_t ISAAC_ROOM_GRID_SPAWN_7FE220_RET_VA = 0x007febf7u; /* ret 0 */
static constexpr uint32_t ISAAC_ROOM_GRID_SPAWN_7FE220_END_VA = 0x007febf8u;
static constexpr uint32_t ISAAC_ROOM_GRID_SPAWN_7FE220_FAIL_STUB_VA = 0x007febf8u;
static constexpr uint32_t ISAAC_ROOM_GRID_SPAWN_7FE220_NEXT_VA = 0x007fec00u;
static constexpr uint32_t ISAAC_ROOM_GRID_SPAWN_7FE220_HANDLER_VA = 0x00b01417u;
static constexpr uint32_t ISAAC_ROOM_GRID_SPAWN_7FE220_INSTALL_VA = 0x007fe242u;
static constexpr uint32_t ISAAC_ROOM_GRID_SPAWN_7FE220_RESTORE_VA = 0x007febe9u;
static constexpr uint32_t ISAAC_ROOM_GRID_SPAWN_7FE220_COOKIE_BLOB_VA = 0x00bf93b4u;
static constexpr uint32_t ISAAC_ROOM_GRID_SPAWN_7FE220_COOKIE_CHECK_VA = 0x00aef12bu;
static constexpr uint32_t ISAAC_ROOM_GRID_SPAWN_7FE220_CXXF_HANDLER_VA = 0x00bc1fe0u;
static constexpr uint32_t ISAAC_ROOM_GRID_SPAWN_7FE220_FAIL_HOST_VA = 0x00415bc0u;
static constexpr uint32_t ISAAC_ROOM_GRID_SPAWN_7FE220_FAIL_STRING_VA = 0x00b1b634u;
static constexpr uint32_t ISAAC_ROOM_GRID_SPAWN_7FE220_GAME_GLOBAL = 0x00c71678u;
static constexpr uint32_t ISAAC_ROOM_GRID_SPAWN_7FE220_OBJ_GLOBAL = 0x00c7169cu;
static constexpr uint32_t ISAAC_ROOM_GRID_SPAWN_7FE220_GRID_OFF = 0x18300u;
static constexpr uint32_t ISAAC_ROOM_GRID_SPAWN_7FE220_POS_VEC_VA = 0x00c7b640u;
static constexpr uint32_t ISAAC_ROOM_GRID_SPAWN_7FE220_CELL_VTABLE_VA = 0x00b68648u;
static constexpr uint32_t ISAAC_ROOM_GRID_SPAWN_7FE220_ALLOC_A = 0x14u;
static constexpr uint32_t ISAAC_ROOM_GRID_SPAWN_7FE220_ALLOC_B = 0x19cu;
static constexpr uint32_t ISAAC_ROOM_GRID_SPAWN_7FE220_VEC_WORD_FLAGS = 0x101u;
static constexpr uint32_t ISAAC_ROOM_GRID_SPAWN_7FE220_GRID_COST_OFF = 0x76cu;
static constexpr uint32_t ISAAC_ROOM_GRID_SPAWN_7FE220_GRID_COST_VALUE = 0x384u;
static constexpr uint32_t ISAAC_ROOM_GRID_SPAWN_7FE220_SLOT_LIST_BASE_OFF = 0x1794u;
static constexpr uint32_t ISAAC_ROOM_GRID_SPAWN_7FE220_SLOT_LIST_END_OFF = 0x1798u;
static constexpr uint32_t ISAAC_ROOM_GRID_SPAWN_7FE220_SLOT_STRIDE = 0x10u;
static constexpr int32_t ISAAC_ROOM_GRID_SPAWN_7FE220_SLOT_CAP = 0x2d;
static constexpr uint32_t ISAAC_ROOM_GRID_SPAWN_7FE220_CELL_TYPE = 0xeu;
static constexpr uint32_t ISAAC_ROOM_GRID_SPAWN_7FE220_CELL_FLAGS_16C = 0xfu;
static constexpr uint32_t ISAAC_ROOM_GRID_SPAWN_7FE220_CALLER_COUNT = 1u;
static constexpr uint32_t ISAAC_ROOM_GRID_SPAWN_7FE220_CALLER_A = 0x00803e05u;
static constexpr uint32_t ISAAC_ROOM_GRID_SPAWN_7FE220_CALLER_A_FN = 0x00802980u; /* FrameOpaque_802980 */
static constexpr uint32_t ISAAC_ROOM_GRID_SPAWN_7FE220_CALLER_A_GATE_OFF = 0x11f4u; /* byte gate */
static constexpr uint32_t ISAAC_ROOM_GRID_SPAWN_7FE220_GENRAND_VA = 0x006eef60u;
static constexpr uint32_t ISAAC_ROOM_GRID_SPAWN_7FE220_RELAY_428B20_VA = 0x00428b20u; /* v54 */
static constexpr uint32_t ISAAC_ROOM_GRID_SPAWN_7FE220_SITE_428B20 = 0x007fe476u;
static constexpr uint32_t ISAAC_ROOM_GRID_SPAWN_7FE220_MAGIC_4B18967F = 0x4b18967fu;
static constexpr uint32_t ISAAC_ROOM_GRID_SPAWN_7FE220_MAGIC_SITE = 0x007fe438u;

/* v78 — wave-27 callback-chain (0x86c6c4) lease-row re-verification:
   all 45 rows re-decoded byte-exact (uniform `68 <body> 68 <name>
   8b c8 e8 <helper>`, ZERO jXX/ret/int3 — no row-selection gates, no
   &0xff byte gates, no uint8_t); every helper is a HOST Lua binder
   (generic 0x890e70/0x890ed0/0x890f30/0x88fdb0/0x8906f0/0x88fd10/
   0x890110/0x890b50/0x88fe10/0x890790/0x891230 or closure
   0x890e10=0x816000/0x890f90=0x820170/0x890ff0=0x7ec080/0x891050=
   0x4566f0/0x8910b0=0x81e6e0/0x891110=0x81e9d0/0x891170=0x81ecc0/
   0x8911d0=0x820910/0x891290=0x820c00). ZERO rows translatable; the
   lease rows 0x86c6f7 (0x7f9960 v73) + 0x86c708 (0x7f9df0 v74) +
   0x86c719 (0x820170 FE v23) + 0x86c72a (0x8204b0 FE v24) still
   call generic binders — rows are host registration, bodies never
   peeled through the row. No new constants (v76 pins stand). */

/* ---- v80 (ABI bump): Room::Update(Entity*) pure prefix 0x7fec00..0x7fecbd
   (body 0x7fec00..0x80044f, ret 4 @0x80044f, /GS-ONLY thiscall: cookie
   [0xbf93b4]^ebp pushed @0x7fec09, checked via 0xaef12b in the single
   epilogue 0x80043f..0x80044f; ONE stack arg = entity. Census
   (lea-corrected): 10 direct rel32 callers 0x44056b..0x707aa9, every site
   `push <entity>; mov ecx,[Game+0x18300]` — no lea args, ret 4 == 1 pushed
   dword. identify-zhl: no match. First host call = assert 0xa112c0
   @0x7fecc2; pure prefix = 0x7fec00..0x7fecbd. Landed laws:
   (A) roomUpdateEntitySkipGate 0x7fec21..0x7fec9b — skip =
   (type==0x19b && (sub==1 || sub==2)) || (flags&0x80100000)!=0 ||
   (flags&0x20000000)!=0; flags |= 0x100000 is STORED BEFORE the
   0x20000000 test (PE order 0x7fec81..0x7fec9b: or ecx,0x100000;
   mov [ebx+0x168],ecx; and ecx,0x20000000; jne) — a 0x20000000 skip
   DOES store. The [ebx+0x16c] re-store @0x7fec87 is a no-op
   reload-store (not modeled). FULL dword cmps; no byte gates.
   (B) roomUpdateDietFlag 0x7fec42..0x7fec64 — diet =
   (Game[0x269c8] in {2,3}) && Room[8]==1 (byte local [ebp-0x1d],
   consumed at 0x7ff1d8/0x7ff861); FULL dword cmps; result modeled
   uint32_t 0/1. NOTES: room-v81-7fec00. */
static constexpr uint32_t ISAAC_ROOM_UPDATE_7FEC00_VA = 0x007fec00u;
static constexpr uint32_t ISAAC_ROOM_UPDATE_7FEC00_RET_VA = 0x0080044fu; /* ret 4 */
static constexpr uint32_t ISAAC_ROOM_UPDATE_7FEC00_END_VA = 0x00800452u; /* after ret; jmptbls 0x800454/0x8004c0 */
static constexpr uint32_t ISAAC_ROOM_UPDATE_7FEC00_NEXT_VA = 0x00800460u; /* frontier band (next body search) */
static constexpr uint32_t ISAAC_ROOM_UPDATE_7FEC00_SKIP_GATE_VA = 0x007fec21u; /* cmp [ent+0x28],0x19b */
static constexpr uint32_t ISAAC_ROOM_UPDATE_7FEC00_DIET_HEAD_VA = 0x007fec42u; /* Game[0x269c8] mode test */
static constexpr uint32_t ISAAC_ROOM_UPDATE_7FEC00_FLAG_GATE_VA = 0x007fec65u; /* flags dword reload */
static constexpr uint32_t ISAAC_ROOM_UPDATE_7FEC00_FLAG_STORE_VA = 0x007fec8du; /* [ent+0x168] store */
static constexpr uint32_t ISAAC_ROOM_UPDATE_7FEC00_FLAG_B_TEST_VA = 0x007fec93u; /* POST-store and 0x20000000 */
static constexpr uint32_t ISAAC_ROOM_UPDATE_7FEC00_EPILOGUE_VA = 0x0080043fu; /* cookie-check start */
static constexpr uint32_t ISAAC_ROOM_UPDATE_7FEC00_COOKIE_BLOB_VA = 0x00bf93b4u;
static constexpr uint32_t ISAAC_ROOM_UPDATE_7FEC00_COOKIE_CHECK_VA = 0x00aef12bu;
static constexpr uint32_t ISAAC_ROOM_UPDATE_7FEC00_ASSERT_VA = 0x00a112c0u; /* first host call @0x7fecc2 */
static constexpr uint32_t ISAAC_ROOM_UPDATE_7FEC00_GAME_GLOBAL = 0x00c71678u;
static constexpr uint32_t ISAAC_ROOM_UPDATE_7FEC00_GAME_269C8_OFF = 0x269c8u;
static constexpr int32_t ISAAC_ROOM_UPDATE_7FEC00_GAME_269C8_GREED = 2;
static constexpr int32_t ISAAC_ROOM_UPDATE_7FEC00_GAME_269C8_GREEDIER = 3;
static constexpr uint32_t ISAAC_ROOM_UPDATE_7FEC00_ENT_TYPE_OFF = 0x28u;
static constexpr uint32_t ISAAC_ROOM_UPDATE_7FEC00_ENT_SUB_OFF = 0x2cu;
static constexpr uint32_t ISAAC_ROOM_UPDATE_7FEC00_ROOM_TYPE_OFF = 0x8u;
static constexpr uint32_t ISAAC_ROOM_UPDATE_7FEC00_ENT_FLAGS_OFF = 0x168u;
static constexpr uint32_t ISAAC_ROOM_UPDATE_7FEC00_ENT_FLAGS2_OFF = 0x16cu; /* no-op re-store @0x7fec87 */
static constexpr uint32_t ISAAC_ROOM_UPDATE_7FEC00_DIET_LOCAL_OFF = 0x1du; /* [ebp-0x1d] byte local */
static constexpr int32_t ISAAC_ROOM_UPDATE_7FEC00_SKIP_TYPE = 0x19b;
static constexpr int32_t ISAAC_ROOM_UPDATE_7FEC00_SKIP_SUB_A = 1;
static constexpr int32_t ISAAC_ROOM_UPDATE_7FEC00_SKIP_SUB_B = 2;
static constexpr uint32_t ISAAC_ROOM_UPDATE_7FEC00_FLAG_SKIP_A = 0x80100000u; /* and @0x7fec73 */
static constexpr uint32_t ISAAC_ROOM_UPDATE_7FEC00_FLAG_SKIP_B = 0x20000000u; /* and @0x7fec93 */
static constexpr uint32_t ISAAC_ROOM_UPDATE_7FEC00_FLAG_SET = 0x100000u; /* or @0x7fec81 */
static constexpr int32_t ISAAC_ROOM_UPDATE_7FEC00_DIET_ROOM_TYPE = 1;
static constexpr uint32_t ISAAC_ROOM_UPDATE_7FEC00_CALLER_COUNT = 10u;
static constexpr uint32_t ISAAC_ROOM_UPDATE_7FEC00_CALLER_FIRST = 0x0044056bu;
static constexpr uint32_t ISAAC_ROOM_UPDATE_7FEC00_CALLER_LAST = 0x00707aa9u;

uint32_t isaac_room_update_entity_skip_gate(uint32_t type_28, uint32_t subtype_2c,
                                            uint32_t* flags_168);
uint32_t isaac_room_update_diet_flag(uint32_t game_269c8, uint32_t room_type_8);

/* ---- v81 (ABI bump 78 -> 79): two units in one ABI.

   UNIT A — FUN_007f7a40 a1 TAIL (PE 0x7f7e34..0x7f817c, inside the
   v67a body; record-26 roomTriggerClearAudioNonGreed). The v67a
   gates/fail exports landed every decision up to the tail gate
   (tail_fire / tail_loop_count); THIS unit lands the tail's pure math
   as typed plans. Per-iteration shape (loop head 0x7f7f30, count =
   (genrand&3)+5, edi countdown @0x7f8169):
   7 genrand draws per iteration: r_a(0x7f7f30, echoed into the spawn
   arg pack), r_b(f1 0x7f7f37), r_c(magnitude 0x7f7f61),
   r_d(height angle 0x7f7fd8), r_e(speed 0x7f800e), r_f(threshold
   0x7f80b5), r_g(timer 0x7f8145). Host leaves stay typed:
   0x67f1d0 vec lookup (this=&xorshift-state local [ebp-0x38]!),
   cos 0x41d540 / sin 0x41d520 on the FIXED angle [0xbaa54c]
   (= +1.5707963705062866 f32, pi/2) and on h = 2*(u(r_d)*2^-32*pi),
   genrand 0x6eef60, spawn relay 0x428b20 (v54 family law callee),
   args {0x3e8, 0x3b, &pos[ebp-0x38], &vel[ebp-0x30], 0, 0, r_a},
   this=Game), item readback [ent+0x33c]/[ent+0x340], virtual
   [vtbl+0xc] @0x7f8166. PURE laws landed here:
   ROT   (0x7f7e55..0x7f7ec8): a = -[r67f1d0+0] b = -[r67f1d0+4]
         (xorps sign-mask 0xbacb70 bit flip); c = cos(angle),
         s = sin(angle) fed back as host results;
         r0 = f32(f32(a*c) - f32(b*s)); r1 = f32(f32(a*s) + f32(b*c)).
   BASE  (0x7f7eec..0x7f7f21): q:rem = SIGNED idiv([door+0x24],
         [[Game]+0xc]) (cdq;idiv — game_c==0 faults: never invented);
         y = f32(f32((float)rem * 40.0f) + 40.0f)  ([0xbaa904]);
         x = f32(f32((float)q   * 40.0f) + 120.0f) ([0xbaaa00]).
   ITEM  (0x7f7f30..0x7f816c per iteration):
         f1 = u32ToF32(r_b) * 2^-32                       [ebp-0x24]
         m  = f32(f32(u32ToF32(r_c)*2^-32) * 2) - 1.0f    (addss self)
         vel_x = f32(f32(f1*5.0f*a) + f32(r0*m))          [ebp-0x30]
         vel_y = f32(f32(f1*5.0f*b) + f32(r1*m))          [ebp-0x2c]
         hpre = u32ToF32(r_d)*2^-32*3.14f ; h = hpre+hpre (addss self)
         speed = u32ToF32(r_e)*2^-32                      [ebp-0x14]
         pos_y = base_y + f32(f32(cos_h*speed)*20.0f)     [ebp-0x38]
         pos_x = base_x + f32(f32(sin_h*speed)*20.0f)     [ebp-0x34]
         d2 = f32(f32(px-base_y)*a) + f32(f32(py-base_x)*b)
        sel = comiss(0.0f, d2) above -> (d2 < 0) && !NaN(d2)
        thr' = f32(thr * (float)sel)
        f474 = (thr' == +-0.0f) ? +1.0f : -1.0f
              (lahf/test ah,0x44/jnp @0x7f8122..29; jnp taken loads
               [0xbaa454] = +1.0f @0x7f8135, fall-through loads
               [0xbaad50] = -1.0f @0x7f812b. Flags: ordered-nonzero
               -> ah&0x44==0 -> parity even -> fall -> -1; equal
               -> ah=0x42 -> parity odd -> jnp taken -> +1;
               unordered -> ah=0x46 -> parity even -> fall -> -1.
               Net: ONLY exact +-0 selects +1.0f; NaN -> -1.0f.)
         timer = (r_g % 10u UNSIGNED div) + 0x1e -> [ent+0x45c] AND
               [ent+0x460] (same value both).

   UNIT B — greed-probe band 0x009bf990/0x009bfa00/0x009bfa70 +
   fire plan 0x009bfae0 (record-30 roomTriggerClearAwardsGreed
   blockers). Receiver = entity-list pair {begin,end} at Game+0x1baa8;
   element stride 4 (sar 2). Shared qualifying predicate (the three
   bodies byte-diff to one template):
     qual(e) = [e+0x2c]==0 && [e+0x3bc]==0 &&
       !([e+0x1e68]!=0 && [parent+0x161c]!=-1 &&
         [parent+0x161c] < [e+0x161c] (SIGNED jl) && parent != e)
   0x009bf990 probe: gate `cmp ebx,1 / ja` on the UNSIGNED element
   count (count<=1 -> al=0); returns seta(count_qual > 1).
   0x009bfa00: no gate, returns COUNT of qual(e) && byte[e+0x20a9]==0.
   0x009bfa70: mirror returning COUNT of qual(e) && byte[e+0x20a9]!=0.
   0x009bfae0 fire: void walk, loop bound RE-DERIVED from [this+4]-
   [this] EVERY iteration (defect-class guard: not folded once);
   fires HOST 0x7d93b0(this=e) for every e with byte[e+0x20a9]!=0.
   The call itself stays typed-host; WHICH elements and how many are
   pure and emitted as a plan (mask covers first 32 elements). */

static constexpr uint32_t ISAAC_ROOM_TCA40_TAIL_VA = 0x007f7e34u;
static constexpr uint32_t ISAAC_ROOM_TCA40_TAIL_LOOP_HEAD_VA = 0x007f7f30u;
static constexpr uint32_t ISAAC_ROOM_TCA40_ANGLE_BITS_VA = 0x00baa54cu;
static constexpr uint32_t ISAAC_ROOM_TCA40_SIGN_MASK_BITS = 0x80000000u;
static constexpr uint32_t ISAAC_ROOM_TCA40_ANGLE_F32_BITS = 0x3fc90fdbu;
static constexpr uint32_t ISAAC_ROOM_TCA40_SCALE_POW2M32_VA = 0x00ba9ff4u;
static constexpr uint32_t ISAAC_ROOM_TCA40_SCALE_POW2M32_BITS = 0x2f800000u;
static constexpr uint32_t ISAAC_ROOM_TCA40_ONE_VA = 0x00baa454u;
static constexpr uint32_t ISAAC_ROOM_TCA40_ONE_BITS = 0x3f800000u;
static constexpr uint32_t ISAAC_ROOM_TCA40_TWO_VA = 0x00baa630u;
static constexpr uint32_t ISAAC_ROOM_TCA40_TWO_BITS = 0x40000000u;
static constexpr uint32_t ISAAC_ROOM_TCA40_VOL_MUL_VA = 0x00baa784u;
static constexpr uint32_t ISAAC_ROOM_TCA40_VOL_MUL_BITS = 0x40a00000u;
static constexpr uint32_t ISAAC_ROOM_TCA40_PITCH_MUL_VA = 0x00baa704u;
static constexpr uint32_t ISAAC_ROOM_TCA40_PITCH_MUL_BITS = 0x4048f5c3u;
static constexpr uint32_t ISAAC_ROOM_TCA40_THR_MUL_VA = 0x00baa81cu;
static constexpr uint32_t ISAAC_ROOM_TCA40_THR_MUL_BITS = 0x41200000u;
static constexpr uint32_t ISAAC_ROOM_TCA40_SPEED_MUL_VA = 0x00baa87cu;
static constexpr uint32_t ISAAC_ROOM_TCA40_SPEED_MUL_BITS = 0x41a00000u;
static constexpr uint32_t ISAAC_ROOM_TCA40_TILE_VA = 0x00baa904u;
static constexpr uint32_t ISAAC_ROOM_TCA40_TILE_BITS = 0x42200000u;
static constexpr uint32_t ISAAC_ROOM_TCA40_TILE_ADD_VA = 0x00baaa00u;
static constexpr uint32_t ISAAC_ROOM_TCA40_TILE_ADD_BITS = 0x42f00000u;
static constexpr uint32_t ISAAC_ROOM_TCA40_NEG1_VA = 0x00baad50u;
static constexpr uint32_t ISAAC_ROOM_TCA40_NEG1_BITS = 0xbf800000u;
static constexpr uint32_t ISAAC_ROOM_TCA40_SIGN_MASK_VA = 0x00bacb70u;
static constexpr uint32_t ISAAC_ROOM_TCA40_SIGNED_TBL_VA = 0x00bacb00u;
static constexpr uint32_t ISAAC_ROOM_TCA40_HOST_67F1D0_VA = 0x0067f1d0u;
static constexpr uint32_t ISAAC_ROOM_TCA40_HOST_COS_VA = 0x0041d540u;
static constexpr uint32_t ISAAC_ROOM_TCA40_HOST_SIN_VA = 0x0041d520u;
static constexpr uint32_t ISAAC_ROOM_TCA40_HOST_GENRAND_VA = 0x006eef60u;
static constexpr uint32_t ISAAC_ROOM_TCA40_HOST_SPAWN_428B20_VA = 0x00428b20u;
static constexpr uint32_t ISAAC_ROOM_TCA40_CREATE_TYPE = 0x3e8u;
static constexpr uint32_t ISAAC_ROOM_TCA40_CREATE_VARIANT = 0x3bu;
static constexpr uint32_t ISAAC_ROOM_TCA40_ITEM_PX_OFF = 0x33cu;
static constexpr uint32_t ISAAC_ROOM_TCA40_ITEM_PY_OFF = 0x340u;
static constexpr uint32_t ISAAC_ROOM_TCA40_ITEM_F474_OFF = 0x474u;
static constexpr uint32_t ISAAC_ROOM_TCA40_ITEM_TIMER_OFF_A = 0x45cu;
static constexpr uint32_t ISAAC_ROOM_TCA40_ITEM_TIMER_OFF_B = 0x460u;
static constexpr uint32_t ISAAC_ROOM_TCA40_TIMER_BASE = 0x1eu;
static constexpr uint32_t ISAAC_ROOM_TCA40_TIMER_DIV = 0xau;
static constexpr uint32_t ISAAC_ROOM_TCA40_VCALL_OFF = 0xcu;
static constexpr uint32_t ISAAC_ROOM_TCA40_GENRAND_PER_ITER = 7u;

#pragma pack(push, 1)
typedef struct IsaacRoomTca40TailRotOut { /* 8 bytes */
  float r0;   /* [ebp-0x20]: f32(a*c) - f32(b*s) */
  float r1;   /* [ebp-0x28]: f32(a*s) + f32(b*c) */
} IsaacRoomTca40TailRotOut;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomTca40TailRotOut) == 8,
              "IsaacRoomTca40TailRotOut size");

#pragma pack(push, 1)
typedef struct IsaacRoomTca40TailBaseOut { /* 16 bytes */
  uint32_t div_ok; /* 0 when game_c == 0 (PE idiv would fault) */
  float x;         /* [ebp-0x1c]: q*40 + 120 */
  float y;         /* [ebp-0x18]: rem*40 + 40 */
  int32_t quotient;
  int32_t remainder;
} IsaacRoomTca40TailBaseOut;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomTca40TailBaseOut) == 20,
              "IsaacRoomTca40TailBaseOut size");

#pragma pack(push, 1)
typedef struct IsaacRoomTca40TailItemSrc { /* 64 bytes */
  uint32_t r_a;        /* draw 1 (echoed into spawn arg pack) */
  uint32_t r_b;        /* draw 2 -> f1 */
  uint32_t r_c;        /* draw 3 -> magnitude m */
  uint32_t r_d;        /* draw 4 -> height pre-angle */
  uint32_t r_e;        /* draw 5 -> speed */
  uint32_t r_f;        /* draw 6 -> threshold */
  uint32_t r_g;        /* draw 7 -> timer */
  uint32_t a_bits;     /* float bits of a = -vec0 (post-xorps) */
  uint32_t b_bits;     /* float bits of b = -vec4 (post-xorps) */
  uint32_t r0_bits;    /* rot law output (fed back) */
  uint32_t r1_bits;
  uint32_t base_x_bits;/* base law output (fed back) */
  uint32_t base_y_bits;
  uint32_t cos_h_bits; /* HOST cos(h) result fed back */
  uint32_t sin_h_bits; /* HOST sin(h) result fed back */
  uint32_t ent_px_bits;/* [ent+0x33c] readback */
  uint32_t ent_py_bits;/* [ent+0x340] readback */
} IsaacRoomTca40TailItemSrc;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomTca40TailItemSrc) == 68,
              "IsaacRoomTca40TailItemSrc size");

#pragma pack(push, 1)
typedef struct IsaacRoomTca40TailItemOut { /* 88 bytes */
  uint32_t f1_bits;
  uint32_t m_bits;
  uint32_t height_pre_bits;
  uint32_t speed_bits;
  uint32_t vel_x_bits;   /* [ebp-0x30] */
  uint32_t vel_y_bits;   /* [ebp-0x2c] */
  uint32_t pos_x_bits;   /* [ebp-0x34] */
  uint32_t pos_y_bits;   /* [ebp-0x38] */
  uint32_t d2_bits;
  uint32_t thr_bits;     /* before sel multiply */
  uint32_t sel;          /* comiss/seta law */
  uint32_t f474_bits;    /* selected store const for [ent+0x474] */
  uint32_t timer_value;  /* (r_g % 10u) + 0x1e -> f45c AND f460 */
  uint32_t create_type;    /* 0x3e8 */
  uint32_t create_variant; /* 0x3b */
  uint32_t call_428b20_va; /* 0x428b20 (v54 family law callee) */
  uint32_t spawn_arg7;     /* r_a pass-through */
  uint32_t vcall_off;      /* 0xc ([vtbl+0xc] host event) */
  uint32_t timer_off_a;    /* 0x45c */
  uint32_t timer_off_b;    /* 0x460 */
  uint32_t item_px_off;    /* 0x33c */
  uint32_t item_py_off;    /* 0x340 */
} IsaacRoomTca40TailItemOut;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomTca40TailItemOut) == 88,
              "IsaacRoomTca40TailItemOut size");
static_assert(offsetof(IsaacRoomTca40TailItemOut, sel) == 40,
              "IsaacRoomTca40TailItemOut sel offset");

void isaac_room_trigger_clear_audio_7f7a40_tail_rot(
    uint32_t vec0_bits, uint32_t vec4_bits, float cos_angle, float sin_angle,
    IsaacRoomTca40TailRotOut* out);
void isaac_room_trigger_clear_audio_7f7a40_tail_base(
    int32_t door_f24, int32_t game_c, IsaacRoomTca40TailBaseOut* out);
void isaac_room_trigger_clear_audio_7f7a40_tail_item_plan(
    const IsaacRoomTca40TailItemSrc* src, IsaacRoomTca40TailItemOut* out);

/* ---- v81 UNIT B: greed-probe band constants ---- */
static constexpr uint32_t ISAAC_ROOM_GREED_PROBE_9BF990_VA = 0x009bf990u;
static constexpr uint32_t ISAAC_ROOM_GREED_PROBE_9BFA00_VA = 0x009bfa00u;
static constexpr uint32_t ISAAC_ROOM_GREED_PROBE_9BFA70_VA = 0x009bfa70u;
static constexpr uint32_t ISAAC_ROOM_GREED_FIRE_9BFAE0_VA = 0x009bfae0u;
static constexpr uint32_t ISAAC_ROOM_GREED_PROBE_ELEM_STRIDE = 4u; /* sar 2 */
static constexpr uint32_t ISAAC_ROOM_GREED_PROBE_F2C_OFF = 0x2cu;
static constexpr uint32_t ISAAC_ROOM_GREED_PROBE_F3BC_OFF = 0x3bcu;
static constexpr uint32_t ISAAC_ROOM_GREED_PROBE_PARENT_OFF = 0x1e68u;
static constexpr uint32_t ISAAC_ROOM_GREED_PROBE_FRAME_OFF = 0x161cu;
static constexpr uint32_t ISAAC_ROOM_GREED_PROBE_BYTE_OFF = 0x20a9u;
static constexpr int32_t ISAAC_ROOM_GREED_PROBE_FRAME_NONE = -1;
static constexpr uint32_t ISAAC_ROOM_GREED_FIRE_CALL_7D93B0_VA = 0x007d93b0u;

#pragma pack(push, 1)
typedef struct IsaacRoomGreedProbeElem { /* 28 bytes */
  uint32_t f2c;            /* [e+0x2c] must be 0 */
  uint32_t f3bc;           /* [e+0x3bc] must be 0 */
  uint32_t has_parent;     /* [e+0x1e68] != 0 */
  int32_t parent_161c;     /* [parent+0x161c] (valid iff has_parent) */
  int32_t self_161c;       /* [e+0x161c] */
  uint32_t parent_is_self; /* parent pointer == e */
  uint32_t f20a9;          /* byte [e+0x20a9] widened (low byte only) */
} IsaacRoomGreedProbeElem;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomGreedProbeElem) == 28,
              "IsaacRoomGreedProbeElem size");

#pragma pack(push, 1)
typedef struct IsaacRoomGreedFire9bfae0PlanOut { /* 20 bytes */
  uint32_t elem_count;      /* input echo */
  uint32_t fire_count;      /* elements with byte[e+0x20a9] != 0 */
  uint32_t fire_mask;       /* bitmap of the FIRST 32 elements */
  uint32_t call_7d93b0_va;  /* 0x7d93b0 (this=fired element) */
  uint32_t bound_rederived; /* 1: PE re-reads end-begin EVERY iteration */
} IsaacRoomGreedFire9bfae0PlanOut;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomGreedFire9bfae0PlanOut) == 20,
              "IsaacRoomGreedFire9bfae0PlanOut size");
static_assert(offsetof(IsaacRoomGreedFire9bfae0PlanOut, fire_mask) == 8,
              "IsaacRoomGreedFire9bfae0PlanOut fire_mask offset");

int32_t isaac_room_greed_probe_9bf990(const IsaacRoomGreedProbeElem* elems,
                                      uint32_t count);
uint32_t isaac_room_greed_probe_9bfa00(const IsaacRoomGreedProbeElem* elems,
                                       uint32_t count);
uint32_t isaac_room_greed_probe_9bfa70(const IsaacRoomGreedProbeElem* elems,
                                       uint32_t count);
void isaac_room_greed_fire_9bfae0_plan(const IsaacRoomGreedProbeElem* elems,
                                       uint32_t count,
                                       IsaacRoomGreedFire9bfae0PlanOut* out);

/* ---- v82 (ABI bump 79 -> 80): FUN_007f83b0 MAIN-path spawn-tail item
   plan (PE 0x7f8760..0x7f8a24 loop inside the v69 record-27 body; fresh
   dumps cpu-dump/007f8922.txt + 007f8509.txt). The v69 unit landed the
   scalar float laws (L1-L11); THIS unit lands the per-iteration plan
   carrier that composes them in PE op order. Per iteration (7 genrand
   draws, count = (genrand&3)+5, SIGNED jl loop back @0x7f8a1e):
   r_a@0x7f8760 (echoed into the 0x428b20 arg pack), r_b@0x7f8768 -> f1 =
   f32(u*2^-32*5.0) [ebp-0x34], r_c@0x7f879a -> m = f32(f32(u*2^-32)*2) -
   1.0f, r_d@0x7f881c -> height = 2*(f32(u*2^-32*pi)), r_e@0x7f8852 ->
   speed = f32(u*2^-32*20), r_f@0x7f89b1 -> threshold, r_g@0x7f89f3 ->
   timer. Sign work (xorps 0xbacb70): A = -[67f1d0 vec0] @0x7f8717,
   B = -[vec1] @0x7f8728, C = -A = vec0 @0x7f8754.
   VELOCITY (0x7f87e0..0x7f8804):
     vel_x([ebp-0x5c]) = f32(f32(m*B) + f32(A*f1))
     vel_y([ebp-0x58]) = f32(f32(m*C) + f32(B*f1))
   BASE (0x7f8809..0x7f8818): SIGNED idiv([[door]+0x24],
   [[Game+0x18300]+0xc]); base_y = cvt(rem)*40 + 40,
   base_x = cvt(quot)*40 + 120 (BOTH components multiply by
   [0xbaa904]=40; only the ADD differs 0xbaa904 vs 0xbaaa00).
   POS (0x7f8889..0x7f88e9, HOST cos/sin fed back):
     pos_y = f32(f32(cos_h*speed) + base_y); pos_x = f32(f32(sin_h*speed)
     + base_x).
   DISTANCE (0x7f8930..0x7f899b, idiv RE-DERIVED after the spawn):
     d2 = f32(f32(item_py - quot_term)*C) +
          f32(f32(item_px - rem_term)*B)
     where quot_term = cvt(quot)*40+120, rem_term = cvt(rem)*40+40 and
     item_px/py are the spawned item's [0x33c]/[0x340] readback.
   DIR (0x7f89a2 jbe): dir = (0 > d2 ordered) ? -1.0f : +1.0f -- NaN
   KEEPS +1.0f (comiss unordered sets CF -> jbe TAKEN). Same law family
   as v69 isaac_room_trigger_clear_audio_noise_dir.
   F474 (0x7f89de..0x7f89eb): thr = f32(u(r_f)*2^-32*10) + 2.0f;
   [item+0x474] = f32(thr*dir) -- NO ==0 select here (unlike the 7f7a40
   tail lahf/jnp select). TIMER (0x7f89f8..0x7f8a0e): UNSIGNED %10 +
   0x1e -> [item+0x45c] AND [item+0x460].
   Spawn pack (0x7f88f1..0x7f8915): 0x428b20(this=Game) args {0x3e8,
   0x3b, &pos, &vel, 0, (i==0)?1:0, r_a, 0} (v54 family law callee);
   item factory 0xaf08b1 @0x7f891b and vtbl [+0xc] @0x7f8a14 stay typed
   host. ALT tail 0x7f8ec7..0x7f9201 mirrors this shape but its linear
   dumps desync mid-instruction (resync at 0x7f8f08) - REMAINS TYPED
   HOST pending a recursive-descent transcription. */
#pragma pack(push, 1)
typedef struct IsaacRoomTca83B0TailItemSrc { /* 64 bytes */
  uint32_t r_a;
  uint32_t r_b;
  uint32_t r_c;
  uint32_t r_d;
  uint32_t r_e;
  uint32_t r_f;
  uint32_t r_g;
  uint32_t vec0_bits;
  uint32_t vec1_bits;
  int32_t door_f24;
  int32_t game_c;
  uint32_t cos_h_bits;
  uint32_t sin_h_bits;
  uint32_t item_px_bits;
  uint32_t item_py_bits;
  uint32_t first_iter;
} IsaacRoomTca83B0TailItemSrc;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomTca83B0TailItemSrc) == 64,
              "IsaacRoomTca83B0TailItemSrc size");

#pragma pack(push, 1)
typedef struct IsaacRoomTca83B0TailItemOut { /* 112 bytes */
  uint32_t f1_bits;
  uint32_t m_bits;
  uint32_t height_bits;
  uint32_t speed_bits;
  uint32_t vel_x_bits;
  uint32_t vel_y_bits;
  uint32_t div_ok;
  int32_t quotient;
  int32_t remainder;
  uint32_t base_x_bits;
  uint32_t base_y_bits;
  uint32_t pos_x_bits;
  uint32_t pos_y_bits;
  uint32_t d2_bits;
  uint32_t dir_bits;
  uint32_t thr_bits;
  uint32_t f474_bits;
  uint32_t timer_value;
  uint32_t create_type;
  uint32_t create_variant;
  uint32_t call_428b20_va;
  uint32_t spawn_arg7;
  uint32_t first_iter_echo;
  uint32_t vcall_off;
  uint32_t timer_off_a;
  uint32_t timer_off_b;
  uint32_t item_px_off;
  uint32_t item_py_off;
} IsaacRoomTca83B0TailItemOut;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomTca83B0TailItemOut) == 112,
              "IsaacRoomTca83B0TailItemOut size");
static_assert(offsetof(IsaacRoomTca83B0TailItemOut, dir_bits) == 56,
              "IsaacRoomTca83B0TailItemOut dir offset");

void isaac_room_trigger_clear_audio_83b0_tail_item_plan(
    const IsaacRoomTca83B0TailItemSrc* src,
    IsaacRoomTca83B0TailItemOut* out);

/* ---- v83 (ABI bump 80 -> 81): FUN_007fb250 record-29 award-spawner HEAD
   plan (PE 0x7fb250..0x7fb7a3; fresh dump cpu-dump/007fb250.txt, 387 insns
   / 37 E8 / 51 stores in window). Every branch below is transcribed from
   the instruction stream. Host leaves stay typed: Lua gate 0x866220,
   arithmetic relays 0x812d00/0x823ec0 (idx29 notes), entity probes
   0x9be630/0x9be750/0x9be140/0x9be6b0/0x9bea80/0x9be080, RNG picker
   0x7fa920 (v78 census), RandomInt 0x7e9020/0x7e9080/0x7e8f90, gates
   0x4f8940/0x44bfb0/0x6ee340/0x74efd0, transforms 0x7d12c0/0x7cb6e0/
   0x4e4690, SFX 0x929b40/0x95a7b0/0x6f9770.
   EXIT ORDER (branch targets verbatim):
     0 LUA_TAIL    lua_gate != 0                (jne 0x7fe099)
     3 GREED_ARM   Game[0x269c8] in {2,3}       (je 0x7fd8e2; FRESH mode
                   re-read @0x7fb3f7 -- not cached from the caller)
     1 SFX_ARM     [[room+4]+0x10] non-null &&
                   [+8]==0x10 && [+0]==0x23     (jmp 0x7fe087)
     6 RT_ALT      room[8] in {5,0x11}          (je 0x7fbb64)
     2 RT_END      room[8] == 0x10              (je 0x7fe087)
     5 GATE_END    h_74efd0 && Game[0x1830c]==1 (je 0x7fe087)
     7 NO_SPAWNS   final count <= 0 (SIGNED jle 0x7fb8d1)
     8 ID_ZERO     id == 0                      (je 0x7fb8c2)
     4 SPAWN_LOOP  otherwise                    (falls into 0x7fb7be)
   COUNT LAW (0x7fb4ab..0x7fb7a3; host results as inputs):
     count = 1
     if gate_f1(0x4f8940 list,0xf1) && picked != 0x15e:
       c2 = h_9be750 + 1
       lhs = f32(h_4e4690 * bits[0xbaa2d0]=0.5f)
       count = comiss/cmovA above(lhs, h_7e9080) ? 0 : c2   (NaN keeps c2)
     if mode==1 && picked==0xa:
       count = (h_rnd64 <u 0x42) ? count : 0
       (cmp/sbb/and: sbb yields -(CF); CF set when rnd BELOW -> kept)
     if !h_6ee340(picked) && h_9be140 != 0: id = xform_id
     if desc_f0 == -0x10 && h_9be6b0 != 0: count *= h_7cb6e0 (u32 wrap)
     flag_66 = gate_202 && h_rnd4 == 0 && count >= 1 (SIGNED jl) &&
               id in {0x14, 0xa, 0x1e, 0x45, 0x28}
     if (id == 0x14 || id == 0) && h_9be080 != 0:
       count = max_u32(count + h_rnd3, 1) (cmova after cmp eax,1);
       id FORCED to 0x14 @0x7fb683
   VARIANT LOCAL [ebp-0x6c]: init -1; -2 iff Game[0x1839c] bit17 &&
   room[8]==5 @0x7fb3d8; byte_6d = h_9be630 != 0 || (bit17 && rt5).
   REMAINING TYPED-HOST (NOT translated here): the 0x54 music / vec-cap /
   table-pick block 0x7fb6c5..0x7fb79d ([ebp-0x24] stack-relative table
   reads need the whole frame image) and the spawn-loop continuation
   0x7fb7be..0x7fe087 (0x813520 pos walk / 0x7e90f0 rng / 0x428b20 spawn
   relay v54 / 0x812c90+0x822820 gate / 0x6ee340 per-entity re-dispatch).
   Constants: [0xbaa330]=0.666f feeds HOST 0x4e4690; [0xbaa2d0]=0.5f;
   [0xbaa9a0]=80.0f; table [0xbab310]={4,2,3,5}+imm 7. */
#pragma pack(push, 1)
typedef struct IsaacRoomAwardSpawn7fb250Src { /* 108 bytes */
  uint32_t lua_gate;
  uint32_t desc_f10_present;
  uint32_t desc_type_8;
  uint32_t desc_type_00;
  uint32_t room_type_8;
  uint32_t h_74efd0;
  uint32_t game_1830c;
  uint32_t mode_269c8;
  uint32_t h_9be630;
  uint32_t flags_1839c;
  uint32_t picked_id;
  uint32_t gate_f1;
  uint32_t h_9be750;
  uint32_t h_4e4690_bits;
  uint32_t h_7e9080_bits;
  uint32_t h_rnd64;
  uint32_t h_6ee340;
  uint32_t h_9be140;
  uint32_t xform_id;
  uint32_t xform_b;
  int32_t desc_f0;
  uint32_t h_9be6b0;
  uint32_t h_7cb6e0;
  uint32_t gate_202;
  uint32_t h_rnd4;
  uint32_t h_9be080_1a0;
  uint32_t h_rnd3;
} IsaacRoomAwardSpawn7fb250Src;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomAwardSpawn7fb250Src) == 108,
              "IsaacRoomAwardSpawn7fb250Src size");

#pragma pack(push, 1)
typedef struct IsaacRoomAwardSpawn7fb250Out { /* 32 bytes */
  uint32_t exit_kind;
  uint32_t sfx_arm;
  uint32_t byte_6d;
  int32_t variant_local;
  uint32_t count;
  uint32_t id_final;
  uint32_t flag_66;
  uint32_t planned_spawns;
} IsaacRoomAwardSpawn7fb250Out;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomAwardSpawn7fb250Out) == 32,
              "IsaacRoomAwardSpawn7fb250Out size");
static_assert(offsetof(IsaacRoomAwardSpawn7fb250Out, count) == 16,
              "IsaacRoomAwardSpawn7fb250Out count offset");

void isaac_room_award_spawn_7fb250_head_plan(
    const IsaacRoomAwardSpawn7fb250Src* src,
    IsaacRoomAwardSpawn7fb250Out* out);

/* ---- v84 (ABI bump 81 -> 82): FUN_007f83b0 ALT-tail item plan (PE
   0x7f8ec7..0x7f9209; recursive-descent re-transcription, notes at
   section-notes/room-v84-alt-tail/NOTES.md — the earlier "linear dumps
   desync" verdict was an anchor artifact: starting AT 0x7f8ec7 decodes
   clean to the shared epilogue). Loop: count = (genrand&3)+5 computed
   ONCE @0x7f8ec7; iterations start at 0x7f8ef8 (jne back @0x7f91ad).
   Per iteration (7 draws r_b..r_h):
     C([ebp-0x50]) = -vecA EVERY iteration @0x7f8edb..f0 (xorps flip);
     [ebp-0x1c] = (doorMagic==0xe) sete @0x7f8ee2..f5;
     f1 = f32(u(r_c)*2^-32*5.0); m = f32(f32(u(r_d)*2^-32)*2)-1.0;
     vel_x = f32(f32(f1*A) + f32(m*B))          [ebp-0x64]
     vel_y = f32(f32(C*m) + f32(f1*B))          [ebp-0x60]
     base idiv [[door]+0x24] / [[room]+0xc] SIGNED (rem/quo);
     h = 2*(f32(u(r_e)*2^-32*pi)); spd = f32(u(r_f)*2^-32*20);
     pos_y = f32(cos_h*spd) + rem_term ; pos_x = f32(sin_h*spd) + quot_term
       (rem_term = cvt(rem)*40+40 ; quot_term = cvt(quo)*40+120);
     spawn pack {0x3e8, 0x3b, &pos, &vel, 0, flag_e, r_b, ...} — the
       flag slot carries doorMagic==0xe CONSTANT (main tail carries
       i==0) and the echo draw is r_b (main uses its first draw);
     d2 = f32((px - rem_term)*B) + f32((py - quot_term)*C)
       (same crossed pairing as main; add order swapped — exact);
     dir = comiss(0,d2)/jbe law (NaN keeps +1.0f);
     [item+0x474] = f32(thr*dir), thr = f32(u(r_g)*2^-32*10)+2
       (NO ==0 select); timer UNSIGNED %10+0x1e -> 0x45c AND 0x460.
   Post-loop RNG advance 0x7f91b3..0x7f9207 verified byte-identical to
   the ALREADY-LANDED v72 laws isaac_room_trigger_clear_audio_83b0_tail_
   rng_fatal / _tail_rng_next — no new export for it.
   Typed-host residuals: genrand 0x6eef60 x7/iter, cos/sin CRT,
   0x428b20 relay (v54 callee), item factory 0xaf08b1, [eax+0xc]
   virtual. This CLOSES the FUN_007f83b0 body coverage: every span is
   now either a landed law/carrier or a typed-host leaf with a census
   entry (v69 NOTES section 4 + this unit). */
#pragma pack(push, 1)
typedef struct IsaacRoomTca83B0AltItemSrc { /* 64 bytes */
  uint32_t r_b;          /* draw 1 (spawn arg echo) */
  uint32_t r_c;          /* draw 2 -> f1 */
  uint32_t r_d;          /* draw 3 -> magnitude m */
  uint32_t r_e;          /* draw 4 -> height */
  uint32_t r_f;          /* draw 5 -> speed */
  uint32_t r_g;          /* draw 6 -> threshold */
  uint32_t r_h;          /* draw 7 -> timer */
  uint32_t vec_a_bits;   /* [ebp-0x18] raw seam input */
  uint32_t vec_b_bits;   /* [ebp-0x34] raw seam input (used UNflipped) */
  uint32_t magic_eq_e;   /* door magic == 0xe (pre-sete input) */
  int32_t door_f24;      /* [[door]+0x24] */
  int32_t game_c;        /* [[room]+0xc] */
  uint32_t cos_h_bits;   /* HOST cos(h) fed back */
  uint32_t sin_h_bits;   /* HOST sin(h) fed back */
  uint32_t item_px_bits; /* [item+0x33c] readback */
  uint32_t item_py_bits; /* [item+0x340] readback */
} IsaacRoomTca83B0AltItemSrc;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomTca83B0AltItemSrc) == 64,
              "IsaacRoomTca83B0AltItemSrc size");

#pragma pack(push, 1)
typedef struct IsaacRoomTca83B0AltItemOut { /* 112 bytes */
  uint32_t c_bits;         /* -vecA ([ebp-0x50], in-loop flip) */
  uint32_t flag_e;         /* doorMagic==0xe latch */
  uint32_t f1_bits;
  uint32_t m_bits;
  uint32_t vel_x_bits;     /* [ebp-0x64] */
  uint32_t vel_y_bits;     /* [ebp-0x60] */
  uint32_t div_ok;         /* game_c == 0 faults in the PE */
  int32_t quotient;
  int32_t remainder;
  uint32_t base_y_bits;    /* rem*40 + 40 */
  uint32_t base_x_bits;    /* quo*40 + 120 */
  uint32_t pos_x_bits;     /* [ebp-0x58] */
  uint32_t pos_y_bits;     /* [ebp-0x5c] */
  uint32_t d2_bits;
  uint32_t dir_bits;
  uint32_t thr_bits;
  uint32_t f474_bits;
  uint32_t timer_value;
  uint32_t create_type;    /* 0x3e8 */
  uint32_t create_variant; /* 0x3b */
  uint32_t call_428b20_va;
  uint32_t spawn_arg_rb;   /* r_b pass-through */
  uint32_t spawn_flag;     /* flag_e into the pack */
  uint32_t vcall_off;      /* 0xc */
  uint32_t timer_off_a;    /* 0x45c */
  uint32_t timer_off_b;    /* 0x460 */
  uint32_t item_px_off;    /* 0x33c */
  uint32_t item_py_off;    /* 0x340 */
} IsaacRoomTca83B0AltItemOut;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomTca83B0AltItemOut) == 112,
              "IsaacRoomTca83B0AltItemOut size");
static_assert(offsetof(IsaacRoomTca83B0AltItemOut, vel_x_bits) == 16,
              "IsaacRoomTca83B0AltItemOut vel offset");

void isaac_room_trigger_clear_audio_83b0_tail_alt_item_plan(
    const IsaacRoomTca83B0AltItemSrc* src,
    IsaacRoomTca83B0AltItemOut* out);

/* ---- v85 (ABI bump 82 -> 83): FUN_007fb250 award-spawner SPAWN-LOOP
   CONTINUATION (PE 0x007fb7be..0x007fe087; fresh recursive-descent dumps
   cpu-dump/007fb7be.txt + chunk chain 007fbabc..007fdda0, full coverage,
   resyncs only on the 0x7fbabf indirect vtable leaf). The head plan (v83)
   exit-4 SPAWN_LOOP falls into 0x7fb7be. Per-iteration law
   (0x007fb7b6..0x007fb8d1 loop; back-edge SIGNED jl 0x7fb8cb):
     pos walk HOST 0x00813520(this=room, &[-0x9c] pos, &[-0x7c], 0,0,0,0);
     rng step PURE 0x007e90f0([-0xac]) -> draw;
     create relay HOST-v54 0x00428b20(Game, 5, picked_id, &pos, 0xc7b640,
       0, variant_cur, draw) -> entity edi;
     re-dispatch PURE 0x006ee340(ecx=[edi+0x2c]) -> al;
     al==0 -> variant latch [-0x8c] = [edi+0x30];
     DOOR ARM [edi+0x28]==5 && [edi+0x2c] in {0x34,0x36}:
       grid idx PURE 0x00812c90(room,&pos) == the landed v75 L1 law
         isaac_room_grid_pos_index (40/120/0.5 trunc chain, -1 OOB);
       door gate HOST 0x00822820(room, idx) -> al;
       al==0 -> HOST 0x006e30a0(entity)(5,0x32,1,0,0,0) + variant := 1;
     FLAG RMW: flag_66 != 0 && counter==0 ->
       tmp=[edi+0x168]; [edi+0x16c]|=0x100; [edi+0x168]=tmp @0x7fb87b..8b;
       sfx owner HOST 0x009be080(0x29e, Game+0x1baa8, 1); owner!=0 ->
       HOST chase 0x008276e0(entity) @0x7fb8b1;
     counter++ ; continue iff SIGNED counter < count_limit.
   POST-LOOP B1 LUCK SECTION (0x007fb8d1..0x007fb9cc): music gate HOST
     0x0044bfb0(0x8f); quality int HOST 0x009bea80(0x8f) eax; quality f32
     HOST 0x009bea40(0x8f) xmm0; PURE law:
       val = (q_f32*[0xbaa0a0]=0.03f + [0xbaa198]=0.2f) * f32(q_int)
         ([ebp-0x6c]);
       m = minss(val, [0xbaa220]=0.33f)  (MINSS: unordered -> second
         operand 0.33f wins — NOT Math.min);
       pass iff comiss/jbe ABOVE: ORDERED m > rnd (HOST 0x007e9080);
       pass -> spawn pack {5, 0x5a, &pos2, 0xc7b640, 1, 0, draw} +
         sfx HOST 0x4f8940(0x29e) -> owner -> HOST 0x8276e0.
   CALLEE CLASSIFICATION (whole span): PURE translated here —
     0x007e90f0 xorshift step, 0x006ee340 membership gate, 0x00812c90
     (= v75 grid_pos_index, reused). PURE laws folded into plans — iter
     body 0x7fb7be..0x7fb8d1, B1 luck gate 0x7fb8e7..0x7fb95b.
     TYPED-HOST with exact VA: pos walk 0x00813520; create relay
     0x00428b20 (v54 arg-relayout law already frozen); door gate
     0x00822820 (host-heavy: 0x813360/0x70bf60/0x70bf80/0x417870);
     door spawn 0x006e30a0; sfx 0x009be080/0x008276e0/0x004f8940;
     music gates 0x0044bfb0; quality probes 0x009bea80/0x009bea40;
     float rnd 0x007e9080; pos bind 0x007f9ee0; entity factory
     0x00af08b1; list relay 0x00417870; achievement/SFX 0x929b40/
     0x92a5e0/0x929a20/0x95a7b0/0x6f9770/0x74b830; mode probe 0x706940;
     transforms 0x7523e0/0x71f600/0x7fa360/0x7ebca0/0x7ec080/0x6eea30/
     0x6eed30/0x733ff0/0x7c3980/0x7fa7d0/0x8208e0/0x740bc0; greed
     probes 0x9bf990/0x9bfae0; genrand 0x6eef60; indirect vtable
     [eax-0x18] @0x7fbabf; jump-table dispatches @0x7fbd6e/0x7fbdc7
     (tables 0x7fe0b4/0x7fe0f8 sit past the span end). */

/* 0x007e90f0 state object layout (PE [esi+0..0xc]); x==0 hits the PE
   debug-fatal arm 0x7e90f9..0x7e910e (host assert — not modeled). */
#pragma pack(push, 1)
typedef struct IsaacRoomRng7e90f0State { /* 16 bytes */
  uint32_t x;
  uint32_t shr_a;
  uint32_t shl_b;
  uint32_t shr_c;
} IsaacRoomRng7e90f0State;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomRng7e90f0State) == 16,
              "IsaacRoomRng7e90f0State size");

#pragma pack(push, 1)
typedef struct IsaacRoomAwardSpawn7fb250IterSrc { /* 56 bytes */
  uint32_t picked_id;        /* edi entering 0x7fb7be */
  uint32_t variant_cur;      /* [ebp-0x8c] loop-carried */
  int32_t counter;           /* [ebp-0x90] */
  int32_t count_limit;       /* [ebp-0x64] (head-plan count) */
  uint32_t flag_66;          /* [ebp-0x66] byte latch from head */
  uint32_t entity_type_28;   /* [entity+0x28] */
  uint32_t entity_variant_2c;/* [entity+0x2c] -> gate + door arm */
  uint32_t entity_field_30;  /* [entity+0x30] re-latch source */
  uint32_t h_door_gate;      /* HOST 0x822820 al when armed */
  uint32_t h_sfx_owner;      /* HOST 0x9be080(0x29e) result */
  uint32_t pos_x_bits;       /* HOST pos-walk result f32 bits */
  uint32_t pos_y_bits;
  uint32_t room_w;           /* [room+0xc] */
  uint32_t room_h;           /* [room+0x10] */
} IsaacRoomAwardSpawn7fb250IterSrc;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomAwardSpawn7fb250IterSrc) == 56,
              "IsaacRoomAwardSpawn7fb250IterSrc size");

#pragma pack(push, 1)
typedef struct IsaacRoomAwardSpawn7fb250IterOut { /* 48 bytes */
  uint32_t redispatch_gate;  /* 0x6ee340(entity_variant_2c) */
  uint32_t variant_next;     /* [ebp-0x8c] after body */
  uint32_t door_arm;         /* type28==5 && variant2c in {0x34,0x36} */
  uint32_t grid_idx;         /* 0x812c90 law (consumed under arm) */
  uint32_t door_spawn_fired; /* arm && !h_door_gate */
  uint32_t flag_rmw;         /* flag_66 && counter==0 */
  uint32_t sfx_chase;        /* h_sfx_owner != 0 */
  int32_t counter_next;
  uint32_t continue_loop;    /* SIGNED counter_next < count_limit */
  uint32_t create_relay_va;  /* 0x00428b20 echo */
  uint32_t spawn_type;       /* 5 */
  uint32_t spawn_arg_a6;     /* variant_cur pass-through */
} IsaacRoomAwardSpawn7fb250IterOut;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomAwardSpawn7fb250IterOut) == 48,
              "IsaacRoomAwardSpawn7fb250IterOut size");
static_assert(offsetof(IsaacRoomAwardSpawn7fb250IterOut, counter_next) == 28,
              "IsaacRoomAwardSpawn7fb250IterOut counter offset");

#pragma pack(push, 1)
typedef struct IsaacRoomAwardSpawn7fb250B1LuckSrc { /* 12 bytes */
  int32_t h_quality_int;     /* HOST 0x9bea80(0x8f) eax */
  uint32_t h_quality_f_bits; /* HOST 0x9bea40(0x8f) xmm0 */
  uint32_t h_rnd_f_bits;     /* HOST 0x7e9080 */
} IsaacRoomAwardSpawn7fb250B1LuckSrc;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomAwardSpawn7fb250B1LuckSrc) == 12,
              "IsaacRoomAwardSpawn7fb250B1LuckSrc size");

#pragma pack(push, 1)
typedef struct IsaacRoomAwardSpawn7fb250B1LuckOut { /* 16 bytes */
  uint32_t val_bits;   /* (q*0.03f+0.2f)*f32(q_int) [ebp-0x6c] */
  uint32_t min_bits;   /* minss vs 0.33f (unordered -> 0.33f) */
  uint32_t pass;       /* ORDERED min > rnd (jbe skip) */
  uint32_t spawn_variant; /* 0x5a site pack echo */
} IsaacRoomAwardSpawn7fb250B1LuckOut;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomAwardSpawn7fb250B1LuckOut) == 16,
              "IsaacRoomAwardSpawn7fb250B1LuckOut size");

/* Continuation span pins. */
static constexpr uint32_t ISAAC_ROOM_AWARD_SPAWN_CONT_VA = 0x007fb7beu;
static constexpr uint32_t ISAAC_ROOM_AWARD_SPAWN_CONT_END_VA = 0x007fe087u;
static constexpr uint32_t ISAAC_ROOM_AWARD_SPAWN_ITER_HEAD_VA = 0x007fb7beu;
static constexpr uint32_t ISAAC_ROOM_AWARD_SPAWN_LOOP_BACK_VA = 0x007fb8cbu;
static constexpr uint32_t ISAAC_ROOM_AWARD_SPAWN_RNG_STEP_VA = 0x007e90f0u;
static constexpr uint32_t ISAAC_ROOM_AWARD_SPAWN_RNG_FATAL_VA = 0x007e90f9u;
static constexpr uint32_t ISAAC_ROOM_AWARD_SPAWN_REDISPATCH_VA = 0x006ee340u;
static constexpr uint32_t ISAAC_ROOM_AWARD_SPAWN_GRID_IDX_VA = 0x00812c90u;
static constexpr uint32_t ISAAC_ROOM_AWARD_SPAWN_DOOR_ARM_TYPE = 5u;
static constexpr int32_t ISAAC_ROOM_AWARD_SPAWN_DOOR_ARM_A = 0x34;
static constexpr int32_t ISAAC_ROOM_AWARD_SPAWN_DOOR_ARM_B = 0x36;
static constexpr uint32_t ISAAC_ROOM_AWARD_SPAWN_FLAG_BIT = 0x100u;
static constexpr uint32_t ISAAC_ROOM_AWARD_SPAWN_FLAG_FIELD_OFF = 0x16cu;
static constexpr uint32_t ISAAC_ROOM_AWARD_SPAWN_HOST_POS_WALK_VA = 0x00813520u;
static constexpr uint32_t ISAAC_ROOM_AWARD_SPAWN_HOST_CREATE_VA = 0x00428b20u;
static constexpr uint32_t ISAAC_ROOM_AWARD_SPAWN_HOST_DOOR_GATE_VA = 0x00822820u;
static constexpr uint32_t ISAAC_ROOM_AWARD_SPAWN_HOST_DOOR_SPAWN_VA = 0x006e30a0u;
static constexpr uint32_t ISAAC_ROOM_AWARD_SPAWN_HOST_SFX_OWNER_VA = 0x009be080u;
static constexpr uint32_t ISAAC_ROOM_AWARD_SPAWN_HOST_SFX_CHASE_VA = 0x008276e0u;
static constexpr uint32_t ISAAC_ROOM_AWARD_SPAWN_SFX_ID_29E = 0x29eu;
static constexpr uint32_t ISAAC_ROOM_AWARD_SPAWN_B1_MUSIC_GATE_VA = 0x0044bfb0u;
static constexpr uint32_t ISAAC_ROOM_AWARD_SPAWN_B1_QUAL_INT_VA = 0x009bea80u;
static constexpr uint32_t ISAAC_ROOM_AWARD_SPAWN_B1_QUAL_F32_VA = 0x009bea40u;
static constexpr uint32_t ISAAC_ROOM_AWARD_SPAWN_B1_RND_VA = 0x007e9080u;
static constexpr uint32_t ISAAC_ROOM_AWARD_SPAWN_B1_MUL03_VA = 0x00baa0a0u;
static constexpr uint32_t ISAAC_ROOM_AWARD_SPAWN_B1_MUL03_BITS = 0x3cf5c28fu;
static constexpr uint32_t ISAAC_ROOM_AWARD_SPAWN_B1_ADD02_VA = 0x00baa198u;
static constexpr uint32_t ISAAC_ROOM_AWARD_SPAWN_B1_ADD02_BITS = 0x3e4ccccdu;
static constexpr uint32_t ISAAC_ROOM_AWARD_SPAWN_B1_CAP33_VA = 0x00baa220u;
static constexpr uint32_t ISAAC_ROOM_AWARD_SPAWN_B1_CAP33_BITS = 0x3ea8f5c3u;
static constexpr uint32_t ISAAC_ROOM_AWARD_SPAWN_B1_SITE_VA = 0x007fb9a3u;
static constexpr uint32_t ISAAC_ROOM_AWARD_SPAWN_B1_SITE_VARIANT = 0x5au;
static constexpr uint32_t ISAAC_ROOM_AWARD_SPAWN_B1_SITE_FLAG = 1u;
static constexpr uint32_t ISAAC_ROOM_AWARD_SPAWN_B1_SFX_PICKER_VA = 0x004f8940u;

uint32_t isaac_room_rng_7e90f0_step(IsaacRoomRng7e90f0State* st);
uint32_t isaac_room_award_spawn_6ee340_gate(uint32_t variant);
void isaac_room_award_spawn_7fb250_iter_plan(
    const IsaacRoomAwardSpawn7fb250IterSrc* src,
    IsaacRoomAwardSpawn7fb250IterOut* out);
void isaac_room_award_spawn_7fb250_b1_luck_gate(
    const IsaacRoomAwardSpawn7fb250B1LuckSrc* src,
    IsaacRoomAwardSpawn7fb250B1LuckOut* out);


/* ---- v86 (ABI bump 83 -> 84): idx29 SPAWN-LOOP probe callees. The
   update-slice record idx29 residual blocker (ABI v140 matrix,
   game_update_slice.cpp) names the 0xb-block 0x7fb9cc..0x7fbb04 with
   probes 0x009b92c0 / 0x007cb6e0 / 0x007c3980 unfrozen. This block
   freezes all three bodies as pure laws; host leaves stay typed.
   Fresh PE dumps cpu-dump/009b92c0.txt + 007cb6e0.txt + 007cb809.txt +
   007c3980.txt (sha256 5129df72...). Caller consumption (block
   0x7fba94..0x7fbadb): per entity-list index i (UNSIGNED jb loop over
   count = sar((end-begin),2)): ent = 0x9b92c0(&list, i);
   q = 0x7cb6e0(ent, 0xb1); if q > 1 -> 0x7c3980(ent, &vec); if
   q > 2 -> again (both SIGNED jle skips). */

/* Probe A — FUN_009b92c0 vector-at fetch (PE 0x009b92c0..0x009b9305,
   ret 4). count = SAR((int32)(end-begin), 2); count==0 -> fatal host
   0x00a112c0 @0x009b92de (args 0x10, ptr 0xb7e6bc) then RE-LOAD and
   continue; index >= count UNSIGNED (jae 0x009b92f5) -> return *begin
   (ORIGINAL DEFECT: out-of-range reads element 0, no trap); else
   begin[index] (stride 4 dword). */
static constexpr uint32_t ISAAC_ROOM_IDX29_AT_VA = 0x009b92c0u;
static constexpr uint32_t ISAAC_ROOM_IDX29_AT_END_VA = 0x009b9305u;
static constexpr uint32_t ISAAC_ROOM_IDX29_AT_FATAL_CALL_VA = 0x009b92deu;
static constexpr uint32_t ISAAC_ROOM_IDX29_AT_FATAL_HOST_VA = 0x00a112c0u;
static constexpr uint32_t ISAAC_ROOM_IDX29_AT_OOB_RET_VA = 0x009b9300u;
static constexpr uint32_t ISAAC_ROOM_IDX29_AT_STRIDE = 4u;

#pragma pack(push, 1)
typedef struct IsaacRoomIdx29AtOut { /* 12 bytes */
  uint32_t value;      /* begin[index] or defect *begin */
  uint32_t oob_defect; /* jae path taken: index >= count (UNSIGNED) */
  uint32_t fatal_host; /* empty-vector arm entered (count==0) */
} IsaacRoomIdx29AtOut;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomIdx29AtOut) == 12,
              "IsaacRoomIdx29AtOut size");

void isaac_room_idx29_at_9b92c0(uint32_t begin, uint32_t end,
                                uint32_t index, IsaacRoomIdx29AtOut* out);

/* Probe B — FUN_007cb6e0 count resolver (PE 0x007cb6e0..0x007cba1f,
   ret 4; thiscall this=player/follower chain head, arg id). Head walk
   chases [this+0x3bc] while [x+0x2c]==1 (host 0x00417870 fallback).
   Pure accumulation order: boost(id==0x56 && [edi+0x13c0]==4) ->
   byte gates [edi+0x202c]/[edi+0x20a9] (early return BEFORE mask) ->
   id &= 0x7fff -> manager-mode table hit ([Game+0x2663c]==0x1c scans
   .rdata table 0xb6bad0, 10 dwords, UNSIGNED bound) -> special ids
   {0x15,0x40,0x4b} jump straight to sampling -> recursed count(0x15)
   with the 0x30 gate (seed mod-4: and 0x80000003/dec/or/inc SIGNED
   form; early return count15+esi) -> recursed count(0x40) seed-index
   gate (magic 0xb60b60b7 div-by-90, UNSIGNED mod 10, same table) ->
   recursed count(0x4b): 0x7a/[Game+0x26584]==0x29 skip to sampling;
   else HOST 0x740bc0(Game[0x18304], -1) -> r=[ret+0x5c]; r!=0 packs
   {r, qword@0xb1f564, dword@0xb1f56c} for HOST RNG 0x7e9020(.,0xbd)
   -> esi += count4b iff id == rng+1 (u32 wrap) -> ids 0x17/0x18/0x13
   (0x17 HOST 0x930aa0 adder; 0x18/0x13 SIGNED field>0 +1) ->
   sampling 0x007cb8d8: scan width from HOST has-8b/has-1ca bytes
   (2/2/1), slot loop [edi+0x16c0] stride 4 — match adds 1 and ONLY
   UNDER MATCH bit15 adds a second 1 (jne 0x7cb91e skips both incs;
   the increments are NESTED, not independent) — block [edi+0x17c4]
   ([ptr]==2 && [ptr+4]==id && ([edi+0x2ef8]==0 || ==id)) then the
   INDEPENDENT byte[edi+0x17cc]&2 extra — item list span
   ([edi+0x174c]-[edi+0x1748])>>2 UNSIGNED bound, adds movsx w0 +
   2*movsx w1 — byte buffer span raw dword diff SIGNED bound (+1 iff
   nonzero) — [edi+0x2ef8] adjust (byte[edi+0x2ef0]!=0 ->
   +1+(bit15?1:0); else max(0, base-1) twice under bit15) — final
   SIGNED gate esi>0 && HOST has-1b7 -> +1.
   Host edges stay typed: walk 0x417870, 0x740bc0 + RNG 0x7e9020,
   0x930aa0, 0x7706e0 x3 (ids 0x8b/0x1ca/0x1b7). Game global
   0xc71678. */
static constexpr uint32_t ISAAC_ROOM_COUNT_VA = 0x007cb6e0u;
static constexpr uint32_t ISAAC_ROOM_COUNT_RET_VA = 0x007cba1fu;
static constexpr uint32_t ISAAC_ROOM_COUNT_SAMPLING_VA = 0x007cb8d8u;
static constexpr uint32_t ISAAC_ROOM_COUNT_RECURSE_15_VA = 0x007cb7b2u;
static constexpr uint32_t ISAAC_ROOM_COUNT_RECURSE_40_VA = 0x007cb801u;
static constexpr uint32_t ISAAC_ROOM_COUNT_RECURSE_4B_VA = 0x007cb845u;
static constexpr uint32_t ISAAC_ROOM_COUNT_HOST_WALK_VA = 0x00417870u;
static constexpr uint32_t ISAAC_ROOM_COUNT_HOST_740BC0_VA = 0x00740bc0u;
static constexpr uint32_t ISAAC_ROOM_COUNT_HOST_RNG_VA = 0x007e9020u;
static constexpr uint32_t ISAAC_ROOM_COUNT_HOST_930AA0_VA = 0x00930aa0u;
static constexpr uint32_t ISAAC_ROOM_COUNT_HOST_7706E0_VA = 0x007706e0u;
static constexpr uint32_t ISAAC_ROOM_COUNT_GAME_GLOBAL = 0x00c71678u;
static constexpr uint32_t ISAAC_ROOM_COUNT_TABLE_VA = 0x00b6bad0u;
static constexpr int32_t ISAAC_ROOM_COUNT_TABLE[10] = {
    0x9, 0xb, 0x41, 0x1b, 0xa, 0xc, 0x1a, 0x42, 0x60, 0x90};
static constexpr int32_t ISAAC_ROOM_COUNT_TABLE_SIZE = 10;
static constexpr uint32_t ISAAC_ROOM_COUNT_MASK = 0x7fffu;
static constexpr int32_t ISAAC_ROOM_COUNT_MODE_GATE = 0x1c;
static constexpr int32_t ISAAC_ROOM_COUNT_MODE_7A_GATE = 0x29;
static constexpr int32_t ISAAC_ROOM_COUNT_ID_56 = 0x56;
static constexpr int32_t ISAAC_ROOM_COUNT_ID_30 = 0x30;
static constexpr int32_t ISAAC_ROOM_COUNT_ID_7A = 0x7a;
static constexpr int32_t ISAAC_ROOM_COUNT_ID_17 = 0x17;
static constexpr int32_t ISAAC_ROOM_COUNT_ID_18 = 0x18;
static constexpr int32_t ISAAC_ROOM_COUNT_ID_13 = 0x13;
static constexpr int32_t ISAAC_ROOM_COUNT_HC_BD = 0xbd;
static constexpr int32_t ISAAC_ROOM_COUNT_HC_8B = 0x8b;
static constexpr int32_t ISAAC_ROOM_COUNT_HC_1CA = 0x1ca;
static constexpr int32_t ISAAC_ROOM_COUNT_HC_1B7 = 0x1b7;
static constexpr uint32_t ISAAC_ROOM_COUNT_SEED_DIV_MAGIC = 0xb60b60b7u;
static constexpr int32_t ISAAC_ROOM_COUNT_SEED_DIV_SHIFT = 6;
static constexpr int32_t ISAAC_ROOM_COUNT_SEED_IDX_MOD = 10;
static constexpr uint32_t ISAAC_ROOM_COUNT_MOD4_MASK = 0x80000003u;
static constexpr uint32_t ISAAC_ROOM_COUNT_F13C0_OFF = 0x13c0u;
static constexpr uint32_t ISAAC_ROOM_COUNT_GATE_202C_OFF = 0x202cu;
static constexpr uint32_t ISAAC_ROOM_COUNT_GATE_20A9_OFF = 0x20a9u;
static constexpr uint32_t ISAAC_ROOM_COUNT_SLOT_BASE_OFF = 0x16c0u;
static constexpr uint32_t ISAAC_ROOM_COUNT_ITEM_BEGIN_OFF = 0x1748u;
static constexpr uint32_t ISAAC_ROOM_COUNT_ITEM_END_OFF = 0x174cu;
static constexpr uint32_t ISAAC_ROOM_COUNT_BYTE_BEGIN_OFF = 0x1fe0u;
static constexpr uint32_t ISAAC_ROOM_COUNT_BYTE_END_OFF = 0x1fe4u;
static constexpr uint32_t ISAAC_ROOM_COUNT_BLOCK_PTR_OFF = 0x17c4u;
static constexpr uint32_t ISAAC_ROOM_COUNT_BLOCK_FLAG_OFF = 0x17ccu;
static constexpr uint32_t ISAAC_ROOM_COUNT_F1508_OFF = 0x1508u;
static constexpr uint32_t ISAAC_ROOM_COUNT_F18304_OFF = 0x18304u;
static constexpr uint32_t ISAAC_ROOM_COUNT_F18DC_OFF = 0x18dcu;
static constexpr uint32_t ISAAC_ROOM_COUNT_F18E0_OFF = 0x18e0u;
static constexpr uint32_t ISAAC_ROOM_COUNT_BYTE_2EF0_OFF = 0x2ef0u;
static constexpr uint32_t ISAAC_ROOM_COUNT_F2EF8_OFF = 0x2ef8u;
static constexpr uint32_t ISAAC_ROOM_COUNT_MGR_SEED_OFF = 0x264f8u;
static constexpr uint32_t ISAAC_ROOM_COUNT_MGR_MODE2_OFF = 0x26584u;
static constexpr uint32_t ISAAC_ROOM_COUNT_MGR_MODE_OFF = 0x2663cu;

#pragma pack(push, 1)
typedef struct IsaacRoomCountHeadStepOut { /* 16 bytes */
  uint32_t player_next; /* chased edi */
  uint32_t host_edge;   /* HOST 0x417870 fired */
  uint32_t cont;        /* loop while candidate [+0x2c]==1 */
  uint32_t exit_stored; /* reached the [ebp-0x1c]=edi store */
} IsaacRoomCountHeadStepOut;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomCountHeadStepOut) == 16,
              "IsaacRoomCountHeadStepOut size");

void isaac_room_count_7cb6e0_head_step(
    uint32_t field_2c, uint32_t parent_ptr, uint32_t parent_field_28,
    uint32_t cand_field_2c, uint32_t host_known, uint32_t host_result,
    IsaacRoomCountHeadStepOut* out);

uint32_t isaac_room_count_7cb6e0_boost(uint32_t f13c0, uint32_t id);
uint32_t isaac_room_count_7cb6e0_gate_202c(uint32_t flag);
uint32_t isaac_room_count_7cb6e0_gate_20a9(uint32_t flag);
uint32_t isaac_room_count_7cb6e0_id_mask(uint32_t id);
uint32_t isaac_room_count_7cb6e0_table_value(uint32_t index);
uint32_t isaac_room_count_7cb6e0_table_hit(uint32_t mode_2663c,
                                           uint32_t id_masked);
uint32_t isaac_room_count_7cb6e0_special_id(uint32_t id_masked);
int32_t isaac_room_count_7cb6e0_seed_mod4(uint32_t mgr_seed);
uint32_t isaac_room_count_7cb6e0_seed_index(uint32_t mgr_seed);
uint32_t isaac_room_count_7cb6e0_id30_gate(uint32_t id_masked,
                                           int32_t count15,
                                           int32_t seed_mod4);
uint32_t isaac_room_count_7cb6e0_seed40_gate(uint32_t id_masked,
                                             int32_t count40,
                                             uint32_t mgr_seed);
uint32_t isaac_room_count_7cb6e0_7a29_skip(uint32_t id_masked,
                                           uint32_t mode_26584);
uint32_t isaac_room_count_7cb6e0_bd_compare(uint32_t rng_raw,
                                            uint32_t id_masked);
uint32_t isaac_room_count_7cb6e0_scan_width(uint32_t has_8b,
                                            uint32_t has_1ca);
uint32_t isaac_room_count_7cb6e0_slot_match(uint32_t slot_dword,
                                            uint32_t id_masked);
uint32_t isaac_room_count_7cb6e0_block_17c4(uint32_t block_nonnull,
                                            uint32_t block0,
                                            uint32_t block4,
                                            uint32_t f2ef8,
                                            uint32_t id_masked);
uint32_t isaac_room_count_7cb6e0_flag_17cc(uint32_t flag_byte);
int32_t isaac_room_count_7cb6e0_item_add(uint32_t id_masked,
                                         uint32_t item_begin,
                                         uint32_t item_end,
                                         int32_t w0, int32_t w1);
int32_t isaac_room_count_7cb6e0_byte_add(uint32_t id_masked,
                                         uint32_t byte_begin,
                                         uint32_t byte_end,
                                         uint32_t byte_val);
int32_t isaac_room_count_7cb6e0_adjust_2ef8(int32_t esi, uint32_t f2ef8,
                                            uint32_t byte_2ef0,
                                            uint32_t id_masked);
int32_t isaac_room_count_7cb6e0_final_gate(int32_t esi, uint32_t has_1b7);
uint32_t isaac_room_count_7cb6e0_field_gate(uint32_t id, uint32_t value);

#pragma pack(push, 1)
typedef struct IsaacRoomCountSrc { /* 132 bytes */
  uint32_t id;             /* raw arg before mask */
  uint32_t f13c0;          /* [edi+0x13c0] boost field */
  uint32_t gate_202c;      /* byte [edi+0x202c] */
  uint32_t gate_20a9;      /* byte [edi+0x20a9] */
  uint32_t mode_2663c;     /* [Game+0x2663c] */
  uint32_t mode_26584;     /* [Game+0x26584] */
  uint32_t mgr_seed_264f8; /* [Game+0x264f8] */
  int32_t h_count15;       /* recursed count(0x15) result */
  int32_t h_count40;       /* recursed count(0x40) result */
  int32_t h_count4b;       /* recursed count(0x4b) result */
  uint32_t h_bd_r;         /* [ret+0x5c] after HOST 0x740bc0 */
  uint32_t h_rng_raw;      /* HOST 0x7e9020 draw (raw) */
  uint32_t has_8b;         /* HOST 0x7706e0(0x8b) al */
  uint32_t has_1ca;        /* HOST 0x7706e0(0x1ca) al */
  uint32_t has_1b7;        /* HOST 0x7706e0(0x1b7) al */
  uint32_t slot0;          /* [edi+0x16c0] dword */
  uint32_t slot1;          /* [edi+0x16c4] dword */
  uint32_t block_nonnull;  /* [edi+0x17c4] != 0 */
  uint32_t block0;         /* [ptr] */
  uint32_t block4;         /* [ptr+4] */
  uint32_t flag_17cc;      /* byte [edi+0x17cc] */
  uint32_t item_begin;     /* [edi+0x1748] */
  uint32_t item_end;       /* [edi+0x174c] */
  uint32_t item_w0;        /* movsx word [edx+i*4] */
  uint32_t item_w1;        /* movsx word [edx+i*4+2] */
  uint32_t byte_begin;     /* [edi+0x1fe0] */
  uint32_t byte_end;       /* [edi+0x1fe4] */
  uint32_t byte_val;       /* zero-ext [ecx+i] */
  uint32_t f2ef8;          /* [edi+0x2ef8] */
  uint32_t byte_2ef0;      /* byte [edi+0x2ef0] */
  uint32_t h_adder_17;     /* HOST 0x930aa0 al/eax return */
  uint32_t f18dc;          /* [edi+0x18dc] */
  uint32_t f18e0;          /* [edi+0x18e0] */
} IsaacRoomCountSrc;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomCountSrc) == 132,
              "IsaacRoomCountSrc size");

#pragma pack(push, 1)
typedef struct IsaacRoomCountOut { /* 52 bytes */
  int32_t result;          /* esi at the ret */
  uint32_t early_gate;     /* byte 0x202c/0x20a9 return */
  uint32_t early_ret_30;   /* id-0x30 gate returned count15+esi */
  uint32_t sampling_reached;
  uint32_t recurse_15_fired;
  uint32_t recurse_40_fired;
  uint32_t recurse_4b_fired;
  uint32_t host_740bc0_fired;
  uint32_t host_rng_fired;
  uint32_t host_17_fired;
  uint32_t host_8b_fired;
  uint32_t host_1ca_fired;
  uint32_t host_1b7_fired;
} IsaacRoomCountOut;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomCountOut) == 52,
              "IsaacRoomCountOut size");

void isaac_room_count_7cb6e0_plan(const IsaacRoomCountSrc* src,
                                  IsaacRoomCountOut* out);

/* Probe C — FUN_007c3980 six-counter roll (PE 0x007c3980..0x007c3a4e,
   ret 4; thiscall this, arg ptr to RNG state). Fatal arm: *ptr==0 ->
   HOST 0xa112c0 @0x007c39da (args 0x10, ptr 0xb6bf54), re-load,
   still 0 -> int3 trap. Core xorshift on dword [ptr] with shift
   counts from [ptr+4]/[ptr+8]/[ptr+0xc]:
     t = s0 ^ (s0 >>> s1); u = (t << s2) ^ t; w = (u >>> s3) ^ u;
   x86 shift counts mask &31 in hardware; wasm32 shifts do the same
   so the explicit &31 is semantics-preserving (pin s=32 -> shift 0).
   Then div 6 UNSIGNED (xor edx,edx) -> index = remainder;
   counters[this+0x1520 + index*4]++ ; flags [this+0x1574] |= 0x41f.
   Host leaves: 0x763570 @0x007c3a21 unconditional; 0x7abd30
   @0x007c3a3a fired iff [this+0x3fc]==0 && byte [this+0x173]==0. */
static constexpr uint32_t ISAAC_ROOM_ROLL_VA = 0x007c3980u;
static constexpr uint32_t ISAAC_ROOM_ROLL_RET_VA = 0x007c3a4eu;
static constexpr uint32_t ISAAC_ROOM_ROLL_FATAL_CALL_VA = 0x007c39dau;
static constexpr uint32_t ISAAC_ROOM_ROLL_FATAL_HOST_VA = 0x00a112c0u;
static constexpr uint32_t ISAAC_ROOM_ROLL_STATE_PTR_ARG = 8u; /* [ebp+8] */
static constexpr uint32_t ISAAC_ROOM_ROLL_S1_OFF = 4u;
static constexpr uint32_t ISAAC_ROOM_ROLL_S2_OFF = 8u;
static constexpr uint32_t ISAAC_ROOM_ROLL_S3_OFF = 0xcu;
static constexpr uint32_t ISAAC_ROOM_ROLL_COUNTER_BASE_OFF = 0x1520u;
static constexpr uint32_t ISAAC_ROOM_ROLL_COUNTER_STRIDE = 4u;
static constexpr uint32_t ISAAC_ROOM_ROLL_COUNTER_COUNT = 6u;
static constexpr uint32_t ISAAC_ROOM_ROLL_FLAGS_OFF = 0x1574u;
static constexpr uint32_t ISAAC_ROOM_ROLL_FLAGS_MASK = 0x41fu;
static constexpr uint32_t ISAAC_ROOM_ROLL_DIVISOR = 6u;
static constexpr uint32_t ISAAC_ROOM_ROLL_HOST_A_VA = 0x00763570u;
static constexpr uint32_t ISAAC_ROOM_ROLL_HOST_A_SITE_VA = 0x007c3a21u;
static constexpr uint32_t ISAAC_ROOM_ROLL_HOST_B_VA = 0x007abd30u;
static constexpr uint32_t ISAAC_ROOM_ROLL_HOST_B_SITE_VA = 0x007c3a3au;
static constexpr uint32_t ISAAC_ROOM_ROLL_GATE_F3FC_OFF = 0x3fcu;
static constexpr uint32_t ISAAC_ROOM_ROLL_GATE_BYTE173_OFF = 0x173u;

#pragma pack(push, 1)
typedef struct IsaacRoomRollOut { /* 12 bytes */
  uint32_t new_s0;   /* stored back to [ptr] */
  uint32_t index;    /* w % 6 counter selector */
  uint32_t fatal;    /* *ptr==0 fatal arm entered */
} IsaacRoomRollOut;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomRollOut) == 12, "IsaacRoomRollOut size");

void isaac_room_roll_7c3980_core(uint32_t s0, uint32_t s1, uint32_t s2,
                                 uint32_t s3, IsaacRoomRollOut* out);
uint32_t isaac_room_roll_7c3980_flags_or(uint32_t old_flags);
uint32_t isaac_room_roll_7c3980_followup_gate(uint32_t f3fc,
                                              uint32_t byte_173);

static constexpr uint32_t ISAAC_ROOM_IDX29_ROLL_FIRST_JLE_VA = 0x007fbab2u;
static constexpr uint32_t ISAAC_ROOM_IDX29_ROLL_SECOND_JLE_VA = 0x007fbaccu;

#pragma pack(push, 1)
typedef struct IsaacRoomIdx29RollPlanOut { /* 8 bytes */
  uint32_t roll_first;
  uint32_t roll_second;
} IsaacRoomIdx29RollPlanOut;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomIdx29RollPlanOut) == 8,
              "IsaacRoomIdx29RollPlanOut size");

void isaac_room_idx29_roll_plan(int32_t q, IsaacRoomIdx29RollPlanOut* out);

/* ---- v87 (ABI bump 84 -> 85): B3B7 SMALL GridEntity Update leaves ----
   The five D5 slot-2 dispatches (`call [ecx]` @0x00803bd8 over cells
   [Room+idx*4+0x24], base vtbl 0xb686e8) resolve per dynamic type; this
   unit freezes the four SMALL concrete Update bodies named by the
   evidence pack section-notes/update-boundary-evidence/b3b7-leaves/
   (fresh PE dumps cpu-dump/0040c200.txt + 00838520.txt + 00983330.txt +
   0071f090.txt, sha256 5129df72...). Host leaves stay typed with exact
   VAs; pure decisions land as laws. */

/* Wall — GridEntity_Wall vtbl+2 entry is the ICF-folded trivial body
   (PE 0x0040c200..0x0040c203, one insn `c2 00 00`, int3-bounded).
   NO-OP contract: no loads, no stores, no calls. Guest eax is left
   UNDEFINED by the machine body (callers ignore it); the law pins the
   observable effect-free behaviour as ret 0. */
static constexpr uint32_t ISAAC_ROOM_WALL_UPDATE_VA = 0x0040c200u;
static constexpr uint32_t ISAAC_ROOM_WALL_UPDATE_END_VA = 0x0040c203u;
static constexpr uint32_t ISAAC_ROOM_WALL_UPDATE_RET = 0u;

uint32_t isaac_room_wall_update_40c200(void);

/* Statue — FUN_00838520 (PE 0x00838520..0x0083855e, thiscall). Body:
   byte gate [this+0x149] fires the typed-host member teardown pair
   HOST 0x00409030 on sub-objects this+0x70 (site 0x0083852f) and
   this+0x90 (site 0x0083853a); then the dword state [this+0xc]
   exact-matches drive the ONLY guest store [this+0x3c]: ==1 -> 3,
   ==2 -> 0, anything else stores NOTHING. */
static constexpr uint32_t ISAAC_ROOM_STATUE_UPDATE_VA = 0x00838520u;
static constexpr uint32_t ISAAC_ROOM_STATUE_UPDATE_END_VA = 0x0083855eu;
static constexpr uint32_t ISAAC_ROOM_STATUE_HOST_TEARDOWN_VA = 0x00409030u;
static constexpr uint32_t ISAAC_ROOM_STATUE_HOST_SITE_A_VA = 0x0083852fu;
static constexpr uint32_t ISAAC_ROOM_STATUE_HOST_SITE_B_VA = 0x0083853au;
static constexpr uint32_t ISAAC_ROOM_STATUE_FLAG_OFF = 0x149u;
static constexpr uint32_t ISAAC_ROOM_STATUE_STATE_OFF = 0xcu;
static constexpr uint32_t ISAAC_ROOM_STATUE_VAR_OFF = 0x3cu;
static constexpr int32_t ISAAC_ROOM_STATUE_STATE_STORE3 = 1;
static constexpr int32_t ISAAC_ROOM_STATUE_STATE_STORE0 = 2;

#pragma pack(push, 1)
typedef struct IsaacRoomStatueUpdateOut { /* 12 bytes */
  uint32_t host_calls;  /* count of HOST 0x409030 teardown calls (0 or 2) */
  uint32_t store_fired; /* [esi+0x3c] store executed */
  int32_t store_value;  /* 3 (state==1) / 0 (state==2) / 0 when not fired */
} IsaacRoomStatueUpdateOut;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomStatueUpdateOut) == 12,
              "IsaacRoomStatueUpdateOut size");

void isaac_room_statue_838520_plan(uint32_t flag_149, int32_t state_c,
                                   IsaacRoomStatueUpdateOut* out);

/* PressurePlate — FUN_00983330 (PE 0x00983330..0x009833b4, thiscall).
   Same byte-gate teardown pair as Statue (HOST 0x00409030 at sites
   0x00983346/0x00983351). Type dispatch: [this+8]-2 `je` -> HOST
   0x009839f0 else HOST 0x009833c0 (both typed-host, this=esi).
   Clear-delay tail: idx=[this+0x24] bounded UNSIGNED by 0x1bf against
   manager global [[0xc71678]+0x18300] element base +idx*4 +0x76c;
   SIGNED jge skip when elem >= 0x12c; then state [this+0xc]==0 and a
   SECOND UNSIGNED idx bound gate the store elem := 0x12c. ORIGINAL
   DEFECT reproduced: negative timer words compare SIGNED-OPEN and get
   reset; out-of-range idx can never store (both bounds re-checked). */
static constexpr uint32_t ISAAC_ROOM_PLATE_UPDATE_VA = 0x00983330u;
static constexpr uint32_t ISAAC_ROOM_PLATE_UPDATE_END_VA = 0x009833b4u;
static constexpr uint32_t ISAAC_ROOM_PLATE_HOST_TEARDOWN_VA = 0x00409030u;
static constexpr uint32_t ISAAC_ROOM_PLATE_HOST_SITE_A_VA = 0x00983346u;
static constexpr uint32_t ISAAC_ROOM_PLATE_HOST_SITE_B_VA = 0x00983351u;
static constexpr uint32_t ISAAC_ROOM_PLATE_HOST_DISPATCH1_VA = 0x009833c0u;
static constexpr uint32_t ISAAC_ROOM_PLATE_HOST_DISPATCH2_VA = 0x009839f0u;
static constexpr uint32_t ISAAC_ROOM_PLATE_GAME_GLOBAL = 0x00c71678u;
static constexpr uint32_t ISAAC_ROOM_PLATE_MGR_LIST_OFF = 0x18300u;
static constexpr uint32_t ISAAC_ROOM_PLATE_ELEM_OFF = 0x76cu;
static constexpr uint32_t ISAAC_ROOM_PLATE_IDX_BOUND = 0x1bfu;
static constexpr int32_t ISAAC_ROOM_PLATE_TIMER_SET = 0x12c;
static constexpr uint32_t ISAAC_ROOM_PLATE_TYPE_OFF = 0x8u;
static constexpr uint32_t ISAAC_ROOM_PLATE_STATE_OFF = 0xcu;
static constexpr uint32_t ISAAC_ROOM_PLATE_IDX_OFF = 0x24u;
static constexpr uint32_t ISAAC_ROOM_PLATE_FLAG_OFF = 0x149u;

#pragma pack(push, 1)
typedef struct IsaacRoomPlateUpdateOut { /* 16 bytes */
  uint32_t host_calls;   /* count of HOST 0x409030 teardown calls */
  uint32_t dispatch_va;  /* typed-host type-dispatch callee entered */
  uint32_t store_fired;  /* clear-delay elem store executed */
  int32_t elem_new;      /* elem value after the body (0x12c or unchanged) */
} IsaacRoomPlateUpdateOut;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomPlateUpdateOut) == 16,
              "IsaacRoomPlateUpdateOut size");

/* SIGNED jge law 0x98338e: returns 1 iff the timer is still OPEN
   (elem_cur < 0x12c signed -> jge NOT taken). */
uint32_t isaac_room_pressureplate_983330_timer_gate(int32_t elem_cur);

void isaac_room_pressureplate_983330_plan(uint32_t flag_149, uint32_t type_8,
                                          int32_t state_c, uint32_t idx_24,
                                          int32_t elem_cur,
                                          IsaacRoomPlateUpdateOut* out);

/* TNT — FUN_0071F090 head (PE 0x0071f090..0x0071f237; 20-insn CFG head
   + switch arms). Head law: ecx=[this+0xc]; cmp 4; cmovge eax(SIGNED)
   picks stored [this+0x3c] = (state>=4 signed ? 0 : 2) @0x71f0ad — the
   ONLY guest store; the SAME flags then feed `ja 0x71f231` (UNSIGNED)
   whose taken arm is the plain epilogue ret; otherwise dispatch is
   `jmp [ecx*4 + 0x71f238]` over the pinned 5-entry table (entry 1 folds
   onto arm 0x71f0bd exactly like entry 0). Switch ARMS stay typed-host
   leaves: 0x0071f0bd (push 0xb1bc54 sound), 0x0071f0d2 (push 0xb67814),
   0x0071f222 (push 0xb67820), 0x0071f0e7 (fuse/explode chain incl.
   RNG 0x6eef60 + spawn relay 0x6fe410 + clear-delay store 0x384) —
   REMAINING-HOST blockers with those exact VAs. */
static constexpr uint32_t ISAAC_ROOM_TNT_UPDATE_VA = 0x0071f090u;
static constexpr uint32_t ISAAC_ROOM_TNT_HEAD_END_VA = 0x0071f237u;
static constexpr uint32_t ISAAC_ROOM_TNT_DEFAULT_RET_VA = 0x0071f231u;
static constexpr uint32_t ISAAC_ROOM_TNT_TABLE_VA = 0x0071f238u;
static constexpr uint32_t ISAAC_ROOM_TNT_TABLE[5] = {
    0x0071f0bdu, 0x0071f0bdu, 0x0071f0d2u, 0x0071f222u, 0x0071f0e7u};
static constexpr uint32_t ISAAC_ROOM_TNT_TABLE_SIZE = 5u;
static constexpr int32_t ISAAC_ROOM_TNT_CMP_BOUND = 4;
static constexpr uint32_t ISAAC_ROOM_TNT_STATE_OFF = 0xcu;
static constexpr uint32_t ISAAC_ROOM_TNT_VAR_OFF = 0x3cu;

#pragma pack(push, 1)
typedef struct IsaacRoomTntHeadOut { /* 12 bytes */
  int32_t stored_3c;     /* [edi+0x3c] value from the cmovge select */
  uint32_t dispatch_va;  /* table arm entered / default-ret VA */
  uint32_t default_taken; /* ja 0x71f231 taken (state > 4 unsigned) */
} IsaacRoomTntHeadOut;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomTntHeadOut) == 12, "IsaacRoomTntHeadOut size");

uint32_t isaac_room_tnt_table_value(uint32_t index);
void isaac_room_tnt_71f090_head(uint32_t state_c, IsaacRoomTntHeadOut* out);


/* ---- v88 (ABI bump 85 -> 86): MEDIUM GridEntity Update bodies GRAVITY
   (FUN_0099b980, PE 0x0099b980..0x0099bac5, vtbl 0xb7d99c slot 2) and LOCK
   (FUN_00711950, PE 0x00711950..0x00711ae7, vtbl 0xb68e84 slot 2); evidence
   pack section-notes/update-boundary-evidence/grid-bodies-large/, fresh PE
   dumps cpu-dump/0099b980.txt + 00711950.txt + callee heads 0040add0.txt +
   00711af0.txt. Host leaves stay typed with exact VAs. .data floats
   section-table verified this pass: 40.0f @0xbaa904, 120.0f @0xbaaa00,
   HALF 0.5f @0xbaa2d0 (= family pin), R2 960.0f @0xbaabbc = 0x44704000
   (NEW). */

/* Gravity — walks Game's grid-entity list ([Game+0x1baa8..0x1baac], count =
   SAR((u32)(hi-lo),2)); per entity it derives the cell index from the
   entity position and fires a flag RMW on the entity whose cell equals
   [this+0x24]. Per-entity law (0x99ba46..0x99ba7c):
     cx = cvttss2si((px-40.0f)/40.0f + HALF), cy likewise from py-120.0f
     (each sub/div/add f32-rounded; cvttss truncates toward zero, NaN or
     |v| >= 2^31 -> integer-indefinite 0x80000000);
     SIGNED js/jge bounds vs [mgr+0xc]/[mgr+0x10] -> idx = (u32)(w*cy)+cx
     u32 wrap else -1;
     idx == [this+0x24] (SIGNED eq) -> [ent+0x168] |= 0x8000 and
     [ent+0x16c] read back UNCHANGED (the dead RMW pair 0x99ba6c..0x99ba7c).
   The vector walk itself stays host: empty-vector fatal HOST 0xa112c0 at
   site 0x0099b9da (args {0x10, ptr 0xb7e6bc}; out-of-range reads *begin,
   same ORIGINAL DEFECT family as idx29-at). Tail teardown
   (0x99baa2..0x99bab9): byte gate [this+0x149], LOW 8 BITS only, fires the
   typed teardown pair HOST 0x409030 on this+0x70 / this+0x90 (sites
   0x0099baae/0x0099bab9). */
static constexpr uint32_t ISAAC_ROOM_GRAVITY_UPDATE_VA = 0x0099b980u;
static constexpr uint32_t ISAAC_ROOM_GRAVITY_UPDATE_END_VA = 0x0099bac5u;
static constexpr uint32_t ISAAC_ROOM_GRAVITY_GAME_GLOBAL = 0x00c71678u;
static constexpr uint32_t ISAAC_ROOM_GRAVITY_LIST_LO_OFF = 0x1baa8u;
static constexpr uint32_t ISAAC_ROOM_GRAVITY_LIST_HI_OFF = 0x1baacu;
static constexpr uint32_t ISAAC_ROOM_GRAVITY_MGR_OFF = 0x18300u;
static constexpr uint32_t ISAAC_ROOM_GRAVITY_MGR_W_OFF = 0xcu;
static constexpr uint32_t ISAAC_ROOM_GRAVITY_MGR_H_OFF = 0x10u;
static constexpr uint32_t ISAAC_ROOM_GRAVITY_POS_X_OFF = 0x33cu;
static constexpr uint32_t ISAAC_ROOM_GRAVITY_POS_Y_OFF = 0x340u;
static constexpr uint32_t ISAAC_ROOM_GRAVITY_SCALE_VA = 0x00baa904u;
static constexpr uint32_t ISAAC_ROOM_GRAVITY_SCALE_BITS = 0x42200000u;
static constexpr uint32_t ISAAC_ROOM_GRAVITY_ADDY_VA = 0x00baaa00u;
static constexpr uint32_t ISAAC_ROOM_GRAVITY_ADDY_BITS = 0x42f00000u;
static constexpr uint32_t ISAAC_ROOM_GRAVITY_HALF_VA = 0x00baa2d0u;
static constexpr uint32_t ISAAC_ROOM_GRAVITY_HALF_BITS = 0x3f000000u;
static constexpr uint32_t ISAAC_ROOM_GRAVITY_IDX_OFF = 0x24u;
static constexpr uint32_t ISAAC_ROOM_GRAVITY_FLAG_FIELD_OFF = 0x168u;
static constexpr uint32_t ISAAC_ROOM_GRAVITY_FLAG_OR = 0x8000u;
static constexpr uint32_t ISAAC_ROOM_GRAVITY_FIELD_16C_OFF = 0x16cu;
static constexpr uint32_t ISAAC_ROOM_GRAVITY_FATAL_HOST_VA = 0x00a112c0u;
static constexpr uint32_t ISAAC_ROOM_GRAVITY_FATAL_SITE_VA = 0x0099b9dau;
static constexpr uint32_t ISAAC_ROOM_GRAVITY_HOST_TEARDOWN_VA = 0x00409030u;
static constexpr uint32_t ISAAC_ROOM_GRAVITY_HOST_SITE_A_VA = 0x0099baaeu;
static constexpr uint32_t ISAAC_ROOM_GRAVITY_HOST_SITE_B_VA = 0x0099bab9u;
static constexpr uint32_t ISAAC_ROOM_GRAVITY_FLAG_OFF = 0x149u;

#pragma pack(push, 1)
typedef struct IsaacRoomGravity99b980IterSrc { /* 20 bytes */
  uint32_t pos_x_bits; /* f32 bits of [ent+0x33c] */
  uint32_t pos_y_bits; /* f32 bits of [ent+0x340] */
  int32_t this_idx;    /* [this+0x24] */
  uint32_t mgr_w;      /* [mgr+0xc] */
  uint32_t mgr_h;      /* [mgr+0x10] */
} IsaacRoomGravity99b980IterSrc;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomGravity99b980IterSrc) == 20,
              "IsaacRoomGravity99b980IterSrc size");

#pragma pack(push, 1)
typedef struct IsaacRoomGravity99b980IterOut { /* 20 bytes */
  uint32_t cell_x_bits; /* raw cvttss2si result (0x80000000 indefinite) */
  uint32_t cell_y_bits;
  int32_t cell_idx;     /* SIGNED-bounds law: w*cy+cx u32 wrap else -1 */
  uint32_t match;       /* cell_idx == [this+0x24] */
  uint32_t flag_or;     /* 0x8000 under match else 0 ([ent+0x168]) */
} IsaacRoomGravity99b980IterOut;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomGravity99b980IterOut) == 20,
              "IsaacRoomGravity99b980IterOut size");

void isaac_room_gravity_99b980_iter_plan(
    const IsaacRoomGravity99b980IterSrc* src,
    IsaacRoomGravity99b980IterOut* out);
uint32_t isaac_room_gravity_99b980_tail_teardown(uint32_t flag149);

/* Lock — head (0x71195c..0x7119ac): [this+0x74]!=0 AND the typed-host
   IsType probe HOST 0x40add0(this+0x70, id 0xb6287c) returning nonzero ->
   [this+0x3c] := 0 ALWAYS, plus manager clear-delay elem
   [[Game+0x18300]+idx*4+0x76c] := 0 iff idx=[this+0x24] passes the
   UNSIGNED ja bound 0x1bf; BOTH paths converge on the loop gate
   [this+0xc]==0 (nonzero skips the whole scan). Per-entity law
   (0x711a22..0x711a94): skip when [ent+0x2c]!=0; SIGNED idiv idx/w
   (quot eax, rem edx; divisor 0 or INT_MIN/-1 is the PE #DE fault arm —
   pinned as trap with quot=rem=0 and no downstream fire);
   dx = px - (f32(rem)*40.0f + 40.0f), dy = py - (f32(quot)*40.0f +
   120.0f) (every mul/add f32-rounded); dist2 = dy*dy + dx*dx (f32);
   ORDERED comiss r2=960.0f > dist2 -> typed-HOST open leaf
   0x711af0(ent, 0) at site 0x00711a8f (result discarded). Loop walk +
   empty-vector fatal HOST 0xa112c0 at site 0x007119f5 stay host. Tail
   teardown identical byte-gate pair (sites 0x00711acc/0x00711adb). */
static constexpr uint32_t ISAAC_ROOM_LOCK_UPDATE_VA = 0x00711950u;
static constexpr uint32_t ISAAC_ROOM_LOCK_UPDATE_END_VA = 0x00711ae7u;
static constexpr uint32_t ISAAC_ROOM_LOCK_GAME_GLOBAL = 0x00c71678u;
static constexpr uint32_t ISAAC_ROOM_LOCK_MGR_OFF = 0x18300u;
static constexpr uint32_t ISAAC_ROOM_LOCK_GATE74_OFF = 0x74u;
static constexpr uint32_t ISAAC_ROOM_LOCK_IS_TYPE_HOST_VA = 0x0040add0u;
static constexpr uint32_t ISAAC_ROOM_LOCK_IS_TYPE_SITE_VA = 0x0071196eu;
static constexpr uint32_t ISAAC_ROOM_LOCK_IS_TYPE_ID = 0xb6287cu;
static constexpr uint32_t ISAAC_ROOM_LOCK_VAR_OFF = 0x3cu;
static constexpr uint32_t ISAAC_ROOM_LOCK_IDX_OFF = 0x24u;
static constexpr uint32_t ISAAC_ROOM_LOCK_IDX_BOUND = 0x1bfu;
static constexpr uint32_t ISAAC_ROOM_LOCK_ELEM_OFF = 0x76cu;
static constexpr uint32_t ISAAC_ROOM_LOCK_STATE_OFF = 0xcu;
static constexpr uint32_t ISAAC_ROOM_LOCK_ENT_GATE_OFF = 0x2cu;
static constexpr uint32_t ISAAC_ROOM_LOCK_POS_X_OFF = 0x33cu;
static constexpr uint32_t ISAAC_ROOM_LOCK_POS_Y_OFF = 0x340u;
static constexpr uint32_t ISAAC_ROOM_LOCK_SCALE_VA = 0x00baa904u;
static constexpr uint32_t ISAAC_ROOM_LOCK_SCALE_BITS = 0x42200000u;
static constexpr uint32_t ISAAC_ROOM_LOCK_ADDY_VA = 0x00baaa00u;
static constexpr uint32_t ISAAC_ROOM_LOCK_ADDY_BITS = 0x42f00000u;
static constexpr uint32_t ISAAC_ROOM_LOCK_R2_VA = 0x00baabbcu;
static constexpr uint32_t ISAAC_ROOM_LOCK_R2_BITS = 0x44704000u;
static constexpr uint32_t ISAAC_ROOM_LOCK_HOST_OPEN_VA = 0x00711af0u;
static constexpr uint32_t ISAAC_ROOM_LOCK_HOST_OPEN_SITE_VA = 0x00711a8fu;
static constexpr uint32_t ISAAC_ROOM_LOCK_FATAL_HOST_VA = 0x00a112c0u;
static constexpr uint32_t ISAAC_ROOM_LOCK_FATAL_SITE_VA = 0x007119f5u;
static constexpr uint32_t ISAAC_ROOM_LOCK_HOST_TEARDOWN_VA = 0x00409030u;
static constexpr uint32_t ISAAC_ROOM_LOCK_HOST_SITE_A_VA = 0x00711accu;
static constexpr uint32_t ISAAC_ROOM_LOCK_HOST_SITE_B_VA = 0x00711adbu;
static constexpr uint32_t ISAAC_ROOM_LOCK_FLAG_OFF = 0x149u;

#pragma pack(push, 1)
typedef struct IsaacRoomLock711950HeadSrc { /* 16 bytes */
  uint32_t flag_74;   /* [this+0x74] */
  uint32_t h_is_type; /* HOST 0x40add0 al byte */
  uint32_t idx_24;    /* [this+0x24] raw dword */
  int32_t elem_cur;   /* clear-delay elem before the body */
} IsaacRoomLock711950HeadSrc;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomLock711950HeadSrc) == 16,
              "IsaacRoomLock711950HeadSrc size");

#pragma pack(push, 1)
typedef struct IsaacRoomLock711950HeadOut { /* 12 bytes */
  uint32_t var3c_cleared;   /* [this+0x3c] := 0 fired */
  uint32_t elem_store_fired;
  int32_t elem_new;
} IsaacRoomLock711950HeadOut;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomLock711950HeadOut) == 12,
              "IsaacRoomLock711950HeadOut size");

#pragma pack(push, 1)
typedef struct IsaacRoomLock711950IterSrc { /* 20 bytes */
  uint32_t pos_x_bits;  /* f32 bits of [ent+0x33c] */
  uint32_t pos_y_bits;  /* f32 bits of [ent+0x340] */
  uint32_t ent_gate_2c; /* [ent+0x2c] */
  int32_t this_idx;     /* idiv dividend ([this+0x24]) */
  int32_t mgr_w;        /* idiv divisor ([mgr+0xc]) */
} IsaacRoomLock711950IterSrc;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomLock711950IterSrc) == 20,
              "IsaacRoomLock711950IterSrc size");

#pragma pack(push, 1)
typedef struct IsaacRoomLock711950IterOut { /* 32 bytes */
  uint32_t gate2c_skip;
  uint32_t idiv_trap; /* PE #DE fault arm (divisor 0 / INT_MIN over -1) */
  int32_t quot;
  int32_t rem;
  uint32_t dx_bits;
  uint32_t dy_bits;
  uint32_t dist2_bits;
  uint32_t host_fired; /* ordered dist2 < r2 -> HOST 0x711af0 site */
} IsaacRoomLock711950IterOut;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomLock711950IterOut) == 32,
              "IsaacRoomLock711950IterOut size");

void isaac_room_lock_711950_head(const IsaacRoomLock711950HeadSrc* src,
                                 IsaacRoomLock711950HeadOut* out);
void isaac_room_lock_711950_iter_plan(const IsaacRoomLock711950IterSrc* src,
                                      IsaacRoomLock711950IterOut* out);
uint32_t isaac_room_lock_711950_tail_teardown(uint32_t flag149);

/* ---- v89 (ABI bump 86 -> 87): MEDIUM GridEntity Update bodies WEB
   (FUN_00721780, PE 0x00721780..0x00721a0e, vtbl 0xb69558 slot 2) and
   DECORATION (FUN_0099a8e0, PE 0x0099a8e0..0x0099abf7, vtbl 0xb686c0
   slot 2); evidence pack grid-bodies-large/, listings web_00721780.txt +
   decoration_0099a8e0.txt. Host leaves stay typed with exact VAs.
   .rdata/.data floats section-table verified this pass: 40.0f @0xbaa904,
   120.0f @0xbaaa00, THRESHOLD 21.0f @0xbaa880, X BASE 60.0f @0xbaa950,
   Y BASE 140.0f @0xbaaa30, POS SCALE 0.65f @0xbaa324 = 0x3f266666,
   X SPAN-OFF 338.0f @0xbaab20, Y SPAN-OFF 182.0f @0xbaaa7c, HALF
   0.5f @0xbaa2d0 (= family pin), SCALE1 1.0f @0xbf941c, SCALE2
   2.0f @0xbf93e8; PHASE STEP imm 0x3c23d70a = 0.01f. The two wobble
   phase globals 0xc78dc4 / 0xc78edc are past the .data raw end
   (zero-at-load BSS) -> HOST inputs. */

/* Web — head gates (0x721789..0x7217ce): [this+0xc]==0 AND SIGNED
   frame%4==0 ([Game+0x264f8], the and 0x80000003 + dec/or/add sign
   fixup idiom) AND grid count SAR((hi-lo),2) != 0 else straight to the
   tail. Per-entity law (0x7217d4..0x721900):
     type gate [ent+0x184] in {0,1,2,3} (four EXACT cmp/je arms ==
     UNSIGNED <4) -> skip;
     query chain: typed-HOST HasCollectible 0x7706e0(ent, 0x278, 0) at
     site 0x00721838; on zero al a SECOND typed-HOST probe
     0x9305f0(ent+0x1508, 0x278) at site 0x0072184c;
     latch region reached iff EITHER probe hit: [this+4]==0xa `je`
     continues the loop SKIPPING both toggle and proximity; otherwise
     byte [ent+0x26d4] := setne(old) — a STICKY SET to {0,1}, NOT an xor
     toggle (ORIGINAL DEFECT reproduced);
     proximity runs when NEITHER probe hit OR (hit AND kind!=0xa):
     dx = px - (f32(rem)*40.0f + 40.0f), dy = py - (f32(quot)*40.0f +
     120.0f) with SIGNED cdq/idiv idx=[this+0x24] over [mgr+0xc]
     (#DE trap arm pinned like Lock), andps abs pair, comiss/cmovbe
     selects MAX(|dx|,|dy|) (|dy|<=|dx| ORDERED-or-unordered picks
     |dx|), then ORDERED comiss thr=21.0f > max fires the effect-spawn
     HOST 0x6ad750 at site 0x007219c2 whose 11-dword immediate template
     (B+0x00..0x28, incl. the dead 0.75f store overwritten by 1.0f at
     the same address) is pinned bit-exact below.
   Empty-vector fatal HOST 0xa112c0(0x10, 0xb7e6bc) at site 0x007217eb
   stays host. Tail teardown (0x7219e8..0x721a06): LOW-8-bit gate
   [this+0x149] fires HOST 0x409030 on this+0x70 / this+0x90 (sites
   0x007219f4/0x00721a03). */
static constexpr uint32_t ISAAC_ROOM_WEB_UPDATE_VA = 0x00721780u;
static constexpr uint32_t ISAAC_ROOM_WEB_UPDATE_END_VA = 0x00721a0eu;
static constexpr uint32_t ISAAC_ROOM_WEB_GAME_GLOBAL = 0x00c71678u;
static constexpr uint32_t ISAAC_ROOM_WEB_FRAME_OFF = 0x264f8u;
static constexpr uint32_t ISAAC_ROOM_WEB_LIST_LO_OFF = 0x1baa8u;
static constexpr uint32_t ISAAC_ROOM_WEB_LIST_HI_OFF = 0x1baacu;
static constexpr uint32_t ISAAC_ROOM_WEB_MGR_OFF = 0x18300u;
static constexpr uint32_t ISAAC_ROOM_WEB_MGR_W_OFF = 0xcu;
static constexpr uint32_t ISAAC_ROOM_WEB_STATE_OFF = 0xcu;
static constexpr uint32_t ISAAC_ROOM_WEB_KIND_OFF = 0x4u;
static constexpr uint32_t ISAAC_ROOM_WEB_KIND_DISPATCH = 0xau;
static constexpr uint32_t ISAAC_ROOM_WEB_IDX_OFF = 0x24u;
static constexpr uint32_t ISAAC_ROOM_WEB_FLAG_OFF = 0x149u;
static constexpr uint32_t ISAAC_ROOM_WEB_ENT_TYPE_OFF = 0x184u;
static constexpr uint32_t ISAAC_ROOM_WEB_LATCH_OFF = 0x26d4u;
static constexpr uint32_t ISAAC_ROOM_WEB_POS_X_OFF = 0x33cu;
static constexpr uint32_t ISAAC_ROOM_WEB_POS_Y_OFF = 0x340u;
static constexpr uint32_t ISAAC_ROOM_WEB_ALT_OBJ_OFF = 0x1508u;
static constexpr uint32_t ISAAC_ROOM_WEB_QUERY_ID = 0x278u;
static constexpr uint32_t ISAAC_ROOM_WEB_HOST_TEARDOWN_VA = 0x00409030u;
static constexpr uint32_t ISAAC_ROOM_WEB_HOST_SITE_A_VA = 0x007219f4u;
static constexpr uint32_t ISAAC_ROOM_WEB_HOST_SITE_B_VA = 0x00721a03u;
static constexpr uint32_t ISAAC_ROOM_WEB_HOST_QUERY_DIRECT_VA = 0x007706e0u;
static constexpr uint32_t ISAAC_ROOM_WEB_QUERY_DIRECT_SITE_VA = 0x00721838u;
static constexpr uint32_t ISAAC_ROOM_WEB_HOST_QUERY_ALT_VA = 0x009305f0u;
static constexpr uint32_t ISAAC_ROOM_WEB_QUERY_ALT_SITE_VA = 0x0072184cu;
static constexpr uint32_t ISAAC_ROOM_WEB_HOST_SPAWN_VA = 0x006ad750u;
static constexpr uint32_t ISAAC_ROOM_WEB_SPAWN_SITE_VA = 0x007219c2u;
static constexpr uint32_t ISAAC_ROOM_WEB_FATAL_HOST_VA = 0x00a112c0u;
static constexpr uint32_t ISAAC_ROOM_WEB_FATAL_SITE_VA = 0x007217ebu;
static constexpr uint32_t ISAAC_ROOM_WEB_SCALE_VA = 0x00baa904u;
static constexpr uint32_t ISAAC_ROOM_WEB_SCALE_BITS = 0x42200000u;
static constexpr uint32_t ISAAC_ROOM_WEB_ADDY_VA = 0x00baaa00u;
static constexpr uint32_t ISAAC_ROOM_WEB_ADDY_BITS = 0x42f00000u;
static constexpr uint32_t ISAAC_ROOM_WEB_THRESH_VA = 0x00baa880u;
static constexpr uint32_t ISAAC_ROOM_WEB_THRESH_BITS = 0x41a80000u;
static constexpr uint32_t ISAAC_ROOM_WEB_SPAWN_TEMPLATE[11] = {
    0x3f800000u, /* [+0x00] 1.0f (dead 0.75f store @0x72195c overwritten
                    by this @0x721963 — same dword address) */
    0x3f800000u, /* [+0x04] 1.0f */
    0x3fa66666u, /* [+0x08] 1.3f */
    0x3f800000u, /* [+0x0c] 1.0f */
    0x00000000u, /* [+0x10] */
    0x00000000u, /* [+0x14] */
    0x00000000u, /* [+0x18] */
    0x00000000u, /* [+0x1c] */
    0x3e20a0a1u, /* [+0x20] ~0.157f */
    0x3e20a0a1u, /* [+0x24] */
    0x3e20a0a1u, /* [+0x28] */
};
static constexpr uint32_t ISAAC_ROOM_WEB_SPAWN_TEMPLATE_SIZE = 11u;

#pragma pack(push, 1)
typedef struct IsaacRoomWeb721780BodySrc { /* 16 bytes */
  int32_t state_c;      /* [this+0xc] */
  int32_t frame_264f8;  /* [Game+0x264f8] */
  int32_t grid_count;   /* SAR((hi-lo),2) at the head */
  uint32_t flag_149;    /* [this+0x149] low 8 bits tested */
} IsaacRoomWeb721780BodySrc;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomWeb721780BodySrc) == 16,
              "IsaacRoomWeb721780BodySrc size");

#pragma pack(push, 1)
typedef struct IsaacRoomWeb721780BodyOut { /* 12 bytes */
  uint32_t frame_mod4;    /* SIGNED %4 law result */
  uint32_t loop_entered;  /* all three head gates passed */
  uint32_t teardown_pairs; /* tail HOST 0x409030 pair (0 or 2) */
} IsaacRoomWeb721780BodyOut;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomWeb721780BodyOut) == 12,
              "IsaacRoomWeb721780BodyOut size");

#pragma pack(push, 1)
typedef struct IsaacRoomWeb721780IterSrc { /* 36 bytes */
  uint32_t type_184;       /* [ent+0x184] */
  uint32_t h_query_direct; /* HOST 0x7706e0 al byte */
  uint32_t h_query_alt;    /* HOST 0x9305f0 al byte */
  uint32_t kind_4;         /* [this+4] vs 0xa dispatch */
  uint32_t latch_26d4;     /* [ent+0x26d4] old byte value */
  int32_t idx_24;          /* idiv dividend ([this+0x24]) */
  int32_t mgr_w;           /* idiv divisor ([[Game+0x18300]+0xc]) */
  uint32_t pos_x_bits;     /* f32 bits of [ent+0x33c] */
  uint32_t pos_y_bits;     /* f32 bits of [ent+0x340] */
} IsaacRoomWeb721780IterSrc;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomWeb721780IterSrc) == 36,
              "IsaacRoomWeb721780IterSrc size");

#pragma pack(push, 1)
typedef struct IsaacRoomWeb721780IterOut { /* 48 bytes */
  uint32_t type_skip;     /* [ent+0x184] < 4 unsigned -> iteration no-op */
  uint32_t query_hosts;   /* 1 (direct hit) / 2 (both probes fired) */
  uint32_t toggle_fired;  /* sticky-set store executed */
  uint32_t latch_new;     /* setne result stored to [ent+0x26d4] */
  uint32_t prox_checked;  /* proximity block entered */
  uint32_t idiv_trap;     /* PE #DE fault arm (divisor 0 / INT_MIN/-1) */
  int32_t quot;
  int32_t rem;
  uint32_t dx_bits;
  uint32_t dy_bits;
  uint32_t dist_max_bits; /* comiss/cmovbe MAX(|dx|,|dy|) selection */
  uint32_t spawn_fired;   /* ORDERED 21.0f > max -> HOST 0x6ad750 */
} IsaacRoomWeb721780IterOut;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomWeb721780IterOut) == 48,
              "IsaacRoomWeb721780IterOut size");

void isaac_room_web_721780_body(const IsaacRoomWeb721780BodySrc* src,
                                IsaacRoomWeb721780BodyOut* out);
uint32_t isaac_room_web_721780_frame_mod4(int32_t frame);
uint32_t isaac_room_web_721780_type_gate(uint32_t type_184);
void isaac_room_web_721780_iter_plan(const IsaacRoomWeb721780IterSrc* src,
                                     IsaacRoomWeb721780IterOut* out);
uint32_t isaac_room_web_spawn_template(uint32_t index);

/* Decoration — FUN_0099a8e0 (vtbl 0xb686c0 slot 2). Head gates
   (0x99a923..0x99a93b): [this+8]==0x3e8 (type 1000) OR LOW-8-bit
   [this+0x149]==0 -> straight epilogue (NO teardown). Otherwise the
   typed teardown pair HOST 0x409030(this+0x70 / this+0x90) at sites
   0x0099a940/0x0099a94b, then name fetch HOST 0x452bf0(this+0x70,&s)
   site 0x0099a957, std::string find HOST 0x557bd0(s,"Puddle"[0xb7d918],
   6) site 0x0099a97c; find==-1 skips clear-byte AND loop to cleanup.
   Clear-byte: [this+0x74]!=0 -> [this+0x84]=0 @0x99a999 (BEFORE the
   scan). Scan loop (bound re-derived per iteration, jb UNSIGNED): per
   entity HOST 0x417870(idx) site 0x0099a9c1; only [ent+0x184]==5
   proceeds; position HOST 0x709e50(this,&v) site 0x0099a9dc; axis
   wobble law (X: base 60.0f/span-off 338.0f/phase BSS 0xc78dc4, Y:
   140.0f/182.0f/0xc78edc): pre_sin = f32(f32(phase-span_off)*HALF +
   f32(pos-base)*POS_SCALE)*scale + HALF where scale =
   f32([0xbf941c]*[0xbf93e8]) host product; sin via x87 thunk
   0xaf0917 (double sin, f32-rounded by fstp dword) is a HOST input;
   post_div = f32(sin/scale). Add call HOST 0x40b590(this+0x40,
   &out{12B}, wob_x, wob_y, v.x, v.y, 0.01f, -1) site 0x0099ab07;
   out+0xC > 0.0f ORDERED (NaN -> jbe -> nothing) gates the setter
   phase: HOST 0x7b9940(ent,-1) site 0x0099ab1d ALWAYS under a live
   probe, then byte [ent+0x1570]!=0 -> next entity, else second
   HOST 0x7b9940(ent,0) site 0x0099ab2f picks the render triple target:
   al!=0 -> [ent+0x1874..0x187C] else [ent+0x1848..0x1850] (@0x99ab3d/
   0x99ab61). Cleanup frees the string through IAT free 0xaef15c with
   the CRT corrupt-heap guard call [0xb18894]
   (_invalid_parameter_noinfo_noreturn) pinned as an IAT leaf — the
   guard path terminates the process and is modeled unreachable for
   live strings. */
static constexpr uint32_t ISAAC_ROOM_DECO_UPDATE_VA = 0x0099a8e0u;
static constexpr uint32_t ISAAC_ROOM_DECO_UPDATE_END_VA = 0x0099abf7u;
static constexpr uint32_t ISAAC_ROOM_DECO_TYPE_GATE_OFF = 0x8u;
static constexpr uint32_t ISAAC_ROOM_DECO_TYPE_PUDDLE_SKIP = 0x3e8u;
static constexpr uint32_t ISAAC_ROOM_DECO_FLAG_OFF = 0x149u;
static constexpr uint32_t ISAAC_ROOM_DECO_CLEAR_GATE_OFF = 0x74u;
static constexpr uint32_t ISAAC_ROOM_DECO_CLEARED_BYTE_OFF = 0x84u;
static constexpr uint32_t ISAAC_ROOM_DECO_NAME_SRC_OFF = 0x70u;
static constexpr uint32_t ISAAC_ROOM_DECO_DESC_OFF = 0x40u;
static constexpr uint32_t ISAAC_ROOM_DECO_SSO_INLINE_CAP = 0x10u;
static constexpr uint32_t ISAAC_ROOM_DECO_PUDDLE_STR_VA = 0x00b7d918u;
static constexpr uint32_t ISAAC_ROOM_DECO_PUDDLE_LEN = 6u;
static constexpr uint32_t ISAAC_ROOM_DECO_ENT_TYPE_OFF = 0x184u;
static constexpr uint32_t ISAAC_ROOM_DECO_ENT_TYPE_PIT = 5u;
static constexpr uint32_t ISAAC_ROOM_DECO_ENT_X_OFF = 0x33cu;
static constexpr uint32_t ISAAC_ROOM_DECO_ENT_Y_OFF = 0x340u;
static constexpr uint32_t ISAAC_ROOM_DECO_VIS_BYTE_OFF = 0x1570u;
static constexpr uint32_t ISAAC_ROOM_DECO_RENDER_A_OFF = 0x1848u;
static constexpr uint32_t ISAAC_ROOM_DECO_RENDER_B_OFF = 0x1874u;
static constexpr uint32_t ISAAC_ROOM_DECO_LIST_LO_OFF = 0x1baa8u;
static constexpr uint32_t ISAAC_ROOM_DECO_LIST_HI_OFF = 0x1baacu;
static constexpr uint32_t ISAAC_ROOM_DECO_GAME_GLOBAL = 0x00c71678u;
static constexpr uint32_t ISAAC_ROOM_DECO_HOST_TEARDOWN_VA = 0x00409030u;
static constexpr uint32_t ISAAC_ROOM_DECO_HOST_SITE_A_VA = 0x0099a940u;
static constexpr uint32_t ISAAC_ROOM_DECO_HOST_SITE_B_VA = 0x0099a94bu;
static constexpr uint32_t ISAAC_ROOM_DECO_HOST_NAME_FETCH_VA = 0x00452bf0u;
static constexpr uint32_t ISAAC_ROOM_DECO_NAME_FETCH_SITE_VA = 0x0099a957u;
static constexpr uint32_t ISAAC_ROOM_DECO_HOST_FIND_VA = 0x00557bd0u;
static constexpr uint32_t ISAAC_ROOM_DECO_FIND_SITE_VA = 0x0099a97cu;
static constexpr uint32_t ISAAC_ROOM_DECO_HOST_GRID_AT_VA = 0x00417870u;
static constexpr uint32_t ISAAC_ROOM_DECO_GRID_AT_SITE_VA = 0x0099a9c1u;
static constexpr uint32_t ISAAC_ROOM_DECO_HOST_POS_GET_VA = 0x00709e50u;
static constexpr uint32_t ISAAC_ROOM_DECO_POS_GET_SITE_VA = 0x0099a9dcu;
static constexpr uint32_t ISAAC_ROOM_DECO_HOST_WOBBLE_ADD_VA = 0x0040b590u;
static constexpr uint32_t ISAAC_ROOM_DECO_WOBBLE_ADD_SITE_VA = 0x0099ab07u;
static constexpr uint32_t ISAAC_ROOM_DECO_SETTER_HOST_VA = 0x007b9940u;
static constexpr uint32_t ISAAC_ROOM_DECO_SETTER_SITE_A_VA = 0x0099ab1du;
static constexpr uint32_t ISAAC_ROOM_DECO_SETTER_SITE_B_VA = 0x0099ab2fu;
static constexpr uint32_t ISAAC_ROOM_DECO_SIN_THUNK_VA = 0x00af0917u;
static constexpr uint32_t ISAAC_ROOM_DECO_FREE_HOST_VA = 0x00aef15cu;
static constexpr uint32_t ISAAC_ROOM_DECO_IAT_GUARD_VA = 0x00b18894u;
static constexpr uint32_t ISAAC_ROOM_DECO_X_BASE_VA = 0x00baa950u;
static constexpr uint32_t ISAAC_ROOM_DECO_X_BASE_BITS = 0x42700000u;
static constexpr uint32_t ISAAC_ROOM_DECO_Y_BASE_VA = 0x00baaa30u;
static constexpr uint32_t ISAAC_ROOM_DECO_Y_BASE_BITS = 0x430c0000u;
static constexpr uint32_t ISAAC_ROOM_DECO_POS_SCALE_VA = 0x00baa324u;
static constexpr uint32_t ISAAC_ROOM_DECO_POS_SCALE_BITS = 0x3f266666u;
static constexpr uint32_t ISAAC_ROOM_DECO_X_SPAN_VA = 0x00baab20u;
static constexpr uint32_t ISAAC_ROOM_DECO_X_SPAN_BITS = 0x43a90000u;
static constexpr uint32_t ISAAC_ROOM_DECO_Y_SPAN_VA = 0x00baaa7cu;
static constexpr uint32_t ISAAC_ROOM_DECO_Y_SPAN_BITS = 0x43360000u;
static constexpr uint32_t ISAAC_ROOM_DECO_HALF_VA = 0x00baa2d0u;
static constexpr uint32_t ISAAC_ROOM_DECO_HALF_BITS = 0x3f000000u;
static constexpr uint32_t ISAAC_ROOM_DECO_SCALE1_VA = 0x00bf941cu;
static constexpr uint32_t ISAAC_ROOM_DECO_SCALE1_BITS = 0x3f800000u;
static constexpr uint32_t ISAAC_ROOM_DECO_SCALE2_VA = 0x00bf93e8u;
static constexpr uint32_t ISAAC_ROOM_DECO_SCALE2_BITS = 0x40000000u;
static constexpr uint32_t ISAAC_ROOM_DECO_PHASE_X_VA = 0x00c78dc4u; /* BSS */
static constexpr uint32_t ISAAC_ROOM_DECO_PHASE_Y_VA = 0x00c78edcu; /* BSS */
static constexpr uint32_t ISAAC_ROOM_DECO_PHASE_STEP_BITS = 0x3c23d70au;

#pragma pack(push, 1)
typedef struct IsaacRoomDeco99a8e0BodySrc { /* 16 bytes */
  uint32_t type_8;     /* [this+8] vs 0x3e8 */
  uint32_t flag_149;   /* [this+0x149] low 8 bits tested */
  uint32_t h_find_hit; /* HOST 0x557bd0 != -1 */
  uint32_t gate_74;    /* [this+0x74] */
} IsaacRoomDeco99a8e0BodySrc;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomDeco99a8e0BodySrc) == 16,
              "IsaacRoomDeco99a8e0BodySrc size");

#pragma pack(push, 1)
typedef struct IsaacRoomDeco99a8e0BodyOut { /* 16 bytes */
  uint32_t early_ret;         /* type 1000 or flag clear -> plain ret */
  uint32_t teardown_pairs;    /* HOST 0x409030 pair (0 or 2) */
  uint32_t cleared_byte_fired; /* [this+0x84] := 0 */
  uint32_t loop_entered;      /* scan walk reached */
} IsaacRoomDeco99a8e0BodyOut;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomDeco99a8e0BodyOut) == 16,
              "IsaacRoomDeco99a8e0BodyOut size");

#pragma pack(push, 1)
typedef struct IsaacRoomDeco99a8e0WobbleSrc { /* 28 bytes */
  uint32_t pos_bits;        /* f32 bits of ent position (axis float) */
  uint32_t base_bits;       /* 60.0f (X) / 140.0f (Y) pin */
  uint32_t pos_scale_bits;  /* 0.65f pin */
  uint32_t span_off_bits;   /* 338.0f (X) / 182.0f (Y) pin */
  uint32_t phase_bss_bits;  /* f32 bits of BSS 0xc78dc4 / 0xc78edc */
  uint32_t scale_bits;      /* f32([0xbf941c]*[0xbf93e8]) host product */
  uint32_t sin_host_bits;   /* f32-rounded double-sin(pre) HOST result */
} IsaacRoomDeco99a8e0WobbleSrc;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomDeco99a8e0WobbleSrc) == 28,
              "IsaacRoomDeco99a8e0WobbleSrc size");

#pragma pack(push, 1)
typedef struct IsaacRoomDeco99a8e0WobbleOut { /* 8 bytes */
  uint32_t pre_sin_bits;  /* x87 fld input */
  uint32_t post_div_bits; /* f32(sin)/scale fed to the add call */
} IsaacRoomDeco99a8e0WobbleOut;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomDeco99a8e0WobbleOut) == 8,
              "IsaacRoomDeco99a8e0WobbleOut size");

#pragma pack(push, 1)
typedef struct IsaacRoomDeco99a8e0RenderOut { /* 12 bytes */
  uint32_t setter_calls; /* HOST 0x7b9940 firings (0/1/2) */
  uint32_t render_pass;  /* triple copy executed */
  uint32_t target_base;  /* 0x1874 / 0x1848 / 0 */
} IsaacRoomDeco99a8e0RenderOut;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomDeco99a8e0RenderOut) == 12,
              "IsaacRoomDeco99a8e0RenderOut size");

void isaac_room_deco_99a8e0_body(const IsaacRoomDeco99a8e0BodySrc* src,
                                 IsaacRoomDeco99a8e0BodyOut* out);
uint32_t isaac_room_deco_sso_heap_selected(uint32_t sso_field);
void isaac_room_deco_axis_wobble(const IsaacRoomDeco99a8e0WobbleSrc* src,
                                 IsaacRoomDeco99a8e0WobbleOut* out);
void isaac_room_deco_render_target(uint32_t out_probe_bits,
                                   uint32_t vis_byte, uint32_t setter_al,
                                   IsaacRoomDeco99a8e0RenderOut* out);

/* ---- v88: GridEntity_Spikes::Update 0x0071e9b0 (exact-ZHL 14 B) ----
   PE 0x0071e9b0..0x0071eb24, 110 insns, 0 IND. Host leaves: hurt
   0x70b170, pred 0x71e920, 0x71eb30, ANM2::Play 0x40a380, teardown
   0x409030 x2. 0x71df80 is PURE (eax-only Room+0x1d18 set). NO uint8_t
   scalar params; byte gates re-narrow & 0xff. */
static constexpr uint32_t ISAAC_ROOM_SPIKES_UPDATE_VA = 0x0071e9b0u;
static constexpr uint32_t ISAAC_ROOM_SPIKES_UPDATE_RET_VA = 0x0071eb24u;
static constexpr uint32_t ISAAC_ROOM_SPIKES_UPDATE_END_VA = 0x0071eb25u;
static constexpr uint32_t ISAAC_ROOM_SPIKES_NEXT_VA = 0x00838c30u;
static constexpr uint32_t ISAAC_ROOM_SPIKES_HOST_HURT_VA = 0x0070b170u;
static constexpr uint32_t ISAAC_ROOM_SPIKES_HOST_PRED_VA = 0x0071e920u;
static constexpr uint32_t ISAAC_ROOM_SPIKES_HOST_EB30_VA = 0x0071eb30u;
static constexpr uint32_t ISAAC_ROOM_SPIKES_HOST_PLAY_VA = 0x0040a380u;
static constexpr uint32_t ISAAC_ROOM_SPIKES_HOST_TEARDOWN_VA = 0x00409030u;
static constexpr uint32_t ISAAC_ROOM_SPIKES_STAGE_GATE_VA = 0x0071df80u;
static constexpr uint32_t ISAAC_ROOM_SPIKES_IDX_BOUND = 0x1bfu;
static constexpr uint32_t ISAAC_ROOM_SPIKES_COST_DOWN = 0x3e7u;
static constexpr uint32_t ISAAC_ROOM_SPIKES_COST_UP = 0x1f4u;
static constexpr uint32_t ISAAC_ROOM_SPIKES_MASK_NARROW = 0x80u;
static constexpr uint32_t ISAAC_ROOM_SPIKES_MASK_WIDE = 0x10000080u;
static constexpr int32_t ISAAC_ROOM_SPIKES_ROOM_TYPE_D = 0xd;
static constexpr int32_t ISAAC_ROOM_SPIKES_TYPE_SPIKES = 8;
static constexpr int32_t ISAAC_ROOM_SPIKES_TYPE_COOL = 0x1c;
static constexpr int32_t ISAAC_ROOM_SPIKES_TYPE_TIMER = 9;
static constexpr uint32_t ISAAC_ROOM_SPIKES_VARIANT_WIDE = 0x64u;
static constexpr int32_t ISAAC_ROOM_SPIKES_TIMER_RELOAD = 0x3c;
static constexpr uint32_t ISAAC_ROOM_SPIKES_HURT_DIST_BITS = 0x41300000u;
static constexpr uint32_t ISAAC_ROOM_SPIKES_HURT_DMG_BITS = 0x41000000u;
static constexpr int32_t ISAAC_ROOM_SPIKES_HURT_PLAYER_DAMAGE = 2;
static constexpr uint32_t ISAAC_ROOM_SPIKES_ANIM_UNSUMMON_WOMB = 0x00b638d0u;
static constexpr uint32_t ISAAC_ROOM_SPIKES_ANIM_SUMMON_WOMB = 0x00b6320cu;
static constexpr uint32_t ISAAC_ROOM_SPIKES_ANIM_UNSUMMON = 0x00b6922cu;
static constexpr uint32_t ISAAC_ROOM_SPIKES_ANIM_SUMMON = 0x00b1d420u;

#pragma pack(push, 1)
typedef struct IsaacRoomSpikes71e9b0HurtOut { /* 8 bytes */
  uint32_t mask;
  uint32_t ignore;
} IsaacRoomSpikes71e9b0HurtOut;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomSpikes71e9b0HurtOut) == 8,
              "IsaacRoomSpikes71e9b0HurtOut size");

#pragma pack(push, 1)
typedef struct IsaacRoomSpikes71e9b0CostOut { /* 8 bytes */
  uint32_t fired;
  uint32_t value;
} IsaacRoomSpikes71e9b0CostOut;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomSpikes71e9b0CostOut) == 8,
              "IsaacRoomSpikes71e9b0CostOut size");

#pragma pack(push, 1)
typedef struct IsaacRoomSpikes71e9b0PlanSrc { /* 44 bytes */
  int32_t state_c;
  uint32_t type_4;
  uint32_t variant_8;
  uint32_t room_type;
  uint32_t idx_24;
  uint32_t pred_al;
  uint32_t field_74;
  uint32_t flag_84;
  int32_t timer_154;
  uint32_t room_1d18;
  uint32_t flag_149;
} IsaacRoomSpikes71e9b0PlanSrc;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomSpikes71e9b0PlanSrc) == 44,
              "IsaacRoomSpikes71e9b0PlanSrc size");

#pragma pack(push, 1)
typedef struct IsaacRoomSpikes71e9b0PlanOut { /* 52 bytes */
  uint32_t hurt_fired;
  uint32_t hurt_mask;
  uint32_t hurt_ignore;
  uint32_t cost_fired;
  uint32_t cost_value;
  uint32_t eb30_fired;
  uint32_t timer_dec;
  int32_t timer_new;
  int32_t state_c_new;
  uint32_t anim_play;
  uint32_t anim_va;
  uint32_t teardown_pairs;
  uint32_t stage_match;
} IsaacRoomSpikes71e9b0PlanOut;
#pragma pack(pop)
static_assert(sizeof(IsaacRoomSpikes71e9b0PlanOut) == 52,
              "IsaacRoomSpikes71e9b0PlanOut size");

uint32_t isaac_room_spikes_71df80_stage_match(uint32_t room_1d18);
void isaac_room_spikes_71e9b0_hurt_fire(uint32_t room_type, uint32_t type_4,
                                        uint32_t variant_8,
                                        IsaacRoomSpikes71e9b0HurtOut* out);
void isaac_room_spikes_71e9b0_cost(int32_t state_c, uint32_t idx_24,
                                   IsaacRoomSpikes71e9b0CostOut* out);
uint32_t isaac_room_spikes_71e9b0_anim_va(uint32_t stage_match,
                                          int32_t state_c);
void isaac_room_spikes_71e9b0_plan(const IsaacRoomSpikes71e9b0PlanSrc* src,
                                   IsaacRoomSpikes71e9b0PlanOut* out);

#ifdef __cplusplus
}
#endif
