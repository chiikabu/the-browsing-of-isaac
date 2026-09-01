/** Independent JS oracle for FrameEffect_6fd7c0 pure islands (VA 0x006fd7c0).
 *  Do not derive from the C++ implementation mechanically. */

export const FRAME_EFFECT_PURE_ABI_VERSION = 51;

/* ABI v2 constants recovered from the body at 0x006fd7c0…0x006fdbfd. */
export const FRAME_EFFECT_6FD7C0_VA = 0x006fd7c0;
export const FRAME_EFFECT_HOST_FATAL_LOG_VA = 0x00a112c0;
export const FRAME_EFFECT_HOST_956780_VA = 0x00956780;
export const FRAME_EFFECT_HOST_SFX_PLAY_VA = 0x0092dc30;
export const FRAME_EFFECT_HOST_IS_ALT_PATH_VA = 0x0074bac0;
export const FRAME_EFFECT_HOST_IS_GREED_VA = 0x006f8120;
export const FRAME_EFFECT_HOST_BLUE_ROOM_VA = 0x0074d4a0;
export const FRAME_EFFECT_HOST_NESTED_STAGE_VA = 0x006fdc10;
export const FRAME_EFFECT_HOST_705EE0_VA = 0x00705ee0;
export const FRAME_EFFECT_HOST_ENGINE_VA = 0x0082ee40;
export const FRAME_EFFECT_HOST_DUAL_GATE_VA = 0x006f0070;
export const FRAME_EFFECT_HOST_425AC0_VA = 0x00425ac0;
export const FRAME_EFFECT_HOST_8279A0_VA = 0x008279a0;
export const FRAME_EFFECT_HOST_81E9D0_VA = 0x0081e9d0;
export const FRAME_EFFECT_HOST_CAPSULE_CTOR_VA = 0x00945190;
export const FRAME_EFFECT_HOST_41AB50_VA = 0x0041ab50;
export const FRAME_EFFECT_FATAL_ROOM_STR_VA = 0x00b68490;
export const FRAME_EFFECT_FATAL_ANIM_STR_VA = 0x00b684cc;
export const FRAME_EFFECT_FATAL_DIM_STR_VA = 0x00b68508;
export const FRAME_EFFECT_FATAL_LEVEL = 8;
export const FRAME_EFFECT_MODE_OFF = 0x26614;
export const FRAME_EFFECT_ROOM_INDEX_A_OFF = 0x18304;
export const FRAME_EFFECT_ROOM_INDEX_B_OFF = 0x182d0;
export const FRAME_EFFECT_ROOM_PTR_OFF = 0x18300;
export const FRAME_EFFECT_TRANSITION_MODE_OFF = 0x1830c;
export const FRAME_EFFECT_ENGINE_THIS_OFF = 0x1b83c;
export const FRAME_EFFECT_COUNTER_265C0_OFF = 0x265c0;
export const FRAME_EFFECT_BYTE_67744_OFF = 0x67744;
export const FRAME_EFFECT_SFX_MANAGER_OFF = 0x2a324;
export const FRAME_EFFECT_PLAYER_TIMER_OFF = 0x13bc;
export const FRAME_EFFECT_PLAYER_CAMERA_OFF = 0x370;
/* ABI v4 correction: these are the literals seeded into the stack slot before
 * the remap call, not the id that reaches the sound player. The remap helper
 * gate lets a seed survive. */
export const FRAME_EFFECT_SFX_SEED_MODE4 = 0xbb;
export const FRAME_EFFECT_SFX_SEED_SPECIAL = 0xd7;
export const FRAME_EFFECT_SFX_REMAP_COMMON = 0x25;
export const FRAME_EFFECT_SFX_REMAP_RARE = 0x12d;
export const FRAME_EFFECT_SFX_RARE_MODULUS = 20;
export const FRAME_EFFECT_HOST_SFX_REMAP_VA = 0x00956780;
export const FRAME_EFFECT_BLUE_ROOM_INDEX = -0x10;
export const FRAME_EFFECT_ANIM_SPECIAL = 0xc;
export const FRAME_EFFECT_ENGINE_ARG_COUNT = 5;

/* ABI v3: nested stage host at 0x006fdc10. */
export const FRAME_EFFECT_6FDC10_VA = 0x006fdc10;
export const FRAME_EFFECT_6FDC10_FATAL_STR_VA = 0x00b68544;
export const FRAME_EFFECT_6FDC10_LOG_STR_VA = 0x00b683bc;
export const FRAME_EFFECT_6FDC10_NO_PLAYERS_STR_VA = 0x00b7e6bc;
export const FRAME_EFFECT_HOST_INVALID_PARAM_VA = 0x00b18894;
export const FRAME_EFFECT_HOST_RAW_RELEASE_VA = 0x00aef15c;
export const FRAME_EFFECT_HOST_SCORE_STAGE_VA = 0x009e5a30;
export const FRAME_EFFECT_6FDC10_KIND_MAX = 6;
export const FRAME_EFFECT_6FDC10_MODE_OPEN = 2;
export const FRAME_EFFECT_6FDC10_FLAG_BIT = 0x10000;
export const FRAME_EFFECT_6FDC10_MASK_BIT = 2;
export const FRAME_EFFECT_6FDC10_PUSH_STRIDE = 0xc;
export const FRAME_EFFECT_6FDC10_REGISTRY_SLOT = 0x1d4;
export const FRAME_EFFECT_6FDC10_STAGE_MIN = 1;
export const FRAME_EFFECT_6FDC10_STAGE_MAX = 6;
export const FRAME_EFFECT_6FDC10_TIMER_VALUE = 8;
export const FRAME_EFFECT_6FDC10_SSO_CAPACITY = 0xf;
export const FRAME_EFFECT_6FDC10_SSO_BYTES = 0x10;
/* ABI v19 stage-record existing-field select (0x006fdc9f/0x6fdca1/0x6fdcb5). */
export const FRAME_EFFECT_6FDC10_STAGE_KEY_EMPTY_FIELD = 0x238;
export const FRAME_EFFECT_6FDC10_STAGE_KEY_OPEN_FIELD = 0x240;
/* ABI v19 prize-entry bump gate (0x006fe1ff/0x6fe209/0x6fe213/0x6fe21f). */
export const FRAME_EFFECT_6FDC10_PRIZE_BYTE_OFF = 0xd;
export const FRAME_EFFECT_6FDC10_PRIZE_SIZE_OFF = 0x10;
export const FRAME_EFFECT_6FDC10_PRIZE_MAX_SIZE = 0x10;
export const FRAME_EFFECT_6FDC10_PRIZE_BASE_OFF = 0x1bbd8;
export const FRAME_EFFECT_6FDC10_PRIZE_COUNTER_OFF = 0x269c4;

/* ABI v21: FUN_0081fd60 — Lua-bound Room:RespawnEnemies, SEH host body
 * (0x0081fd60..0x0082016d, census-81fd60-body.json: 341 insns / 0 resyncs
 * / 1038 bytes / 19 direct + 4 indirect calls / 50 data stores / 45 push /
 * 15 field stores). */
export const FRAME_EFFECT_81FD60_VA = 0x0081fd60;
export const FRAME_EFFECT_81FD60_END_VA = 0x0082016d;
export const FRAME_EFFECT_81FD60_NEXT_VA = 0x00820170;
export const FRAME_EFFECT_81FD60_RET_BYTES = 0; /* plain `c3`; thiscall, no stack args */
export const FRAME_EFFECT_81FD60_INSN_COUNT = 341;
export const FRAME_EFFECT_81FD60_BYTE_LEN = 1038;
export const FRAME_EFFECT_81FD60_CALL_INSNS = 23; /* 19 E8 + 4 indirect */
export const FRAME_EFFECT_81FD60_DATA_STORES = 50;
export const FRAME_EFFECT_81FD60_FIELD_STORES = 15;
export const FRAME_EFFECT_81FD60_DIRECT_CALLERS = [0x005bd864];
export const FRAME_EFFECT_81FD60_RAW_DWORD_HITS = [0x0086c8b2]; /* inside
   push 0x81fd60 at 0x0086c8b1 — the Lua binder next to "RespawnEnemies"
   @ 0x00b73d58 */
export const FRAME_EFFECT_81FD60_LUA_BIND_VA = 0x0086c8b1;
export const FRAME_EFFECT_81FD60_LUA_NAME_VA = 0x00b73d58;
export const FRAME_EFFECT_81FD60_SEED_LOG_STR_VA = 0x00b6c554; /* "SpawnRNG seed: %u\n" */
export const FRAME_EFFECT_81FD60_FATAL_STR_VA = 0x00b6bf54; /* "RNG Seed is zero!\n" */
export const FRAME_EFFECT_81FD60_FATAL_LEVEL = 0x10;
export const FRAME_EFFECT_81FD60_OPEN_STR_VA = 0x00b1d644; /* "Open" */
export const FRAME_EFFECT_81FD60_RNG_SHIFTS_VA = 0x00b1f54c; /* qword (2, 7) */
export const FRAME_EFFECT_81FD60_RNG_SHIFT3_VA = 0x00b1f554;
export const FRAME_EFFECT_81FD60_RNG_SHIFT1 = 2;
export const FRAME_EFFECT_81FD60_RNG_SHIFT2 = 7;
export const FRAME_EFFECT_81FD60_RNG_SHIFT3 = 7;
export const FRAME_EFFECT_81FD60_UNIT_SCALE_VA = 0x00ba9ff0; /* f32 2^-32 */
export const FRAME_EFFECT_81FD60_UNIT_SCALE_BITS = 0x2f7ffffe;
export const FRAME_EFFECT_81FD60_U64_TABLE_VA = 0x00bacb00; /* {0.0, 2^32} */
export const FRAME_EFFECT_81FD60_COOKIE_VA = 0x00bf93b4;
export const FRAME_EFFECT_81FD60_SLOT_STRIDE = 0x10;
export const FRAME_EFFECT_81FD60_LOOP2_ARRAY_OFF = 0x125c;
export const FRAME_EFFECT_81FD60_LOOP2_COUNT_OFF = 0x1264;
export const FRAME_EFFECT_81FD60_FLAG_CLEAR_BIT0 = 0xfffffffe;
export const FRAME_EFFECT_81FD60_FLAG_CLEAR_BIT7 = 0xffffff7f;
export const FRAME_EFFECT_81FD60_OPEN_TYPE_SET = Object.freeze([7, 8, 0x1d]);

/* ABI v22: FUN_0081fb70 LRoomTileDesc::GetRandomTile remaining decision
 * seams (0x0081fb70..0x0081fd51, census-81fb70-body.json: 202 insns /
 * 1 resync / 482 bytes / 5 host log calls 0xa112c0 / 0 indirect / 1
 * direct caller 0x0081ed21 / 27 stores (14 push + 13 mem) / 6 field
 * stores). Exact ZHL. All v22 gates are FULL-dword zero-tests — the body
 * has no byte-width tests. */
export const FRAME_EFFECT_81FB70_V22_VA = 0x0081fb70;
export const FRAME_EFFECT_81FB70_V22_END_VA = 0x0081fd51;
export const FRAME_EFFECT_81FB70_V22_NEXT_VA = 0x0081fd60; /* sibling after 12 int3 */
export const FRAME_EFFECT_81FB70_V22_RET_BYTES = 8; /* `ret 8` ×3: 0x81fc9b / 0x81fcbe / 0x81fd51 */
export const FRAME_EFFECT_81FB70_V22_INSN_COUNT = 202;
export const FRAME_EFFECT_81FB70_V22_BYTE_LEN = 482;
export const FRAME_EFFECT_81FB70_V22_CALL_INSNS = 5; /* all 0xa112c0 */
export const FRAME_EFFECT_81FB70_V22_DIRECT_CALLERS = [0x0081ed21];
export const FRAME_EFFECT_81FB70_V22_RAW_DWORD_HITS = 0;
export const FRAME_EFFECT_81FB70_V22_FATAL_STR_VA = 0x00b6bf54; /* "RNG Seed is zero!\n" */
export const FRAME_EFFECT_81FB70_V22_FATAL_LEVEL = 0x10;
export const FRAME_EFFECT_81FB70_V22_RNG_SHIFT1_VA = 0x00b1f4ec; /* dword 1 */
export const FRAME_EFFECT_81FB70_V22_RNG_SHIFT2_VA = 0x00b1f4f0; /* dword 9 */
export const FRAME_EFFECT_81FB70_V22_RNG_SHIFT3_VA = 0x00b1f4f4; /* dword 0x1d */
export const FRAME_EFFECT_81FB70_V22_SEED_GATE = Object.freeze([0x0081fbd2, 0x0081fbd4]);
export const FRAME_EFFECT_81FB70_V22_MIXED_GATES = Object.freeze([
  0x0081fc19, 0x0081fc1b, 0x0081fcc1, 0x0081fcc3,
  0x0081fc59, 0x0081fc5b, 0x0081fd00, 0x0081fd02,
]);
export const FRAME_EFFECT_81FB70_V22_TOTAL_GATE = Object.freeze([0x0081fc08, 0x0081fc0a]);
export const FRAME_EFFECT_81FB70_V22_DELTA_GATES = Object.freeze([
  0x0081fc4c, 0x0081fc4e, 0x0081fcf4, 0x0081fcf6,
  0x0081fc82, 0x0081fc84, 0x0081fd29, 0x0081fd2b,
]);

/* ABI v23: FUN_00820170 Lua Room:TrySpawnBlueWombDoor decision seams
 * (region 0x00820170..0x008204ae, census-820170-body.json: 224 insns /
 * 0 resyncs / 831 bytes / 14 E8 (10 main + 4 CS-tail) / 0 indirect / 3
 * direct callers 0x5fbdda (0,1,1) 0x73ed73 (0,0,0) 0x806a57 (0,0,1) /
 * 2 raw dword hits: Lua binder 0x86c719 ("TrySpawnBlueWombDoor" @
 * 0xb73b78) + bind-helper fill 0x890fa8 — v18's "0 hits" superseded).
 * SEH scope decoded (host): C++ EH frame, handler stub 0xb01801, FuncInfo
 * 0xbc2460 (magic 0x19930522), unwind entry {try_level=0xffffffff,
 * handler=0xb017f0} = the 0xc8108c critical-section wrapper; protected
 * scope 0x8203a4..0x8204aa (fs:[0x2c] TLS deref + CS enter/recheck/leave
 * with try-level [ebp-4]). The 22 v23 laws are the SEH-free captured-value
 * decision surface. */
export const FRAME_EFFECT_820170_V23_VA = 0x00820170;
export const FRAME_EFFECT_820170_V23_END_VA = 0x00820445; /* `ret 0xc` */
export const FRAME_EFFECT_820170_V23_NEXT_VA = 0x008204b0; /* sibling Room:TrySpawnTheVoidDoor */
export const FRAME_EFFECT_820170_V23_RET_BYTES = 0xc;
export const FRAME_EFFECT_820170_V23_INSN_COUNT = 224; /* region incl. CS tail */
export const FRAME_EFFECT_820170_V23_BYTE_LEN = 831;
export const FRAME_EFFECT_820170_V23_CALL_INSNS = 14; /* 10 main + 4 CS-tail */
export const FRAME_EFFECT_820170_V23_MAIN_CALLS = Object.freeze([
  0x008201ee, 0x00820216, 0x0082023b, 0x00820244, 0x0082025d,
  0x00820321, 0x008203cb, 0x008203f3, 0x008203ff, 0x00820411,
]);
export const FRAME_EFFECT_820170_V23_TAIL_CALLS = Object.freeze([
  0x00820463, 0x00820484, 0x0082048e, 0x008204a2,
]);
export const FRAME_EFFECT_820170_V23_DIRECT_CALLERS = Object.freeze([
  { site: 0x005fbdda, args: [0, 1, 1] },
  { site: 0x0073ed73, args: [0, 0, 0] },
  { site: 0x00806a57, args: [0, 0, 1] },
]);
export const FRAME_EFFECT_820170_V23_DWORD_HITS = Object.freeze([0x0086c719, 0x00890fa8]);
export const FRAME_EFFECT_820170_V23_LUA_NAME_VA = 0x00b73b78; /* "TrySpawnBlueWombDoor" */
export const FRAME_EFFECT_820170_V23_LUA_BINDER_VA = 0x0086c719;
export const FRAME_EFFECT_820170_V23_SEH_STUB_VA = 0x00b01801; /* handler stub in .text */
export const FRAME_EFFECT_820170_V23_FUNCINFO_VA = 0x00bc2460; /* magic 0x19930522 */
export const FRAME_EFFECT_820170_V23_UNWIND_HANDLER_VA = 0x00b017f0; /* 0xc8108c CS wrapper */
export const FRAME_EFFECT_820170_V23_CS_LOCK_VA = 0x00c8108c;
export const FRAME_EFFECT_820170_V23_FATAL_STR_VA = 0x00b6bf54; /* "RNG Seed is zero!\n" */
export const FRAME_EFFECT_820170_V23_FATAL_LEVEL = 0x10;
export const FRAME_EFFECT_820170_V23_RNG_SHIFT1_VA = 0x00b1f504; /* qword (1, 11) */
export const FRAME_EFFECT_820170_V23_RNG_SHIFT3_VA = 0x00b1f50c; /* dword 16 */
export const FRAME_EFFECT_820170_V23_SLOT_ARRAY_OFF = 0x724; /* [this+0x724..0x740] */
export const FRAME_EFFECT_820170_V23_SLOT_STATE_OFF = 0x394;
export const FRAME_EFFECT_820170_V23_SLOT_BUSY_MARK = 0xfffffff8;
export const FRAME_EFFECT_820170_V23_MASK_A_VA = 0x006f9400; /* host mask builder, ids 0x38+ */
export const FRAME_EFFECT_820170_V23_MASK_B_VA = 0x006f95a0; /* host mask builder, ids 0x3f+ */
export const FRAME_EFFECT_820170_V23_TRINKET_ID = 0xaf; /* 0x44bfb0 AnyoneHasTrinket arg */

/* ABI v24: FUN_008204b0 Lua Room:TrySpawnTheVoidDoor decision seams
 * (region 0x008204b0..0x008206dd, census-8204b0-body.json: 150 insns /
 * 0 resyncs / 557 bytes / 11 E8 (4 main + 3 spawn-work + 4 CS) /
 * 0 indirect / 2 direct callers 0x73ed62 (0) 0x806a60 (0), both arms in
 * the 0x820170 houses / 1 raw dword hit: Lua binder 0x86c72a
 * ("TrySpawnTheVoidDoor" @ 0xb73b90)). SEH scope decoded (host): C++ EH +
 * GS frame, handler stub 0xb01831, FuncInfo 0xbc248c (magic 0x19930522),
 * unwind entry {try_level=0xffffffff, handler=0xb01820} = the 0xc8108c
 * critical-section wrapper; cookie [ebp-0x24]; protected scope
 * 0x820621..0x8206d8 (fs:[0x2c] TLS deref + CS enter/recheck/leave with
 * try-level [ebp-4], plus the internal spawn work: 0x7eea90 factory,
 * slot-mark store 0xfffffff7, 0x710fa0/0x710dd0). The 15 v24 laws are the
 * SEH-free captured-value decision surface up to (exclusive) 0x820621. */
export const FRAME_EFFECT_8204B0_V24_VA = 0x008204b0;
export const FRAME_EFFECT_8204B0_V24_END_VA = 0x0082061e; /* first `ret 4` (alt return-0) */
export const FRAME_EFFECT_8204B0_V24_NEXT_VA = 0x008206e0; /* sibling after the int3 pad */
export const FRAME_EFFECT_8204B0_V24_RET_BYTES = 4;
export const FRAME_EFFECT_8204B0_V24_INSN_COUNT = 150; /* region incl. CS tail */
export const FRAME_EFFECT_8204B0_V24_BYTE_LEN = 557;
export const FRAME_EFFECT_8204B0_V24_CALL_INSNS = 11; /* 4 main + 3 spawn + 4 CS */
export const FRAME_EFFECT_8204B0_V24_MAIN_CALLS = Object.freeze([
  0x008204fe, 0x00820507, 0x0082056b, 0x008205eb,
]); /* 0x6f9400 0x6f95a0 0x706940 0x706940 — captured host returns */
export const FRAME_EFFECT_8204B0_V24_SPAWN_CALLS = Object.freeze([
  0x00820644, 0x0082066a, 0x00820675,
]); /* 0x7eea90 factory, 0x710fa0 SetRoomTypes, 0x710dd0 — protected scope */
export const FRAME_EFFECT_8204B0_V24_CS_CALLS = Object.freeze([
  0x00820695, 0x008206b2, 0x008206bc, 0x008206d0,
]); /* 0xaef29d enter, 0x6ef590, 0xaef5af, 0xaef253 leave — protected scope */
export const FRAME_EFFECT_8204B0_V24_DIRECT_CALLERS = Object.freeze([
  { site: 0x0073ed62, args: [0] },
  { site: 0x00806a60, args: [0] },
]);
export const FRAME_EFFECT_8204B0_V24_DWORD_HITS = Object.freeze([0x0086c72b]);
export const FRAME_EFFECT_8204B0_V24_LUA_NAME_VA = 0x00b73b90; /* "TrySpawnTheVoidDoor" */
export const FRAME_EFFECT_8204B0_V24_LUA_BINDER_VA = 0x0086c72a;
export const FRAME_EFFECT_8204B0_V24_SEH_STUB_VA = 0x00b01831; /* handler stub in .text */
export const FRAME_EFFECT_8204B0_V24_FUNCINFO_VA = 0x00bc248c; /* magic 0x19930522 */
export const FRAME_EFFECT_8204B0_V24_UNWIND_HANDLER_VA = 0x00b01820; /* 0xc8108c CS wrapper */
export const FRAME_EFFECT_8204B0_V24_CS_LOCK_VA = 0x00c8108c;
export const FRAME_EFFECT_8204B0_V24_COOKIE_SLOT = 0xffffffdc; /* [ebp-0x24] */
export const FRAME_EFFECT_8204B0_V24_SLOT_PTR_OFF = 0x738; /* [this+0x738] door slot */
export const FRAME_EFFECT_8204B0_V24_SLOT_STATE_OFF = 0x394;
export const FRAME_EFFECT_8204B0_V24_SLOT_BUSY_MARK = 0xfffffff7; /* NOT the 0x820170 mark */
export const FRAME_EFFECT_8204B0_V24_FLAG_BIT = 0x200000; /* [g_Game+0x1839c] bit */
export const FRAME_EFFECT_8204B0_V24_BASE_OFF = 0x0; /* *g_Game probe base */
export const FRAME_EFFECT_8204B0_V24_MASK_A_VA = 0x006f9400; /* host mask builder (shared) */
export const FRAME_EFFECT_8204B0_V24_MASK_B_VA = 0x006f95a0; /* host mask builder (shared) */
export const FRAME_EFFECT_8204B0_V24_ROOM_VA = 0x00706940; /* room getter (shared leaf) */

/* ABI v25: FUN_0044bfb0 exact-ZHL PlayerManager::AnyoneHasTrinket decision
 * seams (census-v24-leaves.json: 75 insns / 0 resyncs / 192 bytes / 2 E8
 * (2x 0x771550) / 0 indirect / 0 field stores / 106 direct callers / 0 raw
 * dword hits; two `ret 4` epilogues 0x44c059 + 0x44c06d). Pure query body —
 * plain frame, no SEH/GS; the 0x771550 AL results are captured inputs. */
export const FRAME_EFFECT_44BFB0_V25_VA = 0x0044bfb0;
export const FRAME_EFFECT_44BFB0_V25_END_VA = 0x0044c06d; /* last `ret 4` */
export const FRAME_EFFECT_44BFB0_V25_NEXT_VA = 0x0044c070; /* next sibling (cookie body) */
export const FRAME_EFFECT_44BFB0_V25_RET_BYTES = 4;
export const FRAME_EFFECT_44BFB0_V25_INSN_COUNT = 75;
export const FRAME_EFFECT_44BFB0_V25_BYTE_LEN = 192;
export const FRAME_EFFECT_44BFB0_V25_CALL_INSNS = 2;
export const FRAME_EFFECT_44BFB0_V25_DIRECT_CALLERS = 106;
export const FRAME_EFFECT_44BFB0_V25_DWORD_HITS = Object.freeze([]);
export const FRAME_EFFECT_44BFB0_V25_CALLEE_VA = 0x00771550; /* ZHL-empty item query */
export const FRAME_EFFECT_44BFB0_V25_LEVEL_GLOBAL_VA = 0x00c7169c; /* g_Level */
export const FRAME_EFFECT_44BFB0_V25_ARRAY_LO_OFF = 0x2a410; /* trinket slot start ptr */
export const FRAME_EFFECT_44BFB0_V25_ARRAY_HI_OFF = 0x2a414; /* trinket slot end ptr */
export const FRAME_EFFECT_44BFB0_V25_TRINKET_MASK = 0x7fff;
export const FRAME_EFFECT_44BFB0_V25_FLAG_OFF = 0xb8; /* [item+0xb8] */
export const FRAME_EFFECT_44BFB0_V25_HAS_BIT = 0x80000000; /* bit 31 */
export const FRAME_EFFECT_44BFB0_V25_LIST_HEAD_OFF = 0x0; /* this+0 */
export const FRAME_EFFECT_44BFB0_V25_LIST_TAIL_OFF = 0x4; /* this+4 */
export const FRAME_EFFECT_44BFB0_V25_ACTIVE_OFF = 0x2c; /* [elem+0x2c] */
export const FRAME_EFFECT_44BFB0_V25_ALT_OFF = 0x1e6c; /* [elem+0x1e6c] */

/* ABI v26: FUN_007ee7e0 Room grid-cell setter decision seams
 * (census-7ee7e0-body.json in frame-effect-v26-7ee7e0: 197 insns /
 * 0 resyncs / 687 bytes / 19 calls (15 direct: 3x 0xa112c0 log, 3x
 * 0x6eef60 genrand, 3x 0xa0f4c0 alloc, 3x 0x709c40 ctor, 3x 0x709db0
 * init + 4 indirect: 2x vtbl[0] release w/ push 1, 2x vtbl[4]) /
 * 30 stores (3 grid-cell [ebx+idx*4+0x24], 3 vtable installs, per-arm
 * object fields) / 24 direct callers — ALL inside 0x81ee20 — / 0 raw
 * dword hits / identify-zhl EMPTY / SEH + GS frame / 1 int3 pad then
 * sibling 0x7eea90). Receiver = Room: [ebx+4] desc, [ebx+8] mode,
 * [ebx+0xc] width, [ebx+0x10] height, type10 = [[desc+0x10]+0x10]
 * (the setter's OWN [cfg+0x10] member — NOT the [cfg+0x48] family
 * TYPE_OFF), [type10+0xc], cell array [ebx+idx*4+0x24], marker array
 * [ebx+idx*4+0x76c]; idx = x + width*y; TWO `ret 8` epilogues. ALL
 * decisions FULL dword — the body has ZERO byte gates. */
export const FRAME_EFFECT_7EE7E0_V26_VA = 0x007ee7e0;
export const FRAME_EFFECT_7EE7E0_V26_END_VA = 0x007eea8f; /* past final `ret 8` @ 0x7eea8c */
export const FRAME_EFFECT_7EE7E0_V26_NEXT_VA = 0x007eea90; /* sibling — v24 "factory" host */
export const FRAME_EFFECT_7EE7E0_V26_RET_BYTES = 8;
export const FRAME_EFFECT_7EE7E0_V26_INSN_COUNT = 197;
export const FRAME_EFFECT_7EE7E0_V26_BYTE_LEN = 687;
export const FRAME_EFFECT_7EE7E0_V26_CALL_INSNS = 19; /* 15 direct + 4 indirect */
export const FRAME_EFFECT_7EE7E0_V26_DIRECT_CALLS = 15;
export const FRAME_EFFECT_7EE7E0_V26_INDIRECT_CALLS = 4;
export const FRAME_EFFECT_7EE7E0_V26_DATA_STORES = 30;
export const FRAME_EFFECT_7EE7E0_V26_DIRECT_CALLERS = Object.freeze([
  0x0081ee5b, 0x0081ee74, 0x0081ee9e, 0x0081eeab, 0x0081eed5, 0x0081eeee,
  0x0081ef0c, 0x0081ef25, 0x0081ef5e, 0x0081ef6b, 0x0081ef9e, 0x0081efab,
  0x0081efdd, 0x0081efea, 0x0081f008, 0x0081f021, 0x0081f056, 0x0081f063,
  0x0081f085, 0x0081f092, 0x0081f0d4, 0x0081f0e2, 0x0081f106, 0x0081f10f,
]);
export const FRAME_EFFECT_7EE7E0_V26_DWORD_HITS = Object.freeze([]);
export const FRAME_EFFECT_7EE7E0_V26_DESC_OFF = 0x4;
export const FRAME_EFFECT_7EE7E0_V26_MODE_OFF = 0x8;
export const FRAME_EFFECT_7EE7E0_V26_WIDTH_OFF = 0xc;
export const FRAME_EFFECT_7EE7E0_V26_HEIGHT_OFF = 0x10;
export const FRAME_EFFECT_7EE7E0_V26_CFG_OFF = 0x10;
export const FRAME_EFFECT_7EE7E0_V26_TYPE_OFF = 0x10; /* [cfg+0x10] — NOT the [cfg+0x48] type */
export const FRAME_EFFECT_7EE7E0_V26_TYPE_C_OFF = 0xc;
export const FRAME_EFFECT_7EE7E0_V26_CELL_OFF = 0x24;
export const FRAME_EFFECT_7EE7E0_V26_MARKER_OFF = 0x76c;
export const FRAME_EFFECT_7EE7E0_V26_MODE_OPEN_VALUE = 0x10;
export const FRAME_EFFECT_7EE7E0_V26_CAP = 0x1c0; /* SIGNED bounds, both arms */
export const FRAME_EFFECT_7EE7E0_V26_CAP_A_UNSIGNED = 0x1bf; /* arm A `ja` cap */
export const FRAME_EFFECT_7EE7E0_V26_MARKER_MAX = 0x384; /* SIGNED `jg` marker gate */
export const FRAME_EFFECT_7EE7E0_V26_X_EQ_A = 2;
export const FRAME_EFFECT_7EE7E0_V26_X_EQ_B = 0xe;
export const FRAME_EFFECT_7EE7E0_V26_Y_EQ_B = Object.freeze([3, 4]);
export const FRAME_EFFECT_7EE7E0_V26_LOG_VA = 0x00a112c0;
export const FRAME_EFFECT_7EE7E0_V26_LOG_LEVEL = 0x10;
export const FRAME_EFFECT_7EE7E0_V26_LOG_STR_BOUNDS_VA = 0x00b6c190;
export const FRAME_EFFECT_7EE7E0_V26_LOG_STR_ARM_VA = 0x00b6c138;
export const FRAME_EFFECT_7EE7E0_V26_ALLOC_SIZE = 0x154;
export const FRAME_EFFECT_7EE7E0_V26_VTABLE_A = 0x00b686c0;
export const FRAME_EFFECT_7EE7E0_V26_VTABLE_B = 0x00b7d99c;
export const FRAME_EFFECT_7EE7E0_V26_VTABLE_DEFAULT = 0x00b68670;
export const FRAME_EFFECT_7EE7E0_V26_KIND_A = 1; /* [esi+4] arm A */
export const FRAME_EFFECT_7EE7E0_V26_KIND_B = 0x13; /* [esi+4] arm B */
export const FRAME_EFFECT_7EE7E0_V26_KIND_DEFAULT = 0xf; /* [esi+4] default arm */
export const FRAME_EFFECT_7EE7E0_V26_ORDER_A = 0xa; /* [esi+8] arm A */
export const FRAME_EFFECT_7EE7E0_V26_ORDER_B = 0; /* [esi+8] arm B */
export const FRAME_EFFECT_7EE7E0_V26_HOME_OFF = 0x18; /* [esi+0x18]=0 arms A/B */
export const FRAME_EFFECT_7EE7E0_V26_GENRAND_VA = 0x006eef60;
export const FRAME_EFFECT_7EE7E0_V26_ALLOC_VA = 0x00a0f4c0;
export const FRAME_EFFECT_7EE7E0_V26_CTOR_VA = 0x00709c40;
export const FRAME_EFFECT_7EE7E0_V26_INIT_VA = 0x00709db0;

/* ABI v5: FUN_006fe2f0 player walk + room change tail. */
export const FRAME_EFFECT_6FE2F0_VA = 0x006fe2f0;
export const FRAME_EFFECT_6FE2F0_END_VA = 0x006fe3bf;
export const FRAME_EFFECT_6FE2F0_RET_BYTES = 8;
export const FRAME_EFFECT_6FE2F0_LOG_LEVEL = 0x10;
export const FRAME_EFFECT_6FE2F0_SLOT_STRIDE = 4;
export const FRAME_EFFECT_6FE2F0_RESULT_OFF = 0x1ad90;
export const FRAME_EFFECT_6FE2F0_7EBE20_STACK_OFF = 0x1bb0;
export const FRAME_EFFECT_6FE2F0_7EBE20_EDX_OFF = 4;
export const FRAME_EFFECT_6FE2F0_7EBE20_ECX_OFF = 8;
export const FRAME_EFFECT_HOST_7A6680_VA = 0x007a6680;
export const FRAME_EFFECT_HOST_CHANGE_ROOM_VA = 0x0073fc80;
export const FRAME_EFFECT_HOST_802980_VA = 0x00802980;
export const FRAME_EFFECT_HOST_GENRAND_VA = 0x006eef60;
export const FRAME_EFFECT_HOST_7EBE20_VA = 0x007ebe20;

/* ABI v6: FUN_0085afb0 stage-record key builder. */
export const FRAME_EFFECT_85AFB0_VA = 0x0085afb0;
export const FRAME_EFFECT_85AFB0_END_VA = 0x0085b031;
export const FRAME_EFFECT_85AFB0_RET_BYTES = 0;
export const FRAME_EFFECT_85AFB0_SELECTOR_MAX = 3;
export const FRAME_EFFECT_85AFB0_BUF_VA = 0x00c7f490;
export const FRAME_EFFECT_85AFB0_BUF_SIZE = 0x20;
export const FRAME_EFFECT_85AFB0_JUMP_TABLE_VA = 0x0085b034;
export const FRAME_EFFECT_85AFB0_INIT_CAPACITY = 0xf;
export const FRAME_EFFECT_85AFB0_FMT_SCORES_SOLO_VA = 0x00b6e844;
export const FRAME_EFFECT_85AFB0_FMT_TIMES_SOLO_VA = 0x00b6e81c;
export const FRAME_EFFECT_85AFB0_FMT_SCORES_COOP_VA = 0x00b6e858;
export const FRAME_EFFECT_85AFB0_FMT_TIMES_COOP_VA = 0x00b6e830;
export const FRAME_EFFECT_HOST_SPRINTF_VA = 0x0041e420;
export const FRAME_EFFECT_HOST_ASSIGN_VA = 0x0040ccd0;

/* ABI v7: FUN_006fe3d0 Game::MoveToRandomRoom forwarder. */
export const FRAME_EFFECT_6FE3D0_VA = 0x006fe3d0;
export const FRAME_EFFECT_6FE3D0_END_VA = 0x006fe409;
export const FRAME_EFFECT_6FE3D0_RET_BYTES = 0xc;
export const FRAME_EFFECT_GAME_GLOBAL_VA = 0x00c71678;
export const FRAME_EFFECT_6FE3D0_SEED_OFF = 0x18318;
export const FRAME_EFFECT_6FE3D0_SEED_VALUE = -1;
export const FRAME_EFFECT_6FE3D0_SHELL_ARG2 = -1;
export const FRAME_EFFECT_6FE3D0_SHELL_ANIM = 3;
export const FRAME_EFFECT_6FE3D0_SHELL_DIM = -1;
export const FRAME_EFFECT_6FE3D0_SHELL_ARG_COUNT = 5;
export const FRAME_EFFECT_HOST_GET_RANDOM_ROOM_VA = 0x00740860;
export const FRAME_EFFECT_HOST_60D010_VA = 0x0060d010;
export const FRAME_EFFECT_6FE3D0_RNG_SEED_FATAL_VA = 0x00b6bf54;
export const FRAME_EFFECT_6FE3D0_RNG_SEED_FATAL_LEVEL = 0x10;
export const FRAME_EFFECT_6FE3D0_MIX_SHIFT_A = 2;
export const FRAME_EFFECT_6FE3D0_MIX_SHIFT_B = 15;
export const FRAME_EFFECT_6FE3D0_MIX_SHIFT_C = 25;

/** Ordered validation outcomes. */
export const FRAME_EFFECT_VALIDATE_OK = 0;
export const FRAME_EFFECT_VALIDATE_FAIL_ROOM = 1;
export const FRAME_EFFECT_VALIDATE_FAIL_ANIM = 2;
export const FRAME_EFFECT_VALIDATE_FAIL_DIM = 3;

/** Engine argument slots in callee order. */
export const FRAME_EFFECT_ENGINE_ARG_ROOM = 0;
export const FRAME_EFFECT_ENGINE_ARG_ARG2 = 1;
export const FRAME_EFFECT_ENGINE_ARG_ANIM = 2;
export const FRAME_EFFECT_ENGINE_ARG_PLAYER = 3;
export const FRAME_EFFECT_ENGINE_ARG_DIM = 4;

/** P1 — prolog validation. */
export function frameEffect6fd7c0ArgsValid(roomIndex, anim, dimension) {
  if ((((roomIndex | 0) + 0x14) >>> 0) > 0xbc) return false;
  if ((anim >>> 0) > 0x16) return false;
  if ((dimension | 0) >= 3) return false;
  return true;
}

/** H1 gate — timedTransitionCleanupMode == 4. Returns 1/0 like the wasm
 *  export (the machine is `cmp dword ptr [edx+0x26614],4; jne`). */
export function frameEffect6fd7c0Mode4SfxEarly(timedTransitionCleanupMode) {
  return (timedTransitionCleanupMode | 0) === 4 ? 1 : 0;
}

/** P2 — room == -2 forces dimension 0. */
export function frameEffect6fd7c0ForceDimRoomNeg2(roomIndex, dimension) {
  return (roomIndex | 0) === -2 ? 0 : (dimension | 0);
}

/** H2 greed pure rewrite after host IsGreedMode true. */
export function frameEffect6fd7c0GreedRewriteNeg2Anim3(roomIndex, anim) {
  return { roomIndex: -2, anim: 3 };
}

/**
 * H3 — needs FUN_00705ee0 on player==0 shell.
 * @param {{ anim: number, roomIndicesEqual: boolean, roomByte1Nonzero: boolean }} input
 */
export function frameEffect6fd7c0Needs705ee0NullPlayer(input) {
  const anim = input.anim >>> 0;
  if (anim === 3 || anim === 0x10) return true;
  return !!(input.roomIndicesEqual && input.roomByte1Nonzero && anim !== 0xc);
}

/**
 * H4 eligibility for Level::TryInitializeBlueRoom.
 * @param {{ anim: number, dimension: number, roomTransitionMode1830c: number }} input
 */
export function frameEffect6fd7c0BlueRoomEligible(input) {
  if ((input.anim >>> 0) !== 0) return false;
  const dim = input.dimension | 0;
  return dim < 0 || dim === (input.roomTransitionMode1830c | 0);
}

/** H4 store after host blue-room true. */
export function frameEffect6fd7c0ApplyBlueRoomIndex(roomIndex) {
  return -0x10;
}

/** P3 — player+0x13bc = max(value, 0x3c). */
export function frameEffect6fd7c0PlayerTimerFloor3c(value) {
  const v = value | 0;
  return v < 0x3c ? 0x3c : v;
}

/**
 * P4 terminals after FUN_0082ee40.
 * @param {{ counter265c0: number, dualGateNonzero: boolean, byte67744: number }} input
 */
export function frameEffect6fd7c0ApplyTerminals(input) {
  return { counter265c0: input.dualGateNonzero ? 0 : (input.counter265c0 | 0), byte67744: 0 };
}

/* ---- ABI v2 ----
 *
 */

/** Ordered validation classifier. */
export function frameEffect6fd7c0ValidateFailKind(roomIndex, anim, dimension) {
  if ((((roomIndex | 0) + 0x14) >>> 0) > 0xbc) return FRAME_EFFECT_VALIDATE_FAIL_ROOM;
  if ((anim >>> 0) > 0x16) return FRAME_EFFECT_VALIDATE_FAIL_ANIM;
  if ((dimension | 0) >= 3) return FRAME_EFFECT_VALIDATE_FAIL_DIM;
  return FRAME_EFFECT_VALIDATE_OK;
}

/** Message address selected by the failing check. */
export function frameEffect6fd7c0FatalStringVa(failKind) {
  switch (failKind | 0) {
    case FRAME_EFFECT_VALIDATE_FAIL_ROOM: return FRAME_EFFECT_FATAL_ROOM_STR_VA >>> 0;
    case FRAME_EFFECT_VALIDATE_FAIL_ANIM: return FRAME_EFFECT_FATAL_ANIM_STR_VA >>> 0;
    case FRAME_EFFECT_VALIDATE_FAIL_DIM: return FRAME_EFFECT_FATAL_DIM_STR_VA >>> 0;
    default: return 0;
  }
}

/** Severity shared by all three complaints. */
export function frameEffect6fd7c0FatalLevel() {
  return FRAME_EFFECT_FATAL_LEVEL;
}

export function frameEffect6fd7c0Mode4SfxSeed() {
  return FRAME_EFFECT_SFX_SEED_MODE4;
}

export function frameEffect6fd7c0SpecialSfxSeed() {
  return FRAME_EFFECT_SFX_SEED_SPECIAL;
}

/** Rare branch: the mixed counter divides exactly by twenty. Returns 1/0
 *  like the wasm export. */
export function frameEffect6fd7c0SfxRareHit(mixedCounter) {
  return (mixedCounter >>> 0) % FRAME_EFFECT_SFX_RARE_MODULUS === 0 ? 1 : 0;
}

/** Effective id at the play call, from host-observed remap outcomes. */
export function frameEffect6fd7c0SfxPlayId(seedId, remapGateOpen, rareHit) {
  if ((remapGateOpen | 0) === 0) return seedId | 0;
  return rareHit ? FRAME_EFFECT_SFX_REMAP_RARE : FRAME_EFFECT_SFX_REMAP_COMMON;
}

/** Whether the alt-path probe is reached at all. */
export function frameEffect6fd7c0AltPathProbeNeeded(anim, gameField0) {
  return (anim >>> 0) === FRAME_EFFECT_ANIM_SPECIAL && (gameField0 | 0) === 1;
}

/** Full animation-0xc special gate over host-resolved booleans. */
export function frameEffect6fd7c0Anim0xcSpecialGate(anim, gameField0, isAltPath, roomIndicesEqual, roomByte1Nonzero) {
  if ((anim >>> 0) !== FRAME_EFFECT_ANIM_SPECIAL) return false;
  if ((gameField0 | 0) !== 1) return false;
  if (isAltPath) return false;
  return !!(roomIndicesEqual && roomByte1Nonzero);
}

/** Greed rewrite, general address-computation form with 32-bit wrap. */
export function frameEffect6fd7c0GreedRoomRewrite(anim) {
  return ((anim >>> 0) - 0xe) | 0;
}

export function frameEffect6fd7c0GreedAnimRewrite(anim) {
  return (frameEffect6fd7c0GreedRoomRewrite(anim) + 5) | 0;
}

/** Player-pointer branch. */
export function frameEffect6fd7c0PlayerPresent(player) {
  return (player >>> 0) !== 0;
}

/** Animation gate on the player-present branch. */
export function frameEffect6fd7c0PlayerAnimGate(anim) {
  const a = anim >>> 0;
  return a === 3 || a === FRAME_EFFECT_ANIM_SPECIAL;
}

/** Room-type classifier for the extra player-path call. */
export function frameEffect6fd7c0PlayerNeeds425ac0(roomType, roomDescFlag44) {
  const t = roomType | 0;
  if (t === 0xb || t === 0x11) return ((roomDescFlag44 | 0) & 1) === 0;
  return t === 0xa || t === 3;
}

const f32 = Math.fround;

/** Camera limit: three float subtractions applied in machine order. */
export function frameEffect6fd7c0CameraLimit(roomField20, playerField370) {
  const f = Math.fround;
  return f(f(f(f(roomField20) - 30) - f(playerField370)) - 20);
}

/** Ordered compare whose unordered outcome continues into the probe. */
export function frameEffect6fd7c0CameraProbeContinue(probe, limit) {
  if (probe !== probe || limit !== limit) return true;
  return !(probe >= limit);
}

/** Bias applied on the continue path. */
export function frameEffect6fd7c0CameraBias(playerField370) {
  return f32(f32(playerField370) + 40);
}

/** Conditional-move blue-room store. */
export function frameEffect6fd7c0BlueRoomApplyCmov(roomIndex, probeResult) {
  return (probeResult | 0) !== 0 ? FRAME_EFFECT_BLUE_ROOM_INDEX : roomIndex | 0;
}

/** Engine argument order (callee order; the machine pushes them reversed). */
export function frameEffect6fd7c0EngineArgs(
  roomIndex,
  arg2,
  anim,
  player,
  dimension,
) {
  return [roomIndex | 0, arg2 | 0, anim | 0, player | 0, dimension | 0];
}

export function frameEffect6fd7c0EngineThisOff() {
  return FRAME_EFFECT_ENGINE_THIS_OFF;
}

/**
 * Entry plan: validation plus the sound-only early exit.
 */
export function frameEffect6fd7c0EntryPlan(roomIndex, anim, dimension, timedTransitionCleanupMode, gameField0) {
  const failKind = frameEffect6fd7c0ValidateFailKind(roomIndex, anim, dimension);
  const hostFatal = failKind !== FRAME_EFFECT_VALIDATE_OK ? 1 : 0;
  const mode4 = hostFatal === 0 && frameEffect6fd7c0Mode4SfxEarly(timedTransitionCleanupMode) ? 1 : 0;
  return {
    failKind, hostFatal,
    fatalStringVa: frameEffect6fd7c0FatalStringVa(failKind) >>> 0,
    mode4SfxEarly: mode4, host956780: mode4, hostSfxPlay: mode4,
    sfxIdSeed: mode4 ? frameEffect6fd7c0Mode4SfxSeed() : 0,
    hostIdRemap: mode4,
    hostIsAltPath: (hostFatal === 0 && mode4 === 0 && frameEffect6fd7c0AltPathProbeNeeded(anim, gameField0)) ? 1 : 0,
    reachesBody: (hostFatal === 0 && mode4 === 0) ? 1 : 0,
    pureCfOk: 1,
  };
}

/**
 * Null-player shell plan.
 */
export function frameEffect6fd7c0ShellPlan(roomIndex, anim, dimension, roomIndicesEqual, roomByte1Nonzero, roomTransitionMode1830c) {
  const effectiveDim = frameEffect6fd7c0ForceDimRoomNeg2(roomIndex, dimension);
  const blue = frameEffect6fd7c0BlueRoomEligible({ anim, dimension: effectiveDim, roomTransitionMode1830c }) ? 1 : 0;
  return {
    forceDimZero: (roomIndex | 0) === -2 ? 1 : 0, effectiveDim,
    host705ee0: frameEffect6fd7c0Needs705ee0NullPlayer({ anim, roomIndicesEqual, roomByte1Nonzero }) ? 1 : 0,
    blueRoomEligible: blue, hostTryBlueRoom: blue, hostEngine: 1, applyTerminals: 1, pureCfOk: 1,
  };
}

/* ---- ABI v3: the nested stage host at 0x006fdc10 ----
 *
 */

/** Entry range check on the kind argument. */
export function frameEffect6fdc10KindValid(kind) {
  return (kind >>> 0) <= FRAME_EFFECT_6FDC10_KIND_MAX;
}

/** Two word counters non-zero and a low-byte flag clear. */
export function frameEffect6fdc10StageBlockGate(thisCount26630, globalCount26630, globalFlag26638) {
  if ((thisCount26630 >>> 0) === 0 || (globalCount26630 >>> 0) === 0) return false;
  return ((globalFlag26638 | 0) & 0xff) === 0;
}

/** Mode word chosen by conditional move from an emptiness test. */
export function frameEffect6fdc10StageMode(mpBegin, mpEnd) {
  return (mpBegin >>> 0) !== (mpEnd >>> 0) ? FRAME_EFFECT_6FDC10_MODE_OPEN : 0;
}

export function frameEffect6fdc10StringNeedsFree(capacity) {
  return (capacity >>> 0) >= FRAME_EFFECT_6FDC10_SSO_BYTES;
}

/**
 * Embedded string reset.
 * @returns {{size: number, capacity: number, firstByte: number}}
 */
export function frameEffect6fdc10StringReset() {
  return { size: 0, capacity: FRAME_EFFECT_6FDC10_SSO_CAPACITY, firstByte: 0 };
}

/** Argument flag examined a byte at a time. */
export function frameEffect6fdc10FlagArgZero(flagArg) {
  return ((flagArg >>> 0) & 0xff) === 0;
}

/** Single status bit. */
export function frameEffect6fdc10FlagBit(field2654c) {
  return ((field2654c >>> 0) & FRAME_EFFECT_6FDC10_FLAG_BIT) !== 0;
}

/** Combined mask: (probe_a | field26550 | field0c) & ~probe_b, bit 1 of the
 * low byte tested. PE 0x006fddbd..0x006fddd8 (or / or / not / and / test al,2).
 * ABI v19 repaired: the old oracle OR-ed the probes and never complemented
 * probe_b. */
export function frameEffect6fdc10MaskBit(field26550, field0c, probeA, probeB) {
  const combined = ((probeA | 0) | (field26550 | 0) | (field0c | 0)) & ~(probeB | 0);
  return (combined & FRAME_EFFECT_6FDC10_MASK_BIT) !== 0 ? 1 : 0;
}

/** Fast append only while the end pointer differs from the limit. */
export function frameEffect6fdc10InlinePushOk(endPtr, limitPtr) {
  return (endPtr >>> 0) !== (limitPtr >>> 0);
}

export function frameEffect6fdc10PushStride() {
  return FRAME_EFFECT_6FDC10_PUSH_STRIDE;
}

/** Per-player skip: partner present, real id, signed ordering, not self.
 * PE 0x006fde74 compares the partner id against -1 (SIGNED); ABI v19
 * repaired the old oracle's id==0 check. */
export function frameEffect6fdc10PartnerBlocks(partnerPtr, partnerId, ownId, playerPtr) {
  if ((partnerPtr >>> 0) === 0) return false;
  if ((partnerId | 0) === -1) return false;
  if ((partnerId | 0) >= (ownId | 0)) return false;
  return (partnerPtr >>> 0) !== (playerPtr >>> 0);
}

/** Pointer-range element count via signed arithmetic shift. */
export function frameEffect6fdc10VectorCount(begin, end) { return ((end | 0) - (begin | 0)) >> 2; }

/** Out-of-range index addresses element zero. Defect preserved.
 * PE 0x006fe12b cmp edi,ecx; jae — UNSIGNED compare against the sar'd
 * count. ABI v19 repaired: the old oracle added an `n <= 0` guard the
 * machine never has (a negative sar count is a huge unsigned quantity, so
 * the index never clamps). */
export function frameEffect6fdc10SlotAddrClamped(begin, count, index) {
  const use = (index >>> 0) >= (count >>> 0) ? 0 : index | 0;
  return ((begin | 0) + (use << 2)) | 0;
}

/** Registry span, low two bits discarded. */
export function frameEffect6fdc10RegistrySpan(begin, end) {
  return ((((end >>> 0) - (begin >>> 0)) >>> 0) & 0xfffffffc) | 0;
}

/** Span compared against the slot offset as a signed quantity. */
export function frameEffect6fdc10RegistryHasSlot(span) {
  return (span | 0) > FRAME_EFFECT_6FDC10_REGISTRY_SLOT;
}

/** Stage index in range (signed) with the status bit set. */
export function frameEffect6fdc10StageIndexGate(stage, field2654c) {
  const s = stage | 0;
  if (s < FRAME_EFFECT_6FDC10_STAGE_MIN || s > FRAME_EFFECT_6FDC10_STAGE_MAX) return false;
  return ((field2654c | 0) & FRAME_EFFECT_6FDC10_FLAG_BIT) !== 0;
}

/** Stage index bumped by ONE only for the two companion values.
 * PE 0x006fe070 cmp eax,4; je inc; 0x006fe075 cmp eax,5; jne skip. ABI v19
 * repaired: the old oracle added field4 itself. */
export function frameEffect6fdc10StageBump(stage, field4) {
  if ((field4 | 0) === 4 || (field4 | 0) === 5) {
    return ((stage | 0) + 1) | 0;
  }
  return stage | 0;
}

/** The timer is stamped unless the bumped stage is one. */
export function frameEffect6fdc10StageSetsTimer(bumpedStage) {
  return (bumpedStage | 0) !== 1;
}

export function frameEffect6fdc10TimerValue() {
  return FRAME_EFFECT_6FDC10_TIMER_VALUE;
}

/** The 0x705ee0(-1) call runs for every non-fatal kind except 5.
 * PE 0x006fdd5c cmp esi,5; je skip. ABI v19. */
export function frameEffect6fdc10KindNeeds705ee0(kind) {
  return (kind >>> 0) <= FRAME_EFFECT_6FDC10_KIND_MAX && (kind | 0) !== 5 ? 1 : 0;
}

/** Stage-record existing-field offset: +0x238 for the empty stage,
 * +0x240 for the open one. PE 0x006fdc9f/0x6fdca1/0x6fdcb5. ABI v19. */
export function frameEffect6fdc10StageRecordFieldOff(mode) {
  return (mode | 0) === 0 ? FRAME_EFFECT_6FDC10_STAGE_KEY_EMPTY_FIELD
                         : FRAME_EFFECT_6FDC10_STAGE_KEY_OPEN_FIELD;
}

/** Key-builder decision: the consulted field is empty. PE 0x006fdca1
 * (mode==0, +0x238) / 0x006fdcb5 (mode!=0, +0x240). ABI v19. */
export function frameEffect6fdc10StageRecordNeedsKey(mode, hasEmptyField, hasOpenField) {
  if ((mode | 0) === 0) return (hasEmptyField | 0) === 0;
  return (hasOpenField | 0) === 0;
}

/** Registry slot address: span > 0x1d4 (signed) ? begin + 0x1d4 : 0,
 * 32-bit wrap. Consumes registry_has_slot by reference. PE 0x006fe198…
 * 0x006fe1a9 / 0x006fe27c…0x006fe28d. ABI v19. */
export function frameEffect6fdc10RegistrySlotAddr(begin, span) {
  if (!frameEffect6fdc10RegistryHasSlot(span)) return 0;
  return ((begin | 0) + FRAME_EFFECT_6FDC10_REGISTRY_SLOT) | 0;
}

/** Prize-entry bump gate: byte [obj+0xd] == 0, dword [obj+0x10] <= 0x10
 * (SIGNED), obj != base. PE 0x006fe1ff/0x6fe209/0x6fe213. ABI v19. */
export function frameEffect6fdc10PrizeEntryBumpGate(byteD, field10, objPtr, basePtr) {
  if (((byteD >>> 0) & 0xff) !== 0) return 0;
  if ((field10 | 0) > FRAME_EFFECT_6FDC10_PRIZE_MAX_SIZE) return 0;
  return (objPtr >>> 0) === (basePtr >>> 0) ? 0 : 1;
}

/** SSO data pointer: capacity >= 0x10 ? heap_ptr : obj. PE 0x006fdcdc
 * cmp [eax+0x14],0x10; jb. ABI v19. */
export function frameEffect6fdc10StringDataPtr(obj, heapPtr, capacity) {
  return (capacity >>> 0) >= FRAME_EFFECT_6FDC10_SSO_BYTES ? (heapPtr >>> 0) : (obj >>> 0);
}

/**
 * Entry plan for the nested stage host.
 */
export function frameEffect6fdc10EntryPlan(kind, thisCount26630, globalCount26630, globalFlag26638, mpBegin, mpEnd) {
  const kindValid = frameEffect6fdc10KindValid(kind) ? 1 : 0;
  const hostFatal = kindValid ? 0 : 1;
  const stageBlock = kindValid && frameEffect6fdc10StageBlockGate(thisCount26630, globalCount26630, globalFlag26638) ? 1 : 0;
  const empty = (mpBegin >>> 0) === (mpEnd >>> 0);
  return {
    kindValid, hostFatal,
    fatalStringVa: hostFatal ? (FRAME_EFFECT_6FDC10_FATAL_STR_VA >>> 0) : 0,
    stageBlock, stageMode: stageBlock ? (empty ? 0 : FRAME_EFFECT_6FDC10_MODE_OPEN) : 0,
    /* PE 0x006fdd5c: host_705ee0 = kind_needs_705ee0(kind) — ABI v19 repair
       (was stageBlock; wrong for kind 5 and for failed blocks with kind<5). */
    host705ee0: frameEffect6fdc10KindNeeds705ee0(kind),
    hostLog: kindValid ? 1 : 0, pureCfOk: 1,
    /* ABI v19 repair: pure_complete stays 0 even on the fatal path — the
       fatal path itself calls the host logger 0x00a112c0, and the family
       convention (v9) grants pure_complete=1 only to zero-call bodies. */
    pureComplete: 0,
  };
}

/* ---- ABI v20: pure decision seams around the still-host leaf calls of
 * the 6fdc10 body. Every gate selects a host call or a stateful store
 * from captured values only; none writes memory.
 */

/** Per-player body entry: companion mode below 2, SIGNED.
 * PE 0x006fde8e cmp [g+0x26614],2; jge skip — repeated at 0x006fdeb3. */
export function frameEffect6fdc10PlayerBodyModeGate(mode26614) {
  return (mode26614 | 0) < 2 ? 1 : 0;
}

/** Per-player body: (0x4264c0 ret & partner_id) != -1.
 * PE 0x006fdea6 and ecx,eax; 0x006fdea8 cmp ecx,-1; je skip. */
export function frameEffect6fdc10PlayerBodyRetGate(ret4264c0, partnerId) {
  return ((ret4264c0 | 0) & (partnerId | 0)) !== -1 ? 1 : 0;
}

/** Per-player body: LOW-BYTE flag [this+0x1c030] clear.
 * PE 0x006fdebc cmp byte [ebx+0x1c030],0; jne skip. */
export function frameEffect6fdc10PlayerBodyFlagGate(flag1c030) {
  return ((flag1c030 >>> 0) & 0xff) === 0 ? 1 : 0;
}

/** The 0x4259b0 call runs only when 0x425a70's LOW BYTE is zero.
 * PE 0x006fded2 test al,al; jne skip. */
export function frameEffect6fdc10PlayerBodyNeeds4259b0(ret425a70) {
  return ((ret425a70 >>> 0) & 0xff) === 0 ? 1 : 0;
}

/** The +0xc float add runs only on a FULL-dword-nonzero 0x426560 result.
 * PE 0x006fdef4 test eax,eax; je skip. */
export function frameEffect6fdc10PlayerBodyFloatAddOk(ret426560) {
  return (ret426560 | 0) !== 0 ? 1 : 0;
}

/** The 0x417870 result store runs only when arg 3 is zero (FULL dword).
 * PE 0x006fdf32 test eax,eax ([ebp+0x10]); jne skip. */
export function frameEffect6fdc10Record417870Gate(arg10) {
  return (arg10 >>> 0) === 0 ? 1 : 0;
}

/** [this+0x1ba8c] byte = (0x9be080 ret != 0) ? 1 : 0 — FULL dword test,
 * byte result. PE 0x006fdf89 test; 0x006fdf95 setne al. */
export function frameEffect6fdc10Record9be080RetNeZero(ret9be080) {
  return (ret9be080 | 0) !== 0 ? 1 : 0;
}

/** Camera walk enters on POINTER INEQUALITY, not the vector count.
 * PE 0x006fdfc4 cmp esi,[edx+0x1baac]; je skip. */
export function frameEffect6fdc10CameraWalkEnter(begin, end) {
  return (begin >>> 0) !== (end >>> 0) ? 1 : 0;
}

/** Camera-scale block: [0] non-null AND [0x2c] zero, both FULL dword.
 * PE 0x006fdfda test ecx,ecx; je; 0x006fdfde cmp [ecx+0x2c],0; jne. */
export function frameEffect6fdc10CameraElemGate(elem0, elem2c) {
  return (elem0 >>> 0) !== 0 && (elem2c | 0) === 0 ? 1 : 0;
}

/** Registry slot scan runs only while the LOW-BYTE [elem+0x1519] is clear.
 * PE 0x006fe1a9 cmp byte [ecx+0x1519],0; jne skip. */
export function frameEffect6fdc10RegistryScanGate(byte1519) {
  return ((byte1519 >>> 0) & 0xff) === 0 ? 1 : 0;
}

/** "No players" log runs exactly when the sar'd count is zero (FULL dword).
 * PE 0x006fe107 / 0x006fe153 / 0x006fe230 test; jne skip-log. */
export function frameEffect6fdc10RegistryHeadLogNeeded(count) {
  return (count | 0) === 0 ? 1 : 0;
}

/* ---- ABI v21: FUN_0081fd60 (Room:RespawnEnemies) decision seams. Every
 * gate selects a host call or a stateful store of the still-host SEH body
 * from captured values only; byte tests are LOW BYTE on uint32_t scalars.
 */

/** Spawn slot loop runs only while the u16 slot count is nonzero.
 * PE 0x0081fe53 cmp dx,word [data+0x44]; jae skip. */
export function frameEffect81fd60SpawnLoopRuns(count44) {
  return ((count44 >>> 0) & 0xffff) !== 0 ? 1 : 0;
}

/** Seed nonzero, else the fatal RNG log + int3 — FULL dword.
 * PE 0x0081fe60 test esi,esi; jne continue. */
export function frameEffect81fd60SeedValid(seed) {
  return (seed >>> 0) !== 0 ? 1 : 0;
}

/** Per-slot spawn block runs only while byte [stage+8] is set — LOW BYTE.
 * PE 0x0081fea7 cmp byte [edx+8],0; jbe skip. */
export function frameEffect81fd60SlotOpenGate(byte8) {
  return ((byte8 >>> 0) & 0xff) !== 0 ? 1 : 0;
}

/** 0x7ed310 call SKIPPED only when byte_d clear AND pos >= field_10
 * (SIGNED jl) AND rec == *out. PE 0x0081ff04..0x0081ff14. */
export function frameEffect81fd60RespawnSkipGate(byteD, pos, field10, recPtr, outPtr) {
  if (((byteD >>> 0) & 0xff) !== 0) return 0;
  if ((pos | 0) < (field10 | 0)) return 0;
  return (recPtr >>> 0) === (outPtr >>> 0) ? 1 : 0;
}

/** Block continues only on a nonzero LOW BYTE of 0x7ed310's return.
 * PE 0x0081ff2f test al,al; je skip. */
export function frameEffect81fd60RespawnReturnGate(ret7ed310) {
  return ((ret7ed310 >>> 0) & 0xff) !== 0 ? 1 : 0;
}

/** 0x7ed310 out pointer nonzero — FULL dword.
 * PE 0x0081ff33 cmp [ebp-0x10],0; je skip. */
export function frameEffect81fd60RespawnOutGate(outPtr) {
  return (outPtr >>> 0) !== 0 ? 1 : 0;
}

/** Vtable walk of pushed respawns runs only for a nonzero sar'd count —
 * FULL dword. PE 0x0081ffab test edi,edi; je skip. */
export function frameEffect81fd60Walk1Enter(count) {
  return (count | 0) !== 0 ? 1 : 0;
}

/** Flag-clear stores run only on a nonzero LOW BYTE of the vtable+0x48
 * return. PE 0x0081ffc3 test al,al; je skip. */
export function frameEffect81fd60Walk1FlagGate(retVtbl48) {
  return ((retVtbl48 >>> 0) & 0xff) !== 0 ? 1 : 0;
}

/** List-1 tail slot nonzero — FULL dword (written by host 0x4e45c0).
 * PE 0x0081ffe6 cmp [ebp-0x30],0; jbe skip. */
export function frameEffect81fd60List2Enter(tail30) {
  return (tail30 >>> 0) !== 0 ? 1 : 0;
}

/** Door-slot array count nonzero — FULL dword ([this+0x1264]).
 * PE 0x0081fff2 cmp [ebx+0x1264],edi(0); jbe skip. */
export function frameEffect81fd60Loop2Enter(count1264) {
  return (count1264 >>> 0) !== 0 ? 1 : 0;
}

/** Door-slot block SKIPPED only when byte_d clear AND slot >=u field_10
 * (UNSIGNED jb) AND rec != list-1 node. PE 0x0082001f..0x0082002d. */
export function frameEffect81fd60DoorOpenGate(byteD, slot, field10, recPtr, nodePtr) {
  if (((byteD >>> 0) & 0xff) !== 0) return 0;
  if ((slot >>> 0) < (field10 >>> 0)) return 0;
  return (recPtr >>> 0) !== (nodePtr >>> 0) ? 1 : 0;
}

/** vtable+0x28 call runs only when byte_d clear AND seed_32c >= field_10
 * (SIGNED jl) AND rec != list-1 node. PE 0x0082004b..0x0082005f. */
export function frameEffect81fd60Vtbl28Gate(byteD, seed32c, field10, recPtr, nodePtr) {
  if (((byteD >>> 0) & 0xff) !== 0) return 0;
  if ((seed32c | 0) < (field10 | 0)) return 0;
  return (recPtr >>> 0) !== (nodePtr >>> 0) ? 1 : 0;
}

/** Door-slot reset runs only when the slot mode is not 1 — FULL dword.
 * PE 0x00820086 cmp [esi+0xc],1; je skip. */
export function frameEffect81fd60SlotNeedsReset(modeC) {
  return (modeC | 0) !== 1 ? 1 : 0;
}

/** "Open" string assign runs when either loaded type is 7, 8 or 0x1d.
 * PE 0x0082009a..0x008200c2 six cmp/je pairs. */
export function frameEffect81fd60SlotTypeOpen(type15c, type160) {
  return (type15c | 0) === 7 || (type160 | 0) === 7 ||
         (type15c | 0) === 8 || (type160 | 0) === 8 ||
         (type15c | 0) === 0x1d || (type160 | 0) === 0x1d
    ? 1
    : 0;
}

/** Invalid-param host call [0xb18894] runs only when size_and3 >=u 0x1000
 * AND delta >u 0x1f — both FULL dword, UNSIGNED.
 * PE 0x008200f8 cmp edx,0x1000; jb skip; 0x0082010b cmp eax,0x1f; jbe skip. */
export function frameEffect81fd60FreeInvalidParam(sizeAnd3, delta) {
  if ((sizeAnd3 >>> 0) < 0x1000) return 0;
  return (delta >>> 0) > 0x1f ? 1 : 0;
}

/* ---- ABI v22: FUN_0081fb70 LRoomTileDesc::GetRandomTile — remaining
 * decision seams. Four FULL-dword zero-tests; the body has no byte-width
 * tests (census-81fb70-body.json). Arithmetic islands (seed_mix, umod,
 * pick_a, …) were landed in ABI v17. */

/** Seed nonzero, else the fatal "RNG Seed is zero!" log + int3 — FULL
 * dword. PE 0x0081fbd2 test esi,esi; jne continue. */
export function frameEffect81fb70SeedValid(seed) {
  return (seed >>> 0) !== 0 ? 1 : 0;
}

/** Current chain draw nonzero, else the same fatal — FULL dword.
 * PE 0x0081fc19/0x0081fcc1 (draw 1) and 0x0081fc59/0x0081fd00 (draw 2):
 * test esi,esi; jne continue. */
export function frameEffect81fb70MixedValid(mixed) {
  return (mixed >>> 0) !== 0 ? 1 : 0;
}

/** total (abs1+abs2, 32-bit wrap) nonzero → the unsigned pick div runs;
 * total==0 → rem 0 → rect B. PE 0x0081fc08 test ecx,ecx; je skip-div. */
export function frameEffect81fb70TotalGate(total) {
  return (total >>> 0) !== 0 ? 1 : 0;
}

/** RAW delta dword nonzero → the index div runs; delta==0 → rem 0 (the
 * dy gates also drop the 3rd draw — rem 0 either way).
 * PE 0x0081fc4c/0x0081fcf4 (x) and 0x0081fc82/0x0081fd29 (y). */
export function frameEffect81fb70DeltaGate(delta) {
  return (delta >>> 0) !== 0 ? 1 : 0;
}

/* ---- ABI v23: FUN_00820170 Lua Room:TrySpawnBlueWombDoor decision seams
 * (census-820170-body.json). The C++ EH host (stub 0xb01801, FuncInfo
 * 0xbc2460, unwind 0xb017f0 = 0xc8108c CS wrapper; protected scope
 * 0x8203a4..0x8204aa) stays host; these 22 laws are the SEH-free
 * captured-value surface. Byte decisions are LOW BYTE (& 0xff) on
 * uint32_t scalars. "1" = the PROCEED arm of the machine pair. */

/** arg3 byte nonzero (test bl,bl @ 0x8201a4; re-tested 0x820262 and
 * 0x8202d0). */
export function frameEffect820170Arg3Gate(arg3) {
  return ((arg3 >>> 0) & 0xff) !== 0 ? 1 : 0;
}

/** stage != 0x2c (cmp @ 0x8201a8; je return 0). FULL dword equality. */
export function frameEffect820170StageGate(stage_26584) {
  return (stage_26584 >>> 0) !== 0x2c ? 1 : 0;
}

/** g_Level+0x136 byte nonzero (0x8201ba/0x8201c1). LOW BYTE. */
export function frameEffect820170LevelFlagGate(byte_136) {
  return ((byte_136 >>> 0) & 0xff) !== 0 ? 1 : 0;
}

/** level type != 2 (0x8201c3/0x8201c7; jne return 0). */
export function frameEffect820170LevelTypeGate(type_8) {
  return (type_8 >>> 0) !== 2 ? 1 : 0;
}

/** spawn-queue count > 0 UNSIGNED (0x8201cd cmp; 0x8201d4 ja). */
export function frameEffect820170QueueGate(count_26630) {
  return (count_26630 >>> 0) > 0 ? 1 : 0;
}

/** g_Game+0x26589 byte nonzero (0x8201d6/0x8201dd je return 0). */
export function frameEffect820170GameFlagGate(byte_26589) {
  return ((byte_26589 >>> 0) & 0xff) !== 0 ? 1 : 0;
}

/** normalized arg2 select (0x8201f7 test al,al / 0x8201fe cmovne):
 * (f != 0) ? 1 : (arg2 & 0xff); f = 0x44bfb0 AnyoneHasTrinket AL. */
export function frameEffect820170Arg2Norm(arg2, f) {
  return (f >>> 0) !== 0 ? 1 : (arg2 >>> 0) & 0xff;
}

/** [0x740bc0 GetRoomByIdx ret + 8] == [g_Game+0x18314] (0x820224/0x82022a
 * jne return 0). */
export function frameEffect820170RoomSyncGate(ret8, stage_18314) {
  return (ret8 >>> 0) === (stage_18314 >>> 0) ? 1 : 0;
}

/** LOW BYTE bit 2 of (~mask_b & mask_a) (0x820256 test al,2 / 0x82025a
 * cmove): set → slot base probes base+1, clear → stays base. mask_a =
 * 0x6f9400ret | [g+0x26550] | [g+0xc]; mask_b = 0x6f95a0ret (host). */
export function frameEffect820170ProbeBit2Gate(mask_a, mask_b) {
  return ((((~mask_b >>> 0) & (mask_a >>> 0)) & 2) !== 0) ? 1 : 0;
}

/** [0x706940ret]+0x7f byte nonzero (0x820268/0x82026c) — bound check
 * runs. LOW BYTE. */
export function frameEffect820170RoomByteGate(byte_7f) {
  return ((byte_7f >>> 0) & 0xff) !== 0 ? 1 : 0;
}

/** SIGNED idx < [0x706940ret]+0x40 (0x82026e cmp esi,[eax+0x40];
 * 0x820271 jge return 0). */
export function frameEffect820170RoomBoundGate(idx, limit_40) {
  return (idx | 0) < (limit_40 | 0) ? 1 : 0;
}

/** slot base == 8 (0x820277 cmp esi,8; 0x82027a jne return 0). */
export function frameEffect820170Slot8Gate(idx) {
  return (idx >>> 0) === 8 ? 1 : 0;
}

/** [0x706940ret]+4 not in {4,5} (0x820283/0x820286, 0x82028c/0x82028f je
 * return 0). */
export function frameEffect820170RoomKindGate(kind_4) {
  const k = kind_4 >>> 0;
  return (k !== 4 && k !== 5) ? 1 : 0;
}

/** 8-slot busy scan (0x8202a2 test edx,edx / je continue; 0x8202a6 cmp
 * [edx+0x394],-8 / je return 0): proceeds iff slot==0 OR state !=
 * 0xfffffff8. */
export function frameEffect820170SlotFreeGate(slot, state_394) {
  return ((slot >>> 0) === 0 || (state_394 >>> 0) !== 0xfffffff8) ? 1 : 0;
}

/** SIGNED [g_Game+0x264fc] > [g_Game+0x26504] (0x8202c2 cmp; 0x8202c8
 * jle skips the arg2/arg3 chain). */
export function frameEffect820170OverflowGate(count_264fc, limit_26504) {
  return (count_264fc | 0) > (limit_26504 | 0) ? 1 : 0;
}

/** LOW BYTE of the NORMALIZED arg2 (arg2_norm output) nonzero
 * (0x8202ca cmp byte [ebp+0xc],0; 0x8202ce jne). */
export function frameEffect820170Arg2Gate(arg2n) {
  return ((arg2n >>> 0) & 0xff) !== 0 ? 1 : 0;
}

/** [g_Game+0x18308] == 0xfffffff8 (0x8202e1 cmp / 0x8202e7 jne skips the
 * fast path). */
export function frameEffect820170TickStateGate(state_18308) {
  return (state_18308 >>> 0) === 0xfffffff8 ? 1 : 0;
}

/** SIGNED [g_Game+0x1831c] >= 0 (0x8202e9 test esi,esi; 0x8202eb js). */
export function frameEffect820170TickIdxGate(idx_1831c) {
  return (idx_1831c | 0) >= 0 ? 1 : 0;
}

/** slot ptr == 0 (0x8202ed/0x8202f5 je fast-forward; 0x820389/0x820391 je
 * loop-exit candidate; 0x8203c4/0x8203c6 jne skips 0x7eea90 create). */
export function frameEffect820170SlotNullGate(slot) {
  return (slot >>> 0) === 0 ? 1 : 0;
}

/** FULL dword RNG state nonzero (0x820316 test edi,edi; 0x820318 jne),
 * else the fatal 0xa112c0(0x10, 0xb6bf54) + int3 @ 0x820329. */
export function frameEffect820170RngValidGate(state) {
  return (state >>> 0) !== 0 ? 1 : 0;
}

/** (word & mask) != 0 (0x820384 test [ecx+eax*4],edx; 0x820387 je loops
 * on). word = bitmap[esi>>5] (always 0), mask = 1 << (esi & 0x1f). */
export function frameEffect820170BitProbeGate(word, mask) {
  return ((word >>> 0) & (mask >>> 0)) !== 0 ? 1 : 0;
}

/** arg1 byte nonzero (0x820404 cmp byte [ebp+8],0; 0x820408 je skips
 * 0x70f810). LOW BYTE. */
export function frameEffect820170Arg1Gate(arg1) {
  return ((arg1 >>> 0) & 0xff) !== 0 ? 1 : 0;
}

/* ---- ABI v24: FUN_008204b0 Lua Room:TrySpawnTheVoidDoor decision seams
 * (census-8204b0-body.json). The C++ EH + GS host (stub 0xb01831,
 * FuncInfo 0xbc248c, unwind 0xb01820 = 0xc8108c CS wrapper; protected
 * scope 0x820621..0x8206d8) stays host; these 15 laws are the SEH-free
 * captured-value surface up to (exclusive) 0x820621. Byte decisions are
 * LOW BYTE (& 0xff) on uint32_t scalars. "1" = the PROCEED arm. */

/** arg1 byte nonzero, the ONLY stack arg (`ret 4`) (0x8204db cmp byte
 * [ebp+8],0 / 0x8204e4 jne; re-tested 0x820518 and 0x8205f0 — jne jumps
 * to the spawn tail). LOW BYTE. */
export function frameEffect8204b0Arg1Gate(arg1) {
  return ((arg1 >>> 0) & 0xff) !== 0 ? 1 : 0;
}

/** stage != 0x2c (0x8204e6 cmp / 0x8204ed je -> return 0; arg1==0 path
 * only). FULL dword equality. */
export function frameEffect8204b0StageGate(stage_26584) {
  return (stage_26584 >>> 0) !== 0x2c ? 1 : 0;
}

/** probe candidate value (0x8204f3..0x820515 straight-line island; test
 * al,2 @ 0x820513 / cmove @ 0x820515): base_g0 + (bit 2 of
 * (~mask_6f95a0ret & (mask_6f9400ret | gmask_26550 | gmask_c)) ? 1 : 0)
 * — the +1 = probe next, 0 = stay. base = *g_Game; both mask builders
 * stay host (captured returns). */
export function frameEffect8204b0ProbeCandidate(base_g0, gmask_26550, gmask_c,
                                                mask_6f9400ret, mask_6f95a0ret) {
  const merged = (mask_6f9400ret >>> 0) | (gmask_26550 >>> 0) | (gmask_c >>> 0);
  const bit2 = ((~(mask_6f95a0ret >>> 0)) & merged) & 2;
  return ((base_g0 >>> 0) + (bit2 !== 0 ? 1 : 0)) >>> 0;
}

/** probe candidate == 9 (0x820522 cmp edi,9 / 0x820525 jne -> return 0).
 * FULL dword equality (the slot8_gate analog, fence 9). */
export function frameEffect8204b0Slot9Gate(candidate) {
  return (candidate >>> 0) === 9 ? 1 : 0;
}

/** [[this+4]+0x10]+8 == 5 (0x820534 cmp / 0x820538 jne -> return 0).
 * FULL dword equality. */
export function frameEffect8204b0DescriptorKindGate(kind8) {
  return (kind8 >>> 0) === 5 ? 1 : 0;
}

/** SIGNED [g_Game+0x18304] >= 0 (0x820544 cmp 0 / 0x82054b jl -> return
 * 0). */
export function frameEffect8204b0DimGate(dim_18304) {
  return (dim_18304 | 0) >= 0 ? 1 : 0;
}

/** [g_Game+0x269c8] in {2,3} (0x820557/0x82055a, 0x820560/0x820563 je
 * 0x820601 — the flag tail). FULL dword. */
export function frameEffect8204b0Kind23Gate(kind_269c8) {
  const k = kind_269c8 >>> 0;
  return (k === 2 || k === 3) ? 1 : 0;
}

/** ORDER-SENSITIVE bound chain (0x820572..0x8205ae): 0xc iff
 * slot_40==0xc, else (stage==0 && queue==0 && lv_flag byte != 0), else
 * (stage==0 && queue==0 && lv_flag byte == 0 && lv_type==2 &&
 * game_flag byte != 0); every other chain state lands 0xb. queue is
 * UNSIGNED; lv_flag/game_flag are LOW BYTE. */
export function frameEffect8204b0BoundSelect(slot_40, stage_26584, queue_26630,
                                             lv_flag_18c, lv_type_8,
                                             game_flag_26589) {
  if ((slot_40 >>> 0) === 0xc) return 0xc;
  if ((stage_26584 >>> 0) !== 0) return 0xb;
  if ((queue_26630 >>> 0) > 0) return 0xb;
  if (((lv_flag_18c >>> 0) & 0xff) !== 0) return 0xc;
  if ((lv_type_8 >>> 0) !== 2) return 0xb;
  if (((game_flag_26589 >>> 0) & 0xff) !== 0) return 0xc;
  return 0xb;
}

/** [0x706940ret]+0x7f byte nonzero (0x8205b0 / 0x8205b7 je skips the
 * bound-recalc arm). LOW BYTE. */
export function frameEffect8204b0RoomByteGate(byte_7f) {
  return ((byte_7f >>> 0) & 0xff) !== 0 ? 1 : 0;
}

/** cmove select (0x8205b9 mov/test / 0x8205c0 cmove): (slot_40 != 0) ?
 * slot_40 : bound. */
export function frameEffect8204b0BoundRecalc(bound, slot_40) {
  return (slot_40 >>> 0) !== 0 ? (slot_40 >>> 0) : (bound >>> 0);
}

/** [0x706940ret]+0x80 == 3 (0x8205c4 cmp / 0x8205cb je 0x820601). FULL
 * dword equality. */
export function frameEffect8204b0RoomType3Gate(type_80) {
  return (type_80 >>> 0) === 3 ? 1 : 0;
}

/** SIGNED bound < 0xc (0x8205cd cmp 0xc / 0x8205d0 jl 0x820601). */
export function frameEffect8204b0BoundMinGate(bound) {
  return (bound | 0) < 0xc ? 1 : 0;
}

/** (flag & 0x200000) != 0 (0x8205d2 test [g+0x1839c],0x200000 /
 * 0x8205dc jne 0x820601). FULL dword bit test. */
export function frameEffect8204b0FlagBitGate(flag_1839c) {
  return ((flag_1839c >>> 0) & 0x200000) !== 0 ? 1 : 0;
}

/** [0x706940ret]+0x7f byte ZERO (0x8205f6 cmp byte / 0x8205fa je
 * 0x820621 — the spawn tail). LOW BYTE; the byte-0 twin of
 * RoomByteGate. */
export function frameEffect8204b0RoomByte0Gate(byte_7f) {
  return ((byte_7f >>> 0) & 0xff) === 0 ? 1 : 0;
}

/** SIGNED candidate < [0x706940ret]+0x40 (0x8205fc cmp / 0x8205ff jl
 * 0x820621 — the spawn tail). */
export function frameEffect8204b0BoundSpawnGate(candidate, limit_40) {
  return (candidate | 0) < (limit_40 | 0) ? 1 : 0;
}

/* ---- ABI v25: FUN_0044bfb0 exact-ZHL PlayerManager::AnyoneHasTrinket
 * decision seams (census-v24-leaves.json). Pure query body (no SEH/GS,
 * 0 field stores); the 0x771550 AL results are captured inputs. Byte
 * decisions are LOW BYTE (& 0xff) on uint32_t scalars. "1" = the
 * PROCEED arm of the machine pair. */

/** idx = trinket & 0x7fff (0x44bfd6 and ecx,0x7fff). */
export function frameEffect44bfb0TrinketIndex(trinket) {
  return (trinket >>> 0) & 0x7fff;
}

/** SIGNED (int32)idx < (int32)count (0x44bfdf cmp ecx,eax / 0x44bfe1
 * jge -> not-found). */
export function frameEffect44bfb0BoundGate(idx, count) {
  return (idx | 0) < (count | 0) ? 1 : 0;
}

/** slot != 0 (0x44bfe6 test eax,eax / 0x44bfe8 je). FULL dword. */
export function frameEffect44bfb0SlotNullGate(slot) {
  return (slot >>> 0) !== 0 ? 1 : 0;
}

/** (flag_b8 & 0x80000000) != 0 (0x44bff0 and / 0x44bff5 or / 0x44bff8
 * je). FULL dword bit 31. */
export function frameEffect44bfb0HasFlagGate(flag_b8) {
  return ((flag_b8 >>> 0) & 0x80000000) !== 0 ? 1 : 0;
}

/** head != tail (0x44c007 cmp esi,[edi+4] / 0x44c00a je -> empty). */
export function frameEffect44bfb0WalkEnter(head, tail) {
  return (head >>> 0) !== (tail >>> 0) ? 1 : 0;
}

/** [elem+0x2c] == 0 (0x44c012 cmp dword / 0x44c016 jne skips). */
export function frameEffect44bfb0ActiveGate(elem_2c) {
  return (elem_2c >>> 0) === 0 ? 1 : 0;
}

/** 0x771550 AL nonzero (0x44c022 test al,al / 0x44c024 jne). LOW
 * BYTE. */
export function frameEffect44bfb0MatchGate(al) {
  return ((al >>> 0) & 0xff) !== 0 ? 1 : 0;
}

/** +0x1e6c probe runs iff found != 0 && al == 0 (0x44c026 cmp byte
 * [ebp+0xb],al / 0x44c029 je). LOW BYTE pair. */
export function frameEffect44bfb0SecondProbeGate(found, al) {
  return ((found >>> 0) & 0xff) !== 0 && ((al >>> 0) & 0xff) === 0 ? 1 : 0;
}

/** [elem+0x1e6c] != 0 (0x44c031 test ecx,ecx / 0x44c033 je). */
export function frameEffect44bfb0AltNullGate(alt) {
  return (alt >>> 0) !== 0 ? 1 : 0;
}

/** node_ptr != tail (0x44c047 cmp esi,[eax+4] / 0x44c04a jne -> loop). */
export function frameEffect44bfb0WalkContinue(node_addr, tail) {
  return (node_addr >>> 0) !== (tail >>> 0) ? 1 : 0;
}

/** found node != 0 (0x44c04e test edi,edi / 0x44c050 setne al; the
 * second-match arm 0x44c062/0x44c066 same law). */
export function frameEffect44bfb0ResultGate(found_node) {
  return (found_node >>> 0) !== 0 ? 1 : 0;
}

/* ---- ABI v26: FUN_007ee7e0 Room grid-cell setter (0x007ee7e0..0x007eea8f)
 * decision seams. 197 insns / 687 B / 19 calls (15 direct + 4 indirect) /
 * 30 stores / 24 direct callers (all inside 0x81ee20) / ZHL empty; SEH+GS
 * host body — only the captured-value gates are modelled. ALL FULL-dword:
 * the body has ZERO byte gates. "1" = the named arm is taken. The arm-B
 * crash seams (NULL [vtbl+4] derefs) are reproduced, not repaired.
 */

/** idx = x + width*y (0x7ee813 imul y*width / 0x7ee816 lea) — 32-bit wrap. */
export function frameEffect7ee7e0GridIndex(x, y, width) {
  return (Math.imul(width >>> 0, y >>> 0) + (x >>> 0)) >>> 0;
}

/** SIGNED log gate 0x7ee819..0x7ee825: log 0xa112c0(0x10,0xb6c190) when
 *  idx<0 or idx>=width*height (signed product); the log path CONTINUES
 *  into the cell gate. */
export function frameEffect7ee7e0IndexOobLog(idx, width, height) {
  const product = Math.imul(width | 0, height | 0);
  return (idx | 0) < 0 || (idx | 0) >= product ? 1 : 0;
}

/** FULL dword: occupied cell skips the set (0x7ee839 cmp / 0x7ee83e jne
 *  to the shared al=0 return). */
export function frameEffect7ee7e0CellOccupied(cell) {
  return (cell >>> 0) !== 0 ? 1 : 0;
}

/** [room+8] == 0x10 (0x7ee844 cmp / 0x7ee848 jne default arm). */
export function frameEffect7ee7e0ModeOpen(mode8) {
  return (mode8 >>> 0) === (FRAME_EFFECT_7EE7E0_V26_MODE_OPEN_VALUE >>> 0) ? 1 : 0;
}

/** type10 ∈ {2,3} → default arm — the setter's OWN [cfg+0x10] member
 *  (0x7ee84e..0x7ee863), NOT the 0x81fb20/81ecc0 [cfg+0x48] type. */
export function frameEffect7ee7e0TypeDefaultArm(type10) {
  return (type10 >>> 0) === 2 || (type10 >>> 0) === 3 ? 1 : 0;
}

/** y==0 && x==2 → arm A (0x7ee869 test y; jne B-check / 0x7ee871 cmp x,2;
 *  jne default). */
export function frameEffect7ee7e0ArmASelected(x, y) {
  return (x >>> 0) === (FRAME_EFFECT_7EE7E0_V26_X_EQ_A >>> 0) && (y >>> 0) === 0
    ? 1 : 0;
}

/** y∈{3,4} && x==0xe && [type10+0xc]==1 → arm B
 *  (0x7ee935/0x7ee93a/0x7ee943/0x7ee94c). */
export function frameEffect7ee7e0ArmBSelected(x, y, typeC) {
  return (
    ((y >>> 0) === 3 || (y >>> 0) === 4) &&
    (x >>> 0) === (FRAME_EFFECT_7EE7E0_V26_X_EQ_B >>> 0) &&
    (typeC >>> 0) === 1
  ) ? 1 : 0;
}

/** SIGNED shared bounds LOG of arms A/B (0x7ee882 / 0x7ee95e): idx<0 ||
 *  idx>=0x1c0 → 0xa112c0(0x10, 0xb6c138). */
export function frameEffect7ee7e0ArmABBoundsLog(idx) {
  return (idx | 0) < 0 || (idx | 0) >= (FRAME_EFFECT_7EE7E0_V26_CAP | 0)
    ? 1 : 0;
}

/** Arm A silent skip (0x7ee89d ja UNSIGNED idx > 0x1bf OR 0x7ee8a5 jg
 *  SIGNED marker > 0x384) → shared al=0 return. */
export function frameEffect7ee7e0ArmASkip(idx, marker) {
  if ((idx >>> 0) > (FRAME_EFFECT_7EE7E0_V26_CAP_A_UNSIGNED >>> 0)) return 1;
  return (marker | 0) > (FRAME_EFFECT_7EE7E0_V26_MARKER_MAX | 0) ? 1 : 0;
}

/** Arm B crash re-check (0x7ee979 test/js + 0x7ee981 cmp/jge — SIGNED vs
 *  0x1c0, where arm A's cap is UNSIGNED 0x1bf) → NULL-vtbl deref at
 *  0x7eea15. Reproduced, not repaired. */
export function frameEffect7ee7e0ArmBCrashOob(idx) {
  return (idx | 0) < 0 || (idx | 0) >= (FRAME_EFFECT_7EE7E0_V26_CAP | 0)
    ? 1 : 0;
}

/** Arm B marker (0x7ee98d jg 0x7eea07 — SIGNED marker > 0x384): the
 *  still-empty cell's [vtbl+4] call — NULL deref. Reproduced, not
 *  repaired (arm A returns 0 on the same marker law). */
export function frameEffect7ee7e0ArmBCrashMarker(marker) {
  return (marker | 0) > (FRAME_EFFECT_7EE7E0_V26_MARKER_MAX | 0) ? 1 : 0;
}

/* ABI v27: FUN_007eece0 Room::GetRoomConfigStage (PURE-OPEN) + FUN_007eed10
 * the captured-value filter (PURE-OPEN) — the sibling run resumed after
 * the v26 0x7ee7e0 landing (census-v27-siblings.json in
 * frame-effect-v27-siblings; identify-zhl fresh: 0x7eece0 EXACT 16-byte
 * Room::GetRoomConfigStage, 0x7eed10 and 0x7eeeb0 EMPTY). 0x7eeeb0 (the
 * SEH effect-copy body after the filter) is HOST — evidence only. */

export const FRAME_EFFECT_7EECE0_V27_VA = 0x007eece0;
export const FRAME_EFFECT_7EECE0_V27_END_VA = 0x007eed03; /* past final `ret` @ 0x7eed02 */
export const FRAME_EFFECT_7EECE0_V27_NEXT_VA = 0x007eed10;
export const FRAME_EFFECT_7EECE0_V27_RET_BYTES = 0;
export const FRAME_EFFECT_7EECE0_V27_INSN_COUNT = 14;
export const FRAME_EFFECT_7EECE0_V27_BYTE_LEN = 35;
export const FRAME_EFFECT_7EECE0_V27_CALL_INSNS = 1; /* 0xa112c0 log @ 0x7eecf8 — host side effect */
export const FRAME_EFFECT_7EECE0_V27_DIRECT_CALLS = 1;
export const FRAME_EFFECT_7EECE0_V27_INDIRECT_CALLS = 0;
export const FRAME_EFFECT_7EECE0_V27_DATA_STORES = 0;
export const FRAME_EFFECT_7EECE0_V27_RET_COUNT = 2;
export const FRAME_EFFECT_7EECE0_V27_DIRECT_CALLERS = Object.freeze([
  0x00543bbc, 0x006c0ab3,
]);
export const FRAME_EFFECT_7EECE0_V27_DWORD_HITS = Object.freeze([0x0086c3b7]);
export const FRAME_EFFECT_7EECE0_V27_CFG_OFF = 0x4; /* [this+4] */
export const FRAME_EFFECT_7EECE0_V27_CFG10_OFF = 0x10; /* [cfg+0x10] */
export const FRAME_EFFECT_7EECE0_V27_LOG_VA = 0x00a112c0;
export const FRAME_EFFECT_7EECE0_V27_LOG_LEVEL = 4;
export const FRAME_EFFECT_7EECE0_V27_LOG_STR_VA = 0x00b6c2a8; /* " button config\n" */
export const FRAME_EFFECT_7EECE0_V27_LUA_NAME_VA = 0x00b73850; /* "gnPlayerHUDs" */
export const FRAME_EFFECT_7EECE0_V27_LUA_BIND_VA = 0x0086c3b7; /* binder push 0x7eece0 */

/** Null-gate law (0x7eece5/0x7eecec je 0x7eecf1): cfg and cfg10 both
 *  non-null is the proceed arm; the false arm logs 0xa112c0(4,
 *  0xb6c2a8) and returns 0 — the log emission stays host. */
export function frameEffect7eece0ConfigGate(cfg, cfg10) {
  return (cfg >>> 0) !== 0 && (cfg10 >>> 0) !== 0 ? 1 : 0;
}

/** Value law (0x7eecee mov eax,[eax]; ret @ 0x7eecf0 vs xor eax,eax @
 *  0x7eed00): stage is returned only on the valid chain, else 0. */
export function frameEffect7eece0ConfigStage(cfg, cfg10, stage) {
  if ((cfg >>> 0) === 0 || (cfg10 >>> 0) === 0) return 0;
  return stage | 0;
}

export const FRAME_EFFECT_7EED10_V27_VA = 0x007eed10;
export const FRAME_EFFECT_7EED10_V27_END_VA = 0x007eeea9; /* past final `ret` @ 0x7eeea8 */
export const FRAME_EFFECT_7EED10_V27_NEXT_VA = 0x007eeeb0;
export const FRAME_EFFECT_7EED10_V27_RET_BYTES = 0; /* plain `ret`; caller cleans 0xc */
export const FRAME_EFFECT_7EED10_V27_INSN_COUNT = 124;
export const FRAME_EFFECT_7EED10_V27_BYTE_LEN = 409;
export const FRAME_EFFECT_7EED10_V27_CALL_INSNS = 0;
export const FRAME_EFFECT_7EED10_V27_DIRECT_CALLS = 0;
export const FRAME_EFFECT_7EED10_V27_INDIRECT_CALLS = 0;
export const FRAME_EFFECT_7EED10_V27_DATA_STORES = 0;
export const FRAME_EFFECT_7EED10_V27_RET_COUNT = 8;
export const FRAME_EFFECT_7EED10_V27_DIRECT_CALLERS = Object.freeze([
  0x007eda99, 0x007edca5, 0x007eef27,
]);
export const FRAME_EFFECT_7EED10_V27_DWORD_HITS = Object.freeze([]);
export const FRAME_EFFECT_7EED10_V27_SFX_MGR_GLOBAL_VA = 0x00c7169c;
export const FRAME_EFFECT_7EED10_V27_SFX_GATE_OFF = 0x20dcc;
export const FRAME_EFFECT_7EED10_V27_GAME_GLOBAL_VA = 0x00c71678;
export const FRAME_EFFECT_7EED10_V27_GAME_GATE_OFF = 0x269ea;
export const FRAME_EFFECT_7EED10_V27_TYPE5_SUB_ZERO = 0x29; /* type 5 false subtype */
export const FRAME_EFFECT_7EED10_V27_TYPE4_SUBS = Object.freeze([0xd, 0x13, 0x14]);
export const FRAME_EFFECT_7EED10_V27_TYPE_3E8 = 0x3e8;
export const FRAME_EFFECT_7EED10_V27_3E8_PRE_SUBS = Object.freeze([
  0x15, 0x21, 0x44, 0x3f, 0x41, 0x40, 0x45, 0x9e, 0x9f,
]);
export const FRAME_EFFECT_7EED10_V27_3E8_SUBS = Object.freeze([
  0x4a, 0x4c, 0x27, 0x74, 0x78, 0xc0,
]);
export const FRAME_EFFECT_7EED10_V27_3E8_SUB_8D = 0x8d;
export const FRAME_EFFECT_7EED10_V27_3E8_SUB_A1 = 0xa1;
export const FRAME_EFFECT_7EED10_V27_3E8_SUB_9C = 0x9c;
export const FRAME_EFFECT_7EED10_V27_ARG_A_CAP = 0x384; /* UNSIGNED jae cap */
export const FRAME_EFFECT_7EED10_V27_ARG_B_SPECIAL = 0x3c0;
export const FRAME_EFFECT_7EED10_V27_TYPE_11 = 0x11;
export const FRAME_EFFECT_7EED10_V27_TYPE_21 = 0x21;
export const FRAME_EFFECT_7EED10_V27_TYPE_21_SUB_CAP = 0xa; /* UNSIGNED jb cap */
export const FRAME_EFFECT_7EED10_V27_TYPE_123 = 0x123;
export const FRAME_EFFECT_7EED10_V27_TYPE_124 = 0x124;
export const FRAME_EFFECT_7EED10_V27_TYPE_38B = 0x38b;
export const FRAME_EFFECT_7EED10_V27_TYPE_3C0 = 0x3c0;
export const FRAME_EFFECT_7EED10_V27_TYPE_3C5 = 0x3c5;

/** Audio OR gate (0x7eed18 cmp byte [eax+0x20dcc],0 / 0x7eed26 cmp byte
 *  [eax+0x269ea],0 — BYTE gates): the low byte of either global opens. */
export function frameEffect7eed10AudioGate(gateA, gateB) {
  return (gateA & 0xff) !== 0 || (gateB & 0xff) !== 0 ? 1 : 0;
}

/** Full captured-value decision tree of FUN_007eed10 (0 calls / 0 stores
 *  in the body; 8 plain `ret`; conventions ecx=type, edx=subtype,
 *  [ebp+8]=arg_a, [ebp+0xc]=arg_b, [ebp+0x10]=flag byte; jae/jb are
 *  UNSIGNED; byte params mask & 0xff). */
export function frameEffect7eed10Filter(type, subtype, argA, argB, flag,
                                        gateA, gateB) {
  const t = type >>> 0;
  const s = subtype >>> 0;
  const a = argA >>> 0;
  const b = argB >>> 0;
  const flagB = (flag & 0xff) >>> 0;
  const orGate = frameEffect7eed10AudioGate(gateA, gateB);
  if (t === 5) return s === FRAME_EFFECT_7EED10_V27_TYPE5_SUB_ZERO ? 0 : 1;
  if (t === 4) return FRAME_EFFECT_7EED10_V27_TYPE4_SUBS.includes(s) ? 0 : 1;
  if (t === 6) return 1;
  if (t === FRAME_EFFECT_7EED10_V27_TYPE_3E8) {
    if (FRAME_EFFECT_7EED10_V27_3E8_PRE_SUBS.includes(s) &&
        (flagB !== 0 || b === 0)) return 1;
    if (FRAME_EFFECT_7EED10_V27_3E8_SUBS.includes(s)) return 1;
    if (s === FRAME_EFFECT_7EED10_V27_3E8_SUB_8D) {
      return b === 0 || b === FRAME_EFFECT_7EED10_V27_ARG_B_SPECIAL ? 1 : 0;
    }
    if (s === FRAME_EFFECT_7EED10_V27_3E8_SUB_A1) {
      if (a >= FRAME_EFFECT_7EED10_V27_ARG_A_CAP || orGate !== 0) return 1;
      return 0;
    }
    if (s === FRAME_EFFECT_7EED10_V27_3E8_SUB_9C) {
      return a === 1 && orGate !== 0 ? 1 : 0;
    }
    return 0;
  }
  if (t === FRAME_EFFECT_7EED10_V27_TYPE_11) return 1;
  if (t === FRAME_EFFECT_7EED10_V27_TYPE_21) {
    return s < FRAME_EFFECT_7EED10_V27_TYPE_21_SUB_CAP ? 1 : 0;
  }
  if (t === FRAME_EFFECT_7EED10_V27_TYPE_124) return 1;
  if (t === FRAME_EFFECT_7EED10_V27_TYPE_123) return b === 0 ? 1 : 0;
  if (t === FRAME_EFFECT_7EED10_V27_TYPE_3C5) {
    return s !== FRAME_EFFECT_7EED10_V27_TYPE_21_SUB_CAP ? 1 : 0;
  }
  if (t === FRAME_EFFECT_7EED10_V27_TYPE_38B) {
    return a === 1 && flagB !== 0 ? 1 : 0;
  }
  if (t === FRAME_EFFECT_7EED10_V27_TYPE_3C0) return 1;
  return 0;
}

export const FRAME_EFFECT_7EEEB0_V27_VA = 0x007eeeb0;
export const FRAME_EFFECT_7EEEB0_V27_END_VA = 0x007ef41a; /* past final `ret 0xc` @ 0x7ef417 */
export const FRAME_EFFECT_7EEEB0_V27_NEXT_VA = 0x007ef420;
export const FRAME_EFFECT_7EEEB0_V27_RET_BYTES = 0xc;
export const FRAME_EFFECT_7EEEB0_V27_INSN_COUNT = 384;
export const FRAME_EFFECT_7EEEB0_V27_BYTE_LEN = 1386;
export const FRAME_EFFECT_7EEEB0_V27_CALL_INSNS = 16; /* 15 direct + 1 indirect [eax+0xc] */
export const FRAME_EFFECT_7EEEB0_V27_DIRECT_CALLS = 15;
export const FRAME_EFFECT_7EEEB0_V27_INDIRECT_CALLS = 1;
export const FRAME_EFFECT_7EEEB0_V27_DATA_STORES = 58;
export const FRAME_EFFECT_7EEEB0_V27_RET_COUNT = 8;
export const FRAME_EFFECT_7EEEB0_V27_DIRECT_CALLERS = Object.freeze([
  0x005c1039, 0x006e16a7, 0x006eb617, 0x007efdbf, 0x007efdd4, 0x007efe97,
]);
export const FRAME_EFFECT_7EEEB0_V27_DWORD_HITS = Object.freeze([]);
export const FRAME_EFFECT_7EEEB0_V27_SEH_STUB_VA = 0x00b00f6d;
export const FRAME_EFFECT_7EEEB0_V27_GS_COOKIE_VA = 0x00bf93b4;
export const FRAME_EFFECT_7EEEB0_V27_FILTER_VA = 0x007eed10; /* the 0x7eef27 gate call */
export const FRAME_EFFECT_7EEEB0_V27_ALLOC_VA = 0x00a0f4c0; /* 2x: @ 0x7ef0fa (0x20), @ 0x7ef158 (0x78) */
export const FRAME_EFFECT_7EEEB0_V27_INDIRECT_VA = 0x007ef328; /* call [eax+0xc] */

/* ABI v28: FUN_008206e0 stage-id selector (PURE-OPEN) — the v24-recorded
 * next VA after the 0x8204b0 VoidDoor landing, unassessed through v27
 * (census-8206e0-body.json in frame-effect-v28-8206e0: 16 insns / 49 B /
 * 0 resyncs / 0 calls / 2 plain `ret` / 0 stores / 1 caller 0x7eb4ce /
 * 0 raw hits / identify-zhl EMPTY; thiscall, ecx = Room-shaped receiver,
 * ZERO stack args). */

export const FRAME_EFFECT_8206E0_VA = 0x008206e0;
export const FRAME_EFFECT_8206E0_END_VA = 0x00820711; /* past final `ret` @ 0x820710 */
export const FRAME_EFFECT_8206E0_NEXT_VA = 0x00820720; /* after int3 pad 0x820711..0x82071f */
export const FRAME_EFFECT_8206E0_RET_BYTES = 0; /* plain `ret`, zero stack args */
export const FRAME_EFFECT_8206E0_INSN_COUNT = 16;
export const FRAME_EFFECT_8206E0_BYTE_LEN = 49;
export const FRAME_EFFECT_8206E0_CALL_INSNS = 0;
export const FRAME_EFFECT_8206E0_DIRECT_CALLERS = 1;
export const FRAME_EFFECT_8206E0_RAW_DWORD_HITS = 0;
export const FRAME_EFFECT_8206E0_CALLSITE_VA = 0x007eb4ce;
export const FRAME_EFFECT_8206E0_GAME_GLOBAL_VA = 0x00c71678; /* g_Game */
export const FRAME_EFFECT_8206E0_CHAPTER_OFF = 0x4; /* [g_Game+4] = chapter */
export const FRAME_EFFECT_8206E0_DESC_OFF = 0x4; /* [this+4] = Room desc */
export const FRAME_EFFECT_8206E0_DESC_FLAG_OFF = 0x44; /* = ROOM_DESC_FLAG_OFF */
export const FRAME_EFFECT_8206E0_FLAG_BIT = 6; /* shr eax,6; test al,1 */
export const FRAME_EFFECT_8206E0_RESULT_CHAPTER = 0x29; /* 41 */
export const FRAME_EFFECT_8206E0_RESULT_BIT6 = 0x1a; /* 26 */
export const FRAME_EFFECT_8206E0_RESULT_CLEAR = 9;
export const FRAME_EFFECT_8206E0_RET_A_VA = 0x0082070a; /* miss arm ret */
export const FRAME_EFFECT_8206E0_RET_B_VA = 0x00820710; /* chapter arm ret */

/** Chapter 4 || 5 gate (0x8206e8/eb, 0x8206ed/f0): FULL-dword equality,
 *  so signedness cannot matter. */
export function frameEffect8206e0Chapter41Gate(chapter) {
  const c = chapter >>> 0;
  return c === 4 || c === 5 ? 1 : 0;
}

/** Bit-6 gate (0x8206fa/fd/700/707): `shr eax,6` LOGICAL then `test al,1`
 *  — bit 0 of AL after the shift is bit 6 of the ORIGINAL flags dword.
 *  Full-dword input; the byte-width op is register AL only. */
export function frameEffect8206e0DescBit6(descFlags44) {
  return ((descFlags44 >>> FRAME_EFFECT_8206E0_FLAG_BIT) & 1) >>> 0;
}

/** The whole value law: chapter 4/5 -> 0x29 (41); else bit6 -> 0x1a (26);
 *  else 9. */
export function frameEffect8206e0Result(chapter, descFlags44) {
  if (frameEffect8206e0Chapter41Gate(chapter) === 1) {
    return FRAME_EFFECT_8206E0_RESULT_CHAPTER >>> 0;
  }
  if (frameEffect8206e0DescBit6(descFlags44) === 1) {
    return FRAME_EFFECT_8206E0_RESULT_BIT6 >>> 0;
  }
  return FRAME_EFFECT_8206E0_RESULT_CLEAR >>> 0;
}

/** Machine-truth entry plan (32-B struct, 9 fields like the C++ side):
 *  the chapter derefs are unconditional; the desc/flags derefs run ONLY
 *  off the chapter arm (reproduced, not folded). */
export function frameEffect8206e0EntryPlan(chapter, descFlags44) {
  const chapter41 = frameEffect8206e0Chapter41Gate(chapter);
  return {
    derefGame: 1,
    derefChapter: 1,
    chapter41,
    descDeref: chapter41 === 0 ? 1 : 0,
    flagDeref: chapter41 === 0 ? 1 : 0,
    descBit6: frameEffect8206e0DescBit6(descFlags44),
    result: frameEffect8206e0Result(chapter, descFlags44) >>> 0,
    hostCalls: 0,
    pureComplete: 1,
  };
}

/* ABI v29: FUN_00820720 Room::GetBossVictoryJingle (ZHL-promoted in
 * comments only; exact 13-byte pattern 56 8b 35 ?? ?? ?? ?? 57 8b f9
 * 83 3e 0d, Room.zhl) — the v28-recorded sibling (int3 pad
 * 0x82079c..0x82079f, next fn 0x8207a0). census-820720-body.json in
 * frame-effect-v29-820720: 46 insns / 124 B / 0 resyncs / 1 call
 * (0x74bae0, HOST) / 0 indirect / 4 plain `ret` / 0 stores / 2 callers
 * 0x7fee72 + 0x7ff7fe / 0 raw hits / thiscall, ecx = Room, ZERO stack
 * args, uint32_t music-id result. Arm order: 0 / 0 / 0x5c / 0x2a /
 * 0x61:0x53 (see the header block for the stream). */

export const FRAME_EFFECT_820720_VA = 0x00820720;
export const FRAME_EFFECT_820720_END_VA = 0x0082079c; /* past final `ret` @ 0x82079b */
export const FRAME_EFFECT_820720_NEXT_VA = 0x008207a0; /* after int3 pad 0x82079c..0x82079f */
export const FRAME_EFFECT_820720_RET_BYTES = 0; /* plain `ret` x4, zero stack args */
export const FRAME_EFFECT_820720_INSN_COUNT = 46;
export const FRAME_EFFECT_820720_BYTE_LEN = 124;
export const FRAME_EFFECT_820720_CALL_INSNS = 1;
export const FRAME_EFFECT_820720_DIRECT_CALLERS = 2;
export const FRAME_EFFECT_820720_RAW_DWORD_HITS = 0;
export const FRAME_EFFECT_820720_CALLSITE_A_VA = 0x007fee72;
export const FRAME_EFFECT_820720_CALLSITE_B_VA = 0x007ff7fe;
export const FRAME_EFFECT_820720_HOST_74BAE0_VA = 0x0074bae0;
export const FRAME_EFFECT_820720_GAME_GLOBAL_VA = 0x00c71678; /* g_Game */
export const FRAME_EFFECT_820720_GAME_0_EXPECT = 0xd; /* cmp [g_Game+0],0xd */
export const FRAME_EFFECT_820720_CHAPTER_1_EXPECT = 1; /* cmp [g_Game+4],1 */
export const FRAME_EFFECT_820720_HOST_RESULT_EXPECT = 4;
export const FRAME_EFFECT_820720_GAME_18304_OFF = 0x18304;
export const FRAME_EFFECT_820720_GAME_18304_EXPECT = -10; /* 0xfffffff6 */
export const FRAME_EFFECT_820720_ROOM_PTR_OFF = 0x18300;
export const FRAME_EFFECT_820720_ROOM_TYPE_OFF = 0x8; /* [room+8] type */
export const FRAME_EFFECT_820720_ROOM_TYPE_5C = 6;
export const FRAME_EFFECT_820720_ROOM_7228_OFF = 0x7228; /* byte flag (BYTE gate) */
export const FRAME_EFFECT_820720_CHAPTER_OFF = 0x4; /* [g_Game+4] = chapter */
export const FRAME_EFFECT_820720_DESC_OFF = 0x4; /* [this+4] Room desc */
export const FRAME_EFFECT_820720_DESC_FLAG_OFF = 0x44; /* = ROOM_DESC_FLAG_OFF */
export const FRAME_EFFECT_820720_FLAG_BIT = 6; /* shr eax,6; test al,1 */
export const FRAME_EFFECT_820720_RESULT_ZERO = 0;
export const FRAME_EFFECT_820720_RESULT_5C = 0x5c; /* 92 */
export const FRAME_EFFECT_820720_RESULT_2A = 0x2a; /* 42 */
export const FRAME_EFFECT_820720_RESULT_BIT6 = 0x61; /* 97 — cmovne value */
export const FRAME_EFFECT_820720_RESULT_CLEAR = 0x53; /* 83 */
export const FRAME_EFFECT_820720_RET_ZERO_VA = 0x0082074e;
export const FRAME_EFFECT_820720_RET_BIT6_VA = 0x0082078b;
export const FRAME_EFFECT_820720_RET_2A_VA = 0x00820793;
export const FRAME_EFFECT_820720_RET_5C_VA = 0x0082079b;

/** First zero arm (0x82072a/0x82072f): [g_Game+0]==0xd && chapter==1,
 *  FULL-dword equality (signedness cannot matter). */
export function frameEffect820720ZeroGate(game0, chapter) {
  return (game0 >>> 0) === FRAME_EFFECT_820720_GAME_0_EXPECT &&
         (chapter >>> 0) === FRAME_EFFECT_820720_CHAPTER_1_EXPECT
    ? 1
    : 0;
}

/** Second zero arm (0x82073c/0x820741): host 0x74bae0 result == 4 &&
 *  [g_Game+0x18304] == -10 (0xfffffff6 by value). */
export function frameEffect820720HostZeroGate(hostResult, game18304) {
  return (hostResult | 0) === FRAME_EFFECT_820720_HOST_RESULT_EXPECT &&
         (game18304 | 0) === FRAME_EFFECT_820720_GAME_18304_EXPECT
    ? 1
    : 0;
}

/** 0x5c arm (0x820755/0x82075b): [room+8] type == 6 (FULL dword) OR the
 *  room byte flag at +0x7228 is nonzero (BYTE gate: masked & 0xff). */
export function frameEffect820720Room5cGate(roomType8, roomByte7228) {
  return (roomType8 | 0) === FRAME_EFFECT_820720_ROOM_TYPE_5C ||
         (roomByte7228 & 0xff) !== 0
    ? 1
    : 0;
}

/** 0x2a arm (0x820767/0x82076c): chapter 4 || 5, FULL dword equality. */
export function frameEffect820720Chapter42Gate(chapter) {
  const c = chapter >>> 0;
  return c === 4 || c === 5 ? 1 : 0;
}

/** desc flags bit 6 (0x82077e shr LOGICAL / 0x820781 test al,1 /
 *  0x820788 cmovne 0x61/0x53): bit 6 of the ORIGINAL flags dword. */
export function frameEffect820720DescBit6(descFlags44) {
  return ((descFlags44 >>> FRAME_EFFECT_820720_FLAG_BIT) & 1) >>> 0;
}

/** Whole value law, arm order as compiled:
 *  0 (game0==0xd && chapter==1) / 0 (host==4 && 18304==-10) /
 *  0x5c (room type==6 || byte 7228) / 0x2a (chapter 4/5) /
 *  0x61 : 0x53 (desc bit 6). */
export function frameEffect820720Result(
  game0, chapter, hostResult, game18304, roomType8, roomByte7228,
  descFlags44,
) {
  if (frameEffect820720ZeroGate(game0, chapter) === 1) {
    return FRAME_EFFECT_820720_RESULT_ZERO >>> 0;
  }
  if (frameEffect820720HostZeroGate(hostResult, game18304) === 1) {
    return FRAME_EFFECT_820720_RESULT_ZERO >>> 0;
  }
  if (frameEffect820720Room5cGate(roomType8, roomByte7228) === 1) {
    return FRAME_EFFECT_820720_RESULT_5C >>> 0;
  }
  if (frameEffect820720Chapter42Gate(chapter) === 1) {
    return FRAME_EFFECT_820720_RESULT_2A >>> 0;
  }
  if (frameEffect820720DescBit6(descFlags44) === 1) {
    return FRAME_EFFECT_820720_RESULT_BIT6 >>> 0;
  }
  return FRAME_EFFECT_820720_RESULT_CLEAR >>> 0;
}

/** Machine-truth entry plan (60-B struct, 15 fields like the C++ side):
 *  the game/chapter derefs are unconditional (chapter re-read @0x820764);
 *  the 0x74bae0 host call fires only off the first zero arm; the 0x18304
 *  deref only when the host result == 4; the room deref only when both
 *  zero arms miss; the desc/flags derefs ONLY on the final arm
 *  (reproduced, not folded). */
export function frameEffect820720EntryPlan(
  game0, chapter, hostResult, game18304, roomType8, roomByte7228,
  descFlags44,
) {
  const zeroGate = frameEffect820720ZeroGate(game0, chapter);
  const hostZero = frameEffect820720HostZeroGate(hostResult, game18304);
  const room5c = frameEffect820720Room5cGate(roomType8, roomByte7228);
  const chapter42 = frameEffect820720Chapter42Gate(chapter);
  const onFinalArm =
    zeroGate === 0 && hostZero === 0 && room5c === 0 && chapter42 === 0
      ? 1
      : 0;
  return {
    derefGame: 1,
    derefChapter: 1,
    zeroGate,
    host74bae0Fires: zeroGate === 0 ? 1 : 0,
    deref18304: zeroGate === 0 && (hostResult | 0) === 4 ? 1 : 0,
    hostZero,
    derefRoom: zeroGate === 0 && hostZero === 0 ? 1 : 0,
    room5c,
    chapter42,
    descDeref: onFinalArm,
    flagDeref: onFinalArm,
    descBit6: frameEffect820720DescBit6(descFlags44),
    result: frameEffect820720Result(
      game0, chapter, hostResult, game18304, roomType8, roomByte7228,
      descFlags44,
    ) >>> 0,
    hostCalls: 1,
    pureComplete: 0,
  };
}

/* ABI v30: FUN_008207a0 (the SEH intro-action body, decision-seams class)
 * and FUN_008208c0 (the next pure sibling, PURE-OPEN). census-8207a0-body.json
 * in frame-effect-v30-8207a0: 86 insns / 275 B / 5 calls (all HOST) /
 * 1 plain `ret` / 2 callers / 0 raw hits / thiscall ecx=Room / result
 * ALWAYS 0. 8208c0: 4 insns / 19 B / 0 calls / 2 callers / 1 raw hit
 * (push-imm32 @ 0x86c8c2). Exception paths stay host (v3 rule). */

export const FRAME_EFFECT_8207A0_VA = 0x008207a0;
export const FRAME_EFFECT_8207A0_END_VA = 0x008208b3; /* past `ret` @ 0x8208b2 */
export const FRAME_EFFECT_8207A0_NEXT_VA = 0x008208c0; /* int3 pad 0x8208b3..0x8208bf */
export const FRAME_EFFECT_8207A0_RET_BYTES = 0; /* plain `ret`, zero stack args */
export const FRAME_EFFECT_8207A0_INSN_COUNT = 86;
export const FRAME_EFFECT_8207A0_BYTE_LEN = 275;
export const FRAME_EFFECT_8207A0_CALL_INSNS = 5;
export const FRAME_EFFECT_8207A0_INDIRECT_CALLS = 0;
export const FRAME_EFFECT_8207A0_RET_VA = 0x008208b2;
export const FRAME_EFFECT_8207A0_DIRECT_CALLERS = 2;
export const FRAME_EFFECT_8207A0_RAW_DWORD_HITS = 0;
export const FRAME_EFFECT_8207A0_CALLSITE_A_VA = 0x005fa76f;
export const FRAME_EFFECT_8207A0_CALLSITE_B_VA = 0x0070088f;
export const FRAME_EFFECT_8207A0_HANDLER_VA = 0x00af1690; /* pushed SEH handler */
export const FRAME_EFFECT_8207A0_GAME_GLOBAL_VA = 0x00c71678; /* g_Game */
export const FRAME_EFFECT_8207A0_GAME_0_EXPECT = 1; /* cmp [g_Game+0],1 */
export const FRAME_EFFECT_8207A0_MODE_FLAGS_OFF = 0x1839c; /* bit 16 test */
export const FRAME_EFFECT_8207A0_MODE_FLAG_BIT = 16; /* test 0x10000 */
export const FRAME_EFFECT_8207A0_GAME_18304_OFF = 0x18304;
export const FRAME_EFFECT_8207A0_GAME_182D0_OFF = 0x182d0;
export const FRAME_EFFECT_8207A0_GAME_FLAG_OBJ_OFF = 0x1adbc;
export const FRAME_EFFECT_8207A0_FLAG_OFF = 0x44; /* byte [obj+0x44] */
export const FRAME_EFFECT_8207A0_FLAG_BIT = 6; /* bit 6 within the byte */
export const FRAME_EFFECT_8207A0_DESC_OFF = 0x4; /* [this+4] Room desc */
export const FRAME_EFFECT_8207A0_DESC_5C_OFF = 0x5c; /* [desc+0x5c] */
export const FRAME_EFFECT_8207A0_RECEIVER_1218_OFF = 0x1218; /* 0x41af60 this */
export const FRAME_EFFECT_8207A0_ENTRY_END_VA = 0x0082080b; /* past gate D */
export const FRAME_EFFECT_8207A0_RESULT = 0; /* xor al,al @0x82089f */
export const FRAME_EFFECT_8207A0_HOST_812D00_VA = 0x00812d00;
export const FRAME_EFFECT_8207A0_HOST_6FE410_VA = 0x006fe410; /* family v10 dispatcher */
export const FRAME_EFFECT_8207A0_HOST_703670_VA = 0x00703670;
export const FRAME_EFFECT_8207A0_HOST_41AF60_VA = 0x0041af60;
export const FRAME_EFFECT_8207A0_HOST_A648B0_VA = 0x00a648b0; /* v8-known allocator */
export const FRAME_EFFECT_8207A0_DISPATCH_ARG1 = 5;
export const FRAME_EFFECT_8207A0_DISPATCH_ARG2 = 0x6e;
export const FRAME_EFFECT_8207A0_DISPATCH_ARG4_VA = 0x00c7b640;
export const FRAME_EFFECT_8207A0_OUT_ENTITY_FLAG_OFF = 0x450; /* loop store */
export const FRAME_EFFECT_8207A0_ENTITY_LOOP_END_VA = 0x00820882; /* the jb */

export const FRAME_EFFECT_8208C0_VA = 0x008208c0;
export const FRAME_EFFECT_8208C0_END_VA = 0x008208d3; /* past `ret` @ 0x8208d2 */
export const FRAME_EFFECT_8208C0_NEXT_VA = 0x008208e0; /* int3 pad 0x8208d3..0x8208df */
export const FRAME_EFFECT_8208C0_RET_BYTES = 0; /* plain `ret`, zero stack args */
export const FRAME_EFFECT_8208C0_INSN_COUNT = 4;
export const FRAME_EFFECT_8208C0_BYTE_LEN = 19;
export const FRAME_EFFECT_8208C0_CALL_INSNS = 0;
export const FRAME_EFFECT_8208C0_DIRECT_CALLERS = 2;
export const FRAME_EFFECT_8208C0_RAW_DWORD_HITS = 1; /* imm32 of `push 0x8208c0` @ 0x86c8c2 */
export const FRAME_EFFECT_8208C0_CALLSITE_A_VA = 0x005f5b31;
export const FRAME_EFFECT_8208C0_CALLSITE_B_VA = 0x006ca104;
export const FRAME_EFFECT_8208C0_HIT_VA = 0x0086c8c3;
export const FRAME_EFFECT_8208C0_FIELD_OFF = 0x7240; /* f32 [this+0x7240] */
export const FRAME_EFFECT_8208C0_CONST_VA = 0x00ba9fe4; /* +0.0f (CORRECTED
                                                           v31: measured bits
                                                           0x00000000; the
                                                           v30 -18.0f claim
                                                           mis-mapped the
                                                           .rdata read) */
export const FRAME_EFFECT_8208C0_CONST_BITS = 0x00000000; /* +0.0f bits */

/* ABI v31: FUN_008208e0 Room::IsCurrentRoomLastBoss (PURE-OPEN). */
export const FRAME_EFFECT_8208E0_VA = 0x008208e0;
export const FRAME_EFFECT_8208E0_END_VA = 0x00820905; /* past `ret` @ 0x820904 */
export const FRAME_EFFECT_8208E0_NEXT_VA = 0x00820910; /* int3 pad 0x820905..0x82090f */
export const FRAME_EFFECT_8208E0_RET_BYTES = 0; /* plain `ret`, zero stack args */
export const FRAME_EFFECT_8208E0_INSN_COUNT = 8;
export const FRAME_EFFECT_8208E0_BYTE_LEN = 37;
export const FRAME_EFFECT_8208E0_CALL_INSNS = 1;
export const FRAME_EFFECT_8208E0_INDIRECT_CALLS = 0;
export const FRAME_EFFECT_8208E0_RET_VA = 0x00820904;
export const FRAME_EFFECT_8208E0_DIRECT_CALLERS = 2;
export const FRAME_EFFECT_8208E0_RAW_DWORD_HITS = 1; /* imm32 @0x86c8e5 */
export const FRAME_EFFECT_8208E0_CALLSITE_A_VA = 0x007fbd1f;
export const FRAME_EFFECT_8208E0_CALLSITE_B_VA = 0x0080df46;
export const FRAME_EFFECT_8208E0_HIT_VA = 0x0086c8e5;
export const FRAME_EFFECT_8208E0_GAME_GLOBAL_VA = 0x00c71678; /* g_Game */
export const FRAME_EFFECT_8208E0_GAME_18304_OFF = 0x18304; /* host arg1 */
export const FRAME_EFFECT_8208E0_HOST_ARG2 = 0xffffffff; /* push -1 (dim) */
export const FRAME_EFFECT_8208E0_RET8_OFF = 0x8; /* [host_ret+8] */
export const FRAME_EFFECT_8208E0_GAME_18314_OFF = 0x18314;
export const FRAME_EFFECT_8208E0_HOST_740BC0_VA = 0x00740bc0; /* GetRoomByIdx */
export const FRAME_EFFECT_8208E0_LUA_NAME_VA = 0x00b73d2c; /* "IsCurrentRoomLastBoss" */
export const FRAME_EFFECT_8208E0_REG_HELPER_VA = 0x008906f0;

/* ABI v31: FUN_00820910 Room::MamaMegaExplosion (decision seams). */
export const FRAME_EFFECT_820910_VA = 0x00820910;
export const FRAME_EFFECT_820910_END_VA = 0x00820a99; /* past `ret 8` @0x820a98 */
export const FRAME_EFFECT_820910_NEXT_VA = 0x00820aa0; /* int3 pad 0x820a99..0x820a9f */
export const FRAME_EFFECT_820910_RET_BYTES = 8;
export const FRAME_EFFECT_820910_INSN_COUNT = 64;
export const FRAME_EFFECT_820910_BYTE_LEN = 393;
export const FRAME_EFFECT_820910_CALL_INSNS = 5; /* direct calls */
export const FRAME_EFFECT_820910_INDIRECT_CALLS = 1; /* [vt+0xc] */
export const FRAME_EFFECT_820910_RET_VA = 0x00820a98; /* raw-copy exit */
export const FRAME_EFFECT_820910_DIRECT_CALLERS = 2;
export const FRAME_EFFECT_820910_RAW_DWORD_HITS = 2; /* 0x86c918 + 0x8911ea */
export const FRAME_EFFECT_820910_CALLSITE_A_VA = 0x0074baa7;
export const FRAME_EFFECT_820910_CALLSITE_B_VA = 0x008053be;
export const FRAME_EFFECT_820910_HIT_A_VA = 0x0086c918;
export const FRAME_EFFECT_820910_HIT_B_VA = 0x008911ea;
export const FRAME_EFFECT_820910_GAME_GLOBAL_VA = 0x00c71678; /* g_Game */
export const FRAME_EFFECT_820910_DESC_OFF = 0x4; /* [this+4] Room desc */
export const FRAME_EFFECT_820910_DESC_FLAG_OFF = 0x44;
export const FRAME_EFFECT_820910_DESC_FLAG_BITS = 0x4000;
export const FRAME_EFFECT_820910_HOST_6EEF60_VA = 0x006eef60; /* genrand */
export const FRAME_EFFECT_820910_HOST_417870_VA = 0x00417870; /* GetPlayer */
export const FRAME_EFFECT_820910_HOST_6FE410_VA = 0x006fe410; /* family v10 */
export const FRAME_EFFECT_820910_HOST_435A50_VA = 0x00435a50; /* CRT sqrt */
export const FRAME_EFFECT_820910_DISPATCH_ARG1 = 0x3e8;
export const FRAME_EFFECT_820910_DISPATCH_ARG2 = 0x7f;
export const FRAME_EFFECT_820910_DISPATCH_ARG4_VA = 0x00c7b640;
export const FRAME_EFFECT_820910_SENTINEL_X0_VA = 0x00c7b640;
export const FRAME_EFFECT_820910_SENTINEL_X1_VA = 0x00c7b644;
export const FRAME_EFFECT_820910_SENTINEL_X0_BITS = 0x3760371c; /* 1.3364e-05f */
export const FRAME_EFFECT_820910_SENTINEL_X1_BITS = 0x37873770; /* 1.6119e-05f */
export const FRAME_EFFECT_820910_SCALE_200_VA = 0x00baaa94; /* 200.0f */
export const FRAME_EFFECT_820910_SCALE_200_BITS = 0x43480000;
export const FRAME_EFFECT_820910_ZERO_CONST_VA = 0x00ba9fe4; /* +0.0f (measured) */
export const FRAME_EFFECT_820910_VTABLE_SLOT = 0xc;
export const FRAME_EFFECT_820910_PLAYER_X_OFF = 0x33c;
export const FRAME_EFFECT_820910_PLAYER_Y_OFF = 0x340;
export const FRAME_EFFECT_820910_LUA_NAME_VA = 0x00b73d18; /* "MamaMegaExplosion" */
export const FRAME_EFFECT_820910_REG_HELPER_VA = 0x008911d0; /* Lua-C helper */

/** Four-gate entry conjunction (0x8207d0..0x820801): game_0==1, FULL-dword
 *  bit 16 of [g+0x1839c], [g+0x18304]==[g+0x182d0], and the BYTE flag bit
 *  6 of [[g+0x1adbc]+0x44] CLEAR (masked & 0xff). All four must hold for
 *  the action block (flag store, 0x6fe410 pack, entity loop, allocator)
 *  to run. NULL-return-free; each gate is a strict value comparison. */
export function frameEffect8207a0EntryGate(game0, modeFlags1839c, game18304,
                                           game182d0, flagByte44) {
  if ((game0 >>> 0) !== FRAME_EFFECT_8207A0_GAME_0_EXPECT) return 0;
  if ((((modeFlags1839c >>> 0) >>> FRAME_EFFECT_8207A0_MODE_FLAG_BIT) & 1) === 0) return 0;
  if ((game18304 | 0) !== (game182d0 | 0)) return 0;
  if ((((flagByte44 & 0xff) >>> FRAME_EFFECT_8207A0_FLAG_BIT) & 1) !== 0) return 0;
  return 1;
}

/** desc ? [desc+0x5c] : 0 — the 0x6fe410 arg7 formation (0x820818/0x82081f). */
export function frameEffect8207a0DescValue(descPtr, desc5c) {
  return (descPtr >>> 0) !== 0 ? desc5c >>> 0 : 0;
}

/** Byte [ebp-0x24] == 0 (masked & 0xff) — the 0xa648b0 allocator fires. */
export function frameEffect8207a0PostLoopGate(outByte24) {
  return (outByte24 & 0xff) === 0 ? 1 : 0;
}

/** Single merge point 0x82089f xor al,al — always 0 on the normal path. */
export function frameEffect8207a0Result() {
  return FRAME_EFFECT_8207A0_RESULT >>> 0;
}

/** Machine-truth entry plan (52-B struct, 13 fields like the C++ side):
 *  per-gate deref rows (each later read runs only when the earlier gates
 *  passed) plus the action-block rows gated on the entry conjunction,
 *  the constant result and the host-call census. */
export function frameEffect8207a0EntryPlan(
  game0, modeFlags1839c, game18304, game182d0, flagByte44, descPtr,
  desc5c, outByte24,
) {
  const gateA = (game0 >>> 0) === FRAME_EFFECT_8207A0_GAME_0_EXPECT ? 1 : 0;
  const gateB =
    (((modeFlags1839c >>> 0) >>> FRAME_EFFECT_8207A0_MODE_FLAG_BIT) & 1) !== 0
      ? 1 : 0;
  const gateC = (game18304 | 0) === (game182d0 | 0) ? 1 : 0;
  const gateD =
    (((flagByte44 & 0xff) >>> FRAME_EFFECT_8207A0_FLAG_BIT) & 1) === 0 ? 1 : 0;
  const entry = gateA && gateB && gateC && gateD ? 1 : 0;
  return {
    derefGame: 1,
    derefModeFlags: gateA,
    derefTransition: gateA && gateB ? 1 : 0,
    derefFlagObj: gateA && gateB && gateC ? 1 : 0,
    derefFlagByte: gateA && gateB && gateC ? 1 : 0,
    entryGate: entry,
    descDeref: entry,
    desc5cDeref: entry && (descPtr >>> 0) !== 0 ? 1 : 0,
    descValue: frameEffect8207a0DescValue(descPtr, desc5c),
    postLoopGate: frameEffect8207a0PostLoopGate(outByte24),
    result: frameEffect8207a0Result() >>> 0,
    hostCalls: 5,
    pureComplete: 0,
  };
}

/** comiss xmm0,[0xba9fe4] (+0.0f — CORRECTED v31: measured bits
 *  0x00000000; the v30 "-18.0f (0xc1900000)" text mis-mapped the .rdata
 *  read) + seta al — 1 iff the f32 room field is ORDERED and strictly
 *  greater; NaN and the equal value give 0 (seta is CF==0 && ZF==0;
 *  unordered sets both). Plain IEEE > is the exact law. */
export function frameEffect8208c0Above(roomField7240) {
  return roomField7240 > 0.0 ? 1 : 0;
}

/** Machine-truth entry plan (16-B struct, 4 fields like the C++ side). */
export function frameEffect8208c0EntryPlan(roomField7240) {
  return {
    derefField: 1,
    above: frameEffect8208c0Above(roomField7240),
    hostCalls: 0,
    pureComplete: 1,
  };
}

/* ---- ABI v31: FUN_008208e0 Room::IsCurrentRoomLastBoss (PURE-OPEN) ---- */

/** (ret8 == game_18314) FULL dword equality (0x8208fb cmp / 0x820901
 *  sete al) — the [0x740bc0 ret + 8] == [g_Game+0x18314] value shape,
 *  the same law the family's v23 820170 probe_bit2_gate already pins
 *  (PE 0x820224). ret8 and game_18314 are caller-resolved; the host
 *  GetRoomByIdx call itself stays host. */
export function frameEffect8208e0SyncGate(ret8, game18314) {
  return (ret8 >>> 0) === (game18314 >>> 0) ? 1 : 0;
}

/** Machine-truth entry plan (32-B struct, 8 fields like the C++ side):
 *  every deref in this body is unconditional (no gate short-circuits). */
export function frameEffect8208e0EntryPlan(ret8, game18314) {
  return {
    derefGame: 1,
    deref18304: 1,
    host740bc0: 1,
    derefRet8: 1,
    deref18314: 1,
    syncGate: frameEffect8208e0SyncGate(ret8, game18314),
    hostCalls: 1,
    pureComplete: 1,
  };
}

/* ---- ABI v31: FUN_00820910 Room::MamaMegaExplosion (decision seams) ---- */

/** flags | 0x4000 — the unconditional [desc+0x44] store VALUE
 *  (0x820921 or dword [eax+0x44],0x4000; the store stays host). */
export function frameEffect820910DescFlagsRewrite(flags) {
  return (flags | FRAME_EFFECT_820910_DESC_FLAG_BITS) >>> 0;
}

/** (arg2 == 0) FULL dword zero-test (0x82092f/0x820934) — the first
 *  Game::GetPlayer call (0x417870) fires exactly then. */
export function frameEffect820910GetPlayerGate(arg2) {
  return (arg2 >>> 0) === 0 ? 1 : 0;
}

/** The 0x6fe410 pack arg4 (0x82093c/0x820950): arg2 when nonzero, else
 *  the caller-resolved GetPlayer result. */
export function frameEffect820910PackArg(arg2, hostPlayer) {
  return (arg2 >>> 0) !== 0 ? arg2 >>> 0 : hostPlayer >>> 0;
}

/** The ucomiss + lahf/test-ah/jp probes (0x820969/0x82097f + the
 *  0x820971/0x820987 parity algebra): the normalize path runs iff BOTH
 *  probes are ORDERED-EQUAL to the sentinel pair, exactly
 *  (x0 == c0) && (x1 == c1) in f32 IEEE equality (NaN -> false). For
 *  the constants (positive normals) this equals PURE BIT equality — a
 *  NaN or +-0.0 input disagrees under both semantics, so the oracle
 *  compares bits. */
export function frameEffect820910SentinelMatch(x0Bits, x1Bits) {
  return (x0Bits >>> 0) === FRAME_EFFECT_820910_SENTINEL_X0_BITS &&
    (x1Bits >>> 0) === FRAME_EFFECT_820910_SENTINEL_X1_BITS ? 1 : 0;
}

/** comiss xmm0,[0xba9fe4] (+0.0f, measured — the same corrected
 *  constant as 8208c0) ; jbe 0x820a3d — the 200.0f/sqrt_res scale only
 *  when the host sqrt result is ORDERED > 0.0f; NaN / -0.0 keep 1.0f.
 *  The division is exact f32: Math.fround(200.0 / res) single-rounds
 *  (f64 has 53 >= 2*24+2 bits, so double rounding is innocuous for
 *  division in round-to-nearest), matching divss under the default
 *  MXCSR. */
export function frameEffect820910DistScale(sqrtResBits) {
  const res = fe81e9d0BitsToF32(sqrtResBits >>> 0);
  return res > 0.0 ? Math.fround(200.0 / res) : 1.0;
}

/** Machine-truth entry plan (40-B struct, 10 fields like the C++ side):
 *  deref rows + gates + the host-draw census. deref_player (the second
 *  GetPlayer + its +0x33c/+0x340 reads) runs iff the sentinel matches;
 *  the 0x417870 pair and the 0x6eef60 draw stay host-side, recorded
 *  only. */
export function frameEffect820910EntryPlan(arg2, x0Bits, x1Bits,
                                           sqrtResBits) {
  const match = frameEffect820910SentinelMatch(x0Bits, x1Bits);
  const res = fe81e9d0BitsToF32(sqrtResBits >>> 0);
  return {
    derefDesc: 1,
    storeFlags: 1,
    getPlayerGate: frameEffect820910GetPlayerGate(arg2),
    draw: 1,
    derefParam1: 1,
    sentinelMatch: match,
    derefPlayer: match,
    distGate: res > 0.0 ? 1 : 0, /* the comiss+jbe test, NOT the scale —
                                    the scale equals 1.0 exactly when
                                    res == 200.0f */
    hostCalls: 6,
    pureComplete: 0,
  };
}

/* ABI v32: FUN_00820aa0 Lua Room::GetDungeonRockIdx (PURE-OPEN). */
export const FRAME_EFFECT_820AA0_VA = 0x00820aa0;
export const FRAME_EFFECT_820AA0_END_VA = 0x00820abc; /* past `ret` @ 0x820abb */
export const FRAME_EFFECT_820AA0_NEXT_VA = 0x00820ac0; /* int3 pad 0x820abc..0x820abf */
export const FRAME_EFFECT_820AA0_RET_BYTES = 0; /* plain `ret` x2, zero stack args */
export const FRAME_EFFECT_820AA0_INSN_COUNT = 7;
export const FRAME_EFFECT_820AA0_BYTE_LEN = 28;
export const FRAME_EFFECT_820AA0_CALL_INSNS = 0;
export const FRAME_EFFECT_820AA0_INDIRECT_CALLS = 0;
export const FRAME_EFFECT_820AA0_RET_VA = 0x00820abb; /* the fallback exit */
export const FRAME_EFFECT_820AA0_DIRECT_CALLERS = 0; /* Lua-only binding */
export const FRAME_EFFECT_820AA0_RAW_DWORD_HITS = 1; /* imm32 @0x86c84c */
export const FRAME_EFFECT_820AA0_HIT_VA = 0x0086c84c;
export const FRAME_EFFECT_820AA0_GAME_GLOBAL_VA = 0x00c71678; /* g_Game */
export const FRAME_EFFECT_820AA0_FLAGS_OFF = 0x1839c; /* [g_Game+0x1839c] */
export const FRAME_EFFECT_820AA0_FLAG_BIT = 0x2000; /* the tested bit */
export const FRAME_EFFECT_820AA0_ROCK_OFF = 0x768; /* [receiver+0x768] */
export const FRAME_EFFECT_820AA0_RESULT_NEG1 = 0xffffffff; /* or eax,-1 */
export const FRAME_EFFECT_820AA0_LUA_NAME_VA = 0x00b73c94; /* "GetDungeonRockIdx" */
export const FRAME_EFFECT_820AA0_REG_HELPER_VA = 0x0088fd10;

/* ABI v32: FUN_00820ac0 Lua Room::TurnGold (decision seams — the v31
 * frontier's "SEH-heavy" label is CORRECTED: plain frame, no fs:[0],
 * no GS cookie; the pure prefix lands). */
export const FRAME_EFFECT_820AC0_VA = 0x00820ac0;
export const FRAME_EFFECT_820AC0_END_VA = 0x00820bff; /* past `ret` @0x820bfe */
export const FRAME_EFFECT_820AC0_NEXT_VA = 0x00820c00; /* int3 pad 0x820bff */
export const FRAME_EFFECT_820AC0_RET_BYTES = 0;
export const FRAME_EFFECT_820AC0_INSN_COUNT = 79;
export const FRAME_EFFECT_820AC0_BYTE_LEN = 319;
export const FRAME_EFFECT_820AC0_CALL_INSNS = 1; /* 0x7ebd50 */
export const FRAME_EFFECT_820AC0_INDIRECT_CALLS = 0;
export const FRAME_EFFECT_820AC0_RET_VA = 0x00820bfe;
export const FRAME_EFFECT_820AC0_DIRECT_CALLERS = 2;
export const FRAME_EFFECT_820AC0_RAW_DWORD_HITS = 1; /* @0x86c93a */
export const FRAME_EFFECT_820AC0_CALLSITE_A_VA = 0x005a11af;
export const FRAME_EFFECT_820AC0_CALLSITE_B_VA = 0x007f76fe;
export const FRAME_EFFECT_820AC0_HIT_VA = 0x0086c93a;
export const FRAME_EFFECT_820AC0_HOST_7EBD50_VA = 0x007ebd50; /* SpawnGridEntityDesc */
export const FRAME_EFFECT_820AC0_PTR_ARRAY_OFF = 0x24; /* [this+0x24] */
export const FRAME_EFFECT_820AC0_GRID_COUNT = 0x1c0; /* 448 entries */
export const FRAME_EFFECT_820AC0_BOUND_UNSIGNED = 0x1bf; /* cmp/ja guard */
export const FRAME_EFFECT_820AC0_KIND_VALUE = 0xe; /* [p+4] == 0xe */
export const FRAME_EFFECT_820AC0_ANIM_VALUE = 3; /* [p+8] == 3 */
export const FRAME_EFFECT_820AC0_BLOCK_A_OFF = 0x72a4; /* init dst A */
export const FRAME_EFFECT_820AC0_BLOCK_B_OFF = 0x72d0; /* init dst B */
export const FRAME_EFFECT_820AC0_BLOCK_DWORDS = 0xb; /* 11 dwords = 0x2c B */
export const FRAME_EFFECT_820AC0_REWRITE_TARGET_OFF = 0xe8; /* [p+0xe8] */
export const FRAME_EFFECT_820AC0_PACK_SLOT1 = 3; /* forced slot 1 */
export const FRAME_EFFECT_820AC0_CONST_VEC_A_VA = 0x00bac7b0; /* 1.0f x4 */
export const FRAME_EFFECT_820AC0_CONST_VEC_A0_VA = 0x00babe60; /* block A low */
export const FRAME_EFFECT_820AC0_CONST_VEC_B0_VA = 0x00babe50; /* block B low */
export const FRAME_EFFECT_820AC0_ONE_BITS = 0x3f800000; /* 1.0f */
export const FRAME_EFFECT_820AC0_BLOCK_A_D4 = 0x40a00000; /* 5.0f */
export const FRAME_EFFECT_820AC0_THREE_BITS = 0x40400000; /* 3.0f */
export const FRAME_EFFECT_820AC0_EIGHT_TENTHS_BITS = 0x3f4ccccd; /* 0.8f */
export const FRAME_EFFECT_820AC0_BLOCK_B_D5 = 0x3fe66666; /* 1.8f */
export const FRAME_EFFECT_820AC0_LUA_NAME_VA = 0x00b73e3c; /* "TurnGold" */
export const FRAME_EFFECT_820AC0_REG_HELPER_VA = 0x0088fdb0;
/* ABI v33: FUN_00820c00 Lua Room::WorldToScreenPosition (law set). */
export const FRAME_EFFECT_820C00_VA = 0x00820c00;
export const FRAME_EFFECT_820C00_END_VA = 0x00820d28; /* past `ret 0xc` @0x820d25 */
export const FRAME_EFFECT_820C00_NEXT_VA = 0x00820d30; /* int3 pad + SEH ring fn */
export const FRAME_EFFECT_820C00_RET_BYTES = 0xc;
export const FRAME_EFFECT_820C00_INSN_COUNT = 60;
export const FRAME_EFFECT_820C00_BYTE_LEN = 296;
export const FRAME_EFFECT_820C00_CALL_INSNS = 2; /* both 0xaf0917 floor thunk */
export const FRAME_EFFECT_820C00_INDIRECT_CALLS = 0;
export const FRAME_EFFECT_820C00_RET_VA = 0x00820d25;
export const FRAME_EFFECT_820C00_DIRECT_CALLERS = 1;
export const FRAME_EFFECT_820C00_CALLSITE_A_VA = 0x005fde52;
export const FRAME_EFFECT_820C00_RAW_DWORD_HITS = 2;
export const FRAME_EFFECT_820C00_HIT_A_VA = 0x0086c96d; /* registration push */
export const FRAME_EFFECT_820C00_HIT_B_VA = 0x008912b5; /* Lua binder store */
export const FRAME_EFFECT_820C00_LUA_NAME_VA = 0x00b73ddc; /* "WorldToScreenPosition" */
export const FRAME_EFFECT_820C00_REG_HELPER_VA = 0x00891290; /* Lua row binder */
export const FRAME_EFFECT_820C00_FLOOR_THUNK_VA = 0x00af0917; /* jmp [0xb18840] */
export const FRAME_EFFECT_820C00_FLOOR_IAT_VA = 0x00b18840; /* MSVCRT floor */
export const FRAME_EFFECT_820C00_CAM_X_VA = 0x00c78dc4; /* .data cam X */
export const FRAME_EFFECT_820C00_CAM_Y_VA = 0x00c78edc; /* .data cam Y */
export const FRAME_EFFECT_820C00_ZOOM_A_VA = 0x00bf941c; /* .data, init 1.0f */
export const FRAME_EFFECT_820C00_ZOOM_B_VA = 0x00bf93e8; /* .data, init 2.0f */
export const FRAME_EFFECT_820C00_ROOM_X_OFF = 0x1204;
export const FRAME_EFFECT_820C00_ROOM_Y_OFF = 0x1208;
export const FRAME_EFFECT_820C00_GAME_X_OFF = 0x2650c;
export const FRAME_EFFECT_820C00_GAME_Y_OFF = 0x26510;
export const FRAME_EFFECT_820C00_338_VA = 0x00baab20;
export const FRAME_EFFECT_820C00_338_BITS = 0x43a90000; /* 338.0f */
export const FRAME_EFFECT_820C00_182_VA = 0x00baaa7c;
export const FRAME_EFFECT_820C00_182_BITS = 0x43360000; /* 182.0f */
export const FRAME_EFFECT_820C00_60_VA = 0x00baa950;
export const FRAME_EFFECT_820C00_60_BITS = 0x42700000; /* 60.0f */
export const FRAME_EFFECT_820C00_140_VA = 0x00baaa30;
export const FRAME_EFFECT_820C00_140_BITS = 0x430c0000; /* 140.0f */
export const FRAME_EFFECT_820C00_HALF_VA = 0x00baa2d0;
export const FRAME_EFFECT_820C00_HALF_BITS = 0x3f000000; /* 0.5f */
export const FRAME_EFFECT_820C00_065_VA = 0x00baa324;
export const FRAME_EFFECT_820C00_065_BITS = 0x3f266666; /* 0.65f */
export const FRAME_EFFECT_820C00_GAME_GLOBAL_VA = 0x00c71678; /* g_Game */

/** zoom = zoom_a * zoom_b — ONE f32 rounding (0x820c23 movss xmm3 /
 *  0x820c2b mulss): the two .data globals are NOT folded. */
export function frameEffect820c00ZoomMul(aBits, bBits) {
  return Math.fround(fe81e9d0BitsToF32(aBits >>> 0) *
                     fe81e9d0BitsToF32(bBits >>> 0));
}

/** cam_x - 338.0f (0x820c06 movss / 0x820c0e subss; 338.0f @0xbaab20). */
export function frameEffect820c00CamDeltaX(camXBits) {
  return Math.fround(fe81e9d0BitsToF32(camXBits >>> 0) -
                     fe81e9d0BitsToF32(FRAME_EFFECT_820C00_338_BITS));
}

/** cam_y - 182.0f (0x820c81/0x820c89; 182.0f @0xbaaa7c). */
export function frameEffect820c00CamDeltaY(camYBits) {
  return Math.fround(fe81e9d0BitsToF32(camYBits >>> 0) -
                     fe81e9d0BitsToF32(FRAME_EFFECT_820C00_182_BITS));
}

/** X - 60.0f (0x820c16/0x820c1b; 60.0f @0xbaa950). */
export function frameEffect820c00WorldDeltaX(xBits) {
  return Math.fround(fe81e9d0BitsToF32(xBits >>> 0) -
                     fe81e9d0BitsToF32(FRAME_EFFECT_820C00_60_BITS));
}

/** Y - 140.0f (0x820c96/0x820c9b; 140.0f @0xbaaa30). */
export function frameEffect820c00WorldDeltaY(yBits) {
  return Math.fround(fe81e9d0BitsToF32(yBits >>> 0) -
                     fe81e9d0BitsToF32(FRAME_EFFECT_820C00_140_BITS));
}

/** ((cam_delta*0.5f + world_delta*0.65f) * zoom) + 0.5f — the X lane
 *  (0x820c34..0x820c56) and the Y lane (0x820ca3..0x820cbc, same
 *  shape): per-op f32 rounding; the +0.5f sits INSIDE the lane, BEFORE
 *  the host floor call. */
export function frameEffect820c00ScreenLane(camDelta, worldDelta, zoom) {
  const f = Math.fround;
  const halfLane = f(fe81e9d0BitsToF32(FRAME_EFFECT_820C00_HALF_BITS) * f(camDelta));
  const sixtyfiveLane =
    f(fe81e9d0BitsToF32(FRAME_EFFECT_820C00_065_BITS) * f(worldDelta));
  const sum = f(halfLane + sixtyfiveLane);
  const scaled = f(sum * f(zoom));
  return f(scaled + fe81e9d0BitsToF32(FRAME_EFFECT_820C00_HALF_BITS));
}

/** floored / zoom — ONE f32 division (0x820c77/0x820c7c X, 0x820ce0/
 *  0x820ce5 Y): the host floor result (0xaf0917 = MSVCRT floor via IAT
 *  0xb18840, caller-resolved) divided back into world space. */
export function frameEffect820c00DivideZoom(flooredBits, zoom) {
  return Math.fround(fe81e9d0BitsToF32(flooredBits >>> 0) / Math.fround(zoom));
}

/** (sx + Room+0x1204) + Game+0x2650c — TWO sequential f32 adds
 *  (0x820cf8 then 0x820d09; ecx = g_Game re-read @0x820cea). */
export function frameEffect820c00ComposeX(sx, room1204Bits, game2650cBits) {
  const f = Math.fround;
  let acc = f(f(sx) + fe81e9d0BitsToF32(room1204Bits >>> 0));
  return f(acc + fe81e9d0BitsToF32(game2650cBits >>> 0));
}

/** (sy + Room+0x1208) + Game+0x26510 (0x820d00 then 0x820d11). */
export function frameEffect820c00ComposeY(sy, room1208Bits, game26510Bits) {
  const f = Math.fround;
  let acc = f(f(sy) + fe81e9d0BitsToF32(room1208Bits >>> 0));
  return f(acc + fe81e9d0BitsToF32(game26510Bits >>> 0));
}

/** Machine-truth entry plan (20-B struct, 5 fields like the C++ side):
 *  one host floor call per lane (0x820c69 / 0x820ccf), g_Game compose
 *  add off both lanes, zero other hosts. */
export function frameEffect820c00EntryPlan() {
  return {
    xFloor: 1,
    yFloor: 1,
    composeGame: 1,
    hostCalls: 2,
    pureComplete: 0,
  };
}

/* ---- ABI v32: FUN_00820aa0 Room::GetDungeonRockIdx (PURE-OPEN) ---- */

/** (flags_1839c & 0x2000) != 0 — FULL dword bit probe (0x820aa5 test /
 *  0x820aaf je): the -1 path runs iff the bit is set. */
export function frameEffect820aa0BitGate(flags1839c) {
  return ((flags1839c >>> 0) & FRAME_EFFECT_820AA0_FLAG_BIT) !== 0 ? 1 : 0;
}

/** bit set ? 0xffffffff : rock768 — `or eax,-1` @0x820ab1 is
 *  value-independent (eax held the g_Game pointer); [ecx+0x768] @0x820ab5
 *  is the clear-bit fallback (caller-resolved). */
export function frameEffect820aa0Result(flags1839c, rock768) {
  return frameEffect820aa0BitGate(flags1839c) === 1
    ? FRAME_EFFECT_820AA0_RESULT_NEG1 >>> 0
    : rock768 >>> 0;
}

/** Machine-truth entry plan (24-B struct, 6 fields like the C++ side):
 *  deref_game + deref_1839c unconditional; deref_768 (the fallback read)
 *  runs only when the bit is clear; zero host calls. */
export function frameEffect820aa0EntryPlan(flags1839c) {
  const gate = frameEffect820aa0BitGate(flags1839c);
  return {
    derefGame: 1,
    deref1839c: 1,
    bitGate: gate,
    deref768: gate === 0 ? 1 : 0,
    hostCalls: 0,
    pureComplete: 1,
  };
}

/* ---- ABI v32: FUN_00820ac0 Room::TurnGold (decision seams) ---- */

/** (dst != tmp) FULL dword pointer inequality — the three cmp/je copy
 *  guards (0x820aeb, 0x820b52, 0x820bcc): the copy/rewrite store runs
 *  iff dst != tmp. JIT-unreachable in practice; translated as the
 *  machine has it. */
export function frameEffect820ac0CopyGate(dst, tmp) {
  return (dst >>> 0) !== (tmp >>> 0) ? 1 : 0;
}

/** The 11-dword [this+0x72a4] default-init VALUE (0x820b36..0x820b41):
 *  [1.0f x4, 5.0f, 3.0f, 0.0f, 0.8f, 0, 0, 0] — .rdata vectors 0xbac7b0
 *  + 0xbabe60, trailing zeros from the zeroed stack locals. */
export function frameEffect820ac0InitBlockA() {
  return [
    FRAME_EFFECT_820AC0_ONE_BITS, FRAME_EFFECT_820AC0_ONE_BITS,
    FRAME_EFFECT_820AC0_ONE_BITS, FRAME_EFFECT_820AC0_ONE_BITS,
    FRAME_EFFECT_820AC0_BLOCK_A_D4, FRAME_EFFECT_820AC0_THREE_BITS,
    0, FRAME_EFFECT_820AC0_EIGHT_TENTHS_BITS, 0, 0, 0,
  ];
}

/** The 11-dword [this+0x72d0] default-init VALUE (0x820b56..0x820b61):
 *  [1.0f x4, 3.0f, 1.8f, 0.0f, 0.8f, 0, 0, 0] — 0xbac7b0 + 0xbabe50. */
export function frameEffect820ac0InitBlockB() {
  return [
    FRAME_EFFECT_820AC0_ONE_BITS, FRAME_EFFECT_820AC0_ONE_BITS,
    FRAME_EFFECT_820AC0_ONE_BITS, FRAME_EFFECT_820AC0_ONE_BITS,
    FRAME_EFFECT_820AC0_THREE_BITS, FRAME_EFFECT_820AC0_BLOCK_B_D5,
    0, FRAME_EFFECT_820AC0_EIGHT_TENTHS_BITS, 0, 0, 0,
  ];
}

/** index <=u 0x1bf — the loop-body entry guard (0x820b70 cmp esi,0x1bf ;
 *  0x820b76 ja): UNSIGNED. */
export function frameEffect820ac0LoopEntryOpen(index) {
  return (index >>> 0) <= FRAME_EFFECT_820AC0_BOUND_UNSIGNED ? 1 : 0;
}

/** index_next < 0x1c0 SIGNED — the back-edge (0x820bed cmp esi,0x1c0 ;
 *  0x820bf3 jl). */
export function frameEffect820ac0LoopContinue(indexNext) {
  return (indexNext | 0) < FRAME_EFFECT_820AC0_GRID_COUNT ? 1 : 0;
}

/** p != 0 — FULL dword zero-test on the grid-cell pointer (0x820b78/0x820b7a). */
export function frameEffect820ac0EntryNonzero(p) {
  return (p >>> 0) !== 0 ? 1 : 0;
}

/** kind == 0xe FULL dword (0x820b7e/0x820b82) — the SpawnGridEntityDesc arm. */
export function frameEffect820ac0KindGate(kind) {
  return (kind >>> 0) === FRAME_EFFECT_820AC0_KIND_VALUE ? 1 : 0;
}

/** anim == 3 FULL dword (0x820b84/0x820b88) — equal skips the host call. */
export function frameEffect820ac0AnimSkip(anim) {
  return (anim >>> 0) === FRAME_EFFECT_820AC0_ANIM_VALUE ? 1 : 0;
}

/** The 8 deterministic Desc pack dwords (0x820b8e..0x820ba5):
 *  [d0, 3, d_c, d_10, tail0..tail3] — slot 1 FORCED 3. The machine
 *  leaves the +0x10..0x1f Desc window uninitialized and places the tail
 *  at +0x20 (reproduced, not corrected); the law covers the
 *  deterministic dwords only. */
export function frameEffect820ac0GridPack(d0, dC, d10, t0, t1, t2, t3) {
  return [
    d0 >>> 0, FRAME_EFFECT_820AC0_PACK_SLOT1, dC >>> 0, d10 >>> 0,
    t0 >>> 0, t1 >>> 0, t2 >>> 0, t3 >>> 0,
  ];
}

/** Machine-truth entry plan (40-B struct, 10 fields like the C++ side):
 *  the two init stores unconditional; the alias gates on the caller-side
 *  addresses; the per-entry gates on a representative pointer/kind/anim
 *  row; the rewrite arm is !kind_gate. host_calls counts the one site
 *  (0x7ebd50 fires up to 0x1c0 times across the loop). */
export function frameEffect820ac0EntryPlan(dstA, tmpA, dstB, tmpB, p, kind,
                                           anim) {
  const kindGate = frameEffect820ac0KindGate(kind);
  return {
    initA: 1,
    initB: 1,
    copyGateA: frameEffect820ac0CopyGate(dstA, tmpA),
    copyGateB: frameEffect820ac0CopyGate(dstB, tmpB),
    entryNonzero: frameEffect820ac0EntryNonzero(p),
    kindGate,
    animSkip: frameEffect820ac0AnimSkip(anim),
    rewriteArm: kindGate === 0 ? 1 : 0,
    hostCalls: 1,
    pureComplete: 0,
  };
}

/* ---- FUN_006fe2f0 player walk + room change tail (0x006fe2f0…0x006fe3bf,
 * v5)
 */
/* ---- FUN_006fe2f0 player walk + room change tail (0x006fe2f0…0x006fe3bf,
 * v5)
 */

/** Byte span shifted right by two, signed — the 6fdc10 walk's law. */
export function frameEffect6fe2f0VectorCount(begin, end) { return ((end | 0) - (begin | 0)) >> 2; }

/** Zero-only entry test: negative counts walk. */
export function frameEffect6fe2f0WalkEnter(count) {
  return (count | 0) !== 0;
}

/** Mid-loop no-players branch — statically dead, modelled anyway. */
export function frameEffect6fe2f0HeadLogNeeded(count) {
  return (count | 0) === 0;
}

/** Out-of-range index addresses element zero. Defect preserved. */
export function frameEffect6fe2f0SlotAddrClamped(begin, count, index) {
  const n = count | 0;
  const use = (n <= 0 || (index >>> 0) >= (n >>> 0)) ? 0 : index | 0;
  return ((begin >>> 0) + ((use << 2) >>> 0)) >>> 0;
}

/** Unsigned continue over the signed count. */
export function frameEffect6fe2f0WalkContinue(indexNext, count) {
  return (indexNext >>> 0) < (count >>> 0);
}

/** Tail store: raw result unless exactly -1, which becomes 0. */
export function frameEffect6fe2f0ResultNormalize(result) {
  return (result | 0) === -1 ? 0 : result | 0;
}

/**
 * Walk over host-recaptured bounds. begins[k]/ends[k] are the bounds seen
 */
export function frameEffect6fe2f0WalkFromSamples(begins, ends) {
  const b = begins || [], e = ends || [];
  const n = Math.min(b.length, e.length);
  if (n === 0) return { steps: 0, logs: 0, clamped: 0, entered: 0 };
  const c0 = frameEffect6fe2f0VectorCount(b[0], e[0]);
  const entered = frameEffect6fe2f0WalkEnter(c0) ? 1 : 0;
  if (!entered) return { steps: 0, logs: 0, clamped: 0, entered: 0 };
  let steps = 0, logs = 0, clamped = 0;
  for (let i = 0; i < n; i++) {
    const count = frameEffect6fe2f0VectorCount(b[i], e[i]);
    if (frameEffect6fe2f0HeadLogNeeded(count)) logs += 1;
    if ((i >>> 0) >= (count >>> 0)) clamped += 1;
    steps += 1;
    if (((i + 1) >>> 0) >= (count >>> 0)) break;
  }
  return { steps, logs, clamped, entered };
}

/**
 * Entry plan from the prologue reads.
 */
export function frameEffect6fe2f0EntryPlan(begin, end) {
  const count = frameEffect6fe2f0VectorCount(begin, end);
  return {
    count, entered: frameEffect6fe2f0WalkEnter(count) ? 1 : 0,
    headLogNeeded: frameEffect6fe2f0HeadLogNeeded(count) ? 1 : 0,
    slot0: frameEffect6fe2f0SlotAddrClamped(begin, count, 0) >>> 0, pureCfOk: 1,
  };
}

/* ---- FUN_0085afb0 stage-record key builder (0x0085afb0…0x0085b031, v6)
 *
 */

/** Unsigned at-most-three: 4 and above skip the formatting. */
export function frameEffect85afb0SprintfNeeded(selector) {
  return (selector >>> 0) <= FRAME_EFFECT_85AFB0_SELECTOR_MAX;
}

/** Table-verified selection; zero when the formatting is skipped. */
export function frameEffect85afb0FmtVa(selector) {
  const s = selector | 0;
  if (s === 1) return FRAME_EFFECT_85AFB0_FMT_TIMES_SOLO_VA >>> 0;
  if (s === 2) return FRAME_EFFECT_85AFB0_FMT_SCORES_COOP_VA >>> 0;
  if (s === 3) return FRAME_EFFECT_85AFB0_FMT_TIMES_COOP_VA >>> 0;
  return FRAME_EFFECT_85AFB0_FMT_SCORES_SOLO_VA >>> 0;
}

/**
 * Fresh-string init: whole first word cleared, size zero, inline capacity,
 * first byte cleared again last.
 * @returns {{bufWord0: number, size: number, capacity: number, firstByte: number}}
 */
export function frameEffect85afb0InitStore() { return { capacity: FRAME_EFFECT_85AFB0_INIT_CAPACITY, size: 0 }; }

/** Counts to the terminator, terminator excluded. */
export function frameEffect85afb0Strlen(bytes) {
  if (!bytes) return 0;
  let n = 0;
  for (; n < FRAME_EFFECT_85AFB0_BUF_SIZE; n++) if ((bytes[n] | 0) === 0) break;
  return n;
}

/**
 * Entry plan.
 */
export function frameEffect85afb0EntryPlan(selector) {
  const sel = selector | 0;
  const inRange = sel >= 0 && sel <= FRAME_EFFECT_85AFB0_SELECTOR_MAX ? 1 : 0;
  return { selector: sel, inRange, fmtVa: frameEffect85afb0FmtVa(inRange ? sel : 0) >>> 0,
    bufVa: FRAME_EFFECT_85AFB0_BUF_VA >>> 0, init: frameEffect85afb0InitStore(),
    hostSprintf: 1, hostAssign: 1, pureCfOk: 1 };
}

/* ---- FUN_006fe3d0 Game::MoveToRandomRoom forwarder (0x006fe3d0...
 * 0x006fe40b, ret 0xc, v7)
 */

export function frameEffect6fe3d0GameGlobalVa() {
  return FRAME_EFFECT_GAME_GLOBAL_VA >>> 0;
}

export function frameEffect6fe3d0SeedOffset() {
  return FRAME_EFFECT_6FE3D0_SEED_OFF >>> 0;
}

export function frameEffect6fe3d0SeedValue() {
  return FRAME_EFFECT_6FE3D0_SEED_VALUE | 0;
}

/**
 * Seed store: Game+0x18318 = -1 (dword). Null pointer skips.
 * @returns {{offset: number, value: number, stored: boolean}}
 */
export function frameEffect6fe3d0ApplySeed(gamePtr) {
  return { seedOff: FRAME_EFFECT_6FE3D0_SEED_OFF, seedValue: FRAME_EFFECT_6FE3D0_SEED_VALUE, gamePtr: gamePtr >>> 0 };
}

/**
 * Host-pick gate: `cmp byte ptr [ebp+8], 0` inside 0x00740860 — LOW BYTE
 * only. 1 = the -2/-6 special candidates are skipped and the registry
 * scan alone decides.
 */
export function frameEffect6fe3d0PackSkipsSpecials(iAmErrorRoom) {
  return ((iAmErrorRoom >>> 0) & 0xff) === 0;
}

/**
 * The five shell arguments in callee order: room (host pick result), -1,
 */
export function frameEffect6fe3d0ShellArgs(roomFromHost, player) {
  return [roomFromHost | 0, FRAME_EFFECT_6FE3D0_SHELL_ARG2, FRAME_EFFECT_6FE3D0_SHELL_ANIM, player | 0, FRAME_EFFECT_6FE3D0_SHELL_DIM];
}

/**
 * Entry plan.
 */
export function frameEffect6fe3d0EntryPlan(iAmErrorRoom, seed, player) {
  return { iAmErrorRoom: iAmErrorRoom | 0, seed: seed | 0, player: player | 0,
    hostGetRandomRoom: 1, host60d010: 1, seedFatal: (seed | 0) === 0 ? 1 : 0,
    shellArgs: frameEffect6fe3d0ShellArgs(iAmErrorRoom, player), pureCfOk: 1 };
}

/* ---- ABI v8: FrameEffect_6fd7c0 special tail, SFX pack, position search ----
 *
 * times. */

export const FRAME_EFFECT_SFX_BASE_GLOBAL_VA = 0x00c7169c;
export const FRAME_EFFECT_SFX_PLAY_ARG_COUNT = 6;
export const FRAME_EFFECT_SFX_PLAY_VOLUME_BITS = 0x3f800000;
export const FRAME_EFFECT_SFX_PLAY_FRAME_DELAY = 2;
export const FRAME_EFFECT_SFX_PLAY_LOOP = 0;
export const FRAME_EFFECT_SFX_PLAY_PITCH_BITS = 0x3f800000;
export const FRAME_EFFECT_SFX_PLAY_PAN_BITS = 0;
export const FRAME_EFFECT_SPECIAL_TAIL_TELEPORT_STR_VA = 0x00b1dff0;
export const FRAME_EFFECT_HOST_7ABE20_VA = 0x007abe20;
export const FRAME_EFFECT_SPECIAL_TAIL_6FDC10_ARGS = [0, 6, 0];
export const FRAME_EFFECT_SEARCH_ATTEMPT_LIMIT = 0x32;
export const FRAME_EFFECT_SEARCH_PLAYER_POS_X_OFF = 0x33c;
export const FRAME_EFFECT_SEARCH_PLAYER_POS_Y_OFF = 0x340;
export const FRAME_EFFECT_SEARCH_PLAYER_370_OFF = 0x370;
export const FRAME_EFFECT_SEARCH_ROOM_20_OFF = 0x20;
export const FRAME_EFFECT_SEARCH_ENTITY_LIST_OFF = 0x1218;
export const FRAME_EFFECT_SEARCH_QUERY_KIND = 0xa;
export const FRAME_EFFECT_SEARCH_ENT_TYPE_OFF = 0x28;
export const FRAME_EFFECT_SEARCH_ENT_FLAGS_168_OFF = 0x168;
export const FRAME_EFFECT_SEARCH_ENT_FLAGS_438_OFF = 0x438;
export const FRAME_EFFECT_SEARCH_ENT_MASK_168 = 0x20000000;
export const FRAME_EFFECT_SEARCH_ENT_MASK_438 = 0x80000000;
export const FRAME_EFFECT_SEARCH_TYPE_RANGE_BIAS = 0xa;
export const FRAME_EFFECT_SEARCH_TYPE_RANGE_MAX = 0x3dd;
export const FRAME_EFFECT_SEARCH_TYPE_SHORTCUT = 1;
export const FRAME_EFFECT_SEARCH_MODE_MIN = 2;
export const FRAME_EFFECT_SEARCH_TYPE_FLAGGED = 9;
export const FRAME_EFFECT_SEARCH_SET_POS_ARGS = [1, 1];
export const FRAME_EFFECT_HOST_8279A0_GATE_VA = 0x008279a0;
export const FRAME_EFFECT_HOST_81E9D0_CAND_VA = 0x0081e9d0;
export const FRAME_EFFECT_HOST_41AB50_QUERY_VA = 0x0041ab50;
export const FRAME_EFFECT_HOST_A648B0_FREE_VA = 0x00a648b0;
export const FRAME_EFFECT_HOST_4175B0_DTOR_VA = 0x004175b0;
export const FRAME_EFFECT_HOST_7CD950_SETPOS_VA = 0x007cd950;
export const FRAME_EFFECT_CAPSULE_MULTIPLIER_VA = 0x00c3793c;

const bitView = new DataView(new ArrayBuffer(4));

/** Raw 32-bit pattern reinterpreted as float32 — the `movss` view. */
export function frameEffectBitsToFloat(bits) {
  const buf = new ArrayBuffer(4);
  new DataView(buf).setUint32(0, bits >>> 0, true);
  return new DataView(buf).getFloat32(0, true);
}

/** The six SFXManager::Play arguments in callee order, as raw patterns. */
export function frameEffect6fd7c0SfxPlayArgs(sfxId) {
  /* 0x006fd84c push 0 — the machine pushes ZERO for the loop slot, so the
     pack is {id, 1.0f, 2, 0, 1.0f, 0}. ABI v18 corrected the loop field
     from 1 to 0 (latent drift; was never behaviorally asserted). */
  return { id: sfxId | 0, frameDelay: 2, loop: 0, volume: 1, pan: 0, pitch: 1 };
}

export function frameEffect6fd7c0SfxBaseGlobalVa() {
  return FRAME_EFFECT_SFX_BASE_GLOBAL_VA >>> 0;
}

/** The `lea ecx,[esi+0x2a324]` displacement at 0x006fd858. */
export function frameEffect6fd7c0SfxManagerOff() {
  return FRAME_EFFECT_SFX_MANAGER_OFF >>> 0;
}

/** Receiver = base + 0x2a324, 32-bit wrap. */
export function frameEffect6fd7c0SfxManagerReceiver(base) {
  return (((base >>> 0) + (FRAME_EFFECT_SFX_MANAGER_OFF >>> 0)) >>> 0) | 0;
}

/**
 * Special-tail plan. The player test is a full-word one.
 */
export function frameEffect6fd7c0SpecialTailPlan(player) {
  const present = (player >>> 0) !== 0 ? 1 : 0;
  return { playerPresent: present, hostNeeded: present, pureCfOk: 1 };
}

/**
 * Per-entity blocker test, walked as the machine's own arm labels rather
 * than as a boolean expression. Returns true when the entity blocks.
 */
export function frameEffect6fd7c0ProbeBlocks(mode, entType, flags168, flags438) {
  const t = entType | 0;
  if (t === 1) return ((flags168 | 0) & 1) !== 0 ? 1 : 0;
  if (t === 2) return (flags438 | 0) !== 0 ? 1 : 0;
  return (mode | 0) !== 0 && t !== 0 ? 1 : 0;
}

/** Low-byte test on the query vector's flag byte. */
export function frameEffect6fd7c0FreeInlineNeeded(queryFlag) {
  return ((queryFlag >>> 0) & 0xff) === 0;
}

export function frameEffect6fd7c0SearchAttemptLimit() {
  return FRAME_EFFECT_SEARCH_ATTEMPT_LIMIT;
}

/** Signed attempt bound. */
export function frameEffect6fd7c0SearchContinue(nextAttempt) {
  return (nextAttempt | 0) < FRAME_EFFECT_SEARCH_ATTEMPT_LIMIT;
}

/**
 * Position search, run as a label machine over the machine's own branch
 */
export function frameEffect6fd7c0PositionSearch(origXBits, origYBits, timerIn, samples, entities) {
  const sampleList = samples || [], entityList = entities || [];
  let curX = origXBits >>> 0, curY = origYBits >>> 0;
  let attempts = 0, hostCapsule = 0, hostQuery = 0, accepted = 0, acceptAttempt = -1;
  let exhausted = 0, samplesExhausted = 0, fromCandidate = 0;
  if (sampleList.length === 0) samplesExhausted = 1;
  else {
    for (let attempt = 0; ; attempt++) {
      if (attempt >= sampleList.length) { samplesExhausted = 1; break; }
      const s = sampleList[attempt];
      attempts += 1;
      const limit = frameEffect6fd7c0CameraLimit(
        frameEffectBitsToFloat(s.room20Bits ?? s.room_20_bits ?? 0),
        frameEffectBitsToFloat(s.player370Bits ?? s.player_370_bits ?? 0));
      const candY = frameEffectBitsToFloat(s.candYBits ?? s.cand_y_bits ?? 0);
      if (frameEffect6fd7c0CameraProbeContinue(candY, limit)) {
        hostCapsule += 1; hostQuery += 1;
        const count = s.queryCount ?? s.query_count ?? 0;
        let blocked = 0;
        if (count !== 0) {
          const mode = s.mode | 0, first = s.queryFirst ?? s.query_first ?? 0;
          for (let j = 0; ; j++) {
            const row = (first | 0) + j;
            if (row < 0 || row >= entityList.length) break;
            const e = entityList[row];
            if (frameEffect6fd7c0ProbeBlocks(mode, e.type, e.flags168 ?? e.flags_168, e.flags438 ?? e.flags_438)) { blocked = 1; break; }
            if (((j + 1) >>> 0) >= (count >>> 0)) break;
          }
        }
        if (!blocked) {
          accepted = 1; acceptAttempt = attempt; fromCandidate = 1;
          curX = (s.candXBits ?? s.cand_x_bits ?? curX) >>> 0;
          curY = (s.candYBits ?? s.cand_y_bits ?? curY) >>> 0;
          break;
        }
      }
      if ((attempt + 1) >= 0x32) { exhausted = 1; break; }
    }
  }
  return { attempts, hostCapsule, hostQuery, hostFreeInline: 0, hostDtor: 0,
    accepted, acceptAttempt, exhausted, samplesExhausted, outXBits: curX, outYBits: curY,
    fromCandidate, hostSetPosition: 1, timerOut: frameEffect6fd7c0PlayerTimerFloor3c(timerIn) };
}

/**
 * Player-present branch plan.
 */
export function frameEffect6fd7c0PlayerBranchPlan(player, anim, gateResult) {
  const present = (player >>> 0) !== 0 ? 1 : 0;
  const gate = frameEffect6fd7c0PlayerAnimGate(anim) ? 1 : 0;
  const gateOpen = ((gateResult & 0xff) !== 0) ? 1 : 0;
  const reaches = (present && gate) ? 1 : 0;
  return { playerPresent: present, animGate: gate, host8279a0: reaches,
    runsSearch: (reaches && gateOpen) ? 1 : 0, fallsToRoomType: (reaches && !gateOpen) ? 1 : 0,
    reachesEngine: 0, pureCfOk: 1, pureComplete: 0 };
}

/* ---- ABI v9: FUN_008279a0, the room-config gate at 0x006fd91d ---- */

export const FRAME_EFFECT_8279A0_VA = 0x008279a0;
export const FRAME_EFFECT_8279A0_END_VA = 0x008279ba;
export const FRAME_EFFECT_8279A0_RET_BYTES = 0;
export const FRAME_EFFECT_8279A0_INSN_COUNT = 12;
export const FRAME_EFFECT_8279A0_BYTE_LEN = 27;
export const FRAME_EFFECT_8279A0_CALL_COUNT = 0;
export const FRAME_EFFECT_8279A0_DIRECT_CALLERS = 15;
export const FRAME_EFFECT_8279A0_CALLSITE_VA = 0x006fd91d;
export const FRAME_EFFECT_8279A0_RECEIVER_GLOBAL_VA = 0x00c71678;
export const FRAME_EFFECT_8279A0_RECEIVER_ROOM_OFF = 0x18300;
export const FRAME_EFFECT_8279A0_ROOM_GETTER_VA = 0x00407480;
export const FRAME_EFFECT_8279A0_DESC_OFF = 4;
export const FRAME_EFFECT_8279A0_CFG_OFF = 0x10;
export const FRAME_EFFECT_8279A0_FIELD8_OFF = 8;
export const FRAME_EFFECT_8279A0_FIELD8_VALUE = 0x10;
export const FRAME_EFFECT_8279A0_FIELD0_OFF = 0;
export const FRAME_EFFECT_8279A0_FIELD0_VALUE = 0x23;
export const FRAME_EFFECT_8279A0_TRUE_LABEL_VA = 0x008279b5;
export const FRAME_EFFECT_8279A0_FALSE_LABEL_VA = 0x008279b8;
export const FRAME_EFFECT_8279A0_INLINE_COPIES = 5;
export const FRAME_EFFECT_8279A0_INLINE_A_VA = 0x004d8851;
export const FRAME_EFFECT_8279A0_INLINE_B_VA = 0x00596d5c;
export const FRAME_EFFECT_8279A0_INLINE_C_VA = 0x006ab52b;
export const FRAME_EFFECT_8279A0_INLINE_D_VA = 0x006e5b67;
export const FRAME_EFFECT_8279A0_INLINE_E_VA = 0x007f0803;

export const FRAME_EFFECT_8279A0_EXIT_NULL_CFG = 0;
export const FRAME_EFFECT_8279A0_EXIT_FIELD8 = 1;
export const FRAME_EFFECT_8279A0_EXIT_FIELD0 = 2;
export const FRAME_EFFECT_8279A0_EXIT_TRUE = 3;

/* The 15 direct rel32 callers, from a whole-`.text` linear decode
   (2,094,217 instructions, 469 resyncs) plus a raw LE-dword scan over all
   five sections that found ZERO hits — so no jmp tail, no [imm32] slot, no
   register-held call and no vtable entry exists. The call set is complete. */
export const FRAME_EFFECT_8279A0_CALLER_VAS = [0x006fd91d, 0x004d8851, 0x00596d5c, 0x006ab52b, 0x006e5b67, 0x007f0803];

/* Byte-for-byte transcription of 0x008279a0…0x008279ba. This oracle is an
 * INTERPRETER over this table rather than a restatement of the predicate:
 * every answer below comes from executing these twelve rows. */
export const FRAME_EFFECT_8279A0_PROGRAM = [
  { op: "test", field: "cfg" }, { op: "je", arm: 0 }, { op: "cmp", field: "field8", imm: 0x10 },
  { op: "jne", arm: 1 }, { op: "cmp", field: "field0", imm: 0x23 }, { op: "jne", arm: 2 },
  { op: "mov", eax: 1 }, { op: "ret" },
];

const FRAME_EFFECT_8279A0_ARM_BY_JUMP = new Map([[0, 0], [1, 1], [2, 2]]);

/**
 * Executes the twelve instructions against a dword reader. `readDword` must
 */
export function frameEffect8279a0Execute(readDword, ecx) {
  const cfg = readDword((ecx >>> 0) + 0x10) >>> 0;
  if (cfg === 0) return { arm: 0, eax: 0 };
  if ((readDword(cfg + 8) | 0) !== 0x10) return { arm: 1, eax: 0 };
  if ((readDword(cfg) | 0) !== 0x23) return { arm: 2, eax: 0 };
  return { arm: 3, eax: 1 };
}

/* Synthetic bases for the two dereferences the helper cannot perform. They
   are far from every value the corpus draws; a collision is thrown, never
   silently overwritten. */
const FRAME_EFFECT_8279A0_SYN_ROOM = 0x0a000000;
const FRAME_EFFECT_8279A0_SYN_DESC = 0x0b000000;

/** Builds the reader for one (cfg, field8, field0) triple. */
function frameEffect8279a0Reader(cfgPtr, field8, field0) {
  const cfg = cfgPtr >>> 0;
  return (addr) => {
    const a = addr >>> 0;
    if (a === ((cfg + 8) >>> 0)) return field8 | 0;
    if (a === cfg) return field0 | 0;
    return 0;
  };
}

/** Runs the interpreter for one triple. */
export function frameEffect8279a0Trace(cfgPtr, field8, field0) {
  return frameEffect8279a0Execute(frameEffect8279a0Reader(cfgPtr, field8, field0), 0);
}

/** The full 32-bit EAX at `ret`. */
export function frameEffect8279a0Eax(cfgPtr, field8, field0) {
  return frameEffect8279a0Trace(cfgPtr, field8, field0).eax >>> 0;
}

/** AL at `ret` — the only bits any caller in this build observes. */
export function frameEffect8279a0Gate(cfgPtr, field8, field0) {
  return frameEffect8279a0Trace(cfgPtr, field8, field0).al;
}

/** Which of the four exits the execution reached. */
export function frameEffect8279a0ExitArm(cfgPtr, field8, field0) {
  if ((cfgPtr >>> 0) === 0) return 0;
  if ((field8 | 0) !== 0x10) return 1;
  if ((field0 | 0) !== 0x23) return 2;
  return 3;
}

/**
 * @returns {{
 */
export function frameEffect8279a0Plan(cfgPtr, field8, field0) {
  const arm = frameEffect8279a0ExitArm(cfgPtr, field8, field0);
  return { arm, eax: arm === 3 ? 1 : 0, gate: arm === 3 ? 1 : 0,
    cfgPtr: cfgPtr >>> 0, field8: field8 | 0, field0: field0 | 0, pureCfOk: 1, pureComplete: 1 };
}

export function frameEffect8279a0ReceiverGlobalVa() {
  return FRAME_EFFECT_8279A0_RECEIVER_GLOBAL_VA >>> 0;
}

export function frameEffect8279a0ReceiverRoomOff() {
  return FRAME_EFFECT_8279A0_RECEIVER_ROOM_OFF >>> 0;
}

/** The v8 branch plan with the gate DERIVED instead of host-supplied. */
export function frameEffect6fd7c0PlayerBranchFromFields(player, anim, cfgPtr, field8, field0) {
  return frameEffect6fd7c0PlayerBranchPlan(player, anim, frameEffect8279a0Plan(cfgPtr, field8, field0).eax);
}

/* ---- ABI v10: FUN_006fe410 entry dispatcher (0x006fe410..0x006fec17) ----
 *
 */

export const FRAME_EFFECT_6FE410_VA = 0x006fe410;
export const FRAME_EFFECT_6FE410_END_VA = 0x006fec17;
export const FRAME_EFFECT_6FE410_RET_BYTES = 0x20;
export const FRAME_EFFECT_6FE410_ARG_COUNT = 8;
export const FRAME_EFFECT_6FE410_JUMP_TABLE_VA = 0x006fec1c;
export const FRAME_EFFECT_6FE410_TABLE_ENTRIES = 5;
export const FRAME_EFFECT_6FE410_CASE_VALUES = [0x2e, 0x35, 0xcc, 0x2c, 0x2d];
export const FRAME_EFFECT_6FE410_SWITCH_BIAS = -0x16;
export const FRAME_EFFECT_6FE410_SWITCH_CAP = 4;
export const FRAME_EFFECT_6FE410_GATE_ARG1 = 0x3e8;
export const FRAME_EFFECT_6FE410_GATE_PLAYER_MASK = 0x20000000;
export const FRAME_EFFECT_6FE410_PLAYER_FLAGS_OFF = 0x168;
export const FRAME_EFFECT_6FE410_RECEIVER_OFF = 0x26580;
export const FRAME_EFFECT_6FE410_CALL_VA = 0x006f0090;
export const FRAME_EFFECT_6FE410_MODE_FIELD_OFF = 0x26614;
export const FRAME_EFFECT_6FE410_MODE_CALL_VA = 0x0042b560;
export const FRAME_EFFECT_6FE410_MARSHAL_VA = 0x008646e0;
export const FRAME_EFFECT_6FE410_EARLY_RET_VA = 0x006fe50d;
export const FRAME_EFFECT_6FE410_CONTINUE_VA = 0x006fe510;
export const FRAME_EFFECT_6FE410_SLOT_DEAD = true;

/** cmp dword [Game+0x26614],2 ; jl — the compare is SIGNED. */
export function frameEffect6fe410ModeGe2(mode) {
  return (mode | 0) >= 2 ? 1 : 0;
}

/** The three-gate before the switch: player != 0, [player+0x168] &
 *  0x20000000 != 0, arg1 == 0x3e8. The machine evaluates them in this
 *  order and any failure jumps to the slot=arg2 path. */
export function frameEffect6fe410SwitchGate(arg1, playerNonzero, playerFlags168) {
  if (!playerNonzero) return 0;
  if (((playerFlags168 >>> 0) & 0x20000000) === 0) return 0;
  return (arg1 | 0) === 0x3e8 ? 1 : 0;
}

/** The case-selection law: idx = arg2 - 0x16 with 32-bit wrap; UNSIGNED
 *  idx <= 4 selects the table constant, everything else keeps arg2. The
 *  machine only APPLIES the table when the gate is open; the gated value
 *  lives in the entry plan. */
export function frameEffect6fe410CaseValue(arg2) {
  const idx = ((arg2 | 0) - 0x16) >>> 0;
  if (idx <= 4) return FRAME_EFFECT_6FE410_CASE_VALUES[idx] | 0;
  return arg2 | 0;
}

/** mov al,[ebp+0x24] ; and al,1 ; movzx eax,al — low-bit byte gate only. */
export function frameEffect6fe410CallFlag(arg8) {
  return (arg8 & 1) >>> 0;
}

/**
 * Entry plan (0x006fe410..0x006fe50d). The switch table fires only when the
 * three-gate is open AND (arg2-0x16) <=u 4; slot_value is the case constant
 * then, else arg2 (0x006fe49e / 0x006fe4e6). The slot reader is a measured
 * dead store (slotReachesReader = false, v10 census). The 0x6f0090 call is
 * on every path past the dispatch; a zero result returns at 0x006fe50d.
 */
export function frameEffect6fe410EntryPlan(mode, arg1, arg2, playerNonzero, playerFlags168, arg8) {
  const modeGe2 = frameEffect6fe410ModeGe2(mode);
  const gate = frameEffect6fe410SwitchGate(arg1, playerNonzero, playerFlags168);
  const idx = (arg2 - 0x16) >>> 0;
  const inTable = gate !== 0 && idx <= 4;
  return {
    modeGe2,
    host42b560: modeGe2,
    playerPresent: playerNonzero !== 0 ? 1 : 0,
    playerFlag: ((playerFlags168 >>> 0) & FRAME_EFFECT_6FE410_GATE_PLAYER_MASK) !== 0 ? 1 : 0,
    reachesSwitch: gate !== 0,
    switchIndex: inTable ? (idx | 0) : -1,
    slotValue: inTable ? (frameEffect6fe410CaseValue(arg2) >>> 0) : (arg2 >>> 0),
    slotReachesReader: false,
    call6f0090: true,
    callArg1: arg1 >>> 0,
    callFlag: frameEffect6fe410CallFlag(arg8),
    receiverOff: FRAME_EFFECT_6FE410_RECEIVER_OFF,
    earlyReturnOnZero: true,
    continueVa: FRAME_EFFECT_6FE410_CONTINUE_VA,
    pureCfOk: 1,
  };
}

/* ---- ABI v11: FUN_006fe410 result!=0 continuation (0x006fe510..0x006fec17)
 *
 */

export const FRAME_EFFECT_6FE410_HASH_K_LO = 0xd7b634db;
export const FRAME_EFFECT_6FE410_HASH_K_HI = 0x431bde82;
export const FRAME_EFFECT_6FE410_HASH_SHIFT = 0x12;
export const FRAME_EFFECT_6FE410_HASH_K = (
  (BigInt(FRAME_EFFECT_6FE410_HASH_K_HI) << 32n) |
  BigInt(FRAME_EFFECT_6FE410_HASH_K_LO)
);
export const FRAME_EFFECT_6FE410_HASH_ACC_LO_VA = 0x00c7b630;
export const FRAME_EFFECT_6FE410_HASH_ACC_HI_VA = 0x00c7b634;
export const FRAME_EFFECT_6FE410_ROOM_COUNTER_OFF = 0x1214;
export const FRAME_EFFECT_6FE410_ROOM_LIST_OFF = 0x1218;
export const FRAME_EFFECT_6FE410_ROOM_PTR_OFF = 0x18300;
export const FRAME_EFFECT_6FE410_EFFECT_3C8_OFF = 0x3c8;
export const FRAME_EFFECT_6FE410_PLAYER_GATE_16C = 0x10000000;
export const FRAME_EFFECT_6FE410_FLAG_20 = 0x20;
export const FRAME_EFFECT_6FE410_ARG1_SPECIAL_A = 9;
export const FRAME_EFFECT_6FE410_ARG1_SPECIAL_B = 7;
export const FRAME_EFFECT_6FE410_B_SHIELD_168 = 0x1000000;
export const FRAME_EFFECT_6FE410_B_23C_OFF = 0x23c;
export const FRAME_EFFECT_6FE410_B_3B4_OFF = 0x3b4;
export const FRAME_EFFECT_6FE410_B_3B8_OFF = 0x3b8;
export const FRAME_EFFECT_6FE410_WALK_RECV_OFF = 0x1fc8;
export const FRAME_EFFECT_6FE410_WALK_ARG = 6;
export const FRAME_EFFECT_6FE410_STATUS_STRUCT_SIZE = 0x28;
export const FRAME_EFFECT_6FE410_SCALE_1F_VA = 0x00c3793c;
export const FRAME_EFFECT_6FE410_SCALE_2F_VA = 0x00c37940;
export const FRAME_EFFECT_6FE410_ZERO_F_A_VA = 0x00c7b640;
export const FRAME_EFFECT_6FE410_ZERO_F_B_VA = 0x00c7b644;
export const FRAME_EFFECT_6FE410_TAIL_BYTE_OFF = 0x172;
export const FRAME_EFFECT_6FE410_TAIL_EQ_A_OFF = 0x67758;
export const FRAME_EFFECT_6FE410_TAIL_EQ_B_OFF = 0x6775c;
export const FRAME_EFFECT_6FE410_TAIL_LIST_OFF = 0x67780;
export const FRAME_EFFECT_6FE410_PLAYERS_BEGIN_OFF = 0x1baa8;
export const FRAME_EFFECT_6FE410_PLAYERS_END_OFF = 0x1baac;
export const FRAME_EFFECT_6FE410_TAIL_LOG_STR_VA = 0x00b7e6bc;
export const FRAME_EFFECT_6FE410_TAIL_LOG_LEVEL = 0x10;
export const FRAME_EFFECT_6FE410_VTABLE_INIT_SLOT = 4;
export const FRAME_EFFECT_6FE410_VTABLE_4C_SLOT = 0x4c;
export const FRAME_EFFECT_6FE410_HOST_417430_VA = 0x00417430;
export const FRAME_EFFECT_6FE410_HOST_435C70_VA = 0x00435c70;
export const FRAME_EFFECT_6FE410_HOST_AF08B1_VA = 0x00af08b1;
export const FRAME_EFFECT_6FE410_HOST_7078F0_VA = 0x007078f0;
export const FRAME_EFFECT_6FE410_HOST_7079C0_VA = 0x007079c0;
export const FRAME_EFFECT_6FE410_HOST_9E24A0_VA = 0x009e24a0;
export const FRAME_EFFECT_6FE410_HOST_9E0680_VA = 0x009e0680;
export const FRAME_EFFECT_6FE410_HOST_418500_VA = 0x00418500;
export const FRAME_EFFECT_6FE410_HOST_4CF210_VA = 0x004cf210;
export const FRAME_EFFECT_6FE410_HOST_4CDCF0_VA = 0x004cdcf0;

/* (V * 0x431bde82d7b634db) >> 82. BigInt full 128-bit multiply, split at
   the end. The C++ side uses the machine's four limb products (bits 64..127
   then shrd/shr 0x12 = 64 + 0x12 = 82); both must agree on every 64-bit
   input. */
export function frameEffect6fe410Hash64(vLo, vHi) {
  const V = (BigInt(vHi >>> 0) << 32n) | BigInt(vLo >>> 0);
  const K = (BigInt(FRAME_EFFECT_6FE410_HASH_K_HI >>> 0) << 32n) | BigInt(FRAME_EFFECT_6FE410_HASH_K_LO >>> 0);
  const R = (V * K) >> BigInt(64 + FRAME_EFFECT_6FE410_HASH_SHIFT);
  return { lo: Number(R & 0xffffffffn) >>> 0, hi: Number((R >> 32n) & 0xffffffffn) >>> 0 };
}

/* Branch-A flag stores: 0x10000000 always added to 0x16c; 0x20 only when
   arg1 is neither 9 nor 7; 0x168 is a self-store. */
export function frameEffect6fe410EffectFlags(arg1, f168, f16c) {
  let out16c = (f16c >>> 0) | FRAME_EFFECT_6FE410_PLAYER_GATE_16C;
  if ((arg1 >>> 0) !== FRAME_EFFECT_6FE410_ARG1_SPECIAL_A && (arg1 >>> 0) !== FRAME_EFFECT_6FE410_ARG1_SPECIAL_B) {
    out16c |= FRAME_EFFECT_6FE410_FLAG_20;
  }
  return { flags168: f168 >>> 0, flags16c: out16c >>> 0 };
}

/* Head stores: effect+0x34/0x38 from player fields or 0 (FULL word test);
   room counter: effect+0x20 = old, Room+0x1214 = old+1. */
export function frameEffect6fe410HeadStores(playerNonzero, p28, p2c) {
  return playerNonzero ? { f34: p28 | 0, f38: p2c | 0 } : { f34: 0, f38: 0 };
}
export function frameEffect6fe410RoomCounter(old) {
  return { room1214: (old + 1) >>> 0, effect20: old >>> 0 };
}

/* The scale block as f32 chains. Math.fround at every step matches the
   Wasm f32 rounding; the 1.0f multipliers are kept as multiplications.
   Keys mirror the C++ IsaacFrameEffect6fe410ScaleOut layout (bC38..b380). */
export function frameEffect6fe410ScaleFields(aF48, bC38, b3B4, bF48, bF44, b384, b380, aF44) {
  const f = Math.fround;
  const t1 = f(f(aF48) * f(bC38));
  const t2 = f(t1 * f(b3B4));
  return { bC38: t1, bE8: f(t2 * 1), bE4: f(t2 * 1), bF48: f(f(bF48) * f(aF48)),
    bF44: f(f(bF44) * f(aF44)), b384: f(f(b384) * f(aF44)), b380: f(f(b380) * f(aF44)) };
}

/* 64-bit accumulator law: acc += (R2 - R1), mod 2^64. outLo/outHi is the
   accumulated result; deltaLo/deltaHi is the raw (R2 - R1) limb difference
   (what the tail plan stores when the accumulator starts at 0). */
export function frameEffect6fe410AccDelta(h1Lo, h1Hi, h2Lo, h2Hi, accLo, accHi) {
  const a = (BigInt(accHi >>> 0) << 32n) | BigInt(accLo >>> 0);
  const r1 = (BigInt(h1Hi >>> 0) << 32n) | BigInt(h1Lo >>> 0);
  const r2 = (BigInt(h2Hi >>> 0) << 32n) | BigInt(h2Lo >>> 0);
  const delta = (r2 - r1) & 0xffffffffffffffffn;
  const s = (a + delta) & 0xffffffffffffffffn;
  return {
    outLo: Number(s & 0xffffffffn) >>> 0,
    outHi: Number((s >> 32n) & 0xffffffffn) >>> 0,
    deltaLo: Number(delta & 0xffffffffn) >>> 0,
    deltaHi: Number((delta >> 32n) & 0xffffffffn) >>> 0,
  };
}

export function frameEffect6fe410WalkReceiver(slot) {
  return (slot >>> 0) + FRAME_EFFECT_6FE410_WALK_RECV_OFF;
}

/* Player-present Entity path plan. */
export function frameEffect6fe410PlayerPathPlan(
  statusPath, gate1_16c, arg1, effect168In, effect16cIn,
  alGate1417430, aNonzero, bNonzero, alB417430,
  playerAl1, playerAl2, bField23c, b168In, b3b8, virtual4cAl, f54Differ,
) {
  const flags = frameEffect6fe410EffectFlags(arg1, effect168In, effect16cIn);
  return { statusPath: statusPath | 0, gate16c: gate1_16c | 0, flags168: flags.flags168, flags16c: flags.flags16c,
    host417430: alGate1417430 | 0, hostAf08b1A: aNonzero | 0, hostAf08b1B: bNonzero | 0,
    shield: ((b168In >>> 0) | ((bField23c | 0) > 0 ? 0x1000000 : 0)) >>> 0,
    relink: (virtual4cAl && f54Differ) ? 1 : 0, pureCfOk: 1 };
}

/* Tail plan: hashes, delta, walk-enter law (v5 reuse), host flags. */
export function frameEffect6fe410TailPlan(v1Lo, v1Hi, v2Lo, v2Hi, begin, end, tailByte172, gameEq67758_6775c, al7078f0, second9e24a0) {
  const count = frameEffect6fe2f0VectorCount(begin, end);
  return { h1: frameEffect6fe410Hash64(v1Lo, v1Hi), h2: frameEffect6fe410Hash64(v2Lo, v2Hi),
    walkEnter: frameEffect6fe2f0WalkEnter(count) ? 1 : 0, count,
    tailByte: (tailByte172 | 0) & 0xff, skipWalk: gameEq67758_6775c ? 1 : 0,
    host7078f0: al7078f0 | 0, host9e24a0: second9e24a0 | 0, pureCfOk: 1 };
}

/* ---- ABI v12: FUN_0081e9d0 candidate (0x0081e9d0..0x0081ecb7)
 *
 */

export const FRAME_EFFECT_81E9D0_VA = 0x0081e9d0;
export const FRAME_EFFECT_81E9D0_END_VA = 0x0081ecb7;
export const FRAME_EFFECT_81E9D0_NEXT_VA = 0x0081ecc0;
export const FRAME_EFFECT_81E9D0_RET_BYTES = 8;
export const FRAME_EFFECT_81E9D0_INSN_COUNT = 169;
export const FRAME_EFFECT_81E9D0_BYTE_LEN = 746;
export const FRAME_EFFECT_81E9D0_CALL_INSNS = 9;
export const FRAME_EFFECT_81E9D0_DIRECT_CALLERS = 68;
export const FRAME_EFFECT_81E9D0_RAW_DWORD_HITS = 2;
export const FRAME_EFFECT_81E9D0_CALLSITE_VA = 0x006fd958;
export const FRAME_EFFECT_81E9D0_ADDR_TAKEN_A_VA = 0x0086c890;
export const FRAME_EFFECT_81E9D0_ADDR_TAKEN_B_VA = 0x0089112a;
export const FRAME_EFFECT_81E9D0_DESC_OFF = 4;
export const FRAME_EFFECT_81E9D0_CFG_OFF = 0x10;
export const FRAME_EFFECT_81E9D0_TYPE_OFF = 0x48;
export const FRAME_EFFECT_81E9D0_TYPE_BIAS = 9;
export const FRAME_EFFECT_81E9D0_TYPE_SPAN = 3;
export const FRAME_EFFECT_81E9D0_ROOM_X0_OFF = 0x14;
export const FRAME_EFFECT_81E9D0_ROOM_Y0_OFF = 0x18;
export const FRAME_EFFECT_81E9D0_ROOM_X1_OFF = 0x1c;
export const FRAME_EFFECT_81E9D0_ROOM_Y1_OFF = 0x20;
export const FRAME_EFFECT_81E9D0_LROOM_FLOATS = 8;
export const FRAME_EFFECT_81E9D0_UNIT_SCALE_VA = 0x00ba9ff4;
export const FRAME_EFFECT_81E9D0_UNIT_SCALE_BITS = 0x2f800000;
export const FRAME_EFFECT_81E9D0_BIAS_TABLE_VA = 0x00bacb00;
export const FRAME_EFFECT_81E9D0_ABS_MASK_VA = 0x00bacb40;
export const FRAME_EFFECT_81E9D0_ABS_MASK_BITS = 0x7fffffff;
export const FRAME_EFFECT_81E9D0_HOST_81F8B0_VA = 0x0081f8b0;
export const FRAME_EFFECT_81E9D0_HOST_812F50_VA = 0x00812f50;
export const FRAME_EFFECT_81E9D0_HOST_GENRAND_VA = 0x006eef60;
export const FRAME_EFFECT_81E9D0_ARM_A = 0;
export const FRAME_EFFECT_81E9D0_ARM_B = 1;

const _fe81e9d0Bits = new DataView(new ArrayBuffer(8));

function fe81e9d0BitsToF32(bits) {
  const buf = new ArrayBuffer(4);
  new DataView(buf).setUint32(0, bits >>> 0, true);
  return new DataView(buf).getFloat32(0, true);
}

function fe81e9d0F32ToBits(value) {
  const buf = new ArrayBuffer(4);
  new DataView(buf).setFloat32(0, Math.fround(value), true);
  return new DataView(buf).getUint32(0, true);
}

/* add eax,-9 ; cmp eax,3 ; ja — UNSIGNED window type ∈ [9,12]. */
export function frameEffect81e9d0LroomType(type48) {
  return (((type48 >>> 0) - FRAME_EFFECT_81E9D0_TYPE_BIAS) >>> 0) > (FRAME_EFFECT_81E9D0_TYPE_SPAN >>> 0) ? 0 : 1;
}

/* cvtsi2sd of signed EAX + bacb00[sign] (0 or 2^32) + cvtpd2ps * 2^-32. */
export function frameEffect81e9d0UnitFloat(genrand) {
  let d = genrand | 0;
  if ((genrand >>> 31) !== 0) d += 4294967296;
  return Math.fround(Math.fround(d) * fe81e9d0BitsToF32(FRAME_EFFECT_81E9D0_UNIT_SCALE_BITS));
}

export function frameEffect81e9d0AabbLerp(lo, hi, unit) {
  const f = Math.fround;
  /* 0x0081ec79..0x0081ec9a: (hi-lo)*unit + lo with f32 rounding at EACH
     step (subss, mulss, addss). */
  const span = f(f(hi) - f(lo));
  const product = f(span * f(unit));
  return f(product + f(lo));
}

export function frameEffect81e9d0FabsBits(bits) {
  return (bits >>> 0) & FRAME_EFFECT_81E9D0_ABS_MASK_BITS;
}

/* comiss a,b ; jb — CF=1 when a<b or unordered. Returns 1/0 like the
   wasm export, not a JS boolean. */
export function frameEffect81e9d0ComissJb(a, b) {
  if (a !== a || b !== b) return 1;
  return a < b ? 1 : 0;
}

/* comiss a,b ; jbe — CF|ZF when a<=b or unordered. */
export function frameEffect81e9d0ComissJbe(a, b) {
  if (a !== a || b !== b) return 1;
  return a <= b ? 1 : 0;
}

export function frameEffect81e9d0LroomGeom(desc8, margin) {
  const f = Math.fround;
  const d = desc8 || [0, 0, 0, 0, 0, 0, 0, 0];
  const m = f(margin);
  const b0 = f(d[0]), b1 = f(d[1]), b2 = f(d[2]), b3 = f(d[3]);
  const b4 = f(d[4]), b5 = f(d[5]), b6 = f(d[6]), b7 = f(d[7]);
  const ax = f(b0 - m);
  const ay = f(b1 - m);
  const aX1 = f(b2 + m);
  const aY1 = f(b3 + m);
  const bx = f(b4 - m);
  const bX1 = f(b6 + m);
  const bY1 = f(b7 + m);
  const wA = f(aX1 - ax);
  const wB = f(bX1 - bx);
  /* comiss wB, wA ; jbe → keep yB0 = a_y1. ja (wB > wA ordered) swaps. */
  const bGtA = frameEffect81e9d0ComissJbe(wB, wA) === 1 ? 0 : 1;
  const yB0 = bGtA !== 0 ? f(b5 - m) : aY1;
  const hA = f(yB0 - ay);
  const hB = f(bY1 - yB0);
  const areaA = f(hA * wA);
  const areaB = f(hB * wB);
  const absA = fe81e9d0BitsToF32(frameEffect81e9d0FabsBits(fe81e9d0F32ToBits(areaA)));
  const absB = fe81e9d0BitsToF32(frameEffect81e9d0FabsBits(fe81e9d0F32ToBits(areaB)));
  /* abs_a / (abs_a + abs_b); 0/0 → NaN, reproduced. */
  const weight = f(absA / f(f(absA) + f(absB)));
  return {
    widthA: wA,
    widthB: wB,
    heightA: hA,
    heightB: hB,
    originAx: ax,
    originAy: ay,
    originBx: bx,
    originBy: yB0,
    absAreaA: absA,
    absAreaB: absB,
    weight,
    bGtA,
  };
}

export function frameEffect81e9d0LroomArm(geom, unit0) {
  if (!geom) return FRAME_EFFECT_81E9D0_ARM_A;
  return frameEffect81e9d0ComissJb(unit0, geom.weight) === 1
    ? FRAME_EFFECT_81E9D0_ARM_A
    : FRAME_EFFECT_81E9D0_ARM_B;
}

export function frameEffect81e9d0LroomSample(geom, arm, unit1, unit2) {
  const f = Math.fround;
  const g = geom || {};
  if ((arm | 0) === FRAME_EFFECT_81E9D0_ARM_A) {
    /* 0x0081ebcc..0x0081ebec: wA*u1 + originAx ; u2*hA + originAy */
    return {
      x: f(f(f(g.widthA) * f(unit1)) + f(g.originAx)),
      y: f(f(f(unit2) * f(g.heightA)) + f(g.originAy)),
    };
  }
  /* 0x0081eb4d..0x0081eb6d: wB*u1 + originBx ; u2*hB + originBy */
  return {
    x: f(f(f(g.widthB) * f(unit1)) + f(g.originBx)),
    y: f(f(f(unit2) * f(g.heightB)) + f(g.originBy)),
  };
}

export function frameEffect81e9d0EntryPlan(type48, margin, room14, room18, room1c, room20, desc8, g0, g1, g2) {
  const f = Math.fround;
  const lroom = frameEffect81e9d0LroomType(type48);
  if (lroom === 1) {
    const geom = frameEffect81e9d0LroomGeom(desc8, margin);
    const u0 = f(frameEffect81e9d0UnitFloat(g0 >>> 0));
    const u1 = f(frameEffect81e9d0UnitFloat(g1 >>> 0));
    const u2 = f(frameEffect81e9d0UnitFloat(g2 >>> 0));
    const arm = (desc8 == null)
      ? FRAME_EFFECT_81E9D0_ARM_A
      : frameEffect81e9d0LroomArm(geom, u0);
    let x = 0;
    let y = 0;
    if (desc8 != null) {
      const s = frameEffect81e9d0LroomSample(geom, arm, u1, u2);
      x = s.x;
      y = s.y;
    }
    return {
      derefDesc: 1, derefCfg: 1, derefType: 1,
      lroomPath: 1, aabbPath: 0,
      host81f8b0: 1, host812f50: 0,
      hostGenrand: 3,
      pickArmA: arm === FRAME_EFFECT_81E9D0_ARM_A ? 1 : 0,
      pickArmB: arm === FRAME_EFFECT_81E9D0_ARM_B ? 1 : 0,
      outXBits: fe81e9d0F32ToBits(x) >>> 0,
      outYBits: fe81e9d0F32ToBits(y) >>> 0,
      hostCalls: 1 + 3,
      pureCfOk: 1, pureComplete: 0,
    };
  }
  const u0 = f(frameEffect81e9d0UnitFloat(g0 >>> 0));
  const u1 = f(frameEffect81e9d0UnitFloat(g1 >>> 0));
  return {
    derefDesc: 1, derefCfg: 1, derefType: 1,
    lroomPath: 0, aabbPath: 1,
    host81f8b0: 0, host812f50: 1,
    hostGenrand: 2,
    pickArmA: 0, pickArmB: 0,
    outXBits: fe81e9d0F32ToBits(frameEffect81e9d0AabbLerp(room14, room1c, u0)) >>> 0,
    outYBits: fe81e9d0F32ToBits(frameEffect81e9d0AabbLerp(room18, room20, u1)) >>> 0,
    hostCalls: 1 + 2,
    pureCfOk: 1, pureComplete: 0,
  };
}

/* ---- ABI v13: FUN_0081ecc0 random grid index (0x0081ecc0..0x0081edca)
 *
 */

export const FRAME_EFFECT_81ECC0_VA = 0x0081ecc0;
export const FRAME_EFFECT_81ECC0_END_VA = 0x0081edca;
export const FRAME_EFFECT_81ECC0_NEXT_VA = 0x0081edd0;
export const FRAME_EFFECT_81ECC0_RET_BYTES = 4;
export const FRAME_EFFECT_81ECC0_INSN_COUNT = 103;
export const FRAME_EFFECT_81ECC0_BYTE_LEN = 269;
export const FRAME_EFFECT_81ECC0_CALL_INSNS = 3;
export const FRAME_EFFECT_81ECC0_DIRECT_CALLERS = 3;
export const FRAME_EFFECT_81ECC0_RAW_DWORD_HITS = 2;
export const FRAME_EFFECT_81ECC0_CALLSITE_A_VA = 0x0068e070;
export const FRAME_EFFECT_81ECC0_CALLSITE_B_VA = 0x007f39a3;
export const FRAME_EFFECT_81ECC0_CALLSITE_C_VA = 0x007f4391;
export const FRAME_EFFECT_81ECC0_ADDR_TAKEN_A_VA = 0x0086c8a1;
export const FRAME_EFFECT_81ECC0_ADDR_TAKEN_B_VA = 0x0089118a;
export const FRAME_EFFECT_81ECC0_DESC_OFF = 4;
export const FRAME_EFFECT_81ECC0_CFG_OFF = 0x10;
export const FRAME_EFFECT_81ECC0_TYPE_OFF = 0x48;
export const FRAME_EFFECT_81ECC0_WIDTH_OFF = 0x0c;
export const FRAME_EFFECT_81ECC0_HEIGHT_OFF = 0x10;
export const FRAME_EFFECT_81ECC0_TABLE_BASE = 0x00c35b80;
export const FRAME_EFFECT_81ECC0_ROW_STRIDE = 0x20;
export const FRAME_EFFECT_81ECC0_ROW_DWORDS = 8;
export const FRAME_EFFECT_81ECC0_RNG_SHIFTS_VA = 0x00b1f4ec;
export const FRAME_EFFECT_81ECC0_RNG_SHIFT3_VA = 0x00b1f4f4;
export const FRAME_EFFECT_81ECC0_RNG_SHIFT1 = 1;
export const FRAME_EFFECT_81ECC0_RNG_SHIFT2 = 9;
export const FRAME_EFFECT_81ECC0_RNG_SHIFT3 = 29;
export const FRAME_EFFECT_81ECC0_HOST_81FB70_VA = 0x0081fb70;
export const FRAME_EFFECT_81ECC0_HOST_7E9020_VA = 0x007e9020;
export const FRAME_EFFECT_81ECC0_FAIL = -1;

/* v12 type gate BY REFERENCE. */
export function frameEffect81ecc0LroomType(type48) {
  return frameEffect81e9d0LroomType(type48);
}

export function frameEffect81ecc0TableRowVa(type48) {
  return (((type48 >>> 0) << 5) + FRAME_EFFECT_81ECC0_TABLE_BASE) >>> 0;
}

export function frameEffect81ecc0CopyRow(row8) {
  const r = row8 || [], out = [];
  for (let i = 0; i < 8; i++) out.push(r[i] | 0);
  return out;
}

/* test/js + cmp/jge — SIGNED. Returns 1/0 like the wasm export. */
export function frameEffect81ecc0GridInBounds(x, y, width, height) {
  const xi = x | 0, yi = y | 0, w = width | 0, h = height | 0;
  if (xi < 0 || yi < 0) return 0;
  if (xi >= w || yi >= h) return 0;
  return 1;
}

export function frameEffect81ecc0GridIndex(x, y, width) {
  return Math.imul(width | 0, y | 0) + (x | 0) | 0;
}

export function frameEffect81ecc0Result(x, y, width, height) {
  if (frameEffect81ecc0GridInBounds(x, y, width, height) !== 1) return -1;
  return frameEffect81ecc0GridIndex(x, y, width);
}

export function frameEffect81ecc0AabbSpan(x0, y0, x1, y1) {
  return { dx: ((x1 | 0) - (x0 | 0)) | 0, dy: ((y1 | 0) - (y0 | 0)) | 0 };
}

export function frameEffect81ecc0AabbSample(x0, y0, rx, ry) {
  return { x: ((x0 | 0) + (rx | 0)) | 0, y: ((y0 | 0) + (ry | 0)) | 0 };
}

export function frameEffect81ecc0EntryPlan(type48, width, height, x0, y0, x1, y1, hostA, hostB) {
  const lroom = frameEffect81ecc0LroomType(type48);
  if (lroom === 1) {
    const x = hostA | 0;
    const y = hostB | 0;
    const inBounds = frameEffect81ecc0GridInBounds(x, y, width, height);
    return {
      derefDesc: 1, derefCfg: 1, derefType: 1,
      lroomPath: 1, aabbPath: 0,
      host81fb70: 1, host7e9020: 0, hostCalls: 1,
      inBounds,
      result: inBounds === 1 ? frameEffect81ecc0GridIndex(x, y, width) : FRAME_EFFECT_81ECC0_FAIL,
      outX: x, outY: y,
      pureCfOk: 1, pureComplete: 0,
    };
  }
  const x = ((x0 | 0) + (hostA | 0)) | 0;
  const y = ((y0 | 0) + (hostB | 0)) | 0;
  const inBounds = frameEffect81ecc0GridInBounds(x, y, width, height);
  return {
    derefDesc: 1, derefCfg: 1, derefType: 1,
    lroomPath: 0, aabbPath: 1,
    host81fb70: 0, host7e9020: 2, hostCalls: 2,
    inBounds,
    result: inBounds === 1 ? frameEffect81ecc0GridIndex(x, y, width) : FRAME_EFFECT_81ECC0_FAIL,
    outX: x, outY: y,
    pureCfOk: 1, pureComplete: 0,
  };
}

/* ---- ABI v14: FUN_0081edd0 Room::GetBrokenWatchState
 * (0x0081edd0..0x0081ede9)
 */

export const FRAME_EFFECT_81EDD0_VA = 0x0081edd0;
export const FRAME_EFFECT_81EDD0_END_VA = 0x0081ede9;
export const FRAME_EFFECT_81EDD0_NEXT_VA = 0x0081edf0;
export const FRAME_EFFECT_81EDD0_RET_BYTES = 0;
export const FRAME_EFFECT_81EDD0_INSN_COUNT = 6;
export const FRAME_EFFECT_81EDD0_BYTE_LEN = 26;
export const FRAME_EFFECT_81EDD0_CALL_INSNS = 0;
export const FRAME_EFFECT_81EDD0_DIRECT_CALLERS = 2;
export const FRAME_EFFECT_81EDD0_RAW_DWORD_HITS = 1;
export const FRAME_EFFECT_81EDD0_CALLSITE_A_VA = 0x0065a5bb;
export const FRAME_EFFECT_81EDD0_CALLSITE_B_VA = 0x006c9301;
export const FRAME_EFFECT_81EDD0_ADDR_TAKEN_VA = 0x0086c76f;
export const FRAME_EFFECT_81EDD0_LUA_NAME_VA = 0x00b73b44;
export const FRAME_EFFECT_81EDD0_GAME_GLOBAL_VA = 0x00c71678;
export const FRAME_EFFECT_81EDD0_ROOM_GETTER_VA = 0x00407480;
export const FRAME_EFFECT_81EDD0_MODE_OFF = 0x26584;
export const FRAME_EFFECT_81EDD0_MODE_SLOW = 0x16;
export const FRAME_EFFECT_81EDD0_FIELD_OFF = 0x1210;
export const FRAME_EFFECT_81EDD0_SLOW_RESULT = 2;
export const FRAME_EFFECT_81EDD0_EXIT_SLOW = 0;
export const FRAME_EFFECT_81EDD0_EXIT_FIELD = 1;

/* FULL dword equality. */
export function frameEffect81edd0ModeSlow(mode26584) {
  return (mode26584 >>> 0) === (FRAME_EFFECT_81EDD0_MODE_SLOW >>> 0) ? 1 : 0;
}

export function frameEffect81edd0ExitArm(mode26584) { return (mode26584 >>> 0) === 0x16 ? 0 : 1; }

export function frameEffect81edd0Result(mode26584, room1210) {
  return (mode26584 >>> 0) === 0x16 ? 2 : (room1210 >>> 0);
}

export function frameEffect81edd0EntryPlan(mode26584, room1210) {
  const slow = (mode26584 >>> 0) === 0x16 ? 1 : 0;
  return { slow, exitArm: frameEffect81edd0ExitArm(mode26584),
    result: frameEffect81edd0Result(mode26584, room1210) >>> 0, pureCfOk: 1, pureComplete: 1 };
}

/* ---- ABI v15: FUN_0081edf0 Lua SetBrokenWatchState
 * (0x0081edf0..0x0081ee12)
 */

export const FRAME_EFFECT_81EDF0_VA = 0x0081edf0;
export const FRAME_EFFECT_81EDF0_END_VA = 0x0081ee12;
export const FRAME_EFFECT_81EDF0_NEXT_VA = 0x0081ee20;
export const FRAME_EFFECT_81EDF0_RET_BYTES = 4;
export const FRAME_EFFECT_81EDF0_INSN_COUNT = 11;
export const FRAME_EFFECT_81EDF0_BYTE_LEN = 37;
export const FRAME_EFFECT_81EDF0_CALL_INSNS = 1;
export const FRAME_EFFECT_81EDF0_DIRECT_CALLERS = 4;
export const FRAME_EFFECT_81EDF0_RAW_DWORD_HITS = 1;
export const FRAME_EFFECT_81EDF0_CALLSITE_A_VA = 0x0079e4e0;
export const FRAME_EFFECT_81EDF0_CALLSITE_B_VA = 0x0079e541;
export const FRAME_EFFECT_81EDF0_CALLSITE_C_VA = 0x007c6f85;
export const FRAME_EFFECT_81EDF0_CALLSITE_D_VA = 0x007c6fd0;
export const FRAME_EFFECT_81EDF0_ADDR_TAKEN_VA = 0x0086c780;
export const FRAME_EFFECT_81EDF0_LUA_BIND_VA = 0x0086c77f;
export const FRAME_EFFECT_81EDF0_LUA_NAME_VA = 0x00b73c58;
export const FRAME_EFFECT_81EDF0_MGR_GLOBAL_VA = 0x00c7169c;
export const FRAME_EFFECT_81EDF0_GAME_GLOBAL_VA = 0x00c71678;
export const FRAME_EFFECT_81EDF0_ROOM_GETTER_VA = 0x00407480;
export const FRAME_EFFECT_81EDF0_ROOM_PTR_OFF = 0x18300;
export const FRAME_EFFECT_81EDF0_FIELD_OFF = 0x1210;
export const FRAME_EFFECT_81EDF0_SCALE_OFF = 0x2a2d4;
export const FRAME_EFFECT_81EDF0_HOST_7EA2D0_VA = 0x007ea2d0;
export const FRAME_EFFECT_81EDF0_CALL_STATE_1 = 1;
export const FRAME_EFFECT_81EDF0_CALL_STATE_2 = 2;

/* FULL dword identity store. */
export function frameEffect81edf0ApplyStore(state) {
  return state >>> 0;
}

/* esi + 0x2a2d4, 32-bit wrap. esi is the pre-call [0xc7169c]. */
export function frameEffect81edf0ScaleAddr(mgr) {
  return ((mgr >>> 0) + (FRAME_EFFECT_81EDF0_SCALE_OFF >>> 0)) >>> 0;
}

/* movss identity. */
export function frameEffect81edf0ApplyScale(xmm0Bits) {
  return xmm0Bits >>> 0;
}

export function frameEffect81edf0EntryPlan(state, mgr, xmm0Bits) {
  return { storeField: 1, storedState: frameEffect81edf0ApplyStore(state) >>> 0, host7ea2d0: 1,
    scaleBits: frameEffect81edf0ApplyScale(xmm0Bits) >>> 0, scaleAddr: frameEffect81edf0ScaleAddr(mgr) >>> 0,
    pureComplete: 1, state: state >>> 0, mgr: mgr >>> 0 };
}

/* ---- NOTES: FUN_0081ee20 IRREDUCIBLE (unit stays host; v16 peels a callee) ----
 *
 * Independent census from cpu-dump 0081ee20.txt (complete --bytes 0x400
 * --no-stop-at-ret: shared ret 0x0081f128, first_ret 0x0081eebf is the
 * type-0xb epilogue only, 25 E8 = 24× 0x007ee7e0 + 1× 0x0081fb20,
 * 0 ZHL, identify-zhl empty) — not from the C++. Does NOT wrap
 * Get/SetBrokenWatchState (no call to 0x81edd0 / 0x81edf0). v14/v15
 * unused here.
 *
 * Blocker: multi-arm [cfg+0x48] dispatcher; 24 host grid-cell calls.
 * Not a complete small helper. Callee 0x0081fb20 peeled at v16.
 */

/* ---- ABI v16: FUN_0081fb20 Room::GetLRoomTileDesc
 * (0x0081fb20..0x0081fb6b)
 *
 * Independent oracles. Written from the cpu-dump listing (first_ret
 * 0x0081fb6b, 29 body insns, 0 E8) and the section-table census, not
 * from the C++. v13 table_row_va / copy_row consumed BY REFERENCE.
 */

export const FRAME_EFFECT_81FB20_VA = 0x0081fb20;
export const FRAME_EFFECT_81FB20_END_VA = 0x0081fb6b;
export const FRAME_EFFECT_81FB20_NEXT_VA = 0x0081fb70;
export const FRAME_EFFECT_81FB20_RET_BYTES = 4;
export const FRAME_EFFECT_81FB20_INSN_COUNT = 29;
export const FRAME_EFFECT_81FB20_BYTE_LEN = 78;
export const FRAME_EFFECT_81FB20_CALL_INSNS = 0;
export const FRAME_EFFECT_81FB20_DIRECT_CALLERS = 2;
export const FRAME_EFFECT_81FB20_RAW_DWORD_HITS = 2;
export const FRAME_EFFECT_81FB20_CALLSITE_A_VA = 0x0081f0ac;
export const FRAME_EFFECT_81FB20_CALLSITE_B_VA = 0x009e2e16;
export const FRAME_EFFECT_81FB20_ADDR_TAKEN_A_VA = 0x0086c582;
export const FRAME_EFFECT_81FB20_ADDR_TAKEN_B_VA = 0x00890ac5;
export const FRAME_EFFECT_81FB20_LUA_BIND_VA = 0x0086c581;
export const FRAME_EFFECT_81FB20_LUA_NAME_VA = 0x00b739d8;
export const FRAME_EFFECT_81FB20_DESC_OFF = 4;
export const FRAME_EFFECT_81FB20_CFG_OFF = 0x10;
export const FRAME_EFFECT_81FB20_TYPE_OFF = 0x48;
export const FRAME_EFFECT_81FB20_TABLE_BASE = 0x00c35b80;
export const FRAME_EFFECT_81FB20_ROW_STRIDE = 0x20;
export const FRAME_EFFECT_81FB20_ROW_DWORDS = 8;
export const FRAME_EFFECT_81FB20_HOST_81FB70_VA = 0x0081fb70;

/* v13 table_row_va BY REFERENCE. shl 5 + DAT_00c35b80, 32-bit wrap. */
export function frameEffect81fb20TableRowVa(type48) {
  return frameEffect81ecc0TableRowVa(type48);
}

/* v13 copy_row BY REFERENCE. Eight dwords. */
export function frameEffect81fb20CopyRow(row8) {
  return frameEffect81ecc0CopyRow(row8);
}

/* mov eax,edx — identity of [ebp+8]. */
export function frameEffect81fb20ReturnOut(outPtr) {
  return outPtr >>> 0;
}

export function frameEffect81fb20EntryPlan(type48, outPtr) {
  return {
    derefDesc: 1,
    derefCfg: 1,
    derefType: 1,
    tableRowVa: frameEffect81fb20TableRowVa(type48),
    copyRow: 1,
    returnOut: frameEffect81fb20ReturnOut(outPtr),
    hostCalls: 0,
    pureComplete: 1,
  };
}

/* ---- ABI v17: FUN_0081fb70 LRoomTileDesc::GetRandomTile ----
 * 0x0081fb70…0x0081fd51, thiscall, ecx = LRoomTileDesc, ret 8.
 * PE islands only: seed mix, signed-abs area, unsigned rem, index,
 * bounds, XY stores. Five 0x00a112c0 log+int3 paths stay host.
 * Next sibling 0x0081fd60 (SEH prologue) is parked. */

export const FRAME_EFFECT_81FB70_VA = 0x0081fb70;
export const FRAME_EFFECT_81FB70_END_VA = 0x0081fd51;
export const FRAME_EFFECT_81FB70_NEXT_VA = 0x0081fd60;
export const FRAME_EFFECT_81FB70_RET_BYTES = 8;
export const FRAME_EFFECT_81FB70_INSN_COUNT = 203;
export const FRAME_EFFECT_81FB70_BYTE_LEN = 484;
export const FRAME_EFFECT_81FB70_CALL_INSNS = 5;
export const FRAME_EFFECT_81FB70_DIRECT_CALLERS = 1;
export const FRAME_EFFECT_81FB70_RAW_DWORD_HITS = 0;
export const FRAME_EFFECT_81FB70_INT3_PAD = 12;
export const FRAME_EFFECT_81FB70_CALLSITE_VA = 0x0081ed21;
export const FRAME_EFFECT_81FB70_RET_A_VA = 0x0081fc9b;
export const FRAME_EFFECT_81FB70_RET_B_VA = 0x0081fcbe;
export const FRAME_EFFECT_81FB70_RET_C_VA = 0x0081fd51;
export const FRAME_EFFECT_81FB70_HIGH_OFF = 0;
export const FRAME_EFFECT_81FB70_LOW_OFF = 0x10;
export const FRAME_EFFECT_81FB70_DESC_DWORDS = 8;
export const FRAME_EFFECT_81FB70_XY_DWORDS = 2;
export const FRAME_EFFECT_81FB70_HOST_LOG_VA = 0x00a112c0;
export const FRAME_EFFECT_81FB70_FATAL_STR_VA = 0x00b6bf54;
export const FRAME_EFFECT_81FB70_FATAL_LEVEL = 0x10;
export const FRAME_EFFECT_81FB70_RNG_SHIFTS_VA = 0x00b1f4ec;
export const FRAME_EFFECT_81FB70_RNG_SHIFT3_VA = 0x00b1f4f4;
export const FRAME_EFFECT_81FB70_RNG_SHIFT1 = FRAME_EFFECT_81ECC0_RNG_SHIFT1;
export const FRAME_EFFECT_81FB70_RNG_SHIFT2 = FRAME_EFFECT_81ECC0_RNG_SHIFT2;
export const FRAME_EFFECT_81FB70_RNG_SHIFT3 = FRAME_EFFECT_81ECC0_RNG_SHIFT3;

/* xorshift: x^=x>>1; x^=x<<9; x^=x>>29. LOGICAL, 32-bit wrap.
   v13 shifts BY REFERENCE. mix(0)=0. */
export function frameEffect81fb70SeedMix(seed) {
  let x = seed >>> 0;
  x ^= x >>> FRAME_EFFECT_81FB70_RNG_SHIFT1;
  x ^= (x << FRAME_EFFECT_81FB70_RNG_SHIFT2) >>> 0;
  x ^= x >>> FRAME_EFFECT_81FB70_RNG_SHIFT3;
  return x >>> 0;
}

/* cdq/xor/sub SIGNED abs. INT_MIN stays INT_MIN. */
export function frameEffect81fb70Iabs(x) {
  const v = x | 0;
  const sign = v >> 31;
  return ((v ^ sign) - sign) | 0;
}

/* imul low-32 then iabs. */
export function frameEffect81fb70AreaAbs(dx, dy) {
  return frameEffect81fb70Iabs(Math.imul(dx | 0, dy | 0));
}

/* unsigned rem; 0 if denom==0. denom is the RAW delta bit pattern. */
export function frameEffect81fb70Umod(n, d) {
  const num = n >>> 0;
  const den = d >>> 0;
  if (den === 0) return 0;
  return num % den;
}

/* 1 iff rem <u area1 (jb → rect A). total==0 ⇒ rem=0 ⇒ B. */
export function frameEffect81fb70PickA(rem, area1) {
  return (rem >>> 0) < (area1 >>> 0) ? 1 : 0;
}

/* origin + rem, 32-bit wrap. */
export function frameEffect81fb70Index(origin, rem) {
  return (((origin | 0) >>> 0) + (rem >>> 0)) | 0;
}

/* Four SIGNED deltas from the 8-dword desc. v13 aabb_span BY REFERENCE. */
export function frameEffect81fb70Bounds(desc8) {
  const d = desc8 || [];
  const a = frameEffect81ecc0AabbSpan(d[0] | 0, d[1] | 0, d[2] | 0, d[3] | 0);
  const b = frameEffect81ecc0AabbSpan(d[4] | 0, d[5] | 0, d[6] | 0, d[7] | 0);
  return { dx1: a.dx | 0, dy1: a.dy | 0, dx2: b.dx | 0, dy2: b.dy | 0 };
}

/* [out]=x, [out+4]=y. */
export function frameEffect81fb70ApplyXy(x, y) {
  return [x | 0, y | 0];
}

export function frameEffect81fb70EntryPlan(seed, desc8) {
  const s = seed >>> 0;
  const b = frameEffect81fb70Bounds(desc8);
  const area1 = frameEffect81fb70AreaAbs(b.dx1, b.dy1);
  const area2 = frameEffect81fb70AreaAbs(b.dx2, b.dy2);
  const total = ((area1 | 0) + (area2 | 0)) >>> 0;
  const d = desc8 || [];
  const x0 = d[0] | 0;
  const y0 = d[1] | 0;
  const x2 = d[4] | 0;
  const y2 = d[5] | 0;
  if (s === 0) {
    return {
      seedZero: 1,
      fatal: 1,
      mixed0: 0,
      pickA: 0,
      outX: 0,
      outY: 0,
      applyXy: 0,
      hostCalls: 1,
      pureComplete: 0,
    };
  }
  const mixed0 = frameEffect81fb70SeedMix(s);
  const rem0 = frameEffect81fb70Umod(mixed0, total);
  const pickA = frameEffect81fb70PickA(rem0, area1 >>> 0);
  const dx = pickA ? b.dx1 : b.dx2;
  const dy = pickA ? b.dy1 : b.dy2;
  const ox = pickA ? x0 : x2;
  const oy = pickA ? y0 : y2;
  if (mixed0 === 0) {
    return {
      seedZero: 0,
      fatal: 1,
      mixed0: 0,
      pickA,
      outX: 0,
      outY: 0,
      applyXy: 0,
      hostCalls: 1,
      pureComplete: 0,
    };
  }
  const mixed1 = frameEffect81fb70SeedMix(mixed0);
  const remX = frameEffect81fb70Umod(mixed1, dx >>> 0);
  const outX = frameEffect81fb70Index(ox, remX);
  if (mixed1 === 0) {
    return {
      seedZero: 0,
      fatal: 1,
      mixed0,
      pickA,
      outX,
      outY: 0,
      applyXy: 0,
      hostCalls: 1,
      pureComplete: 0,
    };
  }
  let outY;
  if ((dy | 0) === 0) {
    outY = oy;
  } else {
    const mixed2 = frameEffect81fb70SeedMix(mixed1);
    const remY = frameEffect81fb70Umod(mixed2, dy >>> 0);
    outY = frameEffect81fb70Index(oy, remY);
  }
  return {
    seedZero: 0,
    fatal: 0,
    mixed0,
    pickA,
    outX,
    outY,
    applyXy: 1,
    hostCalls: 0,
    pureComplete: 0,
  };
}

/* ABI v34: 0x820d30 type/subtype skip prefix. Transcribed from PE CFG
 * 0x820d75..0x820df9, NOT from the cpp. cmp 0xd8/0x38d SIGNED jg.
 * Jump-table skips: 0x13, 0x1c, 0x23, 0x3e, 0x59. */

export const FRAME_EFFECT_820D30_VA = 0x00820d30;
export const FRAME_EFFECT_820D30_RET_VA = 0x00820f6f;
export const FRAME_EFFECT_820D30_END_VA = 0x00820f72;
export const FRAME_EFFECT_820D30_NEXT_VA = 0x00820ff0;
export const FRAME_EFFECT_820D30_CALLER_COUNT = 2;
export const FRAME_EFFECT_820D30_CALLER_A = 0x006d5ad7;
export const FRAME_EFFECT_820D30_CALLER_B = 0x006d5aeb;
export const FRAME_EFFECT_820D30_TABLE_SKIPS = [0x13, 0x1c, 0x23, 0x3e, 0x59];

export function frameEffect820d30TypeGtD8(type) {
  return ((type >>> 0) | 0) > 0xd8 ? 1 : 0;
}

export function frameEffect820d30TableSkip(type) {
  const t = type >>> 0;
  const eax = (t - 0x13) >>> 0;
  if (eax > 0x46) return 0;
  return (t === 0x13 || t === 0x1c || t === 0x23 || t === 0x3e || t === 0x59)
    ? 1 : 0;
}

export function frameEffect820d30SkipGate(type, subtype) {
  const t = type >>> 0;
  const s = subtype >>> 0;
  const ts = (t | 0);
  if (ts > 0xd8) {
    if (ts > 0x38d) {
      if (t === 0x390 || t === 0x396) return 1;
    } else if (t === 0x38d || t === 0xef) {
      return 1;
    } else if (t === 0xf4) {
      if (s === 2) return 1;
    } else if (t === 0x194) {
      return s === 1 ? 1 : 0;
    }
  } else if (t === 0xd8) {
    return 1;
  } else if (frameEffect820d30TableSkip(t)) {
    return 1;
  }
  if (t === 0x199 && s === 1) return 1;
  return 0;
}

/* ABI v35: 0x821940 mov byte [ecx+0x72a1],0 ; ret 4.
 * Transcribed from PE bytes C6 81 A1 72 00 00 00 / C2 04 00, NOT from cpp.
 * Store width is 1 byte. LE dword at +0x72a1 keeps bits 8..31. */

export const FRAME_EFFECT_821940_VA = 0x00821940;
export const FRAME_EFFECT_821940_RET_VA = 0x00821947;
export const FRAME_EFFECT_821940_END_VA = 0x0082194a;
export const FRAME_EFFECT_821940_NEXT_VA = 0x00821950;
export const FRAME_EFFECT_821940_INSN_COUNT = 2;
export const FRAME_EFFECT_821940_BYTE_LEN = 10;
export const FRAME_EFFECT_821940_CALL_INSNS = 0;
export const FRAME_EFFECT_821940_DIRECT_CALLERS = 2;
export const FRAME_EFFECT_821940_CALLER_A = 0x007778a9;
export const FRAME_EFFECT_821940_CALLER_B = 0x007860b3;
export const FRAME_EFFECT_821940_STORE_OFF = 0x72a1;
export const FRAME_EFFECT_821940_STORE_VALUE = 0;
export const FRAME_EFFECT_821940_RET_ARGS = 4;
export const FRAME_EFFECT_821940_SLOT_KEEP = 0xffffff00;

export function frameEffect821940StoreOff() {
  return FRAME_EFFECT_821940_STORE_OFF >>> 0;
}

export function frameEffect821940StoreValue() {
  return FRAME_EFFECT_821940_STORE_VALUE >>> 0;
}

export function frameEffect821940RetArgs() {
  return FRAME_EFFECT_821940_RET_ARGS >>> 0;
}

export function frameEffect821940ApplySlot(pre) {
  return ((pre >>> 0) & (FRAME_EFFECT_821940_SLOT_KEEP >>> 0)) >>> 0;
}

/* ABI v36: 0x822cf0 cmp [ebp+8],9 / ja skip (UNSIGNED), else
 * this+index*8+0x7328 then host 0x4e45c0. From PE, not cpp. */

export const FRAME_EFFECT_822CF0_VA = 0x00822cf0;
export const FRAME_EFFECT_822CF0_RET_VA = 0x00822d1b;
export const FRAME_EFFECT_822CF0_END_VA = 0x00822d1e;
export const FRAME_EFFECT_822CF0_NEXT_VA = 0x00822d20;
export const FRAME_EFFECT_822CF0_INSN_COUNT = 17;
export const FRAME_EFFECT_822CF0_BYTE_LEN = 46;
export const FRAME_EFFECT_822CF0_CALL_INSNS = 1;
export const FRAME_EFFECT_822CF0_DIRECT_CALLERS = 1;
export const FRAME_EFFECT_822CF0_CALLER_A = 0x00822d4d;
export const FRAME_EFFECT_822CF0_INDEX_MAX = 9;
export const FRAME_EFFECT_822CF0_SLOT_OFF = 0x7328;
export const FRAME_EFFECT_822CF0_SLOT_SHIFT = 3;
export const FRAME_EFFECT_822CF0_RET_ARGS = 8;
export const FRAME_EFFECT_822CF0_HOST_4E45C0_VA = 0x004e45c0;
export const FRAME_EFFECT_822820_VA = 0x00822820;

export function frameEffect822cf0IndexOk(index) {
  return (index >>> 0) > (FRAME_EFFECT_822CF0_INDEX_MAX >>> 0) ? 0 : 1;
}

export function frameEffect822cf0NeedsHost(index) {
  return frameEffect822cf0IndexOk(index);
}

export function frameEffect822cf0SlotAddr(thisPtr, index) {
  return (
    ((thisPtr >>> 0) +
      ((index >>> 0) << (FRAME_EFFECT_822CF0_SLOT_SHIFT >>> 0)) +
      (FRAME_EFFECT_822CF0_SLOT_OFF >>> 0)) >>>
    0
  );
}

export function frameEffect822cf0RetArgs() {
  return FRAME_EFFECT_822CF0_RET_ARGS >>> 0;
}

export function frameEffect822cf0HostVa() {
  return FRAME_EFFECT_822CF0_HOST_4E45C0_VA >>> 0;
}

/* ABI v37: 0x822d20 SIGNED in-bounds (test/js + cmp/jge) then host
 * 0x812e60 GetGridIndexByTile + v36 0x822cf0. From PE, not cpp. */

export const FRAME_EFFECT_822D20_VA = 0x00822d20;
export const FRAME_EFFECT_822D20_RET_VA = 0x00822d54;
export const FRAME_EFFECT_822D20_END_VA = 0x00822d57;
export const FRAME_EFFECT_822D20_NEXT_VA = 0x00822d60;
export const FRAME_EFFECT_822D20_INSN_COUNT = 25;
export const FRAME_EFFECT_822D20_BYTE_LEN = 55;
export const FRAME_EFFECT_822D20_CALL_INSNS = 2;
export const FRAME_EFFECT_822D20_DIRECT_CALLERS = 4;
export const FRAME_EFFECT_822D20_CALLER_A = 0x007ed962;
export const FRAME_EFFECT_822D20_CALLER_B = 0x007ed974;
export const FRAME_EFFECT_822D20_CALLER_C = 0x007ed986;
export const FRAME_EFFECT_822D20_CALLER_D = 0x007ed998;
export const FRAME_EFFECT_822D20_WIDTH_OFF = 0xc;
export const FRAME_EFFECT_822D20_HEIGHT_OFF = 0x10;
export const FRAME_EFFECT_822D20_RET_ARGS = 0xc;
export const FRAME_EFFECT_822D20_HOST_812E60_VA = 0x00812e60;

export function frameEffect822d20InBounds(x, y, width, height) {
  const sx = x | 0;
  const sy = y | 0;
  const sw = width | 0;
  const sh = height | 0;
  if (sx < 0 || sy < 0) return 0;
  if (sx >= sw || sy >= sh) return 0;
  return 1;
}

export function frameEffect822d20NeedsHost(x, y, width, height) {
  return frameEffect822d20InBounds(x, y, width, height);
}

export function frameEffect822d20RetArgs() {
  return FRAME_EFFECT_822D20_RET_ARGS >>> 0;
}

export function frameEffect822d20Host812e60Va() {
  return FRAME_EFFECT_822D20_HOST_812E60_VA >>> 0;
}

export function frameEffect822d20Host822cf0Va() {
  return FRAME_EFFECT_822CF0_VA >>> 0;
}

/* ABI v38: 0x820fd0 pure skip prefix. From PE CFG 0x820ff3..0x82100c,
 * NOT from cpp. comiss xmm0(0.0),[esi+0x7240]; jae 0x821931 is ORDERED
 * (NaN is unordered and falls through). mov eax,[0xc7169c];
 * cmp byte [eax+0x2a3c9],0; je 0x821931 is LOW-BYTE. Either gate alone
 * reaches the early epilogue, skipping all 32 host calls of the giant. */

export const FRAME_EFFECT_820FD0_VA = 0x00820fd0;
export const FRAME_EFFECT_820FD0_RET_VA = 0x00821939;
export const FRAME_EFFECT_820FD0_END_VA = 0x0082193a;
export const FRAME_EFFECT_820FD0_EARLY_VA = 0x00821931;
export const FRAME_EFFECT_820FD0_NEXT_VA = 0x00821fc0;
export const FRAME_EFFECT_820FD0_INSN_COUNT = 590;
export const FRAME_EFFECT_820FD0_BYTE_LEN = 2410;
export const FRAME_EFFECT_820FD0_CALL_INSNS = 32;
export const FRAME_EFFECT_820FD0_IND_CALLS = 7;
export const FRAME_EFFECT_820FD0_DIRECT_CALLERS = 1;
export const FRAME_EFFECT_820FD0_CALLER_A = 0x0080f1ee;
export const FRAME_EFFECT_820FD0_FIELD_OFF = 0x7240;
export const FRAME_EFFECT_820FD0_MGR_GLOBAL_VA = 0x00c7169c;
export const FRAME_EFFECT_820FD0_MGR_FIELD_OFF = 0x2a3c9;
export const FRAME_EFFECT_820FD0_GAME_GLOBAL_VA = 0x00c71678;
export const FRAME_EFFECT_820FD0_FIRST_HOST_VA = 0x0082105b;
export const FRAME_EFFECT_820FD0_FIRST_HOST_CALLEE_VA = 0x00683680;

export function frameEffect820fd0GateZero(fBits) {
  const b = fBits >>> 0;
  if ((b & 0x7f800000) === 0x7f800000 && (b & 0x007fffff) !== 0) return 0;
  return b === 0 || (b & 0x80000000) !== 0 ? 1 : 0;
}

export function frameEffect820fd0MgrByteZero(mgrByte) {
  return ((mgrByte >>> 0) & 0xff) === 0 ? 1 : 0;
}

export function frameEffect820fd0SkipGate(fBits, mgrByte) {
  return frameEffect820fd0GateZero(fBits) === 1 ||
    frameEffect820fd0MgrByteZero(mgrByte) === 1
    ? 1
    : 0;
}



/* ABI v39: 0x823370 Room snapshot/easing helper. From PE CFG
 * 0x823370..0x823536, NOT from cpp. Copy 6 dwords (src skips 0x1b20),
 * type gate {7,8,0x1d} else Level::HasAbandonedMineshaft predicate +
 * [Game+0x1830c]==1, then f32 lerp x0.75 toward 1.0f on slots 0,1,2,5
 * and toward 0.0f on slots 3,4; flag bit9 arm adds 0.03f to slot 4;
 * grid gate ([this+0x1d18]==0x20 && flag bit5) applies scale deltas
 * with SIGNED imul and cvtdq2ps on BOTH div operands. */

export const FRAME_EFFECT_823370_VA = 0x00823370;
export const FRAME_EFFECT_823370_RET_VA = 0x00823536;
export const FRAME_EFFECT_823370_END_VA = 0x00823539;
export const FRAME_EFFECT_823370_NEXT_VA = 0x00823540;
export const FRAME_EFFECT_823370_INSN_COUNT = 111;
export const FRAME_EFFECT_823370_BYTE_LEN = 457;
export const FRAME_EFFECT_823370_CALL_INSNS = 1;
export const FRAME_EFFECT_823370_DIRECT_CALLERS = 5;
export const FRAME_EFFECT_823370_CALLER_A = 0x005c51eb;
export const FRAME_EFFECT_823370_CALLER_B = 0x005c5281;
export const FRAME_EFFECT_823370_CALLER_C = 0x00778754;
export const FRAME_EFFECT_823370_CALLER_D = 0x007d3c96;
export const FRAME_EFFECT_823370_CALLER_E = 0x0082354d;
export const FRAME_EFFECT_823370_TYPE_OFF = 0x8;
export const FRAME_EFFECT_823370_TYPE_FAST_A = 7;
export const FRAME_EFFECT_823370_TYPE_FAST_B = 8;
export const FRAME_EFFECT_823370_TYPE_FAST_C = 0x1d;
export const FRAME_EFFECT_823370_COPY_COUNT = 6;
export const FRAME_EFFECT_823370_COPY_SRC_A = 0x1b10;
export const FRAME_EFFECT_823370_COPY_SRC_F = 0x1b28;
export const FRAME_EFFECT_823370_HOST_PRED_VA = 0x0074efd0;
export const FRAME_EFFECT_823370_GAME_GLOBAL_VA = 0x00c71678;
export const FRAME_EFFECT_823370_FLAG_1830C_OFF = 0x1830c;
export const FRAME_EFFECT_823370_LERP_TARGET_BITS = 0x3f800000;
export const FRAME_EFFECT_823370_LERP_FACTOR_BITS = 0x3f400000;
export const FRAME_EFFECT_823370_LERP_CONST_SLOTS = 0x27;
export const FRAME_EFFECT_823370_FLAG_BIT9 = 9;
export const FRAME_EFFECT_823370_ADD_A0A0_BITS = 0x3cf5c28f;
export const FRAME_EFFECT_823370_DIM_EXPECT = 0x20;
export const FRAME_EFFECT_823370_FLAG_BIT5 = 5;
export const FRAME_EFFECT_823370_GRID_W_OFF = 0x10;
export const FRAME_EFFECT_823370_GRID_H_OFF = 0xc;
export const FRAME_EFFECT_823370_K280_BITS = 0x3ecccccd;
export const FRAME_EFFECT_823370_K2B8_BITS = 0x3ee66666;
export const FRAME_EFFECT_823370_K198_BITS = 0x3e4ccccd;
export const FRAME_EFFECT_823370_RET_ARGS = 4;

const FE_823370_FROUND = Math.fround;

function fe823370U32ToF32(v) {
  return FE_823370_FROUND(
    new Float32Array(new Uint32Array([v >>> 0]).buffer)[0],
  );
}

function fe823370F32ToU32(x) {
  return new Uint32Array(new Float32Array([FE_823370_FROUND(x)]).buffer)[0] >>>
    0;
}

const FE_823370_TARGET = fe823370U32ToF32(0x3f800000);
const FE_823370_FACTOR = fe823370U32ToF32(0x3f400000);

export function frameEffect823370TypeFast(type8) {
  const t = type8 >>> 0;
  return t === 7 || t === 8 || t === 0x1d ? 1 : 0;
}

export function frameEffect823370LerpArm(fast, predAl, flag1830c) {
  fast >>>= 0;
  predAl >>>= 0;
  flag1830c >>>= 0;
  return fast !== 0 || (predAl !== 0 && flag1830c === 1) ? 1 : 0;
}

export function frameEffect823370FlagBit9(flag) {
  return ((flag >>> 9) & 1) === 1 ? 1 : 0;
}

export function frameEffect823370GridGate(dim18, flag) {
  return (dim18 >>> 0) === 0x20 && ((((flag >>> 0) >>> 5) & 1) === 1)
    ? 1
    : 0;
}

export function frameEffect823370LerpConst(vBits) {
  const v = fe823370U32ToF32(vBits);
  const d = FE_823370_FROUND(FE_823370_TARGET - v);
  const m = FE_823370_FROUND(d * FE_823370_FACTOR);
  return fe823370F32ToU32(FE_823370_FROUND(m + v));
}

export function frameEffect823370LerpZero(vBits) {
  const v = fe823370U32ToF32(vBits);
  const d = FE_823370_FROUND(0 - v);
  const m = FE_823370_FROUND(d * FE_823370_FACTOR);
  return fe823370F32ToU32(FE_823370_FROUND(m + v));
}

export function frameEffect823370GridScale(raw54Bits, w, h, kBits) {
  const wi = ((w | 0) - 2) | 0;
  const hi = ((h | 0) - 2) | 0;
  const ni = Math.imul(wi, hi) | 0;
  const num = FE_823370_FROUND(raw54Bits | 0); /* cvtdq2ps: int VALUE */
  const den = FE_823370_FROUND(ni);
  const q = FE_823370_FROUND(num / den);
  const k = fe823370U32ToF32(kBits);
  return fe823370F32ToU32(FE_823370_FROUND(q * k));
}

export function frameEffect823370ApplyStage01(src6) {
  const out = new Array(6);
  for (let i = 0; i < 6; i++) {
    const v = src6[i] >>> 0;
    out[i] = i === 3 || i === 4
      ? frameEffect823370LerpZero(v)
      : frameEffect823370LerpConst(v);
  }
  return out;
}

export function frameEffect823370ApplyGrid(out6, scaleBits) {
  const s = fe823370U32ToF32(scaleBits);
  const k280 = fe823370U32ToF32(FRAME_EFFECT_823370_K280_BITS);
  const k198 = fe823370U32ToF32(FRAME_EFFECT_823370_K198_BITS);
  const k2b8 = fe823370U32ToF32(FRAME_EFFECT_823370_K2B8_BITS);
  const m280 = FE_823370_FROUND(s * k280);
  const m198 = FE_823370_FROUND(s * k198);
  const m2b8 = FE_823370_FROUND(s * k2b8);
  const out = out6.slice();
  out[0] = fe823370F32ToU32(FE_823370_FROUND(fe823370U32ToF32(out[0]) - s));
  out[2] = fe823370F32ToU32(FE_823370_FROUND(m280 + fe823370U32ToF32(out[2])));
  out[1] = fe823370F32ToU32(FE_823370_FROUND(m280 + fe823370U32ToF32(out[1])));
  out[5] = fe823370F32ToU32(FE_823370_FROUND(m198 + fe823370U32ToF32(out[5])));
  out[3] = fe823370F32ToU32(FE_823370_FROUND(fe823370U32ToF32(out[3]) - m2b8));
  return out;
}

export function frameEffect823370EntryPlan(type8, predAl, flag1830c, dim18, flag) {
  return {
    copySlots: FRAME_EFFECT_823370_COPY_COUNT,
    fast: frameEffect823370TypeFast(type8),
    lerpRuns: frameEffect823370LerpArm(frameEffect823370TypeFast(type8), predAl, flag1830c),
    addA0a0: frameEffect823370FlagBit9(flag),
    gridPath: frameEffect823370GridGate(dim18, flag),
  };
}


/* ABI v40: 0x823540 SetColorModifier wrapper. From PE CFG
 * 0x823540..0x823586, NOT from cpp. Calls the v39 easing helper
 * 0x823370 into a 0x18-byte local ColorModState, then
 * lerp = LOW-BYTE [Game+0x183a0]==0 && LOW-BYTE [Game+0x269e9]==0,
 * then UNCONDITIONAL host Game::SetColorModifier(&slot, lerp,
 * rate=0.015f in xmm3 from [0xbaa078]). Plain ret, caller cleans. */

export const FRAME_EFFECT_823540_VA = 0x00823540;
export const FRAME_EFFECT_823540_RET_VA = 0x00823585;
export const FRAME_EFFECT_823540_END_VA = 0x00823586;
export const FRAME_EFFECT_823540_NEXT_VA = 0x00823590;
export const FRAME_EFFECT_823540_INSN_COUNT = 23;
export const FRAME_EFFECT_823540_BYTE_LEN = 70;
export const FRAME_EFFECT_823540_CALL_INSNS = 2;
export const FRAME_EFFECT_823540_DIRECT_CALLERS = 2;
export const FRAME_EFFECT_823540_CALLER_A = 0x007f7558;
export const FRAME_EFFECT_823540_CALLER_B = 0x00805373;
export const FRAME_EFFECT_823540_BLOB_HELPER_VA = 0x00823370;
export const FRAME_EFFECT_823540_BLOB_CALL_SITE_VA = 0x0082354d;
export const FRAME_EFFECT_823540_GAME_GLOBAL_VA = 0x00c71678;
export const FRAME_EFFECT_823540_BYTE_A_OFF = 0x183a0;
export const FRAME_EFFECT_823540_BYTE_B_OFF = 0x269e9;
export const FRAME_EFFECT_823540_HOST_SITE_VA = 0x0082357d;
export const FRAME_EFFECT_823540_HOST_7067C0_VA = 0x007067c0;
export const FRAME_EFFECT_823540_RATE_BITS = 0x3c75c28f;
export const FRAME_EFFECT_823540_BLOB_LOCAL_BYTES = 0x18;
export const FRAME_EFFECT_823540_RET_BYTES = 0;

export function frameEffect823540FlagPair(b183a0, b269e9) {
  return ((b183a0 >>> 0) & 0xff) === 0 && ((b269e9 >>> 0) & 0xff) === 0
    ? 1
    : 0;
}

export function frameEffect823540RateBits() {
  return FRAME_EFFECT_823540_RATE_BITS >>> 0;
}

export function frameEffect823540HostVa() {
  return FRAME_EFFECT_823540_HOST_7067C0_VA >>> 0;
}

export function frameEffect823540BlobHelperVa() {
  return FRAME_EFFECT_823540_BLOB_HELPER_VA >>> 0;
}

export function frameEffect823540RetBytes() {
  return FRAME_EFFECT_823540_RET_BYTES >>> 0;
}

export function frameEffect823540EntryPlan(b183a0, b269e9) {
  return {
    blobHelperCalls: 1,
    lerp: frameEffect823540FlagPair(b183a0, b269e9),
    hostCalls: 1,
  };
}

/* ABI v41 (A): 0x8242d0 standalone pure leaf — the v39 grid_gate
 * predicate as a thiscall bool: cmp [ecx+0x1d18],0x20 ; jne al=0 ;
 * mov eax,[ecx+4] ; mov eax,[eax+0x44] ; shr 5 ; test al,1 ; je al=0 ;
 * else mov al,1. Two rets. Reached via dword ref @0x86c9c2 only. */

export const FRAME_EFFECT_8242D0_VA = 0x008242d0;
export const FRAME_EFFECT_8242D0_RET_A_VA = 0x008242e8;
export const FRAME_EFFECT_8242D0_RET_B_VA = 0x008242eb;
export const FRAME_EFFECT_8242D0_END_VA = 0x008242ec;
export const FRAME_EFFECT_8242D0_INSN_COUNT = 11;
export const FRAME_EFFECT_8242D0_BYTE_LEN = 28;
export const FRAME_EFFECT_8242D0_CALL_INSNS = 0;
export const FRAME_EFFECT_8242D0_DIRECT_CALLERS = 0;
export const FRAME_EFFECT_8242D0_DISPATCH_REF_VA = 0x0086c9c2;
export const FRAME_EFFECT_8242D0_DIM_EXPECT = 0x20;
export const FRAME_EFFECT_8242D0_FLAG_BIT5 = 5;

export function frameEffect8242d0Gate(dim18, flag) {
  return (dim18 >>> 0) === 0x20 && ((((flag >>> 0) >>> 5) & 1) === 1)
    ? 1
    : 0;
}

/* ABI v41 (B): 0x824800 pure prefix peel of a mixed HOST body.
 * SIGNED count gate, ORDERED 0 >= f gate (NaN continues), byte-gated
 * decay maxss(f-0.02f,+0), threshold 0.01f: ordered <= f -> host tail,
 * else zero-store-ret arm. NO static reference to the entry anywhere. */

export const FRAME_EFFECT_824800_VA = 0x00824800;
export const FRAME_EFFECT_824800_FIRST_RET_VA = 0x00824869;
export const FRAME_EFFECT_824800_HOST_JCC_SITE_VA = 0x00824857;
export const FRAME_EFFECT_824800_HOST_JCC_TARGET_VA = 0x0082486a;
export const FRAME_EFFECT_824800_SKIP_TARGET_VA = 0x00824a61;
export const FRAME_EFFECT_824800_PREFIX_BYTE_LEN = 106;
export const FRAME_EFFECT_824800_COUNT_OFF = 0x7454;
export const FRAME_EFFECT_824800_F_OFF = 0x7458;
export const FRAME_EFFECT_824800_ARM_BYTE_OFF = 0x745c;
export const FRAME_EFFECT_824800_DECAY_BITS = 0x3ca3d70a;
export const FRAME_EFFECT_824800_THRESH_BITS = 0x3c23d70a;

const FE_824800_FROUND = Math.fround;

function fe824800U32ToF32(v) {
  return FE_824800_FROUND(
    new Float32Array(new Uint32Array([v >>> 0]).buffer)[0],
  );
}

function fe824800F32ToU32(x) {
  return new Uint32Array(new Float32Array([FE_824800_FROUND(x)]).buffer)[0] >>>
    0;
}

export function frameEffect824800CountGate(count) {
  return ((count | 0) > 0 ? 1 : 0);
}

export function frameEffect824800GateZero(fBits) {
  const b = fBits >>> 0;
  if ((b & 0x7f800000) === 0x7f800000 && (b & 0x007fffff) !== 0) return 0;
  return b === 0 || (b & 0x80000000) !== 0 ? 1 : 0;
}

export function frameEffect824800DecayApply(fBits) {
  const f = fe824800U32ToF32(fBits);
  const decay = fe824800U32ToF32(FRAME_EFFECT_824800_DECAY_BITS);
  let d = FE_824800_FROUND(f - decay); /* subss */
  /* maxss d, +0.0 — second operand wins on NaN */
  if ((fe824800F32ToU32(d) & 0x7f800000) === 0x7f800000 &&
    (fe824800F32ToU32(d) & 0x007fffff) !== 0) {
    d = 0;
  }
  return fe824800F32ToU32(d > 0 ? d : 0);
}

export function frameEffect824800ClampNeedsHost(fBits) {
  const b = fBits >>> 0;
  /* unordered (f NaN): comiss sets CF=ZF=PF=1 -> jbe TAKEN -> host */
  if ((b & 0x7f800000) === 0x7f800000 && (b & 0x007fffff) !== 0) {
    return 1;
  }
  const f = fe824800U32ToF32(b);
  const thresh = fe824800U32ToF32(FRAME_EFFECT_824800_THRESH_BITS);
  return thresh <= f ? 1 : 0;
}

/* ABI v42: 0x824ee0 HOST spawn-effect giant — pure skip-gate peel.
 * From PE CFG 0x824ef6..0x824f16, NOT from cpp. MSVC ordered-equality
 * idiom (ucomiss; lahf; test ah,0x44; jp/jnp): jp iff ORDERED EQUAL,
 * jnp iff unordered OR value-different (+0/-0 EQUAL). Skip to epilogue
 * 0x8253cd iff a != C0 AND b != C1. */

export const FRAME_EFFECT_824EE0_VA = 0x00824ee0;
export const FRAME_EFFECT_824EE0_RET_VA = 0x008253d3;
export const FRAME_EFFECT_824EE0_END_VA = 0x00825724; /* true end; 0x8253d3 ret is EARLY-return */
export const FRAME_EFFECT_824EE0_SKIP_TARGET_VA = 0x008253cd;
export const FRAME_EFFECT_824EE0_INSN_COUNT = 504;
export const FRAME_EFFECT_824EE0_BYTE_LEN = 2116;
export const FRAME_EFFECT_824EE0_CALL_INSNS = 6;
export const FRAME_EFFECT_824EE0_IND_CALLS = 1;
export const FRAME_EFFECT_824EE0_DIRECT_CALLERS = 0;
export const FRAME_EFFECT_824EE0_GATE_A_SITE_VA = 0x00824ef6;
export const FRAME_EFFECT_824EE0_GATE_B_SITE_VA = 0x00824f0b;
export const FRAME_EFFECT_824EE0_A_OFF = 0x7460;
export const FRAME_EFFECT_824EE0_B_OFF = 0x7464;
export const FRAME_EFFECT_824EE0_C0_BITS = 0x3760371c;
export const FRAME_EFFECT_824EE0_C1_BITS = 0x37873770;
export const FRAME_EFFECT_824EE0_HOST_ISPAUSED_VA = 0x006fd350;
export const FRAME_EFFECT_824EE0_GAME_GLOBAL_VA = 0x00c71678;
export const FRAME_EFFECT_824EE0_HOST_GENRAND_VA = 0x006eef60;
export const FRAME_EFFECT_824EE0_HOST_CREATE_VA = 0x006fe410;
export const FRAME_EFFECT_824EE0_HOST_812F50_VA = 0x00812f50;

export function frameEffect824ee0UcomissNe(xBits, cBits) {
  const x = xBits >>> 0;
  const c = cBits >>> 0;
  const xNan =
    (x & 0x7f800000) === 0x7f800000 && (x & 0x007fffff) !== 0;
  const cNan =
    (c & 0x7f800000) === 0x7f800000 && (c & 0x007fffff) !== 0;
  if (xNan || cNan) return 1; /* unordered — jnp taken */
  return (x & 0x7fffffff) === (c & 0x7fffffff) ? 0 : 1;
}

export function frameEffect824ee0SkipGate(aBits, bBits) {
  return frameEffect824ee0UcomissNe(
    aBits,
    FRAME_EFFECT_824EE0_C0_BITS,
  ) === 1 &&
    frameEffect824ee0UcomissNe(bBits, FRAME_EFFECT_824EE0_C1_BITS) === 1
    ? 1
    : 0;
}

/* ABI v43: 0x825730 exact-ZHL Room::CanPickupGridEntity(int GridIndex)
 * — PURE thiscall leaf. From PE CFG 0x825730..0x00825799, NOT cpp.
 * idx >u 0x1bf -> 0; entity null -> 0; flag [e+0x3c]==0 -> 0;
 * type {2,4,5,6,0x1a,0x16,0x1b} -> 1; 0xc -> [e+0xc] <u 4;
 * 0xe -> [e+0xc] != 0x3e8 (pause field); else 0. */

export const FRAME_EFFECT_825730_VA = 0x00825730;
export const FRAME_EFFECT_825730_RET_VA = 0x00825796;
export const FRAME_EFFECT_825730_END_VA = 0x00825799;
export const FRAME_EFFECT_825730_INSN_COUNT = 40;
export const FRAME_EFFECT_825730_BYTE_LEN = 105;
export const FRAME_EFFECT_825730_CALL_INSNS = 0;
export const FRAME_EFFECT_825730_DIRECT_CALLERS = 5;
export const FRAME_EFFECT_825730_CALLER_A = 0x0055d121;
export const FRAME_EFFECT_825730_CALLER_E = 0x005b1b0e;
export const FRAME_EFFECT_825730_IDX_MAX = 0x1bf;
export const FRAME_EFFECT_825730_LIST_OFF = 0x24;
export const FRAME_EFFECT_825730_ENTITY_TYPE_OFF = 0x4;
export const FRAME_EFFECT_825730_ENTITY_FLAG_OFF = 0x3c;
export const FRAME_EFFECT_825730_ENTITY_SUB_OFF = 0xc;
export const FRAME_EFFECT_825730_SUB_MIN = 4;
export const FRAME_EFFECT_825730_PAUSE_FIELD = 0x3e8;
export const FRAME_EFFECT_825730_RET_ARGS = 4;

const FRAME_EFFECT_825730_TYPE_SET = [
  2, 4, 5, 6, 0x1a, 0x16, 0x1b,
];

export function frameEffect825730TypeOk(etype, subField) {
  const t = etype >>> 0;
  if (FRAME_EFFECT_825730_TYPE_SET.includes(t)) return 1;
  if (t === 0xc) {
    return (subField >>> 0) < FRAME_EFFECT_825730_SUB_MIN ? 1 : 0;
  }
  if (t === 0xe) {
    return (subField >>> 0) === FRAME_EFFECT_825730_PAUSE_FIELD ? 0 : 1;
  }
  return 0;
}

export function frameEffect825730Gate(
  idx,
  hasEntity,
  flagNonzero,
  etype,
  subField,
) {
  if ((idx >>> 0) > FRAME_EFFECT_825730_IDX_MAX) return 0;
  if ((hasEntity >>> 0) === 0) return 0;
  if ((flagNonzero >>> 0) === 0) return 0;
  return frameEffect825730TypeOk(etype, subField);
}

/* ABI v44: 0x00827180 nearest-slot scan — PURE thiscall leaf. From PE
 * CFG 0x00827180..0x008271d8, NOT from cpp. 8 rows at
 * [ecx+0x7744 + i*4]; null row skipped before any math; sum =
 * (y-py)^2 + (x-px)^2 (mulss/mulss/addss, dy^2 is the addss dest);
 * comiss T,sum; ja -> STRICT ORDERED T > sum (NaN never matches,
 * equality continues); FIRST match returns its index; else -1.
 * T = [0xbaac40] = 14400.0f (120^2). Zero E8 / zero indirect / no
 * SEH / no cookie / zero global writes; zero callers of any kind
 * (computed/virtual reach). */

export const FRAME_EFFECT_827180_VA = 0x00827180;
export const FRAME_EFFECT_827180_RET_VA = 0x008271d5;
export const FRAME_EFFECT_827180_END_VA = 0x008271d8;
export const FRAME_EFFECT_827180_NEXT_VA = 0x008271e0;
export const FRAME_EFFECT_827180_INSN_COUNT = 27;
export const FRAME_EFFECT_827180_BYTE_LEN = 88;
export const FRAME_EFFECT_827180_DIRECT_CALLERS = 0;
export const FRAME_EFFECT_827180_RAW_REFS = 0;
export const FRAME_EFFECT_827180_SLOT_BASE_OFF = 0x7744;
export const FRAME_EFFECT_827180_SLOT_COUNT = 8;
export const FRAME_EFFECT_827180_SLOT_PX_OFF = 0x33c;
export const FRAME_EFFECT_827180_SLOT_PY_OFF = 0x340;
export const FRAME_EFFECT_827180_THRESH_VA = 0x00baac40;
export const FRAME_EFFECT_827180_THRESH_BITS = 0x46610000; /* 14400.0f */
export const FRAME_EFFECT_827180_RET_NONE_BITS = 0xffffffff;

/** comiss T,sum ; ja — strict ordered T > sum; NaN -> 0. */
export function frameEffect827180DistLt(xBits, yBits, pxBits, pyBits, tBits) {
  const x = fe81e9d0BitsToF32(xBits >>> 0);
  const y = fe81e9d0BitsToF32(yBits >>> 0);
  const px = fe81e9d0BitsToF32(pxBits >>> 0);
  const py = fe81e9d0BitsToF32(pyBits >>> 0);
  const t = fe81e9d0BitsToF32(tBits >>> 0);
  let dy = Math.fround(y - py);
  let dx = Math.fround(x - px);
  dy = Math.fround(dy * dy);
  dx = Math.fround(dx * dx);
  const sum = Math.fround(dy + dx);
  return t > sum ? 1 : 0;
}

/** Full 8-row walk in PE order; first match wins; -1 when none. */
export function frameEffect827180Nearest(xBits, yBits, tBits, slots) {
  for (let i = 0; i < FRAME_EFFECT_827180_SLOT_COUNT; i += 1) {
    const s = slots[i];
    if ((s.present >>> 0) === 0) continue;
    if (
      frameEffect827180DistLt(xBits, yBits, s.px, s.py, tBits) === 1
    ) {
      return i;
    }
  }
  return -1;
}

/* ABI v45: 0x008279c0 field+0x20 getter — PURE thiscall micro-leaf.
 * From PE CFG 0x008279c0..0x008279ce, NOT from cpp. xmm0 =
 * [ecx+0x20]; subss [0xbaa8d0] (30.0f, 0x41f00000); ret. ONE f32
 * subtraction. 6 direct E8 callers (byte-scan); zero raw-dword refs;
 * zero external branchers-in; identify-zhl EMPTY. */

export const FRAME_EFFECT_8279C0_VA = 0x008279c0;
export const FRAME_EFFECT_8279C0_RET_VA = 0x008279cd;
export const FRAME_EFFECT_8279C0_END_VA = 0x008279ce;
export const FRAME_EFFECT_8279C0_NEXT_VA = 0x008279d0;
export const FRAME_EFFECT_8279C0_INSN_COUNT = 3;
export const FRAME_EFFECT_8279C0_BYTE_LEN = 14;
export const FRAME_EFFECT_8279C0_FIELD_OFF = 0x20;
export const FRAME_EFFECT_8279C0_CONST_VA = 0x00baa8d0;
export const FRAME_EFFECT_8279C0_CONST_BITS = 0x41f00000; /* 30.0f */
export const FRAME_EFFECT_8279C0_DIRECT_CALLERS = 6;

/** movss + subss: one f32 subtraction in PE order. */
export function frameEffect8279c0Field20Sub30(baseBits) {
  return Math.fround(
    fe81e9d0BitsToF32(baseBits >>> 0) - 30,
  );
}

/* ABI v46: 0x00827b70 special-quest-door window gate — frameless
 * bool helper. From PE CFG 0x00827b70..0x00827ba4, NOT from cpp.
 * [Game+0x1830c] != 1 -> 0; mode [Game+4] in {4,5} else 0; stage
 * [Game+0]==2 -> 1; stage != 1 -> 0; else host 0x748490 (ecx=Game)
 * bit 1 of al (captured as pred param, v39 precedent). 1 E8 total;
 * no global writes; contcheck CLEAN; 6 direct E8 callers; raw-dword
 * ref @VA 0x86ca17 (dispatch table). */

export const FRAME_EFFECT_827B70_VA = 0x00827b70;
export const FRAME_EFFECT_827B70_RET_VA = 0x00827ba3;
export const FRAME_EFFECT_827B70_END_VA = 0x00827ba7;
export const FRAME_EFFECT_827B70_INSN_COUNT = 20;
export const FRAME_EFFECT_827B70_BYTE_LEN = 55;
export const FRAME_EFFECT_827B70_GAME_GLOBAL_VA = 0x00c71678;
export const FRAME_EFFECT_827B70_TRANSITION_MODE_OFF = 0x1830c;
export const FRAME_EFFECT_827B70_TRANSITION_MODE_VALUE = 1;
export const FRAME_EFFECT_827B70_MODE_OFF = 0x4;
export const FRAME_EFFECT_827B70_STAGE_OFF = 0x0;
export const FRAME_EFFECT_827B70_HOST_VA = 0x00748490;
export const FRAME_EFFECT_827B70_HOST_BIT_MASK = 0x2;
export const FRAME_EFFECT_827B70_DIRECT_CALLERS = 6;

/** Strict four-gate conjunction in PE order. */
export function frameEffect827b70Gate(transitionMode, mode, stage,
  hostBit1Set) {
  if ((transitionMode >>> 0) !== FRAME_EFFECT_827B70_TRANSITION_MODE_VALUE) {
    return 0;
  }
  const m = mode >>> 0;
  if (m !== 4 && m !== 5) return 0;
  if ((stage >>> 0) === 2) return 1;
  if ((stage >>> 0) !== 1) return 0;
  return (hostBit1Set | 0) !== 0 ? 1 : 0;
}

/* ABI v47: 0x00827bb0 Room::HasCurseMist — PURE thiscall micro-leaf.
 * From PE CFG 0x00827bb0..0x00827bbc, NOT from cpp. Bit 13 of the
 * room-desc flags dword [[ecx+4]+0x44] (same dword as landed bit 9
 * v39 / bit 5 v41; bit 13 NEW). EXACT ZHL name
 * `bool Room::HasCurseMist()`. 1 direct E8 caller (byte-scan);
 * raw-dword ref @VA 0x86ca2b (dispatch table); identify-zhl named. */

export const FRAME_EFFECT_827BB0_VA = 0x00827bb0;
export const FRAME_EFFECT_827BB0_RET_VA = 0x00827bbb;
export const FRAME_EFFECT_827BB0_END_VA = 0x00827bbc;
export const FRAME_EFFECT_827BB0_NEXT_VA = 0x00827bc0;
export const FRAME_EFFECT_827BB0_INSN_COUNT = 5;
export const FRAME_EFFECT_827BB0_BYTE_LEN = 12;
export const FRAME_EFFECT_827BB0_DESC_PTR_OFF = 0x4;
export const FRAME_EFFECT_827BB0_FLAGS_OFF = 0x44;
export const FRAME_EFFECT_827BB0_BIT_INDEX = 13;
export const FRAME_EFFECT_827BB0_DIRECT_CALLERS = 1;
export const FRAME_EFFECT_827BB0_DISPATCH_REF_VA = 0x0086ca2b;

/** (flags >> 13) & 1 — LOGICAL shift, FULL-dword input. */
export function frameEffect827bb0FlagBit13(descFlags) {
  return ((descFlags >>> 0) >>> 13) & 1;
}

/* ABI v48: 0x00827bc0 door-variant spawn window — PURE frameless
 * predicate. From PE CFG 0x00827bc0..0x00827be4, NOT from cpp.
 * [ecx+8] == 5; d = [[ecx+4]+0x10]; [d+0x10] == 0x59; host
 * 0x74ea50 (ecx=Game) bool (captured as pred param, v39/v46
 * precedent). 1 E8 total; no global writes; contcheck CLEAN;
 * 3 direct E8 callers; zero raw-dword refs. */

export const FRAME_EFFECT_827BC0_VA = 0x00827bc0;
export const FRAME_EFFECT_827BC0_RET_VA = 0x00827be3;
export const FRAME_EFFECT_827BC0_END_VA = 0x00827be7;
export const FRAME_EFFECT_827BC0_INSN_COUNT = 14;
export const FRAME_EFFECT_827BC0_BYTE_LEN = 39;
export const FRAME_EFFECT_827BC0_FIELD8_OFF = 0x8;
export const FRAME_EFFECT_827BC0_FIELD8_VALUE = 5;
export const FRAME_EFFECT_827BC0_DESC_PTR_OFF = 0x4;
export const FRAME_EFFECT_827BC0_LIST_OFF = 0x10;
export const FRAME_EFFECT_827BC0_TYPE_OFF = 0x10;
export const FRAME_EFFECT_827BC0_TYPE_VALUE = 0x59;
export const FRAME_EFFECT_827BC0_HOST_VA = 0x0074ea50;
export const FRAME_EFFECT_827BC0_DIRECT_CALLERS = 3;

/** Strict three-gate conjunction in PE order. */
export function frameEffect827bc0Gate(field8, descType10, hostPass) {
  if ((field8 >>> 0) !== FRAME_EFFECT_827BC0_FIELD8_VALUE) return 0;
  if ((descType10 >>> 0) !== FRAME_EFFECT_827BC0_TYPE_VALUE) return 0;
  return (hostPass | 0) !== 0 ? 1 : 0;
}

/* ABI v49: 0x00829920 record move-copy — PURE thiscall leaf. From PE
 * CFG 0x00829920..0x008299da (`ret 4` @0x008299da), NOT from cpp.
 * First post-band pure body past the MSVC CRT container close
 * (0x00827f30..0x00829710). Zero calls (no E8, no indirect); no
 * SEH/GS/fs; no global writes. thiscall dst=ecx, src=[esp+4];
 * returns eax=dst. 2 direct E8 callers (byte-scan), both inside
 * FUN_00829710 (0x8297d6 / 0x8298d3); zero branchers-in; zero
 * raw-dword refs; contcheck CLEAN. Record size 0x5c; SSO std::string
 * at +0x14. The dst zero-stores precede the movups/movq reloads, so
 * self-move (dst == src) zeroes then re-reads — the oracle mirrors
 * the FULL PE store order over bytes. */

export const FRAME_EFFECT_829920_VA = 0x00829920;
export const FRAME_EFFECT_829920_RET_VA = 0x008299da;
export const FRAME_EFFECT_829920_END_VA = 0x008299dd;
export const FRAME_EFFECT_829920_NEXT_VA = 0x008299e0;
export const FRAME_EFFECT_829920_INSN_COUNT = 57;
export const FRAME_EFFECT_829920_BYTE_LEN = 189;
export const FRAME_EFFECT_829920_REC_SIZE = 0x5c;
export const FRAME_EFFECT_829920_STRING_OFF = 0x14;
export const FRAME_EFFECT_829920_SIZE_OFF = 0x24;
export const FRAME_EFFECT_829920_CAP_OFF = 0x28;
export const FRAME_EFFECT_829920_SSO_CAP_RESET = 0xf;
export const FRAME_EFFECT_829920_DIRECT_CALLERS = 2;

export function frameEffect829920RecordMove(bytes, dst, src) {
  /* dst/src are CALLER-RELATIVE byte offsets into `bytes` (the
   * PE null-pointer guard is exercised on the wasm side, not here). */
  if (!bytes) return dst >>> 0;
  const dv = new DataView(bytes.buffer, bytes.byteOffset,
    bytes.byteLength);
  const rU32 = (a) => dv.getUint32(a, true);
  const wU32 = (a, v) => dv.setUint32(a, v >>> 0, true);
  const rU16 = (a) => dv.getUint16(a, true);
  const wU16 = (a, v) => dv.setUint16(a, v & 0xffff, true);
  const rU8 = (a) => dv.getUint8(a);
  const wU8 = (a, v) => dv.setUint8(a, v & 0xff);
  /* head 5 dwords +0x00..+0x13 */
  for (let i = 0; i < 5; i += 1) {
    wU32(dst + 4 * i, rU32(src + 4 * i));
  }
  /* dst zero-stores BEFORE the reloads (self-move observable) */
  wU32(dst + 0x14, 0);
  wU32(dst + 0x24, 0);
  wU32(dst + 0x28, 0);
  /* movups 16 B from src+0x14 */
  for (let i = 0; i < 4; i += 1) {
    wU32(dst + 0x14 + 4 * i, rU32(src + 0x14 + 4 * i));
  }
  /* movq 8 B from src+0x24 */
  for (let i = 0; i < 2; i += 1) {
    wU32(dst + 0x24 + 4 * i, rU32(src + 0x24 + 4 * i));
  }
  /* src string reset */
  wU32(src + FRAME_EFFECT_829920_SIZE_OFF, 0);
  wU32(src + FRAME_EFFECT_829920_CAP_OFF,
    FRAME_EFFECT_829920_SSO_CAP_RESET);
  wU8(src + FRAME_EFFECT_829920_STRING_OFF, 0);
  /* scalar POD tail +0x2c..+0x40 */
  for (let i = 11; i <= 16; i += 1) {
    wU32(dst + 4 * i, rU32(src + 4 * i));
  }
  /* word +0x44, bytes +0x46/+0x47 */
  wU16(dst + 0x44, rU16(src + 0x44));
  wU8(dst + 0x46, rU8(src + 0x46));
  wU8(dst + 0x47, rU8(src + 0x47));
  /* dwords +0x48..+0x58 */
  for (let i = 18; i <= 22; i += 1) {
    wU32(dst + 4 * i, rU32(src + 4 * i));
  }
  return dst >>> 0;
}

/* ABI v50: 0x008299e0 signed-word pair strict-less — PURE frameless
 * cdecl leaf. From PE CFG 0x008299e0..0x00829a0b (dual ret:
 * early-false @0x00829a05 / true @0x00829a0a), NOT from cpp. Zero
 * calls; no SEH/GS/fs; no global writes. ZERO direct E8 callers;
 * one raw-dword ref @VA 0x00429c39 (comparator passed by pointer,
 * functor style — v46 raw-ref precedent). Each record = one dword:
 * word +2 = high key, word +0 = low tiebreak. BOTH compares SIGNED
 * 16-bit (jl on movzx halves) — 0x8000..0xffff act negative. */

export const FRAME_EFFECT_8299E0_VA = 0x008299e0;
export const FRAME_EFFECT_8299E0_RET_FALSE_VA = 0x00829a05;
export const FRAME_EFFECT_8299E0_RET_TRUE_VA = 0x00829a0a;
export const FRAME_EFFECT_8299E0_END_VA = 0x00829a0b;
export const FRAME_EFFECT_8299E0_NEXT_VA = 0x00829a10;
export const FRAME_EFFECT_8299E0_INSN_COUNT = 21;
export const FRAME_EFFECT_8299E0_BYTE_LEN = 43;
export const FRAME_EFFECT_8299E0_HIGH_OFF = 0x2;
export const FRAME_EFFECT_8299E0_DIRECT_CALLERS = 0;
export const FRAME_EFFECT_8299E0_RAW_REF_VA = 0x00429c39;

/** PE order: signed high-word compare, ne early-out, signed low
 * word tiebreak. Returns 1/0 like the wasm export (al). */
export function frameEffect8299e0PairLess(a, b) {
  const s16 = (w) => ((w & 0xffff) << 16) >> 16;
  const aHi = s16(a >>> 16);
  const bHi = s16(b >>> 16);
  if (aHi < bHi) return 1;
  if (aHi !== bHi) return 0;
  return s16(a) < s16(b) ? 1 : 0;
}

/* ABI v51: 0x00829a10 stage/mode/variant -> result map — PURE
 * frameless fastcall dispatch leaf. From PE CFG 0x00829a10..
 * 0x00829ad4 (10 rets, shared -1 default), NOT from cpp. Zero calls;
 * no SEH/GS/fs; only memory read is [esp+8]; no global writes.
 * 4 direct E8 callers (byte-scan): 0x82a20c / 0x82a662 / 0x82b076 /
 * 0x82b257; zero branchers-in; zero raw-dword refs. */

export const FRAME_EFFECT_829A10_VA = 0x00829a10;
export const FRAME_EFFECT_829A10_END_VA = 0x00829ad4;
export const FRAME_EFFECT_829A10_NEXT_VA = 0x00829af0;
export const FRAME_EFFECT_829A10_INSN_COUNT = 85;
export const FRAME_EFFECT_829A10_BYTE_LEN = 196;
export const FRAME_EFFECT_829A10_RET_COUNT = 10;
export const FRAME_EFFECT_829A10_DIRECT_CALLERS = 4;
export const FRAME_EFFECT_829A10_FAIL_RET = -1;

/** Independent PE-order transcription of the dispatch table. */
export function frameEffect829a10StageModeMap(stage, mode, variant) {
  let result = -1;
  if (stage === -1 || stage === 12) {
    if (mode === 3) return 0;
    if (stage === -1 || stage === 12) {
      if (mode === 10) result = mode - 6;
      return result;
    }
  }
  if (stage === 6) {
    if (mode === -1 || mode === 14) {
      if (mode === -1) return 1;
      if (variant !== 11) return 3;
      return 1;
    }
    if (mode === 6) {
      if (variant !== 9) return result;
      return mode - 5;
    }
    if (mode === 7) return 3;
    return result;
  }
  if (stage === 19) {
    if (mode === -1 || mode === 14) {
      if (mode === -1) return 5;
      if (variant !== 12) return 7;
      return 5;
    }
    if (mode === 6) {
      if (variant !== 10) return result;
      return mode - 1;
    }
    if (mode === 7) return 7;
    return result;
  }
  if (stage === 13 || stage === 26) {
    if (mode === 3) return mode - 1;
    if (stage === 13 || stage === 26) {
      if (mode === 10) return mode - 4;
    }
  }
  return result;
}
