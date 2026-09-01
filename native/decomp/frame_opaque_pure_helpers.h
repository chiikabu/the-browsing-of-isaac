#pragma once

#include <stdint.h>
#include <stddef.h>

/*
 * Freestanding helpers for the frame-opaque family. Do not bump ABI until
 * header+model+cpp+tests lockstep.
 *
 * 0x00409030 AnimationState::AdvancePosition (0x0040904f). Host
 * isaac_anm2_update_needs_host stays on the rewind/advance path.
 * 0x0040add0 / 0x0040ae05 / 0x0040ae12. DAT_00b1c00c.
 * NetplayManager::IsIdxLocalPlayer. 0x00864d16. lua_rawgeti. signature collision. lua_tolstring. statically unreachable. raw allocator is a platform guest allocator — platform primitive.
 *
 * NO `_Xlength_error` guard here. NO geometric term.
 * lua_pushboolean. ABI v25 translates that zero-init sibling.
 * NEVER read in this body. SINGLE NUL BYTE.
 * deliberately uint32_t with an explicit in-body mask.
 * ABI v26 translates the release side of the string family.
 * byte-for-byte the ABI v24 default-init law.
 * ABI v27 closes the family side of the F4 handoff.
 * F4 FROZEN CAPTURE CONTRACT. PASS A FROZEN CAPTURE CONTRACT.
 *
 * ALWAYS the two together; a grow moves BOTH pointers.
 * SIGNED magic-number division. NOT an unsigned delta / 0x68.
 * ONLY on the path where the Pass A host residual ran.
 * COPIED FROM UNINITIALIZED STACK.
 * CompletionWidget::Update 7-byte match REJECTED.
 * UNWIRED since Update ABI v53; never wire this conservative form again.
 *
 * READ-ONLY leaf. PURE leaf. writes NEITHER out-param.
 * POINTER equality, NOT count==0. POINTER equality selects the arm.
 * stale channels THREAD across iterations.
 * 18th row of each block is NEVER compared.
 * UNINITIALIZED STACK before the first found lookup.
 * NO host call remains in the Pass B interior.
 *
 * ABI v31 wires mode/float islands into both Update call sites.
 * ABI v32 peels 0x00421343..0x004213ab (manager stores + volume ucomiss
 * gate). SoundEffects::ClearVolumeModifier at 0x0092e430 stays host.
 * Later calls stay host (0x006fd7c0 / 0x008318a0). Next VA 0x004213ab.
 * ABI v33 lands FUN_00421400 (0x00421400..0x004214a0, caller 0x006fc3ce:
 * Game subobject +0x1d2ec): full-dword mode probe cmp [ecx],0; divss pair
 * from BSS numerators (0xc78dc4/0xc78edc) over rdata 480.0f (0xbaab74) and
 * 270.0f (0xbaaaf4) into [ecx+0xa4]/[ecx+0xa8]; byte [0xc33910] toggled
 * 0/1 around the pair; LOW-BYTE flag [ecx+0x111] gates the pair, LOW-BYTE
 * [ecx+0x78] picks the order. Host AnimationState::Render (0x40a030,
 * ret 0xc) stays host with the overlay-clamp Vector& 0xc7b640 (render-shell
 * owns the 40a030 pure CF). Next VA 0x004214a0; next function 0x004214c0.
 * ABI v24 wires this into resume_room_update_head.
 * ABI v27 wires into gate_1d520.
 * ABI v29 is two units.
 * LOW-BYTE ZERO TEST. push 0x417800. 0x0086a2fc.
 *
 * NO q != p condition. law to ITS OWN argument.
 * deliberately WEAKER than the counted predicate.
 * bound is FOLDED, unlike the Pass B recount.
 * bound RE-DERIVED from live [ctr]/[ctr+4] EVERY iteration.
 * two bound disciplines in one body.
 * 5 + 2*count logs. READ-ONLY LEAVES. decrement loop.
 * the element index, not the counted ordinal.
 * no untranslated game logic remains inside 0x004257b0.
 */

#ifdef __cplusplus
extern "C" {
#endif

enum {
  ISAAC_FRAME_OPAQUE_PURE_HELPERS_ABI_VERSION = 64,
  ISAAC_FRAME_OPAQUE_PURE_ABI_VERSION = 64,
  ISAAC_FRAME_OPAQUE_874910_PUSH_USERDATA = 3,
  ISAAC_FRAME_OPAQUE_874910_PUSH_NIL = 4,
  ISAAC_FRAME_OPAQUE_LIST6772C_NODE_MAX = 32
};

enum {
  ISAAC_FRAME_OPAQUE_409030_PATH_ADVANCE_MID = 0,
  ISAAC_FRAME_OPAQUE_409030_PATH_REWIND = 1,
  ISAAC_FRAME_OPAQUE_409030_PATH_NO_LOOP = 2,
  ISAAC_FRAME_OPAQUE_956110_PATH_ID_NEG1_WALK = 0,
  ISAAC_FRAME_OPAQUE_956110_PATH_GENERAL = 1,
  ISAAC_FRAME_OPAQUE_HOST_ADVANCE_POSITION_VA = 0x00408d00,
  ISAAC_FRAME_OPAQUE_HOST_REWIND_VA = 0x0040a1b0,
  ISAAC_FRAME_OPAQUE_HOST_FLOOR_VA = 0x00af0917,
  ISAAC_FRAME_OPAQUE_HOST_408C90_VA = 0x00408c90,
  ISAAC_FRAME_OPAQUE_HOST_408B90_VA = 0x00408b90,
  ISAAC_FRAME_OPAQUE_HOST_408C10_VA = 0x00408c10,
  ISAAC_FRAME_OPAQUE_HOST_ASSERT_LOG_VA = 0x00a112c0,
  ISAAC_FRAME_OPAQUE_HOST_98DBA0_VA = 0x0098dba0,
  ISAAC_FRAME_OPAQUE_HOST_956110_VA = 0x00956110,
  ISAAC_FRAME_OPAQUE_HOST_90B100_VA = 0x0090b100,
  ISAAC_FRAME_OPAQUE_HOST_A20390_VA = 0x00a20390,
  ISAAC_FRAME_OPAQUE_HOST_746560_VA = 0x00746560,
  ISAAC_FRAME_OPAQUE_HOST_864C30_VA = 0x00864c30,
  ISAAC_FRAME_OPAQUE_HOST_A20940_VA = 0x00a20940,
  ISAAC_FRAME_OPAQUE_HOST_874910_VA = 0x00874910,
  ISAAC_FRAME_OPAQUE_HOST_6A80F0_VA = 0x006a80f0,
  ISAAC_FRAME_OPAQUE_864C30_CAPABILITY_BIT = 0x2000,
  ISAAC_FRAME_OPAQUE_864C30_PACK_KIND_IMM = 0xd,
  ISAAC_FRAME_OPAQUE_864C30_NET_FIELD10_OFF = 0x10,
  ISAAC_FRAME_OPAQUE_864C30_LUA_REGISTRYINDEX = 0xfff0b9d8,
  ISAAC_FRAME_OPAQUE_HOST_693180_VA = 0x00693180,
  ISAAC_FRAME_OPAQUE_HOST_85BFF0_VA = 0x0085bff0,
  ISAAC_FRAME_OPAQUE_HOST_85C080_VA = 0x0085c080,
  ISAAC_FRAME_OPAQUE_HOST_8727D0_VA = 0x008727d0,
  ISAAC_FRAME_OPAQUE_864C30_NET_GLOBAL_VA = 0x00c71678,
  ISAAC_FRAME_OPAQUE_864C30_SEH_VTBL_NAME_OFF = 4,
  ISAAC_FRAME_OPAQUE_864C30_SEH_SIDE_RECEIVER_OFF = 0x68d78,
  ISAAC_FRAME_OPAQUE_874910_USERDATA_SIZE = 8,
  ISAAC_FRAME_OPAQUE_874910_USERDATA_TAG = 0x00b753c8,
  ISAAC_FRAME_OPAQUE_874910_METATABLE_KEY = 0x00c8297a,
  ISAAC_FRAME_OPAQUE_874910_PCALL_NARGS = 5,
  ISAAC_FRAME_OPAQUE_874910_PCALL_NRESULTS = 1,
  ISAAC_FRAME_OPAQUE_874910_PUSH_SEQUENCE_LEN = 6,
  ISAAC_FRAME_OPAQUE_HOST_40CCD0_VA = 0x0040ccd0,
  ISAAC_FRAME_OPAQUE_HOST_40CF00_VA = 0x0040cf00,
  ISAAC_FRAME_OPAQUE_HOST_AF08BD_VA = 0x00af08bd,
  ISAAC_FRAME_OPAQUE_85C080_RECORD_SIZE = 0x28,
  ISAAC_FRAME_OPAQUE_85C080_VTABLE = 0x00b753d0,
  ISAAC_FRAME_OPAQUE_85C080_STATE_OFF = 0xc,
  ISAAC_FRAME_OPAQUE_85C080_STRING_OFF = 0x10,
  ISAAC_FRAME_OPAQUE_85C080_STRING_SIZE_OFF = 0x20,
  ISAAC_FRAME_OPAQUE_85C080_STRING_CAP_OFF = 0x24,
  ISAAC_FRAME_OPAQUE_85C080_SSO_CAPACITY = 0xf,
  ISAAC_FRAME_OPAQUE_85C080_SSO_BUF_BYTES = 0x10,
  ISAAC_FRAME_OPAQUE_85C080_FALLBACK_STR_VA = 0x00b1a4ec,
  ISAAC_FRAME_OPAQUE_85C080_LITERAL_VA = 0x00b6e96c,
  ISAAC_FRAME_OPAQUE_85C080_LITERAL_LEN = 0xd,
  ISAAC_FRAME_OPAQUE_85C080_MAX_CAPACITY = 0x7fffffff,
  ISAAC_FRAME_OPAQUE_HOST_A0F4C0_VA = 0x00a0f4c0,
  ISAAC_FRAME_OPAQUE_HOST_AEF15C_VA = 0x00aef15c,
  ISAAC_FRAME_OPAQUE_HOST_AF05DF_VA = 0x00af05df,
  ISAAC_FRAME_OPAQUE_HOST_40CCC0_VA = 0x0040ccc0,
  ISAAC_FRAME_OPAQUE_HOST_40CEE0_VA = 0x0040cee0,
  ISAAC_FRAME_OPAQUE_HOST_ALLOC_WRAPPER_VA = 0x0040cf00,
  ISAAC_FRAME_OPAQUE_STRING_SIZE_OFF = 0x10,
  ISAAC_FRAME_OPAQUE_STRING_CAP_OFF = 0x14,
  ISAAC_FRAME_OPAQUE_STRING_SSO_BYTES = 0x10,
  ISAAC_FRAME_OPAQUE_STRING_MAX_SIZE = 0x7fffffff,
  ISAAC_FRAME_OPAQUE_ALLOC_ALIGN_THRESHOLD = 0x1000,
  ISAAC_FRAME_OPAQUE_ALLOC_HEADER_BIAS = 0x23,
  ISAAC_FRAME_OPAQUE_ALLOC_ALIGN_MASK = 0xffffffe0,
  ISAAC_FRAME_OPAQUE_ALLOC_DELTA_MAX = 0x1f,
  ISAAC_FRAME_OPAQUE_874A10_VA = 0x00874a10u,
  ISAAC_FRAME_OPAQUE_874A10_END_VA = 0x00874ab4u,
  ISAAC_FRAME_OPAQUE_874A10_RET_BYTES = 0xc,
  ISAAC_FRAME_OPAQUE_874A10_CALL_SITES = 3,
  ISAAC_FRAME_OPAQUE_874A10_PCALL_NARGS = 3,
  ISAAC_FRAME_OPAQUE_874A10_PUSH_SEQUENCE_LEN = 4,
  ISAAC_FRAME_OPAQUE_874A10_BYTE_ARG_MASK = 0xff,
  ISAAC_FRAME_OPAQUE_874A10_PUSH_BOOL_BYTE = 7,
  ISAAC_FRAME_OPAQUE_HOST_PUSHBOOLEAN_IAT_VA = 0x00b183ecu,
  ISAAC_FRAME_OPAQUE_40CFE0_VA = 0x0040cfe0u,
  ISAAC_FRAME_OPAQUE_40CFE0_END_VA = 0x0040cff1u,
  ISAAC_FRAME_OPAQUE_40CFE0_RET_BYTES = 0,
  ISAAC_FRAME_OPAQUE_40CFE0_CALL_SITES = 1,
  ISAAC_FRAME_OPAQUE_40CFE0_DEFAULT_CAPACITY = 0xf,
  ISAAC_FRAME_OPAQUE_40CCA0_VA = 0x0040cca0u,
  ISAAC_FRAME_OPAQUE_40CCA0_END_VA = 0x0040ccb6u,
  ISAAC_FRAME_OPAQUE_40CCA0_RET_BYTES = 4,
  ISAAC_FRAME_OPAQUE_40CCA0_CALL_SITES = 1,
  ISAAC_FRAME_OPAQUE_40CCA0_ZERO_CAPACITY = 0,
  ISAAC_FRAME_OPAQUE_40D000_VA = 0x0040d000u,
  ISAAC_FRAME_OPAQUE_40D000_END_VA = 0x0040d02eu,
  ISAAC_FRAME_OPAQUE_40D000_RET_BYTES = 8,
  ISAAC_FRAME_OPAQUE_40D000_CALL_SITES = 2,
  ISAAC_FRAME_OPAQUE_40D040_VA = 0x0040d040u,
  ISAAC_FRAME_OPAQUE_40D040_END_VA = 0x0040d084u,
  ISAAC_FRAME_OPAQUE_40D040_RET_BYTES = 0,
  ISAAC_FRAME_OPAQUE_40D040_CALL_SITES = 1321,
  ISAAC_FRAME_OPAQUE_40D040_RESET_CAPACITY = 0xf,
  ISAAC_FRAME_OPAQUE_HOST_INVALID_PARAM_VA = 0x00b18894u,
  ISAAC_FRAME_OPAQUE_40CF50_VA = 0x0040cf50u,
  ISAAC_FRAME_OPAQUE_40CF50_END_VA = 0x0040cfd3u,
  ISAAC_FRAME_OPAQUE_40CF50_RET_BYTES = 4,
  ISAAC_FRAME_OPAQUE_40CF50_CALL_SITES = 370,
  ISAAC_FRAME_OPAQUE_40CF50_SSO_LIMIT = 0x10,
  ISAAC_FRAME_OPAQUE_40CF50_SSO_CAPACITY = 0xf,
  ISAAC_FRAME_OPAQUE_40CF50_SSO_COPY_BYTES = 0x10,
  ISAAC_FRAME_OPAQUE_40CF50_ROUND_MASK = 0xf,
  ISAAC_FRAME_OPAQUE_40CF50_CAPACITY_MAX = 0x7fffffffu,
  ISAAC_FRAME_OPAQUE_85C080_PATH_FROM_LUA_STACK = 0,
  ISAAC_FRAME_OPAQUE_85C080_PATH_MISSING_ERROR = 1,
  ISAAC_FRAME_OPAQUE_874910_PUSH_CALLBACK_REF = 0,
  ISAAC_FRAME_OPAQUE_874910_PUSH_INT_PACK4 = 1,
  ISAAC_FRAME_OPAQUE_874910_PUSH_INT_PACK8 = 2,
  ISAAC_FRAME_OPAQUE_874910_PUSH_INT_SUB = 5,
  ISAAC_FRAME_OPAQUE_874910_PUSH_INT_KIND = 6,
  ISAAC_FRAME_OPAQUE_956110_WALK_VTBL_OFF = 0x30,
  ISAAC_FRAME_OPAQUE_956110_GENERAL_VTBL_OFF = 0x74,
  ISAAC_FRAME_OPAQUE_956110_MANAGER_MODE_OFF = 8,
  ISAAC_FRAME_OPAQUE_PLAYER_ID_OFF = 0x1618,
  ISAAC_FRAME_OPAQUE_MP_ENTRY_ID_OFF = 0xc,
  ISAAC_FRAME_OPAQUE_MP_VTBL_HOLDER_OFF = 0x370,
  ISAAC_FRAME_OPAQUE_MP_VTBL_SLOT_OFF = 0x14,
  ISAAC_FRAME_OPAQUE_RTTI_FIELD_378_OFF = 0x378,
  ISAAC_FRAME_OPAQUE_ANIMSTATE_ANIM_OFF = 4,
  ISAAC_FRAME_OPAQUE_ANIMSTATE_FRAME_OFF = 0x10,
  ISAAC_FRAME_OPAQUE_ANIMSTATE_MASK18_OFF = 0x18,
  ISAAC_FRAME_OPAQUE_ANIMSTATE_MASK1C_OFF = 0x1c,
  ISAAC_FRAME_OPAQUE_ANIMDATA_EVENT_BASE_OFF = 0x28,
  ISAAC_FRAME_OPAQUE_ANIMDATA_EVENT_COUNT_OFF = 0x2c,
  ISAAC_FRAME_OPAQUE_ANIM_EVENT_STRIDE = 8,
  ISAAC_FRAME_OPAQUE_ANIM_EVENT_BIT_OFF = 0,
  ISAAC_FRAME_OPAQUE_ANIM_EVENT_FRAME_OFF = 4,
  ISAAC_FRAME_OPAQUE_ANIMSTATE_LAYER_POS_OFF = 8,
  ISAAC_FRAME_OPAQUE_ANIMDATA_LAYER_BASE_OFF = 0x18,
  ISAAC_FRAME_OPAQUE_ANIMDATA_LAYER_COUNT_OFF = 0x1c,
  ISAAC_FRAME_OPAQUE_LAYER_DESC_STRIDE = 0x10,
  ISAAC_FRAME_OPAQUE_LAYER_DESC_FRAME_TABLE_OFF = 4,
  ISAAC_FRAME_OPAQUE_LAYER_DESC_FRAME_COUNT_OFF = 8,
  ISAAC_FRAME_OPAQUE_LAYER_ENTRY_STRIDE = 0x6c,
  ISAAC_FRAME_OPAQUE_LAYER_ENTRY_FRAME_OFF = 0x68,
  ISAAC_FRAME_OPAQUE_ANIMSTATE_NULL_POS_OFF = 0xc,
  ISAAC_FRAME_OPAQUE_ANIMDATA_NULL_BASE_OFF = 0x20,
  ISAAC_FRAME_OPAQUE_ANIMDATA_NULL_COUNT_OFF = 0x24,
  ISAAC_FRAME_OPAQUE_NULL_DESC_STRIDE = 0x10,
  ISAAC_FRAME_OPAQUE_NULL_DESC_FRAME_TABLE_OFF = 8,
  ISAAC_FRAME_OPAQUE_NULL_DESC_FRAME_COUNT_OFF = 0xc,
  ISAAC_FRAME_OPAQUE_NULL_ENTRY_STRIDE = 0x54,
  ISAAC_FRAME_OPAQUE_NULL_ENTRY_FRAME_OFF = 0x50,
  ISAAC_FRAME_OPAQUE_40ADD0_ENTRY_STRIDE = 0x18,
  ISAAC_FRAME_OPAQUE_40ADD0_SSO_CAPACITY = 0x10,
  ISAAC_FRAME_OPAQUE_421B50_VA = 0x00421b50,
  ISAAC_FRAME_OPAQUE_421B50_END_VA = 0x00421be1,
  ISAAC_FRAME_OPAQUE_421B50_CALL_SITES = 1,
  ISAAC_FRAME_OPAQUE_421B50_COUNT_OFF = 0x8b8,
  ISAAC_FRAME_OPAQUE_421B50_BITMAP_A_OFF = 0x8ac,
  ISAAC_FRAME_OPAQUE_421B50_BITMAP_B_OFF = 0x8bc,
  ISAAC_FRAME_OPAQUE_4257B0_VA = 0x004257b0u,
  ISAAC_FRAME_OPAQUE_4257B0_END_VA = 0x004259a8u,
  ISAAC_FRAME_OPAQUE_4257B0_CALL_SITES = 1,
  ISAAC_FRAME_OPAQUE_4257B0_ID_VEC_OFF = 0x1baa8,
  ISAAC_FRAME_OPAQUE_4257B0_ID_SKIP_VA = 0x00425812u,
  ISAAC_FRAME_OPAQUE_4257B0_DUP_SKIP_VA = 0x0042583eu,
  ISAAC_FRAME_OPAQUE_4257B0_GAME_SLOT_VA = 0x00c71678u,
  ISAAC_FRAME_OPAQUE_4257B0_CALLSITE_VA = 0x006fba5du,
  ISAAC_FRAME_OPAQUE_4257B0_LIST_RECEIVER_OFF = 0x1bbe0,
  ISAAC_FRAME_OPAQUE_4257B0_LIST_BEGIN_OFF = 0,
  ISAAC_FRAME_OPAQUE_4257B0_LIST_END_OFF = 4,
  ISAAC_FRAME_OPAQUE_4257B0_LIST_CAP_OFF = 8,
  ISAAC_FRAME_OPAQUE_4257B0_ELEM_STRIDE = 0x68,
  ISAAC_FRAME_OPAQUE_4257B0_DIV_MAGIC = 0x4ec4ec4f,
  ISAAC_FRAME_OPAQUE_4257B0_DIV_SHIFT = 5,
  ISAAC_FRAME_OPAQUE_4257B0_RECOUNT_VA = 0x00425870u,
  ISAAC_FRAME_OPAQUE_4257B0_RECOUNT_GATE_VA = 0x00425894u,
  ISAAC_FRAME_OPAQUE_4257B0_ELEM_TIMER_INIT = 1,
  ISAAC_FRAME_OPAQUE_4257B0_ELEM_ZERO_OFF = 0xc,
  ISAAC_FRAME_OPAQUE_4257B0_ELEM_ZERO_BYTES = 0x58,
  ISAAC_FRAME_OPAQUE_4257B0_ELEM_UNDEF_TAIL_OFF = 0x64,
  ISAAC_FRAME_OPAQUE_HOST_9B9480_VA = 0x009b9480u,
  ISAAC_FRAME_OPAQUE_HOST_9B9310_VA = 0x009b9310u,
  ISAAC_FRAME_OPAQUE_HOST_4264C0_VA = 0x004264c0u,
  ISAAC_FRAME_OPAQUE_HOST_4259B0_VA = 0x004259b0u,
  ISAAC_FRAME_OPAQUE_HOST_426640_VA = 0x00426640u,
  ISAAC_FRAME_OPAQUE_4257B0_PASS_B_VA = 0x0042589au,
  ISAAC_FRAME_OPAQUE_4257B0_PASS_B_LOOP_VA = 0x004258b0u,
  ISAAC_FRAME_OPAQUE_4257B0_PASS_B_END_VA = 0x0042599cu,
  ISAAC_FRAME_OPAQUE_4257B0_PASS_B_EXIT_VA = 0x004259a2u,
  ISAAC_FRAME_OPAQUE_MANAGER_SLOT_VA = 0x00c7169cu,
  ISAAC_FRAME_OPAQUE_MANAGER_MP_VEC_OFF = 0x4b3d8,
  ISAAC_FRAME_OPAQUE_90ABF0_VA = 0x0090abf0u,
  ISAAC_FRAME_OPAQUE_90ABF0_END_VA = 0x0090ac67u,
  ISAAC_FRAME_OPAQUE_90ABF0_RET_BYTES = 4,
  ISAAC_FRAME_OPAQUE_90ABF0_CALL_SITES = 24,
  ISAAC_FRAME_OPAQUE_90ABF0_SUB_OFF = 0x374,
  ISAAC_FRAME_OPAQUE_90ABF0_SUB_LO_OFF = 8,
  ISAAC_FRAME_OPAQUE_90ABF0_SUB_HI_OFF = 0xc,
  ISAAC_FRAME_OPAQUE_90ABF0_OBJ_ID_OFF = 0xc,
  ISAAC_FRAME_OPAQUE_949BC0_VA = 0x00949bc0u,
  ISAAC_FRAME_OPAQUE_949BC0_END_VA = 0x00949c1fu,
  ISAAC_FRAME_OPAQUE_949BC0_RET_BYTES = 0,
  ISAAC_FRAME_OPAQUE_949BC0_CALL_SITES = 4,
  ISAAC_FRAME_OPAQUE_949BC0_TABLE_VA = 0x00b2415cu,
  ISAAC_FRAME_OPAQUE_949BC0_TABLE_REF_VA = 0x00949bcdu,
  ISAAC_FRAME_OPAQUE_949BC0_ROW_STRIDE = 0x18,
  ISAAC_FRAME_OPAQUE_949BC0_BLOCK_STRIDE = 0x1b0,
  ISAAC_FRAME_OPAQUE_949BC0_ROW_LIMIT = 0x12,
  ISAAC_FRAME_OPAQUE_949BC0_ROWS_SCANNED = 0x11,
  ISAAC_FRAME_OPAQUE_949BC0_OUTER_LIMIT = 0x360,
  ISAAC_FRAME_OPAQUE_949BC0_BLOCKS = 2,
  ISAAC_FRAME_OPAQUE_4257B0_PLAYER_CHAR_OFF = 0x13c0,
  ISAAC_FRAME_OPAQUE_4257B0_ENTRY_VALUE_OFF = 8,
  ISAAC_FRAME_OPAQUE_4257B0_PASS_B_BOOST = 0x11,
  ISAAC_FRAME_OPAQUE_9B9480_VA = 0x009b9480u,
  ISAAC_FRAME_OPAQUE_9B9480_END_VA = 0x009b94d3u,
  ISAAC_FRAME_OPAQUE_9B9480_RET_BYTES = 0,
  ISAAC_FRAME_OPAQUE_9B9480_CALL_SITES = 30,
  ISAAC_FRAME_OPAQUE_9B9310_VA = 0x009b9310u,
  ISAAC_FRAME_OPAQUE_9B9310_END_VA = 0x009b937cu,
  ISAAC_FRAME_OPAQUE_9B9310_RET_BYTES = 4,
  ISAAC_FRAME_OPAQUE_9B9310_CALL_SITES = 26,
  ISAAC_FRAME_OPAQUE_417800_VA = 0x00417800u,
  ISAAC_FRAME_OPAQUE_417800_END_VA = 0x0041781fu,
  ISAAC_FRAME_OPAQUE_417800_RET_BYTES = 0,
  ISAAC_FRAME_OPAQUE_417800_CALL_SITES = 9,
  ISAAC_FRAME_OPAQUE_417800_IMM_SITES = 1,
  ISAAC_FRAME_OPAQUE_90AC70_VA = 0x0090ac70u,
  ISAAC_FRAME_OPAQUE_90AC70_END_VA = 0x0090ae70u,
  ISAAC_FRAME_OPAQUE_90AC70_RET_BYTES = 4,
  ISAAC_FRAME_OPAQUE_90AC70_CALL_SITES = 11,
  ISAAC_FRAME_OPAQUE_4264C0_END_VA = 0x00426559u,
  ISAAC_FRAME_OPAQUE_4264C0_RET_BYTES = 4,
  ISAAC_FRAME_OPAQUE_4264C0_CALL_SITES = 4,
  ISAAC_FRAME_OPAQUE_PLAYER_Q_OFF = 0x1e68,
  ISAAC_FRAME_OPAQUE_PLAYER_161C_OFF = 0x161c,
  ISAAC_FRAME_OPAQUE_90AC70_ELEM_ID_OFF = 0xc,
  ISAAC_FRAME_OPAQUE_90AC70_ELEM_SUB378_OFF = 0x378,
  ISAAC_FRAME_OPAQUE_90AC70_DEADBEEF = 0xdeadbeefu,
  ISAAC_FRAME_OPAQUE_90AC70_LOG_NULL_VA = 0x00b78f10u,
  ISAAC_FRAME_OPAQUE_90AC70_LOG_NOTFOUND_VA = 0x00b78eb8u,
  ISAAC_FRAME_OPAQUE_90AC70_LOG_DIVIDER_VA = 0x00b78e78u,
  ISAAC_FRAME_OPAQUE_90AC70_LOG_PLAYER_VA = 0x00b78e48u,
  ISAAC_FRAME_OPAQUE_90AC70_LOG_LIST_VA = 0x00b78e38u,
  ISAAC_FRAME_OPAQUE_90AC70_LOG_ENTRY_VA = 0x00b78e00u,
  ISAAC_FRAME_OPAQUE_90AC70_LOG_DEV_TYPE_VA = 0x00b78da8u,
  ISAAC_FRAME_OPAQUE_90AC70_LOG_NO_ASSOC_VA = 0x00b78dc8u,
  ISAAC_FRAME_OPAQUE_90AC70_LOG_END_DIVIDER_VA = 0x00b790e8u,
  ISAAC_FRAME_OPAQUE_90AC70_BURST_BASE_LOGS = 5,
  ISAAC_FRAME_OPAQUE_90AC70_BURST_PER_ELEM_LOGS = 2,
  ISAAC_FRAME_OPAQUE_4264C0_ARM_EMPTY = 0,
  ISAAC_FRAME_OPAQUE_4264C0_ARM_NOT_FOUND = 1,
  ISAAC_FRAME_OPAQUE_4264C0_ARM_SUB_NULL = 2,
  ISAAC_FRAME_OPAQUE_4264C0_ARM_SUB_PAIR = 3,
  ISAAC_FRAME_OPAQUE_LIST6772C_VA = 0x006fbb2f,
  ISAAC_FRAME_OPAQUE_LIST6772C_END_VA = 0x006fbba3,
  ISAAC_FRAME_OPAQUE_LIST6772C_COUNTDOWN_OFF = 0x0c,
  ISAAC_FRAME_OPAQUE_LIST6772C_NODE_SIZE = 0x40,
  ISAAC_FRAME_OPAQUE_4212C0_TRUE_PROBE_VA = 0x00421343u,
  ISAAC_FRAME_OPAQUE_4212C0_TRUE_PROBE_END_VA = 0x004213abu,
  ISAAC_FRAME_OPAQUE_HOST_92E430_VA = 0x0092e430u,
  ISAAC_FRAME_OPAQUE_HOST_6FD7C0_VA = 0x006fd7c0u,
  ISAAC_FRAME_OPAQUE_HOST_8318A0_VA = 0x008318a0u,
  ISAAC_FRAME_OPAQUE_4212C0_VOLUME_OBJ_OFF = 0x2a324,
  ISAAC_FRAME_OPAQUE_4212C0_VOLUME_OFF = 0x10,
  ISAAC_FRAME_OPAQUE_4212C0_ONE_BITS = 0x3f800000,
  ISAAC_FRAME_OPAQUE_4212C0_ONE_F32_VA = 0x00baa454u,
  ISAAC_FRAME_OPAQUE_4212C0_TIMER_IMM = 0x19,
  ISAAC_FRAME_OPAQUE_4212C0_MGR_F18_OFF = 0xf18,
  ISAAC_FRAME_OPAQUE_4212C0_MGR_FLAG14_OFF = 0x14,
  ISAAC_FRAME_OPAQUE_4212C0_MGR_EBC_OFF = 0xebc,
  ISAAC_FRAME_OPAQUE_4212C0_MGR_21618_OFF = 0x21618,
  ISAAC_FRAME_OPAQUE_4212C0_MGR_21620_OFF = 0x21620,
  ISAAC_FRAME_OPAQUE_4212C0_MGR_21624_OFF = 0x21624,
  ISAAC_FRAME_OPAQUE_4212C0_MGR_2161C_OFF = 0x2161c,
  ISAAC_FRAME_OPAQUE_4212C0_MGR_29FB8_OFF = 0x29fb8,
  /* ABI v33: FUN_00421400 pose-recompute + AnimState Render pair shell. */
  ISAAC_FRAME_OPAQUE_421400_VA = 0x00421400u,
  ISAAC_FRAME_OPAQUE_421400_END_VA = 0x004214a0u,
  ISAAC_FRAME_OPAQUE_421400_CALL_SITES = 1,
  ISAAC_FRAME_OPAQUE_421400_MODE_OFF = 0,
  ISAAC_FRAME_OPAQUE_421400_POS_A_OFF = 0xa4,
  ISAAC_FRAME_OPAQUE_421400_POS_B_OFF = 0xa8,
  ISAAC_FRAME_OPAQUE_421400_FLAG111_OFF = 0x111,
  ISAAC_FRAME_OPAQUE_421400_FLAG78_OFF = 0x78,
  ISAAC_FRAME_OPAQUE_421400_SUB_A_OFF = 0x38,
  ISAAC_FRAME_OPAQUE_421400_SUB_B_OFF = 0x58,
  ISAAC_FRAME_OPAQUE_421400_NUM_A_VA = 0x00c78dc4u,
  ISAAC_FRAME_OPAQUE_421400_NUM_B_VA = 0x00c78edcu,
  ISAAC_FRAME_OPAQUE_421400_DIV_A_VA = 0x00baab74u,
  ISAAC_FRAME_OPAQUE_421400_DIV_B_VA = 0x00baaaf4u,
  ISAAC_FRAME_OPAQUE_421400_DIV_A_BITS = 0x43f00000,
  ISAAC_FRAME_OPAQUE_421400_DIV_B_BITS = 0x43870000,
  ISAAC_FRAME_OPAQUE_HOST_40A030_VA = 0x0040a030u,
  ISAAC_FRAME_OPAQUE_421400_RENDER_ARG_VA = 0x00c7b640u,
  ISAAC_FRAME_OPAQUE_421400_GUARD_VA = 0x00c33910u
};




#pragma pack(push, 1)
typedef struct IsaacFrameOpaque4212c0TrueProbePlan {
  uint32_t mgr_f18;
  uint32_t mgr_flag14;
  uint32_t mgr_ebc;
  uint32_t mgr_21618;
  uint32_t mgr_21620;
  uint32_t mgr_21624;
  uint32_t mgr_2161c;
  uint32_t mgr_29fb8;
  uint32_t volume_bits;
  uint32_t host_92e430;
  uint32_t next_va;
  uint32_t pure_cf_ok;
} IsaacFrameOpaque4212c0TrueProbePlan;
#pragma pack(pop)
static_assert(sizeof(IsaacFrameOpaque4212c0TrueProbePlan) == 48, "IsaacFrameOpaque4212c0TrueProbePlan size");

#pragma pack(push, 1)
typedef struct IsaacFrameOpaque421400Plan {
  uint32_t mode_active;
  uint32_t pos_a_bits;
  uint32_t pos_b_bits;
  uint32_t render_needed;
  uint32_t render_first;
  uint32_t render_va;
  uint32_t render_arg_va;
  uint32_t guard_va;
  uint32_t next_va;
  uint32_t pure_cf_ok;
} IsaacFrameOpaque421400Plan;
#pragma pack(pop)
static_assert(sizeof(IsaacFrameOpaque421400Plan) == 40, "IsaacFrameOpaque421400Plan size");

#pragma pack(push, 1)
typedef struct IsaacFrameOpaque408b90Plan {
  uint32_t anim_present;
  uint32_t log_needed;
  uint32_t layer_in_range;
  uint32_t pos_walk_needed;
  uint32_t pure_complete_ok;
  uint32_t layer_index;
  uint32_t layer_count;
  uint32_t current_pos;
} IsaacFrameOpaque408b90Plan;
#pragma pack(pop)
static_assert(sizeof(IsaacFrameOpaque408b90Plan) == 32, "IsaacFrameOpaque408b90Plan size");


#pragma pack(push, 1)
typedef struct IsaacFrameOpaque408c10Plan {
  uint32_t anim_present;
  uint32_t log_needed;
  uint32_t null_in_range;
  uint32_t pos_walk_needed;
  uint32_t pure_complete_ok;
  uint32_t null_index;
  uint32_t null_count;
  uint32_t current_pos;
} IsaacFrameOpaque408c10Plan;
#pragma pack(pop)
static_assert(sizeof(IsaacFrameOpaque408c10Plan) == 32, "IsaacFrameOpaque408c10Plan size");


#pragma pack(push, 1)
typedef struct IsaacFrameOpaque408d00Plan {
  uint32_t trunc_cur;
  uint32_t floored_cur;
  uint32_t target_f;
  uint32_t host_assert;
  uint32_t clear_mask18;
  uint32_t advance_loop;
  uint32_t step_count;
  uint32_t host_408c90;
  uint32_t host_layer_loop;
  uint32_t host_null_loop;
  uint32_t final_frame;
  uint32_t pure_complete_ok;
} IsaacFrameOpaque408d00Plan;
#pragma pack(pop)
static_assert(sizeof(IsaacFrameOpaque408d00Plan) == 48, "IsaacFrameOpaque408d00Plan size");


#pragma pack(push, 1)
typedef struct IsaacFrameOpaque409030Plan {
  uint32_t path;
  uint32_t host_advance;
  uint32_t host_rewind;
  uint32_t advance_frame;
  uint32_t sum;
  uint32_t floored_sum;
  uint32_t trunc_sum;
  uint32_t store_float_10;
  uint32_t clear_flag_14;
} IsaacFrameOpaque409030Plan;
#pragma pack(pop)
static_assert(sizeof(IsaacFrameOpaque409030Plan) == 36, "IsaacFrameOpaque409030Plan size");


#pragma pack(push, 1)
typedef struct IsaacFrameOpaque40cca0Plan {
  uint32_t pure_cf_ok;
  uint32_t pure_complete;
  uint32_t zero_capacity;
} IsaacFrameOpaque40cca0Plan;
#pragma pack(pop)
static_assert(sizeof(IsaacFrameOpaque40cca0Plan) == 12, "IsaacFrameOpaque40cca0Plan size");


#pragma pack(push, 1)
typedef struct IsaacFrameOpaque40ccd0Plan {
  uint32_t in_place;
  uint32_t dst_is_heap;
  uint32_t length_error;
  uint32_t new_capacity;
  uint32_t alloc_bytes;
  uint32_t host_alloc;
  uint32_t host_copy;
  uint32_t host_free;
  uint32_t free_bytes;
  uint32_t store_capacity;
  uint32_t pure_cf_ok;
  uint32_t pure_complete;
} IsaacFrameOpaque40ccd0Plan;
#pragma pack(pop)
static_assert(sizeof(IsaacFrameOpaque40ccd0Plan) == 48, "IsaacFrameOpaque40ccd0Plan size");


#pragma pack(push, 1)
typedef struct IsaacFrameOpaque40cf50Plan {
  uint32_t src_is_heap;
  uint32_t sso;
  uint32_t new_capacity;
  uint32_t alloc_bytes;
  uint32_t copy_bytes;
  uint32_t host_alloc;
  uint32_t host_copy;
  uint32_t store_ptr_before_copy;
  uint32_t pure_cf_ok;
  uint32_t pure_complete;
} IsaacFrameOpaque40cf50Plan;
#pragma pack(pop)
static_assert(sizeof(IsaacFrameOpaque40cf50Plan) == 40, "IsaacFrameOpaque40cf50Plan size");


#pragma pack(push, 1)
typedef struct IsaacFrameOpaque40cfe0Plan {
  uint32_t pure_cf_ok;
  uint32_t pure_complete;
  uint32_t default_capacity;
} IsaacFrameOpaque40cfe0Plan;
#pragma pack(pop)
static_assert(sizeof(IsaacFrameOpaque40cfe0Plan) == 12, "IsaacFrameOpaque40cfe0Plan size");


#pragma pack(push, 1)
typedef struct IsaacFrameOpaque40d000Plan {
  uint32_t aligned;
  uint32_t invalid;
  uint32_t free_bytes;
  uint32_t free_ptr;
  uint32_t host_free;
  uint32_t host_invalid;
  uint32_t pure_cf_ok;
  uint32_t pure_complete;
} IsaacFrameOpaque40d000Plan;
#pragma pack(pop)
static_assert(sizeof(IsaacFrameOpaque40d000Plan) == 32, "IsaacFrameOpaque40d000Plan size");


#pragma pack(push, 1)
typedef struct IsaacFrameOpaque40d040Plan {
  uint32_t heap_used;
  uint32_t aligned;
  uint32_t invalid;
  uint32_t free_bytes;
  uint32_t free_ptr;
  uint32_t host_free;
  uint32_t host_invalid;
  uint32_t reset_size;
  uint32_t reset_capacity;
  uint32_t pure_complete;
  uint32_t pure_cf_ok;
} IsaacFrameOpaque40d040Plan;
#pragma pack(pop)
static_assert(sizeof(IsaacFrameOpaque40d040Plan) == 44, "IsaacFrameOpaque40d040Plan size");
#pragma pack(push, 1)
typedef struct IsaacFrameOpaque421b50Plan {
  uint32_t pure_cf_ok;
  uint32_t pure_complete;
  uint32_t words;
} IsaacFrameOpaque421b50Plan;
#pragma pack(pop)
static_assert(sizeof(IsaacFrameOpaque421b50Plan) == 12, "IsaacFrameOpaque421b50Plan size");


#pragma pack(push, 1)
typedef struct IsaacFrameOpaque4257b0PassBEntryPlan {
  uint32_t container_empty;
  uint32_t probe_90abf0;
  uint32_t have_id;
  uint32_t id;
  uint32_t player_match;
  uint32_t lookup_949bc0;
  uint32_t lookup_found;
  uint32_t store_entry8;
  uint32_t store_value;
  uint32_t boost;
  uint32_t final_value;
  uint32_t slot_out;
  uint32_t byte13_out;
} IsaacFrameOpaque4257b0PassBEntryPlan;
#pragma pack(pop)
static_assert(sizeof(IsaacFrameOpaque4257b0PassBEntryPlan) == 52, "IsaacFrameOpaque4257b0PassBEntryPlan size");


#pragma pack(push, 1)
typedef struct IsaacFrameOpaque4257b0PassBStorePlan {
  uint32_t store_value;
  uint32_t boost;
  uint32_t final_value;
  uint32_t slot_out;
  uint32_t byte13_out;
} IsaacFrameOpaque4257b0PassBStorePlan;
#pragma pack(pop)
static_assert(sizeof(IsaacFrameOpaque4257b0PassBStorePlan) == 20, "IsaacFrameOpaque4257b0PassBStorePlan size");


#pragma pack(push, 1)
typedef struct IsaacFrameOpaque4264c0Plan {
  uint32_t arm;
  uint32_t lo;
  uint32_t hi;
  uint32_t subject_ptr;
  uint32_t host_90ac70;
  uint32_t host_burst;
  uint32_t pure_cf_ok;
} IsaacFrameOpaque4264c0Plan;
#pragma pack(pop)
static_assert(sizeof(IsaacFrameOpaque4264c0Plan) == 28, "IsaacFrameOpaque4264c0Plan size");


#pragma pack(push, 1)
typedef struct IsaacFrameOpaque6a80f0Plan {
  uint32_t host_rawgeti;
  uint32_t arg_lo;
  uint32_t arg_hi;
  uint32_t registry_index;
  uint32_t pure_cf_ok;
  uint32_t pure_complete;
} IsaacFrameOpaque6a80f0Plan;
#pragma pack(pop)
static_assert(sizeof(IsaacFrameOpaque6a80f0Plan) == 24, "IsaacFrameOpaque6a80f0Plan size");


#pragma pack(push, 1)
typedef struct IsaacFrameOpaque85c080Plan {
  uint32_t path;
  uint32_t host_gettop;
  uint32_t host_tolstring;
  uint32_t host_assign;
  uint32_t tostring_null;
  uint32_t message_ptr;
  uint32_t literal_needs_grow;
  uint32_t host_alloc;
  uint32_t host_memcpy;
  uint32_t dst_is_heap;
  uint32_t grow_capacity;
  uint32_t entry_capacity_is_sso;
  uint32_t pure_cf_ok;
  uint32_t pure_complete;
} IsaacFrameOpaque85c080Plan;
#pragma pack(pop)
static_assert(sizeof(IsaacFrameOpaque85c080Plan) == 56, "IsaacFrameOpaque85c080Plan size");


#pragma pack(push, 1)
typedef struct IsaacFrameOpaque864c30Plan {
  uint32_t capability;
  uint32_t pure_early;
  uint32_t host_body;
  uint32_t host_874910;
  uint32_t host_6a80f0;
  uint32_t host_lua_iat;
  uint32_t host_seh_log;
  uint32_t pure_cf_ok;
} IsaacFrameOpaque864c30Plan;
#pragma pack(pop)
static_assert(sizeof(IsaacFrameOpaque864c30Plan) == 32, "IsaacFrameOpaque864c30Plan size");


#pragma pack(push, 1)
typedef struct IsaacFrameOpaque864c30SehPlan {
  uint32_t host_name_vcall;
  uint32_t host_assert_log;
  uint32_t side_log_needed;
  uint32_t host_side_vcall;
  uint32_t host_side_log;
  uint32_t side_receiver;
  uint32_t result_al;
  uint32_t pure_cf_ok;
} IsaacFrameOpaque864c30SehPlan;
#pragma pack(pop)
static_assert(sizeof(IsaacFrameOpaque864c30SehPlan) == 32, "IsaacFrameOpaque864c30SehPlan size");


#pragma pack(push, 1)
typedef struct IsaacFrameOpaque874910Plan {
  uint32_t object_present;
  uint32_t push_userdata;
  uint32_t push_nil;
  uint32_t host_rawgeti;
  uint32_t host_pushinteger;
  uint32_t host_newuserdata;
  uint32_t host_85bff0;
  uint32_t host_pcall;
  uint32_t pcall_failed;
  uint32_t host_throw;
  uint32_t host_lual_ref;
  uint32_t pure_cf_ok;
  uint32_t pure_complete;
} IsaacFrameOpaque874910Plan;
#pragma pack(pop)
static_assert(sizeof(IsaacFrameOpaque874910Plan) == 52, "IsaacFrameOpaque874910Plan size");


#pragma pack(push, 1)
typedef struct IsaacFrameOpaque874a10Plan {
  uint32_t host_rawgeti;
  uint32_t host_pushinteger;
  uint32_t host_pushboolean;
  uint32_t host_pcall;
  uint32_t pcall_failed;
  uint32_t host_throw;
  uint32_t host_lual_ref;
  uint32_t byte_arg;
  uint32_t pure_cf_ok;
  uint32_t pure_complete;
} IsaacFrameOpaque874a10Plan;
#pragma pack(pop)
static_assert(sizeof(IsaacFrameOpaque874a10Plan) == 40, "IsaacFrameOpaque874a10Plan size");


#pragma pack(push, 1)
typedef struct IsaacFrameOpaque90ac70Plan {
  uint32_t subject_null;
  uint32_t found;
  uint32_t elem_index;
  uint32_t host_null_log;
  uint32_t host_burst;
  uint32_t burst_log_count;
  uint32_t pure_cf_ok;
  uint32_t pure_complete;
} IsaacFrameOpaque90ac70Plan;
#pragma pack(pop)
static_assert(sizeof(IsaacFrameOpaque90ac70Plan) == 32, "IsaacFrameOpaque90ac70Plan size");


#pragma pack(push, 1)
typedef struct IsaacFrameOpaque949bc0Lookup {
  uint32_t found;
  uint32_t row;
  uint32_t block1;
} IsaacFrameOpaque949bc0Lookup;
#pragma pack(pop)
static_assert(sizeof(IsaacFrameOpaque949bc0Lookup) == 12, "IsaacFrameOpaque949bc0Lookup size");


#pragma pack(push, 1)
typedef struct IsaacFrameOpaque956110Plan {
  uint32_t net_gate;
  uint32_t path;
  uint32_t host_864c30;
  uint32_t host_vtable_walk;
  uint32_t host_general;
  uint32_t pure_cf_ok;
  uint32_t host_body;
} IsaacFrameOpaque956110Plan;
#pragma pack(pop)
static_assert(sizeof(IsaacFrameOpaque956110Plan) == 28, "IsaacFrameOpaque956110Plan size");


#pragma pack(push, 1)
typedef struct IsaacFrameOpaque98dba0State {
  uint32_t mode;
  uint32_t flag;
  uint32_t counter;
  uint32_t float_170;
  uint32_t float_2d0;
} IsaacFrameOpaque98dba0State;
#pragma pack(pop)
static_assert(sizeof(IsaacFrameOpaque98dba0State) == 20, "IsaacFrameOpaque98dba0State size");


#pragma pack(push, 1)
typedef struct IsaacFrameOpaque98dba0TimerState {
  uint32_t timer;
  uint32_t x;
  uint32_t y;
} IsaacFrameOpaque98dba0TimerState;
#pragma pack(pop)
static_assert(sizeof(IsaacFrameOpaque98dba0TimerState) == 12, "IsaacFrameOpaque98dba0TimerState size");


#pragma pack(push, 1)
typedef struct IsaacFrameOpaque98dba0WalkPlan {
  uint32_t empty_fatal;
  uint32_t walk_needed;
  uint32_t pure_cf_ok;
  uint32_t host_body;
  uint32_t player_count;
} IsaacFrameOpaque98dba0WalkPlan;
#pragma pack(pop)
static_assert(sizeof(IsaacFrameOpaque98dba0WalkPlan) == 20, "IsaacFrameOpaque98dba0WalkPlan size");


#pragma pack(push, 1)
typedef struct IsaacFrameOpaqueAllocPlan {
  uint32_t aligned;
  uint32_t overflow;
  uint32_t raw_bytes;
  uint32_t returns_null;
  uint32_t host_alloc;
  uint32_t host_oom_abort;
  uint32_t pure_cf_ok;
  uint32_t pure_complete;
} IsaacFrameOpaqueAllocPlan;
#pragma pack(pop)
static_assert(sizeof(IsaacFrameOpaqueAllocPlan) == 32, "IsaacFrameOpaqueAllocPlan size");


/* Prototypes recovered from the family cpp. */
int32_t isaac_frame_opaque_4212c0_try_pure(int32_t* mode, int32_t* secondary, int32_t field_3c, uint32_t flag_4c, uint32_t slot_char, uint32_t flag_111);
int32_t isaac_frame_opaque_409030_needs_host(uint32_t field_4, int32_t flag_14);
int32_t isaac_frame_opaque_409030_pair_needs_host(uint32_t field4_a, int32_t flag14_a, uint32_t field4_b, int32_t flag14_b);
float isaac_frame_opaque_409030_sum(float float_10, float layer_104);
float isaac_frame_opaque_409030_floor_f32(float x);
int32_t isaac_frame_opaque_409030_trunc_f32(float x);
int32_t isaac_frame_opaque_409030_path(int32_t trunc_sum, int32_t frame_bound, int32_t loop_flag);
int32_t isaac_frame_opaque_409030_no_loop_target_frame(int32_t frame_bound);
int32_t isaac_frame_opaque_409030_no_loop_advance_needed(int32_t frame_bound, int32_t trunc_orig);
void isaac_frame_opaque_409030_apply_mid_store(float* float_10, float sum);
void isaac_frame_opaque_409030_apply_no_loop_clear(int32_t* flag_14);
void isaac_frame_opaque_409030_residual_plan(IsaacFrameOpaque409030Plan* out, float float_10, float layer_104, int32_t frame_bound, int32_t loop_flag);
float isaac_frame_opaque_408d00_target_f32(int32_t target_frame);
int32_t isaac_frame_opaque_408d00_assert_needed(int32_t target_frame, int32_t trunc_cur);
void isaac_frame_opaque_408d00_clear_mask18(uint32_t* mask18);
int32_t isaac_frame_opaque_408d00_advance_loop_needed(float target_f, float current);
float isaac_frame_opaque_408d00_step_frame(float current);
void isaac_frame_opaque_408d00_apply_step(float* frame);
int32_t isaac_frame_opaque_408d00_layer_loop_needed(uint32_t layer_count);
int32_t isaac_frame_opaque_408d00_null_loop_needed(uint32_t null_count);
void isaac_frame_opaque_408d00_residual_plan(IsaacFrameOpaque408d00Plan* out, float current_frame, int32_t target_frame, uint32_t layer_count, uint32_t null_count);
/* v109 dedupe: the 0x00408c90 law exports (anim_present / log_needed /
   event_loop_needed / event_frame_eq / mask_bts / event_step /
   apply_from_events / residual_plan) are OWNED by the Exit family
   (isaac_exit_animstate_408c90_*, ABI v18; the same split as the
   0x40c7f0 twin: Exit holds the law contract and frame-opaque pins the
   host VA). This family keeps ISAAC_FRAME_OPAQUE_HOST_408C90_VA + this
   comment; the suite pins the Exit export semantics BY REFERENCE.
   See section-notes/update-v109-dupva-dedupe/. */
int32_t isaac_frame_opaque_408b90_anim_present(uint32_t anim_ptr);
int32_t isaac_frame_opaque_408b90_layer_in_range(int32_t layer_index, int32_t layer_count);
int32_t isaac_frame_opaque_408b90_log_needed(uint32_t anim_ptr, int32_t layer_index, int32_t layer_count);
int32_t isaac_frame_opaque_408b90_pos_walk_needed(int32_t current_pos);
int32_t isaac_frame_opaque_408b90_entry_offset(int32_t pos);
uint32_t isaac_frame_opaque_408b90_layer_desc_offset(int32_t layer_index);
float isaac_frame_opaque_408b90_entry_frame_f32(int32_t entry_frame_i32);
int32_t isaac_frame_opaque_408b90_target_ge_entry(float target_f, float entry_f);
int32_t isaac_frame_opaque_408b90_step_can_advance(int32_t candidate, int32_t frame_count, float target_f, int32_t entry_frame_i32);
int32_t isaac_frame_opaque_408b90_apply_from_entry_frames(int32_t current_pos, int32_t frame_count, float target_f, const int32_t* entry_frames, uint32_t entry_frames_len);
void isaac_frame_opaque_408b90_residual_plan(IsaacFrameOpaque408b90Plan* out, uint32_t anim_ptr, int32_t layer_index, int32_t layer_count, int32_t current_pos);
int32_t isaac_frame_opaque_408c10_anim_present(uint32_t anim_ptr);
int32_t isaac_frame_opaque_408c10_null_in_range(int32_t null_index, int32_t null_count);
int32_t isaac_frame_opaque_408c10_log_needed(uint32_t anim_ptr, int32_t null_index, int32_t null_count);
int32_t isaac_frame_opaque_408c10_pos_walk_needed(int32_t current_pos);
int32_t isaac_frame_opaque_408c10_entry_offset(int32_t pos);
uint32_t isaac_frame_opaque_408c10_null_desc_offset(int32_t null_index);
float isaac_frame_opaque_408c10_entry_frame_f32(int32_t entry_frame_i32);
int32_t isaac_frame_opaque_408c10_target_ge_entry(float target_f, float entry_f);
int32_t isaac_frame_opaque_408c10_step_can_advance(int32_t candidate, int32_t frame_count, float target_f, int32_t entry_frame_i32);
int32_t isaac_frame_opaque_408c10_apply_from_entry_frames(int32_t current_pos, int32_t frame_count, float target_f, const int32_t* entry_frames, uint32_t entry_frames_len);
void isaac_frame_opaque_408c10_residual_plan(IsaacFrameOpaque408c10Plan* out, uint32_t anim_ptr, int32_t null_index, int32_t null_count, int32_t current_pos);
int32_t isaac_anm2_update_needs_host(int32_t flag_109);
int32_t isaac_frame_opaque_40add0_needs_host(uint32_t field_4, uint32_t list_count);
int32_t isaac_frame_opaque_40add0_bit_result(uint32_t bitfield_18, int32_t match_index);
uint32_t isaac_frame_opaque_40add0_entry_stride(void);
int32_t isaac_frame_opaque_40add0_sso_inline(uint32_t capacity_14);
uint32_t isaac_frame_opaque_40add0_entry_data_addr(uint32_t entry_addr, uint32_t capacity_14, uint32_t dword0);
int32_t isaac_frame_opaque_40add0_walk_in_range(uint32_t index, uint32_t list_count);
int32_t isaac_frame_opaque_40add0_walk_after_miss(uint32_t* index, uint32_t* entry_addr, uint32_t list_count);
int32_t isaac_frame_opaque_40add0_first_match_index(const uint8_t* equal_flags, uint32_t list_count);
int32_t isaac_frame_opaque_40add0_strcmp(const uint8_t* a, const uint8_t* b);
int32_t isaac_frame_opaque_40add0_strcmp_equal(const uint8_t* a, const uint8_t* b);
int32_t isaac_frame_opaque_40add0_probe_from_equal_flags(const uint8_t* equal_flags, uint32_t list_count, uint32_t bitfield_18);
int32_t isaac_frame_opaque_40add0_needs_host_with_flags(uint32_t field_4, uint32_t list_count, int32_t equal_flags_ready);
void isaac_frame_opaque_4212c0_secondary3_after_probe_false(int32_t* mode, int32_t* secondary, int32_t field_3c, uint32_t flag_4c);
int32_t isaac_frame_opaque_4257b0_needs_host(int32_t timed_transition_cleanup_mode);
int32_t isaac_frame_opaque_4257b0_pass_a_needs_host(uint32_t id_count);
int32_t isaac_frame_opaque_4257b0_pass_b_needs_host(uint32_t id_count, uint32_t list_count);
int32_t isaac_frame_opaque_4257b0_pass_b_needs_host_recaptured(uint32_t post_pass_a_list_count);
int32_t isaac_frame_opaque_4257b0_pass_a_id_considered(int32_t lo, int32_t hi);
uint32_t isaac_frame_opaque_4257b0_post_pass_a_count(uint32_t pre_list_count, uint32_t inserted);
uint32_t isaac_frame_opaque_4257b0_list_count_from_bounds(uint32_t begin_ptr, uint32_t end_ptr);
int32_t isaac_frame_opaque_4257b0_pass_a_scan_found(const uint8_t* list_base, uint32_t count, uint32_t lo, uint32_t hi);
int32_t isaac_frame_opaque_4257b0_pass_a_insert_decision(const uint8_t* list_base, uint32_t count, uint32_t lo, uint32_t hi);
uint32_t isaac_frame_opaque_4257b0_pass_a_apply_append(uint8_t* list_base, uint32_t count, uint32_t lo, uint32_t hi);
uint32_t isaac_frame_opaque_4257b0_pass_a_count_evolution(uint8_t* list_base, uint32_t initial_count, const uint32_t* id_pairs, uint32_t id_count);
int32_t isaac_frame_opaque_90abf0_pair_matches(uint32_t sub_ptr, uint32_t sub_lo, uint32_t sub_hi, uint32_t entry_lo, uint32_t entry_hi);
int32_t isaac_frame_opaque_90abf0_match_index(const uint32_t* sub_ptrs, const uint32_t* sub_lo, const uint32_t* sub_hi, uint32_t count, uint32_t entry_lo, uint32_t entry_hi);
uint32_t isaac_frame_opaque_949bc0_key_at(uint32_t block, uint32_t row);
void isaac_frame_opaque_949bc0_lookup(IsaacFrameOpaque949bc0Lookup* out, uint32_t char_id);
void isaac_frame_opaque_4257b0_pass_b_store_plan(IsaacFrameOpaque4257b0PassBStorePlan* out, int32_t lookup_found, uint32_t lookup_row, int32_t lookup_block1, uint32_t stale_slot_value, uint32_t stale_byte13);
void isaac_frame_opaque_4257b0_pass_b_entry_plan(IsaacFrameOpaque4257b0PassBEntryPlan* out, int32_t container_empty, int32_t obj_match_found, uint32_t obj_field_c, uint32_t entry_lo, int32_t player_match_index, uint32_t player_char_13c0, uint32_t stale_slot_value, uint32_t stale_byte13);
uint32_t isaac_frame_opaque_4257b0_pass_b_apply(uint8_t* list_base, uint32_t list_begin_va, uint32_t list_end_va, uint32_t ctr_begin, uint32_t ctr_end, const uint32_t* ctr_sub_ptrs, const uint32_t* ctr_sub_lo, const uint32_t* ctr_sub_hi, const uint32_t* ctr_field_c, uint32_t ctr_samples_len, uint32_t idvec_begin, uint32_t idvec_end, const int32_t* player_ids_1618, const uint32_t* player_chars_13c0, uint32_t player_samples_len, uint32_t pass_a_id_count, uint32_t initial_byte13);
int32_t isaac_menu_gate_update_needs_host(int32_t menu_state_23a74, int32_t gate_1b83c, int32_t predicate_1ba74);
int32_t isaac_frame_opaque_98dba0_bvar2_counter_step(int32_t* counter, int32_t bVar2);
int32_t isaac_frame_opaque_98dba0_mode_float_step(IsaacFrameOpaque98dba0State* state, int32_t bVar2, float manager_2a35c);
void isaac_frame_opaque_98dba0_clamp_floats(float* float_170, float* float_2d0);
int32_t isaac_frame_opaque_98dba0_timer_needs_host(int32_t timer_61c);
float isaac_frame_opaque_98dba0_timer_unit_float(uint32_t genrand);
int32_t isaac_frame_opaque_98dba0_timer_step(IsaacFrameOpaque98dba0TimerState* state, uint32_t genrand);
int32_t isaac_frame_opaque_98dba0_vector_count(uint32_t begin, uint32_t end);
int32_t isaac_frame_opaque_98dba0_empty_fatal_needed(int32_t player_count);
int32_t isaac_frame_opaque_98dba0_walk_needed(int32_t player_count);
int32_t isaac_frame_opaque_98dba0_index_in_range(uint32_t index, uint32_t count);
uint32_t isaac_frame_opaque_98dba0_player_slot_addr(uint32_t base, uint32_t index);
int32_t isaac_frame_opaque_98dba0_mp_range_empty(uint32_t begin, uint32_t end);
int32_t isaac_frame_opaque_98dba0_mp_id_eq(int32_t entry_id, int32_t player_id);
int32_t isaac_frame_opaque_98dba0_mp_first_match_index(const int32_t* entry_ids, uint32_t count, int32_t player_id);
int32_t isaac_frame_opaque_98dba0_mp_walk_after_miss(uint32_t* index, uint32_t count);
int32_t isaac_frame_opaque_98dba0_bvar2_phase1_sticky(int32_t bVar2);
int32_t isaac_frame_opaque_98dba0_bvar2_phase1_result(int32_t sticky, int32_t mp_hit_vtable_zero, int32_t fun_956110_nz);
int32_t isaac_frame_opaque_98dba0_phase2_rtti_needed(int32_t mp_empty, int32_t mp_hit_vtable_zero);
int32_t isaac_frame_opaque_98dba0_bvar2_phase3_result(int32_t sticky, int32_t mp_list_empty, int32_t is_idx_local, int32_t fun_956110_nz);
int32_t isaac_frame_opaque_98dba0_bvar2_player_step(int32_t bvar2_in, int32_t p1_mp_hit_vtable_zero, int32_t p1_fun_956110_nz, int32_t phase2_rtti_skip, int32_t p3_rtti_active, int32_t p3_mp_list_empty, int32_t p3_is_idx_local, int32_t p3_fun_956110_nz);
int32_t isaac_frame_opaque_98dba0_walk_after_player(uint32_t* index, uint32_t count);
int32_t isaac_frame_opaque_98dba0_bvar2_apply_from_probes(const int32_t* probes, uint32_t player_count);
void isaac_frame_opaque_98dba0_walk_residual_plan(IsaacFrameOpaque98dba0WalkPlan* out, int32_t player_count);
int32_t isaac_frame_opaque_956110_net_gate(int32_t manager_mode, uint32_t global_c71690);
int32_t isaac_frame_opaque_956110_id_is_neg1(int32_t id);
int32_t isaac_frame_opaque_956110_path(int32_t mp_empty, int32_t id);
int32_t isaac_frame_opaque_956110_net_early_result(int32_t net_out_byte);
int32_t isaac_frame_opaque_956110_apply_from_vtable_results(const uint8_t* results, uint32_t count);
int32_t isaac_frame_opaque_956110_result_from_samples(int32_t net_gate_open, int32_t net_host_ok, int32_t net_out_byte, int32_t mp_empty, int32_t id, const uint8_t* vtable_results, uint32_t vtable_count, int32_t general_result);
void isaac_frame_opaque_956110_residual_plan(IsaacFrameOpaque956110Plan* out, int32_t manager_mode, uint32_t global_c71690, int32_t mp_empty, int32_t id);
int32_t isaac_frame_opaque_864c30_capability_gate(uint32_t flag_dword);
int32_t isaac_frame_opaque_864c30_needs_host(int32_t capability);
int32_t isaac_frame_opaque_864c30_result_from_samples(int32_t capability, int32_t host_lua_ok);
int32_t isaac_frame_opaque_864c30_pack_kind_imm(void);
void isaac_frame_opaque_864c30_residual_plan(IsaacFrameOpaque864c30Plan* out, int32_t capability);
int32_t isaac_frame_opaque_864c30_seh_side_log_needed(uint32_t global_c71678);
uint32_t isaac_frame_opaque_864c30_seh_side_receiver(uint32_t global_c71678);
int32_t isaac_frame_opaque_864c30_seh_name_vtbl_slot_off(void);
int32_t isaac_frame_opaque_864c30_seh_result(void);
void isaac_frame_opaque_864c30_seh_plan(IsaacFrameOpaque864c30SehPlan* out, uint32_t global_c71678);
int32_t isaac_frame_opaque_864c30_result_from_samples_ex(int32_t capability, int32_t seh_unwound, int32_t host_lua_ok);
int32_t isaac_frame_opaque_6a80f0_ref_arg_lo(int32_t ref);
int32_t isaac_frame_opaque_6a80f0_ref_arg_hi(int32_t ref);
uint32_t isaac_frame_opaque_6a80f0_registry_index(void);
void isaac_frame_opaque_6a80f0_residual_plan(IsaacFrameOpaque6a80f0Plan* out, int32_t ref);
int32_t isaac_frame_opaque_874910_object_present(uint32_t object);
int32_t isaac_frame_opaque_874910_int_arg_hi(int32_t value);
int32_t isaac_frame_opaque_874910_kind_arg_hi(void);
int32_t isaac_frame_opaque_874910_pcall_failed(int32_t pcall_status);
int32_t isaac_frame_opaque_874910_pcall_nargs(void);
int32_t isaac_frame_opaque_874910_pcall_nresults(void);
int32_t isaac_frame_opaque_874910_userdata_size(void);
uint32_t isaac_frame_opaque_874910_userdata_tag(void);
uint32_t isaac_frame_opaque_874910_metatable_key(void);
uint32_t isaac_frame_opaque_874910_push_sequence(int32_t* out_kinds, uint32_t len, uint32_t object);
void isaac_frame_opaque_874910_apply_userdata_init(uint32_t* userdata, uint32_t object);
void isaac_frame_opaque_874910_apply_out(uint32_t* out_l_ref, uint32_t lua_state, int32_t luaL_ref_result);
void isaac_frame_opaque_874910_residual_plan(IsaacFrameOpaque874910Plan* out, uint32_t object, int32_t pcall_status);
int32_t isaac_frame_opaque_956110_walk_from_recounts(const uint8_t* results, const int32_t* counts, uint32_t counts_len);
int32_t isaac_frame_opaque_85c080_message_path(int32_t lua_gettop_result);
uint32_t isaac_frame_opaque_85c080_tostring_fallback(uint32_t tostring_ptr);
uint32_t isaac_frame_opaque_85c080_strlen(const uint8_t* s);
void isaac_frame_opaque_85c080_apply_record_init(uint32_t* record, uint32_t lua_state);
int32_t isaac_frame_opaque_85c080_literal_needs_grow(uint32_t capacity);
int32_t isaac_frame_opaque_85c080_literal_dst_is_heap(uint32_t capacity);
uint32_t isaac_frame_opaque_85c080_grow_capacity(uint32_t capacity);
uint32_t isaac_frame_opaque_85c080_grow_alloc_bytes(uint32_t capacity);
void isaac_frame_opaque_85c080_apply_literal(uint8_t* dst, const uint8_t* literal, uint32_t* size_field);
void isaac_frame_opaque_85c080_residual_plan(IsaacFrameOpaque85c080Plan* out, int32_t lua_gettop_result, uint32_t capacity, uint32_t tostring_ptr);
int32_t isaac_frame_opaque_40ccd0_in_place(uint32_t len, uint32_t old_capacity);
int32_t isaac_frame_opaque_40ccd0_dst_is_heap(uint32_t capacity);
int32_t isaac_frame_opaque_40ccd0_length_error(uint32_t len);
uint32_t isaac_frame_opaque_40ccd0_grow_capacity(uint32_t len, uint32_t old_capacity);
uint32_t isaac_frame_opaque_40ccd0_alloc_bytes(uint32_t new_capacity);
void isaac_frame_opaque_40ccd0_apply_in_place(uint32_t* size_field, uint8_t* dst, const uint8_t* src, uint32_t len);
void isaac_frame_opaque_40ccd0_residual_plan(IsaacFrameOpaque40ccd0Plan* out, uint32_t len, uint32_t old_capacity);
int32_t isaac_frame_opaque_alloc_is_aligned(uint32_t bytes);
uint32_t isaac_frame_opaque_alloc_raw_bytes(uint32_t bytes);
int32_t isaac_frame_opaque_alloc_overflow(uint32_t bytes);
uint32_t isaac_frame_opaque_alloc_payload(uint32_t raw_ptr);
uint32_t isaac_frame_opaque_alloc_header_addr(uint32_t payload);
int32_t isaac_frame_opaque_alloc_small_is_null(uint32_t bytes);
int32_t isaac_frame_opaque_free_adjust_needed(uint32_t bytes);
uint32_t isaac_frame_opaque_free_adjust_bytes(uint32_t bytes);
uint32_t isaac_frame_opaque_free_delta(uint32_t payload, uint32_t header);
int32_t isaac_frame_opaque_free_delta_valid(uint32_t delta);
void isaac_frame_opaque_alloc_plan(IsaacFrameOpaqueAllocPlan* out, uint32_t bytes);
int32_t isaac_frame_opaque_40cf50_src_is_heap(uint32_t src_capacity);
int32_t isaac_frame_opaque_40cf50_sso(uint32_t len);
uint32_t isaac_frame_opaque_40cf50_grow_capacity(uint32_t len);
uint32_t isaac_frame_opaque_40cf50_alloc_bytes(uint32_t new_capacity);
uint32_t isaac_frame_opaque_40cf50_copy_bytes(uint32_t len);
void isaac_frame_opaque_40cf50_apply_init(uint32_t* buf_word0, uint32_t* size_field, uint32_t* cap_field);
void isaac_frame_opaque_40cf50_apply_sso(uint8_t* dst, const uint8_t* src, uint32_t* size_field, uint32_t* cap_field, uint32_t len);
void isaac_frame_opaque_40cf50_apply_grow_stores(uint32_t* buf_word0, uint32_t* size_field, uint32_t* cap_field, uint32_t buf_ptr, uint32_t len);
int32_t isaac_frame_opaque_874a10_byte_arg(uint32_t raw);
int32_t isaac_frame_opaque_874a10_pcall_nargs(void);
uint32_t isaac_frame_opaque_874a10_push_sequence(int32_t* out_kinds, uint32_t len);
void isaac_frame_opaque_874a10_residual_plan(IsaacFrameOpaque874a10Plan* out, uint32_t byte_arg_raw, int32_t pcall_status);
int32_t isaac_frame_opaque_40cfe0_default_capacity(void);
void isaac_frame_opaque_40cfe0_apply_init(uint8_t* buf0, uint32_t* size_field, uint32_t* cap_field);
void isaac_frame_opaque_40cfe0_residual_plan(IsaacFrameOpaque40cfe0Plan* out);
void isaac_frame_opaque_40cca0_apply_zero(uint8_t* buf, uint32_t* size_field, uint32_t* cap_field);
void isaac_frame_opaque_40cca0_residual_plan(IsaacFrameOpaque40cca0Plan* out);
void isaac_frame_opaque_40cf50_residual_plan(IsaacFrameOpaque40cf50Plan* out, uint32_t src_size, uint32_t src_capacity);
void isaac_frame_opaque_40d000_release_plan(IsaacFrameOpaque40d000Plan* out, uint32_t payload, uint32_t header, uint32_t bytes);
void isaac_frame_opaque_40d040_tidy_plan(IsaacFrameOpaque40d040Plan* out, uint32_t capacity, uint32_t payload, uint32_t header);
void isaac_frame_opaque_40d040_apply_reset(uint8_t* buf0, uint32_t* size_field, uint32_t* cap_field);
int32_t isaac_frame_opaque_9b9480_player_counted(uint32_t q_ptr, uint32_t p_ptr, int32_t q_161c, int32_t p_161c);
uint32_t isaac_frame_opaque_9b9480_count(const uint32_t* q_ptrs, const uint32_t* p_ptrs, const int32_t* q_161cs, const int32_t* p_161cs, uint32_t count);
int32_t isaac_frame_opaque_9b9310_fetch_index(const uint32_t* q_ptrs, const uint32_t* p_ptrs, const int32_t* q_161cs, const int32_t* p_161cs, uint32_t count, uint32_t wanted);
uint32_t isaac_frame_opaque_417800_subject(uint32_t p_ptr, uint32_t q_ptr, int32_t q_161c, int32_t p_161c);
int32_t isaac_frame_opaque_90ac70_player_for_id(const int32_t* player_ids_1618, uint32_t player_count, int32_t id);
int32_t isaac_frame_opaque_90ac70_elem_matches(uint32_t resolved_player_ptr, uint32_t subj2_ptr, int32_t elem_id, int32_t subject_id_1618);
int32_t isaac_frame_opaque_90ac70_match_index(const uint32_t* elem_ids, uint32_t elem_count, const uint32_t* player_ptrs, const int32_t* player_ids_1618, uint32_t player_count, uint32_t subject_ptr, uint32_t subject_q_ptr, int32_t subject_q_161c, int32_t subject_161c, int32_t subject_id_1618);
void isaac_frame_opaque_90ac70_residual_plan(IsaacFrameOpaque90ac70Plan* out, const uint32_t* elem_ids, uint32_t elem_count, const uint32_t* player_ptrs, const int32_t* player_ids_1618, uint32_t player_count, uint32_t subject_ptr, uint32_t subject_q_ptr, int32_t subject_q_161c, int32_t subject_161c, int32_t subject_id_1618);
void isaac_frame_opaque_4264c0_pair_plan(IsaacFrameOpaque4264c0Plan* out, int32_t container_empty, uint32_t player_ptr, int32_t player_id_1618, int32_t player_161c, uint32_t q_ptr, int32_t q_161c, int32_t obj_found, uint32_t obj_sub_ptr, uint32_t obj_sub_lo, uint32_t obj_sub_hi);
uint32_t isaac_frame_opaque_4257b0_pass_a_pairs_from_samples(uint32_t* out_pairs, uint32_t out_len, const uint32_t* p_ptrs, const int32_t* p_ids_1618, const int32_t* p_161cs, const uint32_t* q_ptrs, const int32_t* q_161cs, const int32_t* q_ids_1618, const uint32_t* qq_ptrs, const int32_t* qq_161cs, uint32_t player_count, int32_t container_empty, const uint32_t* elem_ids, const uint32_t* elem_sub_ptrs, const uint32_t* elem_sub_los, const uint32_t* elem_sub_his, uint32_t elem_count, uint32_t id_count);
uint32_t isaac_frame_opaque_421b50_words(uint32_t count);
uint32_t isaac_frame_opaque_421b50_partial_mask(uint32_t count);
uint32_t isaac_frame_opaque_421b50_merged_a(uint32_t a, uint32_t b, uint32_t mask);
uint32_t isaac_frame_opaque_421b50_cleared_b(uint32_t b, uint32_t mask);
uint32_t isaac_frame_opaque_421b50_apply(uint32_t* a_arr, uint32_t* b_arr, uint32_t count);
void isaac_frame_opaque_421b50_plan(IsaacFrameOpaque421b50Plan* out, uint32_t count);
int32_t isaac_frame_opaque_list6772c_sweep(const int32_t* timers, int32_t count, int32_t* timers_out, int32_t* evict_out);
int32_t isaac_frame_opaque_4212c0_volume_eq_one(float volume);
int32_t isaac_frame_opaque_4212c0_host_92e430_needed(float volume);
float isaac_frame_opaque_4212c0_volume_after_gate(float volume);
void isaac_frame_opaque_4212c0_true_probe_plan(IsaacFrameOpaque4212c0TrueProbePlan* out, int32_t mgr_f18, int32_t mgr_ebc, float volume);
int32_t isaac_frame_opaque_421400_mode_active(int32_t mode);
uint32_t isaac_frame_opaque_421400_pos_a_bits(float num_a);
uint32_t isaac_frame_opaque_421400_pos_b_bits(float num_b);
int32_t isaac_frame_opaque_421400_render_needed(uint32_t flag111);
int32_t isaac_frame_opaque_421400_render_first(uint32_t field78);
void isaac_frame_opaque_421400_plan(IsaacFrameOpaque421400Plan* out, int32_t mode, float num_a, float num_b, uint32_t flag111, uint32_t field78);

/* ===========================================================================
 * FUN_004214b0 set-overlay-animation-by-mode — ABI v34
 *
 * Body VA 0x004214b0..0x00421591, ret 4 (this in ecx, arg = mode), plain
 * prologue (no SEH); no exact ZHL. The v33 receipt named "next function
 * 0x004214c0" — anchor correction: int3 pad runs 0x004214a1..0x004214af
 * and the real entry is 0x004214b0 (0x4214c0 is mid-body). Sole callers:
 * 0x4afef5 / 0x4aff6e (the 0x4afe40 dispatch family) and 0x592758
 * (`mov ecx,[0xc71678]; lea ecx,[ecx+0x1d2ec]` — the Game manager
 * subobject shared with 4212c0/421400, mode=4 pushed at the site).
 * Body (PE order):
 *   1. `cmp esi,4; ja 0x42158b` — mode > 4 (UNSIGNED) -> epilogue with
 *      NO stores (the [this]=1 and [this+4]=mode stores are both gated)
 *   2. record = this + mode*0x38 (PE `lea eax,[esi*8]; sub eax,esi;
 *      lea ebx,[ecx+eax*8]` = mode*7*8 = mode*56); anim = edi = this+8
 *   3. ANM2::Load(anim, record+0x120, 1) 0x40bd50 and LoadGraphics(anim)
 *      0x40c000 — BY REFERENCE (anm2 v7/v8 store lanes)
 *   4. [this+4] = mode (store, gated on mode<=4) @ 0x4214f2
 *   5. mode==2 || mode==3 -> GetLayer(4) 0x40b220 + [layer+0x8c]|=0x20
 *      @ 0x421508 (STORE, only on the 2/3 arm)
 *   6. SSO key decode @ record+0x138 (cap record+0x14c, jb 0x10 strict):
 *      cap<0x10 -> inline at +0x138 else heap [record+0x138]
 *   7. [anim+0x34] != 0 (FULL dword) -> SSO anim-name compare vs the
 *      key (the anm2 model pins +0x34 = ANIM_DATA_PTR); equal AND
 *      [key+0x34]==0 AND [anim+0x44]==0 -> SKIP the SetOverlay block
 *      (bytes @ 0x42155e/0x421563, LOW-BYTE zero tests)
 *   8. else SetOverlayFrame 0x40a5d0(anim, key, 1) (ANM2_PLAY_APPLY by
 *      reference); al != 0 (LOW-BYTE) -> Rewind 0x40a1b0(anim+0x30) +
 *      [anim+0x44]=1 @ 0x42157e (store)
 *   9. [this] = 1 (store, gated on mode<=4) @ 0x421585
 * cmp-eq result law: equal -> xor al,al (0); mismatch -> sbb eax,eax /
 * or eax,1 (nonzero). Host leaves: the 5 ANM2-family calls by reference.
 * Exported laws are pure scalars — none reads host memory.
 * NARROWED not removed. NEXT_VA 0x004215a0.
 * =========================================================================== */

enum { ISAAC_FRAME_OPAQUE_4214B0_HOST_VA = 0x004214b0u };
enum { ISAAC_FRAME_OPAQUE_4214B0_END_VA = 0x00421591u };
enum { ISAAC_FRAME_OPAQUE_4214B0_NEXT_VA = 0x004215a0u };
enum { ISAAC_FRAME_OPAQUE_4214B0_MAX_MODE = 4u };
enum { ISAAC_FRAME_OPAQUE_4214B0_RECORD_STRIDE = 0x38 };
enum { ISAAC_FRAME_OPAQUE_4214B0_ANIM_OFF = 0x08 };
enum { ISAAC_FRAME_OPAQUE_4214B0_LOAD_PATH_OFF = 0x120 };
enum { ISAAC_FRAME_OPAQUE_4214B0_LOAD_GRAPHICS = 0x01 };
enum { ISAAC_FRAME_OPAQUE_4214B0_MODE_STORE_OFF = 0x04 };
enum { ISAAC_FRAME_OPAQUE_4214B0_OPEN_STORE_OFF = 0x00 };
enum { ISAAC_FRAME_OPAQUE_4214B0_OPEN_STORE = 0x01 };
enum { ISAAC_FRAME_OPAQUE_4214B0_GET_LAYER_ARG = 4u };
enum { ISAAC_FRAME_OPAQUE_4214B0_LAYER_FLAGS_OFF = 0x8c };
enum { ISAAC_FRAME_OPAQUE_4214B0_LAYER_FLAGS_OR = 0x20 };
enum { ISAAC_FRAME_OPAQUE_4214B0_KEY_DATA_OFF = 0x138 };
enum { ISAAC_FRAME_OPAQUE_4214B0_KEY_CAP_OFF = 0x14c };
enum { ISAAC_FRAME_OPAQUE_4214B0_SSO_CAP = 0x10 };
enum { ISAAC_FRAME_OPAQUE_4214B0_ANIM_DATA_PTR_OFF = 0x34 };
enum { ISAAC_FRAME_OPAQUE_4214B0_PLAYING_FLAG_OFF = 0x44 };
enum { ISAAC_FRAME_OPAQUE_4214B0_REWIND_OFF = 0x30 };
enum { ISAAC_FRAME_OPAQUE_4214B0_KEY_FLAG_OFF = 0x34 };
enum { ISAAC_FRAME_OPAQUE_4214B0_PLAYING_FLAG_SET = 0x01 };
enum { ISAAC_FRAME_OPAQUE_4214B0_ANM2_LOAD_VA = 0x0040bd50u };
enum { ISAAC_FRAME_OPAQUE_4214B0_ANM2_LOAD_GRAPHICS_VA = 0x0040c000u };
enum { ISAAC_FRAME_OPAQUE_4214B0_ANM2_GET_LAYER_VA = 0x0040b220u };
enum { ISAAC_FRAME_OPAQUE_4214B0_ANM2_SET_OVERLAY_VA = 0x0040a5d0u };
enum { ISAAC_FRAME_OPAQUE_4214B0_ANM2_REWIND_VA = 0x0040a1b0u };

int32_t isaac_frame_opaque_4214b0_mode_allowed(int32_t mode);
uint32_t isaac_frame_opaque_4214b0_record_off(int32_t mode);
int32_t isaac_frame_opaque_4214b0_mode_2or3(int32_t mode);
int32_t isaac_frame_opaque_4214b0_cmp_needed(uint32_t anim_data_ptr);
int32_t isaac_frame_opaque_4214b0_have_eq(int32_t cmp_result);
int32_t isaac_frame_opaque_4214b0_skip_setoverlay_needed(int32_t have_eq,
                                                         uint32_t key_flag,
                                                         uint32_t playing_flag);
int32_t isaac_frame_opaque_4214b0_setoverlay_ran(uint32_t al);
uint32_t isaac_frame_opaque_4214b0_layer_flags_after(uint32_t flags);
int32_t isaac_frame_opaque_4214b0_sso_inline_needed(uint32_t cap);
uint32_t isaac_frame_opaque_4214b0_max_mode(void);
uint32_t isaac_frame_opaque_4214b0_record_stride(void);
uint32_t isaac_frame_opaque_4214b0_load_path_off(void);
uint32_t isaac_frame_opaque_4214b0_load_graphics(void);
uint32_t isaac_frame_opaque_4214b0_mode_store_off(void);
uint32_t isaac_frame_opaque_4214b0_open_store_off(void);
uint32_t isaac_frame_opaque_4214b0_open_store(void);
uint32_t isaac_frame_opaque_4214b0_get_layer_arg(void);
uint32_t isaac_frame_opaque_4214b0_layer_flags_off(void);
uint32_t isaac_frame_opaque_4214b0_layer_flags_or(void);
uint32_t isaac_frame_opaque_4214b0_key_data_off(void);
uint32_t isaac_frame_opaque_4214b0_key_cap_off(void);
uint32_t isaac_frame_opaque_4214b0_sso_cap(void);
uint32_t isaac_frame_opaque_4214b0_anim_data_ptr_off(void);
uint32_t isaac_frame_opaque_4214b0_playing_flag_off(void);
uint32_t isaac_frame_opaque_4214b0_rewind_off(void);
uint32_t isaac_frame_opaque_4214b0_key_flag_off(void);
uint32_t isaac_frame_opaque_4214b0_playing_flag_set(void);
uint32_t isaac_frame_opaque_4214b0_anm2_load_va(void);
uint32_t isaac_frame_opaque_4214b0_anm2_load_graphics_va(void);
uint32_t isaac_frame_opaque_4214b0_anm2_get_layer_va(void);
uint32_t isaac_frame_opaque_4214b0_anm2_set_overlay_va(void);
uint32_t isaac_frame_opaque_4214b0_anm2_rewind_va(void);
uint32_t isaac_frame_opaque_4214b0_host_va(void);
uint32_t isaac_frame_opaque_4214b0_end_va(void);
uint32_t isaac_frame_opaque_4214b0_next_va(void);

/* ===========================================================================
 * FUN_004215a0 std::string move-assign (self-alias guarded) — ABI v35
 *
 * Body VA 0x004215a0..0x004215d9, ret 4 (this in ecx, src = [ebp+8]),
 * plain 2-push prologue (no SEH); no exact ZHL. 28 direct E8 callers
 * image-wide (0x687b2d..0x689bcd, the 0x687b00 resource-loader band);
 * zero address-taken. Frame-opaque-owned (recorded NEXT_VA of v34).
 * Body:
 *   1. `cmp esi,edi; je 0x4215d4` — SELF-ALIAS (this == src) -> PURE
 *      NO-OP (no dtor, no copy, no reset); return *this
 *   2. `call 0x40d040(ecx=this)` — host string-dtor BY REFERENCE
 *      (shared MSVC helper; 1288 direct callers image-wide, used by
 *      exit/playerhud families as host leaf; no exact ZHL)
 *   3. copy 0x18 bytes SSO block: movups xmm0,[src+0..0xf] ->
 *      [this+0..0xf] (16 B) then movq xmm0,[src+0x10..0x17] ->
 *      [this+0x10..0x17] (8 B) — the whole 24-byte SSO region
 *      (inline data +0x00, size +0x10, cap +0x14) in PE order
 *   4. source steal-reset: [src+0x10]=0 (size), [src+0x14]=0xf
 *      (cap), byte[src]=0 (empty string) at 0x4215c3..0x4215d1
 *   5. eax = this; ret 4
 * The copy is an SSO-UNCONDITIONAL move: the PE does NOT branch on the
 * src cap — only the dtor (step 2) distinguishes heap vs inline, and
 * the dtor is a host leaf. Exported laws are pure scalars — none reads
 * host memory. NARROWED not removed. NEXT_VA 0x004215e0.
 * =========================================================================== */

enum { ISAAC_FRAME_OPAQUE_4215A0_HOST_VA = 0x004215a0u };
enum { ISAAC_FRAME_OPAQUE_4215A0_END_VA = 0x004215d9u };
enum { ISAAC_FRAME_OPAQUE_4215A0_NEXT_VA = 0x004215e0u };
enum { ISAAC_FRAME_OPAQUE_4215A0_DTOR_VA = 0x0040d040u };
enum { ISAAC_FRAME_OPAQUE_4215A0_COPY_SSO_HI = 0x10 }; /* movups 16 B */
enum { ISAAC_FRAME_OPAQUE_4215A0_COPY_SSO_LO = 0x08 }; /* movq 8 B */
enum { ISAAC_FRAME_OPAQUE_4215A0_COPY_TOTAL = 0x18 };
enum { ISAAC_FRAME_OPAQUE_4215A0_SRC_SIZE_OFF = 0x10 };
enum { ISAAC_FRAME_OPAQUE_4215A0_SRC_CAP_OFF = 0x14 };
enum { ISAAC_FRAME_OPAQUE_4215A0_SRC_CAP_EMPTY = 0x0f };
enum { ISAAC_FRAME_OPAQUE_4215A0_SRC_DATA_OFF = 0x00 };

int32_t isaac_frame_opaque_4215a0_self_alias(uint32_t this_ptr,
                                             uint32_t src_ptr);
int32_t isaac_frame_opaque_4215a0_dtor_needed(int32_t alias);
uint32_t isaac_frame_opaque_4215a0_copy_sso_hi(void);
uint32_t isaac_frame_opaque_4215a0_copy_sso_lo(void);
uint32_t isaac_frame_opaque_4215a0_copy_total(void);
uint32_t isaac_frame_opaque_4215a0_src_size_off(void);
uint32_t isaac_frame_opaque_4215a0_src_cap_off(void);
uint32_t isaac_frame_opaque_4215a0_src_cap_empty(void);
uint32_t isaac_frame_opaque_4215a0_src_data_off(void);
uint32_t isaac_frame_opaque_4215a0_steal_reset_size(void);
uint32_t isaac_frame_opaque_4215a0_steal_reset_cap(uint32_t src_cap);
uint32_t isaac_frame_opaque_4215a0_steal_reset_data_byte(void);
uint32_t isaac_frame_opaque_4215a0_dtor_va(void);
uint32_t isaac_frame_opaque_4215a0_host_va(void);
uint32_t isaac_frame_opaque_4215a0_end_va(void);
uint32_t isaac_frame_opaque_4215a0_next_va(void);

/* ===========================================================================
 * FUN_004215e0 std::string copy-assign (user-assign, NO self-alias guard) — ABI v36
 *
 * Body VA 0x004215e0..0x00421611, ret 8 (this in ecx, src = [ebp+8],
 * second stack arg NEVER read); plain 1-push prologue (no SEH); no exact
 * ZHL. 1 direct E8 caller image-wide (0x68d320); zero address-taken.
 * The v35 move-assign twin WITHOUT the guard: the host string-dtor and
 * the SSO copy/steal-reset are byte-identical to v35's non-alias path
 * (0x4215a0 0x4215ae..0x4215d1 == 0x4215e0 0x4215e6..0x42160c).
 * Body:
 *   1. \`call 0x40d040(ecx=this)\` — host string-dtor BY REFERENCE
 *      (unconditional — NO self-alias check exists in this body)
 *   2. copy 0x18 bytes SSO block: movups [src+0..0xf]->[this+0..0xf]
 *      (16 B) then movq [src+0x10..0x17]->[this+0x10..0x17] (8 B)
 *   3. source steal-reset: [src+0x10]=0, [src+0x14]=0xf, byte[src]=0
 *   4. eax = this; ret 8 (the second stack arg is dead)
 * Exported laws are pure scalars. NARROWED not removed.
 * NEXT_VA 0x00421618.
 * =========================================================================== */

enum { ISAAC_FRAME_OPAQUE_4215E0_HOST_VA = 0x004215e0u };
enum { ISAAC_FRAME_OPAQUE_4215E0_END_VA = 0x00421611u };
enum { ISAAC_FRAME_OPAQUE_4215E0_NEXT_VA = 0x00421618u };
enum { ISAAC_FRAME_OPAQUE_4215E0_DTOR_VA = 0x0040d040u };
enum { ISAAC_FRAME_OPAQUE_4215E0_COPY_SSO_HI = 0x10 };
enum { ISAAC_FRAME_OPAQUE_4215E0_COPY_SSO_LO = 0x08 };
enum { ISAAC_FRAME_OPAQUE_4215E0_COPY_TOTAL = 0x18 };
enum { ISAAC_FRAME_OPAQUE_4215E0_SRC_SIZE_OFF = 0x10 };
enum { ISAAC_FRAME_OPAQUE_4215E0_SRC_CAP_OFF = 0x14 };
enum { ISAAC_FRAME_OPAQUE_4215E0_SRC_CAP_EMPTY = 0x0f };
enum { ISAAC_FRAME_OPAQUE_4215E0_SRC_DATA_OFF = 0x00 };
enum { ISAAC_FRAME_OPAQUE_4215E0_RET_ARGS = 8 };

uint32_t isaac_frame_opaque_4215e0_copy_sso_hi(void);
uint32_t isaac_frame_opaque_4215e0_copy_sso_lo(void);
uint32_t isaac_frame_opaque_4215e0_copy_total(void);
uint32_t isaac_frame_opaque_4215e0_src_size_off(void);
uint32_t isaac_frame_opaque_4215e0_src_cap_off(void);
uint32_t isaac_frame_opaque_4215e0_src_cap_empty(void);
uint32_t isaac_frame_opaque_4215e0_src_data_off(void);
uint32_t isaac_frame_opaque_4215e0_steal_reset_size(void);
uint32_t isaac_frame_opaque_4215e0_steal_reset_cap(uint32_t src_cap);
uint32_t isaac_frame_opaque_4215e0_steal_reset_data_byte(void);
uint32_t isaac_frame_opaque_4215e0_dtor_va(void);
uint32_t isaac_frame_opaque_4215e0_ret_args(void);
int32_t isaac_frame_opaque_4215e0_has_guard(void);
uint32_t isaac_frame_opaque_4215e0_host_va(void);
uint32_t isaac_frame_opaque_4215e0_end_va(void);
uint32_t isaac_frame_opaque_4215e0_next_va(void);

/* ===========================================================================
 * FUN_00421620 std::string::assign(const char*) + 0x00421680 grow core — ABI v37
 *
 * 0x00421620 (ret, this=ecx, src=[ebp+8]; old_len=[edx+0x10],
 * cap=[edx+0x14]): user-assign wrapper — strlen(src), max-cap gate
 * \`0x7fffffff - old_len < len\` -> throw 0x40ccc0, SSO source decode
 * (cap<0x10 inline : heap [edx]), then the grow core 0x421680. 18 direct
 * E8 callers (0x687b0c..0x689ec7).
 * 0x00421680 (ret 0x18, this=ecx, args: existing-chars, existing-len,
 * add-chars, add-len): request = existing-len + add-len; growth:
 * request <= 0xf (jbe) -> SSO inline (cap stays 0xf, no alloc); else
 * cap = request|0xf, clamp 0x7fffffff (jbe), min 0x16 (cmovb); alloc
 * 0x40cf00(cap+1); memcpy(existing) + memcpy(add) via IAT 0xaf05df x2;
 * NUL at [buf+request]. 109 direct E8 callers (0x420e44..0x695d64).
 * Family-owned string family (v24 default-init / v26 release / v27
 * landed). Host leaves: alloc 0x40cf00, memcpy IAT 0xaf05df, throw
 * 0x40ccc0. Exported laws are pure scalar math — none reads host memory.
 * NARROWED not removed. NEXT_VA (0x421620 band) 0x00421720.
 * =========================================================================== */

enum { ISAAC_FRAME_OPAQUE_421620_HOST_VA = 0x00421620u };
enum { ISAAC_FRAME_OPAQUE_421620_END_VA = 0x0042167bu };
enum { ISAAC_FRAME_OPAQUE_421680_HOST_VA = 0x00421680u };
enum { ISAAC_FRAME_OPAQUE_421680_END_VA = 0x00421712u };
enum { ISAAC_FRAME_OPAQUE_421680_NEXT_VA = 0x00421720u };
enum { ISAAC_FRAME_OPAQUE_421620_ALLOC_VA = 0x0040cf00u };
enum { ISAAC_FRAME_OPAQUE_421620_MEMCPY_IAT_VA = 0x00af05dfu };
enum { ISAAC_FRAME_OPAQUE_421620_THROW_VA = 0x0040ccc0u };
enum { ISAAC_FRAME_OPAQUE_421620_SSO_CAP = 0x10 };
enum { ISAAC_FRAME_OPAQUE_421620_MAX_CAP = 0x7fffffff };
enum { ISAAC_FRAME_OPAQUE_421620_MIN_GROW = 0x16 };
enum { ISAAC_FRAME_OPAQUE_421620_SRC_LEN_OFF = 0x10 };
enum { ISAAC_FRAME_OPAQUE_421620_SRC_CAP_OFF = 0x14 };
enum { ISAAC_FRAME_OPAQUE_421620_SRC_DATA_OFF = 0x00 };

int32_t isaac_frame_opaque_421620_max_cap_exceeded(int32_t len,
                                                   uint32_t old_cap);
int32_t isaac_frame_opaque_421620_sso_inline_needed(uint32_t cap);
int32_t isaac_frame_opaque_421620_growth_needed(uint32_t request);
uint32_t isaac_frame_opaque_421620_grow_cap(uint32_t request);
uint32_t isaac_frame_opaque_421620_src_len_off(void);
uint32_t isaac_frame_opaque_421620_src_cap_off(void);
uint32_t isaac_frame_opaque_421620_src_data_off(void);
uint32_t isaac_frame_opaque_421620_alloc_va(void);
uint32_t isaac_frame_opaque_421620_memcpy_va(void);
uint32_t isaac_frame_opaque_421620_throw_va(void);
uint32_t isaac_frame_opaque_421620_host_va(void);
uint32_t isaac_frame_opaque_421620_end_va(void);
uint32_t isaac_frame_opaque_421680_host_va(void);
uint32_t isaac_frame_opaque_421680_end_va(void);
uint32_t isaac_frame_opaque_421680_next_va(void);

/* ===========================================================================
 * FUN_00421720 bitset membership test (+0x8ac/+0x8bc bitmap pair) — ABI v38
 *
 * Body VA 0x00421720..0x00421767, ret 4 (this in ecx, id = [ebp+8]),
 * plain prologue; no exact ZHL. 6 direct E8 callers (0x422b19..0x422cb8).
 * FULLY PURE (zero calls, zero stores — reads only).
 * Body:
 *    idx = (id >> 5) * 4        (0x421734 shr edx,5; 0x42173a shl edx,2)
 *    bit = 1 << (id & 0x1f)     (0x421737 and ecx,0x1f; 0x421743 shl esi,cl)
 *    hit = ([this->0x8ac + idx] & bit) | ([this->0x8bc + idx] & bit)
 *    al = hit ? 1 : 0           (0x421748 jne -> al=1; else second test;
 *                                0x421756 xor al,al / 0x421761 mov al,1)
 * Receiver layout matches the v30 421b50 contract (BITMAP_A_OFF 0x8ac /
 * BITMAP_B_OFF 0x8bc). Exported laws are pure scalar math — none reads
 * host memory; the caller supplies the two dwords and the bit mask.
 * NARROWED not removed. NEXT_VA 0x00421770.
 * =========================================================================== */

enum { ISAAC_FRAME_OPAQUE_421720_HOST_VA = 0x00421720u };
enum { ISAAC_FRAME_OPAQUE_421720_END_VA = 0x00421767u };
enum { ISAAC_FRAME_OPAQUE_421720_NEXT_VA = 0x00421770u };
enum { ISAAC_FRAME_OPAQUE_421720_BITMAP_A_OFF = 0x8ac };
enum { ISAAC_FRAME_OPAQUE_421720_BITMAP_B_OFF = 0x8bc };
enum { ISAAC_FRAME_OPAQUE_421720_WORD_SHIFT = 5 };
enum { ISAAC_FRAME_OPAQUE_421720_BIT_MASK = 0x1f };

uint32_t isaac_frame_opaque_421720_word_off(uint32_t id);
uint32_t isaac_frame_opaque_421720_bit_mask(uint32_t id);
int32_t isaac_frame_opaque_421720_membership(uint32_t word_a,
                                             uint32_t word_b,
                                             uint32_t bit_mask);
uint32_t isaac_frame_opaque_421720_bitmap_a_off(void);
uint32_t isaac_frame_opaque_421720_bitmap_b_off(void);
uint32_t isaac_frame_opaque_421720_word_shift(void);
uint32_t isaac_frame_opaque_421720_bit_mask_const(void);
uint32_t isaac_frame_opaque_421720_host_va(void);
uint32_t isaac_frame_opaque_421720_end_va(void);
uint32_t isaac_frame_opaque_421720_next_va(void);

/* ===========================================================================
 * FUN_00421770 / 00421780 / 00421790 getters + 004217a0 bitset-set — ABI v39
 *
 * 0x00421770 (ret; this=ecx): \`mov eax,[ecx+0x26584]; ret\` field
 * getter. 37 direct E8 callers (0x5b6063..0x5c482d) + 1 dword ref.
 * 0x00421780 (ret): \`mov eax,[0xc71678]; add eax,0x26630\` Game ptr
 * adder (0x1d2ec manager family sibling). 8 callers.
 * 0x00421790 (ret): \`mov eax,[0xc71678]; add eax,0x18910\`. 4 callers.
 * 0x004217a0 (ret 4; this=ecx, id=[ebp+8]): 64-bit bitmap membership over
 * [this+0x26548] (8-byte pairs). 29 direct E8 callers (0x422ca8..0x73b62f).
 *   clamped = id < 0 ? 0 : id > 0x34 ? 0x34 : id   (0x4217b5 cmovle /
 *   0x4217ba cmovl)
 *   lo = clamped & 0x3f                             (0x4217c3)
 *   hi_bit = 1 << (lo & 0x1f)  — BTS WRAPS mod 32 (0x4217c6; the 0x20..0x3f
 *   class lands on the SECOND dword at bit (lo-0x20))
 *   pair_idx = (clamped >> 6) * 8                   (0x4217d7 shr 6; [*8])
 *   hit = (wordA & (lo<0x20 ? hi_bit : 0)) | (wordB & (lo>=0x20 ? hi_bit : 0))
 *       (0x4217cc cmovae / 0x4217cf xor / 0x4217da..0x4217e1 and/or)
 * Exported laws pure scalars. NARROWED not removed.
 * NEXT_VA (0x4217a0 band) 0x004217f3.
 * =========================================================================== */

enum { ISAAC_FRAME_OPAQUE_421770_HOST_VA = 0x00421770u };
enum { ISAAC_FRAME_OPAQUE_421770_END_VA = 0x00421776u };
enum { ISAAC_FRAME_OPAQUE_421770_FIELD_OFF = 0x26584 };
enum { ISAAC_FRAME_OPAQUE_421780_HOST_VA = 0x00421780u };
enum { ISAAC_FRAME_OPAQUE_421780_END_VA = 0x0042178au };
enum { ISAAC_FRAME_OPAQUE_421780_GAME_ADD = 0x26630 };
enum { ISAAC_FRAME_OPAQUE_421790_HOST_VA = 0x00421790u };
enum { ISAAC_FRAME_OPAQUE_421790_END_VA = 0x0042179au };
enum { ISAAC_FRAME_OPAQUE_421790_GAME_ADD = 0x18910 };
enum { ISAAC_FRAME_OPAQUE_4217A0_HOST_VA = 0x004217a0u };
enum { ISAAC_FRAME_OPAQUE_4217A0_END_VA = 0x004217f0u };
enum { ISAAC_FRAME_OPAQUE_4217A0_NEXT_VA = 0x004217f3u };
enum { ISAAC_FRAME_OPAQUE_4217A0_BITMAP_OFF = 0x26548 };
enum { ISAAC_FRAME_OPAQUE_4217A0_MAX_ID = 0x34 };
enum { ISAAC_FRAME_OPAQUE_4217A0_LO_MASK = 0x3f };
enum { ISAAC_FRAME_OPAQUE_4217A0_DWORD_SHIFT = 0x20 };
enum { ISAAC_FRAME_OPAQUE_4217A0_PAIR_STRIDE = 0x08 };

uint32_t isaac_frame_opaque_421770_field_off(void);
uint32_t isaac_frame_opaque_421770_host_va(void);
uint32_t isaac_frame_opaque_421770_end_va(void);
uint32_t isaac_frame_opaque_421780_game_add(void);
uint32_t isaac_frame_opaque_421780_host_va(void);
uint32_t isaac_frame_opaque_421780_end_va(void);
uint32_t isaac_frame_opaque_421790_game_add(void);
uint32_t isaac_frame_opaque_421790_host_va(void);
uint32_t isaac_frame_opaque_421790_end_va(void);
int32_t isaac_frame_opaque_4217a0_clamp_id(int32_t id);
uint32_t isaac_frame_opaque_4217a0_pair_off(uint32_t clamped);
uint32_t isaac_frame_opaque_4217a0_lo_bit(uint32_t clamped);
int32_t isaac_frame_opaque_4217a0_lo_is_hi(uint32_t clamped);
int32_t isaac_frame_opaque_4217a0_membership(uint32_t word_a,
                                             uint32_t word_b,
                                             uint32_t lo_bit,
                                             int32_t lo_is_hi);
uint32_t isaac_frame_opaque_4217a0_bitmap_off(void);
uint32_t isaac_frame_opaque_4217a0_max_id(void);
uint32_t isaac_frame_opaque_4217a0_lo_mask(void);
uint32_t isaac_frame_opaque_4217a0_dword_shift(void);
uint32_t isaac_frame_opaque_4217a0_pair_stride(void);
uint32_t isaac_frame_opaque_4217a0_host_va(void);
uint32_t isaac_frame_opaque_4217a0_end_va(void);
uint32_t isaac_frame_opaque_4217a0_next_va(void);

/* ===========================================================================
 * FUN_004218e0 delegate-table bitmap constructor — ABI v40
 *
 * Body VA 0x004218e0.. (SEH+GS prologue; large 0x9f8 frame; this=ecx,
 * arg id = [ebp+8]; no exact ZHL). 8 direct E8 callers
 * (0x691c45..0x6f8579). Builds a 0x25-record delegate table (each
 * record 0x3c bytes at this+0x28 + i*0x3c) via an xorshift(3,13,7)
 * hash CHAIN seeded from the input id, then inits the +0x8ac / +0x8bc
 * 0x68-entry bitmap arrays (0x423090 BY REFERENCE), then moves bits
 * between the two bitmaps per the id bitmask (btr/bts transfer).
 * Pure law (PE VAs):
 *   hash_step(x):                          (0x421944..0x421973)
 *     edx = (x >> 3) ^ x                   (shr edx,cl cl=3 rdata b1f600lo0x3)
 *     eax = (edx << 13) ^ edx              (shl eax,cl cl=13 rdata b1f600+4lo0xd)
 *     x'  = (eax >> 7) ^ eax               (shr esi,cl cl=7 rdata b1f608lo0x7)
 *   record[i] = hash^i(id), i in [0,0x25)   (stored [edi]=x' at 0x42197a;
 *     edi += 0x3c per iter; ESI feedback = prior x')
 *   per-record consts: [rec+4] qword rdata 0xb1f594; [rec+0xc] dword
 *     rdata 0xb1f59c
 * Bitmap transfer (0x4219c0..): per-0x68 bit id, word=idx>>5, bit=1<<
 * (idx&0x1f); read A[word]; if A has bit (btr) -> B[word] |= bit (bts)
 * else B[word] &= ~bit (btr) — moves the membership bit A->B.
 * Host leaves: 0x423090 (bitmap array init), 0x423020 (vector dtor),
 * 0x4149d0 (vector destroy), logger 0xa112c0 (null-arg fatal).
 * Exported laws pure scalars. NARROWED not removed.
 * NEXT_VA 0x00421a1d-appropriately (bitmap sweep tail) -> full band
 * continues; entry body ends at ret; recorded 0x00421a20.
 * =========================================================================== */

enum { ISAAC_FRAME_OPAQUE_4218E0_HOST_VA = 0x004218e0u };
enum { ISAAC_FRAME_OPAQUE_4218E0_RECORD_COUNT = 0x25 };
enum { ISAAC_FRAME_OPAQUE_4218E0_RECORD_STRIDE = 0x3c };
enum { ISAAC_FRAME_OPAQUE_4218E0_RECORDS_OFF = 0x28 };
enum { ISAAC_FRAME_OPAQUE_4218E0_SHIFT_1 = 3 };
enum { ISAAC_FRAME_OPAQUE_4218E0_SHIFT_2 = 13 };
enum { ISAAC_FRAME_OPAQUE_4218E0_SHIFT_3 = 7 };
enum { ISAAC_FRAME_OPAQUE_4218E0_CONST0_LO = 0x02 };
enum { ISAAC_FRAME_OPAQUE_4218E0_CONST0_HI = 0x15 };
enum { ISAAC_FRAME_OPAQUE_4218E0_CONST1 = 0x09 };
/* bitmap: records +0x8ac/+0x8bc (shared 421b50/421720 contract),
   count at +0x8b8 == 0x68. */
enum { ISAAC_FRAME_OPAQUE_4218E0_BITMAP_A_OFF = 0x8ac };
enum { ISAAC_FRAME_OPAQUE_4218E0_BITMAP_B_OFF = 0x8bc };
enum { ISAAC_FRAME_OPAQUE_4218E0_BITMAP_COUNT_OFF = 0x8b8 };
enum { ISAAC_FRAME_OPAQUE_4218E0_BITMAP_COUNT = 0x68 };
enum { ISAAC_FRAME_OPAQUE_4218E0_FILL_VA = 0x00423090u };

uint32_t isaac_frame_opaque_4218e0_hash_step(uint32_t x);
uint32_t isaac_frame_opaque_4218e0_chain_value(uint32_t id, uint32_t i);
uint32_t isaac_frame_opaque_4218e0_record_count(void);
uint32_t isaac_frame_opaque_4218e0_record_stride(void);
uint32_t isaac_frame_opaque_4218e0_records_off(void);
uint32_t isaac_frame_opaque_4218e0_bitmap_a_off(void);
uint32_t isaac_frame_opaque_4218e0_bitmap_b_off(void);
uint32_t isaac_frame_opaque_4218e0_bitmap_count_off(void);
uint32_t isaac_frame_opaque_4218e0_bitmap_count(void);
uint32_t isaac_frame_opaque_4218e0_fill_va(void);
int32_t isaac_frame_opaque_4218e0_bit_transfer_a(uint32_t word_a,
                                                 uint32_t bit);
int32_t isaac_frame_opaque_4218e0_bit_transfer_b(uint32_t word_b,
                                                 uint32_t bit);
uint32_t isaac_frame_opaque_4218e0_host_va(void);

/* ===========================================================================
 * FUN_004218e0 tail — Fisher-Yates delegate-table shuffle — ABI v41
 *
 * The 0x4218e0 constructor's shuffle loop (0x421a50..0x421b43, ret 4;
 * part of the already-landed v40 body's tail). For each collection
 * (stride 0x3c record-group): if [group] != [group+4] (non-empty
 * vector), init the PRNG with [group+0x10] seed (0x8fd3c0), then
 * Fisher-Yates over the records: count = magic-div(span), i.e.
 * ~floor(span/0x14) - 1 (records-1, the PE's 0x66666667 magic at
 * 0x421a73..0x421a85); loop gate test/count jle 0x421b1b (count<=0
 * means a single record: nothing to shuffle). For i (esi) = count..1:
 *   j = PRNG_next() % ebx (div ebx; ebx = esi+1 descends count+1..2;
 *     0x8fd410 host PRNG)
 *   if j != i: swap slice [base + j*0x14] <-> [base + i*0x14]
 *     (0x14-byte records: movups 16 B at +0 across 16 B, dword +0x10;
 *     i index base is count*5*4 = count*0x14, decremented by 0x14)
 * Pure laws (host resolves the PRNG word):
 *   count = the PE magic div 0x66666667 (imul/sar edx,3 on the 32-BIT
 *     high reg/shr 0x1f/dec/add) — NOT a plain /5: the 32-bit-high
 *     quantization shows 0/1 variance vs any closed form at large spans,
 *     so it is transcribed exactly and pinned (verified vs a second
 *     python transcription, 500k draws, 0 mismatch). Falls out as
 *     floor(span/0x14)-1 for spans large enough to quantize cleanly.
 *   slot_off(idx) = idx * 0x14
 *   swap_index(word, divisor) = word % divisor (div ebx, unsigned;
 *     divisor = current esi+1; the PE guards j != i via [cmp esi,edx;
 *     je skip-swap])
 * Host leaves: 0x8fd3c0 PRNG init, 0x8fd410 PRNG next, 0x421bf0,
 *   0x8f4890. NARROWED not removed. The body's tail is
 *   0x00421a50..0x00421b43; the 0x421b50 bit-merge is the v30-landed
 *   421b50 body.
 * =========================================================================== */

enum { ISAAC_FRAME_OPAQUE_SHUFFLE_LOOP_VA = 0x00421a50u };
enum { ISAAC_FRAME_OPAQUE_SHUFFLE_END_VA = 0x00421b43u };
enum { ISAAC_FRAME_OPAQUE_SHUFFLE_COLLECTION_STRIDE = 0x3c };
enum { ISAAC_FRAME_OPAQUE_SHUFFLE_RECORD_SIZE = 0x14 };
enum { ISAAC_FRAME_OPAQUE_SHUFFLE_MAGIC = 0x66666667u };
enum { ISAAC_FRAME_OPAQUE_SHUFFLE_PRNG_INIT_VA = 0x008fd3c0u };
enum { ISAAC_FRAME_OPAQUE_SHUFFLE_PRNG_NEXT_VA = 0x008fd410u };
enum { ISAAC_FRAME_OPAQUE_SHUFFLE_PRNG_BOUND = 0x270 };

/* ABI v42: FUN_004253b0 / FUN_004253c0 / FUN_004253d0 — the pure
   player-id-vector getter/walk trio between the 4257b0 gates and the
   4257b0 Pass B player scans. All three bodies are FULLY PURE (zero
   calls, zero stores; direct E8 callers 14 / 1 / 24). They read only
   family-known fields: +0x13c0 player char (4257B0_PLAYER_CHAR_OFF),
   +0x1baa8 id vector (4257B0_ID_VEC_OFF), +0x1618 player id
   (PLAYER_ID_OFF), +0xc entry id (MP_ENTRY_ID_OFF), and the Game
   (0xc71678) / manager (0xc7169c) globals. */
enum { ISAAC_FRAME_OPAQUE_4253B0_VA = 0x004253b0u };
enum { ISAAC_FRAME_OPAQUE_4253B0_END_VA = 0x004253b6u };
enum { ISAAC_FRAME_OPAQUE_4253B0_CALL_SITES = 14 };
enum { ISAAC_FRAME_OPAQUE_4253B0_CHAR_OFF = 0x13c0 };
enum { ISAAC_FRAME_OPAQUE_4253C0_VA = 0x004253c0u };
enum { ISAAC_FRAME_OPAQUE_4253C0_END_VA = 0x004253cau };
enum { ISAAC_FRAME_OPAQUE_4253C0_CALL_SITES = 1 };
enum { ISAAC_FRAME_OPAQUE_4253C0_MANAGER_ADD = 0x4a920 };
enum { ISAAC_FRAME_OPAQUE_4253D0_VA = 0x004253d0u };
enum { ISAAC_FRAME_OPAQUE_4253D0_END_VA = 0x0042540du };
enum { ISAAC_FRAME_OPAQUE_4253D0_CALL_SITES = 24 };
enum { ISAAC_FRAME_OPAQUE_4253D0_ID_VEC_OFF = 0x1baa8 };
enum { ISAAC_FRAME_OPAQUE_4253D0_ID_VEC_END_OFF = 0x1baac };
enum { ISAAC_FRAME_OPAQUE_4253D0_KEY_OFF = 0xc };
enum { ISAAC_FRAME_OPAQUE_4253D0_ELEM_ID_OFF = 0x1618 };

/* ABI v43: FUN_00421800 / FUN_00424530 / FUN_00423950 / FUN_00423960 /
   FUN_00423970 — the tiny fully-pure getter/gate band between the
   4217a0 bitmap membership and the 4257b0 id machinery — plus the
   NARROWED FUN_00425430 copy-constructor. The five getter bodies are
   FULLY PURE (zero calls, zero stores; direct E8 callers 47 / 184 /
   3 / 3 / 2): 421800 lea eax,[ecx+0x14] (pointer field getter),
   424530 mov eax,ecx (identity), 423950 mov eax,[ecx+0x1618]
   (player-id getter, same field as 4253D0_ELEM_ID_OFF), 423960
   mov eax,[ecx+0x4b3d8]; cmp eax,[ecx+0x4b3dc]; setne al (MP-vec
   nonempty — eax returns begin with only al overlaid), 423970
   mov eax,[ecx+0x378]; test; je DEADBEEF; mov eax,[eax+0xc] (RTTI
   subobject entry-getter with the 0xdeadbeef null marker; +0x378 is
   RTTI_FIELD_378_OFF, +0xc is MP_ENTRY_ID_OFF). FUN_00425430 (1
   caller 0x6f365d, SEH+GS) is NARROWED: its copy prologue+loop
   (k = 0..0x15 dword [base+0x34k+4] = [base+0x34k]), the byte-zero
   store [this+0x450] = 0 (dl after the countdown), and the 0xaef638
   init-call contract (dest this+0xc, elem 0x34, count 0x15, cookie
   0x425410) are pure; the 0xaef638 runtime helper and the 0x4265d0
   subobject init call stay host. */
enum { ISAAC_FRAME_OPAQUE_421800_VA = 0x00421800u };
enum { ISAAC_FRAME_OPAQUE_421800_END_VA = 0x00421804u };
enum { ISAAC_FRAME_OPAQUE_421800_CALL_SITES = 47 };
enum { ISAAC_FRAME_OPAQUE_421800_FIELD_OFF = 0x14 };
enum { ISAAC_FRAME_OPAQUE_424530_VA = 0x00424530u };
enum { ISAAC_FRAME_OPAQUE_424530_END_VA = 0x00424533u };
enum { ISAAC_FRAME_OPAQUE_424530_CALL_SITES = 184 };
enum { ISAAC_FRAME_OPAQUE_423950_VA = 0x00423950u };
enum { ISAAC_FRAME_OPAQUE_423950_END_VA = 0x00423957u };
enum { ISAAC_FRAME_OPAQUE_423950_CALL_SITES = 3 };
enum { ISAAC_FRAME_OPAQUE_423960_VA = 0x00423960u };
enum { ISAAC_FRAME_OPAQUE_423960_END_VA = 0x00423970u };
enum { ISAAC_FRAME_OPAQUE_423960_CALL_SITES = 3 };
enum { ISAAC_FRAME_OPAQUE_423960_VEC_OFF = 0x4b3d8 };
enum { ISAAC_FRAME_OPAQUE_423960_VEC_END_OFF = 0x4b3dc };
enum { ISAAC_FRAME_OPAQUE_423970_VA = 0x00423970u };
enum { ISAAC_FRAME_OPAQUE_423970_END_VA = 0x00423984u };
enum { ISAAC_FRAME_OPAQUE_423970_CALL_SITES = 2 };
enum { ISAAC_FRAME_OPAQUE_423970_RTTI_OFF = 0x378 };
enum { ISAAC_FRAME_OPAQUE_423970_ENTRY_OFF = 0xc };
enum { ISAAC_FRAME_OPAQUE_423970_NULL_MARKER = 0xdeadbeefu };
enum { ISAAC_FRAME_OPAQUE_425430_VA = 0x00425430u };
enum { ISAAC_FRAME_OPAQUE_425430_END_VA = 0x0042549eu };
enum { ISAAC_FRAME_OPAQUE_425430_CALL_SITES = 1 };
enum { ISAAC_FRAME_OPAQUE_425430_CALLER_VA = 0x006f365du };
enum { ISAAC_FRAME_OPAQUE_425430_COUNT = 0x15 };
enum { ISAAC_FRAME_OPAQUE_425430_STRIDE = 0x34 };
enum { ISAAC_FRAME_OPAQUE_425430_COPY_SHIFT = 4 };
enum { ISAAC_FRAME_OPAQUE_425430_ZERO_BYTE_OFF = 0x450 };
enum { ISAAC_FRAME_OPAQUE_425430_INIT_DEST_OFF = 0xc };
enum { ISAAC_FRAME_OPAQUE_425430_INIT_COOKIE = 0x00425410u };
enum { ISAAC_FRAME_OPAQUE_425430_HELPER_VA = 0x00aef638u };
enum { ISAAC_FRAME_OPAQUE_425430_SUB_CALL_VA = 0x004265d0u };

/* ABI v44: FUN_004254b0 — the NARROWED frame-opaque filter between the
   425430 copy-ctor and the landed 4257b0 machinery (2 direct E8 callers
   0x90cffc / 0x8ca67c; the 0x90cffc site passes this = Game+0x1bbe0 —
   the SAME LIST_RECEIVER_OFF as 4257b0). SEH+GS body, first ret
   0x4257ab, 5 E8: family-pure 0x90abf0 (landed 24-caller export) +
   host 0xaf08bd / 0xaef15c / 0x4267f0 x2; 1 indirect (0xb18894
   invalid_parameter, noreturn). NARROWED: memory host-owned (mp vec,
   this->vec, 21-row table, scratch pair container), scalar laws
   exported. Pass A pops trailing non-matching this->vec elements
   (stride 0x68) gated on the mp-vec 90abf0 walk while count > 4.
   Pass B filters this->vec against 21 rows (base this+0x28, stride
   0x34): row[-4] kind != 0x16, comiss/ucomiss (NaN) window law over
   f = elem[+0xc] vs f_row(row+4) / prev_f (monotone, per-path
   direction), signed trunc < d_row(row+8) reject, b0/b1 low-byte
   gates; copies accepted pairs into the row's +0xc vector and sets
   byte [this+0x450] = 1. The 0xbaacbc float is 2147483648.0f
   (0x4f000000). Scratch free reuses the landed allocator law. */
enum { ISAAC_FRAME_OPAQUE_4254B0_VA = 0x004254b0u };
enum { ISAAC_FRAME_OPAQUE_4254B0_END_VA = 0x004257acu };
enum { ISAAC_FRAME_OPAQUE_4254B0_CALL_SITES = 2 };
enum { ISAAC_FRAME_OPAQUE_4254B0_CALLER1_VA = 0x0090cffcu };
enum { ISAAC_FRAME_OPAQUE_4254B0_CALLER2_VA = 0x008ca67cu };
enum { ISAAC_FRAME_OPAQUE_4254B0_MANAGER_SLOT_VA = 0x00c7169cu };
enum { ISAAC_FRAME_OPAQUE_4254B0_MP_VEC_OFF = 0x4b3d8 };
enum { ISAAC_FRAME_OPAQUE_4254B0_MP_VEC_END_OFF = 0x4b3dc };
enum { ISAAC_FRAME_OPAQUE_4254B0_ELEM_STRIDE = 0x68 };
enum { ISAAC_FRAME_OPAQUE_4254B0_ELEM_FLOAT_OFF = 0xc };
enum { ISAAC_FRAME_OPAQUE_4254B0_ELEM_PAIR_OFF = 0x0 };
enum { ISAAC_FRAME_OPAQUE_4254B0_ELEM_PAIR_HI_OFF = 0x4 };
enum { ISAAC_FRAME_OPAQUE_4254B0_TRAILING_MIN_COUNT = 4 };
enum { ISAAC_FRAME_OPAQUE_4254B0_DIV_MAGIC = 0x4ec4ec4fu };
enum { ISAAC_FRAME_OPAQUE_4254B0_DIV_SHIFT = 5 };
enum { ISAAC_FRAME_OPAQUE_4254B0_ROW_BASE_OFF = 0x28 };
enum { ISAAC_FRAME_OPAQUE_4254B0_ROW_STRIDE = 0x34 };
enum { ISAAC_FRAME_OPAQUE_4254B0_ROW_COUNT = 0x15 };
enum { ISAAC_FRAME_OPAQUE_4254B0_ROW_KIND_OFF = -4 };
enum { ISAAC_FRAME_OPAQUE_4254B0_ROW_SKIP_KIND = 0x16 };
enum { ISAAC_FRAME_OPAQUE_4254B0_ROW_B0_OFF = 0x0 };
enum { ISAAC_FRAME_OPAQUE_4254B0_ROW_B1_OFF = 0x1 };
enum { ISAAC_FRAME_OPAQUE_4254B0_ROW_FLOAT_OFF = 0x4 };
enum { ISAAC_FRAME_OPAQUE_4254B0_ROW_DWORD_OFF = 0x8 };
enum { ISAAC_FRAME_OPAQUE_4254B0_ROW_VEC_OFF = 0xc };
enum { ISAAC_FRAME_OPAQUE_4254B0_XMM1_DEFAULT_BITS = 0x4f000000u };
enum { ISAAC_FRAME_OPAQUE_4254B0_XMM1_DEFAULT_VA = 0x00baacbcu };
enum { ISAAC_FRAME_OPAQUE_4254B0_FINAL_BYTE_OFF = 0x450 };
enum { ISAAC_FRAME_OPAQUE_4254B0_FINAL_BYTE_VALUE = 1 };
enum { ISAAC_FRAME_OPAQUE_4254B0_GATE_VA = 0x0090abf0u };
enum { ISAAC_FRAME_OPAQUE_4254B0_HOST_AF08BD_VA = 0x00af08bdu };
enum { ISAAC_FRAME_OPAQUE_4254B0_HOST_AEF15C_VA = 0x00aef15cu };
enum { ISAAC_FRAME_OPAQUE_4254B0_HOST_4267F0_VA = 0x004267f0u };
enum {
  ISAAC_FRAME_OPAQUE_4254B0_FILTER_REJECT = 0,
  ISAAC_FRAME_OPAQUE_4254B0_FILTER_NO_COPY = 1,
  ISAAC_FRAME_OPAQUE_4254B0_FILTER_COPY = 2,
  ISAAC_FRAME_OPAQUE_4254B0_FILTER_COPY_RESET = 3
};

/* ABI v45: FUN_004239b0 (0x4239b0..0x423a8f, ret 4), pure thiscall
   state initializer behind the v43 0x423970 getter band. 5 direct rel32
   callers (0x4239a3 wrapper, 0x8ca647, 0x95e8b9, 0x987502, 0x99981e);
   process-input cutscene family already treats it as HOST
   (isaac_cutscene_95e7c0_host_4239b0_va) — NARROWED here. 0 E8,
   19 mem stores, byte arg [ebp+8] (ret 4). LAW: two mirrored blocks
   (A +0x114..+0x12c, B +0x244..+0x268, delta 0x130); 17 unique store
   offsets; the ONLY decision is the LOW byte of the stack arg:
   (arg & 0xff) != 0 clears +0x118/+0x248 to 0, else keeps 0x42c00000
   (96.0f). f32 pool: 0xc7b640/b644 never written image-wide (absolute
   store-opcode census 0 sites; 800+ load sites). */
enum { ISAAC_FRAME_OPAQUE_4239B0_VA = 0x004239b0u };
enum { ISAAC_FRAME_OPAQUE_4239B0_END_VA = 0x00423a92u };
enum { ISAAC_FRAME_OPAQUE_4239B0_CALL_SITES = 5 };
enum { ISAAC_FRAME_OPAQUE_4239B0_CALLER1_VA = 0x004239a3u };
enum { ISAAC_FRAME_OPAQUE_4239B0_CALLER2_VA = 0x008ca647u };
enum { ISAAC_FRAME_OPAQUE_4239B0_CALLER3_VA = 0x0095e8b9u };
enum { ISAAC_FRAME_OPAQUE_4239B0_CALLER4_VA = 0x00987502u };
enum { ISAAC_FRAME_OPAQUE_4239B0_CALLER5_VA = 0x0099981eu };
/* f32 pools loaded via movss [0xc7b640] / [0xc7b644] (.data, raw
   0x7f6000 + (va - 0xbf8000)); store-writer census: zero absolute
   store sites image-wide. */
enum { ISAAC_FRAME_OPAQUE_4239B0_F32_0_VA = 0x00c7b640u };
enum { ISAAC_FRAME_OPAQUE_4239B0_F32_1_VA = 0x00c7b644u };
enum { ISAAC_FRAME_OPAQUE_4239B0_F32_0_BITS = 0x3760371cu };
enum { ISAAC_FRAME_OPAQUE_4239B0_F32_1_BITS = 0x37873770u };
enum { ISAAC_FRAME_OPAQUE_4239B0_CLEAR_DEFAULT = 0x42c00000u };
enum { ISAAC_FRAME_OPAQUE_4239B0_DEFAULT_96_BITS = 0x42c00000u };
enum { ISAAC_FRAME_OPAQUE_4239B0_ONE_BITS = 0x3f800000u };
enum { ISAAC_FRAME_OPAQUE_4239B0_COUNT_15 = 0x0fu };
enum { ISAAC_FRAME_OPAQUE_4239B0_COUNT_14 = 0x0eu };
enum { ISAAC_FRAME_OPAQUE_4239B0_BYTE_ONE = 1u };
enum { ISAAC_FRAME_OPAQUE_4239B0_BLOCK_DELTA = 0x130u };
enum { ISAAC_FRAME_OPAQUE_4239B0_OFF_114 = 0x114u };
enum { ISAAC_FRAME_OPAQUE_4239B0_OFF_118 = 0x118u };
enum { ISAAC_FRAME_OPAQUE_4239B0_OFF_11C = 0x11cu };
enum { ISAAC_FRAME_OPAQUE_4239B0_OFF_120 = 0x120u };
enum { ISAAC_FRAME_OPAQUE_4239B0_OFF_124 = 0x124u };
enum { ISAAC_FRAME_OPAQUE_4239B0_OFF_128 = 0x128u };
enum { ISAAC_FRAME_OPAQUE_4239B0_OFF_12C = 0x12cu };
enum { ISAAC_FRAME_OPAQUE_4239B0_OFF_244 = 0x244u };
enum { ISAAC_FRAME_OPAQUE_4239B0_OFF_248 = 0x248u };
enum { ISAAC_FRAME_OPAQUE_4239B0_OFF_24C = 0x24cu };
enum { ISAAC_FRAME_OPAQUE_4239B0_OFF_250 = 0x250u };
enum { ISAAC_FRAME_OPAQUE_4239B0_OFF_254 = 0x254u };
enum { ISAAC_FRAME_OPAQUE_4239B0_OFF_258 = 0x258u };
enum { ISAAC_FRAME_OPAQUE_4239B0_OFF_25C = 0x25cu };
enum { ISAAC_FRAME_OPAQUE_4239B0_OFF_260 = 0x260u };
enum { ISAAC_FRAME_OPAQUE_4239B0_OFF_264 = 0x264u };
enum { ISAAC_FRAME_OPAQUE_4239B0_OFF_268 = 0x268u };
enum { ISAAC_FRAME_OPAQUE_4239B0_OFF_COUNT = 17u }; /* unique offsets */
/* 0x42c00000 = 96.0f (the keep-default of the +0x118/+0x248 gate). */

/* ABI v46: FUN_00423990 wrapper (0x423990..0x4239ac ret, 21 insns,
   thiscall, 1 direct rel32 caller 0x952783) + FUN_00423aa0 SEH+GS body
   (0x423aa0..0x423cb3 ret plain, 182 insns, 2 callers 0x42399a /
   0x954739; SEH cookie 0xaf18ad, GS global 0xbf93b4, GS check via
   0xaef12b). Wrapper conduct: SEH body FIRST (0x423aa0), then the
   landed v45 init 0x4239b0 with CONSTANT arg 0 -> keep 96.0f. SEH body:
   2-iteration loop (this + 0x130*i) building a 30-char anm2 path
   ("gfx/ui/ButtonPromptWidget.anm2" @ .rdata 0xb1c210) + HOST
   0x40bd50 assign + allocator free (cap 0x1f >= 0x10 -> free; big path
   when cap+1 >= 0x1000; header delta <= 0x1f else invalid_parameter
   0xb18894 INDIRECT); then LeftPrompt/RightPrompt insert gates
   (str obj ptrs this+0x34 / this+0x164, strcmp vs .rdata 0xb1c230 /
   0xb1c23c, byte flags obj+0x34 / this+0x44 / this+0x174) with HOST
   0x40a5d0 + 0x40a1b0. 8 E8 + 1 indirect stay HOST (NARROWED). */
enum { ISAAC_FRAME_OPAQUE_423990_VA = 0x00423990u };
enum { ISAAC_FRAME_OPAQUE_423990_END_VA = 0x004239adu };
enum { ISAAC_FRAME_OPAQUE_423990_CALL_SITES = 1 };
enum { ISAAC_FRAME_OPAQUE_423990_CALLER1_VA = 0x00952783u };
enum { ISAAC_FRAME_OPAQUE_423990_SEH_VA = 0x00423aa0u };
enum { ISAAC_FRAME_OPAQUE_423990_INIT_VA = 0x004239b0u };
enum { ISAAC_FRAME_OPAQUE_423990_INIT_ARG = 0u };
enum { ISAAC_FRAME_OPAQUE_423AA0_VA = 0x00423aa0u };
enum { ISAAC_FRAME_OPAQUE_423AA0_END_VA = 0x00423cb4u };
enum { ISAAC_FRAME_OPAQUE_423AA0_CALL_SITES = 2 };
enum { ISAAC_FRAME_OPAQUE_423AA0_CALLER1_VA = 0x0042399au };
enum { ISAAC_FRAME_OPAQUE_423AA0_CALLER2_VA = 0x00954739u };
enum { ISAAC_FRAME_OPAQUE_423AA0_ITERATIONS = 2u };
enum { ISAAC_FRAME_OPAQUE_423AA0_STRIDE = 0x130u };
enum { ISAAC_FRAME_OPAQUE_423AA0_LOCAL_CAP = 0x1fu };
enum { ISAAC_FRAME_OPAQUE_423AA0_LOCAL_SIZE = 0x1eu };
enum { ISAAC_FRAME_OPAQUE_423AA0_ALLOC_ARG = 0x20u };
enum { ISAAC_FRAME_OPAQUE_423AA0_PUSH_ARG = 1u };
enum { ISAAC_FRAME_OPAQUE_423AA0_FREE_MIN_CAP = 0x10u };
enum { ISAAC_FRAME_OPAQUE_423AA0_BIG_THRESHOLD = 0x1000u };
enum { ISAAC_FRAME_OPAQUE_423AA0_HEADER_BIAS = 0x23u };
enum { ISAAC_FRAME_OPAQUE_423AA0_DELTA_MAX = 0x1fu };
enum { ISAAC_FRAME_OPAQUE_423AA0_LEFT_STR_OFF = 0x34u };
enum { ISAAC_FRAME_OPAQUE_423AA0_RIGHT_STR_OFF = 0x164u };
enum { ISAAC_FRAME_OPAQUE_423AA0_STR_CAP_OFF = 0x14u };
enum { ISAAC_FRAME_OPAQUE_423AA0_STR_BYTE_OFF = 0x34u };
enum { ISAAC_FRAME_OPAQUE_423AA0_LEFT_FLAG_OFF = 0x44u };
enum { ISAAC_FRAME_OPAQUE_423AA0_RIGHT_FLAG_OFF = 0x174u };
enum { ISAAC_FRAME_OPAQUE_423AA0_LEFT_AFTER_OFF = 0x30u };
enum { ISAAC_FRAME_OPAQUE_423AA0_RIGHT_RECV_OFF = 0x130u };
enum { ISAAC_FRAME_OPAQUE_423AA0_RIGHT_AFTER_OFF = 0x160u };
enum { ISAAC_FRAME_OPAQUE_423AA0_LOCAL_POOL_VA = 0x00b1c210u };
enum { ISAAC_FRAME_OPAQUE_423AA0_LEFT_POOL_VA = 0x00b1c230u };
enum { ISAAC_FRAME_OPAQUE_423AA0_RIGHT_POOL_VA = 0x00b1c23cu };
enum { ISAAC_FRAME_OPAQUE_423AA0_HOST_ALLOC_VA = 0x0040cf00u };
enum { ISAAC_FRAME_OPAQUE_423AA0_HOST_ASSIGN_VA = 0x0040bd50u };
enum { ISAAC_FRAME_OPAQUE_423AA0_HOST_FREE_VA = 0x00aef15cu };
enum { ISAAC_FRAME_OPAQUE_423AA0_HOST_INSERT_VA = 0x0040a5d0u };
enum { ISAAC_FRAME_OPAQUE_423AA0_HOST_AFTER_VA = 0x0040a1b0u };
enum { ISAAC_FRAME_OPAQUE_423AA0_HOST_GS_VA = 0x00aef12bu };
enum { ISAAC_FRAME_OPAQUE_423AA0_HOST_INVALID_PARAM_VA = 0x00b18894u };
enum { ISAAC_FRAME_OPAQUE_423AA0_GS_COOKIE = 0xaf18adu };
enum { ISAAC_FRAME_OPAQUE_423AA0_GS_COOKIE_GLOBAL_VA = 0x00bf93b4u };
/* SSO pick: cap < 0x10 -> data at str obj start; else data ptr [obj]. */
enum { ISAAC_FRAME_OPAQUE_423AA0_SSO_INLINE = 1u };
enum { ISAAC_FRAME_OPAQUE_423AA0_SSO_HEAP = 0u };

/* ABI v47: FUN_00423cc0 slot band (0x423cc0..0x4240ad ret, 1 caller
   0x955c85). SEH+GS body: 2-iteration loop (this+0x11c + 0x130*i) with
   layer lookup "Text" (0xb1c208), PURE 0x424130 vec selection, render
   gates, slot skip, bounds/entry table law, and two struct fills.
   12 E8 + 5 indirect stay HOST (NARROWED). See NOTES.md v47. */
enum { ISAAC_FRAME_OPAQUE_423CC0_VA = 0x00423cc0u };
enum { ISAAC_FRAME_OPAQUE_423CC0_END_VA = 0x004240aeu };
enum { ISAAC_FRAME_OPAQUE_423CC0_CALL_SITES = 1u };
enum { ISAAC_FRAME_OPAQUE_423CC0_CALLER1_VA = 0x00955c85u };
enum { ISAAC_FRAME_OPAQUE_423CC0_SEH_COOKIE = 0xaf1900u };
enum { ISAAC_FRAME_OPAQUE_423CC0_GS_COOKIE_GLOBAL_VA = 0x00bf93b4u };
enum { ISAAC_FRAME_OPAQUE_423CC0_ITERATIONS = 2u };
enum { ISAAC_FRAME_OPAQUE_423CC0_STRIDE = 0x130u };
enum { ISAAC_FRAME_OPAQUE_423CC0_SLOT_BASE_OFF = 0x11cu };
enum { ISAAC_FRAME_OPAQUE_423CC0_FLOAT_SRC_OFF = 0x260u };
enum { ISAAC_FRAME_OPAQUE_423CC0_FLOAT_STORE_LO_OFF = 0x9cu };
enum { ISAAC_FRAME_OPAQUE_423CC0_FLOAT_STORE_HI_OFF = 0xa0u };
enum { ISAAC_FRAME_OPAQUE_423CC0_SCALE_RDATA_VA = 0x00baa528u };
enum { ISAAC_FRAME_OPAQUE_423CC0_SCALE_F32_BITS = 0x3fc00000u };
enum { ISAAC_FRAME_OPAQUE_423CC0_MODE_BIT_GLOBAL_VA = 0x00c798e4u };
enum { ISAAC_FRAME_OPAQUE_423CC0_MODE_BIT_MASK = 4u };
enum { ISAAC_FRAME_OPAQUE_423CC0_MODE_OFF = 1u };
enum { ISAAC_FRAME_OPAQUE_423CC0_MODE_ON = 6u };
enum { ISAAC_FRAME_OPAQUE_423CC0_STORE_INIT_VA = 0x00c79900u };
enum { ISAAC_FRAME_OPAQUE_423CC0_STORE_MODE_VA = 0x00c79904u };
enum { ISAAC_FRAME_OPAQUE_423CC0_STORE_B_VA = 0x00c79908u };
enum { ISAAC_FRAME_OPAQUE_423CC0_STORE_C_VA = 0x00c7990cu };
enum { ISAAC_FRAME_OPAQUE_423CC0_STORE_D_VA = 0x00c79910u };
enum { ISAAC_FRAME_OPAQUE_423CC0_SLOT_TYPE_OFF = 8u };
enum { ISAAC_FRAME_OPAQUE_423CC0_SLOT_BYTE4_OFF = 4u };
enum { ISAAC_FRAME_OPAQUE_423CC0_SKIP_TYPE = 0x20u };
enum { ISAAC_FRAME_OPAQUE_423CC0_RENDER_GATE_OFF = 0x109u };
enum { ISAAC_FRAME_OPAQUE_423CC0_ORDER_GATE_OFF = 0x70u };
enum { ISAAC_FRAME_OPAQUE_423CC0_RENDER_A_OFF = 0x50u };
enum { ISAAC_FRAME_OPAQUE_423CC0_RENDER_B_OFF = 0x30u };
enum { ISAAC_FRAME_OPAQUE_423CC0_RENDER_VEC_VA = 0x00c7b640u };
enum { ISAAC_FRAME_OPAQUE_423CC0_LAYER_POOL_VA = 0x00b1c208u };
enum { ISAAC_FRAME_OPAQUE_423CC0_WARN_MSG_VA = 0x00b1a634u };
enum { ISAAC_FRAME_OPAQUE_423CC0_ASSERT_LEVEL = 4u };
enum { ISAAC_FRAME_OPAQUE_423CC0_HOST_MODE_DISPATCH_VA = 0x00424220u };
enum { ISAAC_FRAME_OPAQUE_423CC0_HOST_MGR_CALL_VA = 0x00a20390u };
enum { ISAAC_FRAME_OPAQUE_423CC0_HOST_LAYER_LOOKUP_VA = 0x0040b430u };
enum { ISAAC_FRAME_OPAQUE_423CC0_HOST_LAYER_ASSIGN_VA = 0x0040a7e0u };
enum { ISAAC_FRAME_OPAQUE_423CC0_HOST_ASSERT_VA = 0x00a112c0u };
enum { ISAAC_FRAME_OPAQUE_423CC0_HOST_RENDER_VA = 0x0040a030u };
enum { ISAAC_FRAME_OPAQUE_423CC0_HOST_POPUP_VA = 0x00af08b1u };
enum { ISAAC_FRAME_OPAQUE_423CC0_HOST_FLUSH_VA = 0x0095af30u };
enum { ISAAC_FRAME_OPAQUE_423CC0_HOST_STRINGIFY_VA = 0x00a0f550u };
enum { ISAAC_FRAME_OPAQUE_423CC0_HOST_VEC_HELPER_VA = 0x004240b0u };
enum { ISAAC_FRAME_OPAQUE_423CC0_HOST_COMBINE_VA = 0x00a1b050u };
enum { ISAAC_FRAME_OPAQUE_423CC0_INDIRECT_C57B18_VA = 0x00c57b18u };
enum { ISAAC_FRAME_OPAQUE_423CC0_INDIRECT_C7E814_VA = 0x00c7e814u };
enum { ISAAC_FRAME_OPAQUE_423CC0_AFTER_FN_OFF = 0x264u };
enum { ISAAC_FRAME_OPAQUE_423CC0_AFTER_ARG_OFF = 0x268u };
enum { ISAAC_FRAME_OPAQUE_423CC0_POPUP_LIT0_VA = 0x00c5d4c0u };
enum { ISAAC_FRAME_OPAQUE_423CC0_POPUP_LIT1_VA = 0x00c5d4ecu };
enum { ISAAC_FRAME_OPAQUE_423CC0_TYPE_EQ3 = 3u };
enum { ISAAC_FRAME_OPAQUE_423CC0_FLAG_BIT_MASK = 0x20u };
enum { ISAAC_FRAME_OPAQUE_423CC0_F32_ONE_BITS = 0x3f800000u };
enum { ISAAC_FRAME_OPAQUE_423CC0_ONES_FLOAT_DWORDS = 4u };
enum { ISAAC_FRAME_OPAQUE_423CC0_ONES_ZERO_BASE = 0x10u };
enum { ISAAC_FRAME_OPAQUE_423CC0_ONES_ZERO_DWORDS = 7u };
enum { ISAAC_FRAME_OPAQUE_423CC0_ONES_SIZE = 0x2cu };
enum { ISAAC_FRAME_OPAQUE_423CC0_ALT_0 = 4u };
enum { ISAAC_FRAME_OPAQUE_423CC0_ALT_1 = 0xffffu };
enum { ISAAC_FRAME_OPAQUE_423CC0_ALT_2 = 0u };
enum { ISAAC_FRAME_OPAQUE_423CC0_ALT_3 = 0x3f800000u };
enum { ISAAC_FRAME_OPAQUE_423CC0_ALT_4 = 0xffffffffu };
enum { ISAAC_FRAME_OPAQUE_423CC0_ALT_5 = 0u };
enum { ISAAC_FRAME_OPAQUE_423CC0_ALT_6 = 0u };
enum { ISAAC_FRAME_OPAQUE_423CC0_ALT_BYTES = 0x1cu };
enum { ISAAC_FRAME_OPAQUE_423CC0_STRINGIFY_ARG = 0xff362f2du };
enum { ISAAC_FRAME_OPAQUE_423CC0_SUB_OBJ_OFF = 0x4ae28u };
enum { ISAAC_FRAME_OPAQUE_423CC0_BEGIN_OFF = 0x10u };
enum { ISAAC_FRAME_OPAQUE_423CC0_END_OFF = 0x14u };
enum { ISAAC_FRAME_OPAQUE_423CC0_ENTRY_STRIDE = 0x10u };
enum { ISAAC_FRAME_OPAQUE_423CC0_RANGE_MSG_VA = 0x00b82e78u };
enum { ISAAC_FRAME_OPAQUE_423CC0_RANGE_LEVEL = 0x10u };
enum { ISAAC_FRAME_OPAQUE_423CC0_NONE_SENTINEL = 0xffffffffu };
enum { ISAAC_FRAME_OPAQUE_423CC0_NONE_PTR_VA = 0x00b6d124u };
enum { ISAAC_FRAME_OPAQUE_423CC0_GETTER_VTBL_OFF = 0x10u };
/* PURE sibling 0x424130 (0 E8 / 0 indirect; transcribed as vec law). */
enum { ISAAC_FRAME_OPAQUE_424130_VA = 0x00424130u };
enum { ISAAC_FRAME_OPAQUE_424130_END_VA = 0x0042420fu };
enum { ISAAC_FRAME_OPAQUE_424130_ITER_CASE_A = 0u };
enum { ISAAC_FRAME_OPAQUE_424130_ITER_CASE_B = 1u };
enum { ISAAC_FRAME_OPAQUE_424130_CASE_A_X_OFF = 0x128u };
enum { ISAAC_FRAME_OPAQUE_424130_CASE_A_SCALE_OFF = 0x114u };
enum { ISAAC_FRAME_OPAQUE_424130_CASE_A_Y_OFF = 0x12cu };
enum { ISAAC_FRAME_OPAQUE_424130_CASE_B_SCALE_OFF = 0x244u };
enum { ISAAC_FRAME_OPAQUE_424130_CASE_B_X_OFF = 0x258u };
enum { ISAAC_FRAME_OPAQUE_424130_CASE_B_Y_OFF = 0x25cu };
enum { ISAAC_FRAME_OPAQUE_424130_RDATA_A1_VA = 0x00baa7e8u };
enum { ISAAC_FRAME_OPAQUE_424130_RDATA_A2_VA = 0x00baa960u };
enum { ISAAC_FRAME_OPAQUE_424130_RDATA_B1_VA = 0x00baa9b0u };
enum { ISAAC_FRAME_OPAQUE_424130_RDATA_B2_VA = 0x00baa990u };
enum { ISAAC_FRAME_OPAQUE_424130_BSS_X_VA = 0x00c78dc4u };
enum { ISAAC_FRAME_OPAQUE_424130_BSS_Y_VA = 0x00c78edcu };
enum { ISAAC_FRAME_OPAQUE_424130_DEF_X_VA = 0x00c7b640u };
enum { ISAAC_FRAME_OPAQUE_424130_DEF_Y_VA = 0x00c7b644u };
/* FUN_004240b0 icon-pos composer (ABI v48): thiscall(out, idx) ret 8;
   5 callers 0x423ed1/0x423fa9 (inside 0x423cc0 band) + 0x8cb2a3 +
   0x95ec83/0x95ecf4. Calls PURE 0x424130 for the base vec, gates on
   [this+idx*0x130+0x34] (FULL-DWORD; walk 0x40ace0 with "IconPos"
   0xb1c248 when nonzero, else ecx=0 -> DEREF [0] null-path quirk),
   then out = f32(scale*vec + base), scale = [this+0x260], vec from
   walk result ptr +0/+4 (host-sampled). */
enum { ISAAC_FRAME_OPAQUE_4240B0_VA = 0x004240b0u };
enum { ISAAC_FRAME_OPAQUE_4240B0_END_VA = 0x00424120u };
enum { ISAAC_FRAME_OPAQUE_4240B0_CALL_SITES = 5u };
enum { ISAAC_FRAME_OPAQUE_4240B0_CALLER1_VA = 0x00423ed1u };
enum { ISAAC_FRAME_OPAQUE_4240B0_CALLER2_VA = 0x00423fa9u };
enum { ISAAC_FRAME_OPAQUE_4240B0_CALLER3_VA = 0x008cb2a3u };
enum { ISAAC_FRAME_OPAQUE_4240B0_CALLER4_VA = 0x0095ec83u };
enum { ISAAC_FRAME_OPAQUE_4240B0_CALLER5_VA = 0x0095ecf4u };
enum { ISAAC_FRAME_OPAQUE_4240B0_CALLEE_VA = 0x00424130u };
enum { ISAAC_FRAME_OPAQUE_4240B0_WALK_VA = 0x0040ace0u };
enum { ISAAC_FRAME_OPAQUE_4240B0_NAME_VA = 0x00b1c248u };
enum { ISAAC_FRAME_OPAQUE_4240B0_STRIDE = 0x130u };
enum { ISAAC_FRAME_OPAQUE_4240B0_GATE_OFF = 0x34u };
enum { ISAAC_FRAME_OPAQUE_4240B0_RECV_OFF = 0x30u };
enum { ISAAC_FRAME_OPAQUE_4240B0_SCALE_OFF = 0x260u };
/* FUN_00424220 mode dispatch (ABI v49): 0x424220..0x42429a ret, plain ret;
   2 callers 0x423d03 (423cc0 HOST_MODE_DISPATCH site) + 0x954f9e.
   idx = [obj+8]-1 (32-bit wrap); unsigned idx>4 -> DEFAULT; jmp table
   0x42429c: idx 0 -> CASE_A ([0xbf9444]); idx 3 -> DEFAULT; idx 1/2/4 ->
   CASE_B: gate [obj+0x4b3d8]==[obj+0x4b3dc] (FULL-DWORD, je) -> PATH2
   (net [0xc71678] null->DEFAULT; delta=[q+0x1baac]-[q+0x1baa8] wrap;
   test delta,0xfffffffc je DEFAULT; HOST 0x417870 Game::GetPlayer(0);
   [res+0x1618]) else PATH1 (HOST 0x90b070 thiscall(obj+0x4b3d8);
   [res+0x378] rtti; null->0xdeadbeef; else [rtti+0xc]). */
enum { ISAAC_FRAME_OPAQUE_424220_VA = 0x00424220u };
enum { ISAAC_FRAME_OPAQUE_424220_END_VA = 0x0042429bu };
enum { ISAAC_FRAME_OPAQUE_424220_TABLE_VA = 0x0042429cu };
enum { ISAAC_FRAME_OPAQUE_424220_CALL_SITES = 2u };
enum { ISAAC_FRAME_OPAQUE_424220_CALLER1_VA = 0x00423d03u };
enum { ISAAC_FRAME_OPAQUE_424220_CALLER2_VA = 0x00954f9eu };
enum { ISAAC_FRAME_OPAQUE_424220_OBJ_GLOBAL_VA = 0x00c7169cu };
enum { ISAAC_FRAME_OPAQUE_424220_MODE_OFF = 8u };
enum { ISAAC_FRAME_OPAQUE_424220_CASE_A_GLOBAL_VA = 0x00bf9444u };
enum { ISAAC_FRAME_OPAQUE_424220_MP_VEC_OFF = 0x4b3d8u };
enum { ISAAC_FRAME_OPAQUE_424220_MP_VEC_END_OFF = 0x4b3dcu };
enum { ISAAC_FRAME_OPAQUE_424220_RTTI_OFF = 0x378u };
enum { ISAAC_FRAME_OPAQUE_424220_RTTI_ENTRY_OFF = 0xcu };
enum { ISAAC_FRAME_OPAQUE_424220_NULL_MARKER = 0xdeadbeefu };
enum { ISAAC_FRAME_OPAQUE_424220_NET_GLOBAL_VA = 0x00c71678u };
enum { ISAAC_FRAME_OPAQUE_424220_DELTA_LO_OFF = 0x1baa8u };
enum { ISAAC_FRAME_OPAQUE_424220_DELTA_HI_OFF = 0x1baacu };
enum { ISAAC_FRAME_OPAQUE_424220_DELTA_MASK = 0xfffffffcu };
enum { ISAAC_FRAME_OPAQUE_424220_RESULT_ID_OFF = 0x1618u };
enum { ISAAC_FRAME_OPAQUE_424220_DEFAULT_RESULT = 0xffffffffu };
enum { ISAAC_FRAME_OPAQUE_424220_HOST1_VA = 0x0090b070u };
enum { ISAAC_FRAME_OPAQUE_424220_HOST2_VA = 0x00417870u };
enum { ISAAC_FRAME_OPAQUE_424220_DISPATCH_CASE_A = 0u };
enum { ISAAC_FRAME_OPAQUE_424220_DISPATCH_CASE_B = 1u };
enum { ISAAC_FRAME_OPAQUE_424220_DISPATCH_DEFAULT = 2u };
/* FUN_004242b0 SEH dispatch peel (ABI v50): 0x4242b0..0x424305 ret;
   SEH prologue (handler 0xaf0d10, cookie [0xbf93b4]); thiscall
   this=ecx; 0 E8, 2 INDIRECT calls; 8 callers. Body:
     sub = [this+4]
     if (sub != 0):                    test ecx,ecx / je — FULL-DWORD
        vtbl = [sub]; slot = [vtbl+0xc]; call slot    INDIRECT HOST vcall
        if (al != 0):                  test al,al / je — LOW-BYTE
           cb = [0xc7e814]
           if (cb != 0):               test eax,eax / je — FULL-DWORD
              push esi; call cb; add esp,4             INDIRECT HOST cdecl
   Shared indirect global 0xc7e814 (same pin as 423cc0). */
enum { ISAAC_FRAME_OPAQUE_4242B0_VA = 0x004242b0u };
enum { ISAAC_FRAME_OPAQUE_4242B0_END_VA = 0x00424306u };
enum { ISAAC_FRAME_OPAQUE_4242B0_CALL_SITES = 8u };
enum { ISAAC_FRAME_OPAQUE_4242B0_CALLER1_VA = 0x0068b361u };
enum { ISAAC_FRAME_OPAQUE_4242B0_CALLER2_VA = 0x00691fc9u };
enum { ISAAC_FRAME_OPAQUE_4242B0_CALLER3_VA = 0x00692059u };
enum { ISAAC_FRAME_OPAQUE_4242B0_CALLER4_VA = 0x0069211du };
enum { ISAAC_FRAME_OPAQUE_4242B0_CALLER5_VA = 0x00783285u };
enum { ISAAC_FRAME_OPAQUE_4242B0_CALLER6_VA = 0x00783359u };
enum { ISAAC_FRAME_OPAQUE_4242B0_CALLER7_VA = 0x008d2263u };
enum { ISAAC_FRAME_OPAQUE_4242B0_CALLER8_VA = 0x00989b52u };
enum { ISAAC_FRAME_OPAQUE_4242B0_SUB_OFF = 4u };
enum { ISAAC_FRAME_OPAQUE_4242B0_VTBL_CALL_OFF = 0xcu };
enum { ISAAC_FRAME_OPAQUE_4242B0_CB_GLOBAL_VA = 0x00c7e814u };
enum { ISAAC_FRAME_OPAQUE_4242B0_SEH_HANDLER_VA = 0x00af0d10u };
enum { ISAAC_FRAME_OPAQUE_4242B0_COOKIE_VA = 0x00bf93b4u };

/* FUN_00424310 SEH ctor peel (ABI v51): 0x424310..0x42441b ret (SEH
   handler 0xaf192d, cookie [0xbf93b4]; thiscall this=ecx; straight-line,
   no branches; 7 callers 0x6f1ba6/0x857000/0x950d7a/0x956b44/0x956c36/
   0x95c4f3/0x95c5d7 — `lea ecx,[x+0x10]; call` ctor pattern). Body:
     this+0x00 = 0 (dword); this+0x10 = 0; this+0x14 = 0xf (capacity);
     byte this+0x00 = 0; this+0x18/0x1c = 0 (pre-alloc);
     push 0x14; call 0xa0f4c0 (HOST alloc, NO null test);
     mov ecx,edi (thiscall receiver);
     [eax]=eax; [eax+4]=eax; [eax+8]=eax (node self-links);
     word [eax+0xc] = 0x101 (node magic WORD store);
     this+0x18 = node; this+0x20..0x34 (6), +0x48..0x50 (3),
     +0x8c..0xa0 (6) = 0; call 0x424440 (HOST sub-init, thiscall this).
   Final-state dword-zero offsets (18): 0x00, 0x10, 0x1c, 0x20, 0x24,
   0x28, 0x2c, 0x30, 0x34, 0x48, 0x4c, 0x50, 0x8c, 0x90, 0x94, 0x98,
   0x9c, 0xa0 (+0x18 = node, +0x14 = 0xf — NOT zero). */
enum { ISAAC_FRAME_OPAQUE_424310_VA = 0x00424310u };
enum { ISAAC_FRAME_OPAQUE_424310_END_VA = 0x0042441cu };
enum { ISAAC_FRAME_OPAQUE_424310_CALL_SITES = 7u };
enum { ISAAC_FRAME_OPAQUE_424310_CALLER1_VA = 0x006f1ba6u };
enum { ISAAC_FRAME_OPAQUE_424310_CALLER2_VA = 0x00857000u };
enum { ISAAC_FRAME_OPAQUE_424310_CALLER3_VA = 0x00950d7au };
enum { ISAAC_FRAME_OPAQUE_424310_CALLER4_VA = 0x00956b44u };
enum { ISAAC_FRAME_OPAQUE_424310_CALLER5_VA = 0x00956c36u };
enum { ISAAC_FRAME_OPAQUE_424310_CALLER6_VA = 0x0095c4f3u };
enum { ISAAC_FRAME_OPAQUE_424310_CALLER7_VA = 0x0095c5d7u };
enum { ISAAC_FRAME_OPAQUE_424310_SEH_HANDLER_VA = 0x00af192du };
enum { ISAAC_FRAME_OPAQUE_424310_COOKIE_VA = 0x00bf93b4u };
enum { ISAAC_FRAME_OPAQUE_424310_ALLOC_SIZE = 0x14u };
enum { ISAAC_FRAME_OPAQUE_424310_ALLOC_HOST_VA = 0x00a0f4c0u };
enum { ISAAC_FRAME_OPAQUE_424310_SUBINIT_HOST_VA = 0x00424440u };
enum { ISAAC_FRAME_OPAQUE_424310_CAPACITY_OFF = 0x14u };
enum { ISAAC_FRAME_OPAQUE_424310_CAPACITY_INIT = 0xfu };
enum { ISAAC_FRAME_OPAQUE_424310_NODE_OFF = 0x18u };
enum { ISAAC_FRAME_OPAQUE_424310_NODE_SIZE = 0x14u };
enum { ISAAC_FRAME_OPAQUE_424310_NODE_SELF_LINK_COUNT = 3u };
enum { ISAAC_FRAME_OPAQUE_424310_NODE_WORD_OFF = 0xcu };
enum { ISAAC_FRAME_OPAQUE_424310_NODE_MAGIC = 0x101u };
enum { ISAAC_FRAME_OPAQUE_424310_ZERO_DWORD_COUNT = 18u };

/* FUN_00424440 sub-init peel (ABI v52): 0x424440..0x424501 ret; thiscall
   this; straight-line, no branches; 14 callers (incl. the v51 424310 ctor
   @0x424404); callee 0x424540 = _Tree erase stays HOST (pinned in room/
   render-shell/game-render). Body: esi = node = this+0x18; push [node+4];
   push &this+0x18; call 0x424540 (HOST); node RE-self-links [node]=[node+4]
   =[node+8]=node (FULL-dword, after-erase); this+0x1c = 0; copy pairs
   (0x20->0x24, 0x2c->0x30, 0x98->0x9c — the third is a SNAPSHOT read
   @0x424472 BEFORE the zero storm, written LAST @0x4244fa); 16 dword-zero
   stores 0x1c/0x3c/0x40/0x44/0x54/0x58/0x5c/0x60/0x64/0x68/0x70/0x78/0x7c/
   0x80/0x84/0x88; DWORD 0x38 = 0xffffffff (NOT zero); BYTE 0x6c = 1 (c6
   LOW-BYTE); BYTE 0x74 = 0 (c6 LOW-BYTE, NOT a dword-zero). */
enum { ISAAC_FRAME_OPAQUE_424440_VA = 0x00424440u };
enum { ISAAC_FRAME_OPAQUE_424440_END_VA = 0x00424502u };
enum { ISAAC_FRAME_OPAQUE_424440_CALL_SITES = 14u };
enum { ISAAC_FRAME_OPAQUE_424440_CALLER1_VA = 0x00424404u };
enum { ISAAC_FRAME_OPAQUE_424440_CALLER2_VA = 0x00426a83u };
enum { ISAAC_FRAME_OPAQUE_424440_CALLER3_VA = 0x006f1bc6u };
enum { ISAAC_FRAME_OPAQUE_424440_CALLER4_VA = 0x006f446fu };
enum { ISAAC_FRAME_OPAQUE_424440_CALLER5_VA = 0x00857020u };
enum { ISAAC_FRAME_OPAQUE_424440_CALLER6_VA = 0x008e547cu };
enum { ISAAC_FRAME_OPAQUE_424440_CALLER7_VA = 0x008e56e2u };
enum { ISAAC_FRAME_OPAQUE_424440_CALLER8_VA = 0x008e5752u };
enum { ISAAC_FRAME_OPAQUE_424440_CALLER9_VA = 0x008eba12u };
enum { ISAAC_FRAME_OPAQUE_424440_CALLER10_VA = 0x00950d9au };
enum { ISAAC_FRAME_OPAQUE_424440_CALLER11_VA = 0x00958b66u };
enum { ISAAC_FRAME_OPAQUE_424440_CALLER12_VA = 0x00981284u };
enum { ISAAC_FRAME_OPAQUE_424440_CALLER13_VA = 0x009812d4u };
enum { ISAAC_FRAME_OPAQUE_424440_CALLER14_VA = 0x009ab185u };
enum { ISAAC_FRAME_OPAQUE_424440_ERASE_HOST_VA = 0x00424540u };
enum { ISAAC_FRAME_OPAQUE_424440_NODE_OFF = 0x18u };
enum { ISAAC_FRAME_OPAQUE_424440_ERASE_ARG_OFF = 4u };
enum { ISAAC_FRAME_OPAQUE_424440_ZERO_DWORD_COUNT = 16u };
enum { ISAAC_FRAME_OPAQUE_424440_COPY_COUNT = 3u };
enum { ISAAC_FRAME_OPAQUE_424440_COPY_SRC0_OFF = 0x20u };
enum { ISAAC_FRAME_OPAQUE_424440_COPY_DST0_OFF = 0x24u };
enum { ISAAC_FRAME_OPAQUE_424440_COPY_SRC1_OFF = 0x2cu };
enum { ISAAC_FRAME_OPAQUE_424440_COPY_DST1_OFF = 0x30u };
enum { ISAAC_FRAME_OPAQUE_424440_COPY_SRC2_OFF = 0x98u };
enum { ISAAC_FRAME_OPAQUE_424440_COPY_DST2_OFF = 0x9cu };
enum { ISAAC_FRAME_OPAQUE_424440_MINUS_ONE_OFF = 0x38u };
enum { ISAAC_FRAME_OPAQUE_424440_MINUS_ONE_VALUE = 0xffffffffu };
enum { ISAAC_FRAME_OPAQUE_424440_BYTE_ONE_OFF = 0x6cu };
enum { ISAAC_FRAME_OPAQUE_424440_BYTE_ONE_VALUE = 1u };
enum { ISAAC_FRAME_OPAQUE_424440_BYTE_ZERO_OFF = 0x74u };
enum { ISAAC_FRAME_OPAQUE_424440_OUT_OF_RANGE = 0xffffffffu };

/* FUN_00424510 zero-ctor (ABI v53): 0x424510..0x424526 ret, thiscall
   this=ecx, 0 E8 / 0 loads / 3 mem-stores — PURE, WHOLE body (no host
   boundary). 39 direct E8 callers. Body:
     [ecx]=0 (@0x424510 c7 FULL-DWORD zero)
     eax=ecx  (@0x424516 — RETURNS this, full 32-bit)
     [ecx+4]=0 (@0x424518 c7 FULL-DWORD zero)
     [ecx+8]=0 (@0x42451f c7 FULL-DWORD zero)
     ret @0x424526; END 0x424527; int3 pad 0x424502..0x42450f before,
     0x424527..0x42452f after; next fn 0x424530 = the v43 identity pin. */
enum { ISAAC_FRAME_OPAQUE_424510_VA = 0x00424510u };
enum { ISAAC_FRAME_OPAQUE_424510_END_VA = 0x00424527u };
enum { ISAAC_FRAME_OPAQUE_424510_CALL_SITES = 39u };
enum { ISAAC_FRAME_OPAQUE_424510_ZERO_DWORD_COUNT = 3u };
enum { ISAAC_FRAME_OPAQUE_424510_ZERO0_OFF = 0x00u };
enum { ISAAC_FRAME_OPAQUE_424510_ZERO1_OFF = 0x04u };
enum { ISAAC_FRAME_OPAQUE_424510_ZERO2_OFF = 0x08u };

int32_t isaac_frame_opaque_shuffle_count(int32_t span);
uint32_t isaac_frame_opaque_shuffle_slot_off(uint32_t idx);
uint32_t isaac_frame_opaque_shuffle_word_to_index(uint32_t word,
                                                  uint32_t count);
int32_t isaac_frame_opaque_shuffle_needs_swap(uint32_t idx,
                                              uint32_t j);
int32_t isaac_frame_opaque_shuffle_collection_nonempty(uint32_t begin,
                                                       uint32_t end);
uint32_t isaac_frame_opaque_shuffle_collection_stride(void);
uint32_t isaac_frame_opaque_shuffle_record_size(void);
uint32_t isaac_frame_opaque_shuffle_prng_init_va(void);
uint32_t isaac_frame_opaque_shuffle_prng_next_va(void);
uint32_t isaac_frame_opaque_shuffle_prng_bound(void);
uint32_t isaac_frame_opaque_shuffle_loop_va(void);
uint32_t isaac_frame_opaque_shuffle_end_va(void);
uint32_t isaac_frame_opaque_4253b0_char_off(void);
uint32_t isaac_frame_opaque_4253b0_host_va(void);
uint32_t isaac_frame_opaque_4253b0_end_va(void);
uint32_t isaac_frame_opaque_4253c0_manager_add(void);
uint32_t isaac_frame_opaque_4253c0_add_result(uint32_t manager_ptr);
uint32_t isaac_frame_opaque_4253c0_host_va(void);
uint32_t isaac_frame_opaque_4253c0_end_va(void);
uint32_t isaac_frame_opaque_4253d0_vec_off(void);
uint32_t isaac_frame_opaque_4253d0_vec_end_off(void);
uint32_t isaac_frame_opaque_4253d0_key_off(void);
uint32_t isaac_frame_opaque_4253d0_elem_id_off(void);
int32_t isaac_frame_opaque_4253d0_count(uint32_t end, uint32_t begin);
int32_t isaac_frame_opaque_4253d0_in_range(uint32_t idx, uint32_t count);
int32_t isaac_frame_opaque_4253d0_match(uint32_t elem_id, uint32_t key);
int32_t isaac_frame_opaque_4253d0_first_match_index(const uint32_t* elem_ids,
                                                    uint32_t count,
                                                    uint32_t key);
uint32_t isaac_frame_opaque_4253d0_result(const uint32_t* elems,
                                          uint32_t count,
                                          int32_t match_index);
uint32_t isaac_frame_opaque_4253d0_host_va(void);
uint32_t isaac_frame_opaque_4253d0_end_va(void);
uint32_t isaac_frame_opaque_421800_field_off(void);
uint32_t isaac_frame_opaque_421800_result(uint32_t obj);
uint32_t isaac_frame_opaque_421800_host_va(void);
uint32_t isaac_frame_opaque_421800_end_va(void);
uint32_t isaac_frame_opaque_424530_identity(uint32_t obj);
uint32_t isaac_frame_opaque_424530_host_va(void);
uint32_t isaac_frame_opaque_424530_end_va(void);
uint32_t isaac_frame_opaque_423950_id_off(void);
uint32_t isaac_frame_opaque_423950_read_id(uint32_t obj);
uint32_t isaac_frame_opaque_423950_host_va(void);
uint32_t isaac_frame_opaque_423950_end_va(void);
uint32_t isaac_frame_opaque_423960_vec_off(void);
uint32_t isaac_frame_opaque_423960_vec_end_off(void);
uint32_t isaac_frame_opaque_423960_result(uint32_t begin, uint32_t end);
uint32_t isaac_frame_opaque_423960_host_va(void);
uint32_t isaac_frame_opaque_423960_end_va(void);
uint32_t isaac_frame_opaque_423970_rtti_off(void);
uint32_t isaac_frame_opaque_423970_entry_off(void);
uint32_t isaac_frame_opaque_423970_null_marker(void);
uint32_t isaac_frame_opaque_423970_result(uint32_t subobj);
uint32_t isaac_frame_opaque_423970_host_va(void);
uint32_t isaac_frame_opaque_423970_end_va(void);
uint32_t isaac_frame_opaque_425430_array_count(void);
uint32_t isaac_frame_opaque_425430_elem_stride(void);
uint32_t isaac_frame_opaque_425430_copy_src_off(uint32_t k);
uint32_t isaac_frame_opaque_425430_copy_dst_off(uint32_t k);
void isaac_frame_opaque_425430_copy_apply(uint32_t base);
uint32_t isaac_frame_opaque_425430_zero_byte_off(void);
uint32_t isaac_frame_opaque_425430_zero_value(void);
uint32_t isaac_frame_opaque_425430_init_dest_off(void);
uint32_t isaac_frame_opaque_425430_init_cookie(void);
uint32_t isaac_frame_opaque_425430_helper_va(void);
uint32_t isaac_frame_opaque_425430_sub_call_va(void);
uint32_t isaac_frame_opaque_425430_host_va(void);
uint32_t isaac_frame_opaque_425430_end_va(void);
int32_t isaac_frame_opaque_4254b0_pass_a_gate(uint32_t mp_begin,
                                              uint32_t mp_end);
uint32_t isaac_frame_opaque_4254b0_range_count(uint32_t begin,
                                               uint32_t end);
uint32_t isaac_frame_opaque_4254b0_trailing_pop_count(
    uint32_t start_count, const uint32_t* gate_flags, uint32_t flags_len);
int32_t isaac_frame_opaque_4254b0_cvttss2si(uint32_t bits);
int32_t isaac_frame_opaque_4254b0_row_skip(uint32_t kind);
uint32_t isaac_frame_opaque_4254b0_row_xmm1(uint32_t b1);
int32_t isaac_frame_opaque_4254b0_elem_filter(uint32_t b0, uint32_t b1,
                                              uint32_t f_row_bits,
                                              int32_t d_row,
                                              uint32_t f_elem_bits,
                                              uint32_t prev_f_bits);
int32_t isaac_frame_opaque_4254b0_flush_count(uint32_t cursor,
                                              uint32_t out_list);
uint32_t isaac_frame_opaque_4254b0_host_va(void);
uint32_t isaac_frame_opaque_4254b0_end_va(void);
uint32_t isaac_frame_opaque_4239b0_clear_value(uint32_t arg);
uint32_t isaac_frame_opaque_4239b0_store_value(uint32_t off,
                                               uint32_t arg);
uint32_t isaac_frame_opaque_4239b0_host_va(void);
uint32_t isaac_frame_opaque_4239b0_end_va(void);
uint32_t isaac_frame_opaque_423990_seh_va(void);
uint32_t isaac_frame_opaque_423990_init_va(void);
uint32_t isaac_frame_opaque_423990_init_arg(void);
uint32_t isaac_frame_opaque_423990_clear_after(void);
uint32_t isaac_frame_opaque_423990_host_va(void);
uint32_t isaac_frame_opaque_423990_end_va(void);
uint32_t isaac_frame_opaque_423aa0_iterations(void);
uint32_t isaac_frame_opaque_423aa0_stride(void);
uint32_t isaac_frame_opaque_423aa0_local_cap(void);
uint32_t isaac_frame_opaque_423aa0_local_size(void);
uint32_t isaac_frame_opaque_423aa0_alloc_arg(void);
uint32_t isaac_frame_opaque_423aa0_push_arg(void);
int32_t isaac_frame_opaque_423aa0_free_needed(uint32_t cap);
int32_t isaac_frame_opaque_423aa0_big_header_path(uint32_t cap);
uint32_t isaac_frame_opaque_423aa0_header_delta(uint32_t buf,
                                                uint32_t header);
int32_t isaac_frame_opaque_423aa0_header_sane(uint32_t delta);
int32_t isaac_frame_opaque_423aa0_sso_inline(uint32_t cap);
int32_t isaac_frame_opaque_423aa0_insert_left(uint32_t obj_null,
                                              uint32_t str_eq,
                                              uint32_t obj_byte34,
                                              uint32_t this_byte44);
int32_t isaac_frame_opaque_423aa0_insert_right(uint32_t obj_null,
                                               uint32_t str_eq,
                                               uint32_t obj_byte34,
                                               uint32_t this_byte174);
int32_t isaac_frame_opaque_423aa0_flag_result(uint32_t host_result);
uint32_t isaac_frame_opaque_423aa0_host_va(void);
uint32_t isaac_frame_opaque_423aa0_end_va(void);
uint32_t isaac_frame_opaque_423cc0_host_va(void);
uint32_t isaac_frame_opaque_423cc0_end_va(void);
uint32_t isaac_frame_opaque_423cc0_iterations(void);
uint32_t isaac_frame_opaque_423cc0_stride(void);
uint32_t isaac_frame_opaque_423cc0_slot_base_off(void);
int32_t isaac_frame_opaque_423cc0_mode_select(uint32_t bit_set);
uint32_t isaac_frame_opaque_423cc0_scale_f32(uint32_t f260);
int32_t isaac_frame_opaque_423cc0_slot_skip(uint32_t type, uint32_t byte4);
int32_t isaac_frame_opaque_423cc0_render_needed(uint32_t gate_a);
uint32_t isaac_frame_opaque_423cc0_render_first_off(uint32_t order);
int32_t isaac_frame_opaque_423cc0_bounds_ok(uint32_t index, uint32_t begin,
                                            uint32_t end);
uint32_t isaac_frame_opaque_423cc0_entry_offset(uint32_t index);
int32_t isaac_frame_opaque_423cc0_entry_is_none(uint32_t entry);
uint32_t isaac_frame_opaque_424130_vec_x(uint32_t iter, uint32_t f260,
                                         uint32_t f128, uint32_t f114,
                                         uint32_t f12c, uint32_t f244,
                                         uint32_t f258, uint32_t f25c,
                                         uint32_t bss_x, uint32_t bss_y,
                                         uint32_t def_x, uint32_t def_y);
uint32_t isaac_frame_opaque_424130_vec_y(uint32_t iter, uint32_t f260,
                                         uint32_t f128, uint32_t f114,
                                         uint32_t f12c, uint32_t f244,
                                         uint32_t f258, uint32_t f25c,
                                         uint32_t bss_x, uint32_t bss_y,
                                         uint32_t def_x, uint32_t def_y);
int32_t isaac_frame_opaque_4240b0_walk_needed(uint32_t gate_dword);
uint32_t isaac_frame_opaque_4240b0_result_x(uint32_t scale_bits,
                                            uint32_t base0_bits,
                                            uint32_t vec0_bits);
uint32_t isaac_frame_opaque_4240b0_result_y(uint32_t scale_bits,
                                            uint32_t base1_bits,
                                            uint32_t vec1_bits);
uint32_t isaac_frame_opaque_4240b0_host_va(void);
uint32_t isaac_frame_opaque_4240b0_end_va(void);
uint32_t isaac_frame_opaque_4240b0_callee_va(void);
uint32_t isaac_frame_opaque_4240b0_walk_va(void);
uint32_t isaac_frame_opaque_4240b0_name_va(void);
int32_t isaac_frame_opaque_424220_dispatch(uint32_t mode);
int32_t isaac_frame_opaque_424220_b_gate(uint32_t lo, uint32_t hi);
uint32_t isaac_frame_opaque_424220_b1_entry(uint32_t subobj);
uint32_t isaac_frame_opaque_424220_b2_delta(uint32_t hi, uint32_t lo);
int32_t isaac_frame_opaque_424220_b2_gate(uint32_t delta);
uint32_t isaac_frame_opaque_424220_b2_result(uint32_t obj);
uint32_t isaac_frame_opaque_424220_case_a_global_va(void);
uint32_t isaac_frame_opaque_424220_null_marker(void);
uint32_t isaac_frame_opaque_424220_default_result(void);
uint32_t isaac_frame_opaque_424220_host_va(void);
uint32_t isaac_frame_opaque_424220_end_va(void);
uint32_t isaac_frame_opaque_424220_host1_va(void);
uint32_t isaac_frame_opaque_424220_host2_va(void);
int32_t isaac_frame_opaque_4242b0_sub_gate(uint32_t sub);
int32_t isaac_frame_opaque_4242b0_al_gate(uint32_t al);
int32_t isaac_frame_opaque_4242b0_cb_gate(uint32_t fnptr);
int32_t isaac_frame_opaque_4242b0_fire_cb(uint32_t sub, uint32_t al,
                                          uint32_t fnptr);
uint32_t isaac_frame_opaque_4242b0_host_va(void);
uint32_t isaac_frame_opaque_4242b0_end_va(void);
uint32_t isaac_frame_opaque_4242b0_cb_global_va(void);
uint32_t isaac_frame_opaque_4242b0_seh_handler_va(void);
uint32_t isaac_frame_opaque_4242b0_cookie_va(void);
uint32_t isaac_frame_opaque_4242b0_call_sites(void);
uint32_t isaac_frame_opaque_424310_host_va(void);
uint32_t isaac_frame_opaque_424310_end_va(void);
uint32_t isaac_frame_opaque_424310_call_sites(void);
uint32_t isaac_frame_opaque_424310_seh_handler_va(void);
uint32_t isaac_frame_opaque_424310_cookie_va(void);
uint32_t isaac_frame_opaque_424310_alloc_size(void);
uint32_t isaac_frame_opaque_424310_alloc_host_va(void);
uint32_t isaac_frame_opaque_424310_subinit_host_va(void);
uint32_t isaac_frame_opaque_424310_capacity_init(void);
uint32_t isaac_frame_opaque_424310_node_word_magic(void);
uint32_t isaac_frame_opaque_424310_zero_dword_count(void);
uint32_t isaac_frame_opaque_424310_node_self_link(uint32_t node);
int32_t isaac_frame_opaque_424310_zeroed_at(uint32_t off);
uint32_t isaac_frame_opaque_424440_host_va(void);
uint32_t isaac_frame_opaque_424440_end_va(void);
uint32_t isaac_frame_opaque_424440_call_sites(void);
uint32_t isaac_frame_opaque_424440_erase_host_va(void);
uint32_t isaac_frame_opaque_424440_node_off(void);
uint32_t isaac_frame_opaque_424440_erase_arg_off(void);
uint32_t isaac_frame_opaque_424440_node_self_link(uint32_t node);
uint32_t isaac_frame_opaque_424440_zero_dword_count(void);
int32_t isaac_frame_opaque_424440_zeroed_at(uint32_t off);
uint32_t isaac_frame_opaque_424440_copy_count(void);
uint32_t isaac_frame_opaque_424440_copy_src_off(uint32_t k);
uint32_t isaac_frame_opaque_424440_copy_dst_off(uint32_t k);
int32_t isaac_frame_opaque_424440_copy_snapshot(uint32_t k);
uint32_t isaac_frame_opaque_424440_minus_one_off(void);
uint32_t isaac_frame_opaque_424440_minus_one_value(void);
uint32_t isaac_frame_opaque_424440_byte_one_off(void);
uint32_t isaac_frame_opaque_424440_byte_one_value(void);
uint32_t isaac_frame_opaque_424440_byte_zero_off(void);
uint32_t isaac_frame_opaque_424510_host_va(void);
uint32_t isaac_frame_opaque_424510_end_va(void);
uint32_t isaac_frame_opaque_424510_call_sites(void);
uint32_t isaac_frame_opaque_424510_zero_dword_count(void);
int32_t isaac_frame_opaque_424510_zeroed_at(uint32_t off);
uint32_t isaac_frame_opaque_424510_zero_width_bytes(uint32_t off);
uint32_t isaac_frame_opaque_424510_return_this(uint32_t this_ptr);

/* FUN_00424580 NARROWED light-quad renderer (ABI v54):
   0x424580..0x42489b ret, thiscall this=ecx + 4 float xmm args + 4
   stack floats (arg0=[ebp+8], min=[ebp+0xc], max=[ebp+0x10],
   r=[ebp+0x14]); 8 E8 (4x atan2 wrapper 0x499d60 + 4x packed-ARGB
   unpack 0xa0f550 — both HOST leaves); 2 callers (0x424a2f /
   0x424b3f, both inside FUN_004248a0). Pure scalar laws peeled:
   entry bound (cvttss2si xmm2, SIGNED js/jle loop), low-16 xIdx
   (movzx ax), per-row dy quantize, radius gate (comiss dist²>=r²),
   angle wrap (×57.2958 + 360 if<0, jbe NaN-safe) + window gate
   (min<=deg<=max), byte scale (×255 low-byte), cell offset
   ((stride*y+x)*4, stride=(uint16)[this+8]). */
enum { ISAAC_FRAME_OPAQUE_424580_VA = 0x00424580u };
enum { ISAAC_FRAME_OPAQUE_424580_END_VA = 0x0042489cu };
enum { ISAAC_FRAME_OPAQUE_424580_CALL_SITES = 2u };
enum { ISAAC_FRAME_OPAQUE_424580_ATAN_VA = 0x00499d60u };
enum { ISAAC_FRAME_OPAQUE_424580_UNPACK_VA = 0x00a0f550u };
enum { ISAAC_FRAME_OPAQUE_424580_DEG_RAD_BITS = 0x42652ee0u };
enum { ISAAC_FRAME_OPAQUE_424580_DEG_ADD_BITS = 0x43b40000u };
enum { ISAAC_FRAME_OPAQUE_424580_BYTE_SCALE_BITS = 0x437f0000u };
enum { ISAAC_FRAME_OPAQUE_424580_CELL_WRITE_OFF = 4u };
enum { ISAAC_FRAME_OPAQUE_424580_CHANNEL_COUNT = 4u };

uint32_t isaac_frame_opaque_424580_host_va(void);
uint32_t isaac_frame_opaque_424580_end_va(void);
uint32_t isaac_frame_opaque_424580_call_sites(void);
uint32_t isaac_frame_opaque_424580_atan_va(void);
uint32_t isaac_frame_opaque_424580_unpack_va(void);
uint32_t isaac_frame_opaque_424580_iteration_count(uint32_t xmm2_bits);
int32_t isaac_frame_opaque_424580_radius_ok(uint32_t dx_bits,
                                            uint32_t dy_bits,
                                            uint32_t r_bits);
uint32_t isaac_frame_opaque_424580_x_idx16(uint32_t x1_bits,
                                           uint32_t x3_bits);
uint32_t isaac_frame_opaque_424580_dy_f32(uint32_t ybase_bits,
                                          uint32_t arg0_bits,
                                          uint32_t counter);
uint32_t isaac_frame_opaque_424580_angle_deg(uint32_t atan_bits);
int32_t isaac_frame_opaque_424580_angle_ok(uint32_t deg_bits,
                                           uint32_t min_bits,
                                           uint32_t max_bits);
uint32_t isaac_frame_opaque_424580_byte_scale(uint32_t ch_bits);
uint32_t isaac_frame_opaque_424580_cell_off(uint32_t stride,
                                            uint32_t y16,
                                            uint32_t x16);

/* FUN_00499d60 atan2 wrapper LAW (ABI v55):
   0x499d60..0x499d98 ret; xmm0=y, xmm1=x (floats); cvtss2sd y, cvtss2sd
   x; fld y; fld x; call CRT 0xaf08c3 (IAT 0xb187f8 = _CIatan2 — the x87
   register atan2: st1=y, st0=x, result st0); fstp; movsd; cvtpd2ps ->
   f32 result. 28 insns, 1 E8, 0 indirect, 2 scratch stores. 179 direct
   callers (game-wide float angle primitive). CRT _CIatan2 is pinned as a
   KNOWN PLATFORM PRIMITIVE (fdlibm-derived double atan2, same algorithm
   family as wasm f64.atan2 / JS Math.atan2); the wrapper transcription
   widens (cvtss2sd) BEFORE atan2 and narrows (cvtpd2ps) after —
   double-rounding is part of the law. */
enum { ISAAC_FRAME_OPAQUE_499D60_VA = 0x00499d60u };
enum { ISAAC_FRAME_OPAQUE_499D60_END_VA = 0x00499d99u };
enum { ISAAC_FRAME_OPAQUE_499D60_CALL_SITES = 179u };
enum { ISAAC_FRAME_OPAQUE_499D60_CRT_VA = 0x00af08c3u };
enum { ISAAC_FRAME_OPAQUE_499D60_IAT_VA = 0x00b187f8u };

uint32_t isaac_frame_opaque_499d60_host_va(void);
uint32_t isaac_frame_opaque_499d60_end_va(void);
uint32_t isaac_frame_opaque_499d60_call_sites(void);
uint32_t isaac_frame_opaque_499d60_crt_va(void);
uint32_t isaac_frame_opaque_499d60_iat_va(void);
uint32_t isaac_frame_opaque_499d60_atan2(uint32_t y_bits,
                                         uint32_t x_bits);

/* FUN_004248a0 transitional SEAMS (ABI v55): the function stays HOST
   (SEH + GS cookie 0xbf93b4; E8 leaves 0xa230b0 / 0xaf05e5 / 0xa0f4c0 /
   FUN_00424580 x2 / 0x40c7f0 smart-handle IRREDUCIBLE-PROVEN v71 /
   0xa11c70 logger / 0x40c3b0 swap / 0xaef15c delete; 2 indirect:
   virtual [[ecx]+0xc] release @0x424bfe + [0xc7163c] IRREDUCIBLE
   registry @0x424c11), but its PURE SCALAR SEAMS are peeled so the host
   replay re-derives exact sizes/gates/states: cell geometry (width16 =
   (uint16)(p1+1), height16 = (uint16)(p2+1); cell_bytes =
   (w*h)*4+4 32-bit wrap; sx = (uint16)p1>>1, sy = (uint16)p2>>1), the
   prologue float island (sx2/sy2/two_sx2/two_sy2/t1/t2s/t3/acc0 +
   gate1 = ORDERED t1 > f32(two_sy2*0.0f)), and the mid island (acc2 +
   gate2 = ORDERED b >= 0.0f). .rdata consts: 1.0f=[0xbaa454],
   0.25f=[0xbaa1d4], 0.0f=[0xba9fe4], 0.5f=[0xbaa2d0]. 1 direct caller
   0x424de8. END 0x00424c33; next function 0x424c40. */
enum { ISAAC_FRAME_OPAQUE_4248A0_VA = 0x004248a0u };
enum { ISAAC_FRAME_OPAQUE_4248A0_END_VA = 0x00424c33u };
enum { ISAAC_FRAME_OPAQUE_4248A0_CALL_SITES = 1u };
enum { ISAAC_FRAME_OPAQUE_4248A0_BAND_A_VA = 0x00424580u };
enum { ISAAC_FRAME_OPAQUE_4248A0_HALF_MASK = 0xffffu };
enum { ISAAC_FRAME_OPAQUE_4248A0_Q025_BITS = 0x3e800000u };
enum { ISAAC_FRAME_OPAQUE_4248A0_ONE_BITS = 0x3f800000u };
enum { ISAAC_FRAME_OPAQUE_4248A0_ZERO_BITS = 0x00000000u };
enum { ISAAC_FRAME_OPAQUE_4248A0_HALF_BITS = 0x3f000000u };

uint32_t isaac_frame_opaque_4248a0_host_va(void);
uint32_t isaac_frame_opaque_4248a0_end_va(void);
uint32_t isaac_frame_opaque_4248a0_call_sites(void);
uint32_t isaac_frame_opaque_4248a0_band_a_va(void);
uint32_t isaac_frame_opaque_4248a0_cell_bytes(uint32_t p1,
                                              uint32_t p2);
uint32_t isaac_frame_opaque_4248a0_half_x(uint32_t p1);
uint32_t isaac_frame_opaque_4248a0_half_y(uint32_t p2);
uint32_t isaac_frame_opaque_4248a0_sx2(uint32_t sx);
uint32_t isaac_frame_opaque_4248a0_sy2(uint32_t sy);
uint32_t isaac_frame_opaque_4248a0_two_sx2(uint32_t sx2_bits);
uint32_t isaac_frame_opaque_4248a0_two_sy2(uint32_t sy2_bits);
uint32_t isaac_frame_opaque_4248a0_t1(uint32_t sy, uint32_t two_sx2_bits);
uint32_t isaac_frame_opaque_4248a0_t3(uint32_t sy, uint32_t sx2_bits);
uint32_t isaac_frame_opaque_4248a0_acc0(uint32_t sy2_bits,
                                        uint32_t t3_bits,
                                        uint32_t sx2_bits);
int32_t isaac_frame_opaque_4248a0_loop1_enter(uint32_t t1_bits,
                                              uint32_t two_sy2_bits);
uint32_t isaac_frame_opaque_4248a0_mid_acc(uint32_t a_bits,
                                           uint32_t b_bits,
                                           uint32_t sx2_bits,
                                           uint32_t sy2_bits);
int32_t isaac_frame_opaque_4248a0_loop2_enter(uint32_t b_bits);
/* FUN_00424c40 pair-ctor SEAMS (ABI v56): 0x424c40..0x424cc3 ret
   (thiscall this=ecx; straight-line, no branches; SEH handler
   0xaf198d, GS cookie [0xbf93b4]; 36 insns, 2 E8, 0 indirect, 11
   stores; 3 direct callers 0x6f190b/0x6f191a/0x6f2358). Body: two
   0x40c4a0 pair-attach calls — ecx=this, push 0 @0x424c6b and
   ecx=this+8, push 0 @0x424c7c — then 7 FULL-DWORD zero stores
   (+0x10,+0x14,+0x18,+0x1c,+0x24,+0x20,+0x28; PE stores +0x24 BEFORE
   +0x20) and return this (eax=esi @0x424c88). 0x40c4a0 stays HOST
   (pair ctor: SEH 0xaf0d44 + raw alloc 0xa0f4c0 0x18 + sub-ctor
   0x40cc10 + vtable 0xb1a6e0 + the [0xc7163c] IRREDUCIBLE registry
   gate + virtual release — exit family pins it as the 0x40c7f0
   sibling pair ctor; anm2 lists it as a LoadGraphics host leaf). The
   zero table + pair geometry + return-this are the pure scalar seams. */
enum { ISAAC_FRAME_OPAQUE_424C40_VA = 0x00424c40u };
enum { ISAAC_FRAME_OPAQUE_424C40_END_VA = 0x00424cc4u };
enum { ISAAC_FRAME_OPAQUE_424C40_CALL_SITES = 3u };
enum { ISAAC_FRAME_OPAQUE_424C40_CALLER1_VA = 0x006f190bu };
enum { ISAAC_FRAME_OPAQUE_424C40_CALLER2_VA = 0x006f191au };
enum { ISAAC_FRAME_OPAQUE_424C40_CALLER3_VA = 0x006f2358u };
enum { ISAAC_FRAME_OPAQUE_424C40_SEH_HANDLER_VA = 0x00af198du };
enum { ISAAC_FRAME_OPAQUE_424C40_COOKIE_VA = 0x00bf93b4u };
enum { ISAAC_FRAME_OPAQUE_424C40_PAIR_HOST_VA = 0x0040c4a0u };
enum { ISAAC_FRAME_OPAQUE_424C40_PAIR0_OFF = 0u };
enum { ISAAC_FRAME_OPAQUE_424C40_PAIR1_OFF = 8u };
enum { ISAAC_FRAME_OPAQUE_424C40_PAIR_ARG = 0u };
enum { ISAAC_FRAME_OPAQUE_424C40_PAIR0_CALL_VA = 0x00424c6bu };
enum { ISAAC_FRAME_OPAQUE_424C40_PAIR1_CALL_VA = 0x00424c7cu };
enum { ISAAC_FRAME_OPAQUE_424C40_ZERO_DWORD_COUNT = 7u };
enum { ISAAC_FRAME_OPAQUE_424C40_NO_STORE_BYTE = 0xffu };

uint32_t isaac_frame_opaque_424c40_host_va(void);
uint32_t isaac_frame_opaque_424c40_end_va(void);
uint32_t isaac_frame_opaque_424c40_call_sites(void);
uint32_t isaac_frame_opaque_424c40_seh_handler_va(void);
uint32_t isaac_frame_opaque_424c40_cookie_va(void);
uint32_t isaac_frame_opaque_424c40_pair_host_va(void);
uint32_t isaac_frame_opaque_424c40_pair0_off(void);
uint32_t isaac_frame_opaque_424c40_pair1_off(void);
uint32_t isaac_frame_opaque_424c40_pair_arg(void);
uint32_t isaac_frame_opaque_424c40_pair0_call_va(void);
uint32_t isaac_frame_opaque_424c40_pair1_call_va(void);
uint32_t isaac_frame_opaque_424c40_zero_dword_count(void);
int32_t isaac_frame_opaque_424c40_zeroed_at(uint32_t off);
uint32_t isaac_frame_opaque_424c40_zero_store_index(uint32_t off);
uint32_t isaac_frame_opaque_424c40_return_this(uint32_t this_ptr);
/* FUN_00424cd0 0x40c7f0-TWIN CTOR SEAMS (ABI v57): 0x424cd0..0x424d69 ret
   (thiscall this=ecx; straight-line; SEH handler 0xaf0b40, GS cookie
   [0xbf93b4]; 58 insns, 2 E8 (both -> 0x40c7f0 — IRREDUCIBLE-PROVEN v71
   pair ctor, HOST), 4 indirect (2x virtual release + 2x [0xc7163c]
   callback), 4 stores (2x fs:[0] + [ebp-4] 0/1); 5 direct callers
   0x6f355a/0x6f3565/0x83c535/0x8d1d38/0x8d1d43). Body: two 0x40c7f0
   attach calls (ecx=this and ecx=this+8, both push 0), then the INLINE
   double IRREDUCIBLE release chain (chain 0 on the this+8 pair's object
   [this+8+4] @0x424d10, chain 1 on the this pair's object [this+4]
   @0x424d38: test obj / virtual [[obj]+0xc] release / test al /
   [0xc7163c] registry gate / callback(pair)). DELTAS vs 0x424c40: NO
   zero-dword table and NO return-this (eax at ret is chain leftover —
   unspecified). The pair geometry + release-chain geometry + the gate
   law are the pure scalar seams. */
enum { ISAAC_FRAME_OPAQUE_424CD0_VA = 0x00424cd0u };
enum { ISAAC_FRAME_OPAQUE_424CD0_END_VA = 0x00424d6au };
enum { ISAAC_FRAME_OPAQUE_424CD0_CALL_SITES = 5u };
enum { ISAAC_FRAME_OPAQUE_424CD0_CALLER1_VA = 0x006f355au };
enum { ISAAC_FRAME_OPAQUE_424CD0_CALLER2_VA = 0x006f3565u };
enum { ISAAC_FRAME_OPAQUE_424CD0_CALLER3_VA = 0x0083c535u };
enum { ISAAC_FRAME_OPAQUE_424CD0_CALLER4_VA = 0x008d1d38u };
enum { ISAAC_FRAME_OPAQUE_424CD0_CALLER5_VA = 0x008d1d43u };
enum { ISAAC_FRAME_OPAQUE_424CD0_SEH_HANDLER_VA = 0x00af0b40u };
enum { ISAAC_FRAME_OPAQUE_424CD0_COOKIE_VA = 0x00bf93b4u };
enum { ISAAC_FRAME_OPAQUE_424CD0_PAIR_HOST_VA = 0x0040c7f0u };
enum { ISAAC_FRAME_OPAQUE_424CD0_PAIR0_OFF = 0u };
enum { ISAAC_FRAME_OPAQUE_424CD0_PAIR1_OFF = 8u };
enum { ISAAC_FRAME_OPAQUE_424CD0_PAIR_ARG = 0u };
enum { ISAAC_FRAME_OPAQUE_424CD0_PAIR0_CALL_VA = 0x00424cf8u };
enum { ISAAC_FRAME_OPAQUE_424CD0_PAIR1_CALL_VA = 0x00424d04u };
enum { ISAAC_FRAME_OPAQUE_424CD0_RELEASE_RECEIVER_OFF = 4u };
enum { ISAAC_FRAME_OPAQUE_424CD0_RELEASE_VTBL_SLOT_OFF = 0xcu };
enum { ISAAC_FRAME_OPAQUE_424CD0_RELEASE_CALLBACK_VA = 0x00c7163cu };
enum { ISAAC_FRAME_OPAQUE_424CD0_RELEASE_CHAIN_COUNT = 2u };
enum { ISAAC_FRAME_OPAQUE_424CD0_CHAIN0_GATE_VA = 0x00424d10u };
enum { ISAAC_FRAME_OPAQUE_424CD0_CHAIN1_GATE_VA = 0x00424d38u };
enum { ISAAC_FRAME_OPAQUE_424CD0_CHAIN0_RELEASE_CALL_VA = 0x00424d1cu };
enum { ISAAC_FRAME_OPAQUE_424CD0_CHAIN1_RELEASE_CALL_VA = 0x00424d44u };
enum { ISAAC_FRAME_OPAQUE_424CD0_CHAIN0_CALLBACK_CALL_VA = 0x00424d2cu };
enum { ISAAC_FRAME_OPAQUE_424CD0_CHAIN1_CALLBACK_CALL_VA = 0x00424d54u };
/* FUN_00424d70 FLOAT-GATE SEAMS (ABI v57): 0x424d70..0x424e55 ret 0x10
   (thiscall; plain frame — NO SEH/cookie; 68 insns, 1 E8 (0x424de8 ->
   0x4248a0 — recorded v55, HOST), 1 indirect ([[ecx]+0x20] @0x424e4f),
   10 stores; 3 direct callers 0x8d24e9/0x8d2541/0x8d26ab, all inside the
   0x8d2450 host state body; receivers this+0x7dc/this+0x808). Four
   ucomiss+lahf+test ah,0x44 ordered-equality gates over
   [this+0x10..0x1c] vs the incoming floats (f10 vs f28, f14 vs f1,
   f18 vs f2, f1c vs f3): gates 1-3 `jp` to the update path on
   ordered-NOT-equal (equal AND NaN fall through), gate 4 `jnp` to the
   tail on equal OR NaN (ordered-not-equal falls into update) — net law:
   update iff ANY pair is ordered-not-equal (NaN never counts as NE).
   Update path: cvttss2si(f28) + `add ax,ax` 16-bit doubling pushed TWICE
   + 3 float args to FUN_004248a0 (receiver this+8) + the four float
   field stores (PE order +0x14,+0x18,+0x10,+0x1c). Both paths then run
   the virtual [[[this+8]]+0x20] call with &local-vec2 + arg2. Body stays
   HOST; the gate law + cvtt/doubling law + store order + call geometry
   are the pure scalar seams. */
enum { ISAAC_FRAME_OPAQUE_424D70_VA = 0x00424d70u };
enum { ISAAC_FRAME_OPAQUE_424D70_END_VA = 0x00424e56u };
enum { ISAAC_FRAME_OPAQUE_424D70_CALL_SITES = 3u };
enum { ISAAC_FRAME_OPAQUE_424D70_CALLER1_VA = 0x008d24e9u };
enum { ISAAC_FRAME_OPAQUE_424D70_CALLER2_VA = 0x008d2541u };
enum { ISAAC_FRAME_OPAQUE_424D70_CALLER3_VA = 0x008d26abu };
enum { ISAAC_FRAME_OPAQUE_424D70_RET_BYTES = 0x10u };
enum { ISAAC_FRAME_OPAQUE_424D70_HOST_4248A0_VA = 0x004248a0u };
enum { ISAAC_FRAME_OPAQUE_424D70_CALL_4248A0_VA = 0x00424de8u };
enum { ISAAC_FRAME_OPAQUE_424D70_CALL_4248A0_RECEIVER_OFF = 8u };
enum { ISAAC_FRAME_OPAQUE_424D70_CALL_4248A0_FLOAT_ARGS = 3u };
enum { ISAAC_FRAME_OPAQUE_424D70_CALL_4248A0_INT_DUP_VA = 0x00424ddeu };
enum { ISAAC_FRAME_OPAQUE_424D70_CVTT_VA = 0x00424dc8u };
enum { ISAAC_FRAME_OPAQUE_424D70_VIRTUAL_RECEIVER_OFF = 8u };
enum { ISAAC_FRAME_OPAQUE_424D70_VIRTUAL_VTBL_SLOT_OFF = 0x20u };
enum { ISAAC_FRAME_OPAQUE_424D70_VIRTUAL_CALL_VA = 0x00424e4fu };
enum { ISAAC_FRAME_OPAQUE_424D70_FIELD_COUNT = 4u };
enum { ISAAC_FRAME_OPAQUE_424D70_NO_STORE_BYTE = 0xffu };

uint32_t isaac_frame_opaque_424cd0_host_va(void);
uint32_t isaac_frame_opaque_424cd0_end_va(void);
uint32_t isaac_frame_opaque_424cd0_call_sites(void);
uint32_t isaac_frame_opaque_424cd0_seh_handler_va(void);
uint32_t isaac_frame_opaque_424cd0_cookie_va(void);
uint32_t isaac_frame_opaque_424cd0_pair_host_va(void);
uint32_t isaac_frame_opaque_424cd0_pair0_off(void);
uint32_t isaac_frame_opaque_424cd0_pair1_off(void);
uint32_t isaac_frame_opaque_424cd0_pair_arg(void);
uint32_t isaac_frame_opaque_424cd0_pair0_call_va(void);
uint32_t isaac_frame_opaque_424cd0_pair1_call_va(void);
uint32_t isaac_frame_opaque_424cd0_release_receiver_off(void);
uint32_t isaac_frame_opaque_424cd0_release_vtbl_slot_off(void);
uint32_t isaac_frame_opaque_424cd0_release_callback_va(void);
uint32_t isaac_frame_opaque_424cd0_release_chain_count(void);
uint32_t isaac_frame_opaque_424cd0_release_chain_gate(uint32_t obj_present,
                                                      uint32_t release_result,
                                                      uint32_t callback_present);
uint32_t isaac_frame_opaque_424cd0_chain0_gate_va(void);
uint32_t isaac_frame_opaque_424cd0_chain1_gate_va(void);
uint32_t isaac_frame_opaque_424cd0_chain0_release_call_va(void);
uint32_t isaac_frame_opaque_424cd0_chain1_release_call_va(void);
uint32_t isaac_frame_opaque_424cd0_chain0_callback_call_va(void);
uint32_t isaac_frame_opaque_424cd0_chain1_callback_call_va(void);
uint32_t isaac_frame_opaque_424d70_host_va(void);
uint32_t isaac_frame_opaque_424d70_end_va(void);
uint32_t isaac_frame_opaque_424d70_call_sites(void);
uint32_t isaac_frame_opaque_424d70_ret_bytes(void);
uint32_t isaac_frame_opaque_424d70_host_4248a0_va(void);
uint32_t isaac_frame_opaque_424d70_call_4248a0_va(void);
uint32_t isaac_frame_opaque_424d70_call_4248a0_receiver_off(void);
uint32_t isaac_frame_opaque_424d70_call_4248a0_float_args(void);
uint32_t isaac_frame_opaque_424d70_call_4248a0_int_dup_va(void);
uint32_t isaac_frame_opaque_424d70_cvtt_va(void);
uint32_t isaac_frame_opaque_424d70_virtual_receiver_off(void);
uint32_t isaac_frame_opaque_424d70_virtual_vtbl_slot_off(void);
uint32_t isaac_frame_opaque_424d70_virtual_call_va(void);
uint32_t isaac_frame_opaque_424d70_field_count(void);
uint32_t isaac_frame_opaque_424d70_field_store_index(uint32_t off);
uint32_t isaac_frame_opaque_424d70_needs_update(uint32_t f10, uint32_t f28,
                                                uint32_t f14, uint32_t f1,
                                                uint32_t f18, uint32_t f2,
                                                uint32_t f1c, uint32_t f3);
uint32_t isaac_frame_opaque_424d70_doubled_arg(uint32_t f28_bits);
/* FUN_00424e60 INDEXED DWORD GETTER (ABI v58): 0x424e60..0x424e70
   `ret 4` (thiscall this=ecx + 1 stack arg; PLAIN frame — NO
   SEH/cookie; 7 insns, 0 E8, 0 indirect, 0 stores). `mov eax,
   [ebp+8]` (index); `mov eax,[ecx+eax*4+0x2bc]` @0x424e66; ret 4. The
   read VALUE is game state (host); the landed laws are the ADDRESS
   geometry (0x2bc base + dword stride, 32-bit wrap). 2 callers
   0x0066158c (`push 0x14`)/0x00661b9b (`push 0x73`) inside a big host
   awards/achievement state body that consumes value % 1000. */
enum { ISAAC_FRAME_OPAQUE_424E60_VA = 0x00424e60u };
enum { ISAAC_FRAME_OPAQUE_424E60_END_VA = 0x00424e71u };
enum { ISAAC_FRAME_OPAQUE_424E60_CALL_SITES = 2u };
enum { ISAAC_FRAME_OPAQUE_424E60_CALLER1_VA = 0x0066158cu };
enum { ISAAC_FRAME_OPAQUE_424E60_CALLER2_VA = 0x00661b9bu };
enum { ISAAC_FRAME_OPAQUE_424E60_RET_BYTES = 4u };
enum { ISAAC_FRAME_OPAQUE_424E60_ARRAY_BASE_OFF = 0x2bcu };
enum { ISAAC_FRAME_OPAQUE_424E60_ELEMENT_STRIDE = 4u };
/* FUN_00424e80 STRING-TEARDOWN DTOR GEOMETRY (ABI v58):
   0x424e80..0x424ee3 ret (thiscall this=ecx; SEH filter 0xaf09f0,
   GS cookie [0xbf93b4]; 46 insns, 5 E8, 0 indirect). CENSUS: ZERO
   direct rel32 callers and zero dword data refs (runtime-dispatch or
   dead — the 0 is the pin). 5 teardowns (PE order): this+4 ->
   0x407f10 @0x424eb0; this+0x54 -> 0x4087a0 @0x424eb8; this+0x34 ->
   0x4087a0 @0x424ec0; this+0x1c -> 0x40d040 @0x424ec8; this+4 SECOND
   pass -> 0x40d040 @0x424ecf. Callees stay HOST (0x40d040 = v26
   string tidy, 1321 callers; 0x407f10/0x4087a0 = the v57 0x83c4xx-
   dtor teardown block — both NEW family pins). */
enum { ISAAC_FRAME_OPAQUE_424E80_VA = 0x00424e80u };
enum { ISAAC_FRAME_OPAQUE_424E80_END_VA = 0x00424ee4u };
enum { ISAAC_FRAME_OPAQUE_424E80_CALL_SITES = 0u };
enum { ISAAC_FRAME_OPAQUE_424E80_SEH_HANDLER_VA = 0x00af09f0u };
enum { ISAAC_FRAME_OPAQUE_424E80_COOKIE_VA = 0x00bf93b4u };
enum { ISAAC_FRAME_OPAQUE_424E80_DTOR_COUNT = 5u };
enum { ISAAC_FRAME_OPAQUE_424E80_NO_DTOR_BYTE = 0xffu };
enum { ISAAC_FRAME_OPAQUE_424E80_HOST_407F10_VA = 0x00407f10u };
enum { ISAAC_FRAME_OPAQUE_424E80_HOST_4087A0_VA = 0x004087a0u };
enum { ISAAC_FRAME_OPAQUE_424E80_HOST_40D040_VA = 0x0040d040u };
/* FUN_00424ef0 ATTACH-LOOP SIGNED GATE SEAM (ABI v58):
   0x424ef0..0x42512b `ret 4` (thiscall + 1 stack arg; SEH filter
   0xaf19c5, GS cookie [0xbf93b4]; 178 insns, 10 E8 + 1 indirect IAT,
   30 stores; 2 callers 0x009480d4/0x009b58b5). Body stays HOST (2x
   raw alloc 0x40cf00 + string assembly 0x40bd50/0x40bf30/0x40c000 +
   inline strcmp vs literal 0xb1bc54 + 0x40a5d0/0x40a1b0 + [this+
   0x118]=0). Pure seam: `cmp esi,0xc; jl 0x424ff5` @0x425083/
   0x425086 — the 0x40bf30 attach loop re-runs while SIGNED iter < 12.
   i64 sign-extend form (wasm32 compare-flip class: em++ compiles
   int32-cast signed compares as unsigned — 0xffffffff = -1
   CONTINUES). */
enum { ISAAC_FRAME_OPAQUE_424EF0_VA = 0x00424ef0u };
enum { ISAAC_FRAME_OPAQUE_424EF0_END_VA = 0x0042512cu };
enum { ISAAC_FRAME_OPAQUE_424EF0_CALL_SITES = 2u };
enum { ISAAC_FRAME_OPAQUE_424EF0_CALLER1_VA = 0x009480d4u };
enum { ISAAC_FRAME_OPAQUE_424EF0_CALLER2_VA = 0x009b58b5u };
enum { ISAAC_FRAME_OPAQUE_424EF0_RET_BYTES = 4u };
enum { ISAAC_FRAME_OPAQUE_424EF0_SEH_HANDLER_VA = 0x00af19c5u };
enum { ISAAC_FRAME_OPAQUE_424EF0_COOKIE_VA = 0x00bf93b4u };
enum { ISAAC_FRAME_OPAQUE_424EF0_ATTACH_LOOP_CONTINUE_VA = 0x00425086u };
enum { ISAAC_FRAME_OPAQUE_424EF0_ATTACH_CALL_VA = 0x00425042u };
enum { ISAAC_FRAME_OPAQUE_424EF0_ATTACH_COUNT = 0xcu };

uint32_t isaac_frame_opaque_424e60_host_va(void);
uint32_t isaac_frame_opaque_424e60_end_va(void);
uint32_t isaac_frame_opaque_424e60_call_sites(void);
uint32_t isaac_frame_opaque_424e60_caller1_va(void);
uint32_t isaac_frame_opaque_424e60_caller2_va(void);
uint32_t isaac_frame_opaque_424e60_ret_bytes(void);
uint32_t isaac_frame_opaque_424e60_array_base_off(void);
uint32_t isaac_frame_opaque_424e60_element_stride(void);
uint32_t isaac_frame_opaque_424e60_element_off(uint32_t index);
uint32_t isaac_frame_opaque_424e80_host_va(void);
uint32_t isaac_frame_opaque_424e80_end_va(void);
uint32_t isaac_frame_opaque_424e80_call_sites(void);
uint32_t isaac_frame_opaque_424e80_seh_handler_va(void);
uint32_t isaac_frame_opaque_424e80_cookie_va(void);
uint32_t isaac_frame_opaque_424e80_dtor_count(void);
uint32_t isaac_frame_opaque_424e80_host_407f10_va(void);
uint32_t isaac_frame_opaque_424e80_host_4087a0_va(void);
uint32_t isaac_frame_opaque_424e80_host_40d040_va(void);
uint32_t isaac_frame_opaque_424e80_dtor_callee_va(uint32_t index);
uint32_t isaac_frame_opaque_424e80_dtor_receiver_off(uint32_t index);
uint32_t isaac_frame_opaque_424e80_dtor_call_va(uint32_t index);
uint32_t isaac_frame_opaque_424e80_dtor_index(uint32_t off);
uint32_t isaac_frame_opaque_424ef0_host_va(void);
uint32_t isaac_frame_opaque_424ef0_end_va(void);
uint32_t isaac_frame_opaque_424ef0_call_sites(void);
uint32_t isaac_frame_opaque_424ef0_caller1_va(void);
uint32_t isaac_frame_opaque_424ef0_caller2_va(void);
uint32_t isaac_frame_opaque_424ef0_ret_bytes(void);
uint32_t isaac_frame_opaque_424ef0_seh_handler_va(void);
uint32_t isaac_frame_opaque_424ef0_cookie_va(void);
uint32_t isaac_frame_opaque_424ef0_attach_loop_continue_va(void);
uint32_t isaac_frame_opaque_424ef0_attach_call_va(void);
uint32_t isaac_frame_opaque_424ef0_attach_count(void);
int32_t isaac_frame_opaque_424ef0_attach_loop_continue(uint32_t iter);
/* FUN_00425130 CompletionWidget::Update (ABI v59):
   0x425130..0x4252e5 plain ret x2 (thiscall this=ecx, no stack args;
   GS cookie [0xbf93b4] @0x425136; NO SEH; 116 insns, 4 E8: 0x409030
   x2 (AdvancePosition pair this+0x34 / this+0x54), 0x40a7e0 x1
   (ANM2::SetLayerFrame — family pin 423CC0_HOST_LAYER_ASSIGN_VA,
   REUSED) + 0xaef12b cookie check x2). 2 direct rel32 callers
   0x0094de41 / 0x009b68fb (window-verified). Body stays HOST: the
   12-iteration loop stores 12 layer frames via host SetLayerFrame;
   the pure seams are the scalar gates + lane constants + score
   transform. The mode dword [this+0] is re-read every iteration. */
enum { ISAAC_FRAME_OPAQUE_425130_VA = 0x00425130u };
enum { ISAAC_FRAME_OPAQUE_425130_END_VA = 0x004252e6u };
enum { ISAAC_FRAME_OPAQUE_425130_CALL_SITES = 2u };
enum { ISAAC_FRAME_OPAQUE_425130_CALLER1_VA = 0x0094de41u };
enum { ISAAC_FRAME_OPAQUE_425130_CALLER2_VA = 0x009b68fbu };
enum { ISAAC_FRAME_OPAQUE_425130_COOKIE_VA = 0x00bf93b4u };
enum { ISAAC_FRAME_OPAQUE_425130_PAIR_CALL1_VA = 0x004251b1u };
enum { ISAAC_FRAME_OPAQUE_425130_PAIR_CALL2_VA = 0x004251b9u };
enum { ISAAC_FRAME_OPAQUE_425130_SET_LAYER_VA = 0x00425293u };
enum { ISAAC_FRAME_OPAQUE_425130_EARLY_EXIT_VA = 0x004252bfu };
enum { ISAAC_FRAME_OPAQUE_425130_FALLBACK_LOOP_VA = 0x004252c1u };
enum { ISAAC_FRAME_OPAQUE_425130_FALLBACK_COUNT = 0xcu };
enum { ISAAC_FRAME_OPAQUE_425130_MGR_FLAG_OFF = 0x4abbcu };
enum { ISAAC_FRAME_OPAQUE_425130_MGR_FLAG_BIT = 1u };
enum { ISAAC_FRAME_OPAQUE_425130_BYTE_10D_OFF = 0x10du };
enum { ISAAC_FRAME_OPAQUE_425130_COUNTER_OFF = 0x118u };
enum { ISAAC_FRAME_OPAQUE_425130_MP_BEGIN_OFF = 0x4b3d8u };
enum { ISAAC_FRAME_OPAQUE_425130_MP_END_OFF = 0x4b3dcu };
enum { ISAAC_FRAME_OPAQUE_425130_MP_BASE_NONEMPTY_OFF = 0x4b434u };
enum { ISAAC_FRAME_OPAQUE_425130_MP_BASE_EMPTY_OFF = 0x14u };
enum { ISAAC_FRAME_OPAQUE_425130_ELEM_ARRAY_OFF = 0x2bcu };
enum { ISAAC_FRAME_OPAQUE_425130_MODE_TABLE_VA = 0x00c35ed0u };
enum { ISAAC_FRAME_OPAQUE_425130_MODE_TABLE_STRIDE = 0x90u };
enum { ISAAC_FRAME_OPAQUE_425130_LANE_COUNT = 0xcu };
enum { ISAAC_FRAME_OPAQUE_425130_VEC_A_VA = 0x00bab240u };
enum { ISAAC_FRAME_OPAQUE_425130_VEC_B_VA = 0x00bab510u };
enum { ISAAC_FRAME_OPAQUE_425130_VEC_C_VA = 0x00bab280u };
enum { ISAAC_FRAME_OPAQUE_425130_VEC_D_VA = 0x00bab3c0u };
enum { ISAAC_FRAME_OPAQUE_425130_VEC_E_VA = 0x00bab4a0u };
uint32_t isaac_frame_opaque_425130_host_va(void);
uint32_t isaac_frame_opaque_425130_end_va(void);
uint32_t isaac_frame_opaque_425130_call_sites(void);
uint32_t isaac_frame_opaque_425130_caller1_va(void);
uint32_t isaac_frame_opaque_425130_caller2_va(void);
uint32_t isaac_frame_opaque_425130_cookie_va(void);
uint32_t isaac_frame_opaque_425130_pair_call1_va(void);
uint32_t isaac_frame_opaque_425130_pair_call2_va(void);
uint32_t isaac_frame_opaque_425130_set_layer_va(void);
uint32_t isaac_frame_opaque_425130_early_exit_va(void);
uint32_t isaac_frame_opaque_425130_fallback_loop_va(void);
uint32_t isaac_frame_opaque_425130_fallback_count(void);
uint32_t isaac_frame_opaque_425130_mgr_flag_off(void);
uint32_t isaac_frame_opaque_425130_mgr_flag_bit(void);
uint32_t isaac_frame_opaque_425130_byte_10d_off(void);
uint32_t isaac_frame_opaque_425130_counter_off(void);
uint32_t isaac_frame_opaque_425130_mp_begin_off(void);
uint32_t isaac_frame_opaque_425130_mp_end_off(void);
uint32_t isaac_frame_opaque_425130_mp_base_nonempty_off(void);
uint32_t isaac_frame_opaque_425130_mp_base_empty_off(void);
uint32_t isaac_frame_opaque_425130_elem_array_off(void);
uint32_t isaac_frame_opaque_425130_mode_table_va(void);
uint32_t isaac_frame_opaque_425130_mode_table_stride(void);
uint32_t isaac_frame_opaque_425130_lane_count(void);
uint32_t isaac_frame_opaque_425130_vec_a_va(void);
uint32_t isaac_frame_opaque_425130_vec_b_va(void);
uint32_t isaac_frame_opaque_425130_vec_c_va(void);
uint32_t isaac_frame_opaque_425130_vec_d_va(void);
uint32_t isaac_frame_opaque_425130_vec_e_va(void);
int32_t isaac_frame_opaque_425130_pair_gate(uint32_t mgr_flag_byte,
                                            uint32_t byte_10d);
int32_t isaac_frame_opaque_425130_mode_gt_0x28(uint32_t mode);
int32_t isaac_frame_opaque_425130_mode_ge_0x29(uint32_t mode);
int32_t isaac_frame_opaque_425130_mode_lt_0x15(uint32_t mode);
uint32_t isaac_frame_opaque_425130_lane1(uint32_t index);
uint32_t isaac_frame_opaque_425130_lane2(uint32_t index);
uint32_t isaac_frame_opaque_425130_elem_base_off(uint32_t mp_nonempty);
uint32_t isaac_frame_opaque_425130_elem_off(uint32_t index);
uint32_t isaac_frame_opaque_425130_table_elem_off(uint32_t mode,
                                                  uint32_t lane);
uint32_t isaac_frame_opaque_425130_score_base(uint32_t v);
uint32_t isaac_frame_opaque_425130_score_adj(uint32_t v,
                                             uint32_t mp_nonempty);
uint32_t isaac_frame_opaque_425130_score_final(uint32_t score,
                                               uint32_t lane2,
                                               uint32_t mode);
int32_t isaac_frame_opaque_425130_counter_inc(uint32_t v);
/* FUN_004252f0 CompletionWidget::Render(Vector*,Vector*) (ABI v60):
   0x4252f0..0x425357 `ret 8` @0x425357 (thiscall this=ecx, arg1
   Vector* [ebp+8], arg2 Vector* [ebp+0xc]; plain prologue, NO GS
   cookie, NO SEH; 32 insns, 3 E8 all 0x40a030 AnimationState::Render
   host — REUSED pin HOST_40A030_VA — with the overlay-clamp
   Vector& 0xc7b640 x2 (REUSED pin 421400_RENDER_ARG_VA) + arg1).
   2 direct rel32 callers 0x0094ae79 (Awards band, this=[edi+0x490])
   / 0x009b7451 (this=[esi+0xe90]) (window-verified). Body stays
   HOST; the pure seams: the UNCONDITIONAL pair copy [arg2]+0/+4 ->
   [ecx+0xa0]/[ecx+0xa4] (@0x4252fc/@0x425305), the byte-0x10d gate
   (`cmp byte [ecx+0x10d],0; je skip-all` @0x42530b — same 0x10d as
   425130), and the byte-0x74 order select (`je 0x425339` @0x42532c:
   low byte 0 -> this+0x34 first else this+0x54 first; the common
   second call @0x42534d). */
enum { ISAAC_FRAME_OPAQUE_4252F0_VA = 0x004252f0u };
enum { ISAAC_FRAME_OPAQUE_4252F0_END_VA = 0x0042535au };
enum { ISAAC_FRAME_OPAQUE_4252F0_RET_BYTES = 8u };
enum { ISAAC_FRAME_OPAQUE_4252F0_CALL_SITES = 2u };
enum { ISAAC_FRAME_OPAQUE_4252F0_CALLER1_VA = 0x0094ae79u };
enum { ISAAC_FRAME_OPAQUE_4252F0_CALLER2_VA = 0x009b7451u };
enum { ISAAC_FRAME_OPAQUE_4252F0_PAIR_X_OFF = 0xa0u };
enum { ISAAC_FRAME_OPAQUE_4252F0_PAIR_Y_OFF = 0xa4u };
enum { ISAAC_FRAME_OPAQUE_4252F0_GATE_OFF = 0x10du };
enum { ISAAC_FRAME_OPAQUE_4252F0_ORDER_OFF = 0x74u };
enum { ISAAC_FRAME_OPAQUE_4252F0_SUB0_OFF = 0x34u };
enum { ISAAC_FRAME_OPAQUE_4252F0_SUB1_OFF = 0x54u };
enum { ISAAC_FRAME_OPAQUE_4252F0_FIRST0_CALL_VA = 0x0042533bu };
enum { ISAAC_FRAME_OPAQUE_4252F0_FIRST1_CALL_VA = 0x00425330u };
enum { ISAAC_FRAME_OPAQUE_4252F0_SECOND_CALL_VA = 0x0042534du };
uint32_t isaac_frame_opaque_4252f0_host_va(void);
uint32_t isaac_frame_opaque_4252f0_end_va(void);
uint32_t isaac_frame_opaque_4252f0_ret_bytes(void);
uint32_t isaac_frame_opaque_4252f0_call_sites(void);
uint32_t isaac_frame_opaque_4252f0_caller1_va(void);
uint32_t isaac_frame_opaque_4252f0_caller2_va(void);
uint32_t isaac_frame_opaque_4252f0_pair_x_off(void);
uint32_t isaac_frame_opaque_4252f0_pair_y_off(void);
uint32_t isaac_frame_opaque_4252f0_gate_off(void);
uint32_t isaac_frame_opaque_4252f0_order_off(void);
uint32_t isaac_frame_opaque_4252f0_sub0_off(void);
uint32_t isaac_frame_opaque_4252f0_sub1_off(void);
uint32_t isaac_frame_opaque_4252f0_first0_call_va(void);
uint32_t isaac_frame_opaque_4252f0_first1_call_va(void);
uint32_t isaac_frame_opaque_4252f0_second_call_va(void);
int32_t isaac_frame_opaque_4252f0_render_gate(uint32_t byte_10d);
int32_t isaac_frame_opaque_4252f0_render_order(uint32_t byte_74);
uint32_t isaac_frame_opaque_4252f0_pair_dest_off(uint32_t index);
/* FUN_00425360 ARRAY ELEMENT DEFAULT CTOR + INIT-STORE TABLE (ABI v61):
   0x425360..0x4253a6 ret (thiscall this=ecx, NO stack args; straight-
   line, NO branch/E8/indirect, NO SEH, NO GS cookie; 12 insns). 10
   mem stores (9 FULL-dword `c7` + ONE 16-bit `66 c7` @0x42537d):
   [ecx+0x00]=0, [ecx+0x10]=0, [ecx+0x14]=0xf, [ecx+0x18]=0x16,
   word [ecx+0x1c]=0x101, [ecx+0x20..0x30]=0 (5 dwords). `mov eax,
   ecx` @0x425366 -> returns `this`. END 0x004253a7 (first byte after
   `ret` c3 @0x4253a6 — the v59/v60 0x4253a6-vs-0x4253a7 discrepancy:
   the ret IS at 0x4253a6); 9-byte int3 pad; next body 0x4253b0 (v42
   char getter). REACHABILITY: 0 direct rel32 callers (census fact)
   but ONE dword function-pointer cookie in the whole image — `push
   0x00425360` @0x006f174c inside the big enclosing 0x6f17xx ctor
   (EH states 0x13/0x14), feeding the __ehvec-style array dispatcher
   0xaef5c4 (HOST, pinned): FUN_00425360 is the ELEMENT DEFAULT CTOR
   of the 21-element/0x34-stride object array at this+0xc (loop
   `call dword ptr [ebp+0x14]` @0xaef5ec, count 0x15, stride 0x34;
   dtor cookie 0x425410 = the v43 425430_INIT_COOKIE pin REUSED, no
   duplicate) — the SAME array geometry as the v43 0x425430 copy-ctor
   (count 0x15, stride 0x34, dest this+0xc, +0x450 byte) and v44
   FINAL_BYTE_OFF 0x450. The body IS pure (the init-store table +
   return-this are the laws); dispatcher/enclosing ctor stay HOST.
   The v59/v60 "DEAD/runtime-only" label is REFINED: reachable via
   the dispatcher cookie, never via direct E8. */
enum { ISAAC_FRAME_OPAQUE_425360_VA = 0x00425360u };
enum { ISAAC_FRAME_OPAQUE_425360_END_VA = 0x004253a7u };
enum { ISAAC_FRAME_OPAQUE_425360_CALL_SITES = 0u };
enum { ISAAC_FRAME_OPAQUE_425360_COOKIE_VA = 0x006f174cu };
enum { ISAAC_FRAME_OPAQUE_425360_DISPATCHER_VA = 0x00aef5c4u };
enum { ISAAC_FRAME_OPAQUE_425360_STORE_COUNT = 10u };
enum { ISAAC_FRAME_OPAQUE_425360_NO_STORE_BYTE = 0xffu };
uint32_t isaac_frame_opaque_425360_host_va(void);
uint32_t isaac_frame_opaque_425360_end_va(void);
uint32_t isaac_frame_opaque_425360_call_sites(void);
uint32_t isaac_frame_opaque_425360_cookie_va(void);
uint32_t isaac_frame_opaque_425360_dispatcher_va(void);
uint32_t isaac_frame_opaque_425360_store_count(void);
uint32_t isaac_frame_opaque_425360_no_store_byte(void);
uint32_t isaac_frame_opaque_425360_init_store_off(uint32_t index);
uint32_t isaac_frame_opaque_425360_init_store_value(uint32_t index);
uint32_t isaac_frame_opaque_425360_init_store_width(uint32_t index);
uint32_t isaac_frame_opaque_425360_init_store_index(uint32_t off);
uint32_t isaac_frame_opaque_425360_init_store_va(uint32_t index);
int32_t isaac_frame_opaque_425360_init_has_store(uint32_t off);
uint32_t isaac_frame_opaque_425360_return_this(uint32_t this_ptr);
/* FUN_00425b70 COOP-AWARD SUB-OBJECT CTOR: 21 SEED STRINGS + 21 RECORD
   STORE STREAMS (ABI v62): 0x425b70..0x4264b0 ret (thiscall this=ecx,
   NO stack args; straight-line + 21 string-lookup/strlen/assign runs +
   21 four-store streams; NO SEH (no fs:[0]), NO GS cookie; 611 insns).
   Phase A: 21 static string-slot seeds at the head — triad `push len;
   push seed; mov ecx, slot; call 0x40ccd0` (host assign ret 8) per
   slot, slot_i = 0xc78f08 + i*0x18 (BSS strings), seeds = the 21
   `#Online/COOP_AWARD_*` rdata constants (0xb1c2e4..0xb1c534, lens
   0x19..0x20, ASCII-verified). Phase B: 21 member records base
   R_i = i*0x34 (the SAME 21x0x34 array geometry as the v61 425360
   element ctor): per record — SSO-select `cmp [slot+0x14],0x10;
   cmovae ecx,[slot]` (UNSIGNED cap >= 0x10 -> heap ptr, else the slot
   ADDRESS), host lookup `mov eax,[0xc7169c]; add eax,0x4a920; push
   ecx; push eax; call 0x9586f0` (ret 8; Manager slot
   ISAAC_FRAME_OPAQUE_MANAGER_SLOT_VA REUSED + SOURCE_OFF 0x4a920),
   pure inline strlen, `lea ecx,[this+0xc+i*0x34]` + `push len; push
   str; call 0x40ccd0` (host assign), then the 4-store stream:
   dword [R_i+0x24] A, WORD [R_i+0x28] B (the ONLY 16-bit store),
   dword [R_i+0x2c] C, dword [R_i+0x30] D. END 0x004264b1 (first byte
   after `ret` c3 @0x4264b0); 15-byte int3 pad; next body 0x4264c0
   (HOST-pinned). 1 direct rel32 caller @0x6f176f (the big 0x6f17xx
   monster ctor; ecx = Game sub-object). 63 E8 calls: 42 x host
   0x40ccd0 (ISAAC_FRAME_OPAQUE_HOST_40CCD0_VA REUSED) + 21 x host
   0x9586f0 (NEW HOST_9586F0_VA); both callees `ret 8`, stack-balanced.
   The translatable laws: the seed table (slot/VA/len), the member
   tables (string off / value A-D), the census pins, and the
   sso_uses_heap decision. index OOB -> 0; store offsets byte-width
   (& 0xffu); no duplicate pins (MANAGER_SLOT_VA / HOST_40CCD0_VA /
   HOST_4264C0_VA reused). */
enum { ISAAC_FRAME_OPAQUE_425B70_VA = 0x00425b70u };
enum { ISAAC_FRAME_OPAQUE_425B70_END_VA = 0x004264b1u };
enum { ISAAC_FRAME_OPAQUE_425B70_CALL_SITES = 1u };
enum { ISAAC_FRAME_OPAQUE_425B70_CALLSITE_VA = 0x006f176fu };
enum { ISAAC_FRAME_OPAQUE_425B70_INSNS = 611u };
enum { ISAAC_FRAME_OPAQUE_425B70_RET_VA = 0x004264b0u };
enum { ISAAC_FRAME_OPAQUE_425B70_RECORD_COUNT = 21u };
enum { ISAAC_FRAME_OPAQUE_425B70_RECORD_STRIDE = 0x34u };
enum { ISAAC_FRAME_OPAQUE_425B70_STRING_FIELD_OFF = 0xcu };
enum { ISAAC_FRAME_OPAQUE_425B70_STORE_A_OFF = 0x24u };
enum { ISAAC_FRAME_OPAQUE_425B70_STORE_B_OFF = 0x28u };
enum { ISAAC_FRAME_OPAQUE_425B70_STORE_C_OFF = 0x2cu };
enum { ISAAC_FRAME_OPAQUE_425B70_STORE_D_OFF = 0x30u };
enum { ISAAC_FRAME_OPAQUE_425B70_SLOT_BASE_VA = 0x00c78f08u };
enum { ISAAC_FRAME_OPAQUE_425B70_SLOT_STRIDE = 0x18u };
enum { ISAAC_FRAME_OPAQUE_425B70_SLOT_CAP_OFF = 0x14u };
enum { ISAAC_FRAME_OPAQUE_425B70_SSO_CAP = 0x10u };
enum { ISAAC_FRAME_OPAQUE_425B70_SOURCE_OFF = 0x4a920u };
enum { ISAAC_FRAME_OPAQUE_HOST_9586F0_VA = 0x009586f0u };
enum { ISAAC_FRAME_OPAQUE_425B70_STRING_CALLS = 42u };
enum { ISAAC_FRAME_OPAQUE_425B70_LOOKUP_CALLS = 21u };
enum { ISAAC_FRAME_OPAQUE_425B70_NO_INDEX = 0xffu };
uint32_t isaac_frame_opaque_425b70_host_va(void);
uint32_t isaac_frame_opaque_425b70_end_va(void);
uint32_t isaac_frame_opaque_425b70_call_sites(void);
uint32_t isaac_frame_opaque_425b70_callsite_va(void);
uint32_t isaac_frame_opaque_425b70_insn_count(void);
uint32_t isaac_frame_opaque_425b70_ret_va(void);
uint32_t isaac_frame_opaque_425b70_record_count(void);
uint32_t isaac_frame_opaque_425b70_record_stride(void);
uint32_t isaac_frame_opaque_425b70_string_field_off(void);
uint32_t isaac_frame_opaque_425b70_store_a_off(void);
uint32_t isaac_frame_opaque_425b70_store_b_off(void);
uint32_t isaac_frame_opaque_425b70_store_c_off(void);
uint32_t isaac_frame_opaque_425b70_store_d_off(void);
uint32_t isaac_frame_opaque_425b70_static_slot_va(uint32_t index);
uint32_t isaac_frame_opaque_425b70_static_seed_va(uint32_t index);
uint32_t isaac_frame_opaque_425b70_static_seed_len(uint32_t index);
uint32_t isaac_frame_opaque_425b70_member_string_off(uint32_t index);
uint32_t isaac_frame_opaque_425b70_member_value_a(uint32_t index);
uint32_t isaac_frame_opaque_425b70_member_value_b(uint32_t index);
uint32_t isaac_frame_opaque_425b70_member_value_c(uint32_t index);
uint32_t isaac_frame_opaque_425b70_member_value_d(uint32_t index);
int32_t isaac_frame_opaque_425b70_sso_uses_heap(uint32_t cap);
uint32_t isaac_frame_opaque_425b70_source_base_va(void);
uint32_t isaac_frame_opaque_425b70_source_off(void);
uint32_t isaac_frame_opaque_425b70_host_lookup_va(void);
uint32_t isaac_frame_opaque_425b70_host_string_va(void);
/* FUN_00425a70 0x68-STRIDE PAIR FINDER — DUPLICATE-SEAM ROW (ABI v63):
   PE 0x425a70..0x425ab5 TWO `ret 8` (miss-exit 0x425aad, found-exit
   0x425ab5; END 0x00425ab8 = first int3 of the 8-byte pad 0x425ab8..
   0x425abf; next body 0x425ac0 = frame_effect HOST-pinned
   ISAAC_FRAME_EFFECT_HOST_425AC0_VA, NOT FO-open), 35 insns, 0 E8,
   0 stores, NO SEH / NO GS (plain ebp frame; the GS epilogue before
   this body belongs to 0x4259b0 HOST). PURE body, but a STRICT
   DUPLICATE of the v27/v29 landed 4257b0 laws: count = magic-div
   (end-begin) with the SAME divider — 0x4ec4ec4f magic / shift 5 /
   0x68 stride — the FRAME_OPAQUE_4257B0_DIV_MAGIC / _DIV_SHIFT /
   _ELEM_STRIDE pins are REUSED, no duplicate pins — then a stride-0x68
   FIRST-MATCH pair scan ([e+0]==lo && [e+4]==hi; UNSIGNED jb bound)
   == `4257b0_list_count_from_bounds` + `4257b0_pass_a_scan_found`.
   Per the v62 handoff this row is PINNED (census + composition law),
   the body is NOT re-landed (duplicate-seam rule). frame_effect's
   6fdc10/6fd7c0 bodies already consume its AL (`ret_425a70` byte
   gate). 3 direct rel32 callers (lea-corrected whole-.text census,
   this unit): 0x425b24 (inside the 0x425ac0 accumulator), 0x6fdecd,
   0x78ffe9. */
enum { ISAAC_FRAME_OPAQUE_425A70_VA = 0x00425a70u };
enum { ISAAC_FRAME_OPAQUE_425A70_END_VA = 0x00425ab8u };
enum { ISAAC_FRAME_OPAQUE_425A70_CALL_SITES = 3u };
enum { ISAAC_FRAME_OPAQUE_425A70_CALLER1_VA = 0x00425b24u };
enum { ISAAC_FRAME_OPAQUE_425A70_CALLER2_VA = 0x006fdecdu };
enum { ISAAC_FRAME_OPAQUE_425A70_CALLER3_VA = 0x0078ffe9u };
enum { ISAAC_FRAME_OPAQUE_425A70_INSNS = 35u };
enum { ISAAC_FRAME_OPAQUE_425A70_RET_BYTES = 8u };
enum { ISAAC_FRAME_OPAQUE_425A70_PAIR_LO_OFF = 0u };
enum { ISAAC_FRAME_OPAQUE_425A70_PAIR_HI_OFF = 4u };
uint32_t isaac_frame_opaque_425a70_host_va(void);
uint32_t isaac_frame_opaque_425a70_end_va(void);
uint32_t isaac_frame_opaque_425a70_call_sites(void);
uint32_t isaac_frame_opaque_425a70_caller1_va(void);
uint32_t isaac_frame_opaque_425a70_caller2_va(void);
uint32_t isaac_frame_opaque_425a70_caller3_va(void);
uint32_t isaac_frame_opaque_425a70_insn_count(void);
uint32_t isaac_frame_opaque_425a70_ret_bytes(void);
uint32_t isaac_frame_opaque_425a70_pair_lo_off(void);
uint32_t isaac_frame_opaque_425a70_pair_hi_off(void);
int32_t isaac_frame_opaque_425a70_find(const uint8_t* list_base,
                                       uint32_t list_begin_va,
                                       uint32_t list_end_va,
                                       uint32_t lo, uint32_t hi);
uint32_t isaac_frame_opaque_pure_helpers_abi_version(void);

#ifdef __cplusplus
}
#endif
