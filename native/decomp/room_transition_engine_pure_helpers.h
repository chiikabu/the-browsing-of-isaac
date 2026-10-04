#pragma once

#include <stdint.h>
#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

/* Pure subsets recovered from FUN_0082ee40 (VA 0x0082ee40), the room-transition
   engine always called from FrameEffect_6fd7c0 after optional 705ee0/blue-room.
   Address-stable name: no exact ZHL match (identify-zhl-address empty).

   Receiver is the thiscall ECX subobject used as Game+0x1b83c from Update sites
   (field +0x238 is sparse predicate1ba74; field +0 is sparse gate1b83c).

   These helpers are freestanding translations of complete pure islands only.
   ABI v24 wires sparse dual-gate ownership into Update residual resumes:
   when !mode4 and !early_skip_setup, pure applies predicate1ba74=0 and
   gate1b83c=1 after host residual that excludes those stores (plus P4).
   ABI v29 wires pure setup; ABI v34 empty-player pure 1bb74=0; ABI v35 wires
   player-entry float reset via engine_player_blob_ready scratch (eligible
   mask + f360/f364/f410). ABI v36 wires pure FUN_0082eb90 predicate +
   player_loop_needs_host(field_1c) so body residual skips when anim needs
   neither 7abcc0 nor 7abe20 (Update site anim 0). Host still owns log,
   ANM2::Load, residual 7abcc0/7abe20 bodies when gated, and anim-0x12 SFX.
   ABI v5 adds the pure core of the per-entry body FUN_007abe20 (5 stores +
   the 0x40a5d0 result byte gate) as typed continuations; the four body
   callees (0x00407f10 ANM2::Reset, 0x00408830, 0x0040a5d0, 0x0040a1b0
   AnimationState::Rewind) stay host in their exact PE order. ABI v12 peels
   Rewind's decision surface (stores + 0x408c90 bitset + zero-loop needs).
   ABI v13 peels the anim-0x12 / 7abcc0 SFX-prep xorshift core of
   0x00956780 (address-stable; identify-zhl empty). ABI v14 peels the
   whole 0x004288a0 sorted-map lower-bound walk the SFX prep calls at
   0x9567cd (FULLY PURE: 0x4288a0..0x4288e8, ret 8, zero calls; identify-zhl
   empty; 204 direct E8 callers image-wide - a shared map primitive).
   The walk follows a node chain: root = [this], first node = [root+4];
   each node's +0x10 dword is compared SIGNED against the key; >= takes
   the +0 next, < takes the +8 next; byte +0xd != 0 terminates. out[8]
   records the last node with field_10 >= key (else *this = the sentinel
   the caller compares against). CRT TLS 0xaef29d, log 0xa112c0 and Play
   0x92dc30 stay host. ABI v15 peels the two map-result getters right after
   the walk: 0x4288f0 / 0x428910 (ret 4, zero calls) copy the walk triple's
   out[0]/out[4] into receiver+0x33c/+0x340 / +0x360/+0x364 — 40 / 50 direct
   E8 callers image-wide, pure band complete. ABI v16 peels the two
   functions right after the getters: 0x00428940's xorshift128+-style RNG
   core (48 direct E8 callers; four 0xa112c0 CRT assert walls stay host —
   they only trap on zero and never alter the arithmetic between them; the
   pure core xorshift32s state lane0 three times with byte-gated CL-masked
   counts from the other three lanes, then a final xorshift32 with the
   .rdata constants (11, 7, 12) at 0xb1f7e0/0xb1f7e8; stores recv+0x58/
   +0x5c/+0x60/+0x64, state lane0 write-back = step60) and 0x00428a80's bit
   setter/clearer (10 direct E8 callers; signed clamps index to [0, 25],
   word = idx >> 5, bit = idx & 0x1f, or/and-not the dword at
   this+0x1839c + word*4 by the flag byte; its 0x42a030 bound call at
   0x428ad0 is STATICALLY UNREACHABLE after the clamps — dead assert
   leftover, gated). ABI v17 peels the two-instruction stub right after
   the bit setter: 0x00428a50 `lea eax,[ecx+0x1258]; ret` (46 direct E8
   callers; ret 0, zero calls/branches/stores) — the u32-wrapping
   effective address of the receiver field at +0x1258, which the callers
   dereference (MSVC field-pointer getter). ABI v18 closes the band with
   the two residue one-liners right after 0x428a50: 0x00428a60
   `lea eax,[ecx+0x1218]; ret` (144 direct E8 callers; the u32-wrapping
   effective address of the receiver field at +0x1218, same MSVC
   field-pointer pattern) and 0x00428a70 `mov eax,[ecx+0x11f8]; ret`
   (2 direct E8 callers; the u32 LE value at receiver +0x11f8 — a loaded
   dword the callers this-call as an object pointer). Both ret 0, zero
   calls/branches/stores. The 0x428940..0x428a80 band is now complete.
   ABI v19 closes the residue around the band with nine more one-liners
   (all address-stable, identify-zhl empty): 0x00428930
   `lea eax,[ecx+0x40]; ret` (3 direct E8 callers; the u32-wrapping
   effective address of the receiver field at +0x40, same MSVC
   field-pointer pattern), 0x00428ae0 (ret 4, 13 direct E8 callers) the
   signed clamp-setter `[this+0x18318] = clamp(arg, -1, 7)` whose eax at
   ret is the stored clamped dword, 0x00428b10 `mov eax,[ecx+0x1344];
   ret` (0 direct E8 callers but registered as a Lua callback at
   0x8698cb; the u32 LE value at receiver +0x1344), 0x00428b50
   `mov eax,[0xc71678]; add eax,0x1ba78; ret` (14 direct E8 callers;
   the u32-wrapping effective address of Game+0x1ba78, the BSS Game
   pointer host-resolved), 0x00428cd0
   `mov eax,[0xc7169c]; add eax,0x29fbc; ret` (9 direct E8 callers;
   the u32-wrapping effective address of SfxGlobal+0x29fbc, the BSS Sfx
   pointer host-resolved), 0x00429550 `cmp dword [ecx],2 / setge al;
   ret` (157 direct E8 callers — SIGNED >= 2 byte check of the receiver
   dword), 0x00429560 `cmp dword [ecx],4 / sete al; ret` (2 direct E8
   callers — the receiver dword == 4), 0x00429f20
   `movss xmm0,[0xbaa198]; ret` (1 direct E8 caller — the file-backed
   .rdata constant 0x3e4ccccd = float 0.2f), and 0x0042a020
   `mov dword [ecx],0; mov eax,ecx; ret` (4 direct E8 callers — zero
   store at [this+0] and the receiver identity in eax). All ret 0
   (428ae0 ret 4) with zero calls/branches; the only stores are 428ae0's
   one clamped dword and 42a020's zero. ABI v20 lands the 0x42a030
   bound-handler census: 0x42a030 itself is the 5-byte noreturn
   bitset-position throw stub (`push 0xb1c618` "invalid bitset position"
   / `call dword [0xb18468]`; 19 direct E8 callers incl. the family's
   own dead 0x428ad0 bound edge — host edge), and the 342-insn body
   FUN_0042a040..0x0042a1f8 (ret 8) is a sorted-map INSERT whose FOUND
   prefix 0x42a077..0x42a08c is a pure seam over the bound-dispatch:
   it calls the family's v14 walk 0x4288a0 (out triple / key ptr),
   then on the walk's last-GE node (out[8]) requires byte +0xd == 0
   (BYTE gate, wide-masked &0xff) and SIGNED key >= [node+0x10] (jl)
   to store out = (node, 0); the bound path 0x42a0a4.. is host
   (0xaaaaaaa uninitialized-map guard -> 0x4170d0, malloc 0xa0f4c0,
   node stores, RB-style rebalance with rotation calls 0x415f80 /
   0x415fe0, out = (new node, 1)). Three laws: 42a040_found_gate (byte
   gate), 42a040_key_ge_field10 (SIGNED compare), 42a040_bound_flag
   (the fused out[4] byte: 0 found / 1 insert). The
   0x705ee0 / 0x6f9000 rewind seam is game-update-slice-owned (v74/v96/
   v99) and stays out of this family. */
enum {
  ISAAC_ROOM_TRANSITION_ENGINE_PURE_HELPERS_ABI_VERSION = 30
};

static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408830_ALLOC_A_CALL_VA = 0x4088d5u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408830_ALLOC_B_CALL_VA = 0x408915u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408830_ARG_STORE_VA = 0x40885cu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408830_COUNT_A_GATE_VA = 0x4088bfu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408830_COUNT_B_GATE_VA = 0x4088ffu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408830_DATA_GATE_VA = 0x4088b8u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408830_DATA_REREAD_GATE_VA = 0x4088f8u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408830_END_VA = 0x408961u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408830_F10_BITS = 0xbf800000u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408830_FREE_A_CALL_VA = 0x408870u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408830_FREE_B_CALL_VA = 0x40889au;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408830_MEMSET_A_CALL_VA = 0x4088edu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408830_MEMSET_B_CALL_VA = 0x40892du;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408830_STATE0_STORE_VA = 0x408869u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408830_STATE1_STORE_VA = 0x408893u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408830_TAIL_STORE_VA = 0x408935u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408970_ALLOC_A_CALL_VA = 0x408a32u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408970_ALLOC_B_CALL_VA = 0x408afau;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408970_ARG_STORE_VA = 0x408b6du;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_408970_ARM_FREE = 1;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_408970_ARM_REALLOC = 2;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_408970_ARM_SKIP = 0;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408970_CLEAR_0C_STORE_VA = 0x408b63u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408970_END_VA = 0x408b84u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408970_FREE_A_CALL_VA = 0x408a03u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408970_FREE_B_CALL_VA = 0x408ad2u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408970_MEMCPY_A_CALL_VA = 0x408a62u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408970_MEMCPY_B_CALL_VA = 0x408b2au;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408970_MEMSET_A_CALL_VA = 0x408a48u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408970_MEMSET_B_CALL_VA = 0x408b10u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408970_PUBLISH_A_STORE_VA = 0x408aa2u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408970_PUBLISH_B_STORE_VA = 0x408b6au;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408970_PUBLISH_OFF = 8u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408970_RELEASE_A_CALL_VA = 0x408a92u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408970_RELEASE_B_CALL_VA = 0x408b5au;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408970_SIGN_A_GATE_VA = 0x4089e7u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408970_SIGN_B_GATE_VA = 0x408ab6u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408970_SKIP_A_GATE_VA = 0x4089dfu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408970_SKIP_B_GATE_VA = 0x408aadu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408970_STATE0_STORE_VA = 0x4089fcu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408970_STATE2_STORE_VA = 0x408acbu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408C90_COUNT_OFF = 0x2cu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408C90_DATA_OFF = 4u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408C90_END_VA = 0x408cfcu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408C90_KEY_OFF = 0u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408C90_PAIRS_OFF = 0x28u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_408C90_PAIR_STRIDE = 8;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408C90_VAL_OFF = 4u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_408C90_VA_COMPARE = 0x408ccc;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_408C90_VA_COUNT_GATE = 0x408cb4;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_408C90_VA_DATA_LOAD = 0x408c95;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_408C90_VA_LOOP_BACK = 0x408cf7;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_408C90_VA_LOOP_TOP = 0x408cc0;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_408C90_VA_REREAD = 0x408caa;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_408C90_VA_SKIP = 0x408cd3;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_408C90_VA_STORE_F18 = 0x408ce1;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_408C90_VA_STORE_F1C = 0x408cf0;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_408C90_VA_WARN = 0x408c9e;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_408C90_WARN_ARGC = 2;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_408C90_WARN_LEVEL = 0x10;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_408C90_WARN_MSG_VA = 0x00b1a504u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_40A1B0_END_VA = 0x0040a214u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_40A1B0_RESET_STORE_COUNT = 3;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_40A1B0_VA_CALL_408C90 = 0x40a1c8;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_40A1B0_VA_STORE_F10 = 0x40a1b3;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_40A1B0_VA_STORE_F18 = 0x40a1ba;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_40A1B0_VA_STORE_F1C = 0x40a1c1;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_40A1B0_VA_ZERO_A_GATE = 0x40a1d2;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_40A1B0_VA_ZERO_A_TOP = 0x40a1e0;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_40A1B0_VA_ZERO_B_GATE = 0x40a1f5;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_40A1B0_VA_ZERO_B_TOP = 0x40a200;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_AL_FOUND = 1;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_AL_MISSING = 0;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_COUNT_OFF = 0x78u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_ENTRY_STRIDE = 0x13c;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_NOT_FOUND = -1;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_RECEIVER_OFF = 0x30u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_SSO_CAP_OFF = 0x14u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_SSO_LIMIT = 0x10;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_STRCMP_STEP = 2;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_TABLE_OFF = 0x74u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_VA_AL_ZERO = 0x40a647;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_VA_ARG2_GATE = 0x40a661;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_VA_CALL_408830 = 0x40a668;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_VA_CALL_408970 = 0x40a678;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_VA_COUNT_GATE = 0x40a5e6;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_VA_COUNT_LOAD = 0x40a5e3;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_VA_END = 0x40a685;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_VA_ENTRY_IMUL = 0x40a655;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_VA_LOOP_BACK = 0x40a635;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_VA_LOOP_TOP = 0x40a5f2;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_VA_MATCH = 0x40a652;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_VA_MATCH_TEST = 0x40a625;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_VA_NEEDLE_LOAD = 0x40a5d9;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_VA_NEEDLE_RELOAD = 0x40a629;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_VA_RECEIVER = 0x40a65b;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_VA_SSO_SPLIT = 0x40a5f8;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_VA_STRCMP_EQ = 0x40a61c;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_VA_STRCMP_NE = 0x40a620;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_VA_STRCMP_STEP2 = 0x40a612;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_VA_STRCMP_TOP = 0x40a600;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_VA_STRIDE_ADD = 0x40a62d;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_VA_TABLE_LOAD = 0x40a5ea;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_VA_WARN = 0x40a637;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_WARN_ARGC = 3;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_WARN_LEVEL = 1;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_40A5D0_WARN_MSG_VA = 0x00b1a614u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_7ABCC0_7ABE20_CALL_VA = 0x007abcd9u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_7ABCC0_CMOVE_VA = 0x007abcd5u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_7ABCC0_ID_STORE_VA = 0x007abcebu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_7ABCC0_PLAY_CALL_VA = 0x007abd1eu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_7ABCC0_PREP_CALL_VA = 0x007abcf2u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_7ABCC0_SFX_GATE_VA = 0x007abcdeu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_7ABE20_407F10_CALL_VA = 0x007abe35u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_7ABE20_408830_ARG = 0;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_7ABE20_408830_CALL_VA = 0x7abe4cu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_7ABE20_408830_PUSH_VA = 0x7abe3au;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_7ABE20_40A1B0_CALL_VA = 0x007abe65u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_7ABE20_40A1B0_RECV_VA = 0x007abe62u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_7ABE20_A5D0_ARG2 = 1;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_7ABE20_A5D0_ARG2_PUSH_VA = 0x007abe51u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_7ABE20_A5D0_CALL_VA = 0x7abe59u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_7ABE20_AL_GATE_VA = 0x007abe5eu;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_7ABE20_BODY_STEPS = 9;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_7ABE20_CALL_SITES = 4;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_7ABE20_END_VA = 0x007abe86u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_7ABE20_NEEDLE_PUSH_VA = 0x007abe53u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_7ABE20_RESET_RECEIVER_OFF = 0x41cu;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_7ABE20_RET_BYTES = 4;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_7ABE20_SIZE = 0x66;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_7ABE20_STEP_CALL = 1;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_7ABE20_STEP_STORE = 0;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_7ABE20_STORE_COUNT = 5;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_7ABE20_VA = 0x007abe20u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_82EE40_ARGC = 5;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_82EE40_ARG_ANIM_OFF = 0x10u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_82EE40_ARG_DIM_OFF = 0x18u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_82EE40_ARG_PLAYER_OFF = 0x14u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_82EE40_ARG_ROOM_OFF = 8u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_82EE40_ARG_SLOT_OFF = 0xcu;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_82EE40_CALLEES = 11;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_82EE40_CALL_SITES = 12;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_82EE40_COOKIE_CHECK_VA = 0x0082f1b1u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_82EE40_COOKIE_LOAD_VA = 0x0082ee68u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_82EE40_DIRECT_CALL_SITES = 11;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_82EE40_END_VA = 0x0082f1bfu;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_82EE40_INDIRECT_CALL_SITES = 1;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_82EE40_INVALID_PARAM_CALL_VA = 0x0082ef4fu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_82EE40_PLAY_CALL_VA = 0x0082f19au;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_82EE40_PREP_CALL_VA = 0x0082f16eu;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_82EE40_RET_BYTES = 0x14;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_82EE40_RET_VA = 0x0082f1bcu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_82EE40_SEH_HANDLER_VA = 0x00af85cdu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_82EE40_SEH_PUSH_VA = 0x0082ee56u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_82EE40_SFX_GATE_VA = 0x0082f14fu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_82EE40_SFX_ID_VA = 0x0082f16bu;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_82EE40_SIZE = 0x37f;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_82EE40_VA = 0x0082ee40u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_956780_CL_MASK = 0x1f;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_956780_END_VA = 0x956885u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_956780_ID_COMMON = 0x25;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_956780_ID_RARE = 0x12d;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_956780_MAGIC = 0xcccccccdu;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_956780_MAGIC_SHIFT = 4;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_956780_MAP_KEY = 7;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_956780_MAP_OFF = 0x1bbd8u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_956780_MODULUS = 0x14;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_956780_NODE_BYTE_D_OFF = 0xdu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_956780_NODE_FIELD_10_OFF = 0x10u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_956780_SEED_INIT = 0x69696969u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_956780_SEED_VA = 0xc5d2b0u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_956780_SHIFT_A_VA = 0xc5d2b4u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_956780_SHIFT_B_VA = 0xc5d2b8u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_956780_SHIFT_C_VA = 0xc5d2bcu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_956780_SHIFT_INIT_VA = 0xb1f54cu;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_956780_SHIFT_INIT_A = 2;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_956780_SHIFT_INIT_B = 7;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_956780_SHIFT_INIT_C = 7;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_PLAYER_RESET_STORE_COUNT = 3;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_VA_INDEX_RELOAD = 0x82f097u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_VA_INDEX_INC = 0x82f0b9u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_VA_INDEX_STORE_BACK = 0x82f0c0u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_VA_INDEX_BOTTOM_CMP = 0x82f0cbu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_LOOP_TOP = 0x82f010u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_PREDICATE = 0x82eb90u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_EXIT = 0x82f0d4u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_ENTRY_LOG_CALL = 0x82ee96u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_END_REREAD = 0x82f02au;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_FATAL_GAME_REREAD = 0x82f030u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_BEGIN_REREAD = 0x82f036u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_LOOP_REBASE = 0x82f0bau;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_TAIL_ANIM_REREAD = 0x82f0d4u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_TAIL_FIELD0 = 0x82f0d7u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_TAIL_ANIM2 = 0x82f0ddu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_TAIL_SLOT = 0x82f115u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_TAIL_DIM_CMP = 0x82f15fu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_ANM2_GATE = 0x82ee9eu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_ANM2_RELEASE_GATE = 0x82ef2cu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_THUNK_VA_MEMSET = 0xaf05e5u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_THUNK_VA_MEMCPY = 0xaf05dfu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_IAT_VA_MEMSET = 0xb1875cu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_IAT_VA_MEMCPY = 0xb18760u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_IAT_VA_FREE = 0xb187dcu;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_956780_SIZE = 0x105;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_956780_VA = 0x956780u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_956780_VA_BYTE_GATE = 0x9567d5u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_956780_VA_GAME_GATE = 0x9567b0u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_956780_VA_GAME_LOAD = 0x9567a9u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_956780_VA_INT3 = 0x95682fu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_956780_VA_MAP_CALL = 0x9567cdu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_956780_VA_SEED_LOAD = 0x95680cu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_956780_VA_SEED_REREAD = 0x956822u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_956780_VA_SEED_STORE = 0x95685bu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_956780_VA_SEED_TEST = 0x956812u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_956780_VA_SENTINEL_GATE = 0x9567e9u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_956780_VA_SIGNED_GATE = 0x9567dfu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_956780_VA_STORE_12D = 0x95686eu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_956780_VA_STORE_25 = 0x956806u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_956780_VA_WARN = 0x95681du;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_956780_VA_XORSHIFT = 0x956830u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_956780_WARN_ARGC = 2;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_956780_WARN_LEVEL = 0x10;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_956780_WARN_MSG_VA = 0xb6bf54u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_A648B0_CL_ALLOC = 0;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_A648B0_CL_FREE = 1;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_ANIMSTATE_ALLOC_SAT = 0xffffffffu;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_ANIMSTATE_BLOCK_BIAS = 4;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_ANIMSTATE_BUF_A_OFF = 8u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_ANIMSTATE_BUF_B_OFF = 0xcu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_ANIMSTATE_BYTE14_OFF = 0x14u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_ANIMSTATE_COUNT_A_OFF = 0x1cu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_ANIMSTATE_COUNT_B_OFF = 0x24u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_ANIMSTATE_DATA_OFF = 4u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_ANIMSTATE_ELEM_SIZE = 4;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_ANIMSTATE_F10_OFF = 0x10u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_ANIMSTATE_F18_OFF = 0x18u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_ANIMSTATE_F1C_OFF = 0x1cu;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_ANIMSTATE_FILL_BYTE = 0xff;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_ANIMSTATE_MAIN_DELTA = 0x30;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_ANIMSTATE_OVERLAY_DELTA = 0x50;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_ANM2_ALLOC_REQUEST = 0x20;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_ANM2_HEAP_CAPACITY = 0x1f;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_ANM2_LITERAL_LEN = 0x1d;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_ANM2_LITERAL_VA = 0x00b6cda8u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_ANM2_LOAD_GRAPHICS = 1;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_ANM2_LOAD_RECEIVER_OFF = 0x38u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_ANM2_SSO_CAPACITY = 0xf;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_ANM2_SSO_LIMIT = 0x10;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_C7B640_BITS = 0u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_C7B640_VA = 0x00c7b640u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_C7B644_BITS = 0u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_C7B644_VA = 0x00c7b644u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_DATA_RAW_END_VA = 0x00c61e00u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_ENTRY_1398_OFF = 0x1398u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_ENTRY_139A_OFF = 0x139au;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_ENTRY_14C_OFF = 0x14cu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_ENTRY_41C_OFF = 0x41cu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_ENTRY_48_OFF = 0x48u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_ENTRY_78_OFF = 0x78u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_ENTRY_8C_OFF = 0x8cu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_ENTRY_98_OFF = 0x98u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_ENTRY_LOG_ARGC = 4;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_ENTRY_LOG_FMT_VA = 0x00b6cdc8u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_ENTRY_LOG_FRAME_OFF = 0x264f8u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_ENTRY_LOG_LEVEL = 1;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_FATAL_ARGC = 2;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_FATAL_LEVEL = 0x10;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_FATAL_MSG_VA = 0x00b7e6bcu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_GAME_PLAYER_ARG_OFF = 0x1bb74u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_GAME_SRC_FATAL = 1;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_GAME_SRC_HOSTCALL = 2;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_GAME_SRC_PRELOOP = 0;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_14_GATE = 0x0082f077u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_173_GATE = 0x0082f05au;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_407F10 = 0x00407f10u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_408830 = 0x00408830u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_408970 = 0x00408970u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_408C90 = 0x00408c90u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_40A1B0 = 0x0040a1b0u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_40A5D0 = 0x0040a5d0u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_4288A0 = 0x4288a0u;
/* ---- v14: FUN_004288a0 sorted-map lower-bound walk (fully pure) ----
   root = [this]; node = [root+4]; walk while byte [node+0xd] == 0:
   signed [node+0x10] >= key -> out[8]=node, follow [node+0];
   signed < key -> follow [node+8]. out[0] = last examined node,
   out[4] = last branch flag, out[8] = last >= node else root. */
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_4288A0_VA = 0x004288a0u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_4288A0_END_VA = 0x004288e8u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_4288A0_RET_BYTES = 8;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_4288A0_ROOT_NODE_OFF = 4u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_4288A0_NODE_NEXT_GE_OFF = 0u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_4288A0_NODE_NEXT_LT_OFF = 8u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_4288A0_NODE_BYTE_D_OFF = 0x0du;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_4288A0_NODE_FIELD_10_OFF = 0x10u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_4288A0_VA_FIRST_LOAD = 0x004288a3u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_4288A0_VA_BYTE_GATE = 0x004288b7u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_4288A0_VA_LOOP_TOP = 0x004288c3u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_4288A0_VA_COMPARE = 0x004288c5u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_4288A0_VA_GE_BRANCH = 0x004288c8u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_4288A0_VA_GE_STORE = 0x004288d1u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_4288A0_VA_FLAG_STORE = 0x004288dbu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_4288A0_VA_LOOP_GATE = 0x004288deu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_4288A0_VA_END = 0x004288e5u;
/* ---- v15: FUN_004288f0 / FUN_00428910 map-result getters (fully pure) ----
   0x4288f0 (ret 4): receiver+0x33c = out[0], receiver+0x340 = out[4].
   0x428910 (ret 4): receiver+0x360 = out[0], receiver+0x364 = out[4].
   `out` is the 4288a0 walk triple (node0 at +0, flag4 at +4). 40 / 50
   direct E8 callers image-wide - shared map-result consumers, off the
   engine's own edge path. */
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_4288A0_LOOKUP_NODE0_OFF = 0u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_4288A0_LOOKUP_FLAG4_OFF = 4u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_4288F0_VA = 0x004288f0u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_4288F0_END_VA = 0x00428908u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_4288F0_RET_BYTES = 4;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_4288F0_DST_0_OFF = 0x33cu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_4288F0_DST_4_OFF = 0x340u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_4288F0_VA_FIRST_LOAD = 0x004288f6u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_4288F0_VA_STORE_0 = 0x004288f8u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_4288F0_VA_STORE_4 = 0x00428901u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428910_VA = 0x00428910u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428910_END_VA = 0x00428928u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_428910_RET_BYTES = 4;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428910_DST_0_OFF = 0x360u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428910_DST_4_OFF = 0x364u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428910_VA_FIRST_LOAD = 0x00428916u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428910_VA_STORE_0 = 0x00428918u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428910_VA_STORE_4 = 0x00428921u;
/* ---- v16: FUN_00428940 xorshift128+-style RNG core (ret 4) ----
   state = 4 dword lanes (two 64-bit words, LE: word0 = lane1:lane0,
   word1 = lane3:lane2). lane0 is xorshifted three times with byte-gated
   CL-masked counts from lanes 1-3, then once with the .rdata constants
   (11, 7, 12); receiver stores +0x58/+0x5c/+0x60/+0x64; state lane0
   write-back = step60 (the final combine never stores back). The four
   0xa112c0 assert walls (0xb6bf54 msg, level 0x10) are host traps. */
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428940_VA = 0x00428940u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428940_END_VA = 0x00428a4au;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_428940_RET_BYTES = 4;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428940_STATE_LANE0_OFF = 0u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428940_STATE_LANE1_OFF = 4u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428940_STATE_LANE2_OFF = 8u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428940_STATE_LANE3_OFF = 0xcu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428940_DST_58_OFF = 0x58u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428940_DST_5C_OFF = 0x5cu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428940_DST_60_OFF = 0x60u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428940_DST_64_OFF = 0x64u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428940_SHIFT_CONST_VA = 0x00b1f7e0u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428940_SHIFT_CONST2_VA = 0x00b1f7e8u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_428940_SHIFT_CONST_0 = 0x0b;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_428940_SHIFT_CONST_1 = 7;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_428940_SHIFT_CONST_2 = 0x0c;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_428940_CL_MASK = 0x1f;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428940_VA_FIRST_LOAD = 0x0042894eu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428940_VA_CORE_1 = 0x0042896au;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428940_VA_CORE_2 = 0x004289a6u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428940_VA_CORE_3 = 0x004289e2u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428940_VA_FINAL = 0x00428a27u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428940_VA_STATE_STORE_1 = 0x00428985u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428940_VA_STATE_STORE_2 = 0x004289c1u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428940_VA_STATE_STORE_3 = 0x00428a0au;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428940_VA_STORE_58 = 0x00428987u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428940_VA_STORE_5C = 0x004289c3u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428940_VA_STORE_60 = 0x00428a12u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428940_VA_STORE_64 = 0x00428a43u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428940_VA_WALL_1 = 0x00428950u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428940_VA_WALL_2 = 0x0042898cu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428940_VA_WALL_3 = 0x004289c8u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428940_VA_WALL_4 = 0x00428a15u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_428940_WALL_ARGC = 2;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_428940_WALL_LEVEL = 0x10;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428940_WALL_MSG_VA = 0x00b6bf54u;
/* ---- v16: FUN_00428a80 bit setter/clearer (ret 8) ----
   signed clamps index to [0, 25] (cmovle <= 0, jge >= 25 -> 25), then
   word = idx >> 5 / bit = idx & 0x1f, dword at this+0x1839c + word*4
   |= / &= ~(1 << bit) by the flag byte (set iff (flag & 0xff) != 0).
   The 0x428ad0 call to 0x42a030 (jae >= 0x1a, UNSIGNED) is STATICALLY
   UNREACHABLE after the clamps — dead assert leftover, gated. */
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428A80_VA = 0x00428a80u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428A80_END_VA = 0x00428ad5u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_428A80_RET_BYTES = 8;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428A80_BITS_BASE_OFF = 0x1839cu;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_428A80_INDEX_MAX = 0x19;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_428A80_BIT_COUNT = 0x1a;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_428A80_WORD_SHIFT = 5;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428A80_BOUND_VA = 0x0042a030u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428A80_VA_CMOVE = 0x00428a90u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428A80_VA_CLAMP_GE = 0x00428a93u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428A80_VA_BOUND_EDGE = 0x00428a9bu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428A80_VA_SHR_WORD = 0x00428aa9u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428A80_VA_BIT_MASK = 0x00428aa6u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428A80_VA_SLOT_LEA = 0x00428aacu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428A80_VA_FLAG_GATE = 0x00428ab6u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428A80_VA_SET_STORE = 0x00428ac0u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428A80_VA_CLEAR_STORE = 0x00428acau;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428A80_VA_BOUND_CALL = 0x00428ad0u;
/* ---- v17: FUN_00428a50 field getter (ret 0) ----
   `lea eax,[ecx+0x1258]; ret` — zero calls, zero branches, zero stores;
   carries the u32-wrapping effective address of the receiver's field at
   +0x1258 (callers dereference the returned pointer). 46 direct E8
   callers image-wide. */
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428A50_VA = 0x00428a50u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428A50_END_VA = 0x00428a56u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_428A50_RET_BYTES = 0;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428A50_FIELD_OFF = 0x1258u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428A50_VA_LEA = 0x00428a50u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428A50_VA_RET = 0x00428a56u;
/* ---- v18: FUN_00428a60 field getter + FUN_00428a70 value getter (ret 0) ----
   0x428a60 `lea eax,[ecx+0x1218]; ret` — zero calls, zero branches, zero
   stores; carries the u32-wrapping effective address of the receiver's
   field at +0x1218 (callers dereference the returned pointer). 144
   direct E8 callers image-wide.
   0x428a70 `mov eax,[ecx+0x11f8]; ret` — zero calls, zero branches, zero
   stores; loads the u32 LE dword at receiver +0x11f8 (both callers
   this-call the result as an object pointer). 2 direct E8 callers
   image-wide. */
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428A60_VA = 0x00428a60u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428A60_END_VA = 0x00428a66u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_428A60_RET_BYTES = 0;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428A60_FIELD_OFF = 0x1218u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428A60_VA_LEA = 0x00428a60u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428A60_VA_RET = 0x00428a66u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428A70_VA = 0x00428a70u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428A70_END_VA = 0x00428a76u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_428A70_RET_BYTES = 0;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428A70_FIELD_OFF = 0x11f8u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428A70_VA_MOV = 0x00428a70u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428A70_VA_RET = 0x00428a76u;
/* v19 - band residue one-liners around 0x428940..0x428a80. All
   address-stable (identify-zhl empty), zero calls/branches. */
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428930_VA = 0x00428930u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428930_END_VA = 0x00428933u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_428930_RET_BYTES = 0;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428930_FIELD_OFF = 0x40u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428930_VA_LEA = 0x00428930u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428930_VA_RET = 0x00428933u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428AE0_VA = 0x00428ae0u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428AE0_END_VA = 0x00428affu;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_428AE0_RET_BYTES = 4;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428AE0_FIELD_OFF = 0x18318u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_428AE0_CLAMP_MIN = -1;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_428AE0_CLAMP_MAX = 7;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428AE0_VA_CMOVLE = 0x00428aebu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428AE0_VA_CMOVL = 0x00428af5u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428AE0_VA_STORE = 0x00428af8u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428AE0_VA_RET = 0x00428affu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428B10_VA = 0x00428b10u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428B10_END_VA = 0x00428b16u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_428B10_RET_BYTES = 0;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428B10_FIELD_OFF = 0x1344u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428B10_VA_MOV = 0x00428b10u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428B10_VA_RET = 0x00428b16u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428B50_VA = 0x00428b50u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428B50_END_VA = 0x00428b5au;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_428B50_RET_BYTES = 0;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428B50_FIELD_OFF = 0x1ba78u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428B50_VA_GLOBAL_LOAD = 0x00428b50u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428B50_VA_ADD = 0x00428b55u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428B50_VA_RET = 0x00428b5au;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428CD0_VA = 0x00428cd0u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428CD0_END_VA = 0x00428cdau;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_428CD0_RET_BYTES = 0;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428CD0_FIELD_OFF = 0x29fbcu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428CD0_VA_GLOBAL_LOAD = 0x00428cd0u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428CD0_VA_ADD = 0x00428cd5u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_428CD0_VA_RET = 0x00428cdau;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_429550_VA = 0x00429550u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_429550_END_VA = 0x00429556u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_429550_RET_BYTES = 0;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_429550_COMPARE_VALUE = 2;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_429550_VA_CMP = 0x00429550u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_429550_VA_SETGE = 0x00429553u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_429550_VA_RET = 0x00429556u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_429560_VA = 0x00429560u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_429560_END_VA = 0x00429566u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_429560_RET_BYTES = 0;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_429560_COMPARE_VALUE = 4;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_429560_VA_CMP = 0x00429560u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_429560_VA_SETE = 0x00429563u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_429560_VA_RET = 0x00429566u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_429F20_VA = 0x00429f20u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_429F20_END_VA = 0x00429f28u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_429F20_RET_BYTES = 0;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_429F20_CONST_VA = 0x00baa198u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_429F20_CONST_BITS = 0x3e4ccccdu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_429F20_VA_MOVSS = 0x00429f20u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_429F20_VA_RET = 0x00429f28u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_42A020_VA = 0x0042a020u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_42A020_END_VA = 0x0042a028u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_42A020_RET_BYTES = 0;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_42A020_VA_ZERO_STORE = 0x0042a020u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_42A020_VA_MOV_EAX = 0x0042a026u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_42A020_VA_RET = 0x0042a028u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_42A030_VA = 0x0042a030u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_42A030_THROW_PUSH_VA = 0x0042a030u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_42A030_CALL_VA = 0x0042a035u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_42A030_MSG_VA = 0x00b1c618u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_42A030_SLOT_VA = 0x00b18468u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_42A030_THROW_CALLERS = 19;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_42A040_CALLERS = 1;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_42A040_VA = 0x0042a040u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_42A040_END_VA = 0x0042a1f8u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_42A040_RET_BYTES = 8;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_42A040_NODE_BYTE_D_OFF = 0x0du;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_42A040_NODE_FIELD_10_OFF = 0x10u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_42A040_OUT_NODE0_OFF = 0u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_42A040_OUT_FLAG4_OFF = 4u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_42A040_FOUND_FLAG = 0;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_42A040_INSERT_FLAG = 1;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_42A040_VA_NODE_LOAD = 0x0042a077u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_42A040_VA_BYTE_GATE = 0x0042a07au;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_42A040_VA_GATE_JUMP = 0x0042a07eu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_42A040_VA_KEY_LOAD = 0x0042a080u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_42A040_VA_GE_CMP = 0x0042a082u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_42A040_VA_GE_JUMP = 0x0042a085u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_42A040_VA_NODE_STORE = 0x0042a08au;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_42A040_VA_FLAG_STORE = 0x0042a08cu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_42A040_VA_BOUND_TOP = 0x0042a0a4u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_42A040_VA_GUARD_CMP = 0x0042a0a4u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_42A040_VA_GUARD_JUMP = 0x0042a0abu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_42A040_VA_INSERT_STORE = 0x0042a1e1u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_42A040_VA_INSERT_FLAG = 0x0042a1e3u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_42A040_FOUND_PREFIX_VA = 0x0042a077u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_42A040_FOUND_PREFIX_END = 0x0042a08cu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_4170D0 = 0x004170d0u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_A0F4C0 = 0x00a0f4c0u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_415F80 = 0x00415f80u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_415FE0 = 0x00415fe0u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_7ABCC0 = 0x007abcc0u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_7ABCC0_CALL = 0x0082f070u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_7ABE20 = 0x7abe20u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_7ABE20_CALL = 0x0082f084u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_92DC30 = 0x92dc30u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_956780 = 0x956780u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_A648B0 = 0xa648b0u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_ANIM_ARG = 0x0082f063u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_ANM2_ALLOC = 0x40cf00u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_ANM2_FREE = 0xaef15cu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_ANM2_LOAD = 0x0040bd50u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_BOUND = 0x0082f0c3u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_CLAMP = 0x0082f040u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_COOKIE_CHECK = 0x00aef12bu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_FATAL = 0x0082f025u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_GAME_REREAD = 0x0082f089u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_HOST_VA_LOG = 0x00a112c0u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_IAT_VA_CXXHANDLER = 0x00b18784u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_IAT_VA_INVALID_PARAM = 0x00b18894u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_IAT_VA_TERMINATE = 0x00b18780u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_OWNER_ANM2 = 1;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_OWNER_PURE = 2;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_OWNER_THIS = 0;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_PARAM2_7ABCC0_ARGNONZERO = 0x00b1dff0;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_PARAM2_7ABCC0_ARGZERO = 0x00b1e010;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_PARAM2_82F07D = 0x00b6ce1c;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_PLAYER_173_OFF = 0x173u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_PLAYER_410_OFF = 0x410u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_PLAYER_ELEM_STRIDE = 4;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_PLAYER_F360_OFF = 0x360u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_PLAYER_F364_OFF = 0x364u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_PLAYER_SKIP_OFF = 0x2cu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_PLAYER_VEC_END_OFF = 0x1baacu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_PLAYER_VEC_OFF = 0x1baa8u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_SEH_ACTION_VA = 0x00af05cdu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_SEH_COOKIE_VA = 0x00bf93b4u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_SEH_DISPATCH_VA = 0x00af05c7u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_SEH_EH_FLAGS = 1;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_SEH_FUNCINFO_VA_408830 = 0x00bb3550u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_SEH_FUNCINFO_VA_408970 = 0x00bb3584u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_SEH_HANDLER_VA_408830 = 0x00af0b60u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_SEH_HANDLER_VA_408970 = 0x00af0b80u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_SEH_MAGIC = 0x19930522;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_SEH_MAX_STATE_408830 = 2;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_SEH_MAX_STATE_408970 = 4;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_SEH_TRY_BLOCKS = 0;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_SEH_UNWIND_TO_STATE = -1;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_SETUP_STORE_COUNT = 9;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_SETUP_TARGET_GAME = 1;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_SETUP_TARGET_THIS = 0;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_SFX_FRAME_DELAY = 2;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_SFX_GLOBAL_VA = 0x00c7169cu;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_SFX_ID_7ABCC0 = 0xd7;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_SFX_ID_DIM1 = 0x260;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_SFX_ID_DIMOTHER = 0x261;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_SFX_LOOP = 0;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_SFX_PAN = 0;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_SFX_PITCH_BITS = 0x3f800000u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_SFX_RECEIVER_OFF = 0x2a324u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_SFX_VOLUME_BITS = 0x3f800000u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_STATS_FIXED_VA = 0x00c7f618u;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_STATS_HEAD_DELTA = 0x30;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_STATS_HEAD_VA = 0x00c7de78u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_STORE_VA_1398 = 0x007abe78u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_STORE_VA_139A_HEAD = 0x007abe2eu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_STORE_VA_139A_TAIL = 0x007abe71u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_STORE_VA_14C = 0x007abe42u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_STORE_VA_410 = 0x0082f0b2u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_STORE_VA_8C = 0x007abe6au;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_STORE_VA_F360 = 0x0082f09au;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_STORE_VA_F364 = 0x0082f0aau;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_STORE_VA_FIELD_10 = 0x0082efbeu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_STORE_VA_FIELD_14 = 0x0082efaeu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_STORE_VA_FIELD_18 = 0x0082efefu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_STORE_VA_FIELD_1C = 0x0082efbbu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_STORE_VA_FIELD_20 = 0x0082efd7u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_STORE_VA_FIELD_238 = 0x0082efc1u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_STORE_VA_FIELD_24 = 0x0082efdeu;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_STORE_VA_FIELD_4 = 0x0082efb4u;
static constexpr uint32_t ISAAC_ROOM_TRANSITION_ENGINE_STORE_VA_GAME_1BB74 = 0x0082efcbu;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_TAIL_FIELD8_ANIM2 = 0x1e;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_TAIL_FIELD8_SLOT_NEG1 = 3;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_TAIL_FIELD8_SLOT_OTHER = 7;
static constexpr int32_t ISAAC_ROOM_TRANSITION_ENGINE_TAIL_SFX_ID_NONE = -1;

/* Store / step records. Field order is the Wasm lockstep order. */
typedef struct IsaacRoomTransitionEngine7abe20Store {
  int32_t offset;
  uint32_t value;
  uint32_t pe_va;
  uint32_t width;
  uint32_t gated;
} IsaacRoomTransitionEngine7abe20Store;

typedef struct IsaacRoomTransitionEngine7abe20StorePlan {
  IsaacRoomTransitionEngine7abe20Store stores[5];
} IsaacRoomTransitionEngine7abe20StorePlan;

typedef struct IsaacRoomTransitionEngineSetupStore {
  uint32_t target;
  uint32_t offset;
  uint32_t value;
  uint32_t pe_va;
} IsaacRoomTransitionEngineSetupStore;

typedef struct IsaacRoomTransitionEngineSetupStorePlan {
  IsaacRoomTransitionEngineSetupStore stores[9];
} IsaacRoomTransitionEngineSetupStorePlan;

typedef struct IsaacRoomTransitionEnginePlayerResetStore {
  uint32_t offset;
  uint32_t value;
  uint32_t pe_va;
  uint32_t width;
} IsaacRoomTransitionEnginePlayerResetStore;

typedef struct IsaacRoomTransitionEnginePlayerResetStorePlan {
  IsaacRoomTransitionEnginePlayerResetStore stores[3];
} IsaacRoomTransitionEnginePlayerResetStorePlan;

typedef struct IsaacRoomTransitionEnginePlayerResetPlan {
  IsaacRoomTransitionEnginePlayerResetStore stores[3];
  int32_t index_after;
  int32_t index_stored_back;
  int32_t reload_used;
} IsaacRoomTransitionEnginePlayerResetPlan;

typedef struct IsaacRoomTransitionEngine40a1b0Store {
  uint32_t disp;
  uint32_t width;
  uint32_t imm;
  uint32_t va;
} IsaacRoomTransitionEngine40a1b0Store;

typedef struct IsaacRoomTransitionEngineSetup {
  int32_t field_4;
  int32_t field_10;
  int32_t field_14;
  int32_t field_18;
  int32_t field_1c;
  int32_t field_20;
  int32_t field_24;
  int32_t field_238;
} IsaacRoomTransitionEngineSetup;

typedef struct IsaacRoomTransitionEngineStart {
  int32_t field_0;
  int32_t field_8;
  int32_t field_c;
  float field_22c;
  float field_230;
} IsaacRoomTransitionEngineStart;

typedef struct IsaacRoomTransitionEnginePlayerLoopStep {
  int32_t count;
  int32_t fatal_needed;
  int32_t index;
  int32_t clamped_to_first;
  uint32_t element_ptr;
  int32_t index_after;
} IsaacRoomTransitionEnginePlayerLoopStep;

typedef struct IsaacRoomTransitionEnginePlayerCallPlan {
  int32_t call_7abcc0;
  int32_t arg_7abcc0;
  int32_t call_7abe20;
  int32_t game_reread;
} IsaacRoomTransitionEnginePlayerCallPlan;

typedef struct IsaacRoomTransitionEngine7abe20RewindDecision {
  int32_t rewind_needed;
  int32_t store_8c;
} IsaacRoomTransitionEngine7abe20RewindDecision;

typedef struct IsaacRoomTransitionEngine7abcc0Plan {
  uint32_t param2;
  int32_t sfx_needed;
  uint32_t sfx_id;
} IsaacRoomTransitionEngine7abcc0Plan;

typedef struct IsaacRoomTransitionEngineSfxPlayPack {
  uint32_t volume_bits;
  int32_t frame_delay;
  int32_t loop;
  uint32_t pitch_bits;
  int32_t pan;
  uint32_t receiver_off;
  uint32_t prep_va;
  uint32_t play_va;
} IsaacRoomTransitionEngineSfxPlayPack;

typedef struct IsaacRoomTransitionEnginePlayerLoopStepExact {
  int32_t count_head;
  int32_t fatal_needed;
  int32_t end_rereads;
  int32_t game_reread_fatal;
  int32_t count_bound;
  int32_t index;
  int32_t clamped_to_first;
  uint32_t slot_ptr;
  int32_t index_after;
} IsaacRoomTransitionEnginePlayerLoopStepExact;

typedef struct IsaacRoomTransitionEngineTailPlan {
  int32_t field_0;
  int32_t anim2_path;
  int32_t field_8;
  int32_t field_c;
  uint32_t field_22c_bits;
  uint32_t field_230_bits;
  int32_t sfx_needed;
  int32_t sfx_id;
} IsaacRoomTransitionEngineTailPlan;

typedef struct IsaacRoomTransitionEngineEntryLogPack {
  int32_t level;
  uint32_t format_va;
  uint32_t frame_field_off;
  int32_t anim_arg;
  uint32_t log_va;
  int32_t argc;
} IsaacRoomTransitionEngineEntryLogPack;

typedef struct IsaacRoomTransitionEngineAnm2StringPlan {
  uint32_t literal_va;
  uint32_t literal_len;
  uint32_t sso_capacity;
  uint32_t heap_capacity;
  uint32_t alloc_request;
  uint32_t load_graphics;
  uint32_t load_receiver_off;
  uint32_t load_va;
  uint32_t alloc_va;
  uint32_t free_va;
} IsaacRoomTransitionEngineAnm2StringPlan;

typedef struct IsaacRoomTransitionEngine40a5d0WarnPack {
  int32_t level;
  uint32_t format_va;
  uint32_t needle;
  uint32_t log_va;
  int32_t argc;
  uint32_t al;
} IsaacRoomTransitionEngine40a5d0WarnPack;

typedef struct IsaacRoomTransitionEngine40a5d0Lookup {
  int32_t entered;
  int32_t iterations;
  int32_t found;
  int32_t index;
  uint32_t entry_ptr;
  uint32_t receiver;
  uint32_t callee_va;
  uint32_t warn_needle;
  uint32_t al;
  int32_t truncated;
} IsaacRoomTransitionEngine40a5d0Lookup;

typedef struct IsaacRoomTransitionEngine408830Plan {
  int32_t store_arg_first;
  int32_t free_a;
  int32_t free_b;
  int32_t alloc_a;
  uint32_t alloc_a_size;
  uint32_t memset_a_size;
  int32_t alloc_b;
  uint32_t alloc_b_size;
  uint32_t memset_b_size;
  uint32_t memset_fill;
  uint32_t final_4;
  uint32_t final_8;
  uint32_t final_c;
  uint32_t tail_10_bits;
  uint32_t tail_14_byte;
  uint32_t tail_18;
  uint32_t tail_1c;
  int32_t host_calls;
} IsaacRoomTransitionEngine408830Plan;

typedef struct IsaacRoomTransitionEngine408970ArmPlan {
  int32_t arm;
  int32_t wrapper_free;
  int32_t zero_needed;
  uint32_t zero_off;
  uint32_t alloc_size;
  uint32_t memset_size;
  uint32_t memset_fill;
  int32_t copy_needed;
  uint32_t copy_size;
  uint32_t copy_src_off;
  int32_t release_old;
  uint32_t stats_block;
  uint32_t release_ptr;
  int32_t publish_needed;
  uint32_t publish_off;
  uint32_t publish_value;
  int32_t host_calls;
} IsaacRoomTransitionEngine408970ArmPlan;

typedef struct IsaacRoomTransitionEngine408970Plan {
  int32_t old_count_a;
  int32_t new_count_a;
  int32_t old_count_b;
  int32_t new_count_b;
  IsaacRoomTransitionEngine408970ArmPlan arm_a;
  IsaacRoomTransitionEngine408970ArmPlan arm_b;
  uint32_t final_4;
  uint32_t final_8;
  uint32_t final_c;
  uint32_t clobbered_a;
  int32_t store_arg_last;
  int32_t host_calls;
} IsaacRoomTransitionEngine408970Plan;

typedef struct IsaacRoomTransitionEngineAnimstateSehPack {
  uint32_t body_va;
  uint32_t handler_va;
  uint32_t funcinfo_va;
  uint32_t magic;
  int32_t max_state;
  int32_t try_blocks;
  uint32_t eh_flags;
  uint32_t unwind_action_va;
  int32_t unwind_to_state;
  uint32_t terminate_iat_va;
  uint32_t dispatch_va;
  uint32_t dispatch_iat_va;
  uint32_t cookie_va;
} IsaacRoomTransitionEngineAnimstateSehPack;

typedef struct IsaacRoomTransitionEngine7abe20408830CallPack {
  uint32_t callee_va;
  uint32_t receiver_off;
  uint32_t arg;
  uint32_t push_va;
  uint32_t call_va;
  uint32_t via_a5d0_receiver_off;
  uint32_t anm2_off;
  int32_t anim_state_delta;
  int32_t overlay_state_delta;
} IsaacRoomTransitionEngine7abe20408830CallPack;

typedef struct IsaacRoomTransitionEngine82ee40FramePack {
  uint32_t body_va;
  uint32_t ret_va;
  uint32_t end_va;
  uint32_t size;
  int32_t ret_bytes;
  int32_t argc;
  uint32_t arg_room_off;
  uint32_t arg_slot_off;
  uint32_t arg_anim_off;
  uint32_t arg_player_off;
  uint32_t arg_dim_off;
  uint32_t seh_handler_va;
  uint32_t seh_push_va;
  uint32_t cookie_va;
  uint32_t cookie_check_va;
  int32_t call_sites;
  int32_t callees;
  int32_t direct_call_sites;
  int32_t indirect_call_sites;
  uint32_t indirect_iat_va;
} IsaacRoomTransitionEngine82ee40FramePack;

typedef struct IsaacRoomTransitionEngine7abe20Receivers {
  uint32_t reset;
  uint32_t direct_830;
  uint32_t a5d0;
  uint32_t a5d0_match;
  uint32_t rewind;
  int32_t alias;
} IsaacRoomTransitionEngine7abe20Receivers;

typedef struct IsaacRoomTransitionEngine7abe20BodyStep {
  uint32_t pe_va;
  uint32_t kind;
  uint32_t offset;
  uint32_t value;
  uint32_t width;
  uint32_t gated;
  uint32_t ran;
  uint32_t owner;
  uint32_t host_calls;
} IsaacRoomTransitionEngine7abe20BodyStep;

typedef struct IsaacRoomTransitionEngine7abe20BodyPlan {
  IsaacRoomTransitionEngine7abe20BodyStep steps[9];
  int32_t rewind_needed;
  int32_t nested_830_ran;
  int32_t a5d0_warn_host;
  int32_t reset_host_calls;
  int32_t direct_830_host_calls;
  int32_t nested_830_host_calls;
  int32_t a5d0_host_calls;
  int32_t rewind_host_calls;
  int32_t host_calls;
  int32_t pure_complete;
  int32_t direct_arg_ok;
  uint32_t nested_830_callee_va;
  uint32_t nested_830_data;
  IsaacRoomTransitionEngine7abe20Receivers receivers;
} IsaacRoomTransitionEngine7abe20BodyPlan;

typedef struct IsaacRoomTransitionEngine408c90Plan {
  int32_t entered;
  int32_t iterations;
  uint32_t f18;
  uint32_t f1c;
  int32_t warn_data_null;
  int32_t fault;
  int32_t truncated;
} IsaacRoomTransitionEngine408c90Plan;

typedef struct IsaacRoomTransitionEngine40a1b0ZeroPlan {
  uint32_t count_a;
  uint32_t buf_a;
  int32_t needs_a;
  uint32_t count_b;
  uint32_t buf_b;
  int32_t needs_b;
} IsaacRoomTransitionEngine40a1b0ZeroPlan;

typedef struct IsaacRoomTransitionEngine40a1b0RewindPlan {
  IsaacRoomTransitionEngine40a1b0Store stores[3];
  int32_t entered;
  int32_t iterations;
  uint32_t f18;
  uint32_t f1c;
  int32_t warn_data_null;
  int32_t fault;
  int32_t truncated;
  IsaacRoomTransitionEngine40a1b0ZeroPlan zero;
} IsaacRoomTransitionEngine40a1b0RewindPlan;

typedef struct IsaacRoomTransitionEngine956780Plan {
  int32_t ran;
  int32_t seed_warn;
  int32_t seed_fault;
  uint32_t seed_after;
  uint32_t remainder;
  int32_t id_out;
  int32_t store_25;
  int32_t store_12d;
} IsaacRoomTransitionEngine956780Plan;

/* v14: FUN_004288a0 lower-bound walk result. Field order is the Wasm
   lockstep order: node0 (out[0]) / flag4 (out[4]) / node8 (out[8]) then
   the diagnostics. */
typedef struct IsaacRoomTransitionEngine4288a0Lookup {
  uint32_t node0;
  uint32_t flag4;
  uint32_t node8;
  uint32_t root;
  uint32_t entered;
  int32_t iterations;
  uint32_t truncated;
} IsaacRoomTransitionEngine4288a0Lookup;

/* v15: FUN_004288f0 / FUN_00428910 map-result getter plans. Field order is
   the Wasm lockstep order: the two dwords the machine stores to
   receiver+0x33c/+0x340 (4288f0) or receiver+0x360/+0x364 (428910). */
typedef struct IsaacRoomTransitionEngine4288f0Copy {
  uint32_t node0;
  uint32_t flag4;
} IsaacRoomTransitionEngine4288f0Copy;

typedef struct IsaacRoomTransitionEngine428910Copy {
  uint32_t node0;
  uint32_t flag4;
} IsaacRoomTransitionEngine428910Copy;

/* v16: FUN_00428940 xorshift128+-style core plan. Field order is the Wasm
   lockstep order: the four receiver dwords (recv+0x58/+0x5c/+0x60/+0x64)
   then the state lane0 write-back (== step60; the final combine never
   stores back to the state). */
typedef struct IsaacRoomTransitionEngine428940Plan {
  uint32_t step58;
  uint32_t step5c;
  uint32_t step60;
  uint32_t step64;
  uint32_t state0_after;
} IsaacRoomTransitionEngine428940Plan;

/* v16: FUN_00428a80 bit setter plan. Field order is the Wasm lockstep
   order: the clamped index, the word/bit decomposition, the mask, the
   dword stored to this+0x1839c + word*4, and the set/clear flag. */
typedef struct IsaacRoomTransitionEngine428a80BitPlan {
  int32_t index_clamped;
  uint32_t word;
  uint32_t bit;
  uint32_t mask;
  uint32_t dword_after;
  int32_t set;
} IsaacRoomTransitionEngine428a80BitPlan;

/* Prototypes recovered from the family cpp. */
int32_t isaac_room_transition_engine_82ee40_early_skip_setup(int32_t gate_1ba78, int32_t anim);
int32_t isaac_room_transition_engine_82ee40_needs_anm2_load(uint32_t field_141_byte);
int32_t isaac_room_transition_engine_82ee40_rewrite_slot(int32_t room, int32_t arg2, int32_t dim, int32_t game_18304, int32_t game_1830c);
int32_t isaac_room_transition_engine_82ee40_effective_dim(int32_t dim, int32_t game_1830c);
void isaac_room_transition_engine_82ee40_apply_setup(IsaacRoomTransitionEngineSetup* state, int32_t room, int32_t slot, int32_t anim, int32_t effective_dim);
void isaac_room_transition_engine_82ee40_apply_start_state(IsaacRoomTransitionEngineStart* state, int32_t anim, int32_t slot);
int32_t isaac_room_transition_engine_82ee40_needs_anim12_sfx(int32_t anim);
int32_t isaac_room_transition_engine_82ee40_anim12_sfx_id(int32_t dim);
void isaac_room_transition_engine_82ee40_player_entry_float_reset(float* field_360, float* field_364, uint8_t* field_410);
int32_t isaac_room_transition_engine_82eb90_predicate(int32_t field_1c);
int32_t isaac_room_transition_engine_player_loop_needs_host(int32_t field_1c);
int32_t isaac_room_transition_engine_82ee40_player_count(uint32_t begin, uint32_t end);
int32_t isaac_room_transition_engine_82ee40_player_loop_enter(int32_t count);
void isaac_room_transition_engine_82ee40_player_loop_step(int32_t index, uint32_t begin, uint32_t end, IsaacRoomTransitionEnginePlayerLoopStep* out);
int32_t isaac_room_transition_engine_82ee40_player_loop_continue(int32_t index_after, uint32_t begin_after, uint32_t end_after);
int32_t isaac_room_transition_engine_82ee40_player_entry_eligible(int32_t field_2c);
int32_t isaac_room_transition_engine_82ee40_7abcc0_needed(int32_t predicate, uint32_t entry_173_byte);
int32_t isaac_room_transition_engine_82ee40_7abcc0_arg(int32_t anim);
int32_t isaac_room_transition_engine_82ee40_7abe20_needed(int32_t field_1c);
void isaac_room_transition_engine_82ee40_player_call_plan(int32_t predicate, uint32_t entry_173_byte, int32_t field_1c, int32_t anim, IsaacRoomTransitionEnginePlayerCallPlan* out);
int32_t isaac_room_transition_engine_7abe20_rewind_needed(uint32_t a5d0_result_byte);
void isaac_room_transition_engine_7abe20_rewind_decision(uint32_t a5d0_result_byte, IsaacRoomTransitionEngine7abe20RewindDecision* out);
void isaac_room_transition_engine_7abe20_store_plan(IsaacRoomTransitionEngine7abe20StorePlan* out);
uint32_t isaac_room_transition_engine_7abcc0_param2(uint32_t arg_byte);
int32_t isaac_room_transition_engine_7abcc0_sfx_needed(uint32_t arg_byte);
void isaac_room_transition_engine_7abcc0_plan(uint32_t arg_byte, IsaacRoomTransitionEngine7abcc0Plan* out);
void isaac_room_transition_engine_sfx_play_pack(IsaacRoomTransitionEngineSfxPlayPack* out);
uint32_t isaac_room_transition_engine_c7b640_bits(void);
uint32_t isaac_room_transition_engine_c7b644_bits(void);
uint32_t isaac_room_transition_engine_82ee40_player_loop_end_used(int32_t fatal_needed, uint32_t end_f010, uint32_t end_f02a);
void isaac_room_transition_engine_82ee40_player_loop_step_exact(int32_t index, uint32_t end_f010, uint32_t begin_f015, uint32_t end_f02a, uint32_t begin_f036, IsaacRoomTransitionEnginePlayerLoopStepExact* out);
int32_t isaac_room_transition_engine_82ee40_loop_game_source(int32_t fatal_needed, int32_t entry_eligible, int32_t call_7abcc0, int32_t call_7abe20);
int32_t isaac_room_transition_engine_82ee40_anim12_sfx_id_from_args(int32_t dim_arg_raw, int32_t game_1830c);
void isaac_room_transition_engine_82ee40_tail_plan(int32_t field_1c_after_loop, int32_t slot_after_rewrite, int32_t dim_arg_raw, IsaacRoomTransitionEngineTailPlan* out);
void isaac_room_transition_engine_82ee40_entry_log_pack(int32_t anim_arg, IsaacRoomTransitionEngineEntryLogPack* out);
void isaac_room_transition_engine_82ee40_anm2_string_plan(IsaacRoomTransitionEngineAnm2StringPlan* out);
int32_t isaac_room_transition_engine_82ee40_anm2_string_needs_release(uint32_t capacity);
uint32_t isaac_room_transition_engine_82ee40_anm2_string_release_size(uint32_t capacity);
int32_t isaac_room_transition_engine_40a5d0_search_enter(int32_t count);
uint32_t isaac_room_transition_engine_40a5d0_name_ptr(uint32_t elem_ptr, uint32_t capacity, uint32_t heap_ptr);
int32_t isaac_room_transition_engine_40a5d0_loop_continue(int32_t index_after, int32_t count);
uint32_t isaac_room_transition_engine_40a5d0_entry_ptr(uint32_t table_base, int32_t index);
uint32_t isaac_room_transition_engine_40a5d0_receiver(uint32_t this_ptr);
uint32_t isaac_room_transition_engine_40a5d0_match_callee(uint32_t arg2);
uint32_t isaac_room_transition_engine_40a5d0_return_eax(int32_t al, uint32_t callee_eax);
int32_t isaac_room_transition_engine_40a5d0_strcmp(const uint8_t* mem, uint32_t haystack_off, uint32_t needle_off, uint32_t* out_advance);
void isaac_room_transition_engine_40a5d0_warn_pack(uint32_t needle, IsaacRoomTransitionEngine40a5d0WarnPack* out);
void isaac_room_transition_engine_40a5d0_lookup(const uint8_t* mem, uint32_t table_off, int32_t count, uint32_t needle_off, uint32_t this_off, uint32_t arg2, int32_t iteration_limit, IsaacRoomTransitionEngine40a5d0Lookup* out);
uint32_t isaac_room_transition_engine_animstate_alloc_size(uint32_t count);
uint32_t isaac_room_transition_engine_animstate_memset_size(uint32_t count);
uint32_t isaac_room_transition_engine_animstate_free_block_ptr(uint32_t buf_ptr);
uint32_t isaac_room_transition_engine_animstate_stats_block(uint32_t stats_head);
int32_t isaac_room_transition_engine_408830_count_gate(uint32_t count);
void isaac_room_transition_engine_408830_plan(uint32_t arg, uint32_t buf_a, uint32_t buf_b, uint32_t data_0, uint32_t count_a_alloc, uint32_t count_a_memset, uint32_t data_after_a, uint32_t count_b_alloc, uint32_t count_b_memset, uint32_t alloc_a_result, uint32_t alloc_b_result, IsaacRoomTransitionEngine408830Plan* out);
int32_t isaac_room_transition_engine_408970_count_sample(uint32_t data_ptr, uint32_t raw_count);
int32_t isaac_room_transition_engine_408970_arm_select(uint32_t old_count, uint32_t new_count);
int32_t isaac_room_transition_engine_408970_copy_needed(uint32_t old_count);
uint32_t isaac_room_transition_engine_408970_copy_size(uint32_t old_count);
void isaac_room_transition_engine_408970_arm_plan(uint32_t which_b, uint32_t old_count, uint32_t new_count, uint32_t slot_ptr, uint32_t stats_head, uint32_t alloc_result, IsaacRoomTransitionEngine408970ArmPlan* out);
void isaac_room_transition_engine_408970_plan(uint32_t old_data, uint32_t new_data, uint32_t old_count_a_raw, uint32_t old_count_b_raw, uint32_t new_count_a_raw, uint32_t new_count_b_raw, uint32_t slot_08, uint32_t slot_0c, uint32_t stats_head, uint32_t alloc_a_result, uint32_t alloc_b_result, IsaacRoomTransitionEngine408970Plan* out);
void isaac_room_transition_engine_animstate_seh_pack(uint32_t which_970, IsaacRoomTransitionEngineAnimstateSehPack* out);
int32_t isaac_room_transition_engine_animstate_seh_unwind_terminates(int32_t state, uint32_t which_970);
void isaac_room_transition_engine_7abe20_408830_call_pack(IsaacRoomTransitionEngine7abe20408830CallPack* out);
int32_t isaac_room_transition_engine_7abe20_408830_pure_complete(uint32_t buf_a, uint32_t buf_b);
void isaac_room_transition_engine_82ee40_setup_store_plan(int32_t room, int32_t slot, int32_t anim, int32_t effective_dim, int32_t player_arg, IsaacRoomTransitionEngineSetupStorePlan* out);
void isaac_room_transition_engine_82ee40_frame_pack(IsaacRoomTransitionEngine82ee40FramePack* out);
void isaac_room_transition_engine_7abe20_receivers(uint32_t entry_ptr, IsaacRoomTransitionEngine7abe20Receivers* out);
int32_t isaac_room_transition_engine_7abe20_nested_830_needed(uint32_t a5d0_result_byte);
void isaac_room_transition_engine_7abe20_body_plan(uint32_t entry_ptr, uint32_t a5d0_result_byte, const IsaacRoomTransitionEngine408830Plan* direct_830, const IsaacRoomTransitionEngine408830Plan* nested_830, int32_t reset_host_calls, int32_t rewind_host_calls, IsaacRoomTransitionEngine7abe20BodyPlan* out);
int32_t isaac_room_transition_engine_82ee40_player_reset_index_after(int32_t entry_eligible, int32_t index_at_top, int32_t index_reloaded);
void isaac_room_transition_engine_82ee40_player_reset_store_plan(IsaacRoomTransitionEnginePlayerResetStorePlan* out);
void isaac_room_transition_engine_82ee40_player_reset_plan(int32_t entry_eligible, int32_t index_at_top, int32_t index_reloaded, IsaacRoomTransitionEnginePlayerResetPlan* out);
uint32_t isaac_room_transition_engine_pure_helpers_abi_version(void);
void isaac_room_transition_engine_408c90_plan(const uint8_t* mem, uint32_t this_off, uint32_t threshold_bits, uint32_t f18_in, uint32_t f1c_in, int32_t iteration_limit, IsaacRoomTransitionEngine408c90Plan* out);
void isaac_room_transition_engine_40a1b0_zero_plan(const uint8_t* mem, uint32_t this_off, IsaacRoomTransitionEngine40a1b0ZeroPlan* out);
void isaac_room_transition_engine_40a1b0_rewind_plan(const uint8_t* mem, uint32_t this_off, int32_t iteration_limit, IsaacRoomTransitionEngine40a1b0RewindPlan* out);

int32_t isaac_room_transition_engine_956780_gate(int32_t game, uint32_t node_byte_d, int32_t node_field_10, uint32_t node_ptr, uint32_t sentinel);
uint32_t isaac_room_transition_engine_956780_xorshift(uint32_t seed, uint32_t shift_a, uint32_t shift_b, uint32_t shift_c);
uint32_t isaac_room_transition_engine_956780_mod20(uint32_t value);
uint32_t isaac_room_transition_engine_956780_remap_id(uint32_t remainder);
void isaac_room_transition_engine_956780_plan(int32_t game, uint32_t node_byte_d, int32_t node_field_10, uint32_t node_ptr, uint32_t sentinel, int32_t id_in, uint32_t seed, uint32_t seed_reread, uint32_t shift_a, uint32_t shift_b, uint32_t shift_c, IsaacRoomTransitionEngine956780Plan* out);
void isaac_room_transition_engine_4288a0_lookup(const uint8_t* mem, uint32_t this_off, int32_t key, int32_t iteration_limit, IsaacRoomTransitionEngine4288a0Lookup* out);
void isaac_room_transition_engine_4288f0_copy(const uint8_t* mem, uint32_t out_off, IsaacRoomTransitionEngine4288f0Copy* out);
void isaac_room_transition_engine_428910_copy(const uint8_t* mem, uint32_t out_off, IsaacRoomTransitionEngine428910Copy* out);
uint32_t isaac_room_transition_engine_428940_xorshift(uint32_t x, uint32_t c1, uint32_t c2, uint32_t c3);
void isaac_room_transition_engine_428940_plan(const uint8_t* mem, uint32_t state_off, IsaacRoomTransitionEngine428940Plan* out);
void isaac_room_transition_engine_428a80_bit_plan(const uint8_t* mem, uint32_t this_off, int32_t index, uint32_t flag, IsaacRoomTransitionEngine428a80BitPlan* out);
uint32_t isaac_room_transition_engine_428a50_field_getter(const uint8_t* mem, uint32_t this_off);
uint32_t isaac_room_transition_engine_428a60_field_getter(const uint8_t* mem, uint32_t this_off);
uint32_t isaac_room_transition_engine_428a70_value_getter(const uint8_t* mem, uint32_t this_off);
uint32_t isaac_room_transition_engine_428930_field_getter(const uint8_t* mem, uint32_t this_off);
int32_t isaac_room_transition_engine_428ae0_clamp_value(int32_t value);
uint32_t isaac_room_transition_engine_428b10_value_getter(const uint8_t* mem, uint32_t this_off);
uint32_t isaac_room_transition_engine_428b50_field_getter(const uint8_t* mem, uint32_t this_off);
uint32_t isaac_room_transition_engine_428cd0_field_getter(const uint8_t* mem, uint32_t this_off);
int32_t isaac_room_transition_engine_429550_ge2_check(const uint8_t* mem, uint32_t this_off);
int32_t isaac_room_transition_engine_429560_eq4_check(const uint8_t* mem, uint32_t this_off);
uint32_t isaac_room_transition_engine_429f20_float_constant(void);
uint32_t isaac_room_transition_engine_42a020_zero_store(const uint8_t* mem, uint32_t this_off);
int32_t isaac_room_transition_engine_42a040_found_gate(uint32_t node_byte_d);
int32_t isaac_room_transition_engine_42a040_key_ge_field10(int32_t key, int32_t node_field_10);
int32_t isaac_room_transition_engine_42a040_bound_flag(uint32_t node_byte_d, int32_t node_field_10, int32_t key);

/* =====================================================================
 * v21 — POST: the first post-band cluster (frontier scan from the v20
 * end 0x42a1f8; the 0x42a1fb error tail belongs to the v20 body).
 * Three FULLY PURE one-liners in the immediate run, all thiscall,
 * plain ret, identify-zhl empty, zero claims anywhere:
 *   0x0042a250..0x42a257 (8 bytes): cmp dword [ecx+0x28],3 / sete al /
 *     ret — EQUALITY check (ZF-based, signedness-free). 11 direct E8
 *     callers.
 *   0x0042a260..0x42a266 (7 bytes): mov eax,[ecx+0x3bc] / ret — dword
 *     value getter (v18 0x428a70 shape). 23 direct E8 callers.
 *   0x0042a270..0x42a287 (24 bytes): chained fallback getter:
 *     eax = [this+4]; if null -> 1; eax = [eax+0x10]; if null -> 1;
 *     else eax = [eax+0x48]. Zero calls. 13 direct E8 callers.
 * The run continues with HOST-adjacent free wrappers (0x42a210 /
 * 0x42a230, E8 0xaef15c), a log-guarded getter (0x42a2d0, E8
 * 0xa112c0), and a bounded index getter (0x42a2f0) — left for later
 * units. ZERO byte gates (all compares/stores FULL-dword; sete is
 * signedness-free); zero uint8_t params.
 */
enum {
  ISAAC_ROOM_TRANSITION_ENGINE_42A250_VA = 0x0042a250u,
  ISAAC_ROOM_TRANSITION_ENGINE_42A250_VA_RET = 0x0042a257u,
  ISAAC_ROOM_TRANSITION_ENGINE_42A250_BODY_BYTES = 8u,
  ISAAC_ROOM_TRANSITION_ENGINE_42A250_CALLSITE_COUNT = 11,
  ISAAC_ROOM_TRANSITION_ENGINE_42A250_FIELD_28_OFF = 0x28u,
  ISAAC_ROOM_TRANSITION_ENGINE_42A250_CMP_IMM = 3,
  ISAAC_ROOM_TRANSITION_ENGINE_42A260_VA = 0x0042a260u,
  ISAAC_ROOM_TRANSITION_ENGINE_42A260_VA_RET = 0x0042a266u,
  ISAAC_ROOM_TRANSITION_ENGINE_42A260_BODY_BYTES = 7u,
  ISAAC_ROOM_TRANSITION_ENGINE_42A260_CALLSITE_COUNT = 23,
  ISAAC_ROOM_TRANSITION_ENGINE_42A260_FIELD_3BC_OFF = 0x3bcu,
  ISAAC_ROOM_TRANSITION_ENGINE_42A270_VA = 0x0042a270u,
  ISAAC_ROOM_TRANSITION_ENGINE_42A270_VA_RET = 0x0042a287u,
  ISAAC_ROOM_TRANSITION_ENGINE_42A270_BODY_BYTES = 24u,
  ISAAC_ROOM_TRANSITION_ENGINE_42A270_CALLSITE_COUNT = 13,
  ISAAC_ROOM_TRANSITION_ENGINE_42A270_PTR_OFF = 0x4u,
  ISAAC_ROOM_TRANSITION_ENGINE_42A270_INNER_OFF = 0x10u,
  ISAAC_ROOM_TRANSITION_ENGINE_42A270_VALUE_OFF = 0x48u,
  ISAAC_ROOM_TRANSITION_ENGINE_42A270_FALLBACK = 1u
};

int32_t isaac_room_transition_engine_42a250_eq3_check(uint32_t field_28);
uint32_t isaac_room_transition_engine_42a260_value_getter(const uint8_t* mem, uint32_t this_off);
uint32_t isaac_room_transition_engine_42a270_chain_value(const uint8_t* mem, uint32_t this_off);
int32_t isaac_room_transition_engine_42a270_used_fallback(const uint8_t* mem, uint32_t this_off);

/* =====================================================================
 * v22 — POOL: six verify-open one-liners from the ready pool (the
 * immediate run after the v21 cluster). ONE law per body. A SEVENTH
 * pool body, 0x0042a2f0 (bounded index getter, 12 direct E8 callers),
 * was DECLINED: EXACT ZHL __thiscall int
 * Entity_Player::GetBatteryCharge(int slot) (EntityPlayer.zhl) —
 * EntityPlayer-family claim. All six landed bodies: identify-zhl
 * address-stable, zero claims, FULLY PURE thiscall plain-ret.
 *   V22-A 0x0042a290..0x42a2b1 (34 bytes): bounded setter — idx =
 *     [ebp+8]; ja (UNSIGNED above) 0x1bf -> false; else
 *     [ecx+idx*4+0x76c] = [ebp+0xc]; true. 1 direct E8 caller
 *     0x0066ff42. Store SITE stays host; the ACCEPT decision is the
 *     law (the body's ONLY branch; ja unsigned — modeled directly).
 *   V22-B 0x0042a2c0..0x42a2c7 (8 bytes): cmp [ecx+4],0 / setne al /
 *     ret — null check. 4 direct E8 callers.
 *   V22-C 0x0042a310..0x42a316 (7 bytes): mov eax,[ecx+0x1340] / ret.
 *     1 direct E8 caller 0x005c04f2.
 *   V22-D 0x0042a320..0x42a326 (7 bytes): mov al,[ecx+0x20a9] / ret —
 *     BYTE-width load, v9 rule: & 0xff explicit in-body. 9 direct E8
 *     callers.
 *   V22-E 0x0042a330..0x42a336 (7 bytes): lea eax,[ecx+0x1a740] / ret.
 *     63 direct E8 callers.
 *   V22-F 0x0042a340..0x42a346 (7 bytes): lea eax,[ecx+0x1bb84] / ret.
 *     22 direct E8 callers.
 * ZERO compares with a signed/unsigned arm except V22-A's ja, which
 * the law models as UNSIGNED directly; V22-D is the only byte-width
 * access (masked).
 */
enum {
  ISAAC_ROOM_TRANSITION_ENGINE_42A290_VA = 0x0042a290u,
  ISAAC_ROOM_TRANSITION_ENGINE_42A290_VA_RET = 0x0042a2b1u,
  ISAAC_ROOM_TRANSITION_ENGINE_42A290_BODY_BYTES = 34u,
  ISAAC_ROOM_TRANSITION_ENGINE_42A290_CALLSITE_COUNT = 1,
  ISAAC_ROOM_TRANSITION_ENGINE_42A290_BOUND = 0x1bfu,
  ISAAC_ROOM_TRANSITION_ENGINE_42A290_ARRAY_BASE_OFF = 0x76cu,
  ISAAC_ROOM_TRANSITION_ENGINE_42A290_ELEM_SCALE = 4u,
  ISAAC_ROOM_TRANSITION_ENGINE_42A2C0_VA = 0x0042a2c0u,
  ISAAC_ROOM_TRANSITION_ENGINE_42A2C0_VA_RET = 0x0042a2c7u,
  ISAAC_ROOM_TRANSITION_ENGINE_42A2C0_BODY_BYTES = 8u,
  ISAAC_ROOM_TRANSITION_ENGINE_42A2C0_CALLSITE_COUNT = 4,
  ISAAC_ROOM_TRANSITION_ENGINE_42A2C0_FIELD_4_OFF = 0x4u,
  ISAAC_ROOM_TRANSITION_ENGINE_42A310_VA = 0x0042a310u,
  ISAAC_ROOM_TRANSITION_ENGINE_42A310_VA_RET = 0x0042a316u,
  ISAAC_ROOM_TRANSITION_ENGINE_42A310_BODY_BYTES = 7u,
  ISAAC_ROOM_TRANSITION_ENGINE_42A310_CALLSITE_COUNT = 1,
  ISAAC_ROOM_TRANSITION_ENGINE_42A310_FIELD_1340_OFF = 0x1340u,
  ISAAC_ROOM_TRANSITION_ENGINE_42A320_VA = 0x0042a320u,
  ISAAC_ROOM_TRANSITION_ENGINE_42A320_VA_RET = 0x0042a326u,
  ISAAC_ROOM_TRANSITION_ENGINE_42A320_BODY_BYTES = 7u,
  ISAAC_ROOM_TRANSITION_ENGINE_42A320_CALLSITE_COUNT = 9,
  ISAAC_ROOM_TRANSITION_ENGINE_42A320_FIELD_20A9_OFF = 0x20a9u,
  ISAAC_ROOM_TRANSITION_ENGINE_42A320_BYTE_MASK = 0xffu,
  ISAAC_ROOM_TRANSITION_ENGINE_42A330_VA = 0x0042a330u,
  ISAAC_ROOM_TRANSITION_ENGINE_42A330_VA_RET = 0x0042a336u,
  ISAAC_ROOM_TRANSITION_ENGINE_42A330_BODY_BYTES = 7u,
  ISAAC_ROOM_TRANSITION_ENGINE_42A330_CALLSITE_COUNT = 63,
  ISAAC_ROOM_TRANSITION_ENGINE_42A330_FIELD_1A740_OFF = 0x1a740u,
  ISAAC_ROOM_TRANSITION_ENGINE_42A340_VA = 0x0042a340u,
  ISAAC_ROOM_TRANSITION_ENGINE_42A340_VA_RET = 0x0042a346u,
  ISAAC_ROOM_TRANSITION_ENGINE_42A340_BODY_BYTES = 7u,
  ISAAC_ROOM_TRANSITION_ENGINE_42A340_CALLSITE_COUNT = 22,
  ISAAC_ROOM_TRANSITION_ENGINE_42A340_FIELD_1BB84_OFF = 0x1bb84u
};

int32_t isaac_room_transition_engine_42a290_accepts(uint32_t index);
int32_t isaac_room_transition_engine_42a2c0_non_null(uint32_t field_4);
uint32_t isaac_room_transition_engine_42a310_value_getter(const uint8_t* mem, uint32_t this_off);
uint32_t isaac_room_transition_engine_42a320_byte_getter(const uint8_t* mem, uint32_t this_off);
uint32_t isaac_room_transition_engine_42a330_field_getter(uint32_t this_off);
uint32_t isaac_room_transition_engine_42a340_field_getter(uint32_t this_off);

/* =====================================================================
 * v23 — 0x0042b020: multi-table switch classifier (797 B, FULLY PURE:
 * 0 E8 / 0 indirect / 0 SEH; the tail region is pinned jump-table
 * DATA). Machine (cdecl, ONE int32 arg, bool in al):
 *   arg == 0xe8 -> TRUE; SIGNED jg 0xe8 -> high path
 *   (idx2 = u32(arg - 234), ja over bound 0x1eb -> FALSE,
 *   byte_table2 @0x42b150 -> dword_table2 @0x42b148);
 *   else low path (idx1 = u32(arg - 11), ja over bound 0xcc -> FALSE,
 *   byte_table1 @0x42b078 -> dword_table1 @0x42b070);
 *   dword targets [0]=TRUE 0x0042b061 / [1]=FALSE 0x0042b067, i.e.
 *   byte value 0 -> TRUE. Tables pinned in the cpp as
 *   ISAAC_RTE_42B020_BYTE_TABLE1[204] / _BYTE_TABLE2[492]; both
 *   verified against the PE bytes by the family test.
 * The ONLY signed arm is the leading jg, modeled SIGNED directly;
 * range rejects are UNSIGNED ja. ZERO byte gates.
 */
enum {
  ISAAC_ROOM_TRANSITION_ENGINE_42B020_VA = 0x0042b020u,
  ISAAC_ROOM_TRANSITION_ENGINE_42B020_VA_TRUE = 0x0042b061u,
  ISAAC_ROOM_TRANSITION_ENGINE_42B020_VA_FALSE = 0x0042b067u,
  ISAAC_ROOM_TRANSITION_ENGINE_42B020_EQ_IMM = 0xe8,
  ISAAC_ROOM_TRANSITION_ENGINE_42B020_LOW_REBIAS = 0xbu,
  ISAAC_ROOM_TRANSITION_ENGINE_42B020_LOW_BOUND = 0xccu,
  ISAAC_ROOM_TRANSITION_ENGINE_42B020_LOW_TABLE_VA = 0x0042b078u,
  ISAAC_ROOM_TRANSITION_ENGINE_42B020_HIGH_REBIAS = 234u,
  ISAAC_ROOM_TRANSITION_ENGINE_42B020_HIGH_BOUND = 0x1ebu,
  ISAAC_ROOM_TRANSITION_ENGINE_42B020_HIGH_TABLE_VA = 0x0042b150u,
  ISAAC_ROOM_TRANSITION_ENGINE_42B020_LOW_TABLE_BYTES = 205u,
  ISAAC_ROOM_TRANSITION_ENGINE_42B020_HIGH_TABLE_BYTES = 492u,
  ISAAC_ROOM_TRANSITION_ENGINE_42B020_BODY_END_VA = 0x0042b33du
};

int32_t isaac_room_transition_engine_42b020_contains(int32_t arg);

/* =====================================================================
 * v24 — PAIR: two sibling switch classifiers immediately after the v23
 * body (both FULLY PURE: cdecl plain-ret, one int32 stack arg, bool in
 * al; identify-zhl address-stable; zero claims; 0 direct E8 callers
 * each — same table-dispatch family as the v23 body).
 *   V24-A 0x0042b340..0x0042b367 (40 bytes code): idx = u32(arg - 3);
 *     ja over bound 0xb9 -> FALSE (186 entries); byte_tableA @0x42b374
 *     -> dword_tableA @0x42b36c ([0]=TRUE 0x0042b35e / [1]=FALSE
 *     0x0042b364). byte value 0 -> TRUE. 71 TRUE / 115 FALSE.
 *   V24-B 0x0042b430..0x0042b455 (38 bytes code): idx = u32(arg -
 *     0x13); ja over bound 0x17 -> FALSE (24 entries); byte_tableB
 *     @0x42b460 -> dword_tableB @0x42b458 ([0]=TRUE 0x0042b44c /
 *     [1]=FALSE 0x0042b452). 6 TRUE / 18 FALSE.
 * ZERO byte gates; the ONLY compares are UNSIGNED ja bounds.
 */
enum {
  ISAAC_ROOM_TRANSITION_ENGINE_42B340_VA = 0x0042b340u,
  ISAAC_ROOM_TRANSITION_ENGINE_42B340_VA_TRUE = 0x0042b35eu,
  ISAAC_ROOM_TRANSITION_ENGINE_42B340_VA_FALSE = 0x0042b364u,
  ISAAC_ROOM_TRANSITION_ENGINE_42B340_REBIAS = 3u,
  ISAAC_ROOM_TRANSITION_ENGINE_42B340_BOUND = 0xb9u,
  ISAAC_ROOM_TRANSITION_ENGINE_42B340_BYTE_TABLE_VA = 0x0042b374u,
  ISAAC_ROOM_TRANSITION_ENGINE_42B340_DWORD_TABLE_VA = 0x0042b36cu,
  ISAAC_ROOM_TRANSITION_ENGINE_42B340_TABLE_BYTES = 186u,
  ISAAC_ROOM_TRANSITION_ENGINE_42B340_NEXT_FUNC = 0x0042b430u,
  ISAAC_ROOM_TRANSITION_ENGINE_42B430_VA = 0x0042b430u,
  ISAAC_ROOM_TRANSITION_ENGINE_42B430_VA_TRUE = 0x0042b44cu,
  ISAAC_ROOM_TRANSITION_ENGINE_42B430_VA_FALSE = 0x0042b452u,
  ISAAC_ROOM_TRANSITION_ENGINE_42B430_REBIAS = 0x13u,
  ISAAC_ROOM_TRANSITION_ENGINE_42B430_BOUND = 0x17u,
  ISAAC_ROOM_TRANSITION_ENGINE_42B430_BYTE_TABLE_VA = 0x0042b460u,
  ISAAC_ROOM_TRANSITION_ENGINE_42B430_DWORD_TABLE_VA = 0x0042b458u,
  ISAAC_ROOM_TRANSITION_ENGINE_42B430_TABLE_BYTES = 24u,
  ISAAC_ROOM_TRANSITION_ENGINE_42B430_NEXT_FUNC = 0x0042b470u
};

int32_t isaac_room_transition_engine_42b340_contains(int32_t arg);
int32_t isaac_room_transition_engine_42b430_contains(int32_t arg);

/* =====================================================================
 * v25 — 0x0042b480: switch classifier + 0x0042b550: field-pointer
 * getter (both FULLY PURE; identify-zhl address-stable; zero claims;
 * 0 direct E8 callers each — same indirect/table family).
 *   V25-A 0x0042b480..0x0042b4a3 (36 bytes code): idx = u32(arg - 1);
 *     ja over bound 0x60 -> FALSE (97 entries); byte_table @0x42b4b0
 *     -> dword_table @0x42b4a8 ([0]=TRUE 0x0042b49a / [1]=FALSE
 *     0x0042b4a0). byte value 0 -> TRUE. 37 TRUE / 60 FALSE.
 *   V25-B 0x0042b550..0x0042b553 (4 bytes): lea eax,[ecx+0x10] / ret —
 *     u32-wrapping field-pointer getter at +0x10 (v17/v18 shape).
 * ZERO byte gates; UNSIGNED ja bound.
 */
enum {
  ISAAC_ROOM_TRANSITION_ENGINE_42B480_VA = 0x0042b480u,
  ISAAC_ROOM_TRANSITION_ENGINE_42B480_VA_TRUE = 0x0042b49au,
  ISAAC_ROOM_TRANSITION_ENGINE_42B480_VA_FALSE = 0x0042b4a0u,
  ISAAC_ROOM_TRANSITION_ENGINE_42B480_REBIAS = 1u,
  ISAAC_ROOM_TRANSITION_ENGINE_42B480_BOUND = 0x60u,
  ISAAC_ROOM_TRANSITION_ENGINE_42B480_BYTE_TABLE_VA = 0x0042b4b0u,
  ISAAC_ROOM_TRANSITION_ENGINE_42B480_DWORD_TABLE_VA = 0x0042b4a8u,
  ISAAC_ROOM_TRANSITION_ENGINE_42B480_TABLE_BYTES = 97u,
  ISAAC_ROOM_TRANSITION_ENGINE_42B480_NEXT_FUNC = 0x0042b520u,
  ISAAC_ROOM_TRANSITION_ENGINE_42B550_VA = 0x0042b550u,
  ISAAC_ROOM_TRANSITION_ENGINE_42B550_FIELD_OFF = 0x10u
};

int32_t isaac_room_transition_engine_42b480_contains(int32_t arg);
uint32_t isaac_room_transition_engine_42b550_field_getter(uint32_t this_off);

/* =====================================================================
 * v26 — 0x0042b940: multi-case setter (94 B, FULLY PURE: 0 E8 / 0
 * indirect / 0 SEH). cdecl plain-ret, ONE pointer arg (obj), VOID
 * return. Dispatch on dword [obj+4]:
 *   type == 334 (0x14e) -> [obj+0x5c] = 10 AND [obj+0x58] = 10
 *   type == 129 (0x81)  -> [obj+0x5c] = 10
 *   type == 301 (0x12d) -> [obj+0x60] = 2
 *   type == 428 (0x1ac) -> [obj+0x60] = 4  (via SIGNED jg > 334 branch)
 *   else -> no store
 * The leading jg is SIGNED; the three je/jne are EQUALITY checks.
 * Store SITES stay host; retired VALUES decided by these three laws.
 */
enum {
  ISAAC_ROOM_TRANSITION_ENGINE_42B940_VA = 0x0042b940u,
  ISAAC_ROOM_TRANSITION_ENGINE_42B940_BODY_END_VA = 0x0042b99fu,
  ISAAC_ROOM_TRANSITION_ENGINE_42B940_TYPE_OFF = 0x4u,
  ISAAC_ROOM_TRANSITION_ENGINE_42B940_STORE_5C_OFF = 0x5cu,
  ISAAC_ROOM_TRANSITION_ENGINE_42B940_STORE_58_OFF = 0x58u,
  ISAAC_ROOM_TRANSITION_ENGINE_42B940_STORE_60_OFF = 0x60u,
  ISAAC_ROOM_TRANSITION_ENGINE_42B940_TYPE_14E = 0x14e,
  ISAAC_ROOM_TRANSITION_ENGINE_42B940_TYPE_81 = 0x81,
  ISAAC_ROOM_TRANSITION_ENGINE_42B940_TYPE_12D = 0x12d,
  ISAAC_ROOM_TRANSITION_ENGINE_42B940_TYPE_1AC = 0x1ac,
  ISAAC_ROOM_TRANSITION_ENGINE_42B940_VALUE_10 = 10,
  ISAAC_ROOM_TRANSITION_ENGINE_42B940_VALUE_2 = 2,
  ISAAC_ROOM_TRANSITION_ENGINE_42B940_VALUE_4 = 4,
  ISAAC_ROOM_TRANSITION_ENGINE_42B940_NO_STORE = (-1)
};

int32_t isaac_room_transition_engine_42b940_store_5c(uint32_t type);
int32_t isaac_room_transition_engine_42b940_store_58(uint32_t type);
int32_t isaac_room_transition_engine_42b940_store_60(uint32_t type);

/* =====================================================================
 * v31 — 0x0042c6e0: linked-list pop-head (15 B, FULLY PURE: 0 E8 / 0
 * indirect / 0 SEH). thiscall ecx=this, ONE stack arg (out ptr at
 * [ebp+8]), ret 8 (TWO stack slots; second arg unused). Machine:
 *   old = [this+0]; *out = old; [this+0] = [old]
 * Classic pop-head with NO null check — caller must guard. The store
 * SITES stay host (*out and [this+0]); retired VALUES decided by the
 * two identity laws below. 1 direct E8 caller 0x005bab91 (pop loop in
 * the 0x5babxx game-update band).
 */
enum {
  ISAAC_ROOM_TRANSITION_ENGINE_42C6E0_VA = 0x0042c6e0u,
  ISAAC_ROOM_TRANSITION_ENGINE_42C6E0_VA_RET = 0x0042c6efu,
  ISAAC_ROOM_TRANSITION_ENGINE_42C6E0_BODY_BYTES = 15u,
  ISAAC_ROOM_TRANSITION_ENGINE_42C6E0_CALLSITE_COUNT = 1,
  ISAAC_ROOM_TRANSITION_ENGINE_42C6E0_CALLER0 = 0x005bab91u,
  ISAAC_ROOM_TRANSITION_ENGINE_42C6E0_HEAD_OFF = 0x0u,
  ISAAC_ROOM_TRANSITION_ENGINE_42C6E0_NEXT_FUNC = 0x0042c160u
};

uint32_t isaac_room_transition_engine_42c6e0_popped(uint32_t old_head);
uint32_t isaac_room_transition_engine_42c6e0_advanced(uint32_t next);

/* =====================================================================
 * v32 — POST: two verify-open one-liners after the v31 pop-head body
 * (both FULLY PURE; identify-zhl address-stable; zero claims).
 *   V32-A 0x0042c700..0x0042c705 (6 bytes): mov eax,[ecx] / add eax,8
 *     / ret — thiscall value+8 getter (u32 wrap). 5 direct E8 callers.
 *   V32-B 0x0042c710..0x0042c71e (17 bytes): thiscall + one stack arg;
 *     setne — returns 1 iff [this+0] != [*arg0]. 25 direct E8 callers.
 * ZERO byte gates (setne is equality, signedness-free).
 */
enum {
  ISAAC_ROOM_TRANSITION_ENGINE_42C700_VA = 0x0042c700u,
  ISAAC_ROOM_TRANSITION_ENGINE_42C700_VA_RET = 0x0042c705u,
  ISAAC_ROOM_TRANSITION_ENGINE_42C700_BODY_BYTES = 6u,
  ISAAC_ROOM_TRANSITION_ENGINE_42C700_CALLSITE_COUNT = 5,
  ISAAC_ROOM_TRANSITION_ENGINE_42C700_E8_COUNT = 0,
  ISAAC_ROOM_TRANSITION_ENGINE_42C700_ADD_IMM = 8u,
  ISAAC_ROOM_TRANSITION_ENGINE_42C710_VA = 0x0042c710u,
  ISAAC_ROOM_TRANSITION_ENGINE_42C710_BODY_BYTES = 17u,
  ISAAC_ROOM_TRANSITION_ENGINE_42C710_CALLSITE_COUNT = 25,
  ISAAC_ROOM_TRANSITION_ENGINE_42C710_NEXT_FUNC = 0x0042c730u
};

uint32_t isaac_room_transition_engine_42c700_value_plus8(const uint8_t* mem, uint32_t this_off);
int32_t isaac_room_transition_engine_42c710_ne_check(const uint8_t* mem, uint32_t this_off, uint32_t other_off);

/* =====================================================================
 * v33 — 0x0042c7f0: element count getter (27 B, FULLY PURE: 0 E8 / 0
 * indirect / 0 SEH). thiscall ecx=this, plain ret, ZERO params.
 * Machine: range = [this+4] - [this+0] (u32 sub); div-magic
 * 0x92492493 imul + sar 4 + shr 31 fixup = SIGNED division by 12
 * (element stride 12 bytes). Returns element count in eax.
 * The ONLY compare is the implicit sign-fixup (shr 31); no explicit
 * branch exists. ZERO byte gates; zero uint8_t params.
 * 6 direct E8 callers {0x5b9022, 0x5b9088, 0x5be573, 0x762180, ...}.
 */
enum {
  ISAAC_ROOM_TRANSITION_ENGINE_42C7F0_VA = 0x0042c7f0u,
  ISAAC_ROOM_TRANSITION_ENGINE_42C7F0_VA_RET = 0x0042c80au,
  ISAAC_ROOM_TRANSITION_ENGINE_42C7F0_BODY_BYTES = 27u,
  ISAAC_ROOM_TRANSITION_ENGINE_42C7F0_CALLSITE_COUNT = 6,
  ISAAC_ROOM_TRANSITION_ENGINE_42C7F0_BEGIN_OFF = 0x0u,
  ISAAC_ROOM_TRANSITION_ENGINE_42C7F0_END_OFF = 0x4u,
  ISAAC_ROOM_TRANSITION_ENGINE_42C7F0_DIV_MAGIC = 0x92492493u,
  ISAAC_ROOM_TRANSITION_ENGINE_42C7F0_ELEM_STRIDE = 12u
};

int32_t isaac_room_transition_engine_42c7f0_elem_count(int32_t span_bytes);

/* =====================================================================
 * v34 — 0x0042c810: element address getter (10 B, FULLY PURE: 0 E8 /
 * 0 indirect / 0 SEH). thiscall ecx=this, ONE stack arg (index), ret 4.
 * Machine: base = [ecx+0] (u32 LE load); result = base + index*4
 * (u32-wrapping lea add). Returns the computed address in eax.
 * ZERO byte gates; ZERO compares; zero uint8_t params.
 * 53 direct E8 callers.
 */
enum {
  ISAAC_ROOM_TRANSITION_ENGINE_42C810_VA = 0x0042c810u,
  ISAAC_ROOM_TRANSITION_ENGINE_42C810_BODY_BYTES = 10u,
  ISAAC_ROOM_TRANSITION_ENGINE_42C810_CALLSITE_COUNT = 53,
  ISAAC_ROOM_TRANSITION_ENGINE_42C810_BASE_OFF = 0x0u,
  ISAAC_ROOM_TRANSITION_ENGINE_42C810_ELEM_SCALE = 4u,
  ISAAC_ROOM_TRANSITION_ENGINE_42C810_NEXT_FUNC = 0x0042c820u
};

uint32_t isaac_room_transition_engine_42c810_elem_addr(uint32_t this_base, uint32_t index);

/* =====================================================================
 * v35 — 0x0042d040: conditional field getter (17 B, FULLY PURE: 0 E8 /
 * 0 indirect / 0 SEH). thiscall ecx=this, plain ret, ZERO params.
 * Machine: eax = [this+0x13dc]; if != 0 -> return it;
 * else return [this+0x13e0]. Conditional fallback getter.
 * 9 direct E8 callers {0x765498, 0x765b38, 0x77f37c, 0x77f390, ...}.
 */
enum {
  ISAAC_ROOM_TRANSITION_ENGINE_42D040_VA = 0x0042d040u,
  ISAAC_ROOM_TRANSITION_ENGINE_42D040_BODY_BYTES = 17u,
  ISAAC_ROOM_TRANSITION_ENGINE_42D040_CALLSITE_COUNT = 9,
  ISAAC_ROOM_TRANSITION_ENGINE_42D040_PRIMARY_OFF = 0x13dcu,
  ISAAC_ROOM_TRANSITION_ENGINE_42D040_FALLBACK_OFF = 0x13e0u,
  ISAAC_ROOM_TRANSITION_ENGINE_42D040_NEXT_FUNC = 0x0042d060u
};

uint32_t isaac_room_transition_engine_42d040_conditional_getter(
    uint32_t field_13dc, uint32_t field_13e0);

#ifdef __cplusplus
}
#endif
